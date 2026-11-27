/* 기념일: 하루짜리, 기간(행사·여행), 반복(N년/N개월/N일마다)을 정할 수 있어요.
 * 기념일 탭에서 달력으로 보고 추가·수정하고, 달력 위젯의 "+ 기념일"로도 추가해요.
 * 달력 칸·일간 위·주간 요일 칸에도 떠요. "기념일 탭에서만 보기"를 켠 것만 다른 화면에서 빠져요. */
db.annivs=db.annivs||[];   // [{id,n,from:"YYYY-MM-DD",to:""|"YYYY-MM-DD",ru:""|"y"|"m"|"d"(반복 단위),rn:간격,only,color}]
// 옛 형식 바꾸기: {y,m,d} → from/to, rep(매년 반복) → ru/rn
db.annivs.forEach(function(a){if(!a.from&&a.m){a.from=a.y+"-"+String(a.m).padStart(2,"0")+"-"+String(a.d).padStart(2,"0");a.to="";delete a.y;delete a.m;delete a.d}
 if(a.ru===undefined){a.ru=a.rep?"y":"";a.rn=1;delete a.rep}});
var DAY_MS=864e5;
function dd(k1,k2){return Math.round((Date.parse(k2)-Date.parse(k1))/DAY_MS)}   // 두 날짜 키 사이의 일수
function annivLen(a){return Math.max(1,dd(a.from,a.to||a.from)+1)}   // 며칠짜리인지
// k번째 반복(0=처음)의 시작 날짜 키. 개월·년은 그 달에 없는 날이면 말일로 맞춘다
function annivStartKey(a,k){var f=a.from.split("-"),rn=Math.max(1,+a.rn||1);if(!k)return a.from;
 if(a.ru==="d")return key(new Date(+f[0],+f[1]-1,+f[2]+k*rn));
 var m0=+f[1]-1+(a.ru==="y"?12:1)*rn*k,yy=+f[0]+Math.floor(m0/12),mm=((m0%12)+12)%12;return key(new Date(yy,mm,Math.min(+f[2],new Date(yy,mm+1,0).getDate())))}
// 날짜 dt 근처의 반복 번호 추정
function annivEst(a,dt){var rn=Math.max(1,+a.rn||1);if(a.ru==="d")return Math.floor(dd(a.from,key(dt))/rn);var f=a.from.split("-"),M=(dt.getFullYear()-+f[0])*12+dt.getMonth()-(+f[1]-1);return Math.floor(M/((a.ru==="y"?12:1)*rn))}
// 기념일 a가 날짜 dt에 걸리면 {i:몇 일째, n:전체 며칠}, 아니면 null
function annivPos(a,dt){var k=key(dt),n=annivLen(a);if(k<a.from)return null;
 if(!a.ru)return k<=addDays(a.from,n-1)?{i:dd(a.from,k)+1,n:n}:null;
 for(var q=annivEst(a,dt);q>=Math.max(0,annivEst(a,dt)-2);q--){var s=annivStartKey(a,q);if(k>=s&&k<=addDays(s,n-1))return{i:dd(s,k)+1,n:n}}
 return null}
// 그 날짜의 기념일 목록. all=true면 "기념일 탭에서만 보기"도 포함
function annivOn(dt,all){return db.annivs.filter(function(a){return(all||!a.only)&&annivPos(a,dt)})}
// 오늘 기준 가장 가까운 기념일 시점: {d:남은 일수, prog:진행 중이거나 오늘} / 지났으면 null
function annivWhen(a){var t=key(new Date()),n=annivLen(a);
 if(!a.ru){var e=addDays(a.from,n-1);return e<t?null:{d:dd(t,a.from),prog:a.from<=t}}
 var est=annivEst(a,new Date());for(var q=Math.max(0,est-2);q<Math.max(est+3,3);q++){var s=annivStartKey(a,q);if(addDays(s,n-1)>=t)return{d:dd(t,s),prog:s<=t}}return null}
function md2(k){return(+k.slice(5,7))+"/"+(+k.slice(8,10))}
// 날짜·반복 설명: "11/24~11/26 · 매년" / "3/1 · 100일마다"
function annivDate(a){var s=md2(a.from)+(a.to&&a.to!==a.from?"~"+md2(a.to):""),rn=+a.rn||1;
 return s+(a.ru?" · "+(rn===1?(a.ru==="y"?"매년":a.ru==="m"?"매월":"매일"):rn+(a.ru==="y"?"년":a.ru==="m"?"개월":"일")+"마다"):"")}

