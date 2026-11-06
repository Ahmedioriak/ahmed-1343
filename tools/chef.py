# chef outfit for الوحش (rig 2): white chef jacket, black-and-white check trousers; skin, hair, gloves and boots untouched
import numpy as np, json, colorsys
from PIL import Image, ImageDraw
W = '/home/claude/work'
def masks(a):
    rgb = a[:, :, :3].astype(np.float32) / 255; r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(2), rgb.min(2); v = mx; s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    h = np.zeros_like(mx); d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    skin = (v > 0.38) & (s > 0.18) & (s < 0.72) & (((h >= 4) & (h <= 40)) | (h >= 352)) & (r > b + 0.08)
    red = (s > 0.5) & ((h < 12) | (h > 340)) & ~skin
    cloth = (a[:, :, 3] > 10) & ~skin
    L = 0.3 * r + 0.59 * g + 0.11 * b
    return cloth, red, L
def jacket(a, protect=None):
    a = a.copy(); cloth, red, L = masks(a)
    if protect is not None: cloth &= ~protect
    sh = np.clip(L / 0.32, 0, 1) ** 0.7
    out = np.stack([0.80 + 0.2 * sh, 0.81 + 0.19 * sh, 0.84 + 0.16 * sh], -1) * 255
    a[cloth, :3] = out[cloth].astype(np.uint8); return a
def trousers(a, protect=None, cell=5):
    a = a.copy(); cloth, red, L = masks(a)
    if protect is not None: cloth &= ~protect
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    chk = ((xx // cell + yy // cell) % 2).astype(np.float32)
    sh = np.clip(L / 0.3, 0, 1) ** 0.8
    base = (0.2 + chk * 0.55) * (0.7 + 0.3 * sh)
    out = np.stack([base, base, base * 1.02], -1).clip(0, 1) * 255
    a[cloth, :3] = out[cloth].astype(np.uint8); return a
def buttons(img, pts, r=4):
    d = ImageDraw.Draw(img)
    for x, y in pts: d.ellipse([x - r, y - r, x + r, y + r], fill=(40, 40, 46, 255), outline=(15, 15, 18, 255))
def edge_x(a, y, side='right'):
    xs = np.where(a[y, :, 3] > 120)[0]; return (xs.max() if side == 'right' else xs.min()) if len(xs) else None
meta = json.load(open(f'{W}/rig/meta.json'))['2']; P = meta['parts']
rows = lambda a, y0, y1: np.pad(np.ones((max(0, y1 - y0), a.shape[1]), bool), ((max(0, y0), max(0, a.shape[0] - y1)), (0, 0)))[:a.shape[0]]
out = {}
for part in ['torso', 'uarm', 'farm', 'thigh', 'shin', 'foot']:
    im = np.array(Image.open(f'{W}/rig/c2_{part}.png').convert('RGBA')); ox, oy = P[part]
    if part == 'torso':
        prot = np.zeros(im.shape[:2], bool); prot[:max(0, 100 - oy)] = True     # head, hair, beard
        im = jacket(im, prot)
        img = Image.fromarray(im); pts = []
        for y in range(128, 222, 22):
            ex = edge_x(im, y - oy); pts.append((ex - 14, y - oy)) if ex else None
        buttons(img, pts); im = np.array(img)
    elif part == 'uarm': im = jacket(im)
    elif part in ('thigh', 'shin'):
        prot = None
        if part == 'shin': prot = np.zeros(im.shape[:2], bool); prot[max(0, meta['A'][1] - 30 - oy):] = True   # boots
        im = trousers(im, prot)
    out[part] = im; Image.fromarray(im).save(f'{W}/chef/c2chef_{part}.png')
# select-screen full body (front)
f = np.array(Image.open(f'{W}/f2.png').convert('RGBA'))
prot = np.zeros(f.shape[:2], bool); prot[:96] = True
gl = np.zeros(f.shape[:2], bool); gl[225:310, :] = True                                           # gloves row
cl, _, _ = masks(f)
xs = np.where(f[300].astype(int)[:, 3] > 100)[0]
top = jacket(f, prot | gl | (np.mgrid[0:f.shape[0], 0:f.shape[1]][0] > 262))
yy, xx = np.mgrid[0:f.shape[0], 0:f.shape[1]]
lower = trousers(top, (yy <= 262) | (yy > 520))
# keep gloves (hands at the sides) untouched: restore pixels far left/right in the glove band
cx = f.shape[1] // 2
band = (yy >= 225) & (yy <= 310) & (np.abs(xx - cx) > 70)
lower[band] = f[band]
img = Image.fromarray(lower)
buttons(img, [(cx - 16, y) for y in range(118, 222, 20)] + [(cx + 16, y) for y in range(118, 222, 20)], 4)
# chef hat on the select image
def hat(d, cx, top, w):
    h = w * 0.95; band_h = w * 0.3
    d.rounded_rectangle([cx - w / 2, top - band_h, cx + w / 2, top + 4], radius=6, fill=(244, 245, 248, 255), outline=(170, 175, 185, 255), width=2)
    for i, dx in enumerate([-0.32, 0, 0.32]):
        r = w * 0.36; x = cx + dx * w; y = top - band_h - h * 0.38 - (0.12 * w if i == 1 else 0)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(250, 251, 253, 255), outline=(170, 175, 185, 255), width=2)
    d.rectangle([cx - w / 2 + 3, top - band_h - h * 0.3, cx + w / 2 - 3, top - band_h + 2], fill=(250, 251, 253, 255))
    for dx in (-0.25, 0, 0.25): d.line([cx + dx * w, top - band_h - h * 0.25, cx + dx * w, top - band_h], fill=(200, 204, 212, 255), width=2)
alpha = np.array(img)[:, :, 3]; rowsx = np.where(alpha[8] > 50)[0]
headtop = int(np.where(alpha[:, cx - 20:cx + 20].max(1) > 60)[0][0])
pad = 110; can = Image.new('RGBA', (img.width, img.height + pad)); can.paste(img, (0, pad))
hat(ImageDraw.Draw(can), cx + 1, headtop + pad + 25, 72)
can = can.crop(can.split()[-1].getbbox()); can.save(f'{W}/chef/front2chef.png')
# fight-intro portrait: vest area only (gloves left as they are), then a hat over the hair
p = np.array(Image.open(f'{W}/p2.png').convert('RGBA')); H, Wd = p.shape[:2]
from PIL import ImageDraw as _D
mk = Image.new('L', (Wd, H), 0); dm = _D.Draw(mk)
dm.polygon([(285, 332), (400, 332), (440, 392), (470, 430), (500, 480), (560, 580), (380, 580), (350, 500), (330, 420), (300, 380)], fill=255)   # left vest panel
dm.polygon([(560, 400), (610, 378), (665, 420), (705, 455), (745, 480), (790, 525), (810, 580), (600, 580), (575, 500)], fill=255)          # right vest panel
dm.polygon([(688, 298), (805, 298), (855, 360), (930, 480), (925, 565), (835, 565), (755, 470), (700, 432), (665, 378)], fill=0)         # right glove stays
keep = np.array(mk) > 0
pj = jacket(p, ~keep)
pimg = Image.fromarray(pj); pad = 150; can = Image.new('RGBA', (pimg.width, pimg.height + pad)); can.paste(pimg, (0, pad))
hat(ImageDraw.Draw(can), 508, pad + 92, 265)
can.save(f'{W}/chef/vs2chef.png')
print('ok')
