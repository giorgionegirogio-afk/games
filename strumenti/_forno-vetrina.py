# -*- coding: utf-8 -*-
"""
VETRINA — compone i due PNG di giudizio, senza scritte.

  1) otto-direzioni.png   le 8 direzioni dello stesso fotogramma, in divisa,
                          su prato piatto: e' la tavola per il confronto cieco
                          col rig vettoriale del gioco.
  2) dpr-appaiate.png     la stessa cella cotta a 320 px accanto alla stessa
                          cotta a 224 px e ingrandita a 320. Nessuna scritta:
                          o la differenza si vede o non si vede.

  python strumenti/_forno-vetrina.py <cartella-160> <cella320.png> <cella224.png>
"""
import os, sys
import numpy as np
from PIL import Image

D = os.path.abspath(sys.argv[1])
P320 = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else None
P224 = os.path.abspath(sys.argv[3]) if len(sys.argv) > 3 else None
CELLE = os.path.join(D, "celle")


def leggi(p):
    return np.asarray(Image.open(p).convert("RGBA")).astype(np.float32) / 255.0


def lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def esa(s):
    s = s.lstrip('#')
    return np.array([int(s[i:i+2], 16) / 255.0 for i in (0, 2, 4)], np.float32)


NEU = {'m': 0.62, 'p': 0.72, 'c': 0.66}


def veste(rgba, msk, tm, tp, tc):
    """il pixel neutro porta gia' l'ombreggiatura: si moltiplica per il
       rapporto fra la tinta e il grigio di cottura, pesato dalla copertura"""
    k = (1.0
         + msk[:, :, 0:1] * (lin(esa(tm)) / NEU['m'] - 1.0)
         + msk[:, :, 1:2] * (lin(esa(tp)) / NEU['p'] - 1.0)
         + msk[:, :, 2:3] * (lin(esa(tc)) / NEU['c'] - 1.0))
    o = rgba.copy()
    o[:, :, :3] = srgb(lin(rgba[:, :, :3]) * k)
    return o


def su_prato(rgba, verde=(0.196, 0.404, 0.184)):
    sf = np.zeros_like(rgba[:, :, :3])
    sf[:, :] = verde
    a = rgba[:, :, 3:4]
    return np.clip(rgba[:, :, :3] * a + sf * (1 - a), 0, 1)


if os.path.isdir(CELLE):
    righe = []
    for d in range(8):
        b = leggi(os.path.join(CELLE, "bellezza-d%d-f0.png" % d))
        m = leggi(os.path.join(CELLE, "maschera-d%d-f0.png" % d))
        righe.append(su_prato(veste(b, m, "#2f6fd0", "#f3f5f9", "#2f6fd0")))
    su = np.concatenate(righe[:4], axis=1)
    gi = np.concatenate(righe[4:], axis=1)
    out = np.concatenate([su, gi], axis=0)
    p = os.path.join(D, "otto-direzioni.png")
    Image.fromarray((out * 255).astype(np.uint8)).save(p)
    print("otto direzioni  %s  (%d x %d)" % (p, out.shape[1], out.shape[0]))

if P320 and P224:
    a = Image.open(P320).convert("RGBA")
    b = Image.open(P224).convert("RGBA").resize(a.size, Image.LANCZOS)
    A = su_prato(np.asarray(a).astype(np.float32) / 255.0)
    B = su_prato(np.asarray(b).astype(np.float32) / 255.0)
    sep = np.zeros((A.shape[0], 8, 3), np.float32)
    sep[:, :] = (0.10, 0.10, 0.10)
    out = np.concatenate([A, sep, B], axis=1)
    p = os.path.join(D, "dpr-appaiate.png")
    Image.fromarray((out * 255).astype(np.uint8)).save(p)
    print("dpr appaiate    %s  (%d x %d)  [sinistra: cottura a 320; destra: 224 ingrandita]"
          % (p, out.shape[1], out.shape[0]))
    # e un dettaglio al 300% della sola testa e spalle, dove l'occhio guarda
    h = a.size[1]
    box = (int(0.34 * h), int(0.14 * h), int(0.66 * h), int(0.46 * h))
    da = a.crop(box).resize((int((box[2]-box[0]) * 3), int((box[3]-box[1]) * 3)), Image.NEAREST)
    db = b.crop(box).resize(da.size, Image.NEAREST)
    DA = su_prato(np.asarray(da).astype(np.float32) / 255.0)
    DB = su_prato(np.asarray(db).astype(np.float32) / 255.0)
    sep2 = np.zeros((DA.shape[0], 8, 3), np.float32); sep2[:, :] = (0.10, 0.10, 0.10)
    out2 = np.concatenate([DA, sep2, DB], axis=1)
    p2 = os.path.join(D, "dpr-appaiate-dettaglio.png")
    Image.fromarray((out2 * 255).astype(np.uint8)).save(p2)
    print("dettaglio 300%%  %s  (%d x %d)" % (p2, out2.shape[1], out2.shape[0]))
