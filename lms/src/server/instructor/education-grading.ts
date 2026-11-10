export interface QuizSnapshotQuestion {
  id:number;question:string;options:{id:number;option:string}[];correct:number[];weight:number;
}

export function gradeQuiz(questions:QuizSnapshotQuestion[],answers:Map<number,number[]>,totalPoints:number) {
  const totalWeight=questions.reduce((sum,question)=>sum+question.weight,0);
  let earnedWeight=0;let correct=0;
  const results=questions.map(question=>{
    const chosen=[...(answers.get(question.id)||[])].sort((a,b)=>a-b);
    const expected=[...question.correct].sort((a,b)=>a-b);
    const isCorrect=chosen.length===expected.length&&chosen.every((answer,index)=>answer===expected[index]);
    if(isCorrect){earnedWeight+=question.weight;correct++;}
    return {question,isCorrect,chosen,points:Math.round((totalWeight?question.weight/totalWeight*totalPoints:0)*100)/100};
  });
  return {earned:Math.round((totalWeight?earnedWeight/totalWeight*totalPoints:0)*100)/100,correct,total:questions.length,results};
}
