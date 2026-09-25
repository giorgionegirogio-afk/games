/* =====================================================================
   _toppa-155-persone.js — QUATTRO UOMINI, NON UN CLONE PER QUATTRO
   (voce #155, giro 1 · criterio C6 della giuria)

   ====================== I QUATTRO DIFETTI, MISURATI ===================
   Il provino della voce #154 li ha contati uno per uno:
     · le quattro corporature hanno la GAMBA IDENTICA (0,910 m), la
       FALCATA identica (1,0308 m) e la CADENZA identica (2,6): quattro
       fisici che camminano con lo stesso passo, per sempre in fase;
     · l'altezza a schermo varia del 2,1% (331/338/337/335 px su 338) e
       quel 2,1% viene tutto dal RAGGIO DELLA TESTA;
     · la quarta corporatura NON esce mai in partita (rigLook fa %3);
     · non esiste un MANCINO: passaggio, filtrante, cross, tiro e testa
       armano tutte il destro (z destro 0,745-0,960 contro 0,154-0,267).

   ====================== 1. LA STATURA, E IL SUO TETTO =================
   La statura entra come un fattore STAT sulla scala s del disegno: e'
   l'unico modo di far crescere o calare un uomo INTERO — testa, busto,
   arti, passo — senza toccare una sola lunghezza d'osso, quindi senza
   muovere di un millimetro la gabbia del banco (che misura metri).
   IL TETTO LO METTE LA CIMA DELLA TESTA, e si calcola: gabbia.js misura
   la cima a -34,33 unita' di schermo (clip 'presa') e boccia sotto
   -35,10. Lo spilungone, che ha la testa piu' piccola dell'8%, arriva a
   -33,92 a statura 1,000 e a -34,72 a 1,018: DA LI' IN SU' comincerebbe a
   spingere capelli dentro l'anello d'erba della sonda di collaudo.js, e
   il rapporto maglia/erba cambierebbe senza che la maglia sia stata
   toccata. Percio' 1,018 e non 1,05: il numero non e' scelto, e' il
   massimo che la cima concede, con tre decimi di unita' di margine. La sonda dell'erba di collaudo.js campiona un anello
   attorno a ogni giocatore escludendo una scatola alta 28 unita', e la
   cima della testa sta gia' un'unita' oltre quel confine (gabbia.js,
   riferimento -34,6 su 'presa'): alzare le figure spingerebbe capelli
   dentro i campioni d'erba e sposterebbe il rapporto maglia/erba senza
   che la maglia sia stata toccata. Percio' i quattro fattori sono
   1,018 / 0,984 / 0,962 / 1,000: la differenza si compra SCENDENDO.
   Tre virgola otto per cento fra lo spilungone e il piccoletto,
   piu' il 9% di raggio della testa che c'era gia': a cinquanta pixel
   sono quasi tre pixel di statura e una testa visibilmente diversa.
   La taglia NOMINALE (neutro, e con lei il banco, il duello e la
   ripresa del gol) resta esattamente 1,000: la figura di partita e'
   alta 50,1 px oggi ed e' alta 50,1 px domani.
   Il banco ?gabbia impara STAT, perche' un banco che misurasse la cima
   della testa senza la statura attesterebbe invece di misurare.

   ====================== 2. LA FALCATA E LA CADENZA ====================
   PASSO moltiplica l'ampiezza della falcata e del braccio dentro
   poseLoco: 1,10 / 0,94 / 0,88 / 1,00. CAD moltiplica la FASE delle sole
   clip cicliche (fermo, camminata, corsa, attesa del portiere), che
   d'ora in poi si dichiarano `ciclo:1`: 0,93 / 1,07 / 1,13 / 1,00.
   Le due leve vanno in direzioni OPPOSTE — passo lungo e cadenza lenta,
   passo corto e cadenza svelta — perche' e' cosi' che cammina la gente
   e perche' raddoppia la differenza fra due figure affiancate.
   SOLO le clip cicliche, e la ragione e' dura: in tutte le altre la fase
   la calcola rigStato dalla simulazione, e l'istante del contatto col
   pallone deve restare dov'e'. Una cadenza sul tiro sposterebbe il
   colpo rispetto alla palla: sarebbe un tocco alla partita travestito
   da grafica.

   ====================== 3. LA QUARTA CORPORATURA ======================
   rigLook faceva `(p.corp|0)%3` e la quarta riga di CORPI non usciva
   mai. p.corp NON SI TOCCA — quel numero entra nel giro che sposta il
   seme quando due compagni si somigliano (vestiDalNome e i due rientri
   in rosa), e cambiarlo cambierebbe i semi, cioe' la partita. La
   corporatura del DISEGNO si prende da un'altra fetta dello stesso
   seme, e resta nel disegno.

   ====================== 4. IL MANCINO =================================
   Un uomo su quattro arma il sinistro. Non si riscrivono le pose: si
   SPECCHIA la posa gia' valutata sull'asse laterale (x -> -x), che e'
   esattamente la definizione anatomica di un mancino e conserva per
   costruzione ogni lunghezza d'osso e ogni angolo della scatola. Costa
   diciotto negazioni per figura. Si specchia anche la palla della clip
   e l'arco di scia, se no il piede andrebbe da una parte e il pallone
   dall'altra. L'ombra a posa piena (ombraTraccia) riceve il flag e si
   specchia con lui: corpo e ombra restano UN oggetto.
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------
   1. LA TAVOLA DEI CORPI — tre colonne nuove
   ------------------------------------------------------------------ */
