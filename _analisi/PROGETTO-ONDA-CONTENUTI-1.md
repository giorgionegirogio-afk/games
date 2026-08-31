# PROGETTO — LA PRIMA ONDA DI CONTENUTI

Scritto il 31 agosto 2026. Righe verificate oggi su `CALCETTO-il-gioco.html`
(41.539 righe: le righe citate dalla mappa DIFFERENZE-FC-MOBILE.md sono
invecchiate — la mappa dice `startMatch:8153`, oggi sta a 10509 — quindi ogni
numero di riga qui sotto è stato riletto stamattina, non copiato).

Mandato: profondità da concorrente. La mappa (`_analisi/DIFFERENZE-FC-MOBILE.md`,
1510 differenze, 417 «sì» + 319 «con-lavoro») dice dove il concorrente ha
ragione; questa onda sceglie **tre contenuti** col miglior rapporto
valore-percepito/rischio, che riusano il motore esistente **senza toccare la
fisica né i sorteggi dei percorsi a seme fisso**.

---

## 0. La scelta, mappa alla mano

Cinque candidati valutati. I tre scelti e i due rimandati, con le ragioni.

| candidato | valore percepito (dalla mappa) | rischio sul motore | verdetto |
|---|---|---|---|
| (b) DIVISIONI locali | altissimo: la mappa lo ripete in TRE sezioni (A «Scala competitiva permanente», riga 67-71; I «Scala a divisioni», 5375-5379; N «Divisioni competitive», 8721-8725) e risponde anche a «Cosa costa perdere» (I:5369-5373) e «Livello dell'account» (I:5393-5397) | zero: puro meta-gioco, gira a fine partita come chiudiGiornata | **ONDA 1** |
| (c) ABBANDONO con conseguenza | alto: la mappa lo isola come riga a sé (A:79-83, fattibile «sì»); l'intro del torneo PROMETTE «eliminazione diretta» (riga 3329 letta oggi) e il codice non la mantiene (37913-37926) | quasi zero: due funzioni esistenti chiamate da un punto nuovo | **ONDA 1** — ed è il prerequisito di (b): una scala si aggira abbandonando, se abbandonare è gratis |
| (d)+(e) TROFEI con condizioni vere + RECORD e statistiche profonde | medio-alto: N «Cosa succede dopo il 100%» (8751-8755), N «il catalogo è finito per sempre» (8775-8779); i due candidati sono UNO — un trofeo è una condizione sopra un contatore, e senza contatori nuovi non ci sono «condizioni vere» da aggiungere | zero: contatori a fine partita, schermate esistenti | **ONDA 1** (fusi) |
| (a) ASSALTO (partite a sole occasioni) | altissimo (A:55-59, è «un pilastro» di FC Mobile, fattibile «sì») | il più alto dei cinque: servono scenari precostruiti, cioè posare uomini e pallone in posizioni arbitrarie — `setupPlayers` (10273) e `resetKickoff` (10462) conoscono solo il calcio d'inizio; è l'unico candidato che deve mettere le mani DENTRO l'avvio della partita, con 300+ strumenti in `strumenti/` che misurano quel percorso | **rimandato a onda 2**, quando le divisioni gli daranno un posto dove versare (in FC Mobile VS Attack vale perché nutre la scala) |

Il filo che lega i tre scelti: oggi **nessuna partita pesa**. Si vince e non
si sale, si perde e non si scende (I:5372: «si incassano comunque 10 monete»),
si abbandona e si rigioca identica (A:82). I tre contenuti insieme danno al
risultato un peso che resta — che è esattamente la cosa che un giocatore
torna a difendere.

---

## 1. Diagnosi — righe vere, lette oggi

**Il meta-gioco attuale.** Tre contesti di partita: `G.matchCtx` dichiarato a
8312 e assegnato a 10616 (`'season' | 'tour' | 'friendly'`). Le ricompense
passano tutte da `applyMatchRewards()` (11288-11356): esce subito se
`G.cpu[0]` (11289, il QA cpu-contro-cpu non paga), aggiorna le otto voci di
carriera `SAVE.stats` (11296-11299), costruisce la lavagnetta `br`
(11302-11308), chiude giornata o turno (11311-11325), paga con
`addCoinsInternal` (11327) e raccoglie i premi fuori elenco con `G._brExtra`
(11294 e 11350-11353) perché la somma della lavagnetta torni al bit — il
meccanismo dell'etichetta sta in `addCoinsInternal(n, etichetta)` (11368-11373).

