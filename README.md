# Roadmap Loom

Weave initiatives into a visible roadmap without losing the story between them.

![Roadmap Loom preview](docs/preview.svg)

Roadmap Loom is a local-first workspace for founders, operators, and solo builders who want a cleaner way to manage initiatives. It keeps confidence, owner, dependency, and review timing visible so the right things move forward with less drift.

## What it does

- ranks initiatives by leverage, confidence, timing, and friction
- tracks **owner**, **dependency**, **target date**, and **confidence** for each initiative
- highlights the best current bet, the next review slot, and the strongest signal on the board
- renders a dedicated queue plus a category mix snapshot beneath the main board
- saves locally in the browser with JSON import/export backups
- quick action: **Commit initiative**
- quick action: **Raise confidence**
- quick action: **Mark shipped**

## How ranking works

Each initiative receives a numeric priority score that drives the board sort order:

```
priority = impact×6 + confidence×5 + dueBoost + stateWeight − effort×4
```

| Component     | Detail                                                            |
|---------------|-------------------------------------------------------------------|
| `impact`      | 1–10, weighted ×6                                                 |
| `confidence`  | 1–10, weighted ×5                                                 |
| `dueBoost`    | `max(0, 4 − daysUntilDue) × 4`, zero for shipped initiatives     |
| `stateWeight` | Draft 2 · Sequenced 7 · Committed 10 · Shipped 3                 |
| `effort`      | 1–10 complexity, weighted ×4 as a penalty                         |

A committed initiative with impact 9, confidence 8, and effort 3 scores **92** (54 + 40 + 10 − 12). To see how the seed initiatives rank locally, run the included preview:

```bash
node scripts/score-preview.mjs
```

## Why it feels different

Roadmap Loom is not just a generic list. It is shaped around the real workflow behind initiatives, so the board helps you decide what matters next instead of simply storing records.

## Quick start

```bash
git clone https://github.com/get2salam/roadmap-loom.git
cd roadmap-loom
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Local verification

Roadmap Loom has a dependency-free static verification check for CI and local review:

```bash
npm run verify
```

It syntax-checks the JavaScript entrypoint and confirms the HTML, CSS, roadmap actions, import guard, DOM bindings, package scripts, and GitHub Actions workflow stay wired together. CI runs the same command with read-only repository permissions and a short timeout, so local failures should match pull-request failures.

## Keyboard shortcuts

- `N` creates a new initiative
- `/` focuses the search box

## Privacy

Everything stays in your browser unless you export a JSON backup.

## License

MIT
