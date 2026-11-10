import { PoolConnection,ResultSetHeader,RowDataPacket } from 'mysql2/promise';
import { SessionUser } from '../auth';
import { database } from '../db';
import { ApiError } from '../errors';
import { audit,booleanValue,transaction } from '../admin/core';
import { notify } from '../notifications';
import { accessCourse,courseFromInput,getRow,idValue,integerValue,isStaff,jsonArray,pageData,pointsValue,safeContent,staffOnly,textValue,upsertQuizForLesson } from './education-core';
import { gradeQuiz,QuizSnapshotQuestion } from './education-grading';
import { assertLessonSequence } from '../lesson-access';

export async function quizFromInput(body:Record<string,unknown>,connection:PoolConnection|ReturnType<typeof database>=database()) {
  if(body.quiz_id||body.course_chapter_quiz_id||body.quiz_type_id||body.id)return getRow('ir_quizzes',idValue(body.quiz_id||body.course_chapter_quiz_id||body.quiz_type_id||body.id),connection);
  const slug=String(body.quiz_slug||body.slug||'');
  if(/^quiz-\d+$/.test(slug))return getRow('ir_quizzes',idValue(slug.slice(5)),connection);
  throw new ApiError(422,'Choose a quiz.');
}

function questionData(row:RowDataPacket,showCorrect:boolean,totalPoints?:number,totalWeight?:number) {
  const correct=jsonArray<number>(row.correct_answers);
  const options=jsonArray<{id:number;option:string}>(row.options);
  return {id:Number(row.id),user_id:0,course_chapter_quiz_id:Number(row.quiz_id),question:row.question,points:String(totalPoints!==undefined&&totalWeight?Math.round(Number(row.points)/totalWeight*totalPoints*100)/100:Number(row.points)),order:Number(row.position),is_active:Boolean(row.is_active),created_at:row.created_at,updated_at:row.updated_at,deleted_at:null,options:options.map((option,index)=>({id:option.id,quiz_question_id:Number(row.id),user_id:0,option:option.option,order:index,is_active:true,...(showCorrect?{is_correct:correct.includes(option.id)}:{})}))};
}

async function activateReadyQuiz(connection:PoolConnection,quizId:number) {
  const quiz=await getRow('ir_quizzes',quizId,connection);
  const [details]=await connection.execute<RowDataPacket[]>('SELECT metadata FROM ir_lesson_details WHERE lesson_id=?',[quiz.lesson_id]);
  const metadata=typeof details[0]?.metadata==='string'?JSON.parse(details[0].metadata):details[0]?.metadata;
  if([true,1,'1','true'].includes(metadata?.auto_publish_quiz)) {
    const [questions]=await connection.execute<RowDataPacket[]>('SELECT id FROM ir_quiz_questions WHERE quiz_id=? AND is_active=1 LIMIT 1',[quizId]);
    if(questions.length){await connection.execute('UPDATE ir_quizzes SET is_published=1 WHERE id=?',[quizId]);await connection.execute('UPDATE ir_lessons SET is_published=1 WHERE id=?',[quiz.lesson_id]);await connection.execute("UPDATE ir_lesson_details SET metadata=JSON_REMOVE(metadata,'$.auto_publish_quiz') WHERE lesson_id=?",[quiz.lesson_id]);}
  }
}

