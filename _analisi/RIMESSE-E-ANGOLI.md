# Rimesse laterali e calci d'angolo — censimento prima di progettare

Voce #87 del committente: nell'11 le rimesse laterali sono obbligatorie; nel 7
e nel 5 si sceglie (con o senza, "senza" = il gioco di oggi); i calci
d'angolo, invece, servono SEMPRE, su tutte e tre le taglie — anche quando le
fasce restano gabbia.

Ogni affermazione qui sotto porta `file:riga`. Dove ho cercato qualcosa e non
l'ho trovato, riporto il comando e l'esito vuoto invece di dedurre.

File censito: `CALCETTO-il-gioco.html` (2,4 MB), letto a `Grep`/`Read` mirati,
mai per intero.

---

## 1. La gabbia

Il punto che il committente cita (verbale del codice) è
`CALCETTO-il-gioco.html:3833-3834`:

> «E la gabbia resta: le sponde sono il clamp su FW/FH — nessuna rimessa, a
> nessuna taglia.»

La funzione che la realizza è `ballWalls(b)`, `CALCETTO-il-gioco.html:18499-18550`.
Struttura:

- **Dentro la luce della porta** (`inMouth`, riga 18501: `b.y>GY0+B_R && b.y<GY1-B_R`)
  la palla può entrare in rete (righe 18509-18516, `addGoal`), sbattere sopra
  la traversa (`ballOverBar`, righe 18510/18514 → funzione a riga 18634-18658,
  vedi punto 4) o fermarsi sul fondo della rete (righe 18534-18535).
- **Fuori dalla luce della porta** (`else`, righe 18536-18546) — cioè
  esattamente la fetta di fondocampo a lato dei pali, quella che in una
  partita vera è un corner o un rinvio dal fondo — la palla **rimbalza**:

```javascript
// CALCETTO-il-gioco.html:18538-18546
if(b.x<B_R){
  b.x=B_R; b.vx=Math.abs(b.vx)*0.82;
  hitWall(sp, Math.abs(b.y-GY0)<16||Math.abs(b.y-GY1)<16, 1, 0);
}
if(b.x>FW-B_R){
  b.x=FW-B_R; b.vx=-Math.abs(b.vx)*0.82;
  hitWall(sp, Math.abs(b.y-GY0)<16||Math.abs(b.y-GY1)<16, -1, 0);
}
```

- **Le sponde lunghe** (fasce, righe 18548-18549) usano la STESSA legge:

```javascript
// CALCETTO-il-gioco.html:18548-18549
if(b.y<B_R){ b.y=B_R; b.vy=Math.abs(b.vy)*0.82; hitWall(sp,false,0,1); }
if(b.y>FH-B_R){ b.y=FH-B_R; b.vy=-Math.abs(b.vy)*0.82; hitWall(sp,false,0,-1); }
```

**Coefficiente di rimbalzo: 0.82**, identico sulle quattro sponde (fondo
fuori porta e fasce). Oggi non c'è alcuna differenza di comportamento fra
"fondo" e "fascia": sono la stessa gabbia con normali diverse.

**Suono ed effetti**: sì, tramite `hitWall(sp,isPost,nx,ny)`,
`CALCETTO-il-gioco.html:18692-18703`:

```javascript
// CALCETTO-il-gioco.html:18692-18703
function hitWall(sp,isPost,nx,ny){
  if(sp>140){ if(isPost) Audio5.post(); else Audio5.clack(false); }
  if(sp>120) schiacciaPalla(0.10+clamp((sp-120)/520,0,1)*0.16, nx||1, ny||0);
  tagliaScia();
  if(sp>300){
    const f=clamp((sp-300)/380,0.2,1.2);
    spruzzo(G.ball.x, G.ball.y, nx||0, ny||0, 2+((f*5)|0), f);
    if(sp>430) scossa(2.2+3.0*f, 0.20, nx||0, ny||0);
    if(sp>560) gelo(0.035);
  }
}
```

Sopra i 120 u/s comprime il pallone (`schiacciaPalla`), sopra 140 suona
(`Audio5.clack`/`Audio5.post` se vicino al palo), sopra 300 fa scintille
(`spruzzo`), sopra 430 scuote la camera (`scossa`), sopra 560 ferma un
istante il tempo (`gelo`).

