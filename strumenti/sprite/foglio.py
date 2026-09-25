"""
foglio.py -- da un FOGLIO generato (piu' copie dello stesso calciatore in
griglia su verde uniforme) ai singoli sprite, uno per cella.

PERCHE' ESISTE. Un generatore d'immagini tiene il personaggio COERENTE
dentro una sola immagine molto meglio che fra immagini diverse: chiedere
«lo stesso giocatore otto volte, ruotato di 45 gradi» in un foglio solo da'
otto figure con lo stesso volto, lo stesso taglio della maglia, la stessa
luce (verificato il 25 settembre 2026 col primo foglio, nb02: 8 celle su
8 coerenti). Questo script taglia il foglio in celle e affida ogni cella a
`ritaglia.py`, cosi' lo sprite di ogni direzione esce dalla STESSA pipeline
del singolo (alfa sfumato, spurgo del verde, maschera della maglia, json).

COME TAGLIA. Non cerca componenti connesse (una figura puo' avere il
braccio staccato dal corpo dal verde): PROIETTA la maschera del soggetto
sulle righe, trova le bande orizzontali separate da verde pieno, e dentro
ogni banda proietta sulle colonne. E' robusto per una griglia con corsie
di verde fra le celle, che e' cio' che il prompt chiede; se due figure si
toccano, escono in UNA cella e lo script lo dice (conta le celle trovate
contro quelle attese, se dichiarate con --attese N) ed esce 1.

USO:
  python strumenti/sprite/foglio.py <foglio.png> --uscita <cartella> [--altezza 256] [--attese 8] [--nomi d0,d1,...]

  Le celle escono in ordine di lettura (riga per riga, da sinistra) col
  nome <foglio>-<nome cella>; senza --nomi si chiamano c00, c01, ...

CODICI DI USCITA: 0 fatto, 1 il foglio non regge (sfondo non uniforme,
celle diverse dalle attese, una cella rifiutata da ritaglia), 2 esploso.
"""
import sys, os, argparse
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ritaglia as R


def bande(vettore, minimo, tolleranza):
    """Intervalli [a,b) dove `vettore` e' vero, chiudendo i buchi fino a
    `tolleranza` pixel e scartando gli intervalli sotto `minimo`."""
    out = []; a = None; buco = 0
    for i, v in enumerate(vettore):
        if v:
            if a is None: a = i
            buco = 0
        elif a is not None:
            buco += 1
            if buco > tolleranza:
                b = i - buco + 1
                if b - a >= minimo: out.append((a, b))
                a = None; buco = 0
    if a is not None:
        b = len(vettore) - buco
        if b - a >= minimo: out.append((a, b))
    return out


def spacca(m, y0, y1, x0, x1, parti):
    """Divide la cella [x0,x1) in `parti` alla colonna meno coperta entro
    il 12% attorno a ogni divisione uguale; ogni parte torna col bbox
    stretto dei suoi pixel."""
    col = m[y0:y1, x0:x1].sum(axis=0).astype(np.float32)
    W = x1 - x0; tagli = []
    for i in range(1, parti):
        c = int(W * i / parti); r = max(4, int(W * 0.12))
        lo, hi = max(1, c - r), min(W - 1, c + r)
        tagli.append(x0 + lo + int(np.argmin(col[lo:hi])))
    bordi = [x0] + tagli + [x1]
    out = []
    for a, b in zip(bordi[:-1], bordi[1:]):
        ys = np.where(m[y0:y1, a:b].any(axis=1))[0]
        xs = np.where(m[y0:y1, a:b].any(axis=0))[0]
        if len(ys) == 0: continue
        # la quinta coordinata dice «cella tagliata»: il ritaglio potra'
        # togliere i frammenti della vicina che sporgono oltre il taglio
        out.append((a + int(xs.min()), y0 + int(ys.min()), a + int(xs.max()) + 1, y0 + int(ys.max()) + 1, True))
    return out


def componenti(m):
    """Etichetta le componenti connesse (4-vicinanza) di una maschera
    booleana. Senza scipy: una visita in ampiezza per componente, su
    maschere da poche centinaia di pixel di lato."""
    h, w = m.shape
    lab = np.zeros((h, w), np.int32); n = 0
    for sy, sx in zip(*np.where(m)):
        if lab[sy, sx]: continue
        n += 1; pila = [(sy, sx)]; lab[sy, sx] = n
        while pila:
            y, x = pila.pop()
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = n; pila.append((ny, nx))
    return lab, n


def pulisci_frammenti(cella, sfondo, margine_px):
    """In una cella TAGLIATA restano pezzi della figura vicina (una mano,
    un avambraccio) che toccano il bordo del taglio. Si tolgono le
    componenti che toccano il bordo sinistro o destro del ritaglio e
    sono piccole rispetto alla piu' grande (sotto il 40%): una mano vera
    dello stesso uomo, staccata dal corpo da un filo di verde, non tocca
    il bordo. Si dipinge sopra il verde di sfondo."""
    m = R.chroma(cella, sfondo) > 0.25
    lab, n = componenti(m)
    if n < 2: return cella
    aree = np.bincount(lab.ravel())[1:]
    grande = aree.max()
    w = cella.shape[1]
    for k in range(1, n + 1):
        if aree[k - 1] >= 0.4 * grande: continue
        ys, xs = np.where(lab == k)
        if xs.min() <= margine_px + 1 or xs.max() >= w - margine_px - 2:
            cella[lab == k] = sfondo
    return cella


