import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function composer(via = 'interieurontwerp', valid = true) {
  const handlers = {};
  const values = { name: 'Test & Co', place: 'Utrecht', description: 'Keuken & bar?\nTwee opties.', timing: '', discovery: 'Google' };
  const service = { value: '', selectedOptions: [{ textContent: 'Interieur woning / horeca' }] };
  const nodes = {
    'project-brief': { querySelectorAll: () => [], addEventListener: (name, fn) => { handlers[name] = fn; }, reportValidity: () => valid },
    'inquiry-sources': { textContent: '{"interieurontwerp":{"label":"Interieurontwerp","kind":"interieur"}}' },
    'entry-context': { hidden: true }, service, 'brief-status': {}
  };
  const events = [];
  const window = { location: { href: '' } };
  const context = {
    document: { getElementById: id => nodes[id], dispatchEvent: event => events.push(event) },
    location: { search: '?via=' + encodeURIComponent(via) }, window, URLSearchParams,
    FormData: class { get(key) { return values[key]; } },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  };
  vm.runInNewContext(readFileSync(new URL('../project-inquiry.js', import.meta.url), 'utf8'), context);
  return { nodes, events, window, submit(channel) { handlers.submit({ preventDefault() {}, submitter: { value: channel } }); } };
}

test('WhatsApp draft preserves punctuation, newlines and known project context', () => {
  const c = composer();
  assert.equal(c.nodes.service.value, 'interieur');
  assert.equal(c.nodes['entry-context'].hidden, false);
  c.submit('whatsapp');
  const url = new URL(c.window.location.href);
  assert.equal(url.origin + url.pathname, 'https://wa.me/31626130070');
  const message = url.searchParams.get('text');
  assert.match(message, /Naam \/ bedrijf: Test & Co/);
  assert.match(message, /Keuken & bar\?\nTwee opties\./);
  assert.match(message, /Bekeken op de website: Interieurontwerp/);
  assert.deepEqual(Object.keys(c.events[0].detail), ['channel']);
});
test('mail opens a draft; untrusted entry context is not included', () => {
  const c = composer('private-input?email=unknown@example.com');
  assert.equal(c.nodes['entry-context'].hidden, true);
  c.submit('email');
  assert.ok(c.window.location.href.startsWith('mailto:michael@studiovangeene.nl?'));
  assert.ok(!decodeURIComponent(c.window.location.href).includes('unknown@example.com'));
  assert.equal(c.events[0].detail.channel, 'email');
});
test('invalid required fields open no draft and produce no contact event', () => {
  const c = composer('__proto__', false);
  c.submit('whatsapp');
  assert.equal(c.window.location.href, '');
  assert.equal(c.events.length, 0);
});
