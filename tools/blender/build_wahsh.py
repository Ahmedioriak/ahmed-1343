# Builds الوحش in Blender (headless bpy): MakeHuman CC0 base mesh shaped muscular, his clothes, his face, a full skeleton.
import bpy, bmesh, json, math, sys, os
for _o in list(bpy.data.objects): bpy.data.objects.remove(_o, do_unlink=True)
import numpy as np
from mathutils import Vector, Matrix

D = '/home/claude/mh/makehuman/data'
OUT = '/home/claude/b3d'
FACE_IMG = '/home/claude/work/p2.png'

# ---------- the base mesh ----------
V, VT, F, G = [], [], [], []
cur = None
for ln in open(f'{D}/3dobjs/base.obj'):
    if ln.startswith('v '): V.append([float(x) for x in ln.split()[1:4]])
    elif ln.startswith('vt '): VT.append([float(x) for x in ln.split()[1:3]])
    elif ln.startswith('g '): cur = ln.split()[1]
    elif ln.startswith('f '):
        vs = [p.split('/') for p in ln.split()[1:]]
        F.append(([int(a[0]) - 1 for a in vs], [int(a[1]) - 1 if len(a) > 1 and a[1] else -1 for a in vs])); G.append(cur)
V = np.array(V)

def target(name, w):
    global V
    for ln in open(f'{D}/targets/{name}.target'):
        if ln.startswith('#') or not ln.strip(): continue
        p = ln.split(); i = int(p[0]); V[i] += w * np.array([float(p[1]), float(p[2]), float(p[3])])

# a big, strong, athletic man (الوحش = «عضلات من حديد»)
target('macrodetails/universal-male-young-maxmuscle-averageweight', 0.7)
target('macrodetails/universal-male-young-maxmuscle-maxweight', 0.3)
target('macrodetails/caucasian-male-young', 0.55); target('macrodetails/african-male-young', 0.2); target('macrodetails/asian-male-young', 0.25)
target('macrodetails/height/male-young-maxmuscle-averageweight-maxheight', 0.35)
for t, w in ([('torso/torso-vshape-incr', 0.8), ('torso/torso-muscle-pectoral-incr', 0.6), ('torso/torso-muscle-dorsi-incr', 0.6), ('torso/torso-scale-horiz-incr', 0.3), ('torso/torso-scale-depth-incr', 0.25)]
    + [(f'armslegs/{s_}-{p}-muscle-incr', w_) for s_ in 'lr' for p, w_ in [('upperarm', 1.0), ('lowerarm', 0.8), ('upperarm-shoulder', 1.0), ('upperleg', 0.6), ('lowerleg', 0.6)]]
    + [(f'armslegs/{s_}-{p}-scale-horiz-incr', w_) for s_ in 'lr' for p, w_ in [('upperarm', 0.45), ('lowerarm', 0.3)]]
    + [(f'armslegs/{s_}-{p}-scale-depth-incr', w_) for s_ in 'lr' for p, w_ in [('upperarm', 0.45), ('lowerarm', 0.3)]]):
    try: target(t, w)
    except FileNotFoundError: print('no', t)

# ---------- skeleton joints ----------
SK = json.load(open(f'{D}/rigs/default.mhskel'))
J = {k: V[idx].mean(0) for k, idx in SK['joints'].items()}
W = json.load(open(f'{D}/rigs/default_weights.mhw'))['weights']

# MakeHuman is y-up (decimetres); Blender is z-up (metres): the man faces -Y
def cv(p): return Vector((p[0] * 0.1, -p[2] * 0.1, p[1] * 0.1))

# ---------- keep the body (no helpers) ----------
keep = [i for i, g in enumerate(G) if g == 'body']
used = sorted({v for i in keep for v in F[i][0]})
remap = {v: n for n, v in enumerate(used)}

# ---------- build the mesh ----------
me = bpy.data.meshes.new('wahsh');
me.from_pydata([cv(V[v]) for v in used], [], [[remap[v] for v in F[i][0]] for i in keep])
me.update()
uv = me.uv_layers.new(name='UVMap')
for poly, fi in zip(me.polygons, keep):
    for li, ti in zip(poly.loop_indices, F[fi][1]):
        if ti >= 0: uv.data[li].uv = VT[ti]
