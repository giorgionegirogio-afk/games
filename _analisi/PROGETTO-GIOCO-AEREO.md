# PROGETTO #72 — IL GIOCO AEREO DELLA MACCHINA

**31 agosto 2026.** Documento di progetto, non di lavoro: qui non si tocca una
riga del gioco. File misurato: `CALCETTO-il-gioco.html`, 2.367.698 byte,
md5 `b0516b522667914ca15b1da59a009983`. Tutti i numeri di riga citati sono
stati letti OGGI su questo file; la regola di casa resta valida — i numeri di
riga invecchiano in un giorno, i nomi no: chi esegue cerchi per nome.

Tutte le misure nuove di questo documento sono state prese oggi, a passo
1/60 (la regola di `_g-aereo.js`: una sonda a passi lunghi misura un altro
gioco), semi dichiarati, CPU contro CPU.

---

## 0. Il verdetto in dieci righe

La CPU crossa 0,3 volte a partita a 5 contro 5 e MAI a 7 e a 11 (rimisurato
oggi, tabella §1.1). La voce di lavoro dice «colpa della distanza minima di
`crossFinestra()`»: è vero che la finestra collassa sui campi grandi (conto
esatto al §1.3: dal 22% del campo a 5 al 5% a 11, per DUE costanti assolute —
430 e 420 — contro un attrito che scala col campo), ma una sonda alle porte
del cross, scritta e girata oggi (§1.4), RETTIFICA la diagnosi: a 7 e a 11 la
finestra non arriva nemmeno a bocciare, perché nei fotogrammi buoni **non c'è
mai un compagno dentro l'area** — zero campioni su 3.483 fotogrammi esaminati.
La corsa in area (`attaccaArea`) esiste ed è SPENTA da taglia 7 in su
(`:18877`), per una bocciatura misurata che colpiva l'elezione del più
avanzato, non la punta. La cura è a tre stadi, ciascuno misurato prima del
successivo: **A** il taglio in area lo fa la PUNTA (7/11); **B** il volo del
cross si calcola per bersaglio invece di assumere sempre il più lungo (via
l'artefatto dMin, tutte le taglie); **C** — solo se l'11 resta sotto i 2 cross
— il tetto di raccolta scala col campo. Il numero di chiamate a `dado()` nei
percorsi a seme fisso CAMBIA, in punti precisi e dichiarati (§4).

---

## 1. La diagnosi

### 1.1 La misura di partenza, rifatta oggi

`node strumenti/_g-aereo.js` — 6 partite per taglia, semi 20260803..20260808,
campionato a 1/60, sul file di cui sopra (31 agosto 2026):

| taglia | a terra | bassa | TESTA 26..46 | sopra | entrate | con uomo | **cross/partita** | z max |
|---|---|---|---|---|---|---|---|---|
| 5v5 | 91,05% | 8,74% | 0,22% | 0,00% | 0,3 | 0,0 | **0,3** | 39 |
| 7v7 | 86,57% | 13,43% | 0,00% | 0,00% | 0,0 | 0,0 | **0,0** | 22 |
| 11v11 | 84,47% | 15,53% | 0,00% | 0,00% | 0,0 | 0,0 | **0,0** | 23 |

Identica alla fotografia del 29 agosto scritta nel cappello di
`_g-aereo.js`: il difetto è stabile. Il bersaglio della voce #72 è l'ordine
di **2-6 cross a partita a tutte e tre le taglie** (soglia decisa qui, non nel
banco: il banco stampa). Nota per il confronto: la partita dura 90/126/180
secondi alle tre taglie (`durataPartita`, `:3944` — scala con FW/1150), quindi
«per partita» non è «per minuto»; il bersaglio resta per partita, come lo
conta il calcio.

### 1.2 L'anatomia del cross della CPU (righe lette oggi)

La catena, tutta senza sorteggi (verificato oggi: nessun `dado()`/`rnd()` in
nessuna di queste funzioni):

- `aiCarrier` la interroga in DUE rami: `:19692` (a ogni fotogramma, solo
  fuori da `zonaTiro`) e `:19806` (dentro la zona di tiro, solo dopo che il
  dado del tiro ha detto no).
- `crossCPU(p, opGoalX)` `:19614-19648`: portatore nell'ultimo 48% del campo
  (`FW*CROSS_ZONA`, `:19615`), SULLA FASCIA (`|p.y-FH/2| >= GOAL_H`,
  `:19616`), un bersaglio da `crossBersaglio`, poi `anticipa(p,'passo',
  PASS_CAR=0,11 s, ...)` con RIVERIFICA del bersaglio alla maturazione
  (`:19641-19645`): se il quadro è cambiato il cross non parte.
- `crossBersaglio(p, opGoalX)` `:19576-19594`: il compagno, proiettato a
  `CROSS_TVOLO=0,75 s` (`:19582`), deve stare DENTRO L'AREA (`dentroArea`,
  `:19417-19420`: scatola `GK_AREA_X × 2·GOAL_H·0,77` = 118×231 a 5, 136×265
  a 7, 153×302 a 11), a distanza dentro `[dMin, dMax]` di `crossFinestra()`,
  non coperto dal portiere (`crossPortiereCopre`, `:19511-19528`), con il
  varco libero (`crossVarcoLibero`, `:19538-19553`).
