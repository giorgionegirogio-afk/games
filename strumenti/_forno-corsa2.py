# -*- coding: utf-8 -*-
"""
FORNO CORSA 2 — il calciatore, non piu' il manichino.

Il primo forno (_forno-corsa.py) provava la CATENA: camera, ombra nel canale
alfa, maschera di ricolorazione, atlante. Il soggetto pero' era il manichino
di _forno-prova.py: teste sferiche, arti a cilindri uguali, cosce col
materiale dei calzoncini. Questo file rifa' il SOGGETTO e tiene la catena.

COSA E' CAMBIATO, in ordine di peso sull'immagine:
  · niente piu' primitive. Ogni pezzo e' una superficie di rivoluzione
    generata da codice (`tubo`): una polilinea di giunti piu' un profilo di
    raggi, con anelli ellittici (profondita' != larghezza) e calotte tonde.
    Cosi' una coscia puo' essere grossa all'anca e sottile al ginocchio, e
    un polpaccio puo' avere il ventre a un quarto dalla piega — che e' la
    differenza fra una gamba e un tubo;
  · torso, bacino e spalle sono UN loft solo con anelli di raggio variabile
    (vita stretta, torace pieno, spalle larghe e schiacciate), poi
    Subdivision di livello 1: non ci sono piu' scatole;
  · la testa e' un loft che si rastrema al mento e sporge all'occipite, con
    naso, arcata, occhi, orecchie e capelli con attaccatura — non due sfere;
  · SEI MATERIALI DISTINTI, e la coscia adesso e' PELLE. I calzoncini sono
    un capo a parte che scende sopra le cosce; i calzettoni salgono sopra il
    ginocchio; le scarpe sono un pezzo loro;
  · la maglia e' un secondo loft, gonfiato sopra il torso, con una PIEGA
    vera nella geometria (modulazione dei raggi in giro e in altezza) e la
    manica corta: la sagoma ha uno scalino dove finisce il tessuto.

MASCHERA a tre canali: R = maglia, G = pantaloncini, B = calzettoni.

Si lancia cosi':
  blender --background --python strumenti/_forno-corsa2.py -- <cartella> [lato] [dir] [fot] [figpx]
"""
import bpy, sys, math, os, time, json
import numpy as np
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
USCITA  = os.path.abspath(argv[0]) if argv else os.path.abspath("_forno-corsa2")
LATO_PX = int(argv[1]) if len(argv) > 1 else 160
N_DIR   = int(argv[2]) if len(argv) > 2 else 8
N_FOT   = int(argv[3]) if len(argv) > 3 else 8
FIG_PX  = float(argv[4]) if len(argv) > 4 else 82.0

H_UOMO, ELEV = 1.80, 42.0
RIG_H_P = 34.0 * 1.18
er = math.radians(ELEV)
ALT_SCHERMO_M = H_UOMO * math.cos(er)
ORTHO = ALT_SCHERMO_M * LATO_PX / FIG_PX
PX_PER_M = FIG_PX / ALT_SCHERMO_M
PX_PER_UG = FIG_PX / RIG_H_P
MIRA_Z = 0.50
SOLE_ELEV, SOLE_RZ = 63.0, math.radians(143.13)

t_avvio = time.time()
bpy.ops.wm.read_factory_settings(use_empty=True)
scena = bpy.context.scene


def _albero(m):
    if m.node_tree is None:
        m.use_nodes = True
    return m.node_tree


def materiale(nome, colore, ruvido=0.62, metallo=0.0, sheen=0.0):
    m = bpy.data.materials.new(nome)
    b = _albero(m).nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*colore, 1.0)
    b.inputs["Roughness"].default_value = ruvido
    b.inputs["Metallic"].default_value = metallo
    if sheen and "Sheen Weight" in b.inputs:
        b.inputs["Sheen Weight"].default_value = sheen
    return m


def materiale_piatto(nome, colore):
    m = bpy.data.materials.new(nome)
    nt = _albero(m)
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*colore, 1.0)
    em.inputs['Strength'].default_value = 1.0
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    return m


