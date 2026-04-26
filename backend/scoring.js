// Scoring engine for MatchMe deep assessment

// ─── Helpers ────────────────────────────────────────────────────────────────

function scaleCompat(a, b) {
  if (a == null || b == null) return 50;
  return Math.max(0, 100 - Math.abs(Number(a) - Number(b)) * 25);
}

// Choice compatibility maps — groups of values that align well together
const CHOICE_GROUPS = {
  commitment_view: {
    groups: [['all_in', 'gradual'], ['adaptive', 'gradual'], ['conditional']],
    crossPenalty: { 'all_in-conditional': 30, 'all_in-adaptive': 75, 'gradual-conditional': 50 },
  },
  finances: {
    groups: [['saver', 'balanced', 'investor'], ['balanced', 'spender'], ['investor', 'balanced']],
    crossPenalty: { 'saver-spender': 20 },
  },
  travel: {
    groups: [['adventurer', 'occasional'], ['homebody', 'local'], ['occasional', 'local']],
    crossPenalty: { 'adventurer-homebody': 30 },
  },
  love_language: { sameBonus: true },
  communication_freq: {
    groups: [['constant', 'regular'], ['occasional', 'minimal']],
    crossPenalty: { 'constant-minimal': 20 },
  },
  conflict_resolution: {
    groups: [['direct', 'compromise'], ['cool_down', 'compromise'], ['avoid']],
    crossPenalty: { 'direct-avoid': 35, 'cool_down-avoid': 50 },
  },
  pda: {
    groups: [['love_pda', 'moderate'], ['moderate', 'private']],
    crossPenalty: { 'love_pda-private': 40 },
  },
  pets: {
    groups: [['have_and_love', 'want_one'], ['fine_others', 'no_pets']],
    crossPenalty: { 'have_and_love-no_pets': 30, 'want_one-no_pets': 40 },
  },
  decision_making: {
    groups: [['equal', 'case_by_case'], ['by_strength', 'case_by_case'], ['one_leads']],
    crossPenalty: { 'equal-one_leads': 40 },
  },
  city_vs_nature: { neutral: true },
  long_term_vs_now: {
    groups: [['planner', 'balanced'], ['present', 'balanced']],
    crossPenalty: { 'planner-present': 50 },
  },
};

function choiceCompat(questionId, a, b) {
  if (a == null || b == null) return 50;
  if (a === b) return 100;

  const cfg = CHOICE_GROUPS[questionId];
  if (!cfg) return 70; // unknown question — mild bonus for same, mild penalty otherwise

  if (cfg.neutral) return 80;
  if (cfg.sameBonus) return a === b ? 100 : 60;

  // Check cross-penalty
  if (cfg.crossPenalty) {
    const key1 = `${a}-${b}`;
    const key2 = `${b}-${a}`;
    if (cfg.crossPenalty[key1] != null) return cfg.crossPenalty[key1];
    if (cfg.crossPenalty[key2] != null) return cfg.crossPenalty[key2];
  }

  // Check if in the same group
  if (cfg.groups) {
    for (const grp of cfg.groups) {
      if (grp.includes(a) && grp.includes(b)) return 85;
    }
  }

  return 65; // different groups but no explicit penalty
}

function questionScore(q, a, b) {
  if (q.type === 'scale') {
    const val = scaleCompat(a, b);
    // For impulsive — lower is better, and DIFFERENT directions are bad
    return val;
  }
  if (q.type === 'choice') return choiceCompat(q.id, a, b);
  return null; // text questions don't score
}

// ─── Personality Dimensions ─────────────────────────────────────────────────

