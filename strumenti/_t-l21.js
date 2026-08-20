/* =====================================================================
   _t-l21.js — IL PALLONE SI ALLONTANA DAL PIEDE QUANDO CORRI (voce L2.1)

   Toppa cerca/sostituisci in DUE BLOCCHI attivabili singolarmente:

     --solo a   CARRY_DIST diventa funzione della velocita' del portatore
     --solo b   DIFF[2].steal scende da 1,00 a 0,85 (il tetto)
     (niente --solo: tutti e due)

   Legge CALCETTO-il-gioco.html (o --in), sostituisce ancoraggi ESATTI e
   scrive la copia in --out (senza --out: suffisso .l21.html accanto
   all'input). MAI sull'originale: se --out coincide con --in si ferma.
   Se un ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma con codice
   1, dice quale, e non scrive niente.

   uso:
     node strumenti/_t-l21.js --out fuori/l21.html
     node strumenti/_t-l21.js --solo a --out fuori/l21a.html
     node strumenti/_t-l21.js --solo b --out fuori/l21b.html
     node strumenti/_t-l21.js --elenco

   ---------------------------------------------------------------------
   LA TESI. E' la voce che il progetto (agente28.md §10, L2.1) chiama
   «cio' che rende i verbi meritevoli»: si guida meglio una macchina che
   va sempre alla stessa velocita', quindi senza un gradiente di rischio
   i comandi nuovi non cambiano l'equilibrio.

   MISURATO PRIMA (strumenti/_sonda-l21.js, 20/8/2026, semi fissi):
   oggi il gradiente non solo manca — e' INVERTITO. Il pallone insegue un
   bersaglio fisso a 16 u con ritardo (b.vx=(tx-b.x)*14), e il ritardo
   cresce con la velocita' (~0,055 u per u/s): distanza vera pallone-piede
   16,0 u da fermo, 6,9 u in corsa (166 u/s), 3,8 u in sprint (223 u/s).
   Chi corre a tutta e' il MEGLIO protetto. E al primo contatto frontale
   il passo non sposta nulla: Duro 100% sia in sprint che al trotto
   (60/60 e 60/60), Medio 73,3% contro 65,0% (rumore binomiale, n=60).

   BLOCCO A — la spinta della corsa. Il bersaglio del dribbling diventa
   CARRY_DIST + CARRY_SPINTA*slancio^2, con slancio = frazione di
   velocita' fra 120 e 225 u/s. Il quadrato fa pagare davvero solo chi va
   a tutta; sotto 120 u/s (e mentre si carica un tiro: 75 u/s) NON CAMBIA
   UN BIT rispetto a oggi. E COME DA CORREZIONE §0.3 DEL PROGETTO,
   l'esposizione agisce ATTRAVERSO il test di distanza avversario-pallone
   che gia' esiste in updateBall: il pallone sta davvero piu' lontano dal
   corpo, quindi il difensore davanti ci arriva davvero — non e'
   dichiarato piu' rubabile da un moltiplicatore. Conseguenza voluta e
   realistica: chi insegue da DIETRO un portatore lanciato non arriva piu'
   al pallone senza superarlo, mentre chi gli si para DAVANTI lo becca
   prima e piu' spesso.

   BLOCCO B — il tetto. DIFF[2].steal=1,00 significa che a Duro ogni
   contatto frontale e' una condanna certa: a probabilita' satura ne'
   l'angolo (x0,55 di spalle) ne' la geometria del blocco A possono
   spostare l'esito del contatto. 0,85 lascia respirare il gradiente.
   Verificato che satura SOLO a Duro: steal vale 0,45 / 0,72 / 1,00 e
   l'unico lettore e' updateBall (una occorrenza in 32.323 righe).

   MISURATO DOPO (fuori/l21.html, stessi semi): la consegna della voce
   riporta distanza fermo/corsa/sprint, quota di furto al primo contatto
   per difficolta' e passo, furti col corpo e possesso per taglia e
   difficolta' su partite vere, e l'effetto a 11 contro 11.

   CAMBIA LA SIMULAZIONE AL BIT (blocco A: ogni fotogramma con palla
   posseduta sopra 120 u/s; blocco B: ogni sorteggio di furto a Duro su
   portatore umano). Gli strumenti a seme fisso che confrontano TRACCE o
   ISTANTANEE di partita vanno rifatti dopo l'innesto.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   GLI ANCORAGGI. Testo esatto cercato, testo esatto messo al suo posto.
   Nessuna espressione regolare, nessun numero di riga.
   -------------------------------------------------------------------- */
