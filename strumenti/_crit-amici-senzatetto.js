/* =====================================================================
   _crit-amici-senzatetto.js — LA LISTA CHE CRESCE E BASTA (voce #136,
   compito 2). Il falso che condanna C3.

   CHE COSA FALSIFICA. Il tetto dei venti amici sparisce: «tanto chi ne
   ha piu' di venti?». La lista cresce senza limite, il salvataggio con
   lei, e il giorno in cui localStorage non regge piu' non si perde la
   classifica degli amici — si perde IL SALVATAGGIO, cioe' la squadra.

   E' IL CASO PEGGIORE: tutto il resto funziona. Il codice e' identico,
   la classifica si compila e si specchia, il doppione e' preso, il
   riavvio regge, il salvataggio e' additivo. E la rilettura tiene
   ancora il suo `slice(0, AMICI_TETTO)`, quindi perfino una ricarica
   nasconderebbe il difetto: la lista torna a venti da sola, e chi
   guarda solo dopo un riavvio non vede niente. C3 guarda SUBITO.

   L'ESITO ATTESO: ROSSO su C3, VERDE su tutto il resto.

   uso:  node strumenti/_crit-amici-senzatetto.js
         node strumenti/_q-amici.js --solo C --gioco fuori/gioco-amici-senzatetto.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-amici-senzatetto.html'));

const A = `      if(m.righe.length >= AMICI_TETTO){
        let vecchia = 0;
        for(let i=1;i<m.righe.length;i++) if((m.righe[i].q|0) < (m.righe[vecchia].q|0)) vecchia = i;
        uscito = m.righe[vecchia].n;
        m.righe.splice(vecchia, 1);
      }`;
const B = `      /* IL FALSO (voce #136, _crit-amici-senzatetto): «tanto chi ne ha
         piu' di venti?». Il tetto non c'e', la lista cresce e basta. */`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ['m.righe.splice(vecchia, 1);', 0],
  ['const AMICI_TETTO = 20;', 1],
  ['j.amici.righe.slice(0,AMICI_TETTO)', 1],   /* la rilettura tappa ancora: il difetto si vede solo SUBITO */
  ['const Amici = {', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la lista degli amici non ha piu\' un tetto');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-amici.js --solo C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su C3, VERDE su tutto il resto');
