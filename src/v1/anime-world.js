// ================= عالم الأنمي — عالم بستايل أنمي: ثلاث أراضي، بطاقة لكل بطل فيها مهاراته الأساسية، ومغامرة من ٣ نزالات =================
// أبطال العالم يبدأون بشخصيات اللعبة بألقاب أنمي. الشخصيات الأصلية الجديدة تنضاف لـ ANIME_ROSTER (ci + لقب + مهارات) أول ما توصل رسوماتها.
Object.assign(STAGE_DEFS, {
  anime_sakura: { name: 'قرية الساكورا', make: makeAnimeSakura, floor: ['#e7b98f', '#c8875e', '#5a3324'], grid: 'rgba(120,40,60,0.12)', fog: '255,170,190', petals: '#ffb7d0' },
  anime_sky: { name: 'جزر الغيوم', make: makeAnimeSky, floor: ['#e9f3ff', '#b9d4f2', '#5a7fae'], grid: 'rgba(60,110,180,0.16)', fog: '200,225,255', petals: '#ffffff' },
  anime_moon: { name: 'معبد القمر', make: makeAnimeMoon, floor: ['#3a2a52', '#22173a', '#0a0614'], grid: 'rgba(200,160,255,0.2)', ring: '255,90,140', glow: '#ff5a8c', fog: '30,16,50', twinkle: 1, petals: '#ff9ac0' },
});
const ANIME_WORLDS = [
  { id: 'sakura', name: 'قرية الساكورا', sub: 'قرية جبلية ومعبد وأشجار ورد', stage: 'anime_sakura', col: '#ff7aa8', icon: '🌸' },
  { id: 'sky', name: 'جزر الغيوم', sub: 'جسر طاير بين الجزر فوق السحاب', stage: 'anime_sky', col: '#5ab4ff', icon: '☁️' },
  { id: 'moon', name: 'معبد القمر', sub: 'حلبة تحت قمر عملاق وفوانيس', stage: 'anime_moon', col: '#b07aff', icon: '🌙' },
];
// لقب أنمي لكل بطل (مهاراته تنقرى من حركاته الحقيقية داخل اللعبة)
const ANIME_TITLES = { 0: 'ملك العاصفة', 1: 'وحش الجبل الأسود', 2: 'ساموراي الملعب', 3: 'طبيب الظلال', 4: 'الدرع الحديدي', 5: 'عملاق الزلزال', 6: 'سيد الحكمة', 7: 'فارس اللهب',
  8: 'نينجا الريش', 9: 'ملك الوحوش', 10: 'نجم الإيقاع', 11: 'عبقري الأكاديمية', 12: 'قبضة الصخر', 13: 'سيد العالم الرقمي', 14: 'صقر الرعد', 15: 'ربّان العواصف', 16: 'إمبراطور الذهب',
  18: 'طاهي النار المقدسة', 19: 'ساحر الأكواد', 20: 'سيد المخلوقات', 21: 'حارس الأعماق', 22: 'عين الصقر' };
ANIME_TITLES[BABA] = 'سيد الينابيع'; ANIME_TITLES[FARMER] = 'حارس الحقول';
// extra original anime heroes go here: { ci, title, skills: ['…','…','…'] }
const ANIME_EXTRA = [];
function animeRoster() { return PLAYABLE.map(ci => ({ ci, title: ANIME_TITLES[ci] || 'محارب الأنمي' })).concat(ANIME_EXTRA); }
function animeSkills(h) {
  if (h.skills) return h.skills;
  const ci = h.ci, cb = COMBOS[ci] || {}, L = [SKILL_NAMES[ci], SKILL2_NAMES[ci]];
  for (const k of ['13', '24', '34', '14', '12', '23']) { const id = cb[k], n = id && (COMBO_NAME[id] || (MV[id] && MV[id].cname)); if (n) L.push(n); }
  return [...new Set(L.filter(x => typeof x === 'string' && x.length > 1))].slice(0, 3);
}
function animeSave() { try { localStorage.setItem('shilla_anime', JSON.stringify({ clear: G.anime.clear })); } catch (e) { } }
function animeOpen() { let sv = {}; try { sv = JSON.parse(localStorage.getItem('shilla_anime') || '{}'); } catch (e) { }
  G.anime = { w: 0, cur: 0, t: 0, clear: sv.clear || {}, play: null, msg: null }; G.scene = 'anime'; G.t = 0; SFX.ok(); }
