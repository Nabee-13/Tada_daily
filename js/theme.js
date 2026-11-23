/* 꾸미기: 색 테마(저장), 상단 이미지, 기기별(폰/PC) 위젯 기본 배치, 달력 위젯, 설정 팝업 */

// 기기 종류: 화면 폭이 760px 미만이면 폰, 아니면 PC(사이트)
function dev(){return innerWidth<760?"phone":"pc"}

// 기본 위젯 배치. d=기기(pc/phone), v=화면(day/week/month). [위젯id, 구역(T=위 전체폭 / L=왼쪽 / R=오른쪽), 켜짐여부]
function defLay(d,v){var pc=d==="pc",M=[["memo1","L",1],["memo2","L",0]];
 var P={day:[["dayB","T",1],["dayC","L",1],["dayL","L",1],["dayG","R",1],["dayS","R",1],["dayM","R",0]],
  week:[["dayB","T",1],["wkP","L",1],["wkL","L",1],["wkS","L",1],["wkG","R",1]],
  month:[["dayB","T",1],["moP","L",1],["moL","L",1],["moS","L",1],["moG","R",1]],
  money:[["dayB","T",1],["mnS","L",1],["mnB","L",1],["mnF","L",1],["mnR","L",1],["mnC","R",1],["mnD","R",1],["mnL","R",1]]}[v].concat(M);
 return P.map(function(p){return{id:p[0],z:pc?p[1]:(p[1]==="T"?"T":"L"),on:!!p[2]}})}

// 시작할 때: 배치가 없으면 기본값으로, 새 위젯이 생겼으면 뒤에 추가. (옛 형식: 배열 → 일간용으로 옮김)
db.layouts=db.layouts||{};
["pc","phone"].forEach(function(d){var o=db.layouts[d];if(Array.isArray(o))o={day:o};o=db.layouts[d]=o||{};
 ["day","week","month","money"].forEach(function(v){var L=o[v]=(o[v]||defLay(d,v)).filter(function(b){return BLK[b.id]});   // 없어진 위젯(일기 등)은 배치에서 뺀다
  defLay(d,v).forEach(function(b){if(!L.some(function(x){return x.id===b.id}))L.push(b)})})});
db.presets=db.presets||[];   // 꾸미기 프리셋 (최대 5개)
// 꾸미기 색 구조: db.theme = {sync, all:{bg,card,tx,ac}, tabs:{day,week,month,money 각각 {bg,card,tx,ac}}}
//   sync=true  → 모든 탭이 all 색을 같이 쓴다 (동기화)   sync=false → 탭마다 자기 색(tabs[탭])을 쓴다
var TABS=[["day","일간"],["week","주간"],["month","월간"],["money","가계부"]],setTab="day";
// 옛 형식(색만 평평하게 저장)이면 새 형식으로 바꾼다
function normTheme(t){t=t&&t.all?t:{sync:true,all:t||{},tabs:{}};t.tabs=t.tabs||{};return t}
db.theme=normTheme(db.theme);
db.presets.forEach(function(p){p.theme=normTheme(p.theme);delete p.banner});   // 프리셋엔 이미지를 저장하지 않는다
// 한 탭에서 쓸 색 묶음 고르기
function themeOf(t,v){return t.sync?t.all:(t.tabs[v]||{})}
// 이미지 표시 설정 기본값: 비율(틀 모양), 맞춤(cover=꽉 채움/contain=전체), 확대(%), 가로·세로 위치(%), 너비(%)
var BAN_DEF={ratio:"2/1",fit:"cover",zoom:100,x:50,y:50,w:100};
db.banners=db.banners||{};   // 화면(day/week/month/money)마다 이미지를 따로: {src, ...설정}
// 예전(한 장을 모든 화면이 같이 쓰던) 이미지는 네 화면에 복사해 둔다
if(db.banner){["day","week","month","money"].forEach(function(v){if(!db.banners[v])db.banners[v]=Object.assign({src:db.banner},BAN_DEF)});db.banner=""}
// 이 화면의 이미지 설정 (빠진 항목은 기본값으로 채움). 없으면 null
function banner(){var B=db.banners[view];if(!B)return null;Object.keys(BAN_DEF).forEach(function(k){if(B[k]==null)B[k]=BAN_DEF[k]});return B}

