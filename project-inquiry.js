/* A local message composer; visitor input is only passed to the chosen mail app. */
(() => {
  'use strict';
  const form = document.getElementById('project-brief');
  if (!form) return;
  const sources = JSON.parse(document.getElementById('inquiry-sources').textContent);
  const via = new URLSearchParams(location.search).get('via');
  const source = Object.hasOwn(sources, via) ? sources[via] : null;
  if (source) {
    const context = document.getElementById('entry-context');
    context.textContent = 'Naar aanleiding van: ' + source.label;
    context.hidden = false;
    const kind = source.kind.toLowerCase();
    document.getElementById('service').value = /interieur|horeca|keuken/.test(kind) ? 'interieur'
      : /dak|dakkapel/.test(kind) ? 'dakopbouw'
      : /vergunning/.test(kind) ? 'vergunning'
      : /technisch|bim|hsb/.test(kind) ? 'technisch' : 'verbouwing';
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const service = document.getElementById('service');
    const lines = ['Hoi Michael, ik wil graag mijn project bespreken.', '',
      'Naam / bedrijf: ' + data.get('name').trim(),
      'Gevraagd: ' + (service.value ? service.selectedOptions[0].textContent : 'Nog te bespreken'),
      'Locatie: ' + data.get('place').trim(),
      'Plan: ' + data.get('description').trim()];
    if (data.get('timing').trim()) lines.push('Planning: ' + data.get('timing').trim());
    if (data.get('discovery')) lines.push('Gevonden via: ' + data.get('discovery'));
    if (source) lines.push('Bekeken op de website: ' + source.label);
    lines.push('', 'Via: project-bespreken op studiovangeene.nl');
    const body = encodeURIComponent(lines.join('\n'));
    const mail = event.submitter?.value === 'email';
    const channel = mail ? 'email' : 'whatsapp';
    const destination = mail
      ? 'mailto:michael@studiovangeene.nl?subject=' + encodeURIComponent('Projectaanvraag — ' + data.get('name').trim()) + '&body=' + body
      : 'https://wa.me/31626130070?text=' + body;
    document.getElementById('brief-status').textContent = mail
      ? 'Je mailapp wordt geopend. Voeg daar eventueel bestanden toe en verstuur je bericht.'
      : 'WhatsApp wordt geopend. Voeg daar eventueel bestanden toe en verstuur je bericht.';
    document.dispatchEvent(new CustomEvent('studio:contact', { detail: { channel } }));
    window.location.href = destination;
  });
  form.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = false; });
})();
