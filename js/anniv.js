/* 기념일: 달력 칸에 이름이 떠요. 매년 반복하거나 그 해 한 번만. 설정 → 기념일에서 추가/수정/삭제 */
db.annivs=db.annivs||[];   // [{id,n,m,d,y,rep,color}]  (m=월, d=일, y=처음 등록한 해, rep=매년 반복)
// 그 날짜의 기념일 목록
function annivOn(dt){var m=dt.getMonth()+1,d=dt.getDate(),y=dt.getFullYear();return db.annivs.filter(function(a){return a.m===m&&a.d===d&&(a.rep||a.y===y)})}
// 기념일 추가/수정 팝업 (a가 null이면 새로 만든다)
function openAnniv(a){var ov=$("ov");ov.hidden=false;ov.innerHTML="";var card=el("div","card"),isNew=!a,st=a?Object.assign({},a):{n:"",m:cur.getMonth()+1,d:cur.getDate(),y:cur.getFullYear(),rep:true,color:"#e5484d"};
 var nm=el("input");nm.placeholder="기념일 이름 (예: 생일)";nm.value=st.n;nm.maxLength=20;
 var dt=el("input");dt.type="date";dt.value=st.y+"-"+String(st.m).padStart(2,"0")+"-"+String(st.d).padStart(2,"0");
 var lb=el("label","opt"),rp=el("input");rp.type="checkbox";rp.checked=st.rep;lb.append(rp,document.createTextNode("매년 반복"));
 var sw=el("div","sw"),draw=function(){sw.innerHTML="";PAL.forEach(function(c){var x=el("span",c===st.color?"on":"");x.style.background=c;x.onclick=function(){st.color=c;draw()};sw.appendChild(x)})};draw();
 var b=el("div","btns"),cc=el("button",null,"취소"),ok=el("button",null,"저장");ok.style.background="var(--ac)";ok.style.color="#fff";
 cc.onclick=function(){openSettings()};
 ok.onclick=function(){var n=nm.value.trim();if(!n){nm.focus();return}if(!dt.value){tell("날짜를 골라 주세요.");return}var p=dt.value.split("-");
  var o={id:a?a.id:Math.random().toString(36).slice(2),n:n,y:+p[0],m:+p[1],d:+p[2],rep:rp.checked,color:st.color};
  if(a)db.annivs[db.annivs.findIndex(function(q){return q.id===a.id})]=o;else db.annivs.push(o);save();render();openSettings()};
 b.append(cc);if(!isNew){var del=el("button","del","삭제");del.onclick=function(){db.annivs=db.annivs.filter(function(q){return q.id!==a.id});save();render();openSettings()};b.prepend(del)}b.append(ok);
 card.append(el("b",null,isNew?"기념일 추가":"기념일 수정"),nm,dt,lb,el("span","sub","표시 색"),sw,b);ov.appendChild(card);ov.onclick=function(e){if(e.target===ov)ov.hidden=true}}
// 설정 팝업의 기념일 칸
function annivBox(){var w=el("div","syncbox"),r=el("div","row");
 db.annivs.slice().sort(function(a,b){return a.m*100+a.d-(b.m*100+b.d)}).forEach(function(a){var c=el("button","chip",a.m+"/"+a.d+" "+a.n+(a.rep?"":" ("+a.y+")")),d=el("i");d.style.background=a.color;c.prepend(d);c.onclick=function(){openAnniv(a)};r.appendChild(c)});
 if(!db.annivs.length)r.appendChild(el("span","sub","없음"));
 var add=el("button","chip add","+ 추가");add.onclick=function(){openAnniv(null)};r.appendChild(add);
 var lb=el("label","opt"),cb=el("input");cb.type="checkbox";cb.checked=!!db.showCnt;lb.append(cb,document.createTextNode("달력 칸에 완료/전체 숫자(예: 3/9)도 보기"));
 cb.onchange=function(){db.showCnt=cb.checked;save();render()};
 w.append(el("b",null,"기념일"),r,lb);return w}
