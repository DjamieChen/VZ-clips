(() => {
  'use strict';
  const config=window.VZ_CONFIG, $=s=>document.querySelector(s);
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const mediaDialog=$('#media-dialog'),bookingDialog=$('#booking-dialog');
  const mediaContent=$('#media-content'),mediaFooter=$('#media-footer'),focusOrigins=new WeakMap();
  const safeCalendly=value=>{try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='calendly.com'&&u.pathname!=='/'?u:null;}catch{return null;}};
  const calendly=safeCalendly(config.calendlyUrl);
  function openDialog(dialog){focusOrigins.set(dialog,document.activeElement);dialog.showModal();dialog.append(document.querySelector('.custom-cursor'));document.body.style.overflow='hidden';}
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',()=>{(document.querySelector('dialog[open]')||document.body).append(document.querySelector('.custom-cursor'));document.body.style.overflow=document.querySelector('dialog[open]')?'hidden':'';if(dialog===mediaDialog){mediaContent.replaceChildren();mediaFooter.replaceChildren();}if(dialog===bookingDialog)$('#booking-content').replaceChildren();focusOrigins.get(dialog)?.focus({preventScroll:true});});
  });
  function originalLink(id,text){const a=document.createElement('a');a.href=`https://www.instagram.com/p/${encodeURIComponent(id)}/`;a.target='_blank';a.rel='noopener noreferrer';a.textContent=text;return a;}
  function openReel(reel){
    $('#media-title').textContent=reel.title;const iframe=document.createElement('iframe');iframe.title=`VZ Clips Instagram reel: ${reel.title}`;iframe.src=`https://www.instagram.com/p/${encodeURIComponent(reel.id)}/embed/`;iframe.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
    const help=document.createElement('p');help.className='embed-help';help.append('Instagram may ask you to sign in. ',originalLink(reel.id,'Watch the original on Instagram'));mediaContent.replaceChildren(iframe,help);mediaFooter.replaceChildren();openDialog(mediaDialog);
  }
  config.reels.forEach(reel=>{
    const button=document.createElement('button');button.className='reel-card';button.dataset.cursor='PLAY';button.setAttribute('aria-label',`Watch ${reel.title} on Instagram`);
    const poster=document.createElement('img');poster.src=reel.poster;poster.alt=`Client in ${reel.title}`;poster.loading='lazy';
    const play=document.createElement('span');play.className='play';play.textContent='▶';play.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.className='reel-label';const small=document.createElement('small');small.textContent=reel.label;const title=document.createElement('strong');title.textContent=reel.title;label.append(small,title);button.append(poster,play,label);button.addEventListener('click',()=>openReel(reel));$('#reel-grid').append(button);
  });
  $('#hero-play').addEventListener('click',()=>openReel(config.hero));
  const photoCards=config.gallery.map(photo=>{
    const card=document.createElement('figure');card.className='orbit-card';
    const img=document.createElement('img');img.src=photo.image;img.alt=photo.alt;img.loading='lazy';img.draggable=false;
    const title=document.createElement('span');title.textContent=photo.title;card.append(img,title);$('#cut-ring').append(card);return card;
  });
  function makeWheel({surface,cards,review=false}){
    let angle=0,width=surface.clientWidth,height=surface.clientHeight,visible=false,frame=0,lastTime=0;
    let dragging=false,pointerId=null,lastX=0,lastPointerTime=0,velocity=0,scrollBoost=0,lastScroll=scrollY;
    const step=Math.PI*2/cards.length;
    const section=surface.closest('section'),stage=section.querySelector('.scroll-stage'),turns=Number(stage?.dataset.scrollTurns||0);
    let scrollAngle=0,sectionTop=0,scrollDistance=1;
    function measureScroll(){
      const headerHeight=$('.header').offsetHeight;
      if(!stage)return;
      const distance=innerHeight*turns*1.4;
      section.style.height=reducedMotion.matches?'auto':(stage.offsetHeight+distance)+'px';
      sectionTop=section.getBoundingClientRect().top+scrollY-headerHeight;
      scrollDistance=distance;
      updateScroll();
    }
    function updateScroll(){
      const progress=reducedMotion.matches?0:Math.max(0,Math.min(1,(scrollY-sectionTop)/scrollDistance));
      scrollAngle=progress*turns*Math.PI*2;
      render();
    }
    window.addEventListener('resize',measureScroll);
    reducedMotion.addEventListener('change',measureScroll);
    requestAnimationFrame(measureScroll);
    document.fonts?.ready.then(measureScroll);
    window.addEventListener('load',measureScroll,{once:true});
    let lastReviewTurn=0,reviewOrder=[...config.reviews];
    function refreshReviewOrder(){
      const turn=Math.floor(angle/(Math.PI*2));
      if(!review||turn===lastReviewTurn)return;
      lastReviewTurn=turn;
      let next;
      for(let attempt=0;attempt<12;attempt++){
        next=[...reviewOrder];
        for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]];}
        if(next.every((r,i)=>r!==reviewOrder[i]))break;
      }
      if(next.some((r,i)=>r===reviewOrder[i]))next=reviewOrder.slice(1).concat(reviewOrder[0]);
      reviewOrder=next;
      cards.forEach((card,index)=>card.nextReview=next[index]);
      surface.dataset.reviewRound=String(turn);
    }
    function render(){refreshReviewOrder();cards.forEach((card,index)=>{
      const phase=angle+scrollAngle+index*step+Math.PI/2,front=Math.sin(phase),depth=(front+1)/2;
      if(review){
        card.style.visibility='visible';
        if(card.nextReview&&front<-.75){
          card.querySelector('blockquote').textContent='“'+card.nextReview.quote+'”';
          card.querySelector('figcaption').textContent=card.nextReview.name;
          card.nextReview=null;
        }
      }
      surface.dataset.scrollTurns=String(scrollAngle/(Math.PI*2));
      const x=Math.cos(phase)*width*.35,y=Math.sin(phase)*height*(review?.28:.29);
      const scale=review?.7+depth*.3:.55+depth*.45,tilt=Math.cos(phase)*(review?12:18);
      card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${tilt}deg) scale(${scale})`;
      card.style.opacity=String(review?.25+depth*.75:.45+depth*.55);card.style.zIndex=String(Math.round(depth*100));
    });}
    function animate(time){
      frame=0;const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
      if(!dragging&&!reducedMotion.matches){angle+=dt*((review?.18:.16)+velocity+scrollBoost);velocity*=Math.exp(-dt*3);scrollBoost*=Math.exp(-dt*2.3);}
      render();if(visible&&!document.hidden&&!reducedMotion.matches)frame=requestAnimationFrame(animate);
    }
    function start(){if(!frame&&visible&&!document.hidden&&!reducedMotion.matches){lastTime=0;frame=requestAnimationFrame(animate);}}
    function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0;}
    window.addEventListener('scroll',()=>{const distance=Math.abs(scrollY-lastScroll);lastScroll=scrollY;updateScroll();if(visible&&!reducedMotion.matches){scrollBoost=Math.min(3,scrollBoost+distance*.006);start();}},{passive:true});
    {
      surface.addEventListener('pointerdown',e=>{if(e.button!==0||pointerId!==null)return;pointerId=e.pointerId;dragging=true;lastX=e.clientX;lastPointerTime=e.timeStamp;velocity=0;surface.setPointerCapture(e.pointerId);surface.classList.add('dragging');});
      surface.addEventListener('pointermove',e=>{if(e.pointerId!==pointerId)return;const dx=e.clientX-lastX,seconds=Math.max((e.timeStamp-lastPointerTime)/1000,.008);angle+=dx*.008;velocity=Math.max(-5,Math.min(5,dx*.008/seconds));lastX=e.clientX;lastPointerTime=e.timeStamp;render();});
      const release=e=>{if(e.pointerId!==pointerId)return;dragging=false;pointerId=null;surface.classList.remove('dragging');if(surface.hasPointerCapture(e.pointerId))surface.releasePointerCapture(e.pointerId);if(reducedMotion.matches)velocity=0;start();};
      surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);surface.addEventListener('lostpointercapture',e=>{if(e.pointerId===pointerId)release(e);});
      surface.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();angle+=(e.key==='ArrowRight'?-1:1)*step;render();}});
    }
    new ResizeObserver(()=>{width=surface.clientWidth;height=surface.clientHeight;render();}).observe(surface);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visible?start():stop();},{threshold:.05}).observe(surface);
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
    reducedMotion.addEventListener('change',()=>{velocity=scrollBoost=0;reducedMotion.matches?stop():start();render();});render();
  }
  makeWheel({surface:$('#cut-orbit'),cards:photoCards});
  // Use only the supplied reactions, with a fresh order on each full revolution.
  const reviewCards=config.reviews.map(review=>{const f=document.createElement('figure');f.className='review-card';const stars=document.createElement('div');stars.className='stars';stars.textContent='★★★★★';stars.setAttribute('aria-label','5 out of 5 stars');const q=document.createElement('blockquote');q.textContent=`“${review.quote}”`;const c=document.createElement('figcaption');c.textContent=review.name;f.append(stars,q,c);$('#review-ring').append(f);return f;});
  makeWheel({surface:$('#review-wheel'),cards:reviewCards,review:true});
  function makeCalendar(title){const url=new URL(calendly);url.searchParams.set('embed_type','Inline');url.searchParams.set('embed_domain',location.hostname);url.searchParams.set('hide_gdpr_banner','0');url.searchParams.set('primary_color','4a5b31');const iframe=document.createElement('iframe');iframe.title=title;iframe.src=url.href;iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';return iframe;}
  if(calendly){const inline=$('#calendar-inline'),load=document.createElement('button');load.className='button';load.textContent='View available times here';load.addEventListener('click',()=>inline.replaceChildren(makeCalendar('Book a VZ Clips haircut with Calendly')));inline.append(load);}
  function openBooking(){const content=$('#booking-content');content.replaceChildren();if(calendly)content.append(makeCalendar('Choose your VZ Clips appointment on Calendly'));else{
    const title=document.createElement('h3');title.textContent='A fresh cut with Vaughn.';const text=document.createElement('p');text.textContent='Choose a real available time on the VZ Clips booking page. Your appointment is confirmed there.';
    const details=document.createElement('div');details.className='booking-details';const service=document.createElement('span');service.textContent='Men’s haircut · 60 min';const price=document.createElement('strong');price.textContent='$35';details.append(service,price);
    const link=document.createElement('a');link.className='button';link.href=config.setmoreUrl;link.target='_blank';link.rel='noopener noreferrer';link.textContent='See available times on Setmore';content.append(title,text,details,link);
  }const fallback=document.createElement('a');fallback.href=calendly?calendly.href:config.setmoreUrl;fallback.className='booking-fallback';fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent=calendly?'Open Calendly in a new tab':'Open the full booking page';content.append(fallback);openDialog(bookingDialog);}
  document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',openBooking));$('#year').textContent=new Date().getFullYear();
  // Word masks animate the visuals while headings retain accessible names.
  document.querySelectorAll('main h1,main h2').forEach(heading=>{heading.setAttribute('aria-label',heading.innerText.replace(/\s+/g,' ').trim());let i=0;function split(node){[...node.childNodes].forEach(child=>{if(child.nodeType===Node.TEXT_NODE){const f=document.createDocumentFragment();child.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim()){f.append(document.createTextNode(word));return;}const mask=document.createElement('span');mask.className='word-mask';mask.setAttribute('aria-hidden','true');const rise=document.createElement('span');rise.className='word-rise';rise.style.setProperty('--word-delay',`${Math.min(i++*38,340)}ms`);rise.textContent=word;mask.append(rise);f.append(mask);});child.replaceWith(f);}else if(child.nodeType===Node.ELEMENT_NODE)split(child);});}split(heading);heading.classList.add('heading-motion');});
  if('IntersectionObserver' in window&&!reducedMotion.matches){document.body.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.15});document.querySelectorAll('.reveal,.heading-motion').forEach(el=>observer.observe(el));}
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)document.body.classList.remove('motion-ready');});
  let scrollQueued=false;window.addEventListener('scroll',()=>{if(scrollQueued||reducedMotion.matches)return;scrollQueued=true;requestAnimationFrame(()=>{if(scrollY<innerHeight*1.5)$('.hero-image>img').style.transform=`scale(${1.03+Math.min(scrollY/innerHeight,.8)*.07})`;scrollQueued=false;});},{passive:true});
  const finePointer=matchMedia('(hover:hover) and (pointer:fine) and (min-width:701px)'),cursor=$('.custom-cursor');let cursorFrame=0,x=0,y=0,cx=0,cy=0;
  function drawCursor(){cx+=(x-cx)*.19;cy+=(y-cy)*.19;cursor.style.transform=`translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;if(Math.abs(x-cx)+Math.abs(y-cy)>.05)cursorFrame=requestAnimationFrame(drawCursor);else cursorFrame=0;}
  window.addEventListener('pointermove',e=>{if(!finePointer.matches||reducedMotion.matches||e.pointerType==='touch')return;x=e.clientX;y=e.clientY;if(!document.body.classList.contains('cursor-ready')){cx=x;cy=y;document.body.classList.add('cursor-ready');}cursor.classList.add('shown');if(!cursorFrame)cursorFrame=requestAnimationFrame(drawCursor);const control=e.target.closest('button,a,summary,[data-cursor]');cursor.classList.toggle('expanded',!!control);cursor.querySelector('span').textContent=control?.dataset.cursor||'';},{passive:true});
  document.addEventListener('pointerleave',()=>cursor.classList.remove('shown'));document.addEventListener('focusin',()=>cursor.classList.remove('shown'));
  const resetCursor=()=>{if(!finePointer.matches||reducedMotion.matches){document.body.classList.remove('cursor-ready');cursor.classList.remove('shown');cancelAnimationFrame(cursorFrame);cursorFrame=0;}};finePointer.addEventListener('change',resetCursor);reducedMotion.addEventListener('change',resetCursor);
})();



