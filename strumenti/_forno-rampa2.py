# -*- coding: utf-8 -*-
"""
FORNO RAMPA 2 — non piu' un decalco da comporre, ma le FERMATE di un
gradiente che il rig usa come riempimento.

PERCHE' CAMBIA. Il decalco della prima versione era un bitmap da comporre a
ogni fotogramma (1,8 ms) per un effetto che alla dimensione vera non si
vedeva. Un riempimento a gradiente si costruisce UNA volta per tinta e per
orientamento e poi si riusa: e non puo' sconfinare sul contorno per
costruzione, perche' e' il riempimento della forma, non una toppa appoggiata.

IL BUG DELLA LUCE DA SOTTO, trovato grazie all'osservazione del provino.
Il matcap ha v positivo verso l'ALTO dello schermo; l'angolo di un arto sul
canvas ha invece y positivo verso il BASSO. La perpendicolare (-sin, cos)
calcolata in coordinate canvas, letta nel matcap, arrivava CAPOVOLTA: il
sole finiva sotto. Qui si campiona (-sin t, -cos t), e la luce torna in alto.

LE FERMATE SONO CINQUE, e non tre. Misurato: ricostruendo il profilo vero
(32 campioni) con interpolazione lineare, tre fermate sbagliano fino al
doppio di cinque — perche' il colmo chiaro di un cilindro NON sta in mezzo,
si sposta con l'orientamento, e tre fermate lo inchiodano al centro. Cinque
lo lasciano libero. Il numero esatto e' nel JSON.

  blender --background --python strumenti/_forno-rampa2.py -- <cartella> [lato]
"""
import bpy, sys, math, os, json
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
USCITA = os.path.abspath(argv[0]) if argv else os.path.abspath("fuori")
MAT_PX = int(argv[1]) if len(argv) > 1 else 256
N_ANG = 16
N_CAMP = 32                      # campioni del profilo vero
SOLE_ELEV, SOLE_RZ = 63.0, math.radians(143.13)
ELEV = 42.0

bpy.ops.wm.read_factory_settings(use_empty=True)
scena = bpy.context.scene


def _a(m):
    if m.node_tree is None:
        m.use_nodes = True
    return m.node_tree


mat = bpy.data.materials.new("tessuto")
b = _a(mat).nodes.get("Principled BSDF")
b.inputs["Base Color"].default_value = (1, 1, 1, 1)
b.inputs["Roughness"].default_value = 0.78
if "Sheen Weight" in b.inputs:
    b.inputs["Sheen Weight"].default_value = 0.25

bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=1.0)
bpy.context.object.data.materials.append(mat)
bpy.ops.object.shade_smooth()

bpy.ops.object.light_add(type='SUN', location=(-6, -4, 4))
so = bpy.context.object
so.data.energy = 4.2
so.data.angle = math.radians(9.0)
so.data.color = (1.0, 0.95, 0.88)
so.rotation_euler = (math.radians(90 - SOLE_ELEV), 0, SOLE_RZ)
bpy.ops.object.light_add(type='AREA', location=(4, 3, 3.2))
ri = bpy.context.object
ri.data.energy = 70; ri.data.size = 6
ri.data.color = (0.84, 0.89, 1.00)
ri.rotation_euler = (math.radians(-38), 0, math.radians(140))
ri.data.use_shadow = False

mo = bpy.data.worlds.new("m"); scena.world = mo
nt = _a(mo)
nt.nodes["Background"].inputs[0].default_value = (0.42, 0.50, 0.62, 1)
nt.nodes["Background"].inputs[1].default_value = 1.60

er = math.radians(ELEV)
cd = bpy.data.cameras.new("c"); cd.type = 'ORTHO'; cd.ortho_scale = 2.0
cam = bpy.data.objects.new("c", cd)
scena.collection.objects.link(cam); scena.camera = cam
d = 9.0
cam.location = (0, -d * math.cos(er), d * math.sin(er))
cam.rotation_euler = (math.radians(90 - ELEV), 0, 0)

scena.render.engine = 'CYCLES'; scena.cycles.device = 'CPU'
scena.cycles.samples = 96; scena.cycles.use_denoising = True
scena.render.resolution_x = scena.render.resolution_y = MAT_PX
scena.render.film_transparent = True
scena.render.image_settings.file_format = 'PNG'
scena.render.image_settings.color_mode = 'RGBA'
scena.view_settings.view_transform = 'Raw'
scena.view_settings.look = 'None'

os.makedirs(USCITA, exist_ok=True)
pm = os.path.join(USCITA, "rampa2-matcap.png")
scena.render.filepath = pm
bpy.ops.render.render(write_still=True)

