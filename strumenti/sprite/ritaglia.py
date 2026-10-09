"""
ritaglia.py -- da un'immagine GENERATA (un calciatore su sfondo verde uniforme)
a uno SPRITE pronto per CALCETTO.

PERCHE' ESISTE. Il committente vuole personaggi di qualita' realistica e ha
chiesto di generarli con Nano Banana (Gemini) o di prenderli da Pexels. Un
generatore restituisce un'immagine intera: sfondo, ombra, bordi morbidi. Il
gioco vuole tutt'altro: un PNG con l'alfa pulito, il soggetto centrato a
un'altezza nota, e una MASCHERA della maglia -- perche' le squadre in
CALCETTO nascono generate (16 divise + il portiere) e lo sprite deve
poter essere TINTO dal gioco, altrimenti due squadre vestono uguale
(misurato alla voce #151: un solo arco di tinta addosso alle figure con
l'atlante, contro tre di oggi). Questo script fa quel lavoro, uguale per
ogni immagine, cosi' cento sprite escono coerenti fra loro.

CHE COSA PRODUCE, per ogni ingresso:
  <nome>.png          RGBA, sfondo tolto (chroma key con sfumatura ai bordi),
                      ritagliato al soggetto, centrato su tela quadrata,
                      ridimensionato all'altezza chiesta (default 256 px).
  <nome>-maglia.png   maschera a 8 bit: 255 dove la divisa e' BIANCA
                      (= dove il gioco tinge coi colori della squadra),
                      0 altrove. Le zone di pelle, capelli, scarpe restano 0.
  <nome>.json         i numeri: bbox originale, altezza, baricentro, quota
                      dei piedi (il gioco ancora la figura a cyTerra).

USO:
  python strumenti/sprite/ritaglia.py <ingresso.png> [altri.png ...] --uscita <cartella> [--altezza 256]
  python strumenti/sprite/ritaglia.py --prova           (test su un'immagine sintetica)

CODICI DI USCITA, come ogni strumento di casa: 0 fatto, 1 un ingresso non
regge (sfondo non uniforme, soggetto non trovato), 2 lo strumento e' esploso.

LIMITI DICHIARATI. Il chroma key assume uno sfondo verde UNIFORME: e' il
prompt a doverlo chiedere («flat uniform grass-green background, no lines»).
Se il generatore mette righe o erba con texture, la sfumatura ai bordi si
sporca: lo script lo segnala (varianza dello sfondo sopra soglia) ed esce 1
invece di produrre uno sprite frastagliato in silenzio.
"""
import sys, os, json, argparse
import numpy as np
from PIL import Image, ImageFilter


def stima_sfondo(arr):
    """Il verde di sfondo si stima dai quattro angoli (mediana), non dal
    pixel (0,0): un generatore puo' mettere un alone in un angolo."""
    h, w = arr.shape[:2]
    k = max(4, min(h, w) // 25)
    angoli = np.concatenate([
        arr[:k, :k].reshape(-1, 3), arr[:k, -k:].reshape(-1, 3),
        arr[-k:, :k].reshape(-1, 3), arr[-k:, -k:].reshape(-1, 3),
    ]).astype(np.float32)
    med = np.median(angoli, axis=0)
    var = float(np.mean(np.std(angoli, axis=0)))
    return med, var


def chroma(arr, sfondo, morbido=18.0, netto=48.0):
    """Alfa continuo dalla distanza colore: 0 entro `morbido`, 1 oltre
    `netto`, rampa liscia in mezzo (smoothstep). E' la sfumatura che evita
    il bordo seghettato."""
    d = np.linalg.norm(arr.astype(np.float32) - sfondo, axis=2)
    t = np.clip((d - morbido) / (netto - morbido), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def maschera_maglia(arr, alfa):
    """La divisa bianca = POCO SATURA e NON NERA, dentro il soggetto. E' una
    maschera MORBIDA (0..1), non una soglia: la prima stesura chiedeva
    luminanza > 175 e lasciava GRIGIE le pieghe in ombra della maglia
    (misurato sul foglio nb02 del 25 settembre 2026: chiazze grigie dentro
    ogni maglia tinta). Il gioco tinge moltiplicando il colore della
    squadra per la luminanza del pixel, quindi le pieghe scure devono
    stare DENTRO la maschera: e' la luminanza a farle scure, non
    l'esclusione. Pelle (saturazione 0,3-0,45) e scarpe nere (luminanza
    sotto 70) restano fuori."""
    f = arr.astype(np.float32)
    mx = f.max(axis=2); mn = f.min(axis=2)
    lum = (mx + mn) / 2.0
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1.0), 0.0)
    m = np.clip((0.26 - sat) / 0.10, 0.0, 1.0) * np.clip((lum - 70.0) / 40.0, 0.0, 1.0) * (alfa > 0.3)
    m8 = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))
    return np.asarray(m8).astype(np.float32) / 255.0