- `crossFinestra()` `:19489-19494`: la finestra di distanza, dedotta da tre
  costanti — `CROSS_TVOLO=0,75`, `CROSS_RACC=420`, e il 430 di
  `doCross` — e da `TIRO_ATTR`.
- `doCross` `:14892-14919`: `T = clamp(dist/430, L14_T0=0,66, L14_T1=0,75)`
  (`:14904`, stesso clamp della guida umana `:14321`), `b.vz = 280*T`
  (`:14906`). La quota vera del culmine: 29,0 a T=0,66 e 37,6 a T=0,75
  (`:14564-14565`) — dentro la finestra della testa 26..46 (`:3947-3949`)
  a TUTTI i tempi di volo che il clamp ammette. **`doCross` non ha nessuna
  distanza minima sua**: un cross corto vola a T=0,66 e cade dove mira
  (misurato in `_q-cross.js`: 7 su 7 dentro la finestra, errore di gittata
  peggiore 2%).
- La ricezione: il pallone che scende nella fascia 26..46 trova la testa del
  primo corpo a portata (`updateBall :17501-17515`; il destinatario del cross
  allunga il collo: portata 34 contro 24), e `colpoDiTesta` `:17366-17394`
  **non ha nessun tetto di velocità in ingresso** e non pesca sorteggi.
  Il muro dei corpi sopra le 420 unità vale solo sotto quota 26
  (`:17552`). `kickBall` `:13838` non tappa la velocità in uscita.

### 1.3 Il conto esatto della finestra, e perché collassa col campo

`TIRO_ATTR` scala col campo dal 27774: `ATTR_K=1150/FW; TIRO_ATTR=1,0498*ATTR_K`
(setTaglia, «l'attrito è un derivato del campo»). Le due costanti del cross
invece NON scalano: il 430 (la velocità di mira a cui il volo tocca il tetto
T=0,75) e `CROSS_RACC=420` (la velocità d'arrivo oltre cui «nessuno la
ferma», gemella del muro dei corpi di updateBall). È lo stesso errore già
trovato nelle distanze d'attacco («IL TAPPO A 500 NON SAPEVA QUANT'È GRANDE
IL CAMPO», `:14858`), stavolta su due numeri insieme. Il conto, rifatto oggi
con le costanti lette nel file (K = 1,0498·1150/FW; c = (1−e^(−0,75K))/(0,75K);
dMin = 430·0,75·c; dMax = 420·(1−e)/(K·e)):

| taglia | K | dMin | dMax | larghezza | in % di FW | lancio al dMax |
|---|---|---|---|---|---|---|
| 5v5 | 1,0498 | 223,2 | 479,1 | 255,9 | **22,3%** | 923 u/s |
| 7v7 | 0,7499 | 246,7 | 422,8 | 176,1 | **10,9%** | 737 u/s |
| 11v11 | 0,5249 | 266,6 | 386,0 | 119,4 | **5,2%** | 623 u/s |

