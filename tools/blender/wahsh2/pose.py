# Step 5: fighting-pose tests. args after --: pose name, out blend
import bpy, sys, math
from mathutils import Vector, Matrix, Quaternion
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.open_mainfile(filepath='/home/claude/rig/work/wahsh_rig.blend')
rig = bpy.data.objects['Rig']; PB = rig.pose.bones; VL = bpy.context.view_layer
def ik(on):
    for sd in 'LR':
        for c in list(PB['shin.' + sd].constraints) + list(PB['foot.' + sd].constraints): c.mute = not on
    VL.update()
def aim(n, d, twist=0):
    pb = PB[n]; d = Vector(d).normalized(); cur = (pb.tail - pb.head).normalized(); q = cur.rotation_difference(d)
    if twist: q = Quaternion(d, math.radians(twist)) @ q
    M = pb.matrix.copy(); h = pb.head.copy(); R = q.to_matrix().to_4x4(); pb.matrix = Matrix.Translation(h) @ R @ Matrix.Translation(-h) @ M; VL.update()
def turn(n, axis, deg):
    pb = PB[n]; h = pb.head.copy(); R = Matrix.Rotation(math.radians(deg), 4, axis); pb.matrix = Matrix.Translation(h) @ R @ Matrix.Translation(-h) @ pb.matrix; VL.update()
p = a[0]
if p == 'rest': ik(False)
if p == 'punch':     # right straight: hips and chest turn into it, left hand guards
    ik(False); turn('pelvis', 'Z', -12); turn('spine_02', 'Z', -14); turn('chest', 'Z', -18); turn('chest', 'X', 6)
    aim('clavicle.R', (-1, -0.45, 0.05)); aim('upperarm.R', (-0.12, -1, 0.02)); aim('forearm.R', (-0.05, -1, 0.03), twist=90); aim('hand.R', (0, -1, 0.02))
    aim('upperarm.L', (0.45, -0.25, -1)); aim('forearm.L', (-0.25, -0.6, 1)); aim('hand.L', (-0.2, -0.3, 1))
    aim('thigh.R', (-0.2, 0.25, -1)); aim('shin.R', (-0.05, 0.45, -1)); aim('foot.R', (0, -1, -0.75)); aim('thigh.L', (0.2, -0.3, -1)); aim('shin.L', (0.1, 0.2, -1)); aim('foot.L', (0.15, -1, -0.55))
if p == 'kick':      # right side kick: support leg bent, torso leans away, guard up
    ik(False); turn('pelvis', 'Y', -24); turn('spine_01', 'Y', 6); turn('spine_02', 'Y', 6); turn('chest', 'Y', 4)
    aim('thigh.R', (-1, 0.0, 0.08)); aim('shin.R', (-1, 0.0, 0.12)); aim('foot.R', (-0.35, -1, 0.0)); aim('toe.R', (-0.3, -1, 0))
    aim('thigh.L', (0.1, -0.08, -1)); aim('shin.L', (0.0, 0.1, -1)); aim('foot.L', (0.5, -1, -0.5))
    aim('upperarm.R', (-0.35, -0.3, -1)); aim('forearm.R', (0.1, -0.7, 1)); aim('hand.R', (0, -0.3, 1)); aim('upperarm.L', (0.4, -0.3, -1)); aim('forearm.L', (-0.3, -0.6, 1)); aim('hand.L', (-0.2, -0.3, 1))
if p == 'guard':     # both fists in front of the face, elbows in
    ik(False); turn('spine_02', 'X', 6); turn('chest', 'X', 8)
    for s, sg in (('L', 1), ('R', -1)):
        aim('clavicle.' + s, (sg, -0.35, 0.15)); aim('upperarm.' + s, (sg * 0.15, -0.55, -1)); aim('forearm.' + s, (-sg * 0.28, -0.3, 1)); aim('hand.' + s, (-sg * 0.1, -0.1, 1))
if p == 'squat':     # IK: pelvis goes down, feet stay planted
    ik(True); PB['pelvis'].location = (0, -0.34, 0.04); VL.update(); turn('spine_01', 'X', 8); turn('chest', 'X', 6)
    for s, sg in (('L', 1), ('R', -1)): aim('upperarm.' + s, (sg * 0.3, -0.5, -1)); aim('forearm.' + s, (-sg * 0.3, -0.5, 1))
    for sd in 'LR': print('foot drift', sd, round((PB['foot.' + sd].head - rig.data.bones['foot.' + sd].head_local).length, 4), 'knee y', round(PB['shin.' + sd].head.y, 3))
if p == 'sash':
    ik(False); turn('sash_01', 'X', -25); turn('sash_02', 'X', -20); turn('sash_03', 'Y', 25); turn('head', 'Z', 35); turn('neck', 'X', 10); aim('hand.R', (-0.6, -0.5, -1)); turn('forearm_twist.L', 'Z', 0)
bpy.ops.wm.save_as_mainfile(filepath=a[1])