def maschera_calzoni(arr, alfa):
    """I CALZONCINI CODIFICATI IN MAGENTA. Il gioco veste i calzoncini con
    la SECONDA tinta della squadra (look.pantaloncini, da c2), la maglia con
    la prima: se nello sprite fossero bianchi entrambi, nessuna soglia li
    distinguerebbe in una scivolata o in un tiro (la geometria «fra anca e
    mezza coscia» vale solo in piedi). Si chiede al generatore un magenta
    acceso: rosso e blu alti, verde basso — lontano dalla pelle (tono 20°),
    dal verde dello sfondo (120°) e dal bianco. La maschera e' morbida come
    quella della maglia; la tinta poi usa la luminanza del pixel."""
    f = arr.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    ecc = np.minimum(r, b) - g                       # quanto e' magenta
    m = np.clip((ecc - 30.0) / 40.0, 0.0, 1.0) * (alfa > 0.3)
    m8 = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))
    return np.asarray(m8).astype(np.float32) / 255.0


def maschera_pelle(arr, alfa, testa=None, capelli=None):
    """LA PELLE (voce #158, compito 4): tono caldo (rosso > verde > blu),
    saturazione media, luminanza media-alta, dentro il soggetto. Serve al
    gioco per dare a ogni uomo la SUA carnagione (look.pelle) senza
    rifotografare nulla: la maschera e' morbida come le altre. Fuori
    restano la maglia (poco satura), i calzoncini (magenta: blu > verde),
    le scarpe e i capelli (scuri)."""
    f = arr.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    mx = f.max(axis=2); mn = f.min(axis=2)
    lum = (mx + mn) / 2.0
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1.0), 0.0)
    # Soglie LARGHE e poi una CHIUSURA morfologica: la prima stesura
    # (saturazione > 0,16, luminanza < 230) lasciava fuori i riflessi del
    # volto, e una carnagione scura usciva a chiazze (persone.png del 25/9:
    # fronte e zigomi chiari su guance scure). Il bianco della maglia resta
    # fuori per la condizione «calda» (rosso sopra verde e blu), le scarpe
    # per la luminanza, i calzoncini perche' gia' grigi.
    calda = (r > g + 6) & (b < r - 12)
    m = calda * np.clip((sat - 0.06) / 0.10, 0, 1) * np.clip((lum - 60) / 30.0, 0, 1) * np.clip((252 - lum) / 20.0, 0, 1) * (alfa > 0.3)
    # IL VOLTO E' TUTTO PELLE, per geometria e non per colore: nel quarto
    # alto del soggetto (dove sta la testa) ogni pixel opaco che non e'
    # capelli e non e' nero e' viso — fronte e naso hanno riflessi quasi
    # bianchi che nessuna soglia di colore prende, e una carnagione scura
    # usciva con la fronte chiara a rettangoli (persone.png del 25/9, due
    # stesure a soglie). Le braccia e le gambe restano al colore.
    if testa is not None and capelli is not None:
        y0, y1 = testa
        banda = np.zeros(arr.shape[:2], np.float32)
        lim = int(y0 + (y1 - y0) * 0.24)
        banda[:max(lim, 1), :] = 1.0
        viso = banda * (alfa > 0.3) * (1.0 - np.clip(capelli * 1.5, 0, 1)) * np.clip((lum - 45) / 25.0, 0, 1)
        m = np.maximum(m, viso)
    m8 = Image.fromarray((m * 255).astype(np.uint8))
    m8 = m8.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))   # chiude i buchi fino a 5 px
    m8 = m8.filter(ImageFilter.MedianFilter(5))
    return np.asarray(m8).astype(np.float32) / 255.0


def maschera_capelli(arr, alfa, y0, y1):
    """I CAPELLI: pixel scuri nel quarto alto del soggetto. Le scarpe sono
    scure uguali ma stanno in basso; la barba e le sopracciglia entrano,
    ed e' giusto cosi' (si tingono coi capelli)."""
    f = arr.astype(np.float32)
    lum = (f.max(axis=2) + f.min(axis=2)) / 2.0
    h = arr.shape[0]
    alto = np.zeros(arr.shape[:2], np.float32)
    lim = int(y0 + (y1 - y0) * 0.22)
    alto[:max(lim, 1), :] = 1.0
    m = np.clip((95.0 - lum) / 35.0, 0, 1) * alto * (alfa > 0.3)
    m8 = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))
    return np.asarray(m8).astype(np.float32) / 255.0


