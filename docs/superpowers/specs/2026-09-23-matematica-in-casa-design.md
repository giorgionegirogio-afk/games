# LA MATEMATICA IN CASA — voce #143, spec

23 settembre 2026 · merge-base `a2607d0` (`main`) · ramo `voce-143-matematica-in-casa`

## 1. IL DIFETTO

Il cantiere #141 ha misurato che **Chromium (V8), WebKit (JavaScriptCore) e
Firefox (SpiderMonkey) non producono la stessa partita**: con lo stesso seme,
**8 semi su 8** divergono, tutti **al primo secondo**, con punteggi e conteggi
di sorteggi diversi (`strumenti/_q-motori.js`, prova B). La causa e' nella
norma, non in un difetto: ECMA-262 lascia le funzioni trascendenti
«implementation-approximated», cioe' due motori conformi possono dare l'ultimo
bit diverso sullo stesso `Math.sin`. Misurato su 200 valori: `hypot` 100-103,
`atan2` 24, `exp` 2-21, `tan` 9, `sin` 7, `log` 6, `cos` 3. `pow` e `sqrt`
danno 0 — IEEE-754 obbliga `sqrt` a essere correttamente arrotondata.

Il **#142** ha curato l'**accusa ingiusta** che ne derivava in produzione (il
nastro dichiara l'impronta del motore, il giudice si astiene, la staffetta apre
il browser giusto). E' un **ripiego dichiarato tale nel suo stesso verbale**:
oggi un nastro di iPhone si verifica solo se chi giudica ha un WebKit, e il
**lockstep dell'onda E resta impossibile**.

Questo cantiere e' la cura vera: **rendere la simulazione bit-identica su ogni
motore**, riscrivendo le trascendenti con sole operazioni che IEEE-754 obbliga
a essere correttamente arrotondate.

## 2. IL PERIMETRO — la decisione piu' importante, e si misura

Il gioco chiama `Math.sin` 161 volte, `Math.cos` 105, `sqrt` 45, `exp` 45,
`hypot` 34, `pow` 30, `atan2` 27, `tan` 3, `log` 2 — **452 siti eseguibili** in
tutto (contati da `strumenti/_143-siti.js`, che salta commenti e stringhe: una
grep conterebbe anche i verbali che *parlano* di `Math.hypot`).

**Non tutte contano.** Conta cio' che entra nella SIMULAZIONE, non nel DISEGNO.
E non si deduce dal nome della funzione che contiene la chiamata: la cottura
delle tele dentro `startMatch` **consuma il generatore** (voce #98), quindi una
trascendente «di grafica» puo' spostare un sorteggio e quindi un gol. Si misura,
in due modi indipendenti (`strumenti/_q-perimetro.js`):

- **la popolazione**: ogni sito eseguibile diventa `(__hit(id),Math.f)(` — la
  virgola restituisce la funzione, il valore non cambia di un bit — e si guarda
  quali si accendono nella cottura, nel passo e nel disegno;
- **la sostituzione sporca**: si sostituisce UNA funzione con una che
  restituisce un valore leggermente diverso e si guarda se **l'impronta della
  partita** cambia.

La forza dello sporco e' parte della spec, perche' la prima versione ha
sbagliato: **+1 ulp su ogni valore** dava 0 semi cambiati su 3 per tutte e sei
le funzioni, cioe' avrebbe assolto l'intero perimetro. Uno scarto sistematico si
semplifica nelle differenze e nei rapporti che il gioco fa subito dopo. Lo
sporco giusto imita i motori veri: **meta' dei valori, meta' in su e meta' in
giu'**, scelti da una funzione dei bit del valore — deterministico, come un
motore diverso. La seconda forza (**1e-9 relativo**) esiste contro il falso
negativo. E le chiamate si CONTANO: una funzione mai chiamata non e' «fuori dal
perimetro», e' non misurata.

## 3. LE SOGLIE, scritte prima dei banchi

- **SOGLIA-MOTORE** (`_q-motori.js`, prova B): **tutti i semi provati
  concordi** fra Chromium, WebKit e Firefox. Oggi 0 su 8. Deve diventare 8 su 8,
  e si conferma a 20.
- **SOGLIA-CASA** (`_q-casa.js`, prova C): le funzioni in casa danno gli
  **stessi bit** sui tre motori, su **tutti gli argomenti veri** raccolti da una
  partita.
- **SOGLIA-ULP** (`_q-casa.js`, prova U): lo scarto fra la casa e la nativa,
  sul dominio vero, **<= 4 ulp**. Serve contro la funzione «uguale ovunque ma
  storta», che passerebbe la SOGLIA-CASA e cambierebbe il gioco piu' della cura.
- **SOGLIA-DOMINIO** (`_q-casa.js`, prova D): nessun argomento vero arriva al
  tetto dichiarato della riduzione d'argomento (2^31).
- **SOGLIA-PRESTAZIONE**: `strumenti/prestazione.js --contro HEAD`, misura
  appaiata, entro la tolleranza di casa.

## 4. LA CURA

Le trascendenti riscritte in `strumenti/_143-matematica.js`, **una copia sola**,
innestata nel gioco dall'attrezzo a ancore e provata dai banchi nello stesso
testo: un banco che provasse una seconda scrittura della stessa formula
attesterebbe una funzione e ne lascerebbe girare un'altra.

Tecnica: **riduzione d'argomento esatta** (pi/2 in tre pezzi da 33 bit, cosi'
che `n*pezzo` sia esatto; `n` spezzato in tre perche' resti esatto anche per `n`
grande) piu' **polinomi minimax** di fdlibm (Sun, 1993). Tutto con `+ - * /` e
`Math.sqrt`, che la norma obbliga a essere correttamente arrotondate, piu' le
operazioni intere, esatte per specifica. `Math.pow(2,k)` e' proibita anche nel
riscalamento: 2^k si costruisce con moltiplicazioni intere.

