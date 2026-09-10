const {json,db}=require("./_common");
const {schoolYearFor}=require("./_schoolyear");
const validSchool=s=>/^[A-Za-z0-9_-]{2,32}$/.test(String(s||""));
module.exports=async(req,res)=>{
 if(req.method!=="POST")return json(res,405,{error:"method"});
 try{
  const b=req.body||{};
  if(b.teacherPractice===true || b.teacherPractice==="1")return json(res,403,{error:"teacher practice is read-only"});
  const code=String(b.studentCode||"").trim(),schoolCode=String(b.schoolCode||"main").trim().toLowerCase();
  if(!validSchool(schoolCode))return json(res,400,{error:"invalid school code"});
  if(!/^[1-6]-[1-9][0-9]?-[0-9]{1,3}$/.test(code))return json(res,400,{error:"invalid student code"});
  const grade=Number(b.grade),classNo=Number(b.classNo),seatNo=Number(b.seatNo),schoolYear=schoolYearFor();
  if(grade<1||grade>6||classNo<1||classNo>99||seatNo<1||seatNo>999)return json(res,400,{error:"invalid student profile"});
  const sql=db();
  await sql`insert into schools(school_code) values(${schoolCode}) on conflict(school_code) do nothing`;
  await sql`insert into students(school_code,student_code,school_year,grade,class_no,seat_no,last_seen)
    values(${schoolCode},${code},${schoolYear},${grade},${classNo},${seatNo},now())
    on conflict(school_code,student_code,school_year) do update set grade=excluded.grade,class_no=excluded.class_no,seat_no=excluded.seat_no,last_seen=now()`;
  if(b.type==="question"){
   await sql`insert into learning_events(school_code,student_code,school_year,event_type,question_id,prompt,answer,correct,retries,help,manual_confirm,volume)
    values(${schoolCode},${code},${schoolYear},'question',${String(b.questionId||"").slice(0,120)},${String(b.prompt||"").slice(0,240)},${String(b.answer||"").slice(0,24)},${!!b.correct},${Math.max(0,Math.min(20,Number(b.retries)||0))},${!!b.help},${!!b.manualConfirm},${String(b.volume||"").slice(0,20)})`;
  }else if(b.type==="session"){
   await sql`insert into learning_events(school_code,student_code,school_year,event_type,volume,total,correct_no_help,help_count,retry_count)
    values(${schoolCode},${code},${schoolYear},'session',${String(b.volume||"").slice(0,20)},${Math.max(0,Number(b.total)||0)},${Math.max(0,Number(b.correctNoHelp)||0)},${Math.max(0,Number(b.helpCount)||0)},${Math.max(0,Number(b.retryCount)||0)})`;
  }else if(b.type!=="login")return json(res,400,{error:"invalid event type"});
  return json(res,200,{ok:true});
 }catch(e){console.error("activity save failed",e);return json(res,500,{error:"save failed"})}
};