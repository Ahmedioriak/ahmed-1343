# One-off patch: story 4 («ملحمة الأبطال») + «play the good side» (fight step `as`) in every story.
import os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(R, 'src', 'v1', 'game.js'); s = open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)

# --- injection points
rep('/*FORTRESS_ASSETS*/\n', '/*FORTRESS_ASSETS*/\n')
rep('/*FORTRESS_COMBAT*/', '/*FORTRESS_COMBAT*/\n/*SAGA4_COMBAT*/')
rep('fortressAssets();', 'fortressAssets(); saga4Assets();')
rep('installFortressFinishers();', 'installFortressFinishers(); installS4();')

# --- the fourth book
rep("/*STORY_THREE*/\nconst SG_BOOK_START = [0, SAGA.findIndex(c => c.s2), SAGA.length];\nSAGA.push(...STORY_THREE);\n",
    "/*STORY_THREE*/\n/*STORY_FOUR*/\nconst SG_BOOK_START = [0, SAGA.findIndex(c => c.s2), SAGA.length];\nSAGA.push(...STORY_THREE);\nSG_BOOK_START.push(SAGA.length); SAGA.push(...STORY_FOUR);\n")
rep("  { title: '🛡️ الدرع الأخير',", "  { title: '🛡️ الدرع الأخير',")
rep("reward: '🌴 الفريج والحلبة وقلعة ناصر مفتوحة للتجوّل' },\n];",
    "reward: '🌴 الفريج والحلبة وقلعة ناصر مفتوحة للتجوّل' },\n"
    "  { title: '👑 ملحمة الأبطال', color: '#ff8a00', finish: '🏆 خلصت ملحمة الأبطال… لعبت بكل بطل في الحرب!', ending: 'ارتفعت راية العائلة… وانتهت حرب الخالين أخيراً', reward: '👑 كل أماكن المملكة مفتوحة للتجوّل' },\n];")
rep("const sgStoryNo = ch => ch >= SG_BOOK_START[2] ? 3 : ch >= SG_BOOK_START[1] ? 2 : 1;",
    "const sgStoryNo = ch => ch >= SG_BOOK_START[3] ? 4 : ch >= SG_BOOK_START[2] ? 3 : ch >= SG_BOOK_START[1] ? 2 : 1;")
rep("t: 'القصة ' + ['١', '٢', '٣'][i] + ' · ' + book.title, a: i + 1,\n    on: n === i + 1, x: x0 + 216 * (1 - i), w: 204, col: book.color,",
    "t: 'القصة ' + ['١', '٢', '٣', '٤'][i] + ' · ' + book.title, a: i + 1,\n    on: n === i + 1, x: x0 + 170 * (1.5 - i), w: 164, col: book.color,")
rep("if (began) L.push({ t: '🔁 من جديد', a: 'r', x: x0 + 405, w: 142,", "if (began) L.push({ t: '🔁 من جديد', a: 'r', x: x0 + 420, w: 128,")
rep("{ size: ask ? 14 : 17, weight: 900, color: b.on === false", "{ size: ask ? 13 : 14, weight: 900, color: b.on === false")
rep("p.c34 || q.c34 || anyP('Digit3') ? 3 : 0;", "p.c34 || q.c34 || anyP('Digit3') ? 3 : anyP('Digit4') ? 4 : 0;")
rep("'L1 / R1 / R2: تبديل القصة' : '1 / 2 / 3: تبديل القصة'", "'L1 / R1 / R2: تبديل القصة' : '1 / 2 / 3 / 4: تبديل القصة'")
# story 4 behaves like stories 1-2 for the hero (your own fighter walks the world); only story 3 is the chef's
rep("const resume = savedMap && sv.ci === ci && (sv.story ? sv.story === story : story < 3)\n    && (story < 3 ||",
    "const resume = savedMap && sv.ci === ci && (sv.story ? sv.story === story : story !== 3)\n    && (story !== 3 ||")
rep("var SAGA_DONE = (() => { try { const o = JSON.parse(localStorage.getItem('shilla_saga')); if (o && (o.ever || (o.done && sgStoryNo(o.ch) < 3))) return true; } catch (e) { } return Object.values(sgAll()).some(s => s && (s.ever || (s.done && sgStoryNo(s.ch) < 3))); })();",
    "var SAGA_DONE = (() => { try { const o = JSON.parse(localStorage.getItem('shilla_saga')); if (o && (o.ever || (o.done && sgStoryNo(o.ch) !== 3))) return true; } catch (e) { } return Object.values(sgAll()).some(s => s && (s.ever || (s.done && sgStoryNo(s.ch) !== 3))); })();")
rep("  const earned = S.ever || (S.done && sgStoryNo(S.ch) < 3);", "  const earned = S.ever || (S.done && sgStoryNo(S.ch) !== 3);")
rep("if (sgStoryNo(S.ch) < 3) S.ever = true; sgSave(S);", "if (sgStoryNo(S.ch) !== 3) S.ever = true; sgSave(S);")
rep("ever: !!(sv.ever || (sv.done && sgStoryNo(sv.ch) < 3)), base: W.P.base, cast: sgStoryNo(sv.ch) === 3 ? sgCast(W.P.ci, W.P.ci) : sgCast(W.P.base, W.P.ci),",
    "ever: !!(sv.ever || (sv.done && sgStoryNo(sv.ch) !== 3)), base: W.P.base, cast: sgStoryNo(sv.ch) === 3 ? sgCast(W.P.ci, W.P.ci) : sgStoryNo(sv.ch) === 4 ? s4Cast(W.P.base, W.P.ci) : sgCast(W.P.base, W.P.ci),")
