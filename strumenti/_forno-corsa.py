# -*- coding: utf-8 -*-
"""
FORNO CORSA — un verbo solo, cotto per intero.

Cuoce 8 direzioni x 8 fotogrammi del ciclo di corsa e li impacchetta in un
atlante PNG 8x8 piu' un JSON di montaggio. In piu' cuoce una MASCHERA di
ricolorazione (R = maglia, G = pantaloncini) perche' le divise cambiano da
squadra a squadra e non si puo' cuocere una serie per divisa.

LA GEOMETRIA NON E' INVENTATA, viene dal gioco (come in _forno-prova.py):
  - camera ORTOGRAFICA a 42 gradi di elevazione (CAMERE.alto = camera(42));
  - il gioco proietta SY = cy - (y*ce + z*se)*s, dove y e' la QUOTA e z la
    PROFONDITA': quindi una verticale pesa cos(42) e una profondita' sin(42).
    In Blender la camera ruotata di (90-42) sull'asse X fa esattamente
    questo: verticale -> sin(48) = cos(42), profondita' -> cos(48) = sin(42);
  - la figura e' alta RIG_H*P_DIS = 34*1,18 = 40,12 unita' a schermo.

CONVENZIONE DELLE DIREZIONI (finisce nel JSON, serve al gioco):
  yaw 0 = il giocatore corre verso il BASSO dello schermo (verso la camera).
  L'indice di riga cresce di 45 gradi. In coordinate di campo (x a destra,
  y verso il basso dello schermo, com'e' nel gioco):
      k = round(atan2(hx, hy) / (pi/4)) mod 8

Si lancia cosi':
  blender --background --python strumenti/_forno-corsa.py -- <cartella> [lato] [dir] [fot]
"""
import bpy, sys, math, os, time, json
import numpy as np
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
USCITA  = os.path.abspath(argv[0]) if argv else os.path.abspath("_forno-corsa")
LATO_PX = int(argv[1]) if len(argv) > 1 else 160
N_DIR   = int(argv[2]) if len(argv) > 2 else 8
N_FOT   = int(argv[3]) if len(argv) > 3 else 8

# ---------------------------------------------------------------- il conto
# Quanti pixel occupa la figura sullo schermo del telefono, al MASSIMO che
# il gioco le concede? Vedi il rapporto: 40,12 unita' x S2 x DPR.
# Qui si fissa l'altezza della figura NELLA CELLA e da li' si ricava
# l'inquadratura ortografica.
FIG_PX   = 82.0            # altezza a schermo della figura dentro la cella
H_UOMO   = 1.80            # metri: l'uomo del modello
ELEV     = 42.0            # gradi, camera del gioco
RIG_H_P  = 34.0 * 1.18     # 40,12 unita' di gioco = la stessa figura

er = math.radians(ELEV)
# una verticale di H metri occupa H*cos(42) del campo verticale della camera
ALT_SCHERMO_M = H_UOMO * math.cos(er)
ORTHO = ALT_SCHERMO_M * LATO_PX / FIG_PX      # metri inquadrati per lato cella
PX_PER_M  = FIG_PX / ALT_SCHERMO_M            # pixel per metro di schermo
PX_PER_UG = FIG_PX / RIG_H_P                  # pixel dello sprite per unita' di gioco

MIRA_Z = 0.50              # a che quota punta la camera: centra figura + ombra

# sole: 58 gradi di elevazione, ombra verso il basso-sinistra dello schermo
SOLE_ELEV = 63.0
SOLE_RX   = math.radians(90.0 - SOLE_ELEV)
SOLE_RZ   = math.radians(143.13)

t_avvio = time.time()

# ---------------------------------------------------------------- scena
bpy.ops.wm.read_factory_settings(use_empty=True)
scena = bpy.context.scene


def _albero(m):
    if m.node_tree is None:
        m.use_nodes = True
    return m.node_tree


