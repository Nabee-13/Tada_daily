/* 색 선택기(네모 + 무지개 막대) 컴포넌트 */
// 색상(H)·채도(S)·명도(V) → "#rrggbb"
function hsv2hex(h,s,v){var f=function(n){var k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};return"#"+[f(5),f(3),f(1)].map(function(x){return Math.round(x*255).toString(16).padStart(2,"0")}).join("")}
// "#rrggbb" → {h,s,v}
function hex2hsv(x){var r=parseInt(x.slice(1,3),16)/255,g=parseInt(x.slice(3,5),16)/255,b=parseInt(x.slice(5,7),16)/255,mx=Math.max(r,g,b),d=mx-Math.min(r,g,b),h=0;
 if(d){if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60}return{h:h,s:mx?d/mx:0,v:mx}}
// 네모 + 무지개 막대 색 선택기. 색이 바뀔 때마다 onChange(hex) 호출
function colorPicker(init,onChange){var c=hex2hsv(/^#[0-9a-f]{6}$/i.test(init||"")?init:"#3e63dd"),w=el("div","cp"),sq=el("div","cp-sq"),sk=el("div","cp-k"),hb=el("div","cp-hue"),hk=el("div","cp-k"),hx=el("input");
 hx.maxLength=7;hx.placeholder="#RRGGBB";
 function upd(fire){var hex=hsv2hex(c.h,c.s,c.v);sq.style.background="linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl("+c.h+",100%,50%))";
  sk.style.left=c.s*100+"%";sk.style.top=(1-c.v)*100+"%";hk.style.left=c.h/360*100+"%";sk.style.background=hex;hk.style.background="hsl("+c.h+",100%,50%)";
  if(document.activeElement!==hx)hx.value=hex;if(fire)onChange(hex)}
 function drag(box,fn){function mv(e){var r=box.getBoundingClientRect();fn(Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(e.clientY-r.top)/r.height)));upd(true)}
  box.addEventListener("pointerdown",function(e){box.setPointerCapture(e.pointerId);mv(e);box.onpointermove=mv});box.addEventListener("pointerup",function(){box.onpointermove=null})}
 drag(sq,function(x,y){c.s=x;c.v=1-y});drag(hb,function(x){c.h=x*359.99});
 hx.oninput=function(){if(/^#[0-9a-f]{6}$/i.test(hx.value)){c=hex2hsv(hx.value);upd(true)}};
 sq.appendChild(sk);hb.appendChild(hk);w.append(sq,hb,hx);upd(false);return w}
