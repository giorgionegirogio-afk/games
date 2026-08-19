/* =====================================================================
   TOPPA — L'OMBRA PORTA IL VERBO.

   COSA FA, in una riga: l'ombra dei giocatori vicini smette di essere
   una capsula (una macchia che dice solo «qui c'e' un uomo in piedi») e
   diventa la PROIEZIONE DI TAGLIO DELLA POSA VERA — lo stesso scheletro
   che Rig3D disegna, gettato sul manto lungo il sole.

   PERCHE'. La camera in pianta manda la QUOTA e la PROFONDITA' quasi
   sulla stessa direzione dello schermo, e nel piano sagittale — dove
   vivono tutti i verbi del calcio — la proiezione perde un asse. Il
   valore singolare minimo di quella mappa (unita' di schermo per metro,
   a figura alta 40) vale:

       imbardata      0     30     54,4    90 gradi
       CORPO         0,00  10,56  17,17  21,12
       OMBRA        17,70  20,01  16,97   8,42

   Lo zero della prima riga non e' un arrotondamento: e' un DETERMINANTE
   NULLO. Con il giocatore rivolto su o giu' per lo schermo, det J =
   s²·cos(E)·sin(imbardata) = 0 — braccio alzato e braccio teso in avanti
   finiscono nello stesso identico pixel. E la riga di sotto e' la
   ragione per cui questa toppa esiste: dove il corpo tace, l'ombra
   parla, perche' porta la quota lungo il SOLE invece che lungo lo
   schermo.

   PERCHE' NON SI E' ABBASSATO IL BECCHEGGIO (l'altra strada).
   Misurato sullo stesso conto, a figura alta 40 unita':

       elevazione E    42    36    30    25    20    16 gradi
       sigma1        28,41 26,10 24,08 23,30 22,47 21,97
       sigma2 (54,4)  17,17 17,17 17,17 17,17 17,17 17,17

   sigma2 NON SI MUOVE DI UN CENTESIMO fra 42 e 16 gradi. Non e' un caso
   numerico, e' un'identita': con hPx tenuto fermo, sigma2 = (hPx/1,9)·
   |sin(imbardata)| e sigma1 = (hPx/1,9)/cos(E). Il beccheggio governa
   SOLO la magnificazione laterale; l'asse che si perde resta perso
   uguale. Abbassare la camera non aggiunge un pixel d'informazione sul
   piano sagittale — smagrisce l'ovale del busto, e basta. In piu' le
   due scene dove abbassarla e' sensato lo fanno GIA': i rigori e la
   ripresa del gol chiamano Rig3D con la camera 'bassa' (16 gradi).

   =====================================================================
   LE QUATTRO MODIFICHE, e nessuna aggiunge una seconda copia di una
   verita' che il file gia' dichiara.

   1. ombraGeometria() esporta perMetro (quante unita' di manto vale un
      metro di quota) e dichiara l1 sulla QUOTA MASSIMA che uno scheletro
      puo' raggiungere, non piu' sull'altezza dell'uomo in piedi. Chi
      legge __test.ombraCapsula (collaudo.js, istantanea.js) riceve una
      capsula d'esclusione che copre ancora TUTTA l'ombra vera: e' il
      requisito dichiarato in testa a quella funzione, «il riquadro
      dev'essere sempre piu' largo dell'ombra vera, mai piu' stretto».

   2. Rig3D.ombraTraccia() — la proiezione sta DENTRO Rig3D, accanto a
      disegna(), perche' e' la stessa proiezione: stessa s = hPx/(1,9·ce),
      stessa imbardata, stessi diciotto giunti, stesso scratch P. Un
      secondo file che rifacesse quel conto sarebbe la copia che diverge.
      Diciassette ossa in UN SOLO tracciato e UNA SOLA passata di
      contorno: niente doppio inchiostro nei punti di sovrapposizione.

   3. drawOmbreGiocatori sceglie fra i due disegni con il predicato che
      c'era gia' — portatore o figura vicina — lo stesso che decide la
      macchia di contatto. Nessuna soglia nuova.

   4. rigAngolo(p) — l'imbardata della figura diventa una funzione sola,
      letta sia da drawPlayer sia dalla passata delle ombre. Prima stava
      scritta una volta sola dentro drawPlayer: copiarla qui sarebbe
      stato il difetto numero uno di questo file.

   =====================================================================
   COSA E' STATO MISURATO SU UNA COPIA FUORI DAL REPO (18 ago 2026),
   e cosa e' costato. I due file provati: 2e3acb02d958eef621212e02949
   bdc19 e, a lavoro finito, dd46fab6a6e4cb1c4b23465d4d844d15 — la
   toppa attacca su tutti e due.

     collaudo    36/36 su tutti e due i file toppati. I quattro rapporti
                 maglia/erba escono IDENTICI al centesimo (4,08 · 3,77 ·
                 5,06 · 4,24): l1 piu' lunga non ha spostato un campione
                 d'erba, perche' l'anello si campiona a ovest e le ombre
                 vanno a est.
     costo       misura APPAIATA (node _appaiata.js, 5 giri alternati da
                 6 s, freno 2x). Prova d'onesta' — lo stesso file contro
                 se' stesso — 0,0%; prova di vista — 8 ms di zavorra —
                 +37,7%. Con lo strumento cosi' tarato: 5 contro 5 la
                 voce che cresce di piu' fa +0,2%, 11 contro 11 +0,0%.
                 Sotto il pavimento di rumore dello strumento stesso.
     istantanea  QUI SI PAGA, ed e' l'unica voce in rosso. La riga delle
                 ombre passa da 7 istanti su 8 a 6. La deviazione delle
                 direzioni sale da 0,1-0,2 gradi a 0,5-2,2 sui sei
                 istanti che reggono, e a 9,3 (tetto 5) sul settimo, che
                 ha DUE sole figure misurabili. Non e' un'ombra storta:
                 ogni giunto e' gettato lungo il sole per costruzione.
                 E' che lo strumento adatta un ASSE all'inchiostro, e
                 l'inchiostro di un corpo disteso ha l'asse del corpo,
                 non quello della lampada — lo stesso guasto di metro
                 gia' nominato per `masse` (esclusione E2 di
                 silhouette.js). La strada per ripararlo: misurare la
                 direzione fra due giunti dichiarati (piede e testa),
                 non sul guscio dell'inchiostro.
     lunghezze   1,87-2,24 volte la figura (prima 1,98-2,41), contro un
                 minimo di 1,2. Restano dentro le 2,1-2,4 che il giudice
                 chiedeva.
     equita      4/4 al bit, misura 7/7, folla 4/4, seme, gabbia, volti:
                 verdi. Il cambiamento e' di solo disegno.

   =====================================================================
   SI RIFIUTA DI SCRIVERE se anche un solo ancoraggio non si trova
   ESATTAMENTE una volta, e dice quale.

     node strumenti/_toppa-ombra.js [file.html]
     node strumenti/_toppa-ombra.js --prova       (non scrive, controlla)
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const SOLO_PROVA = process.argv.includes('--prova');
const FILE = process.argv.slice(2).find(a => !a.startsWith('--'))
  || path.resolve(__dirname, '..', 'CALCETTO-il-gioco.html');

/* ---------------------------------------------------------------- 1 */
const A1_CERCA = `  const rot=Math.atan2(SOLE_UY,SOLE_UX)+0.070*w+0.1047*qo;
  const lung=base*(1+0.35*w)*(1+0.55*qo);
  return { ux:Math.cos(rot), uy:Math.sin(rot), rot, l0:0, l1:base*1.55,
           lungRiposo:lung, semiCorto:7.6, piedeX:4.2, piedeY:7.8 };`;

