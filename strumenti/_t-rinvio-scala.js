/* =====================================================================
   _t-rinvio-scala.js — IL RINVIO A PUGNO SI ALLUNGA IN PROPORZIONE
   ALL'AREA (voce #100).

   IL COMMITTENTE (7 settembre 2026, testuale): «Allungare il rinvio in
   proporzione cosi' da renderlo piu' realistico al calcio vero».

   IL CONTESTO. Con l'area vera della voce #86 (profondita' 173/268/361
   a 5/7/11, VERNICI[n].areaProf), il rinvio a pugno del portiere -
   storicamente atterrava fra 242 e 590 unita' dal portiere, sempre fuori
   dall'area su tutte e tre le taglie - ora PUO' cadere DENTRO l'area a 7
   e a 11 (242<268, 242<361: rettificato nel commento accanto al ramo
   PUGNI di tentaPresa, CALCETTO-il-gioco.html riga ~18635, alla revisione
   finale della voce #86). Il committente decide di scalare le distanze
   invece di lasciarle ferme, cosi' la proprieta' storica torna vera a
   ogni taglia con numeri realistici.

   IL MECCANISMO VERO (letto nel codice prima di scrivere questa cura, non
   assunto dal commento). Il ramo PUGNI di tentaPresa non tira una
   distanza: tira TRE velocita' indipendenti (vx avanti, vy laterale, vz
   verticale) e lascia che gravita' e tempo facciano il resto:

     b.vx = dir*rnd(430,620);   b.vy = fuori*rnd(140,300);   b.vz = rnd(150,240);

   Il tempo di volo e' t = 2*vz/560 (560 = gravita' del pallone libero,
   CALCETTO-il-gioco.html:18032, b.vz-=560*dt), e la distanza dal
   portiere e' t*hypot(vx,vy) — non solo vx: il commento storico "242 a
   590" torna esattamente da questa formula usando gli estremi delle tre
   bande (verificato a mano: 0,5357*hypot(430,140)=242,2 e
   0,8571*hypot(620,300)=590,4 prima di scrivere una riga di cura).
   LA CURA scala quindi vx e vy — le due componenti ORIZZONTALI, quelle
   che decidono quanto lontano arriva — e lascia vz intatto: e' lo stesso
   gesto delle mani a ogni taglia, cambia solo quanto il pugno COPRE.

   LA SCALA, "una fonte sola, stile tavola": GK_PUGNO_SCALA =
   VERNICE.areaProf / VERNICI[5].areaProf. A taglia 5 VERNICE e' proprio
   VERNICI[5] al boot (vedi VERNICI in CALCETTO-il-gioco.html, tavola
   della voce #86), quindi il fattore e' letteralmente 1 e la taglia 5
   resta IDENTICA AL BIT — non un caso, e' la stessa lezione gia' pagata
   per GK_AREA_X (rilievo critico voce #86 compito 5: un letterale di
   boot vale solo se a taglia 5 il conto torna all'identita'). Per questo
   GK_PUGNO_SCALA e' un `let`, come GK_AREA_X, e si ricuoce in setTaglia
   dalla stessa tavola VERNICI — non un numero eletto a mano per le tre
   taglie: se VERNICI cambiasse ancora, questo fattore la seguirebbe da
   solo.

   I NUMERI CHE NE ESCONO (fattore 268/173=1,549 a 7, 361/173=2,087 a 11,
   arrotondati a tre cifre): a 5 l'atterraggio resta 242-590 (fattore 1);
   a 7 diventa 375-914; a 11 diventa 505-1231 unita' — 23-56 m a 21,90
   unita'/metro (rapporto della voce #86, _q-proporzioni.js), un rinvio a
   pugno realistico. La prova che l'area torna sempre superata sta in
   strumenti/_q-proporzioni.js.

   QUATTRO ANCORE: la costante della scala, il ramo PUGNI col suo
   commento rettificato di nuovo, la ricottura in setTaglia, e
   l'esportazione __test (per il banco). Elencate sotto.

   DIVERGENZA ATTESA: a taglia 5 zero bit di differenza (fattore 1); a 7
   e a 11 il due-versioni deve DIVERGERE sui rinvii a pugno — ma il pugno
   scatta solo dopo una presa forte del portiere, quindi due partite CPU
   contro CPU a seme fisso potrebbero non generarne nessuno: non e' un
   difetto di questa cura, e' la rarita' dell'evento (si dimostra la
   divergenza forzando il ramo PUGNI col banco, non aspettandola dal
   caso).

   uso:  node strumenti/_t-rinvio-scala.js --out fuori/rinvio-scala.html
         node strumenti/_t-rinvio-scala.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/rinvio-scala.html'));

const ANCORE = [

/* 1 — la costante della scala, dichiarata accanto alle altre tre
   costanti dei "quattro esiti della parata" (GK_PUGNO_Z, GK_SFUGGE). Un
   `let`, non un `const`: si ricuoce in setTaglia come GK_AREA_X. */
{
  nome: '1/4 GK_PUGNO_SCALA dichiarata accanto a GK_PUGNO_Z/GK_SFUGGE',
  cerca:
`const GK_SFUGGE  = 1.60;     // fin dove ci prova con le mani, in multipli della soglia`,
  metti:
`const GK_SFUGGE  = 1.60;     // fin dove ci prova con le mani, in multipli della soglia
/* IL RINVIO A PUGNO SI ALLUNGA IN PROPORZIONE ALL'AREA (voce #100,
   decisione del committente del 7 settembre 2026: "allungare il rinvio
   in proporzione cosi' da renderlo piu' realistico al calcio vero").
   E' un \`let\` come GK_AREA_X qui sopra e per la STESSA ragione
   (rilievo critico voce #86 compito 5): il letterale di boot vale SOLO
   perche' a taglia 5 VERNICE e' gia' VERNICI[5], quindi il fattore nasce
   1 per costruzione, non per un numero scelto a mano. Si ricuoce in
   setTaglia insieme a GK_AREA_X, dalla stessa tavola VERNICI. Il conto e
   la misura per intero stanno in strumenti/_t-rinvio-scala.js. */
let GK_PUGNO_SCALA = VERNICE.areaProf / VERNICI[5].areaProf;   // 1 a 5, ~1,549 a 7, ~2,087 a 11`,
},

