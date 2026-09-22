/* =====================================================================
   _crit-sospetto.js — L'IMPIANTO DEI SETTE FALSI DELLA VOCE #137.
   Non e' un falso: e' il pezzo che i sette condividono, perche' un falso
   e' una sostituzione e una lettera, non quaranta righe di argomenti
   della riga di comando copiate sette volte.

   UN FALSO SERVE A CONDANNARE IL BANCO, NON IL SERVER. Il cancello
   `_q-sospetto.js` dice che l'abbinamento e il sospetto funzionano;
   questi dicono che il cancello se ne accorgerebbe se non funzionassero.
   La regola di casa e' che ognuno deve PASSARE tutte le prove tranne
   quella che morde: un falso che rompe tutto non dice QUALE prova morde,
   e un falso troppo gentile non prova niente (lezione pagata sei
   cantieri di fila in quest'onda).

   QUI IL FALSO E' UNA CARTELLA, non un file. Il server e' fatto di
   moduli, uno schema e cinque endpoint, e un falso che cambiasse solo un
   modulo non potrebbe mai mordere il gruppo D, che legge lo schema.
   Allora si copia `rete/` intera in `fuori/`, si cambia la riga, e il
   banco ci si punta con `--rete`.

   PRIMA DEI COMPITI 2 E 3 NESSUNO DI QUESTI SI APPLICA, e lo dicono: la
   cura non e' ancora nei file e le ancore non esistono.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');

/* copia ricorsiva senza dipendenze: la cartella del server e' undici
   file, e un pacchetto in piu' e' un pacchetto da aggiornare per sempre */
function copia(da, a) {
  fs.mkdirSync(a, { recursive: true });
  for (const v of fs.readdirSync(da, { withFileTypes: true })) {
    const s = path.join(da, v.name), d = path.join(a, v.name);
    if (v.isDirectory()) copia(s, d); else fs.copyFileSync(s, d);
  }
}

function falso(conf) {
  const arg = (n, d) => {
    const i = process.argv.indexOf('--' + n);
    return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
  };
  const inDir = path.resolve(RADICE, arg('in', 'rete'));
  const outDir = path.resolve(RADICE, arg('out', 'fuori/rete-' + conf.nome));

  const bersaglio = path.join(inDir, conf.file);
  if (!fs.existsSync(bersaglio)) {
    console.error('FALLITO: il file da guastare non c\'e\': ' + conf.file);
    console.error('  Prima del compito 2 (o 3) e\' NORMALE: la cura non e\' ancora scritta.');
    process.exit(1);
  }
  const src = fs.readFileSync(bersaglio, 'utf8');
  /* un falso puo' avere bisogno di DUE tocchi — aggiungere una colonna a
     una tupla vuol dire scriverla nella firma e nella select — ma ognuno
     deve restare un'ancora unica: se una si trova zero volte o due, si
     ferma tutto invece di indovinare */
  const cambi = conf.cambi || [{ cerca: conf.cerca, metti: conf.metti }];
  let out = src;
  for (const c of cambi) {
    const n = out.split(c.cerca).length - 1;
    if (n !== 1) {
      console.error('FALLITO: l\'ancora non si trova esattamente una volta (trovata ' + n + ') in ' + conf.file + ':');
      console.error('  ' + c.cerca.slice(0, 90).replace(/\n/g, ' / '));
      if (n === 0) console.error('  Prima del compito 2 (o 3) e\' NORMALE: la cura non e\' ancora scritta.');
      process.exit(1);
    }
    out = out.replace(c.cerca, c.metti);
  }

  /* quel che DEVE restare in piedi dopo la sostituzione: un falso che
     rompe tutto non dice quale prova morde */
  const rotti = (conf.attesi || []).filter(([s, k]) => (out.split(s).length - 1) !== k)
    .map(([s, k]) => s.slice(0, 60) + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
  if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

  fs.rmSync(outDir, { recursive: true, force: true });
  copia(inDir, outDir);
  fs.writeFileSync(path.join(outDir, conf.file), out);

  const rel = path.relative(RADICE, outDir).replace(/\\/g, '/');
  console.log('OK  falso costruito: ' + conf.titolo);
  console.log('    da   ' + path.relative(RADICE, inDir).replace(/\\/g, '/') + '/' + conf.file + '  (' + src.length + ' byte)');
  console.log('    a    ' + rel + '/' + conf.file + '  (' + out.length + ' byte)');
  console.log('    prova:  node strumenti/_q-sospetto.js --rete ' + rel);
  console.log('    DEVE uscire 1, e la prova che cade dev\'essere ' + conf.morde + '.');
  console.log('    Un verde qui vorrebbe dire che il banco non discrimina.');
}

module.exports = { falso, copia, RADICE };