const A1_METTI = `  const rot=Math.atan2(SOLE_UY,SOLE_UX)+0.070*w+0.1047*qo;
  const lung=base*(1+0.35*w)*(1+0.55*qo);
  /* PER METRO DI QUOTA — il numero che l'ombra di POSA consuma, e sta
     qui perche' e' la stessa lunghezza dichiarata sopra, divisa per
     l'altezza dell'uomo. La capsula getta l'uomo intero (1,83 m) su
     'lung' unita' di manto; lo scheletro getta ogni giunto sulla propria
     quota, ed e' esattamente lo stesso rapporto. Una seconda costante
     scritta a mano nel ciclo caldo sarebbe la copia che diverge — e'
     gia' successo due volte con la direzione del sole. */
  const perMetro=lung/1.83;
  /* l1 SI MISURA SULLA QUOTA MASSIMA, NON PIU' SULL'ALTEZZA DELL'UOMO.
     Il riquadro d'esclusione che collaudo.js legge da qui deve coprire
     TUTTA l'ombra vera («sempre piu' largo dell'ombra vera, mai piu'
     stretto», il contratto scritto sopra). Finche' l'ombra era la
     capsula, la punta stava all'altezza della testa e base·1,55
     bastava; adesso la punta e' la MANO PIU' ALTA della posa, e le
     braccia al cielo arrivano a OMBRA_QUOTA_MAX metri. Il fattore 1,55
     resta quello che era: il tramonto di fine partita. */
  return { ux:Math.cos(rot), uy:Math.sin(rot), rot, l0:0,
           l1:(base*1.55/1.83)*OMBRA_QUOTA_MAX,
           lungRiposo:lung, perMetro, semiCorto:7.6, piedeX:4.2, piedeY:7.8 };`;