# SEI MATERIALI, e sono sei davvero: la coscia non porta piu' il materiale
# dei calzoncini. Maglia, calzoncini e calzettoni escono in grigi neutri
# perche' sono i tre capi che il gioco ricolora.
PAL = {
    'bellezza': {
        'maglia':  materiale("maglia",  (0.62, 0.62, 0.62), 0.78, sheen=0.25),
        'panta':   materiale("panta",   (0.72, 0.72, 0.72), 0.74, sheen=0.20),
        'calza':   materiale("calza",   (0.66, 0.66, 0.66), 0.85, sheen=0.30),
        'pelle':   materiale("pelle",   (0.76, 0.55, 0.41), 0.52),
        'scarpa':  materiale("scarpa",  (0.07, 0.07, 0.09), 0.28),
        'capelli': materiale("capelli", (0.13, 0.09, 0.06), 0.70),
    },
    'maschera': {
        'maglia':  materiale_piatto("m_maglia",  (1.0, 0.0, 0.0)),
        'panta':   materiale_piatto("m_panta",   (0.0, 1.0, 0.0)),
        'calza':   materiale_piatto("m_calza",   (0.0, 0.0, 1.0)),
        'pelle':   materiale_piatto("m_pelle",   (0.0, 0.0, 0.0)),
        'scarpa':  materiale_piatto("m_scarpa",  (0.0, 0.0, 0.0)),
        'capelli': materiale_piatto("m_capelli", (0.0, 0.0, 0.0)),
    },
}

PEZZI = []


def _telaio(t):
    """assi trasversali dell'anello: u = profondita', v = larghezza"""
    t = t.normalized()
    rif = Vector((1, 0, 0)) if abs(t.x) < 0.9 else Vector((0, 1, 0))
    u = rif.cross(t)
    if u.length < 1e-6:
        u = Vector((0, 1, 0))
    u.normalize()
    v = t.cross(u).normalized()
    return u, v


