# -*- coding: utf-8 -*-
"""
figura.py -- costruisce il corpo e DICHIARA le sue misure (voce #151, compito 1).

Non renderizza niente. Esiste per una ragione sola: dare al cancello
strumenti/_t-151-blender.js qualcosa da misurare. Il cancello non si fida di
questo file -- rilegge le costanti dal gioco per conto suo e le confronta con
quello che Blender ha davvero in memoria dopo che l'armatura e' stata
costruita.

QUELLO CHE ESCE NON E' UNA COPIA DEGLI ARGOMENTI D'INGRESSO.
Le lunghezze scritte nel JSON sono misurate sulle ossa dell'armatura
(distanza head-tail dopo che Blender le ha create), non ricopiate dal dizionario
delle misure. La differenza conta: se costruisci_armatura() sbagliasse a
piazzare un giunto, un file che ricopia gli ingressi resterebbe verde e un file
che misura l'uscita diventa rosso. E' la stessa differenza fra un banco che
attesta e uno che misura.

uso:
  blender --background --factory-startup --python figura.py -- --json <file>
"""

import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import comune as C   # noqa: E402

import bpy           # noqa: E402


def principale():
    arg = C.argomenti()
    uscita = arg.get('json') or os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                             '_151-figura.json')
    mis = C.misure_dal_gioco()
    og = C.costruisci_armatura(mis)
    # i roll a zero: gli assi delle ossa devono essere noti, non ereditati da
    # un calcolo automatico che potrebbe cambiare fra due versioni di Blender
    bpy.ops.object.mode_set(mode='EDIT')
    for b in og.data.edit_bones:
        b.roll = 0.0
    bpy.ops.object.mode_set(mode='OBJECT')

    # LE OSSA, MISURATE SULL'ARMATURA
    ossa = {}
    for b in og.data.bones:
        ossa[b.name] = (b.head_local - b.tail_local).length
    # i nomi che il cancello si aspetta: uno per coppia simmetrica, e si
    # verifica che le due meta' siano davvero uguali
    def coppia(a, b, chiave, fuori):
        va, vb = ossa[a], ossa[b]
        if abs(va - vb) > 1e-6:
            raise RuntimeError('il corpo non e\' simmetrico su ' + chiave)
        fuori[chiave] = va

    dich = {}
    coppia('coscia-sx', 'coscia-dx', 'coscia', dich)
    coppia('polpaccio-sx', 'polpaccio-dx', 'polpaccio', dich)
    coppia('braccio-sx', 'braccio-dx', 'braccio', dich)
    coppia('avambraccio-sx', 'avambraccio-dx', 'avambraccio', dich)
    coppia('piede-sx', 'piede-dx', 'piede', dich)
    dich['collo-testa'] = ossa['collo-testa']
    dich['bacino-petto'] = ossa['bacino-petto']
    dich['petto-collo'] = ossa['petto-collo']

    # LE SEMILARGHEZZE, misurate sulle posizioni dei giunti e non sui numeri
    g = C.giunti_da_armatura(og)
    semi = {
        'spalla': abs(g['SHR'][0]),
        'anca': abs(g['HIPR'][0]),
        'testa': mis['HEADR'],
    }

    # il corpo vero, per avere la statura misurata e non dichiarata
    pezzi = C.costruisci_corpo(mis)
    C.piazza_corpo(pezzi, g)
    bpy.context.view_layer.update()
    cima = g['HEAD'][1] + mis['HEADR']
    fondo = min(g['FTL'][1], g['FTR'][1], g['TOL'][1], g['TOR'][1]) - mis['W']['FTR-TOR'] * 0.5

    # la proiezione: si verifica, non si promette
    C.prepara_scena()
    C.camera_del_gioco()
    scarto = C.prova_proiezione()

    fuori = {
        'ossa': dich,
        'semilarghezze': semi,
        'statura': cima - fondo,
        'giunti_riposo': {k: [round(v[0], 6), round(v[1], 6), round(v[2], 6)]
                          for k, v in g.items()},
        'capsule': len(pezzi),
        'scarto_proiezione': scarto,
        'elevazione': C.ELEVAZIONE,
        'blender': bpy.app.version_string,
    }
    with open(uscita, 'w', encoding='utf-8') as f:
        json.dump(fuori, f, indent=1, sort_keys=True)
    print('figura.py: scritto ' + uscita)
    print('  statura ' + format(fuori['statura'], '.4f') + ' m · capsule ' +
          str(len(pezzi)) + ' · scarto di proiezione ' +
          format(scarto, '.3e') + ' m')


principale()