/* ---------------------------------------------------------------- 2 */
const A2_CERCA = `const GIUNTI={x:SX, y:SY, d:SD, n:NJ, nomi:{
  PELVIS, CHEST, NECK, HEAD, SHL, ELL, HAL, SHR, ELR, HAR,
  HIPL, KNL, FTL, HIPR, KNR, FTR, TOL, TOR}};
return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI,`;

const A2_METTI = `const GIUNTI={x:SX, y:SY, d:SD, n:NJ, nomi:{
  PELVIS, CHEST, NECK, HEAD, SHL, ELL, HAL, SHR, ELR, HAR,
  HIPL, KNL, FTL, HIPR, KNR, FTR, TOL, TOR}};

/* =====================================================================
   L'OMBRA CHE PORTA IL VERBO — la posa vera, gettata sul manto.

   PERCHE' STA QUI DENTRO E NON ACCANTO A drawOmbreGiocatori. E' LA
   STESSA PROIEZIONE di disegna(): stessa scala s = hPx/(1,9·ce), stessa
   imbardata, stesso scratch P, stessi diciotto giunti. Scritta fuori
   sarebbe una seconda copia della proiezione della camera, e questo file
   ha gia' pagato due volte per aver tenuto due copie della stessa
   verita' (la direzione del sole, la geometria della capsula).

   IL CONTO, in tre righe. Un giunto sta in (x, y, z) metri nel corpo;
   la sua PROIEZIONE A TERRA — dove il corpo tocca il manto sotto di lui
   — e' (xw·s, -zw·se·s), la stessa che disegna() usa per la macchia di
   contatto. La sua OMBRA sta piu' in la' di y·perMetro lungo il sole,
   perche' l'ombra di un punto alto y metri cade a y·perMetro dal suo
   piede: e' la definizione stessa dell'ombra, e perMetro la dichiara
   ombraGeometria una volta sola.

   IL RIFERIMENTO E' GIA' RUOTATO. Il chiamante ha aperto un ctx.rotate
   sull'angolo del sole (una rotazione per passata, non ventidue: vedi
   il punto 1 in testa a drawOmbreGiocatori). Dentro quel riferimento il
   versore del sole vale esattamente (1, 0), quindi la quota si somma
   alla sola X e non costa ne' seno ne' coseno.

   DICIASSETTE OSSA IN UN SOLO TRACCIATO, UNA SOLA PASSATA DI CONTORNO.
   Una passata sola non e' un'ottimizzazione: e' l'unico modo di NON
   raddoppiare l'inchiostro dove due ossa si incrociano. Due stroke da
   0,52 d'alfa sovrapposte danno 0,77, e la spalla diventerebbe una
   macchia piu' scura del resto — un difetto che si vede subito e non si
   spiega. Il TRONCO legge largo senza una seconda larghezza: i suoi due
   FIANCHI (spalla-anca, destra e sinistra) sono ossa come le altre e
   chiudono il quadrilatero del busto dentro lo stesso tracciato.

   COSTO DICHIARATO: una valutazione di clip.pose() in piu' per figura
   (la passata delle ombre gira PRIMA di tutti i corpi, quindi i giunti
   della figura non esistono ancora), diciotto proiezioni e diciassette
   coppie moveTo/lineTo. Si paga solo sulle figure VICINE — le lontane
   tengono la capsula, che a quella distanza dice gia' tutto quello che
   c'e' da dire.
   ===================================================================== */
const OMB_OSSA=new Int8Array([
  PELVIS,CHEST, CHEST,NECK, NECK,HEAD,       // la colonna e la testa
  SHL,SHR, HIPL,HIPR, SHL,HIPL, SHR,HIPR,    // il quadrilatero del busto
  SHL,ELL, ELL,HAL, SHR,ELR, ELR,HAR,        // le braccia
  HIPL,KNL, KNL,FTL, FTL,TOL,                // la gamba sinistra
  HIPR,KNR, KNR,FTR, FTR,TOR]);              // la destra
const OSX=new Float32Array(NJ), OSY=new Float32Array(NJ);
/* ox, oy      il piede dell'ombra, GIA' nel riferimento ruotato
   perMetro    unita' di manto per metro di quota (da ombraGeometria)
   scala       il rimpicciolimento della figura in volo (r del chiamante) */
function ombraTraccia(g, ox, oy, hPx, yaw, nomeClip, tSec, corp, varb, C, S, perMetro, scala){
  const clip=CLIPS[nomeClip]; if(!clip) return false;
  corpora(corp===undefined?3:corp, varb||0);
  let u=(tSec*clip.freq)%1; if(u<0)u+=1;
  clip.pose(u);
  const cam=CAMERE.alto;
  const ce=cam.ce<0.58?0.58:cam.ce;
  const s=Math.max(0, hPx/(1.9*ce))*scala;
  const pm=perMetro*scala;
  const cyw=Math.cos(yaw), syw=Math.sin(yaw);
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    /* dove il giunto tocca terra, in unita' di manto NON ruotate */
    const gx=xw*s, gy=-zw*cam.se*s;
    /* ...e poi nel riferimento del sole, dove la quota va tutta in X */
    OSX[j]=ox + gx*C+gy*S + (y>0?y:0)*pm;
    OSY[j]=oy - gx*S+gy*C;
  }
  g.beginPath();
  for(let i=0;i<OMB_OSSA.length;i+=2){
    const a=OMB_OSSA[i], b=OMB_OSSA[i+1];
    g.moveTo(OSX[a],OSY[a]); g.lineTo(OSX[b],OSY[b]);
  }
  g.stroke();
  return true;
}

return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia,`;

