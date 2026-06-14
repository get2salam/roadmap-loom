import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

const [packageJson, workflow, readme] = await Promise.all([
  read('package.json'),
  read('.github/workflows/verify.yml'),
  read('README.md'),
]);

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const pkg = JSON.parse(packageJson);
const scripts = pkg.scripts || {};

assert(scripts.verify?.includes('node --check js/main.js'), 'npm run verify must syntax-check js/main.js');
assert(scripts.verify?.includes('scripts/verify-static.mjs'), 'npm run verify must include the static app verifier');
assert(scripts.verify?.includes('scripts/verify-ci-contract.mjs'), 'npm run verify must include the CI contract verifier');
assert(scripts['verify:static'] === 'node scripts/verify-static.mjs', 'verify:static should run the static verifier directly');
assert(scripts['verify:ci'] === 'node scripts/verify-ci-contract.mjs', 'verify:ci should run the CI contract verifier directly');

assert(workflow.includes('name: Verify static app'), 'workflow should keep its descriptive name');
assert(workflow.includes('branches: [main]'), 'workflow must run on pushes to main');
assert(/^  pull_request:\s*$/m.test(workflow), 'workflow must run on pull requests');
assert(workflow.includes('permissions:\n  contents: read'), 'workflow should use read-only repository permissions');
assert(workflow.includes('timeout-minutes: 5'), 'verify job should have a timeout to catch hung checks');
assert(workflow.includes('uses: actions/checkout@v4'), 'workflow must checkout the repository');
assert(workflow.includes('uses: actions/setup-node@v4'), 'workflow must setup Node.js');
assert(workflow.includes('node-version: 22'), 'workflow should verify against Node.js 22');
assert(workflow.includes('run: npm run verify'), 'workflow must run the same verification command documented for contributors');
assert(!/npm (ci|install)/.test(workflow), 'workflow should remain dependency-free unless package dependencies are added');

assert(readme.includes('npm run verify'), 'README must document the local verification command');
assert(readme.includes('python -m http.server 8000'), 'README quick start should keep the dependency-free local server command');
assert(readme.includes('CI runs the same command'), 'README should explain CI parity for local verification');

if (failures.length) {
  console.error('CI contract verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('CI contract verification passed: workflow, package scripts, and README are aligned.');
