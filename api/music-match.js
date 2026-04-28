/**
 * api/music-match.js
 * Computes music compatibility between two profiles that have Spotify connected.
 * Uses Gemini free tier for the narrative; falls back to local generation.
 * GET /api/music-match?profile1=X&profile2=Y
 */
const cors    = require('../lib/cors');
const supabase = require('../lib/supabase');

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
function musicScore(sdA, sdB) {
  // Genre overlap — Jaccard
  const gA = new Set(sdA.top_genres || []);
  const gB = new Set(sdB.top_genres || []);
  const inter = [...gA].filter(g => gB.has(g)).length;
  const union = new Set([...gA, ...gB]).size;
  const genreScore = union > 0 ? inter / union : 0;

  // Shared artists
  const aA = new Set((sdA.top_artists || []).map(a => a.id));
  const aB = new Set((sdB.top_artists || []).map(a => a.id));
  const sharedCount = [...aA].filter(id => aB.has(id)).length;
  const artistScore = Math.min(sharedCount / 4, 1); // 4 shared = max

  // Audio feature similarity (energy, valence, danceability, acousticness)
  const afA = sdA.audio_features || {};
  const afB = sdB.audio_features || {};
  const KEYS = ['energy', 'valence', 'danceability', 'acousticness'];
  const featureSim = KEYS.reduce((sum, k) => {
    const diff = Math.abs((afA[k] || 0.5) - (afB[k] || 0.5));
    return sum + (1 - diff);
  }, 0) / KEYS.length;

  const raw = genreScore * 0.30 + featureSim * 0.50 + artistScore * 0.20;
  return Math.round(Math.min(99, Math.max(1, raw * 100)));
}

function sharedArtists(sdA, sdB) {
  const namesB = new Set((sdB.top_artists || []).map(a => a.name));
  return (sdA.top_artists || []).filter(a => namesB.has(a.name)).map(a => a.name);
}

// ---------------------------------------------------------------------------
// Local narrative fallback
// ---------------------------------------------------------------------------
function localNarrative(n1, n2, sdA, sdB, score, shared) {
  const afA = sdA.audio_features || {};
  const afB = sdB.audio_features || {};
  const energyDiff   = Math.abs((afA.energy || 0.5) - (afB.energy || 0.5));
  const valenceDiff  = Math.abs((afA.valence || 0.5) - (afB.valence || 0.5));

  let narrative, icebreaker;

  if (shared.length >= 3) {
    narrative   = `${n1} and ${n2} share ${shared.length} artists including ${shared.slice(0, 2).join(' and ')}. That kind of overlap is rare and tells you something real about shared taste. Their audio profiles also align closely on energy and mood.`;
    icebreaker  = `Which ${shared[0]} era matters most to you, and does the answer change how you see this match?`;
  } else if (score >= 72) {
    narrative   = `Their genre worlds overlap well and their listening energy levels run close together. Even without sharing specific artists, ${n1} and ${n2} are drawn to the same sonic territory, which tends to matter more day-to-day than specific names.`;
    icebreaker  = `What song would you put on in the car on a long drive with someone you just met? Go.`;
  } else if (energyDiff > 0.28) {
    narrative   = `${n1} and ${n2} sit at different ends of the energy dial in their music. That contrast can actually be a good thing: each person tends to introduce the other to sounds they would never have found alone. The question is whether that feels stimulating or exhausting.`;
    icebreaker  = `What is the most out-of-character artist in your Spotify history that you actually love and never tell anyone about?`;
  } else if (valenceDiff > 0.28) {
    narrative   = `One of you gravitates toward upbeat and bright music; the other toward something more introspective. Neither is better. But it does raise an honest question about what shared evenings at home would sound like.`;
    icebreaker  = `Is your default playlist mood a reflection of how you feel, or how you want to feel?`;
  } else {
    narrative   = `Their music tastes travel in different directions but share a similar emotional sensibility underneath. The overlap in genres is modest; the overlap in how they use music seems deeper.`;
    icebreaker  = `Describe your music taste to someone who has never heard any of it using only three words.`;
  }

  return { narrative, icebreaker };
}

