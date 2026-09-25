"""
atlante.py -- dagli sprite singoli (usciti da ritaglia/foglio) all'ATLANTE
che il gioco incorpora: un'immagine sola coi fotogrammi in griglia, una
sola con le maschere di tinta, e la tavola che dice dove sta che cosa.

PERCHE' UN ATLANTE. CALCETTO e' un file HTML solo, senza rete: gli sprite
devono viaggiare dentro il file come data-URI. Cento immagini separate
sarebbero cento decodifiche e cento oggetti Image; una griglia sola si
decodifica una volta e si disegna con drawImage(sx,sy,sw,sh,...). Le
maschere viaggiano in una seconda immagine RGB (R = maglia, G = calzoncini):
il gioco le legge UNA volta per divisa (getImageData) e prepara una tela
tinta per squadra; nel fotogramma resta un drawImage e basta.

NOMI ATTESI IN INGRESSO: <clip>-d<k>[-f<n>].png con accanto -maglia.png,
-calzoni.png e .json (li produce ritaglia.py). <clip> e' il nome della clip
del rig (fermo, corsa, tiro, ...), d<k> la direzione 0..7 (0 = fronte alla
camera, poi in senso orario di 45 gradi visti da sopra: 2 = profilo destro,
4 = di spalle, 6 = profilo sinistro), f<n> il fotogramma (0 se assente).

USO:
  python strumenti/sprite/atlante.py <cartella sprite> --uscita <cartella> [--cella 144] [--altezza 128]

PRODUCE: atlante.png (RGBA), atlante-m.png (RGB maschere), atlante.json:
  {cella, altezza, colonne, voci:{clip:{d:[[col,riga,piediX,piediY,h], ...]}}}
  piediX/piediY sono l'ancora dei piedi DENTRO la cella, h l'altezza del
  soggetto in pixel di cella: il gioco scala cosi' che h -> hPx x statura.

CODICI DI USCITA: 0 fatto, 1 ingressi incoerenti (nessuno sprite, o uno
sprite piu' grande della cella), 2 esploso.
"""
import sys, os, re, json, argparse, math
import numpy as np
from PIL import Image

NOME = re.compile(r'^(?P<clip>[a-zA-Z]+)-d(?P<d>[0-7])(?:-f(?P<f>\d+))?\.png$')


