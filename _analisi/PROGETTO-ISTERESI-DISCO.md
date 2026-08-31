# PROGETTO — L'ISTERESI DEL DISCO (voce di lavoro #82)

31 agosto 2026. Documento di progetto: nessuna riga di gioco viene toccata qui.
Tutte le righe citate sono state rilette OGGI su `CALCETTO-il-gioco.html`
(copia di lavoro, ~41.500 righe); tutti i numeri sono misurati oggi, e dove
un numero e' del 31 agosto mattina lo si dice.

---

## 1. LA DIAGNOSI, RIGA PER RIGA

### 1.1 Il gesto che fallisce

Il cancello `strumenti/giocata.js`, giocata `contrasto` (:593-660): pallone a
un portatore avversario messo a 84 unita' dal comandato, dito che si POSA sul
disco grande (che senza possesso dice CONTRASTA), cinque spostamenti da 16 px
verso il pallone (80 px totali), 60 ms, rilascio. La catena che DEVE scattare:

- pressione → `Touch5.start` risolve l'atto sul disco vinto (:12686-12699,
  `nasceAtto` :13387-13397) e per `slide` esegue il contrasto in piedi
  (`doSlide(t,'premi')` :12704);
- trascinamento → `scriviAnello` (:13401-13407); il trascinamento e' ARMATO
  quando lo spostamento dal punto di posa supera `R_ARMA` = 22→36 px
  (:13346-13348, `rArma` :13425-13427);
- rilascio → `Touch5.chiudi`, ramo `slide` (:13069-13071):
  `if(!annulla && !G.paused && a && !a.morto && tr && tr.armato)
  doSlide(bt.t,'scivola',tr)` → `startSlide` mirata (:15663-15669).

80 px di trascinamento contro 22-36 di soglia: il gesto DEVE armare. E invece:

**Misura di oggi** (`node strumenti/_p-contrasto20.js`, stessa scena del
cancello ripetuta 20 volte, `doSlide` avvolto): **11 scivolate su 20**
(il 31 agosto mattina: 10 su 20). In tutti e 9 i gesti falliti l'elenco
delle chiamate e' `[premi]` e basta — `doSlide('scivola')` non viene MAI
chiamato — e la distanza finale dal portatore sta fra 26,1 e 58,4 unita',
cioe' sempre a ridosso della frontiera di cui al §1.3.

### 1.2 Il ri-armo che cancella l'origine

`Touch5.passo`, ciclo degli atti (:13685-13712). A ogni passo fisso, per ogni
dito su un disco, si rilegge il disco PER INDICE (:13690,
`const d=touchBtnLayout(a.t)[a.slot]`) e se il verbo offerto e' cambiato
(:13691 `if(d && d.act!==a.act)`) l'atto si ri-arma: chiude carica e posa
(:13692-13695), riscrive `a.act` (:13696) e — la riga che ci uccide —
**azzera il punto di posa sulla posizione corrente del dito**
(:13701 `a.posaX=a.x; a.posaY=a.y;` + :13702 anello rifatto).
Da quell'istante il trascinamento gia' fatto NON ESISTE PIU': al rilascio
`trascina` (:13445-13460) misura dallo posa nuova, `l` ~ 0, `armato` falso,
e il ramo `slide` di `chiudi` non chiama niente.

Il ri-armo e' nato per il furto vero («sto caricando il tiro, mi soffiano la
palla», verbale :13553-13568) e li' e' sacrosanto. Il difetto e' che scatta
per QUALSIASI cambio del verbo offerto, anche uno che si rimangia se stesso
due fotogrammi dopo.

### 1.3 Perche' il verbo offerto sfarfalla

La faccia del disco grande e' `puoTirare(t)` (:13799-13806):

```
if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4)
  return finestraRovesciata(p);
return true;
```

