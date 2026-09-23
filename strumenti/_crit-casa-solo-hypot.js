/* =====================================================================
   _crit-casa-solo-hypot.js — LA CURA PARZIALE
   (voce #143, compito 4 — mutante)

   LA BUGIA: si dirotta su casa SOLO `Math.hypot`, e si lascia native
   sin, cos, tan, exp, log e atan2.

   PERCHE' E' IL FALSO PIU' PERICOLOSO DI QUESTO CANTIERE, e non e' di
   fantasia: e' ESATTAMENTE la cura che il #141 aveva in mano. `hypot`
   e' la funzione che diverge di piu' (100-103 valori su 200 fra i tre
   motori, 839.667 chiamate in novanta secondi) e riscriverla come
   `sqrt(x*x+y*y)` costa una riga. Il #141 l'ha provata e ha scritto nel
   proprio referto che fa convergere «sette semi su otto». Rimisurato
   qui su otto semi e tre motori: **quattro semi su otto** tornano
   identici, quattro no (25, 28, 29, 30), e i tre che restano rossi lo
   sono su firefox per `atan2` (24/200) e `exp` (21/200).

   QUINDI E' IL CASO PEGGIORE VERO: una cura che su POCHI SEMI sembra
   funzionare. Un cancello che girasse su due o tre semi la
   promuoverebbe, il cantiere si chiuderebbe, e il lockstep si
   romperebbe in produzione su una partita ogni due. La prova che deve
   mordere e' `_q-motori.js` prova B **su otto semi**, e il numero di
   semi non e' un dettaglio del banco: e' parte della soglia.

   uso: node strumenti/_crit-casa-solo-hypot.js [uscita.html]
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { innesta, sguaina } = require('./_toppa-143-matematica.js');

const RADICE = path.resolve(__dirname, '..');
const usc = process.argv[2] || path.join(RADICE, 'fuori', 'crit-casa-solo-hypot.html');
const ing = path.join(RADICE, 'CALCETTO-il-gioco.html');

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
try { r = innesta(base, { solo: ['hypot'] }); }
catch (e) { console.error('MUTANTE NON COSTRUITO: ' + e.message); process.exit(2); }
fs.writeFileSync(usc, r.testo);
console.log('mutante «solo hypot» costruito: ' + r.siti + ' chiamate dirottate (hypot ' + (r.conto.hypot || 0) +
            '), le altre sei restano native -> ' + usc);
