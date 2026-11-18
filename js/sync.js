/* 동기화(로그인): Supabase에 db를 올리고 내려받아 폰·PC가 같은 데이터를 쓴다. 주소·키는 js/config.js, 표 만들기는 supabase_setup.sql
 * 규칙: 마지막으로 저장한 쪽이 이긴다(db.mt = 마지막 수정 시각). 서버가 더 새로우면 받아서 새로고침, 이 기기가 더 새로우면 올린다. */
var sb=null,syncSt={user:null,last:"",err:"",busy:false,imgStr:null,timer:null};
if(window.supabase&&SYNC_CFG.url&&SYNC_CFG.key){try{sb=window.supabase.createClient(SYNC_CFG.url,SYNC_CFG.key)}catch(e){syncSt.err=e.message}}

// 올릴 데이터: main = 이미지를 뺀 db 전체 / img = 화면별 이미지(용량이 커서 따로, 바뀔 때만 올린다)
function syncData(p){if(p==="img")return db.banners||{};var o=Object.assign({},db);delete o.banners;return o}
function syncTime(){var d=new Date();return hm(d.getHours()*60+d.getMinutes())}
function syncFail(e){syncSt.err=(e&&e.message)||String(e)}
// 버튼 핸들러를 오류가 나도 팝업으로 알려주게 감싼다
function guard(fn){return async function(){try{await fn()}catch(e){tell("오류: "+((e&&e.message)||e))}}}

// 서버에 올리기 (main은 항상, img는 바뀐 때만)
async function syncPush(){var u=syncSt.user.id,now=new Date().toISOString(),rows=[{user_id:u,part:"main",data:syncData("main"),updated_at:now}],img=JSON.stringify(syncData("img"));
 if(img!==syncSt.imgStr)rows.push({user_id:u,part:"img",data:JSON.parse(img),updated_at:now});
 var r=await sb.from("planner_data").upsert(rows,{onConflict:"user_id,part"});if(r.error)throw r.error;syncSt.imgStr=img;syncSt.last=syncTime()}
// 서버에서 한 부분(main/img) 읽기. 없으면 null
async function syncGet(part){var r=await sb.from("planner_data").select("data").eq("user_id",syncSt.user.id).eq("part",part).maybeSingle();if(r.error)throw r.error;return r.data?r.data.data:null}
// 서버의 이미지가 어떤지 한 번만 알아 둔다 (같은 이미지를 또 올리지 않으려고)
async function syncPrimeImg(){if(syncSt.imgStr===null){var im=await syncGet("img");syncSt.imgStr=im?JSON.stringify(im):""}}
// 서버 데이터로 이 기기를 바꾼다: 저장소에 쓰고 새로고침 (모든 초기화 코드가 새 데이터로 다시 돈다)
async function syncApply(main){var img=await syncGet("img"),d=Object.assign({},main,{banners:img||db.banners||{}});
 try{localStorage.setItem("planner",JSON.stringify(d))}catch(e){throw new Error("브라우저 저장 공간이 부족해서 서버 데이터를 저장하지 못했어요")}
 localStorage.setItem("planner_synced",syncSt.user.id);location.reload()}

// 동기화 한 번. 이 기기가 처음 이 계정과 만났는데 서로 다르면 어느 쪽을 쓸지 묻는다
async function syncNow(){if(!sb||!syncSt.user)return;if(syncSt.busy){syncHook();return}syncSt.busy=true;syncSt.err="";
 try{var main=await syncGet("main"),rm=main?main.mt||0:0,lm=db.mt||0,first=localStorage.getItem("planner_synced")!==syncSt.user.id;
  if(!main){await syncPrimeImg();await syncPush()}
  else if(first&&lm>0&&rm!==lm){syncSt.busy=false;
   ask("이 기기의 데이터와 서버 데이터가 서로 달라요. 어느 쪽을 쓸까요? (고르지 않은 쪽은 덮어써져요)",guard(function(){return syncApply(main)}),
    {yes:"서버 데이터 쓰기",no:"이 기기 데이터 올리기",onNo:guard(async function(){await syncPrimeImg();await syncPush();localStorage.setItem("planner_synced",syncSt.user.id)})});return}
  else if(rm>lm){await syncApply(main);return}
  else if(lm>rm){await syncPrimeImg();await syncPush()}
  else await syncPrimeImg();
  localStorage.setItem("planner_synced",syncSt.user.id);if(!syncSt.last)syncSt.last=syncTime()}
 catch(e){syncFail(e)}finally{syncSt.busy=false}}

// 저장할 때마다(state.js의 save가 부른다) 3초 뒤 동기화
function syncHook(){if(!sb||!syncSt.user)return;clearTimeout(syncSt.timer);syncSt.timer=setTimeout(syncNow,3000)}
// 시작할 때: 저장된 로그인이 있으면 동기화. 탭으로 돌아오거나 인터넷이 다시 연결돼도 동기화
async function syncStart(){if(!sb)return;try{var r=await sb.auth.getSession();syncSt.user=r.data.session?r.data.session.user:null;if(syncSt.user)await syncNow()}catch(e){syncFail(e)}}
syncStart();
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")syncNow()});
addEventListener("online",syncNow);

// 설정 팝업의 동기화 칸: 로그인/가입, 상태, 지금 동기화, 로그아웃
function syncBox(){var w=el("div","syncbox");w.appendChild(el("b",null,"동기화 (폰 ↔ PC)"));
 if(!sb){w.appendChild(el("p","sub",window.supabase?"js/config.js에 Supabase 주소와 키를 넣으면 켜져요. (README 참고)":"동기화 라이브러리를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."));return w}
 if(syncSt.user){w.appendChild(el("div","sub","로그인: "+syncSt.user.email+(syncSt.last?" · 마지막 동기화 "+syncSt.last:"")));
  if(syncSt.err)w.appendChild(el("div","sub","⚠ "+syncSt.err));
  var r=el("div","row"),now=el("button","sm","지금 동기화"),out=el("button","sm","로그아웃");
  now.onclick=guard(async function(){await syncNow();if(syncSt.err)tell("동기화 중 오류: "+syncSt.err);openSettings()});
  out.onclick=guard(async function(){await sb.auth.signOut();syncSt.user=null;syncSt.imgStr=null;localStorage.removeItem("planner_synced");openSettings()});
  r.append(now,out);w.appendChild(r)}
 else{var em=el("input"),pw=el("input"),r2=el("div","row"),li=el("button","sm","로그인"),su=el("button","sm","가입");
  em.type="email";em.placeholder="이메일";pw.type="password";pw.placeholder="비밀번호 (6자 이상)";
  li.onclick=guard(async function(){var r=await sb.auth.signInWithPassword({email:em.value.trim(),password:pw.value});if(r.error){tell("로그인 실패: "+r.error.message);return}syncSt.user=r.data.user;await syncNow();openSettings()});
  su.onclick=guard(async function(){var r=await sb.auth.signUp({email:em.value.trim(),password:pw.value});if(r.error){tell("가입 실패: "+r.error.message);return}
   if(r.data.session){syncSt.user=r.data.user;await syncNow();openSettings()}else tell("가입했어요! 이메일로 온 확인 링크를 누른 뒤 로그인해 주세요.")});
  r2.append(li,su);w.append(em,pw,r2,el("p","sub","다른 기기에서도 같은 이메일로 로그인하면 같은 데이터가 보여요."))}
 return w}
