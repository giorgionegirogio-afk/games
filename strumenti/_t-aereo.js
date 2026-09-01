/* =====================================================================
   _t-aereo.js — IL GIOCO AEREO DELLA MACCHINA, stadi A e B
   (1 settembre 2026, voce di lavoro #72; progetto in
   _analisi/PROGETTO-GIOCO-AEREO.md, misure del 31 agosto).

   LA DIAGNOSI RETTIFICATA (sonda alle porte, §1.4 del progetto): a 7 e
   a 11 la finestra di distanza non viene MAI interrogata — su 3.483
   fotogrammi esaminati non c'e' UN compagno dentro l'area al tempo di
   volo. Il collo e' l'OCCUPAZIONE DELL'AREA (89-100% delle bocciature),
   e attaccaArea e' spenta da taglia 7 per una bocciatura che colpiva
   l'elezione del piu' avanzato. Il collasso della finestra (dal 22% del
   campo a 5 al 5% a 11, per due costanti assolute contro un attrito che
   scala) e' vero e si cura insieme.

   LA CURA, confermata dalla miniera (MINIERA-FCM.md §5: la corsa in area
   del concorrente e' un INCARICO designato separato dal rifinitore; il
   cross corto e' un TIPO a volo basso, non un errore):
   - STADIO A: il taglio in area a 7/11 lo fa la SOLA PUNTA — l'uomo gia'
     davanti, che non fa manovra per definizione.
   - STADIO B: il volo si calcola PER BERSAGLIO (crossVolo, lo stesso
     clamp di doCross all'inverso, 3 giri fissi); il pavimento della
     finestra diventa GOAL_H (un cross sotto la luce della porta e' un
     appoggio) e il dMin artificiale muore; i cancelli del portiere e
     del varco ricevono il T vero.
   - STADIO C (dMax in scala col campo) NON e' qui: si apre solo se il
     banco, dopo A+B, nomina dMax come porta che boccia a 11.

   LEGGE DEI SORTEGGI (§4 del progetto, dichiarato): nessuna funzione
   toccata pesca sorteggi, ma l'ESITO cambia — quando la punta taglia,
   aiDecide salta lo smarcamento col suo rnd(-30,30); quando un cross
   parte dove prima non partiva, i dadi del tiro/passaggio a valle non
   si consumano. Le partite a seme fisso DIVERGONO per progetto: i
   confronti appaiati al bit attraverso questa toppa non valgono, si
   confronta a distribuzioni (_eventi --contro).

   ACCETTAZIONE (§5): _q-cross.js IDENTICO (doCross non si tocca);
   _g-aereo.js verso 2-6 cross/partita alle tre taglie; _q-aereo verde;
   _q-cross2 non peggiora raccolti/partiti; _eventi --contro nelle
   forbici (tiri ±2, gol ±0,4, 0-0 letto nel verso); equita' ripassa;
   seme/determinismo verdi; prestazione --contro HEAD.

   uso:  node strumenti/_t-aereo.js --out fuori/aereo.html
         node strumenti/_t-aereo.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/aereo.html'));

const ANCORE = [

/* 1 — STADIO A: la guardia della punta, e la lapide si rettifica */
{
  nome: '1/8 attaccaArea: il taglio lo fa la punta (stadio A)',
  cerca:
`     Percio' la corsa in area vive dove il gioco non ha gia' un uomo
     davanti, e in nessun altro posto. Il cross a 7 e a 11 resta una cosa
     NON FATTA, ed e' scritto cosi' nel rapporto invece di essere spedito
     con un numero che dice il contrario di quello che promette.
     ===================================================================== */
  if(TAGLIA>=7) return false;`,
  metti:
`     Percio' la corsa in area vive dove il gioco non ha gia' un uomo
     davanti, e in nessun altro posto. Il cross a 7 e a 11 resta una cosa
     NON FATTA, ed e' scritto cosi' nel rapporto invece di essere spedito
     con un numero che dice il contrario di quello che promette.

     RETTIFICA (1 settembre 2026, voce #72): la bocciatura misurata qui
     sopra colpiva l'ELEZIONE DEL PIU' AVANZATO, che rubava il rifinitore
     alla manovra — quei numeri restano veri per quella versione. La
     sonda alle porte del 31 agosto (PROGETTO-GIOCO-AEREO §1.4) ha dato
     il collo un nome: a 7 e a 11 non c'e' MAI un compagno in area al
     tempo di volo (0 su 3.483 fotogrammi esaminati). Da oggi il taglio
     lo fa la SOLA PUNTA — l'uomo che il gioco tiene gia' davanti
     (stazione PUNTA_X, «NON RIENTRA»), che non fa manovra per
     definizione e il cui prezzo sul punteggio del passaggio e' gia'
     pagato (sopra 0,74 non la sceglie comunque). Non e' un secondo uomo
     fisso davanti: e' quello che c'era, che adesso entra. A 5 la punta
     non esiste e la guardia non morde: le stesse righe di oggi, al bit.
     ===================================================================== */
  if(TAGLIA>=7 && ruoloDi(p)!=='punta') return false;`,
},

