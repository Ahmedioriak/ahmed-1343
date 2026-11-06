import json, numpy as np, cv2, sys
from PIL import Image, ImageDraw
# Rig definitions in side-sprite coords (300x580, facing right)
R = {
 1: dict(S=(135,140), E=(130,245), H=(175,300), hip=(135,305), K=(122,440), A=(125,512), G=552,
         hipCut=300, uarm=[(110,125),(160,122),(168,160),(166,215),(160,248),(130,256),(112,248),(104,210),(102,160)],
         farm=[(115,238),(150,236),(165,252),(185,260),(206,283),(206,326),(190,336),(165,331),(150,313),(140,292),(125,280),(112,262)]),
 2: dict(S=(122,115), E=(140,210), H=(165,265), hip=(128,245), K=(115,418), A=(115,505), G=547,
         hipCut=240, uarm=[(97,97),(115,90),(135,95),(150,107),(152,140),(154,175),(157,205),(144,219),(125,217),(110,190),(100,150),(95,120)],
         farm=[(117,188),(142,193),(158,213),(168,223),(186,248),(191,275),(182,294),(160,297),(146,289),(134,262),(124,236),(113,210)]),
 3: dict(S=(122,85), E=(128,185), H=(155,268), hip=(125,250), K=(113,415), A=(112,515), G=550,
         hipCut=245, uarm=[(96,72),(145,68),(153,90),(154,150),(148,187),(125,195),(101,187),(96,150),(93,100)],
         farm=[(108,183),(140,186),(156,218),(176,243),(182,280),(171,299),(146,299),(134,276),(119,236),(106,205)]),
 4: dict(S=(105,90), E=(115,185), H=(145,265), hip=(110,225), K=(100,445), A=(100,520), G=553,
         hipCut=215, uarm=[(76,70),(125,66),(135,100),(137,150),(139,188),(116,202),(94,193),(83,150),(76,110)],
         farm=[(94,178),(131,174),(148,208),(158,236),(169,265),(164,294),(140,297),(124,281),(116,251),(104,221),(94,200)]),
 5: dict(S=(100,115), E=(118,195), H=(132,290), hip=(98,258), K=(90,425), A=(88,545), G=590,
         hipCut=250, uarm=[(76,92),(118,86),(132,112),(140,150),(144,195),(140,212),(108,214),(96,190),(86,150),(78,118)],
         farm=[(100,195),(144,190),(146,235),(150,250),(158,262),(157,300),(150,323),(126,325),(110,300),(108,262),(108,245),(100,220)]),
 6: dict(S=(128,115), E=(135,220), H=(160,272), hip=(125,262), K=(115,455), A=(110,515), G=556,
         hipCut=255, uarm=[(95,88),(135,83),(155,100),(160,140),(155,190),(150,220),(127,225),(107,210),(100,165),(94,125)],
         farm=[(110,205),(150,210),(162,235),(180,248),(190,270),(186,299),(170,304),(152,301),(142,280),(135,250),(115,225)]),
 7: dict(S=(125,120), E=(130,228), H=(175,292), hip=(130,305), K=(120,460), A=(122,538), G=600,
         hipCut=298, uarm=[(92,100),(150,92),(172,115),(176,160),(176,205),(172,236),(140,242),(108,236),(96,200),(90,150)],
         farm=[(115,228),(170,228),(185,250),(200,262),(208,290),(204,321),(185,331),(158,325),(148,300),(138,276),(120,262)]),
 8: dict(S=(125,110), E=(140,215), H=(163,285), hip=(128,258), K=(120,445), A=(118,538), G=580,
         hipCut=252, uarm=[(100,88),(150,82),(160,110),(162,160),(162,212),(150,228),(118,226),(104,200),(100,150)],
         farm=[(120,212),(160,210),(166,240),(176,258),(185,285),(181,313),(165,321),(150,316),(146,290),(140,262),(128,240)]),
 9: dict(S=(132,128), E=(138,215), H=(165,300), hip=(128,290), K=(112,450), A=(112,540), G=588,
         hipCut=280, uarm=[(104,110),(140,103),(160,116),(167,150),(167,190),(162,214),(132,222),(112,208),(104,172),(101,140)],
         farm=[(116,204),(160,202),(168,230),(170,260),(186,272),(188,300),(182,324),(160,328),(140,320),(136,292),(132,264),(122,242),(114,222)]),
 10: dict(S=(106,120), E=(103,222), H=(140,285), hip=(95,305), K=(84,432), A=(82,535), G=588,
         hipCut=298, uarm=[(78,100),(118,94),(138,108),(143,140),(132,176),(124,206),(120,230),(98,236),(86,216),(80,180),(76,140)],
         farm=[(88,210),(116,206),(124,228),(132,246),(152,252),(167,270),(168,302),(156,314),(134,314),(118,296),(110,270),(98,252),(88,232)]),
 11: dict(S=(118,125), E=(124,215), H=(148,298), hip=(115,305), K=(108,440), A=(104,545), G=588,
         hipCut=298, uarm=[(90,110),(130,102),(150,118),(156,160),(152,205),(142,226),(110,230),(95,206),(89,160)],
         farm=[(100,204),(146,198),(158,228),(162,262),(170,280),(168,314),(150,320),(127,314),(122,290),(113,264),(102,234)]),
 12: dict(fillc=[(258, (226, 226, 232)), (999, (42, 42, 78))], S=(125,135), E=(116,235), H=(155,302), hip=(118,272), K=(108,402), A=(104,535), G=586,
         hipCut=262, uarm=[(97,116),(140,110),(153,130),(154,170),(149,208),(132,242),(108,244),(99,212),(95,160)],
         farm=[(102,214),(136,210),(143,240),(149,261),(162,268),(178,290),(178,320),(160,328),(139,323),(131,300),(121,280),(109,258),(101,238)]),
 13: dict(fillc=[(999, (222, 220, 226))], S=(105,112), E=(100,245), H=(140,300), hip=(92,292), K=(84,428), A=(80,545), G=588,
         hipCut=284, uarm=[(70,98),(120,90),(140,110),(142,160),(133,212),(127,246),(92,252),(79,226),(69,160)],
         farm=[(86,230),(119,229),(124,250),(141,260),(154,281),(156,313),(141,324),(117,320),(108,301),(96,276),(85,252)]),
 14: dict(S=(102,118), E=(100,232), H=(140,288), hip=(100,300), K=(95,425), A=(92,530), G=586,
         hipCut=292, uarm=[(72,100),(120,96),(138,115),(141,160),(129,200),(121,236),(90,243),(75,216),(68,160)],
         farm=[(86,224),(118,221),(126,244),(138,261),(157,274),(159,301),(142,309),(121,305),(111,283),(97,261),(85,242)]),
 16: dict(fillc=[(999, (225, 226, 232))], S=(100,120), E=(98,226), H=(126,300), hip=(96,318), K=(92,445), A=(88,545), G=588,
         hipCut=310, uarm=[(70,100),(118,98),(128,115),(128,160),(122,205),(118,228),(85,236),(72,210),(66,160)],
         farm=[(80,215),(118,212),(124,240),(132,258),(146,280),(144,318),(128,322),(108,318),(100,300),(86,275),(78,245)]),
 17: dict(fillc=[(999, (52, 52, 58))], S=(88,110), E=(84,212), H=(130,282), hip=(100,300), K=(105,430), A=(108,540), G=585,
         hipCut=292, uarm=[(48,85),(105,72),(118,95),(116,150),(110,200),(100,226),(66,232),(50,200),(44,140)],
         farm=[(66,200),(108,196),(118,225),(128,246),(150,262),(150,300),(132,306),(110,302),(100,280),(88,258),(70,236)]),
 19: dict(S=(100,122), E=(104,205), H=(146,292), hip=(100,300), K=(102,428), A=(96,532), G=588,
         hipCut=292, uarm=[(72,105),(100,98),(125,108),(130,140),(130,180),(125,210),(100,216),(78,210),(72,170),(70,130)],
         farm=[(86,198),(124,198),(132,222),(136,238),(152,258),(166,272),(166,302),(158,314),(134,314),(120,298),(108,280),(98,262),(90,240),(86,215)]),
 20: dict(fillc=[(238, (222, 222, 226)), (999, (46, 42, 44))], S=(88,135), E=(88,220), H=(122,292), hip=(98,300), K=(100,455), A=(100,552), G=588,
         hipCut=292, uarm=[(55,125),(85,115),(115,118),(128,140),(131,175),(128,212),(106,228),(75,230),(55,215),(50,175),(50,140)],
         farm=[(70,210),(110,212),(114,238),(126,260),(141,270),(144,300),(139,317),(114,320),(99,306),(91,286),(80,264),(72,240)]),
 21: dict(fillc=[(999, (34, 30, 34))], S=(95,128), E=(95,228), H=(128,290), hip=(100,295), K=(92,455), A=(100,548), G=588,
         hipCut=288, uarm=[(60,112),(95,105),(118,112),(122,140),(123,190),(120,228),(100,242),(72,240),(62,215),(58,170),(58,130)],
         farm=[(82,222),(118,222),(122,240),(128,258),(146,268),(151,298),(147,317),(124,321),(112,306),(105,286),(96,264),(84,246)]),
 22: dict(fillc=[(999, (52, 42, 32))], S=(128,120), E=(128,212), H=(172,282), hip=(125,300), K=(102,468), A=(100,552), G=588,
         hipCut=292, uarm=[(98,100),(130,92),(160,102),(166,140),(163,190),(151,222),(122,229),(102,216),(97,170),(95,130)],
         farm=[(108,204),(149,204),(156,225),(163,245),(183,255),(193,285),(189,306),(165,311),(150,296),(140,273),(125,251),(112,229)]),
 23: dict(fillc=[(999, (36, 30, 34))], S=(125,118), E=(122,205), H=(165,285), hip=(122,300), K=(97,455), A=(100,548), G=588,
         hipCut=292, uarm=[(98,100),(130,92),(158,105),(163,140),(161,185),(153,212),(125,219),(106,210),(100,170),(96,130)],
         farm=[(108,200),(148,198),(153,220),(158,240),(178,252),(191,285),(187,309),(165,313),(150,298),(140,275),(126,252),(112,226)]),
 24: dict(S=(114,116), E=(114,212), H=(136,296), hip=(112,300), K=(92,455), A=(94,546), G=588,
         hipCut=292, uarm=[(90,100),(118,92),(140,100),(146,140),(147,190),(144,222),(118,230),(97,222),(90,180),(87,130)],
         farm=[(98,204),(141,204),(146,238),(150,262),(160,276),(171,290),(171,354),(149,356),(140,320),(118,317),(107,292),(100,264),(96,232)]),
 15: dict(S=(112,122), E=(105,238), H=(138,300), hip=(100,298), K=(92,425), A=(90,535), G=586,
         hipCut=288, uarm=[(78,100),(125,96),(142,115),(144,165),(133,205),(125,240),(92,247),(81,220),(73,160)],
         farm=[(87,228),(122,225),(128,247),(140,261),(157,281),(157,317),(140,323),(119,319),(111,296),(99,272),(87,250)]),
}
def polymask(shape, pts):
    m = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return np.array(m)
