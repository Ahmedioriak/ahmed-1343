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
  { name: 'الزعيم', en: 'AL-ZAEEM', h: 0.82, tag: 'قبضة الشوارع', hp: 1.08, dmg: 1.0, spd: 0.96, color: '#ff4d3d', stats: [4, 3, 5], quote: 'قلت لك لا تلعب معي!' },
  { name: 'الوحش', en: 'AL-WAHSH', tag: 'عضلات من حديد', hp: 1.0, dmg: 1.12, spd: 0.93, color: '#ff2a55', stats: [5, 3, 4], quote: 'روح تمرّن وتعال!' },
  { name: 'الكابتن', en: 'CAPTAIN', tag: 'سرعة البرق', hp: 0.94, dmg: 0.95, spd: 1.15, color: '#f2f2f2', stats: [3, 5, 3], quote: 'أسرع منك بمليون مرة' },
  { name: 'الدكتور', en: 'THE DOCTOR', tag: 'العقل المدبّر', hp: 1.0, dmg: 1.03, spd: 1.0, color: '#e6c37a', stats: [4, 4, 4], quote: 'حسبتها قبل لا تبدأ' },
  { name: 'الحارس', en: 'THE KEEPER', tag: 'ما يعدّي منه شي', hp: 1.03, dmg: 1.0, spd: 1.03, color: '#ffd21f', stats: [3, 4, 4], quote: 'ولا كورة تعدّي… ولا ضربة!' },
  { name: 'البلدوزر', en: 'BULLDOZER', tag: 'يكسر اللي قدامه', hp: 1.12, dmg: 1.1, spd: 0.88, color: '#c9ccd6', stats: [5, 2, 5], quote: 'قلت لك وخّر من دربي' },
  { name: 'المعلّم', en: 'AL-MUALLIM', tag: 'هادي… بس لا تستفزه', hp: 1.15, dmg: 1.05, spd: 0.87, color: '#7c8f5a', stats: [4, 2, 5], quote: 'الدرس خلص… روح البيت' },
  { name: 'التنين', en: 'THE DRAGON', tag: 'أصغرهم وأخطرهم', hp: 0.92, dmg: 0.97, spd: 1.15, color: '#ff3b4a', stats: [3, 5, 3], quote: 'لا تستصغرني مرة ثانية' },
  { name: 'أبو الدجاج', en: 'ABU DAJAJ', h: 0.76, tag: 'بيض ودجاج… وفوضى', hp: 0.95, dmg: 0.96, spd: 1.1, color: '#ffc21a', stats: [3, 4, 3], quote: 'روح جيب بيض… خلصت عليك!' },
  { name: 'أبو الأسود', en: 'ABU ASWAD', h: 0.88, tag: 'ملك السياكل', hp: 1.02, dmg: 1.04, spd: 1.02, color: '#e9e9ee', stats: [4, 4, 4], quote: 'المرة الجاية جيب سيكلك معك' },
  { name: 'البوب', en: 'AL-BOB', h: 0.95, tag: 'كوراته ما تنصد… إلا من الحارس', hp: 1.12, dmg: 1.06, spd: 0.9, color: '#9aa3b5', stats: [4, 2, 5], quote: 'كورة وحدة كفاية عليك!' },
  { name: 'الطالب', en: 'THE STUDENT', h: 0.76, tag: 'شنطته مليانة مفاجآت', hp: 0.9, dmg: 0.95, spd: 1.12, color: '#3a56c8', stats: [3, 5, 3], quote: 'رحت المدرسة… ورجعت فايز!' },
  { name: 'العبد', en: 'AL-ABD', h: 0.93, eat: 1, tag: 'كاراتيه… وبعدها خبز وماي', hp: 0.98, dmg: 1.08, spd: 1.06, color: '#f2f2f2', stats: [5, 4, 2], quote: 'خلني أكمل خبزتي بعدين نتفاهم' },
  { name: 'القيمر', en: 'THE GAMER', h: 0.9, tag: 'جاب سلاحه من اللعبة', hp: 0.96, dmg: 1.0, spd: 1.08, color: '#e01b30', stats: [4, 4, 3], quote: 'GG… حظ أوفر المرة الجاية' },
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
cv.addEventListener('pointerdown', () => { cv.focus(); audioInit(); started = true; pressQ.add('Click'); });