# map unlocks replay from the start of the current book (stories 3 and 4)
rep("function sgReplay(S) { S.un = new Set(); for (let c = sgStoryNo(S.ch) === 3 ? SG_BOOK_START[2] : 0;",
    "function sgReplay(S) { S.un = new Set(); for (let c = sgStoryNo(S.ch) >= 3 ? SG_BOOK_START[sgStoryNo(S.ch) - 1] : 0;")
# chapters of story 4 follow each other right away (no waiting a day)
rep("  if (sgStoryNo(S.ch) === 3) {\n    S.ch++; S.st = 0; S.wait = null;", "  if (sgStoryNo(S.ch) >= 3) {\n    S.ch++; S.st = 0; S.wait = null;")
# credits roster
rep("const R = sgStoryNo(S.ch) === 3 ? ['P',", "const R = sgStoryNo(S.ch) === 4 ? ['adel', 'salah', 'malali', 'exp', 'inv', 'dragon', 'chef', 'captain', 'moalem', 'bull', 'dajaj', 'teer', 'gamer', 'abd'] : sgStoryNo(S.ch) === 3 ? ['P',")

# --- roles and titles for the new story-4 characters
rep("const SG_TITLE = { nasser: 'ناصر',", "Object.assign(SG_CI, { exp: S4_EXP, mech: S4_MECH, robot: S4_ROBOT });\nconst SG_TITLE = { exp: 'التجربة صفر', mech: 'المخترع — البدلة الآلية', robot: 'الحارس الآلي', nasser: 'ناصر',")
rep("function sgName(W, r) {", "// story 4: المعلّم والعبد والبلدوزر بأشكالهم الجديدة\nfunction s4Cast(base, eff) { const c = sgCast(base, eff); for (const k of ['moalem', 'abd', 'bull']) c[k] = S4[k]; c.exp = S4_EXP; c.mech = S4_MECH; c.robot = S4_ROBOT; return c; }\nfunction sgName(W, r) {")
rep("  if (who === FORT_NASSER) return 'c' + NASSER;\n", "  if (who === FORT_NASSER) return 'c' + NASSER;\n  if (CHARS[who] && CHARS[who].s4) return S4_VOICE[CHARS[who].s4];\n")

# --- «play the good side»: a fight step with `as: role` puts you in that fighter's shoes
rep("  const oc = S.cast[st.fight]; W.sagaF = st; G.mode = 'cpu';\n  const fortress = sgStoryNo(S.ch) === 3;\n  G.sel = { cur: [fortress ? W.P.ci : W.P.base, st.darkForm ? FORT_NASSER : oc],\n    done: [true, true], t: 0, readyT: 0, outfit: [fortress ? 0 : W.P.o, 0] };\n  G.stageId = st.stage || 'arena'; G.vsName = [null, st.name ? sgTok(W, st.name) : sgName(W, st.fight)];",
    "  const oc = S.cast[st.fight]; W.sagaF = st; G.mode = 'cpu';\n  const fortress = sgStoryNo(S.ch) === 3, asCi = sgAsCi(W, st);\n  G.sel = { cur: [asCi != null ? asCi : fortress ? W.P.ci : W.P.base, st.darkForm ? FORT_NASSER : oc],\n    done: [true, true], t: 0, readyT: 0, outfit: [asCi != null || fortress ? 0 : W.P.o, 0] };\n  G.stageId = st.stage || 'arena'; G.vsName = [asCi != null ? sgName(W, st.as) : null, st.name ? sgTok(W, st.name) : sgName(W, st.fight)];\n  if (asCi != null) W.toast = { t: '🎭 في هالقتال أنت ' + sgName(W, st.as) + '!', k: 0 };")
rep("function sagaSetupFight(F) {", "// the fighter you play in a story fight: your own hero, or the good side of the duel (st.as)\nfunction sgAsCi(W, st) { if (!st.as || st.as === 'P') return null; const S = W.saga, base = SG_CI[st.as]; if (base === W.P.base || base === W.P.ci) return W.P.base; return S.cast[st.as]; }\nfunction sagaSetupFight(F) {")
rep("  if (st.final) F.sagaTick = st.final === 2 ? sagaFinalTick2 : sagaFinalTick; }",
    "  if (st.final) F.sagaTick = st.final === 2 ? sagaFinalTick2 : sagaFinalTick;\n  if (st.hazard) { const t0 = F.sagaTick; F.sagaTick = F2 => { if (t0) t0(F2); s4Hazard(F2, st.hazard); }; } }")
open(p, 'w', encoding='utf-8', newline='\n').write(s)

# build.py: inject the new files
b = os.path.join(R, 'src', 'build.py'); t = open(b, encoding='utf-8').read()
a = "        game = game.replace('/*STORY_THREE*/', rd(*sub, 'story-three.js'))\n"
assert a in t
t = t.replace(a, a + "        game = game.replace('/*STORY_FOUR*/', rd(*sub, 'story-four.js')).replace('/*SAGA4_COMBAT*/', rd(*sub, 'saga4-combat.js'))\n        assets += '\\n' + rd(*sub, 'saga4-art.js')\n")
open(b, 'w', encoding='utf-8', newline='\n').write(t)
print('ok')
