# Dove siamo, e cosa manca

Fermato su richiesta. Tutto committato, niente a metà. Questo file serve a
riprendere senza rileggere niente altro.

**Ramo:** `main` per quello che è pubblicato, `qualita-aaa` per la cronologia
di dettaglio delle prime sette onde.
**Ultimo lavoro:** CALCETTO, animazione e identità visiva.

---

## Lo stato, misurato adesso

| cancello | esito |
|---|---|
| `node strumenti/collaudo.js calcetto` | **13 su 13** |
| `node strumenti/senza-rete.js` | **6 su 6** — una sola richiesta per gioco, il documento |
| `node strumenti/misura.js` | **7 su 7** — anticipo compreso |
| `node strumenti/prestazione.js` | **3 su 3**, −26% rispetto al riferimento |
| `node strumenti/prestazione.js --freno 4` | 98,5 ms per fotogramma (era 149,4 prima dell'animazione) |

File: `CALCETTO-il-gioco.html`, 668 kB su 900 consentiti.

**Voto dei critici sulla scala ancorata: 5,8 su 10.** Partiti da 3. Non è 8, e
non va raccontato come se lo fosse.

---

## Cosa è stato chiuso

- **Il movimento.** Le figure non scivolano più: 252 valori distinti di fase,
  13 di deformazione, 8 di carica prima del calcio. Erano zero. L'anticipo —
  l'ultima delle quattro cose che separano un gioco animato da uno che scivola
  — si è chiuso proprio nell'ultima passata, prima dello stop.
- **Il costo.** Sceso del 35% *mentre* l'animazione cresceva.
- **L'identità.** Decisa e scritta: «Le sette di sera al campetto», una sola
  luce dichiarata, sole basso da ovest, con una legge che vale per tutto.
- **Il modello di guadagno.** Progettato per intero (vedi sotto).
- **Il metro.** 32 schermate di vetrina dei concorrenti in `riferimenti/`, con
  l'analisi in `riferimenti/METRO.md`.

---

## Cosa manca, in ordine

### 1. Il ritorno sul terzo giro — è la prima cosa da fare
I critici hanno confrontato le 25 scene una per una:

| giro | voto | scene |
|---|---|---|
| 1 | 6,0 | 3 meglio, 1 peggio |
| 2 | **6,5** | 18 meglio, 5 peggio ← il punto più alto |
| 3 | 5,8 | 3 meglio, 4 peggio ← ha perso terreno |

Il terzo giro sugli oggetti-eroe ha tolto più di quanto ha dato. Va confrontato
`foto-eroe-g2` con lo stato attuale e riportato indietro ciò che è peggiorato,
tenendo i miglioramenti veri. **Passata che toglie, non che mette.**

### 2. L'oggetto-eroe, che è la leva più forte non ancora tirata
`METRO.md` lo misura sui concorrenti: la schermata del tabellone di FIFA Mobile
è viola piatto con righe uguali, e in mezzo un trofeo in cromo e oro che occupa
un quinto dello schermo e regge tutto. Le nostre schermate sono elenchi senza
centro. Il nostro deve essere **il tabellone di compensato appeso alla
recinzione**, disegnato meglio di ogni altra cosa del gioco.

### 3. Le altre tre leve di `METRO.md`, mai tirate fino in fondo
- **Saturazione** — il campo è ancora spento accanto ai concorrenti. Attenzione
  alla trappola già pagata: schiarire il manto e basta spegne le maglie e manda
  il contrasto sotto 3:1. Si alza il manto tenendo le divise *ancora più* sature.
- **Una tinta dominante e UN accento** — oggi il lime e il rosa delle divise
  ricompaiono ovunque e non vogliono più dire niente.
- **Densità** — in partita convivono punteggio, cronometro, possesso, falli,
  minimappa, tutorial, due pulsanti. Ogni cosa tolta fa sembrare più curate
  quelle che restano.

### 4. La riga in home
Il direttore artistico l'ha chiesta a caratteri grandi, ed è dove siamo 8
mentre il capo della categoria è 2:
> Si apre in un secondo · niente account · niente pubblicità · niente attese ·
> 90 secondi a partita

### 5. Il modello di guadagno, da realizzare
Progettato ma **non ancora scritto nel gioco**. Cinque acquisti in euro
dichiarati, una volta sola, senza account né rete:

| | |
|---|---|
| Il campetto completo | 3,99 € — tutto, e tutto ciò che verrà |
| Pacchetto campi | 1,99 € |
| Pacchetto divise | 1,99 € |
| La curva (cori, esultanze, tamburo) | 0,99 € |
| **Lo sponsor del campetto** | 2,99 € — scrivi tu i nomi sui cartelloni e sul tabellone |

Somma dei pezzi 7,96 €, il completo è metà: unico ancoraggio di prezzo, ed è
vero. Tutto il gioco resta gratis e **ogni oggetto si sblocca giocando**: 5320
monete, circa 110 partite. Niente pubblicità, casse premio, timer, valuta finta.
Da aggiungere al collaudo: 200 partite con tutti gli oggetti contro 200 senza —
la differenza reti non deve superare 0,15 a partita.

### 6. Il buco che nessuno ha ancora colmato
**Tutto è sempre stato giudicato con la CPU che gioca contro sé stessa.**
Nessuno ha mai valutato com'è *toccare* la palla: trascinare il dito, caricare
il tiro, il tempismo. Serve uno strumento che esegua una giocata scritta e ne
registri la risposta. È il difetto più grave rimasto nel metodo.

### 7. La prova che nessuno strumento può dare
Provarlo in mano su un telefono vero. Il banco qui disegna in software senza
scheda grafica: dice quanto il costo è *cambiato*, non quanti fotogrammi al
secondo farà un telefono.

---

## Come si riprende

```bash
cd C:/Users/Utenteee/Desktop/GitHub/games
node strumenti/collaudo.js calcetto     # 13 controlli
node strumenti/senza-rete.js            # non scarica niente
node strumenti/misura.js                # il movimento, in numeri
node strumenti/prestazione.js           # il costo, confronto relativo
node strumenti/scatta.js --tutte calcetto --dir foto-oggi
node strumenti/striscia.js --scena calcetto/tiro --n 10 --passo 0.05 --out s.png
node strumenti/filmato.js --scena azione --sec 6 --out f.webm   # per guardarlo tu
```

Le cartelle di lavoro (`foto*`, `confronto*`, `strisce/`, `filmati/`,
`riferimenti/*/`) sono escluse da git: si rigenerano in un minuto.

---

## Le tre regole che hanno fatto la differenza, e vanno tenute

1. **Le passate correttive rendono più di quelle creative.** Misurato più
   volte: riparare i difetti aperti ha dato +0,7; gli specialisti creativi
   hanno dato −0,6, −0,1, +0,2. Ogni onda deve finire con una passata che
   chiude e non aggiunge.
2. **Un solo «peggio» è bloccante.** Non si compensa un peggioramento con due
   miglioramenti altrove: si annulla.
3. **I cancelli li esegue chi giudica, non chi lavora.** In una passata i
   critici hanno dichiarato verde un cancello che era rosso del 49,7%.

E la regola nata dagli errori miei: **uno strumento che attesta invece di
misurare è peggio di nessuno strumento**. `misura.js` segnava verde su un campo
che esisteva ma valeva sempre −1; `scatta.js` dichiarava scene ripetibili che
non lo erano; il primo `prestazione.js` misurava il banco invece del gioco.
Ogni volta se n'è accorto qualcun altro. Prima di fidarsi di una misura, va
verificato che sappia fallire.