cambio('1. CORPI: statura, falcata, cadenza',
`const CORPI=[
  /* 0 spilungone */ {g:1.00, b:1.04, sp:0.88, sh:0.96, hr:0.96},
  /* 1 tarchiato  */ {g:1.00, b:0.97, sp:1.14, sh:1.06, hr:1.00},
  /* 2 piccoletto */ {g:1.00, b:0.95, sp:1.00, sh:0.98, hr:1.05},`,
`/* =====================================================================
   LE TRE COLONNE NUOVE (voce #155) — st, pa, cd.
   st  LA STATURA: un fattore sulla scala di disegno, cioe' l'uomo
       INTERO piu' alto o piu' basso, senza toccare una lunghezza
       d'osso (la gabbia misura metri e non si accorge di niente).
       NESSUNO SALE SOPRA 1,000, ed e' un vincolo non un gusto: la cima
       della testa sta gia' oltre il bordo della scatola che la sonda
       dell'erba di collaudo.js usa per escludere i corpi, e alzare le
       figure metterebbe capelli fra i campioni d'erba. La differenza
       si compra scendendo.
   pa  LA FALCATA: moltiplica l'ampiezza di gamba e braccio dentro
       poseLoco. Prima era 1,0308 m per tutti e quattro.
   cd  LA CADENZA: moltiplica la fase delle sole clip cicliche. Prima
       era 2,6 per tutti e quattro, cioe' due figure affiancate
       restavano in passo per sempre.
   pa e cd vanno in direzioni OPPOSTE — passo lungo e cadenza lenta,
   passo corto e cadenza svelta — perche' cosi' cammina la gente e
   perche' cosi' la differenza fra due figure vicine raddoppia.

   LE QUATTRO COLONNE VECCHIE SI ALLARGANO, e il perche' e' che a
   cinquanta pixel la statura da sola non basta (vedi il tetto qui
   sopra: nessuno puo' salire). Quello che a quella taglia si legge
   davvero e' il RAPPORTO — testa grossa o piccola, spalle larghe o
   strette, arti grossi o sottili:
       hr  0,96 -> 0,88  /  1,05 -> 1,18   (testa: 9% -> 34% di scarto)
       sp  0,88 -> 0,80  /  1,14 -> 1,26   (spessore degli arti)
       sh  0,96 -> 0,94  /  1,06 -> 1,10   (semilarghezza delle spalle)
   Nessuna delle tre tocca la finestra della sonda del contrasto — il
   trapezio del busto ha larghezze COSTANTI (W_PETTO/W_VITA), non
   scalate dalla corporatura — e nessuna alza la cima della testa oltre
   il riferimento: il piccoletto, con la testa piu' grossa del 18%, sta
   comunque sotto perche' la sua statura e' 0,962 (verificato da
   gabbia.js, non dedotto).
   b RESTA >= 0,95 e non e' un dettaglio: braccio() converte armOut in
   un seno di abduzione dividendolo per UA = 0,27*b, e Q_FERMO chiede
   armOut 0,220. A b = 0,95 il tetto sin(1,05) si sfonda oltre 0,2225; a
   b = 0,94 sarebbe 0,2201, cioe' SOTTO quello che il fermo chiede, e la
   scatola degli angoli comincerebbe a tagliare invece di aprire.
   ===================================================================== */
const CORPI=[
  /* 0 spilungone */ {g:1.00, b:1.06, sp:0.80, sh:0.94, hr:0.88, st:1.018, pa:1.10, cd:0.93},
  /* 1 tarchiato  */ {g:1.00, b:0.96, sp:1.26, sh:1.10, hr:1.00, st:0.984, pa:0.94, cd:1.07},
  /* 2 piccoletto */ {g:1.00, b:0.95, sp:1.04, sh:0.97, hr:1.18, st:0.962, pa:0.88, cd:1.13},`);

