# Pubblicare CALCETTO su Google Play — che cosa serve, e che cosa manca

Scritto il 29 agosto 2026, mentre il committente compra l'account
sviluppatore. Serve a non scoprire un ostacolo il giorno in cui l'account
è pronto.

---

## L'ostacolo che va saputo adesso: serve un BUNDLE, non un APK

Google Play **non accetta più un APK** per un'applicazione nuova: dal
2021 vuole un **Android App Bundle** (`.aab`). Il nostro APK da 853 kB,
che funziona benissimo sul telefono, non si può caricare.

**La buona notizia: si fa anche senza gradle**, e la catena di casa ha
già quasi tutto. Un bundle è uno zip con una struttura precisa, e i pezzi
li sappiamo già produrre:

| pezzo del bundle | come lo facciamo oggi | manca |
|---|---|---|
| `base/manifest/AndroidManifest.xml` in **protobuf** | `aapt2 link --proto-format` — **verificato: l'opzione c'è** | niente |
| `base/dex/classes.dex` | `d8`, già in catena | niente |
| `base/res/` compilate | `aapt2 compile`, già in catena | niente |
| `base/assets/` (il gioco) | zip, già in catena | niente |
| `BundleConfig.pb` | — | va scritto |
| assemblare e firmare | — | **`bundletool.jar`** |

**L'unica cosa che manca è `bundletool.jar`**: è di Google, open source
(Apache 2.0), circa 60 MB, si scarica da
`https://github.com/google/bundletool/releases`.

Va chiesto al committente prima di scaricarlo.

> **SUPERATO il 29 agosto 2026.** `bundletool.jar` è stato scaricato
> (1.18.3) e la catena il bundle lo fa. Le due righe qui sopra restano
> perché erano vere quando sono state scritte; quello che si sa adesso,
> coi numeri misurati, sta in fondo: **«Il bundle: come si costruisce,
> quanto pesa, cosa è stato provato»**.

---

## Le due chiavi, e non sono la stessa cosa

Oggi l'APK è firmato con una chiave **di collaudo**, generata dalla
catena stessa:

    CN=Dopolavoro FC, OU=Collaudo, O=Dopolavoro, L=Italia, C=IT
    SHA-256  593ca236c6cea41d9f73001a512179333ab905bf78cd9466f8e3954fac17100b

Per pubblicare servono due chiavi distinte, e la differenza conta:

1. **La chiave di caricamento** (upload key) — la nostra. Firma il bundle
   che carichiamo. Se si perde, Google la può sostituire.
2. **La chiave di firma dell'app** — quella con cui Google firma davvero
   ciò che arriva sui telefoni (**Play App Signing**, obbligatorio per i
   bundle). Google la tiene lui.

**Conseguenza pratica, e va detta:** l'APK che oggi è installato sul
telefono del committente è firmato con la chiave di collaudo. Quando
arriverà la versione dallo store, avrà una firma diversa, e Android
**rifiuterà l'aggiornamento**: bisognerà disinstallare quella di prova.
Non è un difetto, è come funziona — ma va saputo prima, perché
disinstallando si perde il salvataggio.

---

## Che cosa il committente dovrà preparare, e cosa posso preparare io

### Posso farlo io (e lo faccio)
- **Informativa sulla privacy** — obbligatoria, serve un indirizzo web
  pubblico. La bozza è più sotto: è corta perché il gioco raccoglie
  pochissimo, ed è vero.
- **Scheda dati** (Data Safety) — la dichiarazione di cosa raccogliamo.
  Le risposte le abbiamo già tutte, e sono quasi tutte «no».
- **Schermate** — ne ho già di vere, fatte sul telefono del committente.
  Play ne vuole da 2 a 8, minimo 320 px di lato corto.
- **Descrizione** breve (80 caratteri) e lunga (4000).
- **Icona** 512×512 e immagine di copertina 1024×500.

### Deve farlo lui
- comprare l'account (25 $ una volta) — **in corso**
- accettare l'accordo per gli sviluppatori
- verificare l'identità (documento; per un conto personale serve anche
  un indirizzo verificato)
