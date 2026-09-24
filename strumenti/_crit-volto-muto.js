/* =====================================================================
   _crit-volto-muto.js — IL PANNELLO CHE SI APRE E NON FA NIENTE
   (voce #147, compito 1 — un falso, non una cura)

   CHE COSA FA. CREA LA SFIDA non crea niente: il pannello si apre, e'
   bello, il bottone si preme e si illumina, e il campo del codice resta
   vuoto. La rete non viene toccata, nessuna eccezione, nessun rosso in
   console.

   PERCHE' ESISTE. Un banco che verificasse «#sfidaDischetto esiste e
   non ha la classe hidden» promuoverebbe questo falso a pieni voti. E'
   la differenza fra un pannello e un VOLTO: il cancello B2 pretende che
   dal bottone esca un codice di sei caratteri, non che il bottone ci
   sia.

   DEVE ESSERE MORSO DA B2.
   uso:  node strumenti/_crit-volto-muto.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-volto-muto.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente'); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const TAGLI = [
  [
    "  async dammiCodice(){\n    const r = await this.crea();",
    "  async dammiCodice(){\n    /* IL FALSO: non si crea niente, e non si dice niente. */\n    const r = { ok:false, stanza:'' };\n    if(false) await this.crea();",
    "dammiCodice"
  ]
];
for (const [cerca, metti, nome] of TAGLI) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('FALSO NON COSTRUITO: ancora ' + nome + ' trovata ' + n + ' volte'); process.exit(1); }
  t = t.replace(cerca, metti);
}
fs.writeFileSync(usc, t);
console.log('falso costruito: volto-muto');
