# -*- coding: utf-8 -*-
"""
comune.py -- il corpo, la camera e la luce della voce #151.

TUTTO QUELLO CHE E' COMUNE AI QUATTRO SCRIPT STA QUI, e la ragione non e'
l'eleganza: e' che il corpo deve essere UNO SOLO. Se figura.py, atlante.py e
luce.py costruissero ognuno il suo uomo, le tre misure non si potrebbero
confrontare, e confrontarle e' tutto il punto della voce.

LE PROPORZIONI NON SONO SCRITTE QUI: SI LEGGONO DAL GIOCO.
misure_dal_gioco() apre CALCETTO-il-gioco.html ed estrae le costanti del rig
(N_THIGH ... N_HEADR, HIPW) e le larghezze dei SEGS. Una pipeline che si
inventa le proporzioni produce fotogrammi che non si possono confrontare con
niente. Il cancello strumenti/_t-151-blender.js verifica osso per osso che
l'abbia fatto davvero, e rilegge le costanti per conto suo.

LA CAMERA E' LA STESSA PROIEZIONE DEL GIOCO, non una che le somiglia.
Il gioco proietta cosi' (riga 8041 e seguenti):
    SX = cx + x*s
    SY = cy - (y*ce + z*se)*s        con s = hPx/(1.9*ce)
cioe' una proiezione ORTOGRAFICA con
    destra = (1, 0, 0)        su = (0, ce, se)
in coordinate di gioco (x lato, y su, z lontano dalla camera).
Una camera ortografica di Blender inclinata di (90 - E) attorno a X ha
esattamente quegli assi: il suo "su" e' (0, se, ce) in coordinate Blender,
che sono (0 lato, ce su, se lontano) in coordinate di gioco. Il conto e'
verificato in fondo a questo file da prova_proiezione(), che il cancello puo'
rilanciare: non e' una somiglianza, e' la stessa formula.

DETERMINISMO. Nessun random in nessuno script di questa cartella. Workbench,
non Cycles ne' EEVEE: nessun campionamento, nessun denoiser, nessun accumulo
temporale. Antialias fisso a 8 (un pattern enumerato, non casuale). Si lancia
sempre con --factory-startup, altrimenti le preferenze di chi esegue entrano
nel render e il PNG smette di essere riproducibile sulla macchina di un altro.
"""

import bpy
import bmesh
import json
import math
import os
import re
import sys

RADICE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
GIOCO = os.path.join(RADICE, 'CALCETTO-il-gioco.html')

# l'elevazione della camera 'alto' del gioco (riga 7488: camera(42))
ELEVAZIONE = 42.0
# l'altezza di mondo su cui il gioco normalizza la scala: s = hPx/(1.9*ce)
ALTEZZA_MONDO = 1.9

# QUANTO LA CELLA DEVE ESSERE PIU' GRANDE DELLA FIGURA FERMA, e il numero e'
# MISURATO, non scelto. Il piano diceva 1,35 a occhio; la sonda del 24
# settembre ha proiettato tutti e 192 i fotogrammi del prototipo (2 clip x 8
# direzioni x 12 pose) e ha letto la semi-estensione vera dal centro della
# cella: x 0,864 m e y 1,004 m, piu' il raggio della capsula piu' grossa
# (0,156). Apertura minima 2,319 m contro i 1,906 di 1,35: il margine che
# serve e' 1,643, e qui si tiene 1,65.
# E' UNA MISURA CHE CONTA PER IL VERDETTO, non un dettaglio di inquadratura:
# una cella di 128 px con questo margine contiene una figura alta 78 px,
# mentre il gioco la disegna alta 93. Per pareggiarla la cella deve salire a
# 160, e la memoria di texture con lei (x1,56). Il disegno procedurale questo
# margine non lo paga: traccia le linee dove vanno, senza riquadro.
MARGINE_POSA = 1.65


