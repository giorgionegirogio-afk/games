"""
monta.py -- dal PIANO (piano.json) all'atlante, in un colpo solo.

Per ogni riga del piano: taglia il foglio in 8 celle (foglio.py), le
rinomina <clip>-d<k>-f<f> in fuori/sprite/pronti/, poi costruisce
l'atlante (atlante.py). Rifa' tutto da capo a ogni corsa: la cartella
pronti/ si svuota prima, cosi' un foglio tolto dal piano sparisce anche
dall'atlante e non resta un fotogramma orfano.

USO: python strumenti/sprite/monta.py [--piano strumenti/sprite/piano.json]
     [--ingresso fuori/sprite/ingresso] [--uscita fuori/sprite/atlante] [--cella 144] [--altezza 128]
Esce 0 fatto, 1 un foglio non regge (manca, o foglio.py lo boccia), 2 esploso.
"""
import sys, os, json, shutil, argparse, subprocess

QUI = os.path.dirname(os.path.abspath(__file__))


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument('--piano', default=os.path.join(QUI, 'piano.json'))
    ap.add_argument('--ingresso', default='fuori/sprite/ingresso')
    ap.add_argument('--uscita', default='fuori/sprite/atlante')
    ap.add_argument('--pronti', default='fuori/sprite/pronti')
    ap.add_argument('--cella', type=int, default=144)
    ap.add_argument('--altezza', type=int, default=128)
    a = ap.parse_args()
    try:
        piano = json.load(open(a.piano, encoding='utf-8'))['fogli']
        if os.path.isdir(a.pronti): shutil.rmtree(a.pronti)
        os.makedirs(a.pronti, exist_ok=True)
        rossi = 0
        for r in piano:
            src = os.path.join(a.ingresso, r['foglio'] + '.png')
            if not os.path.exists(src):
                print('  NO  manca il foglio', src); rossi += 1; continue
            tmp = os.path.join('fuori', 'sprite', 'celle', r['foglio'])
            if os.path.isdir(tmp): shutil.rmtree(tmp)
            # un foglio puo' avere piu' di 8 celle (il generatore a volte ne fa
            # 16, due set con camere diverse): "attese" le dichiara e si tengono
            # le PRIME otto, in ordine di lettura, come d0..d7; le altre x0..
            attese = int(r.get('attese', 8))
            # "da": da quale cella (in ordine di lettura) cominciano le otto
            # direzioni; le altre celle si chiamano x0.. e non entrano nell'atlante
            da = int(r.get('da', 0))
            nomi = []
            for k in range(attese):
                nomi.append('d%d' % (k - da) if da <= k < da + 8 else 'x%d' % k)
            esito = subprocess.run([sys.executable, os.path.join(QUI, 'foglio.py'), src, '--uscita', tmp,
                                    '--altezza', '256', '--attese', str(attese), '--nomi', ','.join(nomi)],
                                   capture_output=True, text=True)
            if esito.returncode != 0:
                print('  NO  foglio.py boccia', r['foglio'], '\n' + esito.stdout.strip()); rossi += 1; continue
            # LA STATURA DEL PERSONAGGIO NEL FOGLIO, in pixel: e' il riferimento
            # con cui l'atlante scala OGNI cella, non il bbox della posa. Con il
            # bbox un uomo accovacciato (contrasto, portiere) usciva alto quanto
            # uno in piedi e il tuffo disteso 2,5 volte l'uomo (trovato il 25/9
            # con nb23: tela 255 px in una cella da 144). Misurato in piedi:
            # 472-481 px nei fogli 4x2 (nb06), la meta' nei fogli 4x4 (celle
            # da 256 invece di 512). Si puo' dichiarare per foglio.
            statura = float(r.get('statura_px', 476 if attese <= 8 else 238))
            for k in range(8):
                base = '%s-d%d' % (r['foglio'], k)
                nuovo = '%s-d%d-f%d' % (r['clip'], k, r.get('f', 0))
                for suff in ('.png', '-maglia.png', '-calzoni.png', '-pelle.png', '-capelli.png'):
                    if os.path.exists(os.path.join(tmp, base + suff)):
                        shutil.copyfile(os.path.join(tmp, base + suff), os.path.join(a.pronti, nuovo + suff))
                info = json.load(open(os.path.join(tmp, base + '.json'), encoding='utf-8'))
                # la statura va riportata nella scala della CELLA ritagliata: ritaglia
                # ha ridimensionato il soggetto a 256 px di bbox, quindi la statura
                # in quella scala e' statura_foglio x (256 / bbox_foglio)
                bbox_foglio = float(info['bbox_orig'][3] - info['bbox_orig'][1])
                info['statura_px'] = round(statura * info['altezza_soggetto_px'] / max(1.0, bbox_foglio), 1)
                json.dump(info, open(os.path.join(a.pronti, nuovo + '.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
            print('  ok  %-22s -> %s f%d' % (r['foglio'], r['clip'], r.get('f', 0)))
        if rossi: sys.exit(1)
        esito = subprocess.run([sys.executable, os.path.join(QUI, 'atlante.py'), a.pronti, '--uscita', a.uscita,
                                '--cella', str(a.cella), '--altezza', str(a.altezza)], capture_output=True, text=True)
        print(esito.stdout.strip())
        sys.exit(esito.returncode)
    except SystemExit:
        raise
    except Exception as e:
        print('  ??  lo strumento e\' esploso:', repr(e)); sys.exit(2)


if __name__ == '__main__':
    main()
