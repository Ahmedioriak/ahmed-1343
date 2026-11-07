// Checks a Fish Audio API key for the voice recorder (record.html). The key is only forwarded, never stored.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const key = (req.headers['x-fish-key'] || '').toString();
  if (!key) { res.status(400).json({ error: 'missing key' }); return; }
  try {
    const r = await fetch('https://api.fish.audio/wallet/self/api-credit', { headers: { Authorization: 'Bearer ' + key } });
    res.status(r.status); res.setHeader('Content-Type', 'application/json'); res.end(await r.text());
  } catch (e) { res.status(502).json({ error: 'relay failed' }); }
};