- **la novità del 2023 che sorprende tutti**: un account personale nuovo
  deve fare una **prova chiusa con almeno 12 collaudatori per 14 giorni
  consecutivi** prima di poter chiedere la pubblicazione aperta. Dodici
  persone vere, con dodici indirizzi Google, che tengono installato il
  gioco per due settimane.
  *Questo va saputo adesso perché sposta la data di uscita di almeno
  due settimane, qualunque cosa faccia io.*
- la classificazione dei contenuti (questionario IARC, si compila in
  dieci minuti)
- i dati fiscali, se si vende qualcosa

---

## L'informativa sulla privacy — bozza

> **CALCETTO — Informativa sulla privacy**
> Ultimo aggiornamento: 29 agosto 2026
>
> **In breve.** CALCETTO si gioca senza registrarsi e senza dare un solo
> dato personale. Non chiede il nome, l'email, il telefono, la posizione,
> la rubrica, le foto. Non contiene pubblicità e non contiene strumenti
> di misurazione di terze parti.
>
> **Cosa resta sul telefono e non esce mai.** La squadra, i giocatori, le
> partite, le monete guadagnate, le impostazioni. Stanno nella memoria
> dell'applicazione. Disinstallando il gioco spariscono, e non ne
> esiste nessuna copia altrove.
>
> **Cosa esce dal telefono, e solo se si apre la modalità in rete.**
> Aprendo SFIDA il gioco chiede al nostro server un identificatore
> casuale — un numero, non un nome — e da quel momento può inviare:
> il nome che avete scelto per la squadra, i colori della maglia, i
> numeri dei vostri giocatori, e le partite giocate in rete (registrate
> come sequenza di comandi, per poterle rivedere). Nient'altro.
> Il server conosce quell'identificatore casuale e i due caratteri del
> Paese, che servono alla classifica per nazione. Non conosce chi siete.
>
> **Se non si apre mai SFIDA**, il gioco non contatta nessuno: funziona
> per intero senza connessione.
>
> **Autorizzazioni Android richieste: nessuna.**
>
> **I dati non vengono venduti, ceduti né usati per profilazione.**
>
> **Cancellazione.** Disinstallando il gioco si perde l'identità e non è
> recuperabile. Per far cancellare anche i dati sul server scrivete a
> [indirizzo da inserire] indicando il codice di trasferimento che
> trovate in SFIDA → CAMBIO TELEFONO.
>
> **Bambini.** Il gioco non è rivolto specificamente ai minori di 13
> anni e non raccoglie consapevolmente dati da loro. Non essendoci
> raccolta di dati personali, non c'è nulla da cancellare.
>
> **Materiale di terzi.** Il gioco incorpora tre caratteri tipografici
> con licenza SIL Open Font License 1.1 (Archivo Black, Barlow
> Condensed). L'elenco completo è nel file NOTICE distribuito col
> progetto.

Serve un indirizzo web pubblico. La pagina si può mettere su Vercel
accanto al server, o come pagina di GitHub: costa zero e ci vogliono
dieci minuti.

---

## La scheda dati (Data Safety) — le risposte

| domanda | risposta |
|---|---|
| L'app raccoglie o condivide dati? | **Sì**, ma solo nella modalità in rete |
| Posizione | no |
| Informazioni personali (nome, email…) | **no** |
| Informazioni finanziarie | no (i pagamenti li gestisce Google) |
| Salute, messaggi, foto, file, rubrica, calendario | no |
| Identificativi dell'app | **sì** — un identificatore casuale generato da noi, non pubblicitario |
| Attività nell'app | **sì** — punteggi e partite, solo se si gioca in rete |
| I dati sono cifrati in transito | **sì** (HTTPS) |
| Si possono far cancellare | **sì**, su richiesta |
| L'app ha pubblicità | **no** |

---

## Il target SDK

Oggi il manifest dichiara `targetSdkVersion 34`, e sul disco c'è solo
`android-34`. Google Play alza il minimo ogni anno, di solito ad agosto:
**prima di caricare va verificato quale sia il minimo richiesto in
quella data**, e se serve va scaricata la piattaforma nuova.
Non lo do per scontato qui perché è una data che cambia.