Le due ganasce si chiudono insieme: dMin SALE col campo (l'attrito più basso
fa atterrare più lontano la stessa mira, quindi la mira che satura il clamp
atterra più in là) e dMax SCENDE (il pallone perde meno velocità per strada,
quindi il tetto d'arrivo si raggiunge prima). A 11 la corona utile è 119
unità su un campo di 2300×1120 — e la geometria dice il resto: dalla riga
laterale al bordo dell'area ci sono 409 unità (FH/2 − GOAL_H·0,77), già oltre
dMax; al centro dell'area 560. **Un'ala sulla riga a 11 contro 11 non può
crossare in area per costruzione.**

Due note misurate che vanno dette:
- il dMin di oggi è un ARTEFATTO del modello, non della fisica:
  `crossFinestra` assume «il volo, sempre il più lungo che doCross sappia»
  (`:19487`) e dMin esiste solo per garantire quell'assunzione. Sotto dMin
  `doCross` vola benissimo, a T più corto — è il traversone corto che
  `_q-cross.js` ha già curato per il dito il 29 agosto.
- al dMax di oggi a taglia 5 il lancio vale 923 u/s, sopra la linea
  «proiettile» dei tiri (`TIRO_TETTO=860`, `:15174`): non è un guaio nuovo
  di questa cura, è così già adesso, e `kickBall` non tappa. Va saputo prima
  di discutere lo stadio C.

### 1.4 LA RETTIFICA — quale porta boccia davvero, misurato oggi

La voce di lavoro #72 dice: «crossFinestra() le impone una distanza minima
che sui campi grandi non si verifica quasi mai». Ho scritto e girato oggi una
sonda alle porte del cross (a 1/60, 4 partite per taglia, semi 20260803..06,
lo script sta in appendice §7): per ogni fotogramma con un portatore CPU col
piede pronto rifà da fuori il conto di `crossCPU`/`crossBersaglio` con le
stesse funzioni globali del gioco, e conta la PRIMA porta che boccia.

| porta (in ordine di verifica) | 5v5 | 7v7 | 11v11 |
|---|---|---|---|
| fotogrammi col piede pronto | 10.487 | 9.200 | 11.972 |
| fuori zona (oltre il 48%) | 7.369 | 6.200 | 7.809 |
| non in fascia (\|dy\|<GOAL_H) | 2.359 | 1.744 | 1.936 |
| **ESAMINATI** (zona+fascia ok) | **759** | **1.256** | **2.227** |
| — nessun compagno in area | 676 (89%) | **1.256 (100%)** | **2.227 (100%)** |
| — in area ma fuori finestra | 3 | 0 | 0 |
| — bocciati dal portiere | 0 | 0 | 0 |
| — bocciati dal varco | 36 | 0 | 0 |
| — CON BERSAGLIO | 44 | 0 | 0 |
| cross partiti (4 partite) | 2 | 0 | 0 |

La rettifica, in chiaro e con la data (31 agosto 2026): **a 7 e a 11 la
finestra di distanza non viene mai interrogata** — in quattro partite intere
per taglia non c'è UN fotogramma con un compagno dentro l'area proiettato a
0,75 s. E a 5 la finestra boccia 3 volte su 83 candidature: il collo di
bottiglia misurato è l'OCCUPAZIONE DELL'AREA (89-100% delle bocciature),
non la distanza. Il collasso di scala del §1.3 è vero e va curato lo stesso —
diventerà la ganascia vincolante appena qualcuno entrerà in area (a 11 la
corona [267, 386] contro un secondo palo che dalla fascia dista 300-600) —
ma da solo non produce un cross in più ai campi grandi.

Perché nessuno è in area, righe alla mano:
- la corsa in area ESISTE — `attaccaArea` `:18833-18904`, elegge un uomo che
  va al secondo palo (`puntoCross`, `:14801-14805`) — ed è **spenta da taglia
  7 in su**: `if(TAGLIA>=7) return false;` (`:18877`). Il commento sopra
  quella riga documenta la bocciatura misurata che l'ha spenta: accesa
  com'era (elezione del PIÙ AVANZATO), a 7 i tiri calavano da 11,88 a 8,91 e
  i momenti/min da 3,03 a 1,99 (IC al 95%, p<0,001) — rubava il rifinitore
  alla manovra. E aggiunge: «i cross restano ZERO anche con la riga tolta: a
  undici non ne parte nemmeno uno» — coerente col §1.3: a 11 anche con
  l'area occupata la finestra strozza.
- la PUNTA (ruolo assegnato solo da taglia 7, `:18746`, stazione
  `PUNTA_X=0,70` `:18652`) tiene la stazione SOLO nel ramo senza palla
  (`:19331-19345`); in possesso passa dal ramo comune: `attaccaArea` (che a
  7/11 rifiuta) e poi lo smarcamento al fianco (`:19267-19282`), che la tiene
  a ±150 unità dal portatore, fuori dalla scatola.
- a 5, dove `attaccaArea` è accesa, il 21,4% delle corse entra in area
  (misura storica nel cappello, `:18790-18793`) — ed è il motivo per cui a 5
  qualche cross parte e alle taglie grandi no.

### 1.5 L'imbuto della maturazione (perché 44 fotogrammi-bersaglio fanno 2 cross)

A 5, i 44 fotogrammi con bersaglio valido diventano 2 cross partiti (22:1).
Non è un difetto: è il tempo di reazione voluto — il bersaglio deve esistere
all'apertura dell'anticipo E restare valido 0,11 s dopo, alla maturazione
(`:19641-19645`), e non si cambia idea su un tiro già caricato
(`:19637-19638`). Va però tenuto nel conto delle attese: le cure A e B
allargano la BASE dell'imbuto, non l'imbuto. Se dopo A+B i
fotogrammi-bersaglio crescono e i cross no, il collo è qui, e si dichiara
prima di toccarlo.

---

## 2. Il meccanismo proposto — tre stadi, ognuno misurato prima del successivo

### STADIO A — il taglio in area lo fa la punta (taglie 7 e 11)

La bocciatura che ha spento `attaccaArea` a 7/11 colpiva l'ELEZIONE: «il più
avanzato» era spesso il rifinitore, e togliendolo alla manovra i tiri
calavano. La punta no: è l'uomo che il gioco tiene già davanti apposta («NON
RIENTRA», `:19332`), il suo prezzo sul punteggio del passaggio è già pagato
(`:19339-19342`: sopra 0,74 il punteggio non la sceglie comunque). La cura
minima è vincolare l'elezione alla punta invece di estenderla a chiunque:

```
function attaccaArea(p, carrier){
  /* taglie 7/11: il taglio lo fa SOLO la punta — l'uomo gia' davanti.
     (RETTIFICA della riga «if(TAGLIA>=7) return false»: la bocciatura
     misurata del 26 agosto colpiva l'elezione del piu' avanzato, che
     rubava il rifinitore. La punta non fa manovra per definizione.) */
  if(TAGLIA>=7 && ruoloDi(p)!=='punta') return false;
  ...il resto della funzione INVARIATO...
  /* a 5 l'elezione resta quella di sempre; a 7/11 il candidato e' uno,
     quindi l'elezione lo conferma e l'isteresi non cambia significato */
}
```

Una riga cambia (la guardia `:18877`), tutto il resto — condizione di metà
campo offensiva (`CROSS_CORSA=0,58`), destinazione `puntoCross`, cronometro
`CROSS_CORSA_T=0,60`, esclusione dell'ultimo uomo — resta com'è. La
destinazione è il secondo palo, cioè DENTRO la scatola che `crossBersaglio`
chiede. E a taglia 5 lo stadio A non cambia un bit: la guardia nuova morde
solo da `TAGLIA>=7`, e a 5 la funzione esegue le stesse righe di oggi.

