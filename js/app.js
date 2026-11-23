/* 화면 전환(render), 날짜 이동, 버튼 연결, 시작(render 호출) */
// 현재 view에 맞는 화면을 그린다. 데이터를 바꾼 뒤 부르는 새로고침 함수
function render(){applyTheme();applyRecurring();applyRepeats();
 $("vd").className=view==="day"?"on":"";$("vw").className=view==="week"?"on":"";$("vm").className=view==="month"?"on":"";$("vy").className=view==="money"?"on":"";$("vs").className=view==="set"?"vs on":"vs";$("setP").hidden=view!=="set";
 $("dayL").hidden=$("dayG").hidden=view!=="day";$("moneyS").hidden=view!=="money";$("tagbar").hidden=view==="money";
 if(view==="day")$("title").textContent=cur.getFullYear()+"년 "+(cur.getMonth()+1)+"월 "+cur.getDate()+"일 ("+DN[cur.getDay()]+")";
 else if(view==="week"){var a=weekStart(),b=new Date(a);b.setDate(a.getDate()+6);$("title").textContent=(a.getMonth()+1)+"월 "+a.getDate()+"일 – "+(b.getMonth()+1)+"월 "+b.getDate()+"일"}
 else if(view==="set")$("title").textContent="설정";
 else $("title").textContent=cur.getFullYear()+"년 "+(cur.getMonth()+1)+"월"+(view==="money"&&mSub==="day"?" "+cur.getDate()+"일 ("+DN[cur.getDay()]+")":"");
 renderTags();
 if(view==="day"){renderDay();renderDayMoney();renderBanner();renderMiniCal()}else if(view==="week"){renderWeek();renderBanner();renderWeekPick()}else if(view==="money"){renderMoney();renderRecurring();renderBanner()}else if(view==="set"){renderSet()}else{renderMonth();renderBanner();renderMonPick()}renderMemos();applyLayout()}

// ◀ ▶ 이동: 일간은 하루, 주간은 7일, 월간은 한 달
function move(n){
 if(view==="day"||(view==="money"&&mSub==="day"))cur.setDate(cur.getDate()+n);
 else if(view==="week")cur.setDate(cur.getDate()+7*n);
 else{var y=cur.getFullYear(),m=cur.getMonth()+n;cur=new Date(y,m,Math.min(cur.getDate(),new Date(y,m+1,0).getDate()))}
 render()}
$("addTask").onclick=function(){openTask(null,{arr:allOf(cur)})};   // 할 일 추가 팝업
$("vd").onclick=function(){view="day";render()};$("vw").onclick=function(){view="week";render()};$("vm").onclick=function(){view="month";render()};$("vy").onclick=function(){view="money";mDate=null;render()};
$("prev").onclick=function(){move(-1)};$("next").onclick=function(){move(1)};
$("today").onclick=function(){cur=new Date();render()};
$("sortT").onclick=function(){allOf(cur).sort(function(a,b){return(a.s==null?1e9:a.s)-(b.s==null?1e9:b.s)});save();render()};   // 시간순으로 한 번 정렬   // 할 일 추가 칸에서 바로 새 태그 만들기
render();