const MAPS = [
  { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], b1: ['KeyR'], b2: ['KeyT'], b3: ['KeyF'], b4: ['KeyG'], sp: ['KeyE'], dg: ['KeyQ'], ok: ['KeyR', 'Space', 'KeyF'], back: ['KeyT', 'Escape'] },
  { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], b1: ['KeyI', 'Numpad4'], b2: ['KeyO', 'Numpad5'], b3: ['KeyK', 'Numpad1'], b4: ['KeyL', 'Numpad2'], sp: ['KeyU', 'Numpad6'], dg: ['KeyY', 'Numpad3'], ok: ['KeyI', 'Enter', 'NumpadEnter', 'KeyK'], back: ['KeyO', 'Backspace'] },
];
const PADKEYS = ['up', 'down', 'left', 'right', 'b1', 'b2', 'b3', 'b4', 'sp', 'c12', 'c34', 'c13', 'c24', 'dg', 'ra', 'ok', 'back'];
// ---- Game controllers (PS4 / PS5 / Xbox via the Gamepad API, standard mapping) ----
// Square/X = 1, Triangle/Y = 2, Cross/A = 3, Circle/B = 4, R1/RB = 1+2, L2+R2 together = Finisher (القاضية), Options/Menu = pause, Share/View = swap player
const GP = { slots: {}, prev: {}, kind: {}, blocked: false, anyPress: false, start: false, seen: false };
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
function gpSlotKind(slot) { for (const i in GP.slots) if (GP.slots[i] === slot) return GP.kind[i]; return null; }
addEventListener('gamepadconnected', e => { try { gpAssign(e.gamepad); } catch (er) { } });
addEventListener('gamepaddisconnected', e => {
  const sl = GP.slots[e.gamepad.index];
  if (sl !== undefined) { delete GP.slots[e.gamepad.index]; delete GP.prev[e.gamepad.index]; toast(`انفصلت يد التحكم (اللاعب ${sl + 1})`); }
});
function gpPoll() {
  GPS[0] = { h: {}, p: {} }; GPS[1] = { h: {}, p: {} }; GP.anyPress = false; GP.start = false;
  for (const g of gpList()) {
    gpAssign(g);
    const sl = GP.slots[g.index]; if (sl === undefined) continue;
    const B = i => !!(g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5));
    const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
    const cur = {
      up: B(12) || ay < -0.5, down: B(13) || ay > 0.5, left: B(14) || ax < -0.5, right: B(15) || ax > 0.5,
      b1: B(2), b2: B(3), b3: B(0), b4: B(1), sp: B(10) || B(11), c12: B(5), c34: B(7), c13: B(4), dg: B(6), ra: B(6) && B(7), ok: B(0) || B(9), back: B(1), start: B(9), sel: B(8),
    };
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
  if (TOUCH_ON && slot === 0 && strong > 0.25) try { navigator.vibrate && navigator.vibrate(Math.min(ms, 220)); } catch (e) { }
  let list; try { list = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return; }
  for (const i in GP.slots) if (GP.slots[i] === slot) {
    const g = list[i]; const va = g && g.vibrationActuator;
    try { if (va && va.playEffect) va.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => { }); } catch (e) { }
  }
}
let TOAST = null;
function toast(text) { TOAST = { text, t: 0 }; }
// ---- Install as an app (PWA) + offline play ----
const PWA = { evt: null, standalone: false };
try { PWA.standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) { }
const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); PWA.evt = e; });
addEventListener('appinstalled', () => { PWA.evt = null; PWA.standalone = true; toast('تم تثبيت اللعبة ✓ تلقاها في الشاشة الرئيسية'); });
try {
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !netEmbedded()) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
    navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.t === 'upd') toast('نزل تحديث جديد للعبة ✨ سكّرها وافتحها من جديد'); });
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
#tc .b.ra{background:rgba(200,0,20,.55);border:3px solid #ff3b4a;color:#fff;font-size:12px;box-shadow:0 0 18px rgba(255,30,50,.9);animation:raP .6s ease-in-out infinite alternate}
@keyframes raP{from{box-shadow:0 0 8px rgba(255,30,50,.6)}to{box-shadow:0 0 26px rgba(255,60,60,1)}}
#tc .b.hide{display:none}
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
  if (x < innerWidth * 0.45 && y > innerHeight * 0.22) {
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
function enableTouch() {
  if (TOUCH_ON) return; TOUCH_ON = true; tcRoot.classList.add('on'); resize(); tcLayout();
}
let tcVisKey = '';
function tcFrame() {
  if (!TOUCH_ON) return;
  rotEl.classList.toggle('on', innerHeight > innerWidth * 1.05);
  const fight = G.scene === 'fight' && G.fight && !G.fight.paused && !G.fight.showList && !NET.menu;
  const f0 = fight ? G.fight.f[0] : null;
  const key = [fight, G.scene === 'fight', fsOK(), f0 && f0.sk >= SKMAX, f0 && f0.cbCD > 0, f0 && f0.dgCD > 0, f0 && f0.rage].join();
  if (key === tcVisKey) return; tcVisKey = key; tcLayout();
  for (const b of TBTN) {
    let show = !b.fight || fight; if (b.id === 'fs' && !fsOK()) show = false; if (b.id === 'ra' && !(f0 && f0.rage)) show = false;
    b.el.classList.toggle('hide', !show);
    if (b.id === 'sp') b.el.classList.toggle('full', !!(f0 && f0.sk >= SKMAX));
    if (b.kind === 'cb') b.el.classList.toggle('cd', !!(f0 && (b.id === 'dg' ? f0.dgCD > 0 : f0.cbCD > 0)));
  }
  tcUpdate();
}
try { if (/[?&](m|mobile|touch)(=|&|$)/.test(location.search) || /\/mobile\/?$/.test(location.pathname)) window.FORCE_TOUCH = true; } catch (e) { }
try { if (window.FORCE_TOUCH || matchMedia('(hover: none) and (pointer: coarse)').matches) enableTouch(); } catch (e) { }
cv.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') enableTouch(); });

// ================= AUDIO =================
let AC = null, master = null, sfxG = null, musG = null, NB = null, muted = false;
function audioInit() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const comp = AC.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(AC.destination);
      master = AC.createGain(); master.gain.value = MASTER_VOL * SET.vol; master.connect(comp);
      const soft = AC.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 5200; soft.Q.value = 0.5; soft.connect(master);
      sfxG = AC.createGain(); sfxG.gain.value = 0.7; sfxG.connect(soft);
      musG = AC.createGain(); musG.gain.value = musicOn ? MUSIC_VOL : 0; musG.connect(soft);
      const len = AC.sampleRate * 1.5; NB = AC.createBuffer(1, len, AC.sampleRate);
      const d = NB.getChannelData(0); for (let i = 0; i < len; i++) d[i] = RR() * 2 - 1;
      Music.start();
    }
    if (AC.state === 'suspended') AC.resume();
    if (!window.__ttsU && window.speechSynthesis) { window.__ttsU = 1; const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); }
  } catch (e) { }
}
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
const RIGS = [];
function buildRig(ci) {
  const m = RIG[String(ci + 1)];
  const P = {};
  for (const part of PARTS.concat(m.parts.skirt ? ['skirt'] : [])) {
    const im = IMG[`c${ci + 1}_${part}`]; const o = m.parts[part];
    P[part] = { img: im, shadow: tinted(im, '#1e0430', 0.8), dark: tinted(im, '#0b0d1a', 0.45), flash: tinted(im, '#ffffff', 0.42), rage: tinted(im, '#ff1020', 0.35), ox: o[0], oy: o[1], hull: m.hull[part] };
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
    kf: [[0, {}], [7, { th: 70, sh: 95, lean: -4, ffl: 0.5, bth: -6 }], [15, { r: -14, th: 128, sh: 4, lean: -16, ffl: 0, bth: 6, bsh: 0, dx: 6 }], [19, {}], [28, { r: 0, th: 55, sh: 70, lean: 0, ffl: 1, dx: 0 }], [39, null]] },
  hook: { name: 'hook', limb: 'fH', lvl: 'mid', st: 12, ac: 3, rc: 18, dmg: 14, hs: 20, bs: 14, push: 26, stop: 8, r: 30, p: 1.3, mvx: [[2, 12, 6]],
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
    kf: [[0, {}], [10, { th: 90, sh: 120, ffl: 0.3, lean: -8, r: -6 }], [19, { r: -20, th: 122, sh: 2, lean: -18, ffl: 0, dx: 12, bth: 8, bsh: 0 }], [23, {}], [34, { r: 0, th: 60, sh: 70, lean: 0, ffl: 1, dx: 0 }], [47, null]] },
  jp: { name: 'airpunch', limb: 'fH', lvl: 'mid', st: 5, ac: 9, rc: 6, dmg: 10, hs: 18, bs: 12, push: 16, stop: 6, r: 30, p: 1.0, air: 1, base: 'JUMP',
    kf: [[0, {}], [5, { ua: 70, fa: 0, lean: 14 }], [14, {}], [20, { ua: 40, fa: 120, lean: 8 }]] },
  jk: { name: 'airkick', limb: 'fT', lvl: 'mid', st: 6, ac: 12, rc: 6, dmg: 14, hs: 22, bs: 14, push: 24, stop: 8, r: 34, p: 1.3, air: 1, kick: 1, base: 'JUMP',
    kf: [[0, {}], [6, { th: 80, sh: 4, ffl: 0, ft: -10, lean: -12, r: -8, bth: 10, bsh: 110 }], [18, {}], [24, { th: 70, sh: 110, r: 0, lean: 8 }]] },
  rage: { name: 'rage', limb: 'fH', lvl: 'mid', st: 26, ac: 16, rc: 34, dmg: 0, hs: 0, bs: 22, push: 30, stop: 4, r: 56, p: 1.5, rage: 1, mvx: [[26, 42, 15]],
    kf: [[0, {}], [10, { ...RAGEC }], [24, { ...RAGEC, lean: -18 }], [26, { ua: 80, fa: 50, lean: 28, dx: 10, th: 50, sh: 30, bth: -40, bsh: 30 }], [42, {}], [52, { ua: 50, fa: 100, lean: 10 }], [76, null]] },
};
// ================= SPECIAL SKILLS (charge every 10 s) =================
const SKMAX = 600;
const SKILL_IDS = ['sk_rush', 'sk_barrage', 'sk_slide', 'sk_cards', 'sk_hball', 'sk_rock', 'sk_roll', 'sk_cart', 'sk_chicken', 'sk_bike', 'sk_bob', 'sk_school', 'sk_karate', 'sk_blaster'];
const SKILL_NAMES = ['نطة الزعيم', 'القبضات العملاقة', 'السلايد', 'أوراق اللعب', 'كرة اليد', 'رمية الحجر', 'الكرة المتدحرجة', 'عربة السوبرماركت', 'جيش الدجاج', 'رمية السيكل', 'صاروخ البوب', 'هجوم الأدوات', 'إعصار الكاراتيه', 'سلاح القيمر'];
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
  spawnProj({ kind: 'hball', owner: f, x: w[0], y: w[1], vx: f.facing * 20, vy: -2.5, g: 0.12, r: 19, life: 90, vr: f.facing * 0.35, m: { dmg: 14, lvl: 'mid', hs: 24, bs: 14, push: 34, stop: 8, p: 1.4 } });
}
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
MV.sk_barrage = { name: 'barrage', skill: 1, limb: 'fH', lvl: 'mid', st: 10, ac: 44, rc: 18, dmg: 2.8, hs: 14, bs: 7, push: 3, stop: 2, r: 56, p: 0.9, multi: 4, fsc: 1.85, mvx: [[10, 54, 2.4]], poseFn: barragePose, hitboxFn: barrageHB, onStep: barrageStep, kf: [[0, {}], [72, null]] };
MV.sk_slide = { name: 'slide', skill: 1, limb: 'fT', lvl: 'low', st: 7, ac: 22, rc: 20, dmg: 14, hs: 0, bs: 16, push: 20, stop: 8, r: 44, p: 1.3, kd: 1, kick: 1, lowp: 1, onStep: slideStep, noDecay: 1,
  kf: [[0, {}], [5, { r: -28, lean: 10, th: 30, sh: 20, bth: 0, bsh: 90, ua: -20, fa: 40, bua: -10, bfa: 40 }], [8, { r: -55, lean: 16, th: 42, sh: 0, ffl: 0, ft: 10, bth: -5, bsh: 120, bfl: 0, ua: -40, fa: 30, bua: -30, bfa: 40 }], [29, {}], [40, { r: -10, lean: 20, th: 70, sh: 120, bth: 60, bsh: 120, ffl: 1, bfl: 1, ua: 20, fa: 120, bua: 20, bfa: 130 }], [49, null]] };
MV.sk_cards = { name: 'cards', skill: 1, limb: null, lvl: 'mid', st: 14, ac: 1, rc: 18, p: 0.8, spawnAt: 14, spawn: spawnCards,
  kf: [[0, {}], [8, { ua: -40, fa: 150, lean: -12, bua: 40, bfa: 120 }], [14, { ua: 88, fa: 4, lean: 16, dx: 8 }], [20, {}], [33, null]] };
