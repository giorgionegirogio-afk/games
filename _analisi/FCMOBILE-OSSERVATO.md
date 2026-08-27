# EA SPORTS FC Mobile, osservato sul telefono — 27 agosto 2026

Non e' una lettura di recensioni: e' il gioco vero, installato sull'OnePlus 6
del committente (`01c8eb5a`), aperto e guardato. Ogni riga qui sotto ha un
fotogramma o un comando dietro. Le immagini stanno in `fuori/fcm/`.

**Pacchetto:** `com.ea.gp.fifamobile` · **nome sullo store (italiano):**
EA SPORTS FC Calcio Mobile 26 · installato il 27 agosto 2026 alle 09:42.

---

## 1. I numeri duri, letti da `dumpsys` e da `du`

| | FC Mobile | CALCETTO | rapporto |
|---|---|---|---|
| versione | 27.0.04 (codice 40262) | 1.1 (codice 1395120) | |
| Android minimo | 6.0 (API 23) | — (WebView) | |
| Android bersaglio | API 36 | API 34 | |
| APK di base | **122.079.830 byte** | **717.654 byte** | **170×** |
| pacchetto asset in piu' | 31.989.671 byte (+4 split) | nessuno | |
| spazio installato | **309 MB** | ~3 MB | **~100×** |
| dati scaricati dopo | **640 MB** (630 in `files/`) | **4,8 MB** | **133×** |
| **totale sul telefono** | **~949 MB** | **~8 MB** | **~119×** |
| **permessi dichiarati** | **19** | **0** | |

I diciannove permessi, uno per uno: INTERNET, ACCESS_NETWORK_STATE,
ACCESS_WIFI_STATE, BIND_GET_INSTALL_REFERRER_SERVICE (×2 forme), C2DM
RECEIVE, VIBRATE, C2D_MESSAGE proprio, FOREGROUND_SERVICE_MEDIA_PROJECTION,
BILLING, **AD_ID**, POST_NOTIFICATIONS, **ACCESS_ADSERVICES_ATTRIBUTION**,
**ACCESS_ADSERVICES_AD_ID**, CHECK_LICENSE, **ACCESS_ADSERVICES_TOPICS**,
**ACCESS_ADSERVICES_CUSTOM_AUDIENCE**, FOREGROUND_SERVICE,
DYNAMIC_RECEIVER_NOT_EXPORTED.

Cinque di questi diciannove servono alla pubblicita' e alla misurazione
pubblicitaria; uno (MEDIA_PROJECTION) permette di registrare lo schermo.

## 1 bis. Memoria e fotogrammi, misurati con `dumpsys`

| | FC Mobile | CALCETTO |
|---|---|---|
| memoria PSS | **941.155 kB (~941 MB)** | **129.199 kB (~129 MB)** |
| memoria RSS | 1.124.072 kB (~1,1 GB) | 288.636 kB (~289 MB) |
| grafica | 100.956 kB | 70.784 kB |

Sette volte e mezza di RAM in meno, sullo stesso telefono.

**E UNA COSA CHE RIGUARDA NOI, trovata per caso e da non nascondere:**
`dumpsys gfxinfo it.dopolavoro.calcetto` dice «Janky frames: 606 (87,95%)»
su 689 fotogrammi, col 90esimo percentile a 19 ms. La finestra misurata
comprende l'avvio e il primo caricamento, quindi il numero e' gonfiato — ma
va rimisurato a regime, in partita, perche' se reggesse sarebbe un difetto
nostro e non un merito di nessuno. Su FC Mobile lo stesso comando dice
«Total frames rendered: 0»: il suo motore disegna su una superficie propria
che il contatore di Android non vede, quindi **i due numeri non si possono
confrontare** e chi li affiancasse mentirebbe.

## 2. L'avvio, cronometrato