const ANCORE = [

/* ------------------------------------------------------------ blocco a */
{
  blocco: 'a',
  nome: 'a1/2 le tre costanti della spinta, accanto a CARRY_DIST',
  cerca:
`const CARRY_DIST = 16;             // pallone davanti ai piedi`,
  metti:
`const CARRY_DIST = 16;             // pallone davanti ai piedi (da fermo)
/* LA SPINTA DELLA CORSA (voce L2.1). Chi corre a tutta si spinge il
   pallone piu' avanti, quindi e' DAVVERO piu' esposto: l'esposizione
   passa dal test di distanza avversario-pallone che updateBall fa gia',
   non da un moltiplicatore su stealP (correzione §0.3 del progetto).
   Misurato PRIMA (strumenti/_sonda-l21.js --scena dist, 20/8/2026):
   il pallone insegue il bersaglio con ritardo ~0,055 u per u/s, quindi
   la distanza VERA era 16,0 u da fermo, 6,9 in corsa (166 u/s) e 3,8 in
   sprint (223 u/s) — il rischio era INVERTITO: il piu' veloce era il
   meglio protetto. Sotto CARRY_V0 non cambia un bit rispetto a oggi
   (chi carica un tiro va a 75 u/s: resta protetto), e la spinta e'
   quadratica: paga davvero solo chi va a tutta. */
const CARRY_V0 = 120;              // u/s: sotto, il pallone resta cucito come oggi
const CARRY_V1 = 225;              // u/s: P_SPEED*1.34, corsa a tutta col fiato pieno
const CARRY_SPINTA = 18;           // u di bersaglio in piu' a CARRY_V1`,
},
{
  blocco: 'a',
  nome: 'a2/2 il bersaglio del dribbling segue la velocita',
  cerca:
`      const tx=o.x+o.fx*CARRY_DIST, ty=o.y+o.fy*CARRY_DIST;
      b.vx=(tx-b.x)*14; b.vy=(ty-b.y)*14;`,
  metti:
`      /* il bersaglio si allontana con la velocita' del portatore (L2.1):
         a tutta (~223 u/s) sta a 16+17=33 u, che al netto del ritardo
         dell'inseguitore qui sotto diventano ~21 u VERI dal piede contro
         i 3,8 di prima (misura: _q-l21.js prova A). Cosi' il difensore
         DAVANTI arriva sul pallone senza passare dal corpo, e il furto
         resta un fatto di distanze. */
      const vP=len(o.vx,o.vy);
      const slancio=clamp((vP-CARRY_V0)/(CARRY_V1-CARRY_V0),0,1);
      const avanti=CARRY_DIST+CARRY_SPINTA*slancio*slancio;
      const tx=o.x+o.fx*avanti, ty=o.y+o.fy*avanti;
      b.vx=(tx-b.x)*14; b.vy=(ty-b.y)*14;`,
},

/* ------------------------------------------------------------ blocco b */
{
  blocco: 'b',
  nome: 'b1/1 il tetto di stealP a Duro: 1,00 -> 0,85',
  cerca:
`  { react:0.12, speed:1.00, shotQ:0.78, shotFreq:0.96, shotPow:1.00,
    save:0.74, mateSave:0.28, passErr:0.05, steal:1.00, mateSteal:0.40,
    lead:0.30, standoff:0,  slideP:0.26 },`,
  metti:
`  /* Duro: steal era 1,00 e il primo contatto frontale rubava SEMPRE
     (misurato: 60/60 in sprint E al trotto, _q-l21.js prova B,
     20/8/2026). A probabilita' satura ne' l'angolo (x0,55 di spalle)
     ne' l'esposizione della corsa (L2.1) possono spostare l'esito del
     contatto: qualunque gradiente di rischio muore sul massimo. 0,85 e'
     il tetto: il pressing resta il piu' cattivo dei tre, ma smette di
     essere una condanna certa. */
  { react:0.12, speed:1.00, shotQ:0.78, shotFreq:0.96, shotPow:1.00,
    save:0.74, mateSave:0.28, passErr:0.05, steal:0.85, mateSteal:0.40,
    lead:0.30, standoff:0,  slideP:0.26 },`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l21.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  [' + a.blocco + '] ' + a.nome);
  process.exit(0);
}

const solo = arg('solo', '');
if (solo && solo !== 'a' && solo !== 'b') {
  console.error('FALLITO: --solo accetta a oppure b, non "' + solo + '"');
  process.exit(2);
}
const scelte = ANCORE.filter(a => !solo || a.blocco === solo);

const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l21' + (solo || '') + '.html';
outFile = path.resolve(outFile);
if (outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Questa toppa non scrive mai sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of scelte) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}

/* controlli dopo la sostituzione, per blocco applicato */
const attesi = [];
if (!solo || solo === 'a') {
  attesi.push(['const CARRY_V0 = 120;', 1], ['const CARRY_SPINTA = 18;', 1],
              ['CARRY_SPINTA*slancio*slancio', 1], ['o.fx*CARRY_DIST', 0],
              ['const tx=o.x+o.fx*avanti', 1]);
}
if (!solo || solo === 'b') {
  attesi.push(['steal:0.85', 1], ['steal:1.00', 0]);
}
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${scelte.length} ancoraggi applicati` + (solo ? ` (solo blocco ${solo})` : ' (blocchi a+b)'));
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
