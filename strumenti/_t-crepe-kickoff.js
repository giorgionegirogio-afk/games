/* =====================================================================
   _t-crepe-kickoff.js -- LA CURA DEL BATTITORE ESPULSO (voce #128,
   compito 2, P0-2). UN'ANCORA sola: la condizione di scelta del
   battitore del calcio d'inizio dentro resetKickoff
   (CALCETTO-il-gioco.html:10904-10964, condizione a ~:10955).

   MODELLO: strumenti/_t-crepe-docross.js (a sua volta su
   _t-registro-fatti.js) -- l'ANCORA con cerca/metti, il guardiano che
   rifiuta se `cerca' non compare ESATTAMENTE una volta, `--out` dry-run
   poi `--dentro`.

   IL BUG (diagnosi P0-2, docs/superpowers/specs/2026-09-20-crepe-
   fuzzer-design.md; riprodotto ROSSO dalla prova 11/KICKOFF-ESPULSO di
   strumenti/_q-invarianti.js PRIMA di questa cura). resetKickoff scarica
   il cartellino differito PRIMA (:10922, scaricaCardVantaggio ->
   infliggiCartellino, che marca p.out=ESPULSIONE_SEC e rilascia
   G.ball.owner correttamente SE quel giocatore lo possedeva), ma poi
   sceglie il battitore per team+idx FISSO, SENZA controllo out<=0:
     if(p.team===kt && p.idx===1){
       ...
       G.ball.owner=G.players.indexOf(p);
       ...
     }
   Se l'appena-espulso e' proprio l'idx1 della squadra che batte, viene
   rimesso in campo (le sue x/y sovrascritte sul punto di battuta, poche
   righe DOPO che il ciclo precedente gli aveva gia' scritto la posizione
   "fuori" per p.out>0) e gli si da' G.ball.owner -- un espulso in
   possesso della palla, misurato: owner=1 (team0/idx1), out=12
   (ESPULSIONE_SEC) sul gioco di oggi.

   LA CURA (in due parti, LO STESSO pattern gia' in infliggiCartellino
   quando serve un rimpiazzo eleggibile, ~:18537: diMovimentoInCampo(team)[0]):
   1. La condizione guadagna `&& p.out<=0`: idx1 espulso non e' piu'
      scelto.
   2. FALLBACK: se DOPO il ciclo (idx1 non eleggibile o non trovato)
      nessun giocatore e' stato scelto, si sceglie il primo giocatore di
      movimento eleggibile della squadra (diMovimentoInCampo(kt)[0]) e
      gli si applica LO STESSO trattamento (posizione di battuta,
      G.ball.owner, segnaTocco, controllo umano) che il ciclo avrebbe
      dato a idx1. diMovimentoInCampo (:18516-18518) e' gia' garantita
      non-vuota dalla regola di casa (mai <2 uomini di movimento in
      campo, infliggiCartellino nega l'espulsione sotto quella soglia,
      PRIMA di questa cura) -- il fallback non introduce un nuovo
      percorso "nessuno batte", solo un battitore diverso da idx1 quando
      idx1 e' fuori.
   IL KICKOFF NORMALE (nessuna espulsione, idx1 eleggibile) NON cambia:
   `&& p.out<=0` e' vero per costruzione quando idx1 e' in campo, il
   ciclo lo trova come sempre e il ramo FALLBACK non gira mai (il break
   dentro il ciclo esce prima che il flag `scelto' venga controllato) --
   verificato in strumenti/_q-invarianti.js (le prove restano verdi) e a
   mano con un kickoff senza cartellini (vedi il rapporto del compito).

   ZERO dado() NUOVO: diMovimentoInCampo e' un filtro puro, nessun
   sorteggio, nessun ramo nuovo di RNG.

   uso:  node strumenti/_t-crepe-kickoff.js --in fuori/base128b.html --out fuori/curato128b.html
         node strumenti/_t-crepe-kickoff.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/curato-kickoff.html'));

const ANCORE = [

{
  nome: '1. resetKickoff: la scelta del battitore ignora un idx1 espulso, e ha un fallback (P0-2)',
  cerca:
`  const kt=G.kickTeam?1:0, dir=kt===0?1:-1;
  for(const p of G.players){
    if(p.team===kt && p.idx===1){
      p.x=FW/2-dir*30; p.y=FH/2; p.fx=dir; p.fy=0;
      G.ball.x=p.x+dir*CARRY_DIST; G.ball.y=FH/2;
      G.ball.owner=G.players.indexOf(p);
      segnaTocco(G.ball.owner, true);   // il calcio d'inizio e' un piede (voce #107, compito 2)
      if(!G.cpu[kt]) G.ctrl[kt]=G.players.indexOf(p);   // controlli subito chi batte
      break;
    }
  }
}`,
  metti:
`  const kt=G.kickTeam?1:0, dir=kt===0?1:-1;
  /* LA CURA (voce #128, compito 2, P0-2): "&& p.out<=0" in piu' sulla
     condizione di sempre -- un espulso (p.out>0, appena marcato da
     scaricaCardVantaggio/infliggiCartellino qui sopra) non e' mai piu'
     scelto come battitore. FALLBACK se idx1 non e' eleggibile (espulso
     o assente): il primo giocatore di movimento in campo
     (diMovimentoInCampo, :18516-18518 -- lo STESSO pattern che
     infliggiCartellino usa gia' per il cambio di controllo, ~:18537),
     sempre non-vuoto per costruzione (la regola di casa vieta di
     scendere sotto 2 uomini di movimento). Il kickoff NORMALE (idx1
     eleggibile) non cambia: il ciclo lo trova come sempre e il break
     esce PRIMA del fallback. */
  let scelto=false;
  for(const p of G.players){
    if(p.team===kt && p.idx===1 && p.out<=0){
      p.x=FW/2-dir*30; p.y=FH/2; p.fx=dir; p.fy=0;
      G.ball.x=p.x+dir*CARRY_DIST; G.ball.y=FH/2;
      G.ball.owner=G.players.indexOf(p);
      segnaTocco(G.ball.owner, true);   // il calcio d'inizio e' un piede (voce #107, compito 2)
      if(!G.cpu[kt]) G.ctrl[kt]=G.players.indexOf(p);   // controlli subito chi batte
      scelto=true;
      break;
    }
  }
  if(!scelto){
    const p=diMovimentoInCampo(kt)[0];
    if(p){
      p.x=FW/2-dir*30; p.y=FH/2; p.fx=dir; p.fy=0;
      G.ball.x=p.x+dir*CARRY_DIST; G.ball.y=FH/2;
      G.ball.owner=G.players.indexOf(p);
      segnaTocco(G.ball.owner, true);
      if(!G.cpu[kt]) G.ctrl[kt]=G.players.indexOf(p);
    }
  }
}`,
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

/* CONTEGGIO A DELTA. Il fallback (diMovimentoInCampo(kt)[0]) e il flag
   `scelto' devono comparire esattamente 1 volta ciascuno (il solo sito
   toccato), e la vecchia condizione SENZA out<=0 deve essere sparita. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'if(p.team===kt && p.idx===1 && p.out<=0){') !== 1) {
  rotti.push('la condizione curata (con out<=0) non e\' presente esattamente una volta');
}
if (conta(out, 'if(p.team===kt && p.idx===1){') !== 0) {
  rotti.push('la vecchia condizione SENZA out<=0 e\' sopravvissuta');
}
if (conta(out, 'const p=diMovimentoInCampo(kt)[0];') !== 1) {
  rotti.push('il fallback diMovimentoInCampo(kt)[0] non e\' presente esattamente una volta');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
