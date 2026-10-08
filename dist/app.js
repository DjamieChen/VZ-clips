(() => {
  'use strict';
  const config = window.VZ_CONFIG;
  const styles = [
    {image:'assets/cut-1.jpg',title:'Texture.\nMeet precision.',description:'Natural movement up top. A clean transition on the sides. Every angle gets its moment.',alt:'Textured taper by VZ Clips'},
    {image:'assets/cut-2.jpg',title:'Clean sides.\nAll character.',description:'A seamless blend that keeps the focus on your texture. Clean, considered, and easy to wear.',alt:'Clean temple taper by VZ Clips'},
    {image:'assets/cut-3.png',title:'Let it\nflow.',description:'Keep the length. Refine the shape. A little more movement, with the details dialed in.',alt:'Natural flow haircut by VZ Clips'},
    {image:'assets/cut-4.png',title:'Your curls.\nElevated.',description:'Texture with room to breathe. Defined shape, clean edges, and a finish that feels like you.',alt:'Curly textured taper by VZ Clips'}
  ];
  let selectedStyle=0, currentPhoto=0, lastFocus=null;
  const image=document.querySelector('#featured-image');
  const mediaDialog=document.querySelector('#media-dialog');
  const bookingDialog=document.querySelector('#booking-dialog');
  const mediaContent=document.querySelector('#media-content');
  const mediaFooter=document.querySelector('#media-footer');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const safeCalendly = value => {
    try { const url=new URL(value); return url.protocol==='https:' && url.hostname==='calendly.com' && url.pathname!=='/' ? url : null; } catch { return null; }
  };
  const calendly=safeCalendly(config.calendlyUrl);
  function selectStyle(index){
    selectedStyle=index; const style=styles[index];
    image.src=style.image; image.alt=style.alt;
    document.querySelector('#featured-title').textContent=style.title;
    document.querySelector('#featured-title').style.whiteSpace='pre-line';
    document.querySelector('#featured-description').textContent=style.description;
    document.querySelector('#image-number').textContent=`0${index+1} / 04`;
    document.querySelectorAll('[data-style]').forEach(button=>{const selected=Number(button.dataset.style)===index;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  }
  document.querySelectorAll('[data-style]').forEach(button=>button.addEventListener('click',()=>selectStyle(Number(button.dataset.style))));
  document.querySelector('.style-selector').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault(); selectStyle((selectedStyle+(event.key==='ArrowRight'?1:3))%styles.length);
    document.querySelector(`[data-style="${selectedStyle}"]`).focus();
  });
  function openDialog(dialog){ lastFocus=document.activeElement; dialog.showModal(); document.body.style.overflow='hidden'; }
  function closeDialog(dialog){dialog.close();}
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.close-dialog').addEventListener('click',()=>closeDialog(dialog));
    dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);}});
    dialog.addEventListener('close',()=>{document.body.style.overflow=''; if(dialog===mediaDialog){mediaContent.replaceChildren();mediaFooter.replaceChildren();} if(dialog===bookingDialog)document.querySelector('#booking-content').replaceChildren();lastFocus?.focus();});
  });
  function showPhoto(index){
    currentPhoto=(index+styles.length)%styles.length; const photo=styles[currentPhoto];
    document.querySelector('#media-title').textContent=photo.alt;
    const img=document.createElement('img');img.src=photo.image;img.alt=photo.alt;img.className='dialog-photo';mediaContent.replaceChildren(img);
    const previous=document.createElement('button');previous.textContent='Previous';previous.addEventListener('click',()=>showPhoto(currentPhoto-1));
    const count=document.createElement('span');count.textContent=`${currentPhoto+1} / ${styles.length}`;count.setAttribute('aria-live','polite');
    const next=document.createElement('button');next.textContent='Next';next.addEventListener('click',()=>showPhoto(currentPhoto+1));
    mediaFooter.replaceChildren(previous,count,next);
  }
  function openPhoto(index){showPhoto(index);openDialog(mediaDialog);}
  document.querySelector('#expand-image').addEventListener('click',()=>openPhoto(selectedStyle));
  document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>openPhoto(Number(button.dataset.photo))));
  mediaDialog.addEventListener('keydown',event=>{if(!mediaContent.querySelector('.dialog-photo'))return;if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(currentPhoto-1);}if(event.key==='ArrowRight'){event.preventDefault();showPhoto(currentPhoto+1);}});
  function openReel(index){
    const reel=config.reels[index]; if(!reel)return;
    document.querySelector('#media-title').textContent=reel.title;
    const iframe=document.createElement('iframe');iframe.title=`VZ Clips Instagram reel: ${reel.title}`;iframe.src=`https://www.instagram.com/reel/${encodeURIComponent(reel.id)}/embed/`;iframe.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
    const help=document.createElement('p');help.className='embed-help';help.append('Instagram may ask you to sign in. ');
    const link=document.createElement('a');link.href=`https://www.instagram.com/vz.clipz/reel/${encodeURIComponent(reel.id)}/`;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Watch the original on Instagram';help.append(link);
    mediaContent.replaceChildren(iframe,help);mediaFooter.replaceChildren();openDialog(mediaDialog);
  }
  const reelGrid=document.querySelector('#reel-grid');
  config.reels.forEach((reel,index)=>{
    const button=document.createElement('button');button.className='reel-card';button.setAttribute('aria-label',`Watch ${reel.title} on Instagram`);
    const poster=document.createElement('img');poster.src=reel.poster;poster.alt='Haircut from the VZ Clips portfolio';poster.loading='lazy';
    const play=document.createElement('span');play.className='play';play.textContent='▶';play.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.className='reel-label';const small=document.createElement('small');small.textContent=reel.label;const title=document.createElement('strong');title.textContent=reel.title;label.append(small,title);button.append(poster,play,label);button.addEventListener('click',()=>openReel(index));reelGrid.append(button);
  });
  document.querySelectorAll('[data-reel]').forEach(button=>button.addEventListener('click',()=>openReel(Number(button.dataset.reel))));
  function makeCalendar(title){
    const url=new URL(calendly);url.searchParams.set('embed_type','Inline');url.searchParams.set('embed_domain',location.hostname);url.searchParams.set('hide_gdpr_banner','0');url.searchParams.set('primary_color','4a5b31');
    const iframe=document.createElement('iframe');iframe.title=title;iframe.src=url.href;iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';return iframe;
  }
  if(calendly){
    const inline=document.querySelector('#calendar-inline');const load=document.createElement('button');load.className='button';load.textContent='View available times here';load.addEventListener('click',()=>inline.replaceChildren(makeCalendar('Book a VZ Clips haircut with Calendly')));inline.append(load);
  }
  function openBooking(){
    const content=document.querySelector('#booking-content');content.replaceChildren();
    if(calendly){content.append(makeCalendar('Choose your VZ Clips appointment on Calendly'));}
    else {
      const title=document.createElement('h3');title.textContent='A fresh cut with Vaughn.';
      const text=document.createElement('p');text.textContent='Choose a real available time on the VZ Clips booking page. Your appointment is confirmed there.';
      const details=document.createElement('div');details.className='booking-details';const service=document.createElement('span');service.textContent='Men’s haircut · 60 min';const price=document.createElement('strong');price.textContent='$35';details.append(service,price);
      const link=document.createElement('a');link.className='button';link.href=config.setmoreUrl;link.target='_blank';link.rel='noopener noreferrer';link.textContent='See available times on Setmore';content.append(title,text,details,link);
    }
    const fallback=document.createElement('a');fallback.href=calendly?calendly.href:config.setmoreUrl;fallback.className='booking-fallback';fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent=calendly?'Open Calendly in a new tab':'Open the full booking page';content.append(fallback);openDialog(bookingDialog);
  }
  document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',openBooking));
  document.querySelector('#year').textContent=new Date().getFullYear();
  if('IntersectionObserver' in window && !reducedMotion.matches){
    document.body.classList.add('motion-ready');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.1});document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
    let ticking=false;
    window.addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const hero=document.querySelector('.hero-image');if(window.scrollY<innerHeight*1.4)hero.querySelector('img').style.transform=`scale(${1.03+Math.min(window.scrollY/innerHeight,.8)*.07})`;ticking=false;});},{passive:true});
  }
})();

