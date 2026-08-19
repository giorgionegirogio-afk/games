# -*- coding: utf-8 -*-
"""
FORNO DUE TONI — terza e ultima versione: mestiere di pixel art.

Le prime due sbagliavano la stessa cosa in due modi diversi. Il decalco e il
gradiente producono una GRADAZIONE MORBIDA, e a sette pixel di arto una
gradazione morbida e' antialiasing: sfocatura. La sfocatura si mangia il
contorno nero, che e' una delle tre cose che reggono il rimpicciolimento.
La pixel art racconta tubi da 3-4 px da trent'anni con DUE TONI NETTI.

Il matcap cotto in Blender (fuori/rampa2-matcap.png) resta la sorgente: si
spende diversamente. Da un profilo continuo si ricava la migliore
approssimazione a GRADINO, cioe' due valori e un punto di taglio, con la
partizione che minimizza l'errore quadratico (e' Otsu in una dimensione,
provato su tutte le posizioni di taglio).

DUE DECISIONI CHE VENGONO DALLA DIAGNOSI DEL CONTORNO, non dal gusto:
  · IL TONO D'OMBRA NON SCENDE SOTTO 0,94. Il gradiente metteva il suo
    valore piu' scuro esattamente sul bordo dell'arto, appoggiato al nero
    del contorno: geometricamente non lo toccava, ma TONALMENTE il nero e
    il bordo scuro si leggevano come una banda unica di 2-3 px. Con il tono
    d'ombra quasi uguale alla tinta di oggi, il confine con il contorno
    resta quello di oggi.
  · IL COLMO STA DENTRO. La sua capsula e' piu' stretta e scostata verso il
    sole, e il rientro si impone in PIXEL a tempo di disegno
    (max(0,9 px ; 0,14 x W)), non in unita' normalizzate: cosi' vale a
    qualunque misura di arto. Fuori dal colmo resta sempre almeno un pixel
    di tono d'ombra prima del contorno.

La media pesata dei due toni vale 1: la luminanza media dell'arto non
cambia, ed e' quello che tiene fermo il contrasto maglia/erba.

  python strumenti/_forno-duetoni.py [cartella]
"""
import os, sys, json, math
import numpy as np
from PIL import Image

R = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "fuori")
MAT = os.path.join(R, "rampa2-matcap.png")
N_ANG, N_CAMP = 16, 64
OMBRA_MIN = 0.94
INSET_NOM = 0.14            # rientro nominale, per il conto delle frazioni

im = np.asarray(Image.open(MAT).convert("RGBA")).astype(np.float32) / 255.0
MP = im.shape[0]
AL = im[:, :, 3]
LUM = np.array([0.2126, 0.7152, 0.0722], np.float32)


def campiona(u, v):
    x = int(round((u * 0.5 + 0.5) * (MP - 1)))
    y = int(round((0.5 - v * 0.5) * (MP - 1)))
    x = min(max(x, 0), MP - 1); y = min(max(y, 0), MP - 1)
    if AL[y, x] < 0.5:
        return None
    return im[y, x, :3]


righe = []
err_grad, err_due, err_otsu = [], [], []
for k in range(N_ANG):
    th = 2 * math.pi * k / N_ANG
    # v del matcap va in ALTO, y del canvas va in BASSO: il segno si nega
    nx, ny = -math.sin(th), -math.cos(th)
    P = []
    for j in range(N_CAMP):
        t = ((j + 0.5) / N_CAMP * 2 - 1) * 0.94
        c = campiona(nx * t, ny * t)
        P.append(float((c * LUM).sum()) if c is not None else 0.0)
    P = np.maximum(np.array(P, np.float32), 1e-4)
    P = P / P.mean()
    P = np.clip(1.0 + (P - 1.0) * 2.4, 0.62, 1.40)
    P = P / P.mean()

    # IL TAGLIO A MINIMO ERRORE (Otsu in una dimensione), solo per confronto:
    # lo si calcola per poter dire di quanto la scelta vera se ne discosta
    best = None
    for s in range(4, N_CAMP - 3):
        a, b = P[:s], P[s:]
        e = float(((a - a.mean()) ** 2).sum() + ((b - b.mean()) ** 2).sum())
        if best is None or e < best[0]:
            best = (e, s, float(a.mean()), float(b.mean()))
    err_otsu.append(math.sqrt(best[0] / N_CAMP))
    # LA SCELTA VERA NON MINIMIZZA L'ERRORE, E LO DICHIARO. Otsu taglia a
    # meta' dell'arto: una banda larga il 48-78% non e' un colmo, e' un
    # secondo riempimento piatto, e a sette pixel non racconta niente. Il
    # mestiere della pixel art e' una RIGA sottile di colmo su un corpo in
    # tinta base. Qui la banda e' fissa al 30% (a 7 px sono ~2 px) e sta
    # centrata sul massimo del profilo, che e' il matcap a dire dov'e'.
    FC = 0.30
    jmax = int(np.argmax(P))
    c = (jmax + 0.5) / N_CAMP - 0.5
    c = min(max(c, -0.5 + FC / 2), 0.5 - FC / 2)
    a0, b0 = c - FC / 2, c + FC / 2
    ia = int(round((a0 + 0.5) * N_CAMP)); ib = int(round((b0 + 0.5) * N_CAMP))
    ia = max(0, min(ia, N_CAMP - 1)); ib = max(ia + 1, min(ib, N_CAMP))
    dentro = np.zeros(N_CAMP, bool); dentro[ia:ib] = True
    m1 = float(P[dentro].mean()); m0 = float(P[~dentro].mean())
    s = ia
    gradino = np.where(dentro, m1, m0)
    err_due.append(float(np.sqrt(((gradino - P) ** 2).mean())))
    # per confronto: quanto sbaglia la spezzata a 5 fermate (la versione 2)
    idx = np.linspace(0, N_CAMP - 1, 5).round().astype(int)
    ts = (np.arange(N_CAMP) + 0.5) / N_CAMP
    err_grad.append(float(np.sqrt(((np.interp(ts, ts[idx], P[idx]) - P) ** 2).mean())))

    fC, fO = FC, 1.0 - FC
    mO = max(OMBRA_MIN, m0)
    mC = (1.0 - mO * fO) / fC          # media pesata = 1, sempre
    righe.append({
        "angolo": round(math.degrees(th), 1),
        "banda_colmo": [round(a0, 4), round(b0, 4)],
        "centro_colmo": round(float(c), 4),
        "tono_ombra": round(float(mO), 4),
        "tono_colmo": round(float(mC), 4),
        "frazione_colmo": round(float(fC), 4),
        "otsu_avrebbe_tagliato_a": round(best[1] / N_CAMP, 3),
    })

