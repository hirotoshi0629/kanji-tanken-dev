const CACHE="kanjiquest-v45-hard-strict";
const ASSETS=["./","./index.html","./styles.css?v=4.5","./app.js?v=4.5","./manifest.webmanifest","./setup-check.html","./data/kanji_master.json","./data/reviewed_problem_bank.json"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k!==CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith((async()=>{
    try{
      const res=await fetch(e.request,{cache:"no-store"});
      if(res && res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return res;
    }catch(err){
      return (await caches.match(e.request))||(await caches.match("./index.html"));
    }
  })());
});
