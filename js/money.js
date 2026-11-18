/* 가계부: 입력, 월간 캘린더, 예산, 분포 그래프 */
var mType="exp",mDate=null,mSub="month",lastCat={exp:null,inc:null};
// 숫자 → "12,000원"
function won(n){return n.toLocaleString("ko-KR")+"원"}
// 가계부 카테고리 찾기 (kind: exp 지출 / inc 수입)
function catOf(k,id){return db.cats[k].filter(function(c){return c.id===id})[0]||{id:"",name:"미분류",color:"#6e7781"}}
// 가계부 화면 전체 (요약, 입력폼, 캘린더, 분포, 내역)
function renderMoney(){
 var box=$("moneyS");box.innerHTML="";var mk=cur.getFullYear()+"-"+String(cur.getMonth()+1).padStart(2,"0");
 var L=db.money.filter(function(e){return mSub==="day"?e.date===key(cur):e.date.slice(0,7)===mk});
 var S=function(k){return L.filter(function(e){return e.type===k}).reduce(function(a,e){return a+e.amt},0)},inc=S("inc"),exp=S("exp");
 var sb=el("div","seg");[["month","월간"],["day","일간"]].forEach(function(p){var b=el("button",mSub===p[0]?"on":"",p[1]);b.onclick=function(){mSub=p[0];mDate=null;render()};sb.appendChild(b)});box.appendChild(sb);
 // 달(일간 보기면 하루) 이동 줄: 지난 달 보기
 var nv=el("div","mnav row"),pv=el("button","sm","‹"),nx=el("button","sm","›"),tn=el("button","sm","오늘"),tt=el("b",null,cur.getFullYear()+"년 "+(cur.getMonth()+1)+"월"+(mSub==="day"?" "+cur.getDate()+"일":""));
 tt.style.flex="1";pv.onclick=function(){move(-1)};nx.onclick=function(){move(1)};tn.onclick=function(){cur=new Date();render()};nv.append(tt,tn,pv,nx);box.appendChild(nv);
 var sm=el("div","sum3");
 [["수입",inc,"#46a758"],["지출",exp,"#e5484d"],["잔액",inc-exp,"var(--tx)"]].forEach(function(r){var d=el("div","s3"),b=el("b",null,won(r[1]));b.style.color=r[2];d.append(el("span","sub",r[0]),b);sm.appendChild(d)});
 var f=el("div","mf"),seg=el("div","seg");
 [["exp","지출"],["inc","수입"]].forEach(function(p){var b=el("button",mType===p[0]?"on":"",p[1]);b.onclick=function(){mType=p[0];renderMoney()};seg.appendChild(b)});
 var dt=el("input");dt.type="date";dt.value=mDate||key(cur);dt.onchange=function(){mDate=dt.value};
 var am=el("input");am.type="number";am.inputMode="numeric";am.min=0;am.placeholder="금액(원)";
 var cs=el("select");db.cats[mType].forEach(function(c){var o=el("option",null,c.name);o.value=c.id;cs.appendChild(o)});
 var o0=el("option",null,"미분류");o0.value="";cs.appendChild(o0);if(lastCat[mType]!==null)cs.value=lastCat[mType];cs.onchange=function(){lastCat[mType]=cs.value};
 var nc=el("button","sm","+ 카테고리"),ed=el("button","sm","✎");nc.onclick=function(){openModal(null,mType)};
 ed.onclick=function(){var c=db.cats[mType].filter(function(x){return x.id===cs.value})[0];if(c)openModal(c,mType)};
 var cw=el("div","row");cw.append(nc,ed);
 var me=el("input");me.placeholder="메모 (선택)";
 var ad=el("button",null,mType==="exp"?"지출 추가":"수입 추가");
 ad.onclick=function(){var a=Math.round(+am.value);if(!(a>0)){am.focus();return}var d=dt.value||key(cur);
  db.money.push({id:Math.random().toString(36).slice(2),date:d,type:mType,amt:a,cat:cs.value,memo:me.value.trim()});
  mDate=null;cur=new Date(d+"T00:00:00");save();render()};
 var r1=el("div","row2"),r2=el("div","row2");r1.append(dt,am);r2.append(cs,cw);f.append(seg,r1,r2,me,ad);
 box.append(sm);renderBudget(box,mSub==="day");if(mSub!=="day")renderCal(box,L);box.append(f);
 [["exp","지출 분포",exp],["inc","수입 분포",inc]].forEach(function(q){var k=q[0],tot=q[2];if(!tot)return;var by={};
  L.filter(function(e){return e.type===k}).forEach(function(e){by[e.cat]=(by[e.cat]||0)+e.amt});
  var rows=Object.keys(by).map(function(id){return{c:catOf(k,id),v:by[id]}}).sort(function(a,b){return b.v-a.v}),acc=0,stops=[];
  var dr=el("div","dr");rows.forEach(function(r){var a=acc/tot*100;acc+=r.v;stops.push(r.c.color+" "+a+"% "+acc/tot*100+"%");
   var d=el("div"),i=el("i");i.style.background=r.c.color;d.append(i,el("span","n",r.c.name),el("span",null,won(r.v)),el("span","p",Math.round(r.v/tot*100)+"%"));dr.appendChild(d)});
  var dn=el("div","donut");dn.style.background="conic-gradient("+stops.join(",")+")";var w=el("div","dist");w.append(dn,dr);
  box.append(el("b",null,q[1]),w)});
 if(!L.length)box.appendChild(el("p","sub","기록이 없어요."));
 var dates=Array.from(new Set(L.map(function(e){return e.date}))).sort().reverse();
 dates.forEach(function(d){var es=L.filter(function(e){return e.date===d}),dx=es.filter(function(e){return e.type==="exp"}).reduce(function(a,e){return a+e.amt},0),dd=new Date(d+"T00:00:00");
  var h=el("div","dh");h.append(el("span",null,(dd.getMonth()+1)+"/"+dd.getDate()+" ("+DN[dd.getDay()]+")"),el("span",null,dx?"지출 "+won(dx):""));box.appendChild(h);
  es.forEach(function(e){var c=catOf(e.type,e.cat),r=el("div","me"),dot=el("span","dot");dot.style.cssText="width:10px;height:10px;border-radius:3px;flex:none;background:"+c.color;
   var n=el("span","n",c.name);if(e.memo)n.appendChild(el("span","memo","  "+e.memo));
   var a=el("b",null,(e.type==="exp"?"-":"+")+won(e.amt));a.style.color=e.type==="exp"?"#e5484d":"#46a758";
   var x=el("button","x","✕");x.onclick=function(){var rr=db.recurring.filter(function(q){return q.id===e.rid})[0];if(rr)(rr.skip=rr.skip||[]).push(e.date.slice(0,7));   /* 자동 입력된 기록을 지우면 그 달은 다시 만들지 않는다 */
   db.money=db.money.filter(function(z){return z!==e});save();renderMoney()};
   r.append(dot,n,a,x);box.appendChild(r)})});moneySplit(box)}