function personalityDimensions(r) {
  const n = (v, fallback = 3) => Number(r[v] ?? fallback);

  const commitment = avg([
    n('honesty_importance'),
    n('mutual_respect'),
    n('shared_chores'),
    n('joint_decisions'),
    choiceScore('commitment_view', r.commitment_view, { all_in: 5, gradual: 4, adaptive: 3, conditional: 2 }),
  ]) * 20;

  const emotionalDepth = avg([
    n('self_awareness'),
    n('empathy'),
    n('express_feelings'),
    n('constructive_feedback'),
    (6 - n('impulsive')), // invert: less impulsive = higher EQ
    n('handles_criticism'),
  ]) * 20;

  const adaptability = avg([
    n('handles_criticism'),
    (6 - n('impulsive')),
    n('work_life_balance'),
    choiceScore('conflict_resolution', r.conflict_resolution, { compromise: 5, cool_down: 4, direct: 3, avoid: 2 }),
    choiceScore('discussion_style', r.discussion_style, { listen_first: 5, collaborative: 5, think_then: 4, express_freely: 3 }),
  ]) * 20;

  const communication = avg([
    n('express_feelings'),
    n('constructive_feedback'),
    choiceScore('communication_freq', r.communication_freq, { regular: 5, occasional: 5, constant: 4, minimal: 3 }),
    choiceScore('discussion_style', r.discussion_style, { collaborative: 5, listen_first: 5, think_then: 4, express_freely: 4 }),
    choiceScore('conflict_resolution', r.conflict_resolution, { compromise: 5, direct: 4, cool_down: 4, avoid: 2 }),
  ]) * 20;

  const lifestyle = avg([
    n('personal_growth'),
    n('work_life_balance'),
    n('cleanliness_home'),
    n('enjoy_cooking'),
    choiceScore('long_term_vs_now', r.long_term_vs_now, { planner: 5, balanced: 4, present: 3 }),
    choiceScore('travel', r.travel, { adventurer: 5, occasional: 4, local: 3, homebody: 2 }),
  ]) * 20;

  return {
    commitment: clamp(Math.round(commitment)),
    emotionalDepth: clamp(Math.round(emotionalDepth)),
    adaptability: clamp(Math.round(adaptability)),
    communication: clamp(Math.round(communication)),
    lifestyle: clamp(Math.round(lifestyle)),
  };
}

function eqScore(r) {
  const n = (v) => Number(r[v] ?? 3);
  return clamp(Math.round(avg([
    n('self_awareness'),
    n('empathy'),
    n('express_feelings'),
    n('handles_criticism'),
    (6 - n('impulsive')),
    n('constructive_feedback'),
  ]) * 20));
}

function personalityType(dims) {
  const sorted = Object.entries(dims).sort((a, b) => b[1] - a[1]);
  const top = sorted[0][0];
  const second = sorted[1][0];
  const combo = [top, second].sort().join('-');

  const types = {
    'commitment-emotionalDepth': { name: 'The Devoted Nurturer', emoji: '💜', desc: 'You lead with loyalty and deep emotional intelligence. You invest fully in people you care about and prioritize feelings above all else.' },
    'commitment-communication': { name: 'The Steadfast Connector', emoji: '🔗', desc: 'You combine unwavering commitment with clear, open communication — rare and deeply valuable in any relationship.' },
    'commitment-adaptability': { name: 'The Resilient Anchor', emoji: '⚓', desc: 'Highly committed yet flexible — you hold relationships together through change and challenge with grace.' },
    'commitment-lifestyle': { name: 'The Purposeful Partner', emoji: '🎯', desc: 'You build your life with intention and bring that same dedication to relationships — driven, grounded, and loyal.' },
    'emotionalDepth-communication': { name: 'The Empathic Communicator', emoji: '🌊', desc: 'You feel deeply and express beautifully. Conversations with you leave people feeling truly seen and understood.' },
    'emotionalDepth-adaptability': { name: 'The Harmonious Peacemaker', emoji: '🕊️', desc: 'Emotionally aware and highly adaptable — you navigate conflict with wisdom and rarely let ego get in the way.' },
    'emotionalDepth-lifestyle': { name: 'The Mindful Achiever', emoji: '🌿', desc: 'You balance ambition with deep emotional awareness. You grow without losing sight of what truly matters.' },
    'adaptability-communication': { name: 'The Flexible Connector', emoji: '🌀', desc: "Easygoing and communicative — you adjust naturally to others' needs while keeping dialogue open and honest." },
    'adaptability-lifestyle': { name: 'The Dynamic Explorer', emoji: '🚀', desc: "Adaptable and driven, you embrace change and new experiences with curiosity. Life with you is never boring." },
    'communication-lifestyle': { name: 'The Visionary Communicator', emoji: '✨', desc: 'You think big, articulate it clearly, and live with purpose. You inspire those around you to aim higher.' },
  };

  return types[combo] || { name: 'The Balanced Soul', emoji: '⚖️', desc: 'You show strength across multiple dimensions — well-rounded, thoughtful, and genuinely hard to put in a box.' };
}

