# -*- coding: utf-8 -*-
"""
RICOLORAZIONE — la prova che l'atlante neutro basta per tutte le divise,
piu' la misura del peso in variante stretta.

Si lancia con il python di sistema (serve Pillow + numpy), NON con Blender:
  python strumenti/_forno-ricolora.py _forno-corsa

Produce dentro la cartella dell'atlante:
  prova-ricolora.png      il neutro accanto a quattro divise, stessa cottura
  corsa-atlante-stretto.png / corsa-maschera-stretta.png
                          gli stessi sprite ritagliati sul riquadro utile
  corsa-stretto.json      il montaggio della variante stretta
"""
import json, os, sys
import numpy as np
from PIL import Image

D = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "_forno-corsa")
meta = json.load(open(os.path.join(D, "corsa.json"), encoding="utf-8"))
L, ND, NF = meta["lato_cella_px"], meta["direzioni"], meta["fotogrammi"]
A = np.asarray(Image.open(os.path.join(D, meta["atlante"])).convert("RGBA")).astype(np.float32) / 255.0
M = np.asarray(Image.open(os.path.join(D, meta["maschera"])).convert("RGBA")).astype(np.float32) / 255.0


def a_lineare(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def a_srgb(c):
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


NEU_MAGLIA = meta["colore_neutro"]["maglia"]      # gia' in lineare: e' il Base Color
NEU_PANTA = meta["colore_neutro"]["panta"]


def esa(s):
    s = s.lstrip('#')
    return np.array([int(s[i:i+2], 16) / 255.0 for i in (0, 2, 4)], dtype=np.float32)


def ricolora(rgba, mask, tinta_maglia, tinta_panta):
    """LA REGOLA. Il pixel neutro porta gia' tutta l'ombreggiatura: basta
       moltiplicarlo per il rapporto fra la tinta voluta e il grigio con cui
       e' stato cotto, e il rapporto si applica pesato dalla copertura del
       pixel che sta nella maschera. In lineare, se no le ombre virano."""
    lin = a_lineare(rgba[:, :, :3])
    km = a_lineare(esa(tinta_maglia)) / NEU_MAGLIA
    kp = a_lineare(esa(tinta_panta)) / NEU_PANTA
    mr = mask[:, :, 0:1]
    mg = mask[:, :, 1:2]
    k = 1.0 + mr * (km[None, None, :] - 1.0) + mg * (kp[None, None, :] - 1.0)
    out = rgba.copy()
    out[:, :, :3] = a_srgb(lin * k)
    return out


def cella(img, d, f):
    return img[d*L:(d+1)*L, f*L:(f+1)*L]


DIVISE = [
    ("neutro",   None,      None),
    ("azzurri",  "#2a6bc4", "#f2f4f8"),
    ("granata",  "#8c1f2f", "#1a1a1e"),
    ("gialloneri", "#e8c23a", "#141414"),
    ("verdi",    "#1f7a44", "#f5f5f0"),
]
FOT = 2
strisce = []
for nome, tm, tp in DIVISE:
    col = []
    for d in (0, 2, 3, 6):
        c = cella(A, d, FOT).copy()
        if tm:
            c = ricolora(c, cella(M, d, FOT), tm, tp)
        col.append(c)
    strisce.append(np.concatenate(col, axis=1))
prova = np.concatenate(strisce, axis=0)
# sfondo a scacchi, per far vedere che l'alfa c'e' e che l'ombra e' dentro
h, w = prova.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
sc = np.where(((xx // 16 + yy // 16) % 2) == 0, 0.86, 0.74).astype(np.float32)
sf = np.stack([sc, sc, sc], axis=2)
al = prova[:, :, 3:4]
comp = prova[:, :, :3] * al + sf * (1 - al)
p1 = os.path.join(D, "prova-ricolora.png")
Image.fromarray((np.clip(comp, 0, 1) * 255).astype(np.uint8)).save(p1)

# ------------------------------------------------ la variante STRETTA
r = meta["riquadro_alfa_max"]
x0, x1, y0, y1 = r["x0"], r["x1"], r["y0"], r["y1"]
cw, ch = x1 - x0 + 1, y1 - y0 + 1
sa = np.zeros((ch * ND, cw * NF, 4), dtype=np.float32)
sm = np.zeros((ch * ND, cw * NF, 4), dtype=np.float32)
for d in range(ND):
    for f in range(NF):
        sa[d*ch:(d+1)*ch, f*cw:(f+1)*cw] = cella(A, d, f)[y0:y1+1, x0:x1+1]
        sm[d*ch:(d+1)*ch, f*cw:(f+1)*cw] = cella(M, d, f)[y0:y1+1, x0:x1+1]
p2 = os.path.join(D, "corsa-atlante-stretto.png")
p3 = os.path.join(D, "corsa-maschera-stretta.png")
Image.fromarray((sa * 255).astype(np.uint8)).save(p2, optimize=True)
# la maschera e' fatta di tre soli colori pieni: una tavolozza la stringe
mi = Image.fromarray((sm * 255).astype(np.uint8))
mi.convert("RGB").quantize(colors=4, method=Image.MEDIANCUT).save(p3, optimize=True)

stretto = dict(meta)
stretto.update({
    "atlante": os.path.basename(p2),
    "maschera": os.path.basename(p3),
    "lato_cella_px": None,
    "cella_px": {"w": cw, "h": ch},
    "appoggio_px": {"x": round(meta["appoggio_px"]["x"] - x0, 2),
                    "y": round(meta["appoggio_px"]["y"] - y0, 2)},
    "ritaglio_nota": "stesse celle dell'atlante quadrato, ritagliate sul riquadro "
                     "utile misurato (x %d..%d, y %d..%d): il punto di appoggio si "
                     "sposta di (-%d ; -%d)" % (x0, x1, y0, y1, x0, y0),
    "maschera_nota": "maschera a tavolozza di 4 colori: R = maglia, "
                     "G = pantaloncini, nero = il resto",
})
with open(os.path.join(D, "corsa-stretto.json"), "w", encoding="utf-8") as fh:
    json.dump(stretto, fh, ensure_ascii=False, indent=2)


def kb(p):
    return os.path.getsize(p) / 1024.0


print("prova di ricolorazione   %s  (%d x %d)" % (p1, prova.shape[1], prova.shape[0]))
print("")
print("PESO MISURATO")
print("  atlante quadrato      %8.1f KB   (%d x %d, cella %d)"
      % (kb(os.path.join(D, meta["atlante"])), L*NF, L*ND, L))
print("  maschera quadrata     %8.1f KB" % kb(os.path.join(D, meta["maschera"])))
print("  atlante stretto       %8.1f KB   (%d x %d, cella %dx%d)"
      % (kb(p2), cw*NF, ch*ND, cw, ch))
print("  maschera stretta      %8.1f KB   (tavolozza a 4 colori)" % kb(p3))
print("  ---")
print("  un verbo, quadrato    %8.1f KB" % (kb(os.path.join(D, meta["atlante"]))
                                            + kb(os.path.join(D, meta["maschera"]))))
print("  un verbo, stretto     %8.1f KB" % (kb(p2) + kb(p3)))
