const {db,safeEq}=require("./_common");
const {schoolYearFor}=require("./_schoolyear");
module.exports=async(req,res)=>{
  const auth=(req.headers.authorization||"").replace(/^Bearer\s+/,"");
  if(!process.env.CRON_SECRET||!safeEq(auth,process.env.CRON_SECRET)){
    res.statusCode=401;return res.end("unauthorized");
  }
  try{
    const current=schoolYearFor(),previous=current-1;
    // Safety: never delete before May 1 JST.
    const jst=new Date(Date.now()+9*3600000);
    if(jst.getUTCMonth()+1<5){res.statusCode=200;return res.end(JSON.stringify({ok:true,deleted:false,reason:"grace period"}))}
    const sql=db();
    await sql`delete from students where school_year <= ${previous}`;
    res.statusCode=200;res.setHeader("Content-Type","application/json");
    res.end(JSON.stringify({ok:true,deleted:true,throughSchoolYear:previous}));
  }catch(e){console.error(e);res.statusCode=500;res.end("cleanup failed")}
};
