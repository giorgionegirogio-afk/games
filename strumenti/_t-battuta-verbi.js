/* =====================================================================
   _t-battuta-verbi.js — LA BATTUTA E' DEL POLLICE (voce #87, compito 3,
   ramo voce-87-rimesse-angoli).

   IL PERCHE'. I compiti 1-2 hanno dato al gioco la scena 'battuta', il
   piazzamento del battitore e la finestra viva a mondo intero (G.ctrl
   gia' punta il battitore, PASSA/CROSS gia' funzionano di fatto). Manca
   ancora: (a) TIRA spento sul battitore finche' non batte, (b) la clip
   dedicata quando batte (mani sopra la testa, non 'passaggio'/'cross'
   generici), (c) il rispetto — gli avversari non devono candidare il
   battitore come bersaglio da pressare durante la finestra.

   LA GUARDIA UNICA (voce #88, il modello e' puoContrastoPremuto
   :16250): inBattuta(p) nasce accanto a lei, primo livello, sotto i
   2.000 caratteri, e la leggono in DUE posti che non devono mai
   divergere — touchBtnLayout (la cella TIRA si spegne) e startCharge
   (l'atto rifiuta). Una terza lettura, su un portatore invece che sul
   giocatore comandato, serve al rispetto degli avversari in aiDecide.

   LE OTTO ANCORE:
     1. inBattuta(p) — funzione nuova, accanto a puoContrastoPremuto.
     2. touchBtnLayout — la cella shot guadagna off:inBattuta(...).
     3. startCharge — guardia in testa, rifiutoVerbo se in battuta.
     4. doPassaggio — chargeClip diventa 'rimessa' se inBattuta(p).
     5. doCrossUmano — idem.
     6. poseRimessa/pallaRimessa — la clip nuova, accanto a
        poseRinvio/pallaRinvio, stessi mattoni (corpo/braccio/gamba).
     7. la tavola CLIPS — la voce 'rimessa' accanto a 'rinvio'.
     8. aiDecide — il rispetto: durante la finestra nessun avversario
        candida il battitore come chaser (ne' dal ruolo di teamBrain,
        ne' dal ripiego per distanza subito sotto — un solo punto di
        veto, dopo che entrambe le vie hanno gia' scritto la loro
        proposta, cosi' nessuna delle due puo' sopravvivere alla
        guardia scrivendo dopo di lei).

   IL RISPETTO NON TOCCA teamBrain di proposito: se il compito guardasse
   solo l'assegnazione del ruolo 'pressa' in teamBrain, il ripiego per
   distanza di aiDecide (righe "if(!chaser){...}", che scatta appena il
   ruolo manca) lo aggirerebbe da solo, rieleggendo il piu' vicino alla
   palla a ogni fotogramma — la guardia dopo ENTRAMBE le vie e' l'unico
   punto che non si puo' aggirare, perche' e' l'ultimo a scrivere prima
   che chaser venga letto piu' sotto.

   uso:  node strumenti/_t-battuta-verbi.js --out fuori/battuta-verbi.html
         node strumenti/_t-battuta-verbi.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/battuta-verbi.html'));

const ANCORE = [

/* 1 — inBattuta(p), accanto a puoContrastoPremuto: la guardia unica,
   sotto i 2.000 caratteri, primo livello (_q-precedenza la estrae da
   sola dal grafo di chiamate di touchBtnLayout). */
{
  nome: '1/8 inBattuta(p): guardia nuova, accanto a puoContrastoPremuto',
  cerca:
`function puoContrastoPremuto(p){
  return !!(p && !(p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0));
}
`,
  metti:
`/* LA BATTUTA E' DEL BATTITORE SOLO (voce #87, compito 3): guardia
   unica, letta da due posti che non devono mai divergere -
   touchBtnLayout per la cella (TIRA si spegne) e startCharge per
   l'atto (rifiuta) - col pattern di puoContrastoPremuto qui sotto.
   Una terza lettura, su un portatore invece che sul giocatore
   comandato, serve al rispetto degli avversari in aiDecide. */
function inBattuta(p){
  return !!(G.battuta && G.players[G.battuta.battitore]===p);
}
function puoContrastoPremuto(p){
  return !!(p && !(p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0));
}
`,
},

