/* 작은 도우미 함수들: 날짜/시간 변환, 색칠 계산, DOM 만들기, 통계 그래프 */
// 날짜 → "YYYY-MM-DD" 문자열 (db.days의 키)
function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
// "HH:MM" 문자열 → 분(정수)
function mins(v){var p=v.split(":");return +p[0]*60+ +p[1]}
// 분 → "HH:MM" (24시를 넘으면 다음 날로 돌려서 표시)
function hm(m){return String(Math.floor(m/60)%24).padStart(2,"0")+":"+String(m%60).padStart(2,"0")}
// hm + 자정 이후면 "익일" 표시 (화면 출력용)
function hmL(m){return(m>=1440?"익일 ":"")+hm(m)}
// 입력 시각 → 기록용 분. 하루 시작 시각(H0) 이전은 "다음 날 새벽"이라 1440분을 더한다
function toM(v){var m=mins(v);return m<H0*60?m+1440:m}
// 그날의 할 일 배열 (없으면 새로 만든다)
function allOf(d){return db.days[key(d)]||(db.days[key(d)]=[])}
// 그날의 할 일 중 현재 태그 필터에 맞는 것만
function dayT(d){return(db.days[key(d)]||[]).filter(function(t){return filt==="all"||t.tag===filt})}
// 태그 id → 태그 객체 (없으면 "태그 없음" 기본값)
function tagOf(id){return db.tags.filter(function(t){return t.id===id})[0]||{id:"",name:"태그 없음",color:"#6e7781"}}
// 완료됐거나 "체크 안 해도 칠하기"를 켠 시간 할 일을 1분 단위 색칠 정보(겹치면 층별로)로 바꾼다
function paint(T){var L=[];T.forEach(function(t){if(t.s==null||(!t.d&&!t.fill))return;var a=new Array(1440).fill(false);for(var m=Math.max(t.s,H0*60);m<Math.min(t.e,H1*60);m++)a[m-H0*60]=!t.gaps.some(function(q){return m>=q.s&&m<q.e});L.push({col:t.color||tagOf(t.tag).color,tag:t.tag,a:a})});return L}
// 전날에서 이어진 시간: 어제 시작해 오늘 시작 시각을 넘어 끝나는 할 일을, 오늘 시간표 좌표로 옮긴 사본으로 돌려준다 (시간표 색칠에만 쓴다)
function spillT(d){var p=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1),E=H1*60;return(db.days[key(p)]||[]).filter(function(t){return t.s!=null&&t.e>E&&(filt==="all"||t.tag===filt)}).map(function(t){return Object.assign({},t,{s:Math.max(t.s,E)-1440,e:t.e-1440,gaps:(t.gaps||[]).map(function(q){return{s:q.s-1440,e:q.e-1440}})})})}
// 10분 칸 하나의 CSS 배경(반투명 색 층들)을 만든다. 5분이면 칸의 절반만 칠해진다
function bg(L,a){var i=a-H0*60,out=[];L.forEach(function(l){var st=[],p=0,any=false;while(p<10){var c=l.a[i+p],j=p;while(j<10&&l.a[i+j]===c)j++;st.push((c?l.col+"80":"transparent")+" "+p*10+"% "+j*10+"%");if(c)any=true;p=j}if(any)out.push("linear-gradient(to right,"+st.join(",")+")")});return out.join(",")}
// 시간표 기준 통계: 그 날 시간표에 칠해진 분(전날에서 이어진 시간 포함, 하루 경계로 나뉨)을 태그별로 tot에 더한다
function addDayMin(d,tot){paint(dayT(d).concat(spillT(d))).forEach(function(l){var n=0;l.a.forEach(function(v){if(v)n++});if(n)tot[l.tag]=(tot[l.tag]||0)+n})}
var $=function(i){return document.getElementById(i)};
// DOM 요소 만들기 도우미: el(태그, 클래스, 글자)
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
// 태그별 시간 배분을 도넛 그래프 + 막대로 그린다
function showStats(box,tot){box.innerHTML="";var ks=Object.keys(tot).sort(function(a,b){return tot[b]-tot[a]}),sum=ks.reduce(function(a,k){return a+tot[k]},0);
 if(!sum){box.appendChild(el("span","sub","아직 시간표에 칠해진 시간이 없어요."));return}
 var acc=0,stops=[],dr=el("div","dr");
 ks.forEach(function(k){var tg=tagOf(k),m=tot[k],a=acc/sum*100;acc+=m;stops.push(tg.color+" "+a+"% "+acc/sum*100+"%");
  var d=el("div"),i=el("i");i.style.background=tg.color;d.append(i,el("span","n",tg.name),el("span",null,Math.floor(m/60)+"시간 "+m%60+"분"),el("span","p",Math.round(m/sum*100)+"%"));
  var bar=el("div","pb"),f=el("span");f.style.width=m/sum*100+"%";f.style.background=tg.color;bar.appendChild(f);dr.append(d,bar)});
 var dn=el("div","donut");dn.style.background="conic-gradient("+stops.join(",")+")";var w=el("div","dist");w.append(dn,dr);
 box.append(el("div","sub","완료한 시간 합계 "+Math.floor(sum/60)+"시간 "+sum%60+"분"),w)}
var DN=["일","월","화","수","목","금","토"];
// 현재 날짜가 속한 주의 일요일
function weekStart(){var d=new Date(cur);d.setDate(d.getDate()-d.getDay());return d}


// 앱 가운데 뜨는 알림 팝업 (브라우저 기본 alert 대신)
function tell(msg){ask(msg,null)}
// 확인/취소 팝업 (confirm 대신). o2={yes,no:버튼 글자, onNo:취소 버튼 동작}: 확인을 누르면 onYes() 실행. onYes가 없으면 확인 버튼만 보인다. 다른 팝업 위에 겹쳐 뜬다
function ask(msg,onYes,o2){o2=o2||{};var o=$("ov2");o.hidden=false;o.innerHTML="";var c=el("div","card"),b=el("div","btns"),close=function(){o.hidden=true};
 c.appendChild(el("p",null,msg));
 if(onYes){var no=el("button",null,o2.no||"취소");no.onclick=function(){close();if(o2.onNo)o2.onNo()};b.appendChild(no)}
 var ok=el("button",null,o2.yes||"확인");ok.style.background="var(--ac)";ok.style.color="#fff";ok.onclick=function(){close();if(onYes)onYes()};b.appendChild(ok);
 c.appendChild(b);o.appendChild(c);o.onclick=function(e){if(e.target===o)close()}}

// 달력 칸 목록: 앞뒤 달 날짜까지 채워 한 주가 끊기지 않게 한다. out=true면 이번 달이 아닌 날(어둡게 표시)
function calDays(y,mo){var f=new Date(y,mo,1).getDay(),n=Math.ceil((f+new Date(y,mo+1,0).getDate())/7)*7,a=[];
 for(var i=0;i<n;i++){var d=new Date(y,mo,1-f+i);a.push({dt:d,out:d.getMonth()!==mo})}return a}
// 어딘가에서 오류가 나면 조용히 멈추지 않고 팝업으로 알려준다 (원인 찾기 쉽게)
window.addEventListener("error",function(e){try{tell("오류가 났어요: "+e.message)}catch(x){}});