/* 2 — STADIO B: la finestra perde il pavimento artificiale, nasce crossVolo */
{
  nome: '2/8 crossFinestra senza dMin + crossVolo',
  cerca:
`/* =====================================================================
   LA FINESTRA DI DISTANZA DEL CROSS, tutta dedotta (vedi l'intestazione).
   Nessuno di questi numeri e' scelto: escono da TIRO_ATTR, cioe' dalla
   taglia del campo, e da due soglie che il gioco gia' dichiara.
   ===================================================================== */
const CROSS_ZONA  = 0.48;    // il portatore: dentro l'ultimo 48% del campo
const CROSS_TVOLO = 0.75;    // il volo, sempre il piu' lungo che doCross sappia
const CROSS_RACC  = 420;     // sopra questa velocita' d'arrivo nessuno la ferma
function crossFinestra(){
  const K = Math.max(0.001, TIRO_ATTR);
  const e = Math.exp(-CROSS_TVOLO*K);
  const c = (1-e)/(CROSS_TVOLO*K);          // strada vera / distanza mirata
  return { K, c, dMin: 430*CROSS_TVOLO*c, dMax: CROSS_RACC*(1-e)/(K*e) };
}`,
  metti:
`/* =====================================================================
   LA FINESTRA DI DISTANZA DEL CROSS, tutta dedotta (vedi l'intestazione).
   Nessuno di questi numeri e' scelto: escono da TIRO_ATTR, cioe' dalla
   taglia del campo, e da due soglie che il gioco gia' dichiara.

   RISCRITTA il 1 settembre 2026 (voce #72): il pavimento dMin era un
   ARTEFATTO dell'assunzione «il volo, sempre il piu' lungo» — esisteva
   solo per garantire T=0,75, e sui campi grandi chiudeva la finestra
   col dMax fino al 5% del campo a 11 (PROGETTO-GIOCO-AEREO §1.3).
   Sotto quel pavimento doCross vola benissimo, a T piu' corto: adesso
   il volo si calcola PER BERSAGLIO (crossVolo, qui sotto) e il
   pavimento vero e' GOAL_H in crossBersaglio — un cross piu' corto
   della luce della porta e' un appoggio, e l'appoggio esiste gia'.
   Resta il dMax, che vive nel regime T=0,75 dove questa formula e'
   esatta.
   ===================================================================== */
const CROSS_ZONA  = 0.48;    // il portatore: dentro l'ultimo 48% del campo
const CROSS_TVOLO = 0.75;    // il TETTO del volo; il volo vero, per bersaglio, lo da' crossVolo
const CROSS_RACC  = 420;     // sopra questa velocita' d'arrivo nessuno la ferma
function crossFinestra(){
  const K = Math.max(0.001, TIRO_ATTR);
  const e = Math.exp(-CROSS_TVOLO*K);
  const c = (1-e)/(CROSS_TVOLO*K);          // strada vera / distanza mirata
  return { K, c, dMax: CROSS_RACC*(1-e)/(K*e) };
}
/* IL VOLO SU MISURA: il volo di un cross che deve ATTERRARE a distanza
   d — lo stesso conto di doCross, all'inverso, con LO STESSO clamp.
   Tre giri fissi bastano: c varia al massimo del 4,23% su tutta la
   corsa di T (misurato il 31 agosto sulle costanti del file: 4,23% a
   taglia 5, 3,13% a 7, 2,24% a 11). Proprieta' da banco: per ogni d
   sopra il vecchio dMin converge al primo giro a T=0,75 e dA=d/c —
   identico al conto di prima, al bit. Nessun sorteggio, nessuna
   scrittura. */
function crossVolo(d){
  const K = Math.max(0.001, TIRO_ATTR);
  let T = L14_T1, dA = d;
  for(let i=0;i<3;i++){
    const c = (1-Math.exp(-K*T))/(K*T);
    dA = d/c;
    T = clamp(dA/430, L14_T0, L14_T1);
  }
  return { T, dA, arrivo: (dA/T)*Math.exp(-K*T) };
}`,
},

