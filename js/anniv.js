/* 기념일: 하루짜리 기념일, 기간(행사·여행)을 정할 수 있어요. 달력 칸·일간 위·주간 요일 칸에 떠요.
 * 설정 탭의 "기념일"에서 목록 보기·추가·수정, 달력 위젯의 "+ 기념일" 버튼으로도 추가해요.
 * "설정 탭에서만 보기"를 켜면 다른 화면(일간·주간·월간)에는 안 떠요. */
db.annivs=db.annivs||[];   // [{id,n,from:"YYYY-MM-DD",to:""|"YYYY-MM-DD",rep:매년반복,only:설정탭에서만,color}]
// 옛 형식({y,m,d})이면 새 형식으로 바꾼다
db.annivs.forEach(function(a){if(!a.from&&a.m){a.from=a.y+"-"+String(a.m).padStart(2,"0")+"-"+String(a.d).padStart(2,"0");a.to="";delete a.y;delete a.m;delete a.d}});
var DAY_MS=864e5;
// 기념일 a가 날짜 dt에 걸리면 {i:몇 일째, n:전체 며칠}, 아니면 null
function annivPos(a,dt){var k=key(dt),n=Math.round((Date.parse(a.to||a.from)-Date.parse(a.from))/DAY_MS)+1;if(n<1)n=1;
 if(!a.rep)return k>=a.from&&k<=(a.to||a.from)?{i:Math.round((Date.parse(k)-Date.parse(a.from))/DAY_MS)+1,n:n}:null;
 var f=a.from.split("-"),y=dt.getFullYear();
 for(var yy=y;yy>=y-1;yy--){if(yy<+f[0])continue;var s=new Date(yy,+f[1]-1,+f[2]),sk=key(s),ek=key(new Date(yy,+f[1]-1,+f[2]+n-1));if(k>=sk&&k<=ek)return{i:Math.round((Date.parse(k)-Date.parse(sk))/DAY_MS)+1,n:n}}
 return null}
// 그 날짜의 기념일 목록. all=true면 "설정 탭에서만 보기"도 포함
function annivOn(dt,all){return db.annivs.filter(function(a){return(all||!a.only)&&annivPos(a,dt)})}
// 오늘 기준 가장 가까운 기념일 시점: {d:남은 일수(0이면 오늘, 음수면 진행 중), prog:진행 중} / 지났으면 null
function annivWhen(a){var t0=new Date(),t=new Date(t0.getFullYear(),t0.getMonth(),t0.getDate()),f=a.from.split("-"),n=Math.round((Date.parse(a.to||a.from)-Date.parse(a.from))/DAY_MS),
 ys=a.rep?[t.getFullYear()-1,t.getFullYear(),t.getFullYear()+1]:[+f[0]],res=null;
 ys.forEach(function(y){if(res||(a.rep&&y<+f[0]))return;var s=new Date(y,+f[1]-1,+f[2]),e=new Date(y,+f[1]-1,+f[2]+n);if(e<t)return;res={d:Math.round((s-t)/DAY_MS),prog:s<=t}});return res}
function annivDate(a){var s=a.from.slice(5).replace("-","/").replace(/^0/,"").replace("/0","/"),e=a.to&&a.to!==a.from?a.to.slice(5).replace("-","/").replace(/^0/,"").replace("/0","/"):"";return e?s+"~"+e:s}

// 기념일 추가/수정 팝업 (a가 null이면 새로 만든다. 날짜는 지금 보는 날이 기본)
function openAnniv(a){var ov=$("ov");ov.hidden=false;ov.innerHTML="";var card=el("div","card"),isNew=!a,st=a?Object.assign({},a):{color:"#e5484d"};
 var nm=el("input");nm.placeholder="이름 (예: 생일, 제주 여행)";nm.value=a?a.n:"";nm.maxLength=20;
 var f=el("input"),t=el("input");f.type=t.type="date";f.value=a?a.from:key(cur);t.value=a&&a.to||"";
 var rl=el("div","row2");rl.append(f,t);
 var l1=el("label","opt"),rp=el("input");rp.type="checkbox";rp.checked=a?!!a.rep:true;l1.append(rp,document.createTextNode("매년 반복"));
 var l2=el("label","opt"),on=el("input");on.type="checkbox";on.checked=!!(a&&a.only);l2.append(on,document.createTextNode("설정 탭에서만 보기 (일간·주간·월간에는 안 떠요)"));
 var sw=el("div","sw"),draw=function(){sw.innerHTML="";PAL.forEach(function(c){var x=el("span",c===st.color?"on":"");x.style.background=c;x.onclick=function(){st.color=c;draw()};sw.appendChild(x)})};draw();
 var b=el("div","btns"),cc=el("button",null,"취소"),ok=el("button",null,"저장");ok.style.background="var(--ac)";ok.style.color="#fff";
 cc.onclick=function(){ov.hidden=true};
 ok.onclick=function(){var n=nm.value.trim();if(!n){nm.focus();return}if(!f.value){tell("시작 날짜를 골라 주세요.");return}
  if(t.value&&t.value<f.value){tell("종료일이 시작일보다 빨라요.");return}
  var o={id:a?a.id:Math.random().toString(36).slice(2),n:n,from:f.value,to:t.value&&t.value!==f.value?t.value:"",rep:rp.checked,only:on.checked,color:st.color};
  if(a)db.annivs[db.annivs.findIndex(function(q){return q.id===a.id})]=o;else db.annivs.push(o);save();ov.hidden=true;render()};
 b.append(cc);if(!isNew){var del=el("button","del","삭제");del.onclick=function(){ask("'"+a.n+"' 기념일을 삭제할까요?",function(){db.annivs=db.annivs.filter(function(q){return q.id!==a.id});save();ov.hidden=true;render()})};b.prepend(del)}b.append(ok);
 card.append(el("b",null,isNew?"기념일 추가":"기념일 수정"),nm,el("span","sub","시작일 · 종료일 (하루짜리면 종료일은 비워 두세요)"),rl,l1,l2,el("span","sub","표시 색"),sw,b);
 ov.appendChild(card);ov.onclick=function(e){if(e.target===ov)ov.hidden=true}}
// 설정 탭의 기념일 칸: 가까운 순서 목록 (누르면 수정)
function annivBox(){var w=el("div","syncbox"),hd=el("div","row"),add=el("button","sm","+ 기념일 추가");add.onclick=function(){openAnniv(null)};
 hd.append(el("b",null,"기념일 · 행사 · 여행"),add);w.appendChild(hd);
 var L=db.annivs.map(function(a){return{a:a,w:annivWhen(a)}}).sort(function(x,y){return(x.w?x.w.d:1e9)-(y.w?y.w.d:1e9)});
 L.forEach(function(q){var a=q.a,r=el("button","arow"),d=el("i");d.style.background=a.color;
  var wt=q.w?(q.w.prog?(q.w.d===0&&a.from===(a.to||a.from)?"D-day":"진행 중"):(q.w.d===0?"D-day":"D-"+q.w.d)):"지남";
  r.append(d,el("span","an1",a.n),el("span","sub",annivDate(a)+(a.rep?" · 매년":"")+(a.only?" · 여기서만":"")),el("span","dd",wt));r.onclick=function(){openAnniv(a)};w.appendChild(r)});
 if(!L.length)w.appendChild(el("span","sub","아직 없어요. 달력 위젯의 \"+ 기념일\" 버튼으로도 추가할 수 있어요."));
 return w}
