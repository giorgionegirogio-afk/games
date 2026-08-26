# Il piano della toppa ridotta L1.4 — 26 agosto 2026

Prodotto da una lettura a quattro voci (mappa degli ancoraggi, disco PASSA di oggi,
cancello _q-l14.js, sintesi) contro il gioco di oggi. Nessun file e' stato scritto:
questo e' il piano, e va eseguito leggendolo.

## La mappa dei tredici ancoraggi

MAPPA: 8 vivi (1, 3, 4, 5, 6, 7, 8, 9), 1 da riparare (2), 4 superati (10, 11, 12, 13). Nessun incerto.

IL SOSPETTO DEL COMMITTENTE E' CONFERMATO IN PIENO. La chiamata c'e' gia' nel gioco, portata da L2.3, e in forma migliore: `chiamaGiocatore(p,dirx,diry,durata)` (riga 14418), `puntoChiamata` (14400), `scansaAvversari` (14368), `slancioChiamata` (14379), `CHIAMA_T = 1.6` (14352), `CHIAMA_PESO = 140` (14360), il peso nel punteggio del ricevente (`if(q.chiamata>0) openness+=CHIAMA_PESO;` riga 10445 e la gemella 15169), il cronometro in updatePlayerFisica (12523-12532), l'azzeramento all'espulsione (12471) e al fischio (8121), lo sprint (9081) e il ramo di aiDecide (14507). I campi chiamataT/chiamataX/chiamataY compaiono 0 volte. Gli ancoraggi 10, 11, 12 e 13 sono quindi da CANCELLARE dalla toppa, non da riparare: applicarli metterebbe un secondo meccanismo di chiamata, morto, accanto a quello vivo. Fra i quattro, solo il 13/13 non combacia piu' come stringa; 10, 11 e 12 combaciano ancora ed e' proprio questo il pericolo — la toppa oggi si fermerebbe su 2 e 13 e, riparati quelli alla lettera, scriverebbe i doppioni senza protestare.

L2.3 aveva lasciato la porta aperta apposta. Righe 14336-14341 del gioco: «chiamato DA CHI HA LA PALLA — il ricevente candidato parte quando il trascinamento arma (voce L1.4); ... Nessuno dei due ingressi sta qui dentro: li collegano L1.4 e chi fara' il contesto NOI». Quindi L1.4 non deve costruire la chiamata: deve solo CHIAMARLA. Dentro il 'metti' del 9/13 va cancellata `chiamaCorsaL14`, sostituita la sua invocazione con `chiamaGiocatore(...)`, e cambiato `best.chiamataT>0` in `best.chiamata>0`.

IL MOTORE DEL PASSAGGIO INVECE MANCA DAVVERO, tutto: apriPassaggioL14, bersaglioL14, aggiornaPassaggioL14, eseguiPassaggioL14, L14_* = 0 occorrenze; il disco 'through' esegue ancora doFiltrante alla pressione (riga 9426) e il commento alla riga 9768 dice esplicitamente che il suo rilascio «resta inerte com'era». Gli otto ancoraggi vivi si applicano ancora tutti.

L'UNICA RIPARAZIONE E' IL 2/13, e non e' solo di stringa. La nuova 'cerca' (righe 9723-9730, in campo `riparazione`) parte dalla lettura unica del distacco `const tr=this.trascina(id,true);` che L1.3/L1.5 hanno gia' messo prima del delete: la riga `trPassa` del 'metti' vecchio va buttata, il ramo nuovo usa `tr`. E soprattutto il ramo nuovo va scritto come `else if(bt.act==='through' && a && a.passa){ ... }`, NON come `if(...)` indipendente: oggi dopo la graffa del ramo shot seguono `else if(bt.act==='slide'){` (9750) e `else if(bt.act==='swap' && ...)` (9771), che un `if` inserito in mezzo orfanerebbe, rompendo il file.

DA SAPERE, anche se non e' uno stato di ancoraggio: L1.6 ha nel frattempo dato un disco proprio all'appoggio semplice ('pass' -> doPassaggio, righe 9334 e 10478) e alla palla alta con destinatario ('cross' -> doCrossUmano, righe 9336 e 10490), e il commento alla riga 10474 dice «e' la riserva che ha bocciato L1.4, imparata». Prima di applicare 1, 2 e 9 conviene decidere se il passaggio mirato sul disco 'through' e' ancora quello che si vuole, o se le due meta' utili di L1.4 (la MIRA col trascinamento e la QUOTA) non vadano innestate sui dischi che L1.6 ha gia' costruito.

Il conteggio dei Math.random() non e' toccato da nessuno degli otto ancoraggi vivi: nessuna riga di quei 'metti' pesca un numero casuale (verificato leggendo il testo dei 'metti'; anche chiamaGiocatore, riga 14344, dichiara la stessa cosa per se').

### 1/13 — Touch5.start: PASSA apre la posa al posto di doFiltrante  [VIVO]

La stringa cercata c'e' 1 volta, riga 9426: `        else if(bt.act==='through') doFiltrante(t, humanSprint(t));`. Il verbo del disco piccolo PASSAGGIO esegue ancora ALLA PRESSIONE, e il commento sopra (righe 9428-9431, L1.6) lo conferma: «Tutti e quattro vivono sulla PRESSIONE, come il passaggio: il loro rilascio resta inerte». Nel gioco `apriPassaggioL14` compare 0 volte e nessuna altra funzione apre una posa di passaggio: `chargeKind==='passo'` esiste (4 volte) ma solo negli anticipi CON chargeGo (riga 10606 `}else if(p.chargeGo && p.chargeKind==='passo'){`), cioe' anticipi che maturano da soli, non pose tenute dal dito. ATTENZIONE d'insieme, non di ancoraggio: L1.6 ha aggiunto un disco 'pass' separato (riga 9334, etichetta PASSA -> doPassaggio, riga 10478) e un disco 'cross' (riga 9336 -> doCrossUmano, riga 10490), quindi l'appoggio semplice e la palla alta hanno gia' un tasto proprio; quello che manca e' il passaggio MIRATO col trascinamento sul disco 'through'.

### 2/13 — Touch5.chiudi: il rilascio del passaggio esegue, cancel/morto chiudono  [DA-RIPARARE]

