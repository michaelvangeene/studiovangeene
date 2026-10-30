import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import worker from './worker.mjs';

function post(body, origin = 'https://studiovangeene.nl') {
  return new Request('https://collector.example/collect', { method: 'POST', headers: { Origin: origin }, body: JSON.stringify(body) });
}
test('collector writes only the permitted fields and restricts origins', async () => {
  const writes = [];
  const env = { DB: { prepare: () => ({ bind: (...values) => ({ run: async () => { writes.push(values); return { success: true }; } }) }) } };
  const response = await worker.fetch(post({ event: 'contact_click', segment: 'all', channel: 'whatsapp', project: 'rozengracht', email: 'ignored@example.com' }), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://studiovangeene.nl');
  assert.match(writes[0][0], /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(writes[0].slice(1), ['contact_click', 'rozengracht', 'all', 'whatsapp']);
  assert.equal((await worker.fetch(post({ event: 'page_view', segment: 'all' }, 'https://other.example'), env)).status, 403);
  assert.equal(writes.length, 1);
});
test('collector rejects malformed/oversized events without writes', async () => {
  const env = { DB: { prepare: () => assert.fail('invalid event written') } };
  for (const body of [null, { event: 'project_view', segment: 'all' }, { event: 'contact_click', segment: 'all', channel: 'email@example.com' }, { event: 'project_view', segment: 'all', project: '../private?email=x' }, { event: 'page_view', segment: 'invalid' }, { event: 'page_view', segment: 'all', extra: 'a'.repeat(1100) }]) {
    assert.equal((await worker.fetch(post(body), env)).status, 400);
  }
  const req = new Request('https://collector.example/collect', { method: 'POST', headers: { Origin: 'https://studiovangeene.nl' }, body: '{' });
  assert.equal((await worker.fetch(req, env)).status, 400);
});

function browser({ disabled = false, pathname = '/' } = {}) {
  const requests = [];
  const handlers = {};
  const timers = new Map();
  let timerId = 0;
  let mutation;
  let project = 'rozengracht';
  const slide = { dataset: { get project() { return project; } }, getBoundingClientRect: () => ({ left: 0, right: 600, top: 0, bottom: 500, width: 600, height: 500 }) };
  const track = { querySelector: () => slide };
  const document = {
    currentScript: { dataset: { endpoint: 'https://collector.example/collect' } }, visibilityState: 'visible',
    querySelector: () => track, addEventListener: (event, callback) => { handlers[event] = callback; }
  };
  const context = {
    document, navigator: { doNotTrack: disabled ? '1' : '0' },
    location: { pathname, search: '', href: 'https://studiovangeene.nl/?secret=not-sent' },
    window: { addEventListener() {} }, URLSearchParams, URL, innerWidth: 1000, innerHeight: 800,
    MutationObserver: class { constructor(callback) { mutation = callback; } observe() {} },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    fetch(endpoint, options) { requests.push({ endpoint, options, data: JSON.parse(options.body) }); return Promise.resolve(); }
  };
  vm.runInNewContext(readFileSync(new URL('../site-analytics.js', import.meta.url), 'utf8'), context);
  return { requests, document, handlers, mutate: () => mutation?.(), setProject: value => { project = value; }, tick: () => { const queued = [...timers.values()]; timers.clear(); queued.forEach(callback => callback()); } };
}
test('visible project dwell counts once across clones; hidden tabs do not count', () => {
  const b = browser();
  assert.equal(b.requests.length, 1);
  b.tick();
  b.mutate(); b.tick();
  assert.equal(b.requests.filter(r => r.data.event === 'project_view').length, 1);
  b.setProject('tilburg'); b.mutate();
  b.document.visibilityState = 'hidden'; b.handlers.visibilitychange(); b.tick();
  assert.equal(b.requests.length, 2);
  b.document.visibilityState = 'visible'; b.handlers.visibilitychange(); b.tick();
  assert.equal(b.requests.length, 3);
  b.setProject('rozengracht'); b.mutate(); b.tick();
  assert.equal(b.requests.length, 3);
});
test('contact clicks preserve navigation and omit link addresses/message text', () => {
  const b = browser();
  b.handlers.click({ target: { closest: () => ({ getAttribute: () => 'https://wa.me/31600000000?text=private', dataset: {} }) } });
  const last = b.requests.at(-1);
  assert.equal(last.data.event, 'contact_click');
  assert.equal(last.data.channel, 'whatsapp');
  assert.equal(last.options.keepalive, true);
  assert.equal(last.options.credentials, 'omit');
  assert.equal(last.options.referrerPolicy, 'no-referrer');
  assert.ok(!JSON.stringify(last).includes('private'));
  assert.equal(browser({ disabled: true }).requests.length, 0);
});

test('service page labels and form contact events omit visitor input', () => {
  const b = browser({ pathname: '/project-bespreken/' });
  assert.equal(b.requests[0].data.project, 'page-project-bespreken');
  b.handlers['studio:contact']({ detail: { channel: 'email', name: 'private-name', description: 'private-plan' } });
  assert.equal(b.requests.at(-1).data.event, 'contact_click');
  assert.equal(b.requests.at(-1).data.channel, 'email');
  assert.equal(b.requests.at(-1).data.project, 'page-project-bespreken');
  assert.ok(!JSON.stringify(b.requests).includes('private-'));
  const before = b.requests.length;
  b.handlers['studio:contact']({ detail: { channel: 'invalid' } });
  assert.equal(b.requests.length, before);
});
