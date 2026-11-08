const FORT_ROOKIE = CHARS.length;
const FORT_ARMOR = FORT_ROOKIE + 1, FORT_MASTER = FORT_ROOKIE + 2;
const FORT_PREDATOR = FORT_ROOKIE + 3, FORT_NASSER = FORT_ROOKIE + 4;
const FORT_COLORS = ['#46b6ff', '#e3f5ff', '#ffcf66', '#fff1b8'];
const FORT_NAMES = ['المقاتل المبتدئ', 'فارس الدرع', 'سيد الحصون', 'المفترس الأسطوري'];

for (const [i, hp, dmg, color] of [[0, 1, 0.98, '#a2c7ff'], [1, 1.1, 1.02, '#659cf4'],
  [2, 1.19, 1.08, '#64c7ff'], [3, 1.24, 1.23, '#ffd36e']]) {
  CHARS.push({ ...CHARS[CHEF], name: 'الطباخ — ' + FORT_NAMES[i], hp, dmg, color,
    fortress: i + 1, hidden: 1, props: i >= 2 ? fortressProps : null });
}
CHARS.push({ ...CHARS[NASSER], name: 'ناصر — الإعدام الأسود', color: '#bf85ff',
  fortressDark: true, hidden: 1, props: fortressProps });

function fortressProps(f, front) {
  if (f.C.fortressDark) nasserProps(f, front);
  if (front || f.hp <= 0) return;
  const x = f.x, y = f.hipY - 64, r = 138 + Math.sin(G.frame * 0.13) * 11;
  const gr = ctx.createRadialGradient(x, y, 20, x, y, r);
  gr.addColorStop(0, f.C.fortressDark ? 'rgba(147,48,255,0.38)' : 'rgba(57,155,255,0.28)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  if (f.C.fortress === 4) {
    const gold = ctx.createRadialGradient(x + 28, y, 14, x + 28, y, r);
    gold.addColorStop(0, 'rgba(255,200,76,0.35)'); gold.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gold; ctx.fillRect(x - r + 28, y - r, r * 2, r * 2);
  }
}
function fortressWave(f, color, options = {}) {
  const [hx, hy] = f.toWorld(f.J.fH);
  const { dmg = 17, speed = 18, r = 48, low = false } = options;
  const x = low ? f.x + f.facing * 85 : hx + f.facing * 25;
  const y = low ? -r : Math.max(-210, Math.min(-95, hy));
  SFX.zap(); finRing(x, y, color, r * 1.8, 16);
  spawnProj({ kind: 'fortressEnergy', owner: f, x, y, vx: speed * f.facing, vy: 0, r,
    life: 48, col: color, wide: true, draw(p) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.r * 1.35);
      g.addColorStop(0, '#f9f2ff'); g.addColorStop(0.4, p.col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * 1.32, p.r, 0, 0, 7); ctx.fill();
      ctx.restore();
    }, m: { dmg, lvl: low ? 'low' : 'mid', hs: 22, bs: 14, push: 38, stop: 8, p: 1.45, kd: 1 },
  });
}
function fortressGuard(f) {
  f.fortGuard = f.C.fortress === 2 ? 120 : 155;
  finRing(f.x, f.hipY - 100, '#64c7ff', 175, 20); SFX.block();
}
function fortressBurst(f) {
  const charge = f.fortCharge || 0;
  f.fortCharge = 0;
  fortressWave(f, '#64c7ff', { dmg: 9 + charge, speed: 12, r: 61 });
}
const FORT_GUARD_POSE = { ua: 81, fa: 124, bua: 71, bfa: 128, lean: -6, th: 24, bth: -21 };
MV.sk_fortress_guard = projMove(8, 17, GUARD, FORT_GUARD_POSE, fortressGuard, { skill: 1 });
MV.sk2_fortress_burst = projMove(12, 20, FORT_GUARD_POSE, PZ.release, fortressBurst, { skill: 1, sk2: 1 });
MV.sk_fortress_hunt = projMove(13, 21, PZ.windup, PZ.release, f => fortressWave(f, '#4ebfff', { dmg: 20 }), { skill: 1 });
MV.sk_fortress_black = projMove(19, 27, BATUP, BATHIT, f => fortressWave(f, '#833bff', { dmg: 21, r: 66 }), { skill: 1, bat: 1 });
MV.sk_fortress_eternal = projMove(14, 25, PZ.windup, PZ.release, f => fortressWave(f, '#ffc565', { dmg: 25, r: 70, speed: 22 }), { skill: 1 });
Object.assign(BOSS_NAMES, { sk_fortress_black: 'الإعدام الأسود', sk_fortress_eternal: 'الإعدام الأسود الأبدي' });
BOSS_LINES.sk_fortress_black = 'شوف الإعدام الأسود!';

