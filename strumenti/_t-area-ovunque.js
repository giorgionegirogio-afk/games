/* =====================================================================
   _t-area-ovunque.js — L'ARM DI PROVA: l'attacco dell'area acceso a
   TUTTE le taglie.

   Perche' esiste. attaccaArea (cambio 9 di _t-cross-cpu.js) comincia con
   "if(TAGLIA>=7) return false;", e il commento accanto a quella riga
   dichiara PERCHE': con un secondo uomo fisso davanti, a 7 e a 11 i tiri
   e i momenti da porta CALANO. Quella e' una misura, e una misura scritta
   in un commento vale solo se qualcuno la puo' rifare senza ricostruire a
   mano un gioco che non esiste piu'.
   Questa toppa e' l'interruttore che serve a rifarla: si applica SOPRA la
   copia gia' toppata e toglie quella riga, cioe' accende l'attacco
   dell'area anche a 7 e a 11. Non e' una configurazione da spedire: e'
   il braccio di un confronto.

   uso: node strumenti/_t-cross-cpu.js CALCETTO-il-gioco.html dopo.html
        node strumenti/_t-area-ovunque.js dopo.html dopo-area-ovunque.html
   Si rifiuta di scrivere se l'ancoraggio non c'e' esattamente una volta.
   ===================================================================== */
const fs = require('fs');

const CERCA = `  if(TAGLIA>=7) return false;
  const t=p.team, gx=t===0?FW:0;`;
const SOSTITUISCI = `  /* ARM DI PROVA (_t-area-ovunque.js): qui il gioco spedito torna false
     da TAGLIA>=7. Vedi il commento qui sopra e il rapporto. */
  const t=p.team, gx=t===0?FW:0;`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_t-area-ovunque.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
const t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) {
  console.error(`TOPPA NON APPLICATA: l'ancoraggio (il freno di attaccaArea) e' stato trovato ${n} volte, ne serve 1.`);
  console.error('  probabilmente l\'ingresso non e\' una copia toppata con _t-cross-cpu.js.');
  process.exit(1);
}
fs.writeFileSync(usc, t.replace(CERCA, SOSTITUISCI));
console.log(`arm applicato: l'attacco dell'area e' acceso a tutte le taglie, ${ing} -> ${usc}`);
