/* 정기 결제(구독, 월세 등): 등록해 두면 매달 정해진 날 가계부에 자동으로 입력된다 */
db.recurring=db.recurring||[];   // [{id,name,amt,day,type,cat,from:"YYYY-MM",skip:[지운 달...]}]

// 시작 달부터 이번 달까지, 날짜가 지난 정기 결제를 가계부 기록으로 자동 입력 (달마다 한 건, 지운 달은 건너뜀). render()가 부를 때마다 확인한다
function applyRecurring(){var now=new Date(),ch=false;
 db.recurring.forEach(function(r){var y=+r.from.slice(0,4),m=+r.from.slice(5,7)-1;
  while(y<now.getFullYear()||(y===now.getFullYear()&&m<=now.getMonth())){
   var ym=y+"-"+String(m+1).padStart(2,"0"),d=Math.min(r.day,new Date(y,m+1,0).getDate()),date=ym+"-"+String(d).padStart(2,"0");
   if(new Date(date+"T00:00:00")<=now&&(r.skip||[]).indexOf(ym)<0&&!db.money.some(function(e){return e.rid===r.id&&e.date.slice(0,7)===ym})){
    db.money.push({id:Math.random().toString(36).slice(2),date:date,type:r.type,amt:r.amt,cat:r.cat,memo:r.name,rid:r.id});ch=true}
   m++;if(m>11){m=0;y++}}});
 if(ch)save(true)}

// 정기 결제 위젯(mnR): 목록과 추가 버튼
function renderRecurring(){var b=$("mnR");b.innerHTML="";var hd=el("div","row"),ad=el("button","sm","+ 추가"),t=el("b",null,"정기 결제");t.style.flex="1";ad.onclick=function(){openRecurring(null)};hd.append(t,ad);b.appendChild(hd);
 if(!db.recurring.length){b.appendChild(el("p","sub","매달 나가는 돈(구독, 월세 등)을 등록하면 정해진 날짜에 가계부에 자동으로 입력돼요."));return}
 var tot=db.recurring.filter(function(r){return r.type==="exp"}).reduce(function(a,r){return a+r.amt},0);b.appendChild(el("div","sub","매달 지출 합계 "+won(tot)));
 db.recurring.slice().sort(function(a,c){return a.day-c.day}).forEach(function(r){var row=el("div","me"),c=catOf(r.type,r.cat),dot=el("span");dot.style.cssText="width:10px;height:10px;border-radius:3px;flex:none;background:"+c.color;
  var a=el("b",null,(r.type==="exp"?"-":"+")+won(r.amt));a.style.color=r.type==="exp"?"#e5484d":"#46a758";row.style.cursor="pointer";row.onclick=function(){openRecurring(r)};row.append(dot,el("span","n","매월 "+r.day+"일 · "+r.name),a);b.appendChild(row)})}

// 정기 결제 추가/편집 팝업 (r가 null이면 새로 추가). 고쳐도 이미 입력된 기록은 그대로, 앞으로 자동 입력될 것만 바뀐다
function openRecurring(r){var ov=$("ov"),isNew=!r,st={type:r?r.type:"exp"};ov.hidden=false;ov.innerHTML="";
 var card=el("div","card"),seg=el("div","seg"),nm=el("input"),am=el("input"),dy=el("select"),cs=el("select"),ys=el("select"),ms=el("select"),ym=el("div","row2");
 nm.placeholder="이름 (예: 넷플릭스)";nm.value=r?r.name:"";am.type="number";am.inputMode="numeric";am.placeholder="금액(원)";am.value=r?r.amt:"";
 for(var d=1;d<=31;d++){var o=el("option",null,"매월 "+d+"일");o.value=d;dy.appendChild(o)}dy.value=r?r.day:cur.getDate();
 var f=r?r.from:mkOf(),fy=+f.slice(0,4),y0=new Date().getFullYear();
 for(var y=Math.min(fy,y0)-1;y<=y0+1;y++){var oy=el("option",null,y+"년");oy.value=y;ys.appendChild(oy)}ys.value=fy;
 for(var k=1;k<=12;k++){var om=el("option",null,k+"월");om.value=k;ms.appendChild(om)}ms.value=+f.slice(5,7);ym.append(ys,ms);
 var fill=function(){cs.innerHTML="";db.cats[st.type].forEach(function(c){var o=el("option",null,c.name);o.value=c.id;cs.appendChild(o)});var o0=el("option",null,"미분류");o0.value="";cs.appendChild(o0);if(r&&r.type===st.type)cs.value=r.cat};
 var drawSeg=function(){seg.innerHTML="";[["exp","지출"],["inc","수입"]].forEach(function(p){var b=el("button",st.type===p[0]?"on":"",p[1]);b.onclick=function(){st.type=p[0];drawSeg();fill()};seg.appendChild(b)})};
 drawSeg();fill();
 var b=el("div","btns"),cc=el("button",null,"취소"),ok=el("button",null,"저장");cc.onclick=function(){ov.hidden=true};ok.style.background="var(--ac)";ok.style.color="#fff";
 ok.onclick=function(){var a=Math.round(+am.value),n=nm.value.trim();if(!n||!(a>0)){tell("이름과 금액을 입력해 주세요.");return}
  var o={name:n,amt:a,day:+dy.value,type:st.type,cat:cs.value,from:ys.value+"-"+String(ms.value).padStart(2,"0")};
  if(isNew){o.id=Math.random().toString(36).slice(2);db.recurring.push(o)}else{Object.keys(o).forEach(function(q){r[q]=o[q]});syncRecurring(r)}
  save();ov.hidden=true;render()};
 if(!isNew){var del=el("button","del","삭제");del.onclick=function(){var gone=function(rec){db.recurring=db.recurring.filter(function(q){return q!==r});if(rec)db.money=db.money.filter(function(e){return e.rid!==r.id});save();ov.hidden=true;render()};
  ask("'"+r.name+"' 정기 결제를 삭제할까요? 이미 가계부에 입력된 기록은 어떻게 할까요?",function(){gone(true)},{yes:"기록도 지우기",no:"기록은 남기기",onNo:function(){gone(false)}})};b.appendChild(del)}
 b.append(cc,ok);card.append(el("b",null,"정기 결제 "+(isNew?"추가":"편집")),seg,nm,am,dy,cs,el("span","sub","시작 달 (이 달부터 매달 자동 입력)"),ym,b);ov.appendChild(card);ov.onclick=function(e){if(e.target===ov)ov.hidden=true}}

// 정기 결제를 고치면 이미 입력된 기록도 같이 바꾼다 (이름·금액·카테고리·구분·결제일). 시작 달보다 앞선 기록은 지운다
function syncRecurring(r){db.money=db.money.filter(function(e){if(e.rid!==r.id)return true;var ym=e.date.slice(0,7);if(ym<r.from)return false;
 var y=+ym.slice(0,4),m=+ym.slice(5,7),d=Math.min(r.day,new Date(y,m,0).getDate());
 e.date=ym+"-"+String(d).padStart(2,"0");e.type=r.type;e.amt=r.amt;e.cat=r.cat;e.memo=r.name;return true})}
