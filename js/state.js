/*
 * db 구조 (모든 데이터가 이 객체 하나에 들어 있고, save()가 통째로 저장한다)
 *   days    : {"YYYY-MM-DD": [할 일...]}   할 일 = {id,n,s,e,tag,d,gaps,memo,color}  (s,e = 분, 7시 기준 하루)
 *   weeks / months : 주간·월간 체크리스트   diary : 일기   note : 메모장
 *   tags    : 시간 태그   cats : 가계부 카테고리(exp/inc)   money : 수입·지출 기록   budget : 월별 예산
 *   layouts : 위젯 배치 {pc:{day,week,month}, phone:{...}} ← 폰/PC, 화면별로 따로
 *   presets : 꾸미기 프리셋 (최대 5개) [{name,theme,banner}]
 *   theme   : 사용자가 고른 색   banner : 상단 이미지
 */
/* 공통 상태와 저장: 상수, db(모든 데이터), 불러오기, 옛 데이터 변환, save() */
var H0=7,H1=31,DEF=[["공부","#3e63dd"],["운동","#46a758"],["일","#f76b15"],["휴식","#8e4ec6"],["기타","#6e7781"]];
var PAL=["#e5484d","#f76b15","#f5b800","#46a758","#12a594","#00a2c7","#3e63dd","#8e4ec6","#d6409f","#ab6400","#6e7781","#222222"];
var db={v:2,weeks:{},months:{},days:{},tags:[]},cur=new Date(),view="day",openGap=null,filt="all";
try{var raw=JSON.parse(localStorage.getItem("planner")||"null");
 if(raw){if(raw.days){db=raw}else{Object.keys(raw).forEach(function(k){db.days[k]=raw[k].map(function(t){return{id:Math.random().toString(36).slice(2),n:t.n,s:t.s,e:t.e,tag:"t"+t.c,d:t.d,gaps:[]}})})}}}catch(e){}
db.weeks=db.weeks||{};db.months=db.months||{};db.diary=db.diary||{};db.money=db.money||[];db.budget=db.budget||{};db.note=db.note||"";db.layout=db.layout||[];
var BLK={dayL:"체크리스트",dayG:"시간표",dayS:"시간 배분",dayM:"오늘의 가계부",memo1:"메모장 1",memo2:"메모장 2",dayC:"달력",dayB:"이미지",wkP:"주차 달력",wkG:"주간 시간표",wkL:"주간 체크리스트",wkS:"주간 통계",moP:"월 선택",moG:"월간 달력",moL:"월간 체크리스트",moS:"월간 통계",mnS:"가계부 요약",mnB:"월 예산",mnF:"입력",mnC:"가계부 캘린더",mnD:"수입·지출 분포",mnL:"내역",mnR:"정기 결제"};
Object.keys(BLK).forEach(function(id){if(!db.layout.some(function(b){return b.id===id}))db.layout.push({id:id,w:"half",on:id!=="dayM"&&id!=="dayN"})});
db.cats=db.cats||{exp:[],inc:[]};   // 기본 카테고리 없음: 직접 추가
if(db.v!==2){Object.keys(db.days).forEach(function(k){db.days[k].forEach(function(t){if(t.s==null||t.s>=420)return;if(t.e<=420){t.s+=1440;t.e+=1440;t.gaps=t.gaps.map(function(q){return{s:q.s+1440,e:q.e+1440}})}else{t.s=420;t.gaps=t.gaps.filter(function(q){return q.e>420}).map(function(q){return{s:Math.max(q.s,420),e:q.e}})}})});db.v=2}
// db 전체를 브라우저(localStorage)에 저장한다. 데이터를 바꾼 뒤엔 항상 호출. quiet=true(반복·정기 결제 자동 생성)면 수정 시각을 안 바꾸고 동기화도 안 한다
function save(quiet){if(!quiet)db.mt=Date.now();try{localStorage.setItem("planner",JSON.stringify(db))}catch(e){}if(!quiet&&window.syncHook)syncHook()}