Perché non basta da solo (e quindi serve B): a 7 il taglio arriva da distanze
200-450 contro una finestra [247, 423] — la metà corta resta fuori; a 11 da
300-600 contro [267, 386].

### STADIO B — il volo su misura del bersaglio (tutte le taglie)

Oggi `crossFinestra` assume T=0,75 per tutti e ne deduce un pavimento
artificiale. La cura: il volo si calcola PER CANDIDATO, con lo stesso clamp
di `doCross`, rifatto all'inverso. Tre iterazioni bastano perché c varia al
massimo del 4,23% su tutta la corsa di T (misurato oggi sulle costanti del
file: 4,23% a taglia 5, 3,13% a 7, 2,24% a 11):

```
/* il volo di un cross che deve ATTERRARE a distanza d: lo stesso conto
   di doCross (:14904), all'inverso. Nessun sorteggio. */
function crossVolo(d){
  const K = Math.max(0.001, TIRO_ATTR);
  let T = L14_T1, dA = d;
  for(let i=0;i<3;i++){                       // 3 giri fissi: costo noto
    const c = (1-Math.exp(-K*T))/(K*T);       // strada vera / mira
    dA = d/c;
    T = clamp(dA/430, L14_T0, L14_T1);        // LO STESSO clamp di doCross
  }
  return { T, dA, arrivo: (dA/T)*Math.exp(-K*T) };
}
```

E `crossBersaglio` diventa (differenze segnate):

```
function crossBersaglio(p, opGoalX){
  const t=p.team, F=crossFinestra();          // F.dMax come oggi
  let scelto=null, meglio=1e9;
  for(const q of ...compagni di movimento...){
    let T=CROSS_TVOLO;
    let qx=q.x+q.vx*T, qy=q.y+q.vy*T;
    let d=len(qx-p.x, qy-p.y);
    if(d<GOAL_H || d>F.dMax) continue;        // <-- pavimento GOAL_H, non piu' dMin
    const volo=crossVolo(d);                  // <-- il T vero di QUESTO cross
    if(volo.T<CROSS_TVOLO){                   // cross corto: si riproietta col T vero
      T=volo.T; qx=q.x+q.vx*T; qy=q.y+q.vy*T; d=len(qx-p.x,qy-p.y);
      if(d<GOAL_H) continue;
    }
    if(!dentroArea(t,qx,qy)) continue;
    if(crossPortiereCopre(t,qx,qy,T)) continue;      // <-- T passa
    const nx=(qx-p.x)/d, ny=(qy-p.y)/d;
    if(!crossVarcoLibero(p,nx,ny,volo.dA,T)) continue; // <-- T passa
    const dg=Math.abs(opGoalX-qx);
    if(dg<meglio){ meglio=dg; scelto={q,nx,ny,mira:[p.x+nx*volo.dA, p.y+ny*volo.dA]}; }
  }
  return scelto;
}
```

Il pavimento nuovo è `GOAL_H` (150/172/196): un cross più corto della luce
della porta è un appoggio, e l'appoggio esiste già. Non è un numero nuovo:
è la stessa soglia di fascia che `crossCPU` usa a `:19616`, e scala già col
passo. Le finestre diventano:

| taglia | finestra oggi | finestra stadio B | larghezza | in % di FW |
|---|---|---|---|---|
| 5v5 | [223, 479] | [150, 479] | 329 | 28,6% |
| 7v7 | [247, 423] | [172, 423] | 251 | 15,6% |
| 11v11 | [267, 386] | [196, 386] | 190 | 8,3% |

**Proprietà che va scritta perché il verificatore la controlli**: per ogni
d ≥ dMin di oggi, `crossVolo` converge al primo giro a T=0,75 e dA=d/c(0,75),
IDENTICO al conto attuale — sui bersagli che oggi passano la mira non cambia
di un bit. Cambiano (i) i bersagli NUOVI sotto il vecchio dMin e (ii) la
SCELTA quando un bersaglio nuovo è più vicino alla porta di uno vecchio
(`:19590-19591`): il secondo effetto è voluto — è la cura, non un effetto
collaterale — ma rende diverse anche partite in cui il cross partiva già.

I due cancelli a valle si aggiornano con un argomento in più, stessa formula:
- `crossPortiereCopre(team, lx, ly, T)`: `corsa=GK_SPEED*T` (`:19521`);
- `crossVarcoLibero(p, nx, ny, dA, T)`: `t0` e `varco` con T al posto di
  `CROSS_TVOLO` (`:19540-19541`). Su un cross corto il varco richiesto è
  PIÙ CORTO (il pallone sale prima), quindi il cancello resta fedele alla
  fisica che protegge.
- `crossFinestra()` perde dMin e tiene dMax (che vive nel regime T=0,75,
  dove la formula di oggi è esatta).

### STADIO C — solo se l'11 resta sotto i 2 cross: la raccolta scala col campo

Se dopo A+B il banco dice che a 11 i cross restano sotto il bersaglio per
colpa di dMax (la sonda alle porte, rigirata, lo dice per nome), l'ultima
costante assoluta si mette in scala come l'attrito: `dMax` calcolato con
`CROSS_RACC/ATTR_K` (420·FW/1150 — `ATTR_K` è globale, riassegnato in
setTaglia `:27774`). Numeri, calcolati oggi:

