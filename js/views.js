/* 주간·월간 화면과 그 위의 체크리스트 */
// 주간/월간 체크리스트 (시간 없이 체크만): 일간처럼 태그별 묶음 + ⠿ 끌어서 순서 변경 + 팝업으로 추가/수정
function renderCL(box,arr,title){box.innerHTML="";box.className="cl";
 var shown=arr.filter(function(t){return filt==="all"||t.tag===filt}),dn=shown.filter(function(t){return t.d}).length;
 var f=el("button","addbtn","+ 항목 추가");f.onclick=function(){openTask(null,{arr:arr,noTime:true})};
 var G=mkGroups(arr,function(tag){openTask(null,{arr:arr,noTime:true,tag:tag})});
 shown.forEach(function(t){var tg=tagOf(t.tag),li=el("li",t.d?"done":""),r=el("div","r"),cb=el("input");cb.type="checkbox";cb.checked=t.d;cb.onchange=function(){t.d=cb.checked;save();render()};
  var dot=el("span","dot");dot.style.background=tg.color;var nm=el("span","t",t.n);if(t.memo)nm.appendChild(el("div","memo",t.memo));
  var eb=el("button","x","✎");eb.onclick=function(){openTask(t,{noTime:true})};var x=el("button","x","✕");x.onclick=function(){arr.splice(arr.indexOf(t),1);save();render()};
  r.append(cb,dot,nm,eb,x);li.appendChild(r);G.put(t,li);dragSort(li,r,t,arr)});
 G.fin();box.append(el("b",null,title+(shown.length?"  ✓ "+dn+"/"+shown.length:"")),f,G.root)}
// 주간 화면: 7일 × 시간 격자와 주간 통계
function renderWeek(){
 var wkk=key(weekStart());renderCL($("wkCL"),db.weeks[wkk]||(db.weeks[wkk]=[]),"주간 체크리스트");
 var w=$("wk");w.innerHTML="";var ws=weekStart(),days=[],tot={},td=key(new Date());
 w.appendChild(el("div"));
 for(var i=0;i<7;i++){var d=new Date(ws);d.setDate(ws.getDate()+i);days.push(d);
  var h=el("div","hd d"+(key(d)===td?" tdy":""),DN[i]+" "+d.getDate());
  annivOn(d).forEach(function(a){var ad=el("i","adot");ad.style.background=a.color;ad.title=a.n;h.appendChild(ad)});   /* 기념일 점 */
  (function(d){h.onclick=function(){cur=d;view="day";render()}})(d);w.appendChild(h);addMin(dayT(d),tot)}var PS=days.map(function(d){return paint(dayT(d).concat(spillT(d)))});
 for(var hr=H0;hr<H1;hr++){w.appendChild(el("div","hr"+(hr>=24?" nx":""),(hr%24)+"시"));
  days.forEach(function(d,di){var A=PS[di],hc=el("div","hc");
   for(var c=0;c<6;c++){var a=hr*60+c*10,s=el("b");s.style.backgroundImage=bg(A,a);hc.appendChild(s)}
   w.appendChild(hc)})}
 showStats($("stW"),tot)}

// 달력 칸 하나(월간·일간 달력이 똑같이 쓴다): 날짜 + 완료한 일 점(태그/지정 색, 최대 6개) + 완료/전체(다 하면 강조색) + 태그별 시간 막대.
// 앞뒤 달(cd.out) 칸은 어둡게 날짜만. tot를 주면 이 달 시간 통계에 더한다
function calCell(cd,onPick,tot){var dt=cd.dt,k=key(dt),box=el("div","md"+(cd.out?" out":"")+(k===key(cur)?" sel":"")+(k===key(new Date())?" tdy":""));
 box.appendChild(el("span","n",String(dt.getDate())));
 if(!cd.out){var T=dayT(dt),dm={},dn=T.filter(function(t){return t.d});addMin(T,dm);if(tot)addMin(T,tot);
  if(dn.length){var dots=el("div","dots");dn.slice(0,6).forEach(function(t){var i=el("i");i.style.background=t.color||tagOf(t.tag).color;dots.appendChild(i)});box.appendChild(dots)}
  if(T.length&&db.showCnt)box.appendChild(el("span",dn.length===T.length?"all":null,dn.length+"/"+T.length));
  var ks=Object.keys(dm);if(ks.length){var sum=ks.reduce(function(a,k2){return a+dm[k2]},0),bar=el("div","bar");
   ks.forEach(function(k2){var s=el("span");s.style.background=tagOf(k2).color;s.style.flex=dm[k2]/Math.max(sum,1);bar.appendChild(s)});box.appendChild(bar)}}
 if(!cd.out){annivOn(dt).forEach(function(a){var p=annivPos(a,dt),s=el("span","an"+(p.n>1?" rg":""),a.n);s.style.color=a.color;if(p.n>1)s.style.background=a.color+"26";s.title=a.n+(p.n>1?" ("+p.i+"/"+p.n+"일째)":"");box.appendChild(s)})}   /* 기념일 (anniv.js) */
 box.onclick=function(){onPick(dt)};return box}

