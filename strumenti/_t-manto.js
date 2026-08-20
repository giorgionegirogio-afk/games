/* =====================================================================
   _t-manto.js — L'ATLANTE DI GIOCO: il manto arriva all'occhio alla
   densita' a cui e' stato dipinto.

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce QUATTRO ancoraggi ESATTI e scrive la copia in --out. Senza
   --out scrive accanto all'originale un file col suffisso .manto.html:
   mai sull'originale, se non con --dentro. Se anche un solo ancoraggio
   non compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e
   non scrive niente.

   uso:
     node strumenti/_t-manto.js --out fuori/manto.html
     node strumenti/_t-manto.js --in altro.html --out x.html
     node strumenti/_t-manto.js --elenco

   ---------------------------------------------------------------------
   IL DIFETTO (COSA-MANCA.md §2.4). fieldTex e' cotta allo zoom di RIPOSO
   (fieldTexTS = SCALE*DPR: 1,41 / 1,01 / 0,71 alle tre taglie sul banco)
   e la camera di GIOCO ne chiede 2,0-3,1 px per unita': il manto — la
   superficie che riempie l'80-89% del quadro — viene ingrandito 1,67x /
   2,26x / 3,22x (misurato alla posa standard) a interpolazione spenta.
   Il dettaglio pagato in 1.969 righe di paintField vive a 2-3 pixel.

   LE STRADE PROVATE E SCARTATE, coi numeri:
   · ricuocere la finestra visibile in partita (campoVivoDisegna esteso):
     una ricottura finestrata vera costa 600-830 ms sul banco (misurata
     CON flush, 5 giri, mediana 645-815) e la politica simulata su tracce
     vere di camera ne chiede 0,6-1,2 al secondo: +5-16 ms per fotogramma
     di media. Morta, ed e' la stessa ragione per cui il gioco la tiene
     chiusa dentro if(gol).
   · cuocere fieldTex intera alla densita' di gioco: col fuoricampo
     (PADX fino a 1500) sono 12-38 Mpx = 47-145 MB a seconda della
     taglia; a 11 contro 11 non sta in nessun telefono.

   LA STRADA SCELTA: UNA SECONDA TESSITURA, SOLO IL MONDO DI GIOCO.
   In PARTITA l'inquadratura non esce mai piu' di OUT_MARG=62 unita'
   oltre le linee (il clamp di render), piu' qualche unita' di scossa:
   il fuoricampo largo serve al MENU, non al gioco. L'atlante copre
   campo±72 e costa 4,5 / 8,0 / 15,2 Mpx (17 / 30 / 58 MB) — la taglia
   grande resta possibile proprio perche' i 400-1100 unita' di PADX
   restano fuori.

   LA DENSITA': 1,14 px CSS per unita' (x DPR). La camera di gioco vive
   nel corridoio di leggibilita' [Z_MURO=1,01 .. Z_FIG40=1,30] e alla
   posa standard sta a S2 = 1,182 / 1,160 / 1,139 (misurato): a 1,14 il
   rapporto schermo/cotta alla posa e' 1,036 / 1,018 / 0,999, e allo
   zoom minimo di gioco (S2=1,0) e' 0,877 — dentro la banda del disegno
   senza filtro. Piu' fitta (es. allo zoom massimo 1,53) la posa e le
   inquadrature larghe diventerebbero RIMPICCIOLIMENTI forti: nearest
   li fa formicolare, il filtro bilineare costa 6,8 ms a fotogramma
   (misura storica scritta a :23604). 1,14 e' il punto in cui quasi
   tutta la partita sta fra 0,88 e 1,35.

   QUANDO SI CUOCE: UNA volta, dentro startMatch, DIETRO LA TENDA del
   passaggio (playWipe). Sul banco software costa 812 / 1371 / 2423 ms
   (misurato con flush); e' il posto giusto perche' e' fuori da ogni
   fotogramma di gioco e prestazione.js misura il regime, non l'avvio
   della partita. NON si cuoce al resize (il primo resize e' l'avvio
   dell'app: il cancello dei 1424 ms non si tocca) ne' nel menu: solo
   nelle scene di partita, e in modo pigro se un resize a meta' partita
   l'ha invalidato.

   IL SEME. La cottura usa lo STESSO generatore a seme fisso di
   campoVivoDisegna (0x2f6e2b1): zero sorteggi rubati al caso della
   partita (ogni banco a semi fissi resterebbe sfasato), stessa erba a
   ogni ricottura, e — visto che paintField consuma la sequenza nello
   stesso ordine a prescindere dal ritaglio — le stesse schegge negli
   stessi punti del mondo che disegna il primo piano del gol: nessun
   fruscio d'erba quando le due sorgenti si scambiano.

   IL DISEGNO: nearest (interpolazione spenta) quando il rapporto
   schermo/cotta sta sopra 0,905 all'ingresso e 0,87 per restare
   (isteresi: senza, a S2=1,0 il rapporto 0,877 farebbe lampeggiare il
   ramo). Sotto, o quando l'inquadratura esce da campo±72 (menu, scosse
   violente), si torna ESATTAMENTE al ramo di oggi: fieldTex con la
   regola del filtro che c'era. La scena del gol non cambia: campoVivo
   continua a ridipingere il primo piano alla scala vera, sopra una base
   che ora e' piu' fitta.

   I NUMERI DEL CANCELLO (strumenti/_q-manto.js, scritto prima e ROSSO
   sul gioco di oggi): rapporto densita' 1,672/2,256/3,222 -> soglia
   1,05; |dL| passo2/passo1 sul manto 1,343/1,422/1,288 -> soglia 1,10.
   Il costo a regime lo giudica prestazione.js --contro in misura
   appaiata alle tre taglie: i numeri stanno nella consegna.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — lo stato e le due funzioni dell'atlante, accanto a campoVivo */
{
  nome: "1/4 l'atlante di gioco: stato, cottura e disegno, accanto a campoVivo",
  cerca:
`/* anteprima di un campo (schermata CAMPI): stesso pennello, margine minimo */
function drawFieldPreview(cnv, fi){`,
  metti:
`/* ============================================================
   L'ATLANTE DI GIOCO (toppa manto). fieldTex e' cotta allo zoom di
   RIPOSO e la camera di gioco la ingrandisce 1,7-3,2 volte a filtro
   spento: il dettaglio di paintField vive a 2-3 pixel. Questa seconda
   tessitura copre SOLO il mondo che la partita puo' inquadrare
   (campo±72: il clamp di render ferma il pan a OUT_MARG=62 oltre le
   linee, il resto del fuoricampo serve al menu) a 1,14 px CSS per
   unita' — il centro del corridoio di leggibilita' della camera
   (Z_MURO 1,01 .. Z_FIG40 1,30; posa standard misurata a S2 1,14-1,18).
   Cosi' costa 4,5-15,2 Mpx invece dei 12-38 che costerebbe col
   fuoricampo, e a 11 contro 11 resta possibile.
   Si cuoce UNA volta per (campo, taglia, schermo), dentro startMatch
   dietro la tenda (sul banco software: 812/1371/2423 ms alle tre
   taglie, misurato con flush) — MAI al resize d'avvio (il cancello dei
   1424 ms) e mai nel menu. La ricottura viva a ogni panoramica e'
   stata misurata e scartata: 600-830 ms a ricottura per 0,6-1,2
   ricotture al secondo.
   IL SEME e' lo stesso di campoVivoDisegna (regola 3 di quel
   cappello): zero sorteggi rubati alla partita, stessa erba a ogni
   cottura, e le stesse schegge negli stessi punti del mondo che
   ridipinge il primo piano del gol. */
let fieldTexAlta=null, fieldTexAltaTS=0, fieldTexAltaKey='', mantoAltaSu=false;
let MANTO_COTTA_DIS=0;   /* densita' della tessitura DISEGNATA all'ultimo fotogramma: la legge _q-manto.js */
const MANTO_ALTA_M=72;   /* oltre le linee: OUT_MARG=62 piu' dieci unita' di scossa */
function mantoAltaChiave(){
  return clamp(G.fieldIdx|0,0,FIELDS.length-1)+'|'+TAGLIA+'|'+VW+'x'+VH+'@'+DPR;
}
function buildFieldTexAlta(){
  fieldTexAltaKey=mantoAltaChiave();
  fieldTexAlta=null; fieldTexAltaTS=0; mantoAltaSu=false;
  const TH=FIELDS[clamp(G.fieldIdx|0,0,FIELDS.length-1)].th;
  const M=MANTO_ALTA_M, w=FW+M*2, h=FH+M*2;
  /* 1,14 px CSS per unita': vedi il cappello. Il tetto di 16 Mpx e' la
     taglia 11 sul telefono (15,7 Mpx): oltre, su formati piu' grandi,
     si scende di densita' invece di esplodere di memoria. */
  let TS=1.14*DPR;
  if(w*h*TS*TS>16e6) TS=Math.sqrt(16e6/(w*h));
  /* se l'atlante non e' almeno il 10% piu' fitto della base (schermi
     molto grandi, dove SCALE e' gia' alto) non vale i suoi byte */
  if(!(fieldTexTS>0) || TS<=fieldTexTS*1.10) return;
  try{
    const cva=document.createElement('canvas');
    cva.width=Math.ceil(w*TS); cva.height=Math.ceil(h*TS);
    const c=cva.getContext('2d');
    if(!c) return;
    c.setTransform(TS,0,0,TS, M*TS, M*TS);
    c.beginPath(); c.rect(-M,-M,w,h); c.clip();
    /* il generatore a seme fisso di campoVivoDisegna, per le stesse tre
       ragioni scritte la' (regola 3): mai un numero rubato al caso della
       partita, e la stessa erba della base viva del gol */
    const mr=Math.random; let sm=0x2f6e2b1|0;
    Math.random=function(){ sm=(sm+0x6D2B79F5)|0; let t=Math.imul(sm^(sm>>>15),1|sm);
      t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
    try{ paintField(c, TH, PADX, PADY, 1, true); }
    finally{ Math.random=mr; }
    fieldTexAlta=cva; fieldTexAltaTS=TS;
  }catch(e){
    /* una tela da 58 MB puo' non allocarsi: si resta com'era, la chiave
       e' gia' scritta quindi non si riprova a ogni fotogramma */
    fieldTexAlta=null; fieldTexAltaTS=0;
  }
}
/* disegna l'atlante se la scala e l'inquadratura lo permettono; se no
   dice false e il chiamante usa il ramo di sempre. */
function mantoAltaDisegna(S2, offX, offY){
  if(fieldTexAltaKey!==mantoAltaChiave()){
    /* invalidato (resize a meta' partita, cambio campo): si ricuoce solo
       nelle scene di partita — nel menu il ramo base va gia' bene e il
       primo fotogramma dell'app non deve pagare la cottura */
    if(G.scene==='play'||G.scene==='kickoff'||G.scene==='golden') buildFieldTexAlta();
    else { mantoAltaSu=false; return false; }
  }
  if(!fieldTexAlta){ mantoAltaSu=false; return false; }
  const rap=S2*DPR/fieldTexAltaTS;
  /* isteresi 0,905/0,87: allo zoom minimo di gioco il rapporto vale
     0,877 e senza isteresi il ramo lampeggerebbe proprio li' */
  if(!(mantoAltaSu ? rap>=0.87 : rap>=0.905)){ mantoAltaSu=false; return false; }
  /* l'inquadratura deve stare TUTTA dentro campo±M: fuori (menu, fine
     partita affacciata sul quartiere, scossa violenta) c'e' solo il
     fuoricampo, che vive in fieldTex */
  const M=MANTO_ALTA_M;
  const vx0=-offX/S2, vy0=-offY/S2, vx1=vx0+VW/S2, vy1=vy0+VH/S2;
  if(vx0<-M || vy0<-M || vx1>FW+M || vy1>FH+M){ mantoAltaSu=false; return false; }
  mantoAltaSu=true;
  /* nearest: fra 0,87 e 1,05 il trasferimento e' quasi 1:1 e il filtro
     bilineare — misura storica a :23604 — costava 6,8 ms a fotogramma */
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(fieldTexAlta, -M,-M, FW+M*2, FH+M*2);
  ctx.imageSmoothingEnabled=true;
  MANTO_COTTA_DIS=fieldTexAltaTS;
  return true;
}
/* anteprima di un campo (schermata CAMPI): stesso pennello, margine minimo */
function drawFieldPreview(cnv, fi){`,
},

