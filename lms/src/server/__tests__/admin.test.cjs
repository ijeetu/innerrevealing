const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
if(!process.env.IR_ADMIN_COMPILED)throw new Error('Run node scripts/test-admin.cjs');
const {assertUserManagement}=require(path.join(process.env.IR_ADMIN_COMPILED,'admin/roles.js'));
const {detectMedia,parseByteRange}=require(path.join(process.env.IR_ADMIN_COMPILED,'admin/media-types.js'));
const {safeContent,safeHttps}=require(path.join(process.env.IR_ADMIN_COMPILED,'admin/core.js'));

test('RBAC prevents student escalation, admin superadmin changes, and loss of last active superadmin',()=>{
  assert.throws(()=>assertUserManagement('student','student','admin',true,true,1),error=>error.status===403);
  assert.throws(()=>assertUserManagement('admin','student','superadmin',true,true,1),error=>error.status===403);
  assert.throws(()=>assertUserManagement('admin','superadmin','student',true,false,1),error=>error.status===403);
  assert.throws(()=>assertUserManagement('superadmin','superadmin','admin',true,true,1),error=>error.status===409);
  assert.throws(()=>assertUserManagement('superadmin','superadmin','superadmin',true,false,1),error=>error.status===409);
  assert.doesNotThrow(()=>assertUserManagement('superadmin','superadmin','student',true,false,2));
});

test('content sanitization rejects active HTML and unsafe source URLs',()=>{
  const clean=safeContent('<p onclick="bad()">Hello <strong>learner</strong><script>alert(1)</script><a href="javascript:bad()">link</a><iframe src="https://evil.example"></iframe></p>');
  assert.match(clean,/<strong>learner<\/strong>/);
  assert.doesNotMatch(clean,/onclick|script|javascript:|iframe/);
  assert.throws(()=>safeHttps('http://example.com/file.mp4'));
  assert.throws(()=>safeHttps('https://name:password@example.com/file'));
  assert.equal(safeHttps('/api/media/12','Image',true),'/api/media/12');
});

test('uploads use content signatures and byte ranges stay within file boundaries',()=>{
  const png=Buffer.from('89504e470d0a1a0a00000000','hex');
  assert.equal(detectMedia(png,'text/html').mime,'image/png');
  assert.throws(()=>detectMedia(Buffer.from('<svg onload="alert(1)"></svg>'),'image/png'),error=>error.status===422);
  assert.throws(()=>detectMedia(Buffer.from('<!doctype html><script>bad()</script>'),'image/png'),error=>error.status===422);
  assert.deepEqual(parseByteRange('bytes=2-5',10),{start:2,end:5});
  assert.deepEqual(parseByteRange('bytes=-3',10),{start:7,end:9});
  assert.deepEqual(parseByteRange('bytes=8-999',10),{start:8,end:9});
  assert.throws(()=>parseByteRange('bytes=10-',10),error=>error.status===416);
  assert.throws(()=>parseByteRange('bytes=1-3,5-7',10),error=>error.status===416);
});