def materiale(nome, colore, ruvido=0.62, metallo=0.0):
    m = bpy.data.materials.new(nome)
    nt = _albero(m)
    b = nt.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*colore, 1.0)
    b.inputs["Roughness"].default_value = ruvido
    b.inputs["Metallic"].default_value = metallo
    return m


def materiale_piatto(nome, colore):
    """emissione pura: la maschera non deve avere ne' luce ne' ombra"""
    m = bpy.data.materials.new(nome)
    nt = _albero(m)
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*colore, 1.0)
    em.inputs['Strength'].default_value = 1.0
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    return m


# LA DIVISA E' NEUTRA. Maglia e pantaloncini escono in due grigi: il gioco
# li moltiplica per il colore della squadra e la piega dell'ombreggiatura
# resta. Cuocere una serie per divisa non si puo' fare: le squadre sono
# tante e ogni serie costa 64 fotogrammi.
PAL = {
    'bellezza': {
        'maglia':  materiale("maglia",  (0.62, 0.62, 0.62)),
        'panta':   materiale("panta",   (0.72, 0.72, 0.72)),
        'pelle':   materiale("pelle",   (0.78, 0.58, 0.44), 0.55),
        'calza':   materiale("calza",   (0.26, 0.27, 0.30)),
        'scarpa':  materiale("scarpa",  (0.08, 0.08, 0.10), 0.35),
        'capelli': materiale("capelli", (0.16, 0.10, 0.07), 0.75),
    },
    'maschera': {
        'maglia':  materiale_piatto("m_maglia",  (1.0, 0.0, 0.0)),
        'panta':   materiale_piatto("m_panta",   (0.0, 1.0, 0.0)),
        'pelle':   materiale_piatto("m_pelle",   (0.0, 0.0, 0.0)),
        'calza':   materiale_piatto("m_calza",   (0.0, 0.0, 0.0)),
        'scarpa':  materiale_piatto("m_scarpa",  (0.0, 0.0, 0.0)),
        'capelli': materiale_piatto("m_capelli", (0.0, 0.0, 0.0)),
    },
}


def pezzo(pezzi, tipo, mat, pos, scala, rot=(0, 0, 0)):
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
    pezzi.append(o)
    return o


def arto(pezzi, mat_su, mat_giu, spalla, ang_su, ang_giu, lung_su, lung_giu, r, mat_piede=None):
    """un arto in due segmenti, articolato: e' la stessa idea del rig del gioco.
       ang > 0 porta l'arto verso +Y, cioe' INDIETRO (il giocatore a yaw 0
       guarda verso -Y, verso la camera)."""
    x0, y0, z0 = spalla
    dy = math.sin(ang_su) * lung_su
    dz = -math.cos(ang_su) * lung_su
    mx, my, mz = x0, y0 + dy / 2, z0 + dz / 2
    pezzo(pezzi, "capsula", mat_su, (mx, my, mz), (r, r, lung_su / 2), (ang_su, 0, 0))
    gx, gy, gz = x0, y0 + dy, z0 + dz
    pezzo(pezzi, "sfera", mat_su, (gx, gy, gz), (r, r, r))
    dy2 = math.sin(ang_giu) * lung_giu
    dz2 = -math.cos(ang_giu) * lung_giu
    mx2, my2, mz2 = gx, gy + dy2 / 2, gz + dz2 / 2
    pezzo(pezzi, "capsula", mat_giu, (mx2, my2, mz2), (r * 0.92, r * 0.92, lung_giu / 2), (ang_giu, 0, 0))
    fine = (gx, gy + dy2, gz + dz2)
    if mat_piede:
        pezzo(pezzi, "cubo", mat_piede, (fine[0], fine[1] + 0.055, fine[2] - 0.02), (0.048, 0.10, 0.032))
    return fine