con `KICK_R = 26` (:4118): la frontiera e' **36,4 unita' fra pallone e
comandato**. Sotto quella distanza il disco dice TIRA **qualunque cosa dica
`b.owner`** — pallone dell'avversario compreso. E durante un contrasto vero
il pallone dell'avversario STA sotto quella distanza per costruzione: il
palleggio lo tiene 16-34 unita' davanti ai piedi del portatore
(`CARRY_DIST`/`CARRY_SPINTA` :4119-4133, inseguitore :17426-17430), e i
tocchi del palleggio (tocco sporco :17682-17703, raccolta :17704-17706,
blocchi :17567, tentativi di furto) fanno sfarfallare `b.owner` fra indice
e -1.

**Misura di oggi** (`strumenti/_p-sfarfallio.js`, scritto oggi: stessa scena
della sonda, ma a PASSO FISSO, 360 fotogrammi = 6 s, senza dita — quindi
ripetibile):

- `b.owner == -1` in **204 fotogrammi su 360 (56,7%)**, in 4 finestre da
  **333, 383, 800 e 1883 ms**;
- dentro quelle finestre la distanza pallone→ultimo toccatore arriva a
  **116,4 / 157,2 / 111,1 / 322,2 unita'**;
- la faccia del disco 0 cambia **6 volte in 6 secondi**, e TUTTI i cambi
  avvengono con la distanza pallone-comandato fra **33,4 e 36,9 unita'** —
  cioe' esattamente sull'attraversamento della frontiera `KICK_R*1,4`;
- in TUTTI e 6 i cambi **la squadra dell'ultimo tocco non e' mai cambiata**
  (sempre squadra 1, fino alla ripresa di possesso del giocatore 7, anch'egli
  squadra 1). Le durate delle puntate su TIRA: 8, 14 e 57 fotogrammi.

La catena del fallimento, quindi: dito giu' su CONTRASTA, 80 px armati →
il pallone conteso attraversa i 36,4 → faccia TIRA → ri-armo, posa azzerata →
il pallone riattraversa → faccia CONTRASTA → secondo ri-armo, posa azzerata
di nuovo → rilascio con `l` ~ 0 → **niente**. Nel cancello `giocata.js` e'
il rosso ~1 su 5 («p.slide resta spento»).

Nota onesta sulla dicitura della sonda del 31 mattina («la palla libera
vicina fa scattare il ramo del tiro»): la misura di oggi la precisa — il ramo
del tiro scatta sulla DISTANZA, e lo sfarfallio `owner`/-1 e' il motivo per
cui il pallone conteso attraversa la frontiera avanti e indietro invece di
starci fermo da un lato. Al primo cambio misurato (f30) `owner` era 6, cioe'
pieno possesso avversario: curare il solo `owner==-1` non basterebbe.

---

## 2. LE DUE STRADE DEL MANDATO, E QUALE SI SCEGLIE

### Strada A — isteresi sull'atto risolto (la faccia «resta posseduta»)

Idea: mentre un dito tiene il disco, una palla libera entro il raggio di
controllo di un avversario, o con tocco di palleggio recente in `G.touches`,
resta «posseduta» ai fini della faccia. Bocciata, con tre ragioni e una
misura:

1. **La misura la uccide da sola.** Il «raggio di controllo» dovrebbe valere
   almeno 157 unita' per coprire le finestre misurate oggi (§1.3) — sei volte
   `KICK_R` — e a quel punto dichiarerebbe «posseduto» mezzo campo. E la
   finestra temporale dovrebbe reggere 1883 ms. Numeri cosi' non sono
   un'isteresi: sono una menzogna sul possesso.
2. **La faccia vive in `touchBtnLayout`, e li' non si entra.** Il verbale
   :12261-12263 e' esplicito: «nessuna dipendenza nuova entra qui —
   _q-precedenza ricostruisce questa funzione e ogni nome nuovo l'ha gia'
   uccisa due volte». E le quattro capacita' sono GUARDIE DI ESECUZIONE
   (`doPassaggio` :13980, `doFiltrante` :14425, `doCrossUmano` :13992...):
   stabilizzarle cambierebbe quali azioni sono possibili, non solo che cosa
   c'e' scritto sul disco — molto oltre il difetto.
