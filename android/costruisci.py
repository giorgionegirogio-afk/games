# -*- coding: utf-8 -*-
"""
Costruisce due APK Android offline (CIRCOLO e CALCETTO) senza gradle.

Catena: aapt2 (risorse) -> javac (l'unica classe) -> d8 (dex) -> aapt2 link
-> zip degli asset -> zipalign -> apksigner. Niente rete durante la build,
niente dipendenze oltre all'SDK.

Si lancia da qui:   python costruisci.py
Gli APK finiti finiscono in  ../apk/

Se l'SDK o il JDK stanno altrove, si indicano cosi' senza toccare il file:
  set ANDROID_SDK=D:/Android/Sdk
  set JDK_BIN=C:/Program Files/Java/jdk-21/bin
"""
import os, shutil, subprocess, sys, zipfile, glob, json, datetime

SDK = os.environ.get('ANDROID_SDK', r'C:/Users/Utenteee/Android/Sdk').replace('\\', '/')
# keytool e javac non sono nello shim di Oracle: serve la cartella bin vera
JDK = os.environ.get('JDK_BIN', r'C:/Program Files/Java/jdk-25.0.2/bin').replace('\\', '/')
BT = SDK + '/build-tools/34.0.0'
ANDROID_JAR = SDK + '/platforms/android-34/android.jar'
QUI = os.path.dirname(os.path.abspath(__file__))
GIOCHI = os.path.dirname(QUI)          # i due giochi stanno nella cartella sopra
USCITA = GIOCHI + '/apk'

APP = [
    dict(nome='CIRCOLO', pkg='it.dopolavoro.circolo', etichetta='CIRCOLO',
         file='CIRCOLO-il-gioco.html', orient='portrait', icona='circolo',
         sfondo='#1D5537'),
    dict(nome='CALCETTO', pkg='it.dopolavoro.calcetto', etichetta='CALCETTO',
         file='CALCETTO-il-gioco.html', orient='sensorLandscape', icona='calcetto',
         sfondo='#0b1f16'),
]


def esegui(cmd, **kw):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    except FileNotFoundError:
        print('ESEGUIBILE NON TROVATO:', cmd[0]); sys.exit(1)
    if r.returncode != 0:
        print('COMANDO FALLITO:', ' '.join(str(c) for c in cmd[:3]), '...')
        print(r.stdout[-3000:])
        print(r.stderr[-3000:])
        sys.exit(1)
    return r


# =====================================================================
# IL NUMERO DI VERSIONE — voce A2.1
#
# Il problema che risolve: `android:versionCode="1"` scritto a mano nel
# manifest. Android usa QUEL numero, e solo quello, per decidere se un
# pacchetto e' un aggiornamento del precedente; con 1 fisso il secondo
# APK non si installa mai sopra il primo (misurato prima della modifica:
# «dumpsys package it.dopolavoro.calcetto» diceva versionCode=1 dopo due
# giorni di build). Non e' una questione di Play Store: e' rotto anche
# per chi passa l'APK a un amico.
#
# DA DOVE VIENE IL NUMERO, e perche' proprio da li'. Due sono le regole
# che deve rispettare: non deve MAI diminuire, e non deve dipendere da
# chi lo costruisce. Il tempo le rispetta tutte e due e non chiede
# niente a nessuno, quindi:
#
#     versionCode = minuti interi passati dal 1 gennaio 2024, in UTC
#
# In UTC apposta: due macchine con fusi diversi devono dire lo stesso
# numero nello stesso istante. Oggi vale circa 1,4 milioni e cresce di
# 525.600 all'anno; il tetto che Android/Play impongono e' 2.100.000.000,
# quindi la formula regge per quasi quattromila anni. Un minuto di
# risoluzione basta: nessuno pubblica due versioni diverse nello stesso
# minuto.
#
# COSA NON HO SCELTO, e perche':
#   · il conto dei commit (`git rev-list --count`): DIMINUISCE. Basta un
#     rebase, un ramo diverso, o un clone superficiale, e il numero
#     torna indietro: da li' in poi nessun telefono accetta piu' un
#     aggiornamento finche' non si disinstalla a mano.
#   · un contatore in un file, da solo: dipende da chi costruisce. Due
#     persone che costruiscono in parallelo producono due APK diversi
#     con lo stesso numero.
#   · la data YYYYMMDD: due build lo stesso giorno danno lo stesso
#     numero, e il caso normale e' proprio ricostruire piu' volte in un
#     giorno.
#
# IL NOTTOLINO (versione.json). Il tempo puo' tornare indietro per un
# motivo solo: un orologio sbagliato o riportato indietro a mano. Per
# questo l'ultimo numero emesso si scrive in android/versione.json, e se
# il tempo dovesse dare un numero <= a quello, si emette il precedente+1.
# Cosi' la prima regola («non diminuisce mai») e' garantita anche quando
# l'orologio mente, e la seconda resta vera al minuto. Il file non e'
# necessario per costruire: se manca, si riparte dal tempo.
EPOCA = datetime.datetime(2024, 1, 1, tzinfo=datetime.timezone.utc)
SERIE = '1.1'                 # la parte che decide un umano, quando decide che e' cambiato qualcosa
STORICO = QUI + '/versione.json'