// 현재 탭의 색을 화면에 적용 (CSS 변수 --bg --card --tx --ac 를 바꾼다). render()가 시작할 때마다 불린다
function applyTheme(){var r=document.documentElement.style,t=themeOf(db.theme,view==="set"?"day":view);
 [["bg","--bg"],["card","--card"],["tx","--tx"],["ac","--ac"]].forEach(function(p){if(t[p[0]])r.setProperty(p[1],t[p[0]]);else r.removeProperty(p[1])});
 if(t.bg||t.card||t.tx){r.setProperty("--cell","color-mix(in srgb,var(--tx) 8%,var(--card))");r.setProperty("--line","color-mix(in srgb,var(--tx) 18%,var(--card))");r.setProperty("--sub","color-mix(in srgb,var(--tx) 55%,var(--card))")}
 else["--cell","--line","--sub"].forEach(function(k){r.removeProperty(k)})}
applyTheme();

// 사진 고르기 → 가로 1600px 이하로 줄여서 이 화면의 이미지로 저장 (이미 있던 설정은 유지). 끝나면 편집 팝업을 연다
function pickBanner(){var f=el("input");f.type="file";f.accept="image/*";
 f.onchange=function(){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){
  var w=Math.min(1600,im.width),c=el("canvas");c.width=w;c.height=im.height*w/im.width;c.getContext("2d").drawImage(im,0,0,c.width,c.height);
  db.banners[view]=Object.assign({},BAN_DEF,db.banners[view],{src:c.toDataURL("image/jpeg",0.85)});save();render();openBanner()};im.src=fr.result};fr.readAsDataURL(f.files[0])};f.click()}
// 틀(fr)과 사진(im)에 설정을 적용: 비율을 고정한 틀 안에서 확대·위치를 맞춘다 (위쪽 칸에 둬도 옆 칸에 둬도 같은 비율)
function paintBanner(fr,im,B){var auto=B.ratio==="auto";
 fr.style.cssText="overflow:hidden;border-radius:14px;margin:0 auto;width:"+B.w+"%;"+(auto?"":"aspect-ratio:"+B.ratio+";");
 im.style.cssText=auto?"display:block;width:100%;height:auto":"display:block;width:100%;height:100%;object-fit:"+B.fit+";object-position:"+B.x+"% "+B.y+"%;transform:scale("+B.zoom/100+");transform-origin:"+B.x+"% "+B.y+"%"}

// 이미지 위젯(dayB): 제목줄에서 편집/삭제. 화면(일간·주간·월간·가계부)마다 다른 이미지
function renderBanner(){var b=$("dayB"),B=banner();b.innerHTML="";b.style.padding="0";b.style.overflow="hidden";
 var hd=el("div","row"),ed=el("button","sm",B?"편집":"+ 이미지 추가");hd.style.padding="10px 12px";ed.onclick=B?openBanner:pickBanner;hd.append(el("b",null,"이미지"),ed);
 if(B){var del=el("button","sm","삭제");del.onclick=function(){ask("이 화면의 이미지를 삭제할까요?",function(){delete db.banners[view];save();render()})};hd.appendChild(del)}
 b.appendChild(hd);var wrap=el("div");wrap.style.padding="0 12px 12px";b.appendChild(wrap);
 if(B){var fr=el("div"),im=el("img");im.src=B.src;paintBanner(fr,im,B);fr.appendChild(im);wrap.appendChild(fr)}
 else{wrap.appendChild(el("div","sub","이 화면에 넣을 이미지를 올려 보세요 (일간·주간·월간·가계부 각각 다르게 가능)"))}}