// ─── Section Scorers ─────────────────────────────────────────────────────────

const SECTION_QUESTIONS = {
  values:        ['commitment_view', 'honesty_importance', 'mutual_respect', 'cultural_traditions'],
  eq:            ['self_awareness', 'empathy', 'handles_criticism', 'impulsive'],
  behavioral:    ['forgotten_date', 'job_offer', 'handles_criticism', 'impulsive'],
  lifestyle:     ['work_life_balance', 'personal_growth', 'finances', 'travel'],
  communication: ['discuss_style', 'conflict_resolution', 'love_language', 'express_feelings', 'constructive_feedback', 'communication_freq'],
  partnership:   ['shared_chores', 'joint_decisions', 'decision_making', 'partner_role'],
  daily:         ['city_vs_nature', 'rain_walk', 'pda', 'pets', 'cleanliness_home', 'enjoy_cooking', 'daily_routine', 'personal_grooming', 'long_term_vs_now', 'clothes'],
};

const QUESTION_META = {
  commitment_view: 'choice', honesty_importance: 'scale', mutual_respect: 'scale', cultural_traditions: 'scale',
  self_awareness: 'scale', empathy: 'scale', handles_criticism: 'scale', impulsive: 'scale',
  forgotten_date: 'choice', job_offer: 'choice',
  work_life_balance: 'scale', personal_growth: 'scale', finances: 'choice', travel: 'choice',
  discussion_style: 'choice', conflict_resolution: 'choice', love_language: 'choice',
  express_feelings: 'scale', constructive_feedback: 'scale', communication_freq: 'choice',
  shared_chores: 'scale', joint_decisions: 'scale', decision_making: 'choice', partner_role: 'choice',
  city_vs_nature: 'choice', rain_walk: 'choice', pda: 'choice', pets: 'choice',
  cleanliness_home: 'scale', enjoy_cooking: 'scale', daily_routine: 'scale', personal_grooming: 'scale',
  long_term_vs_now: 'choice', clothes: 'choice',
};

function scorePair(qid, a_resp, b_resp) {
  const type = QUESTION_META[qid];
  if (!type) return null;
  const av = a_resp[qid];
  const bv = b_resp[qid];
  if (av == null && bv == null) return null;
  if (type === 'scale') return scaleCompat(av, bv);
  if (type === 'choice') return choiceCompat(qid, av, bv);
  return null;
}

function sectionScore(sectionId, a_resp, b_resp) {
  const qids = SECTION_QUESTIONS[sectionId] || [];
  const scores = qids.map(qid => scorePair(qid, a_resp, b_resp)).filter(s => s != null);
  return scores.length ? Math.round(avg(scores)) : 50;
}

// ─── Main Match Calculator ───────────────────────────────────────────────────

