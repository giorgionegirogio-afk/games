/* =====================================================================
   _t-moviola.js — LA MOVIOLA SCORRE, E FA VEDERE L'AZIONE
   (voce #85, 1 settembre 2026; segnalazione del committente: «il replay
   dei goal va a scatti» e «nel replay si vede tutta l'azione fino al
   goal, quindi anche il dribbling, le finte e le catene di possesso»).

   LA DIAGNOSI, misurata oggi (scratchpad/_sonda-moviola.js):
   1) GLI SCATTI. Si registra a REC_HZ=20 e si DIPINGE IL CAMPIONE
      INTERO (disegnaMoviola prende M.frames[idx], nessuna
      interpolazione): a velocita' 0,70 l'occhio vede 14 pose al
      secondo, e sul finale a 0,34 ne vede 6,8 — su uno schermo che
      ridipinge a 60. Contate: 16 pose in 1,5 s, 10,7 al secondo di
      media. Ogni posa resta ferma 4-9 fotogrammi di schermo: non e'
      «un po' scattosa», e' un flip-book.
   2) L'AZIONE TAGLIATA. Il nastro dura REC_SEC=5 s ma avviaMoviola ne
      prende gli ultimi REC_HZ*0,8 = SEDICI fotogrammi, cioe' 0,8
      secondi: si rivede l'ultimo tocco, mai l'azione. Misurato lo
      stesso giorno: un possesso di squadra dura in mediana 2,4 s a 11
      e 3,4 s a 5, e l'ultimo cambio di lato del pallone stava a 3,4-3,7
      secondi dal presente.

   LE CURE, in tre pezzi:
   A) INTERPOLAZIONE fra i campioni: posizioni, direzione della faccia,
      angoli e quota si mescolano con la frazione fra un campione e
      l'altro; i campi DISCRETI (fase del passo, scivolata, tuffo,
      carica, rovesciata, clip del calcio) restano del campione, che e'
      l'unica cosa onesta da fare con uno stato che non e' un numero.
      Costo: zero memoria, un pugno di moltiplicazioni per giocatore.
   B) LA FINESTRA DELL'AZIONE: il registro sale a 9 secondi e ogni
      fotogramma porta il LATO del pallone (squadraDelPallone, che e'
      gia' in casa e non pesca sorteggi). avviaMoviola risale indietro
      fino all'ultimo cambio di lato — l'inizio VERO dell'azione, quando
      il pallone e' diventato nostro — con un tetto di 7 s e il
      pavimento di sempre (0,8 s), cosi' un gol nato da una respinta
      non regala nove secondi di niente.
   C) IL RITMO: un nastro lungo non si guarda alla velocita' di uno
      corto. La velocita' parte alta e proporzionale alla lunghezza
      (fino a 2x sull'antefatto) e arriva sempre allo stesso 0,34 sulla
      rete: la moviola resta di 2-3 secondi qualunque azione mostri, e
      il tocco la salta come prima.

   SORTEGGI: nessuna chiamata nuova a dado(). squadraDelPallone e' pura
   (verbale sulla sua definizione). La fisica non avanza durante la
   moviola (step esce prima): allungare il nastro non sposta la
   simulazione. Il registro cresce da ~740 kB a ~1,3 MB (JSON, limite
   superiore misurato a 11 contro 11): dichiarato.

   uso:  node strumenti/_t-moviola.js --out fuori/moviola.html
         node strumenti/_t-moviola.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/moviola.html'));

const ANCORE = [

/* 1 — il registro si allunga e impara il lato del pallone */
{
  nome: '1/5 REC_SEC a 9 e il lato nel fotogramma',
  cerca:
`const REC_HZ = 20, REC_SEC = 5;
const REC_MAX = REC_HZ*REC_SEC;`,
  metti:
`/* NOVE SECONDI, non cinque (voce #85, 1 settembre 2026): la moviola
   deve poter cominciare da quando il pallone e' diventato NOSTRO, e
   l'ultimo cambio di lato misurato sta a 3,4-3,7 secondi dal presente
   (mediana del possesso: 2,4 s a undici, 3,4 s a cinque). Il registro
   passa da ~740 kB a ~1,3 MB a 11 contro 11 (JSON, limite superiore
   misurato): dichiarato, e pagato per vedere l'azione invece
   dell'ultimo tocco. */
const REC_HZ = 20, REC_SEC = 9;
const REC_MAX = REC_HZ*REC_SEC;`,
},

/* 2 — ogni fotogramma porta il lato */
{
  nome: '2/5 il lato del pallone dentro il fotogramma',
  cerca:
`  const f = {
    b:{x:G.ball.x, y:G.ball.y, z:G.ball.z||0, rot:G.ball.rot||0},`,
  metti:
`  const f = {
    b:{x:G.ball.x, y:G.ball.y, z:G.ball.z||0, rot:G.ball.rot||0},
    /* IL LATO DEL PALLONE (voce #85): il padrone se c'e', altrimenti la
       squadra dell'ultimo tocco. E' cio' che permette ad avviaMoviola di
       risalire all'inizio VERO dell'azione — l'istante in cui il pallone
       e' diventato nostro. Funzione pura, gia' in casa: non scrive un
       bit e non pesca un sorteggio. */
    sq: squadraDelPallone(),`,
},

