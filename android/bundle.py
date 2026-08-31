# -*- coding: utf-8 -*-
u"""
Costruisce l'Android App Bundle (.aab) da caricare su Google Play.

    python android/bundle.py            # CALCETTO
    python android/bundle.py CIRCOLO    # l'altro gioco

Esce in  ../apk/CALCETTO.aab .  Niente rete, come tutta la catena di casa.


PERCHE' UN FILE A PARTE, E NON DUE RIGHE DENTRO costruisci.py
=============================================================
Sono due mestieri diversi, e mescolarli costa piu' di quanto renda:

  · l'APK si costruisce venti volte al giorno, lo costruiscono gli agenti
    che lavorano al gioco, e deve partire senza chiedere niente a nessuno.
    Il bundle si costruisce quando si pubblica: qualche volta al mese.
  · il bundle ha bisogno di bundletool.jar — 31 MB che NON stanno nel
    repository (si riscaricano da Google). Se costruisci.py ne dipendesse,
    chi clona il progetto non riuscirebbe piu' a fare l'APK: avrebbe
    perso la cosa che gli serve per averne una che non gli serve.
  · il bundle si firma con la CHIAVE DI CARICAMENTO vera, che vive fuori
    dal repository e la cui perdita e' un guaio serio (vedi sotto). La
    build quotidiana non deve nemmeno sfiorarla.

Quello che invece NON si duplica e' la descrizione dell'app: il manifest,
il numero di versione, le icone, la classe Java. Vengono tutti da
`import costruisci`, cosi' il bundle che si carica sullo store descrive
esattamente l'app che si e' provata sul telefono. Copiare il manifest qui
dentro avrebbe creato due verita' destinate a divergere al primo ritocco.


IL NUMERO DI VERSIONE: SI LEGGE, NON SI AVANZA
==============================================
costruisci.py fa avanzare il contatore in versione.json. Questo file lo
LEGGE e basta, e per un motivo preciso: il .aab deve portare lo stesso
numero dell'APK che gli sta accanto in ../apk/, perche' quello e' l'APK
che si e' installato sul telefono e guardato funzionare. Se il bundle si
prendesse un numero suo, si caricherebbe sullo store una versione che
nessuno ha mai visto girare.

La sequenza di una pubblicazione e' quindi, in quest'ordine:
    python android/costruisci.py     -> avanza il numero, fa l'APK
    (si prova l'APK sul telefono)
    python android/bundle.py         -> stesso numero, fa il .aab

Google Play pretende che ogni caricamento abbia un versionCode piu' alto
del precedente: lo garantisce costruisci.py, che conta i minuti dal
2024-01-01 e non torna mai indietro.


LA CHIAVE DI CARICAMENTO, E COSA SUCCEDE SE SI PERDE
====================================================
Non e' la chiave di collaudo (android/chiave.jks, OU=Collaudo, password
scritta nel sorgente). Quella firma gli APK che si passano di mano; se
sparisce non succede niente, se la ruba qualcuno non succede quasi
niente.

La chiave di caricamento sta FUORI DAL REPOSITORY, in

    C:/Users/Utenteee/.chiavi-dopolavoro/

(si sposta con la variabile CHIAVI_DOPOLAVORO). Fuori, e non dentro con
una riga di .gitignore, perche' una riga di .gitignore la puo' cancellare
un distratto e un `git add -f` la scavalca comunque: una cartella che sta
in un altro ramo del disco non ci finisce nemmeno per sbaglio.

SE SI PERDE: non si rigenera. Non e' un file che si puo' rifare uguale —
una chiave nuova ha un'impronta diversa, e Google Play rifiuta ogni
caricamento firmato da una chiave che non sia quella registrata. Si torna
a caricare solo dopo aver chiesto a Google la sostituzione della chiave
di caricamento (Play Console -> Impostazioni -> Integrita' dell'app), che
e' una pratica con attesa di giorni. L'app pubblicata NON si perde e gli
utenti non se ne accorgono, perche' cio' che arriva sui telefoni lo firma
Google con la sua chiave (Play App Signing): si perde solo la
possibilita' di caricare aggiornamenti finche' la pratica non si chiude.

SE LA RUBANO: stessa pratica, con piu' fretta. Chi ha la chiave puo'
caricare al posto nostro.

Perche' la password sta in chiaro accanto alla chiave: perche' non
protegge niente che il file .jks non esponga gia'. Chi arriva alla
cartella ha entrambi. Cio' che protegge la chiave e' che quella cartella
non e' nel repository e non e' in nessun backup che vada in rete — non e'
una parola.

IL CANE DA GUARDIA. Nel repository resta soltanto l'IMPRONTA della chiave
(android/chiave-caricamento.json): un dato pubblico, che sta anche dentro
ogni file firmato. Serve a un caso solo, ma serve: se la cartella delle
chiavi viene cancellata, senza questo file lo script ne genererebbe una
nuova in silenzio e ce ne accorgeremmo mesi dopo, davanti al rifiuto di
Play. Con questo file, invece, si ferma subito e lo dice.
"""
import json, os, shutil, subprocess, sys, zipfile, glob, datetime, secrets