function calculateMatch(a, b) {
  const ar = a.responses;
  const br = b.responses;

  const sections = {};
  for (const sid of Object.keys(SECTION_QUESTIONS)) {
    sections[sid] = sectionScore(sid, ar, br);
  }

  const romantic = weightedScore(sections, {
    values: 0.22, eq: 0.18, behavioral: 0.12, lifestyle: 0.15, communication: 0.18, partnership: 0.15, daily: 0.00,
  });

  const roommate = weightedScore(sections, {
    values: 0.08, eq: 0.08, behavioral: 0.10, lifestyle: 0.18, communication: 0.14, partnership: 0.12, daily: 0.30,
  });

  const friendship = weightedScore(sections, {
    values: 0.10, eq: 0.14, behavioral: 0.12, lifestyle: 0.22, communication: 0.20, partnership: 0.02, daily: 0.20,
  });

  const dimsA = personalityDimensions(ar);
  const dimsB = personalityDimensions(br);

  const insights = generateInsights(a, b, ar, br, sections);
  const tips = generateTips(a, b, ar, br, sections);

  return {
    sections,
    romantic: { score: romantic, ...generateCategoryNarrative(a, b, ar, br, 'romantic', sections) },
    roommate: { score: roommate, ...generateCategoryNarrative(a, b, ar, br, 'roommate', sections) },
    friendship: { score: friendship, ...generateCategoryNarrative(a, b, ar, br, 'friendship', sections) },
    overall: Math.round((romantic + roommate + friendship) / 3),
    profiles: {
      a: { dimensions: dimsA, eq: eqScore(ar), personality: personalityType(dimsA) },
      b: { dimensions: dimsB, eq: eqScore(br), personality: personalityType(dimsB) },
    },
    insights,
    tips,
  };
}

// ─── Narrative Generators ────────────────────────────────────────────────────

function generateCategoryNarrative(a, b, ar, br, type, sections) {
  const reasons = [];
  const concerns = [];

  if (type === 'romantic') {
    if (!ar.looking_for?.includes('romantic') || !br.looking_for?.includes('romantic')) {
      return { reasons: [], concerns: [`${a.name} and/or ${b.name} are not looking for a romantic relationship.`] };
    }
    if (sections.values >= 75) reasons.push(`Strong shared values — you both hold honesty and respect as core principles`);
    if (sections.values < 55) concerns.push(`Some values misalignment — differences in commitment style or traditions could surface over time`);
    if (sections.eq >= 70) reasons.push(`High emotional compatibility — you both navigate feelings with awareness`);
    if (sections.eq < 50) concerns.push(`Emotional styles differ significantly — one may need more space, the other more connection`);
    if (sections.communication >= 75) reasons.push(`Your communication styles mesh well — you can have difficult conversations without them escalating`);
    if (sections.communication < 55) concerns.push(`Communication styles could clash — especially around conflict and emotional expression`);
    if (ar.love_language && br.love_language) {
      if (ar.love_language === br.love_language) reasons.push(`You share the same love language (${labelFor('love_language', ar.love_language)}) — you naturally make each other feel valued`);
      else concerns.push(`Different love languages (${labelFor('love_language', ar.love_language)} vs ${labelFor('love_language', br.love_language)}) — learning to speak each other's language will take intentional effort`);
    }
    if (sections.partnership >= 75) reasons.push(`Aligned on partnership philosophy — similar expectations around decisions, chores, and roles`);
    if (sections.lifestyle >= 70) reasons.push(`Shared lifestyle vision — compatible ambitions, financial approaches, and growth mindsets`);
    if (sections.lifestyle < 50) concerns.push(`Lifestyle gap — different financial values or long-term goals may create friction`);
  }

  if (type === 'roommate') {
    if (!ar.looking_for?.includes('roommate') || !br.looking_for?.includes('roommate')) {
      return { reasons: [], concerns: [`${a.name} and/or ${b.name} are not looking for a roommate.`] };
    }
    if (sections.daily >= 75) reasons.push(`Very compatible daily habits — similar cleanliness, routines, and lifestyle rhythms`);
    if (sections.daily < 55) concerns.push(`Different daily habits could cause tension at home — cleanliness and routine differences are top roommate conflicts`);
    if (ar.cleanliness_home != null && br.cleanliness_home != null) {
      const diff = Math.abs(Number(ar.cleanliness_home) - Number(br.cleanliness_home));
      if (diff >= 3) concerns.push(`Significant cleanliness gap (${a.name}: ${ar.cleanliness_home}/5, ${b.name}: ${br.cleanliness_home}/5) — this needs a clear agreement early`);
      if (diff <= 1) reasons.push(`Nearly identical cleanliness standards — no negotiation needed`);
    }
    if (sections.communication >= 70) reasons.push(`Good communication foundation — you can talk through issues before they become problems`);
    if (sections.lifestyle >= 65) reasons.push(`Compatible lifestyle and schedules — natural harmony in shared spaces`);
    if (ar.pets && br.pets) {
      if ((ar.pets === 'have_and_love' || ar.pets === 'want_one') && br.pets === 'no_pets') {
        concerns.push(`Pet mismatch — this needs an honest conversation before moving in`);
      }
    }
  }

  if (type === 'friendship') {
    if (!ar.looking_for?.includes('friend') || !br.looking_for?.includes('friend')) {
      return { reasons: [], concerns: [`${a.name} and/or ${b.name} are not looking for a friendship.`] };
    }
    if (sections.lifestyle >= 70) reasons.push(`Compatible lifestyles give you natural overlap in how you spend time`);
    if (sections.communication >= 70) reasons.push(`Easy communication dynamic — conversations would flow naturally between you`);
    if (sections.daily >= 70) reasons.push(`Similar daily preferences and personality quirks — you'd enjoy each other's company day-to-day`);
    if (sections.eq >= 70) reasons.push(`Emotionally compatible — you can support each other through tough times`);
    if (sections.lifestyle < 50) concerns.push(`Different lifestyle priorities may make it harder to find common ground or shared activities`);
    if (sections.communication < 50) concerns.push(`Communication style differences could lead to misunderstandings`);
  }

  return { reasons, concerns };
}