MV.sk_hball = { name: 'handball', skill: 1, limb: null, lvl: 'mid', st: 16, ac: 1, rc: 20, p: 1.2, spawnAt: 16, spawn: spawnHandball,
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
const COMBO_NAME = {};
COMBOS.forEach((set, ci) => { for (const k of COMBO_KEYS) { const [name, mv] = set[k]; const id = `cb${ci}_${k}`; MV[id] = mv; mv.cname = name; COMBO_NAME[id] = name; set[k] = id; } });
for (const id of ['spin', 'sweep', 'hook', 'rage', 'sk_rush', 'sk_cart', 'sk_roll', 'sk_barrage']) MV[id].track = 1;
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
    J[pre + 'H'] = hd;
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
    J[pre + 'leg'] = [['thigh', hp, pt - R.a0.th, m.hip], ['shin', kn, rS, m.K], ['foot', an, rF, m.A]];
    const to = rot(R.toe[0] - m.A[0], R.toe[1] - m.A[1], rF);
    J[pre + 'T'] = [an[0] + to[0], an[1] + to[1]];
  };
  arm('f', p.ua, p.fa, 0); arm('b', p.bua, p.bfa, BACK_ARM_DX);
  leg('f', p.th, p.sh, p.ft, p.ffl, 0); leg('b', p.bth, p.bsh, p.bft, p.bfl, BACK_LEG_DX);
  J.torso = ['torso', [0, 0], tr, m.hip];
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
      ctx.font = `italic 700 ${f.size}px ${FE}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
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
    this.maxHp = Math.round(170 * this.C.hp); this.reset();
  }
  reset() {
    this.x = this.slot === 0 ? -250 : 250; this.y = 0; this.vx = 0; this.vy = 0;
    this.facing = this.slot === 0 ? 1 : -1;
    this.hp = this.maxHp; this.trailHp = this.hp; this.trailT = 0;
    this.state = 'intro'; this.t = 0; this.mv = null; this.mt = 0; this.stun = 0;
    this.pose = Object.assign({}, GUARD); this.flash = 0; this.combo = 0; this.comboDmg = 0; this.comboT = 0;
    this.rageUsed = false; this.invuln = 0; this.juggle = 0; this.ko = false; this.walkPh = 0; this.dgCD = 0; this.bubble = null;
    this.lastFwd = -99; this.lastBack = -99; this.clock = 0; this.buf = null; this.bufT = 0; this.eatN = 0; this.eatPend = false;
    this.connected = false; this.hitThis = false; this.lowHit = false; this.blockLow = false;
    this.airUsed = false; this.jumpDir = 0; this.J = null; this.hipY = 0; this.hurt = null; this.shakeT = 0; this.vic = null;
    this.sk = 0; this.spBuf = 0; this.cartGone = false; this.rollAng = 0; this.cbCD = 0;
    this.z = 0; this.lastUp = -99; this.lastDown = -99; this.upHold = 0;
    this.in = { h: {}, p: {} }; this.animate();
  }
  get rage() { return !this.rageUsed && this.hp > 0 && this.hp <= this.maxHp * 0.3; }
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
  useSkill() {
    this.talk('skill');
    this.sk = 0; this.spBuf = 0; this.buf = null; this.cartGone = false; this.startMove(SKILL_IDS[this.ci]); this.vx = 0;
    SFX.skill(); G.fight.skBanner = { slot: this.slot, text: SKILL_NAMES[this.ci], t: 0 };
    for (let i = 0; i < 14; i++) FX.push({ t: 'p', x: this.x + rnd(-50, 50), y: this.hipY + rnd(-120, 60), vx: rnd(-1, 1), vy: -rnd(1, 4), life: 30, max: 30, c: '#ffd34d', sz: rnd(2, 4) });
  }
  btn(p) { return p.b1 ? 'b1' : p.b2 ? 'b2' : p.b3 ? 'b3' : p.b4 ? 'b4' : null; }
  resolve(b, h, air) {
    if (air) return (b === 'b1' || b === 'b2') ? 'jp' : 'jk';
    if (h.down) return { b1: 'dp', b2: 'upper', b3: 'dk', b4: 'sweep' }[b];
    if (h.fwd) return { b1: 'lp', b2: 'hook', b3: 'fkick', b4: 'spin' }[b];
    return { b1: 'lp', b2: 'rp', b3: 'lk', b4: 'rk' }[b];
  }
  canAct() { return NEUTRAL.has(this.state) || this.state === 'land' && this.t > 2 || this.state === 'dash' && this.t > 4; }
  tryRage() {
    const h = this.in.h;
    if (this.rage && ((h.b1 && h.b2) || h.ra)) { this.rageUsed = true; this.startMove('rage'); G.fight.rageFlash(this); return true; }
    return false;
  }
  startMove(id) {
    if (this.C.eat) { if (MV[id].eatAfter) this.eatPend = true; else if (!MV[id].eat && !MV[id].skill) { this.eatN = (this.eatN || 0) + 1; if (this.eatN >= 9) this.eatPend = true; } }
    this.mv = MV[id]; this.state = 'attack'; this.mt = 0; this.hitThis = false; this.connected = false; this.buf = null; this.bufT = 0;
    if (this.mv.air) this.airUsed = true;
    if (!this.mv.air && !this.mv.mvx) this.vx = 0;
  }
  setState(s) { this.state = s; this.t = 0; }
  think(opp) {
    this.clock++; this.t++;
    if (this.flash > 0) this.flash--;
    if (this.invuln > 0) this.invuln--;
    if (this.dgCD > 0) this.dgCD--;
    if (this.bubble && ++this.bubble.t > this.bubble.dur) this.bubble = null;
    // L2+R2 / touch button = القاضية (cancels a dodge or R2 combo started a few frames earlier)
    if (this.in.h.ra && this.rage && G.fight && G.fight.phase === 'fight' && (NEUTRAL.has(this.state) || ['block', 'land', 'dash', 'side'].includes(this.state) || (this.state === 'dodge' && this.t <= 6) || (this.state === 'attack' && this.mv && this.mv.combo && this.mt <= 4))) {
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
      case 'rageVic': if (this.t > 150 || !(opp && (opp.state === 'rageSeq' || opp.state === 'rushSeq'))) this.setState('idle'); break;
    }
  }
  neutral() {
    const h = this.in.h, p = this.in.p;
    if (this.eatPend && G.fight && G.fight.phase === 'fight' && this.state !== 'air' && !this.jumping) { this.eatPend = false; this.eatN = 0; this.startMove('ab_eat'); return; }
    if (p.fwd) { if (this.clock - this.lastFwd < 13) { this.setState('dash'); this.dashBack = false; this.vx = this.facing * 11 * this.C.spd; dust(this.x, 5, -this.facing); this.lastFwd = -99; SFX.whoosh(0); return; } this.lastFwd = this.clock; }
    if (p.back) { if (this.clock - this.lastBack < 15) { this.setState('dash'); this.dashBack = true; this.vx = -this.facing * 19 * this.C.spd; dust(this.x, 8, this.facing); this.lastBack = -99; SFX.whoosh(1); return; } this.lastBack = this.clock; }
    if (this.spBuf > 0 && this.sk >= SKMAX) { this.useSkill(); return; }
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
    const m = this.mv, J = this.J; const lp = m.limb[0] === 'f' ? (m.limb[1] === 'H' ? J.fH : J.fT) : (m.limb[1] === 'H' ? J.bH : J.bT);
    const w = this.toWorld(lp); return { x: w[0], y: w[1], r: m.r };
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
      case 'crouch': o = Object.assign({}, CROUCH); o.lean += Math.sin(this.clock * 0.08) * 1.5; break;
      case 'dash': o = (this.vx * this.facing > 0) ? DASHP : BDASHP; break;
      case 'dodge': { const u = Math.sin(Math.min(1, this.t / 16) * Math.PI); o = Object.assign({}, GUARD, { lean: -26 * u, r: -6 * u, th: 18 + 30 * u, sh: 22 + 50 * u, bth: -14 + 20 * u, bsh: 8 + 60 * u, ua: 34 - 10 * u, bua: 26 - 10 * u, dy: 30 * u }); break; }
      case 'side': { o = Object.assign({}, GUARD); const w = Math.sin(this.t * 0.6); o.th += 18 * w; o.bth -= 18 * w; o.sh += 12; o.bsh += 12; o.lean -= 3; break; }
      case 'jsq': o = LANDP; break;
      case 'land': o = LANDP; break;
      case 'air': o = JUMP; break;
      case 'attack': o = this.mv.poseFn ? this.mv.poseFn(this, this.mt) : kfPose(this.mv, this.mt); break;
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
      case 'rageVic': o = Object.assign({}, HITHI); o.lean += Math.sin(this.clock * 1.9) * 6; break;
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
  rageSeq(opp) {
    if (opp.ko) { this.setState('idle'); G.fight.zoomT = 0; return; }
    const t = this.t; const seq = 8;
    const vx = this.x + this.facing * 120; if (opp.state === 'rageVic') { opp.x = vx; opp.y = 0; }
    if (t < 6 * seq) {
      const i = (t / seq) | 0, u = (t % seq) / seq, left = i % 2 === 0;
      const ext = u < 0.45 ? ease(u / 0.45) : 1 - ease((u - 0.45) / 0.55);
      this.rageP = Object.assign({}, GUARD, left ? { bua: lerp(26, 92, ext), bfa: lerp(142, 0, ext) } : { ua: lerp(34, 92, ext), fa: lerp(128, 0, ext) }, { lean: 10 + ext * 12, dx: ext * 10, th: 30, bth: -24 });
      if (t % seq === 3) G.fight.applyDamage(this, opp, 4.5, 'rage', left ? this.J.bH : this.J.fH, true);
    } else if (t < 6 * seq + 22) {
      const u = (t - 6 * seq) / 22;
      this.rageP = u < 0.45 ? Object.assign({}, CROUCH, { ua: 0, fa: 60, lean: 30 }) : Object.assign({}, GUARD, { ua: 170, fa: 15, lean: -10, th: 10, sh: 8, bth: -8, bsh: 4, dx: 12 });
      if (t === 6 * seq + 12) {
        G.fight.applyDamage(this, opp, 20, 'rage', this.J.fH, true);
        if (opp.hp > 0) { opp.setState('juggle'); opp.vy = -15; opp.vx = this.facing * 3; opp.juggle = 3; }
        G.fight.zoomT = 0;
      }
    } else { this.setState('idle'); G.fight.zoomT = 0; }
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
    if (op.state === 'juggle' && dist < 190) { if (Math.random() < 0.5) press('b1'); else press('b2'); return; }
    this.cd--;
    if (me.rage && dist < 230 && Math.random() < 0.03) { press('b1', 'b2'); return; }
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
        [4, () => { h[fK] = true; press('b4'); }], [10, () => { this.hold = ['B']; this.holdT = 18; }], [6, () => { this.hold = ['down', 'B']; this.holdT = 20; }], [3, () => { this.hold = ['up']; this.holdT = 10; }], [6, () => { me.sidestep(Math.random() < 0.5 ? 1 : -1); }], [14, () => { const pr = pick([['b1', 'b2'], ['b2', 'b3'], ['b2', 'b4'], ['b1', 'b3'], ['b1', 'b4'], ['b3', 'b4']]); press(pr[0], pr[1]); }]];
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
];
const pickLine = a => a[(Math.random() * a.length) | 0];
// ---- Arabic voices: the browser's Arabic voice when it has one, otherwise the built-in recorded lines ----
const VOX = { clips: window.VOICE_CLIPS || {}, bufs: {}, last: {}, voices: null };
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
  const s = AC.createBufferSource(); s.buffer = buf; const g = AC.createGain(); g.gain.value = 1.15; s.connect(g); g.connect(master); s.start(); return true;
}
function speakAr(text, pitch = 1, rate = 1, vi = 0) {
  const vs = arVoices(); if (!vs.length) return false;
  try { const u = new SpeechSynthesisUtterance(text.replace(/[🏆🎉📖😋✨…]/gu, ' ')); const v = vs[vi % vs.length]; u.voice = v; u.lang = v.lang; u.pitch = clamp(pitch, 0, 2); u.rate = clamp(rate, 0.5, 2); u.volume = clamp(SET.vol, 0, 1); speechSynthesis.speak(u); return true; } catch (e) { return false; }
}
function charSpeak(ci, kind, text) {
  if (!SET.voice || muted) return;
  const now = performance.now(); if (VOX.last[ci] && now - VOX.last[ci] < 700) return; VOX.last[ci] = now;
  const T = (window.VOICE_TTS && window.VOICE_TTS[ci]) || [1, 1];
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
const STAGE_DEFS = {
  arena: { name: 'الحلبة', make: () => BACKDROP || makeBackdrop(), floor: ['#141826', '#0c0f19', '#040509'], grid: 'rgba(150,170,240,0.16)', ring: '255,30,50', glow: '#ff2040', fog: '12,14,24', twinkle: 1 },
  pitch: { name: 'ملعب الكورة', make: makePitch, floor: ['#2a7a34', '#1c5e26', '#0a2a10'], stripes: 1, lines: 1, fog: '30,60,40' },
  hosh: { name: 'حوش البيت', make: makeHosh, floor: ['#d3ac72', '#b08a52', '#5a4426'], grid: 'rgba(90,60,30,0.10)', rug: 1, fog: '200,150,100' },
  roof: { name: 'سطح البيت', make: makeRoof, floor: ['#3e4352', '#2b2f3b', '#101218'], grid: 'rgba(200,210,230,0.14)', fog: '20,26,48' },
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
  if (SD.storm) { const ph = t % 300; if (ph < 10 || (ph > 16 && ph < 22)) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(200,150,255,${ph < 10 ? 0.22 : 0.12})`; ctx.fillRect(0, 0, VW, VH); ctx.strokeStyle = 'rgba(240,220,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); let lx = 300 + ((t / 300 | 0) * 377) % 700, ly = 0; ctx.moveTo(lx, ly); while (ly < HORIZON - 60) { lx += ((ly * 7919) % 60) - 30; ly += 40; ctx.lineTo(lx, ly); } ctx.stroke(); ctx.restore(); }
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
function withDepth(f, camz, fn) {
  const sc = depthS(f.z); if (Math.abs(sc - 1) < 0.002) { fn(); return; }
  ctx.save(); ctx.translate(f.x, (GSY - HORIZON) * (sc - 1) / camz); ctx.scale(sc, sc); ctx.translate(-f.x, 0); fn(); ctx.restore();
}

