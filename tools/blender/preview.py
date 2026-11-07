import bpy, sys, math
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath='/home/claude/b3d/wahsh.blend')
sc = bpy.context.scene
ob = bpy.data.objects['Wahsh']
zs = [ (ob.matrix_world @ v.co).z for v in ob.data.vertices]; zmin, zmax = min(zs), max(zs); zc = (zmin + zmax) / 2
def light(name, typ, loc, energy, col=(1, 1, 1), size=1):
    L = bpy.data.lights.new(name, typ); L.energy = energy; L.color = col
    if typ == 'AREA': L.size = size
    o = bpy.data.objects.new(name, L); o.location = loc; sc.collection.objects.link(o); o.visible_camera = False
    o.rotation_euler = (Vector((0, 0, zc)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
light('key', 'AREA', (-2.2, -3.0, zc + 1.6), 700, (1, 0.96, 0.9), 2.5)
light('rim', 'AREA', (2.5, 2.5, zc + 1.4), 500, (1, 0.45, 0.35), 2)
light('fill', 'AREA', (2.6, -2.2, zc + 0.3), 220, (0.6, 0.7, 1), 3)
world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True; world.node_tree.nodes['Background'].inputs[0].default_value = (0.02, 0.02, 0.03, 1)
cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = (zmax - zmin) * 1.12
co = bpy.data.objects.new('Cam', cam); sc.collection.objects.link(co); sc.camera = co
sc.render.engine = 'CYCLES'; sc.cycles.samples = int(sys.argv[-1]) if sys.argv[-1].isdigit() else 24; sc.cycles.device = 'CPU'
try: sc.cycles.use_denoising = True
except Exception: pass
sc.render.resolution_x, sc.render.resolution_y = 420, 640; sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
for i, yaw in enumerate([0, -40, -90]):
    a = math.radians(yaw); d = 6
    co.location = (math.sin(a) * -d * -1 if False else d * math.sin(-a), -d * math.cos(a), zc)
    co.rotation_euler = (Vector((0, 0, zc)) - co.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = f'/home/claude/b3d/prev_{i}.png'; bpy.ops.render.render(write_still=True)
