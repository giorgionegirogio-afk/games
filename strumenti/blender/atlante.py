# -*- coding: utf-8 -*-
"""
atlante.py -- il PROTOTIPO degli sprite (voce #151, compito 2).

Renderizza il foglio che il committente ha chiesto: UNA figura, DUE animazioni
(corsa e tiro), OTTO direzioni, dodici fotogrammi l'una. Sedici righe di dodici
celle: 2 clip x 8 direzioni per riga, i fotogrammi in colonna.

LA CELLA E' 128, E IL NUMERO E' MISURATO.
La figura in partita e' alta ~93 px veri (il gioco lo dichiara alla riga 8407:
34 unita' x S2 1,16 x P_DIS 1,18 x DPR 2). Una posa di corsa o di tiro esce dal
riquadro del corpo fermo -- gamba tesa avanti e braccio indietro chiedono circa
un terzo in piu' -- quindi 128 e' la cella 1:1 col gioco di oggi su un telefono
a due punti per pixel. Su tre punti servirebbe 192, e il conto si rifa' x2,25.
Alla fine lo script stampa il RIQUADRO VERO occupato dai pixel opachi: se fosse
molto piu' piccolo di 128 la cella sarebbe sprecata, e si vedrebbe li'.

LA DIVISA E' UNA SOLA. Nel gioco le cinque tinte del kit sono variabili di
runtime perche' le squadre nascono generate. Uno sprite le cuoce. Renderizzare
una divisa sola e' il caso PIU' FAVOREVOLE all'atlas -- nessuna maschera per
zona, nessuna ricolorazione a runtime -- ed e' voluto: un prototipo che non
regge nel suo caso migliore non ha bisogno di essere provato nel peggiore.

DETERMINISMO, E LA RETTIFICA CHE E' COSTATA SETTE CORSE (24 settembre).
Il piano chiedeva «due corse, due PNG identici al byte». NON SI PUO', e non
perche' la pipeline sia sciatta: perche' il rasterizzatore e' sulla GPU.
Misurato, invece che supposto -- sette atlanti di fila, confrontati pixel per
pixel dopo aver tolto i metadati:
    corse identiche al byte ........ la maggioranza
    corse diverse .................. 3 e 5 BYTE su 3 145 728, scarto
                                     massimo 5 su 255, sempre dentro UNA
                                     cella sola, sempre su un bordo
Spento l'antialias (--aa OFF) il fenomeno resta: non e' l'accumulo
dell'antialias, e' il test punto-dentro-triangolo della GPU che su un pixel di
bordo cade da una parte o dall'altra. E' lo stesso rumore che istantanea.js
dichiara da agosto per Chromium (79 pixel su un milione e mezzo).
PERCIO' IL CANCELLO E' STATO RIFATTO, e adesso misura due cose invece di
attestarne una:
  (a) LE POSE -- le coordinate dei diciotto giunti su tutti e 192 i
      fotogrammi -- devono essere identiche AL BYTE. Sono float su CPU: li'
      il determinismo esiste davvero, ed e' li' che sta il contenuto. Il
      JSON porta la loro sha256.
  (b) L'IMMAGINE deve essere identica ENTRO IL RUMORE MISURATO, e il numero
      non e' comodo: 16 byte su 3,1 milioni e scarto massimo 8 su 255.
E perche' quella tolleranza non sia una porta aperta, il cancello costruisce
un FALSO: --scarto sposta un giunto di un millimetro, e il PNG deve
allontanarsi di ordini di grandezza. Una tolleranza che non si prova a
rompere non e' una tolleranza, e' una scusa.

uso:
  blender --background --factory-startup --python atlante.py -- \
          --png fuori/151-atlante.png --json fuori/151-atlante.json
  ... --cella 64      (il foglio ridotto, per le prove veloci)
  ... --aa OFF        (senza antialias: serviva a isolare il rumore GPU)
  ... --scarto 0.001  (IL FALSO: un giunto spostato di un millimetro)
"""

import hashlib
import json
import math
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import comune as C     # noqa: E402
import anima as A      # noqa: E402

import bpy             # noqa: E402
import numpy as np     # noqa: E402

DIREZIONI = 8