// 큰 금액을 "3.5만"처럼 줄이기
function short(n){return n>=10000?(Math.round(n/1000)/10)+"만":n.toLocaleString("ko-KR")}
// 현재 달 키 "YYYY-MM"
function mkOf(){return cur.getFullYear()+"-"+String(cur.getMonth()+1).padStart(2,"0")}
// 해당 달 이하 중 가장 최근에 설정한 예산의 키 (지난 예산 이어쓰기)
function budgetKey(mk){var ks=Object.keys(db.budget).filter(function(k){return k<=mk}).sort();return ks.length?ks[ks.length-1]:null}
// 예산 진행 막대 한 줄 (80%부터 노랑, 초과하면 빨강)
function budRow(label,spent,limit){var r=el("div"),h=el("div","br"),p=Math.round(spent/limit*100);
 h.append(el("span",null,label),el("span",null,won(spent)+" / "+won(limit)+" ("+p+"%)"));
 var bb=el("div","bb"),s=el("span");s.style.width=Math.min(100,p)+"%";s.style.background=p>100?"#e5484d":p>=80?"#f5b800":"#46a758";bb.appendChild(s);
 var rm=limit-spent;r.append(h,bb,el("div","sub",rm>=0?"남은 예산 "+won(rm):won(-rm)+" 초과"));return r}
// 월 예산 위젯 (compact=true면 전체 예산만)
function renderBudget(box,compact){var mk=mkOf(),bk=budgetKey(mk),B=bk?db.budget[bk]:null,wrap=el("div","bud"),hd=el("div","br");
 var bt=el("button","sm","예산 설정");bt.onclick=function(){openBudget(mk)};hd.append(el("b",null,"월 예산"),bt);wrap.appendChild(hd);
 var ME=db.money.filter(function(e){return e.type==="exp"&&e.date.slice(0,7)===mk}),tot=ME.reduce(function(a,e){return a+e.amt},0);
 var any=B&&(B.total>0||Object.keys(B.cats).length);
 if(!any)wrap.appendChild(el("span","sub","예산을 설정해 보세요. (전체 예산 + 분야별 예산)"));
 else{if(bk!==mk)wrap.appendChild(el("span","sub","지난 예산("+bk.replace("-","년 ")+"월)이 그대로 적용 중이에요."));
  if(B.total>0)wrap.appendChild(budRow("전체",tot,B.total));
  if(!compact)db.cats.exp.forEach(function(c){var lim=B.cats[c.id];if(!(lim>0))return;var sp=ME.filter(function(e){return e.cat===c.id}).reduce(function(a,e){return a+e.amt},0);wrap.appendChild(budRow(c.name,sp,lim))})}
 box.appendChild(wrap)}