import costruisci as C          # manifest, numero di versione, percorsi, esegui()

QUI = C.QUI
GIOCHI = C.GIOCHI
USCITA = C.USCITA
BT = C.BT
JDK = C.JDK
ANDROID_JAR = C.ANDROID_JAR
BUNDLETOOL = QUI + '/strumenti/bundletool.jar'

# la cassaforte: fuori dal repository, di proposito
CASSAFORTE = os.environ.get(
    'CHIAVI_DOPOLAVORO',
    os.path.expanduser('~') + '/.chiavi-dopolavoro').replace('\\', '/')
CHIAVE = CASSAFORTE + '/caricamento.jks'
PAROLA = CASSAFORTE + '/caricamento.password.txt'
ALIAS = 'caricamento'
# 10950 giorni = 30 anni. Google chiede un certificato valido almeno fino
# al 22 ottobre 2033; trent'anni lo supera con margine e non obbliga
# nessuno a rifare la pratica fra sette anni.
GIORNI = 10950
IMPRONTA = QUI + '/chiave-caricamento.json'      # solo dati pubblici: questo si versiona


def dimmi(*a):
    print(*a); sys.stdout.flush()


def impronta_del_keystore(percorso, password):
    u"""SHA-256 del certificato dentro il keystore, letta con keytool."""
    r = C.esegui([JDK + '/keytool.exe', '-list', '-v', '-keystore', percorso,
                  '-storepass', password, '-alias', ALIAS])
    for riga in r.stdout.splitlines():
        riga = riga.strip()
        if riga.upper().startswith('SHA256:'):
            return riga.split(':', 1)[1].strip().replace(':', '').lower()
    return None


def scadenza_del_keystore(percorso, password):
    r = C.esegui([JDK + '/keytool.exe', '-list', '-v', '-keystore', percorso,
                  '-storepass', password, '-alias', ALIAS])
    for riga in r.stdout.splitlines():
        if 'until:' in riga:
            return riga.split('until:', 1)[1].strip()
    return '?'


def chiave_di_caricamento():
    u"""Restituisce (percorso, password). Genera la chiave se e' la prima
    volta; si ferma se e' sparita o se non e' piu' quella di prima."""
    atteso = None
    if os.path.exists(IMPRONTA):
        with open(IMPRONTA, encoding='utf-8') as f:
            atteso = json.load(f)

    if not os.path.exists(CHIAVE):
        if atteso:
            # IL CASO CHE QUESTO CONTROLLO ESISTE PER PRENDERE
            dimmi('')
            dimmi('LA CHIAVE DI CARICAMENTO NON C\'E\' PIU\'.')
            dimmi('  attesa in:  ' + CHIAVE)
            dimmi('  impronta registrata: ' + atteso.get('impronta_sha256', '?'))
            dimmi('')
            dimmi('Non la rigenero: una chiave nuova avrebbe un\'impronta diversa e')
            dimmi('Google Play rifiuterebbe il caricamento. Se hai una copia di')
            dimmi('sicurezza, rimettila li\' insieme a caricamento.password.txt.')
            dimmi('Se non ce l\'hai, va chiesta a Google la sostituzione della')
            dimmi('chiave di caricamento: Play Console > Impostazioni > Integrita\'')
            dimmi('dell\'app. L\'app pubblicata non si perde; si perde solo la')
            dimmi('possibilita\' di caricare aggiornamenti finche\' non si chiude.')
            dimmi('Per ripartire da zero (app mai pubblicata) cancella ' + IMPRONTA)
            sys.exit(1)

        os.makedirs(CASSAFORTE, exist_ok=True)
        # una password a caso e lunga: non la deve ricordare nessuno, la
        # legge questo script. 32 caratteri esadecimali = 128 bit.
        password = secrets.token_hex(16)
        with open(PAROLA, 'w', encoding='utf-8') as f:
            f.write(password + '\n')
        dimmi('genero la chiave di caricamento in ' + CHIAVE)
        C.esegui([JDK + '/keytool.exe', '-genkeypair', '-v', '-keystore', CHIAVE,
                  '-alias', ALIAS, '-keyalg', 'RSA', '-keysize', '2048',
                  '-sigalg', 'SHA256withRSA', '-validity', str(GIORNI),
                  '-storepass', password, '-keypass', password,
                  '-dname', 'CN=Dopolavoro FC, OU=Caricamento Play, '
                            'O=Dopolavoro, L=Italia, C=IT'])
        with open(IMPRONTA, 'w', encoding='utf-8') as f:
            json.dump({
                'a_cosa_serve': 'firmare i .aab caricati su Google Play',
                'impronta_sha256': impronta_del_keystore(CHIAVE, password),
                'scade': scadenza_del_keystore(CHIAVE, password),
                'alias': ALIAS,
                'dove': CHIAVE,
                'generata': datetime.datetime.now().strftime('%Y-%m-%d'),
                'nota': 'qui c\'e\' solo l\'impronta, che e\' pubblica. La chiave '
                        'sta fuori dal repository. Se sparisce, bundle.py si '
                        'ferma invece di generarne una nuova in silenzio.',
            }, f, indent=1, ensure_ascii=False)
        dimmi('impronta registrata in ' + IMPRONTA)
        return CHIAVE, password

    with open(PAROLA, encoding='utf-8') as f:
        password = f.read().strip()

    if atteso:
        adesso = impronta_del_keystore(CHIAVE, password)
        if adesso != atteso.get('impronta_sha256'):
            dimmi('')
            dimmi('LA CHIAVE DI CARICAMENTO NON E\' QUELLA DI PRIMA.')
            dimmi('  registrata: ' + str(atteso.get('impronta_sha256')))
            dimmi('  trovata:    ' + str(adesso))
            dimmi('Google Play rifiuterebbe un bundle firmato con questa.')
            sys.exit(1)
    return CHIAVE, password


