const assert = require('node:assert/strict');
const { predictWeek, buildPersona, createHorizon, detectEvents } = require('../forecaster');

const startDate = new Date('2026-08-13T12:00:00Z');
const horizon = createHorizon(startDate);
assert.equal(horizon[0].label, 'Thursday, Aug 13');
assert.equal(horizon[1].relative, 'Tomorrow');

const events = detectEvents('project due Friday, gym Sunday, interview Monday', horizon);
assert.ok(events.some((event) => event.offset === 1 && event.pressure > 0));
assert.ok(events.some((event) => event.offset === 3 && event.recovery > 0));

const prediction = predictWeek({
  startDate,
  mood: 7,
  energy: 6,
  focus: 8,
  sleep: 7,
  stress: 4,
  social: 6,
  commitments: 'project due Friday and gym Sunday',
  goals: 'finish coding practice and sleep earlier',
  notes: 'finished two assignments but felt tired',
  history: [
    { mood: 6, energy: 5, focus: 6, sleep: 6.5, stress: 5, social: 6, notes: 'steady progress' },
    { mood: 7, energy: 6, focus: 7, sleep: 7, stress: 4, social: 7, notes: 'gym and rest' },
  ],
});

assert.equal(prediction.days.length, 7);
assert.match(prediction.summary, /memory item/);
assert.equal(prediction.insights.length, 4);
assert.ok(prediction.days.every((day) => day.score >= 1 && day.score <= 10));
assert.ok(prediction.days.every((day) => day.confidence >= 40 && day.confidence <= 92));
assert.ok(prediction.days.every((day) => day.agents.includes('Pattern Agent')));
assert.ok(prediction.days.some((day) => day.why.includes('commitment pressure detected')));

const oversizedHistory = Array.from({ length: 35 }, (_, index) => ({ mood: 5, energy: 5, focus: 5, sleep: 7, stress: 4, social: 5, notes: `entry ${index}` }));
assert.equal(buildPersona({ history: oversizedHistory }).historyDepth, 30);

const strained = buildPersona({ mood: 3, energy: 3, focus: 4, sleep: 4, stress: 9, social: 2, commitments: 'exam due interview deadline' });
assert.equal(strained.archetype, 'Careful Recharger');

console.log('Mini Me Forecaster tests passed');