def versione():
    ora = datetime.datetime.now(datetime.timezone.utc)
    codice = int((ora - EPOCA).total_seconds() // 60)
    prec = 0
    try:
        with open(STORICO, encoding='utf-8') as f:
            prec = int(json.load(f)['codice'])
    except Exception:
        prec = 0              # il file non c'e' o non si legge: decide il tempo
    if codice <= prec:
        codice = prec + 1     # orologio indietro: si sale di uno e si va avanti
    # il nome e' quello che l'utente vede in Impostazioni > App: serie,
    # data, e il commit da cui e' uscito. Il commit c'e' solo se git c'e'
    # (non e' un requisito per costruire) ed e' l'unica cosa che, in una
    # segnalazione di un difetto, dice DA QUALE sorgente veniva l'APK.
    sigla = ''
    try:
        r = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=GIOCHI,
                           capture_output=True, text=True, timeout=20)
        if r.returncode == 0:
            pulito = ''.join(c for c in r.stdout.strip() if c.isalnum())
            if pulito:
                sigla = ', ' + pulito
    except Exception:
        pass
    # la data del NOME e' quella locale, non UTC: il codice serve alle
    # macchine (e per quelle conta che sia lo stesso ovunque), il nome
    # serve a chi tiene il telefono in mano e dice «ho quella del 20».
    nome = '%s (%s%s)' % (SERIE, datetime.datetime.now().strftime('%Y-%m-%d'), sigla)
    with open(STORICO, 'w', encoding='utf-8') as f:
        json.dump({'codice': codice, 'nome': nome,
                   'quando': ora.strftime('%Y-%m-%d %H:%M:%SZ'),
                   'perche': 'minuti dal 2024-01-01 UTC; non deve mai diminuire'},
                  f, indent=1, ensure_ascii=False)
    return codice, nome


CODICE, NOME = versione()

MANIFEST = u'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="{pkg}"
    android:versionCode="{codice}"
    android:versionName="{nome}">

  <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />

  <!-- Nessun permesso. Il gioco non usa la rete, non legge contatti,
       non accede a file, non manda niente da nessuna parte. -->

  <application
      android:label="{etichetta}"
      android:icon="@mipmap/icona"
      android:roundIcon="@mipmap/icona"
      android:hardwareAccelerated="true"
      android:allowBackup="true"
      android:supportsRtl="false">

    <meta-data android:name="gioco" android:value="{file}" />

    <activity
        android:name="it.dopolavoro.gioco.Gioco"
        android:exported="true"
        android:label="{etichetta}"
        android:screenOrientation="{orient}"
        android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout|uiMode"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>
