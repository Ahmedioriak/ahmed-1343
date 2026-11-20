// القصة ٤ — أشكال جديدة من رسومات المستخدم (شخصيات القصة فقط)
// [key, base (moves/voice), name, h, hp, dmg, color]
const S4_FORMS = [
  ['moalem', 6, 'الداهية', 0.97, 1.2, 0.95, '#d4a640'],
  ['abd', 12, 'صخر', 0.98, 1.22, 0.95, '#ffb347'],
  ['exp', 0, 'زيرو', 1.04, 1.15, 0.93, '#b47aff'],
  ['bull', 5, 'جلمود', 1.06, 1.3, 0.85, '#2fb39a'],
  ['mech', CODER, 'الدرع الأسود', 1.0, 1.3, 0.9, '#ff2a3a'],
  ['robot', 5, 'تيتان', 1.02, 1.32, 0.88, '#54e0d0'],
  // الفصول ١٧–٢٥: خمسة أعداء جدد سريعين (انتقال خاطف + ضربات من بعيد) وأشكال الظلام
  ['diver', 15, 'الغوّاص', 1.0, 1.28, 0.92, '#7fe0ff'],
  ['masks', 27, 'صاحب الأقنعة', 1.02, 1.24, 0.92, '#ff3a4a'],
  ['echo', 22, 'صدى', 1.03, 1.2, 0.92, '#7fffd4'],
  ['prisoner', 1, 'السجين ٧٣١٤', 1.08, 1.36, 0.9, '#ff8a3a'],
  ['warden', 4, 'آمر السجن', 1.0, 1.28, 0.92, '#4da3ff'],
  ['dfarmer', FARMER, 'المزارع — قوة الظلام', 1.04, 1.55, 0.95, '#9b3cff', { dark: 1 }],
  ['dbaba', BABA, 'بابا الوه — طاقة الظلام', 1.06, 1.85, 1.0, '#c22cff', { dark: 2 }],
];
const S4 = {};
for (const [key, base, name, h, hp, dmg, color, o] of S4_FORMS) {
  S4[key] = CHARS.length;
  CHARS.push({ ...CHARS[base], name, h, hp, dmg, color, hidden: 1, s4: key, s4base: base, props: o && o.dark ? CHARS[base].props : null, malali: 0, nasser: 0, hamad: 0, ...(o || {}) });
}
const S4_MOALEM = S4.moalem, S4_ABD = S4.abd, S4_EXP = S4.exp, S4_BULL = S4.bull, S4_MECH = S4.mech, S4_ROBOT = S4.robot;
const S4_VOICE = { moalem: 'c6', abd: 'c12', exp: 'c26', bull: 'c5', mech: 'c19', robot: 'c27', diver: 'c15', masks: 'c27', echo: 'c22', prisoner: 'c1', warden: 'c4', dfarmer: 'c' + FARMER, dbaba: 'c' + BABA };

