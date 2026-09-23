/* =====================================================================
   _crit-casa-una-nativa.js — UNA SOLA CHIAMATA DIMENTICATA
   (voce #143, compito 4 — mutante)

   LA BUGIA: la cura completa, meno UN sito. `const len=(x,y)=>Mhypot(x,y)`
   torna a essere `Math.hypot(x,y)`.

   PERCHE' E' IL CASO PEGGIORE DEL PERIMETRO. Una toppa che dirotta 369
   chiamate su 370 sembra fatta. Non lo e': `len` e' la distanza, la
   funzione piu' chiamata del gioco, e `hypot` e' quella che diverge di
   piu' fra i motori. Questo mutante misura se il cancello vede una
   toppa QUASI completa, che e' il modo normale in cui una toppa
   sbaglia — non si dimentica tutto, si dimentica un posto.

   E MISURA ANCHE ALTRO, che e' il motivo vero per cui questo file
   esiste. Un sito dimenticato in un punto FREDDO — il rigore, la
   rimessa, la taglia 11 — `_q-motori.js` non lo vedrebbe, perche' su
   otto semi da novanta secondi quel codice non si accende mai. Per
   questo la toppa non si fida del cancello: rifa la scansione dopo
   l'innesto e RIFIUTA DI SCRIVERE se resta anche una sola chiamata
   nativa fuori dal blocco protetto. Il mutante nasce solo perche' gli
   si dice `lascia: true`, cioe' scavalcando apposta quella guardia, e
   il banco dei falsi verifica ANCHE che senza quel permesso la toppa
   si sarebbe rifiutata.

   LE DUE PROVE CHE DEVONO MORDERE:
     · `_q-motori.js` prova B (perche' questo sito e' caldissimo);
     · la guardia strutturale dentro `_toppa-143-matematica.js`.

   uso: node strumenti/_crit-casa-una-nativa.js [uscita.html]
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { innesta, sguaina } = require('./_toppa-143-matematica.js');

const RADICE = path.resolve(__dirname, '..');
const usc = process.argv[2] || path.join(RADICE, 'fuori', 'crit-casa-una-nativa.html');
const ing = path.join(RADICE, 'CALCETTO-il-gioco.html');

const CURATO = 'const len=(x,y)=>Mhypot(x,y);';
const NATIVO = 'const len=(x,y)=>Math.hypot(x,y);';

fs.mkdirSync(path.dirname(usc), { recursive: true });
let r;
/* IL GIOCO SENZA LA CURA NON STA IN UN FILE, STA IN UN COMMIT — e un
   banco che dipendesse da un commit smetterebbe di funzionare al primo
   rebase. Qui si ricostruisce dal gioco di oggi togliendo la libreria e
   rimettendo i nomi nativi: `sguaina` e' l'innesto al contrario, e
   `_q-casa-falsi.js` verifica a ogni corsa che innesta(sguaina(x)) sia
   x parola per parola. */
let base;
try { base = sguaina(fs.readFileSync(ing, 'utf8')).testo; }
catch (e) { console.error('MUTANTE NON COSTRUITO: non riesco a togliere la cura dal gioco: ' + e.message); process.exit(2); }
try { r = innesta(base, { lascia: true }); }
catch (e) { console.error('MUTANTE NON COSTRUITO: ' + e.message); process.exit(2); }
if (r.testo.split(CURATO).length - 1 !== 1) {
  console.error('MUTANTE NON COSTRUITO: `' + CURATO + '` trovato ' + (r.testo.split(CURATO).length - 1) + ' volte (ne serve 1)');
  process.exit(2);
}
fs.writeFileSync(usc, r.testo.replace(CURATO, NATIVO));
console.log('mutante «una nativa» costruito: 369 chiamate su 370 dirottate, `len` no -> ' + usc);