export async function replaceQuizQuestions(connection:PoolConnection,quizId:number,input:unknown,actorId:number) {
  if(!Array.isArray(input)||input.length>200)throw new ApiError(422,'Provide at most 200 quiz questions.');
  const prepared=input.map((entry,index)=>{
    if(!entry||typeof entry!=='object'||!Array.isArray(entry.option_data)||entry.option_data.length<2||entry.option_data.length>12)throw new ApiError(422,'Each question requires between 2 and 12 options.');
    const options=entry.option_data.map((option:{option?:unknown},position:number)=>({id:position+1,option:textValue(option.option,'Option',2000)}));
    const correct=entry.option_data.flatMap((option:{is_correct?:unknown},position:number)=>booleanValue(option.is_correct)?[position+1]:[]);
    if(correct.length!==1)throw new ApiError(422,'Select exactly one correct answer per question.');
    const points=pointsValue(entry.points,'Question weight',1);if(points<=0)throw new ApiError(422,'Question weight must be greater than zero.');
    return {question:textValue(entry.question,'Question',5000),options,correct,points,position:index};
  });
  await getRow('ir_quizzes',quizId,connection,true);
  await connection.execute('DELETE FROM ir_quiz_questions WHERE quiz_id=?',[quizId]);
  for(const question of prepared)await connection.execute('INSERT INTO ir_quiz_questions(quiz_id,question,options,correct_answers,points,position) VALUES(?,?,?,?,?,?)',[quizId,question.question,JSON.stringify(question.options),JSON.stringify(question.correct),question.points,question.position]);
  await audit(connection,actorId,'quiz.questions.replace','quiz',quizId,{count:prepared.length});
}

export async function getQuizCurriculum(connection:PoolConnection|ReturnType<typeof database>,quizId:number,showCorrect=false) {
  const quiz=await getRow('ir_quizzes',quizId,connection);
  const [rows]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_quiz_questions WHERE quiz_id=? AND is_active=1 ORDER BY position,id',[quizId]);
  const totalWeight=rows.reduce((sum,row)=>sum+Number(row.points),0);
  return {id:Number(quiz.id),lesson_id:Number(quiz.lesson_id),course_id:Number(quiz.course_id),title:quiz.title,description:quiz.description,type:'quiz',time_limit:Number(quiz.time_limit_seconds),total_points:Number(quiz.total_points),passing_score:Number(quiz.passing_score),can_skip:Boolean(quiz.can_skip),is_active:Boolean(quiz.is_published),questions:rows.map(row=>questionData(row,showCorrect,Number(quiz.total_points),totalWeight)),has_questions:rows.length>0};
}

