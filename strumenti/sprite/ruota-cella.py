# -*- coding: utf-8 -*-
"""
ruota-cella.py -- da UNA cella di una posa DISTESA alle otto direzioni, per
rotazione nel piano del campo (voce #160, 2 novembre 2026).

PERCHE' ESISTE. Il generatore (Nano Banana) sa tenere coerente un
personaggio dentro un foglio e sa ruotarlo di 45 gradi alla volta quando
STA IN PIEDI (nb06..nb42: 8 celle su 8). Chiesto di sdraiarlo in una
scivolata davvero orizzontale e di ruotarlo, ha dato il corpo giusto (forma
2,8-3,3, dove «steso» chiede > 1,15) ma OTTO PROFILI quasi uguali: la
rotazione a terra non la obbedisce. Il foglio di settembre (nb17) aveva le
otto direzioni ma un corpo seduto (forma 0,5-0,7), ed era l'unica posa MORTA
del cancello della sagoma.

L'IDEA. Una figura distesa e' quasi PIATTA sul campo: spalle e testa stanno
a una spanna da terra. Un oggetto piatto visto da una camera inclinata si
ruota nel piano del campo con una sola trasformazione affine: si toglie la
proiezione (l'asse di profondita' e' compresso di k = sin(elevazione)), si
ruota, si rimette la proiezione. L'errore sta nell'altezza del corpo (una
spanna su quasi due metri): a 40-50 px e' sotto il pixel.

LA CAMERA DEI FOGLI E' ~22 gradi (PROMPT.md: «l'angolo che esce e' moderato,
~20-25 gradi»), non i 42 del rig: k = sin(22) = 0,37. Con k piu' alto le
direzioni verso/da la camera verrebbero troppo lunghe rispetto alle altre
pose del foglio, che sono TUTTE a quell'angolo. La costante e' dichiarata e
si passa con --k.

LE DIREZIONI, come in sprite3d.js e atlante.py: d0 di fronte (verso la
camera, cioe' in basso sullo schermo), d2 profilo verso destra, d4 di
spalle, d6 verso sinistra; le dispari a meta'. La cella sorgente dichiara
la sua direzione con --sorgente-d (2 = piedi verso destra).

USO:
  python strumenti/sprite/ruota-cella.py fuori/160/celle-nb43c/nb43-scivolata-C-c01.png \
      --uscita fuori/sprite/ingresso/nb43-scivolata-R.png [--sorgente-d 2] [--k 0.37]
  Esce un foglio 4x2 su verde pieno, con corsie di verde fra le celle, che
  foglio.py taglia come ogni altro foglio. Stampa la lunghezza del corpo in
  pixel: e' la statura_px da scrivere in piano.json (un corpo disteso e'
  lungo quanto e' alto in piedi).
"""
import sys, os, math, argparse
from PIL import Image
import numpy as np

ANG = {0: 90.0, 1: 45.0, 2: 0.0, 3: -45.0, 4: -90.0, 5: -135.0, 6: 180.0, 7: 135.0}  # gradi, + = verso la camera


def tratti(vettore, minimo):
    """i tratti consecutivi di True lunghi almeno `minimo`: [(inizio, fine)]"""
    out, i, n = [], 0, len(vettore)
    while i < n:
        if vettore[i]:
            j = i
            while j < n and vettore[j]:
                j += 1
            if j - i >= minimo:
                out.append((i, j))
            i = j
        else:
            i += 1
    return out