Trovato 0 volte. Il gioco di oggi ha, fra `const a=this.atti[id];` (riga 9701) e il ramo shot, la lettura unica del distacco introdotta da L1.3/L1.5 e ri-ancorata il 20 agosto: riga 9723 `      const tr=this.trascina(id,true);` e riga 9724 `      const lettura=(bt.act==='shot' && a && !a.morto && a.carica) ? tr : null;`; e alla riga 9729 `        else if(!G.paused) releaseCharge(bt.t, lettura);` (due argomenti, non uno). La funzionalita' MANCA davvero: `eseguiPassaggioL14` 0 volte, `a.passa` 0 volte, e la riga 9768-9770 lo dice in chiaro: «Il disco piccolo quando dice PASSAGGIO non ha nessun ramo qui: quel verbo vive sulla pressione e il suo rilascio resta inerte com'era». DUE AVVERTENZE SUL 'metti', che va riscritto insieme al 'cerca': (a) la lettura `trPassa` e' ormai INUTILE — `tr` e' gia' letto senza condizioni alla riga 9723, prima del delete, quindi il ramo nuovo usi `tr` e basta; (b) subito dopo la graffa del ramo shot oggi c'e' un commento e poi `      else if(bt.act==='slide'){` (riga 9750) e `      else if(bt.act==='swap' && !annulla && !G.paused){` (riga 9771): inserire li' un `if(bt.act==='through'...)` INDIPENDENTE, come faceva il metti vecchio, ORFANEREBBE quegli `else if` e romperebbe il file. Il ramo nuovo va scritto `else if(bt.act==='through' && a && a.passa){ ... }` per restare dentro la catena.

RIPARAZIONE (la nuova stringa cerca):

```
      const tr=this.trascina(id,true);
      const lettura=(bt.act==='shot' && a && !a.morto && a.carica) ? tr : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t, lettura);
      }
```

### 3/13 — Touch5.chiudiPassaL14 accanto a chiudiCarica  [VIVO]

La stringa cercata c'e' 1 volta, righe 10129-10131: `  chiudiCarica(p){` / `    if(p && p.charge>=0 && !p.chargeGo && p.chargeKind==='tiro') chiudiAnticipo(p);` / `  },`. Nel gioco `chiudiPassaL14` compare 0 volte e non esiste nessuna gemella che chiuda una posa di passaggio: le uniche due righe con quelle tre condizioni (9868 in annullaCarica e 10130 in chiudiCarica) filtrano entrambe `chargeKind==='tiro'`.

### 4/13 — muoreAtto: la posa del passaggio si chiude, la corsa resta  [VIVO]

La stringa cercata c'e' 1 volta, righe 10140-10141 dentro `muoreAtto(id)`: `    a.morto=true;` / `    if(a.carica){ this.chiudiCarica(a.carica); a.carica=null; }`. Il campo `a.passa` non esiste (0 occorrenze di `.passa` in tutto il file), quindi non c'e' nessuna posa di passaggio da chiudere oggi e nessun doppione.

### 5/13 — azzera: nessuna posa di passaggio sopravvive alle dita alzate  [VIVO]

La stringa cercata c'e' 1 volta, riga 9890: `      if(bt.act==='shot' && (!a || a.carica)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }`. In azzera non c'e' nessun ramo per `bt.act==='through'` e `chiudiPassaL14` compare 0 volte.

### 6/13 — Touch5.passo: il ri-armo chiude anche la posa del passaggio  [VIVO]

La stringa cercata c'e' 1 volta, riga 10193: `      if(d && d.act!==a.act){` seguita da `        if(a.carica) this.chiudiCarica(a.carica);`. Il ri-armo oggi eredita solo la carica del tiro; non c'e' nessuna riga che tocchi una posa di passaggio (`a.passa` 0 volte).

### 7/13 — il tetto SHOT_HARDCAP non trasforma una posa di passaggio in un tiro  [VIVO]

La stringa cercata c'e' 1 volta, righe 12006-12007 dentro step(): `      p.charge+=dt;` / `      if(p.charge>SHOT_HARDCAP) releaseCharge(t);`, senza nessuna guardia su chargeKind. Oggi il difetto non si vede perche' il ciclo entra solo con `!p.chargeGo` (riga 12005) e TUTTE le cariche 'passo' di oggi nascono da `anticipa()` che mette sempre chargeGo (riga 11351 `p.charge=0; p.chargeKind=tipo; p.chargeT=durata; p.chargeGo=azione;`): la guardia serve solo dopo che 1/13 e 9/13 avranno creato la prima posa 'passo' SENZA chargeGo. Nessun doppione.

### 8/13 — il battito di L1.4 accanto a Touch5.passo  [VIVO]

La stringa cercata c'e' 1 volta, riga 11997: `  Touch5.passo(dt);`, preceduta dal commento «L1.1 — IL MOTORE D'INGRESSO BATTE QUI, e non altrove». `aggiornaPassaggioL14` compare 0 volte e nessun altro battito aggiorna un bersaglio di passaggio.

### 9/13 — le funzioni di L1.4 (posa, punteggio, chiamata, esecuzione)  [VIVO]

La stringa cercata c'e' 1 volta, riga 10758: `/* --- CROSS: balistica sui numeri di casa (z, gravita' 560, soglie`. Il motore del passaggio col dito manca per intero: `apriPassaggioL14`, `bersaglioL14`, `aggiornaPassaggioL14`, `eseguiPassaggioL14`, `chiamaCorsaL14`, `L14_` = 0 occorrenze ciascuno. Tutta l'impalcatura che il codice nuovo usa esiste gia' (`Touch5.trascina(id,finale)` riga 10082, `Touch5.R_ANNULLA: 96` riga 10008, `smarcato` 10422, `eseguiPassUmano` 10448, `puoPassare`, `chiudiAnticipo`). MA DENTRO IL 'metti' C'E' UN DOPPIONE DA RISCRIVERE, ed e' il piu' importante di tutta la mappa: la sotto-funzione `chiamaCorsaL14` (coi campi q.chiamataT/chiamataX/chiamataY) rifa' da zero il meccanismo che L2.3 ha gia' messo nel gioco — `chiamaGiocatore(p, dirx, diry, durata)` riga 14418, `puntoChiamata(p)` riga 14400, `scansaAvversari` riga 14368, `slancioChiamata` riga 14379, `const CHIAMA_T = 1.6;` riga 14352, `const CHIAMA_PESO = 140;` riga 14360. E L2.3 l'ha scritto APPOSTA per L1.4: righe 14336-14341 «chiamato DA CHI HA LA PALLA — il ricevente candidato parte quando il trascinamento arma (voce L1.4); ... Nessuno dei due ingressi sta qui dentro: li collegano L1.4 e chi fara' il contesto NOI». Poiche' 10/13-13/13 sono superati e non si applicheranno, i campi chiamataT/X/Y non li leggerebbe NESSUNO (0 occorrenze nel gioco) e la chiamata di L1.4 sarebbe codice morto. Quindi: dentro `aggiornaPassaggioL14` sostituire `chiamaCorsaL14(G.players[nuovo], a.passa)` con una chiamata a `chiamaGiocatore(...)` (che scansa gli avversari, rifiuta portiere/espulso/portatore, e azzera p.aiT), cancellare `chiamaCorsaL14`, e in `eseguiPassaggioL14` cambiare `if(best.chiamataT>0) G.stats.filtranti[t]=...` in `if(best.chiamata>0) ...`. Nota minore: nemmeno il vecchio 9/13 aggiungeva chiamataT al modello del giocatore (riga 7950 `chiamata:0, chiamaUX:0, chiamaUY:0, chiamaS:1,`), altro segno che quella meta' era gia' obsoleta.

