/* =====================================================================
   _t-l13.js — L1.3: LA MIRA DEL TIRO E LA POTENZA CONTINUA
   (voce L1.3 di _analisi/agente28.md §10, sul motore d'ingresso L1.1)

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce SETTE ancoraggi ESATTI e scrive la copia in --out. Senza
   --out scrive accanto all'originale un file col suffisso .l13.html:
   mai sull'originale, se non con --dentro. Se anche un solo ancoraggio
   non compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale,
   e non scrive niente.

   uso:
     node strumenti/_t-l13.js --out fuori/l13.html
     node strumenti/_t-l13.js --in altro.html --out x.html
     node strumenti/_t-l13.js --dentro
     node strumenti/_t-l13.js --elenco

   ---------------------------------------------------------------------
   LA TESI. Oggi il tiro umano e' un cancello a tre valori: sotto
   SHOT_MIN la potenza e' 340 (arriva piano, parata facile), dentro la
   finestra 640, oltre 400 — misurato con strumenti/_q-l13.js sul gioco
   di oggi: salto di 300 unita'/s su un'escursione totale di 100, e la
   curva non e' nemmeno monotona. La mira non esiste: trascinare il dito
   sul disco TIRA di -26..+26 px sposta il punto d'arrivo di 0 unita'.
   Il progetto (agente28 §4, righe «mira nella bocca», «rampa continua»,
   «pizzata») prescrive: la potenza sale con continuita' dal tap alla
   carica piena; l'anello — che resta INTATTO nei numeri: SHOT_MIN 0,50,
   SHOT_MAX 0,80, la grazia della tecnica di ±45 ms — smette di pagare
   in potenza e paga in PRECISIONE; la componente tangenziale del
   trascinamento (l'asse della bocca, che sullo schermo e' verticale)
   mira dentro la bocca, satura a MIRA_SAT = 26 px; il tap e' un tiro
   vero. Il pallonetto resta il gesto di ieri (levetta indietro dalla
   meta' campo offensiva), non si tocca.

   COSA NON CAMBIA, E VA DETTO:
   · la CPU (sparaTiroCpu), la rovesciata e il tiro al volo continuano a
     passare da fireShot col loro q a tre valori: L1.3 e' «il disco
     lontano CON palla», cioe' il rilascio UMANO da fermo. fireShot
     resta identico al byte.
   · il PALLONETTO umano resta fireShot con q: quota e potenza di ieri.
     Il cancello _q-l13 prova E sorveglia che la decisione resti la
     levetta indietro e mai lo sprint.
   · l'anello disegnato, la finestra, SHOT_HARDCAP, TAP_T: identici.

   COSA CAMBIA AL BIT (dichiarato): i tiri umani da fermo. Fuori
   finestra il tiro ora consuma DUE sorteggi (l'errore angolare, la
   stessa legge del vecchio q=2) anche quando e' «presto», dove prima ne
   consumava zero: un banco a seme fisso che attraversa un tiro umano
   affrettato vede il seme scorrere diversamente da li' in poi. Le
   partite CPU contro CPU non attraversano mai questo ramo.

   I NUMERI DELLA RAMPA, e da dove vengono:
     base(c)   = (340 + 300·min(1, c/SHOT_MAX)) · pow
     arrivo(c) =  230 + 100·min(1, c/SHOT_MAX)
     vel = min(TIRO_TETTO, max(base, arrivo + TIRO_ATTR·dist))
   340 e 640 sono le basi di ieri (q=0 e q=1); 230 e 330 sono i due capi
   di TIRO_ARRIVO di ieri. La rampa CONGIUNGE i valori esistenti invece
   di inventarne: al tap vale il vecchio «presto», a carica piena il
   vecchio «perfetto», e in mezzo e' lineare nella tenuta — che vive
   sull'accumulatore di step() (p.charge), mai sull'orologio degli
   eventi (Legge 1). Misurata dal cancello: 10 tenute, monotona, salto
   massimo 50 su un'escursione di 275.

   LA MIRA: f = clamp(dy/26) sul campione anteriore di 60 ms al
   distacco (Touch5.trascina, gia' in L1.1), solo se il trascinamento e'
   ARMATO (l >= R_ARMA: sotto, il trascinamento non esiste — §3.1). Il
   bersaglio e' FH/2 + f·(GOAL_H/2-24): a mira piena e' lo stesso
   incrocio che l'auto-mira di ieri prendeva, margine di 24 compreso,
   perche' quel 24 fu tarato sulla deriva del giro e resta giusto.
   SENZA trascinamento non cambia niente di ieri: dentro la finestra
   l'auto-incrocio (col giro), fuori il centro corretto da my·260.
   «Se non tiro il dito, esce la cosa sicura.»

   LA TACCA sulla bocca (Legge 3: la risposta sul mondo, mai sotto il
   dito): un segno di gesso all'altezza mirata, ambra quando l'anello e'
   nella finestra, con la freccetta nei terzi alti/bassi — tre stati
   annunciati, valore continuo sotto. La geometria della tacca la
   calcola UNA funzione sola (taccaMira), letta dal disegno E da
   zoneInterfaccia: dichiarazione e dipinto non possono divergere (la
   lezione di _t-l04b), e il segno e' dichiarato perche' questa casa ha
   gia' pagato un segno semitrasparente sull'erba letto come ombra.

   I NUMERI DEL CANCELLO (strumenti/_q-l13.js, seme 20260819):
     prima:  A ROSSO (escursione 0) · B ROSSO (salto 300/100, non
             monotona) · C ROSSO (RMS ambra 43,7 dal punto mirato,
             potenze 640 contro 400) · D ROSSO (tap a 300 fisse) ·
             E VERDE (pallonetto: vz 205 indietro, 72 sprint)
     dopo:   il referto sta nella consegna; il cancello esce 0.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   GLI ANCORAGGI. Testo esatto cercato, testo esatto messo al suo posto.
   Nessuna espressione regolare, nessun numero di riga.
   -------------------------------------------------------------------- */