# ----------------------------------------------------------------- argomenti
def argomenti():
    """gli argomenti dopo '--', come li passa il cancello."""
    if '--' not in sys.argv:
        return {}
    coda = sys.argv[sys.argv.index('--') + 1:]
    fuori = {}
    i = 0
    while i < len(coda):
        if coda[i].startswith('--'):
            chiave = coda[i][2:]
            if i + 1 < len(coda) and not coda[i + 1].startswith('--'):
                fuori[chiave] = coda[i + 1]
                i += 2
            else:
                fuori[chiave] = True
                i += 1
        else:
            i += 1
    return fuori


# ------------------------------------------------------------- il gioco parla
def misure_dal_gioco():
    """le costanti del rig, lette dal gioco. Se non si leggono si alza:
    meglio nessun corpo che un corpo inventato."""
    with open(GIOCO, 'r', encoding='utf-8') as f:
        t = f.read()
    m = re.search(r'const N_THIGH=([\d.]+), N_SHIN=([\d.]+), N_UA=([\d.]+), '
                  r'N_FA=([\d.]+), N_FOOT=([\d.]+),\s*\n?\s*N_SHW=([\d.]+), '
                  r'N_HEADR=([\d.]+);', t)
    if not m:
        raise RuntimeError('le costanti del rig non si leggono nel gioco')
    h = re.search(r'const HIPW=([\d.]+);', t)
    if not h:
        raise RuntimeError('HIPW non si legge nel gioco')
    d = {
        'THIGH': float(m.group(1)), 'SHIN': float(m.group(2)),
        'UA': float(m.group(3)), 'FA': float(m.group(4)),
        'FOOT': float(m.group(5)), 'SHW': float(m.group(6)),
        'HEADR': float(m.group(7)), 'HIPW': float(h.group(1)),
    }
    # le quote della colonna, dentro corpo(): PELVIS .06, CHEST .355, NECK .46,
    # HEAD a .25 dal collo
    for nome, chiave in (('CHEST', 'CHEST_Y'), ('NECK', 'NECK_Y')):
        q = re.search(r'setJ\(' + nome + r',\s*sway\+([\d.]+)\*dx', t)
        if not q:
            raise RuntimeError('la quota di ' + nome + ' non si legge in corpo()')
        d[chiave] = float(q.group(1))
    p = re.search(r'setJ\(PELVIS, sway\+([\d.]+)\*dx', t)
    d['PELVIS_Y'] = float(p.group(1)) if p else 0.06
    d['TESTA_OSSO'] = 0.25
    # le larghezze dei SEGS: servono ai raggi delle capsule
    d['W'] = {}
    for a, b, w in re.findall(r"\{a:(\w+),\s*b:(\w+),\s*w:([\d.]+)", t):
        d['W'][a + '-' + b] = float(w)
    return d


# -------------------------------------------------------------- lo scheletro
# i diciotto giunti del gioco, stessi nomi e stesso ordine (riga 5111)
GIUNTI = ['PELVIS', 'CHEST', 'NECK', 'HEAD',
          'SHL', 'ELL', 'HAL', 'SHR', 'ELR', 'HAR',
          'HIPL', 'KNL', 'FTL', 'HIPR', 'KNR', 'FTR', 'TOL', 'TOR']

# le ossa dell'armatura: (nome, giunto padre, giunto figlio)
OSSA = [
    ('bacino-petto', 'PELVIS', 'CHEST'),
    ('petto-collo', 'CHEST', 'NECK'),
    ('collo-testa', 'NECK', 'HEAD'),
    ('spalla-sx', 'CHEST', 'SHL'), ('braccio-sx', 'SHL', 'ELL'), ('avambraccio-sx', 'ELL', 'HAL'),
    ('spalla-dx', 'CHEST', 'SHR'), ('braccio-dx', 'SHR', 'ELR'), ('avambraccio-dx', 'ELR', 'HAR'),
    ('anca-sx', 'PELVIS', 'HIPL'), ('coscia-sx', 'HIPL', 'KNL'),
    ('polpaccio-sx', 'KNL', 'FTL'), ('piede-sx', 'FTL', 'TOL'),
    ('anca-dx', 'PELVIS', 'HIPR'), ('coscia-dx', 'HIPR', 'KNR'),
    ('polpaccio-dx', 'KNR', 'FTR'), ('piede-dx', 'FTR', 'TOR'),
]