function s4Wave(f, color, o = {}) {
  const [hx, hy] = f.toWorld(f.J.fH);
  const { dmg = 17, speed = 17, r = 46, low = false, kind = 'orb', life = 52 } = o;
  const x = low ? f.x + f.facing * 85 : hx + f.facing * 25, y = low ? -r : Math.max(-220, Math.min(-90, hy));
  SFX.zap(); finRing(x, y, color, r * 1.7, 14);
  spawnProj({ kind: 's4' + kind, owner: f, x, y, vx: speed * f.facing, vy: 0, r, life, col: color, wide: true, rot: 0, draw(p) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (kind === 'axe') {   // a spinning axe
      p.rot += 0.45 * Math.sign(p.vx || 1); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = '#c9a24a'; ctx.strokeStyle = '#2fb39a'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-6, -p.r); ctx.lineTo(6, -p.r); ctx.lineTo(6, p.r); ctx.lineTo(-6, p.r); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -p.r * 0.9); ctx.quadraticCurveTo(p.r * 1.3, -p.r * 0.2, 0, p.r * 0.35); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (kind === 'grid') {   // the mastermind's red net
      ctx.strokeStyle = p.col; ctx.lineWidth = 3; ctx.globalAlpha = 0.85;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(p.x + i * p.r * 0.4, p.y - p.r); ctx.lineTo(p.x + i * p.r * 0.4, p.y + p.r); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x - p.r, p.y + i * p.r * 0.4); ctx.lineTo(p.x + p.r, p.y + i * p.r * 0.4); ctx.stroke(); }
    } else if (kind === 'beam') {
      const g = ctx.createLinearGradient(p.x - p.r * 2, 0, p.x + p.r * 2, 0); g.addColorStop(0, 'rgba(255,40,60,0)'); g.addColorStop(0.5, '#fff0f0'); g.addColorStop(1, 'rgba(255,40,60,0)');
      ctx.fillStyle = g; ctx.fillRect(p.x - p.r * 2.4, p.y - p.r * 0.35, p.r * 4.8, p.r * 0.7);
    } else if (kind === 'mask') {   // a spinning theatre mask
      p.rot += 0.35 * Math.sign(p.vx || 1); ctx.globalCompositeOperation = 'source-over'; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = '#f3ead8'; ctx.strokeStyle = p.col; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, p.r * 0.75, p.r, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#120a0a'; ctx.beginPath(); ctx.ellipse(-p.r * 0.3, -p.r * 0.22, p.r * 0.16, p.r * 0.1, 0, 0, 7); ctx.ellipse(p.r * 0.3, -p.r * 0.22, p.r * 0.16, p.r * 0.1, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#120a0a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, p.r * 0.2, p.r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else if (kind === 'sonic') {   // rings of sound
      ctx.strokeStyle = p.col; const d = Math.sign(p.vx || 1);
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.9 - i * 0.2; ctx.lineWidth = 6 - i; ctx.beginPath(); ctx.ellipse(p.x - d * i * 16, p.y, p.r * (0.35 + i * 0.12), p.r * (0.8 + i * 0.25), 0, d > 0 ? -1.2 : Math.PI - 1.2, d > 0 ? 1.2 : Math.PI + 1.2); ctx.stroke(); }
    } else if (kind === 'zap') {   // electric bolt
      ctx.strokeStyle = '#e8f6ff'; ctx.shadowColor = p.col; ctx.shadowBlur = 18; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p.x - p.r * 1.6, p.y);
      for (let i = 1; i <= 6; i++) ctx.lineTo(p.x - p.r * 1.6 + i * p.r * 0.53, p.y + (i % 2 ? -1 : 1) * rnd(6, 16)); ctx.stroke();
      ctx.strokeStyle = p.col; ctx.lineWidth = 9; ctx.globalAlpha = 0.35; ctx.stroke();
    } else if (kind === 'dark') {   // a ball of darkness with a burning rim
      const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r * 1.4); g.addColorStop(0, '#05010a'); g.addColorStop(0.55, '#1a0626'); g.addColorStop(0.8, p.col); g.addColorStop(1, 'rgba(120,0,200,0)');
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.4, 0, 7); ctx.fill();
      if (p.t % 2 === 0) FX.push({ t: 'p', x: p.x + rnd(-p.r, p.r) * 0.6, y: p.y + rnd(-p.r, p.r) * 0.6, vx: -Math.sign(p.vx || 1) * rnd(1, 3), vy: -rnd(0.5, 2), life: 16, max: 16, c: VOIDC[p.t % 4], sz: rnd(2, 6) });
    } else {
      const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.r * 1.35); g.addColorStop(0, '#fff8f0'); g.addColorStop(0.4, p.col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * 1.3, p.r, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
  }, m: { dmg, lvl: low ? 'low' : 'mid', hs: 22, bs: 14, push: 38, stop: 8, p: 1.45, kd: 1 } });
}
// signature skills: several shots at once, heavier hits
const s4Multi = (f, n, fn) => { for (let i = 0; i < n; i++) fn(i); };
MV.sk_s4_net = projMove(11, 22, PZ.windup, PZ.release, f => s4Multi(f, 3, i => s4Wave(f, '#ff2a3a', { kind: 'grid', dmg: 10, r: 56, speed: 13 + i * 3 })), { skill: 1 });
MV.sk_s4_rock = projMove(14, 22, PZ.stompUp, PZ.pound, f => { s4Wave(f, '#ffb347', { low: true, dmg: 16, r: 56 }); s4Rain(f, '#a0703c', 3, 8); F_shake(18); }, { skill: 1 });
MV.sk_s4_lash = dashMove({ st: 8, ac: 13, rc: 18, sp: 28, trail: 1, limb: 'fH', r: 96, dmg: 18, kd: 1, pose: PZ.punch, skill: 1 });
MV.sk_s4_axe = projMove(12, 22, PZ.windup, PZ.release, f => s4Multi(f, 2, i => s4Wave(f, '#c9a24a', { kind: 'axe', dmg: 14, r: 40, speed: 15 + i * 4, low: i === 1, life: 64 })), { skill: 1 });
MV.sk_s4_laser = projMove(13, 24, PZ.windup, PZ.release, f => s4Multi(f, 3, i => s4Wave(f, '#ff2a3a', { kind: 'beam', dmg: 9, r: 42, speed: 20 + i * 7 })), { skill: 1 });
MV.sk_s4_jet = dashMove({ st: 9, ac: 15, rc: 20, sp: 26, trail: 1, limb: 'fH', r: 76, dmg: 20, kd: 1, pose: PZ.shoulder, skill: 1 });
// boss specials (the CPU uses them when you face these fighters)
function s4Rain(f, color, n, dmg, kind = 'orb') {
  const op = G.fight && G.fight.f.find(x => x !== f); if (!op) return;
  for (let i = 0; i < n; i++) spawnProj({ kind: 's4rain', owner: f, x: op.x + (i - (n - 1) / 2) * 110 + rnd(-30, 30), y: -900 - i * 160, vx: 0, vy: 13, g: 0.3, r: 34, life: 150, col: color, big: 1, draw(p) {
    ctx.save(); if (kind === 'dark') { const g = ctx.createRadialGradient(p.x, p.y, 3, p.x, p.y, 50); g.addColorStop(0, '#05010a'); g.addColorStop(0.6, '#2a0840'); g.addColorStop(0.85, p.col); g.addColorStop(1, 'rgba(120,0,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 50, 0, 7); ctx.fill(); ctx.restore(); return; } ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(p.x, p.y, 3, p.x, p.y, 48); g.addColorStop(0, '#fff8ee'); g.addColorStop(0.45, p.col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 48, 0, 7); ctx.fill(); ctx.restore(); },
    m: { dmg, lvl: 'mid', hs: 20, bs: 12, push: 20, stop: 6, p: 1.3, kd: i === n - 1 ? 1 : 0 } });
}
MV.sk_s4_ringrain = projMove(12, 24, PZ.armsUp || PZ.windup, PZ.release, f => s4Rain(f, '#ffd34d', 4, 8), { skill: 1 });
MV.sk_s4_meteor = projMove(14, 24, PZ.windup, PZ.pound, f => { s4Rain(f, '#c27a3a', 4, 9); F_shake(14); }, { skill: 1 });
MV.sk_s4_spit = projMove(9, 22, PZ.windup, PZ.release, f => s4Multi(f, 4, i => s4Wave(f, '#b47aff', { dmg: 8, r: 32, speed: 18 + i * 3, low: i % 2 === 1 })), { skill: 1 });
MV.sk_s4_charge = dashMove({ st: 11, ac: 16, rc: 22, sp: 27, trail: 1, limb: 'fH', r: 92, dmg: 20, kd: 1, pose: PZ.shoulder, skill: 1 });
MV.sk_s4_missiles = projMove(13, 24, PZ.windup, PZ.release, f => { s4Rain(f, '#ff8a40', 4, 8); s4Wave(f, '#ff2a3a', { kind: 'beam', dmg: 10, r: 40, speed: 30 }); }, { skill: 1 });
MV.sk_s4_quake = projMove(16, 24, PZ.stompUp, PZ.pound, f => { s4Multi(f, 3, i => s4Wave(f, '#9fe8ff', { low: true, dmg: 10, r: 52, speed: 15 + i * 3 })); F_shake(20); }, { skill: 1 });
// ---- الانتقال الخاطف: يختفي ويطلع ورا خصمه ويضرب (with an optional extra shot after the hit)
function s4BlinkStep(f) { const m = f.mv, o = bossOppOf(f); if (!o) return; const C = [m.col, '#ffffff', m.col, '#1a1c2a'];
  if (f.mt === 3) { SFX.whoosh(1); finBurst(f.x, -150, 22, C, 8, 7); }
  if (f.mt >= 3 && f.mt < m.st) f.invuln = Math.max(f.invuln, 2);
  if (f.mt === m.tp) { const side = f.x < o.x ? 1 : -1; f.x = clamp(o.x + side * 112, -STAGE + 60, STAGE - 60); f.facing = o.x > f.x ? 1 : -1; finBurst(f.x, -150, 22, C, 8, 7); finRing(f.x, -150, m.col, 150, 14); SFX.zap(); }
  if (f.mt === m.st) { SFX.whoosh(0); if (m.after) m.after(f); } }
function s4Blink(col, dmg, o = {}) { const st = o.st || 15, tp = st - 6, rc = o.rc || 18;
  return Object.assign({ name: 's4blink', limb: 'fH', lvl: 'mid', st, ac: 5, rc, dmg, hs: 22, bs: 14, push: 60, stop: 9, r: 58, p: 1.4, kd: 1, vanish: [4, tp + 1], tp, col, onStep: s4BlinkStep,
    kf: [[0, {}], [3, { ...CROUCH, lean: 30 }], [tp, { ...CROUCH, lean: 20, ua: 40, fa: 120 }], [st - 2, { ua: 30, fa: 140, lean: -6 }], [st, { ua: 94, fa: 0, lean: 24, dx: 20, th: 40, bth: -32 }], [st + 6, { ua: 90, fa: 4, lean: 20, dx: 16 }], [st + 12, {}], [st + 5 + rc, null]] }, o); }
const s4Fan = (f, n, o) => s4Multi(f, n, i => s4Wave(f, o.col, Object.assign({}, o, { speed: (o.speed || 16) + i * 3, low: o.alt ? i % 2 === 1 : o.low })));
// skills of the five new fighters
MV.sk_s4_pearl = projMove(9, 20, PZ.windup, PZ.release, f => { s4Fan(f, 4, { col: '#e8fbff', dmg: 8, r: 30, speed: 19, alt: 1 }); finRing(f.x, -200, '#7fe0ff', 180, 14); }, { skill: 1 });
MV.sk_s4_dive = s4Blink('#3cb4ff', 17, { skill: 1, after: f => s4Wave(f, '#7fe0ff', { low: true, dmg: 9, r: 50, speed: 15 }) });
MV.sk_s4_masks = projMove(8, 20, PZ.windup, PZ.release, f => s4Fan(f, 3, { col: '#ff3a4a', kind: 'mask', dmg: 9, r: 34, speed: 15, alt: 1, life: 70 }), { skill: 1 });
MV.sk_s4_curtain = s4Blink('#ff3a4a', 17, { skill: 1, after: f => s4Wave(f, '#ff3a4a', { kind: 'mask', dmg: 8, r: 32, speed: 20 }) });
MV.sk_s4_sonic = projMove(9, 20, PZ.windup, PZ.release, f => { s4Fan(f, 4, { col: '#7fffd4', kind: 'sonic', dmg: 8, r: 58, speed: 14 }); F_shake(6); }, { skill: 1 });
MV.sk_s4_echostep = s4Blink('#7fffd4', 16, { skill: 1, st: 13, after: f => s4Wave(f, '#7fffd4', { kind: 'sonic', dmg: 8, r: 60, speed: 18 }) });
MV.sk_s4_chain = dashMove({ st: 8, ac: 14, rc: 20, sp: 34, trail: 1, limb: 'fH', r: 112, dmg: 19, kd: 1, pose: PZ.punch, skill: 1 });
MV.sk_s4_cellbreak = s4Blink('#ff8a3a', 19, { skill: 1, st: 17, after: f => { s4Wave(f, '#ff8a3a', { low: true, dmg: 10, r: 56 }); F_shake(14); } });
MV.sk_s4_taser = projMove(10, 20, PZ.windup, PZ.release, f => s4Fan(f, 3, { col: '#4da3ff', kind: 'zap', dmg: 9, r: 40, speed: 24 }), { skill: 1 });
MV.sk_s4_alarm = projMove(12, 22, PZ.armsUp || PZ.windup, PZ.release, f => { s4Rain(f, '#4da3ff', 4, 8); s4Wave(f, '#4da3ff', { kind: 'zap', dmg: 9, r: 40, speed: 26 }); }, { skill: 1 });
MV.sk_s4_radio = s4Blink('#4da3ff', 17, { skill: 1 });
// قوة الظلام — المزارع وبابا الوه
MV.sk_s4_dblink = s4Blink('#b030ff', 18, { skill: 1, after: f => s4Wave(f, '#b030ff', { kind: 'dark', low: true, dmg: 10, r: 50, speed: 14 }) });
MV.sk_s4_dharvest = projMove(13, 22, PZ.armsUp || PZ.windup, PZ.pound, f => { s4Rain(f, '#b030ff', 5, 9, 'dark'); s4Wave(f, '#b030ff', { kind: 'dark', low: true, dmg: 11, r: 52 }); F_shake(12); }, { skill: 1 });
MV.sk_s4_dflood = projMove(14, 24, PZ.armsUp || PZ.windup, PZ.release, f => { s4Fan(f, 3, { col: '#c22cff', kind: 'dark', dmg: 10, r: 44, speed: 15, alt: 1 }); s4Rain(f, '#c22cff', 5, 9, 'dark'); F_shake(16); }, { skill: 1 });
MV.sk_s4_dbeam = projMove(11, 22, PZ.windup, PZ.release, f => { s4Wave(f, '#c22cff', { kind: 'dark', dmg: 17, r: 66, speed: 22, life: 70 }); F_shake(10); }, { skill: 1 });
Object.assign(BOSS_NAMES, { sk_s4_pearl: 'عاصفة اللؤلؤ', sk_s4_dive: 'غوصة القاع', sk_s4_masks: 'رقصة الأقنعة', sk_s4_curtain: 'ستارة المسرح', sk_s4_sonic: 'زلزال الصوت', sk_s4_echostep: 'خطوة الصدى',
  sk_s4_chain: 'السلسلة الطويلة', sk_s4_cellbreak: 'كسر الزنزانة', sk_s4_taser: 'الصاعق الثلاثي', sk_s4_alarm: 'إنذار السجن', sk_s4_radio: 'نداء اللاسلكي',
  sk_s4_dblink: 'خطوة الظلام', sk_s4_dharvest: 'حصاد الظلام', sk_s4_dflood: 'طوفان الظلام', sk_s4_dbeam: 'شعاع العتمة', sk_tendril: 'مخالب الظلام', sk_eclipse: 'الكسوف', sk_dwave: 'موجة الظلام', sk_void: 'الهاوية' });
// the dark aura around the farmer and Baba Al-Wah
function s4DarkAura(f) { const b = f.hurt; if (!b) return; const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, big = f.C.dark === 2 ? 1.25 : 1;
  ctx.save(); const r = (200 + Math.sin(G.frame * 0.12) * 16) * big, gr = ctx.createRadialGradient(cx, cy, 20, cx, cy, r);
  gr.addColorStop(0, 'rgba(10,0,20,0.32)'); gr.addColorStop(0.6, 'rgba(120,20,200,0.22)'); gr.addColorStop(1, 'rgba(60,0,100,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.72, r, 0, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(200,60,255,${0.25 + 0.2 * Math.sin(G.frame * 0.3)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, b.y1 - 4, 90 * big, 16, 0, 0, 7); ctx.stroke(); ctx.restore();
  if (G.frame % 2 === 0) FX.push({ t: 'p', x: cx + rnd(-60, 60) * big, y: b.y1 - rnd(0, 120), vx: rnd(-0.6, 0.6), vy: -rnd(2, 5), life: 30, max: 30, c: G.frame % 6 === 0 ? '#ff2a5a' : VOIDC[(G.frame >> 1) % 4], sz: rnd(2, 6) }); }
Object.assign(BOSS_NAMES, { sk_s4_ringrain: 'مطر الخواتم الذهبية', sk_s4_meteor: 'نيازك الصخر', sk_s4_spit: 'عاصفة البصق', sk_s4_charge: 'هجمة العملاق',
  sk_s4_missiles: 'وابل الصواريخ', sk_s4_quake: 'زلزال الحديد', sk_s4_net: 'شبكة الداهية', sk_s4_rock: 'قبضة الصخر', sk_s4_lash: 'الذراع الطويلة', sk_s4_axe: 'الفأسين الدوّارين', sk_s4_laser: 'ليزر البدلة', sk_s4_jet: 'اندفاع النفاثات' });
const S4_BOSS = {
  moalem: d => d > 300 ? [['sk_s4_net', 3], ['sk_s4_ringrain', 3], ['cb_13', 2]] : [['sk_s4_ringrain', 2], ['cb_24', 3], ['cb_34', 2]],
  abd: d => d > 300 ? [['sk_s4_meteor', 3], ['cb_13', 3], ['sk_s4_rock', 2]] : [['sk_s4_rock', 3], ['cb_24', 3], ['cb_34', 2]],
  exp: d => d > 300 ? [['sk_s4_spit', 3], ['sk_s4_lash', 3], ['cb_13', 2]] : [['sk_s4_lash', 3], ['cb_34', 2], ['cb_24', 2]],
  bull: d => d > 300 ? [['sk_s4_axe', 3], ['sk_s4_charge', 3], ['cb_13', 2]] : [['sk_s4_charge', 2], ['cb_34', 3], ['cb_24', 3]],
  mech: d => d > 300 ? [['sk_s4_missiles', 3], ['sk_s4_laser', 3], ['cb_13', 2]] : [['cb_24', 3], ['sk_s4_missiles', 2], ['cb_34', 2]],
  robot: d => d > 300 ? [['cb_24', 3], ['sk_s4_quake', 2], ['cb_13', 3]] : [['sk_s4_jet', 3], ['sk_s4_quake', 3], ['cb_34', 2]],
  diver: d => d > 300 ? [['sk_s4_pearl', 3], ['sk_s4_dive', 3], ['cb_13', 2], ['cb_14', 2]] : [['sk_s4_dive', 2], ['cb_24', 3], ['cb_34', 2], ['cb_14', 1.5]],
  masks: d => d > 300 ? [['sk_s4_masks', 3], ['sk_s4_curtain', 3], ['cb_14', 2.5], ['cb_13', 2]] : [['sk_s4_curtain', 2.5], ['cb_24', 2.5], ['cb_34', 2], ['cb_14', 2]],
  echo: d => d > 300 ? [['sk_s4_sonic', 3], ['sk_s4_echostep', 3], ['cb_13', 2], ['cb_14', 2]] : [['sk_s4_echostep', 3], ['cb_24', 2], ['cb_34', 2], ['sk_s4_sonic', 1]],
  prisoner: d => d > 300 ? [['sk_s4_chain', 3], ['sk_s4_cellbreak', 3], ['cb_13', 2.5], ['cb_14', 1.5]] : [['sk_s4_cellbreak', 2], ['cb_34', 3], ['cb_24', 3], ['cb_14', 1.5]],
  warden: d => d > 300 ? [['sk_s4_taser', 3], ['sk_s4_alarm', 2.5], ['sk_s4_radio', 2.5], ['cb_13', 2]] : [['sk_s4_radio', 2.5], ['cb_24', 3], ['cb_34', 2], ['cb_14', 1.5]],
  dfarmer: d => d > 300 ? [['sk_s4_dharvest', 3], ['sk_dwave', 2.5], ['sk_s4_dblink', 3], ['cb_13', 1.5]] : [['sk_s4_dblink', 2.5], ['sk_tendril', 2], ['sk_s4_dharvest', 1.5], ['cb_24', 2], ['cb_34', 1.5]],
  dbaba: d => d > 300 ? [['sk_s4_dflood', 3], ['sk_s4_dbeam', 2.5], ['sk_s4_dblink', 3], ['sk_eclipse', 1.6], ['sk_void', 1.4]] : [['sk_s4_dblink', 3], ['sk_tendril', 2], ['sk_eclipse', 1.4], ['cb_24', 2], ['sk_s4_dflood', 1.5]],
};
function s4BossPick(ci, d, r) {
  const L = S4_BOSS[CHARS[ci].s4](d).map(([id, w]) => [id.startsWith('cb_') ? COMBOS[ci][id.slice(3)] : id, w]);
  let w = 0; for (const [, x] of L) w += x; let q = r * w; for (const [id, x] of L) { q -= x; if (q <= 0) return id; } return L[0][0];
}
function F_shake(n) { try { G.fight && G.fight.shake(n); } catch (e) { } }
const S4_SKILLS = { moalem: ['sk_s4_net', 'شبكة الداهية'], abd: ['sk_s4_rock', 'قبضة الصخر'], exp: ['sk_s4_lash', 'الذراع الطويلة'],
  bull: ['sk_s4_axe', 'الفأس الدوّار'], mech: ['sk_s4_laser', 'ليزر البدلة'], robot: ['sk_s4_jet', 'اندفاع النفاثات'],
  diver: ['sk_s4_pearl', 'عاصفة اللؤلؤ'], masks: ['sk_s4_masks', 'رقصة الأقنعة'], echo: ['sk_s4_sonic', 'زلزال الصوت'], prisoner: ['sk_s4_chain', 'السلسلة الطويلة'], warden: ['sk_s4_taser', 'الصاعق الثلاثي'],
  dfarmer: ['sk_s4_dharvest', 'حصاد الظلام'], dbaba: ['sk_s4_dflood', 'طوفان الظلام'] };
for (const [key, base] of S4_FORMS) {
  const ci = S4[key];
  COMBOS[ci] = Object.fromEntries(Object.entries(COMBOS[base] || COMBOS[0]).map(([k, [n, m]]) => [k, [n, { ...m }]]));
  SKILL_IDS[ci] = S4_SKILLS[key][0]; SKILL_NAMES[ci] = S4_SKILLS[key][1];
  SKILL2[ci] = SKILL2[base]; SKILL2_NAMES[ci] = SKILL2_NAMES[base]; SKILL2_LINE[ci] = SKILL2_LINE[base];
  BOSS_NAMES[S4_SKILLS[key][0]] = S4_SKILLS[key][1];
}
// each new fighter: its own long-range attacks and strange, heavy specials (button pairs)
const s4P = (st, rc, wind, rel, fn) => projMove(st, rc, wind, rel, fn);
const s4D = (o) => dashMove(Object.assign({ trail: 1, limb: 'fH', kd: 1, pose: PZ.punch }, o));
const S4_MOVES = {
  moalem: { '13': ['شبكة الأقمار', s4P(10, 20, PZ.windup, PZ.release, f => s4Wave(f, '#ff2a3a', { kind: 'grid', dmg: 14, r: 54, speed: 16 }))],
    '14': ['الخاتم الذهبي', s4P(7, 17, PZ.windup, PZ.release, f => s4Wave(f, '#ffd34d', { dmg: 11, r: 28, speed: 26 }))],
    '24': ['ظل المعطف', s4D({ st: 6, ac: 10, rc: 18, sp: 30, r: 56, dmg: 15 })],
    '34': ['نبضة الخريطة', s4P(13, 20, PZ.stompUp, PZ.pound, f => s4Wave(f, '#ff5a5a', { low: true, dmg: 15, r: 48 }))] },
  abd: { '13': ['رمية الصخرة', s4P(12, 20, PZ.windup, PZ.release, f => s4Wave(f, '#a0703c', { dmg: 16, r: 46, speed: 13 }))],
    '24': ['سلسلة القيد', s4D({ st: 8, ac: 12, rc: 20, sp: 26, r: 82, dmg: 15 })],
    '34': ['زلزال الصخر', s4P(15, 20, PZ.stompUp, PZ.pound, f => { s4Wave(f, '#ffb347', { low: true, dmg: 17, r: 52 }); F_shake(12); })] },
  exp: { '13': ['البصقة البنفسجية', s4P(8, 16, PZ.windup, PZ.release, f => s4Wave(f, '#b47aff', { dmg: 12, r: 34, speed: 21 }))],
    '24': ['الذراع المطاطية', s4D({ st: 7, ac: 13, rc: 18, sp: 22, r: 92, dmg: 14 })],
    '34': ['الزحف السام', s4D({ st: 9, ac: 12, rc: 20, sp: 24, r: 60, dmg: 13, lvl: 'low', pose: PZ.pound })] },
  bull: { '13': ['الفأس الطائر', s4P(12, 22, PZ.windup, PZ.release, f => s4Wave(f, '#c9a24a', { kind: 'axe', dmg: 17, r: 38, speed: 15, life: 60 }))],
    '24': ['إعصار الفأسين', s4D({ st: 10, ac: 14, rc: 22, sp: 18, r: 72, dmg: 18, pose: PZ.shoulder })],
    '34': ['هزة العملاق', s4P(16, 22, PZ.stompUp, PZ.pound, f => { s4Wave(f, '#2fb39a', { low: true, dmg: 18, r: 56 }); F_shake(16); })] },
  mech: { '13': ['شعاع الصدر', s4P(12, 20, PZ.windup, PZ.release, f => s4Wave(f, '#ff2a3a', { kind: 'beam', dmg: 15, r: 38, speed: 28 }))],
    '24': ['اندفاع الصاروخ', s4D({ st: 6, ac: 12, rc: 20, sp: 32, r: 60, dmg: 16, pose: PZ.shoulder })],
    '34': ['صاروخ أرضي', s4P(14, 20, PZ.stompUp, PZ.pound, f => s4Wave(f, '#ff8a40', { low: true, dmg: 16, r: 44, speed: 20 }))] },
  robot: { '13': ['عاصفة المراوح', s4P(12, 22, PZ.windup, PZ.release, f => s4Wave(f, '#54e0d0', { dmg: 13, r: 64, speed: 12 }))],
    '24': ['القبضة الصاروخية', s4P(10, 22, PZ.windup, PZ.release, f => s4Wave(f, '#e8eef0', { dmg: 17, r: 40, speed: 24 }))],
    '34': ['دعسة الحديد', s4P(15, 22, PZ.stompUp, PZ.pound, f => { s4Wave(f, '#9fe8ff', { low: true, dmg: 17, r: 54 }); F_shake(14); })] },
  diver: { '13': ['رمية اللؤلؤة', s4P(7, 16, PZ.windup, PZ.release, f => s4Wave(f, '#e8fbff', { dmg: 12, r: 28, speed: 25 }))],
    '14': ['غوصة خاطفة', s4Blink('#3cb4ff', 13)],
    '24': ['اندفاع الموج', s4D({ st: 5, ac: 11, rc: 17, sp: 33, r: 62, dmg: 14 })],
    '34': ['موجة القاع', s4P(12, 18, PZ.stompUp, PZ.pound, f => s4Wave(f, '#7fe0ff', { low: true, dmg: 14, r: 50, speed: 18 }))] },
  masks: { '13': ['القناع الطائر', s4P(7, 16, PZ.windup, PZ.release, f => s4Wave(f, '#ff3a4a', { kind: 'mask', dmg: 12, r: 32, speed: 19, life: 70 }))],
    '14': ['تبديل الأقنعة', s4Blink('#ff3a4a', 13, { st: 13 })],
    '24': ['خطوة المسرح', s4D({ st: 5, ac: 10, rc: 16, sp: 34, r: 58, dmg: 13 })],
    '34': ['الضحكة الأخيرة', s4P(11, 18, PZ.windup, PZ.release, f => s4Fan(f, 2, { col: '#ff3a4a', kind: 'mask', dmg: 8, r: 28, speed: 16, low: true }))] },
  echo: { '13': ['حلقة الصوت', s4P(7, 16, PZ.windup, PZ.release, f => s4Wave(f, '#7fffd4', { kind: 'sonic', dmg: 12, r: 56, speed: 17 }))],
    '14': ['خطوة الصدى', s4Blink('#7fffd4', 12, { st: 12 })],
    '24': ['اندفاع الهمس', s4D({ st: 4, ac: 10, rc: 16, sp: 36, r: 56, dmg: 12 })],
    '34': ['نبض الأرض', s4P(11, 18, PZ.stompUp, PZ.pound, f => s4Wave(f, '#7fffd4', { kind: 'sonic', low: true, dmg: 13, r: 52, speed: 16 }))] },
  prisoner: { '13': ['الكرة الحديدية', s4P(11, 20, PZ.windup, PZ.release, f => s4Wave(f, '#8a8a8a', { dmg: 16, r: 44, speed: 14 }))],
    '14': ['قفزة الزنزانة', s4Blink('#ff8a3a', 15, { st: 16 })],
    '24': ['جرّة السلسلة', s4D({ st: 6, ac: 13, rc: 19, sp: 30, r: 100, dmg: 15 })],
    '34': ['دعسة السجين', s4P(14, 20, PZ.stompUp, PZ.pound, f => { s4Wave(f, '#ff8a3a', { low: true, dmg: 16, r: 54 }); F_shake(12); })] },
  warden: { '13': ['الصاعق', s4P(8, 16, PZ.windup, PZ.release, f => s4Wave(f, '#4da3ff', { kind: 'zap', dmg: 12, r: 40, speed: 26 }))],
    '14': ['نداء اللاسلكي', s4Blink('#4da3ff', 13)],
    '24': ['ضربة الهراوة', s4D({ st: 5, ac: 11, rc: 17, sp: 32, r: 64, dmg: 14 })],
    '34': ['سلسلة المفاتيح', s4P(11, 18, PZ.windup, PZ.release, f => s4Wave(f, '#ffd34d', { low: true, dmg: 13, r: 34, speed: 20 }))] },
  dfarmer: { '13': ['بذرة العتمة', s4P(9, 18, PZ.windup, PZ.release, f => s4Wave(f, '#9b3cff', { kind: 'dark', dmg: 14, r: 40, speed: 18 }))],
    '14': ['خطوة الحقل المظلم', s4Blink('#9b3cff', 14)],
    '24': ['اندفاع المنجل', s4D({ st: 6, ac: 12, rc: 18, sp: 30, r: 80, dmg: 15 })],
    '34': ['جذور الظلام', s4P(13, 20, PZ.stompUp, PZ.pound, f => { s4Wave(f, '#9b3cff', { kind: 'dark', low: true, dmg: 15, r: 52 }); F_shake(10); })] },
  dbaba: { '13': ['بطاطس العتمة', s4P(8, 18, PZ.windup, PZ.release, f => s4Fan(f, 2, { col: '#c22cff', kind: 'dark', dmg: 10, r: 36, speed: 18 }))],
    '14': ['خطوة العتمة', s4Blink('#c22cff', 15, { st: 13 })],
    '24': ['هوز الظلام', s4D({ st: 5, ac: 12, rc: 18, sp: 32, r: 96, dmg: 16 })],
    '34': ['موجة الهاوية', s4P(12, 20, PZ.stompUp, PZ.pound, f => { s4Wave(f, '#c22cff', { kind: 'dark', low: true, dmg: 16, r: 58, speed: 17 }); F_shake(12); })] },
};
for (const key in S4_MOVES) { for (const k in S4_MOVES[key]) { const mv = S4_MOVES[key][k][1]; if (mv.dmg) mv.dmg = Math.round(mv.dmg * 1.0); } Object.assign(COMBOS[S4[key]], S4_MOVES[key]); }

function installS4() { for (const [key, base] of S4_FORMS) { const ci = S4[key]; PERSONA[ci] = PERSONA[base]; FIN[ci] = FIN[base]; } }

// story-fight hazards: the blue beetle charges along the floor, the copper falcon dives from the sky
function s4Hazard(F, kind) {
  if (F.phase !== 'fight' || F.fin) return;
  F.s4T = (F.s4T || 150) - 1; if (F.s4T > 0) return; F.s4T = 330 + ((Math.random() * 160) | 0);
  const me = F.f[0], op = F.f[1], from = Math.random() < 0.5 ? -1 : 1, x0 = clamp(me.x - from * 760, -STAGE - 200, STAGE + 200);
  if (kind === 'beetle') {
    SFX.rock(); F.banner = { t: '🪲 قرناس — الخنفساء الآلية تهجم!', ar: true, dur: 60, k: 0 };
    spawnProj({ kind: 's4beetle', owner: op, x: x0, y: -60, vx: from * 12, vy: 0, g: 0, r: 62, life: 140, big: 1, draw(p) {
      const im = IMG.s4_beetle; if (!im) return; const w = 230, h = im.height * w / im.width; ctx.save(); ctx.translate(p.x, p.y + 60 - h / 2 + Math.abs(Math.sin(p.life * 0.5)) * -4);
      if (p.vx < 0) ctx.scale(-1, 1); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); },
      m: { dmg: 9, lvl: 'low', hs: 18, bs: 10, push: 50, stop: 6, p: 1.2, kd: 1 } });
  } else {
    SFX.whoosh(1); F.banner = { t: '🦅 صقر النحاس ينقضّ!', ar: true, dur: 60, k: 0 };
    spawnProj({ kind: 's4falcon', owner: op, x: x0, y: -620, vx: from * 11, vy: 7.5, g: 0, r: 56, life: 120, big: 1, draw(p) {
      const im = IMG.s4_falcon; if (!im) return; const w = 300, h = im.height * w / im.width; ctx.save(); ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, Math.abs(p.vx)) * 0.4 * Math.sign(p.vx)); if (p.vx < 0) ctx.scale(-1, 1); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); },
      m: { dmg: 8, lvl: 'high', hs: 18, bs: 10, push: 30, stop: 6, p: 1.2, kd: 0 } });
  }
}

