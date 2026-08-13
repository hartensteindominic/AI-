const assert = require('node:assert/strict');
const { predictWeek, buildPersona } = require('../forecaster');

const prediction = predictWeek({
  mood: 7,
  energy: 6,
  focus: 8,
  sleep: 7,
  stress: 4,
  social: 6,
  commitments: 'project due Thursday and gym',
  goals: 'finish coding practice and sleep earlier',
});

assert.equal(prediction.days.length, 7);
assert.match(prediction.summary, /pressure signal/);
assert.ok(prediction.days.every((day) => day.score >= 1 && day.score <= 10));
assert.ok(prediction.days.every((day) => day.confidence >= 45 && day.confidence <= 86));

const strained = buildPersona({ mood: 3, energy: 3, focus: 4, sleep: 4, stress: 9, social: 2, commitments: 'exam due interview deadline' });
assert.equal(strained.archetype, 'Careful Recharger');

console.log('Mini Me Forecaster tests passed');
