const cors = require('../lib/cors');
const Anthropic = require('@anthropic-ai/sdk');

let _client = null;
function getClient() {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Missing ANTHROPIC_API_KEY environment variable');
  _client = new Anthropic({ apiKey: key });
  return _client;
}

const LANG_NAMES = {
  en: 'English',
  da: 'Danish',
  fr: 'French',
  ar: 'Arabic',
  es: 'Spanish',
};

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      profile1, profile2, result, lang = 'en',
    } = req.body;

    if (!profile1 || !profile2 || !result) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const language = LANG_NAMES[lang] || 'English';

    // Build open answers summary
    const openSummary = (result.openAnswers || [])
      .filter(q => q.a || q.b)
      .map(q => `  Q: ${q.question}\n  ${profile1.name}: "${q.a || 'no answer'}"\n  ${profile2.name}: "${q.b || 'no answer'}"`)
      .join('\n\n');

    const sectionLines = Object.entries(result.sections || {})
      .map(([k, v]) => `  ${k}: ${v}%`)
      .join('\n');

    const prompt = `You are an expert relationship and compatibility analyst for MatchMe, a deep personality assessment platform.

Two people completed a 70+ question personality assessment. Your job is to provide four things based on their data.

CRITICAL RULES:
- Do NOT use em dashes (do not write "--" or "—" or any dash used as a pause). Use commas, semicolons, or periods instead.
- Write in ${language}.
- Be specific, warm, and honest. Reference their actual answers and names.
- No platitudes. No generic filler. Every sentence must earn its place.

PERSON A: ${profile1.name}${profile1.age ? `, age ${profile1.age}` : ''}${profile1.city ? `, from ${profile1.city}` : ''}
PERSON B: ${profile2.name}${profile2.age ? `, age ${profile2.age}` : ''}${profile2.city ? `, from ${profile2.city}` : ''}

OVERALL COMPATIBILITY: ${result.overall}%

SECTION SCORES:
${sectionLines}

THEIR OPEN-ENDED ANSWERS (compared):
${openSummary || 'No open answers provided.'}

What ${profile1.name} brings: "${profile1.what_i_bring || 'not shared'}"
What ${profile2.name} brings: "${profile2.what_i_bring || 'not shared'}"

${profile1.name} deal breakers: "${profile1.deal_breakers || 'none listed'}"
${profile2.name} deal breakers: "${profile2.deal_breakers || 'none listed'}"

---

Respond with ONLY valid JSON in this exact structure (no markdown, no code blocks, just raw JSON):

{
  "narrative": "2 to 3 paragraphs. Honest, specific, insightful analysis of this match. Reference their answers. Name the real strengths and the real tensions. Write for the two people reading this together.",
  "icebreaker": "One natural, warm, personalized conversation starter that one of them could send to the other. Base it on something specific from their open answers. Not cheesy. Not generic. Sound like a real person.",
  "personalities": {
    "a": "1 to 2 sentences describing ${profile1.name}'s communication personality based on HOW they wrote their answers, the vocabulary they used, the length, the warmth or reserve.",
    "b": "1 to 2 sentences describing ${profile2.name}'s communication personality in the same way."
  },
  "openSimilarity": <integer 0 to 100 representing how semantically similar their open-ended answers are overall>
}`;

    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();

    // Parse JSON robustly
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON from response if wrapped in text
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('Could not parse AI response as JSON');
    }

    res.json({
      narrative: parsed.narrative || '',
      icebreaker: parsed.icebreaker || '',
      personalities: parsed.personalities || { a: '', b: '' },
      openSimilarity: typeof parsed.openSimilarity === 'number' ? parsed.openSimilarity : null,
    });

  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
};
