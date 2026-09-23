# IL METRO DEL RITARDO — voce #141, spec

**Data: 23 settembre 2026. Ramo `voce-141-metro-ritardo`, merge-base `main` = `2e728d6`.**

**Cantiere primo dell'ONDA E. Non costruisce niente: MISURA.** Il progetto
d'architettura dell'onda sta in `docs/superpowers/specs/2026-09-23-onda-e-architettura.md`
e questa spec non lo ripete: ne esegue il §1.

## 0. La regola del committente che governa tutto

> «Lockstep prima; il server autoritativo SOLO SE LA MISURA DICE che il
> lockstep non basta.» (`_analisi/MAPPA-MANDATO.md:792-795`, 17 settembre 2026)

Quindi questo cantiere ha un solo prodotto: **un verdetto onesto**. Il banco
deve poter dire **NO**. Un banco che non puo' dire no non e' una misura, e
l'esito «NO» e' legittimo e prezioso quanto il «SI».

## 1. LE SOGLIE, DICHIARATE PRIMA DI MISURARE

**Una soglia decisa dopo e' un'opinione.** Queste sono scritte, datate e
committate PRIMA che un solo banco giri. Se una misura le costringe a
cambiare, il cambio si scrive a edizioni (in chiaro, con data e causa), non
si riscrive la riga.

### SOGLIA-MOTORE (gamba D) — la prima, e puo' fermare tutto

> Le impronte della stessa partita, stesso seme, stesso copione, devono
> essere **IDENTICHE** fra **Chromium** e **WebKit**, su **tre semi**.

Se differiscono, **NO immediato**: il lockstep puro non esiste piu' (due
telefoni veri non sono due schede dello stesso V8), l'onda E cambia forma e
il committente va avvisato prima di scrivere una riga d'altro.

*Perche' questa e' la prima:* la simulazione chiama a ogni passo trascendenti
che ECMA-262 lascia approssimate all'implementazione — `len=(x,y)=>Math.hypot(x,y)`
(`CALCETTO-il-gioco.html:8710`), `Math.pow(0.35, dt*ATTR_K)` in `updateBall`
(`:19685`). `strumenti/_q-determinismo.js` fa **un solo** `chromium.launch()` e
apre due contesti della stessa istanza: «due telefoni vedono la stessa
partita» e' oggi un'inferenza sulla parola *telefono*, non una misura.

### SOGLIA-DANNO (gamba A) — il metro deterministico

> Alla **D scelta**, rispetto a K=0, su **≥ 20 nastri** a taglia 5:
> peggioramento di **gol della squadra comandata** e di **tiri nello
> specchio** non superiore al **25%**, con la **dispersione dichiarata**.
> Oltre: **NO**.

Misure raccolte per ogni K: gol comandato, gol subiti, tiri, tiri nello
specchio, possesso, rubate, falli, e una **fedelta'** (definita in §3.2).

**Dichiarazione obbligatoria in testa al banco** (il banco mente per eccesso
di severita' senza): *la gamba A misura il CASO PEGGIORE, il giocatore che
NON si adatta. I comandi sono quelli decisi conoscendo lo stato al tick T e
vengono applicati al tick T+K. Un umano vero anticipa; il nastro no. Quindi
il numero che esce e' un **limite SUPERIORE al danno**, non l'esperienza
umana.*

### SOGLIA-VERBI (gamba B) — il verbo sotto ritardo

> Tutti e cinque i verbi (TIRA con la carica, FILTRANTE, CAMBIO, CONTRASTA,
> cross) riescono in **≥ 95%** dei tentativi alla D scelta, e la **carica del
> tiro cade nella sua finestra dolce (0,50–0,80 s) in ≥ 90%**.
> Se un verbo muore: **NO**.

Banco a tocchi veri via CDP ⇒ **tempo reale, NON ripetibile** (regola di casa,
`CLAUDE.md`): si lancia con `--ripetuto 3`, e **un solo rosso non e' una
prova**.

### SOGLIA-UMANA (gamba C) — l'unica che sa dire «ingiocabile»

> Sei partite da 90 s con K pescato **in cieco** da {0, 3, 6, 9, 12, 18}, due
> voti per partita: «quanto e' stata tua» 1-5 e «riproveresti» si/no.
> Mediana «e' stata mia» **≥ 4/5** e **zero** «non riproverei». Se l'uomo
> dice no, i numeri non contano.

**QUESTA GAMBA RICHIEDE IL COMMITTENTE E NON PUO' ESSERE ESEGUITA
DALL'IMPLEMENTATORE.** Il cantiere la **prepara** (l'aggancio `__test.ritardo(K)`,
il protocollo, lo strumento che raccoglie i voti) e la **dichiara NON
ESEGUITA**. Non si sostituisce con un'opinione, e il verdetto finale porta
scritto che cosa cambierebbe se l'uomo dicesse no.

