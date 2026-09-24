/* =====================================================================
   _toppa-149-cbrt.js — LA TAVOLA K DELLA SHA-256 NON SI CALCOLA PIU'
   (voce #149, compito 3)

   IL RILIEVO. `Math.cbrt` era l'UNICA trascendente del gioco fuori dalle
   sette che `_q-casa` misura e che `improntaMotore` campiona (sin, cos,
   tan, atan2, exp, log, hypot). Margine misurato fra i tre motori: 6483
   ulp. Oggi non morde — le 64 costanti escono identiche su chromium,
   webkit e firefox — ma la catena e' questa, ed e' scomoda:

     Math.cbrt -> DS_K -> dsSha256 -> dsImpegno -> «impegno-non-torna»

   cioe' L'UNICA ACCUSA di tutto il cantiere del dischetto. Due telefoni
   che dessero `cbrt` diverso, e la stessa impronta sulle sette
   campionate, si accuserebbero a vicenda di barare. La probabilita' e'
   piccola; la conseguenza no.

   LA CURA NON E' COPRIRLA, E' TOGLIERLA. Le 64 costanti K della SHA-256
   NON sono un calcolo del gioco: sono una TAVOLA dello standard (FIPS
   180-4), le stesse identiche in ogni implementazione al mondo. Le
   ricavava da `Math.cbrt` per non scrivere 64 numeri — e in cambio
   metteva una trascendente dentro la funzione da cui dipende un'accusa.
   Adesso la tavola sta scritta, con accanto la ricetta che l'ha
   prodotta, e `Math.cbrt` non compare piu' nel gioco.

   NON CAMBIA UN BIT DI COMPORTAMENTO, e non e' una promessa: i 64 numeri
   qui sotto sono esattamente quelli che il ramo vecchio produce su questo
   motore, e `strumenti/_q-sha256.js` lo verifica su 409 casi contro la
   SHA-256 di Node (piu' i tre bordi di riempimento e il testimone).
   MOTORE_V non si muove: non cambia nessun verdetto su nessun nastro.

   uso:  node strumenti/_toppa-149-cbrt.js [file.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const FILE = process.argv[2] ? path.resolve(RADICE, process.argv[2])
                             : path.join(RADICE, 'CALCETTO-il-gioco.html');
if (!fs.existsSync(FILE)) { console.error('TOPPA NON APPLICATA: ' + FILE + ' non esiste'); process.exit(1); }

const A = `const DS_K = (function(){
  const k = [], p = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,
             137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311];
  for(let i=0;i<64;i++) k.push(Math.floor((Math.cbrt(p[i]) % 1) * 4294967296) >>> 0);
  return k;
})();`;

const B = `/* =====================================================================
   LE 64 COSTANTI K, SCRITTE E NON CALCOLATE (voce #149).

   COM'ERA, E PERCHE' NON VA PIU' BENE. Fino a ieri questa tavola nasceva
   da \`Math.cbrt\` sui primi 64 numeri primi:

     for(let i=0;i<64;i++) k.push(Math.floor((Math.cbrt(p[i]) % 1) * 4294967296) >>> 0);

   Elegante e sbagliato di posto. \`Math.cbrt\` era l'UNICA trascendente del
   gioco fuori dalle sette che improntaMotore campiona (sin, cos, tan,
   atan2, exp, log, hypot) e che _q-casa misura: margine fra i tre motori
   6483 ulp. Oggi le 64 costanti escono identiche su tutti e tre — MISURATO
   — ma la catena era \`Math.cbrt -> DS_K -> dsSha256 -> dsImpegno ->
   impegno-non-torna\`, cioe' l'UNICA accusa di tutto il cantiere del
   dischetto. Due telefoni con la stessa impronta sulle sette campionate e
   un \`cbrt\` diverso si sarebbero accusati a vicenda di barare.

   E LA CURA NON E' COPRIRE LA TRASCENDENTE, E' TOGLIERLA: queste non sono
   un conto del gioco, sono una TAVOLA DELLO STANDARD (FIPS 180-4, i primi
   32 bit della parte frazionaria della radice cubica dei primi 64 numeri
   primi). Scriverle costa settecento byte e toglie una dipendenza dal
   motore JavaScript da sotto l'unica accusa che il gioco sa fare.

   LA RICETTA RESTA SCRITTA, cosi' chi vuole puo' rifarle:
     Math.floor((Math.cbrt(primo) % 1) * 2**32) >>> 0
   e strumenti/_q-sha256.js verifica il risultato contro la SHA-256 di
   Node su 409 casi, i tre bordi di riempimento e un testimone.
   ===================================================================== */
const DS_K = [
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
];`;

let t = fs.readFileSync(FILE, 'utf8');
const n = t.split(A).length - 1;
if (n !== 1) { console.error('TOPPA NON APPLICATA: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(A, B);
/* LA PROVA CHE IL CONTO E' SPARITO guarda il COSTRUTTORE, non il nome
   della funzione: il nome resta scritto nel commento, che e' la ricetta, e
   cercare «Math.cbrt» condannerebbe la toppa per la propria spiegazione. */
if (t.split('const DS_K = (function(){').length - 1 !== 0) { console.error('TOPPA NON APPLICATA: il conto di DS_K e\' ancora li\''); process.exit(1); }
if (t.split('const DS_K = [').length - 1 !== 1) { console.error('TOPPA NON APPLICATA: la tavola non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(FILE, t);
console.log('toppa applicata: la tavola K scritta, Math.cbrt fuori dal gioco, in ' + path.relative(RADICE, FILE));