// 기념일 추가/수정 팝업 (a가 null이면 새로 만든다. dk는 새로 만들 때 기본 날짜, 없으면 지금 보는 날)
function openAnniv(a,dk){var ov=$("ov");ov.hidden=false;ov.innerHTML="";var card=el("div","card"),isNew=!a,st={color:a?a.color:"#e5484d"};
 var nm=el("input");nm.placeholder="이름 (예: 생일, 제주 여행)";nm.value=a?a.n:"";nm.maxLength=20;
 var f=el("input"),t=el("input");f.type=t.type="date";f.value=a?a.from:(dk||key(cur));t.value=a&&a.to||"";
 var rl=el("div","row2");rl.append(f,t);
 var rr=el("div","row"),num=el("input"),un=el("select");num.type="number";num.min=1;num.max=999;num.value=a?(a.rn||1):1;num.style.flex="0 0 80px";
 [["","반복 안 함"],["y","년마다"],["m","개월마다"],["d","일마다"]].forEach(function(p){var o=el("option",null,p[1]);o.value=p[0];un.appendChild(o)});un.value=a?(a.ru||""):"y";un.style.flex="1";
 var sh=function(){num.hidden=!un.value};un.onchange=sh;sh();rr.append(num,un);
 var l2=el("label","opt"),on=el("input");on.type="checkbox";on.checked=!!(a&&a.only);l2.append(on,document.createTextNode("기념일 탭에서만 보기 (일간·주간·월간에는 안 떠요)"));
 var sw=el("div","sw"),draw=function(){sw.innerHTML="";PAL.forEach(function(c){var x=el("span",c===st.color?"on":"");x.style.background=c;x.onclick=function(){st.color=c;draw()};sw.appendChild(x)})};draw();
 var b=el("div","btns"),cc=el("button",null,"취소"),ok=el("button",null,"저장");ok.style.background="var(--ac)";ok.style.color="#fff";
 cc.onclick=function(){ov.hidden=true};
 ok.onclick=function(){var n=nm.value.trim();if(!n){nm.focus();return}if(!f.value){tell("시작 날짜를 골라 주세요.");return}
  if(t.value&&t.value<f.value){tell("종료일이 시작일보다 빨라요.");return}
  var rn=Math.max(1,Math.min(999,Math.round(+num.value||1)));
  var o={id:a?a.id:Math.random().toString(36).slice(2),n:n,from:f.value,to:t.value&&t.value!==f.value?t.value:"",ru:un.value,rn:rn,only:on.checked,color:st.color};
  if(a)db.annivs[db.annivs.findIndex(function(q){return q.id===a.id})]=o;else db.annivs.push(o);save();ov.hidden=true;render()};
 b.append(cc);if(!isNew){var del=el("button","del","삭제");del.onclick=function(){ask("'"+a.n+"' 기념일을 삭제할까요?",function(){db.annivs=db.annivs.filter(function(q){return q.id!==a.id});save();ov.hidden=true;render()})};b.prepend(del)}b.append(ok);
 card.append(el("b",null,isNew?"기념일 추가":"기념일 수정"),nm,el("span","sub","시작일 · 종료일 (하루짜리면 종료일은 비워 두세요)"),rl,el("span","sub","반복 (예: 1년마다, 100일마다, 3개월마다)"),rr,l2,el("span","sub","표시 색"),sw,b);
 ov.appendChild(card);ov.onclick=function(e){if(e.target===ov)ov.hidden=true}}

// 기념일 목록: 가까운 순서 (누르면 수정)
function annivBox(){var w=el("div","syncbox");w.appendChild(el("b",null,"목록 (가까운 순)"));
 var L=db.annivs.map(function(a){return{a:a,w:annivWhen(a)}}).sort(function(x,y){return(x.w?x.w.d:1e9)-(y.w?y.w.d:1e9)});
 L.forEach(function(q){var a=q.a,r=el("button","arow"),d=el("i");d.style.background=a.color;
  var wt=q.w?(q.w.prog&&q.w.d<0?"진행 중":q.w.d===0?"D-day":"D-"+q.w.d):"지남";
  r.append(d,el("span","an1",a.n),el("span","sub",annivDate(a)+(a.only?" · 여기서만":"")),el("span","dd",wt));r.onclick=function(){openAnniv(a)};w.appendChild(r)});
 if(!L.length)w.appendChild(el("span","sub","아직 없어요. 위의 \"+ 기념일\"이나 달력의 빈 칸을 눌러 추가해요."));
 return w}
// 기념일 탭: 달력(‹ ›로 달 이동) + 목록. 빈 칸을 누르면 그 날짜로 추가, 이름을 누르면 수정
var anM=null;   // 이 탭에서 보는 달(1일)
function renderAnn(){var b=$("anP");b.innerHTML="";if(!anM)anM=new Date(cur.getFullYear(),cur.getMonth(),1);var y=anM.getFullYear(),mo=anM.getMonth();
 var hd=el("div","row"),tt=el("b",null,y+"년 "+(mo+1)+"월"),pv=el("button","sm","‹"),nx=el("button","sm","›"),td=el("button","sm","오늘"),ad=el("button","sm","+ 기념일");tt.style.flex="1";
 pv.onclick=function(){anM=new Date(y,mo-1,1);renderAnn()};nx.onclick=function(){anM=new Date(y,mo+1,1);renderAnn()};td.onclick=function(){anM=null;renderAnn()};ad.onclick=function(){openAnniv(null,key(new Date(y,mo,1)))};
 hd.append(tt,td,pv,nx,ad);var g=el("div","mo");DN.forEach(function(n){g.appendChild(el("div","hd",n))});
 calDays(y,mo).forEach(function(cd){var dt=cd.dt,k=key(dt),box=el("div","md"+(cd.out?" out":"")+(k===key(new Date())?" tdy":""));box.appendChild(el("span","n",String(dt.getDate())));
  if(!cd.out)annivOn(dt,true).forEach(function(a){var p=annivPos(a,dt),s=el("span","an"+(p.n>1?" rg":"")+(a.only?" only":""),a.n);s.style.color=a.color;if(p.n>1)s.style.background=a.color+"26";s.title=a.n+(p.n>1?" ("+p.i+"/"+p.n+"일째)":"");s.onclick=function(e){e.stopPropagation();openAnniv(a)};box.appendChild(s)});
  box.onclick=function(){openAnniv(null,k)};g.appendChild(box)});
 b.append(hd,g,annivBox())}