**Nota strutturale utile a chi progetta**: il ramo "fuori dalla gabbia" a cui
serve un angolo/rinvio dal fondo è già isolato — è esattamente l'`else` di
`if(inMouth)` (riga 18536), la stessa condizione che oggi decide fra gol e
gabbia. Non serve inventare una nuova geometria: serve dare a
quel ramo una terza uscita oltre al rimbalzo.

---

## 2. Chi ha toccato per ultimo

Esistono entrambe le funzioni chieste.

### `segnaTocco(pi)` — `CALCETTO-il-gioco.html:10920-10926`

```javascript
const TOCCO_FIN = 3;                     // finestra di attribuzione (s)
function segnaTocco(pi){
  const b=G.ball;
  if(!b || pi<0 || !G.players[pi]) return;
  b.lastTouch=pi;
  G.touches.push({ i:pi, t:G.pulse });
  if(G.touches.length>16) G.touches.shift();
}
```

Scrive `b.lastTouch` (indice del giocatore, un solo valore, sovrascritto ad
ogni contatto) e accoda `{i, t}` in `G.touches`, un log capato a **16
voci**. `TOCCO_FIN=3` è la finestra usata da `attribuisciRete(team)`
(`CALCETTO-il-gioco.html:10930-10945`) per decidere autorete/rete vera al
momento del gol, leggendo il log a ritroso fino a 3 secondi di gioco fa.

`segnaTocco` viene chiamata "a OGNI contatto: calci, furti, tocchi sporchi,
raccolte, blocchi col corpo, strappi, mani del portiere, rinvii, calcio
d'inizio" (commento a `CALCETTO-il-gioco.html:14018-14022`).

### `squadraDelPallone()` — `CALCETTO-il-gioco.html:14025-14031`

```javascript
function squadraDelPallone(){
  const b=G.ball;
  if(!b) return -1;
  if(b.owner>=0 && G.players[b.owner]) return G.players[b.owner].team;
  if(b.lastTouch>=0 && G.players[b.lastTouch]) return G.players[b.lastTouch].team;
  return -1;
}
```

Nessun parametro, ritorna la squadra (0/1) o `-1`. Introdotta alla voce #82
(commento `CALCETTO-il-gioco.html:14016-14024`): preferisce il possesso vero
(`b.owner`), altrimenti l'ultimo tocco (`b.lastTouch`, che `segnaTocco` non
azzera mai finché non arriva un tocco nuovo — quindi "per sempre", non ha una
finestra di scadenza come `G.touches`).

**Per la decisione angolo-contro-rinvio-dal-fondo**: `squadraDelPallone()` è
esattamente la funzione giusta. Se il pallone esce sul fondo (fuori dalla
luce della porta) e `squadraDelPallone()` ritorna la squadra che DIFENDE
quella porta → è stata la difesa a toccarlo per ultima → angolo. Se ritorna
la squadra che ATTACCA → rinvio dal fondo. Non richiede una nuova finestra
temporale: `b.lastTouch` non scade.

---

## 3. Gli stati di gioco fermo che già esistono

L'enumerazione completa di `G.scene` è dichiarata nel commento della
struttura iniziale:

```javascript
// CALCETTO-il-gioco.html:8237
scene:'menu',        // menu | howto | kickoff | play | goal | freekick | golden | end
```

**Otto valori**, e la ricerca `G.scene===`/`s===` su tutto il file conferma
che non ce ne sono altri in uso. Chi scrive ciascuno (`setScene`,
`CALCETTO-il-gioco.html:10869-10881`, unico punto che tocca `G.scene`):

| valore | chi lo scrive | riga |
|---|---|---|
| `menu` | apertura app, fine giro moviola/torneo/stagione, `$('btnBackMenu')` | `38575`, `38721-38723`, `38733`, `41089` |
| `howto` | schermata "come si gioca" (non è mai in-match) | riferita in `ui.howto`, `38292` |
| `kickoff` | `resetKickoff()+setScene('kickoff')` dopo un gol e ad ogni ripresa | `10822`, `16409`, `16415`, `20876` |
| `play` | timeout automatico di `kickoff` dopo 1,0/1,5 s | `16314` |
| `goal` | `addGoal(team)`, appena il pallone tocca rete | `11051` (dentro `addGoal`, che parte a `10948`) |
| `freekick` | punizione **e** rigore (stesso stato, titolo diverso) | `20887` (dentro `startFreeKick`, `20885`) |
| `golden` | non trovato un `setScene('golden')` esplicito — vedi sotto | — |
| `end` | `endMatch()` | `11057` (dentro `endMatch`, `11055`) |