// ================= DRAW FIGHTER =================
function drawFighter(f, opts = {}) {
  const R = f.R, J = f.J, k = R.k, p = f.pose;
  const mv = f.mv;
  if (f.state === 'attack' && mv && mv.ball && f.mt >= mv.st && f.mt < mv.st + mv.ac) { if (!opts.refl) drawRollBall(f); return; }
  ctx.save();
  if (opts.ghost) { ctx.globalAlpha *= 0.32 / opts.ghost; ctx.translate(-f.facing * opts.ghost * 34, 0); }
  let jx = 0; if (f.shakeT > 0) jx = (Math.random() - 0.5) * 8;
  ctx.translate(f.x + jx, f.hipY);
  ctx.scale(f.facing * k, k);
  ctx.translate(p.dx, p.dy);
  const fl = f.flash > 1;
  const rg = f.rage && !opts.refl && (G.frame % 20 < 10);
  const front = fl ? 'flash' : rg ? 'rage' : f.shadow ? 'shadow' : 'img';
  const back = fl ? 'flash' : 'dark';
  const seg = (s, v) => { const [name, at, a, piv, sc] = s; const Pp = R.P[name]; ctx.save(); ctx.translate(at[0], at[1]); ctx.rotate(a); if (sc && sc !== 1) ctx.scale(sc, sc); ctx.drawImage(Pp[v], Pp.ox - piv[0], Pp.oy - piv[1]); ctx.restore(); };
  for (const s of J.barm) seg(s, back);
  for (const s of [J.bleg[1], J.bleg[2], J.bleg[0]]) seg(s, back);
  for (const s of [J.fleg[1], J.fleg[2], J.fleg[0]]) seg(s, front);
  if (J.skirt) seg(J.skirt, front);
  seg(J.torso, front);
  for (const s of J.farm) seg(s, front);
  ctx.restore();
}
function drawAura(f) {
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
    p.t++; p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life--;
    if (p.sin) p.y = p.base + Math.sin(p.t * p.sin[1]) * p.sin[0];
    if (p.ground) { p.y = -p.r; if (p.t % 3 === 0) dust(p.x - Math.sign(p.vx) * p.r * 0.6, 1); }
    if (p.bounce && p.y >= -p.r && p.vy > 0) { p.y = -p.r; p.vy = -Math.abs(p.vy) * p.bounce; p.bounces = (p.bounces || 0) + 1; dust(p.x, 3); if (p.bounces > 4) p.dead = true; }
    if (p.kind === 'wave') { if (p.t % 2 === 0) FX.push({ t: 'd', x: p.x, y: -rnd(0, 20), vx: 0, vy: -rnd(0.5, 2), life: 20, max: 20, sz: rnd(10, 18) }); }
    if (p.kind === 'cartproj' && p.y >= -60 && p.vy > 0) { p.dead = true; spawnProj({ kind: 'cartwreck', owner: p.owner, x: p.x, y: 0, vx: p.vx * 0.5, vy: -6, g: 0.6, vr: p.dir * 0.2, life: 60, noHit: true, dir: p.dir }); SFX.rock(); dust(p.x, 14); if (G.fight) G.fight.shake(10); continue; }
    if (p.kind === 'card' && p.t % 3 === 0) FX.push({ t: 'p', x: p.x, y: p.y, vx: -p.vx * 0.05, vy: 0, life: 10, max: 10, c: '#ffffff', sz: 2 });
    if (p.kind === 'hball' && p.t % 2 === 0) FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * 14, y: p.y, vx: 0, vy: 0, life: 9, max: 9, c: '#ffd34d', sz: 3 });
    if (p.kind === 'rock' && !p.ground && !p.bounce && p.y >= -p.r * 0.6 && p.vy > 0) { crumble(p); p.dead = true; continue; }
    if (p.kind === 'grenade' && (p.life <= 1 || (p.bounces || 0) >= 2)) { p.kind = 'boom'; p.r = 95; p.vx = 0; p.vy = 0; p.g = 0; p.bounce = 0; p.life = 10; p.wide = true; SFX.rock(); SFX.thud(); dust(p.x, 20); if (G.fight) G.fight.shake(14); for (let i = 0; i < 26; i++) { const a = rnd(0, 7), sp = rnd(3, 12); FX.push({ t: 'p', x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 22, max: 22, c: i % 3 ? '#ff8a2a' : '#ffe06a', sz: rnd(3, 7) }); } }
    if (p.kind === 'grenade') continue;
    if (p.kind === 'laser' && p.t % 2 === 0) FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * 16, y: p.y, vx: 0, vy: 0, life: 6, max: 6, c: p.col, sz: 3 });
    if (p.kind === 'hball' && p.fire && p.t % 2 === 0) FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * 20, y: p.y + rnd(-10, 10), vx: -Math.sign(p.vx) * 2, vy: rnd(-1, 1), life: 12, max: 12, c: '#ff8a2a', sz: rnd(4, 8) });
    if (p.kind === 'egg' && p.y >= -p.r * 0.6 && p.vy > 0) { p.y = -4; eggSplat(p); p.dead = true; continue; }
    if (p.kind === 'bike' && p.y >= -p.r * 0.55 && p.vy > 0) { bikeCrash(p); p.dead = true; continue; }
    if (p.kind === 'bikewreck' && p.y >= -30 && p.vy > 0) { p.y = -30; p.vy *= -0.35; p.vx *= 0.6; p.vr *= 0.5; if (Math.abs(p.vy) > 2) { dust(p.x, 5); SFX.rattle(); } }
    if (p.kind === 'chicken' && p.t % 9 === 0) { FX.push({ t: 'p', x: p.x - Math.sign(p.vx) * 20, y: p.y - 10, vx: -Math.sign(p.vx) * rnd(1, 3), vy: rnd(-2, 0), life: 18, max: 18, c: '#ffffff', sz: rnd(2, 4) }); if (p.t % 27 === 0) SFX.cluck(); }
    if (p.kind === 'tire' && p.bounce && p.y >= -p.r - 1 && p.vy < 0 && p.t > 2 && p.vy < -2) SFX.boing();
    if (p.kind === 'cartwreck' && p.y >= 0 && p.vy > 0) { p.y = 0; p.vy *= -0.35; p.vx *= 0.7; p.vr *= 0.5; if (Math.abs(p.vy) > 2) { dust(p.x, 6); SFX.rattle(); } }
    if (p.life <= 0 || Math.abs(p.x) > STAGE + 350 || p.y > 60) p.dead = true;
    if (p.noHit || p.dead) continue;
    const d = F.f[1 - p.owner.slot];
    if (p.passed === d) continue;
    if (d.state === 'dodge' && d.invuln > 0) { const r = d.hurt; if (Math.hypot(p.x - clamp(p.x, r.x0, r.x1), p.y - clamp(p.y, r.y0, r.y1)) <= p.r + 20) { d.dodgeHit(); p.passed = d; } continue; }
    if (d.invuln > 0 || ['down', 'getup', 'ko', 'rageVic', 'lose', 'win'].includes(d.state)) continue;
    if (!p.wide && Math.abs(p.z - (d.z || 0)) > 60) continue;
    if (p.m.lvl === 'high' && d.lowProfile() && d.state !== 'juggle') continue;
    const r = d.hurt; const cx = clamp(p.x, r.x0, r.x1), cy = clamp(p.y, r.y0, r.y1);
    if (Math.hypot(p.x - cx, p.y - cy) <= p.r && p.bob && d.ci === 4) { p.dead = true; spark(p.x, p.y, 'block', d.facing); SFX.block(); popText('صدّها! 🧤', p.x, p.y - 50, '#7fd6ff', 34); d.flash = 6; continue; }
    if (Math.hypot(p.x - cx, p.y - cy) <= p.r) {
      F.hitResolve(p.owner, d, p.m, { x: p.x, y: p.y, proj: true }, Math.sign(p.vx) || p.owner.facing);
      p.dead = true; if (p.kind === 'rock') crumble(p); if (p.kind === 'egg') eggSplat(p); if (p.kind === 'chicken') featherPuff(p.x, p.y, 14); if (p.kind === 'bike') bikeCrash(p);
    }
  }
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const a = P[i], b = P[j]; if (a.dead || b.dead || a.noHit || b.noHit || a.owner === b.owner) continue;
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
  if (p.kind === 'card') drawCard(p.x, p.y, p.rot * 0.3, Math.cos(p.t * 0.7), p.suit);
  else if (p.kind === 'rock') drawRock(p.x, p.y, p.rot, p.r);
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
  if (m.id === 'sk_hball' && f.mt < m.spawnAt) { const w = f.toWorld(f.J.fH); drawHandball(w[0] + f.facing * 6, w[1] - 6, 0); }
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

