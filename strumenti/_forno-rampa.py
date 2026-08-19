# -*- coding: utf-8 -*-
"""
FORNO RAMPA — Blender non cuoce piu' figure, cuoce SUPERFICI.

L'idea: il rig del gioco resta quello che e' (contorno scuro, tinta satura
di squadra, numero, rotazione continua) e riceve da Blender solo il VOLUME.

COSA SI CUOCE, e perche' proprio questo:
  1) un MATCAP — una sfera del materiale del gioco, illuminata dal sole e
     dal cielo della scena, ripresa ortografica. Un matcap e' la risposta
     luminosa di OGNI normale possibile: il pixel (u,v) del disco vale la
     luce che prende una superficie con normale (u, v, sqrt(1-u^2-v^2)).
  2) da quel matcap si ricavano 16 RAMPE, una per ogni orientamento a
     schermo dell'arto. Un arto e' un cilindro: la sua sezione a distanza t
     dall'asse ha normale t*(-sin@, cos@) sul piano dello schermo, quindi la
     rampa dell'arto inclinato di @ e' UNA FETTA del matcap lungo quella
     direzione. Nessuna approssimazione: e' la stessa geometria.

PERCHE' 16 FETTE E NON UNA. Se si disegnasse una rampa sola ruotandola con
l'arto, il lato illuminato girerebbe insieme all'arto: un ginocchio che si
alza cambierebbe il sole. Cuocendo la fetta GIA' controruotata, il rig puo'
ruotare il decalco con l'arto e il lato caldo resta fermo dov'e' il sole.

FUSIONE: `source-over`, non `multiply` e MAI `overlay` (misurato: 342 ms a
fotogramma contro 3,9 di multiply, 88 volte tanto). Serve source-over perche'
il decalco deve poter SCHIARIRE il lato al sole, non solo scurire: una rampa
di sole moltiplicazione abbassa la luminanza media della maglia e si mangia
il contrasto contro l'erba, che e' il vincolo da non rompere.

L'alfa e' tarata perche' il moltiplicatore di luminanza medio sull'arto
resti 1,000: il decalco RIDISTRIBUISCE la luce, non la toglie.

  blender --background --python strumenti/_forno-rampa.py -- <cartella> [lato]
"""
import bpy, sys, math, os, json
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
USCITA = os.path.abspath(argv[0]) if argv else os.path.abspath("fuori")
MAT_PX = int(argv[1]) if len(argv) > 1 else 256      # lato del matcap
N_ANG = 16                                           # orientamenti dell'arto
DEC_W, DEC_H = 32, 16                                # decalco: lungo x traverso

# la stessa luce del forno delle figure
SOLE_ELEV, SOLE_RZ = 63.0, math.radians(143.13)
ELEV = 42.0

bpy.ops.wm.read_factory_settings(use_empty=True)
scena = bpy.context.scene


def _albero(m):
    if m.node_tree is None:
        m.use_nodes = True
    return m.node_tree


mat = bpy.data.materials.new("tessuto")
b = _albero(mat).nodes.get("Principled BSDF")
b.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)   # bianco: il
b.inputs["Roughness"].default_value = 0.78                    # matcap deve
b.inputs["Metallic"].default_value = 0.0                      # essere la sola
if "Sheen Weight" in b.inputs:                                # LUCE, non la
    b.inputs["Sheen Weight"].default_value = 0.25             # tinta

bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, location=(0, 0, 0), radius=1.0)
sfera = bpy.context.object
sfera.data.materials.append(mat)
bpy.ops.object.shade_smooth()

bpy.ops.object.light_add(type='SUN', location=(-6, -4, 4))
sole = bpy.context.object
sole.data.energy = 4.2
sole.data.angle = math.radians(9.0)
sole.data.color = (1.0, 0.95, 0.88)
sole.rotation_euler = (math.radians(90.0 - SOLE_ELEV), 0, SOLE_RZ)

bpy.ops.object.light_add(type='AREA', location=(4, 3, 3.2))
ri = bpy.context.object
ri.data.energy = 70
ri.data.size = 6
ri.data.color = (0.84, 0.89, 1.00)
ri.rotation_euler = (math.radians(-38), 0, math.radians(140))
ri.data.use_shadow = False

mondo = bpy.data.worlds.new("m")
scena.world = mondo
nt = _albero(mondo)
nt.nodes["Background"].inputs[0].default_value = (0.42, 0.50, 0.62, 1)
nt.nodes["Background"].inputs[1].default_value = 1.60

# LA CAMERA DEL MATCAP GUARDA LO SCHERMO, non il mondo: il piano (u,v) del
# matcap E' il piano dello schermo del gioco. Quindi si riprende la sfera
# lungo l'asse di vista della camera di gioco, che e' inclinata di 42 gradi.
er = math.radians(ELEV)
cd = bpy.data.cameras.new("c")
cd.type = 'ORTHO'
cd.ortho_scale = 2.0
cam = bpy.data.objects.new("c", cd)
scena.collection.objects.link(cam)
scena.camera = cam
d = 9.0
cam.location = (0, -d * math.cos(er), d * math.sin(er))
cam.rotation_euler = (math.radians(90 - ELEV), 0, 0)

scena.render.engine = 'CYCLES'
scena.cycles.device = 'CPU'
scena.cycles.samples = 96
scena.cycles.use_denoising = True
scena.render.resolution_x = scena.render.resolution_y = MAT_PX
scena.render.film_transparent = True
scena.render.image_settings.file_format = 'PNG'
scena.render.image_settings.color_mode = 'RGBA'
scena.view_settings.view_transform = 'Raw'      # il matcap e' un DATO
scena.view_settings.look = 'None'

