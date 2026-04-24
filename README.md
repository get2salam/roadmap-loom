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

## Why it feels different

Roadmap Loom is not just a generic list. It is shaped around the real workflow behind initiatives, so the board helps you decide what matters next instead of simply storing records.

## Quick start

```bash
git clone https://github.com/get2salam/roadmap-loom.git
cd roadmap-loom
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Keyboard shortcuts

- `N` creates a new initiative
- `/` focuses the search box

## Privacy

Everything stays in your browser unless you export a JSON backup.

## License

MIT
