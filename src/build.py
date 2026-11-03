# Rebuild index.html and mobile.html from the sources:  python3 src/build.py
import os, re
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
rd = lambda n: open(os.path.join(D, n), encoding='utf-8').read()
s = rd('shell.html')
pj = rd('peerjs.min.js').replace('</script', '<\\/script').replace('//# sourceMappingURL=peerjs.min.js.map', '')
s = s.replace('/*ASSETS*/', rd('assets.js')).replace('/*GAME*/', rd('game.js')).replace('/*PEER*/', pj)
for l in re.findall(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', s): s = s.replace(l, '')
s = s.replace('</head>', '<style>' + rd('fonts.css') + '</style></head>', 1)
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(s)
i = s.index('<script>')
m = s[:i] + '<script>window.FORCE_TOUCH=true;</script>\n' + s[i:]
m = m.replace('<title>معركة الشلة</title>', '<title>معركة الشلة — جوال</title>', 1)
open(os.path.join(R, 'mobile.html'), 'w', encoding='utf-8').write(m)
print('built', len(s) // 1024, 'KB')