// 이미지 편집 팝업: 비율·맞춤·확대·위치·너비를 바꾸면 바로 미리보기에 반영된다. 닫으면 화면에 적용
function openBanner(){var B=banner(),ov=$("ov");if(!B)return;ov.hidden=false;ov.innerHTML="";
 var card=el("div","card"),pv=el("div"),im=el("img");im.src=B.src;pv.appendChild(im);
 var up=function(){paintBanner(pv,im,B);save()},add=function(label,x){var r=el("div","brow");r.append(el("span",null,label),x);card.appendChild(r)};
 var sel=function(k,opts){var s=el("select");opts.forEach(function(p){var o=el("option",null,p[1]);o.value=p[0];s.appendChild(o)});s.value=B[k];s.onchange=function(){B[k]=s.value;up()};return s};
 var rng=function(k,mn,mx){var r=el("input");r.type="range";r.min=mn;r.max=mx;r.value=B[k];r.oninput=function(){B[k]=+r.value;up()};return r};
 card.append(el("b",null,"이미지 편집 · "+({day:"일간",week:"주간",month:"월간",money:"가계부"}[view])),pv);up();
 add("비율",sel("ratio",[["auto","원본 비율"],["3/1","3:1 와이드"],["2/1","2:1"],["16/9","16:9"],["4/3","4:3"],["1/1","1:1 정사각"]]));
 add("맞춤",sel("fit",[["cover","꽉 채우기(잘림)"],["contain","전체 보기(여백)"]]));
 add("확대",rng("zoom",100,300));add("가로 위치",rng("x",0,100));add("세로 위치",rng("y",0,100));add("너비",rng("w",30,100));
 var b=el("div","btns"),ch=el("button",null,"이미지 바꾸기"),del=el("button","del","삭제"),cl=el("button",null,"닫기"),close=function(){ov.hidden=true;render()};
 ch.onclick=pickBanner;del.onclick=function(){ask("이 화면의 이미지를 삭제할까요?",function(){delete db.banners[view];save();ov.hidden=true;render()})};cl.onclick=close;
 b.append(del,ch,cl);card.appendChild(b);ov.appendChild(card);ov.onclick=function(e){if(e.target===ov)close()}}
// 일간 달력 위젯(dayC): 월간 달력과 같은 칸(calCell). 칸을 누르면 일간 화면에서 그 날로 이동
function renderMiniCal(){var b=$("dayC");b.innerHTML="";var y=cur.getFullYear(),mo=cur.getMonth(),g=el("div","mo"),hd=el("div","row");
 var mv=function(n){return function(){var m=mo+n;cur=new Date(y,m,Math.min(cur.getDate(),new Date(y,m+1,0).getDate()));render()}};
 var pb=el("button","sm","‹"),nb=el("button","sm","›"),tb=el("button","sm","오늘"),t=el("b",null,y+"년 "+(mo+1)+"월");pb.onclick=mv(-1);nb.onclick=mv(1);tb.onclick=function(){cur=new Date();render()};var ab=el("button","sm","+ 기념일");ab.onclick=function(){openAnniv(null)};hd.append(t,tb,pb,nb,ab);
 DN.forEach(function(n){g.appendChild(el("div","hd",n))});
 calDays(y,mo).forEach(function(cd){g.appendChild(calCell(cd,function(dt){cur=dt;render()}))});
 b.append(hd,g)}
