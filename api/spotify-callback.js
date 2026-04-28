/**
 * api/spotify-callback.js
 * Handles Spotify OAuth callback:
 * 1. Exchanges code for access token
 * 2. Fetches user's top artists + tracks + audio features
 * 3. Saves spotify_data to the profile in Supabase
 * 4. Redirects back to the app with success/error flag
 */
const supabase = require('../lib/supabase');

async function exchangeToken(code, redirectUri) {
  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const creds        = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${creds}`,
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
  });
  return res.json();
}

async function spotifyGet(token, path) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

function avgAudioFeatures(features) {
  const valid = (features || []).filter(Boolean);
  if (!valid.length) return { energy: 0.5, valence: 0.5, danceability: 0.5, acousticness: 0.5 };
  const keys = ['energy', 'valence', 'danceability', 'acousticness'];
  const out = {};
  keys.forEach(k => {
    out[k] = Math.round((valid.reduce((s, f) => s + (f[k] || 0), 0) / valid.length) * 100) / 100;
  });
  return out;
}

module.exports = async (req, res) => {
  const appUrl = process.env.APP_URL || 'https://matchme-ten.vercel.app';
  const { code, state: profileId, error } = req.query;

  if (error || !code || !profileId) {
    return res.redirect(`${appUrl}/?spotify=denied`);
  }

  try {
    const redirectUri = `${appUrl}/api/spotify-callback`;

    // 1. Exchange code
    const tokenData = await exchangeToken(code, redirectUri);
    if (!tokenData.access_token) throw new Error('Token exchange failed');
    const token = tokenData.access_token;

    // 2. Fetch top artists + top tracks in parallel
    const [artistsData, tracksData] = await Promise.all([
      spotifyGet(token, '/me/top/artists?limit=20&time_range=medium_term'),
      spotifyGet(token, '/me/top/tracks?limit=20&time_range=medium_term'),
    ]);

    const topArtists = (artistsData.items || []).map(a => ({
      id: a.id, name: a.name, genres: a.genres || [], popularity: a.popularity,
    }));

    // 3. Fetch audio features for top tracks
    const trackIds = (tracksData.items || []).map(t => t.id).slice(0, 20);
    let audioFeatures = { energy: 0.5, valence: 0.5, danceability: 0.5, acousticness: 0.5 };
    if (trackIds.length) {
      const featData = await spotifyGet(token, `/audio-features?ids=${trackIds.join(',')}`);
      audioFeatures = avgAudioFeatures(featData.audio_features);
    }

    // 4. Aggregate top genres
    const genreCount = {};
    topArtists.forEach(a => a.genres.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; }));
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([g]) => g);

    const spotifyData = {
      connected:      true,
      top_artists:    topArtists.slice(0, 10),
      top_genres:     topGenres,
      audio_features: audioFeatures,
      connected_at:   new Date().toISOString(),
    };

    // 5. Save to Supabase — merge into existing responses jsonb (no schema change needed)
    const { data: existing } = await supabase
      .from('profiles')
      .select('responses')
      .eq('id', profileId)
      .single();

    const updatedResponses = { ...(existing?.responses || {}), _spotify: spotifyData };

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ responses: updatedResponses })
      .eq('id', profileId);

    if (dbErr) throw new Error(dbErr.message);

    // 6. Redirect back to app
    res.redirect(`${appUrl}/?spotify=connected&pid=${profileId}`);

  } catch (err) {
    console.error('Spotify callback error:', err.message);
    res.redirect(`${appUrl}/?spotify=error`);
  }
};