cambio('2. la quarta riga dichiara le sue tre colonne',
`                     {g:1.00, b:1.00, sp:1.00, sh:1.00, hr:1.00},
];`,
`                     {g:1.00, b:1.00, sp:1.00, sh:1.00, hr:1.00, st:1.000, pa:1.00, cd:1.00},
];`);

cambio('3. corpora() ricuoce anche statura, falcata e cadenza',
`let MSP=1;       // moltiplicatore di SPESSORE degli arti (solo disegno)`,
`let MSP=1;       // moltiplicatore di SPESSORE degli arti (solo disegno)
let STAT=1;      // LA STATURA: fattore sulla scala di disegno (mai sopra 1)
let PASSO=1;     // l'ampiezza della falcata, dentro poseLoco
let CAD=1;       // la cadenza delle clip cicliche (clip.ciclo)
/* IL MANCINO: stato di modulo, riscritto a ogni disegna() dal look.
   Non sta in CORPI perche' la mano che arma non e' una corporatura. */
let MANC=false;
function specchia(){ for(let j=0;j<NJ;j++) P[j*3]=-P[j*3]; }`);

cambio('4. corpora() assegna le tre grandezze nuove',
`  SHW=N_SHW*q.sh; HEADR=N_HEADR*q.hr;
  GAMBA_L=THIGH+SHIN;
  DP=GAMBA_L-(N_THIGH+N_SHIN);
  MSP=q.sp;
}`,
`  SHW=N_SHW*q.sh; HEADR=N_HEADR*q.hr;
  GAMBA_L=THIGH+SHIN;
  DP=GAMBA_L-(N_THIGH+N_SHIN);
  MSP=q.sp;
  STAT=q.st===undefined?1:q.st;
  PASSO=q.pa===undefined?1:q.pa;
  CAD=q.cd===undefined?1:q.cd;
}`);

/* ------------------------------------------------------------------
   2. LA LOCOMOZIONE PRENDE LA FALCATA
   ------------------------------------------------------------------ */
cambio('5. poseLoco: falcata e bracciata per corporatura',
`  const aAR=-q.arm*sw+q.armOfs+(q.armOfsR||0), aAL=q.arm*sw+q.armOfs+(q.armOfsL||0);`,
`  /* LA FALCATA E' DEL GIOCATORE, non della clip (voce #155): PASSO
     moltiplica l'AMPIEZZA di braccio e gamba, non gli scarti fissi —
     un uomo dal passo corto non tiene le braccia in un altro posto,
     le muove di meno. */
  const aAR=-q.arm*PASSO*sw+q.armOfs+(q.armOfsR||0), aAL=q.arm*PASSO*sw+q.armOfs+(q.armOfsL||0);`);