# ------------------------------------------------- LA FALCATA, in funzione
#   della fase p (0..1). Una gamba: coscia che oscilla avanti/indietro,
#   ginocchio che si piega SOLO nel mezzo giro di ritorno (il volo), che e'
#   quello che distingue una corsa da un pendolo.
A_COSCIA = math.radians(34.0)
K0, K1   = math.radians(10.0), math.radians(68.0)
A_BRACC  = math.radians(26.0)
L_COSCIA, L_POLPA = 0.42, 0.40
L_BRACC,  L_AVAMB = 0.30, 0.28


def ang_gamba(p):
    coscia = -A_COSCIA * math.cos(2 * math.pi * p)
    flex = K0 + K1 * max(0.0, -math.sin(2 * math.pi * p))
    return coscia, coscia + flex


def ang_braccio(p):
    spalla = -A_BRACC * math.cos(2 * math.pi * p)
    gomito = spalla - (math.radians(58.0) + math.radians(14.0) * math.cos(2 * math.pi * p))
    return spalla, gomito


def suola_z(anca_z, a_su, a_giu):
    """quota della suola: serve a far rimbalzare il corpo senza che i piedi
       affondino nel prato. Non e' un rimbalzo a sinusoide messo a occhio:
       e' il piede piu' basso portato a zero."""
    fine = anca_z - math.cos(a_su) * L_COSCIA - math.cos(a_giu) * L_POLPA
    return fine - 0.052


ANCA_Z0 = 0.90
LEAN = math.radians(8.0)          # inclinazione in avanti del busto


def costruisci(u, modo):
    """u = fase del ciclo 0..1. Torna l'oggetto unito, gia' appoggiato a z=0."""
    M = PAL[modo]
    pezzi = []
    gd_su, gd_giu = ang_gamba(u)              # gamba destra
    gs_su, gs_giu = ang_gamba(u + 0.5)        # gamba sinistra
    bd_su, bd_giu = ang_braccio(u + 0.5)      # braccio destro, in opposizione
    bs_su, bs_giu = ang_braccio(u)
    # il rimbalzo: quanto alzare tutto perche' il piede piu' basso tocchi
    dz = -min(suola_z(ANCA_Z0, gd_su, gd_giu), suola_z(ANCA_Z0, gs_su, gs_giu))

    def P(x, y, z):
        """posizione col rimbalzo e con l'inclinazione del busto"""
        zz = z + dz
        return (x, y - (zz - (ANCA_Z0 + dz)) * math.tan(LEAN), zz)

    pezzo(pezzi, "cubo",    M['maglia'],  P(0, 0, 1.18),      (0.19, 0.11, 0.26))
    pezzo(pezzi, "sfera",   M['maglia'],  P(0, 0, 1.40),      (0.21, 0.13, 0.09))
    pezzo(pezzi, "capsula", M['pelle'],   P(0, 0, 1.52),      (0.048, 0.048, 0.05))
    pezzo(pezzi, "sfera",   M['pelle'],   P(0, 0.01, 1.65),   (0.105, 0.112, 0.125))
    pezzo(pezzi, "sfera",   M['capelli'], P(0, -0.012, 1.685), (0.107, 0.108, 0.098))
    pezzo(pezzi, "cubo",    M['panta'],   P(0, 0, 0.94),      (0.165, 0.105, 0.13))

    arto(pezzi, M['pelle'], M['pelle'], P(-0.235, 0, 1.36), bs_su, bs_giu, L_BRACC, L_AVAMB, 0.052)
    arto(pezzi, M['pelle'], M['pelle'], P(0.235, 0, 1.36),  bd_su, bd_giu, L_BRACC, L_AVAMB, 0.052)
    arto(pezzi, M['panta'], M['calza'], (-0.095, 0, ANCA_Z0 + dz), gs_su, gs_giu,
         L_COSCIA, L_POLPA, 0.072, M['scarpa'])
    arto(pezzi, M['panta'], M['calza'], (0.095, 0, ANCA_Z0 + dz), gd_su, gd_giu,
         L_COSCIA, L_POLPA, 0.072, M['scarpa'])

    bpy.ops.object.select_all(action='DESELECT')
    for p in pezzi:
        p.select_set(True)
    bpy.context.view_layer.objects.active = pezzi[0]
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = "corsa_%s_%02d" % (modo, int(u * 100))
    return o


