# Rimesse e angoli — piano di esecuzione (voce #87)

> **Per chi esegue:** SOTTO-SKILL RICHIESTA: usare `superpowers:subagent-driven-development` (consigliata) oppure `superpowers:executing-plans` per eseguire il piano un compito alla volta. I passi usano caselle (`- [ ]`) per il tracciamento.

**Obiettivo:** il campo impara le sue linee — a 11 sempre, a 5/7 a scelta: la fascia rende una rimessa laterale, il fondo un angolo o un rinvio, con un fermo percepibile e la battuta coi verbi di casa; la GABBIA resta il gioco di oggi, identico al bit.

**Architettura:** un interruttore (`SAVE.sponde`) fotografato in `G.campoVero` a inizio partita; in `ballWalls` le sponde a campo vero chiamano `pallaFuori()` invece di rimbalzare; una scena nuova sola (`'battuta'`) col fermo sul modello di `kickoff` e il piazzamento in `posaBattuta()` (gemello parametrizzato di `resetKickoff`); alla ripresa il battitore ha la palla e la batte coi verbi esistenti (PASSA/CROSS/FILTRANTE), con TIRA spento da UNA guardia letta da due posti (lezione #88). Il banco `_q-battute.js` nasce PRIMA e condanna.

**Tecnologia:** un solo file HTML (`CALCETTO-il-gioco.html`), banchi in `strumenti/*.js` con Node e Playwright, attrezzi a àncore (`_t-*.js`) applicati con `--dentro`.

## Vincoli globali

- **La GABBIA è intoccabile**: a 5 e 7 col default (`SAVE.sponde` assente o `'gabbia'`) il due-versioni (`_c3-sorteggi --taglie 5,7`) deve dare **0 divergenze a ogni compito**. A 11 (campo vero obbligatorio) il ramo **DICHIARA la divergenza per costruzione** dal compito 2 in poi: si misura per taglia (`--taglie 11`) e si scrive il numero nel rapporto, mai nasconderlo (precedente del ramo #86).
- `_q-determinismo` (taglia 5) 10/10 a ogni compito. **Nessun `dado()` nei rami di classificazione dell'uscita** (fascia/fondo/ultimo tocco) né nei fallback: un pareggio di casi si risolve con una regola fissa dichiarata, non con un sorteggio.
- Ogni modifica al gioco passa da un **attrezzo a àncore** (`strumenti/_t-*.js`) con `cerca`/`metti` esatti e conteggi attesi; si cerca per nome, mai per riga (i `file:riga` di questo piano valgono sull'HEAD `d91dc41` e vanno riverificati col grep).
- Ogni prova nuova deve **saper condannare**: rossa sul gioco pre-cura (copia in `fuori/`) prima di essere creduta.
- **Lezione dei letterali di boot** (voce #86 compito 5): ogni costante o campo nuovo va verificato anche sul PRIMO avvio della pagina (la partita a 5 di default parte senza passare da `setTaglia`).
- **Una guardia, due lettori** (voce #88, `puoContrastoPremuto` :16208): quando un pulsante si spegne, la condizione del layout e la condizione dell'atto devono essere la STESSA funzione, di primo livello e sotto i 2.000 caratteri (così `_q-precedenza` la estrae da sola).
- Commenti nel codice senza lettere accentate; documenti con gli accenti veri. Un commit per compito, col verbale nel messaggio.
- **Le fonti tecniche sono committate**: `_analisi/RIMESSE-E-ANGOLI.md` (censimento + edizione del 17 settembre con le righe fresche), `_analisi/MINIERA-FCM.md` §7 (il paragone), lo spec `docs/superpowers/specs/2026-09-17-rimesse-e-angoli-design.md`. Ogni compito le legge PRIMA di scrivere àncore.
- **Nomi vincolanti del cantiere** (la collisione è già stata pagata: `G.ripresa` è la ripresa dedicata del gol, :16627, `__test.ripresa` :42715): scena `'battuta'`, struttura `G.battuta`, `G.campoVero`, `pallaFuori`, `posaBattuta`, `inBattuta`, `SAVE.sponde`, banco `strumenti/_q-battute.js`, seme di cantiere **20260917**.

## Soglie di accettazione (dallo spec, vincolanti)

1. GABBIA = il gioco di oggi: a 5/7 default zero divergenze di sorteggi e rimbalzo intatto (prova GABBIA del banco).
2. Campo vero: fascia → rimessa alla squadra opposta all'ultimo tocco; fondo fuori luce → angolo (tocco della difesa) / rinvio (tocco dell'attacco); a 11 sempre campo vero, la riga di GIOCA si blocca.
3. Battuta: battitore comandato coi verbi di casa, TIRA spento finché non batte, auto-battuta entro ~3 s, CPU col suo timer; gli avversari non pressano il battitore in finestra.
4. Fermi: rimessa e rinvio ~0,8 s; angolo 1,2 s a 5 / 1,5 s a 7 e 11, camera sul punto.
5. La clip nuova della rimessa passa `gabbia.js`; screenshot di rimessa e angolo guardati e descritti.
6. Giocabilità: `_eventi` a 11 e a 5-campo-vero — momenti da porta al minuto ≥ 80% del pre-ramo e 0-0 ≤ 33%; i numeri nel verbale.
7. Batteria verde con `_q-battute` dentro (`conta:true`).

---

### Compito 1: L'interruttore SPONDE, e il banco `_q-battute.js` nasce rosso

**File:**
- Creare: `strumenti/_t-sponde-interruttore.js` (attrezzo a àncore), `strumenti/_q-battute.js` (banco)
- Modificare (via attrezzo): `CALCETTO-il-gioco.html` — `defaultSave()` e `loadSave()` (:9747-9884), HTML di GIOCA sotto `#taglieRow` (:3277-3281), il blocco JS di `refreshTaglieRow` (:39211-39223), `startMatch` (fotografia di `G.campoVero`), `window.__test` (:42068-42796, due getter).

**Interfacce:**
- Consuma: il pattern `#taglieRow` + `refreshTaglieRow` + `persistSave()` (:9895); la sanificazione di `loadSave` (una riga per campo, es. `:9779` per `moviola`); l'hook `get save(){ return SAVE; }` (:42731) che i banchi useranno per scrivere `t.save.sponde` prima di `startMatch`.
- Produce: `SAVE.sponde ∈ {'gabbia','campo'}`, default `'gabbia'` in `defaultSave()`, sanificato in `loadSave` (`if(j.sponde==='campo'||j.sponde==='gabbia') s.sponde=j.sponde;`); riga HTML `#spondeRow` con due bottoni `data-s="gabbia"|"campo"` (etichette: `LA GABBIA <small>si gioca di sponda</small>` / `IL CAMPO VERO <small>rimesse, angoli e rinvii</small>`) e JS gemello di `refreshTaglieRow` che al click salva e ridisegna; **a 11 la riga si mostra bloccata su CAMPO VERO** (classe disabilitata + il refresh della riga taglie richiama quello delle sponde); in `startMatch`: `G.campoVero = (TAGLIA===11) || SAVE.sponde==='campo';` DOPO che la taglia effettiva è nota; `__test`: `get campoVero(){ return !!G.campoVero; }` e `get battuta(){ return G.battuta ? Object.assign({},G.battuta) : null; }` (torna `null` finché il compito 2 non crea la scena — il getter nasce ora così il banco è completo dal primo giorno).
- Produce (banco): `strumenti/_q-battute.js` col telaio di `_q-proporzioni.js` (`servi()` + chromium + `semeFisso` da `_posa.js` + `dismissSplash` + `tutorialDone`, codici d'uscita 0/1/2/3, flag `--gioco/--taglia/--seme`), sette prove:
  1. **INTERRUTTORE** — `t.save.sponde='campo'` + `startMatch(1,1,{size:5})` → `t.campoVero===true`; `'gabbia'` → `false`; `{size:11}` → sempre `true`. (Verde da questo compito.)
  2. **RIMESSA** — a campo vero (taglia 5, seme 20260917, `setCpuVsCpu(true)`): porta la palla libera vicino alla fascia nord e sparala fuori (`b.owner=-1; b.x=FW/2; b.y=40; b.vx=0; b.vy=-500; b.z=0; b.vz=0; segnaTocco(<idx di un uomo del team 0>)`), poi `t.simulate(1/60)` per 2 s: attesa `t.state==='battuta'` con `t.battuta.tipo==='rimessa'` e `t.battuta.team===1`. (ROSSA oggi: rimbalza.)
  3. **FONDO-ANGOLO** — palla verso il fondo sinistro FUORI dalla luce (`b.x=60; b.y=GY0-80; b.vx=-500; b.vy=0` — leggere GY0 dal vivo via `t.campo`), ultimo tocco del team 0 (che difende la porta sinistra) → attesa `tipo==='angolo'`, `team===1`. (ROSSA.)
  4. **FONDO-RINVIO** — stessa scena ma ultimo tocco del team 1 → attesa `tipo==='rinvio'`, `team===0`. (ROSSA.)
  5. **GABBIA** — senza toccare `save.sponde` (default), stessa scena della prova 2: entro 2 s MAI scena `battuta`, e la palla rimbalza (`vy` cambia segno; `|vy| dopo ∈ [0.75, 0.90]·|vy| prima` letta al fotogramma del rimbalzo). (VERDE oggi e per sempre: è la soglia 1.)
  6. **ANTI-STALLO** — dopo la prova 2, altri 5 s di `simulate`: `t.battuta===null` e palla viva (`b.owner>=0` oppure `len(b.vx,b.vy)>50`). (ROSSA.)
  7. **TIRA-SPENTO** — a campo vero in modalità un giocatore (squadra 0 umana, `setCpuVsCpu(false)`), uscita che dà rimessa al team 0: durante la finestra `t.pulsanti(0)` contiene la cella `act:'shot'` con `off===true`. (ROSSA — oggi `shot` non ha nemmeno la chiave `off`, :12631.)

- [ ] **Passo 1**: leggere le fonti (vincolo globale); riverificare col grep le àncore di `loadSave`, `#taglieRow`, `startMatch`, `window.__test`.
- [ ] **Passo 2**: scrivere il banco e lanciarlo sul gioco di oggi: attese 4 rosse (2,3,4,6,7 — la 7 conta come rossa perché la cella non esiste), 2 verdi (1 fallirà PRIMA dell'attrezzo: dichiarare l'ordine — prima l'attrezzo, poi la condanna; la condanna che conta è 2,3,4,6,7 rosse CON l'interruttore già dentro).
- [ ] **Passo 3**: attrezzo `_t-sponde-interruttore.js`, applicare con `--dentro`; rilanciare il banco: 1 e 5 verdi, 2/3/4/6/7 rosse — è la condanna a registro.
- [ ] **Passo 4**: cancelli — `_q-determinismo` 10/10; `_c3-sorteggi --taglie 5,7,11` contro l'HEAD pre-compito: **0/60** (l'interruttore non ha ancora consumatori); `_q-precedenza` 9/9; primo avvio verificato (pagina fresca senza salvataggio: `SAVE.sponde==='gabbia'`, il gioco carica).
- [ ] **Passo 5**: commit — `git commit -m "Le sponde diventano una scelta, e le battute hanno un giudice che le aspetta (voce #87, compito 1)"`

---

### Compito 2: La rimessa nasce — la fascia è una linea

**File:**
- Creare: `strumenti/_t-battuta-rimessa.js`
- Modificare (via attrezzo): `CALCETTO-il-gioco.html` — `ballWalls` (sponde lunghe :18865-18866), una sezione nuova «LA BATTUTA» (da piazzare sopra `ballWalls`: `pallaFuori`, `posaBattuta`, le costanti), il ciclo principale (ramo nuovo accanto a `:16555`), `setScene` (:11037, `inMatch`), la camera (:30169-30185), il ciclo di gioco vivo (finestra di battuta), `resetKickoff` (:10652, `G.battuta=null` — il fischio del gol uccide una battuta pendente).

**Interfacce:**
- Consuma: `G.campoVero` e il getter `__test.battuta` (compito 1); `squadraDelPallone()` (:14225); `segnaTocco` (:11072); il ramo kickoff del ciclo (:16555-16564: `if(G.sceneT>=(TAGLIA>5?1.5:1.0)){ setScene('play'); } return;`); lo stacco camera del kickoff (:30185); `showBanner` (:8539) e `Audio5.whistle` (:9959); `eseguiAiPass(p, D)` (:20671) per l'auto-battuta; il blocco che azzera i tiri in `ballOverBar` (:18974) come modello di pulizia della palla.
- Produce:
  - Costanti: `const BATTUTA_T={rimessa:0.8, rinvio:0.8};` (angolo al compito 4: `TAGLIA>5?1.5:1.2` calcolato al volo), `BATTUTA_HOLD=3.0`, `BATTUTA_CPU=0.5`, `BATTUTA_RAGGIO=60`.
  - `function pallaFuori(tipo, team, x, y)`: pulisce la palla (il blocco di :18974), costruisce `G.battuta={tipo, team, battitore:-1, x, y, hold:BATTUTA_HOLD}`, chiama `posaBattuta()`, `showBanner('RIMESSA', colore squadra, 0.9)` + `Audio5.whistle(false)`, `setScene('battuta')`.
  - `function posaBattuta()` (per ora solo tipo `rimessa`): battitore = compagno di movimento (`role!=='gk'`, `out<=0`) del team più vicino al punto; lo piazza sul punto (dentro il campo di `B_R+P_R`), palla ai piedi (`b.owner=battitore`, `CARRY_DIST` verso il centro), `segnaTocco(battitore)`, azzera i latch del battitore (il sotto-insieme di `resetKickoff` :10657: `slide=-1, recover=0, chiudiAnticipo(p), rove=-1, kickT=0, kickB=0`), spinge gli avversari entro `BATTUTA_RAGGIO` radialmente fuori dal cerchio, e se la squadra è umana `G.ctrl[team]=battitore` (:10690 come precedente).
  - Ciclo principale, ramo nuovo SOPRA la guardia `play/golden` (:16667), gemello di kickoff: `if(G.scene==='battuta'){ if(G.sceneT>=duraBattuta()){ setScene('play'); if(G.battuta && G.battuta.tipo==='rinvio') G.battuta=null; } return; }` (`duraBattuta()` legge tipo e taglia).
  - Finestra nel gioco vivo (subito dopo `:16687` hit-stop, prima del timer): `if(G.battuta){ G.battuta.hold-=dt; const bp=G.players[G.battuta.battitore]; const cpu=G.cpu[G.battuta.team]; if((cpu && G.battuta.hold<=BATTUTA_HOLD-BATTUTA_CPU) || G.battuta.hold<=0){ <auto-battuta> } }` — auto-battuta della rimessa = `eseguiAiPass(bp, <i parametri D che l'IA usa per quel team — la stessa sorgente del ciclo IA, cercarla accanto ad aiPass :20668>)`.
  - Chiusura della finestra: in `kickBall`, prima riga utile: `if(G.battuta && G.players[G.battuta.battitore]===p) G.battuta=null;` — ogni via di battuta (umana, CPU, auto) converge lì.
  - `setScene` (:11037): `'battuta'` entra nella lista `inMatch`.
  - Camera (:30169-30185): lo stacco del kickoff impara la battuta — `const cerimonia=(G.scene==='kickoff'||G.scene==='battuta'||G.capT>0);` e lo snap `:30185` diventa `if(G.scene==='kickoff'||G.scene==='battuta'){...}` (il bersaglio è la palla, che al fermo È il punto di battuta).
  - `ballWalls` sponde lunghe: `if(b.y<B_R){ if(G.campoVero){ const chi=squadraDelPallone(); pallaFuori('rimessa', chi>=0?1-chi:0, b.x, 0); return; } b.y=B_R; ... }` e gemello per `b.y>FH-B_R` — il ramo gabbia INTATTO carattere per carattere; `chi<0` (mai dopo il calcio d'inizio, che semina il tocco :10689) va alla squadra 0 per regola fissa dichiarata in commento, senza `dado()`.
- NOTA DI PERIMETRO: in questo compito il battitore umano NON ha ancora verbi garantiti puliti (arrivano al compito 3): la rimessa umana vive di auto-battuta a fine finestra. Dichiararlo nel rapporto: è uno stadio, non una svista.

- [ ] **Passo 1**: leggere le fonti; grep delle àncore (`sponde lunghe`, `:16555`, `:16667`, `:16687`, `:30169`, `:11037`, `kickBall`).
- [ ] **Passo 2**: attrezzo, applicare, banco: prove RIMESSA e ANTI-STALLO verdi; FONDO-ANGOLO/RINVIO e TIRA-SPENTO ancora rosse; GABBIA e INTERRUTTORE verdi.
- [ ] **Passo 3**: cancelli — `_q-determinismo` 10/10; `_c3-sorteggi --taglie 5,7` **0/40**; `--taglie 11` DIVERGE per costruzione: scrivere il numero (X/20) e il primo punto di divergenza nel rapporto; `_q-precedenza` 9/9; `_q-volo` 11/11; pausa/ripresa a scena `battuta` (aprire il menu di pausa durante il fermo: riprende senza saltare la scena — verifica manuale via `t.setPaused`).
- [ ] **Passo 4**: commit — `git commit -m "La fascia diventa una linea: la rimessa esiste (voce #87, compito 2)"`

---

### Compito 3: La battuta è del pollice — i verbi, TIRA spento, la clip

**File:**
- Creare: `strumenti/_t-battuta-verbi.js`
- Modificare (via attrezzo): `CALCETTO-il-gioco.html` — una funzione nuova `inBattuta(p)` accanto a `puoContrastoPremuto` (:16208), `touchBtnLayout` (cella `shot` :12631), `startCharge` (guardia + rifiuto visibile), `doPassaggio` (:14519) e `doCrossUmano` (:14531) (la clip), le pose (una coppia nuova `poseRimessa`/`pallaRimessa` accanto a `poseRinvio` :5982-6026), la tavola delle clip (:6736), la scelta bersaglio del pressing avversario (guardia di rispetto).
- Modificare: `strumenti/_q-battute.js` (due prove nuove).

**Interfacce:**
- Consuma: `G.battuta` (compito 2); il meccanismo della cella spenta (`off:` + `preso.off` :13061 + il rifiuto visibile `rifiutoVerbo` :16222); `p.chargeClip` (:14523 `'passaggio'`, :14545 `'cross'`); la tavola clip (:6730-6736) e `poseRinvio`/`pallaRinvio` come modello di rig; `anticipa(p,'passo',PASS_CAR_U,...)`.
- Produce:
  - `function inBattuta(p){ return !!(G.battuta && G.players[G.battuta.battitore]===p); }` — primo livello, sotto i 2.000 caratteri, UNICA fonte per layout e atto.
  - `touchBtnLayout`: la cella `{act:'shot', label:'TIRA', ...}` guadagna `off: inBattuta(ctrlPlayer(t))` (:12631); il tocco è già bloccato da `:13061`.
  - `startCharge`: in testa, `if(inBattuta(p)){ rifiutoVerbo(t,p); return; }` (copre la tastiera e ogni via non-touch — pattern L3.1 :16218-16224).
  - `doPassaggio` e `doCrossUmano`: dove oggi scrivono `p.chargeClip='passaggio'`/`'cross'`, se `inBattuta(p)` scrivono `'rimessa'`.
  - Clip: `rimessa: {freq:0.8, pose:poseRimessa, palla:pallaRimessa},` nella tavola (:6736 accanto a `rinvio`); `poseRimessa(u)`: corpo eretto, le DUE braccia salgono sopra la testa (fase 0-0,4: `aR=aL` che salgono simmetriche, gomiti `eB` chiusi), frustata del busto in avanti (`lean` da -0,10 a +0,25 sulla fase 0,4-0,6), braccia che accompagnano e rientro (0,6-1); gambe ferme divaricate (`gamba(...)` con angoli fissi ±0,12) — scrivere sul modello di `poseRinvio` :5982-6011 usando gli stessi mattoni `corpo/braccio/gamba`; `pallaRimessa(u,o)`: palla che sale con le mani (`o[1]` da 1,0 a 1,55 sulla fase 0-0,4, `o[2]` da 0,35 a 0,15 — dietro la testa), poi via in avanti (`o[2]` cresce, `o[1]` parabola come `pallaRinvio` :6020-6023); `o[3]` (aggancio alle mani) pieno fino alla frustata, 0 dopo.
  - Rispetto del battitore: nella funzione dove la CPU sceglie chi va sul portatore (cercarla col grep: chi legge `b.owner` per assegnare l'inseguitore), guardia `if(G.battuta && G.ball.owner===G.battuta.battitore) <non candidare avversari>` — gli avversari tengono la posizione della posa finché la finestra vive.
  - Banco, due prove nuove: **BATTUTA-UMANA** — a rimessa del team 0 umano, pressione sintetica del disco PASSA (`Touch5.start/chiudi` sulle coordinate di `t.pulsanti(0)` cella `act:'pass'`, pattern del COPIONE di `_q-replay` :109-145): entro 0,5 s la palla parte (`b.owner===-1` o cambia possessore) e `t.battuta===null`; **RISPETTO** — durante la finestra (CPU contro CPU), nessun avversario entro 40 unità dal battitore per tutta la durata.
- ATTENZIONE (lezione #86 c5): `poseRimessa` è disegno puro, ma la guardia `inBattuta` tocca il flusso degli atti — il due-versioni resta l'unico giudice del «non ho cambiato la gabbia».

- [ ] **Passo 1**: leggere le fonti; grep delle àncore (`:12631`, `startCharge`, `:14519/:14531`, la tavola clip, l'inseguitore del portatore).
- [ ] **Passo 2**: attrezzo, applicare; banco: TIRA-SPENTO, BATTUTA-UMANA, RISPETTO verdi (9 prove totali: 7 del compito 1 + 2 nuove; FONDO-ANGOLO/RINVIO ancora rosse).
- [ ] **Passo 3**: cancelli — `gabbia.js` verde sulla clip nuova; `_q-determinismo` 10/10; `_c3-sorteggi --taglie 5,7` 0/40, `--taglie 11` numero dichiarato; `_q-precedenza` 9/9 (e conta `inBattuta` fra le funzioni estratte); screenshot `fuori/rimessa-posa.png` (via `t.simulate`+`t.disegna` o `istantanea` mirata) GUARDATO e descritto nel rapporto.
- [ ] **Passo 4**: commit — `git commit -m "La battuta e' del pollice: i verbi di casa dal punto d'uscita (voce #87, compito 3)"`

---

### Compito 4: Il fondo è vero — l'angolo e il rinvio

**File:**
- Creare: `strumenti/_t-battuta-fondo.js`
- Modificare (via attrezzo): `CALCETTO-il-gioco.html` — `ballWalls` (il ramo `else` fuori dalla luce :18853-18863), `posaBattuta` (i tipi `angolo` e `rinvio`), `duraBattuta` (l'angolo: `TAGLIA>5?1.5:1.2`), l'auto-battuta della finestra (il ramo angolo), i banner (ANGOLO/RINVIO).
- Modificare: `strumenti/_q-battute.js` (una prova nuova).

**Interfacce:**
- Consuma: `pallaFuori`/`posaBattuta`/la finestra (compito 2); i verbi e `inBattuta` (compito 3); `squadraDelPallone()`; `portiereDi(team)` e il «più arretrato» di `ballOverBar` (:18977-18983); `rinvioPortiere` via il flusso esistente (:18602-18604: `b.owner===portiere && kickCd<=0 → rinvioPortiere`); `doCross(q,0,0,null,dest)` (:14544) per l'angolo di CPU/auto-battuta; `VERNICE.areaProf`/`GY0`/`GY1` dal vivo.
- Produce:
  - `ballWalls`, ramo `else` a campo vero: `if(b.x<B_R){ if(G.campoVero){ const chi=squadraDelPallone(); if(chi===0) pallaFuori('angolo', 1, 0, b.y<FH/2?0:FH); else pallaFuori('rinvio', 0, 0, b.y); return; } b.x=B_R; ... }` e gemello a destra (porta destra: difende il team 1, quindi `chi===1 → angolo` per il team 0); `chi<0 → rinvio` per chi difende (regola fissa, commento, zero `dado()`). Il ramo gabbia intatto.
  - `posaBattuta` tipo `angolo`: punto = l'angolo del quadrante, palla sull'arco (10 unità dentro su x e y — gli archi da 14 sono già dipinti :27894); battitore = movimento più vicino; **attaccanti in area**: i 2 (taglia 5) o 3 (7/11) compagni di movimento più avanzati piazzati a `x = gx ± VERNICE.areaProf*0.6` e `y = FH/2, FH/2−44, FH/2+44`; **difensori a marcare**: per ciascun attaccante piazzato, l'avversario di movimento più vicino a 18 unità verso la propria porta; **portiere sulla linea** (`x=gx±8, y=FH/2`); gli altri restano dove sono. Tutto deterministico, zero `dado()`.
  - `posaBattuta` tipo `rinvio`: `deep = portiereDi(team)` o il più arretrato (:18977-18983), palla FRA LE MANI (`b.owner=deep`, `deep.kickCd=0.5`), `y=FH/2` fisso (NIENTE `rnd(-70,70)`: il precedente di `ballOverBar` ce l'ha, qui no — commento che lo dice); alla fine del fermo `G.battuta=null` (già nel ramo del compito 2) e il flusso esistente fa il rinvio con la sua clip.
  - Auto-battuta/CPU dell'angolo: `doCross(bp, 0, 0, null, dest)` con `dest` = il compagno in area più vicino al dischetto di rigore di quella porta (pattern di `doCrossUmano` :14536-14543, bersaglio fisso invece di `puntoCross`).
  - Banner per tipo: `ANGOLO` (colore squadra), `RINVIO` (grigio di casa `#96ab9e` come ALTA! :18967).
  - Banco, prova nuova: **ANGOLO-IN-AREA** — dopo un angolo CPU a taglia 5, entro 2,5 s dalla ripresa la palla entra nel rettangolo d'area di quella porta (leggere `VERNICE.areaSemi/areaProf` da `t.proporzioni()`), oppure viene toccata da un corpo in area. FONDO-ANGOLO e FONDO-RINVIO (compito 1) diventano verdi qui.
- ATTENZIONE: `hitPosts` (:18821) corre PRIMA della classificazione: un pallone che prende il palo resta in gioco come oggi — non toccarlo. `ballOverBar` (sopra la traversa) resta la via di oggi ANCHE a campo vero: è già un rinvio, la sua pausa arriverà se il committente la chiede (non in questo cantiere: YAGNI).

- [ ] **Passo 1**: leggere le fonti; grep delle àncore.
- [ ] **Passo 2**: attrezzo, applicare; banco: 12 prove tutte verdi (7+2+1 nuova, FONDO-ANGOLO/RINVIO comprese) sul gioco curato; sul gioco pre-compito la prova ANGOLO-IN-AREA nasce rossa (dichiarare la corsa di condanna con `--gioco fuori/<base>.html`).
- [ ] **Passo 3**: cancelli — `_q-determinismo` 10/10; `_c3-sorteggi --taglie 5,7` 0/40, `--taglie 11` numero dichiarato; `_q-precedenza` 9/9; `_q-volo` 11/11 (il cross dall'angolo passa dagli stessi verbi del volo); screenshot `fuori/angolo-11.png` e `fuori/rinvio-5.png` GUARDATI e descritti.
- [ ] **Passo 4**: commit — `git commit -m "Il fondo e' una linea vera: l'angolo e il rinvio (voce #87, compito 4)"`

---

### Compito 5: La giocabilità, i banchi a rischio, la batteria, il verbale

**File:**
- Modificare: `strumenti/tutti.js` (registrazione di `battute`), `MANUALE.md` (voce #87 CURATA in § A registro; i seguiti nuovi), `PUNTO-DEL-LAVORO.md` (la giornata del 17 settembre).
- Nessun cambio al gioco salvo cure di banchi rotti da questo ramo (ognuna dichiarata).

**Interfacce:**
- Consuma: tutto il cantiere; il formato di registrazione in batteria (`tutti.js` :392-437: riga `{ nome, cmd, conta:true, lento:false }` col commento «PERCHÉ STA IN BATTERIA»); l'elenco dei banchi a rischio dal censimento §8.
- Produce: il cantiere chiuso con verbale.

- [ ] **Passo 1**: **giocabilità** — `node strumenti/_eventi.js` a taglia 11 (campo vero obbligatorio) e a taglia 5 con `sponde='campo'`, confrontati con la stessa corsa sull'HEAD pre-ramo (`--gioco fuori/<base>.html`): momenti da porta al minuto ≥ 80% del prima, 0-0 ≤ 33%; se rosso, la manopola è `BATTUTA_T`/`BATTUTA_HOLD` (un attrezzo di taratura, misura ripetuta, numeri nel rapporto).
- [ ] **Passo 2**: **i banchi a rischio del censimento §8** — le sei copie del collaudo con la voce #66 (`_p/_q/_t-p/_tb/_z/_x-collaudo.js`): lanciarle sul gioco curato a campo vero; se una urla il falso «uscito dal mondo», curarla con la stessa toppa di `collaudo.js:310-313` e dirlo; se restano verdi, dichiararlo (il pallone non sosta mai fuori banda: va PROVATO, non dedotto). I banchi-camera (`_z-verbo.js:142` e gemelli): lanciarli, dichiarare l'esito (la scena `battuta` non usa la camera `alto`, non dovrebbero muoversi).
- [ ] **Passo 3**: **batteria in spezzoni** (i quattro comandi di casa) con `_q-battute` registrato in `tutti.js` (`{ nome:'battute', cmd:['strumenti/_q-battute.js'], conta:true, lento:false }` + commento: cosa protegge — l'interruttore, la classificazione delle uscite, la gabbia identica, la finestra di battuta); tutti i cancelli che contano verdi.
- [ ] **Passo 4**: **sorteggi complessivi del ramo** — `_q-determinismo` 10/10; `_c3-sorteggi` dal merge-base con main, PER TAGLIA: 5 e 7 **0/20 e 0/20** (la promessa della gabbia), 11 X/20 dichiarato con la causa (campo vero obbligatorio); una corsa dedicata a 5-campo-vero (`t.save.sponde='campo'` nella sonda) che DIVERGE per costruzione, dichiarata fuori canone.
- [ ] **Passo 5**: **verbale** — `MANUALE.md`: voce #87 CURATA (tavola prima/dopo: gabbia/campo vero per taglia, le durate, i verbi della battuta, i numeri di giocabilità e di divergenza a 11, la copertura onesta: i cancelli di batteria girano a taglia 5 gabbia, il campo vero è coperto da `_q-battute` e dalle corse dedicate — la #99 resta aperta); seguiti nuovi a registro: **#102** (l'IA evoluta sui piazzati: portiere che sale sul corner disperato, pressione per fase — dal paragone scavo 7) e **#103** (la coda dell'angolo: gol olimpico e statistica corner in lavagnetta); nota alla voce **#96** (anche questo ramo cambia il motore a 11: i nastri delle sfide di ieri non si rigiocano — già coperto, si cita e basta). `PUNTO-DEL-LAVORO.md`: la giornata del 17 settembre, il cantiere #87 chiuso, restano #89 + i seguiti.
- [ ] **Passo 6**: commit — `git commit -m "Rimesse e angoli: il campo impara le sue linee (voce #87)"`

---

## Autoverifica del piano (fatta scrivendolo)

- **Copertura dello spec:** §3.A → compito 1; §3.B → compiti 2 (fasce) e 4 (fondo), gabbia intatta = prova GABBIA + vincolo globale; §3.C → compiti 2 (fermo, durate, banner, camera, anti-stallo, CPU) e 3 (verbi, TIRA spento, clip, rispetto) e 4 (angolo/rinvio); §3.D → v1 ferma nei compiti 2-4, evoluzione = seguito #102 (compito 5); §3.E → banco nei compiti 1-4, cancelli in ogni compito, batteria e banchi a rischio al compito 5; §3.F → seguiti #102/#103 e nota #96 al compito 5; rischi 1-4 dello spec → passo 1 del compito 5 (ritmo), passo 2 (voce #66), vincolo dei letterali di boot, vincolo dei sorteggi.
- **Scan dei segnaposto:** niente TBD; i tre punti lasciati «al grep dell'implementatore» (la sorgente dei parametri D accanto ad `aiPass`, la funzione che assegna l'inseguitore del portatore, la via dello screenshot) sono ricerche con l'àncora dichiarata, non buchi di progetto.
- **Coerenza dei nomi:** scena `'battuta'`, `G.battuta{tipo,team,battitore,x,y,hold}`, `G.campoVero`, `SAVE.sponde`, `pallaFuori(tipo,team,x,y)`, `posaBattuta()`, `duraBattuta()`, `inBattuta(p)`, `BATTUTA_T/HOLD/CPU/RAGGIO`, banco `_q-battute.js` con prove INTERRUTTORE/RIMESSA/FONDO-ANGOLO/FONDO-RINVIO/GABBIA/ANTI-STALLO/TIRA-SPENTO/BATTUTA-UMANA/RISPETTO/ANGOLO-IN-AREA, attrezzi `_t-sponde-interruttore/_t-battuta-rimessa/_t-battuta-verbi/_t-battuta-fondo`, seme 20260917 — identici in tutti i compiti.
- **Ordine motivato:** il giudice prima delle cure (compito 1); la macchina prima dei verbi (2 prima di 3: la finestra e l'auto-battuta danno una rimessa COMPLETA anche senza input umano, e il banco può condannare per gradi); il fondo dopo i verbi (4 usa la battuta del 3 per l'angolo umano); giocabilità e batteria alla fine, quando le durate sono tutte in campo.
