const APP_VERSION="v4.0 LONG-TERM DEVICE SAFE";
const TEACHER_PRACTICE=new URLSearchParams(location.search).get("teacherPractice")==="1";
const URL_SCHOOL=(new URLSearchParams(location.search).get("school")||"").trim().toLowerCase();
if(URL_SCHOOL&&/^[a-z0-9_-]{2,32}$/.test(URL_SCHOOL))localStorage.setItem("kq.schoolCode",URL_SCHOOL);
const currentSchoolCode=()=>localStorage.getItem("kq.schoolCode")||"";
const STORE=TEACHER_PRACTICE?sessionStorage:localStorage;
const storeKey=k=>TEACHER_PRACTICE?`kq.teacherSandbox.${k}`:k;
const storage={
 getItem:k=>STORE.getItem(storeKey(k)),
 setItem:(k,v)=>STORE.setItem(storeKey(k),v),
 removeItem:k=>STORE.removeItem(storeKey(k))
};
const $=s=>document.querySelector(s);
const onIf=(selector,event,handler)=>{const el=$(selector);if(el)el.addEventListener(event,handler)};

const studentProfile=()=>{if(TEACHER_PRACTICE)return null;try{return JSON.parse(localStorage.getItem("kq.studentProfile")||"null")}catch{return null}};
function validStudentCode(s){return /^[1-6]-[1-9][0-9]?-[0-9]{1,3}$/.test(String(s||"").trim())}
async function syncLearningEvent(type,payload={}){
 if(TEACHER_PRACTICE)return;
 const p=studentProfile();if(!p||!validStudentCode(p.code)||!currentSchoolCode())return;
 try{await fetch("/api/activity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,teacherPractice:TEACHER_PRACTICE,schoolCode:p.schoolCode||currentSchoolCode(),studentCode:p.code,grade:+p.grade,classNo:+p.classNo,seatNo:+p.seatNo,...payload})})}
 catch(e){console.warn("学習記録を送信できませんでした",e)}
}
function openStudentSetup(){
  if(TEACHER_PRACTICE)return;
  if(!currentSchoolCode()){alert("学校用URLから開いてください。学校コードが設定されていません。");return;}
 const current=studentProfile()||{},raw=prompt("児童コードを入力してください（例：3-1-07）",current.code||"");if(raw===null)return;
 const code=raw.trim();if(!validStudentCode(code)){alert("「学年-組-番号」の形で入力してね。例：3-1-07");return}
 const [grade,classNo,seatNo]=code.split("-").map(Number);localStorage.setItem("kq.studentProfile",JSON.stringify({code,grade,classNo,seatNo,schoolCode:currentSchoolCode()}));
 renderStudentProfile();syncLearningEvent("login");
}
function renderStudentProfile(){const p=studentProfile(),el=$("#studentCodeStatus");if(!el)return;if(TEACHER_PRACTICE){el.textContent=`先生のおためしモード（学校：${currentSchoolCode()}）`;return}el.textContent=p?`児童コード：${p.code} ／ 学校：${p.schoolCode||currentSchoolCode()}`:currentSchoolCode()?`児童コード：未登録 ／ 学校：${currentSchoolCode()}`:"学校用URLから開いてください"}

function safeJSON(key,fallback){try{const raw=localStorage.getItem(key);return raw==null?fallback:JSON.parse(raw)}catch(e){console.warn("保存データを安全に初期化しました:",key);return fallback}}
const state={master:null,bank:null,grade:3,volume:"三上",questions:[],index:0,points:+storage.getItem("kq.points")||0,totalEarned:+storage.getItem("kq.totalEarned")||(+storage.getItem("kq.points")||0),experience:+storage.getItem("kq.exp")||0,discovered:new Set(safeJSON("kq.discovered",[])),sessions:+storage.getItem("kq.sessions")||0,boxes:[],activeBox:0,answerRevealed:false,sessionResults:[],questionRetries:0,petId:storage.getItem("kq.petId")||"fox",petFriendships:safeJSON("kq.petFriendships",{}),petCare:safeJSON("kq.petCare",{}),careTickets:Number(storage.getItem("kq.careTickets")||0),daily:safeJSON("kq.daily",{}),records:safeJSON("kq.records",{totalQuestions:0,totalCorrect:0,streak:0,lastStudy:""}),weak:safeJSON("kq.weak",{}),room:safeJSON("kq.room",{studyQuestions:0,missionsClaimed:{},owned:["bed_basic"],equipped:["bed_basic"],positions:{},album:[],readLetters:{},surprises:{}}),weakMode:false,checking:false,questionCompleted:false};
const pets=[{id:'fox',name:'きつね',emoji:'🦊',unlock:0},{id:'cat',name:'ねこ',emoji:'🐱',unlock:20},{id:'rabbit',name:'うさぎ',emoji:'🐰',unlock:40},{id:'dog',name:'いぬ',emoji:'🐶',unlock:60},{id:'hamster',name:'ハムスター',emoji:'🐹',unlock:80},{id:'mouse',name:'ねずみ',emoji:'🐭',unlock:100},{id:'squirrel',name:'りす',emoji:'🐿️',unlock:125},{id:'hedgehog',name:'ハリネズミ',emoji:'🦔',unlock:150},{id:'otter',name:'カワウソ',emoji:'🦦',unlock:175},{id:'raccoon',name:'アライグマ',emoji:'🦝',unlock:200},{id:'panda',name:'パンダ',emoji:'🐼',unlock:230},{id:'koala',name:'コアラ',emoji:'🐨',unlock:260},{id:'bear',name:'くま',emoji:'🐻',unlock:290},{id:'polar',name:'しろくま',emoji:'🐻\u200d❄️',unlock:320},{id:'monkey',name:'さる',emoji:'🐵',unlock:350},{id:'gorilla',name:'ゴリラ',emoji:'🦍',unlock:380},{id:'sloth',name:'ナマケモノ',emoji:'🦥',unlock:410},{id:'deer',name:'しか',emoji:'🦌',unlock:440},{id:'boar',name:'いのしし',emoji:'🐗',unlock:470},{id:'pig',name:'ぶた',emoji:'🐷',unlock:500},{id:'cow',name:'うし',emoji:'🐮',unlock:540},{id:'horse',name:'うま',emoji:'🐴',unlock:580},{id:'goat',name:'やぎ',emoji:'🐐',unlock:620},{id:'sheep',name:'ひつじ',emoji:'🐑',unlock:660},{id:'alpaca',name:'アルパカ',emoji:'🦙',unlock:700},{id:'camel',name:'ラクダ',emoji:'🐫',unlock:740},{id:'elephant',name:'ぞう',emoji:'🐘',unlock:780},{id:'giraffe',name:'キリン',emoji:'🦒',unlock:820},{id:'zebra',name:'しまうま',emoji:'🦓',unlock:860},{id:'hippo',name:'カバ',emoji:'🦛',unlock:900},{id:'rhino',name:'サイ',emoji:'🦏',unlock:950},{id:'kangaroo',name:'カンガルー',emoji:'🦘',unlock:1000},{id:'lion',name:'ライオン',emoji:'🦁',unlock:1050},{id:'tiger',name:'トラ',emoji:'🐯',unlock:1100},{id:'leopard',name:'ヒョウ',emoji:'🐆',unlock:1150},{id:'wolf',name:'オオカミ',emoji:'🐺',unlock:1200},{id:'eagle',name:'ワシ',emoji:'🦅',unlock:1250},{id:'owl',name:'ふくろう',emoji:'🦉',unlock:1300},{id:'penguin',name:'ペンギン',emoji:'🐧',unlock:1350},{id:'flamingo',name:'フラミンゴ',emoji:'🦩',unlock:1400},{id:'duck',name:'あひる',emoji:'🦆',unlock:1450},{id:'chick',name:'ひよこ',emoji:'🐥',unlock:1500},{id:'parrot',name:'オウム',emoji:'🦜',unlock:1550},{id:'turtle',name:'かめ',emoji:'🐢',unlock:1600},{id:'frog',name:'かえる',emoji:'🐸',unlock:1650},{id:'crocodile',name:'ワニ',emoji:'🐊',unlock:1700},{id:'dolphin',name:'イルカ',emoji:'🐬',unlock:1750},{id:'whale',name:'くじら',emoji:'🐳',unlock:1800},{id:'seal',name:'アザラシ',emoji:'🦭',unlock:1850},{id:'octopus',name:'たこ',emoji:'🐙',unlock:1900},
{id:'rooster',name:'にわとり',emoji:'🐔',unlock:1950},{id:'turkey',name:'しちめんちょう',emoji:'🦃',unlock:2000},
{id:'peacock',name:'くじゃく',emoji:'🦚',unlock:2050},{id:'swan',name:'はくちょう',emoji:'🦢',unlock:2100},
{id:'goose',name:'がちょう',emoji:'🪿',unlock:2150},{id:'dove',name:'はと',emoji:'🕊️',unlock:2200},
{id:'bat',name:'こうもり',emoji:'🦇',unlock:2250},{id:'beaver',name:'ビーバー',emoji:'🦫',unlock:2300},
{id:'skunk',name:'スカンク',emoji:'🦨',unlock:2350},{id:'badger',name:'アナグマ',emoji:'🦡',unlock:2400},
{id:'moose',name:'ヘラジカ',emoji:'🫎',unlock:2450},{id:'bison',name:'バイソン',emoji:'🦬',unlock:2500},
{id:'llama',name:'リャマ',emoji:'🦙',unlock:2550},{id:'donkey',name:'ロバ',emoji:'🫏',unlock:2600},
{id:'orangutan',name:'オランウータン',emoji:'🦧',unlock:2650},{id:'mammoth',name:'マンモス',emoji:'🦣',unlock:2700},
{id:'shark',name:'サメ',emoji:'🦈',unlock:2750},{id:'orca',name:'シャチ',emoji:'🐋',unlock:2800},
{id:'squid',name:'イカ',emoji:'🦑',unlock:2850},{id:'crab',name:'カニ',emoji:'🦀',unlock:2900},
{id:'lobster',name:'ロブスター',emoji:'🦞',unlock:2950},{id:'shrimp',name:'エビ',emoji:'🦐',unlock:3000},
{id:'jellyfish',name:'クラゲ',emoji:'🪼',unlock:3050},{id:'seahorse',name:'タツノオトシゴ',emoji:'🐠',unlock:3100},
{id:'butterfly',name:'ちょう',emoji:'🦋',unlock:3150},{id:'bee',name:'みつばち',emoji:'🐝',unlock:3200},
{id:'ladybug',name:'てんとうむし',emoji:'🐞',unlock:3250},{id:'snail',name:'かたつむり',emoji:'🐌',unlock:3300},
{id:'dragon',name:'ドラゴン',emoji:'🐲',unlock:3500},{id:'unicorn',name:'ユニコーン',emoji:'🦄',unlock:4000}];
function currentPet(){return pets.find(p=>p.id===state.petId)||pets[0]}
function currentFriendship(){return +(state.petFriendships[state.petId]||0)}
function petStage(){const f=currentFriendship();return f<25?"であったばかり":f<55?"なかよし":f<85?"だいのなかよし":"さいこうの相棒"}
function petStageIcon(){const f=currentFriendship();return f<25?"🌱":f<55?"⭐":f<85?"💖":"👑"}
function unlockedPets(){return pets.filter(p=>state.totalEarned>=p.unlock||p.id===state.petId)}
function nextLockedPet(){return pets.find(p=>state.totalEarned<p.unlock)}
function updateUnlockBaseline(){if(storage.getItem("kq.unlockBaseline")==null)storage.setItem("kq.unlockBaseline",String(unlockedPets().length))}
function checkNewAnimalUnlocks(){const before=+(storage.getItem("kq.unlockBaseline")||0),now=unlockedPets().length;if(now>before){const newly=pets.filter((p,i)=>i>=before&&i<now);storage.setItem("kq.unlockBaseline",String(now));showUnlockCelebration(newly)}else if(now<before)storage.setItem("kq.unlockBaseline",String(now))}
function showUnlockCelebration(list){if(!list.length)return;if(list.some(p=>["dragon","unicorn"].includes(p.id)))setTimeout(()=>alert("✨🌈 とくべつな仲間がやってきた！ 🌈✨\n\nレアなどうぶつとの新しいぼうけんが始まるよ！"),150);const m=$("#unlockModal"),body=$("#unlockBody");if(!m||!body)return;body.innerHTML=list.map(p=>`<div class="unlockPet"><span>${p.emoji}</span><b>${p.name}</b></div>`).join("");m.classList.remove("hidden")}


function dayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function yesterdayKey(){const d=new Date();d.setDate(d.getDate()-1);return dayKey(d)}
function ensureDaily(){const k=dayKey();if(state.daily.date!==k)state.daily={date:k,questions:0,sets:0,bonus:false}}
function badgeDefs(){return [{icon:"🌱",name:"はじめの一歩",ok:state.sessions>=1},{icon:"🔥",name:"3日れんぞく",ok:(state.records.streak||0)>=3},{icon:"💯",name:"100問チャレンジ",ok:(state.records.totalQuestions||0)>=100},{icon:"✍️",name:"漢字50字発見",ok:state.discovered.size>=50},{icon:"🐾",name:"どうぶつ10匹",ok:unlockedPets().length>=10},{icon:"🦁",name:"どうぶつ25匹",ok:unlockedPets().length>=25},{icon:"🏆",name:"どうぶつ博士",ok:unlockedPets().length>=50},{icon:"🌟",name:"どうぶつ大博士",ok:unlockedPets().length>=75},{icon:"👑",name:"さいこうの相棒",ok:Object.values(state.petFriendships).some(v=>+v>=85)}]}
function renderMotivation(){ensureDaily();const d=$("#dailyChallenge");if(d){d.className=`dailyChallenge ${state.daily.bonus?"done":""}`;d.innerHTML=state.daily.bonus?"✅ 今日のチャレンジ達成！ また明日も会おう！":`🎯 今日10問クリアで <b>+5 PT</b> ボーナス　（今日 ${state.daily.questions||0}問）`;}const tq=$("#todayQuestions"),aq=$("#totalQuestions"),tc=$("#totalCorrect"),sd=$("#streakDays");if(tq)tq.textContent=state.daily.questions||0;if(aq)aq.textContent=state.records.totalQuestions||0;if(tc)tc.textContent=state.records.totalCorrect||0;if(sd)sd.textContent=state.records.streak||0;const weakN=Object.values(state.weak).filter(v=>v>0).length;const wt=$("#weakCountText"),wb=$("#weakRetryBtn");if(wt)wt.textContent=weakN?`いま ${weakN}字を復習できます。`:"にがて漢字はまだありません。";if(wb)wb.disabled=!weakN;const bl=$("#badgeList");if(bl)bl.innerHTML=badgeDefs().map(b=>`<span class="badgeChip ${b.ok?"earned":""}">${b.ok?b.icon:"🔒"} ${b.name}</span>`).join("")}
function completeDailySet(){ensureDaily();state.daily.sets=(state.daily.sets||0)+1;let bonus=0;if(!state.daily.bonus){state.daily.bonus=true;bonus=5;state.points+=bonus;state.totalEarned+=bonus}const today=dayKey();if(state.records.lastStudy!==today){state.records.streak=state.records.lastStudy===yesterdayKey()?(state.records.streak||0)+1:1;state.records.lastStudy=today}return bonus}
function startWeakSet(){const keys=Object.keys(state.weak).filter(k=>state.weak[k]>0);if(!keys.length)return;const pool=shuffle(state.bank.questions.filter(q=>keys.includes(q.targetKanji)&&q.reviewStatus==="reviewed"&&questionIntegrityValid(q)));const used=new Set(),out=[];for(const q of pool){if(used.has(q.targetKanji))continue;used.add(q.targetKanji);out.push(q);if(out.length===10)break}if(!out.length)return;state.weakMode=true;state.questions=out;state.index=0;state.sessionResults=[];$("#homeView").classList.add("hidden");$("#resultView").classList.add("hidden");$("#practiceView").classList.remove("hidden");renderQuestion()}

const volumeByGrade={1:["一上","一下","上下ミックス"],2:["二上","二下","上下ミックス"],3:["三上","三下","上下ミックス"],4:["四上","四下","上下ミックス"],5:["五"],6:["六"]};
function updateAIConnectionUI(){const p=$("#aiConnPill");if(p){p.textContent="無料・端末内判定";p.style.background="#e9f8ef"}}
async function init(){try{[state.master,state.bank]=await Promise.all([fetch("./data/kanji_master.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("kanji master load failed");return r.json()}),fetch("./data/reviewed_problem_bank.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("problem bank load failed");return r.json()})]);buildGradeButtons();renderVolumes();renderHomeStats();renderMotivation();updateReady();updateAIConnectionUI();updateUnlockBaseline()}catch(e){console.error(e);const t=$("#readyText");if(t){t.textContent="教材の読み込みに失敗しました。画面を更新してください。";t.className="status-warn"}const b=$("#startBtn");if(b)b.disabled=true}if("serviceWorker" in navigator){try{const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.update();await navigator.serviceWorker.register("./service-worker.js")}catch(e){console.warn(e)}}}
function buildGradeButtons(){const row=$("#gradeRow");row.innerHTML="";for(let g=1;g<=6;g++){const b=document.createElement("button");b.textContent=`${g}年`;b.className="gradeBtn";if(g===state.grade)b.classList.add("active");b.onclick=()=>{state.grade=g;state.volume=volumeByGrade[g][0];buildGradeButtons();renderVolumes();updateReady()};row.appendChild(b)}}
function renderVolumes(){const row=$("#volumeRow");row.innerHTML="";for(const v of volumeByGrade[state.grade]){const b=document.createElement("button");b.textContent=v;b.className="volBtn";if(v===state.volume)b.classList.add("active");b.onclick=()=>{state.volume=v;renderVolumes();updateReady()};row.appendChild(b)}}
function questionIntegrityValid(q){
  try{
    const target=q.targetKanji||"",answer=q.handwritingAnswer||q.expectedAnswer||target;
    const matches=(q.displaySentence||"").match(/【([^】]+)】/g)||[];
    if(matches.length!==1||!target||!answer)return false;
    if(q.questionType==="compound"||q.answerScope==="compound"){
      if(answer!==target||!/^[\p{Script=Han}]{2,4}$/u.test(answer))return false;
      return q.quality?.answerScopeValidated!==false;
    }
    if(!answer.startsWith(target))return false;
    const tail=answer.slice(target.length);
    if(/[\p{Script=Han}]/u.test(tail))return false;
    if(tail&&!/^[ぁ-ゖァ-ヺーゝゞヽヾ]+$/.test(tail))return false;
    return q.quality?.answerScopeValidated!==false;
  }catch(e){return false}
}
function selectedVolumes(){
  if(state.volume!=="上下ミックス")return[state.volume];
  return [`${state.grade}上`.replace("1","一").replace("2","二").replace("3","三").replace("4","四"),
          `${state.grade}下`.replace("1","一").replace("2","二").replace("3","三").replace("4","四")];
}
function reviewedForVolume(){
  const vols=selectedVolumes();
  return state.bank.questions.filter(q=>vols.includes(q.introVolume)&&q.reviewStatus==="reviewed"&&q.quality?.naturalJapanese&&q.quality?.shortEnoughForIPad&&q.quality?.singleTarget&&!q.quality?.runtimeGenerated&&questionIntegrityValid(q))
}
function updateReady(){
  if(!state.bank)return;
  const list=reviewedForVolume(),uniq=new Set(list.map(q=>q.targetKanji)),ok=uniq.size>=10;
  if(state.volume==="上下ミックス"){
    const [up,down]=selectedVolumes();
    const u=new Set(state.bank.questions.filter(q=>q.introVolume===up&&questionIntegrityValid(q)&&q.reviewStatus==="reviewed").map(q=>q.targetKanji)).size;
    const d=new Set(state.bank.questions.filter(q=>q.introVolume===down&&questionIntegrityValid(q)&&q.reviewStatus==="reviewed").map(q=>q.targetKanji)).size;
    $("#readyText").textContent=ok?`上 ${u}字＋下 ${d}字から、かたよりすぎない10問を出します。`:"上下ミックスは準備中です。";
  }else{
    $("#readyText").textContent=ok?`確認済み ${list.length}問（熟語問題を含む）。10問を用意できます。`:"この巻は準備中です。";
  }
  $("#readyText").className=ok?"status-ok":"status-warn";$("#startBtn").disabled=!ok
}
function renderHomeStats(){$("#points").textContent=state.points;const level=Math.floor(state.experience/20)+1;$("#level").textContent=level;$("#stage").textContent=`${petStageIcon()} ${petStage()}`;$("#growthBar").style.width=`${currentFriendship()}%`;$("#discoverCount").textContent=state.discovered.size;$("#sessionCount").textContent=state.sessions;const pet=currentPet();const pe=$("#partnerEmoji");if(pe)pe.textContent=pet.emoji}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function uniquePick(pool,count,used){
  const out=[];
  for(const q of shuffle([...pool])){
    if(used.has(q.targetKanji))continue;
    used.add(q.targetKanji);out.push(q);
    if(out.length===count)break;
  }
  return out;
}
function makeTen(){
  const key=q=>`${q.questionType==="compound"?"C":"K"}:${q.targetKanji}`;
  state.recentQuestionKeys=state.recentQuestionKeys||[];
  const recent=new Set(state.recentQuestionKeys.slice(-30));

  const pick=(src,n,used,out)=>{
    const shuffled=shuffle(src), fresh=shuffled.filter(q=>!recent.has(key(q))), old=shuffled.filter(q=>recent.has(key(q)));
    for(const q of [...fresh,...old]){const k=key(q);if(used.has(k))continue;used.add(k);out.push(q);if(--n<=0)break}
  };
  const pickBalanced=(pool,total)=>{
    const used=new Set(),out=[],g=state.grade;
    const singles=pool.filter(q=>q.questionType!=="compound");
    const two=pool.filter(q=>q.questionType==="compound"&&[...answerOf(q)].length===2);
    const three=pool.filter(q=>q.questionType==="compound"&&[...answerOf(q)].length===3);
    const four=pool.filter(q=>q.questionType==="compound"&&[...answerOf(q)].length>=4);
    // 低学年は二字中心。中・高学年ほど三字・四字以上も少しずつ入れる。
    if(g<=2){pick(two,3,used,out)}
    else if(g<=4){pick(two,2,used,out);pick(three,1,used,out)}
    else{pick(two,2,used,out);pick(three,1,used,out);pick(four,1,used,out)}
    pick(singles,total-out.length,used,out);
    if(out.length<total)pick([...two,...three,...four,...singles],total-out.length,used,out);
    return shuffle(out).slice(0,total);
  };
  if(state.volume!=="上下ミックス"){const out=pickBalanced(reviewedForVolume(),10);state.recentQuestionKeys.push(...out.map(key));state.recentQuestionKeys=state.recentQuestionKeys.slice(-60);return out;}
  const [up,down]=selectedVolumes();
  const upPool=state.bank.questions.filter(q=>q.introVolume===up&&q.reviewStatus==="reviewed"&&questionIntegrityValid(q));
  const downPool=state.bank.questions.filter(q=>q.introVolume===down&&q.reviewStatus==="reviewed"&&questionIntegrityValid(q));
  const out=shuffle([...pickBalanced(upPool,5),...pickBalanced(downPool,5)]).slice(0,10);state.recentQuestionKeys.push(...out.map(key));state.recentQuestionKeys=state.recentQuestionKeys.slice(-60);return out;
}
function startSet(){state.weakMode=false;state.questions=makeTen();state.index=0;state.sessionResults=[];state.questionRetries=0;$("#homeView").classList.add("hidden");$("#resultView").classList.add("hidden");$("#practiceView").classList.remove("hidden");renderQuestion()}
$("#startBtn").onclick=startSet;
const weakBtn=$("#weakRetryBtn");if(weakBtn)weakBtn.onclick=startWeakSet;
$("#animalRoomBtn").onclick=()=>{$("#homeView").classList.add("hidden");$("#animalView").classList.remove("hidden");renderAnimalRoom()};
$("#animalHomeBtn").onclick=()=>{$("#animalView").classList.add("hidden");$("#homeView").classList.remove("hidden");renderHomeStats()};
$("#homeBtn").onclick=()=>{$("#practiceView").classList.add("hidden");$("#homeView").classList.remove("hidden");renderHomeStats()};
function answerOf(q){return q.handwritingAnswer||q.expectedAnswer||q.targetKanji}
function isKanji(ch){return /\p{Script=Han}/u.test(ch)}
function splitAnswerSegments(answer){
  const chars=[...answer],segs=[];
  for(const ch of chars){
    const type=isKanji(ch)?"kanji":"okuri";
    if(type==="okuri"&&segs.length&&segs[segs.length-1].type==="okuri")segs[segs.length-1].expected+=ch;
    else segs.push({type,expected:ch});
  }
  return segs;
}
function renderSentence(q,answer){
  const src=q.displaySentence||"";
  const a=src.indexOf("【"),b=src.indexOf("】",a+1);
  if(a<0||b<0)return src;
  const before=src.slice(0,a),inside=src.slice(a+1,b),after=src.slice(b+1);
  const firstKanji=[...answer].find(isKanji)||q.targetKanji||"";
  const firstIdx=[...answer].findIndex(isKanji);
  const tail=firstIdx>=0?[...answer].slice(firstIdx+1).join(""):"";
  // For ordinary okurigana words (e.g. まも + った), underline the whole part the child writes.
  // Do not swallow following kanji, which could reveal a separate answer component.
  let extra="";
  if(tail && !/[\p{Script=Han}]/u.test(tail)){
    const kana=[...tail].join("");
    if(after.startsWith(kana))extra=kana;
  }
  return `${before}<span class="target">${inside}${extra}</span>${after.slice(extra.length)}`;
}
function renderQuestion(){
  hideFeedback();
  state.checking=false;state.questionCompleted=false;
  state.answerRevealed=false;
  state.questionRetries=0;
  const revealBox=$("#revealedAnswer");if(revealBox){revealBox.classList.add("hidden");revealBox.textContent="";}
  const revealBtn=$("#revealBtn");if(revealBtn){revealBtn.disabled=false;}
  $("#undoBtn").disabled=false;$("#clearBtn").disabled=false;
  const q=state.questions[state.index],answer=answerOf(q),segments=splitAnswerSegments(answer);
  $("#qIndex").textContent=state.index+1;
  $("#qProgress").style.width=`${(state.index+1)/10*100}%`;
  $("#questionText").innerHTML=renderSentence(q,answer);
  const hasOkuri=segments.some(s=>s.type==="okuri");
  const kanjiCount=segments.filter(s=>s.type==="kanji").length;
  $("#writeGuide").textContent=hasOkuri?"漢字は1字ずつ、送りがなは横長のマスに書こう":kanjiCount>1?`${kanjiCount}字を、1マスに1字ずつ書こう`:"1マスに1字書こう";
  $("#nextBtn").classList.add("hidden");
  buildBoxes(segments);
  updateCheckButton();
}
function buildBoxes(segments){
  const wrap=$("#canvasWrap");wrap.innerHTML="";state.boxes=[];wrap.dataset.boxCount=segments.length;wrap.dataset.hasOkuri=segments.some(s=>s.type==="okuri")?"1":"0";
  segments.forEach((seg,i)=>{
    const cell=document.createElement("div");
    cell.className=`charCell ${seg.type==="okuri"?"okuriCell":"kanjiCell"}`;
    const badge=document.createElement("span");badge.className="charNo";badge.textContent=i+1;
    const writeArea=document.createElement("div");writeArea.className="writeArea";
    const c=document.createElement("canvas");c.id=`inkCanvas_${i}`;c.className=`inkCanvas ${seg.type==="okuri"?"okuriCanvas":"kanjiCanvas"}`;
    const repairArea=document.createElement("div");repairArea.className="repairArea";
    const status=document.createElement("div");status.className="boxStatus";status.setAttribute("aria-live","polite");
    const clearOne=document.createElement("button");clearOne.type="button";clearOne.className="clearOneBtn hidden";clearOne.textContent=seg.type==="okuri"?"この送りがなだけ消す":"この字だけ消す";
    writeArea.append(badge,c);
    repairArea.append(status,clearOne);
    cell.append(writeArea,repairArea);wrap.appendChild(cell);
    const box={canvas:c,ctx:c.getContext("2d"),strokes:[],current:null,expected:seg.expected,type:seg.type,cell,writeArea,repairArea,status,clearOne};
    clearOne.onclick=()=>clearOneBox(i);
    state.boxes.push(box);bindCanvas(box,i);
  });
  wrap.classList.toggle("hasOkuri",segments.some(s=>s.type==="okuri"));
  state.activeBox=0;requestAnimationFrame(()=>state.boxes.forEach(resizeBox));
}
function bindCanvas(box,i){const c=box.canvas;function pos(ev){const r=c.getBoundingClientRect();return{x:ev.clientX-r.left,y:ev.clientY-r.top,t:Date.now()}}c.addEventListener("pointerdown",ev=>{ev.preventDefault();state.activeBox=i;c.setPointerCapture(ev.pointerId);box.current=[pos(ev)];box.strokes.push(box.current);redrawBox(box)});c.addEventListener("pointermove",ev=>{if(!box.current)return;box.current.push(pos(ev));redrawBox(box)});c.addEventListener("pointerup",ev=>{if(box.current)box.current.push(pos(ev));box.current=null;redrawBox(box);updateCheckButton()});c.addEventListener("pointercancel",()=>{box.current=null});new ResizeObserver(()=>resizeBox(box)).observe(c)}
function resizeBox(box){const r=box.canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;if(r.width<1||r.height<1)return;box.canvas.width=Math.round(r.width*dpr);box.canvas.height=Math.round(r.height*dpr);box.ctx.setTransform(dpr,0,0,dpr,0,0);redrawBox(box)}
function redrawBox(box){const r=box.canvas.getBoundingClientRect(),ctx=box.ctx;ctx.clearRect(0,0,r.width,r.height);ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=7;ctx.strokeStyle="#17251e";for(const s of box.strokes){if(!s.length)continue;ctx.beginPath();ctx.moveTo(s[0].x,s[0].y);for(let i=1;i<s.length;i++)ctx.lineTo(s[i].x,s[i].y);ctx.stroke()}}
function updateCheckButton(){$("#checkBtn").disabled=!state.boxes.length||state.boxes.some(b=>b.strokes.length===0)}
function resetBoxRepairUI(box){
  if(!box)return;
  clearMistakeCircle(box);
  box.cell?.classList.remove("boxWrong","boxCorrect");box.writeArea?.classList.remove("writeWrong","writeCorrect");
  if(box.status){box.status.textContent="";box.status.className="boxStatus"}
  box.clearOne?.classList.add("hidden");
}
function clearOneBox(i){
  const box=state.boxes[i];if(!box)return;
  box.strokes=[];box.current=null;redrawBox(box);resetBoxRepairUI(box);
  state.activeBox=i;updateCheckButton();
}

function clearMistakeCircle(box){
  if(!box?.writeArea)return;
  box.writeArea.querySelectorAll(".mistakeCircle,.mistakeCircleLabel").forEach(x=>x.remove());
}
function suspectPointForBox(box,result){
  if(!box||box.type!=="kanji"||result?.unknown||!result?.got)return null;
  const strokes=(box.strokes||[]).filter(st=>st&&st.length>1);
  if(!strokes.length)return null;
  const all=strokes.flat(),xs=all.map(p=>p.x),ys=all.map(p=>p.y);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2,w=Math.max(1,maxX-minX),h=Math.max(1,maxY-minY);
  let best=null,bestScore=-Infinity;
  for(const st of strokes){
    const sx=st.map(p=>p.x),sy=st.map(p=>p.y);
    const scx=(Math.min(...sx)+Math.max(...sx))/2,scy=(Math.min(...sy)+Math.max(...sy))/2;
    let len=0;for(let i=1;i<st.length;i++)len+=Math.hypot(st[i].x-st[i-1].x,st[i].y-st[i-1].y);
    const dist=Math.hypot((scx-cx)/w,(scy-cy)/h);
    const shortness=1-Math.min(1,len/(Math.max(w,h)*1.2));
    const score=dist*.65+shortness*.35;
    if(score>bestScore){bestScore=score;best={x:scx,y:scy}}
  }
  return best;
}
function showMistakeCircle(box,result){
  clearMistakeCircle(box);
  const p=suspectPointForBox(box,result);
  if(!p)return false;
  const r=box.canvas.getBoundingClientRect();
  if(r.width<1||r.height<1)return false;
  const circle=document.createElement("div");
  circle.className="mistakeCircle";
  circle.style.left=`${Math.max(7,Math.min(93,p.x/r.width*100))}%`;
  circle.style.top=`${Math.max(7,Math.min(93,p.y/r.height*100))}%`;
  circle.setAttribute("aria-label","AIが見直してほしいところの目安");
  const label=document.createElement("div");
  label.className="mistakeCircleLabel";
  label.textContent="○ このあたりを、お手本とくらべてみよう";
  box.writeArea.append(circle,label);
  return true;
}
function markBoxResults(results){
  state.boxes.forEach((box,i)=>{
    resetBoxRepairUI(box);
    const r=results[i];
    if(!r)return;
    if(r.ok){
      box.cell?.classList.add("boxCorrect");box.writeArea?.classList.add("writeCorrect");
      if(box.status){box.status.textContent="✓ この字はOK";box.status.className="boxStatus boxStatusOk"}
    }else{
      box.cell?.classList.add("boxWrong");box.writeArea?.classList.add("writeWrong");
      const circled=showMistakeCircle(box,r);
      if(box.status){
        box.status.textContent=box.type==="okuri"?"↑ この送りがなを直そう":(circled?"○のあたりを、お手本とくらべてみよう":"↑ この字をお手本とくらべてみよう");
        box.status.className="boxStatus boxStatusWrong";
      }
      box.clearOne?.classList.remove("hidden");
    }
  });
}
function clearAll(){for(const b of state.boxes){b.strokes=[];b.current=null;redrawBox(b);resetBoxRepairUI(b)}updateCheckButton()}
$("#clearBtn").onclick=clearAll;
$("#undoBtn").onclick=()=>{const b=state.boxes[state.activeBox]||state.boxes.findLast?.(x=>x.strokes.length)||state.boxes[0];if(b){b.strokes.pop();redrawBox(b)}updateCheckButton()};
function persist(){storage.setItem("kq.points",state.points);storage.setItem("kq.totalEarned",state.totalEarned);storage.setItem("kq.exp",state.experience);storage.setItem("kq.discovered",JSON.stringify([...state.discovered]));storage.setItem("kq.sessions",state.sessions);storage.setItem("kq.petId",state.petId);storage.setItem("kq.petFriendships",JSON.stringify(state.petFriendships));storage.setItem("kq.petCare",JSON.stringify(state.petCare));storage.setItem("kq.careTickets",state.careTickets);storage.setItem("kq.daily",JSON.stringify(state.daily));storage.setItem("kq.records",JSON.stringify(state.records));storage.setItem("kq.weak",JSON.stringify(state.weak));storage.setItem("kq.room",JSON.stringify(state.room))}

const careActions=[
{id:"feed",icon:"🍎",label:"ごはん",cost:5,gain:5,msg:"おいしそうに食べた！"},
{id:"water",icon:"🥤",label:"お水",cost:3,gain:3,msg:"ごくごく飲んで元気いっぱい！"},
{id:"pet",icon:"🖐️",label:"なでる",cost:2,gain:3,msg:"うれしそうにしている！"},
{id:"play",icon:"⚽",label:"あそぶ",cost:8,gain:7,msg:"いっしょに遊んで大よろこび！"},
{id:"brush",icon:"🪮",label:"ブラッシング",cost:6,gain:5,msg:"毛なみがピカピカになった！"},
{id:"clean",icon:"🧹",label:"おそうじ",cost:4,gain:4,msg:"おへやがきれいになった！"},
{id:"walk",icon:"🌳",label:"おさんぽ",cost:7,gain:6,msg:"いっしょにおさんぽして楽しかった！"},
{id:"sleep",icon:"🌙",label:"おひるね",cost:3,gain:3,msg:"すやすや休んで元気になった！"},
{id:"snack",icon:"🍪",label:"おやつ",cost:4,gain:4,msg:"おやつを食べてにっこり！"},
{id:"bath",icon:"🛁",label:"おふろ",cost:6,gain:5,msg:"さっぱりして気持ちよさそう！"},
{id:"ball",icon:"🥎",label:"ボールあそび",cost:7,gain:6,msg:"ボールを追いかけて大はしゃぎ！"},
{id:"talk",icon:"💬",label:"おはなし",cost:3,gain:4,msg:"いっしょにお話してうれしそう！"},
{id:"hide",icon:"📦",label:"かくれんぼ",cost:6,gain:6,msg:"見つけてもらって大よろこび！"},
{id:"music",icon:"🎵",label:"おんがく",cost:5,gain:5,msg:"リズムにのって楽しそう！"}
];
const careFavorites={dog:"walk",cat:"pet",rabbit:"brush",hamster:"feed",mouse:"feed",squirrel:"play",hedgehog:"pet",otter:"play",raccoon:"clean",panda:"feed",koala:"sleep",bear:"feed",polar:"play",monkey:"play",gorilla:"feed",sloth:"sleep",deer:"walk",boar:"feed",pig:"clean",cow:"brush",horse:"walk",goat:"feed",sheep:"brush",alpaca:"brush",camel:"water",elephant:"water",giraffe:"feed",zebra:"walk",hippo:"water",rhino:"clean",kangaroo:"play",lion:"play",tiger:"play",leopard:"walk",wolf:"walk",eagle:"play",owl:"sleep",penguin:"play",flamingo:"water",duck:"water",chick:"feed",parrot:"play",turtle:"sleep",frog:"water",crocodile:"feed",dolphin:"play",whale:"water",seal:"play",octopus:"play",fox:"walk"};
const MAX_FRIENDSHIP=500;
function friendshipLevel(f=currentFriendship()){return Math.min(50,1+Math.floor(f/10))}
function careData(){if(!state.petCare[state.petId])state.petCare[state.petId]={count:0,actions:{}};return state.petCare[state.petId]}
function favoriteCare(){return careFavorites[state.petId]||"play"}
function careReaction(){const f=currentFriendship();return f>=100?"ずっといっしょだよ！":f>=85?"きみは最高の相棒！":f>=55?"もっといっしょに遊びたいな！":f>=25?"会えるとうれしいな！":"これから仲よくなろうね！"}
function doCare(actionId){
 const a=careActions.find(x=>x.id===actionId);if(!a||state.points<a.cost)return;
 const fav=actionId===favoriteCare(),gain=a.gain+(fav?2:0),before=currentFriendship();
 state.points-=a.cost;state.petFriendships[state.petId]=Math.min(MAX_FRIENDSHIP,before+gain);state.experience+=gain;
 const cd=careData();cd.count=(cd.count||0)+1;cd.actions[actionId]=(cd.actions[actionId]||0)+1;persist();
 const extra=fav?" 💖 大好きなおせわ！ なかよしボーナス +2":"";
 $("#careMessage").textContent=`${currentPet().emoji} ${a.msg}${extra}`;
 renderAnimalRoom();renderHomeStats();
}
function renderCareButtons(){
 const wrap=$("#careGrid");if(!wrap)return;wrap.innerHTML="";
 const ticketMode=state.careTickets>0;
 for(const a of careActions){
   const b=document.createElement("button"),fav=a.id===favoriteCare();
   b.className=fav?"primary careAction":"secondary careAction";
   b.disabled=ticketMode?false:state.points<a.cost;
   b.innerHTML=`<span class="careIcon">${a.icon}</span><b>${a.label}${fav?" 💖":""}</b><small>${ticketMode?"🎟️ 1まい（PT不要）":`${a.cost} PT`} ・ なかよし +${a.gain}${fav?"+2":""}${ticketMode?"+2":""}</small>`;
   b.onclick=()=>ticketMode?useCareTicket(a.id):doCare(a.id);wrap.appendChild(b);
 }
 const t=$("#careTicketCount");if(t)t.textContent=state.careTickets;
 const guide=$("#careModeGuide");if(guide)guide.innerHTML=state.careTickets>0
 ?`🎟️ <b>チケットを使えるよ！</b> 今はどのおせわもPTを使いません。`
 :`💡 チケットは漢字を10問クリアするともらえるよ。今はPTでおせわできます。`;
}


const animalPersonalities={
dog:["げんき","おさんぽ名人"],cat:["のんびり","なでなで大好き"],rabbit:["やさしい","ふわふわ名人"],hamster:["くいしんぼう","もぐもぐ名人"],
mouse:["すばしっこい","小さなぼうけん家"],squirrel:["げんき","木の実ハンター"],hedgehog:["てれや","ちくちくガード"],otter:["あそび好き","水あそび名人"],
raccoon:["きれい好き","おそうじ名人"],panda:["のんびり","もぐもぐ名人"],koala:["ねむたがり","おひるね名人"],bear:["おおらか","森の力もち"],
polar:["げんき","氷のぼうけん家"],monkey:["いたずら好き","あそび名人"],gorilla:["たのもしい","ジャングルの力もち"],sloth:["のんびり","ゆっくり名人"],
deer:["おだやか","森のおさんぽ名人"],boar:["げんき","まっすぐ名人"],pig:["きれい好き","おそうじ上手"],cow:["おだやか","ブラッシング好き"],
horse:["げんき","かけっこ名人"],goat:["くいしんぼう","草はら名人"],sheep:["やさしい","ふわふわ名人"],alpaca:["おしゃれ","ふわふわスター"],
camel:["がまん強い","砂漠のぼうけん家"],elephant:["やさしい","水あそび名人"],giraffe:["おだやか","高いところ名人"],zebra:["げんき","草原ランナー"],
hippo:["のんびり","水あそび大好き"],rhino:["たのもしい","おそうじ隊長"],kangaroo:["げんき","ジャンプ名人"],lion:["ゆうかん","草原のリーダー"],
tiger:["ゆうかん","しましまハンター"],leopard:["すばやい","森のランナー"],wolf:["なかま思い","月夜のおさんぽ名人"],eagle:["ゆうかん","空のぼうけん家"],
owl:["ものしり","夜ふかし名人"],penguin:["あそび好き","氷すべり名人"],flamingo:["おしゃれ","水辺のスター"],duck:["げんき","水あそび名人"],
chick:["あまえんぼう","もぐもぐ名人"],parrot:["おしゃべり","お話名人"],turtle:["のんびり","ゆっくり名人"],frog:["げんき","水辺のジャンプ名人"],
crocodile:["たのもしい","大きなお口名人"],dolphin:["あそび好き","海のジャンプ名人"],whale:["おおらか","海のうた名人"],seal:["あまえんぼう","海のあそび名人"],
octopus:["いたずら好き","八本足のあそび名人"],fox:["かしこい","森のおさんぽ名人"]
};
function animalPersonality(){return animalPersonalities[state.petId]||["げんき","ぼうけん家"]}
function collectionStats(){
 const unlocked=unlockedPets().length;
 const bond2=pets.filter(p=>bondRank(state.petFriendships[p.id]||0).lv>=2).length;
 const bond3=pets.filter(p=>bondRank(state.petFriendships[p.id]||0).lv>=3).length;
 const masters=masterPets().length;
 return {unlocked,bond2,bond3,masters};
}
function collectionTitle(s){
 if(s.masters>=50)return ["🏆","どうぶつマスター"];
 if(s.masters>=10)return ["👑","相棒マスター"];
 if(s.bond3>=10)return ["🎀","おせわ名人"];
 if(s.bond2>=5)return ["💬","なかよし名人"];
 if(s.unlocked>=10)return ["🐾","どうぶつずき"];
 return ["🌱","新人おせわ係"];
}

function bondRank(f=currentFriendship()){
 if(f>=100)return {lv:5,name:"MASTER",icon:"🏅"};
 if(f>=85)return {lv:4,name:"大なかよし",icon:"💖"};
 if(f>=55)return {lv:3,name:"なかよし",icon:"⭐"};
 if(f>=25)return {lv:2,name:"おともだち",icon:"🌱"};
 return {lv:1,name:"はじめまして",icon:"🐾"};
}
function masterPets(){return pets.filter(p=>bondRank(state.petFriendships[p.id]||0).lv===5)}
function masterAccessory(p){
 const pool=["👑","🎀","🌸","🧣","🕶️","🎩","⭐","💎"];
 return pool[pets.findIndex(x=>x.id===p.id)%pool.length];
}
const masterTitles=[
 {need:1,icon:"🏅",name:"はじめてのMASTER"},
 {need:3,icon:"🐾",name:"なかよしトレーナー"},
 {need:10,icon:"👑",name:"相棒マスター"},
 {need:25,icon:"🌟",name:"どうぶつ育て名人"},
 {need:50,icon:"🏆",name:"どうぶつマスター"},
 {need:80,icon:"🌈",name:"かん字たんけん・どうぶつ王"}
];
const tripWorlds=[
 {need:1,icon:"🌳",name:"もりのひろば",gift:"🌿 もりのかざり"},
 {need:5,icon:"🌊",name:"うみのせかい",gift:"🐚 うみのかざり"},
 {need:15,icon:"❄️",name:"ゆきの国",gift:"⛄ ゆきのかざり"},
 {need:30,icon:"☁️",name:"そらの島",gift:"🌤️ そらのかざり"},
 {need:50,icon:"🚀",name:"うちゅうステーション",gift:"🪐 うちゅうのかざり"},
 {need:80,icon:"🌈",name:"にじの王国",gift:"✨ にじのかざり"}
];
function animalStory(p){
 const rank=bondRank(state.petFriendships[p.id]||0);
 const stories=[
  `「${p.name}と出会った！」 まだ少しどきどきしているみたい。`,
  `${p.name}が近くに来てくれるようになった。おともだちになれたね。`,
  `${p.name}が今日のできごとを話してくれた。いっしょにいるのが楽しいみたい！`,
  `${p.name}が大切な宝物を見せてくれた。とっても信頼してくれているよ。`,
  `${p.name}とさいこうの相棒になった！ これからもずっと一緒にぼうけんだ！`
 ];
 return {rank,text:stories[rank.lv-1]};
}
function ensureSecondChapter(){
 const r=todayRoom();r.secondChapter=r.secondChapter||{tripSeen:{},titlesSeen:{},eggIndex:0,eggStart:null,hatched:[]};
 const sc=r.secondChapter;
 if(unlockedPets().length===pets.length&&sc.eggStart==null)sc.eggStart=r.studyQuestions||0;
 return sc;
}
function eggInfo(){
 const sc=ensureSecondChapter(),defs=[
  {icon:"🌱🥚",name:"もりのたまご",need:500,baby:"🦊✨ ひかりの森っ子"},
  {icon:"🌊🥚",name:"うみのたまご",need:700,baby:"🐳✨ きらめき海っ子"},
  {icon:"⭐🥚",name:"ほしのたまご",need:1000,baby:"🌟🐲 ほしぞらドラゴン"}
 ];
 if(unlockedPets().length<pets.length)return {locked:true};
 if(sc.eggIndex>=defs.length)return {complete:true,hatched:sc.hatched};
 const d=defs[sc.eggIndex],progress=Math.max(0,(state.room.studyQuestions||0)-(sc.eggStart||0));
 return {...d,progress,pct:Math.min(100,Math.round(progress/d.need*100)),stage:progress>=d.need?"hatch":progress>=d.need*.5?"glow":progress>=d.need*.2?"crack":"egg"};
}
function hatchEgg(){
 const sc=ensureSecondChapter(),e=eggInfo();if(e.locked||e.complete||e.progress<e.need)return;
 sc.hatched.push({name:e.baby,at:new Date().toISOString()});sc.eggIndex++;sc.eggStart=state.room.studyQuestions||0;
 state.room.album.push({at:new Date().toISOString(),icon:"🐣",text:`${e.name}から ${e.baby} が生まれた！`});persist();
 alert(`🐣✨ たまごがかえった！\n\n${e.baby} が生まれたよ！\n新しいぼうけんの始まりだ！`);renderSecondChapter();renderMemoryBook();
}
function renderSecondChapter(){
 const box=$("#secondChapter");if(!box)return;
 const unlocked=unlockedPets().length;
 if(unlocked<pets.length){
   const pct=Math.round(unlocked/pets.length*100),next=nextLockedPet();
   box.innerHTML=`<div class="chapterHero lockedChapter"><span>✨</span><div><b>第二章はまだひみつ</b><small>${pets.length}しゅるいの仲間と出会うと、新しいぼうけんが始まるよ。</small></div></div>
   <div class="chapterLockedProgress"><div><b>${unlocked} / ${pets.length} なかま</b><small>${next?`次の仲間まで あと ${Math.max(0,next.unlock-state.totalEarned)} PT`:"もうすぐ第二章！"}</small></div><div class="chapterBar"><span style="width:${pct}%"></span></div></div>`;
   return;
 }
 const masters=masterPets(),story=animalStory(currentPet()),e=eggInfo();
 const stars="★".repeat(story.rank.lv)+"☆".repeat(5-story.rank.lv);
 box.innerHTML=`<div class="chapterHero"><span>✨</span><div><b>第二章・どうぶつマスターへの道</b><small>80しゅるいの仲間と出会った！ ここから相棒との物語がもっと深くなるよ。</small></div></div>
 <div class="chapterGrid">
  <section><h3>💖 ${currentPet().name}とのきずな</h3><div class="bondStars">${stars}</div><b>きずなLv.${story.rank.lv} ${story.rank.icon} ${story.rank.name}</b><p>${story.text}</p>${story.rank.lv===5?`<div class="masterAccessory">${currentPet().emoji} ${masterAccessory(currentPet())}<small>MASTERアクセサリー</small></div>`:""}</section>
  <section><h3>🏅 MASTER</h3><div class="chapterNumber">${masters.length} / ${pets.length}</div><p>さいこうの相棒になったどうぶつの数</p></section>
 </div>
 <section class="chapterSection"><h3>🏆 称号</h3><div class="titleShelf">${masterTitles.map(t=>`<div class="titleChip ${masters.length>=t.need?"got":"locked"}">${masters.length>=t.need?t.icon:"🔒"} ${masters.length>=t.need?t.name:`MASTER ${t.need}匹で解放`}</div>`).join("")}</div></section>
 <section class="chapterSection"><h3>🗺️ おでかけ</h3><div class="tripShelf">${tripWorlds.map(w=>`<button class="tripCard ${masters.length>=w.need?"open":"locked"}" ${masters.length>=w.need?`data-trip="${w.name}"`:"disabled"}><span>${masters.length>=w.need?w.icon:"🔒"}</span><b>${masters.length>=w.need?w.name:`MASTER ${w.need}匹`}</b><small>${masters.length>=w.need?w.gift:"まだ行けないよ"}</small></button>`).join("")}</div></section>
 <section class="chapterSection"><h3>🥚 ふしぎなたまご</h3>${e.complete?`<div class="eggCard"><div class="eggBig">🌈</div><b>3つのふしぎなたまごを育てきった！</b><small>${e.hatched.map(x=>x.name).join("・")}</small></div>`:
 `<div class="eggCard"><div class="eggBig ${e.stage}">${e.stage==="hatch"?"🐣":e.icon}</div><b>${e.name}</b><small>${e.progress} / ${e.need}問　${e.pct}%</small><div class="chapterBar"><span style="width:${e.pct}%"></span></div>${e.stage==="hatch"?'<button id="hatchEggBtn" class="primary">✨ たまごをかえす！</button>':`<small>あと ${Math.max(0,e.need-e.progress)}問で変化するよ</small>`}</div>`}</section>`;
 const hb=$("#hatchEggBtn");if(hb)hb.onclick=hatchEgg;
 document.querySelectorAll("[data-trip]").forEach(b=>b.onclick=()=>{const w=tripWorlds.find(x=>x.name===b.dataset.trip);if(w){const sc=ensureSecondChapter();sc.tripSeen=sc.tripSeen||{};const first=!sc.tripSeen[w.name];sc.tripSeen[w.name]=true;if(first)state.room.album.push({at:new Date().toISOString(),icon:w.icon,text:`${currentPet().name}と「${w.name}」へ初めておでかけした！ ${w.gift}を見つけた！`});persist();alert(`${w.icon} ${w.name}へおでかけ！\n\n${currentPet().emoji}といっしょに探検したよ！${first?`\n${w.gift}を見つけたよ！`:"\nまた遊びに来られたね！"}`);renderMemoryBook()}});
}
function renderAnimalCollection(){
 const p=animalPersonality(),tag=$("#petPersonality");if(tag)tag.textContent=`${p[0]} ・ ${p[1]}`;
 const s=collectionStats(),t=collectionTitle(s),title=$("#collectionTitle");if(title)title.textContent=`${t[0]} ${t[1]}`;
 const stats=$("#collectionStats");if(stats)stats.innerHTML=`<span>🐾 仲間 ${s.unlocked}/${pets.length}</span><span>🌱 おともだち以上 ${s.bond2}</span><span>⭐ なかよし以上 ${s.bond3}</span><span>🏅 MASTER ${s.masters}</span>`;
 const bar=$("#collectionBar");if(bar)bar.style.width=`${Math.round(s.unlocked/pets.length*100)}%`;
}
const growthRewards=[
  {level:3,icon:"💬",name:"なかよしトーク",desc:"特別なセリフがふえる"},
  {level:5,icon:"🎀",name:"おしゃれアイテム",desc:"相棒にアクセサリーがつく"},
  {level:8,icon:"✨",name:"キラキラリアクション",desc:"特別なリアクションが見られる"},
  {level:10,icon:"🏅",name:"なかよしメダル",desc:"10レベルのしるし"},
  {level:15,icon:"🧸",name:"おもちゃセット",desc:"おへやのおもちゃがふえる"},
  {level:20,icon:"🪄",name:"ふしぎなかざり",desc:"おへやをもっと楽しくできる"},
  {level:25,icon:"🎨",name:"カラフルルーム",desc:"特別な部屋かざりをゲット"},
  {level:30,icon:"🎵",name:"ハッピーミュージック",desc:"ごほうびリアクションがふえる"},
  {level:35,icon:"🌟",name:"スターアクセサリー",desc:"相棒がさらにキラキラ"},
  {level:40,icon:"🏠",name:"スペシャル家具",desc:"特別な家具をかいほう"},
  {level:45,icon:"💎",name:"なかよしジュエル",desc:"最高ランク目前のしるし"},
  {level:50,icon:"👑",name:"でんせつの相棒",desc:"Lv.50だけの特別なしるし"}
];
function unlockedRewardLevel(){return friendshipLevel()}
function nextGrowthReward(){
 const lv=friendshipLevel(),next=growthRewards.find(r=>r.level>lv);
 return next||null;
}
function growthAccessory(lv){
 if(lv>=10)return "👑";
 if(lv>=8)return "✨";
 if(lv>=5)return "🎀";
 return "";
}
function growthMood(lv){
 if(lv>=10)return "best";
 if(lv>=8)return "sparkle";
 if(lv>=5)return "happy";
 if(lv>=3)return "friend";
 return "new";
}
function growthTalk(){
  const lv=friendshipLevel(),pet=currentPet();
  const lines=
    lv>=50?["ここまでいっしょに育ったね！ でんせつの相棒だよ！","これからもずっと漢字の森を冒険しよう！"]:
    lv>=40?["おへやもぼくらの思い出でいっぱいだね！","もうすぐLv.50！ いっしょに行こう！"]:
    lv>=30?["きょうもいっしょに学べてうれしい！","もっともっと強くなれそう！"]:
    lv>=20?["新しいごほうび、わくわくするね！","おへやをもっとすてきにしよう！"]:
    lv>=10?["なかよしレベルがどんどん上がってる！","ぼくら、いいチームだね！"]:
    lv>=8?["きょうも会えてうれしい！✨","いっしょなら何でもできそう！"]:
    lv>=5?["おしゃれしてみたよ！","また遊ぼうね！"]:
    lv>=3?["もっとお話したいな！","またおせわしてくれる？"]:
    ["これから仲よくなろうね！","いっしょに勉強がんばろう！"];
  const cd=careData(),idx=(cd.count||0)%lines.length;
  return `${pet.emoji}「${lines[idx]}」`;
}
function renderGrowthRewards(){
 const wrap=$("#growthRewards");if(!wrap)return;
 const lv=friendshipLevel();const heroLv=$("#petHeroLevel");if(heroLv)heroLv.textContent=lv;
 wrap.innerHTML=growthRewards.map(r=>`<div class="growthReward ${lv>=r.level?"unlocked":"locked"}"><span>${r.icon}</span><div><b>Lv.${r.level} ${r.name}</b><small>${lv>=r.level?"かいほう済み！":r.desc}</small></div></div>`).join("");
 const next=nextGrowthReward(),txt=$("#nextGrowthText"),friend=currentFriendship();
 if(txt){
   if(!next)txt.textContent="👑 さいこうの相棒！ すべてのごほうびをかいほうしたよ。";
   else{
     const need=Math.max(0,(next.level-1)*10-friend);
     txt.textContent=`次は Lv.${next.level}「${next.name}」まで、なかよし あと ${need}！`;
   }
 }
 const rewardBar=$("#nextRewardBar");if(rewardBar){
   if(!next)rewardBar.style.width="100%";
   else{
     const target=(next.level-1)*10,base=Math.max(0,(friendshipLevel()-1)*10);
     rewardBar.style.width=`${Math.max(0,Math.min(100,Math.round((friend-base)/Math.max(1,target-base)*100)))}%`;
   }
 }
 const badge=$("#bestPartnerBadge");if(badge)badge.classList.toggle("hidden",lv<50);
 const acc=$("#petAccessory");if(acc)acc.textContent=growthAccessory(lv);
 const big=$("#petBig");if(big){big.dataset.mood=growthMood(lv);big.classList.toggle("petSparkle",lv>=8);}
 const talk=$("#petReaction");if(talk)talk.textContent=growthTalk();
}

const roomItems=[
 {id:"bed_basic",icon:"🛏️",name:"ふかふかベッド",need:0},
 {id:"ball_blue",icon:"⚽",name:"あそびボール",need:20},
 {id:"plant",icon:"🪴",name:"みどりのはちうえ",need:40},
 {id:"rug",icon:"🟨",name:"ふわふわラグ",need:60},
 {id:"books",icon:"📚",name:"えほんだな",need:100},
 {id:"lamp",icon:"💡",name:"ほしぞらランプ",need:150},
 {id:"sofa",icon:"🛋️",name:"なかよしソファ",need:200},
 {id:"castle",icon:"🏰",name:"ひみつのおしろ",need:300},
 {id:"clock",icon:"🕰️",name:"ふしぎな時計",need:400},
 {id:"piano",icon:"🎹",name:"おんがくピアノ",need:500},
 {id:"tent",icon:"⛺",name:"ぼうけんテント",need:650},
 {id:"tree",icon:"🌳",name:"おへやの木",need:800},
 {id:"fountain",icon:"⛲",name:"きらきらふんすい",need:1000},
 {id:"aquarium",icon:"🐠",name:"ミニすいぞくかん",need:1150},
 {id:"rocket",icon:"🚀",name:"うちゅうロケット",need:1300},
 {id:"rainbow",icon:"🌈",name:"にじのかざり",need:1500},
 {id:"snowglobe",icon:"🔮",name:"ふしぎなスノードーム",need:1700},
 {id:"treasure",icon:"🧰",name:"たからばこ",need:1900},
 {id:"moonbed",icon:"🌙",name:"おつきさまベッド",need:2150},
 {id:"crown",icon:"👑",name:"王さまのかざり",need:2400},

 {id:"toy_blocks",icon:"🧱",name:"つみきセット",need:80},
 {id:"teddy",icon:"🧸",name:"くまのぬいぐるみ",need:120},
 {id:"toy_train",icon:"🚂",name:"おもちゃのきしゃ",need:180},
 {id:"toy_car",icon:"🚗",name:"ミニカー",need:240},
 {id:"kite",icon:"🪁",name:"カラフルたこ",need:340},
 {id:"drum",icon:"🥁",name:"わくわくドラム",need:450},
 {id:"guitar",icon:"🎸",name:"ミニギター",need:560},
 {id:"game",icon:"🎮",name:"ゲームコーナー",need:720},
 {id:"puzzle",icon:"🧩",name:"ジグソーパズル",need:900},
 {id:"chess",icon:"♟️",name:"ボードゲーム",need:1080},

 {id:"desk",icon:"🪑",name:"べんきょうづくえ",need:140},
 {id:"chair",icon:"🪑",name:"木のいす",need:220},
 {id:"table",icon:"🍽️",name:"まるいテーブル",need:320},
 {id:"shelf",icon:"🗄️",name:"おもちゃだな",need:430},
 {id:"drawer",icon:"🗃️",name:"ひきだし",need:540},
 {id:"mirror",icon:"🪞",name:"おしゃれミラー",need:680},
 {id:"basket",icon:"🧺",name:"おもちゃかご",need:760},
 {id:"cushion",icon:"🟣",name:"ふわふわクッション",need:860},
 {id:"stool",icon:"🪑",name:"ちいさなスツール",need:960},
 {id:"books2",icon:"📖",name:"ものしり本セット",need:1250},

 {id:"flowers",icon:"🌷",name:"お花のかざり",need:280},
 {id:"sunflower",icon:"🌻",name:"ひまわり",need:380},
 {id:"cactus",icon:"🌵",name:"サボテン",need:620},
 {id:"bonsai",icon:"🌱",name:"ミニガーデン",need:840},
 {id:"stars",icon:"⭐",name:"ほしのかざり",need:1040},
 {id:"cloud",icon:"☁️",name:"くものかざり",need:1220},
 {id:"sun",icon:"☀️",name:"おひさまライト",need:1420},
 {id:"planet",icon:"🪐",name:"わくせいモビール",need:1620},
 {id:"telescope",icon:"🔭",name:"天体ぼうえんきょう",need:1820},
 {id:"map",icon:"🗺️",name:"ぼうけんマップ",need:2050},

 {id:"slide",icon:"🛝",name:"おへやすべり台",need:2300},
 {id:"trampoline",icon:"⭕",name:"ミニトランポリン",need:2500},
 {id:"pool",icon:"🏖️",name:"ミニプール",need:2700},
 {id:"campfire",icon:"🔥",name:"キャンプファイヤー",need:2900},
 {id:"treehouse",icon:"🌲",name:"ツリーハウス",need:3150},
 {id:"ship",icon:"⛵",name:"ぼうけんヨット",need:3400},
 {id:"ufo",icon:"🛸",name:"ひみつのUFO",need:3650},
 {id:"dragon",icon:"🐉",name:"ドラゴンのおきもの",need:3900},
 {id:"crystal",icon:"💎",name:"きらきらクリスタル",need:4200},
 {id:"legend_throne",icon:"🪑",name:"でんせつの王ざ",need:4500}
];

const roomInteractions={
 bed_basic:["😴","ベッドでぐっすり。いい夢を見ているみたい！","petNap"],
 ball_blue:["🥎","ボールを追いかけて大はしゃぎ！","petHop"],
 sofa:["🛋️","ソファでのんびり。となりに座りたそう！","petWiggle"],
 piano:["🎹","ピアノの音に合わせてダンス！","petDance"],
 tent:["⛺","テントの中を探検しているよ！","petHop"],
 fountain:["⛲","ふんすいの水を見てわくわく！","petWiggle"],
 aquarium:["🐠","お魚をじーっと見つめているよ。","petNap"],
 rocket:["🚀","うちゅうへ出発するまねっこ！","petHop"],
 moonbed:["🌙","おつきさまベッドでうとうと…。","petNap"],
 books:["📚","えほんをいっしょに読みたそう！","petWiggle"],
 tree:["🌳","木のまわりを元気におさんぽ！","petWalk"],
 treasure:["🧰","たからばこを見つけて大よろこび！","petDance"]
};
function interactFurniture(id){
 const it=roomItems.find(x=>x.id===id);if(!it)return;
 const a=roomInteractions[id]||[it.icon,`${it.name}を見て、うれしそうにしているよ！`,"petWiggle"];
 const pet=$("#roomScene .roomPet");if(pet){pet.className=`roomPet ${a[2]} petInteract`;setTimeout(()=>{if(document.body.contains(pet))pet.className=`roomPet ${petMotion()}`},4200)}
 $("#careMessage").textContent=`${currentPet().emoji} ${a[1]}`;
 const r=state.room;r.album=r.album||[];r.album.push({at:new Date().toISOString(),icon:a[0],text:`${currentPet().name}が「${it.name}」で遊んだ！`});persist();renderMemoryBook();
}

const roomMissions=[
 {id:"q10",need:10,icon:"🍪",title:"10問チャレンジ",reward:"おやつタイム"},
 {id:"q20",need:20,icon:"🥎",title:"20問チャレンジ",reward:"ボールあそび"},
 {id:"q30",need:30,icon:"🌳",title:"30問チャレンジ",reward:"おさんぽタイム"},
 {id:"q50",need:50,icon:"🎁",title:"50問チャレンジ",reward:"家具プレゼント"}
];
function todayRoom(){
 const k=dayKey();if(state.room.day!==k){state.room.day=k;state.room.todayQuestions=0;state.room.missionsClaimed={};}
 state.room.savedLetters=state.room.savedLetters||[];state.room.readLetters=state.room.readLetters||{};state.room.surprises=state.room.surprises||{};state.room.positions=state.room.positions||{};
 return state.room;
}
function unlockRoomItems(){
 const r=state.room;r.owned=r.owned||["bed_basic"];r.equipped=r.equipped||["bed_basic"];r.album=r.album||[];
 for(const it of roomItems)if(r.studyQuestions>=it.need&&!r.owned.includes(it.id)){r.owned.push(it.id);r.album.push({at:new Date().toISOString(),icon:it.icon,text:`${it.name}をゲット！`})}
}

function seasonInfo(){
 const m=new Date().getMonth()+1;
 if(m>=3&&m<=5)return {key:"spring",icon:"🌸",name:"はるのお花まつり",msg:"おへやに春がきたよ！",decor:"🌸🌷🦋"};
 if(m>=6&&m<=8)return {key:"summer",icon:"🌻",name:"なつのわくわく祭り",msg:"夏をいっしょに楽しもう！",decor:"🌻🍉🎐"};
 if(m>=9&&m<=11)return {key:"autumn",icon:"🍁",name:"あきの木の実まつり",msg:"秋のおへやを楽しもう！",decor:"🍁🌰🍂"};
 return {key:"winter",icon:"❄️",name:"ふゆのきらきら祭り",msg:"あったかいおへやで冬を楽しもう！",decor:"❄️⛄🎄"};
}

function personalityReaction(){
 const [kind]=animalPersonality();
 const map={
 "げんき":"今日はおへやをいっぱい走り回りたい気分！",
 "のんびり":"ここでゆっくりするの、だいすき。",
 "やさしい":"いっしょにいられるだけでうれしいな。",
 "あそび好き":"どのおもちゃで遊ぼうかな？",
 "いたずら好き":"なにか面白いこと、ないかな〜？",
 "おしゃれ":"おへやをもっとすてきにしたいな！",
 "ものしり":"新しい漢字のお話、聞かせて！",
 "あまえんぼう":"もうちょっといっしょにいてほしいな。"
 };
 return map[kind]||"きょうもいっしょに遊ぼう！";
}

function petMotion(){
 const f=currentFriendship(),n=(Date.now()+state.totalEarned)%5;
 return ["petWalk","petHop","petWiggle","petNap","petDance"][n];
}
function letterDefs(){
 const p=currentPet(),q=state.room.studyQuestions||0,f=currentFriendship();
 return [
  {id:"hello-"+p.id,ok:true,icon:"💌",title:`${p.name}から はじめてのおてがみ`,body:`いっしょに漢字のぼうけんができてうれしいな。これからもいっしょに楽しもうね！`},
  {id:"q100",ok:q>=100,icon:"✉️",title:"100問きねんのおてがみ",body:"100問も取り組んだんだね！ おへやにも思い出がいっぱい増えてきたよ。"},
  {id:"q500",ok:q>=500,icon:"💌",title:"500問きねんのおてがみ",body:"500問！ すごいぼうけんになってきたね。次はどんな漢字に出会えるかな？"},
  {id:"q1000",ok:q>=1000,icon:"🌟",title:"1000問きねんのおてがみ",body:"1000問まで来たんだね！ ここまでのぼうけん、ぜんぶ大切な思い出だよ。"},
  {id:"friend55-"+p.id,ok:f>=55,icon:"💖",title:`${p.name}から なかよしのおてがみ`,body:"いっしょにいる時間が増えて、もっともっとなかよしになれた気がするよ！"},
  {id:"friend85-"+p.id,ok:f>=85,icon:"👑",title:`${p.name}から とくべつなおてがみ`,body:"ぼくたちはさいこうの相棒だね。これからのぼうけんも、ずっと応援しているよ！"}
 ].filter(x=>x.ok);
}

function nextRewardPreview(){
 const r=todayRoom(),q=r.studyQuestions||0;
 const nextItem=roomItems.find(x=>x.need>q),nextPet=pets.find(x=>x.unlock>state.totalEarned);
 return {
  item:nextItem?{need:Math.max(0,nextItem.need-q),icon:"🎁",text:`${nextItem.name} がかいほう`}:null,
  pet:nextPet?{need:Math.max(0,nextPet.unlock-state.totalEarned),icon:"🐾",text:"？？？のどうぶつに出会えるかも"}:null
 };
}
function checkSurpriseReward(){
 const r=todayRoom();r.surprises=r.surprises||{};
 const q=r.studyQuestions||0,milestones=[75,175,275,425,575,775,975,1275,1575,1975,2475,2975,3475];
 const hit=milestones.find(n=>q>=n&&!r.surprises[n]);if(!hit)return;
 r.surprises[hit]=true;state.careTickets+=1;r.album.push({at:new Date().toISOString(),icon:"🎁",text:`${hit}問のサプライズ！ おせわチケット1まい！`});persist();
 setTimeout(()=>alert(`🎁 サプライズごほうび！\n\nたくさん学習したごほうびに\nおせわチケットを1まいゲット！`),100);
}
function renderRewardPreview(){
 const n=nextRewardPreview(),el=$("#nextRewardPreview");if(!el)return;
 const rows=[];
 if(n.item)rows.push(`<div class="rewardPreviewRow"><span>${n.item.icon}</span><div><b>あと ${n.item.need}問</b><small>${n.item.text}</small></div></div>`);
 if(n.pet)rows.push(`<div class="rewardPreviewRow"><span>${n.pet.icon}</span><div><b>あと ${n.pet.need} PT</b><small>${n.pet.text}</small></div></div>`);
 el.innerHTML=rows.join("")||`<div class="rewardPreviewRow"><span>👑</span><div><b>たくさんのごほうびを集めたよ！</b></div></div>`;
}
function renderMemoryBook(){
 const r=todayRoom(),el=$("#memoryBook");if(!el)return;
 const current=letterDefs().map(l=>({id:l.id,icon:l.icon,title:l.title,body:l.body,pet:`${currentPet().emoji} ${currentPet().name}`}));
 const merged=[...(r.savedLetters||[]),...current].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i);
 const letters=merged.map(l=>({icon:l.icon,text:l.title,type:"letter",body:l.body,id:l.id,pet:l.pet}));
 const memories=(r.album||[]).slice().reverse().map((a,i)=>({icon:a.icon,text:a.text,type:"memory",id:"m"+i}));
 const all=[...letters,...memories].slice(0,40);
 el.innerHTML=all.map(x=>`<button class="memoryEntry" data-memory="${x.id}" data-type="${x.type}"><span>${x.icon}</span><b>${x.text}</b><small>${x.type==="letter"?"おてがみ":"思い出"}</small></button>`).join("")||"まだ思い出はありません。";
 document.querySelectorAll('[data-type="letter"]').forEach(b=>b.onclick=()=>{const l=letters.find(x=>x.id===b.dataset.memory);if(l)alert(`💌 ${l.text}\n\n${l.body}\n\n— ${l.pet||`${currentPet().emoji} ${currentPet().name}`}より`)});
}
function renderSeasonAndLetters(){
 const s=seasonInfo(),ev=$("#seasonEvent");if(ev)ev.innerHTML=`<div class="seasonHero ${s.key}"><span>${s.icon}</span><div><b>${s.name}</b><small>${s.msg}</small></div><strong>${s.decor}</strong></div>`;
 const letters=$("#petLetters"),list=letterDefs();if(letters)letters.innerHTML=list.slice().reverse().map(l=>`<button class="petLetter" data-letter="${l.id}"><span>${l.icon}</span><div><b>${l.title}</b><small>タップして読む</small></div></button>`).join("");
 document.querySelectorAll("[data-letter]").forEach(b=>b.onclick=()=>{const l=list.find(x=>x.id===b.dataset.letter);if(l){state.room.readLetters=state.room.readLetters||{};state.room.readLetters[l.id]=true;if(!state.room.savedLetters.some(x=>x.id===l.id))state.room.savedLetters.push({id:l.id,icon:l.icon,title:l.title,body:l.body,pet:`${currentPet().emoji} ${currentPet().name}`});persist();alert(`💌 ${l.title}\n\n${l.body}\n\n— ${currentPet().emoji} ${currentPet().name}より`);renderMemoryBook()}});
}