// ---------------------------------------------------------------------------
// Gemini free tier
// ---------------------------------------------------------------------------
async function geminiNarrative(n1, n2, sdA, sdB, score, shared) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const afA = sdA.audio_features || {};
  const afB = sdB.audio_features || {};

  function describeAf(name, af) {
    const energy   = af.energy   > 0.7 ? 'high-energy'  : af.energy   < 0.35 ? 'calm and low-key' : 'mid-tempo';
    const mood     = af.valence  > 0.65 ? 'upbeat'      : af.valence  < 0.35 ? 'melancholic'      : 'emotionally mixed';
    const texture  = af.acousticness > 0.55 ? 'acoustic' : af.acousticness < 0.25 ? 'electronic'  : 'hybrid acoustic-electronic';
    return `${name}: ${energy}, ${mood}, ${texture}. Genres: ${(sdA === sdB ? sdA : (name === n1 ? sdA : sdB)).top_genres?.slice(0, 4).join(', ') || 'varied'}.`;
  }

  const profileLines = `${describeAf(n1, afA)}\n${describeAf(n2, afB)}`;
  const sharedLine   = shared.length > 0
    ? `Shared artists: ${shared.slice(0, 3).join(', ')}.`
    : 'No shared artists in top 10.';

  const prompt = `You are a music compatibility analyst for MatchMe, a personality matching platform.

Two people connected their Spotify. Write a short, fun, specific music compatibility insight for them to read together.

RULES:
- No em dashes (no — or --)
- Maximum 3 punchy sentences
- Warm and specific, not generic
- End with ONE short icebreaker question they can ask each other

DATA:
${profileLines}
${sharedLine}
Music compatibility score: ${score}%.

Respond ONLY with valid JSON: {"narrative": "...", "icebreaker": "..."}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents:         [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 280 },
        }),
      }
    );
    const d    = await r.json();
    const raw  = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) return null;
    const m = raw.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { profile1, profile2 } = req.query;
  if (!profile1 || !profile2) return res.status(400).json({ error: 'Missing profile IDs' });

  try {
    const [{ data: raw1 }, { data: raw2 }] = await Promise.all([
      supabase.from('profiles').select('id, name, spotify_data').eq('id', profile1).single(),
      supabase.from('profiles').select('id, name, spotify_data').eq('id', profile2).single(),
    ]);

    if (!raw1 || !raw2) return res.status(404).json({ error: 'Profile not found' });

    const sdA = raw1.spotify_data;
    const sdB = raw2.spotify_data;

    if (!sdA?.connected || !sdB?.connected) {
      return res.json({
        bothConnected: false,
        aConnected:    !!sdA?.connected,
        bConnected:    !!sdB?.connected,
      });
    }

    const score  = musicScore(sdA, sdB);
    const shared = sharedArtists(sdA, sdB);

    // Try Gemini, fall back to local
    let ai = await geminiNarrative(raw1.name, raw2.name, sdA, sdB, score, shared);
    if (!ai) ai = localNarrative(raw1.name, raw2.name, sdA, sdB, score, shared);

    res.json({
      bothConnected:   true,
      score,
      sharedArtists:   shared,
      topGenresA:      sdA.top_genres    || [],
      topGenresB:      sdB.top_genres    || [],
      audioFeaturesA:  sdA.audio_features || {},
      audioFeaturesB:  sdB.audio_features || {},
      topArtistsA:     (sdA.top_artists  || []).slice(0, 5).map(a => a.name),
      topArtistsB:     (sdB.top_artists  || []).slice(0, 5).map(a => a.name),
      narrative:       ai.narrative,
      icebreaker:      ai.icebreaker,
    });

  } catch (err) {
    console.error('music-match error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
