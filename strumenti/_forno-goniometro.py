# -*- coding: utf-8 -*-
"""
GONIOMETRO — misura l'elevazione della camera SUL RENDER, non sulla costante.

Non si fida di ELEV=42 scritto nel forno: mette tre riferimenti di posizione
nota nel mondo e legge la loro distanza IN PIXEL sull'immagine cotta.
  rosso  (0,0,0)        origine
  verde  (0,0,L)        L metri in ALTEZZA
  blu    (0,L,0)        L metri in PROFONDITA' (via dalla camera)
Con una camera ortografica a elevazione E:
  una verticale occupa  L*cos(E)*k pixel
  una profondita' occupa L*sin(E)*k pixel
quindi  E = atan( dy_profondita / dy_altezza ),  senza sapere k.

  blender --background --python strumenti/_forno-goniometro.py -- <cartella> [elev] [lato]
"""
import bpy, sys, math, os
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
USCITA = os.path.abspath(argv[0]) if argv else os.path.abspath("_gonio")
ELEV = float(argv[1]) if len(argv) > 1 else 42.0
LATO = int(argv[2]) if len(argv) > 2 else 900
L = 0.60

bpy.ops.wm.read_factory_settings(use_empty=True)
scena = bpy.context.scene


def piatto(nome, col):
    m = bpy.data.materials.new(nome)
    if m.node_tree is None:
        m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = (*col, 1.0)
    nt.links.new(e.outputs['Emission'], o.inputs['Surface'])
    return m


for nome, pos, col in (("o", (0, 0, 0), (1, 0, 0)),
                       ("alto", (0, 0, L), (0, 1, 0)),
                       ("dietro", (0, L, 0), (0, 0, 1))):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, location=pos, radius=0.012)
    bpy.context.object.data.materials.append(piatto(nome, col))

er = math.radians(ELEV)
cd = bpy.data.cameras.new("cam")
cd.type = 'ORTHO'
cd.ortho_scale = 1.6
cam = bpy.data.objects.new("cam", cd)
scena.collection.objects.link(cam)
scena.camera = cam
d = 9.0
# IDENTICA a quella del forno: stessa formula, stesso ordine
cam.location = (0, -d * math.cos(er), 0.50 + d * math.sin(er))
cam.rotation_euler = (math.radians(90 - ELEV), 0, 0)

scena.render.engine = 'CYCLES'
scena.cycles.device = 'CPU'
scena.cycles.samples = 4
scena.cycles.max_bounces = 0
scena.render.resolution_x = scena.render.resolution_y = LATO
scena.render.film_transparent = True
scena.render.image_settings.file_format = 'PNG'
scena.render.image_settings.color_mode = 'RGBA'
scena.view_settings.view_transform = 'Raw'
os.makedirs(USCITA, exist_ok=True)
p = os.path.join(USCITA, "gonio-%.0f.png" % ELEV)
scena.render.filepath = p
bpy.ops.render.render(write_still=True)

img = bpy.data.images.load(p)
img.colorspace_settings.name = 'Non-Color'
img.alpha_mode = 'CHANNEL_PACKED'
a = np.empty(len(img.pixels), dtype=np.float32)
img.pixels.foreach_get(a)
a = a.reshape(img.size[1], img.size[0], 4)


def centro(canale, altri):
    m = (a[:, :, canale] > 0.5) & (a[:, :, 3] > 0.5)
    for c in altri:
        m &= a[:, :, c] < 0.4
    ys, xs = np.nonzero(m)
    return xs.mean(), ys.mean(), int(m.sum())


ox, oy, no = centro(0, (1, 2))
ax, ay, na = centro(1, (0, 2))
bx, by, nb = centro(2, (0, 1))
dy_alt = abs(ay - oy)
dy_pro = abs(by - oy)
E = math.degrees(math.atan2(dy_pro, dy_alt))
k = dy_alt / (L * math.cos(math.radians(E)))
print("")
print("GONIOMETRO")
print("  chiesta            %.2f gradi" % ELEV)
print("  riferimenti (px)   origine (%.2f;%.2f) n=%d | alto (%.2f;%.2f) n=%d | dietro (%.2f;%.2f) n=%d"
      % (ox, oy, no, ax, ay, na, bx, by, nb))
print("  %.2f m in altezza      -> %.3f px" % (L, dy_alt))
print("  %.2f m in profondita'  -> %.3f px" % (L, dy_pro))
print("  scarto orizzontale     %.3f px (deve essere ~0)" % max(abs(ax - ox), abs(bx - ox)))
print("  ELEVAZIONE MISURATA    %.3f gradi   (scarto %+.3f)" % (E, E - ELEV))
print("  tan(E) misurata        %.4f   atteso %.4f" % (dy_pro / dy_alt, math.tan(er)))
print("  pixel per metro        %.2f" % k)
