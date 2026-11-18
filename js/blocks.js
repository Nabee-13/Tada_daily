/* 블록 위젯: 배치 편집, 메모장, 오늘의 가계부 블록 */
var editMode=false,dragId=null;
// 오늘의 가계부 위젯 (요약 + 빠른 지출 추가)
function renderDayMoney(){var box=$("dayM"),k=key(cur),es=db.money.filter(function(e){return e.date===k});box.innerHTML="";
 var S=function(t){return es.filter(function(e){return e.type===t}).reduce(function(a,e){return a+e.amt},0)},inc=S("inc"),exp=S("exp"),sm=el("div","sum3");
 [["수입",inc,"#46a758"],["지출",exp,"#e5484d"],["합계",inc-exp,"var(--tx)"]].forEach(function(r){var d=el("div","s3"),b=el("b",null,won(r[1]));b.style.color=r[2];d.append(el("span","sub",r[0]),b);sm.appendChild(d)});
 var qa=el("div","clf"),am=el("input");am.type="number";am.inputMode="numeric";am.placeholder="지출 금액";var cs=el("select");db.cats.exp.forEach(function(c){var o=el("option",null,c.name);o.value=c.id;cs.appendChild(o)});var ad=el("button",null,"추가");
 ad.onclick=function(){var a=Math.round(+am.value);if(!(a>0)){am.focus();return}db.money.push({id:Math.random().toString(36).slice(2),date:k,type:"exp",amt:a,cat:cs.value,memo:""});save();render()};
 qa.append(am,cs,ad);box.append(el("b",null,"오늘의 가계부"),sm,qa);
 es.forEach(function(e){var c=catOf(e.type,e.cat),r=el("div","me"),n=el("span","n",c.name),a=el("b",null,(e.type==="exp"?"-":"+")+won(e.amt));if(e.memo)n.appendChild(el("span","memo","  "+e.memo));a.style.color=e.type==="exp"?"#e5484d":"#46a758";r.append(n,a);box.appendChild(r)});
 renderBudget(box,true);var go=el("button","sm","가계부에서 자세히 보기");go.onclick=function(){view="money";mSub="day";render()};box.appendChild(go)}