function defaultRoomPos(i){
 const cols=4,row=Math.floor(i/cols),col=i%cols;
 return {x:12+col*24,y:68-Math.min(row,2)*24};
}
function roomPos(id,i){
 const r=state.room;r.positions=r.positions||{};
 return r.positions[id]||defaultRoomPos(i);
}
function saveRoomPos(id,x,y){
 const r=state.room;r.positions=r.positions||{};
 r.positions[id]={x:Math.max(4,Math.min(92,x)),y:Math.max(8,Math.min(88,y))};
 persist();
}
function enableRoomDragging(scene){
 scene.querySelectorAll(".decorItem").forEach(el=>{
   let moved=false,startX=0,startY=0;
   el.addEventListener("pointerdown",e=>{
     moved=false;startX=e.clientX;startY=e.clientY;
     el.setPointerCapture?.(e.pointerId);
     el.classList.add("dragging");
     e.preventDefault();
   });
   el.addEventListener("pointermove",e=>{
     if(!el.classList.contains("dragging"))return;
     const rect=scene.getBoundingClientRect();
     const dx=Math.abs(e.clientX-startX),dy=Math.abs(e.clientY-startY);
     if(dx+dy>6)moved=true;
     const x=(e.clientX-rect.left)/rect.width*100;
     const y=(e.clientY-rect.top)/rect.height*100;
     el.style.left=`${Math.max(4,Math.min(92,x))}%`;
     el.style.top=`${Math.max(8,Math.min(88,y))}%`;
   });
   const finish=e=>{
     if(!el.classList.contains("dragging"))return;
     el.classList.remove("dragging");
     const x=parseFloat(el.style.left)||50,y=parseFloat(el.style.top)||70;
     if(moved)saveRoomPos(el.dataset.interact,x,y);
     else interactFurniture(el.dataset.interact);
   };
   el.addEventListener("pointerup",finish);
   el.addEventListener("pointercancel",()=>el.classList.remove("dragging"));
   el.onclick=e=>e.preventDefault();
 });
}
function renderRoomPlus(){
 const r=todayRoom();unlockRoomItems();
 const q=$("#roomStudyQuestions");if(q)q.textContent=r.studyQuestions||0;
 const tq=$("#todayStudyQuestions");if(tq)tq.textContent=r.todayQuestions||0;
 const mission=$("#roomMissions");if(mission)mission.innerHTML=roomMissions.map(m=>{
  const done=(r.todayQuestions||0)>=m.need,claimed=!!r.missionsClaimed[m.id];
  return `<div class="roomMission ${done?"done":""}"><span>${m.icon}</span><div><b>${m.title}</b><small>${done?(claimed?"ごほうびを楽しんだよ！":`${m.reward}ができるよ！`):`あと ${m.need-(r.todayQuestions||0)}問`}</small></div>${done&&!claimed?`<button data-mission="${m.id}" class="primary">楽しむ！</button>`:""}</div>`}).join("");
 document.querySelectorAll("[data-mission]").forEach(b=>b.onclick=()=>claimRoomMission(b.dataset.mission));
 const inv=$("#roomInventory");if(inv)inv.innerHTML=roomItems.map(it=>{const owned=r.owned.includes(it.id),eq=r.equipped.includes(it.id);return `<button class="roomItem ${eq?"equipped":""}" data-item="${it.id}" ${owned?"":"disabled"}><span>${owned?it.icon:"🔒"}</span><b>${owned?it.name:`${it.need}問でかいほう`}</b><small>${owned?(eq?"おへやにあるよ":"タップでかざる"):"もっと学習するとゲット！"}</small></button>`}).join("");
 document.querySelectorAll("[data-item]").forEach(b=>b.onclick=()=>toggleRoomItem(b.dataset.item));
 const scene=$("#roomScene");if(scene){
   const items=r.equipped.map(id=>roomItems.find(x=>x.id===id)).filter(Boolean);
   scene.innerHTML=`<div class="roomPet ${petMotion()}" title="${currentPet().name}">${currentPet().emoji}</div><div class="seasonCorner">${seasonInfo().decor}</div><div class="roomDecor">${items.map((x,i)=>{const p=roomPos(x.id,i);return `<button class="decorItem" data-interact="${x.id}" title="${x.name}（ドラッグで動かせるよ）" style="left:${p.x}%;top:${p.y}%">${x.icon}</button>`}).join("")}</div>`;
   enableRoomDragging(scene);
 }
 const pr=$("#personalityRoomTalk");if(pr)pr.textContent=`${currentPet().emoji}「${personalityReaction()}」`;
 renderSeasonAndLetters();renderRewardPreview();renderMemoryBook();checkSurpriseReward();
 const album=$("#growthAlbum");if(album)album.innerHTML=(r.album||[]).slice(-8).reverse().map(a=>`<div class="albumEntry"><span>${a.icon}</span><span>${a.text}</span></div>`).join("")||'<span class="muted">これから思い出が増えていくよ。</span>';
}
function claimRoomMission(id){
 const r=todayRoom(),m=roomMissions.find(x=>x.id===id);if(!m||(r.todayQuestions||0)<m.need||r.missionsClaimed[id])return;
 r.missionsClaimed[id]=true;
 if(id==="q50"){state.careTickets+=2;r.album.push({at:new Date().toISOString(),icon:"🎟️",text:"50問達成！ おせわチケット2まい！"});}
 else{state.petFriendships[state.petId]=Math.min(MAX_FRIENDSHIP,currentFriendship()+3);r.album.push({at:new Date().toISOString(),icon:m.icon,text:`${m.reward}を楽しんだ！`});}
 persist();$("#careMessage").textContent=`${m.icon} ${m.reward}！ がんばったごほうびだよ！`;renderAnimalRoom();renderHomeStats();
}
function toggleRoomItem(id){
 const r=state.room;if(!r.owned.includes(id))return;
 if(r.equipped.includes(id)){
   if(id!=="bed_basic")r.equipped=r.equipped.filter(x=>x!==id);
 }else if(r.equipped.length<12){
   r.equipped.push(id);
 }else{
   $("#careMessage").textContent="おへやには12こまでかざれるよ。どれかをしまってから置いてね。";
   return;
 }
 persist();renderRoomPlus();
}