const ANIME_GRID = { cols: 6, dx: 104, dy: 104, x0: 1180, y0: 236 };
function animeGridXY(i) { const r = (i / ANIME_GRID.cols) | 0, c = i % ANIME_GRID.cols; return [ANIME_GRID.x0 - c * ANIME_GRID.dx, ANIME_GRID.y0 + r * ANIME_GRID.dy]; }
function animeTabX(i) { return VW / 2 + (1 - i) * 300; }
function animeStart(A) { const L = animeRoster(), me = L[A.cur], pool = L.filter(h => h.ci !== me.ci);
  const opp = []; while (opp.length < 3 && pool.length) opp.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
  A.run = { me, opp, k: 0, w: A.w, coins: 0 }; animeNext(A); }
function animeNext(A) { const R = A.run, o = R.opp[R.k], W = ANIME_WORLDS[R.w];
  A.play = { k: R.k }; G.mode = 'cpu'; G.stageId = W.stage;
  G.sel = { cur: [R.me.ci, o.ci], done: [true, true], t: 0, readyT: 0, outfit: [0, 0] };
  G.vsName = [R.me.title + ' — ' + CHARS[R.me.ci].name, (R.k === 2 ? '👑 ' : '') + o.title + ' — ' + CHARS[o.ci].name]; G.toVS(); }
function animeSetupFight(F) { const A = G.anime; if (!A || !A.play) return; const k = A.play.k, op = F.f[1];
  if (F.pads[1].cpu) F.pads[1].lvl = 2 + k * 0.7;
  if (k === 2) { op.maxHp = Math.round(op.maxHp * 1.2); op.hp = op.trailHp = op.maxHp; op.dmgMul = (op.dmgMul || 1) * 1.05; } }
function animeResult(w) { const A = G.anime, R = A.run; A.play = null; G.scene = 'anime'; G.fight = null; G.vsName = null; if (AC) Music.intensity = 0; A.t = 0;
  if (w !== 0) { A.msg = { t: '😓 خسرت قدام ' + R.opp[R.k].title + '… جرّب مرة ثانية!', c: '#ff8080', k: 0 }; A.run = null; return; }
  profAward(PROF.cur, 30); R.coins += 30; R.k++;
  if (R.k >= R.opp.length) { const W = ANIME_WORLDS[R.w]; profAward(PROF.cur, 150); R.coins += 150; A.clear[W.id] = 1; animeSave(); A.run = null;
    A.msg = { t: '🏆 صرت بطل ' + W.name + '! +' + R.coins + ' 🪙', c: '#ffd34d', k: 0 }; SFX.ready(); return; }
  A.msg = { t: '✅ فزت! +30 🪙 — النزال ' + (R.k + 1) + ' من ٣ يبدأ…', c: '#7dffb0', k: 0 }; A.nextT = 70; }
function updAnime() { const A = G.anime; if (!A) { G.toTitle(); return; } A.t++; G.t++; if (A.msg) A.msg.k++;
  if (A.nextT > 0 && --A.nextT === 0) { animeNext(A); return; }
  if (A.run) return;
  const L = animeRoster(), n = L.length, cols = ANIME_GRID.cols;
  const p = pads[0].p, q = pads[1].p, ok = p.ok || q.ok, back = p.back || q.back || anyP('Escape', 'Backspace'), tap = cupTap();
  if (p.left || q.left) { A.cur = (A.cur + 1) % n; SFX.move(); } if (p.right || q.right) { A.cur = (A.cur + n - 1) % n; SFX.move(); }
  if (p.down || q.down) { A.cur = Math.min(n - 1, A.cur + cols); SFX.move(); } if (p.up || q.up) { A.cur = Math.max(0, A.cur - cols); SFX.move(); }
  if (p.sp || q.sp || anyP('Tab')) { A.w = (A.w + 1) % 3; SFX.move(); }
  let go = false;
  if (tap) { for (let i = 0; i < 3; i++) if (Math.abs(tap[0] - animeTabX(i)) < 140 && Math.abs(tap[1] - 120) < 30) { A.w = i; SFX.move(); }
    for (let i = 0; i < n; i++) { const [x, y] = animeGridXY(i); if (Math.hypot(tap[0] - x, tap[1] - y) < 44) { if (A.cur === i) go = true; else { A.cur = i; SFX.move(); } } }
    if (Math.abs(tap[0] - 275) < 190 && Math.abs(tap[1] - 640) < 30) go = true;
    if (tap[0] < 150 && tap[1] < 80) { SFX.move(); G.toTitle(); return; } }
  if ((ok && A.t > 10) || go) { SFX.ok(); A.msg = null; animeStart(A); return; }
  if (back && A.t > 10) { SFX.move(); G.toTitle(); } }
