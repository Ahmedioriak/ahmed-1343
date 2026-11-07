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
    pv = os.path.join(D, *sub, 'voices_pro.js')
    for f in os.listdir(O):
        if f.startswith('pro-voices'): os.remove(os.path.join(O, f))
    if os.path.exists(pv):   # studio voices, split in parts of ~8 MB so every file stays small
        import json as _j
        t = open(pv, encoding='utf-8').read(); d = _j.loads(t[t.index('=') + 1:t.index(';if(window.__proVoices)')])
        parts, cur, sz = [], {}, 0
        for k, v in d.items():
            if sz > 8_000_000: parts.append(cur); cur, sz = {}, 0
            cur[k] = v; sz += len(v)
        parts.append(cur)
        for n, part in enumerate(parts, 1): open(os.path.join(O, 'pro-voices-%d.js' % n), 'w', encoding='utf-8').write('(window.VOICE_PRO_PARTS=window.VOICE_PRO_PARTS||[]).push(' + _j.dumps(part, ensure_ascii=False) + ');if(window.__proVoices)window.__proVoices();')
        s = s.replace('window.PRO_VOICES=1;', 'window.PRO_VOICES=%d;' % len(parts), 1)
    open(os.path.join(O, 'index.html'), 'w', encoding='utf-8').write(s)
    sv = os.path.join(D, *sub, 'voices_story.js')
    if os.path.exists(sv): open(os.path.join(O, 'story-voices.js'), 'w', encoding='utf-8').write(open(sv, encoding='utf-8').read())   # the story's voice, loaded in the background
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

# the ElevenLabs recorder page (/record.html): the game's line list inlined, so it also works opened from a file
tp = os.path.join(R, 'tools', 'voice', 'elevenlabs', 'record.template.html'); lp = os.path.join(R, 'voice-lines.json')
if os.path.exists(tp) and os.path.exists(lp):
    open(os.path.join(R, 'record.html'), 'w', encoding='utf-8').write(open(tp, encoding='utf-8').read().replace('/*VOICE_LINES*/', 'window.VOICE_LINES=' + open(lp, encoding='utf-8').read().strip() + ';', 1)); print('built record.html')
    ln2 = os.path.join(R, 'voice-lines-new.json')
    if os.path.exists(ln2): open(os.path.join(R, 'record-new.html'), 'w', encoding='utf-8').write(open(tp, encoding='utf-8').read().replace('/*VOICE_LINES*/', 'window.VOICE_LINES=' + open(ln2, encoding='utf-8').read().strip() + ';', 1)); print('built record-new.html')
