// القصة ٤ — أشكال جديدة من رسومات المستخدم (شخصيات القصة فقط)
// [key, base (moves/voice), name, h, hp, dmg, color]
const S4_FORMS = [
  ['moalem', 6, 'المعلّم', 0.97, 1.18, 1.12, '#d4a640'],
  ['abd', 12, 'العبد', 0.98, 1.2, 1.12, '#ffb347'],
  ['exp', 0, 'التجربة صفر', 1.04, 1.1, 1.08, '#b47aff'],
  ['bull', 5, 'البلدوزر', 1.06, 1.35, 1.15, '#2fb39a'],
  ['mech', CODER, 'البدلة الآلية', 1.0, 1.4, 1.2, '#ff2a3a'],
  ['robot', 5, 'الحارس الآلي', 1.02, 1.45, 1.15, '#54e0d0'],
];
const S4 = {};
for (const [key, base, name, h, hp, dmg, color] of S4_FORMS) {
  S4[key] = CHARS.length;
  CHARS.push({ ...CHARS[base], name, h, hp, dmg, color, hidden: 1, s4: key, s4base: base, props: null, malali: 0, nasser: 0, hamad: 0 });
}
const S4_MOALEM = S4.moalem, S4_ABD = S4.abd, S4_EXP = S4.exp, S4_BULL = S4.bull, S4_MECH = S4.mech, S4_ROBOT = S4.robot;
const S4_VOICE = { moalem: 'c6', abd: 'c12', exp: 'c26', bull: 'c5', mech: 'c19', robot: 'c27' };

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
    } else {
      const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.r * 1.35); g.addColorStop(0, '#fff8f0'); g.addColorStop(0.4, p.col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * 1.3, p.r, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
  }, m: { dmg, lvl: low ? 'low' : 'mid', hs: 22, bs: 14, push: 38, stop: 8, p: 1.45, kd: 1 } });
}
MV.sk_s4_net = projMove(12, 22, PZ.windup, PZ.release, f => s4Wave(f, '#ff2a3a', { kind: 'grid', dmg: 19, r: 60, speed: 14 }), { skill: 1 });
MV.sk_s4_rock = projMove(15, 22, PZ.stompUp, PZ.pound, f => { s4Wave(f, '#ffb347', { low: true, dmg: 21, r: 52 }); F_shake(16); }, { skill: 1 });
MV.sk_s4_lash = dashMove({ st: 9, ac: 11, rc: 20, sp: 24, trail: 1, limb: 'fH', r: 70, dmg: 18, kd: 1, pose: PZ.punch, skill: 1 });
MV.sk_s4_axe = projMove(13, 22, PZ.windup, PZ.release, f => s4Wave(f, '#c9a24a', { kind: 'axe', dmg: 20, r: 40, speed: 15, life: 60 }), { skill: 1 });
MV.sk_s4_laser = projMove(14, 24, PZ.windup, PZ.release, f => s4Wave(f, '#ff2a3a', { kind: 'beam', dmg: 21, r: 42, speed: 26 }), { skill: 1 });
MV.sk_s4_jet = dashMove({ st: 10, ac: 13, rc: 22, sp: 21, trail: 1, limb: 'fH', r: 64, dmg: 20, kd: 1, pose: PZ.shoulder, skill: 1 });
function F_shake(n) { try { G.fight && G.fight.shake(n); } catch (e) { } }
const S4_SKILLS = { moalem: ['sk_s4_net', 'شبكة المعلم'], abd: ['sk_s4_rock', 'قبضة الصخر'], exp: ['sk_s4_lash', 'الذراع الطويلة'],
  bull: ['sk_s4_axe', 'الفأس الدوّار'], mech: ['sk_s4_laser', 'ليزر البدلة'], robot: ['sk_s4_jet', 'اندفاع النفاثات'] };
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
};
for (const key in S4_MOVES) Object.assign(COMBOS[S4[key]], S4_MOVES[key]);

function installS4() { for (const [key, base] of S4_FORMS) { const ci = S4[key]; PERSONA[ci] = PERSONA[base]; FIN[ci] = FIN[base]; } }

// story-fight hazards: the blue beetle charges along the floor, the copper falcon dives from the sky
function s4Hazard(F, kind) {
  if (F.phase !== 'fight' || F.fin) return;
  F.s4T = (F.s4T || 150) - 1; if (F.s4T > 0) return; F.s4T = 330 + ((Math.random() * 160) | 0);
  const me = F.f[0], op = F.f[1], from = Math.random() < 0.5 ? -1 : 1, x0 = clamp(me.x - from * 760, -STAGE - 200, STAGE + 200);
  if (kind === 'beetle') {
    SFX.rock(); F.banner = { t: '🪲 الخنفساء الآلية تهجم!', ar: true, dur: 60, k: 0 };
    spawnProj({ kind: 's4beetle', owner: op, x: x0, y: -60, vx: from * 12, vy: 0, g: 0, r: 62, life: 140, big: 1, draw(p) {
      const im = IMG.s4_beetle; if (!im) return; const w = 230, h = im.height * w / im.width; ctx.save(); ctx.translate(p.x, p.y + 60 - h / 2 + Math.abs(Math.sin(p.life * 0.5)) * -4);
      if (p.vx < 0) ctx.scale(-1, 1); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); },
      m: { dmg: 9, lvl: 'low', hs: 18, bs: 10, push: 50, stop: 6, p: 1.2, kd: 1 } });
  } else {
    SFX.whoosh(1); F.banner = { t: '🦅 الصقر الآلي ينقضّ!', ar: true, dur: 60, k: 0 };
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