function renderAnimalRoom(){const pet=currentPet(),friend=currentFriendship();$("#animalPoints").textContent=state.points;$("#petBig").textContent=pet.emoji;$("#petName").textContent=pet.name;$("#petStageText").textContent=`${petStageIcon()} ${petStage()} ・ この子とのなかよし度。おせわすると上がるよ。`;$("#petFriendship").textContent=friend;$("#petGrowthBar").style.width=`${Math.min(100,friend/MAX_FRIENDSHIP*100)}%`;const unlockedCount=unlockedPets().length;const cc=$("#collectionCount");if(cc)cc.textContent=`${unlockedCount} / ${pets.length} なかま`;const te=$("#totalEarned");if(te)te.textContent=state.totalEarned;const next=nextLockedPet(),nextEl=$("#nextAnimal");if(nextEl)nextEl.innerHTML=next?`つぎの仲間 <b>${next.emoji} ${next.name}</b> まで あと <b>${Math.max(0,next.unlock-state.totalEarned)} PT</b>`:`🎉 ${pets.length}しゅるい、ぜんぶ仲間になったよ！`;const wrap=$("#petCollection");wrap.innerHTML="";for(const p of pets){const unlocked=state.totalEarned>=p.unlock||p.id===state.petId;const b=document.createElement("button");b.className=`petChoice ${p.id===state.petId?"active":""}`;b.disabled=!unlocked;const f=+(state.petFriendships[p.id]||0);const icon=f<25?"🌱":f<55?"⭐":f<85?"💖":"👑";b.innerHTML=`<span>${unlocked?p.emoji:"🔒"}</span><b>${p.name}</b><small>${unlocked?(p.id===state.petId?`${icon} いまの相棒`:`${icon} なかよし ${f}`):`累計 ${p.unlock} PTで仲間`}</small>`;b.onclick=()=>{state.petId=p.id;persist();renderAnimalRoom();renderHomeStats()};wrap.appendChild(b)}const lvl=$("#petFriendLevel");if(lvl)lvl.textContent=friendshipLevel(friend);const react=$("#petReaction");if(react)react.textContent=`${pet.emoji}「${careReaction()}」`;const fav=$("#favoriteCareText"),favA=careActions.find(a=>a.id===favoriteCare());if(fav&&favA)fav.textContent=`${favA.icon} ${favA.label}`;const cnt=$("#careCount");if(cnt)cnt.textContent=careData().count||0;renderCareButtons();renderGrowthRewards();renderAnimalCollection();renderRoomPlus();renderSecondChapter()}
function care(cost,gain,msg){if(state.points<cost)return;state.points-=cost;state.petFriendships[state.petId]=Math.min(MAX_FRIENDSHIP,currentFriendship()+gain);state.experience+=gain;persist();$("#careMessage").textContent=msg;renderAnimalRoom();renderHomeStats()}

