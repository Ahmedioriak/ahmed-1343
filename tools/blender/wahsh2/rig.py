# Step 2-4: armature (deform bones + leg IK controls), automatic weights, clean-up of the weights.
import bpy, math, numpy as np
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath='/home/claude/rig/work/wahsh_mesh.blend')
ob = bpy.data.objects['Wahsh']; me = ob.data
# ---- the fists rest against the hips and the model came fused there: cut those bridges so the arms can move freely ----
import bmesh
P0 = np.array([v.co[:] for v in me.vertices]); E = np.array([e.vertices[:] for e in me.edges])
def dseg(Q, a, b):
    a = np.array(a); b = np.array(b); t = np.clip(((Q - a) @ (b - a)) / ((b - a) @ (b - a)), 0, 1); return np.linalg.norm(Q - (a + t[:, None] * (b - a)), axis=1)
xs0 = np.abs(P0[:, 0]); z0 = P0[:, 2]; Qm = P0 * (np.sign(P0[:, 0])[:, None] * np.array([1, 0, 0]) + np.array([0, 1, 1]))
sure_arm = ((xs0 > 0.245) & (z0 > 1.075) & (z0 < 1.325)) | ((z0 <= 1.075) & (dseg(Qm, (0.36, -0.03, 1.06), (0.34, -0.08, 0.95)) < 0.055))
sure_body = ((xs0 < 0.21) | (z0 < 0.895) | (z0 >= 1.325)) & ~sure_arm
lab = np.where(sure_arm, 1.0, 0.0); free = ~(sure_arm | sure_body); deg = np.zeros(len(P0)); np.add.at(deg, E[:, 0], 1); np.add.at(deg, E[:, 1], 1)
lab[free] = 0.5
for _ in range(600):      # labels spread over the surface; the split lands on the thin neck where fist and hip touch
    acc = np.zeros(len(P0)); np.add.at(acc, E[:, 0], lab[E[:, 1]]); np.add.at(acc, E[:, 1], lab[E[:, 0]]); lab[free] = (acc / np.maximum(deg, 1))[free]
armmask = lab > 0.5; print('arm verts', int(armmask.sum()), 'undecided', int(free.sum()))
bm = bmesh.new(); bm.from_mesh(me); L = bm.verts.layers.int.new('is_arm')
for v in bm.verts: v[L] = int(armmask[v.index])
bad = [f for f in bm.faces if len({v[L] for v in f.verts}) == 2]
print('bridge faces cut', len(bad)); bmesh.ops.delete(bm, geom=bad, context='FACES')
holes = [e for e in bm.edges if e.is_boundary]; bmesh.ops.holes_fill(bm, edges=holes, sides=12)
bm.to_mesh(me); bm.free(); me.update()
for p in me.polygons: p.use_smooth = True
# ---- joints (metres; he faces -Y, his left is +X) ----
J = {
 'root': ((0, 0, 0), (0, 0.25, 0), None),
 'pelvis': ((0, 0.01, 0.98), (0, 0.01, 1.10), 'root'),
 'spine_01': ((0, 0.01, 1.10), (0, 0.015, 1.24), 'pelvis'),
 'spine_02': ((0, 0.015, 1.24), (0, 0.025, 1.38), 'spine_01'),
 'chest': ((0, 0.025, 1.38), (0, 0.04, 1.62), 'spine_02'),
 'neck': ((0, 0.04, 1.62), (0, 0.02, 1.74), 'chest'),
 'head': ((0, 0.02, 1.74), (0, 0.0, 1.97), 'neck'),
 'clavicle.L': ((0.03, 0.03, 1.58), (0.235, 0.045, 1.585), 'chest'),
 'upperarm.L': ((0.235, 0.045, 1.585), (0.325, 0.05, 1.275), 'clavicle.L'),
 'forearm.L': ((0.325, 0.05, 1.275), (0.36, -0.03, 1.055), 'upperarm.L'),
 'hand.L': ((0.36, -0.03, 1.055), (0.345, -0.07, 0.915), 'forearm.L'),
 'thigh.L': ((0.115, 0.01, 0.96), (0.205, 0.0, 0.53), 'pelvis'),
 'shin.L': ((0.205, 0.0, 0.53), (0.262, 0.04, 0.13), 'thigh.L'),
 'foot.L': ((0.262, 0.04, 0.13), (0.285, -0.10, 0.035), 'shin.L'),
 'toe.L': ((0.285, -0.10, 0.035), (0.295, -0.20, 0.03), 'foot.L'),
 'sash_01': ((0.085, -0.165, 1.0), (0.09, -0.175, 0.87), 'pelvis'),
 'sash_02': ((0.09, -0.175, 0.87), (0.095, -0.18, 0.75), 'sash_01'),
 'sash_03': ((0.095, -0.18, 0.75), (0.10, -0.175, 0.62), 'sash_02'),
}
CONNECT = {'spine_01', 'spine_02', 'chest', 'neck', 'head', 'upperarm.L', 'forearm.L', 'hand.L', 'shin.L', 'foot.L', 'toe.L', 'sash_02', 'sash_03'}
arm = bpy.data.armatures.new('WahshRig'); rig = bpy.data.objects.new('Rig', arm); bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='EDIT'); EB = arm.edit_bones
for n, (h, t, p) in J.items():
    b = EB.new(n); b.head = h; b.tail = t
    if p: b.parent = EB[p]; b.use_connect = n in CONNECT
