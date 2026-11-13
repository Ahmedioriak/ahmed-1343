# Rebuild both versions from the sources:  python3 src/build.py
#   src/v1/*  -> index.html, mobile.html           (النسخة الأساسية — 17 شخصية)
#   src/*     -> v2/index.html, v2/mobile.html     (معركة الشلة 2 — 15 شخصية)
import base64, os, re, shutil
D = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(D)
rd = lambda *n: open(os.path.join(D, *n), encoding='utf-8').read()
pj = rd('peerjs.min.js').replace('</script', '<\\/script').replace('//# sourceMappingURL=peerjs.min.js.map', '')
fb = '\n'.join(rd(f).replace('//# sourceMappingURL=' + f + '.map', '') for f in ['firebase-app-compat.js', 'firebase-database-compat.js'])
def build(sub, out, title, cfg):
    s = rd(*sub, 'shell.html')
    vp = os.path.join(D, *sub, 'voices.js')
    s = s.replace('/*VOICES*/', open(vp, encoding='utf-8').read() if os.path.exists(vp) else '')
    if os.path.exists(os.path.join(D, *sub, 'voices_pro.js')): s = s.replace('<script>', '<script>window.PRO_VOICES=1;</script>\n<script>', 1)   # tells the game a studio voice pack exists
    assets = rd(*sub, 'assets.js')
    game = rd(*sub, 'game.js')
    if sub == ('v1',):
        for fighter, sections in (('baba', ('assets', 'moves')), ('farm', ('assets', 'moves')), ('wahsh', ('assets',))):
            with open(os.path.join(D, *sub, fighter + '-reference.jpg'), 'rb') as photo:
                encoded = base64.b64encode(photo.read()).decode('ascii')
            assets += '\nASSETS.' + fighter + 'Reference = "data:image/jpeg;base64,' + encoded + '";'
            for section in sections:
                marker = '/*' + fighter.upper() + '_' + section.upper() + '*/'
                game = game.replace(marker, rd(*sub, fighter + '-' + section + '.js'))
        game = game.replace('/*STORY_THREE*/', rd(*sub, 'story-three.js'))
        for form in ('rookie', 'armor', 'predator', 'nasser'):
            with open(os.path.join(D, *sub, 'fort-' + form + '-reference.jpg'), 'rb') as photo:
                encoded = base64.b64encode(photo.read()).decode('ascii')
            assets += '\nASSETS.fort' + form.title() + 'Reference = "data:image/jpeg;base64,' + encoded + '";'
        for section in ('assets', 'combat'):
            game = game.replace('/*FORTRESS_' + section.upper() + '*/', rd(*sub, 'fortress-' + section + '.js'))
    s = s.replace('/*ASSETS*/', assets).replace('/*GAME*/', game).replace('/*PEER*/', pj).replace('/*FB*/', fb)
    for l in re.findall(r'<link[^>]*fonts\.(?:googleapis|gstatic)[^>]*>', s): s = s.replace(l, '')
    s = s.replace('</head>', '<style>' + rd('fonts.css') + '</style></head>', 1).replace('src="firebase-config.js"', 'src="' + cfg + '"')
    O = os.path.join(R, out); os.makedirs(O, exist_ok=True)
    pv = os.path.join(D, *sub, 'voices_pro.js')
    old_parts = {f for f in os.listdir(O) if re.fullmatch(r'pro-voices-\d+\.js', f)}
    if os.path.exists(pv):   # studio voices, split in parts of ~8 MB so every file stays small
        import json as _j
        t = open(pv, encoding='utf-8').read(); d = _j.loads(t[t.index('=') + 1:t.index(';if(window.__proVoices)')])
        parts, cur, sz = [], {}, 0
        for k, v in d.items():
            if sz > 8_000_000: parts.append(cur); cur, sz = {}, 0
            cur[k] = v; sz += len(v)
        parts.append(cur)
        for n, part in enumerate(parts, 1):
            filename = 'pro-voices-%d.js' % n
            with open(os.path.join(O, filename), 'w', encoding='utf-8', newline='\n') as target:
                target.write('(window.VOICE_PRO_PARTS=window.VOICE_PRO_PARTS||[]).push(' + _j.dumps(part, ensure_ascii=False) + ');if(window.__proVoices)window.__proVoices();')
            old_parts.discard(filename)
        import hashlib as _h
        H = [_h.md5(_j.dumps(part, ensure_ascii=False).encode()).hexdigest()[:10] for part in parts]   # each part's own fingerprint: the phone keeps a part until it really changes
        s = s.replace('window.PRO_VOICES=1;', 'window.PRO_VOICES=%d;window.PRO_H=%s;' % (len(parts), _j.dumps(H)), 1)
    for filename in old_parts:
        os.remove(os.path.join(O, filename))
    m3 = os.path.join(D, *sub, 'wahsh3d2.js')   # الوحش's 3D model + renderer, loaded only when he fights
    if os.path.exists(m3):
        import hashlib as _h3; t3 = open(m3, 'rb').read(); open(os.path.join(O, 'wahsh3d2.js'), 'wb').write(t3)
        s = s.replace('<script>', '<script>window.M3D_H=%r;</script>\n<script>' % _h3.md5(t3).hexdigest()[:10], 1)
    open(os.path.join(O, 'index.html'), 'w', encoding='utf-8', newline='\n').write(s)
    sv = os.path.join(D, *sub, 'voices_story.js')
    if os.path.exists(sv): shutil.copyfile(sv, os.path.join(O, 'story-voices.js'))   # the story's voice, loaded in the background
    i = s.index('<script>')
    m = (s[:i] + '<script>window.FORCE_TOUCH=true;</script>\n' + s[i:]).replace('<title>' + title + '</title>', '<title>' + title + ' — جوال</title>', 1).replace('href="manifest.webmanifest"', 'href="manifest-mobile.webmanifest"')
    open(os.path.join(O, 'mobile.html'), 'w', encoding='utf-8', newline='\n').write(m)
    print('built', out or '.', len(s) // 1024, 'KB')
build(('v1',), '', 'معركة الشلة', 'firebase-config.js')
build((), 'v2', 'معركة الشلة 2', '../firebase-config.js')

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
    fortress = os.path.join(R, 'voice-lines-fortress.json')
    if os.path.exists(fortress):
        template = open(tp, encoding='utf-8').read()
        lines = open(fortress, encoding='utf-8').read().strip()
        page = template.replace('تسجيل أصوات معركة الشلة', 'تسجيل أصوات أسطورة الدرع الأخير')
        page = page.replace('pro-voices-recorded.zip', 'fortress-voices.zip')
        page = page.replace('وارسله لـ Claude في المحادثة، وهو يركّبه في اللعبة وينشرها للكل.', 'واستورده إلى نسخة اللعبة حسب خطوات ملف README.')
        page = page.replace('/*VOICE_LINES*/', 'window.VOICE_LINES=' + lines + ';', 1)
        open(os.path.join(R, 'record-fortress.html'), 'w', encoding='utf-8').write(page)
        print('built record-fortress.html')
