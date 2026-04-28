const cors = require('../lib/cors');
const supabase = require('../lib/supabase');
const { calculateMatch } = require('../lib/scoring');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profile1, profile2 } = req.query;

    if (!profile1 || !profile2) {
      return res.status(400).json({ error: 'Two profile IDs are required' });
    }

    if (profile1 === profile2) {
      return res.status(400).json({ error: 'Profile IDs must be different' });
    }

    const [{ data: raw1, error: err1 }, { data: raw2, error: err2 }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', profile1).single(),
      supabase.from('profiles').select('*').eq('id', profile2).single(),
    ]);

    if (err1 || !raw1) return res.status(404).json({ error: `Profile ${profile1} not found` });
    if (err2 || !raw2) return res.status(404).json({ error: `Profile ${profile2} not found` });

    const a = {
      id: raw1.id, name: raw1.name, age: raw1.age, city: raw1.city,
      responses: { ...raw1.responses, what_i_bring: raw1.what_i_bring, deal_breakers: raw1.deal_breakers },
    };
    const b = {
      id: raw2.id, name: raw2.name, age: raw2.age, city: raw2.city,
      responses: { ...raw2.responses, what_i_bring: raw2.what_i_bring, deal_breakers: raw2.deal_breakers },
    };

    const result = calculateMatch(a, b);

    // Include Spotify connection status so frontend can show music section
    const music = {
      aConnected: !!(raw1.spotify_data?.connected),
      bConnected: !!(raw2.spotify_data?.connected),
    };

    res.json({
      profile1: { id: a.id, name: a.name, age: a.age, city: a.city },
      profile2: { id: b.id, name: b.name, age: b.age, city: b.city },
      music,
      ...result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