async function questionAdmin(path:string,body:Record<string,unknown>,user:SessionUser,method:string) {
  staffOnly(user);
  if(path.endsWith('questions/list')) {
    const quiz=await quizFromInput(body);const [rows]=await database().execute<RowDataPacket[]>('SELECT * FROM ir_quiz_questions WHERE quiz_id=? ORDER BY position,id',[quiz.id]);
    return rows.map(row=>questionData(row,true));
  }
  if(path.endsWith('get-question')) {
    const row=await getRow('ir_quiz_questions',idValue(body.question_id));const data=questionData(row,true);
    return {question:data,options:data.options};
  }
  if(path.endsWith('delete-question'))return transaction(async connection=>{
    const question=await getRow('ir_quiz_questions',idValue(body.id||body.question_id),connection,true);const quiz=await getRow('ir_quizzes',Number(question.quiz_id),connection);
    const course=await getRow('ir_courses',Number(quiz.course_id),connection,true);
    const [counts]=await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM ir_quiz_questions WHERE quiz_id=? AND is_active=1',[quiz.id]);
    if(course.status==='published'&&quiz.is_published&&question.is_active&&Number(counts[0].total)<=1)throw new ApiError(409,'Move the course to draft before removing its last quiz question.');
    await connection.execute('DELETE FROM ir_quiz_questions WHERE id=?',[question.id]);await audit(connection,user,'quiz.question.delete','quiz',quiz.id,{question_id:question.id});return {deleted:true};
  });
  const quiz=await quizFromInput(body);
  const entries=Array.isArray(body.quiz_data)?body.quiz_data:[body];
  if(!entries.length||entries.length>50)throw new ApiError(422,'Provide between 1 and 50 questions.');
  return transaction(async connection=>{
    await getRow('ir_courses',Number(quiz.course_id),connection,true);
    const [counts]=await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM ir_quiz_questions WHERE quiz_id=?',[quiz.id]);
    const updating=path.endsWith('update-question');
    if(!updating&&Number(counts[0].total)+entries.length>200)throw new ApiError(422,'A quiz can contain at most 200 questions.');
    const saved=[];
    for(const entry of entries) {
      if(!entry||typeof entry!=='object')throw new ApiError(422,'Invalid question data.');
      const questionId=updating?idValue(entry.question_id||body.question_id):null;
      if(questionId){const existing=await getRow('ir_quiz_questions',questionId,connection,true);if(Number(existing.quiz_id)!==Number(quiz.id))throw new ApiError(422,'This question belongs to a different quiz.');}
      const text=textValue(entry.question,'Question',5000);
      const input=entry.option_data||entry.options;
      if(!Array.isArray(input)||input.length<2||input.length>12)throw new ApiError(422,'Provide between 2 and 12 answer options.');
      const options=input.map((option,index)=>({id:index+1,option:textValue(option.option??option.text,'Option',2000)}));
      const correct=input.flatMap((option,index)=>booleanValue(option.is_correct,false)?[index+1]:[]);
      if(correct.length!==1)throw new ApiError(422,'Select exactly one correct answer.');
      const points=pointsValue(entry.points,'Question weight',1);if(points<=0)throw new ApiError(422,'Question weight must be greater than zero.');
      let id=questionId;
      if(id)await connection.execute('UPDATE ir_quiz_questions SET question=?,options=?,correct_answers=?,points=? WHERE id=?',[text,JSON.stringify(options),JSON.stringify(correct),points,id]);
      else {const insert:ResultSetHeader=(await connection.execute<ResultSetHeader>('INSERT INTO ir_quiz_questions(quiz_id,question,options,correct_answers,points,position) VALUES(?,?,?,?,?,?)',[quiz.id,text,JSON.stringify(options),JSON.stringify(correct),points,Number(counts[0].total)+saved.length]))[0];id=insert.insertId;}
      saved.push(questionData(await getRow('ir_quiz_questions',id!,connection),true));
    }
    await audit(connection,user,updating?'quiz.question.update':'quiz.question.create','quiz',quiz.id,{count:saved.length});
    await activateReadyQuiz(connection,Number(quiz.id));
    return saved.length===1?saved[0]:saved;
  });
}

function snapshotQuestions(value:unknown):QuizSnapshotQuestion[] {return jsonArray<QuizSnapshotQuestion>(value);}
function sanitizedSnapshot(questions:QuizSnapshotQuestion[]) {return questions.map(question=>({id:question.id,question:question.question,points:String(question.weight),options:question.options.map((option,index)=>({...option,order:index,is_active:true}))}));}

async function finishAttempt(connection:PoolConnection,attempt:RowDataPacket) {
  if(attempt.status==='completed')return {score:Number(attempt.score),total_questions:snapshotQuestions(attempt.question_snapshot).length,correct_answers:Number(attempt.correct_count),passed:Boolean(attempt.passed)};
  const questions=snapshotQuestions(attempt.question_snapshot);
  const [rows]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_quiz_answers WHERE attempt_id=?',[attempt.id]);
  const answers=new Map<number,number[]>(rows.map(row=>[Number(row.question_id),jsonArray<number>(row.answers)]));
  const grade=gradeQuiz(questions,answers,Number(attempt.total_points));
  const elapsed=Math.max(0,Number(attempt.elapsed||0));const time=Number(attempt.time_limit_seconds)?Math.min(elapsed,Number(attempt.time_limit_seconds)):elapsed;
  const passed=grade.earned>=Number(attempt.passing_score);
  await connection.execute("UPDATE ir_quiz_attempts SET status='completed',score=?,correct_count=?,passed=?,finished_at=UTC_TIMESTAMP(),time_taken=? WHERE id=?",[grade.earned,grade.correct,passed,time,attempt.id]);
  for(const result of grade.results)await connection.execute('UPDATE ir_quiz_answers SET score=? WHERE attempt_id=? AND question_id=?',[result.isCorrect?result.points:0,attempt.id,result.question.id]);
  if(passed) {
    const quiz=await getRow('ir_quizzes',Number(attempt.quiz_id),connection);
    await connection.execute('INSERT INTO ir_progress(user_id,lesson_id,completed,position_seconds) VALUES(?,?,1,0) ON DUPLICATE KEY UPDATE completed=1',[attempt.user_id,quiz.lesson_id]);
    await notify(connection,Number(attempt.user_id),{title:'Quiz completed',message:`You passed ${quiz.title} with ${grade.earned} points.`,url:`/learn/${(await getRow('ir_courses',Number(quiz.course_id),connection)).slug}?lesson=${quiz.lesson_id}`});
  }
  return {score:grade.earned,total_questions:grade.total,correct_answers:grade.correct,passed};
}