3. **L'etichetta dice quello che un dito NUOVO otterrebbe** (:12204-12225).
   Un'isteresi sulla faccia la farebbe parlare del dito vecchio.

### Strada B — il ri-armo non scatta per lo sfarfallio (SCELTA)

Il ri-armo resta legato al verbo offerto, ma scatta **solo se il pallone ha
davvero cambiato lato** da quando l'atto e' nato. «Lato» = la squadra a cui
il pallone appartiene: il padrone se c'e', altrimenti la squadra dell'ultimo
tocco — che e' un registro gia' scritto dal gioco per la paternita' delle
reti (`segnaTocco` :10816-10822, `b.lastTouch` :10819) e alimentato da OGNI
contatto: calci (:13842), furti (:17454), tocchi sporchi (:17698), raccolte
(:17705), blocchi col corpo (:17567), strappi (:16707), mani del portiere
(:17997), rinvii (:18112), calcio d'inizio (:10499).

Tre ragioni per questa strada:

1. **La misura la conferma da sola**: nei 6 cambi di faccia misurati oggi la
   squadra dell'ultimo tocco non cambia MAI; nel furto vero cambia SEMPRE
   (o `b.owner` passa all'altra squadra, o il tocco del ladro finisce nel
   registro — non esiste furto senza contatto). Il discrimine e' esatto,
   senza raggi ne' cronometri da tarare.
2. **Il file l'aveva gia' prevista.** Il verbale del ri-armo :13570-13578:
   «Il giorno in cui il contesto ... si stabilizzera' (b.passTo dentro
   possessoTeam, piu' l'isteresi), questo ri-armo seguira' senza che qui
   cambi una riga». La riga da cambiare e' una, ed e' quella.
3. **Degrada nel verso sicuro.** Ogni rilascio ri-verifica le proprie guardie
   all'esecuzione (`releaseCharge` :14943→`fireShot`; `eseguiPassaggioL14`
   con le sue guardie di stato e di distanza :14726-14729;
   `doSlide('scivola')`→`startSlide`→`puoContrastare` :15696): un
   ri-armo soppresso a torto non puo' produrre un'azione
   illegale — al peggio un rilascio che non fa niente, cioe' il comportamento
   pre-L1.1, e SOLO nei fotogrammi in cui il pallone non ha cambiato lato.

Bocciato anche il terzo candidato ovvio, il **ritardo (debounce)** sul
ri-armo: la puntata piu' lunga misurata su TIRA dura 57 fotogrammi (950 ms),
quindi un ritardo onesto dovrebbe superare il secondo; e ogni millisecondo di
ritardo si paga NEL CASO SACROSANTO, allungando proprio quella paralisi da
300-500 ms che il ri-armo e' nato per uccidere (:13556-13559).

---

## 3. IL MECCANISMO

### 3.1 La squadra del pallone

Una funzione nuova, pura, accanto a `possessoTeam` (:13764-13766), con lo
stesso statuto delle quattro capacita' (:13788-13791): **non scrive un bit,
non chiama mai `dado()` ne' `Math.random`**.

```js
/* la squadra a cui il pallone APPARTIENE ai fini del ri-armo: il padrone
   se c'e', altrimenti la squadra dell'ultimo tocco. Un palleggio, un tocco
   sporco, una respinta non cambiano lato; un furto si' — sempre, perche'
   non esiste furto senza contatto (segnaTocco). */
function squadraDelPallone(){
  const b=G.ball;
  if(b.owner>=0 && G.players[b.owner]) return G.players[b.owner].team;
  if(b.lastTouch>=0 && G.players[b.lastTouch]) return G.players[b.lastTouch].team;
  return -1;
}
```