function hideFeedback(){$("#feedback").className="feedback hidden";$("#feedback").textContent=""}
function showFeedback(kind,title,msg){const f=$("#feedback");f.className=`feedback ${kind}`;f.innerHTML=`<b>${title}</b><br>${msg}`}

function studyCareReward(noHelp,help,retry){
 // 10問を最後まで終えること自体を評価。自力正解が多いほど少し増えるが、
 // 「答えを見る」を使った子も必ず育成を楽しめる設計。
 let tickets=1;
 if(noHelp>=7)tickets++;
 if(noHelp===10)tickets++;
 if(retry===0&&noHelp>=7)tickets++;
 return Math.min(4,tickets);
}
function careTicketLabel(n){return `🎟️ おせわチケット ${n}まい`}
function useCareTicket(actionId){
 const a=careActions.find(x=>x.id===actionId);if(!a||state.careTickets<1)return false;
 state.careTickets--;const fav=actionId===favoriteCare(),gain=a.gain+(fav?2:0)+2;
 state.petFriendships[state.petId]=Math.min(MAX_FRIENDSHIP,currentFriendship()+gain);state.experience+=gain;
 const cd=careData();cd.count=(cd.count||0)+1;cd.actions[actionId]=(cd.actions[actionId]||0)+1;persist();
 $("#careMessage").textContent=`🎟️ 学習ごほうび！ ${currentPet().emoji} ${a.msg} なかよし +${gain}${fav?" 💖":""}`;
 renderAnimalRoom();renderHomeStats();return true;
}
function showResults(){
  state.sessions++;const bonus=completeDailySet();const room=todayRoom();room.studyQuestions=(room.studyQuestions||0)+10;room.todayQuestions=(room.todayQuestions||0)+10;unlockRoomItems();
  const noHelp=state.sessionResults.filter(r=>!r.help).length;
  const help=state.sessionResults.filter(r=>r.help).length;
  const retry=state.sessionResults.filter(r=>r.retries>0).length;
  const careBonus=studyCareReward(noHelp,help,retry);state.careTickets+=careBonus;persist();
  syncLearningEvent("session",{volume:state.volume,total:state.sessionResults.length,correctNoHelp:noHelp,helpCount:help,retryCount:retry});
  $("#resultCorrect").textContent=noHelp;$("#resultNoHelp").textContent=noHelp;$("#resultHelp").textContent=help;$("#resultRetry").textContent=retry;$("#resultPoints").textContent=noHelp*2+bonus;
  const dr=$("#dailyResult");if(dr)dr.textContent=bonus?`🌞 今日のチャレンジ達成！ ボーナス +${bonus} PT`:`今日のチャレンジは達成ずみ！`;
  const cr=$("#careRewardResult");if(cr)cr.innerHTML=`🐾 10問クリアのごほうび！ <b>${careTicketLabel(careBonus)}</b> をもらったよ。<br><small>「どうぶつのおへや」で、PTを使わず特別なおせわができるよ。</small>`;
  $("#resultMessage").textContent=noHelp===10?"全問、自分の力で書けたね！":noHelp>=7?"よくできたね！ 書き直した字も力になっているよ。":"答えを見た字も、もう一度書けばどんどん身につくよ。";
  $("#practiceView").classList.add("hidden");$("#resultView").classList.remove("hidden");renderHomeStats();renderMotivation();
}
$("#nextBtn").onclick=()=>{if(!state.questionCompleted)return;if(state.index===9){showResults();return}state.index++;renderQuestion()};
$("#retrySetBtn").onclick=startSet;
$("#resultHomeBtn").onclick=()=>{$("#resultView").classList.add("hidden");$("#homeView").classList.remove("hidden");renderHomeStats()};
onIf("#resultAnimalBtn","click",()=>{$("#resultView").classList.add("hidden");$("#animalView").classList.remove("hidden");renderAnimalRoom()});

