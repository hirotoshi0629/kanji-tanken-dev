const {db,safeEq}=require("./_common");
const {schoolYearFor}=require("./_schoolyear");

module.exports=async(req,res)=>{
  const auth=(req.headers.authorization||"").replace(/^Bearer\s+/,"");
  if(!process.env.CRON_SECRET||!safeEq(auth,process.env.CRON_SECRET)){
    res.statusCode=401;return res.end("unauthorized");
  }

  try{
    const current=schoolYearFor();

    // Keep a child's elementary-school learning history for up to six school years.
    // Example: during 2031, keep 2026-2031 and remove 2025 or older.
    // This replaces the old behavior that deleted all previous school years.
    const oldestSchoolYearToKeep=current-5;
    const deleteThrough=oldestSchoolYearToKeep-1;

    // Safety: never delete before May 1 JST.
    const jst=new Date(Date.now()+9*3600000);
    if(jst.getUTCMonth()+1<5){
      res.statusCode=200;
      res.setHeader("Content-Type","application/json");
      return res.end(JSON.stringify({
        ok:true,
        deleted:false,
        reason:"grace period",
        retentionSchoolYears:6,
        oldestSchoolYearToKeep
      }));
    }

    const sql=db();

    // learning_events are deleted automatically by the students FK (ON DELETE CASCADE).
    // Never touch any of the most recent six school years.
    await sql`delete from students where school_year <= ${deleteThrough}`;

    res.statusCode=200;
    res.setHeader("Content-Type","application/json");
    res.end(JSON.stringify({
      ok:true,
      deleted:true,
      retentionSchoolYears:6,
      deletedThroughSchoolYear:deleteThrough,
      oldestSchoolYearKept:oldestSchoolYearToKeep
    }));
  }catch(e){
    console.error(e);
    res.statusCode=500;
    res.end("cleanup failed");
  }
};