`am start -W` da' **1392 ms** alla prima finestra (avvio a freddo). Ma la
prima finestra non e' il gioco: e' il logo. Catture ogni cinque secondi da
un avvio a freddo:

    5 s   schermata quasi vuota (319 kB di PNG: e' nera)
    10-20 s  schermata di caricamento piena
    25-30 s  **nero con il solo logo EA che gira**
    40 s   **menu principale pronto**

Quindi: **fra 30 e 40 secondi** da icona premuta a menu usabile. CALCETTO
misura **1861 ms** da icona premuta a **pallone toccabile** — un criterio
piu' severo, perche' il menu non e' ancora gioco. Il rapporto e' fra 16 e
21 volte, e a favore del piccolo.

## 3. Il menu principale — che cosa c'e' sullo schermo

Contati sulla schermata: **tre valute** in alto (una verde, una a gemma
rossa, una col marchio FC), livello utente con barra XP («1 · 0/35XP»),
NEWS, amici, posta, impostazioni con pallino di notifica.

**Quattro voci in colonna a sinistra**: ATTIVITA, IN EVIDENZA, PASS STELLE,
T. SUPPLEMENTARI. **Cinque voci in fondo**: MISSIONI, LEGHE, INGAGGI,
SCAMBIO, NEGOZIO. Piu' il carosello centrale (KICK OFF con «VAI ORA»), il
riquadro DRAFT DI BENVENUTO, e due riquadri **col lucchetto**: CLUB e GIOCA.

Sono **quindici punti d'ingresso** nella prima schermata. CALCETTO ne ha
sei (GIOCA, TORNEO, STAGIONE, SQUADRA, NEGOZIO, IMPOSTAZIONI).

Le carte del draft cambiano a ogni avvio: prima Lampard 115 CM e Puyol 115
CB, poi Mbappe 117 ST, Bruno Fernandes 117 CAM, Lamine Yamal 117 RW.
**Giocatori veri, volti fotografici, valutazione a tre cifre, ruolo, bandiera
della nazione, stemma del club.**

## 4. L'onboarding e' obbligatorio, e paga

Premendo VAI ORA si entra in CALCIO D'INIZIO, che offre due strade:
«COMANDI DI GIOCO — Partiamo dalle basi: imparerai a dribblare, tirare,
passare e difendere» oppure «SALTA LE BASI — Scendi subito in campo».

La lezione e' incorniciata come un OBIETTIVO con: difficolta'
(«Principiante»), avanzamento («Completato 0/1»), **PREMI GARANTITI
(Gemma ×200)** e una **scadenza** («Scade tra: 1488 Giorni»).

Finche' l'onboarding non e' finito, CLUB e GIOCA restano col lucchetto e il
carrello del negozio non apre. **Il gioco decide lui cosa puoi toccare.**

## 5. In campo — quello che conta per i comandi

Il tutorial dice, testualmente: «Usa la **levetta virtuale** per controllare
i movimenti del tuo giocatore».

Osservato nei fotogrammi:

- **levetta virtuale in basso a sinistra**, disco bianco su alone scuro, con
  un **arco esterno** che si accende quando la si spinge (la corsa);
- **un solo disco d'azione, in basso a destra, che COMPARE QUANDO SERVE**:
  in mezzo al campo non c'e' nessun pulsante, e appena il giocatore entra in
  zona di tiro appare un disco con l'etichetta **TIRO** e un **anello
  arancione** attorno (la carica);
- **una mano-fantasma semitrasparente** disegnata sopra il comando che si
  deve usare: il gioco insegna mostrando il gesto, non scrivendolo;
- il giocatore comandato porta **tre segni insieme**: anello verde a terra,
  triangolo verde sopra la testa, **nome scritto sotto** («Bellingham»);
- HUD della prova: TENTATIVI 1/99, PUNTI 0, un tasto pausa in alto a destra.

Il menu di pausa ha quattro voci: RIPRENDI PARTITA, GIOCO (le impostazioni
di gioco, disattivate nelle prove abilita'), AUDIO (volume), RITIRO
(«Perderai i premi e tutti i progressi nella partita») con **conferma
esplicita** in un secondo riquadro.

Finita la prova: «RISULTATO PROVA ABILITA — RIPROVA — **0/10.000 punti**».
Anche l'allenamento e' un punteggio con una soglia.

## 6. La grafica, guardata

Motore **3D vero** con telecamera bassa dietro il giocatore, che **segue** e
si riorienta. Nel campo d'allenamento si vedono: striature del taglio
dell'erba in prospettiva, coni arancioni tridimensionali con la loro ombra,
recinzione metallica, panchine, porte con la rete a maglie, marchi dipinti
sul manto («FC MOBILE», «EA SPORTS»), ombre dei corpi.

I giocatori nei menu sono **fotografie**, non disegni; in campo sono modelli
tridimensionali con divise ufficiali e sponsor leggibili (adidas, Emirates,
T-Mobile, hp sulla maglia del Real).

---

## Che cosa NON ho potuto vedere, e va detto

- il **negozio** e i prezzi veri: il carrello non apre finche' l'onboarding
  e' aperto;
- una **partita vera** (11 contro 11 con tabellone, tempo, sostituzioni):
  la voce GIOCA e' col lucchetto;
- il **multigiocatore**, le leghe, il mercato: dietro lo stesso lucchetto;
- l'**audio**: le catture sono immagini mute;
- i **consumi** (batteria, dati, fotogrammi al secondo in partita) non sono
  stati misurati; la memoria si', ed e' qui sopra;
- **l'onboarding non si salta**: la scheda «SALTA LE BASI» esiste, ma dopo
  due giri il gioco riporta sempre alla lezione dei comandi. Anche questo e'
  un fatto, ed e' una differenza: CALCETTO manda in campo al primo tocco.

Queste restano da fare, e finche' non le si fa i confronti su quelle voci
vanno marcati come non verificati.