// ================= FIGHT =================
class Fight {
  constructor(c1, c2, mode) {
    this.mode = mode; this.cis = [c1, c2]; this.stage = G.stageId || 'arena';
    this.pads = [pads[0], mode === 'cpu' ? new CPUPad(1) : pads[1]];
    this.f = [new Fighter(0, c1, this.pads[0]), new Fighter(1, c2, this.pads[1])];
    if (mode === 'cpu') { this.pads[1].me = this.f[1]; this.pads[1].op = this.f[0]; }
    this.wins = [0, 0]; this.round = 1; this.cam = { x: 0, y: 0, z: 1, sh: 0, yaw: 0 };
    this.freeze = 0; this.slow = 0; this.msgs = []; this.zoomT = 0; this.dim = 0; this.paused = false; this.pidx = 0;
    this.startRound();
  }
  startRound() {
    for (const f of this.f) f.reset();
    this.timer = window.__shortRound ? 900 : 60 * 60; this.phase = 'intro'; this.pt = 0; this.koBy = null; this.winner = null; this.slow = 0; this.freeze = 0; this.dim = 0;
    FX.length = 0; this.msgs = []; this.proj = []; this.skBanner = null;
    const final = this.wins[0] === 1 && this.wins[1] === 1;
    this.msg(final ? 'FINAL ROUND' : `ROUND ${this.round}`, 'en', 80, '#ffffff');
    setTimeout(() => say(final ? 'Final round' : `Round ${this.round}`), 150);
    if (Music) Music.intensity = 1;
  }
  msg(text, kind, dur, color, sub) { this.msgs = [{ text, kind, dur, t: 0, color, sub }]; }
  shake(n) { this.cam.sh = Math.max(this.cam.sh, n); }
  rageFlash(f) { this.freeze = 0; this.dim = 50; this.zoomT = 70; this.zoomOn = f; SFX.rage(); this.banner = { text: 'القاضية!', t: 0, dur: 60, ar: 1 }; rumble(f.slot, 0.4, 0.9, 500); }
  update() {
    if (this.paused) { this.pauseInput(); return; }
    if (anyP('Escape', 'KeyP', 'GPStart')) { this.paused = true; this.pidx = 0; SFX.move(); return; }
    this.pt++;
    for (const m of this.msgs) m.t++;
    if (this.banner) this.banner.t++;
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
    if (this.phase === 'fight') for (const f of this.f) { if (f.sk < SKMAX && !(f.state === 'attack' && f.mv && f.mv.skill)) { f.sk++; if (f.sk === SKMAX && !f.pad.cpu) SFX.ready(); } }
    for (const f of this.f) { if (f.trailT > 0) f.trailT--; else f.trailHp = Math.max(f.hp, f.trailHp - f.maxHp * 0.006); }
    updFX();
    if (this.phase === 'ko') this.koStep();
    if (this.phase === 'end') this.endStep();
    this.camera();
  }
  pauseInput() {
    const up = pads[0].p.up || pads[1].p.up, dn = pads[0].p.down || pads[1].p.down;
    if (this.showSet) { if (updSettings()) this.showSet = false; return; }
    if (this.showList) { if (G.tap || pads[0].p.ok || pads[1].p.ok || pads[0].p.back || pads[1].p.back || anyP('Escape', 'KeyP', 'GPStart')) { this.showList = false; SFX.move(); } return; }
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
      else if (this.pidx === 3) { G.toSelect(); }
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
    if (d.state === 'juggle' && d.juggle >= 7) return null;
    const m = a.mv;
    if (Math.abs((a.z || 0) - (d.z || 0)) > 60 && !m.track) return null;
    if (m.lvl === 'high' && d.lowProfile() && d.state !== 'juggle') return null;
    const r = d.hurt; const cx = clamp(hb.x, r.x0, r.x1), cy = clamp(hb.y, r.y0, r.y1);
    if (Math.hypot(hb.x - cx, hb.y - cy) > hb.r) return null;
    hb.m = m; return hb;
  }
  resolveHit(a, d, hb) {
    const m = hb.m; a.hitThis = true; a.connected = true;
    // rage art connect
    if (m.rage) {
      if (d.state === 'juggle') { this.applyDamage(a, d, 25, 'rage', [0, 0], true, hb); d.vy = -10; return; }
      a.setState('rageSeq'); a.mv = null; a.vx = 0; d.setState('rageVic'); d.vx = 0; d.vy = 0; d.y = 0; d.mv = null;
      this.freeze = 10; this.shake(16); this.zoomT = 120; this.zoomOn = a; this.dim = 120;
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
    if (air) {
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
    if (d.hp <= 0 && !d.ko) this.ko(a, d);
  }
  ko(a, d) {
    d.ko = true; d.setState('juggle'); d.vy = -11; d.vx = a.facing * 5; d.mv = null; d.juggle = 9;
    this.phase = 'ko'; this.koBy = a; this.slow = 80; this.freeze = 14; this.pt = 0;
    SFX.ko(); this.msg('K.O.', 'ko', 150, '#ff2a3a'); say('K.O.!'); this.shake(18); rumble(d.slot, 1, 1, 700); rumble(a.slot, 0.5, 0.8, 400);
    if (Music) Music.intensity = 0;
  }
  koLanded(d) { this.koLandT = this.pt; }
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
    if (this.phase === 'ko' && this.koBy && this.pt < 95) { const d = this.f[1 - this.koBy.slot]; tz = 1.75; tx = d.x; ty = clamp(d.hurt.y0 + 60 + 300 / tz, -420, 0); }
    const lim = STAGE - VW / 2 / tz + 40;
    tx = clamp(tx, -lim, lim);
    const kz = this.phase === 'ko' && this.pt < 95 ? 0.2 : 0.08;
    cam.x = lerp(cam.x, tx, kz + 0.04); cam.z = lerp(cam.z, tz, kz); cam.y = lerp(cam.y, ty, kz + 0.02);
    if (cam.sh > 0) cam.sh *= 0.86; if (cam.sh < 0.3) cam.sh = 0;
  }
  draw() {
    const cam = this.cam, [a, b] = this.f;
    drawStage(cam, G.frame, this.stage);
    if (this.dim > 0) { ctx.fillStyle = `rgba(20,0,5,${Math.min(0.55, this.dim / 40)})`; ctx.fillRect(0, 0, VW, VH); }
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
    for (const f of order) withDepth(f, cam.z, () => drawAura(f));
    for (const f of order) withDepth(f, cam.z, () => {
      if ((f.state === 'attack' && f.mv && f.mv.trail && f.mt >= f.mv.st && f.mt < f.mv.st + f.mv.ac) || (f.state === 'dodge' && f.t < 12)) for (let g = 3; g >= 1; g--) drawFighter(f, { ghost: g });
      drawFighter(f); drawHeld(f);
    });
    for (const pr of this.proj) drawProj(pr);
    drawFX();
    for (const f of this.f) if (f.bubble) withDepth(f, cam.z, () => drawBubble(f));
    if (this.phase === 'ko' && this.koBy) this.drawKOFx();
    if (G.debug) this.drawDebug();
    ctx.restore();
    if (this.phase === 'ko' && this.pt < 10) { ctx.fillStyle = `rgba(255,255,255,${(10 - this.pt) / 10 * 0.85})`; ctx.fillRect(0, 0, VW, VH); }
    this.drawHUD();
    this.drawMsgs();
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
    txt(String(tsec), VW / 2, 58, { size: 70, font: FE, weight: 600, color: tsec <= 10 ? '#ff4d4d' : '#ffffff', rtl: false });
    ctx.restore();
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
      const key = (this.mode === 'cpu' && f.slot === 1) ? '' : (gpSlotKind(f.slot) ? 'L3/R3' : (f.slot === 0 || this.mode === 'online' ? (TOUCH_ON ? '★' : 'E') : 'U'));
      const label = SKILL_NAMES[f.ci] + (full ? (key ? `  ✦ جاهزة (${key})` : '  ✦ جاهزة') : '');
      { const cd = f.cbCD / CB_CD, by2 = sy + 14; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(sx0 - 2, by2 - 1, sw2 * 0.6 + 4, 7);
        ctx.fillStyle = cd > 0 ? 'rgba(255,255,255,0.35)' : '#7dffb0'; const ww = sw2 * 0.6 * (1 - cd); if (!rev) ctx.fillRect(sx0, by2, ww, 5); else ctx.fillRect(sx0 + sw2 * 0.4 + sw2 * 0.6 - ww, by2, ww, 5);
        txt(cd > 0 ? `حركات الزرين ${(f.cbCD / 60).toFixed(1)}` : 'حركات الزرين ✓', rev ? sx0 + sw2 * 0.4 - 8 : sx0 + sw2 * 0.6 + 8, by2 + 3, { size: 12, weight: 800, color: cd > 0 ? 'rgba(255,255,255,0.6)' : '#7dffb0', align: rev ? 'right' : 'left', stroke: '#000', sw: 2 });
        const dc = f.dgCD / 120, by3 = by2 + 11; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(sx0 - 2, by3 - 1, sw2 * 0.6 + 4, 7); ctx.fillStyle = dc > 0 ? 'rgba(255,255,255,0.35)' : '#7fd6ff'; const w3 = sw2 * 0.6 * (1 - dc); if (!rev) ctx.fillRect(sx0, by3, w3, 5); else ctx.fillRect(sx0 + sw2 - w3, by3, w3, 5);
        txt(dc > 0 ? `تفادي ${(f.dgCD / 60).toFixed(1)}` : 'تفادي ✓', rev ? sx0 + sw2 * 0.4 - 8 : sx0 + sw2 * 0.6 + 8, by3 + 3, { size: 12, weight: 800, color: dc > 0 ? 'rgba(255,255,255,0.6)' : '#7fd6ff', align: rev ? 'right' : 'left', stroke: '#000', sw: 2 }); }
      txt(label, rev ? sx0 - 10 : sx0 + sw2 + 10, sy + 4, { size: 15, weight: 800, color: full ? '#ffd34d' : 'rgba(255,255,255,0.75)', align: rev ? 'right' : 'left', stroke: '#000', sw: 3 });
    }
    if (f.rage) txt('القاضية جاهزة 💥', rev ? x + 30 : x + w - 30, y + h + 20, { size: 20, weight: 900, color: '#ff2a3a', align: rev ? 'left' : 'right', stroke: '#000', sw: 4, glow: '#ff0020' });
    txt((this.mode === 'online' ? (f.slot === NET.slot ? 'YOU' : 'NET') : f.slot === 0 ? '1P' : (this.mode === 'cpu' ? 'CPU' : '2P')) + (gpSlotKind(f.slot) && !(this.mode === 'cpu' && f.slot === 1) ? ' 🎮' : (TOUCH_ON && f.slot === (this.mode === 'online' ? NET.slot : 0) ? ' 📱' : '')), rev ? px + 38 : px + 38, py + 92, { size: 22, font: FE, weight: 700, color: f.slot === 0 ? '#3ea0ff' : '#ff3b4a', rtl: false });
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
    const opts = ['استمرار', 'قائمة الحركات', 'الإعدادات', 'اختيار الشخصيات', 'القائمة الرئيسية'];
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
function drawMoveList(F) {
  ctx.fillStyle = 'rgba(3,4,10,0.93)'; ctx.fillRect(0, 0, VW, VH);
  txt('قائمة الحركات', VW / 2, 52, { size: 46, weight: 900, color: '#fff', glow: '#ff2040' });
  txt('اضغط الزرين مع بعض   ·   فوق فوق = خطوة للداخل   ·   تحت تحت = خطوة للخارج', VW / 2, 94, { size: 20, weight: 700, color: '#ffd34d' });
  F.f.forEach((f, s) => {
    const cx = s === 0 ? 330 : VW - 330, col = s === 0 ? '#3ea0ff' : '#ff3b4a';
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(cx - 290, 120, 580, 560); ctx.fillStyle = col; ctx.fillRect(cx - 290, 120, 580, 4);
    txt(f.C.name, cx, 152, { size: 32, weight: 900, color: col });
    COMBO_KEYS.forEach((k, i) => {
      const y = 205 + i * 66, a = +k[0], b = +k[1];
      padGlyph(GLYPH[a], cx + 230, y, 14); txt('+', cx + 205, y, { size: 22, font: FE, weight: 700, color: '#fff', rtl: false }); padGlyph(GLYPH[b], cx + 180, y, 14);
      const sh = { '12': 'R1', '34': 'R2', '13': 'L1' }[k];
      if (sh) txt(sh, cx - 250, y + 1, { size: 22, font: FE, weight: 700, color: '#ff8a8a', rtl: false });
      txt(`${KEYS_P[s][a]}+${KEYS_P[s][b]}`, cx + 120, y + 1, { size: 22, font: FE, weight: 700, color: 'rgba(255,255,255,0.6)', rtl: false });
      txt(MV[COMBOS[f.ci][k]].cname, cx + 70, y, { size: 26, weight: 800, color: '#fff', align: 'right' });
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(cx - 270, y + 30, 540, 1);
    });
    const y = 205 + 6 * 66;
    txt('L3/R3', cx + 205, y + 26, { size: 18, font: FE, weight: 700, color: '#7dffb0', rtl: false });
    txt(s === 0 ? 'E' : 'U', cx + 205, y - 6, { size: 24, font: FE, weight: 700, color: '#7dffb0', rtl: false });
    txt('المهارة: ' + SKILL_NAMES[f.ci] + ' (كل 10 ثواني)', cx + 70, y, { size: 22, weight: 800, color: '#7dffb0', align: 'right' });
    txt(`تفادي: ${s === 0 ? 'Q' : 'Y'} أو L2 (كل ثانيتين)   ·   L2+R2 مع بعض (أو □+△) لما دمك يقل = القاضية`, cx, y + 50, { size: 18, weight: 700, color: '#ff8080' });
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
  NET.conn = null; NET.peer = null; NET.on = false; NET.remote = { sel: null }; NET.menu = false;
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
    SFX.ok(); toast('تم الاتصال! 🔗'); NET.m = 0; NET.remote = { sel: null };
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
    case 'sel': NET.remote.sel = { c: clamp(d.c | 0, 0, NCH - 1), rd: !!d.rd }; break;
    case 'go':
      if (NET.slot === 1 && G.scene === 'select' && d.m > NET.m) {
        NET.m = d.m; NET.seed = d.seed | 0; netMatchReset(); if (STAGE_DEFS[d.st]) G.stageId = d.st; G.sel.cur = [clamp(d.c0 | 0, 0, NCH - 1), clamp(d.c1 | 0, 0, NCH - 1)]; G.sel.done = [true, true]; G.toVS();
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
  if (r) { S.cur[op] = r.c; S.done[op] = r.rd; } else S.done[op] = false;
  const k = S.cur[me] + ':' + S.done[me];
  if (k !== NET.sentSel || G.frame % 60 === 0) { NET.sentSel = k; netSend({ t: 'sel', c: S.cur[me], rd: S.done[me] }); }
}
function netMatchReset() { NET.rin = []; NET.rmax = -1; NET.rH = {}; NET.myH = {}; NET.res = null; NET.remote.sel = null; NET.desync = false; }
function netLocalPad() { const a = pads[0], b = pads[1], o = { h: {}, p: {} }; for (const k of PADKEYS) { o.h[k] = a.h[k] || b.h[k]; o.p[k] = a.p[k] || b.p[k]; } return window.__netBot ? window.__netBot(o) : o; }
function netStartMatch() { NET.m++; netMatchReset(); NET.seed = (RR() * 2147483647) | 0; G.stageId = STAGE_POOL[(RR() * STAGE_POOL.length) | 0]; netSend({ t: 'go', m: NET.m, seed: NET.seed, c0: G.sel.cur[0], c1: G.sel.cur[1], st: G.stageId }); }
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
const CH_NAMES = ['الفصل الأول', 'الفصل الثاني', 'الفصل الثالث', 'الفصل الرابع', 'الفصل الأخير'];
const CH_STAGE = ['arena', 'hosh', 'pitch', 'roof', 'dark'];
const CH_TIME = ['الليل… في الحلبة', 'العصر… في حوش البيت القديم', 'المغرب… في ملعب الكورة', 'نص الليل… فوق السطح', 'عرش الظل… السما حمرا'];
function nmOf(ci, shadow) { return (shadow ? 'ظل ' : '') + CHARS[ci].name; }
function storyStart(pc) {
  const pool = []; for (let i = 0; i < NCH; i++) if (i !== pc) pool.push(i);
  for (let i = pool.length - 1; i > 0; i--) { const j = (RR() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  G.story = { pc, opps: pool.slice(0, 4), ch: 0, step: 'card', t: 0, lines: [], li: 0, ct: 0, phase: 'pre', final: false };
  storyChapter();
}
function storyScript(ch, phase) {
  const S = G.story, P = nmOf(S.pc), boss = ch === 4, oc = boss ? S.pc : S.opps[ch], O = nmOf(oc, boss), ol = ((PERSONA[oc] && PERSONA[oc].intro[0]) || '').replace(/[!.؟?…]+$/, '');
  if (phase === 'pre') {
    if (ch === 0) return [['N', 'في ليلة من ليالي الشلة… الكل مجتمع في الحلبة.'], ['N', 'وفجأة… انطفت الأنوار. ولما رجعت… كأس الشلة اختفى! 🏆'], ['P', 'منو اللي أخذ الكأس؟! محد بيطلع من هنا لين أعرف!'], ['O', `${ol}… يمكن أنا ويمكن لا. غلبني وأقول لك!`]];
    if (ch === 1) return [['N', 'العصر… الشمس تغيب ورا حوش البيت القديم.'], ['P', `أدري إنك هنا يا ${O}!`], ['O', `${ol}… ما بتاخذ مني شي إلا بالقوة!`]];
    if (ch === 2) return [['N', 'المغرب… أنوار الملعب تولّعت والجمهور يصارخ.'], ['O', `هذا ملعبي يا ${P}. هنا محد يفوز علي!`], ['P', 'نشوف… الكأس أهم من كل شي.']];
    if (ch === 3) return [['N', 'نص الليل… فوق السطح، والقمر طالع.'], ['O', `وصلت لين هنا؟ ما توقعتها منك يا ${P}!`], ['P', 'آخر واحد… وبعدها أعرف الحقيقة.']];
    return [['N', 'السما صارت حمرا… والريح قامت…'], ['N', 'ومن الظلام طلع واحد… يشبهك بالضبط!'], ['O', `أنا أنت يا ${P}… بس أقوى. الكأس صار لي!`], ['P', 'ما في أحد يسرق من الشلة… حتى ظلي!']];
  }
  if (ch === 0) return [['O', 'خلاص خلاص! مو أنا… بس شفت واحد طالع صوب الحوش.'], ['P', 'يلا… على الحوش!']];
  if (ch === 1) return [['O', 'الكأس؟ واحد لابس أسود أخذه للملعب!'], ['P', 'الملعب… جاي.']];
  if (ch === 2) return [['O', 'آخر مرة شفته… كان طالع السطح!'], ['P', 'السطح؟ في هالليل؟']];
  if (ch === 3) return [['O', 'اسمعني زين… اللي أخذ الكأس مو واحد منا…'], ['O', 'هو… ظلّك!'], ['P', 'ظلي؟!']];
  return [['N', 'الظل اختفى… والكأس رجع للشلة! 🏆'], ['P', CHARS[S.pc].quote], ['N', 'والشلة رجعت تضحك… لين البطولة الجاية.'], ['N', 'النهاية 🎉 — شكراً إنك لعبت!']];
}
function storyChapter() { const S = G.story; S.step = 'card'; S.t = 0; G.scene = 'story'; G.stageId = CH_STAGE[S.ch]; if (AC) Music.intensity = 0; }
function storySpeak() { const S = G.story, L = S && S.lines[S.li]; if (!L || !SET.voice || muted) return; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } const boss = S.ch === 4, oc = boss ? S.pc : S.opps[S.ch]; const ci = L[0] === 'P' ? S.pc : oc; const T = L[0] === 'N' ? [0.95, 0.95] : ((window.VOICE_TTS && window.VOICE_TTS[ci]) || [1, 1]); speakAr(L[1], L[0] === 'O' && boss ? T[0] * 0.6 : T[0], T[1], L[0] === 'N' ? 99 : ci); }
function storyTalk(phase) { const S = G.story; S.step = 'talk'; S.phase = phase; S.lines = storyScript(S.ch, phase); S.li = 0; S.ct = 0; S.t = 0; G.scene = 'story'; G.stageId = CH_STAGE[S.ch]; storySpeak(); }
function storyFight() {
  const S = G.story, boss = S.ch === 4; G.mode = 'cpu'; G.stageId = CH_STAGE[S.ch];
  G.sel = { cur: [S.pc, boss ? S.pc : S.opps[S.ch]], done: [true, true], t: 0, readyT: 0 };
  G.toVS();
}
function storySetupFight(F) {
  const S = G.story; if (!S) return; const op = F.f[1], me = F.f[0];
  // story hero is stronger: hits harder and takes a bit less damage
  me.dmgMul = 1.35; me.defMul = 0.85; me.storyBuff = true;
  F.pads[1].lvl = S.ch === 4 ? 3 : 1 + S.ch * 0.45;
  if (S.ch === 4) { op.shadow = true; op.maxHp = Math.round(op.maxHp * 1.6); op.hp = op.trailHp = op.maxHp; op.dmgMul = 1.2; op.dispName = nmOf(op.ci, true); }
}
function storyResult(w) {
  const S = G.story;
  if (w === 0) { if (S.ch === 4) S.final = true; storyTalk('post'); if (S.final) SFX.ready(); }
  else { S.step = 'lost'; S.t = 0; G.scene = 'story'; }
}
function storyAdvance() {
  const S = G.story;
  if (S.phase === 'pre') { storyFight(); return; }
  if (S.final || S.ch >= 4) { G.story = null; G.toTitle(); return; }
  S.ch++; storyChapter();
}
function updStory() {
  const S = G.story; if (!S) { G.toTitle(); return; } S.t++;
  const P0 = pads[0].p, P1 = pads[1].p, ok = P0.ok || P1.ok || anyP('Click') || !!G.tap, back = P0.back || P1.back || anyP('Escape');
  if (S.step === 'card') { if (S.t > 170 || (ok && S.t > 20)) { SFX.move(); storyTalk(S.ch === 4 || S.phase !== 'post' ? 'pre' : 'pre'); } return; }
  if (S.step === 'talk') {
    const L = S.lines[S.li]; S.ct += 1.5;
    if (back && S.t > 10) { SFX.move(); storyAdvance(); return; }
    if (ok && S.t > 6) { if (S.ct < L[1].length) S.ct = 999; else { S.li++; S.ct = 0; SFX.move(); if (S.li >= S.lines.length) { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } storyAdvance(); } else storySpeak(); } }
    return;
  }
  if (S.step === 'lost') { if (S.t > 30) { if (ok) { SFX.ok(); storyFight(); } else if (back) { SFX.move(); G.story = null; G.toTitle(); } } }
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
function drawStory() {
  const S = G.story; if (!S) return;
  drawStage({ x: Math.sin(G.frame * 0.004) * 120, z: 1, yaw: Math.sin(G.frame * 0.003) * 0.35 }, G.frame, CH_STAGE[S.ch]);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, VW, VH);
  // chapter progress
  for (let i = 0; i < 5; i++) { const x = VW / 2 + (2 - i) * 46; ctx.fillStyle = i < S.ch ? '#ffd34d' : i === S.ch ? '#ff2a3a' : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(x, 34, i === S.ch ? 11 : 8, 0, 7); ctx.fill(); }
  if (S.step === 'card') {
    const a = Math.min(1, S.t / 25) * Math.min(1, (170 - S.t) / 20 + 0.2);
    ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, VH / 2 - 130, VW, 260);
    txt(CH_NAMES[S.ch], VW / 2, VH / 2 - 40, { size: 92, weight: 900, color: '#fff', glow: S.ch === 4 ? '#b030ff' : '#ff1030', glowBlur: 35 });
    txt(CH_TIME[S.ch], VW / 2, VH / 2 + 50, { size: 34, weight: 800, color: '#ffd34d' });
    txt(S.ch === 4 ? 'الخصم: ؟؟؟' : 'الخصم: ' + nmOf(S.opps[S.ch]), VW / 2, VH / 2 + 100, { size: 24, weight: 700, color: 'rgba(255,255,255,0.75)' });
    ctx.restore(); return;
  }
  if (S.step === 'lost') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, VW, VH);
    txt('خسرت… 😵', VW / 2, 280, { size: 90, weight: 900, color: '#ff4d5a', glow: '#ff1030' });
    txt('الكأس للحين مفقود!', VW / 2, 370, { size: 30, weight: 800, color: '#fff' });
    if (S.t > 30 && G.frame % 60 < 42) txt(TOUCH_ON ? 'المس الشاشة لإعادة الفصل  ·  ○ للقائمة' : '✕ / Enter = إعادة الفصل   ·   ○ / Esc = القائمة الرئيسية', VW / 2, 470, { size: 24, weight: 800, color: '#ffd34d' });
    return;
  }
  // dialogue
  const L = S.lines[S.li] || ['N', ''], who = L[0], boss = S.ch === 4, oc = boss ? S.pc : S.opps[S.ch];
  const pimg = IMG['vs' + (S.pc + 1)], oimg0 = IMG['vs' + (oc + 1)], oimg = boss ? shadowOf(oimg0) : oimg0;
  const drawP = (im, cx, flip, on) => { const h = 560, w = im.width * h / im.height; ctx.save(); ctx.globalAlpha = on ? 1 : 0.38; if (flip) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); } ctx.drawImage(im, cx - w / 2, VH - h - (on ? 6 : 0), w, h); ctx.restore(); };
  drawP(pimg, 300, false, who === 'P'); drawP(oimg, VW - 300, true, who === 'O');
  if (boss) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(VW - 300, 380, 30, VW - 300, 380, 330); g.addColorStop(0, 'rgba(170,40,255,0.25)'); g.addColorStop(1, 'rgba(170,40,255,0)'); ctx.fillStyle = g; ctx.fillRect(VW - 640, 40, 640, 680); ctx.restore(); }
  const bx = 150, by = 500, bw = VW - 300, bh = 190;
  ctx.save(); ctx.fillStyle = 'rgba(6,8,16,0.92)'; ctx.strokeStyle = boss && who === 'O' ? '#b030ff' : '#ff2a3a'; ctx.lineWidth = 3; rrect(bx, by, bw, bh, 16); ctx.fill(); ctx.stroke(); ctx.restore();
  const name = who === 'N' ? 'الراوي' : who === 'P' ? nmOf(S.pc) : nmOf(oc, boss);
  const ncol = who === 'N' ? '#9fd8ff' : who === 'P' ? '#3ea0ff' : (boss ? '#c77dff' : '#ff6b6b');
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
  toTitle() { this.scene = 'title'; this.t = 0; this.fight = null; this.story = null; this.storyPick = false; if (AC) Music.intensity = 0; },
  toSelect() {
    this.story = null; this.storyPick = false;
    const prev = this.sel ? this.sel.cur.slice() : [0, 1];
    this.scene = 'select'; this.t = 0; this.fight = null; this.sel = { cur: prev, done: [false, false], t: 0, readyT: 0 };
    if (AC) Music.intensity = 0;
  },
  toVS() { this.scene = 'vs'; this.t = 0; if (!this.story && this.mode !== 'online') this.stageId = STAGE_POOL[(RR() * STAGE_POOL.length) | 0]; },
  toFight() { this.scene = 'fight'; this.t = 0; this.fight = new Fight(this.sel.cur[0], this.sel.cur[1], this.mode); if (this.mode === 'online') netFightInit(this.fight); if (this.story) storySetupFight(this.fight); },
  toResult(w, fight) { if (this.story) { storyResult(w); return; } this.scene = 'result'; this.t = 0; this.res = { w, ci: fight.cis[w], wins: fight.wins.slice() }; if (AC) Music.intensity = 0; say(`${w === 0 ? 'Player one' : (this.mode === 'cpu' ? 'Computer' : 'Player two')} wins`); },
};
window.__storyAPI = { storyAdvance, storyStart, storyFight }; window.__VOX = VOX; window.__NET = NET; window.__netHost = () => netHost(); window.__netJoin = c => netJoin(c); window.__netHash = () => G.fight ? netHash(G.fight) : 0;
window.__G = G; window.__MV = MV; window.__SK = SKILL_IDS; window.__COMBOS = COMBOS; window.__CPU = CPUPad; window.__txt = txt; window.__IMG = IMG; window.__FX = FX; window.__spark = spark;