// 월간 화면: 달력과 월 통계. 칸을 누르면 그 날의 일간 화면으로 이동
function renderMonth(){var m=$("mo");m.innerHTML="";var mb=$("moG"),ob=mb.querySelector(".annbtn");if(ob)ob.remove();var ab=el("button","sm annbtn","+ 기념일");ab.onclick=function(){openAnniv(null)};mb.insertBefore(ab,mb.firstChild);var y=cur.getFullYear(),mo=cur.getMonth(),tot={},mk=y+"-"+(mo+1);
 renderCL($("moCL"),db.months[mk]||(db.months[mk]=[]),"월간 체크리스트");
 DN.forEach(function(n){m.appendChild(el("div","hd",n))});
 calDays(y,mo).forEach(function(cd){m.appendChild(calCell(cd,function(dt){cur=dt;view="day";render()},tot))});
 showStats($("stM"),tot)}
// 주차 달력 위젯(wkP): 한 달을 "1주차, 2주차…" 행으로 보여주고(앞뒤 달 날짜는 어둡게), 행이나 날짜를 누르면 그 주로 이동
function renderWeekPick(){var b=$("wkP");b.innerHTML="";var y=cur.getFullYear(),mo=cur.getMonth(),days=calDays(y,mo),ck=key(cur),td=key(new Date()),
 sel=Math.floor(days.findIndex(function(c){return key(c.dt)===ck})/7);
 var hd=el("div","row"),t=el("b",null,y+"년 "+(mo+1)+"월 · "+(sel+1)+"주차"),pb=el("button","sm","‹"),nb=el("button","sm","›"),tb=el("button","sm","오늘");
 var mv=function(k){return function(){cur=new Date(y,mo+k,1);render()}};pb.onclick=mv(-1);nb.onclick=mv(1);tb.onclick=function(){cur=new Date();render()};hd.append(t,tb,pb,nb);
 var g=el("div","wp");g.appendChild(el("div"));DN.forEach(function(x){g.appendChild(el("div","hd",x))});
 for(var r=0;r<days.length/7;r++)(function(r){var row=days.slice(r*7,r*7+7),go=function(d){return function(){cur=d;render()}},first=(row.filter(function(c){return !c.out})[0]||row[0]).dt,l=el("div","wl"+(r===sel?" rs":""),(r+1)+"주차");
  l.onclick=go(first);g.appendChild(l);
  row.forEach(function(c){var k=key(c.dt),e=el("div","wd"+(c.out?" out":"")+(r===sel?" rs":"")+(k===td?" tdy":""),String(c.dt.getDate()));e.onclick=go(c.dt);g.appendChild(e)})})(r);
 b.append(hd,g)}
// 월 선택 위젯(moP): 연도를 ‹ ›로 바꾸고 1월~12월 중 하나를 누른다
function renderMonPick(){var b=$("moP");b.innerHTML="";var y=cur.getFullYear(),mo=cur.getMonth(),hd=el("div","row"),t=el("b",null,y+"년"),pb=el("button","sm","‹"),nb=el("button","sm","›"),tb=el("button","sm","올해"),g=el("div","mp");t.style.flex="1";
 var go=function(yy,mm){cur=new Date(yy,mm,Math.min(cur.getDate(),new Date(yy,mm+1,0).getDate()));render()};
 pb.onclick=function(){go(y-1,mo)};nb.onclick=function(){go(y+1,mo)};tb.onclick=function(){var n=new Date();go(n.getFullYear(),n.getMonth())};hd.append(t,tb,pb,nb);
 for(var i=0;i<12;i++)(function(i){var m=el("button",i===mo?"sel":"",(i+1)+"월");m.onclick=function(){go(y,i)};g.appendChild(m)})(i);
 b.append(hd,g)}
