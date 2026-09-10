const {json,verify,db}=require("./_common");
const {schoolYearFor,previousYearDeleteAt}=require("./_schoolyear");

module.exports=async(req,res)=>{
  if(req.method!=="GET")return json(res,405,{error:"method"});
  const token=(req.headers.authorization||"").replace(/^Bearer\s+/,"");
  const me=verify(token);
  if(!me)return json(res,401,{error:"unauthorized"});

  try{
    const sql=db(),schoolYear=schoolYearFor();
    let students,events;
    if(me.role==="admin"){
      students=await sql`
        select student_code,grade,class_no,seat_no,last_seen
        from students
        where school_code=${me.schoolCode} and school_year=${schoolYear}
        order by grade asc,class_no asc,seat_no asc
      `;
      events=await sql`
        select student_code,event_type,question_id,prompt,answer,retries,help,manual_confirm,created_at
        from learning_events
        where school_code=${me.schoolCode}
          and event_type='question'
          and school_year=${schoolYear}
          and created_at >= now() - interval '31 days'
        order by created_at desc
        limit 10000
      `;
    }else{
      students=await sql`
        select student_code,grade,class_no,seat_no,last_seen
        from students
        where school_code=${me.schoolCode}
          and school_year=${schoolYear}
          and grade=${me.grade}
          and class_no=${me.classNo}
        order by seat_no asc
      `;
      events=await sql`
        select e.student_code,e.event_type,e.question_id,e.prompt,e.answer,e.retries,e.help,e.manual_confirm,e.created_at
        from learning_events e
        join students s
          on s.school_code=e.school_code
         and s.student_code=e.student_code
         and s.school_year=e.school_year
        where e.school_code=${me.schoolCode}
          and e.event_type='question'
          and e.school_year=${schoolYear}
          and s.grade=${me.grade}
          and s.class_no=${me.classNo}
          and e.created_at >= now() - interval '31 days'
        order by e.created_at desc
        limit 10000
      `;
    }

    const now=Date.now(),day=86400000;
    const build=days=>{
      const cutoff=now-days*day,by={};
      for(const s of students){
        by[s.student_code]={
          ...s,questions:0,mistakes:0,manual:0,helpCount:0,
          activeDays:new Set(),recent:[],daily:{}
        };
      }
      const trend={},aiReview={};
      for(const e of events){
        const t=new Date(e.created_at).getTime();
        if(t<cutoff)continue;
        const x=by[e.student_code];if(!x)continue;
        x.questions++;
        const bad=(e.retries||0)>0||e.help||e.manual_confirm;
        if(bad)x.mistakes++;
        if(e.help)x.helpCount++;
        if(e.manual_confirm)x.manual++;

        const dk=new Date(e.created_at).toLocaleDateString("ja-JP",{timeZone:"Asia/Tokyo"});
        x.activeDays.add(dk);
        x.daily[dk]??={questions:0,mistakes:0,manual:0,help:0,events:[]};
        const d=x.daily[dk];
        d.questions++;
        if(bad)d.mistakes++;
        if(e.manual_confirm)d.manual++;
        if(e.help)d.help++;
        if(d.events.length<50)d.events.push(e);
        if(x.recent.length<50&&bad)x.recent.push(e);

        if(bad){
          const k=e.answer||e.question_id||"不明";
          trend[k]=(trend[k]||0)+1;
        }
        if(e.manual_confirm){
          const k=e.answer||e.question_id||"不明";
          aiReview[k]=(aiReview[k]||0)+1;
        }
      }
      const studentRows=Object.values(by).map(x=>({...x,activeDays:x.activeDays.size}));
      return {
        students:studentRows,
        trend:Object.entries(trend).sort((a,b)=>b[1]-a[1]).slice(0,10),
        aiReview:Object.entries(aiReview).sort((a,b)=>b[1]-a[1]).slice(0,10)
      };
    };

    return json(res,200,{
      generatedAt:new Date().toISOString(),
      teacher:{schoolCode:me.schoolCode,teacherId:me.teacherId,role:me.role,grade:me.grade,classNo:me.classNo},
      schoolYear,
      previousSchoolYear:schoolYear-1,
      previousYearDeleteAt:previousYearDeleteAt(schoolYear-1),
      windows:{"7":build(7),"30":build(30)}
    });
  }catch(e){
    console.error("dashboard load failed",e);
    return json(res,500,{error:"load failed"});
  }
};
