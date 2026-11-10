const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {randomUUID}=require('node:crypto');
const ts=require('typescript');

function sourceModule(filename,mocks={}) {
  const module={exports:{}};
  const source=ts.transpileModule(fs.readFileSync(path.join(process.cwd(),filename),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},fileName:filename}).outputText;
  vm.runInNewContext(source,{module,exports:module.exports,require:name=>{if(name in mocks)return mocks[name];throw new Error('Unexpected test dependency: '+name);},Map,Set,Buffer,URLSearchParams,FormData,File,JSON,Number,Array,Object,Error});
  return module.exports;
}
const {gradeQuiz}=sourceModule('src/server/instructor/education-grading.ts');
class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
const {parseLegacyFields}=sourceModule('src/server/instructor/legacy-input.ts',{'../errors':{ApiError},'../request':{}});

test('quiz grading uses saved correct answers and configured weights, including unanswered questions',()=>{
  const questions=[{id:1,question:'One',options:[{id:1,option:'A'},{id:2,option:'B'}],correct:[1],weight:1},{id:2,question:'Two',options:[{id:1,option:'A'},{id:2,option:'B'}],correct:[2],weight:3}];
  let grade=gradeQuiz(questions,new Map([[1,[1]],[2,[1]]]),20);assert.equal(grade.earned,5);assert.equal(grade.correct,1);assert.equal(grade.total,2);
  grade=gradeQuiz(questions,new Map([[1,[1]],[2,[2]]]),20);assert.equal(grade.earned,20);assert.equal(grade.correct,2);
  grade=gradeQuiz(questions,new Map([[2,[1,2]]]),20);assert.equal(grade.earned,0);assert.equal(grade.correct,0);
});

test('original bracketed quiz and file forms preserve structure and reject prototype or huge-index fields',()=>{
  const fields=parseLegacyFields([['quiz_data[0][question]','A question'],['quiz_data[0][option_data][0][option]','Answer'],['quiz_data[0][option_data][0][is_correct]','1'],['files[]','one'],['files[]','two']]);
  assert.equal(fields.quiz_data[0].option_data[0].option,'Answer');assert.deepEqual(Array.from(fields.files),['one','two']);
  assert.throws(()=>parseLegacyFields([['__proto__[polluted]','yes']]),error=>error.status===422);
  assert.throws(()=>parseLegacyFields([['quiz_data[999999][question]','bad']]),error=>error.status===422);
  assert.equal({}.polluted,undefined);
});