# --------------------------------------------------------------- il prato
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0))
prato = bpy.context.object
# IL PRATO E' GRIGIO, NON VERDE, e non e' una svista. Anche da raccoglitore
# d'ombre il piano rimbalza luce sul modello: con l'erba verde la maglia
# usciva verde smorto, e una maglia verde NON si ricolora piu' (il gioco la
# moltiplica per il colore della squadra e il verde resta dentro). Il grigio
# neutro conserva la piega dell'ombreggiatura e lascia la tinta al gioco.
prato.data.materials.append(materiale("prato", (0.20, 0.20, 0.20), 0.92))
# IL PRATO NON FINISCE NELLO SPRITE, MA LA SUA OMBRA SI'. Uno sprite con
# dentro un pezzo d'erba non si posa su un campo che ha gia' la sua trama.
prato.is_shadow_catcher = True

# ------------------------------------------------------------- luce
bpy.ops.object.light_add(type='SUN', location=(-6, -4, 4))
sole = bpy.context.object
sole.data.energy = 4.2
sole.data.angle = math.radians(2.4)
sole.data.color = (1.0, 0.95, 0.88)
sole.rotation_euler = (SOLE_RX, 0, SOLE_RZ)

bpy.ops.object.light_add(type='AREA', location=(4, 3, 3.2))
riemp = bpy.context.object
riemp.data.energy = 70
riemp.data.size = 6
riemp.data.color = (0.84, 0.89, 1.00)
riemp.rotation_euler = (math.radians(-38), 0, math.radians(140))
# IL RIEMPIMENTO NON FA OMBRA. Con l'ombra accesa il pannello azzurro
# stendeva una seconda macchia molle larga il doppio della prima, che
# usciva dalla cella e che sul campo si sarebbe letta come una pozza:
# il gioco ha UNA sorgente, e lo sprite deve portare UNA ombra.
riemp.data.use_shadow = False

mondo = bpy.data.worlds.new("mondo")
scena.world = mondo
nt = _albero(mondo)
nt.nodes["Background"].inputs[0].default_value = (0.16, 0.18, 0.22, 1)
nt.nodes["Background"].inputs[1].default_value = 0.45

# ----------------------------------------- la camera, ALL'ANGOLO DEL GIOCO
cam_d = bpy.data.cameras.new("cam")
cam_d.type = 'ORTHO'
cam_d.ortho_scale = ORTHO
cam = bpy.data.objects.new("cam", cam_d)
scena.collection.objects.link(cam)
scena.camera = cam
dist = 9.0
cam.location = (0, -dist * math.cos(er), MIRA_Z + dist * math.sin(er))
cam.rotation_euler = (math.radians(90 - ELEV), 0, 0)

scena.render.engine = 'CYCLES'
scena.cycles.device = 'CPU'
scena.render.resolution_x = LATO_PX
scena.render.resolution_y = LATO_PX
scena.render.resolution_percentage = 100
scena.render.film_transparent = True
scena.render.image_settings.file_format = 'PNG'
scena.render.image_settings.color_mode = 'RGBA'
scena.render.image_settings.color_depth = '8'
scena.render.image_settings.compression = 90
scena.view_settings.view_transform = 'Standard'
scena.view_settings.look = 'None'

os.makedirs(USCITA, exist_ok=True)
CELLE = os.path.join(USCITA, "celle")
os.makedirs(CELLE, exist_ok=True)