function drawAnime() { const A = G.anime, W = ANIME_WORLDS[A.w], L = animeRoster(); A.cur = clamp(A.cur | 0, 0, L.length - 1); const h = L[A.cur], ci = h.ci;
  drawStage({ x: Math.sin(G.frame * 0.004) * 160, z: 1, yaw: Math.sin(G.frame * 0.003) * 0.35 }, G.frame, W.stage);
  ctx.fillStyle = 'rgba(6,4,16,0.55)'; ctx.fillRect(0, 0, VW, VH);
  txt('🌸 عالم الأنمي', VW / 2, 52, { size: 44, weight: 900, color: '#fff', glow: W.col, glowBlur: 26 });
  txt('◀ رجوع', 70, 40, { size: 20, weight: 800, color: 'rgba(255,255,255,0.75)' });
  ANIME_WORLDS.forEach((w, i) => { const x = animeTabX(i), on = i === A.w; ctx.fillStyle = on ? w.col : 'rgba(255,255,255,0.08)'; ctx.globalAlpha = on ? 0.9 : 1; rrect(x - 135, 96, 270, 48, 24); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = on ? '#fff' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = on ? 3 : 1.5; rrect(x - 135, 96, 270, 48, 24); ctx.stroke();
    txt(w.icon + ' ' + w.name + (A.clear[w.id] ? ' ✓' : ''), x, 121, { size: 22, weight: 900, color: '#fff' }); });
  txt(W.sub + (TOUCH_ON ? '' : '  ·  Space: تغيير الأرض'), VW / 2, 168, { size: 17, weight: 700, color: 'rgba(255,255,255,0.7)' });
  // hero grid
  L.forEach((e, i) => { const [x, y] = animeGridXY(i), on = i === A.cur, im = IMG['face' + (e.ci + 1)], R = on ? 44 : 38;
    if (on) { ctx.fillStyle = W.col; ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.arc(x, y, 52 + Math.sin(G.frame * 0.15) * 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fillStyle = '#1a1c2a'; ctx.fill(); ctx.clip(); if (im) ctx.drawImage(im, x - R, y - R, R * 2, R * 2); ctx.restore();
    ctx.strokeStyle = on ? '#fff' : CHARS[e.ci].color || '#888'; ctx.lineWidth = on ? 4 : 3; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke(); });
  // the hero card
  const X = 40, Y = 190, CW = 470, CH = 480; sgFrame(X, Y, CW, CH, W.col);
  const vs = IMG['vs' + (ci + 1)]; if (vs) { ctx.save(); rrect(X + 8, Y + 8, CW - 16, 200, 14); ctx.clip(); const g = ctx.createLinearGradient(0, Y, 0, Y + 228); g.addColorStop(0, W.col); g.addColorStop(1, '#120a1e'); ctx.fillStyle = g; ctx.fillRect(X, Y, CW, 210);
    const s = Math.max((CW - 16) / vs.width, 240 / vs.height), w = vs.width * s, hh = vs.height * s; ctx.drawImage(vs, X + CW / 2 - w / 2, Y + 8, w, hh); ctx.restore(); }
  txt(CHARS[ci].name, X + CW / 2, Y + 232, { size: 32, weight: 900, color: '#fff' });
  txt('«' + h.title + '»', X + CW / 2, Y + 266, { size: 22, weight: 800, color: W.col });
  ctx.fillStyle = W.col; ctx.fillRect(X + 60, Y + 288, CW - 120, 2);
  txt('المهارات الأساسية', X + CW / 2, Y + 310, { size: 22, weight: 900, color: '#ffd34d' });
  animeSkills(h).forEach((s, i) => { const yy = Y + 344 + i * 30; txt('◆ ' + s, X + CW / 2, yy, { size: 20, weight: 800, color: '#fff' }); });
  const on = A.t % 40 < 30; ctx.fillStyle = on ? W.col : 'rgba(255,255,255,0.15)'; rrect(X + CW / 2 - 180, 618, 360, 46, 23); ctx.fill();
  txt(TOUCH_ON ? '⚔️ المس هنا — ابدأ المغامرة' : '⚔️ Enter — ابدأ المغامرة (٣ نزالات)', X + CW / 2, 642, { size: 20, weight: 900, color: '#fff' });
  if (A.msg && A.msg.k < 400) { ctx.fillStyle = 'rgba(8,8,18,0.92)'; rrect(VW / 2 - 330, 668, 660, 42, 21); ctx.fill(); txt(A.msg.t, VW / 2, 690, { size: 20, weight: 900, color: A.msg.c }); }
}
// falling petals over anime stages
function animePetals(SD, t) { if (!SD.petals) return; ctx.save(); ctx.fillStyle = SD.petals;
  for (let i = 0; i < 34; i++) { const s = (i * 73) % 100 / 100, x = ((i * 191 + t * (0.6 + s)) % (VW + 80)) - 40, y = ((i * 97 + t * (1 + s * 0.8)) % (VH + 40)) - 20, a = t * 0.05 + i;
    ctx.globalAlpha = 0.55 + s * 0.4; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, 6 + s * 4, 3 + s * 2, 0, 0, 7); ctx.fill(); ctx.restore(); }
  ctx.restore(); }
// ---- backdrops (2400 x 720 panoramas, painted once)
function animeMountains(g, W, hy, cols, base, amp, seed) { cols.forEach((c, k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, hy);
  for (let x = 0; x <= W; x += 40) { const y = hy - base + k * 40 - Math.abs(Math.sin(x / (260 - k * 40) + seed + k)) * amp * (1 - k * 0.2); g.lineTo(x, y); } g.lineTo(W, hy); g.closePath(); g.fill(); }); }