# le capsule da disegnare, con la loro tinta di kit: e' la stessa tabella
# SEGS del gioco (riga 7522), stessi segmenti e stesse larghezze.
CAPSULE = [
    ('PELVIS', 'NECK', 'PELVIS-NECK', 'maglia'),
    ('HIPL', 'HIPR', 'HIPL-HIPR', 'pantaloncini'),
    ('NECK', 'HEAD', 'NECK-HEAD', 'pelle'),
    ('SHR', 'ELR', 'SHR-ELR', 'maglia'),
    ('ELR', 'HAR', 'ELR-HAR', 'pelle'),
    ('SHL', 'ELL', 'SHL-ELL', 'maglia'),
    ('ELL', 'HAL', 'ELL-HAL', 'pelle'),
    ('HIPR', 'KNR', 'HIPR-KNR', 'pantaloncini'),
    ('KNR', 'FTR', 'KNR-FTR', 'calze'),
    ('FTR', 'TOR', 'FTR-TOR', 'scarpe'),
    ('HIPL', 'KNL', 'HIPL-KNL', 'pantaloncini'),
    ('KNL', 'FTL', 'KNL-FTL', 'calze'),
    ('FTL', 'TOL', 'FTL-TOL', 'scarpe'),
]

# LA DIVISA E' UNA SOLA, ED E' IL PUNTO PIU' IMPORTANTE DEL PROTOTIPO.
# Nel gioco queste cinque tinte sono variabili di runtime: le squadre nascono
# generate, non da un elenco chiuso. Uno sprite le CUOCE. Renderizzare una
# divisa sola e' il caso PIU' FAVOREVOLE all'atlas (nessuna maschera, nessuna
# ricolorazione): se non regge nemmeno cosi', non regge.
KIT = {
    'maglia': (0.83, 0.13, 0.16, 1.0),
    'pantaloncini': (0.10, 0.10, 0.12, 1.0),
    'calze': (0.83, 0.13, 0.16, 1.0),
    'scarpe': (0.96, 0.94, 0.20, 1.0),
    'pelle': (0.78, 0.57, 0.42, 1.0),
}


def posa_riposo(mis):
    """la posa a T-stance da cui nasce l'armatura. Coordinate di GIOCO
    (x lato, y su, z lontano). E' la stessa che corpo() scrive a lean 0."""
    y = 0.93  # la quota del bacino in piedi (le pose in piedi stanno .78-.93)
    g = {}
    g['PELVIS'] = (0.0, y + mis['PELVIS_Y'], 0.0)
    g['CHEST'] = (0.0, y + mis['CHEST_Y'], 0.0)
    g['NECK'] = (0.0, y + mis['NECK_Y'], 0.0)
    g['HEAD'] = (0.0, y + mis['NECK_Y'] + mis['TESTA_OSSO'], 0.0)
    for lato, s in (('L', -1.0), ('R', 1.0)):
        sx = s * mis['SHW']
        g['SH' + lato] = (sx, y + mis['CHEST_Y'] + 0.06, 0.0)
        g['EL' + lato] = (sx, y + mis['CHEST_Y'] + 0.06 - mis['UA'], 0.0)
        g['HA' + lato] = (sx, y + mis['CHEST_Y'] + 0.06 - mis['UA'] - mis['FA'], 0.0)
        hx = s * mis['HIPW']
        g['HIP' + lato] = (hx, y, 0.0)
        g['KN' + lato] = (hx, y - mis['THIGH'], 0.0)
        g['FT' + lato] = (hx, y - mis['THIGH'] - mis['SHIN'], 0.0)
        g['TO' + lato] = (hx, y - mis['THIGH'] - mis['SHIN'], mis['FOOT'])
    return g