### 3.2 L'atto ricorda il lato in cui e' nato

In `nasceAtto` (:13393-13396) un campo in piu':

```js
this.atti[id]={ t:t, carica:..., slot:slot, act:act,
                sq:squadraDelPallone(),          // il lato del pallone alla nascita
                posaX:x, ... };
```

### 3.3 La porta del ri-armo

In `Touch5.passo` (:13690-13704) il ramo del cambio di verbo diventa:

```js
const d=touchBtnLayout(a.t)[a.slot];
if(d && d.act!==a.act){
  const sq=squadraDelPallone();
  if(sq!==a.sq){
    /* il pallone ha cambiato lato: il ri-armo di sempre, parola per parola */
    if(a.carica) this.chiudiCarica(a.carica);
    if(a.passa){ this.chiudiPassaL14(a.passa); a.passa=null; }
    a.act=d.act; bt.act=d.act;
    a.carica=null;
    a.posaX=a.x; a.posaY=a.y;
    a.anello=[{x:a.x,y:a.y,q:this.tempo}];
    a.tenuta=0; a.morto=false;
    a.sq=sq;
    continue;
  }
  /* stesso lato: e' lo sfarfallio del palleggio. L'atto TIENE — verbo,
     posa, anello, tenuta — e il tempo del pollice avanza qui sotto. */
}
a.posato+=dt;
if(!a.morto) a.tenuta+=dt;
```

Attenzione al `continue`: oggi il fotogramma del ri-armo salta l'avanzamento
di `posato`/`tenuta` (:13706-13711, dichiarato «ininfluente»). Nel ramo
soppresso NON si salta: l'atto e' vivo e i suoi cronometri avanzano — e'
per questo che la porta sta DENTRO l'`if` e il flusso cade sulle due righe
finali.

Casi, tutti coperti dalla stessa porta:

| scena | lato alla nascita | lato ora | esito |
|---|---|---|---|
| palleggio avversario, faccia CONTRASTA↔TIRA | 1 | 1 | **niente ri-armo**, trascinamento intatto |
| palleggio NOSTRO, carica di tiro tenuta, faccia TIRA↔CONTRASTA | 0 | 0 | **niente ri-armo**, la carica sopravvive (stessa malattia, curata gratis) |
| furto VERO subito (tengo TIRA, me la soffiano) | 0 | 1 | ri-armo **immediato**, come oggi — sacrosanto |
| furto VERO fatto (tengo CONTRASTA, il mio la ruba) | 1 | 0 | ri-armo immediato |
| pallone parato/respinto dal portiere | chi tirava | chi ha parato | il tocco del portiere e' registrato (:17997): cambio di lato vero, ri-armo |

### 3.4 Che cosa NON si tocca

`touchBtnLayout` (nemmeno una virgola: `_q-precedenza` la ricostruisce),
`puoTirare`/`puoPassare`/`puoContrastare`/`puoScudo`, `Touch5.start` (la
risoluzione alla pressione resta viva fotogramma per fotogramma),
`Touch5.chiudi`, `doSlide`, `R_ARMA`/`rArma` (la guardia sul `posato` di
`_q-riarmo` resta intatta), la faccia DIPINTA del disco (continuera' a
sfarfallare TIRA/CONTRASTA nei fotogrammi di attraversamento: e' la verita'
su cio' che un dito nuovo otterrebbe, ed e' gia' cosi' oggi).

---

## 4. TUTTI I PUNTI DEL CODICE DA TOCCARE

1. **:13766 circa** (dopo `possessoTeam`) — nasce `squadraDelPallone()`,
   col suo verbale (statuto: zero scritture, zero sorteggi).
2. **:13393-13396** (`nasceAtto`) — il campo `sq`.
3. **:13690-13704** (`Touch5.passo`, ciclo degli atti) — la porta del §3.3,
   con la ristrutturazione del `continue`.