/* 2 — il ramo PUGNI: vx e vy (le componenti orizzontali, quelle che
   decidono la distanza) scalano; vz (il gesto verticale delle mani) no.
   Il commento si rifa' con la rettifica della voce #100 sopra a quella
   gia' scritta per la voce #86, in chiaro come le altre edizioni di
   questa casa. */
{
  nome: '2/4 vx/vy del pugno scalano per GK_PUGNO_SCALA, il commento si rettifica di nuovo',
  cerca:
`    b.vx = dir*rnd(430,620);
    b.vy = fuori*rnd(140,300);
    b.vz = rnd(150,240);
    /* LA CLIP ADESSO C'E', ed e' fatta e non riciclata: 'pugni', i due
       pugni che partono insieme avanti e in alto col bacino sulle punte.
       Riusare 'presa' sarebbe stato disegnare una bugia — p.presaT e' i
       guantoni sopra la testa CON il pallone fermo nelle mani, e
       pallaPresa lo disegna mentre ci scende dentro. Su un pugno il
       pallone se ne va.
       Con vz fra 150 e 240 e gravita' 560 il volo dura da 0,54 a 0,86 s
       e il pallone tocca terra fra 242 e 590 unita' dal portiere.
       RETTIFICATO (voce #86, ritocchi della revisione finale, 7
       settembre 2026): con l'area vera GK_AREA_X vale 173, 268, 361 a
       5/7/11 — a 5 l'atterraggio resta sempre fuori dall'area
       (242>173), ma a 7 e a 11 PUO' cadere dentro (242-268 a 7,
       242-361 a 11). La proprieta' storica "sempre fuori dall'area" non
       vale piu' a 7/11: decisione rimandata alla voce a registro
       (MANUALE.md, voce #86). */`,
  metti:
`    b.vx = dir*rnd(430,620)*GK_PUGNO_SCALA;
    b.vy = fuori*rnd(140,300)*GK_PUGNO_SCALA;
    b.vz = rnd(150,240);
    /* LA CLIP ADESSO C'E', ed e' fatta e non riciclata: 'pugni', i due
       pugni che partono insieme avanti e in alto col bacino sulle punte.
       Riusare 'presa' sarebbe stato disegnare una bugia — p.presaT e' i
       guantoni sopra la testa CON il pallone fermo nelle mani, e
       pallaPresa lo disegna mentre ci scende dentro. Su un pugno il
       pallone se ne va.
       Con vz fra 150 e 240 e gravita' 560 il volo dura da 0,54 a 0,86 s,
       INVARIATO dalla scala: e' lo stesso gesto delle mani a ogni
       taglia, cambia solo quanto lontano il pugno ARRIVA (vx, vy), non
       quanto sale (vz).
       RETTIFICATO (voce #86, ritocchi della revisione finale, 7
       settembre 2026): con l'area vera GK_AREA_X a 173/268/361 (5/7/11),
       il vecchio atterraggio fra 242 e 590 unita' restava sempre fuori
       area a 5 (242>173) ma POTEVA cadere dentro a 7 e a 11 (242-268 a
       7, 242-361 a 11): la proprieta' storica "sempre fuori dall'area"
       si rompeva proprio dove l'area era diventata vera.
       RETTIFICATO DI NUOVO (voce #100, 7 settembre 2026). Il committente
       decide: «allungare il rinvio in proporzione cosi' da renderlo piu'
       realistico al calcio vero». vx e vy scalano per GK_PUGNO_SCALA =
       VERNICE.areaProf/VERNICI[5].areaProf; vz resta com'era, perche' e'
       il gesto delle mani a non cambiare, non la distanza che il pugno
       copre. A 5 il fattore e' 1 (taglia IDENTICA al bit): l'atterraggio
       resta 242-590. A 7 (fattore 1,549) diventa 375-914; a 11 (fattore
       2,087) diventa 505-1231 unita' (23-56 m a 21,90 unita'/metro,
       rapporto della voce #86) — un rinvio a pugno realistico. La
       proprieta' storica "sempre fuori dall'area" torna vera a ogni
       taglia: misurato in strumenti/_q-proporzioni.js, prova "il rinvio
       a pugno atterra fuori dall'area". */`,
},