### SOGLIA-D — quella che decide davvero

> **`D_gioco ≥ 12 tick (200 ms)`.** Non 6.

Perche' 12 e non 6: **D_rete non e' l'RTT**, e' andata singola al p95 +
dejitter + un tick di quantizzazione. Se il gioco tollera esattamente i 6
fotogrammi che `rete/LEGGIMI.md:167-170` promette, **non c'e' margine**: ogni
pacchetto sopra la mediana diventa uno stallo. I 6 fotogrammi = 100 ms di
`rete/LEGGIMI.md` sono **un numero di progetto mai misurato**, e vanno
trattati come l'ipotesi da falsificare, non come il traguardo.

**D_gioco si legge cosi':** e' il **massimo K** per cui tutte le soglie
misurabili tengono insieme. Il verdetto dichiara D_gioco e lo confronta con
12.

### SOGLIA-STALLO — dichiarata qui, verificata al #143

> Meno di **uno stallo al minuto**, e mai piu' lungo di **250 ms**.

Non si misura in questo cantiere (serve la rete): si dichiara perche' la
soglia stia scritta prima del cantiere che la verifichera'.

### Rilettura delle soglie contro il codice (23 settembre 2026)

Le sei soglie del progetto d'architettura §1.3 sono state **rilette contro il
codice prima di copiarle**. Esito: **tengono tutte**, con due precisazioni che
il codice impone e che entrano qui come parte della soglia, non come
interpretazione successiva.

1. **La traslazione del duello non e' in tick.** Un comando del dischetto non
   porta un tick: porta la coppia `(nDuello, passo)` (`Reg.duelli`, riga di
   tipo 6, `CALCETTO-il-gioco.html:13955-13965`), perche' durante un duello
   `Reg.tick` sta fermo — `Reg.passo()` gira solo dentro `step()`, e il duello
   gira in `Duel.update`. Quindi **«+K tick» per il duello significa «+K
   passi di `Duel.passo`»**, che e' la stessa durata (60 Hz) sullo stesso
   orologio. Traslare il tick di una riga di tipo 6 non ritarderebbe niente:
   sarebbe una traslazione **sorda**, ed e' esattamente il falso
   `_crit-traslazione-sorda`.
2. **Le righe di testa non si traslano.** I tipi 7 (le due rose) e 10 (lo
   schermo) sono metadati letti prima del fischio: traslarli non ritarda un
   comando, cambia la partita. Restano al loro tick.

## 2. CHE COSA SI MISURA — le quattro gambe, e nessuna basta da sola

| gamba | che cosa | ripetibile? | sa dire NO da sola? |
|---|---|---|---|
| **D** — due motori | impronta Chromium vs WebKit | si | **si, e per prima** |
| **A** — nastro traslato | danno al gioco per K | si (seme) | **si** |
| **B** — verbo sotto ritardo | i cinque verbi reggono? | **no** (tempo reale) | si |
| **C** — prova umana in cieco | «e' stata mia?» | no | si, ed e' l'unica che sa dire «ingiocabile» |

**Ordine di esecuzione: D prima di tutte.** Costa un pomeriggio e puo'
annullare l'intera onda (progetto §1.2): farla per ultima significherebbe
scoprire dopo cinque cantieri che erano lavoro sprecato.