### 10/13 — resetKickoff: la chiamata non sopravvive al fischio  [SUPERATO]

La stringa cercata c'e' ancora 1 volta (riga 8119 `    p.corsaArea=0;                                              // e la corsa in area`), ma DUE RIGHE SOTTO il gioco ha gia' esattamente cio' che l'ancoraggio vuole aggiungere, portato da L2.3 — riga 8121: `    p.chiamata=0;                                               // e la chiamata (L2.3)`. Applicarlo azzererebbe un secondo campo (chiamataT) accanto al primo, con lo stesso commento e nessun lettore.

### 11/13 — aiVuoleSprint: il chiamato ci va di corsa  [SUPERATO]

La stringa cercata c'e' ancora 1 volta (riga 9075 `  if(p.corsaArea) return true;      // chi attacca l'area ci va di corsa`), ma subito sotto, dopo un commento di sei righe, c'e' gia' riga 9081: `  if(p.chiamata>0) return true;`, con la spiegazione «e un chiamato pure: una chiamata al passo non e' una chiamata. La guardia del fiato e' quella qui sopra». Aggiungere `if(p.chiamataT>0) return true;` sarebbe una seconda riga identica su un campo che nessuno scrive piu'.

### 12/13 — aiMove: la chiamata e' un cronometro, non un interruttore  [SUPERATO]

La stringa cercata c'e' ancora 1 volta (righe 13985-13986 in aiMove), ma il cronometro della chiamata esiste gia' in updatePlayerFisica, righe 12523-12532: `  if(p.chiamata>0){` / `    const chi = G.ball.owner>=0 ? G.players[G.ball.owner] : null;` / `    if(chi===p || (chi && chi.team!==p.team)) p.chiamata=0;` / `    else p.chiamata=Math.max(0, p.chiamata-dt);` / `    if(p.chiamata<=0) p.aiT=0;`. La versione di oggi e' STRETTAMENTE MIGLIORE di quella dell'ancoraggio e il commento spiega perche' non sta in aiMove (righe 12499-12506): aiMove «gira solo per chi NON e' sotto il dito», mentre la chiamata deve valere anche per l'uomo comandato (contesto NOI). In piu' il gioco spegne la chiamata anche quando il pallone diventa DEL CHIAMATO (che l'ancoraggio non fa) e all'espulsione (riga 12471 `    p.chiamata=0;`). Applicarlo metterebbe un secondo cronometro, nel posto peggiore, su un campo morto.

### 13/13 — aiDecide: il chiamato corre dove la chiamata lo manda  [SUPERATO]

Trovato 0 volte perche' nel ramo del cross `puntoCaduta(b)` e' diventato `puntoTesta(b)` con un commento nuovo in mezzo (righe 14481-14492, «VOCE 7 (23 ago 2026): il punto giusto non e' dove il pallone TOCCA TERRA — e' dove SCENDE A QUOTA DI TESTA»). Ma NON serve ripararlo: cio' che l'ancoraggio vuole aggiungere e' gia' li', nella stessa identica posizione — subito sotto il ramo del cross, righe 14507-14511: `  if(p.chiamata>0){` / `    const c=puntoChiamata(p);` / `    p.aiTX=c[0]; p.aiTY=c[1];` / `    return;` / `  }`, preceduto dal commento (righe 14493-14506) «LA CHIAMATA (L2.3) VIENE PRIMA DI TUTTO IL RESTO — MA DOPO IL PALLONE CHE STA GIA' VOLANDO ADDOSSO A TE», che e' parola per parola la precedenza che l'ancoraggio motivava. Applicarlo creerebbe due rami di chiamata consecutivi.


---

« PIANO OPERATIVO — LA TOPPA RIDOTTA L1.4 »

Verificato di persona sul gioco di oggi: `C:/Users/Utenteee/Desktop/GitHub/games/CALCETTO-il-gioco.html`, md5 `9d87bf6405e9e01d3c0527be67613726`, 1.919.316 byte, 26 agosto 2026. Eseguito `node strumenti/_t-l14.js` (fallisce su 2/13 e 13/13) e contati tutti e tredici gli ancoraggi uno per uno.

I tre referti sono corretti nella sostanza. Ma ho trovato **tre cose che nessuno dei tre ha visto**, e una di queste è la più grave del fascicolo: applicando la toppa così com'è, **la linea di guida del passaggio smette di disegnarsi**. Ne parlo al §5. Prima l'elenco.

═══════════════════════════════════════════════════════════
0. LA DECISIONE CHE VIENE PRIMA DELL'ELENCO
═══════════════════════════════════════════════════════════

Il gioco, riga 10480, dice in chiaro: «Un concetto, un meccanismo — e' la riserva che ha bocciato L1.4, imparata». L1.6 ha già dato un disco proprio all'appoggio (`pass` → `doPassaggio`, righe 9340 e 10484) e alla palla alta (`cross` → `doCrossUmano`, righe 9342 e 10496). Quindi qualcuno deve decidere, PRIMA di applicare qualunque cosa: **la mira col trascinamento va sul disco `through` o sui dischi che L1.6 ha già costruito?**

**La mia raccomandazione: sul disco `through`, e su quello soltanto.** Tre ragioni misurabili:
- `pass` e `cross` sono verbi da tap che L1.6 ha inchiodato alla pressione, e `_q-l16.js` prove B (:313-340) e C li misura col dito ANCORA GIÙ. Spostarli romperebbe due prove invece di una.
- `through` è già oggi il verbo *mirato* (il cono `dot>0,5` di `scegliFiltrante`, :10550): sostituire un cono binario con un'inclinazione continua è la stessa promessa fatta meglio, non una promessa nuova.
- il costo dello spostamento su `through` è **una sola prova** (`_q-l16.js` F) più due giocate di `giocata.js`. Vedi §6.

Se invece si decide che `through` deve restare com'è, questo piano non serve: la toppa va abbandonata e le due metà utili (mira e quota) vanno riprogettate come modificatori dei dischi L1.6 — che è un'altra voce, non una riparazione di questa.

Tutto quello che segue assume la raccomandazione.

═══════════════════════════════════════════════════════════
1. L'ELENCO: APPLICARE o LASCIARE, tredici righe
═══════════════════════════════════════════════════════════