4. **:13550-13583** (verbale del ri-armo) — aggiornare la definizione di
   «cambio di contesto»: verbo offerto diverso **e** pallone che ha cambiato
   lato; citare la frase :13574-13578 che lo prevedeva e dichiararla
   adempiuta; aggiungere i numeri di questo progetto.
5. **:13462-13486** (verbale e comportamento di `contiene`) — RETTIFICA
   DICHIARATA: la frase :13474-13478 («avvicinandosi al pallone — dove il
   disco offre TIRA — il contenimento finisce. E' la distanza a cui si
   contiene») smette di essere vera quando il portatore e' avversario e il
   lato non cambia: il contenimento adesso finisce al CAMBIO DI LATO, non
   alla distanza. Il verbale va riscritto; il codice di `contiene` NON va
   toccato (legge `a.act`, che e' esattamente cio' che l'isteresi stabilizza).
6. **strumenti/_p-sfarfallio.js** — gia' scritto oggi (sonda diagnostica a
   passo fisso, §1.3); resta come banco del prima/dopo.
7. **Nessun altro punto.** In particolare: nessun hook `__test` nuovo (le
   misure passano dagli effetti — `doSlide` avvolto, `p.slide`, `G.ball` —
   come gia' fanno `_p-contrasto20` e `_q-riarmo`).

---

## 5. EFFETTO SULLA LEGGE DEI SORTEGGI

- `squadraDelPallone` non contiene `dado()` e non scrive niente.
- Tutto il codice nuovo vive **dentro il ciclo `for(const id in this.atti)`**
  di `Touch5.passo` (:13685): quel ciclo itera solo se un dito e' su un
  disco. Nei percorsi a seme fisso CPU contro CPU — che sono TUTTI i banchi
  a sorteggi appaiati di questa casa — `atti` e' vuoto e **non si esegue una
  sola istruzione nuova**: il numero di chiamate a `dado()`, il loro ordine
  e i valori restano identici al bit. Verifica: `_q-determinismo.js` 10/10 e
  i cancelli dei sorteggi (`_c3-sorteggi`, `_crit3-mira-sorteggi`,
  `_crit4-sorteggi`, `_crit10-sorteggi`) verdi senza un numero spostato.
- **Dichiarazione dovuta**: nei percorsi CON dita (giocata.js,
  `_p-contrasto20`, partite vere) l'ESITO cambia per progetto — una
  scivolata che oggi non parte partira' — e con lui si sposta il consumo di
  `dado()` a valle (la scivolata consuma i sorteggi del contatto). Non e'
  una falla della legge: e' la cura, confinata ai soli percorsi con dita,
  che per costituzione non sono appaiati al bit (i banchi a tocchi reali
  non sono ripetibili: 10/20 il 31 mattina, 11/20 oggi, stessa macchina).

---

## 6. PIANO DI MISURA (prima/dopo, banchi esistenti)

**PRIMA — misurato oggi:**

| banco | oggi |
|---|---|
| `node strumenti/_p-contrasto20.js` | 11/20 (31 ago: 10/20); i 9 falliti tutti `[premi]` senza `scivola` |
| `node strumenti/_p-sfarfallio.js` | 6 cambi di faccia in 6 s, lato dell'ultimo tocco MAI cambiato |
| `node strumenti/giocata.js --tutte` | contrasto rosso ~1 corsa su 5 («p.slide resta spento») |

**DOPO — soglie di accettazione:**

1. `_p-contrasto20.js`: **almeno 19/20**, su tre corse (banco a rAF vero,
   non ripetibile: si giudica la peggiore delle tre).
2. `giocata.js --tutte`: **dieci corse senza un rosso**.
3. Cancelli dei verbi INVARIATI, riga per riga: `_q-l12` (tutte le prove
   A-H; occhio a B, il contenimento, per la rettifica del §4.5), `_q-l16`,
   `giocata --pausa`, `_q-precedenza`.
4. `_q-riarmo.js` verde: le sue scene armano il ri-armo scrivendo
   `b.owner` sull'altra squadra (righe 296 e 338 del banco, rilette oggi)
   — cambio di lato vero, la porta resta aperta per costruzione. Lo si
   rimisura comunque, perche' «per costruzione» non e' una misura.
5. `_q-determinismo.js` 10/10 e i quattro cancelli dei sorteggi del §5:
   identici al bit.
6. Traccia CPU contro CPU a seme fisso, fotogramma per fotogramma, prima e
   dopo la toppa: **zero differenze** (lo stesso metodo con cui furono
   promosse le quattro capacita', :13788-13791).
7. `_p-sfarfallio.js` dopo la toppa: la faccia DIPINTA continua a cambiare
   (§3.4 — la sonda non tiene dita giu', quindi deve dare gli stessi 6
   cambi): e' il controllo che l'isteresi non ha toccato l'etichetta.

---

## 7. RISCHI

- **R1 — Il contenimento non si spegne piu' avvicinandosi** (rettifica del
  §4.5). Chi tiene CONTRASTA e arriva sotto i 36,4 resta «contenente» finche'
  il pallone non cambia lato. Se `_q-l12` prova B andasse in rosso, la via
  d'uscita e' locale e dichiarata: spegnere il contenimento sulla distanza
  DENTRO `contiene()`, senza riaprire il ri-armo.
- **R2 — Il pallone abbandonato resta «dell'ultima squadra» per sempre**
  (`b.lastTouch` non scade mai). Un atto tenuto su un pallone ormai neutro
  non si ri-arma. Conseguenza peggiore: un rilascio che non fa niente
  (guardie a valle). Accettato; se un banco lo mostrasse, il rubinetto e'
  gia' in casa — `G.touches` porta il tempo di ogni tocco (`G.pulse`,
  finestra `TOCCO_FIN=3 s` :10815) e la porta puo' chiedere «ultimo tocco
  recente» senza inventare registri nuovi.
