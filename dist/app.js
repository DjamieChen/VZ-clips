(() => {
  'use strict';
  const config=window.VZ_CONFIG, $=s=>document.querySelector(s);
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const mediaDialog=$('#media-dialog'),bookingDialog=$('#booking-dialog'),galleryDialog=$('#gallery-dialog');
  const mediaContent=$('#media-content'),mediaFooter=$('#media-footer'),focusOrigins=new WeakMap();
  let currentPhoto=0;
  const safeCalendly=value=>{try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='calendly.com'&&u.pathname!=='/'?u:null;}catch{return null;}};
  const calendly=safeCalendly(config.calendlyUrl);
  function openDialog(dialog){focusOrigins.set(dialog,document.activeElement);dialog.showModal();document.body.style.overflow='hidden';}
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',()=>{document.body.style.overflow=document.querySelector('dialog[open]')?'hidden':'';if(dialog===mediaDialog){mediaContent.replaceChildren();mediaFooter.replaceChildren();}if(dialog===bookingDialog)$('#booking-content').replaceChildren();focusOrigins.get(dialog)?.focus({preventScroll:true});});
  });
  function originalLink(id,text){const a=document.createElement('a');a.href=`https://www.instagram.com/p/${encodeURIComponent(id)}/`;a.target='_blank';a.rel='noopener noreferrer';a.textContent=text;return a;}
  function showPhoto(index){
    currentPhoto=(index+config.gallery.length)%config.gallery.length;const photo=config.gallery[currentPhoto];$('#media-title').textContent=photo.title;
    const img=document.createElement('img');img.src=photo.image;img.alt=photo.alt;img.className='dialog-photo';mediaContent.replaceChildren(img);
    const previous=document.createElement('button');previous.textContent='Previous';previous.addEventListener('click',()=>showPhoto(currentPhoto-1));
    const next=document.createElement('button');next.textContent='Next';next.addEventListener('click',()=>showPhoto(currentPhoto+1));
    const count=document.createElement('span');count.textContent=`${currentPhoto+1} / ${config.gallery.length}`;count.setAttribute('aria-live','polite');mediaFooter.replaceChildren(previous,count,originalLink(photo.source,'Original reel'),next);
  }
  function openPhoto(index){showPhoto(index);openDialog(mediaDialog);}
  mediaDialog.addEventListener('keydown',e=>{if(!mediaContent.querySelector('.dialog-photo'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(currentPhoto+(e.key==='ArrowRight'?1:-1));}});
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
  const photoButtons=[];
  config.gallery.forEach((photo,index)=>{
    function makeButton(className){const b=document.createElement('button');b.className=className;b.dataset.cursor='VIEW';b.setAttribute('aria-label',`View ${photo.title}`);const img=document.createElement('img');img.src=photo.image;img.alt=photo.alt;img.loading='lazy';img.draggable=false;const title=document.createElement('span');title.textContent=photo.title;b.append(img,title);return b;}
    const orbit=makeButton('orbit-card');orbit.addEventListener('click',()=>{if(!cutWheel.wasDragged())openPhoto(index);});$('#cut-ring').append(orbit);photoButtons.push(orbit);
    const grid=makeButton('all-cut');grid.addEventListener('click',()=>openPhoto(index));$('#all-cuts').append(grid);
  });
  $('#view-all').addEventListener('click',()=>openDialog(galleryDialog));
  // Responsive elliptical orbits retain readable cards with a sense of depth.
  function makeWheel({surface,cards,previous,next,pause,review=false}){
    let angle=0,target=0,width=surface.clientWidth,height=surface.clientHeight,visible=false,hover=false,focused=false;
    let paused=reducedMotion.matches,dragging=false,dragged=false,startX=0,lastX=0,dragStart=0,velocity=0,frame=0,lastTime=0;
    const step=Math.PI*2/cards.length;
    function updatePause(){pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',`${paused?'Resume':'Pause'} ${review?'review':'haircut'} rotation`);}
    function render(){cards.forEach((card,index)=>{const phase=angle+index*step+Math.PI/2,depth=(Math.sin(phase)+1)/2;const x=Math.cos(phase)*width*.35,y=Math.sin(phase)*height*(review ? .28 : .29);const scale=review ? .7+depth*.3 : .55+depth*.45,tilt=Math.cos(phase)*(review?12:18);card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,0) rotate(${tilt}deg) scale(${scale})`;card.style.opacity=String(review ? .25+depth*.75 : .45+depth*.55);card.style.zIndex=String(Math.round(depth*100));});}
    function animate(time){frame=0;const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;if(!dragging){if(Math.abs(target-angle)>.0001)angle+=(target-angle)*(1-Math.exp(-dt*7));else if(velocity){angle+=velocity*dt;target=angle;velocity*=Math.exp(-dt*5);if(Math.abs(velocity)<.002)velocity=0;}else if(!paused&&!hover&&!focused&&!document.querySelector('dialog[open]')){angle+=dt*(review ? .13 : .1);target=angle;}}render();if(visible&&!document.hidden)frame=requestAnimationFrame(animate);}
    function start(){if(!frame&&visible&&!document.hidden){lastTime=0;frame=requestAnimationFrame(animate);}}
    function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0;}
    function move(direction){paused=true;updatePause();velocity=0;target+=direction*step;if(reducedMotion.matches){angle=target;render();}start();if(review){const i=((Math.round(-target/step)%cards.length)+cards.length)%cards.length;$('#review-announcement').textContent=`${config.reviews[i].quote}. ${config.reviews[i].name}. Five stars.`;}}
    previous.addEventListener('click',()=>move(1));next.addEventListener('click',()=>move(-1));pause.addEventListener('click',()=>{paused=!paused;updatePause();velocity=0;start();});
    surface.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')hover=true;});surface.addEventListener('pointerleave',()=>hover=false);surface.addEventListener('focusin',()=>focused=true);surface.addEventListener('focusout',e=>focused=surface.contains(e.relatedTarget));
    if(!review){surface.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?-1:1);}});
      surface.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;dragged=false;startX=lastX=e.clientX;dragStart=angle;velocity=0;surface.classList.add('dragging');});
      window.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-startX;if(Math.abs(dx)>7){dragged=true;surface.setPointerCapture(e.pointerId);}angle=dragStart+dx*.008;target=angle;velocity=(e.clientX-lastX)*.12;lastX=e.clientX;render();});
      const endDrag=()=>{if(!dragging)return;dragging=false;surface.classList.remove('dragging');if(dragged){paused=true;updatePause();if(reducedMotion.matches)velocity=0;}start();};window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);
    }
    new ResizeObserver(()=>{width=surface.clientWidth;height=surface.clientHeight;render();}).observe(surface);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:.05}).observe(surface);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;velocity=0;updatePause();render();});updatePause();render();return{wasDragged:()=>dragged};
  }
  const cutWheel=makeWheel({surface:$('#cut-orbit'),cards:photoButtons,previous:$('#cuts-prev'),next:$('#cuts-next'),pause:$('#cuts-pause')});
  const reviewCards=config.reviews.map(review=>{const f=document.createElement('figure');f.className='review-card';const stars=document.createElement('div');stars.className='stars';stars.textContent='★★★★★';stars.setAttribute('aria-label','5 out of 5 stars');const q=document.createElement('blockquote');q.textContent=`“${review.quote}”`;const c=document.createElement('figcaption');c.textContent=review.name;f.append(stars,q,c);$('#review-ring').append(f);return f;});
  makeWheel({surface:$('#review-wheel'),cards:reviewCards,previous:$('#reviews-prev'),next:$('#reviews-next'),pause:$('#reviews-pause'),review:true});
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


