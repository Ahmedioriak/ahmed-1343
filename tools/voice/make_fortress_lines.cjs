const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..', '..');
const source = file => fs.readFileSync(path.join(root, 'src', 'v1', file), 'utf8');
const chapters = vm.runInNewContext(source('story-three.js') + '\nSTORY_THREE');
const normalize = source('game.js').match(/^function voiceNorm\(t\) \{[^\n]+\}/m);
if (!normalize) throw new Error('Could not find the game voice key normalizer');
const voiceNorm = vm.runInNewContext(normalize[0] + '\nvoiceNorm');
const roles = { N: 'nar', P: 'c18', adel: 'c15', salah: 'c16', inv: 'c19',
  captain: 'c2', moalem: 'c6', bull: 'c5', guard: 'c4', hamad: 'c25',
  nasser: 'c24', dragon: 'c7', malali: 'c23', shade: 'c26' };
const lines = new Map();
function add([role, text], chapter) {
  const tag = roles[role];
  if (!tag || /\{\w+\}/.test(text)) throw new Error('Unresolved voice line: ' + text);
  for (const phrase of text.split('…')) {
    const key = voiceNorm(phrase);
    if (!key) continue;
    const k = tag + '|' + key;
    if (!lines.has(k)) lines.set(k, { tag, k, t: phrase.trim(), src: 'story3', chapter });
  }
}
chapters.forEach(({ steps }, index) => {
  for (const step of steps) {
    for (const group of [step.say, step.win, step.lose, ...Object.values(step.talks || {})]) {
      for (const line of group || []) add(line, index + 1);
    }
  }
});
for (const line of [
  ['P', 'ردّ الصدمة!'], ['P', 'خذ حكم الحصن!'], ['P', 'الحين بتشوف انتقام الحصن الأبدي!'],
  ['P', 'هذا الدرع من أجل كتم قوتي الحقيقية!'], ['nasser', 'شوف الإعدام الأسود!'],
]) add(line, null);
fs.writeFileSync(path.join(root, 'voice-lines-fortress.json'), JSON.stringify([...lines.values()], null, 2) + '\n', 'utf8');
console.log('Story 3 recording lines:', lines.size);