function fortressCopyCombos(ci) {
  return Object.fromEntries(Object.entries(COMBOS[ci]).map(([key, [name, move]]) => [key, [name, { ...move }]]));
}
for (const ci of [FORT_ROOKIE, FORT_ARMOR, FORT_MASTER, FORT_PREDATOR, FORT_NASSER]) {
  const source = ci === FORT_NASSER ? NASSER : 12;
  COMBOS[ci] = fortressCopyCombos(source);
  SKILL_IDS[ci] = SKILL_IDS[source]; SKILL_NAMES[ci] = SKILL_NAMES[source];
  SKILL2[ci] = SKILL2[source]; SKILL2_NAMES[ci] = SKILL2_NAMES[source]; SKILL2_LINE[ci] = SKILL2_LINE[source];
}
for (const ci of [FORT_ARMOR, FORT_MASTER, FORT_PREDATOR]) {
  SKILL_IDS[ci] = ci === FORT_PREDATOR ? 'sk_fortress_hunt' : 'sk_fortress_guard';
  SKILL_NAMES[ci] = ci === FORT_PREDATOR ? 'اندفاع المفترس' : ci === FORT_MASTER ? 'جدار الفولاذ' : 'الصد الحديدي';
  SKILL2[ci] = 'sk2_fortress_burst'; SKILL2_NAMES[ci] = 'الانفجار الدفاعي'; SKILL2_LINE[ci] = 'ردّ الصدمة!';
}
SKILL_IDS[FORT_NASSER] = 'sk_fortress_black'; SKILL_NAMES[FORT_NASSER] = 'الإعدام الأسود';
COMBOS[FORT_MASTER]['24'] = ['غضب الحصن', projMove(9, 22, GUARD, FORT_GUARD_POSE, f => {
  fortressGuard(f);
  f.fortCharge = Math.min(16, (f.fortCharge || 0) + 8);
})];
Object.assign(COMBOS[FORT_PREDATOR], {
  '12': ['سرعة الظل + قوة التحطيم', dashMove({ st: 8, ac: 9, rc: 21, sp: 22, trail: 1,
    limb: 'fH', r: 54, dmg: 22, kd: 1, pose: PZ.punch })],
  '13': ['اللهب المتفجر المركّز', projMove(11, 23, PZ.windup, PZ.release, f => fortressWave(f, '#ff8d40', { dmg: 18, speed: 24 }))],
  '14': ['الهجوم الوحشي', dashMove({ st: 10, ac: 13, rc: 23, sp: 17, limb: 'fH', r: 58, dmg: 19, kd: 1, pose: PZ.shoulder })],
  '23': ['الضربة المدمرة', M({ ...MV.hook, dmg: 19, combo: 1, onHit(a, d, blocked) {
    if (blocked) G.fight.applyDamage(a, d, 5, 'hit', a.J.fH, true);
  } })],
  '24': ['رد الفعل الخارق', projMove(7, 20, GUARD, FORT_GUARD_POSE, f => { fortressGuard(f); f.fortCharge = Math.min(16, (f.fortCharge || 0) + 6); })],
  '34': ['التحطيم المدرّع', projMove(15, 21, PZ.stompUp, PZ.pound, f => fortressWave(f, '#eac278', { dmg: 19, low: true }))],
});