ob = bpy.data.objects.new('Wahsh', me); bpy.context.scene.collection.objects.link(ob)
NV = len(me.vertices)
co = np.array([v.co[:] for v in me.vertices]); nrm = np.array([v.normal[:] for v in me.vertices])
zs = co[:, 2]; zmin, zmax = zs.min(), zs.max(); Hh = zmax - zmin
NB = [[] for _ in range(NV)]
for e in me.edges: i, j = e.vertices; NB[i].append(j); NB[j].append(i)

# ---------- clothing regions: summed skin weights (smooth edges, not jagged) ----------
REG = ['skin', 'vest', 'pants', 'boot', 'glove', 'head', 'belt']
def region(b):
    if b.startswith(('upperarm', 'lowerarm')): return 'skin'
    if b.startswith(('wrist', 'metacarpal')) or (b.startswith('finger') and b.split('-')[1].startswith('1')): return 'glove'
    if b.startswith('finger'): return 'skin'
    if b.startswith(('spine', 'clavicle', 'breast', 'shoulder')): return 'vest'
    if b.startswith(('upperleg', 'lowerleg01', 'pelvis', 'root')): return 'pants'
    if b.startswith(('lowerleg02', 'foot', 'toe')): return 'boot'
    if b.startswith('neck'): return 'skin'
    return 'head'
RS = np.zeros((NV, len(REG)))
for bn, L in W.items():
    ri = REG.index(region(bn))
    for vi, w in L:
        if vi in remap: RS[remap[vi], ri] += w
