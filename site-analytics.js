/* Anonymous interaction counts. No cookies, identifiers or full URLs are sent. */
(() => {
  'use strict';
  const endpoint = document.currentScript?.dataset.endpoint;
  if (!endpoint || window.__studioAnalyticsLoaded) return;
  window.__studioAnalyticsLoaded = true;
  const params = new URLSearchParams(location.search);
  if (params.get('analytics') === 'off' || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const segment = ['home', 'technical', 'interior'].includes(params.get('segment')) ? params.get('segment') : 'all';
  let sent = 0;
  function send(event, fields = {}) {
    if (sent >= 150) return;
    sent += 1;
    const body = JSON.stringify({ event, segment, ...fields });
    // text/plain avoids a CORS preflight; keepalive preserves contact navigation.
    void fetch(endpoint, {
      method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
      referrerPolicy: 'no-referrer', headers: { 'Content-Type': 'text/plain' }, body
    }).catch(() => {});
  }
  send('page_view');
  const track = document.querySelector('.project-track');
  const viewed = new Set();
  let current = '';
  let timer = 0;
  function scan() {
    const slide = track?.querySelector('.project-slide.is-active');
    const id = slide?.dataset.project || '';
    const rect = slide?.getBoundingClientRect();
    const visible = rect && rect.width > 0 && rect.height > 0 &&
      rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
    const candidate = document.visibilityState === 'visible' && visible ? id : '';
    if (candidate === current) return;
    current = candidate;
    clearTimeout(timer);
    if (!current || viewed.has(current)) return;
    timer = setTimeout(() => {
      // Recheck geometry and visibility before counting a completed dwell.
      const active = track?.querySelector('.project-slide.is-active');
      const box = active?.getBoundingClientRect();
      if (document.visibilityState !== 'visible' || active?.dataset.project !== candidate ||
          !box || box.right <= 0 || box.left >= innerWidth || box.bottom <= 0 || box.top >= innerHeight) return;
      viewed.add(candidate);
      send('project_view', { project: candidate });
    }, 1500);
  }
  if (track) {
    new MutationObserver(scan).observe(track, { attributes: true, attributeFilter: ['class'], subtree: true });
    document.addEventListener('visibilitychange', scan);
    window.addEventListener('scroll', scan, { passive: true });
    window.addEventListener('resize', scan, { passive: true });
    scan();
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    let channel = '';
    if (/^mailto:/i.test(href)) channel = 'email';
    else if (/^tel:/i.test(href)) channel = 'phone';
    else {
      try { if (['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(new URL(href, location.href).hostname)) channel = 'whatsapp'; } catch (_) {}
    }
    if (channel) send('contact_click', { channel, project: current });
    if (['all', 'home', 'technical', 'interior'].includes(link.dataset.segment)) {
      send('segment_select', { channel: link.dataset.segment });
    }
  }, { capture: true });
})();