async function startQuiz(body:Record<string,unknown>,user:SessionUser) {
  const quiz=await quizFromInput(body);await accessCourse(user,Number(quiz.course_id),false);await assertLessonSequence(user,Number(quiz.lesson_id));
  if(!quiz.is_published)throw new ApiError(404,'This quiz is not available.');
  const lesson=await getRow('ir_lessons',Number(quiz.lesson_id));if(!lesson.is_published&&!isStaff(user))throw new ApiError(404,'This quiz is not available.');
  return transaction(async connection=>{
    await getRow('ir_quizzes',Number(quiz.id),connection,true);
    const [active]=await connection.execute<RowDataPacket[]>("SELECT *,TIMESTAMPDIFF(SECOND,started_at,UTC_TIMESTAMP()) AS elapsed FROM ir_quiz_attempts WHERE quiz_id=? AND user_id=? AND status='in_progress' ORDER BY id DESC LIMIT 1 FOR UPDATE",[quiz.id,user.id]);
    let attempt:RowDataPacket|undefined=active[0];
    if(attempt&&Number(attempt.time_limit_seconds)>0&&Number(attempt.elapsed)>Number(attempt.time_limit_seconds)){await finishAttempt(connection,attempt);attempt=undefined;}
    if(!attempt) {
      const [count]=await connection.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM ir_quiz_attempts WHERE quiz_id=? AND user_id=?',[quiz.id,user.id]);
      if(Number(quiz.max_attempts)&&Number(count[0].total)>=Number(quiz.max_attempts))throw new ApiError(409,'You have reached the maximum number of attempts. View your latest result.');
      const [questions]=await connection.execute<RowDataPacket[]>('SELECT * FROM ir_quiz_questions WHERE quiz_id=? AND is_active=1 ORDER BY position,id',[quiz.id]);
      if(!questions.length)throw new ApiError(422,'This quiz has no published questions yet.');
      const snapshot=questions.map(row=>({id:Number(row.id),question:String(row.question),options:jsonArray<{id:number;option:string}>(row.options),correct:jsonArray<number>(row.correct_answers),weight:Number(row.points)}));
      const [insert]=await connection.execute<ResultSetHeader>('INSERT INTO ir_quiz_attempts(quiz_id,user_id,question_snapshot,total_points,passing_score,time_limit_seconds) VALUES(?,?,?,?,?,?)',[quiz.id,user.id,JSON.stringify(snapshot),quiz.total_points,quiz.passing_score,quiz.time_limit_seconds]);
      attempt=await getRow('ir_quiz_attempts',insert.insertId,connection);
    }
    return {id:Number(attempt.id),user_id:user.id,course_chapter_quiz_id:String(quiz.id),total_time:Number(attempt.time_limit_seconds),time_taken:0,score:String(attempt.score),created_at:attempt.started_at,updated_at:attempt.started_at,questions:sanitizedSnapshot(snapshotQuestions(attempt.question_snapshot))};
  });
}