**`golden` è un caso particolare**: non ho trovato nessun `setScene('golden')`
nel file — cercato con `Grep "setScene\('golden'\)"` su tutto
`CALCETTO-il-gioco.html`, **esito vuoto**. `golden` esiste come *bandiera*
booleana `G.golden` (attivata a `CALCETTO-il-gioco.html:16454:
G.golden=true; G.goldenT=0;`), non come scena separata: il golden gol si
gioca dentro lo stato `play`/`kickoff` normali, e `golden` compare
nell'elenco di `G.scene` solo come valore POSSIBILE, verificato dai molti
`G.scene==='golden'` sparsi nei gate di camera/HUD/input (es.
`CALCETTO-il-gioco.html:11788`, `16419`, `28756`, `34649`). In pratica,
oggi `G.scene` non assume mai concretamente `'golden'`: è un valore
dichiarato nell'enumerazione e controllato ovunque per prudenza, ma il
percorso che lo assegnerebbe non esiste (o è così che il refuso si spiega:
la funzione che gestisce il golden gol lascia la scena a `play`/`kickoff`
e usa solo `G.golden` per differenziare l'HUD e la fine-partita a `40
secondi extra`, righe `16442-16463`).

**Il fermo più vicino a un "nessuno tocca palla, si aspetta"**: lo stato
`kickoff`. Il ciclo principale (`CALCETTO-il-gioco.html:16307-16316`)
**esce subito** (`return`) quando `G.scene==='kickoff'`, senza far girare
fisica né IA, per 1,0 s (taglia 5) o 1,5 s (taglia 7/11) — poi
`setScene('play')` (riga 16314) e riparte tutto in un colpo, giocatore
compreso, senza nessuna rincorsa scriptata.

`freekick` è un fermo di natura diversa: non è "il campo si ferma e aspetta
un tocco", è **un minigioco a schermo separato** — l'oggetto `Duel`
(`CALCETTO-il-gioco.html:20472-20486`, fasi `zone|power|wait|result`) prende
il controllo completo della scena (`drawDuelScene`, riga `30771`) mentre il
resto del ciclo principale esce anch'esso subito perché `freekick` non è
`'play'` né `'golden'` (riga `16419: if(G.scene!=='play' && G.scene!=='golden') return;`).
Non esiste, quindi, un "tutti fermi sul campo tranne uno che
corre a battere": o è fermo-tutto-il-campo (kickoff), o è
fermo-tutto-il-campo-e-si-passa-a-un'altra-scena (freekick/rigore).

---

## 4. Il portiere e il rinvio

La posa esiste, dove il committente dice:

- **`poseRinvio(u)`** — `CALCETTO-il-gioco.html:5893-5921`: rig del rinvio al
  volo dalle mani (anticipo del busto, caduta della palla, frustata della
  gamba, seguito).
- **`pallaRinvio(u,o)`** — `CALCETTO-il-gioco.html:5925-5936`: traiettoria
  della palla durante il rinvio (mani → caduta libera → parabola).
- **Voce nella tavola delle clip**: `rinvio: {freq:0.55,pose:poseRinvio,
  palla:pallaRinvio},` — `CALCETTO-il-gioco.html:6647`.
- **Selezione della clip a runtime**: `if(p.rinvT>0){ st.clip='rinvio';
  st.u=0.16+0.80*(1-p.rinvT/0.9); return st; }` —
  `CALCETTO-il-gioco.html:33133`.

La funzione che lo innesca è **`rinvioPortiere(p)`**,
`CALCETTO-il-gioco.html:18465-18493`: sceglie il compagno più smarcato (righe
18467-18473), calcola una velocità che dipende dalla distanza (commento del
23 agosto 2026, righe 18478-18486), assegna `b.owner=-1`, chiama
`segnaTocco(...)` (riga 18477), imposta `p.rinvT=0.9` per la clip (riga
18490). **Parte SEMPRE dentro lo stato `play`** — è chiamata da
`CALCETTO-il-gioco.html:18311` quando il portiere ha la palla fra le mani
(`if(p.kickCd<=0) rinvioPortiere(p);`), senza fermare il gioco, senza
`setScene`, senza whistle. È un'azione dentro il flusso normale, non un
calcio piazzato con avversari a distanza regolamentare.

**Il precedente più vicino a un vero "rinvio dal fondo" già esistente** è
`ballOverBar(b, portaLato)`, `CALCETTO-il-gioco.html:18634-18658` — chiamata
quando un tiro passa sopra la traversa DENTRO la luce della porta (righe
18510, 18514). Il commento stesso lo chiama così:

```javascript
// CALCETTO-il-gioco.html:18634-18641
/* la palla e' passata sopra la traversa: rimessa dal fondo per chi difende */
function ballOverBar(b, portaLato){
  const difende = portaLato;
  showBanner('ALTA!','#96ab9e',0.9);
  Audio5.whistle(false);
  b.z=0; b.vz=0; ...
  /* rinvio dal fondo: la palla riparte dai piedi del piu' arretrato che difende */
```

Sceglie il portiere (`portiereDi`) o il difensore più arretrato, gli mette la
palla ai piedi (`b.owner = G.players.indexOf(deep)`) e riparte — **ma senza
alcuna pausa**: nessun `setScene`, nessun `G.freeze`, il tutto avviene in un
solo fotogramma dentro lo stato `play`, col fischio (`Audio5.whistle`) solo
come effetto sonoro decorativo, non come cambio di scena. È quasi esattamente
ciò che la voce #87 chiede per il fondo lato attacco, tranne che oggi non
c'è nessuno stop percepibile — è la prova che il gioco SA già posizionare la
palla e assegnarla al difensore più vicino; la parte che manca è lo stato
fermo (pausa, ripresa dal dito) intorno a quel gesto.

---

## 5. L'intelligenza quando il gioco è fermo

Non esiste un meccanismo "tutti fermi tranne uno che batte" **attivo**: la
strategia oggi è "tutto il ciclo si ferma" (vedi punto 3). Verificato con
`Grep "function updateAI|function aiTeam|function iaGioca|function decidiCPU"`
su tutto il file: **esito vuoto** — non esistono funzioni con questi nomi;
l'IA vive dentro il ciclo principale a passo fisso, che a `kickoff` esce
subito (`CALCETTO-il-gioco.html:16307-16316: if(G.scene==='kickoff'){ ...
return; }`), quindi nessuna funzione di IA gira affatto durante il fermo:
non è che i compagni stiano fermi per scelta tattica, è che l'intero motore
(fisica + IA + input) è sospeso finché il timer della scena non scade.

`resetKickoff()` (`CALCETTO-il-gioco.html:10563-10605`) prepara le posizioni
PRIMA del fermo: rimette ogni giocatore sulla formazione (`formation(p.team)[p.idx]`,
riga 10566), azzera i "latch" del rig (riga 10573), e mette la palla ai
piedi del giocatore `idx===1` della squadra che ha diritto al calcio
(`kt=G.kickTeam?1:0`, righe 10594-10604) — la convenzione è nel commento
delle taglie: *"idx 1 = mezzala sinistra (batte il calcio d'inizio) ...
convenzioni di resetKickoff, da non toccare"* (`CALCETTO-il-gioco.html:3839-3841`).
Quando il timer scade e la scena torna `play` (riga 16314), tutti i
ventidue/quattordici/dieci uomini ripartono nella normale IA nello stesso
fotogramma — non c'è una rincorsa scriptata verso il pallone, l'uomo `idx 1`
semplicemente lo ha già ai piedi.

Per `freekick` (rigore/punizione) l'oggetto `Duel`
(`CALCETTO-il-gioco.html:20472-20486`) ha i propri flag
`shooterHuman`/`keeperHuman`/`cpuT` per far "battere" la CPU con un timer
dedicato — ma è un sotto-sistema separato, verificato in un mini-campo di
duello, non i ventidue uomini schierati sul terreno vero.

---

## 6. Le impostazioni — dove vive la scelta 5/7/11 e come si salva un interruttore

La taglia si sceglie nella schermata **GIOCA**, riga d'interfaccia
`CALCETTO-il-gioco.html:3277-3281`:

```html
<div class="diff-row" id="taglieRow">
  <button class="taglia sel" data-t="5">5 contro 5 <small>la gabbia</small></button>
  <button class="taglia" data-t="7">7 contro 7 <small>il campetto</small></button>
  <button class="taglia" data-t="11">11 contro 11 <small>il campo grande</small></button>
</div>
```

(nota: qui "la gabbia", nel sottotitolo del 5, è proprio il nome con cui il
gioco stesso chiama la taglia base — coerente col commento di riga 3833).

Gestione in JS, `CALCETTO-il-gioco.html:38681-38693`:

```javascript
function refreshTaglieRow(){
  document.querySelectorAll('.taglia').forEach(b=>b.classList.toggle('sel', +b.dataset.t===(SAVE.taglia||5)));
}
document.querySelectorAll('.taglia').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    SAVE.taglia=+b.dataset.t;
    refreshTaglieRow();
    persistSave();
  });
});
```

Persistenza: `persistSave()`, `CALCETTO-il-gioco.html:9806-9815`, scrive
`SAVE` intero su `localStorage` (`SAVE_KEY`). `SAVE` nasce da
`loadSave()` a `CALCETTO-il-gioco.html:9796`.

**Esiste anche un secondo pattern**, quello degli interruttori binari nel
pannello IMPOSTAZIONI (l'ingranaggio), sezione "Partita" —
`CALCETTO-il-gioco.html:3628-3629`:

```html
<button class="voce" id="btnSetTempo">DURATA PARTITA: 90&Prime; ...</button>
<button class="voce sw" id="btnSetMoviola">MOVIOLA DOPO IL GOL: S&Igrave; ...</button>
```

con la logica gemella `SAVE.moto`/`SAVE.moviola`,
`CALCETTO-il-gioco.html:40083-40090` (etichetta) e `40186-40195` (click →
toggle 0/1 → `persistSave()` → `refreshImpostUI()`):

```javascript
$('btnSetMoviola').addEventListener('click', ()=>{
  SAVE.moviola = SAVE.moviola?0:1; persistSave(); refreshImpostUI(); Audio5.beep(440);
});
```

Sono **due posti diversi e due pattern diversi**, entrambi già collaudati:
la riga di 2-3 pulsanti esclusivi (GIOCA, es. taglia/difficoltà/mentalità)
e il pulsante `.voce.sw` on/off con etichetta che cambia testo
(IMPOSTAZIONI → Partita, accanto a DURATA PARTITA e MOVIOLA, che sono
anch'esse regole di partita e non preferenze grafiche). Entrambi persistono
allo stesso modo (`SAVE.xxx` + `persistSave()`).

---

## 7. I sorteggi — i banchi di guardia sul conto di `dado()`

Ricerca `strumenti/_q-determinismo*`, `_c3-sorteggi*`, `_crit*-sorteggi*` →
trovati questi banchi (oltre ad altri non richiesti esplicitamente ma dello
stesso genere):

- **`strumenti/_q-determinismo.js`** (271 righe) — non conta i sorteggi
  direttamente, ma verifica che l'intera partita sia RIPRODUCIBILE dato un
  seme: quattro prove (A) stessa pagina due volte, (B) due pagine diverse,
  (C) con un copione di comandi dal dito, (D) col seme interno del gioco
  (`__test.semina`) e col caso vero del browser rimesso al suo posto — e in
  D confronta anche `t.sorteggi` (righe 215, 224-226) come parte
  dell'impronta di fine partita. Uso:
  `node strumenti/_q-determinismo.js --taglia 11 --partite 4`.

- **`strumenti/_c3-sorteggi.js`** (95 righe) — il banco più esplicito sulla
  legge di casa: gioca N partite CPU-contro-CPU a seme fisso su due file
  HTML (`--a`/`--b`, un prima e un dopo la patch) e confronta
  `t.sorteggi - s0` (righe 45-49), il punteggio e lo stato finale
  (`t.state`). Verde solo se il conto dei dadi coincide partita per
  partita, su tutte e tre le taglie (`TAGLIE='5,7,11'` di default, riga 21).

- **`strumenti/_crit3-sorteggi.js`** — conta i `dado()` A RUNTIME
  duello-per-duello (rigori/punizioni), verifica che senza mira i due file
  diano la stessa sequenza di esiti su tutte le difficoltà, e che `mirato`
  si azzeri fra un duello e l'altro (righe 1-6).

- **`strumenti/_crit3-mira-sorteggi.js`** — stesso genere di prova per la
  geometria della mira col pollice: stesso seme/taglia/passi → stesso
  numero di sorteggi e stesso punteggio sul gioco spedito e sulla copia
  toppata (righe 1-5).

- **`strumenti/_crit4-sorteggi.js`** — verifica a runtime (non contando le
  stringhe) su cinque semi e tre taglie, incluso il caso limite della
  geometria del pollice spinta al massimo (righe 1-9).

- **`strumenti/_crit10-sorteggi.js`** — stesse partite sui due file, stesso
  conto di `dado()`, stesso pallone (righe 1-4).

- **`strumenti/_g-sorteggi.js`** — verifica che le SONDE (`_g-censo.js`,
  `_g-testa.js`, `_g-stanchezza.js`, che avvolgono `drawPlayer`,
  `Rig3D.disegna`, `colpoDiTesta`) non consumino un solo numero casuale in
  più: gioca la stessa partita nuda e con la sonda installata, confronta
  `window.__quanti()` e il punteggio (righe 1-11).

- **`strumenti/_t3-sorteggi.js`** — stesso principio: avvolge il
  generatore, risemina prima di ogni partita, confronta il conto E il
  punteggio su tutte le taglie richieste; nota nel commento che il banco
  stesso è "già fallito" una volta dando `--a` e `--b` uguali, a riprova che
  la prova sa fallire (righe 1-12).

- **`strumenti/_diag-chi-sorteggia.js`** — diagnostica, non gate:
  avvolge `dado()` e chiede la pila delle chiamate per capire CHI consuma i
  sorteggi (usato per i 229 sorteggi "solo alla prima partita", righe 1-3).

**Implicazione per rimesse/angoli**: qualunque logica nuova (scegliere chi
batte, decidere angolo-vs-rinvio, il timer di pausa) che chiami `dado()` in
un punto nuovo del percorso a seme fisso farà scattare rosso su
`_c3-sorteggi.js`, `_crit3/4/10-sorteggi.js` e `_t3-sorteggi.js` finché non
si aggiornano i file "prima" con cui vengono confrontati — è la legge di
casa che il committente cita, e questi sono i banchi che la fanno
rispettare.

---

## 8. I banchi che si romperebbero

### Il difetto già noto, voce #66 — "uscito dal mondo" per un pallone in rete

Trovato in `strumenti/collaudo.js:283-315`. Il verbale nel codice stesso lo
racconta:

```javascript
// strumenti/collaudo.js:287-302
/* Qui c'era:  pallaOk = b.x >= 0 && b.x <= c.FW && ...
   cioe' «il pallone sta fra le due linee di fondo», chiesto
   qualunque cosa stia succedendo. Ma dopo venti secondi di
   simulazione la scena puo' essere `goal`, e nella scena del gol il
   pallone E' DENTRO LA RETE: oltre la linea di GOAL_D unita', che
   e' esattamente dove deve stare. Il cancello leggeva quel pallone
   e diceva «qualcuno e' uscito dal mondo».
   ...
   Il verbale del rosso lo diceva gia': {"dentro":true,"sani":true,
   "pallaOk":false}. Nessuno era uscito dal mondo: era entrato in
   porta. */
