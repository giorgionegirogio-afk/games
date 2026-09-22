/* =====================================================================
   _crit-staffetta.js — L'IMPIANTO DEI SEI FALSI DELLA VOCE #138.
   Non e' un falso: e' il pezzo che i sei condividono, perche' un falso
   e' una sostituzione e una lettera, non quaranta righe di argomenti
   della riga di comando copiate sei volte.

   UN FALSO SERVE A CONDANNARE IL BANCO, NON LA STAFFETTA. Il cancello
   `_q-staffetta.js` dice che il giro funziona; questi dicono che il
   cancello se ne accorgerebbe se non funzionasse. La regola di casa e'
   che ognuno deve PASSARE tutte le prove tranne quella che morde: un
   falso che rompe tutto non dice QUALE prova morde, e un falso troppo
   gentile non prova niente (lezione pagata sette cantieri di fila in
   quest'onda).

   IL FALSO E' UN FILE SOLO, e non una cartella come nel #137: la
   staffetta e' un modulo, non un server fatto di undici file. Si copia
   `strumenti/staffetta.js` in `fuori/`, si cambia UNA riga, e il banco
   ci si punta con `--staffetta`.

   L'UNICO RITOCCO IN PIU' sono i `require('./...')`: da `fuori/` gli
   attrezzi di `strumenti/` stanno un passo piu' in la'. Si riscrivono e
   si CONTANO — se un giorno il conto non tornasse, il falso si
   rifiuterebbe di nascere invece di caricare il modulo sbagliato.

   PRIMA DEL COMPITO 2 NESSUNO DI QUESTI SI APPLICA, e lo dicono: la
   staffetta non e' ancora scritta e le ancore non esistono.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');

function falso(conf) {
  const arg = (n, d) => {
    const i = process.argv.indexOf('--' + n);
    return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
  };
  const inFile = path.resolve(RADICE, arg('in', 'strumenti/staffetta.js'));
  const outFile = path.resolve(RADICE, arg('out', 'fuori/staffetta-' + conf.nome + '.js'));

  if (!fs.existsSync(inFile)) {
    console.error('FALLITO: il file da guastare non c\'e\': ' + path.relative(RADICE, inFile));
    console.error('  Prima del compito 2 e\' NORMALE: la cura non e\' ancora scritta.');
    process.exit(1);
  }
  const src = fs.readFileSync(inFile, 'utf8');

  /* un falso puo' avere bisogno di piu' tocchi, ma ognuno deve restare
     un'ancora UNICA: se una si trova zero volte o due, si ferma tutto
     invece di indovinare */
  const cambi = conf.cambi || [{ cerca: conf.cerca, metti: conf.metti }];
  let out = src;
  for (const c of cambi) {
    const n = out.split(c.cerca).length - 1;
    if (n !== 1) {
      console.error('FALLITO: l\'ancora non si trova esattamente una volta (trovata ' + n + '):');
      console.error('  ' + c.cerca.slice(0, 90).replace(/\n/g, ' / '));
      if (n === 0) console.error('  Prima del compito 2 e\' NORMALE: la cura non e\' ancora scritta.');
      process.exit(1);
    }
    out = out.replace(c.cerca, c.metti);
  }

  /* quel che DEVE restare in piedi dopo la sostituzione: un falso che
     rompe tutto non dice quale prova morde */
  const rotti = (conf.attesi || []).filter(([s, k]) => (out.split(s).length - 1) !== k)
    .map(([s, k]) => s.slice(0, 60) + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
  if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

  /* I REQUIRE RELATIVI. Il falso vive in fuori/, gli attrezzi in
     strumenti/: si riscrivono e si contano. */
  const quanti = (out.match(/require\('\.\//g) || []).length;
  if (quanti < 1) {
    console.error('FALLITO: nessun require relativo da riscrivere — la staffetta e\' cambiata di forma.');
    process.exit(1);
  }
  out = out.split("require('./").join("require('../strumenti/");

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, out);

  const rel = path.relative(RADICE, outFile).replace(/\\/g, '/');
  console.log('OK  falso costruito: ' + conf.titolo);
  console.log('    da   ' + path.relative(RADICE, inFile).replace(/\\/g, '/') + '  (' + src.length + ' byte)');
  console.log('    a    ' + rel + '  (' + out.length + ' byte, ' + quanti + ' require riscritti)');
  console.log('    prova:  node strumenti/_q-staffetta.js --staffetta ' + rel);
  console.log('    DEVE uscire 1, e la prova che cade dev\'essere ' + conf.morde + '.');
  console.log('    Un verde qui vorrebbe dire che il banco non discrimina.');
}

/* LE ANCORE, in un posto solo: se la staffetta cambia forma, si
   aggiustano qui e non in sei file. */
const A_PAROLA = "        const parola = String(vv.verdetto || '');";
const A_MISURA = '    const misura = opz.misuraFissa || g.misura || MISURA_SERIE;';
const A_RICORDA = '        const daRicordare = !!tac && !finestraNegata && !!parola;';
const A_FRENO = [
  '        if (banco.frena) {',
  '          const via = await banco.frena();',
  '          if (!via) { ref.frenata = true; fermo = true; break; }',
  '        }',
].join('\n');
const A_MANDA = '        if (!asciutto) {';

module.exports = { falso, RADICE, A_PAROLA, A_MISURA, A_RICORDA, A_FRENO, A_MANDA };