async function attemptAction(path:string,body:Record<string,unknown>,user:SessionUser) {
  return transaction(async connection=>{
    const [rows]=await connection.execute<RowDataPacket[]>('SELECT *,TIMESTAMPDIFF(SECOND,started_at,UTC_TIMESTAMP()) AS elapsed FROM ir_quiz_attempts WHERE id=? AND user_id=? FOR UPDATE',[idValue(body.attempt_id),user.id]);
    const attempt=rows[0];if(!attempt)throw new ApiError(404,'Quiz attempt not found.');
    const quiz=await getRow('ir_quizzes',Number(attempt.quiz_id),connection);await accessCourse(user,Number(quiz.course_id),false,connection);await assertLessonSequence(user,Number(quiz.lesson_id),connection);
    if(path==='quiz/finish')return finishAttempt(connection,attempt);
    if(attempt.status!=='in_progress')throw new ApiError(409,'This quiz attempt is already finished.');
    if(Number(attempt.time_limit_seconds)&&Number(attempt.elapsed)>Number(attempt.time_limit_seconds))throw new ApiError(409,'The quiz time limit has expired. Finish the attempt to view your result.');
    const questionId=idValue(body.quiz_question_id);const selected=idValue(body.quiz_option_id);
    const question=snapshotQuestions(attempt.question_snapshot).find(item=>item.id===questionId);
    if(!question||!question.options.some(option=>option.id===selected))throw new ApiError(422,'Choose an option from this attempt’s question.');
    await connection.execute('INSERT INTO ir_quiz_answers(attempt_id,question_id,answers) VALUES(?,?,?) ON DUPLICATE KEY UPDATE answers=VALUES(answers)',[attempt.id,questionId,JSON.stringify([selected])]);
    return {id:questionId,user_id:user.id,user_quiz_attempt_id:Number(attempt.id),quiz_question_id:questionId,quiz_option_id:String(selected),created_at:attempt.started_at,updated_at:attempt.started_at,deleted_at:null};
  });
}

export async function attemptSummary(attempt:RowDataPacket,staff=false) {
  const questions=snapshotQuestions(attempt.question_snapshot);const [rows]=await database().execute<RowDataPacket[]>('SELECT * FROM ir_quiz_answers WHERE attempt_id=?',[attempt.id]);
  const grade=gradeQuiz(questions,new Map(rows.map(row=>[Number(row.question_id),jsonArray<number>(row.answers)])),Number(attempt.total_points));
  const quiz=await getRow('ir_quizzes',Number(attempt.quiz_id));
  return {quiz_id:Number(quiz.id),quiz_title:quiz.title,attempt_id:Number(attempt.id),total_points:Number(attempt.total_points),earned_points:Number(attempt.score),score:Number(attempt.score),total_questions:questions.length,correct_answers:Number(attempt.correct_count),wrong_answers:questions.length-Number(attempt.correct_count),time_taken:Number(attempt.time_taken),attempted_at:attempt.finished_at,questions:grade.results.map((result,index)=>({question_number:String(index+1),question_id:result.question.id,question:result.question.question,your_answer:result.question.options.filter(option=>result.chosen.includes(option.id)).map(option=>option.option).join(', ')||null,correct_answer:result.question.options.filter(option=>result.question.correct.includes(option.id)).map(option=>option.option).join(', '),is_correct:result.isCorrect,points:String(result.points)}))};
}