def gioco_a_blender(p):
    """(x lato, y su, z lontano) -> (X, Y, Z) di Blender, che e' Z-su."""
    return (p[0], p[2], p[1])


# --------------------------------------------------------------- l'armatura
def costruisci_armatura(mis):
    """l'armatura vera, con le ossa nella gerarchia del rig. Serve perche'
    le clip si animino come si animano in Blender -- rotazioni sulle ossa e
    FK valutata da Blender -- invece che come un conto di trigonometria
    riscritto a mano: il mandato chiede di RIGGARE e ANIMARE, non di
    ricalcolare le pose del gioco in Python."""
    riposo = posa_riposo(mis)
    dati = bpy.data.armatures.new('rig151')
    og = bpy.data.objects.new('rig151', dati)
    bpy.context.scene.collection.objects.link(og)
    bpy.context.view_layer.objects.active = og
    bpy.ops.object.mode_set(mode='EDIT')
    eb = dati.edit_bones
    fatte = {}
    for nome, padre, figlio in OSSA:
        b = eb.new(nome)
        b.head = gioco_a_blender(riposo[padre])
        b.tail = gioco_a_blender(riposo[figlio])
        b.use_connect = False
        fatte[nome] = (padre, figlio)
    # la gerarchia: l'osso il cui PADRE e' il figlio di un altro gli si attacca
    per_figlio = {figlio: nome for nome, padre, figlio in OSSA}
    for nome, padre, figlio in OSSA:
        if padre in per_figlio:
            eb[nome].parent = eb[per_figlio[padre]]
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb in og.pose.bones:
        pb.rotation_mode = 'XYZ'
    return og


def giunti_da_armatura(og):
    """le coordinate di GIOCO dei diciotto giunti, lette dall'armatura posata.
    E' la porta della terza via: da qui escono le pose in coordinate."""
    deps = bpy.context.evaluated_depsgraph_get()
    ev = og.evaluated_get(deps)
    per_figlio = {figlio: nome for nome, padre, figlio in OSSA}
    fuori = {}
    for g in GIUNTI:
        if g in per_figlio:
            pb = ev.pose.bones[per_figlio[g]]
            p = og.matrix_world @ pb.tail
        else:
            # PELVIS: la testa del primo osso
            pb = ev.pose.bones['bacino-petto']
            p = og.matrix_world @ pb.head
        fuori[g] = (p.x, p.z, p.y)   # ritorno in coordinate di gioco
    return fuori


# ----------------------------------------------------------------- le capsule
def _capsula(nome, raggio, lunghezza, lati=10, anelli=6):
    """una capsula low-poly lungo +Z, dall'origine a (0,0,lunghezza).
    La geometria e' FISSA per segmento (le ossa non cambiano lunghezza), quindi
    si costruisce una volta e poi si sposta soltanto: niente da ricostruire a
    ogni fotogramma, e niente che possa variare fra un render e l'altro."""
    me = bpy.data.meshes.new(nome)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=lati, v_segments=anelli * 2,
                              radius=raggio)
    # si taglia a meta' e si allontanano le due calotte di `lunghezza`
    for v in bm.verts:
        if v.co.z > 1e-6:
            v.co.z += lunghezza
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def costruisci_corpo(mis, kit=None):
    """le tredici capsule piu' la testa, con le larghezze dei SEGS del gioco.
    Torna la lista (oggetto, giunto A, giunto B) da piazzare a ogni fotogramma."""
    kit = kit or KIT
    pezzi = []
    riposo = posa_riposo(mis)
    for a, b, chiave, tinta in CAPSULE:
        w = mis['W'].get(chiave)
        if w is None:
            raise RuntimeError('larghezza del segmento ' + chiave + ' non letta dal gioco')
        pa, pb = riposo[a], riposo[b]
        lung = math.dist(pa, pb)
        ob = _capsula('cap-' + chiave, w * 0.5, lung)
        ob.color = kit[tinta]
        pezzi.append((ob, a, b, lung))
    # la testa: una sfera del raggio dichiarato dal gioco
    me = bpy.data.meshes.new('testa')
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=12, radius=mis['HEADR'])
    bm.to_mesh(me)
    bm.free()
    testa = bpy.data.objects.new('testa', me)
    bpy.context.scene.collection.objects.link(testa)
    testa.color = kit['pelle']
    pezzi.append((testa, 'HEAD', 'HEAD', 0.0))
    # ombreggiatura morbida: sulle capsule e' quello che fa leggere il volume
    for ob, _a, _b, _l in pezzi:
        for po in ob.data.polygons:
            po.use_smooth = True
    return pezzi