RS[RS.sum(1) == 0, REG.index('head')] = 1
RS /= RS.sum(1, keepdims=True)
# smooth the weights a little over the mesh so borders are soft curves
for _ in range(4): RS = 0.5 * RS + 0.5 * np.array([RS[NB[n]].mean(0) for n in range(NV)])
I = {r: REG.index(r) for r in REG}
def J3(k): return cv(J[k])
neck = J3(SK['bones']['neck01']['head']); zV = neck.z - 0.25
wristL = J3(SK['bones']['wrist.L']['head']); wristR = J3(SK['bones']['wrist.R']['head'])
zBelt = zmin + 0.575 * Hh; BW = 0.06                      # top of the trousers / belt width
torso = RS[:, I['vest']] + RS[:, I['pants']]
# rest-pose masks stored on the vertices (they ride along with the skin when he moves)
xr, zr = co[:, 0].copy(), co[:, 2].copy()
vn = (0.012 + 0.10 * (zr - zV) / (neck.z - zV)) - np.abs(xr)                     # >0 inside the V-neck opening
vn = np.where((zr > zV) & (nrm[:, 1] < 0.1), vn, -0.2)
wr = 0.085 - np.minimum(np.linalg.norm(co - np.array(wristL), axis=1), np.linalg.norm(co - np.array(wristR), axis=1))  # >0 wrist wrap
def sstep(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
vestW = torso * sstep(zBelt - 0.01, zBelt + 0.01, zr)
pantsW = RS[:, I['pants']] + RS[:, I['vest']] * (1 - sstep(zBelt - 0.01, zBelt + 0.01, zr))
beltW = torso * sstep(zBelt - BW - 0.01, zBelt - BW + 0.01, zr) * (1 - sstep(zBelt - 0.005, zBelt + 0.005, zr))
bootW = RS[:, I['boot']]; gloveW = np.maximum(RS[:, I['glove']], sstep(-0.01, 0.01, wr) * RS[:, I['skin']])
vr = RS.argmax(1)
def R(n): return REG[vr[n]]

# boots: melt the toes into one boot shape (strong laplacian smoothing on the feet)
footz = zmin + 0.085 * Hh
fm = np.where((bootW > 0.5) & (zr < footz), 1.0, 0.0)
for _ in range(4): fm = np.maximum(fm, 0.5 * np.array([fm[NB[n]].max() for n in range(NV)]))
for it in range(160):   # Taubin smoothing: melts the toes without shrinking the boot into a point
    av = np.array([co[NB[n]].mean(0) for n in range(NV)])
    co = co + (av - co) * ((0.6 if it % 2 == 0 else -0.63) * fm)[:, None]
for n, v in enumerate(me.vertices): v.co = co[n]
me.update(); nrm = np.array([v.normal[:] for v in me.vertices])
# clothes have thickness: a soft blend of how far each region sits off the skin
zn = (zr - zmin) / Hh
pantsP = 0.024 + 0.032 * np.clip((0.48 - zn) / 0.2, 0, 1) * (zn > 0.2)
push = vestW * (1 - sstep(-0.004, 0.004, vn)) * 0.012 + pantsW * pantsP + beltW * 0.018 + bootW * (0.022 + 0.014 * (zn < 0.05)) + gloveW * 0.010
for _ in range(3): push = 0.5 * push + 0.5 * np.array([push[NB[n]].mean() for n in range(NV)])
co = co + nrm * push[:, None]
for n, v in enumerate(me.vertices): v.co = co[n]
for k, arr in [('xr', xr), ('zr', zr), ('vn', vn), ('vestW', vestW), ('pantsW', pantsW), ('beltW', beltW), ('bootW', bootW), ('gloveW', gloveW)]:
    at_ = me.attributes.new(k, 'FLOAT', 'POINT'); at_.data.foreach_set('value', arr.astype(np.float32))
for poly in me.polygons:
    hs = sum(1 for i in poly.vertices if R(i) == 'head'); poly.material_index = 1 if hs * 2 > len(poly.vertices) else 0; poly.use_smooth = True
vreg = {used[n]: R(n) for n in range(NV)}

# ---------- materials ----------
SKIN = (0.36, 0.2, 0.12)
RED = (0.2, 0.006, 0.01)
BLACK = (0.02, 0.019, 0.022)
def mat(name, col, rough=0.5, metal=0.0, sss=0.0, sheen=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; bs = m.node_tree.nodes['Principled BSDF']
    bs.inputs['Base Color'].default_value = (*col, 1); bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal
    if sss:
        try: bs.inputs['Subsurface Weight'].default_value = sss; bs.inputs['Subsurface Radius'].default_value = (0.9, 0.35, 0.2)
        except Exception: pass
    if sheen:
        try: bs.inputs['Sheen Weight'].default_value = sheen
        except Exception: pass
    return m
def bump(m, scale, strength):
    nt = m.node_tree; bs = nt.nodes['Principled BSDF']
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = scale; nz.inputs['Detail'].default_value = 8
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], bs.inputs['Normal'])
# one body material: every part of the outfit is a crisp threshold on the stored masks
mbody = mat('body', SKIN, 0.42, sss=0.12); bump(mbody, 260, 0.06)
nt = mbody.node_tree; bs = nt.nodes['Principled BSDF']; NN = nt.nodes; LK = nt.links
def A(name): n = NN.new('ShaderNodeAttribute'); n.attribute_name = name; n.attribute_type = 'GEOMETRY'; return n.outputs['Fac']
def M(op, a, b=None):
    n = NN.new('ShaderNodeMath'); n.operation = op
    for k, x in enumerate((a, b)):
        if x is None: continue
        if isinstance(x, (int, float)): n.inputs[k].default_value = x
        else: LK.new(x, n.inputs[k])
    return n.outputs[0]
def gt(x, v): return M('GREATER_THAN', x, v)
def lt(x, v): return M('LESS_THAN', x, v)
def AND(*xs):
    r = xs[0]
    for x in xs[1:]: r = M('MULTIPLY', r, x)
    return r
def NOT(x): return M('SUBTRACT', 1.0, x)
col = None; rough = None
def layer(mask, c, r):
    global col, rough
    m1 = NN.new('ShaderNodeMix'); m1.data_type = 'RGBA'; LK.new(mask, m1.inputs['Factor'])
    if col is None: m1.inputs['A'].default_value = (*SKIN, 1)
    else: LK.new(col, m1.inputs['A'])
    m1.inputs['B'].default_value = (*c, 1); col = m1.outputs['Result']
    m2 = NN.new('ShaderNodeMix'); m2.data_type = 'FLOAT'; LK.new(mask, m2.inputs['Factor'])
    if rough is None: m2.inputs['A'].default_value = 0.42
    else: LK.new(rough, m2.inputs['A'])
    m2.inputs['B'].default_value = r; rough = m2.outputs['Result']