**La difficoltà è una preferenza, non un grado.** `SAVE.diff` si sceglie in
GIOCA e si salva (persistSave 9710, con la guardia che torneo e stagione non
la toccano); nel torneo la impone il turno (`TOUR_DIFF=[0,1,2]`, 9294), nella
stagione la forza dell'avversaria (38632). Nessun numero del salvataggio dice
«che grado hai conquistato»: `defaultSave()` (9504-9580) ha 30 chiavi lette
oggi e nessuna è una scala.

**Abbandonare è gratis e senza conferma.** `btnQuit` (markup 2903, gestore
37913-37926): spegne la pausa, chiama `abbandonaSfida()` (che spegne il seme,
37920), torna al menu. Nessun ramo per `matchCtx`, nessuna conferma, nessuna
conseguenza: il turno di torneo e la giornata restano da giocare, e si può
rigiocare la stessa partita fino a vincerla. Intanto la schermata del torneo
promette: «Otto squadre di quartiere, **eliminazione diretta**» (3329).
L'eliminazione vera esiste solo per chi perde SUL campo
(`advanceTournament(false)` → `T.out=true`, 38722).

**Il precedente di casa sui sorteggi del meta-gioco.** Il verbale dentro
`advanceTournament` (38713-38715) dichiara già la legge: le pescate di
`dado()` del dopo-partita «girano a fine partita, fuori dalla simulazione, e
nessun banco a seme fisso passa di qui». `simulaPartita` (38577-38585, dado a
38581), `newTournament` (38682) e `faiCrescereRosa` (38803-38811) pescano già
oggi in quel territorio. Il generatore è uno solo: `SEME`/`dado()` a
8344-8358, col verbale a 8340-8342 che impone di rimisurare `_eventi.js` su
cento partite a ogni tocco.

**La carriera è otto numeri e quindici trofei.** `SAVE.stats` ha 8 campi
(9573); la partita ne misura 15 (`G.stats` a 10524, quattordici voci più
`acciacchi` a 10525) e a fine partita ne butta via la maggior parte: parate,
falli, pallonetti, volée, possesso, filtranti, cross, rovesciate non entrano
nella carriera. I trofei sono 15 (`ACH`, 9302-9322), premi sommati oggi a
mano: **1.300 monete**, come dice la mappa (N:8779). Non esistono record
personali: nessun «migliore di sempre», nessuna serie, nessuna data tranne
l'albo dei tornei (38730-38740). La schermata STATISTICHE (`buildStatsUI`,
39304-39343) mostra 2 tessere grandi + 6 piccole + il conto trofei: tutto
quello che c'è.

**L'economia di riferimento.** Catalogo completo 2.660 monete (`NEGOZIO`,
9462); i quindici trofei ne ridanno 1.300; il tasso «~48 monete a partita»
sta in un commento (9451-9453) e **non è mai stato misurato** (lo dichiara
anche la mappa, N:8784-8785). Ogni taratura di premi nuovi deve partire da
questa misura mancante.

**Nota su un fatto scoperto leggendo:** `applyMatchRewards` non ha nessuna
guardia su `G.mode===2` (verificato riga per riga, 11288-11356): la partita a
due giocatori paga monete e fa crescere la rosa come una vera. Per la scala è
un buco da chiudere in partenza (v. §2), per il resto è materia di un'altra
cura.

---

## 2. Contenuto 1 — LE DIVISIONI DEL QUARTIERE

### La logica che ha senso di esistere

Una scala di NOVE gradini che resta fra le partite e non scade mai — niente
orologio, coerente con la riga di mappa che è un nostro merito (N:8793-8797:
«nessuna logica di gioco dipende dal calendario»). Si sale vincendo, si
scende perdendo, e — questa è la parte con la logica — **il gradino dice
contro chi vale la pena vincere**: dal quarto gradino le vittorie contro la
CPU FACILE non danno stelle, dal settimo nemmeno quelle contro NORMALE. Così
la difficoltà smette di essere una preferenza estetica (I:5371 della mappa) e
diventa la strada obbligata della scala; e il DURO, che oggi non ha nessuna
ragione dichiarata di esistere, ne guadagna una. Un giocatore ci torna perché
il gradino è SUO, si vede dalla bacheca, e ogni sconfitta lo minaccia.