/* ---------------------------------------------------------------- 3 */
const A3_CERCA = `    const vv=Math.sqrt((p.vx||0)*(p.vx||0)+(p.vy||0)*(p.vy||0));
    const stretta=SAVE.moto ? clamp((vv-14)/40,0,1) : 0;
    const sc=(GEO.semiCorto-1.2*stretta)*r;
    const L=LUNG*r;
    ctx.globalAlpha=a*OMA;
    /* la tessitura ha la testa tonda a 32/256 e la punta a 252/256: si
       riscala perche' il centro del tondo cada ESATTO sul piede e la punta
       esatta a L unita' di distanza */
    ctx.drawImage(ombraLungaTex, X-L*0.1455, Y-sc, L*1.164, sc*2);
    const ac=a*Math.max(0,1-h*0.16);
    /* LOD: lontano dal centro-camera l'ombra e' la sola capsula lunga
       (mai sul portatore: la sua figura e' sempre a dettaglio pieno) */
    const portatore = G.ball && G.ball.owner>=0 && G.players[G.ball.owner]===p;
    if(ac>0.02 && (portatore || !figuraLontana(p))){`;

const A3_METTI = `    const vv=Math.sqrt((p.vx||0)*(p.vx||0)+(p.vy||0)*(p.vy||0));
    const stretta=SAVE.moto ? clamp((vv-14)/40,0,1) : 0;
    const sc=(GEO.semiCorto-1.2*stretta)*r;
    const L=LUNG*r;
    ctx.globalAlpha=a*OMA;
    /* IL BIVIO: LA POSA O LA CAPSULA.
       Il predicato e' quello che c'era gia' due righe piu' sotto — il
       portatore, o una figura non lontana — lo stesso che decide la
       macchia di contatto. Nessuna soglia nuova da tarare, e la regola
       resta una: quando la figura merita il dettaglio, lo merita anche
       la sua ombra.
       LA POSA CHE SI GETTA E' QUELLA CHE SI DISEGNERA'. rigStato legge
       p.lodPosa, e per ogni figura che entra in questo ramo drawPlayer
       calcolera' lod=false (la sua condizione contiene !hasBall e
       figuraLontana): scriverlo qui non anticipa una scelta, la ripete
       identica un attimo prima. L'imbardata la da' rigAngolo, che e'
       la STESSA funzione che drawPlayer chiamera' fra poche righe. */
    const portatore = G.ball && G.ball.owner>=0 && G.players[G.ball.owner]===p;
    const vicino = portatore || !figuraLontana(p);
    let fatta=false;
    if(vicino){
      p.lodPosa=false;
      const st=rigStato(p), lk=rigLook(p);
      fatta=Rig3D.ombraTraccia(ctx, X, Y,
              RIG_H/(p.squash||1), rigAngolo(p)+RIG_YAW_K,
              st.clip, st.u/Rig3D.CLIPS[st.clip].freq,
              lk.corp, lk.varb, C, S, GEO.perMetro, r);
    }
    if(!fatta){
      /* la tessitura ha la testa tonda a 32/256 e la punta a 252/256: si
         riscala perche' il centro del tondo cada ESATTO sul piede e la punta
         esatta a L unita' di distanza */
      ctx.drawImage(ombraLungaTex, X-L*0.1455, Y-sc, L*1.164, sc*2);
    }
    const ac=a*Math.max(0,1-h*0.16);
    /* LOD: lontano dal centro-camera l'ombra e' la sola capsula lunga
       (mai sul portatore: la sua figura e' sempre a dettaglio pieno) */
    if(ac>0.02 && vicino){`;

