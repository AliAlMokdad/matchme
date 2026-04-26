const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,          // e.g. https://matchme.vercel.app
  'http://localhost:3000',            // local Vite dev server
  'http://localhost:5173',            // alternate Vite port
].filter(Boolean);

/**
 * Sets CORS headers and handles OPTIONS preflight.
 * Returns true if the request was a preflight (caller should stop).
 */
function cors(req, res) {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Same-origin request (e.g. Vercel serving frontend + API on same domain)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // preflight handled — stop here
  }
  return false;
}

module.exports = cors;