// 월 예산 설정 팝업 (전체 + 분야별)
function openBudget(mk){var ov=$("ov");ov.hidden=false;ov.innerHTML="";var bk=budgetKey(mk),B=(bk?db.budget[bk]:null)||{total:0,cats:{}},card=el("div","card"),ins={};
 function row(label,val,k){var r=el("div","brow"),i=el("input");i.type="number";i.inputMode="numeric";i.min=0;i.placeholder="0";if(val>0)i.value=val;ins[k]=i;r.append(el("span",null,label),i);card.appendChild(r)}
 card.appendChild(el("b",null,mk.replace("-","년 ")+"월 예산 (원)"));
 row("전체 예산",B.total,"_t");card.appendChild(el("span","sub","분야별 예산 (전체와 별개로 각각 설정, 비워두면 설정 안 함)"));
 db.cats.exp.forEach(function(c){row(c.name,B.cats[c.id],c.id)});
 var b=el("div","btns"),cc=el("button",null,"취소"),ok=el("button",null,"저장");cc.onclick=function(){ov.hidden=true};ok.style.background="var(--tx)";ok.style.color="var(--bg)";
 ok.onclick=function(){var nb={total:Math.round(+ins._t.value)||0,cats:{}};db.cats.exp.forEach(function(c){var v=Math.round(+ins[c.id].value);if(v>0)nb.cats[c.id]=v});db.budget[mk]=nb;save();ov.hidden=true;render()};
 b.append(cc,ok);card.appendChild(b);ov.appendChild(card);ov.onclick=function(e){if(e.target===ov)ov.hidden=true}}
// 가계부 월간 캘린더 (날짜별 수입/지출). 앞뒤 달 날짜는 어둡게, 누르면 그 날의 일간 가계부로 이동
function renderCal(box,L){var y=cur.getFullYear(),mo=cur.getMonth(),g=el("div","mo"),td=key(new Date()),ck=key(cur);g.style.marginBottom="16px";
 DN.forEach(function(n){g.appendChild(el("div","hd",n))});
 calDays(y,mo).forEach(function(cd){var dt=cd.dt,k=key(dt),c=el("div","md"+(cd.out?" out":"")+(k===ck?" sel":"")+(k===td?" tdy":""));c.appendChild(el("span","n",String(dt.getDate())));
  if(!cd.out){var es=L.filter(function(e){return e.date===k}),S=function(t){return es.filter(function(e){return e.type===t}).reduce(function(a,e){return a+e.amt},0)},ii=S("inc"),ee=S("exp");
   if(ii){var a=el("span",null,"+"+short(ii));a.style.color="#46a758";c.appendChild(a)}
   if(ee){var b=el("span",null,"-"+short(ee));b.style.color="#e5484d";c.appendChild(b)}}
  c.onclick=function(){mSub="day";cur=dt;mDate=null;render()};g.appendChild(c)});
 box.appendChild(g)}
// 가계부 화면(숨은 임시 상자 moneyS에 만든 것)을 위젯 칸으로 나눠 담는다: mnS 요약 / mnB 예산 / mnF 입력 / mnC 캘린더 / mnD 분포 / mnL 내역
function moneySplit(box){var W={S:$("mnS"),B:$("mnB"),F:$("mnF"),C:$("mnC"),D:$("mnD"),L:$("mnL")};Object.keys(W).forEach(function(k){W[k].innerHTML=""});
 Array.prototype.slice.call(box.children).forEach(function(n){var c=n.className,k=c==="seg"||c==="sum3"||c.indexOf("mnav")===0?"S":c==="bud"?"B":c==="mf"?"F":c==="mo"?"C":(n.tagName==="B"||c==="dist")?"D":"L";W[k].appendChild(n)});
 Object.keys(W).forEach(function(k){if(!W[k].children.length)W[k].appendChild(el("span","sub","표시할 내용이 없어요"))})}