| # | stato oggi | verdetto | ragione in una riga |
|---|---|---|---|
| **1/13** `Touch5.start`: PASSA apre la posa | combacia 1× (riga 9432) | **APPLICARE**, con `cerca` ESTESA | il verbo va spostato, ma la `cerca` deve inglobare il commento L1.6 (9434-9437) che dichiara «Tutti e quattro vivono sulla PRESSIONE, come il passaggio» e che la toppa rende falso |
| **2/13** `Touch5.chiudi`: il rilascio esegue | **0×** | **APPLICARE**, con `cerca` e `metti` NUOVI | L1.3/L1.5 hanno riscritto il blocco: `tr` è già letto senza condizioni e `releaseCharge` prende due argomenti; il ramo nuovo va scritto come `else if`, non come `if` |
| **3/13** `chiudiPassaL14` accanto a `chiudiCarica` | combacia 1× (10135-10137) | **APPLICARE** tale e quale | nessuna gemella esiste: le due righe con quelle tre condizioni (9868, 10136) filtrano entrambe `chargeKind==='tiro'` |
| **4/13** `muoreAtto` chiude la posa | combacia 1× (10146-10147) | **APPLICARE** tale e quale | `.passa` compare 0 volte nel file: nessun doppione |
| **5/13** `azzera` | combacia 1× (riga 9890) | **APPLICARE** tale e quale | in `azzera` non c'è nessun ramo `through` |
| **6/13** il ri-armo chiude la posa | combacia 1× (10199-10200) | **APPLICARE** tale e quale | il ri-armo eredita oggi solo la carica del tiro |
| **7/13** `SHOT_HARDCAP` non spara la posa | combacia 1× (12035-12036) | **APPLICARE** tale e quale | **serve davvero**: la posa L1.4 ha `chargeGo=null`, quindi entra nel ciclo 12031-12038 e a 1,25 s farebbe partire `releaseCharge`, cioè UN TIRO |
| **8/13** il battito accanto a `Touch5.passo` | combacia 1× (riga 12026) | **APPLICARE** tale e quale | `aggiornaPassaggioL14` compare 0 volte |
| **9/13** le funzioni di L1.4 | combacia 1× (riga 10758 zona cross) | **APPLICARE, ma con TRE ESCISSIONI** | il blocco contiene `chiamaCorsaL14`, che rifà da zero il meccanismo di L2.3 già nel gioco. Vedi §3 |
| **10/13** `resetKickoff`: azzera la chiamata | combacia 1× (riga 8119) | **LASCIARE** | due righe sotto il gioco ha già `p.chiamata=0;` (riga 8121, L2.3): scriverebbe un secondo campo morto |
| **11/13** `aiVuoleSprint` | combacia 1× (riga 9075) | **LASCIARE** | il gioco ha già `if(p.chiamata>0) return true;` (riga 9081) |
| **12/13** `aiMove`: il cronometro | combacia 1× (13985-13986) | **LASCIARE** | il cronometro c'è già, e in `updatePlayerFisica` (12523-12532), che è **strettamente meglio**: aiMove «gira solo per chi NON è sotto il dito» e il chiamato può essere l'uomo comandato |
| **13/13** `aiDecide`: il ramo della chiamata | **0×** (`puntoCaduta`→`puntoTesta`, riga 14516) | **LASCIARE** | non va riparato: ciò che vuole aggiungere è già lì, nella stessa identica posizione, righe 14536-14540 |

**Bilancio: 9 da applicare (di cui 2 con `cerca` nuova e 1 con escissioni), 4 da cancellare.**

**IL PERICOLO CHE VA DETTO AD ALTA VOCE.** Fra i quattro da cancellare, **tre combaciano ancora** (10, 11, 12). La toppa oggi si ferma solo su 2 e 13; chi riparasse quei due alla lettera e rilanciasse, otterrebbe un file che si scrive **senza protestare** e che contiene due meccanismi di chiamata affiancati, di cui uno morto (`chiamataT/X/Y`: 0 lettori nel gioco). Il sospetto del committente è confermato in pieno.

═══════════════════════════════════════════════════════════
2. LE STRINGHE `cerca` NUOVE — copiate carattere per carattere
═══════════════════════════════════════════════════════════

Tutte verificate: **compaiono esattamente 1 volta** nel gioco di oggi (controllate con `split().length-1`).

──────────── 1/13 — `cerca` ESTESA ────────────

```
        else if(bt.act==='through') doFiltrante(t, humanSprint(t));
        else if(bt.act==='swap') cambiaGiocatore(t);
        /* L1.6 — i dischi nuovi. Tutti e quattro vivono sulla
           PRESSIONE, come il passaggio: il loro rilascio resta inerte
           (nessun ramo in Touch5.chiudi), quindi nessun touchcancel
           puo' produrre un calcio che il dito non ha chiesto. */
```

`metti`: la riga `through` diventa `apriPassaggioL14(t, id);`, la riga `swap` resta identica, e il commento L1.6 va riscritto — «vivono sulla pressione» adesso vale per **tre** dischi (`pass`, `cross`, `press`/`tackle`), non per quattro, e la frase «come il passaggio» diventa il suo contrario.

──────────── 2/13 — `cerca` NUOVA (righe 9729-9736) ────────────

```
      const tr=this.trascina(id,true);
      const lettura=(bt.act==='shot' && a && !a.morto && a.carica) ? tr : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t, lettura);
      }
```

`metti`: lo stesso testo, **invariato**, più il ramo nuovo subito dopo la graffa:

```js
      else if(bt.act==='through'){
        if(a && a.passa){
          if(annulla || a.morto || G.paused) this.chiudiPassaL14(a.passa);
          else eseguiPassaggioL14(a.passa, tr, a.su, a.bersaglio);
        }
      }
```

**Tre differenze obbligatorie rispetto al `metti` vecchio, e ognuna è un errore che romperebbe il file o sprecherebbe lavoro:**

1. **La riga `trPassa` va BUTTATA.** Il vecchio `metti` scriveva `const trPassa = (bt.act==='through' && ...) ? this.trascina(id,true) : null;`. Oggi `tr` è già letto **incondizionatamente** alla riga 9729, prima del `delete`. Leggerlo due volte vorrebbe dire percorrere due volte un anello di otto posizioni a ogni dito che si stacca — esattamente ciò che il commento riancorato del 20 agosto (righe 9715-9728) dice di aver evitato apposta. Il ramo nuovo usa `tr`.
2. **`else if`, non `if`.** Dopo la graffa del ramo `shot` la catena continua: `else if(bt.act==='slide'){` (riga 9756) e `else if(bt.act==='swap' && ...)` (riga 9777). Un `if` indipendente inserito lì in mezzo **orfanerebbe quei due `else` e romperebbe il file**.
3. **La guardia interna, non nella condizione.** Scritto come `else if(bt.act==='through'){ if(a && a.passa){...} }` invece che `else if(bt.act==='through' && a && a.passa)`: così un `through` senza posa (perché `puoPassare` aveva rifiutato) non ricade sui rami `slide`/`swap` sottostanti. Funzionalmente equivalente oggi, ma non dipende dall'ordine dei rami.

