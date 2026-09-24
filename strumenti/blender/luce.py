# -*- coding: utf-8 -*-
"""
luce.py -- LA TERZA VIA: Blender che CALCOLA invece di disegnare (voce #151).

L'IDEA, e perche' vale quanto un atlas a un millesimo del peso.
Il gioco disegna gia' figure pseudo-3D: diciotto giunti, capsule, camera a 42
gradi. Quello che gli manca non e' la geometria -- e' l'OMBREGGIATURA. Alla
riga 8352 del gioco:

    let tinta = look[g.c];
    if (g.kind === 0 && look._ombS) {
      const alt = look._ombS[g.c];
      if (alt && (SX[g.a] + SX[g.b]) * 0.5 > SX[PELVIS] + W * 0.18) tinta = alt;
    }

L'illuminazione interna del corpo e' UNA DECISIONE BINARIA per arto: a est
della verticale del bacino tinta fredda, altrimenti calda. Due valori, nessuna
gradazione, nessuna occlusione. E' li' che sta il «senza volume».

Un atlas risolverebbe il problema cuocendo dodici megabyte di pixel. Qui si
risolve con TRE TABELLE DI NUMERI, calcolate una volta da Blender sulla
geometria vera:

  rampa[16]   il profilo di luminanza ATTRAVERSO un arto, misurato sulla
              capsula low-poly vera sotto il sole del gioco. E' quello che fa
              leggere un tratto piatto come un cilindro.
  azimut[16]  il fattore di luce diretta in funzione di COME E' GIRATO l'arto
              rispetto al sole, mediato su tutti e 192 i fotogrammi del
              prototipo, con l'auto-ombreggiatura vera (un braccio dietro il
              busto e' scuro perche' il busto gli sta davanti, non perche'
              sta a est). Sostituisce il confronto binario.
  ao[13]      l'occlusione ambientale per segmento: quanto ogni capsula e'
              nascosta dalle altre. Ascella scura, lato esterno del braccio
              chiaro. Tredici numeri, e non si possono ottenere per formula
              perche' dipendono dal corpo intero.

IL SOLE E' QUELLO DEL GIOCO, LETTO DAL GIOCO.
SOLE = {dir:[0.9406, 0.3402], alt:20} (riga 28536). `dir` e' la direzione
dell'OMBRA sullo schermo; l'ombra va a destra e verso chi guarda, quindi il
sole sta a ovest e dietro. Riportata nel mondo:
  lo schermo in basso e' -(y*ce + z*se), quindi 0,3402 di discesa sono
  -0,3402/se = -0,5085 di z; direzione dell'ombra a terra (0,9406, 0, -0,5085)
  normalizzata (0,8796, 0, -0,4755); il sole e' l'opposto, alzato di 20 gradi:
  (-0,8266, +0,3420, +0,4468). Il conto sta qui perche' chi cambia SOLE nel
  gioco deve poterlo rifare senza indovinare.

DETERMINISMO. Nessun render e nessun campionamento casuale: si usa il
ray_cast di Blender sulla geometria vera, con direzioni ENUMERATE da un
reticolo fisso. Stessi numeri a ogni corsa, su qualunque macchina.

uso:
  blender --background --factory-startup --python luce.py -- --json <file>
"""

import json
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import comune as C     # noqa: E402
import anima as A      # noqa: E402

import bpy             # noqa: E402
from mathutils import Vector   # noqa: E402

BIN_RAMPA = 16
BIN_AZIMUT = 16
RAGGI_AO = 24


def sole_dal_gioco():
    """il versore verso il sole, in coordinate di gioco, dal SOLE del gioco."""
    with open(C.GIOCO, 'r', encoding='utf-8') as f:
        t = f.read()
    m = re.search(r'const SOLE=\{\s*\n\s*dir:\[([\d.\-]+),([\d.\-]+)\],\s*\n\s*alt:(\d+)', t)
    if not m:
        raise RuntimeError('SOLE non si legge nel gioco')
    dx, dy, alt = float(m.group(1)), float(m.group(2)), float(m.group(3))
    se = math.sin(math.radians(C.ELEVAZIONE))
    # l'ombra a terra, dalla sua direzione a schermo
    ox, oz = dx, -dy / se
    n = math.hypot(ox, oz)
    ox, oz = ox / n, oz / n
    a = math.radians(alt)
    return (-ox * math.cos(a), math.sin(a), -oz * math.cos(a)), (dx, dy, alt)


def direzioni_emisfero(n):
    """n direzioni ENUMERATE sull'emisfero, con la spirale di Fibonacci.
    Non e' campionamento casuale: e' una griglia, e da' gli stessi n vettori
    a ogni corsa."""
    fuori = []
    phi = math.pi * (3.0 - math.sqrt(5.0))
    for i in range(n):
        y = 1.0 - (i + 0.5) / n
        r = math.sqrt(max(0.0, 1.0 - y * y))
        th = phi * i
        fuori.append((math.cos(th) * r, y, math.sin(th) * r))
    return fuori


