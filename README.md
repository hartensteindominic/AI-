# Mini Me Life Forecaster

A privacy-first, browser-based "mini you" that turns a short personal data journal into a seven-day life forecast. It runs entirely in the browser: no accounts, no server, and no data leaves the page.

## What it does

- Collects lightweight profile signals such as mood, energy, focus, sleep, stress, commitments, habits, and goals.
- Builds a simple local persona model from those signals.
- Predicts likely themes for the next seven days with confidence, risk factors, and recommendations.
- Generates a daily plan with suggested actions, watch-outs, and a short "mini you says" note.

## Run locally

Open `index.html` in any modern browser.

## Test

```bash
node tests/forecaster.test.js
```

## Note

This is a reflective planning tool, not medical, legal, financial, or mental-health advice. Predictions are heuristic and should be treated as prompts for planning rather than facts.
