# -*- coding: utf-8 -*-
"""
FORNO — prova della catena Blender, senza interfaccia.

NON e' una prova di «Blender si apre». E' la prova della catena che serve
davvero: costruire un calciatore da codice, illuminarlo, e renderizzarlo
ALL'ANGOLO ESATTO DELLA CAMERA DEL GIOCO in piu' direzioni, cioe' produrre
un foglio di sprite. Se questa gira senza interfaccia, la strada dei
giocatori pre-renderizzati e' aperta.

LA GEOMETRIA NON E' INVENTATA. Viene dal gioco:
  - camera in pianta a 42 gradi di elevazione (CAMERE.alto = camera(42));
  - proiezione ORTOGRAFICA: il gioco calcola
        SX = cx + xw*s
        SY = cy - (y*cam.ce + zw*cam.se)*s
    che non ha divisione per la profondita', quindi non e' prospettica;
  - figura alta RIG_H*P_DIS = 34*1,18 = 40,12 unita' di mondo.

Si lancia cosi':
  blender --background --python strumenti/_forno-prova.py -- <cartella> <lati>
"""
import bpy, sys, math, os, time

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
USCITA = argv[0] if argv else "//_forno"
LATI = int(argv[1]) if len(argv) > 1 else 8
LATO_PX = int(argv[2]) if len(argv) > 2 else 192

t0 = time.time()

# ---------------------------------------------------------------- scena pulita
bpy.ops.wm.read_factory_settings(use_empty=True)
scena = bpy.context.scene

def materiale(nome, colore, ruvido=0.62, metallo=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*colore, 1.0)
    b.inputs["Roughness"].default_value = ruvido
    b.inputs["Metallic"].default_value = metallo
    return m

MAGLIA  = materiale("maglia",  (0.16, 0.42, 0.72))   # azzurro squadra 0
PELLE   = materiale("pelle",   (0.78, 0.58, 0.44), 0.55)
PANTA   = materiale("panta",   (0.92, 0.92, 0.94))
CALZA   = materiale("calza",   (0.13, 0.30, 0.55))
SCARPA  = materiale("scarpa",  (0.08, 0.08, 0.10), 0.35)
CAPELLI = materiale("capelli", (0.16, 0.10, 0.07), 0.75)

def pezzo(tipo, mat, pos, scala, rot=(0, 0, 0)):
    if tipo == "sfera":
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, location=pos)
    elif tipo == "capsula":
        bpy.ops.mesh.primitive_cylinder_add(vertices=18, location=pos)
    else:
        bpy.ops.mesh.primitive_cube_add(location=pos)
    o = bpy.context.object
    o.scale = scala
    o.rotation_euler = rot
    o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return o

# ------------------------------------------------- il calciatore, in corsa
# unita': metri. Un uomo di 1,80 m.
H = 1.80
pezzi = []
# tronco
pezzi.append(pezzo("cubo", MAGLIA, (0, 0, 1.18), (0.19, 0.11, 0.26)))
# spalle
pezzi.append(pezzo("sfera", MAGLIA, (0, 0, 1.40), (0.21, 0.13, 0.09)))
# collo e testa
pezzi.append(pezzo("capsula", PELLE, (0, 0, 1.52), (0.048, 0.048, 0.05)))
pezzi.append(pezzo("sfera", PELLE, (0, 0.01, 1.65), (0.105, 0.112, 0.125)))
pezzi.append(pezzo("sfera", CAPELLI, (0, -0.012, 1.685), (0.107, 0.108, 0.098)))
# bacino e pantaloncini
pezzi.append(pezzo("cubo", PANTA, (0, 0, 0.94), (0.165, 0.105, 0.13)))

def arto(mat_su, mat_giu, spalla, ang_su, ang_giu, lung_su, lung_giu, r, mat_piede=None):
    """un arto in due segmenti, articolato: e' la stessa idea del rig del gioco"""
    x0, y0, z0 = spalla
    # segmento alto
    dy = math.sin(ang_su) * lung_su
    dz = -math.cos(ang_su) * lung_su
    mx, my, mz = x0, y0 + dy / 2, z0 + dz / 2
    pezzi.append(pezzo("capsula", mat_su, (mx, my, mz), (r, r, lung_su / 2), (ang_su, 0, 0)))
    # giunto
    gx, gy, gz = x0, y0 + dy, z0 + dz
    pezzi.append(pezzo("sfera", mat_su, (gx, gy, gz), (r, r, r)))
    # segmento basso
    dy2 = math.sin(ang_giu) * lung_giu
    dz2 = -math.cos(ang_giu) * lung_giu
    mx2, my2, mz2 = gx, gy + dy2 / 2, gz + dz2 / 2
    pezzi.append(pezzo("capsula", mat_giu, (mx2, my2, mz2), (r * 0.92, r * 0.92, lung_giu / 2), (ang_giu, 0, 0)))
    fine = (gx, gy + dy2, gz + dz2)
    if mat_piede:
        pezzi.append(pezzo("cubo", mat_piede, (fine[0], fine[1] + 0.055, fine[2] - 0.02), (0.048, 0.10, 0.032)))
    return fine