function saga4Assets() {
  for (const [key] of S4_FORMS) {
    const id = S4[key] + 1, R = S4_RIG[key];
    if (!R || !IMG['s4_' + key + '_torso']) { const b = CHARS[S4[key]].s4base + 1; RIG[id] = RIG[b]; for (const p of PARTS) IMG['c' + id + '_' + p] = IMG['c' + b + '_' + p]; for (const k of ['front', 'vs', 'face']) IMG[k + id] = IMG[k + b]; continue; }
    RIG[id] = R;
    for (const p of PARTS) IMG['c' + id + '_' + p] = IMG['s4_' + key + '_' + p];
    for (const k of ['front', 'vs', 'face']) IMG[k + id] = IMG['s4_' + key + '_' + k];
  }
}

// قوة الظلام: لما تنزل صحته للنص، ينفجر الظلام فيه (أسرع وأقوى)
function s4DarkPhase(F) { if (F.phase !== 'fight' || F.fin) return; const op = F.f[1]; if (!op.C.dark || F.s4dk || op.hp > op.maxHp * 0.5) return;
  F.s4dk = 1; F_shake(24); SFX.rage(); op.flash = 12; op.dmgMul = (op.dmgMul || 1) * (op.C.dark === 2 ? 1.18 : 1.1); op.bossCD = 20;
  finRing(op.x, -200, '#b030ff', 420, 26); finBurst(op.x, -200, 50, VOIDC, 12, 8); s4Rain(op, '#b030ff', op.C.dark === 2 ? 6 : 4, 8, 'dark');
  F.banner = { text: op.C.dark === 2 ? '🌑 طاقة الظلام تنفجر في بابا الوه!' : '🌑 الظلام يغلي في المزارع!', ar: true, t: 0, dur: 80 };
  const pad = F.pads[1]; if (pad) pad.lvl = (pad.lvl || 3) + 0.6; }
