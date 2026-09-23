/* =====================================================================
   _crit-dischetto-credulone.js — UNA VERSIONE BUGIARDA DEL GIOCO
   (voce #146, compito 3 — falso per condannare il banco)

   NON VERIFICA CHE LA RIVELAZIONE RICOMPONGA L'IMPEGNO. L'impegno viene
   ancora calcolato, ancora mandato, ancora scritto nel nastro: c'e'
   tutto tranne il confronto. E' il falso che un banco superficiale
   promuove volentieri, perche' dall'esterno la macchina dell'impegno
   sembra intera — e un impegno che nessuno controlla e' una
   decorazione.
   DEVE ESSERE MORSO DA: B3.
   Se non lo e', il buco e' nel banco e si ripara il banco, non il falso.

   uso:  node strumenti/_crit-dischetto-credulone.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA = `    const suo = dsImpegno(t, S.lato === 'a' ? 'b' : 'a', S.sueMosse[t], S.suoiNonce[t]);
    if(suo !== S.suoiImpegni[t]){
      S.fase = 'fine'; S.causa = 'impegno-non-torna'; S.fine = null;
      return;
    }`;
const METTI = `    const suo = dsImpegno(t, S.lato === 'a' ? 'b' : 'a', S.sueMosse[t], S.suoiNonce[t]);
    if(suo === '@mai@'){
      S.fase = 'fine'; S.causa = 'impegno-non-torna'; S.fine = null;
      return;
    }`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_crit-dischetto-credulone.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('FALSO NON COSTRUITO: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('FALSO NON COSTRUITO: ancoraggio trovato ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split(METTI).length - 1 !== 1) { console.error('FALSO NON COSTRUITO: la bugia non e\' entrata una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('falso costruito: credulone, ' + ing + ' -> ' + usc);