| taglia | dMax oggi | dMax con RACC·(FW/1150) | lancio a quel dMax | arrivo |
|---|---|---|---|---|
| 5v5 | 479 | 479 (identico al bit) | 923 | 420 |
| 7v7 | 423 | 592 | 1.032 | 588 |
| 11v11 | 386 | 772 | 1.245 | 840 |

Con gli occhi aperti su cosa si compra: la ricezione DI TESTA non ha tetto di
velocità (`colpoDiTesta`, riletto oggi, `:17366`) quindi il cross forte che
ARRIVA si gioca; quello che NESSUNO tocca atterra sopra le 420 e rimbalza sui
corpi (`:17552`) — palloni persi più cattivi, ed è calcio, ma va misurato
(`_eventi`: contesi e cambi di possesso). L'alternativa col tappo
«proiettile» a 860 darebbe dMax 446/493/533, ma RESTRINGEREBBE il 5v5 di oggi
(479 → 446): non si adotta a tavolino; se il banco dello stadio C mostrasse
palloni-razzo illeggibili, si rifà il conto con quel tappo e si rimisura.

### Che cosa NON si tocca

`doCross` (e con lui il cross del dito e la guida `:14321`), `kickBall`,
`colpoDiTesta`, la fisica del pallone, `L14_T0/L14_T1`, `zonaTiro`, i due
rami di `aiCarrier` e le loro precedenze (il cross non ruba il tiro: le
guardie `:19692` e `:19806` restano com'è), `PASS_CAR` e la riverifica alla
maturazione.

---

## 3. Tutti i punti del codice da toccare

| # | dove (riga di oggi) | nome | stadio | cosa cambia |
|---|---|---|---|---|
| 1 | `:18877` | `attaccaArea`, la guardia `TAGLIA>=7` | A | diventa `if(TAGLIA>=7 && ruoloDi(p)!=='punta') return false;` — e il commento-lapide sopra (`:18834-18876`) si RETTIFICA con la data, non si cancella: la sua misura resta vera per l'elezione del più avanzato |
| 2 | `:19486-19494` | blocco `CROSS_*` + `crossFinestra` | B | nasce `crossVolo(d)` accanto; `crossFinestra` perde dMin (resta dMax); il cappello del blocco (`:19481-19485`) si riscrive: «tutta dedotta» resta vero, cambia la deduzione |
| 3 | `:19576-19594` | `crossBersaglio` | B | pavimento `GOAL_H`; `crossVolo` per candidato; riproiezione del compagno a T; passa T ai due cancelli; pseudocodice al §2.B |
| 4 | `:19511` | `crossPortiereCopre` | B | quarto argomento `T` (default `CROSS_TVOLO`); `corsa=GK_SPEED*T` a `:19521` |
| 5 | `:19538` | `crossVarcoLibero` | B | quinto argomento `T`; `:19540-19541` usano T |
| 6 | `:19488` (usato in `:19493`) | `CROSS_RACC` nel conto di dMax | C (condiz.) | `CROSS_RACC/ATTR_K` al posto di `CROSS_RACC`; a taglia 5 `ATTR_K=1` e il conto è identico al bit |
| 7 | commenti con misure superate | `:19567-19570` (124 cross/200 partite), `:19681-19686`, `:19801-19803`, cappelli di `_g-aereo.js` e `_q-cross.js` | A+B | rettifica in chiaro con fonte e data (regola degli studi a edizioni): dopo la cura quei numeri descrivono la versione di prima |

Nessun altro punto: `crossCPU` non cambia di un carattere (le sue due
chiamate a `crossBersaglio` restano, riverifica compresa).

---

## 4. L'effetto sulla legge dei sorteggi — dichiarato, punto per punto

**Le funzioni toccate non pescano sorteggi.** Verificato oggi, a mano, su
tutto il perimetro: `crossFinestra`, `crossBersaglio`, `crossPortiereCopre`,
`crossVarcoLibero`, `crossCPU`, `doCross`, `kickBall` (`:13838-13990`),
`anticipa`/`maturaAnticipi` (`:15489-15522`), `colpoDiTesta`
(`:17366-17394`), `attaccaArea` (`:18833-18904`): zero `dado()`, zero
`rnd()`. La cura non aggiunge e non toglie nemmeno UNA estrazione dentro di
sé.

**Eppure il numero di chiamate a `dado()` nei percorsi a seme fisso CAMBIA**,
e va detto dove e perché:

1. **Stadio A, cambio diretto e immediato**: quando `attaccaArea` torna vero
   per la punta, `aiDecide` esce PRIMA dello smarcamento al fianco
   (`:19266`), che contiene `rnd(-30,30)` (`:19275`). Una estrazione in meno
   per ogni ripianificazione in cui la punta taglia invece di offrirsi. A 7 e
   a 11 succede dal primo possesso in metà campo offensiva: **la sequenza
   diverge quasi subito in ogni partita a seme fisso**. A taglia 5 lo stadio
   A da solo non sposta nemmeno un'estrazione (la guardia non morde).
2. **Stadio B (e A), cambio indiretto**: quando `crossCPU` torna vero in un
   fotogramma dove prima tornava falso, `aiCarrier` ritorna a `:19694` PRIMA
   dei sorteggi del ramo tiro (`:19737 dado()<D.shotFreq`, `:19738 r=dado()`,
   `:19784` il dado nella durata della carica) e dei due del ramo passaggio
   (`:19812`, `:19814`). E ogni cross partito cambia possesso, punteggio,
   rimesse: da lì in poi la partita è un'altra.

Che cosa resta vero, e i banchi lo devono confermare:
- **il determinismo non si rompe**: stessa versione + stesso seme + stessi
  comandi = stessa partita (`dado()` `:8349` resta l'unica porta del caso;
  `seme.js` e `_q-determinismo.js` devono restare verdi sulla versione
  nuova).
- **le sfide e i replay registrati PRIMA della cura non si rigiocano uguali
  sulla versione nuova** (i due `SEME.accendi` del gioco: `:40001` la sfida,
  `:40135` il replay). Il guardiano esiste già: il punteggio dichiarato
  viaggia col nastro (`G.sfida.atteso`, `:40143-40145`) e chi guarda un
  replay che non torna viene avvisato. La pubblicazione di questa cura è un
  cambio di versione del motore e va trattata come tale nel verbale di
  pubblicazione.
- **i confronti appaiati al bit attraverso questa modifica non valgono**
  (lo stile `_appaiato.js`): prima/dopo si confrontano a DISTRIBUZIONI
  (100 partite, §5), non a partite.

Banchi e fotografie da rigenerare dopo la cura (nuova edizione, con data,
accanto alla vecchia — non al posto):
- la fotografia nel cappello di `_eventi.js` (già dichiarata «a edizioni»);
- `_g-aereo.js` (la tabella del §1.1 diventa storia);
- `_q-aereo.js`, banchi D/E (partite vere a semi fissi);
- `_q-cross2.js` (124 partiti / 97 in area / 74 raccolti / 69 conclusi / 22
  in rete su 200 partite — numeri citati anche NEI COMMENTI del gioco, vedi
  riga 6 della tabella §3);
- `equita.js` (le 10 partite del cancello escono diverse: il cancello deve
  ripassare, non restare uguale).

Banchi che NON si rigenerano: `_q-cross.js` (misura `doCross` a mano, che
non si tocca: deve uscire IDENTICO, ed è la guardia che lo prova),
`collaudo.js`/`misura.js` (scene costruite; si girano e basta),
`seme.js`/`_q-determinismo.js` (autoconsistenti per costruzione).

---

## 5. Il piano di misura — prima/dopo, coi banchi di strumenti/

### 5.0 PRIMA (sul file di oggi, da rifare il giorno del lavoro se il file è cambiato)

```
node strumenti/_g-aereo.js                                    # fatto oggi: tabella §1.1
node strumenti/_eventi.js --partite 100 --json fuori/aereo-prima-5.json
node strumenti/_eventi.js --partite 100 --taglia 7  --json fuori/aereo-prima-7.json
node strumenti/_eventi.js --partite 100 --taglia 11 --json fuori/aereo-prima-11.json
node strumenti/_q-aereo.js                                    # lo stato dei cancelli aerei
node strumenti/_q-cross.js                                    # 7/7 dentro, gittata ≤2%: la base
sonda alle porte (§7)                                         # fatto oggi: tabella §1.4
```

Le FORBICI sono i numeri che escono da `--json` di oggi, non quelli del 18
agosto scritti nel cappello di `_eventi.js` (quella fotografia ha cinque
commit sopra). Forbici proposte sul confronto `--contro`, per taglia:
- tiri per partita, mediana: entro **±2**;
- gol nei 90 s, mediana: entro **±0,4**;
- partite 0-0: **non peggiora** di più di 10 punti (a 7 e a 11 un CALO dello
  0-0 è il guadagno cercato, non una rottura — si legge nel verso);
- parate: entro ±1;
- e il pavimento assoluto resta `_eventi.js --cancello` (tiri ≥4, momenti ≥2,
  0-0 ≤50%, eventi/min ≥30).

### 5.1 Dopo lo STADIO A (solo la guardia della punta)

```
node strumenti/_g-aereo.js               # la punta entra in area? i cross a 7 si muovono da 0?
sonda alle porte                         # «nessuno in area» deve crollare a 7/11
node strumenti/_q-cross2.js --partite 120 --taglia 7   # il protocollo della vecchia bocciatura,
node strumenti/_q-cross2.js --partite 120 --taglia 11  # stesso: :18845-18851 — tiri e momenti/min
node strumenti/_eventi.js --partite 100 [--taglia] --contro fuori/aereo-prima-*.json
```

Verdetti attesi (ipotesi da misurare, non promesse): a 7/11 compaiono
fotogrammi con compagno in area; a 7 i primi cross; **i tiri NON calano oltre
forbice** — il punto esatto su cui la versione «più avanzato» era stata
bocciata (tiri −2,97 a 7). Se i tiri calano anche con la sola punta, lo
stadio A si restringe (il taglio parte solo col portatore LARGO,
`|carrier.y−FH/2| ≥ GOAL_H`) e si rimisura.

### 5.2 Dopo lo STADIO B (finestra a volo variabile)

```
node strumenti/_q-cross.js               # DEVE uscire identico: doCross non si tocca
node strumenti/_g-aereo.js               # bersaglio: cross 2-6 a partita, TUTTE le taglie
node strumenti/_q-aereo.js               # A ≥30% resta verde; E: gol di testa ≤40%; violaTetto=0
node strumenti/_q-cross2.js --partite 200            # arrivati/conclusi: il cross ARRIVA?
node strumenti/_eventi.js --partite 100 [--taglia] --contro fuori/aereo-prima-*.json
node strumenti/equita.js --partite 10    # il cancello dell'equità ripassa
node strumenti/prestazione.js --contro HEAD   # 3 exp per candidato a fotogramma: misurare, non supporre
node strumenti/seme.js                   # il determinismo della versione nuova con sé stessa
node strumenti/tutti.js                  # la batteria intera, in chiusura
```

Il bersaglio della voce: **cross CPU per partita in [2, 6] a 5, a 7 e a 11**
(`_g-aereo.js`, 6 partite/taglia, semi 20260803..). Sopra 6 si stringe il
pavimento (GOAL_H → 1,3·GOAL_H, numeri già in tabella); sotto 2 si interroga
la sonda alle porte e si decide con la porta che boccia in mano — se è dMax
a 11, stadio C.

### 5.3 Eventuale STADIO C

Stessa batteria del 5.2, più attenzione dedicata in `_eventi --contro` a
contesi, cambi di possesso e palloni vaganti (i cross persi sopra le 420
rimbalzano sui corpi), e in `_q-aereo` al banco E (gol di testa ≤40% — la
soglia c'è già, `G_TESTA=0,40`).

### 5.4 L'occhio, in coda ai numeri

Un fermo-immagine ogni tanto non è un banco, ma il difetto era nato da
giurie che GUARDANO: dopo B (e C) qualche partita a occhio a 7 e a 11 —
il traversone si legge? il pallone-razzo esiste? — e le impressioni si
scrivono nel referto come impressioni, separate dai numeri.

---

## 6. I rischi, coi loro numeri e le loro uscite

1. **Il collo vero a 7/11 potrebbe non essere solo l'area.** La sonda di oggi
   dice «nessuno in area», ma non dice che con l'area occupata il resto della
   catena regga: il portiere copre l'ellisse vera su un'area 136×265, il
   varco chiede un corridoio largo `P_R+B_R−2`. USCITA: la sonda alle porte
   dopo lo stadio A dà la porta successiva per nome; si cura quella, non
   un'ipotesi.
2. **La punta in area può costare tiri**, come costò l'elezione del più
   avanzato (−2,97 a 7, misurato, `:18852-18856`). MITIGAZIONE: la punta non
   è il rifinitore (il punteggio del passaggio la sconta già sopra 0,74).
   USCITA: forbice tiri ±2 su `_eventi`; se rompe, condizione «portatore
   largo» e rimisura; se rompe ancora, lo stadio A si dichiara fallito e la
   voce si spezza (l'occupazione dell'area è un'altra cura).
3. **Cross-spam**: `crossCPU` si guarda a ogni fotogramma e la finestra
   triplica in larghezza a 11. MITIGAZIONE già nel codice: il cross parte
   solo con bersaglio in area+varco+portiere battuto, e il pallone parte (il
   possesso finisce: autolimitante); `aiActT=0,30` dopo ogni tentativo.
   USCITA: se >6 a partita, pavimento a 1,3·GOAL_H.
4. **La mira dei cross corti** (riproiezione a T invece che a 0,75): scarto
   massimo del compagno ~20 unità in 0,09 s, contro una portata di raccolta
   di 34 per il destinatario e la corsa di `aiDecide` verso `puntoTesta`
   (`:19065-19076`). USCITA: `_q-cross2` (raccolti/partiti non deve
   scendere).
5. **Il costo per fotogramma**: 3 `exp` per candidato per fotogramma nel
   ramo del portatore CPU. Sono decine di operazioni, non migliaia, ma sul
   banco senza scheda grafica il sedicesimo di secondo si è già perso per
   meno. USCITA: `prestazione.js --contro HEAD`, che è nella batteria.
6. **Stadio C**: lanci fino a 1.032/1.245 u/s — sopra la linea proiettile dei
   tiri (860). Già oggi il 5v5 lancia a 923 al limite della finestra, quindi
   non è un tabù nuovo, ma a 11 il pallone coprirebbe un terzo di campo in
   tre quarti di secondo. USCITA: stadio C si apre SOLO su verdetto della
   sonda (dMax nominato come porta che boccia), e il tappo a 860 resta
   pronto con i suoi numeri (446/493/533) se l'occhio del §5.4 boccia.
7. **I commenti che citano misure superate** (`:19567`, `:19681`, `:19801`,
   cappelli dei banchi): dopo la cura direbbero il falso. USCITA: riga 6
   della tabella §3 — rettifica in chiaro con data, mai cancellare.
8. **Nastri vecchi**: sfide e replay registrati prima della cura non
   tornano (§4). USCITA: bump di versione nel verbale di pubblicazione; il
   guardiano `G.sfida.atteso` avvisa già chi guarda.

---

## 7. Appendice — la sonda alle porte (per rifare la tabella §1.4)

Vive fuori dal repo (è diagnosi di progetto, non cancello):
`%LOCALAPPDATA%/Temp/claude/.../scratchpad/_sonda-cross-porte.js` — 4 partite
per taglia, semi 20260803..06, passo 1/60. Chi la rifà da zero rispetti le
tre regole pagate dai banchi cross:
1. **passo 1/60** (`t.simulate(1/60)`): a passi lunghi la fisica è un'altra
   (la lezione scritta nel cappello di `_g-aereo.js`);
2. conta con le **funzioni globali del gioco** (`crossFinestra`,
   `dentroArea`, `crossPortiereCopre`, `crossVarcoLibero`), non con copie:
   nessuna di loro pesca sorteggi (verificato §4), quindi la partita
   misurata è la partita non misurata;
3. i cross partiti si leggono da **`G.stats.cross`**, mai da `crossTo`
   (la rettifica del 29 agosto nel corpo di `_g-aereo.js`, `:142-161`).

Se questa sonda serve anche DOPO la cura (e serve: è l'uscita dei rischi 1 e
6), va promossa a `strumenti/_sonda-cross-porte.js` con questo stesso
cappello e la data.

---

## 8. IL VERBALE DELL'APPLICAZIONE — 1 settembre 2026

Sei toppe, ognuna misurata prima della successiva, ognuna col suo attrezzo
ancorato (`_t-aereo.js` … `_t-aereo6.js`). Il filo: ogni stadio ha aperto
una porta e la sonda ha nominato la successiva — SEI porte, non le due del
progetto.

| stadio | attrezzo | cosa | cross (5/7/11) dopo |
|---|---|---|---|
| A + B | `_t-aereo` (8 àncore) | punta in area a 7/11; volo per bersaglio, pavimento GOAL_H, T ai cancelli | 0,3 / 0,0 / 0,0 |
| A2 | `_t-aereo2` | la partenza anticipata della punta (cancello 0,58→0,75) | 0,3 / 0,2 / 0,0 |
| B2 | `_t-aereo3` | il cross sull'inserimento (CROSS_GRAZIA 0,40 sul candidato in corsa) | invariato |
| C | `_t-aereo4` | dMax in scala col campo (479/592/772) | 0,3 / 1,0 / 0,0 |
| C2 | `_t-aereo5` | in fascia la carica di tiro si abbandona per il cross con bersaglio | 0,3 / 1,2 / 0,0 |
| C3 | `_t-aereo6` | la STRISCIA CONTESA si guarda a ogni fotogramma | **1,0 / 1,0 / 0,2** |

Le misure che hanno guidato (tutte del 1 settembre, semi dichiarati):

- Dopo A+B la sonda alle porte diceva: a 7 CON BERSAGLIO 0→44 ma cross 0;
  a 11 occupazione ancora zero. La sonda della punta (nuova,
  `_sonda-punta.js` nello scratchpad) ha trovato il perché: la punta
  ARRIVA (distanza minima dal secondo palo 2-17 unità, 1.179 proiezioni
  in area) ma sta a **424-1007 unità dal crossatore contro un dMax di
  386** — la porta che lo stadio C esigeva per nome. (La previsione della
  miniera — «C improbabile» — è smentita qui dalla misura: il rimedio del
  concorrente ai cross corti non c'entra col nostro tetto lungo, che è un
  difetto di scala tutto nostro, gemello del tappo a 500.)
- Dopo C, a 11: CON BERSAGLIO 0→14, portiere 0, varco 0 — e cross 0.
  L'imbuto contato dai CONSUMATORI (crossBersaglio/crossCPU/doCross
  avvolti): a 5, trova 8 · apre 1 · fuoca 1 — e gli «11 rifiuti per
  carica» erano in gran parte le ri-consultazioni durante la pendenza
  dell'anticipo (clip 'cross'), un artefatto del contatore che va
  dichiarato; il rifiuto VERO era la carica di tiro in fascia (7v7:
  trova 1, apre 0). Da lì C2.
- Dopo C2, i 14 fotogrammi buoni a 11 restavano nella STRISCIA CONTESA
  (in fascia ma dentro zonaTiro), dove il ramo per-fotogramma non entrava
  e il ritmo delle decisioni non coincideva mai: crossBersaglio consultata
  ZERO volte a segno nel gioco vivo. Da lì C3, che ha acceso tutte e tre
  le taglie.

### 8.1 Il residuo, dichiarato

Il bersaglio della voce — **[2, 6] cross a partita** — NON è raggiunto:
siamo a 1,0 / 1,0 / 0,2. E «con uomo» (entrate in fascia di testa con un
uomo a portata) resta **0,0**: il pallone cade dove l'uomo non è ancora.
Le porte residue hanno il nome: (1) la FREQUENZA delle finestre —
l'appuntamento fra portatore crossabile e uomo qualificato è raro perché
anti-correlato (quando l'ala è pronta la punta non è arrivata; quando
arriva, l'ala ha già scaricato); (2) l'ARRIVO nel tempo della testa. Sono
ritmo tattico (tenuta del portatore, più corse, tempi dell'inserimento),
non cancelli: è un'altra cura, da progettare a parte — coi semi della
miniera già raccolti (il bersaglio-posizione di SearchPosition, il duello
aereo a punteggio). La voce di registro nuova è #84.

### 8.2 Nastri e versione

Vale il §4: le partite a seme fisso divergono per progetto, i replay
registrati prima non si rigiocano uguali, il bump di versione va nel
verbale di pubblicazione insieme a quello della #82.
