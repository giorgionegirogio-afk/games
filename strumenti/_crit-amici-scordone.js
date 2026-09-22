/* =====================================================================
   _crit-amici-scordone.js — LA CLASSIFICA CHE VIVE QUANTO LA SESSIONE
   (voce #136, compito 2). Il falso che condanna C4.

   CHE COSA FALSIFICA. `segna` non chiama piu' `persistSave`: la riga
   c'e', si vede, si conta, si ordina — e non arriva mai sul disco. Su
   Android, dove l'applicazione viene uccisa quando vuole, un mese di
   sfide sparisce senza che nessuno se ne accorga finche' non guarda.

   E' IL CASO PEGGIORE, e per una ragione che questo banco ha dovuto
   imparare: il gioco riscrive il salvataggio anche mentre la pagina se
   ne va (grep «salvaPerSparizione», tre eventi per tre morti diverse).
   Quindi un banco che segnasse e poi RICARICASSE la pagina troverebbe
   la riga lo stesso — l'avrebbe scritta l'uscita, non la cura — e
   direbbe verde. C4 guarda il disco SUBITO, senza chiudere niente.

   Tutto il resto passa: il codice, il giro, lo specchio, il doppione, i
   tetti, l'additivita'.

   L'ESITO ATTESO: ROSSO su C4, VERDE su tutto il resto.

   uso:  node strumenti/_crit-amici-scordone.js
         node strumenti/_q-amici.js --solo C --gioco fuori/gioco-amici-scordone.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-amici-scordone.html'));

const A = `    r.mf += ma; r.ms += md; r.sf += sa; r.ss += sd;
    r.q = Date.now();
    try{ persistSave(); }catch(e){}`;
const B = `    r.mf += ma; r.ms += md; r.sf += sa; r.ss += sd;
    r.q = Date.now();
    /* IL FALSO (voce #136, _crit-amici-scordone): la riga resta in
       memoria. Tanto il salvataggio si scrive quando l'app se ne va. */`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ['function salvaPerSparizione(){', 1],       /* l'uscita scrive ancora: e' il travestimento */
  ['const Amici = {', 1],
  ['  segna(o){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
/* dentro segna() non deve esserci piu' un persistSave, ma altrove si' */
const seg = out.slice(out.indexOf('  segna(o){'), out.indexOf('  segnaTesto(nome, testo){'));
if (/persistSave/.test(seg)) rotti.push('segna() chiama ancora persistSave: il falso non falsifica');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la classifica non arriva piu\' sul disco quando si segna');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-amici.js --solo C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su C4, VERDE su tutto il resto');