/* 2 — il ramo del disegno in render: prima l'atlante, poi il ripiego */
{
  nome: '2/4 render: prima l\'atlante di gioco, poi il ramo di sempre',
  cerca:
`  if(fieldTex){
    const liscio = fieldTexTS>0 && S2*DPR < fieldTexTS*0.995;
    if(!liscio) ctx.imageSmoothingEnabled=false;
    ctx.drawImage(fieldTex, -PADX,-PADY, FW+PADX*2, FH+PADY*2);
    if(!liscio) ctx.imageSmoothingEnabled=true;
  }`,
  metti:
`  if(fieldTex){
    /* PRIMA L'ATLANTE DI GIOCO (vedi il suo cappello sopra
       drawFieldPreview): in partita l'inquadratura chiede 2,0-3,1 px per
       unita' e fieldTex ne ha 0,7-1,4 — il manto arrivava ingrandito
       1,7-3,2 volte a filtro spento. L'atlante e' cotto a 1,14 px CSS
       per unita' e qui si trasferisce quasi 1:1, senza filtro. Quando
       non puo' (menu, inquadrature oltre campo±72, zoom sotto il 87%
       della cottura, tela non allocata) si passa al ramo di sempre,
       byte per byte quello di prima. */
    if(!mantoAltaDisegna(S2, Ax+sx, Ay+sy)){
      const liscio = fieldTexTS>0 && S2*DPR < fieldTexTS*0.995;
      if(!liscio) ctx.imageSmoothingEnabled=false;
      ctx.drawImage(fieldTex, -PADX,-PADY, FW+PADX*2, FH+PADY*2);
      if(!liscio) ctx.imageSmoothingEnabled=true;
      MANTO_COTTA_DIS=fieldTexTS;
    }
  }`,
},

