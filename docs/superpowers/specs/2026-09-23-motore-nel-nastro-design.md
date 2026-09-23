# IL MOTORE NEL NASTRO — voce #142, spec

23 settembre 2026 · merge-base `fc25184` (`main`) · ramo `voce-142-motore-nel-nastro`

## 1. IL DIFETTO, E PERCHE' E' UN CRITICO IN PRODUZIONE

Il cantiere #141 ha misurato che **Chromium (V8), WebKit (JavaScriptCore) e
Firefox (SpiderMonkey) non producono la stessa partita**: 8 semi su 8 divergono
al secondo 1, con punteggi finali diversi e conteggi di sorteggi diversi. La
causa e' isolata: `Math.hypot` (`CALCETTO-il-gioco.html:8710`, 33 usi) —
ECMA-262 lascia le trascendenti «implementation-approximated», e V8 sbaglia
l'ultimo bit su 100 casi su 200 rispetto a WebKit. Piu' `sin` (7/200, 160 usi),
`cos` (3/200, 104), `tan` (9/200), `exp` (2/200, 44). `pow` e `sqrt` sono
identici ovunque, perche' IEEE-754 li obbliga a essere correttamente arrotondati.

Il #141 ha letto questo come un **blocco dell'onda E** (il lockstep puro non
esiste fra telefoni di marca diversa). E' anche un **critico dell'onda D, gia'
in produzione**, e questa e' la voce che lo cura.

La catena, anello per anello:

