/* =====================================================================
   _toppa-duello-tacca.js — LA MIRA SI POSA SU UNA TACCA INTERA
   (voce #131, compito 3). Una sola ancora.

   IL PROBLEMA. Nel nastro non possono entrare clientX/clientY. duelMira
   ricava u,v da duelGeo(), che dipende da VW/VH e dalle altezze VERE di
   .duelhead e .duelfoot lette dal DOM (:37821-37842): lo stesso dito
   nello stesso punto dello schermo, su due telefoni di forma diversa,
   produce due mire diverse. Nel nastro deve entrare la MIRA (u,v), non
   il pixel.

   E ALLORA LA MIRA DEVE STARE IN UN NUMERO CHE TORNA. Nel nastro i
   numeri sono interi (grep «i numeri sono interi»): u e v ci entrano
   moltiplicati per mille e arrotondati. Se il gioco vivo usasse la u
   piena a doppia precisione e il nastro ne portasse solo tre decimali,
   la partita rigiocata comincerebbe a divergere dal primo rigore — e
   non di molto, il che e' peggio: divergerebbe in silenzio.

   LA CURA E' LA STESSA GIA' SCRITTA PER IL DITO, un ripiano piu' in
   basso (grep «IL DITO SI POSA SU UN PIXEL INTERO»): si arrotonda ALLA
   SORGENTE e in TUTTE E TRE LE MODALITA', non solo in registrazione. Se
   si arrotondasse solo quando il registro e' acceso, la partita di rete
   sarebbe un gioco leggermente diverso da quello di casa.

   UN MILLESIMO NON E' NIENTE. u vive in [-1,258; +1,258] e v in
   [0,21; 0,80]: un millesimo di u e' meno di un pixel su una porta
   larga mezzo schermo, e la banda piu' stretta che il gioco sappia
   posare (0,095) e' novantacinque volte piu' larga.

   E IL TERZO SI RICAVA DALLA u GIA' ARROTONDATA. Cosi' il terzo che
   decide l'esito e il punto che il nastro porta non possono divergere:
   chi rilegge ricostruisce dall'uno l'altro e trova lo stesso numero.

   LA CPU NON SE NE ACCORGE, ed e' verificabile a mente prima che al
   banco: per la CPU pickZone(z) arriva senza u e v, e :22330-31 inventa
   u = z-1 in {-1,0,1} e v = 0,50 — tutti gia' esatti al millesimo — e
   `mirato` resta falso (:22340). duelMira la CPU non la chiama mai.

   uso:  node strumenti/_toppa-duello-tacca.js --out fuori/x.html
         node strumenti/_toppa-duello-tacca.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/duello-tacca.html'));

const ANCORE = [
{
  nome: '1/1 duelMira quantizza u,v a un millesimo',
  cerca:
`  const u=(mx-VW/2)/(g.GW*0.31);
  const v=(my-g.gy0)/g.GH;
  /* il terzo: e' il mirino a dirlo, con le due soglie a meta' strada fra
     un bersaglio e l'altro */
  const z = u<-0.5 ? 0 : (u>0.5 ? 2 : 1);
  return {u, v, z};`,
  metti:
`  /* =====================================================================
     LA MIRA SI POSA SU UNA TACCA INTERA, SEMPRE (voce #131, compito 3).

     E' la stessa legge del pixel intero del dito (grep «IL DITO SI POSA
     SU UN PIXEL INTERO»), e per la stessa ragione: nel nastro non possono
     entrare clientX/clientY, perche' u e v dipendono da duelGeo(), cioe'
     da VW/VH e dalle altezze vere delle due fasce lette dal DOM. Lo
     stesso dito nello stesso punto dello schermo, su due telefoni di
     forma diversa, da' due mire diverse. Nel nastro entra la MIRA.

     E allora la mira deve stare in un numero che TORNA. Nel nastro i
     numeri sono interi: u e v ci entrano per mille e arrotondati. Se qui
     restasse la u piena a doppia precisione, la partita rigiocata
     divergerebbe dal primo rigore — e di pochissimo, cioe' in silenzio.

     Si arrotonda QUI e in TUTTE E TRE LE MODALITA', non solo quando il
     registro e' acceso: se no il gioco di rete sarebbe un gioco
     leggermente diverso da quello di casa. Un millesimo non e' niente —
     u vive in [-1,258; +1,258] e la banda piu' stretta che il gioco
     sappia posare, 0,095, e' novantacinque volte piu' larga.
     ===================================================================== */
  const u=Math.round(((mx-VW/2)/(g.GW*0.31))*1000)/1000;
  const v=Math.round(((my-g.gy0)/g.GH)*1000)/1000;
  /* il terzo: e' il mirino a dirlo, con le due soglie a meta' strada fra
     un bersaglio e l'altro — e lo dice sulla u GIA' arrotondata, cosi'
     il terzo che decide l'esito e il punto che il nastro porta non
     possono divergere di un capello (voce #131) */
  const z = u<-0.5 ? 0 : (u>0.5 ? 2 : 1);
  return {u, v, z};`,
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
  ['const u=Math.round(((mx-VW/2)/(g.GW*0.31))*1000)/1000;', 1],
  ['const v=Math.round(((my-g.gy0)/g.GH)*1000)/1000;', 1],
  ['const z = u<-0.5 ? 0 : (u>0.5 ? 2 : 1);', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