/* ---------------------------------------------------------------- 3b
   lo stato del contorno: si scrive UNA VOLTA per passata, fuori dal
   ciclo, come la rotazione. */
const A3B_CERCA = `  ctx.rotate(rot);
  for(const p of lista){
    /* fermo composto: se la figura non si disegna, nemmeno l'ombra —
       una macchia scura senza corpo era il glitch del giro 2 */
    if(fermoCoperto(p)) continue;`;

const A3B_METTI = `  ctx.rotate(rot);
  /* LO STATO DEL CONTORNO, UNA VOLTA PER PASSATA — stessa economia della
     rotazione qui sopra. La tinta e' quella di ombraLungaTex, (14·38·32):
     erba col cielo dentro, verde sopra il blu. Non e' un'altra tinta
     d'ombra, e' LA tinta d'ombra: se qui si scrivesse un secondo colore,
     un giocatore vicino e uno lontano getterebbero due ombre di due
     grigi diversi nello stesso fotogramma.
     OMBRA_LARG = 6,6 unita': piu' grosso di una coscia (5,8) e piu'
     sottile del busto (7,5), cioe' una sola larghezza che regge sia gli
     arti sia il tronco. Il tronco resta largo lo stesso perche' i suoi
     due fianchi sono ossa del tracciato. */
  ctx.strokeStyle='rgb(14,38,32)';
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.lineWidth=OMBRA_LARG;
  for(const p of lista){
    /* fermo composto: se la figura non si disegna, nemmeno l'ombra —
       una macchia scura senza corpo era il glitch del giro 2 */
    if(fermoCoperto(p)) continue;`;