const SET_ROWS = [
  ['vol', 'مستوى الصوت العام'], ['music', 'الموسيقى'], ['fx', 'أصوات المعركة والضربات'], ['gong', 'جرس بداية الجولة و K.O.'], ['voice', 'أصوات وكلام الشخصيات'], ['ui', 'أصوات القوائم'], ['rumble', 'اهتزاز يد التحكم'], ['install', 'ثبّت اللعبة كتطبيق 📲'], ['back', 'رجوع']];
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
    const i = Math.round((G.tap[1] - 165) / 58);
    if (i >= 0 && i < SET_ROWS.length) {
      setIdx = i; tapOk = true;
      if (SET_ROWS[i][0] === 'vol' && G.tap[0] < VW / 2 - 130) { SET.vol = clamp(Math.floor((G.tap[0] - (VW / 2 - 360)) / 44) + 1, 0, 5) / 5; applySet(); SFX.ok(); return false; }
    }
  }
  const key = SET_ROWS[setIdx][0], l = any('left'), r = any('right'), ok = any('ok') || tapOk;
  if (key === 'back') { if (ok) { setIdx = 0; SFX.ok(); return true; } return false; }
  if (key === 'install') { if (ok) { SFX.ok(); pwaInstall(); } return false; }
  if (key === 'vol') { if (l || r) { SET.vol = clamp(Math.round((SET.vol + (r ? 0.2 : -0.2)) * 10) / 10, 0, 1); applySet(); SFX.ok(); } }
  else if (l || r || ok) { SET[key] = !SET[key]; applySet(); SFX.ok(); }
  return false;
}
function drawSettings() {
  ctx.fillStyle = 'rgba(3,4,10,0.94)'; ctx.fillRect(0, 0, VW, VH);
  txt('الإعدادات', VW / 2, 80, { size: 60, weight: 900, color: '#fff', glow: '#ff2040' });
  SET_ROWS.forEach(([key, label], i) => {
    const y = 165 + i * 58, sel = i === setIdx;
    ctx.fillStyle = sel ? 'rgba(230,20,40,0.85)' : 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.moveTo(VW / 2 - 400, y - 24); ctx.lineTo(VW / 2 + 420, y - 24); ctx.lineTo(VW / 2 + 400, y + 24); ctx.lineTo(VW / 2 - 420, y + 24); ctx.closePath(); ctx.fill();
    if (key === 'back') { txt(label, VW / 2, y + 2, { size: 30, weight: 800, color: '#fff' }); return; }
    txt(label, VW / 2 + 370, y + 2, { size: 28, weight: 800, color: '#fff', align: 'right' });
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
function updTitle() {
  G.t++;
  if (G.settingsOpen) { if (updSettings()) G.settingsOpen = false; return; }
  const up = pads[0].p.up || pads[1].p.up, dn = pads[0].p.down || pads[1].p.down;
  if (up) { G.menuIdx = (G.menuIdx + 4) % 5; SFX.move(); }
  if (dn) { G.menuIdx = (G.menuIdx + 1) % 5; SFX.move(); }
  if (G.tap) { const i = Math.round((G.tap[1] - 418) / 46); if (i >= 0 && i < 5 && Math.abs(G.tap[0] - VW / 2) < 300) G.menuIdx = i; }
  if (pads[0].p.ok || pads[1].p.ok || anyP('Click')) { if (G.t > 10) { SFX.ok(); if (G.menuIdx === 4) { G.settingsOpen = true; setIdx = 0; } else if (G.menuIdx === 3) { G.scene = 'online'; G.t = 0; NET.ui = 'menu'; NET.idx = 0; } else if (G.menuIdx === 2) { G.mode = 'cpu'; G.toSelect(); G.storyPick = true; } else { G.mode = G.menuIdx === 0 ? '2p' : 'cpu'; G.toSelect(); } } }
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
  ctx.restore();
  // menu
  const opts = ['لاعب ضد لاعب', 'ضد الكمبيوتر', 'القصة 📖', 'أونلاين 🌐', 'الإعدادات'];
  opts.forEach((o, i) => {
    const y = 418 + i * 46, sel = i === G.menuIdx;
    if (sel) {
      ctx.save(); ctx.fillStyle = 'rgba(230,20,40,0.9)'; ctx.shadowColor = '#ff1030'; ctx.shadowBlur = 25;
      ctx.beginPath(); ctx.moveTo(VW / 2 - 200, y - 22); ctx.lineTo(VW / 2 + 220, y - 22); ctx.lineTo(VW / 2 + 200, y + 22); ctx.lineTo(VW / 2 - 220, y + 22); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    txt(o, VW / 2, y + 2, { size: 33, weight: 800, color: sel ? '#fff' : 'rgba(255,255,255,0.55)' });
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
  const cpu = G.mode === 'cpu';
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
    if (pd.p.left) { S.cur[s] = (S.cur[s] + NCH - 1) % NCH; SFX.move(); }
    if (pd.p.right) { S.cur[s] = (S.cur[s] + 1) % NCH; SFX.move(); }
    if (pd.p.up || pd.p.down) { S.cur[s] = (S.cur[s] + 7) % NCH; SFX.move(); }
    if (pd.p.ok && S.t > 8) { S.done[s] = true; SFX.ok(); S.flash = [s, 14]; }
    else if (pd.p.back && cpu && s === 1) { S.done[0] = false; SFX.move(); }
    else if (pd.p.back && (!cpu || s === 0) && S.t > 8) { if (online) { netClose(); G.scene = 'online'; G.t = 0; return; } G.toTitle(); return; }
  }
  if (G.tap && S.t > 8) {
    const tw = 80, gap = 8, x0 = VW / 2 - (7 * tw + 6 * gap) / 2, ty0 = 185, rowH = tw + 40;
    const col = Math.floor((G.tap[0] - x0) / (tw + gap)), row = Math.floor((G.tap[1] - ty0) / rowH), s = online ? NET.slot : (cpu && S.done[0] ? 1 : 0);
    if (col >= 0 && col < 7 && row >= 0 && row < 2 && !S.done[s] && row * 7 + col < NCH) {
      const i = row * 7 + col;
      if (S.cur[s] === i) { S.done[s] = true; SFX.ok(); S.flash = [s, 14]; } else { S.cur[s] = i; SFX.move(); }
    }
  }
  if (online) { if (!NET.on) { G.scene = 'online'; G.t = 0; return; } netSelSync(); }
  if (G.storyPick && S.done[0]) { G.storyPick = false; storyStart(S.cur[0]); return; }
  if (S.done[0] && S.done[1]) { S.readyT++; if (S.readyT > 40 && (!online || NET.slot === 0)) { if (online) netStartMatch(); G.toVS(); } } else S.readyT = 0;
  if (S.flash) { S.flash[1]--; if (S.flash[1] <= 0) S.flash = null; }
}
function drawSelect() {
  const S = G.sel;
  drawStage({ x: 0, z: 1 }, G.frame);
  ctx.fillStyle = 'rgba(3,4,10,0.72)'; ctx.fillRect(0, 0, VW, VH);
  txt('اختر مقاتلك', VW / 2, 56, { size: 58, weight: 900, color: '#fff', glow: '#ff1030', glowBlur: 30 });
  const cpu = G.mode === 'cpu';
  if (G.mode === 'online') txt(S.done[NET.slot] ? (S.done[1 - NET.slot] ? 'يلا نبدأ!' : 'ننتظر صاحبك يختار...') : 'اختر شخصيتك · صاحبك يختار بنفس الوقت', VW / 2, 106, { size: 24, weight: 700, color: '#ffd34d' });
  else if (G.storyPick) txt('اختر بطل القصة 📖', VW / 2, 106, { size: 26, weight: 800, color: '#ffd34d' });
  else if (cpu) txt(S.done[0] ? 'اختر خصمك (الكمبيوتر)' : 'اختر شخصيتك', VW / 2, 106, { size: 24, weight: 700, color: '#ffd34d' });
  // big previews
  for (let s = 0; s < 2; s++) {
    const ci = S.cur[s], im = IMG['front' + (ci + 1)], C = CHARS[ci];
    const hgt = 470, w = im.width * hgt / im.height, cx = s === 0 ? 200 : VW - 200;
    const slide = S.done[s] ? 0 : Math.sin(G.frame * 0.05) * 3;
    ctx.save();
    const glow = ctx.createRadialGradient(cx, 420, 20, cx, 420, 300); glow.addColorStop(0, s === 0 ? 'rgba(40,120,255,0.35)' : 'rgba(255,40,60,0.35)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(cx - 300, 120, 600, 600);
    if (S.flash && S.flash[0] === s) { ctx.filter = 'brightness(2)'; }
    if (s === 1) { ctx.translate(cx * 2, 0); ctx.scale(-1, 1); }
    ctx.drawImage(im, cx - w / 2, 150 + slide, w, hgt);
    ctx.restore();
    const ny = 640;
    ctx.save(); ctx.fillStyle = s === 0 ? 'rgba(30,100,230,0.85)' : 'rgba(220,30,50,0.85)';
    ctx.beginPath(); ctx.moveTo(cx - 170, ny - 34); ctx.lineTo(cx + 185, ny - 34); ctx.lineTo(cx + 170, ny + 30); ctx.lineTo(cx - 185, ny + 30); ctx.closePath(); ctx.fill(); ctx.restore();
    txt(C.name, cx, ny - 4, { size: 44, weight: 900, color: '#fff', stroke: '#000', sw: 4 });
    txt(C.tag, cx, ny + 50, { size: 20, weight: 700, color: 'rgba(255,255,255,0.75)' });
    txt(G.mode === 'online' ? (s === NET.slot ? 'YOU' : 'FRIEND') : (s === 0 ? '1P' : (cpu ? 'CPU' : '2P')), cx, 140, { size: 44, font: FE, weight: 700, color: s === 0 ? '#3ea0ff' : '#ff3b4a', rtl: false, italic: true });
    { const kd = gpSlotKind(s); if (kd && !(cpu && s === 1)) txt('🎮 ' + kd, cx + (s === 0 ? 105 : -105), 142, { size: 24, font: FE, weight: 700, color: '#9fd8ff', rtl: false }); }
    if (S.done[s]) {
      ctx.save(); ctx.translate(cx, 400); ctx.rotate(-0.12);
      txt('جاهز!', 0, 0, { size: 70, weight: 900, color: '#ffd34d', stroke: '#000', sw: 8, glow: '#ff8a00' }); ctx.restore();
    }
  }
  // tiles
  const tw = 80, gap = 8, total = 7 * tw + 6 * gap, x0 = VW / 2 - total / 2, ty0 = 185, rowH = tw + 40;
  const tpos = i => [x0 + (i % 7) * (tw + gap), ty0 + ((i / 7) | 0) * rowH];
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
    txt(s === 0 ? '1P' : (cpu ? 'CPU' : '2P'), lx + 22, ty + 13, { size: 22, font: FE, weight: 700, color: '#fff', rtl: false });
  }
  // stats for both
  const statN = ['قوة', 'سرعة', 'تحمّل'];
  for (let s = 0; s < 2; s++) {
    const C = CHARS[S.cur[s]], bx = s === 0 ? 430 : VW - 430 - 180, by = 486;
    for (let j = 0; j < 3; j++) {
      const y = by + j * 34;
      txt(statN[j], bx + 220, y, { size: 18, weight: 700, color: 'rgba(255,255,255,0.7)', align: 'right' });
      for (let q = 0; q < 5; q++) { ctx.fillStyle = q < C.stats[j] ? (s === 0 ? '#3ea0ff' : '#ff3b4a') : 'rgba(255,255,255,0.12)'; ctx.fillRect(bx + q * 30, y - 8, 26, 16); }
    }
    txt('المهارة: ' + SKILL_NAMES[S.cur[s]], bx + 110, by + 110, { size: 19, weight: 800, color: '#ffd34d' });
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
    const im = bossVS ? shadowOf(IMG['vs' + (S.cur[s] + 1)]) : IMG['vs' + (S.cur[s] + 1)]; const u = easeOut(clamp(t / 30, 0, 1));
    const hgt = 600, w = im.width * hgt / im.height;
    ctx.save();
    // clip each portrait to its own half so it never covers the opponent
    ctx.beginPath();
    if (s === 0) { ctx.moveTo(0, 0); ctx.lineTo(VW / 2 + 90, 0); ctx.lineTo(VW / 2 - 90, VH); ctx.lineTo(0, VH); }
    else { ctx.moveTo(VW / 2 + 90, 0); ctx.lineTo(VW, 0); ctx.lineTo(VW, VH); ctx.lineTo(VW / 2 - 90, VH); }
    ctx.closePath(); ctx.clip();
    if (s === 0) { const cx = lerp(-w / 2, VW * 0.28, u); ctx.drawImage(im, cx - w / 2, VH - hgt, w, hgt); }
    else { const cx = lerp(VW + w / 2, VW * 0.72, u); ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.drawImage(im, -w / 2, VH - hgt, w, hgt); }
    ctx.restore();
    const C = CHARS[S.cur[s]];
    const nx = s === 0 ? lerp(-400, 260, u) : lerp(VW + 400, VW - 260, u);
    txt(bossVS ? 'ظل ' + C.name : C.name, nx, 640, { size: bossVS ? 64 : 76, weight: 900, color: bossVS ? '#e0b0ff' : '#fff', stroke: '#000', sw: 8, glow: s === 0 ? '#3ea0ff' : bossVS ? '#b030ff' : '#ff3b4a', glowBlur: 30 });
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
  const im = IMG['vs' + (R.ci + 1)], hgt = 640, w = im.width * hgt / im.height, u = easeOut(clamp(t / 30, 0, 1));
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
    case 'result': updResult(); break;
  }
}
function render() {
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
  ctx.restore();
  tcFrame();
}
function loop(ts) {
  if (!last) last = ts;
  acc += Math.min(100, ts - last); last = ts;
  let n = 0;
  while (acc >= 1000 / 60 && n < 5) { if (!window.__hold) tick(); acc -= 1000 / 60; n++; }
  render();
  requestAnimationFrame(loop);
}
window.__step = (n = 1) => { for (let i = 0; i < n; i++) tick(); render(); };
window.__tick = (n = 1) => { for (let i = 0; i < n; i++) tick(); };

async function boot() {
  requestAnimationFrame(loop);
  const fontP = (document.fonts && document.fonts.load) ? Promise.race([Promise.all([document.fonts.load(`900 40px Cairo`), document.fonts.load(`700 40px Teko`), document.fonts.load(`800 40px Cairo`)]), new Promise(r => setTimeout(r, 2500))]).catch(() => { }) : Promise.resolve();
  await Promise.all([loadImages(), fontP]);
  for (let i = 0; i < NCH; i++) RIGS[i] = buildRig(i);
  BACKDROP = makeBackdrop();
  cv.focus();
}
boot();
})();