def costruisci(cartella, uscita, cella=144, altezza=128, specchia=()):
    voci = []
    for nome in sorted(os.listdir(cartella)):
        m = NOME.match(nome)
        if not m: continue
        base = nome[:-4]
        pj = os.path.join(cartella, base + '.json')
        if not os.path.exists(pj):
            print('  NO  manca', base + '.json'); return 1
        info = json.load(open(pj, encoding='utf-8'))
        voci.append((m.group('clip'), int(m.group('d')), int(m.group('f') or 0), base, info, False))
    if not voci:
        print('  NO  nessuno sprite <clip>-d<k>.png in', cartella); return 1
    # LA SECONDA META' DEL CICLO E' LO SPECCHIO DELLA PRIMA. Per le clip
    # cicliche simmetriche (corsa, camminata) si generano solo gli istanti
    # con la gamba DESTRA avanti: lo stesso istante con la sinistra avanti
    # e' l'immagine specchiata della direzione opposta (d -> (8-d) % 8),
    # perche' specchiare l'immagine scambia destra e sinistra dell'uomo E
    # il verso della sua rotazione. La luce e' chiesta uniforme al
    # generatore proprio perche' lo specchio non si veda.
    for clip in specchia:
        prime = [v for v in voci if v[0] == clip]
        nf = 1 + max([v[2] for v in prime] or [-1])
        for (c, d, f, base, info, _) in prime:
            # lo specchio della cella (clip, 8-d, f) diventa il fotogramma f+nf di d
            fonte = [v for v in prime if v[1] == (8 - d) % 8 and v[2] == f]
            if not fonte: continue
            voci.append((clip, d, f + nf, fonte[0][3], fonte[0][4], True))
    voci.sort(key=lambda v: (v[0], v[1], v[2]))
    n = len(voci)
    colonne = int(math.ceil(math.sqrt(n)))
    righe = int(math.ceil(n / colonne))
    atl = Image.new('RGBA', (colonne * cella, righe * cella), (0, 0, 0, 0))
    mas = Image.new('RGB', (colonne * cella, righe * cella), (0, 0, 0))
    tavola = {}
    for i, (clip, d, f, base, info, spec) in enumerate(voci):
        im = Image.open(os.path.join(cartella, base + '.png')).convert('RGBA')
        mm = Image.open(os.path.join(cartella, base + '-maglia.png')).convert('L')
        pc = os.path.join(cartella, base + '-calzoni.png')
        mc = Image.open(pc).convert('L') if os.path.exists(pc) else Image.new('L', im.size, 0)
        if spec:
            im = im.transpose(Image.FLIP_LEFT_RIGHT); mm = mm.transpose(Image.FLIP_LEFT_RIGHT); mc = mc.transpose(Image.FLIP_LEFT_RIGHT)
        # scala: la STATURA del personaggio (non il bbox della posa) diventa
        # `altezza` px di cella; senza statura dichiarata si ricade sul bbox,
        # che e' giusto solo per le pose in piedi. Se la tela non entra nella
        # cella (una posa distesa), si stringe quanto basta: il gioco scala
        # sull'altezza h scritta in tavola, quindi la misura a schermo non cambia.
        ref = float(info.get('statura_px') or info['altezza_soggetto_px'])
        k = altezza / ref
        if im.width * k > cella:
            k = cella / float(im.width)
        lato = int(round(im.width * k))
        if lato > cella:
            print('  NO  %s: tela %d px > cella %d' % (base, lato, cella)); return 1
        im = im.resize((lato, lato), Image.LANCZOS)
        mm = mm.resize((lato, lato), Image.LANCZOS)
        mc = mc.resize((lato, lato), Image.LANCZOS)
        col, riga = i % colonne, i // colonne
        ox, oy = col * cella + (cella - lato) // 2, riga * cella + (cella - lato) // 2
        atl.paste(im, (ox, oy), im)
        mas.paste(Image.merge('RGB', (mm, mc, Image.new('L', (lato, lato), 0))), (ox, oy))
        piediX = (cella - lato) // 2 + lato / 2.0
        piediY = (cella - lato) // 2 + info['piedi_y'] * k
        h = ref * k          # l'altezza dell'UOMO in pixel di cella: e' cio' che il gioco porta a hPx
        tavola.setdefault(clip, {}).setdefault(str(d), []).append(
            [col, riga, round(piediX, 1), round(piediY, 1), round(h, 1)])
    os.makedirs(uscita, exist_ok=True)
    atl.save(os.path.join(uscita, 'atlante.png'), optimize=True)
    mas.save(os.path.join(uscita, 'atlante-m.png'), optimize=True)
    # anche in WebP (con alfa): e' quello che entra nel gioco se pesa meno
    try:
        atl.save(os.path.join(uscita, 'atlante.webp'), quality=82, method=6)
        mas.save(os.path.join(uscita, 'atlante-m.webp'), lossless=True, method=6)
    except Exception as e:
        print('  (webp non disponibile: %r)' % (e,))
    tav = {'cella': cella, 'altezza': altezza, 'colonne': colonne, 'righe': righe, 'voci': tavola}
    json.dump(tav, open(os.path.join(uscita, 'atlante.json'), 'w', encoding='utf-8'), separators=(',', ':'))
    pesi = {f: os.path.getsize(os.path.join(uscita, f)) for f in os.listdir(uscita) if f.startswith('atlante')}
    print('  OK  %d fotogrammi, %d clip, griglia %dx%d celle da %d px' % (n, len(tavola), colonne, righe, cella))
    for f, b in sorted(pesi.items()): print('      %-16s %7.1f kB' % (f, b / 1024.0))
    return 0


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument('cartella')
    ap.add_argument('--uscita', default='fuori/sprite/atlante')
    ap.add_argument('--cella', type=int, default=144)
    ap.add_argument('--altezza', type=int, default=128)
    ap.add_argument('--specchia', default='corsa,camminata',
                    help='clip cicliche la cui seconda meta\' e\' lo specchio della prima')
    a = ap.parse_args()
    try:
        spec = tuple(s for s in a.specchia.split(',') if s)
        sys.exit(costruisci(a.cartella, a.uscita, a.cella, a.altezza, spec))
    except SystemExit:
        raise
    except Exception as e:
        print('  ??  lo strumento e\' esploso:', repr(e)); sys.exit(2)


if __name__ == '__main__':
    main()
