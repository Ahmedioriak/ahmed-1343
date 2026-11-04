# Rebuild v2/index.html and v2/mobile.html (معركة الشلة 2) from the sources:  python3 src/build.py
# The site root (index.html, mobile.html) is the main version with 14 fighters and is kept as it is.
import os, re
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
rd = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
s = rd('shell.html')
pj = rd('peerjs.min.js').replace('</script', '<\\/script').replace('//# sourceMappingURL=peerjs.min.js.map', '')
fb = '\n'.join(rd(f).replace('//# sourceMappingURL=' + f + '.map', '') for f in ['firebase-app-compat.js', 'firebase-database-compat.js'])
s = s.replace('/*ASSETS*/', rd('assets.js')).replace('/*GAME*/', rd('game.js')).replace('/*PEER*/', pj).replace('/*FB*/', fb)
for l in re.findall(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', s): s = s.replace(l, '')
s = s.replace('</head>', '<style>' + rd('fonts.css') + '</style></head>', 1)
s = s.replace('src="firebase-config.js"', 'src="/firebase-config.js"')
O = os.path.join(R, 'v2'); os.makedirs(O, exist_ok=True)
open(os.path.join(O, 'index.html'), 'w', encoding='utf-8').write(s)
i = s.index('<script>')
m = s[:i] + '<script>window.FORCE_TOUCH=true;</script>\n' + s[i:]
m = m.replace('<title>معركة الشلة 2</title>', '<title>معركة الشلة 2 — جوال</title>', 1)
open(os.path.join(O, 'mobile.html'), 'w', encoding='utf-8').write(m)
print('built', len(s) // 1024, 'KB')
