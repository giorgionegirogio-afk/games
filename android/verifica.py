# -*- coding: utf-8 -*-
"""Controlla i due APK finiti, senza fidarsi della build."""
import hashlib, os, re, subprocess, zipfile

SDK = os.environ.get('ANDROID_SDK', r'C:/Users/Utenteee/Android/Sdk').replace('\\', '/')
BT = SDK + '/build-tools/34.0.0'
GIOCHI = os.path.dirname(os.path.abspath(__file__))
GIOCHI = os.path.dirname(GIOCHI)
APK = GIOCHI + '/apk'

APP = [('CIRCOLO', 'CIRCOLO-il-gioco.html', 'it.dopolavoro.circolo'),
       ('CALCETTO', 'CALCETTO-il-gioco.html', 'it.dopolavoro.calcetto')]

esiti = []


def dice(ok, testo):
    esiti.append(ok)
    print(('  OK   ' if ok else '  NO   ') + testo)


def sha(b):
    return hashlib.sha256(b).hexdigest()[:16]


for nome, html, pkg in APP:
    percorso = '%s/%s.apk' % (APK, nome)
    print('\n=== %s  (%.0f kB) ===' % (nome, os.path.getsize(percorso) / 1024.0))

    badging = subprocess.run([BT + '/aapt2.exe', 'dump', 'badging', percorso],
                             capture_output=True, text=True).stdout
    dice("package: name='%s'" % pkg in badging, 'il pacchetto si chiama ' + pkg)
    permessi = [r for r in badging.splitlines() if r.startswith('uses-permission')]
    dice(not permessi, 'nessun permesso richiesto  %s' % (permessi or ''))
    dice("sdkVersion:'24'" in badging, 'gira da Android 7 in su')
    dice('launchable-activity' in badging, "c'e' l'icona nel cassetto delle app")

    with zipfile.ZipFile(percorso) as z:
        nomi = z.namelist()
        dice('classes.dex' in nomi, 'il codice compilato e" dentro')
        dice('assets/' + html in nomi, 'il gioco e" dentro come asset')

        dentro = z.read('assets/' + html)
        fuori = open('%s/%s' % (GIOCHI, html), 'rb').read()
        dice(dentro == fuori,
             'il gioco nell\'APK e" identico al sorgente (sha %s)' % sha(dentro))

        icone = [n for n in nomi if n.startswith('res/') and 'icona' in n]
        dice(len(icone) >= 5, 'icone a %d densita' % len(icone))

        dex = z.read('classes.dex')
        dice(dex[:8] == b'dex\n035\x00' or dex[:4] == b'dex\n', 'il dex e" valido')
        for classe in (b'it/dopolavoro/gioco/Gioco', b'Cronaca', b'Risposta'):
            dice(classe in dex, 'il dex contiene ' + classe.decode())

        testo = dentro.decode('utf-8', 'ignore')
        # niente rete: nessun src/href remoto, nessuna chiamata in uscita
        remoti = re.findall(r'(?:src|href)\s*=\s*["\']https?://[^"\']+', testo)
        dice(not remoti, 'nessuna risorsa remota  %s' % (remoti[:2] or ''))
        chiamate = re.findall(r'\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(', testo)
        dice(not chiamate, 'nessuna chiamata di rete  %s' % (chiamate[:3] or ''))
        dice('window.__indietro' in testo, "il gioco sa gestire il tasto Indietro")

    firma = subprocess.run([BT + '/apksigner.bat', 'verify', '--verbose', percorso],
                           capture_output=True, text=True).stdout
    dice('Verified using v2 scheme (APK Signature Scheme v2): true' in firma,
         'firmato con lo schema v2')

print('\n%d controlli, %d passati, %d falliti' %
      (len(esiti), sum(esiti), len(esiti) - sum(esiti)))
