const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/match', require('./routes/match'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MatchMe backend running on port ${PORT}`));
