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
            esito = subprocess.run([sys.executable, os.path.join(QUI, 'foglio.py'), src, '--uscita', tmp,
                                    '--altezza', '256', '--attese', '8', '--nomi', 'd0,d1,d2,d3,d4,d5,d6,d7'],
                                   capture_output=True, text=True)
            if esito.returncode != 0:
                print('  NO  foglio.py boccia', r['foglio'], '\n' + esito.stdout.strip()); rossi += 1; continue
            for k in range(8):
                base = '%s-d%d' % (r['foglio'], k)
                nuovo = '%s-d%d-f%d' % (r['clip'], k, r.get('f', 0))
                for suff in ('.png', '-maglia.png', '-calzoni.png', '.json'):
                    shutil.copyfile(os.path.join(tmp, base + suff), os.path.join(a.pronti, nuovo + suff))
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
