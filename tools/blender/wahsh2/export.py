import bpy
bpy.ops.wm.open_mainfile(filepath='/home/claude/rig/work/wahsh_rig.blend')
bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath='/home/claude/rig/out/wahsh_rigged.blend', compress=True)
rig = bpy.data.objects['Rig']
for pb in rig.pose.bones:
    for c in pb.constraints: c.mute = True
for im in bpy.data.images:
    if im.size[0] > 2048: im.scale(2048, 2048)
for o in bpy.data.objects: o.select_set(o.type in ('MESH', 'ARMATURE'))
bpy.ops.export_scene.gltf(filepath='/home/claude/rig/out/wahsh_rigged.glb', export_format='GLB', use_selection=True, export_skins=True, export_animations=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=85, export_def_bones=False)
print('EXPORTED')