def principale():
    arg = C.argomenti()
    qui = os.path.dirname(os.path.abspath(__file__))
    uscita = arg.get('json') or os.path.join(qui, '_151-luce.json')

    L, dich = sole_dal_gioco()
    Lb = Vector(C.gioco_a_blender(L)).normalized()

    C.prepara_scena(lato=64)
    mis = C.misure_dal_gioco()
    og = C.costruisci_armatura(mis)
    bpy.ops.object.mode_set(mode='EDIT')
    for b in og.data.edit_bones:
        b.roll = 0.0
    bpy.ops.object.mode_set(mode='OBJECT')
    pezzi = C.costruisci_corpo(mis)
    og.hide_render = True
    C.camera_del_gioco()

    sc = bpy.context.scene
    e = math.radians(C.ELEVAZIONE)
    ce, se = math.cos(e), math.sin(e)

    def vedi_il_sole(p, n):
        """il punto vede il sole? Si parte staccati di mezzo millimetro dalla
        superficie, altrimenti il raggio ricolpisce la faccia da cui parte."""
        o = p + n * 0.0005
        deps = bpy.context.evaluated_depsgraph_get()
        colpo = sc.ray_cast(deps, o, Lb, distance=6.0)
        return not colpo[0]

    # ------------------------------------------------- 1. LA RAMPA TRASVERSALE
    # si prende la coscia, si guardano i vertici della sua capsula e si mettono
    # in sedici colonne secondo la loro posizione ATTRAVERSO l'arto a schermo.
    coscia = None
    for ob, a, b, lung in pezzi:
        if (a, b) == ('HIPR', 'KNR'):
            coscia = (ob, a, b)
    bpy.context.view_layer.update()
    C.piazza_corpo(pezzi, C.giunti_da_armatura(og))
    bpy.context.view_layer.update()
    # LA RAMPA SI MISURA SU UNA CAPSULA FINE, non su quella del prototipo.
    # Quella del prototipo ha dieci lati: nel primo tentativo (24 set) sedici
    # colonne si spartivano venti vertici e la rampa usciva a denti di sega
    # (0,80 accanto a 0,14). Non era il volume a essere fatto cosi': era il
    # campione a essere piu' corto della domanda. Qui si costruisce la stessa
    # capsula -- stesso raggio, stessa lunghezza, stessa posa -- con
    # quarantotto lati, e la si butta subito dopo. La geometria del gioco non
    # cambia: cambia quanti punti la si interroga.
    fine = C._capsula('rampa-fine', mis['W']['HIPR-KNR'] * 0.5,
                      math.dist(C.posa_riposo(mis)['HIPR'], C.posa_riposo(mis)['KNR']),
                      lati=48, anelli=12)
    C.piazza_corpo([(fine, 'HIPR', 'KNR',
                     math.dist(C.posa_riposo(mis)['HIPR'], C.posa_riposo(mis)['KNR']))],
                   C.giunti_da_armatura(og))
    bpy.context.view_layer.update()
    ob = fine
    mw = ob.matrix_world
    # l'asse dell'arto a schermo, e la sua perpendicolare
    g = C.giunti_da_armatura(og)
    pa, pb = g['HIPR'], g['KNR']
    ax = (pb[0] - pa[0], (pb[1] - pa[1]) * ce + (pb[2] - pa[2]) * se)
    na = math.hypot(*ax) or 1.0
    perp = (-ax[1] / na, ax[0] / na)
    somma = [0.0] * BIN_RAMPA
    conta = [0] * BIN_RAMPA
    raggio = mis['W']['HIPR-KNR'] * 0.5
    for v in ob.data.vertices:
        p = mw @ v.co
        n = (mw.to_3x3() @ v.normal).normalized()
        # posizione a schermo del vertice, in coordinate di gioco
        pg = (p.x, p.z, p.y)
        sx = pg[0] - (pa[0] + pb[0]) * 0.5
        sy = (pg[1] - (pa[1] + pb[1]) * 0.5) * ce + (pg[2] - (pa[2] + pb[2]) * 0.5) * se
        t = (sx * perp[0] + sy * perp[1]) / raggio      # -1 .. +1 attraverso l'arto
        k = int((t + 1.0) * 0.5 * (BIN_RAMPA - 1) + 0.5)
        k = max(0, min(BIN_RAMPA - 1, k))
        # solo la meta' rivolta alla camera: il resto non si vede
        verso_camera = n.y * (-ce) + n.z * se
        if verso_camera <= 0.0:
            continue
        lam = max(0.0, n.dot(Lb))
        somma[k] += lam
        conta[k] += 1
    rampa = [round(somma[i] / conta[i], 4) if conta[i] else 0.0 for i in range(BIN_RAMPA)]
    campioni_rampa = sum(conta)
    bpy.data.objects.remove(fine, do_unlink=True)

    # ---------------------------------------------------------- 2. L'AO PER SEGMENTO
    dirs = direzioni_emisfero(RAGGI_AO)
    ao = {}
    deps = bpy.context.evaluated_depsgraph_get()
    for ob, a, b, lung in pezzi:
        mw = ob.matrix_world
        libero = 0
        totale = 0
        passo = max(1, len(ob.data.vertices) // 24)
        for vi in range(0, len(ob.data.vertices), passo):
            v = ob.data.vertices[vi]
            p = mw @ v.co
            n = (mw.to_3x3() @ v.normal).normalized()
            for d in dirs:
                dv = Vector(d)
                # solo l'emisfero della normale
                if n.dot(dv) <= 0.0:
                    dv = -dv
                if n.dot(dv) <= 0.05:
                    continue
                totale += 1
                if not sc.ray_cast(deps, p + n * 0.0008, dv, distance=1.2)[0]:
                    libero += 1
        chiave = a + '-' + b
        ao[chiave] = round(libero / totale, 4) if totale else 1.0

    # -------------------------------------------- 3. LA TABELLA PER AZIMUT
    # su tutti e 192 i fotogrammi del prototipo: per ogni arto si misura
    # quanta luce diretta prende davvero (auto-ombreggiatura inclusa) e la si
    # mette nella colonna del suo azimut A SCHERMO -- che e' il numero che il
    # gioco ha gia' in mano, gratis, mentre disegna.
    somma = [0.0] * BIN_AZIMUT
    conta = [0] * BIN_AZIMUT
    arti = [(a, b) for (a, b, _c, _t) in C.CAPSULE if a not in ('PELVIS', 'NECK', 'HIPL')]
    for nome in sorted(A.CLIP.keys()):
        for d in range(8):
            for i in range(A.FOTOGRAMMI):
                A.applica(og, nome, i)
                og.rotation_euler = (0.0, 0.0, 2.0 * math.pi * d / 8.0)
                bpy.context.view_layer.update()
                gg = C.giunti_da_armatura(og)
                C.piazza_corpo(pezzi, gg)
                bpy.context.view_layer.update()
                deps = bpy.context.evaluated_depsgraph_get()
                for ob, a, b, lung in pezzi:
                    if (a, b) not in arti:
                        continue
                    pa2, pb2 = gg[a], gg[b]
                    dx = pb2[0] - pa2[0]
                    dy = (pb2[1] - pa2[1]) * ce + (pb2[2] - pa2[2]) * se
                    az = math.atan2(dy, dx)
                    k = int(((az + math.pi) / (2.0 * math.pi)) * BIN_AZIMUT) % BIN_AZIMUT
                    mw = ob.matrix_world
                    n3 = mw.to_3x3()
                    lum, quanti = 0.0, 0
                    passo = max(1, len(ob.data.vertices) // 12)
                    for vi in range(0, len(ob.data.vertices), passo):
                        v = ob.data.vertices[vi]
                        p = mw @ v.co
                        nn = (n3 @ v.normal).normalized()
                        if nn.y * (-ce) + nn.z * se <= 0.0:
                            continue      # non si vede dalla camera
                        quanti += 1
                        lam = max(0.0, nn.dot(Lb))
                        if lam > 0.0 and not sc.ray_cast(deps, p + nn * 0.0008, Lb,
                                                         distance=3.0)[0]:
                            lum += lam
                    if quanti:
                        somma[k] += lum / quanti
                        conta[k] += 1
    azimut = [round(somma[i] / conta[i], 4) if conta[i] else 0.0 for i in range(BIN_AZIMUT)]

    # --------------------------------------------------------------- l'uscita
    fuori = {
        'sole_gioco': {'dir': [dich[0], dich[1]], 'alt': dich[2]},
        'sole_mondo': [round(v, 4) for v in L],
        'rampa': rampa,
        'azimut': azimut,
        'ao': ao,
        'campioni_rampa': campioni_rampa,
        'bin_rampa': BIN_RAMPA, 'bin_azimut': BIN_AZIMUT, 'raggi_ao': RAGGI_AO,
        'blender': bpy.app.version_string,
    }
    with open(uscita, 'w', encoding='utf-8') as f:
        json.dump(fuori, f, indent=1, sort_keys=True)
    # il peso della tabella, che e' il numero che decide il confronto
    compatto = ('[' + ','.join('%.3f' % v for v in rampa) + ']' +
                '[' + ','.join('%.3f' % v for v in azimut) + ']' +
                '[' + ','.join('%.3f' % ao[k] for k in sorted(ao)) + ']')
    print('luce.py: scritto ' + uscita)
    print('  rampa  ' + ' '.join('%.2f' % v for v in rampa))
    print('  azimut ' + ' '.join('%.2f' % v for v in azimut))
    print('  ao     ' + ' '.join('%s=%.2f' % (k, ao[k]) for k in sorted(ao)))
    print('  LE TRE TABELLE IN FORMA COMPATTA PESANO %d BYTE' % len(compatto.encode('ascii')))


principale()