vestW, pantsW, beltW, bootW, gloveW, vnA, xrA, zrA = [A(k) for k in ('vestW', 'pantsW', 'beltW', 'bootW', 'gloveW', 'vn', 'xr', 'zr')]
vest = AND(gt(vestW, 0.5), lt(vnA, 0.0))
layer(vest, BLACK, 0.55)                                                     # leather vest
layer(AND(vest, M('MAXIMUM', lt(vestW, 0.6), gt(vnA, -0.014))), RED, 0.5)     # red piping on every edge
layer(AND(vest, lt(M('ABSOLUTE', xrA), 0.004), lt(zrA, zV)), (0.5, 0.5, 0.52), 0.25)   # zip
pants = gt(pantsW, 0.5)
layer(pants, (0.022, 0.022, 0.026), 0.85)                                    # baggy trousers
belt = gt(beltW, 0.5)
layer(belt, RED, 0.55)                                                       # red belt
layer(AND(belt, lt(M('ABSOLUTE', xrA), 0.035), gt(zrA, zBelt - BW + 0.008), lt(zrA, zBelt - 0.008)), (0.55, 0.55, 0.58), 0.2)  # buckle
boot = gt(bootW, 0.5)
layer(boot, (0.014, 0.013, 0.014), 0.4)                                     # boots
layer(AND(boot, gt(zrA, zmin + 0.2 * Hh), lt(zrA, zmin + 0.212 * Hh)), RED, 0.4)
layer(AND(boot, lt(zrA, zmin + 0.01 * Hh)), (0.05, 0.05, 0.05), 0.8)        # sole
layer(gt(gloveW, 0.5), (0.03, 0.026, 0.028), 0.55)                           # fingerless gloves
LK.new(col, bs.inputs['Base Color']); LK.new(rough, bs.inputs['Roughness'])
mvest = mat('vestcloth', BLACK, 0.45); bump(mvest, 180, 0.1)
mbelt = mat('sash', RED, 0.65); bump(mbelt, 220, 0.08)

# the head: his face projected from the front photo, short black hair on top and back
hm = bpy.data.materials.new('head'); hm.use_nodes = True; nt = hm.node_tree; bs = nt.nodes['Principled BSDF']
bs.inputs['Roughness'].default_value = 0.5
img = bpy.data.images.load(FACE_IMG)
tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.extension = 'EXTEND'
uvn = nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map = 'FaceUV'; nt.links.new(uvn.outputs['UV'], tex.inputs['Vector'])
att = nt.nodes.new('ShaderNodeAttribute'); att.attribute_name = 'facew'; att.attribute_type = 'GEOMETRY'
hair = nt.nodes.new('ShaderNodeAttribute'); hair.attribute_name = 'hairw'; hair.attribute_type = 'GEOMETRY'
m1 = nt.nodes.new('ShaderNodeMix'); m1.data_type = 'RGBA'; m1.inputs['A'].default_value = (*SKIN, 1)
nt.links.new(att.outputs['Fac'], m1.inputs['Factor']); nt.links.new(tex.outputs['Color'], m1.inputs['B'])
m2 = nt.nodes.new('ShaderNodeMix'); m2.data_type = 'RGBA'; m2.inputs['B'].default_value = (0.018, 0.014, 0.012, 1)
nt.links.new(hair.outputs['Fac'], m2.inputs['Factor']); nt.links.new(m1.outputs['Result'], m2.inputs['A']); nt.links.new(m2.outputs['Result'], bs.inputs['Base Color'])
for m in [mbody, hm]: me.materials.append(m)