def piazza_corpo(pezzi, giunti):
    """mette ogni capsula fra i suoi due giunti. Una matrice per pezzo,
    nessuna geometria ricostruita."""
    from mathutils import Vector, Matrix
    for ob, a, b, lung in pezzi:
        pa = Vector(gioco_a_blender(giunti[a]))
        if a == b:
            ob.matrix_world = Matrix.Translation(pa)
            continue
        pb = Vector(gioco_a_blender(giunti[b]))
        d = pb - pa
        n = d.length
        if n < 1e-9:
            ob.matrix_world = Matrix.Translation(pa)
            continue
        rot = d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        sca = Matrix.Diagonal((1.0, 1.0, n / lung if lung > 1e-9 else 1.0, 1.0))
        ob.matrix_world = Matrix.Translation(pa) @ rot @ sca


# ------------------------------------------------------------------ la scena
def pulisci_scena():
    """VIA TUTTO QUELLO CHE --factory-startup PORTA CON SE'.
    La scena d'avvio di Blender ha un cubo di due metri nell'origine, una
    lampada e una camera. Il cubo copriva le gambe della figura nel primo
    render di prova (24 set): non e' un dettaglio di pulizia, e' un oggetto
    dentro il fotogramma. Si toglie sempre, per primo."""
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)


def prepara_scena(lato=128, aa='8'):
    """Workbench, fondo trasparente, antialias fisso. Nessun campionamento:
    e' la condizione del determinismo, non una preferenza di resa."""
    pulisci_scena()
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.render.resolution_x = lato
    sc.render.resolution_y = lato
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.color_depth = '8'
    sc.render.image_settings.compression = 15
    # VIA OGNI METADATO DAL FILE, e il perche' e' un rosso vero del 24
    # settembre: il cancello del determinismo ha trovato due PNG diversi a
    # pixel IDENTICI. Nei chunk tEXt Blender scrive «Date» (l'ora da muro) e
    # «RenderTime» (00:01.75 la prima corsa, 00:00.03 la seconda, perche' la
    # prima paga la compilazione degli shader). Due numeri che non hanno
    # niente a che fare col disegno rendevano la pipeline irriproducibile, e
    # nessuno se ne sarebbe accorto senza un confronto al byte.
    for nome in dir(sc.render):
        if nome.startswith('use_stamp'):
            try:
                setattr(sc.render, nome, False)
            except Exception:
                pass
    sc.display.render_aa = aa
    sh = sc.display.shading
    sh.light = 'STUDIO'
    sh.color_type = 'OBJECT'
    sh.show_shadows = True
    sh.shadow_intensity = 0.42
    sh.show_cavity = True          # e' questo a dare il volume che al gioco manca
    sh.cavity_type = 'BOTH'
    sh.curvature_ridge_factor = 1.0
    sh.curvature_valley_factor = 1.0
    sh.show_object_outline = True
    sh.object_outline_color = (0.137, 0.125, 0.102)   # BORDO del gioco, #23201a
    sh.show_specular_highlight = False
    return sc


def scala_del_gioco(margine=None, elevazione=ELEVAZIONE):
    """L'APERTURA DELLA CAMERA IN METRI, dal conto del gioco e non a occhio.
    Il gioco proietta con s = hPx/(1.9*ce): un uomo alto 1,9 m occupa
    esattamente hPx pixel in verticale, cioe' 1.9*ce unita' di schermo. Una
    cella alta hPx e' percio' un'apertura di 1.9*ce, e il margine e' quanto la
    posa di corsa o di tiro esce dal riquadro del corpo fermo (MARGINE_POSA,
    misurato sui 192 fotogrammi del prototipo)."""
    if margine is None:
        margine = MARGINE_POSA
    return ALTEZZA_MONDO * math.cos(math.radians(elevazione)) * margine