def cella_grezza(foglio_png, indice, margine=16):
    """LA CELLA GREZZA, col magenta dei calzoncini intatto. Le celle che
    foglio.py scrive sono gia' passate da ritaglia.py (magenta neutralizzato
    in grigio, verde tolto): rimetterle nella catena farebbe perdere la
    maschera dei calzoncini, che si tingono della seconda tinta della
    squadra. Qui si taglia il foglio ORIGINALE con lo stesso criterio di
    foglio.py (bande di verde pieno, prima per righe poi per colonne) e si
    torna una RGBA con l'alfa dal verde: la catena a valle rifa' il suo."""
    im = Image.open(foglio_png).convert('RGB')
    arr = np.asarray(im).astype(np.int32)
    verde = arr[2:8, 2:8].reshape(-1, 3).mean(axis=0)
    dist = np.abs(arr - verde).sum(axis=2)
    m = dist > 60
    celle = []
    for (y0, y1) in tratti(m.any(axis=1), 20):
        for (x0, x1) in tratti(m[y0:y1].any(axis=0), 20):
            celle.append((x0, y0, x1, y1))
    if indice >= len(celle):
        print('FALLITO: nel foglio ho trovato %d celle, chiesta la %d' % (len(celle), indice)); sys.exit(1)
    x0, y0, x1, y1 = celle[indice]
    x0, y0 = max(0, x0 - margine), max(0, y0 - margine)
    x1, y1 = min(im.width, x1 + margine), min(im.height, y1 + margine)
    rgba = np.zeros((y1 - y0, x1 - x0, 4), dtype=np.uint8)
    rgba[:, :, :3] = arr[y0:y1, x0:x1]
    alfa = np.clip((dist[y0:y1, x0:x1] - 30) / 60.0, 0, 1)
    rgba[:, :, 3] = (alfa * 255).astype(np.uint8)
    print('cella grezza %d di %d: (%d,%d)-(%d,%d)' % (indice, len(celle), x0, y0, x1, y1))
    return Image.fromarray(rgba, 'RGBA')


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument('cella', help='una cella RGBA, oppure il FOGLIO originale con --indice')
    ap.add_argument('--indice', type=int, default=None, help='con un foglio: quale cella (ordine di lettura, da 0)')
    ap.add_argument('--uscita', required=True)
    ap.add_argument('--sorgente-d', type=int, default=2)
    ap.add_argument('--k', type=float, default=0.37)
    ap.add_argument('--margine', type=int, default=70)
    ap.add_argument('--verde', default='86,171,52')
    a = ap.parse_args()

    src = cella_grezza(a.cella, a.indice) if a.indice is not None else Image.open(a.cella).convert('RGBA')
    alfa = np.array(src)[:, :, 3]
    ys, xs = np.where(alfa > 8)
    if len(xs) == 0:
        print('FALLITO: cella vuota'); sys.exit(1)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    L = x1 - x0 + 1                      # lunghezza del corpo disteso (asse laterale)
    H = y1 - y0 + 1
    scx, scy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    k = a.k
    lato = int(math.ceil(max(L, H / k) * 1.08)) + 2 * a.margine
    verde = tuple(int(v) for v in a.verde.split(','))
    corsia = a.margine
    foglio = Image.new('RGB', (4 * lato + 5 * corsia, 2 * lato + 3 * corsia), verde)

    phi0 = math.radians(ANG[a.sorgente_d])
    for d in range(8):
        phi = math.radians(ANG[d]) - phi0
        c, s = math.cos(phi), math.sin(phi)
        # IL MODELLO E' UN CILINDRO STESO, non una lastra: l'ASSE del corpo
        # (la coordinata x della cella sorgente) giace sul campo e si ruota
        # con la proiezione — sullo schermo diventa il vettore a=(cos, k*sin),
        # lungo L solo di profilo e L*k quando punta verso la camera; lo
        # SPESSORE (la coordinata y della sorgente: spalle, bacino, cioe'
        # altezza da terra piu' che profondita') NON si proietta: resta
        # lungo uguale, perpendicolare all'asse proiettato, col lato del
        # suolo sempre verso il basso dello schermo (n_y >= 0). Il primo
        # modello (lastra piatta, Y=v/k) stirava lo spessore di 1/k e dava
        # 692 px di larghezza a una figura vista di punta: misurato, scartato.
        ax, ay = c, k * s
        na = math.hypot(ax, ay)
        nx, ny = -ay / na, ax / na
        if ny < 0 or (ny == 0 and nx < 0):
            nx, ny = -nx, -ny
        det = ax * ny - nx * ay
        # uscita P = x*a + y*n  ->  sorgente (x,y) = inv([a n]) * P
        A_ = ny / det;    B_ = -nx / det
        D_ = -ay / det;   E_ = ax / det
        C_ = scx - (lato / 2.0) * A_ - (lato / 2.0) * B_
        F_ = scy - (lato / 2.0) * D_ - (lato / 2.0) * E_
        cella = src.transform((lato, lato), Image.AFFINE, (A_, B_, C_, D_, E_, F_), resample=Image.BICUBIC)
        sfondo = Image.new('RGBA', (lato, lato), verde + (255,))
        sfondo.alpha_composite(cella)
        px = corsia + (d % 4) * (lato + corsia)
        py = corsia + (d // 4) * (lato + corsia)
        foglio.paste(sfondo.convert('RGB'), (px, py))

    os.makedirs(os.path.dirname(a.uscita) or '.', exist_ok=True)
    foglio.save(a.uscita)
    print('scritto %s  %dx%d  cella %d px  corpo lungo %d px (statura_px), alto %d px, k=%.2f' % (
        a.uscita, foglio.width, foglio.height, lato, L, H, k))


if __name__ == '__main__':
    main()