# IL PUNTO DI APPOGGIO — non stimato: chiesto alla camera stessa.
bpy.context.view_layer.update()
uv = world_to_camera_view(scena, cam, Vector((0.0, 0.0, 0.0)))
APP_X = uv.x * LATO_PX
APP_Y = (1.0 - uv.y) * LATO_PX


def cuoci(modo, campioni, rimbalzi, denoise, vista, prato_visibile):
    scena.cycles.samples = campioni
    scena.cycles.max_bounces = rimbalzi
    scena.cycles.use_denoising = denoise
    scena.view_settings.view_transform = vista
    prato.hide_render = not prato_visibile
    nt.nodes["Background"].inputs[1].default_value = 0.45 if prato_visibile else 0.0
    tempi = []
    for f in range(N_FOT):
        u = f / float(N_FOT)
        uomo = costruisci(u, modo)
        for d in range(N_DIR):
            uomo.rotation_euler = (0, 0, 2 * math.pi * d / N_DIR)
            scena.render.filepath = os.path.join(CELLE, "%s-d%d-f%d.png" % (modo, d, f))
            t = time.time()
            bpy.ops.render.render(write_still=True)
            tempi.append(time.time() - t)
        bpy.ops.object.select_all(action='DESELECT')
        uomo.select_set(True)
        bpy.ops.object.delete()
        print("  %s fotogramma %d/%d  (%.1f s a cella)" % (modo, f + 1, N_FOT, tempi[-1]))
    return tempi


def leggi(path):
    img = bpy.data.images.load(path, check_existing=False)
    img.colorspace_settings.name = 'Non-Color'
    img.alpha_mode = 'CHANNEL_PACKED'
    a = np.empty(len(img.pixels), dtype=np.float32)
    img.pixels.foreach_get(a)
    a = a.reshape(img.size[1], img.size[0], 4)
    bpy.data.images.remove(img)
    return a


# IL VELO. Un raccoglitore d'ombre registra ANCHE l'occlusione ambientale
# lievissima del cielo: tutta la cella esce con un alfa di 1-2 su 255, cioe'
# un quadrato fantasma che su un prato disegnato si vede come una toppa e
# che comunque costa fusione su ogni pixel. Sotto SOGLIA_VELO l'alfa si
# azzera. E' l'unico ritocco fatto ai pixel cotti, ed e' dichiarato.
# 8/255 misurato. A 6/255 restavano due pixel per cella esattamente sul
# bordo, in 6 celle su 64, e facevano sembrare tagliato uno sprite che non
# lo e'. Sotto il 3% di alfa non c'e' penombra vera: c'e' solo il velo.
SOGLIA_VELO = 8.0 / 255.0


def impacchetta(modo, nome_file):
    """griglia: colonna = fotogramma, riga = direzione"""
    W = LATO_PX * N_FOT
    H = LATO_PX * N_DIR
    atl = np.zeros((H, W, 4), dtype=np.float32)
    riquadri = []
    velo = 0.0
    for d in range(N_DIR):
        for f in range(N_FOT):
            c = leggi(os.path.join(CELLE, "%s-d%d-f%d.png" % (modo, d, f)))
            velo = max(velo, float(c[0, 0, 3]), float(c[-1, -1, 3]))
            spegni = c[:, :, 3] < SOGLIA_VELO
            c[spegni, :] = 0.0
            # le righe di Blender vanno dal basso: la riga 0 dell'atlante
            # (in alto) e' la direzione 0, quindi si scrive dal fondo
            y0 = (N_DIR - 1 - d) * LATO_PX
            atl[y0:y0 + LATO_PX, f * LATO_PX:(f + 1) * LATO_PX, :] = c
            al = c[:, :, 3]
            ys, xs = np.nonzero(al > 0.0)
            if len(ys):
                riquadri.append((xs.min(), xs.max(), LATO_PX - 1 - ys.max(), LATO_PX - 1 - ys.min()))
    print("  %s: velo agli angoli %.4f (soglia %.4f)" % (modo, velo, SOGLIA_VELO))
    out = bpy.data.images.new(nome_file, width=W, height=H, alpha=True, float_buffer=False)
    out.colorspace_settings.name = 'Non-Color'
    out.alpha_mode = 'CHANNEL_PACKED'
    out.pixels.foreach_set(atl.reshape(-1))
    out.file_format = 'PNG'
    p = os.path.join(USCITA, nome_file)
    out.filepath_raw = p
    out.save()
    bpy.data.images.remove(out)
    return p, riquadri