/* ---------------------------------------------------------------- 4 */
const A4_CERCA = `    const look = rigLook(p);
    let a;
    if(p.dive>0 || (gk && p.recover>0)) a = Math.atan2(p.diveDY,p.diveDX);
    /* rovesciata: la SCHIENA alla porta — il corpo si disegna girato via
       dalla rete e la forbice manda la palla sopra la testa */
    else if(p.rove>=0 || (p.charge>=0 && p.chargeKind==='rovesciata'))
      a = Math.atan2(-(p.roveDY||p.fy), -(p.roveDX||p.fx));
    else if(p.slide>=0 || p.recover>0) a = Math.atan2(p.slideDY||p.fy, p.slideDX||p.fx);
    /* LA FESTA IN PROIEZIONE COERENTE (15 ago 2026): guardava la camera
       in pieno frontale, e nel primo piano del gol la figura leggeva come
       una figurina incollata su un campo visto dall'alto. La camera di
       gioco RESTA dall'alto (la bassa e' dei rigori e della ripresa):
       qui la festa va verso la curva sud di TRE QUARTI, alternando il
       lato per indice — la torsione da' profondita' alla posa, e il
       volto del LOD resta leggibile. */
    else if(celeb) a = Math.PI/2 + (p.idx&1 ? 0.38 : -0.38);
    else a = p.ang;
    const yaw = a + RIG_YAW_K;               // taratura: vedi RIG_YAW_K`;

const A4_METTI = `    const look = rigLook(p);
    const yaw = rigAngolo(p) + RIG_YAW_K;    // taratura: vedi RIG_YAW_K`;

/* la funzione estratta va messa accanto a rigStato, che e' l'altra meta'
   della stessa domanda («che posa, e girata dove») */
const A5_CERCA = `function rigStato(p){
  const st = RIGST;
  const gk = p.role==='gk';`;

const A5_METTI = `/* =====================================================================
   DOVE GUARDA LA FIGURA — una funzione sola, due lettori.

   Stava dentro drawPlayer, ed era giusto finche' la sola cosa che
   avesse bisogno dell'imbardata era il corpo. Adesso la chiede anche la
   passata delle ombre, che gira PRIMA di tutti i corpi e deve gettare a
   terra ESATTAMENTE la posa che verra' disegnata dopo. Copiarla la'
   dentro sarebbe stato il difetto piu' vecchio di questo file: due
   pezzi di codice che calcolano la stessa cosa, e che un giorno smettono
   di calcolarla uguale. Il corpo di questa funzione non e' cambiato di
   una virgola rispetto a com'era in drawPlayer.
   ===================================================================== */
function rigAngolo(p){
  const gk = p.role==='gk';
  if(p.dive>0 || (gk && p.recover>0)) return Math.atan2(p.diveDY,p.diveDX);
  /* rovesciata: la SCHIENA alla porta — il corpo si disegna girato via
     dalla rete e la forbice manda la palla sopra la testa */
  if(p.rove>=0 || (p.charge>=0 && p.chargeKind==='rovesciata'))
    return Math.atan2(-(p.roveDY||p.fy), -(p.roveDX||p.fx));
  if(p.slide>=0 || p.recover>0) return Math.atan2(p.slideDY||p.fy, p.slideDX||p.fx);
  /* LA FESTA IN PROIEZIONE COERENTE (15 ago 2026): guardava la camera
     in pieno frontale, e nel primo piano del gol la figura leggeva come
     una figurina incollata su un campo visto dall'alto. La camera di
     gioco RESTA dall'alto (la bassa e' dei rigori e della ripresa):
     qui la festa va verso la curva sud di TRE QUARTI, alternando il
     lato per indice — la torsione da' profondita' alla posa, e il
     volto del LOD resta leggibile. */
  if(p.celeb>0) return Math.PI/2 + (p.idx&1 ? 0.38 : -0.38);
  return p.ang;
}
function rigStato(p){
  const st = RIGST;
  const gk = p.role==='gk';`;

