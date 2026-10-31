import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../analytics-loader.js', import.meta.url), 'utf8');
function run({ search = '', storage = new Map(), blocked = false, dnt = '0' } = {}) {
  const scripts = [], notices = [];
  const document = {
    createElement(tag) { return { tag, dataset: {}, style: {}, setAttribute() {}, addEventListener() {}, append(...children) { this.children = children; } }; },
    head: { append(node) { scripts.push(node); } }, body: { append(node) { notices.push(node); } }
  };
  const context = {
    window: {}, document, URLSearchParams, location: { search }, navigator: { doNotTrack: dnt },
    localStorage: {
      getItem(key) { if (blocked) throw new Error('blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw new Error('blocked'); storage.set(key, value); },
      removeItem(key) { if (blocked) throw new Error('blocked'); storage.delete(key); }
    }
  };
  vm.runInNewContext(source, context);
  return { scripts, notices, context };
}
test('opt-out blocks both collectors immediately and survives subsequent navigation', () => {
  const storage = new Map();
  const first = run({ search: '?analytics=off', storage });
  assert.equal(first.scripts.length, 0);
  assert.equal(storage.get('studio-analytics-opt-out'), '1');
  assert.match(first.notices[0].children[0].textContent, /vanaf nu niet mee/);
  assert.equal(run({ storage }).scripts.length, 0);
});
test('opting back in clears only the analytics preference and restores both collectors', () => {
  const storage = new Map([['studio-analytics-opt-out', '1'], ['other-setting', 'keep']]);
  const result = run({ search: '?analytics=on', storage });
  assert.equal(storage.has('studio-analytics-opt-out'), false);
  assert.equal(storage.get('other-setting'), 'keep');
  assert.equal(result.scripts.length, 2);
  assert.match(result.scripts[0].src, /cloudflareinsights/);
  assert.match(result.scripts[1].src, /site-analytics/);
});
test('blocked storage still excludes the activation page and explains its limit', () => {
  const result = run({ search: '?analytics=off', blocked: true });
  assert.equal(result.scripts.length, 0);
  assert.match(result.notices[0].children[0].textContent, /blokken|blokkeert/);
});
test('normal browsing loads each collector once and respects Do Not Track', () => {
  const result = run();
  vm.runInNewContext(source, result.context);
  assert.equal(result.scripts.length, 2);
  assert.equal(run({ dnt: '1' }).scripts.length, 0);
  assert.equal(run({ search: '?analytics=on', dnt: '1' }).scripts.length, 0);
});