# face UV: an orthographic projection from the front, eyes mapped onto the photo's eyes
EY_L, EY_R = cv(J['eye.L____head']) if 'eye.L____head' in J else None, cv(J['eye.R____head']) if 'eye.R____head' in J else None
PX_L, PX_R = (452, 202), (568, 202)          # the eyes in the portrait (pixels)
Iw, Ih = img.size
# mesh eye.R is the man's right = image left
ex0, ex1 = EY_R.x, EY_L.x; ez = (EY_L.z + EY_R.z) / 2
sx = (PX_R[0] - PX_L[0]) / (ex1 - ex0)
fuv = me.uv_layers.new(name='FaceUV')
cof = np.array([v.co[:] for v in me.vertices])
for poly in me.polygons:
    for li, vi in zip(poly.loop_indices, poly.vertices):
        x, y, z = cof[vi]; px = PX_L[0] + (x - ex0) * sx; py = PX_L[1] - (z - ez) * sx
        fuv.data[li].uv = (px / Iw, 1 - py / Ih)
# where the photo is used (front of the face) and where the hair is
fw = me.attributes.new('facew', 'FLOAT', 'POINT'); hw = me.attributes.new('hairw', 'FLOAT', 'POINT')
head_c = cv(J['head____head']) if 'head____head' in J else Vector((0, 0, zmax - 0.12))
for n, v in enumerate(me.vertices):
    if vreg[used[n]] != 'head': continue
    x, y, z = v.co; nn = v.normal
    front = max(0.0, -nn.y)                                   # facing the camera (-Y)
    dz = (z - ez) / (0.01 * 10)                               # around the eyes
    f = min(1.0, max(0.0, (front - 0.35) / 0.35)) * (1.0 if -1.25 < (z - ez) / 0.1 < 0.62 else 0.0) * (1.0 if abs(x - (ex0 + ex1) / 2) < 0.075 else 0.0)
    fw.data[n].value = f
    top = (z - ez) / 0.1
    hw.data[n].value = 1.0 if (top > 0.45 and not (front > 0.75 and top < 0.62)) or (front < 0.15 and top > -0.3 and nn.y > 0.2) else 0.0

# ---------- armature ----------
arm = bpy.data.armatures.new('rig'); ao = bpy.data.objects.new('Rig', arm); bpy.context.scene.collection.objects.link(ao)
bpy.context.view_layer.objects.active = ao; bpy.ops.object.mode_set(mode='EDIT')
EB = {}
for name, b in SK['bones'].items():
    eb = arm.edit_bones.new(name); eb.head = cv(J[b['head']]); eb.tail = cv(J[b['tail']])
    if (eb.tail - eb.head).length < 1e-4: eb.tail = eb.head + Vector((0, 0, 0.01))
    EB[name] = eb
for name, b in SK['bones'].items():
    if b['parent']: EB[name].parent = EB[b['parent']]; EB[name].use_connect = False
    pl = SK['planes'].get(b.get('rotation_plane') or '')
    if pl:
        a, bb, c = [cv(J[k]) for k in pl]; nrm_ = (bb - a).cross(c - bb)
        if nrm_.length > 1e-6: EB[name].align_roll(nrm_.normalized())
bpy.ops.object.mode_set(mode='OBJECT')
# skin weights
for name, L in W.items():
    vg = ob.vertex_groups.new(name=name)
    for vi, w in L:
        if vi in remap: vg.add([remap[vi]], w, 'REPLACE')
mod = ob.modifiers.new('Armature', 'ARMATURE'); mod.object = ao; ob.parent = ao
sub = ob.modifiers.new('Sub', 'SUBSURF'); sub.levels = 1; sub.render_levels = 1

# ---------- accessories: the hood bunched behind the neck, the red sash on his left hip ----------
from mathutils.kdtree import KDTree
kd = KDTree(NV)
for n, v in enumerate(me.vertices): kd.insert(v.co, n)
kd.balance()
VGW = [{} for _ in range(NV)]
for vg in ob.vertex_groups: pass
gidx = {g.index: g.name for g in ob.vertex_groups}
for n, v in enumerate(me.vertices):
    for g in v.groups: VGW[n][gidx[g.group]] = g.weight
