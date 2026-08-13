# Mini Me Life Forecaster

A privacy-first, browser-based "mini you" that turns check-ins, commitments, goals, and personal notes into a seven-day life forecast. It runs entirely in the browser: no accounts, no server, and no data leaves the page.

## What it does

- Collects lightweight profile signals such as mood, energy, focus, sleep, stress, social battery, commitments, habits, goals, and recent journal notes.
- Saves optional local check-ins in `localStorage` so the mini-you can build memory over time.
- Uses four specialized local agents: Pattern Agent, Calendar Agent, Wellbeing Agent, and Goal Agent.
- Maps day words like "today," "tomorrow," "Friday," and "Sunday" onto a real seven-day forecast horizon.
- Predicts likely themes for the next seven days with confidence, risk factors, explanations, and recommendations.
- Generates weekly insights for deep work, recovery, risk management, and data quality.

## Run locally

Open `index.html` in any modern browser.

## Test

```bash
npm test
```

You can also run the test file directly:

```bash
node tests/forecaster.test.js
```

## Privacy and safety

The memory feature stores up to 30 check-ins in the current browser's `localStorage`. Use **Clear memory** to delete saved check-ins. This is a reflective planning tool, not medical, legal, financial, or mental-health advice. Predictions are heuristic and should be treated as prompts for planning rather than facts.


## Merge troubleshooting

If a merge or PR check is unsuccessful, verify the branch is clean and run the same local checks used for this app:

```bash
git status --short --branch
npm test
git diff --check
```

This repository intentionally has no build step or external runtime dependencies, so a failed merge is usually caused by branch state, authentication/remote configuration, or conflicting edits rather than package installation.
