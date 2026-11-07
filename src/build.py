# Rebuild both versions from the sources:  python3 src/build.py
#   src/v1/*  -> index.html, mobile.html           (النسخة الأساسية — 14 شخصية)
#   src/*     -> v2/index.html, v2/mobile.html     (معركة الشلة 2 — 15 شخصية)
import os, re
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
rd = lambda *n: open(os.path.join(D, *n), encoding='utf-8').read()
pj = rd('peerjs.min.js').replace('</script', '<\\/script').replace('//# sourceMappingURL=peerjs.min.js.map', '')
fb = '\n'.join(rd(f).replace('//# sourceMappingURL=' + f + '.map', '') for f in ['firebase-app-compat.js', 'firebase-database-compat.js'])
def build(sub, out, title, cfg):
    s = rd(*sub, 'shell.html')
    vp = os.path.join(D, *sub, 'voices.js')
    s = s.replace('/*VOICES*/', open(vp, encoding='utf-8').read() if os.path.exists(vp) else '')
    if os.path.exists(os.path.join(D, *sub, 'voices_pro.js')): s = s.replace('<script>', '<script>window.PRO_VOICES=1;</script>\n<script>', 1)   # tells the game a studio voice pack exists
    s = s.replace('/*ASSETS*/', rd(*sub, 'assets.js')).replace('/*GAME*/', rd(*sub, 'game.js')).replace('/*PEER*/', pj).replace('/*FB*/', fb)
    for l in re.findall(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', s): s = s.replace(l, '')
    s = s.replace('</head>', '<style>' + rd('fonts.css') + '</style></head>', 1).replace('src="firebase-config.js"', 'src="' + cfg + '"')
    O = os.path.join(R, out); os.makedirs(O, exist_ok=True)
    open(os.path.join(O, 'index.html'), 'w', encoding='utf-8').write(s)
    sv = os.path.join(D, *sub, 'voices_story.js')
    if os.path.exists(sv): open(os.path.join(O, 'story-voices.js'), 'w', encoding='utf-8').write(open(sv, encoding='utf-8').read())   # the story's voice, loaded in the background
    pv = os.path.join(D, *sub, 'voices_pro.js')
    if os.path.exists(pv): open(os.path.join(O, 'pro-voices.js'), 'w', encoding='utf-8').write(open(pv, encoding='utf-8').read())   # ElevenLabs studio voices (when recorded)
    i = s.index('<script>')
    m = (s[:i] + '<script>window.FORCE_TOUCH=true;</script>\n' + s[i:]).replace('<title>' + title + '</title>', '<title>' + title + ' — جوال</title>', 1).replace('href="manifest.webmanifest"', 'href="manifest-mobile.webmanifest"')
    open(os.path.join(O, 'mobile.html'), 'w', encoding='utf-8').write(m)
    print('built', out or '.', len(s) // 1024, 'KB')
build(('v1',), '', 'معركة الشلة', 'firebase-config.js')
build((), 'v2', 'معركة الشلة 2', '/firebase-config.js')

# admin dashboard (separate link: /admin)
fba = '\n'.join(rd(f).replace('//# sourceMappingURL=' + f + '.map', '') for f in ['firebase-app-compat.js', 'firebase-database-compat.js', 'firebase-auth-compat.js'])
a = rd('admin.html').replace('/*FB*/', fba.replace('</script', '<\\/script')).replace('</head>', '<style>' + rd('fonts.css') + '</style></head>', 1)
open(os.path.join(R, 'admin.html'), 'w', encoding='utf-8').write(a); print('built admin', len(a) // 1024, 'KB')
