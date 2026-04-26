const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const row = db.exec('SELECT COUNT(*) as count FROM profiles')[0];
    const profiles = row ? row.values[0][0] : 0;
    const matches = Math.floor(profiles / 2);
    res.json({ profiles, matches });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
