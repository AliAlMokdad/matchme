const { createClient } = require('@supabase/supabase-js');

// Lazy singleton — client is created on first use, not at import time.
// This prevents build-time failures when env vars aren't yet available.
let _client = null;

function getClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }
  _client = createClient(url, key);
  return _client;
}

// Proxy so callers can do `supabase.from(...)` directly without change.
module.exports = new Proxy({}, {
  get(_, prop) {
    const client = getClient();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
