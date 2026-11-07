'use strict';
(function () {
// ================= CORE SETUP =================
const VW = 1280, VH = 720, GSY = 632, CHAR_H = 372, STAGE = 880, MAXSEP = 1060;
const D2R = Math.PI / 180;
const FA = "'Cairo','Tahoma','Segoe UI',sans-serif";
const FE = "'Teko','Impact','Arial Narrow',sans-serif";
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
let DPR = 1, SC = 1, OX = 0, OY = 0, TOUCH_ON = false;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth, h = window.innerHeight;
  if (TOUCH_ON) DPR = Math.max(1, Math.min(DPR, 1800 / Math.max(1, w)));
  SC = Math.min(w / VW, h / VH);
  cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  OX = (w - VW * SC) / 2 * DPR; OY = (h - VH * SC) / 2 * DPR;
}
addEventListener('resize', () => { resize(); if (typeof tcLayout === 'function') tcLayout(); }); resize();

const RR = Math.random;
const rrnd = (a, b) => a + RR() * (b - a);
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const pick = a => a[(Math.random() * a.length) | 0];

// ================= CHARACTERS =================
const CHARS = [
  { name: 'الزعيم', en: 'AL-ZAEEM', h: 0.82, tag: 'قبضة الشوارع', hp: 1.08, dmg: 1.14, spd: 0.96, color: '#ff4d3d', stats: [4, 3, 5], quote: 'قلت لك لا تلعب معي!' },
  { name: 'الوحش', en: 'AL-WAHSH', tag: 'عضلات من حديد', hp: 1.0, dmg: 1.12, spd: 0.93, color: '#ff2a55', stats: [5, 3, 4], quote: 'روح تمرّن وتعال!' },
  { name: 'الكابتن', en: 'CAPTAIN', tag: 'سرعة البرق', hp: 0.94, dmg: 0.95, spd: 1.15, color: '#f2f2f2', stats: [3, 5, 3], quote: 'أسرع منك بمليون مرة' },
  { name: 'الدكتور', en: 'THE DOCTOR', tag: 'العقل المدبّر', hp: 1.0, dmg: 1.03, spd: 1.0, color: '#e6c37a', stats: [4, 4, 4], quote: 'حسبتها قبل لا تبدأ' },
  { name: 'الحارس', en: 'THE KEEPER', tag: 'ما يعدّي منه شي', hp: 1.03, dmg: 1.06, spd: 1.03, color: '#ffd21f', stats: [3, 4, 4], quote: 'ولا كورة تعدّي… ولا ضربة!' },
  { name: 'البلدوزر', en: 'BULLDOZER', tag: 'يكسر اللي قدامه', hp: 1.12, dmg: 1.1, spd: 0.88, color: '#c9ccd6', stats: [5, 2, 5], quote: 'قلت لك وخّر من دربي' },
  { name: 'المعلّم', en: 'AL-MUALLIM', tag: 'هادي… بس لا تستفزه', hp: 1.15, dmg: 1.05, spd: 0.87, color: '#7c8f5a', stats: [4, 2, 5], quote: 'الدرس خلص… روح البيت' },
  { name: 'التنين', en: 'THE DRAGON', tag: 'أصغرهم وأخطرهم', hp: 0.92, dmg: 0.97, spd: 1.15, color: '#ff3b4a', stats: [3, 5, 3], quote: 'لا تستصغرني مرة ثانية' },
  { name: 'أبو الدجاج', en: 'ABU DAJAJ', h: 0.76, tag: 'بيض ودجاج… وفوضى', hp: 0.95, dmg: 0.96, spd: 1.1, color: '#ffc21a', stats: [3, 4, 3], quote: 'روح جيب بيض… خلصت عليك!' },
  { name: 'أبو الأسود', en: 'ABU ASWAD', h: 0.88, tag: 'ملك السياكل', hp: 1.02, dmg: 1.04, spd: 1.02, color: '#e9e9ee', stats: [4, 4, 4], quote: 'المرة الجاية جيب سيكلك معك' },
  { name: 'البوب', en: 'AL-BOB', h: 0.95, tag: 'كوراته ما تنصد… إلا من الحارس', hp: 1.12, dmg: 1.06, spd: 0.9, color: '#9aa3b5', stats: [4, 2, 5], quote: 'كورة وحدة كفاية عليك!' },
  { name: 'الطالب', en: 'THE STUDENT', h: 0.76, tag: 'شنطته مليانة مفاجآت', hp: 0.9, dmg: 0.95, spd: 1.12, color: '#3a56c8', stats: [3, 5, 3], quote: 'رحت المدرسة… ورجعت فايز!' },
  { name: 'العبد', en: 'AL-ABD', h: 0.93, eat: 1, tag: 'كاراتيه… وبعدها خبز وماي', hp: 0.98, dmg: 1.08, spd: 1.06, color: '#f2f2f2', stats: [5, 4, 2], quote: 'خلني أكمل خبزتي بعدين نتفاهم' },
  { name: 'القيمر', en: 'THE GAMER', h: 0.9, tag: 'جاب سلاحه من اللعبة', hp: 0.96, dmg: 1.0, spd: 1.08, color: '#e01b30', stats: [4, 4, 3], quote: 'GG… حظ أوفر المرة الجاية' },
  { name: 'وحش التيرسل', en: 'TERCEL BEAST', h: 0.92, tag: 'سيارته سلاحه', hp: 1.04, dmg: 1.05, spd: 1.02, color: '#ff3347', stats: [4, 4, 4], quote: 'اربط الحزام… وصلت محطتك!' },
];
const NCH = CHARS.length;

// ================= INPUT =================
const keys = new Set(); let pressQ = new Set(); let TP = new Set();
const GAME_CODES = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Backspace', 'Tab']);
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (GAME_CODES.has(e.code)) e.preventDefault();
  if (!e.repeat) pressQ.add(e.code);
  keys.add(e.code);
  audioInit();
  started = true;
});
addEventListener('keyup', e => { keys.delete(e.code); });
addEventListener('blur', () => keys.clear());
let started = false;
cv.addEventListener('pointerdown', e => { cv.focus(); audioInit(); started = true; pressQ.add('Click'); if (e.pointerType === 'mouse' && (G.scene === 'story' || G.scene === 'cup' || G.scene === 'shop' || G.scene === 'world')) { const r = cv.getBoundingClientRect(); window.__mtap = [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH]; } });

const MAPS = [
  { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], b1: ['KeyR'], b2: ['KeyT'], b3: ['KeyF'], b4: ['KeyG'], sp: ['KeyE'], dg: ['KeyQ'], ok: ['KeyR', 'Space', 'KeyF'], back: ['KeyT', 'Escape'] },
  { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], b1: ['KeyI', 'Numpad4'], b2: ['KeyO', 'Numpad5'], b3: ['KeyK', 'Numpad1'], b4: ['KeyL', 'Numpad2'], sp: ['KeyU', 'Numpad6'], dg: ['KeyY', 'Numpad3'], ok: ['KeyI', 'Enter', 'NumpadEnter', 'KeyK'], back: ['KeyO', 'Backspace'] },
];
const PADKEYS = ['up', 'down', 'left', 'right', 'b1', 'b2', 'b3', 'b4', 'sp', 'c12', 'c34', 'c13', 'c24', 'dg', 'ra', 'ok', 'back'];
// ---- Game controllers (PS4 / PS5 / Xbox via the Gamepad API, standard mapping) ----
// Square/X = 1, Triangle/Y = 2, Cross/A = 3, Circle/B = 4, R1/RB = 1+2, L2+R2 together = Finisher (القاضية), Options/Menu = pause, Share/View = swap player
const GP = { slots: {}, prev: {}, mask: {}, pt: {}, fr: 0, kind: {}, blocked: false, anyPress: false, start: false, seen: false };
const GPS = [{ h: {}, p: {} }, { h: {}, p: {} }];
function gpKind(id) {
  const s = (id || '').toLowerCase();
  if (/045e|xbox|xinput/.test(s)) return 'XBOX';
  if (/dualsense|0ce6|0df2/.test(s)) return 'PS5';
  if (/054c|sony|dualshock|playstation|wireless controller|05c4|09cc/.test(s)) return 'PS4';
  return 'PAD';
}
function gpList() {
  try { return navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(g => g && g.connected !== false) : []; }
  catch (e) { GP.blocked = true; return []; }
}
function gpAssign(g) {
  if (GP.slots[g.index] !== undefined) return;
  const used = Object.values(GP.slots); const free = [0, 1].find(x => !used.includes(x));
  if (free === undefined) return;
  GP.slots[g.index] = free; GP.kind[g.index] = gpKind(g.id); GP.seen = true;
  toast(`تم توصيل يد ${GP.kind[g.index] === 'PAD' ? 'التحكم' : GP.kind[g.index]} ← اللاعب ${free + 1}`);
}
function gpTP() { return !!(GPS[0].p.tp || GPS[1].p.tp); }   // the PS4/PS5 touchpad click
function gpOn() { return Object.keys(GP.slots).length > 0; }
function padLbl() { const k = gpSlotKind(0) || gpSlotKind(1); return k === 'XBOX' ? { x: 'A', o: 'B', s: 'X', t: 'Y', l1: 'LB', r1: 'RB', l2: 'LT', r2: 'RT', tp: 'View' } : { x: '✕', o: '○', s: '□', t: '△', l1: 'L1', r1: 'R1', l2: 'L2', r2: 'R2', tp: 'التاتش باد' }; }
function gpSlotKind(slot) { for (const i in GP.slots) if (GP.slots[i] === slot) return GP.kind[i]; return null; }
addEventListener('gamepadconnected', e => { try { gpAssign(e.gamepad); } catch (er) { } });
addEventListener('gamepaddisconnected', e => {
  const sl = GP.slots[e.gamepad.index];
  if (sl !== undefined) { delete GP.slots[e.gamepad.index]; delete GP.prev[e.gamepad.index]; toast(`انفصلت يد التحكم (اللاعب ${sl + 1})`); }
});
function gpPoll() {
  GPS[0] = { h: {}, p: {} }; GPS[1] = { h: {}, p: {} }; GP.anyPress = false; GP.start = false; GP.fr++;
  for (const g of gpList()) {
    gpAssign(g);
    const sl = GP.slots[g.index]; if (sl === undefined) continue;
    const B = i => !!(g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5));
    const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
    const cur = {
      up: B(12) || ay < -0.5, down: B(13) || ay > 0.5, left: B(14) || ax < -0.5, right: B(15) || ax > 0.5,
      b1: B(2), b2: B(3), b3: B(0), b4: B(1), sp: B(10) || B(11), c12: B(5), c34: B(7), c13: B(4), dg: B(6), ra: B(6) && B(7), ok: B(0) || B(9), back: B(1), start: B(9), sel: B(8), tp: B(17),
    };
    if (G.scene === 'fight') {
      cur.c24 = B(8) || B(17);
      const M = GP.mask[g.index] || (GP.mask[g.index] = {}), pv0 = GP.prev[g.index] || {};
      for (const k in M) { if (!cur[k]) delete M[k]; else cur[k] = false; }
      const T = GP.pt[g.index] || (GP.pt[g.index] = {}), fr = GP.fr; for (const k of ['b1', 'b2', 'b3', 'b4']) if (cur[k] && !pv0[k]) T[k] = fr;
      // only presses that land within 4 frames of each other count as a slip; a quick 1-2 string still works
      for (const [a, b] of [['b1', 'b2'], ['b3', 'b4'], ['b1', 'b3'], ['b2', 'b4']]) if (cur[a] && cur[b] && Math.abs((T[a] | 0) - (T[b] | 0)) <= 4) { const drop = !pv0[b] ? b : a; M[drop] = 1; cur[drop] = false; }
    } else if (GP.mask[g.index]) GP.mask[g.index] = {};
    const pv = GP.prev[g.index] || {};
    const st = GPS[sl];
    for (const k in cur) { if (cur[k]) st.h[k] = true; if (cur[k] && !pv[k]) { st.p[k] = true; GP.anyPress = true; } }
    if (cur.start && !pv.start) GP.start = true;
    GP.prev[g.index] = cur;
    // Share / View swaps this controller to the other player (outside fights)
    if (cur.sel && !pv.sel && G.scene !== 'fight') {
      const other = Object.keys(GP.slots).find(i => +i !== g.index && GP.slots[i] === 1 - sl);
      if (other !== undefined) GP.slots[other] = sl;
      GP.slots[g.index] = 1 - sl; SFX.move();
      toast(`يد ${GP.kind[g.index] === 'PAD' ? 'التحكم' : GP.kind[g.index]} ← اللاعب ${2 - sl}`);
    }
  }
  if (TOUCH_ON) {
    const cur = {}; for (const k in TOUCH.h) cur[k] = true; for (const k of TOUCH.latch) cur[k] = true; TOUCH.latch.clear();
    cur.ok = cur.b3; cur.back = cur.b4;
    const st = GPS[0];
    for (const k in cur) { if (!cur[k]) continue; st.h[k] = true; if (!TOUCH.prev[k]) { st.p[k] = true; GP.anyPress = true; } }
    TOUCH.prev = cur;
    if (TOUCH.pause) { TOUCH.pause = false; GP.start = true; }
  }
}
function rumble(slot, strong, weak, ms) {
  if (!SET.rumble) return;
  let online = false; try { online = G.mode === 'online'; } catch (e) { }
  if (online && slot !== NET.slot) return; // online: only my own fighter shakes my phone / controller
  if (TOUCH_ON && (online || slot === 0) && strong > 0.25) try { navigator.vibrate && navigator.vibrate(Math.min(ms, 220)); } catch (e) { }
  let list; try { list = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return; }
  for (const i in GP.slots) if (online || GP.slots[i] === slot) {
    const g = list[i]; const va = g && g.vibrationActuator;
    try { if (va && va.playEffect) va.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => { }); } catch (e) { }
  }
}
let TOAST = null;
function toast(text) { TOAST = { text, t: 0 }; }
// ---- Install as an app (PWA) + offline play ----
const GAME_VER = '1.55';
const PWA = { evt: null, standalone: false };
try { PWA.standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) { }
const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); PWA.evt = e; });
addEventListener('appinstalled', () => { PWA.evt = null; PWA.standalone = true; toast('تم تثبيت اللعبة ✓ تلقاها في الشاشة الرئيسية'); });
try {
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !netEmbedded()) {
    // every launch the service worker checks the site for a newer version (≤2.5 s) before opening the cached copy;
    // if the newer version arrives later, the game reloads itself on the title screen (or as soon as you return to it)
    const updNow = () => { if (window.__updReloading) return; window.__updReloading = true; toast('جاري تحميل التحديث الجديد…'); setTimeout(() => location.reload(), 600); };
    window.__updReady = () => { let sc = null; try { sc = G.scene; } catch (e) { } if (!sc || sc === 'boot' || sc === 'title') updNow(); else { window.__updPending = true; toast('نزل تحديث جديد ✨ يتحمّل لما ترجع للقائمة'); } };
    addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => { try { reg.update(); } catch (e) { } }).catch(() => { }));
    navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.t === 'upd') window.__updReady(); });
    let hadCtl = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtl) window.__updReady(); hadCtl = true; });
  }
} catch (e) { }
function pwaInstall() {
  if (PWA.standalone) { toast('اللعبة مثبتة على جهازك ✓'); return; }
  if (PWA.evt) { const e = PWA.evt; PWA.evt = null; try { e.prompt(); } catch (er) { } return; }
  G.pwaHelp = netEmbedded() || !/^https?:$/.test(location.protocol) ? 'embed' : IS_IOS ? 'ios' : 'other';
}
const PWA_HELP = {
  ios: ['في الآيفون والآيباد:', '1) افتح رابط اللعبة في Safari', '2) اضغط زر المشاركة ⬆️ تحت', '3) اختر «إضافة إلى الشاشة الرئيسية»'],
  other: ['من قائمة المتصفح ⋮ فوق', 'اختر «تثبيت التطبيق»', 'أو «إضافة إلى الشاشة الرئيسية»'],
  embed: ['التثبيت ما يشتغل من داخل Claude', 'افتح اللعبة من رابط موقعك (Vercel)', 'وبعدها ثبّتها من نفس الزر'],
};
class KeyPad {
  constructor(i) { this.slot = i; this.map = MAPS[i]; this.h = {}; this.p = {}; this.cpu = false; }
  read() {
    const gs = GPS[this.slot];
    for (const k of PADKEYS) { const mk = this.map[k] || []; this.h[k] = mk.some(c => keys.has(c)) || !!gs.h[k]; this.p[k] = mk.some(c => TP.has(c)) || !!gs.p[k]; }
  }
}
const pads = [new KeyPad(0), new KeyPad(1)];
const anyP = (...codes) => codes.some(c => TP.has(c));

// ================= TOUCH CONTROLS (phones / tablets) =================
const TOUCH = { h: {}, prev: {}, latch: new Set(), pause: false, fsTried: false };
let tapQ = null;
const tcCSS = document.createElement('style');
tcCSS.textContent = `
#tc{direction:ltr;position:fixed;inset:0;z-index:5;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;display:none}
#tc.on{display:block}
#tc .b{position:absolute;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(12,15,28,.38);border:2px solid rgba(255,255,255,.26);box-sizing:border-box;color:#fff;font:800 13px Cairo,Tahoma,sans-serif;line-height:1.05;pointer-events:none;transition:transform .05s,background .05s;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
#tc .b.dn{background:rgba(255,255,255,.34);transform:scale(.9)}
#tc .b.pill{border-radius:14px}
#tc .b.sk{border-color:rgba(125,255,176,.65);color:#7dffb0}
#tc .b.sk.full{background:rgba(255,211,77,.35);border-color:#ffd34d;color:#ffd34d;box-shadow:0 0 14px rgba(255,211,77,.7)}
#tc .b.cb{border-color:rgba(255,120,120,.5)}
#tc .b.cb.cd{opacity:.45}
#tc .b.ra{background:rgba(90,90,96,.55);border:3px solid rgba(170,170,178,.75);color:rgba(235,235,240,.8);font-size:12px;filter:grayscale(1)}
#tc .b.ra.ready{background:rgba(200,0,20,.6);border-color:#ff3b4a;color:#fff;filter:none;box-shadow:0 0 18px rgba(255,30,50,.9);animation:raP .6s ease-in-out infinite alternate}
#tc .b.ra.used{opacity:.35}
@keyframes raP{from{box-shadow:0 0 8px rgba(255,30,50,.6)}to{box-shadow:0 0 26px rgba(255,60,60,1)}}
#tc .b.hide,#tc .stk.hide,#tc .knob.hide{display:none}
#tc .b svg{width:52%;height:52%;overflow:visible}
#tc .b.pill svg{width:15px;height:15px}
#tc .b b{font:700 15px Teko,Impact,sans-serif;letter-spacing:.5px}
#tc .stk{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.2);background:radial-gradient(circle,rgba(255,255,255,.07),rgba(12,15,28,.35));pointer-events:none;box-sizing:border-box}
#tc .knob{position:absolute;border-radius:50%;background:rgba(255,255,255,.3);border:2px solid rgba(255,255,255,.55);pointer-events:none;box-sizing:border-box}
#tc .stk.act{border-color:rgba(62,160,255,.7)}
#rot{position:fixed;inset:0;z-index:9;background:#05060b;color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;gap:18px;font:800 24px Cairo,Tahoma,sans-serif;text-align:center}
#rot.on{display:flex}
#rot .ph{width:46px;height:80px;border:4px solid #ff2a3a;border-radius:10px;animation:rotph 1.6s ease-in-out infinite}
@keyframes rotph{0%,20%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
#sp{position:fixed;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden;pointer-events:none}
`;
document.head.appendChild(tcCSS);
const tcRoot = document.createElement('div'); tcRoot.id = 'tc'; document.body.appendChild(tcRoot);
const rotEl = document.createElement('div'); rotEl.id = 'rot'; rotEl.innerHTML = '<div class="ph"></div><div>لف الجوال بالعرض عشان تلعب</div><div style="font-size:16px;opacity:.6">معركة الشلة</div>'; document.body.appendChild(rotEl);
const spEl = document.createElement('div'); spEl.id = 'sp'; document.body.appendChild(spEl);
const SVG = {
  sq: '<svg viewBox="-10 -10 20 20"><rect x="-6.5" y="-6.5" width="13" height="13" fill="none" stroke="#ef8ad8" stroke-width="2.4"/></svg>',
  tri: '<svg viewBox="-10 -10 20 20"><polygon points="0,-7.5 7,5.5 -7,5.5" fill="none" stroke="#46dcae" stroke-width="2.4" stroke-linejoin="round"/></svg>',
  x: '<svg viewBox="-10 -10 20 20"><path d="M-6.5,-6.5L6.5,6.5M6.5,-6.5L-6.5,6.5" stroke="#86b4ff" stroke-width="2.6" stroke-linecap="round"/></svg>',
  o: '<svg viewBox="-10 -10 20 20"><circle r="6.8" fill="none" stroke="#ff7070" stroke-width="2.4"/></svg>',
};
const TBTN = [
  { id: 'b1', html: SVG.sq, keys: ['b1'], kind: 'dia' }, { id: 'b2', html: SVG.tri, keys: ['b2'], kind: 'dia' },
  { id: 'b3', html: SVG.x, keys: ['b3'], kind: 'dia' }, { id: 'b4', html: SVG.o, keys: ['b4'], kind: 'dia' },
  { id: 'sp', html: '<span style="font-size:22px">★</span><span>مهارة</span>', keys: ['sp'], kind: 'sk', fight: true },
  { id: 'c13', html: '<b>L1</b><span>' + SVG.sq + SVG.x + '</span>', keys: ['c13'], kind: 'cb', fight: true },
  { id: 'dg', html: '<b>L2</b><span style="font-size:11px">تفادي</span>', keys: ['dg'], kind: 'cb', fight: true },
  { id: 'c12', html: '<b>R1</b><span>' + SVG.sq + SVG.tri + '</span>', keys: ['c12'], kind: 'cb', fight: true },
  { id: 'c34', html: '<b>R2</b><span>' + SVG.x + SVG.o + '</span>', keys: ['c34'], kind: 'cb', fight: true },
  { id: 'ra', html: '<span style="font-size:19px">💥</span><span>القاضية</span>', keys: ['ra'], kind: 'ra', fight: true },
  { id: 'pause', html: '<span style="font-size:17px;letter-spacing:-2px">❚❚</span>', kind: 'sys', fight: true },
  { id: 'fs', html: '<span style="font-size:19px">⛶</span>', kind: 'sys' },
];
for (const b of TBTN) { b.el = document.createElement('div'); b.el.className = 'b' + (b.kind === 'cb' ? ' pill cb' : b.kind === 'sk' ? ' sk' : b.kind === 'ra' ? ' ra' : ''); b.el.innerHTML = b.html; tcRoot.appendChild(b.el); }
const STK = { base: document.createElement('div'), knob: document.createElement('div'), cx: 0, cy: 0, R: 60, ox: 0, oy: 0, id: null, dx: 0, dy: 0 };
STK.base.className = 'stk'; STK.knob.className = 'knob'; tcRoot.appendChild(STK.base); tcRoot.appendChild(STK.knob);
const fsOK = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
function tcSafe() { const c = getComputedStyle(spEl); return ['Top', 'Right', 'Bottom', 'Left'].map(k => parseFloat(c['padding' + k]) || 0); }
function place(el, x, y, w, h) { el.style.left = (x - w / 2) + 'px'; el.style.top = (y - h / 2) + 'px'; el.style.width = w + 'px'; el.style.height = h + 'px'; }
function tcLayout() {
  if (!TOUCH_ON) return;
  const w = innerWidth, h = innerHeight, [st, sr, sb, sl] = tcSafe();
  const u = Math.min(h, w * 0.56), r = Math.max(24, Math.min(46, u * 0.098));
  const cx = w - sr - 2.9 * r, cy = h - sb - 2.85 * r, s = 1.5 * r;
  const pos = { b1: [cx - s, cy, r], b2: [cx, cy - s, r], b3: [cx, cy + s, r], b4: [cx + s, cy, r], sp: [cx - s - 2.25 * r, cy + 0.35 * r, r * 0.88], ra: [cx - s - 2.25 * r, cy - 1.95 * r, r * 0.86] };
  ['c13', 'dg', 'c12', 'c34'].forEach((k, i) => { pos[k] = [cx + (i - 1.5) * 1.3 * r, cy - s - 1.9 * r, r * 0.58]; });
  const ty = OY / DPR + 122 * SC, pr = Math.max(17, r * 0.55);
  let inFight = false; try { inFight = G.scene === 'fight' && G.fight && !G.fight.paused && !G.fight.showList; } catch (e) { }
  pos.pause = [w / 2 - pr * 1.25, ty, pr]; pos.fs = inFight ? [w / 2 + pr * 1.25, ty, pr] : [w - sr - pr - 10, st + pr + 10, pr];
  for (const b of TBTN) {
    const [x, y, rr] = pos[b.id]; b.x = x; b.y = y; b.r = rr;
    if (b.kind === 'cb') { b.w = rr * 2.1; b.h = rr * 1.75; place(b.el, x, y, b.w, b.h); }
    else place(b.el, x, y, rr * 2, rr * 2);
  }
  STK.R = 1.5 * r; STK.cx = sl + 2.7 * r; STK.cy = h - sb - 2.7 * r;
  if (STK.id === null) { STK.ox = STK.cx; STK.oy = STK.cy; }
  tcDrawStick();
}
function tcDrawStick() {
  place(STK.base, STK.ox, STK.oy, STK.R * 2, STK.R * 2);
  const kr = STK.R * 0.42; place(STK.knob, STK.ox + STK.dx, STK.oy + STK.dy, kr * 2, kr * 2);
  STK.base.classList.toggle('act', STK.id !== null);
}
const tPtr = new Map();
function tcVisible(b) { return !b.el.classList.contains('hide'); }
function tcHit(x, y) {
  const out = [];
  for (const b of TBTN) {
    if (b.kind === 'sys' || !tcVisible(b)) continue;
    if (b.kind === 'cb') { if (Math.abs(x - b.x) < b.w / 2 + 5 && Math.abs(y - b.y) < b.h / 2 + 5) out.push(b); continue; }
    const k = b.kind === 'dia' ? 1.22 : 1.06;
    if (Math.hypot(x - b.x, y - b.y) < b.r * k) out.push(b);
  }
  return out;
}
function tcSys(x, y) { for (const b of TBTN) if (b.kind === 'sys' && tcVisible(b) && Math.hypot(x - b.x, y - b.y) < b.r * 1.25) return b; return null; }
function tcUpdate() {
  const h = {};
  for (const [, pt] of tPtr) if (pt.kind === 'btn') for (const b of tcHit(pt.x, pt.y)) for (const k of b.keys) h[k] = true;
  STK.dx = 0; STK.dy = 0;
  const sp = STK.id !== null && tPtr.get(STK.id);
  if (sp) {
    let dx = sp.x - STK.ox, dy = sp.y - STK.oy; const m = Math.hypot(dx, dy);
    if (m > STK.R) { dx *= STK.R / m; dy *= STK.R / m; }
    STK.dx = dx; STK.dy = dy;
    if (m > STK.R * 0.32) { const c = dx / m, sn = dy / m; if (c > 0.4) h.right = true; if (c < -0.4) h.left = true; if (sn < -0.4) h.up = true; if (sn > 0.4) h.down = true; }
  }
  let fresh = false;
  for (const k in h) if (!TOUCH.h[k]) { TOUCH.latch.add(k); if (k[0] === 'b' || k[0] === 'c' || k === 'sp' || k === 'ra') fresh = true; }
  TOUCH.h = h;
  if (fresh && SET.rumble) try { navigator.vibrate && navigator.vibrate(9); } catch (e) { }
  for (const b of TBTN) if (b.keys) b.el.classList.toggle('dn', b.keys.some(k => h[k]));
  tcDrawStick();
}
function tryFS(force) {
  if (!force && TOUCH.fsTried) return; TOUCH.fsTried = true;
  const d = document.documentElement;
  try {
    if (force && (document.fullscreenElement || document.webkitFullscreenElement)) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    const pr = (d.requestFullscreen || d.webkitRequestFullscreen).call(d, { navigationUI: 'hide' });
    const lock = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } };
    if (pr && pr.then) pr.then(lock).catch(() => { }); else lock();
  } catch (e) { }
}
tcRoot.addEventListener('pointerdown', e => {
  e.preventDefault(); audioInit(); started = true; pressQ.add('Touch');
  const x = e.clientX, y = e.clientY;
  try { tcRoot.setPointerCapture(e.pointerId); } catch (er) { }
  const sys = tcSys(x, y);
  if (sys) { tPtr.set(e.pointerId, { kind: 'sys', x, y }); if (sys.id === 'pause') TOUCH.pause = true; else tryFS(true); return; }
  if (fsOK() && !window.__rec) tryFS(false);
  if (tcHit(x, y).length) { tPtr.set(e.pointerId, { kind: 'btn', x, y }); tcUpdate(); return; }
  if (!TOUCH.ui && x < innerWidth * 0.45 && y > innerHeight * 0.22 && !uiTapZone((x * DPR - OX) / (SC * DPR), (y * DPR - OY) / (SC * DPR))) {
    if (STK.id !== null) tPtr.delete(STK.id); // a new thumb on the stick always takes over (old one may be a lost touch)
    STK.id = e.pointerId;
    if (Math.hypot(x - STK.cx, y - STK.cy) < STK.R * 1.6) { STK.ox = STK.cx; STK.oy = STK.cy; }
    else { STK.ox = clamp(x, STK.R + 4, innerWidth * 0.45); STK.oy = clamp(y, STK.R + 4, innerHeight - STK.R - 4); }
    tPtr.set(e.pointerId, { kind: 'stick', x, y }); tcUpdate(); return;
  }
  tPtr.set(e.pointerId, { kind: 'tap', x, y });
  pressQ.add('Click'); tapQ = [(x * DPR - OX) / (SC * DPR), (y * DPR - OY) / (SC * DPR)];
}, { passive: false });
tcRoot.addEventListener('pointermove', e => { const pt = tPtr.get(e.pointerId); if (!pt) return; pt.x = e.clientX; pt.y = e.clientY; if (pt.kind === 'btn' || pt.kind === 'stick') tcUpdate(); });
const tcEnd = e => { const pt = tPtr.get(e.pointerId); if (!pt) return; tPtr.delete(e.pointerId); if (STK.id === e.pointerId) { STK.id = null; STK.ox = STK.cx; STK.oy = STK.cy; } tcUpdate(); };
tcRoot.addEventListener('pointerup', tcEnd); tcRoot.addEventListener('pointercancel', tcEnd); tcRoot.addEventListener('lostpointercapture', tcEnd);
// Phones sometimes never send "finger lifted" (edge swipe, notification, many fingers) → the stick stayed stuck.
// Cross-check against the fingers really on the screen and drop any ghost touches.
function tcReset() { if (!tPtr.size && STK.id === null) return; tPtr.clear(); STK.id = null; STK.ox = STK.cx; STK.oy = STK.cy; tcUpdate(); }
function tcReconcile(e) {
  const list = e.touches; if (!list || !list.length) { tcReset(); return; }
  if (tPtr.size <= list.length) return;
  const left = Array.from(list, t => [t.clientX, t.clientY]); let changed = false;
  for (const [id, pt] of [...tPtr.entries()]) {
    let bi = -1, bd = 1e9; left.forEach((q, i) => { const d = Math.hypot(q[0] - pt.x, q[1] - pt.y); if (d < bd) { bd = d; bi = i; } });
    if (bi >= 0 && bd < 110) left.splice(bi, 1);
    else { tPtr.delete(id); if (STK.id === id) { STK.id = null; STK.ox = STK.cx; STK.oy = STK.cy; } changed = true; }
  }
  if (changed) tcUpdate();
}
for (const ev of ['touchstart', 'touchend', 'touchcancel']) addEventListener(ev, tcReconcile, { passive: true });
addEventListener('blur', tcReset); addEventListener('pagehide', tcReset);
document.addEventListener('visibilitychange', () => { if (document.hidden) tcReset(); });
tcRoot.addEventListener('contextmenu', e => e.preventDefault());
// menu areas a finger should tap (character tiles, outfits, story chapters) even on the joystick side of the screen
function uiTapZone(gx, gy) {
  try {
    if (G.scene === 'select' && G.sel) { const S = G.sel;
      if (S.panel && (S.panel[0] && gx < 400 || S.panel[1] && gx > VW - 400) && gy > 130 && gy < 570) return true;
      if (gy > 170 && gy < 430 && gx > 280 && gx < 1000) return true;   // character tiles
      if (gy > 550 && gy < 600 && (gx < 330 || gx > VW - 330)) return true;   // outfits button
    }
    if (G.scene === 'story' && G.story && G.story.step === 'select' && gy > 90) return true;
    if (G.scene === 'cup' || G.scene === 'shop') return true;
    if (G.scene === 'world' && G.world && (G.world.phase === 'pick' || G.world.dlg || G.world.mapOpen || G.world.menu || G.world.sleep || G.world.cal)) return true;
    if (G.scene === 'world' && G.world && G.world.saga && (G.world.saga.say || G.world.saga.card || G.world.saga.choice || G.world.saga.retry || G.world.saga.credits)) return true;
    if (G.scene === 'title' && !G.settingsOpen && gx < 340 && gy > VH - 80) return true;   // your name/coins → wardrobe
  } catch (e) { }
  return false;
}
function enableTouch() {
  if (TOUCH_ON) return; TOUCH_ON = true; tcRoot.classList.add('on'); resize(); tcLayout();
}
let tcVisKey = '';
function tcUiOnly() { try {
    if (G.scene === 'shop' || G.scene === 'cup' || G.scene === 'story') return true;
    const W = G.world; if (G.scene === 'world' && W) { if (W.phase === 'pick' || W.dlg || W.menu || W.mapOpen || W.sleep || W.cal) return true; const S = W.saga; if (S && (S.say || S.card || S.choice || S.retry || S.credits)) return true; }
  } catch (e) { } return false; }
function tcFrame() {
  if (!TOUCH_ON) return;
  rotEl.classList.toggle('on', innerHeight > innerWidth * 1.05);
  const fight = G.scene === 'fight' && G.fight && !G.fight.paused && !G.fight.showList && !NET.menu;
  const f0 = fight ? G.fight.f[G.mode === 'online' ? NET.slot : 0] : null; // online: the buttons follow my own fighter
  const ui = !fight && tcUiOnly();
  const key = [fight, ui, G.scene === 'fight', fsOK(), f0 && f0.sk >= SKMAX, f0 && f0.cbCD > 0, f0 && f0.dgCD > 0, f0 && f0.canFin, f0 && f0.rageUsed].join();
  if (key === tcVisKey) return; tcVisKey = key; if (ui && !TOUCH.ui) tcReset(); TOUCH.ui = ui; tcLayout();
  for (const b of TBTN) {
    let show = (!b.fight || fight) && !(ui && b.kind !== 'sys'); if (b.id === 'fs' && !fsOK()) show = false; if (b.id === 'ra') { b.el.classList.toggle('ready', !!(f0 && f0.canFin)); b.el.classList.toggle('used', !!(f0 && f0.rageUsed)); }
    b.el.classList.toggle('hide', !show);
    if (b.id === 'sp') b.el.classList.toggle('full', !!(f0 && f0.sk >= SKMAX));
    if (b.kind === 'cb') b.el.classList.toggle('cd', !!(f0 && (b.id === 'dg' ? f0.dgCD > 0 : f0.cbCD > 0)));
  }
  STK.base.classList.toggle('hide', ui); STK.knob.classList.toggle('hide', ui);
  tcUpdate();
}
try { if (/[?&](m|mobile|touch)(=|&|$)/.test(location.search) || /\/mobile\/?$/.test(location.pathname)) window.FORCE_TOUCH = true; } catch (e) { }
try { if (window.FORCE_TOUCH || matchMedia('(hover: none) and (pointer: coarse)').matches) enableTouch(); } catch (e) { }
cv.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') enableTouch(); });

// ================= AUDIO =================
let AC = null, master = null, sfxG = null, musG = null, NB = null, muted = false, duckG = null, voxG = null;
function audioInit() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const comp = AC.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(AC.destination);
      master = AC.createGain(); master.gain.value = MASTER_VOL * SET.vol; master.connect(comp);
      const soft = AC.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 5200; soft.Q.value = 0.5; soft.connect(master);
      sfxG = AC.createGain(); sfxG.gain.value = 0.7; sfxG.connect(soft);
      musG = AC.createGain(); musG.gain.value = musicOn ? MUSIC_VOL : 0; duckG = AC.createGain(); duckG.connect(soft); musG.connect(duckG); voxBus();
      const len = AC.sampleRate * 1.5; NB = AC.createBuffer(1, len, AC.sampleRate);
      const d = NB.getChannelData(0); for (let i = 0; i < len; i++) d[i] = RR() * 2 - 1;
      Music.start();
    }
    if (AC.state !== 'running') { try { const r = AC.resume(); if (r && r.catch) r.catch(() => { }); } catch (e) { } }
  } catch (e) { }
}
// the voice gets its own little studio chain: no rumble, a lift where Arabic consonants live (so it stays clear on
// phone and tablet speakers), and the music steps back while someone talks
function voxBus() { const mob = TOUCH_ON || IS_IOS; voxG = AC.createGain(); voxG.gain.value = mob ? 1.3 : 1;
  const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 110; hp.Q.value = 0.7;
  const pr = AC.createBiquadFilter(); pr.type = 'peaking'; pr.frequency.value = 2700; pr.Q.value = 0.9; pr.gain.value = mob ? 4.5 : 2.5;
  const air = AC.createBiquadFilter(); air.type = 'highshelf'; air.frequency.value = 6500; air.gain.value = mob ? 2.5 : 1.5;
  voxG.connect(hp); hp.connect(pr); pr.connect(air); air.connect(master); VOX.an = AC.createAnalyser(); VOX.an.fftSize = 2048; air.connect(VOX.an); }
window.__aud = () => ({ AC, voxG, duckG, VOX, TOUCH, IS_IOS, SILENT_EL });
function voxDuck(on) { if (!duckG || !AC) return; try { duckG.gain.cancelScheduledValues(AC.currentTime); duckG.gain.setTargetAtTime(on ? 0.28 : 1, AC.currentTime, on ? 0.06 : 0.45); } catch (e) { } }
// iPhone/iPad only let a page make sound from a real tap (touchend/click, not the first touch), and a page's sound
// follows the silent switch unless it asks to be "media" like a video. Unlock on every kind of tap, ask for media audio.
const SILENT_MP3 = 'data:audio/mpeg;base64,' + "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAAFgAACbEAHR0dHSgoKCgoMzMzMz09PT09SEhISFNTU1NTXl5eXmlpaWlpc3Nzc35+fn5+iYmJiZSUlJSUnp6enp6pqamptLS0tLS/v7+/ysrKysrU1NTU39/f39/q6urq9fX19fX/////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQELwAAAAAAAAmxyOFTSgAAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
let SILENT_EL = null;
function audioUnlock() {
  audioInit(); if (!AC) return;
  try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) { }
  if (AC.state !== 'running') { try { const r = AC.resume(); if (r && r.catch) r.catch(() => { }); } catch (e) { } }
  if (!audioUnlock.k) { try { const b = AC.createBuffer(1, 1, 22050), s0 = AC.createBufferSource(); s0.buffer = b; s0.connect(AC.destination); s0.start(0); audioUnlock.k = 1; } catch (e) { } }
  if (IS_IOS && !SILENT_EL && !navigator.audioSession) { try { const a = new Audio(SILENT_MP3); a.loop = true; a.setAttribute('playsinline', ''); a.setAttribute('webkit-playsinline', ''); SILENT_EL = a; const r = a.play(); if (r && r.catch) r.catch(() => { SILENT_EL = null; }); } catch (e) { SILENT_EL = null; } }
  if (!window.__ttsU && window.speechSynthesis) { window.__ttsU = 1; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) { } }
  if (!window.VOICE_PRO && !proVoices.s && !proVoices.fail) proVoices(); else if (proVoices.fail && !window.VOICE_STORY && !storyVoices.s) storyVoices();
}
for (const ev of ['touchend', 'click', 'pointerup', 'keydown']) document.addEventListener(ev, audioUnlock, { capture: true, passive: true });
document.addEventListener('visibilitychange', () => { if (!document.hidden && AC && AC.state !== 'running') { try { const r = AC.resume(); if (r && r.catch) r.catch(() => { }); } catch (e) { } } if (document.hidden) voiceStop(); });
const MASTER_VOL = 0.55, MUSIC_VOL = 0.16;
const SET = { vol: 1, music: true, fx: true, ui: true, gong: true, voice: true, rumble: true };
try { Object.assign(SET, JSON.parse(localStorage.getItem('shilla-settings') || '{}')); } catch (e) { }
function saveSet() { try { localStorage.setItem('shilla-settings', JSON.stringify(SET)); } catch (e) { } }
let musicOn = SET.music;
function setMute(m) { muted = m; if (master) master.gain.value = m ? 0 : MASTER_VOL * SET.vol; }
function setMusic(on) { musicOn = on; SET.music = on; saveSet(); if (musG) musG.gain.value = on ? MUSIC_VOL : 0; }
function nz(dur, type, f, q, vol, t0 = 0, f2 = null, out = sfxG) {
  if (!AC) return; const t = AC.currentTime + t0;
  const s = AC.createBufferSource(); s.buffer = NB; s.playbackRate.value = rrnd(0.8, 1.2);
  const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(out); s.start(t, rrnd(0, 1)); s.stop(t + dur + 0.05);
}
const SFX_LAST = {};
function tn(type, f0, f1, dur, vol, t0 = 0, out = sfxG) {
  if (!AC) return; const t = AC.currentTime + t0;
  const o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
const SFX = {
  hit(p = 1) { nz(0.07 + 0.04 * p, 'bandpass', 1300 - 300 * p, 0.9, 0.55); tn('sine', 150, 50, 0.14 + 0.05 * p, 0.7 * Math.min(1.25, p)); },
  kick(p = 1) { nz(0.1 + 0.04 * p, 'bandpass', 900, 0.8, 0.55); tn('sine', 115, 40, 0.2, 0.8 * Math.min(1.25, p)); },
  block() { tn('triangle', 520, 380, 0.05, 0.12); nz(0.05, 'bandpass', 1600, 1, 0.22); },
  whoosh(h = 0) { nz(0.13 + h * 0.05, 'bandpass', 500, 1.4, 0.1 + h * 0.04, 0, 1500); },
  jump() { nz(0.09, 'lowpass', 700, 0.5, 0.14); },
  land() { tn('sine', 85, 45, 0.1, 0.28); },
  thud() { tn('sine', 75, 32, 0.3, 0.7); nz(0.25, 'lowpass', 350, 0.6, 0.4); },
  ko() { tn('sine', 70, 30, 1.2, 0.8); nz(1.2, 'lowpass', 700, 0.4, 0.45, 0, 80); tn('triangle', 196, 196, 1.2, 0.08); tn('triangle', 294, 294, 1.2, 0.06); },
  move() { tn('sine', 700, 700, 0.05, 0.08); },
  ok() { tn('sine', 660, 660, 0.08, 0.1); tn('sine', 880, 880, 0.12, 0.09, 0.06); },
  rage() { tn('triangle', 80, 200, 0.7, 0.18); nz(0.7, 'bandpass', 300, 1, 0.22, 0, 1500); },
  counter() { tn('triangle', 900, 600, 0.1, 0.1); },
  skill() { tn('sine', 500, 1100, 0.22, 0.1); tn('sine', 750, 1500, 0.25, 0.06, 0.05); },
  throw() { nz(0.16, 'bandpass', 700, 1.4, 0.16, 0, 1800); },
  rock() { tn('sine', 70, 32, 0.35, 0.7); nz(0.3, 'lowpass', 600, 0.6, 0.45); },
  rattle() { for (let i = 0; i < 2; i++) tn('triangle', rrnd(700, 900), rrnd(500, 650), 0.03, 0.035, i * 0.03); },
  cluck() { tn('square', rrnd(820, 900), 560, 0.05, 0.022); tn('square', rrnd(1000, 1100), 640, 0.07, 0.022, 0.08); },
  splat() { nz(0.12, 'lowpass', 900, 1.2, 0.09); tn('sine', 300, 120, 0.08, 0.04); },
  boing() { tn('sine', 180, 420, 0.12, 0.05); },
  zap() { tn('sawtooth', 1400, 300, 0.08, 0.03); tn('sine', 900, 200, 0.06, 0.03); },
  roll() { nz(0.2, 'lowpass', 250, 0.8, 0.15); },
  ready() { tn('sine', 990, 990, 0.08, 0.06); tn('sine', 1320, 1320, 0.12, 0.05, 0.07); },
  voice(k) { const v = VOICES[k]; if (v) v(); },
  gong() { tn('sine', 220, 218, 1.0, 0.16); tn('sine', 330, 328, 0.8, 0.08); tn('sine', 440, 438, 0.6, 0.05); },
};
const SFX_CAT = { move: 'ui', ok: 'ui', ready: 'ui', gong: 'gong', voice: 'voice' };
const SFX_GAP = { zap: 45, cluck: 140, splat: 60, boing: 90, whoosh: 70, rattle: 90, roll: 120, block: 50, hit: 35, kick: 35, throw: 60, land: 80, jump: 80 };
for (const k in SFX) { const fn = SFX[k]; SFX[k] = (...a) => {
  if (window.__sfxLog) window.__sfxLog.push([k, G.frame, a[0]]);
  if (!SET[SFX_CAT[k] || 'fx']) return;
  const now = performance.now(), gap = SFX_GAP[k] || 0; if (gap && SFX_LAST[k] && now - SFX_LAST[k] < gap) return; SFX_LAST[k] = now;
  fn(...a); }; }
function say(text) {
  if (window.__sfxLog) window.__sfxLog.push(['say', G.frame, text]);
  if (muted) return;
  if (/^(Round|Final|Fight|K\.O|Perfect)/.test(text)) SFX.gong();
}
function sayOld(text) {
  try {
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.85; u.pitch = 0.35; u.volume = 1;
    const v = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    const pref = v.find(v => /male|daniel|fred|alex|david|google uk english male/i.test(v.name)) || v[0];
    if (pref) u.voice = pref;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) { }
}
const Music = {
  step: 0, next: 0, timer: null, intensity: 0, bpm: 132,
  start() { this.next = AC.currentTime + 0.1; this.timer = setInterval(() => this.sched(), 25); },
  sched() {
    if (!AC) return; const spb = 60 / this.bpm / 4;
    while (this.next < AC.currentTime + 0.12) { this.play(this.step, this.next); this.next += spb; this.step = (this.step + 1) % 64; }
  },
  play(s, t) {
    const I = this.intensity, st = s % 16, bar = (s / 16) | 0;
    const roots = [45, 41, 43, 40]; const root = roots[bar];
    const hz = n => 440 * Math.pow(2, (n - 69) / 12);
    const env = (o, g, vol, dur, src) => { src = src || o; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(musG); src.start(t); src.stop(t + dur + 0.02); };
    // bass
    if ([0, 3, 6, 8, 10, 11, 14].includes(st)) {
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(root - 12 + (st === 11 ? 12 : 0));
      const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380 + 220 * I; f.Q.value = 1.5;
      const g = AC.createGain(); o.connect(f); env(f, g, 0.2, 0.18, o);
    }
    if (I > 0) {
      if (st % 4 === 0) { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.15); const g = AC.createGain(); env(o, g, 0.6, 0.18); }
      if (st === 4 || st === 12) { const s2 = AC.createBufferSource(); s2.buffer = NB; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; const g = AC.createGain(); s2.connect(f); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); f.connect(g); g.connect(musG); s2.start(t, RR()); s2.stop(t + 0.2); }
    }
    if (st % 2 === 1) { const s2 = AC.createBufferSource(); s2.buffer = NB; const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000; const g = AC.createGain(); s2.connect(f); g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04); f.connect(g); g.connect(musG); s2.start(t, RR()); s2.stop(t + 0.06); }
    // lead arp
    if (I > 0 && st % 2 === 0) {
      const arp = [0, 7, 12, 15, 12, 7, 3, 7]; const n = root + 12 + arp[(st / 2) % 8];
      const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(n);
      const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1600; const g = AC.createGain(); o.connect(f); env(f, g, 0.03, 0.14, o);
    }
  }
};

// ================= ASSETS & RIGS =================
const IMG = {};
function loadImages() {
  return Promise.all(Object.entries(ASSETS).map(([k, src]) => new Promise(res => {
    const im = new Image(); im.onload = () => { IMG[k] = im; res(); }; im.onerror = () => res(); im.src = src;
  })));
}
function tinted(img, color, alpha) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = alpha; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
  return c;
}
const PARTS = ['torso', 'uarm', 'farm', 'thigh', 'shin', 'foot'];
const RIGS = [], RIGSK = {};
// ---- outfits: switch on the character-select screen (★ / E / U / L1-R1, or tap the outfit button) ----
const OUTFITS = { 1: [{ id: '', name: 'الأساسي' }, { id: 'chef', name: 'طبّاخ', hat: 1 }] };
function outfitList(ci) { const L = OUTFITS[ci] || [{ id: '', name: 'الأساسي' }]; return L.some(o => o.lock) ? L.filter(o => !o.lock || sagaUnlocked()) : L; }
const OPW = 380, OCW = 112, OCH = 236, OCY = 236; // outfit panel geometry
function opanelCards(s, n) { const cx = s === 0 ? 200 : VW - 200, tot = n * OCW + (n - 1) * 12; return [...Array(n)].map((_, i) => [cx - tot / 2 + i * (OCW + 12), OCY]); }
function drawOutfitPanel(S, s) {
  const ci = S.cur[s], L = outfitList(ci), cx = s === 0 ? 200 : VW - 200, cur = (S.outfit[s] | 0) % L.length, col = s === 0 ? '#3ea0ff' : '#ff3b4a';
  ctx.save(); ctx.fillStyle = 'rgba(6,8,16,0.94)'; ctx.strokeStyle = col; ctx.lineWidth = 3; rrect(cx - OPW / 2, 140, OPW, 420, 18); ctx.fill(); ctx.stroke(); ctx.restore();
  txt('👕 مظاهر ' + CHARS[ci].name, cx, 172, { size: 26, weight: 900, color: '#fff' });
  txt(L.length > 1 ? L.length + ' مظاهر' : 'ما عنده مظاهر ثانية للحين', cx, 204, { size: 17, weight: 700, color: '#ffd34d' });
  opanelCards(s, L.length).forEach(([x, y], i) => {
    const on = i === cur, im = L[i].as !== undefined ? IMG['front' + (L[i].as + 1)] : imgOf('front', ci, L[i].id);
    ctx.save(); ctx.fillStyle = on ? 'rgba(255,211,77,0.18)' : 'rgba(255,255,255,0.05)'; ctx.strokeStyle = on ? '#ffd34d' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = on ? 4 : 2; rrect(x, y, OCW, OCH, 12); ctx.fill(); ctx.stroke();
    const h = OCH - 46, w = im.width * h / im.height, sc = Math.min(1, (OCW - 10) / w); ctx.drawImage(im, x + OCW / 2 - w * sc / 2, y + 6 + (h - h * sc), w * sc, h * sc); ctx.restore();
    txt(L[i].name, x + OCW / 2, y + OCH - 20, { size: 19, weight: 900, color: on ? '#ffd34d' : '#fff' });
    if (on) txt('✓', x + OCW - 16, y + 18, { size: 22, weight: 900, color: '#ffd34d', rtl: false });
  });
  txt(TOUCH_ON ? 'المس المظهر للاختيار · المس برّا للرجوع' : '◀ ▶ تنقّل  ·  ✕ تأكيد  ·  ○ رجوع', cx, 536, { size: 16, weight: 700, color: 'rgba(255,255,255,0.7)' });
}
function selCI(S, s) { const c = S.cur[s], O = outfitOf(c, S.outfit && S.outfit[s]); return O && O.as !== undefined ? O.as : c; } // an outfit can turn a fighter into another character (الوحش → الطباخ)
function outfitOf(ci, i) { const L = OUTFITS[ci]; return (L && L[(i | 0) % L.length]) || null; }
function rigFor(ci, skin) { if (!skin) return RIGS[ci]; return RIGSK[ci + skin] || (RIGSK[ci + skin] = buildRig(ci, skin)); }
function imgOf(kind, ci, skin) { return (skin && IMG[kind + (ci + 1) + skin]) || IMG[kind + (ci + 1)]; }
function drawChefHat(f) {
  const J = f.J; if (!J) return;
  const hx = J.hd[0] + J.hr * 0.18, c = f.toWorld([hx, J.hd[1] - J.hr * 0.5]), up = f.toWorld([hx, J.hd[1] - J.hr * 1.5]), side = f.toWorld([J.hd[0] + J.hr, J.hd[1]]), mid = f.toWorld(J.hd);
  const rw = Math.hypot(side[0] - mid[0], side[1] - mid[1]), ang = Math.atan2(up[1] - c[1], up[0] - c[0]) + Math.PI / 2;
  ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(ang);
  const w = rw * 1.12, bh = w * 0.3;
  ctx.fillStyle = '#f7f8fa'; ctx.strokeStyle = '#a9afba'; ctx.lineWidth = 2;
  for (const [dx, dy, r] of [[-0.32, -1.05, 0.55], [0.32, -1.05, 0.55], [0, -1.25, 0.6]]) { ctx.beginPath(); ctx.arc(dx * w, dy * w, r * w, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.fillRect(-w * 0.46, -w * 0.95, w * 0.92, w * 0.6);
  ctx.strokeStyle = '#d3d7de'; for (const dx of [-0.22, 0, 0.22]) { ctx.beginPath(); ctx.moveTo(dx * w, -w * 0.9); ctx.lineTo(dx * w, -bh); ctx.stroke(); }
  ctx.fillStyle = '#eef0f4'; ctx.strokeStyle = '#a9afba'; rrect(-w / 2, -bh, w, bh + 4, 6); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function buildRig(ci, skin = '') {
  const m = RIG[String(ci + 1)];
  const P = {};
  for (const part of PARTS.concat(m.parts.skirt ? ['skirt'] : [])) {
    const im = IMG[`c${ci + 1}${skin}_${part}`] || IMG[`c${ci + 1}_${part}`]; const o = m.parts[part];
    P[part] = { img: im, shadow: tinted(im, '#1e0430', CHARS[ci].malali ? 0.62 : 0.8), dark: tinted(im, '#0b0d1a', 0.45), flash: tinted(im, '#ffffff', 0.42), rage: tinted(im, '#ff1020', 0.35), ox: o[0], oy: o[1], hull: m.hull[part] };
  }
  const ang = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]), dist = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  const top = m.bbox[1];
  const k = CHAR_H * (CHARS[ci].h || 1) / (m.G - top);
  const fp = P.foot;
  return {
    m, P, k,
    a0: { ua: ang(m.S, m.E), fa: ang(m.E, m.H), th: ang(m.hip, m.K), sh: ang(m.K, m.A) },
    L: { ua: dist(m.S, m.E), fa: dist(m.E, m.H), th: dist(m.hip, m.K), sh: dist(m.K, m.A) },
    restHip: m.G - m.hip[1],
    toe: [fp.ox + fp.img.width - 14, (m.A[1] + m.G) / 2 + 4],
  };
}

// ================= POSES =================
const BASE = { r: 0, lean: 0, ua: 0, fa: 15, bua: 0, bfa: 15, th: 0, sh: 0, bth: 0, bsh: 0, ft: 0, bft: 0, ffl: 1, bfl: 1, dx: 0, dy: 0, fsc: 1 };
const PK = Object.keys(BASE);
const P = o => Object.assign({}, BASE, o);
const GUARD = P({ lean: 6, ua: 34, fa: 128, bua: 26, bfa: 142, th: 18, sh: 22, bth: -14, bsh: 8 });
const CROUCH = P({ dx: -48, lean: 22, ua: 36, fa: 128, bua: 28, bfa: 140, th: 80, sh: 140, bth: 74, bsh: 142 });
const JUMP = P({ lean: 8, ua: 40, fa: 120, bua: 30, bfa: 135, th: 70, sh: 110, bth: 30, bsh: 100, ffl: 0.3, bfl: 0.3 });
const LANDP = P({ lean: 14, ua: 34, fa: 120, bua: 26, bfa: 135, th: 50, sh: 85, bth: 40, bsh: 85 });
const DASHP = P({ lean: 18, ua: 40, fa: 120, bua: 28, bfa: 140, th: 40, sh: 30, bth: -35, bsh: 25 });
const BDASHP = P({ lean: -6, ua: 30, fa: 135, bua: 26, bfa: 145, th: 5, sh: 10, bth: -30, bsh: 30 });
const HITHI = P({ lean: -24, r: -3, ua: 5, fa: 70, bua: -15, bfa: 60, th: 12, sh: 18, bth: -18, bsh: 12 });
const HITLO = P({ lean: 26, ua: 20, fa: 50, bua: 10, bfa: 60, th: 30, sh: 50, bth: -10, bsh: 30 });
const CHIT = P({ dx: -48, lean: 5, ua: 10, fa: 60, bua: 5, bfa: 60, th: 80, sh: 140, bth: 74, bsh: 142 });
const BLOCK = P({ lean: -2, ua: 22, fa: 150, bua: 18, bfa: 155, th: 16, sh: 24, bth: -16, bsh: 14 });
const CBLOCK = P({ dx: -48, lean: 10, ua: 22, fa: 150, bua: 18, bfa: 155, th: 80, sh: 140, bth: 74, bsh: 142 });
const JUG = P({ r: -20, lean: -12, ua: -40, fa: 40, bua: -30, bfa: 50, th: 40, sh: 60, bth: 20, bsh: 40, ffl: 0, bfl: 0 });
const DOWN = P({ r: -90, lean: -4, ua: 10, fa: 30, bua: -10, bfa: 30, th: 14, sh: 22, bth: 30, bsh: 50, ffl: 0, bfl: 0 });
const WIN = P({ lean: -4, ua: 172, fa: 20, bua: 20, bfa: 140, th: 14, sh: 10, bth: -14, bsh: 8 });
const WIN2 = P({ lean: -8, ua: 150, fa: 40, bua: 150, bfa: 40, th: 14, sh: 10, bth: -14, bsh: 8 });
const RAGEC = P({ lean: -14, ua: 80, fa: 100, bua: 70, bfa: 110, th: 30, sh: 40, bth: -25, bsh: 30 });
const TIRED = P({ lean: 30, ua: -5, fa: 25, bua: -5, bfa: 25, th: 22, sh: 40, bth: -10, bsh: 30 });
const TAUNT = P({ lean: 0, ua: 20, fa: 150, bua: 0, bfa: 15, th: 14, sh: 10, bth: -12, bsh: 6 });

// ================= MOVES =================
// kf: [frame, overrides] cumulative from base; null => base
const MV = {
  lp: { name: 'jab', limb: 'bH', lvl: 'high', st: 6, ac: 3, rc: 11, dmg: 7, hs: 16, bs: 10, push: 13, stop: 5, r: 26, p: 0.8,
    kf: [[0, {}], [3, { bua: 60, bfa: 80, lean: 9 }], [6, { bua: 92, bfa: 2, lean: 13, dx: 8 }], [9, { bua: 92, bfa: 2 }], [14, { bua: 50, bfa: 100, lean: 8, dx: 0 }], [20, null]],
    cancel: { lp2: 1, rp: 1 } },
  lp2: { name: 'jab', limb: 'bH', lvl: 'high', st: 6, ac: 3, rc: 12, dmg: 6, hs: 16, bs: 10, push: 13, stop: 5, r: 26, p: 0.8,
    kf: [[0, { bua: 50, bfa: 100 }], [3, { bua: 70, bfa: 60, lean: 9 }], [6, { bua: 94, bfa: 0, lean: 14, dx: 10 }], [9, { bua: 94, bfa: 0 }], [15, { bua: 50, bfa: 100, lean: 8, dx: 0 }], [21, null]],
    cancel: { rp: 1 } },
  rp: { name: 'straight', limb: 'fH', lvl: 'high', st: 9, ac: 3, rc: 14, dmg: 10, hs: 18, bs: 12, push: 20, stop: 6, r: 28, p: 1.0,
    kf: [[0, {}], [5, { ua: 40, fa: 110, lean: 0, dx: -4 }], [9, { ua: 95, fa: 0, lean: 20, dx: 16, th: 30, bth: -26 }], [12, { ua: 95, fa: 0 }], [19, { ua: 60, fa: 80, lean: 10, dx: 4 }], [26, null]],
    cancel: { rk: 1, lk: 1 } },
  lk: { name: 'lowkick', limb: 'bT', lvl: 'low', st: 11, ac: 3, rc: 16, dmg: 10, hs: 18, bs: 12, push: 14, stop: 6, r: 30, p: 1.0, kick: 1,
    kf: [[0, {}], [6, { bth: 10, bsh: 70, lean: 2, bfl: 0.5 }], [11, { bth: 52, bsh: 4, lean: -10, bfl: 0, bft: 10, th: 10, sh: 14 }], [14, {}], [22, { bth: 10, bsh: 40, lean: 2, bfl: 1 }], [30, null]],
    cancel: { rk: 1 } },
  rk: { name: 'highkick', limb: 'fT', lvl: 'high', st: 15, ac: 4, rc: 20, dmg: 18, hs: 24, bs: 16, push: 34, stop: 9, r: 34, p: 1.4, kick: 1, kdCH: 1,
    kf: [[0, {}], [7, { th: 70, sh: 95, lean: -4, ffl: 0.5, bth: -6 }], [15, { r: -10, th: 112, sh: 4, lean: -14, ffl: 0, bth: 6, bsh: 0, dx: 8 }], [19, {}], [28, { r: 0, th: 55, sh: 70, lean: 0, ffl: 1, dx: 0 }], [39, null]] },
  hook: { name: 'hook', limb: 'fH', lvl: 'mid', st: 12, ac: 3, rc: 18, dmg: 14, hs: 20, bs: 14, push: 26, stop: 8, r: 30, p: 1.3, mvx: [[2, 12, 4.5]],
    kf: [[0, {}], [6, { ua: 20, fa: 90, lean: -6, dx: -6 }], [12, { ua: 85, fa: 55, lean: 26, dx: 18, th: 40, bth: -30 }], [15, {}], [23, { ua: 50, fa: 100, lean: 10, dx: 6 }], [33, null]],
    cancel: { rk: 1 } },
  upper: { name: 'uppercut', limb: 'fH', lvl: 'mid', st: 14, ac: 4, rc: 18, dmg: 16, hs: 0, bs: 14, push: 10, stop: 9, r: 32, p: 1.4, launch: 1, base: 'CROUCH',
    kf: [[0, {}], [8, { ua: 0, fa: 70, lean: 26, dx: -30 }], [14, { ua: 118, fa: 50, lean: 4, th: 20, sh: 20, bth: -4, bsh: 10, dx: 12 }], [18, { ua: 165, fa: 15, lean: -8, th: 10, sh: 10, bth: -8, bsh: 6 }], [26, { ua: 120, fa: 60, lean: 0, th: 30, sh: 40, bth: 10, bsh: 30 }], [36, { ...GUARD }]] },
  dp: { name: 'crouchjab', limb: 'bH', lvl: 'low', st: 7, ac: 3, rc: 12, dmg: 5, hs: 14, bs: 9, push: 10, stop: 5, r: 26, p: 0.7, base: 'CROUCH', crouch: 1,
    kf: [[0, {}], [4, { bua: 70, bfa: 60 }], [7, { bua: 96, bfa: 0, lean: 30, dx: -38 }], [10, {}], [16, { bua: 40, bfa: 110, lean: 22, dx: -48 }], [22, null]] },
  dk: { name: 'shin', limb: 'fT', lvl: 'low', st: 10, ac: 3, rc: 15, dmg: 8, hs: 16, bs: 11, push: 12, stop: 6, r: 30, p: 0.9, base: 'CROUCH', crouch: 1, kick: 1,
    kf: [[0, {}], [5, { th: 60, sh: 90, ffl: 0.6 }], [10, { th: 62, sh: 0, ffl: 0, ft: 20, lean: 12, bth: 80, bsh: 145 }], [13, {}], [20, { th: 75, sh: 120, ffl: 1 }], [25, null]] },
  sweep: { name: 'sweep', limb: 'fT', lvl: 'low', st: 17, ac: 5, rc: 26, dmg: 15, hs: 0, bs: 14, push: 18, stop: 8, r: 34, p: 1.3, base: 'CROUCH', crouch: 1, kick: 1, kd: 1,
    kf: [[0, {}], [8, { th: 20, sh: 130, lean: 34, ffl: 0.5, bth: 82, bsh: 150 }], [17, { th: 64, sh: 0, ffl: 0, ft: 30, lean: 30, dx: -36 }], [22, {}], [34, { th: 80, sh: 130, ffl: 1, dx: -48 }], [48, null]] },
  fkick: { name: 'frontkick', limb: 'fT', lvl: 'mid', st: 13, ac: 3, rc: 19, dmg: 13, hs: 22, bs: 14, push: 50, stop: 8, r: 32, p: 1.2, kick: 1, mvx: [[3, 13, 3]],
    kf: [[0, {}], [7, { th: 80, sh: 100, ffl: 0.4, lean: 0 }], [13, { th: 98, sh: 4, ffl: 0, ft: -10, lean: -14, dx: 8 }], [16, {}], [24, { th: 60, sh: 80, ffl: 1, lean: 0, dx: 0 }], [35, null]] },
  spin: { name: 'roundhouse', limb: 'fT', lvl: 'high', st: 19, ac: 4, rc: 24, dmg: 22, hs: 0, bs: 18, push: 30, stop: 11, r: 38, p: 1.7, kick: 1, kd: 1, mvx: [[4, 16, 5]],
    kf: [[0, {}], [10, { th: 90, sh: 120, ffl: 0.3, lean: -8, r: -6 }], [19, { r: -14, th: 108, sh: 2, lean: -16, ffl: 0, dx: 14, bth: 8, bsh: 0 }], [23, {}], [34, { r: 0, th: 60, sh: 70, lean: 0, ffl: 1, dx: 0 }], [47, null]] },
  jp: { name: 'airpunch', limb: 'fH', lvl: 'mid', st: 5, ac: 9, rc: 6, dmg: 10, hs: 18, bs: 12, push: 16, stop: 6, r: 30, p: 1.0, air: 1, base: 'JUMP',
    kf: [[0, {}], [5, { ua: 70, fa: 0, lean: 14 }], [14, {}], [20, { ua: 40, fa: 120, lean: 8 }]] },
  jk: { name: 'airkick', limb: 'fT', lvl: 'mid', st: 6, ac: 12, rc: 6, dmg: 14, hs: 22, bs: 14, push: 24, stop: 8, r: 34, p: 1.3, air: 1, kick: 1, base: 'JUMP',
    kf: [[0, {}], [6, { th: 80, sh: 4, ffl: 0, ft: -10, lean: -12, r: -8, bth: 10, bsh: 110 }], [18, {}], [24, { th: 70, sh: 110, r: 0, lean: 8 }]] },
  // ---- direction + button set (16 grounded + 4 air) ----
  // forward + □ : step-in elbow
  f1: { name: 'elbow', limb: 'fE', lvl: 'mid', st: 10, ac: 3, rc: 17, dmg: 13, hs: 20, bs: 13, push: 22, stop: 7, r: 30, p: 1.2, mvx: [[1, 11, 5]],
    kf: [[0, {}], [5, { ua: 70, fa: 150, lean: 0, dx: 0 }], [10, { ua: 96, fa: 162, lean: 22, dx: 18, th: 38, sh: 30, bth: -30 }], [13, {}], [21, { ua: 50, fa: 120, lean: 8, dx: 6 }], [30, null]] },
  // back + □ : backfist (fast, high, pushes away)
  k1: { name: 'backfist', limb: 'fH', lvl: 'high', st: 8, ac: 3, rc: 14, dmg: 9, hs: 16, bs: 11, push: 30, stop: 5, r: 26, p: 0.9,
    kf: [[0, {}], [4, { ua: 70, fa: 160, lean: -8, dx: -6, r: 4 }], [8, { ua: 100, fa: 6, lean: 12, dx: 10, r: 0, th: 26, bth: -22 }], [11, {}], [18, { ua: 50, fa: 110, lean: 4, dx: 0 }], [25, null]] },
  // back + △ : two-hand palm push (big push, makes space)
  k2: { name: 'palm', limb: 'fH', lvl: 'mid', st: 13, ac: 3, rc: 22, dmg: 11, hs: 18, bs: 18, push: 80, stop: 8, r: 34, p: 1.3, mvx: [[5, 13, 2.5]],
    kf: [[0, {}], [7, { ua: 40, fa: 140, bua: 40, bfa: 140, lean: -10, dx: -10 }], [13, { ua: 92, fa: 2, bua: 90, bfa: 4, lean: 24, dx: 18, th: 42, sh: 26, bth: -34, bsh: 10 }], [16, {}], [26, { ua: 50, fa: 100, bua: 40, bfa: 110, lean: 6, dx: 4 }], [38, null]] },
  // back + ✕ : knee to the stomach (close, fast, big stun)
  k3: { name: 'knee', limb: 'fK', lvl: 'mid', st: 9, ac: 4, rc: 16, dmg: 13, hs: 24, bs: 13, push: 14, stop: 7, r: 30, p: 1.2, kick: 1,
    kf: [[0, {}], [5, { th: 60, sh: 110, lean: 6, ffl: 0.5 }], [9, { th: 112, sh: 150, lean: -8, ffl: 0.3, dx: 10, ua: 70, fa: 70, bua: 60, bfa: 80 }], [13, {}], [20, { th: 50, sh: 70, lean: 2, dx: 0, ffl: 1 }], [29, null]] },
  // back + ○ : turning back kick (long, knocks down)
  k4: { name: 'backkick', limb: 'fT', lvl: 'mid', st: 18, ac: 4, rc: 26, dmg: 20, hs: 0, bs: 18, push: 40, stop: 10, r: 36, p: 1.7, kick: 1, kd: 1, mvx: [[4, 18, 4]],
    kf: [[0, {}], [9, { r: 6, lean: 32, th: 30, sh: 70, bth: -10, bsh: 20, ua: 10, fa: 70, dx: -6 }], [18, { r: 2, lean: 46, th: 102, sh: 0, ffl: 0, ft: -20, bth: -6, bsh: 0, dx: 14 }], [22, {}], [34, { r: 0, lean: 6, th: 40, sh: 50, ffl: 1, dx: 0 }], [48, null]] },
  // up + □ : rising anti-air punch (beats jumps)
  u1: { name: 'risingpunch', limb: 'fH', lvl: 'high', st: 9, ac: 5, rc: 18, dmg: 12, hs: 18, bs: 12, push: 12, stop: 7, r: 30, p: 1.1, aa: 1,
    kf: [[0, {}], [5, { ua: 50, fa: 120, lean: 8, th: 40, sh: 60, bth: 24, bsh: 50, dy: 6 }], [9, { ua: 122, fa: 22, lean: 4, th: 12, sh: 10, bth: -10, bsh: 6, dy: -16, dx: 14 }], [14, { ua: 160, fa: 8, lean: -6, dy: -26 }], [22, { ua: 90, fa: 90, lean: 4, dy: 0 }], [32, null]] },
  // up + △ : jumping hammer fist (slow, heavy, mid)
  u2: { name: 'hammer', limb: 'fH', lvl: 'mid', st: 18, ac: 4, rc: 22, dmg: 18, hs: 22, bs: 18, push: 20, stop: 10, r: 34, p: 1.6, kdCH: 1, mvx: [[4, 18, 2.5]],
    kf: [[0, {}], [8, { ua: 176, fa: 20, bua: 174, bfa: 20, lean: -12, dy: -28, th: 40, sh: 60, bth: 30, bsh: 60 }], [18, { ua: 82, fa: 8, bua: 76, bfa: 14, lean: 32, dy: 0, dx: 14, th: 40, sh: 40, bth: -30, bsh: 20 }], [22, {}], [32, { ua: 50, fa: 90, bua: 40, bfa: 100, lean: 16 }], [44, null]] },
  // up + ✕ : flying knee (hops forward)
  u3: { name: 'flyknee', limb: 'fK', lvl: 'mid', st: 12, ac: 5, rc: 20, dmg: 15, hs: 22, bs: 14, push: 24, stop: 8, r: 32, p: 1.4, kick: 1, mvx: [[2, 17, 7]],
    kf: [[0, {}], [5, { th: 40, sh: 80, bth: 30, bsh: 70, lean: 10, dy: 6 }], [12, { th: 118, sh: 150, bth: 10, bsh: 110, lean: -6, dy: -42, dx: 10, ua: 80, fa: 60, bua: 70, bfa: 70, ffl: 0.3, bfl: 0.3 }], [17, {}], [25, { th: 50, sh: 60, bth: 20, bsh: 40, dy: 0, lean: 6, dx: 0, ffl: 1, bfl: 1 }], [37, null]] },
  // up + ○ : somersault kick (launches)
  u4: { name: 'flipkick', limb: 'fT', lvl: 'mid', st: 13, ac: 5, rc: 26, dmg: 16, hs: 0, bs: 16, push: 12, stop: 9, r: 36, p: 1.6, kick: 1, launch: 1,
    kf: [[0, {}], [6, { th: 20, sh: 80, bth: 30, bsh: 90, lean: 6, dy: 8 }], [13, { r: -18, th: 112, sh: 4, ffl: 0, lean: -16, dy: -30, bth: 20, bsh: 60, dx: 6 }], [18, { r: -48, th: 158, sh: 10, lean: -26, dy: -52, dx: -2 }], [28, { r: -10, th: 60, sh: 90, dy: -12, lean: 0 }], [44, null]] },
  // air △ : downward hammer · air ○ : flying side kick
  jp2: { name: 'airhammer', limb: 'fH', lvl: 'mid', st: 7, ac: 8, rc: 8, dmg: 13, hs: 20, bs: 14, push: 18, stop: 7, r: 32, p: 1.2, air: 1, base: 'JUMP',
    kf: [[0, {}], [4, { ua: 176, fa: 20, bua: 170, bfa: 20, lean: -8 }], [8, { ua: 60, fa: 8, bua: 56, bfa: 12, lean: 26 }], [16, {}], [24, { ua: 40, fa: 120, lean: 8 }]] },
  jk2: { name: 'flykick', limb: 'fT', lvl: 'mid', st: 8, ac: 10, rc: 8, dmg: 17, hs: 24, bs: 16, push: 34, stop: 9, r: 36, p: 1.5, air: 1, kick: 1, base: 'JUMP',
    kf: [[0, {}], [8, { th: 96, sh: 0, ffl: 0, ft: -20, lean: -22, r: -12, bth: 60, bsh: 120, ua: 20, fa: 120 }], [18, {}], [26, { th: 70, sh: 110, r: 0, lean: 8 }]] },
  rage: { name: 'rage', limb: 'fH', lvl: 'mid', st: 26, ac: 16, rc: 34, dmg: 0, hs: 0, bs: 22, push: 30, stop: 4, r: 56, p: 1.5, rage: 1, mvx: [[26, 42, 15]],
    kf: [[0, {}], [10, { ...RAGEC }], [24, { ...RAGEC, lean: -18 }], [26, { ua: 80, fa: 50, lean: 28, dx: 10, th: 50, sh: 30, bth: -40, bsh: 30 }], [42, {}], [52, { ua: 50, fa: 100, lean: 10 }], [76, null]] },
};
// ================= SPECIAL SKILLS (charge every 10 s) =================
const SKMAX = 600;
const MOVESET = {
  n: { b1: 'lp', b2: 'rp', b3: 'lk', b4: 'rk' }, fwd: { b1: 'f1', b2: 'hook', b3: 'fkick', b4: 'spin' }, back: { b1: 'k1', b2: 'k2', b3: 'k3', b4: 'k4' },
  down: { b1: 'dp', b2: 'upper', b3: 'dk', b4: 'sweep' }, up: { b1: 'u1', b2: 'u2', b3: 'u3', b4: 'u4' }, air: { b1: 'jp', b2: 'jp2', b3: 'jk', b4: 'jk2' } };
const MOVE_AR = { lp: 'جاب سريع', rp: 'لكمة مستقيمة', lk: 'ركلة واطية', rk: 'ركلة عالية', f1: 'ضربة كوع', hook: 'هوك', fkick: 'ركلة دفع', spin: 'ركلة دائرية',
  k1: 'ظهر اليد', k2: 'دفعة الكفين', k3: 'ركبة', k4: 'ركلة خلفية', dp: 'لكمة واطية', upper: 'أبركت', dk: 'ركلة الساق', sweep: 'كسحة',
  u1: 'لكمة صاعدة', u2: 'المطرقة', u3: 'ركبة طايرة', u4: 'ركلة الشقلبة', jp: 'لكمة جوية', jp2: 'مطرقة جوية', jk: 'ركلة جوية', jk2: 'ركلة طايرة' };
const SKILL_IDS = ['sk_rush', 'sk_barrage', 'sk_slide', 'sk_cards', 'sk_hball', 'sk_rock', 'sk_roll', 'sk_cart', 'sk_chicken', 'sk_bike', 'sk_bob', 'sk_school', 'sk_karate', 'sk_blaster', 'sk_car'];
const SKILL_NAMES = ['نطة الزعيم', 'القبضات العملاقة', 'السلايد', 'أوراق اللعب', 'كرة اليد', 'رمية الحجر', 'الكرة المتدحرجة', 'عربة السوبرماركت', 'جيش الدجاج', 'رمية السيكل', 'صاروخ البوب', 'هجوم الأدوات', 'إعصار الكاراتيه', 'سلاح القيمر', 'صدمة السيارة'];
const PZ_SUMMON = { ua: 178, fa: 10, bua: 176, bfa: 10, lean: -12 };
const mixPose = (a, b, u) => { const o = {}; for (const k of PK) o[k] = lerp(a[k], b[k], u); return o; };
function barragePose(f, mt) {
  const m = f.mv, big = m.fsc || 1;
  if (mt < m.st) return Object.assign({}, GUARD, { lean: -6, ua: 30, fa: 145, bua: 26, bfa: 150, th: 30, bth: -24, fsc: 1 + (big - 1) * mt / m.st });
  const base = Object.assign({}, GUARD, { lean: 16, th: 34, sh: 30, bth: -30, bsh: 18, dx: 8, fsc: big }, m.flPose || {});
  if (mt >= m.st + m.ac) return mixPose(base, GUARD, clamp((mt - m.st - m.ac) / m.rc, 0, 1));
  const ph = ((mt - m.st) >> 1) & 1, j = Math.sin(mt * 2.3) * 9;
  if (ph === 0) { base.ua = 88 + j; base.fa = 2; base.bua = 40; base.bfa = 115; } else { base.bua = 90 + j; base.bfa = 2; base.ua = 42; base.fa = 110; }
  return base;
}
function barrageHB(f) {
  if (!f.active()) return null;
  const J = f.J, hand = J.fH[0] > J.bH[0] ? J.fH : J.bH, w = f.toWorld(hand);
  return { x: w[0], y: w[1], r: f.mv.r };
}
function barrageStep(f) {
  const m = f.mv;
  if (m.fsc && f.mt === 2) { SFX.skill(); const w = f.toWorld(f.J.fH); for (let i = 0; i < 12; i++) FX.push({ t: 'p', x: w[0], y: w[1], vx: rnd(-4, 4), vy: rnd(-4, 2), life: 18, max: 18, c: i % 2 ? '#ff2a55' : '#ffd34d', sz: rnd(3, 6) }); }
  if (f.mt < m.st || f.mt >= m.st + m.ac) return;
  if (m.fsc && f.mt % 6 === 0) G.fight.shake(4);
  if (f.mt % 2 === 0) { const w = f.toWorld(f.J.fH[0] > f.J.bH[0] ? f.J.fH : f.J.bH); FX.push({ t: 'p', x: w[0], y: w[1] + rnd(-12, 12), vx: f.facing * rnd(4, 9), vy: rnd(-1, 1), life: 8, max: 8, c: '#ffffff', sz: rnd(2, 4) }); }
  if (f.mt % 12 === 0) SFX.whoosh(0);
}
function slideStep(f) {
  const m = f.mv, e = m.st + m.ac + 5;
  if (f.mt >= 5 && f.mt < e) f.vx = f.facing * Math.max(2, (m.sp || 17) * f.C.spd - (f.mt - 5) * 0.45);
  if (f.mt >= 6 && f.mt < e - 4 && f.mt % 2 === 0) dust(f.x + f.facing * 30, 2, -f.facing);
  if (f.mt === 6) SFX.whoosh(1);
}
function cartPose(f, mt) {
  const m = f.mv, s0 = m.st, s1 = m.st + m.ac;
  if (mt < s0) return Object.assign({}, GUARD, { ua: 42, fa: 18, bua: 38, bfa: 22, lean: 10 });
  if (mt < s1) {
    const ph = mt * (m.sp || 0.45), s = Math.sin(ph), c = Math.cos(ph);
    return Object.assign({}, GUARD, { lean: 22, ua: 44, fa: 16, bua: 40, bfa: 20, th: 25 + 35 * s, sh: 20 + 45 * Math.max(0, c), bth: 25 - 35 * s, bsh: 20 + 45 * Math.max(0, -c) });
  }
  return mixPose(Object.assign({}, GUARD, { ua: 42, fa: 30, bua: 38, bfa: 30, lean: 6 }), GUARD, clamp((mt - s1) / m.rc, 0, 1));
}
function cartHandle(f) { const w = f.toWorld(f.J.fH); return [w[0] + f.facing * 6, 0]; }
const CART_L = 185;
function cartHB(f) { if (!f.active() || f.cartGone) return null; const [hx] = cartHandle(f); return { x: hx + f.facing * CART_L * 0.72, y: -105, r: 78 }; }
function cartStep(f) {
  const m = f.mv;
  if (f.mt === 2) { const [hx] = cartHandle(f); dust(hx + f.facing * 90, 12); SFX.rattle(); }
  if (f.mt >= m.st && f.mt < m.st + m.ac && f.mt % 14 === 0) SFX.rattle();
  if (f.mt >= m.st && f.mt < m.st + m.ac && f.mt % 3 === 0) { const [hx] = cartHandle(f); dust(hx + f.facing * 40, 1, -f.facing); }
  if (f.mt === m.st + m.ac - 1 && !f.cartGone) { const [hx] = cartHandle(f); f.cartGone = true; spawnProj({ kind: 'cartgone', owner: f, x: hx, y: 0, vx: f.facing * 7, vy: 0, g: 0, life: 40, noHit: true, dir: f.facing }); }
}
function cartHit(f, d, blocked, m) {
  const [hx] = cartHandle(f); f.cartGone = true;
  spawnProj({ kind: 'cartwreck', owner: f, x: hx, y: 0, vx: f.facing * (blocked ? -5 : 9), vy: -11, g: 0.6, vr: f.facing * 0.17, life: 75, noHit: true, dir: f.facing });
  if (f.mv === m) { f.mt = m.st + m.ac; f.vx = 0; } SFX.rock();
}
function rollHB(f) { if (!f.active()) return null; const bA = f.mv.bAmp; const b = bA ? Math.abs(Math.sin(f.mt * 0.16)) * bA : 0; return { x: f.x + f.facing * 25, y: f.y - 78 - b, r: 82 }; }
function rollStep(f) {
  const m = f.mv;
  if (f.mt === m.st) { dust(f.x, 14); SFX.roll(); }
  if (f.mt >= m.st && f.mt < m.st + m.ac) { f.rollAng = (f.rollAng || 0) + f.vx / 80; if (f.mt % 4 === 0) dust(f.x - f.facing * 40, 2, -f.facing); if (f.mt % 20 === 0) SFX.roll(); }
  if (f.mt === m.st + m.ac) dust(f.x, 10);
}
function rollHit(f, d, blocked, m) { if (f.mv === m) { f.mt = m.st + m.ac; f.vx = -f.facing * 4; } dust(f.x, 10); }
function rockStep(f) { if (f.mt === 12) { const w = f.toWorld(f.J.fH); dust(w[0], 10); SFX.land(); } }
function handsMid(f) { const a = f.toWorld(f.J.fH), b = f.toWorld(f.J.bH); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
const ROCK_R = 85;
const ROCK_SHAPE = Array.from({ length: 9 }, (_, i) => 0.78 + ((i * 37) % 10) / 40);
function spawnCards(f) {
  const w = f.toWorld(f.J.fH); SFX.throw();
  [-0.13, 0, 0.13].forEach((a, i) => spawnProj({ kind: 'card', owner: f, x: w[0], y: w[1], vx: f.facing * 18 * Math.cos(a), vy: 18 * Math.sin(a), r: 18, life: 70, suit: '♠♥♦'[i], vr: f.facing * 0.25,
    m: { dmg: 5.5, lvl: 'mid', hs: 14, bs: 8, push: 10, stop: 4, p: 0.7 } }));
}
function spawnHandball(f) {
  const w = f.toWorld(f.J.fH); SFX.throw();
  spawnProj({ kind: 'hball', power: 1, big: 1, owner: f, x: w[0], y: w[1], vx: f.facing * 25, vy: -1.2, g: 0.05, r: 27, life: 80, vr: f.facing * 0.6, tr: [], m: { dmg: 21, lvl: 'mid', hs: 28, bs: 16, push: 56, stop: 13, p: 1.9, kd: 1 } });
  finRing(w[0], w[1], '#ffd34d', 120, 14); finBurst(w[0], w[1], 14, ['#fff6c8', '#ffd34d', '#ff8a2a'], 8, 5); if (G.fight) G.fight.shake(5);
}
// ---- second skill (⬇ + ★): الوحش throws a frying pan, الزعيم throws a computer mouse
const SK2_CD = 240;
const SKILL2 = { 0: 'sk2_mouse', 1: 'sk2_pan' };
const SKILL2_NAMES = { 0: 'رمية الماوس', 1: 'رمية المقلاة' };
const SKILL2_LINE = { 0: 'خذ الماوس!', 1: 'خذ المقلاة!' };
function spawnPan(f) {
  const w = f.toWorld(f.J.fH); SFX.throw(); SFX.whoosh(1);
  spawnProj({ kind: 'pan', owner: f, x: w[0], y: w[1] - 10, vx: f.facing * 16, vy: -6.5, g: 0.32, r: 30, life: 100, vr: f.facing * 0.42, m: { dmg: 16, lvl: 'mid', hs: 26, bs: 16, push: 34, stop: 10, p: 1.6, kdCH: 1 } });
}
function spawnMouse(f) {
  const w = f.toWorld(f.J.fH); SFX.throw(); SFX.zap();
  spawnProj({ kind: 'mouse', owner: f, x: w[0], y: w[1] - 6, vx: f.facing * 25, vy: -1, g: 0.05, r: 20, life: 70, vr: f.facing * 0.18, m: { dmg: 11, lvl: 'high', hs: 20, bs: 12, push: 22, stop: 7, p: 1.2 } });
}
function drawPan(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#2a2622'; rrect(r * 0.75, -r * 0.13, r * 1.35, r * 0.26, r * 0.1); ctx.fill(); ctx.fillStyle = '#6b3d1f'; rrect(r * 1.35, -r * 0.16, r * 0.8, r * 0.32, r * 0.12); ctx.fill();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, '#5a5550'); g.addColorStop(0.7, '#2b2724'); g.addColorStop(1, '#151311');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#7a756e'; ctx.lineWidth = r * 0.12; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.35, r * 0.15, -0.7, 0, 7); ctx.fill();
  ctx.restore();
}
function drawMouse(x, y, rot, r, vx, t) {
  ctx.save(); ctx.strokeStyle = '#d8dbe4'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); const d = -Math.sign(vx || 1);
  ctx.moveTo(x, y); for (let i = 1; i <= 12; i++) ctx.lineTo(x + d * i * 13, y + Math.sin(t * 0.5 + i * 0.8) * (4 + i * 1.4)); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a9aebb');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.7, r, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#5b6070'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.15); ctx.lineTo(r * 0.7, -r * 0.15); ctx.moveTo(0, -r); ctx.lineTo(0, -r * 0.15); ctx.stroke();
  ctx.fillStyle = '#e01b30'; rrect(-r * 0.1, -r * 0.75, r * 0.2, r * 0.38, r * 0.08); ctx.fill();
  ctx.restore();
}
MV.sk2_pan = { name: 'pan', skill: 1, sk2: 1, limb: null, lvl: 'mid', st: 15, ac: 1, rc: 20, p: 1.5, spawnAt: 15, spawn: spawnPan,
  kf: [[0, {}], [9, { ua: 210, fa: 50, lean: -18, bua: 30, bfa: 120, th: 30, sh: 20, bth: -26, bsh: 10 }], [15, { ua: 80, fa: 6, lean: 26, dx: 14, th: 44, bth: -34 }], [21, {}], [36, null]] };
MV.sk2_mouse = { name: 'mouse', skill: 1, sk2: 1, limb: null, lvl: 'high', st: 11, ac: 1, rc: 17, p: 1.2, spawnAt: 11, spawn: spawnMouse,
  kf: [[0, {}], [6, { ua: 150, fa: 120, lean: -10, bua: 30, bfa: 120 }], [11, { ua: 96, fa: 4, lean: 18, dx: 10, th: 34, bth: -28 }], [16, {}], [29, null]] };
function spawnRock(f) {
  const [x, y] = handsMid(f); SFX.throw();
  const op = G.fight.f[1 - f.slot], vx = 15, g = 0.5, T = Math.max(80, Math.abs(op.x - x)) / vx;
  const vy = clamp((-175 - (y - ROCK_R * 0.85) - 0.5 * g * T * T) / T, -13, 3);
  spawnProj({ kind: 'rock', owner: f, x, y: y - ROCK_R * 0.85, vx: f.facing * vx, vy, g, r: ROCK_R, life: 120, vr: f.facing * 0.1, m: { dmg: 22, lvl: 'mid', hs: 0, bs: 16, push: 30, stop: 10, p: 1.7, kd: 1, kick: 1 } });
}
const STOMP_UP = { th: 100, sh: 135, bth: 92, bsh: 135, ua: 60, fa: 130, bua: 50, bfa: 130, lean: 14, ffl: 0.3, bfl: 0.3 };
const STOMP_DN = { th: 12, sh: 6, bth: 28, bsh: 40, ua: 155, fa: 40, bua: 145, bfa: 40, lean: 2, ffl: 0, bfl: 0.4, ft: 20 };
function stompHB(f) { if (!f.jumping || f.vy < 1 || !f.active()) return null; return { x: f.x + f.facing * 8, y: f.y - 70, r: 88 }; }
function stompStep(f) {
  const m = f.mv;
  if (f.mt === m.st) { const op = G.fight.f[1 - f.slot], T = 2 * 23.5 / 0.92; f.vy = -23.5; f.vx = clamp((op.x - f.x) / T, -17, 17); f.y = -2; f.jumping = true; dust(f.x, 18); SFX.jump(); SFX.whoosh(1); G.fight.shake(6); }
  if (f.jumping && f.mt > m.st && f.mt % 3 === 0) FX.push({ t: 'p', x: f.x + rnd(-30, 30), y: f.y - rnd(40, 200), vx: 0, vy: -1, life: 14, max: 14, c: '#ff4d3d', sz: rnd(2, 5) });
  if (f.jumping && f.vy > 0 && f.vy < 1.5) { const op = G.fight.f[1 - f.slot]; const left = Math.max(8, (-f.y) / 14); f.vx = clamp((op.x - f.x) / left, -14, 14); }
}
function stompLand(f) { wave(f, { dmg: 7 }); wave(f, { dir: -f.facing, dmg: 7 }); G.fight.shake(26); dust(f.x, 34); SFX.thud(); SFX.rock(); for (let i = 0; i < 20; i++) { const a = rnd(Math.PI, Math.PI * 2); FX.push({ t: 'p', x: f.x + rnd(-40, 40), y: -6, vx: Math.cos(a) * rnd(3, 10), vy: Math.sin(a) * rnd(3, 9), life: 26, max: 26, c: '#b3a898', sz: rnd(3, 7) }); } }
MV.sk_rush = { name: 'stomp', skill: 1, limb: null, lvl: 'mid', st: 8, ac: 95, rc: 16, dmg: 16, hs: 0, bs: 16, push: 28, stop: 10, r: 88, p: 1.8, kd: 1, jump: 1, trail: 1, hitboxFn: stompHB, onStep: stompStep, onLand: stompLand,
  kf: [[0, {}], [7, { ...CROUCH, ua: 0, fa: 20, bua: 0, bfa: 20, lean: 30 }], [12, STOMP_UP], [36, STOMP_UP], [46, STOMP_DN], [104, STOMP_DN], [120, null]] };
MV.sk_rush_old = { name: 'rush', skill: 1, limb: 'fH', lvl: 'mid', st: 8, ac: 18, rc: 20, dmg: 4, hs: 20, bs: 14, push: 20, stop: 4, r: 52, p: 1.2, mvx: [[8, 26, 17]], trail: 1, seq: 'rush',
  kf: [[0, {}], [6, { lean: -6, ua: 20, fa: 140, bua: 20, bfa: 140, th: 40, sh: 70, bth: 30, bsh: 60 }], [8, { lean: 28, ua: 82, fa: 30, bua: 60, bfa: 100, th: 60, sh: 60, bth: -40, bsh: 40, dx: 10 }], [26, {}], [34, { lean: 10, ua: 40, fa: 110, dx: 0, th: 20, sh: 20, bth: -14, bsh: 8 }], [46, null]] };
MV.sk_barrage = { name: 'barrage', skill: 1, limb: 'fH', lvl: 'mid', st: 10, ac: 44, rc: 18, dmg: 4.4, hs: 14, bs: 7, push: 3, stop: 2, r: 56, p: 0.9, multi: 4, fsc: 1.85, mvx: [[10, 54, 2.4]], poseFn: barragePose, hitboxFn: barrageHB, onStep: barrageStep, kf: [[0, {}], [72, null]] };
MV.sk_slide = { name: 'slide', skill: 1, limb: 'fT', lvl: 'low', st: 7, ac: 22, rc: 20, dmg: 14, hs: 0, bs: 16, push: 20, stop: 8, r: 44, p: 1.3, kd: 1, kick: 1, lowp: 1, onStep: slideStep, noDecay: 1,
  kf: [[0, {}], [5, { r: -28, lean: 10, th: 30, sh: 20, bth: 0, bsh: 90, ua: -20, fa: 40, bua: -10, bfa: 40 }], [8, { r: -55, lean: 16, th: 42, sh: 0, ffl: 0, ft: 10, bth: -5, bsh: 120, bfl: 0, ua: -40, fa: 30, bua: -30, bfa: 40 }], [29, {}], [40, { r: -10, lean: 20, th: 70, sh: 120, bth: 60, bsh: 120, ffl: 1, bfl: 1, ua: 20, fa: 120, bua: 20, bfa: 130 }], [49, null]] };
MV.sk_cards = { name: 'cards', skill: 1, limb: null, lvl: 'mid', st: 14, ac: 1, rc: 18, p: 0.8, spawnAt: 14, spawn: spawnCards,
  kf: [[0, {}], [8, { ua: -40, fa: 150, lean: -12, bua: 40, bfa: 120 }], [14, { ua: 88, fa: 4, lean: 16, dx: 8 }], [20, {}], [33, null]] };
MV.sk_hball = { name: 'handball', skill: 1, limb: null, lvl: 'mid', st: 16, ac: 1, rc: 20, p: 1.2, spawnAt: 16, spawn: spawnHandball,
  onStep: f => { if (f.mt >= 3 && f.mt < 16 && f.mt % 2 === 0) { const w = f.toWorld(f.J.fH), an = rnd(0, 6.28), d = rnd(50, 80); FX.push({ t: 'p', x: w[0] + Math.cos(an) * d, y: w[1] + Math.sin(an) * d, vx: -Math.cos(an) * d / 9, vy: -Math.sin(an) * d / 9, life: 9, max: 9, c: f.mt % 4 ? '#ffd34d' : '#fff6c8', sz: rnd(3, 6) }); } },
  kf: [[0, {}], [10, { ua: 205, fa: 60, lean: -14, bua: 30, bfa: 120, th: 30, sh: 20, bth: -24, bsh: 10 }], [16, { ua: 78, fa: 4, lean: 22, dx: 10, th: 40, bth: -30 }], [22, {}], [37, null]] };
MV.sk_rock = { name: 'rock', skill: 1, limb: null, lvl: 'mid', st: 32, ac: 1, rc: 22, p: 1.5, spawnAt: 32, spawn: spawnRock, onStep: rockStep,
  kf: [[0, {}], [10, { ...CROUCH, ua: 0, fa: 5, bua: 0, bfa: 5, lean: 48 }], [14, {}], [24, { ...GUARD, ua: 175, fa: 35, bua: 172, bfa: 35, lean: -10 }], [30, { lean: -18, ua: 195, bua: 192 }], [32, { ua: 80, fa: 10, bua: 78, bfa: 10, lean: 24, dx: 12 }], [38, {}], [55, null]] };
MV.sk_roll = { name: 'roll', skill: 1, limb: 'fH', lvl: 'mid', st: 12, ac: 46, rc: 14, dmg: 16, hs: 0, bs: 16, push: 24, stop: 9, p: 1.5, launchHit: 1, ball: 1, lowp: 1, mvx: [[12, 58, 14]], hitboxFn: rollHB, onStep: rollStep, onHit: rollHit,
  kf: [[0, {}], [12, { ...CROUCH, lean: 60, ua: 60, fa: 150, bua: 60, bfa: 150 }], [58, {}], [72, null]] };
MV.sk_cart = { name: 'cart', skill: 1, limb: 'fH', lvl: 'mid', st: 10, ac: 40, rc: 16, dmg: 16, hs: 0, bs: 16, push: 30, stop: 9, p: 1.5, launchHit: 1, cart: 1, mvx: [[10, 50, 12.5]], poseFn: cartPose, hitboxFn: cartHB, onStep: cartStep, onHit: cartHit, kf: [[0, {}], [66, null]] };

// ---- أبو الدجاج: eggs & chickens ----
function chickenRun(f, o = {}) {
  const w = f.toWorld(f.J.fH); SFX.cluck();
  spawnProj(Object.assign({ kind: 'chicken', owner: f, x: f.x + f.facing * 60, y: -36, vx: f.facing * (o.sp || 11), vy: 0, r: 36, ground: 1, life: 110, vr: 0,
    m: { dmg: o.dmg || 6, lvl: 'low', hs: 16, bs: 8, push: 14, stop: 5, p: 0.9, kd: o.kd } }, o.extra || {}));
  for (let i = 0; i < 5; i++) FX.push({ t: 'p', x: w[0], y: w[1], vx: rnd(-3, 3), vy: rnd(-4, 0), life: 22, max: 22, c: '#ffffff', sz: rnd(2, 4) });
}
function eggSplat(p) {
  SFX.splat();
  const n = p.r > 25 ? 26 : 12;
  for (let i = 0; i < n; i++) { const a = rnd(0, Math.PI * 2), sp = rnd(1, p.r > 25 ? 9 : 6); FX.push({ t: 'p', x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, life: rnd(14, 26), max: 26, c: i % 3 ? '#ffc21a' : '#fff7e0', sz: rnd(3, p.r > 25 ? 8 : 5) }); }
}
function featherPuff(x, y, n = 8) { for (let i = 0; i < n; i++) FX.push({ t: 'p', x: x + rnd(-20, 20), y: y + rnd(-20, 20), vx: rnd(-3, 3), vy: rnd(-3, 1), life: 30, max: 30, c: '#ffffff', sz: rnd(3, 5) }); }
const egg = (f, o) => shoot(f, Object.assign({ kind: 'egg', r: 13, sp: 18, dmg: 7, vr: 0.3 }, o));
MV.sk_chicken = { name: 'chickens', skill: 1, limb: null, lvl: 'low', st: 12, ac: 1, rc: 32, p: 1.2, spawnAt: 12, spawn: f => chickenRun(f, { sp: 12, dmg: 7 }),
  onStep: f => { if (f.mt === 20) chickenRun(f, { sp: 13.5, dmg: 7 }); if (f.mt === 28) chickenRun(f, { sp: 15, dmg: 8, kd: 1 }); },
  kf: [[0, {}], [8, { ...PZ_SUMMON, lean: -10 }], [12, { ua: 70, fa: 10, bua: 60, bfa: 20, lean: 26, dx: 8 }], [20, { ua: 50, fa: 20, lean: 20 }], [28, { ua: 75, fa: 10, lean: 26 }], [34, {}], [45, null]] };
// ---- أبو الأسود: bikes & tires ----
function spawnBike(f) {
  const [x, y] = handsMid(f); SFX.throw();
  const op = G.fight.f[1 - f.slot], vx = 14, g = 0.5, T = Math.max(80, Math.abs(op.x - x)) / vx, R0 = 72;
  const vy = clamp((-160 - (y - R0) - 0.5 * g * T * T) / T, -14, 2);
  spawnProj({ kind: 'bike', owner: f, x, y: y - R0, vx: f.facing * vx, vy, g, r: R0, life: 120, vr: f.facing * 0.16, m: { dmg: 21, lvl: 'mid', hs: 0, bs: 16, push: 30, stop: 10, p: 1.7, kd: 1 } });
}
function bikeCrash(p) { SFX.rock(); SFX.rattle(); dust(p.x, 18); if (G.fight) G.fight.shake(12); spawnProj({ kind: 'bikewreck', owner: p.owner, x: p.x, y: Math.min(-40, p.y), vx: (p.vx || 0) * 0.4, vy: -7, g: 0.6, vr: (p.dir || 1) * 0.2, r: p.r, life: 55, noHit: true, dir: p.dir }); }
const tire = (f, o) => shoot(f, Object.assign({ kind: 'tire', r: 36, sp: 17, dmg: 10, vr: 0.35 }, o));
MV.sk_bike = { name: 'bike', skill: 1, limb: null, lvl: 'mid', st: 30, ac: 1, rc: 22, p: 1.5, spawnAt: 30, spawn: spawnBike, onStep: f => { if (f.mt === 10) { const w = f.toWorld(f.J.fH); dust(w[0], 8); SFX.rattle(); } },
  kf: [[0, {}], [10, { ...CROUCH, ua: 0, fa: 5, bua: 0, bfa: 5, lean: 46 }], [14, {}], [22, { ...GUARD, ua: 175, fa: 35, bua: 172, bfa: 35, lean: -10 }], [28, { lean: -18, ua: 195, bua: 192 }], [30, { ua: 80, fa: 10, bua: 78, bfa: 10, lean: 24, dx: 12 }], [36, {}], [53, null]] };
// ================= COMBO MOVES (two buttons together: 6 per character) =================
const COMBO_KEYS = ['12', '23', '24', '13', '14', '34'];
const CB_CD = 180; // 3 seconds between two-button moves
const PZ = {
  windup: { ua: 200, fa: 60, lean: -14, bua: 30, bfa: 120, th: 30, sh: 20, bth: -24, bsh: 10 },
  release: { ua: 78, fa: 4, lean: 22, dx: 10, th: 40, bth: -30 },
  kickwind: { th: -25, sh: 95, lean: 8, ffl: 0.4, ua: 20, fa: 130 },
  kickrel: { th: 95, sh: 4, ffl: 0, ft: -10, lean: -12, dx: 8 },
  punch: { ua: 95, fa: 0, lean: 22, dx: 16, th: 34, bth: -28 },
  pound: { ...CROUCH, ua: 40, fa: 10, bua: 30, bfa: 20, lean: 58, dx: 0 },
  upper: { ua: 165, fa: 15, lean: -8, th: 10, sh: 10, bth: -8, bsh: 6, dx: 10 },
  stompUp: { th: 75, sh: 95, ffl: 0.5, lean: -6, ua: 40, fa: 120 },
  stompDown: { th: 12, sh: 8, ffl: 1, lean: 16, ua: 30, fa: 120 },
  shoulder: { lean: 32, ua: 10, fa: 150, bua: 10, bfa: 150, th: 50, sh: 60, bth: -40, bsh: 40, dx: 12 },
  summon: { ua: 178, fa: 10, bua: 176, bfa: 10, lean: -12 },
  tuck: { th: 80, sh: 120, bth: 70, bsh: 120, lean: 30, ua: 60, fa: 150, bua: 60, bfa: 150, ffl: 0.3, bfl: 0.3 },
};
function M(o) { return Object.assign({ limb: null, lvl: 'mid', hs: 18, bs: 12, push: 18, stop: 6, r: 34, p: 1.1, dmg: 10, combo: 1 }, o); }
function projMove(st, rc, wind, rel, spawn, extra = {}) {
  return M(Object.assign({ st, ac: 1, rc, spawnAt: st, spawn, projLimit: 1, kf: [[0, {}], [Math.max(2, st - 6), wind], [st, rel], [st + 6, {}], [st + 1 + rc, null]] }, extra));
}
function dashMove(o) {
  const { st, ac, rc } = o;
  return M(Object.assign({ mvx: [[st, st + ac, o.sp]], kf: [[0, {}], [Math.max(2, st - 3), o.wind || { lean: -4, th: 30, sh: 50 }], [st, o.pose], [st + ac, {}], [st + ac + rc, null]] }, o));
}
function flurryMove(o) { return M(Object.assign({ multi: 4, poseFn: barragePose, hitboxFn: barrageHB, onStep: barrageStep, limb: 'fH', kf: [[0, {}], [o.st + o.ac + o.rc, null]] }, o)); }
function jumpMove(o) {
  const { st, ac } = o;
  return M(Object.assign({ jump: 1, onStep: (f) => { if (f.mt === st) { f.vy = o.vy; f.vx = f.facing * o.vx; f.y = -2; f.jumping = true; dust(f.x, 8); SFX.jump(); } if (o.step) o.step(f); },
    kf: [[0, {}], [st, LANDP], [st + 5, o.airPose], [st + ac, {}], [st + ac + (o.rc || 16), null]] }, o));
}
const elbowHB = f => { if (!f.active()) return null; const w = f.toWorld(f.J.farm[1][1]); return { x: w[0] + f.facing * 10, y: w[1], r: f.mv.r }; };
const kneeHB = f => { if (!f.active()) return null; const w = f.toWorld(f.J.fleg[1][1]); return { x: w[0], y: w[1], r: f.mv.r }; };
const bodyHB = (dx, dy, r) => f => { if (!f.active()) return null; return { x: f.x + f.facing * dx, y: f.hipY + dy, r }; };
const highHandHB = f => { if (!f.active()) return null; const a = f.J.fH, b = f.J.bH, w = f.toWorld(a[1] < b[1] ? a : b); return { x: w[0], y: w[1], r: f.mv.r }; };
function shoot(f, o) {
  let src = o.from === 'foot' ? f.toWorld(f.J.fT) : o.from === 'mid' ? handsMid(f) : f.toWorld(f.J.fH);
  let x = src[0], y = src[1];
  const dir = o.dir || f.facing, op = G.fight.f[1 - f.slot];
  if (o.from === 'ground') { x = f.x + dir * (o.gx || 70); y = -(o.r || 30); }
  if (o.from === 'sky') { x = clamp(op.x + (o.off || 0) * f.facing, -STAGE, STAGE); y = -780 - (o.hy || 0); }
  const a = o.ang || 0, sp = o.sp || 15;
  const vx = o.from === 'sky' ? 0 : dir * sp * Math.cos(a), vy = o.from === 'sky' ? (o.vy || 6) : (o.vy !== undefined ? o.vy : sp * Math.sin(a));
  spawnProj({ kind: o.kind, owner: f, x, y, vx, vy, g: o.g || 0, r: o.r || 18, life: o.life || 90, vr: dir * (o.vr !== undefined ? o.vr : 0.2), bounce: o.bounce, ground: o.ground, sin: o.sin, base: y, suit: o.suit, dir, col: o.col, bob: o.bob, fire: o.fire, heavy: o.heavy,
    m: { dmg: o.dmg || 8, lvl: o.lvl || 'mid', hs: o.hs || 16, bs: o.bs || 10, push: o.push || 16, stop: o.stop || 6, p: o.p || 1, kd: o.kd, launchHit: o.launch, kick: o.kick } });
}
const wave = (f, o = {}) => shoot(f, Object.assign({ kind: 'wave', from: 'ground', r: 34, sp: 11, lvl: 'low', dmg: 9, life: 55, vr: 0, kd: 1, gx: 60 }, o));
const poof = (x, y = -150) => { dust(x, 14); for (let i = 0; i < 12; i++) FX.push({ t: 'p', x: x + rnd(-40, 40), y: y + rnd(-120, 120), vx: rnd(-3, 3), vy: rnd(-3, 1), life: 26, max: 26, c: i % 2 ? '#ffffff' : '#d0102a', sz: rnd(3, 6) }); };
const quake = (f, both) => { G.fight.shake(both ? 22 : 14); SFX.rock(); dust(f.x, 22); wave(f, { dmg: both ? 11 : 9 }); if (both) wave(f, { dir: -f.facing, dmg: 11 }); };
const JUMPAIR = { th: 60, sh: 100, bth: 30, bsh: 90, lean: 6, ffl: 0.3, bfl: 0.3 };
// ---- البوب: handballs (the Keeper saves every ball he throws) ----
const bobBall = (f, o) => shoot(f, Object.assign({ kind: 'hball', r: 19, sp: 20, dmg: 9, vr: 0.35, bob: 1 }, o));
MV.sk_bob = { name: 'bobrocket', skill: 1, limb: null, lvl: 'mid', st: 22, ac: 1, rc: 22, p: 1.6, spawnAt: 22, spawn: f => { SFX.throw(); SFX.skill(); bobBall(f, { sp: 27, r: 30, dmg: 18, kd: 1, p: 1.7, fire: 1, vr: 0.5, life: 90 }); },
  onStep: f => { if (f.mt < 22 && f.mt % 3 === 0) { const w = f.toWorld(f.J.fH); FX.push({ t: 'p', x: w[0], y: w[1], vx: rnd(-2, 2), vy: rnd(-3, 0), life: 14, max: 14, c: '#ff8a2a', sz: rnd(3, 6) }); } },
  kf: [[0, {}], [14, { ua: 215, fa: 60, lean: -20, bua: 30, bfa: 120, th: 30, sh: 20, bth: -24, bsh: 10 }], [22, { ua: 78, fa: 4, lean: 26, dx: 12, th: 44, bth: -34 }], [28, {}], [44, null]] };
// ---- الطالب: pens & notebooks ----
const pen = (f, o) => shoot(f, Object.assign({ kind: 'pen', r: 11, sp: 24, dmg: 5, vr: 0, col: ['#1f4fd8', '#d41a2c', '#111111', '#1c9a3a'][(f.clock + (o.i || 0)) % 4] }, o));
const notebook = (f, o) => shoot(f, Object.assign({ kind: 'book', r: 24, sp: 15, dmg: 10, vr: 0.12, col: ['#e8a10f', '#2a7ad8', '#d43a6a'][(f.clock + (o.i || 0)) % 3] }, o));
MV.sk_school = { name: 'school', skill: 1, limb: null, lvl: 'mid', st: 8, ac: 34, rc: 18, p: 1, poseFn: barragePose, hitboxFn: () => null,
  onStep: f => { const t = f.mt - 8; if (t >= 0 && t < 34 && t % 5 === 0) { SFX.throw(); const k = t / 5; if (k === 6) notebook(f, { from: 'mid', sp: 14, r: 30, dmg: 12, kd: 1, i: k }); else if (k % 3 === 2) notebook(f, { sp: 16, ang: rnd(-0.12, 0.05), dmg: 6, i: k }); else pen(f, { ang: rnd(-0.1, 0.06), dmg: 4, i: k }); } },
  kf: [[0, {}], [60, null]] };
// ---- العبد: karate, then a bread-and-water break ----
MV.sk_karate = Object.assign(flurryMove({ st: 6, ac: 40, rc: 14, multi: 8, dmg: 3, hs: 14, bs: 7, push: 3, stop: 2, r: 40, flPose: { lean: 24, th: 50, sh: 20, bth: -40, bsh: 20 }, mvx: [[6, 46, 2.4]] }), { skill: 1, combo: 0, eatAfter: 1 });
function eatPose(f, mt) {
  if (mt < 16) return Object.assign({}, BDASHP, { lean: -10, ua: 30, fa: 140, bua: 26, bfa: 150 });
  const sit = { r: 0, lean: -6, th: 92, sh: 0, bth: 86, bsh: 8, ft: 0, bft: 0, ffl: 0.2, bfl: 0.2, bua: 20, bfa: 40, dx: 0, dy: 0 };
  if (mt < 22) return mixPose(Object.assign({}, GUARD), Object.assign({}, GUARD, sit, { ua: 40, fa: 120 }), (mt - 16) / 6);
  const m = f.mv, end = m.st - 14;
  if (mt >= end) return mixPose(Object.assign({}, GUARD, sit, { ua: 40, fa: 120 }), GUARD, clamp((mt - end) / 14, 0, 1));
  const cyc = ((mt - 22) % 40) / 40, dip = cyc < 0.35 ? Math.sin(cyc / 0.35 * Math.PI) : 0;
  const chew = cyc >= 0.5 ? Math.sin(mt * 0.9) * 4 : 0;
  return Object.assign({}, GUARD, sit, { ua: lerp(58, 78, dip), fa: lerp(150, 25, dip), lean: -6 + dip * 14 + chew * 0.3 });
}
MV.ab_eat = { name: 'eat', limb: null, lvl: 'mid', st: 150, ac: 1, rc: 1, p: 0, eat: 1, mvx: [[0, 14, -27]], poseFn: eatPose,
  onStep: f => { if (f.mt === 1) { SFX.whoosh(1); dust(f.x, 10, f.facing); } if (f.mt < 14 && f.mt % 2 === 0) dust(f.x, 2, f.facing); if (f.mt === 18) { dust(f.x, 8); SFX.land(); }
    if (f.mt >= 24 && f.mt < 136 && f.mt % 6 === 0) { const add = Math.min(f.maxHp - f.hp, f.maxHp * 0.0065); if (add > 0) { f.hp += add; f.trailHp = Math.max(f.trailHp, f.hp); } }
    if (f.mt === 24) popText('😋 خبز وماي', f.x, -300, '#ffd34d', 30); if ((f.mt - 22) % 40 === 6 && f.mt > 22) SFX.splat(); },
  kf: [[0, {}], [152, null]] };
function drawEatProps(f) {
  const m = f.mv; if (!m || !m.eat || f.mt < 18) return;
  const a = Math.min(1, (f.mt - 18) / 5) * (f.mt > m.st - 6 ? Math.max(0, (m.st - f.mt) / 6) : 1);
  ctx.save(); ctx.globalAlpha *= a;
  // cup of water on the floor
  const cx = f.x + f.facing * 120, cy = 0;
  ctx.fillStyle = 'rgba(200,225,255,0.35)'; ctx.strokeStyle = 'rgba(230,240,255,0.9)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx - 20, cy - 52); ctx.lineTo(cx + 20, cy - 52); ctx.lineTo(cx + 15, cy); ctx.lineTo(cx - 15, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(70,150,255,0.6)'; ctx.beginPath(); ctx.moveTo(cx - 18, cy - 36); ctx.lineTo(cx + 18, cy - 36); ctx.lineTo(cx + 15, cy - 2); ctx.lineTo(cx - 15, cy - 2); ctx.closePath(); ctx.fill();
  // bread in the hand
  const w = f.toWorld(f.J.fH);
  ctx.translate(w[0] + f.facing * 8, w[1] - 6); ctx.rotate(f.facing * 0.5);
  const g = ctx.createRadialGradient(-6, -6, 2, 0, 0, 26); g.addColorStop(0, '#f6d79a'); g.addColorStop(1, '#c08a3e');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 26, 18, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(120,70,20,0.35)'; for (const [x, y] of [[-8, -4], [6, 3], [-2, 7], [10, -6]]) { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); }
  ctx.restore();
}
// ---- القيمر: a game blaster appears in his hands ----
function blasterMuzzle(f) { const w = f.toWorld(f.J.fH); return [w[0] + f.facing * 70, w[1] - 14]; }
function blasterShot(f, o = {}) {
  const [x, y] = blasterMuzzle(f); SFX.zap();
  spawnProj({ kind: 'laser', owner: f, x, y, vx: f.facing * (o.sp || 30), vy: o.vy || 0, r: o.r || 12, life: 60, col: o.col || '#3cf2ff', vr: 0, m: { dmg: o.dmg || 4, lvl: o.lvl || 'mid', hs: 14, bs: 6, push: 6, stop: 3, p: 0.7, kd: o.kd } });
  FX.push({ t: 'ring', x, y, life: 8, max: 8, c: o.col || '#3cf2ff', r0: 4, r1: 30 });
}
const AIM = { ua: 92, fa: 4, bua: 86, bfa: 30, lean: 6, th: 30, sh: 20, bth: -20, bsh: 10 };
MV.sk_blaster = { name: 'blaster', skill: 1, limb: null, lvl: 'mid', st: 14, ac: 40, rc: 18, p: 1, gun: 1,
  onStep: f => { if (f.mt === 4) { SFX.skill(); const w = f.toWorld(f.J.fH); for (let i = 0; i < 14; i++) FX.push({ t: 'p', x: w[0] + f.facing * 30, y: w[1], vx: rnd(-3, 3), vy: rnd(-3, 3), life: 18, max: 18, c: i % 2 ? '#3cf2ff' : '#ff3cf0', sz: rnd(2, 5) }); }
    const t = f.mt - 14; if (t >= 0 && t < 40 && t % 6 === 0) blasterShot(f, { dmg: t === 36 ? 10 : 4, r: t === 36 ? 20 : 12, col: t === 36 ? '#ff3cf0' : '#3cf2ff', kd: t === 36 ? 1 : 0 }); },
  kf: [[0, {}], [10, AIM], [54, AIM], [62, {}], [72, null]] };

const COMBOS = [
  // 0 الزعيم — street rush
  { '12': ['ضربة البرق', dashMove({ st: 5, ac: 10, rc: 16, sp: 24, trail: 1, limb: 'fH', r: 44, dmg: 10, pose: PZ.punch })],
    '23': ['كوع الشوارع', dashMove({ st: 8, ac: 7, rc: 18, sp: 10, hitboxFn: elbowHB, r: 40, dmg: 12, kd: 1, pose: { ua: 70, fa: 165, lean: 26, dx: 14, th: 34, bth: -28 } })],
    '24': ['الركبة الطايرة', jumpMove({ st: 6, ac: 50, vy: -12, vx: 9, hitboxFn: kneeHB, r: 42, dmg: 13, launchHit: 1, airPose: { th: 120, sh: 150, ffl: 0, lean: 10, ua: 40, fa: 140, bth: -20, bsh: 60 } })],
    '13': ['كتف الثور', dashMove({ st: 10, ac: 14, rc: 20, sp: 16, hitboxFn: bodyHB(70, -230, 60), dmg: 12, push: 55, pose: PZ.shoulder })],
    '14': ['عاصفة اللكمات', flurryMove({ st: 6, ac: 30, rc: 16, multi: 5, dmg: 2.6, hs: 14, bs: 7, push: 3, stop: 2, r: 36, mvx: [[6, 36, 2]] })],
    '34': ['الرفسة الدوارة', M({ st: 12, ac: 10, rc: 18, multi: 5, limb: 'fT', r: 42, dmg: 8, kd: 1, kick: 1, mvx: [[4, 22, 4]], kf: [[0, {}], [8, { th: 80, sh: 110, r: -8, ffl: 0.3 }], [12, { r: -20, th: 130, sh: 2, lean: -18, ffl: 0 }], [17, { r: -10, th: 100, sh: 10 }], [22, { r: -22, th: 132, sh: 2 }], [30, { r: 0, th: 50, sh: 60, ffl: 1 }], [40, null]] })] },
  // 1 الوحش — power
  { '12': ['مطرقة الأرض', projMove(14, 22, { ...PZ.summon, lean: -16 }, PZ.pound, f => quake(f, false))],
    '23': ['أبركت مزدوج', M({ st: 10, ac: 12, rc: 22, multi: 6, hitboxFn: barrageHB, r: 42, dmg: 8, launch: 1, kf: [[0, {}], [6, { ...CROUCH }], [10, { ua: 118, fa: 50, lean: 4, th: 20, sh: 20, bth: -4, bsh: 10, dx: 12 }], [16, { ua: 20, fa: 120, bua: 118, bfa: 50 }], [22, { bua: 165, bfa: 15 }], [44, null]] })],
    '24': ['قبضة الوحش', M({ st: 22, ac: 4, rc: 22, limb: 'fH', r: 52, dmg: 20, kd: 1, p: 1.8, stop: 14, mvx: [[18, 26, 9]], onStep: f => { if (f.mt < 22 && f.mt % 3 === 0) spark(f.toWorld(f.J.fH)[0], f.toWorld(f.J.fH)[1], 'rage', 0); }, kf: [[0, {}], [16, { ua: -40, fa: 90, lean: -16, th: 30, bth: -20 }], [22, PZ.punch], [26, {}], [48, null]] })],
    '13': ['زلزال الوحش', jumpMove({ st: 6, ac: 60, vy: -16, vx: 6, hitboxFn: bodyHB(40, -60, 60), dmg: 12, kd: 1, onLand: f => quake(f, true), airPose: { ...PZ.summon, th: 40, sh: 80, bth: 30, bsh: 80 } })],
    '14': ['وابل المطارق', flurryMove({ st: 8, ac: 28, rc: 18, multi: 5, dmg: 2.6, hs: 14, bs: 7, push: 3, stop: 2, r: 38, flPose: { lean: 30 }, mvx: [[8, 36, 1.5]] })],
    '34': ['ركلة الفيل', M({ st: 12, ac: 4, rc: 20, limb: 'fT', r: 42, dmg: 14, push: 60, kick: 1, p: 1.5, kf: [[0, {}], [8, PZ.stompUp], [12, { th: 90, sh: 0, ft: -40, ffl: 0, lean: -14, dx: 10 }], [16, {}], [36, null]] })] },
  // 2 الكابتن — football / slides
  { '12': ['الكورة النارية', projMove(12, 18, PZ.kickwind, PZ.kickrel, f => { SFX.throw(); shoot(f, { kind: 'football', from: 'foot', sp: 20, r: 18, dmg: 10, vr: 0.4 }); })],
    '23': ['دبل سلايد', M({ st: 7, ac: 30, rc: 20, sp: 19, limb: 'fT', lvl: 'low', r: 44, dmg: 8, multi: 15, kd: 1, kick: 1, lowp: 1, noDecay: 1, onStep: slideStep, kf: MV.sk_slide.kf.map(([t, o]) => [t === 29 ? 37 : t === 40 ? 48 : t === 49 ? 57 : t, o]) })],
    '24': ['المقصية', jumpMove({ st: 5, ac: 50, vy: -15, vx: 3, limb: 'fT', r: 44, dmg: 13, launchHit: 1, kick: 1, airPose: { r: -70, th: 150, sh: 0, ffl: 0, lean: -10, bth: 20, bsh: 60, ua: -40, fa: 30 } })],
    '13': ['الكورة الطايرة', projMove(12, 18, PZ.kickwind, { ...PZ.kickrel, th: 120 }, f => { SFX.throw(); shoot(f, { kind: 'football', from: 'foot', sp: 13, ang: -0.6, g: 0.45, bounce: 0.6, r: 18, dmg: 9, life: 140, vr: 0.3 }); })],
    '14': ['الهجمة المرتدة', dashMove({ st: 6, ac: 16, rc: 20, sp: 16, limb: 'fT', r: 42, dmg: 12, kd: 1, kick: 1, trail: 1, pose: { th: 100, sh: 4, ffl: 0, lean: -12, dx: 8, ua: 30, fa: 140 } })],
    '34': ['الضربة الحرة', projMove(20, 20, { ...PZ.kickwind, th: -40, lean: 12 }, PZ.kickrel, f => { SFX.throw(); shoot(f, { kind: 'football', from: 'foot', sp: 17, r: 30, dmg: 16, kd: 1, p: 1.5, vr: 0.3 }); })] },
  // 3 الدكتور — cards & tricks
  { '12': ['مروحة الأوراق', projMove(14, 18, { ua: -40, fa: 150, lean: -12 }, { ua: 88, fa: 4, lean: 16, dx: 8 }, f => { SFX.throw(); [-0.26, -0.13, 0, 0.13, 0.26].forEach((a, i) => shoot(f, { kind: 'card', ang: a, sp: 17, dmg: 3.5, r: 16, suit: '♠♥♦♣♠'[i], vr: 0.25 })); })],
    '23': ['الجوكر', projMove(18, 20, { ua: -60, fa: 150, lean: -16 }, { ua: 90, fa: 0, lean: 18, dx: 10 }, f => { SFX.throw(); shoot(f, { kind: 'joker', sp: 11, r: 42, dmg: 16, kd: 1, p: 1.5, vr: 0.15, life: 110 }); })],
    '24': ['مطر الأوراق', projMove(14, 24, PZ.summon, { ...PZ.summon, lean: -20 }, f => { SFX.skill(); for (let i = 0; i < 5; i++) shoot(f, { kind: 'card', from: 'sky', off: (i - 2) * 55, hy: i * 60, vy: 10, g: 0.2, r: 18, dmg: 3.5, suit: '♠♥♦♣♥'[i], vr: 0.05, life: 120 }); })],
    '13': ['ورقة البرق', projMove(10, 16, { ua: -30, fa: 150 }, { ua: 92, fa: 0, lean: 18, dx: 10 }, f => { SFX.throw(); shoot(f, { kind: 'card', sp: 32, r: 18, dmg: 9, lvl: 'high', suit: '♦', vr: 0.5 }); })],
    '14': ['الأوراق الصاعدة', projMove(12, 18, { ...CROUCH, ua: 10, fa: 20 }, PZ.upper, f => { SFX.throw(); [-0.12, -0.32, -0.55].forEach((a, i) => shoot(f, { kind: 'card', ang: a, sp: 16, r: 18, dmg: 4.5, suit: '♣♠♥'[i] })); })],
    '34': ['خدعة الساحر', M({ st: 16, ac: 4, rc: 18, limb: 'fH', r: 40, dmg: 12, kd: 1, onStep: f => { if (f.mt === 8) { const op = G.fight.f[1 - f.slot]; poof(f.x); f.x = clamp(op.x + f.facing * 115, -STAGE, STAGE); f.facing = -f.facing; poof(f.x); SFX.skill(); } }, kf: [[0, {}], [8, { lean: -10, ua: 180, fa: 30 }], [10, {}], [16, PZ.punch], [20, {}], [38, null]] })] },
  // 4 الحارس — handballs & saves
  { '12': ['ثلاث كرات', projMove(14, 20, PZ.windup, PZ.release, f => { SFX.throw(); [-0.15, 0, 0.15].forEach(a => shoot(f, { kind: 'hball', ang: a, sp: 17, r: 17, dmg: 6, vr: 0.35 })); })],
    '23': ['الكرة المرتدة', projMove(14, 20, PZ.windup, { ...PZ.release, ua: 120 }, f => { SFX.throw(); shoot(f, { kind: 'hball', sp: 13, ang: -0.6, g: 0.55, bounce: 0.8, r: 19, dmg: 9, life: 140, vr: 0.35 }); })],
    '24': ['صدّة الحارس', dashMove({ st: 8, ac: 16, rc: 22, sp: 18, limb: 'fH', r: 46, dmg: 12, kd: 1, lowp: 1, pose: { r: 68, lean: 0, ua: 175, fa: 0, bua: 170, bfa: 0, th: -20, sh: 10, bth: -30, bsh: 20, ffl: 0, bfl: 0 } })],
    '13': ['رمية من القفز', jumpMove({ st: 6, ac: 50, vy: -16, vx: 4, airPose: { ...JUMPAIR, ...PZ.windup, th: 60, sh: 100 }, step: f => { if (f.mt === 16) { SFX.throw(); f.pose.ua = 60; shoot(f, { kind: 'hball', sp: 19, ang: 0.45, r: 19, dmg: 10, vr: 0.4 }); } }, projLimit: 1 })],
    '14': ['الكرة اللولبية', projMove(14, 20, PZ.windup, PZ.release, f => { SFX.throw(); shoot(f, { kind: 'hball', sp: 14, r: 19, dmg: 10, sin: [70, 0.17], vr: 0.5, life: 110 }); })],
    '34': ['قذيفة الحارس', projMove(24, 22, { ...PZ.windup, lean: -22, ua: 215 }, PZ.release, f => { SFX.throw(); shoot(f, { kind: 'hball', sp: 22, r: 34, dmg: 18, kd: 1, p: 1.6, vr: 0.3 }); }, { onStep: f => { if (f.mt < 24 && f.mt % 3 === 0) { const w = f.toWorld(f.J.fH); FX.push({ t: 'p', x: w[0], y: w[1], vx: rnd(-2, 2), vy: rnd(-2, 2), life: 14, max: 14, c: '#ffd34d', sz: 4 }); } } })] },
  // 5 البلدوزر — rocks & quakes
  { '12': ['رجمة حصى', projMove(14, 20, { ...CROUCH, ua: 0, fa: 5, lean: 45 }, PZ.release, f => { SFX.throw(); [-0.5, -0.35, -0.2].forEach((a, i) => shoot(f, { kind: 'rock', ang: a, sp: 14 - i, g: 0.5, r: 22, dmg: 6 })); })],
    '23': ['الصخرة المتدحرجة', projMove(16, 22, { ...CROUCH, lean: 40, ua: 10, fa: 10 }, { ua: 80, fa: 5, bua: 78, bfa: 5, lean: 34, dx: 10, th: 50, bth: -40 }, f => { SFX.rock(); shoot(f, { kind: 'rock', from: 'ground', gx: 110, r: 58, sp: 9, ground: 1, lvl: 'low', dmg: 15, kd: 1, vr: 0.16, life: 110 }); })],
    '24': ['الهزة الأرضية', projMove(14, 22, PZ.stompUp, PZ.stompDown, f => quake(f, false))],
    '13': ['نطحة البلدوزر', dashMove({ st: 14, ac: 22, rc: 22, sp: 13, hitboxFn: bodyHB(75, -230, 66), dmg: 16, kd: 1, push: 45, p: 1.6, pose: PZ.shoulder })],
    '14': ['رمية مزدوجة', projMove(14, 26, PZ.summon, { ua: 80, fa: 10, bua: 78, bfa: 10, lean: 24, dx: 12 }, f => { SFX.throw(); shoot(f, { kind: 'rock', from: 'mid', sp: 15, ang: -0.25, g: 0.45, r: 40, dmg: 9 }); }, { onStep: f => { if (f.mt === 24) { SFX.throw(); shoot(f, { kind: 'rock', from: 'mid', sp: 13, ang: -0.45, g: 0.45, r: 40, dmg: 9 }); } } })],
    '34': ['سقوط الصخرة', projMove(16, 24, PZ.summon, { ...PZ.summon, lean: -22 }, f => { SFX.skill(); shoot(f, { kind: 'rock', from: 'sky', vy: 4, g: 0.6, r: 80, dmg: 20, kd: 1, p: 1.8, vr: 0.05, life: 160 }); })] },
  // 6 المعلّم — rolling & belly
  { '12': ['كرة صغيرة', M({ st: 8, ac: 26, rc: 14, ball: 1, lowp: 1, dmg: 10, hs: 0, launchHit: 1, mvx: [[8, 34, 17]], hitboxFn: rollHB, onStep: rollStep, onHit: rollHit, kf: [[0, {}], [8, { ...CROUCH, lean: 60, ua: 60, fa: 150, bua: 60, bfa: 150 }], [34, {}], [48, null]] })],
    '23': ['الكرة النطّاطة', M({ st: 10, ac: 44, rc: 14, ball: 1, bAmp: 70, dmg: 12, hs: 0, launchHit: 1, mvx: [[10, 54, 10]], hitboxFn: rollHB, onStep: rollStep, onHit: rollHit, kf: [[0, {}], [10, { ...CROUCH, lean: 60, ua: 60, fa: 150, bua: 60, bfa: 150 }], [54, {}], [68, null]] })],
    '24': ['ضربة الكرش', dashMove({ st: 8, ac: 8, rc: 22, sp: 9, hitboxFn: bodyHB(85, -110, 62), dmg: 12, push: 70, p: 1.4, pose: { lean: -26, dx: 22, th: 22, bth: -32, ua: -30, fa: 30, bua: -30, bfa: 30 } })],
    '13': ['الضغطة', jumpMove({ st: 8, ac: 60, vy: -15, vx: 6, hitboxFn: bodyHB(30, -40, 72), dmg: 15, kd: 1, onLand: f => quake(f, false), airPose: PZ.tuck })],
    '14': ['الدوامة', M({ st: 10, ac: 44, rc: 14, ball: 1, lowp: 1, multi: 22, dmg: 8, hs: 18, mvx: [[10, 32, 15], [32, 54, -13]], hitboxFn: rollHB, onStep: rollStep, kf: [[0, {}], [10, { ...CROUCH, lean: 60, ua: 60, fa: 150, bua: 60, bfa: 150 }], [54, {}], [68, null]] })],
    '34': ['زلزال الكرش', jumpMove({ st: 8, ac: 70, vy: -21, vx: 2, hitboxFn: bodyHB(20, -40, 80), dmg: 14, kd: 1, onLand: f => quake(f, true), airPose: { ...PZ.tuck, lean: -10, ua: 170, bua: 170, fa: 20, bfa: 20 } })] },
  // 7 التنين — supermarket chaos
  { '12': ['رمي العلب', projMove(12, 18, PZ.windup, PZ.release, f => { SFX.throw(); [-0.45, -0.32, -0.2].forEach((a, i) => shoot(f, { kind: 'can', ang: a, sp: 14 - i, g: 0.45, r: 16, dmg: 5, vr: 0.4 })); })],
    '23': ['التفاحة السريعة', projMove(10, 16, { ua: -30, fa: 150 }, { ua: 92, fa: 0, lean: 18, dx: 10 }, f => { SFX.throw(); shoot(f, { kind: 'apple', sp: 24, r: 16, dmg: 8, vr: 0.3 }); })],
    '24': ['سباق العربة', M({ st: 8, ac: 34, rc: 16, cart: 1, dmg: 14, hs: 0, launchHit: 1, p: 1.5, mvx: [[8, 42, 17]], poseFn: cartPose, hitboxFn: cartHB, onStep: cartStep, onHit: cartHit, kf: [[0, {}], [58, null]] })],
    '13': ['العربة الطايرة', projMove(16, 22, { ...PZ.summon, lean: -18 }, { ua: 80, fa: 10, bua: 78, bfa: 10, lean: 24, dx: 12 }, f => { SFX.throw(); shoot(f, { kind: 'cartproj', from: 'mid', sp: 12, ang: -0.55, g: 0.5, r: 70, dmg: 16, kd: 1, p: 1.6, vr: 0.12, life: 120 }); })],
    '14': ['عربة من السما', projMove(14, 24, PZ.summon, { ...PZ.summon, lean: -20 }, f => { SFX.skill(); shoot(f, { kind: 'cartproj', from: 'sky', vy: 5, g: 0.7, r: 75, dmg: 18, kd: 1, p: 1.7, vr: 0.06, life: 150 }); })],
    '34': ['زحمة التخفيضات', M({ st: 8, ac: 30, rc: 16, projLimit: 1, poseFn: barragePose, hitboxFn: () => null, onStep: f => { if (f.mt >= 8 && f.mt < 38 && f.mt % 5 === 0) { SFX.throw(); const k = (f.mt / 5) % 2 ? 'can' : 'apple'; shoot(f, { kind: k, from: f.J.fH[0] > f.J.bH[0] ? 'hand' : 'mid', sp: 16, ang: rnd(-0.35, 0.05), g: 0.2, r: 16, dmg: 3.5, hs: 14, vr: 0.4 }); } }, kf: [[0, {}], [54, null]] })] },
  // 8 أبو الدجاج — eggs & chickens
  { '12': ['بيضة سريعة', projMove(10, 16, { ua: -30, fa: 150 }, { ua: 92, fa: 0, lean: 18, dx: 10 }, f => { SFX.throw(); egg(f, { sp: 23, dmg: 8 }); })],
    '23': ['رشة بيض', projMove(12, 18, PZ.windup, PZ.release, f => { SFX.throw(); [-0.5, -0.36, -0.22].forEach((a, i) => egg(f, { ang: a, sp: 14 - i, g: 0.45, dmg: 5 })); })],
    '24': ['الدجاجة الطايرة', projMove(14, 20, PZ.windup, PZ.release, f => { SFX.cluck(); shoot(f, { kind: 'chicken', sp: 10, r: 38, dmg: 12, kd: 1, sin: [45, 0.14], vr: 0, life: 120 }); })],
    '13': ['مطر البيض', projMove(14, 24, PZ.summon, { ...PZ.summon, lean: -20 }, f => { SFX.cluck(); for (let i = 0; i < 5; i++) egg(f, { from: 'sky', off: (i - 2) * 60, hy: i * 55, vy: 9, g: 0.25, r: 14, dmg: 4, vr: 0.2, life: 130 }); })],
    '14': ['البيضة العملاقة', projMove(20, 22, { ...PZ.windup, ua: 215, lean: -20 }, PZ.release, f => { SFX.throw(); egg(f, { sp: 12, r: 34, dmg: 16, kd: 1, p: 1.6, vr: 0.12, life: 120 }); })],
    '34': ['قفزة الديك', jumpMove({ st: 6, ac: 50, vy: -14, vx: 8, limb: 'fT', r: 44, dmg: 13, launchHit: 1, kick: 1, step: f => { if (f.mt === 8) { SFX.cluck(); featherPuff(f.x, -120, 12); } if (f.mt > 8 && f.mt % 5 === 0 && f.jumping) featherPuff(f.x, f.y - 120, 2); }, airPose: { th: 110, sh: 10, ffl: 0, lean: -8, ua: 150, fa: 40, bua: 140, bfa: 40, bth: 20, bsh: 80 } })] },
  // 9 أبو الأسود — bikes & tires
  { '12': ['تاير طاير', projMove(12, 18, PZ.windup, PZ.release, f => { SFX.throw(); tire(f, { sp: 18 }); })],
    '23': ['التاير المتدحرج', projMove(14, 20, { ...CROUCH, ua: 10, fa: 20, lean: 40 }, { ua: 75, fa: 5, lean: 30, dx: 10, th: 50, bth: -40 }, f => { SFX.roll(); tire(f, { from: 'ground', gx: 80, r: 40, sp: 12, ground: 1, lvl: 'low', dmg: 12, kd: 1, vr: 0.3, life: 110 }); })],
    '24': ['التاير النطّاط', projMove(12, 20, PZ.windup, { ...PZ.release, ua: 120 }, f => { SFX.throw(); tire(f, { sp: 13, ang: -0.5, g: 0.5, bounce: 0.75, r: 34, dmg: 9, life: 150, vr: 0.3 }); })],
    '13': ['سيكل من السما', projMove(16, 24, PZ.summon, { ...PZ.summon, lean: -22 }, f => { SFX.skill(); shoot(f, { kind: 'bike', from: 'sky', vy: 5, g: 0.6, r: 72, dmg: 18, kd: 1, p: 1.7, vr: 0.05, life: 160 }); })],
    '14': ['دبل تاير', projMove(12, 26, PZ.windup, PZ.release, f => { SFX.throw(); tire(f, { sp: 17, dmg: 7, r: 32 }); }, { onStep: f => { if (f.mt === 22) { SFX.roll(); tire(f, { from: 'ground', gx: 70, r: 36, sp: 13, ground: 1, lvl: 'low', dmg: 7, vr: 0.3 }); } } })],
    '34': ['ركلة البدّال', M({ st: 10, ac: 14, rc: 18, multi: 3, limb: 'fT', r: 44, dmg: 5, kick: 1, launch: 1, mvx: [[6, 24, 6]], kf: [[0, {}], [8, { th: 80, sh: 110, ffl: 0.3, lean: 4 }], [12, { th: 105, sh: 5, ffl: 0, lean: -12, dx: 6 }], [16, { th: 70, sh: 90 }], [20, { th: 110, sh: 2, ffl: 0, lean: -14 }], [24, {}], [42, null]] })] },
  // 10 البوب — handballs & weight
  { '12': ['كورة البوب', projMove(12, 18, PZ.windup, PZ.release, f => { SFX.throw(); bobBall(f, {}); })],
    '23': ['الكورة الأرضية', projMove(14, 20, PZ.windup, { ...PZ.release, ua: 60 }, f => { SFX.throw(); bobBall(f, { sp: 15, ang: 0.25, g: 0.4, bounce: 0.75, lvl: 'low', dmg: 9, life: 130 }); })],
    '24': ['دبل كورة', projMove(12, 26, PZ.windup, PZ.release, f => { SFX.throw(); bobBall(f, { sp: 19, dmg: 6, ang: -0.08 }); }, { onStep: f => { if (f.mt === 22) { SFX.throw(); bobBall(f, { sp: 21, dmg: 6, ang: 0.06 }); } } })],
    '13': ['دفشة الكرش', dashMove({ st: 8, ac: 8, rc: 22, sp: 9, hitboxFn: bodyHB(85, -130, 64), dmg: 12, push: 75, p: 1.4, pose: { lean: -24, dx: 22, th: 22, bth: -32, ua: -30, fa: 30, bua: -30, bfa: 30 } })],
    '14': ['نطة البوب', jumpMove({ st: 8, ac: 60, vy: -15, vx: 6, hitboxFn: bodyHB(30, -50, 72), dmg: 15, kd: 1, onLand: f => quake(f, false), airPose: PZ.tuck })],
    '34': ['كتف البوب', dashMove({ st: 10, ac: 14, rc: 20, sp: 15, hitboxFn: bodyHB(70, -230, 62), dmg: 13, kd: 1, push: 50, pose: PZ.shoulder })] },
  // 11 الطالب — pens & notebooks
  { '12': ['قلم سريع', projMove(9, 14, { ua: -30, fa: 150 }, { ua: 92, fa: 0, lean: 18, dx: 10 }, f => { SFX.throw(); pen(f, { sp: 28, dmg: 7 }); })],
    '23': ['ثلاث أقلام', projMove(12, 18, PZ.windup, PZ.release, f => { SFX.throw(); [-0.14, 0, 0.14].forEach((a, i) => pen(f, { ang: a, sp: 22, dmg: 4, i })); })],
    '24': ['الدفتر الطاير', projMove(12, 20, PZ.windup, PZ.release, f => { SFX.throw(); notebook(f, { sp: 14, sin: [40, 0.16], dmg: 11, kd: 1, life: 110 }); })],
    '13': ['مطر الأقلام', projMove(14, 24, PZ.summon, { ...PZ.summon, lean: -20 }, f => { SFX.skill(); for (let i = 0; i < 6; i++) pen(f, { from: 'sky', off: (i - 2.5) * 45, hy: i * 45, vy: 11, g: 0.2, dmg: 3.5, vr: 0, i, life: 120 }); })],
    '14': ['الكتاب الثقيل', projMove(20, 22, { ...PZ.windup, ua: 215, lean: -20 }, PZ.release, f => { SFX.throw(); notebook(f, { sp: 12, r: 36, dmg: 16, kd: 1, p: 1.6, heavy: 1, vr: 0.08, life: 120 }); })],
    '34': ['ضربة المسطرة', dashMove({ st: 7, ac: 10, rc: 18, sp: 14, limb: 'fH', r: 56, dmg: 11, kd: 1, ruler: 1, pose: { ua: 100, fa: 0, lean: 20, dx: 12, th: 34, bth: -28 } })] },
  // 12 العبد — karate
  { '12': ['ضربة السيف', M({ st: 10, ac: 5, rc: 18, limb: 'fH', r: 42, dmg: 12, kd: 1, mvx: [[6, 14, 5]], kf: [[0, {}], [8, { ua: 180, fa: 70, lean: -12 }], [11, { ua: 95, fa: 0, lean: 24, dx: 10, th: 36, bth: -30 }], [16, {}], [33, null]] })],
    '23': ['ركلة أمامية', M({ st: 9, ac: 5, rc: 18, limb: 'fT', r: 42, dmg: 11, push: 55, kick: 1, kf: [[0, {}], [6, { th: 95, sh: 110, ffl: 0.3, lean: -4 }], [10, { th: 95, sh: 2, ft: -40, ffl: 0, lean: -12, dx: 8 }], [15, {}], [32, null]] })],
    '24': ['الركلة الدائرية العالية', M({ st: 12, ac: 6, rc: 20, limb: 'fT', lvl: 'high', r: 46, dmg: 15, kd: 1, kick: 1, track: 1, kf: [[0, {}], [8, { th: 70, sh: 120, r: -10, ffl: 0.3 }], [13, { r: -26, th: 150, sh: 2, lean: -22, ffl: 0 }], [19, {}], [38, null]] })],
    '13': ['اللكمة المستقيمة', dashMove({ st: 5, ac: 8, rc: 16, sp: 22, trail: 1, limb: 'fH', r: 42, dmg: 11, pose: PZ.punch })],
    '14': ['سلسلة الكاراتيه', flurryMove({ st: 6, ac: 30, rc: 16, multi: 6, dmg: 2.8, hs: 14, bs: 7, push: 3, stop: 2, r: 38, flPose: { lean: 26 }, mvx: [[6, 36, 2.2]] })],
    '34': ['الركلة الطايرة', jumpMove({ st: 6, ac: 46, vy: -13, vx: 11, limb: 'fT', r: 46, dmg: 14, launchHit: 1, kick: 1, trail: 1, airPose: { r: -18, th: 110, sh: 0, ffl: 0, lean: -16, bth: 30, bsh: 120, ua: 30, fa: 140 } })] },
  // 13 القيمر — game blaster
  { '12': ['طلقة سريعة', projMove(10, 18, AIM, AIM, f => blasterShot(f, { dmg: 7, sp: 34 }), { gun: 1 })],
    '23': ['رشاش', M({ st: 10, ac: 24, rc: 16, gun: 1, projLimit: 0, onStep: f => { const t = f.mt - 10; if (t >= 0 && t < 24 && t % 4 === 0) blasterShot(f, { dmg: 2.5, r: 10, sp: 32 }); }, kf: [[0, {}], [8, AIM], [34, AIM], [50, null]] })],
    '24': ['القنبلة', projMove(14, 20, PZ.windup, PZ.release, f => { SFX.throw(); shoot(f, { kind: 'grenade', sp: 13, ang: -0.6, g: 0.5, bounce: 0.45, r: 16, dmg: 14, kd: 1, vr: 0.3, life: 70, boom: 1 }); })],
    '13': ['الشوت الكبير', projMove(22, 22, AIM, AIM, f => blasterShot(f, { dmg: 16, r: 26, sp: 22, col: '#ff3cf0', kd: 1 }), { gun: 1, onStep: f => { if (f.mt < 22 && f.mt % 2 === 0) { const [x, y] = blasterMuzzle(f); FX.push({ t: 'p', x: x + rnd(-14, 14), y: y + rnd(-14, 14), vx: 0, vy: 0, life: 8, max: 8, c: '#ff3cf0', sz: rnd(2, 5) }); } } })],
    '14': ['الطلقة الواطية', projMove(12, 18, { ...CROUCH, ua: 70, fa: 4, bua: 66, bfa: 30, lean: 10 }, { ...CROUCH, ua: 70, fa: 4, bua: 66, bfa: 30, lean: 10 }, f => blasterShot(f, { dmg: 9, lvl: 'low', vy: 0, sp: 26, kd: 1 }), { gun: 1, base: 'CROUCH' })],
    '34': ['ضربة الأخمص', dashMove({ st: 8, ac: 8, rc: 18, sp: 12, limb: 'fH', r: 50, dmg: 12, kd: 1, gun: 1, pose: { ...AIM, lean: 24, dx: 14 } })] },
];
// ================= STORY BOSSES =================
// 14 النوخذة — sea captain (ship, speedboat, wave) · 15 الرئيس — the mastermind · 16 الرئيس متحوّل — wings, red aura, eye lasers, red blast
// ================= وحش التيرسل — his white sedan, its doors and its tyres =================
function drawCarTire(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#121316'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2c2e34'; ctx.lineWidth = r * 0.1; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); ctx.lineTo(Math.cos(a) * r * 0.97, Math.sin(a) * r * 0.97); ctx.stroke(); }
  const g = ctx.createRadialGradient(-r * 0.15, -r * 0.15, r * 0.05, 0, 0, r * 0.6); g.addColorStop(0, '#f4f6f9'); g.addColorStop(0.6, '#b8bec8'); g.addColorStop(1, '#6a707b');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.58, 0, 7); ctx.fill();
  ctx.strokeStyle = '#59606b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * 0.44, 0, 7); ctx.stroke();
  ctx.fillStyle = '#3a3f48'; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, r * 0.065, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#dde1e7'; ctx.beginPath(); ctx.arc(0, 0, r * 0.13, 0, 7); ctx.fill();
  ctx.restore();
}
function drawDoor(x, y, rot, r) { // the white front door: glass on top, black trim strip, handle
  const W = r * 1.45, H = r * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -H * 0.1, 0, H); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#c6cbd1');
  ctx.fillStyle = g; ctx.strokeStyle = '#8b9199'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-W, -H * 0.05); ctx.lineTo(W, -H * 0.05); ctx.lineTo(W * 0.96, H); ctx.lineTo(-W * 0.92, H); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e9ebee'; ctx.beginPath(); ctx.moveTo(-W, -H * 0.05); ctx.lineTo(-W * 0.86, -H); ctx.lineTo(W * 0.3, -H * 0.98); ctx.lineTo(W, -H * 0.05); ctx.closePath(); ctx.fill(); ctx.stroke();
  const wg = ctx.createLinearGradient(0, -H, 0, 0); wg.addColorStop(0, '#a4c4dc'); wg.addColorStop(1, '#3c5a76');
  ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(-W * 0.88, -H * 0.12); ctx.lineTo(-W * 0.78, -H * 0.88); ctx.lineTo(W * 0.26, -H * 0.86); ctx.lineTo(W * 0.86, -H * 0.12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(-W * 0.5, -H * 0.12); ctx.lineTo(-W * 0.3, -H * 0.86); ctx.lineTo(-W * 0.1, -H * 0.86); ctx.lineTo(-W * 0.3, -H * 0.12); ctx.fill();
  ctx.fillStyle = '#1b1c20'; ctx.fillRect(-W * 0.96, H * 0.42, W * 1.92, H * 0.07);
  ctx.fillStyle = '#2a2c31'; rrect(W * 0.45, H * 0.16, W * 0.32, H * 0.07, 3); ctx.fill();
  ctx.fillStyle = '#f2f3f5'; ctx.strokeStyle = '#6f757d'; ctx.lineWidth = 2; rrect(W * 0.78, -H * 0.42, W * 0.36, H * 0.3, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2b3a48'; rrect(W * 0.84, -H * 0.37, W * 0.24, H * 0.2, 4); ctx.fill();
  ctx.strokeStyle = '#8b9199'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-W * 0.92, H); ctx.lineTo(-W * 1.05, H * 0.82); ctx.moveTo(-W * 0.95, H * 0.3); ctx.lineTo(-W * 1.08, H * 0.2); ctx.stroke();
  ctx.restore();
}
// side view, ground at y=0, front towards dir. o: driver, sp (speed lines), rev (reverse lights), noDoor, noTire, crack
function drawCar(x, dir, t, o = {}) {
  ctx.save(); ctx.translate(x, 0); ctx.scale(dir * 0.92, 0.92);
  ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.beginPath(); ctx.ellipse(0, 4, 305, 22, 0, 0, 7); ctx.fill();
  if (o.sp) { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const yy = -36 - i * 34, xx = -300 - ((t * 37 + i * 53) % 170); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 130, yy); ctx.stroke(); } }
  if (o.noTire) ctx.rotate(0.045);
  // body
  const g = ctx.createLinearGradient(0, -232, 0, -40); g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#eff1f3'); g.addColorStop(1, '#c3c8ce');
  ctx.fillStyle = g; ctx.strokeStyle = '#8b9199'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-276, -44); ctx.lineTo(-284, -112); ctx.quadraticCurveTo(-282, -138, -252, -144); ctx.lineTo(-178, -150);
  ctx.quadraticCurveTo(-140, -206, -108, -222); ctx.quadraticCurveTo(-20, -232, 52, -226); ctx.quadraticCurveTo(110, -200, 150, -152);
  ctx.quadraticCurveTo(232, -142, 266, -128); ctx.quadraticCurveTo(286, -120, 286, -96); ctx.lineTo(282, -44); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#17181b'; for (const wx of [-172, 176]) { ctx.beginPath(); ctx.arc(wx, -42, 58, Math.PI, 0); ctx.closePath(); ctx.fill(); }
  // windows + driver
  const win = () => { ctx.beginPath(); ctx.moveTo(-164, -154); ctx.quadraticCurveTo(-132, -200, -104, -212); ctx.quadraticCurveTo(-20, -220, 46, -214); ctx.quadraticCurveTo(96, -192, 134, -154); ctx.closePath(); };
  const wg = ctx.createLinearGradient(0, -222, 0, -150); wg.addColorStop(0, '#a4c4dc'); wg.addColorStop(1, '#3c5a76');
  win(); ctx.fillStyle = wg; ctx.fill();
  const im = o.driver && IMG['face' + (o.driver.ci + 1)];
  if (im) { ctx.save(); win(); ctx.clip(); ctx.translate(58, -186); ctx.scale(dir, 1); ctx.drawImage(im, -40, -40, 80, 80); ctx.restore(); }
  win(); ctx.fillStyle = 'rgba(160,200,230,0.22)'; ctx.fill();
  ctx.save(); win(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.moveTo(-120, -150); ctx.lineTo(-70, -230); ctx.lineTo(-40, -230); ctx.lineTo(-90, -150); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#e8eaee'; ctx.fillRect(-30, -218, 12, 66);
  if (o.noDoor) { ctx.fillStyle = '#1d1e23'; ctx.beginPath(); ctx.moveTo(-18, -214); ctx.quadraticCurveTo(20, -218, 46, -214); ctx.quadraticCurveTo(96, -192, 134, -154); ctx.lineTo(130, -58); ctx.lineTo(-22, -58); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5a3a2e'; rrect(-6, -150, 70, 22, 6); ctx.fill(); rrect(-14, -196, 22, 70, 6); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.arc(96, -150, 18, 0, 7); ctx.stroke();
    if (im) { ctx.save(); ctx.translate(30, -186); ctx.scale(dir, 1); ctx.drawImage(im, -34, -34, 68, 68); ctx.restore(); } }
  // windscreen edge, crack
  ctx.strokeStyle = 'rgba(70,100,130,0.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(56, -224); ctx.quadraticCurveTo(110, -198, 148, -154); ctx.stroke();
  if (o.crack) { ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6; for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.5; ctx.beginPath(); ctx.moveTo(112, -190); ctx.lineTo(112 + Math.cos(a) * 34, -190 + Math.sin(a) * 34); ctx.stroke(); } }
  // trim, doors, handles, mirror
  ctx.fillStyle = '#1b1c20'; ctx.fillRect(-268, -102, 540, 8); ctx.fillRect(-232, -54, 464, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-24, -150); ctx.lineTo(-26, -56); ctx.moveTo(136, -150); ctx.lineTo(130, -60); ctx.moveTo(-170, -148); ctx.lineTo(-168, -100); ctx.stroke();
  ctx.fillStyle = '#2a2c31'; rrect(-74, -132, 26, 7, 3); ctx.fill(); if (!o.noDoor) { rrect(84, -132, 26, 7, 3); ctx.fill(); }
  ctx.fillStyle = '#f2f3f5'; ctx.strokeStyle = '#7f858d'; rrect(128, -170, 22, 16, 4); ctx.fill(); ctx.stroke();
  // lights
  ctx.fillStyle = '#ffd9a0'; rrect(262, -126, 22, 18, 4); ctx.fill();
  ctx.fillStyle = o.rev ? '#ffffff' : '#d4142a'; rrect(-288, -130, 18, 22, 4); ctx.fill();
  if (o.rev || o.sp) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lx = o.rev ? -290 : 290, lg = ctx.createRadialGradient(lx, -117, 2, lx, -117, 70); lg.addColorStop(0, o.rev ? 'rgba(255,255,255,0.6)' : 'rgba(255,240,190,0.7)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = lg; ctx.fillRect(lx - 70, -187, 140, 140); ctx.restore(); }
  // black bumpers like the real one
  const bump = (bx, w) => { const bg = ctx.createLinearGradient(0, -100, 0, -40); bg.addColorStop(0, '#3a3d44'); bg.addColorStop(1, '#0c0c0e'); ctx.fillStyle = bg; rrect(bx, -100, w, 58, 10); ctx.fill(); };
  bump(-294, 52); bump(240, 54);
  // wheels
  const wr = (o.sp ? t * 0.55 : t * 0.08) * (o.rev ? -1 : 1);
  drawCarTire(-172, -46, wr, 46);
  if (!o.noTire) drawCarTire(176, -46, wr, 46);
  else { ctx.fillStyle = '#6b707a'; ctx.beginPath(); ctx.arc(176, -30, 20, 0, 7); ctx.fill(); ctx.fillStyle = '#3a3e45'; ctx.beginPath(); ctx.arc(176, -30, 9, 0, 7); ctx.fill(); }
  ctx.restore();
}
SFX.horn = () => { if (!SET.fx) return; tn('square', 415, 410, 0.26, 0.05); tn('square', 523, 518, 0.26, 0.04); tn('square', 415, 410, 0.18, 0.05, 0.3); tn('square', 523, 518, 0.18, 0.04, 0.3); };
SFX.engine = () => { if (!SET.fx) return; tn('sawtooth', 55, 170, 0.45, 0.07); nz(0.35, 'lowpass', 320, 0.8, 0.09); };
function carStep(f) {
  const m = f.mv, d = f.facing;
  if (f.mt === m.st - 3) { poof(f.x, -120); SFX.engine(); }
  if (f.mt === m.st) SFX.horn();
  if (f.mt >= m.st && f.mt < m.st + m.ac && f.mt % 2 === 0) dust(f.x - d * 240, 2, -d);
  if (f.mt === m.st + m.ac + 2) { poof(f.x, -120); SFX.rattle(); }
}
MV.sk_car = { name: 'car', skill: 1, limb: null, lvl: 'mid', st: 10, ac: 30, rc: 18, dmg: 17, hs: 0, bs: 16, push: 70, stop: 12, p: 1.8, kd: 1, car: 1, mvx: [[10, 40, 19]], onStep: carStep,
  hitboxFn: f => f.active() ? { x: f.x + f.facing * 225, y: -110, r: 100 } : null,
  kf: [[0, {}], [8, { ...CROUCH }], [42, { ...CROUCH }], [50, {}], [58, null]] };
function spawnCarTire(f) { const w = f.toWorld(f.J.fH); SFX.throw();
  spawnProj({ kind: 'cartire', owner: f, x: w[0] + f.facing * 20, y: w[1] - 10, vx: f.facing * 15, vy: -6, g: 0.42, r: 36, life: 140, vr: f.facing * 0.32, bounce: 0.5, m: { dmg: 15, lvl: 'mid', hs: 0, bs: 14, push: 40, stop: 10, p: 1.5, kd: 1 } }); }
MV.sk2_tire = { name: 'tire', skill: 1, sk2: 1, limb: null, lvl: 'mid', st: 15, ac: 1, rc: 20, p: 1.5, spawnAt: 15, spawn: spawnCarTire,
  kf: [[0, {}], [9, { ua: 210, fa: 50, lean: -18, bua: 30, bfa: 120, th: 30, sh: 20, bth: -26, bsh: 10 }], [15, { ua: 80, fa: 6, lean: 26, dx: 14, th: 44, bth: -34 }], [21, {}], [36, null]] };
SKILL2[14] = 'sk2_tire'; SKILL2_LINE[14] = 'خذ التاير!'; SKILL2_NAMES[14] = 'رمية التاير';
COMBOS.push(
  // 14 وحش التيرسل — car doors, tyres and the bonnet
  { '12': ['رمية الباب', projMove(12, 18, PZ.windup, PZ.release, f => { SFX.throw(); shoot(f, { kind: 'door', sp: 18, r: 42, dmg: 13, vr: 0.4, life: 80, p: 1.4, push: 34 }); })],
    '23': ['التاير المتدحرج', projMove(14, 20, { ...CROUCH, ua: 10, fa: 20, lean: 40 }, { ua: 75, fa: 5, lean: 30, dx: 10, th: 50, bth: -40 }, f => { SFX.roll(); shoot(f, { kind: 'cartire', from: 'ground', gx: 80, r: 38, sp: 13, ground: 1, lvl: 'low', dmg: 12, kd: 1, vr: 0.3, life: 110 }); })],
    '24': ['دفشة الكبوت', dashMove({ st: 10, ac: 14, rc: 20, sp: 16, hitboxFn: bodyHB(70, -230, 60), dmg: 13, kd: 1, push: 55, pose: PZ.shoulder })],
    '13': ['باب من السما', projMove(16, 24, PZ.summon, { ...PZ.summon, lean: -22 }, f => { SFX.skill(); shoot(f, { kind: 'door', from: 'sky', vy: 6, g: 0.6, r: 58, dmg: 17, kd: 1, p: 1.7, vr: 0.1, life: 160 }); })],
    '14': ['لكمات القفاز', flurryMove({ st: 6, ac: 30, rc: 16, multi: 5, dmg: 2.6, hs: 14, bs: 7, push: 3, stop: 2, r: 36, mvx: [[6, 36, 2]] })],
    '34': ['ركلة الشارع', M({ st: 12, ac: 4, rc: 20, limb: 'fT', r: 42, dmg: 14, push: 60, kick: 1, p: 1.5, kf: [[0, {}], [8, PZ.stompUp], [12, { th: 90, sh: 0, ft: -40, ffl: 0, lean: -14, dx: 10 }], [16, {}], [36, null]] })] },
);

const NOKH = 15, RAIS = 16, RAIS2 = 17;
function spawnWave(f) { SFX.whoosh(1); SFX.rock(); if (G.fight) G.fight.shake(10);
  spawnProj({ kind: 'seawave', owner: f, x: f.x + f.facing * 120, y: -100, vx: f.facing * 10.5, vy: 0, g: 0, r: 100, life: 120, big: 1, m: { dmg: 17, lvl: 'mid', hs: 24, bs: 16, push: 70, stop: 10, p: 1.5, kdCH: 1 } }); }
function spawnRedShot(f) { const w = f.toWorld(f.J.fH); SFX.zap(); SFX.throw();
  spawnProj({ kind: 'redball', owner: f, x: w[0] + f.facing * 30, y: w[1], vx: f.facing * 18, vy: 0, g: 0, r: 34, life: 90, big: 1, m: { dmg: 16, lvl: 'mid', hs: 26, bs: 16, push: 46, stop: 10, p: 1.5, kd: 1 } }); }
function spawnShock(f) { SFX.thud(); SFX.rock(); if (G.fight) G.fight.shake(16); dust(f.x, 30);
  for (const d of [1, -1]) spawnProj({ kind: 'shock', owner: f, x: f.x + d * 70, y: -34, vx: d * 13, vy: 0, g: 0, r: 38, life: 72, ground: true, m: { dmg: 11, lvl: 'low', hs: 22, bs: 12, push: 26, stop: 8, p: 1.2 } }); }
function rideStep(f) {
  const m = f.mv, d = f.facing; if (f.mt < m.st - 2 || f.mt > m.st + m.ac) return;
  if (f.mt % 2 === 0) for (let i = 0; i < 3; i++) FX.push({ t: 'p', x: f.x - d * (m.ride === 'ship' ? 210 : 150) + rnd(-20, 20), y: -rnd(0, 30), vx: -d * rnd(2, 7), vy: -rnd(3, 9), life: 26, max: 26, c: i % 2 ? '#ffffff' : '#7fd6ff', sz: rnd(3, 7) });
  if (m.ride === 'ship' && f.mt % 10 === 0) { G.fight && G.fight.shake(4); SFX.whoosh(0); }
  if (m.ride === 'boat' && f.mt % 6 === 0) SFX.whoosh(1);
}
function ringStep(f) { if (f.mt >= 3 && f.mt < f.mv.st + f.mv.ac && f.mt % 2 === 0) { const w = f.toWorld(f.J.fH); finBurst(w[0] - f.facing * 20, w[1], 3, ['#ffd34d', '#d4a640', '#ffffff'], 4, 5); dust(f.x - f.facing * 40, 1, -f.facing); } if (f.mt === 3) SFX.whoosh(1); if (f.mt === f.mv.st) { const w = f.toWorld(f.J.fH); finRing(w[0], w[1], '#ff2a3a', 120, 12); finBurst(w[0], w[1], 12, ['#ff2a3a', '#ffd34d'], 7, 5); SFX.zap(); } }
function eyePos(f) { const J = f.J; return f.toWorld([J.hd[0] + J.hr * 0.55, J.hd[1] - J.hr * 0.1]); }
function eyesStep(f) {
  const m = f.mv; if (f.mt === 2) SFX.zap();
  if (f.mt === m.st) { const o = G.fight.f[1 - f.slot], e = eyePos(f), dx = Math.max(160, Math.abs(o.x - e[0])); f.eyeSlope = clamp(((o.hurt.y0 + 46) - e[1]) / dx, -0.35, 0.35); SFX.zap(); G.fight.shake(8); }
  if (f.mt >= m.st && f.mt < m.st + m.ac && f.mt % 3 === 0) { const e = eyePos(f); FX.push({ t: 'p', x: e[0], y: e[1], vx: f.facing * rnd(2, 6), vy: rnd(-3, 3), life: 14, max: 14, c: '#ff3040', sz: rnd(3, 6) }); }
}
function eyesHB(f) { if (!f.active()) return null; const e = eyePos(f), L = 1500; return { x: e[0] + f.facing * L, y: e[1] + (f.eyeSlope || 0) * L, x2: e[0], y2: e[1], ar: 14, r: 14 }; }
function diveStep(f) {
  if (f.mt === 10) { SFX.whoosh(1); dust(f.x, 20); }
  if (f.mt === 28) { const o = G.fight.f[1 - f.slot]; f.diveTX = clamp(o.x, -STAGE + 60, STAGE - 60); }
  if (f.mt > 28 && f.mt <= 46 && f.diveTX !== undefined) f.x += (f.diveTX - f.x) * 0.14;
  if (f.mt >= 12 && f.mt < 45) f.invuln = Math.max(f.invuln, 2);
  if (f.mt > 10 && f.mt < 46 && f.mt % 2 === 0) finBurst(f.x + rnd(-60, 60), -rnd(200, 560), 2, ['#1a0b0e', '#ff2030'], 4, 6);
  if (f.mt === 46) { G.fight.shake(30); SFX.thud(); SFX.rock(); dust(f.x, 40); finRing(f.x, -20, '#ff2030', 320, 22); finBurst(f.x, -40, 40, ['#ff2030', '#1a0b0e', '#ffd34d'], 14, 7); }
}
MV.sk_wave = { name: 'wave', skill: 1, limb: null, lvl: 'mid', st: 18, ac: 1, rc: 22, p: 1.5, spawnAt: 18, spawn: spawnWave,
  kf: [[0, {}], [10, { ua: 200, fa: 30, bua: 196, bfa: 34, lean: -14, th: 20, bth: -16 }], [18, { ua: 95, fa: 4, bua: 90, bfa: 8, lean: 26, dx: 14, th: 44, bth: -34 }], [26, {}], [41, null]] };
MV.sk_ship = { name: 'ship', skill: 1, limb: null, lvl: 'mid', st: 14, ac: 40, rc: 18, dmg: 20, hs: 0, bs: 16, push: 60, stop: 10, p: 1.7, kd: 1, ride: 'ship', mvx: [[12, 54, 11]], onStep: rideStep,
  hitboxFn: f => f.active() ? { x: f.x + f.facing * 200, y: -80, r: 80 } : null,
  kf: [[0, {}], [12, { dy: -80, lean: -4, ua: 160, fa: 20, bua: 40, bfa: 110, th: 10, sh: 10, bth: -8, bsh: 8 }], [54, {}], [66, null]] };
MV.sk_boat = { name: 'boat', skill: 1, limb: null, lvl: 'mid', st: 8, ac: 30, rc: 16, dmg: 13, hs: 0, bs: 13, push: 30, stop: 8, p: 1.4, launch: 1, ride: 'boat', mvx: [[6, 38, 21]], onStep: rideStep,
  hitboxFn: f => f.active() ? { x: f.x + f.facing * 150, y: -50, r: 66 } : null,
  kf: [[0, {}], [7, { dy: -44, lean: 24, ua: 70, fa: 60, bua: 66, bfa: 70, th: 70, sh: 100, bth: 30, bsh: 90 }], [38, {}], [50, null]] };
MV.sk_ring = { name: 'ring', skill: 1, limb: 'fH', lvl: 'mid', st: 14, ac: 8, rc: 22, dmg: 18, hs: 0, bs: 16, push: 52, stop: 12, p: 1.6, kd: 1, ar: 34, mvx: [[3, 22, 24]], trail: 1, onStep: ringStep,
  kf: [[0, {}], [8, { ua: 20, fa: 130, lean: -12, dx: -8, fsc: 1.3 }], [14, { ua: 94, fa: 0, lean: 28, dx: 26, th: 46, bth: -40, bsh: 10, fsc: 1.6 }], [20, {}], [32, { ua: 50, fa: 100, lean: 8, fsc: 1 }], [42, null]] };
function drawGoldBar(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const W = r * 1.5, H = r * 0.62;
  const g = ctx.createLinearGradient(0, -H, 0, H); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.45, '#f2c544'); g.addColorStop(1, '#a8761a');
  ctx.fillStyle = g; ctx.strokeStyle = '#7a5410'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-W * 0.78, -H); ctx.lineTo(W * 0.78, -H); ctx.lineTo(W, H); ctx.lineTo(-W, H); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-W * 0.6, -H * 0.75, W * 1.1, H * 0.22);
  ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.8); gl.addColorStop(0, 'rgba(255,220,90,0.45)'); gl.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, r * 1.8, 0, 7); ctx.fill();
  ctx.restore();
}
function spawnGold(f) { const w = f.toWorld(f.J.fH); SFX.throw(); SFX.zap();
  [[24, -7], [20, -9.5], [16, -12]].forEach(([vx, vy], i) => spawnProj({ kind: 'goldbar', owner: f, x: w[0] + f.facing * 20, y: w[1] - 10, vx: f.facing * vx, vy, g: 0.42, r: 26, life: 130, vr: f.facing * (0.25 + i * 0.08), big: 1, m: { dmg: 8, lvl: 'mid', hs: 18, bs: 12, push: 26, stop: 7, p: 1.2, kd: i === 2 ? 1 : 0 } })); }
MV.sk_gold = { name: 'gold', skill: 1, limb: null, lvl: 'mid', st: 16, ac: 1, rc: 22, p: 1.4, spawnAt: 16, spawn: spawnGold,
  kf: [[0, {}], [10, { ua: 210, fa: 50, lean: -18, bua: 30, bfa: 120, th: 30, sh: 20, bth: -26, bsh: 10 }], [16, { ua: 80, fa: 6, lean: 26, dx: 14, th: 44, bth: -34 }], [24, {}], [40, null]] };
MV.sk_stomp = { name: 'stomp', skill: 1, limb: null, lvl: 'low', st: 20, ac: 1, rc: 20, p: 1.3, spawnAt: 20, spawn: spawnShock,
  kf: [[0, {}], [12, { th: 100, sh: 80, lean: -10, ua: 140, fa: 60, bua: 140, bfa: 60 }], [20, { th: 20, sh: 10, lean: 20, dy: 6, ua: 40, fa: 90, bua: 40, bfa: 90 }], [28, {}], [40, null]] };
MV.sk_eyes = { name: 'eyes', skill: 1, limb: null, lvl: 'high', st: 26, ac: 34, rc: 22, dmg: 3.5, hs: 12, bs: 6, push: 6, stop: 3, p: 0.8, multi: 6, onStep: eyesStep, hitboxFn: eyesHB,
  kf: [[0, {}], [20, { lean: -8, ua: 40, fa: 120, bua: 40, bfa: 120 }], [26, { lean: 4 }], [60, {}], [82, null]] };
MV.sk_redshot = { name: 'redshot', skill: 1, limb: null, lvl: 'mid', st: 16, ac: 1, rc: 20, p: 1.4, spawnAt: 16, spawn: spawnRedShot,
  kf: [[0, {}], [10, { ua: 60, fa: 120, lean: -10, dx: -6 }], [16, { ua: 92, fa: 0, lean: 18, dx: 12, th: 36, bth: -30 }], [22, {}], [36, null]] };
MV.sk_dive = { name: 'dive', skill: 1, limb: null, lvl: 'mid', st: 46, ac: 6, rc: 24, dmg: 22, hs: 0, bs: 18, push: 50, stop: 14, p: 1.8, kd: 1, onStep: diveStep,
  hitboxFn: f => f.active() ? { x: f.x + f.facing * 30, y: -90, r: 125 } : null,
  kf: [[0, {}], [10, { th: 70, sh: 110, bth: 50, bsh: 110, lean: 20, dy: 14 }], [28, { dy: -470, th: 40, sh: 70, bth: 20, bsh: 60, lean: -6, ua: 160, fa: 20, bua: 160, bfa: 20 }], [40, { dy: -470 }],
    [46, { dy: 0, th: 60, sh: 90, bth: 40, bsh: 80, lean: 30, ua: 80, fa: 10, bua: 76, bfa: 10 }], [52, {}], [76, null]] };
const BOSS_NAMES = { sk_gold: 'سبائك الذهب', sk_wave: 'الموجة', sk_ship: 'السفينة', sk_boat: 'الطراد', sk_ring: 'ضربة الخاتم', sk_stomp: 'هيبة الرئيس', sk_eyes: 'ليزر العيون', sk_redshot: 'الطلقة الحمراء', sk_dive: 'انقضاض الجناح' };
const BOSS_LINES = { sk_gold: 'ذهب الرئيس… خذه!', sk_wave: 'البحر معي!', sk_ship: 'ارفعوا الشراع!', sk_boat: 'وخّر من دربي!', sk_ring: 'حس بالخاتم!', sk_stomp: 'انحني للرئيس!', sk_eyes: 'شوف عيوني!', sk_redshot: 'خذ!', sk_dive: 'من فوق!' };
// ---- more boss skills: الرئيس (presidential limo, raining money, gold chain) and the winged الرئيس (fire feathers, tornado, meteors)
function bossOpp(f) { return G.fight ? G.fight.f[1 - f.slot] : null; }
MV.sk_limo = { ...MV.sk_car, name: 'limo', limo: 1, dmg: 21, st: 12, ac: 34, rc: 18, push: 80, mvx: [[12, 46, 21]],
  hitboxFn: f => f.active() ? { x: f.x + f.facing * 225, y: -110, r: 104 } : null,
  kf: [[0, {}], [10, { ...CROUCH }], [46, { ...CROUCH }], [54, {}], [62, null]] };
function drawLimoFlags(x, dir, t) {
  ctx.save(); ctx.translate(x, 0); ctx.scale(dir * 0.92, 0.92);
  for (const fx of [150, 210]) { ctx.strokeStyle = '#d9b44a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx, -122); ctx.lineTo(fx, -186); ctx.stroke();
    const w = Math.sin(t * 0.5 + fx) * 4; ctx.fillStyle = '#c8102e'; ctx.beginPath(); ctx.moveTo(fx, -186); ctx.quadraticCurveTo(fx - 22, -182 + w, fx - 44, -186 + w); ctx.lineTo(fx - 44, -162 + w); ctx.quadraticCurveTo(fx - 22, -158 + w, fx, -162); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(fx - 20, -174 + w * 0.5, 4.5, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#ffd34d'; rrect(-60, -66, 120, 10, 4); ctx.fill();   // gold trim
  ctx.restore();
}
// raining money: notes and a gold sack fall on the opponent
function cashStep(f) {
  const m = f.mv, o = bossOpp(f); if (!o) return;
  if (f.mt === m.st) { SFX.throw(); SFX.zap(); const w = f.toWorld(f.J.fH); for (let i = 0; i < 16; i++) FX.push({ t: 'p', x: w[0], y: w[1], vx: rnd(-5, 5), vy: -rnd(8, 15), life: 22, max: 22, c: i % 3 ? '#3fa34d' : '#ffd34d', sz: rnd(4, 8) }); }
  const k = f.mt - m.st; if (k < 6 || k > 42 || k % 4 !== 0) return;
  const last = k === 42; SFX.whoosh(0);
  spawnProj({ kind: last ? 'cashbag' : 'cash', owner: f, x: o.x + (last ? 0 : rnd(-190, 190)), y: -780, vx: rnd(-1, 1), vy: last ? 9 : 5, g: last ? 0.5 : 0.22, r: last ? 40 : 26, life: 140, vr: rnd(-0.25, 0.25), big: 1,
    m: last ? { dmg: 10, lvl: 'high', hs: 22, bs: 14, push: 30, stop: 10, p: 1.5, kd: 1 } : { dmg: 3.5, lvl: 'high', hs: 14, bs: 8, push: 6, stop: 4, p: 0.8 } });
}
MV.sk_cash = { name: 'cash', skill: 1, limb: null, lvl: 'high', st: 16, ac: 44, rc: 18, p: 1.2, projLimit: 0, onStep: cashStep,
  kf: [[0, {}], [10, { ua: 40, fa: 120, bua: 40, bfa: 120, lean: 6, th: 20, bth: -16 }], [16, { ua: 200, fa: 20, bua: 196, bfa: 24, lean: -14, th: 26, bth: -22 }], [30, { ua: 186, fa: 30, bua: 182, bfa: 34, lean: -8 }], [60, {}], [78, null]] };
function drawCash(p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.t * 0.25)));
  ctx.fillStyle = '#3c9a4a'; ctx.strokeStyle = '#1d5a28'; ctx.lineWidth = 2; rrect(-30, -15, 60, 30, 3); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; rrect(-25, -10, 50, 20, 2); ctx.stroke();
  ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#1d5a28'; ctx.font = '900 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 0.5);
  ctx.restore();
}
function drawCashBag(p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * 0.4);
  const g = ctx.createRadialGradient(-10, -6, 4, 0, 6, 46); g.addColorStop(0, '#f0d58a'); g.addColorStop(1, '#8a6420'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-14, -30); ctx.quadraticCurveTo(-46, 0, -34, 30); ctx.quadraticCurveTo(0, 46, 34, 30); ctx.quadraticCurveTo(46, 0, 14, -30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6a4a14'; rrect(-17, -38, 34, 10, 4); ctx.fill();
  ctx.fillStyle = '#2a6a32'; ctx.font = '900 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 8);
  ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(0, 0, 4, 0, 0, 70); gl.addColorStop(0, 'rgba(255,220,90,0.4)'); gl.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fill();
  ctx.restore();
}
// gold chain: a long whip from the hand that pulls the opponent in
const CHAIN_L = 430;
function chainTip(f) { const m = f.mv, w = f.toWorld(f.J.fH), k = clamp((f.mt - m.st + 4) / 6, 0, 1) * clamp((m.st + m.ac + 6 - f.mt) / 6, 0, 1); return [w, [w[0] + f.facing * CHAIN_L * k, w[1] + 18 * k]]; }
MV.sk_chain = { name: 'chain', skill: 1, limb: null, lvl: 'mid', st: 14, ac: 6, rc: 22, dmg: 15, hs: 22, bs: 14, push: -115, stop: 10, p: 1.5,
  onStep: f => { if (f.mt === 4) SFX.rattle(); if (f.mt === f.mv.st) { SFX.whoosh(1); G.fight && G.fight.shake(6); } },
  hitboxFn: f => { if (!f.active()) return null; const [w, t] = chainTip(f); return { x: t[0], y: t[1], x2: w[0], y2: w[1], ar: 24, r: 24 }; },
  kf: [[0, {}], [8, { ua: 40, fa: 130, lean: -12, dx: -10, th: 20, bth: -10 }], [14, { ua: 92, fa: 0, lean: 22, dx: 16, th: 40, bth: -32 }], [24, { ua: 92, fa: 0, lean: 16, dx: 10, th: 36, bth: -28 }], [32, {}], [42, null]] };
function drawChain(f) {
  const m = f.mv; if (f.mt < m.st - 4 || f.mt > m.st + m.ac + 6) return; const [w, t] = chainTip(f), dx = t[0] - w[0], dy = t[1] - w[1], L = Math.hypot(dx, dy); if (L < 8) return;
  const n = Math.max(2, (L / 16) | 0); ctx.save(); ctx.lineWidth = 4;
  for (let i = 0; i < n; i++) { const u = i / n, x = w[0] + dx * u, y = w[1] + dy * u + Math.sin(u * Math.PI) * 14; ctx.strokeStyle = i % 2 ? '#b8862a' : '#ffd34d'; ctx.beginPath(); ctx.ellipse(x, y, 9, i % 2 ? 3 : 6, Math.atan2(dy, dx), 0, 7); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(t[0], t[1], 2, t[0], t[1], 40); g.addColorStop(0, 'rgba(255,230,120,0.9)'); g.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(t[0], t[1], 40, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ffd34d'; ctx.strokeStyle = '#7a5410'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(t[0], t[1], 14, 0, 7); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// --- winged الرئيس
function spawnFeathers(f) { SFX.whoosh(1); SFX.zap(); G.fight && G.fight.shake(8); const y0 = f.hurt.y0 + 70;
  [-0.32, -0.16, 0, 0.16, 0.32].forEach((a, i) => spawnProj({ kind: 'feather', owner: f, x: f.x + f.facing * 60, y: y0 + a * 40, vx: f.facing * 21 * Math.cos(a), vy: 21 * Math.sin(a), g: 0, r: 20, life: 70, big: 1,
    m: { dmg: 6, lvl: 'mid', hs: 16, bs: 10, push: 14, stop: 5, p: 1, kd: i === 2 ? 1 : 0 } }));
  finBurst(f.x, y0, 18, ['#ff2030', '#ff8a2a', '#1a0b0e'], 10, 6); }
MV.sk_feathers = { name: 'feathers', skill: 1, limb: null, lvl: 'mid', st: 18, ac: 1, rc: 22, p: 1.4, spawnAt: 18, spawn: spawnFeathers,
  kf: [[0, {}], [12, { ua: 200, fa: 40, bua: 196, bfa: 44, lean: -16, th: 20, bth: -14 }], [18, { ua: 80, fa: 10, bua: 76, bfa: 14, lean: 24, dx: 12, th: 40, bth: -30 }], [26, {}], [41, null]] };
function drawFeather(p) {
  const a = Math.atan2(p.vy, p.vx); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(a); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, -120, 0); g.addColorStop(0, 'rgba(255,120,40,0.8)'); g.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-120, 0); ctx.lineTo(0, 12); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; const b = ctx.createLinearGradient(-34, 0, 34, 0); b.addColorStop(0, '#2a0508'); b.addColorStop(0.6, '#c8102e'); b.addColorStop(1, '#ffb070'); ctx.fillStyle = b;
  ctx.beginPath(); ctx.moveTo(34, 0); ctx.quadraticCurveTo(4, -15, -34, -3); ctx.lineTo(-30, 0); ctx.lineTo(-34, 3); ctx.quadraticCurveTo(4, 15, 34, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,180,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(-38, 0); ctx.stroke();
  ctx.restore();
}
function spawnTornado(f) { SFX.whoosh(1); SFX.rock(); G.fight && G.fight.shake(12);
  spawnProj({ kind: 'tornado', owner: f, x: f.x + f.facing * 130, y: -150, vx: f.facing * 8.5, vy: 0, g: 0, r: 78, life: 105, big: 1, heavy: 1, m: { dmg: 19, lvl: 'mid', hs: 0, bs: 16, push: 20, stop: 12, p: 1.7, launch: 1 } }); }
MV.sk_tornado = { name: 'tornado', skill: 1, limb: null, lvl: 'mid', st: 22, ac: 1, rc: 24, p: 1.5, spawnAt: 22, spawn: spawnTornado,
  onStep: f => { if (f.mt > 4 && f.mt < 22 && f.mt % 3 === 0) { dust(f.x + f.facing * 100, 2, f.facing); FX.push({ t: 'p', x: f.x + f.facing * rnd(60, 160), y: -rnd(0, 200), vx: -f.facing * rnd(2, 5), vy: -rnd(1, 4), life: 16, max: 16, c: '#ff2030', sz: rnd(3, 6) }); } },
  kf: [[0, {}], [8, { ua: 170, fa: 60, bua: 166, bfa: 64, lean: -10 }], [14, { ua: 60, fa: 60, bua: 56, bfa: 64, lean: 14 }], [18, { ua: 170, fa: 60, bua: 166, bfa: 64, lean: -10 }], [22, { ua: 80, fa: 10, bua: 76, bfa: 14, lean: 26, dx: 14, th: 40, bth: -30 }], [30, {}], [46, null]] };
function drawTornado(p) {
  const t = p.t, k = Math.min(1, t / 10), base = p.y + 150; ctx.save(); ctx.translate(p.x, base);
  for (let i = 0; i < 24; i++) { const u = i / 23, y = -u * 340 * k, w = (24 + u * 120) * k, sh = Math.sin(t * 0.35 + i * 0.6) * 16 * u;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(255,60,60,0.85)' : i % 3 === 1 ? 'rgba(40,6,10,0.75)' : 'rgba(255,150,90,0.6)'; ctx.lineWidth = 9 - u * 3;
    ctx.beginPath(); ctx.ellipse(sh, y, w, w * 0.22, 0, t * 0.4 + i, t * 0.4 + i + 4.4); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -160, 10, 0, -160, 190); g.addColorStop(0, 'rgba(255,40,40,0.35)'); g.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -160, 150, 200, 0, 0, 7); ctx.fill();
  ctx.restore();
}
// meteors: he flies up and red meteors rain around the opponent
function meteorStep(f) {
  if (f.mt === 10) { SFX.whoosh(1); dust(f.x, 20); }
  if (f.mt >= 12 && f.mt < 74) f.invuln = Math.max(f.invuln, 2);
  const o = bossOpp(f), k = f.mt - 30; if (o && k >= 0 && k <= 36 && k % 6 === 0) { const last = k === 36; SFX.zap();
    spawnProj({ kind: 'meteor', owner: f, x: o.x + (last ? 0 : rnd(-230, 230)) - f.facing * 180, y: -820, vx: f.facing * 6, vy: 15, g: 0.25, r: last ? 46 : 32, life: 120, big: 1,
      m: last ? { dmg: 11, lvl: 'high', hs: 24, bs: 14, push: 40, stop: 10, p: 1.6, kd: 1 } : { dmg: 6, lvl: 'high', hs: 16, bs: 10, push: 14, stop: 6, p: 1.1 } }); }
  if (f.mt === 74) { G.fight.shake(20); SFX.thud(); dust(f.x, 30); finRing(f.x, -20, '#ff2030', 240, 18); }
}
MV.sk_meteor = { name: 'meteor', skill: 1, limb: null, lvl: 'high', st: 30, ac: 44, rc: 22, p: 1.4, projLimit: 0, onStep: meteorStep,
  kf: [[0, {}], [10, { th: 70, sh: 110, bth: 50, bsh: 110, lean: 20, dy: 14 }], [28, { dy: -470, th: 40, sh: 70, bth: 20, bsh: 60, lean: -6, ua: 200, fa: 30, bua: 196, bfa: 34 }], [70, { dy: -470, ua: 200, fa: 30, bua: 196, bfa: 34 }],
    [76, { dy: 0, th: 60, sh: 90, bth: 40, bsh: 80, lean: 20 }], [84, {}], [96, null]] };
function drawMeteor(p) {
  const d = Math.atan2(p.vy, p.vx); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(d); ctx.globalCompositeOperation = 'lighter';
  const L = p.r * 6, g = ctx.createLinearGradient(0, 0, -L, 0); g.addColorStop(0, 'rgba(255,200,120,0.95)'); g.addColorStop(0.3, 'rgba(255,40,30,0.7)'); g.addColorStop(1, 'rgba(120,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.quadraticCurveTo(-L * 0.4, -p.r * 0.5, -L, 0); ctx.quadraticCurveTo(-L * 0.4, p.r * 0.5, 0, p.r); ctx.fill();
  const a = ctx.createRadialGradient(0, 0, 3, 0, 0, p.r * 1.8); a.addColorStop(0, 'rgba(255,255,220,1)'); a.addColorStop(0.35, 'rgba(255,60,40,0.9)'); a.addColorStop(1, 'rgba(120,0,0,0)'); ctx.fillStyle = a; ctx.beginPath(); ctx.arc(0, 0, p.r * 1.8, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#2a0a0a'; ctx.beginPath(); ctx.arc(p.r * 0.1, 0, p.r * 0.6, 0, 7); ctx.fill(); ctx.strokeStyle = '#ff5030'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.r * 0.1, 0, p.r * 0.6, -1, 1.4); ctx.stroke();
  ctx.restore();
}
Object.assign(BOSS_NAMES, { sk_limo: 'موكب الرئيس', sk_cash: 'مطر الفلوس', sk_chain: 'سلسلة الذهب', sk_feathers: 'ريش النار', sk_tornado: 'إعصار الأجنحة', sk_meteor: 'النيازك الحمراء' });
Object.assign(BOSS_LINES, { sk_limo: 'وسّعوا للموكب!', sk_cash: 'الفلوس تشتري كل شي!', sk_chain: 'تعال هني!', sk_feathers: 'ريشي نار!', sk_tornado: 'الريح معي!', sk_meteor: 'السما تطيح عليك!' });
function bossPick(ci, d) {
  const r = Math.random();
  if (ci === NOKH) return d > 420 ? (r < 0.6 ? 'sk_wave' : 'sk_ship') : d > 200 ? (r < 0.35 ? 'sk_ship' : r < 0.7 ? 'sk_boat' : 'sk_wave') : (r < 0.5 ? 'sk_boat' : null);
  const pick = L => { let w = 0; for (const [, x] of L) w += x; let q = r * w; for (const [id, x] of L) { q -= x; if (q <= 0) return id; } return L[L.length - 1][0]; };
  if (ci === RAIS) return d < 260 ? pick([['sk_ring', 3], ['sk_stomp', 2], ['sk_cash', 2], ['sk_gold', 1]]) : d < 520 ? pick([['sk_chain', 3], ['sk_ring', 2], ['sk_gold', 2], ['sk_limo', 2], ['sk_cash', 1.5], ['sk_stomp', 1]]) : pick([['sk_limo', 3], ['sk_gold', 2.5], ['sk_cash', 2], ['sk_stomp', 1]]);
  if (ci === NASSER || ci === HAMAD) return bossPickNH(ci, d, r);
  if (ci === MALALI) return d > 380 ? pick([['sk_void', 3], ['sk_tendril', 3], ['sk_dwave', 2.5], ['sk_shstep', 2], ['sk_eclipse', 1.2]]) : pick([['sk_shstep', 2.5], ['sk_tendril', 2.5], ['sk_dwave', 1.5], ['sk_void', 1.5], ['sk_eclipse', 1]]);
  if (ci === RAIS2) return d > 320 ? pick([['sk_eyes', 2.5], ['sk_redshot', 2], ['sk_feathers', 2.5], ['sk_tornado', 2], ['sk_meteor', 2], ['sk_dive', 1.5]]) : pick([['sk_ring', 2], ['sk_dive', 2], ['sk_meteor', 2], ['sk_eyes', 1.5], ['sk_tornado', 1.5], ['sk_feathers', 1]]);
  return null;
}
function bossTick(f, opp) {
  const F = G.fight; if (!F || F.phase !== 'fight') return;
  if (f.bossCD > 0) f.bossCD--;
  if (f.C.awake && f.clock % 3 === 0) FX.push({ t: 'p', x: f.x + rnd(-60, 60), y: -rnd(20, 380), vx: rnd(-0.6, 0.6), vy: -rnd(1.5, 4), life: 30, max: 30, c: f.clock % 2 ? '#ff2030' : '#ff7040', sz: rnd(2, 5) });
  if (f.bossCD > 0 || !NEUTRAL.has(f.state) || opp.state === 'down' || opp.state === 'rageVic') return;
  const bci = f.bossAs !== undefined ? f.bossAs : f.ci, id = bossPick(bci, Math.abs(opp.x - f.x));
  if (!id) { f.bossCD = 30; return; }
  f.startMove(id); f.vx = 0; f.buf = null; f.bossCD = (f.ci === RAIS2 ? 115 : f.ci === NOKH ? 170 : bci === NASSER ? 92 : bci === HAMAD ? 100 : bci === MALALI ? 105 : 160) + ((Math.random() * 70) | 0);
  f.talk('skill', BOSS_LINES[id]); F.skBanner = { slot: f.slot, text: BOSS_NAMES[id], t: 0 };
}
// ---- drawings
function drawSeaWave(p) {
  const d = Math.sign(p.vx) || 1, t = p.t, H = 240, Wd = 200, grow = Math.min(1, t / 8);
  ctx.save(); ctx.translate(p.x, 2); ctx.scale(d, grow);
  const g = ctx.createLinearGradient(0, -H, 0, 0); g.addColorStop(0, '#c8f6ff'); g.addColorStop(0.35, '#3cb4ff'); g.addColorStop(1, '#0a3a7a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-Wd, 0); ctx.quadraticCurveTo(-Wd * 0.6, -H * 0.35, -Wd * 0.1, -H * 0.86); ctx.quadraticCurveTo(Wd * 0.35, -H * 1.06 + Math.sin(t * 0.4) * 6, Wd * 0.58, -H * 0.7);
  ctx.quadraticCurveTo(Wd * 0.3, -H * 0.64, Wd * 0.22, -H * 0.46); ctx.quadraticCurveTo(Wd * 0.5, -H * 0.2, Wd * 0.74, 0); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-Wd * (0.9 - k * 0.15), -k * 14); ctx.quadraticCurveTo(-Wd * 0.3, -H * 0.3 - k * 10, Wd * 0.1, -H * 0.62 + k * 8); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-Wd * 0.16, -H * 0.85); ctx.quadraticCurveTo(Wd * 0.35, -H * 1.06, Wd * 0.58, -H * 0.7); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.88)'; for (let i = 0; i < 10; i++) { const a = i / 10; ctx.beginPath(); ctx.arc(lerp(-Wd * 0.1, Wd * 0.62, a) + Math.sin(t * 0.7 + i) * 4, -H * (0.86 + 0.16 * Math.sin(a * Math.PI)) + Math.cos(t * 0.5 + i) * 5, 6 + ((i * 7) % 5), 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(0, 0, Wd * 1.05, 14, 0, 0, 7); ctx.fill();
  ctx.restore();
}
function drawDhow(x, deckY, dir, t) {
  ctx.save(); ctx.translate(x, 0); ctx.scale(dir, 1);
  ctx.fillStyle = 'rgba(60,170,240,0.75)'; ctx.beginPath(); ctx.ellipse(0, 6, 300, 26, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.arc(i * 55 + Math.sin(t * 0.5 + i) * 8, -2 + Math.cos(t * 0.6 + i) * 3, 10, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#4a2a14'; ctx.fillRect(-150, deckY - 330, 9, 330);
  ctx.fillStyle = '#f3ead2'; ctx.beginPath(); ctx.moveTo(-146, deckY - 330); ctx.quadraticCurveTo(-40, deckY - 240, -10, deckY - 40); ctx.lineTo(-146, deckY - 60); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#b8a47a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#e01b30'; ctx.beginPath(); ctx.moveTo(-142, deckY - 330); ctx.lineTo(-100, deckY - 318); ctx.lineTo(-142, deckY - 306); ctx.fill();
  const g = ctx.createLinearGradient(0, deckY, 0, 10); g.addColorStop(0, '#9a6a3a'); g.addColorStop(1, '#5a3618');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-230, deckY - 20); ctx.lineTo(180, deckY); ctx.quadraticCurveTo(260, deckY - 10, 280, deckY - 70); ctx.lineTo(250, 4); ctx.lineTo(-190, 8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,8,0.6)'; ctx.lineWidth = 2; for (let k = 1; k < 4; k++) { const y = lerp(deckY, 6, k / 4); ctx.beginPath(); ctx.moveTo(-210, y - 6); ctx.lineTo(240, y); ctx.stroke(); }
  ctx.strokeStyle = '#d4a640'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-230, deckY - 20); ctx.lineTo(180, deckY); ctx.quadraticCurveTo(260, deckY - 10, 280, deckY - 70); ctx.stroke();
  ctx.restore();
}
function drawSpeedboat(x, deckY, dir, t) {
  ctx.save(); ctx.translate(x, 0); ctx.scale(dir, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(-160 - i * 26, -6 - Math.abs(Math.sin(t * 0.8 + i)) * 18, 18 - i, 10, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(60,170,240,0.7)'; ctx.beginPath(); ctx.ellipse(0, 6, 230, 18, 0, 0, 7); ctx.fill();
  const g = ctx.createLinearGradient(0, deckY - 10, 0, 6); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b9c2d0');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-150, deckY); ctx.lineTo(120, deckY); ctx.quadraticCurveTo(200, deckY + 4, 220, deckY + 24); ctx.lineTo(150, 4); ctx.lineTo(-140, 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e01b30'; ctx.beginPath(); ctx.moveTo(-148, deckY + 14); ctx.lineTo(160, deckY + 14); ctx.lineTo(180, deckY + 26); ctx.lineTo(-146, deckY + 26); ctx.fill();
  ctx.fillStyle = 'rgba(120,200,255,0.55)'; ctx.beginPath(); ctx.moveTo(40, deckY); ctx.lineTo(70, deckY - 46); ctx.lineTo(96, deckY); ctx.fill();
  ctx.fillStyle = '#222833'; rrect(-176, deckY - 26, 34, 58, 6); ctx.fill();
  ctx.restore();
}
function drawRedBall(p) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  finComet(p.x, p.y, Math.sign(p.vx) || 1, 0, 260, p.r * 1.1, 'rgba(255,30,40,0.8)', 'rgba(255,180,160,0.8)');
  const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.r * 2.2); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.3, 'rgba(255,40,50,0.9)'); g.addColorStop(1, 'rgba(120,0,10,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.2, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,90,90,0.8)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.7 + i * 0.25), p.t * 0.3 + i, p.t * 0.3 + i + 2.2); ctx.stroke(); }
  ctx.restore();
}
function drawShock(p) {
  const d = Math.sign(p.vx) || 1; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(p.x - d * 80, 0, p.x + d * 30, 0); g.addColorStop(0, 'rgba(212,166,64,0)'); g.addColorStop(1, 'rgba(255,200,90,0.9)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(p.x - d * 90, 0); ctx.quadraticCurveTo(p.x - d * 10, -70 - Math.sin(p.t * 0.6) * 10, p.x + d * 30, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,60,40,0.55)'; ctx.beginPath(); ctx.moveTo(p.x - d * 60, 0); ctx.quadraticCurveTo(p.x, -40, p.x + d * 20, 0); ctx.closePath(); ctx.fill(); ctx.restore();
}
function drawWings(f) {
  const nk = f.toWorld(f.J.nk), hp = f.toWorld([0, 0]), d = -f.facing, k = f.R.k;
  const rx = lerp(nk[0], hp[0], 0.2) + d * 22 * k, ry = lerp(nk[1], hp[1], 0.2);
  const diving = f.state === 'attack' && f.mv && f.mv.id === 'sk_dive' && f.mt > 8 && f.mt < 50;
  const flap = Math.sin(f.clock * (diving ? 0.5 : 0.09)) * (diving ? 0.3 : 0.12);
  // soft red aura around the body + glow on the floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cy = lerp(nk[1], 0, 0.45), ag = ctx.createRadialGradient(f.x, cy, 40, f.x, cy, 340); ag.addColorStop(0, 'rgba(255,30,40,0.34)'); ag.addColorStop(0.6, 'rgba(200,0,20,0.12)'); ag.addColorStop(1, 'rgba(255,0,20,0)'); ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(f.x, cy, 340, 0, 7); ctx.fill();
  const fg = ctx.createRadialGradient(f.x, 0, 10, f.x, 0, 220); fg.addColorStop(0, 'rgba(255,40,40,0.45)'); fg.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(f.x, 0, 220, 40, 0, 0, 7); ctx.fill();
  ctx.restore();
  const L0 = 330 * k * 1.25;
  for (const far of [1, 0]) {
    const L = L0 * (far ? 0.86 : 1);
    ctx.save(); ctx.translate(rx + d * far * 14, ry - far * 22); ctx.scale(d, 1); ctx.rotate(-0.42 - flap - far * 0.25);
    const top = u => [L * u, -L * 0.42 * Math.sin(u * Math.PI * 0.62)]; // leading edge of the wing
    const layers = [[11, 1.0, far ? '#050307' : '#0d070b'], [9, 0.62, far ? '#08050a' : '#160c12'], [7, 0.34, far ? '#0a060c' : '#21121a']];
    for (const [n, lenK, col] of layers) {
      for (let j = n - 1; j >= 0; j--) {
        const u = 0.06 + 0.94 * j / (n - 1), [bx, by] = top(u), len = L * lenK * (0.38 + 0.62 * u * u) * (lenK < 1 ? 1 : 0.95), ang = 1.15 + 0.75 * u, w = len * 0.17;
        ctx.save(); ctx.translate(bx, by); ctx.rotate(ang);
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -w * 0.5); ctx.quadraticCurveTo(len * 0.55, -w, len, 0); ctx.quadraticCurveTo(len * 0.55, w, 0, w * 0.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = far ? 'rgba(255,20,30,0.22)' : 'rgba(255,40,50,0.55)'; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.strokeStyle = 'rgba(80,40,50,0.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(len * 0.9, 0); ctx.stroke();
        ctx.restore();
      }
    }
    ctx.strokeStyle = far ? '#050306' : '#120a0f'; ctx.lineWidth = 16 * k; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 12; i++) { const [x, y] = top(i / 12); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = far ? 'rgba(255,30,40,0.25)' : 'rgba(255,50,50,0.5)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
    ctx.restore();
  }
}
function drawAwakeFront(f) {
  const e = eyePos(f), m = f.mv, eyes = f.state === 'attack' && m && m.id === 'sk_eyes';
  const pw = eyes ? (f.mt < m.st ? f.mt / m.st : 1) : 0.4 + 0.15 * Math.sin(f.clock * 0.2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(e[0], e[1], 1, e[0], e[1], 16 + pw * 30); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.3, 'rgba(255,40,40,0.9)'); g.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e[0], e[1], 16 + pw * 30, 0, 7); ctx.fill();
  if (eyes && f.mt >= m.st && f.mt < m.st + m.ac) {
    const L = 1500, ex = e[0] + f.facing * L, ey = e[1] + (f.eyeSlope || 0) * L, w = 14 + Math.sin(f.mt * 0.9) * 3;
    for (const [lw, c] of [[w * 3.2, 'rgba(255,20,30,0.25)'], [w * 1.6, 'rgba(255,40,40,0.7)'], [w * 0.55, 'rgba(255,240,240,0.95)']]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(ex, ey); ctx.stroke(); }
  }
  ctx.restore();
}
function drawRide(f) {
  const m = f.mv; if (!(f.state === 'attack' && m && m.ride)) return;
  const k = f.R.k, a = clamp(Math.min((f.mt - 4) / 6, (m.total - f.mt) / 8), 0, 1); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; const deck = -(m.ride === 'ship' ? 80 : 44) * k;
  if (m.ride === 'ship') drawDhow(f.x + f.facing * 10, deck, f.facing, f.mt); else drawSpeedboat(f.x - f.facing * 10, deck, f.facing, f.mt);
  ctx.restore();
}
CHARS.push(
  { name: 'النوخذة', en: 'AL-NOKHATHA', h: 0.9, tag: 'سيد البحر', hp: 1.2, dmg: 1.06, spd: 0.98, color: '#3cb4ff', stats: [4, 4, 4], quote: 'البحر ما يرحم… وأنا مثله!', boss: 1 },
  { name: 'الرئيس', en: 'AL-RAEES', h: 0.95, tag: 'كبيرهم اللي علّمهم', hp: 1.3, dmg: 1.12, spd: 0.92, color: '#d4a640', stats: [5, 3, 5], quote: 'كلكم شغالين عندي!', boss: 1 },
  { name: 'الرئيس', en: 'AL-RAEES', h: 0.97, tag: 'الجناح الأسود', hp: 1.45, dmg: 1.22, spd: 1.0, color: '#ff1030', stats: [5, 4, 5], quote: 'الحين… تشوف قوتي الحقيقية!', boss: 2, awake: 1 },
);
SKILL_IDS.push('sk_wave', 'sk_ring', 'sk_redshot'); SKILL_NAMES.push('الموجة', 'ضربة الخاتم', 'الطلقة الحمراء');
// ================= الطباخ — الوحش's chef outfit, a character of its own =================
const CHEF = CHARS.length;
CHARS.push({ name: 'الطباخ', en: 'THE CHEF', h: 1.11, tag: 'مقلاته ما ترحم', hp: 1.0, dmg: 1.22, spd: 0.95, color: '#f2f2f2', stats: [5, 3, 4], quote: 'الأكل جاهز… وأنت الطبق!', hidden: 1 });
OUTFITS[1] = [{ id: '', name: 'الأساسي' }, { id: 'chef', name: 'الطباخ', as: CHEF }];
function drawTomato(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, '#ff8a7a'); g.addColorStop(0.5, '#e8231c'); g.addColorStop(1, '#9a0d0a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.88, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#2f8f2a'; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.22, -r * 0.8 + Math.sin(a) * r * 0.1, r * 0.22, r * 0.08, a, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-r * 0.38, -r * 0.3, r * 0.18, r * 0.1, -0.6, 0, 7); ctx.fill();
  ctx.restore();
}
function drawPlate(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, 0.42);
  ctx.fillStyle = '#f4f6f8'; ctx.strokeStyle = '#8f98a6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#3a6fd1'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, 7); ctx.stroke();
  ctx.fillStyle = '#e3e7ec'; ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, 7); ctx.fill();
  ctx.restore();
}
function drawPot(x, y, r, lid = 1, shake = 0) {
  ctx.save(); ctx.translate(x + shake, y);
  const g = ctx.createLinearGradient(-r, 0, r, 0); g.addColorStop(0, '#5d636e'); g.addColorStop(0.35, '#d8dde4'); g.addColorStop(0.6, '#9aa2ae'); g.addColorStop(1, '#4a4f58');
  ctx.fillStyle = g; ctx.strokeStyle = '#2b2f36'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-r, -r * 1.1); ctx.lineTo(r, -r * 1.1); ctx.lineTo(r * 0.94, 0); ctx.quadraticCurveTo(0, r * 0.18, -r * 0.94, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2b2f36'; rrect(-r * 1.28, -r * 0.95, r * 0.3, r * 0.16, 6); ctx.fill(); rrect(r * 0.98, -r * 0.95, r * 0.3, r * 0.16, 6); ctx.fill();
  if (lid) { ctx.fillStyle = '#b8bfca'; ctx.beginPath(); ctx.ellipse(0, -r * 1.12, r * 1.05, r * 0.2, 0, Math.PI, 0); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2b2f36'; rrect(-r * 0.14, -r * 1.42, r * 0.28, r * 0.16, 6); ctx.fill(); }
  ctx.restore();
}
function drawFlame(p) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const ph = p.t * 0.6 + i * 1.7, rr = p.r * (0.55 + 0.15 * Math.sin(ph)), ox = -Math.sign(p.vx || 1) * i * p.r * 0.22, oy = -i * p.r * 0.14 + Math.sin(ph) * 6;
    const g = ctx.createRadialGradient(p.x + ox, p.y + oy, 2, p.x + ox, p.y + oy, rr * 1.4); g.addColorStop(0, 'rgba(255,250,200,0.95)'); g.addColorStop(0.35, 'rgba(255,170,40,0.85)'); g.addColorStop(1, 'rgba(255,40,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x + ox, p.y + oy, rr * 1.4, 0, 7); ctx.fill(); }
  ctx.restore();
}
function spawnFlambe(f) { const w = f.toWorld(f.J.fH); SFX.whoosh(1); SFX.zap(); if (G.fight) G.fight.shake(8);
  spawnProj({ kind: 'flame', owner: f, x: w[0] + f.facing * 60, y: Math.min(-90, w[1]), vx: f.facing * 13, vy: 0, g: 0, r: 58, life: 48, big: 1, m: { dmg: 18, lvl: 'mid', hs: 0, bs: 16, push: 50, stop: 10, p: 1.6, kd: 1 } }); }
MV.sk_flambe = { name: 'flambe', skill: 1, limb: null, lvl: 'mid', st: 16, ac: 1, rc: 22, p: 1.4, spawnAt: 16, spawn: spawnFlambe, pan: 1,
  kf: [[0, {}], [10, { ua: 200, fa: 40, lean: -16, th: 24, bth: -20 }], [16, { ua: 90, fa: 0, lean: 28, dx: 16, th: 46, bth: -38 }], [26, {}], [40, null]] };
function spawnPlates(f) { const w = f.toWorld(f.J.fH); SFX.throw();
  [-0.12, 0, 0.12].forEach((a, i) => spawnProj({ kind: 'plate', owner: f, x: w[0], y: w[1] - 6, vx: f.facing * 21 * Math.cos(a), vy: 21 * Math.sin(a), g: 0, r: 22, life: 60, vr: f.facing * 0.5, m: { dmg: 6, lvl: 'mid', hs: 16, bs: 10, push: 18, stop: 6, p: 1, kd: i === 1 ? 1 : 0 } })); }
MV.sk2_plates = { name: 'plates', skill: 1, sk2: 1, limb: null, lvl: 'mid', st: 13, ac: 1, rc: 18, p: 1.2, spawnAt: 13, spawn: spawnPlates,
  kf: [[0, {}], [7, { ua: 150, fa: 120, lean: -10, bua: 30, bfa: 120 }], [13, { ua: 96, fa: 4, lean: 18, dx: 10, th: 34, bth: -28 }], [18, {}], [31, null]] };
SKILL_IDS[CHEF] = 'sk_flambe'; SKILL_NAMES[CHEF] = 'نار المقلاة';
SKILL2[CHEF] = 'sk2_plates'; SKILL2_LINE[CHEF] = 'خذ الصحون!'; SKILL2_NAMES[CHEF] = 'رمية الصحون';
COMBOS[CHEF] = {
  '12': ['ضربة المقلاة', M({ st: 12, ac: 5, rc: 20, limb: 'fH', r: 52, dmg: 15, kd: 1, p: 1.6, stop: 12, pan: 1, mvx: [[6, 16, 6]], kf: [[0, {}], [8, { ua: 210, fa: 60, lean: -14, dx: -6, th: 20, bth: -16 }], [12, { ua: 70, fa: 10, lean: 26, dx: 18, th: 40, bth: -34 }], [20, {}], [37, null]] })],
  '23': ['طماطم طايرة', projMove(12, 22, PZ.windup, PZ.release, f => { SFX.throw(); shoot(f, { kind: 'tomato', sp: 18, ang: -0.12, g: 0.25, r: 18, dmg: 7, vr: 0.3, life: 80 }); }, { onStep: f => { if (f.mt === 18) { SFX.throw(); shoot(f, { kind: 'tomato', sp: 20, ang: -0.05, g: 0.2, r: 18, dmg: 7, vr: 0.3, life: 80 }); } } })],
  '24': ['رشة البهارات', projMove(10, 18, { ...PZ.windup, ua: 120 }, { ...PZ.release, ua: 90 }, f => { SFX.whoosh(0); shoot(f, { kind: 'spice', sp: 9, r: 46, dmg: 11, launch: 1, life: 32, vr: 0 }); })],
  '13': ['قدر من السما', projMove(16, 24, PZ.summon, { ...PZ.summon, lean: -22 }, f => { SFX.skill(); shoot(f, { kind: 'pot', from: 'sky', vy: 5, g: 0.65, r: 62, dmg: 18, kd: 1, p: 1.7, vr: 0, life: 160 }); })],
  '14': ['تقطيع سريع', flurryMove({ st: 6, ac: 30, rc: 16, multi: 5, dmg: 2.8, hs: 14, bs: 7, push: 3, stop: 2, r: 38, mvx: [[6, 36, 2]] })],
  '34': ['ركلة الشيف', M({ st: 12, ac: 4, rc: 20, limb: 'fT', r: 42, dmg: 14, push: 60, kick: 1, p: 1.5, kf: [[0, {}], [8, PZ.stompUp], [12, { th: 90, sh: 0, ft: -40, ffl: 0, lean: -14, dx: 10 }], [16, {}], [36, null]] })],
};
// ================= المبرمج — الدكتور's coder outfit: lightning, bugs, keyboards and laptops =================
const CODER = CHARS.length;
CHARS.push({ name: 'المبرمج', en: 'THE CODER', tag: 'كهربا وأكواد', hp: 0.98, dmg: 1.06, spd: 1.03, color: '#ff2a3a', stats: [4, 4, 3], quote: 'صلّحت البق… وأنت كنت البق!', hidden: 1 });
OUTFITS[3] = [{ id: '', name: 'الأساسي' }, { id: 'coder', name: 'المبرمج', as: CODER }];
function drawBolt(x1, y1, x2, y2, w = 6, seed = 0, core = '#ffffff', glow = 'rgba(255,40,60,0.8)') {
  const n = 12, pts = [[x1, y1]], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let i = 1; i < n; i++) { const u = i / n, j = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453; const o = ((j - Math.floor(j)) - 0.5) * Math.min(80, L * 0.12); pts.push([x1 + dx * u + nx * o, y1 + dy * u + ny * o]); }
  pts.push([x2, y2]);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
  for (const [lw, c] of [[w * 4, glow.replace('0.8', '0.25')], [w * 1.8, glow], [w * 0.6, core]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
  ctx.restore();
}
function drawKeyboard(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const W = r * 1.8, H = r * 0.62;
  ctx.fillStyle = '#16171c'; ctx.strokeStyle = '#ff2a3a'; ctx.lineWidth = 2; rrect(-W / 2, -H / 2, W, H, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#3a3d46'; for (let row = 0; row < 3; row++) for (let c = 0; c < 9; c++) { ctx.fillRect(-W / 2 + 6 + c * (W - 12) / 9, -H / 2 + 6 + row * (H - 12) / 3, (W - 12) / 9 - 3, (H - 12) / 3 - 3); }
  ctx.restore();
}
function drawLaptop(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const W = r * 1.7, H = r * 1.05;
  ctx.fillStyle = '#1b1d24'; ctx.strokeStyle = '#555b66'; ctx.lineWidth = 3; rrect(-W / 2, -H, W, H, 8); ctx.fill(); ctx.stroke();
  const g = ctx.createLinearGradient(0, -H, 0, 0); g.addColorStop(0, '#16202e'); g.addColorStop(1, '#0a0e16'); ctx.fillStyle = g; rrect(-W / 2 + 8, -H + 8, W - 16, H - 16, 4); ctx.fill();
  ctx.fillStyle = '#ff2a3a'; ctx.font = `900 ${Math.round(r * 0.55)}px ${FE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr'; ctx.fillText('</>', 0, -H / 2);
  ctx.fillStyle = '#2b2e36'; ctx.beginPath(); ctx.moveTo(-W / 2 - 10, 0); ctx.lineTo(W / 2 + 10, 0); ctx.lineTo(W / 2 + 22, r * 0.16); ctx.lineTo(-W / 2 - 22, r * 0.16); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawBug(p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(Math.sign(p.vx) || 1, 1); const r = p.r;
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) { const k = Math.sin(p.t * 0.9 + i) * 5; ctx.beginPath(); ctx.moveTo(i * r * 0.5, 0); ctx.lineTo(i * r * 0.5 - 6 + k, r * 0.9); ctx.stroke(); }
  const g = ctx.createRadialGradient(-r * 0.2, -r * 0.4, 2, 0, 0, r); g.addColorStop(0, '#5a5f6b'); g.addColorStop(1, '#16171c'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -r * 0.1, r, r * 0.72, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#ff2a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.5); ctx.stroke();
  ctx.fillStyle = '#ff3040'; ctx.beginPath(); ctx.arc(r * 0.8, -r * 0.25, r * 0.22, 0, 7); ctx.fill();
  ctx.restore();
}
function drawCodeGlyph(p) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * 0.15); ctx.shadowColor = '#ff1030'; ctx.shadowBlur = 24; ctx.fillStyle = '#ff3a4a'; ctx.font = `900 ${Math.round(p.r * 1.3)}px ${FE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr'; ctx.fillText('</>', 0, 0); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = `900 ${Math.round(p.r * 1.1)}px ${FE}`; ctx.fillText('</>', 0, 0); ctx.restore(); }
function zapHB(f) { if (!f.active()) return null; const w = f.toWorld(f.J.fH), L = 640; return { x: w[0] + f.facing * L, y: w[1], x2: w[0], y2: w[1], ar: 18, r: 18 }; }
MV.sk_zap = { name: 'zap', skill: 1, limb: null, lvl: 'mid', st: 14, ac: 26, rc: 20, dmg: 4.6, hs: 12, bs: 6, push: 8, stop: 3, p: 0.9, multi: 4, zap: 1, hitboxFn: zapHB,
  onStep: f => { if (f.mt === 2) SFX.zap(); if (f.mt >= f.mv.st && f.mt < f.mv.st + f.mv.ac) { if (f.mt % 4 === 0) SFX.zap(); if (f.mt % 2 === 0) { const w = f.toWorld(f.J.fH); finBurst(w[0], w[1], 3, ['#ff3040', '#ffffff'], 6, 4); } } },
  kf: [[0, {}], [10, { ua: 40, fa: 120, lean: -10, dx: -6 }], [14, { ua: 92, fa: 0, lean: 18, dx: 14, th: 30, bth: -28 }], [40, { ua: 92, fa: 0, lean: 18, dx: 14, th: 30, bth: -28 }], [48, {}], [60, null]] };
function spawnBugs(f) { SFX.skill(); [0, 1, 2].forEach(i => spawnProj({ kind: 'bug', owner: f, x: f.x + f.facing * (60 + i * 30), y: -28, vx: f.facing * (7 + i * 1.6), vy: 0, g: 0, r: 28, life: 90, ground: true, m: { dmg: 5.5, lvl: 'low', hs: 14, bs: 8, push: 14, stop: 5, p: 1, kd: i === 2 ? 1 : 0 } })); }
MV.sk2_bugs = { name: 'bugs', skill: 1, sk2: 1, limb: null, lvl: 'low', st: 14, ac: 1, rc: 18, p: 1.1, spawnAt: 14, spawn: spawnBugs,
  kf: [[0, {}], [8, { ...CROUCH, ua: 40, fa: 30 }], [14, { ...CROUCH, ua: 80, fa: 10, lean: 30 }], [20, {}], [32, null]] };
SKILL_IDS[CODER] = 'sk_zap'; SKILL_NAMES[CODER] = 'صاعقة الكود';
SKILL2[CODER] = 'sk2_bugs'; SKILL2_LINE[CODER] = 'انطلقوا يا البقّات!'; SKILL2_NAMES[CODER] = 'جيش البقّات';
COMBOS[CODER] = {
  '12': ['لكمة كهربا', M({ st: 10, ac: 4, rc: 18, limb: 'fH', r: 46, dmg: 13, p: 1.4, stop: 10, mvx: [[4, 14, 7]], onStep: f => { if (f.mt === 10) { SFX.zap(); const w = f.toWorld(f.J.fH); finBurst(w[0], w[1], 12, ['#ff3040', '#ffffff'], 8, 5); } }, kf: [[0, {}], [7, { ua: 30, fa: 130, lean: -10, dx: -6 }], [10, PZ.punch], [16, {}], [32, null]] })],
  '23': ['كيبورد طاير', projMove(12, 20, PZ.windup, PZ.release, f => { SFX.throw(); shoot(f, { kind: 'keyboard', sp: 19, r: 36, dmg: 12, vr: 0.35, life: 80, p: 1.3 }); })],
  '24': ['شبكة الكود', projMove(14, 20, { ...PZ.windup, ua: 120 }, { ...PZ.release, ua: 90 }, f => { SFX.zap(); shoot(f, { kind: 'code', sp: 12, r: 40, dmg: 12, launch: 1, life: 70, vr: 0.1 }); })],
  '13': ['لابتوب من السما', projMove(16, 24, PZ.summon, { ...PZ.summon, lean: -22 }, f => { SFX.skill(); shoot(f, { kind: 'laptop', from: 'sky', vy: 5, g: 0.65, r: 58, dmg: 17, kd: 1, p: 1.7, vr: 0.06, life: 160 }); })],
  '14': ['كتابة سريعة', flurryMove({ st: 6, ac: 30, rc: 16, multi: 5, dmg: 2.6, hs: 14, bs: 7, push: 3, stop: 2, r: 36, mvx: [[6, 36, 2]] })],
  '34': ['ركلة الريستارت', M({ st: 12, ac: 4, rc: 20, limb: 'fT', r: 42, dmg: 13, push: 60, kick: 1, p: 1.5, kf: [[0, {}], [8, PZ.stompUp], [12, { th: 90, sh: 0, ft: -40, ffl: 0, lean: -14, dx: 10 }], [16, {}], [36, null]] })],
};
// ================= المروض — الزعيم's tamer outfit: dogs, cats, a parrot and a falcon fight for him =================
const TAMER = CHARS.length;
CHARS.push({ name: 'المروض', en: 'THE TAMER', h: 0.9, tag: 'جيشه من الحيوانات', hp: 1.04, dmg: 1.04, spd: 1.0, color: '#d9a441', stats: [4, 4, 4], quote: 'حتى القطو أقوى منك!', hidden: 1 });
OUTFITS[0] = [{ id: '', name: 'الأساسي' }, { id: 'tamer', name: 'المروض', as: TAMER }];
SFX.bark = () => { if (!SET.fx) return; tn('square', 560, 320, 0.08, 0.05); tn('sawtooth', 420, 240, 0.09, 0.04, 0.01); tn('square', 600, 330, 0.07, 0.045, 0.16); };
SFX.meow = () => { if (!SET.fx) return; tn('sine', 620, 980, 0.12, 0.05); tn('sine', 980, 520, 0.18, 0.05, 0.12); };
SFX.squawk = () => { if (!SET.fx) return; tn('sawtooth', 1300, 900, 0.1, 0.04); tn('square', 1500, 1000, 0.08, 0.03, 0.08); };
const DOGC = { golden: ['#e6b056', '#b97a2c', '#f6dca8'], husky: ['#8b909a', '#4e535d', '#f2f2f2'] };
function drawDog(x, y, dir, t, s = 1, kind = 'golden', bite = false) {
  const [c1, c2, c3] = DOGC[kind] || DOGC.golden;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 2, 64, 9, 0, 0, 7); ctx.fill();
  ctx.lineCap = 'round'; ctx.strokeStyle = c2; ctx.lineWidth = 11;
  [[-36, 0], [-20, 2.4], [24, 1.2], [40, 3.6]].forEach(([lx, ph]) => { const a = Math.sin(t * 0.55 + ph) * 0.65; ctx.beginPath(); ctx.moveTo(lx, -46); ctx.lineTo(lx + Math.sin(a) * 30, -4); ctx.stroke(); });
  const tw = Math.sin(t * 0.8) * 10; ctx.strokeStyle = c1; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-50, -62); ctx.quadraticCurveTo(-74, -70, -82, -96 + tw); ctx.stroke();
  const g = ctx.createLinearGradient(0, -86, 0, -36); g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(-2, -60, 56, 25, 0, 0, 7); ctx.fill();
  ctx.fillStyle = c3; ctx.beginPath(); ctx.ellipse(30, -50, 22, 15, 0.3, 0, 7); ctx.fill();
  ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(56, -86, 23, 0, 7); ctx.fill();
  ctx.fillStyle = kind === 'husky' ? c3 : c1; ctx.beginPath(); ctx.ellipse(78, -78, 18, 11, 0.1, 0, 7); ctx.fill();
  if (kind === 'husky') { ctx.fillStyle = c3; ctx.beginPath(); ctx.arc(60, -80, 13, 0, 7); ctx.fill(); ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(42, -100); ctx.lineTo(48, -122); ctx.lineTo(58, -104); ctx.fill(); }
  else { ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(44, -84, 9, 19, 0.35, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(94, -81, 5.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(62, -92, 3.6, 0, 7); ctx.fill();
  if (bite || Math.sin(t * 0.3) > 0) { ctx.fillStyle = '#ff7a96'; ctx.beginPath(); ctx.ellipse(82, -64, 7, 11, 0.2, 0, 7); ctx.fill(); }
  ctx.restore();
}
function drawCat(x, y, dir, t, s = 1, leap = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  const g = ctx.createLinearGradient(0, -50, 0, -14); g.addColorStop(0, '#9a9488'); g.addColorStop(1, '#5d574d');
  ctx.lineCap = 'round'; ctx.strokeStyle = '#6a6458'; ctx.lineWidth = 7;
  if (leap) { [[22, 1], [14, 1], [-22, -1], [-14, -1]].forEach(([lx, d]) => { ctx.beginPath(); ctx.moveTo(lx, -30); ctx.lineTo(lx + d * 26, -24 + (d > 0 ? -8 : 6)); ctx.stroke(); }); }
  else { [-20, -10, 14, 24].forEach((lx, i) => { const a = Math.sin(t * 0.6 + i) * 0.4; ctx.beginPath(); ctx.moveTo(lx, -24); ctx.lineTo(lx + Math.sin(a) * 12, 0); ctx.stroke(); }); }
  ctx.strokeStyle = '#7d776b'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-32, -34); ctx.quadraticCurveTo(-56, -40 + Math.sin(t * 0.5) * 6, -50, -66); ctx.stroke();
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -32, 36, 15, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(40,36,30,0.6)'; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 11, -42, 9, 0.3, 2.6); ctx.stroke(); }
  ctx.fillStyle = '#948e82'; ctx.beginPath(); ctx.arc(36, -46, 16, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(26, -56); ctx.lineTo(28, -74); ctx.lineTo(38, -60); ctx.fill(); ctx.beginPath(); ctx.moveTo(40, -60); ctx.lineTo(48, -74); ctx.lineTo(50, -55); ctx.fill();
  ctx.fillStyle = '#c8e05a'; ctx.beginPath(); ctx.ellipse(40, -48, 3.5, 4.5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(48, -47, 3, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#ff9aa8'; ctx.beginPath(); ctx.arc(51, -41, 2.6, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.2; for (const dy of [-41, -38]) { ctx.beginPath(); ctx.moveTo(50, dy); ctx.lineTo(66, dy - 3 + (dy + 39)); ctx.stroke(); }
  ctx.restore();
}
function drawBirdA(x, y, dir, t, s = 1, kind = 'parrot', dive = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.rotate(dive);
  const P = kind === 'parrot', wing = Math.sin(t * 0.9) * 0.9;
  ctx.fillStyle = P ? '#2a6fd6' : '#6b4a2c'; ctx.beginPath(); ctx.moveTo(-26, 2); ctx.lineTo(-74, 14); ctx.lineTo(-70, 2); ctx.lineTo(-26, -6); ctx.fill();
  ctx.save(); ctx.rotate(-wing); ctx.fillStyle = P ? '#1f5cc0' : '#5a3c22'; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(-30, -60, -64, -66); ctx.quadraticCurveTo(-40, -30, -20, 2); ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(0, -20, 0, 18); g.addColorStop(0, P ? '#2a7be0' : '#7a5634'); g.addColorStop(1, P ? '#f5c518' : '#d9c2a0');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 30, 15, -0.15, 0, 7); ctx.fill();
  if (!P) { ctx.fillStyle = 'rgba(60,40,20,0.6)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-14 + i * 6, 4 + (i % 2) * 4, 2, 0, 7); ctx.fill(); } }
  ctx.fillStyle = P ? '#2f9a4a' : '#7a5634'; ctx.beginPath(); ctx.arc(28, -12, 13, 0, 7); ctx.fill();
  if (P) { ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.arc(32, -10, 8, 0, 7); ctx.fill(); }
  ctx.fillStyle = P ? '#222' : '#f2c230'; ctx.beginPath(); ctx.moveTo(38, -14); ctx.quadraticCurveTo(52, -10, 42, 0); ctx.lineTo(38, -6); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(30, -15, 2.6, 0, 7); ctx.fill();
  ctx.save(); ctx.rotate(wing * 0.8); ctx.fillStyle = P ? '#3a86ea' : '#7c5532'; ctx.beginPath(); ctx.moveTo(4, -6); ctx.quadraticCurveTo(-18, -54, -50, -62); ctx.quadraticCurveTo(-26, -24, -8, 6); ctx.fill(); ctx.restore();
  ctx.restore();
}
function drawCage(x, y, rot, r) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = '#c9ccd4'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(30,30,36,0.35)'; rrect(-r, -r * 1.1, r * 2, r * 2.1, 10); ctx.fill(); ctx.stroke(); for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-r + i * r / 3, -r * 1.1); ctx.lineTo(-r + i * r / 3, r); ctx.stroke(); } ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -r * 1.15, r * 0.25, Math.PI, 0); ctx.stroke(); ctx.restore(); }
function spawnDog(f, kind = 'golden', o = {}) { SFX.bark();
  spawnProj(Object.assign({ kind: 'dog', sub: kind, owner: f, x: f.x - f.facing * 30, y: -46, vx: f.facing * 15, vy: 0, g: 0, r: 46, life: 75, big: 1, ground: true, m: { dmg: 17, lvl: 'mid', hs: 0, bs: 16, push: 50, stop: 10, p: 1.6, kd: 1 } }, o)); }
MV.sk_dog = { name: 'dog', skill: 1, limb: null, lvl: 'mid', st: 12, ac: 1, rc: 22, p: 1.4, spawnAt: 12, spawn: f => spawnDog(f),
  kf: [[0, {}], [6, { ua: 160, fa: 30, lean: -6 }], [12, { ua: 92, fa: 0, lean: 18, dx: 12, th: 30, bth: -26 }], [24, {}], [36, null]] };
MV.sk2_parrot = { name: 'parrot', skill: 1, sk2: 1, limb: null, lvl: 'high', st: 12, ac: 1, rc: 18, p: 1.1, spawnAt: 12, spawn: f => { SFX.squawk(); const w = f.toWorld(f.J.fH); spawnProj({ kind: 'parrot', owner: f, x: w[0], y: w[1] - 40, vx: f.facing * 15, vy: 0, g: 0, r: 28, life: 80, sin: [16, 0.3], base: w[1] - 40, m: { dmg: 12, lvl: 'high', hs: 18, bs: 10, push: 22, stop: 7, p: 1.1 } }); },
  kf: [[0, {}], [8, { ua: 200, fa: 20, lean: -10 }], [12, { ua: 120, fa: 10, lean: 8 }], [18, {}], [30, null]] };
SKILL_IDS[TAMER] = 'sk_dog'; SKILL_NAMES[TAMER] = 'هجمة الكلب';
SKILL2[TAMER] = 'sk2_parrot'; SKILL2_LINE[TAMER] = 'طير يا ببغاء!'; SKILL2_NAMES[TAMER] = 'هجمة الببغاء';
COMBOS[TAMER] = {
  '12': ['خربشة القط', projMove(12, 20, PZ.windup, PZ.release, f => { SFX.meow(); shoot(f, { kind: 'cat', sp: 17, ang: -0.28, g: 0.5, r: 26, dmg: 12, vr: 0, life: 80 }); })],
  '23': ['دفشة الهاسكي', projMove(10, 20, { ...PZ.windup, ua: 150 }, PZ.release, f => spawnDog(f, 'husky', { vx: f.facing * 11, m: { dmg: 13, lvl: 'low', hs: 0, bs: 14, push: 40, stop: 8, p: 1.4, kd: 1 } }))],
  '24': ['نباح', projMove(10, 18, { ...PZ.windup, ua: 120 }, { ...PZ.release, ua: 90 }, f => { SFX.bark(); shoot(f, { kind: 'bark', sp: 11, r: 50, dmg: 10, launch: 1, life: 26, vr: 0 }); })],
  '13': ['انقضاض الصقر', projMove(14, 22, PZ.summon, { ...PZ.summon, lean: -22 }, f => { SFX.squawk(); shoot(f, { kind: 'falcon', from: 'sky', vy: 11, g: 0.2, r: 34, dmg: 16, kd: 1, p: 1.6, vr: 0, life: 140 }); })],
  '14': ['لكمات المروض', flurryMove({ st: 6, ac: 30, rc: 16, multi: 5, dmg: 2.6, hs: 14, bs: 7, push: 3, stop: 2, r: 36, mvx: [[6, 36, 2]] })],
  '34': ['ركلة المروض', M({ st: 12, ac: 4, rc: 20, limb: 'fT', r: 42, dmg: 13, push: 60, kick: 1, p: 1.5, kf: [[0, {}], [8, PZ.stompUp], [12, { th: 90, sh: 0, ft: -40, ffl: 0, lean: -14, dx: 10 }], [16, {}], [36, null]] })],
};
// ================= الصياد — البلدوزر's fishing outfit: a giant grouper, the rod and hook, nets and a shark =================
const FISHER = CHARS.length;
CHARS.push({ name: 'الصياد', en: 'THE FISHERMAN', tag: 'البحر صديقه', hp: 1.1, dmg: 1.08, spd: 0.92, color: '#2f86d6', stats: [5, 2, 5], quote: 'صيد ثقيل… بس سهل!', hidden: 1 });
OUTFITS[5] = [{ id: '', name: 'الأساسي' }, { id: 'fisher', name: 'الصياد', as: FISHER }];
SFX.splash = () => { if (!SET.fx) return; nz(0.35, 'bandpass', 900, 0.7, 0.14, 0, 300); nz(0.25, 'highpass', 2500, 0.6, 0.05, 0.05); };
SFX.reel = () => { if (!SET.fx) return; for (let i = 0; i < 4; i++) tn('square', 1400, 1300, 0.02, 0.025, i * 0.04); };
function drawGrouper(x, y, rot, L) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const H = L * 0.36;
  ctx.fillStyle = '#9a5a2c'; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(-L * 0.62, -H * 0.7); ctx.lineTo(-L * 0.58, 0); ctx.lineTo(-L * 0.62, H * 0.7); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-L * 0.25, -H * 0.42); ctx.quadraticCurveTo(0, -H * 1.0, L * 0.25, -H * 0.45); ctx.fill();
  const g = ctx.createLinearGradient(0, -H / 2, 0, H / 2); g.addColorStop(0, '#8a5326'); g.addColorStop(0.6, '#c98a4a'); g.addColorStop(1, '#ead2a8');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, L * 0.46, H * 0.52, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(70,35,15,0.6)'; for (let i = 0; i < 26; i++) { const a = Math.sin(i * 12.9) * 0.5 + 0.5, b = Math.cos(i * 7.3) * 0.5 + 0.5; ctx.beginPath(); ctx.arc(-L * 0.38 + a * L * 0.74, -H * 0.38 + b * H * 0.6, 2 + (i % 3), 0, 7); ctx.fill(); }
  ctx.fillStyle = '#7a3e1c'; ctx.beginPath(); ctx.ellipse(L * 0.44, H * 0.06, L * 0.08, H * 0.2, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(L * 0.32, -H * 0.16, H * 0.1, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(L * 0.33, -H * 0.16, H * 0.05, 0, 7); ctx.fill();
  ctx.restore();
}
function drawShark(x, y, rot, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#5f7486'; ctx.beginPath(); ctx.moveTo(-130, 0); ctx.lineTo(-180, -50); ctx.lineTo(-165, 0); ctx.lineTo(-180, 46); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, -40); ctx.lineTo(10, -100); ctx.lineTo(40, -38); ctx.fill();
  const g = ctx.createLinearGradient(0, -45, 0, 45); g.addColorStop(0, '#6d8396'); g.addColorStop(0.55, '#8ea4b5'); g.addColorStop(1, '#eef2f4');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 150, 46, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#7a0f18'; ctx.beginPath(); ctx.moveTo(150, -4); ctx.lineTo(96, 6); ctx.lineTo(148, 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(104 + i * 8, 7 + i * 1.5); ctx.lineTo(108 + i * 8, 15 + i * 1.5); ctx.lineTo(112 + i * 8, 7 + i * 1.5); ctx.fill(); }
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(110, -16, 6, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(40,50,60,0.6)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(70 - i * 9, -18); ctx.lineTo(66 - i * 9, 14); ctx.stroke(); }
  ctx.restore();
}
function drawNet(x, y, r, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); for (let i = -4; i <= 4; i++) { const o = i * r / 4.5, h = Math.sqrt(Math.max(0, r * r - o * o)); ctx.beginPath(); ctx.moveTo(x + o, y - h); ctx.lineTo(x + o, y + h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - h, y + o); ctx.lineTo(x + h, y + o); ctx.stroke(); } ctx.restore(); }
function drawHook(x, y) { ctx.save(); ctx.strokeStyle = '#d8dde4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 4); ctx.arc(x - 7, y + 4, 7, 0, Math.PI * 0.9); ctx.stroke(); ctx.fillStyle = '#e8231c'; ctx.beginPath(); ctx.arc(x, y - 18, 6, 0, 7); ctx.fill(); ctx.restore(); }
function splash(x, n = 20) { SFX.splash(); for (let i = 0; i < n; i++) FX.push({ t: 'p', x: x + rnd(-60, 60), y: -rnd(0, 20), vx: rnd(-5, 5), vy: -rnd(6, 15), life: rnd(22, 36), max: 36, c: i % 3 ? '#7fd6ff' : '#ffffff', sz: rnd(3, 8) }); }
MV.sk_fishslap = { name: 'fishslap', skill: 1, limb: 'fH', lvl: 'mid', st: 14, ac: 6, rc: 24, dmg: 18, hs: 0, bs: 16, push: 70, stop: 14, p: 1.8, kd: 1, r: 80, fish: 1, mvx: [[6, 18, 9]],
  onStep: f => { if (f.mt === 6) SFX.whoosh(1); if (f.mt === 14) splash(f.toWorld(f.J.fH)[0] + f.facing * 60, 12); },
  hitboxFn: f => { if (!f.active()) return null; const w = f.toWorld(f.J.fH); return { x: w[0] + f.facing * 90, y: w[1], r: 80 }; },
  kf: [[0, {}], [8, { ua: 200, fa: 60, bua: 196, bfa: 60, lean: -18, dx: -8, th: 20, bth: -16 }], [14, { ua: 80, fa: 0, bua: 84, bfa: 6, lean: 30, dx: 22, th: 46, bth: -40 }], [24, {}], [44, null]] };
MV.sk2_hook = { name: 'hook', skill: 1, sk2: 1, limb: null, lvl: 'mid', st: 14, ac: 1, rc: 22, p: 1.1, spawnAt: 14, spawn: f => { SFX.whoosh(1); SFX.reel(); const w = f.toWorld(f.J.fH); spawnProj({ kind: 'hook', owner: f, x: w[0], y: w[1] - 20, vx: f.facing * 20, vy: -3, g: 0.12, r: 22, life: 50, line: 1, m: { dmg: 11, lvl: 'mid', hs: 18, bs: 10, push: -60, stop: 8, p: 1.2 } }); },
  kf: [[0, {}], [8, { ua: 200, fa: 40, lean: -14 }], [14, { ua: 90, fa: 10, lean: 18, dx: 10 }], [24, {}], [36, null]] };
SKILL_IDS[FISHER] = 'sk_fishslap'; SKILL_NAMES[FISHER] = 'صفعة الهامور';
SKILL2[FISHER] = 'sk2_hook'; SKILL2_LINE[FISHER] = 'علقت في السنارة!'; SKILL2_NAMES[FISHER] = 'السنارة';
COMBOS[FISHER] = {
  '12': ['سمكة طايرة', projMove(12, 20, PZ.windup, PZ.release, f => { SFX.throw(); shoot(f, { kind: 'fish', sp: 18, ang: -0.1, g: 0.2, r: 30, dmg: 12, vr: 0.4, life: 80 }); })],
  '23': ['شبكة الصياد', projMove(12, 22, { ...PZ.windup, ua: 150 }, PZ.release, f => { SFX.throw(); shoot(f, { kind: 'net', sp: 12, r: 46, dmg: 11, launch: 1, life: 50, vr: 0 }); })],
  '24': ['رمية الطعوم', projMove(10, 22, PZ.windup, PZ.release, f => { SFX.throw(); [-0.15, 0, 0.15].forEach(a => shoot(f, { kind: 'lure', sp: 19, ang: a, r: 14, dmg: 4.5, vr: 0.4, life: 60 })); })],
  '13': ['قرش من البحر', projMove(14, 22, PZ.summon, { ...PZ.summon, lean: -22 }, f => { const o = G.fight.f[1 - f.slot]; splash(o.x, 26); spawnProj({ kind: 'shark', owner: f, x: o.x - f.facing * 60, y: 20, vx: f.facing * 3, vy: -21, g: 0.75, r: 70, life: 60, dir: f.facing, big: 1, m: { dmg: 18, lvl: 'mid', hs: 0, bs: 16, push: 30, stop: 10, p: 1.7, kd: 1, launchHit: 1 } }); })],
  '14': ['ضربات الصياد', flurryMove({ st: 6, ac: 30, rc: 16, multi: 5, dmg: 2.8, hs: 14, bs: 7, push: 3, stop: 2, r: 38, mvx: [[6, 36, 2]] })],
  '34': ['ركلة البحّار', M({ st: 12, ac: 4, rc: 20, limb: 'fT', r: 42, dmg: 14, push: 60, kick: 1, p: 1.5, kf: [[0, {}], [8, PZ.stompUp], [12, { th: 90, sh: 0, ft: -40, ffl: 0, lean: -14, dx: 10 }], [16, {}], [36, null]] })],
};
// ================= القنّاص — المعلّم's gangster outfit: a pistol, rapid shooting, a sniper's lock-on =================
const GUNMAN = CHARS.length;
CHARS.push({ name: 'القنّاص', en: 'THE SHOOTER', tag: 'ما يخطي الهدف', hp: 1.05, dmg: 1.05, spd: 1.0, color: '#c8102e', stats: [4, 3, 4], quote: 'آخر طلقة… كانت لك!', hidden: 1 });
OUTFITS[6] = [{ id: '', name: 'الأساسي' }, { id: 'gunman', name: 'القنّاص', as: GUNMAN }];
SFX.gun = () => { if (!SET.fx) return; nz(0.16, 'lowpass', 2600, 0.8, 0.34); nz(0.05, 'highpass', 3200, 0.6, 0.2); tn('square', 170, 40, 0.12, 0.07); };
SFX.bigGun = () => { if (!SET.fx) return; nz(0.4, 'lowpass', 1600, 0.7, 0.42); nz(0.08, 'highpass', 2800, 0.6, 0.25); tn('square', 120, 30, 0.3, 0.09); };
SFX.click = () => { if (!SET.fx) return; tn('square', 2400, 1900, 0.02, 0.035); tn('square', 1700, 1400, 0.02, 0.03, 0.06); };
// the pistol is in the sprite's hand and lies along the forearm: the muzzle is past the hand on the elbow→hand line
function gunMuzzle(f) { const e = f.toWorld(f.J.fE), h = f.toWorld(f.J.fH); return [h[0] + (h[0] - e[0]) * 0.62, h[1] + (h[1] - e[1]) * 0.62]; }
function gunShot(f, o = {}) {
  const [x, y] = gunMuzzle(f), dir = f.facing, sp = o.sp || 40, a = o.ang || 0; o.big ? SFX.bigGun() : SFX.gun();
  spawnProj({ kind: 'bullet', owner: f, x, y, vx: dir * sp * Math.cos(a), vy: sp * Math.sin(a), r: o.r || 11, life: 34, vr: 0, big: o.big ? 1 : 0, heavy: o.big ? 1 : 0, tr: [],
    m: { dmg: o.dmg || 4, lvl: o.lvl || 'mid', hs: o.hs || 14, bs: 6, push: o.push || 8, stop: o.stop || 4, p: o.p || 0.8, kd: o.kd } });
  spawnProj({ kind: 'mflash', owner: f, noHit: true, x, y, vx: 0, vy: 0, life: 4, r: o.big ? 46 : 30, dir });
  for (let i = 0; i < (o.big ? 12 : 5); i++) FX.push({ t: 'p', x, y, vx: dir * rnd(2, 8), vy: rnd(-3, 3), life: 10, max: 10, c: i % 2 ? '#fff3b0' : '#ffb020', sz: rnd(2, 5) });
  FX.push({ t: 'p', x: x - dir * 30, y: y - 10, vx: -dir * rnd(2, 4), vy: -rnd(4, 7), life: 20, max: 20, c: '#e2b04a', sz: 3 }); // the spent shell
  if (o.big && G.fight) G.fight.shake(10);
}
function drawBullet(p) {
  const dir = Math.sign(p.vx) || 1, L = p.big ? 150 : 80, w = p.big ? 7 : 3.5, ang = Math.atan2(p.vy, p.vx);
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 0, -L, 0); g.addColorStop(0, 'rgba(255,240,170,0.95)'); g.addColorStop(0.4, 'rgba(255,150,40,0.5)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(4, -w); ctx.lineTo(-L, 0); ctx.lineTo(4, w); ctx.closePath(); ctx.fill();
  if (p.big) { const a = ctx.createRadialGradient(0, 0, 2, 0, 0, 34); a.addColorStop(0, 'rgba(255,90,60,0.7)'); a.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = a; ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#d9a640'; ctx.beginPath(); ctx.ellipse(0, 0, p.big ? 10 : 7, p.big ? 4.5 : 3, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff6d0'; ctx.fillRect(-2, -1, p.big ? 7 : 5, 2);
  ctx.restore(); void dir;
}
function drawMuzzleFlash(x, y, r, dir, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= k;
  const R = [1.7, 0.3, 0.75, 0.26, 0.34, 0.26, 0.75, 0.3]; ctx.fillStyle = 'rgba(255,170,50,0.85)'; ctx.beginPath();
  R.forEach((m, i) => { const a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * r * m, Math.sin(a) * r * m); }); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,180,0.95)'; ctx.beginPath(); R.forEach((m, i) => { const a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * r * m * 0.55, Math.sin(a) * r * m * 0.55); }); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(r * 0.1, 0, r * 0.2, 0, 7); ctx.fill();
  ctx.restore();
}
const GAIM = { ua: 90, fa: 2, bua: 84, bfa: 36, lean: 6, th: 28, sh: 18, bth: -22, bsh: 10 };
MV.sk_gunfan = { name: 'gunfan', skill: 1, limb: null, lvl: 'mid', st: 12, ac: 36, rc: 18, p: 1, projLimit: 0,
  onStep: f => { if (f.mt === 2) SFX.click(); const t = f.mt - 12; if (t >= 0 && t < 36 && t % 6 === 0) gunShot(f, t === 30 ? { dmg: 8, big: 1, kd: 1, push: 40, sp: 44 } : { dmg: 3.4 }); },
  kf: [[0, {}], [10, GAIM], [17, { ...GAIM, ua: 98, lean: 2 }], [23, GAIM], [29, { ...GAIM, ua: 98, lean: 2 }], [35, GAIM], [41, { ...GAIM, ua: 104, lean: -2 }], [48, GAIM], [56, {}], [66, null]] };
MV.sk2_snipe = { name: 'snipe', skill: 1, sk2: 1, limb: null, lvl: 'mid', st: 26, ac: 1, rc: 22, p: 1.2, spawnAt: 26,
  onStep: f => { if (f.mt === 2 || f.mt === 14) SFX.click(); },
  spawn: f => gunShot(f, { dmg: 16, big: 1, kd: 1, sp: 52, r: 16, push: 60, stop: 12, p: 1.6, hs: 24 }),
  kf: [[0, {}], [8, { ...GAIM, lean: 12, th: 36, bth: -28, dx: -6 }], [26, { ...GAIM, lean: 12, th: 36, bth: -28, dx: -6 }], [30, { ...GAIM, ua: 104, lean: -4, th: 36, bth: -28, dx: -14 }], [40, {}], [49, null]] };
SKILL_IDS[GUNMAN] = 'sk_gunfan'; SKILL_NAMES[GUNMAN] = 'تطليق';
SKILL2[GUNMAN] = 'sk2_snipe'; SKILL2_LINE[GUNMAN] = 'لا تتحرك…'; SKILL2_NAMES[GUNMAN] = 'طلقة القنّاص';
COMBOS[GUNMAN] = {
  '12': ['طلقة سريعة', projMove(8, 16, GAIM, GAIM, f => gunShot(f, { dmg: 7 }))],
  '23': ['دبل تاب', M({ st: 8, ac: 12, rc: 16, projLimit: 0, onStep: f => { const t = f.mt - 8; if (t === 0 || t === 8) gunShot(f, { dmg: 5 }); }, kf: [[0, {}], [6, GAIM], [10, { ...GAIM, ua: 98 }], [14, GAIM], [18, { ...GAIM, ua: 98 }], [22, GAIM], [28, {}], [37, null]] })],
  '24': ['طلقة الرجول', projMove(10, 18, { ...GAIM, ua: 66, lean: 14, th: 34, bth: -26 }, { ...GAIM, ua: 66, lean: 14, th: 34, bth: -26 }, f => gunShot(f, { dmg: 8, lvl: 'low', kd: 1, ang: 0.26 }))],
  '13': ['طلقة من فوق', jumpMove({ st: 6, ac: 44, vy: -17, vx: 3, projLimit: 0, airPose: { ...JUMPAIR, ua: 58, fa: 2, bua: 60, bfa: 40, th: 60, sh: 100 }, step: f => { if (f.mt === 16 || f.mt === 24) gunShot(f, { dmg: 6, ang: 0.5 }); } })],
  '14': ['ضرب بالمسدس', flurryMove({ st: 6, ac: 26, rc: 16, multi: 4, dmg: 3.2, hs: 14, bs: 7, push: 3, stop: 2, r: 40, mvx: [[6, 32, 2]] })],
  '34': ['ركلة العصابة', M({ st: 12, ac: 4, rc: 20, limb: 'fT', r: 42, dmg: 13, push: 60, kick: 1, p: 1.5, kf: [[0, {}], [8, PZ.stompUp], [12, { th: 90, sh: 0, ft: -40, ffl: 0, lean: -14, dx: 10 }], [16, {}], [36, null]] })],
};
// ================= ملالي — الزعيم who chose the dark: the villain of «حرب الخالين» (unlocked as an outfit of الزعيم when the story ends) =================
const MALALI = CHARS.length;
CHARS.push({ name: 'ملالي', en: 'MALALI', h: 0.84, tag: 'سيد الظلام', hp: 1.14, dmg: 1.12, spd: 1.03, color: '#b030ff', stats: [5, 5, 4], quote: 'الظلام… ما ينهزم.', story: 1, malali: 1 });
OUTFITS[0].push({ id: 'malali', name: 'ملالي 🌑', as: MALALI, lock: 'saga' });
function bossOppOf(f) { return G.fight ? G.fight.f[1 - f.slot] : null; }
const VOIDC = ['#b030ff', '#6a1ab0', '#1a0626', '#e0b0ff'];
// كرة الظلام — a black sun gathers between his hands and rolls forward, growing
function spawnVoid(f) { const w = f.toWorld(f.J.fH); SFX.zap(); SFX.whoosh(1); if (G.fight) G.fight.shake(6);
  spawnProj({ kind: 'void', owner: f, x: w[0] + f.facing * 46, y: w[1] - 6, vx: f.facing * 10.5, vy: 0, g: 0, r: 44, life: 104, big: 1, heavy: 1, tick: voidTick, draw: drawVoid,
    m: { dmg: 16, lvl: 'mid', hs: 22, bs: 16, push: 52, stop: 10, p: 1.5, kd: 1 } }); }
function voidTick(p) { if (p.t % 2 === 0) FX.push({ t: 'p', x: p.x + rnd(-30, 30), y: p.y + rnd(-30, 30), vx: -Math.sign(p.vx) * rnd(1, 4), vy: rnd(-1.5, 1.5), life: 18, max: 18, c: VOIDC[p.t % 4], sz: rnd(3, 7) }); }
function drawVoid(p) { const t = p.t, R = p.r * (1 + Math.min(t, 30) / 60);
  ctx.save(); ctx.translate(p.x, p.y); ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(0, 0, R * 0.5, 0, 0, R * 2.2); halo.addColorStop(0, 'rgba(176,48,255,0.55)'); halo.addColorStop(1, 'rgba(90,0,180,0)'); ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, R * 2.2, 0, 7); ctx.fill();
  ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.strokeStyle = i % 2 ? 'rgba(224,176,255,0.8)' : 'rgba(176,48,255,0.9)'; ctx.beginPath(); ctx.ellipse(0, 0, R * (1.25 + i * 0.18), R * (0.45 + i * 0.1), t * 0.12 + i * 1.1, 0, 4.2); ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over'; const core = ctx.createRadialGradient(-R * 0.2, -R * 0.2, 2, 0, 0, R); core.addColorStop(0, '#2a0838'); core.addColorStop(0.75, '#05010a'); core.addColorStop(1, '#3a0a5a'); ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
  ctx.strokeStyle = '#d070ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke(); ctx.restore(); }
MV.sk_void = { name: 'void', skill: 1, limb: null, lvl: 'mid', st: 22, ac: 1, rc: 22, p: 1.5, spawnAt: 22, spawn: spawnVoid,
  onStep: f => { if (f.mt === 2) SFX.zap(); if (f.mt < 22 && f.mt % 2 === 0) { const w = f.toWorld(f.J.fH), a = rnd(0, 6.28), r = rnd(70, 140); FX.push({ t: 'p', x: w[0] + Math.cos(a) * r, y: w[1] + Math.sin(a) * r, vx: -Math.cos(a) * r / 12, vy: -Math.sin(a) * r / 12, life: 12, max: 12, c: VOIDC[f.mt % 4], sz: rnd(3, 6) }); } },
  kf: [[0, {}], [8, { ua: 64, fa: 96, bua: 60, bfa: 100, lean: -10, th: 22, bth: -18 }], [18, { ua: 74, fa: 50, bua: 70, bfa: 56, lean: -16, th: 26, bth: -20 }], [22, { ua: 94, fa: 4, bua: 90, bfa: 8, lean: 22, dx: 16, th: 42, bth: -32 }], [30, {}], [44, null]] };
// أذرع الظلام — he strikes the floor and black thorns burst up under you, three times
function tendrilTick(p) { const D = p.delay; p.noHit = p.spent || !(p.t >= D && p.t < D + 9); if (p.t === D) { SFX.thud(); if (G.fight) G.fight.shake(7); finBurst(p.x, -20, 12, VOIDC, 9, 6); } }
function drawTendril(p) { const D = p.delay, t = p.t; ctx.save();
  if (t < D) { const u = t / D; ctx.strokeStyle = `rgba(190,80,255,${0.4 + 0.5 * u})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(p.x, 2, 70 - 20 * u, 14 - 3 * u, 0, 0, 7); ctx.stroke(); ctx.fillStyle = `rgba(30,0,50,${0.5 * u})`; ctx.beginPath(); ctx.ellipse(p.x, 2, 64, 12, 0, 0, 7); ctx.fill(); ctx.restore(); return; }
  const k = t < D + 6 ? (t - D) / 6 : Math.max(0, 1 - (t - D - 6) / (p.life0 - D - 6)), H = 260 * k;
  ctx.fillStyle = '#12021c'; ctx.beginPath(); ctx.ellipse(p.x, 2, 74, 15, 0, 0, 7); ctx.fill();
  for (let i = -2; i <= 2; i++) { const bx = p.x + i * 22, h = H * (1 - Math.abs(i) * 0.22), sw = Math.sin(t * 0.3 + i) * 10 * k;
    const g = ctx.createLinearGradient(0, 0, 0, -h); g.addColorStop(0, '#05010a'); g.addColorStop(0.7, '#3a0a5a'); g.addColorStop(1, '#d070ff'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(bx - 16, 4); ctx.quadraticCurveTo(bx - 10 + sw, -h * 0.55, bx + sw * 1.6, -h); ctx.quadraticCurveTo(bx + 10 + sw, -h * 0.55, bx + 16, 4); ctx.closePath(); ctx.fill(); }
  ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(p.x, -H * 0.5, 10, p.x, -H * 0.5, 160); gl.addColorStop(0, `rgba(176,48,255,${0.4 * k})`); gl.addColorStop(1, 'rgba(176,48,255,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(p.x, -H * 0.5, 160, 0, 7); ctx.fill();
  ctx.restore(); }
function spawnTendril(f, x, delay) { spawnProj({ kind: 'tendril', owner: f, x: clamp(x, -STAGE + 50, STAGE - 50), y: -90, vx: 0, vy: 0, g: 0, r: 64, life: delay + 30, life0: delay + 30, delay, noHit: true, wide: true, keep: 1, tick: tendrilTick, draw: drawTendril,
  m: { dmg: 8, lvl: 'mid', hs: 0, bs: 12, push: 8, stop: 8, p: 1.3, launch: 1 } }); }
function tendrilStep(f) { const m = f.mv, o = bossOppOf(f); if (!o) return; const k = f.mt - m.st;
  if (k === 0) { SFX.thud(); if (G.fight) G.fight.shake(6); dust(f.x + f.facing * 40, 8); finRing(f.x + f.facing * 40, -6, '#b030ff', 140, 14); }
  if (k === 0 || k === 14 || k === 28) spawnTendril(f, o.x + (k ? rnd(-50, 50) + o.vx * 8 : 0), 14); }
MV.sk_tendril = { name: 'tendril', skill: 1, limb: null, lvl: 'mid', st: 16, ac: 30, rc: 18, p: 1.3, projLimit: 0, onStep: tendrilStep,
  kf: [[0, {}], [8, { ua: 170, fa: 40, lean: -10, th: 20, bth: -16 }], [16, { ...CROUCH, ua: 70, fa: 10, lean: 40, bua: 20, bfa: 90 }], [44, { ...CROUCH, ua: 70, fa: 10, lean: 36 }], [52, {}], [64, null]] };
// خطوة الظل — he melts into smoke and comes out behind you
function shstepStep(f) { const m = f.mv, o = bossOppOf(f); if (!o) return;
  if (f.mt === 4) { SFX.whoosh(1); finBurst(f.x, -140, 26, VOIDC, 8, 8); }
  if (f.mt >= 4 && f.mt < 22) f.invuln = Math.max(f.invuln, 2);
  if (f.mt === 14) { const side = f.x < o.x ? 1 : -1; f.x = clamp(o.x + side * 115, -STAGE + 60, STAGE - 60); f.facing = o.x > f.x ? 1 : -1; finBurst(f.x, -140, 26, VOIDC, 8, 8); SFX.zap(); }
  if (f.mt === m.st) SFX.whoosh(0); }
MV.sk_shstep = { name: 'shstep', skill: 1, limb: 'fH', lvl: 'mid', st: 22, ac: 5, rc: 20, dmg: 16, hs: 24, bs: 16, push: 60, stop: 10, r: 52, p: 1.5, kd: 1, vanish: [8, 16], onStep: shstepStep,
  kf: [[0, {}], [6, { ...CROUCH, lean: 30 }], [16, { ...CROUCH, lean: 20, ua: 40, fa: 120 }], [20, { ua: 30, fa: 140, lean: -6 }], [22, { ua: 94, fa: 0, lean: 24, dx: 20, th: 40, bth: -32 }], [30, { ua: 90, fa: 4, lean: 20, dx: 16 }], [36, {}], [47, null]] };
// موجة الظلام — a black wave that runs along the floor (jump it!)
function spawnDWave(f) { SFX.rock(); SFX.whoosh(1); if (G.fight) G.fight.shake(10); dust(f.x, 14);
  spawnProj({ kind: 'dwave', owner: f, x: f.x + f.facing * 90, y: -40, vx: f.facing * 12.5, vy: 0, g: 0, r: 46, life: 88, ground: true, big: 1, tick: p => { if (p.t % 2 === 0) FX.push({ t: 'p', x: p.x + rnd(-30, 30), y: -rnd(0, 60), vx: -Math.sign(p.vx) * rnd(1, 3), vy: -rnd(1, 4), life: 18, max: 18, c: VOIDC[p.t % 4], sz: rnd(3, 7) }); }, draw: drawDWave,
    m: { dmg: 12, lvl: 'low', hs: 20, bs: 12, push: 30, stop: 8, p: 1.3, kd: 1 } }); }
function drawDWave(p) { const d = Math.sign(p.vx) || 1, t = p.t; ctx.save(); ctx.translate(p.x, 2); ctx.scale(d, 1);
  const g = ctx.createLinearGradient(0, -150, 0, 0); g.addColorStop(0, 'rgba(208,112,255,0.9)'); g.addColorStop(0.4, '#3a0a5a'); g.addColorStop(1, '#05010a'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-120, 0); ctx.quadraticCurveTo(-60, -40, -10, -120 - Math.sin(t * 0.5) * 12); ctx.quadraticCurveTo(30, -150, 60, -90); ctx.quadraticCurveTo(40, -60, 50, -30); ctx.quadraticCurveTo(70, -10, 90, 0); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(224,176,255,0.85)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-14, -118); ctx.quadraticCurveTo(30, -150, 60, -90); ctx.stroke(); ctx.restore(); }
MV.sk_dwave = { name: 'dwave', skill: 1, limb: null, lvl: 'low', st: 18, ac: 1, rc: 22, p: 1.4, spawnAt: 18, spawn: spawnDWave,
  kf: [[0, {}], [10, { ua: 190, fa: 30, bua: 186, bfa: 34, lean: -14, th: 20, bth: -16 }], [18, { ...CROUCH, ua: 80, fa: 4, bua: 76, bfa: 8, lean: 44 }], [28, {}], [41, null]] };
// الكسوف — he rises, the sky goes black, and a column of night falls on you
function eclipseStep(f) { const m = f.mv, o = bossOppOf(f); if (!o) return; const F = G.fight;
  if (f.mt === 4) { SFX.rage(); F.shake(8); }
  if (f.mt >= 6 && f.mt < 70) f.invuln = Math.max(f.invuln, 2);
  if (f.mt === 30) { f.ecX = o.x; SFX.zap(); spawnProj({ kind: 'eclipse', owner: f, x: o.x, y: -140, vx: 0, vy: 0, g: 0, r: 96, life: 46, delay: 26, noHit: true, wide: true, big: 1, heavy: 1,
    keep: 1, tick: p => { p.noHit = p.spent || !(p.t >= p.delay && p.t < p.delay + 8); if (p.t < p.delay) p.x = lerp(p.x, o.x, 0.06); if (p.t === p.delay) { SFX.thud(); SFX.rock(); F.shake(26); dust(p.x, 30); finRing(p.x, -10, '#b030ff', 300, 20); finBurst(p.x, -60, 40, VOIDC, 14, 8); } }, draw: drawEclipse,
    m: { dmg: 22, lvl: 'mid', hs: 0, bs: 18, push: 30, stop: 12, p: 1.8, kd: 1 } }); } }
function drawEclipse(p) { const D = p.delay, t = p.t; ctx.save();
  const sy = -620, u = Math.min(1, t / 14); ctx.globalCompositeOperation = 'lighter'; const cor = ctx.createRadialGradient(p.x, sy, 40, p.x, sy, 170); cor.addColorStop(0, `rgba(224,176,255,${0.7 * u})`); cor.addColorStop(1, 'rgba(120,20,200,0)'); ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(p.x, sy, 170, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#05010a'; ctx.beginPath(); ctx.arc(p.x, sy, 66 * u, 0, 7); ctx.fill();
  if (t < D) { const k = t / D; ctx.strokeStyle = `rgba(190,80,255,${0.3 + 0.6 * k})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(p.x, 2, 120 - 30 * k, 20 - 4 * k, 0, 0, 7); ctx.stroke(); }
  else { const a = Math.max(0, 1 - (t - D) / 20), g = ctx.createLinearGradient(p.x - 90, 0, p.x + 90, 0); g.addColorStop(0, 'rgba(60,0,100,0)'); g.addColorStop(0.5, `rgba(10,0,20,${0.95 * a})`); g.addColorStop(1, 'rgba(60,0,100,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - 90, sy, 180, -sy + 6);
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(224,176,255,${a})`; ctx.lineWidth = 4; for (const dx of [-60, 60]) { ctx.beginPath(); ctx.moveTo(p.x + dx, sy); ctx.lineTo(p.x + dx * 0.7, 0); ctx.stroke(); } }
  ctx.restore(); }
MV.sk_eclipse = { name: 'eclipse', skill: 1, limb: null, lvl: 'mid', st: 30, ac: 34, rc: 24, p: 1.4, projLimit: 0, onStep: eclipseStep,
  kf: [[0, {}], [10, { th: 60, sh: 100, bth: 40, bsh: 100, lean: 16, dy: 10 }], [26, { dy: -260, ua: 200, fa: 20, bua: 196, bfa: 24, lean: -8, th: 40, sh: 70, bth: 20, bsh: 60 }], [60, { dy: -260, ua: 200, fa: 20, bua: 196, bfa: 24 }], [70, { dy: 0, th: 60, sh: 90, bth: 40, bsh: 80, lean: 20 }], [78, {}], [88, null]] };
SKILL_IDS[MALALI] = 'sk_void'; SKILL_NAMES[MALALI] = 'كرة الظلام';
SKILL2[MALALI] = 'sk_tendril'; SKILL2_LINE[MALALI] = 'من تحتك!'; SKILL2_NAMES[MALALI] = 'أذرع الظلام';
Object.assign(BOSS_NAMES, { sk_void: 'كرة الظلام', sk_tendril: 'أذرع الظلام', sk_shstep: 'خطوة الظل', sk_dwave: 'موجة الظلام', sk_eclipse: 'الكسوف' });
Object.assign(BOSS_LINES, { sk_void: 'ابلعه يا ظلام!', sk_tendril: 'من تحتك!', sk_shstep: 'أنا وراك…', sk_dwave: 'اقفز… إذا تقدر!', sk_eclipse: 'انطفى نورك!' });
// his eyes burn purple in the dark
function drawMalaliEyes(f) { if (f.invis > 0) { ctx.save(); ctx.globalAlpha = Math.max(ctx.globalAlpha, 0.6); drawMalaliEyes0(f); ctx.restore(); } else drawMalaliEyes0(f); }
function drawMalaliEyes0(f) { if (!f.J || f.hp <= 0 && f.state === 'ko') return; const e = eyePos(f), k = f.R.k, s = 1 + 0.25 * Math.sin(G.frame * 0.2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const dx of [0, -f.facing * f.J.hr * 0.5 * k]) { const g = ctx.createRadialGradient(e[0] + dx, e[1], 1, e[0] + dx, e[1], 16 * s); g.addColorStop(0, 'rgba(255,230,255,1)'); g.addColorStop(0.3, 'rgba(208,112,255,0.9)'); g.addColorStop(1, 'rgba(120,0,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e[0] + dx, e[1], 16 * s, 0, 7); ctx.fill(); }
  ctx.restore(); }
// the inventor's battle suit (story): a bigger, steel-plated المبرمج with a glowing reactor
function mechRig(R) { if (R._mech) return R._mech; const P = {}; for (const k in R.P) { const p = R.P[k]; P[k] = Object.assign({}, p, { img: tinted(p.img, '#6f86a6', 0.34), dark: tinted(p.img, '#20283a', 0.55) }); }
  return (R._mech = Object.assign({}, R, { P, k: R.k * 1.2 })); }
function drawMechFront(f) { if (!f.J || f.hp <= 0) return; const c = [f.x, (f.hurt.y0 + f.hipY) / 2 - 10], s = 1 + 0.2 * Math.sin(G.frame * 0.25);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(c[0], c[1], 2, c[0], c[1], 40 * s); g.addColorStop(0, 'rgba(220,255,255,1)'); g.addColorStop(0.35, 'rgba(54,232,255,0.8)'); g.addColorStop(1, 'rgba(0,120,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0], c[1], 40 * s, 0, 7); ctx.fill();
  if (G.frame % 4 === 0) FX.push({ t: 'p', x: f.x + rnd(-40, 40), y: -rnd(0, 20), vx: rnd(-1, 1), vy: -rnd(1, 3), life: 14, max: 14, c: G.frame % 8 ? '#36e8ff' : '#ffd34d', sz: rnd(2, 5) });
  ctx.restore(); }
// his pictures and body are الزعيم's, dipped in shadow (built once the images are loaded)
function malaliAssets() { const K = MALALI + 1; for (const k in IMG) { const m = /^c1_(.+)$/.exec(k); if (m && !IMG['c' + K + '_' + m[1]]) IMG['c' + K + '_' + m[1]] = IMG[k]; }
  if (RIG['1'] && !RIG[String(K)]) RIG[String(K)] = RIG['1'];
  for (const kind of ['face', 'front', 'vs']) { const im = IMG[kind + '1']; if (!im) continue; const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(36,4,60,0.6)'; g.fillRect(0, 0, c.width, c.height); const gr = g.createLinearGradient(0, c.height, 0, 0); gr.addColorStop(0, 'rgba(176,48,255,0.35)'); gr.addColorStop(0.6, 'rgba(176,48,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); IMG[kind + K] = c; } }
// ================= القصة الثانية: ناصر (زعيم الشر الكبير) وحمد (مساعده) — story-only fighters, never on the select screen =================
// ناصر: مضرب خشب بيده، ومفتاح كفرات بيده الثانية. حمد: قوة المال والعطور — شنطة الملايين وقارورة العطر.
const NASSER = CHARS.length;
CHARS.push({ name: 'ناصر', en: 'NASSER', h: 0.95, tag: 'زعيم الشر الكبير', hp: 1.5, dmg: 1.3, spd: 0.98, color: '#e0102a', stats: [5, 4, 5], quote: 'الشارع… كله لي.', story: 1, nasser: 1, props: nasserProps });
const HAMAD = CHARS.length;
CHARS.push({ name: 'حمد', en: 'HAMAD', h: 0.93, tag: 'قوة المال والعطور', hp: 1.32, dmg: 1.2, spd: 0.95, color: '#e8b923', stats: [5, 3, 5], quote: 'كل شي له سعر… وأنت رخيص.', story: 1, hamad: 1, props: hamadProps });
const NSC = ['#e0102a', '#ff5040', '#2a0a0e', '#ffd0c0'], GOLDC = ['#ffd34d', '#e8b923', '#fff3b0', '#3fa34d'], PERFC = ['#ffe9a8', '#f7c8ff', '#ffd34d', '#ffffff'];
// ---- held weapons, drawn in world space: the grip sits in the fist and the shaft carries on along the forearm, tipped back a little
function armLine(f, back, L, tilt) { const J = f.J, e = f.toWorld(back ? J.bE : J.fE), h = f.toWorld(back ? J.bH : J.fH); let dx = h[0] - e[0], dy = h[1] - e[1]; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
  const a = -f.facing * tilt, c = Math.cos(a), s = Math.sin(a), rx = dx * c - dy * s, ry = dx * s + dy * c, k = f.R.k;
  return { g: [h[0] - rx * 18 * k, h[1] - ry * 18 * k], tip: [h[0] + rx * L * k, h[1] + ry * L * k], ang: Math.atan2(ry, rx) }; }
const batLine = f => armLine(f, false, 235, 0.42);
function drawBat(g, tip, ang, k) { const L = Math.hypot(tip[0] - g[0], tip[1] - g[1]);
  ctx.save(); ctx.translate(g[0], g[1]); ctx.rotate(ang);
  const gr = ctx.createLinearGradient(0, -14 * k, 0, 14 * k); gr.addColorStop(0, '#d9a066'); gr.addColorStop(0.5, '#a8682e'); gr.addColorStop(1, '#5e3714'); ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(0, -5 * k); ctx.lineTo(L * 0.45, -6 * k); ctx.quadraticCurveTo(L * 0.8, -13 * k, L, -12 * k); ctx.arc(L, 0, 12 * k, -Math.PI / 2, Math.PI / 2); ctx.quadraticCurveTo(L * 0.8, 13 * k, L * 0.45, 6 * k); ctx.lineTo(0, 5 * k); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,6,0.7)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#16161a'; ctx.fillRect(-4 * k, -6 * k, L * 0.3, 12 * k); ctx.fillStyle = '#3a3a40'; ctx.fillRect(-7 * k, -7 * k, 6 * k, 14 * k); // tape + knob
  ctx.strokeStyle = 'rgba(255,230,190,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L * 0.4, -3 * k); ctx.lineTo(L * 0.95, -7 * k); ctx.stroke();
  ctx.restore(); }
function drawWrench(x, y, ang, k, spin) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const L = 120 * k;
  ctx.strokeStyle = '#2a2c32'; ctx.lineCap = 'round'; ctx.lineWidth = 11 * k; ctx.beginPath(); ctx.moveTo(-L * 0.15, 0); ctx.lineTo(L, 0); ctx.lineTo(L + 2 * k, 30 * k); ctx.stroke();
  ctx.strokeStyle = '#6d727c'; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.moveTo(0, -3 * k); ctx.lineTo(L - 4 * k, -3 * k); ctx.stroke();
  ctx.fillStyle = '#1b1c20'; ctx.beginPath(); ctx.arc(L + 2 * k, 34 * k, 10 * k, 0, 7); ctx.fill(); ctx.fillStyle = '#4a4e57'; ctx.beginPath(); ctx.arc(L + 2 * k, 34 * k, 5 * k, 0, 7); ctx.fill();
  if (spin) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,80,60,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(L * 0.45, 8 * k, L * 0.75, 0, 7); ctx.stroke(); }
  ctx.restore(); }
function nasserProps(f, front) { if (!f.J || !f.R) return; const k = f.R.k;
  if (!front) { if (!(G.fight && G.fight.proj.some(q => q.owner === f && q.kind === 'wrench'))) { const w = armLine(f, true, 120, 0.3); drawWrench(w.g[0], w.g[1], w.ang, k); } return; }
  if (f.state === 'rageVic' || f.batGone) return; const b = batLine(f); drawBat(b.g, b.tip, b.ang, k);
  if (f.state === 'attack' && f.mv && f.mv.bat && f.mt >= f.mv.st - 2 && f.mt <= f.mv.st + f.mv.ac + 2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,90,60,0.5)'; ctx.lineWidth = 22 * k; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.g[0], b.g[1]); ctx.lineTo(b.tip[0], b.tip[1]); ctx.stroke(); ctx.restore(); } }
const batHB = f => { if (!f.active()) return null; const b = batLine(f), k = f.R.k; return { x: b.tip[0], y: b.tip[1], x2: b.g[0] + (b.tip[0] - b.g[0]) * 0.3, y2: b.g[1] + (b.tip[1] - b.g[1]) * 0.3, ar: 30 * k + 8, r: 30 * k + 8 }; };
function drawBriefcase(x, y, rot, k, open) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const W = 120 * k, H = 92 * k;
  ctx.strokeStyle = '#c9a23a'; ctx.lineWidth = 6 * k; ctx.beginPath(); ctx.moveTo(-18 * k, 0); ctx.lineTo(-18 * k, 10 * k); ctx.lineTo(18 * k, 10 * k); ctx.lineTo(18 * k, 0); ctx.stroke(); // handle
  const g = ctx.createLinearGradient(-W / 2, 0, W / 2, 0); g.addColorStop(0, '#0d0d10'); g.addColorStop(0.5, '#24242a'); g.addColorStop(1, '#0d0d10'); ctx.fillStyle = g; rrect(-W / 2, 10 * k, W, H, 7 * k); ctx.fill();
  ctx.strokeStyle = '#d8b04a'; ctx.lineWidth = 3 * k; rrect(-W / 2, 10 * k, W, H, 7 * k); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-W / 2, 24 * k); ctx.lineTo(W / 2, 24 * k); ctx.stroke();
  ctx.fillStyle = '#e8c45a'; ctx.font = `900 ${Math.round(34 * k)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♛', 0, 62 * k);
  if (open) { ctx.fillStyle = '#3c9a4a'; for (let i = 0; i < 5; i++) ctx.fillRect(-W / 2 + 10 * k + i * 21 * k, 2 * k - (i % 2) * 6 * k, 18 * k, 12 * k); }
  ctx.restore(); }
function drawPerfume(x, y, rot, k, sc = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc * k, sc * k);
  const g = ctx.createLinearGradient(-16, 0, 16, 0); g.addColorStop(0, 'rgba(255,214,120,0.9)'); g.addColorStop(0.5, 'rgba(255,245,200,0.95)'); g.addColorStop(1, 'rgba(200,140,40,0.9)'); ctx.fillStyle = g; rrect(-16, -22, 32, 38, 5); ctx.fill();
  ctx.fillStyle = '#d8a530'; ctx.fillRect(-9, -36, 18, 14); ctx.fillStyle = '#111'; ctx.fillRect(-11, -12, 22, 14); ctx.fillStyle = '#e8c45a'; ctx.font = '900 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♛', 0, -5);
  ctx.restore(); }
function hamadProps(f, front) { if (!f.J || !f.R) return; const k = f.R.k;
  if (!front) { if (f.caseOpen || f.state === 'rageSeq' || (f.mv && f.mv.brief && f.state === 'attack')) { const h = f.toWorld(f.J.bH); drawBriefcase(h[0], h[1] - 4 * k, Math.sin(G.frame * 0.05) * 0.06, k * 0.9, f.caseOpen); } return; }
  if (f.state === 'rageVic') return; const h = f.toWorld(f.J.fH), e = f.toWorld(f.J.fE); drawPerfume(h[0] + (h[0] - e[0]) * 0.12, h[1] + (h[1] - e[1]) * 0.12 - 6 * k, Math.atan2(h[1] - e[1], h[0] - e[0]) + Math.PI / 2 - f.facing * 0.2, k, 0.9);
  if (f.kingT > 0 && G.frame % 3 === 0) FX.push({ t: 'p', x: f.x + rnd(-60, 60), y: -rnd(20, 380), vx: rnd(-0.6, 0.6), vy: -rnd(1.5, 3.5), life: 28, max: 28, c: GOLDC[G.frame % 3], sz: rnd(2, 5) }); }
// ================= ناصر — moves =================
const BATUP = { ua: 150, fa: 120, bua: 30, bfa: 120, lean: -10, th: 26, sh: 20, bth: -20, bsh: 10 };   // bat cocked over the shoulder
const BATHIT = { ua: 86, fa: 0, lean: 26, dx: 18, th: 40, bth: -32, bua: 20, bfa: 140 };
const batMove = o => M(Object.assign({ limb: null, bat: 1, hitboxFn: batHB, onStep: f => { if (f.mt === f.mv.st - 2) SFX.whoosh(1); } }, o));
// ضربة الهوم رن — the big swing that sends you flying
MV.sk_ns_homer = batMove({ name: 'homer', skill: 1, lvl: 'mid', st: 18, ac: 6, rc: 24, dmg: 22, hs: 24, bs: 18, push: 90, stop: 14, p: 1.8, launch: 1,
  onStep: f => { if (f.mt === 4) SFX.rage(); if (f.mt === 16) SFX.whoosh(1); if (f.mt === 18 && G.fight) G.fight.shake(10); },
  onHit: (a, d, blk) => { if (blk) return; SFX.thud(); popText('هوم رن! ⚾', d.x, -460, '#ff5040', 46); finRing(d.x, d.hipY - 160, '#ff5040', 220, 16); d.vx = a.facing * 9; },
  kf: [[0, {}], [10, { ...BATUP, ua: 205, fa: 70, lean: -18, th: 30, bth: -26 }], [18, { ...BATHIT, ua: 70 }], [24, { ...BATHIT, ua: 40, fa: 10, lean: 30 }], [34, {}], [48, null]] });
// المفتاح الطاير — the lug wrench spins out and comes back like a boomerang
function wrenchTick(p) { const o = p.owner; if (!o) return; if (p.t === 26) { p.vx = -p.vx * 0.2; p.back = 1; p.spent = false; p.noHit = false; }
  if (p.back) { const dx = o.x - p.x, dy = (o.hipY - 220) - p.y; p.vx = lerp(p.vx, Math.sign(dx) * 17, 0.18); p.vy = lerp(p.vy, dy * 0.08, 0.2); if (Math.abs(dx) < 50) p.life = 0; }
  if (p.t % 6 === 0) SFX.whoosh(0); }
function spawnWrench(f) { SFX.throw(); const w = f.toWorld(f.J.bH);
  spawnProj({ kind: 'wrench', owner: f, x: w[0], y: w[1] - 30, vx: f.facing * 17, vy: 0, g: 0, r: 34, life: 90, vr: 0.5 * f.facing, tick: wrenchTick, draw: p => drawWrench(p.x, p.y, p.rot, 1.15, 1),
    m: { dmg: 9, lvl: 'mid', hs: 18, bs: 10, push: 14, stop: 6, p: 1.1 } }); }
MV.sk2_ns_wrench = { name: 'nwrench', skill: 1, sk2: 1, limb: null, lvl: 'mid', st: 14, ac: 1, rc: 18, p: 1.1, spawnAt: 14, spawn: spawnWrench, projLimit: 1,
  kf: [[0, {}], [8, { bua: 200, bfa: 60, lean: -12, ua: 40, fa: 120, th: 26, bth: -22 }], [14, { bua: 80, bfa: 4, lean: 22, dx: 10, ua: 40, fa: 120, th: 36, bth: -28 }], [22, {}], [33, null]] };
// زلزال المضرب — he jumps and smashes the bat into the floor: the ground splits both ways
MV.sk_ns_slam = batMove({ name: 'nslam', skill: 1, lvl: 'mid', st: 30, ac: 5, rc: 26, dmg: 14, hs: 20, bs: 14, push: 30, stop: 10, p: 1.4, kd: 1,
  onStep: f => { if (f.mt === 8) { f.vy = -15; f.y = -2; f.jumping = true; SFX.jump(); } if (f.mt === 30) { SFX.thud(); SFX.rock(); if (G.fight) G.fight.shake(20); dust(f.x + f.facing * 120, 18); finRing(f.x + f.facing * 120, -6, '#ff5040', 240, 16); wave(f, { dmg: 12, sp: 13 }); wave(f, { dir: -f.facing, dmg: 12, sp: 13 }); } },
  kf: [[0, {}], [8, { ...CROUCH }], [14, { ...BATUP, ua: 200, fa: 40, th: 70, sh: 110, bth: 30, bsh: 100 }], [28, { ...BATUP, ua: 210, fa: 30, th: 60, sh: 90 }], [30, { ...PZ.pound, ua: 80, fa: 0 }], [44, { ...PZ.pound, ua: 76, fa: 4 }], [52, {}], [61, null]] });
// هجمة الشوارع — he charges and lands four bat blows
MV.sk_ns_rush = M({ name: 'nrush', skill: 1, bat: 1, lvl: 'mid', st: 10, ac: 34, rc: 20, dmg: 5.5, hs: 16, bs: 8, push: 4, stop: 3, p: 1.2, multi: 4, mvx: [[10, 40, 9]], hitboxFn: batHB,
  onStep: f => { if (f.mt >= 10 && f.mt < 44 && (f.mt - 10) % 8 === 0) SFX.whoosh(1); },
  poseFn: f => { const t = f.mt - 10; if (t < 0) return G2(BATUP); if (t >= 34) return G2({ ...BATHIT, ua: 60 }); const ph = ((t / 8) | 0) % 2, u = (t % 8) / 8; return G2(ph ? { ...BATHIT, ua: lerp(170, 60, u), fa: lerp(80, 0, u), lean: 24 } : { ...BATHIT, ua: lerp(40, 150, u), fa: lerp(0, 60, u), lean: 18 }); },
  kf: [[0, {}], [8, BATUP], [44, BATHIT], [52, {}], [64, null]] });
// الإعصار — the bat whirls around him and hits both sides
MV.sk_ns_spin = M({ name: 'nspin', skill: 1, bat: 1, lvl: 'mid', st: 12, ac: 36, rc: 22, dmg: 6, hs: 16, bs: 8, push: 10, stop: 3, p: 1.2, multi: 4, mvx: [[12, 48, 3]],
  hitboxFn: f => f.active() ? { x: f.x, y: f.hipY - 120, r: 190 } : null,
  onStep: f => { if (f.mt >= 12 && f.mt < 48) { if (f.mt % 6 === 0) { f.facing = -f.facing; SFX.whoosh(1); } if (f.mt % 2 === 0) FX.push({ t: 'ring', x: f.x, y: f.hipY - 120, life: 8, max: 8, c: 'rgba(255,80,60,0.6)', r0: 60, r1: 190 }); } },
  kf: [[0, {}], [10, BATUP], [12, BATHIT], [48, BATHIT], [56, {}], [70, null]] });
SKILL_IDS[NASSER] = 'sk_ns_homer'; SKILL_NAMES[NASSER] = 'ضربة الهوم رن';
SKILL2[NASSER] = 'sk2_ns_wrench'; SKILL2_LINE[NASSER] = 'خذ المفتاح!'; SKILL2_NAMES[NASSER] = 'المفتاح الطاير';
COMBOS[NASSER] = {
  '12': ['ضربة المضرب', batMove({ st: 12, ac: 5, rc: 20, dmg: 15, push: 40, p: 1.5, kf: [[0, {}], [8, { ...BATUP, ua: 200, fa: 40 }], [12, { ...BATHIT, ua: 110, fa: 10, lean: 30 }], [17, { ...BATHIT, ua: 60 }], [26, {}], [37, null]] })],
  '23': ['رمية المفتاح', projMove(12, 18, { bua: 200, bfa: 60, lean: -12, ua: 40, fa: 120 }, { bua: 80, bfa: 4, lean: 22, dx: 10, ua: 40, fa: 120 }, f => { SFX.throw(); const w = f.toWorld(f.J.bH); spawnProj({ kind: 'wrench', owner: f, x: w[0], y: w[1] - 20, vx: f.facing * 19, vy: 0, g: 0, r: 30, life: 60, vr: 0.5 * f.facing, draw: p => drawWrench(p.x, p.y, p.rot, 1.1, 1), m: { dmg: 11, lvl: 'mid', hs: 16, bs: 10, push: 16, stop: 6, p: 1.1 } }); })],
  '24': ['كسر الركبة', batMove({ lvl: 'low', st: 12, ac: 5, rc: 22, dmg: 13, kd: 1, push: 30, p: 1.4, kf: [[0, {}], [8, { ...CROUCH, ua: 150, fa: 90, lean: 10 }], [12, { ...CROUCH, ua: 40, fa: 0, lean: 40, dx: 10 }], [17, { ...CROUCH, ua: 20, fa: 0, lean: 44 }], [28, {}], [39, null]] })],
  '13': ['المضرب الطاير', jumpMove({ st: 6, ac: 40, vy: -16, vx: 5, bat: 1, hitboxFn: batHB, airPose: { ...JUMPAIR, ua: 100, fa: 10, lean: 24, th: 60, sh: 100 }, dmg: 14, kd: 1, step: f => { if (f.mt === 12) SFX.whoosh(1); } })],
  '14': ['وابل المضرب', flurryMove({ st: 6, ac: 28, rc: 16, multi: 5, dmg: 3.4, hs: 14, bs: 7, push: 3, stop: 2, r: 40, bat: 1, hitboxFn: batHB, mvx: [[6, 34, 2]] })],
  '34': ['ركلة البسطار', M({ st: 12, ac: 4, rc: 20, limb: 'fT', r: 44, dmg: 14, push: 70, kick: 1, p: 1.5, kd: 1, kf: [[0, {}], [8, PZ.stompUp], [12, { th: 90, sh: 0, ft: -40, ffl: 0, lean: -14, dx: 10 }], [16, {}], [36, null]] })],
};
// ================= حمد — moves =================
// شنطة الملايين — the briefcase opens and a storm of notes shoots out
function cashNote(f, o = {}) { const h = f.toWorld(f.J.bH); spawnProj({ kind: 'cash', owner: f, x: h[0] + f.facing * 40, y: h[1] + 30 + rnd(-30, 30), vx: f.facing * (o.sp || 16) + rnd(-1, 1), vy: rnd(-2.5, 1.5), g: 0.04, r: 26, life: o.life || 46, vr: rnd(-0.3, 0.3), draw: drawCash,
  m: { dmg: o.dmg || 2.6, lvl: 'mid', hs: 12, bs: 6, push: 4, stop: 2, p: 0.7 } }); }
MV.sk_hm_case = { name: 'hcase', skill: 1, brief: 1, limb: null, lvl: 'mid', st: 14, ac: 36, rc: 20, p: 1.2, projLimit: 0,
  onStep: f => { if (f.mt === 2) SFX.click(); if (f.mt === 12) { f.caseOpen = true; SFX.zap(); } const t = f.mt - 14; if (t >= 0 && t < 36 && t % 3 === 0) { cashNote(f, t === 33 ? { dmg: 9, sp: 20 } : {}); if (t % 6 === 0) SFX.throw(); } if (f.mt === 52) f.caseOpen = false; },
  kf: [[0, {}], [10, { bua: 60, bfa: 60, lean: 6, ua: 40, fa: 120, th: 26, bth: -22 }], [14, { bua: 86, bfa: 10, lean: 12, dx: 8, ua: 40, fa: 120, th: 30, bth: -26 }], [50, { bua: 86, bfa: 10, lean: 12, dx: 8 }], [56, {}], [70, null]] };
// بخة العطر — a gold cloud that makes you dizzy
function perfumeHit(a, d, blk) { if (blk) return; popText('دايخ… 💫', d.x, -440, '#f7c8ff', 38); finBurst(d.x, d.hurt.y0 + 30, 14, PERFC, 5, 6); }
function drawPerfCloud(p) { const k = Math.min(1, p.t / 8) * Math.min(1, (p.life) / 12); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const a = p.t * 0.05 + i * 1.05, rr = p.r * (0.55 + 0.25 * Math.sin(p.t * 0.1 + i)), x = p.x + Math.cos(a) * p.r * 0.45, y = p.y + Math.sin(a) * p.r * 0.3;
    const g = ctx.createRadialGradient(x, y, 2, x, y, rr); g.addColorStop(0, `rgba(255,236,170,${0.45 * k})`); g.addColorStop(0.6, `rgba(247,200,255,${0.22 * k})`); g.addColorStop(1, 'rgba(247,200,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill(); }
  ctx.restore(); }
function spawnPerfume(f, o = {}) { const h = f.toWorld(f.J.fH); SFX.whoosh(0);
  for (let i = 0; i < 10; i++) FX.push({ t: 'p', x: h[0], y: h[1] - 10, vx: f.facing * rnd(3, 8), vy: rnd(-2, 1), life: 18, max: 18, c: PERFC[i % 4], sz: rnd(3, 6) });
  spawnProj({ kind: 'perfume', owner: f, x: h[0] + f.facing * 60, y: h[1] - 20, vx: f.facing * (o.sp || 4.5), vy: 0, g: 0, r: o.r || 70, life: o.life || 70, wide: true, draw: drawPerfCloud,
    m: { dmg: o.dmg || 6, lvl: 'mid', hs: o.hs || 46, bs: 10, push: 2, stop: 4, p: 0.9, onHit: perfumeHit } }); }
MV.sk2_hm_spray = { name: 'hspray', skill: 1, sk2: 1, limb: null, lvl: 'mid', st: 12, ac: 1, rc: 20, p: 1.0, spawnAt: 12, spawn: f => spawnPerfume(f), projLimit: 1,
  kf: [[0, {}], [8, { ua: 70, fa: 90, lean: 4, th: 24, bth: -20 }], [12, { ua: 92, fa: 10, lean: 14, dx: 8, th: 30, bth: -24 }], [24, { ua: 92, fa: 10, lean: 14 }], [30, {}], [33, null]] };
// الرشوة — he throws money at your feet; you stop to pick it up
MV.sk_hm_bribe = { name: 'hbribe', skill: 1, limb: null, lvl: 'low', st: 14, ac: 1, rc: 22, p: 1.1, spawnAt: 14, projLimit: 0,
  spawn: f => { const o = bossOpp(f); if (!o) return; SFX.throw(); spawnProj({ kind: 'cash', owner: f, x: f.toWorld(f.J.fH)[0], y: f.toWorld(f.J.fH)[1], vx: (o.x - f.x) / 34, vy: -12, g: 0.7, r: 40, life: 60, vr: 0.3, ground: false, draw: drawCash,
    m: { dmg: 4, lvl: 'low', hs: 64, bs: 10, push: 0, stop: 6, p: 0.8, onHit: (a, d, blk) => { if (blk) return; popText('يلمّ الفلوس! 💵', d.x, -440, '#3fa34d', 40); finBurst(d.x, -40, 16, GOLDC, 6, 6); } } }); },
  kf: [[0, {}], [8, { ua: 160, fa: 60, lean: -8 }], [14, { ua: 60, fa: 20, lean: 14, dx: 8 }], [24, {}], [37, null]] };
// عطر الملوك — he sprays himself: gold aura, he hits harder for a while
function kingTick(p) { const o = p.owner; if (!o) return; p.x = o.x; p.y = o.hipY - 200; if (o.kingT > 0) o.kingT--; if (p.life <= 1 || o.kingT <= 0 || o.hp <= 0) { o.dmgMul = o.dmgMul0 || 1; o.kingT = 0; p.life = 0; } }
MV.sk_hm_king = { name: 'hking', skill: 1, limb: null, lvl: 'mid', st: 18, ac: 1, rc: 18, p: 1, spawnAt: 18, projLimit: 0,
  spawn: f => { SFX.skill(); SFX.zap(); finRing(f.x, f.hipY - 200, '#ffd34d', 220, 18); finBurst(f.x, f.hipY - 260, 30, GOLDC, 8, 6); popText('عطر الملوك 👑', f.x, -500, '#ffd34d', 42);
    if (!(f.kingT > 0)) { f.dmgMul0 = f.dmgMul || 1; f.dmgMul = f.dmgMul0 * 1.3; } f.kingT = 360;
    spawnProj({ kind: 'king', owner: f, noHit: true, x: f.x, y: f.hipY - 200, vx: 0, vy: 0, g: 0, r: 10, life: 362, keep: 1, tick: kingTick, draw: p => { const o = p.owner, k = 0.5 + 0.2 * Math.sin(p.t * 0.2); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(o.x, o.hipY - 180, 20, o.x, o.hipY - 180, 240); g.addColorStop(0, `rgba(255,211,77,${0.18 * k})`); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.hipY - 180, 240, 0, 7); ctx.fill(); ctx.restore(); } }); },
  kf: [[0, {}], [10, { ua: 170, fa: 150, lean: -10, th: 18, bth: -14 }], [18, { ua: 176, fa: 160, lean: -14 }], [30, {}], [37, null]] };
// مطر الذهب — gold bars fall on you
function drawGoldBar(p) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); const g = ctx.createLinearGradient(0, -16, 0, 16); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.5, '#e8b923'); g.addColorStop(1, '#8a6420'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-34, 14); ctx.lineTo(-24, -14); ctx.lineTo(24, -14); ctx.lineTo(34, 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#7a5410'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
MV.sk_hm_gold = { name: 'hgold', skill: 1, limb: null, lvl: 'high', st: 16, ac: 40, rc: 18, p: 1.2, projLimit: 0,
  onStep: f => { const o = bossOpp(f); if (!o) return; if (f.mt === 16) { SFX.zap(); popText('ذهب!', f.x, -480, '#ffd34d', 40); } const k = f.mt - 16; if (k < 4 || k > 38 || k % 6 !== 0) return; SFX.whoosh(0);
    spawnProj({ kind: 'gold', owner: f, x: o.x + rnd(-150, 150) + o.vx * 10, y: -760, vx: 0, vy: 8, g: 0.5, r: 30, life: 120, vr: rnd(-0.2, 0.2), big: 1, draw: drawGoldBar, m: { dmg: 6, lvl: 'high', hs: 16, bs: 10, push: 8, stop: 6, p: 1.1 } }); },
  kf: [[0, {}], [10, { ua: 40, fa: 120, lean: 6 }], [16, { ua: 200, fa: 20, bua: 196, bfa: 24, lean: -14 }], [40, { ua: 186, fa: 30, bua: 182, bfa: 34 }], [56, {}], [74, null]] };
// ضربة الشنطة — he charges and swings the briefcase
MV.sk_hm_swing = M({ name: 'hswing', skill: 1, brief: 1, limb: null, lvl: 'mid', st: 14, ac: 6, rc: 22, dmg: 16, hs: 22, bs: 14, push: 80, stop: 10, p: 1.6, kd: 1, r: 70, mvx: [[6, 20, 12]],
  hitboxFn: f => { if (!f.active()) return null; const h = f.toWorld(f.J.bH); return { x: h[0] + f.facing * 30, y: h[1] + 50, r: 70 }; },
  onStep: f => { if (f.mt === 12) SFX.whoosh(1); }, onHit: (a, d, blk) => { if (!blk) { SFX.thud(); popText('صفعة الملايين!', d.x, -450, '#ffd34d', 40); } },
  kf: [[0, {}], [8, { bua: -40, bfa: 20, lean: -12, ua: 40, fa: 120, th: 30, bth: -24 }], [14, { bua: 100, bfa: 10, lean: 24, dx: 16, th: 40, bth: -30 }], [20, { bua: 140, bfa: 10, lean: 20 }], [30, {}], [42, null]] });
SKILL_IDS[HAMAD] = 'sk_hm_case'; SKILL_NAMES[HAMAD] = 'شنطة الملايين';
SKILL2[HAMAD] = 'sk2_hm_spray'; SKILL2_LINE[HAMAD] = 'شم… وطيح.'; SKILL2_NAMES[HAMAD] = 'بخة العطر';
COMBOS[HAMAD] = {
  '12': ['رزمة فلوس', projMove(10, 18, PZ.windup, PZ.release, f => { SFX.throw(); shoot(f, { sp: 18, r: 30, dmg: 10, vr: 0.3, life: 70, draw: drawCash }); })],
  '23': ['بخة سريعة', projMove(10, 18, { ua: 70, fa: 90, lean: 4 }, { ua: 92, fa: 10, lean: 14, dx: 8 }, f => spawnPerfume(f, { sp: 7, r: 50, life: 34, dmg: 5, hs: 30 }))],
  '24': ['شنطة على الرجول', M({ brief: 1, lvl: 'low', st: 12, ac: 5, rc: 22, dmg: 13, kd: 1, push: 30, p: 1.4, limb: null, r: 60, hitboxFn: f => { if (!f.active()) return null; const h = f.toWorld(f.J.bH); return { x: h[0] + f.facing * 30, y: -40, r: 60 }; },
    kf: [[0, {}], [8, { ...CROUCH, bua: -30, bfa: 20 }], [12, { ...CROUCH, bua: 70, bfa: 0, lean: 40, dx: 10 }], [17, { ...CROUCH, bua: 60, bfa: 0, lean: 44 }], [28, {}], [39, null]] })],
  '13': ['خاتم الذهب', dashMove({ st: 6, ac: 10, rc: 18, sp: 18, trail: 1, limb: 'fH', r: 46, dmg: 14, pose: PZ.punch, onStep: f => { if (f.mt === 8) { const w = f.toWorld(f.J.fH); finBurst(w[0], w[1], 10, GOLDC, 7, 5); SFX.zap(); } } })],
  '14': ['عدّ الفلوس', flurryMove({ st: 6, ac: 28, rc: 16, multi: 5, dmg: 3.2, hs: 14, bs: 7, push: 3, stop: 2, r: 40, mvx: [[6, 34, 2]], onStep: f => { barrageStep(f); if (f.mt % 5 === 0 && f.active()) { const w = f.toWorld(f.J.fH); FX.push({ t: 'p', x: w[0], y: w[1], vx: f.facing * rnd(2, 6), vy: -rnd(2, 6), life: 16, max: 16, c: '#3fa34d', sz: 6 }); } } })],
  '34': ['دفشة الكرش', M({ st: 12, ac: 6, rc: 20, dmg: 13, push: 90, p: 1.5, kd: 1, hitboxFn: bodyHB(70, -170, 70), mvx: [[8, 18, 10]], kf: [[0, {}], [8, { lean: -16, ua: 20, fa: 130, bua: 20, bfa: 130 }], [12, { lean: -24, dx: 24, th: 30, bth: -26, ua: -20, fa: 60, bua: -20, bfa: 60 }], [18, { lean: -20, dx: 20 }], [26, {}], [38, null]] })],
};
Object.assign(BOSS_NAMES, { sk_ns_homer: 'ضربة الهوم رن', sk2_ns_wrench: 'المفتاح الطاير', sk_ns_slam: 'زلزال المضرب', sk_ns_rush: 'هجمة الشوارع', sk_ns_spin: 'الإعصار',
  sk_hm_case: 'شنطة الملايين', sk2_hm_spray: 'بخة العطر', sk_hm_bribe: 'الرشوة', sk_hm_king: 'عطر الملوك', sk_hm_gold: 'مطر الذهب', sk_hm_swing: 'ضربة الشنطة' });
Object.assign(BOSS_LINES, { sk_ns_homer: 'طير!', sk2_ns_wrench: 'خذ المفتاح!', sk_ns_slam: 'الأرض نفسها تخاف مني!', sk_ns_rush: 'الشارع ما يرحم!', sk_ns_spin: 'محد يقرب مني!',
  sk_hm_case: 'كم تبي؟ خذ!', sk2_hm_spray: 'شم… وطيح.', sk_hm_bribe: 'لمّها… يا فقير.', sk_hm_king: 'ريحة الملوك!', sk_hm_gold: 'الذهب يطيح من السما!', sk_hm_swing: 'صفعة الملايين!' });
function bossPickNH(ci, d, r) { const pick = L => { let w = 0; for (const [, x] of L) w += x; let q = r * w; for (const [id, x] of L) { q -= x; if (q <= 0) return id; } return L[L.length - 1][0]; };
  if (ci === NASSER) return d > 360 ? pick([['sk2_ns_wrench', 3], ['sk_ns_slam', 2.5], ['sk_ns_rush', 3], ['sk_ns_homer', 1]]) : pick([['sk_ns_homer', 3], ['sk_ns_spin', 2.5], ['sk_ns_rush', 1.5], ['sk_ns_slam', 1.5]]);
  if (ci === HAMAD) return d > 380 ? pick([['sk_hm_case', 3], ['sk_hm_gold', 2.5], ['sk_hm_bribe', 2], ['sk2_hm_spray', 1.5], ['sk_hm_king', 1]]) : pick([['sk_hm_swing', 3], ['sk2_hm_spray', 2.5], ['sk_hm_bribe', 1.5], ['sk_hm_king', 1.2], ['sk_hm_case', 1]]);
  return null; }

const COMBO_NAME = {};
COMBOS.forEach((set, ci) => { for (const k of COMBO_KEYS) { const [name, mv] = set[k]; const id = `cb${ci}_${k}`; MV[id] = mv; mv.cname = name; COMBO_NAME[id] = name; set[k] = id; } });
COMBOS[NOKH] = COMBOS[9]; COMBOS[RAIS] = COMBOS[1]; COMBOS[RAIS2] = COMBOS[1]; COMBOS[MALALI] = COMBOS[0];
for (const id of ['spin', 'k4', 'sweep', 'hook', 'rage', 'sk_rush', 'sk_cart', 'sk_roll', 'sk_barrage', 'sk_ship', 'sk_boat', 'sk_ring', 'sk_car']) MV[id].track = 1;
for (const id in MV) {
  const m = MV[id]; m.id = id; m.total = m.st + m.ac + m.rc;
  const base = m.base === 'CROUCH' ? CROUCH : m.base === 'JUMP' ? JUMP : GUARD; m.B = base;
  let prev = Object.assign({}, base); m.K = [];
  for (const [f, o] of m.kf) { prev = o === null ? Object.assign({}, base) : Object.assign({}, prev, o); m.K.push([f, prev]); }
}
function kfPose(m, t) {
  const K = m.K;
  if (t <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) {
    const [f0, p0] = K[i], [f1, p1] = K[i + 1];
    if (t <= f1) { const u = ease((t - f0) / (f1 - f0)); const o = {}; for (const k of PK) o[k] = lerp(p0[k], p1[k], u); return o; }
  }
  return K[K.length - 1][1];
}

// ================= SOLVER =================
const lerpPt = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function segPt(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy; let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(px - ax - dx * t, py - ay - dy * t); }
function segSeg(ax, ay, bx, by, cx, cy, dx, dy) { // min distance between segments AB and CD
  const o = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
  const d1 = o(ax, ay, bx, by, cx, cy), d2 = o(ax, ay, bx, by, dx, dy), d3 = o(cx, cy, dx, dy, ax, ay), d4 = o(cx, cy, dx, dy, bx, by);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return 0;
  return Math.min(segPt(ax, ay, cx, cy, dx, dy), segPt(bx, by, cx, cy, dx, dy), segPt(cx, cy, ax, ay, bx, by), segPt(dx, dy, ax, ay, bx, by));
}
const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
const BACK_ARM_DX = 10, BACK_LEG_DX = -8;
function solve(R, p) {
  const m = R.m, hx = m.hip[0], hy = m.hip[1];
  const r = p.r * D2R, tr = r + p.lean * D2R;
  const J = { tr, r, segs: [] };
  // limbs
  const fsc = p.fsc || 1;
  const arm = (pre, ua, fa, ox) => {
    const sh = rot(m.S[0] - hx + ox, m.S[1] - hy, tr);
    const pu = tr + (90 - ua) * D2R;
    const el = [sh[0] + R.L.ua * Math.cos(pu), sh[1] + R.L.ua * Math.sin(pu)];
    const pf = pu - fa * D2R;
    const hd = [el[0] + R.L.fa * fsc * Math.cos(pf), el[1] + R.L.fa * fsc * Math.sin(pf)];
    J[pre + 'H'] = hd; J[pre + 'E'] = el;
    J[pre + 'arm'] = [['uarm', sh, pu - R.a0.ua, m.S], ['farm', el, pf - R.a0.fa, m.E, fsc]];
  };
  const leg = (pre, th, sh_, ft, fl, ox) => {
    const hp = rot(ox, 0, r);
    const pt = r + (90 - th) * D2R;
    const kn = [hp[0] + R.L.th * Math.cos(pt), hp[1] + R.L.th * Math.sin(pt)];
    const ps = pt + sh_ * D2R;
    const an = [kn[0] + R.L.sh * Math.cos(ps), kn[1] + R.L.sh * Math.sin(ps)];
    const rS = ps - R.a0.sh;
    const rF = lerp(rS + ft * D2R, 0, fl);
    J[pre + 'leg'] = [['thigh', hp, pt - R.a0.th, m.hip], ['shin', kn, rS, m.K], ['foot', an, rF, m.A]]; J[pre + 'K'] = kn;
    const to = rot(R.toe[0] - m.A[0], R.toe[1] - m.A[1], rF);
    J[pre + 'T'] = [an[0] + to[0], an[1] + to[1]];
  };
  arm('f', p.ua, p.fa, 0); arm('b', p.bua, p.bfa, BACK_ARM_DX);
  leg('f', p.th, p.sh, p.ft, p.ffl, 0); leg('b', p.bth, p.bsh, p.bft, p.bfl, BACK_LEG_DX);
  J.torso = ['torso', [0, 0], tr, m.hip];
  // body landmarks for hit detection: neck + head centre/radius (sprite units)
  J.nk = rot(m.S[0] - hx, m.S[1] - hy, tr); J.hd = rot(m.S[0] - hx, (m.bbox[1] + m.S[1]) / 2 - hy, tr); J.hr = (m.S[1] - m.bbox[1]) * 0.44; J.tw = (hy - m.S[1]) * 0.31;
  if (R.P.skirt) J.skirt = ['skirt', [0, 0], r + p.lean * 0.25 * D2R - D2R * (0.45 * Math.max(0, p.th, p.bth) + 0.1 * Math.min(0, p.th, p.bth)), m.hip];
  // hull: lowest/highest points & body box
  let maxY = -1e9, minY = 1e9, minX = 1e9, maxX = -1e9;
  const acc = (seg, box) => {
    const [name, at, a, piv] = seg; const H = R.P[name].hull; const c = Math.cos(a), s = Math.sin(a);
    for (const q of H) {
      const x = q[0] - piv[0], y = q[1] - piv[1];
      const wx = at[0] + x * c - y * s, wy = at[1] + x * s + y * c;
      if (wy > maxY) maxY = wy;
      if (box) { if (wy < minY) minY = wy; if (wx < minX) minX = wx; if (wx > maxX) maxX = wx; }
    }
  };
  acc(J.torso, true);
  for (const sg of J.fleg) acc(sg, sg[0] !== 'foot');
  for (const sg of J.bleg) acc(sg, sg[0] !== 'foot');
  J.maxY = maxY; J.box = [minX, minY, maxX, maxY];
  return J;
}

// ================= FX =================
const FX = [];
function spark(x, y, kind, dir) {
  const col = kind === 'block' ? ['#9fd8ff', '#ffffff', '#5fb0ff'] : kind === 'counter' ? ['#ff3b30', '#ffd34d', '#ffffff'] : kind === 'rage' ? ['#ff1030', '#ff8a2a', '#ffffff'] : ['#ffd34d', '#ffffff', '#ff8a2a'];
  const n = kind === 'block' ? 10 : 18;
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), s = rnd(3, kind === 'block' ? 7 : 13);
    FX.push({ t: 'p', x, y, vx: Math.cos(a) * s + dir * 2.5, vy: Math.sin(a) * s - 1.5, life: rnd(12, 26), max: 26, c: col[i % col.length], sz: rnd(2, 5.5) });
  }
  FX.push({ t: 'ring', x, y, life: 14, max: 14, c: col[0], r0: 8, r1: kind === 'block' ? 46 : 90 });
  FX.push({ t: 'star', x, y, life: 8, max: 8, c: '#ffffff', sz: kind === 'block' ? 40 : 80, rot: rnd(0, 3) });
}
function dust(x, n = 8, dir = 0) {
  for (let i = 0; i < n; i++) FX.push({ t: 'd', x: x + rnd(-20, 20), y: -rnd(0, 6), vx: rnd(-2, 2) + dir * rnd(1, 3), vy: -rnd(0.5, 2.5), life: rnd(20, 36), max: 36, sz: rnd(8, 18) });
}
function popText(s, x, y, c, size = 44) { FX.push({ t: 'txt', s, x, y, life: 55, max: 55, c, size }); }
function updFX() {
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i]; f.life--;
    if (f.t === 'p') { f.x += f.vx; f.y += f.vy; f.vy += 0.4; f.vx *= 0.95; }
    if (f.t === 'd') { f.x += f.vx; f.y += f.vy; f.vx *= 0.94; f.vy *= 0.94; f.sz += 0.5; }
    if (f.t === 'txt') { f.y -= 0.6; }
    if (f.life <= 0) FX.splice(i, 1);
  }
}
function drawFX() {
  for (const f of FX) {
    const u = f.life / f.max;
    ctx.save();
    if (f.t === 'p') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = u; ctx.fillStyle = f.c; ctx.beginPath(); ctx.arc(f.x, f.y, f.sz * u + 0.5, 0, 7); ctx.fill(); }
    else if (f.t === 'ring') { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = u; ctx.strokeStyle = f.c; ctx.lineWidth = 6 * u + 1; ctx.beginPath(); ctx.arc(f.x, f.y, lerp(f.r1, f.r0, u), 0, 7); ctx.stroke(); }
    else if (f.t === 'star') {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = u; ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.c;
      const s = f.sz * (1.2 - u * 0.4); ctx.beginPath();
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? s * 0.18 : s * (i % 4 ? 0.6 : 1); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
    }
    else if (f.t === 'd') { ctx.globalAlpha = u * 0.35; ctx.fillStyle = '#9aa3b8'; ctx.beginPath(); ctx.arc(f.x, f.y, f.sz, 0, 7); ctx.fill(); }
    else if (f.t === 'txt') {
      ctx.globalAlpha = Math.min(1, u * 2); const sc = 1 + Math.max(0, (u - 0.85)) * 3;
      ctx.translate(f.x, f.y); ctx.scale(sc, sc);
      const ar = /[؀-ۿ]/.test(f.s); ctx.font = ar ? `900 ${f.size}px ${FA}` : `italic 700 ${f.size}px ${FE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = ar ? 'rtl' : 'ltr';
      ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.strokeText(f.s, 0, 0); ctx.fillStyle = f.c; ctx.fillText(f.s, 0, 0);
    }
    ctx.restore();
  }
}

// ================= FIGHTER =================
const NEUTRAL = new Set(['idle', 'walk', 'crouch']);
class Fighter {
  constructor(slot, ci, pad) {
    this.slot = slot; this.ci = ci; this.C = CHARS[ci]; this.R = RIGS[ci]; this.pad = pad;
    this.maxHp = Math.round(170 * this.C.hp); this.reset(); if (this.C.malali) this.shadow = true;
  }
  reset() {
    this.x = this.slot === 0 ? -250 : 250; this.y = 0; this.vx = 0; this.vy = 0;
    this.facing = this.slot === 0 ? 1 : -1;
    this.hp = window.__lowHP ? Math.round(this.maxHp * 0.28) : this.maxHp; this.trailHp = this.hp; this.trailT = 0;
    this.state = 'intro'; this.t = 0; this.mv = null; this.mt = 0; this.stun = 0;
    this.pose = Object.assign({}, GUARD); this.flash = 0; this.combo = 0; this.comboDmg = 0; this.comboT = 0;
    this.rageUsed = false; this.invuln = 0; this.juggle = 0; this.ko = false; this.walkPh = 0; this.dgCD = 0; this.sk2CD = 0; this.bubble = null;
    this.lastFwd = -99; this.lastBack = -99; this.clock = 0; this.buf = null; this.bufT = 0; this.eatN = 0; this.eatPend = false;
    this.connected = false; this.hitThis = false; this.lowHit = false; this.blockLow = false;
    this.airUsed = false; this.jumpDir = 0; this.J = null; this.hipY = 0; this.hurt = null; this.shakeT = 0; this.vic = null;
    this.sk = 0; this.spBuf = 0; this.cartGone = false; this.rollAng = 0; this.cbCD = 0;
    this.z = 0; this.lastUp = -99; this.lastDown = -99; this.upHold = 0; this.invis = 0; this.invisCD = 0;
    this.in = { h: {}, p: {} }; this.animate();
  }
  get rage() { return !this.rageUsed && this.hp > 0 && this.hp <= this.maxHp * 0.3; }
  get canFin() { return this.rage || (!this.rageUsed && this.hp > 0 && this.slot === 0 && !!G.fight && G.fight.train); }
  readInput(frozen = false) {
    const pd = this.pad, h = Object.assign({}, pd.h), p = Object.assign({}, pd.p);
    const f = this.facing > 0 ? 'right' : 'left', b = this.facing > 0 ? 'left' : 'right';
    h.fwd = pd.h[f]; h.back = pd.h[b]; p.fwd = pd.p[f]; p.back = pd.p[b];
    this.in = { h, p };
    const bt = this.btn(p);
    if (bt) { this.buf = { b: bt, h: Object.assign({}, h) }; this.bufT = 7; }
    else if (!frozen && this.bufT > 0) { this.bufT--; if (!this.bufT) this.buf = null; }
    if (p.sp) this.spBuf = 8; else if (!frozen && this.spBuf > 0) this.spBuf--;
    if (!this.pT) this.pT = {};
    for (const k of ['b1', 'b2', 'b3', 'b4']) if (p[k]) this.pT[k] = this.clock;
    for (const k of ['12', '34', '13', '24']) if (p['c' + k]) this.cbBuf = { k, t: 8 };
    if (this.cbBuf && !frozen && --this.cbBuf.t <= 0) this.cbBuf = null;
  }
  comboKey() {
    const h = this.in.h, now = this.clock, pT = this.pT || {};
    const bs = ['b1', 'b2', 'b3', 'b4'].filter(b => h[b] && now - (pT[b] === undefined ? -99 : pT[b]) <= 4);
    return bs.length >= 2 ? bs[0][1] + bs[1][1] : null;
  }
  tryCombo(forced) {
    const ck = forced || this.comboKey(); if (!ck) return false;
    if (ck === '12' && this.tryRage()) { this.pT = {}; return true; }
    if (this.cbCD > 0) return false;
    const id = COMBOS[this.ci][ck], mv = MV[id];
    if (mv.projLimit && G.fight && G.fight.proj.some(q => q.owner === this && !q.noHit)) return false;
    this.pT = {}; this.buf = null; this.startMove(id); this.cartGone = false; this.jumping = false; this.cbCD = CB_CD;
    G.fight.skBanner = { slot: this.slot, text: mv.cname, t: 0, small: 1 }; SFX.whoosh(1);
    return true;
  }
  dodge() {
    this.setState('dodge'); this.dgCD = 120; this.invuln = 14; this.vx = -this.facing * 7; this.mv = null; this.buf = null; this.dodged = false;
    SFX.whoosh(1); dust(this.x, 5, this.facing);
    for (let i = 0; i < 8; i++) FX.push({ t: 'p', x: this.x + rnd(-40, 40), y: -rnd(60, 300), vx: -this.facing * rnd(1, 4), vy: rnd(-1, 1), life: 16, max: 16, c: '#7fd6ff', sz: rnd(2, 4) });
  }
  dodgeHit() { if (this.state !== 'dodge' || this.dodged) return; this.dodged = true; popText('تفادي! ✨', this.x, -340, '#7fd6ff', 38); SFX.ready(); if (G.fight) G.fight.slow = Math.max(G.fight.slow, 18); }
  sidestep(dir) {
    this.setState('side'); this.sideDir = dir; this.sideZ0 = this.z; this.vx = 0; this.upHold = 0; SFX.whoosh(0); dust(this.x, 4);
  }
  talk(kind, text) {
    const P = PERSONA[this.ci] || {}; const line = text || (P[kind] && pickLine(P[kind])); if (!line) return;
    this.bubble = { text: line, t: 0, dur: kind === 'win' ? 160 : 95 }; charSpeak(this.ci, kind, line);
  }
  useInvis() {
    this.spBuf = 0; this.buf = null; this.upHold = 0; this.invis = 240; this.invisCD = 720; this.talk('skill', 'أنا وراك…'); SFX.skill(); SFX.whoosh(1);
    G.fight.skBanner = { slot: this.slot, text: 'الاختفاء 🌑', t: 0, small: 1 }; for (let i = 0; i < 3; i++) dust(this.x + (i - 1) * 40, 6, i - 1); popText('اختفى…', this.x, -330, '#c77dff', 34);
  }
  useSkill2() {
    this.talk('skill', SKILL2_LINE[this.ci]); this.spBuf = 0; this.buf = null; this.sk2CD = SK2_CD; this.startMove(SKILL2[this.ci]); this.vx = 0;
    SFX.skill(); G.fight.skBanner = { slot: this.slot, text: SKILL2_NAMES[this.ci], t: 0, small: 1 };
  }
  useSkill() {
    this.talk('skill');
    this.sk = 0; this.spBuf = 0; this.buf = null; this.cartGone = false; this.startMove(SKILL_IDS[this.ci]); this.vx = 0;
    SFX.skill(); G.fight.skBanner = { slot: this.slot, text: SKILL_NAMES[this.ci], t: 0 };
    for (let i = 0; i < 14; i++) FX.push({ t: 'p', x: this.x + rnd(-50, 50), y: this.hipY + rnd(-120, 60), vx: rnd(-1, 1), vy: -rnd(1, 4), life: 30, max: 30, c: '#ffd34d', sz: rnd(2, 4) });
  }
  btn(p) { return p.b1 ? 'b1' : p.b2 ? 'b2' : p.b3 ? 'b3' : p.b4 ? 'b4' : null; }
  resolve(b, h, air) { // direction + button → move (□=b1 △=b2 ✕=b3 ○=b4)
    if (air) return MOVESET.air[b];
    return MOVESET[h.down ? 'down' : h.up ? 'up' : h.fwd ? 'fwd' : h.back ? 'back' : 'n'][b];
  }
  canAct() { return NEUTRAL.has(this.state) || this.state === 'land' && this.t > 2 || this.state === 'dash' && this.t > 4; }
  tryRage() {
    const h = this.in.h;
    if (this.rage && ((h.b1 && h.b2) || h.ra)) { this.rageUsed = true; this.startMove('rage'); G.fight.rageFlash(this); return true; }
    return false;
  }
  startMove(id) {
    if (this.C.eat) { if (MV[id].eatAfter) this.eatPend = true; else if (!MV[id].eat && !MV[id].skill) { this.eatN = (this.eatN || 0) + 1; if (this.eatN >= 9) this.eatPend = true; } }
    this.mv = MV[id]; this.state = 'attack'; this.mt = 0; { const op = G.fight && G.fight.f && G.fight.f[1 - this.slot]; this.aimD = op && this.mv.lvl === 'high' && !this.mv.skill ? clamp(((this.C.h || 1) - (op.C.h || 1)) * 150, -24, 24) : 0; } this.hitThis = false; this.connected = false; this.buf = null; this.bufT = 0;
    if (this.mv.air) this.airUsed = true;
    if (!this.mv.air && !this.mv.mvx) this.vx = 0;
  }
  setState(s) { this.state = s; this.t = 0; }
  think(opp) {
    if (this.bossAI) bossTick(this, opp);
    this.clock++; this.t++;
    if (this.flash > 0) this.flash--;
    if (this.invuln > 0) this.invuln--;
    if (this.dgCD > 0) this.dgCD--;
    if (this.sk2CD > 0 && G.fight && G.fight.phase === 'fight') this.sk2CD--;
    if (this.invisCD > 0 && G.fight && G.fight.phase === 'fight') this.invisCD--; if (this.invis > 0 && --this.invis === 0) { popText('ظهر! 🌑', this.x, -330, '#c77dff', 32); SFX.whoosh(1); }
    if (this.bubble && ++this.bubble.t > this.bubble.dur) this.bubble = null;
    // L2+R2 / touch button = القاضية (cancels a dodge or R2 combo started a few frames earlier)
    if (this.in.h.ra && this.canFin && G.fight && G.fight.phase === 'fight' && (NEUTRAL.has(this.state) || ['block', 'land', 'dash', 'side'].includes(this.state) || (this.state === 'dodge' && this.t <= 6) || (this.state === 'attack' && this.mv && this.mv.combo && this.mt <= 4))) {
      if (this.state === 'dodge') { this.dgCD = 0; this.invuln = 0; } else if (this.state === 'attack') this.cbCD = 0;
      this.vx = 0; this.rageUsed = true; this.startMove('rage'); G.fight.rageFlash(this);
    }
    if (this.in.p.dg && this.dgCD <= 0 && G.fight && G.fight.phase === 'fight' && (NEUTRAL.has(this.state) || this.state === 'block' || this.state === 'land' || this.state === 'dash' || this.state === 'side')) { this.dodge(); }
    if (this.comboT > 0) this.comboT--;
    if (this.cbCD > 0 && G.fight && G.fight.phase === 'fight') this.cbCD--;
    const h = this.in.h, p = this.in.p;
    switch (this.state) {
      case 'idle': case 'walk': case 'crouch': this.neutral(); break;
      case 'land': if (this.canAct() && (this.buf || this.spBuf || this.cbBuf)) { this.neutral(); break; }
        // holding up keeps hopping: jump → land → jump again, until the direction changes
        if (h.up && !h.down && this.t >= 1 && G.fight && G.fight.phase === 'fight') { this.setState('jsq'); this.t = 2; this.upHold = 0; this.jumpDir = h.fwd ? this.facing : h.back ? -this.facing : 0; this.vx = 0; break; } if (this.t >= 6) this.setState('idle'); this.vx *= 0.7; break;
      case 'dash':
        this.vx *= this.dashBack ? 0.915 : 0.87; dashDust(this);
        if (this.t > (this.dashBack ? 10 : 4) && (this.buf || this.spBuf || this.cbBuf)) { this.neutral(); break; }
        if (this.t >= (this.dashBack ? 22 : 15)) { this.setState('idle'); this.dashBack = false; } break;
      case 'dodge': this.vx *= 0.82; if (this.t >= 16) this.setState('idle'); break;
      case 'side': {
        const u = Math.min(1, this.t / 16); this.z = clamp(this.sideZ0 + this.sideDir * 160 * easeOut(u), -420, 520); this.vx *= 0.7;
        if (this.t > 9 && (this.buf || this.spBuf || this.cbBuf)) { this.neutral(); break; }
        if (this.t >= 16) this.setState('idle'); break;
      }
      case 'jsq':
        if (this.t >= 4) {
          this.setState('air'); this.airUsed = false; SFX.jump(); dust(this.x, 6);
          if (this.jumpDir && this.jumpDir === this.facing) {
            // long forward jump: aims to sail over the opponent and land just behind them
            this.vy = -21.5; const T = 2 * 21.5 / 0.92, tgt = clamp(opp.x + this.facing * 135, -STAGE + 10, STAGE - 10);
            this.vx = this.facing * clamp((tgt - this.x) * this.facing / T, 4.8 * this.C.spd, 10.5); this.crossJ = true; SFX.whoosh(1);
          } else { this.vy = -21.5; this.vx = this.jumpDir * 5.2 * this.C.spd; this.crossJ = false; }
        }
        break;
      case 'air':
        if (!this.airUsed && this.buf) { const id = this.resolve(this.buf.b, this.buf.h, true); this.startMove(id); }
        break;
      case 'attack': this.attackStep(); break;
      case 'hit': case 'block':
        this.vx *= 0.82; if (--this.stun <= 0) this.setState(this.in.h.down && (this.blockLow || this.lowHit) ? 'crouch' : 'idle'); break;
      case 'down': this.vx *= 0.8; if (this.t >= 42 || (this.t > 18 && (p.b1 || p.b2 || p.b3 || p.b4 || p.up))) { this.setState('getup'); this.invuln = 30; } break;
      case 'getup': if (this.t >= 22) { this.setState('idle'); this.invuln = 6; } break;
      case 'juggle': case 'ko': case 'win': case 'intro': case 'lose': break;
      case 'rageSeq': this.rageSeq(opp); break;
      case 'rushSeq': this.rushSeq(opp); break;
      case 'rageVic': if ((this.t > 150 && !(G.fight && G.fight.fin)) || !(opp && (opp.state === 'rageSeq' || opp.state === 'rushSeq'))) { this.finP = null; this.setState('idle'); } break;
    }
  }
  neutral() {
    const h = this.in.h, p = this.in.p;
    if (this.eatPend && G.fight && G.fight.phase === 'fight' && this.state !== 'air' && !this.jumping) { this.eatPend = false; this.eatN = 0; this.startMove('ab_eat'); return; }
    if (p.fwd) { if (this.clock - this.lastFwd < 13) { this.setState('dash'); this.dashBack = false; this.vx = this.facing * 11 * this.C.spd; dust(this.x, 5, -this.facing); this.lastFwd = -99; SFX.whoosh(0); return; } this.lastFwd = this.clock; }
    if (p.back) { if (this.clock - this.lastBack < 15) { this.setState('dash'); this.dashBack = true; this.vx = -this.facing * 19 * this.C.spd; dust(this.x, 8, this.facing); this.lastBack = -99; SFX.whoosh(1); return; } this.lastBack = this.clock; }
    if (this.spBuf > 0 && h.up && (this.C.malali || this.bossAs === MALALI) && !(this.invisCD > 0) && G.fight && G.fight.phase === 'fight') { this.useInvis(); return; }
    if (this.spBuf > 0 && h.down && SKILL2[this.ci] && this.sk2CD <= 0 && G.fight && G.fight.phase === 'fight') { this.useSkill2(); return; }
    if (this.spBuf > 0 && this.sk >= SKMAX && !(h.down && SKILL2[this.ci])) { this.useSkill(); return; }
    if (this.cbBuf) { const k = this.cbBuf.k; this.cbBuf = null; if (this.tryCombo(k)) return; }
    if (this.buf && this.tryCombo()) return;
    if (this.buf) {
      if (this.tryRage()) return;
      const id = this.resolve(this.buf.b, this.buf.h, false); this.startMove(id); return;
    }
    if (p.up) { if (this.clock - this.lastUp < 14) { this.lastUp = -99; this.sidestep(1); return; } this.lastUp = this.clock; }
    if (p.down) { if (this.clock - this.lastDown < 14) { this.lastDown = -99; this.sidestep(-1); return; } this.lastDown = this.clock; }
    if (h.up) { this.upHold++; if (this.upHold >= 7) { this.upHold = 0; this.setState('jsq'); this.t = 3; this.jumpDir = h.fwd ? this.facing : h.back ? -this.facing : 0; this.vx = 0; return; } } else this.upHold = 0;
    if (h.down) { if (this.state !== 'crouch') this.setState('crouch'); this.vx = 0; return; }
    if (h.fwd) { if (this.state !== 'walk') this.setState('walk'); this.vx = this.facing * 3.4 * this.C.spd; this.walkDir = 1; }
    else if (h.back) { if (this.state !== 'walk') this.setState('walk'); this.vx = -this.facing * 2.8 * this.C.spd; this.walkDir = -1; }
    else { if (this.state !== 'idle') this.setState('idle'); this.vx = 0; }
  }
  attackStep() {
    const m = this.mv; this.mt++;
    if (m.lunge === undefined) m.lunge = !m.skill && !m.air && !m.rage && !m.poseFn && !m.hitboxFn && !!m.limb;
    if (m.lunge && this.mt <= m.st) { const L = this.R.L, k = this.R.k, mine = m.limb[1] === 'H' || m.limb[1] === 'E' ? (L.ua + L.fa) * k : (L.th + L.sh) * k, ref = m.limb[1] === 'H' || m.limb[1] === 'E' ? 115 : 178;
      if (mine < ref) this.x += this.facing * (ref - mine) * 0.75 / m.st; }
    // rage conversion
    if ((m.id === 'lp' || m.id === 'rp') && this.mt <= 3 && this.rage && this.in.h.b1 && this.in.h.b2) { this.tryRage(); return; }
    if (this.mt <= 4 && !m.combo && !m.skill && !m.rage && !m.air && this.tryCombo()) return;
    if (this.mt === m.st) SFX.whoosh(m.p > 1.2 ? 1 : 0);
    if (m.rage && this.mt < m.st && this.mt % 6 === 0) spark(this.x + rnd(-40, 40), this.hipY - rnd(0, 200), 'rage', 0);
    if (m.mvx) { let set = false; for (const [a, b, v] of m.mvx) if (this.mt >= a && this.mt < b) { this.vx = this.facing * v * (m.rage ? 1 : this.C.spd); set = true; } if (!set) this.vx *= 0.75; }
    else if (!m.air && !m.noDecay && !(m.jump && this.jumping)) this.vx *= 0.7;
    if (m.multi && this.mt >= m.st && this.mt < m.st + m.ac && (this.mt - m.st) % m.multi === 0) this.hitThis = false;
    if (m.spawn && this.mt === m.spawnAt) m.spawn(this);
    if (m.onStep) m.onStep(this);
    if (this.mv !== m) return;
    // cancels (strings)
    if (this.connected && m.cancel && this.buf && this.mt >= m.st + m.ac - 1) {
      const id = this.resolve(this.buf.b, this.buf.h, false);
      const nid = (id === 'lp' && m.cancel.lp2) ? 'lp2' : id;
      if (m.cancel[nid]) { this.startMove(nid); return; }
    }
    if (this.mt >= m.total) {
      if (m.jump && this.jumping) return;
      this.mv = null;
      if (m.air) { this.setState(this.y < -2 ? 'air' : 'land'); }
      else this.setState(m.crouch && this.in.h.down ? 'crouch' : 'idle');
    }
  }
  active() { const m = this.mv; return this.state === 'attack' && m && this.mt >= m.st && this.mt < m.st + m.ac && !this.hitThis; }
  hitbox() {
    if (this.state === 'attack' && this.mv && this.mv.hitboxFn) return this.mv.hitboxFn(this);
    if (!this.active() || !this.mv.limb) return null;
    const m = this.mv, J = this.J, side = m.limb[0], part = m.limb[1], lp = J[side + part] || J[side + 'H'];
    // the striking segment: forearm (fist), shin+foot (kick), thigh end (knee), upper arm end (elbow)
    const from = part === 'H' ? J[side + 'E'] : part === 'T' ? J[side + 'K'] : part === 'K' ? lerpPt(J[side + 'leg'][0][1], J[side + 'K'], 0.55) : lerpPt(J[side + 'arm'][0][1], J[side + 'E'], 0.6);
    const w = this.toWorld(lp), w2 = this.toWorld(from), k = this.R.k;
    const ar = m.ar ? m.ar * k : (part === 'T' ? 20 : part === 'K' ? 24 : part === 'E' ? 22 : 18) * k + Math.max(0, (m.r || 0) - 34) * 0.8;
    return { x: w[0], y: w[1], r: m.r, x2: w2[0], y2: w2[1], ar };
  }
  toWorld(l) { const k = this.R.k; return [this.x + this.facing * (l[0] + this.pose.dx) * k, this.hipY + (l[1] + this.pose.dy) * k]; }
  airborne() { return this.state === 'air' || this.state === 'juggle' || (this.state === 'attack' && this.mv && (this.mv.air || (this.mv.jump && this.jumping))); }
  lowProfile() { return this.state === 'crouch' || (this.state === 'attack' && this.mv && (this.mv.crouch || (this.mv.lowp && this.mt >= this.mv.st && this.mt < this.mv.st + this.mv.ac))) || ((this.state === 'block') && this.blockLow) || (this.state === 'hit' && this.lowHit) || this.state === 'down' || this.state === 'getup' && this.t < 12; }
  physics() {
    if (this.state === 'rageVic' || this.state === 'rageSeq' || this.state === 'rushSeq') { this.x = clamp(this.x, -STAGE, STAGE); return; }
    if (this.airborne()) {
      this.vy += this.state === 'juggle' ? 0.62 : 0.92;
      this.x += this.vx; this.y += this.vy;
      if (this.y >= 0 && this.vy > 0) { this.y = 0; this.landed(); }
    } else {
      this.x += this.vx; this.y = 0;
      if (!['walk', 'dash', 'attack'].includes(this.state)) this.vx *= 0.85;
    }
    if (this.x < -STAGE || this.x > STAGE) { this.x = clamp(this.x, -STAGE, STAGE); if (this.state === 'juggle') this.vx *= -0.3; }
  }
  landed() {
    if (this.state === 'air') { this.setState('land'); this.vx = 0; SFX.land(); dust(this.x, this.crossJ ? 12 : 6); this.crossJ = false; }
    else if (this.state === 'attack') { const m = this.mv; this.jumping = false; if (m && m.onLand) m.onLand(this); this.mv = null; this.setState('land'); this.vx = 0; SFX.land(); dust(this.x, 6); }
    else if (this.state === 'juggle') {
      SFX.thud(); dust(this.x, 14); G.fight.shake(this.ko ? 14 : 7);
      this.juggle = 0; this.vx *= 0.3;
      this.setState(this.ko ? 'ko' : 'down');
      if (this.ko) G.fight.koLanded(this);
    }
  }
  targetPose() {
    const t = this.t, s = this.state;
    let o;
    switch (s) {
      case 'idle': case 'intro': {
        const PS = PERSONA[this.ci] || {};
        o = Object.assign({}, GUARD); const b = Math.sin(this.clock * (PS.br || 0.08)), ba = PS.ba || 1.6;
        if (PS.st) for (const k in PS.st) o[k] += PS.st[k];
        o.lean += b * ba; o.fa += b * 4; o.bfa -= b * 4; o.sh += b * 3; o.bsh += b * 2;
        if (PS.bob) { const u = Math.abs(Math.sin(this.clock * (PS.br || 0.1))); o.th += u * PS.bob; o.sh += u * PS.bob * 1.6; o.bth -= u * PS.bob * 0.4; o.bsh += u * PS.bob * 1.6; }
        if (PS.flap) { o.ua += Math.sin(this.clock * 0.35) * 10; o.bua += Math.sin(this.clock * 0.35 + 1) * 10; }
        if (s === 'intro' && t < 70) { const u = clamp(t / 70, 0, 1); for (const k of PK) o[k] = lerp(TAUNT[k], o[k], ease(u)); }
        break;
      }
      case 'walk': {
        o = Object.assign({}, GUARD); { const PS = PERSONA[this.ci] || {}; if (PS.st) for (const k in PS.st) o[k] += PS.st[k] * 0.7; } this.walkPh += 0.2 * this.C.spd * (this.walkDir || 1);
        const w = Math.sin(this.walkPh), c = Math.cos(this.walkPh);
        o.th += 14 * w; o.bth -= 14 * w; o.sh += 14 * Math.max(0, c); o.bsh += 14 * Math.max(0, -c); o.lean += 2;
        break;
      }
      case 'weat': { const b = Math.sin(this.clock * 0.25); o = Object.assign({}, BASE, { lean: 4, ua: 58 + b * 8, fa: 150 - b * 6, bua: -4, bfa: 24, th: 4, sh: 4, bth: -4, bsh: 4 }); break; }
      case 'wdrink': { const b = Math.sin(this.clock * 0.12); o = Object.assign({}, BASE, { lean: -8 + b, ua: 74 + b * 4, fa: 150, bua: -6, bfa: 22, th: 4, sh: 4, bth: -4, bsh: 4 }); break; }
      case 'widle': { const b = Math.sin(this.clock * 0.06); o = Object.assign({}, BASE, { lean: 2 + b, ua: 6 + b * 2, fa: 18, bua: -4 - b * 2, bfa: 20, th: 4, sh: 4, bth: -4, bsh: 4 }); break; }   // open world: standing relaxed
      case 'wwalk': { const w = Math.sin(this.wph || 0), c = Math.cos(this.wph || 0); o = Object.assign({}, BASE, { lean: 5, th: 24 * w, bth: -24 * w, sh: 6 + 26 * Math.max(0, c), bsh: 6 + 26 * Math.max(0, -c), ua: -22 * w, fa: 24, bua: 22 * w, bfa: 24, dy: -Math.abs(c) * 4 }); break; }   // open world: casual walk
      case 'crouch': o = Object.assign({}, CROUCH); o.lean += Math.sin(this.clock * 0.08) * 1.5; break;
      case 'dash': o = (this.vx * this.facing > 0) ? DASHP : BDASHP; break;
      case 'dodge': { const u = Math.sin(Math.min(1, this.t / 16) * Math.PI); o = Object.assign({}, GUARD, { lean: -26 * u, r: -6 * u, th: 18 + 30 * u, sh: 22 + 50 * u, bth: -14 + 20 * u, bsh: 8 + 60 * u, ua: 34 - 10 * u, bua: 26 - 10 * u, dy: 30 * u }); break; }
      case 'side': { o = Object.assign({}, GUARD); const w = Math.sin(this.t * 0.6); o.th += 18 * w; o.bth -= 18 * w; o.sh += 12; o.bsh += 12; o.lean -= 3; break; }
      case 'jsq': o = LANDP; break;
      case 'land': o = LANDP; break;
      case 'air': o = JUMP; break;
      case 'attack': o = this.mv.poseFn ? this.mv.poseFn(this, this.mt) : kfPose(this.mv, this.mt);
        if (this.aimD && this.mv.limb && !this.mv.poseFn) { // aim high strikes at the opponent's head height (taller/shorter rivals)
          o = Object.assign({}, o); const L = this.mv.limb, u = clamp(this.mt / Math.max(1, this.mv.st), 0, 1);
          if (L[1] === 'T') o[L[0] === 'f' ? 'th' : 'bth'] -= this.aimD * u; else if (L[1] === 'H') o[L[0] === 'f' ? 'ua' : 'bua'] -= this.aimD * 0.6 * u;
        }
        break;
      case 'hit': {
        o = Object.assign({}, this.lowProfileHit ? CHIT : this.lowHit ? HITLO : HITHI);
        const j = this.stun > 4 ? Math.sin(this.t * 1.7) * 3 : 0; o.lean += j; break;
      }
      case 'block': o = this.blockLow ? CBLOCK : BLOCK; break;
      case 'juggle': o = Object.assign({}, JUG); o.r = clamp(-14 - t * 2.4, -92, 0); o.lean = -12 + Math.sin(t * 0.3) * 5; break;
      case 'down': case 'ko': o = DOWN; break;
      case 'lose': o = Object.assign({}, TIRED); o.lean += Math.sin(this.clock * 0.1) * 3; break;
      case 'getup': {
        o = {}; const u = clamp(t / 22, 0, 1);
        if (u < 0.6) { const v = ease(u / 0.6); for (const k of PK) o[k] = lerp(DOWN[k], CROUCH[k], v); }
        else { const v = ease((u - 0.6) / 0.4); for (const k of PK) o[k] = lerp(CROUCH[k], GUARD[k], v); }
        break;
      }
      case 'win': {
        const W = (this.ci % 2) ? WIN2 : WIN; o = Object.assign({}, W);
        o.dy = 0; o.lean += Math.sin(this.clock * 0.15) * 3; o.ua += Math.sin(this.clock * 0.3) * 6; break;
      }
      case 'rageSeq': case 'rushSeq': o = this.rageP || GUARD; break;
      case 'rageVic': if (this.finP) { o = this.finP; break; } o = Object.assign({}, HITHI); o.lean += Math.sin(this.clock * 1.9) * 6; break;
      default: o = GUARD;
    }
    return o;
  }
  animate() {
    const tg = this.targetPose();
    const fast = this.state === 'attack' || this.state === 'hit' || this.state === 'block' || this.state === 'rageSeq' || this.state === 'rushSeq' || this.state === 'rageVic' || this.state === 'getup';
    const a = fast ? 0.6 : this.state === 'juggle' || this.state === 'down' ? 0.35 : 0.3;
    for (const k of PK) this.pose[k] = lerp(this.pose[k], tg[k], a);
    this.J = solve(this.R, this.pose);
    const k = this.R.k;
    if (this.state === 'air' || (this.state === 'attack' && this.mv && (this.mv.air || (this.mv.jump && this.jumping)))) this.hipY = this.y - this.R.restHip * k;
    else this.hipY = this.y - this.J.maxY * k;
    const b = this.J.box; const xs = [this.x + this.facing * (b[0] + this.pose.dx) * k, this.x + this.facing * (b[2] + this.pose.dx) * k];
    this.hurt = { x0: Math.min(...xs) + 8, x1: Math.max(...xs) - 8, y0: this.hipY + b[1] * k, y1: this.hipY + b[3] * k };
    const mv = this.mv; if (this.state === 'attack' && mv && mv.ball && this.mt >= mv.st && this.mt < mv.st + mv.ac) this.hurt = { x0: this.x - 70, x1: this.x + 70, y0: this.y - 160, y1: this.y };
    // body-shaped hurt capsules (head, torso, arms, legs) so hits land where they look like they land
    { const J = this.J, T = l => this.toWorld(l), caps = this.caps = [];
      const cap = (p, q, r) => { const A = T(p), B = T(q); caps.push([A[0], A[1], B[0], B[1], r * k]); };
      cap([0, 0], J.nk, J.tw); cap(J.hd, J.hd, J.hr);
      for (const pre of ['f', 'b']) { const a = J[pre + 'arm'], l = J[pre + 'leg']; cap(a[0][1], a[1][1], 15); cap(a[1][1], J[pre + 'H'], 13); cap(l[0][1], l[1][1], 20); cap(l[1][1], l[2][1], 15); cap(l[2][1], J[pre + 'T'], 11); }
      if (mv && mv.ball && this.state === 'attack' && this.mt >= mv.st && this.mt < mv.st + mv.ac) this.caps = [[this.x - 40, this.y - 80, this.x + 40, this.y - 80, 80]]; }
  }
  rushSeq(opp) {
    if (opp.ko) { this.setState('idle'); return; }
    const t = this.t, seq = 6, n = 5;
    if (opp.state === 'rageVic') { opp.x = clamp(this.x + this.facing * 112, -STAGE, STAGE); opp.y = 0; }
    if (t < n * seq) {
      const i = (t / seq) | 0, u = (t % seq) / seq, left = i % 2 === 0, ext = u < 0.5 ? ease(u / 0.5) : 1 - ease((u - 0.5) / 0.5);
      this.rageP = Object.assign({}, GUARD, left ? { bua: lerp(26, 92, ext), bfa: lerp(142, 0, ext) } : { ua: lerp(34, 92, ext), fa: lerp(128, 0, ext) }, { lean: 12 + ext * 10, dx: ext * 8, th: 30, bth: -24 });
      if (t % seq === 2) G.fight.applyDamage(this, opp, 3.6, 'hit', left ? this.J.bH : this.J.fH, true, null, { stop: 3, p: 0.9 });
    } else if (t < n * seq + 20) {
      const u = (t - n * seq) / 20;
      this.rageP = u < 0.35 ? Object.assign({}, GUARD, { ua: 20, fa: 120, lean: -8, dx: -4 }) : Object.assign({}, GUARD, { ua: 90, fa: 30, lean: 28, dx: 16, th: 40, bth: -30 });
      if (t === n * seq + 8) {
        G.fight.applyDamage(this, opp, 9, 'counter', this.J.fH, true, null, { stop: 9, p: 1.5 });
        if (opp.hp > 0) { opp.setState('juggle'); opp.vy = -9; opp.vx = this.facing * 7; opp.juggle = 4; }
      }
    } else this.setState('idle');
  }
  rageSeq(opp) { // runs this character's finisher script (FIN)
    const F = G.fight, FN = FIN[this.ci] || FIN[0];
    if (!F || !F.fin || F.fin.a !== this) { finEnd(this, opp); this.y = 0; this.setState('idle'); return; }
    F.fin.t = this.t; F.zoomT = Math.max(F.zoomT, 2); finQueue(F, this, opp);
    if (FN.run(F, this, opp, this.t)) { finEnd(this, opp); F.fin = null; F.zoomT = 0; this.y = 0; this.setState('idle'); if (opp.state === 'rageVic') opp.setState('idle'); }
  }
}
function dashDust(f) { if (f.t % 4 === 0 && f.t < 12) dust(f.x - f.facing * 10, 2, -Math.sign(f.vx)); }

// ================= CPU =================
class CPUPad {
  constructor(level) { this.h = {}; this.p = {}; this.cpu = true; this.cd = 40; this.hold = null; this.holdT = 0; this.blockT = 0; this.blockLow = false; this.lvl = level || 1; this.me = null; this.op = null; this.react = 0; }
  read() {
    const h = this.h, p = this.p; for (const k of PADKEYS) { h[k] = false; p[k] = false; }
    const me = this.me, op = this.op; if (!me || !op || G.scene !== 'fight' || G.fight.phase !== 'fight') return;
    const fK = me.facing > 0 ? 'right' : 'left', bK = me.facing > 0 ? 'left' : 'right';
    const press = (...ks) => { for (const k of ks) { p[k] = true; h[k] = true; } };
    const dist = Math.abs(op.x - me.x);
    if (op.invis > 0 && op.invis < 230) { this.blockT = 0; if (Math.random() < 0.85) { if (NEUTRAL.has(me.state) && Math.random() < 0.03) press(pick(['b1', 'b3', 'b2'])); else if (Math.random() < 0.3) h[Math.random() < 0.5 ? fK : bK] = true; return; } }
    if (this.blockT > 0) { this.blockT--; h[bK] = true; if (this.blockLow) h.down = true; return; }
    if (op.state === 'attack' && op.mv && (op.mv.skill || op.mv.combo) && op.mt < op.mv.st + 4 && me.dgCD <= 0 && NEUTRAL.has(me.state) && Math.random() < 0.06) { me.dodge(); return; }
    if (op.state === 'attack' && op.mv && op.mt < op.mv.st && dist < 280 && NEUTRAL.has(me.state) && !op.mv.track && Math.random() < 0.04) { me.sidestep(Math.random() < 0.5 ? 1 : -1); return; }
    if (op.state === 'attack' && op.mv && op.mt < op.mv.st && dist < 280 && NEUTRAL.has(me.state)) {
      if (Math.random() < 0.08 + this.lvl * 0.03) { this.blockT = op.mv.st - op.mt + op.mv.ac + 6; this.blockLow = op.mv.lvl === 'low' ? Math.random() < 0.75 : false; if (op.mv.lvl === 'high' && Math.random() < 0.3) { this.blockLow = true; } return; }
    }
    if (me.state === 'attack' && me.connected && me.mv && me.mv.cancel && me.mt >= me.mv.st + me.mv.ac - 1) {
      if (Math.random() < 0.18) { const n = pick(Object.keys(me.mv.cancel)); if (n === 'rp') press('b2'); else if (n === 'rk') press('b4'); else if (n === 'lk') press('b3'); else press('b1'); }
      return;
    }
    if (!NEUTRAL.has(me.state)) return;
    if (this.holdT > 0) { this.holdT--; for (const k of this.hold) h[k === 'F' ? fK : k === 'B' ? bK : k] = true; return; }
    if (['down', 'getup', 'ko'].includes(op.state)) { if (dist > 200) h[fK] = true; return; }
    if (op.state === 'air' && dist < 260 && op.y < -60 && op.vy > -6 && Math.random() < 0.05 + this.lvl * 0.03) { h.up = true; press('b1'); return; } // anti-air
    if (op.state === 'juggle' && dist < 190) { if (Math.random() < 0.5) press('b1'); else press('b2'); return; }
    this.cd--;
    if (me.rage && dist < 230 && Math.random() < 0.03) { press('b1', 'b2'); return; }
    if ((me.C.malali || me.bossAs === MALALI) && !(me.invisCD > 0) && !(me.invis > 0) && dist > 200 && Math.random() < 0.006) { h.up = true; press('sp'); return; }
    if (SKILL2[me.ci] && me.sk2CD <= 0 && dist > 240 && dist < 760 && Math.random() < 0.025) { h.down = true; press('sp'); return; }
    if (me.sk >= SKMAX && Math.random() < 0.035) {
      const proj = [3, 4, 5].includes(me.ci), close = me.ci === 1;
      if ((proj && dist > 230) || (close && dist < 190) || (!proj && !close && dist > 150 && dist < 560)) { press('sp'); return; }
    }
    if (dist > 215) {
      if (Math.random() < 0.01) { this.hold = ['F', 'up']; this.holdT = 10; return; }
      if (dist > 380 && Math.random() < 0.02) { p[fK] = true; this.dashArm = 2; }
      if (this.dashArm > 0) { this.dashArm--; if (this.dashArm === 0) { p[fK] = true; } }
      h[fK] = true; return;
    }
    if (this.cd <= 0) {
      this.cd = (rnd(8, 30) / (0.7 + this.lvl * 0.3)) | 0;
      const r = Math.random();
      const opts = [[22, () => press('b1')], [15, () => press('b2')], [13, () => press('b3')], [10, () => press('b4')], [7, () => { h[fK] = true; press('b2'); }],
        [6, () => { h.down = true; press('b2'); }], [6, () => { h.down = true; press('b4'); }], [7, () => { h.down = true; press('b3'); }], [6, () => { h[fK] = true; press('b3'); }],
        [4, () => { h[fK] = true; press('b4'); }], [5, () => { h[fK] = true; press('b1'); }], [4, () => { h[bK] = true; press('b1'); }], [3, () => { h[bK] = true; press('b2'); }], [dist < 170 ? 6 : 1, () => { h[bK] = true; press('b3'); }], [3, () => { h[bK] = true; press('b4'); }], [3, () => { h.up = true; press('b2'); }], [4, () => { h.up = true; press('b3'); }], [dist < 200 ? 4 : 1, () => { h.up = true; press('b4'); }], [10, () => { this.hold = ['B']; this.holdT = 18; }], [6, () => { this.hold = ['down', 'B']; this.holdT = 20; }], [3, () => { this.hold = ['up']; this.holdT = 10; }], [6, () => { me.sidestep(Math.random() < 0.5 ? 1 : -1); }], [14, () => { const pr = pick([['b1', 'b2'], ['b2', 'b3'], ['b2', 'b4'], ['b1', 'b3'], ['b1', 'b4'], ['b3', 'b4']]); press(pr[0], pr[1]); }]];
      let tot = opts.reduce((a, o) => a + o[0], 0), x = r * tot;
      for (const [w, f] of opts) { x -= w; if (x <= 0) { f(); break; } }
    } else if (dist < 120 && Math.random() < 0.03) { this.hold = ['B']; this.holdT = 12; }
    else if (dist > 170) h[fK] = true;
  }
}

// ================= BACKDROP =================
let BACKDROP = null;
function makeBackdrop() {
  const W = 2400, H = VH; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  let gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#04050b'); gr.addColorStop(0.35, '#0b0f1e'); gr.addColorStop(0.6, '#1a0e1c'); gr.addColorStop(1, '#06060b');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // giant red slashes
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const x = rnd(0, W), y = rnd(60, 380), len = rnd(200, 620), a = rnd(-0.9, -0.5), w = rnd(6, 40);
    const lg = g.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
    lg.addColorStop(0, 'rgba(255,20,40,0)'); lg.addColorStop(0.5, `rgba(230,20,40,${rnd(0.12, 0.35)})`); lg.addColorStop(1, 'rgba(255,20,40,0)');
    g.strokeStyle = lg; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  g.restore();
  // stadium lights
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) {
    const x = 80 + i * 132 + rnd(-20, 20), y = 38 + Math.sin(i * 0.7) * 10;
    const cone = g.createLinearGradient(x, y, x, 470); cone.addColorStop(0, 'rgba(150,180,255,0.16)'); cone.addColorStop(1, 'rgba(150,180,255,0)');
    g.fillStyle = cone; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.lineTo(x + 90 + rnd(-40, 40), 470); g.lineTo(x - 90 + rnd(-40, 40), 470); g.closePath(); g.fill();
    const rg = g.createRadialGradient(x, y, 0, x, y, 40); rg.addColorStop(0, 'rgba(255,255,255,0.95)'); rg.addColorStop(0.2, 'rgba(180,200,255,0.5)'); rg.addColorStop(1, 'rgba(120,150,255,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, 40, 0, 7); g.fill();
  }
  g.restore();
  // big screens / banners
  for (let i = 0; i < 5; i++) {
    const x = 160 + i * 480, y = 150, w = 260, h = 120;
    g.fillStyle = '#0b0d16'; g.fillRect(x - 6, y - 6, w + 12, h + 12);
    const sg = g.createLinearGradient(x, y, x + w, y + h); sg.addColorStop(0, '#2a0710'); sg.addColorStop(1, '#0d1430'); g.fillStyle = sg; g.fillRect(x, y, w, h);
    g.save(); g.globalAlpha = 0.85; g.font = `900 46px ${FA}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
    g.fillStyle = '#ff2a3a'; g.shadowColor = '#ff2a3a'; g.shadowBlur = 18; g.fillText('معركة الشلة', x + w / 2, y + h / 2 + 4); g.restore();
  }
  // crowd
  const hy = 470;
  for (let row = 0; row < 3; row++) {
    const yb = hy - 70 + row * 26;
    for (let x = -20; x < W + 20; x += rnd(16, 26)) {
      const hh = rnd(20, 34);
      g.fillStyle = `rgb(${8 + row * 4},${9 + row * 4},${16 + row * 5})`;
      g.beginPath(); g.arc(x, yb - hh, rnd(7, 10), 0, 7); g.fill();
      g.fillRect(x - 11, yb - hh + 6, 22, hh + 40);
    }
  }
  // barrier
  const bg = g.createLinearGradient(0, hy - 30, 0, hy); bg.addColorStop(0, '#1b1f2e'); bg.addColorStop(1, '#0c0e16'); g.fillStyle = bg; g.fillRect(0, hy - 30, W, 30);
  g.fillStyle = 'rgba(255,40,60,0.8)'; g.fillRect(0, hy - 30, W, 3);
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,40,60,0.25)'; g.fillRect(0, hy - 34, W, 10); g.restore();
  // fog
  const fg = g.createLinearGradient(0, hy - 140, 0, hy); fg.addColorStop(0, 'rgba(60,70,110,0)'); fg.addColorStop(1, 'rgba(60,70,110,0.18)'); g.fillStyle = fg; g.fillRect(0, hy - 140, W, 140);
  return c;
}
const HORIZON = 470;
const D0 = 900;

// ================= PERSONALITY: lines, voices, stances =================
const PERSONA = [
  { vo: 'shout', intro: ["يلا تعال!"], skill: ["نطّة الزعيم!"], win: ["قلت لك لا تلعب معي!"], st: { lean: 8, th: 6, bth: -6 }, br: 0.14, bob: 5 },
  { vo: 'roar', intro: ["بكسّرك!"], skill: ["آآآاه!!"], win: ["روح تمرّن وتعال!"], st: { lean: 14, ua: 6, bua: 6, th: 10, bth: -12 }, br: 0.06, ba: 2.4 },
  { vo: 'whistle', intro: ["يلا نلعب!"], skill: ["سلايد!"], win: ["أسرع منك بمليون مرة"], st: { lean: 4 }, br: 0.16, bob: 5 },
  { vo: 'laugh', intro: ["حسبتها كلها"], skill: ["اختار ورقة!"], win: ["حسبتها قبل لا تبدأ"], st: { lean: -2, fa: 12, bfa: 10 }, br: 0.05, ba: 1 },
  { vo: 'grunt', intro: ["ولا كورة تعدّي"], skill: ["خذ الكورة!"], win: ["ولا كورة تعدّي… ولا ضربة!"], st: { ua: 22, fa: -60, bua: 20, bfa: -70, th: 20, bth: -18, lean: 16 }, br: 0.1 },
  { vo: 'deep', intro: ["وخّر من دربي"], skill: ["حجر!"], win: ["قلت لك وخّر من دربي"], st: { lean: 10, th: 8 }, br: 0.05, ba: 2.6 },
  { vo: 'hum', intro: ["ركّز يا ولد"], skill: ["الدرس الأول!"], win: ["الدرس خلص… روح البيت"], st: { lean: -4, ua: -10, fa: -14 }, br: 0.04, ba: 1.4 },
  { vo: 'yell', intro: ["لا تستصغرني"], skill: ["وخّروا… عربة!"], win: ["لا تستصغرني مرة ثانية"], st: { lean: 10 }, br: 0.18, bob: 4 },
  { vo: 'cluck', intro: ["كاك كاك!"], skill: ["يا دجاج… هجوم!"], win: ["روح جيب بيض… خلصت عليك!"], st: { ua: 16, bua: 14, fa: -20 }, br: 0.12, flap: 1 },
  { vo: 'bell', intro: ["جاهز تطير؟"], skill: ["خذ سيكلك!"], win: ["المرة الجاية جيب سيكلك معك"], st: { lean: 2, th: 10, bth: -8 }, br: 0.07 },
  { vo: 'huff', intro: ["كورة وحدة تكفي"], skill: ["صاروخ!"], win: ["كورة وحدة كفاية عليك!"], st: { lean: 4 }, br: 0.05, ba: 3 },
  { vo: 'schoolbell', intro: ["عندي اختبار بعدين"], skill: ["الواجب كله عليك!"], win: ["رحت المدرسة… ورجعت فايز!"], st: { lean: 6 }, br: 0.2, bob: 6 },
  { vo: 'kiai', intro: ["أوس!"], skill: ["هاي!"], win: ["خلني أكمل خبزتي"], st: { th: 30, sh: 26, bth: -30, bsh: 30, lean: 2, ua: -6 }, br: 0.07, ba: 1 },
  { vo: 'gamer', intro: ["ريسبون… وجاي"], skill: ["جي جي!"], win: ["جي جي… حظ أوفر المرة الجاية"], st: { ua: -8, fa: -6 }, br: 0.08 },
  { vo: 'shout', intro: ["اركب… ولا تخاف"], skill: ["وخّر… سيارة!"], win: ["اربط الحزام المرة الجاية"], st: { lean: 6, ua: -4, fa: 8 }, br: 0.1 },
];
PERSONA.push(
  { vo: 'roar', intro: ['البحر ما يرحم!'], skill: ['البحر معي!'], win: ['ارجع للبر يا ولد!'], st: { lean: 6, th: 6, bth: -6 }, br: 0.08 },
  { vo: 'roar', intro: ['كلكم شغالين عندي!'], skill: ['حس بالخاتم!'], win: ['الكأس لي… للأبد!'], st: { lean: 10, ua: 4, bua: 4, th: 8, bth: -10 }, br: 0.05, ba: 2 },
  { vo: 'roar', intro: ['الحين… تشوف قوتي!'], skill: ['شوف عيوني!'], win: ['ما في أحد يوقف الرئيس!'], st: { lean: 14, ua: 8, bua: 8, th: 10, bth: -12 }, br: 0.05, ba: 2.6 },
);
PERSONA[GUNMAN] = { vo: 'deep', intro: ['جاهز… تطلع من اللعبة؟'], skill: ['تطليق!'], win: ['آخر طلقة… كانت لك!'], st: { lean: 4, th: 6, bth: -6 }, br: 0.06 };
PERSONA[FISHER] = { vo: 'deep', intro: ['اليوم صيدي أنت!'], skill: ['هامور!'], win: ['صيد ثقيل… بس سهل!'], st: { lean: 10, th: 8 }, br: 0.05, ba: 2.6 };
PERSONA[TAMER] = { vo: 'shout', intro: ['الحيوانات معي!'], skill: ['هجوم!'], win: ['حتى القطو أقوى منك!'], st: { lean: 8, th: 6, bth: -6 }, br: 0.12, bob: 4 };
PERSONA[CODER] = { vo: 'laugh', intro: ['خلني أكتب الكود…'], skill: ['كهربا!'], win: ['صلّحت البق… وأنت كنت البق!'], st: { lean: -2, fa: 12, bfa: 10 }, br: 0.1 };
PERSONA[CHEF] = { vo: 'roar', intro: ['جاهز للطبخة؟'], skill: ['نار!'], win: ['الأكل جاهز… وأنت الطبق!'], st: { lean: 12, ua: 6, bua: 6, th: 10, bth: -12 }, br: 0.06, ba: 2.2 };
if (window.VOICE_TTS) Object.assign(window.VOICE_TTS, { 15: [0.82, 0.95], 16: [0.6, 0.86], 17: [0.42, 0.8], 18: [0.45, 0.88], 19: [0.9, 1.0], 20: [1.0, 1.05], 21: [0.5, 0.85], 22: [0.62, 0.92] });
const pickLine = a => a[(Math.random() * a.length) | 0];
// ---- Arabic voices: the browser's Arabic voice when it has one, otherwise the built-in recorded lines ----
const VOX = { clips: window.VOICE_CLIPS || {}, txt: window.VOICE_TXT || {}, bufs: {}, tbufs: {}, last: {}, voices: null, cur: [] };
// ---- recorded neural Arabic voice (Piper «Kareem»): every sentence recorded once, names recorded separately ----
const VOICE_RATE = { 21: 0.88, 20: 1.02, 19: 1.0, 18: 0.9, 0: 1.1, 1: 0.88, 5: 0.87, 6: 1.12, 8: 1.13, 11: 1.13, 15: 0.93, 16: 0.9, 17: 0.82, 99: 0.96 };
function voiceNorm(t) { return t.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu, '').replace(/[!؟?.,،:؛—"«»]/g, ' ').replace(/\s+/g, ' ').trim(); }
let VNAMES = null;
function voiceSegs(text) {
  if (!VNAMES) VNAMES = CHARS.filter((c, i) => i < NCH || c.hidden).map(c => c.name).sort((a, b) => b.length - a.length);
  const out = [];
  text.split('…').forEach((part, pi) => {
    let segs = [voiceNorm(part)];
    for (const n of VNAMES) segs = segs.flatMap(sg => { if (sg === n || !sg.includes(n)) return [sg]; const i = sg.indexOf(n); const a = sg.slice(0, i).trim(), b = sg.slice(i + n.length).trim(); return [a, n, b].filter(Boolean); });
    segs.filter(Boolean).forEach((sg, si) => out.push({ t: sg, gap: si === 0 && pi > 0 ? 0.2 : 0.03 }));
  });
  return out;
}
function voiceBuf(key) {
  const O = VOX.tord || (VOX.tord = []);
  if (VOX.tbufs[key]) { const i = O.indexOf(key); if (i >= 0) { O.splice(i, 1); O.push(key); } return VOX.tbufs[key]; }
  const b64 = VOX.txt[key]; if (!b64 || !AC) return null;
  O.push(key); while (O.length > 48) delete VOX.tbufs[O.shift()];
  return (VOX.tbufs[key] = new Promise(ok => { try { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); AC.decodeAudioData(u.buffer, ok, () => ok(null)); } catch (e) { ok(null); } }));
}
function voiceStop() { for (const s of VOX.cur) { try { s.stop(); } catch (e) { } } VOX.cur = []; voxDuck(false); }
function voicePrefetch(text) { if (!AC || !text) return; for (const sg of voiceSegs(text)) if (VOX.txt[sg.t]) voiceBuf(sg.t); }
function speakRec(text, who, stopPrev) {
  if (!AC) return false; { const pk = voxProKeys(text, voxTag(who)); if (pk) return voxPlay(pk, 1, stopPrev); } const segs = voiceSegs(text); if (!segs.length || segs.some(sg => !VOX.txt[sg.t])) return false;
  const tok = (VOX.tok = (VOX.tok || 0) + 1); if (stopPrev) voiceStop();
  Promise.all(segs.map(sg => voiceBuf(sg.t))).then(bufs => {
    if (stopPrev && tok !== VOX.tok) return; if (bufs.some(b => !b)) return;
    const rate = VOICE_RATE[who] || 1; let t = AC.currentTime + 0.03; voxDuck(true);
    bufs.forEach((b, i) => { const s = AC.createBufferSource(); s.buffer = b; s.playbackRate.value = rate; const g = AC.createGain(); g.gain.value = 1.25; s.connect(g); g.connect(voxG || master);
      if (i) t += segs[i].gap; s.start(t); t += b.duration / rate; VOX.cur.push(s); s.onended = () => { VOX.cur = VOX.cur.filter(x => x !== s); if (!VOX.cur.length) voxDuck(false); }; });
  });
  return true;
}
function arVoices() {
  if (VOX.voices) return VOX.voices;
  try {
    const all = (window.speechSynthesis && speechSynthesis.getVoices()) || []; if (!all.length) return [];
    const ar = all.filter(v => /^ar/i.test(v.lang));
    const fem = /laila|hoda|zariyah|salma|amany|amina|fatima|iman|mouna|rana|reem|sana|layla|noura|female|woman/i;
    const rank = v => (/BH|KW|SA|AE|QA|OM/i.test(v.lang) ? 0 : 2) + (/natural|online|neural|premium|enhanced/i.test(v.name) ? 0 : 1) + (fem.test(v.name) ? 5 : 0);
    VOX.voices = ar.sort((a, b) => rank(a) - rank(b)).filter((v, i, a) => !fem.test(v.name) || a.length < 2);
  } catch (e) { VOX.voices = []; }
  return VOX.voices;
}
try { if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { VOX.voices = null; }; } catch (e) { }
function clipBuf(key) {
  if (VOX.bufs[key] !== undefined || !AC) return VOX.bufs[key];
  const b64 = VOX.clips[key]; if (!b64) return (VOX.bufs[key] = null);
  VOX.bufs[key] = 0;
  try { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    AC.decodeAudioData(u.buffer, buf => { VOX.bufs[key] = buf; if (VOX.pending === key) { VOX.pending = null; playClip(key); } }, () => { VOX.bufs[key] = null; }); } catch (e) { VOX.bufs[key] = null; }
  return 0;
}
function playClip(key) {
  const buf = clipBuf(key); if (buf === 0) { VOX.pending = key; return true; } if (!buf) return false;
  const s = AC.createBufferSource(); s.buffer = buf; const g = AC.createGain(); g.gain.value = 1.15; s.connect(g); g.connect(voxG || master); s.start(); return true;
}
function speakAr(text, pitch = 1, rate = 1, vi = 0) {
  const vs = arVoices(); if (!vs.length) return false;
  try { const u = new SpeechSynthesisUtterance(text.replace(/[🏆🎉📖😋✨…]/gu, ' ')); const v = vs[vi % vs.length]; u.voice = v; u.lang = v.lang; u.pitch = clamp(pitch, 0, 2); u.rate = clamp(rate, 0.5, 2); u.volume = clamp(SET.vol, 0, 1); speechSynthesis.speak(u); return true; } catch (e) { return false; }
}
function charSpeak(ci, kind, text) {
  if (!SET.voice || muted) return;
  const now = performance.now(); if (VOX.last[ci] && now - VOX.last[ci] < 700) return; VOX.last[ci] = now;
  const T = (window.VOICE_TTS && window.VOICE_TTS[ci]) || [1, 1];
  if (text && speakRec(text, ci, false)) return;
  if (speakAr(text, T[0], T[1], ci)) return;
  if (playClip(ci + '_' + kind)) return;
  const P = PERSONA[ci]; if (P && P.vo) SFX.voice(P.vo);
}

function vox(f0, f1, dur, F, vol = 0.06, t0 = 0, type = 'sawtooth') {
  if (!AC) return; const t = AC.currentTime + t0;
  const o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.025); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  for (const fr of F) { const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = 5; o.connect(bp); bp.connect(g); }
  g.connect(sfxG); o.start(t); o.stop(t + dur + 0.05);
}
const VOICES = {
  shout: () => { vox(230, 170, 0.36, [700, 1200], 0.09); },
  roar: () => { vox(110, 70, 0.7, [450, 900], 0.11); nz(0.6, 'lowpass', 500, 0.8, 0.12, 0, 250); },
  whistle: () => { for (let i = 0; i < 2; i++) tn('sine', 2700, 2600, 0.12, 0.05, i * 0.16); tn('sine', 2900, 2700, 0.3, 0.05, 0.34); },
  laugh: () => { for (let i = 0; i < 4; i++) vox(300, 260, 0.08, [650, 1150], 0.07, i * 0.11); },
  grunt: () => { vox(160, 110, 0.22, [500, 1000], 0.09); },
  deep: () => { vox(110, 80, 0.5, [380, 780], 0.11); },
  hum: () => { vox(170, 150, 0.5, [320, 900], 0.08, 0, 'triangle'); },
  yell: () => { vox(400, 310, 0.32, [850, 1450], 0.08); },
  cluck: () => { for (let i = 0; i < 3; i++) { tn('square', rrnd(820, 900), 560, 0.05, 0.03, i * 0.13); tn('square', rrnd(1000, 1100), 640, 0.06, 0.03, i * 0.13 + 0.06); } },
  bell: () => { for (let i = 0; i < 2; i++) { tn('sine', 2350, 2350, 0.22, 0.06, i * 0.16); tn('sine', 3520, 3520, 0.16, 0.03, i * 0.16); } },
  huff: () => { nz(0.25, 'bandpass', 900, 1, 0.12); vox(190, 140, 0.25, [600, 1100], 0.07, 0.05); },
  schoolbell: () => { for (let i = 0; i < 7; i++) tn('sine', i % 2 ? 1650 : 1850, i % 2 ? 1650 : 1850, 0.05, 0.05, i * 0.05); },
  kiai: () => { vox(330, 440, 0.24, [900, 1500], 0.1); },
  gamer: () => { [523, 659, 784, 1047].forEach((f, i) => tn('square', f, f, 0.07, 0.035, i * 0.07)); },
};
// ================= MORE ARENAS =================
function bdCanvas() { const c = document.createElement('canvas'); c.width = 2400; c.height = VH; return [c, c.getContext('2d')]; }
function makePitch() {
  const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#0a1430'); gr.addColorStop(0.45, '#2a3f78'); gr.addColorStop(0.8, '#d9824a'); gr.addColorStop(1, '#f2b26a');
  g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  // stands
  g.fillStyle = '#141a2c'; g.beginPath(); g.moveTo(0, 170); g.lineTo(W, 170); g.lineTo(W, hy - 30); g.lineTo(0, hy - 30); g.closePath(); g.fill();
  g.fillStyle = '#1c2440'; g.fillRect(0, 160, W, 14); g.fillRect(0, 300, W, 8);
  const cols = ['#ff3b4a', '#ffd21f', '#ffffff', '#3ea0ff', '#2fbf62', '#ff8a2a'];
  for (let y = 182; y < hy - 40; y += 11) for (let x = (y % 22) / 2; x < W; x += 9) { if (Math.random() < 0.82) { g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.globalAlpha = 0.35 + Math.random() * 0.35; g.fillRect(x, y, 5, 6); } }
  g.globalAlpha = 1;
  // floodlight towers
  for (const x of [220, 820, 1580, 2180]) {
    g.strokeStyle = '#2a3048'; g.lineWidth = 8; g.beginPath(); g.moveTo(x, hy - 30); g.lineTo(x, 70); g.stroke();
    g.fillStyle = '#d8e2ff'; g.fillRect(x - 46, 40, 92, 34);
    g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(x, 57, 5, x, 57, 160); rg.addColorStop(0, 'rgba(255,255,240,0.9)'); rg.addColorStop(0.3, 'rgba(220,230,255,0.35)'); rg.addColorStop(1, 'rgba(200,220,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, 57, 160, 0, 7); g.fill(); g.restore();
  }
  // goal
  const gx = W / 2;
  g.strokeStyle = 'rgba(230,235,245,0.35)'; g.lineWidth = 1; for (let i = 0; i <= 18; i++) { g.beginPath(); g.moveTo(gx - 180 + i * 20, hy - 130); g.lineTo(gx - 160 + i * 18, hy); g.stroke(); } for (let j = 0; j <= 6; j++) { g.beginPath(); g.moveTo(gx - 180, hy - 130 + j * 21); g.lineTo(gx + 180, hy - 130 + j * 21); g.stroke(); }
  g.strokeStyle = '#f4f6fb'; g.lineWidth = 8; g.beginPath(); g.moveTo(gx - 190, hy); g.lineTo(gx - 190, hy - 135); g.lineTo(gx + 190, hy - 135); g.lineTo(gx + 190, hy); g.stroke();
  // ad boards
  const ads = ['الشلة FC', 'معركة الشلة', 'GOAL!', 'ملعب الشلة'];
  for (let x = 0, i = 0; x < W; x += 300, i++) { g.fillStyle = ['#d8142a', '#1f4fd8', '#0f0f14', '#ffb21a'][i % 4]; g.fillRect(x, hy - 30, 296, 30); g.fillStyle = i % 4 === 3 ? '#111' : '#fff'; g.font = `900 20px ${FA}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = /[A-Za-z]/.test(ads[i % 4]) && !/[\u0600-\u06FF]/.test(ads[i % 4]) ? 'ltr' : 'rtl'; g.fillText(ads[i % 4], x + 148, hy - 14); }
  return c;
}
function makeHosh() {
  const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#3a6aa6'); gr.addColorStop(0.5, '#e8a868'); gr.addColorStop(1, '#f6d69a');
  g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  g.save(); g.globalCompositeOperation = 'lighter'; const sg = g.createRadialGradient(1700, 200, 10, 1700, 200, 260); sg.addColorStop(0, 'rgba(255,240,200,0.9)'); sg.addColorStop(0.15, 'rgba(255,200,120,0.5)'); sg.addColorStop(1, 'rgba(255,160,80,0)'); g.fillStyle = sg; g.beginPath(); g.arc(1700, 200, 260, 0, 7); g.fill(); g.restore();
  // palms beyond the wall
  const palm = (x, y, s, col) => { g.strokeStyle = col; g.lineWidth = 10 * s; g.beginPath(); g.moveTo(x, hy); g.quadraticCurveTo(x + 30 * s, y + 120 * s, x + 10 * s, y); g.stroke(); g.fillStyle = col; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.42; g.beginPath(); g.ellipse(x + 10 * s + Math.cos(a) * 55 * s, y + Math.sin(a) * 30 * s + 10 * s, 62 * s, 10 * s, a, 0, 7); g.fill(); } };
  for (const [x, s] of [[300, 1], [760, 0.8], [1400, 1.1], [2050, 0.9]]) palm(x, 90 + (1 - s) * 60, s, '#3c3a2a');
  // mud wall
  const wt = 250; g.fillStyle = '#c99c62'; g.fillRect(0, wt, W, hy - wt);
  for (let x = 0; x < W; x += 40) { g.fillStyle = '#c99c62'; g.fillRect(x, wt - 22, 22, 22); g.beginPath(); g.moveTo(x, wt - 22); g.lineTo(x + 11, wt - 36); g.lineTo(x + 22, wt - 22); g.fill(); }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '90,60,30' : '255,230,190'},${Math.random() * 0.12})`; g.beginPath(); g.ellipse(Math.random() * W, wt + Math.random() * (hy - wt), 6 + Math.random() * 18, 3 + Math.random() * 6, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(80,50,20,0.25)'; g.fillRect(0, wt, W, 6);
  // door
  const dx = W / 2 - 110; g.fillStyle = '#6a3e1e'; g.beginPath(); g.moveTo(dx, hy); g.lineTo(dx, wt + 70); g.quadraticCurveTo(dx + 110, wt + 10, dx + 220, wt + 70); g.lineTo(dx + 220, hy); g.closePath(); g.fill();
  g.strokeStyle = '#4a2a12'; g.lineWidth = 4; g.beginPath(); g.moveTo(dx + 110, wt + 42); g.lineTo(dx + 110, hy); g.stroke();
  g.fillStyle = '#d8b25a'; for (let y = wt + 90; y < hy - 10; y += 26) for (const xx of [dx + 30, dx + 80, dx + 140, dx + 190]) { g.beginPath(); g.arc(xx, y, 3.5, 0, 7); g.fill(); }
  // windows and lanterns
  for (const x of [300, 700, 1650, 2050]) { g.fillStyle = '#5a3418'; g.fillRect(x - 40, wt + 50, 80, 90); g.fillStyle = '#2a170a'; g.fillRect(x - 32, wt + 58, 64, 74); g.strokeStyle = '#8a5a2a'; g.lineWidth = 3; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - 32 + k * 16, wt + 58); g.lineTo(x - 32 + k * 16, wt + 132); g.stroke(); } }
  for (const x of [520, 980, 1420, 1880]) { g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, wt + 10); g.lineTo(x, wt + 46); g.stroke(); g.fillStyle = '#e8a030'; g.fillRect(x - 9, wt + 46, 18, 24); g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(x, wt + 58, 2, x, wt + 58, 60); lg.addColorStop(0, 'rgba(255,200,90,0.7)'); lg.addColorStop(1, 'rgba(255,160,40,0)'); g.fillStyle = lg; g.beginPath(); g.arc(x, wt + 58, 60, 0, 7); g.fill(); g.restore(); }
  // jars
  for (const x of [150, 1050, 1350, 2250]) { g.fillStyle = '#8a5a32'; g.beginPath(); g.ellipse(x, hy - 34, 30, 36, 0, 0, 7); g.fill(); g.fillRect(x - 12, hy - 82, 24, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.ellipse(x - 10, hy - 44, 8, 16, 0, 0, 7); g.fill(); }
  g.save(); g.font = `900 46px ${FA}`; g.textAlign = 'center'; g.direction = 'rtl'; g.fillStyle = 'rgba(110,70,30,0.55)'; g.fillText('بيت الشلة', 1200 - 420, wt + 120); g.fillText('بيت الشلة', 1200 + 420, wt + 120); g.restore();
  return c;
}
function makeRoof() {
  const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#02030a'); gr.addColorStop(0.6, '#0b1532'); gr.addColorStop(1, '#1d2a58');
  g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; g.fillRect(Math.random() * W, Math.random() * 300, Math.random() < 0.1 ? 2 : 1, Math.random() < 0.1 ? 2 : 1); }
  // moon
  g.save(); g.globalCompositeOperation = 'lighter'; const mg = g.createRadialGradient(1750, 110, 10, 1750, 110, 150); mg.addColorStop(0, 'rgba(255,250,220,0.6)'); mg.addColorStop(1, 'rgba(200,210,255,0)'); g.fillStyle = mg; g.beginPath(); g.arc(1750, 110, 150, 0, 7); g.fill(); g.restore();
  g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(1750, 110, 44, 0, 7); g.fill(); g.fillStyle = '#0a1330'; g.beginPath(); g.arc(1768, 98, 40, 0, 7); g.fill();
  // skyline
  for (let x = -20; x < W; ) { const w = 60 + Math.random() * 120, h = 90 + Math.random() * 230; g.fillStyle = `rgb(${10 + Math.random() * 8},${14 + Math.random() * 8},${30 + Math.random() * 12})`; g.fillRect(x, hy - 40 - h, w, h);
    for (let wy = hy - 40 - h + 10; wy < hy - 50; wy += 16) for (let wx = x + 8; wx < x + w - 10; wx += 14) if (Math.random() < 0.3) { g.fillStyle = Math.random() < 0.8 ? 'rgba(255,214,120,0.8)' : 'rgba(140,200,255,0.8)'; g.fillRect(wx, wy, 6, 8); }
    x += w + 6; }
  // minaret
  const mx = 980; g.fillStyle = '#0c1226'; g.fillRect(mx - 16, hy - 380, 32, 340); g.fillRect(mx - 26, hy - 300, 52, 14); g.beginPath(); g.arc(mx, hy - 380, 18, Math.PI, 0); g.fill(); g.strokeStyle = '#7fe0a0'; g.lineWidth = 3; g.beginPath(); g.arc(mx, hy - 410, 8, 0.5, 5.8); g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(120,230,160,0.5)'; g.fillRect(mx - 26, hy - 300, 52, 3); g.restore();
  // parapet, tanks, dishes, string lights
  g.fillStyle = '#5a6070'; g.fillRect(0, hy - 46, W, 46); g.fillStyle = '#727a8c'; g.fillRect(0, hy - 50, W, 8);
  for (const x of [260, 1500, 2150]) { g.fillStyle = '#d8dce4'; g.beginPath(); g.ellipse(x, hy - 120, 46, 62, 0, 0, 7); g.fill(); g.fillStyle = '#b8bcc6'; g.fillRect(x - 46, hy - 120, 92, 70); g.fillStyle = '#8a909c'; g.fillRect(x - 40, hy - 56, 10, 10); g.fillRect(x + 30, hy - 56, 10, 10); }
  for (const x of [640, 1880]) { g.strokeStyle = '#9aa0ac'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, hy - 50); g.lineTo(x, hy - 110); g.stroke(); g.fillStyle = '#c8ccd6'; g.beginPath(); g.ellipse(x - 8, hy - 120, 34, 26, -0.5, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(30,30,40,0.9)'; g.lineWidth = 1.5; g.beginPath(); for (let x = 0; x <= W; x += 10) { const y = hy - 190 + Math.sin(x / 400 * Math.PI) * 30; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; const bc = ['255,60,80', '255,210,60', '80,200,255', '120,255,140']; for (let x = 20, i = 0; x < W; x += 40, i++) { const y = hy - 186 + Math.sin(x / 400 * Math.PI) * 30; g.fillStyle = `rgba(${bc[i % 4]},0.9)`; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); const rg = g.createRadialGradient(x, y, 1, x, y, 18); rg.addColorStop(0, `rgba(${bc[i % 4]},0.4)`); rg.addColorStop(1, `rgba(${bc[i % 4]},0)`); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); } g.restore();
  return c;
}
function makeDark() {
  const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#07000c'); gr.addColorStop(0.5, '#2a0532'); gr.addColorStop(0.85, '#5a0a22'); gr.addColorStop(1, '#8a1020');
  g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${20 + Math.random() * 30},0,${30 + Math.random() * 40},${0.25 + Math.random() * 0.3})`; g.beginPath(); g.ellipse(Math.random() * W, Math.random() * 280, 120 + Math.random() * 260, 30 + Math.random() * 50, 0, 0, 7); g.fill(); }
  g.save(); g.globalCompositeOperation = 'lighter'; const mg = g.createRadialGradient(1200, 160, 20, 1200, 160, 260); mg.addColorStop(0, 'rgba(255,60,60,0.85)'); mg.addColorStop(0.25, 'rgba(200,20,40,0.4)'); mg.addColorStop(1, 'rgba(120,0,40,0)'); g.fillStyle = mg; g.beginPath(); g.arc(1200, 160, 260, 0, 7); g.fill(); g.restore();
  g.fillStyle = '#ff4040'; g.beginPath(); g.arc(1200, 160, 70, 0, 7); g.fill();
  for (const [x, h, br] of [[150, 260, 0], [420, 180, 1], [760, 320, 0], [1640, 300, 1], [1980, 220, 0], [2260, 280, 1]]) { g.fillStyle = '#0c0410'; g.fillRect(x - 34, hy - h, 68, h); g.fillRect(x - 46, hy - h, 92, 18); if (br) { g.beginPath(); g.moveTo(x - 34, hy - h); g.lineTo(x - 10, hy - h - 40); g.lineTo(x + 6, hy - h - 12); g.lineTo(x + 34, hy - h - 30); g.lineTo(x + 34, hy - h); g.fill(); } }
  for (const [x, y, r] of [[600, 220, 40], [1000, 120, 26], [1500, 240, 50], [1850, 110, 30]]) { g.fillStyle = '#12061a'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y - 6); g.lineTo(x + r * 0.4, y + r); g.lineTo(x - r * 0.3, y + r * 0.8); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(180,30,255,0.18)'; g.fillRect(0, hy - 40, W, 40);
  return c;
}
function makePort() {
  const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#1b2a58'); gr.addColorStop(0.45, '#6a5a9a'); gr.addColorStop(0.75, '#f08a5a'); gr.addColorStop(1, '#ffc27a');
  g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  g.save(); g.globalCompositeOperation = 'lighter'; const sg = g.createRadialGradient(1250, hy - 150, 10, 1250, hy - 150, 320); sg.addColorStop(0, 'rgba(255,230,160,0.9)'); sg.addColorStop(1, 'rgba(255,140,80,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, hy); g.restore();
  g.fillStyle = '#ffe9b0'; g.beginPath(); g.arc(1250, hy - 150, 58, 0, 7); g.fill();
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,240,230,0.35)'; g.beginPath(); g.ellipse(Math.random() * W, 60 + Math.random() * 160, 80 + Math.random() * 140, 14 + Math.random() * 10, 0, 0, 7); g.fill(); }
  // sea
  const sy = hy - 150; gr = g.createLinearGradient(0, sy, 0, hy); gr.addColorStop(0, '#2a5a8a'); gr.addColorStop(1, '#0a2a4a'); g.fillStyle = gr; g.fillRect(0, sy, W, 150);
  g.strokeStyle = 'rgba(255,220,170,0.35)'; g.lineWidth = 2; for (let y = sy + 8; y < hy; y += 10) { g.beginPath(); for (let x = 0; x <= W; x += 20) { const yy = y + Math.sin(x / 60 + y) * 2; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,200,120,0.35)'; for (let y = sy + 4; y < hy; y += 7) g.fillRect(1250 - 40 - (y - sy) * 0.5, y, 80 + (y - sy), 2); g.restore();
  // dhows on the horizon
  for (const [x, s] of [[380, 0.7], [820, 0.5], [1800, 0.8], [2150, 0.45]]) { g.save(); g.translate(x, sy + 6); g.scale(s, s); g.fillStyle = '#2a1a14'; g.beginPath(); g.moveTo(-120, -20); g.lineTo(110, -16); g.quadraticCurveTo(150, -30, 160, -60); g.lineTo(130, 6); g.lineTo(-100, 8); g.closePath(); g.fill(); g.fillRect(-40, -220, 7, 200); g.fillStyle = '#3a2a22'; g.beginPath(); g.moveTo(-36, -220); g.quadraticCurveTo(40, -150, 50, -30); g.lineTo(-36, -40); g.closePath(); g.fill(); g.restore(); }
  // pier posts + crates + cranes
  g.fillStyle = '#3a2614'; for (let x = 40; x < W; x += 180) g.fillRect(x, hy - 70, 16, 70);
  g.fillStyle = '#5a3a20'; g.fillRect(0, hy - 74, W, 10);
  for (const x of [200, 640, 1560, 2050]) { g.fillStyle = '#8a5a2a'; g.fillRect(x, hy - 118, 70, 56); g.strokeStyle = '#4a2a10'; g.lineWidth = 3; g.strokeRect(x, hy - 118, 70, 56); g.beginPath(); g.moveTo(x, hy - 118); g.lineTo(x + 70, hy - 62); g.stroke(); }
  g.strokeStyle = '#1a2030'; g.lineWidth = 8; for (const x of [1000, 2300]) { g.beginPath(); g.moveTo(x, hy - 70); g.lineTo(x, hy - 380); g.lineTo(x + 220, hy - 380); g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 200, hy - 380); g.lineTo(x + 200, hy - 260); g.stroke(); g.lineWidth = 8; }
  return c;
}
function makePalace(red) {
  const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, red ? '#120004' : '#0a0604'); gr.addColorStop(0.6, red ? '#3a0410' : '#2a1608'); gr.addColorStop(1, red ? '#6a0a14' : '#4a2a10');
  g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  // tall windows (red sky for the second form)
  for (let x = 140; x < W; x += 320) { g.fillStyle = red ? '#ff2a2a' : '#1a2a50'; g.beginPath(); g.moveTo(x, hy - 120); g.lineTo(x, hy - 380); g.quadraticCurveTo(x + 55, hy - 450, x + 110, hy - 380); g.lineTo(x + 110, hy - 120); g.closePath(); g.fill();
    if (red) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,80,40,0.25)'; g.fillRect(x - 40, hy - 460, 190, 360); g.restore(); }
    g.strokeStyle = '#d4a640'; g.lineWidth = 4; g.stroke(); g.beginPath(); g.moveTo(x + 55, hy - 420); g.lineTo(x + 55, hy - 120); g.moveTo(x, hy - 260); g.lineTo(x + 110, hy - 260); g.stroke(); }
  // gold pillars
  for (let x = 0; x < W; x += 320) { const gp = g.createLinearGradient(x - 26, 0, x + 26, 0); gp.addColorStop(0, '#6a4a10'); gp.addColorStop(0.5, '#f0c860'); gp.addColorStop(1, '#5a3a08'); g.fillStyle = gp; g.fillRect(x - 24, 40, 48, hy - 40); g.fillRect(x - 36, 40, 72, 22); g.fillRect(x - 36, hy - 34, 72, 22); }
  // red curtains
  for (let x = 0; x < W; x += 320) { g.fillStyle = red ? '#5a0010' : '#7a0a18'; g.beginPath(); g.moveTo(x + 30, 30); g.quadraticCurveTo(x + 90, 120, x + 60, 300); g.lineTo(x + 30, 300); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x + 290, 30); g.quadraticCurveTo(x + 230, 120, x + 260, 300); g.lineTo(x + 290, 300); g.closePath(); g.fill(); }
  // throne
  const tx = 1200; g.fillStyle = '#2a1608'; g.fillRect(tx - 110, hy - 330, 220, 300); g.fillStyle = '#7a0a18'; g.fillRect(tx - 80, hy - 300, 160, 230); g.strokeStyle = '#f0c860'; g.lineWidth = 6; g.strokeRect(tx - 110, hy - 330, 220, 300);
  g.beginPath(); g.moveTo(tx - 110, hy - 330); g.lineTo(tx - 70, hy - 400); g.lineTo(tx, hy - 360); g.lineTo(tx + 70, hy - 400); g.lineTo(tx + 110, hy - 330); g.stroke();
  // chandeliers
  g.save(); g.globalCompositeOperation = 'lighter'; for (const x of [600, 1200, 1800]) { const cg = g.createRadialGradient(x, 120, 6, x, 120, 160); cg.addColorStop(0, red ? 'rgba(255,90,60,0.8)' : 'rgba(255,220,140,0.8)'); cg.addColorStop(1, 'rgba(255,180,80,0)'); g.fillStyle = cg; g.beginPath(); g.arc(x, 120, 160, 0, 7); g.fill(); } g.restore();
  for (const x of [600, 1200, 1800]) { g.strokeStyle = '#d4a640'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 100); g.stroke(); g.beginPath(); g.ellipse(x, 118, 60, 16, 0, 0, 7); g.stroke(); }
  return c;
}
const STAGE_DEFS = {
  arena: { name: 'الحلبة', make: () => BACKDROP || makeBackdrop(), floor: ['#141826', '#0c0f19', '#040509'], grid: 'rgba(150,170,240,0.16)', ring: '255,30,50', glow: '#ff2040', fog: '12,14,24', twinkle: 1 },
  pitch: { name: 'ملعب الكورة', make: makePitch, floor: ['#2a7a34', '#1c5e26', '#0a2a10'], stripes: 1, lines: 1, fog: '30,60,40' },
  hosh: { name: 'حوش البيت', make: makeHosh, floor: ['#d3ac72', '#b08a52', '#5a4426'], grid: 'rgba(90,60,30,0.10)', rug: 1, fog: '200,150,100' },
  roof: { name: 'سطح البيت', make: makeRoof, floor: ['#3e4352', '#2b2f3b', '#101218'], grid: 'rgba(200,210,230,0.14)', fog: '20,26,48' },
  port: { name: 'الميناء', make: makePort, floor: ['#7a5a3a', '#5e4428', '#2a1c10'], grid: 'rgba(30,15,5,0.32)', fog: '120,110,140' },
  palace: { name: 'قصر الرئيس', make: () => makePalace(false), floor: ['#2a1a12', '#1a0f0a', '#050302'], grid: 'rgba(212,166,64,0.16)', ring: '212,166,64', glow: '#d4a640', fog: '40,24,10' },
  palace2: { name: 'القصر يحترق', make: () => makePalace(true), floor: ['#2a0608', '#160204', '#050001'], grid: 'rgba(255,40,40,0.2)', ring: '255,20,40', glow: '#ff1030', fog: '60,4,8', storm: 1, red: 1 },
  dark: { name: 'عرش الظل', make: makeDark, floor: ['#1a0624', '#0c0314', '#020005'], grid: 'rgba(190,60,255,0.22)', ring: '190,40,255', glow: '#b030ff', fog: '30,4,40', storm: 1 },
};
const STAGE_POOL = ['arena', 'pitch', 'hosh', 'roof'];
const BDS = {};
function stageBD(id) { return BDS[id] || (BDS[id] = STAGE_DEFS[id].make()); }

function drawStage(cam, t, sid) {
  const SD = STAGE_DEFS[sid] || STAGE_DEFS.arena, BD = stageBD(STAGE_DEFS[sid] ? sid : 'arena');
  const z = cam.z, yaw = cam.yaw || 0, W = BD.width;
  // backdrop panorama (turns with the camera)
  let bx = -((cam.x * 0.35) + (W - VW) / 2) - yaw * 760;
  bx = ((bx % W) + W) % W - W;
  ctx.drawImage(BD, bx, 0); ctx.drawImage(BD, bx + W, 0);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (SD.twinkle) for (let i = 0; i < 26; i++) {
    const ph = (t * 0.02 + i * 1.7) % 6;
    if (ph < 0.25) { const x = (((i * 397) % W) + bx + W) % W, y = 400 + ((i * 53) % 50); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
  }
  ctx.restore();
  // floor
  const fg = ctx.createLinearGradient(0, HORIZON, 0, VH); fg.addColorStop(0, SD.floor[0]); fg.addColorStop(0.4, SD.floor[1]); fg.addColorStop(1, SD.floor[2]);
  ctx.fillStyle = fg; ctx.fillRect(0, HORIZON, VW, VH - HORIZON);
  // true 3D floor grid projected through the rotating camera
  const FH = GSY - HORIZON, cs = Math.cos(yaw), sn = Math.sin(yaw);
  const proj = (gx, gz) => { const X = gx * cs + gz * sn - cam.x, Zc = -gx * sn + gz * cs + D0; if (Zc < 120) return null; return [VW / 2 + X * D0 / Zc * z, HORIZON + FH * D0 / Zc, Zc]; };
  const line = (pts, style, w) => { ctx.strokeStyle = style; ctx.lineWidth = w; ctx.beginPath(); let on = false; for (const q of pts) { if (!q) { on = false; continue; } if (!on) { ctx.moveTo(q[0], q[1]); on = true; } else ctx.lineTo(q[0], q[1]); } ctx.stroke(); };
  ctx.save();
  const poly = (pts, fill) => { const q = pts.filter(Boolean); if (q.length < 3) return; ctx.fillStyle = fill; ctx.beginPath(); q.forEach((v, i) => i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1])); ctx.closePath(); ctx.fill(); };
  const circ = (rr, cx = 0, cz = 0) => { const pts = []; for (let k = 0; k <= 64; k++) { const a = k / 64 * Math.PI * 2; pts.push(proj(cx + Math.cos(a) * rr, cz + Math.sin(a) * rr)); } return pts; };
  if (SD.stripes) for (let i = -12; i < 12; i++) { if (i & 1) continue; const g0 = i * 160, g1 = g0 + 160, L = [], Rr = []; for (let j = -12; j <= 12; j++) { L.push(proj(g0, j * 130)); Rr.unshift(proj(g1, j * 130)); } poly(L.concat(Rr), 'rgba(255,255,255,0.05)'); }
  if (SD.rug) { poly(circ(560), 'rgba(120,20,24,0.55)'); poly(circ(470), 'rgba(170,40,30,0.5)'); line(circ(520), 'rgba(230,180,80,0.6)', 3); line(circ(400), 'rgba(230,180,80,0.5)', 2); poly(circ(110), 'rgba(230,180,80,0.35)'); }
  if (SD.grid) for (let i = -20; i <= 20; i++) {
    const g = i * 130, a = [], b = [];
    for (let j = -20; j <= 20; j++) { a.push(proj(g, j * 130)); b.push(proj(j * 130, g)); }
    line(a, SD.grid, 1.5); line(b, SD.grid, 1.5);
  }
  if (SD.lines) { const lw = 'rgba(255,255,255,0.7)'; const zl = []; for (let j = -14; j <= 14; j++) zl.push(proj(0, j * 120)); line(zl, lw, 3); line(circ(330), lw, 3); for (const sz of [-760, 760]) { const pl = []; for (let i = -18; i <= 18; i++) pl.push(proj(i * 130, sz)); line(pl, lw, 3); } poly(circ(14), lw); }
  if (SD.ring) { ctx.globalCompositeOperation = 'lighter'; ctx.shadowColor = SD.glow; ctx.shadowBlur = 18;
    for (const [rr, al] of [[620, 0.38], [430, 0.2]]) line(circ(rr), `rgba(${SD.ring},${al})`, 3); }
  ctx.restore();
  if (SD.storm) { const ph = t % 300; if (ph < 10 || (ph > 16 && ph < 22)) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = SD.red ? `rgba(255,90,70,${ph < 10 ? 0.22 : 0.12})` : `rgba(200,150,255,${ph < 10 ? 0.22 : 0.12})`; ctx.fillRect(0, 0, VW, VH); ctx.strokeStyle = 'rgba(240,220,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); let lx = 300 + ((t / 300 | 0) * 377) % 700, ly = 0; ctx.moveTo(lx, ly); while (ly < HORIZON - 60) { lx += ((ly * 7919) % 60) - 30; ly += 40; ctx.lineTo(lx, ly); } ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 30; i++) { const x = (i * 211 + t * (1 + i % 3)) % VW, y = VH - ((t * (1.5 + (i % 4) * 0.5) + i * 97) % (VH - 80)); ctx.fillStyle = i % 2 ? 'rgba(255,80,60,0.7)' : 'rgba(190,80,255,0.7)'; ctx.fillRect(x, y, 3, 3); } ctx.restore(); }
  // fade far floor into horizon
  const hz = ctx.createLinearGradient(0, HORIZON, 0, HORIZON + 70); hz.addColorStop(0, `rgba(${SD.fog},0.9)`); hz.addColorStop(1, `rgba(${SD.fog},0)`); ctx.fillStyle = hz; ctx.fillRect(0, HORIZON, VW, 70);
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, 200, VW / 2, VH / 2, 820); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, VW, VH);
}

function drawBubble(f) {
  const b = f.bubble, a = Math.min(1, b.t / 6, (b.dur - b.t) / 12); if (a <= 0) return;
  const x = f.x, y = Math.min(f.hurt.y0, f.hipY - 300) - 70, sc = 0.85 + 0.15 * Math.min(1, b.t / 6);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = `900 26px ${FA}`; ctx.direction = 'rtl'; const w = Math.max(90, ctx.measureText(b.text).width + 36), h = 48;
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  rrect(-w / 2, -h / 2, w, h, 18); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, h / 2 - 2); ctx.lineTo(4, h / 2 + 18); ctx.lineTo(14, h / 2 - 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(-10, h / 2); ctx.lineTo(4, h / 2 + 18); ctx.lineTo(14, h / 2); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.text, 0, 2);
  ctx.restore();
}
function depthS(zz) { return D0 / (D0 + (zz || 0)); }
function fInvA(f) { const t = f.invis | 0; if (t <= 0) return 1; if (t > 225) return 0.1 + (t - 225) / 15 * 0.9; if (t < 20) return 0.1 + (20 - t) / 20 * 0.9; return 0.1 + 0.05 * Math.sin(G.frame * 0.3); }
function withDepth(f, camz, fn) { if (!(f && f.invis > 0)) return withDepth0(f, camz, fn); ctx.save(); ctx.globalAlpha *= fInvA(f); try { withDepth0(f, camz, fn); } finally { ctx.restore(); } }
function withDepth0(f, camz, fn) {
  const sc = depthS(f.z); if (Math.abs(sc - 1) < 0.002) { fn(); return; }
  ctx.save(); ctx.translate(f.x, (GSY - HORIZON) * (sc - 1) / camz); ctx.scale(sc, sc); ctx.translate(-f.x, 0); fn(); ctx.restore();
}

// ================= DRAW FIGHTER =================
function drawCaps(f) { // debug view of hit shapes
  ctx.save(); ctx.lineWidth = 2;
  for (const c of f.caps || []) { ctx.strokeStyle = 'rgba(60,255,120,0.9)'; ctx.beginPath(); const a = Math.atan2(c[3] - c[1], c[2] - c[0]); ctx.arc(c[0], c[1], c[4], a + Math.PI / 2, a - Math.PI / 2); ctx.arc(c[2], c[3], c[4], a - Math.PI / 2, a + Math.PI / 2); ctx.closePath(); ctx.stroke(); }
  const hb = f.state === 'attack' && f.hitbox(); if (hb && hb.ar !== undefined) { ctx.strokeStyle = '#ff3040'; ctx.lineWidth = hb.ar * 2; ctx.lineCap = 'round'; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(hb.x2, hb.y2); ctx.lineTo(hb.x, hb.y); ctx.stroke(); }
  ctx.restore();
}
function drawFighter(f, opts = {}) {
  const R = f.R, J = f.J, k = R.k, p = f.pose;
  const mv = f.mv;
  if (f.state === 'attack' && mv && mv.vanish && f.mt >= mv.vanish[0] && f.mt < mv.vanish[1]) return;
  if ((f.state === 'attack' && mv && mv.ball && f.mt >= mv.st && f.mt < mv.st + mv.ac) || (f.state === 'rageSeq' && f.finBall)) { if (!opts.refl) drawRollBall(f); return; }
  if ((f.state === 'attack' && mv && mv.car && f.mt >= mv.st - 3 && f.mt <= mv.st + mv.ac + 2) || (f.state === 'rageSeq' && f.finCar)) { if (!opts.refl && !opts.ghost) drawCar(f.x, f.facing, G.frame, Object.assign({ driver: f, sp: f.state === 'attack' && f.mt >= mv.st && f.mt < mv.st + mv.ac ? 1 : 0 }, f.state === 'rageSeq' ? f.finCar : {})); if (f.state === 'attack' && mv.limo) drawLimoFlags(f.x, f.facing, G.frame); return; }
  ctx.save();
  if (f.C.props && !opts.ghost && !opts.refl) { ctx.save(); f.C.props(f, false); ctx.restore(); }
  if (opts.ghost) { ctx.globalAlpha *= 0.32 / opts.ghost; ctx.translate(-f.facing * opts.ghost * 34, 0); }
  let jx = 0; if (f.shakeT > 0) jx = (Math.random() - 0.5) * 8;
  ctx.translate(f.x + jx, f.hipY);
  ctx.scale(f.facing * k, k);
  ctx.translate(p.dx, p.dy);
  const fl = f.flash > 1;
  const rg = f.rage && !opts.refl && (G.frame % 20 < 10);
  const front = fl ? 'flash' : rg ? 'rage' : f.shadow ? 'shadow' : f.C.awake ? 'dark' : 'img';
  const back = fl ? 'flash' : 'dark';
  const seg = (s, v) => { const [name, at, a, piv, sc] = s; const Pp = R.P[name]; ctx.save(); ctx.translate(at[0], at[1]); ctx.rotate(a); if (sc && sc !== 1) ctx.scale(sc, sc); ctx.drawImage(Pp[v], Pp.ox - piv[0], Pp.oy - piv[1]); ctx.restore(); };
  for (const s of J.barm) seg(s, back);
  for (const s of [J.bleg[1], J.bleg[2], J.bleg[0]]) seg(s, back);
  for (const s of [J.fleg[1], J.fleg[2], J.fleg[0]]) seg(s, front);
  if (J.skirt) seg(J.skirt, front);
  seg(J.torso, front);
  for (const s of J.farm) seg(s, front);
  ctx.restore();
  if (!opts.ghost && !opts.refl) { if (f.C.props) { ctx.save(); f.C.props(f, true); ctx.restore(); } if (f.C.malali || f.bossAs === MALALI) drawMalaliEyes(f); if (f.mech) drawMechFront(f); }
}
function drawAura(f) {
  if (f.state === 'attack' && f.mv && f.mv.vanish && f.mt >= f.mv.vanish[0] && f.mt < f.mv.vanish[1]) return;
  if (f.shadow && f.hp > 0) { const b = f.hurt, cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = 190 + Math.sin(G.frame * 0.15) * 14; const gr = ctx.createRadialGradient(cx, cy, 20, cx, cy, r); gr.addColorStop(0, 'rgba(170,40,255,0.3)'); gr.addColorStop(1, 'rgba(120,0,200,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.7, r, 0, 0, 7); ctx.fill(); ctx.restore(); if (G.frame % 3 === 0) FX.push({ t: 'p', x: cx + rnd(-50, 50), y: b.y1 - rnd(0, 60), vx: rnd(-0.5, 0.5), vy: -rnd(2, 5), life: 26, max: 26, c: '#b030ff', sz: rnd(2, 5) }); }
  if (!f.rage || f.hp <= 0) return;
  const b = f.hurt; const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const r = 170 + Math.sin(G.frame * 0.2) * 12;
  const gr = ctx.createRadialGradient(cx, cy, 20, cx, cy, r); gr.addColorStop(0, 'rgba(255,20,40,0.22)'); gr.addColorStop(1, 'rgba(255,20,40,0)');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.7, r, 0, 0, 7); ctx.fill();
  if (G.frame % 3 === 0) FX.push({ t: 'p', x: cx + rnd(-50, 50), y: b.y1 - rnd(0, 40), vx: rnd(-0.5, 0.5), vy: -rnd(2, 5), life: 24, max: 24, c: '#ff2a3a', sz: rnd(2, 4) });
  ctx.restore();
}

// ================= PROJECTILES & SKILL PROPS =================
function spawnProj(o) { if (!G.fight) return; G.fight.proj.push(Object.assign({ rot: 0, vr: 0, g: 0, life: 120, r: 16, t: 0, dir: o.owner ? o.owner.facing : 1, z: o.owner ? o.owner.z || 0 : 0, wide: o.kind === 'wave' || o.r >= 55 || (o.y !== undefined && o.y < -700) }, o)); }
function crumble(p) {
  const big = p.r > 40;
  for (let i = 0; i < (big ? 30 : 16); i++) { const a = rnd(Math.PI, Math.PI * 2); FX.push({ t: 'p', x: p.x + rnd(-p.r, p.r) * 0.5, y: Math.min(-4, p.y), vx: Math.cos(a) * rnd(2, big ? 11 : 8), vy: Math.sin(a) * rnd(3, big ? 12 : 9), life: rnd(20, 40), max: 40, c: i % 2 ? '#7d7266' : '#a39684', sz: rnd(4, big ? 11 : 7) }); }
  dust(p.x, big ? 24 : 14); SFX.rock(); if (big) SFX.thud(); if (G.fight) G.fight.shake(big ? 16 : 9);
}
function updProj(F) {
  const P = F.proj;
  for (const p of P) {
    p.t++; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life--; if (p.tick) p.tick(p);
    if (p.sin) p.y = p.base + Math.sin(p.t * p.sin[1]) * p.sin[0];
    if (p.kind === 'seawave' && p.t % 2 === 0) FX.push({ t: 'p', x: p.x + rnd(-120, 120), y: -rnd(60, 240), vx: Math.sign(p.vx) * rnd(1, 5), vy: -rnd(1, 5), life: 22, max: 22, c: p.t % 4 ? '#ffffff' : '#9fe0ff', sz: rnd(3, 7) });
    if (p.ground) { p.y = -p.r; if (p.t % 3 === 0) dust(p.x - Math.sign(p.vx) * p.r * 0.6, 1); }
    if (p.bounce && p.y >= -p.r && p.vy > 0) { p.y = -p.r; p.vy = -Math.abs(p.vy) * p.bounce; p.bounces = (p.bounces || 0) + 1; dust(p.x, 3); if (p.bounces > 4) p.dead = true; }
    if (p.kind === 'wave') { if (p.t % 2 === 0) FX.push({ t: 'd', x: p.x, y: -rnd(0, 20), vx: 0, vy: -rnd(0.5, 2), life: 20, max: 20, sz: rnd(10, 18) }); }
    if (p.kind === 'cartproj' && p.y >= -60 && p.vy > 0) { p.dead = true; spawnProj({ kind: 'cartwreck', owner: p.owner, x: p.x, y: 0, vx: p.vx * 0.5, vy: -6, g: 0.6, vr: p.dir * 0.2, life: 60, noHit: true, dir: p.dir }); SFX.rock(); dust(p.x, 14); if (G.fight) G.fight.shake(10); continue; }
    if (p.kind === 'card' && p.t % 3 === 0) FX.push({ t: 'p', x: p.x, y: p.y, vx: -p.vx * 0.05, vy: 0, life: 10, max: 10, c: '#ffffff', sz: 2 });
    if (p.power) { p.tr.push([p.x, p.y]); if (p.tr.length > 9) p.tr.shift(); FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * rnd(16, 34), y: p.y + rnd(-14, 14), vx: -Math.sign(p.vx) * rnd(2, 5), vy: rnd(-1.5, 1.5), life: 14, max: 14, c: p.t % 3 ? '#ffd34d' : '#ff8a2a', sz: rnd(3, 7) }); }
    else if (p.kind === 'hball' && p.t % 2 === 0) FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * 14, y: p.y, vx: 0, vy: 0, life: 9, max: 9, c: '#ffd34d', sz: 3 });
    if (p.kind === 'rock' && !p.ground && !p.bounce && p.y >= -p.r * 0.6 && p.vy > 0) { crumble(p); p.dead = true; continue; }
    if (p.kind === 'grenade' && (p.life <= 1 || (p.bounces || 0) >= 2)) { p.kind = 'boom'; p.r = 95; p.vx = 0; p.vy = 0; p.g = 0; p.bounce = 0; p.life = 10; p.wide = true; SFX.rock(); SFX.thud(); dust(p.x, 20); if (G.fight) G.fight.shake(14); for (let i = 0; i < 26; i++) { const a = rnd(0, 7), sp = rnd(3, 12); FX.push({ t: 'p', x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 22, max: 22, c: i % 3 ? '#ff8a2a' : '#ffe06a', sz: rnd(3, 7) }); } }
    if (p.kind === 'grenade') continue;
    if (p.kind === 'laser' && p.t % 2 === 0) FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * 16, y: p.y, vx: 0, vy: 0, life: 6, max: 6, c: p.col, sz: 3 });
    if (p.kind === 'hball' && p.fire && p.t % 2 === 0) FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * 20, y: p.y + rnd(-10, 10), vx: -Math.sign(p.vx) * 2, vy: rnd(-1, 1), life: 12, max: 12, c: '#ff8a2a', sz: rnd(4, 8) });
    if (p.kind === 'egg' && p.y >= -p.r * 0.6 && p.vy > 0) { p.y = -4; eggSplat(p); p.dead = true; continue; }
    if (p.kind === 'bike' && p.y >= -p.r * 0.55 && p.vy > 0) { bikeCrash(p); p.dead = true; continue; }
    if (p.kind === 'flame' && p.t % 2 === 0) FX.push({ t: 'p', x: p.x + rnd(-30, 30), y: p.y + rnd(-30, 30), vx: -Math.sign(p.vx) * rnd(1, 3), vy: -rnd(1, 4), life: 16, max: 16, c: p.t % 4 ? '#ff8a2a' : '#ffd34d', sz: rnd(4, 9) });
    if (p.kind === 'shark' && p.t === 1) splash(p.x, 18);
    if (p.kind === 'fish' && p.y >= -12 && p.vy > 0) { SFX.splat(); splash(p.x, 8); p.dead = true; continue; }
    if (p.kind === 'dog' && p.t % 3 === 0) dust(p.x - Math.sign(p.vx) * 50, 2, -Math.sign(p.vx));
    if (p.kind === 'cat' && p.y >= -10 && p.vy > 0) { p.y = -10; p.vy = 0; p.g = 0; p.vx *= 0.3; p.life = Math.min(p.life, 14); }
    if (p.kind === 'falcon' && p.y >= -40 && p.vy > 0) { p.vy = -2; p.g = -0.4; p.vx = (Math.sign(p.vx) || p.dir || 1) * 12; }
    if (p.kind === 'laptop' && !p.noHit && p.y >= -p.r * 0.5 && p.vy > 0) { SFX.thud(); SFX.rattle(); dust(p.x, 16); finBurst(p.x, -20, 16, ['#ff2a3a', '#ffffff', '#555b66'], 8, 5); if (G.fight) G.fight.shake(12); p.dead = true; continue; }
    if (p.kind === 'code' && p.t % 3 === 0) FX.push({ t: 'p', x: p.x, y: p.y + rnd(-20, 20), vx: -Math.sign(p.vx) * 2, vy: rnd(-1, 1), life: 12, max: 12, c: '#ff3040', sz: rnd(3, 6) });
    if (p.kind === 'tomato' && p.y >= -p.r * 0.6 && p.vy > 0) { SFX.splat(); finBurst(p.x, -8, 14, ['#e8231c', '#ff6a50', '#2f8f2a'], 6, 5); p.dead = true; continue; }
    if (p.kind === 'plate' && p.y >= -10 && p.vy > 0) { SFX.rattle(); finBurst(p.x, -8, 12, ['#ffffff', '#3a6fd1'], 7, 4); p.dead = true; continue; }
    if (p.kind === 'pot' && !p.noHit && p.y >= -p.r * 0.6 && p.vy > 0) { SFX.thud(); SFX.rattle(); dust(p.x, 20); if (G.fight) G.fight.shake(14); p.dead = true; continue; }
    if ((p.kind === 'cash' || p.kind === 'cashbag' || p.kind === 'meteor') && p.y >= -p.r * 0.4 && p.vy > 0) { if (p.kind === 'meteor') { finBurst(p.x, -16, 18, ['#ff2030', '#ffd34d', '#2a0a0a'], 10, 6); finRing(p.x, -10, '#ff4030', 110, 10); dust(p.x, 10); SFX.thud(); G.fight && G.fight.shake(6); } else if (p.kind === 'cashbag') { finBurst(p.x, -16, 16, ['#ffd34d', '#3c9a4a'], 8, 6); SFX.rattle(); } p.dead = true; continue; }
    if (p.kind === 'goldbar' && p.y >= -p.r * 0.5 && p.vy > 0) { finBurst(p.x, -10, 10, ['#ffd34d', '#ffffff'], 6, 5); SFX.rattle(); p.dead = true; continue; }
    if (p.kind === 'door' && p.g && !p.noHit && p.y >= -p.r * 0.4 && p.vy > 0) { dust(p.x, 10); SFX.rattle(); SFX.thud(); if (G.fight) G.fight.shake(8); p.dead = true; continue; }
    if (p.kind === 'bikewreck' && p.y >= -30 && p.vy > 0) { p.y = -30; p.vy *= -0.35; p.vx *= 0.6; p.vr *= 0.5; if (Math.abs(p.vy) > 2) { dust(p.x, 5); SFX.rattle(); } }
    if (p.kind === 'chicken' && p.t % 9 === 0) { FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * 20, y: p.y - 10, vx: -Math.sign(p.vx) * rnd(1, 3), vy: rnd(-2, 0), life: 18, max: 18, c: '#ffffff', sz: rnd(2, 4) }); if (p.t % 27 === 0) SFX.cluck(); }
    if ((p.kind === 'tire' || p.kind === 'cartire') && p.bounce && p.y >= -p.r - 1 && p.vy < 0 && p.t > 2 && p.vy < -2) SFX.boing();
    if (p.kind === 'cartwreck' && p.y >= 0 && p.vy > 0) { p.y = 0; p.vy *= -0.35; p.vx *= 0.7; p.vr *= 0.5; if (Math.abs(p.vy) > 2) { dust(p.x, 6); SFX.rattle(); } }
    if (p.life <= 0 || Math.abs(p.x) > STAGE + 350 || p.y > 60) p.dead = true;
    if (p.noHit || p.dead) continue;
    const d = F.f[1 - p.owner.slot];
    if (p.passed === d) continue;
    if (d.state === 'dodge' && d.invuln > 0) { const r = d.hurt; if (Math.hypot(p.x - clamp(p.x, r.x0, r.x1), p.y - clamp(p.y, r.y0, r.y1)) <= p.r + 20) { d.dodgeHit(); p.passed = d; } continue; }
    if (d.invuln > 0 || ['down', 'getup', 'ko', 'rageVic', 'lose', 'win'].includes(d.state)) continue;
    if (F.fin && F.fin.a === d) continue;
    if (!p.wide && Math.abs(p.z - (d.z || 0)) > 60) continue;
    if (p.m.lvl === 'high' && d.lowProfile() && d.state !== 'juggle') continue;
    const r = d.hurt; const cx = clamp(p.x, r.x0, r.x1), cy = clamp(p.y, r.y0, r.y1);
    if (Math.hypot(p.x - cx, p.y - cy) <= p.r && p.bob && d.ci === 4) { p.dead = true; spark(p.x, p.y, 'block', d.facing); SFX.block(); popText('صدّها! 🧤', p.x, p.y - 50, '#7fd6ff', 34); d.flash = 6; continue; }
    if (Math.hypot(p.x - cx, p.y - cy) <= p.r) {
      F.hitResolve(p.owner, d, p.m, { x: p.x, y: p.y, proj: true }, Math.sign(p.vx) || p.owner.facing);
      if (p.keep) { p.spent = true; p.noHit = true; } else p.dead = true; if (p.kind === 'bullet') { finBurst(p.x, p.y, p.big ? 26 : 8, ['#ffffff', '#ffd34d', '#ff3a2a'], p.big ? 12 : 6, p.big ? 7 : 4); if (p.big) { finRing(p.x, p.y, '#ff3a2a', 150, 14); popText('بانق! 💥', p.x, p.y - 60, '#ff3a2a', 48); } } if (p.power) { SFX.hit(1.8); SFX.thud(); popText('قووول! 🥅', p.x, p.y - 70, '#ffd34d', 54); finRing(p.x, p.y, '#ffd34d', 190, 18); finRing(p.x, p.y, '#ffffff', 110, 12); finBurst(p.x, p.y, 30, ['#ffffff', '#ffd34d', '#ff8a2a', '#c8142a'], 13, 7); G.fight && G.fight.shake(16); } if (p.kind === 'pan') { SFX.block(); SFX.hit(1.6); popText('طاخ! 🍳', p.x, p.y - 60, '#ffd34d', 46); finBurst(p.x, p.y, 16, ['#ffffff', '#ffd34d', '#9aa3b5'], 10, 5); G.fight && G.fight.shake(12); } if (p.kind === 'mouse') { SFX.zap(); popText('كليك! 🖱️', p.x, p.y - 50, '#3cf2ff', 40); finBurst(p.x, p.y, 10, ['#ffffff', '#3cf2ff'], 8, 4); } if (p.kind === 'rock') crumble(p); if (p.kind === 'egg') eggSplat(p); if (p.kind === 'chicken') featherPuff(p.x, p.y, 14); if (p.kind === 'bike') bikeCrash(p);
    }
  }
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const a = P[i], b = P[j]; if (a.dead || b.dead || a.noHit || b.noHit || a.owner === b.owner) continue;
    if ((a.big || b.big) && !(a.big && b.big)) { const sm = a.big ? b : a; if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r) { sm.dead = true; spark(sm.x, sm.y, 'block', 0); SFX.block(); } continue; }
    if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r) { a.dead = b.dead = true; spark((a.x + b.x) / 2, (a.y + b.y) / 2, 'block', 0); SFX.block(); for (const q of [a, b]) { if (q.kind === 'rock') crumble(q); if (q.kind === 'egg') eggSplat(q); if (q.kind === 'chicken') featherPuff(q.x, q.y, 10); if (q.kind === 'bike') bikeCrash(q); } }
  }
  F.proj = P.filter(p => !p.dead);
}
function rrect(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function drawCard(x, y, rot, flip, suit, sc = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(flip * sc, sc);
  ctx.fillStyle = '#fbfbf7'; ctx.strokeStyle = '#b0101e'; ctx.lineWidth = 2.2; rrect(-14, -20, 28, 40, 4); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(176,16,30,0.35)'; ctx.lineWidth = 1; rrect(-10, -16, 20, 32, 2); ctx.stroke();
  ctx.fillStyle = (suit === '♠' || suit === '♣') ? '#111' : suit === 'J' ? '#6a1ab0' : '#d0102a'; ctx.font = `700 20px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(suit, 0, 1);
  ctx.font = `700 9px Arial`; ctx.fillText('A', -8, -13); ctx.restore();
}
// الحارس's golden power shot: comet tail, pulsing aura, speed lines
function drawPowerBall(p) {
  const r = p.r, dir = Math.sign(p.vx) || 1, tr = p.tr || [], pulse = 1 + Math.sin(p.t * 0.6) * 0.08;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < tr.length; i++) { const k = (i + 1) / tr.length, [x, y] = tr[i]; ctx.fillStyle = `rgba(255,${120 + 90 * k | 0},40,${0.08 + 0.22 * k})`; ctx.beginPath(); ctx.arc(x, y, r * (0.45 + 0.6 * k), 0, 7); ctx.fill(); }
  const tl = r * 6.5; const g = ctx.createLinearGradient(p.x, p.y, p.x - dir * tl, p.y); g.addColorStop(0, 'rgba(255,236,150,0.9)'); g.addColorStop(0.35, 'rgba(255,150,40,0.55)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(p.x, p.y - r * 1.15); ctx.quadraticCurveTo(p.x - dir * tl * 0.5, p.y - r * 0.5, p.x - dir * tl, p.y); ctx.quadraticCurveTo(p.x - dir * tl * 0.5, p.y + r * 0.5, p.x, p.y + r * 1.15); ctx.closePath(); ctx.fill();
  const a = ctx.createRadialGradient(p.x, p.y, r * 0.6, p.x, p.y, r * 2.3 * pulse); a.addColorStop(0, 'rgba(255,240,170,0.85)'); a.addColorStop(0.5, 'rgba(255,190,50,0.35)'); a.addColorStop(1, 'rgba(255,120,0,0)');
  ctx.fillStyle = a; ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.3 * pulse, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,250,220,0.75)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const oy = (i - 2) * r * 0.5, ph = (p.t * 7 + i * 37) % 60, x0 = p.x - dir * (r * 1.3 + ph), len = r * (1.2 + (i % 2) * 0.9); ctx.beginPath(); ctx.moveTo(x0, p.y + oy); ctx.lineTo(x0 - dir * len, p.y + oy); ctx.stroke(); }
  ctx.restore();
  drawHandball(p.x, p.y, p.rot, r);
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * 1.5); ctx.strokeStyle = 'rgba(255,220,90,0.9)'; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, r + 7, i * 2.09, i * 2.09 + 1.1); ctx.stroke(); }
  ctx.restore();
}
function drawHandball(x, y, rot, r = 19) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 2, 0, 0, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d9d2c0');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.save(); ctx.clip();
  ctx.fillStyle = '#c8142a';
  for (const [a, d, rr] of [[0, 0.1, 0.45], [1.3, 0.85, 0.38], [2.9, 0.9, 0.4], [4.4, 0.8, 0.36], [5.6, 0.95, 0.3]]) { ctx.beginPath(); ctx.arc(Math.cos(a) * r * d, Math.sin(a) * r * d, r * rr, 0, 7); ctx.fill(); }
  ctx.restore(); ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.restore();
}
function drawRock(x, y, rot, r = 32) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, 3, 0, 0, r * 1.1); g.addColorStop(0, '#b3a898'); g.addColorStop(0.6, '#7a6e60'); g.addColorStop(1, '#3f362e');
  ctx.fillStyle = g; ctx.beginPath();
  ROCK_SHAPE.forEach((k, i) => { const a = i / ROCK_SHAPE.length * Math.PI * 2; const px = Math.cos(a) * r * k, py = Math.sin(a) * r * k * 0.85; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#2a231d'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.save(); ctx.clip();
  for (const [sx, sy, sr, a] of [[-0.35, 0.25, 0.32, 0.22], [0.3, 0.35, 0.25, 0.18], [0.25, -0.35, 0.2, 0.15], [-0.1, -0.45, 0.16, 0.2]]) { ctx.fillStyle = `rgba(30,24,18,${a})`; ctx.beginPath(); ctx.ellipse(sx * r, sy * r, sr * r, sr * r * 0.7, 0.4, 0, 7); ctx.fill(); }
  for (const [sx, sy, sr] of [[-0.45, -0.4, 0.12], [0.1, -0.2, 0.08], [0.5, 0.1, 0.1]]) { ctx.fillStyle = 'rgba(255,250,235,0.18)'; ctx.beginPath(); ctx.arc(sx * r, sy * r, sr * r, 0, 7); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,32,26,0.75)'; ctx.lineWidth = Math.max(1.5, r / 22); ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(-r * 0.3, -r * 0.2); ctx.lineTo(0, r * 0.1); ctx.lineTo(r * 0.35, -r * 0.05); ctx.lineTo(r * 0.55, -r * 0.3); ctx.moveTo(0, r * 0.1); ctx.lineTo(-r * 0.05, r * 0.45);
  ctx.moveTo(-r * 0.6, r * 0.05); ctx.lineTo(-r * 0.4, r * 0.15); ctx.lineTo(-r * 0.35, r * 0.4); ctx.moveTo(r * 0.15, -r * 0.55); ctx.lineTo(r * 0.05, -r * 0.35); ctx.stroke();
  ctx.restore();
}
function drawCart(x, y, dir, rot = 0, alpha = 1) {
  const L = CART_L;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(dir, 1); ctx.rotate(rot);
  // wheels
  ctx.fillStyle = '#16181d'; for (const wx of [24, L - 18]) { ctx.beginPath(); ctx.arc(wx, -13, 13, 0, 7); ctx.fill(); ctx.fillStyle = '#5b6070'; ctx.beginPath(); ctx.arc(wx, -13, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#16181d'; }
  ctx.strokeStyle = '#aeb6c2'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(10, -28); ctx.lineTo(L, -28); ctx.moveTo(24, -28); ctx.lineTo(30, -80); ctx.moveTo(L - 18, -28); ctx.lineTo(L - 22, -80); ctx.stroke();
  // basket
  ctx.beginPath(); ctx.moveTo(4, -190); ctx.lineTo(L, -185); ctx.lineTo(L - 22, -78); ctx.lineTo(30, -80); ctx.closePath();
  ctx.fillStyle = 'rgba(190,200,215,0.18)'; ctx.fill(); ctx.lineWidth = 4.5; ctx.stroke();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(190,200,215,0.6)'; ctx.lineWidth = 1.6;
  for (let gx = 10; gx < L; gx += 15) { ctx.beginPath(); ctx.moveTo(gx, -195); ctx.lineTo(gx, -70); ctx.stroke(); }
  for (let gy = -180; gy < -75; gy += 15) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(L, gy); ctx.stroke(); }
  ctx.restore();
  // handle
  ctx.strokeStyle = '#d4182c'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(4, -190); ctx.lineTo(-18, -206); ctx.stroke();
  ctx.strokeStyle = '#ff6070'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(4, -193); ctx.lineTo(-16, -208); ctx.stroke();
  ctx.restore();
}
function drawFootball(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#f7f7f2'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#141414';
  const pent = (cx, cy, s) => { ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; ctx.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); } ctx.closePath(); ctx.fill(); };
  pent(0, 0, r * 0.36); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; pent(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95, r * 0.3); }
  ctx.restore(); ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
  if (r > 24) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,120,30,0.35)'; ctx.beginPath(); ctx.arc(0, 0, r * 1.3, 0, 7); ctx.fill(); }
  ctx.restore();
}
function drawCan(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const w = r * 1.1, h = r * 1.9;
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#8a0a14'); g.addColorStop(0.4, '#ff3242'); g.addColorStop(1, '#7a0812');
  ctx.fillStyle = g; rrect(-w / 2, -h / 2, w, h, 4); ctx.fill(); ctx.fillStyle = '#d8dde4'; ctx.fillRect(-w / 2, -h / 2, w, 4); ctx.fillRect(-w / 2, h / 2 - 4, w, 4);
  ctx.fillStyle = '#fff'; ctx.fillRect(-w / 2, -3, w, 6); ctx.restore();
}
function drawApple(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r); g.addColorStop(0, '#ff7a6e'); g.addColorStop(1, '#a80c16');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(-r * 0.3, 0, r * 0.75, 0, 7); ctx.arc(r * 0.3, 0, r * 0.75, 0, 7); ctx.fill();
  ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -r * 0.6); ctx.lineTo(r * 0.1, -r * 1.05); ctx.stroke();
  ctx.fillStyle = '#3caa3c'; ctx.beginPath(); ctx.ellipse(r * 0.35, -r * 0.95, r * 0.3, r * 0.14, -0.5, 0, 7); ctx.fill(); ctx.restore();
}
function drawWave(p) {
  ctx.save(); ctx.translate(p.x, 0); ctx.scale(Math.sign(p.vx) || 1, 1); ctx.globalCompositeOperation = 'lighter';
  const a = Math.min(1, p.life / 15);
  for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(${i ? '255,200,120' : '255,255,255'},${(0.7 - i * 0.2) * a})`; ctx.lineWidth = 7 - i * 2; ctx.beginPath(); ctx.ellipse(-i * 14, -10, 26 + i * 6, 46 + i * 10, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke(); }
  ctx.restore();
}

function drawEgg(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.45, 1, 0, 0, r * 1.3); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#f3ead8'); g.addColorStop(1, '#c9b894');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.82, r * 1.05, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(120,96,60,0.6)'; ctx.lineWidth = Math.max(1, r / 10); ctx.stroke();
  if (r > 25) { ctx.strokeStyle = 'rgba(110,80,40,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.2); ctx.lineTo(-r * 0.05, 0); ctx.lineTo(-r * 0.2, r * 0.2); ctx.stroke(); }
  ctx.restore();
}
function drawChicken(x, y, dir, r, t, running) {
  const s = r / 30, flap = Math.sin(t * 0.6);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
  // legs
  ctx.strokeStyle = '#f08a12'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  const st = running ? Math.sin(t * 0.8) * 9 : 3;
  ctx.beginPath(); ctx.moveTo(-4, 14); ctx.lineTo(-4 + st, 30); ctx.moveTo(6, 14); ctx.lineTo(6 - st, 30); ctx.stroke();
  // tail
  ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.moveTo(-22, -4); ctx.lineTo(-38, -22); ctx.lineTo(-34, 2); ctx.closePath(); ctx.fill();
  // body
  const g = ctx.createRadialGradient(-4, -8, 3, 0, 0, 30); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ddd6c8');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 2, 26, 18, -0.15, 0, 7); ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(20, -16, 11, 0, 7); ctx.fill();
  ctx.fillStyle = '#e0141e'; ctx.beginPath(); ctx.arc(16, -28, 5, 0, 7); ctx.arc(22, -29, 5, 0, 7); ctx.arc(27, -26, 4, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(27, -7, 3, 5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#f5a21a'; ctx.beginPath(); ctx.moveTo(29, -18); ctx.lineTo(39, -14); ctx.lineTo(29, -11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(23, -18, 2.2, 0, 7); ctx.fill();
  // wing
  ctx.save(); ctx.translate(-4, -2); ctx.rotate(-0.4 - flap * 0.7);
  ctx.fillStyle = '#ebe5d8'; ctx.strokeStyle = 'rgba(120,110,95,0.6)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(-8, 0, 18, 9, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.restore();
}
function drawTire(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = '#141519'; ctx.lineWidth = r * 0.32; ctx.beginPath(); ctx.arc(0, 0, r * 0.84, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#2c2e35'; ctx.lineWidth = 2; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
  ctx.strokeStyle = '#b9bfc9'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.66, 0, 7); ctx.stroke();
  ctx.strokeStyle = 'rgba(210,215,225,0.85)'; ctx.lineWidth = 1.3; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.64, Math.sin(a) * r * 0.64); ctx.stroke(); }
  ctx.fillStyle = '#d41a2c'; ctx.beginPath(); ctx.arc(0, 0, r * 0.12, 0, 7); ctx.fill();
  ctx.restore();
}
function drawBike(x, y, rot, r, dir = 1) {
  const k = r / 56;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale((dir || 1) * k, k);
  const wr = 30, A = [-42, 18], B = [42, 18];
  drawTire(A[0], A[1], rot * 3, wr); drawTire(B[0], B[1], rot * 3, wr);
  ctx.strokeStyle = '#d41a2c'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const P = [-2, 18], S = [-14, -22], H = [30, -26];
  ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(P[0], P[1]); ctx.lineTo(S[0], S[1]); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(H[0] - 4, H[1] + 8); ctx.lineTo(S[0], S[1]); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(H[0] - 4, H[1] + 8); ctx.lineTo(B[0], B[1]); ctx.stroke();
  ctx.strokeStyle = '#e8e8ee'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(H[0] - 4, H[1] + 8); ctx.lineTo(H[0], H[1]); ctx.lineTo(H[0] + 12, H[1] - 4); ctx.stroke();
  ctx.fillStyle = '#16171c'; rrect(S[0] - 14, S[1] - 7, 24, 7, 3); ctx.fill();
  ctx.strokeStyle = '#9aa0ab'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(P[0], P[1], 7, 0, 7); ctx.stroke();
  ctx.restore();
}

function drawPen(x, y, ang, r, col) {
  const L = r * 4.2, w = r * 0.62;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = col || '#1f4fd8'; rrect(-L / 2, -w / 2, L * 0.78, w, w / 2); ctx.fill();
  ctx.fillStyle = '#e9e4d8'; ctx.beginPath(); ctx.moveTo(L * 0.28, -w / 2); ctx.lineTo(L / 2, 0); ctx.lineTo(L * 0.28, w / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(L / 2 - 1, 0, 1.8, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(-L / 2 + 3, -w / 2 + 1, L * 0.6, w * 0.25);
  ctx.fillStyle = col || '#1f4fd8'; ctx.fillRect(-L / 2 + 4, -w / 2 - 2, L * 0.3, 2); ctx.restore();
}
function drawBook(x, y, rot, r, col, t, heavy) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const W = r * 1.6, H = r * 2.1;
  if (heavy) {
    ctx.fillStyle = '#6a3a1c'; rrect(-W / 2, -H / 2, W, H, 4); ctx.fill(); ctx.fillStyle = '#efe6d0'; ctx.fillRect(-W / 2 + W - 10, -H / 2 + 4, 6, H - 8);
    ctx.strokeStyle = '#d8b25a'; ctx.lineWidth = 2; rrect(-W / 2 + 6, -H / 2 + 6, W - 20, H - 12, 3); ctx.stroke();
    ctx.fillStyle = '#d8b25a'; ctx.font = `900 ${Math.round(r * 0.5)}px ${FA}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('كتاب', -4, 0);
  } else {
    const open = 0.35 + 0.35 * Math.abs(Math.sin(t * 0.35));
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.scale(sd, 1); ctx.transform(1, 0, -0.2 * open, 1, 0, 0);
      ctx.fillStyle = col || '#2a7ad8'; ctx.fillRect(0, -H / 2, W / 2 * (1 - open * 0.3), H);
      ctx.fillStyle = '#fbfaf4'; ctx.fillRect(2, -H / 2 + 3, W / 2 * (1 - open * 0.3) - 4, H - 6);
      ctx.strokeStyle = 'rgba(80,120,200,0.55)'; ctx.lineWidth = 1; for (let k = -H / 2 + 9; k < H / 2 - 4; k += 6) { ctx.beginPath(); ctx.moveTo(4, k); ctx.lineTo(W / 2 * (1 - open * 0.3) - 4, k); ctx.stroke(); }
      ctx.restore();
    }
    ctx.fillStyle = '#333'; ctx.fillRect(-1.5, -H / 2, 3, H);
  }
  ctx.restore();
}
function drawLaser(p) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(p.x, p.y); ctx.scale(Math.sign(p.vx) || 1, 1);
  const L = p.r * 3.2;
  const g = ctx.createLinearGradient(-L, 0, p.r, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, p.col);
  ctx.fillStyle = g; rrect(-L, -p.r * 0.5, L + p.r, p.r, p.r * 0.5); ctx.fill();
  ctx.fillStyle = '#ffffff'; rrect(-L * 0.5, -p.r * 0.22, L * 0.5 + p.r * 0.8, p.r * 0.44, p.r * 0.22); ctx.fill();
  ctx.restore();
}
function drawGrenade(x, y, rot, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#3d4a2c'; ctx.beginPath(); ctx.ellipse(0, 2, r * 0.85, r, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5; for (const k of [-0.4, 0, 0.4]) { ctx.beginPath(); ctx.moveTo(-r * 0.8, k * r + 2); ctx.lineTo(r * 0.8, k * r + 2); ctx.stroke(); }
  ctx.fillStyle = '#9aa0ab'; ctx.fillRect(-r * 0.3, -r - 6, r * 0.6, 8); ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r * 0.45, -r - 2, 5, 0, 7); ctx.stroke();
  ctx.restore();
}
function drawBoom(p) {
  const u = 1 - p.life / 10; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.r * (0.6 + u)); g.addColorStop(0, 'rgba(255,250,200,0.95)'); g.addColorStop(0.4, 'rgba(255,150,40,0.8)'); g.addColorStop(1, 'rgba(255,40,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.6 + u), 0, 7); ctx.fill(); ctx.restore();
}
// futuristic game blaster (original design)
function drawBlaster(f) {
  const w = f.toWorld(f.J.fH), dir = f.facing;
  ctx.save(); ctx.translate(w[0], w[1]); ctx.scale(dir, 1); ctx.rotate(-0.03);
  ctx.fillStyle = '#1c1f2a'; rrect(-26, -24, 92, 22, 6); ctx.fill();
  ctx.fillStyle = '#7a3cff'; rrect(-18, -30, 60, 8, 3); ctx.fill();
  ctx.fillStyle = '#e01b30'; rrect(40, -22, 30, 14, 4); ctx.fill();
  ctx.fillStyle = '#3cf2ff'; ctx.fillRect(-14, -18, 46, 5); ctx.fillStyle = '#ffd34d'; ctx.fillRect(-26, -20, 8, 14);
  ctx.fillStyle = '#2a2e3c'; rrect(-8, -4, 16, 26, 3); ctx.fill(); rrect(22, -4, 12, 18, 3); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(60,242,255,0.5)'; ctx.beginPath(); ctx.arc(70, -15, 6, 0, 7); ctx.fill();
  ctx.restore();
}
function drawRuler(f) {
  const a = f.toWorld(f.J.fH), e = f.toWorld(f.J.farm[1][1] || f.J.fH), ang = Math.atan2(a[1] - e[1], a[0] - e[0]);
  ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(ang);
  ctx.fillStyle = '#f2c94c'; ctx.fillRect(-6, -7, 110, 14); ctx.strokeStyle = 'rgba(60,40,0,0.7)'; ctx.lineWidth = 1;
  for (let k = 0; k < 104; k += 8) { ctx.beginPath(); ctx.moveTo(k - 4, -7); ctx.lineTo(k - 4, k % 24 === 0 ? 1 : -2); ctx.stroke(); }
  ctx.restore();
}
function drawProj(p) {
  if (p.draw) { p.draw(p); return; }
  if (p.kind === 'card') drawCard(p.x, p.y, p.rot * 0.3, Math.cos(p.t * 0.7), p.suit, p.sc || 1);
  else if (p.kind === 'rock') drawRock(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'cartire') drawCarTire(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'tomato') drawTomato(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'fish') drawGrouper(p.x, p.y, p.rot, p.r * 4);
  else if (p.kind === 'lure') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = ['#ff3b30', '#ffd34d', '#2fd67a'][Math.abs(Math.round(p.x)) % 3]; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.45, 0, 0, 7); ctx.fill(); ctx.restore(); drawHook(p.x + 6, p.y + 10); }
  else if (p.kind === 'net') drawNet(p.x, p.y, p.r * Math.min(1.6, 0.6 + p.t / 18));
  else if (p.kind === 'shark') drawShark(p.x, p.y, (p.dir > 0 ? -1.2 : Math.PI + 1.2) + p.t * 0.04 * (p.dir || 1), 0.75);
  else if (p.kind === 'hook') { const o = p.owner, w = o && o.J ? o.toWorld(o.J.fH) : [p.x, p.y]; ctx.save(); ctx.strokeStyle = 'rgba(240,240,240,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w[0], w[1] - 40); ctx.quadraticCurveTo((w[0] + p.x) / 2, Math.max(w[1], p.y) + 30, p.x, p.y); ctx.stroke(); ctx.restore(); drawHook(p.x, p.y); }
  else if (p.kind === 'dog') drawDog(p.x, p.y + p.r, p.dir || Math.sign(p.vx) || 1, p.t, 1, p.sub || 'golden', p.t > 10);
  else if (p.kind === 'cat') drawCat(p.x, p.y + 26, p.dir || Math.sign(p.vx) || 1, p.t, 1, true);
  else if (p.kind === 'parrot' || p.kind === 'falcon') drawBirdA(p.x, p.y, p.dir || Math.sign(p.vx) || 1, p.t, 1.15, p.kind, p.kind === 'falcon' && p.vy > 2 ? 0.7 : 0);
  else if (p.kind === 'cage') drawCage(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'bark') { ctx.save(); ctx.strokeStyle = 'rgba(255,230,160,' + Math.min(1, p.life / 12) + ')'; ctx.lineWidth = 5; const d = Math.sign(p.vx) || 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(p.x - d * i * 20, p.y, p.r * (0.5 + i * 0.25), d > 0 ? -0.9 : Math.PI - 0.9, d > 0 ? 0.9 : Math.PI + 0.9); ctx.stroke(); } ctx.restore(); }
  else if (p.kind === 'keyboard') drawKeyboard(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'laptop') drawLaptop(p.x, p.y + p.r * 0.5, p.rot, p.r);
  else if (p.kind === 'bug') drawBug(p);
  else if (p.kind === 'code') drawCodeGlyph(p);
  else if (p.kind === 'plate') drawPlate(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'pot') drawPot(p.x, p.y + p.r * 0.5, p.r * 0.8, 1);
  else if (p.kind === 'flame') drawFlame(p);
  else if (p.kind === 'spice') { ctx.save(); ctx.globalAlpha *= Math.min(1, p.life / 12); for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 3 ? 'rgba(200,60,20,0.55)' : 'rgba(240,170,40,0.6)'; ctx.beginPath(); ctx.arc(p.x + Math.cos(i * 2.1 + p.t * 0.3) * p.r * 0.6, p.y + Math.sin(i * 1.7 + p.t * 0.25) * p.r * 0.5, p.r * (0.3 + 0.03 * (i % 4)), 0, 7); ctx.fill(); } ctx.restore(); }
  else if (p.kind === 'door') drawDoor(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'bullet') drawBullet(p);
  else if (p.kind === 'mflash') drawMuzzleFlash(p.x, p.y, p.r, p.dir, p.life / 4);
  else if (p.kind === 'hball' && p.power) drawPowerBall(p);
  else if (p.kind === 'hball') { if (p.fire) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.r * 2); g.addColorStop(0, 'rgba(255,170,60,0.8)'); g.addColorStop(1, 'rgba(255,60,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2, 0, 7); ctx.fill(); ctx.restore(); } drawHandball(p.x, p.y, p.rot, p.r); }
  else if (p.kind === 'joker') drawCard(p.x, p.y, p.rot * 0.2, Math.cos(p.t * 0.3), 'J', 2.6);
  else if (p.kind === 'football') drawFootball(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'can') drawCan(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'apple') drawApple(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'cartproj') drawCart(p.x - p.dir * 90, p.y + 100, p.dir, p.rot * p.dir);
  else if (p.kind === 'wave') drawWave(p);
  else if (p.kind === 'cartwreck') drawCart(p.x, p.y, p.dir, p.rot * p.dir, Math.min(1, p.life / 25));
  else if (p.kind === 'cartgone') drawCart(p.x, p.y, p.dir, 0, Math.min(1, p.life / 20));
  else if (p.kind === 'egg') drawEgg(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'pan') drawPan(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'seawave') drawSeaWave(p);
  else if (p.kind === 'redball') drawRedBall(p);
  else if (p.kind === 'goldbar') drawGoldBar(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'cash') drawCash(p);
  else if (p.kind === 'cashbag') drawCashBag(p);
  else if (p.kind === 'feather') drawFeather(p);
  else if (p.kind === 'tornado') drawTornado(p);
  else if (p.kind === 'meteor') drawMeteor(p);
  else if (p.kind === 'shock') drawShock(p);
  else if (p.kind === 'mouse') drawMouse(p.x, p.y, p.rot, p.r, p.vx, p.t);
  else if (p.kind === 'pen') drawPen(p.x, p.y, Math.atan2(p.vy, p.vx), p.r, p.col);
  else if (p.kind === 'book') drawBook(p.x, p.y, p.rot, p.r, p.col, p.t, p.heavy);
  else if (p.kind === 'laser') drawLaser(p);
  else if (p.kind === 'grenade') drawGrenade(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'boom') drawBoom(p);
  else if (p.kind === 'chicken') drawChicken(p.x, p.y, Math.sign(p.vx) || p.dir, p.r, p.t, !!p.ground);
  else if (p.kind === 'tire') drawTire(p.x, p.y, p.rot, p.r);
  else if (p.kind === 'bike') drawBike(p.x, p.y, p.rot, p.r, p.dir);
  else if (p.kind === 'bikewreck') { ctx.save(); ctx.globalAlpha *= Math.min(1, p.life / 20); drawBike(p.x, p.y, p.rot, p.r, p.dir); ctx.restore(); }
}
function drawHeld(f) {
  const m = f.mv; if (f.state !== 'attack' || !m) return;
  if (m.gun && f.mt >= 3 && f.mt < m.total - 4) drawBlaster(f);
  if (m.ruler && f.mt < m.total - 4) drawRuler(f);
  if (m.eat) drawEatProps(f);
  if (m.id === 'sk_cards' && f.mt < m.spawnAt) { const w = f.toWorld(f.J.fH); for (let i = 0; i < 3; i++) drawCard(w[0] + f.facing * (i - 1) * 6, w[1] - 8, f.facing * (i - 1) * 0.35, 1, '♠♥♦'[i], 0.8); }
  if (m.id === 'sk2_tire' && f.mt < m.spawnAt) { const w = f.toWorld(f.J.fH); drawCarTire(w[0], w[1] - 10, 0, 34); }
  if (m.zap && f.mt >= m.st && f.mt < m.st + m.ac) { const w = f.toWorld(f.J.fH); drawBolt(w[0], w[1], w[0] + f.facing * 640, w[1] + Math.sin(f.mt) * 6, 7, f.mt); drawBolt(w[0], w[1], w[0] + f.facing * 600, w[1] + Math.cos(f.mt * 1.3) * 14, 3, f.mt + 9); }
  if (m.fish && f.mt < m.st + m.ac + 10) { const w = f.toWorld(f.J.fH), u = Math.min(1, f.mt / m.st); drawGrouper(w[0] + f.facing * 50, w[1] - 10, f.facing > 0 ? lerp(-1.4, 0.1, u) : Math.PI - lerp(-1.4, 0.1, u), 150); }
  if (m.pan && f.mt < (m.spawnAt || m.st + m.ac + 6)) { const w = f.toWorld(f.J.fH); drawPan(w[0], w[1] - 10, -f.facing * (1.2 - Math.min(1, f.mt / (m.st || 10)) * 1.6), 32); }
  if (m.id === 'sk2_pan' && f.mt < m.spawnAt) { const w = f.toWorld(f.J.fH); drawPan(w[0], w[1] - 10, -f.facing * 1.2, 30); }
  if (m.id === 'sk2_mouse' && f.mt < m.spawnAt) { const w = f.toWorld(f.J.fH); drawMouse(w[0], w[1] - 6, 0, 20, -f.facing, f.mt); }
  if (m.id === 'sk2_snipe' && f.mt < m.spawnAt && G.fight) { const o = G.fight.f[1 - f.slot], u = f.mt / m.spawnAt, mz = gunMuzzle(f), ty = (o.hurt.y0 + o.hipY) / 2; ctx.save(); ctx.strokeStyle = `rgba(255,30,40,${0.3 + 0.5 * u})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mz[0], mz[1]); ctx.lineTo(o.x, ty); ctx.stroke(); ctx.restore(); finReticle(o.x, ty, lerp(120, 40, u), 0.5 + 0.5 * u); }
  if (m.id === 'sk_chain') drawChain(f);
  if (m.id === 'sk_hball' && f.mt < m.spawnAt) { const w = f.toWorld(f.J.fH), x = w[0] + f.facing * 6, y = w[1] - 6, k = f.mt / m.spawnAt, rr = 19 + 8 * k; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 4, x, y, rr * (1.6 + k)); g.addColorStop(0, `rgba(255,236,150,${0.3 + 0.6 * k})`); g.addColorStop(1, 'rgba(255,140,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr * (1.6 + k), 0, 7); ctx.fill(); ctx.restore(); drawHandball(x, y, f.mt * 0.4 * f.facing, rr); }
  if (m.id === 'sk_rock' && f.mt >= 12 && f.mt < m.spawnAt) { const [x, y] = handsMid(f); const lift = f.mt < 18 ? 0 : 1; drawRock(x, y - (lift ? ROCK_R * 0.85 : ROCK_R * 0.5), f.mt * 0.02, ROCK_R); }
  if (m.cart && f.mt >= 2 && !f.cartGone && f.mt < m.st + m.ac) { const [hx] = cartHandle(f); const a = Math.min(1, (f.mt - 1) / 4); drawCart(hx, 0, f.facing, 0, a); }
}
function drawRollBall(f) {
  const Rr = 80, b = Math.abs(Math.sin(f.mt * ((f.mv && f.mv.bAmp) ? 0.16 : 0.35))) * ((f.mv && f.mv.bAmp) || 12), cx = f.x, cy = f.y - Rr - b;
  const P = f.R.P.torso;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(f.rollAng * f.facing);
  ctx.beginPath(); ctx.arc(0, 0, Rr, 0, 7); ctx.fillStyle = '#3c4630'; ctx.fill(); ctx.save(); ctx.clip();
  const sc = (Rr * 2.5) / P.img.height; ctx.scale(f.facing, 1);
  ctx.drawImage(P.img, -P.img.width * sc / 2, -P.img.height * sc / 2 - Rr * 0.1, P.img.width * sc, P.img.height * sc);
  ctx.restore();
  const g = ctx.createRadialGradient(-Rr * 0.4, -Rr * 0.45, 8, 0, 0, Rr); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.rotate(-f.rollAng * f.facing); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, Rr, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  // speed lines
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) { const yy = cy - 40 + i * 26; ctx.beginPath(); ctx.moveTo(cx - f.facing * (Rr + 10), yy); ctx.lineTo(cx - f.facing * (Rr + 50 + i * 12), yy); ctx.stroke(); }
  ctx.restore();
}

// ================= FINISHERS (القاضية — one per character) =================
// Each entry: name, line (voice), col (theme colour), run(F, a, d, t) → true when finished,
// back/front(F, a, d, t) draw in world space behind/in front of the fighters.
const G2 = o => Object.assign({}, GUARD, o);
const finExt = (t, per) => { const u = (t % per) / per; return u < 0.45 ? ease(u / 0.45) : 1 - ease((u - 0.45) / 0.55); };
const finSeg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const FPZ = {
  jab: u => G2({ bua: lerp(26, 92, u), bfa: lerp(142, 2, u), lean: 8 + u * 10, dx: u * 10, th: 26, bth: -22 }),
  str: u => G2({ ua: lerp(34, 94, u), fa: lerp(128, 0, u), lean: 10 + u * 14, dx: u * 14, th: 30, bth: -26 }),
  kick: u => G2({ th: lerp(18, 108, u), sh: lerp(22, 4, u), ffl: 1 - u, lean: -14 * u, r: -8 * u, bth: 6, bsh: 0, dx: 8 * u }),
  upper: u => u < 0.4 ? Object.assign({}, CROUCH, { ua: 0, fa: 60, lean: 30 }) : G2({ ua: 170, fa: 15, lean: -10, th: 10, sh: 8, bth: -8, bsh: 4, dx: 12 }),
  armsUp: G2({ ua: 176, fa: 10, bua: 174, bfa: 12, lean: -8, th: 20, sh: 20, bth: -16, bsh: 14 }),
  slam: G2({ ua: 70, fa: 10, bua: 66, bfa: 14, lean: 34, dx: 20, th: 46, sh: 40, bth: -30, bsh: 20 }),
  point: G2({ ua: 168, fa: 0, lean: -4 }),
  aim: G2({ ua: 90, fa: 2, bua: 84, bfa: 40, lean: 6, th: 26, bth: -22 }),
  hurt: o => Object.assign({}, HITHI, o || {}),
};
function finChest(d) { return [d.x, (d.hurt.y0 + d.hipY) / 2]; }
function finHead(d) { return [d.x, d.hurt.y0 + 34]; }
function finHold(d, x, y = 0) { if (d.state === 'rageVic') { d.x = clamp(x, -STAGE, STAGE); d.y = y; } }
function finHit(F, a, d, dmg, xy, fr = 2, final = false) {
  if (!F.fin) return; if (final) F.fin.final = true;
  F.applyDamage(a, d, dmg, 'rage', null, true, { x: xy[0], y: xy[1] }); F.freeze = fr;
}
function finLaunch(d, vx, vy) { d.finP = null; if (d.ko || d.state === 'rageVic') { if (!d.ko) d.setState('juggle'); d.vx = vx; d.vy = vy; d.juggle = d.ko ? 9 : 4; d.mv = null; } }
function finRing(x, y, c, r1 = 160, life = 18) { FX.push({ t: 'ring', x, y, life, max: life, c, r0: 10, r1 }); }
function finBurst(x, y, n, cols, sp = 9, sz = 6) { for (let i = 0; i < n; i++) { const an = rnd(0, Math.PI * 2), s = rnd(2, sp); FX.push({ t: 'p', x, y, vx: Math.cos(an) * s, vy: Math.sin(an) * s - 2, life: rnd(18, 34), max: 34, c: cols[i % cols.length], sz: rnd(2, sz) }); } }
function finCam(F, x, y, z) { if (F.fin) F.fin.cam = { x, y, z }; }
// throw a visible prop (card, egg, chicken, pen…) that reaches the target after T frames — the hit lands on arrival
function finThrow(F, a, d, o) {
  const g = o.g === undefined ? 0.5 : o.g, T = o.T, [x, y] = o.from, [tx, ty] = o.to;
  const p = Object.assign({ kind: o.kind, noHit: true, owner: a, x, y, vx: (tx - x) / T, vy: (ty - y - g * T * (T - 1) / 2) / T, g, r: o.r, vr: o.vr || 0, life: T + 2, dir: Math.sign(tx - x) || a.facing }, o.extra || {});
  spawnProj(p); (F.fin.q = F.fin.q || []).push({ at: F.fin.t + T, p, dmg: o.dmg, fx: o.fx, fr: o.fr || 2 }); return p;
}
function finQueue(F, a, d) {
  const q = F.fin && F.fin.q; if (!q) return;
  for (let i = 0; i < q.length; i++) { const e = q[i]; if (F.fin.t < e.at) continue; q.splice(i--, 1); e.p.dead = true; const xy = [e.p.x, e.p.y]; if (e.dmg) finHit(F, a, d, e.dmg, xy, e.fr); if (e.fx) e.fx(xy); if (!F.fin) return; }
}
function finEnd(a, d) { a.finCar = null; a.finHeld = null; a.finProp = null; a.finBall = false; a.finTrail = false; a.finProp = null; if (d) d.finP = null; }
// glowing ball (handball / energy)
function finOrb(x, y, r, c1, c2, rot = 0) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) { const an = rot * 1.7 + i * 0.628, fl = 1 + 0.35 * Math.sin(rot * 9 + i * 2.1); ctx.fillStyle = i % 2 ? 'rgba(255,90,20,0.35)' : 'rgba(255,210,80,0.35)'; ctx.beginPath(); ctx.ellipse(x + Math.cos(an) * r * 0.55, y + Math.sin(an) * r * 0.55 - r * 0.2, r * 0.55 * fl, r * 0.9 * fl, an, 0, 7); ctx.fill(); }
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.2); g.addColorStop(0, c1); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = r / 19; ctx.scale(s, s); drawHandball(0, 0, 0); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.55; ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(x, y, r * 1.02, 0, 7); ctx.fill(); ctx.restore();
}
function finCracks(x, n, len, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#1a0b06'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const dir = i % 2 ? 1 : -1, L = len * (0.6 + 0.4 * ((i * 37) % 10) / 10); ctx.beginPath(); ctx.moveTo(x, 2); ctx.lineTo(x + dir * L * 0.4, 2 + ((i * 13) % 9) - 4); ctx.lineTo(x + dir * L, 2 + ((i * 29) % 11) - 5); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,120,40,0.7)'; ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) { const dir = i % 2 ? 1 : -1, L = len * (0.6 + 0.4 * ((i * 37) % 10) / 10); ctx.beginPath(); ctx.moveTo(x, 2); ctx.lineTo(x + dir * L * 0.4, 2 + ((i * 13) % 9) - 4); ctx.lineTo(x + dir * L, 2 + ((i * 29) % 11) - 5); ctx.stroke(); }
  ctx.restore();
}
function finComet(x, y, dx, dy, len, w, c1, c2) {
  const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [cw, cl, c] of [[w, len, c1], [w * 0.5, len * 0.75, c2]]) {
    const g = ctx.createLinearGradient(x, y, x - ux * cl, y - uy * cl); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + px * cw, y + py * cw); ctx.quadraticCurveTo(x - ux * cl * 0.4 + px * cw * 0.8, y - uy * cl * 0.4 + py * cw * 0.8, x - ux * cl, y - uy * cl);
    ctx.quadraticCurveTo(x - ux * cl * 0.4 - px * cw * 0.8, y - uy * cl * 0.4 - py * cw * 0.8, x - px * cw, y - py * cw); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function finGoal(gx, dir, bulge, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round';
  const H = 270, top = 70, back = 170, b = bulge * 60;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
  for (let i = 1; i < 9; i++) { const u = i / 9; ctx.beginPath(); ctx.moveTo(gx + dir * top * u, -H); ctx.quadraticCurveTo(gx + dir * (top * u + (back - top) * u * 0.5 + b), -H * (1 - u) * 0.5 - H * 0.25, gx + dir * back * u + dir * b * 0.4, 0); ctx.stroke(); }
  for (let j = 1; j < 7; j++) { const v = j / 7; ctx.beginPath(); ctx.moveTo(gx, -H * (1 - v)); ctx.quadraticCurveTo(gx + dir * (top + (back - top) * v) * 0.6 + dir * b, -H * (1 - v), gx + dir * (top + (back - top) * v) + dir * b * 0.6, -H * (1 - v)); ctx.stroke(); }
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, -H); ctx.lineTo(gx + dir * top, -H); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.moveTo(gx + dir * top, -H); ctx.lineTo(gx + dir * back + dir * b * 0.4, 0); ctx.stroke();
  ctx.restore();
}
function finGoldEgg(x, y, r) {
  ctx.save(); ctx.translate(x, y);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2); gl.addColorStop(0, 'rgba(255,220,90,0.6)'); gl.addColorStop(1, 'rgba(255,200,0,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, r * 2, 0, 7); ctx.fill(); ctx.restore();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.5, r * 0.1, 0, 0, r * 1.2); g.addColorStop(0, '#fff6c8'); g.addColorStop(0.45, '#ffd34d'); g.addColorStop(1, '#b07a00');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.78, r, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#7a5200'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}
function finBeam(x, a, w, c1, c2) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a;
  const g = ctx.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.3, c2); g.addColorStop(0.5, c1); g.addColorStop(0.7, c2); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - w, -1600, w * 2, 1610);
  ctx.fillStyle = '#ffffff'; ctx.globalAlpha *= 0.8; ctx.fillRect(x - w * 0.12, -1600, w * 0.24, 1610);
  ctx.beginPath(); ctx.ellipse(x, 0, w * 1.6, 26, 0, 0, 7); ctx.fillStyle = c1; ctx.fill(); ctx.restore();
}
function finReticle(x, y, s, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#ff2a3a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, 7); ctx.stroke();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.beginPath(); ctx.moveTo(x + dx * s * 0.6, y + dy * s * 0.6); ctx.lineTo(x + dx * s * 1.35, y + dy * s * 1.35); ctx.stroke(); }
  ctx.restore();
}

const FIN = [
  // 0 الزعيم — punches, leap off-screen, earthquake landing
  { name: 'زلزال الزعيم', line: 'هذي النهاية!', col: '#ff4d3d',
    run(F, a, d, t) {
      const f = a.facing;
      if (t < 44) { finHold(d, a.x + f * 118); const i = (t / 11) | 0, u = finExt(t, 11); a.rageP = i % 2 ? FPZ.str(u) : FPZ.jab(u); d.finP = FPZ.hurt();
        if (t % 11 === 5) finHit(F, a, d, 5, finChest(d), 3); finCam(F, (a.x + d.x) / 2, -220, 1.35); return; }
      if (t < 62) { a.rageP = Object.assign({}, CROUCH, { lean: 30, ua: 10, fa: 90, bua: 10, bfa: 100 }); if (t % 3 === 0) FX.push({ t: 'p', x: a.x + rnd(-40, 40), y: -rnd(0, 30), vx: 0, vy: -rnd(4, 9), life: 20, max: 20, c: '#ff8a2a', sz: rnd(3, 6) }); if (t === 61) { SFX.jump(); SFX.whoosh(1); dust(a.x, 26); F.shake(10); } finCam(F, (a.x + d.x) / 2, -220, 1.2); return; }
      if (t < 92) { const u = finSeg(t, 62, 92); a.y = -1000 * easeOut(u); a.rageP = Object.assign({}, JUMP); a.x = lerp(a.x, d.x - f * 12, 0.08); d.finP = FPZ.hurt({ lean: -30, r: -4 }); finCam(F, d.x, -260, 1.05); return; }
      if (t < 112) { const u = finSeg(t, 92, 112); a.x = d.x - f * 12; a.y = -1000 * (1 - u * u); a.rageP = G2({ ua: 176, fa: 10, bua: 174, bfa: 10, th: 70, sh: 60, bth: 50, bsh: 60, lean: 16 }); if (t % 2 === 0) FX.push({ t: 'p', x: a.x + rnd(-30, 30), y: a.y - rnd(0, 200), vx: 0, vy: -3, life: 12, max: 12, c: '#ff4d3d', sz: rnd(3, 7) }); finCam(F, d.x, -230, 1.1); return; }
      if (t === 112) { a.y = 0; a.x = d.x - f * 70; a.rageP = Object.assign({}, CROUCH, { lean: 40, ua: 60, fa: 10, bua: 56, bfa: 14 });
        finHit(F, a, d, 24, finHead(d), 16, true); finLaunch(d, f * 9, -18); SFX.thud(); SFX.rock(); F.shake(38); dust(a.x, 46);
        for (let i = 0; i < 3; i++) finRing(d.x, -10, i ? '#ff8a2a' : '#ffffff', 260 + i * 120, 22 + i * 6); crumble({ x: d.x, y: -10, r: 90 }); F.fin.crack = 1; F.fin.crackX = d.x; return; }
      if (t < 150) { a.rageP = Object.assign({}, CROUCH, { lean: 30, ua: 60, fa: 10 }); finCam(F, d.x, -200, 1.15); return; }
      return true;
    },
    front(F, a, d, t) {
      if (t >= 40 && t < 66) { const u = finSeg(t, 40, 62), cx = a.x, cy = a.hipY - 60; ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 260 * u + 40); g.addColorStop(0, 'rgba(255,170,60,0.55)'); g.addColorStop(1, 'rgba(255,40,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 260 * u + 40, 0, 7); ctx.fill(); ctx.restore();
        for (let i = 0; i < 6; i++) finComet(cx + (i - 2.5) * 34, cy + 120, 0, 1, 160 + 60 * Math.sin(t * 0.7 + i), 26, 'rgba(255,120,30,0.7)', 'rgba(255,230,120,0.7)'); }
      if (t >= 62 && t < 92) finComet(a.x, a.hipY + 60, 0, -1, 420, 60, 'rgba(255,110,30,0.6)', 'rgba(255,230,140,0.6)');
      if (t >= 92 && t < 113) finComet(a.x, a.hipY + 100, 0, 1, 900, 110, 'rgba(255,90,20,0.85)', 'rgba(255,240,170,0.9)');
    },
    back(F, a, d, t) { if (t >= 62 && t < 112) { const u = finSeg(t, 62, 112); ctx.save(); ctx.strokeStyle = `rgba(255,40,40,${0.4 + 0.5 * u})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(d.x, 2, 140 - 60 * u, 18 - 6 * u, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      if (F.fin.crack) finCracks(F.fin.crackX, 8, 380, 1); },
  },
  // 1 الوحش — fists swell, giant barrage, mountain punch
  { name: 'قبضة الجبل', line: 'بكسّرك تكسير!', col: '#ff2a55',
    run(F, a, d, t) {
      const f = a.facing; if (t < 104) finHold(d, a.x + f * 150);
      if (t < 22) { const u = finSeg(t, 0, 22); a.rageP = G2({ ua: 60, fa: 140, bua: 56, bfa: 140, lean: -6, fsc: 1 + 1.6 * ease(u) }); if (t === 4) SFX.rage(); if (t % 2 === 0) finBurst(...a.toWorld(a.J.fH), 2, ['#ff2a55', '#ffd34d'], 4, 4); finCam(F, (a.x + d.x) / 2, -230, 1.3); return; }
      if (t < 82) { const k = t - 22, i = (k / 6) | 0, u = finExt(k, 6), L = i % 2 === 0;
        a.rageP = G2(Object.assign(L ? { bua: lerp(26, 92, u), bfa: lerp(142, 0, u) } : { ua: lerp(34, 94, u), fa: lerp(128, 0, u) }, { lean: 12 + u * 10, dx: u * 10, th: 30, bth: -24, fsc: 2.6 }));
        d.finP = FPZ.hurt({ lean: -26 + Math.sin(t) * 8 });
        if (k % 6 === 3) { const w = a.toWorld(L ? a.J.bH : a.J.fH); finHit(F, a, d, 3.2, w, 1); finRing(w[0], w[1], '#ff2a55', 90, 10); }
        finCam(F, (a.x + d.x) / 2 + Math.sin(t * 0.9) * 6, -230, 1.32); return; }
      if (t < 102) { const u = finSeg(t, 82, 102); a.rageP = G2({ ua: 20, fa: 120, bua: 40, bfa: 120, lean: -22, dx: -10, fsc: 2.6 + 0.8 * u, th: 10, bth: -10 }); if (t % 2 === 0) finBurst(...a.toWorld(a.J.fH), 3, ['#ff2a55', '#ffffff'], 5, 5); finCam(F, (a.x + d.x) / 2, -230, 1.45); return; }
      if (t === 102) { a.rageP = G2({ ua: 94, fa: 0, lean: 32, dx: 34, th: 46, bth: -40, bsh: 10, fsc: 3.4 }); return; }
      if (t === 104) { const w = finChest(d); finHit(F, a, d, 24, w, 16, true); finLaunch(d, f * 19, -13); F.shake(34); SFX.thud(); for (let i = 0; i < 4; i++) finRing(w[0], w[1], i % 2 ? '#ff2a55' : '#ffffff', 200 + i * 110, 16 + i * 5); finBurst(w[0], w[1], 40, ['#ff2a55', '#ffd34d', '#ffffff'], 14, 7); return; }
      if (t < 140) { a.rageP = G2({ ua: 94, fa: 0, lean: 26, dx: 26, th: 40, bth: -34, fsc: lerp(3.4, 1, finSeg(t, 110, 140)) }); finCam(F, lerp(a.x, d.x, 0.6), -220, 1.05); return; }
      return true;
    } },
  // 2 الكابتن — lightning blitz from both sides, golden volley goal
  { name: 'الهدف الذهبي', line: 'قوووول!', col: '#7fd6ff',
    run(F, a, d, t) {
      const F0 = F.fin; if (F0.f0 === undefined) { F0.f0 = a.facing; F0.dx0 = d.x; } const f = F0.f0; finHold(d, F0.dx0);
      if (t < 66) { const i = (t / 11) | 0, side = i % 2 ? -1 : 1, k = t % 11;
        if (k === 0) { F0.px = a.x; a.x = clamp(d.x - f * side * 125, -STAGE, STAGE); a.facing = f * side; SFX.whoosh(1); SFX.zap(); a.finTrail = true; finBurst(a.x, -200, 8, ['#ffffff', '#7fd6ff'], 6, 4); }
        a.rageP = k < 5 ? FPZ.kick(ease(k / 5)) : FPZ.str(1 - (k - 5) / 6); d.finP = FPZ.hurt({ lean: side * 18 });
        if (k === 4) finHit(F, a, d, 4, finChest(d), 2); finCam(F, d.x, -220, 1.3); return; }
      if (t === 66) { a.facing = f; a.x = clamp(d.x - f * 230, -STAGE, STAGE); a.finTrail = false; a.finProp = { k: 'ball', x: a.x + f * 70, y: -26 }; F0.gx = clamp(F0.dx0 + f * 300, -STAGE + 30, STAGE - 30); SFX.whoosh(0); popText('⚽', F0.gx, -330, '#ffffff', 40); }
      if (t < 86) { const u = finSeg(t, 66, 86); a.rageP = G2({ th: lerp(18, -30, u), sh: lerp(22, 70, u), bth: 10, lean: -6 * u, ua: 60, fa: 60 }); d.finP = FPZ.hurt({ lean: -20 }); finCam(F, (a.x + d.x) / 2, -200, 1.2); return; }
      if (t < 92) { const u = finSeg(t, 86, 92); a.rageP = G2({ th: lerp(-30, 112, ease(u)), sh: 4, ffl: 0, lean: -16, r: -8, bth: 6, bsh: 0, ua: 80, fa: 40 }); if (t === 88) { SFX.kick(1.8); F.shake(10); } const P = a.finProp; if (t >= 88) { const v = finSeg(t, 88, 92), c = finChest(d); P.x = lerp(a.x + f * 70, c[0], v); P.y = lerp(-22, c[1], v); P.rot = (P.rot || 0) + 0.8; } return; }
      if (t === 92) { const c = finChest(d); finHit(F, a, d, 24, c, 18, true); finLaunch(d, f * 20, -11); a.finProp = null; F.shake(30); SFX.thud();
        finBurst(c[0], c[1], 60, ['#ffd34d', '#ffffff', '#7fd6ff', '#ff3b4a'], 15, 7); finRing(c[0], c[1], '#ffd34d', 360, 26); popText('قوووول!', c[0], c[1] - 120, '#ffd34d', 96); return; }
      if (t < 140) { a.rageP = G2({ ua: 170, fa: 20, bua: 160, bfa: 30, lean: -6 }); if (F0.gx !== undefined && (d.x - F0.gx) * f > 70 && d.state === 'juggle') { d.vx = f * 0.6; F0.net = Math.min(1, (F0.net || 0) + 0.25); if (!F0.netHit) { F0.netHit = 1; SFX.thud(); finBurst(d.x, -150, 30, ['#ffffff', '#ffd34d'], 10, 6); } } else if (F0.net) F0.net *= 0.93; finCam(F, lerp(a.x, F0.gx === undefined ? d.x : F0.gx, 0.5), -220, 0.98); return; }
      return true;
    },
    back(F, a, d, t) { const F0 = F.fin; if (t >= 66 && F0.gx !== undefined) finGoal(F0.gx, F0.f0, F0.net || 0, Math.min(1, (t - 66) / 8));
      if (t < 66 && F0.px !== undefined && t % 11 < 5) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(170,235,255,0.95)'; ctx.lineWidth = 5; ctx.beginPath(); const y0 = -230; ctx.moveTo(F0.px, y0); for (let i = 1; i <= 7; i++) { const x = lerp(F0.px, a.x, i / 7), y = y0 + (i < 7 ? Math.sin(t * 3.1 + i * 2.3) * 48 : 0); ctx.lineTo(x, y); } ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.restore(); }
      if (t < 66) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(160,230,255,0.75)'; ctx.lineWidth = 6; const k = t % 11; if (k < 4) { ctx.globalAlpha = 1 - k / 4; ctx.beginPath(); ctx.moveTo(a.x - a.facing * 260, -200); ctx.lineTo(a.x, -200); ctx.moveTo(a.x - a.facing * 220, -120); ctx.lineTo(a.x, -120); ctx.moveTo(a.x - a.facing * 240, -280); ctx.lineTo(a.x, -280); ctx.stroke(); } ctx.restore(); } },
    front(F, a, d, t) { const P = a.finProp; if (P && P.k === 'ball') { if (t >= 86) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(P.x, P.y, 4, P.x, P.y, 70); g.addColorStop(0, 'rgba(255,220,90,0.8)'); g.addColorStop(1, 'rgba(255,200,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x, P.y, 70, 0, 7); ctx.fill(); ctx.restore(); } if (t >= 88) finComet(P.x, P.y, a.facing, -0.25, 380, 40, 'rgba(255,170,40,0.85)', 'rgba(255,250,200,0.9)'); drawFootball(P.x, P.y, P.rot || 0, 36); } },
  },
  // 3 الدكتور — orbiting cards slice in one by one, giant joker
  { name: 'الخدعة الكبرى', line: 'ورقتك الأخيرة!', col: '#e6c37a',
    run(F, a, d, t) {
      const f = a.facing; if (t < 104) finHold(d, a.x + f * 230, -Math.min(60, t * 1.5));
      if (t < 20) { a.rageP = FPZ.point; if (t === 2) SFX.skill(); finCam(F, (a.x + d.x) / 2, -260, 1.15); return; }
      if (t < 84) { a.rageP = G2({ ua: 120, fa: 70, lean: -2 }); d.finP = FPZ.hurt({ lean: Math.sin(t * 0.4) * 14, r: -6 });
        if (t % 8 === 0 && t <= 76) { const c = finChest(d), an = t * 0.16, R = 240, from = [c[0] + Math.cos(an) * R, c[1] + Math.sin(an) * R * 0.45];
          finThrow(F, a, d, { kind: 'card', from, to: [c[0] + rnd(-25, 25), c[1] + rnd(-70, 50)], T: 6, g: 0, r: 20, vr: 0.9, dmg: 3.5, extra: { suit: '♠♥♦♣'[(t / 8) % 4], sc: 2.1 },
            fx: xy => { finBurst(xy[0], xy[1], 14, ['#ffffff', '#d0102a', '#111111'], 9, 5); finRing(xy[0], xy[1], '#e6c37a', 90, 10); SFX.throw(); } }); }
        finCam(F, d.x - f * 60, -280, 1.2); return; }
      if (t < 104) { a.rageP = G2({ ua: 176, fa: 6, lean: -10 }); if (t === 90) SFX.skill(); finCam(F, d.x, -330, 1.05); return; }
      if (t === 104) { const c = finChest(d); finHit(F, a, d, 20, c, 16, true); finLaunch(d, f * 12, -15); F.shake(30); SFX.thud();
        for (let i = 0; i < 16; i++) spawnProj({ kind: 'card', noHit: true, owner: a, x: c[0], y: c[1], vx: rnd(-13, 13), vy: rnd(-16, -4), g: 0.5, r: 20, vr: rnd(-0.6, 0.6), life: 60, suit: '♠♥♦♣'[i % 4], sc: 1.7 });
        finBurst(c[0], c[1], 40, ['#ff3b4a', '#ffffff', '#222222', '#e6c37a'], 13, 6); finRing(c[0], c[1], '#e6c37a', 320, 24); return; }
      if (t < 145) { a.rageP = G2({ ua: 30, fa: 140, bua: 26, bfa: 140, lean: -4, r: 2 }); finCam(F, lerp(a.x, d.x, 0.5), -220, 1.05); return; }
      return true;
    },
    front(F, a, d, t) {
      if (t >= 12 && t < 104) { const c = finChest(d), conv = finSeg(t, 84, 102), left = t < 84 ? 14 - Math.floor((t - 12) / 8) : 6;
        for (let i = 0; i < Math.max(5, left); i++) { const an = t * 0.16 + i * Math.PI * 2 / 14, R = lerp(260, 0, conv), x = c[0] + Math.cos(an) * R, y = c[1] - conv * 260 + Math.sin(an) * R * 0.45;
          if (conv < 0.95) drawCard(x, y, an, Math.cos(an * 2), '♠♥♦♣'[i % 4], 1.8); } }
      if (t >= 88 && t <= 104) { const c = finChest(d), u = finSeg(t, 88, 104); drawCard(c[0], lerp(c[1] - 320, c[1], u * u), Math.sin(t * 0.3) * 0.2, 1, 'J', 5.2); }
    } },
  // 4 الحارس — fireballs straight into the body, flaming goal kick
  { name: 'ركلة المرمى النارية', line: 'ولا شي يعدّي!', col: '#ffd21f',
    run(F, a, d, t) {
      const f = a.facing; if (t < 90) finHold(d, a.x + f * 190);
      if (t < 50) { const k = t % 10, L = ((t / 10) | 0) % 2; a.rageP = Object.assign(L ? FPZ.jab(k < 4 ? k / 4 : 1 - (k - 4) / 6) : FPZ.str(k < 4 ? k / 4 : 1 - (k - 4) / 6), { fsc: 1 + Math.min(1, t / 10) * 1.1 }); d.finP = FPZ.hurt(); if (t % 2 === 0) finBurst(...a.toWorld(a.J.fH), 2, ['#ff8a2a', '#ffd34d'], 4, 5);
        if (k === 3) { const w = a.toWorld(L ? a.J.bH : a.J.fH), c = finChest(d);
          finThrow(F, a, d, { kind: 'hball', from: w, to: [c[0], c[1] + rnd(-40, 30)], T: 5, g: 0, r: 28, vr: f * 0.5, dmg: 4, extra: { fire: true }, fx: xy => { finBurst(xy[0], xy[1], 16, ['#ff8a2a', '#ffd34d', '#ff3b30'], 9, 7); finRing(xy[0], xy[1], '#ff8a2a', 100, 10); } }); SFX.throw(); }
        finCam(F, (a.x + d.x) / 2, -230, 1.25); return; }
      if (t < 78) { const u = finSeg(t, 50, 78); a.finProp = { k: 'orb', x: a.x + f * 30, y: lerp(-220, -470, ease(u)), r: lerp(26, 80, u) }; a.rageP = Object.assign({}, FPZ.armsUp, { fsc: 2.1 }); if (t % 2 === 0) finBurst(a.finProp.x, a.finProp.y, 3, ['#ff8a2a', '#ffd34d'], 4, 6); finCam(F, (a.x + d.x) / 2, -300, 1.05); return; }
      if (t < 86) { const u = finSeg(t, 78, 86), P = a.finProp; P.y = lerp(-470, -120, u * u); P.x = a.x + f * lerp(30, 70, u); a.rageP = G2({ th: lerp(-20, 120, ease(finSeg(t, 82, 86))), sh: 4, ffl: 0, lean: -16, r: -8, bth: 6, bsh: 0, ua: 60, fa: 40 }); return; }
      if (t < 90) { const u = finSeg(t, 86, 90), P = a.finProp, c = finChest(d); P.x = lerp(a.x + f * 70, c[0], u); P.y = lerp(-120, c[1], u); if (t === 86) { SFX.kick(2); F.shake(12); } return; }
      if (t === 90) { const c = finChest(d); a.finProp = null; finHit(F, a, d, 26, c, 18, true); finLaunch(d, f * 18, -14); F.shake(36); SFX.thud(); SFX.rock();
        finBurst(c[0], c[1], 70, ['#ff8a2a', '#ffd34d', '#ff3b30', '#ffffff'], 16, 9); for (let i = 0; i < 3; i++) finRing(c[0], c[1], i ? '#ff8a2a' : '#ffffff', 240 + i * 120, 20 + i * 6); return; }
      if (t < 135) { a.rageP = G2({ ua: 30, fa: -40, bua: 26, bfa: -50, lean: 4 }); finCam(F, lerp(a.x, d.x, 0.5), -220, 1.05); return; }
      return true;
    },
    front(F, a, d, t) { const P = a.finProp; if (P && P.k === 'orb') { if (t >= 86) finComet(P.x, P.y, a.facing, 0.6, 520, P.r * 1.1, 'rgba(255,110,30,0.9)', 'rgba(255,230,140,0.9)'); finOrb(P.x, P.y, P.r, 'rgba(255,140,40,0.75)', 'rgba(255,90,20,0.6)', t * 0.3); } } },
  // 5 البلدوزر — lifts a giant boulder and buries the rival
  { name: 'الانهيار الصخري', line: 'وخّر… أو تنسحق!', col: '#c9ccd6',
    run(F, a, d, t) {
      const f = a.facing; if (t < 104) finHold(d, a.x + f * 230);
      if (t < 28) { const k = t % 14, u = k < 6 ? ease(k / 6) : 1 - (k - 6) / 8; a.rageP = ((t / 14) | 0) ? FPZ.jab(u) : FPZ.str(u); if (k === 5) { finHit(F, a, d, 6, finChest(d), 5); F.shake(14); } d.finP = FPZ.hurt(); finCam(F, (a.x + d.x) / 2, -230, 1.25); return; }
      if (t < 70) { const u = finSeg(t, 28, 70); a.rageP = u < 0.3 ? Object.assign({}, CROUCH, { lean: 44, ua: 40, fa: 20, bua: 40, bfa: 20 }) : FPZ.armsUp;
        a.finProp = { k: 'rock', x: a.x + f * 10, y: lerp(-40, -560, ease(u)), r: 130, rot: 0 }; if (t === 30) { SFX.rock(); F.shake(20); dust(a.x, 30); crumble({ x: a.x + f * 40, y: -10, r: 50 }); } if (t % 6 === 0) F.shake(5);
        d.finP = FPZ.hurt({ lean: -30, ua: 150, fa: 20, bua: 150, bfa: 20 }); finCam(F, (a.x + d.x) / 2, -400, 0.92); return; }
      if (t < 92) { a.rageP = FPZ.armsUp; a.finProp.y = -560 + Math.sin(t * 0.5) * 6; finCam(F, (a.x + d.x) / 2, -400, 0.92); return; }
      if (t < 104) { const u = finSeg(t, 92, 104), P = a.finProp; P.x = lerp(a.x + f * 10, d.x, ease(u)); P.y = lerp(-560, -150, u * u); P.rot = u * f * 0.9; a.rageP = FPZ.slam; return; }
      if (t === 104) { const P = a.finProp; a.finProp = null; finHit(F, a, d, 30, [d.x, -130], 18, true); finLaunch(d, f * 6, -7); F.shake(44); SFX.thud(); crumble({ x: P.x, y: -60, r: 130 }); crumble({ x: P.x - 60, y: -90, r: 90 }); crumble({ x: P.x + 60, y: -90, r: 90 }); finRing(P.x, -20, '#c9ccd6', 380, 26); return; }
      if (t < 145) { a.rageP = Object.assign({}, FPZ.slam, { lean: 20 }); finCam(F, lerp(a.x, d.x, 0.6), -220, 1.05); return; }
      return true;
    },
    front(F, a, d, t) { const P = a.finProp; if (P && P.k === 'rock') { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(P.x, 4, P.r * 0.9 * (1 + P.y / 1400), 18, 0, 0, 7); ctx.fill(); ctx.restore(); drawRock(P.x, P.y, P.rot || 0, P.r); } } },
  // 6 المعلّم — rolling-ball lesson, then a crash from the sky
  { name: 'الدرس الأخير', line: 'الحصة خلصت!', col: '#7c8f5a',
    run(F, a, d, t) {
      const F0 = F.fin; if (F0.f0 === undefined) { F0.f0 = a.facing; F0.dx = clamp(a.x + a.facing * 200, -STAGE + 240, STAGE - 240); } const f = F0.f0, cx = F0.dx; finHold(d, cx); d.finP = FPZ.hurt({ lean: Math.sin(t * 0.3) * 20 });
      if (t < 18) { a.rageP = FPZ.point; if (t === 2) popText('الدرس الأخير ✏️', a.x, -460, '#ffffff', 40); finCam(F, (a.x + cx) / 2, -240, 1.2); return; }
      if (t < 108) { a.finBall = true; const k = t - 18, pass = (k / 30) | 0, u = (k % 30) / 30, dir = pass % 2 ? -f : f;
        a.x = clamp(cx + dir * lerp(-260, 260, ease(u)), -STAGE, STAGE); a.facing = dir; a.y = 0; a.mt = t; a.rollAng = (a.rollAng || 0) + 0.45; if (t % 4 === 0) dust(a.x, 3, -dir); if (t % 9 === 0) SFX.roll();
        if (k % 30 === 15) { finHit(F, a, d, 7, finChest(d), 4); finBurst(cx, -120, 14, ['#ffffff', '#c9e08a'], 9, 5); } finCam(F, cx, -200, 1.12); return; }
      if (t < 132) { if (F0.lx === undefined) F0.lx = a.x; const u = finSeg(t, 108, 132); a.finBall = true; a.x = lerp(F0.lx, cx, u); a.y = u < 0.6 ? -420 * Math.sin(u / 0.6 * Math.PI / 2) : -420 * (1 - ((u - 0.6) / 0.4) ** 2); a.facing = Math.sign(cx - F0.lx) || f; a.mt = t; a.rollAng += 0.6; finCam(F, cx, -300, 1.0); return; }
      if (t === 132) { a.y = 0; a.x = cx - a.facing * 10; finHit(F, a, d, 24, [cx, -80], 16, true); finLaunch(d, f * 10, -16); F.shake(36); SFX.thud(); dust(cx, 40); for (let i = 0; i < 3; i++) finRing(cx, -20, i ? '#c9e08a' : '#ffffff', 260 + i * 110, 20 + i * 5); return; }
      if (t < 142) { a.finBall = true; a.mt = t; a.x -= a.facing * 6; return; }
      if (t < 165) { a.finBall = false; a.rageP = FPZ.point; finCam(F, a.x, -220, 1.1); return; }
      return true;
    } },
  // 7 التنين — sale-day rain: every can and apple that lands on his head counts, then the cart ram
  { name: 'تخفيضات نهاية الموسم', line: 'كل شي عليك… ببلاش!', col: '#ff3b4a',
    run(F, a, d, t) {
      const f = a.facing; if (t < 100) finHold(d, a.x + f * 260);
      if (t < 14) { a.rageP = FPZ.point; if (t === 1) popText('٪ تخفيضات ٪', d.x, -560, '#ffd34d', 58); finCam(F, (a.x + d.x) / 2, -320, 1.05); return; }
      if (t < 76) { a.rageP = G2({ ua: 150, fa: 30, bua: 140, bfa: 40, lean: -6 }); d.finP = FPZ.hurt({ lean: 24 + Math.sin(t) * 6, ua: 150, fa: 40, bua: 150, bfa: 40 });
        if (t % 3 === 0) spawnProj({ kind: t % 6 ? 'can' : 'apple', noHit: true, owner: a, x: d.x + rnd(-230, 230), y: -760 - rnd(0, 80), vx: rnd(-1, 1), vy: 10, g: 0.6, r: 24, vr: rnd(-0.3, 0.3), life: 70, bounce: 0.35 });
        if (t % 7 === 0 && t >= 14 && t <= 63) { const h = finHead(d);
          finThrow(F, a, d, { kind: (t / 7) % 2 ? 'can' : 'apple', from: [h[0] + rnd(-40, 40), -800], to: [h[0] + rnd(-20, 20), h[1] - 10], T: 11, g: 0.6, r: 28, vr: rnd(-0.4, 0.4), dmg: 3,
            fx: xy => { SFX.rattle(); finBurst(xy[0], xy[1], 10, ['#ffd34d', '#ff3b4a', '#ffffff'], 8, 5); spawnProj({ kind: (t / 7) % 2 ? 'can' : 'apple', noHit: true, owner: a, x: xy[0], y: xy[1], vx: rnd(-6, 6), vy: -8, g: 0.6, r: 28, vr: rnd(-0.4, 0.4), life: 50, bounce: 0.35 }); } }); }
        finCam(F, d.x - f * 80, -300, 1.05); return; }
      if (t < 100) { const u = finSeg(t, 76, 100); if (t === 76) { a.x = d.x - f * 460; SFX.whoosh(1); } a.x = lerp(d.x - f * 460, d.x - f * 230, u * u); a.rageP = G2({ ua: 80, fa: 30, bua: 76, bfa: 34, lean: 28, th: 40 * Math.sin(t * 0.8), bth: -40 * Math.sin(t * 0.8) }); a.finProp = { k: 'cart' }; if (t % 3 === 0) dust(a.x, 2, -f); finCam(F, lerp(a.x, d.x, 0.5), -200, 1.1); return; }
      if (t === 100) { a.finProp = null; const c = finChest(d); finHit(F, a, d, 22, c, 16, true); finLaunch(d, f * 24, -16); F.shake(34); SFX.thud(); SFX.rattle();
        spawnProj({ kind: 'cartwreck', owner: a, x: a.x + f * 100, y: 0, vx: f * 9, vy: -13, g: 0.6, vr: f * 0.2, life: 80, noHit: true, dir: f });
        for (let i = 0; i < 14; i++) spawnProj({ kind: i % 2 ? 'can' : 'apple', noHit: true, owner: a, x: c[0], y: c[1], vx: rnd(-11, 11), vy: rnd(-18, -6), g: 0.6, r: 26, vr: rnd(-0.4, 0.4), life: 70, bounce: 0.35 });
        finRing(c[0], c[1], '#ff3b4a', 300, 22); finBurst(c[0], c[1], 30, ['#ffd34d', '#ff3b4a', '#ffffff'], 12, 6); return; }
      if (t < 140) { a.rageP = G2({ ua: 170, fa: 20, lean: -4 }); finCam(F, lerp(a.x, d.x, 0.5), -220, 1.05); return; }
      return true;
    },
    front(F, a, d, t) { if (a.finProp && a.finProp.k === 'cart') { const f = a.facing, x = a.x + f * 150; ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { const y = -40 - i * 38, L = 140 + ((i * 53 + t * 17) % 120); ctx.beginPath(); ctx.moveTo(x - f * 120, y); ctx.lineTo(x - f * (120 + L), y); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.translate(x, 0); ctx.scale(1.65, 1.65); drawCart(0, 0, f, 0, 1); ctx.restore(); finBurst(x - f * 40, -6, 2, ['#ffd34d', '#ffffff'], 4, 3);
      txt('٪ تخفيضات', x + f * 30, -330, { size: 46, weight: 900, color: '#ffd34d', stroke: '#000', sw: 6 }); } } },
  // 8 أبو الدجاج — chickens leap onto him, eggs smash on his head, the golden egg
  { name: 'غضب الدجاج', line: 'يا دجاج… هجوم كامل!', col: '#ffc21a',
    run(F, a, d, t) {
      const f = a.facing; if (t < 118) finHold(d, a.x + f * 230);
      const flap = () => G2({ ua: 120 + Math.sin(t * 1.2) * 34, bua: 120 - Math.sin(t * 1.2) * 34, fa: 30, bfa: 30, lean: -6 });
      if (t < 12) { a.rageP = flap(); if (t === 2) SFX.cluck(); finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 70) { a.rageP = flap(); d.finP = FPZ.hurt({ lean: Math.sin(t * 0.6) * 22 });
        if (t % 4 === 0) { const s = (t / 4) % 2 ? 1 : -1; spawnProj({ kind: 'chicken', noHit: true, owner: a, x: d.x - s * 660, y: -34, vx: s * rnd(13, 17), vy: 0, g: 0, r: 34, life: 90, ground: true, dir: s }); }
        if (t % 6 === 0 && t >= 12 && t <= 60) { const s = (t / 6) % 2 ? 1 : -1, c = finChest(d);
          finThrow(F, a, d, { kind: 'chicken', from: [d.x - s * 360, -40], to: [c[0] - s * 10, c[1] + rnd(-40, 30)], T: 12, g: 0.9, r: 40, dmg: 2.5, extra: { dir: s },
            fx: xy => { featherPuff(xy[0], xy[1], 16); SFX.cluck(); finRing(xy[0], xy[1], '#ffffff', 80, 10); spawnProj({ kind: 'chicken', noHit: true, owner: a, x: xy[0], y: xy[1], vx: -s * rnd(4, 7), vy: -9, g: 0.7, r: 36, life: 40, dir: -s }); } }); }
        finCam(F, d.x, -230, 1.05); return; }
      if (t < 96) { a.rageP = FPZ.point; d.finP = FPZ.hurt({ lean: 20, ua: 160, bua: 160, fa: 30, bfa: 30 });
        if (t % 3 === 0) { const h = finHead(d);
          for (let k = 0; k < 2; k++) spawnProj({ kind: 'egg', noHit: true, owner: a, x: d.x + rnd(-240, 240), y: -760 - rnd(0, 120), vx: rnd(-1, 1), vy: 9, g: 0.6, r: 28, vr: rnd(-0.2, 0.2), life: 60 });
          finThrow(F, a, d, { kind: 'egg', from: [h[0] + rnd(-60, 60), -780], to: [h[0] + rnd(-25, 25), h[1] - 6], T: 10, g: 0.6, r: 26, vr: rnd(-0.2, 0.2), dmg: 1.5, fx: xy => eggSplat({ x: xy[0], y: xy[1], r: 30 }) }); }
        finCam(F, d.x, -300, 1.0); return; }
      if (t < 118) { a.rageP = FPZ.armsUp; finCam(F, d.x, -360, 0.95); return; }
      if (t === 118) { finHit(F, a, d, 20, [d.x, -150], 18, true); finLaunch(d, f * 10, -13); F.shake(36); SFX.thud(); SFX.splat(); eggSplat({ x: d.x, y: -120, r: 60 }); eggSplat({ x: d.x, y: -60, r: 60 }); finBurst(d.x, -150, 50, ['#ffd34d', '#ffffff', '#ffb000'], 14, 8); featherPuff(d.x, -150, 30); finRing(d.x, -100, '#ffd34d', 340, 24);
        for (let i = 0; i < 6; i++) spawnProj({ kind: 'chicken', noHit: true, owner: a, x: d.x, y: -120, vx: rnd(-9, 9), vy: rnd(-16, -8), g: 0.7, r: 34, life: 60, dir: i % 2 ? 1 : -1 }); return; }
      if (t < 160) { a.rageP = flap(); if (t % 20 === 0) SFX.cluck(); finCam(F, lerp(a.x, d.x, 0.5), -220, 1.05); return; }
      return true;
    },
    front(F, a, d, t) { if (t >= 96 && t <= 118) { const u = finSeg(t, 96, 118); finGoldEgg(d.x, lerp(-1100, -170, u * u), 100); } } },
  // 9 أبو الأسود — bikes and tires slam into him one after another, giant tire run-over
  { name: 'سباق الموت', line: 'جاهز تطير؟', col: '#e9e9ee',
    run(F, a, d, t) {
      const f = a.facing; if (t < 118) finHold(d, a.x + f * 260);
      if (t < 12) { a.rageP = FPZ.point; if (t === 2) SFX.zap(); finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 64) { a.rageP = G2({ ua: 150, fa: 20, lean: -4 }); d.finP = FPZ.hurt();
        if (t % 12 === 0 && t <= 48) { const c = finChest(d);
          finThrow(F, a, d, { kind: 'bike', from: [a.x - f * 320, -620], to: [c[0], c[1]], T: 15, g: 0.6, r: 64, vr: f * 0.25, dmg: 5, extra: { dir: f }, fx: xy => bikeCrash({ x: xy[0], y: xy[1], vx: f * 8, r: 64, dir: f, owner: a }) }); SFX.throw(); }
        finCam(F, (a.x + d.x) / 2, -280, 1.0); return; }
      if (t < 90) { a.rageP = FPZ.jab(finExt(t, 13));
        if (t % 13 === 2) { const w = a.toWorld(a.J.fH), h = finHead(d); finThrow(F, a, d, { kind: 'tire', from: w, to: h, T: 9, g: 0.7, r: 38, vr: f * 0.4, dmg: 4, fx: xy => { SFX.boing(); finBurst(xy[0], xy[1], 10, ['#555b6a', '#ffffff'], 8, 5); spawnProj({ kind: 'tire', noHit: true, owner: a, x: xy[0], y: xy[1], vx: -f * 5, vy: -10, g: 0.7, r: 38, vr: -f * 0.3, life: 50, bounce: 0.55 }); } }); }
        finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 118) { const u = finSeg(t, 90, 118); a.rageP = G2({ ua: 90, fa: 0, bua: 86, bfa: 6, lean: 26, dx: 14 }); a.finProp = { k: 'tire', x: lerp(a.x - f * 200, d.x, u * u), y: -120, rot: (a.finProp && a.finProp.rot || 0) + f * 0.35 }; if (t % 3 === 0) dust(a.finProp.x, 4, -f); if (t % 2 === 0) finBurst(a.finProp.x - f * 90, -20, 3, ['#ff8a2a', '#ffd34d'], 5, 5); if (t === 90) SFX.roll(); finCam(F, lerp(a.x, d.x, 0.5), -240, 1.0); return; }
      if (t === 118) { a.finProp = null; finHit(F, a, d, 22, finChest(d), 18, true); finLaunch(d, f * 15, -16); F.shake(36); SFX.thud(); SFX.boing(); spawnProj({ kind: 'tire', noHit: true, owner: a, x: d.x, y: -120, vx: f * 11, vy: -14, g: 0.6, r: 120, vr: f * 0.3, life: 60, bounce: 0.5 }); finRing(d.x, -110, '#ffffff', 320, 22); finBurst(d.x, -110, 40, ['#e9e9ee', '#555b6a', '#ffd34d'], 12, 7); return; }
      if (t < 155) { a.rageP = G2({ ua: 170, fa: 20, bua: 30, bfa: 130 }); finCam(F, lerp(a.x, d.x, 0.5), -220, 1.05); return; }
      return true;
    },
    front(F, a, d, t) { const P = a.finProp; if (P && P.k === 'tire') { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(P.x, 4, 120, 16, 0, 0, 7); ctx.fill(); ctx.restore();
      finComet(P.x - a.facing * 30, P.y, a.facing, 0, 560, 110, 'rgba(255,100,30,0.7)', 'rgba(255,220,120,0.8)'); drawTire(P.x, P.y, P.rot, 120);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,150,40,0.8)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(P.x, P.y, 122, 0, 7); ctx.stroke(); ctx.restore(); } } },
  // 10 البوب — fireball volley into the body, then the giant charged rocket ball
  { name: 'صاروخ البوب العملاق', line: 'كورة وحدة… تكفي!', col: '#ff8a2a',
    run(F, a, d, t) {
      const f = a.facing; if (t < 104) finHold(d, a.x + f * 300);
      if (t < 40) { const k = t % 10, L = ((t / 10) | 0) % 2; a.rageP = L ? FPZ.jab(k < 4 ? k / 4 : 1 - (k - 4) / 6) : FPZ.str(k < 4 ? k / 4 : 1 - (k - 4) / 6);
        if (k === 3) { const w = a.toWorld(L ? a.J.bH : a.J.fH), c = finChest(d); finThrow(F, a, d, { kind: 'hball', from: w, to: [c[0], c[1] + rnd(-40, 30)], T: 6, g: 0, r: 28, vr: f * 0.5, dmg: 4, extra: { fire: true }, fx: xy => { finBurst(xy[0], xy[1], 16, ['#ff8a2a', '#ffd34d', '#ff3b30'], 9, 7); finRing(xy[0], xy[1], '#ff8a2a', 100, 10); } }); SFX.throw(); }
        d.finP = FPZ.hurt(); finCam(F, (a.x + d.x) / 2, -230, 1.1); return; }
      if (t < 92) { const u = finSeg(t, 40, 92); a.rageP = FPZ.armsUp; a.finProp = { k: 'orb', x: a.x - f * 10, y: lerp(-470, -560, u), r: lerp(22, 100, ease(u)) };
        if (t % 2 === 0) { const an = rnd(0, 7), R = 260; FX.push({ t: 'p', x: a.finProp.x + Math.cos(an) * R, y: a.finProp.y + Math.sin(an) * R, vx: -Math.cos(an) * 12, vy: -Math.sin(an) * 12, life: 20, max: 20, c: '#ffd34d', sz: rnd(3, 6) }); }
        if (t % 10 === 0) { F.shake(6); SFX.zap(); } finCam(F, (a.x + d.x) / 2, -380, 0.92); return; }
      if (t < 104) { const u = finSeg(t, 92, 104), P = a.finProp, c = finChest(d); a.rageP = FPZ.slam; P.x = lerp(a.x - f * 10, c[0], ease(u)); P.y = lerp(-560, c[1], u); if (t === 92) { SFX.throw(); SFX.whoosh(1); } if (t % 2 === 0) finBurst(P.x, P.y, 5, ['#ff8a2a', '#ffd34d'], 5, 8); return; }
      if (t === 104) { const c = finChest(d); a.finProp = null; finHit(F, a, d, 32, c, 20, true); finLaunch(d, f * 14, -22); F.shake(46); SFX.thud(); SFX.rock();
        finBurst(c[0], c[1], 90, ['#ff8a2a', '#ffd34d', '#ff3b30', '#ffffff'], 20, 10); for (let i = 0; i < 4; i++) finRing(c[0], c[1], i % 2 ? '#ff8a2a' : '#ffffff', 260 + i * 140, 20 + i * 6); return; }
      if (t < 145) { a.rageP = Object.assign({}, FPZ.slam, { lean: 16 }); finCam(F, lerp(a.x, d.x, 0.5), -220, 1.0); return; }
      return true;
    },
    front(F, a, d, t) { const P = a.finProp; if (P && P.k === 'orb') { if (t >= 92) { const c = finChest(d); finComet(P.x, P.y, c[0] - (a.x - a.facing * 10), c[1] + 560, 700, P.r * 1.2, 'rgba(255,110,30,0.85)', 'rgba(255,235,150,0.9)'); } finOrb(P.x, P.y, P.r, 'rgba(255,150,40,0.85)', 'rgba(255,90,20,0.55)', t * 0.25); } } },
  // 11 الطالب — pens stab in like arrows, notebooks slam, the giant book closes
  { name: 'الاختبار النهائي', line: 'سؤال أخير… وصفر!', col: '#3a56c8',
    run(F, a, d, t) {
      const f = a.facing; if (t < 120) finHold(d, a.x + f * 250);
      if (t < 14) { a.rageP = FPZ.point; if (t === 2) SFX.zap(); finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 66) { a.rageP = G2({ ua: 160, fa: 30, bua: 150, bfa: 40, lean: -4 }); d.finP = FPZ.hurt({ lean: 18 + Math.sin(t) * 6 });
        if (t % 2 === 0) spawnProj({ kind: 'pen', noHit: true, owner: a, x: d.x - f * rnd(60, 380), y: -760, vx: f * rnd(4, 8), vy: 24, g: 0, r: 28, life: 40, col: pick(['#3a56c8', '#e01b30', '#2fbf62', '#111111']) });
        if (t % 5 === 0 && t <= 60) { const c = finChest(d); finThrow(F, a, d, { kind: 'pen', from: [c[0] - f * rnd(200, 320), -760], to: [c[0] + rnd(-30, 30), c[1] + rnd(-80, 60)], T: 8, g: 0, r: 30, dmg: 2.2, extra: { col: pick(['#3a56c8', '#e01b30', '#2fbf62', '#111111']) },
          fx: xy => { finBurst(xy[0], xy[1], 8, ['#3a56c8', '#ffffff'], 7, 4); FX.push({ t: 'ring', x: xy[0], y: xy[1], life: 8, max: 8, c: '#ffffff', r0: 4, r1: 40 }); } }); }
        finCam(F, d.x - f * 60, -300, 1.0); return; }
      if (t < 96) { const k = t - 66, u = finExt(k, 10); a.rageP = k % 20 < 10 ? FPZ.str(u) : FPZ.jab(u);
        if (k % 10 === 4) { const w = a.toWorld(a.J.fH), c = finChest(d); finThrow(F, a, d, { kind: 'book', from: w, to: [c[0], c[1] + rnd(-40, 20)], T: 7, g: 0, r: 40, vr: f * 0.5, dmg: 4, extra: { col: pick(['#3a56c8', '#e01b30', '#2fbf62']) },
          fx: xy => { SFX.hit(1.2); for (let i = 0; i < 12; i++) FX.push({ t: 'p', x: xy[0], y: xy[1], vx: rnd(-7, 7), vy: rnd(-8, 2), life: 30, max: 30, c: '#f5f5f0', sz: rnd(3, 6) }); } }); SFX.throw(); }
        finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 120) { a.rageP = FPZ.armsUp; d.finP = FPZ.hurt({ lean: -20 }); finCam(F, d.x, -330, 1.0); return; }
      if (t === 120) { finHit(F, a, d, 18, [d.x, -200], 18, true); finLaunch(d, f * 8, -18); F.shake(36); SFX.thud();
        for (let i = 0; i < 40; i++) FX.push({ t: 'p', x: d.x + rnd(-100, 100), y: -200 + rnd(-80, 80), vx: rnd(-8, 8), vy: rnd(-10, 2), life: 40, max: 40, c: '#f5f5f0', sz: rnd(3, 7) });
        for (let i = 0; i < 8; i++) spawnProj({ kind: 'pen', noHit: true, owner: a, x: d.x, y: -220, vx: rnd(-12, 12), vy: rnd(-16, -6), g: 0.6, r: 28, life: 50, col: pick(['#3a56c8', '#e01b30', '#2fbf62']) });
        popText('صفر ✗', d.x, -520, '#ff2a3a', 110); finRing(d.x, -200, '#3a56c8', 320, 24); return; }
      if (t < 158) { a.rageP = G2({ ua: 170, fa: 20, lean: -4 }); finCam(F, lerp(a.x, d.x, 0.5), -240, 1.0); return; }
      return true;
    },
    front(F, a, d, t) { if (t >= 96 && t < 124) { if (F.fin.bx === undefined) F.fin.bx = d.x; const u = finSeg(t, 96, 110), y = lerp(-900, -250, easeOut(u)); const shut = finSeg(t, 110, 119);
      ctx.save(); ctx.globalAlpha *= t < 121 ? 1 : (124 - t) / 3; ctx.translate(F.fin.bx, y); const s = 5.2; ctx.scale(s, s);
      for (const side of [-1, 1]) { ctx.save(); ctx.rotate(side * (1 - shut) * 0.9); ctx.fillStyle = '#c0182a'; ctx.fillRect(side > 0 ? 0 : -32, -22, 32, 44); ctx.fillStyle = '#f7f3e6'; ctx.fillRect(side > 0 ? 2 : -30, -20, 28, 40); ctx.fillStyle = '#9aa3b5'; for (let k = 0; k < 6; k++) ctx.fillRect(side > 0 ? 5 : -27, -15 + k * 6, 22, 1.4); ctx.restore(); }
      ctx.restore(); } } },
  // 12 العبد — kata storm, flying kick, then sits down to eat his bread
  { name: 'الكاتا الأخيرة', line: 'أوس… هاااي!', col: '#f2f2f2',
    run(F, a, d, t) {
      const f = a.facing; if (t < 112) finHold(d, a.x + f * 125);
      if (t < 18) { a.rageP = G2({ ua: 60, fa: 140, bua: 60, bfa: 140, lean: 14, th: 4, bth: -4 }); if (t === 4) { SFX.voice('kiai'); finRing(a.x, -220, '#ffffff', 200, 18); } finCam(F, (a.x + d.x) / 2, -230, 1.3); return; }
      if (t < 90) { a.finTrail = true; const k = t - 18, i = (k / 5) | 0, u = finExt(k, 5); a.rageP = [FPZ.jab, FPZ.str, FPZ.kick, FPZ.str][i % 4](u); d.finP = FPZ.hurt({ lean: -18 + Math.sin(t * 1.3) * 10 });
        if (k % 5 === 2) { finHit(F, a, d, 2, i % 4 === 2 ? finChest(d) : finHead(d), 1); if (i % 3 === 0) SFX.voice('kiai'); } finCam(F, (a.x + d.x) / 2 + Math.sin(t) * 5, -230, 1.35); return; }
      if (t < 112) { const u = finSeg(t, 90, 112); a.finTrail = true; a.y = -160 * Math.sin(u * Math.PI); a.rageP = G2({ r: -20 * u, th: lerp(60, 118, u), sh: lerp(90, 4, u), ffl: 0, bth: 60, bsh: 120, lean: -16, ua: 30, fa: 90 }); finCam(F, (a.x + d.x) / 2, -300, 1.15); return; }
      if (t === 112) { a.y = 0; a.finTrail = false; const h = finHead(d); finHit(F, a, d, 16, h, 18, true); finLaunch(d, f * 17, -15); F.shake(34); SFX.thud(); SFX.voice('kiai'); for (let i = 0; i < 3; i++) finRing(h[0], h[1], '#ffffff', 220 + i * 120, 18 + i * 5); popText('هاااي!', h[0], h[1] - 110, '#ffffff', 84); return; }
      if (t < 132) { a.rageP = G2({ ua: 94, fa: 0, lean: 6 }); finCam(F, lerp(a.x, d.x, 0.4), -220, 1.1); return; }
      if (t < 190) { const u = finSeg(t, 132, 190); a.rageP = P({ dx: -40, lean: 16, th: 92, sh: 150, bth: 88, bsh: 152, ua: 40 + Math.max(0, Math.sin(u * 18)) * 70, fa: 120, bua: 30, bfa: 110 }); a.finProp = { k: 'bread' }; if (t === 134) SFX.land(); finCam(F, a.x, -160, 1.4); return; }
      return true;
    },
    front(F, a, d, t) { if (a.finProp && a.finProp.k === 'bread') { const w = a.toWorld(a.J.fH), b = a.toWorld(a.J.bH); ctx.save(); ctx.fillStyle = '#c98b3c'; ctx.strokeStyle = '#7a4d16'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(w[0], w[1] - 4, 20, 11, 0.3, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#8fd0ff'; ctx.globalAlpha = 0.85; rrect(b[0] - 12, b[1] - 18, 24, 30, 4); ctx.fill(); ctx.restore(); } } },
  // 13 القيمر — laser barrage, lock-on, orbital strike
  { name: 'وضع الألتيمت', line: 'جي جي!', col: '#e01b30',
    run(F, a, d, t) {
      const f = a.facing; if (t < 128) finHold(d, a.x + f * 300);
      if (t < 14) { a.rageP = FPZ.aim; a.finProp = { k: 'gun' }; if (t === 2) { SFX.zap(); popText('الألتيمت جاهز ⚡', a.x, -470, '#3cf2ff', 40); } finCam(F, (a.x + d.x) / 2, -240, 1.15); return; }
      if (t < 74) { a.rageP = Object.assign({}, FPZ.aim, { lean: 6 + (t % 4 < 2 ? -3 : 0), dx: t % 4 < 2 ? -4 : 0 }); d.finP = FPZ.hurt({ lean: Math.sin(t * 0.9) * 16 });
        if (t % 3 === 0) { const w = a.toWorld(a.J.fH), c = finChest(d), hit = t % 6 === 0; const o = { kind: 'laser', from: [w[0] + f * 60, w[1] - 12], to: [c[0], c[1] + rnd(-60, 40)], T: 5, g: 0, r: 12, extra: { col: hit ? '#3cf2ff' : '#ff3cf0' } };
          if (hit) { o.dmg = 2.5; o.fx = xy => { finBurst(xy[0], xy[1], 8, ['#3cf2ff', '#ffffff'], 7, 4); FX.push({ t: 'ring', x: xy[0], y: xy[1], life: 8, max: 8, c: '#3cf2ff', r0: 4, r1: 46 }); }; } finThrow(F, a, d, o); SFX.zap(); } finCam(F, (a.x + d.x) / 2, -230, 1.12); return; }
      if (t < 100) { a.rageP = FPZ.point; a.finProp = null; d.finP = FPZ.hurt({ lean: -10 }); finCam(F, d.x, -260, 1.1); return; }
      if (t < 128) { a.rageP = FPZ.point; if (t === 100) { SFX.zap(); F.shake(10); } if (t % 7 === 2) { finHit(F, a, d, 2.5, finChest(d), 2); } if (t % 2 === 0) finBurst(d.x + rnd(-60, 60), -rnd(0, 300), 3, ['#3cf2ff', '#ff3cf0', '#ffffff'], 6, 5); F.shake(6); finCam(F, d.x, -360, 0.95); return; }
      if (t === 128) { finHit(F, a, d, 13, finChest(d), 18, true); finLaunch(d, f * 9, -20); F.shake(40); SFX.thud(); SFX.rock(); finBurst(d.x, -150, 80, ['#3cf2ff', '#ff3cf0', '#ffffff', '#7a3cff'], 18, 9); for (let i = 0; i < 3; i++) finRing(d.x, -150, i ? '#ff3cf0' : '#3cf2ff', 260 + i * 130, 20 + i * 6); popText('تم الإقصاء', d.x, -560, '#ff3cf0', 74); return; }
      if (t < 165) { a.rageP = G2({ ua: 170, fa: 20, bua: 160, bfa: 30, lean: -6 }); if (t === 140) popText('GG', a.x, -480, '#3cf2ff', 70); finCam(F, lerp(a.x, d.x, 0.5), -240, 1.0); return; }
      return true;
    },
    front(F, a, d, t) { if (a.finProp && a.finProp.k === 'gun') drawBlaster(a);
      if (t >= 76 && t < 104) { const u = finSeg(t, 76, 100), c = finChest(d); finReticle(c[0], c[1], lerp(200, 70, u), Math.min(1, u * 3)); }
      if (t >= 100 && t < 136) { const a2 = t < 128 ? Math.min(1, (t - 100) / 6) : 1 - (t - 128) / 8; finBeam(d.x, a2, 90 + Math.sin(t * 0.8) * 10, 'rgba(120,240,255,0.95)', 'rgba(255,60,240,0.5)'); } } },
  // 14 وحش التيرسل — rams you twice, rips off the door and a tyre and throws them, then the full-speed crash
  { name: 'الحادث الكبير', line: 'اربط الحزام!', col: '#ff3347',
    run(F, a, d, t) {
      const f = a.facing;
      if (!a.finS || a.finS.fin !== F.fin) a.finS = { fin: F.fin, dx: clamp(a.x + f * 430, -STAGE + 140, STAGE - 140) };
      const S = a.finS, X = S.dx, cam = (z = 1.0) => finCam(F, (a.x + X) / 2, -230, z);
      if (t < 178) finHold(d, X);
      if (t < 12) { a.rageP = FPZ.point; if (t === 2) SFX.horn(); cam(1.05); return; }
      if (t === 12) { poof(a.x, -120); SFX.engine(); a.finCar = { sp: 1 }; S.cx = a.x; }
      if (t < 36) { const u = finSeg(t, 12, 36); a.x = lerp(S.cx, X - f * 250, u * u); if (t % 2 === 0) dust(a.x - f * 240, 2, -f); cam(); return; }
      if (t === 36) { finHit(F, a, d, 8, finChest(d), 10); F.shake(22); SFX.thud(); SFX.rattle(); finBurst(X - f * 20, -150, 26, ['#ffffff', '#9fd8ff', '#ffd34d'], 10, 5); d.finP = FPZ.hurt({ lean: -30 }); a.finCar = { crack: 1 }; return; }
      if (t < 60) { const u = finSeg(t, 36, 60); a.x = lerp(X - f * 250, X - f * 560, ease(u)); a.finCar.rev = 1; d.finP = FPZ.hurt({ lean: -20 }); cam(0.95); return; }
      if (t < 78) { const u = finSeg(t, 60, 78); a.finCar.rev = 0; a.finCar.sp = 1; if (t === 60) { SFX.engine(); SFX.horn(); } a.x = lerp(X - f * 560, X - f * 250, u * u); if (t % 2 === 0) dust(a.x - f * 240, 2, -f); cam(); return; }
      if (t === 78) { finHit(F, a, d, 8, finChest(d), 10); F.shake(24); SFX.thud(); SFX.rattle(); finBurst(X - f * 20, -150, 30, ['#ffffff', '#9fd8ff', '#ffd34d'], 10, 5); d.finP = FPZ.hurt({ lean: -34 }); a.finCar.sp = 0; return; }
      if (t < 90) { cam(); return; }
      if (t === 90) { S.car = a.x - f * 70; a.finCar = null; a.finProp = { k: 'car', x: S.car, crack: 1 }; a.x = X - f * 200; poof(a.x, -150); SFX.land(); }
      if (t < 100) { a.rageP = G2({ lean: 34, ua: 110, fa: 30, bua: 104, bfa: 34, th: 46, bth: -24, dx: -14 }); cam(1.05); return; }
      if (t === 100) { a.finProp.noDoor = 1; a.finHeld = 'door'; SFX.rattle(); finBurst(S.car + f * 50, -130, 16, ['#2a2c31', '#8b9199', '#ffd34d'], 7, 5); }
      if (t < 110) { a.rageP = G2({ ua: 205, fa: 40, bua: 190, bfa: 50, lean: -16, th: 24, bth: -20 }); cam(1.05); return; }
      if (t === 110) { a.finHeld = null; const w = a.toWorld(a.J.fH); finThrow(F, a, d, { kind: 'door', from: w, to: finChest(d), T: 8, g: 0.3, r: 42, vr: f * 0.5, dmg: 7, fx: xy => { SFX.thud(); finBurst(xy[0], xy[1], 18, ['#2a2c31', '#ffb21a', '#ffffff'], 9, 6); finRing(xy[0], xy[1], '#ffb21a', 140, 12); } }); SFX.throw(); }
      if (t < 120) { a.rageP = G2({ ua: 80, fa: 6, lean: 26, dx: 14, th: 44, bth: -34 }); cam(1.05); return; }
      if (t < 128) { a.rageP = G2({ lean: 40, ua: 120, fa: 20, bua: 112, bfa: 26, th: 60, sh: 70, bth: -10, bsh: 60, dx: -20 }); cam(1.05); return; }
      if (t === 128) { a.finProp.noTire = 1; a.finHeld = 'tire'; SFX.rattle(); finBurst(S.car + f * 162, -40, 16, ['#2a2c31', '#b8bec8'], 7, 5); }
      if (t < 138) { a.rageP = G2({ ua: 200, fa: 50, bua: 196, bfa: 46, lean: -18, th: 26, bth: -22 }); cam(1.05); return; }
      if (t === 138) { a.finHeld = null; const w = a.toWorld(a.J.fH); finThrow(F, a, d, { kind: 'cartire', from: w, to: finHead(d), T: 9, g: 0.5, r: 38, vr: f * 0.45, dmg: 7, fx: xy => { SFX.boing(); finBurst(xy[0], xy[1], 14, ['#2a2c31', '#ffffff'], 8, 5); spawnProj({ kind: 'cartire', noHit: true, owner: a, x: xy[0], y: xy[1], vx: -f * 5, vy: -10, g: 0.7, r: 38, vr: -f * 0.3, life: 50, bounce: 0.55 }); } }); SFX.throw(); }
      if (t < 150) { const u = finSeg(t, 140, 150); a.rageP = t < 142 ? G2({ ua: 80, fa: 6, lean: 26, dx: 14 }) : FPZ.point; a.x = lerp(X - f * 200, S.car, u); cam(1.0); return; }
      if (t === 150) { poof(S.car, -120); a.x = S.car; a.finProp = null; a.finCar = { noDoor: 1, noTire: 1, crack: 1, rev: 1 }; SFX.engine(); }
      if (t < 162) { const u = finSeg(t, 150, 162); a.x = lerp(S.car, X - f * 620, ease(u)); cam(0.92); return; }
      if (t < 178) { const u = finSeg(t, 162, 178); a.finCar.rev = 0; a.finCar.sp = 1; if (t === 162) { SFX.engine(); SFX.horn(); } a.x = lerp(X - f * 620, X - f * 230, u * u);
        if (t % 2 === 0) { finBurst(a.x + f * 150, -8, 5, ['#ffd34d', '#ff8a2a', '#ffffff'], 7, 4); dust(a.x - f * 240, 3, -f); } cam(0.95); return; }
      if (t === 178) { const c = finChest(d); finHit(F, a, d, 22, c, 18, true); finLaunch(d, f * 17, -20); F.shake(42); SFX.thud(); SFX.rock(); SFX.rattle();
        finRing(c[0], c[1], '#ffffff', 340, 22); finRing(c[0], c[1], '#ff3347', 220, 16); finBurst(c[0], c[1], 70, ['#ffffff', '#9fd8ff', '#ff3347', '#ffd34d'], 15, 8); return; }
      if (t < 200) { const u = finSeg(t, 178, 200); a.x = lerp(X - f * 230, X + f * 120, easeOut(u)); a.finCar.sp = u < 0.6 ? 1 : 0; if (t % 3 === 0) finBurst(a.x + f * 150, -8, 4, ['#ffd34d', '#ff8a2a'], 6, 4); finCam(F, lerp(a.x, d.x, 0.5), -240, 0.95); return; }
      if (t === 200) { poof(a.x, -120); a.finCar = null; SFX.land(); }
      if (t < 228) { a.rageP = FPZ.point; finCam(F, lerp(a.x, d.x, 0.5), -220, 1.0); return; }
      return true;
    },
    back(F, a, d, t) { const P = a.finProp; if (P && P.k === 'car') drawCar(P.x, a.facing, 0, { noDoor: P.noDoor, noTire: P.noTire, crack: P.crack }); },
    front(F, a, d, t) { if (a.finHeld) { const w = a.toWorld(a.J.fH); if (a.finHeld === 'door') drawDoor(w[0], w[1] - 6, a.facing * 0.3, 42); else drawCarTire(w[0], w[1] - 10, 0, 38); } } },
  // 15 النوخذة — point-blank waves, then a tsunami carrying his ship
  { name: 'التسونامي', line: 'البحر… بياكلك!', col: '#3cb4ff',
    run(F, a, d, t) {
      const f = a.facing; if (t < 104) finHold(d, a.x + f * 230);
      if (t < 18) { a.rageP = FPZ.point; if (t === 2) { SFX.whoosh(1); popText('🌊', a.x, -470, '#ffffff', 60); } finCam(F, (a.x + d.x) / 2, -260, 1.1); return; }
      if (t < 60) { const k = (t - 18) % 14; a.rageP = k < 6 ? G2({ ua: 200, fa: 30, bua: 196, bfa: 34, lean: -14 }) : G2({ ua: 95, fa: 4, bua: 90, bfa: 8, lean: 26, dx: 14, th: 44, bth: -34 }); d.finP = FPZ.hurt({ lean: -18 });
        if (k === 6) { const c = finChest(d); finThrow(F, a, d, { kind: 'seawave', from: [a.x + f * 110, -100], to: [c[0], -100], T: 8, g: 0, r: 100, dmg: 5, fx: xy => { finBurst(xy[0], -120, 24, ['#ffffff', '#7fd6ff', '#3cb4ff'], 11, 7); SFX.rock(); } }); SFX.whoosh(1); }
        finCam(F, (a.x + d.x) / 2, -260, 1.1); return; }
      if (t < 104) { a.rageP = FPZ.armsUp; d.finP = FPZ.hurt({ lean: -28, ua: 150, fa: 30, bua: 150, bfa: 30 }); if (t % 8 === 0) { F.shake(6); SFX.whoosh(0); } if (t % 2 === 0) finBurst(lerp(a.x - f * 500, d.x, finSeg(t, 60, 104)), -rnd(100, 500), 3, ['#ffffff', '#9fe0ff'], 6, 6); finCam(F, (a.x + d.x) / 2 - f * 80, -380, 0.86); return; }
      if (t === 104) { finHit(F, a, d, 28, [d.x, -200], 18, true); finLaunch(d, f * 18, -16); F.shake(42); SFX.thud(); SFX.rock(); finBurst(d.x, -220, 90, ['#ffffff', '#7fd6ff', '#3cb4ff', '#0a3a7a'], 18, 10); for (let i = 0; i < 3; i++) finRing(d.x, -120, i ? '#3cb4ff' : '#ffffff', 300 + i * 140, 22 + i * 6); return; }
      if (t < 145) { a.rageP = FPZ.point; finCam(F, lerp(a.x, d.x, 0.5), -240, 1.0); return; }
      return true;
    },
    front(F, a, d, t) {
      if (t >= 60 && t < 112) { const u = finSeg(t, 60, 104), x = lerp(a.x - a.facing * 520, d.x + a.facing * 40, u * u), al = t < 104 ? Math.min(1, (t - 60) / 6) : 1 - (t - 104) / 8;
        ctx.save(); ctx.globalAlpha *= al; ctx.translate(x, 0); ctx.scale(2.7, 2.7); drawSeaWave({ x: 0, vx: a.facing, t }); ctx.restore();
        ctx.save(); ctx.globalAlpha *= al; ctx.translate(x + a.facing * 40, -585 + Math.sin(t * 0.3) * 8); ctx.rotate(a.facing * -0.12); ctx.scale(0.85, 0.85); drawDhow(0, -60, a.facing, t); ctx.restore(); }
    } },
  // 16 الرئيس — ring punches, lifts you up, slams you into the floor
  { name: 'أمر الرئيس', line: 'انحني… للرئيس!', col: '#d4a640',
    run(F, a, d, t) {
      const f = a.facing; if (t < 70) finHold(d, a.x + f * 140);
      if (t < 16) { a.rageP = G2({ ua: 150, fa: 40, lean: -4 }); if (t === 4) { SFX.zap(); const w = a.toWorld(a.J.fH); finRing(w[0], w[1], '#d4a640', 140, 14); popText('💍', w[0], w[1] - 60, '#ffd34d', 50); } finCam(F, (a.x + d.x) / 2, -240, 1.3); return; }
      if (t < 70) { const k = t - 16, i = (k / 9) | 0, u = finExt(k, 9); a.rageP = Object.assign(i % 2 ? FPZ.jab(u) : FPZ.str(u), { fsc: 1.5 }); d.finP = FPZ.hurt({ lean: -20 + Math.sin(t) * 8 });
        if (k % 9 === 4) { const w = a.toWorld(i % 2 ? a.J.bH : a.J.fH); finHit(F, a, d, 4, w, 3); finRing(w[0], w[1], i % 2 ? '#ff2a3a' : '#d4a640', 110, 10); } finCam(F, (a.x + d.x) / 2, -240, 1.32); return; }
      if (t < 96) { const u = finSeg(t, 70, 96); a.rageP = FPZ.armsUp; finHold(d, a.x + f * 70, -260 * ease(u)); d.finP = FPZ.hurt({ lean: -30, r: -10 }); if (t % 3 === 0) finBurst(d.x, d.y - 120, 3, ['#d4a640', '#ffd34d'], 5, 5); finCam(F, a.x + f * 40, -360, 1.0); return; }
      if (t < 106) { const u = finSeg(t, 96, 106); a.rageP = FPZ.slam; finHold(d, a.x + f * 110, -260 * (1 - u * u)); return; }
      if (t === 106) { finHold(d, a.x + f * 110, 0); finHit(F, a, d, 22, [d.x, -60], 18, true); finLaunch(d, f * 6, -8); F.shake(44); SFX.thud(); SFX.rock(); F.fin.crack = 1; F.fin.crackX = d.x; crumble({ x: d.x, y: -10, r: 90 });
        for (let i = 0; i < 4; i++) finRing(d.x, -10, i % 2 ? '#d4a640' : '#ff2a3a', 260 + i * 130, 20 + i * 6); popText('ركعت للرئيس!', d.x, -420, '#ffd34d', 64); return; }
      if (t < 145) { a.rageP = Object.assign({}, FPZ.slam, { lean: 14 }); finCam(F, lerp(a.x, d.x, 0.5), -220, 1.1); return; }
      return true;
    },
    back(F, a, d, t) { if (F.fin.crack) finCracks(F.fin.crackX, 8, 380, 1); } },
  // 17 الرئيس المتحوّل — rises on his wings, burns you with eye lasers and red blasts, then dives
  { name: 'الجناح الأسود', line: 'هذي… نهايتك!', col: '#ff1030',
    run(F, a, d, t) {
      const f = a.facing; if (t < 100) finHold(d, a.x + f * 280);
      if (t < 30) { const u = finSeg(t, 0, 30); a.y = -320 * ease(u); a.rageP = G2({ ua: 150, fa: 30, bua: 150, bfa: 30, lean: -10, th: 30, sh: 60, bth: 20, bsh: 60 }); if (t === 2) { SFX.rage(); SFX.whoosh(1); } if (t % 2 === 0) finBurst(a.x + rnd(-80, 80), a.y - rnd(0, 300), 3, ['#ff2030', '#1a0b0e'], 5, 6); finCam(F, (a.x + d.x) / 2, -380, 0.95); return; }
      if (t < 82) { a.y = -320 + Math.sin(t * 0.15) * 12; a.rageP = G2({ ua: 100, fa: 10, lean: 14, th: 30, sh: 60, bth: 20, bsh: 60 }); d.finP = FPZ.hurt({ lean: Math.sin(t * 0.8) * 14 });
        if (t % 6 === 0) { const c = finChest(d); finHit(F, a, d, 2, [c[0] + rnd(-20, 20), c[1] + rnd(-40, 30)], 1); finBurst(c[0], c[1], 8, ['#ff2030', '#ffffff'], 7, 5); }
        if (t % 13 === 5) { const w = a.toWorld(a.J.fH), c = finChest(d); finThrow(F, a, d, { kind: 'redball', from: w, to: [c[0], c[1]], T: 8, g: 0, r: 34, dmg: 3, fx: xy => { finBurst(xy[0], xy[1], 18, ['#ff2030', '#ffd34d', '#ffffff'], 10, 7); finRing(xy[0], xy[1], '#ff2030', 120, 12); SFX.thud(); } }); SFX.zap(); }
        finCam(F, (a.x + d.x) / 2, -360, 0.92); return; }
      if (t < 100) { const u = finSeg(t, 82, 100); a.y = -320 * (1 - u * u); a.x = lerp(a.x, d.x - f * 60, 0.25); a.rageP = G2({ ua: 80, fa: 10, bua: 76, bfa: 10, lean: 34, th: 60, sh: 90, bth: 40, bsh: 80 }); return; }
      if (t === 100) { a.y = 0; const c = finChest(d); finHit(F, a, d, 15, c, 20, true); finLaunch(d, f * 16, -22); F.shake(48); SFX.thud(); SFX.rock();
        finBurst(c[0], c[1], 100, ['#ff2030', '#ff7040', '#1a0b0e', '#ffffff'], 20, 10); for (let i = 0; i < 4; i++) finRing(c[0], c[1], i % 2 ? '#ff2030' : '#ffffff', 280 + i * 150, 22 + i * 6); return; }
      if (t < 145) { a.rageP = G2({ ua: 170, fa: 20, bua: 160, bfa: 30, lean: -8 }); finCam(F, lerp(a.x, d.x, 0.5), -240, 1.0); return; }
      return true;
    },
    front(F, a, d, t) {
      if (t >= 30 && t < 82) { const e = eyePos(a), c = finChest(d), w = 12 + Math.sin(t * 0.9) * 3; ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const [lw, col] of [[w * 3.2, 'rgba(255,20,30,0.25)'], [w * 1.6, 'rgba(255,40,40,0.7)'], [w * 0.55, 'rgba(255,240,240,0.95)']]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(e[0], e[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); } ctx.restore(); }
      if (t >= 82 && t < 101) finComet(a.x, a.y - 200, d.x - a.x, 320, 520, 90, 'rgba(255,30,40,0.8)', 'rgba(255,200,180,0.8)');
    } },
  // 18 الطباخ — pan smacks, tomatoes and eggs, the giant pot drops on you, then the flambé blast
  { name: 'المطبخ الناري', line: 'الأكل جاهز!', col: '#ff8a2a',
    run(F, a, d, t) {
      const f = a.facing; if (t < 150) finHold(d, a.x + f * 170);
      if (t < 12) { a.finHeld = 'pan'; a.rageP = FPZ.point; finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 48) { const k = (t - 12) % 12, u = k < 5 ? k / 5 : 1 - (k - 5) / 7; a.rageP = G2({ ua: lerp(210, 70, u), fa: lerp(60, 10, u), lean: lerp(-14, 26, u), dx: lerp(-6, 18, u), th: 30, bth: -24 }); d.finP = FPZ.hurt({ lean: -18 - (k < 5 ? 0 : 10) });
        if (k === 5) { const c = finHead(d); finHit(F, a, d, 5, c, 6); SFX.block(); SFX.hit(1.6); popText('طاخ! 🍳', c[0], c[1] - 50, '#ffd34d', 40); finBurst(c[0], c[1], 14, ['#ffd34d', '#ffffff'], 8, 5); }
        finCam(F, (a.x + d.x) / 2, -250, 1.2); return; }
      if (t < 76) { a.finHeld = null; const k = t - 48; a.rageP = k % 9 < 4 ? G2({ ua: 200, fa: 40, lean: -14 }) : G2({ ua: 85, fa: 5, lean: 22, dx: 12 });
        if (k % 9 === 4) { const w = a.toWorld(a.J.fH), c = finChest(d), egg = k === 22; finThrow(F, a, d, { kind: egg ? 'egg' : 'tomato', from: w, to: [c[0], c[1] + rnd(-40, 20)], T: 7, g: 0.3, r: egg ? 14 : 18, vr: f * 0.4, dmg: 3, fx: xy => { if (egg) eggSplat({ x: xy[0], y: xy[1], r: 14 }); else { SFX.splat(); finBurst(xy[0], xy[1], 18, ['#e8231c', '#ff6a50', '#2f8f2a'], 8, 6); } } }); SFX.throw(); }
        d.finP = FPZ.hurt({ lean: -20 }); finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 100) { const u = finSeg(t, 76, 100); a.rageP = FPZ.armsUp; if (t === 76) { SFX.skill(); SFX.whoosh(1); } a.finProp = { k: 'pot', x: d.x, y: lerp(-900, -46, u * u), lid: 1 }; d.finP = FPZ.hurt({ lean: -10 }); finCam(F, (a.x + d.x) / 2, -300, 0.95); return; }
      if (t === 100) { finHit(F, a, d, 8, [d.x, -150], 12); F.shake(30); SFX.thud(); SFX.rock(); dust(d.x, 30); finRing(d.x, -20, '#ffffff', 300, 18); a.finProp.y = -46; return; }
      if (t < 134) { a.rageP = FPZ.point; const P = a.finProp; P.sh = Math.sin(t * 1.3) * (t > 112 ? 6 : 2); if (t % 2 === 0) { FX.push({ t: 'p', x: d.x + rnd(-120, 120), y: -rnd(20, 60), vx: rnd(-1, 1), vy: -rnd(3, 7), life: 24, max: 24, c: t % 4 ? '#ff8a2a' : '#ffd34d', sz: rnd(4, 9) }); FX.push({ t: 'p', x: d.x + rnd(-80, 80), y: -250 - rnd(0, 40), vx: rnd(-1, 1), vy: -rnd(2, 4), life: 30, max: 30, c: 'rgba(240,240,240,0.7)', sz: rnd(8, 16) }); } if (t % 8 === 0) SFX.rattle(); finCam(F, d.x, -230, 1.05); return; }
      if (t === 134) { const c = [d.x, -160]; a.finProp = null; finHit(F, a, d, 24, c, 20, true); finLaunch(d, f * 13, -22); F.shake(46); SFX.thud(); SFX.rock(); SFX.zap();
        for (let i = 0; i < 3; i++) finRing(c[0], c[1], i % 2 ? '#ff8a2a' : '#ffd34d', 220 + i * 140, 18 + i * 6); finBurst(c[0], c[1], 80, ['#ff8a2a', '#ffd34d', '#ff3b30', '#ffffff'], 16, 9);
        spawnProj({ kind: 'pot', noHit: true, owner: a, x: d.x, y: -200, vx: f * 6, vy: -18, g: 0.7, r: 62, vr: f * 0.2, life: 70 }); return; }
      if (t < 172) { a.rageP = Object.assign({}, FPZ.armsUp, { lean: -6 }); finCam(F, lerp(a.x, d.x, 0.5), -230, 1.0); return; }
      return true;
    },
    back(F, a, d, t) { const P = a.finProp; if (P && P.k === 'pot' && t >= 100 && t < 134) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const x = P.x - 120 + i * 60, h = 50 + 30 * Math.sin(t * 0.8 + i); const g = ctx.createLinearGradient(0, 0, 0, -h); g.addColorStop(0, 'rgba(255,120,20,0.9)'); g.addColorStop(1, 'rgba(255,220,80,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 26, 0); ctx.quadraticCurveTo(x, -h * 1.4, x + 26, 0); ctx.fill(); } ctx.restore(); } },
    front(F, a, d, t) { const P = a.finProp;
      if (P && P.k === 'pot' && t >= 100) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const x = P.x - 150 + i * 50, h = 46 + 22 * Math.sin(t * 0.9 + i * 1.3); const g = ctx.createLinearGradient(0, 0, 0, -h); g.addColorStop(0, 'rgba(255,110,20,0.95)'); g.addColorStop(1, 'rgba(255,230,90,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 24, 0); ctx.quadraticCurveTo(x, -h * 1.5, x + 24, 0); ctx.fill(); } ctx.restore(); ctx.fillStyle = '#2b2f36'; ctx.fillRect(P.x - 170, -14, 340, 12); }
      if (P && P.k === 'pot') drawPot(P.x, P.y, 175, 1, P.sh || 0); if (a.finHeld === 'pan') { const w = a.toWorld(a.J.fH); drawPan(w[0], w[1] - 10, -a.facing * 1.1 + Math.sin(t * 0.5) * 0.3, 36); } } },
  // 19 المبرمج — code rain freezes you, lightning strikes, the giant </> slams, then Ctrl+Alt+Delete: a full lightning beam
  { name: 'كنترول ألت ديليت', line: 'ديليت!', col: '#ff2a3a',
    run(F, a, d, t) {
      const f = a.facing; if (t < 150) finHold(d, a.x + f * 300);
      if (t < 14) { a.rageP = FPZ.point; if (t === 2) SFX.zap(); finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 44) { a.rageP = FPZ.armsUp; d.finP = FPZ.hurt({ lean: -6 + Math.sin(t * 2) * 6 }); if (t % 6 === 0) SFX.zap(); finCam(F, d.x, -260, 1.05); return; }
      if (t < 84) { const k = t - 44; a.rageP = k % 10 < 5 ? G2({ ua: 175, fa: 10, bua: 30, bfa: 120, lean: -8 }) : G2({ ua: 120, fa: 20, lean: 6 }); d.finP = FPZ.hurt({ lean: -16 - (k % 10 < 3 ? 10 : 0) });
        if (k % 10 === 0) { finHit(F, a, d, 5, finChest(d), 6); F.shake(14); SFX.zap(); SFX.thud(); finBurst(d.x, -150, 18, ['#ff3040', '#ffffff'], 9, 5); F.fin.bolt = t; }
        finCam(F, d.x, -280, 1.0); return; }
      if (t < 104) { const u = finSeg(t, 84, 104); a.rageP = FPZ.armsUp; F.fin.glyph = { x: d.x, y: lerp(-760, finChest(d)[1], u * u), s: lerp(0.4, 1.6, u) }; if (t === 84) SFX.skill(); finCam(F, d.x, -300, 0.95); return; }
      if (t === 104) { finHit(F, a, d, 8, finChest(d), 12); F.shake(28); SFX.thud(); SFX.rock(); finRing(d.x, -150, '#ff2a3a', 280, 18); F.fin.glyph = null; popText('DELETE', d.x, -420, '#ff3040', 64); return; }
      if (t < 120) { a.rageP = G2({ ua: 60, fa: 70, bua: 56, bfa: 74, lean: 10, dx: 8 }); if (t % 3 === 0) SFX.move(); d.finP = FPZ.hurt({ lean: -24 }); finCam(F, (a.x + d.x) / 2, -230, 1.1); return; }
      if (t < 140) { a.rageP = G2({ ua: 92, fa: 0, lean: 22, dx: 18, th: 34, bth: -30 }); if (t % 3 === 0) { SFX.zap(); F.shake(8); } F.fin.beam = true; finCam(F, (a.x + d.x) / 2, -230, 1.0);
        if (t === 139) { const c = finChest(d); F.fin.beam = false; finHit(F, a, d, 26, c, 20, true); finLaunch(d, f * 16, -20); F.shake(44); SFX.thud(); SFX.rock(); for (let i = 0; i < 3; i++) finRing(c[0], c[1], i % 2 ? '#ff2a3a' : '#ffffff', 240 + i * 140, 18 + i * 6); finBurst(c[0], c[1], 80, ['#ff2a3a', '#ffffff', '#ff8a8a'], 15, 8); }
        return; }
      if (t < 175) { a.rageP = FPZ.point; F.fin.beam = false; finCam(F, lerp(a.x, d.x, 0.5), -220, 1.0); return; }
      return true;
    },
    back(F, a, d, t) {
      if (t >= 14 && t < 110) { ctx.save(); ctx.font = `700 22px ${FE}`; ctx.textAlign = 'center'; ctx.direction = 'ltr'; const ch = '01{}<>/;=()[]#'; for (let i = 0; i < 26; i++) { const x = d.x - 260 + (i * 97) % 520, y = -760 + ((t * (9 + i % 5) + i * 131) % 820); ctx.fillStyle = i % 4 ? 'rgba(255,60,70,0.75)' : 'rgba(255,255,255,0.8)'; for (let k = 0; k < 4; k++) ctx.fillText(ch[(i * 7 + k * 3 + (t >> 2)) % ch.length], x, y - k * 24); } ctx.restore(); }
    },
    front(F, a, d, t) {
      const fn = F.fin; if (!fn) return;
      if (fn.bolt !== undefined && t - fn.bolt < 6) { drawBolt(d.x + Math.sin(fn.bolt) * 60, -900, d.x, -140, 9, fn.bolt); drawBolt(d.x - 40, -900, d.x + 20, -200, 5, fn.bolt + 3); }
      if (fn.glyph) drawCodeGlyph({ x: fn.glyph.x, y: fn.glyph.y, r: 90 * fn.glyph.s, rot: 0 });
      if (fn.beam) { const w = a.toWorld(a.J.fH); for (let i = 0; i < 3; i++) drawBolt(w[0], w[1], d.x + a.facing * 40, finChest(d)[1] + (i - 1) * 30, 10 - i * 2, t + i * 5); }
    } },
  // 20 المروض — the cats scratch, the parrot pecks, the falcon dives, then the whole dog pack runs you over
  { name: 'زحمة الحيوانات', line: 'هجوووم!', col: '#d9a441',
    run(F, a, d, t) {
      const f = a.facing; if (t < 118) finHold(d, a.x + f * 300);
      if (!a.finS || a.finS.fin !== F.fin) a.finS = { fin: F.fin, ax: a.x };
      if (t < 12) { a.rageP = FPZ.point; if (t === 2) SFX.zap(); finCam(F, (a.x + d.x) / 2, -240, 1.05); return; }
      if (t < 40) { a.rageP = G2({ ua: 175, fa: 10, bua: 30, bfa: 120, lean: -8 }); d.finP = FPZ.hurt({ lean: -14 });
        if (t === 14 || t === 26) { const w = a.toWorld(a.J.fH), c = finChest(d); SFX.meow(); finThrow(F, a, d, { kind: 'cat', from: w, to: [c[0], c[1] - 20], T: 8, g: 0.4, r: 26, dmg: 4, extra: { dir: f }, fx: xy => { SFX.hit(1); for (let i = 0; i < 3; i++) FX.push({ t: 'p', x: xy[0] + rnd(-20, 20), y: xy[1] + rnd(-30, 30), vx: rnd(-2, 2), vy: rnd(-2, 2), life: 18, max: 18, c: '#ffffff', sz: 3 }); popText('خرررش!', xy[0], xy[1] - 50, '#ffd34d', 34); } }); }
        finCam(F, (a.x + d.x) / 2, -240, 1.1); return; }
      if (t < 60) { a.rageP = FPZ.point; if (t === 42) { SFX.squawk(); finThrow(F, a, d, { kind: 'parrot', from: [a.x - f * 120, -420], to: finHead(d), T: 12, g: 0, r: 28, dmg: 4, extra: { dir: f }, fx: xy => { SFX.hit(1.2); finBurst(xy[0], xy[1], 14, ['#2a6fd6', '#f5c518', '#2f9a4a'], 7, 6); } }); }
        d.finP = FPZ.hurt({ lean: -20 }); finCam(F, (a.x + d.x) / 2, -260, 1.05); return; }
      if (t < 84) { a.rageP = G2({ ua: 175, fa: 10, bua: 170, bfa: 10, lean: -10 }); if (t === 62) { SFX.squawk(); finThrow(F, a, d, { kind: 'falcon', from: [d.x - f * 360, -900], to: finHead(d), T: 18, g: 0, r: 34, dmg: 6, extra: { dir: f }, fx: xy => { SFX.thud(); F.shake(16); finBurst(xy[0], xy[1], 22, ['#6b4a2c', '#d9c2a0', '#ffffff'], 9, 6); } }); }
        d.finP = FPZ.hurt({ lean: -22 }); finCam(F, d.x, -280, 1.0); return; }
      if (t < 124) { a.rageP = FPZ.point; const S = a.finS; if (t === 84) { SFX.bark(); S.dogs = [{ k: 'golden', t0: 84 }, { k: 'husky', t0: 92 }, { k: 'golden', t0: 100 }]; }
        for (const g of S.dogs) { const u = (t - g.t0) / 18; g.x = S.ax - f * 300 + f * u * 1100; if (Math.abs(g.x - d.x) < 30 && !g.hit) { g.hit = 1; finHit(F, a, d, 5, finChest(d), 8); SFX.bark(); SFX.hit(1.4); F.shake(12); dust(d.x, 14); d.finP = FPZ.hurt({ lean: -34 }); } }
        if (t % 5 === 0) SFX.bark(); finCam(F, d.x, -230, 0.95); return; }
      if (t === 124) { const c = finChest(d); a.finS.dogs = []; a.finS.leap = 124; finHit(F, a, d, 21, c, 18, true); finLaunch(d, f * 15, -21); F.shake(40); SFX.bark(); SFX.thud(); for (let i = 0; i < 3; i++) finRing(c[0], c[1], i % 2 ? '#d9a441' : '#ffffff', 220 + i * 140, 18 + i * 6); finBurst(c[0], c[1], 60, ['#e6b056', '#ffffff', '#ffd34d'], 14, 8); return; }
      if (t < 160) { a.rageP = Object.assign({}, FPZ.armsUp); finCam(F, lerp(a.x, d.x, 0.5), -220, 1.0); return; }
      return true;
    },
    front(F, a, d, t) { const S = a.finS; if (!S) return;
      if (S.dogs) for (const g of S.dogs) if (g.x !== undefined && t >= g.t0) { drawDog(g.x, 0, a.facing, t, 1.25, g.k, Math.abs(g.x - d.x) < 120); if (t % 3 === 0) dust(g.x - a.facing * 60, 2, -a.facing); }
      if (S.leap && t >= S.leap && t < S.leap + 24) { const u = (t - S.leap) / 24; drawDog(lerp(d.x - a.facing * 80, d.x + a.facing * 260, u), -Math.sin(u * Math.PI) * 220, a.facing, t, 1.5, 'golden', true); }
    } },
  // 21 الصياد — hooks you, reels you in, grouper slaps, the net, then a giant shark leaps out of the floor
  { name: 'صيد العمر', line: 'صيد العمر!', col: '#2f86d6',
    run(F, a, d, t) {
      const f = a.facing; if (!a.finS || a.finS.fin !== F.fin) a.finS = { fin: F.fin, d0: clamp(a.x + f * 520, -STAGE + 60, STAGE - 60) };
      const S = a.finS;
      if (t < 12) { finHold(d, S.d0); a.rageP = G2({ ua: 200, fa: 40, lean: -14 }); finCam(F, (a.x + d.x) / 2, -240, 1.0); return; }
      if (t < 26) { finHold(d, S.d0); a.rageP = G2({ ua: 90, fa: 10, lean: 18, dx: 10 }); S.line = 1; S.hk = lerp(a.toWorld(a.J.fH)[0], d.x, finSeg(t, 12, 24)); if (t === 12) { SFX.whoosh(1); SFX.reel(); } if (t === 24) { finHit(F, a, d, 3, finHead(d), 4); popText('علق!', d.x, -440, '#7fd6ff', 40); } finCam(F, (a.x + d.x) / 2, -240, 0.95); return; }
      if (t < 54) { const u = finSeg(t, 26, 54); finHold(d, lerp(S.d0, a.x + f * 170, ease(u))); S.hk = d.x; a.rageP = G2({ ua: 70, fa: 90, bua: 60, bfa: 100, lean: -18, dx: -6 }); d.finP = FPZ.hurt({ lean: 26 }); if (t % 4 === 0) SFX.reel(); finCam(F, (a.x + d.x) / 2, -240, 1.0); return; }
      S.line = 0; finHold(d, a.x + f * 170);
      if (t < 90) { const k = (t - 54) % 12, u = k < 5 ? k / 5 : 1 - (k - 5) / 7; S.fish = 1; a.rageP = G2({ ua: lerp(205, 80, u), fa: lerp(50, 0, u), bua: lerp(200, 84, u), bfa: lerp(50, 6, u), lean: lerp(-16, 28, u), dx: lerp(-8, 20, u), th: 40, bth: -34 });
        if (k === 5) { const c = finHead(d); finHit(F, a, d, 5, c, 7); SFX.splat(); SFX.hit(1.6); splash(c[0], 10); popText('طراخ! 🐟', c[0], c[1] - 50, '#ffd34d', 38); d.finP = FPZ.hurt({ lean: -34 }); }
        finCam(F, (a.x + d.x) / 2, -250, 1.15); return; }
      S.fish = 0;
      if (t < 106) { const u = finSeg(t, 90, 106); S.net = { y: lerp(-760, -200, u * u), r: lerp(60, 170, u) }; a.rageP = FPZ.armsUp; finCam(F, d.x, -280, 1.0); return; }
      if (t === 106) { finHit(F, a, d, 6, finChest(d), 10); SFX.thud(); F.shake(16); d.finP = FPZ.hurt({ lean: -10 }); return; }
      if (t < 116) { a.rageP = FPZ.point; if (t === 110) splash(d.x, 40); finCam(F, d.x, -260, 0.95); return; }
      if (t < 136) { const u = finSeg(t, 116, 136); S.net = null; S.shark = { y: lerp(120, -330, Math.sin(u * Math.PI * 0.62)), r: lerp(-1.1, -0.6, u) }; if (t === 116) { SFX.splash(); F.shake(22); } if (t % 3 === 0) splash(d.x, 6); finCam(F, d.x, -300, 0.9);
        if (t === 128) { const c = finChest(d); finHit(F, a, d, 28, c, 18, true); finLaunch(d, f * 10, -26); F.shake(44); SFX.thud(); SFX.rock(); finBurst(c[0], c[1], 60, ['#7fd6ff', '#ffffff', '#2f86d6'], 15, 8); for (let i = 0; i < 3; i++) finRing(c[0], c[1], i % 2 ? '#2f86d6' : '#ffffff', 220 + i * 140, 18 + i * 6); }
        return; }
      S.shark = null;
      if (t < 168) { a.rageP = FPZ.armsUp; finCam(F, lerp(a.x, d.x, 0.5), -220, 1.0); return; }
      return true;
    },
    front(F, a, d, t) { const S = a.finS; if (!S) return; const w = a.toWorld(a.J.fH);
      if (S.line) { const hx = S.hk, hy = t < 24 ? -300 : finHead(d)[1]; ctx.save(); ctx.strokeStyle = 'rgba(240,240,240,0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w[0], w[1] - 60); ctx.quadraticCurveTo((w[0] + hx) / 2, Math.max(w[1], hy) + 40, hx, hy); ctx.stroke(); ctx.restore(); drawHook(hx, hy); ctx.strokeStyle = '#2b2f36'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w[0], w[1]); ctx.lineTo(w[0] - a.facing * 20, w[1] - 80); ctx.stroke(); }
      if (S.fish) drawGrouper(w[0] + a.facing * 60, w[1] - 10, a.facing > 0 ? -0.3 : Math.PI + 0.3, 170);
      if (S.net) drawNet(d.x, S.net.y, S.net.r);
      if (S.shark) drawShark(d.x, S.shark.y, a.facing > 0 ? S.shark.r : Math.PI - S.shark.r, 1.4);
    } },
  { name: 'تصفية الحساب', line: 'آخر طلقة… لك!', col: '#c8102e',
    run(F, a, d, t) {
      const f = a.facing; if (!a.finS || a.finS.fin !== F.fin) a.finS = { fin: F.fin, d0: clamp(a.x + f * 430, -STAGE + 60, STAGE - 60), tr: null, ret: 0 };
      const S = a.finS; finHold(d, S.d0); const shot = (dmg, big) => { const m = gunMuzzle(a), c = big ? finHead(d) : t % 12 < 6 ? finChest(d) : finHead(d); S.tr = { t, m, c: [c[0] + rnd(-12, 12), c[1] + rnd(-16, 16)], big }; big ? SFX.bigGun() : SFX.gun(); finHit(F, a, d, dmg, S.tr.c, big ? 18 : 3, big); d.finP = FPZ.hurt({ lean: big ? -30 : (t % 2 ? 18 : -14) }); finBurst(S.tr.c[0], S.tr.c[1], big ? 50 : 8, ['#ffffff', '#ffd34d', '#ff3a2a'], big ? 15 : 6, big ? 8 : 4); };
      if (t < 16) { a.rageP = FPZ.aim; S.ret = { x: d.x, y: finChest(d)[1], s: lerp(140, 60, finSeg(t, 0, 16)), a: 1 }; if (t === 2) SFX.click(); finCam(F, (a.x + d.x) / 2, -250, 1.0); return; }
      if (t < 64) { a.rageP = G2({ ...GAIM, ua: (t - 16) % 6 < 2 ? 100 : 90, lean: (t - 16) % 6 < 2 ? 0 : 6 }); S.ret.y = finChest(d)[1]; if ((t - 16) % 6 === 0) shot(3); finCam(F, (a.x + d.x) / 2, -250, 1.08); return; }
      S.ret = 0;
      if (t < 84) { a.rageP = G2({ ua: 30, fa: 120, bua: 60, bfa: 120, lean: -4 }); if (t === 64) { popText('ريلود…', a.x, -470, '#ffd34d', 38); SFX.click(); } if (t === 76) SFX.click(); d.finP = FPZ.hurt({ lean: 10 }); finCam(F, a.x + f * 80, -260, 1.25); return; }
      if (t < 112) { a.rageP = FPZ.aim; const h = finHead(d); S.ret = { x: h[0], y: h[1], s: lerp(110, 34, finSeg(t, 84, 108)), a: 1 }; if (t === 86) popText('لا تتحرك…', d.x, -480, '#ff3a2a', 40); finCam(F, lerp(a.x, d.x, finSeg(t, 84, 110) * 0.8), -300, lerp(1.0, 1.5, finSeg(t, 84, 110))); return; }
      if (t === 112) { S.ret = 0; shot(30, 1); F.shake(40); const c = S.tr.c; for (let i = 0; i < 3; i++) finRing(c[0], c[1], i % 2 ? '#ff3a2a' : '#ffffff', 200 + i * 130, 18 + i * 6); finLaunch(d, f * 12, -24); popText('بانق! 💥', c[0], c[1] - 70, '#ff3a2a', 64); return; }
      if (t < 122) { a.rageP = G2({ ...GAIM, ua: t < 116 ? 112 : 96, lean: t < 116 ? -8 : 0, dx: t < 116 ? -12 : -6 }); finCam(F, lerp(a.x, d.x, 0.5), -260, 1.05); return; }
      if (t < 160) { a.rageP = G2({ ua: 140, fa: 70, bua: 30, bfa: 10, lean: -6 }); S.smoke = 1; if (t % 3 === 0) { const m = gunMuzzle(a); FX.push({ t: 'p', x: m[0], y: m[1], vx: rnd(-0.6, 0.6), vy: -rnd(1.5, 3), life: 30, max: 30, c: 'rgba(200,200,200,0.5)', sz: rnd(5, 9) }); } finCam(F, lerp(a.x, d.x, 0.35), -240, 1.1); return; }
      S.smoke = 0; return true;
    },
    front(F, a, d, t) { const S = a.finS; if (!S) return;
      if (S.ret) finReticle(S.ret.x, S.ret.y, S.ret.s, S.ret.a);
      if (S.tr && t - S.tr.t < 4) { const k = 1 - (t - S.tr.t) / 4, [mx, my] = gunMuzzle(a), [cx, cy] = S.tr.c; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k; ctx.strokeStyle = '#ffe7a0'; ctx.lineWidth = S.tr.big ? 10 : 4; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(cx, cy); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = S.tr.big ? 3 : 1.5; ctx.stroke(); ctx.restore(); drawMuzzleFlash(mx, my, S.tr.big ? 60 : 34, Math.sign(cx - mx) || 1, k); }
    } },
];

// ---- ملالي: voice, persona and his finisher «ابتلاع الظلام» (darkness swallows the stage, thorns lift you, a black sun falls with him)
PERSONA[MALALI] = { vo: 'deep', intro: ['الظلام… جا يسلّم عليك.'], skill: ['ظلام!'], win: ['الظلام… ما ينهزم.'], st: { lean: -4, th: 8, bth: -8 }, br: 0.04 };
VOICE_RATE[MALALI] = 0.8; if (window.VOICE_TTS) window.VOICE_TTS[MALALI] = [0.5, 0.86];
function finTentacle(x0, x1, y1, t, i, k) { const sw = Math.sin(t * 0.25 + i * 1.7) * 30, mx = lerp(x0, x1, 0.5) + sw, my = y1 * 0.55;
  ctx.save(); ctx.lineCap = 'round'; const g = ctx.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, '#05010a'); g.addColorStop(1, '#6a1ab0'); ctx.strokeStyle = g;
  ctx.lineWidth = 26 * k; ctx.beginPath(); ctx.moveTo(x0, 4); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(208,112,255,0.55)'; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(x0, 4); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke(); ctx.restore(); }
FIN[MALALI] = { name: 'ابتلاع الظلام', line: 'الظلام… جا ياخذك.', col: '#b030ff',
  run(F, a, d, t) {
    const f = a.facing; if (!a.finS || a.finS.fin !== F.fin) a.finS = { fin: F.fin, x0: clamp(a.x + f * 300, -STAGE + 90, STAGE - 90) }; const S = a.finS;
    if (t < 24) { finHold(d, S.x0); a.rageP = FPZ.armsUp; d.finP = FPZ.hurt({ lean: -10 }); if (t === 2) { SFX.rage(); F.shake(10); } finCam(F, (a.x + d.x) / 2, -260, 1.0); return; }
    if (t < 70) { const u = finSeg(t, 24, 60); finHold(d, S.x0, -300 * easeOut(u)); a.rageP = G2({ ua: 120, fa: 40, bua: 116, bfa: 44, lean: -6 }); d.finP = FPZ.hurt({ lean: 18 * Math.sin(t * 0.5), r: -6 });
      if (t === 26) { SFX.thud(); F.shake(16); finBurst(S.x0, -10, 30, VOIDC, 10, 8); } if (t % 9 === 0) finHit(F, a, d, 3, finChest(d), 3); finCam(F, (a.x + S.x0) / 2, -330, 1.0); return; }
    if (t < 104) { finHold(d, S.x0, -300); a.rageP = G2({ ua: 200, fa: 20, bua: 196, bfa: 24, lean: -12 }); d.finP = FPZ.hurt({ lean: -24 });
      if (t === 72) { SFX.zap(); popText('الظلام…', a.x, -520, '#e0b0ff', 42); } if (t === 94) { SFX.whoosh(1); finBurst(a.x, -160, 30, VOIDC, 8, 8); } if (t >= 96) { a.x = S.x0 - f * 10; a.y = -560; }
      finCam(F, lerp(a.x, S.x0, 0.5), -380, lerp(1.0, 0.92, finSeg(t, 70, 104))); return; }
    if (t < 118) { const u = finSeg(t, 104, 118); a.x = S.x0 - f * 10; a.y = lerp(-560, -300, u); a.rageP = G2({ ua: 60, fa: 10, bua: 56, bfa: 14, lean: 30, th: 60, sh: 80 }); finHold(d, S.x0, lerp(-300, 0, u * u)); d.finP = FPZ.hurt({ lean: 30 }); finCam(F, S.x0, -300, 1.1); return; }
    if (t === 118) { a.y = 0; a.x = clamp(S.x0 - f * 90, -STAGE + 40, STAGE - 40); finHit(F, a, d, 28, finChest(d), 18, true); finLaunch(d, f * 8, -20); SFX.thud(); SFX.rock(); F.shake(40); dust(S.x0, 46);
      for (let i = 0; i < 3; i++) finRing(S.x0, -20, i % 2 ? '#e0b0ff' : '#b030ff', 260 + i * 130, 20 + i * 6); finBurst(S.x0, -60, 60, VOIDC, 16, 9); popText('ابتلاع الظلام!', S.x0, -480, '#d070ff', 56); return; }
    if (t < 160) { a.y = 0; a.rageP = Object.assign({}, CROUCH, { lean: 30, ua: 60, fa: 10 }); finCam(F, S.x0, -220, 1.12); return; }
    return true;
  },
  back(F, a, d, t) { const S = a.finS; if (!S) return;
    const k = Math.min(1, t / 20) * (t > 140 ? Math.max(0, (160 - t) / 20) : 1); ctx.save(); ctx.fillStyle = `rgba(8,0,16,${0.6 * k})`; ctx.fillRect(-4000, -4000, 8000, 8000); ctx.restore();
    if (t >= 24 && t < 118) { const k2 = Math.min(1, (t - 24) / 10), hy = d.hipY - 30; for (let i = 0; i < 4; i++) finTentacle(S.x0 + (i - 1.5) * 90, d.x + (i - 1.5) * 18, hy, t, i, k2);
      ctx.save(); ctx.fillStyle = '#05010a'; ctx.beginPath(); ctx.ellipse(S.x0, 4, 210 * k2, 30 * k2, 0, 0, 7); ctx.fill(); ctx.restore(); } },
  front(F, a, d, t) { if (t < 70 || t >= 119) return; const w = a.J ? a.toWorld(a.J.fH) : [a.x, a.hipY - 200], r = 30 + 60 * finSeg(t, 70, 100), x = t >= 96 ? a.x : w[0], y = t >= 96 ? a.hipY - 140 : w[1] - 60;
    drawVoid({ x, y, r: r / 1.5, t: 30 + t, vx: 0 }); }
};

// ---- ناصر وحمد: الصوت، الشخصية، والقاضيات
PERSONA[NASSER] = { vo: 'roar', intro: ['الشارع… كله لي.', 'جيت أخلّص اللي ما خلّصه ملالي.'], skill: ['طير!', 'هوم رن!'], win: ['قلت لك… الشارع لي.'], st: { lean: -6, th: 10, bth: -10 }, br: 0.03 };
PERSONA[HAMAD] = { vo: 'laugh', intro: ['كل شي له سعر… وأنت رخيص.', 'الفلوس تتكلم… وأنا أسمع.'], skill: ['كم تبي؟', 'شم… وطيح.'], win: ['اشتريتك… وبعتك.'], st: { lean: -8, th: 8, bth: -8 }, br: 0.05 };
VOICE_RATE[NASSER] = 0.82; VOICE_RATE[HAMAD] = 0.86; if (window.VOICE_TTS) { window.VOICE_TTS[NASSER] = [0.55, 0.88]; window.VOICE_TTS[HAMAD] = [0.62, 0.9]; }
function finCrack(x, y, k) { ctx.save(); ctx.globalAlpha *= k; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 11; i++) { let a = i / 11 * Math.PI * 2 + 0.3, r = 0, px = x, py = y; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 5; j++) { r += 50 + ((i * 37 + j * 13) % 40); a += (((i * 7 + j * 3) % 5) - 2) * 0.09; px = x + Math.cos(a) * r; py = y + Math.sin(a) * r; ctx.lineTo(px, py); } ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; for (const rr of [60, 130]) { ctx.beginPath(); for (let i = 0; i <= 11; i++) { const a = i / 11 * Math.PI * 2 + 0.3, q = rr + ((i * 23) % 30); i ? ctx.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : ctx.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } ctx.stroke(); }
  ctx.restore(); }
// الهوم رن الأخير — four bat blows, the wrench, then the swing of his life
FIN[NASSER] = { name: 'الهوم رن الأخير', line: 'هذي… آخر ضربة بحياتك.', col: '#e0102a',
  run(F, a, d, t) {
    const f = a.facing; if (!a.finS || a.finS.fin !== F.fin) a.finS = { fin: F.fin, x0: clamp(a.x + f * 215, -STAGE + 80, STAGE - 80) }; const S = a.finS;
    if (t < 20) { finHold(d, S.x0); a.rageP = G2(BATUP); d.finP = FPZ.hurt({ lean: -8 }); if (t === 2) { SFX.rage(); F.shake(8); } finCam(F, (a.x + d.x) / 2, -250, 1.05); return; }
    if (t < 78) { finHold(d, S.x0); const k = t - 20, ph = (k / 14) | 0, u = (k % 14) / 14; a.rageP = G2(ph % 2 ? { ...BATHIT, ua: lerp(40, 160, u), fa: lerp(0, 70, u), lean: 16 } : { ...BATHIT, ua: lerp(170, 60, u), fa: lerp(80, 0, u), lean: 26 });
      d.finP = FPZ.hurt({ lean: ph % 2 ? 22 : -22, r: ph % 2 ? 4 : -4 }); if (k % 14 === 7) { const b = batLine(a); finHit(F, a, d, 5, b.tip, 4); SFX.thud(); F.shake(12); finBurst(b.tip[0], b.tip[1], 14, NSC, 8, 6); }
      finCam(F, (a.x + d.x) / 2, -260, 1.18); return; }
    if (t < 100) { finHold(d, S.x0); a.rageP = G2({ bua: t < 88 ? 200 : 86, bfa: t < 88 ? 60 : 4, lean: t < 88 ? -12 : 24, dx: t < 88 ? 0 : 12, ...(t < 88 ? {} : { ua: 40, fa: 120 }) }); d.finP = FPZ.hurt({ lean: 26 });
      if (t === 90) { finHit(F, a, d, 6, finHead(d), 6); SFX.thud(); popText('المفتاح! 🔧', d.x, -470, '#ff5040', 40); F.shake(14); } finCam(F, (a.x + d.x) / 2, -270, 1.12); return; }
    if (t < 126) { finHold(d, S.x0); a.rageP = G2({ ...BATUP, ua: 210, fa: 60, lean: -20, th: 34, bth: -30, dx: -10 }); d.finP = FPZ.hurt({ lean: -10 });
      if (t === 102) { SFX.rage(); popText('آخر ضربة…', a.x, -500, '#ffd0c0', 40); } finCam(F, lerp(a.x, d.x, 0.4), -280, lerp(1.12, 1.32, finSeg(t, 100, 126))); return; }
    if (t === 126) { a.rageP = G2({ ...BATHIT, ua: 60, fa: 0, lean: 32 }); const c = finChest(d); finHit(F, a, d, 26, c, 18, true); finLaunch(d, f * 17, -26); S.cr = { x: c[0], y: c[1], t };
      SFX.thud(); SFX.rock(); F.shake(44); for (let i = 0; i < 3; i++) finRing(c[0], c[1], i % 2 ? '#ffffff' : '#e0102a', 240 + i * 140, 18 + i * 6); finBurst(c[0], c[1], 60, NSC, 16, 8); popText('هوم رن!! ⚾', c[0], c[1] - 90, '#ff3a2a', 66); return; }
    if (t < 172) { a.rageP = G2({ ...BATHIT, ua: lerp(60, 20, finSeg(t, 126, 140)), fa: 0, lean: 30, bua: 30, bfa: 120 }); finCam(F, lerp(a.x, d.x, 0.5), -280, 1.0); return; }
    return true;
  },
  front(F, a, d, t) { const S = a.finS; if (!S || !S.cr) return; const k = Math.max(0, 1 - (t - S.cr.t) / 46); if (k > 0) finCrack(S.cr.x, S.cr.y, k); } };
// صفقة العمر — the briefcase opens, money lifts you, the perfume knocks you dizzy, the briefcase finishes it
function drawMoneyStorm(x, y, t, k) { for (let i = 0; i < 16; i++) { const a = t * 0.18 + i * 0.39, r = 70 + (i % 4) * 26, h = ((t * 4 + i * 37) % 300); drawCash({ x: x + Math.cos(a) * r, y: y - h + 120, rot: a * 2, t: t + i }); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 10, x, y, 200); g.addColorStop(0, `rgba(255,211,77,${0.25 * k})`); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 200, 0, 7); ctx.fill(); ctx.restore(); }
FIN[HAMAD] = { name: 'صفقة العمر', line: 'وقّع هني… بدمك.', col: '#e8b923',
  run(F, a, d, t) {
    const f = a.facing; if (!a.finS || a.finS.fin !== F.fin) a.finS = { fin: F.fin, x0: clamp(a.x + f * 240, -STAGE + 80, STAGE - 80) }; const S = a.finS;
    if (t < 22) { finHold(d, S.x0); a.caseOpen = t > 10; a.rageP = G2({ bua: 80, bfa: 10, lean: 10, dx: 6 }); d.finP = FPZ.hurt({ lean: -8 }); if (t === 10) { SFX.click(); SFX.zap(); popText('كم تبي؟', a.x, -500, '#ffd34d', 40); } finCam(F, (a.x + d.x) / 2, -260, 1.0); return; }
    if (t < 74) { const u = finSeg(t, 22, 60); finHold(d, S.x0, -220 * easeOut(u)); a.rageP = G2({ bua: 120, bfa: 10, ua: 150, fa: 40, lean: -8 }); d.finP = FPZ.hurt({ lean: 16 * Math.sin(t * 0.4), r: -8 });
      if (t % 10 === 0) { finHit(F, a, d, 3, finChest(d), 3); SFX.throw(); } finCam(F, (a.x + S.x0) / 2, -330, 1.0); return; }
    if (t < 100) { finHold(d, S.x0, -220); a.caseOpen = false; a.rageP = G2({ ua: 92, fa: 8, lean: 14, dx: 10 });
      if (t === 76) { SFX.whoosh(1); popText('شم… 💫', d.x, -560, '#f7c8ff', 44); } if (t % 3 === 0) { const h = a.toWorld(a.J.fH); FX.push({ t: 'p', x: h[0], y: h[1], vx: (d.x - h[0]) / 18 + rnd(-1, 1), vy: (d.hipY - 260 - h[1]) / 18 + rnd(-1, 1), life: 20, max: 20, c: PERFC[t % 4], sz: rnd(4, 8) }); }
      if (t === 90) finHit(F, a, d, 5, finHead(d), 6); d.finP = FPZ.hurt({ lean: 24 * Math.sin(t * 0.3), r: 10 * Math.sin(t * 0.2) }); finCam(F, (a.x + S.x0) / 2, -340, 1.05); return; }
    if (t < 116) { const u = finSeg(t, 100, 116); finHold(d, S.x0, lerp(-220, 0, u * u)); a.x = lerp(a.x, S.x0 - f * 150, 0.2); a.rageP = G2({ bua: -40, bfa: 20, lean: -14, th: 30, bth: -24 }); d.finP = FPZ.hurt({ lean: 30 }); finCam(F, S.x0, -280, 1.1); return; }
    if (t === 116) { a.rageP = G2({ bua: 120, bfa: 10, lean: 26, dx: 16, th: 40, bth: -30 }); const c = finChest(d); finHit(F, a, d, 26, c, 18, true); finLaunch(d, f * 15, -22); SFX.thud(); SFX.rock(); F.shake(40);
      for (let i = 0; i < 3; i++) finRing(c[0], c[1], i % 2 ? '#fff3b0' : '#e8b923', 240 + i * 130, 18 + i * 6); finBurst(c[0], c[1], 50, GOLDC, 14, 8); popText('صفقة العمر! 💰', c[0], c[1] - 90, '#ffd34d', 60); return; }
    if (t < 160) { a.rageP = G2({ bua: 140, bfa: 10, lean: 20, ua: 160, fa: 140 }); finCam(F, lerp(a.x, d.x, 0.5), -260, 1.02); return; }
    return true;
  },
  back(F, a, d, t) { const S = a.finS; if (!S || t < 22 || t >= 104) return; drawMoneyStorm(S.x0, -120, t, Math.min(1, (t - 22) / 10) * (t > 94 ? (104 - t) / 10 : 1)); } };
window.__nh = { NASSER, HAMAD, MV, SKILL_IDS, SKILL2, COMBOS, CHARS };

// ================= FIGHT =================
class Fight {
  constructor(c1, c2, mode) {
    this.mode = mode; this.cis = [c1, c2]; this.stage = G.stageId || 'arena';
    this.pads = [pads[0], mode === 'cpu' || mode === 'train' ? new CPUPad(1) : pads[1]]; this.train = mode === 'train'; // training: slot 1 is a still dummy (its CPUPad has no target, so it never presses anything)
    this.f = [new Fighter(0, c1, this.pads[0]), new Fighter(1, c2, this.pads[1])];
    this.f.forEach((f, s) => { const O = outfitOf(f.ci, G.sel && G.sel.outfit && G.sel.outfit[s]); if (O && O.id) { f.outfit = O.id; f.hat = O.hat; f.R = rigFor(f.ci, O.id); } });
    const EQ = G.fightEqFor ? G.fightEqFor() : [null, null]; this.f.forEach((f, s) => { const e = eqClean(EQ[s]); if (e) { f.eq = e; f.R = clothRig(f.R, 'c' + f.ci + (f.outfit || ''), e); } });
    if (mode === 'cpu') { this.pads[1].me = this.f[1]; this.pads[1].op = this.f[0]; }
    this.wins = [0, 0]; this.round = 1; this.cam = { x: 0, y: 0, z: 1, sh: 0, yaw: 0 };
    this.freeze = 0; this.slow = 0; this.msgs = []; this.zoomT = 0; this.dim = 0; this.paused = false; this.pidx = 0;
    this.startRound();
  }
  startRound() {
    for (const f of this.f) f.reset();
    this.fin = null; this.cutin = null; this.timer = window.__shortRound ? 900 : 60 * 60; this.phase = 'intro'; this.pt = 0; this.koBy = null; this.winner = null; this.slow = 0; this.freeze = 0; this.dim = 0;
    FX.length = 0; this.msgs = []; this.proj = []; this.skBanner = null;
    const final = this.wins[0] === 1 && this.wins[1] === 1;
    this.msg(final ? 'FINAL ROUND' : `ROUND ${this.round}`, 'en', 80, '#ffffff');
    setTimeout(() => say(final ? 'Final round' : `Round ${this.round}`), 150);
    if (Music) Music.intensity = 1;
  }
  msg(text, kind, dur, color, sub) { this.msgs = [{ text, kind, dur, t: 0, color, sub }]; }
  shake(n) { this.cam.sh = Math.max(this.cam.sh, n); }
  rageFlash(f) { const FN = FIN[f.ci] || FIN[0]; this.freeze = 30; this.dim = 0; this.zoomT = 70; this.zoomOn = f; SFX.rage(); this.banner = null; this.cutin = { f, t: 0, dur: 64, name: FN.name, col: FN.col }; rumble(f.slot, 0.4, 0.9, 500); f.talk('rage', FN.line); if (f.bubble) f.bubble.dur = 70; }
  drawCutin() {
    const c = this.cutin; if (!c) return; const t = c.t, D = c.dur; if (t > D) { this.cutin = null; return; }
    const inn = easeOut(Math.min(1, t / 9)), out = t > D - 10 ? ease((t - (D - 10)) / 10) : 0, side = c.f.slot === 0 ? 1 : -1;
    ctx.save(); ctx.translate((1 - inn) * VW * side - out * VW * side, 0);
    ctx.save(); ctx.translate(VW / 2, VH / 2); ctx.rotate(-0.1);
    ctx.fillStyle = 'rgba(4,3,10,0.9)'; ctx.fillRect(-VW, -150, VW * 2, 300); ctx.fillStyle = c.col; ctx.fillRect(-VW, -156, VW * 2, 8); ctx.fillRect(-VW, 148, VW * 2, 8);
    ctx.globalAlpha = 0.22; for (let i = 0; i < 15; i++) { const y = -136 + i * 19, x = ((i * 173 + t * 46 * side) % 1700 + 1700) % 1700 - 850; ctx.fillRect(x, y, 240 + (i % 3) * 80, 3); } ctx.globalAlpha = 1;
    ctx.restore();
    const im = IMG['face' + (c.f.ci + 1)];
    if (im) { const h = 330, w = im.width * h / im.height, fx = side > 0 ? 270 : VW - 270; ctx.save(); ctx.translate(fx, VH / 2); ctx.rotate(-0.1); ctx.beginPath(); ctx.rect(-w / 2 - 30, -146, w + 60, 292); ctx.clip(); ctx.rotate(0.1); ctx.drawImage(im, -w / 2, -h / 2 - 6, w, h);
      const g = ctx.createLinearGradient(0, -150, 0, 150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = g; ctx.fillRect(-w, -160, w * 2, 320); ctx.restore(); }
    const tx = side > 0 ? VW - 120 : 120, al = side > 0 ? 'right' : 'left';
    txt('💥 القاضية', tx, VH / 2 - 78, { size: 40, weight: 900, color: c.col, align: al, stroke: '#000', sw: 6 });
    txt(c.name, tx, VH / 2 + 6, { size: c.name.length > 14 ? 66 : 82, weight: 900, color: '#fff', align: al, stroke: '#000', sw: 10, glow: c.col, glowBlur: 30 });
    txt(c.f.C.name, tx, VH / 2 + 84, { size: 30, weight: 800, color: 'rgba(255,255,255,0.75)', align: al, stroke: '#000', sw: 4 });
    ctx.restore();
    if (t < 5) { ctx.fillStyle = `rgba(255,255,255,${(5 - t) / 5 * 0.75})`; ctx.fillRect(0, 0, VW, VH); }
  }
  drawFinOverlay() {
    const F0 = this.fin; if (!F0) return; const FN = FIN[F0.ci] || FIN[0], lb = Math.min(1, F0.t / 10), h = 68 * lb;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, h); ctx.fillRect(0, VH - h, VW, h);
    ctx.fillStyle = FN.col; ctx.fillRect(0, h - 3, VW, 3 * lb); ctx.fillRect(0, VH - h, VW, 3 * lb);
    if (F0.t < 110) { const al = Math.min(1, F0.t / 8, (110 - F0.t) / 12); txt('« ' + FN.line + ' »', VW / 2, VH - 34, { size: 30, weight: 800, color: '#fff', alpha: al, stroke: '#000', sw: 4 }); }
    if (lb >= 1) { const side = F0.a.slot === 0; txt('💥 ' + FN.name, side ? VW - 40 : 40, VH - 34, { size: 26, weight: 900, color: '#fff', align: side ? 'right' : 'left', glow: FN.col, glowBlur: 16 }); txt(F0.a.C.name, side ? 40 : VW - 40, 34, { size: 24, weight: 800, color: FN.col, align: side ? 'left' : 'right' }); }
  }
  update() {
    if (this.paused) { this.pauseInput(); return; }
    if (anyP('Escape', 'KeyP', 'GPStart')) { this.paused = true; this.pidx = 0; SFX.move(); return; }
    this.pt++;
    for (const m of this.msgs) m.t++;
    if (this.banner) this.banner.t++;
    if (this.cutin) this.cutin.t++;
    if (this.skBanner) { this.skBanner.t++; if (this.skBanner.t > 70) this.skBanner = null; }
    this.msgs = this.msgs.filter(m => m.t < m.dur);
    // phases
    if (this.phase === 'intro') {
      for (const f of this.f) { f.readInput(); f.think(); f.physics(); f.animate(); }
      if (this.pt === 12 && this.round === 1) this.f[0].talk('intro'); if (this.pt === 44 && this.round === 1) this.f[1].talk('intro');
      if (this.pt === 80) { this.msg('FIGHT!', 'en', 50, '#ffd34d'); say('Fight!'); }
      if (this.pt >= 105) { this.phase = 'fight'; for (const f of this.f) f.setState('idle'); }
      this.camera(); updFX(); return;
    }
    if (this.slow > 0) { this.slow--; if (this.slow % 3 !== 0) { this.camera(); return; } }
    if (this.freeze > 0) { this.freeze--; for (const f of this.f) { if (f.shakeT > 0) f.shakeT--; if (f.flash > 0) f.flash--; if (this.phase === 'fight') f.readInput(true); } this.camera(); updFX(); return; }
    if (this.dim > 0) this.dim--;
    if (this.zoomT > 0) this.zoomT--;
    const [a, b] = this.f;
    if (this.phase === 'fight') {
      if (this.timer > 0 && !this.zoomT) { this.timer--; if (this.timer === 0) this.timeUp(); }
    }
    a.readInput(); b.readInput();
    if (this.phase !== 'fight') { for (const f of this.f) { f.in = { h: {}, p: {} }; f.buf = null; } }
    // rage startup armor/freeze opponent during rage flash
    a.think(b); b.think(a);
    if (this.fin && this.fin.a.state !== 'rageSeq') { finEnd(this.fin.a, this.fin.d); this.fin = null; this.zoomT = 0; } // safety: never leave a finisher half-open
    a.physics(); b.physics();
    this.pushApart(); this.faceCheck();
    if (a.state !== 'side' && b.state !== 'side') {
      const dist = Math.max(90, Math.abs(b.x - a.x)), sg = Math.sign(b.x - a.x) || 1, r0 = b.z - a.z;
      a.z *= 0.9; b.z *= 0.9; if (Math.abs(a.z) < 0.5) a.z = 0; if (Math.abs(b.z) < 0.5) b.z = 0;
      this.cam.yaw += (Math.atan2(r0, dist) - Math.atan2(b.z - a.z, dist)) * sg;
    }
    a.animate(); b.animate();
    // hits
    const h1 = this.check(a, b), h2 = this.check(b, a);
    if (h1) this.resolveHit(a, b, h1);
    if (h2) this.resolveHit(b, a, h2);
    updProj(this);
    if (this.sagaTick) this.sagaTick(this);
    if (this.phase === 'fight') for (const f of this.f) { if (f.sk < SKMAX && !(f.state === 'attack' && f.mv && f.mv.skill)) { f.sk++; if (f.sk === SKMAX && !f.pad.cpu) SFX.ready(); } }
    for (const f of this.f) { if (f.trailT > 0) f.trailT--; else f.trailHp = Math.max(f.hp, f.trailHp - f.maxHp * 0.006); }
    if (this.train) this.trainStep();
    updFX();
    if (this.phase === 'ko') this.koStep();
    if (this.phase === 'end') this.endStep();
    this.camera();
  }
  pauseInput() {
    const up = pads[0].p.up || pads[1].p.up, dn = pads[0].p.down || pads[1].p.down;
    if (this.showSet) { if (updSettings()) this.showSet = false; return; }
    if (this.showList) { const P0 = pads[0].p, P1 = pads[1].p; if (P0.left || P0.right || P1.left || P1.right || (G.tap && G.tap[1] < 118)) { this.listPage = 1 - (this.listPage || 0); SFX.move(); return; } if (G.tap || pads[0].p.ok || pads[1].p.ok || pads[0].p.back || pads[1].p.back || anyP('Escape', 'KeyP', 'GPStart')) { this.showList = false; SFX.move(); } return; }
    if (up) { this.pidx = (this.pidx + 4) % 5; SFX.move(); }
    if (dn) { this.pidx = (this.pidx + 1) % 5; SFX.move(); }
    if (anyP('Escape', 'KeyP', 'GPStart')) { this.paused = false; return; }
    let tapOk = false;
    if (G.tap && Math.abs(G.tap[0] - VW / 2) < 320) { const i = Math.round((G.tap[1] - 270) / 54); if (i >= 0 && i < 5) { this.pidx = i; tapOk = true; } }
    if (tapOk || pads[0].p.ok || pads[1].p.ok) {
      SFX.ok();
      if (this.pidx === 0) this.paused = false;
      else if (this.pidx === 1) this.showList = true;
      else if (this.pidx === 2) { this.showSet = true; setIdx = 0; }
      else if (this.pidx === 3) { if (G.world) worldWithdraw(); else G.toSelect(); }
      else G.toTitle();
    }
  }
  pushApart() {
    const [a, b] = this.f; const minD = 104;
    if (a.state === 'rageVic' || b.state === 'rageVic') return;
    const dy = Math.abs(a.y - b.y); if (dy > 150 || (dy > 60 && (a.airborne() || b.airborne())) || Math.abs((a.z || 0) - (b.z || 0)) > 70) return;
    const d = b.x - a.x, ad = Math.abs(d);
    if (ad < minD) {
      const ov = (minD - ad) / 2, s = d === 0 ? (a.facing > 0 ? 1 : -1) : Math.sign(d);
      a.x -= s * ov; b.x += s * ov;
      if (a.x < -STAGE) { b.x += -STAGE - a.x; a.x = -STAGE; } if (a.x > STAGE) { b.x -= a.x - STAGE; a.x = STAGE; }
      if (b.x < -STAGE) { a.x += -STAGE - b.x; b.x = -STAGE; } if (b.x > STAGE) { a.x -= b.x - STAGE; b.x = STAGE; }
    }
    // max separation
    if (Math.abs(b.x - a.x) > MAXSEP) {
      const mover = Math.abs(a.vx) > Math.abs(b.vx) ? a : b, other = mover === a ? b : a;
      mover.x = other.x + Math.sign(mover.x - other.x) * MAXSEP;
    }
  }
  faceCheck() {
    const [a, b] = this.f;
    for (const [f, o] of [[a, b], [b, a]]) {
      if (NEUTRAL.has(f.state) || f.state === 'land' || f.state === 'intro') {
        const nf = o.x >= f.x ? 1 : -1; if (Math.abs(o.x - f.x) > 4) f.facing = nf;
      }
    }
  }
  check(a, d) {
    const hb = a.hitbox(); if (!hb) return null;
    if (d.state === 'dodge' && d.invuln > 0) { const r = d.hurt; if (Math.hypot(hb.x - clamp(hb.x, r.x0, r.x1), hb.y - clamp(hb.y, r.y0, r.y1)) <= hb.r + 20) { d.dodgeHit(); a.hitThis = true; } return null; }
    if (d.invuln > 0 || ['down', 'getup', 'ko', 'rageVic', 'lose'].includes(d.state)) return null;
    if (this.fin && this.fin.a === d) return null; // the one performing a finisher can't be interrupted
    if (d.state === 'juggle' && d.juggle >= 7) return null;
    const m = a.mv;
    if (Math.abs((a.z || 0) - (d.z || 0)) > 60 && !m.track) return null;
    if (m.lvl === 'high' && d.lowProfile() && d.state !== 'juggle') return null;
    if (hb.ar !== undefined && d.caps) { // limb strike: striking segment vs body capsules
      let ok = false; for (const c of d.caps) if (segSeg(hb.x2, hb.y2, hb.x, hb.y, c[0], c[1], c[2], c[3]) <= hb.ar + c[4]) { ok = true; break; }
      if (!ok) return null;
    } else {
      const r = d.hurt; const cx = clamp(hb.x, r.x0, r.x1), cy = clamp(hb.y, r.y0, r.y1);
      if (Math.hypot(hb.x - cx, hb.y - cy) > hb.r) return null;
    }
    hb.m = m; return hb;
  }
  resolveHit(a, d, hb) {
    const m = hb.m; a.hitThis = true; a.connected = true;
    // rage art connect
    if (m.rage) {
      a.setState('rageSeq'); a.mv = null; a.vx = 0; a.y = 0; d.setState('rageVic'); d.vx = 0; d.vy = 0; d.y = 0; d.mv = null; d.finP = null; d.juggle = 0;
      this.fin = { a, d, ci: a.ci, t: 0, cam: null, final: false }; window.__finCount = (window.__finCount || 0) + 1;
      this.freeze = 10; this.shake(16); this.zoomT = 2; this.zoomOn = null; this.dim = 0;
      spark(hb.x, hb.y, 'rage', a.facing); SFX.hit(1.6); return;
    }
    this.hitResolve(a, d, m, hb, a.facing);
  }
  hitResolve(a, d, m, hb, dir) {
    if (d.state === 'attack' && d.mv && d.mv.rage && d.mt < d.mv.st + d.mv.ac) { this.applyDamage(a, d, m.dmg * 0.5, 'hit', null, false, hb, m); return; }
    const canBlock = NEUTRAL.has(d.state) || d.state === 'block' || (d.state === 'land' && d.t > 2);
    const dh = d.in.h;
    const sBlock = canBlock && dh.back && !dh.down;
    const cBlock = canBlock && dh.down;
    const blocked = (m.lvl === 'low' && cBlock) || (m.lvl !== 'low' && sBlock && !(m.air && false));
    if (blocked && d.state !== 'juggle') {
      d.setState('block'); d.stun = m.bs; d.blockLow = cBlock; d.vx = dir * m.push / 5;
      if (Math.abs(d.x) >= STAGE - 2 && !hb.proj) a.vx = -dir * m.push / 5;
      spark(hb.x, hb.y, 'block', dir); SFX.block(); this.freeze = 4; d.shakeT = 4; rumble(d.slot, 0, 0.3, 60);
      if (m.onHit) m.onHit(a, d, true, m);
      return;
    }
    if (m.seq === 'rush' && d.state !== 'juggle' && !d.airborne()) {
      a.setState('rushSeq'); a.mv = null; a.vx = 0; d.setState('rageVic'); d.vx = 0; d.vy = 0; d.y = 0; d.mv = null;
      this.freeze = 6; this.shake(10); spark(hb.x, hb.y, 'counter', dir); SFX.hit(1.3); return;
    }
    const counter = d.state === 'attack' && !m.rage;
    let dmg = m.dmg * (counter ? 1.25 : 1);
    this.applyDamage(a, d, dmg, counter ? 'counter' : 'hit', null, false, hb, m);
    if (d.hp <= 0) return;
    const air = d.state === 'juggle' || d.airborne();
    if (air && m.aa && d.juggle < 3) { // anti-air: knocks jumpers out of the sky
      d.setState('juggle'); d.juggle = 2; d.vy = -12; d.vx = dir * 4; d.mv = null; popText('ضد القفز!', hb.x, hb.y - 40, '#7fd6ff', 36);
    } else if (air) {
      d.setState('juggle'); d.juggle++; d.vy = -Math.max(3.5, 9 * Math.pow(0.82, d.juggle)); d.vx = dir * 2.2;
    } else if (m.launchHit) {
      d.setState('juggle'); d.juggle = 3; d.vy = -11; d.vx = dir * 6.5; d.mv = null;
    } else if (m.launch) {
      d.setState('juggle'); d.juggle = 1; d.vy = -17.5; d.vx = dir * 2.2; d.mv = null; popText('LAUNCH!', hb.x, hb.y - 40, '#7fd6ff', 40);
    } else if (m.kd || (m.kdCH && counter)) {
      d.setState('juggle'); d.juggle = 4; d.vy = -8; d.vx = dir * 5.5; d.mv = null;
    } else {
      const wasLow = d.lowProfile();
      d.setState('hit'); d.mv = null; d.stun = m.hs + (counter ? 8 : 0);
      d.lowHit = m.lvl === 'low' || wasLow; d.lowProfileHit = wasLow;
      d.vx = dir * m.push / 5;
      if (Math.abs(d.x) >= STAGE - 2 && !hb.proj) a.vx = -dir * m.push / 5;
    }
    if (counter) { popText('COUNTER HIT!', hb.x, hb.y - 60, '#ff3b30', 40); SFX.counter(); }
    if (m.onHit) m.onHit(a, d, false, m);
  }
  applyDamage(a, d, dmg, kind, lp, fixed, hb, m) {
    const stunned = ['hit', 'juggle', 'rageVic'].includes(d.state);
    if (stunned && a.comboT > 0) { a.combo++; } else { a.combo = 1; a.comboDmg = 0; }
    const scale = fixed ? 1 : Math.max(0.45, 1 - (a.combo - 1) * 0.12);
    dmg = Math.round(dmg * a.C.dmg * scale * (a.rage ? 1.1 : 1) * (a.dmgMul || 1) * (d.defMul || 1));
    if (a.invis > 0 && !fixed) { dmg = Math.round(dmg * 1.35); a.invis = 0; popText('من الظلام! 🌑', d.x, -360, '#c77dff', 38); }
    if (d.invis > 0) { d.invis = 0; popText('انكشف!', d.x, -330, '#ff9a9a', 32); }
    d.hp = Math.max(0, d.hp - dmg); d.trailT = 40;
    rumble(d.slot, Math.min(1, 0.35 + dmg / 30), 0.5, 110 + dmg * 4); rumble(a.slot, 0, 0.35, 70); a.comboDmg += dmg; a.comboT = 90;
    d.flash = 4; d.shakeT = 8;
    let x, y;
    if (hb) { x = hb.x; y = hb.y; } else { const w = a.toWorld(lp); x = w[0]; y = w[1]; }
    spark(x, y, kind === 'rage' ? 'rage' : kind, a.facing);
    const pw = m ? m.p : 1.2;
    if (m && m.kick) SFX.kick(pw); else SFX.hit(pw);
    this.freeze = Math.max(this.freeze, (m ? m.stop : 5) + (kind === 'counter' ? 3 : 0));
    this.shake(m ? m.p * 5 : 6);
    if (this.fin && this.fin.d === d && !this.fin.final && d.hp <= 0) d.hp = 1; // the finisher always plays out; KO lands on the last blow
    if (this.train) { d.trainHit = G.frame; if (d.hp <= 0) d.hp = 1; }
    if (d.hp <= 0 && !d.ko) this.ko(a, d);
  }
  ko(a, d) {
    d.ko = true; d.setState('juggle'); d.vy = -11; d.vx = a.facing * 5; d.mv = null; d.juggle = 9;
    this.phase = 'ko'; this.koBy = a; this.slow = 80; this.freeze = 14; this.pt = 0;
    SFX.ko(); this.msg('K.O.', 'ko', 150, '#ff2a3a'); say('K.O.!'); this.shake(18); rumble(d.slot, 1, 1, 700); rumble(a.slot, 0.5, 0.8, 400);
    if (Music) Music.intensity = 0;
  }
  koLanded(d) { this.koLandT = this.pt; }
  // training: nobody dies, the clock stands still, the skill meter is always full and the finisher can be used again and again
  trainStep() {
    this.timer = 60 * 60; const [a, b] = this.f;
    a.sk = SKMAX; a.sk2CD = 0;
    if (!this.fin && a.rageUsed && NEUTRAL.has(a.state)) a.rageUsed = false;
    for (const f of this.f) { if (f.ko) { f.ko = false; } if (f.hp < f.maxHp && !this.fin && NEUTRAL.has(f.state) && G.frame - (f.trainHit || 0) > 75) { f.hp = f.maxHp; f.trailHp = f.maxHp; } }
    if (this.phase === 'ko') { this.phase = 'fight'; this.slow = 0; }
  }
  timeUp() {
    const [a, b] = this.f; this.phase = 'ko'; this.pt = 0; this.timeout = true;
    this.msg('TIME UP', 'en', 120, '#ffffff'); say('Time up');
    if (a.hp !== b.hp) { const w = a.hp > b.hp ? a : b; this.koBy = w; } else this.koBy = null;
    for (const f of this.f) { if (f.state !== 'juggle') { f.setState('idle'); f.mv = null; } }
    if (Music) Music.intensity = 0;
  }
  koStep() {
    const lz = this.koBy ? this.f[1 - this.koBy.slot] : null;
    if (this.pt >= 110 && (!lz || !lz.ko || lz.state === 'ko' || this.pt > 240)) {
      const w = this.koBy;
      const perfect = w && w.hp === w.maxHp;
      if (w) {
        this.wins[w.slot]++; w.setState('win'); w.mv = null; if (this.wins[w.slot] >= 2) w.talk('win');
        const l = this.f[1 - w.slot]; if (this.timeout && !l.ko) { l.setState('lose'); }
        this.msg(perfect ? 'PERFECT' : 'WINNER', perfect ? 'ko' : 'en', 120, perfect ? '#ffd34d' : '#ffffff', w.C.name);
        if (perfect) say('Perfect!');
      } else { this.msg('DRAW', 'en', 120, '#ffffff'); }
      this.phase = 'end'; this.pt = 0; this.timeout = false;
    }
  }
  endStep() {
    if (this.pt >= 150) {
      if (this.wins[0] >= 2 || this.wins[1] >= 2) { G.toResult(this.wins[0] >= 2 ? 0 : 1, this); return; }
      this.round++; this.startRound();
    }
  }
  drawKOFx() {
    const d = this.f[1 - this.koBy.slot], t = this.pt; if (t > 100) return;
    const hx = d.x, hy = d.hurt.y0 + 50, a = t < 70 ? 1 : (100 - t) / 30;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a * 0.75;
    for (let i = 0; i < 18; i++) { const ang = i / 18 * Math.PI * 2 + t * 0.012; const g = ctx.createLinearGradient(hx, hy, hx + Math.cos(ang) * 900, hy + Math.sin(ang) * 900); g.addColorStop(0, 'rgba(255,240,200,0.55)'); g.addColorStop(1, 'rgba(255,60,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(ang - 0.05) * 900, hy + Math.sin(ang - 0.05) * 900); ctx.lineTo(hx + Math.cos(ang + 0.05) * 900, hy + Math.sin(ang + 0.05) * 900); ctx.closePath(); ctx.fill(); }
    const rg = ctx.createRadialGradient(hx, hy, 4, hx, hy, 170); rg.addColorStop(0, 'rgba(255,255,255,0.9)'); rg.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(hx, hy, 170, 0, 7); ctx.fill();
    ctx.restore();
  }
  camera() {
    const [a, b] = this.f; const cam = this.cam;
    let tx = (a.x + b.x) / 2, tz = clamp(1.1 - Math.abs(a.x - b.x) / 2600, 0.94, 1.06);
    let ty = Math.min(0, Math.min(a.hipY, b.hipY) + 300) * 0.4;
    if (this.zoomT > 0 && this.zoomOn) { const o = this.zoomOn; tx = o.x + o.facing * 70; tz = 1.32; ty = -60; }
    if (this.fin && this.fin.cam) { const c = this.fin.cam; tx = c.x; tz = c.z; ty = clamp(c.y + 300 / tz, -420, 0); }
    if (this.phase === 'ko' && this.koBy && this.pt < 95) { const d = this.f[1 - this.koBy.slot]; tz = 1.75; tx = d.x; ty = clamp(d.hurt.y0 + 60 + 300 / tz, -420, 0); }
    const lim = STAGE - VW / 2 / tz + 40;
    tx = clamp(tx, -lim, lim);
    const kz = this.phase === 'ko' && this.pt < 95 ? 0.2 : this.fin ? 0.13 : 0.08;
    cam.x = lerp(cam.x, tx, kz + 0.04); cam.z = lerp(cam.z, tz, kz); cam.y = lerp(cam.y, ty, kz + 0.02);
    if (cam.sh > 0) cam.sh *= 0.86; if (cam.sh < 0.3) cam.sh = 0;
  }
  draw() {
    const cam = this.cam, [a, b] = this.f;
    drawStage(cam, G.frame, this.stage);
    if (this.dim > 0) { ctx.fillStyle = `rgba(20,0,5,${Math.min(0.55, this.dim / 40)})`; ctx.fillRect(0, 0, VW, VH); }
    if (this.fin) { const FN = FIN[this.fin.ci] || FIN[0], k = Math.min(1, this.fin.t / 12); ctx.fillStyle = `rgba(4,3,10,${0.58 * k})`; ctx.fillRect(0, 0, VW, VH);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.32 * k; const g = ctx.createRadialGradient(VW / 2, VH * 0.55, 30, VW / 2, VH * 0.55, VW * 0.65); g.addColorStop(0, FN.col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); ctx.restore(); }
    ctx.save();
    const sx = (Math.random() - 0.5) * cam.sh, sy = (Math.random() - 0.5) * cam.sh;
    ctx.translate(VW / 2 + sx, GSY + sy - cam.y * cam.z); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, 0);
    // reflections
    ctx.save(); ctx.scale(1, -0.55); ctx.globalAlpha = 0.13;
    for (const f of this.f) withDepth(f, cam.z, () => drawFighter(f, { refl: true }));
    ctx.restore();
    // shadows
    for (const f of this.f) {
      const hgt = Math.max(0, -f.y); const s = 1 / (1 + hgt / 250);
      withDepth(f, cam.z, () => { ctx.fillStyle = `rgba(0,0,0,${0.55 * s})`; ctx.beginPath(); ctx.ellipse(f.x, 4, 80 * s, 14 * s, 0, 0, 7); ctx.fill(); });
    }
    // order: attacker on top
    let order = (a.state === 'attack' || a.state === 'rageSeq' || a.state === 'rushSeq') ? [b, a] : [a, b];
    if (Math.abs(a.z - b.z) > 25) order = a.z > b.z ? [a, b] : [b, a];
    if (this.fin && FIN[this.fin.ci].back) FIN[this.fin.ci].back(this, this.fin.a, this.fin.d, this.fin.t);
    for (const f of order) withDepth(f, cam.z, () => drawAura(f));
    for (const f of order) withDepth(f, cam.z, () => {
      if ((f.state === 'attack' && f.mv && f.mv.trail && f.mt >= f.mv.st && f.mt < f.mv.st + f.mv.ac) || (f.state === 'dodge' && f.t < 12) || (f.state === 'rageSeq' && f.finTrail)) for (let g = 3; g >= 1; g--) drawFighter(f, { ghost: g });
      if (f.C.awake) drawWings(f); if (f.eq) drawEqBack(f); drawFighter(f); if (f.eq) drawEqFront(f); if (f.hat && !(f.state === 'attack' && f.mv && (f.mv.ball || f.mv.car))) drawChefHat(f); drawRide(f); drawHeld(f); if (f.C.awake) drawAwakeFront(f); if (window.__caps) drawCaps(f);
    });
    for (const pr of this.proj) drawProj(pr);
    if (this.fin && FIN[this.fin.ci].front) FIN[this.fin.ci].front(this, this.fin.a, this.fin.d, this.fin.t);
    drawFX();
    if (!this.fin) for (const f of this.f) if (f.bubble) withDepth(f, cam.z, () => drawBubble(f));
    if (this.phase === 'ko' && this.koBy) this.drawKOFx();
    if (G.debug) this.drawDebug();
    ctx.restore();
    if (this.phase === 'ko' && this.pt < 10) { ctx.fillStyle = `rgba(255,255,255,${(10 - this.pt) / 10 * 0.85})`; ctx.fillRect(0, 0, VW, VH); }
    if (this.fin) this.drawFinOverlay(); else this.drawHUD();
    this.drawMsgs();
    this.drawCutin();
    if (this.paused) this.drawPause();
  }
  drawDebug() {
    for (const f of this.f) {
      const r = f.hurt; ctx.strokeStyle = 'lime'; ctx.lineWidth = 2; ctx.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
      const hb = f.hitbox(); if (hb) { ctx.strokeStyle = 'red'; ctx.beginPath(); ctx.arc(hb.x, hb.y, hb.r, 0, 7); ctx.stroke(); }
      ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.fillText(f.state + (f.mv ? ':' + f.mv.id + ' ' + f.mt : ''), f.x - 40, r.y0 - 20);
    }
  }
  drawHUD() {
    const [a, b] = this.f;
    this.bar(a, 92, 30, 470, false); this.bar(b, VW - 92 - 470, 30, 470, true);
    // timer
    const tsec = Math.ceil(this.timer / 60);
    ctx.save();
    ctx.fillStyle = 'rgba(8,10,18,0.85)'; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(VW / 2 - 50, 18); ctx.lineTo(VW / 2 + 50, 18); ctx.lineTo(VW / 2 + 40, 92); ctx.lineTo(VW / 2 - 40, 92); ctx.closePath(); ctx.fill(); ctx.stroke();
    txt(this.train ? '∞' : String(tsec), VW / 2, 58, { size: 70, font: FE, weight: 600, color: tsec <= 10 ? '#ff4d4d' : '#ffffff', rtl: false });
    ctx.restore();
    if (this.train) txt('🎯 تدريب · الدم ما يخلص · المهارة دايماً مليانة · القاضية جاهزة (' + (TOUCH_ON ? 'زر القاضية' : 'L2+R2') + ') · ' + (TOUCH_ON ? '❚❚' : 'Esc') + ' للخروج', VW / 2, 662, { size: 19, weight: 800, color: '#7dffb0', stroke: '#000', sw: 4 });
    // round wins
    for (let s = 0; s < 2; s++) for (let i = 0; i < 2; i++) {
      const x = s === 0 ? 540 - i * 26 : VW - 540 + i * 26, y = 84;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = this.wins[s] > i ? '#ffd34d' : 'rgba(255,255,255,0.12)'; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2;
      if (this.wins[s] > i) { ctx.shadowColor = '#ffb300'; ctx.shadowBlur = 12; }
      ctx.fillRect(-8, -8, 16, 16); ctx.strokeRect(-8, -8, 16, 16); ctx.restore();
    }
    // combo counters
    for (const f of this.f) {
      if (f.combo >= 2 && f.comboT > 0) {
        const al = Math.min(1, f.comboT / 20), x = f.slot === 0 ? 120 : VW - 120;
        txt(`${f.combo} HITS`, x, 232, { size: 58, font: FE, weight: 700, color: '#ffd34d', stroke: '#000', sw: 7, italic: true, alpha: al, rtl: false });
        txt(`${f.comboDmg} DAMAGE`, x, 272, { size: 30, font: FE, weight: 600, color: '#fff', stroke: '#000', sw: 5, alpha: al, rtl: false });
      }
    }
    // hint
    if (!window.__rec && !TOUCH_ON && this.mode !== 'online') txt('Esc: إيقاف مؤقت   ·   M: الصوت   ·   N: الموسيقى', VW / 2, VH - 16, { size: 15, weight: 600, color: 'rgba(255,255,255,0.35)' });
  }
  bar(f, x, y, w, rev) {
    const h = 26, sk = 14;
    ctx.save();
    const path = (x0, w0) => { ctx.beginPath(); if (!rev) { ctx.moveTo(x0 + sk, y); ctx.lineTo(x0 + w0, y); ctx.lineTo(x0 + w0 - sk, y + h); ctx.lineTo(x0, y + h); } else { ctx.moveTo(x0, y); ctx.lineTo(x0 + w0 - sk, y); ctx.lineTo(x0 + w0, y + h); ctx.lineTo(x0 + sk, y + h); } ctx.closePath(); };
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; path(x - 4, w + 8); ctx.save(); ctx.translate(0, 0); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#1a1d28'; path(x, w); ctx.fill();
    ctx.save(); path(x, w); ctx.clip();
    const tw = w * f.trailHp / f.maxHp, hw = w * f.hp / f.maxHp;
    ctx.fillStyle = '#c4161c'; if (!rev) ctx.fillRect(x, y, tw, h); else ctx.fillRect(x + w - tw, y, tw, h);
    const gr = ctx.createLinearGradient(0, y, 0, y + h);
    if (f.rage) { const p = 0.5 + 0.5 * Math.sin(G.frame * 0.25); gr.addColorStop(0, `rgb(255,${80 + p * 60},${60 + p * 40})`); gr.addColorStop(1, '#a00010'); }
    else { gr.addColorStop(0, '#fff6a0'); gr.addColorStop(0.45, '#ffd21f'); gr.addColorStop(1, '#ff8a00'); }
    ctx.fillStyle = gr; if (!rev) ctx.fillRect(x, y, hw, h); else ctx.fillRect(x + w - hw, y, hw, h);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, y + 2, w, 5);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; path(x, w); ctx.stroke();
    // portrait
    const px = rev ? x + w + 8 : x - 84, py = y - 12;
    ctx.save(); ctx.beginPath(); ctx.rect(px, py, 76, 76); ctx.fillStyle = '#10131e'; ctx.fill(); ctx.clip();
    const im = IMG['face' + (f.ci + 1)];
    if (rev) { ctx.translate(px + 76, py); ctx.scale(-1, 1); ctx.drawImage(im, 0, 0, 76, 76); } else ctx.drawImage(im, px, py, 76, 76);
    ctx.restore();
    ctx.strokeStyle = f.slot === 0 ? '#3ea0ff' : '#ff3b4a'; ctx.lineWidth = 3; ctx.strokeRect(px, py, 76, 76);
    // name
    const nx = rev ? x + w - 6 : x + 6;
    txt(f.dispName || f.C.name, nx, y + h + 22, { size: 24, weight: 800, color: '#fff', align: rev ? 'right' : 'left', stroke: '#000', sw: 4 });
    if (f.storyBuff) { ctx.font = '800 24px ' + FA; const nw = ctx.measureText(f.dispName || f.C.name).width; txt('💪 ضرب أقوى وتحمّل أكثر', rev ? nx - nw - 12 : nx + nw + 12, y + h + 23, { size: 15, weight: 800, color: '#ffd34d', align: rev ? 'right' : 'left', stroke: '#000', sw: 3 }); }
    { // skill meter
      const sw2 = 210, sy = y + h + 46, sx0 = rev ? x + w - sw2 - 6 : x + 6, fr = Math.min(1, f.sk / SKMAX), full = fr >= 1;
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(sx0 - 2, sy - 2, sw2 + 4, 12);
      const fw = sw2 * fr;
      if (full) { const pz = 0.5 + 0.5 * Math.sin(G.frame * 0.3); ctx.save(); ctx.shadowColor = '#ffd34d'; ctx.shadowBlur = 10 + pz * 10; ctx.fillStyle = `rgb(255,${190 + pz * 50},${40 + pz * 60})`; ctx.fillRect(sx0, sy, sw2, 8); ctx.restore(); }
      else { ctx.fillStyle = f.slot === 0 ? '#3ea0ff' : '#ff3b4a'; if (!rev) ctx.fillRect(sx0, sy, fw, 8); else ctx.fillRect(sx0 + sw2 - fw, sy, fw, 8); }
      const key = ((this.mode === 'cpu' && f.slot === 1) || (this.mode === 'online' && f.slot !== NET.slot)) ? '' : (this.mode === 'online' ? (TOUCH_ON ? '★' : 'E') : gpSlotKind(f.slot) ? 'L3/R3' : (f.slot === 0 ? (TOUCH_ON ? '★' : 'E') : 'U'));
      const label = SKILL_NAMES[f.ci] + (full ? (key ? `  ✦ جاهزة (${key})` : '  ✦ جاهزة') : '');
      { const cd = f.cbCD / CB_CD, by2 = sy + 14; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(sx0 - 2, by2 - 1, sw2 * 0.6 + 4, 7);
        ctx.fillStyle = cd > 0 ? 'rgba(255,255,255,0.35)' : '#7dffb0'; const ww = sw2 * 0.6 * (1 - cd); if (!rev) ctx.fillRect(sx0, by2, ww, 5); else ctx.fillRect(sx0 + sw2 * 0.4 + sw2 * 0.6 - ww, by2, ww, 5);
        txt(cd > 0 ? `حركات الزرين ${(f.cbCD / 60).toFixed(1)}` : 'حركات الزرين ✓', rev ? sx0 + sw2 * 0.4 - 8 : sx0 + sw2 * 0.6 + 8, by2 + 3, { size: 12, weight: 800, color: cd > 0 ? 'rgba(255,255,255,0.6)' : '#7dffb0', align: rev ? 'right' : 'left', stroke: '#000', sw: 2 });
        const dc = f.dgCD / 120, by3 = by2 + 11; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(sx0 - 2, by3 - 1, sw2 * 0.6 + 4, 7); ctx.fillStyle = dc > 0 ? 'rgba(255,255,255,0.35)' : '#7fd6ff'; const w3 = sw2 * 0.6 * (1 - dc); if (!rev) ctx.fillRect(sx0, by3, w3, 5); else ctx.fillRect(sx0 + sw2 - w3, by3, w3, 5);
        txt(dc > 0 ? `تفادي ${(f.dgCD / 60).toFixed(1)}` : 'تفادي ✓', rev ? sx0 + sw2 * 0.4 - 8 : sx0 + sw2 * 0.6 + 8, by3 + 3, { size: 12, weight: 800, color: dc > 0 ? 'rgba(255,255,255,0.6)' : '#7fd6ff', align: rev ? 'right' : 'left', stroke: '#000', sw: 2 });
        if (SKILL2[f.ci]) { const c2 = f.sk2CD / SK2_CD, by4 = by3 + 11; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(sx0 - 2, by4 - 1, sw2 * 0.6 + 4, 7); ctx.fillStyle = c2 > 0 ? 'rgba(255,255,255,0.35)' : '#ffb04d'; const w4 = sw2 * 0.6 * (1 - c2); if (!rev) ctx.fillRect(sx0, by4, w4, 5); else ctx.fillRect(sx0 + sw2 - w4, by4, w4, 5);
          txt(c2 > 0 ? `${SKILL2_NAMES[f.ci]} ${(f.sk2CD / 60).toFixed(1)}` : `${SKILL2_NAMES[f.ci]} ✓ (⬇+★)`, rev ? sx0 + sw2 * 0.4 - 8 : sx0 + sw2 * 0.6 + 8, by4 + 3, { size: 12, weight: 800, color: c2 > 0 ? 'rgba(255,255,255,0.6)' : '#ffb04d', align: rev ? 'right' : 'left', stroke: '#000', sw: 2 }); }
        if (f.C.malali || f.bossAs === MALALI) { const c5 = f.invis > 0 ? 1 : (f.invisCD | 0) / 720, by5 = by3 + 22; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(sx0 - 2, by5 - 1, sw2 * 0.6 + 4, 7); ctx.fillStyle = c5 > 0 ? 'rgba(199,125,255,0.45)' : '#c77dff'; const w5 = sw2 * 0.6 * (1 - c5) || (f.invis > 0 ? sw2 * 0.6 * f.invis / 240 : 0); if (!rev) ctx.fillRect(sx0, by5, w5, 5); else ctx.fillRect(sx0 + sw2 - w5, by5, w5, 5);
          txt(f.invis > 0 ? 'مختفي 🌑' : c5 > 0 ? 'الاختفاء ' + ((f.invisCD | 0) / 60).toFixed(1) : 'الاختفاء ✓ (⬆+★)', rev ? sx0 + sw2 * 0.4 - 8 : sx0 + sw2 * 0.6 + 8, by5 + 3, { size: 12, weight: 800, color: c5 > 0 && !(f.invis > 0) ? 'rgba(255,255,255,0.6)' : '#c77dff', align: rev ? 'right' : 'left', stroke: '#000', sw: 2 }); } }
      txt(label, rev ? sx0 - 10 : sx0 + sw2 + 10, sy + 4, { size: 15, weight: 800, color: full ? '#ffd34d' : 'rgba(255,255,255,0.75)', align: rev ? 'right' : 'left', stroke: '#000', sw: 3 });
    }
    if (f.rage || (this.train && f.canFin)) txt('القاضية جاهزة 💥', rev ? x + 30 : x + w - 30, y + h + 20, { size: 20, weight: 900, color: '#ff2a3a', align: rev ? 'left' : 'right', stroke: '#000', sw: 4, glow: '#ff0020' });
    txt((this.mode === 'online' ? (f.slot === NET.slot ? 'YOU' : 'NET') : f.slot === 0 ? '1P' : (this.mode === 'cpu' ? 'CPU' : this.mode === 'train' ? 'DUMMY' : '2P')) + (gpSlotKind(f.slot) && !(this.mode === 'cpu' && f.slot === 1) ? ' 🎮' : (TOUCH_ON && f.slot === (this.mode === 'online' ? NET.slot : 0) ? ' 📱' : '')), rev ? px + 38 : px + 38, py + 92, { size: 22, font: FE, weight: 700, color: f.slot === 0 ? '#3ea0ff' : '#ff3b4a', rtl: false });
    ctx.restore();
  }
  drawMsgs() {
    const kb = this.skBanner;
    if (kb) {
      const u = easeOut(Math.min(1, kb.t / 8)), out = Math.max(0, (kb.t - 55) / 15), left = kb.slot === 0;
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(left ? lerp(-300, 250, u) : lerp(VW + 300, VW - 250, u), 152); ctx.rotate(-0.04);
      if (kb.small) ctx.scale(0.75, 0.75);
      ctx.fillStyle = kb.small ? 'rgba(10,12,24,0.9)' : (left ? 'rgba(20,90,220,0.9)' : 'rgba(210,20,45,0.9)'); ctx.beginPath(); ctx.moveTo(-210, -30); ctx.lineTo(230, -30); ctx.lineTo(210, 30); ctx.lineTo(-230, 30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = kb.small ? (left ? '#3ea0ff' : '#ff3b4a') : '#ffd34d'; ctx.fillRect(-230, 28, 440, 5);
      txt(kb.text, 0, 2, { size: 36, weight: 900, color: kb.small ? '#ffd34d' : '#fff', stroke: '#000', sw: 5 }); ctx.restore();
    }
    const bn = this.banner;
    if (bn && bn.t < bn.dur) {
      const u = easeOut(Math.min(1, bn.t / 8)), out = Math.max(0, (bn.t - bn.dur + 10) / 10);
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(lerp(-VW, 0, u) + VW / 2, 190); ctx.rotate(-0.05);
      ctx.fillStyle = 'rgba(200,0,20,0.85)'; ctx.fillRect(-VW, -42, VW * 2, 84);
      txt(bn.text, 0, 4, bn.ar ? { size: 82, weight: 900, color: '#fff', stroke: '#000', sw: 8, glow: '#ff0020', glowBlur: 30 } : { size: 92, font: FE, weight: 700, color: '#fff', italic: true, stroke: '#000', sw: 8, rtl: false, glow: '#ff0020', glowBlur: 30 });
      ctx.restore();
    }
    for (const m of this.msgs) {
      const t = m.t, u = Math.min(1, t / 10), out = Math.max(0, (t - (m.dur - 12)) / 12);
      const sc = (m.kind === 'ko' ? lerp(3, 1, easeOut(u)) : lerp(1.6, 1, easeOut(u)));
      const al = u * (1 - out);
      ctx.save(); ctx.translate(VW / 2, VH / 2 - 60); ctx.scale(sc, sc); ctx.globalAlpha = al;
      if (m.kind === 'ko') {
        ctx.fillStyle = 'rgba(120,0,10,0.35)'; ctx.fillRect(-VW, -70, VW * 2, 140);
        txt(m.text, 0, 6, { size: 180, font: FE, weight: 700, color: m.color, stroke: '#000', sw: 12, italic: true, glow: '#ff0020', glowBlur: 40, rtl: false });
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-VW, -54, VW * 2, 108);
        txt(m.text, 0, 6, { size: 120, font: FE, weight: 700, color: m.color, stroke: '#000', sw: 10, italic: true, glow: m.color === '#ffd34d' ? '#ff8a00' : '#4080ff', glowBlur: 30, rtl: false });
      }
      if (m.sub) txt(m.sub, 0, 110, { size: 54, weight: 900, color: '#fff', stroke: '#000', sw: 8 });
      ctx.restore();
    }
  }
  drawPause() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, VW, VH);
    if (this.showList) { drawMoveList(this); return; }
    if (this.showSet) { drawSettings(); return; }
    txt('إيقاف مؤقت', VW / 2, 175, { size: 66, weight: 900, color: '#fff', glow: '#ff2040' });
    const opts = ['استمرار', 'قائمة الحركات', 'الإعدادات', G.world ? '🏳️ انسحاب للعالم' : 'اختيار الشخصيات', 'القائمة الرئيسية'];
    opts.forEach((o, i) => {
      const y = 270 + i * 54, sel = i === this.pidx;
      if (sel) { ctx.fillStyle = 'rgba(255,30,50,0.85)'; ctx.beginPath(); ctx.moveTo(VW / 2 - 220, y - 28); ctx.lineTo(VW / 2 + 240, y - 28); ctx.lineTo(VW / 2 + 220, y + 28); ctx.lineTo(VW / 2 - 240, y + 28); ctx.closePath(); ctx.fill(); }
      txt(o, VW / 2, y + 2, { size: 38, weight: 800, color: sel ? '#fff' : 'rgba(255,255,255,0.6)' });
    });
    if (!TOUCH_ON) controlsPanel(VW / 2, 600, 0.68);
  }
}
const KEYS_P = [{ 1: 'R', 2: 'T', 3: 'F', 4: 'G' }, { 1: 'I', 2: 'O', 3: 'K', 4: 'L' }];
const GLYPH = { 1: 'sq', 2: 'tri', 3: 'x', 4: 'o' };
function drawMoveTabs(F) {
  const tabs = ['حركات الشخصيات', 'الضربات (اتجاه + زر)'];
  tabs.forEach((t, i) => { const x = VW / 2 + (i === 0 ? 170 : -170), on = (F.listPage || 0) === i;
    ctx.fillStyle = on ? 'rgba(230,20,40,0.85)' : 'rgba(255,255,255,0.08)'; rrect(x - 160, 18, 320, 44, 12); ctx.fill();
    txt(t, x, 41, { size: 24, weight: 900, color: on ? '#fff' : 'rgba(255,255,255,0.6)' }); });
  txt('◀ ▶ أو اضغط فوق للتبديل', VW / 2, 82, { size: 16, weight: 700, color: 'rgba(255,255,255,0.5)' });
}
function drawMoveTable(F) {
  ctx.fillStyle = 'rgba(3,4,10,0.95)'; ctx.fillRect(0, 0, VW, VH); drawMoveTabs(F);
  const cols = [['b1', 1], ['b3', 3], ['b4', 4], ['b2', 2]], rows = [['n', 'بدون اتجاه', '•'], ['fwd', 'قدام', '➡'], ['back', 'ورا', '⬅'], ['up', 'فوق', '⬆'], ['down', 'تحت', '⬇'], ['air', 'في الجو', '✈']];
  const LV = { high: ['عالي', '#ff8a8a'], mid: ['وسط', '#ffd34d'], low: ['واطي', '#7fd6ff'] };
  const x0 = VW - 175, cw = 255, y0 = 140, rh = 84;
  cols.forEach(([b, n], i) => { const x = x0 - 130 - i * cw; padGlyph(GLYPH[n], x + 40, y0 - 22, 16); txt(KEYS_P[0][n] + ' / ' + KEYS_P[1][n], x - 20, y0 - 21, { size: 18, font: FE, weight: 700, color: 'rgba(255,255,255,0.55)', rtl: false }); });
  rows.forEach(([key, label, ic], r) => {
    const y = y0 + 24 + r * rh; ctx.fillStyle = r % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)'; ctx.fillRect(60, y - 4, VW - 120, rh - 6);
    txt(ic + ' ' + label, x0 + 60, y + rh / 2 - 6, { size: 24, weight: 900, color: '#fff', align: 'right' });
    cols.forEach(([b], i) => { const id = MOVESET[key][b], m = MV[id], x = x0 - 130 - i * cw, lv = LV[m.lvl] || LV.mid;
      const tag = m.aa ? 'ضد القفز' : m.launch ? 'يرفع' : (m.kd ? 'يطيّح' : m.push >= 60 ? 'يبعّد' : '');
      txt(MOVE_AR[id] || id, x, y + 26, { size: 23, weight: 800, color: '#fff' });
      txt(lv[0] + (tag ? ' · ' + tag : ''), x, y + 56, { size: 16, weight: 800, color: lv[1] }); });
  });
  txt('قدام = جهة الخصم   ·   اللاعب 1: W A S D   ·   اللاعب 2: الأسهم   ·   يد التحكم والجوال: العصا + الزر', VW / 2, 682, { size: 17, weight: 700, color: 'rgba(255,255,255,0.6)' });
  txt('اضغط أي زر للرجوع', VW / 2, 708, { size: 15, weight: 700, color: 'rgba(255,255,255,0.45)' });
}
function drawMoveList(F) {
  if (F.listPage === 1) { drawMoveTable(F); return; }
  ctx.fillStyle = 'rgba(3,4,10,0.93)'; ctx.fillRect(0, 0, VW, VH); drawMoveTabs(F);
  txt('اضغط الزرين مع بعض   ·   فوق فوق = خطوة للداخل   ·   تحت تحت = خطوة للخارج', VW / 2, 104, { size: 18, weight: 700, color: '#ffd34d' });
  F.f.forEach((f, s) => {
    const cx = s === 0 ? 330 : VW - 330, col = s === 0 ? '#3ea0ff' : '#ff3b4a';
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(cx - 290, 120, 580, 560); ctx.fillStyle = col; ctx.fillRect(cx - 290, 120, 580, 4);
    txt(f.C.name, cx, 152, { size: 32, weight: 900, color: col });
    COMBO_KEYS.forEach((k, i) => {
      const y = 205 + i * 66, a = +k[0], b = +k[1];
      padGlyph(GLYPH[a], cx + 230, y, 14); txt('+', cx + 205, y, { size: 22, font: FE, weight: 700, color: '#fff', rtl: false }); padGlyph(GLYPH[b], cx + 180, y, 14);
      const sh = { '12': 'R1', '34': 'R2', '13': 'L1', '24': 'Share' }[k];
      if (sh) txt(sh, cx - 250, y + 1, { size: 22, font: FE, weight: 700, color: '#ff8a8a', rtl: false });
      txt(`${KEYS_P[s][a]}+${KEYS_P[s][b]}`, cx + 120, y + 1, { size: 22, font: FE, weight: 700, color: 'rgba(255,255,255,0.6)', rtl: false });
      txt(MV[COMBOS[f.ci][k]].cname, cx + 70, y, { size: 26, weight: 800, color: '#fff', align: 'right' });
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(cx - 270, y + 30, 540, 1);
    });
    const y = 205 + 6 * 66;
    txt('L3/R3', cx + 205, y + 26, { size: 18, font: FE, weight: 700, color: '#7dffb0', rtl: false });
    txt(s === 0 ? 'E' : 'U', cx + 205, y - 6, { size: 24, font: FE, weight: 700, color: '#7dffb0', rtl: false });
    txt('المهارة: ' + SKILL_NAMES[f.ci] + ' (كل 10 ثواني)', cx + 70, y - (SKILL2[f.ci] ? 12 : 0), { size: SKILL2[f.ci] ? 19 : 22, weight: 800, color: '#7dffb0', align: 'right' });
    if (SKILL2[f.ci]) txt('⬇ + ★: ' + SKILL2_NAMES[f.ci] + ' (كل 4 ثواني)' + (f.C.malali ? ' · ⬆ + ★: الاختفاء 🌑' : ''), cx + 70, y + 14, { size: 18, weight: 800, color: '#ffb04d', align: 'right' });
    txt(`تفادي: ${s === 0 ? 'Q' : 'Y'} أو L2 (كل ثانيتين)`, cx, y + 40, { size: 17, weight: 700, color: '#7fd6ff' });
    txt('💥 القاضية: ' + (FIN[f.ci] || FIN[0]).name + '  ·  L2+R2 (أو □+△) لما دمك يقل', cx, y + 64, { size: 17, weight: 700, color: '#ff8080' });
  });
  txt('اضغط أي زر للرجوع', VW / 2, 700, { size: 18, weight: 700, color: 'rgba(255,255,255,0.5)' });
}

// ================= TEXT HELPER =================
function txt(s, x, y, o = {}) {
  const { size = 32, font = FA, weight = 800, color = '#fff', align = 'center', base = 'middle', stroke = null, sw = 6, glow = null, glowBlur = 20, italic = false, rtl = null, alpha = 1 } = o;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.direction = rtl === null ? (/[؀-ۿ]/.test(s) ? 'rtl' : 'ltr') : (rtl ? 'rtl' : 'ltr');
  if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = sw; ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = glowBlur; }
  ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}
function keycap(k, x, y, w = 38, col = '#fff', bg = 'rgba(255,255,255,0.1)') {
  ctx.save(); ctx.fillStyle = bg; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - 17, w, 34, 6) : ctx.rect(x - w / 2, y - 17, w, 34); ctx.fill(); ctx.stroke();
  txt(k, x, y + 2, { size: 19, font: FE, weight: 600, color: col, rtl: false }); ctx.restore();
}
function padGlyph(kind, x, y, r = 14) {
  ctx.save(); ctx.fillStyle = '#151827'; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 2.4; const q = r * 0.48;
  if (kind === 'sq') { ctx.strokeStyle = '#ef8ad8'; ctx.strokeRect(x - q, y - q, q * 2, q * 2); }
  if (kind === 'tri') { ctx.strokeStyle = '#46dcae'; ctx.beginPath(); ctx.moveTo(x, y - q * 1.15); ctx.lineTo(x + q * 1.1, y + q * 0.8); ctx.lineTo(x - q * 1.1, y + q * 0.8); ctx.closePath(); ctx.stroke(); }
  if (kind === 'x') { ctx.strokeStyle = '#86b4ff'; ctx.beginPath(); ctx.moveTo(x - q, y - q); ctx.lineTo(x + q, y + q); ctx.moveTo(x + q, y - q); ctx.lineTo(x - q, y + q); ctx.stroke(); }
  if (kind === 'o') { ctx.strokeStyle = '#ff7070'; ctx.beginPath(); ctx.arc(x, y, q, 0, 7); ctx.stroke(); }
  ctx.restore();
}
function padRow(y) {
  // [glyph, xbox letter, number]
  const items = [['sq', 'X', '1'], ['tri', 'Y', '2'], ['x', 'A', '3'], ['o', 'B', '4']];
  txt('يد التحكم PS / Xbox', 380, y, { size: 18, weight: 900, color: '#ffd34d' });
  let x = 250;
  for (const [g, xb, n] of items) {
    padGlyph(g, x, y, 13); txt('/' + xb, x - 20, y + 1, { size: 18, font: FE, weight: 700, color: 'rgba(255,255,255,0.7)', align: 'right', rtl: false });
    txt('= ' + n, x - 56, y + 1, { size: 18, font: FE, weight: 700, color: '#fff', align: 'right', rtl: false }); x -= 98;
  }
  txt('L3/R3', -150, y + 1, { size: 19, font: FE, weight: 700, color: '#7dffb0', rtl: false });
  txt('مهارة', -200, y, { size: 16, weight: 700, color: 'rgba(255,255,255,0.7)' });
  txt('L1 R1 R2', -262, y + 1, { size: 19, font: FE, weight: 700, color: '#ff6b6b', rtl: false });
  txt('L2', -150, y + 26, { size: 19, font: FE, weight: 700, color: '#7fd6ff', rtl: false }); txt('تفادي', -200, y + 25, { size: 16, weight: 700, color: 'rgba(255,255,255,0.7)' });
  txt('حركات', -330, y, { size: 16, weight: 700, color: 'rgba(255,255,255,0.7)' });
  txt('Options', -400, y + 1, { size: 19, font: FE, weight: 700, color: '#9fd8ff', rtl: false });
  txt('إيقاف', -462, y, { size: 16, weight: 700, color: 'rgba(255,255,255,0.7)' });
}
function controlsPanel(cx, cy, s = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(5,7,14,0.78)'; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-560, -78, 1120, 210, 14) : ctx.rect(-560, -78, 1120, 210); ctx.fill(); ctx.stroke();
  const col = (ox, title, mv, at, colr, mvLeft, spk) => {
    txt(title, ox, -56, { size: 22, weight: 900, color: colr });
    const mx = mvLeft ? ox - 120 : ox + 130, axx = mvLeft ? ox + 70 : ox - 120;
    txt('حركة', mx, -22, { size: 16, weight: 700, color: 'rgba(255,255,255,0.6)' });
    keycap(mv[0], mx, 10); keycap(mv[1], mx - 42, 48); keycap(mv[2], mx, 48); keycap(mv[3], mx + 42, 48);
    txt('ضرب', axx + 40, -22, { size: 16, weight: 700, color: 'rgba(255,255,255,0.6)' });
    for (let i = 0; i < 4; i++) {
      const kx = axx + (i % 2) * 80, ky = 10 + ((i / 2) | 0) * 38;
      keycap(at[i], kx, ky, 34, '#ffd34d');
      txt(String(i + 1), kx + 28, ky + 1, { size: 18, font: FE, weight: 700, color: 'rgba(255,255,255,0.5)', rtl: false });
    }
    const sx = mvLeft ? axx + 150 : axx - 72; keycap(spk, sx, 22, 36, '#7dffb0'); txt('مهارة', sx, 54, { size: 15, weight: 800, color: '#7dffb0' });
  };
  col(-280, 'اللاعب 1', ['W', 'A', 'S', 'D'], ['R', 'T', 'F', 'G'], '#3ea0ff', true, 'E');
  col(280, 'اللاعب 2', ['↑', '←', '↓', '→'], ['I', 'O', 'K', 'L'], '#ff3b4a', false, 'U');
  txt('تفادي المهارات: Q (اللاعب 1) · Y (اللاعب 2) · L2 في يد التحكم — مرة كل ثانيتين', 0, 112, { size: 15, weight: 800, color: '#7fd6ff' });
  txt('1 = لكمة يسار · 2 = لكمة يمين · 3 = ركلة يسار · 4 = ركلة يمين', 0, 86, { size: 15, weight: 700, color: 'rgba(255,255,255,0.45)' });
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(-540, 104); ctx.lineTo(540, 104); ctx.stroke();
  padRow(130);
  ctx.restore();
}


// ================= ONLINE (WebRTC peer-to-peer via PeerJS) =================
const NET = { on: false, ui: 'menu', idx: 0, peer: null, conn: null, code: '', slot: 0, msg: '', rtt: 120, lastRx: 0, m: 0, remote: { sel: null }, sentSel: '', D: 4, sf: 0, lf: 0, lin: [], rin: [], rmax: -1, pendP: 0, stall: 0, menu: false, midx: 0, desync: false, myH: {}, rH: {}, rng: null, res: null };
const NET_PREFIX = 'shilla-fight-v1-';
const NET_SRV = { host: '0.peerjs.com', port: 443, path: '/', secure: true };
function netEmbedded() { try { return window.self !== window.top; } catch (e) { return true; } }
const NET_MSG_EMBED = 'الأونلاين ما يشتغل داخل رابط Claude (Claude يمنع الاتصال بين الأجهزة) — افتح اللعبة من رابط Vercel أو من ملف shilla-fight.html';
function netNoNet() { return netEmbedded() ? NET_MSG_EMBED : 'ما قدرنا نتصل بالإنترنت — تأكد من الاتصال وجرب مرة ثانية'; }
const NET_ICE = { iceServers: [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  { urls: 'stun:global.stun.twilio.com:3478' },
  { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turn:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' },
] };
const NKEYS = ['up', 'down', 'left', 'right', 'b1', 'b2', 'b3', 'b4', 'sp', 'c12', 'c34', 'c13', 'c24', 'dg', 'ra'];
const NKB = NKEYS.length, NMASK = (1 << NKB) - 1;
function netEnc(pd) { let v = 0; NKEYS.forEach((k, i) => { if (pd.h[k]) v |= 1 << i; if (pd.p[k]) v |= 1 << (i + NKB); }); return v; }
function netDec(v, pd) { NKEYS.forEach((k, i) => { pd.h[k] = !!(v & (1 << i)); pd.p[k] = !!(v & (1 << (i + NKB))); }); }
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function PeerCtor() { return window.__MockPeer || window.Peer; }
function netSend(o) { try { if (NET.conn && NET.conn.open) NET.conn.send(o); } catch (e) { } }
function netClose(silent) {
  if (NET.conn) { try { netSend({ t: 'bye' }); NET.conn.close(); } catch (e) { } }
  if (NET.peer) { try { NET.peer.destroy(); } catch (e) { } }
  if (NET.fbOff) { try { NET.fbOff(); } catch (e) { } NET.fbOff = null; }
  if (NET.fbRef && !NET.conn && NET.slot === 0) { try { NET.fbRef.remove(); } catch (e) { } }
  NET.fbRef = null; NET.tok = (NET.tok || 0) + 1;
  NET.conn = null; NET.peer = null; NET.on = false; NET.remote = { sel: null }; NET.reqEq = null; NET.menu = false;
  if (!silent) { NET.ui = 'menu'; }
  netInput(false);
}
function netFail(text) { netClose(true); NET.ui = 'err'; NET.msg = text; G.scene = 'online'; G.fight = null; G.t = 0; }
function netLost() {
  if (!NET.on) return;
  const inGame = G.scene !== 'online';
  netClose(true); G.scene = 'online'; G.fight = null; G.t = 0; NET.ui = 'err';
  NET.msg = inGame ? 'انقطع الاتصال مع صاحبك' : 'انقطع الاتصال';
}
function netWire(conn) {
  NET.conn = conn;
  conn.on('open', () => {
    NET.on = true; NET.lastRx = performance.now(); netSend({ t: 'hi', v: 1 });
    SFX.ok(); toast('تم الاتصال! 🔗'); NET.m = 0; NET.remote = { sel: null }; NET.reqEq = null;
    G.mode = 'online'; G.toSelect(); G.sel.cur[NET.slot] = G.sel.cur[NET.slot] || 0;
  });
  conn.on('data', d => netRx(d));
  conn.on('close', () => netLost());
  conn.on('error', () => netLost());
}

// ---- server relay through Firebase Realtime Database (used when firebase-config.js is filled in) ----
function fbDB() {
  try {
    const F = window.__MockFirebase || window.firebase, cfg = window.SHILLA_FIREBASE;
    if (!F || !cfg || !cfg.databaseURL) return null;
    if (!F.apps.length) F.initializeApp(cfg);
    return F.database();
  } catch (e) { return null; }
}
// ---- player stats for the admin page (only when firebase-config.js is filled in) ----
const STATS = { id: null, started: false };
function statsId() { try { let id = localStorage.getItem('shilla_id'); if (!id || !/^[a-z0-9]{12}$/.test(id)) { id = ''; for (let i = 0; i < 12; i++) id += 'abcdefghijklmnopqrstuvwxyz0123456789'[(Math.random() * 36) | 0]; localStorage.setItem('shilla_id', id); } return id; } catch (e) { return null; } }
function statsName() { try { return (localStorage.getItem('shilla_name') || '').trim().slice(0, 24); } catch (e) { return ''; } }
function statsDev() { return (TOUCH_ON || window.FORCE_TOUCH) ? 'جوال' : 'كمبيوتر'; }
function statsPing(extra) {
  try {
    const db = fbDB(), F = window.firebase; if (!db || !F || !F.database || !F.database.ServerValue) return;
    const id = STATS.id || (STATS.id = statsId()); if (!id) return;
    const SV = F.database.ServerValue, ref = db.ref('players/' + id), up = { name: statsName(), last: SV.TIMESTAMP, ver: GAME_VER, dev: statsDev(), app: !!PWA.standalone };
    if (!STATS.started) { STATS.started = true; up.visits = SV.increment(1); let first = 0; try { first = +localStorage.getItem('shilla_first') || 0; if (!first) { first = Date.now(); localStorage.setItem('shilla_first', first); } } catch (e) { } up.first = first || Date.now();
      const on = db.ref('online/' + id); on.onDisconnect().remove(); on.set({ name: statsName(), since: SV.TIMESTAMP, dev: statsDev() }); }
    if (extra) { if (extra.fight) { up.fights = SV.increment(1); up.char = extra.char; up.mode = extra.mode; db.ref('online/' + id).update({ char: extra.char, mode: extra.mode }); } }
    ref.update(up);
  } catch (e) { }
}
function statsAskName(force) {
  try { if (!fbDB() && !force) return; if (!force && (statsName() || localStorage.getItem('shilla_name_asked'))) return; localStorage.setItem('shilla_name_asked', '1');
    setTimeout(() => { ASK('وش اسمك؟', statsName(), n => { if (n !== null) { localStorage.setItem('shilla_name', n.trim().slice(0, 24)); statsPing(); } }); }, 60);
  } catch (e) { }
}
addEventListener('load', () => setTimeout(() => statsPing(), 2500));
class FbConn {
  constructor(ref, role) { this.ref = ref; this.role = role; this.h = {}; this.open = false; this.closed = false; this.pendIn = null; this.subs = []; this.me = role === 'host' ? 'H' : 'G'; this.op = role === 'host' ? 'G' : 'H'; }
  on(e, f) { (this.h[e] = this.h[e] || []).push(f); }
  emit(e, ...a) { (this.h[e] || []).forEach(f => { try { f(...a); } catch (er) { console.error(er); } }); }
  start() {
    const q = this.ref.child('m' + this.me);
    const onAdd = sn => { const v = sn.val(); try { sn.ref.remove(); } catch (e) { } if (v && this.open) this.emit('data', v); };
    q.on('child_added', onAdd); this.subs.push(() => q.off('child_added', onAdd));
    const inRef = this.ref.child('i' + this.op);
    const onIn = sn => { const v = sn.val(); if (v && this.open) { if (v.s && !Array.isArray(v.s)) v.s = Object.keys(v.s).sort((a, b) => a - b).map(k => v.s[k]); this.emit('data', v); } };
    inRef.on('value', onIn); this.subs.push(() => inRef.off('value', onIn));
    const leftRef = this.role === 'host' ? this.ref.child('byeG') : this.ref.child('t');
    const onLeft = sn => { if (this.role === 'host' ? !!sn.val() : !sn.exists()) this.fireClose(); };
    leftRef.on('value', onLeft); this.subs.push(() => leftRef.off('value', onLeft));
    this.open = true; this.emit('open');
    this.timer = setInterval(() => this.flush(), 50);
  }
  send(o) { if (!this.open) return; if (o.t === 'in') { this.pendIn = o; return; } this.ref.child('m' + this.op).push(o); }
  flush() { if (this.pendIn && this.open) { const o = this.pendIn; this.pendIn = null; this.ref.child('i' + this.me).set(o); } }
  cleanup() { this.subs.forEach(f => f()); this.subs = []; clearInterval(this.timer); }
  fireClose() { if (this.closed) return; this.closed = true; this.open = false; this.cleanup(); this.emit('close'); }
  close() { if (this.closed) return; this.flush(); this.closed = true; this.open = false; this.cleanup(); try { if (this.role === 'host') this.ref.remove(); else this.ref.child('byeG').set(true); } catch (e) { } }
}
function fbHost(db) {
  NET.slot = 0; NET.ui = 'host'; NET.msg = ''; NET.via = 'server'; const tok = NET.tok = (NET.tok || 0) + 1;
  const tryCode = n => {
    const code = String(1000 + Math.floor(RR() * 9000)), ref = db.ref('rooms/' + code);
    ref.transaction(cur => (!cur || !cur.t || Date.now() - cur.t > 3 * 3600e3) ? { t: Date.now(), v: 1 } : undefined, (err, ok) => {
      if (NET.tok !== tok || NET.ui !== 'host') { if (ok) ref.remove(); return; }
      if (err) { netFail(netNoNet()); return; }
      if (!ok) { if (n < 8) tryCode(n + 1); else netFail('ما قدرنا نسوي غرفة — جرب مرة ثانية'); return; }
      try { ref.onDisconnect().remove(); } catch (e) { }
      NET.code = code; NET.msg = 'ready'; NET.fbRef = ref;
      const g = ref.child('g');
      const onG = sn => { if (sn.val() && !NET.conn && NET.tok === tok) { g.off('value', onG); NET.fbOff = null; const c = new FbConn(ref, 'host'); netWire(c); c.start(); } };
      g.on('value', onG); NET.fbOff = () => g.off('value', onG);
    }, false);
  };
  tryCode(0);
  setTimeout(() => { if (NET.tok === tok && NET.ui === 'host' && NET.msg !== 'ready') netFail(netNoNet()); }, 15000);
}
function fbJoin(db, code) {
  NET.slot = 1; NET.ui = 'join'; NET.code = code; NET.msg = ''; NET.via = 'server'; netInput(false); const tok = NET.tok = (NET.tok || 0) + 1;
  const ref = db.ref('rooms/' + code); NET.fbRef = ref;
  const to = setTimeout(() => { if (NET.tok === tok && NET.ui === 'join' && !NET.on) netFail(netNoNet()); }, 15000);
  ref.once('value').then(sn => {
    if (NET.tok !== tok || NET.ui !== 'join') return;
    const v = sn.val();
    if (!v || !v.t) { clearTimeout(to); netFail('ما في غرفة بهذا الكود ' + code + ' — تأكد إن صاحبك فاتح الغرفة'); return; }
    ref.child('g').transaction(cur => cur ? undefined : Date.now(), (err, ok) => {
      clearTimeout(to);
      if (NET.tok !== tok || NET.ui !== 'join') return;
      if (err) { netFail(netNoNet()); return; }
      if (!ok) { netFail('الغرفة ' + code + ' فيها لاعبين — خل صاحبك يسوي غرفة جديدة'); return; }
      try { ref.child('byeG').onDisconnect().set(true); } catch (e) { }
      const c = new FbConn(ref, 'guest'); netWire(c); c.start();
    }, false);
  }).catch(() => { clearTimeout(to); if (NET.tok === tok) netFail(netNoNet()); });
}
function netHost() {
  { const db = fbDB(); if (db) { fbHost(db); return; } }
  NET.via = 'p2p';
  const P = PeerCtor(); if (!P || (!window.__MockPeer && typeof RTCPeerConnection === 'undefined')) { NET.ui = 'err'; NET.msg = NET_MSG_EMBED; return; }
  NET.slot = 0; NET.ui = 'host'; NET.code = String(1000 + Math.floor(RR() * 9000)); NET.msg = '';
  const peer = new P(NET_PREFIX + NET.code, Object.assign({ config: NET_ICE, debug: 0 }, NET_SRV)); NET.peer = peer;
  peer.on('open', () => { if (NET.peer === peer) NET.msg = 'ready'; });
  peer.on('connection', conn => { if (NET.conn) { try { conn.close(); } catch (e) { } return; } netWire(conn); });
  peer.on('error', e => {
    if (NET.peer !== peer) return;
    if (e && e.type === 'unavailable-id') { try { peer.destroy(); } catch (er) { } NET.peer = null; netHost(); return; }
    if (!NET.on) netFail(netNoNet());
  });
}
function netJoin(code) {
  { const db = fbDB(); if (db) { fbJoin(db, code); return; } }
  NET.via = 'p2p';
  const P = PeerCtor(); if (!P || (!window.__MockPeer && typeof RTCPeerConnection === 'undefined')) { NET.ui = 'err'; NET.msg = NET_MSG_EMBED; return; }
  NET.slot = 1; NET.ui = 'join'; NET.code = code; NET.msg = ''; netInput(false);
  const peer = new P(undefined, Object.assign({ config: NET_ICE, debug: 0 }, NET_SRV)); NET.peer = peer;
  const to = setTimeout(() => { if (NET.peer === peer && !NET.on) netFail('ما قدرنا نوصل للغرفة — تأكد من الكود وإن صاحبك فاتح الغرفة'); }, 15000);
  peer.on('open', () => { if (NET.peer !== peer) return; netWire(peer.connect(NET_PREFIX + code, { reliable: true, serialization: 'json' })); });
  peer.on('error', e => {
    if (NET.peer !== peer) return; clearTimeout(to);
    if (NET.on) return;
    netFail(e && e.type === 'peer-unavailable' ? 'ما في غرفة بهذا الكود ' + code + ' — تأكد إن صاحبك فاتح الغرفة' : netNoNet());
  });
}
addEventListener('pagehide', () => { if (NET.on) netSend({ t: 'bye' }); });
function netRx(d) {
  if (!d || typeof d !== 'object') return;
  NET.lastRx = performance.now();
  switch (d.t) {
    case 'ping': netSend({ t: 'pong', a: d.a }); break;
    case 'pong': { const r = performance.now() - d.a; if (r >= 0 && r < 5000) NET.rtt = NET.rtt * 0.7 + r * 0.3; break; }
    case 'sel': NET.remote.sel = { c: clamp(d.c | 0, 0, NCH - 1), rd: !!d.rd, o: d.o | 0 }; NET.reqEq = eqClean(d.e); break;   // the opponent's clothes (kept across match resets)
    case 'go':
      if (NET.slot === 1 && G.scene === 'select' && d.m > NET.m) {
        NET.m = d.m; NET.seed = d.seed | 0; netMatchReset(); if (STAGE_DEFS[d.st]) G.stageId = d.st; G.sel.cur = [clamp(d.c0 | 0, 0, NCH - 1), clamp(d.c1 | 0, 0, NCH - 1)]; G.sel.outfit = [d.o0 | 0, d.o1 | 0]; G.sel.done = [true, true]; G.toVS();
      }
      break;
    case 'in':
      if (d.m !== NET.m || !Array.isArray(d.s)) break;
      for (let i = 0; i < d.s.length; i++) { const f = d.b + i; if (NET.rin[f] === undefined) NET.rin[f] = d.s[i] | 0; if (f > NET.rmax) NET.rmax = f; }
      break;
    case 'hs': if (d.m === NET.m) { NET.rH[d.f] = d.h; if (NET.myH[d.f] !== undefined && NET.myH[d.f] !== d.h) NET.desync = true; } break;
    case 'res': if (d.m === NET.m && NET.slot === 1) NET.res = d; break;
    case 'bye': setTimeout(() => netLost(), 0); break;
  }
}
// ---- code entry (HTML input so phones get the number pad) ----
const netCSS = document.createElement('style');
netCSS.textContent = `#netui{position:fixed;left:50%;top:50%;transform:translate(-50%,-30%);z-index:8;display:none;flex-direction:column;align-items:center;gap:14px;font-family:Cairo,Tahoma,sans-serif;direction:rtl}
#netui.on{display:flex}
#netui input{width:260px;font:900 54px Teko,Impact,sans-serif;letter-spacing:18px;text-align:center;padding:6px 0 0 18px;border-radius:14px;border:3px solid #ff2a3a;background:#0b0e1c;color:#fff;outline:none;direction:ltr}
#netui .row{display:flex;gap:12px}
#netui button{font:800 22px Cairo,Tahoma,sans-serif;padding:8px 26px;border-radius:12px;border:2px solid rgba(255,255,255,.3);background:#d8142a;color:#fff;cursor:pointer}
#netui button.sec{background:rgba(255,255,255,.08)}`;
document.head.appendChild(netCSS);
const netUI = document.createElement('div'); netUI.id = 'netui';
netUI.innerHTML = '<input id="netcode" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="····"><div class="row"><button id="netgo">دخول</button><button id="netback" class="sec">رجوع</button></div>';
document.body.appendChild(netUI);
const netCodeEl = netUI.querySelector('#netcode');
function netInput(on) { netUI.classList.toggle('on', on); if (on) { netCodeEl.value = ''; setTimeout(() => { try { netCodeEl.focus(); } catch (e) { } }, 50); } else { try { netCodeEl.blur(); } catch (e) { } } }
function netSubmit() { const c = (netCodeEl.value || '').replace(/\D/g, '').slice(0, 4); if (c.length !== 4) { netCodeEl.style.borderColor = '#ffd34d'; return; } audioInit(); SFX.ok(); netJoin(c); }
netCodeEl.addEventListener('input', () => { netCodeEl.value = netCodeEl.value.replace(/\D/g, '').slice(0, 4); netCodeEl.style.borderColor = '#ff2a3a'; });
netCodeEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); netSubmit(); } if (e.key === 'Escape') { netInput(false); NET.ui = 'menu'; } });
netUI.querySelector('#netgo').addEventListener('click', netSubmit);
netUI.querySelector('#netback').addEventListener('click', () => { netInput(false); NET.ui = 'menu'; SFX.move(); });
// ---- online lobby scene ----
const NET_OPTS = ['إنشاء غرفة', 'دخول بكود', 'رجوع'];
function updOnline() {
  G.t++;
  const P0 = pads[0].p, P1 = pads[1].p, any = k => P0[k] || P1[k];
  const back = any('back') || anyP('Escape');
  if (NET.ui === 'menu') {
    if (any('up')) { NET.idx = (NET.idx + 2) % 3; SFX.move(); }
    if (any('down')) { NET.idx = (NET.idx + 1) % 3; SFX.move(); }
    let ok = any('ok') && G.t > 8;
    if (G.tap && Math.abs(G.tap[0] - VW / 2) < 300) { const i = Math.round((G.tap[1] - 380) / 70); if (i >= 0 && i < 3) { NET.idx = i; ok = true; } }
    if (ok) { SFX.ok(); if (NET.idx === 0) netHost(); else if (NET.idx === 1) { NET.ui = 'enter'; netInput(true); } else { G.toTitle(); } }
    else if (back && G.t > 8) { SFX.move(); G.toTitle(); }
  } else if (NET.ui === 'host' || NET.ui === 'join') {
    if (back || (G.tap && G.tap[1] > 600)) { SFX.move(); netClose(); }
  } else if (NET.ui === 'enter') {
    if (any('back')) { netInput(false); NET.ui = 'menu'; SFX.move(); }
  } else if (NET.ui === 'err') {
    if (any('ok') || back || G.tap) { SFX.move(); NET.ui = 'menu'; }
  }
}
function drawOnline() {
  drawStage({ x: Math.sin(G.frame * 0.003) * 120, z: 1, yaw: Math.sin(G.frame * 0.004) * 0.4 }, G.frame);
  ctx.fillStyle = 'rgba(3,4,10,0.75)'; ctx.fillRect(0, 0, VW, VH);
  txt('أونلاين', VW / 2, 110, { size: 84, weight: 900, color: '#fff', glow: '#ff1030', glowBlur: 35 });
  txt('العب ضد صاحبك من أي مكان', VW / 2, 185, { size: 26, weight: 700, color: '#ffd34d' });
  if (NET.ui === 'menu') {
    NET_OPTS.forEach((o, i) => {
      const y = 380 + i * 70, sel = i === NET.idx;
      if (sel) { ctx.save(); ctx.fillStyle = 'rgba(230,20,40,0.9)'; ctx.shadowColor = '#ff1030'; ctx.shadowBlur = 25; ctx.beginPath(); ctx.moveTo(VW / 2 - 210, y - 30); ctx.lineTo(VW / 2 + 230, y - 30); ctx.lineTo(VW / 2 + 210, y + 30); ctx.lineTo(VW / 2 - 230, y + 30); ctx.closePath(); ctx.fill(); ctx.restore(); }
      txt(o, VW / 2, y + 2, { size: 40, weight: 800, color: sel ? '#fff' : 'rgba(255,255,255,0.55)' });
    });
    txt('واحد يسوي غرفة ويرسل الكود، والثاني يكتب الكود ويدخل', VW / 2, 640, { size: 20, weight: 700, color: 'rgba(255,255,255,0.6)' });
    txt(fbDB() ? '🌐 الاتصال عن طريق السيرفر (Firebase)' : '🔗 اتصال مباشر بين الجهازين', VW / 2, 245, { size: 19, weight: 700, color: fbDB() ? '#7dffb0' : 'rgba(255,255,255,0.55)' });
  } else if (NET.ui === 'host') {
    if (NET.msg === 'ready') {
      txt('كود الغرفة', VW / 2, 300, { size: 34, weight: 800, color: 'rgba(255,255,255,0.8)' });
      txt(NET.code.split('').join(' '), VW / 2, 400, { size: 150, font: FE, weight: 700, color: '#ffd34d', glow: '#ff8a00', glowBlur: 30, rtl: false });
      txt('أرسل الكود لصاحبك وخله يختار «دخول بكود»', VW / 2, 500, { size: 26, weight: 700, color: '#fff' });
      txt('ننتظر صاحبك' + '.'.repeat(1 + ((G.frame / 20) | 0) % 3), VW / 2, 555, { size: 24, weight: 700, color: 'rgba(255,255,255,0.6)' });
    } else txt('نسوي الغرفة' + '.'.repeat(1 + ((G.frame / 20) | 0) % 3), VW / 2, 400, { size: 36, weight: 800, color: '#fff' });
    txt(TOUCH_ON ? 'المس هنا للإلغاء' : '○ / Esc = إلغاء', VW / 2, 650, { size: 20, weight: 700, color: 'rgba(255,255,255,0.5)' });
  } else if (NET.ui === 'enter') {
    txt('اكتب كود الغرفة', VW / 2, 290, { size: 36, weight: 800, color: '#fff' });
  } else if (NET.ui === 'join') {
    txt('نتصل بالغرفة ' + NET.code + '.'.repeat(1 + ((G.frame / 20) | 0) % 3), VW / 2, 400, { size: 38, weight: 800, color: '#fff' });
    txt(TOUCH_ON ? 'المس هنا للإلغاء' : '○ / Esc = إلغاء', VW / 2, 650, { size: 20, weight: 700, color: 'rgba(255,255,255,0.5)' });
  } else if (NET.ui === 'err') {
    txt('⚠', VW / 2, 330, { size: 70, rtl: false });
    const parts = NET.msg.split(' — ');
    parts.forEach((t, i) => txt(t, VW / 2, 410 + i * 46, { size: i ? 22 : 28, weight: 800, color: i ? 'rgba(255,255,255,0.8)' : '#ff9f9f' }));
    txt(TOUCH_ON ? 'المس الشاشة للرجوع' : 'اضغط أي زر للرجوع', VW / 2, 540, { size: 20, weight: 700, color: 'rgba(255,255,255,0.55)' });
  }
}
// ---- character select sync ----
function netSelSync() {
  const S = G.sel, me = NET.slot, op = 1 - me, r = NET.remote.sel;
  if (!S.outfit) S.outfit = [0, 0];
  if (r) { S.cur[op] = r.c; S.done[op] = r.rd; S.outfit[op] = r.o | 0; } else S.done[op] = false;
  const k = S.cur[me] + ':' + S.done[me] + ':' + S.outfit[me];
  if (k !== NET.sentSel || G.frame % 60 === 0) { NET.sentSel = k; netSend({ t: 'sel', c: S.cur[me], rd: S.done[me], o: S.outfit[me] | 0, e: eqOfProf(profCur(), selCI(S, me)) }); }
}
function netMatchReset() { NET.rin = []; NET.rmax = -1; NET.rH = {}; NET.myH = {}; NET.res = null; NET.remote.sel = null; NET.desync = false; }
function netLocalPad() { const a = pads[0], b = pads[1], o = { h: {}, p: {} }; for (const k of PADKEYS) { o.h[k] = a.h[k] || b.h[k]; o.p[k] = a.p[k] || b.p[k]; } return window.__netBot ? window.__netBot(o) : o; }
function netStartMatch() { NET.m++; netMatchReset(); NET.seed = (RR() * 2147483647) | 0; G.stageId = STAGE_POOL[(RR() * STAGE_POOL.length) | 0]; netSend({ t: 'go', m: NET.m, seed: NET.seed, c0: G.sel.cur[0], c1: G.sel.cur[1], o0: (G.sel.outfit || [0, 0])[0] | 0, o1: (G.sel.outfit || [0, 0])[1] | 0, st: G.stageId }); }
// ---- lockstep fight ----
function netFightInit(F) {
  NET.D = clamp(Math.ceil((NET.rtt / 2 + 24) / 16.7), 3, 14); NET.tkWin = 0; NET.stWin = 0;
  NET.sf = 0; NET.lin = []; NET.pendP = 0; NET.stall = 0; NET.menu = false;
  for (let i = 0; i < NET.D; i++) NET.lin[i] = 0;
  NET.lf = NET.D; NET.rng = mulberry(NET.seed);
  F.pads = [{ h: {}, p: {}, cpu: false, read() { } }, { h: {}, p: {}, cpu: false, read() { } }];
  F.f[0].pad = F.pads[0]; F.f[1].pad = F.pads[1];
  netSend({ t: 'in', m: NET.m, b: 0, s: NET.lin.slice(0, NET.lf) });
}
function netQuant(o) { for (const k in o) { const v = o[k]; if (typeof v === 'number' && v !== (v | 0) && isFinite(v)) o[k] = Math.round(v * 4096) / 4096; } }
function netHash(F) {
  let h = 2166136261; const mix = v => { h ^= v; h = Math.imul(h, 16777619); };
  for (const f of F.f) { mix(Math.round(f.x * 8)); mix(Math.round(f.y * 8)); mix(Math.round((f.z || 0) * 8)); mix(f.hp | 0); mix(f.sk | 0); for (const c of f.state) mix(c.charCodeAt(0)); }
  mix(F.proj.length); mix(F.timer | 0); mix(F.wins[0] * 3 + F.wins[1]); return h >>> 0;
}
function netFightTick() {
  const F = G.fight;
  // online menu (game keeps running)
  if (anyP('Escape', 'KeyP', 'GPStart')) { NET.menu = !NET.menu; NET.midx = 0; SFX.move(); }
  let localPad = netLocalPad();
  if (NET.menu) {
    const P = localPad.p;
    if (P.up || P.down) { NET.midx = 1 - NET.midx; SFX.move(); }
    let ok = P.ok;
    if (G.tap && Math.abs(G.tap[0] - VW / 2) < 300) { const i = Math.round((G.tap[1] - 330) / 70); if (i === 0 || i === 1) { NET.midx = i; ok = true; } }
    if (ok) { SFX.ok(); if (NET.midx === 0) NET.menu = false; else { netClose(); G.scene = 'online'; G.fight = null; G.t = 0; NET.ui = 'menu'; return; } }
    localPad = { h: {}, p: {} };
  }
  // sample local input for a future frame
  const v = netEnc(localPad); NET.pendP |= v & ~NMASK;
  let sampled = 0;
  while (NET.lf < NET.sf + NET.D && sampled < 2) {
    NET.lin[NET.lf] = sampled ? (v & NMASK) : ((v & NMASK) | NET.pendP); if (!sampled) NET.pendP = 0; NET.lf++; sampled++;
  }
  if (sampled) { const b = Math.max(0, NET.lf - 24); netSend({ t: 'in', m: NET.m, b, s: NET.lin.slice(b, NET.lf) }); }
  if (NET.conn && NET.conn.flush && (G.frame & 1)) NET.conn.flush();
  // advance while both inputs are known (catch up a little when behind)
  let steps = 0;
  while (steps < 3 && NET.sf < NET.lf && NET.rin[NET.sf] !== undefined && G.scene === 'fight') {
    netStep(F); steps++;
    if (NET.rmax - NET.sf < NET.D + 3) break;
  }
  NET.stall = steps ? 0 : NET.stall + 1;
  // adapt the input delay to the connection
  NET.tkWin = (NET.tkWin || 0) + 1; if (!steps && G.scene === 'fight') NET.stWin = (NET.stWin || 0) + 1;
  if (NET.tkWin >= 60) {
    const target = clamp(Math.ceil((NET.rtt / 2 + 24) / 16.7), 3, 14);
    if ((NET.stWin || 0) > 4 || NET.D < target) NET.D = Math.min(14, NET.D + 1);
    else if (NET.D > target && !NET.stWin) NET.D--;
    NET.tkWin = 0; NET.stWin = 0;
  }
}
function netStep(F) {
  const f = NET.sf, mine = NET.lin[f], theirs = NET.rin[f];
  netDec(NET.slot === 0 ? mine : theirs, F.pads[0]); netDec(NET.slot === 0 ? theirs : mine, F.pads[1]);
  const saveTP = TP, MR = Math.random; TP = new Set(); Math.random = NET.rng;
  try { F.update(); } finally { Math.random = MR; TP = saveTP; }
  for (const fi of F.f) { netQuant(fi); if (fi.pose) netQuant(fi.pose); }
  for (const pr of F.proj) netQuant(pr);
  netQuant(F.cam);
  NET.sf++;
  if (f % 30 === 0) { const h = netHash(F); NET.myH[f] = h; netSend({ t: 'hs', m: NET.m, f, h }); if (NET.rH[f] !== undefined && NET.rH[f] !== h) NET.desync = true; delete NET.myH[f - 600]; delete NET.rH[f - 600]; }
  delete NET.lin[f - 120]; delete NET.rin[f - 120];
}
function drawNetOverlay() {
  if (G.scene !== 'fight' || !NET.on) return;
  const ms = Math.round(NET.rtt);
  txt(`${NET.via === 'server' ? '🌐' : '📶'} ${ms}ms`, VW / 2, VH - 14, { size: 16, font: FE, weight: 600, color: ms < 120 ? 'rgba(125,255,176,0.8)' : ms < 220 ? 'rgba(255,211,77,0.85)' : 'rgba(255,120,120,0.9)', rtl: false });
  if (NET.desync) txt('⚠ تزامن', VW / 2 + 90, VH - 14, { size: 15, weight: 700, color: 'rgba(255,180,120,0.8)' });
  if (NET.stall > 12) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, VH / 2 - 40, VW, 80);
    txt('⏳ ننتظر صاحبك' + '.'.repeat(1 + ((G.frame / 15) | 0) % 3), VW / 2, VH / 2, { size: 34, weight: 800, color: '#fff' });
  }
  if (NET.menu) {
    ctx.fillStyle = 'rgba(3,4,10,0.8)'; ctx.fillRect(0, 0, VW, VH);
    txt('القائمة', VW / 2, 220, { size: 60, weight: 900, color: '#fff', glow: '#ff2040' });
    txt('اللعبة ما توقف في الأونلاين', VW / 2, 270, { size: 20, weight: 700, color: '#ffd34d' });
    ['استمرار', 'انسحاب'].forEach((o, i) => {
      const y = 330 + i * 70, sel = i === NET.midx;
      if (sel) { ctx.fillStyle = 'rgba(230,20,40,0.9)'; ctx.fillRect(VW / 2 - 200, y - 28, 400, 56); }
      txt(o, VW / 2, y + 2, { size: 36, weight: 800, color: sel ? '#fff' : 'rgba(255,255,255,0.6)' });
    });
  }
}

// ================= STORY MODE =================
const CH_ROLE = ['reg', 'reg', 'nokh', 'reg', 'reg', 'rais', 'rais2'];
const CH_REG = { 0: 0, 1: 1, 3: 2, 4: 3 };
const NCHAP = CH_ROLE.length;
const CH_NAMES = ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث', 'الفصل الرابع', 'الفصل الخامس', 'الفصل السادس', 'الفصل الأخير'];
const CH_STAGE = ['arena', 'hosh', 'port', 'pitch', 'roof', 'palace', 'palace2'];
const CH_TIME = ['الليل… في الحلبة', 'العصر… في حوش البيت القديم', 'الفجر… في الميناء، والبحر هايج', 'المغرب… في ملعب الكورة', 'نص الليل… فوق السطح', 'قصر الرئيس… الذهب في كل مكان', 'السما صارت حمرا… والقصر يحترق'];
const CH_GLOW = { reg: '#ff1030', nokh: '#3cb4ff', shadow: '#b030ff', rais: '#d4a640', rais2: '#ff1030' };
function nmOf(ci, shadow) { return (shadow ? 'ظل ' : '') + CHARS[ci].name; }
function storyOpp(ch) { const S = G.story, r = CH_ROLE[ch]; return r === 'nokh' ? NOKH : r === 'rais' ? RAIS : r === 'rais2' ? RAIS2 : r === 'shadow' ? S.pc : S.opps[CH_REG[ch]]; }
function storyMapOpen() { // story entry: pick the chapter first, then the hero
  const order = []; for (let i = 0; i < NCH; i++) order.push(i);
  for (let i = order.length - 1; i > 0; i--) { const j = (RR() * (i + 1)) | 0; [order[i], order[j]] = [order[j], order[i]]; }
  G.storyMap = null; G.mode = 'cpu';
  G.story = { pc: null, order, opps: order.slice(0, 4), ch: 0, step: 'select', t: 0, lines: [], li: 0, ct: 0, phase: 'pre', final: false, sel: 0 };
  storySelect();
}
function storyStart(pc) {
  const M = G.storyMap; G.storyMap = null;
  let opps, ch = 0;
  if (M && M.order) { opps = M.order.slice(0, 4); const k = opps.indexOf(pc); if (k >= 0) opps[k] = M.order[4]; ch = M.sel || 0; }
  else { const pool = []; for (let i = 0; i < NCH; i++) if (i !== pc) pool.push(i); for (let i = pool.length - 1; i > 0; i--) { const j = (RR() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; } opps = pool.slice(0, 4); }
  G.story = { pc, opps, ch, step: 'card', t: 0, lines: [], li: 0, ct: 0, phase: 'pre', final: false, sel: ch };
  if (M) storyChapter(); else storySelect();
}
function storyScript(ch, phase) {
  const S = G.story, role = CH_ROLE[ch], P = nmOf(S.pc), oc = storyOpp(ch), O = nmOf(oc, role === 'shadow'), ol = ((PERSONA[oc] && PERSONA[oc].intro[0]) || '').replace(/[!.؟?…]+$/, '');
  if (phase === 'pre') {
    if (ch === 0) return [['N', 'في ليلة من ليالي الشلة… الكل مجتمع في الحلبة.'], ['N', 'وفجأة… انطفت الأنوار. ولما رجعت… كأس الشلة اختفى! 🏆'], ['P', 'منو اللي أخذ الكأس؟! محد بيطلع من هنا لين أعرف!'], ['O', `${ol}… ولا تتهمني يا ${P}!`]];
    if (ch === 1) return [['N', 'العصر… الشمس تغيب ورا حوش البيت القديم.'], ['P', `أدري إنك هنا يا ${O}!`], ['O', `${ol}… ما بتاخذ مني شي إلا بالقوة!`]];
    if (role === 'nokh') return [['N', 'الفجر… ريحة البحر، والسفن راسية في الميناء.'], ['N', 'وعلى ظهر سفينة كبيرة… واقف رجل بلبس أبيض. النوخذة!'], ['O', 'هذا بحري يا ولد. والكأس؟ أمانة عندي لين يجي الرئيس.'], ['P', 'الرئيس؟! منو هذا الرئيس؟'], ['O', 'لو غلبتني… يمكن أقولك. بس البحر ما يرحم!']];
    if (ch === 3) return [['N', 'المغرب… أنوار الملعب تولّعت والجمهور يصارخ.'], ['O', `هذا ملعبي يا ${P}. هنا محد يفوز علي!`], ['P', 'نشوف… الكأس أهم من كل شي.']];
    if (ch === 4) return [['N', 'نص الليل… فوق السطح، والقمر طالع.'], ['O', `وصلت لين هنا؟ ما توقعتها منك يا ${P}!`], ['P', 'وين الرئيس؟ قول!'], ['O', 'إذا غلبتني… أقولك.']];
    if (role === 'rais') return [['N', 'قصر كبير… ذهب وثريات، وفي آخر القاعة كرسي ضخم.'], ['N', 'وعلى الكرسي قاعد… الرئيس. وجنبه كأس الشلة! 🏆'], ['O', 'وصلت لين هنا؟ النوخذة وجماعتي ما قدروا عليك؟'], ['O', 'أنا اللي جمعتكم… وأنا اللي أخذت الكأس. كلكم شغالين عندي!'], ['P', 'الكأس للشلة… وبتعطيني إياه غصب!']];
    return [['N', 'الرئيس طاح… بس فجأة بدأ يضحك.'], ['O', 'هههه… تحسب إنها خلصت؟'], ['N', 'السما صارت حمرا… وطلع له جناحين سود من ظهره، وعيونه ولّعت أحمر!'], ['O', 'الحين… تشوف قوتي الحقيقية!'], ['P', 'ولو صار لك ألف جناح… الكأس راجع للشلة!']];
  }
  if (ch === 0) return [['O', 'خلاص خلاص! مو أنا… بس شفت واحد طالع صوب الحوش.'], ['P', 'يلا… على الحوش!']];
  if (ch === 1) return [['O', 'الكأس؟ سمعتهم يقولون إنه انشحن على سفينة في الميناء!'], ['P', 'الميناء… جاي.']];
  if (role === 'nokh') return [['O', 'آخ… والله إنك قوي. البحر ما شاف مثلك.'], ['O', 'الكأس مو عندي… الرئيس أخذه. وجماعته في الملعب.'], ['P', 'الرئيس… أنا جايك!']];
  if (ch === 3) return [['O', 'جماعة الرئيس يتجمعون الليلة… فوق السطح!'], ['P', 'السطح… يلا.']];
  if (ch === 4) return [['O', 'خلاص… الرئيس في قصره. بس محد راح له… ورجع!'], ['N', 'وطاحت من جيبه ورقة مكتوب فيها: قصر الرئيس.'], ['P', 'خلاص… المواجهة الأخيرة.']];
  if (role === 'rais') return [['O', 'مستحيل… أنا… الرئيس… أخسر؟!']];
  return [['N', 'الجناحين تكسّروا… والهالة الحمرا انطفت.'], ['O', 'الكأس… لك. أنت تستاهله.'], ['N', 'والكأس رجع للشلة! 🏆'], ['P', CHARS[S.pc].quote], ['N', 'والشلة رجعت تضحك… لين البطولة الجاية.'], ['N', 'النهاية 🎉 — شكراً إنك لعبت!']];
}
const STORY_OPEN = NCHAP - 1; // all seven chapters open from the start
function storySaved() { try { return clamp(+localStorage.getItem('shilla_story_max') || 0, 0, NCHAP - 1); } catch (e) { return 0; } }
function storyMax() { return Math.max(STORY_OPEN, storySaved()); }
function storySave(ch) { try { if (ch > storySaved()) localStorage.setItem('shilla_story_max', ch); } catch (e) { } }
function storySelect() { const S = G.story; S.step = 'select'; S.t = 0; S.sel = clamp(S.sel == null ? S.ch : S.sel, 0, storyMax()); G.scene = 'story'; G.stageId = CH_STAGE[S.sel]; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } }
const CH_PLACE = ['الحلبة', 'حوش البيت', 'الميناء', 'الملعب', 'السطح', 'القصر', 'القصر المحترق'];
const SEL_W = 160, SEL_H = 330, SEL_GAP = 14, SEL_Y = 190;
function selCardX(i) { return VW / 2 + ((NCHAP - 1) / 2 - i) * (SEL_W + SEL_GAP) - SEL_W / 2; }
function storyChapter() { const S = G.story; storySave(S.ch); S.step = 'card'; S.t = 0; G.scene = 'story'; G.stageId = CH_STAGE[S.ch]; if (AC) Music.intensity = 0; }
function storySpeak() { const S = G.story, L = S && S.lines[S.li]; if (!L || !SET.voice || muted) return; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } const role = CH_ROLE[S.ch], oc = storyOpp(S.ch); const ci = L[0] === 'P' ? S.pc : oc; const T = L[0] === 'N' ? [0.95, 0.95] : ((window.VOICE_TTS && window.VOICE_TTS[ci]) || [1, 1]); if (L[0] === 'O' && role === 'shadow') { const pk = voxProKeys(L[1], 'dark'); if (pk) { voxPlay(pk, 1, true); return; } } if (speakRec(L[1], L[0] === 'N' ? 99 : ci, true)) return; speakAr(L[1], L[0] === 'O' && role === 'shadow' ? T[0] * 0.6 : T[0], T[1], L[0] === 'N' ? 99 : ci); }
function storyTalk(phase) { const S = G.story; S.step = 'talk'; S.phase = phase; S.lines = storyScript(S.ch, phase); S.li = 0; S.ct = 0; S.t = 0; G.scene = 'story'; G.stageId = CH_STAGE[S.ch]; storySpeak(); }
function storyFight() {
  voiceStop(); const S = G.story; G.mode = 'cpu'; G.stageId = CH_STAGE[S.ch];
  G.sel = { cur: [S.pc, storyOpp(S.ch)], done: [true, true], t: 0, readyT: 0, outfit: [S.pcOutfit | 0, 0] };
  G.toVS();
}
function storySetupFight(F) {
  const S = G.story; if (!S) return; const op = F.f[1], me = F.f[0], role = CH_ROLE[S.ch];
  // story hero is stronger: hits harder and takes a bit less damage
  me.dmgMul = 1.35; me.defMul = 0.85; me.storyBuff = true;
  const reg = CH_REG[S.ch] || 0; F.pads[1].lvl = role === 'reg' ? 1 + reg * 0.5 : role === 'nokh' ? 2.2 : role === 'shadow' ? 2.6 : role === 'rais' ? 2.7 : 3;
  const hpx = (op, k) => { op.maxHp = Math.round(op.maxHp * k); op.hp = op.trailHp = op.maxHp; };
  if (role === 'shadow') { op.shadow = true; hpx(op, 1.5); op.dmgMul = 1.15; op.dispName = nmOf(op.ci, true); }
  if (role === 'nokh') { op.bossAI = 1; op.bossCD = 80; hpx(op, 1.2); op.dmgMul = 1.25; }
  if (role === 'rais') { op.bossAI = 1; op.bossCD = 90; hpx(op, 1.25); op.dmgMul = 1.25; }
  if (role === 'rais2') { op.bossAI = 1; op.bossCD = 70; hpx(op, 1.22); op.dmgMul = 1.12; op.dispName = 'الرئيس — الجناح الأسود'; }
}
function storyResult(w) {
  const S = G.story;
  if (w === 0) { if (CH_ROLE[S.ch] === 'rais2') S.final = true; storyTalk('post'); if (S.final) SFX.ready(); }
  else { S.step = 'lost'; S.t = 0; G.scene = 'story'; }
}
function storyAdvance() {
  const S = G.story;
  if (S.phase === 'pre') { storyFight(); return; }
  if (S.final || S.ch >= NCHAP - 1) { G.story = null; G.toTitle(); return; }
  S.ch++; storySave(S.ch);
  if (CH_ROLE[S.ch] === 'rais2') { G.stageId = CH_STAGE[S.ch]; storyTalk('pre'); SFX.rage(); return; } // transformation follows straight on
  storyChapter();
}
function updStory() {
  const S = G.story; if (!S) { G.toTitle(); return; } S.t++;
  const P0 = pads[0].p, P1 = pads[1].p, ok = P0.ok || P1.ok || anyP('Click') || !!G.tap, back = P0.back || P1.back || anyP('Escape');
  if (S.step === 'select') {
    const mx = storyMax(), tp = G.tap || window.__mtap; window.__mtap = null;
    const go = n => { n = clamp(n, 0, NCHAP - 1); if (n === S.sel) return; if (n > mx) { SFX.move(); S.lockT = 20; return; } S.sel = n; G.stageId = CH_STAGE[n]; SFX.move(); };
    const start = () => { SFX.ok(); if (S.pc == null) { const keep = S; G.toSelect(); G.storyPick = true; G.storyMap = keep; return; } S.ch = S.sel; S.phase = 'pre'; S.final = false; storyChapter(); };
    if (S.t < 8) return;
    if (tp) {
      if (tp[0] < 200 && tp[1] < 90) { SFX.move(); G.story = null; G.toTitle(); return; }
      for (let i = 0; i < NCHAP; i++) { const x = selCardX(i); if (tp[0] >= x && tp[0] <= x + SEL_W && tp[1] >= SEL_Y && tp[1] <= SEL_Y + SEL_H) { if (i > mx) { S.lockT = 20; SFX.move(); return; } if (i === S.sel) { start(); return; } go(i); return; } }
      if (tp[1] > SEL_Y + SEL_H + 30 && tp[1] < SEL_Y + SEL_H + 130 && Math.abs(tp[0] - VW / 2) < 220) { start(); return; }
      return;
    }
    if (P0.left || P1.left) { go(S.sel + 1); return; }
    if (P0.right || P1.right) { go(S.sel - 1); return; }
    if (back) { SFX.move(); G.story = null; G.toTitle(); return; }
    if (ok) { start(); return; }
    return;
  }
  if (S.step === 'card') {
    if (back && storyMax() > 0) { SFX.move(); S.sel = S.ch; storySelect(); return; }
    if (S.t > 170 || (ok && S.t > 20)) { SFX.move(); storyTalk(S.ch === 4 || S.phase !== 'post' ? 'pre' : 'pre'); } return; }
  if (S.step === 'talk') {
    const L = S.lines[S.li]; S.ct += 1.5;
    if (back && S.t > 10) { SFX.move(); storyAdvance(); return; }
    if (ok && S.t > 6) { if (S.ct < L[1].length) S.ct = 999; else { S.li++; S.ct = 0; SFX.move(); if (S.li >= S.lines.length) { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } storyAdvance(); } else storySpeak(); } }
    return;
  }
  if (S.step === 'lost') { if (S.t > 30) { if (ok) { SFX.ok(); storyFight(); } else if (back) { SFX.move(); if (storyMax() > 0) { S.sel = S.ch; storySelect(); } else { G.story = null; G.toTitle(); } } } }
}
function shadowOf(img) {
  if (img._sh) return img._sh;
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d');
  g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(36,0,56,0.82)'; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'source-over'; return (img._sh = c);
}
function wrapLines(str, maxW) {
  const words = str.split(' '), out = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
function drawStorySelect(S) {
  const mx = storyMax(), a = Math.min(1, S.t / 15);
  ctx.save(); ctx.globalAlpha = a;
  txt('اختر المرحلة', VW / 2, 80, { size: 64, weight: 900, color: '#fff', glow: '#ff1030', glowBlur: 30 });
  txt(S.pc == null ? 'اختار المرحلة… وبعدها تختار بطلك' : 'اختار وين تكمل القصة', VW / 2, 140, { size: 24, weight: 800, color: '#ffd34d' });
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rrect(16, 16, 170, 60, 14); ctx.fill();
  txt('→ رجوع', 101, 47, { size: 24, weight: 800, color: '#fff' });
  for (let i = 0; i < NCHAP; i++) {
    const x = selCardX(i), y = SEL_Y, on = i === S.sel, open = i <= mx, role = CH_ROLE[i], col = CH_GLOW[role];
    const lift = on ? -12 - Math.sin(G.frame * 0.1) * 4 : 0;
    ctx.save(); ctx.translate(0, lift);
    if (on) { ctx.shadowColor = col; ctx.shadowBlur = 30; }
    ctx.fillStyle = open ? 'rgba(10,12,22,0.9)' : 'rgba(10,10,14,0.75)'; rrect(x, y, SEL_W, SEL_H, 16); ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = on ? 5 : 2; ctx.strokeStyle = on ? col : open ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'; rrect(x, y, SEL_W, SEL_H, 16); ctx.stroke();
    txt(String(i + 1), x + SEL_W / 2, y + 36, { size: 40, weight: 900, color: open ? (role === 'reg' ? '#fff' : col) : 'rgba(255,255,255,0.3)', rtl: false });
    const oc = storyOpp(i), im = IMG['face' + (oc + 1)], fs = 124, fx = x + (SEL_W - fs) / 2, fy = y + 70;
    ctx.save(); rrect(fx, fy, fs, fs, 12); ctx.clip();
    ctx.fillStyle = role === 'reg' ? '#1a1d2b' : col + '55'; ctx.fillRect(fx, fy, fs, fs);
    if (im) { if (!open) ctx.filter = 'brightness(0.12)'; ctx.drawImage(im, fx, fy, fs, fs); ctx.filter = 'none'; }
    if (role === 'rais2' && open) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,16,48,0.25)'; ctx.fillRect(fx, fy, fs, fs); }
    ctx.restore();
    if (!open) txt('🔒', x + SEL_W / 2, fy + fs / 2, { size: 52, rtl: false });
    const nm = !open ? '؟؟؟' : role === 'rais2' ? 'الرئيس المتحوّل' : nmOf(oc);
    txt(nm, x + SEL_W / 2, y + 222, { size: nm.length > 11 ? 17 : 21, weight: 900, color: open ? '#fff' : 'rgba(255,255,255,0.35)' });
    txt(open ? CH_PLACE[i] : 'مقفلة', x + SEL_W / 2, y + 256, { size: 18, weight: 800, color: open ? '#ffd34d' : 'rgba(255,255,255,0.3)' });
    if (role !== 'reg') txt(role === 'nokh' ? 'زعيم' : 'الزعيم الأخير', x + SEL_W / 2, y + 296, { size: 17, weight: 900, color: open ? col : 'rgba(255,255,255,0.25)' });
    ctx.restore();
  }
  if (S.lockT > 0) { S.lockT--; txt('🔒 اغلب الرئيس أول… وبعدها تنفتح', VW / 2, SEL_Y + SEL_H + 34, { size: 24, weight: 800, color: '#ff6b6b' }); }
  const bx = VW / 2 - 200, by = SEL_Y + SEL_H + 58, pulse = 0.85 + 0.15 * Math.sin(G.frame * 0.12);
  ctx.fillStyle = `rgba(255,42,58,${pulse})`; rrect(bx, by, 400, 70, 18); ctx.fill();
  txt('العب ' + CH_NAMES[S.sel], VW / 2, by + 36, { size: 32, weight: 900, color: '#fff' });
  txt(TOUCH_ON ? 'المس مرحلة لاختيارها · المسها مرة ثانية أو الزر الأحمر للبدء' : '◀ ▶ لاختيار المرحلة   ·   ✕ / Enter للبدء   ·   ○ / Esc رجوع', VW / 2, VH - 22, { size: 18, weight: 700, color: 'rgba(255,255,255,0.6)' });
  ctx.restore();
}
function drawStory() {
  const S = G.story; if (!S) return;
  drawStage({ x: Math.sin(G.frame * 0.004) * 120, z: 1, yaw: Math.sin(G.frame * 0.003) * 0.35 }, G.frame, CH_STAGE[S.ch]);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, VW, VH);
  if (S.step === 'select') { drawStorySelect(S); return; }
  // chapter progress
  for (let i = 0; i < NCHAP; i++) { const x = VW / 2 + ((NCHAP - 1) / 2 - i) * 40; ctx.fillStyle = i < S.ch ? '#ffd34d' : i === S.ch ? '#ff2a3a' : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(x, 34, i === S.ch ? 11 : 8, 0, 7); ctx.fill(); }
  if (S.step === 'card') {
    const a = Math.min(1, S.t / 25) * Math.min(1, (170 - S.t) / 20 + 0.2);
    ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, VH / 2 - 130, VW, 260);
    txt(CH_NAMES[S.ch], VW / 2, VH / 2 - 40, { size: 92, weight: 900, color: '#fff', glow: CH_GLOW[CH_ROLE[S.ch]], glowBlur: 35 });
    txt(CH_TIME[S.ch], VW / 2, VH / 2 + 50, { size: 34, weight: 800, color: '#ffd34d' });
    { const r = CH_ROLE[S.ch]; txt(r === 'shadow' || r === 'rais' ? 'الخصم: ؟؟؟' : r === 'rais2' ? 'الخصم: الرئيس… بجناحين' : 'الخصم: ' + nmOf(storyOpp(S.ch)), VW / 2, VH / 2 + 100, { size: 24, weight: 700, color: 'rgba(255,255,255,0.75)' }); }
    ctx.restore(); return;
  }
  if (S.step === 'lost') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, VW, VH);
    txt('خسرت… 😵', VW / 2, 280, { size: 90, weight: 900, color: '#ff4d5a', glow: '#ff1030' });
    txt('الكأس للحين مفقود!', VW / 2, 370, { size: 30, weight: 800, color: '#fff' });
    if (S.t > 30 && G.frame % 60 < 42) txt(TOUCH_ON ? 'المس الشاشة لإعادة الفصل  ·  ○ ' + (storyMax() > 0 ? 'اختيار المرحلة' : 'للقائمة') : '✕ / Enter = إعادة الفصل   ·   ○ / Esc = ' + (storyMax() > 0 ? 'اختيار المرحلة' : 'القائمة الرئيسية'), VW / 2, 470, { size: 24, weight: 800, color: '#ffd34d' });
    return;
  }
  // dialogue
  const L = S.lines[S.li] || ['N', ''], who = L[0], role = CH_ROLE[S.ch], boss = role === 'shadow', big = role !== 'reg', bcol = CH_GLOW[role], oc = storyOpp(S.ch);
  const OFs = outfitOf(S.pc, S.pcOutfit), pimg = imgOf('vs', S.pc, OFs && OFs.id), oimg0 = IMG['vs' + (oc + 1)], oimg = boss ? shadowOf(oimg0) : oimg0;
  const drawP = (im, cx, flip, on, hh = 560) => { const h = hh, w = im.width * h / im.height; ctx.save(); ctx.globalAlpha = on ? 1 : 0.38; if (flip) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); } ctx.drawImage(im, cx - w / 2, VH - h - (on ? 6 : 0), w, h); ctx.restore(); };
  drawP(pimg, 300, false, who === 'P', 560 * pimg.height / IMG['vs' + (S.pc + 1)].height); drawP(oimg, VW - 300, true, who === 'O');
  if (big) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(VW - 300, 380, 30, VW - 300, 380, 330); g.addColorStop(0, bcol + (role === 'rais2' ? '77' : '44')); g.addColorStop(1, bcol + '00'); ctx.fillStyle = g; ctx.fillRect(VW - 640, 40, 640, 680); ctx.restore(); }
  const bx = 150, by = 500, bw = VW - 300, bh = 190;
  ctx.save(); ctx.fillStyle = 'rgba(6,8,16,0.92)'; ctx.strokeStyle = big && who === 'O' ? bcol : '#ff2a3a'; ctx.lineWidth = 3; rrect(bx, by, bw, bh, 16); ctx.fill(); ctx.stroke(); ctx.restore();
  const name = who === 'N' ? 'الراوي' : who === 'P' ? nmOf(S.pc) : nmOf(oc, boss);
  const ncol = who === 'N' ? '#9fd8ff' : who === 'P' ? '#3ea0ff' : (big ? bcol : '#ff6b6b');
  ctx.save(); ctx.font = `900 26px ${FA}`; const nw = ctx.measureText(name).width + 40; ctx.fillStyle = ncol; rrect(bx + bw - nw - 24, by - 22, nw, 44, 12); ctx.fill(); ctx.restore();
  txt(name, bx + bw - 24 - nw / 2, by + 1, { size: 26, weight: 900, color: '#05060b' });
  const shown = L[1].slice(0, Math.floor(S.ct));
  ctx.save(); ctx.font = `800 30px ${FA}`; const lines = wrapLines(shown, bw - 80); ctx.restore();
  lines.slice(0, 3).forEach((ln, i) => txt(ln, bx + bw - 40, by + 62 + i * 44, { size: 30, weight: 800, color: who === 'N' ? 'rgba(230,240,255,0.92)' : '#fff', align: 'right', italic: who === 'N' }));
  if (S.ct >= L[1].length && G.frame % 40 < 26) txt('▼', bx + 40, by + bh - 30, { size: 24, color: '#ffd34d', rtl: false });
  txt(TOUCH_ON ? 'المس للمتابعة · ○ تخطي' : '✕ / Enter = التالي   ·   ○ / Esc = تخطي', VW / 2, VH - 12, { size: 15, weight: 700, color: 'rgba(255,255,255,0.45)' });
}

// ================= SCENES =================
const G = {
  scene: 'boot', frame: 0, mode: '2p', menuIdx: 0, debug: false, fight: null, sel: null, vs: null, res: null, t: 0,
  toTitle() { if (window.__updPending) { window.__updPending = false; location.reload(); } this.vsName = null; this.cup = null; this.shop = null; if (this.world) { worldSave(); this.world = null; } this.scene = 'title'; this.t = 0; this.fight = null; this.story = null; this.storyPick = false; this.storyMap = null; if (AC) Music.intensity = 0; },
  toSelect() {
    this.story = null; this.storyPick = false; this.cup = null; this.world = null;
    const prev = this.sel ? this.sel.cur.slice() : [0, 1];
    const pout = this.sel && this.sel.outfit ? this.sel.outfit.slice() : [0, 0];
    this.scene = 'select'; this.t = 0; this.fight = null; this.sel = { cur: prev, done: [false, false], t: 0, readyT: 0, outfit: pout };
    if (AC) Music.intensity = 0;
  },
  toVS() { this.scene = 'vs'; this.t = 0; if (!this.story && !(this.world && this.world.sagaF) && this.mode !== 'online') this.stageId = STAGE_POOL[(RR() * STAGE_POOL.length) | 0]; },
  fightEqFor() {
    try { if (this.cup && this.cup.play) return this.cup.play.eq || [null, null];
      if (this.mode === 'online') { const me = NET.slot | 0, a = [null, null]; a[me] = eqOfProf(profCur(), selCI(this.sel, me)); a[1 - me] = eqClean(NET.reqEq); return a; }
      return [eqOfProf(profCur(), selCI(this.sel, 0)), null]; } catch (e) { return [null, null]; }
  },
  toFight() { this.scene = 'fight'; this.t = 0; this.fight = new Fight(selCI(this.sel, 0), selCI(this.sel, 1), this.mode); { const mi = this.mode === 'online' ? NET.slot : 0, mc = this.fight.f[mi].ci; statsPing({ fight: 1, char: CHARS[mc].name, mode: this.story ? 'القصة' : this.cup ? 'الدوري' : this.world ? 'العالم المفتوح' : ({ '2p': 'لاعبين', cpu: 'ضد الكمبيوتر', online: 'أونلاين', train: 'التدريب' })[this.mode] || this.mode }); } if (this.mode === 'online') netFightInit(this.fight); if (this.story) storySetupFight(this.fight); if (this.cup) cupSetupFight(this.fight); if (this.world && this.world.sagaF) sagaSetupFight(this.fight); },
  toResult(w, fight) { if (this.story) { storyResult(w); return; } if (this.cup && this.cup.play) { cupResult(w); return; } if (this.world && this.world.sagaF) { sagaResult(w); return; } if (this.world && this.world.fightWith) { worldResult(w); return; } this.scene = 'result'; this.t = 0; this.res = { w, ci: fight.cis[w], wins: fight.wins.slice() }; if (AC) Music.intensity = 0; say(`${w === 0 ? 'Player one' : (this.mode === 'cpu' ? 'Computer' : 'Player two')} wins`); },
};
window.__storyAPI = { storyAdvance, storyStart, storyFight, storyMapOpen, storyScript };
window.__worldAPI = { worldOpen, worldStart, WMAPS: () => WMAPS, worldGo };
window.__w2API = { wConsume, wMenu, citTalk, worldWithdraw, wEvDone, wEvToday, wEventsOn, wSleep, sgDue, wChallenge, sgChapterEnd, calOpen, sqBrain, sqTick, sqTalk, sqGoal, sqAccept, sqSpot, sqFree, shopOpen, wTalk, worldResult, wDay: W => wDay(W), wHour: W => wHour(W), W_FOOD: () => W_FOOD };
window.__shopAPI = { profCur, shopPrev, shopOpen, clothRig, PROF: () => PROF, profSave, cupOpen, profAdd };
window.__voiceTexts = () => { const T = new Set(); PERSONA.forEach(P => ['intro', 'skill', 'win'].forEach(k => (P[k] || []).forEach(x => T.add(x)))); Object.values(SKILL2_LINE).forEach(x => T.add(x)); Object.values(BOSS_LINES).forEach(x => T.add(x)); FIN.forEach(F => F && F.line && T.add(F.line)); CHARS.forEach(c => c.quote && T.add(c.quote)); return [...T]; };
window.__voiceSegs = t => voiceSegs(t).map(x => x.t); window.__VOXS = VOX; window.__speakRec = speakRec; window.__VOX = VOX; window.__NET = NET; window.__netHost = () => netHost(); window.__netJoin = c => netJoin(c); window.__netHash = () => G.fight ? netHash(G.fight) : 0;
window.__G = G; window.__MV = MV; window.__SK = SKILL_IDS; window.__COMBOS = COMBOS; window.__CPU = CPUPad; window.__txt = txt; window.__IMG = IMG; window.__FX = FX; window.__spark = spark;

const SET_ROWS = [
  ['vol', 'مستوى الصوت العام'], ['music', 'الموسيقى'], ['fx', 'أصوات المعركة والضربات'], ['gong', 'جرس بداية الجولة و K.O.'], ['voice', 'أصوات وكلام الشخصيات'], ['ui', 'أصوات القوائم'], ['rumble', 'اهتزاز يد التحكم'], ['install', 'ثبّت اللعبة كتطبيق 📲'], ['name', 'اسمك في اللعبة'], ['back', 'رجوع']];
const SR0 = 150, SRH = 52;
let setIdx = 0;
function applySet() { if (master && !muted) master.gain.value = MASTER_VOL * SET.vol; if (musG) musG.gain.value = SET.music ? MUSIC_VOL : 0; musicOn = SET.music; saveSet(); }
function updSettings() { // returns true when closed
  const P0 = pads[0].p, P1 = pads[1].p, any = k => P0[k] || P1[k];
  if (any('up')) { setIdx = (setIdx + SET_ROWS.length - 1) % SET_ROWS.length; SFX.move(); }
  if (any('down')) { setIdx = (setIdx + 1) % SET_ROWS.length; SFX.move(); }
  if (G.pwaHelp) { if (any('back') || any('ok') || G.tap || anyP('Escape', 'Click', 'GPStart')) { G.pwaHelp = null; SFX.move(); } return false; }
  if (any('back') || anyP('Escape', 'GPStart')) { setIdx = 0; SFX.move(); return true; }
  let tapOk = false;
  if (G.tap && Math.abs(G.tap[0] - VW / 2) < 440) {
    const i = Math.round((G.tap[1] - SR0) / SRH);
    if (i >= 0 && i < SET_ROWS.length) {
      setIdx = i; tapOk = true;
      if (SET_ROWS[i][0] === 'vol' && G.tap[0] < VW / 2 - 130) { SET.vol = clamp(Math.floor((G.tap[0] - (VW / 2 - 360)) / 44) + 1, 0, 5) / 5; applySet(); SFX.ok(); return false; }
    }
  }
  const key = SET_ROWS[setIdx][0], l = any('left'), r = any('right'), ok = any('ok') || tapOk;
  if (key === 'back') { if (ok) { setIdx = 0; SFX.ok(); return true; } return false; }
  if (key === 'install') { if (ok) { SFX.ok(); pwaInstall(); } return false; }
  if (key === 'name') { if (ok) { SFX.ok(); statsAskName(true); } return false; }
  if (key === 'vol') { if (l || r) { SET.vol = clamp(Math.round((SET.vol + (r ? 0.2 : -0.2)) * 10) / 10, 0, 1); applySet(); SFX.ok(); } }
  else if (l || r || ok) { SET[key] = !SET[key]; applySet(); SFX.ok(); }
  return false;
}
function drawSettings() {
  ctx.fillStyle = 'rgba(3,4,10,0.94)'; ctx.fillRect(0, 0, VW, VH);
  txt('الإعدادات', VW / 2, 80, { size: 60, weight: 900, color: '#fff', glow: '#ff2040' });
  SET_ROWS.forEach(([key, label], i) => {
    const y = SR0 + i * SRH, sel = i === setIdx;
    ctx.fillStyle = sel ? 'rgba(230,20,40,0.85)' : 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.moveTo(VW / 2 - 400, y - 24); ctx.lineTo(VW / 2 + 420, y - 24); ctx.lineTo(VW / 2 + 400, y + 24); ctx.lineTo(VW / 2 - 420, y + 24); ctx.closePath(); ctx.fill();
    if (key === 'back') { txt(label, VW / 2, y + 2, { size: 30, weight: 800, color: '#fff' }); return; }
    txt(label, VW / 2 + 370, y + 2, { size: 28, weight: 800, color: '#fff', align: 'right' });
    if (key === 'name') { const n = statsName(); txt(n || 'اضغط واكتب اسمك', VW / 2 - 300, y + 2, { size: 24, weight: 800, color: n ? '#7dffb0' : '#ffd34d' }); return; }
    if (key === 'install') {
      const ok = PWA.standalone; txt(ok ? 'مثبتة ✓' : 'اضغط هنا', VW / 2 - 300, y + 2, { size: 24, weight: 800, color: ok ? '#7dffb0' : '#ffd34d' });
    } else if (key === 'vol') {
      for (let q = 0; q < 5; q++) { ctx.fillStyle = q < Math.round(SET.vol * 5) ? '#ffd34d' : 'rgba(255,255,255,0.18)'; ctx.fillRect(VW / 2 - 360 + q * 44, y - 12, 38, 24); }
      txt(Math.round(SET.vol * 100) + '%', VW / 2 - 110, y + 2, { size: 30, font: FE, weight: 700, color: '#fff', rtl: false });
    } else {
      const on = SET[key]; ctx.fillStyle = on ? '#2fbf62' : '#555b6a'; rrect(VW / 2 - 360, y - 16, 70, 32, 16); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(on ? VW / 2 - 306 : VW / 2 - 344, y, 13, 0, 7); ctx.fill();
      txt(on ? 'تشغيل' : 'إيقاف', VW / 2 - 230, y + 2, { size: 24, weight: 800, color: on ? '#7dffb0' : 'rgba(255,255,255,0.6)' });
    }
  });
  txt('فوق/تحت للاختيار  ·  يمين/يسار أو زر الاختيار للتغيير  ·  Esc أو ○ للرجوع', VW / 2, 690, { size: 18, weight: 700, color: 'rgba(255,255,255,0.55)' });
  if (G.pwaHelp) {
    const L = PWA_HELP[G.pwaHelp]; ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = '#10142a'; rrect(VW / 2 - 330, 170, 660, 150 + L.length * 62, 24); ctx.fill(); ctx.strokeStyle = '#ff2a3a'; ctx.lineWidth = 3; ctx.stroke();
    txt('📲 ثبّت اللعبة', VW / 2, 225, { size: 40, weight: 900, color: '#fff', glow: '#ff2040' });
    L.forEach((l, i) => txt(l, VW / 2, 300 + i * 58, { size: i === 0 ? 28 : 26, weight: 800, color: i === 0 ? '#ffd34d' : '#fff' }));
    txt('اضغط أي مكان للرجوع', VW / 2, 290 + L.length * 62, { size: 18, weight: 700, color: 'rgba(255,255,255,0.55)' });
  }
}
// ================= الملابس + المتجر + الحسابات =================
// Clothes are drawn onto each character's own body parts: shirts/jackets/gloves/boots recolour the rig's part images
// (keeping the photo's shading) and add a printed pattern; glasses and wings are drawn live on the head and back.
// Each person on this device has a profile (name, coins, owned items, what each character wears) kept in localStorage.
const SHOP_CATS = [['head', 'نظارات وأقنعة', '🕶️'], ['body', 'تيشيرتات وجاكيتات', '👕'], ['hand', 'قفازات', '🧤'], ['feet', 'أحذية', '🥾'], ['back', 'أجنحة', '🪽']];
const SHOP = [
  { id: 'g_steam', cat: 'head', name: 'نظارة الطيار', price: 200 },
  { id: 'g_round', cat: 'head', name: 'نظارة الكيميائي', price: 150 },
  { id: 'g_visor', cat: 'head', name: 'فايزر المستقبل', price: 250 },
  { id: 'g_mask', cat: 'head', name: 'قناع النينجا', price: 300 },
  { id: 'b_blue', cat: 'body', name: 'تيشيرت الفريق', price: 250, col: [31, 79, 216], sleeve: 'short', pat: 'blue' },
  { id: 'b_purple', cat: 'body', name: 'تيشيرت السبورت', price: 250, col: [74, 40, 130], sleeve: 'short', pat: 'sport' },
  { id: 'b_cyber', cat: 'body', name: 'تيشيرت السايبر', price: 350, col: [20, 22, 28], sleeve: 'short', pat: 'cyber' },
  { id: 'b_jk_olive', cat: 'body', name: 'جاكيت زيتي', price: 350, col: [92, 86, 58], sleeve: 'long', pat: 'jacket' },
  { id: 'b_jk_black', cat: 'body', name: 'جاكيت أسود', price: 350, col: [36, 38, 44], sleeve: 'long', pat: 'jacket' },
  { id: 'b_jk_khaki', cat: 'body', name: 'جاكيت بيج', price: 350, col: [184, 162, 122], sleeve: 'long', pat: 'jacket' },
  { id: 'b_hood', cat: 'body', name: 'بدلة الهودي النيون', price: 600, col: [74, 47, 138], pcol: [22, 23, 30], sleeve: 'long', pants: 1, pat: 'hood' },
  { id: 'h_cyber', cat: 'hand', name: 'قفازات السايبر', price: 300, col: [255, 106, 26], from: 0.5, pat: 'gaunt' },
  { id: 'h_leather', cat: 'hand', name: 'قفازات جلد', price: 120, col: [107, 68, 38], from: 0.78, pat: 'stitch' },
  { id: 'f_tall', cat: 'feet', name: 'جزمة الفارس', price: 250, col: [122, 82, 51], top: 0.06, pat: 'tall' },
  { id: 'f_adv', cat: 'feet', name: 'جزمة المغامر', price: 220, col: [74, 63, 54], top: 0.45, pat: 'adv' },
  { id: 'f_hike', cat: 'feet', name: 'جزمة جبلية', price: 180, col: [96, 50, 32], top: 0.55, pat: 'hike' },
  { id: 'f_neon', cat: 'feet', name: 'جزمة النيون', price: 200, col: [32, 26, 52], top: 0.6, pat: 'neon' },
  { id: 'w_angel', cat: 'back', name: 'أجنحة الملاك', price: 700, wing: 'feather', c1: '#ffffff', c2: '#dfe9f5', c3: '#b9cde3' },
  { id: 'w_black', cat: 'back', name: 'أجنحة الغراب', price: 700, wing: 'feather', c1: '#2a2a2e', c2: '#1a1a1e', c3: '#0e0e12' },
  { id: 'w_blue', cat: 'back', name: 'أجنحة زرقا', price: 750, wing: 'feather', c1: '#4fb2ff', c2: '#1e78e0', c3: '#0f4fb0' },
  { id: 'w_bat', cat: 'back', name: 'أجنحة الخفاش', price: 650, wing: 'bat' },
  { id: 'w_fly', cat: 'back', name: 'أجنحة الفراشة', price: 600, wing: 'fly' },
];
const SHOP_BY = {}; SHOP.forEach(it => SHOP_BY[it.id] = it);
const EQ_SLOTS = ['head', 'body', 'hand', 'feet', 'back'];
const START_COINS = 200;
// ---- profiles
function profNew(name) { const id = 'p' + Date.now().toString(36) + ((Math.random() * 1e4) | 0); PROF.list[id] = { name: (name || 'لاعب').slice(0, 20), coins: START_COINS, own: [], eq: {} }; return id; }
function profLoad() { try { const d = JSON.parse(localStorage.getItem('shilla_prof')); if (d && d.list && d.list[d.cur]) return d; } catch (e) { } return null; }
let PROF = profLoad();
if (!PROF) { PROF = { cur: '', list: {} }; PROF.cur = profNew(statsName() || 'لاعب 1'); }
function profSave() { try { localStorage.setItem('shilla_prof', JSON.stringify(PROF)); } catch (e) { } }
profSave();
function profCur() { return PROF.list[PROF.cur]; }
function profIds() { return Object.keys(PROF.list); }
function eqClean(e) { if (!e || typeof e !== 'object') return null; const o = {}; let n = 0; for (const s of EQ_SLOTS) if (typeof e[s] === 'string' && SHOP_BY[e[s]] && SHOP_BY[e[s]].cat === s) { o[s] = e[s]; n++; } return n ? o : null; }
function eqOfProf(p, ci) { return p ? eqClean(p.eq[ci]) : null; }
function profAward(pid, n) { const p = PROF.list[pid]; if (!p || !n) return; p.coins += n; profSave(); }
// ---- clothes on the rig parts
const CLOTH_CACHE = {};
const smoothK = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const segT = (p, q, x, y) => { const dx = q[0] - p[0], dy = q[1] - p[1]; return ((x - p[0]) * dx + (y - p[1]) * dy) / (dx * dx + dy * dy || 1); };
function clothRig(R, key, e) {
  e = eqClean(e); if (!e || !(e.body || e.hand || e.feet)) return R;
  const k = key + '#' + [e.body || '', e.hand || '', e.feet || ''].join('|'); if (CLOTH_CACHE[k]) return CLOTH_CACHE[k];
  const P = {};
  for (const part in R.P) { const s = R.P[part], im = clothPart(R.m, part, s, e);
    if (im === s.img) { P[part] = s; continue; }
    const q = { img: im, ox: s.ox, oy: s.oy, hull: s.hull };
    for (const [v, c, a] of [['shadow', '#1e0430', 0.8], ['dark', '#0b0d1a', 0.45], ['flash', '#ffffff', 0.42], ['rage', '#ff1020', 0.35]]) { let t = null; Object.defineProperty(q, v, { get: () => t || (t = tinted(im, c, a)) }); }
    P[part] = q; }
  return (CLOTH_CACHE[k] = Object.assign({}, R, { P }));
}
function clothLayers(m, part, e) {
  const L = [], top = m.bbox[1], hh = m.S[1] - top, neckY = m.S[1] - hh * 0.03;
  const B = e.body && SHOP_BY[e.body], Hn = e.hand && SHOP_BY[e.hand], F = e.feet && SHOP_BY[e.feet];
  if (B) {
    if (part === 'torso') L.push([B, B.col, (x, y) => smoothK(neckY, neckY + 9, y)]);
    if (part === 'uarm') L.push([B, B.col, B.sleeve === 'short' ? (x, y) => 1 - smoothK(0.56, 0.66, segT(m.S, m.E, x, y)) : () => 1]);
    if (part === 'farm' && B.sleeve === 'long') L.push([B, B.col, (x, y) => 1 - smoothK(0.7, 0.78, segT(m.E, m.H, x, y))]);
    if (B.pants && (part === 'thigh' || part === 'shin' || part === 'skirt')) L.push([B, B.pcol, () => 1]);
  }
  if (Hn && part === 'farm') L.push([Hn, Hn.col, (x, y) => clothHandW(Hn, m, x, y)]);
  if (F) { if (part === 'shin') L.push([F, F.col, (x, y) => smoothK(F.top, F.top + 0.04, segT(m.K, m.A, x, y))]); if (part === 'foot') L.push([F, F.col, () => 1]); }
  return L;
}
function clothPart(m, part, s, e) {
  const layers = clothLayers(m, part, e); if (!layers.length) return s.img;
  const W = s.img.width, H = s.img.height, ox = s.ox, oy = s.oy;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(s.img, 0, 0);
  const rowMin = new Float32Array(H).fill(1e9), rowMax = new Float32Array(H).fill(-1e9);
  { const a = g.getImageData(0, 0, W, H).data; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] > 100) { if (x < rowMin[y]) rowMin[y] = x; if (x > rowMax[y]) rowMax[y] = x; } }
  const geo = { m, part, ox, oy, W, H, rowMin: y => rowMin[clamp(Math.round(y - oy), 0, H - 1)] + ox, rowMax: y => rowMax[clamp(Math.round(y - oy), 0, H - 1)] + ox, neckY: m.S[1] - (m.S[1] - m.bbox[1]) * 0.03 };
  for (const [it, col, wf] of layers) {
    const id = g.getImageData(0, 0, W, H), d = id.data, w = new Float32Array(W * H); let sum = 0, n = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (d[i * 4 + 3] < 8) continue; const v = wf(x + ox, y + oy); w[i] = v; if (v > 0.5) { sum += (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255; n++; } }
    if (!n) continue; const M = sum / n;
    const mk = g.createImageData(W, H), md = mk.data;
    for (let i = 0; i < W * H; i++) { const v = w[i]; if (!v) continue; const j = i * 4, L = (0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]) / 255, sh = clamp(1 + (L - M) * 1.7, 0.32, 1.75);
      for (let ch = 0; ch < 3; ch++) d[j + ch] = d[j + ch] * (1 - v) + Math.min(255, col[ch] * sh + (sh > 1.35 ? (sh - 1.35) * 90 : 0)) * v; md[j + 3] = d[j + 3] * v; }
    g.putImageData(id, 0, 0);
    if (it.pat && CLOTH_PAT[it.pat]) { const pc = document.createElement('canvas'); pc.width = W; pc.height = H; const pg = pc.getContext('2d');
      pg.save(); pg.translate(-ox, -oy); CLOTH_PAT[it.pat](pg, geo, it); pg.restore();
      const mc = document.createElement('canvas'); mc.width = W; mc.height = H; mc.getContext('2d').putImageData(mk, 0, 0);
      pg.globalCompositeOperation = 'destination-in'; pg.drawImage(mc, 0, 0); g.drawImage(pc, 0, 0); }
  }
  return c;
}
function bandAcross(g, p, q, t0, t1, col, wd = 90) { // a band across a limb between t0..t1 along p→q
  const a = Math.atan2(q[1] - p[1], q[0] - p[0]), L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  g.save(); g.translate(p[0], p[1]); g.rotate(a); g.fillStyle = col; g.fillRect(L * t0, -wd, L * (t1 - t0), wd * 2); g.restore();
}
const CLOTH_PAT = {
  blue(g, G2, it) { const { m, part } = G2;
    if (part === 'torso') { g.fillStyle = '#d8202a'; g.fillRect(m.bbox[0] - 20, G2.neckY, 400, 8);
      g.fillStyle = 'rgba(255,255,255,0.92)'; const y0 = m.hip[1] + 4, y1 = G2.neckY + (m.hip[1] - G2.neckY) * 0.28;
      for (const k of [-0.22, 0, 0.22]) { g.beginPath(); for (let y = y0; y >= y1; y -= 6) { const c = (G2.rowMin(y) + G2.rowMax(y)) / 2 + k * (G2.rowMax(y) - G2.rowMin(y)), j = ((y * 7) % 5) - 2.5, wd = 7 * (y - y1) / (y0 - y1) + 1.5; g.lineTo(c - wd + j, y); }
        for (let y = y1; y <= y0; y += 6) { const c = (G2.rowMin(y) + G2.rowMax(y)) / 2 + k * (G2.rowMax(y) - G2.rowMin(y)), j = ((y * 11) % 5) - 2.5, wd = 7 * (y - y1) / (y0 - y1) + 1.5; g.lineTo(c + wd + j, y); } g.closePath(); g.fill(); } }
    if (part === 'uarm') bandAcross(g, m.S, m.E, 0.5, 0.57, '#d8202a'); },
  sport(g, G2) { const { m, part } = G2;
    if (part === 'torso') { const y0 = G2.neckY, y1 = m.hip[1]; g.fillStyle = '#36e0e0'; g.fillRect(m.bbox[0] - 20, y0, 400, 7);
      g.beginPath(); g.moveTo(m.bbox[0], y0 + (y1 - y0) * 0.65); g.lineTo(m.bbox[0] + 220, y0 + (y1 - y0) * 0.1); g.lineTo(m.bbox[0] + 240, y0 + (y1 - y0) * 0.26); g.lineTo(m.bbox[0] + 20, y0 + (y1 - y0) * 0.86); g.closePath(); g.fillStyle = 'rgba(54,224,224,0.85)'; g.fill();
      g.strokeStyle = '#ff4fd8'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(m.bbox[0] - 10, y1 - 10 - i * 22); g.lineTo(m.bbox[0] + 230, y1 - 90 - i * 22); g.stroke(); } }
    if (part === 'uarm') bandAcross(g, m.S, m.E, 0.5, 0.57, '#36e0e0'); },
  cyber(g, G2) { const { m, part } = G2; g.lineWidth = 2.4; g.shadowBlur = 6;
    const lines = (x0, y0, x1, y1, n) => { for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i + 0.5) / n, yb = y1, yt = y0 + ((i * 37) % 5) * (y1 - y0) * 0.12; const c = i % 2 ? '#ff4fd8' : '#36e8ff'; g.strokeStyle = c; g.shadowColor = c; g.beginPath(); g.moveTo(x, yb); g.lineTo(x, yt + 14); g.lineTo(x + (i % 2 ? 12 : -12), yt); g.stroke(); g.fillStyle = c; g.beginPath(); g.arc(x + (i % 2 ? 12 : -12), yt, 3, 0, 7); g.fill(); } };
    if (part === 'torso') { lines(m.bbox[0], G2.neckY + 10, m.bbox[2], m.hip[1], 8); g.strokeStyle = '#36e8ff'; g.shadowColor = '#36e8ff'; g.strokeRect(m.S[0] - 16, G2.neckY + 26, 32, 22); }
    if (part === 'uarm') { g.strokeStyle = '#36e8ff'; g.shadowColor = '#36e8ff'; g.beginPath(); g.moveTo(m.S[0], m.S[1] + 6); g.lineTo(m.E[0], m.E[1] - 30); g.stroke(); } },
  jacket(g, G2, it) { const { m, part } = G2, dk = `rgba(0,0,0,0.38)`;
    if (part === 'torso') { g.fillStyle = dk; g.fillRect(m.bbox[0] - 20, G2.neckY, 400, 11);
      g.strokeStyle = 'rgba(20,20,20,0.75)'; g.lineWidth = 3; g.beginPath(); for (let y = G2.neckY + 4; y <= m.hip[1] + 6; y += 4) { const x = G2.rowMax(y) - 9; y === G2.neckY + 4 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1; g.stroke();
      const py = G2.neckY + (m.hip[1] - G2.neckY) * 0.3; g.strokeStyle = dk; g.lineWidth = 2; g.strokeRect(G2.rowMax(py) - 46, py, 28, 22); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(m.bbox[0] - 20, m.hip[1] - 8, 400, 12); }
    if (part === 'uarm') { const q = [lerp(m.S[0], m.E[0], 0.32), lerp(m.S[1], m.E[1], 0.32)]; g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(q[0] - 12, q[1] - 10, 24, 20); }
    if (part === 'farm') bandAcross(g, m.E, m.H, 0.62, 0.72, dk); },
  hood(g, G2) { const { m, part } = G2; g.strokeStyle = '#3ff0ff'; g.shadowColor = '#3ff0ff'; g.shadowBlur = 8; g.lineWidth = 3.2;
    if (part === 'torso') { g.beginPath(); for (let y = G2.neckY + 6; y <= m.hip[1]; y += 4) { const x = G2.rowMax(y) - 7; y === G2.neckY + 6 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      g.beginPath(); for (let y = G2.neckY + 6; y <= m.hip[1]; y += 4) { const x = G2.rowMin(y) + 7; y === G2.neckY + 6 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      g.shadowBlur = 0; g.fillStyle = '#121218'; g.fillRect(m.bbox[0] - 20, m.hip[1] - 6, 400, 12); const py = m.hip[1] - 52; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 2; g.strokeRect(G2.rowMax(py) - 54, py, 44, 34);
      g.strokeStyle = '#111'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(m.S[0] + 8, G2.neckY + 4); g.lineTo(m.S[0] + 6, G2.neckY + 40); g.moveTo(m.S[0] + 18, G2.neckY + 4); g.lineTo(m.S[0] + 20, G2.neckY + 36); g.stroke(); }
    if (part === 'uarm') { g.beginPath(); g.moveTo(m.S[0] + 6, m.S[1]); g.lineTo(m.E[0] + 6, m.E[1]); g.stroke(); }
    if (part === 'farm') { g.beginPath(); g.moveTo(m.E[0] + 4, m.E[1]); g.lineTo(lerp(m.E[0], m.H[0], 0.7) + 4, lerp(m.E[1], m.H[1], 0.7)); g.stroke(); g.shadowBlur = 0; bandAcross(g, m.E, m.H, 0.7, 0.78, '#121218'); }
    if (part === 'thigh') { g.beginPath(); g.moveTo(m.hip[0] + 4, m.hip[1] - 10); g.lineTo(m.K[0] + 4, m.K[1] + 10); g.stroke(); }
    if (part === 'shin') { g.beginPath(); g.moveTo(m.K[0] + 4, m.K[1] - 10); g.lineTo(m.A[0] + 4, m.A[1]); g.stroke(); } },
  gaunt(g, G2) { const { m } = G2; g.fillStyle = '#16171c'; for (const [a, b] of [[0.5, 0.6], [0.66, 0.74]]) bandAcross(g, m.E, m.H, a, b, '#16171c');
    const L = Math.hypot(m.H[0] - m.E[0], m.H[1] - m.E[1]), an = Math.atan2(m.H[1] - m.E[1], m.H[0] - m.E[0]);
    g.save(); g.translate(m.E[0], m.E[1]); g.rotate(an); g.fillStyle = '#16171c'; g.fillRect(L * 0.78, -60, L * 0.04, 120); for (let i = -2; i <= 2; i++) { g.fillRect(L * 0.88, i * 9 - 2, L * 0.25, 4); }
    g.fillStyle = '#ffd2a0'; g.shadowColor = '#ff8a2a'; g.shadowBlur = 6; for (const t of [0.55, 0.7]) { g.beginPath(); g.arc(L * t, 0, 3, 0, 7); g.fill(); } g.restore(); },
  stitch(g, G2) { bandAcross(G2 && g, G2.m.E, G2.m.H, 0.79, 0.82, 'rgba(255,220,170,0.6)'); },
  tall(g, G2) { const { m, part } = G2; if (part !== 'shin') { if (part === 'foot') { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(m.bbox[0] - 40, m.G - 9, 400, 12); } return; }
    bandAcross(g, m.K, m.A, 0.04, 0.24, 'rgba(255,225,190,0.22)'); bandAcross(g, m.K, m.A, 0.235, 0.255, 'rgba(0,0,0,0.45)');
    const an = Math.atan2(m.A[1] - m.K[1], m.A[0] - m.K[0]), L = Math.hypot(m.A[0] - m.K[0], m.A[1] - m.K[1]); g.save(); g.translate(m.K[0], m.K[1]); g.rotate(an);
    g.strokeStyle = 'rgba(40,24,12,0.85)'; g.lineWidth = 2; g.beginPath(); for (let t = 0.3; t < 0.95; t += 0.09) { g.moveTo(L * t, -18); g.lineTo(L * (t + 0.09), -4); g.moveTo(L * t, -4); g.lineTo(L * (t + 0.09), -18); } g.stroke(); g.restore(); },
  adv(g, G2) { const { m, part } = G2;
    if (part === 'shin') { bandAcross(g, m.K, m.A, 0.72, 0.82, '#8f9a7e'); const t = 0.77, x = lerp(m.K[0], m.A[0], t), y = lerp(m.K[1], m.A[1], t); g.strokeStyle = '#3a2416'; g.lineWidth = 3; g.strokeRect(x - 4, y - 9, 14, 18); bandAcross(g, m.K, m.A, 0.45, 0.5, 'rgba(255,255,255,0.18)'); }
    if (part === 'foot') { const tx = m.bbox[0] + 400; g.fillStyle = '#5a3a26'; g.beginPath(); g.ellipse(G2.rowMax(m.G - 18) - 6, m.G - 18, 26, 18, 0, 0, 7); g.fill(); g.fillStyle = '#26221e'; g.fillRect(m.bbox[0] - 40, m.G - 8, 400, 12); void tx; } },
  hike(g, G2) { const { m, part } = G2;
    if (part === 'foot') { g.fillStyle = '#17171a'; g.fillRect(m.bbox[0] - 40, m.G - 14, 400, 18); g.fillStyle = '#2a2a2e'; for (let x = m.bbox[0] - 40; x < m.bbox[0] + 360; x += 10) g.fillRect(x, m.G - 4, 5, 6); }
    if (part === 'shin') { const an = Math.atan2(m.A[1] - m.K[1], m.A[0] - m.K[0]), L = Math.hypot(m.A[0] - m.K[0], m.A[1] - m.K[1]); g.save(); g.translate(m.K[0], m.K[1]); g.rotate(an); g.strokeStyle = '#1c1612'; g.lineWidth = 2.4; g.beginPath(); for (let t = 0.6; t < 0.98; t += 0.08) { g.moveTo(L * t, -16); g.lineTo(L * (t + 0.08), -2); g.moveTo(L * t, -2); g.lineTo(L * (t + 0.08), -16); } g.stroke(); g.restore(); } },
  neon(g, G2) { const { m, part } = G2; g.shadowColor = '#3ff0ff'; g.shadowBlur = 8;
    if (part === 'foot') { g.fillStyle = '#3ff0ff'; g.fillRect(m.bbox[0] - 40, m.G - 8, 400, 5); g.fillStyle = '#e8f6ff'; g.fillRect(m.bbox[0] - 40, m.G - 3, 400, 6); }
    if (part === 'shin') bandAcross(g, m.K, m.A, 0.62, 0.66, '#3ff0ff'); },
};
// ---- live-drawn items: glasses/masks on the head, wings on the back, a hood behind the head
function eqVisible(f) { const mv = f.mv; if (f.state === 'attack' && mv && (mv.ball || mv.car) && f.mt >= mv.st - 3 && f.mt <= mv.st + mv.ac + 2) return false; if (f.state === 'rageSeq' && (f.finBall || f.finCar)) return false; return !!f.J; }
function drawEqBack(f) {
  const e = f.eq; if (!e || !eqVisible(f)) return;
  if (e.back) drawShopWings(f, SHOP_BY[e.back]);
  if (e.body === 'b_hood') { const F = faceOf(f.R), m = f.R.m, h = F.h;
    ctx.save(); torsoSpace(f); ctx.fillStyle = '#3a2470'; ctx.strokeStyle = '#3ff0ff'; ctx.lineWidth = 4; ctx.shadowColor = '#3ff0ff'; ctx.shadowBlur = 10;
    const cx = F.eye[0] - h * 0.42, cy = m.bbox[1] + h * 0.5; ctx.beginPath(); ctx.ellipse(cx, cy, h * 0.42, h * 0.54, -0.15, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx, cy, h * 0.42, h * 0.54, -0.15, Math.PI * 0.55, Math.PI * 1.6); ctx.stroke(); ctx.restore(); }
}
function faceOf(R) {
  const m = R.m; if (m.__face) return m.__face; const P = R.P.torso, im = P.img, W = im.width, H = im.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const a = g.getImageData(0, 0, W, H).data;
  const top = m.bbox[1], h = m.S[1] - top; let nx = -1e9, ny = top + h * 0.55;
  for (let y = Math.round(top + h * 0.4); y <= top + h * 0.72; y++) { const yy = y - P.oy; if (yy < 0 || yy >= H) continue; for (let x = W - 1; x >= 0; x--) if (a[(yy * W + x) * 4 + 3] > 120) { if (x + P.ox > nx) { nx = x + P.ox; ny = y; } break; } }
  if (nx < -1e8) nx = m.S[0] + h * 0.35;
  return (m.__face = { h, eye: [nx - h * 0.16, ny - h * 0.085], nose: [nx, ny] });
}
function torsoSpace(f) { const k = f.R.k, p = f.pose, [, at, a, piv] = f.J.torso; ctx.translate(f.x, f.hipY); ctx.scale(f.facing * k, k); ctx.translate(p.dx, p.dy); ctx.translate(at[0], at[1]); ctx.rotate(a); ctx.translate(-piv[0], -piv[1]); }
function headFrame(f) { const J = f.J, c = f.toWorld(J.hd), up = f.toWorld([J.hd[0], J.hd[1] - J.hr]), r = Math.hypot(up[0] - c[0], up[1] - c[1]), ang = Math.atan2(up[1] - c[1], up[0] - c[0]) + Math.PI / 2; return { c, r, ang }; }
function drawEqFront0(f) {
  const e = f.eq; if (!e || !e.head || !eqVisible(f)) return; const F = faceOf(f.R), u = F.h * 0.44 / 50;
  ctx.save(); torsoSpace(f); ctx.translate(F.eye[0], F.eye[1]); ctx.scale(u, u); ctx.translate(-24, 6);   // head space: radius 50, facing +x, the eye at (24,-6)
  const id = e.head;
  if (id === 'g_steam') {
    ctx.fillStyle = '#5a3a24'; ctx.beginPath(); ctx.moveTo(-50, -14); ctx.lineTo(18, -16); ctx.lineTo(18, 4); ctx.lineTo(-50, 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7a5032'; ctx.fillRect(-50, -12, 68, 4);
    ctx.fillStyle = '#b06a2a'; ctx.beginPath(); ctx.ellipse(28, -6, 13, 17, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#7d6b9a'; ctx.beginPath(); ctx.ellipse(30, -6, 10.5, 14, 0, 0, 7); ctx.fill();
    const g = ctx.createRadialGradient(28, -10, 1, 30, -6, 11); g.addColorStop(0, '#9ff4ea'); g.addColorStop(1, '#0d4c4c'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(31, -6, 8, 11, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(28, -11, 2, 3.5, 0.3, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8b47c'; ctx.beginPath(); ctx.moveTo(12, -26); ctx.quadraticCurveTo(-6, -40, -16, -30); ctx.quadraticCurveTo(0, -24, 12, -20); ctx.fill();
  } else if (id === 'g_round') {
    ctx.strokeStyle = '#b8902e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(24, -6); ctx.lineTo(-22, -4); ctx.quadraticCurveTo(-32, -2, -30, 8); ctx.stroke();
    const g = ctx.createRadialGradient(32, -9, 1, 33, -6, 11); g.addColorStop(0, '#2e4a3c'); g.addColorStop(1, '#0c1612'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(33, -6, 7, 11, 0, 0, 7); ctx.fill();
    ctx.lineWidth = 3.4; ctx.strokeStyle = '#d4a83c'; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(31, -11, 1.6, 3, 0.2, 0, 7); ctx.fill();
  } else if (id === 'g_visor') {
    ctx.fillStyle = '#121316'; ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(10, -18); ctx.lineTo(16, -24); ctx.lineTo(30, -22); ctx.lineTo(42, -14); ctx.lineTo(44, 2); ctx.lineTo(34, 6); ctx.lineTo(28, 2); ctx.lineTo(-14, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e2c27a'; ctx.lineWidth = 2.2; ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,200,90,0.25)'; ctx.fillRect(-12, -8, 54, 3);
  } else if (id === 'g_mask') {
    ctx.fillStyle = '#2b3240'; ctx.beginPath(); ctx.moveTo(4, 2); ctx.lineTo(40, -2); ctx.lineTo(50, 10); ctx.lineTo(40, 30); ctx.lineTo(14, 40); ctx.lineTo(2, 26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7ad8ff'; ctx.shadowColor = '#3ff0ff'; ctx.shadowBlur = 8; ctx.lineWidth = 2.2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(12, 14); ctx.lineTo(44, 10); ctx.moveTo(14, 26); ctx.lineTo(38, 24); ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#1a1e26'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(-40, 0); ctx.stroke();
  }
  ctx.restore();
}
function drawShopWings0(f, it) {
  if (!it) return; const nk = f.toWorld(f.J.nk), hp = f.toWorld([0, 0]), d = -f.facing, k = f.R.k;
  const rx = lerp(nk[0], hp[0], 0.3) + d * 16 * k, ry = lerp(nk[1], hp[1], 0.3), flap = Math.sin((f.clock || G.frame) * 0.09) * 0.12, L0 = 300 * k * 0.86;
  for (const far of [1, 0]) {
    const L = L0 * (far ? 0.86 : 1); ctx.save(); ctx.translate(rx + d * far * 12, ry - far * 20); ctx.scale(d, 1); ctx.rotate(-0.45 - flap - far * 0.25);
    if (far) ctx.globalAlpha *= 0.8;
    if (it.wing === 'feather') {
      const top = u => [L * u, -L * 0.42 * Math.sin(u * Math.PI * 0.62)];
      const layers = [[11, 1.0, it.c3], [9, 0.62, it.c2], [7, 0.34, it.c1]];
      for (const [n, lenK, col] of layers) for (let j = n - 1; j >= 0; j--) {
        const u = 0.06 + 0.94 * j / (n - 1), [bx, by] = top(u), len = L * lenK * (0.38 + 0.62 * u * u) * (lenK < 1 ? 1 : 0.95), an = 1.15 + 0.75 * u, w = len * 0.18;
        ctx.save(); ctx.translate(bx, by); ctx.rotate(an); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -w * 0.5); ctx.quadraticCurveTo(len * 0.55, -w, len, 0); ctx.quadraticCurveTo(len * 0.55, w, 0, w * 0.5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(len * 0.9, 0); ctx.stroke(); ctx.restore(); }
      ctx.strokeStyle = it.c2; ctx.lineWidth = 14 * k; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 12; i++) { const [x, y] = top(i / 12); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    } else if (it.wing === 'bat') {
      const pts = [[0, 0], [L * 0.45, -L * 0.42], [L * 0.95, -L * 0.3]], tips = [[L * 1.0, L * 0.12], [L * 0.7, L * 0.28], [L * 0.4, L * 0.32], [L * 0.1, L * 0.22]];
      ctx.fillStyle = far ? '#1c1a20' : '#2c2a32'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
      for (let i = 0; i < tips.length; i++) { const [tx, ty] = tips[i], prev = i ? tips[i - 1] : pts[2]; ctx.quadraticCurveTo((tx + prev[0]) / 2 - L * 0.04, (ty + prev[1]) / 2 - L * 0.1, tx, ty); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#0c0b0e'; ctx.lineWidth = 6 * k; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); for (const [tx, ty] of tips) { ctx.moveTo(pts[1][0], pts[1][1]); ctx.lineTo(tx, ty); } ctx.stroke();
      ctx.fillStyle = '#0c0b0e'; ctx.beginPath(); ctx.moveTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[1][0] + 10, pts[1][1] - 26 * k); ctx.lineTo(pts[1][0] + 14, pts[1][1]); ctx.fill();
    } else if (it.wing === 'fly') {
      ctx.rotate(0.25);
      for (const [sx, sy, rot] of [[L * 0.62, L * 0.5, -0.35], [L * 0.42, L * 0.36, 0.55]]) { ctx.save(); ctx.rotate(rot); ctx.fillStyle = far ? '#101014' : '#18181e'; ctx.beginPath(); ctx.ellipse(sx * 0.55, 0, sx * 0.55, sy * 0.42, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(240,240,255,0.85)'; ctx.lineWidth = 2.4; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(4, 0); ctx.quadraticCurveTo(sx * 0.4, i * sy * 0.08, sx * 0.98, i * sy * 0.12); ctx.stroke(); }
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(160,120,255,0.18)'; ctx.beginPath(); ctx.ellipse(sx * 0.55, 0, sx * 0.5, sy * 0.36, 0, 0, 7); ctx.fill(); ctx.restore(); }
    }
    ctx.restore();
  }
}
// small icon for the shop cards
function drawItemIcon0(it, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
  if (it.cat === 'head') { const f = { J: null }; void f;
    ctx.scale(1.6, 1.6); ctx.translate(-20, 6);
    if (it.id === 'g_steam') { ctx.fillStyle = '#5a3a24'; ctx.fillRect(-26, -8, 70, 10); for (const cx of [0, 34]) { ctx.fillStyle = '#b06a2a'; ctx.beginPath(); ctx.arc(cx, -4, 15, 0, 7); ctx.fill(); ctx.fillStyle = '#7d6b9a'; ctx.beginPath(); ctx.arc(cx, -4, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#0f6b6b'; ctx.beginPath(); ctx.arc(cx, -4, 9, 0, 7); ctx.fill(); } }
    else if (it.id === 'g_round') { ctx.strokeStyle = '#d4a83c'; ctx.lineWidth = 3.4; ctx.fillStyle = '#1a2a22'; for (const cx of [0, 34]) { ctx.beginPath(); ctx.arc(cx, -4, 13, 0, 7); ctx.fill(); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(12, -6); ctx.quadraticCurveTo(17, -11, 22, -6); ctx.stroke(); }
    else if (it.id === 'g_visor') { ctx.fillStyle = '#121316'; ctx.beginPath(); ctx.moveTo(-22, -14); ctx.lineTo(56, -14); ctx.lineTo(52, 8); ctx.lineTo(24, 8); ctx.lineTo(17, 2); ctx.lineTo(10, 8); ctx.lineTo(-18, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#e2c27a'; ctx.lineWidth = 2.4; ctx.stroke(); }
    else { ctx.fillStyle = '#2b3240'; ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(46, -12); ctx.lineTo(40, 14); ctx.lineTo(17, 24); ctx.lineTo(-6, 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#7ad8ff'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(38, 0); ctx.stroke(); }
  } else if (it.cat === 'body') {
    ctx.fillStyle = rgb(it.col); ctx.beginPath(); ctx.moveTo(-18, -40); ctx.lineTo(-44, -26); ctx.lineTo(-52, it.sleeve === 'long' ? 34 : 0); ctx.lineTo(-36, it.sleeve === 'long' ? 36 : 4); ctx.lineTo(-30, -6); ctx.lineTo(-30, 44); ctx.lineTo(30, 44); ctx.lineTo(30, -6); ctx.lineTo(36, it.sleeve === 'long' ? 36 : 4); ctx.lineTo(52, it.sleeve === 'long' ? 34 : 0); ctx.lineTo(44, -26); ctx.lineTo(18, -40); ctx.quadraticCurveTo(0, -30, -18, -40); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    if (it.pat === 'blue') { ctx.fillStyle = '#fff'; for (const x of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(x - 4, 44); ctx.lineTo(x, -14); ctx.lineTo(x + 4, 44); ctx.fill(); } ctx.fillStyle = '#d8202a'; ctx.fillRect(-60, -42, 120, 6); }
    if (it.pat === 'sport') { ctx.fillStyle = '#36e0e0'; ctx.beginPath(); ctx.moveTo(-30, 26); ctx.lineTo(24, -30); ctx.lineTo(32, -18); ctx.lineTo(-24, 38); ctx.fill(); ctx.strokeStyle = '#ff4fd8'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-40, 40 - i * 12); ctx.lineTo(40, -10 - i * 12); ctx.stroke(); } }
    if (it.pat === 'cyber') { ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.strokeStyle = i % 2 ? '#ff4fd8' : '#36e8ff'; const x = -25 + i * 10; ctx.beginPath(); ctx.moveTo(x, 44); ctx.lineTo(x, -6 + (i % 3) * 8); ctx.lineTo(x + 6, -12 + (i % 3) * 8); ctx.stroke(); } }
    if (it.pat === 'jacket') { ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, 44); ctx.stroke(); ctx.strokeRect(-24, -14, 14, 12); }
    if (it.pat === 'hood') { ctx.strokeStyle = '#3ff0ff'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-26, -6); ctx.lineTo(-26, 44); ctx.moveTo(26, -6); ctx.lineTo(26, 44); ctx.stroke(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.strokeRect(-16, 16, 32, 20); }
    ctx.restore();
  } else if (it.cat === 'hand') {
    ctx.rotate(-0.5); ctx.fillStyle = rgb(it.col); rrect(-16, -10, 32, 50, 8); ctx.fill(); for (let i = 0; i < 4; i++) { rrect(-15 + i * 8, -34, 7, 26, 3); ctx.fill(); } rrect(14, -2, 14, 8, 3); ctx.fill();
    if (it.pat === 'gaunt') { ctx.fillStyle = '#16171c'; ctx.fillRect(-16, 4, 32, 8); ctx.fillRect(-16, 20, 32, 8); for (let i = 0; i < 4; i++) ctx.fillRect(-15 + i * 8, -26, 7, 4); }
  } else if (it.cat === 'feet') {
    const tall = it.pat === 'tall'; ctx.fillStyle = rgb(it.col); ctx.beginPath(); ctx.moveTo(-18, tall ? -46 : -14); ctx.lineTo(8, tall ? -46 : -14); ctx.lineTo(8, 16); ctx.quadraticCurveTo(40, 14, 42, 34); ctx.lineTo(-20, 34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = it.pat === 'neon' ? '#3ff0ff' : '#1a1a1e'; ctx.fillRect(-22, 32, 66, it.pat === 'hike' ? 9 : 5);
    if (tall) { ctx.fillStyle = 'rgba(255,225,190,0.3)'; ctx.fillRect(-20, -50, 32, 16); } if (it.pat === 'adv') { ctx.fillStyle = '#8f9a7e'; ctx.fillRect(-18, 2, 26, 7); }
  } else if (it.cat === 'back') {
    const f0 = { toWorld: p => p, J: { nk: [0, -60] }, facing: -1, R: { k: 0.42 }, clock: G.frame }; ctx.translate(20, 40); drawShopWings(f0, it);
  }
  ctx.restore();
}
// ---- the wardrobe / shop scene
function shopChars() { const L = []; for (let i = 0; i < NCH; i++) { L.push(i); const O = OUTFITS[i]; if (O) O.forEach(o => { if (o.as !== undefined && (!o.lock || sagaUnlocked())) L.push(o.as); }); } return L; }
function shopOpen(back) { G.shop = { ci: 0, cat: 0, idx: -1, try: null, back: back || 'title', t: 0, msg: null, pf: null, fx: null }; G.scene = 'shop'; G.t = 0; SFX.ok(); shopPrev(true); }
function shopEq() { const S = G.shop, P = profCur(), e = Object.assign({}, (P.eq[S.ci]) || {}); if (S.try) e[SHOP_BY[S.try].cat] = S.try; return eqClean(e); }
function shopBuild() { const S = G.shop; if (!S) return; const e = shopEq(), key = S.ci + '|' + JSON.stringify(e || {}); if (S.pf && S.pfKey === key) return;
  const f = new Fighter(0, S.ci, { h: {}, p: {}, read() { } }); f.state = 'idle'; f.x = 0; f.facing = 1; f.eq = e; f.R = clothRig(RIGS[S.ci], 'c' + S.ci, e); f.animate(); if (S.pf && S.pf.ci === S.ci) { f.pose = S.pf.pose; f.clock = S.pf.clock; } S.pf = f; S.pfKey = key; }
function shopPrev(now) { const S = G.shop; if (!S) return; if (now || !S.pf) { shopBuild(); return; } if (S.pend) return; S.pend = 1; setTimeout(() => { if (G.shop) { G.shop.pend = 0; shopBuild(); } }, 0); }
function shopItems() { return SHOP.filter(it => it.cat === SHOP_CATS[G.shop.cat][0]); }
function shopMsg(t, c) { G.shop.msg = { t, c: c || '#ffd34d', k: 0 }; }
function shopAction(it) {
  const S = G.shop, P = profCur(), own = P.own.includes(it.id), cur = (P.eq[S.ci] || {})[it.cat] === it.id;
  if (!own) { if (P.coins < it.price) { shopMsg('ما عندك فلوس كافية 🪙', '#ff6060'); SFX.move(); return; } P.coins -= it.price; P.own.push(it.id); (P.eq[S.ci] = P.eq[S.ci] || {})[it.cat] = it.id; profSave(); SFX.ready(); shopMsg('اشتريت ' + it.name + ' ✓'); S.try = null; shopPrev(); return; }
  const e = (P.eq[S.ci] = P.eq[S.ci] || {}); if (cur) { delete e[it.cat]; shopMsg('شلت ' + it.name); } else { e[it.cat] = it.id; shopMsg('لبست ' + it.name + ' ✓'); } profSave(); SFX.ok(); S.try = null; shopPrev();
}
function profSwitch() { const ids = profIds(), i = ids.indexOf(PROF.cur); PROF.cur = ids[(i + 1) % ids.length]; profSave(); shopMsg('الحساب: ' + profCur().name); if (G.shop) shopPrev(); }
const ASK = (() => {
  const d = document.createElement('div'); d.id = 'askbox';
  d.innerHTML = '<div class="ab"><div class="at"></div><input maxlength="20" dir="rtl" autocomplete="off"><div class="ar"><button class="ok">تم ✓</button><button class="no">إلغاء</button></div></div>';
  const st = document.createElement('style'); st.textContent = '#askbox{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-family:Tajawal,system-ui,sans-serif}#askbox.on{display:flex}#askbox .ab{background:#14151f;border:2px solid #ff2a3a;border-radius:18px;padding:18px 18px 14px;width:min(420px,88vw);box-shadow:0 10px 40px rgba(0,0,0,.6)}#askbox .at{color:#fff;font-weight:900;font-size:20px;text-align:center;margin-bottom:12px}#askbox input{width:100%;box-sizing:border-box;font-size:22px;padding:10px 12px;border-radius:12px;border:2px solid #444;background:#0b0c14;color:#fff;font-family:inherit;text-align:center;outline:none}#askbox input:focus{border-color:#ffd34d}#askbox .ar{display:flex;gap:10px;margin-top:12px}#askbox button{flex:1;font-family:inherit;font-weight:900;font-size:19px;padding:11px;border:0;border-radius:12px;cursor:pointer;touch-action:manipulation}#askbox .ok{background:#e01428;color:#fff}#askbox .no{background:#2a2b36;color:#ddd}';
  document.head.appendChild(st); document.body.appendChild(d);
  const inp = d.querySelector('input'); let cb = null, t0 = 0; const fresh = () => performance.now() - t0 < 450;   // the tap that opened the box also sends a click: ignore it
  const close = v => { d.classList.remove('on'); G.modal = false; try { inp.blur(); } catch (e) { } const f = cb; cb = null; if (f) f(v); };
  d.querySelector('.ok').addEventListener('click', e => { e.stopPropagation(); if (!fresh()) close((inp.value || '').trim()); });
  d.querySelector('.no').addEventListener('click', e => { e.stopPropagation(); if (!fresh()) close(null); });
  d.addEventListener('pointerdown', e => e.stopPropagation()); d.addEventListener('click', e => { if (e.target === d && !fresh()) close(null); });
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); close((inp.value || '').trim()); } if (e.key === 'Escape') close(null); });
  return (title, val, f) => { t0 = performance.now(); d.querySelector('.at').textContent = title; inp.value = val || ''; cb = f; G.modal = true; d.classList.add('on'); setTimeout(() => { try { inp.focus(); inp.select(); } catch (e) { } }, 60); };
})();
function profAdd() { ASK('اسم الحساب الجديد', '', n => { if (n) { PROF.cur = profNew(n); profSave(); if (G.shop) { shopMsg('حساب جديد: ' + n + ' · معك ' + START_COINS + ' 🪙'); shopPrev(); } } }); }
function profRename() { const P = profCur(); ASK('غيّر اسم الحساب', P.name, n => { if (n) { P.name = n.slice(0, 20); profSave(); if (G.shop) shopMsg('الاسم: ' + P.name); } }); }
const SHOP_UI = { gx: 26, gy: 150, gs: 66, gc: 4, cx: 560, tabY: 132, tw: 90, th: 54, ix: 790, iy: 196, iw: 226, ih: 104 };
function shopLeave() { const S = G.shop; SFX.move(); G.shop = null; if (S && S.back === 'select') G.toSelect(); else if (S && S.back === 'world' && G.world) { G.scene = 'world'; G.world.cam = null; wDress(G.world); } else G.toTitle(); }
function shopPress(id) { const S = G.shop; S.fx = { id, k: 0 }; }   // a quick flash on whatever was touched
function updShop() {
  const S = G.shop; if (!S) { G.toTitle(); return; } S.t++; G.t++; if (S.msg) S.msg.k++; if (S.fx) S.fx.k++;
  if (S.pf) { S.pf.clock++; S.pf.t++; S.pf.animate(); }
  if (G.modal) { cupTap(); return; }
  const p = pads[0].p, q = pads[1].p, ok = p.ok || q.ok, back = anyP('Escape', 'Backspace') || ((p.back || q.back) && !anyP('KeyT', 'KeyO')), tap = cupTap(), U = SHOP_UI, CH = shopChars(), items = shopItems();
  const P = 14, hit = (x, y, w, h) => tap && tap[0] >= x - P && tap[0] <= x + w + P && tap[1] >= y - P && tap[1] <= y + h + P;
  const setCat = i => { if (i !== S.cat) { S.cat = i; S.idx = -1; S.pg = 0; S.try = null; shopPrev(); } SFX.move(); shopPress('tab' + i); };
  const setChar = ci => { if (ci !== S.ci) { S.ci = ci; S.try = null; shopPrev(); } SFX.move(); shopPress('ch' + ci); };
  const pick = i => { const it = shopItems()[i]; if (!it) return; S.idx = i; S.pg = Math.floor(i / 8); S.try = (profCur().eq[S.ci] || {})[it.cat] === it.id ? null : it.id; SFX.move(); shopPrev(); shopPress('it' + i); };
  if (back && S.t > 8) { shopLeave(); return; }
  // keyboard / controller: ✚ moves through the 2-column grid (▲ on the top row / ▼ on the last row change section)
  // L1/R1 (Z/X) sections · L2/R2 (Q/E) hero · ✕ buy/wear · □ (Del) take off · △ (Tab) account · ○ back
  const nC = SHOP_CATS.length, n = items.length, cur = S.idx;
  const L = p.left || q.left, R = p.right || q.right, Up = p.up || q.up, Dn = p.down || q.down;
  if (p.c13 || q.c13 || anyP('KeyZ', 'PageUp')) setCat((S.cat + nC - 1) % nC);
  else if (p.c12 || q.c12 || anyP('KeyX', 'PageDown')) setCat((S.cat + 1) % nC);
  else if (cur < 0 || cur >= n) { if (n && (L || R || Dn)) pick(0); else if (Up) setCat((S.cat + nC - 1) % nC); }
  else if (R) pick((cur + 1) % n);
  else if (L) pick((cur + n - 1) % n);
  else if (Up) { if (cur >= 2) pick(cur - 2); else setCat((S.cat + nC - 1) % nC); }
  else if (Dn) { if (cur + 2 < n) pick(cur + 2); else if (((cur / 2) | 0) < (((n - 1) / 2) | 0)) pick(n - 1); else setCat((S.cat + 1) % nC); }
  if (p.dg || q.dg) { const i = CH.indexOf(S.ci); setChar(CH[(i + CH.length - 1) % CH.length]); }
  else if (p.c34 || q.c34 || p.sp || q.sp) { const i = CH.indexOf(S.ci); setChar(CH[(i + 1) % CH.length]); }
  if ((p.b1 && !p.ok) || (q.b1 && !q.ok) || anyP('Delete')) { shopPress('act');
    if (S.try) { S.try = null; shopPrev(); SFX.move(); shopMsg('رجعت للبسك'); }
    else { const PR = profCur(), e = PR.eq[S.ci] || {}, c = SHOP_CATS[S.cat][0], id = e[c], it = items.find(x => x.id === id);
      if (id) { delete e[c]; profSave(); SFX.ok(); shopMsg('شلت ' + (it ? it.name : 'القطعة')); shopPrev(); } else { SFX.move(); shopMsg('ما لابس شي من هذا القسم', '#ffb070'); } } }
  if (anyP('Tab') || ((p.b2 || q.b2) && S.t > 8)) profSwitch();
  if (ok && S.t > 8) { const it = items[S.idx]; if (it) { shopAction(it); shopPress('act'); } }
  if (!tap) return;
  // touch / mouse — the closest target wins, one tap is enough
  if (hit(VW - 330, 646, 300, 64)) { const it = items[S.idx]; if (it) { shopAction(it); shopPress('act'); } return; }
  if (hit(16, 646, 170, 64)) { shopLeave(); return; }
  if (hit(20, 18, 300, 50)) { profSwitch(); shopPress('prof'); return; }
  if (hit(330, 16, 54, 54)) { shopPress('add'); profAdd(); return; }
  if (hit(392, 16, 54, 54)) { shopPress('ren'); profRename(); return; }
  { const np = Math.ceil(items.length / 8); if (np > 1 && Math.abs(tap[0] - 752) < 34) { if (Math.abs(tap[1] - 236) < 44) { S.pg = ((S.pg || 0) + np - 1) % np; SFX.move(); shopPress('pgu'); return; } if (Math.abs(tap[1] - 596) < 44) { S.pg = ((S.pg || 0) + 1) % np; SFX.move(); shopPress('pgd'); return; } } }
  for (let i = 0; i < SHOP_CATS.length; i++) { const x = U.ix + i * (U.tw + 4); if (tap[0] >= x - 2 && tap[0] <= x + U.tw + 2 && tap[1] >= U.tabY - U.th / 2 - 14 && tap[1] <= U.tabY + U.th / 2 + 10) { setCat(i); return; } }
  for (let i = (S.pg || 0) * 8; i < Math.min(items.length, (S.pg || 0) * 8 + 8); i++) { const j = i - (S.pg || 0) * 8, x = U.ix + (j % 2) * (U.iw + 12), y = U.iy + ((j / 2) | 0) * (U.ih + 10); if (tap[0] >= x - 5 && tap[0] <= x + U.iw + 5 && tap[1] >= y - 5 && tap[1] <= y + U.ih + 5) { if (S.idx === i) { shopAction(items[i]); shopPress('it' + i); } else pick(i); return; } }
  let best = -1, bd = 1e9; CH.forEach((ci, i) => { const x = U.gx + (i % U.gc) * (U.gs + 8) + U.gs / 2, y = U.gy + ((i / U.gc) | 0) * (U.gs + 8) + U.gs / 2, d = Math.max(Math.abs(tap[0] - x), Math.abs(tap[1] - y)); if (d < bd) { bd = d; best = ci; } });
  if (bd < U.gs / 2 + 8) { setChar(best); return; }
}
function drawShop() {
  const S = G.shop; if (!S) return; const P = profCur(), U = SHOP_UI, CH = shopChars(), items = shopItems();
  drawStage({ x: Math.sin(G.frame * 0.003) * 120, z: 1, yaw: Math.sin(G.frame * 0.004) * 0.4 }, G.frame);
  ctx.fillStyle = 'rgba(4,5,12,0.72)'; ctx.fillRect(0, 0, VW, VH);
  txt('👕 غرفة الملابس', VW / 2 + 40, 44, { size: 40, weight: 900, color: '#fff', stroke: '#1a0004', sw: 7, glow: '#ff1030' });
  // profile + coins
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; rrect(20, 18, 300, 50, 25); ctx.fill(); txt('👤 ' + P.name + '  ⇄', 170, 44, { size: 22, weight: 900, color: '#fff' });
  const FX_ = id => S.fx && S.fx.id === id && S.fx.k < 8;
  if (FX_('prof')) { ctx.fillStyle = 'rgba(255,211,77,0.35)'; rrect(20, 18, 300, 50, 25); ctx.fill(); }
  for (const [x, s, id] of [[330, '＋', 'add'], [392, '✎', 'ren']]) { ctx.fillStyle = FX_(id) ? 'rgba(255,211,77,0.5)' : 'rgba(255,255,255,0.12)'; rrect(x, 16, 54, 54, 27); ctx.fill(); txt(s, x + 27, 44, { size: 26, weight: 900, color: '#fff', rtl: false }); }
  ctx.fillStyle = 'rgba(255,211,77,0.15)'; rrect(VW - 230, 18, 210, 50, 25); ctx.fill(); txt('🪙 ' + P.coins, VW - 125, 45, { size: 28, weight: 900, color: '#ffd34d', rtl: false });
  // characters
  txt('الشخصية', U.gx + 2 * (U.gs + 8), U.gy - 22, { size: 18, weight: 800, color: 'rgba(255,255,255,0.6)' });
  CH.forEach((ci, i) => { const x = U.gx + (i % U.gc) * (U.gs + 8), y = U.gy + ((i / U.gc) | 0) * (U.gs + 8), on = ci === S.ci, im = IMG['face' + (ci + 1)];
    ctx.save(); rrect(x, y, U.gs, U.gs, 10); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill(); ctx.clip(); if (im) ctx.drawImage(im, x, y, U.gs, U.gs); ctx.restore();
    ctx.lineWidth = on ? 4 : 1.2; ctx.strokeStyle = on ? '#ffd34d' : 'rgba(255,255,255,0.25)'; rrect(x, y, U.gs, U.gs, 10); ctx.stroke(); if (FX_('ch' + ci)) { ctx.fillStyle = 'rgba(255,255,255,0.3)'; rrect(x, y, U.gs, U.gs, 10); ctx.fill(); }
    if (P.eq[ci] && eqClean(P.eq[ci])) txt('👕', x + U.gs - 10, y + 12, { size: 13, rtl: false }); });
  // preview
  const f = S.pf; if (f) { ctx.save(); ctx.translate(U.cx, 640); ctx.scale(1.3, 1.3);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 0, 130, 16, 0, 0, 7); ctx.fill();
    drawEqBack(f); drawFighter(f); drawEqFront(f); ctx.restore(); }
  txt(CHARS[S.ci].name, U.cx, 112, { size: 30, weight: 900, color: '#fff', stroke: '#000', sw: 5 });
  if (S.try) txt('تجربة: ' + SHOP_BY[S.try].name, U.cx, 146, { size: 18, weight: 800, color: '#7dffb0', stroke: '#000', sw: 4 });
  // categories
  SHOP_CATS.forEach(([id, nm, ic], i) => { const x = U.ix + i * (U.tw + 4), on = i === S.cat; ctx.fillStyle = FX_('tab' + i) ? 'rgba(255,211,77,0.6)' : on ? 'rgba(230,20,40,0.92)' : 'rgba(255,255,255,0.1)'; rrect(x, U.tabY - U.th / 2, U.tw, U.th, 14); ctx.fill(); txt(ic, x + U.tw / 2, U.tabY + 2, { size: 28, rtl: false }); });
  txt(SHOP_CATS[S.cat][1] + ' · ' + items.length, U.ix + SHOP_CATS.length / 2 * (U.tw + 4), U.tabY + 44, { size: 16, weight: 800, color: 'rgba(255,255,255,0.65)' });
  // items
  const eqNow = P.eq[S.ci] || {};
  { const np = Math.ceil(items.length / 8); if (np > 1) { for (const [yy, s0, id] of [[236, '▲', 'pgu'], [596, '▼', 'pgd']]) { ctx.fillStyle = FX_(id) ? 'rgba(255,211,77,0.6)' : 'rgba(255,255,255,0.12)'; rrect(726, yy - 36, 52, 72, 14); ctx.fill(); txt(s0, 752, yy + 2, { size: 26, weight: 900, color: '#ffd34d', rtl: false }); }
    for (let k = 0; k < np; k++) { ctx.fillStyle = k === (S.pg || 0) ? '#ffd34d' : 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(752, 416 - (np - 1) * 11 + k * 22, 6, 0, 7); ctx.fill(); } txt(((S.pg || 0) + 1) + '/' + np, 752, 300, { size: 16, weight: 900, color: 'rgba(255,255,255,0.7)', rtl: false }); } }
  items.forEach((it, i) => { const j = i - (S.pg || 0) * 8; if (j < 0 || j >= 8) return; const x = U.ix + (j % 2) * (U.iw + 12), y = U.iy + ((j / 2) | 0) * (U.ih + 10), on = i === S.idx, own = P.own.includes(it.id), wear = eqNow[it.cat] === it.id;
    ctx.fillStyle = FX_('it' + i) ? 'rgba(255,211,77,0.4)' : on ? 'rgba(255,211,77,0.16)' : 'rgba(10,12,24,0.85)'; rrect(x, y, U.iw, U.ih, 14); ctx.fill(); ctx.lineWidth = on ? 3 : 1.2; ctx.strokeStyle = wear ? '#5be37d' : on ? '#ffd34d' : 'rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.save(); rrect(x, y, U.iw, U.ih, 14); ctx.clip(); drawItemIcon(it, x + 52, y + U.ih / 2, 62); ctx.restore();
    txt(it.name, x + U.iw - 10, y + 34, { size: Math.min(18, 18 * 130 / Math.max(1, (ctx.font = `900 18px ${FA}`, ctx.measureText(it.name).width))), weight: 900, color: '#fff', align: 'right' });
    txt(wear ? '✓ لابسه' : own ? 'عندك' : '🪙 ' + it.price, x + U.iw - 10, y + 70, { size: 17, weight: 900, color: wear ? '#5be37d' : own ? '#9fd8ff' : P.coins >= it.price ? '#ffd34d' : '#ff7070', align: 'right' }); });
  // action button
  const it = items[S.idx]; if (it) { const own = P.own.includes(it.id), wear = eqNow[it.cat] === it.id, can = own || P.coins >= it.price;
    const pr = FX_('act') ? 4 : 0; ctx.fillStyle = can ? (wear ? 'rgba(90,90,100,0.9)' : 'rgba(230,20,40,0.92)') : 'rgba(80,80,88,0.7)'; rrect(VW - 330 + pr, 646 + pr, 300 - 2 * pr, 64 - 2 * pr, 16); ctx.fill();
    txt(wear ? 'شيله' : own ? 'البسه ✓' : 'اشتري · 🪙 ' + it.price, VW - 180, 679, { size: 26, weight: 900, color: '#fff' }); }
  else { ctx.fillStyle = 'rgba(255,255,255,0.06)'; rrect(VW - 330, 646, 300, 64, 16); ctx.fill(); txt('👆 اختر قطعة تجربها', VW - 180, 679, { size: 21, weight: 800, color: 'rgba(255,255,255,0.6)' }); }
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; rrect(16, 646, 170, 64, 16); ctx.fill(); txt('رجوع', 101, 679, { size: 25, weight: 900, color: '#fff' });
  txt(TOUCH_ON ? 'المس القطعة تجربها · المسها مرة ثانية أو الزر الأحمر تشتريها/تلبسها' : gpOn() ? (B => '✚ القطع · ' + B.l1 + '/' + B.r1 + ' الأقسام · ' + B.l2 + '/' + B.r2 + ' الشخصية · ' + B.x + ' شراء/لبس · ' + B.s + ' شيل · ' + B.t + ' الحساب · ' + B.o + ' رجوع')(padLbl()) : 'الأسهم: القطع · Z/X الأقسام · Q/E الشخصية · Enter شراء/لبس · Del شيل · Tab الحساب · Esc رجوع', VW / 2 + 20, 712, { size: 15, weight: 700, color: 'rgba(255,255,255,0.5)' });
  if (S.msg && S.msg.k < 110) { ctx.save(); ctx.globalAlpha = Math.min(1, (110 - S.msg.k) / 20); ctx.fillStyle = 'rgba(0,0,0,0.75)'; rrect(VW / 2 - 260 + 40, 84, 520, 40, 20); ctx.fill(); txt(S.msg.t, VW / 2 + 40, 105, { size: 20, weight: 900, color: S.msg.c }); ctx.restore(); }
}
// ================= العالم المفتوح — a small top-down world: walk around the neighbourhood, meet the gang, challenge them =================
// Seen from above at an angle (tops + fronts of things), everything sorted by how far down the screen its feet are.
const WD = { SPD: 4.6, R: 17, NEAR: 150 };
const W_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
// ---- chibi look for each fighter, taken from their own photos
const CHIBI = {};
function chibiOf(ci) {
  if (CHIBI[ci]) return CHIBI[ci];
  const avg = (im, x0, y0, x1, y1) => { try { const c = document.createElement('canvas'), w = im.width, h = im.height; c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(Math.round(x0 * w), Math.round(y0 * h), Math.max(1, Math.round((x1 - x0) * w)), Math.max(1, Math.round((y1 - y0) * h))).data; let r = 0, gg = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 160) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; } return n ? [r / n | 0, gg / n | 0, b / n | 0] : null; } catch (e) { return null; } };
  const fr = IMG['front' + (ci + 1)], fa = IMG['face' + (ci + 1)], col = c => c ? `rgb(${c[0]},${c[1]},${c[2]})` : null;
  let bb = [0, 0, 1, 1];
  if (fr) { try { const c = document.createElement('canvas'); c.width = fr.width; c.height = fr.height; const g = c.getContext('2d'); g.drawImage(fr, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let y0 = c.height, y1 = 0;
    for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) if (d[(y * c.width + x) * 4 + 3] > 150) { if (y < y0) y0 = y; if (y > y1) y1 = y; } bb = [0, y0 / c.height, 1, y1 / c.height]; } catch (e) { } }
  const H = bb[3] - bb[1], at = k => bb[1] + H * k;
  return (CHIBI[ci] = {
    shirt: col(fr && avg(fr, 0.3, at(0.28), 0.7, at(0.42))) || CHARS[ci].color || '#3a4a6a',
    pants: col(fr && avg(fr, 0.3, at(0.6), 0.7, at(0.78))) || '#2a2c34',
    shoes: col(fr && avg(fr, 0.25, at(0.94), 0.75, at(0.99))) || '#1a1a1e',
    skin: col(fa && avg(fa, 0.4, 0.55, 0.6, 0.68)) || '#c89a74',
    hair: col(fa && avg(fa, 0.38, 0.03, 0.62, 0.13)) || '#2a2018',
  });
}
// draws a little big-headed fighter with feet at (x, y)
function drawChibi(c, x, y, ci, dir, ph, moving, sc = 1.35) {
  const C = chibiOf(ci), fa = IMG['face' + (ci + 1)], sw = moving ? Math.sin(ph) : 0, bob = moving ? Math.abs(Math.sin(ph)) * 3 : Math.sin(ph * 0.25) * 1.2;
  c.save(); c.translate(x, y); c.scale(sc, sc);
  c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(0, 0, 19, 6.5, 0, 0, 7); c.fill();
  const side = dir === 'left' || dir === 'right', fl = dir === 'left' ? -1 : 1;
  c.translate(0, -bob); c.scale(fl, 1);
  // legs + shoes
  for (const s of [-1, 1]) { const lift = side ? sw * s * 6 : sw * s * 3, dx = side ? sw * s * 6 : s * 6.5;
    c.fillStyle = C.pants; rrect(dx - 4.5, -24 - Math.min(0, lift) * 0.3, 9, 21, 4); c.fill();
    c.fillStyle = C.shoes; c.beginPath(); c.ellipse(dx + (side ? 2.5 : 0), -3 - Math.max(0, -lift) * 0.4, side ? 7 : 5.5, 4, 0, 0, 7); c.fill(); }
  // arms (behind the body when walking sideways)
  const arm = (s, front) => { const a = moving ? -sw * s * (side ? 0.7 : 0.35) : 0.12 * s; c.save(); c.translate(side ? 0 : s * 15, -43); c.rotate(a);
    c.fillStyle = C.shirt; rrect(-4.5, 0, 9, 16, 4); c.fill(); c.fillStyle = C.skin; c.beginPath(); c.arc(0, 18, 4.5, 0, 7); c.fill(); c.restore(); void front; };
  if (side) arm(-1);
  // body
  const g = c.createLinearGradient(-15, 0, 15, 0); g.addColorStop(0, C.shirt); g.addColorStop(1, 'rgba(0,0,0,0.25)');
  c.fillStyle = C.shirt; rrect(-14, -48, 28, 27, 9); c.fill(); c.fillStyle = g; c.globalAlpha = 0.35; rrect(-14, -48, 28, 27, 9); c.fill(); c.globalAlpha = 1;
  if (side) arm(1); else { arm(-1); arm(1); }
  // head
  const hy = -76, hr = 27;
  if (dir === 'up') { c.fillStyle = C.hair; c.beginPath(); c.arc(0, hy, hr, 0, 7); c.fill(); c.fillStyle = C.skin; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * hr * 0.95, hy + 3, 4, 6.5, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 2; c.beginPath(); c.arc(0, hy, hr, 0, 7); c.stroke(); }
  else { c.save(); c.beginPath(); c.arc(side ? 3 : 0, hy, hr, 0, 7); c.closePath(); c.fillStyle = C.skin; c.fill(); c.clip(); if (fa) c.drawImage(fa, (side ? 3 : 0) - hr * 1.08, hy - hr * 1.08, hr * 2.16, hr * 2.16); c.restore();
    c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.beginPath(); c.arc(side ? 3 : 0, hy, hr, 0, 7); c.stroke(); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.arc(side ? 3 : 0, hy, hr + 1.6, 0, 7); c.stroke(); }
  c.restore();
}
// the real fighters (same model as in the fights) walking around the world
const WFIG_S = 0.47;
function wMakeFig(ci, eq) { const f = new Fighter(0, ci, { h: {}, p: {}, read() { } }); f.state = 'widle'; f.x = 0; f.facing = 1; f.clock = (Math.random() * 200) | 0; if (eq) { f.eq = eq; f.R = clothRig(f.R, 'c' + ci, eq); } f.animate(); return f; }
function wAnimFig(e) { const f = e.fig; if (!f) return; f.facing = e.face || 1; f.state = e.act || (e.moving ? 'wwalk' : 'widle'); f.wph = e.ph; f.clock++; f.animate(); }
function drawFig(c, e, s = WFIG_S) { const f = e.fig; if (!f) return; c.save(); c.translate(e.x, e.y); c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(0, 0, 36, 10, 0, 0, 7); c.fill();
  if (f.shadow) { const g = c.createRadialGradient(0, -90, 10, 0, -90, 130); g.addColorStop(0, 'rgba(170,40,255,0.34)'); g.addColorStop(1, 'rgba(120,0,200,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -85, 80, 125, 0, 0, 7); c.fill(); }
  c.scale(s, s); if (f.eq) drawEqBack(f); drawFighter(f); if (f.eq) drawEqFront(f); if (f.cit) drawCitHead(f); if (e.eat) drawHeldFood(e); c.restore(); }
// ---- building blocks of the maps
const W_SHADE = (hex, k) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255, f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(r)},${f(g)},${f(b)})`; };
function wBox(x, y, w, d, h, col, extra = {}) {
  return Object.assign({ x, y, w, d, h, col, sy: y + d, solid: true,
    draw(c) { const { x, y, w, d, h } = this; c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 8, y + d - 4, w, 12);
      c.fillStyle = W_SHADE(this.col, 0.78); c.fillRect(x, y + d - h, w, h);
      c.fillStyle = this.topCol || W_SHADE(this.col, 1.08); c.fillRect(x, y - h, w, d);
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x, y - h, w, 3); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x, y + d - h, w, 5);
      c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2; c.strokeRect(x + 1, y - h + 1, w - 2, d + h - 2);
      if (this.deco) this.deco(c, this); } }, extra);
}
const frontY = o => o.y + o.d - o.h;   // top of the front face
function wWin(c, x, y, w, h) { c.fillStyle = '#9fd3ef'; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(x + 3, y + 3, w * 0.35, h - 6); c.strokeStyle = '#7a6a54'; c.lineWidth = 3; c.strokeRect(x, y, w, h); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.stroke(); }
function wDoor(c, x, y, w, h, col = '#5a3a26') { c.fillStyle = col; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 4, y + 4, w - 8, h * 0.4); c.fillStyle = '#e8c45a'; c.beginPath(); c.arc(x + w - 9, y + h * 0.55, 3, 0, 7); c.fill(); }
function wSign(c, x, y, w, h, bg, text, col = '#fff') { c.fillStyle = bg; rrect(x, y, w, h, 6); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2; c.stroke(); txt(text, x + w / 2, y + h / 2 + 1, { size: Math.min(26, h * 0.62), weight: 900, color: col }); }
function wRug(x, y, w, h, c1, c2) { return { decal: 1, draw(c) { c.fillStyle = c1; rrect(x, y, w, h, 10); c.fill(); c.strokeStyle = c2; c.lineWidth = 8; rrect(x + 14, y + 14, w - 28, h - 28, 8); c.stroke(); c.lineWidth = 3; rrect(x + 30, y + 30, w - 60, h - 60, 6); c.stroke();
  c.fillStyle = c2; for (let i = 0; i < 5; i++) { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(i * Math.PI / 5); c.fillRect(-w * 0.18, -3, w * 0.36, 6); c.restore(); } } }; }
function wGoal(x, y, flip) { return { x, y, w: 30, d: 220, sy: y + 220, solid: false, draw(c) { c.strokeStyle = '#ffffff'; c.lineWidth = 7; c.lineCap = 'round';
  const bx = x + (flip ? 30 : 0), fx = x + (flip ? 0 : 30); c.beginPath(); c.moveTo(fx, y); c.lineTo(fx, y - 110); c.lineTo(fx, y + 220 - 110); c.moveTo(fx, y + 220); c.lineTo(fx, y + 220 - 110); c.lineTo(fx, y - 110); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.5; for (let i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(fx, y - 110 + i * 22); c.lineTo(bx, y - 90 + i * 22); c.stroke(); } } }; }
function wRack(x, y) { const o = wBox(x, y, 170, 40, 120, '#8a8f99', { wardrobe: 1 }); o.draw = function (c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 6, y + 34, 170, 12);
  c.fillStyle = '#c0c5cf'; c.fillRect(x, y - 120, 6, 160); c.fillRect(x + 164, y - 120, 6, 160); c.fillRect(x, y - 124, 170, 6);
  ['#1f4fd8', '#4a2f8a', '#5c5638', '#c8102e', '#121216', '#b8a27a'].forEach((col, i) => { const sx = x + 16 + i * 25; c.fillStyle = col; c.beginPath(); c.moveTo(sx, y - 112); c.lineTo(sx + 20, y - 112); c.lineTo(sx + 24, y - 44); c.lineTo(sx - 4, y - 44); c.closePath(); c.fill(); });
  wSign(c, x + 20, y - 168, 130, 34, '#e01428', 'الملابس 👕'); }; return o; }
function drawJadd(c, x, y, s = 1, t = 0) {   // the grandfather: white thobe, red-and-white shemagh, grey beard, a cane
  c.save(); c.translate(x, y); c.scale(s, s); const b = Math.sin(t * 0.05) * 1.5;
  c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(0, 0, 60, 14, 0, 0, 7); c.fill();
  c.fillStyle = '#7a1f2a'; rrect(-70, -36, 140, 40, 14); c.fill(); c.fillStyle = '#9a2a36'; rrect(-70, -90, 140, 56, 16); c.fill();
  c.fillStyle = '#f8f6f0'; c.beginPath(); c.moveTo(-40, -6); c.quadraticCurveTo(-46, -70 + b, -26, -96 + b); c.lineTo(26, -96 + b); c.quadraticCurveTo(46, -70 + b, 40, -6); c.closePath(); c.fill(); c.strokeStyle = '#d8d2c4'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#efe9dc'; rrect(-46, -24, 92, 26, 12); c.fill();
  c.strokeStyle = '#6a4220'; c.lineWidth = 5; c.beginPath(); c.moveTo(52, 0); c.lineTo(40, -110); c.quadraticCurveTo(38, -124, 26, -120); c.stroke();
  c.fillStyle = '#c89a74'; c.beginPath(); c.arc(0, -122 + b, 24, 0, 7); c.fill();
  c.fillStyle = '#d8d8d8'; c.beginPath(); c.moveTo(-18, -118 + b); c.quadraticCurveTo(0, -84 + b, 18, -118 + b); c.quadraticCurveTo(0, -106 + b, -18, -118 + b); c.fill();
  c.fillStyle = '#2a2018'; c.beginPath(); c.arc(-8, -128 + b, 2.6, 0, 7); c.arc(8, -128 + b, 2.6, 0, 7); c.fill(); c.strokeStyle = '#e8e8e8'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -136 + b); c.lineTo(-3, -135 + b); c.moveTo(3, -135 + b); c.lineTo(14, -136 + b); c.stroke();
  c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-30, -126 + b); c.quadraticCurveTo(0, -168 + b, 30, -126 + b); c.lineTo(38, -84 + b); c.lineTo(22, -110 + b); c.lineTo(-22, -110 + b); c.lineTo(-38, -84 + b); c.closePath(); c.fill();
  c.strokeStyle = '#d02030'; c.lineWidth = 2; for (let i = -24; i <= 24; i += 8) { c.beginPath(); c.moveTo(i, -146 + b); c.lineTo(i * 1.3, -100 + b); c.stroke(); }
  c.strokeStyle = '#141414'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, -142 + b, 24, 6, 0, 0, 7); c.stroke();
  c.restore();
}
function wJadd(x, y) { return { x: x - 70, y: y - 40, w: 140, d: 46, sy: y + 6, solid: true, act: 'jadd', draw(c) { drawJadd(c, x, y, 1, G.frame); } }; }
function wSufra(x, y, w, h) { return { decal: 1, act: 'sufra', x, y, w, d: h, draw(c) { c.fillStyle = '#e8d8b0'; rrect(x, y, w, h, 12); c.fill(); c.strokeStyle = '#b08a4a'; c.lineWidth = 4; rrect(x + 8, y + 8, w - 16, h - 16, 8); c.stroke();
  const dish = (dx, dy, r, col) => { c.fillStyle = '#d8d8d8'; c.beginPath(); c.ellipse(x + dx, y + dy, r, r * 0.55, 0, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.ellipse(x + dx, y + dy - 2, r * 0.78, r * 0.4, 0, 0, 7); c.fill(); };
  dish(w / 2, h / 2, 70, '#e8a040'); c.fillStyle = '#8a4a20'; c.beginPath(); c.ellipse(x + w / 2, y + h / 2 - 8, 30, 14, 0, 0, 7); c.fill(); dish(70, 50, 30, '#5aa04a'); dish(w - 70, 50, 30, '#d84030'); dish(70, h - 46, 28, '#f4e8c0'); dish(w - 70, h - 46, 28, '#c8b080'); } }; }
// ================= more clothes: hats & ghutras, thobes & bisht, jerseys, watches, sneakers, capes =================
// A new slot for what sits on the head (ghutra, shemagh, taqiya, caps, crown); glasses stay in their own slot so both can be worn.
EQ_SLOTS.push('hat');
SHOP_CATS.splice(1, 0, ['hat', 'غتر وطواقي وكابات', '🧢']);
SHOP_CATS[2][1] = 'ثياب وتيشيرتات وجاكيتات'; SHOP_CATS[3][1] = 'قفازات وساعات'; SHOP_CATS[4][1] = 'أحذية ونعل'; SHOP_CATS[5][1] = 'أجنحة وكابات وشنط';
SHOP_UI.tw = 76;
const SHOP2 = [
  // glasses
  { id: 'g_sun', cat: 'head', name: 'نظارة شمسية', price: 180 },
  { id: 'g_sport', cat: 'head', name: 'نظارة رياضية', price: 220 },
  { id: 'g_gold', cat: 'head', name: 'نظارة ذهبية', price: 400 },
  { id: 'g_heart', cat: 'head', name: 'نظارة القلوب', price: 160 },
  { id: 'g_pixel', cat: 'head', name: 'نظارة البكسل', price: 260 },
  { id: 'g_patch', cat: 'head', name: 'عصابة القرصان', price: 140 },
  // on the head
  { id: 'hat_ghutra', cat: 'hat', name: 'غترة بيضا وعقال', price: 250, hat: 'ghutra' },
  { id: 'hat_shemagh', cat: 'hat', name: 'شماغ أحمر وعقال', price: 250, hat: 'shemagh' },
  { id: 'hat_taqiya', cat: 'hat', name: 'طاقية بيضا', price: 120, hat: 'taqiya' },
  { id: 'hat_cap_k', cat: 'hat', name: 'كاب أسود', price: 180, hat: 'cap', hc: '#1d1f24' },
  { id: 'hat_cap_r', cat: 'hat', name: 'كاب أحمر', price: 180, hat: 'cap', hc: '#c8102e' },
  { id: 'hat_beanie', cat: 'hat', name: 'طاقية صوف', price: 160, hat: 'beanie', hc: '#2b6cb0' },
  { id: 'hat_band', cat: 'hat', name: 'عصابة المقاتل', price: 140, hat: 'band', hc: '#d81e2a' },
  { id: 'hat_crown', cat: 'hat', name: 'تاج الملك', price: 1200, hat: 'crown' },
  // thobes, bisht and the rest
  { id: 'b_thobe_w', cat: 'body', name: 'ثوب أبيض', price: 300, col: [244, 242, 236], pcol: [244, 242, 236], sleeve: 'long', pants: 1, pat: 'thobe' },
  { id: 'b_thobe_g', cat: 'body', name: 'ثوب شتوي رمادي', price: 320, col: [128, 130, 134], pcol: [128, 130, 134], sleeve: 'long', pants: 1, pat: 'thobe' },
  { id: 'b_thobe_b', cat: 'body', name: 'ثوب شتوي بني', price: 320, col: [116, 86, 58], pcol: [116, 86, 58], sleeve: 'long', pants: 1, pat: 'thobe' },
  { id: 'b_bisht', cat: 'body', name: 'بشت أسود مزري', price: 900, col: [30, 26, 22], pcol: [244, 242, 236], sleeve: 'long', pants: 1, pat: 'bisht' },
  { id: 'b_jersey_r', cat: 'body', name: 'فانيلة كورة حمرا', price: 300, col: [200, 24, 36], sleeve: 'short', pat: 'jersey', acc: '#ffffff', num: '10' },
  { id: 'b_jersey_g', cat: 'body', name: 'فانيلة كورة خضرا', price: 300, col: [18, 128, 64], sleeve: 'short', pat: 'jersey', acc: '#ffd34d', num: '7' },
  { id: 'b_hawaii', cat: 'body', name: 'قميص ورد', price: 280, col: [28, 150, 196], sleeve: 'short', pat: 'hawaii' },
  { id: 'b_suit', cat: 'body', name: 'بدلة رسمية كحلي', price: 650, col: [32, 44, 84], pcol: [32, 44, 84], sleeve: 'long', pants: 1, pat: 'suit' },
  { id: 'b_track', cat: 'body', name: 'ترنق رياضي', price: 400, col: [22, 44, 128], pcol: [22, 44, 128], sleeve: 'long', pants: 1, pat: 'track' },
  { id: 'b_camo', cat: 'body', name: 'جاكيت مموّه', price: 380, col: [96, 106, 66], sleeve: 'long', pat: 'camo' },
  { id: 'b_gold', cat: 'body', name: 'جاكيت ذهبي', price: 1000, col: [214, 170, 52], sleeve: 'long', pat: 'shine' },
  // hands
  { id: 'h_watch', cat: 'hand', name: 'ساعة ذهب', price: 500, col: [214, 172, 64], from: 0.72, to: 0.77, pat: 'watch' },
  { id: 'h_box', cat: 'hand', name: 'قفازات ملاكمة', price: 280, col: [200, 20, 30], from: 0.7, pat: 'boxing' },
  { id: 'h_white', cat: 'hand', name: 'قفازات بيضا', price: 150, col: [238, 238, 240], from: 0.78, pat: 'stitch' },
  { id: 'h_wrap', cat: 'hand', name: 'لفافات ملاكمة', price: 120, col: [236, 230, 218], from: 0.7, pat: 'wrap' },
  // feet
  { id: 'f_sandal', cat: 'feet', name: 'نعال شرقي', price: 120, col: [112, 72, 40], top: 0.97, pat: 'sandal' },
  { id: 'f_sneak_w', cat: 'feet', name: 'جوتي أبيض', price: 260, col: [240, 240, 242], top: 0.88, pat: 'sneak', acc: '#1f4fd8' },
  { id: 'f_sneak_r', cat: 'feet', name: 'جوتي أحمر', price: 260, col: [206, 30, 40], top: 0.88, pat: 'sneak', acc: '#ffffff' },
  { id: 'f_gold', cat: 'feet', name: 'جزمة ذهبية', price: 800, col: [214, 170, 52], top: 0.55, pat: 'shine' },
  // back
  { id: 'w_fire', cat: 'back', name: 'أجنحة النار', price: 900, wing: 'feather', c1: '#ffd34d', c2: '#ff7a1a', c3: '#d81e10' },
  { id: 'w_gold', cat: 'back', name: 'أجنحة الذهب', price: 1100, wing: 'feather', c1: '#fff3c0', c2: '#f2c84b', c3: '#b8861b' },
  { id: 'w_cape_r', cat: 'back', name: 'عباية البطل الحمرا', price: 450, wing: 'cape', c1: '#c8102e', c2: '#7a0a1a' },
  { id: 'w_cape_k', cat: 'back', name: 'عباية سودا', price: 450, wing: 'cape', c1: '#24242a', c2: '#0c0c10' },
  { id: 'w_bag', cat: 'back', name: 'شنطة ظهر', price: 220, wing: 'bag', c1: '#2f6f4f', c2: '#1d4733' },
];
for (const it of SHOP2) { it.n2 = 1; SHOP.push(it); SHOP_BY[it.id] = it; }
// ---- new prints on the body parts
Object.assign(CLOTH_PAT, {
  bisht(g, G2) { const { m, part } = G2;
    if (part === 'torso') { for (let y = G2.neckY; y <= m.hip[1] + 40; y += 3) { const x = G2.rowMax(y); g.fillStyle = '#f2efe6'; g.fillRect(x - 22, y, 23, 3.4); g.fillStyle = '#d9a93a'; g.fillRect(x - 27, y, 5, 3.4); }
      g.fillStyle = '#d9a93a'; g.fillRect(m.bbox[0] - 20, G2.neckY, 400, 6); }
    if (part === 'farm') bandAcross(g, m.E, m.H, 0.66, 0.72, '#d9a93a');
    if (part === 'uarm') bandAcross(g, m.S, m.E, 0, 0.06, '#d9a93a'); },
  jersey(g, G2, it) { const { m, part } = G2;
    if (part === 'torso') { g.fillStyle = it.acc; g.fillRect(m.bbox[0] - 20, G2.neckY, 400, 7); const y0 = G2.neckY + 20, y1 = m.hip[1];
      for (let y = y0; y < y1; y += 3) { const x = G2.rowMin(y); g.fillRect(x, y, 8, 3.4); }
      const cy = (y0 + y1) / 2, cx = (G2.rowMin(cy) + G2.rowMax(cy)) / 2; g.font = `900 ${Math.round((y1 - y0) * 0.42)}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = it.acc; g.fillText(it.num, cx, cy); }
    if (part === 'uarm') bandAcross(g, m.S, m.E, 0.5, 0.56, it.acc); },
  hawaii(g, G2) { const { m } = G2, x0 = m.bbox[0] - 40, y0 = m.bbox[1] - 40, x1 = m.bbox[2] + 40, y1 = m.bbox[3] + 40;
    let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 70; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), sz = 7 + r() * 7, c = ['#ffd34d', '#ff6fb5', '#ffffff', '#ff8a2a'][(r() * 4) | 0];
      g.fillStyle = c; for (let k = 0; k < 5; k++) { const a = k * 1.2566; g.beginPath(); g.ellipse(x + Math.cos(a) * sz * 0.6, y + Math.sin(a) * sz * 0.6, sz * 0.5, sz * 0.32, a, 0, 7); g.fill(); }
      g.fillStyle = '#7a3a00'; g.beginPath(); g.arc(x, y, sz * 0.22, 0, 7); g.fill();
      if (r() < 0.5) { g.fillStyle = 'rgba(20,110,50,0.8)'; g.beginPath(); g.ellipse(x + sz, y + sz * 0.8, sz * 0.7, sz * 0.25, 0.6, 0, 7); g.fill(); } } },
  suit(g, G2) { const { m, part } = G2;
    if (part === 'torso') { const y0 = G2.neckY, y1 = y0 + (m.hip[1] - y0) * 0.68;
      for (let y = y0; y <= y1; y += 2) { const t = (y - y0) / (y1 - y0), x = G2.rowMax(y), w = 40 * (1 - t) + 3; g.fillStyle = '#f4f4f6'; g.fillRect(x - w, y, w + 1, 2.4); }
      const py = y0 + (y1 - y0) * 0.35, px = (G2.rowMin(py) + G2.rowMax(py)) / 2; g.fillStyle = '#f4f4f6'; g.beginPath(); g.moveTo(px - 12, py); g.lineTo(px + 12, py); g.lineTo(px + 4, py - 10); g.closePath(); g.fill();
      g.strokeStyle = '#b01020'; g.lineWidth = 6; g.beginPath(); g.moveTo(G2.rowMax(y0 + 6) - 6, y0 + 6); g.lineTo(G2.rowMax(y1) - 8, y1 + 10); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2; g.beginPath(); for (let y = y0 + 4; y <= y1; y += 4) { const t = (y - y0) / (y1 - y0), x = G2.rowMax(y) - 28 * (1 - t) - 4; y === y0 + 4 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(G2.rowMax(y1 + 30) - 10, y1 + 30, 3, 0, 7); g.fill(); }
    if (part === 'farm') bandAcross(g, m.E, m.H, 0.6, 0.67, '#f4f4f6'); },
  track(g, G2) { const { m, part } = G2, st = (p, q) => { const an = Math.atan2(q[1] - p[1], q[0] - p[0]), L = Math.hypot(q[0] - p[0], q[1] - p[1]); g.save(); g.translate(p[0], p[1]); g.rotate(an); g.fillStyle = '#fff'; g.fillRect(0, -16, L * 1.02, 4); g.fillRect(0, -9, L * 1.02, 4); g.restore(); };
    if (part === 'uarm') st(m.S, m.E); if (part === 'farm') st(m.E, m.H); if (part === 'thigh') st(m.hip, m.K); if (part === 'shin') st(m.K, m.A);
    if (part === 'torso') { g.strokeStyle = '#e8e8ee'; g.lineWidth = 2.4; g.beginPath(); for (let y = G2.neckY + 4; y <= m.hip[1] + 6; y += 4) { const x = G2.rowMax(y) - 8; y === G2.neckY + 4 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.fillStyle = '#fff'; g.fillRect(m.bbox[0] - 20, G2.neckY, 400, 6); } },
  camo(g, G2) { const { m } = G2; let s = 3; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 60; i++) { const x = m.bbox[0] - 40 + r() * (m.bbox[2] - m.bbox[0] + 80), y = m.bbox[1] - 40 + r() * (m.bbox[3] - m.bbox[1] + 80); g.fillStyle = ['rgba(52,62,36,0.85)', 'rgba(120,96,58,0.8)', 'rgba(30,34,24,0.8)'][i % 3]; g.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, rr = 12 + r() * 12; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7); } g.closePath(); g.fill(); } },
  shine(g, G2) { const { m, part } = G2; if (CLOTH_PAT.jacket && G2.part !== 'foot' && G2.part !== 'shin') CLOTH_PAT.jacket(g, G2);
    let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 40; i++) { const x = m.bbox[0] - 20 + r() * (m.bbox[2] - m.bbox[0] + 40), y = m.bbox[1] + r() * (m.bbox[3] - m.bbox[1]); g.fillStyle = 'rgba(255,250,210,0.85)'; g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + 1.5, y); g.lineTo(x, y + 5); g.lineTo(x - 1.5, y); g.closePath(); g.fill(); }
    if (part === 'foot') { g.fillStyle = 'rgba(80,50,0,0.6)'; g.fillRect(m.bbox[0] - 40, m.G - 7, 400, 9); } },
  watch(g, G2) { const { m } = G2, t = 0.745, x = lerp(m.E[0], m.H[0], t), y = lerp(m.E[1], m.H[1], t); g.fillStyle = '#1a1a1e'; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.strokeStyle = '#f2d27a'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#9fd8ff'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); },
  boxing(g, G2) { bandAcross(g, G2.m.E, G2.m.H, 0.7, 0.76, '#f4f4f6'); },
  wrap(g, G2) { const { m } = G2, an = Math.atan2(m.H[1] - m.E[1], m.H[0] - m.E[0]), L = Math.hypot(m.H[0] - m.E[0], m.H[1] - m.E[1]); g.save(); g.translate(m.E[0], m.E[1]); g.rotate(an); g.strokeStyle = 'rgba(120,110,95,0.6)'; g.lineWidth = 2; for (let t = 0.7; t < 1.1; t += 0.035) { g.beginPath(); g.moveTo(L * t, -40); g.lineTo(L * (t + 0.05), 40); g.stroke(); } g.restore(); },
  sandal(g, G2) { const { m, part } = G2; if (part !== 'foot') return; g.fillStyle = '#3a2414'; g.fillRect(m.bbox[0] - 40, m.G - 7, 400, 9); g.fillStyle = '#d9a35a'; g.fillRect(m.bbox[0] - 40, m.G - 26, 400, 5); },
  sneak(g, G2, it) { const { m, part } = G2;
    if (part === 'foot') { g.fillStyle = '#f7f7f7'; g.fillRect(m.bbox[0] - 40, m.G - 12, 400, 13); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(m.bbox[0] - 40, m.G - 1, 400, 3);
      g.strokeStyle = it.acc; g.lineWidth = 5; g.beginPath(); const xm = G2.rowMax(m.G - 24); g.moveTo(xm - 70, m.G - 18); g.quadraticCurveTo(xm - 40, m.G - 34, xm - 10, m.G - 28); g.stroke(); }
    if (part === 'shin') bandAcross(g, m.K, m.A, 0.88, 0.92, it.acc); },
});
// ---- a hand item can be just a band (a watch) instead of covering the whole hand
function clothHandW(Hn, m, x, y) { const t = segT(m.E, m.H, x, y); return smoothK(Hn.from, Hn.from + (Hn.to ? 0.015 : 0.05), t) * (Hn.to ? 1 - smoothK(Hn.to, Hn.to + 0.015, t) : 1); }
// ---- things on the head, drawn in head space (radius 50, facing +x, the eye at (24,-6)); shared with the townspeople
function hatShape(kind, col) {
  if (kind === 'ghutra' || kind === 'shemagh') {
    const cloth = new Path2D(); cloth.moveTo(44, -26); cloth.quadraticCurveTo(30, -66, -14, -64); cloth.quadraticCurveTo(-58, -60, -62, -20); cloth.quadraticCurveTo(-74, 40, -66, 96); cloth.lineTo(-26, 104); cloth.quadraticCurveTo(-30, 50, -14, 20); cloth.quadraticCurveTo(-4, -8, 16, -22); cloth.quadraticCurveTo(30, -28, 44, -26); cloth.closePath();
    const front = new Path2D(); front.moveTo(42, -24); front.quadraticCurveTo(8, -18, 2, 12); front.quadraticCurveTo(-2, 60, 10, 98); front.lineTo(-10, 100); front.quadraticCurveTo(-18, 50, -10, 6); front.quadraticCurveTo(6, -24, 42, -24); front.closePath();
    const g = ctx.createLinearGradient(-60, -60, 40, 60); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d8d6d0'); ctx.fillStyle = g; ctx.fill(cloth);
    if (kind === 'shemagh') { ctx.save(); ctx.clip(cloth); ctx.fillStyle = 'rgba(200,16,40,0.85)'; for (let x = -80; x < 50; x += 9) for (let y = -70; y < 110; y += 9) if (((x + y) / 9 | 0) % 2 === 0) ctx.fillRect(x, y, 5, 5); ctx.restore(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2; ctx.stroke(cloth); ctx.fillStyle = kind === 'shemagh' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)'; ctx.fill(front);
    ctx.strokeStyle = '#121214'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(-10, -46, 48, 11, -0.18, 0, 7); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(-10, -54, 44, 9, -0.18, 0, 7); ctx.stroke(); }
  else if (kind === 'taqiya') { ctx.fillStyle = '#f8f6f0'; ctx.beginPath(); ctx.ellipse(-8, -46, 46, 22, -0.15, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#c8b890'; ctx.lineWidth = 2; for (let x = -40; x < 30; x += 10) { ctx.beginPath(); ctx.arc(x, -54, 2, 0, 7); ctx.stroke(); } }
  else if (kind === 'cap') { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(-8, -42, 50, 30, -0.12, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(30, -46); ctx.quadraticCurveTo(62, -48, 70, -38); ctx.lineTo(30, -36); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-14, -58, 18, 6, -0.2, 0, 7); ctx.fill(); }
  else if (kind === 'beanie') { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(-8, -40, 52, 36, -0.12, Math.PI, 0); ctx.fill(); ctx.fillStyle = W_SHADE(col, 0.75); ctx.save(); ctx.rotate(-0.12); ctx.fillRect(-60, -46, 104, 14); ctx.restore();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2; for (let x = -50; x < 40; x += 8) { ctx.beginPath(); ctx.moveTo(x, -50); ctx.lineTo(x + 2, -70); ctx.stroke(); } ctx.fillStyle = '#f4f4f6'; ctx.beginPath(); ctx.arc(-14, -80, 10, 0, 7); ctx.fill(); }
  else if (kind === 'band') { ctx.save(); ctx.rotate(-0.14); ctx.fillStyle = col; ctx.fillRect(-54, -40, 100, 13); ctx.restore(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-52, -34); ctx.quadraticCurveTo(-74, -20, -86, 4); ctx.lineTo(-78, 8); ctx.quadraticCurveTo(-66, -16, -50, -26); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-52, -30); ctx.quadraticCurveTo(-66, -4, -64, 22); ctx.lineTo(-56, 20); ctx.quadraticCurveTo(-58, -4, -46, -24); ctx.closePath(); ctx.fill(); }
  else if (kind === 'crown') { ctx.save(); ctx.rotate(-0.14); const g = ctx.createLinearGradient(0, -100, 0, -44); g.addColorStop(0, '#fff3a8'); g.addColorStop(1, '#c8901c'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-40, -46); ctx.lineTo(-44, -84); ctx.lineTo(-24, -64); ctx.lineTo(-8, -96); ctx.lineTo(8, -64); ctx.lineTo(26, -86); ctx.lineTo(28, -46); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#8a5a00'; ctx.lineWidth = 2.4; ctx.stroke();
    for (const [x, c] of [[-24, '#d81e2a'], [-6, '#1f8fff'], [12, '#2fbf62']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, -56, 5, 0, 7); ctx.fill(); } ctx.restore(); }
}
function glassShape(id) {
  const arm = c => { ctx.strokeStyle = c; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(22, -8); ctx.lineTo(-22, -6); ctx.quadraticCurveTo(-32, -4, -30, 8); ctx.stroke(); };
  if (id === 'g_sun') { arm('#121214'); const g = ctx.createLinearGradient(30, -18, 34, 6); g.addColorStop(0, '#4a5262'); g.addColorStop(1, '#05070a'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(32, -4, 10, 12, 0.08, 0, 7); ctx.fill(); ctx.strokeStyle = '#121214'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(29, -10, 2.2, 4, 0.3, 0, 7); ctx.fill(); }
  else if (id === 'g_sport') { ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(14, -10); ctx.lineTo(-26, -8); ctx.stroke(); const g = ctx.createLinearGradient(12, -16, 48, 4); g.addColorStop(0, '#ff8a00'); g.addColorStop(0.5, '#c02cff'); g.addColorStop(1, '#2050ff'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(12, -16); ctx.quadraticCurveTo(36, -22, 48, -10); ctx.lineTo(46, 2); ctx.quadraticCurveTo(32, 6, 12, 2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(18, -12, 22, 2.4); }
  else if (id === 'g_gold') { arm('#e2b84a'); ctx.fillStyle = 'rgba(70,36,12,0.82)'; ctx.beginPath(); ctx.ellipse(33, -6, 8, 11, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#f2cf6a'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(31, -11, 1.8, 3.2, 0.2, 0, 7); ctx.fill(); }
  else if (id === 'g_heart') { arm('#ff7aa0'); ctx.fillStyle = '#ff2a5a'; ctx.beginPath(); ctx.moveTo(33, 6); ctx.bezierCurveTo(18, -4, 22, -20, 33, -12); ctx.bezierCurveTo(44, -20, 48, -4, 33, 6); ctx.fill(); ctx.strokeStyle = '#b0103a'; ctx.lineWidth = 2; ctx.stroke(); }
  else if (id === 'g_pixel') { ctx.fillStyle = '#0a0a0c'; ctx.fillRect(-26, -12, 46, 5); ctx.fillRect(16, -14, 30, 8); ctx.fillRect(20, -6, 24, 6); ctx.fillRect(26, 0, 14, 5); ctx.fillStyle = '#fff'; ctx.fillRect(22, -12, 4, 4); ctx.fillRect(28, -6, 4, 4); }
  else if (id === 'g_patch') { ctx.strokeStyle = '#0c0c0e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(28, -18); ctx.lineTo(-46, -34); ctx.moveTo(36, 2); ctx.lineTo(-40, 6); ctx.stroke(); ctx.fillStyle = '#0c0c0e'; ctx.beginPath(); ctx.ellipse(30, -5, 10, 12, 0, 0, 7); ctx.fill(); }
}
// what sits on and around the head, in front of the fighter: hats first, then glasses
function drawEqFront(f) {
  const e = f.eq; if (!e || !(e.head || e.hat) || !eqVisible(f)) return;
  const H = e.hat && SHOP_BY[e.hat]; if (H && !f.hat) { const F = faceOf(f.R), u = F.h * 0.44 / 50; ctx.save(); torsoSpace(f); ctx.translate(F.eye[0], F.eye[1]); ctx.scale(u, u); ctx.translate(-24, 6); hatShape(H.hat, H.hc); ctx.restore(); }
  if (!e.head) return; const G0 = SHOP_BY[e.head]; if (!G0 || !G0.n2) { drawEqFront0(f); return; }
  const F = faceOf(f.R), u = F.h * 0.44 / 50; ctx.save(); torsoSpace(f); ctx.translate(F.eye[0], F.eye[1]); ctx.scale(u, u); ctx.translate(-24, 6); glassShape(e.head); ctx.restore();
}
// capes and a backpack behind the body; everything else is a pair of wings
function drawShopWings(f, it) {
  if (!it) return; if (it.wing !== 'cape' && it.wing !== 'bag') { drawShopWings0(f, it); return; }
  const nk = f.toWorld(f.J.nk), hp = f.toWorld([0, 0]), d = -f.facing, L = Math.hypot(hp[0] - nk[0], hp[1] - nk[1]) || 60, sw = Math.sin((f.clock || G.frame) * 0.07);
  if (it.wing === 'cape') { const bx = hp[0] + d * L * (0.55 + 0.08 * sw), by = hp[1] + L * 0.95, g = ctx.createLinearGradient(nk[0], nk[1], bx, by); g.addColorStop(0, it.c1); g.addColorStop(1, it.c2);
    ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(nk[0] - d * L * 0.08, nk[1] + L * 0.02); ctx.quadraticCurveTo(nk[0] + d * L * 0.5, nk[1] + L * 0.4, bx, by);
    ctx.quadraticCurveTo(bx - d * L * 0.25, by + L * 0.08, hp[0] - d * L * 0.05, by - L * 0.04); ctx.quadraticCurveTo(hp[0] + d * L * 0.05, hp[1], nk[0] + d * L * 0.05, nk[1] + L * 0.1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(nk[0] + d * L * 0.15, nk[1] + L * 0.2); ctx.quadraticCurveTo(hp[0] + d * L * 0.3, hp[1], bx - d * L * 0.15, by); ctx.stroke();
    ctx.fillStyle = '#e8c04a'; ctx.beginPath(); ctx.arc(nk[0], nk[1] + L * 0.05, Math.max(3, L * 0.05), 0, 7); ctx.fill(); ctx.restore(); return; }
  const a = Math.atan2(hp[1] - nk[1], hp[0] - nk[0]) - Math.PI / 2, cx = lerp(nk[0], hp[0], 0.45) + d * L * 0.26, cy = lerp(nk[1], hp[1], 0.45), w = L * 0.34, h = L * 0.6;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.fillStyle = it.c1; rrect(-w / 2, -h / 2, w, h, w * 0.3); ctx.fill(); ctx.fillStyle = it.c2; rrect(-w * 0.4, h * 0.05, w * 0.8, h * 0.36, w * 0.18); ctx.fill();
  ctx.strokeStyle = '#d8d8d8'; ctx.lineWidth = Math.max(1, L * 0.02); ctx.beginPath(); ctx.moveTo(-w * 0.3, h * 0.05); ctx.lineTo(w * 0.3, h * 0.05); ctx.stroke(); ctx.restore();
}
// shop cards for the new things
function drawItemIcon(it, x, y, s) {
  if (!it.n2 || (it.cat === 'back' && it.wing !== 'cape' && it.wing !== 'bag')) { drawItemIcon0(it, x, y, s); return; }
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
  if (it.cat === 'head' || it.cat === 'hat') { const hat = it.cat === 'hat'; ctx.scale(hat ? 0.95 : 1.2, hat ? 0.95 : 1.2); ctx.translate(hat ? 4 : -12, hat ? 30 : 8);
    ctx.fillStyle = 'rgba(214,170,130,0.55)'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 46, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(40,24,14,0.6)'; ctx.beginPath(); ctx.arc(24, -6, 4, 0, 7); ctx.fill();
    if (it.cat === 'hat') hatShape(it.hat, it.hc); else glassShape(it.id); }
  else if (it.cat === 'body') { const lg = it.pants && it.pat !== 'track' && it.pat !== 'suit', yb = lg ? 70 : 44; ctx.translate(0, lg ? -12 : 0);
    ctx.fillStyle = rgb(it.col); ctx.beginPath(); ctx.moveTo(-18, -40); ctx.lineTo(-44, -26); ctx.lineTo(-52, it.sleeve === 'long' ? 34 : 0); ctx.lineTo(-36, it.sleeve === 'long' ? 36 : 4); ctx.lineTo(-30, -6); ctx.lineTo(lg ? -34 : -30, yb); ctx.lineTo(lg ? 34 : 30, yb); ctx.lineTo(30, -6); ctx.lineTo(36, it.sleeve === 'long' ? 36 : 4); ctx.lineTo(52, it.sleeve === 'long' ? 34 : 0); ctx.lineTo(44, -26); ctx.lineTo(18, -40); ctx.quadraticCurveTo(0, -30, -18, -40); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    if (it.pat === 'thobe') { ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, 0); ctx.stroke(); ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (const yy of [-24, -14, -4]) { ctx.beginPath(); ctx.arc(3, yy, 1.8, 0, 7); ctx.fill(); } }
    if (it.pat === 'bisht') { ctx.fillStyle = rgb(it.pcol); ctx.beginPath(); ctx.moveTo(-10, -36); ctx.lineTo(10, -36); ctx.lineTo(14, 80); ctx.lineTo(-14, 80); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#d9a93a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-11, -36); ctx.lineTo(-15, 80); ctx.moveTo(11, -36); ctx.lineTo(15, 80); ctx.stroke(); }
    if (it.pat === 'jersey') { ctx.fillStyle = it.acc; ctx.fillRect(-60, -42, 120, 6); ctx.font = '900 34px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(it.num, 0, 16); }
    if (it.pat === 'hawaii') { for (const [fx, fy, c] of [[-18, -18, '#ffd34d'], [14, -4, '#ff6fb5'], [-6, 22, '#fff'], [20, 30, '#ff8a2a'], [-40, 10, '#ff6fb5'], [40, -16, '#ffd34d']]) { ctx.fillStyle = c; for (let k = 0; k < 5; k++) { const a = k * 1.2566; ctx.beginPath(); ctx.ellipse(fx + Math.cos(a) * 5, fy + Math.sin(a) * 5, 4.5, 3, a, 0, 7); ctx.fill(); } } }
    if (it.pat === 'suit') { ctx.fillStyle = '#f4f4f6'; ctx.beginPath(); ctx.moveTo(-14, -38); ctx.lineTo(14, -38); ctx.lineTo(0, 2); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#b01020'; ctx.beginPath(); ctx.moveTo(-3, -32); ctx.lineTo(3, -32); ctx.lineTo(4, -4); ctx.lineTo(0, 2); ctx.lineTo(-4, -4); ctx.closePath(); ctx.fill(); }
    if (it.pat === 'track') { ctx.fillStyle = '#fff'; ctx.fillRect(-50, -26, 4, 60); ctx.fillRect(-44, -26, 4, 60); ctx.fillRect(40, -26, 4, 60); ctx.fillRect(46, -26, 4, 60); ctx.fillRect(-1, -34, 2, 80); }
    if (it.pat === 'camo') { for (let i = 0; i < 14; i++) { ctx.fillStyle = ['#343e24', '#78603a', '#1e2218'][i % 3]; ctx.beginPath(); ctx.ellipse(-44 + (i * 37) % 90, -30 + (i * 23) % 74, 9, 6, i, 0, 7); ctx.fill(); } }
    if (it.pat === 'shine') { ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, 44); ctx.stroke(); ctx.fillStyle = '#fff8c8'; for (const [sx, sy] of [[-18, -10], [16, 14], [-8, 30], [24, -22]]) { ctx.beginPath(); ctx.moveTo(sx, sy - 6); ctx.lineTo(sx + 2, sy); ctx.lineTo(sx, sy + 6); ctx.lineTo(sx - 2, sy); ctx.closePath(); ctx.fill(); } }
    ctx.restore(); }
  else if (it.cat === 'hand') { ctx.rotate(-0.5);
    if (it.pat === 'watch') { ctx.fillStyle = rgb(it.col); rrect(-10, -40, 20, 80, 6); ctx.fill(); ctx.fillStyle = '#1a1a1e'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fill(); ctx.strokeStyle = '#f2d27a'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#9fd8ff'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -8); ctx.moveTo(0, 0); ctx.lineTo(6, 2); ctx.stroke(); }
    else { ctx.fillStyle = rgb(it.col); rrect(-16, -10, 32, 50, 8); ctx.fill(); if (it.pat === 'boxing') { ctx.beginPath(); ctx.arc(0, -16, 26, 0, 7); ctx.fill(); ctx.fillStyle = '#f4f4f6'; ctx.fillRect(-16, 18, 32, 8); } else { for (let i = 0; i < 4; i++) { rrect(-15 + i * 8, -34, 7, 26, 3); ctx.fill(); } rrect(14, -2, 14, 8, 3); ctx.fill(); }
      if (it.pat === 'wrap') { ctx.strokeStyle = 'rgba(120,110,95,0.7)'; ctx.lineWidth = 2; for (let yy = -6; yy < 40; yy += 7) { ctx.beginPath(); ctx.moveTo(-16, yy); ctx.lineTo(16, yy + 5); ctx.stroke(); } } } }
  else if (it.cat === 'back') { if (it.wing === 'cape') { const g = ctx.createLinearGradient(0, -44, 0, 44); g.addColorStop(0, it.c1); g.addColorStop(1, it.c2); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-16, -40); ctx.lineTo(16, -40); ctx.quadraticCurveTo(30, 0, 40, 44); ctx.quadraticCurveTo(0, 52, -40, 44); ctx.quadraticCurveTo(-30, 0, -16, -40); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = '#e8c04a'; ctx.beginPath(); ctx.arc(-14, -38, 5, 0, 7); ctx.arc(14, -38, 5, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = it.c1; rrect(-26, -36, 52, 76, 16); ctx.fill(); ctx.fillStyle = it.c2; rrect(-20, 4, 40, 28, 8); ctx.fill(); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, 4); ctx.lineTo(14, 4); ctx.stroke(); ctx.strokeStyle = it.c2; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -36, 12, Math.PI, 0); ctx.stroke(); } }
  else if (it.cat === 'feet') {
    if (it.pat === 'sandal') { ctx.fillStyle = '#3a2414'; ctx.fillRect(-26, 28, 72, 7); ctx.fillStyle = rgb(it.col); rrect(-24, 20, 68, 10, 4); ctx.fill(); ctx.fillStyle = '#d9a35a'; ctx.fillRect(4, 6, 24, 16); }
    else { ctx.fillStyle = rgb(it.col); ctx.beginPath(); ctx.moveTo(-18, it.pat === 'shine' ? -30 : -8); ctx.lineTo(8, it.pat === 'shine' ? -30 : -8); ctx.lineTo(10, 12); ctx.quadraticCurveTo(42, 12, 44, 30); ctx.lineTo(-20, 34); ctx.closePath(); ctx.fill();
      ctx.fillStyle = it.pat === 'sneak' ? '#f7f7f7' : '#5a3a00'; ctx.fillRect(-22, 28, 68, 8); if (it.acc) { ctx.strokeStyle = it.acc; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-8, 22); ctx.quadraticCurveTo(10, 8, 30, 18); ctx.stroke(); } } }
  ctx.restore();
}
// ================= world art 2: detailed, shaded sprites (painted once into an offscreen canvas, then just blitted) =================
const WSPR = {};
function wSpr(key, w, h, paint) { let c = WSPR[key]; if (!c) { c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); paint(c.getContext('2d'), w, h); WSPR[key] = c; } return c; }
function gRR(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
function gTxt(g, s, x, y, size, col, weight = 900, stroke) { g.save(); g.font = `${weight} ${size}px ${FA}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; if (stroke) { g.strokeStyle = stroke; g.lineWidth = size * 0.16; g.lineJoin = 'round'; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); g.restore(); }
function gNoise(g, x, y, w, h, n, cols, sz = 2, seed = 1) { for (let i = 0; i < n; i++) { const a = (i * 7919 + seed * 131) % 100003, b = (i * 104729 + seed * 977) % 100019; g.fillStyle = cols[i % cols.length]; g.fillRect(x + (a % 10000) / 10000 * w, y + (b % 10000) / 10000 * h, sz, sz); } }
const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const shade = (h, k, a = 1) => { const [r, g, b] = hexRGB(h), f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgba(${f(r)},${f(g)},${f(b)},${a})`; };
// ---- the date palm: textured trunk, layered fronds with leaflets, date bunches; the crown sways
function palmTrunk(g, s) { const W = 120, H = 300; g.translate(W / 2, H);
  const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([Math.sin(t * 1.4) * 14 * s - 6 * t * t * s, -t * (H - 20)]); }
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], w = (17 - i * 0.35) * s; const gr = g.createLinearGradient(x0 - w, 0, x0 + w, 0); gr.addColorStop(0, '#5a3e22'); gr.addColorStop(0.35, '#9a7448'); gr.addColorStop(0.6, '#7a5732'); gr.addColorStop(1, '#3e2a16'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - w, y0 + 1); g.lineTo(x1 - w + 0.35 * s, y1); g.lineTo(x1 + w - 0.35 * s, y1); g.lineTo(x0 + w, y0 + 1); g.closePath(); g.fill();
    for (let k = 0; k < 2; k++) { const yy = lerp(y0, y1, k * 0.5), xx = lerp(x0, x1, k * 0.5); g.strokeStyle = 'rgba(40,24,10,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(xx - w, yy - 2); g.quadraticCurveTo(xx, yy + 7, xx + w, yy - 2); g.stroke(); g.strokeStyle = 'rgba(200,160,110,0.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(xx - w * 0.8, yy - 5); g.quadraticCurveTo(xx - w * 0.1, yy + 2, xx + w * 0.3, yy - 4); g.stroke(); } }
  g.fillStyle = '#4a3218'; g.beginPath(); g.ellipse(pts[0][0], 0, 20 * s, 6 * s, 0, 0, 7); g.fill(); return pts[pts.length - 1]; }
function palmCrown(g, s, seed = 1) { const R = 150 * s;
  const frond = (ang, len, droop, dry) => { const tipx = Math.cos(ang) * len, tipy = Math.sin(ang) * len * 0.62 + droop, mx = Math.cos(ang) * len * 0.5, my = Math.sin(ang) * len * 0.3 - len * 0.18;
    const col1 = dry ? '#a8843e' : '#2f6e2a', col2 = dry ? '#d4b25e' : '#5aa848';
    g.strokeStyle = dry ? '#8a6a2e' : '#3a5a22'; g.lineWidth = 3 * s; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(mx, my, tipx, tipy); g.stroke();
    const N = 22; for (let i = 2; i < N; i++) { const t = i / N, x = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * mx + t * t * tipx, y = 2 * (1 - t) * t * my + t * t * tipy, dx = 2 * (1 - t) * mx + 2 * t * (tipx - mx), dy = 2 * (1 - t) * my + 2 * t * (tipy - my), a = Math.atan2(dy, dx), L = (26 - 14 * t) * s * (0.8 + ((i * 37 + seed) % 5) * 0.06);
      for (const sd of [-1, 1]) { const la = a + sd * 0.95 + 0.35; g.strokeStyle = sd > 0 ? col1 : col2; g.lineWidth = 2.2 * s; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(la) * L * 0.5, y + Math.sin(la) * L * 0.5 - 2 * s, x + Math.cos(la) * L, y + Math.sin(la) * L + 4 * s); g.stroke(); } } };
  const back = [], front = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + seed * 0.37, up = Math.sin(a) < 0; (up ? back : front).push(a); }
  for (const a of [0.4, 2.7, 1.6].map(v => v + seed)) frond(a, R * 0.8, 70 * s, true);
  for (const a of back) frond(a, R * (0.85 + 0.15 * Math.abs(Math.cos(a))), 10 * s, false);
  for (let i = 0; i < 3; i++) { const bx = (i - 1) * 18 * s, by = 22 * s; for (let k = 0; k < 14; k++) { g.fillStyle = k % 3 ? '#c8641e' : '#e8902e'; g.beginPath(); g.ellipse(bx + Math.sin(k * 2.1) * 9 * s, by + k * 2.2 * s, 4 * s, 5 * s, 0, 0, 7); g.fill(); } }
  g.fillStyle = '#6a5428'; g.beginPath(); g.ellipse(0, 4 * s, 20 * s, 14 * s, 0, 0, 7); g.fill();
  for (const a of front) frond(a, R * (0.85 + 0.15 * Math.abs(Math.cos(a))), 40 * s, false); }
function wPalm(x, y, s = 1) { const k = 'palm' + s, seed = ((x * 13 + y * 7) % 5) | 0, top = { v: null };
  const T = wSpr(k + 't', 120, 300, g => { g.save(); top.v = palmTrunk(g, s); g.restore(); }), C = wSpr(k + 'c' + seed, 360 * s, 300 * s, g => { g.translate(180 * s, 130 * s); palmCrown(g, s, seed); });
  const tx = 60 + Math.sin(1.4) * 14 * s - 6 * s, ty = 20;
  return { x: x - 14, y: y - 8, w: 28, d: 16, sy: y, solid: true, draw(c) { c.save(); c.fillStyle = 'rgba(30,20,10,0.2)'; c.beginPath(); c.ellipse(x + 70 * s, y + 6, 130 * s, 26 * s, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(30,20,10,0.25)'; c.beginPath(); c.ellipse(x + 4, y + 2, 26 * s, 8 * s, 0, 0, 7); c.fill();
    c.drawImage(T, x - 60, y - 300); const cx = x - 60 + tx, cy = y - 300 + ty, sw = Math.sin(G.frame * 0.025 + x * 0.01) * 0.035; c.translate(cx, cy); c.rotate(sw); c.drawImage(C, -180 * s, -130 * s); c.restore(); } }; }
// ---- a leafy shade tree (سدرة / غاف)
function wTree(x, y, s = 1, col = '#4a8a3a') { const C = wSpr('tree' + s + col, 300 * s, 300 * s, g => { const cx = 150 * s, cy = 300 * s;
    const tr = g.createLinearGradient(cx - 14 * s, 0, cx + 14 * s, 0); tr.addColorStop(0, '#4a3420'); tr.addColorStop(0.5, '#7a5a3a'); tr.addColorStop(1, '#3a2614'); g.fillStyle = tr; g.beginPath(); g.moveTo(cx - 16 * s, cy); g.quadraticCurveTo(cx - 6 * s, cy - 80 * s, cx - 20 * s, cy - 150 * s); g.lineTo(cx + 8 * s, cy - 150 * s); g.quadraticCurveTo(cx + 6 * s, cy - 80 * s, cx + 16 * s, cy); g.closePath(); g.fill();
    g.strokeStyle = '#5a4028'; g.lineWidth = 7 * s; g.beginPath(); g.moveTo(cx - 6 * s, cy - 120 * s); g.lineTo(cx - 60 * s, cy - 170 * s); g.moveTo(cx, cy - 130 * s); g.lineTo(cx + 55 * s, cy - 180 * s); g.stroke();
    const blobs = []; for (let i = 0; i < 26; i++) { const a = i * 2.39, r = (i % 7) * 13 * s; blobs.push([cx + Math.cos(a) * (r + 30 * s) * 1.25, cy - 190 * s + Math.sin(a) * (r + 20 * s) * 0.75, (36 + (i * 13) % 22) * s]); }
    blobs.sort((a, b) => a[1] - b[1]);
    for (const [bx, by, br] of blobs) { const gr = g.createRadialGradient(bx - br * 0.35, by - br * 0.4, br * 0.1, bx, by, br); gr.addColorStop(0, shade(col, 1.45)); gr.addColorStop(0.6, col); gr.addColorStop(1, shade(col, 0.55)); g.fillStyle = gr; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill(); }
    gNoise(g, cx - 130 * s, cy - 290 * s, 260 * s, 200 * s, 900, ['rgba(20,50,10,0.35)', 'rgba(170,220,120,0.35)'], 3 * s, 3);
    g.globalCompositeOperation = 'destination-in'; g.fillStyle = '#000'; for (const [bx, by, br] of blobs) { g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill(); } g.fillRect(cx - 20 * s, cy - 160 * s, 40 * s, 160 * s); });
  return { x: x - 16 * s, y: y - 10, w: 32 * s, d: 18, sy: y, solid: true, draw(c) { c.fillStyle = 'rgba(30,25,10,0.22)'; c.beginPath(); c.ellipse(x + 30 * s, y + 4, 120 * s, 34 * s, 0, 0, 7); c.fill(); c.drawImage(C, x - 150 * s, y - 300 * s); } }; }
// ---- a potted plant / desert bush
function wPlant(x, y, s = 1) { const C = wSpr('plant' + s, 120 * s, 160 * s, g => { const cx = 60 * s, b = 150 * s; const pg = g.createLinearGradient(cx - 30 * s, 0, cx + 30 * s, 0); pg.addColorStop(0, '#8a4a2a'); pg.addColorStop(0.5, '#c8784a'); pg.addColorStop(1, '#6a3a1a'); g.fillStyle = pg; g.beginPath(); g.moveTo(cx - 30 * s, b - 52 * s); g.lineTo(cx + 30 * s, b - 52 * s); g.lineTo(cx + 22 * s, b); g.lineTo(cx - 22 * s, b); g.closePath(); g.fill(); g.fillStyle = '#5a2a12'; g.fillRect(cx - 33 * s, b - 56 * s, 66 * s, 9 * s);
    for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 6.5) * 0.2, L = (60 + (i % 4) * 14) * s; g.strokeStyle = i % 2 ? '#2f7a32' : '#4aa04a'; g.lineWidth = 9 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, b - 54 * s); g.quadraticCurveTo(cx + Math.cos(a) * L * 0.4, b - 54 * s + Math.sin(a) * L * 0.8, cx + Math.cos(a) * L, b - 54 * s + Math.sin(a) * L * 0.9); g.stroke(); } });
  return { x: x - 26 * s, y: y - 14, w: 52 * s, d: 22, sy: y + 8, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(x + 6, y + 8, 34 * s, 10 * s, 0, 0, 7); c.fill(); c.drawImage(C, x - 60 * s, y + 8 - 150 * s); } }; }
// ---- cars: a Gulf-style SUV or a sedan, shaded body, glass with sky reflections, alloy wheels
function carPaint(g, col, model, flip) { const W = 270, H = 140; if (flip) { g.translate(W, 0); g.scale(-1, 1); }
  const by = 112, wr = 23, wx = [62, 205];
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(135, by + 18, 128, 12, 0, 0, 7); g.fill();
  const body = new Path2D(); if (model === 'suv') { body.moveTo(14, by - 4); body.lineTo(10, by - 40); body.quadraticCurveTo(12, by - 52, 30, by - 56); body.lineTo(62, by - 58); body.lineTo(86, by - 98); body.quadraticCurveTo(92, by - 104, 104, by - 104); body.lineTo(228, by - 104); body.quadraticCurveTo(240, by - 102, 244, by - 90); body.lineTo(256, by - 54); body.quadraticCurveTo(262, by - 30, 258, by - 4); body.closePath(); }
  else { body.moveTo(12, by - 6); body.lineTo(10, by - 34); body.quadraticCurveTo(14, by - 46, 40, by - 50); body.lineTo(78, by - 54); body.quadraticCurveTo(100, by - 86, 128, by - 88); body.lineTo(188, by - 88); body.quadraticCurveTo(210, by - 84, 226, by - 56); body.lineTo(250, by - 50); body.quadraticCurveTo(262, by - 40, 260, by - 6); body.closePath(); }
  const bg = g.createLinearGradient(0, by - 104, 0, by); bg.addColorStop(0, shade(col, 1.25)); bg.addColorStop(0.42, shade(col, 1.05)); bg.addColorStop(0.47, shade(col, 0.82)); bg.addColorStop(1, shade(col, 0.55)); g.fillStyle = bg; g.fill(body); g.strokeStyle = shade(col, 0.4); g.lineWidth = 2; g.stroke(body);
  const glass = new Path2D(); if (model === 'suv') { glass.moveTo(70, by - 60); glass.lineTo(92, by - 96); glass.lineTo(226, by - 96); glass.quadraticCurveTo(234, by - 95, 238, by - 86); glass.lineTo(246, by - 60); glass.closePath(); } else { glass.moveTo(86, by - 56); glass.quadraticCurveTo(104, by - 80, 128, by - 82); glass.lineTo(186, by - 82); glass.quadraticCurveTo(204, by - 78, 216, by - 56); glass.closePath(); }
  const gg = g.createLinearGradient(0, by - 98, 0, by - 56); gg.addColorStop(0, '#cfe6f4'); gg.addColorStop(0.45, '#5f88a8'); gg.addColorStop(1, '#22364a'); g.fillStyle = gg; g.fill(glass);
  g.save(); g.clip(glass); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(110, by - 100); g.lineTo(140, by - 100); g.lineTo(110, by - 50); g.lineTo(80, by - 50); g.closePath(); g.fill(); g.restore();
  g.fillStyle = shade(col, 0.35); for (const px of model === 'suv' ? [140, 192] : [150]) g.fillRect(px, by - 98, 6, 42);
  g.strokeStyle = shade(col, 0.45); g.lineWidth = 1.5; for (const dx of model === 'suv' ? [138, 192] : [148]) { g.beginPath(); g.moveTo(dx, by - 56); g.lineTo(dx + 2, by - 12); g.stroke(); }
  g.fillStyle = 'rgba(230,230,235,0.9)'; for (const hx of model === 'suv' ? [118, 170, 222] : [124, 176]) gRR(g, hx, by - 48, 14, 4, 2), g.fill();
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(18, by - 44, 238, 3); g.fillStyle = '#cfd4da'; g.fillRect(10, by - 14, 250, 6);
  g.fillStyle = '#fff6c8'; gRR(g, 246, by - 46, 13, 11, 4); g.fill(); g.fillStyle = '#d02020'; gRR(g, 9, by - 46, 9, 13, 3); g.fill();
  if (model === 'suv') { g.fillStyle = '#2a2c30'; g.fillRect(100, by - 108, 120, 4); g.fillStyle = shade(col, 0.5); gRR(g, 236, by - 66, 12, 9, 3); g.fill(); }
  for (const cx of wx) { g.fillStyle = '#16171a'; g.beginPath(); g.arc(cx, by - 2, wr + 6, Math.PI, 0); g.fill(); g.beginPath(); g.arc(cx, by, wr, 0, 7); g.fill();
    const rg = g.createRadialGradient(cx - 4, by - 4, 2, cx, by, wr * 0.68); rg.addColorStop(0, '#f2f4f6'); rg.addColorStop(0.7, '#9aa0a8'); rg.addColorStop(1, '#4a4f56'); g.fillStyle = rg; g.beginPath(); g.arc(cx, by, wr * 0.66, 0, 7); g.fill();
    g.strokeStyle = '#3a3e44'; g.lineWidth = 2.5; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 4, by + Math.sin(a) * 4); g.lineTo(cx + Math.cos(a) * wr * 0.6, by + Math.sin(a) * wr * 0.6); g.stroke(); } g.fillStyle = '#2a2e34'; g.beginPath(); g.arc(cx, by, 4, 0, 7); g.fill(); } }
function wCar(x, y, col, extra = {}) { const flip = !!extra.flip, model = extra.model || (((x + y) / 10 | 0) % 2 ? 'suv' : 'sedan'), S = wSpr('car' + col + model + flip, 270, 140, g => carPaint(g, col, model, flip));
  return Object.assign({ x, y, w: 230, d: 92, h: 52, sy: y + 92, solid: true, draw(c) { c.drawImage(S, x - 20, y + 92 - 134); } }, extra); }
// ---- street lamp
function wLamp(x, y) { const S = wSpr('lamp', 90, 200, g => { const pg = g.createLinearGradient(14, 0, 26, 0); pg.addColorStop(0, '#2a2e36'); pg.addColorStop(0.5, '#6a707c'); pg.addColorStop(1, '#22262c'); g.fillStyle = pg; g.fillRect(14, 30, 12, 160); g.fillStyle = '#3a3f48'; gRR(g, 8, 182, 24, 16, 4); g.fill();
    g.strokeStyle = '#3a3f48'; g.lineWidth = 6; g.beginPath(); g.moveTo(20, 34); g.quadraticCurveTo(22, 12, 50, 14); g.lineTo(66, 14); g.stroke(); g.fillStyle = '#2a2e36'; gRR(g, 52, 10, 34, 12, 5); g.fill(); g.fillStyle = '#fff3c4'; gRR(g, 56, 19, 26, 5, 2); g.fill(); });
  return { x: x - 6, y: y - 6, w: 12, d: 12, sy: y, solid: true, lamp: [x, y - 150], draw(c) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(x + 2, y, 16, 5, 0, 0, 7); c.fill(); c.drawImage(S, x - 20, y - 196); } }; }
// ---- beach umbrella with a sun lounger
function wUmbrella(x, y, col) { const S = wSpr('umb' + col, 240, 240, g => { const cx = 120;
    g.fillStyle = '#e8e2d4'; g.fillRect(cx - 3, 50, 6, 180); const lg = g.createLinearGradient(0, 196, 0, 230); lg.addColorStop(0, '#f4f1ea'); lg.addColorStop(1, '#c8c2b4'); g.fillStyle = lg; g.save(); g.translate(cx + 20, 214); g.transform(1, 0, -0.3, 1, 0, 0); gRR(g, 0, -10, 90, 18, 6); g.fill(); g.strokeStyle = col; g.lineWidth = 3; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(i * 15, -10); g.lineTo(i * 15, 8); g.stroke(); } g.restore();
    for (let i = 0; i < 8; i++) { const a0 = Math.PI + i * Math.PI / 8, a1 = a0 + Math.PI / 8; const gr = g.createLinearGradient(cx, 30, cx, 80); const c1 = i % 2 ? col : '#fbfbf8'; gr.addColorStop(0, shade(c1 === col ? col : '#fbfbf8', 1.1)); gr.addColorStop(1, shade(c1 === col ? col : '#e8e4da', 0.8)); g.fillStyle = gr; g.beginPath(); g.moveTo(cx, 22); g.quadraticCurveTo(cx + Math.cos((a0 + a1) / 2) * 60, 30, cx + Math.cos(a0) * 100, 80 + Math.sin(a0) * 4); g.lineTo(cx + Math.cos(a1) * 100, 80 + Math.sin(a1) * 4); g.closePath(); g.fill(); }
    g.fillStyle = '#8a8478'; g.beginPath(); g.arc(cx, 22, 5, 0, 7); g.fill(); });
  return { x: x - 6, y: y - 6, w: 12, d: 12, sy: y, solid: true, draw(c) { c.fillStyle = 'rgba(60,40,10,0.18)'; c.beginPath(); c.ellipse(x + 30, y + 4, 100, 30, 0, 0, 7); c.fill(); c.drawImage(S, x - 120, y - 226); } }; }
// ---- Gulf houses and shops: textured plaster, decorative parapet, framed windows, AC units, a lit sign
function houseFacade(g, o, st) { const { w, d, h } = o, wallC = st.wall || '#eadcc2';
  // roof (top face)
  const rg = g.createLinearGradient(0, 0, 0, d); rg.addColorStop(0, shade(wallC, 0.95)); rg.addColorStop(1, shade(wallC, 0.82)); g.fillStyle = rg; g.fillRect(0, 26, w, d); gNoise(g, 0, 26, w, d, w * d / 60, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.08)'], 3, 7);
  if (st.tank !== false) { g.fillStyle = '#e8eef4'; gRR(g, w * 0.72, 26 + d * 0.25, 60, 40, 8); g.fill(); g.fillStyle = '#c8d0d8'; g.fillRect(w * 0.72, 26 + d * 0.25 + 30, 60, 10); g.fillStyle = '#9aa4ae'; g.beginPath(); g.ellipse(w * 0.72 + 30, 26 + d * 0.25 + 6, 26, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#d8dde2'; g.beginPath(); g.ellipse(w * 0.2, 26 + d * 0.5, 22, 14, -0.4, 0, 7); g.fill(); g.strokeStyle = '#8a9098'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.2, 26 + d * 0.5); g.lineTo(w * 0.2 + 16, 26 + d * 0.5 - 18); g.stroke(); }
  // parapet with crenellations
  const py = 26 + d; for (let px = 0; px < w; px += 34) { g.fillStyle = shade(wallC, 1.04); g.beginPath(); g.moveTo(px + 4, py); g.lineTo(px + 17, py - 24); g.lineTo(px + 30, py); g.closePath(); g.fill(); g.strokeStyle = shade(wallC, 0.75); g.lineWidth = 1.5; g.stroke(); }
  // front wall
  const fy = 26 + d, fh = h; const wg = g.createLinearGradient(0, fy, 0, fy + fh); wg.addColorStop(0, shade(wallC, 1.06)); wg.addColorStop(1, shade(wallC, 0.86)); g.fillStyle = wg; g.fillRect(0, fy, w, fh);
  gNoise(g, 0, fy, w, fh, w * fh / 30, ['rgba(120,90,50,0.07)', 'rgba(255,255,255,0.1)', 'rgba(90,70,40,0.05)'], 2, 11);
  g.fillStyle = shade(wallC, 0.78); g.fillRect(0, fy, w, 8); g.fillStyle = shade(wallC, 1.12); g.fillRect(0, fy + 8, w, 3);
  g.fillStyle = st.trim || '#b8a07a'; g.fillRect(0, fy + fh - 26, w, 26); g.strokeStyle = 'rgba(0,0,0,0.15)'; g.lineWidth = 1; for (let sx = 0; sx < w; sx += 44) { g.strokeRect(sx, fy + fh - 26, 44, 13); g.strokeRect(sx + 22, fy + fh - 13, 44, 13); }
  g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, fy + fh - 4, w, 4); g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(w - 10, fy, 10, fh);
  for (const win of st.wins || []) facadeWindow(g, win[0], fy + win[1], win[2], win[3], st);
  if (st.door) facadeDoor(g, st.door[0], fy + st.door[1], st.door[2], st.door[3], st.doorC || '#6a4224', st.glassDoor);
  if (st.ac) for (const [ax, ay] of st.ac) { g.fillStyle = '#eef0f2'; gRR(g, ax, fy + ay, 64, 30, 4); g.fill(); g.strokeStyle = '#aab0b8'; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#9aa0a8'; for (let i = 0; i < 6; i++) g.fillRect(ax + 6, fy + ay + 6 + i * 3.6, 34, 1.5); g.beginPath(); g.arc(ax + 52, fy + ay + 15, 9, 0, 7); g.fill(); }
  if (st.sign) { const [sx, sy, sw, sh, bg, text, tc] = st.sign; g.save(); g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 6; g.shadowOffsetY = 3; const sg = g.createLinearGradient(0, fy + sy, 0, fy + sy + sh); sg.addColorStop(0, shade(bg, 1.2)); sg.addColorStop(1, shade(bg, 0.8)); g.fillStyle = sg; gRR(g, sx, fy + sy, sw, sh, 6); g.fill(); g.restore(); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; gRR(g, sx + 3, fy + sy + 3, sw - 6, sh - 6, 4); g.stroke(); gTxt(g, text, sx + sw / 2, fy + sy + sh / 2 + 2, Math.min(30, sh * 0.62), tc || '#fff', 900, 'rgba(0,0,0,0.35)'); }
  if (st.awning) { const [ax, ay, aw, c1] = st.awning; for (let i = 0; i < aw / 30; i++) { g.fillStyle = i % 2 ? '#fbfbf8' : c1; g.beginPath(); g.moveTo(ax + i * 30, fy + ay); g.lineTo(ax + i * 30 + 30, fy + ay); g.lineTo(ax + i * 30 + 34, fy + ay + 30); g.lineTo(ax + i * 30 - 4, fy + ay + 30); g.closePath(); g.fill(); } g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(ax - 4, fy + ay + 30, aw + 8, 5); }
  if (st.lamps) for (const lx of st.lamps) { g.fillStyle = '#2a2a2e'; g.fillRect(lx - 2, fy + 40, 4, 14); g.fillStyle = '#fff2b8'; gRR(g, lx - 8, fy + 52, 16, 20, 4); g.fill(); }
}
function facadeWindow(g, x, y, w, h, st) { g.fillStyle = st.frame || '#f6f4ef'; gRR(g, x - 7, y - 7, w + 14, h + 14, 4); g.fill(); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x - 7, y + h + 4, w + 14, 4);
  const gg = g.createLinearGradient(x, y, x + w, y + h); gg.addColorStop(0, '#bfe0f2'); gg.addColorStop(0.5, '#6aa0c8'); gg.addColorStop(1, '#2a4a6a'); g.fillStyle = gg; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.moveTo(x + w * 0.15, y); g.lineTo(x + w * 0.45, y); g.lineTo(x + w * 0.15, y + h); g.lineTo(x, y + h); g.lineTo(x, y + h * 0.6); g.closePath(); g.fill();
  g.strokeStyle = st.frame || '#f6f4ef'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h * 0.42); g.lineTo(x + w, y + h * 0.42); g.stroke();
  if (st.mashrabiya) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = 'rgba(110,70,30,0.7)'; g.lineWidth = 1.5; for (let i = -h; i < w; i += 9) { g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i + h, y + h); g.moveTo(x + i + h, y); g.lineTo(x + i, y + h); g.stroke(); } g.restore(); } }
function facadeDoor(g, x, y, w, h, col, glass) { g.fillStyle = '#d8ccb4'; g.fillRect(x - 10, y - 10, w + 20, h + 10); g.fillStyle = shade('#d8ccb4', 0.7); g.fillRect(x - 10, y - 14, w + 20, 6);
  if (glass) { const gg = g.createLinearGradient(x, y, x + w, y + h); gg.addColorStop(0, '#cfe6f4'); gg.addColorStop(1, '#3a5a7a'); g.fillStyle = gg; g.fillRect(x, y, w, h); g.strokeStyle = '#8a9098'; g.lineWidth = 4; g.strokeRect(x, y, w, h); g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(x + 6, y + 6, w * 0.15, h - 12); return; }
  const dg = g.createLinearGradient(x, 0, x + w, 0); dg.addColorStop(0, shade(col, 0.8)); dg.addColorStop(0.5, shade(col, 1.15)); dg.addColorStop(1, shade(col, 0.75)); g.fillStyle = dg; g.fillRect(x, y, w, h);
  g.strokeStyle = shade(col, 0.6); g.lineWidth = 2; const half = w / 2; for (const hx of [x, x + half]) { g.strokeRect(hx + 6, y + 8, half - 12, h * 0.4); g.strokeRect(hx + 6, y + h * 0.5, half - 12, h * 0.42); }
  g.fillStyle = '#e8c45a'; for (const sx of [0, 1]) { const cx = x + half + (sx ? 8 : -8); g.beginPath(); g.arc(cx, y + h * 0.5, 3.5, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + half - 1, y, 2, h); }
function wHouse(x, y, w, d, h, st, extra = {}) { const o = { x, y, w, d, h }; const S = wSpr('house' + x + '_' + y, w, d + h + 26, g => houseFacade(g, o, st));
  return Object.assign({ x, y, w, d, h, sy: y + d, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x + 10, y + d - 2, w, 16); c.drawImage(S, x, y - h - 26); } }, extra); }
// ---- furniture
function wBed(x, y, col = '#3a6ad8') { const S = wSpr('bed' + col, 240, 220, g => { const w = 230; g.translate(5, 60);
    const hb = g.createLinearGradient(0, -60, 0, -8); hb.addColorStop(0, '#8a5a32'); hb.addColorStop(1, '#5a3418'); g.fillStyle = hb; gRR(g, 0, -60, w, 56, 10); g.fill(); g.strokeStyle = '#4a2a10'; g.lineWidth = 2; gRR(g, 10, -52, w - 20, 40, 6); g.stroke();
    const fr = g.createLinearGradient(0, 84, 0, 130); fr.addColorStop(0, '#7a4a26'); fr.addColorStop(1, '#4a2a12'); g.fillStyle = fr; g.fillRect(0, 84, w, 46);
    g.fillStyle = '#f6f3ec'; gRR(g, 6, -12, w - 12, 100, 8); g.fill();
    for (const px of [18, 120]) { const pg = g.createLinearGradient(0, -8, 0, 30); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#d8d4cc'); g.fillStyle = pg; gRR(g, px, -6, 92, 34, 14); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.08)'; g.stroke(); }
    const bl = g.createLinearGradient(0, 30, 0, 96); bl.addColorStop(0, shade(col, 1.2)); bl.addColorStop(1, shade(col, 0.75)); g.fillStyle = bl; g.beginPath(); g.moveTo(2, 34); g.quadraticCurveTo(w / 2, 26, w - 2, 34); g.lineTo(w - 2, 100); g.lineTo(2, 100); g.closePath(); g.fill();
    g.fillStyle = shade(col, 1.35); g.fillRect(2, 34, w - 4, 10); g.strokeStyle = shade(col, 0.6); g.lineWidth = 2; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * 58, 46); g.quadraticCurveTo(i * 58 + 10, 70, i * 58 - 4, 98); g.stroke(); } });
  return { x, y, w: 230, d: 130, h: 46, sy: y + 130, solid: true, act: 'bed', draw(c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 8, y + 126, 230, 12); c.drawImage(S, x - 5, y - 60); } }; }
function wFridge(x, y) { const S = wSpr('fridge', 100, 240, g => { const fg = g.createLinearGradient(0, 0, 90, 0); fg.addColorStop(0, '#b8bec6'); fg.addColorStop(0.25, '#f2f4f6'); fg.addColorStop(0.7, '#d8dce2'); fg.addColorStop(1, '#a0a6ae'); g.fillStyle = '#dfe3e8'; g.fillRect(0, 0, 90, 60); g.fillStyle = fg; gRR(g, 0, 60 - 0, 90, 170, 6); g.fill();
    g.fillStyle = '#8a9098'; g.fillRect(2, 120, 86, 3); g.fillStyle = '#6a7078'; gRR(g, 74, 76, 6, 36, 3); g.fill(); gRR(g, 74, 134, 6, 70, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(10, 64, 6, 160);
    g.fillStyle = '#2a8a4a'; gRR(g, 18, 80, 30, 18, 3); g.fill(); g.fillStyle = '#e8b030'; g.beginPath(); g.arc(56, 90, 7, 0, 7); g.fill(); });
  return { x, y, w: 90, d: 60, h: 170, sy: y + 60, solid: true, act: 'fridge', draw(c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 6, y + 56, 90, 10); c.drawImage(S, x, y - 170); } }; }
function wCloset(x, y) { const S = wSpr('closet', 180, 240, g => { g.fillStyle = '#6a4224'; g.fillRect(0, 0, 170, 50); const wg = g.createLinearGradient(0, 0, 170, 0); wg.addColorStop(0, '#6a3e1e'); wg.addColorStop(0.5, '#9a6a3a'); wg.addColorStop(1, '#5a3418'); g.fillStyle = wg; g.fillRect(0, 50, 170, 175);
    g.strokeStyle = 'rgba(60,30,10,0.35)'; g.lineWidth = 1; for (let i = 0; i < 26; i++) { g.beginPath(); g.moveTo(4 + i * 6.4, 52); g.bezierCurveTo(8 + i * 6.4, 110, i * 6.4, 160, 6 + i * 6.4, 222); g.stroke(); }
    g.strokeStyle = '#3a200c'; g.lineWidth = 3; g.strokeRect(8, 58, 74, 160); g.strokeRect(88, 58, 74, 160); g.fillStyle = '#e8c45a'; g.fillRect(74, 130, 4, 22); g.fillRect(92, 130, 4, 22);
    g.fillStyle = '#e01428'; gRR(g, 25, 8, 120, 30, 6); g.fill(); gTxt(g, 'الملابس 👕', 85, 24, 18, '#fff'); });
  return { x, y, w: 170, d: 50, h: 175, sy: y + 50, solid: true, act: 'rack', draw(c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 6, y + 46, 170, 10); c.drawImage(S, x, y - 175); } }; }
function wTable(x, y) { const S = wSpr('rtable', 240, 160, g => { g.translate(120, 90);
    const chair = (dx, dy, back) => { g.fillStyle = '#8a2a20'; gRR(g, dx - 20, dy - 18, 40, 34, 8); g.fill(); g.fillStyle = '#b8382a'; gRR(g, dx - 17, dy - 15, 34, 26, 6); g.fill(); if (back) { g.fillStyle = '#6a1e16'; gRR(g, dx - 20, dy - 36, 40, 16, 6); g.fill(); } };
    chair(-80, 0, 0); chair(80, 0, 0); chair(0, -50, 1);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(6, 30, 66, 16, 0, 0, 7); g.fill(); g.fillStyle = '#5a3a1e'; g.fillRect(-6, -6, 12, 36);
    const tg = g.createRadialGradient(-14, -20, 4, 0, -12, 70); tg.addColorStop(0, '#ffffff'); tg.addColorStop(1, '#e2dccc'); g.fillStyle = tg; g.beginPath(); g.ellipse(0, -14, 64, 30, 0, 0, 7); g.fill(); g.strokeStyle = '#c8b89a'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#f8f8f8'; for (const [px, py] of [[-22, -16], [22, -12]]) { g.beginPath(); g.ellipse(px, py, 15, 8, 0, 0, 7); g.fill(); g.strokeStyle = '#ddd'; g.stroke(); }
    g.fillStyle = '#e8a040'; g.beginPath(); g.ellipse(22, -13, 9, 4.5, 0, 0, 7); g.fill(); g.fillStyle = '#7a3a1a'; g.beginPath(); g.ellipse(-22, -17, 8, 4, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(160,210,255,0.7)'; g.fillRect(-4, -30, 7, 12); });
  return { x: x - 50, y: y - 26, w: 100, d: 52, sy: y + 26, solid: true, draw(c) { c.drawImage(S, x - 120, y - 90); } }; }
// the majlis: floor seating with backrests in a rich patterned fabric
function wMajlis(x, y, w, d, vertical) { const S = wSpr('majlis' + w + 'x' + d + (vertical ? 'v' : ''), w, d + 50, g => { const base = '#7a1a22', gold = '#d8b45a';
    const bg = g.createLinearGradient(0, 0, 0, d + 50); bg.addColorStop(0, '#9a2a34'); bg.addColorStop(1, '#5a1018'); g.fillStyle = bg; gRR(g, 0, 0, w, d + 50, 10); g.fill();
    g.fillStyle = base; gRR(g, 4, 4, w - 8, vertical ? d + 42 : 34, 8); g.fill();
    g.strokeStyle = gold; g.lineWidth = 2; for (let i = 0; i < (vertical ? d + 50 : w) / 30; i++) { const p = i * 30 + 15; g.beginPath(); if (vertical) { g.moveTo(w / 2 - 10, p); g.lineTo(w / 2, p - 8); g.lineTo(w / 2 + 10, p); g.lineTo(w / 2, p + 8); } else { g.moveTo(p - 10, 20); g.lineTo(p, 12); g.lineTo(p + 10, 20); g.lineTo(p, 28); } g.closePath(); g.stroke(); }
    g.fillStyle = gold; if (vertical) { g.fillRect(0, 0, 4, d + 50); g.fillRect(w - 4, 0, 4, d + 50); } else { g.fillRect(0, 38, w, 4); g.fillRect(0, d + 46, w, 4); }
    if (!vertical) for (let px = 20; px < w - 40; px += 90) { const cg = g.createRadialGradient(px + 30, 54, 4, px + 30, 60, 40); cg.addColorStop(0, '#c8404a'); cg.addColorStop(1, '#7a1a22'); g.fillStyle = cg; gRR(g, px, 44, 60, 30, 10); g.fill(); g.strokeStyle = gold; g.lineWidth = 1.5; gRR(g, px + 4, 48, 52, 22, 8); g.stroke(); } });
  return { x, y, w, d, sy: y + d, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 6, y + d, w, 10); c.drawImage(S, x, y - 50); } }; }
// coffee table with a dallah and cups
function wCoffee(x, y) { const S = wSpr('coffee', 220, 140, g => { const tg = g.createLinearGradient(0, 50, 0, 120); tg.addColorStop(0, '#6a4220'); tg.addColorStop(1, '#3a2010'); g.fillStyle = tg; gRR(g, 10, 60, 200, 60, 8); g.fill(); g.fillStyle = '#8a5a30'; gRR(g, 10, 50, 200, 22, 8); g.fill(); g.strokeStyle = '#d8b45a'; g.lineWidth = 2; g.strokeRect(18, 78, 184, 32);
    const dl = g.createLinearGradient(50, 0, 86, 0); dl.addColorStop(0, '#a8842e'); dl.addColorStop(0.5, '#f4d47a'); dl.addColorStop(1, '#8a6a20'); g.fillStyle = dl; g.beginPath(); g.moveTo(52, 56); g.quadraticCurveTo(48, 30, 60, 22); g.lineTo(76, 22); g.quadraticCurveTo(88, 30, 84, 56); g.closePath(); g.fill(); g.beginPath(); g.moveTo(60, 22); g.lineTo(64, 6); g.lineTo(72, 6); g.lineTo(76, 22); g.fill(); g.strokeStyle = '#a8842e'; g.lineWidth = 4; g.beginPath(); g.moveTo(84, 30); g.quadraticCurveTo(104, 20, 106, 12); g.stroke(); g.beginPath(); g.arc(46, 36, 9, 1.2, 5); g.stroke();
    g.fillStyle = '#f8f6f0'; for (const cx of [120, 145, 170]) { g.beginPath(); g.moveTo(cx - 8, 46); g.lineTo(cx + 8, 46); g.lineTo(cx + 5, 58); g.lineTo(cx - 5, 58); g.closePath(); g.fill(); g.strokeStyle = '#c8a040'; g.lineWidth = 1.5; g.stroke(); } g.fillStyle = '#6a3a1a'; g.beginPath(); g.ellipse(145, 66, 18, 6, 0, 0, 7); g.fill(); g.fillStyle = '#c87a3a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(134 + i * 4.5, 63, 3, 0, 7); g.fill(); } });
  return { x, y, w: 200, d: 90, sy: y + 90, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 8, y + 86, 200, 10); c.drawImage(S, x - 10, y - 20); } }; }
// shop shelves full of products
function wShelf(x, y, w = 420) { const S = wSpr('shelf' + w, w, 210, g => { g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, w, 70); const sg = g.createLinearGradient(0, 70, 0, 210); sg.addColorStop(0, '#f2eee6'); sg.addColorStop(1, '#c8c2b4'); g.fillStyle = sg; g.fillRect(0, 70, w, 140);
    const cols = ['#e02020', '#f2d24a', '#2aa04a', '#1f6ae0', '#ff8a2a', '#9a4ad8', '#f4f4f4', '#3ad0c8'];
    for (let r = 0; r < 3; r++) { const sy = 78 + r * 44; g.fillStyle = '#9a9488'; g.fillRect(4, sy + 36, w - 8, 5); for (let i = 0; i < w / 26 - 1; i++) { const c = cols[(i * 3 + r * 5) % cols.length], px = 8 + i * 26, tall = (i + r) % 3 === 0; if (tall) { g.fillStyle = c; gRR(g, px + 4, sy + 4, 14, 32, 4); g.fill(); g.fillStyle = shade(c, 0.6); g.fillRect(px + 7, sy, 8, 6); } else { const bgc = g.createLinearGradient(px, 0, px + 22, 0); bgc.addColorStop(0, shade(c, 0.75)); bgc.addColorStop(0.5, shade(c, 1.15)); bgc.addColorStop(1, shade(c, 0.7)); g.fillStyle = bgc; g.fillRect(px, sy + 10, 22, 26); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(px + 3, sy + 18, 16, 6); } } }
    for (let i = 0; i < w / 40; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(6 + i * 40, 12, 30, 40); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(8 + i * 40, 14, 6, 36); } });
  return { x, y, w, d: 70, h: 140, sy: y + 70, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x + 6, y + 66, w, 10); c.drawImage(S, x, y - 140); } }; }
// a big wall TV
function wTV(x, y, w, h, scene) { return { x: 0, y: 0, w: 0, d: 0, sy: 0, solid: false, draw(c) { c.fillStyle = '#0c0d10'; gRR(c, x - 6, y - 6, w + 12, h + 12, 6); c.fill(); const g2 = c.createLinearGradient(x, y, x, y + h); g2.addColorStop(0, '#1e5a9a'); g2.addColorStop(1, '#0e2a4a'); c.fillStyle = g2; c.fillRect(x, y, w, h);
  if (scene === 'match') { c.fillStyle = '#3a9a4a'; c.fillRect(x, y + h * 0.45, w, h * 0.55); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2, y + h * 0.45); c.lineTo(x + w / 2, y + h); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + w * (0.3 + 0.4 * ((G.frame * 0.004) % 1)), y + h * 0.7, 4, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * 0.4, y); c.lineTo(x, y + h * 0.7); c.fill(); } }; }
// ---- vendors' stalls
function wIceCart(x, y) { const S = wSpr('icecart', 200, 200, g => { const cx = 100;
    g.fillStyle = '#e8e2d4'; g.fillRect(cx - 3, 20, 6, 110); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#ff6fb5' : '#ffffff'; g.beginPath(); g.moveTo(cx, 6); g.lineTo(cx - 80 + i * 26.6, 46); g.lineTo(cx - 80 + (i + 1) * 26.6, 46); g.closePath(); g.fill(); } g.fillStyle = '#ff6fb5'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx - 67 + i * 26.6, 46, 13.3, 0, Math.PI); g.fill(); }
    const bg = g.createLinearGradient(0, 110, 0, 170); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#d8e8f4'); g.fillStyle = bg; gRR(g, 30, 110, 140, 62, 10); g.fill(); g.strokeStyle = '#7ab8e8'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#9ad8ff'; gRR(g, 40, 98, 120, 16, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(48, 101, 40, 4);
    for (const [ix, ic] of [[58, '#ff9ac8'], [82, '#fff2c8'], [106, '#8a5a3a'], [130, '#9ae8b0']]) { g.fillStyle = ic; g.beginPath(); g.arc(ix, 104, 9, 0, 7); g.fill(); }
    gTxt(g, 'آيس كريم 🍦', 100, 142, 20, '#c8102e'); g.fillStyle = '#2a2a2e'; for (const wx of [52, 148]) { g.beginPath(); g.arc(wx, 176, 14, 0, 7); g.fill(); g.fillStyle = '#9aa0a8'; g.beginPath(); g.arc(wx, 176, 6, 0, 7); g.fill(); g.fillStyle = '#2a2a2e'; } });
  return { x: x - 70, y: y - 30, w: 140, d: 40, sy: y + 10, solid: true, act: 'ice', draw(c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(x + 8, y + 12, 86, 14, 0, 0, 7); c.fill(); c.drawImage(S, x - 100, y - 180); } }; }
function wKarakStall(x, y) { const S = wSpr('karak', 240, 210, g => { const bg = g.createLinearGradient(0, 80, 0, 200); bg.addColorStop(0, '#c8102e'); bg.addColorStop(1, '#7a0a1a'); g.fillStyle = '#a40c22'; g.fillRect(10, 60, 220, 30); g.fillStyle = bg; gRR(g, 10, 88, 220, 112, 8); g.fill();
    g.fillStyle = '#ffd34d'; g.fillRect(0, 52, 240, 16); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffd34d' : '#c8102e'; g.beginPath(); g.moveTo(i * 30, 68); g.lineTo(i * 30 + 30, 68); g.lineTo(i * 30 + 15, 82); g.closePath(); g.fill(); }
    gTxt(g, 'كرك ☕', 120, 34, 30, '#fff', 900, '#7a0a1a'); g.fillStyle = '#7a0a1a'; gRR(g, 40, 10, 160, 50, 10); g.fill(); gTxt(g, 'كرك وشاي ☕', 120, 36, 24, '#ffd34d');
    for (const [tx, tc] of [[56, '#c8c8cc'], [96, '#d4a83c']]) { const tg = g.createLinearGradient(tx - 14, 0, tx + 14, 0); tg.addColorStop(0, shade(tc, 0.7)); tg.addColorStop(0.5, shade(tc, 1.25)); tg.addColorStop(1, shade(tc, 0.65)); g.fillStyle = tg; gRR(g, tx - 14, 96, 28, 44, 6); g.fill(); g.fillStyle = shade(tc, 0.5); g.fillRect(tx - 6, 90, 12, 8); }
    for (let i = 0; i < 5; i++) { g.fillStyle = '#f8f6f0'; g.beginPath(); g.moveTo(140 + i * 16, 112); g.lineTo(152 + i * 16, 112); g.lineTo(150 + i * 16, 132); g.lineTo(142 + i * 16, 132); g.closePath(); g.fill(); g.fillStyle = '#c8a070'; g.fillRect(142 + i * 16, 113, 8, 5); }
    g.fillStyle = '#f2e6c8'; gRR(g, 30, 150, 180, 36, 6); g.fill(); gTxt(g, 'كرك 4 · سمبوسة 6 · رقاق 5', 120, 168, 15, '#7a0a1a', 800); });
  return { x: x - 110, y: y - 40, w: 220, d: 60, sy: y + 20, solid: true, act: 'karak', draw(c) { c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x - 104, y + 16, 224, 12); c.drawImage(S, x - 120, y + 20 - 200); } }; }
function wBench(x, y) { const S = wSpr('bench', 170, 110, g => { g.fillStyle = '#3a3e44'; for (const lx of [16, 140]) { g.fillRect(lx, 50, 8, 52); g.fillRect(lx - 4, 96, 16, 6); }
    for (let i = 0; i < 3; i++) { const sg = g.createLinearGradient(0, 14 + i * 14, 0, 26 + i * 14); sg.addColorStop(0, '#b07a44'); sg.addColorStop(1, '#7a4a22'); g.fillStyle = sg; gRR(g, 4, 10 + i * 13, 158, 11, 3); g.fill(); }
    for (let i = 0; i < 3; i++) { const sg = g.createLinearGradient(0, 52 + i * 12, 0, 62 + i * 12); sg.addColorStop(0, '#c88a50'); sg.addColorStop(1, '#8a5a2a'); g.fillStyle = sg; gRR(g, 0, 50 + i * 11, 166, 10, 3); g.fill(); } });
  return { x, y, w: 150, d: 50, sy: y + 50, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(x + 80, y + 50, 86, 12, 0, 0, 7); c.fill(); c.drawImage(S, x - 8, y + 50 - 102); } }; }
function wSofa(x, y, w = 300, col = '#4a5a7a') { const S = wSpr('sofa' + w + col, w, 140, g => { const bg = g.createLinearGradient(0, 0, 0, 60); bg.addColorStop(0, shade(col, 1.2)); bg.addColorStop(1, shade(col, 0.8)); g.fillStyle = bg; gRR(g, 0, 0, w, 64, 16); g.fill();
    for (const ax of [0, w - 34]) { const ag = g.createLinearGradient(ax, 0, ax + 34, 0); ag.addColorStop(0, shade(col, 0.8)); ag.addColorStop(0.5, shade(col, 1.15)); ag.addColorStop(1, shade(col, 0.75)); g.fillStyle = ag; gRR(g, ax, 20, 34, 110, 14); g.fill(); }
    const n = Math.max(2, Math.round((w - 68) / 80)), cw = (w - 68) / n; for (let i = 0; i < n; i++) { const cg = g.createLinearGradient(0, 50, 0, 120); cg.addColorStop(0, shade(col, 1.3)); cg.addColorStop(1, shade(col, 0.9)); g.fillStyle = cg; gRR(g, 34 + i * cw + 2, 50, cw - 4, 70, 10); g.fill(); g.strokeStyle = shade(col, 0.6); g.lineWidth = 1.5; g.stroke(); }
    g.fillStyle = '#ffd34d'; gRR(g, 46, 30, 40, 34, 10); g.fill(); g.fillStyle = '#e8eef4'; gRR(g, w - 90, 30, 40, 34, 10); g.fill(); });
  return { x, y, w, d: 70, sy: y + 70, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x + 8, y + 66, w, 10); c.drawImage(S, x, y + 70 - 130); } }; }
function wDhow(x, y) { const S = wSpr('dhow', 380, 330, g => { const by = 250;
    const hg = g.createLinearGradient(0, by - 40, 0, by + 40); hg.addColorStop(0, '#a87440'); hg.addColorStop(1, '#5a3418'); g.fillStyle = hg; g.beginPath(); g.moveTo(10, by - 30); g.quadraticCurveTo(40, by - 50, 360, by - 46); g.quadraticCurveTo(330, by + 40, 70, by + 34); g.quadraticCurveTo(30, by + 10, 10, by - 30); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(40,20,5,0.5)'; g.lineWidth = 2; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(20 + i * 6, by - 32 + i * 14); g.quadraticCurveTo(190, by - 34 + i * 16, 350 - i * 12, by - 44 + i * 16); g.stroke(); }
    g.fillStyle = '#e8d8b0'; g.fillRect(30, by - 52, 320, 8); g.fillStyle = '#c8102e'; g.fillRect(30, by - 44, 320, 4);
    g.fillStyle = '#5a3a1a'; g.fillRect(186, 20, 8, by - 60); g.strokeStyle = '#5a3a1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(80, 40); g.lineTo(330, 120); g.stroke();
    const sg = g.createLinearGradient(80, 40, 300, by); sg.addColorStop(0, '#fbf8f0'); sg.addColorStop(1, '#d8cfba'); g.fillStyle = sg; g.beginPath(); g.moveTo(84, 44); g.quadraticCurveTo(230, 90, 326, 122); g.lineTo(196, by - 62); g.quadraticCurveTo(150, 150, 84, 44); g.closePath(); g.fill(); g.strokeStyle = 'rgba(120,100,70,0.5)'; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = 'rgba(60,40,20,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(190, 20); g.lineTo(20, by - 52); g.moveTo(190, 20); g.lineTo(350, by - 50); g.stroke(); });
  return { x: x - 40, y: y + 60, w: 300, d: 40, sy: y + 120, solid: false, draw(c) { const b = Math.sin(G.frame * 0.04) * 4; c.drawImage(S, x - 30, y - 230 + b); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(x + 160, y + 58 + b, 170, 10, 0, 0, 7); c.fill(); } }; }
// ---- the maps
const WMAPS = {};
function wMaps() {
  if (WMAPS.fareej) return WMAPS;
  // الفريج — the neighbourhood: the hub that leads everywhere
  WMAPS.fareej = { name: 'الفريج', W: 3500, H: 1500, spawn: [1180, 760],
    floor(c, M) { c.fillStyle = '#d9c49a'; c.fillRect(0, 0, M.W, M.H);
      for (let i = 0; i < 90; i++) { const x = (i * 7919) % M.W, y = (i * 3571) % M.H, r = 60 + (i % 7) * 30, g = c.createRadialGradient(x, y, 4, x, y, r); g.addColorStop(0, i % 2 ? 'rgba(170,140,90,0.18)' : 'rgba(255,245,220,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
      gNoise(c, 0, 0, M.W, M.H, 26000, ['rgba(120,90,50,0.16)', 'rgba(255,255,255,0.16)', 'rgba(90,70,40,0.1)'], 2, 5);
      for (const sy of [580, 820]) { for (let y = sy; y < sy + 40; y += 10) for (let x = ((y / 10) % 2) * 10; x < M.W; x += 20) { c.fillStyle = ((x / 20 + y / 10) % 3) ? '#cbc4b6' : '#bdb5a6'; c.fillRect(x, y, 19, 9); } }
      for (const cy of [616, 820]) for (let x = 0; x < M.W; x += 40) { c.fillStyle = (x / 40) % 2 ? '#f2d24a' : '#1c1c20'; c.fillRect(x, cy, 40, 6); }
      const rg = c.createLinearGradient(0, 622, 0, 820); rg.addColorStop(0, '#3e4148'); rg.addColorStop(0.5, '#4a4d54'); rg.addColorStop(1, '#3a3d44'); c.fillStyle = rg; c.fillRect(0, 622, M.W, 198);
      gNoise(c, 0, 622, M.W, 198, 30000, ['rgba(0,0,0,0.25)', 'rgba(255,255,255,0.12)', 'rgba(140,140,150,0.18)'], 2, 9);
      c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(0, 656, M.W, 26); c.fillRect(0, 756, M.W, 26); c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(0, 690, M.W, 8);
      c.fillStyle = '#e8e8e8'; c.fillRect(0, 630, M.W, 4); c.fillRect(0, 808, M.W, 4); c.fillStyle = '#f2d24a'; for (let x = 20; x < M.W; x += 120) c.fillRect(x, 716, 60, 7);
      for (let i = 0; i < 8; i++) { c.fillStyle = '#ececec'; c.fillRect(1130 + i * 22, 636, 13, 172); c.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = 0; k < 6; k++) c.fillRect(1130 + i * 22 + ((k * 5) % 9), 650 + k * 26, 4, 3); }
      for (const [px, pw] of [[2700, 300], [200, 420]]) { c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 4; for (let x = px; x <= px + pw; x += pw / 3) { c.beginPath(); c.moveTo(x, 960); c.lineTo(x, 1110); c.stroke(); } }
      const gg = c.createLinearGradient(0, 960, 0, 1260); gg.addColorStop(0, '#5f9a44'); gg.addColorStop(1, '#4a8236'); c.fillStyle = gg; c.fillRect(1650, 960, 520, 300);
      for (let i = 0; i < 2600; i++) { const x = 1650 + (i * 37) % 520, y = 964 + (i * 53) % 294; c.strokeStyle = i % 3 ? 'rgba(130,190,90,0.6)' : 'rgba(40,90,30,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x + ((i % 5) - 2), y); c.stroke(); }
      for (let i = 0; i < 40; i++) { c.fillStyle = ['#ff6a8a', '#ffd34d', '#ffffff'][i % 3]; c.beginPath(); c.arc(1670 + (i * 131) % 480, 980 + (i * 71) % 260, 3, 0, 7); c.fill(); }
      c.strokeStyle = '#b8b0a2'; c.lineWidth = 8; c.strokeRect(1646, 956, 528, 308); c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 2; c.strokeRect(1642, 952, 536, 316); },
    objs: [
      wHouse(200, 300, 560, 230, 210, { wall: '#eadcc2', mashrabiya: 1, wins: [[50, 50, 90, 70], [420, 50, 90, 70]], door: [230, 70, 100, 140, '#7a4a24'], doorC: '#7a4a24', sign: [170, 14, 220, 42, '#7a1f2a', 'الديوانية'], ac: [[60, 140], [440, 140]], lamps: [218, 342] }),
      wHouse(980, 320, 480, 210, 190, { wall: '#f2efe8', sign: [0, 0, 480, 48, '#1f8a4a', 'بقالة الشلة 🛒'], wins: [[30, 70, 150, 100], [300, 70, 150, 100]], door: [195, 70, 90, 120], glassDoor: 1, trim: '#9aa4ae', tank: true }),
      wHouse(1640, 260, 560, 260, 230, { wall: '#e4d4b4', wins: [[40, 60, 110, 80], [200, 60, 110, 80], [340, 60, 90, 80]], door: [470, 100, 70, 130], doorC: '#2a5a7a', sign: [452, 50, 106, 40, '#2a6a8a', 'بيتي 🏠'], ac: [[60, 160], [220, 160]] }),
      wHouse(2380, 320, 460, 210, 190, { wall: '#f6e6c8', sign: [0, 0, 460, 50, '#e07a20', 'مطعم الشلة 🍔'], awning: [0, 50, 460, '#c8102e'], wins: [[30, 96, 140, 70], [290, 96, 140, 70]], door: [190, 84, 80, 106], glassDoor: 1 }),
      wHouse(2960, 200, 500, 320, 270, { wall: '#e8d2a4', trim: '#a8844a', mashrabiya: 1, wins: [[40, 90, 90, 90], [370, 90, 90, 90]], door: [190, 130, 120, 140], doorC: '#5a3a1a', sign: [150, 22, 200, 42, '#6a2a1a', 'بيت الجد 🏡'], lamps: [170, 330], ac: [[50, 200], [380, 200]] }),
      wPalm(2900, 600), wPalm(3440, 600), wPalm(2620, 920), wPalm(3150, 1250), wLamp(2680, 590), wLamp(3250, 880), wCar(2750, 1000, '#c8102e', { model: 'sedan' }),
      wPalm(130, 600), wPalm(880, 600), wPalm(1560, 600), wPalm(2290, 600), wPalm(420, 900), wPalm(980, 920), wPalm(2000, 1300),
      wLamp(560, 590), wLamp(1500, 590), wLamp(860, 880), wLamp(1900, 880),
      wCar(1240, 980, '#f4f5f7', { tag: 'car', model: 'suv' }), wCar(300, 1060, '#2a4a8a', { model: 'suv', flip: 1 }),
      wKarakStall(670, 1060),
      wBench(1700, 1000), wTree(2080, 1060, 0.9), wTree(1760, 1250, 0.8, '#5a9a40'), wTree(3350, 1100, 1), wTree(140, 1250, 0.9),
    ],
    exits: [{ x: 430, y: 530, w: 100, h: 50, to: 'diwan', at: [700, 760], label: 'الديوانية' }, { x: 1175, y: 530, w: 90, h: 50, to: 'shop', at: [650, 720], label: 'البقالة' },
      { x: 2095, y: 520, w: 100, h: 50, to: 'home', at: [600, 700], label: 'بيتي' }, { x: 2560, y: 530, w: 100, h: 50, to: 'rest', at: [650, 760], label: 'المطعم' }, { x: 3150, y: 520, w: 120, h: 50, to: 'jadd', at: [800, 880], label: 'بيت الجد' },
      { x: 3440, y: 620, w: 60, h: 200, to: 'beach', at: [140, 900], label: 'الكورنيش ➜' }, { x: 0, y: 620, w: 60, h: 200, to: 'pitch', at: [1860, 700], label: '⬅ الملعب' }] };
  // الديوانية — the majlis
  WMAPS.diwan = { name: 'الديوانية', W: 1400, H: 900, spawn: [700, 760], wall: 150,
    floor(c, M) { c.fillStyle = '#b8875a'; c.fillRect(0, 0, M.W, M.H); c.strokeStyle = 'rgba(80,50,20,0.25)'; c.lineWidth = 2; for (let y = 0; y < M.H; y += 34) { c.beginPath(); c.moveTo(0, y); c.lineTo(M.W, y); c.stroke(); for (let x = (y / 34 % 2) * 90; x < M.W; x += 180) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 34); c.stroke(); } }
      c.fillStyle = '#efe6d6'; c.fillRect(0, 0, M.W, 150); c.fillStyle = '#d8ccb8'; c.fillRect(0, 130, M.W, 20); },
    decals: [wRug(330, 300, 740, 420, '#8a1c24', '#e8c45a')],
    objs: [
      wBox(560, 40, 280, 40, 0, '#222', { solid: false, sy: 0, draw(c) { c.fillStyle = '#16171c'; c.fillRect(560, 20, 280, 110); c.fillStyle = '#1e3a6a'; c.fillRect(570, 28, 260, 92); txt('معركة الشلة', 700, 76, { size: 30, weight: 900, color: '#ff4050' }); } }),
      wBox(80, 30, 120, 20, 0, '#222', { solid: false, sy: 0, draw(c) { wWin(c, 80, 30, 120, 90); wWin(c, 1200, 30, 120, 90); } }),
      wMajlis(60, 160, 1280, 60), wMajlis(60, 220, 70, 520, true), wMajlis(1270, 220, 70, 520, true),
      wCoffee(600, 470),
      wPlant(1225, 810), wPlant(175, 810),
    ],
    exits: [{ x: 640, y: 850, w: 120, h: 50, to: 'fareej', at: [480, 600], label: 'الفريج ⬇' }] };
  // البقالة — the grocery (with the clothes rack)
  WMAPS.shop = { name: 'البقالة', W: 1300, H: 860, spawn: [650, 720], wall: 140,
    floor(c, M) { for (let y = 0; y < M.H; y += 50) for (let x = 0; x < M.W; x += 50) { c.fillStyle = ((x + y) / 50) % 2 ? '#e8ecef' : '#cfd6dc'; c.fillRect(x, y, 50, 50); } c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, M.W, 140); c.fillStyle = '#1f8a4a'; c.fillRect(0, 120, M.W, 20); },
    objs: [
      wBox(60, 40, 520, 60, 0, '#fff', { solid: false, sy: 0, draw(c) { c.fillStyle = '#d9eef5'; c.fillRect(60, 20, 520, 110); c.strokeStyle = '#8aa'; c.lineWidth = 3; for (let i = 0; i < 4; i++) c.strokeRect(60 + i * 130, 20, 130, 110); for (let i = 0; i < 24; i++) { c.fillStyle = ['#e02020', '#1f6ae0', '#f2a020', '#2aa04a'][i % 4]; c.fillRect(74 + (i % 12) * 42, 34 + ((i / 12) | 0) * 50, 16, 36); } } }),
      wShelf(120, 240), wShelf(120, 420),
      wBox(780, 560, 330, 80, 90, '#8a6236', { act: 'snack', deco(c, o) { c.fillStyle = '#2a2c34'; c.fillRect(980, o.y - 110, 80, 50); c.fillStyle = '#7dffb0'; c.fillRect(992, o.y - 104, 56, 18); } }),
      wRack(820, 250),
    ],
    exits: [{ x: 590, y: 810, w: 120, h: 50, to: 'fareej', at: [1220, 600], label: 'الفريج ⬇' }] };
  // الملعب — the football pitch
  WMAPS.pitch = { name: 'الملعب', W: 2000, H: 1300, spawn: [1860, 700],
    floor(c, M) { for (let x = 0; x < M.W; x += 100) { c.fillStyle = (x / 100) % 2 ? '#3f9a4a' : '#4aa856'; c.fillRect(x, 0, 100, M.H); }
      c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 6; c.strokeRect(120, 260, 1660, 900); c.beginPath(); c.moveTo(950, 260); c.lineTo(950, 1160); c.stroke(); c.beginPath(); c.arc(950, 710, 130, 0, 7); c.stroke();
      c.strokeRect(120, 520, 180, 380); c.strokeRect(1600, 520, 180, 380); },
    objs: [
      ...[0, 1, 2].map(i => wBox(200 + i * 40, 40 + i * 50, 1600 - i * 80, 60, 60 + i * 20, ['#c8102e', '#1f4fd8', '#f2efe8'][i])),
      wGoal(60, 600, false), wGoal(1810, 600, true), wLamp(140, 230), wLamp(1860, 230),
    ],
    exits: [{ x: 1940, y: 600, w: 60, h: 200, to: 'fareej', at: [140, 720], label: 'الفريج ➜' }] };
  // الكورنيش — the beach (النوخذة waits by his boat)
  WMAPS.beach = { name: 'الكورنيش', W: 2200, H: 1300, spawn: [140, 900], block: [[0, 0, 2200, 430]],
    floor(c, M) { const sea = c.createLinearGradient(0, 0, 0, 440); sea.addColorStop(0, '#0a4a8a'); sea.addColorStop(0.55, '#1a7ab8'); sea.addColorStop(1, '#4ac0d8'); c.fillStyle = sea; c.fillRect(0, 0, M.W, 440);
      for (let i = 0; i < 260; i++) { const x = (i * 7919) % M.W, y = (i * 613) % 400; c.strokeStyle = `rgba(255,255,255,${0.06 + (y / 400) * 0.14})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y - 4, x + 40, y); c.stroke(); }
      const sand = c.createLinearGradient(0, 430, 0, M.H); sand.addColorStop(0, '#c8b07a'); sand.addColorStop(0.1, '#e2cc96'); sand.addColorStop(1, '#efdcab'); c.fillStyle = sand; c.fillRect(0, 430, M.W, M.H - 430);
      c.fillStyle = 'rgba(120,95,55,0.35)'; c.fillRect(0, 430, M.W, 26); c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.moveTo(0, 432); for (let x = 0; x <= M.W; x += 40) c.lineTo(x, 432 + Math.sin(x * 0.02) * 6); c.lineTo(M.W, 444); for (let x = M.W; x >= 0; x -= 40) c.lineTo(x, 444 + Math.sin(x * 0.02 + 1) * 5); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(170,140,90,0.25)'; c.lineWidth = 2; for (let y = 520; y < M.H; y += 46) { c.beginPath(); for (let x = 0; x <= M.W; x += 30) c.lineTo(x, y + Math.sin(x * 0.015 + y) * 8); c.stroke(); }
      gNoise(c, 0, 450, M.W, M.H - 450, 20000, ['rgba(150,110,60,0.18)', 'rgba(255,255,255,0.22)', 'rgba(120,90,50,0.12)'], 2, 13);
      for (let i = 0; i < 26; i++) { const x = (i * 811) % M.W, y = 600 + (i * 397) % 650; c.fillStyle = i % 2 ? '#f4ece0' : '#d8b890'; c.beginPath(); c.ellipse(x, y, 5, 3, i, 0, 7); c.fill(); }
      for (let y = 190; y < 470; y += 20) { const pg = c.createLinearGradient(1500, 0, 1590, 0); pg.addColorStop(0, '#7a5a34'); pg.addColorStop(0.5, '#b08a5a'); pg.addColorStop(1, '#6a4a28'); c.fillStyle = pg; c.fillRect(1500, y, 90, 18); c.fillStyle = 'rgba(40,25,10,0.35)'; c.fillRect(1500, y + 18, 90, 2); }
      c.fillStyle = '#4a3218'; for (const px of [1496, 1588]) for (let y = 200; y < 470; y += 60) c.fillRect(px, y, 8, 26);
      for (const [tx, ty, tc] of [[620, 860, '#3ea0ff'], [1000, 1100, '#ff6fb5'], [1420, 860, '#ffd34d']]) { c.fillStyle = tc; c.save(); c.translate(tx, ty); c.rotate(-0.15); c.fillRect(-60, -24, 120, 48); c.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = -50; k < 60; k += 20) c.fillRect(k, -24, 8, 48); c.restore(); } },
    objs: [
      wDhow(1680, 300),
      wUmbrella(500, 760, '#e02020'), wUmbrella(900, 1000, '#1f6ae0'), wUmbrella(1300, 760, '#f2a020'),
      wPalm(260, 560), wPalm(1100, 560), wPalm(2050, 600), wPalm(700, 1200),
      wIceCart(1785, 960),
    ],
    exits: [{ x: 0, y: 800, w: 60, h: 200, to: 'fareej', at: [3360, 720], label: '⬅ الفريج' }] };
  // بيتي — my house: bed, fridge, closet
  WMAPS.home = { name: 'بيتي', W: 1200, H: 820, spawn: [600, 700], wall: 140,
    floor(c, M) { for (let y = 0; y < M.H; y += 60) for (let x = 0; x < M.W; x += 60) { c.fillStyle = ((x + y) / 60) % 2 ? '#e8e0d0' : '#ddd3c0'; c.fillRect(x, y, 60, 60); } c.fillStyle = '#c8dce8'; c.fillRect(0, 0, M.W, 140); c.fillStyle = '#a8bccc'; c.fillRect(0, 122, M.W, 18); },
    decals: [wRug(560, 420, 460, 260, '#2a5a8a', '#e8e0d0')],
    objs: [
      { x: 0, y: 0, w: 0, d: 0, sy: 0, solid: false, draw(c) { wWin(c, 420, 24, 140, 90); c.fillStyle = '#16171c'; c.fillRect(700, 18, 230, 100); c.fillStyle = '#2a6aa8'; c.fillRect(710, 26, 210, 84); txt('⚽ 2 - 1', 815, 70, { size: 26, weight: 900, color: '#fff', rtl: false }); } },
      wBed(80, 190), wCloset(380, 150), wFridge(1040, 150),
      wSofa(620, 560, 300), wPlant(1100, 690),
    ],
    exits: [{ x: 540, y: 770, w: 120, h: 50, to: 'fareej', at: [2145, 600], label: 'الفريج ⬇' }] };
  // المطعم — the restaurant (الطباخ cooks)
  WMAPS.rest = { name: 'المطعم', W: 1300, H: 880, spawn: [650, 760], wall: 150,
    floor(c, M) { for (let y = 0; y < M.H; y += 44) for (let x = 0; x < M.W; x += 88) { c.fillStyle = ((x / 88 + y / 44) % 2) ? '#c88a5a' : '#b87a4a'; c.fillRect(x + ((y / 44) % 2) * 44, y, 88, 44); } c.fillStyle = '#f6e6c8'; c.fillRect(0, 0, M.W, 150); c.fillStyle = '#e07a20'; c.fillRect(0, 132, M.W, 18); },
    objs: [
      { x: 0, y: 0, w: 0, d: 0, sy: 0, solid: false, draw(c) { c.fillStyle = '#2a1a12'; rrect(380, 14, 540, 108, 10); c.fill(); c.strokeStyle = '#e8c45a'; c.lineWidth = 3; c.stroke(); txt('المنيو', 650, 36, { size: 20, weight: 900, color: '#ffd34d' }); txt('🌯 شاورما 10  ·  🍔 برجر 20  ·  🍛 كبسة 35  ·  🧃 عصير 5', 650, 82, { size: 19, weight: 800, color: '#fff' }); } },
      wBox(300, 250, 700, 60, 70, '#8a5a32', { act: 'food', topCol: '#c8b8a0', deco(c, o) { c.fillStyle = '#d8d8d8'; for (const dx of [80, 240, 460, 620]) { c.beginPath(); c.ellipse(o.x + dx, o.y - 42, 34, 12, 0, 0, 7); c.fill(); } c.fillStyle = '#e8a040'; c.beginPath(); c.ellipse(o.x + 240, o.y - 44, 22, 7, 0, 0, 7); c.fill(); c.fillStyle = '#8a4a20'; c.fillRect(o.x + 450, o.y - 56, 20, 18); } }),
      wTable(330, 470), wTable(970, 470), wTable(330, 680), wTable(970, 680),
      wPlant(1220, 690),
    ],
    exits: [{ x: 590, y: 830, w: 120, h: 50, to: 'fareej', at: [2610, 600], label: 'الفريج ⬇' }] };
  // بيت الجد — grandpa's big house: the majlis, lunch on the sufra, a bed to rest
  WMAPS.jadd = { name: 'بيت الجد', W: 1600, H: 1000, spawn: [800, 880], wall: 160,
    floor(c, M) { c.fillStyle = '#a87850'; c.fillRect(0, 0, M.W, M.H); c.strokeStyle = 'rgba(70,40,20,0.25)'; c.lineWidth = 2; for (let y = 0; y < M.H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(M.W, y); c.stroke(); }
      c.fillStyle = '#f0e2c4'; c.fillRect(0, 0, M.W, 160); c.fillStyle = '#c8a46a'; c.fillRect(0, 140, M.W, 20); c.fillStyle = '#7a1f2a'; c.fillRect(1180, 160, 420, 330); c.strokeStyle = '#e8c45a'; c.lineWidth = 6; c.strokeRect(1192, 172, 396, 306); },
    decals: [wRug(260, 330, 760, 380, '#6a1820', '#d8b45a'), wSufra(470, 460, 340, 170)],
    objs: [
      { x: 0, y: 0, w: 0, d: 0, sy: 0, solid: false, draw(c) { for (const wx of [120, 470, 820]) { c.fillStyle = '#6a4a2a'; c.beginPath(); c.moveTo(wx, 140); c.lineTo(wx, 70); c.arc(wx + 50, 70, 50, Math.PI, 0); c.lineTo(wx + 100, 140); c.fill(); c.fillStyle = '#9fd3ef'; c.fillRect(wx + 12, 74, 76, 64); }
        c.fillStyle = '#8a5a32'; c.fillRect(1060, 70, 80, 70); c.fillStyle = '#3a2a1a'; c.beginPath(); c.arc(1100, 100, 20, 0, 7); c.fill(); c.fillStyle = '#d4a83c'; c.beginPath(); c.ellipse(1020, 120, 14, 22, 0, 0, 7); c.fill(); } },
      wMajlis(60, 170, 1100, 60), wMajlis(60, 230, 70, 600, true),
      wJadd(640, 300), wBed(1270, 220, '#8a1f2a'),
      wPlant(1265, 690), wPlant(1495, 690),
    ],
    exits: [{ x: 740, y: 950, w: 120, h: 50, to: 'fareej', at: [3210, 600], label: 'الفريج ⬇' }] };
  wMapsSaga();
  for (const id of ['diwan', 'shop', 'home', 'rest', 'jadd']) { const M = WMAPS[id], f0 = M.floor; M.floor = (c, M2) => { f0(c, M2); gNoise(c, 0, M2.wall, M2.W, M2.H - M2.wall, M2.W * M2.H / 60, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.07)'], 2, 17); const g = c.createLinearGradient(0, M2.wall, 0, M2.wall + 60); g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, M2.wall, M2.W, 60); }; }
  return WMAPS;
}
// ---- story places: they open on the 🗺️ map as the story reaches them
function wPillar(x, y, col = '#efe6d2', cap = '#c8a040', h = 250) { return { x: x - 30, y: y - 18, w: 60, d: 36, sy: y + 18, solid: true, draw(c) {
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(x + 10, y + 14, 46, 12, 0, 0, 7); c.fill();
  c.fillStyle = cap; c.fillRect(x - 36, y - 6, 72, 22); c.fillRect(x - 36, y - h - 4, 72, 20);
  const g = c.createLinearGradient(x - 27, 0, x + 27, 0); g.addColorStop(0, W_SHADE(col, 0.72)); g.addColorStop(0.45, W_SHADE(col, 1.1)); g.addColorStop(1, W_SHADE(col, 0.6)); c.fillStyle = g; c.fillRect(x - 27, y - h + 16, 54, h - 22);
  c.strokeStyle = 'rgba(0,0,0,0.16)'; c.lineWidth = 2; for (const dx of [-14, 0, 14]) { c.beginPath(); c.moveTo(x + dx, y - h + 18); c.lineTo(x + dx, y - 8); c.stroke(); }
  c.fillStyle = W_SHADE(cap, 1.15); c.fillRect(x - 36, y - h - 4, 72, 5); } }; }
function wBrazier(x, y) { return { x: x - 20, y: y - 12, w: 40, d: 24, sy: y + 12, solid: true, glow: [x, y - 70, 170, '150,40,255'], draw(c) {
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(x, y + 8, 30, 9, 0, 0, 7); c.fill();
  c.fillStyle = '#2a2230'; c.fillRect(x - 6, y - 40, 12, 46); c.fillStyle = '#3a3044'; c.beginPath(); c.moveTo(x - 30, y - 52); c.lineTo(x + 30, y - 52); c.lineTo(x + 18, y - 36); c.lineTo(x - 18, y - 36); c.closePath(); c.fill();
  const t = G.frame * 0.18 + x; c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const fx = x + Math.sin(t + i * 1.7) * 10, fh = 40 + Math.sin(t * 1.3 + i) * 12; const g = c.createRadialGradient(fx, y - 60, 2, fx, y - 60, fh * 0.7); g.addColorStop(0, 'rgba(230,180,255,0.9)'); g.addColorStop(0.4, 'rgba(170,60,255,0.6)'); g.addColorStop(1, 'rgba(90,0,180,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(fx, y - 52 - fh * 0.35, 13, fh * 0.6, 0, 0, 7); c.fill(); }
  c.restore(); } }; }
function wCrate(x, y, s = 1) { return wBox(x, y, 110 * s, 80 * s, 86 * s, '#8a6a3a', { deco(c, o) { const fy = frontY(o); c.strokeStyle = 'rgba(60,40,20,0.6)'; c.lineWidth = 4; c.strokeRect(o.x + 6, fy + 6, o.w - 12, o.h - 12); c.beginPath(); c.moveTo(o.x + 6, fy + 6); c.lineTo(o.x + o.w - 6, fy + o.h - 6); c.stroke(); } }); }
function wMapsSaga() {
  // القصر — the family palace: marble, a red carpet, the throne and the feast
  WMAPS.qasr = { name: 'القصر', icon: '🏰', lock: 1, W: 2000, H: 1250, spawn: [1000, 1110], wall: 170,
    floor(c, M) { c.fillStyle = '#e9e0cc'; c.fillRect(0, 0, M.W, M.H);
      for (let y = 170; y < M.H; y += 100) for (let x = 0; x < M.W; x += 100) if (((x + y) / 100) % 2) { c.fillStyle = '#d9cdb0'; c.fillRect(x, y, 100, 100); }
      c.strokeStyle = 'rgba(200,160,64,0.35)'; c.lineWidth = 2; for (let x = 0; x < M.W; x += 100) { c.beginPath(); c.moveTo(x, 170); c.lineTo(x, M.H); c.stroke(); } for (let y = 170; y < M.H; y += 100) { c.beginPath(); c.moveTo(0, y); c.lineTo(M.W, y); c.stroke(); }
      c.fillStyle = '#5a1018'; c.fillRect(0, 0, M.W, 170); c.fillStyle = '#c8a040'; c.fillRect(0, 150, M.W, 20); c.fillStyle = '#e8c45a'; c.fillRect(0, 150, M.W, 4);
      for (let x = 120; x < M.W - 100; x += 260) { if (Math.abs(x + 50 - 1000) < 200) continue; c.fillStyle = '#2a0a0e'; c.beginPath(); c.moveTo(x, 140); c.lineTo(x, 60); c.arc(x + 50, 60, 50, Math.PI, 0); c.lineTo(x + 100, 140); c.fill();
        const g = c.createLinearGradient(0, 20, 0, 140); g.addColorStop(0, '#3a6ad8'); g.addColorStop(1, '#e8c45a'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 10, 136); c.lineTo(x + 10, 62); c.arc(x + 50, 62, 40, Math.PI, 0); c.lineTo(x + 90, 136); c.fill(); c.strokeStyle = '#c8a040'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 50, 22); c.lineTo(x + 50, 136); c.moveTo(x + 10, 92); c.lineTo(x + 90, 92); c.stroke(); }
      for (const bx of [760, 1180]) { c.fillStyle = '#1a2a6a'; c.beginPath(); c.moveTo(bx, 10); c.lineTo(bx + 60, 10); c.lineTo(bx + 60, 128); c.lineTo(bx + 30, 112); c.lineTo(bx, 128); c.closePath(); c.fill(); c.fillStyle = '#e8c45a'; c.beginPath(); c.arc(bx + 30, 56, 16, 0, 7); c.fill(); c.fillStyle = '#1a2a6a'; c.beginPath(); c.arc(bx + 30, 56, 9, 0, 7); c.fill(); }
      c.fillStyle = '#c8a040'; c.fillRect(800, 180, 400, 130); c.fillStyle = '#e8c45a'; c.fillRect(820, 190, 360, 100); c.fillStyle = '#b08a30'; c.fillRect(800, 290, 400, 20);
      c.fillStyle = '#9a1424'; c.fillRect(910, 300, 180, M.H - 300); c.fillStyle = '#e8c45a'; c.fillRect(904, 300, 8, M.H - 300); c.fillRect(1088, 300, 8, M.H - 300);
      c.fillStyle = 'rgba(232,196,90,0.5)'; for (let y = 340; y < M.H; y += 120) { c.beginPath(); c.moveTo(1000, y); c.lineTo(1030, y + 30); c.lineTo(1000, y + 60); c.lineTo(970, y + 30); c.closePath(); c.fill(); } },
    objs: [
      { x: 925, y: 196, w: 150, d: 60, sy: 256, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(935, 246, 150, 16);
        c.fillStyle = '#8a0f1c'; rrect(930, 40, 140, 190, 20); c.fill(); c.strokeStyle = '#e8c45a'; c.lineWidth = 8; rrect(930, 40, 140, 190, 20); c.stroke();
        c.fillStyle = '#e8c45a'; c.beginPath(); c.moveTo(950, 44); c.lineTo(970, 6); c.lineTo(985, 34); c.lineTo(1000, -4); c.lineTo(1015, 34); c.lineTo(1030, 6); c.lineTo(1050, 44); c.closePath(); c.fill();
        c.fillStyle = '#b08a30'; c.fillRect(915, 150, 170, 96); c.fillStyle = '#c8102e'; c.fillRect(935, 160, 130, 46); c.fillStyle = '#e8c45a'; c.fillRect(915, 150, 20, 96); c.fillRect(1065, 150, 20, 96); } },
      wPillar(560, 430), wPillar(1440, 430), wPillar(560, 730), wPillar(1440, 730), wPillar(560, 1030), wPillar(1440, 1030),
      wBox(170, 420, 250, 380, 34, '#6a3a1a', { topCol: '#f4efe2', deco(c, o) { for (let i = 0; i < 4; i++) { const y = o.y - o.h + 50 + i * 85; c.fillStyle = '#d8d8d8'; c.beginPath(); c.ellipse(o.x + 125, y, 70, 30, 0, 0, 7); c.fill(); c.fillStyle = ['#e8a040', '#c8502a', '#f4e8c0', '#8a4a20'][i]; c.beginPath(); c.ellipse(o.x + 125, y - 3, 54, 20, 0, 0, 7); c.fill(); c.fillStyle = '#e8c45a'; c.beginPath(); c.arc(o.x + 40, y, 9, 0, 7); c.arc(o.x + 210, y, 9, 0, 7); c.fill(); } } }),
      wBox(1580, 420, 250, 380, 34, '#6a3a1a', { topCol: '#f4efe2', deco(c, o) { for (let i = 0; i < 4; i++) { const y = o.y - o.h + 50 + i * 85; c.fillStyle = '#d8d8d8'; c.beginPath(); c.ellipse(o.x + 125, y, 70, 30, 0, 0, 7); c.fill(); c.fillStyle = ['#5aa04a', '#e8a040', '#d84030', '#f4e8c0'][i]; c.beginPath(); c.ellipse(o.x + 125, y - 3, 54, 20, 0, 0, 7); c.fill(); c.fillStyle = '#e8c45a'; c.beginPath(); c.arc(o.x + 40, y, 9, 0, 7); c.arc(o.x + 210, y, 9, 0, 7); c.fill(); } } }),
    ],
    exits: [{ x: 940, y: 1200, w: 120, h: 50, to: 'fareej', at: [1180, 760], label: 'الفريج ⬇' }] };
  // الحلبة — the fighters' arena: a ring, the crowd and the lights
  WMAPS.halba = { name: 'الحلبة', icon: '🥊', lock: 1, W: 1800, H: 1250, spawn: [900, 1110], wall: 170,
    floor(c, M) { c.fillStyle = '#1a1d2a'; c.fillRect(0, 0, M.W, M.H); c.strokeStyle = 'rgba(255,255,255,0.04)'; c.lineWidth = 2; for (let x = 0; x < M.W; x += 60) { c.beginPath(); c.moveTo(x, 170); c.lineTo(x, M.H); c.stroke(); }
      c.fillStyle = '#10121c'; c.fillRect(0, 0, M.W, 170); for (let r = 0; r < 4; r++) for (let x = 10 + (r % 2) * 14; x < M.W; x += 28) { const k = (x * 7 + r * 13) % 6; c.fillStyle = ['#c8102e', '#3ea0ff', '#ffd34d', '#5be37d', '#ffffff', '#ff8a2a'][k]; c.beginPath(); c.arc(x, 22 + r * 34, 9, 0, 7); c.fill(); c.fillStyle = '#c89a74'; c.beginPath(); c.arc(x, 14 + r * 34, 6, 0, 7); c.fill(); }
      c.fillStyle = '#05060b'; c.fillRect(640, 12, 520, 120); c.strokeStyle = '#ffd34d'; c.lineWidth = 5; c.strokeRect(640, 12, 520, 120); const g = c.createLinearGradient(0, 16, 0, 128); g.addColorStop(0, '#5a0e18'); g.addColorStop(1, '#0e2a5a'); c.fillStyle = g; c.fillRect(648, 20, 504, 104);
      c.fillStyle = '#ffd34d'; c.font = '900 54px ' + FA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('بطولة المقاتلين', 900, 72); c.direction = 'ltr';
      c.fillStyle = '#c8102e'; c.fillRect(0, 150, M.W, 20);
      c.fillStyle = '#0c0e16'; c.fillRect(560, 380, 680, 520); c.fillStyle = '#20408a'; c.fillRect(600, 410, 600, 460); c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.strokeRect(600, 410, 600, 460);
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 4; c.beginPath(); c.arc(900, 640, 90, 0, 7); c.stroke(); c.fillStyle = 'rgba(255,211,77,0.25)'; c.beginPath(); c.arc(900, 640, 40, 0, 7); c.fill();
      for (const [rc, ry] of [[0, 0], [1, 1], [2, 2]]) { void rc; c.strokeStyle = ['#ff3b4a', '#ffffff', '#3ea0ff'][ry]; c.lineWidth = 4; c.strokeRect(588 - ry * 4, 398 - ry * 4, 624 + ry * 8, 484 + ry * 8); } },
    objs: [
      ...[[588, 398, '#ff3b4a'], [1212, 398, '#3ea0ff'], [588, 882, '#3ea0ff'], [1212, 882, '#ff3b4a']].map(([x, y, col]) => ({ x: x - 12, y: y - 12, w: 24, d: 24, sy: y + 12, solid: true, draw(c) { c.fillStyle = '#c0c5cf'; c.fillRect(x - 8, y - 90, 16, 100); c.fillStyle = col; c.fillRect(x - 13, y - 86, 26, 70); } })),
      wBox(30, 300, 250, 640, 46, '#2a3048', { deco(c, o) { for (let r = 0; r < 9; r++) for (let i = 0; i < 6; i++) { const x = o.x + 26 + i * 40 + (r % 2) * 10, y = o.y - o.h + 40 + r * 66; c.fillStyle = ['#c8102e', '#3ea0ff', '#ffd34d', '#5be37d', '#e8e8e8'][(r * 3 + i) % 5]; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); c.fillStyle = '#c89a74'; c.beginPath(); c.arc(x, y - 12, 8, 0, 7); c.fill(); } } }),
      wBox(1520, 300, 250, 640, 46, '#2a3048', { deco(c, o) { for (let r = 0; r < 9; r++) for (let i = 0; i < 6; i++) { const x = o.x + 26 + i * 40 + (r % 2) * 10, y = o.y - o.h + 40 + r * 66; c.fillStyle = ['#ff8a2a', '#3ea0ff', '#ffffff', '#c8102e', '#5be37d'][(r * 2 + i) % 5]; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); c.fillStyle = '#c89a74'; c.beginPath(); c.arc(x, y - 12, 8, 0, 7); c.fill(); } } }),
    ],
    glows: [[700, 520, 230, '255,240,200'], [1100, 520, 230, '255,240,200'], [900, 760, 260, '255,240,200']],
    exits: [{ x: 840, y: 1200, w: 120, h: 50, to: 'fareej', at: [1180, 760], label: 'الفريج ⬇' }] };
  // القاعدة السرية — steel floor, crates, the control room and the cells
  WMAPS.base = { name: 'القاعدة السرية', icon: '🏭', lock: 1, W: 2400, H: 1150, spawn: [190, 900], wall: 160, ambient: 'rgba(10,20,40,0.22)',
    floor(c, M) { c.fillStyle = '#3a3f48'; c.fillRect(0, 0, M.W, M.H); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2;
      for (let y = 160; y < M.H; y += 80) for (let x = 0; x < M.W; x += 120) { c.strokeRect(x, y, 120, 80); c.fillStyle = 'rgba(255,255,255,0.12)'; for (const [dx, dy] of [[8, 8], [112, 8], [8, 72], [112, 72]]) { c.beginPath(); c.arc(x + dx, y + dy, 2.5, 0, 7); c.fill(); } }
      c.fillStyle = '#23272e'; c.fillRect(0, 0, M.W, 160); c.fillStyle = '#555b66'; for (let x = 0; x < M.W; x += 300) { c.fillRect(x + 40, 30, 220, 14); c.fillRect(x + 40, 70, 220, 10); }
      c.fillStyle = '#ffd34d'; c.fillRect(0, 140, M.W, 20); c.fillStyle = '#111'; for (let x = 0; x < M.W; x += 40) { c.beginPath(); c.moveTo(x, 160); c.lineTo(x + 20, 140); c.lineTo(x + 34, 140); c.lineTo(x + 14, 160); c.closePath(); c.fill(); }
      c.fillStyle = '#ffd34d'; for (let y = 760; y < 1060; y += 40) { c.fillRect(70, y, 26, 22); } c.fillStyle = '#2a2e36'; c.fillRect(1700, 160, 700, 300); c.fillStyle = '#1a1d22'; for (let x = 1720; x < 2380; x += 150) c.fillRect(x, 180, 130, 260);
      c.fillStyle = '#c8102e'; c.font = '900 30px ' + FA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl'; c.fillText('⚠ ممنوع الدخول', 1100, 100); c.fillText('الزنازين 🔒', 2050, 100); c.direction = 'ltr'; },
    objs: [
      wCrate(380, 260), wCrate(500, 320, 0.8), wCrate(420, 1010, 0.9), wCrate(1500, 980), wCrate(1630, 1020, 0.7),
      wBox(700, 560, 420, 50, 130, '#555b66', { topCol: '#6a707c' }), wBox(1280, 560, 280, 50, 130, '#555b66', { topCol: '#6a707c' }),
      wBox(1120, 190, 420, 70, 74, '#2a3040', { deco(c, o) { const fy = frontY(o); for (let i = 0; i < 4; i++) { const on = (G.frame / 20 + i) % 4 < 3; c.fillStyle = on ? '#36e8ff' : '#14606e'; c.fillRect(o.x + 16 + i * 102, fy + 10, 84, 40); c.fillStyle = 'rgba(255,255,255,0.3)'; for (let l = 0; l < 3; l++) c.fillRect(o.x + 22 + i * 102, fy + 16 + l * 11, 30 + ((i * 17 + l * 9) % 40), 4); } c.fillStyle = '#ff3a2a'; for (let i = 0; i < 8; i++) if ((G.frame / 8 + i) % 5 < 2) { c.beginPath(); c.arc(o.x + 30 + i * 50, o.y - o.h + 20, 4, 0, 7); c.fill(); } } }),
      wBox(800, 880, 260, 60, 84, '#c8ccd2', { deco(c, o) { const fy = frontY(o); c.fillStyle = '#2a2a2e'; for (let i = 0; i < 3; i++) c.fillRect(o.x + 20 + i * 80, fy + 14, 60, 50); c.fillStyle = '#7a7f88'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(o.x + 50 + i * 80, o.y - o.h + 26, 26, 12, 0, 0, 7); c.fill(); } } }),
      { x: 1700, y: 440, w: 700, d: 24, sy: 464, solid: true, draw(c) { c.fillStyle = '#6a707c'; c.fillRect(1700, 440, 700, 24); c.fillStyle = '#9aa0aa'; for (let x = 1706; x < 2400; x += 22) c.fillRect(x, 190, 8, 262); c.fillStyle = '#6a707c'; c.fillRect(1700, 186, 700, 14); c.fillStyle = '#4a4f5a'; for (let x = 1840; x < 2400; x += 150) c.fillRect(x, 186, 12, 278); } },
    ],
    exits: [{ x: 0, y: 800, w: 60, h: 220, to: 'fareej', at: [1180, 760], label: '⬅ الفريج' }] };
  // قلعة ملالي — black stone, purple fire, the throne of darkness and the dungeon
  WMAPS.qalaa = { name: 'قلعة ملالي', icon: '🏯', lock: 1, W: 2000, H: 1500, spawn: [1000, 1370], wall: 180, ambient: 'rgba(20,0,40,0.3)',
    floor(c, M) { c.fillStyle = '#1c1424'; c.fillRect(0, 0, M.W, M.H);
      for (let y = 180; y < M.H; y += 70) for (let x = ((y / 70) % 2) * 45; x < M.W; x += 90) { c.fillStyle = (x * 3 + y) % 7 < 3 ? '#221a2c' : '#18111f'; c.fillRect(x + 2, y + 2, 86, 66); }
      c.save(); c.strokeStyle = 'rgba(190,80,255,0.55)'; c.shadowColor = '#b030ff'; c.shadowBlur = 10; c.lineWidth = 2.5; for (let i = 0; i < 26; i++) { let x = (i * 397) % M.W, y = 200 + (i * 613) % (M.H - 220); c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += ((i * 31 + k * 17) % 60) - 30; y += 22 + ((i + k) % 3) * 10; c.lineTo(x, y); } c.stroke(); } c.restore();
      c.fillStyle = '#0a0610'; c.fillRect(0, 0, M.W, 180); c.fillStyle = '#2a1238'; c.fillRect(0, 160, M.W, 20);
      for (let x = 100; x < M.W - 80; x += 300) { if (Math.abs(x + 50 - 1000) < 220) continue; c.fillStyle = '#05030a'; c.beginPath(); c.moveTo(x, 150); c.lineTo(x, 60); c.arc(x + 50, 60, 50, Math.PI, 0); c.lineTo(x + 100, 150); c.fill(); const g = c.createLinearGradient(0, 20, 0, 150); g.addColorStop(0, '#6a1ab0'); g.addColorStop(1, '#1a0630'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 12, 146); c.lineTo(x + 12, 62); c.arc(x + 50, 62, 38, Math.PI, 0); c.lineTo(x + 88, 146); c.fill(); }
      c.save(); c.translate(1000, 80); c.fillStyle = '#1a0630'; c.beginPath(); c.ellipse(0, 0, 110, 56, 0, 0, 7); c.fill(); c.strokeStyle = '#b030ff'; c.lineWidth = 6; c.shadowColor = '#b030ff'; c.shadowBlur = 20; c.beginPath(); c.moveTo(-100, 0); c.quadraticCurveTo(0, -60, 100, 0); c.quadraticCurveTo(0, 60, -100, 0); c.stroke(); c.fillStyle = '#d070ff'; c.beginPath(); c.arc(0, 0, 24, 0, 7); c.fill(); c.fillStyle = '#05030a'; c.beginPath(); c.ellipse(0, 0, 8, 20, 0, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#3a0a5a'; c.fillRect(920, 300, 160, M.H - 300); c.fillStyle = '#c8a040'; c.fillRect(914, 300, 6, M.H - 300); c.fillRect(1080, 300, 6, M.H - 300);
      c.fillStyle = '#120a1a'; c.fillRect(60, 180, 520, 300); c.fillStyle = '#0a0610'; for (let x = 80; x < 560; x += 160) c.fillRect(x, 200, 140, 260);
      c.save(); c.translate(1600, 950); c.strokeStyle = 'rgba(190,80,255,0.6)'; c.lineWidth = 4; c.shadowColor = '#b030ff'; c.shadowBlur = 14; for (const r of [230, 190]) { c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); } for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 230, Math.sin(a) * 230); c.lineTo(Math.cos(a + 2.09) * 230, Math.sin(a + 2.09) * 230); c.stroke(); } c.restore(); },
    objs: [
      { x: 915, y: 200, w: 170, d: 70, sy: 270, solid: true, draw(c) { c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(925, 260, 170, 16);
        c.fillStyle = '#100818'; c.beginPath(); c.moveTo(920, 250); c.lineTo(920, 70); c.lineTo(950, 110); c.lineTo(975, 20); c.lineTo(1000, 90); c.lineTo(1025, 20); c.lineTo(1050, 110); c.lineTo(1080, 70); c.lineTo(1080, 250); c.closePath(); c.fill();
        c.save(); c.globalCompositeOperation = 'lighter'; const p = 0.6 + 0.4 * Math.sin(G.frame * 0.08); c.fillStyle = `rgba(190,80,255,${0.5 * p})`; for (const [x, y] of [[975, 30], [1025, 30], [1000, 96]]) { c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); } c.restore();
        c.fillStyle = '#2a1238'; c.fillRect(910, 160, 180, 96); c.fillStyle = '#4a1a6a'; c.fillRect(930, 170, 140, 44); } },
      wPillar(640, 430, '#2a2234', '#4a1a6a'), wPillar(1360, 430, '#2a2234', '#4a1a6a'), wPillar(640, 760, '#2a2234', '#4a1a6a'), wPillar(1360, 760, '#2a2234', '#4a1a6a'), wPillar(640, 1090, '#2a2234', '#4a1a6a'), wPillar(1360, 1090, '#2a2234', '#4a1a6a'),
      wBrazier(820, 560), wBrazier(1180, 560), wBrazier(820, 900), wBrazier(1180, 900), wBrazier(820, 1240), wBrazier(1180, 1240),
      { x: 60, y: 480, w: 520, d: 24, sy: 504, solid: true, draw(c) { c.fillStyle = '#3a3044'; c.fillRect(60, 480, 520, 24); c.fillStyle = '#6a6074'; for (let x = 66; x < 580; x += 22) c.fillRect(x, 200, 8, 292); c.fillStyle = '#3a3044'; c.fillRect(60, 194, 520, 14); for (let x = 220; x < 580; x += 160) c.fillRect(x, 194, 12, 310); } },
    ],
    exits: [{ x: 940, y: 1450, w: 120, h: 50, to: 'fareej', at: [1180, 760], label: 'الفريج ⬇' }] };
  for (const id of ['qasr', 'halba', 'base', 'qalaa']) WMAPS[id].glows = (WMAPS[id].glows || []).concat(WMAPS[id].objs.filter(o => o.glow).map(o => o.glow));
}
// where each of the gang hangs out
const W_HOME = [
  [0, 'diwan', 700, 300, 'down', 'الديوانية ديوانيتي… حياك.'], [1, 'shop', 640, 380, 'up', 'جيت أشتري بروتين… وحلاو.'], [2, 'pitch', 760, 700, 'right', 'يلا مباراة؟ الفريق ناقص واحد.'],
  [3, 'diwan', 1000, 520, 'left', 'ضغطك عالي… من الحماس.'], [4, 'pitch', 330, 700, 'right', 'محد يسجل عليّ!'], [5, 'pitch', 1200, 540, 'left', 'تبي نتمرن شوي؟'],
  [6, 'diwan', 420, 540, 'right', 'اقعد اقعد… القهوة جاهزة.'], [7, 'fareej', 1700, 1120, 'left', 'الجو حلو اليوم.'], [8, 'fareej', 1880, 1100, 'up', 'شفت دياياتي؟'],
  [9, 'shop', 1010, 548, 'down', 'الحساب عندي اليوم!', 'cashier'], [10, 'beach', 900, 1080, 'down', 'البحر يرد الروح.'], [11, 'fareej', 840, 960, 'down', 'عندي امتحان بكرة…'],
  [12, 'fareej', 860, 1200, 'left', 'كرك واحد لو سمحت!'], [13, 'diwan', 720, 640, 'up', 'التحدي القادم لي!'], [14, 'fareej', 1500, 1060, 'left', 'شفت سيارتي؟ نظيفة صح؟'],
  [15, 'beach', 1640, 520, 'down', 'البحر بحري… تبي تجرب؟'],
  [18, 'rest', 650, 222, 'down', 'هلا والله! جوعان؟ عندي أحلى كبسة.', 'cook'],
];
// ---- state
function worldSave() { const W = G.world; if (!W || W.phase !== 'walk') return; try { localStorage.setItem('shilla_world', JSON.stringify({ ci: W.P.base, o: W.P.o, map: W.map, x: Math.round(W.P.x), y: Math.round(W.P.y), min: W.min | 0, en: Math.round(W.en), th: Math.round(W.th), fr: W.fridge | 0, jd: W.jaddDay, ev: W.ev, evn: W.evNote, sq: W.sq })); } catch (e) { } }
function worldLoad() { try { return JSON.parse(localStorage.getItem('shilla_world')) || null; } catch (e) { return null; } }
function worldOpen() { wMaps(); const sv = worldLoad(); G.world = { phase: 'pick', cur: sv ? sv.ci : 0, o: sv ? sv.o | 0 : 0, sv, t: 0, min: sv ? sv.min : 16 * 60, floors: {} }; G.scene = 'world'; G.t = 0; SFX.ok(); }
function worldStart(ci, o) {
  const W = G.world, sv = W.sv, eff = (() => { const O = outfitOf(ci, o); return O && O.as !== undefined ? O.as : ci; })();
  const map = sv && sv.ci === ci && WMAPS[sv.map] ? sv.map : 'fareej', M = WMAPS[map];
  W.P = { fig: wMakeFig(eff, wEqFor(ci, eff)), face: 1, base: ci, o, ci: eff, x: map === (sv && sv.map) && sv.ci === ci ? sv.x : M.spawn[0], y: map === (sv && sv.map) && sv.ci === ci ? sv.y : M.spawn[1], dir: 'down', ph: 0, moving: false };
  W.en = sv && Number.isFinite(sv.en) ? sv.en : 100; W.th = sv && Number.isFinite(sv.th) ? sv.th : 100; W.fridge = sv ? sv.fr | 0 : 0; W.jaddDay = sv ? sv.jd : -1; W.ev = sv && sv.ev || null; W.evNote = sv && sv.evn !== undefined ? sv.evn : -1;
  W.npcs = W_HOME.filter(h => h[0] !== ci && h[0] !== eff).map(([nci, mp, x, y, dir, line, role]) => ({ ci: nci, map: mp, x, y, hx: x, hy: y, dir, d0: dir, line, role, ph: Math.random() * 6, wait: 60 + Math.random() * 200, tx: null, ty: null, fig: wMakeFig(nci, null), face: dir === 'left' ? -1 : 1 }));
  W.phase = 'walk'; W.map = map; W.cam = null; W.fade = 30; W.dlg = null; W.mapOpen = false; W.msg = { t: 'أهلاً في ' + M.name + ' 👋', k: 0 }; citSpawn(W); sqInit(W, sv && sv.sq); worldSave(); sagaBegin(W);
}
function worldGo(to, at) { const W = G.world; W.go = { to, at, k: 0 }; SFX.whoosh(0); }
function wSolids(W) { const M = WMAPS[W.map], L = []; for (const o of M.objs) if (o.solid) L.push([o.x, o.y, o.w, o.d]); for (const b of (M.block || [])) L.push(b); if (M.wall) L.push([0, 0, M.W, M.wall]); return L; }
function wFree(W, x, y, r, skip) {
  const M = WMAPS[W.map]; if (x < r || y < r || x > M.W - r || y > M.H - r) return false;
  for (const [bx, by, bw, bd] of W.solid) if (x > bx - r && x < bx + bw + r && y > by - r * 0.6 && y < by + bd + r * 0.6) return false;
  for (const n of W.npcs) if (n !== skip && n.map === W.map) { const d = Math.hypot(n.x - x, n.y - y); if (d < r * 2 && !(skip && d > Math.hypot(n.x - skip.x, n.y - skip.y) + 0.01)) return false; }
  if (skip !== W.P && Math.hypot(W.P.x - x, W.P.y - y) < r * 2) return false;
  return true;
}
function wDirOf(vx, vy, d) { if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) return d; return Math.abs(vx) > Math.abs(vy) * 1.1 ? (vx > 0 ? 'right' : 'left') : (vy > 0 ? 'down' : 'up'); }
function wNearNpc(W) { let best = null, bd = WD.NEAR; for (const n of W.npcs) if (n.map === W.map) { const d = Math.hypot(n.x - W.P.x, n.y - W.P.y); if (d < bd) { bd = d; best = n; } } return best; }
function wNearRack(W) { const M = WMAPS[W.map]; for (const o of M.objs) if (o.wardrobe && W.P.x > o.x - 40 && W.P.x < o.x + o.w + 40 && W.P.y > o.y - 20 && W.P.y < o.y + o.d + 110) return o; return null; }
const W_FOOD = {
  rest: ['مطعم الشلة 🍔', [['🌯', 'شاورما', 10, 30, 0], ['🍔', 'برجر', 20, 50, 0], ['🍛', 'كبسة لحم', 35, 100, 0], ['🧃', 'عصير برتقال', 5, 10, 50], ['🥤', 'لبن بارد', 4, 8, 45]]],
  snack: ['بقالة الشلة 🛒', [['🥔', 'شيبس', 6, 15, 0], ['🍫', 'شوكولاتة', 8, 20, 0], ['⚡', 'مشروب طاقة', 15, 40, 30], ['💧', 'ماي', 2, 5, 60]]],
  karak: ['كشك الكرك ☕', [['☕', 'شاي كرك', 4, 15, 50], ['🍵', 'شاي حليب', 3, 10, 45], ['🥟', 'سمبوسة', 6, 20, 0], ['🫓', 'خبز رقاق', 5, 15, 0]]],
  ice: ['آيس كريم الكورنيش 🍦', [['🍦', 'آيس كريم فانيلا', 5, 10, 25], ['🍫', 'آيس كريم شوكولاتة', 6, 12, 25], ['🍓', 'آيس كريم فراولة', 6, 12, 25], ['🍧', 'مصاص ثلج', 3, 5, 40]]],
};
const W_ACT = { ice: 'آيس كريم 🍦', rack: 'الملابس 👕', bed: 'نام 🛏️', fridge: 'الثلاجة 🧊', food: 'المنيو 🍔', snack: 'المتجر 🛒', karak: 'كرك ☕', jadd: 'كلّم الجد 👴', sufra: 'سفرة الجد 🍛' };
const wHour = W => (W.min % 1440) / 60, wDay = W => Math.floor(W.min / 1440);
function wNearAct(W) { const M = WMAPS[W.map]; let best = null, bd = 64;
  for (const o of M.objs.concat(M.decals || [])) if (o.act) { const dx = Math.max(o.x - W.P.x, 0, W.P.x - (o.x + o.w)), dy = Math.max(o.y - W.P.y, 0, W.P.y - (o.y + o.d)), d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = o; } } if (best) best.d0 = bd; return best; }
function wEat(name, en, price) { const W = G.world, P0 = profCur();
  if (price > P0.coins) { W.msg = { t: 'فلوسك ما تكفي 🪙', k: 0, c: '#ff8080' }; SFX.move(); return false; }
  P0.coins -= price; profSave(); const before = W.en; W.en = Math.min(100, W.en + en); W.lowWarned = W.en < 20;
  W.msg = { t: `😋 ${name}  +${Math.round(W.en - before)} ⚡` + (price ? `  (−${price} 🪙)` : ''), k: 0, c: '#7dffb0' }; SFX.ready(); worldSave(); return true; }
function wMenu(key) { const [title, items] = W_FOOD[key], W = G.world; W.dlg = null; W.menu = { title, items, sel: 0, k: 0, free: (key === 'ice' || key === 'karak') && wEvFree(W, key), ev: key === 'ice' ? 'ice' : key === 'karak' ? 'karak' : null }; SFX.ok(); }
function wSleep(mode) { const W = G.world, hr = wHour(W), faint = mode === true; W.dlg = null; W.sleep = { k: 0, night: faint || mode === 'morning' || hr >= 18 || hr < 5, faint }; SFX.move(); }
function wDlg(o) { const W = G.world; W.dlg = Object.assign({ i: 0, k: 0, opt: 0 }, o); SFX.move(); }
function wJaddTalk() { const W = G.world, day = wDay(W), lunch = W.jaddDay !== day; wEvDone(W, 'eid');
  wDlg({ name: 'الجد', jadd: 1, lines: ['يا هلا ومرحبا بولدي! نوّرت البيت.', lunch ? 'اقعد تغدّى معي… الأكل حار وجاهز 🍛' : 'تغدّينا اليوم الحمد لله… تعال بكرة نتغدّى سوا.'],
    opts: lunch ? [['🍛 تغدّى مع الجد', () => { W.dlg = null; W.jaddDay = day; W.P.eat = null; wConsume(['🍛', 'غدا الجد', 0, 100, 60], 0); profAward(PROF.cur, 20); W.msg = { t: '🍛 بالعافية! والجد عطاك 20 🪙', k: 0, c: '#ffd34d' }; worldSave(); }], ['👋 مع السلامة', 'bye']] : [['🛏️ ارتاح هني', () => wSleep(false)], ['👋 مع السلامة', 'bye']] }); }
function wAct(o) { const W = G.world;
  switch (o.act) {
    case 'rack': worldSave(); shopOpen('world'); return;
    case 'bed': { const hr = wHour(W), night = hr >= 18 || hr < 5; wDlg({ name: 'السرير', icon: '🛏️', lines: [night ? 'الوقت متأخر… تنام للصبح؟' : 'تبي تنام؟ (نوم لين بكرة الصبح يقدّم اليوم 📅)'], opts: night ? [['😴 نام للصبح', () => wSleep(false)], ['👋 لا', 'bye']] : [['😴 لين بكرة', () => wSleep('morning')], ['💤 قيلولة', () => wSleep(false)], ['👋 لا', 'bye']] }); return; }
    case 'fridge': if ((W.fridge | 0) < 3) { if (wConsume(['🍲', 'أكل البيت وماي بارد', 0, 25, 35], 0)) W.fridge = (W.fridge | 0) + 1; } else { W.msg = { t: 'الثلاجة فاضية 😅 روح المطعم أو البقالة', k: 0, c: '#ffb070' }; SFX.move(); } return;
    case 'ice': wMenu('ice'); return; case 'food': wMenu('rest'); return; case 'snack': wMenu('snack'); return; case 'karak': wMenu('karak'); return;
    case 'jadd': case 'sufra': wJaddTalk(); return;
  } }
function wTalk(n) {
  if (n.cit) { citTalk(G.world, n); return; }
  if (n.sg) { sagaTalk(G.world, n); return; }
  if (sqTalkGang(G.world, n)) return;
  const W = G.world, C = CHARS[n.ci], Pz = PERSONA[n.ci] || {}, intro = (Pz.intro && Pz.intro[0]) || C.quote || '…';
  const boss = n.ci >= NCH, extra = n.role === 'cook' ? [['🍔 المنيو', () => wMenu('rest')]] : n.role === 'cashier' ? [['🛒 المتجر', () => wMenu('snack')]] : [];
  W.dlg = { n, lines: [n.line, intro], i: 0, k: 0, opt: 0, opts: extra.concat([['🥊 تحدّاه', 'fight'], ['👋 مع السلامة', 'bye']]), boss };
  n.dir = wDirOf(W.P.x - n.x, W.P.y - n.y, n.dir); n.face = W.P.x >= n.x ? 1 : -1; W.P.face = n.x >= W.P.x ? 1 : -1; SFX.move();
}
function wChallenge(n) {
  const W = G.world; if (W.en < 15) { W.dlg = null; W.msg = { t: 'تعبان ⚡ كل شي أو نام قبل القتال', k: 0, c: '#ff9a9a' }; SFX.move(); return; } worldSave(); W.fightWith = n; W.dlg = null;
  G.mode = 'cpu'; G.sel = { cur: [W.P.base, n.ci], done: [true, true], t: 0, readyT: 0, outfit: [W.P.o, 0] }; SFX.ok(); G.toVS();
}
function worldResult(w) {
  const W = G.world, n = W.fightWith; W.fightWith = null; G.scene = 'world'; G.fight = null; if (AC) Music.intensity = 0;
  const win = w === 0, prize = win ? (n && n.ci >= NCH ? 100 : 30) : 5; if (win) { wEvToday(W); W.ev.wins++; } sqFight(W, n, win); profAward(PROF.cur, prize); W.en = Math.max(0, W.en - 15);
  W.msg = { t: win ? `فزت على ${CHARS[n.ci].name}! +${prize} 🪙` : `${CHARS[n.ci].name} فاز… خذ ${prize} 🪙 وحاول مرة ثانية`, k: 0, c: win ? '#ffd34d' : '#ff9a9a' };
  if (n) { const Pz = PERSONA[n.ci] || {}; W.dlg = { n, lines: [win ? 'ضربة معلم… المرة الجاية لي!' : ((Pz.win && Pz.win[0]) || 'قلت لك!')], i: 0, k: 0, opt: 0, opts: [['🥊 مرة ثانية', 'fight'], ['👋 مع السلامة', 'bye']] }; }
  W.fade = 20; SFX.ok();
}
// ---- update
function updWorld() {
  const W = G.world; if (!W) { G.toTitle(); return; } W.t++; G.t++; if (W.msg) W.msg.k++;
  const p = pads[0].p, h = pads[0].h, q = pads[1].p, tap = cupTap(), ok = p.ok || q.ok, esc = anyP('Escape', 'Backspace'), back = esc || ((p.back || q.back) && !anyP('KeyT', 'KeyO'));
  if (W.phase === 'pick') return updWorldPick(W, p, q, ok, back, tap);
  if (W.fade > 0) W.fade--;
  if (W.go) { W.go.k++; if (W.go.k === 14) { W.map = W.go.to; W.puffs = []; W.P.x = W.go.at[0]; W.P.y = W.go.at[1]; W.cam = null; W.msg = { t: WMAPS[W.map].name, k: 0 }; worldSave(); } if (W.go.k >= 28) W.go = null; return; }
  if (W.toast) W.toast.k++;
  if (W.saga && sagaUpd(W, p, q, ok, back, tap)) return;
  if (W.cal) { calUpd(W, p, q, ok, back, tap); return; }
  // sleeping: the screen goes dark, the night passes, you wake up in the morning
  if (W.sleep) { const S = W.sleep; S.k++;
    if (S.k === 45) { const hr = wHour(W), day = wDay(W);
      if (S.night) { W.min = ((hr < 7 ? day : day + 1) * 1440) + 7 * 60; W.en = S.faint ? 60 : 100; W.fridge = 0; if (S.faint) { W.map = 'home'; W.P.x = 200; W.P.y = 360; W.cam = null; } }
      else { W.min += 120; W.en = Math.min(100, W.en + 40); } W.lowWarned = false; worldSave(); }
    if (S.k >= 100) { W.sleep = null; W.msg = S.faint ? { t: '😵 تعبت ونمت برّا… صحيت في بيتك', k: 0, c: '#ffb070' } : S.night ? { t: '☀️ صباح الخير! طاقتك مليانة ⚡', k: 0, c: '#ffd34d' } : { t: '😌 ارتحت شوي  +40 ⚡', k: 0, c: '#7dffb0' }; }
    return; }
  W.min += (G.frame % 60 === 0 ? 1 : 0);
  { const hr = wHour(W), day = wDay(W);
    if (hr >= 21 && W.nightMsg !== day) { W.nightMsg = day; W.msg = { t: '🌙 الليل جا… روح بيتك أو بيت الجد ونام 🛏️', k: 0, c: '#9fd8ff' }; }
    if (hr >= 3 && hr < 5 && !W.dlg && !W.menu) { wSleep(true); return; } }
  if (G.frame % 300 === 0) worldSave();
  W.solid = wSolids(W);
  const hud = wHud();
  // map overlay
  if (W.mapOpen) { const L = wMapList(); if (p.left || q.left || p.up || q.up) { W.mapSel = (W.mapSel + L.length - 1) % L.length; SFX.move(); } if (p.right || q.right || p.down || q.down) { W.mapSel = (W.mapSel + 1) % L.length; SFX.move(); }
    if (tap) { let hit = -1; L.forEach((id, i) => { const [x, y] = W_MAPPOS[id]; if (Math.abs(tap[0] - x) < 108 && Math.abs(tap[1] - y) < 54) hit = i; }); if (hit >= 0) { if (W.mapSel === hit) { W.mapOpen = false; if (L[hit] !== W.map) worldGo(L[hit], WMAPS[L[hit]].spawn); } else { W.mapSel = hit; SFX.move(); } } else W.mapOpen = false; return; }
    if (ok) { W.mapOpen = false; const id = L[W.mapSel]; if (id !== W.map) worldGo(id, WMAPS[id].spawn); } if (back || anyP('Tab') || p.b2) { W.mapOpen = false; SFX.move(); } return; }
  // food menu
  if (W.menu) { const Mn = W.menu, n = Mn.items.length, y0 = VH / 2 - n * 35 - 10; Mn.k++;
    if (p.up || q.up) { Mn.sel = (Mn.sel + n - 1) % n; SFX.move(); } if (p.down || q.down) { Mn.sel = (Mn.sel + 1) % n; SFX.move(); }
    const buy = i => { Mn.sel = i; Mn.flash = { i, k: 0 }; if (wConsume(Mn.items[i], Mn.items[i][2], Mn.free) && Mn.ev) wEvDone(W, Mn.ev); };
    if (Mn.flash) Mn.flash.k++;
    if (tap) { if (Math.abs(tap[0] - VW / 2) < 330 && tap[1] > y0 && tap[1] < y0 + n * 70) buy(Math.floor((tap[1] - y0) / 70)); else if (Math.abs(tap[0] - VW / 2) > 340 || tap[1] < y0 - 90 || tap[1] > y0 + n * 70 + 80) { W.menu = null; SFX.move(); } return; }
    if (ok && Mn.k > 6) buy(Mn.sel); if (back) { W.menu = null; SFX.move(); } return; }
  // dialogue
  if (!W.dlg && VOX.dlgOn) { VOX.dlgOn = false; voiceStop(); }
  if (W.dlg) { const D = W.dlg; if (D.spk !== D.i) { D.spk = D.i; dlgSpeak(W, D); } D.k++; const last = D.i >= D.lines.length - 1, no = D.opts.length, ox = i => no === 2 ? [VW / 2 + 160, VW / 2 - 160][i] : VW / 2 + 300 - i * 300;
    const choose = i => { const a = D.opts[i][1]; if (typeof a === 'function') a(); else if (a === 'fight') wChallenge(D.n); else { W.dlg = null; SFX.move(); } };
    if (last && (p.left || q.left)) { D.opt = (D.opt + 1) % no; SFX.move(); } if (last && (p.right || q.right)) { D.opt = (D.opt + no - 1) % no; SFX.move(); }
    if (tap) { if (!last) { D.i++; D.k = 0; SFX.move(); } else if (D.k > 8 && tap[1] > 625) { for (let i = 0; i < no; i++) if (Math.abs(tap[0] - ox(i)) < 145) { choose(i); break; } } return; }
    if (ok && D.k > 6) { if (!last) { D.i++; D.k = 0; SFX.move(); } else choose(D.opt); }
    if (back) { W.dlg = null; SFX.move(); } return; }
  // HUD buttons
  if (tap && hud.hit(tap)) return;
  if (esc) { worldSave(); G.world = null; G.toTitle(); return; }
  if (anyP('Tab') || p.b2) { wOpenMap(W); return; }
  if (anyP('KeyC') || p.c13 || q.c13 || gpTP()) { calOpen(W); return; }
  // talk / use things
  let near = wNearNpc(W), rack = wNearAct(W); if (near && rack && rack.d0 < 24 && Math.hypot(near.x - W.P.x, near.y - W.P.y) > 60) near = null; if (near) rack = null;
  if (ok || (tap && near && W.cam && Math.hypot(tap[0] - (near.x - W.cam.x), tap[1] - (near.y - 95 - W.cam.y)) < 100) || (tap && W.prompt && Math.abs(tap[0] - W.prompt[0]) < 120 && Math.abs(tap[1] - W.prompt[1]) < 40)) {
    if (near) { wTalk(near); return; } if (rack) { wAct(rack); return; } }
  // walk
  let vx = (h.right ? 1 : 0) - (h.left ? 1 : 0), vy = (h.down ? 1 : 0) - (h.up ? 1 : 0);
  if (TOUCH_ON && STK.id !== null) { const m = Math.hypot(STK.dx, STK.dy) / STK.R; if (m > 0.18) { vx = STK.dx / STK.R; vy = STK.dy / STK.R; } }
  if (W.P.eat) { vx = 0; vy = 0; }
  const m = Math.hypot(vx, vy); const P = W.P;
  W.en = Math.max(0, W.en - (m > 0.1 ? 0.0045 : 0.0008)); if (W.en < 20 && !W.lowWarned) { W.lowWarned = true; W.msg = { t: '⚡ طاقتك قليلة… روح كُل شي 🍔', k: 0, c: '#ffb070' }; }
  W.th = Math.max(0, W.th - (m > 0.1 ? 0.0055 : 0.0011)); if (W.th < 20 && !W.thWarned) { W.thWarned = true; W.msg = { t: '💧 عطشان… اشرب ماي أو كرك ☕', k: 0, c: '#7ad8ff' }; }
  if (m > 0.1) { const s = WD.SPD * (W.en <= 0 ? 0.45 : W.en < 20 ? 0.65 : 1) * (W.th <= 0 ? 0.6 : W.th < 15 ? 0.8 : 1) * Math.min(1, m) / Math.max(1, m); const nx = P.x + vx * s, ny = P.y + vy * s;
    if (wFree(W, nx, P.y, WD.R, P)) P.x = nx; if (wFree(W, P.x, ny, WD.R, P)) P.y = ny; P.dir = wDirOf(vx, vy, P.dir); if (Math.abs(vx) > 0.15) P.face = vx > 0 ? 1 : -1; P.moving = true; P.ph += 0.2 * Math.min(1, m); }
  else { P.moving = false; P.ph += 0.05; }
  citTick(W); wEatTick(W); wEvTick(W); sqTick(W);
  if (W.saga && sagaWalk(W)) return;
  for (const e of WMAPS[W.map].exits) if (P.x > e.x && P.x < e.x + e.w && P.y > e.y && P.y < e.y + e.h) { worldGo(e.to, e.at); break; }
  // the gang: idle, look at you, stroll a little
  for (const n of W.npcs) { if (n.map !== W.map) continue; const d = Math.hypot(n.x - P.x, n.y - P.y);
    if (d < WD.NEAR + 40) { n.dir = wDirOf(P.x - n.x, P.y - n.y, n.dir); if (Math.abs(P.x - n.x) > 8) n.face = P.x > n.x ? 1 : -1; n.moving = false; n.ph += 0.05; continue; }
    if (n.tx === null) { n.ph += 0.05; n.moving = false; if (--n.wait <= 0) { const a = Math.random() * 6.28, r = 40 + Math.random() * 90; n.tx = n.hx + Math.cos(a) * r; n.ty = n.hy + Math.sin(a) * r * 0.6; } }
    else { const dx = n.tx - n.x, dy = n.ty - n.y, dd = Math.hypot(dx, dy); if (dd < 4) { n.tx = null; n.wait = 120 + Math.random() * 260; n.dir = n.d0; continue; }
      const s = 1.6, nx = n.x + dx / dd * s, ny = n.y + dy / dd * s; if (wFree(W, nx, ny, WD.R, n)) { n.x = nx; n.y = ny; n.dir = wDirOf(dx, dy, n.dir); if (Math.abs(dx) > 1) n.face = dx > 0 ? 1 : -1; n.moving = true; n.ph += 0.14; } else { n.tx = null; n.wait = 90; } } }
  wAnimFig(P); for (const n of W.npcs) if (n.map === W.map) wAnimFig(n);
  // camera
  const M = WMAPS[W.map], tx = clamp(P.x - VW / 2, 0, Math.max(0, M.W - VW)) - Math.max(0, (VW - M.W) / 2), ty = clamp(P.y - 70 - VH / 2, -200, Math.max(0, M.H - VH)) - Math.max(0, (VH - M.H) / 2);
  if (!W.cam) W.cam = { x: tx, y: ty }; W.cam.x = lerp(W.cam.x, tx, 0.14); W.cam.y = lerp(W.cam.y, ty, 0.14);
}
const W_MAPPOS = { diwan: [150, 200], shop: [395, 200], home: [640, 200], rest: [885, 200], jadd: [1130, 200], pitch: [150, 410], beach: [395, 410], fareej: [640, 410], halba: [885, 410], qasr: [1130, 410], base: [395, 615], qalaa: [885, 615] };
function wHud() {
  const W = G.world, btns = [[70, 52, 'خروج', 'exit'], [190, 52, 'الخريطة 🗺️', 'map'], [310, 52, 'التقويم 📅', 'cal']];
  return { btns, hit(t) { for (const [x, y, , id] of btns) if (Math.abs(t[0] - x) < 62 && Math.abs(t[1] - y) < 34) { if (id === 'exit') { worldSave(); G.world = null; SFX.move(); G.toTitle(); } else if (id === 'cal') calOpen(W); else wOpenMap(W); return true; } return false; } };
}
// ---- character pick
function updWorldPick(W, p, q, ok, back, tap) {
  const L = outfitList(W.cur), hitBtn = (x, y, w, h) => tap && Math.abs(tap[0] - x) < w / 2 && Math.abs(tap[1] - y) < h / 2;
  if (p.left || q.left) { W.cur = (W.cur + NCH - 1) % NCH; W.o = 0; SFX.move(); }
  if (p.right || q.right) { W.cur = (W.cur + 1) % NCH; W.o = 0; SFX.move(); }
  if (p.up || q.up || p.down || q.down) { W.cur = (W.cur + CUP_GRID.per) % (CUP_GRID.per * 2); if (W.cur >= NCH) W.cur = NCH - 1; W.o = 0; SFX.move(); }
  if ((p.sp || q.sp || hitBtn(VW / 2, 392, 260, 44)) && L.length > 1) { W.o = (W.o + 1) % L.length; SFX.move(); }
  { const sv = sgLoad(W.cur); if (sv && sv.done && hitBtn(VW / 2 - 40, 332, 300, 44)) { sagaRestart(W.cur); W.sgA = null; SFX.ok(); return; } }
  let go = false; if (tap) for (let i = 0; i < NCH; i++) { const [x, y] = cupGridPos(i); if (Math.abs(tap[0] - x) < 44 && Math.abs(tap[1] - y) < 48) { if (W.cur === i) go = true; else { W.cur = i; W.o = 0; SFX.move(); } } }
  if ((ok && W.t > 8) || go || hitBtn(VW - 160, 660, 260, 64)) { SFX.ready(); worldStart(W.cur, W.o); return; }
  if ((back && W.t > 8) || hitBtn(110, 660, 180, 64)) { SFX.move(); G.world = null; G.toTitle(); }
}
function drawWorldPick(W) {
  drawCupBg('📜 حرب الخالين · العالم المفتوح', 'اختر شخصيتك… وبعدها تبدأ القصة');
  const L = outfitList(W.cur), O = L[W.o % L.length], ci = O && O.as !== undefined ? O.as : W.cur;
  if (!W.pf || W.pf.ci !== ci) W.pf = { ci, fig: wMakeFig(ci, wEqFor(ci, ci)), face: 1, x: VW / 2 - 250, y: 380, moving: false, ph: 0 }; wAnimFig(W.pf); drawFig(ctx, W.pf, 0.68);
  const im = IMG['front' + (ci + 1)]; if (im) { const hgt = 250, w = im.width * hgt / im.height; ctx.drawImage(im, VW / 2 + 60, 115, w, hgt); }
  txt(CHARS[ci].name, VW / 2 - 40, 200, { size: 44, weight: 900, color: '#fff', stroke: '#000', sw: 6 });
  if (W.sv && W.sv.ci === W.cur) txt('📍 بتكمل من ' + ((WMAPS[W.sv.map] || {}).name || ''), VW / 2 - 40, 250, { size: 20, weight: 800, color: '#7dffb0' });
  { const sv = sgLoad(W.cur); if (sv && sv.done) { txt('🏆 ختم القصة — تم الإتمام ✅', VW / 2 - 40, 290, { size: 20, weight: 900, color: '#ffd34d' }); ctx.fillStyle = 'rgba(176,48,255,0.85)'; rrect(VW / 2 - 190, 312, 300, 40, 20); ctx.fill(); txt('🔁 ابدأ القصة من جديد', VW / 2 - 40, 333, { size: 18, weight: 900, color: '#fff' }); }
    else { const c = sv ? clamp(sv.ch | 0, 0, SAGA.length - 1) : 0; txt((sv && (sv.ch || sv.st) ? '⏳ جاري الإتمام — الفصل ' : sv && sv.ever ? '🔁 يعيدها من جديد — الفصل ' : '🆕 القصة من الصفر — الفصل ') + SG_ORD[c] + ': ' + SAGA[c].n, VW / 2 - 40, 292, { size: 20, weight: 900, color: '#ffd34d' }); } }
  if (L.length > 1) { ctx.fillStyle = 'rgba(255,211,77,0.9)'; rrect(VW / 2 - 130, 370, 260, 44, 22); ctx.fill(); txt('👕 ' + O.name + (TOUCH_ON ? ' · المس للتغيير' : ' · E للتغيير'), VW / 2, 393, { size: 19, weight: 900, color: '#111' }); }
  for (let i = 0; i < NCH; i++) { const [x, y] = cupGridPos(i), on = i === W.cur, f = IMG['face' + (i + 1)];
    ctx.save(); rrect(x - 40, y - 40, 80, 80, 12); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill(); ctx.clip(); if (f) ctx.drawImage(f, x - 40, y - 40, 80, 80); ctx.restore();
    ctx.lineWidth = on ? 4 : 1.5; ctx.strokeStyle = on ? '#ffd34d' : 'rgba(255,255,255,0.25)'; rrect(x - 40, y - 40, 80, 80, 12); ctx.stroke();
    { const R = (W.sgA || (W.sgA = sgAll()))[i]; if (R && (R.done || R.ever || R.ch || R.st)) { const fin = R.done || (R.ever && !R.ch && !R.st), lb = fin ? '✓' : String((R.ch | 0) + 1);
      ctx.fillStyle = fin ? '#22c55e' : '#ff9f1a'; ctx.beginPath(); ctx.arc(x + 31, y - 31, 15, 0, 7); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000'; ctx.stroke(); txt(lb, x + 31, y - 30, { size: fin ? 19 : 15, weight: 900, color: '#fff', rtl: false });
      if (R.ever && !fin) { ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(x - 31, y - 31, 10, 0, 7); ctx.fill(); txt('✓', x - 31, y - 30, { size: 13, weight: 900, color: '#fff', rtl: false }); } } } }
  txt('✓ أخضر = تم الإتمام · رقم برتقالي = جاري الإتمام (رقم الفصل)', VW / 2, 652, { size: 15, weight: 800, color: 'rgba(255,255,255,0.7)' });
  ctx.fillStyle = 'rgba(230,20,40,0.92)'; rrect(VW - 290, 628, 260, 64, 16); ctx.fill(); txt('ادخل العالم ←', VW - 160, 661, { size: 26, weight: 900, color: '#fff' });
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; rrect(20, 628, 180, 64, 16); ctx.fill(); txt('رجوع', 110, 661, { size: 24, weight: 900, color: '#fff' });
}
// ---- drawing
function wFloor(W, id) { if (W.floors[id]) return W.floors[id]; const M = WMAPS[id], c = document.createElement('canvas'); c.width = M.W; c.height = M.H; M.floor(c.getContext('2d'), M); return (W.floors[id] = c); }
function drawWorld() {
  const W0 = G.world, sh = W0 && W0.phase === 'walk' && W0.shake > 0.6 ? W0.shake : 0; if (sh) { ctx.save(); ctx.translate(rnd(-sh, sh) * 0.6, rnd(-sh, sh) * 0.6); }
  drawWorld0(); if (sh) ctx.restore(); if (W0 && W0.phase === 'walk' && W0.saga) sagaDrawTop(W0);
}
function drawWorld0() {
  const W = G.world; if (!W) return;
  if (W.phase === 'pick') { drawWorldPick(W); return; }
  const M = WMAPS[W.map], cam = W.cam || { x: 0, y: 0 }, P = W.P;
  ctx.fillStyle = '#0b0c14'; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
  ctx.drawImage(wFloor(W, W.map), 0, 0);
  if (W.map === 'beach') { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const y = 80 + i * 60, o = (G.frame * (0.6 + i * 0.15)) % 240; ctx.beginPath(); for (let x = -240 + o; x < M.W; x += 240) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 10, x + 120, y); } ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; const sw = Math.sin(G.frame * 0.03) * 10; ctx.fillRect(0, 422 + sw, M.W, 6); }
  for (const d of (M.decals || [])) d.draw(ctx);
  for (const e of M.exits) { const a = 0.5 + 0.3 * Math.sin(G.frame * 0.1); ctx.fillStyle = `rgba(255,211,77,${a * 0.5})`; rrect(e.x, e.y, e.w, e.h, 10); ctx.fill(); ctx.strokeStyle = `rgba(255,211,77,${a})`; ctx.lineWidth = 3; ctx.stroke();
    txt(e.label, clamp(e.x + e.w / 2, 90, M.W - 90), e.y + e.h / 2 + (e.h > 100 ? 0 : -42), { size: 20, weight: 900, color: '#fff', stroke: '#000', sw: 4 }); }
  if (W.saga) sagaDrawGround(W);
  // sort everything by where its feet are
  const L = [];
  if (W.saga) sagaSortList(W, L);
  for (const o of M.objs) L.push([o.sy, () => o.draw(ctx)]);
  for (const n of W.npcs) if (n.map === W.map) L.push([n.y, () => drawFig(ctx, n)]);
  L.push([P.y, () => drawFig(ctx, P)]); sqSortList(W, L);
  L.sort((a, b) => a[0] - b[0]); for (const [, f] of L) f();
  if (W.puffs) { for (const q of W.puffs) { q.t++; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - q.t / 45); txt(q.s, q.x, q.y - q.t * 0.8, { size: 34, rtl: false }); ctx.restore(); } W.puffs = W.puffs.filter(q => q.t < 45); }
  if (W.saga) sagaDrawWorld(W);
  sqDrawWorld(W);
  // speech bubbles + your marker
  let near = !W.dlg && !W.menu && wNearNpc(W), rack = !W.dlg && !W.menu && wNearAct(W); if (near && rack && rack.d0 < 24 && Math.hypot(near.x - P.x, near.y - P.y) > 60) near = null; if (near) rack = null; W.prompt = null;
  for (const n of W.npcs) if (n.map === W.map && Math.hypot(n.x - P.x, n.y - P.y) < WD.NEAR + 120) { const on = n === near, bx = n.x, by = n.y - 205;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#222'; ctx.lineWidth = 2.5; rrect(bx - 30, by - 22, 60, 36, 16); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(bx - 6, by + 13); ctx.lineTo(bx, by + 24); ctx.lineTo(bx + 6, by + 13); ctx.fill();
    txt(on ? '💬' : '…', bx, by - 4, { size: on ? 20 : 26, weight: 900, color: '#222', rtl: false });
    if (on) txt(n.dname || CHARS[n.ci].name, bx, n.y + 22, { size: 20, weight: 900, color: '#ffd34d', stroke: '#000', sw: 4 }); }
  ctx.fillStyle = '#ffd34d'; ctx.beginPath(); const my = P.y - 192 + Math.sin(G.frame * 0.12) * 4; ctx.moveTo(P.x - 9, my - 12); ctx.lineTo(P.x + 9, my - 12); ctx.lineTo(P.x, my); ctx.fill();
  if (near || rack) { const px = P.x - cam.x, py = P.y - cam.y + 48; W.prompt = [px, py]; }
  // night: dim the world, light the lamps
  const hr = (W.min % (24 * 60)) / 60, night = hr >= 19 || hr < 5 ? 1 : hr >= 17 ? (hr - 17) / 2 : hr < 7 ? (7 - hr) / 2 : 0;
  ctx.restore();
  if (M.ambient || M.glows) sgAmbient(W, M, cam);
  if (night > 0 && !M.wall) { ctx.fillStyle = `rgba(10,18,60,${0.5 * night})`; ctx.fillRect(0, 0, VW, VH); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const o of M.objs) if (o.lamp) { const x = o.lamp[0] - cam.x + 26, y = o.lamp[1] - cam.y + 4, g = ctx.createRadialGradient(x, y, 4, x, y + 80, 190); g.addColorStop(0, `rgba(255,220,140,${0.55 * night})`); g.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y + 80, 180, 140, 0, 0, 7); ctx.fill(); }
    ctx.restore(); }
  if (W.prompt) { const [x, y] = W.prompt; ctx.fillStyle = 'rgba(0,0,0,0.7)'; rrect(x - 110, y - 20, 220, 40, 20); ctx.fill(); txt(near ? (TOUCH_ON ? '✕ أو المس: كلّمه' : 'Enter: كلّمه') : (TOUCH_ON ? '✕: ' : 'Enter: ') + W_ACT[rack.act], x, y + 1, { size: 18, weight: 900, color: '#ffd34d' }); }
  // HUD (hidden while a story scene plays)
  if (!(W.saga && (W.saga.say || W.saga.card || W.saga.choice || W.saga.credits))) {
  const P0 = profCur(), dd = Math.floor(W.min / (24 * 60)) % 7, hh = Math.floor(hr), mm = W.min % 60;
  ctx.fillStyle = 'rgba(10,30,70,0.82)'; rrect(VW - 300, 14, 284, 164, 16); ctx.fill(); ctx.strokeStyle = 'rgba(160,210,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  txt(wDateStr(wDay(W)) + ' · ' + M.name, VW - 158, 40, { size: 20, weight: 900, color: '#fff' });
  txt(String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), VW - 230, 82, { size: 34, font: FE, weight: 700, color: '#ffd34d', rtl: false });
  txt('🪙 ' + P0.coins, VW - 95, 82, { size: 24, weight: 900, color: '#ffd34d', rtl: false });
  { const e = clamp(W.en / 100, 0, 1), col = e > 0.5 ? '#5be37d' : e > 0.2 ? '#ffd34d' : '#ff4a4a'; txt('⚡', VW - 274, 125, { size: 20, rtl: false }); ctx.fillStyle = 'rgba(0,0,0,0.5)'; rrect(VW - 256, 115, 224, 20, 10); ctx.fill(); ctx.fillStyle = col; rrect(VW - 256, 115, Math.max(10, 224 * e), 20, 10); ctx.fill(); txt('طاقة ' + Math.round(W.en), VW - 144, 126, { size: 14, weight: 900, color: '#fff', stroke: 'rgba(0,0,0,0.8)', sw: 3 }); }
  { const e = clamp(W.th / 100, 0, 1), col = e > 0.5 ? '#4ab8ff' : e > 0.2 ? '#9ad8ff' : '#ff4a4a'; txt('💧', VW - 274, 154, { size: 18, rtl: false }); ctx.fillStyle = 'rgba(0,0,0,0.5)'; rrect(VW - 256, 144, 224, 20, 10); ctx.fill(); ctx.fillStyle = col; rrect(VW - 256, 144, Math.max(10, 224 * e), 20, 10); ctx.fill(); txt('شرب ' + Math.round(W.th), VW - 144, 155, { size: 14, weight: 900, color: '#fff', stroke: 'rgba(0,0,0,0.8)', sw: 3 }); }
  for (const [x, y, label] of wHud().btns) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; rrect(x - 58, y - 26, 116, 52, 14); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke(); txt(label, x, y + 1, { size: 19, weight: 900, color: '#fff' }); }
  { const gR = W._gR || 0, gB = W._gB || 0, slot = (tw, top, lim) => { let cx = VW / 2; if (gR && top < gB + 6 && cx - tw / 2 < gR + 14) { cx = gR + 14 + tw / 2; if (cx + tw / 2 > lim) return null; } return cx; }; let my = 146, mx = VW / 2, mw = 0;
    if (W.msg && W.msg.k < 150) { ctx.font = `900 24px ${FA}`; mw = Math.min(600, ctx.measureText(W.msg.t).width + 70); const c = slot(mw, 120, 966); if (c == null) my = gB + 40; else mx = c;
      ctx.save(); ctx.globalAlpha = Math.min(1, (150 - W.msg.k) / 25); ctx.fillStyle = 'rgba(0,0,0,0.7)'; rrect(mx - mw / 2, my - 26, mw, 50, 25); ctx.fill(); txt(W.msg.t, mx, my, { size: 24, weight: 900, color: W.msg.c || '#fff' }); ctx.restore(); }
    if (W.toast && W.toast.k < 330) { ctx.font = `900 24px ${FA}`; const tw = Math.min(VW - 120, ctx.measureText(W.toast.t).width + 70); let ty = Math.max(224, mw ? my + 78 : 0), tx = slot(tw, ty - 28, VW - 16); if (tx == null) { tx = VW / 2; ty = Math.max(ty, gB + 42); }
      ctx.save(); ctx.globalAlpha = Math.min(1, (330 - W.toast.k) / 30, W.toast.k / 10); ctx.fillStyle = 'rgba(40,24,0,0.88)'; rrect(tx - tw / 2, ty - 28, tw, 54, 27); ctx.fill(); ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3; ctx.stroke(); txt(W.toast.t, tx, ty, { size: 24, weight: 900, color: '#ffd34d' }); ctx.restore(); } }
  if (!TOUCH_ON && W.t < 400) txt(gpOn() ? (B => 'العصا: تمشي · ' + B.x + ' تكلّم · ' + B.t + ' الخريطة · ' + B.l1 + ' أو ' + B.tp + ': التقويم 📅')(padLbl()) : 'WASD / الأسهم: تمشي · Enter: تكلّم · Tab: الخريطة · C: التقويم · Esc: خروج', VW / 2, VH - 22, { size: 17, weight: 800, color: 'rgba(255,255,255,0.8)', stroke: '#000', sw: 4 });
  }
  if (W.dlg) drawWorldDlg(W);
  if (W.menu) { const Mn = W.menu, n = Mn.items.length, y0 = VH / 2 - n * 35 - 10, P1 = profCur(); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = 'rgba(16,18,32,0.97)'; rrect(VW / 2 - 340, y0 - 90, 680, n * 70 + 160, 22); ctx.fill(); ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3; ctx.stroke();
    txt(Mn.title, VW / 2, y0 - 52, { size: 32, weight: 900, color: '#fff' }); txt('🪙 ' + P1.coins + '   ⚡ ' + Math.round(W.en), VW / 2, y0 - 16, { size: 19, weight: 900, color: '#ffd34d' });
    Mn.items.forEach(([ic, nm, pr, en, th = 0], i) => { const y = y0 + i * 70, on = i === Mn.sel, fl = Mn.flash && Mn.flash.i === i && Mn.flash.k < 10;
      ctx.fillStyle = fl ? 'rgba(125,255,176,0.35)' : on ? 'rgba(255,211,77,0.18)' : 'rgba(255,255,255,0.05)'; rrect(VW / 2 - 320, y + 4, 640, 62, 14); ctx.fill();
      ctx.font = `900 26px ${FA}`; const nmw = ctx.measureText(ic + '  ' + nm).width; txt(ic + '  ' + nm, VW / 2 + 290, y + 36, { size: nmw > 300 ? 26 * 300 / nmw : 26, weight: 900, color: '#fff', align: 'right' }); txt((en ? '+' + en + ' ⚡  ' : '') + (th ? '+' + th + ' 💧' : ''), VW / 2 - 125, y + 36, { size: 19, weight: 900, color: '#7dffb0' });
      txt(pr && !Mn.free ? pr + ' 🪙' : 'مجاناً', VW / 2 - 262, y + 36, { size: 22, weight: 900, color: pr > P1.coins ? '#ff7070' : '#ffd34d' }); });
    txt(TOUCH_ON ? 'المس الأكل تشتريه · المس برّا للرجوع' : '▲ ▼ اختيار · Enter اشتري · Esc رجوع', VW / 2, y0 + n * 70 + 40, { size: 17, weight: 800, color: 'rgba(255,255,255,0.6)' }); }
  if (W.sleep) { const k = W.sleep.k, a = k < 30 ? k / 30 : k < 70 ? 1 : (100 - k) / 30; ctx.fillStyle = `rgba(2,4,14,${clamp(a, 0, 1)})`; ctx.fillRect(0, 0, VW, VH);
    if (k > 20 && k < 85) { ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); for (let i = 0; i < 3; i++) txt('z', VW / 2 - 30 + i * 34, VH / 2 - i * 30 - (k % 30), { size: 40 + i * 12, weight: 900, color: '#9fd8ff', rtl: false }); txt(W.sleep.night ? '💤 تصبح على خير…' : '💤 قيلولة…', VW / 2, VH / 2 + 80, { size: 30, weight: 900, color: '#fff' }); ctx.restore(); } }
  if (W.mapOpen) drawWorldMap(W);
  if (W.cal) drawCal(W);
  const fd = W.go ? (W.go.k < 14 ? W.go.k / 14 : (28 - W.go.k) / 14) : W.fade / 30; if (fd > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(fd, 0, 1)})`; ctx.fillRect(0, 0, VW, VH); }
}
function drawWorldDlg(W) {
  const D = W.dlg, n = D.n, last = D.i >= D.lines.length - 1, text = D.lines[D.i], shown = text.slice(0, Math.floor(D.k * 1.4)), no = D.opts.length;
  ctx.fillStyle = 'rgba(8,10,22,0.92)'; rrect(150, 470, VW - 300, 160, 20); ctx.fill(); ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3; ctx.stroke();
  const f = n && !n.cit && IMG['face' + (n.ci + 1)]; ctx.save(); rrect(VW - 290, 400, 120, 120, 18); ctx.fillStyle = '#2a2c3a'; ctx.fill(); ctx.clip(); if (f) ctx.drawImage(f, VW - 290, 400, 120, 120); else if (n && n.cit) drawCitPortrait(n, VW - 290, 400, 120, 120); else if (D.jadd) drawJadd(ctx, VW - 230, 600, 0.9, G.frame); else txt(D.icon || '💬', VW - 230, 462, { size: 64, rtl: false }); ctx.restore(); ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3; rrect(VW - 290, 400, 120, 120, 18); ctx.stroke();
  txt(n ? (n.dname || CHARS[n.ci].name) : D.name, VW - 320, 500, { size: 26, weight: 900, color: '#ffd34d', align: 'right' });
  txt(shown, VW - 180, 560, { size: Math.min(30, 30 * 880 / Math.max(1, (ctx.font = `800 30px ${FA}`, ctx.measureText(text).width))), weight: 800, color: '#fff', align: 'right' });
  if (last && D.k > 8) D.opts.forEach(([label], i) => { const x = no === 2 ? [VW / 2 + 160, VW / 2 - 160][i] : VW / 2 + 300 - i * 300, on = i === D.opt; ctx.fillStyle = on ? (i < no - 1 ? 'rgba(230,20,40,0.95)' : 'rgba(255,255,255,0.25)') : 'rgba(255,255,255,0.08)'; rrect(x - 140, 645, 280, 58, 16); ctx.fill(); if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); } txt(label, x, 675, { size: 24, weight: 900, color: '#fff' }); });
  else if (G.frame % 50 < 34) txt('▼', 190, 600, { size: 22, color: '#ffd34d', rtl: false });
}
function drawWorldMap(W) {
  ctx.fillStyle = 'rgba(4,6,16,0.92)'; ctx.fillRect(0, 0, VW, VH); txt('🗺️ الخريطة', VW / 2, 56, { size: 40, weight: 900, color: '#fff' });
  const L = wMapList(), T = W.saga && sgTarget(W);
  ctx.strokeStyle = 'rgba(255,211,77,0.35)'; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); for (const id of L) { if (id === 'fareej') continue; const [x, y] = W_MAPPOS[id], [cx, cy] = W_MAPPOS.fareej; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); } ctx.setLineDash([]);
  for (const id in WMAPS) if (WMAPS[id].lock && !L.includes(id)) { const [x, y] = W_MAPPOS[id]; ctx.fillStyle = 'rgba(255,255,255,0.04)'; rrect(x - 105, y - 52, 210, 104, 14); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.setLineDash([]); txt('🔒 ؟؟؟', x, y - 8, { size: 22, weight: 900, color: 'rgba(255,255,255,0.3)' }); txt('تفتح في القصة', x, y + 24, { size: 14, weight: 700, color: 'rgba(255,255,255,0.25)' }); }
  L.forEach((id, i) => { const [x, y] = W_MAPPOS[id], M = WMAPS[id], on = i === W.mapSel, here = id === W.map, goal = T && T.map === id && !here, pz = 0.5 + 0.5 * Math.sin(G.frame * 0.15);
    if (goal) { ctx.save(); ctx.shadowColor = '#ffd34d'; ctx.shadowBlur = 20 + 14 * pz; ctx.fillStyle = 'rgba(255,211,77,0.25)'; rrect(x - 110, y - 57, 220, 114, 16); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = on ? 'rgba(230,20,40,0.9)' : M.lock ? 'rgba(40,16,56,0.95)' : 'rgba(20,24,44,0.95)'; rrect(x - 105, y - 52, 210, 104, 14); ctx.fill(); ctx.strokeStyle = goal ? '#ffd34d' : here ? '#7dffb0' : on ? '#fff' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = goal || here || on ? 3 : 1.5; ctx.stroke();
    txt((M.icon ? M.icon + ' ' : '') + M.name + (here ? ' 📍' : ''), x, y - 28, { size: 20, weight: 900, color: '#fff' });
    { const sqn = sqMapCount(W, id); if (sqn) txt('📌' + (sqn > 1 ? '×' + sqn : ''), x + 80, y - 48, { size: 18, weight: 900, color: '#9fe8ff', rtl: false }); }
    if (goal) txt('📜 القصة هني', x, y + 34, { size: 15, weight: 900, color: '#ffd34d' });
    const who = W.npcs.filter(n => n.map === id && !n.cit); if (id === 'jadd') txt('👴 الجد', x, y + 10, { size: 17, weight: 800, color: '#ffd34d' }); who.slice(0, 5).forEach((n, j) => { const fx = x - 95 + j * 39, f = IMG['face' + (n.ci + 1)]; ctx.save(); ctx.beginPath(); ctx.arc(fx + 17, y + 6, 17, 0, 7); ctx.clip(); if (f) ctx.drawImage(f, fx, y - 11, 34, 34); ctx.restore(); });
    if (!who.length && id !== 'jadd' && !goal) txt('ما في أحد', x, y + 8, { size: 15, color: 'rgba(255,255,255,0.45)' }); });
  txt(TOUCH_ON ? 'المس منطقة مرتين عشان تروح لها · المس برّا للرجوع' : 'الأسهم للاختيار · Enter تروح · Tab رجوع', VW / 2, VH - 26, { size: 17, weight: 800, color: 'rgba(255,255,255,0.7)' });
}
// ================= the living town: calendar, citizens, vendors, eating & drinking =================
// ---- calendar: day 0 of the world is Saturday 7 November 2026; one game minute = one real second
const W_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const W_WDAY = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
function wDate(day) { return new Date(2026, 10, 7 + day, 12); }
function wDayOf(date) { return Math.round((date - wDate(0)) / 864e5); }
function wDateStr(day, short) { const d = wDate(day); return (short ? '' : W_WDAY[d.getDay()] + ' ') + d.getDate() + ' ' + W_MONTHS[d.getMonth()]; }
const W_EVENTS = [
  { id: 'eid', ic: '👴', name: 'عيدية الجد', when: d => d.getDate() === 1, goal: 'روح بيت الجد وخذ عيديتك 👴', map: 'jadd', reward: 150 },
  { id: 'ice', ic: '🍦', name: 'يوم الآيسكريم', when: d => d.getDate() === 15, goal: 'الآيسكريم في الكورنيش اليوم ببلاش 🍦', map: 'beach', reward: 20, free: 'ice' },
  { id: 'fri', ic: '🏆', name: 'تحدي الجمعة', when: d => d.getDay() === 5, goal: 'اغلب 2 من الشلة اليوم 🏆', wins: 2, reward: 120 },
  { id: 'karak', ic: '☕', name: 'سهرة الكرك', when: d => d.getDay() === 4, goal: 'اشرب كرك من الكشك اللي في الفريج ☕', map: 'fareej', reward: 30, free: 'karak' },
  { id: 'bday', ic: '🎂', name: 'عيد ميلاد الشلة', when: d => d.getDate() === 20, goal: 'روح الديوانية… في مفاجأة 🎂', map: 'diwan', pos: [700, 640], reward: 100 },
];
function wEventsOn(day) { const d = wDate(day); return W_EVENTS.filter(e => e.when(d)); }
function wEvToday(W) { const day = wDay(W); if (!W.ev || W.ev.day !== day) W.ev = { day, done: {}, wins: 0 }; return wEventsOn(day); }
function wEvFree(W, kind) { return wEvToday(W).some(e => e.free === kind); }
function wEvDone(W, id) { const E = wEvToday(W).find(e => e.id === id); if (!E || W.ev.done[id]) return; W.ev.done[id] = 1; if (E.reward) profAward(PROF.cur, E.reward); W.msg = { t: `✅ ${E.ic} ${E.name} — خلصت المهمة` + (E.reward ? ` +${E.reward} 🪙` : ''), k: 0, c: '#ffd34d' }; SFX.ready(); worldSave(); }
function wEvTick(W) { const day = wDay(W), hr = wHour(W); wEvToday(W);
  if (W.evNote !== day && hr >= 6 && (!W.toast || W.toast.k > 330)) { W.evNote = day; const L = wEventsOn(day); if (L.length) W.toast = { t: '📅 حدث اليوم: ' + L.map(e => e.ic + ' ' + e.name).join(' · '), k: 0 }; }
  for (const E of wEventsOn(day)) { if (W.ev.done[E.id]) continue;
    if (E.pos && W.map === E.map && Math.hypot(W.P.x - E.pos[0], W.P.y - E.pos[1]) < 140) { wEvDone(W, E.id); if (E.id === 'bday') W.toast = { t: '🎂🎉 مفاجأة! الشلة سوو لك كيكة', k: 0 }; }
    if (E.wins && W.ev.wins >= E.wins) wEvDone(W, E.id); } }
// ---- thirst + the eating / drinking animation
function wConsume(it, price, free) { const W = G.world, P0 = profCur(), [ic, nm, , en, th = 0] = it; price = free ? 0 : price;
  if (price > P0.coins) { W.msg = { t: 'فلوسك ما تكفي 🪙', k: 0, c: '#ff8080' }; SFX.move(); return false; }
  if (W.P.eat) { W.msg = { t: 'خلّص اللي بيدك أول 😋', k: 0, c: '#ffd34d' }; return false; } if (sqCarry(W, it, price)) return true; P0.coins -= price; profSave(); W.menu = null;
  W.P.eat = { ic, nm, en, th, k: 0, drink: th > en, price }; W.P.act = th > en ? 'wdrink' : 'weat'; SFX.ok(); return true; }
function wEatTick(W) { const E = W.P.eat; if (!E) return; E.k++;
  if (E.k % 40 === 20) { SFX.move(); (W.puffs = W.puffs || []).push({ x: W.P.x + W.P.face * 20, y: W.P.y - 170, t: 0, s: E.drink ? '💧' : '😋' }); }
  if (E.k >= 140) { const b0 = W.en, t0 = W.th; W.en = Math.min(100, W.en + E.en); W.th = Math.min(100, W.th + E.th); W.lowWarned = W.en < 20; W.thWarned = W.th < 20; W.P.eat = null; W.P.act = null;
    const parts = []; if (W.en - b0 >= 1) parts.push('+' + Math.round(W.en - b0) + ' ⚡'); if (W.th - t0 >= 1) parts.push('+' + Math.round(W.th - t0) + ' 💧');
    W.msg = { t: `😋 ${E.ic} ${E.nm}  ${parts.join('  ')}` + (E.price ? `  (−${E.price} 🪙)` : ''), k: 0, c: '#7dffb0' }; SFX.ready(); worldSave(); } }
function drawHeldFood(e) { const E = e.eat, f = e.fig; if (!E || !f || !f.J) return; const h = f.toWorld(f.J.fH), bob = Math.sin(E.k * 0.25) * 3;
  ctx.save(); ctx.translate(h[0] + f.facing * 6, h[1] - 18 + bob); ctx.scale(f.facing, 1); txt(E.ic, 0, 0, { size: 64, rtl: false }); ctx.restore(); }
// ---- the people of the town: same style as the gang, but their own faces (skin, head shape, beard) and clothes (thobe, ghutra…)
const CIT_NAMES = ['بو خالد', 'بو سالم', 'أبو فهد', 'سالم', 'ناصر', 'خليفة', 'جاسم', 'مبارك', 'راشد', 'حمد', 'عبدالله', 'يوسف', 'فيصل', 'بو عبدالعزيز', 'منصور', 'عيسى', 'سعود', 'بدر', 'طلال', 'مشعل', 'ضاري', 'بو ناصر'];
const CIT_LINES = ['السلام عليكم… الجو حار اليوم 🥵', 'جربت كرك الكشك؟ أحسن كرك في الفريج ☕', 'الآيسكريم في الكورنيش يرد الروح 🍦', 'لا تنسى تشرب ماي… العطش يتعبك 💧', 'شفت التقويم؟ أول كل شهر الجد يعطي عيدية 👴', 'يوم الجمعة في تحدي بالفريج… اغلب اثنين وخذ جايزة 🏆',
  'الخالين… الله يصلح بينهم', 'رايح البقالة… تبي شي؟', 'ولدي يحب معركة الشلة 😄', 'الليل في الفريج حلو… بس لا تتأخر 🌙', 'مطعم الشلة كبسته ما لها حل 🍛', 'شفت الشلة يتقاتلون في الملعب؟', 'الله يحفظك يا ولدي 🤲', 'يقولون ملالي شافوه في الليل… الله يستر', 'كل يوم ٢٠ بالشهر الشلة يسوون حفلة في الديوانية 🎂'];
const CIT_THOBE = [[246, 244, 238], [236, 228, 210], [212, 214, 216], [204, 218, 230], [150, 120, 92], [70, 80, 104], [250, 250, 248]];
const CIT_CASUAL = [[200, 40, 50], [40, 90, 180], [30, 32, 38], [60, 130, 80], [230, 160, 40], [120, 60, 150], [240, 240, 240]];
const CIT_PANTS = [[52, 70, 110], [40, 42, 48], [150, 130, 100], [90, 96, 104]];
function citSpec(i) { const r = k => ((i * 2654435761 + k * 40503) >>> 0) % 1000 / 1000, thobe = r(1) < 0.62;
  return { i, ci: [1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 0, 6, 7, 8][i % 15], thobe, col: thobe ? CIT_THOBE[(r(2) * CIT_THOBE.length) | 0] : CIT_CASUAL[(r(2) * CIT_CASUAL.length) | 0], pcol: CIT_PANTS[(r(3) * CIT_PANTS.length) | 0],
    head: thobe ? (r(4) < 0.45 ? 'ghutra' : r(4) < 0.85 ? 'shemagh' : 'taqiya') : (r(4) < 0.55 ? 'cap' : 'none'), capCol: ['#c8102e', '#1f4fd8', '#222', '#2a8a4a', '#e8e8e8'][(r(5) * 5) | 0],
    glasses: r(6) < 0.28, beard: thobe ? r(7) < 0.7 : r(7) < 0.35, tone: 0.8 + r(8) * 0.3, hw: 0.9 + r(9) * 0.2, name: CIT_NAMES[i % CIT_NAMES.length] }; }
function citTorso(R, sp) { const P = R.P.torso, m = R.m, im = P.img, W = im.width, H = im.height, neck = Math.round(m.S[1] - (m.S[1] - m.bbox[1]) * 0.03 - P.oy);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const src = document.createElement('canvas'); src.width = W; src.height = H; const sg = src.getContext('2d'); sg.drawImage(im, 0, 0);
  const id = sg.getImageData(0, 0, W, H), d = id.data; let x0 = W, x1 = 0;
  for (let y = 0; y < Math.min(H, neck); y++) { const blend = clamp((neck - y) / 18, 0, 1); for (let x = 0; x < W; x++) { const j = (y * W + x) * 4; if (d[j + 3] < 30) continue; if (d[j + 3] > 120) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
      const t = 1 + (sp.tone - 1) * blend; d[j] = Math.min(255, d[j] * t * (t < 1 ? 1.02 : 1)); d[j + 1] = Math.min(255, d[j + 1] * t * 0.985); d[j + 2] = Math.min(255, d[j + 2] * t * (t < 1 ? 0.94 : 0.97)); } }
  sg.putImageData(id, 0, 0); const cx = (x0 + x1) / 2;
  g.clearRect(0, 0, W, Math.max(0, neck)); for (let y = 0; y < Math.min(H, neck); y++) { const sc = lerp(1, sp.hw, clamp((neck - y) / 26, 0, 1)); g.drawImage(src, 0, y, W, 1, cx - cx * sc, y, W * sc, 1); }
  const q = { img: c, ox: P.ox, oy: P.oy, hull: P.hull }; for (const [v, col, a] of [['shadow', '#1e0430', 0.8], ['dark', '#0b0d1a', 0.45], ['flash', '#ffffff', 0.42], ['rage', '#ff1020', 0.35]]) { let t = null; Object.defineProperty(q, v, { get: () => t || (t = tinted(c, col, a)) }); }
  return { q, cx: cx + P.ox }; }
CLOTH_PAT.thobe = (g, G2, it) => { const { part, m } = G2; g.strokeStyle = 'rgba(0,0,0,0.13)'; g.lineWidth = 3;
  if (part === 'torso') { const y0 = G2.neckY + 6, y1 = y0 + (m.hip[1] - y0) * 0.45, xm = (G2.rowMin(y0 + 20) + G2.rowMax(y0 + 20)) / 2 + 6; g.beginPath(); g.moveTo(xm, y0); g.lineTo(xm, y1); g.stroke(); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let k = 1; k < 4; k++) { g.beginPath(); g.arc(xm + 5, y0 + (y1 - y0) * k / 4, 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,0.07)'; g.lineWidth = 6; for (let k = 0; k < 4; k++) { const x = lerp(m.bbox[0], m.bbox[2], 0.2 + k * 0.2); g.beginPath(); g.moveTo(x, y1); g.quadraticCurveTo(x + 6, (y1 + m.hip[1]) / 2, x - 2, m.hip[1] + 20); g.stroke(); } }
  if (part === 'thigh' || part === 'shin' || part === 'skirt') { g.strokeStyle = 'rgba(0,0,0,0.08)'; g.lineWidth = 7; for (let k = 0; k < 3; k++) { const x = lerp(m.bbox[0], m.bbox[2], 0.3 + k * 0.2); g.beginPath(); g.moveTo(x, m.bbox[1]); g.lineTo(x + 8, m.bbox[3]); g.stroke(); } } };
const CIT_RIGS = {};
function citRig(sp) { if (CIT_RIGS[sp.i]) return CIT_RIGS[sp.i]; const R = RIGS[sp.ci], T = citTorso(R, sp), R1 = Object.assign({}, R, { P: Object.assign({}, R.P, { torso: T.q }) });
  const bid = 'cit_b' + sp.i, fid = 'cit_f' + sp.i; SHOP_BY[bid] = { id: bid, cat: 'body', col: sp.col, sleeve: 'long', pants: 1, pcol: sp.thobe ? sp.col : sp.pcol, pat: sp.thobe ? 'thobe' : 'jacket' }; SHOP_BY[fid] = { id: fid, cat: 'feet', col: sp.thobe ? [120, 82, 50] : [40, 40, 44], top: sp.thobe ? 0.86 : 0.6 };
  const R2 = clothRig(R1, 'cit' + sp.i, { body: bid, feet: fid }); const F = faceOf(R); R2.citFace = { h: F.h, eye: [T.cx + (F.eye[0] - T.cx) * sp.hw, F.eye[1]], nose: [T.cx + (F.nose[0] - T.cx) * sp.hw, F.nose[1]] };
  return (CIT_RIGS[sp.i] = R2); }
function citMakeFig(sp) { const f = new Fighter(0, sp.ci, { h: {}, p: {}, read() { } }); f.state = 'widle'; f.x = 0; f.facing = 1; f.clock = (Math.random() * 200) | 0; f.R = citRig(sp); f.cit = sp; f.animate(); return f; }
// the head things that make them somebody else: ghutra / shemagh with an agal, a cap, a beard, sunglasses
function drawCitHead(f) { const sp = f.cit, F = f.R.citFace; if (!sp || !F || !f.J) return; const u = F.h * 0.44 / 50;
  ctx.save(); torsoSpace(f); ctx.translate(F.eye[0], F.eye[1]); ctx.scale(u * sp.hw, u); ctx.translate(-24, 6);
  if (sp.beard) { ctx.fillStyle = 'rgba(28,20,14,0.78)'; ctx.beginPath(); ctx.moveTo(-4, 4); ctx.quadraticCurveTo(0, 40, 22, 48); ctx.quadraticCurveTo(38, 46, 44, 30); ctx.lineTo(40, 22); ctx.quadraticCurveTo(30, 34, 18, 32); ctx.quadraticCurveTo(6, 28, 4, 4); ctx.closePath(); ctx.fill(); ctx.fillRect(28, 16, 16, 5); }
  if (sp.head && sp.head !== 'none') hatShape(sp.head, sp.capCol);
  if (sp.glasses) { ctx.fillStyle = '#0c0e12'; ctx.beginPath(); ctx.ellipse(30, -6, 11, 9, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#0c0e12'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(20, -8); ctx.lineTo(-18, -10); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(27, -10, 3, 2, 0.3, 0, 7); ctx.fill(); }
  ctx.restore(); }
// where people walk on each map
const CIT_ZONES = { fareej: [[80, 590, 3340, 24], [80, 830, 3340, 24], [1680, 990, 460, 240], [120, 900, 3200, 420], [60, 640, 3380, 160]], beach: [[120, 480, 1980, 760]], pitch: [[160, 1180, 1680, 70], [200, 300, 1500, 800]], shop: [[560, 520, 560, 240]], rest: [[200, 380, 900, 380]] };
const CIT_PLACES = [['fareej', 9], ['beach', 4], ['pitch', 3], ['shop', 2], ['rest', 2]];
function citSpawn(W) { let i = 0; const L = [];
  for (const [map, n] of CIT_PLACES) for (let k = 0; k < n; k++, i++) { const sp = citSpec(i + 3), Z = CIT_ZONES[map][k % CIT_ZONES[map].length]; const x = Z[0] + ((i * 397) % 100) / 100 * Z[2], y = Z[1] + ((i * 211) % 100) / 100 * Z[3];
    L.push({ cit: sp, cid: i, ci: sp.ci, map, x, y, hx: x, hy: y, dir: 'down', d0: 'down', ph: Math.random() * 6, wait: 60 + Math.random() * 300, tx: null, ty: null, fig: null, face: i % 2 ? 1 : -1, dname: sp.name, line: CIT_LINES[i % CIT_LINES.length], spd: 1.3 + (i % 4) * 0.2 }); }
  // the two vendors
  L.push({ cit: Object.assign(citSpec(40), { thobe: false, col: [250, 250, 250], pcol: [250, 250, 250], head: 'cap', capCol: '#ff6fb5', name: 'بياع الآيسكريم' }), role: 'ice', map: 'beach', x: 1790, y: 905, hx: 1790, hy: 905, dir: 'down', d0: 'down', ph: 0, wait: 1e9, tx: null, ty: null, fig: null, face: 1, dname: 'بياع الآيسكريم 🍦', line: 'آيس كريم بارد! تبي فانيلا ولا شوكولاتة؟', still: 1 });
  L.push({ cit: Object.assign(citSpec(41), { thobe: true, col: [236, 228, 210], head: 'shemagh', beard: true, name: 'بياع الكرك' }), role: 'karakman', map: 'fareej', x: 815, y: 1050, hx: 815, hy: 1050, dir: 'left', d0: 'left', ph: 0, wait: 1e9, tx: null, ty: null, fig: null, face: -1, dname: 'بياع الكرك ☕', line: 'كرك حار على الصبح… يعدّل المزاج!', still: 1 });
  for (const n of L) n.ci = n.cit.ci; W.npcs = W.npcs.concat(L); }
function citTick(W) { let built = 0; for (const n of W.npcs) { if (!n.cit || n.fig || n.map !== W.map || built) continue; n.fig = citMakeFig(n.cit); built++; }
  for (const n of W.npcs) if (n.cit && !n.still && n.map === W.map && n.tx === null && n.wait <= 1) { const Z = CIT_ZONES[n.map]; if (!Z) continue; const z = Z[(Math.random() * Z.length) | 0]; for (let t = 0; t < 6; t++) { const x = z[0] + Math.random() * z[2], y = z[1] + Math.random() * z[3]; if (wFree(W, x, y, WD.R, n)) { n.hx = x; n.hy = y; n.tx = x; n.ty = y; break; } } n.wait = 2; } }
function citTalk(W, n) { if (sqTalk(W, n)) return; const extra = n.role === 'ice' ? [['🍦 الآيسكريم', () => wMenu('ice')]] : n.role === 'karakman' ? [['☕ الكرك', () => wMenu('karak')]] : [];
  W.dlg = { n, lines: [n.line], i: 0, k: 0, opt: 0, opts: extra.concat([['👋 مع السلامة', 'bye']]) }; n.dir = wDirOf(W.P.x - n.x, W.P.y - n.y, n.dir); n.face = W.P.x >= n.x ? 1 : -1; W.P.face = n.x >= W.P.x ? 1 : -1; SFX.move(); }
// a face for the talk box: the citizen's own head, drawn from his figure
function drawCitPortrait(n, x, y, w, h) { const f = n.fig; if (!f || !f.J) return; const hd = f.toWorld(f.J.hd), s = 1.45; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = '#2a2c3a'; ctx.fillRect(x, y, w, h);
  const e = { x: x + w / 2 - hd[0] * s, y: y + h * 0.55 - hd[1] * s, fig: f }; drawFig(ctx, e, s); ctx.restore(); }
// ---- withdraw from a fight that started in the open world (pause menu)
function worldWithdraw() { const W = G.world; if (!W) return; voiceStop(); if (AC) Music.intensity = 0; G.scene = 'world'; G.fight = null; G.vsName = null; W.fade = 20; W.cam = null;
  if (W.sagaF) { const st = W.sagaF; W.sagaF = null; W.saga.fightLater = true; sgEnsure(W, st.fight); W.msg = { t: '🏳️ انسحبت… كلّم ' + sgName(W, st.fight) + ' إذا تبي ترجع للمواجهة', k: 0, c: '#ffb070' }; }
  else { W.fightWith = null; W.msg = { t: '🏳️ انسحبت من القتال', k: 0, c: '#ffb070' }; } SFX.move(); }
// ---- the calendar screen
function calOpen(W) { W.cal = { m: 0, sel: wDay(W), k: 0 }; W.dlg = null; W.menu = null; SFX.ok(); }
function calMonth(W) { const t = wDate(wDay(W)); return new Date(t.getFullYear(), t.getMonth() + W.cal.m, 1, 12); }
function calCell(W, i) { const first = calMonth(W), off = (first.getDay() + 1) % 7; return { x: VW / 2 + 3 * 150 - (i % 7) * 150, y: 186 + ((i / 7) | 0) * 70, date: new Date(first.getFullYear(), first.getMonth(), 1 + i - off, 12) }; }
function calUpd(W, p, q, ok, back, tap) { const C = W.cal; C.k++; const mv = n => { C.sel += n; const d = wDate(C.sel), M = calMonth(W); if (d.getMonth() !== M.getMonth()) C.m += d > M ? 1 : -1; SFX.move(); };
  if (p.left || q.left) mv(1); if (p.right || q.right) mv(-1); if (p.up || q.up) mv(-7); if (p.down || q.down) mv(7);
  if (tap) { if (Math.abs(tap[1] - 120) < 34 && Math.abs(tap[0] - (VW / 2 - 330)) < 50) { C.m++; SFX.move(); return; } if (Math.abs(tap[1] - 120) < 34 && Math.abs(tap[0] - (VW / 2 + 330)) < 50) { C.m--; SFX.move(); return; }
    for (let i = 0; i < 42; i++) { const c = calCell(W, i); if (Math.abs(tap[0] - c.x) < 72 && Math.abs(tap[1] - c.y) < 33) { C.sel = wDayOf(c.date); SFX.move(); return; } } W.cal = null; SFX.move(); return; }
  if ((ok && C.k > 6) || back || anyP('KeyC') || ((p.c13 || q.c13 || gpTP()) && C.k > 6)) { W.cal = null; SFX.move(); } }
function calStory(W) { const S = W.saga; if (!S || S.done) return null; if (S.wait != null) return { day: S.wait, ch: S.ch }; return { day: wDay(W), ch: S.ch, now: 1 }; }
function drawCal(W) { const C = W.cal, M = calMonth(W), today = wDay(W), st = calStory(W);
  ctx.fillStyle = 'rgba(4,6,16,0.94)'; ctx.fillRect(0, 0, VW, VH);
  txt('📅 ' + W_MONTHS[M.getMonth()] + ' ' + M.getFullYear(), VW / 2, 120, { size: 40, weight: 900, color: '#fff' }); txt('◀', VW / 2 - 330, 120, { size: 34, color: '#ffd34d', rtl: false }); txt('▶', VW / 2 + 330, 120, { size: 34, color: '#ffd34d', rtl: false });
  ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].forEach((n, i) => txt(n, VW / 2 + 3 * 150 - i * 150, 158, { size: 17, weight: 800, color: i === 6 ? '#7dffb0' : 'rgba(255,255,255,0.6)' }));
  for (let i = 0; i < 42; i++) { const c = calCell(W, i), d = c.date, day = wDayOf(d), inM = d.getMonth() === M.getMonth(); if (!inM && i >= 35) continue; const ev = wEventsOn(day), isSt = st && st.day === day, on = day === C.sel;
    ctx.fillStyle = !inM ? 'rgba(255,255,255,0.02)' : day < today ? 'rgba(255,255,255,0.04)' : 'rgba(20,24,44,0.95)'; rrect(c.x - 70, c.y - 31, 140, 62, 10); ctx.fill();
    if (isSt) { ctx.fillStyle = 'rgba(255,211,77,0.22)'; ctx.fill(); } ctx.strokeStyle = on ? '#ff3b4a' : day === today ? '#7dffb0' : isSt ? '#ffd34d' : 'rgba(255,255,255,0.12)'; ctx.lineWidth = on || day === today || isSt ? 3 : 1; ctx.stroke();
    txt(String(d.getDate()), c.x + 50, c.y - 15, { size: 18, weight: 900, color: inM ? (day < today ? 'rgba(255,255,255,0.35)' : '#fff') : 'rgba(255,255,255,0.2)', rtl: false });
    const icons = (isSt ? '📜' : '') + ev.map(e => e.ic).join(''); if (icons) txt(icons, c.x - 10, c.y + 10, { size: 20, rtl: false }); }
  const sd = C.sel, evs = wEventsOn(sd), lines = []; if (st && st.day === sd) lines.push('📜 القصة: الفصل ' + SG_ORD[st.ch] + ' — ' + SAGA[st.ch].n + (st.now ? ' (الحين)' : ' (يبدأ الصبح)')); for (const e of evs) lines.push(e.ic + ' ' + e.name + ': ' + e.goal + (e.reward ? `  +${e.reward} 🪙` : ''));
  ctx.fillStyle = 'rgba(20,24,44,0.95)'; rrect(VW / 2 - 520, 610, 1040, 96, 14); ctx.fill(); ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 2; ctx.stroke();
  txt(wDateStr(sd) + (sd === today ? ' — اليوم' : sd === today + 1 ? ' — بكرة' : ''), VW / 2 + 500, 632, { size: 18, weight: 900, color: '#ffd34d', align: 'right' });
  (lines.length ? lines : ['ما في أحداث هاليوم… يوم عادي 🌴']).slice(0, 2).forEach((l, i) => txt(l, VW / 2 + 500, 660 + i * 28, { size: 18, weight: 800, color: '#fff', align: 'right' }));
  txt(TOUCH_ON ? 'المس يوم تشوف أحداثه · المس برّا للرجوع' : 'الأسهم: تنقّل بين الأيام · Enter رجوع', VW / 2, 590, { size: 15, weight: 700, color: 'rgba(255,255,255,0.5)' }); }
// ================= side quests: a little creative brain that keeps inventing jobs around town =================
// Every so often a townsperson gets a ❗ over their head. Talk to them and they ask for something — fetch a karak, find a lost
// wallet, catch a runaway cat, take a parcel across town before the food gets cold, put a show-off in his place, clean the
// beach… The brain mixes the kind of job, the place, the time of day and the person, avoids repeating itself, scales the pay
// with how many jobs you have done, and sometimes adds a twist (a tip, a snack, a follow-up job).
const SQ_MAPS = ['fareej', 'beach', 'pitch', 'shop', 'rest', 'diwan', 'jadd'];
const SQ_LOST = [['👛', 'محفظتي', 'المحفظة'], ['📱', 'جوالي', 'الجوال'], ['🔑', 'مفتاح سيارتي', 'مفتاح السيارة'], ['⌚', 'ساعتي', 'الساعة'], ['🕶️', 'نظارتي', 'النظارة'], ['💍', 'خاتمي', 'الخاتم'], ['📿', 'مسباحي', 'المسباح'], ['🎧', 'سماعاتي', 'السماعات'], ['🧸', 'لعبة ولدي', 'اللعبة'], ['🪪', 'بطاقتي', 'البطاقة']];
const sqLi = s => s.startsWith('ال') ? 'لل' + s.slice(2) : 'ل' + s;   // «لـ» + a name
const SQ_CATS = ['مشمش', 'لولو', 'بسبوس', 'نمّور', 'زعفران', 'قهوة'];
const SQ_COLLECT = { beach: ['🥫', 'العلب الفاضية', 'الشاطئ مليان علب… جمّع {n} وخلّه نظيف ♻️'], pitch: ['⚽', 'الكورات', 'كورات الأولاد طايحة في الملعب… جمّع لي {n} ⚽'], fareej: ['🌴', 'التمرات', 'النخل طيّح تمر في الفريج… جمّع {n} حبات للضيوف 🌴'] };
const SQ_SPOTS = [['beach', 1100, 600, 'البحر', 'وقت الغروب 🌅', 17, 19], ['fareej', 1900, 1100, 'حديقة الفريج', 'الصبح بدري ☀️', 6, 9], ['pitch', 1000, 650, 'نص الملعب', 'بالليل 🌙', 20, 23], ['beach', 700, 700, 'الكورنيش', 'العصر 🌤️', 15, 17], ['fareej', 2400, 900, 'الشارع العام', 'وقت الظهر 🕛', 12, 14]];
const SQ_HI = ['يا هلا… ', 'الله يحييك! ', 'تعال تعال… ', 'لو سمحت يا بطل… ', 'هلا والله! ', 'زين إني شفتك… ', 'يا شيخ… ', 'السلام عليكم… '];
const SQ_PAY = ['ولك مني {r} 🪙 تعبك.', 'وأعطيك {r} 🪙 على طول.', 'وتبشر بـ{r} 🪙!', 'والجزا {r} 🪙… وش قلت؟'];
const SQ_THX = ['تسلم يمينك! 🙏', 'ما قصرت يا ذيب!', 'الله يعطيك العافية!', 'كفو والله! 💪', 'أنت الزين والله!', 'فزعتك ما تنتسى!'];
const SQ_TXT = {
  deliver: ['{hi}أبي {i} من {p}… عندي ضيوف وما أقدر أطلع.', '{hi}نفسي في {i}… بس الكسل غالبني 😅 جيبه لي من {p}.', '{hi}أمي تبي {i}… جيبه من {p} الله يخليك.', '{hi}رجعت من الدوام هلكان… تجيب لي {i} من {p}؟'],
  lost: ['{hi}ضاع مني {i}… آخر مرة كنت في {p}.', '{hi}طاح مني {i} وأنا في {p}… دوّرته وما لقيته!', '{hi}{i} ضاع في {p}… لو لقيته رجّعه لي.'],
  cat: ['{hi}قطوي {c} شرد مني… شفته رايح {p}! 🐈', '{hi}{c} قطوي طلع من البيت… أظنه في {p}. امسكه لي!'],
  courier: ['{hi}عندي أمانة لازم توصل {lt}… تلقاه في {p}.', '{hi}هذا الغرض {lt} في {p}… توصله عني؟', '{hi}{t} ينتظر هالطرد في {p}… أنا مشغول.'],
  rush: ['{hi}هذا عشا {t} حار! لازم يوصله في {p} قبل الساعة {h} ⏱️', '{hi}{t} جوعان ويصارخ 😅… وصّل له هالأكل في {p} قبل {h}!'],
  fight: ['{hi}{t} قاعد يتفشخر إنه ما ينغلب… أدّبه لي! تلقاه في {p}.', '{hi}{t} تحداني وأنا ما أعرف أتضارب 😅… تفزع لي؟ هو في {p}.', '{hi}راهنت ربعي إن في أحد يغلب {t}… لا تفشلني! هو في {p}.'],
  visit: ['{hi}أبي صورة {lp} {w}… تصوّرها لي؟ 📸', '{hi}يقولون {p} {w} شي ثاني… روح شوف وصوّر لي 📸'],
  collect: ['{hi}{x}'],
  chat: ['{hi}قول {lt} إن العشا عندي الليلة… تلقاه في {p}.', '{hi}بلّغ {t} إن المباراة بكرة العصر… هو في {p}.', '{hi}قول {lt} يرجّع لي الشاحن 😤… تلقاه في {p}.'],
};
const SQ_ICON = { deliver: '🛍️', lost: '🔎', cat: '🐈', courier: '📦', rush: '⏱️', fight: '🥊', visit: '📸', collect: '♻️', chat: '💬' };
const sqPick = a => a[(Math.random() * a.length) | 0], sqR5 = v => Math.max(5, Math.round(v / 5) * 5);
const sqFill = (s, o) => { if (o.t) o.lt = sqLi(o.t); if (o.p) o.lp = sqLi(o.p); return s.replace(/\{(\w+)\}/g, (m, k) => o[k] !== undefined ? o[k] : m); };
function sqNpc(W, cid) { return W.npcs.find(n => n.cid === cid); }
function sqGang(W, ci) { return W.npcs.find(n => !n.cit && !n.sg && n.ci === ci && WMAPS[n.map]); }
function sqBusy(W) { const s = new Set(); for (const q of W.sq.act) { s.add(q.g); if (q.hand != null) s.add(q.hand); } for (const o of W.sq.off) s.add(o.q.g); return s; }
function sqInit(W, sv) { const ok = sv && Array.isArray(sv.act) && Array.isArray(sv.off);
  W.sq = ok ? sv : { n: 0, earn: 0, act: [], off: [], next: W.min + 4, hist: [] };
  W.sq.act = W.sq.act.filter(q => sqNpc(W, q.g)); W.sq.off = W.sq.off.filter(o => sqNpc(W, o.q.g)); if (!W.sq.hist) W.sq.hist = []; }
// a free spot on any map (the townspeople's walking areas where there are some), not hidden behind a building
function sqFree(m, x, y) { const M = WMAPS[m]; if (x < 60 || y < (M.wall || 0) + 70 || x > M.W - 60 || y > M.H - 60) return false;
  for (const [bx, by, bw, bd] of wSolids({ map: m })) { if (x > bx - 34 && x < bx + bw + 34 && y > by - 28 && y < by + bd + 28) return false; if (x > bx - 20 && x < bx + bw + 20 && y < by && y > by - 240) return false; }
  for (const e of M.exits) if (x > e.x - 60 && x < e.x + e.w + 60 && y > e.y - 60 && y < e.y + e.h + 60) return false; return true; }
function sqSpot(m) { const M = WMAPS[m], Z = CIT_ZONES[m];
  for (let t = 0; t < 80; t++) { let x, y; if (Z && t < 50) { const z = sqPick(Z); x = z[0] + Math.random() * z[2]; y = z[1] + Math.random() * z[3]; } else { x = 80 + Math.random() * (M.W - 160); y = (M.wall || 0) + 90 + Math.random() * (M.H - (M.wall || 0) - 170); }
    if (sqFree(m, x, y)) return [Math.round(x), Math.round(y)]; } return null; }
function sqWhere(W, n) { return WMAPS[n.map].name; }
// ---- the brain: choose a job that fits the moment
function sqBrain(W, giver) {
  const hr = wHour(W), day = wDay(W), dow = wDate(day).getDay(), S = W.sq, gang = W.npcs.filter(n => !n.cit && !n.sg && n.ci !== W.P.ci && n.ci !== W.P.base && !n.role && CHARS[n.ci] && WMAPS[n.map] && !WMAPS[n.map].lock), cits = W.npcs.filter(n => n.cit && n.cid != null && !n.role && n !== giver);
  const w = { deliver: 3, lost: 2.4, cat: 1.1, courier: 2, rush: 1.4, fight: gang.length ? 2 : 0, visit: 1.4, collect: 1.6, chat: gang.length ? 1.4 : 0 };
  if (S.n < 3) { w.rush *= 0.4; w.cat *= 0.5; w.deliver *= 1.4; w.chat *= 1.3; }
  if (dow === 5) w.fight *= 2.2;                       // friday: everyone wants a fight
  if (hr >= 20 || hr < 7) { w.collect *= 0.4; w.lost *= 1.4; }
  if (W.en < 30) { w.fight *= 0.3; w.deliver *= 1.5; }
  for (const k of S.hist.slice(-3)) w[k] *= 0.25;        // don't repeat yourself
  if (!SQ_SPOTS.some(s => (s[5] - hr + 24) % 24 <= 6)) w.visit = 0;
  let tot = 0; for (const k in w) tot += w[k]; let r = Math.random() * tot, type = 'deliver'; for (const k in w) { r -= w[k]; if (r <= 0) { type = k; break; } }
  const lvl = 1 + Math.min(0.8, S.n * 0.04), q = { id: 'q' + Date.now().toString(36) + ((Math.random() * 1e3) | 0), t: type, g: giver.cid, gn: giver.dname, gm: giver.map, hand: null, ready: false, k: 0 }, hi = sqPick(SQ_HI);
  let ask = '', base = 40;
  if (type === 'deliver') { const key = hr >= 11 && hr < 17 && Math.random() < 0.55 ? 'ice' : hr >= 12 && hr < 15 || hr >= 19 && hr < 22 ? sqPick(['rest', 'karak', 'snack']) : sqPick(['karak', 'snack', 'karak']);
    const it = sqPick(W_FOOD[key][1]), where = { ice: 'عربة الآيسكريم بالكورنيش', karak: 'كشك الكرك بالفريج', snack: 'البقالة', rest: 'المطعم' }[key];
    q.need = it[1]; q.ic = it[0]; q.where = where; q.hand = giver.cid; base = 28 + it[2] * 1.5; ask = sqFill(sqPick(SQ_TXT.deliver), { hi, i: it[0] + ' ' + it[1], p: where }); }
  else if (type === 'lost' || type === 'cat') { const m = type === 'cat' ? sqPick(['fareej', 'beach', 'pitch']) : sqPick(SQ_MAPS), at = sqSpot(m); if (!at) return null;
    const L = type === 'cat' ? ['🐈', 'القطو ' + sqPick(SQ_CATS)] : sqPick(SQ_LOST); q.pk = [{ m, x: at[0], y: at[1], ic: L[0], got: 0, cat: type === 'cat' ? 1 : 0 }]; q.item = L[2] || L[1]; q.hand = giver.cid; base = type === 'cat' ? 75 : 50;
    ask = type === 'cat' ? sqFill(sqPick(SQ_TXT.cat), { hi, c: L[1].replace('القطو ', ''), p: WMAPS[m].name }) : sqFill(sqPick(SQ_TXT.lost), { hi, i: L[0] + ' ' + L[1], p: WMAPS[m].name }); }
  else if (type === 'courier' || type === 'rush') { const far = cits.filter(n => n.map !== giver.map || Math.hypot(n.x - giver.x, n.y - giver.y) > 900), T = sqPick(far.length ? far : cits); if (!T) return null;
    q.hand = T.cid; q.tn = T.dname; q.ready = true; base = type === 'rush' ? 70 : 38 + (T.map !== giver.map ? 15 : 0);
    if (type === 'rush') { q.dl = W.min + 100 + ((Math.random() * 60) | 0); q.dl0 = W.min; } const hh = q.dl ? Math.floor((q.dl % 1440) / 60) + ':' + String(q.dl % 60).padStart(2, '0') : '';
    ask = sqFill(sqPick(SQ_TXT[type]), { hi, t: T.dname, p: WMAPS[T.map].name, h: hh }); }
  else if (type === 'fight' || type === 'chat') { const T = sqPick(gang); if (!T) return null; q.tci = T.ci; q.tn = CHARS[T.ci].name; base = type === 'fight' ? (T.ci >= NCH ? 140 : 85) : 28; if (type === 'chat') q.ready = true;
    ask = sqFill(sqPick(SQ_TXT[type]), { hi, t: CHARS[T.ci].name, p: WMAPS[T.map].name }); }
  else if (type === 'visit') { const cand = SQ_SPOTS.filter(s => (s[5] - hr + 24) % 24 <= 6 || (hr >= s[5] && hr < s[6])), sp = sqPick(cand.length ? cand : SQ_SPOTS); q.spot = sp; base = 40;
    ask = sqFill(sqPick(SQ_TXT.visit), { hi, p: sp[3], w: sp[4] }); }
  else if (type === 'collect') { const m = sqPick(Object.keys(SQ_COLLECT)), C = SQ_COLLECT[m], N = 4 + ((Math.random() * 3) | 0); q.pk = []; for (let i = 0; i < N; i++) { const at = sqSpot(m); if (at) q.pk.push({ m, x: at[0], y: at[1], ic: C[0], got: 0 }); } if (q.pk.length < 3) return null;
    q.item = C[1]; q.hand = giver.cid; base = 14 * q.pk.length; ask = hi + C[2].replace('{n}', q.pk.length); }
  q.rw = sqR5(base * lvl * (0.85 + Math.random() * 0.35)); q.lines = [ask, sqFill(sqPick(SQ_PAY), { r: q.rw })]; return q; }
// ---- spawning offers over time
function sqTick(W) { const S = W.sq; if (!S) return; const hr = wHour(W);
  S.off = S.off.filter(o => o.exp > W.min || (W.dlg && W.dlg.n && W.dlg.n.cid === o.q.g));
  if (W.min >= S.next && hr >= 6 && hr < 23 && S.off.length < 2 && S.act.length < 3) { S.next = W.min + 55 + ((Math.random() * 75) | 0); const busy = sqBusy(W);
    const pool = W.npcs.filter(n => n.cit && n.cid != null && !n.role && !busy.has(n.cid)), here = pool.filter(n => n.map === W.map), giver = sqPick(here.length && Math.random() < 0.65 ? here : pool);
    if (giver) { const q = sqBrain(W, giver); if (q) { S.off.push({ q, exp: W.min + 360 }); S.hist.push(q.t); S.hist = S.hist.slice(-6); if (giver.map === W.map) (W.puffs = W.puffs || []).push({ x: giver.x, y: giver.y - 250, t: 0, s: '❗' }); } } }
  // pickups, the runaway cat, places to be, food that must arrive warm
  for (const q of S.act.slice()) { q.k++;
    if (q.pk) for (const p of q.pk) { if (p.got || p.m !== W.map) continue; const d = Math.hypot(p.x - W.P.x, p.y - W.P.y);
      if (p.cat && d < 230 && d > 44) { const a = Math.atan2(p.y - W.P.y, p.x - W.P.x) + Math.sin(q.k * 0.07) * 0.9, s = 3.3; for (const da of [0, 0.7, -0.7, 1.4, -1.4, 2.4]) { const nx = p.x + Math.cos(a + da) * s, ny = p.y + Math.sin(a + da) * s; if (wFree(W, nx, ny, 14, null) && sqFree(W.map, nx, ny)) { p.x = nx; p.y = ny; p.fl = Math.cos(a + da) < 0 ? -1 : 1; break; } } }
      if (d < 46) { p.got = 1; SFX.ok(); (W.puffs = W.puffs || []).push({ x: p.x, y: p.y - 60, t: 0, s: p.cat ? '😺' : '✨' });
        const left = q.pk.filter(z => !z.got).length; if (!left) { q.ready = true; W.msg = { t: (p.cat ? '😺 مسكت ' + q.item + '! روح ' : q.t === 'collect' ? '♻️ جمّعت كل ' + q.item + '! روح ' : '🔎 لقيت ' + p.ic + ' ' + q.item + '! روح ') + sqLi(q.gn), k: 0, c: '#7dffb0' }; }
        else W.msg = { t: p.ic + ' ' + (q.pk.length - left) + '/' + q.pk.length, k: 0, c: '#7dffb0' }; } }
    if (q.t === 'visit' && q.spot[0] === W.map && Math.hypot(q.spot[1] - W.P.x, q.spot[2] - W.P.y) < 170) { if (hr >= q.spot[5] && hr < q.spot[6]) { (W.puffs = W.puffs || []).push({ x: W.P.x, y: W.P.y - 200, t: 0, s: '📸' }); W.flash = 6; sqDone(W, q, 'صورة تجنن! ' + q.gn + ' بيفرح فيها 📸'); }
      else if (!q.warned) { q.warned = 1; W.msg = { t: '📸 الوقت مو مناسب… تعال ' + q.spot[4], k: 0, c: '#9fe8ff' }; } }
    if (q.dl && W.min > q.dl) { S.act = S.act.filter(z => z !== q); W.toast = { t: '⌛ تأخرت على ' + q.tn + '… الأكل برد والمهمة راحت', k: 0 }; SFX.move(); } } }
function sqDone(W, q, said) { const S = W.sq; S.act = S.act.filter(z => z !== q); let r = q.rw, extra = '';
  if (q.dl && W.min < q.dl - (q.dl - q.dl0) * 0.45) { r += 20; extra = ' ⚡ وصلت بسرعة +20'; }
  const tw = Math.random(); if (tw < 0.22) { const tip = sqR5(10 + Math.random() * 25); r += tip; extra += ' 😎 بخشيش +' + tip; } else if (tw < 0.32) { W.en = Math.min(100, W.en + 15); extra += ' 🌴 وعطاك تمر +15 ⚡'; }
  profAward(PROF.cur, r); S.n++; S.earn += r; W.toast = { t: '📌 ' + (said || 'خلصت المهمة') + '  +' + r + ' 🪙' + extra, k: 0 }; SFX.ready(); (W.puffs = W.puffs || []).push({ x: W.P.x, y: W.P.y - 210, t: 0, s: '🪙' });
  // sometimes the same person has another job right away
  const g = sqNpc(W, q.g); if (g && Math.random() < 0.18 && S.off.length < 2 && S.act.length < 3 && q.t !== 'fight') { const q2 = sqBrain(W, g); if (q2) { q2.lines[0] = 'ترى عندي طلب ثاني إذا فاضي… ' + q2.lines[0].replace(/^[^…!]*[…!]\s*/, ''); S.off.push({ q: q2, exp: W.min + 240 }); } }
  worldSave(); }
// ---- talking: offers, hand-ins, reminders
function sqTalk(W, n) { const S = W.sq; if (!S || n.cid == null) return false;
  const face = () => { n.dir = wDirOf(W.P.x - n.x, W.P.y - n.y, n.dir); n.face = W.P.x >= n.x ? 1 : -1; W.P.face = n.x >= W.P.x ? 1 : -1; SFX.move(); };
  const hand = S.act.find(q => q.hand === n.cid && q.ready);
  if (hand) { const said = hand.t === 'deliver' ? 'وصّلت ' + hand.ic + ' ' + hand.need + ' ' + sqLi(hand.gn) : hand.t === 'courier' || hand.t === 'rush' ? 'الطرد وصل ' + sqLi(n.dname) : hand.t === 'collect' ? 'جمّعت كل ' + hand.item + ' ♻️' : 'رجّعت ' + hand.item + ' ' + sqLi(hand.gn);
    W.dlg = { n, lines: [hand.t === 'courier' || hand.t === 'rush' ? 'هذا من ' + hand.gn + '؟ مشكور! 📦 ' + sqPick(SQ_THX) : sqPick(SQ_THX) + ' هذا اللي كنت أبيه!'], i: 0, k: 0, opt: 0, opts: [['👋 العفو', 'bye']] }; face(); sqDone(W, hand, said); return true; }
  const o = S.off.find(o => o.q.g === n.cid);
  if (o) { W.dlg = { n, lines: o.q.lines.slice(), i: 0, k: 0, opt: 0, opts: [['✅ أبشر', () => sqAccept(W, o)], ['❌ مو الحين', () => { W.dlg = null; S.off = S.off.filter(z => z !== o); SFX.move(); }]] }; face(); return true; }
  const mine = S.act.find(q => q.g === n.cid);
  if (mine) { W.dlg = { n, lines: ['هاه؟ ' + sqGoal(W, mine) + '… لا تنساني 😅'], i: 0, k: 0, opt: 0, opts: [['👍 جاي', 'bye'], ['🏳️ ألغِ المهمة', () => { W.dlg = null; S.act = S.act.filter(z => z !== mine); W.msg = { t: '🏳️ لغيت المهمة', k: 0, c: '#ffb070' }; SFX.move(); worldSave(); }]] }; face(); return true; }
  return false; }
function sqAccept(W, o) { const S = W.sq; W.dlg = null; S.off = S.off.filter(z => z !== o); if (S.act.length >= 3) { W.msg = { t: 'عندك ٣ مهام… خلّص وحدة أول 📌', k: 0, c: '#ffb070' }; return; }
  const q = o.q; if (q.dl) { const span = q.dl - q.dl0; q.dl0 = W.min; q.dl = W.min + span; }
  S.act.push(q); W.msg = { t: '📌 مهمة جديدة: ' + sqGoal(W, q), k: 0, c: '#9fe8ff' }; SFX.ok(); worldSave(); }
// the gang: a message to pass on, or a fight to win
function sqTalkGang(W, n) { const S = W.sq; if (!S) return false; const q = S.act.find(q => q.t === 'chat' && q.tci === n.ci); if (!q) return false;
  W.dlg = { n, lines: [sqPick(['أوكي أوكي… قل له وصلت 👍', 'هههه ماشي… بلّغه إني جاي!', 'تمام… مشكور إنك بلغتني.'])], i: 0, k: 0, opt: 0, opts: [['🥊 تحدّاه', 'fight'], ['👋 مع السلامة', 'bye']] };
  n.dir = wDirOf(W.P.x - n.x, W.P.y - n.y, n.dir); n.face = W.P.x >= n.x ? 1 : -1; W.P.face = n.x >= W.P.x ? 1 : -1; sqDone(W, q, 'بلّغت ' + q.tn); return true; }
function sqFight(W, n, win) { const S = W.sq; if (!S || !n || !win) return; const q = S.act.find(q => q.t === 'fight' && q.tci === n.ci); if (q) sqDone(W, q, 'أدّبت ' + q.tn + '! ' + q.gn + ' كسب الرهان'); }
// a bought snack goes in the bag when someone is waiting for it
function sqCarry(W, it, price) { const S = W.sq; if (!S) return false; const q = S.act.find(q => q.t === 'deliver' && !q.ready && q.need === it[1]); if (!q) return false;
  const P0 = profCur(); P0.coins -= price; profSave(); W.menu = null; q.ready = true; W.msg = { t: '🛍️ أخذت ' + it[0] + ' ' + it[1] + ' — وصّله ' + sqLi(q.gn) + ' (' + WMAPS[q.gm].name + ')', k: 0, c: '#9fe8ff' }; SFX.ok(); worldSave(); return true; }
// ---- what to do next, in a few words
function sqGoal(W, q) { const mp = m => (WMAPS[m] || {}).name || '؟', g = sqNpc(W, q.g), gm = g ? mp(g.map) : '', T = q.hand != null && q.hand !== q.g ? sqNpc(W, q.hand) : null;
  switch (q.t) {
    case 'deliver': return q.ready ? 'وصّل ' + q.ic + ' ' + q.need + ' ' + sqLi(q.gn) + ' (' + gm + ')' : 'اشترِ ' + q.ic + ' ' + q.need + ' من ' + q.where;
    case 'lost': return q.ready ? 'رجّع ' + q.item + ' ' + sqLi(q.gn) + ' (' + gm + ')' : 'دوّر ' + q.pk[0].ic + ' ' + q.item.replace(/ي$/, '') + ' في ' + mp(q.pk[0].m);
    case 'cat': return q.ready ? 'رجّع ' + q.item + ' ' + sqLi(q.gn) + ' (' + gm + ')' : 'امسك ' + q.item + ' في ' + mp(q.pk[0].m) + ' 🐈';
    case 'collect': { const n = q.pk.filter(p => p.got).length; return q.ready ? 'رجع ' + sqLi(q.gn) + ' (' + gm + ')' : 'جمّع ' + q.item + ' ' + n + '/' + q.pk.length + ' في ' + mp(q.pk[0].m); }
    case 'courier': return 'وصّل الطرد ' + sqLi(q.tn) + ' (' + (T ? mp(T.map) : '') + ')';
    case 'rush': { const left = Math.max(0, q.dl - W.min); return 'وصّل الأكل ' + sqLi(q.tn) + ' (' + (T ? mp(T.map) : '') + ') ⏱️ ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'); }
    case 'fight': { const T2 = sqGang(W, q.tci); return 'اغلب ' + q.tn + (T2 ? ' (' + mp(T2.map) + ')' : ''); }
    case 'chat': { const T2 = sqGang(W, q.tci); return 'بلّغ ' + q.tn + (T2 ? ' (' + mp(T2.map) + ')' : ''); }
    case 'visit': return 'صوّر ' + q.spot[3] + ' ' + q.spot[4];
  } return ''; }
// where the next step is on this map (for the arrow)
function sqMark(W) { for (const q of W.sq ? W.sq.act : []) { let t = null;
    if (q.pk && !q.ready) { const p = q.pk.find(p => !p.got && p.m === W.map); if (p) t = [p.x, p.y]; }
    else if (q.t === 'visit') { if (q.spot[0] === W.map) t = [q.spot[1], q.spot[2]]; }
    else if (q.t === 'fight' || q.t === 'chat') { const n = sqGang(W, q.tci); if (n && n.map === W.map) t = [n.x, n.y]; }
    else if (q.ready && q.hand != null) { const n = sqNpc(W, q.hand); if (n && n.map === W.map) t = [n.x, n.y]; }
    if (t) return { x: t[0], y: t[1] }; } return null; }
function sqMapCount(W, id) { let c = 0; for (const q of W.sq ? W.sq.act : []) { let m = null;
    if (q.pk && !q.ready) { const p = q.pk.find(p => !p.got); m = p && p.m; } else if (q.t === 'visit') m = q.spot[0]; else if (q.t === 'fight' || q.t === 'chat') { const n = sqGang(W, q.tci); m = n && n.map; } else if (q.ready && q.hand != null) { const n = sqNpc(W, q.hand); m = n && n.map; }
    if (m === id) c++; } for (const o of W.sq ? W.sq.off : []) { const n = sqNpc(W, o.q.g); if (n && n.map === id) c++; } return c; }
// ---- drawing: things on the ground (sorted with everything else), and the marks over people's heads
function sqSortList(W, L) { if (!W.sq) return; for (const q of W.sq.act) if (q.pk && !q.ready) for (const p of q.pk) if (!p.got && p.m === W.map) L.push([p.y, () => sqDrawPk(p, q)]); }
function sqDrawPk(p, q) { const b = Math.sin(G.frame * 0.1 + p.x) * 4; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.cat ? 26 : 18, 6, 0, 0, 7); ctx.fill();
  if (!p.cat) { const a = 0.35 + 0.25 * Math.sin(G.frame * 0.12); ctx.fillStyle = `rgba(255,240,150,${a})`; ctx.beginPath(); ctx.arc(p.x, p.y - 18, 26, 0, 7); ctx.fill(); }
  ctx.translate(p.x, p.y - (p.cat ? 24 : 20) + (p.cat ? Math.abs(b) * -0.5 : b)); if (p.cat && p.fl < 0) ctx.scale(-1, 1); txt(p.ic, 0, 0, { size: p.cat ? 46 : 32, rtl: false }); ctx.restore(); }
function sqDrawWorld(W) { const S = W.sq; if (!S) return; const bob = Math.sin(G.frame * 0.1) * 5;
  const mark = (n, s, bg) => { const x = n.x, y = n.y - 262 + bob; ctx.save(); ctx.fillStyle = bg; ctx.strokeStyle = '#1a1200'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 20, 0, 7); ctx.fill(); ctx.stroke(); txt(s, x, y + 1, { size: 24, weight: 900, color: '#1a1200', rtl: false }); ctx.restore(); };
  for (const o of S.off) { const n = sqNpc(W, o.q.g); if (n && n.map === W.map) mark(n, '!', '#ffd34d'); }
  for (const q of S.act) { if (q.ready && q.hand != null) { const n = sqNpc(W, q.hand); if (n && n.map === W.map) mark(n, q.hand === q.g ? '✓' : '📦', '#7dffb0'); }
    if (q.t === 'fight' || q.t === 'chat') { const n = sqGang(W, q.tci); if (n && n.map === W.map) mark(n, q.t === 'fight' ? '🥊' : '💬', '#9fe8ff'); }
    if (q.t === 'visit' && q.spot[0] === W.map) { const a = 0.3 + 0.2 * Math.sin(G.frame * 0.1); ctx.save(); ctx.strokeStyle = `rgba(159,232,255,${a + 0.3})`; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.ellipse(q.spot[1], q.spot[2], 150, 60, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); txt('📸', q.spot[1], q.spot[2] - 40 + bob, { size: 40, rtl: false }); ctx.restore(); }
    if (q.pk && !q.ready) for (const p of q.pk) if (!p.got && p.m === W.map && !p.cat) txt('✨', p.x + 16, p.y - 64 + bob, { size: 20, rtl: false }); } }

// ================= «حرب الخالين» — the family story, played inside the open world =================
// 5 parts · 25 chapters. You pick your fighter, then you live the story as the uncles' nephew: cinematic talks
// (portrait + recorded voice + typed text), places to reach, things to find, people to talk to, story fights,
// escapes from falling buildings and one choice. ملالي is الزعيم who chose the dark.
// ---- the script. who: 'N' narrator · 'P' you · '?' unknown voice · 'jadd' grandfather · or a role. {P} = your name, {role} = that role's name
const SG_PARTS = [['الجزء الأول', 'ميثاق العائلة وحرب الخيانة', '#ffd34d'], ['الجزء الثاني', 'الناجون وبطولة الملوك', '#3cb4ff'], ['الجزء الثالث', 'الحرب الأخيرة الأولى', '#ff3b4a'], ['الجزء الرابع', 'انتقام ملالي', '#b030ff'], ['الجزء الخامس والأخير', 'الملك الأخير', '#ffd34d']];
const SG_ORD = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون', 'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون', 'الرابع والعشرون', 'الخامس والعشرون'];
const SG_IDLE = { adel: 'البحر علّمني الصبر… والعرش علّمني الطمع.', salah: 'أخوي… ولو صار اللي صار.', malali: '…الظلام يسمع كل شي.', inv: 'لا تلمس شي في عدّتي!', dragon: 'أدوّر على خصم يستاهل.', chef: 'جوعان؟ كل شي بوقته.', captain: 'خلك جاهز… أي لحظة نتحرك.', moalem: 'التدريب… هو السر.', bull: 'أي باب تبيه ينكسر؟', dajaj: 'كاك كاك! 🐔', teer: 'سيارتي جاهزة دايم.', gamer: 'لحظة… أخلص الجولة.', abd: 'الحرية… تستاهل القتال.', guard: 'محد يعدّي من هني!' };
const SAGA = [
  // ======================= الجزء الأول =======================
  { part: 0, n: 'مملكة الظلال', coins: 40, place: { adel: ['diwan', 560, 360, 'down'], salah: ['diwan', 840, 360, 'down'], malali: ['diwan', 1180, 330, 'left'] }, steps: [
    { say: [['N', 'في مدينة اسمها مملكة الظلال… عاشت عائلة كبيرة، مشهورة بشجاعة رجالها.'], ['N', 'وكان فيها خالين ما يشبهون بعض… الخال عادل، أكبرهم، طموح وذكي وداهية.'], ['N', 'والخال صلاح… مقاتل قوي، ما يهاب أي مواجهة.'], ['N', 'ورغم خلافاتهم… الكل كان يظن إن الأخوّة أقوى من أي صراع.'], ['N', 'وأنت يا {P}… ولد أختهم. والليلة، خالك عادل يبيك في الديوانية.']] },
    { go: ['diwan', 700, 640], goal: 'روح الديوانية 🏠 — خالك عادل ينتظرك' },
    { say: [['adel', 'هلا والله بولد أختي! تعال… شوف وش لقيت.'], ['N', 'فتح عادل صندوق قديم… وطلّع منه مخطوطة صفرا ممزقة.', 'scroll'], ['adel', 'المخطوطة تقول إن في قوة مخفية… اللي يلقاها، يحكم المملكة كلها!'], ['salah', 'خلها مدفونة يا عادل. القوة اللي تفرّق الأخوان… ما نبيها.'], ['adel', 'ما تفهم يا صلاح… المملكة تحتاج واحد قوي يمسكها.'], ['N', 'وفي زاوية الديوانية… كان ملالي الغامض يسمع، ولا يقول شي.', 'eyes'], ['adel', 'يا {P}… المخطوطة ناقصة. ثلاث قطع منها ضايعة. جيبها لي!']] },
    { find: [['beach', 1500, 640, '📜'], ['pitch', 1000, 640, '📜'], ['jadd', 640, 560, '📜', [['jadd', 'هذي الورقة من أيام أبوي يا ولدي… خذها.'], ['jadd', 'بس انتبه… القوة تفرّق القلوب.']]]], goal: 'دوّر على قطع المخطوطة 📜 — الكورنيش · الملعب · بيت الجد' },
    { go: ['diwan', 700, 640], goal: 'رجّع المخطوطة لخالك عادل 🏠' },
    { say: [['adel', 'كفو عليك! خلني أركّبها…'], ['N', 'ولما اكتملت المخطوطة… لمعت حروفها بنور غريب.', 'scroll'], ['adel', 'القوة القديمة… مدفونة تحت القصر!'], ['salah', 'عادل… شوف عيونك. ما عاد تشوف غير العرش.'], ['N', 'ومن هذي الليلة… تغيّر كل شي.']] },
  ] },
  { part: 0, n: 'جيش الخيانة', coins: 40, place: { adel: ['diwan', 560, 360, 'down'], salah: ['diwan', 840, 360, 'down'], captain: ['pitch', 700, 520, 'right'], moalem: ['pitch', 900, 420, 'down'], inv: ['pitch', 1100, 520, 'left'], dragon: ['pitch', 1320, 760, 'left'], malali: ['fareej', 2320, 720, 'left'] }, steps: [
    { say: [['N', 'في الصباح… قعد عادل مع أخوه صلاح.'], ['adel', 'يا صلاح، المملكة تحتاج قائد واحد. خلنا ندوّر على القوة سوا.'], ['salah', 'سوا؟… تمام. بس نتفق: القوة للعائلة، مو لواحد.'], ['N', 'واتفقوا… لكن كل واحد فيهم كان مخبّي نيّة إنه ياخذها بروحه.'], ['adel', 'يا {P}، روح الملعب… أبيك تجمع لي أقوى المقاتلين.']] },
    { go: ['pitch', 900, 640], goal: 'روح الملعب ⚽ — اجمع المقاتلين لخالك عادل' },
    { talks: { captain: [['captain', 'الحراسة علي. أنظّم الحرس… وما يعدّي أحد إلا بإذني.']], moalem: [['moalem', 'أنا أدرّب الرجال. كل واحد فيهم… بعرف وين نقطة ضعفه.'], ['P', 'ليش تبي تعرف نقاط ضعفهم؟'], ['moalem', '…عشان نقوّيهم طبعاً. ههه.']], inv: [['inv', 'صنعت أجهزة حماية! دروع، وشاشات، وحاجات… ما تبي تعرفها.']] }, goal: 'كلّم المقاتلين في الملعب' },
    { talk: 'dragon', goal: 'كلّم {dragon} — آخر واحد باقي', say: [['dragon', 'جيش؟ أنا ما أدخل جيش أحد… أنا أدوّر على خصم يستاهل.'], ['P', 'خصم يستاهل؟ أنا قدامك.'], ['dragon', 'ههه… إذا غلبتني، أمشي معك لآخر الدنيا. يلا!']] },
    { fight: 'dragon', stage: 'pitch', lvl: 1, hp: 1, win: [['dragon', 'والله إنك تستاهل… أنا معكم.']], lose: [['dragon', 'لسّا بدري عليك… تعال لي إذا قويت.']] },
    { say: [['N', 'وانتشرت الإشاعات في المملكة…'], ['N', 'الخالين يبون يحمون العائلة؟… ولا يبون يسيطرون عليها؟'], ['malali', 'الوعود… كلام. وأنا ما أصدّق الكلام.'], ['N', 'ملالي ما وثق بأحد… بس بقى يراقب، بصمت.', 'eyes']] },
  ] },
  { part: 0, n: 'ليلة القصر', coins: 40, place: { adel: ['qasr', 1000, 380, 'down'], salah: ['qasr', 1180, 1040, 'up'], chef: ['qasr', 480, 600, 'left'], dajaj: ['qasr', 1520, 600, 'right'], dragon: ['qasr', 760, 560, 'right'], bull: ['qasr', 1240, 560, 'left'], captain: ['qasr', 760, 880, 'right'], moalem: ['qasr', 1240, 880, 'left'], malali: ['qasr', 1800, 330, 'left'], inv: ['qasr', 300, 300, 'right'], gamer: ['qasr', 1700, 960, 'left'] }, steps: [
    { unlock: 'qasr', say: [['N', 'دعا عادل العائلة كلها… لاحتفال كبير، احتفال الصلح.'], ['adel', 'يا {P}، الليلة نتصالح كلنا. تعال القصر… ولا تتأخر!']] },
    { go: ['qasr', 1000, 760], goal: 'روح القصر 🏰 — احتفال الصلح' },
    { talks: { chef: [['chef', 'الوليمة جاهزة! كبسة، ومندي، وهريس… كُل يا ولد!']], dajaj: [['dajaj', 'شوف شوف! هذي رقصة الدجاجة… كاك كاك كااااك!'], ['P', 'ههههه… الله يهديك!']] }, en: { chef: 50 }, goal: 'سلّم على الحضور: {chef} و{dajaj}' },
    { say: [['N', 'وفجأة… انقفلت الأبواب، وانطفت الأنوار!', 'dark'], ['N', 'ولما رجع النور… كان صلاح واقف عند المدخل.'], ['dragon', 'من هالليلة… محد بيحكم المملكة إلا اللي عنده القوة!'], ['captain', 'وقفوا! لا أحد يتحرك!'], ['N', 'بس المقاتلين انقسموا… وهجم {bull} على أول واحد قدامه… وكان أنت!', 'hit']] },
    { fight: 'bull', stage: 'palace', lvl: 1.25, hp: 1.05, win: [['bull', 'آخ… خلاص خلاص، أنا معك!']], lose: [['bull', 'قلت لك… ما يوقّفني شي!']] },
    { say: [['N', 'وفي وسط الفوضى… شاف ملالي رجال عادل يتهامسون.', 'eyes'], ['N', 'كانوا يجهّزون نفسهم… عشان يتخلّصون من حلفائهم بعد الفوز.'], ['malali', 'إذن هذي البداية… الخيانة بدت تاكل أصحابها.']] },
  ] },
  { part: 0, n: 'بطولة المقاتلين', coins: 50, place: { moalem: ['halba', 900, 470, 'down'], bull: ['halba', 680, 560, 'right'], teer: ['halba', 1120, 560, 'left'], dajaj: ['halba', 680, 760, 'right'], chef: ['halba', 1120, 760, 'left'], dragon: ['halba', 420, 1040, 'right'], abd: ['halba', 560, 1080, 'up'], gamer: ['halba', 1240, 1080, 'up'], inv: ['halba', 1380, 1040, 'left'], captain: ['halba', 380, 300, 'down'], salah: ['halba', 1420, 300, 'down'], malali: ['halba', 1380, 460, 'left'] }, steps: [
    { unlock: 'halba', say: [['N', 'بعد ليلة القصر… أعلن {moalem} عن بطولة، عشان يعرفون منو أقوى مقاتل.'], ['moalem', 'البطولة في الحلبة! واللي ما يجي… يعتبر خسران.']] },
    { go: ['halba', 900, 960], goal: 'روح الحلبة 🥊 — البطولة بتبدأ' },
    { say: [['moalem', 'القرعة طلعت! انتبهوا للمباريات…'], ['N', '{bull} ضد {teer}… صراع عنيف!', ['vs', 'bull', 'teer']], ['N', '{dajaj} ضد {chef}… مواجهة تضحّك!', ['vs', 'dajaj', 'chef']], ['N', '{dragon} ضد {abd}… و{gamer} يتحدّى المخترع.', ['vs', 'dragon', 'abd']], ['N', 'و{captain} ضد {moalem}.', ['vs', 'captain', 'moalem']], ['moalem', 'وأنت يا {P}… خصمك اللي يفوز من {bull} و{teer}!'], ['N', 'وفاز {teer}… بسيارته اللي ما ترحم.']] },
    { fight: 'teer', stage: 'arena', lvl: 1.5, hp: 1.1, win: [['teer', 'سيارتي انكسرت… بس أنت تستاهل!']], lose: [['teer', 'سيارتي أسرع منك!']] },
    { place: { adel: ['halba', 900, 760, 'up'] }, say: [['N', 'أما المواجهة اللي الكل ينتظرها… ملالي ضد صلاح!', ['vs', 'malali', 'salah']], ['N', 'تحرّك ملالي بسرعة ما تنصدّق… بس وقّف ضربته الأخيرة.', 'dash'], ['malali', 'عدونا الحقيقي… مو اللي واقف قدامنا في الحلبة.'], ['N', 'وفي نهاية البطولة… دخل عادل الحلبة بنفسه.'], ['adel', 'خلصنا لعب. العرش لي… حتى لو خسرت أخوي!'], ['salah', 'عادل؟!'], ['P', 'خالي… لا تسويها! ما بخليك تأذي خالي صلاح.'], ['adel', 'حتى أنت يا ولد أختي؟ تعال إذن… وشوف قوة البحر!']] },
    { fight: 'adel', stage: 'port', lvl: 1.8, hp: 1.12, dmg: 1.1, boss: 1, win: [['adel', '…تعلمت زين يا ولد أختي. بس هذي مو النهاية.']], lose: [['adel', 'البحر ما يرحم… ارجع لي لما تقوى.']] },
  ] },
  { part: 0, n: 'الانفجار الأول', coins: 120, place: { adel: ['qasr', 880, 520, 'right'], salah: ['qasr', 1120, 520, 'left'], inv: ['qasr', 1000, 680, 'up'], malali: ['qasr', 1500, 420, 'left'], captain: ['qasr', 720, 860, 'up'], dragon: ['qasr', 1280, 860, 'up'] }, steps: [
    { say: [['N', 'رجع الكل للقصر… والجو مشحون.']] },
    { go: ['qasr', 1000, 920], goal: 'ارجع القصر 🏰 — الخالين بيتواجهون' },
    { say: [['salah', 'كنت أعرف إنك بتخونّي يا عادل.'], ['adel', 'وأنت؟ كنت مجرد طريق… للعرش.'], ['N', 'وفجأة… دخل المخترع، ومعه آلة ضخمة!', 'machine'], ['inv', 'لا تخافون! آلتي… تحمي المملكة!'], ['N', 'بس الكل شاف الحقيقة… الآلة قادرة تدمّر كل شي.'], ['malali', 'أنا أعرف وين مكان القوة القديمة…'], ['N', 'وانطفت الأنوار… واهتز القصر بانفجار رهيب!', 'boom']] },
    { escape: ['qasr', [1000, 420], [1000, 1150]], time: 30, goal: 'القصر ينهار! اطلع قبل لا يطيح عليك ⏱️' },
    { place: { adel: null, salah: null, malali: null, inv: null, dragon: null, captain: ['fareej', 1320, 760, 'left'] }, say: [['N', 'تطاير الغبار… وانهارت الجدران.', 'quake'], ['N', 'ولما هدأ كل شي… عادل وصلاح وملالي، اختفوا!'], ['captain', 'وين راحوا؟! دوّروا عليهم!'], ['N', 'وطلع الناجين يتساءلون… هل انتهت الحرب؟ ولا هي توها بدت؟']] },
  ] },
  // ======================= الجزء الثاني =======================
  { part: 1, n: 'رسالة من تحت الرماد', coins: 30, place: { captain: ['diwan', 700, 360, 'down'], gamer: ['diwan', 520, 380, 'down'], bull: ['diwan', 880, 380, 'down'], dajaj: ['diwan', 300, 620, 'right'], chef: ['diwan', 1100, 620, 'left'], teer: ['diwan', 300, 380, 'right'], abd: ['diwan', 1100, 380, 'left'], moalem: ['diwan', 1090, 780, 'left'], inv: ['diwan', 300, 780, 'right'] }, steps: [
    { say: [['N', 'بعد ثلاث أيام…'], ['N', 'وصل تسجيل… لتلفونات كل العائلة.', 'phone'], ['adel', 'أنا حي… والبطولة الحقيقية تبدأ الحين.'], ['N', 'ووراه… ظهر صلاح، مربوط بالسلاسل!', 'chains'], ['P', 'خالي صلاح!']] },
    { go: ['diwan', 700, 640], goal: 'روح الديوانية 🏠 — الناجين مجتمعين' },
    { say: [['gamer', 'حللت التسجيل… عادل حابس صلاح في قاعدة سرية!'], ['bull', 'وليش نساعد صلاح؟ يمكن يرجع لخيانته القديمة!'], ['captain', 'لا. ما نترك أحد في الأسر… مهما غلط.'], ['P', 'وأنا معك. صلاح خالي… وبرجّعه.']] },
  ] },
  { part: 1, n: 'خطة الإنقاذ', coins: 40, place: { captain: ['diwan', 700, 360, 'down'], moalem: ['diwan', 880, 380, 'down'], dajaj: ['diwan', 520, 380, 'down'], teer: ['diwan', 300, 600, 'right'], abd: ['diwan', 1100, 600, 'left'], bull: ['diwan', 1100, 380, 'left'], inv: ['beach', 1400, 700, 'left'], chef: ['rest', 650, 380, 'down'], gamer: ['shop', 650, 620, 'down'] }, steps: [
    { say: [['captain', 'اسمعوا الخطة… {moalem} يدرّب المقاتلين، و{bull} يكسر البوابة.'], ['captain', '{dajaj} يتنكّر… عامل توصيل. و{gamer} يخترق الكاميرات.'], ['dajaj', 'توصيل؟! طلبك جاهز… بيض ودجاج وفوضى!'], ['captain', 'بس نحتاج عدّة… يا {P}، جيبها لنا.'], ['N', 'وملالي… كان غايب. ومحد يعرف إذا هو حليف… ولا عدو.']] },
    { talks: { inv: [['inv', 'خذ… بدلة واقية صنعتها بيدي. ما تخترقها ولا ضربة!'], ['P', 'مشكور… بس ليش يدك ترجف؟'], ['inv', 'ههه… من البرد. بس.']], chef: [['chef', 'قنابل دخان من مطبخي… ريحتها فلفل حار! تعمي الحرس.']], gamer: [['gamer', 'جهاز تشويش… أطفي فيه كاميرات القاعدة. لا تضيّعه!']] }, goal: 'اجمع عدّة الإنقاذ: 🛡️ المخترع (الكورنيش) · 💨 {chef} (المطعم) · 📡 {gamer} (البقالة)' },
    { go: ['diwan', 700, 640], goal: 'رجّع العدّة للديوانية 🏠' },
    { unlock: 'base', say: [['captain', 'العدّة كاملة. نتحرك… نص الليل.'], ['teer', 'وأنا أحمي الفريق بسيارتي. محد يقرّب منكم!'], ['abd', 'وأنا… أواجه {dragon}. هو الحين مع عادل.']] },
  ] },
  { part: 1, n: 'معركة القاعدة', coins: 40, place: { bull: ['base', 300, 620, 'right'], captain: ['base', 300, 760, 'right'], dajaj: ['base', 1180, 1040, 'left'], chef: ['base', 1080, 1040, 'right'], dragon: ['base', 560, 900, 'left'], abd: ['base', 440, 900, 'right'], gamer: ['base', 1220, 330, 'up'], teer: ['base', 170, 640, 'right'], salah: ['base', 2150, 320, 'down'] }, steps: [
    { go: ['base', 300, 900], goal: 'روح القاعدة السرية 🏭' },
    { say: [['N', 'نص الليل… اندفع {bull} نحو البوابة.', 'boom'], ['bull', 'وخّروا! أنا جاااي!'], ['N', 'وتسلّل {dajaj} للمطبخ… بس {chef} حسبه جاسوس!'], ['chef', 'جاسوس؟! خذ المقلاة!'], ['dajaj', 'أنا منكم يا رجّال! انتبه البيض… لا لا لا!'], ['N', 'وتطايرت القدور والصحون في كل مكان…'], ['N', 'وبرّا… وقف {dragon} قدام {abd}، وتبادلوا ضربات هزّت الأرض.', 'quake'], ['abd', '{P}! تعبت… كمّل عني!']] },
    { fight: 'dragon', stage: 'roof', lvl: 1.9, hp: 1.15, dmg: 1.1, win: [['dragon', 'قوي… أقوى من آخر مرة.']], lose: [['dragon', 'تبي تنقذ صلاح؟ اغلبني أول.']] },
    { go: ['base', 1330, 330], goal: 'روح غرفة التحكم 🖥️' },
    { say: [['gamer', 'الكاميرات طافية… لحظة! وش هذا؟'], ['gamer', 'جهاز تتبّع… مخبّى في عدّة المخترع!', 'tracker'], ['gamer', 'في واحد يراقبنا… من الداخل!'], ['captain', 'ما في وقت! الزنزانة… بسرعة!']] },
  ] },
  { part: 1, n: 'سر المعلم', coins: 40, place: { captain: ['base', 2040, 520, 'up'], gamer: ['base', 1900, 560, 'up'], salah: ['base', 2150, 320, 'down'], dragon: null, abd: ['base', 1780, 560, 'right'] }, steps: [
    { go: ['base', 2150, 520], goal: 'روح الزنزانة 🔒 — خالك صلاح هناك' },
    { place: { salah: ['base', 2250, 540, 'left'], malali: ['base', 1700, 640, 'right'], moalem: ['base', 1960, 700, 'up'] }, say: [['N', 'وصل {captain} لزنزانة صلاح… وكسر القفل.', 'chains'], ['salah', 'أخيراً… يا هلا بولد أختي!'], ['salah', 'اسمعوا… عادل أخطر مما تتصورون. بس مو هو اللي حط الخطة الأولى.'], ['N', 'وفي الممر المظلم… ظهر ملالي.', 'fog'], ['malali', 'صدق صلاح. اللي جمعكم من البداية… هو {moalem}.'], ['malali', 'كان يقيس قوتكم… عشان يصنع جيش يطيع أوامره.'], ['moalem', '…صح. درّبتكم كلكم، عشان أعرف نقاط ضعفكم. وأولها… أنت يا {P}!']] },
    { fight: 'moalem', stage: 'roof', lvl: 2, hp: 1.2, dmg: 1.08, win: [['moalem', 'مستحيل… درّبتك بيدي!'], ['P', 'ودرّبتني زين… عشان أغلبك.']], lose: [['moalem', 'قلت لك… أعرف كل نقطة ضعف فيك.']] },
    { say: [['N', 'وهرب {moalem} في الظلام…'], ['N', 'وانقسمت العائلة لثلاث أطراف…'], ['N', 'عادل يبي السلطة… وصلاح يبي الانتقام… وملالي يبي يطيّح كل المتلاعبين.']] },
  ] },
  { part: 1, n: 'انهيار الحلبة', coins: 120, place: { malali: ['halba', 900, 470, 'down'], moalem: ['halba', 1120, 560, 'left'], adel: ['halba', 680, 760, 'right'], salah: ['halba', 1120, 760, 'left'], bull: ['halba', 420, 1040, 'right'], teer: ['halba', 1380, 1040, 'left'], dragon: ['halba', 380, 300, 'down'], abd: ['halba', 1420, 300, 'down'], captain: ['halba', 560, 1080, 'up'], gamer: ['halba', 1240, 1080, 'up'] }, steps: [
    { say: [['N', 'أعلن ملالي… بطولة الملوك!'], ['malali', 'الكل يجي الحلبة. الليلة… تنكشف كل الحقايق.']] },
    { go: ['halba', 900, 960], goal: 'روح الحلبة 🥊 — بطولة الملوك' },
    { say: [['N', '{bull} ضد {teer}… و{dragon} ضد {abd} مرة ثانية.', ['vs', 'dragon', 'abd']], ['N', 'ووقف ملالي… قدام {moalem}.', ['vs', 'malali', 'moalem']], ['N', 'أما المباراة المنتظرة… عادل ضد صلاح!', ['vs', 'adel', 'salah']], ['salah', 'أنت أخوي… بس أنت اخترت تكون عدوّي.'], ['adel', 'ولو رجع الزمن… بسوي نفس الشي.'], ['P', 'خلاص! بس! أنتم اخوان!'], ['salah', 'ابعد يا ولد أختي… هذا بيني وبينه!'], ['N', 'ولما وقفت بينهم… هجم عليك صلاح، وهو معصّب.', 'hit']] },
    { fight: 'salah', stage: 'arena', lvl: 2.1, hp: 1.15, dmg: 1.1, boss: 1, win: [['salah', '…صح. ما كان لازم أضربك.']], lose: [['salah', 'قلت لك ابعد!']] },
    { say: [['N', 'وفجأة… شغّل {moalem} جهاز مدفون تحت الأرض!', 'quake'], ['moalem', 'انتهى عرضكم يا أبطال!'], ['N', 'وبدت الحلبة تنهار… والدخان يبلع المقاتلين.']] },
    { escape: ['halba', [900, 640], [900, 1150]], time: 26, goal: 'الحلبة تنهار! اطلع بسرعة ⏱️' },
    { place: { malali: null, moalem: null, adel: null, salah: null, bull: null, teer: null, dragon: null, abd: null, captain: ['fareej', 1320, 760, 'left'], gamer: ['fareej', 1060, 760, 'right'] }, say: [['N', 'وعلى شاشة الحلبة المكسورة… ظهرت جملة وحدة.', 'screen'], ['N', 'المملكة… مو آمنة.']] },
  ] },
  // ======================= الجزء الثالث =======================
  { part: 2, n: 'بعد ثلاثة أشهر', coins: 30, place: { adel: ['beach', 1300, 640, 'left'], dragon: ['beach', 1060, 600, 'right'], bull: ['beach', 1520, 600, 'left'], inv: ['beach', 1400, 760, 'up'] }, steps: [
    { say: [['N', 'مرّت ثلاث شهور… على انهيار الحلبة.'], ['N', 'نجا عادل وصلاح… واختفى ملالي، ومعه سر القوة القديمة.']] },
    { go: ['beach', 1300, 820], goal: 'روح الكورنيش 🌊 — عادل يجمع رجاله' },
    { say: [['adel', '{dragon}، و{bull}، ويا مخترع… معي، وأعطيكم نص المملكة.'], ['bull', 'نص المملكة؟! أنا موافق!'], ['inv', 'وأنا… بشرط تعطيني مختبر كبير.'], ['dragon', 'لا. أنا ما أكون تابع لأحد. أقاتل عشان القوة… مو عشان الفلوس.'], ['adel', 'إذن أنت عدوّي!'], ['dragon', 'يا {P}… أنا ماشي. إذا احتجتني، تلقاني.'], ['N', 'وفي الجانب الثاني من المدينة… كان صلاح يجمع الناجين.']] },
  ] },
  { part: 2, n: 'فريق صلاح', coins: 40, place: { salah: ['diwan', 700, 360, 'down'], captain: ['diwan', 520, 380, 'down'], gamer: ['diwan', 880, 380, 'down'], chef: ['diwan', 300, 620, 'right'], dajaj: ['diwan', 1100, 620, 'left'], teer: ['diwan', 300, 380, 'right'], abd: ['diwan', 1100, 380, 'left'] }, steps: [
    { go: ['diwan', 700, 640], goal: 'روح الديوانية 🏠 — مقر فريق صلاح' },
    { say: [['salah', 'من اليوم… {captain} قائد المقاتلين.'], ['salah', '{gamer} للتجسس، و{chef} للإمدادات، و{dajaj}… للتسلل.'], ['dajaj', 'تسلل؟ أنا؟ محد يشوفني! …إلا لما أصارخ، كاك كاك.'], ['teer', 'وأنا أحرس أبواب المقر.'], ['abd', 'وأنا أقاتل… لين آخذ حريتي.'], ['gamer', 'يا {P}، أبيك تركّب أجهزة التجسس في الفريج.']] },
    { find: [['fareej', 700, 720, '📡'], ['fareej', 1880, 720, '📡'], ['fareej', 2900, 720, '📡']], goal: 'ركّب أجهزة التجسس 📡 في الفريج' },
    { go: ['diwan', 700, 640], goal: 'ارجع المقر 🏠' },
    { place: { malali: ['diwan', 1180, 330, 'left'] }, say: [['N', 'وفي ليلة ممطرة… دخل ملالي المقر.', 'rain'], ['malali', 'يا صلاح… أنت تدوّر على عادل.'], ['malali', 'بس المخترع هو اللي صنع الآلة… اللي بدت كل هذا.'], ['malali', 'استخدمكم كلكم في تجربة طويلة… و{moalem} كان يساعده.'], ['salah', 'وليش أصدّقك؟'], ['malali', 'لا تصدّقني… صدّق اللي بتشوفه.']] },
  ] },
  { part: 2, n: 'الحرب في الشوارع', coins: 40, place: { dajaj: ['fareej', 1500, 700, 'right'], dragon: ['fareej', 1640, 700, 'left'], chef: ['fareej', 2000, 760, 'left'], bull: ['fareej', 2140, 720, 'left'], malali: ['fareej', 2700, 720, 'left'], adel: ['fareej', 2580, 740, 'right'] }, steps: [
    { say: [['N', 'واشتعلت المعارك… في كل أنحاء المملكة.', 'fire']] },
    { go: ['fareej', 1850, 740], goal: 'روح الفريج 🏘️ — الحرب بدت في الشوارع' },
    { say: [['N', 'قاتل {dajaj} {dragon}… بحركات محد يتوقعها.'], ['dajaj', 'يمين! يسار! بيضة! هههه!'], ['N', 'و{chef} هرب من ضربات {bull}… بذكائه.'], ['chef', 'تبيني؟ امسكني لو تقدر… ما تقدر!'], ['bull', 'وقّف! …وين راح؟! {P}! أنت بداله!']] },
    { fight: 'bull', stage: 'hosh', lvl: 2.2, hp: 1.2, dmg: 1.12, win: [['bull', 'خلاص… تعبت. أنت أقوى مني.']], lose: [['bull', 'محد يوقّفني!']] },
    { say: [['N', 'وفي آخر الشارع… تواجه ملالي وعادل.'], ['N', 'وطيّحه ملالي… بس رفض ينهي حياته.', 'dash'], ['malali', 'لسّا قدامك فرصة… تصلّح اللي سويته.'], ['adel', '…ليش ما خلصت علي؟']] },
  ] },
  { part: 2, n: 'الخيانة الأخيرة', coins: 40, place: { inv: ['base', 1330, 320, 'down'], gamer: ['base', 1500, 360, 'left'], salah: ['base', 1200, 420, 'up'], captain: ['base', 1060, 380, 'up'], moalem: ['base', 1700, 360, 'left'], adel: null }, steps: [
    { go: ['base', 1330, 470], goal: 'روح القاعدة 🏭 — المخترع في غرفة التحكم' },
    { place: { adel: ['base', 1100, 470, 'right'] }, say: [['N', 'وبينما الكل يحتفل بالنصر… شغّل المخترع جهاز السيطرة، وقفّل أبواب القاعدة.', 'alarm'], ['inv', 'كنتم مجرد تجارب! كلكم… فيران في مختبري!'], ['gamer', 'ههه… مو بهالسرعة. زرعت برنامج يعطّل نظامك من الداخل!'], ['inv', 'مستحيل!'], ['N', 'ورجع عادل… ووقف جنب صلاح.'], ['adel', 'رغم كل شي… أنت أخوي.'], ['N', 'وفجأة هجم {moalem} على صلاح من ورا…'], ['N', 'بس عادل تدخّل… وتلقّى الضربة بداله!', 'hit'], ['adel', 'هالمرة… اخترت العائلة.'], ['salah', 'عادل! لا!'], ['P', 'بتدفع الثمن… يا {moalem}!']] },
    { fight: 'moalem', stage: 'roof', lvl: 2.4, hp: 1.25, dmg: 1.15, win: [['moalem', '…ما توقعتك تكبر بهالسرعة.']], lose: [['moalem', 'لسّاك تلميذ… وأنا المعلّم!']] },
  ] },
  { part: 2, n: 'ملك المقاتلين', coins: 150, place: { inv: ['base', 1330, 320, 'down'], salah: ['base', 1200, 420, 'up'], adel: ['base', 1100, 470, 'right'], moalem: null }, steps: [
    { say: [['N', 'عادل طايح… وصلاح يصارخ.'], ['N', 'ولبس المخترع… بدلة آلية عملاقة!', 'mech'], ['inv', 'الحين تشوفون قوة العلم الحقيقية!'], ['salah', 'يا {P}… معي! نطيّح هالآلة سوا!']] },
    { fight: 'inv', stage: 'palace2', lvl: 2.4, hp: 1.6, dmg: 1.15, mech: 1, name: 'المخترع — البدلة الآلية', win: [['inv', 'النظام… انهار… مستحيل!']], lose: [['inv', 'العلم… ما يخسر!']] },
    { say: [['N', 'قاتل صلاح بشجاعة… لين دمّر مصدر طاقة البدلة.', 'boom'], ['N', 'وحاول {moalem} يهرب… بس ملالي سكّر طريقه، وهزمه.', 'dash'], ['N', 'وانتهت الحرب… ورجع الهدوء.'], ['N', 'اعتزل عادل القتال… وصار صلاح حاكم المملكة.'], ['N', 'وفتح {chef} مطعم… و{dajaj} يحرسه، و{captain} يدرّب الجيش.'], ['adel', 'يا {P}… شكراً. لولاك، ما رجعت لأخوي.'], ['N', 'واختفى ملالي… من جديد.'], ['N', 'وبعد سنة… وصلت للقصر بطاقة سودا.', 'card'], ['N', 'مكتوب فيها: استمتعوا بالسلام… لأن الملك الحقيقي ما ظهر بعد.', 'card'], ['N', 'وتحتها توقيع… ملالي.', 'card']] },
  ] },
  // ======================= الجزء الرابع =======================
  { part: 3, n: 'اختفاء الحاكم', coins: 30, place: { adel: ['qasr', 1000, 400, 'down'], gamer: ['qasr', 820, 520, 'right'], captain: ['qasr', 1180, 520, 'left'], chef: ['qasr', 480, 600, 'left'], dajaj: ['qasr', 1520, 600, 'right'], teer: ['qasr', 760, 880, 'right'], abd: ['qasr', 1240, 880, 'left'], bull: ['qasr', 300, 300, 'right'], dragon: ['qasr', 1700, 960, 'left'] }, steps: [
    { say: [['N', 'في ليلة الاحتفال… اختفى صلاح من غرفته.', 'dark'], ['N', 'ولقى الحرس رسالة… تهدد العائلة كلها.', 'letter'], ['N', 'تطلب منهم يرجعون… لمكان الخيانة الأولى.']] },
    { go: ['qasr', 1000, 760], goal: 'روح القصر 🏰 — مكان الخيانة الأولى' },
    { unlock: 'qalaa', say: [['adel', 'هالمرة نحارب… عشان أخونا، مو عشان العرش.'], ['gamer', 'لقيت شي! ملالي بنى قلعة بعيدة…'], ['gamer', 'والمخترع و{moalem}… رجعوا يشتغلون فيها!'], ['adel', 'قلعة ملالي… يا {P}، استعد. الحرب الحقيقية جاية.']] },
  ] },
  { part: 3, n: 'الجاسوس', coins: 40, place: { adel: ['diwan', 700, 360, 'down'], captain: ['diwan', 520, 380, 'down'], chef: ['diwan', 880, 380, 'down'], abd: ['diwan', 1100, 420, 'left'], gamer: ['diwan', 300, 420, 'right'], bull: ['diwan', 300, 640, 'right'], dajaj: ['diwan', 1100, 640, 'left'] }, steps: [
    { go: ['diwan', 700, 640], goal: 'روح الديوانية 🏠 — اجتماع العائلة' },
    { say: [['N', 'انتشرت الشكوك داخل الفريق…'], ['bull', 'في واحد فينا يوصّل أخبارنا لملالي!'], ['dajaj', 'أكيد {captain}! دايم ساكت… والساكتين خطيرين!'], ['captain', 'أنا؟! يمكن {chef}… طبخه كله أسرار!'], ['adel', 'يا {P}… أنت شفت الكل. منو الجاسوس برأيك؟']] },
    { choice: ['captain', 'chef', 'abd'], right: 'abd', q: 'منو الجاسوس؟ 🕵️', no: [['gamer', 'لا… مو {X}. شوفوا هالرسايل!']], yes: [['gamer', 'صح كلامك! وهذا الدليل…']], after: [['gamer', '{abd} كان يرسل رسايل لملالي!', 'phone'], ['abd', '…صح. ملالي وعدني يكشف لي ماضيي. ما كنت أبي أأذي أحد.'], ['adel', 'ما بعاقبك يا {abd}.'], ['adel', 'بس أثبت ولاءك… ساعدنا ننقذ صلاح.'], ['abd', 'تبي تتأكد مني يا {P}؟ تعال نتقاتل… والقلب يبين!']] },
    { fight: 'abd', stage: 'port', lvl: 2.3, hp: 1.15, win: [['abd', 'قلبي معكم… وهذا وعد.']], lose: [['abd', 'المرة الجاية… تشوف إني صادق.']] },
    { say: [['N', 'ووافق {abd}… وطلع مع {captain} في مهمة سرية.']] },
  ] },
  { part: 3, n: 'بطولة الانتقام', coins: 40, place: { malali: ['qalaa', 1000, 330, 'down'], adel: ['qalaa', 1520, 860, 'right'], dragon: ['qalaa', 1680, 860, 'left'], bull: ['qalaa', 1500, 1040, 'right'], teer: ['qalaa', 1700, 1040, 'left'], guard: ['qalaa', 330, 620, 'down'], salah: ['qalaa', 300, 380, 'down'], captain: ['qalaa', 760, 1300, 'up'], abd: ['qalaa', 1240, 1300, 'up'] }, steps: [
    { say: [['N', 'فرض ملالي بطولة جديدة… في قلعته.'], ['malali', 'عادل ضد {dragon}… و{bull} ضد {teer}… و{gamer} ضد المخترع.', ['vs', 'adel', 'dragon']], ['malali', 'وأنا… ضد {moalem}.', ['vs', 'malali', 'moalem']], ['N', 'بس المواجهات كانت فخ… عشان يشغلون المقاتلين.'], ['captain', 'يا {P}، تعال معنا. نتسلل للسجن… الحين!']] },
    { go: ['qalaa', 1000, 1300], goal: 'روح قلعة ملالي 🏯' },
    { go: ['qalaa', 450, 720], goal: 'تسلّل لسجن القلعة 🔒 (يسار القلعة)' },
    { say: [['guard', 'وقّف! محد يعدّي من هني… أوامر ملالي!'], ['P', 'خالي ورا هالباب… ولازم أعدّي.']] },
    { fight: 'guard', stage: 'dark', lvl: 2.3, hp: 1.2, name: 'حارس السجن', win: [['guard', '…عدّ. بس لا تقول لملالي!']], lose: [['guard', 'قلت لك… محد يعدّي!']] },
    { place: { guard: null, captain: ['qalaa', 220, 560, 'up'], abd: ['qalaa', 420, 560, 'up'] }, go: ['qalaa', 300, 560], goal: 'افتح زنزانة صلاح 🔓' },
    { place: { salah: ['qalaa', 320, 620, 'down'] }, say: [['N', 'فتح {captain} و{abd} باب الزنزانة…', 'chains'], ['salah', 'تأخرتوا علي! ههه… يلا، للعرش!']] },
  ] },
  { part: 3, n: 'مواجهة ملالي', coins: 60, place: { malali: ['qalaa', 1000, 330, 'down'], adel: ['qalaa', 900, 640, 'up'], salah: ['qalaa', 1100, 640, 'up'], dragon: ['qalaa', 1260, 700, 'left'], captain: ['qalaa', 760, 760, 'up'], abd: ['qalaa', 1240, 860, 'up'], bull: null, teer: null, guard: null }, steps: [
    { go: ['qalaa', 1000, 700], goal: 'روح قاعة العرش 👑 — ملالي ينتظر' },
    { say: [['N', 'ووقف عادل وصلاح… قدام ملالي.', 'fog'], ['malali', 'أنتم… سبب كل اللي صرت عليه.'], ['salah', 'غلطنا… بس أنت اخترت الانتقام.'], ['malali', 'والحين… تذوقون الظلام.'], ['adel', '{P}! هو قوي… بس إحنا أقوى سوا!']] },
    { fight: 'malali', stage: 'dark', lvl: 2.6, hp: 1.3, dmg: 1.12, boss: 1, name: 'ملالي', win: [['malali', '…ما توقعتها. بس الظلام ما ينتهي.']], lose: [['malali', 'الظلام… أقوى منك.']] },
    { say: [['N', 'وفجأة… تدخّل {dragon}.'], ['dragon', 'خلاص يا ملالي! ما أكمّل في خدمتك.'], ['malali', 'حتى أنت؟… مثلهم كلهم.'], ['malali', 'تدرون ليش؟ أنا كنت من العائلة… بس الكل تخلّى عني!'], ['adel', 'ملالي… اللي صار ذيك الليلة، كان…'], ['N', 'وقبل لا يكمّل عادل… انهارت القلعة!', 'quake']] },
    { escape: ['qalaa', [1000, 420], [1000, 1400]], time: 30, goal: 'القلعة تنهار! اطلع بسرعة ⏱️' },
    { place: { malali: null, adel: ['fareej', 1320, 760, 'left'], salah: ['fareej', 1460, 760, 'left'], dragon: null, captain: null, abd: null }, say: [['N', 'ونجا المقاتلين… بصعوبة.']] },
  ] },
  { part: 3, n: 'الصوت المجهول', coins: 100, place: {}, steps: [
    { say: [['N', 'رجع الكل للمملكة… وظنّوا إن الشر انتهى.'], ['N', 'بس في غرفة مظلمة…', 'darkroom'], ['N', 'حط شخص بطاقة ملالي… على الطاولة.', 'darkroom'], ['?', 'انتهت مهمتك يا ملالي… والحين، جا دوري.', 'darkroom'], ['N', 'محد عرف منو المتكلم…'], ['N', 'وكانت هذي الكلمات… بداية الفصل الأخير من تاريخ العائلة.']] },
  ] },
  // ======================= الجزء الخامس =======================
  { part: 4, n: 'القناع الأسود', coins: 30, place: { adel: ['qasr', 900, 420, 'down'], salah: ['qasr', 1100, 420, 'down'], chef: ['qasr', 480, 600, 'left'], dajaj: ['qasr', 1520, 600, 'right'], captain: ['qasr', 760, 880, 'right'], bull: ['qasr', 1240, 880, 'left'], gamer: ['qasr', 300, 300, 'right'], abd: ['qasr', 1700, 960, 'left'], teer: ['qasr', 1700, 330, 'left'], dragon: ['qasr', 760, 560, 'right'], inv: ['qasr', 1240, 560, 'left'] }, steps: [
    { go: ['qasr', 1000, 760], goal: 'روح القصر 🏰 — احتفال السلام' },
    { say: [['N', 'اجتمعت العائلة في القصر… للاحتفال بالسلام.'], ['chef', 'الليلة عشا ملكي! محد يطلع جوعان!'], ['N', 'وفجأة… انطفت الأنوار!', 'dark'], ['N', 'وظهر على الشاشة… رجّال بقناع أسود.', 'mask'], ['?', 'أنا اللي صنع الحروب… اللي مزّقتكم.', 'mask'], ['N', 'وشال القناع…', 'unmask'], ['moalem', 'إيه… أنا. درّبتكم عشان أعرف أسراركم.', 'unmask'], ['N', 'وجنبه… كان واقف ملالي.', 'eyes'], ['malali', 'بس أنا… ما عاد أحتاجك.'], ['moalem', 'ملالي؟! أنا اللي صنعتك!'], ['N', 'وهكذا… صارت الخيانة تاكل أصحابها، للمرة الأخيرة.']] },
  ] },
  { part: 4, n: 'آخر تحالف', coins: 40, place: { adel: ['diwan', 600, 360, 'down'], salah: ['diwan', 800, 360, 'down'], captain: ['diwan', 300, 420, 'right'], bull: ['diwan', 1100, 420, 'left'], chef: ['diwan', 300, 640, 'right'], dragon: ['diwan', 1100, 640, 'left'], abd: ['diwan', 1180, 330, 'left'], dajaj: ['diwan', 220, 330, 'right'], teer: ['diwan', 980, 760, 'up'], gamer: ['diwan', 420, 760, 'up'], inv: ['diwan', 840, 760, 'up'] }, steps: [
    { go: ['diwan', 700, 640], goal: 'روح الديوانية 🏠 — آخر تحالف' },
    { say: [['adel', 'اسمعوا كلكم…'], ['adel', 'اليوم لا خال أول ولا خال ثاني… إحنا عائلة وحدة.'], ['salah', 'وإحنا وراك يا عادل.'], ['adel', 'يا {P}… كلّم الكل، وتأكد إن كل واحد جاهز.']] },
    { talks: { captain: [['captain', 'القيادة علي. كل واحد يعرف مكانه.']], bull: [['bull', 'البوابة؟ اعتبرها طاحت!']], chef: [['chef', 'الإمدادات جاهزة… ووجبتك المفضلة بعد! كُل.']], dragon: [['dragon', 'أنا في الصف الأول. هذي المعركة… تستاهل.']], abd: [['abd', 'اخترت طريقي بنفسي… وطريقي معكم.']] }, en: { chef: 60 }, goal: 'تأكد إن الكل جاهز' },
    { say: [['N', 'وتسلّل {dajaj} للقلعة… و{teer} حرس الممرات.'], ['N', 'واشتغل {gamer} مع المخترع… عشان يعطّلون أسلحة ملالي.'], ['inv', '…أبي أصلّح غلطتي. هذا مفتاح الطوارئ، احتفظوا فيه.']] },
  ] },
  { part: 4, n: 'سقوط المعلم', coins: 40, place: { moalem: ['qalaa', 1600, 880, 'left'], dajaj: ['qalaa', 1440, 900, 'right'], bull: ['qalaa', 1000, 1300, 'up'], gamer: ['qalaa', 1260, 1100, 'up'], captain: ['qalaa', 760, 1100, 'up'] }, steps: [
    { go: ['qalaa', 1450, 1060], goal: 'روح القلعة 🏯 — آخر هجوم (القاعة اليمين)' },
    { say: [['N', 'حطّم {bull} البوابة… واندفع الكل للداخل.', 'boom'], ['N', 'وفي إحدى القاعات… تقابل {dajaj} و{moalem}.', ['vs', 'dajaj', 'moalem']], ['moalem', 'حركاتك سخيفة!'], ['dajaj', 'سخيفة؟ بس محيّرتك! كاك… كاك… هوب!'], ['N', 'ولخبطه {dajaj}… لين طيّحه على الأرض!'], ['N', 'بس رجع {moalem} وقف… وشغّل جهاز يحبس المقاتلين!', 'alarm'], ['moalem', 'محد بيطلع من هني!'], ['P', 'إلا أنا. هالمرة… النهاية لك يا {moalem}.']] },
    { fight: 'moalem', stage: 'dark', lvl: 2.7, hp: 1.35, dmg: 1.2, win: [['moalem', 'مستحيل… التلميذ… غلب المعلّم!']], lose: [['moalem', 'لسّاك تلميذي!']] },
    { say: [['gamer', 'المفتاح! المخترع خلّاه احتياط… شغّلته!', 'tracker'], ['N', 'وقفت الآلة… وطاحت كل خطط {moalem}.'], ['captain', 'قيّدوه! بيواجه عواقب أفعاله.']] },
  ] },
  { part: 4, n: 'عادل وصلاح ضد ملالي', coins: 60, place: { malali: ['qalaa', 1000, 330, 'down'], adel: ['qalaa', 860, 600, 'up'], salah: ['qalaa', 1140, 600, 'up'], moalem: null, dajaj: null, bull: null, gamer: null, captain: null }, steps: [
    { go: ['qalaa', 1000, 760], goal: 'روح قاعة العرش 👑 — المعركة الأخيرة' },
    { say: [['N', 'ووصل الخالين… لقاعة العرش.', 'fog'], ['malali', 'هذي آخر معركة… ومحد بيطلع منها منتصر.'], ['N', 'اندفع صلاح… بس ملالي تفادى ضربته، وطيّح عادل!', 'dash'], ['salah', 'ما بخسر أخوي… مرة ثانية!'], ['adel', '{P}! اضربه… وإحنا نشتّت انتباهه!']] },
    { fight: 'malali', stage: 'dark', lvl: 3, hp: 1.6, dmg: 1.2, boss: 1, final: 1, name: 'ملالي — سيد الظلام', win: [['malali', '…خلاص. انتهى.']], lose: [['malali', 'الظلام… ما ينهزم!']] },
    { say: [['N', 'تعاون الخالين… عادل شتّت انتباه ملالي، وصلاح وجّه الضربة الحاسمة.', 'boom'], ['N', 'وساد الصمت في القاعة… ومحد عاد يبي يكمّل القتال.']] },
  ] },
  { part: 4, n: 'الاعتراف والمصالحة', coins: 300, place: { malali: ['qalaa', 1000, 420, 'down'], adel: ['qalaa', 860, 600, 'up'], salah: ['qalaa', 1140, 600, 'up'] }, steps: [
    { say: [['N', 'جلس ملالي على الأرض…'], ['malali', 'كنت أبي أحس… إني واحد منكم. بس.'], ['adel', 'كان تقدر ترجع… بدون ما تدمّر حياتنا.'], ['salah', 'انتهت الحرب يا ملالي. تعال معنا.', 'hand'], ['N', 'طالع ملالي في اليد الممدودة… وبعدين مسكها.', 'hand'], ['malali', '…آسف. وأنا أتحمّل مسؤولية كل شي.']] },
    { place: { malali: ['qasr', 1000, 420, 'down'], adel: ['qasr', 860, 440, 'down'], salah: ['qasr', 1140, 440, 'down'], chef: ['qasr', 480, 600, 'left'], dajaj: ['qasr', 1520, 600, 'right'], captain: ['qasr', 760, 880, 'right'], bull: ['qasr', 1240, 880, 'left'], gamer: ['qasr', 300, 300, 'right'], abd: ['qasr', 1700, 960, 'left'], teer: ['qasr', 1700, 330, 'left'], dragon: ['qasr', 760, 560, 'right'], inv: ['qasr', 1240, 560, 'left'] }, go: ['qasr', 1000, 760], goal: 'ارجع القصر 🏰 — العائلة بتجتمع' },
    { say: [['N', 'رجعت العائلة للمملكة… وبقى صلاح حاكم، وعادل حامي لها.'], ['N', 'ورجع ملالي للعائلة… وفتح المخترع ورشته.'], ['N', 'وقاد {dragon} الحرس… ورجع {chef} لمطعمه، و{dajaj} يحرس بابه بطريقته الغريبة.'], ['N', 'ودرّب {captain} الجيش… وصار {bull} بطل القوة، و{teer} يحمي القصر.'], ['N', 'واهتم {gamer} بالتكنولوجيا… وعاش {abd} حر، يختار مستقبله بنفسه.'], ['N', 'وفي صباح مشرق… وقف عادل وصلاح وملالي، قدام الراية الجديدة.', 'banner'], ['adel', 'القوة… مو إنك تهزم الكل.'], ['salah', 'القوة… إنك تحافظ على اللي تحبهم.'], ['malali', 'والخيانة… تبدأ بكلمة. بس ممكن تهدم عائلة كاملة.'], ['adel', 'يا {P}… أنت اللي جمعتنا. هذي الراية… لك.', 'banner'], ['N', 'وارتفعت راية العائلة… وانتهت حرب الخالين أخيراً.', 'banner']] },
    { end: 1 },
  ] },
];
// ---- engine
const SG_CI = { adel: NOKH, salah: RAIS, malali: MALALI, inv: CODER, dragon: 7, chef: CHEF, captain: 2, moalem: 6, bull: 5, dajaj: 8, teer: 14, gamer: 13, abd: 12, guard: 4 };
const SG_TITLE = { adel: 'الخال عادل', salah: 'الخال صلاح', malali: 'ملالي', inv: 'المخترع' };
const SG_SUB = { adel: 'النوخذة', salah: 'الرئيس', inv: 'المبرمج', malali: 'سيد الظلام' };
const SG_COL = { adel: '#3cb4ff', salah: '#d4a640', malali: '#b030ff', inv: '#ff2a3a', P: '#3ea0ff', N: '#9fd8ff', '?': '#ff3b4a', jadd: '#ffd34d' };
const SG_STAND = [4, 9, 10, 11, 3, 1, 0];
Object.assign(VOICE_RATE, { 98: 0.78, 97: 0.86 });
function sgAll() { let A = null; try { A = JSON.parse(localStorage.getItem('shilla_saga_by')); } catch (e) { }
  if (A && typeof A === 'object') return A; A = {};   // first run: the old single save belongs to the hero you were playing
  try { const old = JSON.parse(localStorage.getItem('shilla_saga')); if (old) { let ci = 0; try { const w = JSON.parse(localStorage.getItem('shilla_world')); if (w && w.ci != null) ci = w.ci; } catch (e) { } A[ci] = old; localStorage.setItem('shilla_saga_by', JSON.stringify(A)); } } catch (e) { } return A; }
function sgPut(ci, rec) { const A = sgAll(); A[ci] = rec; try { localStorage.setItem('shilla_saga_by', JSON.stringify(A)); } catch (e) { } if (G.world) G.world.sgA = null; }
function sgHero() { const W = G.world; return W && W.P && W.P.base != null ? W.P.base : W && W.cur != null ? W.cur : 0; }
function sgLoad(ci) { return sgAll()[ci == null ? sgHero() : ci] || null; }
var SAGA_DONE = (() => { try { const o = JSON.parse(localStorage.getItem('shilla_saga')); if (o && (o.done || o.ever)) return true; } catch (e) { } return Object.values(sgAll()).some(s => s && (s.done || s.ever)); })();
function sagaUnlocked() { return SAGA_DONE; }
function sgSave(S) { if (S.done || S.ever) SAGA_DONE = true; const rec = { ch: S.ch, st: S.st, done: S.done ? 1 : 0, ever: S.ever || S.done ? 1 : 0, wd: S.wait != null ? S.wait : undefined }; sgPut(S.base != null ? S.base : sgHero(), rec); try { localStorage.setItem('shilla_saga', JSON.stringify(Object.assign({}, rec, { ever: SAGA_DONE ? 1 : 0 }))); } catch (e) { } }
function sgDue(W) { const S = W.saga, d = wDay(W); return S.wait == null || d > S.wait || (d === S.wait && wHour(W) >= 7); }
function sgCast(base, eff) { const cast = Object.assign({}, SG_CI), mine = new Set([base, eff]), used = new Set(Object.values(cast));
  for (const r in cast) if (mine.has(cast[r])) { if (r === 'malali' && !mine.has(0)) { cast[r] = 0; continue; } const s = SG_STAND.find(c => !mine.has(c) && !used.has(c)); if (s !== undefined) { cast[r] = s; used.add(s); } }
  return cast; }
function sgName(W, r) { if (r === 'P') return CHARS[W.P.ci === MALALI ? W.P.base : W.P.ci].name; if (r === 'N') return 'الراوي'; if (r === '?') return '؟؟؟'; if (r === 'jadd') return 'الجد'; return SG_TITLE[r] || CHARS[W.saga.cast[r]].name; }
function sgTok(W, s) { return s.replace(/\{(\w+)\}/g, (m, r) => sgName(W, r)); }
function sgCiOf(W, r) { return r === 'P' ? W.P.ci : r === '?' ? W.saga.cast.moalem : W.saga.cast[r]; }
function sgColOf(W, r) { return SG_COL[r] || (CHARS[sgCiOf(W, r)] || {}).color || '#ff6b6b'; }
function sgCur(S) { const C = SAGA[S.ch]; return C && C.steps[S.st]; }
// ---- placing the cast in the world (they become NPCs; the hang-out copy of the same fighter steps aside)
function sgApplyPlace(W) {
  const S = W.saga, used = new Set(); W.npcs = W.npcs.filter(n => !n.sg);
  for (const r in S.place) { const p = S.place[r]; if (!p) continue; const ci = S.cast[r], [map, x, y, dir = 'down'] = p; used.add(ci);
    const fig = S.figs[ci] || (S.figs[ci] = wMakeFig(ci, null)); if (r === 'malali') fig.shadow = true;
    W.npcs.push({ sg: r, ci, map, x, y, hx: x, hy: y, dir, d0: dir, ph: Math.random() * 6, wait: 1e9, tx: null, ty: null, fig, face: dir === 'left' ? -1 : 1, dname: sgName(W, r) }); }
  for (const n of W.npcs) if (!n.sg && !n.cit) { if (n.hmap === undefined) n.hmap = n.map; n.map = used.has(n.ci) ? '__' : n.hmap; }
}
function sgReplay(S) { S.un = new Set(); for (let c = 0; c <= S.ch && c < SAGA.length; c++) SAGA[c].steps.forEach((st, i) => { if (c < S.ch || i <= S.st) { if (st.unlock) S.un.add(st.unlock); } });
  if (S.done) { S.place = {}; for (const id in WMAPS) if (WMAPS[id].lock) S.un.add(id); return; }
  S.place = Object.assign({}, SAGA[S.ch].place); SAGA[S.ch].steps.forEach((st, i) => { if (i <= S.st && st.place) Object.assign(S.place, st.place); }); }
function wMapList() { const S = G.world && G.world.saga; return Object.keys(WMAPS).filter(id => !WMAPS[id].lock || (S && S.un.has(id))); }
function wOpenMap(W) { if (W.saga && W.saga.esc) { W.msg = { t: 'ما في وقت! اهرب 🏃', k: 0, c: '#ff8080' }; SFX.move(); return; } const L = wMapList(); W.mapOpen = true; W.mapSel = Math.max(0, L.indexOf(W.map)); SFX.ok(); }
// the story's recorded voice lives in its own file (story-voices.js) and loads in the background
function storyVoices() { if (window.VOICE_STORY) { Object.assign(VOX.txt, window.VOICE_STORY); return; } if (storyVoices.s || VOX.pro) return; try { const s = document.createElement('script'); s.src = 'story-voices.js'; s.async = true; s.onerror = () => { storyVoices.fail = true; const L = VOX.waitL; VOX.waitL = null; sgSayAgain(L); }; document.head.appendChild(s); storyVoices.s = s; } catch (e) { storyVoices.fail = true; } }
function sgSayAgain(L) { try { const D = G.world && G.world.saga && G.world.saga.say; if (L && D && D.L[D.i] === L) { sgSpeak(L); const nx = D.L[D.i + 1]; if (nx && nx.text) voicePrefetch(nx.text); } } catch (e) { } }
window.__storyVoices = () => { if (window.VOICE_STORY) Object.assign(VOX.txt, window.VOICE_STORY); const L = VOX.waitL; VOX.waitL = null; sgSayAgain(L); };
setTimeout(() => { if (proVoices.fail) storyVoices(); }, 5000);
function sagaBegin(W) {
  storyVoices();
  const sv = sgLoad(W.P.base) || { ch: 0, st: 0 };
  const S = W.saga = { ch: clamp(sv.ch | 0, 0, SAGA.length - 1), st: sv.st | 0, done: !!sv.done, ever: !!(sv.ever || sv.done), base: W.P.base, cast: sgCast(W.P.base, W.P.ci), figs: {}, place: {}, un: new Set(), k: 0 };
  if (S.st >= SAGA[S.ch].steps.length) S.st = 0; S.wait = sv.wd != null && !S.done && S.st === 0 ? sv.wd : null;
  sgReplay(S); if (S.wait != null && !sgDue(W)) S.place = {}; else S.wait = null; sgApplyPlace(W);
  if (S.wait != null) { W.toast = { t: '📅 الفصل ' + SG_ORD[S.ch] + ' يوم ' + wDateStr(S.wait) + ' — نام 🛏️ لين يجي الوقت', k: 0 }; return; }
  if (S.done) { W.msg = { t: '🏆 خلصت حرب الخالين… العالم كله لك!', k: 0, c: '#ffd34d' }; return; }
  if (S.st === 0) sgCard(W); else sgStep(W, true);
}
function sagaRestart(ci) { if (ci == null) ci = sgHero(); const o = sgLoad(ci); sgPut(ci, { ch: 0, st: 0, done: 0, ever: o && (o.ever || o.done) ? 1 : 0 }); }
function sgCard(W) { const S = W.saga; S.card = { k: 0, ch: S.ch, part: S.ch === 0 || SAGA[S.ch - 1].part !== SAGA[S.ch].part }; W.dlg = null; W.menu = null; W.mapOpen = false; SFX.whoosh(1); }
function sgStep(W, resume) {
  const S = W.saga, st = sgCur(S); if (!st) { sgChapterEnd(W); return; }
  if (!resume) { if (st.place) { Object.assign(S.place, st.place); sgApplyPlace(W); } if (st.unlock) { S.un.add(st.unlock); W.msg = { t: '🗺️ مكان جديد في الخريطة: ' + WMAPS[st.unlock].name, k: 0, c: '#7dffb0' }; }
    if (st.time !== undefined) W.min = Math.floor(W.min / 1440) * 1440 + Math.round(st.time * 60); if (typeof st.en === 'number') W.en = Math.min(100, W.en + st.en); }
  S.items = null; S.esc = null; S.fightLater = false; S.tdone = {};
  if (st.say && !st.talk) { sgSay(W, st.say, () => sgNext(W)); return; }
  if (st.find) { S.items = st.find.map(([map, x, y, ic, L]) => ({ map, x, y, ic, L, got: false })); return; }
  if (st.fight) { if (resume) { S.fightLater = true; sgEnsure(W, st.fight); } else sgFight(W, st); return; }
  if (st.escape) { sgEscape(W, st); return; }
  if (st.choice) { S.choice = { st, sel: 0, k: 0 }; return; }
  if (st.end) sgFinish(W);
}
function sgNext(W) { const S = W.saga; S.st++; sgSave(S); if (S.st >= SAGA[S.ch].steps.length) sgChapterEnd(W); else sgStep(W); }
function sgChapterEnd(W) { const S = W.saga, C = SAGA[S.ch]; if (C.coins) profAward(PROF.cur, C.coins);
  if (S.ch >= SAGA.length - 1) { sgFinish(W); return; }
  const gap = SAGA[S.ch + 1].part !== C.part ? 2 : 1; S.ch++; S.st = 0; S.wait = wDay(W) + gap; sgSave(S); S.place = {}; sgApplyPlace(W); W.msg = { t: `✅ خلص الفصل +${C.coins} 🪙`, k: 0, c: '#ffd34d' };
  W.toast = { t: '📅 الفصل الجاي ' + (gap === 1 ? 'بكرة الصبح' : 'بعد يومين') + ' (' + wDateStr(S.wait) + ') — نام 🛏️ أو العب لين يجي الوقت', k: 0 }; }
function sgFinish(W) { const S = W.saga; if (S.done) return; S.done = true; S.ever = true; sgSave(S); SAGA_DONE = true; profAward(PROF.cur, SAGA[SAGA.length - 1].coins || 0);
  S.place = {}; sgApplyPlace(W); S.credits = { k: 0 }; SFX.ready(); }
function sgEnsure(W, r) { const S = W.saga; if (S.place[r]) return; const P = W.P; let at = [P.x + 150, P.y];
  for (const [dx, dy] of [[150, 0], [-150, 0], [0, 130], [0, -130], [210, 90]]) { if (wFree(W, P.x + dx, P.y + dy, WD.R, null)) { at = [P.x + dx, P.y + dy]; break; } }
  S.place[r] = [W.map, at[0], at[1], at[0] > P.x ? 'left' : 'right']; sgApplyPlace(W); }
// ---- cinematic talk: portraits, name plates, typed text and the recorded voice
function sgLine(W, [who, text, fx]) { return { who, text: sgTok(W, text), fx, name: sgName(W, who), sub: SG_SUB[who] || '', col: sgColOf(W, who), vo: who === 'N' ? 99 : who === '?' ? 98 : who === 'jadd' ? 97 : sgCiOf(W, who) }; }
function sgSay(W, L, done) { const S = W.saga; W.dlg = null; W.menu = null; W.mapOpen = false; if (!L || !L.length) { done && done(); return; }
  S.say = { L: L.map(l => sgLine(W, l)), i: 0, k: 0, t: 0, done, slots: [null, null] }; sgLineStart(W); }
function sgLineStart(W) { const S = W.saga, D = S.say, L = D.L[D.i]; D.k = 0; D.t = 0;
  if (L.who !== 'N') { const s = D.slots; if (s[0] !== L.who && s[1] !== L.who) { if (L.who === 'P') s[0] = 'P'; else if (!s[1]) s[1] = L.who; else if (!s[0]) s[0] = L.who; else if (s[0] === 'P') s[1] = L.who; else { s[0] = s[1]; s[1] = L.who; } } }
  const fx = Array.isArray(L.fx) ? L.fx[0] : L.fx;
  if (fx === 'boom') { SFX.thud(); SFX.rock(); W.shake = 22; } else if (fx === 'quake') { SFX.rock(); W.shake = 30; } else if (fx === 'dark') SFX.whoosh(0); else if (fx === 'dash') { SFX.whoosh(1); W.shake = 8; } else if (fx === 'hit') { SFX.thud(); W.shake = 14; }
  else if (fx === 'alarm' || fx === 'tracker' || fx === 'phone') SFX.zap(); else if (fx === 'vs') SFX.ok(); else if (fx === 'banner' || fx === 'card') SFX.ready(); else if (fx === 'fog' || fx === 'eyes' || fx === 'mask') SFX.rage();
  sgSpeak(L); const nx = D.L[D.i + 1]; if (nx && nx.text) voicePrefetch(nx.text); }
function sgSpeak(L) { if (!SET.voice || muted) return; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } voiceStop(); VOX.waitL = null;
  if (speakRec(L.text, L.vo, true)) return;
  if (!VOX.pro && !proVoices.fail) { proVoices(); VOX.waitL = L; return; }
  if (!window.VOICE_STORY && !storyVoices.fail) { storyVoices(); VOX.waitL = L; return; } const T = L.vo === 99 ? [0.95, 0.95] : ((window.VOICE_TTS && window.VOICE_TTS[L.vo]) || [1, 1]); try { speakAr(L.text, T[0], T[1]); } catch (e) { } }
function sgSayEnd(W) { const S = W.saga, D = S.say; voiceStop(); try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } S.say = null; if (D && D.done) D.done(); }
// ---- story fights
function sgFight(W, st) { const S = W.saga; worldSave(); W.dlg = null; S.fightLater = false; voiceStop();
  const oc = S.cast[st.fight]; W.sagaF = st; G.mode = 'cpu';
  G.sel = { cur: [W.P.base, oc], done: [true, true], t: 0, readyT: 0, outfit: [W.P.o, 0] };
  G.stageId = st.stage || 'arena'; G.vsName = [null, st.name || sgName(W, st.fight)]; SFX.ok(); G.toVS(); }
function sagaSetupFight(F) { const W = G.world, st = W && W.sagaF; if (!st) return; const me = F.f[0], op = F.f[1];
  me.dmgMul = 1.3; me.defMul = 0.85; me.storyBuff = true; F.pads[1].lvl = st.lvl || 1;
  if (st.hp) { op.maxHp = Math.round(op.maxHp * st.hp); op.hp = op.trailHp = op.maxHp; } if (st.dmg) op.dmgMul = st.dmg;
  op.dispName = st.name || sgName(W, st.fight);
  if (st.fight === 'malali' && op.ci !== MALALI) { op.shadow = true; op.bossAs = MALALI; }
  if (st.boss) { op.bossAI = 1; op.bossCD = 110; }
  if (st.mech) { op.mech = 1; op.R = mechRig(op.R); op.bossAI = 1; op.bossCD = 90; }
  if (st.final) F.sagaTick = sagaFinalTick; }
// the last fight: the two uncles help you when ملالي gets weaker
function sagaFinalTick(F) { if (F.phase !== 'fight' || F.fin) return; const me = F.f[0], op = F.f[1], r = op.hp / op.maxHp, d = Math.sign(op.x - me.x) || 1;
  if (!F.sgA1 && r < 0.66) { F.sgA1 = 1; SFX.whoosh(1); F.shake(10); spawnProj({ kind: 'seawave', owner: me, x: me.x - d * 380, y: -100, vx: d * 11, vy: 0, g: 0, r: 100, life: 150, big: 1, m: { dmg: 14, lvl: 'mid', hs: 24, bs: 16, push: 60, stop: 10, p: 1.5, kd: 1 } }); F.banner = { text: '🌊 الخال عادل: البحر معك!', ar: true, t: 0, dur: 70 }; }
  if (!F.sgA2 && r < 0.33) { F.sgA2 = 1; SFX.zap(); for (let i = 0; i < 3; i++) spawnProj({ kind: 'goldbar', owner: me, x: op.x + (i - 1) * 70, y: -820 - i * 140, vx: 0, vy: 10, g: 0.45, r: 32, life: 170, vr: 0.2, big: 1, m: { dmg: 7, lvl: 'high', hs: 18, bs: 10, push: 16, stop: 6, p: 1.2, kd: i === 1 ? 1 : 0 } }); F.banner = { text: '👑 الخال صلاح: خذ ذهب الرئيس!', ar: true, t: 0, dur: 70 }; } }
function sagaResult(w) { const W = G.world, st = W.sagaF, S = W.saga; W.sagaF = null; G.vsName = null; G.scene = 'world'; G.fight = null; if (AC) Music.intensity = 0; W.fade = 20; W.cam = null;
  if (w === 0) { profAward(PROF.cur, 25); W.msg = { t: '🏆 فزت! +25 🪙', k: 0, c: '#ffd34d' }; sgSay(W, st.win, () => sgNext(W)); }
  else sgSay(W, st.lose, () => { S.retry = { st, sel: 0, k: 0 }; }); }
// ---- escaping a collapsing building
function sgEscape(W, st) { const S = W.saga, [map, sp, tp] = st.escape; S.esc = { map, sp, tp, T: st.time * 60, max: st.time * 60, deb: [] };
  S.place = {}; sgApplyPlace(W); W.map = map; W.P.x = sp[0]; W.P.y = sp[1]; W.cam = null; W.fade = 16; W.shake = 16; SFX.rock(); W.msg = { t: '⏱️ اهرب! بسرعة!', k: 0, c: '#ff8080' }; }
// ---- per-frame: overlays first (they freeze the world), then the walking checks
function sagaUpd(W, p, q, ok, back, tap) { const S = W.saga; if (!S) return false; S.k++;
  if (S.card) { S.card.k++; if ((S.card.k > 40 && (ok || tap || back)) || S.card.k > 260) { S.card = null; SFX.move(); sgStep(W); } return true; }
  if (S.credits) { S.credits.k++; if (S.credits.k > 90 && (ok || tap || back)) { S.credits = null; W.msg = { t: '🌑 فتحت ملالي! تلقاه مظهر للزعيم', k: 0, c: '#e0b0ff' }; SFX.ok(); } return true; }
  if (S.say) { const D = S.say, L = D.L[D.i]; D.t++; D.k = Math.min(L.text.length, D.k + 1.3);
    if ((tap && tap[0] > VW - 220 && tap[1] < 74) || back) { sgSayEnd(W); return true; }
    if ((ok || tap) && D.t > 5) { if (D.k < L.text.length) D.k = L.text.length; else { D.i++; if (D.i >= D.L.length) sgSayEnd(W); else sgLineStart(W); } }
    return true; }
  if (S.choice) { const C = S.choice, n = C.st.choice.length; C.k++;
    if (p.left || q.left) { C.sel = (C.sel + 1) % n; SFX.move(); } if (p.right || q.right) { C.sel = (C.sel + n - 1) % n; SFX.move(); }
    let pick = -1; if (tap) for (let i = 0; i < n; i++) if (Math.abs(tap[0] - sgChoiceX(i, n)) < 120 && Math.abs(tap[1] - 380) < 150) pick = i;
    if (ok && C.k > 10) pick = C.sel;
    if (pick >= 0) { const st = C.st, r = st.choice[pick], good = r === st.right; S.choice = null; SFX.ok();
      sgSay(W, (good ? st.yes : st.no.map(l => [l[0], l[1].replace('{X}', sgName(W, r)), l[2]])).concat(st.after), () => sgNext(W)); }
    return true; }
  if (S.retry) { const R = S.retry; R.k++; if (p.left || q.left || p.right || q.right) { R.sel = 1 - R.sel; SFX.move(); }
    let pick = -1; if (tap) { if (Math.abs(tap[1] - 440) < 40) { if (Math.abs(tap[0] - (VW / 2 + 150)) < 140) pick = 0; else if (Math.abs(tap[0] - (VW / 2 - 150)) < 140) pick = 1; } }
    if (ok && R.k > 10) pick = R.sel; if (back && R.k > 10) pick = 1;
    if (pick === 0) { S.retry = null; sgFight(W, R.st); } else if (pick === 1) { S.retry = null; S.fightLater = true; sgEnsure(W, R.st.fight); SFX.move(); }
    return true; }
  if (W.shake > 0) W.shake = W.shake * 0.88 - 0.05;
  if (S.wait != null && !S.done && !W.dlg && !W.menu && !W.sleep && !W.mapOpen && !W.cal && !W.P.eat && !W.go && sgDue(W)) { S.wait = null; sgSave(S); S.place = Object.assign({}, SAGA[S.ch].place); sgApplyPlace(W); sgCard(W); return true; }
  return false; }
function sagaWalk(W) { const S = W.saga; if (!S || S.done || S.say || S.wait != null) return false; const st = sgCur(S), P = W.P; if (!st) return false;
  if (S.esc) { const E = S.esc; E.T--; W.shake = Math.max(W.shake, 2.5);
    if (W.map === E.map) {
      if (G.frame % 24 === 0) { const a = Math.atan2(E.tp[1] - P.y, E.tp[0] - P.x), dd = rnd(70, 240); E.deb.push({ x: P.x + Math.cos(a) * dd + rnd(-90, 90), y: P.y + Math.sin(a) * dd + rnd(-50, 50), t: 0 }); }
      for (const d of E.deb) { d.t++; if (d.t === 40) { SFX.thud(); W.shake = 12;
        if (Math.hypot(P.x - d.x, (P.y - d.y) * 1.4) < 64) { const a = Math.atan2(E.sp[1] - E.tp[1], E.sp[0] - E.tp[0]), nx = P.x + Math.cos(a) * 80, ny = P.y + Math.sin(a) * 80; if (wFree(W, nx, ny, WD.R, P)) { P.x = nx; P.y = ny; } E.T -= 90; W.msg = { t: '💥 آخ! طاح عليك حجر', k: 0, c: '#ff8080' }; } } }
      E.deb = E.deb.filter(d => d.t < 70);
      if (Math.hypot(P.x - E.tp[0], P.y - E.tp[1]) < 95) { S.esc = null; W.shake = 0; SFX.ready(); W.msg = { t: '✅ نجوت!', k: 0, c: '#7dffb0' }; sgNext(W); return true; } }
    if (E.T <= 0 || W.map !== E.map) { W.msg = { t: '💥 ما لحقت! حاول مرة ثانية', k: 0, c: '#ff8080' }; W.map = E.map; P.x = E.sp[0]; P.y = E.sp[1]; W.cam = null; E.T = E.max; E.deb = []; W.fade = 24; SFX.ko(); return true; }
    return false; }
  if (S.items) for (const it of S.items) if (!it.got && it.map === W.map && Math.hypot(P.x - it.x, P.y - it.y) < 72) { it.got = true; SFX.ready(); const left = S.items.filter(i => !i.got).length;
    W.msg = { t: it.ic + (left ? ` لقيتها! باقي ${left}` : ' كملت! 👏'), k: 0, c: '#ffd34d' }; const fin = () => { if (S.items && !S.items.some(i => !i.got)) { S.items = null; sgNext(W); } };
    if (it.L) sgSay(W, it.L, fin); else fin(); return true; }
  if (st.go && !S.items) { const [map, x, y] = st.go; if (W.map === map && (x === undefined || Math.hypot(P.x - x, P.y - y) < 135)) { sgNext(W); return true; } }
  return false; }
function sagaTalk(W, n) { const S = W.saga, st = sgCur(S), r = n.sg;
  n.dir = wDirOf(W.P.x - n.x, W.P.y - n.y, n.dir); n.face = W.P.x >= n.x ? 1 : -1; W.P.face = n.x >= W.P.x ? 1 : -1;
  if (st && !S.done && !S.esc && S.wait == null) {
    if (st.talk === r) { sgSay(W, st.say, () => sgNext(W)); return; }
    if (st.talks && st.talks[r] && !S.tdone[r]) { S.tdone[r] = 1; sgSay(W, st.talks[r], () => { if (st.en && st.en[r]) { W.en = Math.min(100, W.en + st.en[r]); W.msg = { t: `😋 +${st.en[r]} ⚡`, k: 0, c: '#7dffb0' }; } if (Object.keys(st.talks).every(k => S.tdone[k])) sgNext(W); }); return; }
    if (st.fight === r && S.fightLater) { sgFight(W, st); return; } }
  wDlg({ n, lines: [SG_IDLE[r] || '…'], opts: [['👋 مع السلامة', 'bye']] }); }
// ---- where to go next
function sgTarget(W) { const S = W.saga; if (!S || S.done || S.wait != null) return null; const st = sgCur(S); if (!st) return null; const P = W.P;
  const at = r => { const p = S.place[r]; return p ? { map: p[0], x: p[1], y: p[2], r } : null; };
  const best = L => { L = L.filter(Boolean); if (!L.length) return null; const here = L.filter(t => t.map === W.map); const pool = here.length ? here : L; return pool.reduce((a, b) => Math.hypot(a.x - P.x, a.y - P.y) <= Math.hypot(b.x - P.x, b.y - P.y) ? a : b); };
  if (S.esc) return { map: S.esc.map, x: S.esc.tp[0], y: S.esc.tp[1] };
  if (S.items) return best(S.items.filter(i => !i.got));
  if (st.go) { const [map, x, y] = st.go, M = WMAPS[map]; return { map, x: x === undefined ? M.spawn[0] : x, y: y === undefined ? M.spawn[1] : y }; }
  if (st.talk) return at(st.talk);
  if (st.talks) return best(Object.keys(st.talks).filter(k => !S.tdone[k]).map(at));
  if (st.fight && S.fightLater) return at(st.fight);
  return null; }
function sgGoal(W) { const S = W.saga, st = sgCur(S); if (!st) return '';
  if (S.esc) return sgTok(W, st.goal || 'اهرب!');
  if (st.fight && S.fightLater) return '🥊 كلّم ' + sgName(W, st.fight) + ' وكمّل المواجهة';
  let g = sgTok(W, st.goal || ''); if (st.talks) { const K = Object.keys(st.talks); g += `  (${K.filter(k => S.tdone[k]).length}/${K.length})`; } if (S.items) g += `  (${S.items.filter(i => i.got).length}/${S.items.length})`; return g; }
// ---- drawing: world layer
function sagaSortList(W, L) { const S = W.saga; if (!S) return;
  if (S.items) for (const it of S.items) if (!it.got && it.map === W.map) L.push([it.y, () => { const b = Math.sin(G.frame * 0.1 + it.x) * 6; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(it.x, it.y, 4, it.x, it.y, 70); g.addColorStop(0, 'rgba(255,211,77,0.55)'); g.addColorStop(1, 'rgba(255,180,40,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(it.x, it.y, 70, 26, 0, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(255,211,77,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(it.x, it.y, 34 + 6 * Math.sin(G.frame * 0.12), 11, 0, 0, 7); ctx.stroke(); txt(it.ic, it.x, it.y - 44 + b, { size: 46, rtl: false }); }]); }
function sagaDrawGround(W) { const S = W.saga; if (!S) return;
  if (S.esc && W.map === S.esc.map) for (const d of S.esc.deb) { if (d.t < 40) { const u = d.t / 40; ctx.fillStyle = `rgba(255,40,40,${0.15 + 0.3 * u})`; ctx.beginPath(); ctx.ellipse(d.x, d.y, 70 - 20 * u, 24 - 6 * u, 0, 0, 7); ctx.fill(); ctx.strokeStyle = `rgba(255,80,80,${0.5 + 0.5 * u})`; ctx.lineWidth = 3; ctx.stroke();
      const ry = d.y - (40 - d.t) * 22; ctx.fillStyle = '#6a5a4a'; ctx.beginPath(); ctx.moveTo(d.x - 26, ry); ctx.lineTo(d.x - 10, ry - 30); ctx.lineTo(d.x + 22, ry - 22); ctx.lineTo(d.x + 28, ry + 6); ctx.lineTo(d.x, ry + 18); ctx.closePath(); ctx.fill(); }
    else { const a = 1 - (d.t - 40) / 30; ctx.fillStyle = `rgba(90,76,62,${a})`; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(d.x + Math.cos(i * 1.3) * 26, d.y + Math.sin(i * 2.1) * 10, 10 + (i % 3) * 4, 0, 7); ctx.fill(); } } } }
function sgMark(W) { const S = W.saga, T = S && !S.say && !S.card && sgTarget(W); if (!T) return null; if (T.map === W.map) return T; const e = WMAPS[W.map].exits.find(e => e.to === T.map); return e ? { map: W.map, x: e.x + e.w / 2, y: e.y + e.h / 2, door: 1 } : null; }
function sagaDrawWorld(W) { const T = sgMark(W); if (!T) return; const b = Math.abs(Math.sin(G.frame * 0.1)) * 14, y = T.y - (T.r ? 250 : 120) - b;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(T.x, T.y, 6, T.x, T.y, 90); g.addColorStop(0, 'rgba(255,211,77,0.35)'); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(T.x, T.y, 90, 30, 0, 0, 7); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#ffd34d'; ctx.strokeStyle = '#3a2a00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(T.x - 20, y - 26); ctx.lineTo(T.x + 20, y - 26); ctx.lineTo(T.x, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function sgAmbient(W, M, cam) { if (M.ambient) { ctx.fillStyle = M.ambient; ctx.fillRect(0, 0, VW, VH); }
  if (M.glows) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [x, y, r, rgb] of M.glows) { const sx = x - cam.x, sy = y - cam.y; if (sx < -r || sx > VW + r || sy < -r || sy > VH + r) continue; const fl = 0.85 + 0.15 * Math.sin(G.frame * 0.2 + x); const g = ctx.createRadialGradient(sx, sy, 4, sx, sy, r); g.addColorStop(0, `rgba(${rgb},${0.32 * fl})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, r, 0, 7); ctx.fill(); } ctx.restore(); } }
// ---- drawing: screen layer (objective, timers, the cinematic, cards)
function sagaDrawTop(W) { const S = W.saga; if (!S) return;
  W._gR = 0; if (!S.say && !S.card && !S.choice && !S.retry && !S.credits && !W.mapOpen && !W.cal && !W.menu && !W.sleep) { sgDrawGoal(W); if (S.esc) sgDrawEsc(W); }
  if (S.say) sgDrawSay(W); if (S.choice) sgDrawChoice(W); if (S.retry) sgDrawRetry(W); if (S.card) sgDrawCard(W); if (S.credits) sgDrawCredits(W); }
function sgDrawGoal(W) { const S = W.saga, rows = []; let away = false, col = '#ffd34d';
  if (S && !S.done && S.wait == null) { const C = SAGA[S.ch], g = sgGoal(W), T = sgTarget(W); away = !!(T && T.map !== W.map); col = SG_PARTS[C.part][2];
    rows.push({ t: '📜 الفصل ' + SG_ORD[S.ch] + ' · ' + C.n, s: 16, c: col, w: 800 }); if (g) rows.push({ t: g, s: 21, c: '#fff', w: 900 });
    if (away) { const door = WMAPS[W.map].exits.some(e => e.to === T.map); rows.push({ t: (door ? '🚪 امشِ للباب أو 🗺️ الخريطة ← ' : '🗺️ افتح الخريطة ← ') + WMAPS[T.map].name, s: 17, c: '#7de6ff', w: 800, pulse: 1 }); } }
  else if (S && !S.done) { const C = SAGA[S.ch], dd = S.wait - wDay(W); col = SG_PARTS[C.part][2];
    rows.push({ t: '📜 الفصل الجاي: ' + C.n, s: 17, c: col, w: 900 });
    rows.push({ t: '📅 ' + wDateStr(S.wait) + (dd <= 0 ? ' — الصبح الساعة 7' : dd === 1 ? ' — بكرة' : ' — بعد ' + dd + ' أيام'), s: 19, c: '#fff', w: 900 });
    rows.push({ t: '🛏️ نام لين الصبح عشان يجي الوقت أسرع', s: 15, c: 'rgba(255,255,255,0.7)', w: 700 }); }
  else if (S && S.done && S.k < 400) rows.push({ t: '🏆 خلصت حرب الخالين!', s: 20, c: '#ffd34d', w: 900 });
  for (const E of wEvToday(W)) rows.push(W.ev.done[E.id] ? { t: '✅ ' + E.ic + ' ' + E.name, s: 15, c: '#7dffb0', w: 800 } : { t: '🎯 مهمة اليوم: ' + E.goal + (E.wins ? `  (${Math.min(W.ev.wins, E.wins)}/${E.wins})` : '') + (E.reward ? `  +${E.reward} 🪙` : ''), s: 17, c: '#ffd34d', w: 900 });
  if (W.sq) { for (const q of W.sq.act) rows.push({ t: SQ_ICON[q.t] + ' ' + sqGoal(W, q) + '  +' + q.rw + ' 🪙', s: 15, c: '#9fe8ff', w: 800 });
    if (W.sq.off.length && !W.sq.act.length && W.sq.n < 3) rows.push({ t: '❗ في ناس بالمدينة يبون فزعتك… دوّر علامة ❗', s: 14, c: 'rgba(255,211,77,0.9)', w: 700 }); }
  if (rows.length) { let w = 340; for (const r of rows) { ctx.font = `${r.w} ${r.s}px ${FA}`; w = Math.max(w, ctx.measureText(r.t).width + 46); } w = Math.min(w, 650);
    const h = 14 + rows.reduce((a, r) => a + r.s + 12, 0); W._gR = 16 + w; W._gB = 88 + h; ctx.fillStyle = 'rgba(10,8,20,0.82)'; rrect(16, 88, w, h, 14); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
    let y = 96; for (const r of rows) { ctx.font = `${r.w} ${r.s}px ${FA}`; const tw = ctx.measureText(r.t).width, sz = tw > w - 36 ? Math.max(12, r.s * (w - 36) / tw) : r.s; y += r.s / 2 + 4; ctx.save(); if (r.pulse) ctx.globalAlpha = 0.7 + 0.3 * Math.sin(G.frame * 0.15); txt(r.t, 16 + w - 18, y, { size: sz, weight: r.w, color: r.c, align: 'right' }); ctx.restore(); y += r.s / 2 + 8; } }
  if (away) { const p = 0.5 + 0.5 * Math.sin(G.frame * 0.15); ctx.strokeStyle = `rgba(125,230,255,${0.4 + 0.6 * p})`; ctx.lineWidth = 3; rrect(190 - 64, 52 - 30, 128, 60, 16); ctx.stroke(); }
  const MK0 = sgMark(W), MK = MK0 || sqMark(W); if (MK) { const cam = W.cam || { x: 0, y: 0 }, sx = MK.x - cam.x, sy = MK.y - cam.y - 80;
    if (sx < 30 || sx > VW - 30 || sy < 60 || sy > VH - 30) { const cx = VW / 2, cy = VH / 2, a = Math.atan2(sy - cy, sx - cx), ex = cx + Math.cos(a) * (VW / 2 - 60), ey = clamp(cy + Math.sin(a) * (VH / 2 - 60), 230, VH - 50);
      ctx.save(); ctx.translate(clamp(ex, 50, VW - 50), ey); ctx.rotate(a); ctx.fillStyle = MK0 ? '#ffd34d' : '#7de6ff'; ctx.strokeStyle = '#3a2a00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-14, -18); ctx.lineTo(-6, 0); ctx.lineTo(-14, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } } }
function sgDrawEsc(W) { const E = W.saga.esc, s = Math.max(0, Math.ceil(E.T / 60)), low = s <= 8, p = 0.5 + 0.5 * Math.sin(G.frame * (low ? 0.4 : 0.15));
  ctx.fillStyle = 'rgba(40,0,0,0.75)'; rrect(VW / 2 - 130, 14, 260, 70, 18); ctx.fill(); ctx.strokeStyle = low ? `rgba(255,60,60,${0.5 + 0.5 * p})` : '#ff8a2a'; ctx.lineWidth = 3; ctx.stroke();
  txt('⏱️ ' + s, VW / 2, 50, { size: 40, weight: 900, color: low ? '#ff5050' : '#ffd34d', rtl: false });
  ctx.fillStyle = '#ff8a2a'; rrect(VW / 2 - 110, 74, 220 * E.T / E.max, 6, 3); ctx.fill();
  ctx.fillStyle = `rgba(255,30,0,${0.06 + 0.06 * p})`; ctx.fillRect(0, 0, VW, VH); }
function sgPortraitImg(W, key) { const S = W.saga; if (key === 'P') return IMG['vs' + (W.P.ci + 1)]; if (key === '?') { const im = IMG['vs' + (S.cast.moalem + 1)]; return im && shadowOf(im); } if (key === 'jadd') return null; return IMG['vs' + (S.cast[key] + 1)]; }
function sgDrawPortrait(W, key, cx, flip, on, t) { const im = sgPortraitImg(W, key), col = sgColOf(W, key);
  ctx.save(); if (on) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(cx, 380, 30, cx, 380, 330); g.addColorStop(0, col + '55'); g.addColorStop(1, col + '00'); ctx.fillStyle = g; ctx.fillRect(cx - 340, 40, 680, 680); ctx.globalCompositeOperation = 'source-over'; }
  const rise = on ? Math.min(1, t / 8) * 8 : 0;
  if (key === 'jadd') { if (!on) ctx.globalAlpha = 0.5; drawJadd(ctx, cx, VH + 40, 3.2, G.frame); ctx.restore(); return; }
  if (!im) { ctx.restore(); return; } const pic = on ? im : (im._dk || (im._dk = tinted(im, '#05060c', 0.62))), h = on ? 530 : 500, w = im.width * h / im.height;
  if (flip) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); } ctx.drawImage(pic, cx - w / 2, VH - h + 10 - rise, w, h); ctx.restore(); }
function sgDrawSay(W) { sgDrawSay0(W); if (VOX.waitL) { const a = 0.6 + 0.4 * Math.sin(G.frame * 0.15); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,10,20,0.75)'; rrect(VW / 2 - 150, 62, 300, 38, 19); ctx.fill(); txt('🔊 يحمّل صوت القصة…', VW / 2, 82, { size: 18, weight: 800, color: '#9fe8ff' }); ctx.restore(); } }
function sgDrawSay0(W) { const S = W.saga, D = S.say, L = D.L[D.i]; if (!L) return; const t = D.t, fxA = Array.isArray(L.fx) ? L.fx : [L.fx], fx = fxA[0];
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, VW, VH); { const v = ctx.createRadialGradient(VW / 2, VH / 2, 200, VW / 2, VH / 2, 760); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH); }
  if (fx) sgFxBack(W, fx, t);
  const sl = D.slots; for (let i = 0; i < 2; i++) if (sl[i] && sl[i] !== L.who) sgDrawPortrait(W, sl[i], i === 0 ? 260 : VW - 260, i === 1, false, t);
  for (let i = 0; i < 2; i++) if (sl[i] && sl[i] === L.who) sgDrawPortrait(W, sl[i], i === 0 ? 260 : VW - 260, i === 1, true, t);
  if (fx) sgFxPanel(W, fxA, t);
  if (fx) sgFxFront(W, fx, t);
  // the text box
  const bx = 110, by = 530, bw = VW - 220, bh = 172, nar = L.who === 'N';
  ctx.save(); ctx.fillStyle = 'rgba(6,8,16,0.93)'; ctx.strokeStyle = nar ? '#c8a040' : L.col; ctx.lineWidth = 3; rrect(bx, by, bw, bh, 18); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.font = `900 25px ${FA}`; const nw = ctx.measureText(L.name).width; ctx.font = `800 16px ${FA}`; const sw = L.sub ? ctx.measureText(L.sub).width + 22 : 0, pw = nw + sw + 44;
  ctx.fillStyle = nar ? '#c8a040' : L.col; rrect(bx + bw - pw - 26, by - 22, pw, 44, 12); ctx.fill();
  txt((nar ? '📜 ' : '') + L.name, bx + bw - 26 - 22, by + 1, { size: 25, weight: 900, color: '#05060b', align: 'right' });
  if (L.sub) txt(L.sub, bx + bw - 26 - 22 - nw - 14, by + 3, { size: 16, weight: 800, color: 'rgba(5,6,11,0.7)', align: 'right' });
  const shown = L.text.slice(0, Math.floor(D.k)); ctx.font = `800 29px ${FA}`; const lines = wrapLines(shown, bw - 90);
  lines.slice(0, 3).forEach((ln, i) => txt(ln, bx + bw - 40, by + 60 + i * 42, { size: 29, weight: 800, color: nar ? '#e8eefc' : '#fff', align: 'right', italic: nar }));
  if (D.k >= L.text.length && G.frame % 40 < 26) txt('▼', bx + 36, by + bh - 26, { size: 22, color: '#ffd34d', rtl: false });
  // top bar + skip
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, 52); const C = SAGA[S.ch];
  txt('⚔️ حرب الخالين · الفصل ' + SG_ORD[S.ch] + ': ' + C.n, VW / 2, 26, { size: 18, weight: 800, color: SG_PARTS[C.part][2] });
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; rrect(VW - 200, 8, 180, 36, 12); ctx.fill(); txt(TOUCH_ON ? 'تخطّي ⏭' : 'تخطّي ⏭ (Esc)', VW - 110, 27, { size: 17, weight: 800, color: 'rgba(255,255,255,0.8)' });
  txt(D.i + 1 + ' / ' + D.L.length, 70, 27, { size: 15, weight: 700, color: 'rgba(255,255,255,0.45)', rtl: false });
  txt(TOUCH_ON ? 'المس للمتابعة' : 'Enter / ✕ = التالي', VW / 2, VH - 9, { size: 13, weight: 700, color: 'rgba(255,255,255,0.4)' }); }
// ---- the pictures that show up in the talks
function sgFace(W, r, x, y, R, col) { const S = W.saga, ci = r === 'P' ? W.P.ci : S.cast[r], im = IMG['face' + (ci + 1)]; ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.closePath(); ctx.fillStyle = '#1a1c2a'; ctx.fill(); ctx.clip(); if (im) ctx.drawImage(im, x - R, y - R, R * 2, R * 2); ctx.restore(); ctx.strokeStyle = col || sgColOf(W, r); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke(); }
function sgFrame(x, y, w, h, col) { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 24; ctx.fillStyle = 'rgba(8,8,16,0.95)'; rrect(x, y, w, h, 18); ctx.fill(); ctx.restore(); ctx.strokeStyle = col; ctx.lineWidth = 4; rrect(x, y, w, h, 18); ctx.stroke(); }
function sgFxBack(W, fx, t) {
  if (fx === 'fog') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const x = ((i * 300 + t * (1 + i % 3)) % (VW + 400)) - 200, y = 140 + (i * 97) % 400, g = ctx.createRadialGradient(x, y, 10, x, y, 260); g.addColorStop(0, 'rgba(150,40,255,0.22)'); g.addColorStop(1, 'rgba(90,0,180,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 260, 0, 7); ctx.fill(); } ctx.restore(); }
  if (fx === 'rain') { ctx.fillStyle = 'rgba(10,20,50,0.4)'; ctx.fillRect(0, 0, VW, VH); ctx.strokeStyle = 'rgba(170,200,255,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 90; i++) { const x = (i * 137 + t * 9) % (VW + 100) - 50, y = (i * 211 + t * 22) % VH; ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 26); } ctx.stroke(); }
  if (fx === 'fire') { const g = ctx.createLinearGradient(0, VH, 0, 200); g.addColorStop(0, 'rgba(255,90,20,0.55)'); g.addColorStop(1, 'rgba(255,40,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); for (let i = 0; i < 30; i++) { const x = (i * 97 + t * 2) % VW, y = VH - ((i * 53 + t * (3 + i % 4)) % 500); ctx.fillStyle = i % 2 ? '#ffd34d' : '#ff6a2a'; ctx.fillRect(x, y, 3, 3); } }
  if (fx === 'alarm') { const p = 0.5 + 0.5 * Math.sin(t * 0.25); ctx.fillStyle = `rgba(255,0,20,${0.12 + 0.2 * p})`; ctx.fillRect(0, 0, VW, VH); } }
function sgFxFront(W, fx, t) {
  if (fx === 'dark') { const fl = t < 30 && (t % 7 < 2) ? 0.3 : 0; ctx.fillStyle = `rgba(0,0,0,${0.82 - fl})`; ctx.fillRect(0, 0, VW, 530); const x = (t * 14) % (VW + 600) - 300, g = ctx.createRadialGradient(x, 120, 10, x, 120, 300); g.addColorStop(0, 'rgba(255,20,20,0.35)'); g.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, 530); }
  if (fx === 'boom' && t < 26) { ctx.fillStyle = `rgba(255,245,220,${(1 - t / 26) * 0.9})`; ctx.fillRect(0, 0, VW, VH); }
  if (fx === 'boom' && t < 60) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = 80 + t * 9, g = ctx.createRadialGradient(VW / 2, 300, 10, VW / 2, 300, r); g.addColorStop(0, `rgba(255,200,90,${0.6 * (1 - t / 60)})`); g.addColorStop(1, 'rgba(255,60,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(VW / 2, 300, r, 0, 7); ctx.fill(); ctx.restore(); }
  if (fx === 'quake') { ctx.strokeStyle = 'rgba(30,20,10,0.75)'; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i < 5; i++) { let x = 120 + i * 260, y = 60; ctx.moveTo(x, y); for (let k = 0; k < 7; k++) { x += ((i * 37 + k * 23) % 60) - 30; y += 60; ctx.lineTo(x, y); } } ctx.stroke(); }
  if (fx === 'dash' && t < 22) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const y = 100 + i * 45, x = (t / 22) * (VW + 600) - 300 - (i % 3) * 80; const g = ctx.createLinearGradient(x - 400, 0, x, 0); g.addColorStop(0, 'rgba(176,48,255,0)'); g.addColorStop(1, 'rgba(224,176,255,0.8)'); ctx.fillStyle = g; ctx.fillRect(x - 400, y, 400, 6); } ctx.restore(); }
  if (fx === 'hit' && t < 14) { ctx.fillStyle = `rgba(255,30,30,${0.45 * (1 - t / 14)})`; ctx.fillRect(0, 0, VW, VH); txt('💥', VW / 2, 300, { size: 140 + t * 4, rtl: false }); }
  if (fx === 'alarm') txt('⚠️', VW / 2, 110, { size: 70 + 8 * Math.sin(t * 0.3), rtl: false }); }
function sgFxPanel(W, A, t) { const fx = A[0], S = W.saga, cx = VW / 2, u = easeOut(Math.min(1, t / 14));
  ctx.save(); ctx.globalAlpha = u; ctx.translate(cx, 290); ctx.scale(0.9 + 0.1 * u, 0.9 + 0.1 * u); ctx.translate(-cx, -290);
  if (fx === 'vs') { const [, a, b] = A; sgFace(W, a, cx - 230, 280, 110); sgFace(W, b, cx + 230, 280, 110); txt(sgName(W, a), cx - 230, 420, { size: 28, weight: 900, color: '#fff', stroke: '#000', sw: 6 }); txt(sgName(W, b), cx + 230, 420, { size: 28, weight: 900, color: '#fff', stroke: '#000', sw: 6 });
    txt('VS', cx, 290, { size: 110, font: FE, weight: 700, color: '#ffd34d', stroke: '#000', sw: 10, italic: true, glow: '#ff8a00', glowBlur: 40, rtl: false }); }
  else if (fx === 'scroll') { const g = 0.5 + 0.5 * Math.sin(t * 0.12); ctx.fillStyle = '#e8d5a0'; ctx.fillRect(cx - 230, 140, 460, 280); ctx.fillStyle = 'rgba(120,80,30,0.25)'; ctx.fillRect(cx - 230, 140, 460, 18); ctx.fillRect(cx - 230, 402, 460, 18);
    for (const sx of [-1, 1]) { const x = cx + sx * 240; const gg = ctx.createLinearGradient(x - 16, 0, x + 16, 0); gg.addColorStop(0, '#6a4220'); gg.addColorStop(0.5, '#c89a5a'); gg.addColorStop(1, '#6a4220'); ctx.fillStyle = gg; ctx.fillRect(x - 16, 126, 32, 308); }
    ctx.strokeStyle = 'rgba(90,50,20,0.6)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const y = 250 + i * 26; ctx.beginPath(); for (let x = cx - 190; x < cx + 190; x += 12) ctx.lineTo(x, y + Math.sin(x * 0.2 + i) * 3); ctx.stroke(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = ctx.createRadialGradient(cx, 200, 4, cx, 200, 120); r.addColorStop(0, `rgba(255,220,120,${0.5 + 0.4 * g})`); r.addColorStop(1, 'rgba(255,180,40,0)'); ctx.fillStyle = r; ctx.beginPath(); ctx.arc(cx, 200, 120, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#c8a040'; ctx.beginPath(); ctx.moveTo(cx - 40, 222); ctx.lineTo(cx - 40, 186); ctx.lineTo(cx - 20, 204); ctx.lineTo(cx, 176); ctx.lineTo(cx + 20, 204); ctx.lineTo(cx + 40, 186); ctx.lineTo(cx + 40, 222); ctx.closePath(); ctx.fill(); }
  else if (fx === 'phone' || fx === 'chains') { ctx.fillStyle = '#0c0c10'; rrect(cx - 120, 104, 240, 400, 34); ctx.fill(); ctx.strokeStyle = '#3a3a44'; ctx.lineWidth = 5; ctx.stroke(); const g = ctx.createLinearGradient(0, 130, 0, 480); g.addColorStop(0, '#1a2a4a'); g.addColorStop(1, '#0a0a14'); ctx.fillStyle = g; rrect(cx - 104, 130, 208, 350, 18); ctx.fill();
    sgFace(W, fx === 'phone' ? 'adel' : 'salah', cx, 290, 80); if (fx === 'chains') { ctx.strokeStyle = '#9aa0aa'; ctx.lineWidth = 6; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(cx + i * 26, 290 + Math.abs(i) * 8 - 20, 13, 8, i * 0.3, 0, 7); ctx.stroke(); } for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(cx + i * 26, 330 - Math.abs(i) * 6, 13, 8, -i * 0.3, 0, 7); ctx.stroke(); } }
    if (t % 40 < 26) { ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.arc(cx - 70, 160, 7, 0, 7); ctx.fill(); txt('REC', cx - 40, 161, { size: 17, font: FE, weight: 700, color: '#ff2a2a', rtl: false }); }
    ctx.fillStyle = '#36e8ff'; for (let i = 0; i < 14; i++) { const h = 6 + Math.abs(Math.sin(t * 0.3 + i * 0.9)) * 30; ctx.fillRect(cx - 84 + i * 12, 430 - h / 2, 7, h); } }
  else if (fx === 'card') { sgFrame(cx - 240, 150, 480, 270, '#b030ff'); ctx.fillStyle = '#05030a'; rrect(cx - 220, 170, 440, 230, 12); ctx.fill(); ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 3; rrect(cx - 206, 184, 412, 202, 8); ctx.stroke();
    txt('استمتعوا بالسلام…', cx, 230, { size: 24, weight: 800, color: '#e8c45a' }); txt('الملك الحقيقي ما ظهر بعد', cx, 268, { size: 20, weight: 700, color: 'rgba(232,196,90,0.75)' });
    txt('ملالي', cx + 40, 336, { size: 52, weight: 900, color: '#d070ff', italic: true, glow: '#b030ff', glowBlur: 24 }); ctx.fillStyle = '#6a1ab0'; ctx.beginPath(); ctx.arc(cx - 130, 336, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#e0b0ff'; ctx.beginPath(); ctx.ellipse(cx - 130, 336, 16, 9, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#05030a'; ctx.beginPath(); ctx.arc(cx - 130, 336, 5, 0, 7); ctx.fill(); }
  else if (fx === 'mask' || fx === 'unmask') { sgFrame(cx - 270, 110, 540, 340, '#ff3b4a'); ctx.fillStyle = '#101018'; rrect(cx - 250, 130, 500, 300, 10); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 130; y < 430; y += 4) if ((y + t * 3) % 16 < 4) ctx.fillRect(cx - 250, y, 500, 2);
    if (fx === 'mask') { ctx.fillStyle = '#05050a'; ctx.beginPath(); ctx.arc(cx, 260, 80, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx - 150, 430); ctx.quadraticCurveTo(cx, 300, cx + 150, 430); ctx.fill(); ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.ellipse(cx, 262, 66, 50, 0, 0, 7); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const sx of [-1, 1]) { const g = ctx.createRadialGradient(cx + sx * 26, 252, 1, cx + sx * 26, 252, 22); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,60,60,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx + sx * 26, 252, 22, 8, 0, 0, 7); ctx.fill(); } ctx.restore(); }
    else { sgFace(W, 'moalem', cx, 270, 100, '#ff3b4a'); const k = Math.min(1, t / 30); ctx.save(); ctx.translate(cx + 120 * k, 270 + 160 * k); ctx.rotate(k * 2); ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.ellipse(0, 0, 66, 50, 0, 0, 7); ctx.fill(); ctx.restore(); } }
  else if (fx === 'banner') { const px = cx - 220; ctx.fillStyle = '#c8a040'; ctx.fillRect(px - 6, 96, 12, 400); ctx.beginPath(); ctx.arc(px, 92, 12, 0, 7); ctx.fill();
    const Wd = 440, H = 250; ctx.save(); ctx.beginPath(); ctx.moveTo(px, 110); for (let x = 0; x <= Wd; x += 10) ctx.lineTo(px + x, 110 + Math.sin(x * 0.02 - t * 0.12) * 14 * (x / Wd)); for (let x = Wd; x >= 0; x -= 10) ctx.lineTo(px + x, 110 + H + Math.sin(x * 0.02 - t * 0.12 + 0.6) * 14 * (x / Wd)); ctx.closePath();
    const g = ctx.createLinearGradient(px, 0, px + Wd, 0); g.addColorStop(0, '#0e2a6a'); g.addColorStop(1, '#1a4ab0'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#e8c45a'; ctx.lineWidth = 6; ctx.stroke(); ctx.clip();
    const ex = px + Wd / 2, ey = 110 + H / 2 + Math.sin(Wd / 2 * 0.02 - t * 0.12) * 7; ctx.strokeStyle = '#e8c45a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(ex - 60, ey + 60); ctx.lineTo(ex + 60, ey - 40); ctx.moveTo(ex + 60, ey + 60); ctx.lineTo(ex - 60, ey - 40); ctx.stroke();
    ctx.fillStyle = '#e8c45a'; ctx.beginPath(); ctx.moveTo(ex - 44, ey - 34); ctx.lineTo(ex - 44, ey - 76); ctx.lineTo(ex - 22, ey - 56); ctx.lineTo(ex, ey - 88); ctx.lineTo(ex + 22, ey - 56); ctx.lineTo(ex + 44, ey - 76); ctx.lineTo(ex + 44, ey - 34); ctx.closePath(); ctx.fill(); ctx.restore();
    txt('راية العائلة', ex, 110 + H + 50, { size: 28, weight: 900, color: '#ffd34d', stroke: '#000', sw: 5 });
    for (let i = 0; i < 24; i++) { const x = (i * 131 + t * (2 + i % 3)) % VW, y = ((i * 71 + t * (3 + i % 4)) % 520); ctx.fillStyle = ['#ffd34d', '#ff3b4a', '#3ea0ff', '#5be37d'][i % 4]; ctx.fillRect(x, y, 8, 5); } }
  else if (fx === 'eyes') { sgFrame(cx - 240, 160, 480, 220, '#b030ff'); const blink = t % 110 > 100 ? 0.15 : 1; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const sx of [-1, 1]) { const g = ctx.createRadialGradient(cx + sx * 70, 270, 2, cx + sx * 70, 270, 60); g.addColorStop(0, 'rgba(255,240,255,1)'); g.addColorStop(0.25, 'rgba(208,112,255,0.9)'); g.addColorStop(1, 'rgba(120,0,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx + sx * 70, 270, 60, 26 * blink, sx * 0.15, 0, 7); ctx.fill(); } ctx.restore(); }
  else if (fx === 'machine') { sgFrame(cx - 270, 110, 540, 340, '#ff8a2a'); ctx.fillStyle = '#3a3f48'; rrect(cx - 200, 220, 300, 180, 16); ctx.fill(); ctx.fillStyle = '#555b66'; ctx.fillRect(cx + 90, 270, 160, 60); ctx.fillStyle = '#2a2e36'; ctx.fillRect(cx + 240, 260, 24, 80);
    for (const [gx, gy, r] of [[cx - 120, 300, 44], [cx - 30, 340, 30]]) { ctx.save(); ctx.translate(gx, gy); ctx.rotate(t * 0.05 * (r > 40 ? 1 : -1.4)); ctx.fillStyle = '#9aa0aa'; for (let i = 0; i < 10; i++) { ctx.rotate(Math.PI / 5); ctx.fillRect(-6, -r - 10, 12, 14); } ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.fillStyle = '#3a3f48'; ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, 7); ctx.fill(); ctx.restore(); }
    for (let i = 0; i < 5; i++) { ctx.fillStyle = (t / 6 + i) % 5 < 2 ? '#ff3a2a' : '#5a1010'; ctx.beginPath(); ctx.arc(cx - 170 + i * 30, 240, 7, 0, 7); ctx.fill(); }
    for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(160,160,170,${0.3 - i * 0.06})`; ctx.beginPath(); ctx.arc(cx - 160 + Math.sin(t * 0.05 + i) * 10, 200 - i * 22 - (t % 30), 20 + i * 6, 0, 7); ctx.fill(); } }
  else if (fx === 'mech') { sgFrame(cx - 230, 96, 460, 392, '#36e8ff'); const steel = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#4a5a70'); g.addColorStop(0.45, '#d0e0f0'); g.addColorStop(1, '#3a4a60'); return g; }, bob = Math.sin(t * 0.08) * 3;
    ctx.save(); ctx.translate(0, bob);
    for (const sx of [-1, 1]) { ctx.fillStyle = steel(cx + sx * 40 - 26, cx + sx * 40 + 26); rrect(cx + sx * 40 - 26, 330, 52, 70, 10); ctx.fill(); rrect(cx + sx * 44 - 24, 398, 48, 62, 10); ctx.fill(); ctx.fillStyle = '#2a3442'; rrect(cx + sx * 46 - 34, 452, 68, 22, 8); ctx.fill(); ctx.fillStyle = '#36e8ff'; ctx.beginPath(); ctx.arc(cx + sx * 42, 399, 7, 0, 7); ctx.fill(); }
    ctx.fillStyle = steel(cx - 110, cx + 110); ctx.beginPath(); ctx.moveTo(cx - 105, 200); ctx.lineTo(cx + 105, 200); ctx.lineTo(cx + 78, 338); ctx.lineTo(cx - 78, 338); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(20,30,40,0.5)'; ctx.lineWidth = 3; ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, 300); ctx.lineTo(cx, 336); ctx.moveTo(cx - 60, 316); ctx.lineTo(cx + 60, 316); ctx.stroke();
    for (const sx of [-1, 1]) { ctx.fillStyle = steel(cx + sx * 140 - 40, cx + sx * 140 + 40); ctx.beginPath(); ctx.arc(cx + sx * 128, 214, 42, 0, 7); ctx.fill(); ctx.save(); ctx.translate(cx + sx * 150, 236); ctx.rotate(sx * 0.12); rrect(-24, 0, 48, 78, 12); ctx.fill(); rrect(-22, 74, 44, 70, 12); ctx.fill(); ctx.fillStyle = '#2a3442'; ctx.beginPath(); ctx.arc(0, 152, 26, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = steel(cx - 46, cx + 46); rrect(cx - 46, 128, 92, 76, 22); ctx.fill(); ctx.fillStyle = '#0a1220'; rrect(cx - 36, 152, 72, 22, 9); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; const p = 0.6 + 0.4 * Math.sin(t * 0.3); ctx.fillStyle = `rgba(54,232,255,${p})`; rrect(cx - 30, 157, 60, 12, 6); ctx.fill();
    const r = ctx.createRadialGradient(cx, 252, 2, cx, 252, 54); r.addColorStop(0, `rgba(230,255,255,${p})`); r.addColorStop(0.4, `rgba(54,232,255,${0.7 * p})`); r.addColorStop(1, 'rgba(0,160,255,0)'); ctx.fillStyle = r; ctx.beginPath(); ctx.arc(cx, 252, 54, 0, 7); ctx.fill();
    for (const sx of [-1, 1]) { const f = ctx.createRadialGradient(cx + sx * 46, 486, 2, cx + sx * 46, 486, 30); f.addColorStop(0, `rgba(255,200,90,${0.7 * p})`); f.addColorStop(1, 'rgba(255,90,0,0)'); ctx.fillStyle = f; ctx.beginPath(); ctx.arc(cx + sx * 46, 486, 30, 0, 7); ctx.fill(); }
    ctx.restore(); }
  else if (fx === 'tracker') { sgFrame(cx - 200, 170, 400, 220, '#ff3a2a'); ctx.fillStyle = '#2a2e36'; rrect(cx - 70, 250, 140, 90, 14); ctx.fill(); ctx.fillStyle = '#555b66'; ctx.fillRect(cx + 40, 196, 6, 56);
    if (t % 30 < 15) { ctx.fillStyle = '#ff2a2a'; ctx.beginPath(); ctx.arc(cx - 30, 295, 12, 0, 7); ctx.fill(); } ctx.strokeStyle = 'rgba(255,60,60,0.7)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const r = ((t * 1.5 + i * 25) % 75) + 10; ctx.globalAlpha = u * (1 - r / 85); ctx.beginPath(); ctx.arc(cx + 43, 196, r, -2.6, -0.5); ctx.stroke(); } ctx.globalAlpha = u; }
  else if (fx === 'screen') { sgFrame(cx - 270, 120, 540, 320, '#ff3b4a'); ctx.fillStyle = '#05060b'; rrect(cx - 250, 140, 500, 280, 8); ctx.fill(); const j = t % 20 < 3 ? rnd(-6, 6) : 0;
    txt('المملكة… مو آمنة', cx + j, 280, { size: 52, weight: 900, color: '#ff3b4a', glow: '#ff0020', glowBlur: 24 }); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 120, 140); ctx.lineTo(cx + 60, 230); ctx.lineTo(cx + 140, 300); ctx.lineTo(cx + 80, 420); ctx.moveTo(cx + 60, 230); ctx.lineTo(cx - 40, 260); ctx.stroke(); }
  else if (fx === 'letter') { ctx.save(); ctx.translate(cx, 280); ctx.rotate(-0.05); ctx.fillStyle = '#f4ead2'; ctx.fillRect(-200, -150, 400, 300); ctx.strokeStyle = 'rgba(120,90,50,0.4)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-160, -60 + i * 34); ctx.lineTo(160, -60 + i * 34); ctx.stroke(); }
    txt('إلى العائلة…', 120, -110, { size: 26, weight: 900, color: '#3a2a1a', align: 'right' }); ctx.fillStyle = '#a01020'; ctx.beginPath(); ctx.arc(130, 110, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#d04050'; ctx.beginPath(); ctx.arc(130, 110, 16, 0, 7); ctx.fill(); ctx.restore(); }
  else if (fx === 'darkroom') { ctx.fillStyle = '#030305'; ctx.fillRect(cx - 300, 90, 600, 420); const g = ctx.createRadialGradient(cx, 330, 10, cx, 330, 240); g.addColorStop(0, 'rgba(255,220,150,0.35)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 300, 90, 600, 420);
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(cx - 240, 380); ctx.lineTo(cx + 240, 380); ctx.lineTo(cx + 200, 330); ctx.lineTo(cx - 200, 330); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#1a0f08'; ctx.fillRect(cx - 240, 380, 480, 24);
    ctx.fillStyle = '#05030a'; ctx.save(); ctx.translate(cx + 10, 352); ctx.rotate(-0.12); ctx.fillRect(-46, -16, 92, 32); ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 2; ctx.strokeRect(-42, -12, 84, 24); ctx.restore();
    ctx.fillStyle = '#0a0a0e'; ctx.beginPath(); ctx.ellipse(cx + 90, 330, 46, 22, -0.3, 0, 7); ctx.fill(); ctx.fillRect(cx + 110, 290, 160, 40);
    ctx.fillStyle = '#c8a040'; ctx.fillRect(cx - 2, 90, 4, 120); ctx.beginPath(); ctx.moveTo(cx - 40, 230); ctx.lineTo(cx + 40, 230); ctx.lineTo(cx + 20, 206); ctx.lineTo(cx - 20, 206); ctx.closePath(); ctx.fill(); }
  else if (fx === 'hand') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) { ctx.save(); ctx.translate(cx, 290); ctx.rotate(i / 12 * Math.PI * 2 + t * 0.01); const g = ctx.createLinearGradient(0, 0, 300, 0); g.addColorStop(0, 'rgba(255,220,120,0.35)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(300, -26); ctx.lineTo(300, 26); ctx.closePath(); ctx.fill(); ctx.restore(); } ctx.restore(); txt('🤝', cx, 300, { size: 150, rtl: false }); }
  ctx.restore(); }
// ---- chapter card, choice, retry, credits
function sgDrawCard(W) { const S = W.saga, K = S.card, C = SAGA[K.ch], P = SG_PARTS[C.part], k = K.k, a = Math.min(1, k / 20);
  ctx.fillStyle = '#05050a'; ctx.fillRect(0, 0, VW, VH); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(VW / 2, VH / 2, 20, VW / 2, VH / 2, 560); g.addColorStop(0, P[2] + '33'); g.addColorStop(1, P[2] + '00'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  for (let i = 0; i < 50; i++) { const x = (i * 211 + k * (0.5 + i % 4 * 0.3)) % VW, y = VH - ((i * 97 + k * (0.6 + i % 3 * 0.4)) % VH); ctx.fillStyle = P[2] + '88'; ctx.fillRect(x, y, 2, 2); } ctx.restore();
  ctx.save(); ctx.globalAlpha = a; txt('⚔️ حرب الخالين', VW / 2, 90, { size: 24, weight: 800, color: 'rgba(255,255,255,0.55)' });
  if (K.part) { txt(P[0], VW / 2, 200, { size: 40, weight: 900, color: P[2] }); txt(P[1], VW / 2, 262, { size: 52, weight: 900, color: '#fff', glow: P[2], glowBlur: 30 }); }
  const y = K.part ? 410 : 330, u = easeOut(clamp((k - 14) / 20, 0, 1)); ctx.globalAlpha = a * u; ctx.strokeStyle = P[2]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(VW / 2 - 260 * u, y - 52); ctx.lineTo(VW / 2 + 260 * u, y - 52); ctx.stroke();
  txt('الفصل ' + SG_ORD[K.ch], VW / 2, y, { size: 32, weight: 800, color: P[2] }); txt(C.n, VW / 2, y + 66, { size: 64, weight: 900, color: '#fff', stroke: '#000', sw: 6, glow: P[2], glowBlur: 24 });
  if (k > 40 && G.frame % 50 < 34) txt(TOUCH_ON ? 'المس للمتابعة' : 'Enter للمتابعة', VW / 2, VH - 50, { size: 18, weight: 800, color: 'rgba(255,255,255,0.6)' }); ctx.restore(); }
function sgChoiceX(i, n) { return VW / 2 + ((n - 1) / 2 - i) * 260; }
function sgDrawChoice(W) { const S = W.saga, C = S.choice, st = C.st, n = st.choice.length; ctx.fillStyle = 'rgba(3,4,10,0.85)'; ctx.fillRect(0, 0, VW, VH);
  txt(st.q, VW / 2, 120, { size: 46, weight: 900, color: '#fff', glow: '#ff3b4a', glowBlur: 20 }); txt('اختار واحد… فكّر زين', VW / 2, 172, { size: 20, weight: 700, color: '#ffd34d' });
  st.choice.forEach((r, i) => { const x = sgChoiceX(i, n), on = i === C.sel; ctx.fillStyle = on ? 'rgba(230,20,40,0.35)' : 'rgba(255,255,255,0.06)'; rrect(x - 115, 240, 230, 290, 20); ctx.fill(); ctx.strokeStyle = on ? '#ff3b4a' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = on ? 4 : 2; ctx.stroke();
    sgFace(W, r, x, 350, 86); txt(sgName(W, r), x, 478, { size: 28, weight: 900, color: on ? '#fff' : 'rgba(255,255,255,0.8)' }); });
  txt(TOUCH_ON ? 'المس الشخص اللي تشك فيه' : '◀ ▶ اختيار · Enter تأكيد', VW / 2, VH - 60, { size: 18, weight: 800, color: 'rgba(255,255,255,0.6)' }); }
function sgDrawRetry(W) { const R = W.saga.retry; ctx.fillStyle = 'rgba(3,4,10,0.8)'; ctx.fillRect(0, 0, VW, VH); sgFrame(VW / 2 - 330, 220, 660, 290, '#ff3b4a');
  txt('😓 خسرت المواجهة', VW / 2, 290, { size: 44, weight: 900, color: '#fff' }); txt('القصة تنتظرك… تبي تعيد الحين؟', VW / 2, 345, { size: 22, weight: 700, color: '#ffd34d' });
  [['🔁 مرة ثانية', VW / 2 + 150], ['🚶 بعدين', VW / 2 - 150]].forEach(([l, x], i) => { const on = i === R.sel; ctx.fillStyle = on ? 'rgba(230,20,40,0.95)' : 'rgba(255,255,255,0.1)'; rrect(x - 130, 410, 260, 60, 16); ctx.fill(); if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); } txt(l, x, 441, { size: 26, weight: 900, color: '#fff' }); }); }
function sgDrawCredits(W) { const S = W.saga, k = S.credits.k, a = Math.min(1, k / 30); ctx.fillStyle = '#05050a'; ctx.fillRect(0, 0, VW, VH); ctx.save(); ctx.globalAlpha = a;
  txt('النهاية', VW / 2, 110, { size: 90, weight: 900, color: '#ffd34d', glow: '#ff8a00', glowBlur: 40 }); txt('وانتهت حرب الخالين… وارتفعت راية العائلة', VW / 2, 180, { size: 26, weight: 800, color: '#fff' });
  const R = ['adel', 'salah', 'malali', 'inv', 'dragon', 'chef', 'captain', 'moalem', 'bull', 'dajaj', 'teer', 'gamer', 'abd'];
  R.forEach((r, i) => { const row = i < 7 ? 0 : 1, n = row ? 6 : 7, j = row ? i - 7 : i, x = VW / 2 + ((n - 1) / 2 - j) * 150, y = 290 + row * 160, u = easeOut(clamp((k - 20 - i * 5) / 20, 0, 1)); ctx.globalAlpha = a * u; sgFace(W, r, x, y, 52); txt(sgName(W, r), x, y + 76, { size: 18, weight: 900, color: '#fff' }); });
  ctx.globalAlpha = a; txt('🌑 فتحت: ملالي — مظهر جديد للزعيم', VW / 2, 600, { size: 26, weight: 900, color: '#e0b0ff' }); txt('شكراً إنك لعبت يا ' + CHARS[W.P.ci].name + ' 🎉', VW / 2, 645, { size: 22, weight: 800, color: '#ffd34d' });
  if (k > 90 && G.frame % 50 < 34) txt(TOUCH_ON ? 'المس للمتابعة' : 'Enter للمتابعة', VW / 2, VH - 26, { size: 17, weight: 800, color: 'rgba(255,255,255,0.6)' }); ctx.restore(); }
window.__sagaAPI = { SAGA, sgCast, sagaRestart, cov(base, eff) { const cast = sgCast(base, eff), nm = r => r === 'P' ? CHARS[eff === MALALI ? base : eff].name : r === 'X' ? CHARS[cast.chef].name : SG_TITLE[r] || CHARS[cast[r]].name, miss = new Set();
    for (const x of window.__sagaAPI.texts()) { const t = x.split('|').slice(1).join('|').replace(/\{(\w+)\}/g, (m, r) => nm(r)); for (const sg of voiceSegs(t)) if (!VOX.txt[sg.t]) miss.add(sg.t); } return [...miss]; }, go(ch, st) { const W = G.world; W.saga.ch = ch; W.saga.st = st; W.saga.done = false; W.saga.wait = null; W.saga.say = null; W.saga.card = null; W.saga.choice = W.saga.retry = W.saga.esc = W.saga.credits = W.saga.items = null; sgReplay(W.saga); sgApplyPlace(W); sgStep(W, false); }, talk(r) { const W = G.world, n = W.npcs.find(n => n.sg === r); if (n) { W.map = n.map; sagaTalk(W, n); } return !!n; }, S: () => G.world.saga, tgt: () => sgTarget(G.world), goal: () => sgGoal(G.world), adv(n) { for (let i = 0; i < n; i++) { const W = G.world, D = W.saga.say; if (!D) break; D.i++; if (D.i >= D.L.length) sgSayEnd(W); else sgLineStart(W); } }, texts: () => { const T = new Set(); const add = L => (L || []).forEach(l => T.add(l[0] + '|' + l[1]));
  for (const C of SAGA) for (const st of C.steps) { add(st.say); add(st.win); add(st.lose); add(st.yes); add(st.no); add(st.after); if (st.talks) for (const k in st.talks) add(st.talks[k]); if (st.find) st.find.forEach(f => add(f[4])); } return [...T]; } };

function wEqFor(base, eff) { const P = profCur(), e = eqOfProf(P, eff); return e && Object.values(e).some(Boolean) ? e : eqOfProf(P, base); }
function wDress(W) { if (!W || !W.P) return; W.P.fig = wMakeFig(W.P.ci, wEqFor(W.P.base, W.P.ci)); W.pf = null; }
// ================= studio voices (ElevenLabs): one voice per role, recorded once and kept inside the game =================
// The pack (pro-voices.js → window.VOICE_PRO) holds clips keyed «tag|sentence». A line first looks for its speaker's studio
// voice — whole sentence first, then sentence pieces split around names — and only falls back to the old voice when missing.
const VOX_TOWN = ['town1', 'town2', 'old'];
function voxTag(who) {   // one voice per hero; the narrator, the mystery voice, the grandpa and the townspeople have their own
  if (typeof who === 'string') return who; if (who === 99) return 'nar'; if (who === 98 || who === 96) return 'myst'; if (who === 97) return 'old';
  if (who === CHEF) return 'c1'; return 'c' + (who | 0);
}
// the studio pieces of a line for one voice, or null when any piece is missing
function voxProKeys(text, tag) {
  if (!VOX.pro) return null; const out = [];
  const parts = text.replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, '').split('…');
  for (let pi = 0; pi < parts.length; pi++) { const whole = voiceNorm(parts[pi]); if (!whole) continue;
    if (VOX.txt[tag + '|' + whole]) { out.push({ t: tag + '|' + whole, gap: pi ? 0.22 : 0.03 }); continue; }
    const segs = voiceSegs(parts[pi]); if (!segs.length) continue;
    for (let si = 0; si < segs.length; si++) { const k = tag + '|' + segs[si].t; if (!VOX.txt[k]) return null; out.push({ t: k, gap: si === 0 && pi ? 0.22 : 0.05 }); } }
  return out.length ? out : null;
}
function voxPlay(segs, rate, stopPrev) {
  VOX.lastPro = segs.map(x => x.t).join(' + '); const tok = (VOX.tok = (VOX.tok || 0) + 1); if (stopPrev) voiceStop();
  Promise.all(segs.map(sg => voiceBuf(sg.t))).then(bufs => {
    if (stopPrev && tok !== VOX.tok) return; if (bufs.some(b => !b)) return;
    let t = AC.currentTime + 0.03; voxDuck(true);
    bufs.forEach((b, i) => { const s = AC.createBufferSource(); s.buffer = b; s.playbackRate.value = rate; const g = AC.createGain(); g.gain.value = 1.2; s.connect(g); g.connect(voxG || master);
      if (i) t += segs[i].gap; s.start(t); t += b.duration / rate; VOX.cur.push(s); s.onended = () => { VOX.cur = VOX.cur.filter(x => x !== s); if (!VOX.cur.length) voxDuck(false); }; });
  });
  return true;
}
// world talk boxes speak too: the gang, the grandpa, townspeople and vendors
function dlgSpeak(W, D) {
  if (!SET.voice || muted || !AC) return; const text = D.lines && D.lines[D.i]; if (!text) return; const n = D.n;
  const tags = D.jadd ? ['old'] : n && n.cit ? (n.role === 'karakman' ? ['old'] : n.role === 'ice' ? ['town2'] : VOX_TOWN) : n && n.ci != null ? [voxTag(n.ci)] : ['nar'];
  for (const tg of tags) { const k = voxProKeys(text, tg); if (k) { VOX.dlgOn = true; voxPlay(k, 1, true); return; } }
  if (n && !n.cit && n.ci != null && speakRec(text, n.ci, true)) VOX.dlgOn = true;
}
// the studio pack loads first; if there is none, the older recorded story voice loads instead
// the pack comes in a few parts (pro-voices-1.js, -2.js …) so each file stays small; it is used once every part is in
function proMerge() { const P = window.VOICE_PRO_PARTS || []; for (let i = proMerge.n || 0; i < P.length; i++) Object.assign(VOX.txt, P[i]); proMerge.n = P.length; if (window.VOICE_PRO) Object.assign(VOX.txt, window.VOICE_PRO);
  if (window.VOICE_PRO || P.length >= (window.PRO_VOICES || 1)) VOX.pro = true; return VOX.pro; }
function proVoices() { if (proMerge()) return; if (proVoices.s || proVoices.fail) return;
  const fail = () => { if (proVoices.fail || VOX.pro) return; proVoices.fail = true; storyVoices(); if (window.VOICE_STORY) { const L = VOX.waitL; VOX.waitL = null; sgSayAgain(L); } };
  if (!window.PRO_VOICES) { fail(); return; }   // the build marks the page with how many parts the studio pack has
  try { proVoices.s = []; for (let i = 1; i <= window.PRO_VOICES; i++) { const s = document.createElement('script'); s.src = 'pro-voices-' + i + '.js'; s.async = true; s.onerror = fail; document.head.appendChild(s); proVoices.s.push(s); } } catch (e) { fail(); } }
window.__proVoices = () => { if (!proMerge()) return; const L = VOX.waitL; VOX.waitL = null; sgSayAgain(L); };
setTimeout(proVoices, 1500);
// ---- the recording list: every line the game can say, for the voice that says it ----
function voxEach(fn) {   // fn(tag, text, inPieces, source)
  const COMBOS = [[0, 0], [1, 1], [1, 18], [3, 19], [5, 21], [6, 6], [6, 22], [7, 7], [0, 20], [2, 2], [4, 4], [8, 8], [9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [0, 23]];
  // «حرب الخالين»: whole sentences (lines that name the player go in pieces, so each name is recorded once per voice)
  for (const [base, eff] of COMBOS) { const cast = sgCast(base, eff), nm = r => r === 'P' ? CHARS[eff === MALALI ? base : eff].name : r === 'X' ? CHARS[cast.chef].name : SG_TITLE[r] || CHARS[cast[r]].name;
    for (const x of window.__sagaAPI.texts()) { const who = x.split('|')[0], raw = x.split('|').slice(1).join('|'), t = raw.replace(/\{(\w+)\}/g, (m, r) => nm(r));
      fn(who === 'N' ? 'nar' : who === '?' ? 'myst' : who === 'jadd' ? 'old' : voxTag(who === 'P' ? eff : cast[who]), t, raw.includes('{P}'), 'saga'); } }
  // the arcade story: names change with every pairing → pieces around the names
  const S0 = G.story; try { for (let pc = 0; pc < NCH; pc++) for (let o = 0; o < NCH; o++) { if (o === pc) continue; G.story = { pc, opps: [o, o, o, o], ch: 0, lines: [], li: 0 };
      for (let ch = 0; ch < NCHAP; ch++) for (const ph of ['pre', 'post']) { const L = storyScript(ch, ph) || [], oc = storyOpp(ch), shadow = CH_ROLE[ch] === 'shadow';
        for (const [w, t] of L) fn(w === 'N' ? 'nar' : w === 'P' ? voxTag(pc) : shadow ? 'myst' : voxTag(oc), t, true, 'arcade'); } } } finally { G.story = S0; }
  // fights: intros, skills, wins, finishers, quotes
  CHARS.forEach((c, ci) => { const P = PERSONA[ci] || {}, tg = voxTag(ci); ['intro', 'skill', 'win'].forEach(k => (P[k] || []).forEach(x => fn(tg, x, false, 'fight'))); if (c.quote) fn(tg, c.quote, false, 'fight'); if (FIN[ci] && FIN[ci].line) fn(tg, FIN[ci].line, false, 'fight'); if (SKILL2_LINE[ci]) fn(tg, SKILL2_LINE[ci], false, 'fight'); });
  const own = id => /^sk_(wave|ship|boat)$/.test(id) ? NOKH : /^sk_(eyes|redshot|feathers|tornado|meteor|dive)$/.test(id) ? RAIS2 : /^sk_(void|tendril|shstep|dwave|eclipse)$/.test(id) ? MALALI : RAIS;
  const heroes = [...new Set(CHARS.map((c, ci) => voxTag(ci)))];
  for (const id in BOSS_LINES) { if (['sk_wave', 'sk_ring', 'sk_redshot'].includes(id)) heroes.forEach(tg => fn(tg, BOSS_LINES[id], false, 'boss')); else fn(voxTag(own(id)), BOSS_LINES[id], false, 'boss'); }
  // the open world: the gang's greetings, the grandpa, townspeople, vendors
  W_HOME.forEach(h => fn(voxTag(h[0]), h[5], false, 'world'));
  ['يا هلا ومرحبا بولدي! نوّرت البيت.', 'اقعد تغدّى معي… الأكل حار وجاهز', 'تغدّينا اليوم الحمد لله… تعال بكرة نتغدّى سوا.'].forEach(x => fn('old', x, false, 'world'));
  CIT_LINES.forEach((x, i) => fn(VOX_TOWN[i % 3], x, false, 'world'));
  fn('old', 'كرك حار على الصبح… يعدّل المزاج!', false, 'world'); fn('town2', 'آيس كريم بارد! تبي فانيلا ولا شوكولاتة؟', false, 'world');
}
const voxClean = t => String(t).replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, ''), voxSay = r => r.trim().replace(/^[!؟?.,،:؛—"«»\s]+/, '');
window.__voxManifest = () => { const M = new Map(), put = (tag, k, t, src) => { if (k && !M.has(tag + '|' + k)) M.set(tag + '|' + k, { tag, t: t || k, src }); };
  voxEach((tag, text, pieces, src) => voxClean(text).split('…').forEach(part => {
    if (!pieces) { put(tag, voiceNorm(part), voxSay(part), src); return; }
    for (const sg of voiceSegs(part)) put(tag, sg.t, sg.t, src); }));
  // a piece keeps its own punctuation where it can, so questions still sound like questions
  return [...M.entries()].map(([k, o]) => ({ k, tag: o.tag, t: o.t, src: o.src })); };
window.__voxCov = () => { let n = 0, miss = []; voxEach((tag, text) => { n++; if (!voxProKeys(text, tag)) miss.push(tag + ' | ' + text); }); return { n, miss: [...new Set(miss)] }; };

// ================= الدوري — 8-fighter knockout cup: quarter-finals → semi-finals → final, random draw =================
// up to 8 people pick a fighter each (hot-seat), the empty places are filled by the computer; human vs computer is a normal
// CPU fight, human vs human is a 2-player fight on this device, computer vs computer is decided instantly.
const CUP_ROUNDS = ['ربع النهائي', 'نصف النهائي', 'النهائي'];
const CUP_COLS = ['#3ea0ff', '#ff3b4a', '#ffd34d', '#5be37d', '#c46bff', '#ff8a2a', '#36e0e0', '#ff6fb5'];
function cupOpen() { G.cup = { phase: 'setup', n: 1, picks: [], pi: 0, cur: 0, o: 0, t: 0, pid: PROF.cur, rw: [] }; G.scene = 'cup'; G.t = 0; SFX.ok(); }
function cupEff(e) { const O = outfitOf(e.ci, e.o); return O && O.as !== undefined ? O.as : e.ci; }
function cupName(e) { return e.h >= 0 ? (e.pid && PROF.list[e.pid] ? PROF.list[e.pid].name : 'لاعب ' + (e.h + 1)) : 'كمبيوتر'; }
const CUP_PRIZE = [25, 60, 120], CUP_WIN = 250;
function cupPidNext(C, dir = 1) { const used = C.picks.slice(0, C.pi).map(p => p.pid).filter(Boolean), L = [null].concat(profIds().filter(id => !used.includes(id))); let i = L.indexOf(C.pid); if (i < 0) i = 0; C.pid = L[(i + dir + L.length) % L.length]; }
function cupReward(C, s, n, place) { const e = C.ent[s]; if (!e || e.h < 0) return; if (e.pid && PROF.list[e.pid]) profAward(e.pid, n); C.rw.push({ s, n: e.pid ? n : 0, place, t: 0 }); }
function cupDraw() {
  const C = G.cup, ent = C.picks.map((p, i) => ({ ci: p.ci, o: p.o, h: i, pid: p.pid || null }));
  const pool = []; for (let i = 0; i < NCH; i++) if (!ent.some(e => e.ci === i)) pool.push(i);
  for (let i = 0; i < NCH && pool.length < 8 - ent.length; i++) pool.push(i);
  while (ent.length < 8) { const k = (Math.random() * pool.length) | 0, ci = pool.splice(k, 1)[0]; const L = outfitList(ci); ent.push({ ci, o: L && Math.random() < 0.35 ? 1 + ((Math.random() * (L.length - 1)) | 0) : 0, h: -1 }); }
  for (let i = ent.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [ent[i], ent[j]] = [ent[j], ent[i]]; }
  C.ent = ent; C.R = [[0, 1, 2, 3, 4, 5, 6, 7], [], [], []]; C.phase = 'draw'; C.t = 0; C.res = null; SFX.ready();
}
function cupNext() { const C = G.cup; for (let r = 0; r < 3; r++) for (let k = 0; k < C.R[r].length / 2; k++) if (C.R[r + 1][k] === undefined) return { r, k, a: C.R[r][2 * k], b: C.R[r][2 * k + 1] }; return null; }
function cupPower(e) { const c = CHARS[cupEff(e)]; return c.stats[0] + c.stats[1] + c.stats[2] + c.hp * 3 + c.dmg * 3; }
function cupWin(m, s) { const C = G.cup; C.R[m.r + 1][m.k] = s; C.last = { m, s, t: 0 }; cupReward(C, s === m.a ? m.b : m.a, CUP_PRIZE[m.r], ['ربع النهائي', 'نصف النهائي', 'الوصيف'][m.r]); if (m.r === 2) cupReward(C, s, CUP_WIN, 'البطل 🏆'); if (m.r === 2) { C.phase = 'champ'; C.t = 0; SFX.ready(); } else { C.phase = 'bracket'; C.t = 0; } }
function cupPlay() {
  const C = G.cup, m = cupNext(); if (!m) return; const A = C.ent[m.a], B = C.ent[m.b];
  if (A.h < 0 && B.h < 0) { const pa = cupPower(A), pb = cupPower(B), w = Math.random() < 0.5 + (pa - pb) * 0.03 ? m.a : m.b; C.sim = { m, w, t: 0 }; SFX.ok(); return; }
  const swap = A.h < 0, P = swap ? B : A, Q = swap ? A : B;   // a human is always on the left
  C.play = { m, s0: swap ? m.b : m.a, s1: swap ? m.a : m.b, eq: [P.pid ? eqOfProf(PROF.list[P.pid], cupEff(P)) : null, Q.pid ? eqOfProf(PROF.list[Q.pid], cupEff(Q)) : null] };
  G.mode = Q.h < 0 ? 'cpu' : '2p'; G.sel = { cur: [P.ci, Q.ci], done: [true, true], t: 0, readyT: 0, outfit: [P.o, Q.o] }; G.toVS();
}
function cupSetupFight(F) { const C = G.cup; if (!C || !C.play) return; if (F.pads[1].cpu) F.pads[1].lvl = 1 + C.play.m.r * 0.7; }
function cupResult(w) { const C = G.cup, P = C.play; C.play = null; G.scene = 'cup'; G.fight = null; if (AC) Music.intensity = 0; cupWin(P.m, w === 0 ? P.s0 : P.s1); }
function cupTap() { const t = G.tap || window.__mtap || null; G.tap = null; window.__mtap = null; return t; }
const CUP_GRID = { x0: VW / 2 - 4 * 92 + 46, y0: 470, dx: 92, dy: 100, per: 8 };
function cupGridPos(i) { const row = (i / CUP_GRID.per) | 0, col = i % CUP_GRID.per, n = row === 0 ? Math.min(CUP_GRID.per, NCH) : NCH - CUP_GRID.per; const x0 = VW / 2 - (n - 1) * CUP_GRID.dx / 2; return [x0 + col * CUP_GRID.dx, CUP_GRID.y0 + row * CUP_GRID.dy]; }
function updCup() {
  const C = G.cup; if (!C) { G.toTitle(); return; } C.t++; G.t++;
  const p = pads[0].p, q = pads[1].p, ok = p.ok || q.ok, back = p.back || q.back || anyP('Escape', 'Backspace'), tap = cupTap();
  const hitBtn = (x, y, w, h) => tap && Math.abs(tap[0] - x) < w / 2 && Math.abs(tap[1] - y) < h / 2;
  if (C.phase === 'setup') {
    if (p.left || q.left || hitBtn(VW / 2 - 150, 330, 90, 90)) { C.n = Math.max(1, C.n - 1); SFX.move(); }
    if (p.right || q.right || hitBtn(VW / 2 + 150, 330, 90, 90)) { C.n = Math.min(8, C.n + 1); SFX.move(); }
    if ((ok && C.t > 8) || hitBtn(VW / 2, 520, 340, 70)) { C.phase = 'pick'; C.pi = 0; C.cur = 0; C.o = 0; C.t = 0; SFX.ok(); }
    else if (back && C.t > 8) { SFX.move(); G.cup = null; G.toTitle(); }
    return;
  }
  if (C.phase === 'pick') {
    const L = outfitList(C.cur);
    if (p.left || q.left) { C.cur = (C.cur + NCH - 1) % NCH; C.o = 0; SFX.move(); }
    if (p.right || q.right) { C.cur = (C.cur + 1) % NCH; C.o = 0; SFX.move(); }
    if (p.up || q.up || p.down || q.down) { C.cur = (C.cur + CUP_GRID.per) % (CUP_GRID.per * 2); if (C.cur >= NCH) C.cur = NCH - 1; C.o = 0; SFX.move(); }
    if ((p.sp || q.sp || hitBtn(VW / 2, 392, 260, 44)) && L.length > 1) { C.o = (C.o + 1) % L.length; SFX.move(); }
    if (p.dg || q.dg || anyP('Tab') || hitBtn(205, 342, 320, 60)) { cupPidNext(C); SFX.move(); }
    if (tap) for (let i = 0; i < NCH; i++) { const [x, y] = cupGridPos(i); if (Math.abs(tap[0] - x) < 42 && Math.abs(tap[1] - y) < 46) { if (C.cur === i) { C.go = 1; } else { C.cur = i; C.o = 0; SFX.move(); } } }
    if ((ok && C.t > 8) || C.go || hitBtn(VW - 150, 660, 220, 60)) { C.go = 0; C.picks[C.pi] = { ci: C.cur, o: C.o, pid: C.pid }; SFX.ok(); C.pi++; C.t = 0; C.pid = null; if (C.pi >= C.n) cupDraw(); }
    else if (back && C.t > 8) { SFX.move(); if (C.pi > 0) { C.pi--; C.t = 0; } else { C.phase = 'setup'; C.t = 0; } }
    return;
  }
  if (C.phase === 'draw') { if (C.t > 80 || ((ok || tap) && C.t > 12)) { C.phase = 'bracket'; C.t = 0; } return; }
  if (C.phase === 'bracket') {
    if (C.sim) { C.sim.t++; if (C.sim.t === 70) { const S = C.sim; C.sim = null; cupWin(S.m, S.w); } return; }
    if ((ok || tap) && C.t > 15) cupPlay();
    else if (back && C.t > 8) { SFX.move(); G.cup = null; G.toTitle(); }
    return;
  }
  if (C.phase === 'champ') { if ((ok || tap || back) && C.t > 60) { G.cup = null; G.toTitle(); } }
}
function cupCard(x, y, e, st, w = 170) {
  const h = 58; ctx.save();
  ctx.globalAlpha = st === 'out' ? 0.38 : 1;
  ctx.fillStyle = st === 'win' ? 'rgba(255,211,77,0.28)' : st === 'next' ? 'rgba(230,20,40,0.45)' : 'rgba(10,12,24,0.85)';
  rrect(x - w / 2, y - h / 2, w, h, 12); ctx.fill(); ctx.lineWidth = st === 'next' ? 3 : 2;
  ctx.strokeStyle = st === 'next' ? '#ff3b4a' : st === 'win' ? '#ffd34d' : 'rgba(255,255,255,0.25)'; ctx.stroke();
  if (e) {
    const ci = cupEff(e), im = IMG['face' + (ci + 1)];
    if (im) { ctx.save(); rrect(x + w / 2 - 54, y - 25, 50, 50, 10); ctx.clip(); ctx.drawImage(im, x + w / 2 - 54, y - 25, 50, 50); ctx.restore(); }
    txt(CHARS[ci].name, x + w / 2 - 62, y - 9, { size: 19, weight: 900, color: '#fff', align: 'right' });
    txt(cupName(e), x + w / 2 - 62, y + 15, { size: 15, weight: 800, color: e.h >= 0 ? CUP_COLS[e.h] : 'rgba(255,255,255,0.55)', align: 'right' });
  } else txt('؟', x, y + 2, { size: 28, weight: 900, color: 'rgba(255,255,255,0.35)' });
  ctx.restore();
}
function drawCupBg(title, sub) {
  drawStage({ x: Math.sin(G.frame * 0.003) * 120, z: 1, yaw: Math.sin(G.frame * 0.004) * 0.4 }, G.frame);
  ctx.fillStyle = 'rgba(4,5,12,0.72)'; ctx.fillRect(0, 0, VW, VH);
  txt(title, VW / 2, 52, { size: 50, weight: 900, color: '#fff', stroke: '#1a0004', sw: 8, glow: '#ff1030' });
  if (sub) txt(sub, VW / 2, 98, { size: 22, weight: 800, color: '#ffd34d' });
}
function drawCup() {
  const C = G.cup; if (!C) return;
  if (C.phase === 'setup') {
    drawCupBg('🏆 الدوري', 'ربع النهائي ← نصف النهائي ← النهائي · القرعة عشوائية');
    txt('كم لاعب بيشارك؟', VW / 2, 215, { size: 34, weight: 900, color: '#fff' });
    for (const [dx, s] of [[-150, '◀'], [150, '▶']]) { ctx.fillStyle = 'rgba(230,20,40,0.85)'; ctx.beginPath(); ctx.arc(VW / 2 + dx, 330, 42, 0, 7); ctx.fill(); txt(s, VW / 2 + dx, 332, { size: 34, weight: 900, color: '#fff', rtl: false }); }
    txt(String(C.n), VW / 2, 330, { size: 120, font: FE, weight: 700, color: '#ffd34d', rtl: false, stroke: '#000', sw: 6 });
    txt(C.n === 8 ? 'كل الأماكن لاعبين' : `${C.n} ${C.n === 1 ? 'لاعب' : 'لاعبين'} + ${8 - C.n} كمبيوتر`, VW / 2, 425, { size: 24, weight: 800, color: 'rgba(255,255,255,0.8)' });
    ctx.fillStyle = 'rgba(230,20,40,0.9)'; rrect(VW / 2 - 170, 485, 340, 70, 16); ctx.fill(); txt('اختيار الشخصيات ←', VW / 2, 522, { size: 30, weight: 900, color: '#fff' });
    txt(TOUCH_ON ? 'كل لاعب يختار شخصيته بدوره · لاعب ضد لاعب يلعبون على نفس الجهاز' : 'يمين/يسار للعدد · Enter للتأكيد · Esc للرجوع · لاعب ضد لاعب يلعبون على نفس الجهاز (كيبورد أو يدين)', VW / 2, 640, { size: 18, weight: 700, color: 'rgba(255,255,255,0.55)' });
    return;
  }
  if (C.phase === 'pick') {
    drawCupBg('🏆 الدوري', null);
    txt(`لاعب ${C.pi + 1} — اختر شخصيتك`, VW / 2, 100, { size: 30, weight: 900, color: CUP_COLS[C.pi] });
    { const nm = C.pid && PROF.list[C.pid] ? '👤 ' + PROF.list[C.pid].name + ' · 🪙 ' + PROF.list[C.pid].coins : '👤 ضيف (بدون جوايز)'; ctx.fillStyle = 'rgba(255,255,255,0.1)'; rrect(55, 319, 300, 46, 23); ctx.fill(); txt(nm + '  ⇄', 205, 343, { size: 18, weight: 900, color: C.pid ? '#ffd34d' : 'rgba(255,255,255,0.7)' }); txt(TOUCH_ON ? 'المس لتغيير الحساب' : 'Q لتغيير الحساب', 205, 380, { size: 14, weight: 700, color: 'rgba(255,255,255,0.45)' }); }
    const L = outfitList(C.cur), O = L[C.o % L.length], ci = O && O.as !== undefined ? O.as : C.cur, im = IMG['front' + (ci + 1)];
    if (im) { const hgt = 250, w = im.width * hgt / im.height; ctx.drawImage(im, VW / 2 - w / 2, 120, w, hgt); }
    txt(CHARS[ci].name, VW / 2 - 230, 230, { size: 44, weight: 900, color: '#fff', stroke: '#000', sw: 6 });
    txt(CHARS[ci].tag || '', VW / 2 - 230, 280, { size: 20, weight: 700, color: '#ffd34d' });
    if (L.length > 1) { ctx.fillStyle = 'rgba(255,211,77,0.9)'; rrect(VW / 2 - 130, 370, 260, 44, 22); ctx.fill(); txt('👕 ' + O.name + (TOUCH_ON ? ' · المس للتغيير' : ' · E للتغيير'), VW / 2, 393, { size: 19, weight: 900, color: '#111' }); }
    for (let i = 0; i < NCH; i++) {
      const [x, y] = cupGridPos(i), on = i === C.cur, f = IMG['face' + (i + 1)];
      ctx.save(); rrect(x - 40, y - 40, 80, 80, 12); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill(); ctx.clip(); if (f) ctx.drawImage(f, x - 40, y - 40, 80, 80); ctx.restore();
      ctx.lineWidth = on ? 4 : 1.5; ctx.strokeStyle = on ? CUP_COLS[C.pi] : 'rgba(255,255,255,0.25)'; rrect(x - 40, y - 40, 80, 80, 12); ctx.stroke();
      C.picks.forEach((pk, j) => { if (j < C.pi && pk.ci === i) txt(String(j + 1), x + 30, y - 30, { size: 18, font: FE, weight: 700, color: CUP_COLS[j], rtl: false, stroke: '#000', sw: 4 }); });
    }
    ctx.fillStyle = 'rgba(230,20,40,0.9)'; rrect(VW - 260, 630, 220, 60, 14); ctx.fill(); txt('تأكيد ✓', VW - 150, 661, { size: 26, weight: 900, color: '#fff' });
    txt(`${C.pi + 1} / ${C.n}`, 120, 661, { size: 26, font: FE, weight: 700, color: 'rgba(255,255,255,0.6)', rtl: false });
    return;
  }
  drawCupBg('🏆 الدوري', C.phase === 'champ' ? null : C.phase === 'draw' ? 'القرعة…' : (() => { const m = cupNext(); return m ? CUP_ROUNDS[m.r] : ''; })());
  const pos = [];
  for (let i = 0; i < 8; i++) { const L = i < 4, j = i % 4; pos.push([L ? 125 : VW - 125, [175, 245, 405, 475][j]]); }
  const sfp = [[330, 210], [330, 440], [VW - 330, 210], [VW - 330, 440]], fp = [[VW / 2 - 165, 325], [VW / 2 + 165, 325]];
  const nm = C.phase === 'bracket' && !C.sim ? cupNext() : C.sim ? C.sim.m : null;
  const line = (x1, y1, x2, y2, hot) => { ctx.strokeStyle = hot ? '#ffd34d' : 'rgba(255,255,255,0.22)'; ctx.lineWidth = hot ? 4 : 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2, y1); ctx.lineTo((x1 + x2) / 2, y2); ctx.lineTo(x2, y2); ctx.stroke(); };
  for (let i = 0; i < 8; i++) line(pos[i][0], pos[i][1], sfp[i >> 1][0], sfp[i >> 1][1], C.R[1][i >> 1] === C.R[0][i]);
  for (let k = 0; k < 4; k++) line(sfp[k][0], sfp[k][1], fp[k >> 1][0], fp[k >> 1][1], C.R[1][k] !== undefined && C.R[2][k >> 1] === C.R[1][k]);
  const st = (r, k, s) => { if (s === undefined) return ''; if (nm && nm.r === r && (nm.a === s || nm.b === s)) return 'next'; const nx = C.R[r + 1] && C.R[r + 1][k >> 1]; return nx === undefined ? '' : nx === s ? 'win' : 'out'; };
  const shuffling = C.phase === 'draw' && C.t < 60;
  for (let i = 0; i < 8; i++) { const s = C.R[0][i]; cupCard(pos[i][0], pos[i][1], shuffling ? C.ent[(i + ((C.t / 4) | 0) * 3) % 8] : C.ent[s], shuffling ? '' : st(0, i, s)); }
  for (let k = 0; k < 4; k++) { const s = C.R[1][k]; cupCard(sfp[k][0], sfp[k][1], s === undefined ? null : C.ent[s], st(1, k, s), 160); }
  for (let k = 0; k < 2; k++) { const s = C.R[2][k]; cupCard(fp[k][0], fp[k][1], s === undefined ? null : C.ent[s], st(2, k, s), 160); }
  txt('ربع النهائي', 125, 135, { size: 18, weight: 800, color: 'rgba(255,255,255,0.5)' }); txt('ربع النهائي', VW - 125, 135, { size: 18, weight: 800, color: 'rgba(255,255,255,0.5)' });
  txt('نصف النهائي', 330, 160, { size: 18, weight: 800, color: 'rgba(255,255,255,0.5)' }); txt('نصف النهائي', VW - 330, 160, { size: 18, weight: 800, color: 'rgba(255,255,255,0.5)' });
  txt('النهائي', VW / 2, 270, { size: 22, weight: 900, color: '#ffd34d' }); txt('VS', VW / 2, 327, { size: 30, font: FE, weight: 700, color: '#ff3b4a', rtl: false });
  const champ = C.R[3][0];
  // trophy
  ctx.save(); ctx.translate(VW / 2, 190); const g = ctx.createLinearGradient(0, -50, 0, 40); g.addColorStop(0, '#fff3b0'); g.addColorStop(0.5, '#ffd34d'); g.addColorStop(1, '#b07a00'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-32, -48); ctx.lineTo(32, -48); ctx.quadraticCurveTo(30, 6, 0, 12); ctx.quadraticCurveTo(-30, 6, -32, -48); ctx.fill(); ctx.fillRect(-6, 10, 12, 20); ctx.fillRect(-22, 28, 44, 10);
  ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(-34, -28, 14, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(34, -28, 14, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); ctx.restore();
  if (C.sim) { const k = C.sim.t; txt('🤖 الكمبيوتر يلعب' + '.'.repeat(1 + ((k / 12) | 0) % 3), VW / 2, 600, { size: 28, weight: 900, color: '#9fd8ff' }); }
  else if (C.phase === 'bracket' && nm) { const A = C.ent[nm.a], B = C.ent[nm.b]; txt(`${CHARS[cupEff(A)].name} (${cupName(A)})  ضد  ${CHARS[cupEff(B)].name} (${cupName(B)})`, VW / 2, 585, { size: 26, weight: 900, color: '#fff' });
    const how = A.h < 0 && B.h < 0 ? 'الكمبيوتر يلعبها' : A.h >= 0 && B.h >= 0 ? `${cupName(A)} ضد ${cupName(B)} على نفس الجهاز` : 'ضد الكمبيوتر';
    if (G.frame % 60 < 44) txt((TOUCH_ON ? 'المس الشاشة' : 'اضغط Enter') + ' للعب · ' + how, VW / 2, 625, { size: 21, weight: 800, color: '#ffd34d' }); }
  { const R2 = C.rw.filter(r => r.t++ < 200); R2.forEach((r, i) => { const e = C.ent[r.s]; txt(`💰 ${cupName(e)} (${r.place}): ${r.n ? '+' + r.n + ' 🪙' : 'ضيف بدون جوايز'}`, VW / 2, 120 + i * 26, { size: 19, weight: 900, color: r.n ? '#ffd34d' : 'rgba(255,255,255,0.6)', stroke: '#000', sw: 4 }); }); }
  if (C.last && C.phase === 'bracket' && C.t < 120) { const e = C.ent[C.last.s]; txt(`فاز ${CHARS[cupEff(e)].name} (${cupName(e)}) ✓`, VW / 2, 660, { size: 22, weight: 800, color: '#5be37d' }); }
  if (C.phase === 'champ' && champ !== undefined) {
    const e = C.ent[champ], ci = cupEff(e), im = IMG['vs' + (ci + 1)], k = Math.min(1, C.t / 30);
    ctx.fillStyle = `rgba(0,0,0,${0.75 * k})`; ctx.fillRect(0, 0, VW, VH); ctx.save(); ctx.globalAlpha = k;
    if (im) { const hgt = 480, w = im.width * hgt / im.height; ctx.drawImage(im, VW / 2 - w / 2, VH - hgt, w, hgt); }
    txt('🏆 بطل الدوري', VW / 2, 90, { size: 64, weight: 900, color: '#ffd34d', stroke: '#000', sw: 8, glow: '#ffb000' });
    txt(CHARS[ci].name, VW / 2, 170, { size: 56, weight: 900, color: '#fff', stroke: '#000', sw: 8 });
    txt(cupName(e), VW / 2, 222, { size: 30, weight: 900, color: e.h >= 0 ? CUP_COLS[e.h] : '#9fd8ff', stroke: '#000', sw: 5 });
    C.rw.filter(r => r.n).forEach((r, i) => txt(`💰 ${cupName(C.ent[r.s])}: +${r.n} 🪙 (${r.place})`, 230, 300 + i * 34, { size: 22, weight: 900, color: '#ffd34d', stroke: '#000', sw: 5 }));
    if (C.t > 60 && G.frame % 60 < 44) txt(TOUCH_ON ? 'المس للرجوع' : 'Enter للرجوع', VW / 2, 690, { size: 20, weight: 800, color: 'rgba(255,255,255,0.8)', stroke: '#000', sw: 4 });
    ctx.restore();
    const cc = ['#ffd34d', '#ffffff', '#ff3b4a', '#3ea0ff', '#5be37d']; for (let i = 0; i < 70; i++) { const x = (i * 97 + C.t * (1 + i % 3)) % VW, y = ((i * 53 + C.t * (2 + i % 4)) % (VH + 40)) - 20; ctx.save(); ctx.translate(x, y); ctx.rotate(C.t * 0.1 + i); ctx.fillStyle = cc[i % 5]; ctx.fillRect(-5, -3, 10, 6); ctx.restore(); }
  }
}
const TITLE_MENU = [['2p', 'لاعب ضد لاعب'], ['cpu', 'ضد الكمبيوتر'], ['train', 'التدريب 🎯'], ['cup', 'الدوري 🏆'], ['world', 'العالم المفتوح + القصة 📜'], ['shop', 'الملابس 👕'], ['story', 'قصة الكأس 📖'], ['online', 'أونلاين 🌐'], ['set', 'الإعدادات']], MENU_Y0 = 384, MENU_DY = 28;
function updTitle() {
  G.t++;
  if (G.settingsOpen) { if (updSettings()) G.settingsOpen = false; return; }
  if (G.t === 40) statsAskName(false);
  const up = pads[0].p.up || pads[1].p.up, dn = pads[0].p.down || pads[1].p.down;
  const NM = TITLE_MENU.length;
  if (up) { G.menuIdx = (G.menuIdx + NM - 1) % NM; SFX.move(); }
  if (dn) { G.menuIdx = (G.menuIdx + 1) % NM; SFX.move(); }
  if (G.tap && G.tap[0] < 330 && G.tap[1] > VH - 74) { shopOpen(); return; }
  if (G.tap) { const i = Math.round((G.tap[1] - MENU_Y0) / MENU_DY); if (i >= 0 && i < NM && Math.abs(G.tap[0] - VW / 2) < 300) G.menuIdx = i; }
  if (pads[0].p.ok || pads[1].p.ok || anyP('Click')) { if (G.t > 10) { SFX.ok(); const id = TITLE_MENU[G.menuIdx][0];
    if (id === 'set') { G.settingsOpen = true; setIdx = 0; } else if (id === 'online') { G.scene = 'online'; G.t = 0; NET.ui = 'menu'; NET.idx = 0; } else if (id === 'story') { storyMapOpen(); } else if (id === 'cup') { cupOpen(); } else if (id === 'shop') { shopOpen(); } else if (id === 'world') { worldOpen(); } else { G.mode = id; G.toSelect(); } } }
}
function drawTitle() {
  drawStage({ x: Math.sin(G.frame * 0.003) * 120, z: 1, yaw: Math.sin(G.frame * 0.004) * 0.5 }, G.frame);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, VW, VH);
  // characters line-up
  for (const back of [true, false]) for (let i = 0; i < NCH; i++) {
    if ((i % 2 === 0) !== back) continue;
    const im = IMG['front' + (i + 1)]; const hgt = back ? 300 : 345, w = im.width * hgt / im.height;
    const bob = Math.sin(G.frame * 0.04 + i) * 4, x = 70 + i * (1140 / (NCH - 1));
    ctx.save(); ctx.globalAlpha = back ? 0.7 : 0.97; ctx.drawImage(im, x - w / 2, (back ? 335 : 355) + bob, w, hgt); ctx.restore();
  }
  const gr = ctx.createLinearGradient(0, 380, 0, VH); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0.95)');
  ctx.fillStyle = gr; ctx.fillRect(0, 380, VW, VH - 380);
  // logo
  const pulse = 1 + Math.sin(G.frame * 0.05) * 0.015;
  ctx.save(); ctx.translate(VW / 2, 150); ctx.scale(pulse, pulse);
  ctx.save(); ctx.rotate(-0.04); ctx.fillStyle = 'rgba(220,20,40,0.9)'; ctx.fillRect(-380, 50, 760, 10); ctx.restore();
  txt('معركة الشلة', 0, -8, { size: 128, weight: 900, color: '#ffffff', stroke: '#1a0004', sw: 14, glow: '#ff1030', glowBlur: 40 });
  txt('SHILLA FIGHT', 0, 92, { size: 52, font: FE, weight: 700, color: '#ff2a3a', italic: true, rtl: false, stroke: '#000', sw: 6 });
  txt('v' + GAME_VER, 560, 120, { size: 18, font: FE, weight: 700, color: 'rgba(255,255,255,0.45)', rtl: false });
  ctx.restore();
  // menu
  { const P = profCur(); if (P) { ctx.fillStyle = 'rgba(0,0,0,0.45)'; rrect(16, VH - 60, 300, 40, 20); ctx.fill(); txt('👤 ' + P.name + '  ·  🪙 ' + P.coins, 166, VH - 39, { size: 18, weight: 900, color: '#ffd34d' }); } }
  { ctx.save(); const g = ctx.createLinearGradient(VW / 2 - 260, 0, VW / 2 + 260, 0); g.addColorStop(0, 'rgba(4,5,12,0)'); g.addColorStop(0.2, 'rgba(4,5,12,0.72)'); g.addColorStop(0.8, 'rgba(4,5,12,0.72)'); g.addColorStop(1, 'rgba(4,5,12,0)'); ctx.fillStyle = g; ctx.fillRect(VW / 2 - 260, MENU_Y0 - 24, 520, TITLE_MENU.length * MENU_DY + 18); ctx.restore(); }
  TITLE_MENU.forEach(([, o], i) => {
    const y = MENU_Y0 + i * MENU_DY, sel = i === G.menuIdx;
    if (sel) {
      ctx.save(); ctx.fillStyle = 'rgba(230,20,40,0.9)'; ctx.shadowColor = '#ff1030'; ctx.shadowBlur = 25;
      ctx.beginPath(); ctx.moveTo(VW / 2 - 200, y - 14); ctx.lineTo(VW / 2 + 220, y - 14); ctx.lineTo(VW / 2 + 200, y + 14); ctx.lineTo(VW / 2 - 220, y + 14); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    txt(o, VW / 2, y + 2, { size: 24, weight: 800, color: sel ? '#fff' : 'rgba(255,255,255,0.55)' });
  });
  if (G.frame % 60 < 40) txt(TOUCH_ON ? 'المس الخيار اللي تبيه' : 'اختر بالأسهم أو W/S  ·  ابدأ بـ Enter أو Space', VW / 2, 636, { size: 20, weight: 700, color: 'rgba(255,255,255,0.75)' });
  if (!TOUCH_ON) txt('M: كتم الصوت  ·  N: الموسيقى', VW / 2, 700, { size: 16, weight: 600, color: 'rgba(255,255,255,0.35)' });
  const k0 = gpSlotKind(0), k1 = gpSlotKind(1);
  if (k0 || k1) txt(`🎮 ${[k0 ? 'اللاعب 1: ' + k0 : '', k1 ? 'اللاعب 2: ' + k1 : ''].filter(Boolean).join('   ·   ')}`, VW / 2, 652, { size: 18, weight: 700, color: '#9fd8ff' });
  else if (GP.blocked) txt('يد التحكم محجوبة في هذي الصفحة – افتح ملف اللعبة مباشرة في Chrome', VW / 2, 668, { size: 17, weight: 700, color: '#ff9f9f' });
  else if (!TOUCH_ON) txt('🎮 وصّل يد PS أو Xbox واضغط أي زر فيها', VW / 2, 668, { size: 17, weight: 700, color: 'rgba(255,255,255,0.45)' });
  if (!AC || AC.state !== 'running') txt(TOUCH_ON ? '🔈 المس الشاشة لتشغيل الصوت' : '🔈 اضغط على الشاشة بالماوس لتشغيل الصوت', VW / 2, 30, { size: 16, weight: 700, color: 'rgba(255,255,255,0.5)' });
}

function updSelect() {
  const S = G.sel; S.t++;
  const cpu = G.mode === 'cpu' || G.mode === 'train';
  const p1done = S.done[0];
  const online = G.mode === 'online';
  const ctrl = (slot) => {
    if (online) return slot === NET.slot ? netLocalPad() : null;
    if (cpu) return p1done ? (slot === 1 ? pads[0] : null) : (slot === 0 ? pads[0] : null);
    return pads[slot];
  };
  for (let s = 0; s < 2; s++) {
    const pd = ctrl(s); if (!pd) continue;
    if (S.done[s]) { if (pd.p.back) { S.done[s] = false; SFX.move(); } continue; }
    if (!S.outfit) S.outfit = [0, 0]; if (!S.panel) S.panel = [null, null];
    if (S.panel[s]) { // □ outfits panel is open for this player
      const n = outfitList(S.cur[s]).length;
      if (pd.p.left) { S.outfit[s] = ((S.outfit[s] | 0) + n - 1) % n; SFX.move(); }
      if (pd.p.right) { S.outfit[s] = ((S.outfit[s] | 0) + 1) % n; SFX.move(); }
      if (pd.p.ok || pd.p.b1 || pd.p.sp) { S.panel[s] = null; SFX.ok(); S.flash = [s, 8]; }
      else if (pd.p.back || pd.p.b4) { S.outfit[s] = S.panel[s].prev; S.panel[s] = null; SFX.move(); }
      continue;
    }
    if ((pd.p.b1 && !pd.p.ok) || pd.p.sp || pd.p.c12 || pd.p.c13) { S.panel[s] = { prev: S.outfit[s] | 0 }; SFX.ok(); continue; }
    if (pd.p.left) { S.cur[s] = (S.cur[s] + NCH - 1) % NCH; SFX.move(); }
    if (pd.p.right) { S.cur[s] = (S.cur[s] + 1) % NCH; SFX.move(); }
    if (pd.p.up || pd.p.down) { const c = S.cur[s]; S.cur[s] = c < 8 ? Math.min(c + 8, NCH - 1) : c - 8; SFX.move(); }
    if (pd.p.ok && S.t > 8) { S.done[s] = true; SFX.ok(); S.flash = [s, 14]; }
    else if (pd.p.back && cpu && s === 1) { S.done[0] = false; SFX.move(); }
    else if (pd.p.back && (!cpu || s === 0) && S.t > 8) { if (G.storyPick && G.storyMap) { SFX.move(); G.story = G.storyMap; G.storyMap = null; G.storyPick = false; storySelect(); return; } if (online) { netClose(); G.scene = 'online'; G.t = 0; return; } G.toTitle(); return; }
  }
  if (G.tap && S.t > 8) {
    const so = online ? NET.slot : (cpu && S.done[0] ? 1 : 0), ocx = so === 0 ? 200 : VW - 200;
    if (!S.outfit) S.outfit = [0, 0]; if (!S.panel) S.panel = [null, null];
    if (S.panel[so]) { const L = outfitList(S.cur[so]); let hit = -1; opanelCards(so, L.length).forEach(([x, y], i) => { if (G.tap[0] >= x && G.tap[0] <= x + OCW && G.tap[1] >= y && G.tap[1] <= y + OCH) hit = i; });
      if (hit >= 0) { if ((S.outfit[so] | 0) === hit) { S.panel[so] = null; SFX.ok(); S.flash = [so, 8]; } else { S.outfit[so] = hit; SFX.move(); } } else { S.panel[so] = null; SFX.ok(); } G.tap = null; return; }
    if (!S.done[so] && Math.abs(G.tap[0] - ocx) < 125 && Math.abs(G.tap[1] - 574) < 26) { S.panel[so] = { prev: S.outfit[so] | 0 }; SFX.ok(); G.tap = null; return; }
  }
  if (G.tap && S.t > 8) {
    const tw = 74, gap = 7, x0 = VW / 2 - (8 * tw + 7 * gap) / 2, ty0 = 185, rowH = tw + 40;
    const col = Math.floor((G.tap[0] - x0) / (tw + gap)), row = Math.floor((G.tap[1] - ty0) / rowH), s = online ? NET.slot : (cpu && S.done[0] ? 1 : 0);
    if (col >= 0 && col < 8 && row >= 0 && row < 2 && !S.done[s] && row * 8 + col < NCH) {
      const i = row * 8 + col;
      if (S.cur[s] === i) { S.done[s] = true; SFX.ok(); S.flash = [s, 14]; } else { S.cur[s] = i; SFX.move(); }
    }
  }
  if (online) { if (!NET.on) { G.scene = 'online'; G.t = 0; return; } netSelSync(); }
  if (G.storyPick && S.done[0]) { G.storyPick = false; storyStart(selCI(S, 0)); return; }
  if (S.done[0] && S.done[1]) { S.readyT++; if (S.readyT > 40 && (!online || NET.slot === 0)) { if (online) netStartMatch(); G.toVS(); } } else S.readyT = 0;
  if (S.flash) { S.flash[1]--; if (S.flash[1] <= 0) S.flash = null; }
}
function drawSelect() {
  const S = G.sel;
  drawStage({ x: 0, z: 1 }, G.frame);
  ctx.fillStyle = 'rgba(3,4,10,0.72)'; ctx.fillRect(0, 0, VW, VH);
  txt('اختر مقاتلك', VW / 2, 56, { size: 58, weight: 900, color: '#fff', glow: '#ff1030', glowBlur: 30 });
  const cpu = G.mode === 'cpu' || G.mode === 'train';
  if (G.mode === 'online') txt(S.done[NET.slot] ? (S.done[1 - NET.slot] ? 'يلا نبدأ!' : 'ننتظر صاحبك يختار...') : 'اختر شخصيتك · صاحبك يختار بنفس الوقت', VW / 2, 106, { size: 24, weight: 700, color: '#ffd34d' });
  else if (G.storyPick) txt('اختر بطل القصة 📖', VW / 2, 106, { size: 26, weight: 800, color: '#ffd34d' });
  else if (cpu) txt(S.done[0] ? (G.mode === 'train' ? 'اختر الدمية اللي تتدرب عليها' : 'اختر خصمك (الكمبيوتر)') : (G.mode === 'train' ? '🎯 التدريب — اختر شخصيتك' : 'اختر شخصيتك'), VW / 2, 106, { size: 24, weight: 700, color: '#ffd34d' });
  // big previews
  for (let s = 0; s < 2; s++) {
    const OF = outfitOf(S.cur[s], S.outfit && S.outfit[s]), ci = selCI(S, s), base = IMG['front' + (S.cur[s] + 1)], im = IMG['front' + (ci + 1)], C = CHARS[ci];
    const sc = 470 / base.height, hgt = im.height * sc, w = im.width * sc, cx = s === 0 ? 200 : VW - 200;
    const slide = S.done[s] ? 0 : Math.sin(G.frame * 0.05) * 3;
    ctx.save();
    const glow = ctx.createRadialGradient(cx, 420, 20, cx, 420, 300); glow.addColorStop(0, s === 0 ? 'rgba(40,120,255,0.35)' : 'rgba(255,40,60,0.35)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(cx - 300, 120, 600, 600);
    if (S.flash && S.flash[0] === s) { ctx.filter = 'brightness(2)'; }
    if (s === 1) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
    ctx.drawImage(im, cx - w / 2, 150 + 470 - hgt + slide, w, hgt);
    ctx.restore();
    const ny = 640;
    { // □ outfits button (every character)
      const py = 574, on = OF && OF.id; ctx.save(); ctx.fillStyle = on ? 'rgba(255,211,77,0.95)' : 'rgba(10,12,22,0.85)'; ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 2; rrect(cx - 118, py - 19, 236, 38, 19); ctx.fill(); ctx.stroke(); ctx.restore();
      const kh = TOUCH_ON || gpSlotKind(s) ? '□' : (G.mode === 'online' || s === 0 ? 'E' : 'U');
      txt('👕 ' + (OF ? OF.name : 'المظاهر') + '  ·  ' + kh, cx, py + 1, { size: 20, weight: 900, color: on ? '#1a1206' : '#ffd34d' });
    }
    ctx.save(); ctx.fillStyle = s === 0 ? 'rgba(30,100,230,0.85)' : 'rgba(220,30,50,0.85)';
    ctx.beginPath(); ctx.moveTo(cx - 170, ny - 34); ctx.lineTo(cx + 185, ny - 34); ctx.lineTo(cx + 170, ny + 30); ctx.lineTo(cx - 185, ny + 30); ctx.closePath(); ctx.fill(); ctx.restore();
    txt(C.name, cx, ny - 4, { size: 44, weight: 900, color: '#fff', stroke: '#000', sw: 4 });
    txt(C.tag, cx, ny + 50, { size: 20, weight: 700, color: 'rgba(255,255,255,0.75)' });
    txt(G.mode === 'online' ? (s === NET.slot ? 'YOU' : 'FRIEND') : (s === 0 ? '1P' : (cpu ? (G.mode === 'train' ? 'DUMMY' : 'CPU') : '2P')), cx, 140, { size: 44, font: FE, weight: 700, color: s === 0 ? '#3ea0ff' : '#ff3b4a', rtl: false, italic: true });
    { const kd = gpSlotKind(s); if (kd && !(cpu && s === 1)) txt('🎮 ' + kd, cx + (s === 0 ? 105 : -105), 142, { size: 24, font: FE, weight: 700, color: '#9fd8ff', rtl: false }); }
    if (S.done[s]) {
      ctx.save(); ctx.translate(cx, 400); ctx.rotate(-0.12);
      txt('جاهز!', 0, 0, { size: 70, weight: 900, color: '#ffd34d', stroke: '#000', sw: 8, glow: '#ff8a00' }); ctx.restore();
    }
  }
  // tiles
  const tw = 74, gap = 7, total = 8 * tw + 7 * gap, x0 = VW / 2 - total / 2, ty0 = 185, rowH = tw + 40;
  const tpos = i => [x0 + (i % 8) * (tw + gap), ty0 + ((i / 8) | 0) * rowH];
  for (let i = 0; i < NCH; i++) {
    const [x, ty] = tpos(i);
    ctx.save();
    ctx.fillStyle = '#0d1020'; ctx.fillRect(x, ty, tw, tw);
    ctx.drawImage(IMG['face' + (i + 1)], x, ty, tw, tw);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.strokeRect(x, ty, tw, tw);
    ctx.restore();
    txt(CHARS[i].name, x + tw / 2, ty + tw + 16, { size: 14, weight: 800, color: 'rgba(255,255,255,0.85)' });
  }
  for (let s = 0; s < 2; s++) {
    const i = S.cur[s], [x, ty] = tpos(i), both = S.cur[0] === S.cur[1];
    const col = s === 0 ? '#3ea0ff' : '#ff3b4a';
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.shadowColor = col; ctx.shadowBlur = 18;
    const ins = both && s === 1 ? 8 : 0;
    ctx.strokeRect(x - 4 + ins, ty - 4 + ins, tw + 8 - ins * 2, tw + 8 - ins * 2); ctx.restore();
    ctx.save(); ctx.fillStyle = col; const lx = s === 0 ? x : x + tw - 44;
    ctx.fillRect(lx, ty, 44, 24); ctx.restore();
    txt(s === 0 ? '1P' : (cpu ? (G.mode === 'train' ? 'DUMMY' : 'CPU') : '2P'), lx + 22, ty + 13, { size: 22, font: FE, weight: 700, color: '#fff', rtl: false });
  }
  // stats for both
  const statN = ['قوة', 'سرعة', 'تحمّل'];
  for (let s = 0; s < 2; s++) {
    const C = CHARS[selCI(S, s)], bx = s === 0 ? 430 : VW - 430 - 180, by = 486;
    for (let j = 0; j < 3; j++) {
      const y = by + j * 34;
      txt(statN[j], bx + 220, y, { size: 18, weight: 700, color: 'rgba(255,255,255,0.7)', align: 'right' });
      for (let q = 0; q < 5; q++) { ctx.fillStyle = q < C.stats[j] ? (s === 0 ? '#3ea0ff' : '#ff3b4a') : 'rgba(255,255,255,0.12)'; ctx.fillRect(bx + q * 30, y - 8, 26, 16); }
    }
    txt('المهارة: ' + SKILL_NAMES[selCI(S, s)], bx + 110, by + 110, { size: 19, weight: 800, color: '#ffd34d' });
  }
  // key hints under each side
  const hintRow = (cx, mv, okk, bk) => {
    keycap(mv[0], cx - 150, 700, 34); keycap(mv[1], cx - 112, 700, 34);
    txt('تنقّل', cx - 62, 702, { size: 16, weight: 700, color: 'rgba(255,255,255,0.6)' });
    keycap(okk, cx + 4, 700, 34, '#ffd34d'); txt('اختيار', cx + 52, 702, { size: 16, weight: 700, color: 'rgba(255,255,255,0.6)' });
    keycap(bk, cx + 110, 700, 34); txt('رجوع', cx + 152, 702, { size: 16, weight: 700, color: 'rgba(255,255,255,0.6)' });
  };
  if (TOUCH_ON) {
    txt('المس الصورة مرتين للاختيار  ·  أو العصا للتنقّل', VW / 2 + 40, 700, { size: 17, weight: 700, color: 'rgba(255,255,255,0.75)' });
  } else if (gpSlotKind(0) || gpSlotKind(1)) {
    padGlyph('x', VW / 2 + 150, 662, 12); txt('اختيار', VW / 2 + 108, 663, { size: 16, weight: 700, color: 'rgba(255,255,255,0.7)' });
    padGlyph('o', VW / 2 + 50, 662, 12); txt('رجوع', VW / 2 + 12, 663, { size: 16, weight: 700, color: 'rgba(255,255,255,0.7)' });
    txt('Share/View', VW / 2 - 60, 663, { size: 18, font: FE, weight: 700, color: '#9fd8ff', rtl: false });
    txt('تبديل اللاعب', VW / 2 - 150, 663, { size: 16, weight: 700, color: 'rgba(255,255,255,0.7)' });
  }
  if (S.panel) for (let s = 0; s < 2; s++) if (S.panel[s]) drawOutfitPanel(S, s);
  const solo = cpu || G.mode === 'online';
  if (!TOUCH_ON) hintRow(solo ? VW / 2 : 470, ['A', 'D'], 'R', 'T');
  if (!solo && !TOUCH_ON) hintRow(VW - 470, ['←', '→'], 'I', 'O');
}

function updVS() {
  G.t++;
  if (G.t === 20) say('Versus');
  if (G.t === 26) SFX.ko();
  if (G.t > 170 || (G.t > 40 && (pads[0].p.ok || pads[1].p.ok))) G.toFight();
}
function drawVS() {
  const t = G.t, S = G.sel;
  ctx.fillStyle = '#05060b'; ctx.fillRect(0, 0, VW, VH);
  // diagonal halves
  ctx.save();
  ctx.fillStyle = '#0e2a5a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(VW / 2 + 90, 0); ctx.lineTo(VW / 2 - 90, VH); ctx.lineTo(0, VH); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a0e18'; ctx.beginPath(); ctx.moveTo(VW / 2 + 90, 0); ctx.lineTo(VW, 0); ctx.lineTo(VW, VH); ctx.lineTo(VW / 2 - 90, VH); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(255,255,255,${0.02 + (i % 3) * 0.01})`; const y = ((i * 97 + t * (4 + i % 5)) % (VH + 100)) - 50; ctx.fillRect(0, y, VW, 2); }
  ctx.restore();
  for (let s = 0; s < 2; s++) {
    const bossVS = s === 1 && G.story && G.story.ch === 4;
    const vci = selCI(S, s), OFv = outfitOf(vci, S.outfit && S.outfit[s]), vb = IMG['vs' + (vci + 1)], vi = imgOf('vs', vci, OFv && OFv.id);
    const im = bossVS ? shadowOf(vb) : vi; const u = easeOut(clamp(t / 30, 0, 1));
    const hgt = im.height * 600 / vb.height, w = im.width * hgt / im.height;
    ctx.save();
    // clip each portrait to its own half so it never covers the opponent
    ctx.beginPath();
    if (s === 0) { ctx.moveTo(0, 0); ctx.lineTo(VW / 2 + 90, 0); ctx.lineTo(VW / 2 - 90, VH); ctx.lineTo(0, VH); }
    else { ctx.moveTo(VW / 2 + 90, 0); ctx.lineTo(VW, 0); ctx.lineTo(VW, VH); ctx.lineTo(VW / 2 - 90, VH); }
    ctx.closePath(); ctx.clip();
    if (s === 0) { const cx = lerp(-w / 2, VW * 0.28, u); ctx.drawImage(im, cx - w / 2, VH - hgt, w, hgt); }
    else { const cx = lerp(VW + w / 2, VW * 0.72, u); ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.drawImage(im, -w / 2, VH - hgt, w, hgt); }
    ctx.restore();
    const C = CHARS[selCI(S, s)];
    const nx = s === 0 ? lerp(-400, 260, u) : lerp(VW + 400, VW - 260, u);
    const vnm = (G.vsName && G.vsName[s]) || (bossVS ? 'ظل ' + C.name : C.name);
    txt(vnm, s === 0 ? nx : Math.min(nx, VW - 40 - vnm.length * 17), 640, { size: vnm.length > 12 ? 54 : bossVS ? 64 : 76, weight: 900, color: bossVS ? '#e0b0ff' : '#fff', stroke: '#000', sw: 8, glow: s === 0 ? '#3ea0ff' : bossVS ? '#b030ff' : '#ff3b4a', glowBlur: 30 });
    txt(bossVS ? 'SHADOW ' + C.en : C.en, nx, 690, { size: 34, font: FE, weight: 600, color: s === 0 ? '#7fc0ff' : '#ff8090', italic: true, rtl: false });
  }
  ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.shadowColor = '#ffd34d'; ctx.shadowBlur = 25;
  ctx.beginPath(); ctx.moveTo(VW / 2 + 90, 0); ctx.lineTo(VW / 2 - 90, VH); ctx.stroke(); ctx.restore();
  const vu = clamp((t - 25) / 15, 0, 1);
  if (vu > 0) {
    ctx.save(); ctx.translate(VW / 2, VH / 2 - 20); const sc = lerp(3, 1, easeOut(vu)); ctx.scale(sc, sc); ctx.globalAlpha = vu;
    txt('VS', 0, 0, { size: 190, font: FE, weight: 700, color: '#ffd34d', stroke: '#000', sw: 12, italic: true, glow: '#ff8a00', glowBlur: 50, rtl: false });
    ctx.restore();
  }
}

function updResult() {
  G.t++;
  if (G.mode === 'online') {
    if (!NET.on) { G.scene = 'online'; G.t = 0; return; }
    if (NET.slot === 0 && G.t === 1) netSend({ t: 'res', m: NET.m, w: G.res.w, wins: G.res.wins, ci: G.res.ci });
    if (NET.slot === 1 && NET.res && NET.res.m === NET.m && (NET.res.w !== G.res.w)) { G.res.w = NET.res.w | 0; G.res.wins = NET.res.wins; G.res.ci = NET.res.ci | 0; }
    if (G.t > 40) {
      const lp = netLocalPad();
      if (lp.p.ok || (TOUCH_ON && G.tap)) { SFX.ok(); G.toSelect(); G.sel.done = [false, false]; }
      else if (anyP('Escape', 'Backspace') || lp.p.back) { SFX.move(); netClose(); G.scene = 'online'; G.t = 0; }
    }
    return;
  }
  if (G.t > 40) {
    if (pads[0].p.ok || pads[1].p.ok || (TOUCH_ON && G.tap)) { SFX.ok(); G.toVS(); G.t = 110; }
    else if (anyP('Escape', 'Backspace') || pads[0].p.back || pads[1].p.back) { SFX.move(); G.toSelect(); }
  }
}
function drawResult() {
  const R = G.res, C = CHARS[R.ci], t = G.t;
  drawStage({ x: 0, z: 1 }, G.frame, G.stageId);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, VW, VH);
  const OFr = outfitOf(R.ci, G.sel && G.sel.outfit && G.sel.outfit[R.w]), rb = IMG['vs' + (R.ci + 1)], im = imgOf('vs', R.ci, OFr && OFr.id), hgt = im.height * 640 / rb.height, w = im.width * hgt / im.height, u = easeOut(clamp(t / 30, 0, 1));
  ctx.save(); ctx.globalAlpha = u; ctx.drawImage(im, lerp(-200, 0, u) + 380 - w / 2, VH - hgt, w, hgt); ctx.restore();
  const col = R.w === 0 ? '#3ea0ff' : '#ff3b4a';
  ctx.save(); ctx.globalAlpha = u;
  txt(G.mode === 'online' ? (R.w === NET.slot ? 'YOU WIN!' : 'YOU LOSE') : R.w === 0 ? 'PLAYER 1 WINS' : (G.mode === 'cpu' ? 'CPU WINS' : 'PLAYER 2 WINS'), 920, 170, { size: 72, font: FE, weight: 700, color: col, italic: true, stroke: '#000', sw: 8, rtl: false, glow: col, glowBlur: 30 });
  txt('الفائز', 920, 250, { size: 40, weight: 800, color: 'rgba(255,255,255,0.75)' });
  txt(C.name, 920, 330, { size: 110, weight: 900, color: '#fff', stroke: '#000', sw: 10, glow: '#ff1030', glowBlur: 35 });
  txt(`«${C.quote}»`, 920, 430, { size: 34, weight: 700, color: '#ffd34d' });
  txt(`${R.wins[0]} - ${R.wins[1]}`, 920, 500, { size: 64, font: FE, weight: 700, color: '#fff', rtl: false });
  if (t > 40 && G.frame % 60 < 42) {
    txt(G.mode === 'online' ? (TOUCH_ON ? '✕ : اختيار ثاني مع صاحبك' : 'Enter / R : مباراة ثانية مع صاحبك') : TOUCH_ON ? '✕ : مباراة جديدة' : 'Enter / R : مباراة جديدة', 920, 590, { size: 26, weight: 800, color: '#fff' });
    txt(G.mode === 'online' ? (TOUCH_ON ? '○ : طلوع من الغرفة' : 'Esc / T : طلوع من الغرفة') : TOUCH_ON ? '○ : اختيار الشخصيات' : 'Esc / T : اختيار الشخصيات', 920, 632, { size: 22, weight: 700, color: 'rgba(255,255,255,0.65)' });
  }
  ctx.restore();
}

function touchPanel() {
  ctx.save(); ctx.fillStyle = 'rgba(5,7,14,0.78)'; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(240, 370, 800, 250, 16) : ctx.rect(240, 370, 800, 250); ctx.fill(); ctx.stroke(); ctx.restore();
  txt('التحكم باللمس', VW / 2, 402, { size: 26, weight: 900, color: '#ffd34d' });
  const rows = [['العصا يسار', 'الحركة · فوق فوق / تحت تحت = خطوة جانبية'], ['○ ✕ △ □', 'لكمة يسار · لكمة يمين · ركلة يسار · ركلة يمين'], ['★', 'المهارة الخاصة (كل 10 ثواني)'], ['L1 R1 R2 · L2', 'حركات الزرين بلمسة · L2 = تفادي المهارات'], ['💥', 'زر القاضية — يطلع لما دمك يقل عن 30%'], ['❚❚', 'إيقاف مؤقت وقائمة الحركات']];
  rows.forEach(([a, b], i) => { const y = 446 + i * 36; txt(a, 820, y, { size: 20, weight: 800, color: '#7dffb0', align: 'right' }); txt(b, 600, y, { size: 19, weight: 700, color: '#fff', align: 'right' }); });
}
function drawBoot() {
  ctx.fillStyle = '#05060b'; ctx.fillRect(0, 0, VW, VH);
  if (!BACKDROP) { txt('...جاري التحميل', VW / 2, VH / 2, { size: 40, weight: 800, color: '#fff' }); return; }
  drawStage({ x: 0, z: 1 }, G.frame);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, VW, VH);
  txt('معركة الشلة', VW / 2, 170, { size: 120, weight: 900, color: '#fff', stroke: '#1a0004', sw: 12, glow: '#ff1030', glowBlur: 40 });
  if (G.frame % 60 < 42) txt('اضغط هنا أو أي زر للبدء', VW / 2, 300, { size: 40, weight: 800, color: '#ffd34d' });
  if (TOUCH_ON) { touchPanel(); return; }
  txt('يدعم الكيبورد ويد PS4 / PS5 / Xbox والجوال', VW / 2, 352, { size: 22, weight: 700, color: 'rgba(255,255,255,0.7)' });
  controlsPanel(VW / 2, 500, 1);
}

// ================= MAIN LOOP =================
let last = 0, acc = 0;
function tick() {
  TP = pressQ; pressQ = new Set(); G.tap = tapQ; tapQ = null;
  gpPoll();
  if (GP.start) TP.add('GPStart');
  if (GP.anyPress) { started = true; audioInit(); }
  pads[0].read(); pads[1].read();
  if (TOAST) { TOAST.t++; if (TOAST.t > 200) TOAST = null; }
  if (NET.on && G.frame % 30 === 0) { netSend({ t: 'ping', a: performance.now() }); if (performance.now() - NET.lastRx > 12000) netLost(); }
  if (TP.has('KeyM')) setMute(!muted);
  if (TP.has('KeyN')) { setMusic(!musicOn); toast(musicOn ? 'الموسيقى: تشغيل' : 'الموسيقى: إيقاف'); }
  if (TP.has('Backquote')) G.debug = !G.debug;
  G.frame++;
  switch (G.scene) {
    case 'boot': if (started && BACKDROP && (TP.size > 0 || GP.anyPress)) { G.toTitle(); } break;
    case 'title': updTitle(); break;
    case 'select': updSelect(); break;
    case 'vs': updVS(); break;
    case 'fight': if (G.mode === 'online') { netFightTick(); break; } if (G.fight.pads[1].cpu) G.fight.pads[1].read(); G.fight.update(); break;
    case 'online': updOnline(); break;
    case 'story': updStory(); break;
    case 'cup': updCup(); break;
    case 'shop': updShop(); break;
    case 'world': updWorld(); break;
    case 'result': updResult(); break;
  }
}
function render() {
  if (ctx.resetTransform) ctx.resetTransform(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(SC * DPR, 0, 0, SC * DPR, OX, OY);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.clip();
  switch (G.scene) {
    case 'boot': drawBoot(); break;
    case 'title': drawTitle(); if (G.settingsOpen) drawSettings(); break;
    case 'select': drawSelect(); break;
    case 'vs': drawVS(); break;
    case 'fight': G.fight.draw(); if (G.mode === 'online') drawNetOverlay(); break;
    case 'online': drawOnline(); break;
    case 'story': drawStory(); break;
    case 'cup': drawCup(); break;
    case 'shop': drawShop(); break;
    case 'world': drawWorld(); break;
    case 'result': drawResult(); break;
  }
  if (muted) txt('🔇', VW - 30, 30, { size: 24, rtl: false });
  if (TOAST) {
    const a = Math.min(1, TOAST.t / 10) * Math.min(1, (200 - TOAST.t) / 20);
    ctx.save(); ctx.globalAlpha = a; ctx.font = `800 24px ${FA}`; const w = ctx.measureText(TOAST.text).width + 70;
    ctx.fillStyle = 'rgba(10,14,30,0.92)'; ctx.strokeStyle = '#3ea0ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(VW / 2 - w / 2, 118, w, 46, 23) : ctx.rect(VW / 2 - w / 2, 118, w, 46); ctx.fill(); ctx.stroke();
    txt('🎮 ' + TOAST.text, VW / 2, 142, { size: 24, weight: 800, color: '#fff' }); ctx.restore();
  }
  if (window.__overlay) window.__overlay(ctx, G);
  drawErr();
  ctx.restore();
  tcFrame();
}
function loop(ts) {
  if (!last) last = ts;
  acc += Math.min(100, ts - last); last = ts;
  let n = 0;
  try {
    while (acc >= 1000 / 60 && n < 5) { if (!window.__hold) tick(); acc -= 1000 / 60; n++; }
    render();
  } catch (er) { gameError(er); }
  requestAnimationFrame(loop);
}
// an error must never freeze the game: log it, close any half-finished finisher, keep running
let ERR_SHOW = null;
function gameError(er) {
  try {
    console.error(er); window.__errs = (window.__errs || []).concat(String(er && er.message || er)).slice(-10);
    ERR_SHOW = { msg: String(er && er.message || er).slice(0, 80), t: 300 };
    const F = G.fight;
    if (F) { if (F.fin) { finEnd(F.fin.a, F.fin.d); F.fin = null; } F.cutin = null; F.zoomT = 0; F.freeze = 0;
      for (const f of F.f) if (['rageSeq', 'rageVic', 'rushSeq'].includes(f.state)) { f.y = 0; f.mv = null; f.setState('idle'); } }
  } catch (e2) { }
}
function drawErr() { if (!ERR_SHOW) return; if (--ERR_SHOW.t <= 0) { ERR_SHOW = null; return; } try { ctx.save(); ctx.globalAlpha = Math.min(1, ERR_SHOW.t / 30); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(8, VH - 34, 700, 26); ctx.fillStyle = '#ffb04d'; ctx.font = '14px monospace'; ctx.textAlign = 'left'; ctx.direction = 'ltr'; ctx.fillText('⚠ ' + ERR_SHOW.msg, 16, VH - 16); ctx.restore(); } catch (e) { } }
window.__step = (n = 1) => { for (let i = 0; i < n; i++) tick(); render(); };
window.__tick = (n = 1) => { for (let i = 0; i < n; i++) tick(); };

async function boot() {
  requestAnimationFrame(loop);
  const fontP = (document.fonts && document.fonts.load) ? Promise.race([Promise.all([document.fonts.load(`900 40px Cairo`), document.fonts.load(`700 40px Teko`), document.fonts.load(`800 40px Cairo`)]), new Promise(r => setTimeout(r, 2500))]).catch(() => { }) : Promise.resolve();
  await Promise.all([loadImages(), fontP]);
  malaliAssets(); for (let i = 0; i < CHARS.length; i++) RIGS[i] = buildRig(i);
  BACKDROP = makeBackdrop();
  cv.focus();
}
boot();
})();
