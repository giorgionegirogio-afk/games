# Dove siamo, e cosa manca

Aggiornato al 3 agosto 2026, a valle di sei onde di lavoro in due giorni.
Questo file serve a riprendere senza rileggere niente altro.

**Ramo:** `main`. **Ultimo lavoro:** CALCETTO — vetrina, figure, negozio,
e la passata correttiva finale.

---

## Il verdetto, misurato

**Confronto diretto chiesto dal committente** (giudice separato, tutti i
riferimenti sotto gli occhi, criteri pesati insieme: apertura immediata,
niente account, niente pubblicità, niente attese, onestà misurata, qualità
visiva): **noi 8, FIFA Mobile 3.** L'obiettivo «il nostro 8-9, il loro 2-3»
è raggiunto sui criteri d'esperienza — e il giudice è onesto sul rovescio:
sul solo visivo loro 9-10, noi ~6. La motivazione intera è nel diario della
sessione; la sostanza: si vince su tutto ciò che si promette in copertina,
si perde ancora sulla ricchezza visiva pura.

**Giuria larga sul visivo** (10 giudici, 26 scene, lenti vetrina+mestiere,
scala ancorata dove 8 = «sta in vetrina», 3 = da dove siamo partiti):
**6,22 di media.** Traiettoria: 3 → 5,8 → 5,82 → 6,04 → 6,21 → 6,22, più
la correttiva finale che ha riparato 10 difetti su 10 dopo il voto.

| cancello | esito |
|---|---|
| `node strumenti/collaudo.js` | **25 su 25** (entrambi i giochi, seme fisso) |
| `node strumenti/misura.js` | **7 su 7** — 252 fasi, 223 pose, carica 8 valori |
| `node strumenti/prestazione.js` | **3 su 3** — medio −26%, p95 −49,7% |
| `node strumenti/senza-rete.js` | **6 su 6** — zero richieste |
| `node strumenti/giocata.js --tutte` | **4 su 4** — tocco 13-47 ms |
| `node strumenti/equita.js --partite 200 --conf-b "window.__test.attivaOggetti('tutti')"` | **differenza 0,000 gol**, coppie identiche |
| `android/verifica.py` | **32 su 32** — APK 337 kB firmato |

File: `CALCETTO-il-gioco.html`, 921.032 byte. **Il tetto di casa è stato
alzato da 900 a 1500 kB il 3 agosto 2026**, con cognizione: il committente
ha chiesto rose da 5/7/11, l'intero vocabolario delle azioni animate e lo
pseudo-3D — non stanno in 900 kB. Il vincolo vero resta l'altro: UN solo
file, zero rete, si apre in un secondo (1500 kB su rete mobile media sono
ancora sotto il secondo, ed è l'argomento di vendita da difendere).

---

## Cosa è stato chiuso in queste onde

- **Il ritorno sul terzo giro**: 5 scene recuperate, zero peggio.
- **Il tabellone-eroe** (torneo a 3 bozze + sintesi, `bozze-tabellone/FINALE.html`):
  regge fine partita e home, e appare nei rigori.
- **Le leve del metro**: saturazione con contrasti misurati (4,97/3,84/4,53/3,50:1),
  una tinta dominante e l'accento ambra unico, densità in partita (possesso e
  falli in pausa/statistiche), riga di vendita in home.
- **Stacco e centri**: bordo di luce su figure e palla, camera più vicina,
  barra-punteggio a pannello; lavagna del mister (istruzioni 5,0→6,5),
  mensola dei trofei, torneo a gessetto, cartoline dei campi.
- **Figure e palcoscenico**: divise disegnate, numeri, varietà pelle/capelli,
  anello pieno; i rigori come scena madre (5,5→6,3).
- **Il negozio**: bacheca del campetto, 5 acquisti dichiarati
  (3,99 completo = metà dei pezzi / 1,99 campi / 1,99 divise / 0,99 curva /
  2,99 sponsor), tutto sbloccabile giocando (5320 monete, ~48 a partita);
  curva con tamburo e coro WebAudio + coreografia; sponsor con i nomi
  dell'utente sui cartelloni; pannello euro onesto.
- **Il metodo**: `giocata.js` (il tocco, con la prova che sa fallire),
  `equita.js` (appaiato al bit, sa fallire), seme fisso anche in `misura.js`
  e `collaudo.js`, `prestazione.js` a tre finestre (mediana delle mediane),
  `senza-rete.js` che accetta il kickoff. **Sei strumenti ciechi trovati e
  riparati in totale — sempre da chi li usava, mai da chi li aveva scritti.**
- **METRO.md rettificato** (3 ago): movimento, stacco e colore non sono più
  «mancanti» — i giudici non devono più copiare difetti morti dal metro.

---

## Cosa manca, in ordine di resa

1. **Spazio nel file**: 568 byte di margine. Prima di qualsiasi onda.
2. **Il fondo della classifica della giuria** (voti 5,5-6,1): gol-moto-ridotto
   (sostituti statici della festa: raggi, bagliore, vignettatura), la scena
   `azione-tarda` di scatta.js (fotografa un momento morto: va rimessa in posa
   su un tocco di palla — è la SCENA che è sbagliata, non il gioco), moviola
   (scia con coda e alone al posto del segmento da debug), gioca (il pallone
   eroe è spento: serve lucido e volume), rosa (avatar per riga).
3. **Il divario visivo residuo** verso il 9-10 di FIFA: la lista onesta del
   giudice del confronto è nel diario — folla viva, ricchezza di dettaglio,
   un'ombra ambientale sul prato.
4. **Il tiro «lunatico» con lo stick** (trovato da giocata.js): lo stesso
   gesto esce perfetto o debole secondo la fase dell'anello di timing.
   Va reso leggibile (l'anello più visibile) o più tollerante.
5. **La prova in mano su un telefono vero** — il banco dice solo il costo
   relativo. Gli APK nuovi sono in `apk/`, 32 controlli verdi.

---

## Come si riprende

```bash
cd C:/Users/Utenteee/Desktop/GitHub/games
node strumenti/collaudo.js              # 25 controlli, entrambi i giochi
node strumenti/misura.js                # il movimento, in numeri
node strumenti/prestazione.js           # il costo, relativo, 3 finestre
node strumenti/senza-rete.js            # zero rete
node strumenti/giocata.js --tutte       # il tocco
node strumenti/equita.js --partite 200 --conf-b "window.__test.attivaOggetti('tutti')"
node strumenti/scatta.js --tutte calcetto --dir foto-oggi   # 26 scene
python android/costruisci.py && python android/verifica.py  # APK
```

---

## Le regole che hanno fatto la differenza (tutte pagate)

1. **Le passate correttive rendono più di quelle creative.** L'ultima ha
   riparato 10 difetti su 10 al primo giro. Ogni onda chiude con una.
2. **Un solo «peggio» è bloccante.** Non si compensa: si annulla.
3. **I cancelli li esegue chi giudica, non chi lavora.**
4. **Uno strumento che attesta invece di misurare è peggio di nessuno
   strumento.** Sei casi in due giorni: scatta senza seme, misura che
   attestava, misura senza seme, collaudo che lanciava i dadi sugli autogol,
   prestazione che misurava il banco occupato, senza-rete che bocciava il
   kickoff. Prima di fidarsi di una misura: verificare che sappia fallire.
5. **Un agente morto non è un via libera.** La caduta di rete ha mostrato
   che «il giudice non ha obiettato» e «il giudice è morto» devono essere
   esiti diversi: i workflow ora si fermano su null.
6. **Il metro si rettifica con data e fonte** quando la realtà lo supera,
   o i giudici copiano difetti morti.
