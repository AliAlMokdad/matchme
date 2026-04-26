const express = require('express');
const router = express.Router();
const { getDb, getOne } = require('../database');
const { calculateMatch } = require('../scoring');

router.get('/', async (req, res) => {
  try {
    await getDb();
    const { profile1, profile2 } = req.query;
    if (!profile1 || !profile2) return res.status(400).json({ error: 'Two profile IDs required' });

    const raw1 = getOne('SELECT * FROM profiles WHERE id = ?', [profile1]);
    const raw2 = getOne('SELECT * FROM profiles WHERE id = ?', [profile2]);

    if (!raw1) return res.status(404).json({ error: `Profile ${profile1} not found` });
    if (!raw2) return res.status(404).json({ error: `Profile ${profile2} not found` });

    const a = {
      id: raw1.id, name: raw1.name, age: raw1.age, city: raw1.city,
      responses: { ...JSON.parse(raw1.responses || '{}'), what_i_bring: raw1.what_i_bring, deal_breakers: raw1.deal_breakers },
    };
    const b = {
      id: raw2.id, name: raw2.name, age: raw2.age, city: raw2.city,
      responses: { ...JSON.parse(raw2.responses || '{}'), what_i_bring: raw2.what_i_bring, deal_breakers: raw2.deal_breakers },
    };

    const result = calculateMatch(a, b);

    res.json({
      profile1: { id: a.id, name: a.name, age: a.age, city: a.city },
      profile2: { id: b.id, name: b.name, age: b.age, city: b.city },
      ...result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