export async function handleQuiz(path:string,body:Record<string,unknown>,user:SessionUser,method:string):Promise<unknown> {
  if(path==='quiz/start')return startQuiz(body,user);
  if(path==='quiz/answer'||path==='quiz/finish')return attemptAction(path,body,user);
  if(path==='quiz/summary') {
    const quiz=await quizFromInput(body);await accessCourse(user,Number(quiz.course_id));
    const [rows]=await database().execute<RowDataPacket[]>("SELECT * FROM ir_quiz_attempts WHERE quiz_id=? AND user_id=? AND status='completed' ORDER BY id DESC LIMIT 1",[quiz.id,user.id]);
    if(!rows[0])throw new ApiError(404,'Finish a quiz attempt to view its summary.');return attemptSummary(rows[0]);
  }
  if(path==='course-chapters/curriculum/quiz/update') {
    staffOnly(user);const quiz=await quizFromInput(body);
    return transaction(async connection=>{
      const course=await getRow('ir_courses',Number(quiz.course_id),connection,true);const result=await upsertQuizForLesson(connection,Number(quiz.lesson_id),body,user.id);
      const [questions]=await connection.execute<RowDataPacket[]>('SELECT id FROM ir_quiz_questions WHERE quiz_id=? AND is_active=1 LIMIT 1',[quiz.id]);
      if(result.is_published&&course.status==='published'&&!questions.length){result.is_published=0;await connection.execute('UPDATE ir_quizzes SET is_published=0 WHERE id=?',[quiz.id]);await connection.execute("INSERT INTO ir_lesson_details(lesson_id,metadata) VALUES(?,JSON_OBJECT('auto_publish_quiz',true)) ON DUPLICATE KEY UPDATE metadata=JSON_SET(metadata,'$.auto_publish_quiz',CAST('true' AS JSON))",[quiz.lesson_id]);}
      else if(body.is_active!==undefined)await connection.execute("UPDATE ir_lesson_details SET metadata=JSON_REMOVE(metadata,'$.auto_publish_quiz') WHERE lesson_id=?",[quiz.lesson_id]);
      await connection.execute('UPDATE ir_lessons SET title=?,is_published=? WHERE id=?',[result.title,result.is_published,quiz.lesson_id]);await audit(connection,user,'quiz.update','quiz',quiz.id);return result;
    });
  }
  if(path.includes('/quiz/')||path.endsWith('questions/list'))return questionAdmin(path,body,user,method);
  return quizReports(path,body,user);
}