/* 3 — il portiere riceve il T vero: firma */
{
  nome: '3/8 crossPortiereCopre: quarto argomento T',
  cerca:
`function crossPortiereCopre(team, lx, ly){`,
  metti:
`function crossPortiereCopre(team, lx, ly, T){
  T=T||CROSS_TVOLO;`,
},

/* 4 — il portiere riceve il T vero: la corsa */
{
  nome: '4/8 crossPortiereCopre: la corsa su T',
  cerca:
`  /* dove sara' fra CROSS_TVOLO: verso la sua meta, al suo passo */
  let px=tx-gk.x, py=ty-gk.y;
  const pl=len(px,py), corsa=GK_SPEED*CROSS_TVOLO;`,
  metti:
`  /* dove sara' fra T — il volo vero di QUESTO cross (voce #72): verso
     la sua meta, al suo passo. Su un cross corto il portiere ha meno
     tempo, e il cancello lo dice. */
  let px=tx-gk.x, py=ty-gk.y;
  const pl=len(px,py), corsa=GK_SPEED*T;`,
},

/* 5 — il varco riceve il T vero */
{
  nome: '5/8 crossVarcoLibero: quinto argomento T',
  cerca:
`function crossVarcoLibero(p, nx, ny, dA){
  const K=Math.max(0.001, TIRO_ATTR);
  const t0=(CROSS_TVOLO-Math.sqrt(Math.max(0,CROSS_TVOLO*CROSS_TVOLO-4*Z_SOPRA_TESTA/280)))/2;
  const varco=(dA/CROSS_TVOLO)*(1-Math.exp(-K*t0))/K;`,
  metti:
`function crossVarcoLibero(p, nx, ny, dA, T){
  /* voce #72: il tratto basso dipende dal volo VERO. Su un cross corto
     il pallone sale prima (vz=280*T con lo stesso conto di doCross),
     quindi il varco richiesto e' piu' corto: il cancello resta fedele
     alla fisica che protegge. */
  T=T||CROSS_TVOLO;
  const K=Math.max(0.001, TIRO_ATTR);
  const t0=(T-Math.sqrt(Math.max(0,T*T-4*Z_SOPRA_TESTA/280)))/2;
  const varco=(dA/T)*(1-Math.exp(-K*t0))/K;`,
},

