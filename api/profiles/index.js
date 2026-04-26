const cors = require('../../lib/cors');
const supabase = require('../../lib/supabase');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, age, gender, city, looking_for, responses, what_i_bring, deal_breakers } = req.body;

    if (!name || !responses) {
      return res.status(400).json({ error: 'Name and responses are required' });
    }

    const lookingFor = Array.isArray(looking_for) ? looking_for : [];

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name,
        age: parseInt(age) || null,
        gender: gender || null,
        city: city || null,
        looking_for: lookingFor,
        responses: { ...responses, looking_for: lookingFor },
        what_i_bring: what_i_bring || '',
        deal_breakers: deal_breakers || '',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to create profile' });
    }

    res.status(201).json({ id: data.id, message: 'Profile created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