function generateInsights(a, b, ar, br, sections) {
  const insights = [];

  // Highest and lowest sections
  const sorted = Object.entries(sections).sort((x, y) => y[1] - x[1]);
  const [bestSection] = sorted[0];
  const [weakestSection] = sorted[sorted.length - 1];

  const sectionLabels = {
    values: 'Personal Values', eq: 'Emotional Intelligence', behavioral: 'Behavioral Reactions',
    lifestyle: 'Lifestyle & Goals', communication: 'Communication', partnership: 'Partnership Philosophy', daily: 'Daily Habits',
  };

  insights.push(`Your strongest area of compatibility is **${sectionLabels[bestSection]}** (${sections[bestSection]}%) — lean into this as your foundation.`);

  if (sections[weakestSection] < 60) {
    insights.push(`**${sectionLabels[weakestSection]}** (${sections[weakestSection]}%) is your biggest gap — awareness of this will help you navigate it rather than be surprised by it.`);
  }

  if (ar.stress_response && br.stress_response) {
    if (ar.stress_response === 'withdraw' && br.stress_response === 'talk') {
      insights.push(`When stressed, ${a.name} tends to withdraw while ${b.name} tends to talk — this pairing can create misunderstandings. Agree on a "pause and reconnect" signal.`);
    }
    if (ar.stress_response === br.stress_response) {
      insights.push(`You both handle stress similarly (${ar.stress_response.replace('_', ' ')}) — this shared coping style reduces friction during hard times.`);
    }
  }

  if (ar.communication_freq && br.communication_freq) {
    const freqRank = { constant: 4, regular: 3, occasional: 2, minimal: 1 };
    const diff = Math.abs((freqRank[ar.communication_freq] || 2) - (freqRank[br.communication_freq] || 2));
    if (diff >= 2) {
      insights.push(`Communication frequency expectations differ significantly — ${a.name} prefers ${ar.communication_freq} contact while ${b.name} prefers ${br.communication_freq}. This is worth setting expectations around early.`);
    }
  }

  if (ar.conflict_resolution === 'avoid' || br.conflict_resolution === 'avoid') {
    const avoider = ar.conflict_resolution === 'avoid' ? a.name : b.name;
    insights.push(`${avoider} tends to avoid conflict — this can cause unresolved issues to build up over time. Creating a safe space for honest dialogue will be important.`);
  }

  return insights.slice(0, 4);
}