# =====================================================================
# IL BUNDLE
#
# Un .aab non e' un APK: e' lo stesso materiale disposto diversamente e
# lasciato in forma "sorgente", perche' a tagliarlo negli APK veri ci
# pensa Google al momento del download, uno su misura per ogni telefono.
# Due differenze fanno tutto il lavoro:
#
#   1. il manifest e le risorse vanno in PROTOBUF, non in binario aapt.
#      Da qui `aapt2 link --proto-format`, che e' la sola riga di questo
#      file che costruisci.py non aveva gia'.
#   2. i file vanno rinominati nelle cartelle che bundletool pretende:
#      manifest/, dex/, res/, assets/, e resources.pb in cima. Un file
#      fuori da quelle cartelle e bundletool rifiuta lo zip intero.
def costruisci_bundle(app):
    lav = os.path.join(QUI, 'lavoro_bundle_' + app['nome'].lower())
    shutil.rmtree(lav, ignore_errors=True)
    os.makedirs(lav)

    # ---- il numero di versione: LETTO da versione.json, mai avanzato ----
    try:
        with open(C.STORICO, encoding='utf-8') as f:
            v = json.load(f)
        codice, nome = int(v['codice']), v['nome']
    except Exception:
        dimmi('versione.json non c\'e\': lo creo (ma di norma lo fa costruisci.py)')
        codice, nome = C.versione()

    # ---- manifest: LO STESSO di costruisci.py, non una copia ----
    campi = dict(app, codice=codice, nome=nome)
    manifest = os.path.join(lav, 'AndroidManifest.xml')
    with open(manifest, 'w', encoding='utf-8') as f:
        f.write(C.MANIFEST.format(**campi))

    # ---- risorse: solo le icone, a cinque densita' ----
    res = os.path.join(lav, 'res')
    for d, px in [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96),
                  ('xxhdpi', 144), ('xxxhdpi', 192)]:
        cart = os.path.join(res, 'mipmap-' + d)
        os.makedirs(cart)
        shutil.copy(os.path.join(QUI, 'icone', 'icona-%s-%d.png' % (app['icona'], px)),
                    os.path.join(cart, 'icona.png'))
    compilate = os.path.join(lav, 'res.zip')
    C.esegui([BT + '/aapt2.exe', 'compile', '--dir', res, '-o', compilate])

    # ---- codice: identico alla catena dell'APK ----
    classi = os.path.join(lav, 'classi')
    os.makedirs(classi)
    C.esegui([JDK + '/javac.exe', '-nowarn', '-source', '8', '-target', '8',
              '-bootclasspath', ANDROID_JAR, '-classpath', ANDROID_JAR,
              '-d', classi, os.path.join(QUI, 'Gioco.java')])
    C.esegui([BT + '/d8.bat', '--lib', ANDROID_JAR, '--min-api', '24',
              '--output', lav] + glob.glob(os.path.join(classi, '**', '*.class'),
                                           recursive=True))

    # ---- LA RIGA CHIAVE: link in protobuf invece che in binario ----
    proto = os.path.join(lav, 'proto.apk')
    C.esegui([BT + '/aapt2.exe', 'link', '--proto-format', '-o', proto,
              '-I', ANDROID_JAR, '--manifest', manifest,
              '--min-sdk-version', '24', '--target-sdk-version', '34',
              '--no-version-vectors', compilate])

    # ---- si ridispone tutto nella pianta che bundletool pretende ----
    modulo = os.path.join(lav, 'base.zip')
    with zipfile.ZipFile(proto) as sorgente, \
         zipfile.ZipFile(modulo, 'w', zipfile.ZIP_DEFLATED) as z:
        for voce in sorgente.namelist():
            dati = sorgente.read(voce)
            if voce == 'AndroidManifest.xml':
                z.writestr('manifest/AndroidManifest.xml', dati)
            elif voce == 'resources.pb' or voce.startswith('res/'):
                z.writestr(voce, dati)          # gia' al posto giusto
            else:
                # nessun altro file dovrebbe uscire da aapt2 con queste
                # risorse; se ne comparisse uno, meglio saperlo subito che
                # vederlo sparire in silenzio dal pacchetto.
                raise SystemExit('voce inattesa nel link proto: ' + voce)
        z.write(os.path.join(lav, 'classes.dex'), 'dex/classes.dex')
        z.write(os.path.join(GIOCHI, app['file']), 'assets/' + app['file'])

    aab = os.path.join(USCITA, app['nome'] + '.aab')
    if os.path.exists(aab):
        os.remove(aab)
    C.esegui(['java', '-jar', BUNDLETOOL, 'build-bundle',
              '--modules=' + modulo, '--output=' + aab])

    # ---- firma ----
    # jarsigner e non apksigner: un .aab si firma come un normale jar.
    # apksigner parla gli schemi v2/v3, che sono una firma sul formato APK
    # e su un .aab non hanno senso — Play guarda proprio la firma jar.
    chiave, password = chiave_di_caricamento()
    C.esegui([JDK + '/jarsigner.exe', '-keystore', chiave,
              '-storepass', password, '-keypass', password,
              '-sigalg', 'SHA256withRSA', '-digestalg', 'SHA-256',
              aab, ALIAS])
    # si rilegge la firma dal file finito invece di fidarsi del comando
    C.esegui([JDK + '/jarsigner.exe', '-verify', '-keystore', chiave, aab])

    # ---- bundletool dice la sua sul risultato ----
    C.esegui(['java', '-jar', BUNDLETOOL, 'validate', '--bundle=' + aab])

    return aab, codice, nome, lav


