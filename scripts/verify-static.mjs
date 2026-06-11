import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

const [html, js, css] = await Promise.all([
  read('index.html'),
  read('js/main.js'),
  read('styles/app.css'),
]);

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const collect = (source, pattern) => [...source.matchAll(pattern)].map((match) => match[1]);
const unique = (values) => [...new Set(values)].sort();

const scriptSources = collect(html, /<script[^>]+src="\.\/([^"]+)"/g);
const stylesheetSources = collect(html, /<link[^>]+href="\.\/([^"]+)"/g);
assert(scriptSources.includes('js/main.js'), 'index.html must load ./js/main.js as a module');
assert(stylesheetSources.includes('styles/app.css'), 'index.html must load ./styles/app.css');
assert(html.includes('type="module"'), 'main script should remain an ES module');

const htmlRoles = unique(collect(html, /data-role="([^"]+)"/g));
const jsRoles = unique(collect(js, /data-role=\"([^\"]+)\"/g));
for (const role of jsRoles) {
  assert(htmlRoles.includes(role), `missing [data-role="${role}"] binding in index.html`);
}

const htmlFields = unique(collect(html, /data-field="([^"]+)"/g));
const jsFields = unique(collect(js, /data-field=\"([^\"]+)\"/g));
for (const field of jsFields) {
  assert(htmlFields.includes(field), `missing [data-field="${field}"] control in index.html`);
}

const shellActions = unique(collect(html, /data-action="([^"]+)"/g));
for (const action of ['import', 'export', 'new', 'reset']) {
  assert(shellActions.includes(action), `missing shell action: ${action}`);
  assert(js.includes(`explicit === '${action}'`), `unhandled shell action in js/main.js: ${action}`);
}
assert(js.includes("explicit === 'remove-current'"), 'editor remove-current action must stay handled');

const specActions = collect(js, /"id": "([^"]+)"/g);
for (const action of ['commit', 'raise-confidence', 'ship']) {
  assert(specActions.includes(action), `missing roadmap quick action: ${action}`);
}

for (const cssClass of ['.toast-host', '.toast', '.item', '.editor-panel', '.secondary-panel']) {
  assert(css.includes(cssClass), `missing expected CSS selector: ${cssClass}`);
}

assert(js.includes('const MAX_IMPORT_BYTES = 5 * 1024 * 1024;'), 'JSON import size cap must remain in place');
assert(js.includes('sourceItems.forEach((entry, index) =>'), 'JSON import item validation must remain in place');
assert(js.includes('seenIds.has(normalized.id)'), 'JSON import duplicate-id guard must remain in place');
assert(js.includes('function priority'), 'roadmap priority scoring must remain in place');

if (failures.length) {
  console.error('Static verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Static verification passed: ${htmlRoles.length} roles, ${htmlFields.length} fields, ${specActions.length} quick actions.`);