`tr` è sempre un oggetto, mai `null`, per un atto vivo (riga 10088-10103: torna `null` solo se l'atto non c'è) e per un atto morto torna `armato:false`. Quindi `eseguiPassaggioL14` riceve sempre una lettura valida.

═══════════════════════════════════════════════════════════
3. LE TRE ESCISSIONI DENTRO IL `metti` DEL 9/13
═══════════════════════════════════════════════════════════

Il blocco del 9/13 è ~170 righe e contiene **metà della roba superata**. L2.3 ha scritto la chiamata *per* L1.4 e le ha lasciato la porta aperta — righe 14365-14371 del gioco:

> «chiamato DA CHI HA LA PALLA — il ricevente candidato parte quando il trascinamento arma (voce L1.4) [...] Nessuno dei due ingressi sta qui dentro: li collegano L1.4 e chi fara' il contesto NOI.»

**L1.4 non deve costruire la chiamata: deve solo CHIAMARLA.** Tre tagli.

──────────── ESCISSIONE A — cancellare `chiamaCorsaL14` per intero ────────────

Via il commento (`/* LA CHIAMATA: il candidato parte — 1,6 s di corsa...`) e via la funzione:

```js
function chiamaCorsaL14(q, p){
  const gx=q.team===0?FW:0;
  ...
  q.chiamataT=L14_CORSA;
  q.chiamataX=clamp(q.x+ux/ul*150, 30, FW-30);
  q.chiamataY=clamp(q.y+uy/ul*150, 30, FH-30);
}
```

Rifà, peggio, ciò che il gioco ha in `chiamaGiocatore` (:14447), `puntoChiamata` (:14429), `scansaAvversari` (:14397), `slancioChiamata` (:14408). Peggio in quattro modi misurati dal gioco stesso:
- **punto fisso a 150 unità** contro la carota mobile: «Un punto fisso a 170 unita' se lo mangerebbe in meno di un secondo» (:14416-14418);
- **nessuno scansamento degli avversari** — L2.3 misura 47,35 unità di franco ricalcolando contro 64,53 tenendo la direzione (`_q-l23.js` prova B, :14471-14474);
- **nessun rifiuto** su portiere / espulso / portatore, e il gioco spiega perché il portiere è fatale: «il cronometro sta in updatePlayerFisica DOPO il ramo del portiere, quindi una chiamata su un portiere non scadrebbe piu'» (:14439-14441);
- **nessun peso nel punteggio del ricevente**: `if(q.chiamata>0) openness+=CHIAMA_PESO;` (:10451) legge `chiamata`, non `chiamataT`.

**Cancellare anche la costante `const L14_CORSA = 1.6;`**: `CHIAMA_T = 1.6` esiste già (:14381) ed è il valore di casa. Nota di merito: il commento del blocco dice «le sei costanti di questa voce» e ne dichiara sette — togliendo `L14_CORSA` il commento diventa vero.

──────────── ESCISSIONE B — la chiamata, dentro `aggiornaPassaggioL14` ────────────

Dove il blocco dice:

```js
      if(nuovo>=0 && nuovo!==a.bersaglio){
        a.bersaglio=nuovo;
        chiamaCorsaL14(G.players[nuovo], a.passa);
      }
```

va scritto invece — conservando il mix 60% «continua la linea del passaggio» / 40% «piega verso la porta», che è l'unica idea buona di `chiamaCorsaL14`, e consegnando normalizzazione, scansamento, clamp, rifiuti e `aiT=0` a `chiamaGiocatore`:

```js
      if(nuovo>=0 && nuovo!==a.bersaglio){
        a.bersaglio=nuovo;
        /* LA CHIAMATA NON LA COSTRUISCE L1.4: LA CHIAMA. Il meccanismo e'
           quello di L2.3 (chiamaGiocatore, puntoChiamata, il peso
           CHIAMA_PESO dentro smarcato), e L2.3 ha lasciato questo
           ingresso aperto apposta. Qui si decide solo la DIREZIONE: la
           linea del passaggio che continua (60%) piegata verso la porta
           (40%). Lo scansamento, i clamp, i tre rifiuti e il riavvio di
           aiT sono suoi e restano suoi. */
        const q=G.players[nuovo], pp=a.passa;
        const gx=(q.team===0?FW:0);
        const dx=q.x-pp.x, dy=q.y-pp.y, dl=Math.max(1,len(dx,dy));
        const vx=gx-q.x, vy=FH/2-q.y, vl=Math.max(1,len(vx,vy));
        chiamaGiocatore(q, dx/dl*0.6+vx/vl*0.4, dy/dl*0.6+vy/vl*0.4);
      }
```

`chiamaGiocatore` dichiara di sé, riga 14373-14375: «NESSUNA DI QUESTE RIGHE PESCA UN NUMERO CASUALE». Il conteggio dei `Math.random()` resta invariato.

──────────── ESCISSIONE C — il contatore delle filtranti ────────────

Dentro `eseguiPassaggioL14`:

```js
    if(best.chiamataT>0) G.stats.filtranti[t]=(G.stats.filtranti[t]||0)+1;
```
→
```js
    if(best.chiamata>0) G.stats.filtranti[t]=(G.stats.filtranti[t]||0)+1;
```

──────────── E la lista `attesi` dopo la sostituzione (righe 582-591 della toppa) ────────────

Va riscritta, altrimenti la toppa fallisce da sola su campi che ha appena smesso di scrivere:

- **togliere**: `['function chiamaCorsaL14(', 1]`, `['p.chiamataT', 7]`, `['chiamataX', 2]`, `['chiamataY', 2]`
- **tenere invariati**: `chiudiPassaL14` resta **6** (definizione + 4/13 + 5/13 + 6/13 + 2/13 + `apriPassaggioL14`), `apriPassaggioL14(t, id)` resta **2**, `L14_AGG   = 60` resta **1** (il controllo negativo C2 di `_q-l14.js` la cerca con quella spaziatura esatta, tre spazi)
- **aggiungere**: `['chiamaGiocatore(q, dx/dl*0.6', 1]` e `['best.chiamata>0', 1]` — e `['chiamataT', 0]`, che è la cintura contro il ritorno del campo morto.

