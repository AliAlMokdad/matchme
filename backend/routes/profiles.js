const express = require('express');
const router = express.Router();
const { getDb, insert, getOne } = require('../database');

router.post('/', async (req, res) => {
  try {
    await getDb();
    const { name, age, gender, city, looking_for, responses, what_i_bring, deal_breakers } = req.body;

    if (!name || !responses) {
      return res.status(400).json({ error: 'Name and responses are required' });
    }

    const responsesStr = JSON.stringify({
      ...responses,
      looking_for: Array.isArray(looking_for) ? looking_for : [],
    });

    const id = insert(
      `INSERT INTO profiles (name, age, gender, city, looking_for, responses, what_i_bring, deal_breakers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        parseInt(age) || null,
        gender || null,
        city || null,
        JSON.stringify(Array.isArray(looking_for) ? looking_for : []),
        responsesStr,
        what_i_bring || '',
        deal_breakers || '',
      ]
    );

    res.json({ id, message: 'Profile created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await getDb();
    const profile = getOne('SELECT * FROM profiles WHERE id = ?', [req.params.id]);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.responses = JSON.parse(profile.responses || '{}');
    profile.looking_for = JSON.parse(profile.looking_for || '[]');
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
