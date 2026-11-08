const FARMER = CHARS.length;
CHARS.push({ name: 'المزارع', en: 'THE FARMER', h: 0.99, tag: 'من الحقل إلى الحلبة',
  hp: 1.06, dmg: 1.03, spd: 0.99, color: '#9cdb57', stats: [4, 3, 4],
  quote: 'اليوم يوم الحصاد!', props: farmProps });

const FARM_COLORS = ['#8ec74a', '#f1a13b', '#ffcc65', '#99613c'];
const FARM_WIND = { ua: 150, fa: 74, lean: -12, th: 27, bth: -24 };
const FARM_SWING = { ua: 84, fa: 2, lean: 21, dx: 12, th: 34, bth: -29 };
const FARM_PUSH = { ua: 89, fa: 9, bua: 83, bfa: 18, lean: 27, dx: 10, th: 36, bth: -33 };

function farmHoeLine(f) { return armLine(f, false, 152, 0.09); }
function farmProps(f, front) {
  if (!front || !f.J) return;
  const m = f.state === 'attack' && f.mv;
  const fin = f.state === 'rageSeq' && G.fight && G.fight.fin;
  if ((m && m.hoe && f.mt >= 4 && f.mt < m.st + m.ac + 8) || (fin && fin.t >= 6 && fin.t < 25)) {
    const { g, tip, ang } = farmHoeLine(f);
    const L = Math.hypot(tip[0] - g[0], tip[1] - g[1]);
    ctx.save(); ctx.translate(...g); ctx.rotate(ang); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L, 0);
    ctx.strokeStyle = '#462919'; ctx.lineWidth = 11; ctx.stroke();
    ctx.strokeStyle = '#c38a50'; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = '#9ba6ae'; ctx.strokeStyle = '#323c43'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(L - 8, -5); ctx.lineTo(L + 7, -5);
    ctx.lineTo(L + 19, 22); ctx.lineTo(L - 12, 24); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  if (m && m.heldCrop && f.mt >= 4 && f.mt < m.st) {
    const [x, y] = f.toWorld(f.J.fH);
    drawFarmProjectile({ kind: m.heldCrop, x, y: y - 11, r: 18, rot: -0.35 });
  }
}

