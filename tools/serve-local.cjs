// Local-only launcher. Keep the source tree and recording credentials outside the HTTP routes.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const eleven = require('./voice/elevenlabs/local-relay.cjs');

const root = path.resolve(__dirname, '..');
const host = '127.0.0.1';
const port = Number(process.env.SHILLA_PORT || 8043);
const aliases = {
  '/': 'index.html', '/index': 'index.html', '/mobile': 'mobile.html',
  '/v2': 'v2/index.html', '/v2/': 'v2/index.html', '/v2/index': 'v2/index.html',
  '/v2/mobile': 'v2/mobile.html', '/admin': 'admin.html',
  '/record': 'record.html', '/record-new': 'record-new.html', '/record-fortress': 'record-fortress.html',
};
const publicFile = /^(?:(?:v2\/)?(?:index|mobile)\.html|(?:admin|record(?:-new|-fortress)?)\.html|(?:firebase-config|sw|story-voices|pro-voices-\d+)\.js|manifest(?:-mobile)?\.webmanifest|voice-lines(?:-new|-fortress)?\.json|icons\/icon-[\w-]+\.png)$/;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const apis = new Map([
  ['/api/tts', require('../api/tts.js')],
  ['/api/fish-credit', require('../api/fish-credit.js')],
  ['/api/eleven-speech', eleven.speech],
  ['/api/eleven-subscription', eleven.subscription],
]);

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
async function relay(req, res, handler) {
  if (req.headers.origin && req.headers.origin !== `http://${host}:${port}`) return send(res, 403, { error: 'Local requests only' });
  req.setEncoding('utf8');
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 16384) return send(res, 413, { error: 'Request is too large' });
  }
  req.body = body;
  res.status = code => { res.statusCode = code; return res; };
  res.json = data => send(res, res.statusCode, data);
  await handler(req, res);
}
const server = http.createServer(async (req, res) => {
  try {
    if (req.headers.host !== `${host}:${port}`) return send(res, 403, { error: 'Local requests only' });
    const url = new URL(req.url, `http://${host}:${port}`);
    const api = apis.get(url.pathname);
    if (api) return await relay(req, res, api);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'GET or HEAD only' });
    const file = Object.hasOwn(aliases, url.pathname) ? aliases[url.pathname] : url.pathname.slice(1);
    if (!publicFile.test(file)) return send(res, 404, { error: 'Page not found' });
    const target = path.join(root, file);
    const stat = await fs.promises.stat(target);
    const modified = stat.mtime.toUTCString();
    const etag = `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
    const headers = { 'Content-Type': types[path.extname(file)], 'Last-Modified': modified,
      'Cache-Control': 'no-cache', ETag: etag };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
    res.writeHead(200, { ...headers, 'Content-Length': stat.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).on('error', err => res.destroy(err)).pipe(res);
  } catch (err) {
    if (res.headersSent) return res.destroy();
    send(res, err.code === 'ENOENT' ? 404 : 500, { error: err.code === 'ENOENT' ? 'Page not found' : 'Local server error' });
  }
});

server.on('error', err => { console.error(err.message); process.exitCode = 1; });
server.listen(port, host, () => {
  const address = `http://${host}:${port}/`;
  console.log(`Shilla Fight: ${address}`);
  console.log('Keep this window open while playing. Press Ctrl+C to stop.');
  if (!process.argv.includes('--no-open') && process.platform === 'win32') {
    const page = process.argv.includes('--record-fortress') ? address + 'record-fortress' : address;
    spawn('rundll32.exe', ['url.dll,FileProtocolHandler', page], { stdio: 'ignore' })
      .on('error', () => console.log(page)).unref();
  }
});