/* 2 — touchBtnLayout: la cella shot guadagna off:inBattuta(...). Il
   meccanismo della cella spenta esiste gia' (preso.off blocca il
   tocco): questa e' la sola riga che manca. */
{
  nome: '2/8 touchBtnLayout: la cella shot guadagna off:inBattuta(...)',
  cerca:
`  return dentroGliInserti(pollicePosa([
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60,  r:40, off:grandeSpento },
`,
  metti:
`  return dentroGliInserti(pollicePosa([
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40, off:inBattuta(ctrlPlayer(t)) }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60,  r:40, off:grandeSpento },
`,
},

/* 3 — startCharge: la guardia in testa, prima di ogni altra cosa -
   copre la tastiera e ogni via non-touch (pattern L3.1, il rifiuto
   VISIBILE di rifiutoVerbo, non un no muto). p si legge una volta
   sola: la riga vecchia che lo dichiarava sotto sparisce. */
{
  nome: '3/8 startCharge: guardia inBattuta in testa, rifiutoVerbo',
  cerca:
`function startCharge(t){
  /* LA GUARDIA CHE C'ERA QUI ADESSO HA UN NOME, ed e' la stessa che
     legge l'etichetta del disco grande. Non e' una copia: e' questa,
     spostata. Percio' «il disco dice TIRA» e «startCharge apre
     qualcosa» sono la stessa proposizione, e non possono divergere. */
  if(!puoTirare(t)) return;
  const p=ctrlPlayer(t);
  const pi=G.players.indexOf(p);
`,
  metti:
`function startCharge(t){
  const p=ctrlPlayer(t);
  /* LA BATTUTA E' DEL POLLICE (voce #87, compito 3): TIRA e' spento
     sul battitore finche' non batte - stessa guardia inBattuta letta
     da touchBtnLayout per la cella, cosi' la cella e l'atto non
     divergono mai. Copre la tastiera e ogni via non-touch (pattern
     L3.1: il rifiuto VISIBILE, non un no muto). */
  if(inBattuta(p)){ rifiutoVerbo(t,p); return; }
  /* LA GUARDIA CHE C'ERA QUI ADESSO HA UN NOME, ed e' la stessa che
     legge l'etichetta del disco grande. Non e' una copia: e' questa,
     spostata. Percio' «il disco dice TIRA» e «startCharge apre
     qualcosa» sono la stessa proposizione, e non possono divergere. */
  if(!puoTirare(t)) return;
  const pi=G.players.indexOf(p);
`,
},

/* 4 — doPassaggio: in battuta il passaggio semplice E' la rimessa -
   stesso anticipo, stesso lancio, solo la clip cambia. */
{
  nome: '4/8 doPassaggio: chargeClip diventa rimessa se inBattuta(p)',
  cerca:
`function doPassaggio(t){
  if(!puoPassare(t)) return;
  const p=ctrlPlayer(t);
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);   // stava caricando il tiro: cambia idea
  if(anticipa(p, 'passo', PASS_CAR_U, eseguiPassUmano)) p.chargeClip='passaggio';
}
`,
  metti:
`function doPassaggio(t){
  if(!puoPassare(t)) return;
  const p=ctrlPlayer(t);
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);   // stava caricando il tiro: cambia idea
  /* IN BATTUTA IL PASSAGGIO E' UNA RIMESSA (voce #87, compito 3):
     stesso anticipo, stesso lancio - solo la clip cambia, per dire al
     pollice che quello che sta per partire e' il verbo di casa. */
  if(anticipa(p, 'passo', PASS_CAR_U, eseguiPassUmano)) p.chargeClip=inBattuta(p)?'rimessa':'passaggio';
}
`,
},