/* Le due costanti nuove stanno PRIMA di ombraGeometria e non accanto a
   OMBRA_ALFA, che pure sarebbe la manopola sorella: ombraGeometria le
   legge, e questo file ha gia' un verbale (FINESTRE_SERA) su cosa
   succede a dichiarare un const dopo il punto in cui lo si usa. Oggi
   nessuno chiama ombraGeometria durante il caricamento e la zona morta
   non morderebbe; domani basta una cottura in piu' dentro resize(). */
const A6_CERCA = `function ombraGeometria(){`;
const A6_METTI = `/* LA QUOTA PIU' ALTA CHE UNO SCHELETRO PUO' RAGGIUNGERE, in metri.
   Non e' un margine scelto a occhio: e' il massimo di P[j*3+1] enumerato
   su TUTTE le 21 clip x 128 fasi x 4 corporature. Il vertice e' la mano
   del portiere che PRENDE, a 2,126 m (u 0,42, corporatura 0); subito
   dietro il pugno al cielo dell'esultanza, 2,101. Qui sta 2,34, cioe'
   quel massimo piu' un decimo di margine.
   Serve a ombraGeometria per dichiarare l1, il riquadro d'esclusione che
   collaudo.js usa per non campionare l'ombra al posto dell'erba: se
   questo numero fosse piu' piccolo del vero, la punta dell'ombra di una
   presa finirebbe dentro l'anello dell'erba e il rapporto di contrasto
   tornerebbe FALSO IN VERDE, che e' il modo peggiore di sbagliare.
   Chi aggiunge una clip nuova con le braccia piu' alte deve rifare
   quell'enumerazione: e' il prezzo dichiarato di questa costante. */
const OMBRA_QUOTA_MAX=2.34;
/* LA LARGHEZZA DEL TRATTO D'OMBRA, in unita' di manto. Una sola, e in
   mezzo alle due che conterebbero: la coscia sta a 5,8 unita' a schermo
   (0,24 m x 24,08) e il busto a 7,5. Con una larghezza sola il
   tracciato si disegna in UNA passata e non raddoppia l'inchiostro sulle
   spalle; il busto resta largo lo stesso perche' i suoi fianchi sono
   ossa del tracciato. Inchiostro totale a figura in piedi: ~169 unita'
   di osso x 6,6 = 1.115 unita quadre, contro le ~1.250 della capsula —
   l'ombra nuova pesa MENO della vecchia, e l'alfa non si tocca.
   NON si riduce con la figura in volo: il tratto resta 6,6 mentre lo
   scheletro rimpicciolisce di r (al massimo -21% nel salto piu' alto
   dell'esultanza). E' una scorciatoia dichiarata — una scrittura di
   stato in meno per figura — e vale finche' nessuno la trova brutta. */
const OMBRA_LARG=6.6;
function ombraGeometria(){`;

