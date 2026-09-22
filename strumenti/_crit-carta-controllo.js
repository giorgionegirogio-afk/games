/* =====================================================================
   _crit-carta-controllo.js — UN CARATTERE DI CONTROLLO SOLO
   (voce #135, compito 2). Il falso che condanna A3 di `_q-carta.js`.

   CHE COSA FALSIFICA. Il controllo scende da quattro simboli a uno:
   cinque bit invece di venti. E' la scorciatoia piu' naturale che
   esista — `codiceTrasferimento` stesso ne usa tre, il codice si
   accorcia di tre caratteri, e a occhio «un carattere di controllo
   basta»: lo dice anche il mandato di questo cantiere, alla lettera.

   E' IL CASO PEGGIORE: passa A1 (il giro resta l'identita'), passa A2
   (il codice si accorcia, da 79 a 76), passa A4 (i rifiuti sono gli
   stessi) e A5 (le serrature non c'entrano), passa tutto B e tutto C —
   la partita non cambia di un sorteggio.

   Cade su A3a, e cade con un numero: una cifra cambiata su trentadue
   non si vede, cioe' un codice storto su quaranta passa per buono e chi
   lo gioca gioca una partita diversa senza saperlo. Misurato al
   compito 0 su 19.846 mutazioni: 97,52% contro il 100% dei quattro
   simboli. E' il falso che dimostra che A3 misura invece di attestare.

   L'ESITO ATTESO: ROSSO su A3a (e A3b, dove capita), VERDE su A1, A2,
   A4, A5 e su tutto B e C.

   uso:  node strumenti/_crit-carta-controllo.js
         node strumenti/_q-carta.js --solo A,B,C --gioco fuori/gioco-carta-controllo.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-carta-controllo.html'));

const coppie = [
  [`  sim.push((c>>>15) & 31, (c>>>10) & 31, (c>>>5) & 31, c & 31);`,
   `  /* IL FALSO (voce #135, _crit-carta-controllo): un simbolo invece di
     quattro. Tre caratteri risparmiati, e una cifra sbagliata su
     trentadue che passa. */
  sim.push(c & 31);`],
  [`  const corpo = sim.slice(0, sim.length - 4), coda = sim.slice(sim.length - 4);
  const c = cartaControllo(corpo);
  if(coda[0] !== ((c>>>15) & 31) || coda[1] !== ((c>>>10) & 31) ||
     coda[2] !== ((c>>>5) & 31) || coda[3] !== (c & 31)) return { errore:'controllo' };`,
   `  const corpo = sim.slice(0, sim.length - 1), coda = sim.slice(sim.length - 1);
  const c = cartaControllo(corpo);
  if(coda[0] !== (c & 31)) return { errore:'controllo' };`],
];

const src = fs.readFileSync(inFile, 'utf8');
const guai = [];
coppie.forEach(([a], i) => {
  const n = src.split(a).length - 1;
  if (n !== 1) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di 1');
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }
let out = src;
for (const [a, b] of coppie) out = out.replace(a, b);
const attesi = [
  ['sim.push(c & 31);', 1],
  ['sim.push((c>>>15) & 31', 0],
  ['function impaccaCarta(o){', 1],
  ['function spaccaCarta(testo){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il controllo da un carattere solo e\' pronto (5 bit invece di 20)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-carta.js --solo A,B,C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su A3a, VERDE su A1, A2, A4, A5, B e C');
