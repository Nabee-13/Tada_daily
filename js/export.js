/* 내보내기: 선택한 달의 데이터를 파일(JSON / CSV)로 저장 */

// 문자열을 파일로 내려받게 한다 (Blob → 임시 링크 클릭)
function download(name,text,mime){var a=el("a");a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;document.body.appendChild(a);a.click();a.remove()}
// CSV 칸 하나: 쉼표/따옴표/줄바꿈이 있으면 따옴표로 감싼다
function csvCell(v){v=v==null?"":String(v);return/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
// ym="YYYY-MM" 달의 할 일·일기·가계부·체크리스트를 모아 fmt("json" | "csv")로 저장한다
function exportMonth(ym,fmt){var inM=function(k){return k.slice(0,7)===ym};
 var pick=function(o,f){var r={};Object.keys(o).filter(inM).forEach(function(k){if(f(o[k]))r[k]=o[k]});return r};
 var days=pick(db.days,function(a){return a.length}),diary=pick(db.diary,function(d){return d.text||d.mood}),weeks=pick(db.weeks,function(a){return a.length});
 var money=db.money.filter(function(e){return inM(e.date)}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0}),monthly=db.months[ym]||db.months[ym.replace("-0","-")]||[];
 if(fmt==="json"){download("planner-"+ym+".json",JSON.stringify({month:ym,tags:db.tags,categories:db.cats,tasks:days,diary:diary,weeklyChecklists:weeks,monthlyChecklist:monthly,money:money},null,1),"application/json");return}
 var rows=[["[할 일]"],["날짜","시작","끝","이름","태그","완료","메모","빈 시간"]];
 Object.keys(days).sort().forEach(function(k){days[k].forEach(function(t){rows.push([k,t.s==null?"":hmL(t.s),t.s==null?"":hmL(t.e),t.n,tagOf(t.tag).name,t.d?"O":"",t.memo||"",(t.gaps||[]).map(function(g){return hmL(g.s)+"-"+hmL(g.e)}).join(" / ")])})});
 rows.push([],["[가계부]"],["날짜","구분","카테고리","금액","메모"]);
 money.forEach(function(e){rows.push([e.date,e.type==="exp"?"지출":"수입",catOf(e.type,e.cat).name,e.amt,e.memo])});
 rows.push([],["[일기]"],["날짜","기분","내용"]);Object.keys(diary).sort().forEach(function(k){rows.push([k,diary[k].mood||"",diary[k].text||""])});
 rows.push([],["[주간 체크리스트]"],["주 시작일","항목","태그","완료"]);
 Object.keys(weeks).sort().forEach(function(k){weeks[k].forEach(function(t){rows.push([k,t.n,tagOf(t.tag).name,t.d?"O":""])})});
 rows.push([],["[월간 체크리스트]"],["항목","태그","완료"]);monthly.forEach(function(t){rows.push([t.n,tagOf(t.tag).name,t.d?"O":""])});
 download("planner-"+ym+".csv","\ufeff"+rows.map(function(r){return r.map(csvCell).join(",")}).join("\r\n"),"text/csv")}