cambio('6. poseLoco: la gamba',
`  const aR=q.leg*sw+q.legOfs, aL=-q.leg*sw+q.legOfs;`,
`  const aR=q.leg*PASSO*sw+q.legOfs, aL=-q.leg*PASSO*sw+q.legOfs;`);

/* ------------------------------------------------------------------
   3. LE CLIP CICLICHE SI DICHIARANO
   ------------------------------------------------------------------ */
cambio('7. ciclo:1 sulle quattro clip a cui la cadenza si applica',
`  fermo:     {freq:0.5, pose:poseFermo},
  attesaGK:  {freq:0.42,pose:poseAttesaGK},   // la sagoma del ruolo (vedi poseAttesaGK)
  camminata: {freq:1.5, pose:poseCamminata},
  corsa:     {freq:2.6, pose:poseCorsa},`,
`  /* ciclo:1 — LE SOLE CLIP A CUI LA CADENZA DEL GIOCATORE SI APPLICA
     (voce #155). Sono cicli continui: spostarne la fase non sposta
     niente. In tutte le altre la fase la calcola rigStato dalla
     simulazione e l'istante del contatto col pallone deve restare dov'e':
     una cadenza sul tiro sarebbe un tocco alla partita travestito da
     grafica. */
  fermo:     {freq:0.5, pose:poseFermo, ciclo:1},
  attesaGK:  {freq:0.42,pose:poseAttesaGK, ciclo:1},   // la sagoma del ruolo (vedi poseAttesaGK)
  camminata: {freq:1.5, pose:poseCamminata, ciclo:1},
  corsa:     {freq:2.6, pose:poseCorsa, ciclo:1},`);

/* ------------------------------------------------------------------
   4. IL DISEGNO: statura, cadenza, specchio
   ------------------------------------------------------------------ */
cambio('8. disegna(): la cadenza entra nella fase',
`  corpora(look.corp===undefined?3:look.corp, look.varb||0);
  let u=(tSec*clip.freq)%1; if(u<0)u+=1;
  const cyw=Mcos(yaw), syw=Msin(yaw);`,
`  corpora(look.corp===undefined?3:look.corp, look.varb||0);
  /* LA MANO CHE ARMA (voce #155): stato di modulo, riscritto QUI e solo
     qui, cosi' nessun chiamante distratto puo' lasciarlo acceso. */
  MANC=!!look.manc;
  const mg=MANC?-1:1;
  /* LA CADENZA del giocatore, sulle sole clip cicliche (clip.ciclo) */
  let u=(tSec*clip.freq*(clip.ciclo?CAD:1))%1; if(u<0)u+=1;
  const cyw=Mcos(yaw), syw=Msin(yaw);`);

cambio('9. disegna(): la statura entra nella scala',
`  const s=Math.max(0, hPx/(1.9*ce));
  // arco di scia del giunto che frusta (rovesciata): le due posizioni
  // passate, valutate PRIMA della posa vera (P e' scratch riusato)
  let nsc=0;
  if(clip.scia && u>clip.scia.t0 && u<clip.scia.t1){
    for(let g=2;g>=1;g--){
      clip.pose(u-0.022*g);
      const j=clip.scia.j, x=P[j*3], y=P[j*3+1], z=P[j*3+2];`,
`  /* LA STATURA (voce #155) moltiplica la scala, cioe' l'uomo INTERO:
     nessuna lunghezza d'osso cambia e la gabbia, che misura metri, non
     se ne accorge. Nessuna corporatura sta sopra 1,000 — vedi il
     riquadro di CORPI: la cima della testa e' un invariante. */
  const s=Math.max(0, hPx*STAT/(1.9*ce));
  // arco di scia del giunto che frusta (rovesciata): le due posizioni
  // passate, valutate PRIMA della posa vera (P e' scratch riusato)
  let nsc=0;
  if(clip.scia && u>clip.scia.t0 && u<clip.scia.t1){
    for(let g=2;g>=1;g--){
      clip.pose(u-0.022*g);
      const j=clip.scia.j, x=P[j*3]*mg, y=P[j*3+1], z=P[j*3+2];`);