**Bonus non richiesto ma vero.** Il 13/13 non combacia perché `puntoCaduta(b)` è diventato `puntoTesta(b)` (:14516, VOCE 7 del 23 agosto). Quel cambio rende la palla alta di L1.4 **migliore** di quando la toppa fu scritta: `eseguiPassaggioL14` scrive `b.crossTo=bi`, e il ricevente adesso corre dove il pallone «SCENDE A QUOTA DI TESTA» invece che dove tocca terra (6,3% di cross giocati per aria contro il 30% chiesto, prima della VOCE 7). Non serve fare niente: si eredita.

═══════════════════════════════════════════════════════════
4. TRE ANCORAGGI NUOVI CHE NESSUNO DEI TRE REFERTI HA VISTO
═══════════════════════════════════════════════════════════

──────── NUOVO 10 — il commento L1.5 che diventa falso (riga 9774-9776) ────────

`cerca` (verificata, 1 volta):

```
         Il disco piccolo quando dice PASSAGGIO non ha nessun ramo qui:
         quel verbo vive sulla pressione e il suo rilascio resta inerte
         com'era. */
```

Dopo la toppa questa frase è falsa parola per parola. In questa casa un commento superato si rettifica in chiaro, con la data.

──────── NUOVO 11 e 12 — **LA LINEA DI GUIDA MUORE.** Il difetto più grave del fascicolo ────────

**Nessuno dei tre referti l'ha visto, ed è quello che manderebbe in produzione una regressione silenziosa.**

`segniGuida` (riga 10611) disegna la linea del passaggio solo dentro questo ramo, riga 10633:

```js
    }else if(p.chargeGo && p.chargeKind==='passo'){
```

`apriPassaggioL14` apre la posa con **`chargeGo=null`** — è la firma stessa delle tenute del dito, quella che le distingue dagli anticipi automatici. Quindi dopo la toppa:

- il primo ramo (`!p.chargeGo && p.chargeKind==='tiro'`) è falso — non è un tiro;
- il secondo (`p.chargeGo && p.chargeKind==='passo'`) è falso — non c'è `chargeGo`;
- **`segniGuida` torna un array vuoto. Tenendo PASSAGGIO non si vede più niente.**

Oggi invece la linea si disegna: `doFiltrante` passa da `anticipa(p,'passo',PASS_CAR_U,eseguiFiltrante)` (:10717), che riempie `chargeGo`, e `segniGuida` disegna con `scegliFiltrante`. Conseguenze:

1. **`_q-linea.js` prova B va ROSSA** — 36 pressioni su 'through', linea «assente» 36 volte su 36. È il cancello che garantisce che promessa ed esecuzione non divergano.
2. **La toppa non consegna il suo argomento di vendita.** Il referto §CHE COSA UN UMANO NON PUÒ FARE dice: «la linea si aggiorna mentre il dito si muove, cosi' il giocatore VEDE chi ricevera' prima di lasciare». Con la toppa così com'è, **non vede niente**: si mira alla cieca, per una durata a scelta, pagando il 45%.
3. L'intestazione della toppa (righe 78-79) dice «questa toppa non disegna nulla (Legge 3 — l'anteprima e' la voce L3.1)». Era vero il 20 agosto, quando L3.1 non c'era. **Adesso L3.1 è nel gioco, e la toppa la spegne.**

**La cura, e non è una riga.** Servono due ancoraggi nuovi:

- **NUOVO 11** — un piccolo cercatore in `Touch5`, accanto a `contiene(t)` (righe 10123-10129), che risponda «quale atto tiene la posa di questo giocatore?». `contiene` è il modello esatto: scandisce `this.atti`, non accende nessuno stato, e quando l'atto smette di esistere la risposta cambia da sola. `cerca` suggerita: il corpo di `contiene`, che compare 1 volta.

  ```js
  /* L1.4 — quale dito tiene la posa del passaggio di questo giocatore.
     Stessa forma di contiene() qui sopra, e per la stessa ragione: non
     c'e' nessuno stato da accendere e da spegnere. Torna l'id del tocco
     oppure null. Al massimo tre atti vivi: e' una scansione, non un
     costo. */
  posaDi(p){
    for(const id in this.atti){
      const a=this.atti[id];
      if(a.passa===p && !a.morto && this.btnTouch[id]) return id;
    }
    return null;
  },
  ```

