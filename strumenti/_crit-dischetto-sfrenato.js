/* =====================================================================
   _crit-dischetto-sfrenato.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #146, compito 3 — falso per condannare il banco)

   RITIRA SETTE VOLTE PER OGNI GIRO invece di una. Non e' un difetto
   assurdo: e' quel che scrive chiunque voglia «sentire subito» la mossa
   dell'altro, e il gioco continua a funzionare benissimo — anzi,
   risponde piu' in fretta. Solo che moltiplica per sette le richieste al
   minuto e sfonda il freno dell'endpoint, cioe' la bolletta.

   E' il falso che condanna il gruppo E: senza di lui, «le richieste
   stanno sotto il tetto» sarebbe una frase che nessuno ha mai visto
   diventare rossa.
   DEVE ESSERE MORSO DA: E1.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   uso:  node strumenti/_crit-dischetto-sfrenato.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `    const r = await this.filoOra.ritira();
    S.rete = Rete.stato;
    let nuovi = 0;`;
const METTI = `    for(let zz=0; zz<6; zz++) await this.filoOra.ritira();
    const r = await this.filoOra.ritira();
    S.rete = Rete.stato;
    let nuovi = 0;`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-sfrenato.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: sfrenato, ' + ing + ' -> ' + usc);