function strokeFeatures(strokes){
  const clean=strokes.filter(st=>st&&st.length>1),pts=clean.flat();
  if(!pts.length)return{n:0,w:0,h:0,verticals:0,horizontals:0,longVerticalNearCenter:false};
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const w=Math.max(1,maxX-minX),h=Math.max(1,maxY-minY),cx=(minX+maxX)/2;
  let verticals=0,horizontals=0,longVerticalNearCenter=false;
  for(const st of clean){
    const a=st[0],b=st[st.length-1],dx=Math.abs(b.x-a.x),dy=Math.abs(b.y-a.y);
    const sx=st.map(p=>p.x),sy=st.map(p=>p.y),sw=Math.max(...sx)-Math.min(...sx),sh=Math.max(...sy)-Math.min(...sy);
    if(sh>sw*1.45)verticals++;
    if(sw>sh*1.45)horizontals++;
    const scx=(Math.min(...sx)+Math.max(...sx))/2;
    if(sh>h*.62 && Math.abs(scx-cx)<w*.22)longVerticalNearCenter=true;
  }
  return{n:clean.length,w,h,verticals,horizontals,longVerticalNearCenter};
}
function expectedAwareFallback(box,candidates){
  const got=candidates[0]||null,n=box.strokes.length,f=strokeFeatures(box.strokes);
  if(box.expected==="守"&&got==="尻"&&n>=5&&n<=9)return true;
  // iPadの指書きで「申」が候補0件になりやすいケースを構造で救済。
  // 何でも正解にしないよう、画数・中央の長い縦線・横線のまとまりを同時に要求する。
  if(box.expected==="申"&&candidates.length===0&&f.n>=4&&f.n<=7&&f.longVerticalNearCenter&&f.horizontals>=2)return true;
  return false;
}
function recognizeWithNormalization(expected,strokes,size,boxSize,preserveAspect=false){
  const c=document.createElement("canvas"),id=`tmp_${Math.random().toString(36).slice(2)}`;
  c.id=id;c.width=size;c.height=size;c.style.display="none";document.body.appendChild(c);
  const ctx=c.getContext("2d"),all=strokes.flat();
  if(!all.length){c.remove();return[]}
  const xs=all.map(p=>p.x),ys=all.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const w=Math.max(1,maxX-minX),h=Math.max(1,maxY-minY);
  let sx=boxSize/w,sy=boxSize/h;
  if(!preserveAspect){const s=Math.min(sx,sy);sx=s;sy=s}
  const dw=w*sx,dh=h*sy,ox=(size-dw)/2,oy=(size-dh)/2;
  const normalized=strokes.map(st=>st.map(p=>[ox+(p.x-minX)*sx,oy+(p.y-minY)*sy]));
  KanjiCanvas["canvas_"+id]=c;KanjiCanvas["ctx_"+id]=ctx;KanjiCanvas["w_"+id]=size;KanjiCanvas["h_"+id]=size;KanjiCanvas["recordedPattern_"+id]=normalized;
  let raw="";try{raw=KanjiCanvas.recognize(id)||""}catch(e){console.error(e)}
  c.remove();
  return [...raw.replace(/\s+/g,"")];
}
function recognizeSingle(expected,strokes,canvasHint){
  if(!window.KanjiCanvas||!Array.isArray(KanjiCanvas.refPatterns)||!KanjiCanvas.refPatterns.length)return{ok:false,unknown:true,got:null};
  if(!strokes.flat().length)return{ok:false,unknown:true,got:null};

  // v4.4 STRICT:
  // 「候補のどこかに正解字が入った」だけでは正解にしない。
  // 3通りの正規化のうち、正解字が1位になった回数を数え、
  // 2回以上一致したときだけ自動正解にする。
  const passes=[
    recognizeWithNormalization(expected,strokes,320,250,false),
    recognizeWithNormalization(expected,strokes,320,275,false),
    recognizeWithNormalization(expected,strokes,320,250,true)
  ];
  const tops=passes.map(p=>p[0]||null);
  const topExactCount=tops.filter(ch=>ch===expected).length;

  const candidates=[];
  for(const pass of passes)for(const ch of pass)if(!candidates.includes(ch))candidates.push(ch);

  const got=tops.find(Boolean)||candidates[0]||null;
  const ok=topExactCount===3;
  const excellent=topExactCount===3;

  // 認識結果が割れた場合は、誤って「せいかい！」にせず確認扱いにする。
  const unknown=!ok && (candidates.length===0 || new Set(tops.filter(Boolean)).size>1 || candidates.includes(expected));

  return{
    ok,
    excellent,
    unknown,
    got,
    rank:candidates.indexOf(expected),
    fallback:false,
    candidates,
    tops,
    topExactCount,
    mode:ok?"hard-strict-exact":(unknown?"uncertain":"wrong")
  };
}
function splitStrokesForExpected(strokes,n){
  if(n<=1)return[strokes];
  const items=strokes.map((st,i)=>{const xs=st.map(p=>p.x);return{st,i,min:Math.min(...xs),max:Math.max(...xs),center:(Math.min(...xs)+Math.max(...xs))/2}}).sort((a,b)=>a.center-b.center);
  if(items.length<n)return Array.from({length:n},(_,i)=>i<items.length?[items[i].st]:[]);
  const gaps=[];for(let i=0;i<items.length-1;i++)gaps.push({i,g:items[i+1].min-items[i].max});
  const cuts=new Set(gaps.sort((a,b)=>b.g-a.g).slice(0,n-1).map(x=>x.i));
  const groups=[[]];items.forEach((it,i)=>{groups[groups.length-1].push(it.st);if(cuts.has(i)&&groups.length<n)groups.push([])});
  while(groups.length<n)groups.push([]);return groups;
}
function okuriInkStats(box){
  const strokes=box.strokes.filter(st=>st&&st.length);
  const pts=strokes.flat();
  if(!pts.length)return{hasInk:false,coverage:0,clusters:0};
  const r=box.canvas.getBoundingClientRect();
  const xs=pts.map(p=>p.x),minX=Math.min(...xs),maxX=Math.max(...xs);
  const coverage=r.width>0?(maxX-minX)/r.width:0;
  // Count broad left-to-right writing groups without exposing the answer length in the UI.
  const items=strokes.map(st=>{const a=st.map(p=>p.x);return{min:Math.min(...a),max:Math.max(...a)}}).sort((a,b)=>a.min-b.min);
  const gaps=[];for(let i=0;i<items.length-1;i++){const g=items[i+1].min-items[i].max;if(g>Math.max(18,r.width*.055))gaps.push(g)}
  return{hasInk:true,coverage,clusters:Math.max(1,Math.min(strokes.length,1+gaps.length))};
}
function recognizeBox(box){
  if(box.type==="kanji")return recognizeSingle(box.expected,box.strokes,box.canvas);
  const chars=[...box.expected],groups=splitStrokesForExpected(box.strokes,chars.length),parts=chars.map((ch,i)=>recognizeSingle(ch,groups[i]||[],box.canvas));
  const bad=parts.findIndex(r=>!r.ok);
  if(bad<0)return{ok:true,excellent:parts.every(r=>r.excellent),unknown:false,got:parts.map(r=>r.got||"?").join(""),parts,bad:-1,mode:"exact"};

  // KanjiCanvas is built for kanji and can be unreliable for handwritten kana.
  // For okurigana, never reject a plausible answer solely because the kana recognizer
  // produced a kanji candidate. Use the exact match when available, otherwise a
  // conservative ink/spacing check so correctly handwritten kana are not falsely marked wrong.
  const st=okuriInkStats(box);
  const enoughInk=st.hasInk&&box.strokes.length>=Math.max(1,Math.ceil(chars.length*.7));
  const wideEnough=chars.length===1?st.coverage>=.08:st.coverage>=.22;
  // 文字数は画面には見せないが、内部では横方向のまとまり数を使い、
  // 1文字しか書いていないのに3文字分の送りがなを正解扱いする等を減らす。
  const groupCountOK=chars.length===1
    ? st.clusters>=1
    : st.clusters>=Math.max(1,chars.length-1)&&st.clusters<=chars.length+1;
  const plausible=enoughInk&&wideEnough&&groupCountOK;
  // 形がそれらしくても、文字認識が一致していないものは自動正解にしない。
  // plausible は「書いてあることは分かるが判定に自信がない」という確認扱い。
  return{ok:false,excellent:false,unknown:plausible||parts.some(r=>r.unknown),got:parts.map(r=>r.got||"?").join(""),parts,bad,mode:plausible?"kana-uncertain":"wrong"};
}