def skin_to_body(o, nearest=4):
    for n, v in enumerate(o.data.vertices):
        acc_ = {}
        hits = kd.find_n(v.co, nearest); tw = 0
        for _, i, d in hits:
            w = 1 / (d + 1e-3); tw += w
            for k, x in VGW[i].items(): acc_[k] = acc_.get(k, 0) + w * x
        for k, x in acc_.items():
            g = o.vertex_groups.get(k) or o.vertex_groups.new(name=k); g.add([n], x / tw, 'REPLACE')
    m_ = o.modifiers.new('Armature', 'ARMATURE'); m_.object = ao; o.parent = ao
    s_ = o.modifiers.new('Sub', 'SUBSURF'); s_.levels = 1; s_.render_levels = 2
def body_y(x, z, side=-1):
    """front (side=-1) or back surface y of the body near (x, z)"""
    best = None
    for p, i, d in kd.find_range(Vector((x, 0, z)), 0.6):
        if abs(p.x - x) < 0.025 and abs(p.z - z) < 0.025:
            if best is None or (p.y < best if side < 0 else p.y > best): best = p.y
    return best
# hood: a thick rolled collar of cloth round the back and sides of the neck
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=12, radius=1.0)
sp = [J3(SK['bones']['neck01']['head']), J3(SK['bones']['neck01']['tail'])]
nc = sp[0] * 0.75 + sp[1] * 0.25
for v in bm.verts:
    a_ = math.atan2(v.co.y, v.co.x); t_ = v.co.z
    R_ = 0.105 + 0.045 * math.cos(math.asin(max(-1, min(1, t_))))
    rr = math.sqrt(max(0, 1 - t_ * t_))
    v.co = Vector((math.cos(a_) * (0.10 + 0.04 * rr) * 1.25, math.sin(a_) * (0.10 + 0.04 * rr) + 0.035, t_ * 0.05))
drop = [v for v in bm.verts if v.co.y < -0.02 and abs(v.co.x) < 0.10]
bmesh.ops.delete(bm, geom=drop, context='VERTS')
for v in bm.verts:
    v.co = v.co + nc + Vector((0, 0.02, -0.045 + 0.06 * max(0, v.co.y) / 0.15))
hm_ = bpy.data.meshes.new('hood'); bm.to_mesh(hm_); bm.free()
hood = bpy.data.objects.new('Hood', hm_); bpy.context.scene.collection.objects.link(hood)
hm_.materials.append(mvest)
for p in hm_.polygons: p.use_smooth = True
skin_to_body(hood, 6)
# sash: a strip of red cloth knotted at the belt, hanging down his left thigh
beltz = zBelt - BW / 2
bm = bmesh.new(); rows = []
for k in range(15):
    t = k / 14; z = beltz - t * 0.55; x0 = 0.115 + 0.03 * t
    row = []
    for j, dx in enumerate((-0.045 - 0.01 * t, 0.0, 0.045 + 0.01 * t)):
        x = x0 + dx; y = body_y(x, z) if z > zmin + 0.35 * Hh else None
        py = rows[-1][j].co.y + 0.03 + 0.02 * t if rows else None
        if y is None: y = py if py is not None else -0.15
        elif py is not None: y = max(py - 0.025, min(py + 0.01, y))
        row.append(bm.verts.new((x, y - 0.03 - 0.02 * t, z)))
    rows.append(row)
for k in range(14):
    for j in range(2): bm.faces.new((rows[k][j], rows[k][j + 1], rows[k + 1][j + 1], rows[k + 1][j]))
# the knot
bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=0.04, matrix=Matrix.Translation((0.115, (body_y(0.115, beltz) or -0.15) - 0.035, beltz)))
sm = bpy.data.meshes.new('sash'); bm.to_mesh(sm); bm.free()
sash = bpy.data.objects.new('Sash', sm); bpy.context.scene.collection.objects.link(sash); sm.materials.append(mbelt)
sol = sash.modifiers.new('Thick', 'SOLIDIFY'); sol.thickness = 0.008
for p in sm.polygons: p.use_smooth = True
skin_to_body(sash, 6)
bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/wahsh.blend')
print('verts', len(me.vertices), 'height m', Hh, 'eyes', EY_L, EY_R)
