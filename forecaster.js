(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MiniMeForecaster = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value)));
  }

  function parseKeywords(text) {
    return String(text || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
  }

  function buildPersona(input) {
    const signals = {
      mood: clamp(input.mood, 1, 10),
      energy: clamp(input.energy, 1, 10),
      focus: clamp(input.focus, 1, 10),
      sleep: clamp(input.sleep, 3, 10),
      stress: clamp(input.stress, 1, 10),
      social: clamp(input.social, 1, 10),
    };
    const commitments = parseKeywords(input.commitments);
    const goals = parseKeywords(input.goals);
    const pressureWords = ['due', 'exam', 'interview', 'deadline', 'presentation', 'project', 'test'];
    const recoveryWords = ['rest', 'sleep', 'break', 'family', 'friend', 'gym', 'walk'];
    const pressure = commitments.filter((word) => pressureWords.includes(word)).length;
    const recovery = commitments.concat(goals).filter((word) => recoveryWords.includes(word)).length;
    const resilience = (signals.mood + signals.energy + signals.focus + signals.sleep + signals.social) / 5 - signals.stress * 0.45 + recovery * 0.25;
    const load = signals.stress + pressure * 1.25 + Math.max(0, 7 - signals.sleep) * 0.7;
    return {
      signals,
      commitments,
      goals,
      pressure,
      recovery,
      resilience: Number(resilience.toFixed(2)),
      load: Number(load.toFixed(2)),
      archetype: resilience >= 6.5 ? 'Momentum Builder' : load >= 7 ? 'Careful Recharger' : 'Steady Improver',
    };
  }

  function scoreDay(persona, index) {
    const weekendBoost = index >= 5 ? 0.8 : 0;
    const midweekDip = index === 2 || index === 3 ? -0.35 : 0;
    const pressureSpike = persona.pressure > 0 && index >= 2 && index <= 4 ? persona.pressure * -0.28 : 0;
    const base = persona.resilience - persona.load * 0.18 + weekendBoost + midweekDip + pressureSpike;
    return clamp(Number(base.toFixed(2)), 1, 10);
  }

  function makeDay(persona, index) {
    const score = scoreDay(persona, index);
    const day = DAYS[index];
    const high = score >= 7;
    const low = score < 4.5;
    const theme = high ? 'high-output day' : low ? 'recovery and simplification day' : 'balanced progress day';
    const action = high
      ? 'Use your strongest block for the goal that matters most.'
      : low
        ? 'Shrink the plan to essentials and protect sleep.'
        : 'Make steady progress with one focused task and one reset break.';
    const risk = persona.load > 7
      ? 'Overcommitting because your load is already elevated.'
      : persona.signals.sleep < 6
        ? 'Low sleep may reduce patience and focus.'
        : 'Drifting without a clear first task.';
    return {
      day,
      score,
      confidence: clamp(Math.round(52 + Math.abs(score - 5) * 7 + persona.commitments.length * 1.5), 45, 86),
      theme,
      action,
      risk,
      note: `Mini-you says: treat ${day} like a ${theme}; your best move is to ${action.toLowerCase()}`,
    };
  }

  function predictWeek(input) {
    const persona = buildPersona(input);
    const days = DAYS.map((_, index) => makeDay(persona, index));
    const average = days.reduce((sum, day) => sum + day.score, 0) / days.length;
    return {
      persona,
      summary: `You look like a ${persona.archetype}: resilience ${persona.resilience}/10, load ${persona.load}/10, with ${persona.pressure} pressure signal(s) and ${persona.recovery} recovery signal(s).`,
      outlook: average >= 6.5 ? 'Positive momentum' : average < 4.8 ? 'Conserve energy' : 'Manageable with structure',
      days,
    };
  }

  return { buildPersona, predictWeek };
});
