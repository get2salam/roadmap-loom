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

test('stored initiatives with corrupt numeric fields render with bounded scores', async () => {
  const { refs } = installBrowserHarness({
    boardTitle: 'Recovered board',
    boardSubtitle: 'Should still render after a bad local backup.',
    items: [
      {
        id: 'bad-number-import',
        title: 'Recover stale local initiative',
        note: 'A hand-edited localStorage backup used nonnumeric range values.',
        category: 'Now',
        state: 'Committed',
        score: 'high',
        effort: 'hard',
        metric: 'overconfident',
        textOne: 'Ops',
        textTwo: 'Noisy browser backup',
        date: '2026-06-30',
      },
    ],
    ui: { search: '', category: 'all', status: 'all', selectedId: 'bad-number-import' },
  });

  await import(`../js/main.js?case=${Date.now()}`);

  const list = refs.get('[data-role="list"]');
  const editor = refs.get('[data-role="editor"]');
  assert.ok(list.innerHTML.includes('Recover stale local initiative'));
  assert.ok(!list.innerHTML.includes('NaN'), 'list should not expose NaN priority values');
  assert.ok(!editor.innerHTML.includes('NaN'), 'editor should not expose NaN range values');
  assert.match(editor.innerHTML, /Confidence<\/span>\s*<input[^>]+value="1"/);
  assert.match(editor.innerHTML, /Impact<\/span>\s*<input[^>]+value="1"/);
  assert.match(editor.innerHTML, /Complexity<\/span>\s*<input[^>]+value="1"/);
});