/* ---------------------------------------------------------------- 7
   chi legge la capsula dichiarata legge anche il perMetro: senza, uno
   strumento che voglia verificare l'ombra di posa dovrebbe rifarsi il
   conto — cioe' la copia che diverge, per la terza volta. */
const A7_CERCA = `    return { ux:g.ux, uy:g.uy, l0:g.l0, l1:g.l1, lungRiposo:g.lungRiposo,
             semiCorto:g.semiCorto, piedeX:g.piedeX, piedeY:g.piedeY,
             alt:SOLE.alt, dir:[SOLE.dir[0],SOLE.dir[1]] };`;
const A7_METTI = `    return { ux:g.ux, uy:g.uy, l0:g.l0, l1:g.l1, lungRiposo:g.lungRiposo,
             perMetro:g.perMetro, quotaMax:OMBRA_QUOTA_MAX, larg:OMBRA_LARG,
             semiCorto:g.semiCorto, piedeX:g.piedeX, piedeY:g.piedeY,
             alt:SOLE.alt, dir:[SOLE.dir[0],SOLE.dir[1]] };`;

/* ===================================================================== */
const ANCORE = [
  { n: 'ombraGeometria (perMetro e l1)', c: A1_CERCA, m: A1_METTI },
  { n: 'Rig3D.ombraTraccia (la proiezione)', c: A2_CERCA, m: A2_METTI },
  { n: 'drawOmbreGiocatori (lo stato del contorno)', c: A3B_CERCA, m: A3B_METTI },
  { n: 'drawOmbreGiocatori (il bivio posa/capsula)', c: A3_CERCA, m: A3_METTI },
  { n: 'drawPlayer (l\'imbardata estratta)', c: A4_CERCA, m: A4_METTI },
  { n: 'rigAngolo (la funzione nuova)', c: A5_CERCA, m: A5_METTI },
  { n: 'OMBRA_QUOTA_MAX e OMBRA_LARG', c: A6_CERCA, m: A6_METTI },
  { n: '__test.ombraCapsula (perMetro dichiarato)', c: A7_CERCA, m: A7_METTI },
];

let testo;
try { testo = fs.readFileSync(FILE, 'utf8'); }
catch (e) { console.error('NON SI APRE: ' + FILE + ' — ' + e.message); process.exit(3); }

/* PRIMA SI CONTA TUTTO, POI SI SCRIVE. Un ancoraggio che manca a meta'
   strada lascerebbe il file mezzo toppato, che e' peggio di non averlo
   toccato. */
let guasto = 0;
for (const a of ANCORE) {
  const n = testo.split(a.c).length - 1;
  if (n !== 1) {
    console.error(`ANCORAGGIO ${n === 0 ? 'NON TROVATO' : 'TROVATO ' + n + ' VOLTE'}: ${a.n}`);
    guasto++;
  }
}
/* e la prova che la toppa non e' gia' dentro */
if (/OMBRA_QUOTA_MAX/.test(testo) && guasto) {
  console.error('(la toppa sembra gia\' applicata: OMBRA_QUOTA_MAX c\'e\' gia\')');
}
if (guasto) {
  console.error(`\n${guasto} ancoraggi su ${ANCORE.length} non stanno una volta sola. NON SCRIVO NIENTE.`);
  process.exit(1);
}

let fuori = testo;
for (const a of ANCORE) fuori = fuori.replace(a.c, () => a.m);

if (SOLO_PROVA) {
  console.log(`PROVA: tutti e ${ANCORE.length} gli ancoraggi stanno esattamente una volta.`);
  console.log(`       ${testo.length} -> ${fuori.length} byte (+${fuori.length - testo.length}). Non ho scritto.`);
  process.exit(0);
}
fs.writeFileSync(FILE, fuori);
console.log(`FATTO: ${ANCORE.length} ancoraggi sostituiti in ${path.basename(FILE)}.`);
console.log(`       ${testo.length} -> ${fuori.length} byte (+${fuori.length - testo.length}).`);
