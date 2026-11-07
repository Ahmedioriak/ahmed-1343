// معركة الشلة — تشغيل بدون إنترنت (النسخة الأساسية فقط؛ معركة الشلة 2 ما تتأثر)
const V = 'shilla-v1-54';
const CORE = ['./', './mobile', './firebase-config.js', './pro-voices-1.js', './pro-voices-2.js', './pro-voices-3.js', './manifest.webmanifest', './manifest-mobile.webmanifest',
  './icons/icon-32.png', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-192.png', './icons/icon-maskable-512.png'];
const SCOPE = new URL(self.registration.scope);
const ALT = { './': ['./', './index.html'], './mobile': ['./mobile', './mobile.html'] };

function keyOf(u) {
  if (u.origin !== SCOPE.origin || !u.pathname.startsWith(SCOPE.pathname)) return null;
  const rel = u.pathname.slice(SCOPE.pathname.length);
  if (rel === '' || rel === 'index' || rel === 'index.html') return './';
  if (rel === 'mobile' || rel === 'mobile.html') return './mobile';
  return CORE.includes('./' + rel) ? './' + rel : null;
}
// fetch a key from the network; redirected responses are rebuilt so they can answer page loads
async function grab(k, mode) {
  for (const p of (ALT[k] || [k])) {
    try {
      const r = await fetch(new URL(p, SCOPE).href, { cache: mode || 'no-cache' });
      if (!r.ok) continue;
      return r.redirected ? new Response(await r.blob(), { status: 200, headers: r.headers }) : r;
    } catch (e) { }
  }
  return null;
}
self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(V);
  await Promise.all(CORE.map(async k => { const r = await grab(k, 'reload'); if (r) await c.put(k, r); }));
  await self.skipWaiting();
})()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const n of await caches.keys()) if (n.startsWith('shilla-v1') && n !== V) await caches.delete(n);
  await self.clients.claim();
})()));
async function notify() { for (const c of await self.clients.matchAll({ type: 'window' })) c.postMessage({ t: 'upd' }); }
const WAIT = 2500; // كل ما تفتح اللعبة: يتأكد من آخر تحديث (أقصى شي ثانيتين ونص)، وبعدها يفتح
const sig = r => r && (r.headers.get('etag') || r.headers.get('last-modified') || r.headers.get('content-length'));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const k = keyOf(new URL(r.url)); if (!k) return;
  const page = k === './' || k === './mobile';
  e.respondWith((async () => {
    const c = await caches.open(V), hit = await c.match(k);
    let late = false;
    const net = grab(k).then(async res => {
      if (!res) return null;
      const changed = hit && sig(hit) !== sig(res);
      await c.put(k, res.clone());
      if (page && late && changed) notify();   // وصل التحديث بعد ما فتحت اللعبة: اللعبة تعيد تحميل نفسها
      return res;
    });
    if (!hit) return (await net) || new Response('غير متصل', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    if (!page) { e.waitUntil(net); return hit; }
    const first = await Promise.race([net, new Promise(ok => setTimeout(() => ok(null), WAIT))]);
    if (first) return first;                      // آخر نسخة من الموقع
    late = true; e.waitUntil(net); return hit;    // النت بطيء أو مقطوع: افتح النسخة المحفوظة
  })());
});
