// Demonstrates how Roadmap Loom ranks initiatives without a browser.
// Run: node scripts/score-preview.mjs

const STATE_WEIGHTS = { Draft: 2, Sequenced: 7, Committed: 10, Shipped: 3 };
const COMPLETED = new Set(['Shipped']);

function daysFromToday(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${isoDate}T00:00:00`) - today) / 86400000);
}

function priority(item) {
  const days = daysFromToday(item.date);
  const dueBoost = COMPLETED.has(item.state) ? 0 : Math.max(0, 4 - Math.max(days, 0)) * 4;
  return item.score * 6 + item.metric * 5 + dueBoost + (STATE_WEIGHTS[item.state] ?? 0) - item.effort * 4;
}

const initiatives = [
  { title: 'Public product narrative', category: 'Now',  state: 'Committed', score: 9, metric: 8, effort: 3, date: '2026-04-30' },
  { title: 'Case result explorer',     category: 'Next', state: 'Sequenced', score: 8, metric: 6, effort: 5, date: '2026-05-08' },
  { title: 'Referral engine',          category: 'Bets', state: 'Draft',     score: 7, metric: 5, effort: 4, date: '2026-05-15' },
];

const ranked = [...initiatives].sort((a, b) => priority(b) - priority(a));

console.log('\nRoadmap Loom - Priority ranking preview');
console.log('Formula: impact x6 + confidence x5 + dueBoost + stateWeight - effort x4\n');
console.log(`${'#'.padEnd(3)} ${'Score'.padEnd(7)} ${'State'.padEnd(12)} ${'Horizon'.padEnd(8)} Initiative`);
console.log('-'.repeat(62));
for (const [i, item] of ranked.entries()) {
  const p = priority(item);
  const days = daysFromToday(item.date);
  const boost = COMPLETED.has(item.state) ? 0 : Math.max(0, 4 - Math.max(days, 0)) * 4;
  const note = boost > 0 ? ` (+${boost} due boost)` : '';
  console.log(`${String(i + 1).padEnd(3)} ${String(p).padEnd(7)} ${item.state.padEnd(12)} ${item.category.padEnd(8)} ${item.title}${note}`);
}
console.log('\nDue-boost adds up to 16 pts when the target date is fewer than 4 days away.');