// 설정 팝업: 탭별 색(또는 모든 탭 동기화), 태그 관리, 프리셋(색만, 최대 5개), 상단 이미지
function openSettings(){var ov=$("ov");ov.hidden=false;ov.innerHTML="";var card=el("div","card"),th=db.theme,cp=function(o){return JSON.parse(JSON.stringify(o))};
 card.appendChild(el("b",null,"설정 · 꾸미기"));card.appendChild(syncBox());
 // 동기화 스위치: 켜면 모든 탭이 같은 색, 끄면 탭마다 따로 (끌 때 탭별 색이 비어 있으면 지금 색을 복사해 시작)
 var lb=el("label","opt"),sy=el("input");sy.type="checkbox";sy.checked=th.sync;lb.append(sy,document.createTextNode("모든 탭 같은 색 사용 (동기화)"));
 sy.onchange=function(){th.sync=sy.checked;if(!th.sync)TABS.forEach(function(p){if(!Object.keys(th.tabs[p[0]]||{}).length)th.tabs[p[0]]=cp(th.all)});applyTheme();save();openSettings()};
 card.appendChild(lb);
 if(!th.sync){var tr=el("div","row");tr.style.margin="8px 0";   // 편집할 탭 고르기 (누르면 그 탭 화면으로 이동해서 바로 미리보기)
  TABS.forEach(function(p){var b=el("button","sm"+(setTab===p[0]?" on":""),p[1]);b.onclick=function(){setTab=p[0];view=p[0];render();openSettings()};tr.appendChild(b)});card.appendChild(tr)}
 var tgt=th.sync?th.all:(th.tabs[setTab]||(th.tabs[setTab]={}));
 [["bg","배경색","#f7f7f5"],["card","카드색","#ffffff"],["tx","글자색","#222222"],["ac","강조색","#3e63dd"]].forEach(function(f){
  var row=el("div","brow"),dot=el("button","cdot");dot.style.background=tgt[f[0]]||f[2];
  var pk=colorPicker(tgt[f[0]]||f[2],function(h){tgt[f[0]]=h;dot.style.background=h;applyTheme();save()});pk.hidden=true;
  dot.onclick=function(){pk.hidden=!pk.hidden};row.append(el("span",null,f[1]),dot);card.append(row,pk)});
 // 프리셋: 지금의 색 설정(동기화 여부, 탭별 색 포함)을 최대 5개까지 저장해 두고 불러온다. 이미지는 저장하지 않는다
 var pn=el("input");pn.placeholder="프리셋 이름";pn.maxLength=10;var ps=el("button",null,"현재 색 저장"),pr=el("div","row");
 ps.onclick=function(){if(db.presets.length>=5){tell("프리셋은 최대 5개예요. 하나를 지우고 저장해 주세요.");return}
  db.presets.push({name:pn.value.trim()||"프리셋 "+(db.presets.length+1),theme:cp(th)});save();openSettings()};
 pr.append(pn,ps);card.append(el("b",null,"프리셋 ("+db.presets.length+"/5)"),pr);
 db.presets.forEach(function(p,i){var row=el("div","brow"),df={bg:"#f7f7f5",card:"#ffffff",ac:"#3e63dd"},S=themeOf(p.theme,"day");
  ["bg","card","ac"].forEach(function(k){var d=el("i");d.style.cssText="width:14px;height:14px;border-radius:50%;border:1px solid var(--line);background:"+(S[k]||df[k]);row.appendChild(d)});
  var ap=el("button","chip",p.name+(p.theme.sync?"":" (탭별)"));ap.style.flex="1";ap.onclick=function(){db.theme=normTheme(cp(p.theme));applyTheme();save();render();openSettings()};
  var x=el("button","x","✕");x.onclick=function(){db.presets.splice(i,1);save();openSettings()};row.append(ap,x);card.appendChild(row)});
 // 반복 일정 목록 (눌러서 수정/삭제)
 var rl2=el("div","row");rl2.style.margin="6px 0 12px";
 db.repeats.forEach(function(r){var c=el("button","chip",r.n+" · "+repLabel(r));c.onclick=function(){openTask(r,{rule:true})};rl2.appendChild(c)});
 if(!db.repeats.length)rl2.appendChild(el("span","sub","없음 (할 일 추가 팝업에서 반복을 고르면 생겨요)"));card.append(el("b",null,"반복 일정"),rl2);card.append(dayStartBox());
 // 내보내기: 달을 고르고 JSON(전체 데이터) 또는 CSV(엑셀용 표)로 저장
 var ex=el("div","row"),ys=el("select"),ms=el("select"),y0=cur.getFullYear();ex.style.margin="6px 0 12px";
 for(var yy=y0-3;yy<=y0+1;yy++){var oy=el("option",null,yy+"년");oy.value=yy;ys.appendChild(oy)}ys.value=y0;
 for(var mm=1;mm<=12;mm++){var om=el("option",null,mm+"월");om.value=mm;ms.appendChild(om)}ms.value=cur.getMonth()+1;
 var ymf=function(){return ys.value+"-"+String(ms.value).padStart(2,"0")},ej=el("button","sm","JSON"),ec=el("button","sm","CSV (엑셀)");
 ej.onclick=function(){exportMonth(ymf(),"json")};ec.onclick=function(){exportMonth(ymf(),"csv")};
 ex.append(ys,ms,ej,ec);card.append(el("b",null,"이 달 데이터 내보내기"),ex);
 var r=el("div","btns");r.style.flexWrap="wrap";
 var a=el("button",null,"이 탭 이미지"),c=el("button",null,"이 탭 이미지 지우기"),s=el("button",null,th.sync?"색 초기화":"이 탭 색 초기화"),x=el("button",null,"닫기");
 a.onclick=pickBanner;c.onclick=function(){delete db.banners[view];save();render()};
 s.onclick=function(){Object.keys(tgt).forEach(function(k){delete tgt[k]});applyTheme();save();openSettings()};x.onclick=function(){ov.hidden=true};
 if(view==="set")r.append(s,x);else r.append(a,c,s,x);card.appendChild(r);ov.appendChild(card);ov.onclick=function(e){if(e.target===ov)ov.hidden=true}}
$("vs").onclick=function(){view="set";render()};   // 설정 탭 (기념일·태그). 꾸미기 등은 그 안의 버튼으로 기존 설정 창을 연다   // 설정을 열 때 지금 보는 탭부터 편집

// 폰↔PC 폭이 바뀌면 그 기기의 배치로 다시 그린다
var _dv=dev();addEventListener("resize",function(){if(dev()!==_dv){_dv=dev();render()}});