def principale():
    arg = C.argomenti()
    qui = os.path.dirname(os.path.abspath(__file__))
    png = arg.get('png') or os.path.join(C.RADICE, 'fuori', '151-atlante.png')
    meta = arg.get('json') or os.path.splitext(png)[0] + '.json'
    cella = int(arg.get('cella', 128))
    aa = str(arg.get('aa', '8'))
    # IL FALSO: un giunto spostato di tanto cosi'. A zero non fa niente; il
    # cancello lo accende per provare che la tolleranza del rumore GPU non
    # ingoia una modifica vera.
    scarto = float(arg.get('scarto', 0.0))
    nomi = sorted(A.CLIP.keys())

    os.makedirs(os.path.dirname(os.path.abspath(png)), exist_ok=True)
    tmp = os.path.splitext(os.path.abspath(png))[0] + '-celle'
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp, exist_ok=True)

    # LA SCENA PRIMA DEL CORPO, e non e' un capriccio d'ordine:
    # prepara_scena() comincia sgomberando quello che --factory-startup porta
    # con se' (il cubo di due metri nell'origine), e sgomberare dopo aver
    # costruito la figura la cancellerebbe insieme al cubo.
    sc = C.prepara_scena(lato=cella, aa=aa)
    mis = C.misure_dal_gioco()
    og = C.costruisci_armatura(mis)
    bpy.ops.object.mode_set(mode='EDIT')
    for b in og.data.edit_bones:
        b.roll = 0.0
    bpy.ops.object.mode_set(mode='OBJECT')
    pezzi = C.costruisci_corpo(mis)
    # l'armatura non si disegna: e' l'impalcatura, non il corpo
    og.hide_render = True

    # LA CAMERA E' QUELLA DEL GIOCO: apertura 1.9*ce (un uomo di 1,9 m riempie
    # la cella, che e' esattamente la normalizzazione s = hPx/(1,9*ce)) per il
    # margine 1,35, che e' quanto la posa di corsa esce dal riquadro del corpo
    # fermo. Senza il margine si tagliano le punte dei piedi e delle mani, e un
    # atlas che taglia gli arti non e' un atlas piu' leggero: e' rotto.
    C.camera_del_gioco()

    righe = len(nomi) * DIREZIONI
    colonne = A.FOTOGRAMMI
    W, H = colonne * cella, righe * cella
    foglio = np.zeros((H, W, 4), dtype=np.float32)

    # L'IMPRONTA DELLE POSE: le coordinate dei giunti, arrotondate al
    # decimo di millimetro, di tutti i fotogrammi in ordine. E' la parte del
    # risultato che DEVE essere identica al byte, perche' e' aritmetica su
    # CPU e non passa dal rasterizzatore.
    impronta = hashlib.sha256()
    clip_meta = []
    riga = 0
    for nome in nomi:
        clip_meta.append({'nome': nome, 'fcm': A.CLIP[nome]['fcm'],
                          'freq': A.CLIP[nome]['freq'],
                          'ciclica': A.CLIP[nome]['ciclica'],
                          'riga0': riga})
        for d in range(DIREZIONI):
            yaw = 2.0 * math.pi * d / DIREZIONI
            for i in range(A.FOTOGRAMMI):
                A.applica(og, nome, i)
                og.rotation_euler = (0.0, 0.0, yaw)
                bpy.context.view_layer.update()
                giunti = C.giunti_da_armatura(og)
                if scarto:
                    q = giunti['KNR']
                    giunti['KNR'] = (q[0] + scarto, q[1], q[2])
                for g in C.GIUNTI:
                    impronta.update(('%.4f,%.4f,%.4f;' % giunti[g]).encode('ascii'))
                C.piazza_corpo(pezzi, giunti)
                bpy.context.view_layer.update()
                base = os.path.join(tmp, '%s-%d-%02d' % (nome, d, i))
                sc.render.filepath = base
                bpy.ops.render.render(write_still=True)
                im = bpy.data.images.load(base + '.png')
                im.alpha_mode = 'STRAIGHT'
                px = np.empty(cella * cella * 4, dtype=np.float32)
                im.pixels.foreach_get(px)
                # Blender consegna le righe dal basso: si rovescia per avere
                # il foglio nell'ordine in cui lo legge una texture
                q = px.reshape(cella, cella, 4)[::-1]
                foglio[riga * cella:(riga + 1) * cella,
                       i * cella:(i + 1) * cella] = q
                bpy.data.images.remove(im)
            riga += 1

    # IL RIQUADRO VERO: quanto della cella e' davvero occupato. E' la misura
    # che dice se 128 e' la taglia giusta o se si sta pagando aria.
    op = foglio[:, :, 3] > 0.004
    ys, xs = np.nonzero(op)
    if len(xs):
        # in coordinate di CELLA, non di foglio
        cx = xs % cella
        cy = ys % cella
        riq = [int(cx.min()), int(cy.min()), int(cx.max()) + 1, int(cy.max()) + 1]
        pieno = float(op.sum()) / float(op.size)
    else:
        riq, pieno = [0, 0, 0, 0], 0.0

    img = bpy.data.images.new('atlante151', width=W, height=H, alpha=True)
    img.alpha_mode = 'STRAIGHT'
    img.pixels.foreach_set(foglio[::-1].reshape(-1))
    img.file_format = 'PNG'
    sc.render.image_settings.compression = 15
    img.save(filepath=os.path.abspath(png))
    shutil.rmtree(tmp, ignore_errors=True)

    peso = os.path.getsize(png)
    fuori = {
        'png': os.path.relpath(os.path.abspath(png), C.RADICE).replace('\\', '/'),
        'larghezza': W, 'altezza': H, 'cella': cella,
        'direzioni': DIREZIONI, 'fotogrammi': A.FOTOGRAMMI,
        'celle': len(nomi) * DIREZIONI * A.FOTOGRAMMI,
        'clip': clip_meta,
        'peso_png': peso,
        'memoria_texture': W * H * 4,
        'impronta_pose': impronta.hexdigest(),
        'scarto_falso': scarto,
        'riquadro_occupato': riq,
        'frazione_opaca': pieno,
        'blender': bpy.app.version_string,
    }
    with open(meta, 'w', encoding='utf-8') as f:
        json.dump(fuori, f, indent=1, sort_keys=True)
    print('atlante.py: %d celle di %d px -> %dx%d, PNG %d byte' %
          (fuori['celle'], cella, W, H, peso))
    print('  riquadro davvero occupato nella cella: %s su %d, opaco %.1f%%' %
          (riq, cella, pieno * 100.0))


principale()