def ritaglia(percorso, cartella, altezza=256, margine=0.06):
    img = Image.open(percorso).convert('RGB')
    arr = np.asarray(img)
    sfondo, var = stima_sfondo(arr)
    if var > 14.0:
        print('  NO  sfondo non uniforme (deviazione %.1f > 14): il prompt deve chiedere un verde piatto' % var)
        return None
    alfa = chroma(arr, sfondo)
    # piccolo respiro ai bordi: toglie i pixel isolati del rumore
    a8 = Image.fromarray((alfa * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))
    # ...e UN pixel di erosione: la frangia verde sta nell'ultimo pixel
    # del bordo, dove il colore e' gia' misto; toglierlo costa un pixel
    # su 480 di figura e leva l'alone (visto sul foglio nb02).
    a8 = a8.filter(ImageFilter.MinFilter(3))
    alfa = np.asarray(a8).astype(np.float32) / 255.0
    ys, xs = np.where(alfa > 0.10)
    if len(ys) < 50:
        print('  NO  soggetto non trovato (meno di 50 pixel non-sfondo)')
        return None
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    # spurgo del colore verde (despill), PIENO e ovunque: dove il verde
    # supera il maggiore fra rosso e blu lo si abbassa a quel livello. La
    # prima stesura lo pesava con (1-alfa) e lasciava la frangia verde sul
    # bordo opaco; un calciatore in bianco non ha nulla di verde suo, quindi
    # lo spurgo pieno non toglie niente di vero.
    f = arr.astype(np.float32)
    g_ecc = np.maximum(f[..., 1] - np.maximum(f[..., 0], f[..., 2]), 0.0)
    f[..., 1] = f[..., 1] - g_ecc
    rgba = np.dstack([np.clip(f, 0, 255), alfa * 255.0]).astype(np.uint8)
    magl = maschera_maglia(arr, alfa)
    calz = maschera_calzoni(arr, alfa)
    cape = maschera_capelli(arr, alfa, y0, y1)
    pell = maschera_pelle(arr, alfa, (y0, y1), cape)
    # i calzoncini magenta vanno tolti dalla maschera della maglia (sono
    # saturi, quindi gia' fuori) e il loro colore va NEUTRALIZZATO nello
    # sprite: il gioco li tinge per luminanza, e un residuo magenta sotto
    # una tinta blu darebbe viola. Dove la maschera e' alta il pixel
    # diventa grigio della sua stessa luminanza.
    if calz.max() > 0:
        # la NEUTRALIZZAZIONE usa una maschera piu' larga e piu' dura di
        # quella di tinta: sul bordo dei calzoncini la maschera morbida vale
        # 0,3-0,7 e lasciava un orlo viola (visto nell'atlante del 25/9);
        # qui basta un accenno di magenta (>0,15, allargato di un pixel)
        # perche' il pixel diventi grigio della sua luminanza.
        dura = np.clip(calz / 0.15, 0.0, 1.0)
        dura = np.asarray(Image.fromarray((dura * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))).astype(np.float32) / 255.0
        lumc = (f.max(axis=2) + f.min(axis=2)) / 2.0
        for k in range(3):
            f[..., k] = f[..., k] * (1.0 - dura) + lumc * dura
        rgba = np.dstack([np.clip(f, 0, 255), alfa * 255.0]).astype(np.uint8)
    # ritaglio con margine, poi tela quadrata centrata sul soggetto
    hh, ww = y1 - y0, x1 - x0
    lato = int(max(hh, ww) * (1.0 + 2 * margine))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    tela = np.zeros((lato, lato, 4), np.uint8)
    tmag = np.zeros((lato, lato), np.uint8)
    tcal = np.zeros((lato, lato), np.uint8)
    tpel = np.zeros((lato, lato), np.uint8)
    tcap = np.zeros((lato, lato), np.uint8)
    sx0, sy0 = cx - lato // 2, cy - lato // 2
    for (dst, src) in ((tela, rgba), (tmag, (magl * 255).astype(np.uint8)), (tcal, (calz * 255).astype(np.uint8)),
                       (tpel, (pell * 255).astype(np.uint8)), (tcap, (cape * 255).astype(np.uint8))):
        ax0, ay0 = max(0, sx0), max(0, sy0)
        ax1, ay1 = min(arr.shape[1], sx0 + lato), min(arr.shape[0], sy0 + lato)
        dst[ay0 - sy0:ay1 - sy0, ax0 - sx0:ax1 - sx0] = src[ay0:ay1, ax0:ax1]
    scala = altezza / float(hh)
    fin = int(round(lato * scala))
    out = Image.fromarray(tela).resize((fin, fin), Image.LANCZOS)
    outm = Image.fromarray(tmag).resize((fin, fin), Image.LANCZOS)
    outc = Image.fromarray(tcal).resize((fin, fin), Image.LANCZOS)
    outp = Image.fromarray(tpel).resize((fin, fin), Image.LANCZOS)
    outk = Image.fromarray(tcap).resize((fin, fin), Image.LANCZOS)
    nome = os.path.splitext(os.path.basename(percorso))[0]
    os.makedirs(cartella, exist_ok=True)
    out.save(os.path.join(cartella, nome + '.png'))
    outm.save(os.path.join(cartella, nome + '-maglia.png'))
    outc.save(os.path.join(cartella, nome + '-calzoni.png'))
    outp.save(os.path.join(cartella, nome + '-pelle.png'))
    outk.save(os.path.join(cartella, nome + '-capelli.png'))
    # i piedi: la riga piu' bassa del soggetto (alfa>0.5), in coordinate
    # della tela finale -- il gioco ancora la figura a cyTerra
    piedi = float((y1 - 1 - sy0) * scala)
    info = {
        'ingresso': os.path.basename(percorso), 'sfondo_rgb': [int(v) for v in sfondo],
        'sfondo_dev': round(var, 2), 'bbox_orig': [int(x0), int(y0), int(x1), int(y1)],
        'tela_px': fin, 'altezza_soggetto_px': int(round(hh * scala)),
        'piedi_y': round(piedi, 1), 'maglia_pixel': int((magl > 0.5).sum()),
        'maglia_quota': round(float((magl > 0.5).sum()) / max(1, int((alfa > 0.5).sum())), 3),
        'calzoni_quota': round(float((calz > 0.5).sum()) / max(1, int((alfa > 0.5).sum())), 3),
        'pelle_quota': round(float((pell > 0.5).sum()) / max(1, int((alfa > 0.5).sum())), 3),
        'capelli_quota': round(float((cape > 0.5).sum()) / max(1, int((alfa > 0.5).sum())), 3),
    }
    with open(os.path.join(cartella, nome + '.json'), 'w', encoding='utf-8') as fh:
        json.dump(info, fh, indent=1, ensure_ascii=False)
    print('  OK  %-28s soggetto %dx%d -> tela %d px, maglia %.0f%% del corpo, piedi a y=%.0f'
          % (nome, ww, hh, fin, info['maglia_quota'] * 100, piedi))
    return info


