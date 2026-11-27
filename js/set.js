/* 설정 탭: 기념일, 태그 관리, 그 밖의 설정(꾸미기·동기화·프리셋·내보내기는 기존 설정 창) */
function renderSet(){var b=$("setP");b.innerHTML="";b.append(tagBox(),prefBox())}
// 태그: 눌러서 수정, ‹ › 로 순서 바꾸기, + 추가
function tagBox(){var w=el("div","syncbox"),tg=el("div","row");w.appendChild(el("b",null,"태그 (눌러서 편집)"));
 db.tags.forEach(function(q,i){var s=el("span","row"),c=el("button","chip"),d=el("i");d.style.background=q.color;c.append(d,document.createTextNode(q.name));c.onclick=function(){openModal(q,undefined,render)};
  var mvt=function(k){return function(){var j=i+k;if(j<0||j>=db.tags.length)return;var x=db.tags[i];db.tags[i]=db.tags[j];db.tags[j]=x;save();render()}};
  var l=el("button","x","‹"),r=el("button","x","›");l.onclick=mvt(-1);r.onclick=mvt(1);s.append(l,c,r);tg.appendChild(s)});
 var ta=el("button","chip add","+ 추가");ta.onclick=function(){openModal(null,undefined,render)};tg.appendChild(ta);
 w.append(tg,el("span","sub","일간 체크리스트에는 그날 할 일이 있는 태그만 나타나요."));return w}
// 그 밖: 달력 숫자 보기, 기존 설정 창 열기
function prefBox(){var w=el("div"),lb=el("label","opt"),cb=el("input"),bt=el("button",null,"꾸미기 · 동기화 · 프리셋 · 내보내기 · 반복 일정 · 하루 시작 시각");
 cb.type="checkbox";cb.checked=!!db.showCnt;lb.append(cb,document.createTextNode("달력 칸에 완료/전체 숫자(예: 3/9)도 보기"));cb.onchange=function(){db.showCnt=cb.checked;save();render()};
 bt.onclick=function(){setTab="day";openSettings()};w.append(el("b",null,"그 밖의 설정"),lb,bt);return w}