'''


def costruisci(app):
    lav = os.path.join(QUI, 'lavoro_' + app['nome'].lower())
    shutil.rmtree(lav, ignore_errors=True)
    os.makedirs(lav)

    # ---- manifest ----
    # codice e nome della versione entrano da qui, non a mano: e' il
    # punto di tutta la voce A2.1
    campi = dict(app, codice=CODICE, nome=NOME)
    with open(os.path.join(lav, 'AndroidManifest.xml'), 'w', encoding='utf-8') as f:
        f.write(MANIFEST.format(**campi))

    # ---- risorse: solo le icone ----
    res = os.path.join(lav, 'res')
    dens = [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]
    for d, px in dens:
        cart = os.path.join(res, 'mipmap-' + d)
        os.makedirs(cart)
        shutil.copy(os.path.join(QUI, 'icone', 'icona-%s-%d.png' % (app['icona'], px)),
                    os.path.join(cart, 'icona.png'))

    compilate = os.path.join(lav, 'res.zip')
    esegui([BT + '/aapt2.exe', 'compile', '--dir', res, '-o', compilate])

    # ---- codice ----
    classi = os.path.join(lav, 'classi')
    os.makedirs(classi)
    esegui([JDK + '/javac.exe', '-nowarn', '-source', '8', '-target', '8',
            '-bootclasspath', ANDROID_JAR, '-classpath', ANDROID_JAR,
            '-d', classi, os.path.join(QUI, 'Gioco.java')])

    esegui([BT + '/d8.bat', '--lib', ANDROID_JAR, '--min-api', '24',
            '--output', lav] + glob.glob(os.path.join(classi, '**', '*.class'), recursive=True))

    # ---- pacchetto base (manifest + risorse) ----
    base = os.path.join(lav, 'base.apk')
    esegui([BT + '/aapt2.exe', 'link', '-o', base, '-I', ANDROID_JAR,
            '--manifest', os.path.join(lav, 'AndroidManifest.xml'),
            '--min-sdk-version', '24', '--target-sdk-version', '34',
            '--no-version-vectors', compilate])

    # ---- si aggiungono dex e asset ----
    with zipfile.ZipFile(base, 'a', zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(lav, 'classes.dex'), 'classes.dex')
        # il gioco, per intero, dentro gli asset
        z.write(os.path.join(GIOCHI, app['file']), 'assets/' + app['file'])

    # ---- allineamento e firma ----
    allineato = os.path.join(lav, 'allineato.apk')
    esegui([BT + '/zipalign.exe', '-p', '-f', '4', base, allineato])

    chiave = os.path.join(QUI, 'chiave.jks')
    if not os.path.exists(chiave):
        esegui([JDK + '/keytool.exe', '-genkeypair', '-v', '-keystore', chiave,
                '-alias', 'collaudo', '-keyalg', 'RSA', '-keysize', '2048',
                '-validity', '10000', '-storepass', 'collaudo', '-keypass', 'collaudo',
                '-dname', 'CN=Dopolavoro FC, OU=Collaudo, O=Dopolavoro, L=Italia, C=IT'])

    finale = os.path.join(USCITA, app['nome'] + '.apk')
    esegui([BT + '/apksigner.bat', 'sign',
            '--ks', chiave, '--ks-pass', 'pass:collaudo', '--key-pass', 'pass:collaudo',
            '--min-sdk-version', '24',
            '--out', finale, allineato])

    ver = esegui([BT + '/apksigner.bat', 'verify', '--print-certs', finale])
    kb = os.path.getsize(finale) / 1024.0
    return kb, ver.stdout.strip().splitlines()[:2]


os.makedirs(USCITA, exist_ok=True)
print('versione:  codice %d   nome "%s"' % (CODICE, NOME))
for app in APP:
    kb, certi = costruisci(app)
    print('%-10s %7.0f kB   %s' % (app['nome'] + '.apk', kb, certi[0] if certi else ''))
print('\nAPK in:', USCITA)