# la falcata: gamba avanti piegata, gamba dietro distesa; braccia in opposizione
arto(PELLE, PELLE, (-0.235, 0, 1.36), math.radians(-52), math.radians(-95), 0.30, 0.28, 0.052)
arto(PELLE, PELLE, (0.235, 0, 1.36), math.radians(38), math.radians(72), 0.30, 0.28, 0.052)
arto(PANTA, CALZA, (-0.095, 0, 0.90), math.radians(34), math.radians(78), 0.42, 0.40, 0.072, SCARPA)
arto(PANTA, CALZA, (0.095, 0, 0.90), math.radians(-40), math.radians(-16), 0.42, 0.40, 0.072, SCARPA)

# tutto in un solo oggetto, cosi' ruota insieme
bpy.ops.object.select_all(action='DESELECT')
for p in pezzi:
    p.select_set(True)
bpy.context.view_layer.objects.active = pezzi[0]
bpy.ops.object.join()
UOMO = bpy.context.object
UOMO.name = "calciatore"

# --------------------------------------------------------------- il prato
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0))
prato = bpy.context.object
prato.data.materials.append(materiale("prato", (0.09, 0.24, 0.10), 0.92))
# IL PRATO NON DEVE FINIRE NELLO SPRITE, MA LA SUA OMBRA SI'. Uno sprite
# con dentro un pezzo di erba non si puo' appoggiare su un campo che ha
# gia' la sua tessitura, la sua usura e la sua ora del giorno: si vedrebbe
# la toppa. Con `is_shadow_catcher` il piano diventa invisibile e lascia
# solo l'ombra, che esce nel canale alfa e si posa su qualunque manto.
prato.is_shadow_catcher = True

# --------------------------------------------------------- luce da sera
# sole radente, come la scena firmata del gioco
bpy.ops.object.light_add(type='SUN', location=(-6, -4, 4))
sole = bpy.context.object
sole.data.energy = 4.2
sole.data.angle = math.radians(2.4)          # ombra morbida ma definita
sole.data.color = (1.0, 0.80, 0.58)          # ambra
sole.rotation_euler = (math.radians(56), 0, math.radians(-38))

bpy.ops.object.light_add(type='AREA', location=(4, 3, 3.2))
riemp = bpy.context.object
riemp.data.energy = 90
riemp.data.size = 6
riemp.data.color = (0.62, 0.74, 0.95)        # cielo freddo, per staccare il bordo
riemp.rotation_euler = (math.radians(-38), 0, math.radians(140))

mondo = bpy.data.worlds.new("mondo")
scena.world = mondo
mondo.use_nodes = True
mondo.node_tree.nodes["Background"].inputs[0].default_value = (0.10, 0.14, 0.20, 1)
mondo.node_tree.nodes["Background"].inputs[1].default_value = 0.45

# ----------------------------------------- la camera, ALL'ANGOLO DEL GIOCO
ELEV = 42.0                                   # gradi: CAMERE.alto = camera(42)
cam_d = bpy.data.cameras.new("cam")
cam_d.type = 'ORTHO'                          # il gioco NON divide per la profondita'
cam_d.ortho_scale = 2.45                      # inquadra l'uomo con un po' d'aria
cam = bpy.data.objects.new("cam", cam_d)
scena.collection.objects.link(cam)
scena.camera = cam
dist = 9.0
er = math.radians(ELEV)
cam.location = (0, -dist * math.cos(er), 0.95 + dist * math.sin(er))
cam.rotation_euler = (math.radians(90 - ELEV), 0, 0)

# ------------------------------------------------------------- il render
import os as _os
MOTORE = _os.environ.get('FORNO_MOTORE', 'CYCLES')
if MOTORE.startswith('EEVEE'):
    # EEVEE usa la grafica integrata via OpenGL: su questa macchina Cycles
    # ha solo la CPU (un i7-6500U del 2015), quindi la differenza di costo
    # fra i due motori decide se il forno e' praticabile o no.
    for nome in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        try:
            scena.render.engine = nome
            break
        except Exception:
            continue
    try:
        scena.eevee.taa_render_samples = 32
        scena.eevee.use_raytracing = True
    except Exception:
        pass
else:
    scena.render.engine = 'CYCLES'
    scena.cycles.device = 'CPU'
    scena.cycles.samples = 48
    scena.cycles.use_denoising = True
scena.render.resolution_x = LATO_PX
scena.render.resolution_y = LATO_PX
scena.render.film_transparent = True          # sfondo trasparente: e' uno sprite
scena.render.image_settings.file_format = 'PNG'
scena.render.image_settings.color_mode = 'RGBA'

os.makedirs(bpy.path.abspath(USCITA), exist_ok=True)
tempi = []
for i in range(LATI):
    ang = 2 * math.pi * i / LATI
    UOMO.rotation_euler = (0, 0, ang)
    scena.render.filepath = os.path.join(bpy.path.abspath(USCITA), "corsa-%02d.png" % i)
    t = time.time()
    bpy.ops.render.render(write_still=True)
    tempi.append(time.time() - t)
    print("  direzione %2d/%d  (%3.0f gradi)  %.1f s" % (i + 1, LATI, math.degrees(ang), tempi[-1]))

print("")
print("FORNO OK")
print("  motore            %s su %s" % (scena.render.engine, scena.cycles.device))
print("  camera            ortografica a %.0f gradi di elevazione" % ELEV)
print("  sprite            %d direzioni a %dx%d con canale alfa" % (LATI, LATO_PX, LATO_PX))
print("  tempo per sprite  %.1f s (totale %.1f s, avvio compreso %.1f s)"
      % (sum(tempi) / len(tempi), sum(tempi), time.time() - t0))
print("  cartella          %s" % bpy.path.abspath(USCITA))