def tubo(nome, mat, giunti, raggi, n=18, calotta=(True, True), piega=None, suddividi=0):
    """LA PRIMITIVA DI QUESTO FILE. giunti = polilinea di Vector; raggi =
       lista di (profondita', larghezza) uno per giunto. Costruisce anelli
       ellittici perpendicolari alla tangente locale, li cuce a quadrilateri
       e chiude con calotte tonde. `piega` e' una funzione (i, ang) -> k che
       moltiplica il raggio: e' con quella che la maglia prende le grinze."""
    P = [Vector(g) for g in giunti]
    m = len(P)
    tang = []
    for i in range(m):
        if i == 0:
            t = P[1] - P[0]
        elif i == m - 1:
            t = P[-1] - P[-2]
        else:
            t = P[i + 1] - P[i - 1]
        tang.append(t.normalized())
    vs, fs = [], []

    def anello(c, t, rp, rl, k=1.0):
        u, v = _telaio(t)
        base = len(vs)
        for j in range(n):
            a = 2 * math.pi * j / n
            kk = k * (piega(len(vs) // n, a) if piega else 1.0)
            vs.append(tuple(c + u * (math.cos(a) * rp * kk) + v * (math.sin(a) * rl * kk)))
        return base

    anelli = []
    if calotta[0]:
        rp, rl = raggi[0]
        for q in (0.34, 0.66, 0.88):
            d = math.sqrt(max(0.0, 1 - q * q))
            anelli.append(anello(P[0] - tang[0] * (min(rp, rl) * d), tang[0], rp * q, rl * q))
    for i in range(m):
        anelli.append(anello(P[i], tang[i], raggi[i][0], raggi[i][1]))
    if calotta[1]:
        rp, rl = raggi[-1]
        for q in (0.88, 0.66, 0.34):
            d = math.sqrt(max(0.0, 1 - q * q))
            anelli.append(anello(P[-1] + tang[-1] * (min(rp, rl) * d), tang[-1], rp * q, rl * q))
    for a in range(len(anelli) - 1):
        b0, b1 = anelli[a], anelli[a + 1]
        for j in range(n):
            j2 = (j + 1) % n
            fs.append((b0 + j, b0 + j2, b1 + j2, b1 + j))
    if calotta[0]:
        p0 = len(vs); vs.append(tuple(P[0] - tang[0] * min(*raggi[0])))
        for j in range(n):
            fs.append((anelli[0] + (j + 1) % n, anelli[0] + j, p0))
    if calotta[1]:
        p1 = len(vs); vs.append(tuple(P[-1] + tang[-1] * min(*raggi[-1])))
        for j in range(n):
            fs.append((anelli[-1] + j, anelli[-1] + (j + 1) % n, p1))
    me = bpy.data.meshes.new(nome)
    me.from_pydata(vs, [], fs)
    me.validate()
    o = bpy.data.objects.new(nome, me)
    scena.collection.objects.link(o)
    o.data.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True
    if suddividi:
        md = o.modifiers.new("sub", 'SUBSURF')
        md.levels = md.render_levels = suddividi
    PEZZI.append(o)
    return o


def sferoide(nome, mat, centro, raggi, rot=(0, 0, 0), n=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n * 2, ring_count=n, location=centro)
    o = bpy.context.object
    o.scale = raggi
    o.rotation_euler = rot
    o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    PEZZI.append(o)
    return o


# --------------------------------------------------- proporzioni di un uomo
Z_ANCA, Z_BAC, Z_VITA, Z_TOR, Z_SPA, Z_COLLO = 0.92, 1.00, 1.13, 1.32, 1.455, 1.505
L_COSCIA, L_STINCO, DX_ANCA, DX_SPALLA = 0.44, 0.42, 0.093, 0.183
L_BRACC, L_AVAMB = 0.30, 0.265
A_COSCIA = math.radians(34.0)
K0, K1 = math.radians(10.0), math.radians(68.0)
A_BRACC = math.radians(26.0)
LEAN = math.radians(9.0)


def ang_gamba(p):
    c = -A_COSCIA * math.cos(2 * math.pi * p)
    return c, c + K0 + K1 * max(0.0, -math.sin(2 * math.pi * p))


def ang_braccio(p):
    s = -A_BRACC * math.cos(2 * math.pi * p)
    # IL GOMITO A 58+14 GRADI portava l'avambraccio a 98 gradi dalla
    # verticale: orizzontale netto, e con il gomito nascosto dietro il busto
    # l'avambraccio sembrava staccato dalla spalla e galleggiante. A 46+10 il
    # braccio resta un braccio piegato e il gomito si vede.
    return s, s - (math.radians(46.0) + math.radians(10.0) * math.cos(2 * math.pi * p))


def giu(z0, ang, L):
    return Vector((0, math.sin(ang) * L, -math.cos(ang) * L))


def costruisci(u, modo):
    M = PAL[modo]
    del PEZZI[:]
    gd = ang_gamba(u); gs = ang_gamba(u + 0.5)
    bd = ang_braccio(u + 0.5); bs = ang_braccio(u)

    def caviglia_z(a):
        return Z_ANCA - math.cos(a[0]) * L_COSCIA - math.cos(a[1]) * L_STINCO
    dz = -min(caviglia_z(gd), caviglia_z(gs)) + 0.068     # 0.068 = caviglia-suolo

    bacino = Vector((0, 0, Z_BAC + dz))

    def su(P):
        """inclinazione in avanti del busto, attorno al bacino"""
        d = Vector(P) - bacino
        c, s = math.cos(LEAN), math.sin(LEAN)
        return bacino + Vector((d.x, d.y * c - d.z * s, d.y * s + d.z * c))

    torsione = math.radians(7.0) * math.cos(2 * math.pi * u)

    def gira(P, a):
        c, s = math.cos(a), math.sin(a)
        d = Vector(P) - bacino
        return bacino + Vector((d.x * c - d.y * s, d.x * s + d.y * c, d.z))

    # ---- BUSTO: un loft solo, vita stretta e spalle larghe e schiacciate
    anelli_busto = [
        (Vector((0, 0, Z_ANCA - 0.02 + dz)), (0.100, 0.148)),
        (Vector((0, 0, Z_BAC + dz)),         (0.108, 0.156)),
        (Vector((0, 0, Z_VITA + dz)),        (0.098, 0.132)),
        (Vector((0, -0.006, 1.24 + dz)),     (0.108, 0.155)),
        (Vector((0, -0.008, Z_TOR + dz)),    (0.115, 0.176)),
        (Vector((0, -0.004, 1.42 + dz)),     (0.112, 0.198)),
        (Vector((0, 0, Z_SPA + dz)),         (0.100, 0.196)),
    ]
    tubo("busto", M['pelle'], [gira(su(p), torsione * (i - 2) / 5.0) for i, (p, _) in enumerate(anelli_busto)],
         [r for _, r in anelli_busto], n=22, suddividi=1)

    # ---- COLLO E TESTA: rastremata al mento, sporgente all'occipite
    collo = su(Vector((0, -0.004, Z_COLLO + dz)))
    tubo("collo", M['pelle'], [su(Vector((0, -0.002, 1.44 + dz))), collo,
                               su(Vector((0, -0.010, 1.555 + dz)))],
         [(0.058, 0.062), (0.052, 0.056), (0.050, 0.054)], n=16, calotta=(False, False))
    testa = [
        (Vector((0, -0.012, 1.560 + dz)), (0.055, 0.050)),
        (Vector((0, -0.016, 1.598 + dz)), (0.072, 0.064)),
        (Vector((0, -0.010, 1.640 + dz)), (0.086, 0.077)),
        (Vector((0, 0.000, 1.685 + dz)),  (0.092, 0.082)),
        (Vector((0, 0.006, 1.730 + dz)),  (0.086, 0.077)),
        (Vector((0, 0.008, 1.768 + dz)),  (0.060, 0.055)),
    ]
    tubo("testa", M['pelle'], [su(p) for p, _ in testa], [r for _, r in testa],
         n=20, calotta=(True, True), suddividi=1)
    # volto: arcata, naso, occhi, orecchie
    sferoide("arcata", M['pelle'], su(Vector((0, -0.070, 1.658 + dz))), (0.062, 0.020, 0.014))
    tubo("naso", M['pelle'], [su(Vector((0, -0.062, 1.652 + dz))), su(Vector((0, -0.092, 1.616 + dz)))],
         [(0.014, 0.013), (0.017, 0.016)], n=12)
    for sx in (-1, 1):
        sferoide("occhio", M['capelli'], su(Vector((sx * 0.030, -0.072, 1.648 + dz))), (0.012, 0.008, 0.009))
        sferoide("orecchio", M['pelle'], su(Vector((sx * 0.082, -0.004, 1.645 + dz))), (0.010, 0.020, 0.026))
    # capelli: calotta con attaccatura, non una sfera
    cap = [
        (Vector((0, 0.022, 1.640 + dz)), (0.090, 0.081)),
        (Vector((0, 0.014, 1.676 + dz)), (0.097, 0.088)),
        (Vector((0, 0.006, 1.722 + dz)), (0.092, 0.083)),
        (Vector((0, 0.006, 1.766 + dz)), (0.066, 0.060)),
    ]
    tubo("capelli", M['capelli'], [su(p) for p, _ in cap], [r for _, r in cap], n=20, suddividi=1)

    # ---- MAGLIA: secondo loft sopra il busto, con la piega e la manica
    def piega(i, a):
        return 1.0 + 0.030 * math.sin(3.0 * a + 1.7 * i) + 0.018 * math.sin(5.0 * a - 0.9 * i)
    mag = [
        (Vector((0, 0, Z_ANCA + 0.030 + dz)), (0.106, 0.152)),
        (Vector((0, 0, Z_VITA + dz)),         (0.107, 0.142)),
        (Vector((0, -0.008, Z_TOR + dz)),     (0.124, 0.186)),
        (Vector((0, -0.004, 1.425 + dz)),     (0.121, 0.207)),
        (Vector((0, 0, Z_SPA + 0.012 + dz)),  (0.104, 0.202)),
    ]
    tubo("maglia", M['maglia'], [gira(su(p), torsione * (i - 1) / 4.0) for i, (p, _) in enumerate(mag)],
         [r for _, r in mag], n=24, calotta=(False, True), piega=piega, suddividi=1)

    # ---- CALZONCINI: capo a parte, scende sopra le cosce
    pan = [
        (Vector((0, 0, Z_ANCA + 0.055 + dz)), (0.104, 0.150)),
        (Vector((0, 0, Z_ANCA - 0.030 + dz)), (0.112, 0.163)),
        (Vector((0, 0.004, Z_ANCA - 0.135 + dz)), (0.104, 0.168)),
    ]
    tubo("panta", M['panta'], [su(p) for p, _ in pan], [r for _, r in pan],
         n=22, calotta=(False, False), suddividi=1)

    # ---- ARTI
    for sx, (a_su, a_giu) in ((-1, gs), (1, gd)):
        anca = Vector((sx * DX_ANCA, 0, Z_ANCA + dz))
        gin = anca + giu(0, a_su, L_COSCIA)
        cav = gin + giu(0, a_giu, L_STINCO)
        # coscia: PELLE, grossa all'anca e sottile al ginocchio
        tubo("coscia", M['pelle'],
             [anca, anca.lerp(gin, 0.45), gin],
             [(0.088, 0.085), (0.074, 0.072), (0.060, 0.059)], n=16, calotta=(False, False))
        # calzettone: sale sopra il ginocchio, ventre del polpaccio a 1/4
        tubo("calza", M['calza'],
             [gin.lerp(anca, 0.16), gin, gin.lerp(cav, 0.28), gin.lerp(cav, 0.62), cav],
             [(0.062, 0.061), (0.060, 0.059), (0.070, 0.066), (0.052, 0.050), (0.036, 0.035)],
             n=16, calotta=(True, False))
        # scarpa: dal tallone alla punta, schiacciata
        avanti = Vector((0, math.sin(a_giu), -math.cos(a_giu)))
        pianta = Vector((0, -1, 0)) if abs(avanti.z) > 0.3 else Vector((0, 0, -1))
        tal = cav + Vector((0, 0.040, -0.052))
        pun = cav + Vector((0, -0.135, -0.062))
        tubo("scarpa", M['scarpa'],
             [tal, cav + Vector((0, -0.020, -0.058)), cav + Vector((0, -0.085, -0.062)), pun],
             [(0.030, 0.036), (0.034, 0.042), (0.029, 0.037), (0.017, 0.023)], n=14)

    for sx, (a_su, a_giu) in ((-1, bs), (1, bd)):
        spalla = su(Vector((sx * DX_SPALLA, 0, Z_SPA - 0.02 + dz)))
        gom = spalla + giu(0, a_su, L_BRACC)
        pol = gom + giu(0, a_giu, L_AVAMB)
        # il deltoide e' una spalla, non una spallina: a 0,056 leggeva come
        # imbottitura da football americano nella vista frontale
        sferoide("deltoide", M['maglia'], spalla + Vector((sx * 0.004, 0, 0.006)), (0.046, 0.045, 0.042))
        # manica corta: il tessuto finisce a meta' del braccio, e si vede
        tubo("manica", M['maglia'], [spalla, spalla.lerp(gom, 0.42)],
             [(0.056, 0.054), (0.046, 0.045)], n=16, calotta=(False, False), piega=piega)
        # LA RADICE DEL BRACCIO ENTRA NEL BUSTO. Prima partiva esattamente
        # sulla spalla con le calotte aperte: rimpicciolito il deltoide, il
        # tubo restava scoperto e si vedeva la rottura del rig.
        radice = spalla + Vector((-sx * 0.030, 0, 0.012))
        tubo("braccio", M['pelle'], [radice, spalla, spalla.lerp(gom, 0.55), gom],
             [(0.052, 0.050), (0.050, 0.048), (0.041, 0.040), (0.035, 0.034)],
             n=14, calotta=(False, True))
        tubo("avambraccio", M['pelle'],
             [gom, gom.lerp(pol, 0.35), pol],
             [(0.038, 0.037), (0.032, 0.031), (0.024, 0.024)], n=14, calotta=(True, False))
        mano = pol + (pol - gom).normalized() * 0.055
        sferoide("mano", M['pelle'], mano, (0.026, 0.034, 0.044),
                 rot=(a_giu, 0, 0))

    bpy.ops.object.select_all(action='DESELECT')
    for p in PEZZI:
        p.select_set(True)
    bpy.context.view_layer.objects.active = PEZZI[0]
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = "calciatore_%s_%02d" % (modo, int(u * 100))
    return o


# --------------------------------------------------------------- scena
bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0))
prato = bpy.context.object
prato.data.materials.append(materiale("prato", (0.20, 0.20, 0.20), 0.92))
prato.is_shadow_catcher = True

