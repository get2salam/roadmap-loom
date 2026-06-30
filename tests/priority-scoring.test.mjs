import assert from 'node:assert/strict';
import test from 'node:test';

function makeElement() {
  return {
    dataset: {},
    files: [],
    value: '',
    textContent: '',
    innerHTML: '',
    className: '',
    classList: { add() {}, remove() {} },
    setAttribute() {},
    appendChild() {},
    remove() {},
    click() {},
    focus() {},
    closest() { return null; },
  };
}

function installBrowserHarness(storedState) {
  const refs = new Map();
  const document = {
    body: { appendChild() {} },
    createElement: () => makeElement(),
    addEventListener() {},
    querySelector(selector) {
      if (!refs.has(selector)) refs.set(selector, makeElement());
      return refs.get(selector);
    },
  };
  globalThis.document = document;
  globalThis.localStorage = {
    getItem: () => JSON.stringify(storedState),
    setItem() {},
  };
  globalThis.requestAnimationFrame = (callback) => callback();
  return { refs };
}

// Far-future date keeps dueBoost at 0 so priority scores are date-independent.
const FAR = '2099-06-01';

let seq = 0;
async function loadWithState(storedState) {
  const { refs } = installBrowserHarness(storedState);
  await import(`../js/main.js?ps=${++seq}`);
  return refs;
}

test('initiatives render in descending priority order', async () => {
  // Committed (weight 10): 9*6 + 8*5 + 10 - 3*4 = 92
  // Sequenced (weight  7): 6*6 + 6*5 + 7  - 5*4 = 53
  // Draft     (weight  2): 4*6 + 4*5 + 2  - 6*4 = 22
  const refs = await loadWithState({
    items: [
      { id: 'a', title: 'Draft pick',     category: 'Bets', state: 'Draft',     score: 4, metric: 4, effort: 6, date: FAR },
      { id: 'b', title: 'Committed push', category: 'Now',  state: 'Committed', score: 9, metric: 8, effort: 3, date: FAR },
      { id: 'c', title: 'Sequenced step', category: 'Next', state: 'Sequenced', score: 6, metric: 6, effort: 5, date: FAR },
    ],
    ui: { search: '', category: 'all', status: 'all', selectedId: 'b' },
  });

  const html = refs.get('[data-role="list"]').innerHTML;
  const posCommitted = html.indexOf('Committed push');
  const posSequenced = html.indexOf('Sequenced step');
  const posDraft     = html.indexOf('Draft pick');

  assert.ok(posCommitted < posSequenced, 'committed item must render before sequenced');
  assert.ok(posSequenced < posDraft,     'sequenced item must render before draft');
  assert.ok(!html.includes('NaN'),       'no NaN scores should appear in the rendered list');
});

test('priority formula: committed initiative score matches expected value', async () => {
  // score=9, metric=8, effort=3, state=Committed (weight 10), far-future date → dueBoost=0
  // 9*6 + 8*5 + 10 - 3*4 = 54 + 40 + 10 - 12 = 92
  const refs = await loadWithState({
    items: [
      { id: 'x', title: 'Formula check', category: 'Now', state: 'Committed', score: 9, metric: 8, effort: 3, date: FAR },
    ],
    ui: { search: '', category: 'all', status: 'all', selectedId: 'x' },
  });

  const html = refs.get('[data-role="list"]').innerHTML;
  assert.ok(html.includes('>92<'), 'committed initiative with score=9 metric=8 effort=3 must show priority 92');
});

test('search filter shows only matching initiatives', async () => {
  const refs = await loadWithState({
    items: [
      { id: 'v', title: 'Visible roadmap item', category: 'Now',  state: 'Draft', score: 5, metric: 5, effort: 5, date: FAR },
      { id: 'h', title: 'Hidden roadmap item',  category: 'Next', state: 'Draft', score: 5, metric: 5, effort: 5, date: FAR },
    ],
    ui: { search: 'Visible', category: 'all', status: 'all', selectedId: 'v' },
  });

  const html = refs.get('[data-role="list"]').innerHTML;
  assert.ok(html.includes('Visible roadmap item'),  'matching initiative must appear');
  assert.ok(!html.includes('Hidden roadmap item'),  'non-matching initiative must be filtered out');
});
