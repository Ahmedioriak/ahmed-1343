// This fighter is appended so the existing character and saved outfit IDs stay stable.
const BABA = CHARS.length;
CHARS.push({ name: 'بابا الوه', en: 'BABA ALWAH', h: 0.96, tag: 'هوز وبطاطس', hp: 1.02,
  dmg: 1.03, spd: 1.01, color: '#59d8b4', stats: [4, 4, 4],
  quote: 'الهوز جاهز… والبطاطس حارة!', props: babaProps });
MOVE_AR.baba_lash = 'ضربة الهوز';

const BABA_WIND = { ua: 157, fa: 102, lean: -17, th: 23, bth: -25 };
const BABA_LASH = { ua: 86, fa: 8, lean: 24, dx: 20, th: 37, bth: -33 };
const BABA_COLORS = ['#63dfd6', '#e1ffff', '#ffcd65', '#e69b46'];
function babaHose(f) {
  const fin = f.state === 'rageSeq' && G.fight && G.fight.fin;
  const m = f.state === 'attack' && f.mv;
  const t = fin ? fin.t : f.mt;
  const active = fin ? (t >= 14 && t < 46) || t >= 77 : m && m.hose && t >= m.st - 3 && t < m.st + m.ac + 10;
  if (!active) return null;
  const hand = f.toWorld(f.J.fH);
  const reach = fin ? (t >= 77 ? 210 : 143) : m.hose;
  const bend = fin ? Math.cos(t * 0.35) : Math.cos((t - m.st) * 0.3);
  const low = m && m.lvl === 'low';
  const dir = f.facing;
  return {
    hand,
    c1: [hand[0] + dir * 52, hand[1] - 40 * bend],
    c2: [hand[0] + dir * reach * 0.76, hand[1] + 58 * bend],
    tip: [hand[0] + dir * reach, hand[1] + (low ? 68 : 18 * bend)],
  };
}
function babaProps(f, front) {
  if (!front || !f.J) return;
  const hose = babaHose(f);
  if (hose) {
    const { hand, c1, c2, tip } = hose;
    ctx.save(); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...hand); ctx.bezierCurveTo(...c1, ...c2, ...tip);
    ctx.lineWidth = 13; ctx.strokeStyle = '#122b27'; ctx.stroke();
    ctx.lineWidth = 8; ctx.strokeStyle = '#369371'; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#8bd6ac'; ctx.stroke();
    ctx.fillStyle = '#d8b471'; ctx.beginPath(); ctx.arc(...tip, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (f.state === 'attack' && f.mv && f.mv.potato && f.mt < f.mv.st) {
    const w = f.toWorld(f.J.fH); drawPotato(w[0], w[1] - 12, -0.15, 17);
  }
}
function drawPotato(x, y, angle, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 1, 0, 0, r * 1.25);
  g.addColorStop(0, '#ffdd93'); g.addColorStop(0.6, '#b97a40'); g.addColorStop(1, '#643718');
  ctx.fillStyle = g; ctx.strokeStyle = '#754825'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-r, r * 0.16);
  ctx.bezierCurveTo(-r * 1.08, -r * 0.8, -r * 0.3, -r * 0.98, r * 0.23, -r * 0.72);
  ctx.bezierCurveTo(r * 1.32, -r * 0.64, r * 1.2, r * 0.66, r * 0.44, r * 0.79);
  ctx.quadraticCurveTo(-r * 0.67, r * 1.03, -r, r * 0.16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#774b2c';
  for (const [px, py] of [[-0.46, -0.18], [0.08, 0.27], [0.48, -0.28], [0.53, 0.38]]) {
    ctx.beginPath(); ctx.ellipse(px * r, py * r, r * 0.1, r * 0.05, 0.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function drawHoseSpray(p) {
  ctx.save();
  const fade = Math.min(1, p.life / 12), dir = p.dir;
  ctx.globalAlpha *= fade;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const y = p.y + (i - 3.5) * 9 + Math.sin(i + p.t * 0.65) * 9;
    const x = p.x - (i % 3) * dir * 18;
    ctx.strokeStyle = i % 2 ? '#62e0ed' : '#d6ffff';
    ctx.lineWidth = 3 + i % 4;
    ctx.beginPath(); ctx.moveTo(x - dir * 85, y + 8);
    ctx.quadraticCurveTo(x - dir * 30, y - 16, x + dir * 18, y); ctx.stroke();
  }
  ctx.restore();
}
function babaLash(st, ac, rc, reach, options) {
  return M({ st, ac, rc, hose: reach, r: 38, dmg: 13, p: 1.25, ...options,
    hitboxFn(f) {
      if (!f.active()) return null;
      const { c2, tip } = babaHose(f);
      return { x: tip[0], y: tip[1], x2: c2[0], y2: c2[1], ar: f.mv.r * 0.56, r: f.mv.r };
    },
    kf: [[0, {}], [st - 5, BABA_WIND], [st, BABA_LASH], [st + ac, {}], [st + ac + rc, null]],
  });
}
function babaThrow(f, options) {
  SFX.throw();
  shoot(f, { kind: 'babaPotato', sp: 16, ang: -0.12, g: 0.21, r: 19,
    dmg: 9, vr: 0.27, life: 75, ...options });
}
MV.baba_lash = babaLash(11, 4, 16, 96, { combo: 0 });
MV.sk_baba_water = projMove(17, 23, BABA_WIND, BABA_LASH, f => {
  const { tip } = babaHose(f);
  SFX.splash();
  spawnProj({ kind: 'babaSpray', owner: f, x: tip[0], y: tip[1], vx: f.facing * 19,
    vy: 0, r: 42, life: 28, m: { dmg: 20, lvl: 'mid', hs: 0, bs: 17, push: 56, stop: 10, p: 1.5, kd: 1 } });
}, { skill: 1, hose: 78 });
MV.sk2_baba_potato = projMove(13, 22, PZ.windup, PZ.release, f => {
  babaThrow(f, { ang: -0.27, dmg: 7 });
}, { skill: 1, sk2: 1, potato: 1, onStep(f) {
  if (f.mt === 20) babaThrow(f, { ang: 0.04, dmg: 8, sp: 19 });
} });
SKILL_IDS[BABA] = 'sk_baba_water'; SKILL_NAMES[BABA] = 'اندفاع الماي';
SKILL2[BABA] = 'sk2_baba_potato'; SKILL2_NAMES[BABA] = 'وابل البطاطس';
SKILL2_LINE[BABA] = 'خذ هالبطاطس!';
COMBOS[BABA] = {
  '12': ['لسعة الهوز', babaLash(12, 5, 20, 143, { dmg: 16, kd: 1 })],
  '13': ['بطاطس من فوق', projMove(15, 24, PZ.summon, PZ.release, f => {
    babaThrow(f, { from: 'sky', r: 33, vy: 8, g: 0.66, dmg: 16, kd: 1 });
  })],
  '14': ['كنسة الهوز', babaLash(15, 5, 22, 114, { base: 'CROUCH', lvl: 'low', dmg: 13, kd: 1 })],
  '23': ['رمية البطاطس', projMove(10, 19, PZ.windup, PZ.release, f => babaThrow(f), { potato: 1 })],
  '24': ['بطاطس ترتد', projMove(12, 22, PZ.windup, PZ.release, f => {
    babaThrow(f, { sp: 13, ang: 0.42, g: 0.68, r: 24, bounce: 0.78, dmg: 12, lvl: 'low' });
  }, { potato: 1 })],
  '34': ['لفّة الهوز', babaLash(17, 6, 23, 129, { dmg: 17, push: 46, launch: 1, track: 1, mvx: [[5, 17, 5]] })],
};

function babaFinisher(F, a, d, t) {
  const dir = a.facing;
  if (t === 1) F.fin.babaTarget = clamp(a.x + dir * 230, -STAGE + 55, STAGE - 55);
  if (t < 92) finHold(d, F.fin.babaTarget);
  finCam(F, (a.x + d.x) / 2, -225, t < 77 ? 1.13 : 1.23);
  if (t < 45) {
    const snap = finExt(Math.max(0, t - 4), 20);
    a.rageP = G2({ ...BABA_WIND, ua: lerp(155, 79, snap), fa: lerp(104, 4, snap), lean: lerp(-12, 23, snap) });
    d.finP = FPZ.hurt({ lean: 16 * snap });
    if (t === 14 || t === 34) {
      const c = finChest(d); finHit(F, a, d, 5, c, 4); SFX.whoosh(1); F.shake(10);
      finBurst(c[0], c[1], 12, BABA_COLORS, 7, 4);
    }
  } else if (t < 77) {
    a.rageP = G2(t < 51 ? PZ.windup : PZ.release);
    d.finP = FPZ.hurt({ lean: 12 });
    if (t === 51 || t === 59) {
      SFX.throw();
      finThrow(F, a, d, { kind: 'babaPotato', from: a.toWorld(a.J.fH), to: finChest(d),
        T: 12, g: 0.5, r: 23, vr: dir * 0.28, dmg: 5, fr: 3,
        fx: ([x, y]) => finBurst(x, y, 14, BABA_COLORS, 6, 5) });
    }
  } else {
    a.rageP = G2(t < 89 ? BABA_WIND : BABA_LASH);
    if (t === 92) {
      const c = finChest(d), { tip } = babaHose(a);
      spawnProj({ kind: 'babaSpray', noHit: true, owner: a, x: tip[0], y: tip[1],
        vx: dir * 22, vy: 0, r: 56, life: 18 });
      finHit(F, a, d, 25, c, 13, true); finLaunch(d, dir * 15, -18);
      SFX.splash(); F.shake(30);
      finRing(c[0], c[1], '#b4fcff', 225, 21);
      finBurst(c[0], c[1], 36, BABA_COLORS, 13, 6);
    }
  }
  return t >= 119;
}