bpy.ops.object.light_add(type='SUN', location=(-6, -4, 4))
sole = bpy.context.object
sole.data.energy = 4.2
# L'OMBRA ERA UNA LASTRA. Misurato sulle otto celle: area dell'ombra 1,11
# volte quella del corpo e alfa mediana 0,79 — nera quanto un buco. Il sole
# a 2,4 gradi di disco e' un sole da deserto: bordo netto a ogni distanza.
# A 9 gradi la penombra cresce con la distanza dal punto di contatto, quindi
# il piede resta denso e il resto si apre: e' il modo fisico di ottenere
# l'«ombra piu' densa al contatto» invece di dipingerla.
sole.data.angle = math.radians(9.0)
sole.data.color = (1.0, 0.95, 0.88)
sole.rotation_euler = (math.radians(90.0 - SOLE_ELEV), 0, SOLE_RZ)

bpy.ops.object.light_add(type='AREA', location=(4, 3, 3.2))
riemp = bpy.context.object
riemp.data.energy = 70
riemp.data.size = 6
riemp.data.color = (0.84, 0.89, 1.00)
riemp.rotation_euler = (math.radians(-38), 0, math.radians(140))
riemp.data.use_shadow = False

mondo = bpy.data.worlds.new("mondo")
scena.world = mondo
ntm = _albero(mondo)
ntm.nodes["Background"].inputs[0].default_value = (0.42, 0.50, 0.62, 1)
# il cielo e' la sola luce che entra DENTRO l'ombra: a 0,45 di un blu quasi
# nero l'ombra non aveva fondo, e l'alfa arrivava a 0,98
CIELO = 1.60
ntm.nodes["Background"].inputs[1].default_value = CIELO

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
scena.render.resolution_x = scena.render.resolution_y = LATO_PX
scena.render.film_transparent = True
scena.render.image_settings.file_format = 'PNG'
scena.render.image_settings.color_mode = 'RGBA'
scena.render.image_settings.color_depth = '8'
scena.render.image_settings.compression = 90
scena.view_settings.look = 'None'