async function quizReports(path:string,body:Record<string,unknown>,user:SessionUser):Promise<unknown> {
  staffOnly(user);
  if(path==='get-quiz-reports') {
    const values:(string|number)[]=[];const where=['1=1'];
    if(body.slug){where.push('c.slug=?');values.push(String(body.slug));}if(body.category_id){where.push('c.category_id=?');values.push(idValue(body.category_id));}if(body.search){where.push('(q.title LIKE ? OR c.title LIKE ?)');values.push('%'+String(body.search).slice(0,200)+'%','%'+String(body.search).slice(0,200)+'%');}
    const [rows]=await database().execute<RowDataPacket[]>(`SELECT q.*,c.title course_name,ch.title chapter_name,(SELECT COUNT(*) FROM ir_quiz_questions z WHERE z.quiz_id=q.id AND z.is_active=1) total_questions FROM ir_quizzes q JOIN ir_courses c ON c.id=q.course_id JOIN ir_lessons l ON l.id=q.lesson_id JOIN ir_chapters ch ON ch.id=l.chapter_id WHERE ${where.join(' AND ')} ORDER BY q.id DESC LIMIT 5000`,values);
    return pageData(rows.map(row=>({...row,id:Number(row.id),quiz_name:row.title,quiz_slug:`quiz-${row.id}`,total_questions:Number(row.total_questions)})),body,'/api/get-quiz-reports');
  }
  if(path==='get-quiz-report-details') {
    const quiz=await quizFromInput(body);const lesson=await getRow('ir_lessons',Number(quiz.lesson_id));const chapter=await getRow('ir_chapters',Number(lesson.chapter_id));const course=await getRow('ir_courses',Number(quiz.course_id));
    const [questionCount]=await database().execute<RowDataPacket[]>('SELECT COUNT(*) total FROM ir_quiz_questions WHERE quiz_id=? AND is_active=1',[quiz.id]);
    const [attempts]=await database().execute<RowDataPacket[]>("SELECT a.*,u.name,u.email FROM ir_quiz_attempts a JOIN ir_users u ON u.id=a.user_id WHERE a.quiz_id=? AND a.status='completed' ORDER BY a.id DESC LIMIT 10000",[quiz.id]);
    const latest=new Map<number,RowDataPacket>();for(const row of attempts)if(!latest.has(Number(row.user_id)))latest.set(Number(row.user_id),row);
    let performance=Array.from(latest.values()).map(row=>({user_id:Number(row.user_id),player_name:row.name,player_email:row.email,player_image:'',attempt_id:Number(row.id),total_attempts:attempts.filter(attempt=>Number(attempt.user_id)===Number(row.user_id)).length,correct_answers:Number(row.correct_count),incorrect_answers:snapshotQuestions(row.question_snapshot).length-Number(row.correct_count),earned_points:Number(row.score),pass_fail:row.passed?'Pass':'Fail',pass_fail_status:Boolean(row.passed),last_attempt_date:row.finished_at,last_attempt_datetime:row.finished_at,time_ago:''}));
    if(body.search){const search=String(body.search).toLowerCase();performance=performance.filter(row=>(row.player_name+' '+row.player_email).toLowerCase().includes(search));}if(body.status_filter&&body.status_filter!=='all')performance=performance.filter(row=>row.pass_fail.toLowerCase()===String(body.status_filter).toLowerCase());
    return {quiz_info:{quiz_id:Number(quiz.id),quiz_title:quiz.title,quiz_number:String(quiz.id),total_questions:Number(questionCount[0].total),course_name:course.title,chapter_name:chapter.title,course_id:Number(course.id),chapter_id:Number(chapter.id)},quiz_statistics:{passing_points:Number(quiz.passing_score),total_points:Number(quiz.total_points),total_attempts:attempts.length,pass_rate:attempts.length?Math.round(attempts.filter(row=>row.passed).length/attempts.length*100):0,average_score:attempts.length?Math.round(attempts.reduce((sum,row)=>sum+Number(row.score),0)/attempts.length*100)/100:0},student_performance:performance,filters:{quiz_reports:['all'],pass_fail:['all','Pass','Fail']}};
  }
  if(path==='get-quiz-result-details') {
    const attempt=await getRow('ir_quiz_attempts',idValue(body.attempt_id));const quiz=await getRow('ir_quizzes',Number(attempt.quiz_id));const student=await getRow('ir_users',Number(attempt.user_id));const course=await getRow('ir_courses',Number(quiz.course_id));const lesson=await getRow('ir_lessons',Number(quiz.lesson_id));const chapter=await getRow('ir_chapters',Number(lesson.chapter_id));
    const summary=await attemptSummary(attempt,true);const [answerRows]=await database().execute<RowDataPacket[]>('SELECT question_id,answers FROM ir_quiz_answers WHERE attempt_id=?',[attempt.id]);const answers=new Map<number,number[]>(answerRows.map(row=>[Number(row.question_id),jsonArray<number>(row.answers)]));
    const grade=gradeQuiz(snapshotQuestions(attempt.question_snapshot),answers,Number(attempt.total_points));
    return {quiz_summary:{student_name:student.name,student_email:student.email,quiz_title:quiz.title,course_name:course.title,chapter_name:chapter.title,attempt_date:attempt.finished_at,time_taken:Number(attempt.time_taken),total_questions:summary.total_questions,correct_answers:summary.correct_answers,incorrect_answers:summary.wrong_answers,earned_points:summary.earned_points,max_points:summary.total_points,score_percentage:summary.total_points?Math.round(summary.earned_points/summary.total_points*100):0,pass_fail_status:attempt.passed?'Pass':'Fail'},questions:grade.results.map((result,index)=>({question_number:index+1,question_text:result.question.question,question_type:'multiple_choice',points:String(result.points),is_correct:result.isCorrect,status:result.isCorrect?'Correct':'Incorrect',options:result.question.options.map(option=>({id:option.id,option_text:option.option,is_selected:result.chosen.includes(option.id),is_correct:result.question.correct.includes(option.id),status:result.question.correct.includes(option.id)?'correct_answer':'normal'})),user_selected_option:result.chosen[0]||null,correct_option:{id:result.question.correct[0],option_text:result.question.options.find(option=>option.id===result.question.correct[0])?.option||''}}))};
  }
  throw new ApiError(404,'Quiz endpoint not found.');
}