### Il taglio esatto

**I nove gradini** (nomi nella lingua del gioco, da tarare con la direzione):
CORTILE, VICOLO, VIA, PIAZZA, RIONE, BORGO, QUARTIERE, CITTÀ, LEGGENDA DEL
CAMPETTO. Soglie di promozione: 3 stelle fino al 5º gradino, 4 dal 6º all'8º,
5 per l'ultimo. Sconfitta: −1 stella; sotto zero si retrocede d'un gradino
(con stelle = soglia−1); **nei primi tre gradini non si retrocede** (il
pavimento protegge chi impara). Pareggio: 0. Il premio di promozione è in
monete, dichiarato sulla schermata, e si paga **una volta per sempre per
gradino** (bandiera nel salvataggio): il saliscendi non è una zecca.

**Quali partite contano:** tutte le 1-giocatore contro CPU che già pagano —
amichevole, torneo, stagione — perché passano tutte da `applyMatchRewards`.
NON contano: il 2 giocatori (`G.mode===2`, esclusione esplicita — il secondo
pollice non è un avversario che misura), il QA cpu-contro-cpu (già escluso a
11289), i replay di sfida (già esclusi da `G.matchRewarded`, 11129), la
SFIDA in rete (ha già la sua classifica Elo sul server, `SAVE.rete.punti` a
9570: due scale sullo stesso gesto si contraddicono).

**Schermate:**
- una voce nuova in BACHECA (oggi due voci, 3021-3022): `DIVISIONI — la scala
  del quartiere`, con schermata gemella di TROFEI: i nove gradini in colonna,
  l'attuale evidenziato, le stelle come pallini pieni/vuoti, la regola del
  gradino scritta in chiaro («da qui le stelle si vincono solo contro il
  DURO»), il premio della prossima promozione col glifo moneta;
- nella schermata di fine partita, una riga sotto il riquadro monete
  (scritta da `endMatch` dopo la riga 11131): «STELLA GUADAGNATA · RIONE 2/3»
  oppure «STELLA PERSA» — mai muta quando la scala si muove;
- nella schermata GIOCA (3317), una riga di fondale sotto 1 GIOCATORE che
  ricorda gradino e regola corrente.

**Salvataggio:** in `defaultSave()` accanto a `stats` (9573):
`div:{ g:0, stelle:0, premi:[] }`. In `loadSave()` un blocco con la
disciplina di casa (chiavi note, `|0`, tetti: `g` 0..8, `stelle`
0..soglia(g), `premi` come bit 0/1), inserito accanto al blocco `stats`
(9685). Versione del salvataggio: resta v4 — chiave additiva, i salvataggi
vecchi la prendono dal default, come fu per `mentalita` e `pollice`.

**Testi:** la voce di bacheca, i nove nomi, le tre regole di gradino, la riga
di fine partita, il toast di promozione/retrocessione (riuso di `toast`, come
38183).

### Il meccanismo (pseudocodice minimo)

Dentro `applyMatchRewards`, dopo il blocco torneo (11325) e prima del conto
(11326) — così eredita GRATIS tutte le guardie esistenti (cpu[0], replay):

```js
const DIV_SOGLIA=[3,3,3,3,3,4,4,4,5], DIV_PREMIO=[0,20,25,30,40,50,60,80,100];
function stellaValida(diff, g){ return g<3 || (g<6 ? diff>=1 : diff===2); }

if(G.mode===1 && !G.sfidaFine){
  let d = 0;
  if(won && stellaValida(G.diff, SAVE.div.g)) d = +1;
  else if(!won && !pari) d = -1;
  SAVE.div.stelle += d;
  if(SAVE.div.stelle >= DIV_SOGLIA[SAVE.div.g] && SAVE.div.g < 8){
    SAVE.div.g++; SAVE.div.stelle = 0;
    if(!SAVE.div.premi[SAVE.div.g]){
      SAVE.div.premi[SAVE.div.g] = 1;
      addCoinsInternal(DIV_PREMIO[SAVE.div.g], 'Promozione: '+DIV_NOMI[SAVE.div.g]);
    }                       // l'etichetta entra in G._brExtra: la lavagnetta torna al bit
  } else if(SAVE.div.stelle < 0){
    if(SAVE.div.g > 2){ SAVE.div.g--; SAVE.div.stelle = DIV_SOGLIA[SAVE.div.g]-1; }
    else SAVE.div.stelle = 0;            // pavimento: nei primi tre non si scende
  }
  G._divEsito = { d, g:SAVE.div.g, stelle:SAVE.div.stelle };   // per la riga di fine partita
}
```

