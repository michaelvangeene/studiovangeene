/* Loads measurements only when this browser has not opted out. */
(() => {
  'use strict';
  if (window.__studioAnalyticsPreferenceLoaded) return;
  window.__studioAnalyticsPreferenceLoaded = true;
  const key = 'studio-analytics-opt-out';
  const preference = new URLSearchParams(location.search).get('analytics');
  let excluded = preference === 'off';
  let saved = false;
  try {
    if (preference === 'off') localStorage.setItem(key, '1');
    else if (preference === 'on') localStorage.removeItem(key);
    excluded = excluded || localStorage.getItem(key) === '1';
    saved = preference === 'off' && localStorage.getItem(key) === '1';
  } catch (_) {
    // If storage is blocked, exclusion still applies to this page.
  }
  if (preference === 'off' || preference === 'on') {
    const notice = document.createElement('div');
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'position:fixed;top:16px;left:16px;right:16px;z-index:99999;padding:16px 48px 16px 18px;background:#f3f3ef;color:#111;border:1px solid #aaa;font:14px/1.5 Arial,sans-serif;text-align:left;box-sizing:border-box';
    const text = document.createElement('span');
    const privacySignal = navigator.doNotTrack === '1' || navigator.globalPrivacyControl;
    text.textContent = preference === 'off'
      ? (saved ? 'Je bezoeken en kliks tellen vanaf nu niet mee in deze browser. Dit blijft zo totdat je browsergegevens wist of de meting weer aanzet.' : 'Je bezoeken en kliks tellen op deze pagina niet mee. Deze browser blokkeert het bewaren van de instelling; open je website steeds met ?analytics=off.')
      : (excluded ? 'De uitsluiting staat nog aan. Controleer of je browser het wijzigen van de instelling toestaat.' : privacySignal ? 'De opgeslagen uitsluiting is verwijderd. Je privacyinstelling in de browser houdt de meting uitgeschakeld.' : 'De meting staat weer aan voor deze browser.');
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Melding sluiten');
    close.style.cssText = 'position:absolute;right:10px;top:9px;padding:4px 10px;background:transparent;border:0;font:24px/1 Arial,sans-serif;color:#111;cursor:pointer';
    close.addEventListener('click', () => notice.remove());
    notice.append(text, close);
    document.body.append(notice);
  }
  if (excluded || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon = JSON.stringify({ token: '53a09125f96e42c1adb8ea5bbb56404a' });
  document.head.append(beacon);
  const interactions = document.createElement('script');
  interactions.src = '/site-analytics.js?v=20261031-optout';
  interactions.dataset.endpoint = 'https://studiovangeene-events.studiovangeene.workers.dev/collect';
  document.head.append(interactions);
})();