1. il verificatore differito (`strumenti/staffetta.js`, voce #138) pesca le
   sfide a `verificata = 0` e le rigioca chiamando `window.__test.giudica`;
2. sul verdetto **NON TORNA** — l'unico che muove punti — `segna_verdetto`
   disfa `delta_a` e `delta_d`, cioe' **toglie punti a DUE persone**, alza un
   **`sospetto` che non decade mai** (a soglia 3 segrega) e chiude la riga per
   sempre (`and verificata = 0`);
3. il nastro **non dichiara il motore**: `Reg.schermo` scrive
   `this.scrivi(10, [w, h])` (`:13869`), cioe' solo larghezza e altezza;
4. quindi il giudice **non puo' accorgersene**: le sue cause sono
   `schermo-diverso`, `schermo-ignoto`, `schermo-cambiato`, e `motore-diverso`
   si riferisce a `MOTORE_V`, la versione del motore di GIOCO, non al motore
   JavaScript;
5. `staffetta.js` apre **`chromium.launch()`**, riga fissa, per tutto.

Conseguenza: **un iPhone gioca una sfida onesta, la staffetta la rigiudica su
Chromium, e il verdetto e' NON TORNA**. Fra un iPhone e un Android il motore e'
**sempre** diverso: non e' un caso raro come la barra del browser del #139, e'
la norma.

### LA MISURA, FATTA PRIMA DI SCRIVERE QUESTA SPEC

Sonda `fuori/_sonda-142b.js`, 23 settembre 2026, **8 sfide vere** registrate su
WebKit (due telefoni, server finto, autoplay, nastro passato dal server come in
esercizio), rigiudicate sui tre motori con la finestra che il nastro dichiara
(915x412, DPR 1 su tutti e tre, banco identico):

| giudice | TORNA | NON TORNA | INCOMPLETO |
|---|---|---|---|
| **WebKit** (lo stesso motore che ha registrato) | **8** | 0 | 0 |
| **Chromium** (V8) | **0** | **7** | 1 (`duello-senza-righe`) |
| **Firefox** (SpiderMonkey) | 7 | **1** | 0 |

Il critico e' confermato **e la sua forma e' peggiore dell'ipotesi**: non e'
«qualche volta», e' **sette accuse su otto** su partite oneste. L'unico nastro
che si e' salvato su Chromium si e' salvato **per fortuna** — la rigiocata era
gia' divergiuta (3-3 contro lo 0-2 dichiarato) e si e' fermata su un duello dal
dischetto di cui il nastro non aveva i comandi: un'astensione per la causa
sbagliata, non una cura.

E **Firefox accusa 1 volta su 8**: la divergenza non e' «V8 contro il resto del
mondo», e' fra tutti.

## 2. LA CURA — CI SI ASTIENE, NON SI ACCUSA

E' la dottrina del #133 (`schermo-ignoto`) e del #139 (`schermo-cambiato`):
quando il giudice non puo' sapere, dice «non lo so» e la riga resta in lista.
Un onesto non confermato non perde niente; un onesto accusato perde i punti, il
sospetto e la riga per sempre.

**NON si riscrive la matematica del gioco.** La cura vera — trascendenti scritte
in casa dalle sole operazioni IEEE-esatte (`+ - * /` e `sqrt`) — e' un cantiere
a parte, grosso, che cambia tutti i numeri del gioco e muove `MOTORE_V`. Il #141
ha misurato che **sostituire il solo `hypot` con `sqrt(x*x+y*y)` fa convergere 7
semi su 8, non 8**: serve tutto il resto. Qui si cura l'**accusa ingiusta**,
subito e a basso rischio.

### 2.1 L'IMPRONTA DEL MOTORE (riga di tipo 11)

Un tipo di riga NUOVO, come il 8, il 9 e il 10 prima di lui: un nastro vecchio
non ce l'ha e `esegui` non ha un ramo per lui.

**NON lo `userAgent`.** E' un dato personale, cambia a ogni versione del
browser, e si puo' falsificare da una console. Serve un'**impronta funzionale**:
il motore si dichiara **facendo il conto**, non dicendo come si chiama.

    per i = 1..64:   v = i * 0.7310127 + 0.13
      hypot(v, v*1.7) · sin(v) · cos(v) · tan(v)
      exp(-v*0.1) · atan2(v, v*0.37-1.1) · log(v+1)

I 448 risultati si leggono **a bit** (`Float64Array` -> `Uint32Array`: la
stampa decimale arrotonda a 17 cifre e nasconde proprio l'ultimo bit) e si
riducono con **FNV-1a a 32 bit**, che usa solo `^` e `Math.imul`, cioe' solo
operazioni intere — esatte per norma ovunque. Esce **un intero senza segno**,
dieci cifre al massimo, una riga sola nel nastro.

Le sette funzioni sono quelle che il #141 ha trovato divergenti e che il gioco
chiama davvero. `pow` e `sqrt` sono escluse APPOSTA: sono correttamente
arrotondate, quindi non separano niente e diluirebbero le altre.

**MISURA PRELIMINARE** (sonda `fuori/_sonda-142c.js`, tre corse per motore, tre
contesti freschi ciascuna):

| impronta | chromium | webkit | firefox | separa | stabile |
|---|---|---|---|---|---|
| **7 funzioni x 64 valori** | 3274447767 | 4281245088 | 1495105755 | **tutti e tre** | **si** |
| solo `pow` e `sqrt` | 1634607669 | 1634607669 | 1634607669 | **nessuno** | si |
| solo `sin` | 2862288509 | 2353381965 | 2353381965 | due su tre | si |

La riga di mezzo e' il falso `_crit-motore-piatto` gia' misurato: un'impronta di
sole funzioni correttamente arrotondate dice **sempre** «stesso motore», cioe'
attesta invece di misurare.

**SOGLIA-IMPRONTA:** l'impronta separa Chromium, WebKit e Firefox (tre valori
distinti su tre motori) ed e' identica su tre corse dello stesso motore.

### 2.2 IL GIUDICE SI ASTIENE

In `vagliaNastro`, **dopo** i controlli dello schermo (il piu' specifico vince,
e lo schermo e' una proprieta' riparabile del lettore; il motore no):

- impronta del nastro **diversa** da quella di chi giudica ->
  `INCOMPLETO / motore-js-diverso`, e il referto **porta l'impronta chiesta**,
  cosi' chi chiama puo' aprire il motore giusto (e' quel che il #133 fa con lo
  schermo);
- impronta **assente** (nastri di prima di questa cura) ->
  `INCOMPLETO / motore-js-ignoto`. Si astiene **lo stesso**: il #133 ha pagato
  in revisione esattamente questo rilievo (IMPORTANTE-1), e la ragione vale
  parola per parola — non si puo' sapere se quel nastro e' stato registrato
  dallo stesso motore, e procedere alla cieca produce accuse false in **una sola
  direzione**.

**IL PREZZO, dichiarato:** tutti i nastri gia' registrati diventano
`INCOMPLETO/motore-js-ignoto`, cioe' non piu' verificabili. **Quanti sono: non
si puo' contare da qui** — il database di esercizio non e' nel repo e la
staffetta non e' mai stata lanciata contro un Supabase vero (le sue credenziali
stanno nell'ambiente e non ci sono). Quel che si puo' misurare, e si misura, e'
l'effetto su un nastro vero: un nastro onesto senza riga 11 passa da TORNA a
INCOMPLETO. Il prezzo si paga perche' **oggi quegli stessi nastri, giudicati sul
motore sbagliato, danno NON TORNA 7 volte su 8**: l'alternativa all'astensione
non e' «verificarli», e' «accusarli».

### 2.3 LA STAFFETTA APRE IL MOTORE GIUSTO

`staffetta.js` gia' raggruppa le righe per misura di schermo e apre **un
contesto per misura**. Il raggruppamento si estende alla coppia
**(misura, impronta)** e il browser si sceglie di conseguenza: all'avvio la
staffetta chiede a ogni motore disponibile la sua impronta
(`window.__test.improntaMotore()`) e costruisce la mappa impronta -> motore.

Cosi' l'astensione non diventa una perdita di copertura ma una **complicazione
operativa** — e' esattamente il giudizio che la revisione del #133 ha dato per
lo schermo.

**SE UN MOTORE MANCA** sulla macchina che gira, le righe che lo chiedono
**restano a `verificata = 0`** e tornano al giro dopo; il referto lo grida, come
gia' fa per la finestra negata. Non si ripiega su un motore qualunque: ripiegare
sarebbe tornare al difetto che questa voce cura.

## 3. LE SOGLIE, SCRITTE PRIMA DI MISURARE

- **SOGLIA-CONDANNA** — un nastro onesto registrato su WebKit e giudicato su
  Chromium **non produce mai NON TORNA** dopo la cura (oggi: 7 su 8).
- **SOGLIA-COPERTURA** — lo stesso nastro giudicato **sullo stesso motore** da'
  ancora TORNA, 8 su 8. L'astensione non deve mangiarsi i casi buoni.
- **SOGLIA-IMPRONTA** — §2.1: separa i tre motori, stabile fra corse.
- **SOGLIA-MOTORE_V** — `MOTORE_V` resta 2, **misurato** come nei #131, #132,
  #133, #139: N nastri registrati sul gioco di prima e rigiocati sul curato,
  impronta campione per campione, punteggio e conto dei sorteggi.
- **SOGLIA-VECCHI** — i nastri senza riga 11 restano **leggibili e
  mostrabili** (`Sfida.guarda` non cambia); cambia solo il verdetto del giudice,
  e solo verso l'astensione.

## 4. I FALSI, NEL CASO PEGGIORE

Undici cantieri di fila hanno pagato in revisione la lezione «un banco che
attesta invece di misurare vale meno di niente». Quattro mutanti, ognuno
costruito per passare il piu' possibile:

1. **`_crit-motore-muto`** — il gioco SCRIVE l'impronta nel nastro (la riga 11
   c'e', il formato e' giusto, `improntaMotore` esiste) ma il giudice **non la
   guarda**. E' il difetto di oggi travestito da cura. Deve cadere sulla prova
   della condanna.
2. **`_crit-motore-accusa`** — il giudice guarda l'impronta e su divergenza dice
   **NON TORNA** invece di astenersi. E' il difetto del #133, gia' pagato una
   volta. Deve cadere sulla prova che chiede **INCOMPLETO**, non su quella che
   chiede «un verdetto diverso».
3. **`_crit-motore-piatto`** — impronta calcolata con le sole `pow` e `sqrt`,
   che sono identiche ovunque: il giudice la guarda, la trova sempre uguale, e
   procede. Prudenza apparente, cecita' vera. Deve cadere **sia** sulla prova di
   separazione **sia** su quella della condanna.
4. **`_crit-motore-pauroso`** — si astiene **sempre**, anche quando il motore
   coincide. Passa la prova della condanna a pieni voti ed e' la perdita di
   copertura mascherata da prudenza. Deve cadere sulla SOGLIA-COPERTURA.

Piu' il **controllo positivo**, la meta' che manca a quasi tutti i banchi di
falsi: il gioco **vero** passa tutte e quattro le prove.

## 5. QUEL CHE QUESTA VOCE NON FA, ED E' IL SEGUITO

- **La matematica scritta in casa.** Le trascendenti dalle sole operazioni
  IEEE-esatte, per far convergere davvero i motori invece di astenersi. E' il
  prerequisito che il #141 ha messo prima del #145. Misura del #141 da tenere
  accanto: **il solo `hypot` fa convergere 7 semi su 8**, non 8.
- **Il conto dei nastri vecchi in esercizio.** Non si puo' fare da qui (§2.2).
- **L'impronta e' una condizione NECESSARIA, non sufficiente.** Due motori con
  la stessa impronta potrebbero ancora divergere su un valore non campionato:
  resta un rischio residuo di accusa ingiusta, ridotto e non azzerato. Va detto
  invece che taciuto. La direzione dell'errore dell'impronta, invece, e' sicura
  per costruzione: se cambia senza che il motore cambi (una versione nuova del
  browser, un'architettura big-endian) si ottiene **un'astensione in piu', mai
  un'accusa in piu'**.