Zero chiamate a `dado()`: la scala è aritmetica pura sull'esito. Il premio di
promozione passa da `addCoinsInternal` CON etichetta, dentro la raccolta
`G._brExtra`: `somma(br)===gain` resta vero per costruzione (11346-11353) e
`_t-lavagnetta.js` resta il cancello.

### Tutti i punti del codice da toccare

| punto | riga (oggi) | cosa |
|---|---|---|
| `defaultSave()` | 9573 (accanto a stats) | chiave `div` |
| `loadSave()` | dopo 9685 | blocco di rilettura con tetti |
| `applyMatchRewards()` | fra 11325 e 11326 | il blocco qui sopra |
| `endMatch()` | dopo 11131 | riga stella da `G._divEsito` |
| costanti premi | accanto a 9290-9294 | `DIV_NOMI`, `DIV_SOGLIA`, `DIV_PREMIO` |
| `#bacheca` | 3021-3022 | terza voce + nuova schermata `#divisioni` |
| gestore voce | accanto a 39572-39573 | `buildDivisioniUI()` |
| schermata GIOCA | 3317 | riga di fondale col gradino |
| `window.__test` | 40776+ | nessun hook nuovo necessario: i banchi leggono `__test.save` (già usato da `_crit3-abbandona.js`) e giocano con `forceGoal`/`setTimeLeft`/`startMatch` (40830-40872) |

### Effetto sulla legge dei sorteggi

Nessuna chiamata nuova a `dado()`, su nessun percorso. Nei percorsi a seme
fisso `SEME.n` resta identico al bit: nei banchi CPU-contro-CPU
`applyMatchRewards` esce a 11289 prima del blocco; ovunque altro il blocco
non pesca. Dichiarazione da mettere nel cappello della toppa, col rimando al
verbale 8340-8342.

### Costo stimato: 4,5 giornate

0,5 taratura fine (nomi, soglie) · 1 logica e salvataggio · 1,5 schermata e
testi · 1 banco nuovo `_t-divisioni.js` · 0,5 misura del tasso monete e
taratura premi (v. §6).

---

## 3. Contenuto 2 — L'ABBANDONO HA UNA CONSEGUENZA

### La logica che ha senso di esistere

Il gioco lo promette già: «eliminazione diretta» (3329). Oggi la promessa
vale solo per chi perde onestamente; chi abbandona a metà rigioca il turno
identico, all'infinito (gestore 37913-37926, nessun ramo di contesto). Con le
divisioni questo buco diventa una voragine: si abbandonerebbe ogni partita
che si mette male, e la scala misurerebbe la pazienza, non il gioco. La
regola nuova è quella del calcio vero: **abbandonare in torneo o in stagione
vale sconfitta a tavolino, 0-3** — o il punteggio corrente se già peggiore,
perché il tavolino non deve mai essere un condono. L'amichevole resta libera:
lì il gioco non ha promesso niente.

### Il taglio esatto

**Conferma col gesto di casa:** il doppio tocco di AZZERA DATI (39496-39507:
prima pressione arma, «SICURO? tocca di nuovo»), non un dialog. Il testo del
bottone in pausa cambia col contesto: in torneo/stagione
`ABBANDONA <small>vale sconfitta 0-3</small>`; in amichevole resta
`torna al menu` (2903).

**Conseguenze, e solo quelle di contesto:** la giornata si chiude o il turno
si perde. Niente monete, niente crescita rosa, la partita NON entra in
`stats.partite`: non è stata giocata, è stata lasciata. Con le divisioni in
campo: −1 stella, come una sconfitta.

**Testi:** il small del bottone (2903), una frase nell'intro del torneo
(3329: «Abbandonare a metà vale sconfitta a tavolino») e una gemella nella
stagione (3373).

### Il meccanismo (pseudocodice minimo)

