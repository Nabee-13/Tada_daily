/* 태그(분류) 탭 표시와 태그 추가/편집 팝업 */
/* 태그 팝업 */
// 태그 / 가계부 카테고리 추가·편집 팝업 (kind가 있으면 카테고리)
function openModal(tg,kind,back){var done=function(){$("ov").hidden=true;if(back)back()};var LS=function(){return kind?db.cats[kind]:db.tags};
 var ov=$("ov"),isNew=!tg,st={color:tg?tg.color:PAL[6]};ov.hidden=false;ov.innerHTML="";
 var card=el("div","card"),nm=el("input");nm.placeholder="태그 이름";nm.value=tg?tg.name:"";nm.maxLength=12;
 var sw=el("div","sw");
 function drawSw(){sw.innerHTML="";
  PAL.forEach(function(c){var s=el("span",c===st.color?"on":"");s.style.background=c;s.onclick=function(){st.color=c;drawSw()};sw.appendChild(s)});
  var inP=PAL.indexOf(st.color)>=0,cu=el("span",inP?"":"on");
  cu.style.background=inP?"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)":st.color;
  var ci=el("span");ci.style.cssText="position:absolute;inset:0";ci.onclick=function(){pk.hidden=!pk.hidden;cu.className="on";
   Array.prototype.forEach.call(sw.children,function(x){if(x!==cu)x.className=""})};
  cu.appendChild(ci);sw.appendChild(cu)}
 drawSw();
 var b=el("div","btns");
 if(!isNew){var d=el("button","del","삭제");d.onclick=function(){ask("'"+tg.name+"' 태그를 삭제할까요? 이 태그의 할 일은 '태그 없음'이 돼요.",function(){var nl=LS().filter(function(q){return q!==tg});if(kind)db.cats[kind]=nl;else{db.tags=nl;if(filt===tg.id)filt="all"}save();done();render()})};b.appendChild(d)}
 var cc=el("button",null,"취소");cc.onclick=function(){done()};
 var ok=el("button",null,"저장");ok.style.background="var(--tx)";ok.style.color="var(--bg)";
 ok.onclick=function(){var n=nm.value.trim();if(!n){nm.focus();return}
  if(isNew){var t={id:"t"+Date.now(),name:n,color:st.color};LS().push(t);if(kind)lastCat[kind]=t.id}else{tg.name=n;tg.color=st.color}
  save();done();render()};
 var pk=colorPicker(st.color,function(h){st.color=h;drawSw()});pk.hidden=true;b.append(cc,ok);card.append(el("b",null,(kind?"카테고리 ":"태그 ")+(isNew?"추가":"편집")),nm,sw,pk,b);ov.appendChild(card);nm.focus();
 ov.onclick=function(e){if(e.target===ov)done()}}

// 위쪽 태그 탭과 새 할 일의 태그 선택칸을 다시 그린다
function renderTags(){var bar=$("tagbar");bar.innerHTML="";
 function chip(id,name,color){var c=el("button","chip"+(filt===id?" on":""));if(color){var i=el("i");i.style.background=color;c.appendChild(i)}
  c.appendChild(document.createTextNode(name));c.onclick=function(){filt=id;render()};bar.appendChild(c)}
 chip("all","전체",null);
 db.tags.forEach(function(t){chip(t.id,t.name,t.color);
  if(filt===t.id){var e=el("button","ed","✎");e.title="태그 편집";e.onclick=function(){openModal(t)};bar.appendChild(e)}});
 var a=el("button","chip add","+ 추가");a.onclick=function(){openModal(null)};bar.appendChild(a);
 }