## 3. IL BANCO — `strumenti/_q-ritardo.js`

### 3.1 Nasce ROSSO due volte

1. **A K=0 deve riprodurre il nastro esatto** — stesso punteggio, stessa
   impronta a fine tetto. Se non ci riesce, **il banco e' rotto** e non puo'
   misurare niente: esce 2 (banco esploso), non 1.
2. **A K=18 deve mostrare danno.** Se a 300 ms di ritardo il danno e' zero,
   il banco **attesta invece di misurare**, ed e' peggio di nessun banco:
   esce 3 (prova nulla).

### 3.2 La macchina, e che cosa e' gia' in casa

Non si scrive un motore nuovo. Tutto esiste:

- il riproduttore che esegue un comando a un tick dato e' **`Reg.passo()`**
  (`:13875-13888`, `while(righe[i][0] <= this.tick)`);
- il ciclo a passo fisso e' **`__test.simulate`** (`:46923-46932`);
- la rigiocata pulita, col salvataggio fotografato e rimesso, e' **`giudica(...)`**
  (`:45651`) — e il banco ne **ricalca la sequenza** (deserializza → `SEME.accendi`
  → `startMatch` → ciclo) invece di inventarne un'altra;
- il copione di dita fisso che tocca tutti i verbi e' quello di
  **`strumenti/_q-sfida.js:232-277`** (nessun sorteggio: due esecuzioni sono
  confrontabili per costruzione).

**La traslazione** e' una sola riga concettuale: per ogni riga di comando
(tipi 0,1,2,3,4) `r[0] += K`; per ogni riga di duello (tipo 6) `r[4] += K`;
le righe 7 e 10 non si toccano; `Reg.duelli` si ricostruisce dopo.

**La fedelta'** — «quanti tick il comandato fa quel che gli e' stato chiesto»:
si registra a K=0 la serie `voluto[T] = humanMove(0)` (quel che il gioco
legge dalla levetta, `:12746-12763`), e nella corsa ritardata si confronta la
**direzione di corsa effettiva del comandato** con `voluto[T]`. Fedelta' =
frazione dei tick, fra quelli in cui `|voluto[T]| > 0,2`, in cui il prodotto
scalare fra le due direzioni supera **0,7** (circa 45 gradi). A K=0 deve
valere quasi 1 per costruzione; e' il terzo modo in cui il banco si condanna
da solo.

### 3.3 I falsi che condannano il banco

Senza, non e' un banco (convenzione `_crit*`, `CLAUDE.md`). **Dieci cantieri
di fila hanno pagato questa lezione in revisione; il #140 ha trovato un falso
che passava tutte e 57 le prove.** Si costruiscono nel **caso peggiore**, non
in quello comodo:

- **`_crit-traslazione-sorda`** — la traslazione **non trasla davvero**: nel
  caso peggiore trasla le righe di testa (7 e 10) e i tick delle righe di
  duello, cioe' proprio i campi che non muovono niente, e lascia ferme le
  quattro porte. Il banco deve **bocciarlo** perche' il danno resta zero a
  K=18.
- **`_crit-traslazione-cieca`** — trasla solo i `touchmove` (tipo 1) e non i
  `touchstart`/`chiudi` (tipi 0 e 2): il ritardo c'e' ma i verbi partono in
  orario. E' il falso **gentile**, quello che mostra un po' di danno: il banco
  deve accorgersi che il danno non cresce con K come deve.
- **`_crit-ritardo-attestatore`** — mostra **zero danno a 300 ms**. Un banco
  che non vede un ritardo di mezzo secondo attesta invece di misurare.

## 4. GLI AGGANCI NUOVI NEL GIOCO (additivi, `MOTORE_V` resta 2)

Si toccano **solo via attrezzo a ancore** (`strumenti/_toppa-*.js`), mai Edit
diretto sul file da 2,5 MB.