function generateTips(a, b, ar, br, sections) {
  const tips = [];

  if (ar.love_language && br.love_language && ar.love_language !== br.love_language) {
    tips.push(`**Learn each other's love language.** ${a.name} feels most loved through ${labelFor('love_language', ar.love_language)}, while ${b.name} needs ${labelFor('love_language', br.love_language)}. Consciously practicing the other's language builds deep appreciation.`);
  }

  if (ar.conflict_resolution && br.conflict_resolution && ar.conflict_resolution !== br.conflict_resolution) {
    tips.push(`**Agree on a conflict protocol.** ${a.name} tends to ${ar.conflict_resolution.replace('_', ' ')} while ${b.name} prefers to ${br.conflict_resolution.replace('_', ' ')}. Decide in advance: how long is a "cool-off" period, and what signals that you're ready to talk?`);
  }

  if (sections.communication < 65) {
    tips.push(`**Invest in regular check-ins.** Once a week, ask each other: "What's working? What's not?" — even five minutes of structured honesty prevents weeks of silent resentment.`);
  }

  if (ar.deal_breakers || br.deal_breakers) {
    tips.push(`**Revisit your deal breakers early.** ${a.name} mentioned: "${ar.deal_breakers || 'none listed'}". ${b.name} mentioned: "${br.deal_breakers || 'none listed'}". Addressing these explicitly before they become problems saves enormous heartache.`);
  }

  if (sections.lifestyle < 65) {
    tips.push(`**Map your 5-year visions together.** Different financial or lifestyle goals aren't dealbreakers, but they need to be talked about openly. Try writing your individual goals and looking for overlap.`);
  }

  if (sections.values >= 75) {
    tips.push(`**Your values are your superpower.** When things get difficult, come back to what you both hold sacred — honesty, respect, commitment. Shared values are the root system that keeps a relationship standing.`);
  }

  tips.push(`**Appreciate what each brings.** ${a.name} brings: "${ar.what_i_bring || 'not listed'}". ${b.name} brings: "${br.what_i_bring || 'not listed'}". Regularly naming and acknowledging these contributions builds deep mutual respect.`);

  const fallbacks = [
    `**Practice curiosity over judgment.** When you notice a difference, get curious rather than critical — "How did you come to feel that way?" goes further than "I can't believe you think that."`,
    `**Create rituals together.** Small recurring moments — a walk, a meal, a Sunday tradition — build a shared identity faster than grand gestures.`,
  ];
  for (const f of fallbacks) {
    if (tips.length < 5) tips.push(f);
  }

  return tips.slice(0, 5);
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function avg(arr) {
  const valid = arr.filter(v => v != null && !isNaN(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

function clamp(v) { return Math.min(100, Math.max(0, v)); }

function weightedScore(sections, weights) {
  let total = 0, w = 0;
  for (const [k, weight] of Object.entries(weights)) {
    if (sections[k] != null && weight > 0) {
      total += sections[k] * weight;
      w += weight;
    }
  }
  return Math.round(w > 0 ? total / w : 50);
}

function choiceScore(qid, val, map) {
  return map[val] ?? 3;
}

function labelFor(qid, val) {
  const labels = {
    love_language: { words: 'Words of affirmation', time: 'Quality time', touch: 'Physical touch', acts: 'Acts of service', gifts: 'Thoughtful gifts' },
    communication_freq: { constant: 'constant contact', regular: 'regular contact', occasional: 'occasional contact', minimal: 'minimal contact' },
    conflict_resolution: { direct: 'address it directly', cool_down: 'cool down first', compromise: 'find compromise', avoid: 'avoid it' },
  };
  return (labels[qid] && labels[qid][val]) || val;
}

module.exports = { calculateMatch, personalityDimensions, eqScore, personalityType };