print("")
print("== conto dell'inquadratura ==")
print("  cella                %d px" % LATO_PX)
print("  figura nella cella   %.0f px di altezza a schermo" % FIG_PX)
print("  inquadratura         %.4f m per lato (ortho_scale)" % ORTHO)
print("  scala                %.2f px per metro, %.4f px per unita' di gioco" % (PX_PER_M, PX_PER_UG))
print("  appoggio             (%.2f ; %.2f) px dentro la cella" % (APP_X, APP_Y))
print("")

# FORNO_SOLO_IMPACCHETTA=1 rimonta l'atlante dalle celle gia' su disco:
# rifare la griglia costa un secondo, ricuocerla costa quattro minuti, e
# le due cose non devono stare attaccate.
VECCHIO = None
if os.environ.get('FORNO_SOLO_IMPACCHETTA'):
    print("  (celle gia' cotte: si rimonta soltanto)")
    # i tempi di cottura sono una MISURA e non si perdono nel rimontaggio:
    # si rileggono dal JSON precedente e si riscrivono tali e quali
    try:
        with open(os.path.join(USCITA, "corsa.json"), encoding="utf-8") as fh:
            VECCHIO = json.load(fh)["tempi_s"]
    except Exception:
        VECCHIO = None
    tempi_b = tempi_m = [0.0]
    t_b = t_m = 0.0
else:
    t_b0 = time.time()
    tempi_b = cuoci('bellezza', 48, 6, True, 'Standard', True)
    t_b = time.time() - t_b0
    t_m0 = time.time()
    tempi_m = cuoci('maschera', 8, 0, False, 'Raw', False)
    t_m = time.time() - t_m0

t_p0 = time.time()
pb, riq_b = impacchetta('bellezza', "corsa-atlante.png")
pm, riq_m = impacchetta('maschera', "corsa-maschera.png")
t_p = time.time() - t_p0

x0 = min(r[0] for r in riq_b); x1 = max(r[1] for r in riq_b)
y0 = min(r[2] for r in riq_b); y1 = max(r[3] for r in riq_b)
alt_fig = max(r[3] for r in riq_m) - min(r[2] for r in riq_m) + 1  # senza ombra