def build(i, outdir):
    r = R[i]
    im = np.array(Image.open(f'/home/claude/work/s{i}.png').convert('RGBA'))
    h, w = im.shape[:2]
    al = im[:,:,3]
    um = polymask(im.shape, r['uarm']); fm = polymask(im.shape, r['farm'])
    arm = ((um>0)|(fm>0))
    # body without arm: rebuild silhouette edges under the arm
    orig = al > 110
    rest = orig & (~arm)
    ys = np.where(arm.any(1))[0]
    Ls, Rs = {}, {}
    for y in ys:
        xo = np.where(orig[y])[0]; xr = np.where(rest[y])[0]
        if len(xo) == 0: continue
        Lo, Ro = xo.min(), xo.max()
        if len(xr) == 0:
            Ls[y] = Lo + 3; Rs[y] = None; continue
        Lr, Rr = xr.min(), xr.max()
        Ls[y] = (Lo + 3) if (Lo < Lr - 1 or arm[y, max(0, Lr-3):Lr].any()) else Lr
        Rs[y] = None if arm[y, Rr+1:Rr+4].any() or Ro > Rr + 1 else Rr
    # interpolate unknown right edges
    yk = sorted(Rs)
    known = [(y, Rs[y]) for y in yk if Rs[y] is not None]
    # add context rows above/below arm range
    for yy in (ys.min()-2, ys.max()+2):
        xo = np.where(orig[yy])[0]
        if len(xo): known.append((yy, xo.max()))
    known.sort()
    ky_, kv_ = np.array([k[0] for k in known]), np.array([k[1] for k in known])
    for y in yk:
        if Rs[y] is None: Rs[y] = int(np.interp(y, ky_, kv_))
    # smooth
    yk = np.array(yk)
    Larr = np.array([Ls[y] for y in yk], float); Rarr = np.array([Rs[y] for y in yk], float)
    from scipy.ndimage import median_filter, uniform_filter1d
    Larr = uniform_filter1d(median_filter(Larr, 5), 3); Rarr = uniform_filter1d(median_filter(Rarr, 5), 3)
    newal = al.copy().astype(np.float32)
    newal[arm] = 0
    fill = np.zeros_like(arm)
    for y, L, Rr in zip(yk, Larr, Rarr):
        L, Rr = int(round(L)), int(round(Rr))
        if Rr <= L: continue
        fill[y, L:Rr+1] = True
    fill &= (arm | ~orig)
    newal[fill] = 255
    rgb = im[:,:,:3].copy()
    armd = cv2.dilate(arm.astype(np.uint8), np.ones((9,9),np.uint8)) > 0
    valid = (rest & (al > 200) & ~armd).astype(np.uint8)
    valid = cv2.erode(valid, np.ones((3,3),np.uint8))
    dst = np.zeros_like(rgb)
    cv2.xphoto.inpaint(rgb, valid*255, dst, cv2.xphoto.INPAINT_FSR_FAST)
    rgbi = rgb.astype(np.float32)
    hole = fill | arm | (armd & (newal > 0))
    # back-side (left neighbour) fill, blended with FSR result
    lf = dst.astype(np.float32).copy()
    for y in range(h):
        row = hole[y]
        if not row.any(): continue
        xs = np.where(row)[0]
        for x in xs:
            pass
        x = 0
        while x < w:
            if row[x]:
                x0 = x
                while x < w and row[x]: x += 1
                if r.get('fill') == 'R':
                    sx = x + 2
                    vv = valid[y, sx:sx+8].astype(bool)
                    if vv.any():
                        c = rgb[y, sx:sx+8][vv].astype(np.float32).mean(0)
                        lf[y, x0:x] = c
                else:
                    src_x = x0 - 3
                    if src_x >= 0 and valid[y, max(0, src_x-2):src_x+1].any():
                        c = rgb[y, max(0, src_x-4):src_x+1].astype(np.float32).mean(0)
                        lf[y, x0:x] = c
            else:
                x += 1
    if i >= 5:
        lf = cv2.GaussianBlur(lf, (0, 0), sigmaX=5.0, sigmaY=12.0)
        dst = cv2.GaussianBlur((lf * 0.6 + dst.astype(np.float32) * 0.4), (0, 0), sigmaX=2.0, sigmaY=4.0)
    else:
        lf = cv2.GaussianBlur(lf, (0, 0), 3.0)
        dst = (lf * 0.7 + dst.astype(np.float32) * 0.3)
    if r.get('fillc'):
        fc = np.zeros_like(dst, dtype=np.float32)
        for yy in range(h):
            c = next(col for (ye, col) in r['fillc'] if yy < ye)
            fc[yy, :] = c
        fc = cv2.GaussianBlur(fc, (0, 0), 4)
        xg = np.linspace(0.9, 1.04, w)[None, :, None]
        dst = (fc * xg * 0.85 + dst.astype(np.float32) * 0.15) / 0.8
    rgbi[hole] = dst[hole].astype(np.float32) * (0.8 if i >= 5 else 0.85)
    body = np.dstack([rgbi.clip(0,255).astype(np.uint8), newal.clip(0,255).astype(np.uint8)])
    # soft edges for arm cutouts
    def cut(mask, src=im):
        mk = cv2.GaussianBlur(mask.astype(np.float32), (3,3), 0.7)
        out = src.copy(); out[:,:,3] = (src[:,:,3].astype(np.float32)*mk).astype(np.uint8)
        return out
    uarm = cut((um>0).astype(np.float32))
    farm = cut((fm>0).astype(np.float32))
    def rows(src, y0, y1, fade_top=0):
        out = src.copy(); out[:y0,:,3]=0; out[y1:,:,3]=0
        return out
    hc, ky, ay = r['hipCut'], r['K'][1], r['A'][1]
    torso = rows(body, 0, hc+8)
    thigh = rows(body, hc-14, ky+10)
    shin  = rows(body, ky-10, ay+8)
    foot  = rows(body, ay-8, h)
    parts = dict(torso=torso, uarm=uarm, farm=farm, thigh=thigh, shin=shin, foot=foot)
    meta = {k: list(map(int, v)) if isinstance(v, tuple) else v for k, v in r.items() if k not in ('uarm','farm','fill','fillc')}
    meta['parts'] = {}
    for name, p in parts.items():
        a = p[:,:,3]
        yy, xx = np.where(a>8)
        x0, y0, x1, y1 = xx.min(), yy.min(), xx.max()+1, yy.max()+1
        Image.fromarray(p[y0:y1, x0:x1]).save(f'{outdir}/c{i}_{name}.png')
        meta['parts'][name] = [int(x0), int(y0)]
    # full body bbox for reference
    yy, xx = np.where(al>8)
    meta['bbox'] = [int(xx.min()), int(yy.min()), int(xx.max()), int(yy.max())]
    Image.fromarray(body).save(f'{outdir}/c{i}_body.png')
    # debug overlay
    dbg = Image.new('RGBA', (w, h), (120,170,120,255)); dbg.alpha_composite(Image.fromarray(im))
    d = ImageDraw.Draw(dbg)
    d.polygon(r['uarm'], outline=(255,255,0,255)); d.polygon(r['farm'], outline=(0,255,255,255))
    for k in ('S','E','H','hip','K','A'):
        x, y = r[k]; d.ellipse([x-3,y-3,x+3,y+3], fill=(255,0,0,255)); d.text((x+4,y-4), k, fill=(255,0,0,255))
    for yv,c in ((hc,(255,0,255,255)),(r['G'],(0,0,255,255))): d.line([(0,yv),(w,yv)], fill=c)
    dbg2 = Image.new('RGBA', (w, h), (120,170,120,255)); dbg2.alpha_composite(Image.fromarray(body))
    cmb = Image.new('RGBA', (w*2, h)); cmb.paste(dbg, (0,0)); cmb.paste(dbg2, (w,0))
    cmb.crop((40,0,w*2-40,h)).resize(((w*2-80)*2//2, h)).save(f'/home/claude/work/dbg{i}.png')
    return meta
if __name__ == '__main__':
    out = '/home/claude/work/rig'
    ids = [int(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 else [1,2,3,4]
    try: meta = {int(k): v for k, v in json.load(open(f'{out}/meta.json')).items()}
    except Exception: meta = {}
    for i in ids: meta[i] = build(i, out)
    json.dump({str(k): meta[k] for k in sorted(meta)}, open(f'{out}/meta.json','w'), indent=1)
    ims = [Image.open(f'/home/claude/work/dbg{i}.png') for i in ids]
    W = Image.new('RGBA', (sum(m.width for m in ims), ims[0].height))
    x = 0
    for m in ims: W.paste(m, (x,0)); x += m.width
    W.save('/home/claude/work/dbg_all.png')

def hulls():
    meta = json.load(open('/home/claude/work/rig/meta.json'))
    for i in sorted(meta):
        m = meta[i]; m['hull'] = {}
        for part, (x0, y0) in m['parts'].items():
            a = np.array(Image.open(f'/home/claude/work/rig/c{i}_{part}.png'))[:,:,3]
            pts = cv2.findNonZero((a > 100).astype(np.uint8))
            hull = cv2.convexHull(pts)
            hull = cv2.approxPolyDP(hull, 2.5, True).reshape(-1, 2)
            m['hull'][part] = [[int(x + x0), int(y + y0)] for x, y in hull]
    json.dump(meta, open('/home/claude/work/rig/meta.json', 'w'))
    print({i: {p: len(h) for p, h in meta[i]['hull'].items()} for i in meta})

def c4_fix():
    meta = json.load(open('/home/claude/work/rig/meta.json'))
    m = meta['4']
    body = np.array(Image.open('/home/claude/work/rig/c4_body.png').convert('RGBA'))
    h, w = body.shape[:2]
    hc = m['hipCut']; ky = m['K'][1]; ay = m['A'][1]
    lum = body[:,:,:3].astype(np.float32).mean(2)
    # skirt: coat below waist
    sk = body.copy(); sk[:hc-6,:,3] = 0; sk[441:,:,3] = 0
    yy, xx = np.mgrid[0:h, 0:w]
    trou = (yy > 392) & (xx >= 64) & (xx <= 134) & (lum < 75)
    sk[trou, 3] = 0
    # shin: trousers only near top rows
    sh = body.copy(); sh[:ky-10,:,3] = 0; sh[ay+8:,:,3] = 0
    cut = (yy < ky + 2) & ((xx < 62) | (xx > 134)); sh[cut, 3] = 0
    # synthetic thigh from trouser texture
    src = body[452:500, 68:128].copy()
    th_h = (ky + 10) - (hc - 14)
    tex = np.array(Image.fromarray(src).resize((62, th_h), Image.BICUBIC))
    tex[:,:,3] = np.where(tex[:,:,3] > 40, 255, 0).astype(np.uint8)
    tex[:,:2,3] = 120; tex[:,-2:,3] = 120
    th = np.zeros_like(body); x0 = 104 - 31
    th[hc-14:hc-14+th_h, x0:x0+62] = tex
    for name, p in (('skirt', sk), ('shin', sh), ('thigh', th)):
        a = p[:,:,3]; ys, xs = np.where(a > 8)
        X0, Y0, X1, Y1 = xs.min(), ys.min(), xs.max()+1, ys.max()+1
        Image.fromarray(p[Y0:Y1, X0:X1]).save(f'/home/claude/work/rig/c4_{name}.png')
        m['parts'][name] = [int(X0), int(Y0)]
    json.dump(meta, open('/home/claude/work/rig/meta.json', 'w'))