function animeSakuraTree(g, x, y, s) { g.strokeStyle = '#4a2a22'; g.lineWidth = 14 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 10 * s, y - 80 * s, x + 6 * s, y - 150 * s); g.stroke();
  g.lineWidth = 6 * s; for (const d of [-1, 1]) { g.beginPath(); g.moveTo(x, y - 100 * s); g.lineTo(x + d * 60 * s, y - 160 * s); g.stroke(); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = 60 * s + (i % 3) * 14 * s; g.fillStyle = ['#ffc4d8', '#ff9ec0', '#ffd8e6'][i % 3]; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.9, y - 170 * s + Math.sin(a) * r * 0.55, 34 * s, 0, 7); g.fill(); } }
function animePagoda(g, x, hy, s) { const tiers = 4; g.fillStyle = '#2a1420'; g.fillRect(x - 46 * s, hy - 60 * s, 92 * s, 60 * s);
  for (let i = 0; i < tiers; i++) { const y = hy - 60 * s - i * 62 * s, w = (130 - i * 18) * s; g.fillStyle = '#b8323e'; g.fillRect(x - w * 0.36, y - 46 * s, w * 0.72, 46 * s);
    g.fillStyle = '#1e1016'; g.beginPath(); g.moveTo(x - w * 0.62, y - 40 * s); g.quadraticCurveTo(x, y - 74 * s, x + w * 0.62, y - 40 * s); g.lineTo(x + w * 0.48, y - 50 * s); g.quadraticCurveTo(x, y - 82 * s, x - w * 0.48, y - 50 * s); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,214,120,0.85)'; g.fillRect(x - 8 * s, y - 34 * s, 16 * s, 20 * s); }
  g.strokeStyle = '#d4a640'; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x, hy - 60 * s - tiers * 62 * s); g.lineTo(x, hy - 60 * s - tiers * 62 * s - 60 * s); g.stroke(); }