os.makedirs(USCITA, exist_ok=True)
pm = os.path.join(USCITA, "rampa-matcap.png")
scena.render.filepath = pm
bpy.ops.render.render(write_still=True)

img = bpy.data.images.load(pm)
img.colorspace_settings.name = 'Non-Color'
img.alpha_mode = 'CHANNEL_PACKED'
a = np.empty(len(img.pixels), dtype=np.float32)
img.pixels.foreach_get(a)
M = a.reshape(MAT_PX, MAT_PX, 4)[::-1]          # righe dall'alto
alfa = M[:, :, 3]


def campiona(u, v):
    """matcap in coordinate (-1..1), v verso l'ALTO dello schermo"""
    x = (u * 0.5 + 0.5) * (MAT_PX - 1)
    y = (0.5 - v * 0.5) * (MAT_PX - 1)
    xi, yi = int(round(x)), int(round(y))
    xi = min(max(xi, 0), MAT_PX - 1); yi = min(max(yi, 0), MAT_PX - 1)
    if alfa[yi, xi] < 0.5:
        return None
    return M[yi, xi, :3].copy()


# ---------------------------------------------------- le 16 rampe
LUM = np.array([0.2126, 0.7152, 0.0722], np.float32)
atl = np.zeros((DEC_H * N_ANG, DEC_W, 4), np.float32)
diag = []
for k in range(N_ANG):
    th = 2 * math.pi * k / N_ANG
    nx, ny = -math.sin(th), math.cos(th)         # traverso all'arto, a schermo
    prof = []
    for j in range(DEC_H):
        t = (j + 0.5) / DEC_H * 2 - 1            # -1 .. 1 attraverso l'arto
        t *= 0.94                                # niente bordo estremo: li' il
        c = campiona(nx * t, ny * t)             # cilindro e' gia' contorno
        prof.append(c if c is not None else np.zeros(3, np.float32))
    P = np.array(prof, np.float32)
    L = (P * LUM).sum(axis=1)
    L = np.maximum(L, 1e-4)
    L = L / L.mean()                             # media 1: si RIDISTRIBUISCE
    # compressione: il matcap crudo va da 0,3 a 2,0; a schermo serve meno
    # il cielo a 1,60 (alzato per aprire l'ombra portata) appiattisce anche
    # il matcap: crudo il rapporto sull'arto stava fra 0,82 e 1,09, cioe' un
    # volume invisibile a 100 px. Si riapre, e si tiene entro una forbice
    # dichiarata perche' una rampa troppo forte spegne la tinta di squadra.
    FORZA = 2.4
    Lc = 1.0 + (L - 1.0) * FORZA
    Lc = np.clip(Lc, 0.68, 1.34)
    Lc = Lc / ((Lc.mean()))                      # e si rinormalizza dopo
    for j in range(DEC_H):
        m = float(Lc[j])
        if m >= 1.0:
            # schiarire: tinta del sole, alfa = quanto manca al bianco
            tin = np.array([1.00, 0.97, 0.92], np.float32)
            al = (m - 1.0) / (float((tin * LUM).sum()) / 0.62 - 1.0 + 1e-6)
        else:
            # scurire: tinta del cielo in ombra, non nero
            tin = np.array([0.16, 0.20, 0.28], np.float32)
            al = (1.0 - m) / (1.0 - float((tin * LUM).sum()) / 0.62 + 1e-6)
        al = min(max(al, 0.0), 0.60)
        atl[k * DEC_H + j, :, :3] = tin
        atl[k * DEC_H + j, :, 3] = al
    diag.append({"angolo": round(math.degrees(th), 1),
                 "molt_min": round(float(Lc.min()), 3),
                 "molt_max": round(float(Lc.max()), 3),
                 "molt_medio": round(float(Lc.mean()), 4)})

# sfumatura alle due estremita' dell'arto: il decalco non deve arrivare alle
# calotte tonde, dove sotto c'e' gia' il contorno scuro del rig
for i in range(DEC_W):
    x = (i + 0.5) / DEC_W
    f = min(1.0, x / 0.20, (1.0 - x) / 0.20)
    f = f * f * (3 - 2 * f)
    atl[:, i, 3] *= f

out = bpy.data.images.new("rampa", width=DEC_W, height=DEC_H * N_ANG, alpha=True, float_buffer=False)
out.colorspace_settings.name = 'Non-Color'
out.alpha_mode = 'CHANNEL_PACKED'
out.pixels.foreach_set(atl[::-1].reshape(-1))
out.file_format = 'PNG'
pa = os.path.join(USCITA, "rampa-arti.png")
out.filepath_raw = pa
out.save()

meta = {"matcap": os.path.basename(pm), "atlante": os.path.basename(pa),
        "angoli": N_ANG, "decalco_px": {"w": DEC_W, "h": DEC_H},
        "fusione": "source-over",
        "nota": "riga k = arto a k*22,5 gradi sullo schermo; il decalco va "
                "disegnato ruotato dello stesso angolo e la luce resta ferma",
        "moltiplicatore_medio_per_riga": diag}
with open(os.path.join(USCITA, "rampa-arti.json"), "w", encoding="utf-8") as fh:
    json.dump(meta, fh, ensure_ascii=False, indent=2)

print("")
print("FORNO RAMPA OK")
print("  matcap   %s (%dx%d)" % (pm, MAT_PX, MAT_PX))
print("  atlante  %s (%dx%d)  %d byte" % (pa, DEC_W, DEC_H * N_ANG, os.path.getsize(pa)))
print("  moltiplicatore: min %.3f  max %.3f  medio %.4f (deve essere 1)"
      % (min(d["molt_min"] for d in diag), max(d["molt_max"] for d in diag),
         sum(d["molt_medio"] for d in diag) / len(diag)))
print("  alfa max nel decalco: %.3f" % float(atl[:, :, 3].max()))
