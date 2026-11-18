/* 서비스 워커: 앱 파일을 저장해 두었다가 인터넷이 없어도 열리게 한다.
 * 항상 인터넷에서 새 파일을 먼저 받아 보고(업데이트가 바로 반영됨), 실패하면 저장해 둔 것을 쓴다. 동기화 서버(Supabase) 통신은 건드리지 않는다. */
const V="v1",ASSETS=["./", "index.html", "manifest.webmanifest", "css/style.css", "js/app.js", "js/blocks.js", "js/colorpicker.js", "js/config.js", "js/daily.js", "js/export.js", "js/grouplist.js", "js/memo.js", "js/money.js", "js/pwa.js", "js/recurring.js", "js/repeat.js", "js/state.js", "js/sync.js", "js/tags.js", "js/theme.js", "js/utils.js", "js/views.js", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);
 if(e.request.method!=="GET"||(u.origin!==location.origin&&u.hostname!=="cdn.jsdelivr.net"))return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok||r.type==="opaque"){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r})
  .catch(()=>caches.match(e.request).then(m=>m||caches.match("index.html"))))});
