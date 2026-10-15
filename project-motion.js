(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const style = document.createElement('style');
  style.textContent = '.project-image,.orbit-card{position:relative}.project-motion{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}.orbit-card:not(.active) .project-motion{filter:grayscale(1) brightness(.7)}.motion-toggle{display:block;margin:12px auto;padding:8px 12px;background:#111;color:#ccc;border:1px solid #444;font:11px Arial,sans-serif}.motion-toggle:focus-visible{outline:2px solid white;outline-offset:3px}.motion-toggle[hidden]{display:none}';
  document.head.append(style);
  const toggle = document.createElement('button');
  toggle.type = 'button';toggle.className = 'motion-toggle';
  (document.querySelector('.caption') || document.querySelector('.gallery-controls')).after(toggle);
  toggle.addEventListener('click', () => {paused = !paused;sync();});
  const media = {
    'gerard-doustraat': {poster:'/images/gerard-doustraat-start-v2-20261015.webp',video:'/videos/gerard-doustraat-v2-20261015.mp4'},
    'rozengracht': {poster:'/images/rozengracht-rain-20261015.webp',video:'/videos/rozengracht-rain-20261015.mp4'}
  };
  const selector = Object.keys(media).map(slug => `.project-slide[data-project="${slug}"],.orbit-card[data-slug="${slug}"]`).join(',');
  function sync() {
    let active = false;
    document.querySelectorAll(selector).forEach(card => {
      const asset = media[card.dataset.project || card.dataset.slug];
      const host = card.querySelector('.project-image') || card;
      // Ring panels are emptied when they move to the back of the carousel.
      if(!host.querySelector('img'))return;
      let v = host.querySelector('.project-motion');
      if(!v){
        v = document.createElement('video');v.className = 'project-motion';
        v.muted = true;v.loop = true;v.playsInline = true;v.preload = 'none';
        v.poster = asset.poster;
        v.setAttribute('aria-hidden','true');
        host.append(v);
      }
      const selected = card.classList.contains('is-active') || card.classList.contains('active');
      active ||= selected;
      if(selected && !paused && !document.hidden && !document.querySelector('dialog[open]')){
        if(!v.getAttribute('src'))v.src = asset.video;
        if(v.paused)v.play().catch(()=>{});
      }else if(!v.paused)v.pause();
    });
    toggle.hidden = !active;
    const label = paused ? 'Animatie afspelen' : 'Animatie pauzeren';
    if(toggle.textContent !== label)toggle.textContent = label;
    toggle.setAttribute('aria-pressed',String(!paused));
  }
  let scheduled = false;
  new MutationObserver(() => {
    if(scheduled)return;scheduled = true;
    requestAnimationFrame(() => {scheduled = false;sync();});
  }).observe(document.querySelector('main'),{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-slug']});
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',sync);new MutationObserver(sync).observe(d,{attributes:true,attributeFilter:['open']});});
  sync();
})();
