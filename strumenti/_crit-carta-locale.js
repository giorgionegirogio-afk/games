/* =====================================================================
   _crit-carta-locale.js — LA PARTITA CHE ASCOLTA IL TELEFONO
   (voce #135, compito 2). Il falso che condanna C1 di `_q-carta.js`.

   CHE COSA FALSIFICA. `apriCarta` smette di forzare le sponde e la mira
   guidata e legge quelle del salvataggio, «per rispettare le
   impostazioni di chi gioca». E' la cortesia che ha gia' fatto danno
   due volte in questo gioco: la voce #87 (rilievo C1 della revisione
   finale) e la voce #113, compito 1, hanno messo quelle due righe
   proprio per togliere di mezzo questo canale dalle sfide di rete.

   E' IL CASO PEGGIORE: il codice non e' toccato di un bit, quindi passa
   tutto il gruppo A — giro, lunghezza, controllo esaustivo, rifiuti,
   serrature — e tutto il gruppo B, perche' l'identita' non c'entra
   niente. Passa anche C2 e C3, dove il punteggio da battere viene dal
   codice e non dalla partita.

   Cade su C1: due telefoni con `SAVE.sponde` diversa giocano lo stesso
   codice su due motori diversi — uno in gabbia, l'altro a campo vero —
   e la sfida di carta smette di essere una sfida.

   L'ESITO ATTESO: ROSSO su C1, VERDE su A, B, C2 e C3.

   uso:  node strumenti/_crit-carta-locale.js
         node strumenti/_q-carta.js --solo A,B,C --gioco fuori/gioco-carta-locale.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-carta-locale.html'));

const A = `    size: o.taglia|0,
    sponde: 'gabbia',
    miraGuidata: 'pieno',`;
const B = `    size: o.taglia|0,
    /* IL FALSO (voce #135, _crit-carta-locale): «rispettiamo le
       impostazioni di chi gioca». Le due righe che le voci #87 e #113
       hanno messo apposta per togliere questo canale dalle sfide. */
    sponde: (SAVE.sponde === 'campo' ? 'campo' : 'gabbia'),
    miraGuidata: (SAVE.miraGuidata || 'pieno'),`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ["sponde: (SAVE.sponde === 'campo' ? 'campo' : 'gabbia'),", 1],
  ['function impaccaCarta(o){', 1],          /* il codice non e' toccato */
  ['function spaccaCarta(testo){', 1],
  ['sim.push((c>>>15) & 31', 1],
  ["      sponde: 'gabbia',", 3],             /* le tre delle sfide di rete restano intatte */
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la partita che ascolta il telefono e\' pronta (sponde e mira guidata dal salvataggio)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-carta.js --solo A,B,C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su C1, VERDE su A, B, C2 e C3');
