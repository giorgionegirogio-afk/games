/* =====================================================================
   _t-rigore-area.js -- IL RIGORE LEGGE L'AREA VERA (voce #107, compito
   1, primo compito del ramo voce-107-regole-leva-corta).

   IL PERCHE'. checkSlideContact (CALCETTO-il-gioco.html ~18108) decide
   se un fallo da scivolata apre il duello (startFreeKick) o resta una
   punizione rapida (punizioneRapida) leggendo zonaCalda =
   Math.abs(goalX-p.x) < 260 -- una fascia 1D sulla sola x, non scalata
   per taglia, diversa dal rettangolo vero gia' disegnato E applicato
   altrove nello stesso file (VERNICE.areaProf/areaSemi, dentroArea(),
   usata da GK_AREA_X e dal cross -- ramo #86). Il banco
   strumenti/_q-regole.js nasce PRIMA di questo attrezzo e condanna
   esattamente questo: RIGORE-FUORI (fallo a x=60, dentro la fascia 260
   ma a y fuori dalla semilarghezza dell'area vera) apre comunque il
   duello sul gioco di oggi.

   LA CURA: la decisione fallo-apre-il-duello legge dentroArea(carrier.
   team, p.x, p.y) al posto di zonaCalda. GREP FATTO PRIMA DI SCRIVERE
   QUESTO ATTREZZO: "zonaCalda" compare 3 volte nel file, tutte e tre
   dentro il blocco che questo attrezzo sostituisce (la dichiarazione,
   la condizione, il ternario del banner) -- e' il SUO UNICO USO. Il
   nome muore qui, con un commento a edizioni: non resta nessun altro
   punto da conciliare (il cumulo falli, MANUALE SS6 "dal terzo fallo
   si tira anche fuori zona calda", e' una condizione INDIPENDENTE --
   G.stats.falli[p.team]>=3 -- che non legge mai zonaCalda e non si
   tocca). goalX (la porta che il fallito attacca) sparisce insieme a
   lei: serviva solo a calcolare zonaCalda, e dentroArea(carrier.team,
   ...) calcola la stessa porta al suo interno (gx = team===0?FW:0,
   la STESSA formula, letta una volta sola dentro dentroArea invece che
   duplicata qui).

   uso:  node strumenti/_t-rigore-area.js --out fuori/rigore-area.html
         node strumenti/_t-rigore-area.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/rigore-area.html'));

const ANCORE = [

/* 1/1 -- checkSlideContact: la decisione fallo-apre-il-duello legge
   dentroArea(carrier.team, p.x, p.y) al posto della fascia zonaCalda.
   cumulo resta identico (indipendente, non tocca zonaCalda). */
{
  nome: '1/1 checkSlideContact: la decisione del duello legge dentroArea invece di zonaCalda',
  cerca:
`        /* CUMULO FALLI, come nel futsal: il duello dal dischetto si guadagna.
           Si tira solo se il fallo e' in zona pericolosa oppure dal terzo
           fallo di squadra in poi. Gli altri sono punizioni a due, veloci:
           la partita non si spezza a ogni contrasto. */
        const goalX = carrier.team===0 ? FW : 0;   // porta che il fallito attacca
        const zonaCalda = Math.abs(goalX-p.x) < 260;
        const cumulo = G.stats.falli[p.team] >= 3;
        if(zonaCalda || cumulo){
          showBanner(cumulo && !zonaCalda ? 'TERZO FALLO: SI TIRA!' : (cattivo?'FALLO CATTIVO!':'PUNIZIONE!'), '#ffb020', 1.2);
          startFreeKick(carrier.team, p.team);
        }else{
          showBanner(cattivo?'FALLO CATTIVO!':'FALLO!', '#ffb020', 1.0);
          punizioneRapida(carrier, p);
        }
`,
  metti:
`        /* CUMULO FALLI, come nel futsal: il duello dal dischetto si guadagna.
           Si tira solo se il fallo e' dentro l'area vera oppure dal terzo
           fallo di squadra in poi. Gli altri sono punizioni a due, veloci:
           la partita non si spezza a ogni contrasto.
           RETTIFICA (voce #107, compito 1): qui c'era "zona pericolosa",
           cioe' zonaCalda = Math.abs(goalX-p.x) < 260 -- una fascia 1D
           sulla sola x, non scalata per taglia e diversa dall'area vera
           gia' disegnata E applicata altrove nello stesso file (VERNICE.
           areaProf/areaSemi, dentroArea(), usata da GK_AREA_X e dal
           cross -- ramo #86). zonaCalda muore qui: era il suo unico uso
           nel file. La decisione ora legge il rettangolo vero, alla
           scala della taglia in corso -- a 5 la differenza misurata e'
           260 contro un'area profonda 173 (piu' la semilarghezza 216
           sulla y, che la vecchia fascia non vedeva affatto). */
        const inArea = dentroArea(carrier.team, p.x, p.y);
        const cumulo = G.stats.falli[p.team] >= 3;
        if(inArea || cumulo){
          showBanner(cumulo && !inArea ? 'TERZO FALLO: SI TIRA!' : (cattivo?'FALLO CATTIVO!':'PUNIZIONE!'), '#ffb020', 1.2);
          startFreeKick(carrier.team, p.team);
        }else{
          showBanner(cattivo?'FALLO CATTIVO!':'FALLO!', '#ffb020', 1.0);
          punizioneRapida(carrier, p);
        }
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

/* CONTEGGI A DELTA (come in _t-sponde-interruttore.js/_t-tavola-vernice.
   js). zonaCalda muore come VARIABILE VIVA -- il codice non la
   dichiara ne' la legge piu' -- ma il commento a edizioni qui sopra
   NOMINA il nome morto (e' il punto: dichiarare che e' morto, non far
   sparire la prova che sia mai esistito), quindi il conteggio guarda
   il CODICE, non la prosa: la dichiarazione, la condizione e il
   ternario del banner devono sparire tutti e tre. goalX sparisce con
   lei (serviva solo a calcolarla). dentroArea guadagna esattamente una
   chiamata nuova. */
const conta = (testo, s) => testo.split(s).length - 1;
const codiceMortoVivo = [
  'const zonaCalda = Math.abs(goalX-p.x) < 260;',
  'if(zonaCalda || cumulo){',
  'cumulo && !zonaCalda ?',
  'const goalX = carrier.team===0 ? FW : 0;',
];
const attesi = [
  ['dentroArea(carrier.team, p.x, p.y)', 1],
  ['const inArea = dentroArea(carrier.team, p.x, p.y);', 1],
  ['if(inArea || cumulo){', 1],
  ['cumulo && !inArea ?', 1],
];
const rotti = [];
for (const s of codiceMortoVivo) if (conta(out, s) !== 0) rotti.push(s + ': atteso sparito dal codice, ancora presente ' + conta(out, s) + ' volte');
for (const [s, n] of attesi) {
  const d = conta(out, s) - conta(src, s);
  if (d !== n) rotti.push(s + ' atteso +' + n + ', trovato +' + d);
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    zonaCalda: ' + conta(src, 'zonaCalda') + ' -> ' + conta(out, 'zonaCalda') + ' occorrenze come testo (il codice vivo e\' 0)');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
