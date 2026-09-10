const {verify,db}=require("./_common");
const {schoolYearFor}=require("./_schoolyear");
module.exports=async(req,res)=>{
  if(req.method!=="GET"){res.statusCode=405;return res.end("method")}
  const token=(req.headers.authorization||"").replace(/^Bearer\s+/,"");
  const me=verify(token);if(!me){res.statusCode=401;return res.end("unauthorized")}
  try{
    const current=schoolYearFor(),year=Math.min(current-1,Number(req.query?.year)||current-1),sql=db();
    const rows=await sql`
      select school_year,student_code,grade,class_no,seat_no,last_seen,
             questions,mistakes_or_retries,manual_confirms
      from yearly_student_summary where school_code=${me.schoolCode} and school_year=${year} and (${me.role}='admin' or (grade=${me.grade} and class_no=${me.classNo}))
      order by grade,class_no,seat_no
    `;
    const esc=v=>`"${String(v??"").replace(/"/g,'""')}"`;
    const head=["年度","児童コード","学年","組","番号","最終利用","問題数","再挑戦等","本人確認"];
    const csv="\uFEFF"+[head.map(esc).join(","),...rows.map(r=>[
      r.school_year,r.student_code,r.grade,r.class_no,r.seat_no,r.last_seen,
      r.questions,r.mistakes_or_retries,r.manual_confirms
    ].map(esc).join(","))].join("\r\n");
    res.statusCode=200;res.setHeader("Content-Type","text/csv; charset=utf-8");
    res.setHeader("Content-Disposition",`attachment; filename="kanji-tanken-${year}.csv"`);
    res.end(csv);
  }catch(e){console.error(e);res.statusCode=500;res.end("export failed")}
};
