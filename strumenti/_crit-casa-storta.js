/* =====================================================================
   _crit-casa-storta.js — UGUALE OVUNQUE, MA SBAGLIATA
   (voce #143, compito 4 — mutante)

   LA BUGIA: la stessa libreria, con UNA costante scritta con meno
   cifre. `M_S1`, il primo coefficiente del seno, da
   -1.66666666666666324348e-01 diventa -1.6666666666666e-01.

   PERCHE' E' IL CASO PEGGIORE. Questo falso passa tutto quello che il
   cantiere dice di cercare: non chiama nessuna trascendente nativa,
   usa solo operazioni correttamente arrotondate, e quindi da' GLI
   STESSI BIT SU TUTTI E TRE I MOTORI. La prova C di `_q-casa.js` — la
   SOGLIA del cantiere — e' verde. Anche `_q-motori.js` e' verde: i tre
   motori vedono la stessa partita, perche' sbagliano tutti allo stesso
   modo.

   Ed e' sbagliata. Lo scarto dal valore vero e' di un centinaio di
   ulp: abbastanza poco da non far esplodere niente, abbastanza tanto da
   spostare la fisica molto piu' di quanto la spostasse il disaccordo
   fra due telefoni — cioe' il gioco cambierebbe *di piu'* per colpa
   della cura che per colpa del difetto.

   E NON E' UN FALSO DI FANTASIA: una costante ricopiata con meno cifre
   e' l'errore piu' probabile che si possa fare riscrivendo fdlibm a
   mano. Il verbale del #143 dice «l'ordine delle operazioni e' il
   contratto»; questo mutante dice che anche le CIFRE lo sono.

   LA PROVA CHE DEVE MORDERE: `_q-casa.js` prova U (lo scarto in ULP
   dalla nativa). E' l'unica, ed e' per questo che esiste.

   uso: node strumenti/_crit-casa-storta.js [uscita.js]
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { SORGENTE } = require('./_143-matematica.js');

const RADICE = path.resolve(__dirname, '..');
const usc = process.argv[2] || path.join(RADICE, 'fuori', 'crit-casa-storta.js');

const CERCA = 'const M_S1 = -1.66666666666666324348e-01';
const METTI = 'const M_S1 = -1.6666666666666e-01';
if (SORGENTE.split(CERCA).length - 1 !== 1) {
  console.error('MUTANTE NON COSTRUITO: ancoraggio di M_S1 trovato ' + (SORGENTE.split(CERCA).length - 1) + ' volte');
  process.exit(2);
}
fs.mkdirSync(path.dirname(usc), { recursive: true });
fs.writeFileSync(usc, SORGENTE.replace(CERCA, METTI));
console.log('mutante «storta» costruito: M_S1 con tredici cifre invece di ventuno -> ' + usc);
