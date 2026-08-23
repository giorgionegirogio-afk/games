/* =====================================================================
   _t-aereo.js — IL COLPO DI TESTA: il pallone alto smette di passare e
   basta (voce 7 del censimento, 23 agosto 2026).

   IL FATTO, dal censimento e dal cancello: sopra Z_SOPRA_TESTA = 26 il
   solo codice che tocca il pallone sono le sponde e i pali — «zero
   occorrenze di colpo di testa in tutto il file», per costruzione. Ed
   e' appena diventato un difetto VERO: la CPU crossa davvero (onda dei
   cross), il dito crossa con destinatario (L1.6), e quei palloni alti
   nessuno li puo' giocare prima che cadano.

   LA CURA, quattro mosse e nessun sorteggio:
     1. Z_TESTA_MAX = 46: fin dove arriva la testa di un corpo IN PIEDI.
        Sta sotto il tetto del cancello (Q_TETTO 50) e sotto l'apice dei
        palloni dichiarati irraggiungibili (87): il banco C resta pulito.
     2. IL CONTATTO, in updateBall a pallone libero: primo corpo di
        movimento in piedi (non steso, non in rialzata, non in
        rovesciata, non espulso, non freddo di kickCd) col pallone nella
        finestra [26, 46] e a portata di corpo (P_R+B_R+3). DETERMINISTA:
        niente Math.random — i banchi a seme fisso non si sfasano.
     3. IL VERBO: in zona di tiro e' l'INCORNATA verso lo specchio
        (conta come tiro, arriva con la legge dei tiri); fuori zona e'
        la SPIZZATA in avanti, via dalla propria porta, che prosegue il
        volo basso e giocabile.
     4. LA SCIVOLATA IMPARA LA QUOTA: la spazzata su palla libera
        chiedeva solo la distanza in pianta — uno steso a terra spazzava
        un pallone che gli volava sopra la testa. Il cancello (banchi B
        e D) pretende zero: adesso la quota si chiede.

   Cancello: strumenti/_q-aereo.js (gia' scritto, coi suoi controlli
   negativi; sul gioco di oggi A e D sono impossibili per costruzione).

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

const ANCORE = [

/* 1 — la quota della testa */
{
  nome: '1/4 Z_TESTA_MAX: fin dove arriva un corpo in piedi',
  cerca: "const Z_SOPRA_PORTIERE = 34;       // oltre questa quota il portiere non ci arriva: e' il pallonetto",
  metti: "const Z_SOPRA_PORTIERE = 34;       // oltre questa quota il portiere non ci arriva: e' il pallonetto\n" +
         "const Z_TESTA_MAX = 46;            // fin qui un corpo IN PIEDI gioca il pallone di testa (voce 7)",
},

/* 2 — il verbo, definito accanto al pallone */
{
  nome: '2/4 colpoDiTesta: incornata in zona, spizzata fuori',
  cerca: `/* ---------- pallone ---------- */
function updateBall(dt){`,
  metti: `/* =====================================================================
   IL COLPO DI TESTA (voce 7). Nessun sorteggio: chi c'e' c'e', e il
   verbo lo decide la zona — e' la stessa domanda del tiro (zonaTiro),
   quindi non possono divergere. L'incornata CONTA nel tabellino dei
   tiri e porta l'etichetta del tiro in volo (b.tiroT): il portiere la
   para come ogni tiro. La spizzata prosegue il volo in avanti, bassa e
   giocabile, via dalla propria porta.
   ===================================================================== */
function colpoDiTesta(q, qi, b){
  const t=q.team, gx=t===0?FW:0;
  const inZona=zonaTiro(q.x, q.y, gx);
  let nx, ny, v;
  if(inZona){
    const gy=FH/2 + (q.y<FH/2?1:-1)*(GOAL_H/2-30);
    const dx=gx-q.x, dy=gy-q.y, l=Math.max(1,len(dx,dy));
    nx=dx/l; ny=dy/l;
    v=Math.min(TIRO_TETTO*0.8, Math.max(330, 240 + TIRO_ATTR*l));
    G.stats.tiri[t]++;
  }else{
    const dx=gx-q.x, dy=(FH/2-q.y)*0.4, l=Math.max(1,len(dx,dy));
    nx=dx/l; ny=dy/l;
    v=Math.max(300, len(b.vx,b.vy)*0.8);
  }
  b.owner=-1; b.passTo=-1; b.crossTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=false;
  b.vx=nx*v; b.vy=ny*v;
  b.vz=40;                               // riparte basso ma vivo
  b.tiroT = inZona ? t : -1;
  segnaTocco(qi);
  q.kickCd=0.5; q.kickT=0.2; q.kickB=0.24;
  q.fx=nx; q.fy=ny;
  Audio5.kick(0.5);
}

/* ---------- pallone ---------- */
function updateBall(dt){`,
},

