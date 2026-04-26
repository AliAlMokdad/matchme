const cors = require('../lib/cors');
const supabase = require('../lib/supabase');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    const profiles = count || 0;
    const matches = Math.floor(profiles / 2);

    return res.status(200).json({ profiles, matches });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
