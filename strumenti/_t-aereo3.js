/* =====================================================================
   _t-aereo3.js — IL CROSS SULL'INSERIMENTO (stadio B2 della voce #72,
   1 settembre 2026).

   LA MISURA CHE LO CHIEDE (sonda della punta + sonda alle porte, stesso
   giorno, sul file con A+B+A2 dentro): a 11 la punta corre (42 episodi a
   partita) e ARRIVA (distanza minima dal secondo palo: 2-17 unita',
   1.179 proiezioni in area su 17.538 fotogrammi) — ma MAI nei fotogrammi
   in cui il portatore e' pronto sulla fascia (sovrapposizione: zero su
   4 partite). Il portatore CPU ridecide ogni 0,22-0,4 s e scarica prima
   che l'inserimento maturi: manca l'APPUNTAMENTO, non la corsa.

   LA CURA, dalla miniera (MINIERA-FCM.md §5): il concorrente ha il cross
   ANTICIPATO come TIPO (CROSS_EARLY, PASS::LowCross::SearchPosition —
   il bersaglio e' una posizione, non un uomo gia' piazzato). Da noi
   diventa una grazia sul solo candidato IN CORSA D'AREA
   (q.corsaArea>0): vale anche se al tempo di volo e' appena fuori
   dall'area, purche' la corsa lo porti dentro entro CROSS_GRAZIA=0,40 s.
   La MIRA non cambia: resta la sua proiezione al tempo di volo (il
   pallone cade sul suo binario, un soffio prima di lei — l'anticipo
   classico). Portiere e varco si verificano sulla stessa mira, come per
   ogni altro candidato. Chi non e' in corsa d'area non guadagna niente.

   SORTEGGI: nessuna estrazione nuova (corsaArea e' un cronometro gia'
   scritto); l'esito nei percorsi CPU cambia come gia' dichiarato per gli
   stadi A e B (§4 del progetto).

   uso:  node strumenti/_t-aereo3.js --out fuori/aereo3.html
         node strumenti/_t-aereo3.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/aereo3.html'));

const ANCORE = [

/* 1 — la costante della grazia, accanto alle sorelle del cross */
{
  nome: '1/2 la costante CROSS_GRAZIA',
  cerca:
`const CROSS_RACC  = 420;     // sopra questa velocita' d'arrivo nessuno la ferma`,
  metti:
`const CROSS_RACC  = 420;     // sopra questa velocita' d'arrivo nessuno la ferma
const CROSS_GRAZIA = 0.40;   // il respiro concesso all'inserimento: vedi crossBersaglio (B2)`,
},

/* 2 — la grazia dentro crossBersaglio, sul solo candidato in corsa */
{
  nome: '2/2 la grazia per il candidato in corsa d\'area',
  cerca:
`    if(!dentroArea(t, qx, qy)) continue;
    if(crossPortiereCopre(t, qx, qy, T)) continue;`,
  metti:
`    if(!dentroArea(t, qx, qy)){
      /* B2 — IL CROSS SULL'INSERIMENTO (1 settembre 2026): il candidato
         IN CORSA D'AREA vale anche se al tempo di volo e' appena fuori,
         purche' la corsa lo porti dentro entro CROSS_GRAZIA. La mira
         resta la sua proiezione al tempo di volo: il pallone cade sul
         suo binario un soffio prima di lui. Misurato prima della cura:
         a 11 la punta arrivava (min 2-17 unita' dal secondo palo) ma
         MAI nei fotogrammi del portatore pronto — l'appuntamento
         mancava, non la corsa. E' il cross anticipato del calcio vero,
         e il concorrente lo tiene come TIPO dedicato. */
      if(!(q.corsaArea>0
           && dentroArea(t, q.x+q.vx*(T+CROSS_GRAZIA), q.y+q.vy*(T+CROSS_GRAZIA)))) continue;
    }
    if(crossPortiereCopre(t, qx, qy, T)) continue;`,
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
  ['CROSS_GRAZIA', 4],        // costante, commento della costante, verbale, uso
  ['q.corsaArea>0', 2],       // l'isteresi dell'elezione in attaccaArea, e la grazia qui
  ['T+CROSS_GRAZIA', 2],      // le due coordinate della proiezione di grazia
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