- **R3 — Atto nato durante una puntata di TIRA transitoria** (pressione nel
  fotogramma sbagliato): il dito tiene `shot` su pallone conteso e il
  ri-armo non lo riporta a `slide`. Il rilascio passa da
  `releaseCharge`→`fireShot`→`kickBall`, che calcia solo entro `KICK_R`
  (:13841): al peggio una punta su pallone a portata — che e' cio' che
  l'etichetta alla pressione aveva promesso. Da contare nel banco: nessuna
  scivolata fantasma, nessun fallo fantasma nelle 20 corse.
- **R4 — Banchi che cambiano contesto scrivendo `b.owner=-1` e teleportando
  la palla senza `segnaTocco`**: li' il ri-armo non scattera' piu'. Censiti
  oggi: `_q-riarmo` usa `b.owner=<indice>` (sta in piedi); `_q-l12` usa
  `owner=-1` solo nella prova F (spazzata, vive sulla pressione, non sul
  ri-armo). Il resto lo dice la rimisurazione completa del §6.3.
- **R5 — I nastri delle sfide registrati PRIMA della toppa** (`Reg`,
  :12350-12420): un replay che conteneva un dito tenuto su un disco durante
  uno sfarfallio divergera', perche' l'ingresso adesso risponde diverso.
  E' la stessa classe di rottura di ogni toppa L1.x gia' spedita sul motore
  d'ingresso; da verificare in applicazione come si versionano i nastri.
- **R6 — Due giocatori** (`G.mode===2`): la porta e' per-atto e simmetrica
  per squadra; nessuna asimmetria introdotta. Si rimisura `_q-precedenza`
  (due mani) per non crederci sulla parola.
- **R7 — Il banco bersaglio non e' ripetibile** (rAF vero: 10/20 → 11/20 in
  due corse identiche). Il 19/20 va letto come «peggiore di tre corse», e
  un 18 isolato va rifatto prima di dichiarare rosso il progetto.