> **VERIFICATO E RISOLTO il 31 agosto 2026 — e il sospetto era fondato
> al giorno.** La pagina ufficiale di Google dice: dal 31 agosto 2026
> (cioè da OGGI) le app nuove devono dichiarare **Android 16, API 36**;
> fino a ieri bastava la 35. Il 34 sarebbe stato rifiutato.
> La cura è stata la minima: `costruisci.py` adesso dichiara
> `targetSdkVersion 36` nel manifest e nel `link`, e si continua a
> compilare contro `android-34` — `Gioco.java` non usa nessuna API
> nuova, e la dichiarazione nel manifest è ciò che Play legge. Nessun
> download nuovo.
> **Ciò che 36 comporta e che NON è provato:** da targetSdk 35+ Android
> 15/16 impone il bordo-a-bordo. Il guscio è già fatto così — tema
> Fullscreen, immersivo appiccicoso, disegno sotto la tacca, e il gioco
> usa `env(safe-area-inset-*)` — ma il telefono di casa è un Android 11,
> dove il target non cambia niente. Lo diranno i 12 collaudatori della
> prova chiusa: qualcuno avrà un Android 15 o 16.
> Esiste una proroga richiedibile fino al 1° novembre 2026, dalla pagina
> «Stato delle norme» della Console, se mai servisse.

---

## L'ordine giusto delle cose

1. il committente compra l'account e verifica l'identità *(in corso)*
2. **subito dopo, e non dopo**: aprire la prova chiusa e trovare i dodici
   collaudatori — sono quattordici giorni che scorrono in parallelo a
   tutto il resto del lavoro
3. ~~scaricare `bundletool.jar` e insegnare alla catena a fare un
   bundle~~ **fatto il 29 agosto 2026**
4. ~~generare la chiave di caricamento *vera* (non quella di collaudo) e
   metterla al sicuro~~ **fatta il 29 agosto 2026**
5. pubblicare la privacy policy
6. compilare scheda dati, classificazione, descrizione, immagini
7. caricare il primo bundle nella prova chiusa
8. quattordici giorni dopo, chiedere la pubblicazione aperta

Il punto 2 è quello che costa più tempo di calendario e meno lavoro: va
fatto per primo.

---

# Il bundle: come si costruisce, quanto pesa, cosa è stato provato

Scritto il 29 agosto 2026. Ogni numero di questa sezione è stato misurato
quel giorno, sulla macchina di casa e sul telefono del committente
(OnePlus 6, `01c8eb5a`, Android 11 / API 30, 1080×2280 a densità 450,
arm64-v8a). Dove non ho potuto misurare, l'ultimo capitolo lo dice.

## Come si costruisce

    python android/costruisci.py     # avanza il numero di versione, fa gli APK
    python android/bundle.py         # stesso numero, fa apk/CALCETTO.aab

**In quest'ordine, e non è un dettaglio.** `costruisci.py` fa avanzare il
contatore in `android/versione.json`; `bundle.py` quel numero lo *legge* e
non lo tocca. Così il `.aab` che si carica sullo store porta lo stesso
`versionCode` dell'APK che si è installato sul telefono e guardato
funzionare. Se `bundle.py` si prendesse un numero suo, si pubblicherebbe
una versione che nessuno ha mai visto girare. Lo strumento controlla da
solo che i due numeri coincidano e lo scrive a schermo.

Per l'altro gioco: `python android/bundle.py CIRCOLO`.

### Perché un file a parte e non due righe dentro `costruisci.py`

- l'APK si costruisce venti volte al giorno e deve partire senza chiedere
  niente a nessuno; il bundle si fa quando si pubblica;
- il bundle ha bisogno di `bundletool.jar`, **31 MB che non stanno nel
  repository**. Se `costruisci.py` ne dipendesse, chi clona il progetto
  non riuscirebbe più a fare l'APK — avrebbe perso la cosa che gli serve
  per averne una che non gli serve;
- il bundle si firma con la chiave di caricamento vera, che vive fuori dal
  repository: la build quotidiana non deve nemmeno sfiorarla.

Quello che invece **non** si duplica è la descrizione dell'app.
`bundle.py` fa `import costruisci` e ne prende manifest, icone, classe
Java e numero di versione. Copiare il manifest in due file avrebbe creato
due verità destinate a divergere al primo ritocco.