if __name__ == '__main__':
    quale = (sys.argv[1] if len(sys.argv) > 1 else 'CALCETTO').upper()
    app = next((a for a in C.APP if a['nome'] == quale), None)
    if app is None:
        raise SystemExit('non conosco il gioco ' + quale)
    if not os.path.exists(BUNDLETOOL):
        raise SystemExit(
            'manca ' + BUNDLETOOL + '\n'
            'Si riscarica da https://github.com/google/bundletool/releases\n'
            '(Apache 2.0, 31 MB). Non sta nel repository di proposito.')
    os.makedirs(USCITA, exist_ok=True)

    aab, codice, nome, lav = costruisci_bundle(app)
    dimmi('')
    dimmi('%s   %.0f kB   versionCode %d   "%s"'
          % (os.path.basename(aab), os.path.getsize(aab) / 1024.0, codice, nome))

    # IL CONTROLLO CHE VALE PIU' DI TUTTI GLI ALTRI: il bundle che si
    # carica deve portare lo stesso numero dell'APK che si e' provato. Se
    # no, si sta pubblicando qualcosa che nessuno ha visto girare.
    gemello = os.path.join(USCITA, app['nome'] + '.apk')
    if os.path.exists(gemello):
        b = subprocess.run([BT + '/aapt2.exe', 'dump', 'badging', gemello],
                           capture_output=True, text=True)
        import re
        m = re.search(r"versionCode='(\d+)'", b.stdout or '')
        if m and int(m.group(1)) == codice:
            dimmi('coincide con %s.apk (stesso versionCode): il bundle descrive '
                  'l\'app provata sul telefono.' % app['nome'])
        else:
            dimmi('ATTENZIONE: %s.apk porta versionCode %s, il bundle %d. '
                  'Rilancia costruisci.py e poi bundle.py, in quest\'ordine.'
                  % (app['nome'], m.group(1) if m else '?', codice))
    dimmi('lavorazione in: ' + lav)