/* 3 — il contatto, nel volo libero */
{
  nome: '3/4 updateBall: il pallone alto trova una testa',
  cerca: `  /* effetto a giro del tiro perfetto */
  if(b.perfectT>0){`,
  metti: `  /* IL PALLONE ALTO TROVA UNA TESTA (voce 7): finestra [26, 46],
     portata del corpo, primo che c'e'. Gli stesi, i freddi e i portieri
     no — il portiere ha gia' il suo mestiere sotto quota 34
     (tentaPresa), e dargli anche la testa farebbe due mestieri in un
     fotogramma. Nessun sorteggio: il banco a seme fisso non si sfasa. */
  if(b.owner<0 && b.z>Z_SOPRA_TESTA && b.z<=Z_TESTA_MAX){
    for(let qi=0;qi<G.players.length;qi++){
      const q=G.players[qi];
      if(q.out>0 || q.slide>=0 || q.recover>0 || q.rove>=0 || q.role==='gk') continue;
      if(q.kickCd>0) continue;
      /* CHI E' CHIAMATO SUL CROSS ALLUNGA IL COLLO: la portata del
         destinatario e' un passo (34), quella di chiunque altro e' il
         corpo (24). E' l'attacco al pallone, non una calamita: vale
         solo dentro la finestra di quota, e solo per l'uomo scritto
         sul pallone. */
      const portata = (b.crossTo===qi) ? 34 : (P_R+B_R+3);
      if(len(q.x-b.x,q.y-b.y)>portata) continue;
      colpoDiTesta(q, qi, b);
      break;
    }
  }
  /* effetto a giro del tiro perfetto */
  if(b.perfectT>0){`,
},

/* 5 — dove il pallone scende a quota di testa */
{
  nome: '5/6 puntoTesta: il punto d\'incontro a quota 34',
  cerca: `function doCross(p,nx,ny,mira,dest){`,
  metti: `/* DOVE IL PALLONE SCENDE A QUOTA DI TESTA (34): e' il punto in cui un
   corpo fermo lo INCONTRA con la fronte invece di aspettarlo coi piedi.
   La strada in volo e' v*t senza attrito (L2.2a: l'attrito e' dell'erba,
   non dell'aria). Se il pallone e' gia' sotto quota e scende, il punto
   e' qui e ora. Torna [x, y, t]. */
function puntoTesta(b){
  const H=34;
  if(b.z<=H && b.vz<=0) return [b.x, b.y, 0];
  const disc=b.vz*b.vz+1120*Math.max(0,b.z-H);
  const t=Math.max(0,(b.vz+Math.sqrt(Math.max(0,disc)))/560);
  return [ clamp(b.x+b.vx*t, 8, FW-8), clamp(b.y+b.vy*t, 8, FH-8), t ];
}
function doCross(p,nx,ny,mira,dest){`,
},

/* 6 — il chiamato del cross attacca il pallone, non l'erba */
{
  nome: '6/6 aiDecide: chi aspetta il cross va all\'incontro di testa',
  cerca: `  if(b.owner<0 && b.z>0 && b.crossTo===G.players.indexOf(p)){
    const c=puntoCaduta(b);`,
  metti: `  if(b.owner<0 && b.z>0 && b.crossTo===G.players.indexOf(p)){
    /* VOCE 7 (23 ago 2026): il punto giusto non e' dove il pallone
       TOCCA TERRA — e' dove SCENDE A QUOTA DI TESTA. Aspettando la
       caduta, il pallone attraversava la finestra della testa a
       cinquanta unita' dal ricevente e nessun cross si giocava per
       aria (6,3% al banco A contro il 30% chiesto). */
    const c=puntoTesta(b);`,
},

/* 4 — la scivolata impara la quota */
{
  nome: '4/4 checkSlideContact: la spazzata chiede anche la quota',
  cerca: `  /* palla libera: la scivolata la spazza */
  if(!carrier && d<KICK_R && p.kickCd<=0){`,
  metti: `  /* palla libera: la scivolata la spazza — SE E' A TERRA (voce 7).
     Prima chiedeva solo la distanza in pianta, e uno steso spazzava un
     pallone che gli volava sopra la testa: il cancello aereo (banchi B
     e D) pretende zero, ed e' la fisica a pretenderlo prima di lui. */
  if(!carrier && d<KICK_R && p.kickCd<=0 && b.z<=Z_SOPRA_TESTA){`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-aereo.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.aereo.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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
  ['function colpoDiTesta(', 1],
  ['function puntoTesta(', 1],
  ['puntoTesta(b)', 2],                 // definizione e la chiamata del chiamato
  ['colpoDiTesta(q, qi, b)', 2],        // definizione piu' la chiamata
  ['Z_TESTA_MAX', 2],                   // la costante e la guardia del contatto
  ['b.z<=Z_SOPRA_TESTA)', 2],           // una c'era gia' nel gioco, l'altra e' la guardia della spazzata
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
