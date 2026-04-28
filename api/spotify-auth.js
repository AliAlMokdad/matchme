/**
 * api/spotify-auth.js
 * Redirects the user to Spotify's OAuth consent screen.
 * Usage: GET /api/spotify-auth?profile_id=123
 */
const cors = require('../lib/cors');

module.exports = async (req, res) => {
  if (cors(req, res)) return;

  const { profile_id } = req.query;
  if (!profile_id) return res.status(400).json({ error: 'Missing profile_id' });

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'Spotify not configured — add SPOTIFY_CLIENT_ID env var' });

  const appUrl = process.env.APP_URL || 'https://matchme-ten.vercel.app';
  const redirectUri = `${appUrl}/api/spotify-callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    response_type: 'code',
    redirect_uri:  redirectUri,
    scope:         'user-top-read',
    state:         String(profile_id),
    show_dialog:   'false',
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
};