/* 3 — la cottura a startMatch, dietro la tenda */
{
  nome: '3/4 startMatch: la cottura dietro la tenda',
  cerca:
`  setupPlayers(); resetKickoff();
  playWipe();`,
  metti:
`  setupPlayers(); resetKickoff();
  playWipe();
  /* L'ATLANTE DI GIOCO SI CUOCE QUI, DIETRO LA TENDA: una volta per
     (campo, taglia, schermo), fuori da ogni fotogramma di gioco. La
     chiave evita di ricuocere una rivincita sullo stesso campo. Il
     generatore e' a seme fisso dentro buildFieldTexAlta: questa riga
     non consuma UN sorteggio del caso della partita. */
  if(fieldTexAltaKey!==mantoAltaChiave()) buildFieldTexAlta();`,
},

/* 4 — la dichiarazione per il cancello */
{
  nome: '4/4 __test.manto: la densita' + " disegnata, dichiarata al cancello",
  cerca:
`  get view(){ return G.view; },`,
  metti:
`  get view(){ return G.view; },
  /* il manto com'e' arrivato all'occhio nell'ultimo fotogramma: densita'
     chiesta dallo schermo e densita' della tessitura DISEGNATA (atlante
     o base). La legge il numero (a) di _q-manto.js; il numero (b) dello
     stesso cancello verifica SUI PIXEL che questa riga non menta. */
  get manto(){ return { schermo:(G.view.S2||0)*DPR,
                        cotta:MANTO_COTTA_DIS||fieldTexTS,
                        alta:fieldTexAltaTS, base:fieldTexTS,
                        attiva:mantoAltaSu }; },`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-manto.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.manto.html';
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
/* controlli dopo la sostituzione: definizioni una volta sola, chiamate
   dove ci si aspetta */
const attesi = [
  ['function buildFieldTexAlta(', 1],
  ['function mantoAltaDisegna(', 1],
  ['function mantoAltaChiave(', 1],
  ['buildFieldTexAlta()', 3],          /* la definizione, la via pigra, startMatch */
  ['mantoAltaDisegna(S2', 2],          /* la definizione e la chiamata in render */
  ['MANTO_COTTA_DIS', 4],              /* let, atlante, ripiego, __test */
  ['imageSmoothingEnabled', 4],        /* i 2 di oggi (ripiego) piu' i 2 dell\'atlante */
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
