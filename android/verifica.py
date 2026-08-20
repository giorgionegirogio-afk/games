# -*- coding: utf-8 -*-
"""Controlla i due APK finiti, senza fidarsi della build.

ESCE CON UN CODICE, e questo e' il punto della voce A2.4: fino a ieri
questo file stampava «3 falliti» e usciva 0, cioe' poteva fallire per
settimane senza che nessuno se ne accorgesse — nessuna catena, nessuno
script, nessun agente guarda le righe stampate; tutti guardano il codice
d'uscita. I codici sono quelli in uso in questa casa:

    0  verde: tutti i controlli passati
    1  rosso: l'APK ha qualcosa che non va
    2  il banco e' esploso: l'APK non c'e', o aapt2/apksigner non
       rispondono. NON e' colpa dell'APK e non si scrive come tale.

Si lancia da dove si vuole:   python android/verifica.py
Per guardare un deposito diverso da ../apk (serve al controllo negativo,
e a chi vuole confrontare l'APK di ieri con quello di oggi):
    set APK_DIR=C:/qualche/altra/cartella
"""
import hashlib, json, os, re, subprocess, sys, zipfile

SDK = os.environ.get('ANDROID_SDK', r'C:/Users/Utenteee/Android/Sdk').replace('\\', '/')
BT = SDK + '/build-tools/34.0.0'
QUI = os.path.dirname(os.path.abspath(__file__))
GIOCHI = os.path.dirname(QUI)
# il deposito si puo' spostare da fuori: senza questo, l'unico modo di
# provare che il cancello sa uscire rosso sarebbe rompere il deposito vero
APK = os.environ.get('APK_DIR', GIOCHI + '/apk').replace('\\', '/')

APP = [('CIRCOLO', 'CIRCOLO-il-gioco.html', 'it.dopolavoro.circolo'),
       ('CALCETTO', 'CALCETTO-il-gioco.html', 'it.dopolavoro.calcetto')]

esiti = []      # solo i controlli che hanno potuto misurare
muti = []       # quelli che non hanno potuto: si contano a parte, non accusano


def dice(ok, testo):
    """ok=True verde, ok=False rosso, ok=None «non ho potuto misurare»."""
    if ok is None:
        muti.append(testo); print('  --   ' + testo + '   (non misurato)')
    else:
        esiti.append(ok); print(('  OK   ' if ok else '  NO   ') + testo)


def esplode(motivo):
    """il banco, non l'APK. Esce 2 e lo dice in chiaro."""
    # trattino semplice e non lineetta lunga: la console di Windows non e'
    # in UTF-8 e trasformerebbe il carattere in un punto interrogativo
    print('\nBANCO NON VALIDO - ' + motivo)
    print('Non e\' un giudizio sull\'APK: non ho potuto guardarlo.')
    sys.exit(2)


def sha(b):
    return hashlib.sha256(b).hexdigest()[:16]


# il numero di versione atteso, se il costruttore l'ha lasciato scritto.
# Non e' obbligatorio che ci sia (un APK scaricato si verifica lo stesso):
# se manca, il controllo relativo esce «non misurato», non rosso.
atteso = None
try:
    with open(QUI + '/versione.json', encoding='utf-8') as f:
        atteso = json.load(f)
except Exception:
    atteso = None

