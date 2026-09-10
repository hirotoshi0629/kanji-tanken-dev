const crypto=require("crypto");
const {neon}=require("@neondatabase/serverless");
const DATABASE_URL=process.env.DATABASE_URL;
const TOKEN_SECRET=process.env.TEACHER_TOKEN_SECRET;
function json(res,status,data){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(data));}
function safeEq(a,b){const aa=Buffer.from(String(a||"")),bb=Buffer.from(String(b||""));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}
function sign(payload){if(!TOKEN_SECRET)throw new Error("TEACHER_TOKEN_SECRET is not configured");const body=Buffer.from(JSON.stringify(payload)).toString("base64url");const sig=crypto.createHmac("sha256",TOKEN_SECRET).update(body).digest("base64url");return body+"."+sig}
function verify(token){try{if(!TOKEN_SECRET)return null;const [body,sig]=String(token||"").split(".");if(!body||!sig)return null;const want=crypto.createHmac("sha256",TOKEN_SECRET).update(body).digest("base64url");if(!safeEq(sig,want))return null;const p=JSON.parse(Buffer.from(body,"base64url").toString());return p.schoolCode&&p.role&&p.teacherId&&p.exp>Date.now()?p:null}catch{return null}}
function db(){if(!DATABASE_URL)throw new Error("DATABASE_URL is not configured");return neon(DATABASE_URL)}
function hashPassword(password,salt=crypto.randomBytes(16).toString("hex")){const hash=crypto.scryptSync(String(password),salt,64).toString("hex");return {salt,hash}}
function verifyPassword(password,salt,hash){return safeEq(hashPassword(password,salt).hash,hash)}
module.exports={json,safeEq,sign,verify,db,hashPassword,verifyPassword,TOKEN_SECRET};