- **NUOVO 12** — il ramo in `segniGuida`. `cerca` (verificata, 1 volta): `    }else if(p.chargeGo && p.chargeKind==='passo'){`
  Va inserito **prima** un ramo `}else if(!p.chargeGo && p.chargeKind==='passo'){` che legge `Touch5.posaDi(p)`, poi `Touch5.trascina(id,false)` (la lettura VIVA — lo scarto dei 60 ms appartiene al distacco, non all'anteprima), e chiama **`bersaglioL14`, cioè la stessa funzione che eseguirà il calcio**. È la legge di L3.1 alla lettera, riga 10528-10532: «sono ESTRAZIONI riga per riga dagli esecutori, non copie: la promessa della linea e l'esecuzione del calcio passano dallo stesso testo, quindi non possono divergere (la lezione di L0.4b)». Sopra `L14_SU`=40 px deve emettere `arco-cross` invece di `linea-passaggio`, perché la palla si alza e una linea dritta prometterebbe un rasoterra che non arriverà.
  `segniGuida` è dichiarata **PURA** (riga 10608-10609: «niente scritture, niente sorteggi — zoneInterfaccia la chiama anche piu' volte per fotogramma»). `posaDi`, `trascina(id,false)` e `bersaglioL14` sono tutte letture: la purezza regge. **Non** risolvere questo scrivendo il bersaglio in un campo del giocatore dentro `aggiornaPassaggioL14`: sarebbe stato nuovo da azzerare in `resetKickoff`, all'espulsione e al touchcancel, cioè quattro modi nuovi di lasciare un latch appeso.

**Costo onesto:** ~35 righe di codice nuovo che la toppa del 20 agosto non contiene e non poteva contenere. Chi la esegue deve saperlo prima di cominciare, non dopo.

═══════════════════════════════════════════════════════════
5. IL RISCHIO IN CHIARO — cosa si rompe spostando il verbo
═══════════════════════════════════════════════════════════

**A. Il contratto del comando cambia in tre modi, e due si pagano in campo.**

1. **Il portatore rallenta per tutta la mira.** Riga 12683: `const slow = p.charge>=0 ? 0.45 : (contieni ? JOCKEY_V : 1);`. Oggi premere PASSAGGIO costa 50 ms di 45%; dopo la toppa si paga per l'intera tenuta. La toppa lo dichiara (righe 83-86), ma va misurato, non solo dichiarato.
2. **Il tap rallenta di ~50 ms.** Il calcio passa dal «50 ms dopo la pressione» al «al rilascio». Per un tap da 100 ms sono 50 ms in più; per uno da 50 ms non cambia niente.
3. **`through` è l'unico verbo dei sei che cambia lato.** `pass`, `cross`, `press`, `tackle`, `slide` (pressione) e `swap` restano dove sono. Il disco piccolo diventa l'unico con due semantiche diverse fra i quattro.

**B. La posa non ha NESSUNA scadenza automatica, ed è una novità.** `maturaAnticipi` salta le pose senza `chargeGo` (riga 11401: `if(!p.chargeGo) continue;`), quindi non le chiude nemmeno quando il pallone se ne va (riga 11403, `pallaAPortata`). E l'ancoraggio 7/13 toglie l'unica altra valvola, `SHOT_HARDCAP`. Restano solo `chiudi` / `azzera` / `muoreAtto` / ri-armo — **tutti e quattro dipendono da un evento del dito**.

Peggio: il ciclo 12031-12038 lavora su `ctrlPlayer(t)`. `_q-l11.js` ha misurato che quando la palla viene rubata **il gioco cambia comandato da solo**, e la carica resta aperta «su un uomo che nessuno comanda piu'» (righe 9694-9701). Con `a.passa` la chiusura è sull'uomo giusto — quello che l'ha aperta — **ma solo se l'evento arriva**. Questa è la stessa classe di difetto per cui `_q-l11.js` esiste, su un campo nuovo. Va rimisurata, non dedotta.

**C. Le conquiste già misurate: chi tocca il file, chi no.**

- **L1.2 la scivolata sul trascinamento** — non toccata. Il ramo `slide` (riga 9756) è un altro `act` e legge lo stesso `tr`. **Rischio: sintattico**, non semantico: il ramo nuovo va incastrato nella catena senza orfanare `else if(bt.act==='slide')`.
- **L1.5 il raddoppio** — non toccato, ma il suo commento (9774-9776) diventa falso. NUOVO 10.
- **L1.6 i dischi nuovi** — `pass`, `cross`, `press`, `tackle` non cambiano di un byte. Il loro commento comune (9434-9437) diventa falso. Ancoraggio 1 esteso.
- **L1.3 la mira del tiro** — non toccata. Ma il blocco che `tr`/`lettura` abitano è lo stesso, e l'ancoraggio 2 lo riscrive: **la nuova `cerca` deve includere la riga `lettura` per intero**, o la toppa applicata dopo una futura ri-ancoratura di L1.3 andrebbe a vuoto.
- **L2.3 la chiamata** — non toccata, **e finalmente accesa**: `chiamaGiocatore` oggi ha 0 chiamanti (5 occorrenze: 1 definizione, 4 commenti). Con l'escissione B ne acquista uno. Da qui in avanti `p.chiamata` diventa un campo VIVO, e ogni banco che non lo azzera nella sua scena diventa sporco.

**D. I cancelli che vanno ROSSI — e sono tre, non due.**

| cancello | cosa fa oggi | dopo |
|---|---|---|
| **`_q-l16.js` prova F** (:440-457) | posa il dito su `through`, avanza 8 fotogrammi **col dito ancora giù**, pretende 1 calcio | **ROSSO**: 0 calci. Va riscritta nella stessa passata, dichiarando il cambio |
| **`_q-l16.js` prova B** (:313-340) | **preme `pass`**, non `through` | **RESTA VERDE.** La mappa dice «B e F leggerebbero zero calci»: **sbagliato per B** — il disco `pass` non lo tocca nessuno |
| **`giocata.js` GIOCATE.filtrante** (:408-423) | preme `through` 80 ms, pretende `G.stats.filtranti` **+1** | **ROSSO**: 80 ms senza trascinamento = non armato = `eseguiPassUmano` = le filtranti non salgono |
| **`giocata.js` GIOCATE.cross** (:424-455) | preme `through` con la levetta oltre `STICK_SPRINT`, pretende `G.stats.cross` **+1** via il ramo `comeCross` di `doFiltrante` | **ROSSO**: `through` non passa più da `doFiltrante`, il ramo `comeCross` non esiste più per il dito. **Va ri-puntata sul disco `cross` di L1.6** |
| **`giocata.js` GIOCATE.passaggio** (:346-359) | preme `through` 80 ms con cono vuoto, pretende filtranti NON salite + `passTo` | **RESTA VERDE** |
| **`_q-linea.js` prova B** (:611+) | 36 pressioni su `through`, legge i pixel GESSO della linea | **ROSSO 36/36** finché non si fa NUOVO 12 (§4) |
| **`_prova-dieci.js`** (:210, :266) | `premi('through', 90)` poi legge dopo 260 ms | **RESTA VERDE**: il criterio è «la palla si è mossa», e al rilascio si muove |

**E. I due banchi già invecchiati, da riparare PRIMA di poterli credere.**

- `_q-l14.js:207` e `_q-l15.js:224` scelgono il disco **per raggio minimo**: `bt.reduce((a, c) => (c.r || 0) < (a.r || 0) ? c : a, bt[0])`. Con i quattro dischi di L1.6 il minimo è 26 (`pass`), non 30 (`through`): `_q-l14.js` esce **2** senza misurare niente, accusando un difetto di possesso che non esiste. Il modo giusto è già in casa — `_q-l16.js:267`: `bt.find(b => b.act === atto)`; e `_q-linea.js:408` è già stato riparato il 23 agosto con `bt.find(c => (c.r | 0) === 30)`.
- `_q-l14.js:151` azzera `q.chiamataT` (campo inesistente) invece di `q.chiamata`. **Oggi è innocuo; con la toppa ridotta diventa un banco sporco lo stesso giorno**, perché il dito comincia davvero a chiamare e le chiamate del riscaldamento sopravvivono dentro la scena.
- `_q-l14.js` A2 (`punteggiL14`, :230-254) ricopia `smarcato()` **senza** `if(q.chiamata>0) openness+=CHIAMA_PESO;` (gioco :10451). Il chiamato varrebbe **+140 nel gioco e +0 nel banco**, contro una tolleranza di 80: **A2 boccerebbe un'implementazione corretta.** Va riscritta, non solo rieseguita.

**F. I comandi da lanciare, nell'ordine.**

```
# 0. produrre il candidato, mai --dentro alla prima passata
node strumenti/_t-l14b.js --out fuori/l14.html

# 1. i cancelli che DEVONO restare verdi (nessuno tocca il verbo spostato)
node strumenti/_q-l11.js       --gioco fuori/l14.html   # l'orfano: la posa segue l'uomo giusto
node strumenti/_q-l12.js       --gioco fuori/l14.html   # la scivolata: la catena else-if regge
node strumenti/_q-riarmo.js    --gioco fuori/l14.html   # R_ARMA e il ri-armo con la posa nuova
node strumenti/_q-precedenza.js --da fuori/l14.html     # touchBtnLayout non guadagna dipendenze
node strumenti/_q-l23.js       --gioco fuori/l14.html   # la chiamata di L2.3 con un chiamante vivo
node strumenti/_q-l15.js       --gioco fuori/l14.html   # DOPO aver riparato :224

# 2. i cancelli che vanno ROSSI e vanno riscritti nella stessa passata
node strumenti/_q-l16.js       --gioco fuori/l14.html   # F: 0 calci col dito giu'
node strumenti/_q-linea.js     --gioco fuori/l14.html   # B: 36/36 assente senza NUOVO 12
node strumenti/giocata.js --tutte --gioco fuori/l14.html # filtrante e cross

# 3. il cancello della voce, DOPO le tre riparazioni (:207, :151, A2)
node strumenti/_q-l14.js       --gioco fuori/l14.html

# 4. la vita vera
node strumenti/_prova-dieci.js --minuti 2               # e poi senza --minuti
node strumenti/_p-passaggi.js  --json fuori/tel-dopo.json
node strumenti/_p-passaggi.js  --contro fuori/tel-prima.json
```

`_p-passaggi.js` è l'unico che misurerebbe il danno di un rilascio riacceso male: conta i passaggi che **arrivano** e i calci non richiesti nei 400 ms dopo lo stacco del pollice. Va girato **prima** (sul gioco di casa, per la linea di base) e **dopo**.

**G. Il conteggio dei `Math.random()`.** Nessuno dei nove ancoraggi da applicare pesca un numero casuale, e `chiamaGiocatore` lo dichiara di sé (:14373-14375). Il numero di siti di sorteggio non cambia, nessun sorteggio si sposta fuori da un corto circuito `&&`, e a mani libere `aggiornaPassaggioL14` attraversa un oggetto vuoto: **le partite CPU contro CPU restano identiche al bit**. Una sola avvertenza da scrivere: `chiamaGiocatore` fa `p.aiT=0` (:14492), quindi **col dito giù** la ripianificazione di quel giocatore anticipa e la *sequenza* dei sorteggi si sfasa. Non viola la convenzione (il conteggio non cambia), ma i banchi a seme fisso **con dito** non sono confrontabili bit a bit prima/dopo. Va detto in intestazione.

═══════════════════════════════════════════════════════════
6. VERDETTO ONESTO: RISCRIVERE, non riparare
═══════════════════════════════════════════════════════════

**La mia conclusione è che `_t-l14.js` va sostituito da un file nuovo — `strumenti/_t-l14b.js` — e non riparato in loco.** Non perché il lavoro dentro sia sbagliato: gli ancoraggi 1, 3, 4, 5, 6, 7, 8 sono buoni e vanno **salvati alla lettera**. Ma perché il file, come artefatto, è dichiarativo prima che esecutivo, e le sue dichiarazioni oggi sono false in troppi punti perché una toppa alla toppa resti leggibile:

1. **Il 31% degli ancoraggi va cancellato, e tre dei quattro combaciano ancora.** Un file che va bene solo se chi lo lancia si ricorda di non lanciarlo per intero non è una toppa ancorata: è una trappola. Il rifiuto automatico — l'unica garanzia del meccanismo — qui non scatta.
2. **L'intestazione (righe 1-100) è falsa in cinque punti**, e in questa casa un numero superato non si spedisce: `chiamataT` è il campo sbagliato (righe 52-54); «delta=20 rifiuta una mira su venti a taglia 5» è smentito dal censimento B rifatto oggi (mediana 165 → 124,2; 5,9% → **9,8%**, cioè una su dieci); «questa toppa non disegna nulla» era vero prima di L3.1 e adesso descrive una regressione; «l'APPOGGIO SICURO» duplica il disco `pass` di L1.6; «questo pulsante e' l'unico modo di passare col dito» è falso da tre giorni.
3. **Il blocco più grande (9/13) va operato in tre punti** e la sua lista `attesi` va rifatta: non è una riparazione di stringa, è una riscrittura del corpo.
4. **Servono tre ancoraggi che non esistono** (§4), di cui due — `Touch5.posaDi` e il ramo di `segniGuida` — sono codice nuovo, non spostamento di codice.
5. **Il cancello che la giudica non gira**, e tre dei suoi dieci controlli non sono credibili nemmeno da verdi (F1 e `okCorsa` di E sono verdi falsi per mancanza di gemello negativo; D accusa il `touchcancel` di un calcio nato alla pressione; A2 boccerebbe un'implementazione corretta).

**Che cosa conservare, concretamente.** Il nuovo `_t-l14b.js` porta **12 ancoraggi**: 1 (esteso), 2 (nuovo), 3, 4, 5, 6, 7, 8 (verbatim), 9 (con le tre escissioni), più NUOVO 10 (commento L1.5), NUOVO 11 (`Touch5.posaDi`), NUOVO 12 (`segniGuida`).

**E `_t-l14.js` va lasciato sul disco, intatto.** È il verbale di ciò che fu proposto e in parte bocciato, e la riga 10480 del gioco — «e' la riserva che ha bocciato L1.4, imparata» — ha senso solo finché il documento bocciato esiste ancora. Il file nuovo lo cita in intestazione e dice quali quattro ancoraggi ha lasciato indietro e perché.

**FILE RILEVANTI** (percorsi assoluti)
- `C:/Users/Utenteee/Desktop/GitHub/games/CALCETTO-il-gioco.html`
- `C:/Users/Utenteee/Desktop/GitHub/games/strumenti/_t-l14.js` (da conservare, non modificare)
- `C:/Users/Utenteee/Desktop/GitHub/games/strumenti/_t-l14b.js` (da scrivere)
- `C:/Users/Utenteee/Desktop/GitHub/games/strumenti/_q-l14.js` (righe 151, 207, 230-254 da riparare prima di crederle)
- `C:/Users/Utenteee/Desktop/GitHub/games/strumenti/_q-l15.js` (riga 224, stesso difetto del raggio minimo)
- `C:/Users/Utenteee/Desktop/GitHub/games/strumenti/_q-l16.js` (prova F da riscrivere; riga 267 è il modello giusto)
- `C:/Users/Utenteee/Desktop/GitHub/games/strumenti/_q-linea.js` (prova B: rossa finché manca NUOVO 12)
- `C:/Users/Utenteee/Desktop/GitHub/games/strumenti/giocata.js` (GIOCATE.filtrante e GIOCATE.cross da ri-puntare)
- `C:/Users/Utenteee/Desktop/GitHub/games/strumenti/_p-passaggi.js` (linea di base da prendere PRIMA)

Nessun file scritto o modificato: questo è solo il piano.
