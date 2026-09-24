/* =====================================================================
   _crit-volto-sopra.js — LA VOCE NUOVA SOPRA LA LISTA
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. Sposta la voce SFIDA DAL DISCHETTO da sotto la carta a
   SOPRA la lista delle sfide subite. Non cambia una parola, non cambia
   uno stile: cambia SOLO il posto.

   PERCHE' E' IL FALSO PIU' IMPORTANTE DI QUESTO CANTIERE. E' il difetto
   che il #135 ha misurato e pagato, e che il commento accanto a
   btnSfidaCarta descrive: «sopra la lista spingerebbe la prima riga a
   375 su una piega di 360». Una voce in piu' nel posto sbagliato non
   rompe niente che un'eccezione possa segnalare — rompe la PAGINA, a
   casa di chi gioca, e nessun errore di console lo dice.

   DEVE ESSERE MORSO DA A1, ai due formati.
   uso:  node strumenti/_crit-volto-sopra.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-volto-sopra.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "    <button class=\"voce\" id=\"btnSfidaDischetto\">SFIDA DAL DISCHETTO <small>rigori con un amico, adesso &middot; un codice da mandare</small></button>\n",
    "",
    "la voce al suo posto"
  ],
  [
    "    <div class=\"eti\">LE SFIDE CHE HAI SUBITO</div>",
    "    <button class=\"voce\" id=\"btnSfidaDischetto\">SFIDA DAL DISCHETTO <small>rigori con un amico, adesso &middot; un codice da mandare</small></button>\n    <div class=\"eti\">LE SFIDE CHE HAI SUBITO</div>",
    "la voce sopra la lista"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: volto-sopra');
