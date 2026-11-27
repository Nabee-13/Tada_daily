/* 하루 시작 시각 바꾸기: 설정에서 고르면 H0/H1이 바뀌고, 이미 저장된 일정(체크리스트 일정·시간표만 칠한 일정)은 새 기준의 날짜로 옮겨진다.
 * (기록 좌표: 그날 0시부터의 분. 시작 시각 이전은 +1440 = 다음 날 새벽) */
function setDayStart(n){var N0=n*60,mv=function(o,sh){o.s-=sh*1440;o.e-=sh*1440},dk=function(k,sh){var p=k.split("-");return key(new Date(+p[0],+p[1]-1,+p[2]+sh))};
 [db.days,db.tb].forEach(function(days){var add=[];
  Object.keys(days).forEach(function(k){var keep=[];days[k].forEach(function(t){
   if(t.s==null){keep.push(t);return}
   var sh=Math.floor((t.s-N0)/1440);if(sh===0){keep.push(t);return}
   mv(t,sh);t.gaps=(t.gaps||[]).map(function(q){var o={s:q.s,e:q.e};mv(o,sh);return o});add.push([dk(k,sh),t])});days[k]=keep});
  add.forEach(function(a){(days[a[0]]=days[a[0]]||[]).push(a[1])})});
 // 반복 규칙도 같은 기준으로 옮긴다 (요일/날짜/기간 포함)
 db.repeats.forEach(function(r){if(r.s==null)return;var sh=Math.floor((r.s-N0)/1440);if(sh===0)return;mv(r,sh);
  if(r.wd)r.wd=r.wd.map(function(d){return((d+sh)%7+7)%7});if(r.dom)r.dom=Math.min(31,Math.max(1,r.dom+sh));
  if(r.from)r.from=dk(r.from,sh);if(r.to)r.to=dk(r.to,sh);if(r.skip)r.skip=r.skip.map(function(k){return dk(k,sh)})});
 db.dayStart=n;H0=n;H1=n+24;gridPend=null;save();render()}
// 설정 팝업의 "하루 시작 시각" 칸
function dayStartBox(){var w=el("div","syncbox"),r=el("div","row"),sl=el("select"),ok=el("button","sm","적용");
 for(var h=0;h<=12;h++){var o=el("option",null,h+"시");o.value=h;sl.appendChild(o)}sl.value=H0;
 ok.onclick=function(){var n=+sl.value;if(n===H0)return;ask("하루를 "+n+"시부터 시작할까요? 이미 입력한 일정도 새 기준에 맞춰 날짜가 옮겨져요. (예: 새벽 5시 일정이 전날 밤 일정에서 그날 일정으로 바뀔 수 있어요)",function(){setDayStart(n);openSettings()},{yes:"바꾸기",no:"취소"})};
 r.append(sl,ok);w.append(el("b",null,"하루 시작 시각"),el("p","sub","지금: "+H0+"시 ~ 다음 날 "+(H0-1)+"시 59분"),r);return w}
