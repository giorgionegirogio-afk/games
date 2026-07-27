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
import os, shutil, subprocess, sys, zipfile, glob

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


MANIFEST = u'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="{pkg}"
    android:versionCode="1"
    android:versionName="1.0">

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
    with open(os.path.join(lav, 'AndroidManifest.xml'), 'w', encoding='utf-8') as f:
        f.write(MANIFEST.format(**app))

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
for app in APP:
    kb, certi = costruisci(app)
    print('%-10s %7.0f kB   %s' % (app['nome'] + '.apk', kb, certi[0] if certi else ''))
print('\nAPK in:', USCITA)
