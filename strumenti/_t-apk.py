# -*- coding: utf-8 -*-
"""
_t-apk.py — costruisce UN APK di CALCETTO con un gioco DI PROVA dentro,
fuori dal repo.

Perche' esiste: android/costruisci.py prende il gioco da
<repo>/CALCETTO-il-gioco.html e scrive in <repo>/apk/. Per misurare una
toppa sul telefono vero senza toccare ne' il gioco ne' l'APK del repo
serve la stessa catena (aapt2 -> javac -> d8 -> aapt2 link -> zip degli
asset -> zipalign -> apksigner) con due sole cose diverse: da dove viene
l'HTML e dove finisce l'APK. Il pacchetto, la chiave e il manifest sono
gli stessi, quindi il telefono lo accetta come aggiornamento e si torna
indietro reinstallando apk/CALCETTO.apk.

  python strumenti/_t-apk.py --html C:/tmp/dopo.html --out C:/tmp/DOPO.apk
"""
import os, sys, shutil, subprocess, zipfile, glob, argparse

QUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(QUI)
AND = os.path.join(REPO, 'android')
SDK = os.environ.get('ANDROID_SDK', r'C:/Users/Utenteee/Android/Sdk').replace('\\', '/')
JDK = os.environ.get('JDK_BIN', r'C:/Program Files/Java/jdk-25.0.2/bin').replace('\\', '/')
BT = SDK + '/build-tools/34.0.0'
ANDROID_JAR = SDK + '/platforms/android-34/android.jar'

APP = dict(nome='CALCETTO', pkg='it.dopolavoro.calcetto', etichetta='CALCETTO',
           file='CALCETTO-il-gioco.html', orient='sensorLandscape', icona='calcetto',
           sfondo='#0b1f16')


def esegui(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        print('COMANDO FALLITO:', ' '.join(str(c) for c in cmd[:3]), '...')
        print(r.stdout[-2000:]); print(r.stderr[-2000:])
        sys.exit(1)
    return r


def manifest_testo():
    """Il manifest e' quello di android/costruisci.py, letto da li' invece
    che ricopiato: una copia che invecchia e' esattamente la trappola di
    casa numero quattro."""
    src = open(os.path.join(AND, 'costruisci.py'), encoding='utf-8').read()
    a = src.index("MANIFEST = u'''") + len("MANIFEST = u'''")
    b = src.index("'''", a)
    return src[a:b]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--html', required=True)
    ap.add_argument('--out', required=True)
    o = ap.parse_args()
    html = os.path.abspath(o.html)
    fuori = os.path.abspath(o.out)
    if not os.path.exists(html):
        print('non trovo', html); sys.exit(2)

    lav = os.path.join(os.path.dirname(fuori), '_lavoro_apk')
    shutil.rmtree(lav, ignore_errors=True); os.makedirs(lav)

    with open(os.path.join(lav, 'AndroidManifest.xml'), 'w', encoding='utf-8') as f:
        f.write(manifest_testo().format(**APP))

    res = os.path.join(lav, 'res')
    for d, px in [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]:
        cart = os.path.join(res, 'mipmap-' + d); os.makedirs(cart)
        shutil.copy(os.path.join(AND, 'icone', 'icona-%s-%d.png' % (APP['icona'], px)),
                    os.path.join(cart, 'icona.png'))
    compilate = os.path.join(lav, 'res.zip')
    esegui([BT + '/aapt2.exe', 'compile', '--dir', res, '-o', compilate])

    classi = os.path.join(lav, 'classi'); os.makedirs(classi)
    esegui([JDK + '/javac.exe', '-nowarn', '-source', '8', '-target', '8',
            '-bootclasspath', ANDROID_JAR, '-classpath', ANDROID_JAR,
            '-d', classi, os.path.join(AND, 'Gioco.java')])
    esegui([BT + '/d8.bat', '--lib', ANDROID_JAR, '--min-api', '24',
            '--output', lav] + glob.glob(os.path.join(classi, '**', '*.class'), recursive=True))

    base = os.path.join(lav, 'base.apk')
    esegui([BT + '/aapt2.exe', 'link', '-o', base, '-I', ANDROID_JAR,
            '--manifest', os.path.join(lav, 'AndroidManifest.xml'),
            '--min-sdk-version', '24', '--target-sdk-version', '34',
            '--no-version-vectors', compilate])
    with zipfile.ZipFile(base, 'a', zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(lav, 'classes.dex'), 'classes.dex')
        z.write(html, 'assets/' + APP['file'])

    allineato = os.path.join(lav, 'allineato.apk')
    esegui([BT + '/zipalign.exe', '-p', '-f', '4', base, allineato])
    chiave = os.path.join(AND, 'chiave.jks')
    if not os.path.exists(chiave):
        print('manca android/chiave.jks: costruire prima con android/costruisci.py'); sys.exit(1)
    if os.path.exists(fuori): os.remove(fuori)
    esegui([BT + '/apksigner.bat', 'sign', '--ks', chiave, '--ks-pass', 'pass:collaudo',
            '--key-pass', 'pass:collaudo', '--min-sdk-version', '24', '--out', fuori, allineato])
    esegui([BT + '/apksigner.bat', 'verify', fuori])
    print('%s  %.0f kB   (gioco: %s)' % (fuori, os.path.getsize(fuori) / 1024.0, html))


main()