/* 3 — la finestra dell'azione, e il ritmo che si adatta */
{
  nome: '3/5 avviaMoviola risale all\'inizio dell\'azione',
  cerca:
`function avviaMoviola(){
  if(!SAVE.moviola || G.rec.length < REC_HZ) return false;
  /* OTTO DECIMI prima della rete: il nastro in pianta e' l'antefatto —
     la TRAIETTORIA e chi l'ha messa dentro. Il gesto da vicino e la festa
     vivono nella ripresa dedicata in camera bassa, che e' gia' passata. */
  const da = Math.max(0, G.rec.length - Math.round(REC_HZ*0.8));
  const fr = G.rec.slice(da);
  G.moviola = { frames:fr, i:0, t:0, vel:0.7, fase:'entra', tIn:0, tf:0, tu:0 };
  return true;
}`,
  metti:
`/* LA FINESTRA DELL'AZIONE (voce #85, 1 settembre 2026). Fino a oggi il
   nastro erano gli ULTIMI OTTO DECIMI — sedici fotogrammi — e il
   commento diceva «il nastro in pianta e' l'antefatto: la traiettoria e
   chi l'ha messa dentro». Otto decimi non sono un antefatto: sono
   l'ultimo tocco. Adesso si risale fino a quando il pallone ha CAMBIATO
   LATO l'ultima volta — l'istante in cui e' diventato nostro — cosi' la
   moviola fa vedere la catena: il recupero, il dribbling, la finta, il
   cross, la rovesciata. Tetto di sette secondi perche' un possesso
   lunghissimo non diventi un documentario, pavimento di otto decimi
   perche' un gol nato da una respinta non mostri il vuoto. */
const MOV_TETTO = 7.0, MOV_MIN = 0.8;
function avviaMoviola(){
  if(!SAVE.moviola || G.rec.length < REC_HZ) return false;
  const n = G.rec.length;
  const tetto = Math.max(0, n - Math.round(REC_HZ*MOV_TETTO));
  /* IL LATO DI CHI HA SEGNATO non si legge sull'ULTIMO fotogramma: nel
     mezzo secondo della rete il pallone passa dal piede al portiere,
     alla rete, e il lato sfarfalla. Si prende il lato PREVALENTE
     nell'ultimo mezzo secondo (correzione misurata: leggendo l'ultimo
     fotogramma il nastro tornava sempre al pavimento di 0,8 s). */
  let c0=0, c1=0;
  for(let k=n-1; k>=Math.max(0,n-Math.round(REC_HZ*0.5)); k--){
    const s=G.rec[k] ? G.rec[k].sq : -1;
    if(s===0) c0++; else if(s===1) c1++;
  }
  const lato = (c0||c1) ? (c0>=c1?0:1) : -1;
  let da = tetto;
  if(lato >= 0){
    /* si cammina indietro fino a un cambio di lato che DURA: sei
       fotogrammi consecutivi (tre decimi) dell'altra squadra. Un tocco
       singolo non spezza l'azione — se no ogni rimpallo diventerebbe
       «un'altra azione» e la moviola tornerebbe a mostrare l'ultimo
       tocco. */
    let run=0;
    for(let k = n-1; k >= tetto; k--){
      const s = G.rec[k] ? G.rec[k].sq : lato;
      if(s >= 0 && s !== lato){ run++; if(run >= 6){ da = k; break; } }
      else run = 0;
    }
  }
  da = Math.min(da, Math.max(0, n - Math.round(REC_HZ*MOV_MIN)));
  const fr = G.rec.slice(da);
  /* IL RITMO SI ADATTA ALLA LUNGHEZZA: l'antefatto scorre veloce (fino a
     2x) e la rete arriva sempre allo stesso rallentatore. Cosi' la
     moviola dura due o tre secondi qualunque azione racconti — e il
     tocco la salta come prima. */
  const sec = fr.length / REC_HZ;
  const v0 = clamp(0.70 * (sec / 0.8), 0.70, 2.0);
  G.moviola = { frames:fr, i:0, t:0, vel:v0, v0:v0, fase:'entra', tIn:0, tf:0, tu:0 };
  return true;
}`,
},

/* 4 — la velocita' parte da v0 e arriva sempre a 0,34 */
{
  nome: '4/5 la rampa della velocita\' parte dalla lunghezza',
  cerca:
`    const u=clamp(M.t/Math.max(1,n-1),0,1);
    M.vel = 0.70-0.36*u;`,
  metti:
`    const u=clamp(M.t/Math.max(1,n-1),0,1);
    /* voce #85: si parte dalla velocita' scelta all'avvio (piu' alta se
       il nastro e' lungo) e si arriva SEMPRE a 0,34 sulla rete, che e'
       il rallentatore di sempre */
    const vIn = (M.v0 || 0.70);
    M.vel = vIn + (0.34 - vIn)*u;`,
},