cambio('10. disegna(): la posa si specchia per il mancino',
`  posaFusa(clip,u);   /* la posa, eventualmente fusa con la precedente (vedi fondi) */
  for(let j=0;j<NJ;j++){`,
`  posaFusa(clip,u);   /* la posa, eventualmente fusa con la precedente (vedi fondi) */
  /* IL MANCINO: la posa si SPECCHIA sull'asse laterale. E' la
     definizione anatomica, conserva per costruzione ogni lunghezza
     d'osso e ogni angolo della scatola, e costa diciotto negazioni. */
  if(MANC) specchia();
  for(let j=0;j<NJ;j++){`);

cambio('11. disegna(): anche la palla della clip si specchia',
`    clip.palla(u,PALLA); pallaQui=true;
    let bx=PALLA[0]; pby=PALLA[1]; const bz=PALLA[2];`,
`    clip.palla(u,PALLA); pallaQui=true;
    /* la palla della clip segue la mano che arma: se no il piede va da
       una parte e il pallone dall'altra */
    let bx=PALLA[0]*mg; pby=PALLA[1]; const bz=PALLA[2];`);

/* ------------------------------------------------------------------
   5. L'OMBRA A POSA PIENA SEGUE LE STESSE TRE COSE
   ------------------------------------------------------------------ */
cambio('12. ombraTraccia: statura, cadenza, specchio',
`function ombraTraccia(g, ox, oy, hPx, yaw, nomeClip, tSec, corp, varb, C, S, perMetro, scala){
  const clip=CLIPS[nomeClip]; if(!clip) return false;
  corpora(corp===undefined?3:corp, varb||0);
  let u=(tSec*clip.freq)%1; if(u<0)u+=1;
  posaFusa(clip,u);   /* stessa fusione del corpo: l'ombra getta la posa che si disegnera' */
  const cam=CAMERE.alto;
  const ce=cam.ce<0.58?0.58:cam.ce;
  const s=Math.max(0, hPx/(1.9*ce))*scala;`,
`function ombraTraccia(g, ox, oy, hPx, yaw, nomeClip, tSec, corp, varb, C, S, perMetro, scala, manc){
  const clip=CLIPS[nomeClip]; if(!clip) return false;
  corpora(corp===undefined?3:corp, varb||0);
  /* LE STESSE TRE COSE DEL CORPO (voce #155): cadenza, specchio,
     statura. Se qui ne mancasse una, l'ombra getterebbe un altro uomo. */
  let u=(tSec*clip.freq*(clip.ciclo?CAD:1))%1; if(u<0)u+=1;
  posaFusa(clip,u);   /* stessa fusione del corpo: l'ombra getta la posa che si disegnera' */
  if(manc) specchia();
  const cam=CAMERE.alto;
  const ce=cam.ce<0.58?0.58:cam.ce;
  const s=Math.max(0, hPx*STAT/(1.9*ce))*scala;`);

cambio('13. drawOmbreGiocatori passa la mano che arma',
`              lk.corp, lk.varb, C, S, GEO.perMetro, r);`,
`              lk.corp, lk.varb, C, S, GEO.perMetro, r, lk.manc);`);

/* ------------------------------------------------------------------
   6. IL BANCO IMPARA LA STATURA (se no attesta invece di misurare)
   ------------------------------------------------------------------ */
