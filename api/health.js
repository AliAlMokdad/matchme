const cors = require('../lib/cors');

module.exports = (req, res) => {
  if (cors(req, res)) return;
  res.json({ status: 'ok' });
};