function drawFarmProjectile(p) {
  ctx.save(); ctx.translate(p.x, p.y);
  if (p.kind === 'farm_cart') {
    ctx.scale(p.dir, 1);
    ctx.strokeStyle = '#604331'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-p.r * 1.5, -8); ctx.lineTo(p.r * 0.72, p.r * 0.65); ctx.stroke();
    ctx.fillStyle = '#292923'; ctx.beginPath(); ctx.arc(p.r * 0.65, p.r * 0.64, p.r * 0.43, 0, 7); ctx.fill();
    ctx.strokeStyle = '#b89c75'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.r * 0.65, p.r * 0.64, p.r * 0.25, 0, 7); ctx.stroke();
    ctx.fillStyle = '#639443'; ctx.strokeStyle = '#314832'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-p.r, -p.r * 0.5); ctx.lineTo(p.r * 1.05, -p.r * 0.55);
    ctx.lineTo(p.r * 0.65, p.r * 0.28); ctx.lineTo(-p.r * 0.62, p.r * 0.28);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const [x, y, kind] of [[-0.56, -0.56, 'farm_cabbage'], [0, -0.72, 'farm_carrot'], [0.49, -0.56, 'farm_pumpkin']]) {
      drawFarmProjectile({ kind, x: x * p.r, y: y * p.r, r: p.r * 0.28, rot: x });
    }
  } else {
    ctx.rotate(p.rot);
    const r = p.r;
    const pumpkin = p.kind === 'farm_pumpkin', carrot = p.kind === 'farm_carrot';
    const shade = ctx.createRadialGradient(-r * 0.35, -r * 0.45, 1, 0, 0, r * 1.2);
    shade.addColorStop(0, carrot || pumpkin ? '#ffcf68' : '#d9ed86');
    shade.addColorStop(0.55, carrot || pumpkin ? '#ef8e31' : '#79ac48');
    shade.addColorStop(1, carrot || pumpkin ? '#9c411a' : '#355e34');
    ctx.fillStyle = shade;
    if (carrot) {
      ctx.beginPath(); ctx.moveTo(-r * 0.37, -r * 0.68);
      ctx.quadraticCurveTo(0, -r, r * 0.42, -r * 0.62);
      ctx.quadraticCurveTo(r * 0.44, 0, -r * 0.12, r * 1.17);
      ctx.quadraticCurveTo(-r * 0.42, 0, -r * 0.37, -r * 0.68);
      ctx.fill();
    } else {
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.8, 0, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = pumpkin ? '#a55024' : carrot ? '#ad5527' : '#527f40';
    ctx.lineWidth = Math.max(1.5, r * 0.075);
    for (const i of [-1, 0, 1]) {
      ctx.beginPath();
      if (carrot) {
        const y = i * r * 0.33;
        ctx.moveTo(-r * 0.28, y); ctx.quadraticCurveTo(0, y + 4, r * 0.19, y - 2);
      } else {
        ctx.moveTo(i * r * 0.35, -r * 0.7);
        ctx.quadraticCurveTo(i * r * 0.75, 0, i * r * 0.26, r * 0.66);
      }
      ctx.stroke();
    }
    if (pumpkin || carrot) {
      ctx.strokeStyle = '#5d8e37'; ctx.lineCap = 'round'; ctx.lineWidth = r * 0.18;
      ctx.beginPath(); ctx.moveTo(0, -r * 0.68); ctx.lineTo(r * 0.13, -r * 1.06);
      if (carrot) { ctx.moveTo(0, -r * 0.73); ctx.lineTo(-r * 0.37, -r * 1.06); }
      ctx.stroke();
    }
  }
  ctx.restore();
}

function farmHoe(st, ac, rc, options) {
  return M({ st, ac, rc, hoe: 1, r: 29, dmg: 13, ...options,
    hitboxFn(f) {
      if (!f.active()) return null;
      const { g, tip } = farmHoeLine(f);
      return { x: tip[0], y: tip[1], x2: lerp(g[0], tip[0], 0.46),
        y2: lerp(g[1], tip[1], 0.46), r: f.mv.r, ar: f.mv.r * 0.63 };
    },
    kf: [[0, {}], [st - 5, FARM_WIND], [st, FARM_SWING], [st + ac, {}], [st + ac + rc, null]],
  });
}
function farmThrow(f, kind, options) {
  SFX.throw();
  shoot(f, { kind, sp: 17, ang: -0.15, g: 0.24, r: 21, dmg: 9, vr: 0.2, life: 75, ...options });
}
function farmCrop(st, rc, kind, options) {
  return projMove(st, rc, PZ.windup, PZ.release, f => farmThrow(f, kind, options), { heldCrop: kind });
}
MV.farm_hoe = farmHoe(12, 4, 18, { combo: 0 });
MOVE_AR.farm_hoe = 'ضربة المعول';
MV.sk_farm_cart = projMove(18, 24, { ua: 44, fa: 100, lean: 14 }, FARM_PUSH, f => {
  SFX.rattle(); dust(f.x + f.facing * 80, 9);
  shoot(f, { kind: 'farm_cart', from: 'ground', gx: 115, ground: 1, r: 56, sp: 15,
    dmg: 20, kd: 1, push: 55, stop: 10, life: 51, vr: 0 });
}, { skill: 1 });
MV.sk2_farm_crops = projMove(12, 26, PZ.windup, PZ.release, f => {
  farmThrow(f, 'farm_carrot', { ang: -0.16, sp: 22, dmg: 7 });
}, { skill: 1, sk2: 1, heldCrop: 'farm_carrot', onStep(f) {
  if (f.mt === 20) farmThrow(f, 'farm_cabbage', { ang: -0.04, sp: 20, dmg: 9, r: 27 });
} });
SKILL_IDS[FARMER] = 'sk_farm_cart'; SKILL_NAMES[FARMER] = 'عربة الحصاد';
SKILL2[FARMER] = 'sk2_farm_crops'; SKILL2_NAMES[FARMER] = 'وابل الخضروات';
SKILL2_LINE[FARMER] = 'خذ من محصول اليوم!';
COMBOS[FARMER] = {
  '12': ['شقّ التربة', farmHoe(17, 6, 23, { dmg: 17, kd: 1, r: 36, mvx: [[6, 17, 5]] })],
  '13': ['جزرة طايرة', farmCrop(10, 17, 'farm_carrot', { sp: 24, dmg: 10, ang: 0, g: 0 })],
  '14': ['كنسة المعول', farmHoe(15, 5, 20, { base: 'CROUCH', lvl: 'low', dmg: 13, push: 44, r: 38 })],
  '23': ['ملفوفة ترتد', farmCrop(13, 22, 'farm_cabbage', { sp: 12, ang: 0.37, r: 27, g: 0.57, bounce: 0.8, dmg: 13, lvl: 'low' })],
  '24': ['يقطينة من فوق', projMove(16, 24, PZ.summon, PZ.release, f => {
    farmThrow(f, 'farm_pumpkin', { from: 'sky', vy: 10, g: 0.7, r: 41, dmg: 18, kd: 1 });
  })],
  '34': ['رفسة الحقل', M({ ...MV.fkick, dmg: 17, push: 62, kd: 1, combo: 1 })],
};