meta = {
    "sorgente": "matcap cotto in Blender (rampa2-matcap.png): sfera del materiale "
                "del gioco sotto il sole e il cielo della scena, ortografica a 42 gradi",
    "metodo": "migliore approssimazione a gradino del profilo continuo: si prova "
              "ogni posizione di taglio e si tiene quella con errore quadratico minimo",
    "angoli": N_ANG,
    "toni": 2,
    "asse": "banda_colmo in unita' di larghezza dell'arto, da -0,5 a +0,5, lungo la "
            "perpendicolare n(theta) = (-sin, cos) in coordinate CANVAS",
    "regola_rientro": "a tempo di disegno il colmo si stringe di max(0,9 px ; 0,14*W) "
                      "per lato: resta sempre almeno un pixel di tono d'ombra fra il "
                      "colmo e il contorno nero",
    "regola_base_chiara": "se il tono di colmo satura la tinta, si abbassa la BASE "
                          "(entrambi i toni) di min(1 ; 0,97/(canale piu' alto x tono "
                          "di colmo)). Mai un terzo tono: a 7 px sarebbe di nuovo una rampa.",
    "tono_ombra_minimo": OMBRA_MIN,
    "perche_ombra_minima": "il gradiente metteva il valore piu' scuro sul bordo, "
                           "appoggiato al contorno nero: geometricamente non lo toccava, "
                           "tonalmente ci si fondeva. Con l'ombra a 0,94 il confine con "
                           "il contorno resta quello della tinta piatta di oggi.",
    "errore_rms": {"due_toni_banda_stretta": round(float(np.mean(err_due)), 4),
                   "due_toni_taglio_a_minimo_errore": round(float(np.mean(err_otsu)), 4),
                   "gradiente_5_fermate": round(float(np.mean(err_grad)), 4)},
    "nota_errore": "la banda stretta sbaglia il profilo PIU' del taglio ottimo, e "
                   "apposta: l'obiettivo non e' approssimare una curva, e' leggere "
                   "come tubo a sette pixel. Il taglio ottimo dava un colmo largo "
                   "meta' arto, cioe' due campiture piatte affiancate.",
    "righe": righe,
}
p = os.path.join(R, "duetoni.json")
with open(p, "w", encoding="utf-8") as fh:
    json.dump(meta, fh, ensure_ascii=False, indent=1)
print("FORNO DUE TONI OK")
print("  %s  (%d byte)" % (p, os.path.getsize(p)))
print("  errore rms: due toni banda stretta %.4f | taglio ottimo %.4f | gradiente 5 fermate %.4f"
      % (np.mean(err_due), np.mean(err_otsu), np.mean(err_grad)))
print("  tono d'ombra %.3f..%.3f | tono di colmo %.3f..%.3f | frazione di colmo %.2f..%.2f"
      % (min(r["tono_ombra"] for r in righe), max(r["tono_ombra"] for r in righe),
         min(r["tono_colmo"] for r in righe), max(r["tono_colmo"] for r in righe),
         min(r["frazione_colmo"] for r in righe), max(r["frazione_colmo"] for r in righe)))