os.makedirs(USCITA, exist_ok=True)
CELLE = os.path.join(USCITA, "celle")
os.makedirs(CELLE, exist_ok=True)
bpy.context.view_layer.update()
uv = world_to_camera_view(scena, cam, Vector((0.0, 0.0, 0.0)))
APP_X, APP_Y = uv.x * LATO_PX, (1.0 - uv.y) * LATO_PX

SOGLIA_VELO = 8.0 / 255.0


def cuoci(modo, campioni, rimbalzi, denoise, vista, prato_visibile):
    scena.cycles.samples = campioni
    scena.cycles.max_bounces = rimbalzi
    scena.cycles.use_denoising = denoise
    scena.view_settings.view_transform = vista
    prato.hide_render = not prato_visibile
    ntm.nodes["Background"].inputs[1].default_value = CIELO if prato_visibile else 0.0
    tempi = []
    for f in range(N_FOT):
        uomo = costruisci(f / float(N_FOT), modo)
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


def impacchetta(modo, nome_file):
    W, H = LATO_PX * N_FOT, LATO_PX * N_DIR
    atl = np.zeros((H, W, 4), dtype=np.float32)
    riq = []
    for d in range(N_DIR):
        for f in range(N_FOT):
            c = leggi(os.path.join(CELLE, "%s-d%d-f%d.png" % (modo, d, f)))
            c[c[:, :, 3] < SOGLIA_VELO, :] = 0.0
            atl[(N_DIR - 1 - d) * LATO_PX:(N_DIR - d) * LATO_PX,
                f * LATO_PX:(f + 1) * LATO_PX, :] = c
            ys, xs = np.nonzero(c[:, :, 3] > 0)
            if len(ys):
                riq.append((xs.min(), xs.max(), LATO_PX - 1 - ys.max(), LATO_PX - 1 - ys.min()))
    out = bpy.data.images.new(nome_file, width=W, height=H, alpha=True, float_buffer=False)
    out.colorspace_settings.name = 'Non-Color'
    out.alpha_mode = 'CHANNEL_PACKED'
    out.pixels.foreach_set(atl.reshape(-1))
    out.file_format = 'PNG'
    p = os.path.join(USCITA, nome_file)
    out.filepath_raw = p
    out.save()
    bpy.data.images.remove(out)
    return p, riq