- **`__test.ritardo(K)`** — accoda i comandi di K tick **senza rete di mezzo**.
  Serve alla gamba C (il committente gioca con un ritardo vero), alla gamba B
  (la coda davanti alle quattro porte) e **servira' comunque al #145**, dove
  il ritardo fisso D e' il cuore del lockstep.
  Forma: una coda davanti alle **quattro porte** (`:45852-45901`), avvolta
  **dall'esterno** dello stesso avvolgimento — cosi' il comando si REGISTRA
  al tick in cui **esegue**, e il nastro resta la verita' di quel che e'
  successo. Orologio proprio (`Reg.tick` sta fermo a registro spento), drenato
  all'inizio di ogni `step()`.
- **`__test.dita(dx, dy, premi)`** — inietta un comando **passando dalle
  quattro porte vere** (non scrivendo dentro `Touch5.stick`), cosi' il nastro
  lo vede. Chiude la prima rettifica documentale: **la prova C di
  `_q-determinismo` e' oggi INERTE** perche' `__test.dita` non esiste
  (verificato: nessuna chiave `dita` nel blocco `window.__test`), e quel banco
  **promette una misura che non fa**.

**`MOTORE_V` vale 2 e non deve muoversi:** i due agganci sono additivi e a
`K=0`/`ritardo` spento il gioco esegue esattamente le stesse righe di prima.
Si **misura** che non si muova invece di affermarlo.

## 5. LE DUE RETTIFICHE DOCUMENTALI (progetto §3.4)

1. **`strumenti/_q-determinismo.js` prova C inerte** — o si aggiunge
   `__test.dita` (ed e' quel che questo cantiere fa) o si rettifica a edizioni
   il commento. Con l'aggancio aggiunto, la rettifica dice **quando** la prova
   ha smesso di essere inerte e **che cosa misurava fino a ieri: niente**.
2. **`strumenti/_q-invarianti.js:425-431` dichiara INV-13/INV-14 «N/A perche'
   CALCETTO e' locale»** — INV-14 e' **gia' parzialmente vera**: l'unicita'
   della sottomissione e' garantita dal DELETE che consuma l'impegno
   (`rete/api/sfida.js:163-164`) e il nastro fa da replay. Rettifica a
   edizioni, senza cancellare il testo vecchio.

## 6. LE PORTE DEL NO

1. **Gamba D**: impronte diverse fra Chromium e WebKit → **NO**, e ci si
   ferma subito.
2. **Gamba A**: danno > 25% a D = 12 → **NO**.
3. **Gamba B**: un verbo muore, o la carica esce dalla finestra piu' del 10% →
   **NO**.
4. **Gamba C**: l'uomo dice «non riproverei» → **NO** (non eseguita qui).
5. **#143**: `D_rete(p95) > D_gioco` → **NO** (fuori da questo cantiere).

## 7. CHE COSA QUESTO CANTIERE SI RIFIUTA DI SCRIVERE

- **Un numero di rete.** Nel repo non esiste un solo RTT misurato: l'unico
  numero e' il **tetto di 8 secondi** di `Rete.chiama` (`:46065`), che e' un
  timeout. D_rete e' il **#143**, e fino ad allora l'architettura resta
  **indecisa** — che e' esattamente cio' che il committente ha chiesto.
- **Un giudizio umano al posto della gamba C.** Non eseguita e' non eseguita.
- **Un numero con la dispersione fuori soglia.** Non si trascrive da nessuna
  parte (regola di casa).

## 8. LE RETI DI SICUREZZA, a ogni compito

`_q-duello-impronta` 44/44 · `_q-giudice` 21/21 · `_q-sigillo` 14/14 ·
`_q-carta` 22/22 · `_q-amici` 23/23 · `_q-sospetto` 39/39 ·
`_q-staffetta` 42/42 · `_q-finestra` 20/20 · `_q-glicko` 58/58 ·
i quattro del #132 · `_q-rete` · `_q-sfida` · `senza-rete` · `salvataggio` ·
`rete/prove/tutte.js` 46/46.

**E la BATTERIA INTERA a OGNI compito**, a gruppi (lezione 22: cinque
regressioni trovate solo cosi').
