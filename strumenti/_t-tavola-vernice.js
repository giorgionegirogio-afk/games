/* =====================================================================
   _t-tavola-vernice.js — LA TAVOLA DELLE VERNICI (voce #86, compito 1,
   primo compito del ramo voce-86-proporzioni).

   IL PERCHE'. Fino a ieri il pennello del campo (dipingiCampo) portava i
   numeri del gesso scritti a mano, uguali su ogni taglia: 62 (cerchio),
   14 (angolo), 66 (arco della mezzaluna), 118/230/112 (area e dischetto,
   gia' scalati da kPasso/GOAL_H). Nessuna di queste cifre viene da una
   misura vera — sono nate a occhio, e la voce #86 le sostituisce con la
   scala dei campi ufficiali (FIFA futsal, UISP amatoriale, IFAB).

   QUESTO COMPITO NON CAMBIA UN SOLO VALORE: e' un RINOMINO PURO. I
   letterali del pennello diventano una tavola per taglia (VERNICI),
   ricotta in setTaglia dentro la variabile VERNICE, ma i NUMERI dentro
   la tavola sono esattamente quelli che il pennello produce oggi
   (62/14/66 su ogni taglia, 118/230/112 * kPasso/GOAL_H arrotondati =
   112/129/146 e 118/136/153). Il confronto due-versioni (_c3-sorteggi)
   deve restare a ZERO partite divergenti su tutte le taglie: se cambia
   anche un bit, questo attrezzo ha sbagliato, non il gioco.

   I compiti 4/5 della stessa voce porteranno i VALORI dentro VERNICI
   alle misure vere (cerchio 86/106/200, area 173/268/361, eccetera): la
   forma dell'oggetto — {cerchio, cerchio2, angolo, dischetto,
   dischetto2, dArco, areaProf, areaSemi, portaProf, portaLargh} — nasce
   qui e non cambia mai piu'. areaSemi/dischetto2/portaProf/portaLargh
   valgono 0 perche' oggi non esiste ne' un secondo dischetto ne' un'area
   di porta disegnata ne' una regola dell'area che non sia GOAL_H*0.77:
   il compito 2 li accendera' uno alla volta.

   LEGGE DEI SORTEGGI: zero chiamate nuove a dado(). Il pennello del
   campo e setTaglia non ne fanno mai (letto qui prima di scrivere questo
   attrezzo) — sono geometria di disegno e di regola, non intelligenza
   artificiale.

   uso:  node strumenti/_t-tavola-vernice.js --out fuori/tavola-vernice.html
         node strumenti/_t-tavola-vernice.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/tavola-vernice.html'));

const ANCORE = [

/* 1 — la tavola nasce accanto a TAGLIE, che il grep del Passo 1 trova
   dalla dichiarazione `const TAGLIE={...}`. Il codice qui sotto e' l'ULTIMA
   voce della tavola (11 contro 11) piu' la sua parentesi di chiusura: e'
   il modo di ancorarsi ALLA FINE di TAGLIE senza dover ripetere l'intero
   oggetto (le taglie 5 e 7 comparirebbero altrove nel file e romperebbero
   l'unicita' dell'ancora). */
{
  nome: '1/3 VERNICI nasce accanto a TAGLIE',
  cerca:
`  11:{ FW:2300, FH:1120, GOAL_H:196, kPasso:1.3,  nome:'11 CONTRO 11',
      modulo:[ {gk:1},
        {fx:0.40,fy:-0.10,lato:-1}, {fx:0.40,fy:0.10,lato:1},
        {fx:0.27,fy:-0.36,lato:-1}, {fx:0.27,fy:-0.12,lato:0}, {fx:0.27,fy:0.12,lato:0}, {fx:0.27,fy:0.36,lato:1},
        {fx:0.13,fy:-0.34,lato:-1}, {fx:0.13,fy:-0.115,lato:0}, {fx:0.13,fy:0.115,lato:0}, {fx:0.13,fy:0.34,lato:1} ] },
};`,
  metti:
`  11:{ FW:2300, FH:1120, GOAL_H:196, kPasso:1.3,  nome:'11 CONTRO 11',
      modulo:[ {gk:1},
        {fx:0.40,fy:-0.10,lato:-1}, {fx:0.40,fy:0.10,lato:1},
        {fx:0.27,fy:-0.36,lato:-1}, {fx:0.27,fy:-0.12,lato:0}, {fx:0.27,fy:0.12,lato:0}, {fx:0.27,fy:0.36,lato:1},
        {fx:0.13,fy:-0.34,lato:-1}, {fx:0.13,fy:-0.115,lato:0}, {fx:0.13,fy:0.115,lato:0}, {fx:0.13,fy:0.34,lato:1} ] },
};
/* LA TAVOLA DELLE VERNICI (voce #86, compito 1). Ogni riga di gesso e ogni
   scatola della regola prende il numero DA QUI, per taglia: il pennello e
   dentroArea non possono piu' divergere perche' leggono lo stesso posto.
   OGGI la tavola replica i valori storici al bit (62/14/66, 118/230/112):
   i compiti 4 e 5 la porteranno alle misure vere. areaSemi=0 significa
   "usa GOAL_H*0.77 come sempre" finche' il compito 5 non decide. */
const VERNICI={
  5:{ cerchio:62, angolo:14, dArco:66, dischetto:112, dischetto2:0,
      areaProf:118, areaSemi:0, portaProf:0, portaLargh:0 },
  7:{ cerchio:62, angolo:14, dArco:66, dischetto:129, dischetto2:0,
      areaProf:136, areaSemi:0, portaProf:0, portaLargh:0 },
  11:{ cerchio:62, angolo:14, dArco:66, dischetto:146, dischetto2:0,
      areaProf:153, areaSemi:0, portaProf:0, portaLargh:0 },
};
let VERNICE=VERNICI[5];`,
},

