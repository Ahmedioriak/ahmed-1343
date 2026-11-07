# Bakes الوحش's procedural outfit + projected face into one texture (MakeHuman UVs) and exports a skinned GLB for the game.
import bpy, sys
bpy.ops.wm.open_mainfile(filepath='/home/claude/b3d/wahsh.blend')
sc = bpy.context.scene
ob = bpy.data.objects['Wahsh']; me = ob.data
RES = int(sys.argv[-1]) if sys.argv[-1].isdigit() else 2048
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 4
for m in ob.modifiers:
    if m.type == 'SUBSURF': m.show_render = m.show_viewport = False
me.uv_layers.active = me.uv_layers['UVMap']
for u in me.uv_layers: u.active_render = (u.name == 'UVMap')

def bake(kind, name, cs):
    img = bpy.data.images.new(name, RES, RES, alpha=False); img.colorspace_settings.name = cs
    for m in me.materials:
        nt = m.node_tree; n = nt.nodes.new('ShaderNodeTexImage'); n.image = img; n.name = 'BAKE'
        for x in nt.nodes: x.select = False
        n.select = True; nt.nodes.active = n
    bpy.context.view_layer.objects.active = ob
    for o in bpy.data.objects: o.select_set(o == ob)
    if kind == 'DIFFUSE': bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, margin=12, use_clear=True)
    else: bpy.ops.object.bake(type=kind, margin=12, use_clear=True)
    for m in me.materials: m.node_tree.nodes.remove(m.node_tree.nodes['BAKE'])
    return img
col = bake('DIFFUSE', 'wahsh_col', 'sRGB')
rgh = bake('ROUGHNESS', 'wahsh_rgh', 'Non-Color')
col.filepath_raw = '/home/claude/b3d/wahsh_col.png'; col.file_format = 'PNG'; col.save()
rgh.filepath_raw = '/home/claude/b3d/wahsh_rgh.png'; rgh.file_format = 'PNG'; rgh.save()

# one plain material with the baked maps
m = bpy.data.materials.new('wahsh'); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']
t1 = nt.nodes.new('ShaderNodeTexImage'); t1.image = col
t2 = nt.nodes.new('ShaderNodeTexImage'); t2.image = rgh
nt.links.new(t1.outputs['Color'], bs.inputs['Base Color']); nt.links.new(t2.outputs['Color'], bs.inputs['Roughness'])
me.materials.clear(); me.materials.append(m)
for p in me.polygons: p.material_index = 0
# keep only the main UVs + drop the bake-only attributes
for u in [u for u in me.uv_layers if u.name != 'UVMap']: me.uv_layers.remove(u)
for k in ['xr', 'zr', 'vn', 'vestW', 'pantsW', 'beltW', 'bootW', 'gloveW', 'facew', 'hairw', 'trim']:
    a = me.attributes.get(k)
    if a: me.attributes.remove(a)
for o in bpy.data.objects:
    for md in list(o.modifiers):
        if md.type in ('SUBSURF', 'SOLIDIFY') and o.name != 'Sash': o.modifiers.remove(md)
        elif md.type == 'SUBSURF': o.modifiers.remove(md)
# fists: curl the fingers, then make that the rest pose (mesh + skeleton)
import math
rig = bpy.data.objects['Rig']; ang = math.radians(75)
for pb in rig.pose.bones:
    n = pb.name
    if n.startswith('finger') and not n.startswith('finger1'):
        pb.rotation_mode = 'XYZ'; seg = int(n.split('-')[1][0]); pb.rotation_euler = (ang * (1.0 if seg > 1 else 0.9), 0, 0)
    elif n.startswith('finger1-') and n[8] in '23':
        pb.rotation_mode = 'XYZ'; pb.rotation_euler = (ang * 0.5, 0, 0)
bpy.context.view_layer.update()
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    for o2 in bpy.data.objects: o2.select_set(o2 == o)
    bpy.context.view_layer.objects.active = o
    md = [m_ for m_ in o.modifiers if m_.type == 'ARMATURE'][0]
    bpy.ops.object.modifier_copy(modifier=md.name)
    bpy.ops.object.modifier_apply(modifier=md.name)
    nm = [m_ for m_ in o.modifiers if m_.type == 'ARMATURE'][0]
    bpy.ops.object.modifier_move_to_index(modifier=nm.name, index=0)
for o2 in bpy.data.objects: o2.select_set(o2 == rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.select_all(action='SELECT'); bpy.ops.pose.armature_apply(selected=False); bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/b3d/wahsh_game.blend')
for o in bpy.data.objects: o.select_set(o.type in ('MESH', 'ARMATURE'))
bpy.ops.export_scene.gltf(filepath='/home/claude/b3d/wahsh.glb', export_format='GLB', use_selection=True, export_apply=True,
    export_skins=True, export_animations=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=85,
    export_texcoords=True, export_normals=True, export_materials='EXPORT')
print('GLB OK')
