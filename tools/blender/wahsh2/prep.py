# Step 1: import the user's model, make a light game mesh (keeps UVs/textures), scale to real height, feet on the floor, save.
import bpy, sys, bmesh
from mathutils import Vector
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.import_scene.gltf(filepath='/home/claude/rig/in/wahsh_src.glb')
ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]; ob.name = 'Wahsh'; ob.data.name = 'Wahsh'
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.remove_doubles(threshold=1e-5); bpy.ops.object.mode_set(mode='OBJECT')
print('after merge', len(ob.data.vertices), len(ob.data.polygons))
TARGET = int(sys.argv[-1]) if sys.argv[-1].isdigit() else 60000
m = ob.modifiers.new('dec', 'DECIMATE'); m.ratio = TARGET / len(ob.data.polygons); bpy.ops.object.modifier_apply(modifier='dec')
# real size: 1.98 m tall, centred, standing on z=0
ws = [ob.matrix_world @ v.co for v in ob.data.vertices]; zmin = min(p.z for p in ws); zmax = max(p.z for p in ws); s = 1.98 / (zmax - zmin)
cx = (min(p.x for p in ws) + max(p.x for p in ws)) / 2
ob.matrix_world = ob.matrix_world.copy()
for v in ob.data.vertices:
    p = ob.matrix_world @ v.co; v.co = Vector(((p.x - cx) * s, p.y * s, (p.z - zmin) * s))
ob.matrix_world.identity()
for p in ob.data.polygons: p.use_smooth = True
print('game mesh', len(ob.data.vertices), len(ob.data.polygons))
# islands
bm = bmesh.new(); bm.from_mesh(ob.data); seen = set(); isl = []
for v in bm.verts:
    if v.index in seen: continue
    st = [v]; seen.add(v.index); n = 0
    while st:
        x = st.pop(); n += 1
        for e in x.link_edges:
            y = e.other_vert(x)
            if y.index not in seen: seen.add(y.index); st.append(y)
    isl.append(n)
print('islands', len(isl), sorted(isl, reverse=True)[:10]); bm.free()
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/rig/work/wahsh_mesh.blend')
