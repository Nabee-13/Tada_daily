/* 할 일 다른 날로 넘기기(이동) / 복제(복사). 투두메이트의 "내일로 미루기", "복제"와 같아요.
 * - 한 개: 할 일 수정 팝업(✎) 아래의 "날짜 옮기기·복사"
 * - 여러 개: 일간 체크리스트 위의 "날짜 옮기기·복사" 버튼 (미완료만 / 전체) */
// 날짜 키("YYYY-MM-DD")에 n일을 더한다
function addDays(k,n){var p=k.split("-");return key(new Date(+p[0],+p[1]-1,+p[2]+n))}
// 할 일 하나를 지금 보는 날(cur)에서 toK 날짜로 옮기거나(copy=false) 복사한다(copy=true). 복사본은 미완료로 시작
function sendTask(t,toK,copy){var fk=key(cur),src=allOf(cur),dst=db.days[toK]||(db.days[toK]=[]);
 if(copy){var c=JSON.parse(JSON.stringify(t));c.id=Math.random().toString(36).slice(2);c.d=false;delete c.rid;dst.push(c);return}
 var i=src.indexOf(t);if(i<0||fk===toK)return;src.splice(i,1);
 if(t.rid){var rr=db.repeats.find(function(q){return q.id===t.rid});if(rr)(rr.skip=rr.skip||[]).push(fk);delete t.rid}   // 반복 일정이면 원래 날에 다시 생기지 않게
 dst.push(t)}
// 날짜 고르기 칸: 입력창 + 내일/모레/다음 주 버튼. 돌려주는 객체의 get()으로 고른 날짜 키를 읽는다
function datePick(){var w=el("div"),r=el("div","row"),d=el("input");d.type="date";d.value=addDays(key(cur),1);
 [["내일",1],["모레",2],["다음 주",7]].forEach(function(q){var b=el("button","sm",q[0]);b.onclick=function(){d.value=addDays(key(cur),q[1])};r.appendChild(b)});
 w.append(r,d);w.get=function(){return d.value};return w}
// 한 개용: 할 일 수정 팝업에 붙는 칸
function moveBox(t){var w=el("div","syncbox"),dp=datePick(),r=el("div","btns"),mv=el("button",null,"이 날로 옮기기"),cp=el("button",null,"이 날로 복사");
 var go=function(copy){var k=dp.get();if(!k){tell("날짜를 골라 주세요.");return}if(!copy&&k===key(cur)){tell("같은 날이에요. 다른 날을 골라 주세요.");return}
  sendTask(t,k,copy);save();$("ov").hidden=true;render();tell(copy?"복사했어요 ("+k+")":"옮겼어요 ("+k+")")};
 mv.onclick=function(){go(false)};cp.onclick=function(){go(true)};r.append(mv,cp);
 w.append(el("b",null,"다른 날로 옮기기 · 복사"),dp,r);return w}
// 여러 개용: 일간 체크리스트의 "날짜 옮기기·복사" 팝업
function openDayMove(){var ov=$("ov");ov.hidden=false;ov.innerHTML="";var card=el("div","card"),all=allOf(cur),
 sc=el("select"),md=el("select"),dp=datePick(),b=el("div","btns"),cc=el("button",null,"취소"),ok=el("button",null,"실행");
 [["undone","아직 안 한 일만"],["all","오늘 할 일 전부"]].forEach(function(p){var o=el("option",null,p[1]);o.value=p[0];sc.appendChild(o)});
 [["move","넘기기 (옮기기)"],["copy","복제 (원래 날도 그대로)"]].forEach(function(p){var o=el("option",null,p[1]);o.value=p[0];md.appendChild(o)});
 cc.onclick=function(){ov.hidden=true};ok.style.background="var(--ac)";ok.style.color="#fff";
 ok.onclick=function(){var k=dp.get();if(!k){tell("날짜를 골라 주세요.");return}var copy=md.value==="copy";if(!copy&&k===key(cur)){tell("같은 날이에요. 다른 날을 골라 주세요.");return}
  var L=all.filter(function(t){return sc.value==="all"||!t.d});if(!L.length){tell("옮길 할 일이 없어요.");return}
  L.forEach(function(t){sendTask(t,k,copy)});save();ov.hidden=true;render();tell(L.length+"개를 "+(copy?"복제":"옮겼")+"어요 ("+k+")")};
 b.append(cc,ok);card.append(el("b",null,"다른 날로 넘기기 · 복제"),el("span","sub","대상"),sc,el("span","sub","방식"),md,el("span","sub","날짜"),dp,b);
 ov.appendChild(card);ov.onclick=function(e){if(e.target===ov)ov.hidden=true}}
$("moveD").onclick=openDayMove;
