# -*- coding: utf-8 -*-
"""
pose.py -- LE POSE IN COORDINATE, l'altra meta' della terza via (voce #151).

Esporta i diciotto giunti di tutti i fotogrammi delle due clip, nel sistema
del gioco (x lato, y su, z lontano) e in metri. Serve a due cose:

1. A VERIFICARE che il corpo di Blender e quello del gioco siano lo stesso
   corpo -- le lunghezze delle ossa ricalcolate dalle coordinate esportate
   devono tornare, fotogramma per fotogramma. Lo stampa in fondo.

2. A TENERE APERTA LA STRADA in cui una clip nuova si anima in Blender e si
   spedisce al gioco come TABELLA DI NUMERI invece che come texture. Il rig
   del gioco prende gia' pose in coordinate: setJ() scrive esattamente questo.
   Il peso del gesto senza un pixel.

IL FORMATO E' INTERO, e il perche' e' il confronto col prototipo degli
sprite. Ogni coordinata sta fra -1,2 e +2,1 m; a un CENTESIMO di metro
(un centimetro, cioe' un quarto di pixel su una figura alta 93) sta in un
intero fra -120 e 210. Due cifre e una virgola in JSON, e in un array
tipizzato un solo byte con offset. Lo script stampa tutt'e due i pesi.

uso:
  blender --background --factory-startup --python pose.py -- --json <file>
"""

import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import comune as C     # noqa: E402
import anima as A      # noqa: E402

import bpy             # noqa: E402


def principale():
    arg = C.argomenti()
    qui = os.path.dirname(os.path.abspath(__file__))
    uscita = arg.get('json') or os.path.join(qui, '_151-pose.json')

    C.prepara_scena(lato=64)
    mis = C.misure_dal_gioco()
    og = C.costruisci_armatura(mis)
    bpy.ops.object.mode_set(mode='EDIT')
    for b in og.data.edit_bones:
        b.roll = 0.0
    bpy.ops.object.mode_set(mode='OBJECT')

    clip = {}
    peggio_osso = 0.0
    chi = ''
    for nome in sorted(A.CLIP.keys()):
        fot = []
        for i in range(A.FOTOGRAMMI):
            A.applica(og, nome, i)
            og.rotation_euler = (0.0, 0.0, 0.0)   # lo yaw lo mette il gioco
            bpy.context.view_layer.update()
            g = C.giunti_da_armatura(og)
            # LA VERIFICA: le ossa ricalcolate dalle coordinate devono tornare
            for _n, pa, pb in C.OSSA:
                atteso = math.dist(C.posa_riposo(mis)[pa], C.posa_riposo(mis)[pb])
                vero = math.dist(g[pa], g[pb])
                d = abs(vero - atteso)
                if d > peggio_osso:
                    peggio_osso, chi = d, _n
            fot.append([[int(round(g[j][k] * 100.0)) for k in range(3)]
                        for j in C.GIUNTI])
        clip[nome] = {'fcm': A.CLIP[nome]['fcm'], 'freq': A.CLIP[nome]['freq'],
                      'ciclica': A.CLIP[nome]['ciclica'], 'fotogrammi': fot}

    fuori = {
        'giunti': C.GIUNTI,
        'unita': 'centimetri, interi',
        'clip': clip,
        'scarto_ossa_m': peggio_osso,
        'osso_peggiore': chi,
        'blender': bpy.app.version_string,
    }
    with open(uscita, 'w', encoding='utf-8') as f:
        json.dump(fuori, f, separators=(',', ':'), sort_keys=True)

    numeri = len(clip) * A.FOTOGRAMMI * len(C.GIUNTI) * 3
    compatto = ','.join(str(v) for nome in sorted(clip)
                        for fo in clip[nome]['fotogrammi'] for gi in fo for v in gi)
    print('pose.py: scritto ' + uscita)
    print('  %d numeri (%d clip x %d fotogrammi x 18 giunti x 3)' %
          (numeri, len(clip), A.FOTOGRAMMI))
    print('  in JSON compatto: %d byte · in interi a un byte: %d byte' %
          (len(compatto.encode('ascii')), numeri))
    print('  le ossa ricalcolate dalle coordinate tornano entro %.3e m (%s)' %
          (peggio_osso, chi))


principale()