L'unica modifica a `costruisci.py` è un cancello `if __name__ ==
'__main__':` in fondo, più lo spostamento di `CODICE, NOME = versione()`
dentro quel cancello. Serviva perché `versione()` **scrive**
`versione.json`, e `verifica.py` confronta quel file col numero trovato
dentro gli APK: senza lo spostamento, il solo `import costruisci` avrebbe
fatto uscire rosso `verifica.py` su APK che non hanno nessun difetto.
Lanciato come sempre, `costruisci.py` si comporta esattamente come prima —
verificato ricostruendo entrambi gli APK in una copia isolata del
progetto: `CALCETTO.apk` 873.302 byte, identico al byte con quello del
repository.

### Quello che serve sul disco

| pezzo | dove | nota |
|---|---|---|
| `bundletool.jar` **1.18.3** | `android/strumenti/` | sha256 `a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29`, Apache 2.0. **Non è nel repository** (riga in `.gitignore`): si riscarica da `github.com/google/bundletool/releases` |
| Java 25 | `C:/Program Files/Java/jdk-25.0.2/bin` | serve `jarsigner`, non solo `java` |
| build-tools 34.0.0 | SDK | `aapt2` con `--proto-format` |
| platform android-34 | SDK | l'unica sul disco |

**Niente rete durante la costruzione**, come tutto il resto della catena:
`bundletool` lavora in locale, e la firma è senza marca temporale proprio
per non dover contattare un server di timestamp.

### Cosa fa `bundle.py`, in breve

La catena dell'APK e quella del bundle sono la stessa fino al `link`. Poi
cambiano due cose, e sono le uniche due:

1. `aapt2 link --proto-format` invece del binario: manifest e tabella
   risorse escono in protobuf, che è la forma che un bundle richiede;
2. i file si ridispongono nella pianta che `bundletool` pretende —
   `manifest/`, `dex/`, `res/`, `assets/`, e `resources.pb` in cima. Un
   file fuori da quelle cartelle e `bundletool` rifiuta lo zip intero;
   per questo lo script si ferma con un errore se dal link proto esce una
   voce che non si aspettava, invece di lasciarla sparire in silenzio.

Poi `bundletool build-bundle`, la firma con **`jarsigner`** (non
`apksigner`: gli schemi v2/v3 sono una firma sul formato APK e su un
`.aab` non hanno senso — Play guarda proprio la firma jar), e infine
`jarsigner -verify` e `bundletool validate` riletti dal file finito.

## Il peso — e la notizia è che il bundle non fa dimagrire niente

Tutto misurato il 29 agosto 2026 sul `versionCode` 1398495.

| cosa | byte | kB |
|---|---:|---:|
| `apk/CALCETTO.apk` — l'APK di oggi | 873.302 | 852,8 |
| `apk/CALCETTO.aab` — **quello che si carica** | 858.637 | 838,5 |
| **quello che l'utente scarica davvero** (OnePlus 6, API 30) | **864.976** | **844,7** |
| stima di `bundletool get-size`, API 24-28 | 856.256 | 836,2 |
| stima di `bundletool get-size`, API 29-31 | 856.736 | 836,7 |
| stima di `bundletool get-size`, API 32+ | 856.740 | 836,7 |
| APK universale generato dal bundle | 860.880 | 840,7 |

**Risparmio contro gli 853 kB di oggi: 8.326 byte, cioè lo 0,95%.**

Non è un errore ed è bene saperlo prima di sperarci: il bundle serve a
essere ammessi sullo store, non a far dimagrire l'app. Il motivo si legge
in una riga sola, dentro l'APK consegnato al telefono:

    assets/CALCETTO-il-gioco.html   2.313.880 -> 844.655 byte compressi

Sono il **97,6%** di tutto ciò che si scarica. Un file solo, che nessun
meccanismo di suddivisione può tagliare: non è una risorsa per densità,
non è una libreria per architettura, non è una lingua. Le uniche cose
suddivisibili che l'app possiede sono cinque icone, e pesano 3.258 byte
compressi in tutto.

Se un giorno si vorrà davvero un download più leggero, la leva non è il
formato del pacchetto: è quel file HTML.

### Perché l'APK consegnato è più grosso dell'`.aab` che si carica

864.976 contro 858.637 byte, e sembra un controsenso. Misurato: per API
≥ 29 `bundletool` mette `classes.dex` nel pacchetto **non compresso**
(8.884 byte invece di ~4.756) perché Android possa mapparlo in memoria
direttamente — avvio più rapido e meno RAM. Sono 4.128 byte di rete
spesi per del lavoro risparmiato a ogni avvio. È anche l'intera
differenza fra la variante API 24-28 (860.880 byte) e quella 29+
(864.976): non ci sono altre differenze fra le tre.

## Strade bocciate, coi numeri

**Suddividere per densità dello schermo: bocciata, zero byte.**
L'idea era ovvia — il telefono ha densità 450, dovrebbe scaricare una
sola icona invece di cinque. Ho costruito un secondo bundle con un
`BundleConfig` che chiede esplicitamente `SCREEN_DENSITY`, `LANGUAGE` e
`ABI`, e l'ho tagliato per la specifica vera del OnePlus 6:

    senza configurazione esplicita   864.976 byte, 1 APK
    con SCREEN_DENSITY esplicito     864.976 byte, 1 APK

Identico, e tutte e cinque le icone restano nell'APK principale. Il
motivo è strutturale: sono l'icona del lanciatore, richiamata da
`android:icon` nel manifest, e deve essere presente al momento
dell'installazione qualunque sottoinsieme di parti si installi. Non è
suddivisibile per costruzione.
Il tetto teorico del risparmio, se lo fosse: tenere solo la xxhdpi (817
byte) invece di tutte e cinque (3.258) significherebbe **2.441 byte, lo
0,28% del download**. Non vale una riga di configurazione in più, e
`bundle.py` infatti non ne ha nessuna: usa il comportamento predefinito.

**Far generare il numero di versione a `bundle.py`: bocciata.**
Era la strada più naturale (ogni caricamento su Play vuole un
`versionCode` più alto del precedente, e `versione()` lo garantisce già).
Rompe però la proprietà che conta di più: il `.aab` deve descrivere
l'app che si è provata sul telefono, non una costruzione mai vista.
E c'era un danno collaterale misurato: siccome `versione()` scrive
`versione.json` e `verifica.py` confronta quel file con gli APK sul
disco, bastava un `import costruisci` per far uscire rosso `verifica.py`
su APK sani.

## La chiave di caricamento

Generata il 29 agosto 2026 da `bundle.py` stesso, alla prima esecuzione.

| | |
|---|---|
| **dove** | `C:/Users/Utenteee/.chiavi-dopolavoro/caricamento.jks` |
| impronta SHA-256 | `63c36db94549413d46e24ec1de1c21574690a242bac9fd38b12e57b6aa3fa204` |
| soggetto | `CN=Dopolavoro FC, OU=Caricamento Play, O=Dopolavoro, L=Italia, C=IT` |
| alias | `caricamento` |
| algoritmo | RSA 2048, firma SHA256withRSA |
| **scade** | **21 agosto 2056** (Google ne chiede uno valido almeno fino al 22 ottobre 2033) |
| password | in `caricamento.password.txt`, nella stessa cartella |

**Sta fuori dal repository**, non dentro con una riga di `.gitignore`:
una riga la può cancellare un distratto e un `git add -f` la scavalca
comunque, mentre una cartella in un altro ramo del disco non ci finisce
neanche per sbaglio. Si sposta con la variabile `CHIAVI_DOPOLAVORO`.

La password sta in chiaro accanto alla chiave perché non protegge niente
che il file `.jks` non esponga già: chi arriva alla cartella ha entrambi.
Ciò che protegge la chiave è che quella cartella non è nel repository e
non è in nessuna copia che vada in rete.

**VA FATTA UNA COPIA DI SICUREZZA, e non è un consiglio di rito.**
Due copie, su due supporti diversi, di *tutta* la cartella
`.chiavi-dopolavoro` (chiave **e** password: senza la seconda la prima
non si apre).

### Se si perde

Non si rigenera: una chiave nuova ha un'impronta diversa, e Play rifiuta
ogni caricamento firmato da una chiave che non sia quella registrata. Si
torna a caricare solo dopo aver chiesto a Google la **sostituzione della
chiave di caricamento** (Play Console → Impostazioni → Integrità
dell'app), che è una pratica con attesa di giorni.
**L'app pubblicata non si perde e gli utenti non se ne accorgono**,
perché ciò che arriva sui telefoni lo firma Google con la sua chiave
(Play App Signing): si perde solo la possibilità di caricare
aggiornamenti finché la pratica non si chiude. Se la rubano: stessa
pratica, con più fretta.

### Il cane da guardia

Nel repository resta soltanto l'impronta, in
`android/chiave-caricamento.json` — un dato pubblico, che sta dentro ogni
file firmato. Serve a un caso solo: se la cartella delle chiavi sparisce,
senza quel file `bundle.py` ne genererebbe una nuova **in silenzio**, e
ce ne accorgeremmo mesi dopo davanti al rifiuto di Play. Con quel file si
ferma subito e spiega cosa fare.
Provato il 29 agosto 2026 nascondendo la cassaforte: `bundle.py` stampa
il messaggio ed **esce con codice 1**; rimessa la cassaforte, esce 0.
Un cancello che esce 0 non è un cancello — è la lezione già pagata su
`verifica.py`, e questo la rispetta.

## La prova sul telefono — quella che conta

Un bundle che nessuno ha mai installato non prova niente. Ecco cosa è
stato fatto il 29 agosto 2026 sul OnePlus 6 del committente, in una sola
sessione, e com'è stato rimesso a posto.

| passo | esito |
|---|---|
| `bundletool validate --bundle=apk/CALCETTO.aab` | passato; modulo `base` con le 5 icone, `dex/classes.dex`, `assets/CALCETTO-il-gioco.html` |
| `jarsigner -verify` sull'`.aab` | `jar verified`, firmato `OU=Caricamento Play`, digest SHA-256 |
| `bundletool build-apks --connected-device` | 1 APK, `splits/base-master.apk`, 864.976 byte |
| `bundletool install-apks` | installato; `versionCode=1398495`, `splits=[base]`, `minSdk=29` (la variante per la fascia API 29-31, come farebbe Play) |
| avvio | `LaunchState: COLD`, `TotalTime: 456 ms` |
| **fotografia** | `fuori/tel-aab.png`, 2280×1080 |
| la fotografia è il gioco vero? | **sì**: 70.823 colori distinti, RGB medio (44,9 · 57,3 · 38,7), 0,1% di pixel neri, 0,0% di bianchi. Si vede la schermata iniziale col logo, «DOPOLAVORO FC · LE SETTE DI SERA», il contatore monete e i sette pulsanti del menu |
| la WebView carica davvero l'asset del bundle? | sì: `location.href` = `file:///android_asset/CALCETTO-il-gioco.html`, tela 1620×768, `window.__test` presente |
| **si gioca?** | sì: partita 5 contro 5 avviata via CDP, stato `play`, 10 uomini in campo, palla presente. Fotografia in `fuori/tel-aab-partita.png` (punteggio, cronometro, comandi, radar) |

