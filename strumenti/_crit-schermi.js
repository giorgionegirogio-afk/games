/* =====================================================================
   _crit-schermi.js — L'IMPIANTO DEI FALSI DEL COMANDO SENZA SCHERMO
   (voce #144, compito 1). Non e' un falso: e' il pezzo che tutti
   condividono, il gemello di _crit-finestra.js con le ancore di questo
   cantiere.

   UN FALSO SERVE A CONDANNARE IL BANCO, NON IL GIOCO. `_q-schermi.js`
   dice che lo stesso nastro da' lo stesso verdetto e lo stesso punteggio
   su sei geometrie diverse; questi dicono che se ne accorgerebbe se non
   fosse vero. La regola di casa e' che ognuno deve PASSARE tutte le
   prove tranne quella che morde: un falso che rompe tutto non dice QUALE
   prova morde, e un falso troppo gentile non prova niente — tredici
   cantieri di fila hanno pagato questa lezione in revisione, e il #143
   ha appena trovato un falso che un cancello a due semi avrebbe
   promosso.

   DUE SOSTITUZIONI PER FALSO, NON UNA. La cura vive in due punti — la
   porta che SCRIVE l'atto e il riproduttore che lo LEGGE — e un falso
   che ne toccasse uno solo produrrebbe un gioco che non sa piu' leggere
   quel che scrive: sarebbe rotto, non bugiardo. Un bugiardo dev'essere
   coerente con se' stesso, o non inganna nessuno.

   PRIMA DEL COMPITO 2 NESSUNO DI QUESTI SI APPLICA, e lo dicono: la cura
   non e' ancora nel file e le ancore non esistono.
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
  let src = fs.readFileSync(inFile, 'utf8');

  for (const c of conf.cambi) {
    const n = src.split(c.cerca).length - 1;
    if (n !== 1) {
      console.error('FALLITO: l\'ancora «' + (c.nome || '?') + '» non si trova esattamente una volta (trovata ' + n + ').');
      if (n === 0) console.error('  Prima del compito 2 e\' NORMALE: la cura non e\' ancora nel file.');
      process.exit(1);
    }
    src = src.replace(c.cerca, c.metti);
  }
  /* quel che DEVE restare in piedi: un falso che rompe tutto non dice
     quale prova morde */
  const attesi = (conf.attesi || []).concat([
    ['function giudica(nastro, atteso, opz){', 1],
    ['  risolvi(x, y){', 1],
    ['  avvia(id, atto, x, y){', 1],
    ['  applica(id, atto, x, y){', 1],
    ['  puntoDi(atto){', 1],
  ]);
  const rotti = attesi.filter(([s, k]) => (src.split(s).length - 1) !== k)
    .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (src.split(s).length - 1));
  if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, src);
  console.log('OK  falso costruito: ' + conf.titolo);
  console.log('    da   ' + inFile);
  console.log('    a    ' + outFile);
  console.log('    prova:  node strumenti/_q-schermi.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
  console.log('    DEVE uscire 1, e le prove che cadono devono essere ' + conf.morde + '.');
  console.log('    Un verde qui vorrebbe dire che il banco non discrimina.');
}

/* LE DUE ANCORE CHE TUTTI I FALSI TOCCANO, scritte una volta sola: la
   porta che scrive l'atto e il ramo del riproduttore che lo legge. */
const ANCORA_SCRIVE =
`        if(Reg.modo === 1) Reg.scrivi(12, [idA, atto.t, atto.esito, atto.slot,
                                           Math.round(atto.ux * 1000), Math.round(atto.uy * 1000)]);`;
const ANCORA_LEGGE =
`      const atto = { t: r[4]|0, esito: r[5]|0, slot: r[6]|0, ux: (r[7]|0)/1000, uy: (r[8]|0)/1000 };
      const p = Touch5.puntoDi(atto);`;

module.exports = { falso, RADICE, ANCORA_SCRIVE, ANCORA_LEGGE };
