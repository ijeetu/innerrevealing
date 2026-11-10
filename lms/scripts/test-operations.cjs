const test=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const allowed=process.env.IR_TEST_ALLOW_FIXTURES==='1';
test('isolated original staff operations: atomic coupons, real ledgers, refunds, private evidence and staff teams',{skip:!allowed,timeout:240000},async()=>{
 for(const key of ['IR_TEST_BASE_URL','IR_TEST_EXPECT_DB','IR_TEST_ADMIN_EMAIL','IR_TEST_ADMIN_PASSWORD'])assert.ok(process.env[key],`${key} required`);
 assert.match(process.env.IR_TEST_EXPECT_DB,/test/i);
 const base=new URL(process.env.IR_TEST_BASE_URL).origin,origin=process.env.IR_TEST_ORIGIN||base,tag=randomUUID().replace(/-/g,''),password=`Operations-${tag}!`;
 function client(){let cookie='';return {async send(path,method='GET',body){const form=body instanceof FormData;const response=await fetch(`${base}/api/${path}`,{method,redirect:'error',signal:AbortSignal.timeout(20000),headers:{Accept:'application/json',...(cookie?{cookie}:{}),...(method!=='GET'?{origin,...(!form?{'content-type':'application/json'}:{})}:{})},...(body!==undefined?{body:form?body:JSON.stringify(body)}:{})});const set=response.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return {status:response.status,...(response.headers.get('content-type')?.includes('application/json')?{result:await response.json()}:{bytes:Buffer.from(await response.arrayBuffer())})};},async ok(path,method='GET',body){const result=await this.send(path,method,body);assert.ok(result.status>=200&&result.status<300,`${method} ${path}: ${result.status} ${result.result?.message||''}`);assert.equal(result.result.error,false);return result.result.data;}};}
 const admin=client(),one=client(),two=client(),three=client(),staff=client(),guest=client();
 await admin.ok('auth/login','POST',{email:process.env.IR_TEST_ADMIN_EMAIL,password:process.env.IR_TEST_ADMIN_PASSWORD});
 const system=await admin.ok('admin/system-status');assert.equal(system.database_name,process.env.IR_TEST_EXPECT_DB);const owner=(await admin.ok('auth/session')).user;
 const users=[],courses=[],coupons=[];
 const tax=(await guest.ok('categories?per_page=20')).data[0],language=(await guest.ok('get-course-languages'))[0];
 const settings=await admin.ok('admin/settings');
 async function makeUser(target,suffix,role='student'){const email=`ops-${suffix}-${tag}@example.invalid`;const created=await admin.ok('admin/users','POST',{name:`Isolated operations ${suffix}`,email,password,role});const user=created.user;users.push(user.id);await target.ok('auth/login','POST',{email,password});return {...user,email};}
 async function course(suffix,price){const created=await admin.ok('admin/courses','POST',{title:`Isolated operations ${suffix}`,slug:`operations-${suffix}-${tag}`,short_description:'Disposable isolated verification.',description:'<p>Isolated financial workflow verification.</p>',image:'/inner-revealing-logo.png',category_id:tax.id,language_id:language.id,price,status:'draft'});courses.push(created.id);const chapter=await admin.ok(`admin/courses/${created.id}/chapters`,'POST',{title:'Actual fixture chapter',position:0});await admin.ok(`admin/chapters/${chapter.id}/lessons`,'POST',{title:'Private fixture lesson',type:'text',content:'<p>Isolated protected content.</p>',is_preview:false,is_published:true,position:0});await admin.ok(`admin/courses/${created.id}`,'PATCH',{status:'published'});return created;}
 async function coupon(code,ids,extra={}){const row=await admin.ok('add-promo-code','POST',{promo_code:code,message:'Isolated coupon verification',start_date:new Date(Date.now()-86400000).toISOString(),end_date:new Date(Date.now()+86400000).toISOString(),discount_type:'percentage',discount:25,course_ids:ids,total_usage_limit:1,total_usage_per_user_limit:1,...extra});coupons.push(row.id);return row;}
 try{
  const first=await makeUser(one,'first'),second=await makeUser(two,'second'),third=await makeUser(three,'third'),teacher=await makeUser(staff,'staff','admin');
  const a=await course('a',100),b=await course('b',50);
  const before=await admin.ok('earnings');
  const code=`OPS_${tag.slice(0,12)}`;await coupon(code,[a.id]);
  await one.ok('commerce/cart','POST',{course_id:a.id});await one.ok('commerce/cart','POST',{course_id:b.id});
  const quote=await one.ok('cart/apply-promo','POST',{promo_code:code});assert.equal(quote.total,125);assert.equal(quote.discount_amount,25);
  const order=await one.ok('commerce/orders','POST',{course_ids:[a.id,b.id],payment_method:'manual',coupon_code:code});assert.equal(order.order.amount,125);assert.equal(Number(order.order.subtotal),150);assert.equal(Number(order.order.discount_amount),25);assert.equal(order.order.items.find(item=>item.course_id===a.id).amount,75);assert.equal(order.order.items.find(item=>item.course_id===b.id).amount,50);
  const repeated=await one.ok('commerce/orders','POST',{course_ids:[a.id,b.id],payment_method:'manual',coupon_code:code});assert.equal(repeated.order.id,order.order.id,'Retry must reuse the reserved coupon order');
  assert.equal((await two.send('commerce/orders','POST',{course_ids:[a.id],payment_method:'manual',coupon_code:code})).status,422);
  await admin.ok(`admin/orders/${order.order.id}/reject`,'POST',{reason:'Isolated payment reference rejection'});
  await one.ok(`commerce/orders/${order.order.id}/manual`,'POST',{reference:`RETRY-${tag}`});
  assert.equal((await one.ok(`commerce/orders/${order.order.id}`)).order.status,'awaiting_review');
  await admin.ok(`admin/orders/${order.order.id}/reject`,'POST',{reason:'Release coupon for another isolated learner'});
  const paid=await two.ok('commerce/orders','POST',{course_ids:[a.id],payment_method:'manual',coupon_code:code});assert.equal(paid.order.amount,75);
  assert.equal((await one.send(`commerce/orders/${order.order.id}/manual`,'POST',{reference:`BLOCKED-${tag}`})).status,422,'Rejected-order retry must recheck quota');
  await two.ok(`commerce/orders/${paid.order.id}/manual`,'POST',{reference:`ISOLATED-PAID-${tag}`});await admin.ok(`admin/orders/${paid.order.id}/approve`,'POST',{});
  const after=await admin.ok('earnings');assert.ok(Math.abs(Number(after.summary_cards.total_revenue.value)-Number(before.summary_cards.total_revenue.value)-75)<0.01,'Revenue derives from the discounted paid line item');
  const bank={account_holder_name:'Isolated test fixture',account_number:'ISOLATED-NO-BANK-ACCOUNT',bank_name:'Isolated database only',ifsc_code:'ISOLATED'};
  const available=Number(after.action_cards.available_to_withdraw.value);
  assert.equal((await admin.send('finance/withdrawal-request','POST',{amount:available+1,payment_method:'bank_transfer',payment_details:bank})).status,422,'Cannot request more than real available earnings');
  if(available>=1){const withdrawal=await admin.ok('finance/withdrawal-request','POST',{amount:1,payment_method:'bank_transfer',payment_details:bank,notes:'Isolated no-money workflow'});await admin.ok(`withdrawal-history/${withdrawal.withdrawal_request.id}/respond`,'POST',{status:'rejected',notes:'No real bank transfer was performed'});}
  assert.equal((await staff.send('admin/settings','PATCH',{refund_enabled:'1',refund_period_days:'30'})).status,403,'Only the owner can activate a financial refund policy');
  await admin.ok('admin/settings','PATCH',{refund_enabled:'1',refund_period_days:'30'});
  const evidence=Buffer.from('%PDF-1.4\n% Isolated private refund evidence\n%%EOF\n');const body=new FormData();body.set('course_id',String(a.id));body.set('reason','Isolated refund verification; no real money moved.');body.set('amount','999999');body.set('user_media',new File([evidence],'isolated-evidence.pdf',{type:'application/pdf'}));
  const refund=await two.ok('refund/request','POST',body);
  const refundList=await admin.ok('refund-requests');const actual=refundList.data.find(row=>row.id===refund.id);assert.equal(Number(actual.refund_amount),75,'Refund amount is bounded by the actual net amount paid');
  assert.equal((await one.send(`refund-media/${refund.id}`)).status,403);assert.equal((await guest.send(`refund-media/${refund.id}`)).status,401);assert.deepEqual((await two.send(`refund-media/${refund.id}`)).bytes,evidence);
  assert.equal((await staff.send(`refund-requests/${refund.id}/respond`,'POST',{recommendation:'approve'})).status,404,'Unassigned staff cannot act on another author finances');
  await admin.ok(`refund-requests/${refund.id}/respond`,'POST',{recommendation:'approve',comment:'Isolated recommendation only'});
  assert.equal((await admin.send(`refund-requests/${refund.id}/complete`,'POST',{method:'manual',reference:'NO-CONFIRM'})).status,422);
  const forbiddenGateway=await admin.send(`refund-requests/${refund.id}/complete`,'POST',{method:'razorpay',confirm:true});assert.ok(forbiddenGateway.status>=400,'Manual purchase must not trigger a gateway refund');
  assert.equal((await admin.ok('refund-requests')).data.find(row=>row.id===refund.id).status,'approved','An unconfigured gateway must not lock a manual refund');
  await admin.ok(`refund-requests/${refund.id}/complete`,'POST',{method:'manual',reference:`ISOLATED-NO-MONEY-${tag}`,confirm:true});
  assert.equal((await two.ok(`commerce/orders/${paid.order.id}`)).order.status,'refunded');
  assert.equal((await two.ok(`learning/course/${a.slug}`)).enrolled,false);
  const net=await admin.ok('earnings');assert.ok(Math.abs(Number(net.summary_cards.total_earning.value)-Number(before.summary_cards.total_earning.value))<0.01,'Net earnings subtract the actual completed refund');
  assert.equal((await admin.send('add-team-member','POST',{member_email:first.email})).status,422,'Student invitation must not promote a global role');
  await admin.ok('add-team-member','POST',{member_email:teacher.email});const invitations=await staff.ok('invitors');const invite=invitations.find(row=>Number(row.instructor_id)===Number(owner.id));assert.ok(invite);
  assert.equal((await one.send('accept-team-invitation','POST',{action:'accept',invitation_token:invite.invitation_token})).status,403);
  await staff.ok('accept-team-invitation','POST',{action:'accept',invitation_token:invite.invitation_token});
  assert.equal((await staff.ok('auth/session')).user.role,'admin');
  const members=await admin.ok('team-members');const member=members.data.find(row=>row.user_id===teacher.id);assert.ok(member);
  await admin.ok(`team-members/${member.id}/courses`,'POST',{course_ids:[a.id],member_role:'editor'});assert.equal((await admin.ok('team-members')).data.find(row=>row.id===member.id).courses[0].id,a.id);
  await admin.ok(`remove-team-member?user_id=${teacher.id}`,'DELETE',{member_email:teacher.email});assert.equal((await staff.ok('auth/session')).user.role,'admin','Team removal must not remove global staff identity');
  const raceCode=`RACE_${tag.slice(0,12)}`;await coupon(raceCode,[b.id]);
  const race=await Promise.all([one.send('commerce/orders','POST',{course_ids:[b.id],payment_method:'manual',coupon_code:raceCode}),three.send('commerce/orders','POST',{course_ids:[b.id],payment_method:'manual',coupon_code:raceCode})]);assert.equal(race.filter(row=>row.status===200).length,1);assert.equal(race.filter(row=>row.status===422).length,1,'A single-use coupon cannot be concurrently over-reserved');
 }finally{
  await admin.send('admin/settings','PATCH',{refund_enabled:settings.refund_enabled,refund_period_days:settings.refund_period_days}).catch(()=>{});
  for(const id of coupons)await admin.send(`promo-code?id=${id}`,'DELETE').catch(()=>{});
  for(const id of courses)await admin.send(`admin/courses/${id}`,'PATCH',{status:'archived'}).catch(()=>{});
  for(const id of users)await admin.send(`admin/users/${id}`,'DELETE',{}).catch(()=>{});
  await admin.send('auth/logout','POST',{}).catch(()=>{});
 }
});