Nota sulla fotografia: la regola di casa dice che `screencap` restituisce
nero sui livelli accelerati. **Su questo telefono vero non è successo** —
`adb exec-out screencap -p` ha dato l'immagine giusta. La lezione resta
valida dove è stata pagata (l'emulatore); qui la seconda fotografia, la
partita, è comunque presa da Chromium via CDP, che è la via che non
sbaglia mai.

### Come è stato rimesso tutto a posto

Gli APK generati dal bundle sono stati firmati con la **chiave di
collaudo**, non con quella di caricamento. È una scelta, e la ragione è
che non cambia una virgola alle prove: ciò che arriva sui telefoni dallo
store lo firma comunque Google con la sua chiave, quindi la firma degli
APK di prova è arbitraria. Usando la stessa dell'app già installata,
però, l'installazione è andata **sopra** quella esistente invece di
richiedere una disinstallazione — e **il salvataggio non è stato perso**.
La chiave di caricamento è verificata a parte, sull'`.aab`, che è il solo
file su cui Play la guardi.

Ripristino: `adb install -r apk/CALCETTO.apk` → `Success`. Stato finale
riletto da `dumpsys`: `versionCode=1398495`, `minSdk=24`, `splits=[base]`
— identico a com'era prima. Riavviato il gioco: **351 monete**, le stesse
di prima della prova. Telefono libero.

## Cosa NON è verificato, dichiarato

- **Play non ha mai visto questo bundle.** L'account sviluppatore non
  c'è ancora. `bundletool validate` è il controllo di Google sul
  *formato*, non il controllo di Play sul *caricamento*: che la Console
  lo accetti resta da vedere.
- **La chiave di caricamento non è mai stata registrata su Play**, e la
  procedura di sostituzione qui descritta viene da documentazione, non
  da esperienza.
- **La firma che l'utente finale riceverà non è stata provata**, e non
  può esserlo: con Play App Signing la mette Google, e non esiste da
  questa parte.
- **`targetSdkVersion` è 34 e sul disco c'è solo `android-34`.** Google
  Play alza il minimo ogni anno, di solito a fine agosto — cioè adesso.
  **Va verificato quale sia il minimo richiesto il giorno del
  caricamento**: non lo do per scontato e non l'ho misurato. Se serve una
  piattaforma più recente va scaricata, e quello è l'unico passo di tutta
  la faccenda che richiede la rete.
- **Un telefono solo, una sola configurazione**: OnePlus 6, Android 11,
  API 30, arm64-v8a, densità 450. Le varianti API 24-28 e 32+ sono state
  costruite e pesate, ma **non installate da nessuna parte**.
- **CIRCOLO**: `bundle.py CIRCOLO` è previsto ma non è mai stato
  lanciato, e nessun bundle di CIRCOLO è stato costruito né installato.
- **`apk/CALCETTO.aab` non è versionato in git.** Non l'ho né aggiunto né
  messo in `.gitignore`, perché è una decisione del committente: gli APK
  in `apk/` sono versionati, e il bundle sarebbe coerente con quella
  abitudine; d'altra parte si rigenera in venti secondi dagli stessi
  ingredienti, e sono 839 kB di binario a ogni pubblicazione.
- Batteria, calore, sessioni lunghe: fuori dal mandato, non misurati.

### Una cosa vista di passaggio, che non è mia

`python android/verifica.py` esce **1** con un controllo fallito:
«nessuna chiamata di rete → `['fetch(']`». Non c'entra col bundle — è la
modalità SFIDA in rete, aggiunta al gioco da altri: la regola di
`verifica.py` che vieta ogni `fetch(` è più vecchia della funzione e
adesso è scaduta. Non l'ho toccata perché non è il mio mandato, ma
finché resta così quel cancello è rosso in permanenza, e un cancello
sempre rosso smette di essere letto.

> **RISOLTA il 30 agosto 2026.** La regola scaduta è stata sostituita da
> tre più strette: nessun canale di rete oltre `fetch`; `fetch` in un
> posto solo; e ogni indirizzo `http(s)` del file dentro una lista
> chiusa (licenze dei caratteri e il nostro server, nient'altro).
> Provate per iniezione di guasto: un APK avvelenato le fa scattare
> tutte e tre. `verifica.py` è tornato un cancello che si legge.

---

# Il giorno del caricamento — 31 agosto 2026

I materiali della scheda (nome, descrizioni, classificazione, Data
Safety, grafica) sono pronti in **`_analisi/SCHEDA-STORE.md`**, coi
passi della Console in fondo. L'informativa privacy è scritta in
`rete/public/privacy.html` e **va deployata** perché abbia l'indirizzo
pubblico che la scheda richiede. L'icona 512 per lo store si genera con
`node android/icone/icone-android.js`; le schermate e l'immagine in
evidenza con `node strumenti/_foto-store.js` (stanno in `fuori/store/`).

**ATTENZIONE all'`.aab` vecchio:** quello sul disco del 29 agosto
(11:30) è di PRIMA delle sette cure dell'animazione e delle cure del 31.
Prima di caricare: `python android/costruisci.py` e poi
`python android/bundle.py`, nell'ordine, come sempre.
