/* =====================================================================
   _crit-dischetto-credone.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #150, compito 1 — falso per condannare il banco)

   NON VERIFICA CHE IL NONCE RIVELATO SIA QUELLO IMPEGNATO. L'impegno del
   saluto viene mandato, ricevuto, messo da parte — e mai confrontato con
   la rivelazione che arriva dopo. Diventa una decorazione: chi si
   impegna su un nonce puo' aspettare quello dell'altro e poi rivelarne
   un altro, scelto per il seme che vuole.

   E' COSTRUITO NEL CASO PEGGIORE perche' non rompe niente di visibile:
   la busta del saluto porta `hn` come deve, l'appuntamento si chiude, i
   due telefoni onesti escono con lo STESSO seme (l'onesto rivela sempre
   quel che ha impegnato), la serie parte e finisce. Un banco che
   guardasse solo «i due semi coincidono» lo promuoverebbe.

   E' IL GEMELLO DI `credulone` (#146), che non verifica l'impegno dei
   TIRI. Se il banco morde l'uno e non l'altro, il buco e' nel banco.

   DEVE ESSERE MORSO DA: S4.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   SI COSTRUISCE SOPRA LA CURA (strumenti/_toppa-seme-due-mani.js):
   prima della cura l'ancoraggio non esiste e il falso rifiuta di nascere.

   uso:  node strumenti/_crit-dischetto-credone.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `    if(dsImpegnoSaluto(S.lato === 'a' ? 'b' : 'a', S.suoNonce) !== suo.hn){
      S.fase='fine'; S.causa='saluto-non-torna'; return;
    }`;
const METTI = `    /* il credone crede al nonce rivelato senza confrontarlo con
       l'impegno: l'impegno diventa una decorazione */`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-credone.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: credone, ' + ing + ' -> ' + usc);