/* 5 — l'interpolazione: la cura degli scatti */
{
  nome: '5/5 disegnaMoviola interpola fra i campioni',
  cerca:
`function disegnaMoviola(){
  const M=G.moviola; if(!M) return;
  const idx = clamp(M.i,0,M.frames.length-1);
  const a=M.frames[idx];
  for(let k=0;k<a.p.length && k<G.players.length;k++){
    const f=a.p[k], q=G.players[k];
    if(f.out) continue;
    q.x=f.x; q.y=f.y; q.fx=f.fx; q.fy=f.fy; q.fase=f.run;
    q.amp=f.amp; q.squash=f.sq; q.ang=f.ang; q.bob=f.bob;
    q.kickT=f.kt; q.kickB=f.kb;`,
  metti:
`/* L'INTERPOLAZIONE, cioe' la cura degli scatti (voce #85, 1 settembre
   2026). Si registra a venti campioni al secondo e si DIPINGEVA il
   campione intero: misurato, l'occhio vedeva 10,7 pose al secondo (16
   in un secondo e mezzo) e sul finale 6,8 — su uno schermo che
   ridipinge a sessanta. Adesso fra un campione e il successivo si
   mescola con la frazione: cio' che e' NUMERO (posizione, quota,
   direzione della faccia, angoli, respiro, schiacciamento) scorre
   liscio, e cio' che e' STATO (la fase del passo, la scivolata, il
   tuffo, la carica, la rovesciata, la clip del calcio) resta del
   campione — mescolare uno stato discreto sarebbe inventare una posa
   che non c'e' mai stata. Zero memoria in piu': solo aritmetica. */
function disegnaMoviola(){
  const M=G.moviola; if(!M) return;
  const idx = clamp(M.i,0,M.frames.length-1);
  const a=M.frames[idx];
  const nx = M.frames[Math.min(idx+1, M.frames.length-1)];
  /* la frazione fra i due campioni; sulla fase 'rete' resta 0, perche'
     li' il fotogramma e' fermo apposta */
  const fr = (M.fase==='gioca') ? clamp(M.t - Math.floor(M.t), 0, 1) : 0;
  const mix = (u,v)=>u + (v-u)*fr;
  for(let k=0;k<a.p.length && k<G.players.length;k++){
    const f=a.p[k], q=G.players[k];
    if(f.out) continue;
    const g = (nx && nx.p[k] && !nx.p[k].out) ? nx.p[k] : f;
    q.x=mix(f.x,g.x); q.y=mix(f.y,g.y);
    /* la direzione della faccia e' un versore: si mescola e si
       rinormalizza, se no la figura si accorcia nelle virate */
    { let vx=mix(f.fx,g.fx), vy=mix(f.fy,g.fy);
      const l=Math.hypot(vx,vy);
      if(l>0.0001){ vx/=l; vy/=l; } else { vx=f.fx; vy=f.fy; }
      q.fx=vx; q.fy=vy; }
    q.fase=f.run;
    q.amp=mix(f.amp,g.amp); q.squash=mix(f.sq,g.sq);
    q.ang=mix(f.ang,g.ang); q.bob=mix(f.bob,g.bob);
    q.kickT=f.kt; q.kickB=f.kb;`,
},

/* 6 — il pallone si interpola come i corpi (la correzione della sera) */
{
  nome: '6/6 anche il pallone si interpola',
  cerca:
`  G.ball.x=a.b.x; G.ball.y=a.b.y; G.ball.z=a.b.z; G.ball.rot=a.b.rot;`,
  metti:
`  /* IL PALLONE SI INTERPOLA COME I CORPI (voce #85, correzione della
     stessa sera): la prima stesura della cura mescolava i giocatori e
     lasciava il pallone al campione intero — e il pallone e' cio' che
     l'occhio segue. Misurato con la sonda: 83% dei fotogrammi di
     schermo col pallone FERMO e salti da 27 unita', cioe' gli scatti
     restavano tutti li'. */
  { const b0=a.b, b1=(nx&&nx.b)?nx.b:a.b;
    G.ball.x=mix(b0.x,b1.x); G.ball.y=mix(b0.y,b1.y);
    G.ball.z=mix(b0.z,b1.z); G.ball.rot=mix(b0.rot,b1.rot); }`,
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
  ['const REC_HZ = 20, REC_SEC = 9;', 1],
  ['sq: squadraDelPallone(),', 1],
  ['const MOV_TETTO = 7.0, MOV_MIN = 0.8;', 1],
  ['M.vel = vIn + (0.34 - vIn)*u;', 1],
  ['const mix = (u,v)=>u + (v-u)*fr;', 1],
  ['q.x=mix(f.x,g.x); q.y=mix(f.y,g.y);', 1],
  ['voce #85', 6],
  ['G.ball.x=a.b.x;', 0],          // il campione intero non si dipinge piu'
  ['G.ball.x=mix(b0.x,b1.x);', 1],
  ['let run=0;', 1],
  ['const lato = (c0||c1) ? (c0>=c1?0:1) : -1;', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