function fortressFinish(F, a, d, t) {
  const predator = a.ci === FORT_PREDATOR, dir = a.facing;
  if (t === 1) F.fin.fortX = clamp(a.x + dir * 185, -STAGE + 35, STAGE - 35);
  if (t < 76) finHold(d, F.fin.fortX);
  finCam(F, (a.x + d.x) / 2, -230, t < 58 ? 1.12 : 1.23);
  a.rageP = t < 18 ? G2(FORT_GUARD_POSE) : t < 51 ? FPZ.str(finExt(t - 18, 18)) : t < 74 ? FPZ.armsUp : FPZ.slam;
  if (t === 24 || t === 42 || t === 75) {
    const c = finChest(d), last = t === 75;
    finHit(F, a, d, last ? predator ? 31 : 24 : 7, c, last ? 14 : 4, last);
    finBurst(...c, last ? 40 : 14, FORT_COLORS, last ? 13 : 8, 7);
    finRing(...c, predator ? '#ffd777' : '#64c7ff', last ? 270 : 130, 19);
    if (last) { finLaunch(d, dir * 15, -19); SFX.rock(); F.shake(28); }
  }
  return t >= 102;
}
function installFortressFinishers() {
  for (const ci of [FORT_ROOKIE, FORT_ARMOR, FORT_MASTER, FORT_PREDATOR]) PERSONA[ci] = PERSONA[CHEF];
  PERSONA[FORT_NASSER] = PERSONA[NASSER];
  FIN[FORT_ROOKIE] = FIN[12];
  FIN[FORT_NASSER] = FIN[NASSER];
  FIN[FORT_ARMOR] = FIN[FORT_MASTER] = { name: 'حكم الحصن', line: 'خذ حكم الحصن!', col: '#64c7ff', run: fortressFinish };
  FIN[FORT_PREDATOR] = { name: 'انتقام الحصن الأبدي', line: 'الحين بتشوف انتقام الحصن الأبدي!', col: '#ffd36e', run: fortressFinish };
}

function fortressBattleTick(F) {
  if (F.phase !== 'fight' || F.fin) return;
  const [a, d] = F.f;
  if (F.storyArmorBreak && !F.storyArmorBroken && (a.hp <= a.maxHp * 0.33 || d.hp <= d.maxHp * 0.28)) {
    F.storyArmorBroken = true;
    a.ci = F.cis[0] = FORT_PREDATOR; a.C = CHARS[a.ci]; a.R = RIGS[a.ci];
    a.dispName = a.C.name; a.maxHp = Math.round(170 * a.C.hp); a.hp = a.trailHp = Math.max(a.hp, Math.round(a.maxHp * 0.64));
    a.dmgMul = 1.22; a.defMul = 0.73; a.sk = SKMAX; a.sk2CD = 0; a.rageUsed = false;
    for (const f of [a, d]) { f.setState('idle'); f.mv = null; f.buf = null; f.y = f.vx = f.vy = 0; f.animate(); }
    d.bossCD = 75; F.proj = []; F.freeze = 52; F.shake(28); SFX.rock();
    finBurst(a.x, a.hipY - 100, 55, FORT_COLORS, 15, 8);
    finRing(a.x, a.hipY - 100, '#ffd36e', 270, 28);
    F.banner = { t: '⚡ انكسر الدرع — ظهر المفترس الأسطوري!', ar: true, dur: 110, k: 0 };
    a.talk('rage', 'هذا الدرع من أجل كتم قوتي الحقيقية!');
  }
  if (F.storyLearnBlack && !a.storySkill && d.mv === MV.sk_fortress_black && d.mt >= d.mv.st) {
    a.storySkill = 'sk_fortress_eternal'; a.sk = SKMAX;
    F.banner = { t: '⚡ قرأت الإعدام الأسود وطوّرته إلى الإعدام الأسود الأبدي', ar: true, dur: 100, k: 0 };
    SFX.ready();
  }
}