/* 5 — doCrossUmano: stesso principio del cross. */
{
  nome: '5/8 doCrossUmano: chargeClip diventa rimessa se inBattuta(p)',
  cerca:
`function doCrossUmano(t){
  if(!puoPassare(t)) return;
  const p=ctrlPlayer(t);
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);
  if(anticipa(p, 'passo', PASS_CAR_U, q=>{
    const pc=puntoCross(q);
    let dest, bd=1e9;
    for(let i=0;i<G.players.length;i++){
      const w=G.players[i];
      if(w.team!==q.team || w===q || w.out>0 || w.role==='gk') continue;
      const d=len(w.x-pc[0], w.y-pc[1]);
      if(d<bd){ bd=d; dest=i; }
    }
    doCross(q, 0, 0, null, dest);
  })) p.chargeClip='cross';
}
`,
  metti:
`function doCrossUmano(t){
  if(!puoPassare(t)) return;
  const p=ctrlPlayer(t);
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);
  if(anticipa(p, 'passo', PASS_CAR_U, q=>{
    const pc=puntoCross(q);
    let dest, bd=1e9;
    for(let i=0;i<G.players.length;i++){
      const w=G.players[i];
      if(w.team!==q.team || w===q || w.out>0 || w.role==='gk') continue;
      const d=len(w.x-pc[0], w.y-pc[1]);
      if(d<bd){ bd=d; dest=i; }
    }
    doCross(q, 0, 0, null, dest);
  /* IN BATTUTA IL CROSS E' UNA RIMESSA (voce #87, compito 3): stesso
     meccanismo, la clip dice al pollice che e' il verbo di casa. */
  })) p.chargeClip=inBattuta(p)?'rimessa':'cross';
}
`,
},

