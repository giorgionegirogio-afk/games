# -*- coding: utf-8 -*-
"""
PROVINO CIECO — due serie di figure appaiate, senza sapere quale sia quale.

PERCHE'. Il committente ha chiesto che due cose vengano messe «fianco a
fianco alla cieca» e che un giudice dica quale sembra migliore. Perche'
quel giudizio valga qualcosa, il giudice non deve poter indovinare quale
serie viene da dove: se una delle due porta un'etichetta, un fondo
diverso, una risoluzione diversa o una figura piu' grande, il giudice sta
giudicando quello e non la qualita' della figura.

Questo script pareggia cio' che si puo' pareggiare e DICHIARA cio' che
non si puo':
  · pareggia l'ALTEZZA DELLA FIGURA (misurata sul riquadro della sagoma,
    non sulla cella: una cella puo' avere margini diversi);
  · pareggia il FONDO (lo stesso verde piatto per tutte e due);
  · pareggia la RISOLUZIONE di uscita;
  · NON pareggia l'illuminazione: il forno ha un sole ambra e un
    riempimento freddo, il gioco ha la sua luce dipinta dentro le tinte.
    Quella differenza fa parte di cio' che si giudica, e va detto al
    giudice che una differenza di luce non e' un indizio di provenienza.

L'ordine delle due serie e' deciso da un seme passato da fuori, e la
soluzione si scrive in un file separato che il giudice non vede.

uso:  python strumenti/_provino-cieco.py --seme 7
"""
import os, sys, json, glob
from PIL import Image

QUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(QUI)

def arg(nome, dif=None):
    a = sys.argv
    return a[a.index('--' + nome) + 1] if ('--' + nome) in a and a.index('--' + nome) + 1 < len(a) else dif

SEME = int(arg('seme', '1'))
USCITA = arg('out', os.path.join(REPO, '_provino'))
ALTA = int(arg('altezza', '150'))        # altezza voluta della figura, in px
FONDO = (34, 92, 46)                     # lo stesso verde per tutte e due

def riquadro_sagoma(im, fondo_tol=26):
    """Il riquadro della FIGURA, non della cella.

    Su alfa si usa l'alfa. Su un'immagine opaca si usa la distanza dal
    colore del bordo: si assume che i quattro angoli siano fondo, il che
    e' vero per una figura centrata e va verificato guardando il
    risultato — se un angolo cade dentro la figura il riquadro esce
    sbagliato in modo evidente, non in modo silenzioso.
    """
    if im.mode == 'RGBA':
        a = im.split()[3]
        bb = a.getbbox()
        if bb: return bb
    rgb = im.convert('RGB')
    L, A = rgb.size
    ang = [rgb.getpixel(p) for p in ((0,0),(L-1,0),(0,A-1),(L-1,A-1))]
    base = tuple(sum(c[i] for c in ang)//4 for i in range(3))
    px = rgb.load()
    x0, y0, x1, y1 = L, A, 0, 0
    for y in range(A):
        for x in range(L):
            c = px[x, y]
            if abs(c[0]-base[0]) + abs(c[1]-base[1]) + abs(c[2]-base[2]) > fondo_tol:
                if x < x0: x0 = x
                if y < y0: y0 = y
                if x > x1: x1 = x
                if y > y1: y1 = y
    if x1 < x0: return None
    return (x0, y0, x1+1, y1+1)

def normalizza(im, alta):
    """Porta la FIGURA all'altezza voluta, su fondo comune, cella quadrata."""
    bb = riquadro_sagoma(im)
    if not bb: return None, None
    fig = im.crop(bb)
    w, h = fig.size
    k = alta / h
    nw, nh = max(1, round(w * k)), alta
    fig = fig.resize((nw, nh), Image.LANCZOS)
    lato = int(alta * 1.30)
    cella = Image.new('RGB', (lato, lato), FONDO)
    if fig.mode == 'RGBA':
        cella.paste(fig, ((lato - nw)//2, (lato - nh)//2), fig)
    else:
        cella.paste(fig.convert('RGB'), ((lato - nw)//2, (lato - nh)//2))
    return cella, (w, h)

def striscia(celle, titolo_interno=False):
    lato = celle[0].size[0]
    fuori = Image.new('RGB', (lato * 4, lato * 2), FONDO)
    for i, c in enumerate(celle[:8]):
        fuori.paste(c, ((i % 4) * lato, (i // 4) * lato))
    return fuori

# ---------------------------------------------------------------- le due serie
# SERIE «gioco»: otto ritagli prodotti da strumenti/_provino-figure.js
gioco = []
misure_g = []
for k in range(8):
    f = os.path.join(REPO, '_provino', 'g-%d.png' % k)
    if not os.path.exists(f):
        print('MANCA', f); sys.exit(1)
    c, m = normalizza(Image.open(f), ALTA)
    if c is None: print('sagoma non trovata in', f); sys.exit(1)
    gioco.append(c); misure_g.append(m)

# SERIE «forno»: un solo PNG 640x320 con otto celle 160x160
ff = os.path.join(REPO, '_forno-corsa2', 'otto-direzioni.png')
if not os.path.exists(ff):
    print('MANCA', ff); sys.exit(1)
F = Image.open(ff)
lc = F.size[0] // 4
forno = []
misure_f = []
for i in range(8):
    cel = F.crop(((i % 4) * lc, (i // 4) * (F.size[1] // 2), (i % 4 + 1) * lc, (i // 4 + 1) * (F.size[1] // 2)))
    c, m = normalizza(cel, ALTA)
    if c is None: print('sagoma non trovata nella cella', i); sys.exit(1)
    forno.append(c); misure_f.append(m)

A_e_B = [('gioco', gioco), ('forno', forno)]
# l'ordine lo decide il seme, e la soluzione va in un file a parte
if SEME % 2 == 1:
    A_e_B = A_e_B[::-1]

os.makedirs(USCITA, exist_ok=True)
striscia(A_e_B[0][1]).save(os.path.join(USCITA, 'SERIE-A.png'))
striscia(A_e_B[1][1]).save(os.path.join(USCITA, 'SERIE-B.png'))

sol = {
    'seme': SEME,
    'A': A_e_B[0][0], 'B': A_e_B[1][0],
    'altezza_normalizzata_px': ALTA,
    'altezze_originali_gioco': misure_g,
    'altezze_originali_forno': misure_f,
}
with open(os.path.join(USCITA, 'SOLUZIONE.json'), 'w', encoding='utf-8') as fh:
    json.dump(sol, fh, ensure_ascii=False, indent=2)

print('SERIE-A.png e SERIE-B.png scritte in', USCITA)
print('altezze originali della figura (larghezza x altezza, in px):')
print('  gioco:', misure_g)
print('  forno:', misure_f)
print('la soluzione e in SOLUZIONE.json — non aprirlo prima di aver giudicato')
