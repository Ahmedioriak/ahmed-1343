import bpy
bpy.ops.wm.open_mainfile(filepath='/home/claude/rig/work/wahsh_rig.blend')

rig = bpy.data.objects['Rig']
for pb in rig.pose.bones:
    for c in pb.constraints: c.mute = True
for im in bpy.data.images:
    if im.size[0] > 1024: im.scale(1024, 1024)
ob = bpy.data.objects['Wahsh']; d = ob.modifiers.new('dec', 'DECIMATE'); d.ratio = 0.5
while ob.modifiers[0].name != 'dec': bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_move_up(modifier='dec')
for o in bpy.data.objects: o.select_set(o.type in ('MESH', 'ARMATURE'))
bpy.ops.export_scene.gltf(filepath='/home/claude/rig/work/wahsh_game.glb', export_format='GLB', use_selection=True, export_skins=True, export_apply=True, export_animations=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=85, export_def_bones=False)
print('EXPORTED')
