/* 일간 화면: 체크리스트/시간표, 할 일 수정 팝업, 일기 */
var dragT=null,gridPend=null;   // gridPend: 시간표에서 "시작 칸"만 눌러 둔 상태(분)
   // 끌고 있는 할 일의 id
// 일간 화면: 체크리스트, 시간표 격자, 시간 배분 통계
function renderDay(){
 var T=dayT(cur).slice();   // 순서는 사용자가 정한 대로(allOf 배열 순서)
 var ul=$("list");ul.innerHTML="";
 var dl=$("dayL"),oa=dl.querySelector(".dayan");if(oa)oa.remove();var an=annivOn(cur);   // 오늘의 기념일 (anniv.js)
 if(an.length){var da=el("div","dayan");an.forEach(function(a){var p=annivPos(a,cur),c=el("span","achip",a.n+(p.n>1?" ("+p.i+"/"+p.n+"일째)":""));c.style.borderColor=c.style.color=a.color;da.appendChild(c)});dl.insertBefore(da,dl.firstChild)}
 // 태그(분류)마다 묶음 상자: 제목 칩 + "+"(그 태그로 바로 추가). 칸 위로 끌어다 놓으면 분류가 바뀐다
 var GR={},mkG=function(id,tg){var w=el("div","grp"),h=el("div","gh"),u=el("ul");
  if(tg){var gn=el("span","gn",tg.name);gn.style.color=tg.color;var pl=el("button","gp","+");pl.title=tg.name+"에 할 일 추가";pl.onclick=function(){openTask(null,{arr:allOf(cur),tag:tg.id})};h.append(gn,pl)}else h.appendChild(el("span","gn","태그 없음"));
  w.dataset.gid=id;w.append(h,u);w.ondragover=function(e){e.preventDefault()};
  w.ondrop=function(e){if(!dragT)return;e.preventDefault();var all=allOf(cur),f=all.findIndex(function(q){return q.id===dragT}),it=all.splice(f,1)[0];it.tag=id;all.push(it);dragT=null;save();render()};
  ul.appendChild(w);GR[id]=u;return w};
 db.tags.forEach(function(tg){mkG(tg.id,tg)});var w0=mkG("",null);
 T.forEach(function(t){
  var tg=tagOf(t.tag),li=el("li",t.d?"done":""),r=el("div","r");
  var cb=el("input");cb.type="checkbox";cb.checked=t.d;cb.onchange=function(){t.d=cb.checked;save();render()};
  var dot=el("span","dot");dot.style.background=tg.color;
  dot.style.background=t.color||tg.color;var nm2=el("span","t",(t.rid?"↻ ":"")+t.n);if(t.memo)nm2.appendChild(el("div","memo",t.memo));
  if(t.s!=null)nm2.insertBefore(el("div","tm2",hmL(t.s)+"–"+hmL(t.e)),nm2.querySelector(".memo"));   /* 시간은 이름 아래 줄에 */
  r.append(cb,dot,nm2);var eb=el("button","sm","✎");eb.onclick=function(){openTask(t)};r.appendChild(eb);
  if(t.s!=null){var gb=el("button","sm","빈 시간");gb.onclick=function(){openGap=openGap===t.id?null:t.id;render()};r.appendChild(gb)}
  var x=el("button","x","✕");x.onclick=function(){if(t.rid){var rr=db.repeats.find(function(q){return q.id===t.rid});if(rr)(rr.skip=rr.skip||[]).push(key(cur))}   /* 반복 할 일을 지우면 그 날은 다시 만들지 않는다 */
   var a=allOf(cur);a.splice(a.indexOf(t),1);save();render()};
  r.appendChild(x);li.appendChild(r);
  if(t.s!=null&&(t.gaps.length||openGap===t.id)){var g=el("div","gaps");
   t.gaps.forEach(function(q,i){var ch=el("span","chip","쉬는 시간 "+hmL(q.s)+"–"+hmL(q.e)+" ✕");ch.onclick=function(){t.gaps.splice(i,1);save();render()};g.appendChild(ch)});
   if(openGap===t.id){var a=el("input");a.type="time";a.step=60;a.value=hm(t.s);var b=el("input");b.type="time";b.step=60;b.value=hm(Math.min(t.s+30,t.e));
    var ok=el("button","sm","추가");ok.onclick=function(){var gs=toM(a.value),ge=toM(b.value);if(ge<gs)ge+=1440;   /* 끝이 더 빠르면 다음 날로 이어짐 */
     if(ge<=gs){tell("끝 시간이 더 늦어야 해요.");return}
     if(gs<t.s||ge>t.e){tell("할 일 시간("+hmL(t.s)+"–"+hmL(t.e)+") 안에서 정해 주세요.");return}
     t.gaps.push({s:gs,e:ge});save();render()};
    g.append(a,el("span","sub","~"),b,ok)}
   li.appendChild(g)}
  GR[GR[t.tag]?t.tag:""].appendChild(li);
  dragSort(li,r,t,allOf(cur));   /* 순서 바꾸기 (grouplist.js) */
  });
 if(!GR[""].children.length)w0.remove();   // 태그 없는 할 일이 없으면 그 묶음은 감춘다
 Object.keys(GR).forEach(function(id){if(!GR[id].children.length)GR[id].parentNode.classList.add("emp")});   // 할 일이 없는 태그 묶음은 숨긴다 (끌 때만 보임)
 var g=$("grid");g.innerHTML="";g.appendChild(el("div"));var A=paint(paintT(cur));
 for(var m=0;m<6;m++)g.appendChild(el("div","hd",m*10+"분"));
 for(var hr=H0;hr<H1;hr++){g.appendChild(el("div","hr"+(hr>=24?" nx":""),(hr%24)+"시"));
  for(var c=0;c<6;c++){var a2=hr*60+c*10,cell=el("div","c");cell.style.backgroundImage=bg(A,a2);cell.dataset.m=a2;g.appendChild(cell)}}
 // 시간표 선택: 마우스는 끌어서 범위 선택, 터치는 "시작 칸 → 끝 칸"을 차례로 탭(스크롤과 안 겹치게). 같은 칸을 두 번 누르면 10분
 var sel0=null,mark=function(a,b){g.querySelectorAll(".c").forEach(function(x){var m=+x.dataset.m;x.classList.toggle("pick",a!=null&&m>=Math.min(a,b)&&m<=Math.max(a,b))})};
 var cellAt=function(ev){var q=document.elementFromPoint(ev.clientX,ev.clientY);return q&&q.dataset&&q.dataset.m!=null?+q.dataset.m:null};
 var finish=function(a,b){gridPend=null;mark(null);openTask(null,{arr:allOf(cur),s:a,e:b,nl:true})};   /* 시간표를 끌어 고르면 기본은 "시간표에만 칠하기" */
 g.onpointerdown=function(e){var m=cellAt(e);if(m==null)return;if(e.pointerType==="mouse"){e.preventDefault();g.setPointerCapture(e.pointerId)}sel0=m;mark(m,m)};
 g.onpointermove=function(e){if(sel0==null)return;var m=cellAt(e);if(m!=null)mark(sel0,m)};
 g.onpointercancel=function(){sel0=null;mark(gridPend,gridPend)};
 g.onpointerup=function(e){if(sel0==null)return;var m=cellAt(e),s0=sel0;sel0=null;if(m==null)m=s0;
  if(m!==s0){finish(Math.min(s0,m),Math.max(s0,m)+10);return}
  if(gridPend==null){gridPend=s0;mark(s0,s0);return}
  finish(Math.min(gridPend,s0),Math.max(gridPend,s0)+10)};
 mark(gridPend,gridPend);
 var oldT=g.parentNode.querySelector(".tbl");if(oldT)oldT.remove();   /* 시간표에만 칠한 일정 목록 */
 var tl=tbT(cur);if(tl.length){var bx=el("div","tbl");bx.appendChild(el("span","sub","시간표에만 칠한 일정 (체크리스트에는 없어요)"));
  tl.forEach(function(t){var r=el("div","row"),d=el("i");d.style.background=t.color||tagOf(t.tag).color;var eb=el("button","sm","✎");eb.onclick=function(){openTask(t,{tb:true})};
   r.append(d,el("span","t",(t.rid?"↻ ":"")+t.n),el("span","tm",hmL(t.s)+"–"+hmL(t.e)),eb);bx.appendChild(r)});g.after(bx)}
 var sp=spillT(cur),old=g.parentNode.querySelector(".spn");if(old)old.remove();   /* 전날에서 이어진 일정 안내 */
 if(sp.length){var sn=el("p","sub spn","어제에서 이어진 일정: "+sp.map(function(t){return t.n+" (~"+hm(t.e)+")"}).join(", "));g.after(sn)}
 var tot={};addDayMin(cur,tot);showStats($("stD"),tot)}