function animeTorii(g, x, hy, s, col) { g.fillStyle = col; g.fillRect(x - 70 * s, hy - 200 * s, 16 * s, 200 * s); g.fillRect(x + 54 * s, hy - 200 * s, 16 * s, 200 * s); g.fillRect(x - 86 * s, hy - 168 * s, 172 * s, 14 * s);
  g.beginPath(); g.moveTo(x - 110 * s, hy - 214 * s); g.quadraticCurveTo(x, hy - 196 * s, x + 110 * s, hy - 214 * s); g.lineTo(x + 100 * s, hy - 196 * s); g.quadraticCurveTo(x, hy - 182 * s, x - 100 * s, hy - 196 * s); g.closePath(); g.fill(); }
function animeLantern(g, x, y, s) { g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(x, y, 2, x, y, 50 * s); lg.addColorStop(0, 'rgba(255,190,110,0.55)'); lg.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = lg; g.beginPath(); g.arc(x, y, 50 * s, 0, 7); g.fill(); g.restore();
  g.fillStyle = '#ff6a3a'; g.beginPath(); g.ellipse(x, y, 16 * s, 22 * s, 0, 0, 7); g.fill(); g.fillStyle = '#2a1010'; g.fillRect(x - 10 * s, y - 24 * s, 20 * s, 5 * s); g.fillRect(x - 10 * s, y + 19 * s, 20 * s, 5 * s); }
function makeAnimeSakura() { const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#5a3a8a'); gr.addColorStop(0.45, '#ff8aa8'); gr.addColorStop(0.8, '#ffc48a'); gr.addColorStop(1, '#ffe2b0'); g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  g.save(); g.globalCompositeOperation = 'lighter'; const sg = g.createRadialGradient(1200, hy - 120, 20, 1200, hy - 120, 340); sg.addColorStop(0, 'rgba(255,240,200,0.9)'); sg.addColorStop(1, 'rgba(255,160,120,0)'); g.fillStyle = sg; g.beginPath(); g.arc(1200, hy - 120, 340, 0, 7); g.fill(); g.restore();
  g.fillStyle = '#fff4dc'; g.beginPath(); g.arc(1200, hy - 120, 70, 0, 7); g.fill();
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,0.35)'; const x = (i * 311) % W, y = 60 + (i * 47) % 160; g.beginPath(); g.ellipse(x, y, 120, 18, 0, 0, 7); g.ellipse(x + 60, y - 10, 70, 14, 0, 0, 7); g.fill(); }
  animeMountains(g, W, hy, ['#8a5a9a', '#6a3a7a', '#4a2a5a'], 260, 160, 1);
  animePagoda(g, 1700, hy - 30, 1.1); animePagoda(g, 420, hy - 20, 0.8);
  g.fillStyle = '#3a2232'; g.fillRect(0, hy - 34, W, 34); g.fillStyle = '#5a3442'; g.fillRect(0, hy - 38, W, 6);
  for (const [x, s] of [[150, 1], [700, 1.2], [1000, 0.9], [1450, 1.1], [2050, 1.25], [2300, 0.9]]) animeSakuraTree(g, x, hy - 30, s);
  for (let x = 80; x < W; x += 220) animeLantern(g, x, hy - 70, 0.8);
  return c; }
