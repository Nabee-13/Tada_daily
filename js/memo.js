/* 메모장 위젯 3개(memo1~3): 이름을 직접 정하고, 일간/주간/월간/가계부 화면마다 해당 기간(날짜·주·달)별로 따로 저장된다 */
db.memos=db.memos||{};   // {memo1:{name, texts:{"d:2026-11-12":글, "w:2026-11-08":글, "m:2026-11":글}}}
["memo1","memo2"].forEach(function(id,i){db.memos[id]=db.memos[id]||{name:"메모장 "+(i+1),texts:{}}});
// 옛 일기/메모장 데이터를 메모장으로 옮긴다 (한 번만): 일기 → 메모장 1("일기"), 옛 메모장 → 메모장 2
if(!db.memoMig){db.memoMig=1;var _dk=Object.keys(db.diary||{}).filter(function(k){var d=db.diary[k];return d&&(d.text||d.mood)});
 if(_dk.length){var _m1=db.memos.memo1;_m1.name="일기";_dk.forEach(function(k){_m1.texts["d:"+k]=((db.diary[k].mood||"")+" "+(db.diary[k].text||"")).trim()})}
 if(db.note){var _m2=db.memos.memo2;_m2.name="메모장";_m2.texts["d:"+key(new Date())]=db.note}}

// 위젯 이름: 메모장은 사용자가 정한 이름, 나머지는 기본 이름
function bname(id){return db.memos[id]?db.memos[id].name:BLK[id]}
// 지금 화면의 기간 키: 일간 d:날짜 / 주간 w:주 시작일 / 월간 m:연-월 / 가계부는 일간 보기면 날짜, 아니면 월
function periodKey(){if(view==="day"||(view==="money"&&mSub==="day"))return"d:"+key(cur);if(view==="week")return"w:"+key(weekStart());return"m:"+mkOf()}
// 기간 이름표 (메모장 안내 문구용)
function periodLabel(){var k=periodKey();return k[0]==="d"?(cur.getMonth()+1)+"월 "+cur.getDate()+"일":k[0]==="w"?"이번 주":(cur.getMonth()+1)+"월"}

// 메모장 3개를 그린다: 이름 입력칸 + 지우기 + 글상자. 글은 입력하는 대로 이 기간 키로 저장
function renderMemos(){var pk=periodKey();
 ["memo1","memo2"].forEach(function(id){var s=$(id),M=db.memos[id];s.innerHTML="";
  var hd=el("div","row mh"),nm=el("input","mname");nm.value=M.name;nm.maxLength=12;nm.oninput=function(){M.name=nm.value;save()};nm.onchange=function(){render()};
  hd.append(nm);var ta=el("textarea");ta.rows=6;ta.placeholder=periodLabel()+" 내용을 적어보세요";ta.value=M.texts[pk]||"";
  ta.oninput=function(){if(ta.value)M.texts[pk]=ta.value;else delete M.texts[pk];save()};
  s.append(hd,ta)})}

// 위젯 숨기기(✕). 메모장에 적힌 내용이 있으면 내용도 지울지 묻는다
function hideBlk(b){var M=db.memos[b.id],has=M&&Object.keys(M.texts).length,off=function(){b.on=false;save();render()};
 if(!has){off();return}
 ask("'"+M.name+"'에 적힌 내용이 있어요. 모든 날짜의 내용도 지울까요?",function(){M.texts={};off()},{yes:"내용도 지우기",no:"숨기기만",onNo:off})}