```js
// gestore btnQuit (37913), riscritto:
let quitArmato=false;                       // si disarma quando la pausa si chiude
$('btnQuit').addEventListener('click', ()=>{
  const serio = (G.matchCtx==='tour' || G.matchCtx==='season') && !G.matchRewarded;
  if(serio && !quitArmato){ quitArmato=true; /* testo: SICURO? vale sconfitta 0-3 */ return; }
  G.paused=false; hide(ui.pausa);
  abbandonaSfida();                         // com'e' oggi (37920): spegne il seme PRIMA di tutto
  if(serio){
    /* il tavolino: 0-3, salvo un campo gia' peggiore — mai un condono */
    let ga = G.score[0], gb = G.score[1];
    if(gb - ga < 3){ ga = 0; gb = 3; }
    if(G.matchCtx==='season') chiudiGiornata(ga, gb);   // 38642: chiude e simula le altre
    else advanceTournament(false);                       // 38695: T.out=true, il tabellone avanza
    G.matchRewarded = true;                 // cintura: nessun premio puo' piu' scattare
    persistSave();
  }
  Tut.stop(); playWipe(); hideAllScreens(); hide(ui.duel); show(ui.menu);
  refreshCoinVals(); setScene('menu'); Audio5.crowdLevel(0);
});
```

Nota d'orientamento per la stagione: `chiudiGiornata(golCasa, golFuori)`
riceve il punteggio dal punto di vista del giocatore, come lo passa
`applyMatchRewards` (11314: `chiudiGiornata(G.score[0], G.score[1])` —
indice 0 = giocatore, e la funzione ri-orienta da sola a 38652-38654). La
regola del tavolino: se il campo dice già una sconfitta con tre o più reti
di scarto resta il campo (0-5 non diventa 0-3: mai un condono), altrimenti
si registra 0-3.

### Tutti i punti del codice da toccare

| punto | riga (oggi) | cosa |
|---|---|---|
| gestore `btnQuit` | 37913-37926 | il ramo serio + doppio tocco |
| markup bottone | 2903 | small dinamico per contesto |
| apertura pausa | `setPaused` 37810 | scrivere il testo giusto e disarmare `quitArmato` |
| intro torneo | 3329 | la frase della regola |
| intro stagione | 3373 | idem |
| `chiudiGiornata` | 38642-38674 | NESSUNA modifica: si riusa |
| `advanceTournament` | 38695-38729 | NESSUNA modifica: si riusa |

### Effetto sulla legge dei sorteggi

L'unico punto dei tre contenuti dove `dado()` gira in un momento nuovo.
`advanceTournament(false)` e `chiudiGiornata` pescano già oggi (simulaPartita,
38581; spareggio 38720) — a fine partita giocata. Col ramo serio pescano
anche alla rinuncia. **Dichiarato**: sono le stesse funzioni, fuori dalla
simulazione, mai su percorso seminato — e l'ordine del gestore lo garantisce
due volte, perché `abbandonaSfida()` (37920) spegne il seme PRIMA del ramo
serio, quindi quei dadi girano a `SEME.on===false` e `SEME.n` non si muove
(8349-8351: a seme spento `dado()` è `Math.random` e il contatore non
incrementa). È lo stesso precedente del verbale 38713-38715. I banchi:
`_crit3-abbandona.js` esce da un'AMICHEVOLE (`startMatch(1,1,{size:11})`,
letto oggi nel banco) — ramo serio spento, il banco resta verde senza
ritocchi.

### Costo stimato: 1,5 giornate

0,5 gestore e testi · 0,5 banco nuovo `_t-abbandono-conta.js` (avvia un
torneo dai bottoni veri come fa `_crit3-abbandona.js`, abbandona col doppio
tocco, verifica: turno consumato, `T.out===true`, saldo monete IDENTICO,
`stats.partite` ferma, salvataggio scritto) · 0,5 collaudo a mano su telefono
e rifinitura del doppio tocco.

---

## 4. Contenuto 3 — I RECORD PERSONALI E LA SECONDA MENSOLA

(d) e (e) del mandato, fusi con dichiarazione: un trofeo è una condizione
sopra un contatore; senza contatori nuovi non esistono «condizioni vere» da
aggiungere, e un record senza trofeo non ha festa.

### La logica che ha senso di esistere

La partita misura quindici cose (10524-10525) e la carriera ne tiene otto
(9573): parate, falli, pallonetti, volée e tutto il resto muoiono al fischio.
La mappa lo dice due volte: «il catalogo è finito per sempre» (N:8779) e
«nessun ramo di codice è condizionato al completamento» (N:8754). I record
personali sono il contenuto a costo più basso che dà una ragione di tornare a
chi ha già tutto: il «migliore di sempre» è una soglia che ogni partita può
spostare, per sempre, senza server e senza calendario — cioè nel pieno
mandato della casa.