test('isolated education HTTP: original quiz/assignment authoring, grading, submissions, reviews and discussions',{skip:process.env.IR_TEST_ALLOW_FIXTURES!=='1'},async()=>{
  const expected=process.env.IR_TEST_EXPECT_DB||'';assert.match(expected,/test/i,'Require an explicit isolated test database');
  for(const key of ['IR_TEST_BASE_URL','IR_TEST_ADMIN_EMAIL','IR_TEST_ADMIN_PASSWORD'])assert.ok(process.env[key],`Set ${key}`);
  const base=new URL(process.env.IR_TEST_BASE_URL).origin;const origin=process.env.IR_TEST_ORIGIN||base;
  const unique=randomUUID().replaceAll('-','').slice(0,14);const password=`Education-${randomUUID()}!`;
  const cookie={admin:'',learner:'',outsider:''};const fixture={course:null,users:[],media:[]};let guarded=false;
  async function send(endpoint,method='GET',body,as='admin') {
    const form=body instanceof FormData;const encoded=body instanceof URLSearchParams;
    const response=await fetch(`${base}/api/${endpoint}`,{method,redirect:'error',headers:{...(method!=='GET'?{origin,...(!form?{'content-type':encoded?'application/x-www-form-urlencoded':'application/json'}:{})}:{}),...(cookie[as]?{cookie:cookie[as]}:{})},...(body===undefined?{}:{body:form||encoded?body:JSON.stringify(body)})});
    const setCookie=response.headers.get('set-cookie');if(setCookie)cookie[as]=setCookie.split(';')[0];
    const payload=response.headers.get('content-type')?.includes('application/json')?await response.json():null;
    return {response,payload};
  }
  async function ok(endpoint,method='GET',body,as='admin') {
    const result=await send(endpoint,method,body,as);assert.ok(result.response.ok,`${method} ${endpoint}: ${result.response.status} ${result.payload?.message||''}`);return result.payload.data;
  }
  try {
    const login=await ok('auth/login','POST',{email:process.env.IR_TEST_ADMIN_EMAIL,password:process.env.IR_TEST_ADMIN_PASSWORD});assert.equal(login.user.role,'superadmin');
    assert.equal((await ok('admin/system-status')).database_name,expected,'Refuse to create fixtures in production');guarded=true;
    for(const endpoint of ['get-reviews','get-assignments-list','get-quiz-reports','notifications'])await ok(endpoint);
    const categories=await ok('admin/categories');const languages=await ok('admin/languages');
    const course=await ok('admin/courses','POST',{title:'Isolated educational verification',slug:`education-${unique}`,short_description:'Created only in the explicitly isolated test database.',description:'<p>Tests are removed after verification.</p>',image:'/inner-revealing-logo.png',category_id:categories.items[0].id,language_id:languages.items[0].id,level:'beginner',price:0,status:'draft'});fixture.course=course.id;
    const chapter=await ok(`admin/courses/${course.id}/chapters`,'POST',{title:'Education verification chapter',position:0});
    const text=await ok(`admin/chapters/${chapter.id}/lessons`,'POST',{title:'Required introduction',type:'text',content_text:'<p>Read the introductory lesson.</p>',position:0,is_published:true});
    const quiz=await ok('course-chapters/curriculum','POST',{chapter_id:chapter.id,type:'quiz',quiz_title:'Isolated single-choice quiz',quiz_description:'Choose the safe answer.',quiz_total_points:10,quiz_passing_score:5,quiz_can_skip:0,quiz_data:[{question:'Which answer is correct?',option_data:[{option:'The safe answer',is_correct:1},{option:'The other answer',is_correct:0}]}]});
    assert.ok(quiz.id&&quiz.lesson_id);
    const assignment=await ok('course-chapters/curriculum','POST',{chapter_id:chapter.id,type:'assignment',assignment_title:'Isolated assignment',assignment_description:'Write a short reflection.',assignment_instructions:'Submit your reflection as a PDF or comment.',assignment_points:10,assignment_due_days:7,assignment_can_skip:0,assignment_allowed_file_types:['4']});
    assert.ok(assignment.id&&assignment.lesson_id);
    await ok('update-course','POST',{id:course.id,sequential_access:true});await ok(`admin/courses/${course.id}`,'PATCH',{status:'published'});
    for(const role of ['learner','outsider']) {
      const user=(await ok('admin/users','POST',{name:`Isolated ${role}`,email:`${role}-${unique}@example.invalid`,password,role:'student'})).user;fixture.users.push(user.id);
      await ok('auth/login','POST',{email:user.email,password},role);
    }
    const enrollment=await ok('admin/enrollments','POST',{user_id:fixture.users[0],course_id:course.id});
    assert.equal((await send('quiz/start','POST',{course_chapter_quiz_id:quiz.id},'outsider')).response.status,403);
    assert.equal((await send('quiz/start','POST',{course_chapter_quiz_id:quiz.id},'learner')).response.status,403,'Sequential lessons must be completed first');
    await ok(`learning/progress/${text.id}`,'POST',{completed:true},'learner');
    assert.equal((await send(`learning/progress/${quiz.lesson_id}`,'POST',{completed:true},'learner')).response.status,403,'Generic progress cannot bypass quiz grading');
    const metadata=await ok(`education/lesson/${quiz.lesson_id}`,'GET',undefined,'learner');
    assert.doesNotMatch(JSON.stringify(metadata),/"(?:correct_answers|is_correct|correct)"/);
    const attempt=await ok('quiz/start','POST',{course_chapter_quiz_id:quiz.id},'learner');assert.equal(attempt.questions.length,1);
    assert.doesNotMatch(JSON.stringify(attempt),/"(?:correct_answers|is_correct|correct)"/);
    const questionId=attempt.questions[0].id;
    assert.equal((await send('quiz/answer','POST',{attempt_id:attempt.id,quiz_question_id:questionId,quiz_option_id:999},'learner')).response.status,422);
    assert.equal((await send('quiz/answer','POST',{attempt_id:attempt.id,quiz_question_id:questionId,quiz_option_id:1},'outsider')).response.status,404);
    // Staff edits after start must not alter an in-progress attempt's answer key.
    const edit=new URLSearchParams({quiz_id:String(quiz.id),'quiz_data[0][question_id]':String(questionId),'quiz_data[0][question]':'Which answer is correct?','quiz_data[0][option_data][0][option]':'The safe answer','quiz_data[0][option_data][0][is_correct]':'0','quiz_data[0][option_data][1][option]':'The other answer','quiz_data[0][option_data][1][is_correct]':'1'});
    await ok('course-chapters/curriculum/quiz/update-question','POST',edit);
    const answer=await ok('quiz/answer','POST',{attempt_id:attempt.id,quiz_question_id:questionId,quiz_option_id:1},'learner');assert.equal(answer.quiz_option_id,'1');assert.equal(answer.is_correct,undefined);
    const grade=await ok('quiz/finish','POST',{attempt_id:attempt.id,score:999,time_taken:999},'learner');assert.equal(grade.score,10);assert.equal(grade.correct_answers,1);assert.equal(grade.passed,true);
    assert.equal((await ok('quiz/finish','POST',{attempt_id:attempt.id},'learner')).score,10,'Finishing is idempotent');
    const summary=await ok(`quiz/summary?course_chapter_quiz_id=${quiz.id}`,'GET',undefined,'learner');assert.equal(summary.score,10);assert.equal(summary.questions[0].correct_answer,'The safe answer');
    assert.equal((await send(`get-quiz-result-details?attempt_id=${attempt.id}`,'GET',undefined,'learner')).response.status,403);
    const report=await ok(`get-quiz-report-details?quiz_id=${quiz.id}`);assert.ok(report.student_performance.some(row=>row.user_id===fixture.users[0]&&row.earned_points===10));
    assert.equal((await ok(`learning/lesson/${quiz.lesson_id}`,'GET',undefined,'learner')).completed,true);
    assert.equal((await send(`learning/progress/${assignment.lesson_id}`,'POST',{completed:true},'learner')).response.status,403);
    const form=new FormData();form.set('assignment_id',String(assignment.id));form.set('comment','My isolated reflection.');form.append('files[]',new Blob(['%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n'],{type:'application/pdf'}),'reflection.pdf');
    const submission=await ok('assignments/submit','POST',form,'learner');assert.equal(submission.status,'submitted');
    const assignments=await ok(`get-assignments?course_id=${course.id}`,'GET',undefined,'learner');const own=assignments.chapters.flatMap(chapter=>chapter.assignments).find(row=>row.id===assignment.id);assert.ok(own.submissions.length===1);
    const file=own.submissions[0].files[0];fixture.media.push(file.media_id);assert.equal((await send(`media/${file.media_id}`,'GET',undefined,'anonymous')).response.status,401);assert.equal((await send(`media/${file.media_id}`,'GET',undefined,'outsider')).response.status,403);assert.equal((await send(`media/${file.media_id}`,'GET',undefined,'learner')).response.status,200);
    assert.equal((await send('edit-assignment-submission','PUT',{submission_id:submission.submission_id,status:'accepted',points:20,feedback:'Invalid over-grade.'})).response.status,422);
    await ok(`edit-assignment-submission?submission_id=${submission.submission_id}&status=accepted&points=8&feedback=Reviewed`,'PUT');
    assert.equal((await ok(`learning/lesson/${assignment.lesson_id}`,'GET',undefined,'learner')).completed,true);
    const staffSubmissions=await ok(`assignment-submissions?assignment_id=${assignment.id}`);assert.equal(staffSubmissions.data[0].status,'accepted');assert.equal(staffSubmissions.data[0].points,'8.00');
    const resourceForm=new FormData();resourceForm.set('chapter_id',String(chapter.id));resourceForm.set('type','document');resourceForm.set('document_title','Text document verification');resourceForm.set('document_description','A protected text download.');resourceForm.set('document_file',new Blob(['hello'],{type:'text/plain'}),'reflection.txt');
    const resource=await ok('course-chapters/curriculum','POST',resourceForm);const resourceMedia=Number(resource.file.split('/').pop());fixture.media.push(resourceMedia);
    const resourceLesson=await ok(`learning/lesson/${resource.lesson_id}`,'GET',undefined,'learner');assert.equal(resourceLesson.type,'resource');assert.equal(resourceLesson.source_url,`/api/media/${resourceMedia}`);
    const textDownload=await send(`media/${resourceMedia}`,'GET',undefined,'learner');assert.equal(textDownload.response.status,200);assert.equal(await textDownload.response.text(),'hello');
    assert.equal((await send('rating/add','POST',{course_id:course.id,rating:5,review:'Not enrolled.'},'outsider')).response.status,403);
    const rating=await ok('rating/add','POST',{course_id:course.id,rating:4,review:'A real isolated learner review.'},'learner');const reviews=await ok(`get-course-reviews?slug=${course.slug}`,'GET',undefined,'anonymous');assert.equal(reviews.statistics.total_reviews,1);assert.equal(reviews.statistics.average_rating,4);assert.equal(reviews.reviews.data[0].user.email,'');
    const foreignDelete=await send(`rating/delete?rating_id=${rating.id}`,'DELETE',{},'outsider');
    assert.equal(foreignDelete.response.status,404,foreignDelete.payload?.message);
    const queryOnlyDelete=await fetch(`${base}/api/rating/delete?rating_id=${rating.id}`,{method:'DELETE',headers:{origin,cookie:cookie.outsider,Accept:'application/json'}});
    assert.equal(queryOnlyDelete.status,404,'The original query-only DELETE must reach ownership validation');
    assert.equal((await send('discussion/course','POST',{course_id:course.id,message:'Not enrolled.'},'outsider')).response.status,403);
    const discussion=await ok('discussion/course','POST',{course_id:course.id,message:'A question from the isolated learner.'},'learner');await ok('reply-discussion','POST',{discussion_id:discussion.id,message:'An answer from course staff.'});
    const thread=await ok(`discussion/course?course_id=${course.id}`,'GET',undefined,'learner');assert.equal(thread.data[0].replies[0].message,'An answer from course staff.');
    // Empty quizzes added to an already published course remain draft until ready.
    const pending=await ok('course-chapters/curriculum','POST',{chapter_id:chapter.id,type:'quiz',quiz_title:'Auto draft verification',quiz_total_points:2,quiz_passing_score:1,quiz_can_skip:0});assert.equal(pending.is_active,false);
    await ok('course-chapters/curriculum/quiz/add-question','POST',{quiz_id:pending.id,quiz_data:[{question:'Is this ready?',option_data:[{option:'Yes',is_correct:1},{option:'No',is_correct:0}]}]});
    const curriculum=await send(`course-chapters/curriculum/list?chapter_id=${chapter.id}`);assert.equal(curriculum.payload.rows.find(row=>row.id===pending.id&&row.type==='quiz').status,true);
    await ok(`admin/enrollments/${enrollment.id}`,'DELETE');assert.equal((await send(`quiz/summary?course_chapter_quiz_id=${quiz.id}`,'GET',undefined,'learner')).response.status,403);assert.equal((await send('discussion/course','POST',{course_id:course.id,message:'Access was revoked.'},'learner')).response.status,403);
  } finally {
    if(guarded){for(const id of fixture.users)await ok(`admin/users/${id}`,'DELETE');if(fixture.course)await ok(`admin/courses/${fixture.course}`,'DELETE');for(const id of fixture.media.filter(Boolean))await ok(`admin/media/${id}`,'DELETE');}
  }
});