test('isolated MySQL admin HTTP flows: authoring, RBAC, content, uploads, enrollment and audit',{skip:process.env.IR_TEST_ALLOW_FIXTURES!=='1'},async()=>{
  const expectedDb=process.env.IR_TEST_EXPECT_DB||'';
  assert.match(expectedDb,/test/i,'IR_TEST_EXPECT_DB must identify an isolated test database');
  for(const name of ['IR_TEST_BASE_URL','IR_TEST_ADMIN_EMAIL','IR_TEST_ADMIN_PASSWORD'])assert.ok(process.env[name],`Set ${name}`);
  const base=new URL(process.env.IR_TEST_BASE_URL).origin;
  const origin=process.env.IR_TEST_ORIGIN||base;
  const unique=randomUUID().replaceAll('-','').slice(0,16);
  const password=`Isolated-${randomUUID()}!`;
  const cookies={super:'',staff:'',student:''};
  const fixture={course:null,student:null,staff:null,peer:null,page:null,faq:null,media:[],category:null,settings:null};
  let superUser;
  async function send(endpoint,method='GET',body,as='super',extra={}) {
    const form=body instanceof FormData;
    const headers={...(method!=='GET'?{origin,...(!form?{'content-type':'application/json'}:{})}:{}),...(cookies[as]?{cookie:cookies[as]}:{}),...extra};
    const response=await fetch(`${base}/api/${endpoint}`,{method,headers,redirect:'error',...(body!==undefined?{body:form?body:JSON.stringify(body)}:{})});
    const cookie=response.headers.get('set-cookie');if(cookie)cookies[as]=cookie.split(';')[0];
    const type=response.headers.get('content-type')||'';
    const data=type.includes('application/json')?await response.json():null;
    return {response,data};
  }
  async function ok(endpoint,method='GET',body,as='super') {
    const result=await send(endpoint,method,body,as);
    assert.ok(result.response.ok,`${method} ${endpoint}: ${result.response.status} ${result.data?.message||''}`);
    return result.data.data;
  }
  try {
    const session=await ok('auth/login','POST',{email:process.env.IR_TEST_ADMIN_EMAIL,password:process.env.IR_TEST_ADMIN_PASSWORD});superUser=session.user;
    assert.equal(superUser.role,'superadmin');
    const status=await ok('admin/system-status');assert.equal(status.database_name,expectedDb,'Fixture guard: connected database must exactly match the isolated test database');
    assert.equal((await send(`admin/users/${superUser.id}`,'PATCH',{is_active:false})).response.status,409,'Cannot remove final or current superadmin access');
    const categories=await ok('admin/categories');const languages=await ok('admin/languages');
    assert.ok(categories.items.length===3&&languages.items.length>0);
    const createdStudent=await ok('admin/users','POST',{name:'Isolated learner',email:`learner-${unique}@example.invalid`,password,role:'student'});fixture.student=createdStudent.user;
    const createdStaff=await ok('admin/users','POST',{name:'Isolated administrator',email:`admin-${unique}@example.invalid`,password,role:'admin'});fixture.staff=createdStaff.user;
    await ok('auth/login','POST',{email:fixture.student.email,password},'student');
    await ok('auth/login','POST',{email:fixture.staff.email,password},'staff');
    assert.equal((await send('admin/dashboard','GET',undefined,'student')).response.status,403);
    assert.equal((await send('admin/integrations','GET',undefined,'staff')).response.status,403);
    assert.equal((await send(`admin/users/${fixture.student.id}`,'PATCH',{role:'superadmin'},'staff')).response.status,403);
    assert.equal((await send(`admin/users/${superUser.id}`,'PATCH',{name:'Forbidden change'},'staff')).response.status,403);
    const peer=await ok('admin/users','POST',{name:'Isolated promotion race',email:`peer-${unique}@example.invalid`,password,role:'admin'});fixture.peer=peer.user;
    const [promotion,resetRace]=await Promise.all([
      send(`admin/users/${fixture.peer.id}`,'PATCH',{role:'superadmin'}),
      send(`admin/users/${fixture.peer.id}/reset-link`,'POST',{},'staff'),
    ]);
    assert.equal(promotion.response.status,200,'Superadmin promotion must complete');
    if(resetRace.response.ok) {
      const token=new URL(resetRace.data.data.url).searchParams.get('token');
      // Matching password fields ensure token invalidation prevents the reset.
      const nextPassword=`Changed-${randomUUID()}!`;
      const tokenCheck=await send('auth/reset-password','POST',{token,password:nextPassword,confirm_password:nextPassword},'anonymous');
      assert.equal(tokenCheck.response.status,422,'Promotion must invalidate an earlier administrator-issued reset token');
      assert.match(tokenCheck.data.message,/invalid|expired/i);
    } else assert.equal(resetRace.response.status,403,'Reset issuance after promotion must reject the ordinary administrator');
    const course=await ok('admin/courses','POST',{title:'Isolated authorization fixture',slug:`isolated-${unique}`,short_description:'Only used in the explicitly isolated test database.',description:'<p>Isolated authoring and access-control verification.</p>',image:'/inner-revealing-logo.png',category_id:categories.items[0].id,language_id:languages.items[0].id,level:'beginner',price:0,status:'draft'});fixture.course=course.id;
    assert.equal((await send(`admin/courses/${course.id}`,'PATCH',{status:'published'})).response.status,422);
    const chapter=await ok(`admin/courses/${course.id}/chapters`,'POST',{title:'Isolated chapter',position:0});
    const lesson=await ok(`admin/chapters/${chapter.id}/lessons`,'POST',{title:'Isolated text lesson',type:'text',content_text:'<p>Fixture lesson in the test database.</p>',position:0,is_published:true,is_preview:false});
    await ok(`admin/courses/${course.id}`,'PATCH',{status:'published'});
    await ok(`admin/courses/${course.id}/order`,'POST',{chapter_ids:[chapter.id],lessons:[{chapter_id:chapter.id,lesson_ids:[lesson.id]}]});
    assert.equal((await send(`admin/lessons/${lesson.id}`,'DELETE')).response.status,422,'Cannot remove final published curriculum');
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=','base64');
    const imageUpload=new FormData();imageUpload.set('purpose','image');imageUpload.set('file',new Blob([png],{type:'image/png'}),'fixture.png');
    const image=await ok('admin/media','POST',imageUpload);fixture.media.push(image.id);
    assert.equal((await send(`media/${image.id}`,'GET',undefined,'anonymous')).response.status,200);
    const rejectedUpload=new FormData();rejectedUpload.set('file',new Blob(['<svg onload="bad()"></svg>'],{type:'image/png'}),'fake.png');
    assert.equal((await send('admin/media','POST',rejectedUpload)).response.status,422);
    const pdfUpload=new FormData();pdfUpload.set('purpose','course');pdfUpload.set('file',new Blob(['%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n'],{type:'application/pdf'}),'fixture.pdf');
    const pdf=await ok('admin/media','POST',pdfUpload);fixture.media.push(pdf.id);
    await ok(`admin/chapters/${chapter.id}/lessons`,'POST',{title:'Isolated protected document',type:'pdf',media_id:pdf.id,is_preview:false,is_published:true,position:1});
    assert.equal((await send(`media/${pdf.id}`,'GET',undefined,'anonymous')).response.status,401);
    assert.equal((await send(`media/${pdf.id}`,'GET',undefined,'student')).response.status,403);
    const enrollment=await ok('admin/enrollments','POST',{user_id:fixture.student.id,course_id:course.id});
    const notifications=await ok('notifications','GET',undefined,'student');assert.ok(notifications.unread_count>=1);
    const notice=notifications.data.find(item=>item.title==='Practice access granted');assert.ok(notice);
    await ok('notifications/mark-read','POST',{notification_id:notice.id},'student');
    const readNotices=await ok('notifications','GET',undefined,'student');assert.equal(readNotices.data.find(item=>item.id===notice.id).is_read,true);
    const range=await send(`media/${pdf.id}`,'GET',undefined,'student',{range:'bytes=0-7'});
    assert.equal(range.response.status,206);
    assert.equal(range.response.headers.get('content-range'),`bytes 0-7/${pdf.byte_size}`);
    const rangeBody=Buffer.from(await range.response.arrayBuffer());
    assert.equal(rangeBody.length,8);
    assert.equal(rangeBody.toString('ascii'),'%PDF-1.4');
    await ok(`admin/enrollments/${enrollment.id}`,'DELETE');assert.equal((await send(`media/${pdf.id}`,'GET',undefined,'student')).response.status,403);
    const page=await ok('admin/pages','POST',{title:'Isolated page',slug:`isolated-${unique}`,content:'<p>Safe content<script>bad()</script></p>',status:'draft'});fixture.page=page.id;assert.doesNotMatch(page.content,/<script/);
    await ok(`admin/pages/${page.id}`,'PATCH',{status:'published'});
    const faq=await ok('admin/faqs','POST',{question:'Is this an isolated fixture?',answer:'<p>Yes, only in the test database.</p>',is_published:true,position:0});fixture.faq=faq.id;
    fixture.category=categories.items[0];await ok(`admin/categories/${fixture.category.id}`,'PATCH',{description:'Temporary isolated configuration verification.'});
    fixture.settings=await ok('admin/settings');await ok('admin/settings','PATCH',{footer_description:'Isolated configuration verification.'});
    const audit=await ok('admin/audit?search=course.create');assert.ok(audit.items.length>0);
    const reset=await ok(`admin/users/${fixture.student.id}/reset-link`,'POST',{});assert.match(reset.url,/reset-password\?token=[a-f0-9]{64}$/);assert.equal(reset.email_sent,false);
    await ok(`admin/users/${fixture.staff.id}`,'PATCH',{is_active:false});assert.equal((await send('auth/session','GET',undefined,'staff')).response.status,401);
    const dashboard=await ok('admin/dashboard');assert.ok(dashboard.counts.courses>=1&&dashboard.counts.learners>=1);
  } finally {
    if(superUser) {
      if(fixture.settings)await ok('admin/settings','PATCH',{footer_description:fixture.settings.footer_description});
      if(fixture.category)await ok(`admin/categories/${fixture.category.id}`,'PATCH',{description:fixture.category.description||''});
      if(fixture.page)await ok(`admin/pages/${fixture.page}`,'DELETE');
      if(fixture.faq)await ok(`admin/faqs/${fixture.faq}`,'DELETE');
      if(fixture.student)await ok(`admin/users/${fixture.student.id}`,'DELETE');
      if(fixture.staff)await ok(`admin/users/${fixture.staff.id}`,'DELETE');
      if(fixture.peer)await ok(`admin/users/${fixture.peer.id}`,'DELETE');
      if(fixture.course)await ok(`admin/courses/${fixture.course}`,'DELETE');
      for(const id of fixture.media)await ok(`admin/media/${id}`,'DELETE');
    }
  }
});