const ANCORE = [

/* 1 — la costante della mira, accanto ai numeri dell'anello */
{
  nome: '1/7 MIRA_SAT accanto a SHOT_MIN/SHOT_MAX',
  cerca:
`/* timing del tiro: finestra dolce 300ms; sotto TAP_T = tocco corto */
const SHOT_MIN = 0.50, SHOT_MAX = 0.80, SHOT_HARDCAP = 1.25, TAP_T = 0.15;`,
  metti:
`/* timing del tiro: finestra dolce 300ms; sotto TAP_T = tocco corto */
const SHOT_MIN = 0.50, SHOT_MAX = 0.80, SHOT_HARDCAP = 1.25, TAP_T = 0.15;
/* L1.3 — LA MIRA NELLA BOCCA (agente28 §3.1): la componente del
   trascinamento sul disco TIRA lungo l'asse della bocca — che sullo
   schermo e' VERTICALE, per tutte e due le squadre, perche' le porte
   stanno ai lati — satura a MIRA_SAT px CSS. E' meno dell'escursione
   che arma il verbo (R_ARMA arriva a 36 px con la tenuta piena):
   per mirare bisogna prima ESISTERE come trascinamento, e la mira
   piena si prende inclinando un gesto gia' armato, non sfiorando il
   disco. Il valore sotto e' continuo; la tacca sulla bocca annuncia
   tre stati (ALTO/CENTRO/BASSO). */
const MIRA_SAT = 26;`,
},

/* 2 — Touch5.chiudi: la lettura del distacco si fa prima che l'atto
       sparisca, e viaggia come argomento */
{
  nome: '2/7 Touch5.chiudi: trascina(id) letto prima del delete, passato a releaseCharge',
  cerca:
`      const a=this.atti[id];
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t);
      }`,
  metti:
`      const a=this.atti[id];
      /* L1.3 — LA LETTURA DEL DISTACCO SI FA QUI, PRIMA CHE L'ATTO
         SPARISCA: trascina(id) legge this.atti[id], e tre righe sotto
         l'atto non c'e' piu'. E' il campione anteriore di 60 ms — il
         solo senza la deriva del polpastrello — e viaggia fino a
         releaseCharge come ARGOMENTO, non come stato: niente campi
         nuovi, niente da ripulire. Si legge solo se l'atto e' vivo e la
         carica e' sua: un atto morto o ri-armato non ha mire da dare. */
      const lettura=(bt.act==='shot' && a && !a.morto && a.carica) ? this.trascina(id,true) : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t, lettura);
      }`,
},

/* 3 — la testa di releaseCharge: la pizzata, e la finestra che diventa
       precisione */
{
  nome: '3/7 releaseCharge: pizzata al posto del tocco corto, finestra al posto del q',
  cerca:
`function releaseCharge(t){
  const p=ctrlPlayer(t);
  if(!p || p.charge<0 || p.chargeGo) return;
  const c=p.charge; chiudiAnticipo(p);
  /* tap rapido (senza carica): tocco corto / appoggio veloce */
  if(c<TAP_T){
    let [mx,my]=humanMove(t);
    if(!mx&&!my){ mx=p.fx; my=p.fy; }
    const l=Math.max(0.001,len(mx,my));
    if(kickBall(p, mx/l, my/l, 300, 0)) Audio5.kick(0.25);
    return;
  }
  /* la TECNICA allarga la finestra: fino a +-45 ms sui 300 di partenza */
  const larg = (p.tecnica-62)/38*0.045;
  const q = (c>=SHOT_MIN-larg && c<=SHOT_MAX+larg) ? 1 : (c<SHOT_MIN-larg?0:2);
  /* direzione: verso la porta avversaria, correggibile con l'input */
  const goalX=t===0?FW:0;
  let dx=goalX-p.x, dy=(FH/2)-p.y;
  const [mx,my]=humanMove(t);
  dy += my*260;                          // mira alta/bassa con su/giu'
  const l=Math.max(1,len(dx,dy));`,
  metti:
`function releaseCharge(t, lettura){
  const p=ctrlPlayer(t);
  if(!p || p.charge<0 || p.chargeGo) return;
  const c=p.charge; chiudiAnticipo(p);
  /* L1.3 — LA LETTURA DEL DITO ARRIVA DA FUORI, GIA' FATTA.
     Touch5.chiudi la passa letta sul campione ANTERIORE di 60 ms al
     distacco: la deriva distale del polpastrello — 6-18 px iniettati
     nell'istante esatto della decisione — non entra nella mira
     (misurato da _q-l11 prova A: 14 gradi di errore senza lo scarto,
     0 con). Tastiera e rilascio del tetto (SHOT_HARDCAP scatta col
     dito ancora giu') non la passano: si legge l'atto vivo se c'e',
     altrimenti resta null — nessuna mira, la cosa sicura. */
  if(lettura===undefined) lettura=letturaTiroViva(t,p);
  /* L1.3 — LA PIZZATA. Il tap col pallone era un tocco corto a 300
     fisse: mai un tiro — niente etichetta b.tiroT, niente tabellino —
     e mai un tuffo, perche' il portiere arma il tuffo dai 300 in su.
     Il progetto (agente28 §4): «TIRA, tap: il gol da mischia esiste.
     Direzione dalla levetta». Quindi: se la levetta punta VERSO la
     porta che si attacca, il tap e' un TIRO VERO in fondo alla rampa
     continua. Un tap all'indietro o di lato resta il tocco corto di
     sempre: una spazzata non e' un tiro, non gonfia il tabellino e
     non accende l'etichetta del tiro in volo. La soglia 0,25 sul
     coseno e' larga apposta (entro ~75 gradi dall'avanti): nella
     mischia la levetta e' approssimativa, e sbagliare qui costa un
     tocco corto, non un fallo (P9). Nessun errore angolare aggiunto:
     la direzione della pizzata E' la levetta, che e' gia' grossolana
     di suo — aggiungerci un sorteggio punirebbe due volte. */
  if(c<TAP_T){
    let [mx,my]=humanMove(t);
    if(!mx&&!my){ mx=p.fx; my=p.fy; }
    const l=Math.max(0.001,len(mx,my));
    if(((t===0?mx:-mx)/l)>0.25){
      const pw=(G.cpu[t] ? DIFF[G.diff].shotPow : 1)*fatt(p.tiro,0.10);
      p.chargeClip='tiro';
      if(kickBall(p, mx/l, my/l, Math.max(300,(340+300*clamp(c/SHOT_MAX,0,1))*pw), 0)){
        G.stats.tiri[t]++; G.ball.tiroT=t;
        if(t===0 && !G.cpu[0]) Tut.notify('shot');
        Audio5.kick(0.4);
      }
      return;
    }
    if(kickBall(p, mx/l, my/l, 300, 0)) Audio5.kick(0.25);
    return;
  }
  /* la TECNICA allarga la finestra: fino a +-45 ms sui 300 di partenza.
     L1.3 — la finestra NON decide piu' la potenza: decide la PRECISIONE
     (vedi fireShotMirato). I suoi numeri non si toccano: SHOT_MIN 0,50,
     SHOT_MAX 0,80, la grazia della tecnica. E' l'anello di sempre. */
  const larg = (p.tecnica-62)/38*0.045;
  const finestra = (c>=SHOT_MIN-larg && c<=SHOT_MAX+larg);
  /* il verdetto a tre valori resta SOLO per il pallonetto qui sotto,
     che questa voce lascia com'era ieri, quota e potenza comprese */
  const q = finestra ? 1 : (c<SHOT_MIN-larg?0:2);
  /* direzione del PALLONETTO: verso la porta avversaria, correggibile
     con l'input. La mira del tiro raso non passa di qui: vive in
     fireShotMirato, sul trascinamento del disco. */
  const goalX=t===0?FW:0;
  let dx=goalX-p.x, dy=(FH/2)-p.y;
  const [mx,my]=humanMove(t);
  dy += my*260;                          // mira alta/bassa con su/giu'
  const l=Math.max(1,len(dx,dy));`,
},

/* 4 — la coda di releaseCharge: il bivio pallonetto / tiro mirato */
{
  nome: '4/7 releaseCharge: il bivio — pallonetto di ieri, tiro mirato per tutto il resto',
  cerca:
`  fireShot(p, dx/l, dy/l, q, ((t===0 ? -mx : mx) > 0.5) && metaOffensiva(p));
}`,
  metti:
`  /* L1.3 — IL BIVIO. Il pallonetto resta ESATTAMENTE il gesto di ieri
     (fireShot col suo q): questa voce non lo tocca, e _q-l13 prova E
     sorveglia che la decisione resti «levetta indietro» e mai lo
     sprint. Tutti gli altri tiri umani da fermo passano dal tiro
     MIRATO: rampa continua sulla tenuta, mira dal trascinamento,
     finestra = precisione. */
  if(((t===0 ? -mx : mx) > 0.5) && metaOffensiva(p)){
    fireShot(p, dx/l, dy/l, q, true);
    return;
  }
  fireShotMirato(p, c, finestra, lettura, my);
}`,
},

/* 5 — il tiro mirato e i suoi tre aiutanti, dopo fireShot */
{
  nome: '5/7 fireShotMirato + letturaTiroViva + miraTiroF + taccaMira, dopo fireShot',
  cerca:
`  /* IL PALLONE SA DI CHI E' IL TIRO CHE STA VOLANDO. Lo legge chi puo'
     dire se il tiro era nello specchio: addGoal e tentaPresa. Lo azzera
     kickBall, cioe' qualunque altro calcio di chiunque. */
  G.ball.tiroT=t;
}`,
  metti:
`  /* IL PALLONE SA DI CHI E' IL TIRO CHE STA VOLANDO. Lo legge chi puo'
     dire se il tiro era nello specchio: addGoal e tentaPresa. Lo azzera
     kickBall, cioe' qualunque altro calcio di chiunque. */
  G.ball.tiroT=t;
}

/* =====================================================================
   L1.3 — IL TIRO MIRATO. E' il rilascio UMANO da fermo; la CPU, la
   rovesciata, il volo e il pallonetto restano su fireShot, qui sopra,
   che non cambia di un byte.

   LA RAMPA. base = (340 + 300·min(1, c/SHOT_MAX))·pow congiunge i due
   valori di ieri: 340 era il «presto», 640 il «perfetto». Il pavimento
   d'arrivo fa lo stesso: 230 e 330 sono i capi di TIRO_ARRIVO. Nessun
   numero nuovo e' stato inventato: la rampa INTERPOLA il cancello a tre
   valori che sostituisce, cosi' il tap resta il tiro debole di ieri e
   la carica piena il perfetto di ieri, e in mezzo non c'e' piu' il
   gradino da 300 unita'/s misurato da _q-l13 prova B.

   LA PRECISIONE. Fuori finestra il tiro riceve lo STESSO errore
   angolare del vecchio «strozzato» (rnd·0,30 ± 0,16, cioe' 9-26 gradi:
   due sorteggi, la legge di ieri, non una nuova) — presto O tardi,
   perche' la fretta non e' piu' precisa del ritardo. Dentro la
   finestra: errore zero, e il giro verso il lato mirato. L'anello
   compra precisione, non potenza: e' la riga del progetto.

   LA MIRA. f in [-1, +1] dal trascinamento armato (miraTiroF); il
   bersaglio e' FH/2 + f·(GOAL_H/2-24) sul filo di porta. Il margine 24
   e' quello del tiro perfetto di ieri, tarato sulla deriva del giro: a
   mira piena si prende lo stesso incrocio dell'auto-mira. SENZA
   trascinamento armato il gioco fa quello che faceva ieri: dentro la
   finestra l'incrocio lontano automatico (il colpo che il gioco chiede
   di imparare resta buono anche senza mirare), fuori il centro
   spostato da my·260 — la vecchia correzione della levetta, che cosi'
   non sparisce a chi gioca di tastiera.

   COSA NON FA: non tocca G.stats se il piede non trova il pallone
   (kickBall rifiuta oltre KICK_R): ieri il tabellino contava un tiro
   anche a vuoto nella corona 26-36,4 senza possesso; qui il conteggio
   segue il calcio vero.
   ===================================================================== */
/* l'atto vivo del TIRO di questa squadra, se un dito lo sta tenendo:
   e' la lettura dell'ANTEPRIMA (finale=false, il campione corrente),
   usata dalla tacca e dai rilasci che avvengono col dito ancora giu'
   (SHOT_HARDCAP). Il distacco vero passa invece da Touch5.chiudi, che
   legge il campione anteriore di 60 ms. La carica deve essere di
   QUESTO uomo: dopo un ri-armo il dito tiene un verbo che non ha
   aperto niente, e non ha mire da dare. */
function letturaTiroViva(t,p){
  if(typeof Touch5==='undefined' || !Touch5.atti) return null;
  for(const id in Touch5.atti){
    const a=Touch5.atti[id];
    if(a.act==='shot' && a.t===t && !a.morto && (!p || a.carica===p))
      return Touch5.trascina(id,false);
  }
  return null;
}
/* la frazione di mira in [-1, +1]: negativa = in alto sullo schermo.
   Esiste SOLO se il trascinamento e' armato (l >= R_ARMA): sotto, il
   trascinamento non esiste (§3.1) e la risposta e' null — non zero,
   perche' «mira al centro» e «nessuna mira» sono due cose diverse e
   chi le confonde perde l'auto-incrocio del tiro perfetto. */
function miraTiroF(lettura){
  if(lettura && lettura.armato) return clamp(lettura.dy/MIRA_SAT,-1,1);
  return null;
}
/* LA TACCA SULLA BOCCA: geometria calcolata in UN posto solo, letta
   dal disegno (drawPlayer) e da zoneInterfaccia — una scrittura, due
   letture, quindi dichiarazione e dipinto non possono divergere (la
   lezione di _t-l04b). Torna null quando non c'e' niente da annunciare:
   nessuna carica umana di tiro, o trascinamento non armato. Il
   rettangolo e' in px CSS dello schermo, come tutto zoneInterfaccia. */
function taccaMira(t){
  if(G.cpu[t]) return null;
  const p=ctrlPlayer(t);
  if(!p || p.charge<0 || p.chargeGo || p.chargeKind!=='tiro') return null;
  const f=miraTiroF(letturaTiroViva(t,p));
  if(f===null) return null;
  const gx=t===0?FW:0, gy=FH/2+f*(GOAL_H/2-24);
  const v=G.view;
  if(!v || !v.S2) return null;
  const sx=gx*v.S2+v.Ax, sy=gy*v.S2+v.Ay;
  const rx=8*v.S2, ry=9*v.S2;
  return { gx:gx, gy:gy, f:f, x0:sx-rx, y0:sy-ry, x1:sx+rx, y1:sy+ry };
}
function fireShotMirato(p, c, finestra, lettura, my){
  const t=p.team, pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4) return;
  p.chargeClip='tiro';
  const pow=(G.cpu[t] ? DIFF[G.diff].shotPow : 1)*fatt(p.tiro,0.10);
  const goalY=FH/2;
  const f=miraTiroF(lettura);
  const gx=t===0?FW-4:4;
  let gy;
  if(f!==null) gy=goalY+f*(GOAL_H/2-24);
  else if(finestra) gy=goalY+(p.y<goalY?1:-1)*(GOAL_H/2-24);
  else gy=goalY+(my||0)*260;
  const dx=gx-p.x, dy=gy-p.y, l=Math.max(1,len(dx,dy));
  /* la velocita' si decide sul punto MIRATO, prima dell'errore: cosi'
     e' una funzione deterministica della tenuta e della distanza, e la
     dispersione — che e' il prezzo del fuori-tempo — non tocca mai la
     potenza. Lo pretende il cancello B (monotona, senza gradini). */
  const rampa=clamp(c/SHOT_MAX,0,1);
  const vel=Math.min(TIRO_TETTO, Math.max((340+300*rampa)*pow, 230+100*rampa + TIRO_ATTR*l));
  let nx=dx/l, ny=dy/l;
  if(!finestra){
    /* i due sorteggi del vecchio «strozzato», parola per parola: 9-26
       gradi, bimodali attorno allo zero. Non un numero nuovo. */
    const err=rnd(-1,1)*0.30 + (Math.random()<0.5?-0.16:0.16);
    const a2=Math.atan2(ny,nx)+err;
    nx=Math.cos(a2); ny=Math.sin(a2);
  }
  if(!kickBall(p, nx, ny, vel, 0)) return;
  G.stats.tiri[t]++;
  if(t===0 && !G.cpu[0]) Tut.notify('shot');
  if(finestra){
    /* il colpo pieno del tiro perfetto, identico a ieri: e' il gesto
       che il gioco chiede di imparare — se non si sente, non si
       impara. Cambia solo il verso del giro: segue la mira invece
       dell'incrocio automatico, e a mira zero il giro e' zero. */
    G.stats.perfetti[t]++;
    if(t===0 && !G.cpu[0] && G.stats.perfetti[0]>=5) unlockAch('perfetti5');
    const fCur=(f!==null)?f:(p.y<goalY?1:-1);
    G.ball.curve=fCur*150*pow;
    G.ball.perfectT=0.6;
    G.flashRing=0.35; G.flashTeam=t;
    scossa(7.5, 0.30, -nx, -ny);
    gelo(0.075);
    lampo(G.ball.x, G.ball.y, nx, ny, 1.25);
    spruzzo(G.ball.x, G.ball.y, nx, ny, 10, 1.5);
    showBanner('TIRO PERFETTO!', TEAMCOL[t], 1.1);
    Audio5.perfect(); Audio5.kick(1);
    buzz(15);
  }else{
    /* il suono cresce con la rampa, come la potenza: 0,45 era il
       «presto» di ieri, 0,7 poco sotto il perfetto */
    Audio5.kick(0.45+0.25*rampa);
  }
  G.ball.tiroT=t;
}`,
},

/* 6 — la tacca, disegnata accanto all'anello del timing */
{
  nome: '6/7 drawPlayer: la tacca sulla bocca, dentro il blocco dell\'anello',
  cerca:
`    if(inWin){
      const pl=1+Math.sin(G.pulse*28)*0.08;
      ctx.strokeStyle='rgba(255,176,32,.8)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(p.x,p.y,R*pl+4,0,6.2832); ctx.stroke();
    }
  }`,
  metti:
`    if(inWin){
      const pl=1+Math.sin(G.pulse*28)*0.08;
      ctx.strokeStyle='rgba(255,176,32,.8)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(p.x,p.y,R*pl+4,0,6.2832); ctx.stroke();
    }
    /* L1.3 — LA TACCA SULLA BOCCA DELLA PORTA, all'altezza mirata:
       la mira si legge alla fine del suo tragitto, mai sotto il dito
       (Legge 3 — il polpastrello copre cio' che tocca). Compare solo
       quando un trascinamento ARMATO sta mirando: senza mira non c'e'
       niente da annunciare, e un segno fisso sarebbe rumore. Gesso
       fuori finestra, ambra dentro — lo stesso codice colore
       dell'anello qui sopra. La freccetta nei terzi estremi e'
       l'annuncio a tre stati (ALTO/CENTRO/BASSO) del progetto; la
       posizione resta continua. La geometria viene da taccaMira, la
       stessa funzione che zoneInterfaccia dichiara: il dipinto e la
       dichiarazione non possono divergere. */
    {
      const tk=taccaMira(p.team);
      if(tk){
        ctx.save();
        ctx.strokeStyle= inWin?COL.ambra:COL.gesso;
        ctx.lineWidth=2.2;
        ctx.beginPath(); ctx.moveTo(tk.gx-7,tk.gy); ctx.lineTo(tk.gx+7,tk.gy); ctx.stroke();
        if(tk.f<-0.33 || tk.f>0.33){
          const sV=tk.f<0?-1:1;
          ctx.beginPath();
          ctx.moveTo(tk.gx-3.5,tk.gy+sV*3);
          ctx.lineTo(tk.gx,tk.gy+sV*7.5);
          ctx.lineTo(tk.gx+3.5,tk.gy+sV*3);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }`,
},

/* 7 — la tacca dichiarata in zoneInterfaccia */
{
  nome: '7/7 zoneInterfaccia: la tacca dichiarata ricalcolando, non ricordando',
  cerca:
`    /* stick, pulsanti e bussola li tiene gia' TOUCH_ZONE, con la loro
       alfa corrente: si copiano, non si ricalcolano */
    for(const t of TOUCH_ZONE){`,
  metti:
`    /* L1.3 — la tacca di mira sulla bocca della porta: si dichiara
       RICALCOLANDO taccaMira, la stessa funzione che la disegna — una
       scrittura sola, quindi dichiarazione e dipinto non possono
       divergere. E' un segno sul mondo, e questa casa ha gia' pagato
       un segno semitrasparente sull'erba letto come ombra da
       istantanea.js: percio' si dichiara, piccolo com'e'. */
    for(let tq=0;tq<2;tq++){
      const tk=taccaMira(tq);
      if(tk) z.push({tipo:'tacca', x0:tk.x0, y0:tk.y0, x1:tk.x1, y1:tk.y1, alfa:0.9});
    }
    /* stick, pulsanti e bussola li tiene gia' TOUCH_ZONE, con la loro
       alfa corrente: si copiano, non si ricalcolano */
    for(const t of TOUCH_ZONE){`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l13.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l13.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* un controllo dopo la sostituzione: le funzioni nuove definite una
   volta sola e chiamate dove ci si aspetta */
const attesi = [
  ['function fireShotMirato(', 1],
  ['function letturaTiroViva(', 1],
  ['function miraTiroF(', 1],
  ['function taccaMira(', 1],
  ['const MIRA_SAT', 1],
  ['fireShotMirato(p, c, finestra, lettura, my)', 2],   /* definizione + chiamata */
  ['function releaseCharge(t, lettura)', 1],
  ['releaseCharge(bt.t, lettura)', 1],
  ['taccaMira(', 4],            /* definizione, fireShot no: disegno, zone, e le 2 chiamate interne? vedi sotto */
];
/* taccaMira( compare: 1 definizione + 1 disegno + 1 zoneInterfaccia = 3;
   miraTiroF( : 1 definizione + 1 in taccaMira + 1 in fireShotMirato = 3;
   letturaTiroViva( : 1 definizione + 1 in releaseCharge + 1 in taccaMira = 3. */
attesi[8] = ['taccaMira(', 3];
attesi.push(['miraTiroF(', 3]);
attesi.push(['letturaTiroViva(', 3]);
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
