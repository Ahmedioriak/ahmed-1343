const API = 'https://api.elevenlabs.io/v1';

async function forward(res, endpoint, options) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const response = await fetch(API + endpoint, {
      ...options, redirect: 'error', signal: AbortSignal.timeout(90000),
    });
    const body = Buffer.from(await response.arrayBuffer());
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.end(body);
  } catch {
    res.status(502).json({ error: 'elevenlabs_connection' });
  }
}

async function speech(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  let body;
  try { body = JSON.parse(req.body); } catch { }
  const { key, voice, text, model_id, voice_settings } = body || {};
  if (typeof key !== 'string' || !key || typeof voice !== 'string' || !/^[a-z0-9_-]{1,100}$/i.test(voice)
      || typeof text !== 'string' || !text.trim() || text.length > 2000) {
    return res.status(400).json({ error: 'API key, voice ID and text are required' });
  }
  return forward(res, '/text-to-speech/' + voice + '?output_format=mp3_44100_128', {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id, voice_settings }),
  });
}

async function subscription(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  const key = req.headers['xi-api-key'];
  if (!key) return res.status(400).json({ error: 'API key is required' });
  return forward(res, '/user/subscription', { headers: { 'xi-api-key': key, Accept: 'application/json' } });
}

module.exports = { speech, subscription };
