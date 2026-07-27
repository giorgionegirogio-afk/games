# Provare i due giochi su Android

I giochi funzionano **completamente offline**: non c'è un solo file da scaricare
da internet mentre giochi. Font, carte, suoni, tutto è dentro il file HTML.
Il multigiocatore online non c'è ancora — si gioca contro il telefono, in due
sullo stesso apparecchio, oppure a distanza con il **link di sfida**.

Ci sono tre modi per averli sul telefono. Il primo — l'APK — è quello che serve
per il collaudo vero.

---

## 1. L'APK — due app vere, installate sul telefono

Nella cartella `apk/` ci sono già i due file pronti:

| File | Dimensione |
|---|---|
| `apk/CIRCOLO.apk` | 97 kB |
| `apk/CALCETTO.apk` | 117 kB |

Sì, sono davvero così piccoli: dentro non c'è nessun motore di gioco, nessuna
libreria e nessuna immagine — solo il gioco, che è un file di testo, e un
guscio di trenta righe che gli apre una finestra.

### Come si installano

1. Copia i due `.apk` sul telefono (cavo USB, Telegram, Drive, email: uno vale
   l'altro).
2. Sul telefono apri **File**, tocca `CIRCOLO.apk`.
3. Android dirà che *«per motivi di sicurezza non puoi installare app da questa
   origine»*: tocca **Impostazioni**, attiva **Consenti da questa origine** per
   l'app File, torna indietro e tocca **Installa**.
   È la procedura normale per un'app che non arriva dal Play Store; la si fa una
   volta sola.
4. Ripeti con `CALCETTO.apk`.

Ti ritrovi **due icone nel cassetto delle app**: CIRCOLO e CALCETTO.

### Cosa chiedono al telefono

**Niente.** Nessun permesso: né internet, né posizione, né contatti, né file, né
fotocamera. Puoi controllarlo tu: *Impostazioni → App → CIRCOLO → Autorizzazioni*
mostra la lista vuota. Un'app senza il permesso `INTERNET` **non può** mandare
niente da nessuna parte, nemmeno volendo — non è una promessa, è il sistema che
lo impedisce.

### Il certificato

Gli APK sono firmati con una chiave di collaudo creata per questo prototipo. Va
benissimo per provare, **non** per il Play Store: quando sarà il momento servirà
una chiave vera, custodita, e la firma non si potrà più cambiare. Se ricostruisci
gli APK con la stessa chiave, l'aggiornamento si installa sopra il vecchio senza
perdere i dati; se la chiave cambia, Android chiede di disinstallare prima.

Il file della chiave, `android/chiave.jks`, **resta sul tuo computer e non
finisce nel repo**: chi la possiede può firmare un pacchetto che Android accetta
come aggiornamento di queste app. È escluso dal `.gitignore`. Chi clona il
progetto non ne trova una e `costruisci.py` gliene genera una propria al primo
lancio — gli APK che ne escono funzionano, ma non si installano sopra i tuoi.

### Ricostruirli dopo una modifica

Serve l'SDK Android (build-tools 34, platform 34) e un JDK. Poi:

```bash
cd android
python costruisci.py     # rigenera i due APK in ../apk/
python verifica.py       # 32 controlli sui file finiti
```

Non c'è gradle e non c'è niente da scaricare al volo: la catena è
`aapt2 → javac → d8 → zipalign → apksigner`, tutta locale. Se l'SDK sta altrove:

```bash
set ANDROID_SDK=D:/Android/Sdk
set JDK_BIN=C:/Program Files/Java/jdk-21/bin
```

---

## 2. Senza installare niente — il file HTML e basta

Il modo più veloce per far provare un gioco a qualcuno in due minuti.

1. Mandagli `CIRCOLO-il-gioco.html` (o `CALCETTO-il-gioco.html`) su WhatsApp.
2. Lui lo apre e sceglie **Apri con → Chrome**.

Funziona tutto: partite, salvataggio, tornei, sfida via link. Anche in aereo.
Restano fuori l'icona nel cassetto e lo schermo intero — c'è la barra del
browser — e Chrome ogni tanto "dimentica" il percorso del file.

---

## 3. Come app web — GitHub Pages

Utile se vuoi mandare un **link** invece di un file, e lasciare che chi lo apre
decida se installarla. Serve un indirizzo `https`, che GitHub Pages dà gratis.

### ⚠️ Prima, una cosa da decidere

Questa cartella contiene anche `STUDIO-02` e `STUDIO 03`, cioè **il piano con i
costi, le stime di ricavo e la strategia**. Su un repo **pubblico** diventano
leggibili da chiunque abbia il link.

- **Pubblica solo i giochi** (consigliato): il `.gitignore` già pronto esclude i
  due studi, e il lanciatore se ne accorge da solo e non li mostra.
- **Repo privato**: Pages su repo privati richiede un piano a pagamento.
- **Pubblica tutto**, se non ti importa.

### I comandi

```bash
git init
git add .
git commit -m "Prototipi giocabili: CALCETTO e CIRCOLO, offline"
gh repo create games --public --source=. --push
gh api -X POST repos/:owner/games/pages -f source[branch]=main -f source[path]=/
```

Dopo un paio di minuti l'indirizzo è `https://TUONOME.github.io/games/`.
Sul telefono si apre con Chrome e si tocca **INSTALLA SUL TELEFONO**.

### Quando cambi qualcosa

Basta `git push`. Le pagine usano *servi subito dalla cache, ma controlla in
sottofondo*: l'app si apre istantaneamente e anche senza rete, e trova la
versione nuova **alla riapertura successiva**. Quindi dopo un aggiornamento
serve chiudere e riaprire l'app una volta.

Attenzione, se stai provando modifiche in locale: il service worker risponde
**ignorando la parte dopo il `?`**, quindi il trucco di aggiungere `?v=2`
all'indirizzo non serve a niente — continua a servire la copia vecchia. Per
vedere davvero la modifica, in DevTools: *Application → Service Workers →
Unregister*, e *Storage → Clear site data*.

Per forzare tutti a ripartire da zero — per esempio dopo aver cambiato le icone
— cambia `const VERSIONE = 'circolo-calcetto-v2'` in `sw.js`.

---

## Cosa c'è nella cartella

| File | A cosa serve |
|---|---|
| `apk/*.apk` | **Le due app pronte da installare** |
| `android/` | Come sono fatte: il guscio Java e lo script che le costruisce |
| `CALCETTO-il-gioco.html` | Il gioco, per intero, in un file solo |
| `CIRCOLO-il-gioco.html` | Idem |
| `index.html` | Il lanciatore per la versione web |
| `sw.js` | Il service worker: rende la versione web disponibile offline |
| `app/*.webmanifest`, `app/icona-*.png` | Le schede d'app e le icone per il web |
| `.gitignore` | Tiene fuori i due studi dalla pubblicazione |

I due giochi restano **autosufficienti**: il file HTML da solo funziona. Tutto
il resto serve solo a impacchettarlo.

---

## Cosa aspettarsi al collaudo

- **CALCETTO si mette in orizzontale da solo**, CIRCOLO resta verticale.
- **Lo schermo non si spegne** mentre giochi: durante la partita il gioco tiene
  il display acceso e lo libera appena torni al menu.
- **Il tasto Indietro non fa danni.** In CIRCOLO chiude il pannello aperto, e dal
  tavolo mette la partita da parte: la ritrovi con `RIPRENDI`. In CALCETTO mette
  in pausa e la ripreme toglie la pausa — una partita non si può riprendere a
  metà, quindi il tasto non può buttarla via: per uscire c'è `ESCI` nel pannello
  di pausa. Al menu, per chiudere l'app servono **due pressioni**.
- **La partita non si perde.** Se arriva una telefonata, al ritorno trovi
  `RIPRENDI` nel menu di CIRCOLO. Unico caso in cui qualcosa può andare perso:
  se il telefono uccide l'app di colpo mentre è in primo piano, gli ultimi
  secondi possono non essere stati ancora scritti su disco. Passando dalla home
  o dal tasto recenti, invece, è tutto salvato.
- **Il link di sfida si manda su WhatsApp.** A fine partita, in CIRCOLO:
  *«Sfida un amico con questa mano»*. Chi lo apre riceve le tue identiche carte
  e lo stesso avversario.
- **Tutto quello che salvi resta sul telefono.** Nessun account, nessun server,
  niente che esca dal dispositivo.

Per riportare un gioco a zero: Impostazioni del gioco → *Azzera statistiche e
trofei* (CIRCOLO) o *Azzera tutti i dati* (CALCETTO).

### Se qualcosa non va

Gli errori del gioco finiscono nel registro di sistema. Con il telefono
collegato al computer e il debug USB attivo:

```bash
adb logcat -s GiocoJS
```

E con `chrome://inspect` dal computer si può ispezionare la pagina dentro l'app
come una qualsiasi scheda del browser.