### Il taglio esatto

**Carriera più profonda** — `SAVE.stats` cresce di 7 chiavi, tutte alimentate
da numeri che `G.stats` già produce: `pareggi`, `cleanSheets` (porte
imbattute in vittoria), `parate`, `falli`, `serieV` (vittorie di fila,
corrente), `serieVMax`, `abbandoni` no — non si conta, sarebbe una gogna. La
rilettura è GRATIS: il blocco a 9685 rilegge per costruzione ogni chiave
numerica presente in `defaultSave().stats`.

**Record con data** — chiave nuova `record` nel salvataggio: quattro voci
fisse `{ golPartita, scartoMax, perfettiPartita, serieV }`, ciascuna
`{v, data}` con la data da `dataOggi()` (38675 — terza occorrenza di
`new Date` nel file, fuori dal ciclo di partita come le due esistenti,
coerente con la riga di mappa N:8793-8797).

**Schermata** — STATISTICHE (`buildStatsUI`, 39304) guadagna la sezione
RECORD PERSONALI sotto le tessere piccole (39326-39335): quattro tessere con
valore grande e data piccola. Con tutti i record a zero, la sezione mostra le
tessere vuote col trattino: un cruscotto, non un vuoto (stessa legge del
commento 39302-39303).

**La seconda mensola** — da 15 a 24 trofei, nove voci nuove in `ACH`
(9302-9322), tutte con `obiettivo`/`conta` sui contatori nuovi o sulla scala,
così la barra di avanzamento di `buildTrofeiUI` (39272-39275) le serve da
sola: VECCHIA GUARDIA (50 partite), CENTO RETI (100 golF), CINQUE DI FILA
(serieVMax≥5), MURAGLIA (10 cleansheets), GOLEADA (5 gol in una partita),
GUANTONE (50 parate), SCALATORE (primo gradino promosso), RE DELLA CITTÀ
(gradino 8), LEGGENDA (gradino 9 — l'ultimo trofeo del gioco, dichiarato
tale). Premi modesti, media ~40 monete: la festa è il toast, non la zecca.

### Il meccanismo (pseudocodice minimo)

Dentro `applyMatchRewards`, insieme alle righe carriera esistenti
(11296-11299):

```js
if(pari) CS.pareggi++;
if(won && G.score[1]===0) CS.cleanSheets++;
CS.parate += S.parate[0];  CS.falli += S.falli[0];
CS.serieV = won ? CS.serieV+1 : 0;
if(CS.serieV > CS.serieVMax) CS.serieVMax = CS.serieV;
aggiornaRecord('golPartita', G.score[0]);
aggiornaRecord('scartoMax',  G.score[0]-G.score[1]);
aggiornaRecord('perfettiPartita', S.perfetti[0]);
aggiornaRecord('serieV', CS.serieV);
/* trofei nuovi: stessi if degli esistenti (11329-11341) */
if(CS.partite>=50) unlockAch('vecchiaguardia');
if(G.score[0]>=5)  unlockAch('goleada');
// ...

function aggiornaRecord(k, v){
  const r = SAVE.record[k];
  if(!r || v > r.v) SAVE.record[k] = { v, data: dataOggi() };
}
```

Zero chiamate a `dado()`. I trofei nuovi passano da `unlockAch`
(38173-38186), che paga con etichetta dentro la raccolta: la lavagnetta
resta contabile.

### Tutti i punti del codice da toccare

| punto | riga (oggi) | cosa |
|---|---|---|
| `defaultSave()` | 9573 | le 6 chiavi stats nuove + chiave `record` |
| `loadSave()` | 9685 (stats: automatico) + blocco nuovo per `record` con validazione `{v,data}` | |
| `applyMatchRewards()` | 11296-11299 e 11329-11341 | contatori, record, trofei nuovi |
| `ACH` | 9302-9322 | nove voci |
| `buildStatsUI()` | dopo 39335 | sezione RECORD |
| `buildTrofeiUI()` | 39267 | NESSUNA modifica: mappa `ACH` da sola |
| `ICONS` | 8365+ | fino a nove glifi nuovi (la legge di casa: due trofei con lo stesso glifo sono indistinguibili, verbale 9297-9298) |

