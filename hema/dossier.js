const archive = document.querySelector('#archief');
const controls = archive.querySelector('.archive-tools');
const search = controls.querySelector('[data-search]');
const kind = controls.querySelector('[data-kind]');
const status = archive.querySelector('.archive-status');

function normalize(text) {
  return text.toLocaleLowerCase('nl').normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

const records = Array.from(archive.querySelectorAll('.record'), element => ({
  element,
  kind: element.dataset.kind,
  terms: normalize(element.textContent + ' ' + (element.dataset.terms || ''))
}));

function filterArchive() {
  const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  let shown = 0;
  for (const record of records) {
    const matches = (!kind.value || record.kind === kind.value) &&
      words.every(word => record.terms.includes(word));
    record.element.hidden = !matches;
    shown += Number(matches);
  }
  status.textContent = shown === 0 ? 'Geen stukken gevonden.' : shown + (shown === 1 ? ' stuk' : ' stukken');
}

controls.hidden = false;
status.hidden = false;
search.addEventListener('input', filterArchive);
kind.addEventListener('change', filterArchive);
filterArchive();

const dialog = document.querySelector('#beeldvenster');
const image = dialog.querySelector('img');
const viewer = dialog.querySelector('.dialog-media');
const title = dialog.querySelector('h2');
const caption = dialog.querySelector('.dialog-caption');
const zoom = dialog.querySelector('[data-zoom]');
let opener;

function resetZoom() {
  viewer.classList.remove('is-zoomed');
  viewer.scrollTo(0, 0);
  zoom.setAttribute('aria-pressed', 'false');
  zoom.textContent = 'Inzoomen';
}

if (typeof dialog.showModal === 'function') {
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-image]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const figure = link.closest('figure');
    const original = figure.querySelector('img');
    const credit = figure.querySelector('figcaption');
    event.preventDefault();
    opener = link;
    title.textContent = credit.querySelector('strong').textContent;
    caption.replaceChildren(...Array.from(credit.children).slice(1).map(node => node.cloneNode(true)));
    image.alt = original.alt;
    image.src = link.href;
    dialog.showModal();
    resetZoom();
  });

  zoom.addEventListener('click', () => {
    const zoomed = viewer.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(zoomed));
    zoom.textContent = zoomed ? 'Passend beeld' : 'Inzoomen';
    if (!zoomed) viewer.scrollTo(0, 0);
  });

  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
}