Restano native, **per misura e non per fiducia**:

- `Math.sqrt` — IEEE-754 la obbliga. Misurato 0 differenze su 2213 argomenti
  veri fra i tre motori.
- `Math.pow` — nessuna norma la obbliga, ma misurato 0 su 3000 argomenti veri.
  Sta DENTRO il perimetro (110.786 chiamate in 90 s), quindi non e' un
  dettaglio: `_q-casa.js` ha una riga che diventa **rossa** il giorno in cui un
  motore cambiasse il suo arrotondamento, e la cura sarebbe scriverla in casa.
- `abs`, `min`, `max`, `floor`, `round`, `imul` — esatte per specifica.

**Un posto deve restare nativo per forza**: `improntaMotore()` (voce #142)
dichiara quale motore JavaScript ha calcolato un nastro, e lo fa chiamando le
sette native. Se passasse dalla casa direbbe sempre «stesso motore», cioe'
attesterebbe invece di misurare — e' il falso `_crit-motore-piatto`, nato al
#142 da questa identica trappola. Il blocco e' protetto esplicitamente
dall'attrezzo.

### 4.1 Il tetto della riduzione, dichiarato invece che scoperto dopo

La via «media» di fdlibm perde precisione col crescere dell'argomento: l'errore
e' l'ulp del residuo `n * 9.1e-11`. Fino a `|x| = 2^31` sta sotto 1.5e-17; a
`|x| = 1e17` arriva a 1e-6, cioe' la funzione smetterebbe di essere una funzione
senza dirlo. Sopra 2^31 si da' **NaN** — non un numero qualsiasi: un seno
sbagliato cammina nella fisica per novanta secondi, un NaN lo vede
`_q-invarianti` al primo passo. Il tetto non e' un'ipotesi: `_q-casa.js` misura
il piu' grande argomento che il gioco passa davvero (5.21e5, quattro ordini di
grandezza sotto) e diventa rosso se un giorno ci si avvicinasse.

## 5. PERCHE' LA SOSTITUZIONE E' TOTALE

Misurato: dei 452 siti, **53** si accendono nella simulazione, **100** solo nel
disegno, **225 non si accendono mai** in 90 s a taglia 5. Sono quei 225 a
decidere: un sito che non si e' acceso non e' innocente, e' **non misurato** —
dentro ci sono il rigore, la rimessa, il portiere che esce, la taglia 11, e i
verbi che in CPU contro CPU non escono mai. Innestare solo i 53 sarebbe
l'elenco troncato che questo repo ha gia' pagato dodici volte: verde al
cancello, e la prima partita con un rigore che ricomincia a divergere.

Il prezzo e' stato misurato **prima** di pagarlo: 269 chiamate per passo di
simulazione, 1084 per fotogramma disegnato.

## 6. MOTORE_V

Cambiare i valori delle trascendenti cambia l'esito di sequenze di comandi
identiche. La regola di casa vuole allora `MOTORE_V` a 3, e i nastri vecchi
rifiutati con causa vera invece che rigiocati storti. **Si misura** (nastri del
motore vecchio rigiocati sul curato) e si decide con la prova, non con
l'argomento.

## 7. LE RITARATURE

Cambiare i numeri del gioco muove tutte le ancore misurate. Ogni ancora
ritarata va **dichiarata con la sua ragione**, e va distinta da una
regressione misurando sull'ultimo commit. Il modello sono il #129 e il #139: il
campione cambia, la regola no.