for nome, html, pkg in APP:
    percorso = '%s/%s.apk' % (APK, nome)
    if not os.path.exists(percorso):
        esplode("manca l'APK  " + percorso)
    print('\n=== %s  (%.0f kB) ===' % (nome, os.path.getsize(percorso) / 1024.0))

    b = subprocess.run([BT + '/aapt2.exe', 'dump', 'badging', percorso],
                       capture_output=True, text=True)
    if b.returncode != 0 or not b.stdout.strip():
        esplode('aapt2 non ha saputo leggere ' + percorso + ': ' + (b.stderr or '')[:200])
    badging = b.stdout
    dice("package: name='%s'" % pkg in badging, 'il pacchetto si chiama ' + pkg)
    permessi = [r for r in badging.splitlines() if r.startswith('uses-permission')]
    dice(not permessi, 'nessun permesso richiesto  %s' % (permessi or ''))
    dice("sdkVersion:'24'" in badging, 'gira da Android 7 in su')
    dice('launchable-activity' in badging, "c'e' l'icona nel cassetto delle app")

    # ---- il numero di versione (voce A2.1) ----
    # versionCode=1 e' il difetto che si sta sorvegliando: con quello
    # nessun secondo APK si installa mai sopra il primo.
    m = re.search(r"versionCode='(\d+)'", badging)
    codice = int(m.group(1)) if m else -1
    dice(codice > 1, 'il codice di versione non e" piu" 1 fisso: %s' % (codice if m else 'assente'))
    if atteso and 'codice' in atteso:
        dice(codice == int(atteso['codice']),
             'il codice viene dal contatore della build (atteso %d, trovato %d)'
             % (int(atteso['codice']), codice))
    else:
        dice(None, 'il codice viene dal contatore della build (android/versione.json non c\'e\')')
    vn = re.search(r"versionName='([^']*)'", badging)
    nomever = vn.group(1) if vn else ''
    dice(bool(nomever) and nomever != '1.0',
         'il nome di versione e" leggibile e non e" piu" "1.0": "%s"' % nomever)
    # un pacchetto pubblicato non deve essere debuggabile: la sola presenza
    # di questo attributo apre la porta a run-as e al debugger di sistema
    dice('application-debuggable' not in badging, 'il pacchetto non e" debuggabile')

    with zipfile.ZipFile(percorso) as z:
        nomi = z.namelist()
        dice('classes.dex' in nomi, 'il codice compilato e" dentro')
        dice('assets/' + html in nomi, 'il gioco e" dentro come asset')

        dentro = z.read('assets/' + html)
        sorgente = '%s/%s' % (GIOCHI, html)
        if not os.path.exists(sorgente):
            dice(None, 'il gioco nell\'APK e" identico al sorgente (il sorgente non c\'e\')')
        else:
            fuori = open(sorgente, 'rb').read()
            dice(dentro == fuori,
                 'il gioco nell\'APK e" identico al sorgente (apk %s, sorgente %s)'
                 % (sha(dentro), sha(fuori)))

        icone = [n for n in nomi if n.startswith('res/') and 'icona' in n]
        dice(len(icone) >= 5, 'icone a %d densita' % len(icone))

        dex = z.read('classes.dex')
        dice(dex[:8] == b'dex\n035\x00' or dex[:4] == b'dex\n', 'il dex e" valido')
        for classe in (b'it/dopolavoro/gioco/Gioco', b'Cronaca', b'Risposta'):
            dice(classe in dex, 'il dex contiene ' + classe.decode())

        # ---- i due cancelli del guscio, visti da dentro il dex (A2.2, A2.3) ----
        # Sono controlli STRUTTURALI: dicono che il codice del cancello e'
        # nel pacchetto, non che si comporti bene — quello si misura solo
        # sul telefono. Se qualcuno rimettesse il debug incondizionato o
        # togliesse la sonda dello schermo, queste stringhe sparirebbero.
        dice(b'calcetto_collaudo' in dex and b'adb_enabled' in dex,
             'la console di debug e" dietro a un cancello, non sempre aperta')
        dice(b'window.__test' in dex,
             'il guscio chiede alla pagina se si sta giocando (schermo acceso solo in partita)')

        testo = dentro.decode('utf-8', 'ignore')
        # niente rete: nessun src/href remoto, nessuna chiamata in uscita
        remoti = re.findall(r'(?:src|href)\s*=\s*["\']https?://[^"\']+', testo)
        dice(not remoti, 'nessuna risorsa remota  %s' % (remoti[:2] or ''))
        chiamate = re.findall(r'\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(', testo)
        dice(not chiamate, 'nessuna chiamata di rete  %s' % (chiamate[:3] or ''))
        dice('window.__indietro' in testo, "il gioco sa gestire il tasto Indietro")

    f = subprocess.run([BT + '/apksigner.bat', 'verify', '--verbose', percorso],
                       capture_output=True, text=True)
    if f.returncode not in (0, 1) or not (f.stdout or f.stderr).strip():
        esplode('apksigner non ha risposto su ' + percorso)
    dice('Verified using v2 scheme (APK Signature Scheme v2): true' in f.stdout,
         'firmato con lo schema v2')

falliti = len(esiti) - sum(esiti)
print('\n%d controlli, %d passati, %d falliti, %d non misurati' %
      (len(esiti), sum(esiti), falliti, len(muti)))
# LA RIGA CHE MANCAVA: senza questa, un rosso qui sopra non lo vede nessuno.
sys.exit(1 if falliti else 0)