# forearm twist: carries the wrist's turn up the forearm so the skin does not pinch
fa = EB['forearm.L']; tw = EB.new('forearm_twist.L'); tw.head = fa.head.lerp(fa.tail, 0.5); tw.tail = fa.tail; tw.parent = fa
# rolls: bend axes face the right way (knees forward, elbows back)
for n in ['thigh.L', 'shin.L', 'foot.L', 'toe.L', 'upperarm.L', 'forearm.L', 'forearm_twist.L', 'hand.L', 'pelvis', 'spine_01', 'spine_02', 'chest', 'neck', 'head', 'sash_01', 'sash_02', 'sash_03']: EB[n].align_roll(Vector((0, -1, 0)))
EB['clavicle.L'].align_roll(Vector((0, 0, 1))); EB['root'].align_roll(Vector((0, 0, 1)))
for b in EB: b.select = b.select_head = b.select_tail = b.name.endswith('.L')
bpy.ops.armature.symmetrize()
# ---- controls (no deform): IK foot targets + knee poles ----
for sd, sx in (('L', 1), ('R', -1)):
    f = EB['foot.' + sd]; c = EB.new('foot_ik.' + sd); c.head = f.head; c.tail = f.tail; c.roll = f.roll; c.parent = EB['root']
    k = EB['shin.' + sd].head; pl = EB.new('knee_pole.' + sd); pl.head = k + Vector((0, -0.7, 0)); pl.tail = pl.head + Vector((0, -0.12, 0)); pl.parent = EB['root']
bpy.ops.object.mode_set(mode='OBJECT')
for b in arm.bones: b.use_deform = not (b.name == 'root' or b.name.startswith(('foot_ik', 'knee_pole')))
# ---- bind with automatic weights ----
for o in bpy.data.objects: o.select_set(False)
ob.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
print('groups', len(ob.vertex_groups), 'unweighted', sum(1 for v in me.vertices if not v.groups))
# ---- weight clean-up ----
G = {g.name: g.index for g in ob.vertex_groups}; names = [g.name for g in ob.vertex_groups]; NV = len(me.vertices)
Wt = np.zeros((NV, len(names))); P = np.array([v.co[:] for v in me.vertices])
for v in me.vertices:
    for g in v.groups: Wt[v.index, g.group] = g.weight
x, y, z = P[:, 0], P[:, 1], P[:, 2]
ISARM = np.array([d.value for d in me.attributes['is_arm'].data]) > 0
col = lambda pre: [i for i, n in enumerate(names) if n.startswith(pre)]
ARM = lambda s: [G[n + s] for n in ('upperarm', 'forearm', 'forearm_twist', 'hand')]
LEG = lambda s: [G[n + s] for n in ('thigh', 'shin', 'foot', 'toe')]
TORSO = [G[n] for n in ('pelvis', 'spine_01', 'spine_02', 'chest', 'neck', 'head')] + col('sash')
for s, sg in (('.L', 1), ('.R', -1)):
    xs = x * sg; other = '.R' if s == '.L' else '.L'
    armv = ISARM & (xs > 0)                                                                            # the hanging arm, below the armpit
    keep = ARM(s); drop = [i for i in range(len(names)) if i not in keep]
    Wt[np.ix_(armv, drop)] = 0
    Wt[armv & (Wt.sum(1) == 0), G['forearm' + s]] = 1
    body = ~armv & (z < 1.30) & (xs > 0)                                                               # body next to that arm: no arm bones
    Wt[np.ix_(body, [G['forearm' + s], G['forearm_twist' + s], G['hand' + s]])] = 0
    Wt[np.ix_(body & (z < 1.2), [G['upperarm' + s]])] = 0
    Wt[np.ix_(xs > 0.02, ARM(other) + LEG(other) + [G['clavicle' + other]])] = 0                       # nothing from the other side
    Wt[np.ix_((z < 0.80) & (xs > 0), TORSO[1:])] = 0
    # forearm twist takes over smoothly towards the wrist
    fa, tw = G['forearm' + s], G['forearm_twist' + s]; a = np.array(J['forearm.L'][0]) * (sg, 1, 1); b = np.array(J['forearm.L'][1]) * (sg, 1, 1)
    t = np.clip(((P - a) @ (b - a)) / ((b - a) @ (b - a)), 0, 1); tot = Wt[:, fa] + Wt[:, tw]; k = np.clip((t - 0.25) / 0.6, 0, 1)
    Wt[:, tw] = tot * k; Wt[:, fa] = tot * (1 - k)
