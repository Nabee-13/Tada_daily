/* 반복 일정: 선택한 날짜마다(매일 / 매주 요일 / 매월 날짜) 할 일이 자동으로 생긴다 */
db.repeats=db.repeats||[];   // [{id,n,memo,tag,s,e,color,kind:"daily|weekly|monthly",wd:[요일],dom:날짜,from,to,skip:[지운 날짜]}]

// 규칙을 짧은 글로: "매일" / "매주 월·수" / "매월 5일"
function repLabel(r){return r.kind==="daily"?"매일":r.kind==="weekly"?"매주 "+r.wd.map(function(i){return DN[i]}).join("·"):"매월 "+r.dom+"일"}

// 지금 보는 달(앞뒤 달 칸 포함)의 날짜마다, 규칙에 맞고 아직 없고 지운 적 없으면 할 일을 만들어 넣는다. render()가 부를 때마다 확인한다
function applyRepeats(){var ch=false;
 calDays(cur.getFullYear(),cur.getMonth()).forEach(function(cd){var k=key(cd.dt),dow=cd.dt.getDay(),ld=new Date(cd.dt.getFullYear(),cd.dt.getMonth()+1,0).getDate();
  db.repeats.forEach(function(r){if(k<r.from||(r.to&&k>r.to)||(r.skip||[]).indexOf(k)>=0)return;
   var ok=r.kind==="daily"||(r.kind==="weekly"&&r.wd.indexOf(dow)>=0)||(r.kind==="monthly"&&cd.dt.getDate()===Math.min(r.dom,ld));if(!ok)return;
   var arr=db.days[k];if(arr&&arr.some(function(t){return t.rid===r.id}))return;
   (db.days[k]=arr||[]).push({id:Math.random().toString(36).slice(2),n:r.n,memo:r.memo,tag:r.tag,s:r.s,e:r.e,gaps:[],color:r.color,fill:r.fill,d:false,rid:r.id});ch=true})});
 if(ch)save(true)}

// 규칙을 고치거나 지울 때: 오늘부터의 아직 안 한 반복 할 일을 지운다 (새 규칙으로 다시 만들어지거나 그대로 사라진다. 지난 기록과 완료한 일은 남는다)
function dropFuture(r){var tk=key(new Date());Object.keys(db.days).forEach(function(k){if(k>=tk)db.days[k]=db.days[k].filter(function(t){return !(t.rid===r.id&&!t.d)})})}