```

La cura applicata nel file principale (righe 310-313): il controllo ora
allarga la banda SOLO quando `t.state==='goal'`:

```javascript
// strumenti/collaudo.js:310-313
const inRete = (t.state === 'goal');
const OLTRE = 34 + 12;
const x0 = inRete ? -OLTRE : 0, x1 = inRete ? c.FW + OLTRE : c.FW;
const pallaOk = b && b.x >= x0 && b.x <= x1 && b.y >= 0 && b.y <= c.FH;
```

**Ma la stessa toppa NON è arrivata a sei copie sorelle di questo stesso
banco**, tutte con la versione ingenua non corretta (`Grep
"b\.x\s*>=?\s*0\s*&&\s*b\.x\s*<=?\s*c?\.?FW"` su `strumenti/`):

- `strumenti/_p-collaudo.js:269`
- `strumenti/_q-collaudo.js:269`
- `strumenti/_t-p-collaudo.js:269`
- `strumenti/_tb-collaudo.js:269`
- `strumenti/_z-collaudo.js:269`
- `strumenti/_x-collaudo.js:270`

tutte e sei con la riga `const pallaOk = b && b.x >= 0 && b.x <= c.FW && b.y
>= 0 && b.y <= c.FH;` senza l'eccezione `inRete`. Sono copie di onde
precedenti dello stesso strumento (stesso preambolo "COLLAUDO — la rete di
sicurezza", verificato in `strumenti/_p-collaudo.js:1-13`). Se una di queste
venisse rilanciata su un gioco con rimesse/angoli — dove il pallone potrebbe
legittimamente sostare per un istante fuori dalla banda `[0,FW]` durante una
posa d'angolo o d'uscita laterale — griderebbe di nuovo falso "uscito dal
mondo", lo stesso difetto della voce #66, non ancora estinto ovunque.

### Banchi che assumono l'elenco di oggi degli stati

`Grep "t\.state\s*===\s*'play'|t\.state\s*===\s*'kickoff'"` su `strumenti/`
trova, oltre a `collaudo.js`, questi banchi che aspettano ESATTAMENTE
`'play'` o `'kickoff'` per dire "la partita è partita":

- `strumenti/telefono.js:164`
- `strumenti/audio.js:743`
- `strumenti/_lac-vetro.js:64`
- `strumenti/_lac-sessione.js:145`
- `strumenti/_lac-gfx.js:134`

tutti con la stessa forma, es. `strumenti/_lac-vetro.js:64`:
`if ((t.state==='play'||t.state==='kickoff')&&t.ball) break;`. Non si
romperebbero introducendo un nuovo stato fermo a metà partita (aspettano solo
l'AVVIO), ma **incarnano l'assunzione che gli unici due stati "di apertura"
siano questi due** — se un giorno una rimessa/angolo dovesse succedere
PRIMA del primo `play` (non è il caso oggi) andrebbero riletti.

Tre banchi della telecamera assumono la stessa coppia per un'altra
ragione (quale nome di camera usare):
`strumenti/_z-verbo.js:142`, `strumenti/_z-verbo-prova.js:153`,
`strumenti/_t3-verbo.js:145` — `if (nomeCam === 'alto' && (scena==='play'||scena==='golden'))`.
Un nuovo stato fermo (`rimessa`/`angolo`) che dovesse ereditare la stessa
telecamera "alta" andrebbe aggiunto qui a mano.

### Un falso amico: "gabbia" nei nomi degli strumenti

`strumenti/gabbia.js`, `strumenti/_q-gabbia.js`, `strumenti/_q-gabbia-fusa.js`,
`strumenti/_z-gabbia.js` **non hanno nulla a che fare con le sponde del
campo**: sono il banco delle proporzioni dello scheletro dei personaggi
("GABBIA — il banco delle proporzioni delle figure", verificato in
`strumenti/gabbia.js:1-35`), cioè verificano che ogni osso del rig mantenga
la sua lunghezza nominale in ogni posa. Sono comunque potenzialmente
coinvolti: **se rimesse/angoli/rinvii introducono pose nuove** (chi lancia
la rimessa con le mani sopra la testa, chi batte l'angolo), quelle pose
nuove dovranno passare da questo banco come tutte le altre — ma il nome
condiviso con la "gabbia" del campo è pura coincidenza lessicale, da non
confondere in sede di pianificazione.

---

## LE TRE DOMANDE CHE IL PROGETTO DEVE DECIDERE

### 1. La rimessa/l'angolo si batte col dito o è automatica?

- **A — Automatica, come il rinvio del portiere di oggi.** Il gioco sceglie
  il ricevente (stesso algoritmo di `rinvioPortiere`, righe 18467-18473:
  punteggio per smarcamento) e lancia la palla da sé dopo una breve pausa.
- **B — Col dito, come il rigore/la punizione (`Duel`).** Il giocatore mira
  (se la squadra 0 è umana e ha diritto alla rimessa) con un'interfaccia
  dedicata; la CPU usa un timer (`Duel.cpuT`) come già fa per i rigori.
- **C — Ibrida per taglia**: automatica a 11 (dove le rimesse sono
  obbligatorie e frequenti — fermarsi ogni volta col dito spezzerebbe il
  ritmo di una partita già più lenta), col dito per gli angoli su tutte le
  taglie (evento raro e ad alto valore dentro l'azione, come il rigore).

**Raccomandazione**: **C**. Le rimesse laterali a 11 sono, per frequenza,
un evento di gioco continuo (il pallone esce sulle fasce lunghe spesso);
fermarle tutte col dito le renderebbe un'interruzione fastidiosa esattamente
dove il committente le ha rese "obbligatorie" perché sono normali in una
partita vera. Gli angoli, al contrario, sono rari e già oggi il gioco ha un
sotto-sistema pensato per eventi rari e ad alto pathos (`Duel`, righe
20472-20486) con tanto di titolo a schermo (`RIGORE`/`PUNIZIONE!`, riga
20894) — estenderlo con un terzo titolo (`ANGOLO!`) riusa un pattern già
collaudato invece di inventarne uno nuovo.

### 2. Quanto dura la pausa, e chi resta fermo durante l'attesa?

- **A — Zero pausa**, sul modello di `ballOverBar` (righe 18634-18658): la
  palla si sposta all'angolo/al rinvio e riparte nello stesso fotogramma,
  nessun `setScene`, solo un fischio decorativo (`Audio5.whistle`).
- **B — Pausa breve fissa**, sul modello di `kickoff` (1,0 s a 5, 1,5 s a
  7/11: `CALCETTO-il-gioco.html:16314`), con TUTTO il campo fermo (fisica e
  IA sospese) come fa oggi `resetKickoff`+lo stato `kickoff`.
- **C — Pausa con IA viva**: un nuovo stato in cui la fisica dei ventidue
  uomini continua (si riposizionano, il portiere si piazza) ma il possesso
  non passa finché il tocco non arriva — nessun precedente di questo tipo
  esiste oggi nel file (verificato: il ciclo esce sempre per intero su
  `kickoff` e `freekick`, righe 16307-16316 e 16419).

**Raccomandazione**: **B** per l'angolo (è un momento che vale la pena
mostrare: giocatori che si accalcano in area, come già succede all'inizio
di `kickoff` con la carrellata sullo schieramento, righe 16308-16313), **A**
per la rimessa quando è automatica (per non spezzare il ritmo a 11, dove
capita spesso) — cioè la stessa logica binaria già presente nel file fra
`ballOverBar` (zero pausa, evento frequente) e `goal`/`kickoff` (pausa piena,
evento raro e importante). **C andrebbe scartato** salvo che il committente
lo chieda esplicitamente: è l'unica opzione senza alcun precedente nel
codice, quindi il costo di implementazione e di collaudo (nuovi banchi da
zero, nessun pattern da cui partire) è molto più alto delle prime due.

### 3. L'IA arretra, pressa, o resta semplicemente ferma sulla rimessa/sul corner avversario?

- **A — Ferma su tutto il campo** (il pattern `kickoff` di oggi, righe
  16307-16316): nessuno si muove finché non riparte il gioco. Costo di
  sviluppo minimo — è l'unico stato-fermo che il gioco sa già fare bene su
  tutte le taglie.
- **B — Posizionamento tattico scriptato**: la squadra che difende arretra
  in area (sul corner) o si allarga a marcare (sulla rimessa), la squadra
  che attacca si smarca — richiede nuova logica di IA specifica per lo
  stato, con relativi banchi di collaudo del posizionamento (sul modello di
  `_crit4-raggiungibile.js`, `_crit4-sovr.js`, visti fra i banchi trovati al
  punto 8, che già misurano raggiungibilità e sovrapposizioni dell'IA in
  altri contesti).
- **C — Solo il portiere/i due uomini più vicini si muovono**, il resto
  della squadra resta come nella formazione (via di mezzo fra A e B, basata
  su `rinvioPortiere` che già sceglie "il compagno più smarcato" fra i soli
  compagni, righe 18467-18473, senza toccare gli avversari).

**Raccomandazione**: **A** in una prima versione, **C** come evoluzione per
l'angolo (dove vedere il portiere posizionarsi e un paio di attaccanti
muoversi in area vale la pena, sul modello del "capT/celeb" già usato per
dare vita alla scena del gol, righe 11029-11046) — ma non prima che A sia
implementato e collaudato: introdurre da subito B (IA tattica nuova) su una
feature che tocca già tre taglie, l'attribuzione dei tocchi, la
determinismo dei sorteggi (punto 7) e almeno sette banchi di collaudo
diversi (punto 8) moltiplica il rischio di regressione senza una base
ferma da cui misurare "prima e dopo".

---

*Documento di censimento. Non modifica `CALCETTO-il-gioco.html` né alcuno
strumento in `strumenti/`. Nessuna decisione presa: le tre domande restano
aperte per il committente.*
