(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MiniMeForecaster = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const PRESSURE_WORDS = ['due', 'exam', 'interview', 'deadline', 'presentation', 'project', 'test', 'shift', 'meeting', 'appointment'];
  const RECOVERY_WORDS = ['rest', 'sleep', 'break', 'family', 'friend', 'gym', 'walk', 'therapy', 'meditate', 'movie', 'game'];
  const MOMENTUM_WORDS = ['finish', 'win', 'completed', 'progress', 'practice', 'learn', 'build', 'create', 'study'];
  const FRICTION_WORDS = ['argue', 'argument', 'sick', 'tired', 'late', 'behind', 'anxious', 'overwhelmed', 'missed', 'failed'];

  function clamp(value, min, max) {
    const number = Number(value);
    if (Number.isNaN(number)) return min;
    return Math.min(max, Math.max(min, number));
  }

  function round(value, decimals = 2) {
    return Number(value.toFixed(decimals));
  }

  function parseKeywords(text) {
    return String(text || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
  }

  function normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return normalizeDate(next);
  }

  function formatDate(date) {
    return `${DAY_NAMES[date.getDay()]}, ${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`;
  }

  function tokenizeEntries(entries) {
    return (entries || []).flatMap((entry) => parseKeywords(`${entry.notes || ''} ${entry.commitments || ''} ${entry.goals || ''}`));
  }

  function parseHistory(rawHistory) {
    if (!Array.isArray(rawHistory)) return [];
    return rawHistory
      .filter(Boolean)
      .map((entry) => ({
        date: entry.date || '',
        mood: clamp(entry.mood, 1, 10),
        energy: clamp(entry.energy, 1, 10),
        focus: clamp(entry.focus, 1, 10),
        sleep: clamp(entry.sleep, 3, 10),
        stress: clamp(entry.stress, 1, 10),
        social: clamp(entry.social, 1, 10),
        commitments: String(entry.commitments || ''),
        goals: String(entry.goals || ''),
        notes: String(entry.notes || ''),
      }))
      .slice(-30);
  }

  function average(values, fallback) {
    const valid = values.filter((value) => Number.isFinite(value));
    if (!valid.length) return fallback;
    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
  }

  function createHorizon(startDate, days = 7) {
    const start = normalizeDate(startDate || new Date());
    return Array.from({ length: days }, (_, index) => {
      const date = addDays(start, index);
      return {
        index,
        date,
        day: DAY_NAMES[date.getDay()],
        label: formatDate(date),
        relative: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `In ${index} days`,
      };
    });
  }

  function detectDayOffsets(text, horizon) {
    const source = String(text || '').toLowerCase();
    const offsets = new Set();
    if (/\btoday\b/.test(source)) offsets.add(0);
    if (/\btomorrow\b/.test(source)) offsets.add(1);
    for (const day of horizon) {
      if (source.includes(day.day.toLowerCase())) offsets.add(day.index);
    }
    if (!offsets.size && source.trim()) offsets.add(2);
    return [...offsets].filter((offset) => offset >= 0 && offset < horizon.length);
  }

  function detectEvents(text, horizon) {
    const sentences = String(text || '')
      .split(/[\n.;,]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    return sentences.flatMap((sentence) => {
      const words = parseKeywords(sentence);
      const pressure = words.filter((word) => PRESSURE_WORDS.includes(word)).length;
      const recovery = words.filter((word) => RECOVERY_WORDS.includes(word)).length;
      const momentum = words.filter((word) => MOMENTUM_WORDS.includes(word)).length;
      const friction = words.filter((word) => FRICTION_WORDS.includes(word)).length;
      return detectDayOffsets(sentence, horizon).map((offset) => ({ sentence, offset, pressure, recovery, momentum, friction }));
    });
  }

  function buildPersona(input) {
    const horizon = createHorizon(input.startDate || new Date());
    const history = parseHistory(input.history);
    const historySignals = {
      mood: average(history.map((entry) => entry.mood), undefined),
      energy: average(history.map((entry) => entry.energy), undefined),
      focus: average(history.map((entry) => entry.focus), undefined),
      sleep: average(history.map((entry) => entry.sleep), undefined),
      stress: average(history.map((entry) => entry.stress), undefined),
      social: average(history.map((entry) => entry.social), undefined),
    };
    const signals = {
      mood: clamp(input.mood || historySignals.mood || 6, 1, 10),
      energy: clamp(input.energy || historySignals.energy || 6, 1, 10),
      focus: clamp(input.focus || historySignals.focus || 6, 1, 10),
      sleep: clamp(input.sleep || historySignals.sleep || 7, 3, 10),
      stress: clamp(input.stress || historySignals.stress || 4, 1, 10),
      social: clamp(input.social || historySignals.social || 6, 1, 10),
    };
    const narrative = `${input.commitments || ''} ${input.goals || ''} ${input.notes || ''}`;
    const words = parseKeywords(narrative).concat(tokenizeEntries(history));
    const events = detectEvents(`${input.commitments || ''}\n${input.goals || ''}\n${input.notes || ''}`, horizon);
    const pressure = words.filter((word) => PRESSURE_WORDS.includes(word)).length;
    const recovery = words.filter((word) => RECOVERY_WORDS.includes(word)).length;
    const momentum = words.filter((word) => MOMENTUM_WORDS.includes(word)).length;
    const friction = words.filter((word) => FRICTION_WORDS.includes(word)).length;
    const historyDepth = history.length;
    const historyStability = historyDepth < 2 ? 0 : 10 - average(history.map((entry) => Math.abs(entry.stress - signals.stress) + Math.abs(entry.sleep - signals.sleep)), 5);
    const resilience = (signals.mood + signals.energy + signals.focus + signals.sleep + signals.social) / 5 - signals.stress * 0.4 + recovery * 0.18 + momentum * 0.12 + clamp(historyStability, 0, 10) * 0.05;
    const load = signals.stress + pressure * 0.9 + friction * 0.45 + Math.max(0, 7 - signals.sleep) * 0.75;
    return {
      signals,
      history,
      historyDepth,
      historyStability: round(clamp(historyStability || 0, 0, 10)),
      events,
      pressure,
      recovery,
      momentum,
      friction,
      resilience: round(clamp(resilience, 1, 10)),
      load: round(clamp(load, 1, 10)),
      archetype: resilience >= 6.8 ? 'Momentum Builder' : load >= 7 ? 'Careful Recharger' : historyDepth >= 3 ? 'Pattern Learner' : 'Steady Improver',
    };
  }

  function runAgents(persona, horizon) {
    const plans = horizon.map((day) => ({ day, adjustments: [], reasons: [] }));
    const agents = [
      {
        name: 'Pattern Agent',
        run(plan) {
          const weekendBoost = plan.day.date.getDay() === 0 || plan.day.date.getDay() === 6 ? 0.75 : 0;
          plan.adjustments.push(weekendBoost);
          if (persona.historyDepth) plan.reasons.push(`learned from ${persona.historyDepth} saved check-in(s)`);
          if (weekendBoost) plan.reasons.push('weekend recovery boost');
        },
      },
      {
        name: 'Calendar Agent',
        run(plan) {
          const todaysEvents = persona.events.filter((event) => event.offset === plan.day.index);
          const pressure = todaysEvents.reduce((sum, event) => sum + event.pressure + event.friction * 0.7, 0);
          const recovery = todaysEvents.reduce((sum, event) => sum + event.recovery * 0.6 + event.momentum * 0.3, 0);
          plan.adjustments.push(recovery - pressure * 0.45);
          if (pressure) plan.reasons.push('commitment pressure detected');
          if (recovery) plan.reasons.push('recovery or momentum activity detected');
        },
      },
      {
        name: 'Wellbeing Agent',
        run(plan) {
          if (persona.signals.sleep < 6) {
            plan.adjustments.push(-0.8);
            plan.reasons.push('sleep debt risk');
          }
          if (persona.signals.stress > 7) {
            plan.adjustments.push(-0.65);
            plan.reasons.push('high stress baseline');
          }
          if (persona.signals.energy > 7 && persona.signals.focus > 7) {
            plan.adjustments.push(0.55);
            plan.reasons.push('strong energy and focus');
          }
        },
      },
      {
        name: 'Goal Agent',
        run(plan) {
          const goalBoost = persona.momentum > persona.friction ? 0.25 : -0.15;
          plan.adjustments.push(goalBoost);
          plan.reasons.push(goalBoost > 0 ? 'goal momentum words found' : 'needs a clearer first step');
        },
      },
    ];
    for (const plan of plans) {
      for (const agent of agents) agent.run(plan);
      plan.agentConsensus = agents.map((agent) => agent.name);
    }
    return plans;
  }

  function makeDay(persona, plan) {
    const midweekDip = plan.day.date.getDay() === 3 || plan.day.date.getDay() === 4 ? -0.25 : 0;
    const base = persona.resilience - persona.load * 0.16 + midweekDip;
    const score = clamp(round(base + plan.adjustments.reduce((sum, value) => sum + value, 0)), 1, 10);
    const high = score >= 7;
    const low = score < 4.5;
    const theme = high ? 'high-output day' : low ? 'recovery and simplification day' : 'balanced progress day';
    const action = high
      ? 'Use your strongest block for the goal that matters most.'
      : low
        ? 'Shrink the plan to essentials, lower optional commitments, and protect sleep.'
        : 'Make steady progress with one focused task, one social touchpoint, and one reset break.';
    const risk = persona.load > 7
      ? 'Overcommitting because your load is already elevated.'
      : persona.signals.sleep < 6
        ? 'Low sleep may reduce patience and focus.'
        : 'Drifting without a clear first task.';
    const dataQuality = clamp(45 + persona.historyDepth * 5 + persona.events.length * 3 + (persona.pressure + persona.recovery + persona.momentum) * 1.3, 45, 92);
    return {
      day: plan.day.day,
      label: plan.day.label,
      relative: plan.day.relative,
      score,
      confidence: Math.round(dataQuality - Math.abs(score - 5) * 1.5),
      theme,
      action,
      risk,
      why: plan.reasons.length ? [...new Set(plan.reasons)].join(', ') : 'baseline signals are stable but sparse',
      agents: plan.agentConsensus,
      note: `Mini-you says: treat ${plan.day.relative.toLowerCase()} as a ${theme}; ${action}`,
    };
  }

  function buildInsights(days, persona) {
    const best = [...days].sort((a, b) => b.score - a.score)[0];
    const rest = [...days].sort((a, b) => a.score - b.score)[0];
    return [
      `Best deep-work window: ${best.label} (${best.score}/10).`,
      `Best recovery window: ${rest.label}; keep this day simpler if possible.`,
      persona.load >= 7 ? 'Primary risk: your load is high, so reduce optional promises.' : 'Primary risk: vague goals, so define the first action before noon.',
      persona.historyDepth ? `Memory used: ${persona.historyDepth} local check-in(s).` : 'Memory used: none yet; save check-ins to personalize future predictions.',
    ];
  }

  function predictWeek(input = {}) {
    const horizon = createHorizon(input.startDate || new Date());
    const persona = buildPersona({ ...input, startDate: horizon[0].date });
    const agentPlans = runAgents(persona, horizon);
    const days = agentPlans.map((plan) => makeDay(persona, plan));
    const averageScore = round(days.reduce((sum, day) => sum + day.score, 0) / days.length);
    return {
      persona,
      averageScore,
      summary: `You look like a ${persona.archetype}: resilience ${persona.resilience}/10, load ${persona.load}/10, ${persona.historyDepth} memory item(s), and ${persona.events.length} mapped event(s).`,
      outlook: averageScore >= 6.5 ? 'Positive momentum' : averageScore < 4.8 ? 'Conserve energy' : 'Manageable with structure',
      insights: buildInsights(days, persona),
      days,
    };
  }

  return { buildPersona, createHorizon, detectEvents, predictWeek, runAgents };
});
