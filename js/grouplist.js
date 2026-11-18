/* 분류(태그)별 묶음 목록과 끌어서 순서 바꾸기: 일간·주간·월간 체크리스트가 같이 쓴다 */

// 태그마다 [제목 칩 + "+"] 묶음 상자를 만든다 (태그 없는 묶음은 비면 숨김). 반환: {root, put(항목,li), fin()}
function mkGroups(arr,onAdd){var root=el("div"),GR={},w0;
 var mk=function(id,tg){var w=el("div","grp"),h=el("div","gh"),u=el("ul");w.dataset.gid=id;
  if(tg){var gn=el("span","gn",tg.name);gn.style.color=tg.color;var pl=el("button","gp","+");pl.title=tg.name+"에 추가";pl.onclick=function(){onAdd(tg.id)};h.append(gn,pl)}else h.appendChild(el("span","gn","태그 없음"));
  w.append(h,u);root.appendChild(w);GR[id]=u;return w};
 db.tags.forEach(function(tg){mk(tg.id,tg)});w0=mk("",null);
 return{root:root,put:function(t,li){GR[GR[t.tag]?t.tag:""].appendChild(li)},fin:function(){if(!GR[""].children.length)w0.remove()}}}

// ⠿ 손잡이를 눌러 끌면(마우스·터치 모두) 다른 항목 위 / 다른 태그 묶음 위에 놓아 순서와 분류를 바꾼다
function dragSort(li,r,t,arr){var gr=el("span","grab","⠿");li.dataset.tid=t.id;r.insertBefore(gr,r.firstChild);
 var clr=function(){document.querySelectorAll(".dropt").forEach(function(x){x.classList.remove("dropt")})},
 at=function(ev){var q=document.elementFromPoint(ev.clientX,ev.clientY);return q&&q.closest("li[data-tid],.grp")};
 gr.onpointerdown=function(e){e.preventDefault();gr.setPointerCapture(e.pointerId);li.classList.add("dragging");
  gr.onpointermove=function(ev){clr();var q=at(ev);if(q&&q!==li)q.classList.add("dropt")};
  gr.onpointerup=function(ev){gr.onpointermove=gr.onpointerup=null;clr();li.classList.remove("dragging");var q=at(ev);if(!q||q===li)return;
   var f=arr.findIndex(function(z){return z.id===t.id}),it=arr.splice(f,1)[0];
   if(q.dataset.tid){var tt=arr.find(function(z){return z.id===q.dataset.tid});if(!tt){arr.splice(f,0,it);return}it.tag=tt.tag;arr.splice(arr.indexOf(tt),0,it)}
   else{it.tag=q.dataset.gid;arr.push(it)}
   save();render()}}}