def centro_del_gioco(elevazione=ELEVAZIONE):
    """la quota a cui puntare la camera perche' la figura stia in mezzo alla
    cella: meta' dei 1.9*ce di schermo, riportata a metri di mondo."""
    return ALTEZZA_MONDO * 0.5


def camera_del_gioco(scala=None, elevazione=ELEVAZIONE, distanza=8.0, centro=None):
    """LA CAMERA DEL GIOCO, non una che le somiglia. Vedi il blocco in testa
    al file: inclinata di (90 - E) attorno a X, ortografica, e i suoi due assi
    di schermo sono esattamente destra=(1,0,0) e su=(0,ce,se) del gioco."""
    sc = bpy.context.scene
    if scala is None:
        scala = scala_del_gioco(elevazione=elevazione)
    if centro is None:
        centro = centro_del_gioco(elevazione=elevazione)
    dati = bpy.data.cameras.new('camera151')
    dati.type = 'ORTHO'
    dati.ortho_scale = scala
    cam = bpy.data.objects.new('camera151', dati)
    sc.collection.objects.link(cam)
    e = math.radians(elevazione)
    ce, se = math.cos(e), math.sin(e)
    # posizione: sopra (+y di gioco) e verso chi guarda (-z di gioco), puntata
    # non all'origine ma a meta' figura -- altrimenti i piedi stanno al centro
    # della cella e la testa esce dal quadro (misurato il 24 set sul primo
    # render di prova: righe 0..127 occupate, cioe' la testa tagliata)
    cam.location = (0.0, -ce * distanza, centro + se * distanza)
    cam.rotation_euler = (math.radians(90.0 - elevazione), 0.0, 0.0)
    sc.camera = cam
    # senza questo la matrice di mondo della camera resta quella di prima e
    # ogni conto fatto subito dopo misura una camera che non esiste piu'
    bpy.context.view_layer.update()
    return cam


def prova_proiezione():
    """la verifica del conto, non la sua promessa: si proietta un punto con la
    formula del gioco e con la camera di Blender e si confronta. Torna lo
    scarto massimo in unita' di mondo."""
    from mathutils import Vector
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene
    cam = sc.camera
    e = math.radians(ELEVAZIONE)
    ce, se = math.cos(e), math.sin(e)
    scala = cam.data.ortho_scale
    punti = ((0.3, 1.2, 0.0), (-0.4, 0.6, 0.5), (0.0, 1.8, -0.3), (0.25, 0.1, 0.4))
    gioco, blend = [], []
    for p in punti:
        # il gioco: SX ~ x, SY ~ -(y*ce + z*se), a meno dell'origine cx,cy
        gioco.append((p[0], -(p[1] * ce + p[2] * se)))
        v = world_to_camera_view(sc, cam, Vector(gioco_a_blender(p)))
        blend.append(((v.x - 0.5) * scala, -(v.y - 0.5) * scala))
    # SI CONFRONTANO LE DIFFERENZE, non le posizioni: il gioco misura dal
    # centro della figura e Blender dal centro del quadro, e un'origine
    # diversa non e' una proiezione diversa. Se le due proiezioni sono la
    # stessa, ogni distanza fra due punti e' uguale in tutt'e due.
    peggio = 0.0
    for i in range(len(punti)):
        for j in range(i + 1, len(punti)):
            dg = (gioco[i][0] - gioco[j][0], gioco[i][1] - gioco[j][1])
            db = (blend[i][0] - blend[j][0], blend[i][1] - blend[j][1])
            peggio = max(peggio, abs(dg[0] - db[0]), abs(dg[1] - db[1]))
    return peggio
