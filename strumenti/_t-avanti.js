/* =====================================================================
   _t-avanti.js — L'ONDA DELLA PROGRESSIONE: l'attacco scala col CAMPO,
   non col passo (23 agosto 2026).

   LA DIAGNOSI (strumenti/_misura-undici.js, 8 partite a seme fisso,
   20260803..20260810): a 11 contro 11 il portatore decide a una mediana
   di 1446 unita' dalla porta quando la soglia di tiro e' 920; su 121
   decisioni a partita, 94 sono «fascia giusta, distanza no»; il pallone
   vive nei decimi centrali del campo (30-70%) e la penetrazione minima
   del portatore si ferma a ~600 unita'. Risultato: 8 tiri a partita
   (contro 10,5 a 5v5), 1 gol in mediana, 40% di 0-0 contro il 33%
   ammesso dal cancello --tre-taglie. Il possesso NON PROGREDISCE.

   LA CAUSA E' UNA SCALA SBAGLIATA. Le distanze d'attacco dell'IA — lo
   slancio dello smarcato che si offre (170, 300 in contropiede) e la
   carota del portatore (120) — scalano con kPasso, che a 11 vale 1,3.
   Ma il campo a 11 e' DUE volte quello a 5 (2300/1150): ogni scambio
   completato guadagnava il 10% del campo invece del 15%, e la catena
   dei passaggi si spegneva a centrocampo. La fisica del pallone questa
   scala la conosce gia' (ATTR_K = 1150/FW): erano le IDEE a non saperla.

   LA CURA: nasce KAVANTI = FW/1150 (1 a 5, 1,4 a 7, 2,0 a 11) e le
   distanze d'attacco lo usano al posto di kPasso. A 5 contro 5 e'
   IDENTICO AL BIT (KAVANTI = kPasso = 1). Un appoggio da 340 unita'
   a 11 arriva sul compagno a 322 unita'/s per la legge della velocita'
   (500 - 0,5249·340): la promessa sta dentro la stessa fisica.

   NON SCALA: lo slancio di TRANSIZIONE (300·kPasso, la palla lunga da
   inseguire: a 340+ morirebbe per strada), lo standoff difensivo,
   l'ultimo uomo, l'uscita del portiere — la difesa tiene il suo passo.
   E il ramo dello smarcato smette di duplicare la formula della
   chiamata: adesso CHIAMA slancioChiamata, una scrittura sola.

   Cancello: strumenti/tutti.js --tre-taglie (gia' ROSSO: 11v11 al 40%
   di 0-0 contro il 33%). Misura di contorno: _misura-undici.js prima
   e dopo (mediana distX alla decisione, tiri, decimi del pallone).

   uso:  node strumenti/_t-avanti.js --out fuori/avanti.html
         node strumenti/_t-avanti.js --dentro
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

/* 1 — la costante nasce accanto a KPASSO */
{
  nome: '1/5 KAVANTI dichiarata',
  cerca:
`let TAGLIA = 5, KPASSO = 1;`,
  metti:
`let TAGLIA = 5, KPASSO = 1, KAVANTI = 1;   // KAVANTI = FW/1150: la frazione VERA del campo (2,0 a 11), dove kPasso si ferma a 1,3`,
},

/* 2 — setTaglia la ricuoce, come ATTR_K */
{
  nome: '2/5 setTaglia ricuoce KAVANTI',
  cerca:
`  TAGLIA=n; KPASSO=T.kPasso;
  FW=T.FW; FH=T.FH; GOAL_H=T.GOAL_H;`,
  metti:
`  TAGLIA=n; KPASSO=T.kPasso;
  FW=T.FW; FH=T.FH; GOAL_H=T.GOAL_H;
  /* la scala vera del campo: 1 a 5, 1,4 a 7, 2,0 a 11. kPasso (1,3 a 11)
     resta alle distanze difensive e di corredo; l'ATTACCO scala con
     questa, perche' il campo si attraversa tutto, non a passi. */
  KAVANTI=FW/1150;`,
},

/* 3 — lo slancio della chiamata */
{
  nome: '3/5 slancioChiamata: il campo, non il passo',
  cerca:
`function slancioChiamata(t){
  const B=G.brain[t];
  return ((B && B.transizione>0) ? 300 : 170)*KPASSO;
}`,
  metti:
`function slancioChiamata(t){
  const B=G.brain[t];
  /* LO SLANCIO SCALAVA COL PASSO (1,3) SU UN CAMPO CHE RADDOPPIA (23 ago
     2026): a 11 ogni scambio guadagnava il 10% del campo invece del 15%,
     e la catena si spegneva a centrocampo — mediana della decisione a
     1446 unita' dalla porta, soglia di tiro a 920, 94 decisioni su 121
     «fascia si' distanza no» (_misura-undici.js, 8 partite). Con KAVANTI
     l'appoggio ordinario fa 340 a 11 e ARRIVA (322 u/s per la legge
     della velocita'). La TRANSIZIONE resta su kPasso: e' la palla lunga
     da inseguire, e a 600 unita' morirebbe per strada (500 - 0,5249·600
     = 185 u/s: non un appoggio, un rimpianto). */
  return (B && B.transizione>0) ? 300*KPASSO : 170*KAVANTI;
}`,
},

/* 4 — lo smarcato smette di duplicare la formula */
{
  nome: '4/5 smarcato: una scrittura sola con la chiamata',
  cerca:
`      /* contropiede: appena si ribalta l'azione i liberi vanno lunghi.
         Distanza assoluta: sulle taglie grandi si allunga con kPasso. */
      const slancio = ((B && B.transizione>0) ? 300 : 170)*KPASSO;`,
  metti:
`      /* contropiede: appena si ribalta l'azione i liberi vanno lunghi.
         La distanza e' la STESSA della chiamata col dito — slancioChiamata,
         una scrittura sola: lo smarcato che si offre da se' e il compagno
         chiamato guardano lontano uguale, e la scala del campo (KAVANTI
         per l'appoggio, kPasso per la transizione) vale per tutti e due. */
      const slancio = slancioChiamata(p.team);`,
},

/* 5 — la carota del portatore */
{
  nome: '5/5 il portatore punta avanti in frazione di campo',
  cerca:
`      p.aiTX=opGoalX===FW?Math.min(FW-70,p.x+120*KPASSO):Math.max(70,p.x-120*KPASSO);`,
  metti:
`      /* la carota scala col campo: a 11 puntare 156 avanti su un campo
         da 2300 e' ripianificare sul posto (KAVANTI: 240, come 120 a 5) */
      p.aiTX=opGoalX===FW?Math.min(FW-70,p.x+120*KAVANTI):Math.max(70,p.x-120*KAVANTI);`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-avanti.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.avanti.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in.');
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
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  ['KAVANTI=FW/1150;', 1],
  ['170*KAVANTI', 1],
  ['const slancio = slancioChiamata(p.team);', 1],
  ['120*KAVANTI', 2],
  ['170)*KPASSO', 0],
  ['120*KPASSO', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