$("#revealBtn").onclick=()=>{
  const q=state.questions[state.index];
  const a=answerOf(q);
  state.answerRevealed=true;
  const box=$("#revealedAnswer");
  box.innerHTML=`<b>答え：</b><span class="revealedWord">${a}</span><br><span class="small">見たあとは、まねして書いてみよう。</span>`;
  box.classList.remove("hidden");
  $("#revealBtn").disabled=true;
};


function acceptUncertainAnswer(q,results){
  showFeedback("bad","まだ正解にはしていません。","AIの判定に自信がありません。お手本とくらべて、もう一度書き直してみよう。");
  state.questionCompleted=false;
  state.boxes.forEach(b=>{
    b.canvas.classList.remove("lockedCanvas");
    b.clearOne?.classList.remove("hidden");
  });
  $("#undoBtn").disabled=false;
  $("#clearBtn").disabled=false;
  $("#nextBtn").classList.add("hidden");
}
function showThreeTryConfirmation(q,results,bad){
  const f=$("#feedback");f.className="feedback unknown";
  const answer=answerOf(q);
  f.innerHTML=`<b>3回チャレンジしたね！</b><br>赤く光っているマスをAIがうまく読み取れていないかもしれません。<br>自分の書いた字が <span class="revealedWord">${answer}</span> と合っているか、よく見て確認しよう。<div class="uncertainActions"><button id="confirmUnknownBtn" class="primary">○ 合っている（正解にする）</button><button id="rewriteUnknownBtn" class="secondary">✎ もう一度書く</button></div>`;
  onIf("#confirmUnknownBtn","click",()=>acceptUncertainAnswer(q,results));
  onIf("#rewriteUnknownBtn","click",()=>{hideFeedback();state.activeBox=bad;$("#checkBtn").disabled=false});
}
$("#checkBtn").onclick=async()=>{
  if(state.checking||state.questionCompleted)return;state.checking=true;$("#checkBtn").disabled=true;
  $("#aiModal").classList.remove("hidden");
  try{
    const q=state.questions[state.index],results=state.boxes.map(recognizeBox),bad=results.findIndex(r=>!r.ok);
    if(bad<0){
      state.boxes.forEach(resetBoxRepairUI);
      const perfect=results.every(r=>r.excellent);
      if(state.answerRevealed){
        showFeedback("ok","書けたね！",`${answerOf(q)} を見ながら練習できたよ。次は見ないで挑戦してみよう。`);
        state.experience+=1;
      }else{
        showFeedback(perfect?"good":"ok","せいかい！",`${answerOf(q)} と正しく書けたよ。`);
        state.points+=2;state.totalEarned+=2;state.experience+=perfect?3:2;
      }
      state.sessionResults[state.index]={help:state.answerRevealed,retries:state.questionRetries};
      syncLearningEvent("question",{questionId:q.id||"",prompt:q.displaySentence||"",answer:answerOf(q),correct:true,retries:state.questionRetries,help:state.answerRevealed,manualConfirm:false,volume:state.volume});
      ensureDaily();state.daily.questions=(state.daily.questions||0)+1;state.records.totalQuestions=(state.records.totalQuestions||0)+1;if(!state.answerRevealed)state.records.totalCorrect=(state.records.totalCorrect||0)+1;if(state.weak[q.targetKanji])state.weak[q.targetKanji]=Math.max(0,state.weak[q.targetKanji]-1);
      state.discovered.add(q.targetKanji);state.questionCompleted=true;
      state.boxes.forEach(b=>b.canvas.classList.add("lockedCanvas"));
      $("#undoBtn").disabled=true;$("#clearBtn").disabled=true;
      persist();renderMotivation();checkNewAnimalUnlocks();$("#nextBtn").classList.remove("hidden");
    }else{
      if(state.questionRetries===0)state.weak[q.targetKanji]=(state.weak[q.targetKanji]||0)+1;state.questionRetries++;persist();renderMotivation();
      markBoxResults(results);
      state.activeBox=bad;const r=results[bad],box=state.boxes[bad];
      const badPositions=results.map((x,i)=>!x.ok?`${i+1}字目`:null).filter(Boolean).join("・");
      if(state.questionRetries>=3){
        showThreeTryConfirmation(q,results,bad);
      }else if(box.type==="okuri"){
        showFeedback(r.unknown?"unknown":"retry",`${state.questionRetries}回目：${badPositions}を直そう`,"赤く光っているマスを直そう。「この送りがなだけ消す」も使えるよ。");
      }else if(r.unknown){
        showFeedback("unknown",`${state.questionRetries}回目：${badPositions}を見てみよう`,"AIの判定に自信がないので、正解にはしていません。赤く光っている漢字全体を、お手本とくらべてみよう。");
      }else{
        showFeedback("retry",`${state.questionRetries}回目：${badPositions}を直そう`,`赤く光っているマスを直そう。○が出たら、そこはAIの「見直しポイント」のめやすだよ。お手本とくらべてみよう。`);
      }
    }
  }catch(e){console.error(e);showFeedback("unknown","判定できませんでした","もう一度ためしてね。")}finally{state.checking=false;$("#aiModal").classList.add("hidden");renderHomeStats();if(!state.questionCompleted)updateCheckButton()}
};
addEventListener("resize",()=>state.boxes.forEach(resizeBox));init();