// 위젯을 구역(T/L/R)에 배치하고, 편집 모드의 조작 막대(구역·이동·삭제)를 붙인다. 배치는 폰/PC 따로 저장.
function applyLayout(){var day=["day","week","month","money"].indexOf(view)>=0,lay=day?db.layouts[dev()][view]:[],Z={T:$("zT"),L:$("zL"),R:$("zR")},bar=$("blkbar"),ZN={T:"▬ 위",L:"◧ 왼쪽",R:"◨ 오른쪽"};
 var pull=function(){return lay.splice(lay.findIndex(function(q){return q.id===dragId}),1)[0]};
 bar.hidden=!day;
 Object.keys(BLK).forEach(function(id){var s=$(id);if(s&&!lay.some(function(q){return q.id===id})){s.hidden=true;var o=s.querySelector(":scope > .bt");if(o)o.remove()}});   // 이 화면 배치에 없는 위젯은 숨김
 Object.keys(Z).forEach(function(k){Z[k].hidden=!day;Z[k].ondragover=function(e){if(editMode)e.preventDefault()};
  Z[k].ondrop=function(e){if(e.target!==Z[k]||!dragId)return;var it=pull();it.z=k;lay.push(it);dragId=null;save();render()}});
 lay.forEach(function(b,i){var s=$(b.id);if(!s)return;var old=s.querySelector(":scope > .bt");if(old)old.remove();
  Z[b.z].appendChild(s);s.hidden=!(day&&b.on);
  s.querySelectorAll(".cbtn").forEach(function(x){x.remove()});var hw=s.querySelector(":scope > .hw");if(hw)hw.remove();s.classList.toggle("col",!!b.c&&day);
  // 접기/펼치기 버튼(▾)을 위젯 제목줄 맨 앞에 넣는다 (접힘 상태도 배치에 저장). 제목줄이 없으면 이름표 줄을 만든다
  if(day&&b.on){var cb=el("button","cbtn",b.c?"▸":"▾"),host=s.querySelector(":scope > .mnav")||s.firstElementChild;cb.title=b.c?"펼치기":"접기";cb.onclick=function(){b.c=!b.c;save();render()};
   if(host&&host.classList.contains("cl")){host.classList.add("hh");host=host.firstElementChild}
   if(host&&(host.classList.contains("row")||host.classList.contains("mnav"))){host.insertBefore(cb,host.firstChild);host.classList.add("hh")}
   else if(host&&host.tagName==="B"){host.classList.add("hh");host.parentNode.insertBefore(cb,host)}
   else{var w=el("div","hw hh");w.append(cb,el("b",null,bname(b.id)));s.insertBefore(w,host)}};s.draggable=editMode&&day;s.classList.toggle("ed",editMode&&day);   // 배열 순서대로 appendChild → 순서 반영
  if(day&&b.on&&editMode){var t=el("div","bt"),ti=el("span",null,"⠿ "+bname(b.id));ti.style.flex="1";t.append(ti);
   var bt=function(txt,fn,on){var q=el("button","sm"+(on?" on":""),txt);q.onclick=fn;return q};
   var mv=function(d){return function(){var j=i+d;while(j>=0&&j<lay.length&&!(lay[j].on&&lay[j].z===b.z))j+=d;if(j<0||j>=lay.length)return;var x=lay[i];lay[i]=lay[j];lay[j]=x;save();render()}};
   Object.keys(ZN).forEach(function(k){t.append(bt(ZN[k],function(){b.z=k;save();render()},b.z===k))});
   t.append(bt("↑",mv(-1)),bt("↓",mv(1)),bt("✕",function(){hideBlk(b)}));s.insertBefore(t,s.firstChild)}
  s.ondragstart=function(e){dragId=b.id;e.dataTransfer.effectAllowed="move";try{e.dataTransfer.setData("text/plain",b.id)}catch(x){}};
  s.ondragover=function(e){if(editMode)e.preventDefault()};
  s.ondrop=function(e){e.preventDefault();e.stopPropagation();if(!dragId||dragId===b.id)return;var it=pull(),to=lay.findIndex(function(q){return q.id===b.id});it.z=b.z;lay.splice(to,0,it);dragId=null;save();render()}});
 bar.innerHTML="";var eb=el("button",editMode?"on":"","🧩 "+(editMode?"편집 완료":"블록 편집"));eb.onclick=function(){editMode=!editMode;render()};bar.appendChild(eb);
 if(editMode){bar.appendChild(el("span","sub",dev()==="pc"?"사이트(PC) 배치 편집 중":"폰 배치 편집 중"));
  lay.filter(function(b){return !b.on}).forEach(function(b){var c=el("button","sm","+ "+bname(b.id));c.onclick=function(){b.on=true;save();render()};bar.appendChild(c)});
  // 배치 프리셋 2개: 지금 기기(폰/PC)의 모든 화면 배치를 저장/불러오기. 폰과 PC는 따로 저장된다
  db.lp=db.lp||{pc:[null,null],phone:[null,null]};var LP=db.lp[dev()];
  [0,1].forEach(function(i){var sv=el("button","sm","배치 "+(i+1)+" 저장"),ld=el("button","sm","불러오기");ld.disabled=!LP[i];
   sv.onclick=function(){var go=function(){LP[i]=JSON.parse(JSON.stringify(db.layouts[dev()]));save();render()};LP[i]?ask("배치 "+(i+1)+"에 이미 저장돼 있어요. 덮어쓸까요?",go):go()};
   ld.onclick=function(){db.layouts[dev()]=JSON.parse(JSON.stringify(LP[i]));save();render()};bar.append(sv,ld)});
  var rs=el("button","sm","기본 배치");rs.onclick=function(){ask("이 기기의 블록 배치를 처음 상태로 되돌릴까요?",function(){db.layouts[dev()][view]=defLay(dev(),view);save();render()})};bar.appendChild(rs)}}