img = bpy.data.images.load(pm)
img.colorspace_settings.name = 'Non-Color'
img.alpha_mode = 'CHANNEL_PACKED'
a = np.empty(len(img.pixels), dtype=np.float32)
img.pixels.foreach_get(a)
M = a.reshape(MAT_PX, MAT_PX, 4)[::-1]
AL = M[:, :, 3]
LUM = np.array([0.2126, 0.7152, 0.0722], np.float32)


def campiona(u, v):
    """(u,v) in -1..1, v verso l'ALTO dello schermo"""
    x = int(round((u * 0.5 + 0.5) * (MAT_PX - 1)))
    y = int(round((0.5 - v * 0.5) * (MAT_PX - 1)))
    x = min(max(x, 0), MAT_PX - 1); y = min(max(y, 0), MAT_PX - 1)
    if AL[y, x] < 0.5:
        return None
    return M[y, x, :3]


def ricostruisci(ts, prof, fermate):
    """errore di una spezzata a N fermate contro il profilo vero"""
    idx = np.linspace(0, len(prof) - 1, fermate).round().astype(int)
    return np.interp(ts, ts[idx], prof[idx])


FORZA = 2.4
ts = (np.arange(N_CAMP) + 0.5) / N_CAMP          # 0..1 attraverso l'arto
righe = []
err3, err5, err7 = [], [], []
for k in range(N_ANG):
    th = 2 * math.pi * k / N_ANG
    # LA CORREZIONE: y del canvas va in giu', v del matcap va in su
    nx, ny = -math.sin(th), -math.cos(th)
    prof = []
    for j in range(N_CAMP):
        t = (ts[j] * 2 - 1) * 0.94
        c = campiona(nx * t, ny * t)
        prof.append(float((c * LUM).sum()) if c is not None else 0.0)
    P = np.maximum(np.array(prof, np.float32), 1e-4)
    P = P / P.mean()
    P = np.clip(1.0 + (P - 1.0) * FORZA, 0.62, 1.40)
    P = P / P.mean()                              # media 1: il gradiente
    for n, acc in ((3, err3), (5, err5), (7, err7)):   # RIDISTRIBUISCE
        acc.append(float(np.sqrt(((ricostruisci(ts, P, n) - P) ** 2).mean())))
    idx = np.linspace(0, N_CAMP - 1, 5).round().astype(int)
    righe.append({"angolo": round(math.degrees(th), 1),
                  "fermate": [[round(float(ts[i]), 4), round(float(P[i]), 4)] for i in idx],
                  "molt_min": round(float(P.min()), 4), "molt_max": round(float(P.max()), 4)})

meta = {
    "sorgente": "matcap cotto in Blender: sfera del materiale del gioco sotto il "
                "sole e il cielo della scena, ripresa ortografica a 42 gradi",
    "matcap": os.path.basename(pm),
    "angoli": N_ANG,
    "fermate_per_gradiente": 5,
    "asse": "0 = lato -n(theta) dell'arto, 1 = lato +n(theta); n e' la "
            "perpendicolare all'arto in coordinate CANVAS (y in giu')",
    "valore": "moltiplicatore di luminanza da applicare alla tinta propria; "
              "la media su ogni riga vale 1, quindi la tinta media non cambia",
    "errore_ricostruzione_rms": {
        "3_fermate": round(float(np.mean(err3)), 4),
        "5_fermate": round(float(np.mean(err5)), 4),
        "7_fermate": round(float(np.mean(err7)), 4)},
    "perche_cinque": "tre fermate inchiodano il colmo chiaro al centro, ma su un "
                     "cilindro il colmo si sposta con l'orientamento: l'errore "
                     "quadratico medio e' il doppio. Sette non ripagano: a 6-9 px "
                     "di arto la quinta fermata cade gia' sotto il pixel.",
    "righe": righe,
}
pj = os.path.join(USCITA, "rampa2-fermate.json")
with open(pj, "w", encoding="utf-8") as fh:
    json.dump(meta, fh, ensure_ascii=False, indent=1)

print("")
print("FORNO RAMPA 2 OK")
print("  fermate  %s  (%d byte)" % (pj, os.path.getsize(pj)))
print("  errore rms della spezzata: 3 fermate %.4f | 5 %.4f | 7 %.4f"
      % (np.mean(err3), np.mean(err5), np.mean(err7)))
print("  moltiplicatore: min %.3f  max %.3f"
      % (min(r["molt_min"] for r in righe), max(r["molt_max"] for r in righe)))
