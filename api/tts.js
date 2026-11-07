// Same-site relay for the voice recorder (record.html): Fish Audio's API can't be called from a browser page directly
// (no CORS), so the page sends each line here and this forwards it. The caller's own API key travels in the request;
// nothing is stored or logged.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  const { key, text, reference_id, model, speed } = b;
  if (!key || !text) { res.status(400).json({ error: 'key and text are required' }); return; }
  try {
    const r = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', model: model || 's2.1-pro-free' },
      body: JSON.stringify({ text: String(text).slice(0, 2000), reference_id: reference_id || undefined, format: 'mp3', mp3_bitrate: 128, latency: 'normal', prosody: { speed: Number(speed) || 1, volume: 0 } }),
    });
    const buf = Buffer.from(await r.arrayBuffer());
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/octet-stream');
    res.end(buf);
  } catch (e) { res.status(502).json({ error: 'relay failed', detail: String(e && e.message || e) }); }
};
