(function(){
var doc=document.documentElement,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* lingua */
function setLang(l){doc.lang=l;try{localStorage.setItem('pl_lang',l)}catch(e){}}
var saved=null;try{saved=localStorage.getItem('pl_lang')}catch(e){}
setLang(saved||((navigator.language||'it').slice(0,2)==='it'?'it':'en'));
var lb=document.getElementById('lang');
if(lb)lb.addEventListener('click',function(){setLang(doc.lang==='it'?'en':'it')});

/* sfondo: numeri che fluttuano */
var cv=document.getElementById('bg');
if(cv&&!reduce){
  var cx=cv.getContext('2d'),W,H,items=[],cols=['#c8ff00','#ff2d55','#35e0ff','#ffb02e'];
  function size(){W=cv.width=innerWidth;H=cv.height=innerHeight;var n=Math.round(W*H/38000);items=[];
    for(var i=0;i<n;i++)items.push({x:Math.random()*W,y:Math.random()*H,v:.15+Math.random()*.45,s:14+Math.random()*34,t:String(1+Math.floor(Math.random()*Math.random()*99)),c:cols[i%4],a:.05+Math.random()*.1})}
  size();addEventListener('resize',size);
  (function loop(){cx.clearRect(0,0,W,H);
    items.forEach(function(o){o.y-=o.v;if(o.y<-50){o.y=H+50;o.x=Math.random()*W}
      cx.globalAlpha=o.a;cx.fillStyle=o.c;cx.font='900 '+o.s+'px "Arial Black",system-ui';cx.fillText(o.t,o.x,o.y)});
    requestAnimationFrame(loop)})();
}

/* comparsa allo scorrimento */
var rv=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window&&!reduce){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
  rv.forEach(function(el){io.observe(el)});
}else rv.forEach(function(el){el.classList.add('in')});

/* inclinazione schede */
if(!reduce&&matchMedia('(hover:hover)').matches){
  document.querySelectorAll('.tilt').forEach(function(c){
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.transform='perspective(800px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg) translateY(-4px)'});
    c.addEventListener('mouseleave',function(){c.style.transform=''});
  });
}

/* frecce di scorrimento sulle file di immagini */
var arrows=[];
document.querySelectorAll('.reel').forEach(function(r){
  var w=document.createElement('div');w.className='reel-wrap';r.parentNode.insertBefore(w,r);w.appendChild(r);
  function mk(dir){var b=document.createElement('button');b.type='button';b.className='arr '+dir;
    b.setAttribute('aria-label',dir==='next'?'Next':'Previous');
    b.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="'+(dir==='next'?'M8 4l8 8-8 8':'M16 4l-8 8 8 8')+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    b.addEventListener('click',function(){r.scrollBy({left:(dir==='next'?1:-1)*Math.max(260,r.clientWidth*.8),behavior:reduce?'auto':'smooth'})});
    w.appendChild(b);return b}
  var p=mk('prev'),n=mk('next');
  function upd(){p.hidden=r.scrollLeft<6;n.hidden=r.scrollLeft+r.clientWidth>=r.scrollWidth-6}
  r.addEventListener('scroll',upd,{passive:true});arrows.push(upd);upd();setTimeout(upd,400);
});
addEventListener('resize',function(){arrows.forEach(function(f){f()})});
if(lb)lb.addEventListener('click',function(){setTimeout(function(){arrows.forEach(function(f){f()})},50)});
document.querySelectorAll('.reel img').forEach(function(i){i.addEventListener('load',function(){arrows.forEach(function(f){f()})})});

/* contatori */
document.querySelectorAll('[data-count]').forEach(function(el){
  var n=+el.getAttribute('data-count');if(reduce||!n)return;var s=null;el.textContent='0';
  function step(ts){if(!s)s=ts;var p=Math.min((ts-s)/900,1);el.textContent=Math.round(n*p);if(p<1)requestAnimationFrame(step)}
  requestAnimationFrame(step);
});

/* demo UNICO: simulazione, non e' una partita vera */
var pk=document.getElementById('picks'),out=document.getElementById('demoOut');
if(pk&&out){
  for(var i=1;i<=12;i++){(function(n){var b=document.createElement('button');b.textContent=n;b.addEventListener('click',function(){play(n)});pk.appendChild(b)})(i)}
  function play(me){
    var others=[];for(var k=0;k<7;k++)others.push(1+Math.floor(Math.random()*Math.random()*12*1.3)%12);
    var all=others.concat([me]),cnt={};all.forEach(function(v){cnt[v]=(cnt[v]||0)+1});
    var win=null;Object.keys(cnt).map(Number).sort(function(a,b){return a-b}).some(function(v){if(cnt[v]===1){win=v;return true}});
    var chips=all.slice().sort(function(a,b){return a-b}).map(function(v,idx){var c='';
      if(cnt[v]>1)c+=' dup';if(v===win)c+=' win';return '<span class="'+c+'">'+v+'</span>'}).join('');
    var it=doc.lang==='it',msg;
    if(win===me)msg=it?'<b>Hai vinto!</b> Il tuo '+me+' è il numero più basso scelto da una sola persona.':'<b>You win!</b> Your '+me+' is the lowest number chosen by exactly one person.';
    else if(cnt[me]>1)msg=it?'<span class="lose">Il tuo '+me+' è stato scelto da altri: non può vincere.</span> Vince il '+win+'.':'<span class="lose">Someone else picked your '+me+': it cannot win.</span> The winner is '+win+'.';
    else msg=it?'<span class="lose">Il tuo '+me+' era unico, ma un numero più basso lo ha battuto.</span> Vince il '+win+'.':'<span class="lose">Your '+me+' was unique, but a lower number beat it.</span> The winner is '+win+'.';
    out.innerHTML='<div class="chips">'+chips+'</div><p>'+msg+'</p>';
  }
}
})();