/* 3 — la ricottura in setTaglia, accanto a GK_AREA_X: stessa porta,
   stesso momento, stessa tavola VERNICI. */
{
  nome: '3/4 GK_PUGNO_SCALA ricotta in setTaglia accanto a GK_AREA_X',
  cerca:
`  GK_AREA_X=VERNICE.areaProf;`,
  metti:
`  GK_AREA_X=VERNICE.areaProf;
  GK_PUGNO_SCALA=VERNICE.areaProf/VERNICI[5].areaProf;   // voce #100: il rinvio a pugno scala con l'area, ricotto qui come GK_AREA_X`,
},

/* 4 — l'esportazione al banco: __test.proporzioni() porta anche il
   fattore, per chi deve leggerlo dal vivo invece di ricopiarlo a mano
   (stessa ragione per cui porta gia' GK_AREA_X). */
{
  nome: '4/4 GK_PUGNO_SCALA esportata in __test.proporzioni()',
  cerca:
`  proporzioni(){ return {TAGLIA,FW,FH,GOAL_H,GK_AREA_X,P_R,B_R,KICK_R,POST_R,SEP_R,P_SPEED,
                          VERNICE: Object.assign({},VERNICE)}; },`,
  metti:
`  proporzioni(){ return {TAGLIA,FW,FH,GOAL_H,GK_AREA_X,GK_PUGNO_SCALA,P_R,B_R,KICK_R,POST_R,SEP_R,P_SPEED,
                          VERNICE: Object.assign({},VERNICE)}; },`,
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
/* CONTEGGI A DELTA */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['let GK_PUGNO_SCALA = VERNICE.areaProf / VERNICI[5].areaProf;', 1],
  ['b.vx = dir*rnd(430,620)*GK_PUGNO_SCALA;', 1],
  ['b.vy = fuori*rnd(140,300)*GK_PUGNO_SCALA;', 1],
  ['GK_PUGNO_SCALA=VERNICE.areaProf/VERNICI[5].areaProf;', 1],
  ['GK_PUGNO_SCALA,P_R,B_R', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