def taglia(percorso, cartella, altezza=256, attese=None, nomi=None, margine_px=12):
    img = Image.open(percorso).convert('RGB')
    arr = np.asarray(img)
    sfondo, var = R.stima_sfondo(arr)
    if var > 14.0:
        print('  NO  sfondo non uniforme (deviazione %.1f > 14)' % var); return 1
    m = R.chroma(arr, sfondo) > 0.25
    h, w = m.shape
    righe = []
    for (y0, y1) in bande(m.any(axis=1), int(h * 0.05), 4):
        cel = []
        for (x0, x1) in bande(m[y0:y1].any(axis=0), int(w * 0.03), 4):
            # la riga di taglio vera della cella: dentro la sua colonna
            ys = np.where(m[y0:y1, x0:x1].any(axis=1))[0]
            cel.append((x0, y0 + ys.min(), x1, y0 + ys.max() + 1))
        righe.append((y0, y1, cel))
    # DUE FIGURE CHE SI TOCCANO (un braccio teso arriva alla vicina: e'
    # successo col tiro, nb15, 6 celle su 8). Se il conto per riga e'
    # sotto l'atteso, la cella piu' larga si spacca alla colonna MENO
    # coperta vicino a ogni divisione uguale: e' il punto dove passa
    # meno corpo, cioe' dove il taglio costa meno. Un dito tagliato a
    # 50 px non si vede; un'anta doppia nell'atlante si vede eccome.
    if attese is not None and righe and attese % len(righe) == 0:
        per_riga = attese // len(righe)
        for (y0, y1, cel) in righe:
            while 0 < len(cel) < per_riga:
                i = max(range(len(cel)), key=lambda j: cel[j][2] - cel[j][0])
                x0, _, x1, _ = cel[i]
                cel[i:i + 1] = spacca(m, y0, y1, x0, x1, per_riga - len(cel) + 1)
    celle = [c for (_, _, cel) in righe for c in cel]
    print('  foglio %s: %d celle trovate' % (os.path.basename(percorso), len(celle)))
    if attese is not None and len(celle) != attese:
        print('  NO  attese %d celle, trovate %d' % (attese, len(celle)))
        for c in celle: print('      cella', c)
        return 1
    base = os.path.splitext(os.path.basename(percorso))[0]
    dcelle = os.path.join(cartella, 'celle'); os.makedirs(dcelle, exist_ok=True)
    rossi = 0
    for i, c in enumerate(celle):
        x0, y0, x1, y1 = c[:4]; tagliata = len(c) > 4 and c[4]
        nome = nomi[i] if nomi and i < len(nomi) else 'c%02d' % i
        # un margine di verde attorno: gli angoli devono essere sfondo,
        # perche' ritaglia stima il verde dai quattro angoli. Per una
        # cella tagliata il margine laterale NON prende pixel del foglio
        # (sarebbero della vicina): resta verde pieno.
        ml = 0 if tagliata else margine_px
        cx0, cy0 = max(0, x0 - ml), max(0, y0 - margine_px)
        cx1, cy1 = min(w, x1 + ml), min(h, y1 + margine_px)
        cella = np.full((cy1 - cy0 + 2 * margine_px, cx1 - cx0 + 2 * margine_px, 3), sfondo, np.uint8)
        cella[margine_px:margine_px + (cy1 - cy0), margine_px:margine_px + (cx1 - cx0)] = arr[cy0:cy1, cx0:cx1]
        if tagliata: cella = pulisci_frammenti(cella, sfondo, margine_px)
        p = os.path.join(dcelle, '%s-%s.png' % (base, nome))
        Image.fromarray(cella).save(p)
        if R.ritaglia(p, cartella, altezza) is None: rossi += 1
    return 1 if rossi else 0


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument('fogli', nargs='*')
    ap.add_argument('--uscita', default='fuori/sprite')
    ap.add_argument('--altezza', type=int, default=256)
    ap.add_argument('--attese', type=int, default=None)
    ap.add_argument('--nomi', default=None)
    a = ap.parse_args()
    try:
        if not a.fogli:
            print(__doc__); sys.exit(2)
        nomi = a.nomi.split(',') if a.nomi else None
        peggio = 0
        for f in a.fogli:
            peggio = max(peggio, taglia(f, a.uscita, a.altezza, a.attese, nomi))
        sys.exit(peggio)
    except SystemExit:
        raise
    except Exception as e:
        print('  ??  lo strumento e\' esploso:', repr(e)); sys.exit(2)


if __name__ == '__main__':
    main()
