/**
 * api/ai.js — Zero-cost local AI narrative generator.
 * No external APIs. No API keys. No usage fees.
 * All insights derived purely from scoring data and open answers.
 */

const cors = require('../lib/cors');

// ---------------------------------------------------------------------------
// Tier definitions (mirrors Match.jsx TIERS)
// ---------------------------------------------------------------------------
const TIERS = [
  { min: 88, label: 'Exceptional Match',  adjective: 'exceptional',  tone: 'celebratory' },
  { min: 72, label: 'Strong Match',        adjective: 'strong',        tone: 'positive'    },
  { min: 58, label: 'Promising Match',     adjective: 'promising',     tone: 'encouraging' },
  { min: 40, label: 'Partial Match',       adjective: 'partial',       tone: 'balanced'    },
  { min: 0,  label: 'Low Compatibility',   adjective: 'low',           tone: 'honest'      },
];

function getTier(score) {
  return TIERS.find(t => score >= t.min) || TIERS[TIERS.length - 1];
}

// ---------------------------------------------------------------------------
// Section label map
// ---------------------------------------------------------------------------
const SECTION_LABELS = {
  values:        'Values & Beliefs',
  lifestyle:     'Lifestyle',
  communication: 'Communication',
  emotional:     'Emotional Intelligence',
  relationship:  'Relationship Style',
  travel:        'Travel Compatibility',
};

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
function cap(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sortSections(sections) {
  return Object.entries(sections || {})
    .map(([k, v]) => ({ key: k, label: SECTION_LABELS[k] || k, score: Number(v) }))
    .sort((a, b) => b.score - a.score);
}

// Jaccard word overlap between two strings
function jaccard(a, b) {
  if (!a || !b) return 0;
  const setA = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  setA.forEach(w => { if (setB.has(w)) intersection++; });
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// Average word count per answer
function avgLen(answers) {
  const texts = answers.filter(Boolean);
  if (!texts.length) return 0;
  const total = texts.reduce((s, t) => s + t.split(/\s+/).filter(Boolean).length, 0);
  return total / texts.length;
}

// ---------------------------------------------------------------------------
// Open similarity score (1-99)
// ---------------------------------------------------------------------------
function openSimilarityScore(openAnswers) {
  if (!openAnswers || !openAnswers.length) return 50;
  const pairs = openAnswers.filter(q => q.a && q.b);
  if (!pairs.length) return 50;

  const jaccardScores = pairs.map(q => jaccard(q.a, q.b));
  const avgJaccard = jaccardScores.reduce((s, v) => s + v, 0) / jaccardScores.length;

  // Length ratio bonus: similar answer lengths suggest similar depth of engagement
  const lenRatios = pairs.map(q => {
    const la = q.a.split(/\s+/).filter(Boolean).length;
    const lb = q.b.split(/\s+/).filter(Boolean).length;
    if (!la || !lb) return 0;
    return Math.min(la, lb) / Math.max(la, lb);
  });
  const avgLenRatio = lenRatios.reduce((s, v) => s + v, 0) / lenRatios.length;

  // Blend: 65% jaccard, 35% length ratio
  const raw = avgJaccard * 0.65 + avgLenRatio * 0.35;

  // Scale to 1-99 with a gentle curve so mid-range feels realistic
  const scaled = Math.round(1 + raw * 98);
  return Math.min(99, Math.max(1, scaled));
}

// ---------------------------------------------------------------------------
// Writing style analysis
// ---------------------------------------------------------------------------
function analyseWritingStyle(openAnswers, name, side) {
  const texts = openAnswers
    .map(q => (side === 'a' ? q.a : q.b))
    .filter(Boolean);

  if (!texts.length) {
    return `${name} kept their open answers brief, which leaves some mystery about their communication style.`;
  }

  const avg = avgLen(texts);
  const totalChars = texts.join(' ').length;
  const exclamations = (texts.join(' ').match(/!/g) || []).length;
  const questions = (texts.join(' ').match(/\?/g) || []).length;
  const emojis = (texts.join(' ').match(/[\u{1F300}-\u{1FFFF}]/gu) || []).length;

  // Build a profile
  let lengthDesc, energyDesc, styleNote;

  if (avg >= 40) {
    lengthDesc = pick([
      `writes in depth`,
      `expresses themselves at length`,
      `gives thoughtful, detailed responses`,
    ]);
  } else if (avg >= 18) {
    lengthDesc = pick([
      `strikes a balance between thorough and concise`,
      `writes with clear, measured responses`,
      `communicates directly without over-explaining`,
    ]);
  } else {
    lengthDesc = pick([
      `keeps their answers short and to the point`,
      `prefers brevity over elaboration`,
      `communicates concisely`,
    ]);
  }

  if (exclamations > texts.length * 0.6) {
    energyDesc = pick([`bringing noticeable enthusiasm`, `with warmth and energy`, `with expressive positivity`]);
  } else if (questions > texts.length * 0.4) {
    energyDesc = pick([`with a naturally curious tone`, `often turning thoughts into questions`, `showing genuine intellectual curiosity`]);
  } else {
    energyDesc = pick([`with a calm, measured tone`, `in a grounded, composed way`, `with quiet confidence`]);
  }

  if (emojis > texts.length * 0.5) {
    styleNote = ` They use visual language freely, which signals warmth and approachability.`;
  } else if (avg >= 30 && exclamations < 2) {
    styleNote = ` Their writing feels considered and intentional.`;
  } else {
    styleNote = '';
  }

  return `${name} ${lengthDesc}, ${energyDesc}.${styleNote}`;
}

// ---------------------------------------------------------------------------
// Narrative generator (3 paragraphs, no em dashes)
// ---------------------------------------------------------------------------
function generateNarrative(profile1, profile2, result) {
  const tier = getTier(result.overall);
  const sorted = sortSections(result.sections);
  const top2 = sorted.slice(0, 2);
  const bottom = sorted[sorted.length - 1];
  const n1 = profile1.name;
  const n2 = profile2.name;
  const score = result.overall;

  // Paragraph 1: tier framing
  const p1Templates = {
    celebratory: [
      `At ${score}%, ${n1} and ${n2} land in rare territory. Most profiles we see cluster in the 60s and 70s. Scores above 85 appear only when two people share not just surface preferences but underlying values, emotional rhythms, and life philosophy. That is what the data shows here.`,
      `${score}% is not a number to take lightly. ${n1} and ${n2} scored in the top tier across a 70-question assessment designed to surface real differences. The alignment here goes deeper than lifestyle choices; it reflects a shared way of seeing the world.`,
    ],
    positive: [
      `${n1} and ${n2} score ${score}%, placing them in the strong match category. This is not a coincidence of shared hobbies; it reflects genuine alignment on the things that actually determine whether two people work long-term: values, emotional patterns, and communication style.`,
      `A ${score}% match means real compatibility, the kind built on substance rather than surface. ${n1} and ${n2} share a strong foundation across multiple dimensions that often pull people apart.`,
    ],
    encouraging: [
      `${score}% is a promising score, and promising is worth paying attention to. ${n1} and ${n2} share real strengths, and where they diverge, the gaps are workable rather than fundamental.`,
      `At ${score}%, ${n1} and ${n2} have more going for them than against them. The data shows genuine alignment in the areas that matter most, alongside a few honest differences worth knowing about.`,
    ],
    balanced: [
      `${n1} and ${n2} score ${score}%. That is a partial match, which means real connection in some areas and real friction in others. The question is not whether they are compatible; it is whether the strengths outweigh the tensions in the areas they care about most.`,
      `At ${score}%, the picture here is mixed. ${n1} and ${n2} share enough to build something, but the data also reveals meaningful differences that would benefit from an honest conversation before things go further.`,
    ],
    honest: [
      `The data is honest: at ${score}%, ${n1} and ${n2} face significant differences on the dimensions we measured. Low compatibility scores do not mean incompatibility as people; they mean the assessment found genuine divergence in values, lifestyle, and emotional patterns.`,
      `${score}% is a low score, and the data earns that conclusion. ${n1} and ${n2} approach several core dimensions differently. That does not rule anything out, but it does mean both people would need to invest more in bridging those gaps.`,
    ],
  };

  const p1 = pick(p1Templates[tier.tone]);

  // Paragraph 2: top strengths
  const strengthLines = top2.map(s => {
    if (s.score >= 85) return `${s.label} (${s.score}%) is a standout area where their answers align with striking consistency`;
    if (s.score >= 70) return `${s.label} (${s.score}%) shows solid alignment that will show up in day-to-day interactions`;
    return `${s.label} (${s.score}%) represents their strongest shared ground`;
  });

  const p2 = `Their clearest strength is ${strengthLines[0]}${top2.length > 1 ? `. ${cap(strengthLines[1])} as well` : ''}. ${
    result.overall >= 72
      ? `Together these create the kind of baseline compatibility that makes hard conversations easier and shared experiences richer.`
      : `These strengths are real and worth building on, even where other areas show friction.`
  }`;

  // Paragraph 3: honest tension or closing
  let p3;
  if (bottom && bottom.score < 65 && sorted.length > 2) {
    const tensionPhrases = [
      `The area to watch is ${bottom.label} (${bottom.score}%). This is where the assessment found the most divergence, and it is worth a direct conversation rather than discovering it gradually.`,
      `${bottom.label} (${bottom.score}%) is the honest friction point in this match. Neither person is wrong; they simply approach this dimension differently, and naming that early tends to go better than letting it surface on its own.`,
      `Where the data shows tension is in ${bottom.label} (${bottom.score}%). That gap is worth understanding, because it is the kind of difference that either becomes a productive dynamic or a recurring source of strain, depending on how both people handle it.`,
    ];
    p3 = pick(tensionPhrases);
  } else {
    const closingPhrases = [
      `What stands out across the full profile is consistency. ${n1} and ${n2} do not just agree in one area; the alignment holds across multiple sections. That breadth is more meaningful than any single high score.`,
      `The profile as a whole reflects two people who are genuinely oriented in the same direction. That kind of coherence across many questions is harder to fake and harder to find.`,
      `Taken together, the assessment paints a picture of a match that has real depth to explore. The numbers are a starting point; the conversation it opens is the more interesting part.`,
    ];
    p3 = pick(closingPhrases);
  }

  return `${p1}\n\n${p2}\n\n${p3}`;
}

// ---------------------------------------------------------------------------
// Icebreaker generator
// ---------------------------------------------------------------------------
function generateIcebreaker(profile1, profile2, result) {
  const openAnswers = result.openAnswers || [];
  const n1 = profile1.name;

  // Look for specific topic answers to reference
  const weekendQ = openAnswers.find(q =>
    q.question && /weekend|free time|relax|recharge/i.test(q.question) && (q.a || q.b)
  );
  const travelQ = openAnswers.find(q =>
    q.question && /travel|trip|destination|place/i.test(q.question) && (q.a || q.b)
  );
  const goalQ = openAnswers.find(q =>
    q.question && /goal|dream|five year|future|aspir/i.test(q.question) && (q.a || q.b)
  );
  const unwindQ = openAnswers.find(q =>
    q.question && /unwind|stress|end of day|relax/i.test(q.question) && (q.a || q.b)
  );

  if (weekendQ && weekendQ.a && weekendQ.b) {
    return `"I noticed you said you spend your weekends ${weekendQ.b.toLowerCase().slice(0, 60).trim()}... I tend toward ${weekendQ.a.toLowerCase().slice(0, 60).trim()}. Have you ever mixed the two? Genuinely curious whether that would work or drive us both mad."`;
  }

  if (travelQ && (travelQ.a || travelQ.b)) {
    const ref = (travelQ.a || travelQ.b).slice(0, 60).trim();
    return `"Your answer about travel caught my attention: ${ref.toLowerCase()}... Do you actually have a specific place in mind, or is that the kind of dream that stays a dream? I ask because I might have thoughts."`;
  }

  if (goalQ && goalQ.a) {
    const ref = goalQ.a.slice(0, 55).trim();
    return `"You wrote about ${ref.toLowerCase()}... I find that either very relatable or very interesting depending on the details. What is the part you are most uncertain about?"`;
  }

  if (unwindQ && unwindQ.b) {
    const ref = unwindQ.b.slice(0, 55).trim();
    return `"You unwind by ${ref.toLowerCase()}... That is either a great sign or a sign we would need to negotiate evenings carefully. Which do you think it is?"`;
  }

  // Fallback: score-based
  const sorted = sortSections(result.sections);
  const top = sorted[0];
  const topLabel = top ? top.label.toLowerCase() : 'how you see things';
  return `"Our ${topLabel} scores were almost identical, which either means we are very aligned or we both lied in the same direction. Which do you think it was?"`;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { profile1, profile2, result } = req.body;

    if (!profile1 || !profile2 || !result) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const openAnswers = result.openAnswers || [];

    const narrative     = generateNarrative(profile1, profile2, result);
    const icebreaker    = generateIcebreaker(profile1, profile2, result);
    const styleA        = analyseWritingStyle(openAnswers, profile1.name, 'a');
    const styleB        = analyseWritingStyle(openAnswers, profile2.name, 'b');
    const openSimilarity = openSimilarityScore(openAnswers);

    res.json({
      narrative,
      icebreaker,
      personalities: { a: styleA, b: styleB },
      openSimilarity,
    });

  } catch (err) {
    console.error('AI local generator error:', err.message);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
};
