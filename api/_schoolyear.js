function schoolYearFor(date=new Date()){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const y=Number(parts.find(x=>x.type==="year").value);
  const m=Number(parts.find(x=>x.type==="month").value);
  return m>=4?y:y-1;
}
function previousYearDeleteAt(year){ return `${year+1}-04-30T15:00:00.000Z`; } // May 1 00:00 JST
module.exports={schoolYearFor,previousYearDeleteAt};