print("")
print("  cella %d px, figura %.1f px, ortho %.4f m, appoggio (%.2f ; %.2f)"
      % (LATO_PX, FIG_PX, ORTHO, APP_X, APP_Y))

t0 = time.time(); tb = cuoci('bellezza', 48, 6, True, 'Standard', True); TB = time.time() - t0
t0 = time.time(); tm = cuoci('maschera', 8, 0, False, 'Raw', False); TM = time.time() - t0
pb, rb = impacchetta('bellezza', "corsa2-atlante.png")
pm, rm = impacchetta('maschera', "corsa2-maschera.png")
x0 = min(r[0] for r in rb); x1 = max(r[1] for r in rb)
y0 = min(r[2] for r in rb); y1 = max(r[3] for r in rb)

meta = {
    "verbo": "corsa", "modello": "calciatore generato da codice (loft + Subdivision)",
    "atlante": os.path.basename(pb), "maschera": os.path.basename(pm),
    "lato_cella_px": LATO_PX, "direzioni": N_DIR, "fotogrammi": N_FOT,
    "griglia": "colonna = fotogramma, riga = direzione",
    "appoggio_px": {"x": round(APP_X, 2), "y": round(APP_Y, 2)},
    "px_per_unita_gioco": round(PX_PER_UG, 5),
    "altezza_figura_in_piedi_px": FIG_PX,
    "formula_direzione": "k = round(atan2(hx, hy)/(2*pi/N)) mod N, con (hx,hy) versore di "
                         "marcia in coordinate campo (x a destra, y verso il basso)",
    "maschera_nota": "R = maglia, G = pantaloncini, B = calzettoni; il valore E' la "
                     "copertura del pixel (cottura in Raw). Pelle, scarpe e capelli sono "
                     "neri: non si ricolorano. L'ombra non e' nella maschera.",
    "colore_neutro": {"maglia": 0.62, "panta": 0.72, "calza": 0.66},
    "materiali": ["maglia", "panta", "calza", "pelle", "scarpa", "capelli"],
    "camera": {"tipo": "ortografica", "elevazione_gradi": ELEV, "ortho_scale_m": round(ORTHO, 4),
               "mira_z_m": MIRA_Z},
    "riquadro_alfa_max": {"x0": int(x0), "x1": int(x1), "y0": int(y0), "y1": int(y1)},
    "tocca_il_bordo": bool(x0 <= 0 or y0 <= 0 or x1 >= LATO_PX - 1 or y1 >= LATO_PX - 1),
    "motore": "CYCLES CPU", "campioni": {"bellezza": 48, "maschera": 8},
    "tempi_s": {"bellezza_totale": round(TB, 1), "bellezza_per_cella": round(sum(tb) / len(tb), 2),
                "maschera_totale": round(TM, 1), "maschera_per_cella": round(sum(tm) / len(tm), 2),
                "tutto": round(time.time() - t_avvio, 1)},
}
with open(os.path.join(USCITA, "corsa2.json"), "w", encoding="utf-8") as fh:
    json.dump(meta, fh, ensure_ascii=False, indent=2)

print("")
print("FORNO CORSA 2 OK")
print("  atlante  %s  (%d x %d)  %d byte" % (pb, LATO_PX * N_FOT, LATO_PX * N_DIR, os.path.getsize(pb)))
print("  maschera %s  %d byte" % (pm, os.path.getsize(pm)))
print("  riquadro x %d..%d  y %d..%d  (cella 0..%d)  tocca il bordo: %s"
      % (x0, x1, y0, y1, LATO_PX - 1, meta["tocca_il_bordo"]))
print("  tempi    bellezza %.2f s/cella, maschera %.2f s/cella, tutto %.1f s"
      % (sum(tb) / len(tb), sum(tm) / len(tm), time.time() - t_avvio))