# sash: only the cloth strip in front of his left hip follows the sash bones, loosening towards its end
sash = (x > 0.035) & (x < 0.15) & (y < -0.135) & (z < 1.0) & (z > 0.55)
sc = col('sash'); Wt[np.ix_(~sash, sc)] = 0
zz = z[sash]; w3 = np.clip((0.76 - zz) / 0.1, 0, 1); w2 = np.clip((0.90 - zz) / 0.1, 0, 1) - w3; w1 = np.clip((0.99 - zz) / 0.06, 0, 1) - w2 - w3
free = np.clip((1.0 - zz) / 0.1, 0, 1); rows = np.where(sash)[0]
Wt[rows] *= (1 - free)[:, None]
for wv, n in ((w1, 'sash_01'), (w2, 'sash_02'), (w3, 'sash_03')): Wt[rows, G[n]] = np.clip(wv, 0, 1) * free
# anything with no weight follows the nearest weighted neighbour; limit to 4 bones; normalise
tot = Wt.sum(1); lost = np.where(tot < 1e-4)[0]
if len(lost):
    from mathutils.kdtree import KDTree
    good = np.where(tot >= 1e-4)[0]; kd = KDTree(len(good))
    for i, g in enumerate(good): kd.insert(P[g], i)
    kd.balance()
    for i in lost: Wt[i] = Wt[good[kd.find(P[i])[1]]]
idx = np.argsort(-Wt, 1)[:, 4:]; np.put_along_axis(Wt, idx, 0, 1); Wt /= Wt.sum(1, keepdims=True)
for g in ob.vertex_groups: g.remove(range(NV))
for gi, n in enumerate(names):
    nz = np.where(Wt[:, gi] > 1e-4)[0]
    for i in nz: ob.vertex_groups[n].add([int(i)], float(Wt[i, gi]), 'REPLACE')
print('lost', len(lost), 'bones', len(arm.bones), [b.name for b in arm.bones])
# ---- leg IK (chain 2) with pole targets; off by default influence=1 for posing in Blender ----
for sd, ang in (('L', -90), ('R', -90)):
    c = rig.pose.bones['shin.' + sd].constraints.new('IK'); c.target = rig; c.subtarget = 'foot_ik.' + sd; c.pole_target = rig; c.pole_subtarget = 'knee_pole.' + sd; c.chain_count = 2; c.pole_angle = math.radians(ang)
    cr = rig.pose.bones['foot.' + sd].constraints.new('COPY_ROTATION'); cr.target = rig; cr.subtarget = 'foot_ik.' + sd; cr.target_space = 'WORLD'; cr.owner_space = 'WORLD'
bpy.context.view_layer.update()
# pole angle: the one that leaves the knee exactly where it rests
for sd in 'LR':
    c = rig.pose.bones['shin.' + sd].constraints[0]; best = (9, 0)
    for deg in range(-180, 180, 2):
        c.pole_angle = math.radians(deg); bpy.context.view_layer.update(); d = (rig.pose.bones['shin.' + sd].head - arm.bones['shin.' + sd].head_local).length
        if d < best[0]: best = (d, deg)
    c.pole_angle = math.radians(best[1]); print('pole angle', sd, best[1])
bpy.context.view_layer.update()
# check that switching IK on did not move the rest pose (pole angle correct)
for sd in 'LR':
    pb = rig.pose.bones['shin.' + sd]; print('IK rest drift', sd, round((pb.head - arm.bones['shin.' + sd].head_local).length, 4), round((pb.tail - arm.bones['shin.' + sd].tail_local).length, 4))
rig.show_in_front = True
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/rig/work/wahsh_rig.blend')
