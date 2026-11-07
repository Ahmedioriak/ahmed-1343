const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const e = []; p.on('pageerror', x => e.push(x.message));
  await p.goto('file://' + require('path').resolve(__dirname, '../../../index.html') + ''); await p.waitForTimeout(3000);
  const M = await p.evaluate(() => window.__voxManifest());
  fs.writeFileSync('' + require('path').resolve(__dirname, 'lines.full.json') + '', JSON.stringify(M));
  const by = {}; let tot = 0; const bs = {}; for (const m of M) { bs[m.src] = (bs[m.src] || 0) + m.t.length; by[m.tag] = by[m.tag] || [0, 0]; by[m.tag][0]++; by[m.tag][1] += m.t.length; tot += m.t.length; }
  console.log('entries', M.length, 'chars', tot, JSON.stringify(by), JSON.stringify(bs)); console.log(M.slice(0, 5).map(m => m.k + ' => ' + m.t).join('\n')); console.log('errs', e); await b.close(); })();
