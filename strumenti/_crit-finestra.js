/* =====================================================================
   _crit-finestra.js — L'IMPIANTO DEI CINQUE FALSI DELLA FINESTRA
   (voce #139, compito 1). Non e' un falso: e' il pezzo che i cinque
   condividono, perche' un falso e' una sostituzione e una lettera, non
   quaranta righe di argomenti della riga di comando copiate cinque
   volte. E' il gemello di _crit-giudice.js, con le ancore di questo
   cantiere.

   UN FALSO SERVE A CONDANNARE IL BANCO, NON IL GIOCO. Il cancello
   _q-finestra.js dice che una finestra che si muove non accusa piu'
   nessuno; questi dicono che il cancello se ne accorgerebbe se
   accusasse. La regola di casa e' che ognuno deve PASSARE tutte le
   prove tranne quella che morde: un falso che rompe tutto non dice
   QUALE prova morde, e un falso troppo gentile non prova niente (otto
   cantieri di fila hanno pagato questa lezione in revisione).

   PRIMA DEL COMPITO 2 NESSUNO DI QUESTI SI APPLICA, e lo dicono: la
   cura non e' ancora nel file e le ancore non esistono.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');

function falso(conf) {
  const arg = (n, d) => {
    const i = process.argv.indexOf('--' + n);
    return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
  };
  const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
  const outFile = path.resolve(RADICE, arg('out', 'fuori/' + conf.nome + '.html'));
  const src = fs.readFileSync(inFile, 'utf8');

  const n = src.split(conf.cerca).length - 1;
  if (n !== 1) {
    console.error('FALLITO: l\'ancora non si trova esattamente una volta (trovata ' + n + ').');
    if (n === 0) console.error('  Prima del compito 2 e\' NORMALE: la cura non e\' ancora nel file.');
    process.exit(1);
  }
  const out = src.replace(conf.cerca, conf.metti);
  /* quel che DEVE restare in piedi: un falso che rompe tutto non dice
     quale prova morde */
  const attesi = (conf.attesi || []).concat([
    ['function giudica(nastro, atteso, opz){', 1],
    ['function schermiDelNastro(){', 1],
    ['const MOTORE_V = 2;', 1],
  ]);
  const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
    .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
  if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, out);
  console.log('OK  falso costruito: ' + conf.titolo);
  console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
  console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
  console.log('    prova:  node strumenti/_q-finestra.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
  console.log('    DEVE uscire 1, e la prova che cade dev\'essere ' + conf.morde + '.');
  console.log('    Un verde qui vorrebbe dire che il banco non discrimina.');
}

module.exports = { falso, RADICE };