### Effetto sulla legge dei sorteggi

Zero chiamate nuove a `dado()`. `SEME.n` identico al bit su ogni percorso.

### Costo stimato: 3 giornate

1 contatori, record e whitelist · 1 schermata e glifi · 0,5 trofei e testi ·
0,5 banco `_t-record.js` (cinque `forceGoal` + `setTimeLeft(0)` → record
golPartita=5 con data di oggi; due partite vinte → serieV=2; una persa →
serieV=0 e serieVMax=2).

---

## 5. La legge dei sorteggi — dichiarazione d'onda

Il generatore non si tocca: `SEME`/`dado()` restano 8344-8358.

1. **Contenuti 1 e 3: zero chiamate nuove a `dado()`**, per costruzione
   (aritmetica sugli esiti). Nei percorsi a seme fisso il conto `SEME.n` per
   partita resta identico al bit — verificabile con `__test.sorteggi`
   (40827) e imposto dal verbale 8340-8342 (`_eventi.js` su cento partite,
   prima e dopo: nessun numero deve spostarsi).
2. **Contenuto 2: nessuna chiamata nuova, un MOMENTO nuovo.** Alla rinuncia
   in torneo/stagione girano `advanceTournament`/`chiudiGiornata`, che
   pescano già oggi a fine partita (38581, 38720). Il gestore spegne il seme
   prima (`abbandonaSfida()`, 37920), quindi quei dadi girano a seme spento e
   non incrementano `SEME.n` (8350-8351). Precedente dichiarato: verbale
   38713-38715.
3. **Nessun banco a seme fisso attraversa i punti toccati:** i banchi
   CPU-contro-CPU escono da `applyMatchRewards` alla riga 11289; i banchi che
   abbandonano (`_crit3-abbandona.js`) lo fanno da un'amichevole, dove il
   ramo serio è spento.

---

## 6. Piano di misura — prima e dopo, coi banchi in `strumenti/`