/* 2 — il pennello: la dichiarazione locale di AREA_W/AREA_H/DISCH legge
   la tavola invece dei letterali scalati a mano. AREA_H mantiene il
   vecchio nome (le righe a valle, gRett incluso, non si toccano) ma la
   sua formula lascia gia' pronto il posto per areaSemi (compito 5): con
   areaSemi 0 il risultato e' bit-a-bit lo stesso di oggi, perche'
   dividere e moltiplicare per 2 un intero non perde precisione in IEEE
   754. Gli archi (cerchio, cerchio2, angolo, dArco) leggono la tavola al
   posto dei letterali 62/63,8/14/66. */
{
  nome: '2/3 il pennello legge VERNICE invece dei letterali',
  cerca:
`  const AREA_W=Math.round(118*KPASSO), AREA_H=Math.round(230*GOAL_H/150), DISCH=Math.round(112*KPASSO);`,
  metti:
`  const AREA_W=VERNICE.areaProf, AREA_H=(VERNICE.areaSemi||Math.round(230*GOAL_H/150)/2)*2, DISCH=VERNICE.dischetto;`,
},
{
  nome: '2b/3 il cerchio di centrocampo legge VERNICE.cerchio',
  cerca:
`  gArco(FW/2,FH/2,62, 0,6.2832, 0.92, 9);`,
  metti:
`  gArco(FW/2,FH/2,VERNICE.cerchio, 0,6.2832, 0.92, 9);`,
},
{
  nome: '2c/3 gli archi d\'angolo leggono VERNICE.angolo',
  cerca:
`    gArco(ax,ay,14, a0,a0+Math.PI/2, 0.92, 2);`,
  metti:
`    gArco(ax,ay,VERNICE.angolo, a0,a0+Math.PI/2, 0.92, 2);`,
},
{
  nome: '2d/3 la mezzaluna dell\'area legge VERNICE.dArco',
  cerca:
`    if(side) gArco(dx0,FH/2,66, Math.PI*0.62, Math.PI*1.38, 0.92, 5);
    else     gArco(dx0,FH/2,66, -Math.PI*0.38, Math.PI*0.38, 0.92, 5);`,
  metti:
`    if(side) gArco(dx0,FH/2,VERNICE.dArco, Math.PI*0.62, Math.PI*1.38, 0.92, 5);
    else     gArco(dx0,FH/2,VERNICE.dArco, -Math.PI*0.38, Math.PI*0.38, 0.92, 5);`,
},
{
  nome: '2e/3 la seconda mano del cerchio legge VERNICE.cerchio+1.8',
  cerca:
`  gArco(FW/2,FH/2,63.8, 0,6.2832, 0.15, 9);`,
  metti:
`  gArco(FW/2,FH/2,VERNICE.cerchio+1.8, 0,6.2832, 0.15, 9);`,
},

/* 3 — setTaglia ricuoce VERNICE, ACCANTO A KPASSO e PRIMA di
   RESIZE_FORZA=true (che ricostruisce fieldTex): il pennello dipinge
   dentro quella texture, e se VERNICE cambiasse dopo la ricostruzione la
   texture nascerebbe con la tavola vecchia. */
{
  nome: '3/3 setTaglia ricuoce VERNICE accanto a KPASSO',
  cerca:
`  TAGLIA=n; KPASSO=T.kPasso;`,
  metti:
`  TAGLIA=n; KPASSO=T.kPasso; VERNICE=VERNICI[n];`,
},

/* 4 — window.__test.proporzioni(), accanto a get campo(): la stessa
   idea (i derivati di caricamento, letti per l'assert di coerenza del
   collaudo), ma per la tavola delle vernici invece che per FW/FH/GY.
   E' una FUNZIONE, non una fotografia: legge VERNICE al momento della
   chiamata, dopo che startMatch ha gia' fatto la sua setTaglia. */
{
  nome: '4/4 window.__test.proporzioni() nasce accanto a get score()',
  cerca:
`  get score(){ return G.score; },`,
  metti:
`  /* LA TAVOLA DELLE VERNICI, per il banco (voce #86, compito 1). Una
     funzione e non un valore congelato: letta DOPO startMatch/setTaglia,
     riflette sempre la taglia in cui la partita e' davvero entrata. */
  proporzioni(){ return {TAGLIA,FW,FH,GOAL_H,GK_AREA_X,P_R,B_R,KICK_R,POST_R,SEP_R,P_SPEED,
                          VERNICE: Object.assign({},VERNICE)}; },
  get score(){ return G.score; },`,
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
/* CONTEGGI A DELTA (come in _t-raddoppio-tenuta.js): il file puo' gia'
   contenere altri commenti che citano questi stessi frammenti. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['const VERNICI={', 1],
  ['let VERNICE=VERNICI[5];', 1],
  ['const AREA_W=VERNICE.areaProf, AREA_H=(VERNICE.areaSemi||Math.round(230*GOAL_H/150)/2)*2, DISCH=VERNICE.dischetto;', 1],
  ['gArco(FW/2,FH/2,VERNICE.cerchio, 0,6.2832, 0.92, 9);', 1],
  ['gArco(ax,ay,VERNICE.angolo, a0,a0+Math.PI/2, 0.92, 2);', 1],
  ['gArco(dx0,FH/2,VERNICE.dArco,', 2],
  ['gArco(FW/2,FH/2,VERNICE.cerchio+1.8, 0,6.2832, 0.15, 9);', 1],
  ['VERNICE=VERNICI[n];', 1],
  ['proporzioni(){ return {TAGLIA,FW,FH,GOAL_H,GK_AREA_X,P_R,B_R,KICK_R,POST_R,SEP_R,P_SPEED,', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
