# inject work id W (rig/front/vs/face) into v1 assets.js as asset key K
import sys, json, base64, io
from PIL import Image
W, K = int(sys.argv[1]), int(sys.argv[2])
P = '/home/claude/ahmed-1343/src/v1/assets.js'; D = '/home/claude/work'
def enc(img, q):
    b = io.BytesIO(); img.save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
s = open(P, encoding='utf8').read()
a0 = s.index('const ASSETS=') + len('const ASSETS='); a1 = s.index(';\nconst RIG=')
assets = json.loads(s[a0:a1]); r0 = a1 + len(';\nconst RIG='); rig = json.loads(s[r0:s.rindex(';')])
for part in ('torso', 'uarm', 'farm', 'thigh', 'shin', 'foot'):
    assets[f'c{K}_{part}'] = enc(Image.open(f'{D}/rig/c{W}_{part}.png').convert('RGBA'), 92)
assets[f'front{K}'] = enc(Image.open(f'{D}/f{W}.png').convert('RGBA'), 88)
assets[f'vs{K}'] = enc(Image.open(f'{D}/p{W}.png').convert('RGBA'), 85)
assets[f'face{K}'] = enc(Image.open(f'{D}/face{W}.png').convert('RGBA').resize((192, 192), Image.LANCZOS), 88)
rig[str(K)] = json.load(open(f'{D}/rig/meta.json'))[str(W)]
open(P, 'w', encoding='utf8').write('const ASSETS=' + json.dumps(assets) + ';\nconst RIG=' + json.dumps(rig) + ';\n')
print('ok', len(assets), sorted(rig, key=int)[-3:])