**PRIMA (fotografia di partenza, da registrare in `ultima-corsa.json` e in
un verbale d'onda):**

1. `node strumenti/tutti.js` — la batteria intera verde, impronta del file
   presa prima e dopo come da suo cappello.
2. `node strumenti/_q-determinismo.js` — 12 semi, prove A/B/C: 0 divergenze.
3. `node strumenti/_eventi.js` su 100 partite — distribuzione degli eventi E
   `SEME.n` per partita, conservati al bit: è il metro imposto dal verbale
   8340-8342.
4. `node strumenti/salvataggio.js` — i casi del disco.
5. `node strumenti/_t-lavagnetta.js` — `somma(br)===gain`.
6. `node strumenti/_crit3-abbandona.js` — si esce dall'amichevole.
7. `node strumenti/equita.js` — il negozio non tocca la fisica.
8. **LA MISURA CHE MANCA DA SEMPRE:** il tasso monete/partita vero, su 100
   partite CPU-contro-CPU non basta (11289 non paga) — serve un banco che
   giochi partite 1P a esiti forzati (`forceGoal` + `setTimeLeft`) e legga la
   lavagnetta: 20 partite per profilo (vittoria larga, misura, pareggio,
   sconfitta) e la media pesata. Il commento 9451-9453 dice «~48»; la mappa
   (N:8784) dichiara che nessuno l'ha mai misurato. I premi di scala e
   mensola si tarano SOLO dopo questo numero.

**DOPO (la prova che la cura cura, e che non rompe):**

- ripetere 1-7: stessi verdi, e in particolare `_eventi.js` con gli STESSI
  numeri al bit (eventi e `SEME.n`) — è il cancello sui sorteggi;
- `_q-determinismo.js` ancora 0 divergenze su 12 semi (la scala scrive campi
  nuovi in SAVE: la prova B — due pagine — copre il rischio di stato
  sopravvissuto);
- `salvataggio.js` più due casi nuovi: salvataggio v4 VECCHIO (senza `div` né
  `record`) caricato → default corretti e nessuna eccezione; salvataggio
  manomesso (`div.g=99`, `record.golPartita.v='x'`) → tetti applicati;
- `_sonda-costo-salvataggio.js` — il JSON cresce (~+250 byte sui 1.123
  misurati al verbale 37940-37942): la mediana di scrittura deve restare al
  passo minimo dell'orologio;
- banchi nuovi, che entrano in batteria in `tutti.js`:
  - `_t-divisioni.js` — sequenze di esiti a difficoltà dichiarate → gradino,
    stelle, premio pagato UNA volta, pavimento dei primi tre, gating
    FACILE/NORMALE; e la riga di fine partita presente quando la scala si
    muove;
  - `_t-abbandono-conta.js` — torneo avviato dai bottoni veri, abbandono col
    doppio tocco: turno consumato, saldo identico, `stats.partite` ferma;
    e il gemello in stagione: giornata chiusa 0-3, classifica aggiornata;
  - `_t-record.js` — record scritti solo se migliori, con data; contatori
    carriera che tornano col tabellino;
- misura di senso (non cancello): 20 partite a mano su telefono, quante volte
  la riga della stella compare e quante è giusta — il numero va nel verbale.

---

## 7. Il conto delle giornate

| contenuto | giornate |
|---|---|
| 1 — Divisioni del quartiere | 4,5 |
| 2 — Abbandono con conseguenza | 1,5 |
| 3 — Record e seconda mensola | 3,0 |
| misura di partenza (§6 punto 8) + verbale d'onda | 1,0 |
| **totale** | **10** |

Ordine di attuazione: **2 → 1 → 3**. La conseguenza dell'abbandono va in
campo PRIMA della scala (una scala senza quella regola nasce aggirabile), e i
trofei di scala («SCALATORE», «LEGGENDA») esistono solo a scala fatta.

---

## 8. Rischi

1. **L'economia si annacqua.** Trofei attuali 1.300 monete su un catalogo da
   2.660; scala (405 una tantum ai numeri proposti: 20+25+30+40+50+60+80+100)
   e mensola (~360) porterebbero il monte premi a ~2.065 contro i 1.300 di
   oggi. Mitigazione: i premi dei gradini
   alti si incassano dopo decine di vittorie DURO (per costruzione del
   gating), cioè quando il catalogo è già finito; e la taratura finale si fa
   DOPO la misura del tasso (§6.8), non prima. Se il tasso vero supera il 48
   dichiarato, i premi nuovi scendono.
2. **La retrocessione può ferire.** Il pavimento dei primi tre gradini e il
   «−1 gradino, mai di più» limitano il danno; ma il rischio di frustrazione
   su chi gioca solo FACILE resta, ed è voluto: va scritto in chiaro sulla
   schermata, non nascosto. Da provare con la giuria dei dieci minuti
   (`_analisi/PROVA-DIECI-MINUTI.md`) prima di spedire.
3. **Tensione con un merito dichiarato.** La mappa vanta «nessun azzeramento
   imposto» (I:5429-5433). La scala non ha orologio e non si azzera mai — la
   retrocessione è guadagnata sul campo, non imposta dal calendario — ma la
   distinzione va scritta nel verbale della toppa, o la prossima edizione
   della mappa ci accuserà con le nostre parole.
4. **Il tavolino sbagliato.** Se `chiudiGiornata` ricevesse il punteggio
   disorientato, la classifica registrerebbe la vittoria a chi ha abbandonato
   (l'orientamento sta a 38652-38654 e il chiamante deve rispettarlo, come
   11314). Il banco `_t-abbandono-conta.js` in stagione esiste per questo.
5. **Il 2 giocatori nella scala.** Senza l'esclusione `G.mode===1`, il
   secondo pollice diventa una fabbrica di stelle (oggi già paga monete:
   nessuna guardia in 11288-11356). L'esclusione è nel pseudocodice, e il
   banco delle divisioni deve avere il caso.
6. **Stato che sopravvive fra le partite.** La casa ha già pagato quattro
   volte questo difetto (verbali 10551-10610: `G.recT`, `possT`, `pulse`,
   `crowdSndT`). `G._divEsito` e `quitArmato` sono stato nuovo: vanno
   azzerati in `startMatch` e alla chiusura della pausa, e `_q-determinismo`
   prova B è il cancello.
7. **La batteria si allunga.** Tre banchi nuovi in `tutti.js`: il tempo
   dell'orologio è quello del cancello più lento (suo cappello), ma la
   manutenzione cresce. I tre banchi devono usare solo agganci già esposti
   (`__test.save`, `forceGoal`, `setTimeLeft`) per non allargare la
   superficie di `window.__test`.