// 할 일 추가/수정 팝업. t가 null이면 새로 추가.
//   o={arr:추가할 배열, tag:미리 고를 태그, noTime:true(주간/월간 체크리스트: 시간·색·반복 없음), n/memo:다시 열 때 채울 글자, rule:true(t가 반복 규칙)}
function openTask(t,o){o=o||{};var R=o.rule?t:null,isNew=!t,ov=$("ov");ov.hidden=false;ov.innerHTML="";
 var st={color:t&&t.color||null,wd:(R&&R.wd?R.wd.slice():[cur.getDay()])},card=el("div","card"),nm=el("input"),mm=el("textarea"),tg=el("select"),tr0=el("div","row"),cnt=db.tags.length,rp=null,dm,fr,to,
  s=el("input"),e=el("input"),fi=el("input"),nlI=el("input"),dtI=null,cpI=null;
 nm.value=t?t.n:(o.n||"");nm.placeholder="할 일 (예: 영어 공부)";mm.rows=3;mm.placeholder="메모 (선택)";mm.value=t?(t.memo||""):(o.memo||"");
 db.tags.forEach(function(x){var q=el("option",null,x.name);q.value=x.id;tg.appendChild(q)});var n0=el("option",null,"태그 없음");n0.value="";tg.appendChild(n0);tg.value=t?t.tag:(o.tag||"");tg.style.flex="1";
 var nt=el("button","sm","+ 태그");   // 태그를 새로 만들고 돌아오면 입력하던 글자와 새 태그가 그대로 채워진다
 nt.onclick=function(){var sv={n:nm.value,memo:mm.value,tag:tg.value,s:(!o.noTime&&s.value)?toM(s.value):null,e:(!o.noTime&&e.value)?toM(e.value):null};openModal(null,undefined,function(){openTask(t,{arr:o.arr,noTime:o.noTime,rule:o.rule,tb:o.tb,nl:!o.noTime&&nlI.checked,n:sv.n,memo:sv.memo,s:sv.s,e:sv.e,tag:db.tags.length>cnt?db.tags[db.tags.length-1].id:sv.tag})})};
 tr0.append(tg,nt);card.append(el("b",null,R?"반복 일정 수정":o.tb?"시간표 칠하기 수정":isNew?"할 일 추가":"할 일 수정"),nm,tr0);
 // 날짜: 바꾸고 저장하면 그 날로 옮겨진다 (반복 규칙·주간/월간 체크리스트에는 없다)
 if(!R&&!o.noTime&&(isNew?o.arr===allOf(cur):(o.tb?tbOf(key(cur)):allOf(cur)).indexOf(t)>=0)){var dr0=el("div","row");dtI=el("input");dtI.type="date";dtI.value=key(cur);dtI.style.flex="1";dr0.appendChild(dtI);
  [["내일",1],["다음 주",7]].forEach(function(q){var bb=el("button","sm",q[0]);bb.onclick=function(){dtI.value=addDays(key(cur),q[1])};dr0.appendChild(bb)});
  card.append(el("span","sub",isNew?"날짜":"날짜 (바꾸고 저장하면 그 날로 옮겨져요)"),dr0)}
 var det=el("details","more");det.appendChild(el("summary",null,"옵션 (메모 · 색 · 반복)"));
 if(o.noTime){card.appendChild(mm)}   // 주간/월간 체크리스트: 이름·태그·메모만
 else{
  // 시간: 기본은 빈칸. 시작·끝을 넣어야 시간표에 칠해진다 (끝만 비우면 1시간)
  var S0=o.s!=null?o.s:(t&&t.s!=null?t.s:null),E0=o.e!=null?o.e:(t&&t.e!=null?t.e:null);
  s.type=e.type="time";s.step=e.step=60;s.value=S0!=null?hm(S0):"";e.value=E0!=null?hm(E0):"";
  var tm=el("div","row2"),hint=el("span","sub"),clr=el("button","sm","시간 지우기"),hr0=el("div","row");hint.style.flex="1";
  var upd=function(){hint.textContent=(s.value&&e.value&&toM(e.value)<toM(s.value))?"끝이 시작보다 빨라서 다음 날까지 이어져요":(s.value||e.value?"":"시간을 넣으면 시간표에 칠해져요")};
  s.oninput=e.oninput=upd;clr.onclick=function(){s.value=e.value="";upd()};upd();tm.append(s,e);hr0.append(hint,clr);card.append(el("span","sub","시작 · 끝 시간"),tm,hr0);
  var nll=el("label","opt");nlI.type="checkbox";nlI.checked=!!(o.tb||(R&&R.nl)||o.nl);nll.append(nlI,document.createTextNode("체크리스트 없이 시간표에만 칠하기"));card.appendChild(nll);
  var fl=el("label","opt");fi.type="checkbox";fi.checked=!!(t&&t.fill);fl.append(fi,document.createTextNode("체크 안 해도 시간표에 칠하기 (수업·고정 일정)"));
  var sw=el("div","sw"),drawSw=function(){sw.innerHTML="";var au=el("span","auto"+(st.color?"":" on"),"태그 색");au.onclick=function(){st.color=null;drawSw()};sw.appendChild(au);
   PAL.forEach(function(c){var x=el("span",c===st.color?"on":"");x.style.background=c;x.onclick=function(){st.color=c;drawSw()};sw.appendChild(x)});
   var cu2=st.color&&PAL.indexOf(st.color)<0,cu=el("span",cu2?"on":"");cu.style.background=cu2?st.color:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)";cu.onclick=function(){pk.hidden=!pk.hidden};sw.appendChild(cu)};
  var pk=colorPicker(st.color||"#3e63dd",function(h){st.color=h;drawSw()});pk.hidden=true;drawSw();
  nlI.onchange=function(){fl.hidden=nlI.checked};fl.hidden=nlI.checked;
  det.append(mm,fl,el("span","sub","칠해지는 색 (기본은 태그 색)"),sw,pk);
  if(!isNew&&!R&&dtI){var cl=el("label","opt");cpI=el("input");cpI.type="checkbox";cl.append(cpI,document.createTextNode("옮기지 않고 복사 (원래 날 일정은 그대로)"));det.appendChild(cl)}
  if(isNew||R){   // 반복: 안 함 / 매일 / 매주(요일 고르기) / 매월(날짜), 시작일·종료일
   rp=el("select");(R?[["daily","매일"],["weekly","매주"],["monthly","매월"]]:[["","반복 안 함"],["daily","매일"],["weekly","매주"],["monthly","매월"]]).forEach(function(p){var q=el("option",null,p[1]);q.value=p[0];rp.appendChild(q)});rp.value=R?R.kind:"";
   var wr=el("div","row"),dl=el("span","sub","시작일 · 종료일 (종료일은 비워도 돼요)"),dr=el("div","row2");dm=el("select");fr=el("input");to=el("input");fr.type=to.type="date";fr.value=R?R.from:key(cur);to.value=R&&R.to||"";dr.append(fr,to);
   DN.forEach(function(n,i){var wb=el("button","sm"+(st.wd.indexOf(i)>=0?" on":""),n);wb.onclick=function(){var k=st.wd.indexOf(i);if(k>=0)st.wd.splice(k,1);else st.wd.push(i);wb.classList.toggle("on")};wr.appendChild(wb)});
   for(var dd=1;dd<=31;dd++){var q=el("option",null,"매월 "+dd+"일");q.value=dd;dm.appendChild(q)}dm.value=R?R.dom:cur.getDate();
   var shw=function(){wr.hidden=rp.value!=="weekly";dm.hidden=rp.value!=="monthly";dl.hidden=dr.hidden=!rp.value};rp.onchange=shw;shw();
   det.append(el("span","sub","반복"),rp,wr,dm,dl,dr)}
  det.open=!!(R||(t&&(t.memo||t.color||t.fill||t.rid))||(isNew&&(o.memo||o.n)));
  card.appendChild(det)}
 var b=el("div","btns"),cc=el("button",null,"취소"),ok=el("button",null,"저장");cc.onclick=function(){ov.hidden=true};ok.style.background="var(--ac)";ok.style.color="#fff";
 ok.onclick=function(){var n=nm.value.trim();if(!n){nm.focus();return}var data={n:n,memo:mm.value.trim(),tag:tg.value},rk=rp?rp.value:"";
  if(!o.noTime){var ns=null,ne=null,gp=[];
   if(s.value||e.value){if(!s.value){tell("시작 시간도 넣어 주세요. (시간을 안 쓰려면 \"시간 지우기\")");return}
    ns=toM(s.value);if(e.value){ne=toM(e.value);if(ne<ns)ne+=1440}else ne=ns+60;   /* 끝이 시작보다 빠르면 다음 날까지, 끝을 비우면 1시간 */
    if(ne<=ns){tell("끝나는 시간이 시작보다 늦어야 해요.");return}
    gp=((t&&t.gaps)||[]).map(function(q){return{s:Math.max(q.s,ns),e:Math.min(q.e,ne)}}).filter(function(q){return q.e>q.s})}
   data.s=ns;data.e=ne;data.gaps=gp;data.color=st.color;data.fill=ns!=null&&fi.checked;
   var toTb=nlI.checked;if(toTb&&ns==null){tell("시간표에 칠하려면 시작·끝 시간을 넣어 주세요.");return}if(toTb){data.d=true;data.fill=true}}
  if(R||rk){   // 반복 규칙으로 저장
   if(rk==="weekly"&&!st.wd.length){tell("요일을 하나 이상 골라 주세요.");return}
   if(to.value&&fr.value&&to.value<fr.value){tell("종료일이 시작일보다 빨라요.");return}
   var rule=R||{id:Math.random().toString(36).slice(2),skip:[]};
   Object.keys({n:1,memo:1,tag:1,s:1,e:1,color:1,fill:1}).forEach(function(k){rule[k]=data[k]});rule.nl=!!toTb;if(toTb)rule.fill=true;
   rule.kind=rk;rule.wd=st.wd.slice().sort();rule.dom=+dm.value;rule.from=fr.value||key(cur);rule.to=to.value||"";
   if(R)dropFuture(rule);else db.repeats.push(rule);
   save();ov.hidden=true;render();return}
  var tk=(dtI&&dtI.value)||key(cur),dayArr=function(k){return db.days[k]||(db.days[k]=[])};
  var tbm=!o.noTime&&toTb,put=function(it,inTb,k){(inTb?tbOf(k):dayArr(k)).push(it)};
  if(isNew){data.id=Math.random().toString(36).slice(2);if(!tbm)data.d=false;put(data,tbm,tk)}
  else if(cpI&&cpI.checked){var c0=JSON.parse(JSON.stringify(t));Object.keys(data).forEach(function(k){c0[k]=data[k]});c0.id=Math.random().toString(36).slice(2);c0.d=!!tbm;delete c0.rid;put(c0,tbm,tk)}   /* 복사 */
  else{Object.keys(data).forEach(function(k){t[k]=data[k]});var wasTb=!!o.tb;
   if(wasTb===!!tbm){if(tk!==key(cur)){if(wasTb){var ta=tbOf(key(cur));ta.splice(ta.indexOf(t),1);tbOf(tk).push(t)}else sendTask(t,tk,false)}}   /* 날짜가 바뀌었으면 옮기기 */
   else{var sa=wasTb?tbOf(key(cur)):allOf(cur);sa.splice(sa.indexOf(t),1);   /* 체크리스트 ↔ 시간표만 칠하기 바꾸기 */
    if(t.rid){var rr0=db.repeats.find(function(q){return q.id===t.rid});if(rr0)(rr0.skip=rr0.skip||[]).push(key(cur));delete t.rid}
    if(!tbm){t.d=false;t.fill=false}put(t,!!tbm,tk)}}
  save();ov.hidden=true;render()};
 if(o.tb&&!R){var dt2=el("button","del","삭제");dt2.onclick=function(){ask("'"+t.n+"' 시간표 칠하기를 지울까요?",function(){var ta=tbOf(key(cur));ta.splice(ta.indexOf(t),1);if(t.rid){var rr1=db.repeats.find(function(q){return q.id===t.rid});if(rr1)(rr1.skip=rr1.skip||[]).push(key(cur))}save();ov.hidden=true;render()})};b.appendChild(dt2)}
 if(R){var del=el("button","del","삭제");del.onclick=function(){ask("'"+R.n+"' 반복 일정을 삭제할까요? 오늘부터 아직 안 한 반복 할 일은 사라지고, 지난 기록은 남아요.",function(){dropFuture(R);db.repeats=db.repeats.filter(function(q){return q!==R});save();ov.hidden=true;render()})};b.appendChild(del)}
 else if(t&&t.rid){var rb=el("button","sm","반복 설정");rb.onclick=function(){var rr=db.repeats.find(function(q){return q.id===t.rid});if(rr)openTask(rr,{rule:true});else tell("반복 규칙이 삭제된 일정이에요.")};b.appendChild(rb)}
 b.append(cc,ok);card.appendChild(b);ov.appendChild(card);ov.onclick=function(x){if(x.target===ov)ov.hidden=true}}

// 시간표에서 "시작 칸"만 눌러 둔 상태에서 시간칸이 아닌 곳을 누르거나 Esc를 누르면 선택을 취소한다
function cancelGridPend(){if(gridPend==null)return;gridPend=null;document.querySelectorAll(".pick").forEach(function(x){x.classList.remove("pick")})}
document.addEventListener("pointerdown",function(e){var q=e.target;if(!(q&&q.dataset&&q.dataset.m!=null))cancelGridPend()},true);
document.addEventListener("keydown",function(e){if(e.key==="Escape")cancelGridPend()});