/* 6 — poseRimessa/pallaRimessa, accanto a poseRinvio/pallaRinvio,
   stessi mattoni (corpo/braccio/gamba). Corpo eretto, le due braccia
   SIMMETRICHE (aR=aL, il pattern di posePresa) salgono sopra la testa
   (fase 0-0,4), la frustata del busto le porta in avanti (lean da
   -0,10 a +0,25 sulla fase 0,4-0,6, il numero esatto del brief), poi
   rientro (0,6-1). Gambe FERME: angoli fissi +-0,12, nessuna
   animazione - chi rimette lo fa con le braccia, non con le gambe.
   La palla sale con le mani dietro la testa (o[1] 1,00->1,55, o[2]
   0,35->0,15 sulla fase 0-0,4, i numeri esatti del brief), la
   frustata la porta avanti restando alle mani, poi vola libera con
   una parabola vera come pallaRinvio. o[3] (lo squash della palla in
   disegnaPalla, non un letterale 1,0: sq=1 la appiattirebbe a quota
   zero) resta alla grandezza delle sorelle (0,30-0,45) finche' e'
   alle mani, sparisce alla fine della frustata. */
{
  nome: '6/8 poseRimessa/pallaRimessa: la clip nuova, accanto a poseRinvio/pallaRinvio',
  cerca:
`function pallaRinvio(u,o){
  const ti=0.48;
  if(u<0.28){ const c=sm(u,0.04,0.26);
    o[0]=0; o[1]=1.18+0.02*c; o[2]=0.50-0.06*c;
  }else if(u<ti){ const f=(u-0.28)/(ti-0.28);
    o[0]=0; o[1]=1.20-0.77*f*f; o[2]=0.44+0.26*f;
  }else{ const f=(u-ti)/(1-ti), e=1-(1-f)*(1-f);
    o[0]=0; o[2]=0.70+3.40*e;
    o[1]=0.43+4.40*f-3.60*f*f;   // parabola vera nel tempo, non nell'ease
  }
  const dw=Math.abs(u-ti);
  o[3]=dw<0.05?0.45*(1-dw/0.05):0;
}
`,
  metti:
`function pallaRinvio(u,o){
  const ti=0.48;
  if(u<0.28){ const c=sm(u,0.04,0.26);
    o[0]=0; o[1]=1.18+0.02*c; o[2]=0.50-0.06*c;
  }else if(u<ti){ const f=(u-0.28)/(ti-0.28);
    o[0]=0; o[1]=1.20-0.77*f*f; o[2]=0.44+0.26*f;
  }else{ const f=(u-ti)/(1-ti), e=1-(1-f)*(1-f);
    o[0]=0; o[2]=0.70+3.40*e;
    o[1]=0.43+4.40*f-3.60*f*f;   // parabola vera nel tempo, non nell'ease
  }
  const dw=Math.abs(u-ti);
  o[3]=dw<0.05?0.45*(1-dw/0.05):0;
}
/* RIMESSA con le due mani sopra la testa (voce #87, compito 3): corpo
   eretto, le braccia SIMMETRICHE (aR=aL, il pattern di posePresa) che
   salgono a portare la palla dietro il capo, la frustata del busto in
   avanti la lancia, il rientro la riporta a riposo. Le gambe restano
   FERME - angoli fissi, nessuna animazione: chi rimette in gioco lo fa
   con le braccia, non con le gambe. */
function poseRimessa(u){
  const su=sm(u,0.02,0.40);        // le braccia salgono sopra la testa
  const frusta=sm(u,0.40,0.60);    // il busto frusta in avanti: la palla parte
  const rientro=sm(u,0.60,0.95);   // il rientro a riposo
  const pelvY=0.90;                // corpo eretto: il bacino non scende ne' salta
  const lean=-0.10+0.35*frusta-0.35*rientro;   // -0,10 -> +0,25 sulla fase 0,4-0,6
  corpo(pelvY,0,lean,0);
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  const aB=0.20+2.40*su-2.40*rientro;   // simmetriche: aR=aL, sopra la testa al culmine
  const eB=0.45-0.05*su;                // gomiti chiusi: restano piegati, non si tendono
  const outB=0.05+0.05*su;              // vicine, non una V aperta: la palla sta fra le mani
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aB,eB, outB, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aB,eB, outB,-1);
  // gambe ferme divaricate: angoli fissi, il lancio non le anima
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, 0,  0.12, 0.22,  0.16);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, 0, -0.12, 0.22, -0.16);
}
/* palla della rimessa: sale con le mani dietro la testa, la frustata
   la porta in avanti restando alle mani, poi il volo libero - parabola
   vera come pallaRinvio */
function pallaRimessa(u,o){
  const T1=0.40, T2=0.60;
  if(u<T1){
    const f=sm(u,0.02,T1);
    o[0]=0; o[1]=1.00+0.55*f; o[2]=0.35-0.20*f;
  }else if(u<T2){
    const f=sm(u,T1,T2);
    o[0]=0; o[1]=1.55+0.10*f; o[2]=0.15+0.35*f;
  }else{
    const f=(u-T2)/(1-T2), e=1-(1-f)*(1-f);
    o[0]=0; o[2]=0.50+3.30*e;
    o[1]=1.65+4.20*f-3.60*f*f;   // parabola vera nel tempo, come pallaRinvio
  }
  // o[3]: piena alla grandezza delle sorelle (0,30-0,45) mentre e' alle
  // mani, sparisce alla fine della frustata (T2) - non 1,0 letterale:
  // sq=1 appiattirebbe la palla a quota zero (disegnaPalla, ry=r*(1-sq))
  o[3]=0.35*(1-sm(u,T2-0.05,T2));
}
`,
},

