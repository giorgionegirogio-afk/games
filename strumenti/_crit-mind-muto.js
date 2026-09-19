/* =====================================================================
   _crit-mind-muto.js -- IL GIOCO BUGIARDO (ii), STATO MUTO (voce #117,
   compito 5, MIND v1), sul modello di _crit-festa-dado.js.

   PERCHE'. Lo spec (§7.2 del mandato, ripreso dal progetto) dice "ogni
   stato che supera una soglia ha un canale d'occhio acceso; uno stato
   senza espressione va cancellato" -- e il banco strumenti/_q-umore.js
   lo misura con la prova TESTIMONE. Un canale che smette di accendersi
   e' esattamente il difetto che quella prova esiste per cogliere: questo
   attrezzo lo introduce di proposito, spegnendo applicaOcchioMestoDaFatto
   con un return immediato in testa alla funzione (il resto del corpo
   resta scritto, semplicemente non gira mai piu': p.mesto non si accende
   PIU' dai fatti negativi -- fallo subito, cartellino, legno -- anche se
   il fatto arriva e il giocatore idoneo esiste).

   NON E' UN ATTREZZO A ANCORE-PER-IL-GIOCO-VERO (niente --dentro): il
   file che produce e' PERMANENTEMENTE bugiardo. Non si committa il file
   generato (fuori/), solo questo attrezzo.

   uso:  node strumenti/_crit-mind-muto.js
         node strumenti/_crit-mind-muto.js --out fuori/altro.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/bugiardo-muto.html'));

const CERCA = 'function applicaOcchioMestoDaFatto(f){\n  let idx=-1;';
const METTI = 'function applicaOcchioMestoDaFatto(f){\n  return;   // BUGIARDO (voce #117, compito 5): il canale muto, p.mesto non si accende piu\' dai fatti\n  let idx=-1;';

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora non compare esattamente una volta (trovata ' + n + ' volte). Il sito si e\' spostato o e\' cambiato.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);

if (out.split(METTI).length - 1 !== 1) { console.error('FALLITO: la sostituzione non e\' presente esattamente una volta dopo il replace'); process.exit(1); }
if ((out.split('dado()').length - 1) !== (src.split('dado()').length - 1)) { console.error('FALLITO: il numero di chiamate a dado() e\' cambiato — questo attrezzo deve toccare SOLO il return di apertura'); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il gioco bugiardo (ii) STATO MUTO e\' scritto');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    patch: applicaOcchioMestoDaFatto ritorna subito -- p.mesto non si accende piu\' dai fatti');