/* 6 — il destinatario: pavimento GOAL_H, volo per candidato, T ai cancelli */
{
  nome: '6/8 crossBersaglio a volo variabile (stadio B)',
  cerca:
`   Fra quelli che tengono vince il piu' vicino alla porta.
   ===================================================================== */
function crossBersaglio(p, opGoalX){
  const t=p.team;
  const F=crossFinestra();
  let scelto=null, meglio=1e9;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    const qx=q.x+q.vx*CROSS_TVOLO, qy=q.y+q.vy*CROSS_TVOLO;
    if(!dentroArea(t, qx, qy)) continue;
    const d=len(qx-p.x, qy-p.y);
    if(d<F.dMin || d>F.dMax) continue;
    if(crossPortiereCopre(t, qx, qy)) continue;
    const nx=(qx-p.x)/d, ny=(qy-p.y)/d;
    const dA=d/F.c;                       // si mira a d/c perche' cada a d
    if(!crossVarcoLibero(p, nx, ny, dA)) continue;
    const dg=Math.abs(opGoalX-qx);
    if(dg<meglio){ meglio=dg; scelto={ q, nx, ny, mira:[p.x+nx*dA, p.y+ny*dA] }; }
  }
  return scelto;
}`,
  metti:
`   Fra quelli che tengono vince il piu' vicino alla porta.

   RETTIFICA (1 settembre 2026, voce #72): i numeri qui sopra (124
   partiti, 97 in area, 74 raccolti, 69 conclusi, 22 in rete) sono
   della versione col pavimento dMin e restano veri per lei. Da oggi il
   pavimento e' GOAL_H — la stessa soglia di fascia di crossCPU, che
   scala gia' col campo — e il volo si calcola PER CANDIDATO con
   crossVolo: il cross corto e' un volo piu' basso da calcolare, non un
   errore da bocciare. Sui bersagli che passavano gia', la mira e'
   identica al bit (crossVolo converge a T=0,75); cambiano i bersagli
   NUOVI sotto il vecchio pavimento, e la SCELTA quando uno di loro e'
   piu' vicino alla porta: e' la cura, non un effetto collaterale. La
   riproiezione del compagno al T corto puo' spostarlo di ~20 unita'
   contro una portata di raccolta di 34: dichiarato, e _q-cross2 lo
   sorveglia (raccolti/partiti non deve scendere).
   ===================================================================== */
function crossBersaglio(p, opGoalX){
  const t=p.team;
  const F=crossFinestra();
  let scelto=null, meglio=1e9;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    let T=CROSS_TVOLO;
    let qx=q.x+q.vx*T, qy=q.y+q.vy*T;
    let d=len(qx-p.x, qy-p.y);
    if(d<GOAL_H || d>F.dMax) continue;
    const volo=crossVolo(d);              // il T vero di QUESTO cross
    if(volo.T<CROSS_TVOLO){
      /* cross corto: il compagno si riproietta col T vero, e il
         candidato si rigiudica sul quadro vero */
      T=volo.T;
      qx=q.x+q.vx*T; qy=q.y+q.vy*T;
      d=len(qx-p.x, qy-p.y);
      if(d<GOAL_H) continue;
    }
    if(!dentroArea(t, qx, qy)) continue;
    if(crossPortiereCopre(t, qx, qy, T)) continue;
    const nx=(qx-p.x)/d, ny=(qy-p.y)/d;
    if(!crossVarcoLibero(p, nx, ny, volo.dA, T)) continue;
    const dg=Math.abs(opGoalX-qx);
    if(dg<meglio){ meglio=dg; scelto={ q, nx, ny, mira:[p.x+nx*volo.dA, p.y+ny*volo.dA] }; }
  }
  return scelto;
}`,
},

/* 7 — il commento di L14_T1 smette di promettere un T unico */
{
  nome: '7/8 la rettifica nel commento di L14_T1',
  cerca:
`const L14_T1 = 0.75;     // s di volo a quota piena   -> quota VERA 37,6. NON SI ALZA: CROSS_TVOLO (:18930) vale 0,75 e su di lei poggiano la finestra del cross CPU, il conto sul portiere e la posizione del compagno all'atterraggio`,
  metti:
`const L14_T1 = 0.75;     // s di volo a quota piena   -> quota VERA 37,6. NON SI ALZA: CROSS_TVOLO vale 0,75 ed e' il TETTO del volo del cross CPU; dal 1 settembre 2026 (voce #72) il volo vero per bersaglio lo calcola crossVolo con QUESTO stesso clamp, e portiere e compagno usano quel T`,
},

/* 8 — il verbale dell'appoggio: i suoi numeri portano la data */
{
  nome: '8/8 la data sui numeri del cambio-idea',
  cerca:
`     piu' di un secondo ad arrivare in area. Quando arriva, l'appoggio e'
     gia' partito come pensiero.`,
  metti:
`     piu' di un secondo ad arrivare in area. Quando arriva, l'appoggio e'
     gia' partito come pensiero. (Numeri della versione col pavimento
     dMin, 31 agosto; dal 1 settembre — voce #72 — la finestra e' piu'
     larga e le frequenze vanno rimisurate: la ragione della riga resta.)`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  ["if(TAGLIA>=7 && ruoloDi(p)!=='punta') return false;", 1],
  ['if(TAGLIA>=7) return false;', 0],
  ['function crossVolo(d){', 1],
  ['crossVolo(', 2],                                  // la definizione e la chiamata
  ['function crossPortiereCopre(team, lx, ly, T){', 1],
  ['function crossVarcoLibero(p, nx, ny, dA, T){', 1],
  ['T=T||CROSS_TVOLO;', 2],                           // portiere e varco
  ['GK_SPEED*T', 1],
  ['crossPortiereCopre(t, qx, qy, T)', 1],
  ['crossVarcoLibero(p, nx, ny, volo.dA, T)', 1],
  ['d<GOAL_H || d>F.dMax', 1],
  ['dMin: 430*CROSS_TVOLO*c', 0],                     // il codice del pavimento e' morto
  ['F.dMin', 0],
  ['voce #72', 7],
  // doCross e la guida del dito non si toccano
  ['const T=clamp(dist/430, L14_T0, L14_T1);', 2],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