/* 7 — la tavola CLIPS: la voce 'rimessa' accanto a 'rinvio'. */
{
  nome: '7/8 tavola CLIPS: la voce rimessa accanto a rinvio',
  cerca:
`  rinvio:    {freq:0.55,pose:poseRinvio,    palla:pallaRinvio},
`,
  metti:
`  rinvio:    {freq:0.55,pose:poseRinvio,    palla:pallaRinvio},
  rimessa:   {freq:0.8, pose:poseRimessa,   palla:pallaRimessa},
`,
},

/* 8 — aiDecide: il rispetto del battitore. Un solo punto di veto,
   DOPO che sia la lettura del ruolo (teamBrain) sia il ripiego per
   distanza hanno gia' scritto la loro proposta in chaser - cosi'
   nessuna delle due vie puo' sopravvivere alla guardia. carrier e'
   gia' un parametro della funzione: nessuna lettura nuova di b.owner,
   solo inBattuta(carrier) sullo stesso oggetto. */
{
  nome: '8/8 aiDecide: il rispetto, un veto unico dopo ruolo e ripiego',
  cerca:
`  if(!chaser){
    let cd=1e9;
    for(const q of mates){
      if(q===deepest) continue;
      const d=len(b.x-q.x,b.y-q.y);
      if(d<cd){ cd=d; chaser=q; }
    }
  }
  const ballNearOurGoal = Math.abs(b.x-myGoalX)<FW*0.42;
`,
  metti:
`  if(!chaser){
    let cd=1e9;
    for(const q of mates){
      if(q===deepest) continue;
      const d=len(b.x-q.x,b.y-q.y);
      if(d<cd){ cd=d; chaser=q; }
    }
  }
  /* IL RISPETTO DEL BATTITORE (voce #87, compito 3): durante la
     finestra di battuta nessun avversario lo candida come bersaglio da
     pressare - ne' dal ruolo che teamBrain assegna sopra, ne' dal
     ripiego per distanza appena sopra. Un solo veto, DOPO tutte e due
     le vie: il ramo di copertura piu' sotto tiene gia' il portatore
     fuori da 'danger' (o===carrier e' escluso), quindi senza un
     chaser dedicato la squadra tiene la zona invece di accerchiare chi
     sta battendo. */
  if(inBattuta(carrier)) chaser=null;
  const ballNearOurGoal = Math.abs(b.x-myGoalX)<FW*0.42;
`,
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

/* CONTEGGI A DELTA: marker distintivi di ciascuna sostituzione, ognuno
   atteso +1 fra src e out. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ["function inBattuta(p){\n  return !!(G.battuta && G.players[G.battuta.battitore]===p);\n}", 1],
  ["{ act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40, off:inBattuta(ctrlPlayer(t)) }", 1],
  ["if(inBattuta(p)){ rifiutoVerbo(t,p); return; }", 1],
  ["p.chargeClip=inBattuta(p)?'rimessa':'passaggio';", 1],
  ["p.chargeClip=inBattuta(p)?'rimessa':'cross';", 1],
  ['function poseRimessa(u){', 1],
  ['function pallaRimessa(u,o){', 1],
  ["  rimessa:   {freq:0.8, pose:poseRimessa,   palla:pallaRimessa},", 1],
  ['if(inBattuta(carrier)) chaser=null;', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
/* le forme vecchie devono sparire (sostituite, non duplicate). Nota:
   "})) p.chargeClip='cross';" da solo compare altre tre volte nel file
   (altre funzioni non toccate da questo attrezzo), quindi la verifica
   usa il blocco doCrossUmano per intero, che e' unico. */
const scomparsi = [
  "{ act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }",
  "if(!puoTirare(t)) return;\n  const p=ctrlPlayer(t);\n  const pi=G.players.indexOf(p);",
  "if(anticipa(p, 'passo', PASS_CAR_U, eseguiPassUmano)) p.chargeClip='passaggio';",
  "    doCross(q, 0, 0, null, dest);\n  })) p.chargeClip='cross';",
];
for (const s of scomparsi) {
  if (conta(out, s) !== 0) rotti.push(s + ' atteso 0 in uscita, trovato ' + conta(out, s));
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