function makeAnimeSky() { const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#2a7ae0'); gr.addColorStop(0.6, '#7cc4ff'); gr.addColorStop(1, '#d8f0ff'); g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  const cloud = (x, y, s, a) => { g.fillStyle = `rgba(255,255,255,${a})`; for (const [dx, dy, r] of [[0, 0, 60], [55, -20, 50], [110, 0, 58], [55, 15, 55], [-50, 10, 40], [160, 12, 40]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); } };
  for (let i = 0; i < 12; i++) cloud((i * 233) % W, 60 + (i * 61) % 200, 0.6 + (i % 3) * 0.3, 0.75);
  // floating islands with a castle and waterfalls
  const island = (x, y, s, castle) => { g.fillStyle = '#6a4a3a'; g.beginPath(); g.moveTo(x - 160 * s, y); g.lineTo(x + 160 * s, y); g.lineTo(x + 60 * s, y + 110 * s); g.lineTo(x, y + 170 * s); g.lineTo(x - 70 * s, y + 100 * s); g.closePath(); g.fill();
    g.fillStyle = '#5ac46a'; g.beginPath(); g.ellipse(x, y, 165 * s, 24 * s, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(220,245,255,0.8)'; g.fillRect(x + 90 * s, y + 4, 10 * s, 140 * s);
    if (castle) { g.fillStyle = '#eef2fa'; g.fillRect(x - 70 * s, y - 120 * s, 140 * s, 120 * s); for (const dx of [-80, -20, 40]) { g.fillRect(x + dx * s, y - 170 * s, 40 * s, 170 * s); g.fillStyle = '#3a6ac8'; g.beginPath(); g.moveTo(x + dx * s - 6 * s, y - 170 * s); g.lineTo(x + (dx + 20) * s, y - 220 * s); g.lineTo(x + (dx + 46) * s, y - 170 * s); g.fill(); g.fillStyle = '#eef2fa'; } }
    else { g.fillStyle = '#3a9a4a'; for (const dx of [-90, -40, 30, 90]) { g.beginPath(); g.arc(x + dx * s, y - 26 * s, 30 * s, 0, 7); g.fill(); } } };
  island(500, 250, 1.1, true); island(1350, 180, 0.7, false); island(1950, 290, 0.9, true); island(150, 330, 0.5, false);
  // the bridge you fight on
  g.fillStyle = '#c99a62'; g.fillRect(0, hy - 30, W, 30); g.fillStyle = '#8a5a32'; g.fillRect(0, hy - 34, W, 5);
  g.strokeStyle = '#8a5a32'; g.lineWidth = 4; for (let x = 0; x < W; x += 120) { g.beginPath(); g.moveTo(x, hy - 34); g.lineTo(x, hy - 90); g.stroke(); }
  g.beginPath(); for (let x = 0; x <= W; x += 10) { const y = hy - 90 + Math.sin((x % 120) / 120 * Math.PI) * 18; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  for (let i = 0; i < 8; i++) cloud((i * 331 + 90) % W, hy - 10, 1.1, 0.95);
  return c; }
function makeAnimeMoon() { const [c, g] = bdCanvas(), W = c.width, hy = HORIZON;
  let gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#05030f'); gr.addColorStop(0.55, '#24124a'); gr.addColorStop(1, '#5a2a6a'); g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; g.fillRect(Math.random() * W, Math.random() * 360, Math.random() < 0.1 ? 2 : 1, Math.random() < 0.1 ? 2 : 1); }
  g.save(); g.globalCompositeOperation = 'lighter'; const mg = g.createRadialGradient(1200, 210, 30, 1200, 210, 380); mg.addColorStop(0, 'rgba(255,220,240,0.7)'); mg.addColorStop(1, 'rgba(160,90,255,0)'); g.fillStyle = mg; g.beginPath(); g.arc(1200, 210, 380, 0, 7); g.fill(); g.restore();
  g.fillStyle = '#ffeef6'; g.beginPath(); g.arc(1200, 210, 170, 0, 7); g.fill(); g.fillStyle = 'rgba(220,180,210,0.5)'; for (const [dx, dy, r] of [[-50, -30, 30], [40, 40, 22], [60, -60, 16], [-20, 70, 18]]) { g.beginPath(); g.arc(1200 + dx, 210 + dy, r, 0, 7); g.fill(); }
  animeMountains(g, W, hy, ['#2a1840', '#1a0e2e', '#0e0820'], 200, 120, 3);
  for (const x of [300, 900, 1500, 2100]) animeTorii(g, x, hy - 30, 1, '#c8243a');
  g.fillStyle = '#1a1028'; g.fillRect(0, hy - 34, W, 34); g.fillStyle = '#3a2450'; g.fillRect(0, hy - 38, W, 6);
  for (let x = 60; x < W; x += 160) { g.strokeStyle = '#2a1830'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, hy - 260 - (x % 3) * 30); g.stroke(); animeLantern(g, x, hy - 240 - (x % 3) * 30, 0.9); }
  return c; }
window.__animeAPI = { animeOpen, animeStart, animeRoster, animeSkills };