onIf("#studentSetupBtn","click",openStudentSetup);renderStudentProfile();syncLearningEvent("login");

function initTeacherPracticeUI(){
  if(!TEACHER_PRACTICE)return;
  const identity=document.querySelector(".studentIdentityCard");if(identity)identity.remove();
  const setup=$("#studentSetupBtn");if(setup)setup.remove();
  const animal=$("#animalRoomBtn");if(animal)animal.remove();
  const pointPill=$("#points")?.closest(".pill");if(pointPill)pointPill.style.display="none";
  if(!document.querySelector("#teacherPracticeBanner")){
    const banner=document.createElement("div");
    banner.id="teacherPracticeBanner";
    banner.style.cssText="position:sticky;top:0;z-index:10000;background:#fff4cc;border-bottom:2px solid #d6a900;padding:12px 16px;text-align:center;font-weight:800";
    banner.innerHTML="👩‍🏫 先生のおためしモード：児童コードは使いません。学習履歴・最終利用・正誤・苦手分析・PT・どうぶつの進行は児童データに一切保存されません。 <a href='./teacher.html' style='display:inline-block;margin-left:8px;padding:7px 10px;background:#fff;border:1px solid #b78b00;border-radius:9px;color:#222;text-decoration:none'>← 教師管理画面に戻る</a>";
    document.body.prepend(banner);
  }
  renderStudentProfile();
}
window.addEventListener("DOMContentLoaded",initTeacherPracticeUI);

window.addEventListener("DOMContentLoaded",()=>{
  const badge=document.createElement("div");
  badge.id="strictVersionBadge";
  badge.textContent="v4.5 HARD STRICT";
  document.body.appendChild(badge);
});