function farmFinisher(F, a, d, t) {
  const dir = a.facing;
  if (t === 1) F.fin.farmTarget = clamp(a.x + dir * 220, -STAGE + 55, STAGE - 55);
  if (t < 87) finHold(d, F.fin.farmTarget);
  finCam(F, (a.x + d.x) / 2, -220, t < 60 ? 1.13 : 1.22);
  if (t < 25) {
    a.rageP = G2(t < 12 ? FARM_WIND : FARM_SWING);
    d.finP = FPZ.hurt({ lean: t < 15 ? -6 : 20 });
    if (t === 15) {
      const c = finChest(d); finHit(F, a, d, 9, c, 5); SFX.thud(); dust(d.x, 18);
      finBurst(...c, 16, FARM_COLORS, 9, 5); F.shake(12);
    }
  } else if (t < 59) {
    a.rageP = G2(t < 31 || (t >= 39 && t < 46) ? PZ.windup : PZ.release);
    if (t === 31 || t === 46) {
      SFX.throw();
      finThrow(F, a, d, { kind: t === 31 ? 'farm_carrot' : 'farm_cabbage',
        from: a.toWorld(a.J.fH), to: finChest(d), T: 11, r: 23, vr: dir * 0.22, dmg: 6,
        fx: ([x, y]) => finBurst(x, y, 12, FARM_COLORS, 8, 5) });
    }
  } else {
    a.rageP = G2(t < 84 ? FPZ.armsUp : FPZ.slam);
    if (t === 63) {
      const [x, y] = finChest(d);
      finThrow(F, a, d, { kind: 'farm_pumpkin', from: [x, -800], to: [x, y], T: 24, g: 1.1, r: 103, vr: 0.03 });
    }
    if (t === 87) {
      const c = finChest(d);
      finHit(F, a, d, 28, c, 15, true); finLaunch(d, dir * 14, -19);
      finRing(c[0], c[1], '#ffba58', 230, 24); finBurst(...c, 44, FARM_COLORS, 14, 7);
      SFX.rock(); dust(d.x, 22); F.shake(32);
    }
  }
  return t >= 116;
}