meta = {
    "verbo": "corsa",
    "atlante": os.path.basename(pb),
    "maschera": os.path.basename(pm),
    "lato_cella_px": LATO_PX,
    "direzioni": N_DIR,
    "fotogrammi": N_FOT,
    "griglia": "colonna = fotogramma, riga = direzione",
    "appoggio_px": {"x": round(APP_X, 2), "y": round(APP_Y, 2)},
    "appoggio_nota": "pixel del punto in cui i piedi toccano il campo, misurato "
                     "dall'angolo in alto a sinistra della cella; il gioco deve "
                     "disegnare la cella con quel punto sopra la posizione del giocatore",
    "px_per_unita_gioco": round(PX_PER_UG, 5),
    "scala_nota": "la figura in piedi vale RIG_H*P_DIS = 40.12 unita' di gioco. "
                  "Il gioco disegna la cella con drawImage scalata di k = S2/px_per_unita_gioco: "
                  "larghezza e altezza a schermo = lato_cella_px*k, e l'angolo alto-sinistro va "
                  "in (sx - appoggio.x*k ; sy - appoggio.y*k) dove (sx,sy) e' il punto del campo "
                  "sotto i piedi. A S2 = 2.0439 il fattore e' 1 e lo sprite non si ricampiona.",
    "yaw_gradi": [round(360.0 * d / N_DIR, 1) for d in range(N_DIR)],
    "formula_direzione": "k = round(atan2(hx, hy)/(pi/4)) mod 8, con (hx,hy) versore di "
                         "marcia in coordinate campo (x a destra, y verso il basso dello schermo)",
    "frequenza_ciclo_hz": 2.6,
    "frequenza_nota": "CLIPS.corsa.freq del gioco: 2,6 cicli al secondo, cioe' 20,8 "
                      "fotogrammi di sprite al secondo con 8 fotogrammi per ciclo",
    "maschera_nota": "R = maglia, G = pantaloncini, B = 0; il valore E' la copertura "
                     "del pixel (cottura in Raw, senza tono), quindi si usa come peso di "
                     "miscela. L'ombra ha maschera 0 e non va ricolorata.",
    "colore_neutro": {"maglia": 0.62, "panta": 0.72},
    "camera": {"tipo": "ortografica", "elevazione_gradi": ELEV, "ortho_scale_m": round(ORTHO, 4),
               "mira_z_m": MIRA_Z},
    "sole": {"elevazione_gradi": SOLE_ELEV, "azimut_rz_gradi": round(math.degrees(SOLE_RZ), 2)},
    "riquadro_alfa_max": {"x0": int(x0), "x1": int(x1), "y0": int(y0), "y1": int(y1)},
    "tocca_il_bordo": bool(x0 <= 0 or y0 <= 0 or x1 >= LATO_PX - 1 or y1 >= LATO_PX - 1),
    "altezza_figura_in_piedi_px": FIG_PX,
    "altezza_figura_misurata_px": int(alt_fig),
    "altezza_nota": "la prima e' l'altezza per cui e' tarata la scala (l'uomo in piedi, "
                    "cioe' le 40,12 unita' del gioco); la seconda e' il riquadro verticale "
                    "vero della sagoma in corsa, che e' piu' alto perche' la falcata porta "
                    "gli arti in profondita' e la profondita' pesa sin(42) sullo schermo",
    "motore": "CYCLES CPU",
    "campioni": {"bellezza": 48, "maschera": 8},
    "tempi_s": VECCHIO if VECCHIO else {
        "bellezza_totale": round(t_b, 1),
        "bellezza_per_cella": round(sum(tempi_b) / len(tempi_b), 2),
        "maschera_totale": round(t_m, 1),
        "maschera_per_cella": round(sum(tempi_m) / len(tempi_m), 2),
        "impacchettamento": round(t_p, 1),
        "tutto": round(time.time() - t_avvio, 1),
    },
}
with open(os.path.join(USCITA, "corsa.json"), "w", encoding="utf-8") as fh:
    json.dump(meta, fh, ensure_ascii=False, indent=2)

print("")
print("FORNO CORSA OK")
print("  atlante   %s  (%d x %d)" % (pb, LATO_PX * N_FOT, LATO_PX * N_DIR))
print("  maschera  %s" % pm)
print("  peso      atlante %d byte, maschera %d byte"
      % (os.path.getsize(pb), os.path.getsize(pm)))
print("  riquadro alfa piu' largo su tutte le celle: x %d..%d  y %d..%d (cella 0..%d)"
      % (x0, x1, y0, y1, LATO_PX - 1))
print("  altezza figura misurata (senza ombra): %d px" % alt_fig)
print("  appoggio  (%.2f ; %.2f) px" % (APP_X, APP_Y))
print("  tempi     bellezza %.1f s (%.2f s/cella), maschera %.1f s (%.2f s/cella), "
      "impacchetta %.1f s, tutto %.1f s"
      % (t_b, sum(tempi_b) / len(tempi_b), t_m, sum(tempi_m) / len(tempi_m), t_p,
         time.time() - t_avvio))