def prova(cartella):
    """Un'immagine sintetica: ellisse bianca (maglia) + rettangolo scuro
    (calzoncini) + disco color pelle, su verde piatto. Verifica che il
    chroma key, il ritaglio e la maschera facciano il loro mestiere."""
    from PIL import ImageDraw
    im = Image.new('RGB', (400, 400), (45, 92, 39))
    d = ImageDraw.Draw(im)
    d.ellipse((150, 120, 250, 230), fill=(245, 245, 245))     # maglia bianca
    d.rectangle((160, 225, 240, 275), fill=(30, 30, 40))       # calzoncini scuri
    d.ellipse((178, 90, 222, 134), fill=(215, 170, 140))       # testa
    d.rectangle((165, 275, 185, 320), fill=(245, 245, 245))    # calzettoni
    d.rectangle((215, 275, 235, 320), fill=(245, 245, 245))
    p = os.path.join(cartella, 'sintetico.png')
    os.makedirs(cartella, exist_ok=True)
    im.save(p)
    info = ritaglia(p, cartella, altezza=128)
    ok = info is not None and 0.35 < info['maglia_quota'] < 0.75 and info['altezza_soggetto_px'] == 128
    print('  %s  prova sintetica: maglia %.0f%% (attesa 35-75%%), altezza %s (attesa 128)'
          % ('OK ' if ok else 'NO ', (info or {}).get('maglia_quota', 0) * 100, (info or {}).get('altezza_soggetto_px')))
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument('ingressi', nargs='*')
    ap.add_argument('--uscita', default='fuori/sprite')
    ap.add_argument('--altezza', type=int, default=256)
    ap.add_argument('--prova', action='store_true')
    a = ap.parse_args()
    try:
        if a.prova:
            sys.exit(prova(os.path.join(a.uscita, 'prova')))
        if not a.ingressi:
            print(__doc__); sys.exit(2)
        rossi = 0
        for p in a.ingressi:
            if ritaglia(p, a.uscita, a.altezza) is None:
                rossi += 1
        sys.exit(1 if rossi else 0)
    except SystemExit:
        raise
    except Exception as e:
        print('  ??  lo strumento e\' esploso:', repr(e)); sys.exit(2)


if __name__ == '__main__':
    main()