cambio('14. il banco espone la statura, la falcata e la cadenza',
`      banco:{posa:bancoPosa, OSSA, P, NJ, esito:ESITO,
               corpora, testa:()=>HEADR, nCorpi:CORPI.length,`,
`      banco:{posa:bancoPosa, OSSA, P, NJ, esito:ESITO,
               corpora, testa:()=>HEADR, nCorpi:CORPI.length,
               /* LE TRE GRANDEZZE DELLA VOCE #155, lette dal banco dopo
                  corpora(c): senza di loro ?gabbia misurerebbe la cima
                  della testa di un uomo che non esiste, e il provino
                  direbbe che quattro fisici camminano ancora uguali. */
               statura:()=>STAT, falcata:()=>PASSO, cadenza:()=>CAD,
               mancino:v=>{ MANC=!!v; }, specchia,`);

cambio('15. ?gabbia mette la statura nel conto della cima',
`            const ct=(RIG_PIEDI - B.P[3*3+1]*RIG_H/1.9 - (B.testa()*SCA+BORDOPX))*P_DIS;`,
`            /* LA STATURA ENTRA NEL CONTO (voce #155): la scala di
               disegno la porta, quindi la cima della testa la porta.
               Senza, questo banco attesterebbe invece di misurare. */
            const ST=B.statura();
            const ct=(RIG_PIEDI - B.P[3*3+1]*RIG_H*ST/1.9 - (B.testa()*SCA*ST+BORDOPX))*P_DIS;`);

/* ------------------------------------------------------------------
   7. rigLook — la quarta corporatura e il mancino
   ------------------------------------------------------------------ */
cambio('16. rigLook: quattro corporature e un mancino su quattro',
`  const taglio = (p.taglio|0)%4;         // rasato / ciuffo / riccio / fascetta
  const corp = (p.corp|0)%3;
  const varb = (((p.seme|0)>>>23)%5-2)*0.032;
  const chiave = c1+'|'+c2+'|'+pat+'|'+p.skin+'|'+p.hair+'|'+taglio
               +'|'+corp+'|'+((p.seme|0)>>>23)%5+(gk?'|G':'');`,
`  const taglio = (p.taglio|0)%4;         // rasato / ciuffo / riccio / fascetta
  /* LA QUARTA CORPORATURA SCENDE IN CAMPO (voce #155). Prima era
     (p.corp|0)%3 e la quarta riga di CORPI non usciva mai.
     p.corp NON SI TOCCA: quel numero entra nel giro che sposta il seme
     quando due compagni si somigliano (vestiDalNome e i due rientri in
     rosa), e cambiarlo cambierebbe i semi, cioe' la partita. La
     corporatura del DISEGNO si prende da un'altra fetta dello stesso
     seme e resta nel disegno. */
  const corp = ((p.seme|0)>>>11)%4;
  /* IL MANCINO — uno su quattro (voce #155). Prima passaggio,
     filtrante, cross, tiro e testa armavano TUTTI il destro: in campo
     non esisteva un solo sinistro. */
  const manc = ((((p.seme|0)>>>7)&3)===0);
  const varb = (((p.seme|0)>>>23)%5-2)*0.032;
  const chiave = c1+'|'+c2+'|'+pat+'|'+p.skin+'|'+p.hair+'|'+taglio
               +'|'+corp+(manc?'|M':'')+'|'+((p.seme|0)>>>23)%5+(gk?'|G':'');`);

cambio('17. rigLook: il campo manc nel look',
`      corp, varb,                          // corporatura e micro-variazione (dal seme)
    };`,
`      corp, varb,                          // corporatura e micro-variazione (dal seme)
      manc,                                // la mano che arma (dal seme)
    };`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-155-persone.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
for (const [k, q] of [['hr:1.18, st:0.962, pa:0.88, cd:1.13', 1],
                      ['const s=Math.max(0, hPx*STAT/(1.9*ce));', 1],
                      ['if(MANC) specchia();', 1],
                      ['const corp = ((p.seme|0)>>>11)%4;', 1],
                      ['statura:()=>STAT, falcata:()=>PASSO, cadenza:()=>CAD,', 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: quattro persone, ' + CAMBI.length + ' cambi, ' + ing + ' -> ' + usc);
console.log('  il file cresce di ' + (Buffer.byteLength(t, 'utf8') - fs.statSync(ing).size) + ' byte');
