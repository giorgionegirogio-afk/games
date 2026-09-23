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

  /* un falso puo' avere bisogno di DUE tocchi — aggiungere una colonna a
     una tupla vuol dire scriverla nella firma e nella select — ma ognuno
     deve restare un'ancora unica: se una si trova zero volte o due, si
     ferma tutto invece di indovinare.

     E DALLA VOCE #140 I TOCCHI POSSONO STARE IN FILE DIVERSI, con
     `cambi: [{ file, cerca, metti }]`. Serve al falso che conta piu' di
     tutti (`_crit-glicko-visibile`): un difetto che stesse solo nel
     JavaScript cadrebbe sul gruppo che confronta il JS con l'SQL, e il
     banco sembrerebbe discriminare mentre starebbe solo notando
     un'incoerenza. Per provare che il cancello MISURA, il falso deve
     dire la stessa cosa sbagliata in tutte e due le lingue.
     Senza `file`, ogni cambio va su `conf.file` come prima. */
  const cambi = (conf.cambi || [{ cerca: conf.cerca, metti: conf.metti }])
    .map(c => ({ ...c, file: c.file || conf.file }));

  const testi = new Map();           /* file -> testo di partenza */
  const usciti = new Map();          /* file -> testo guastato */
  for (const c of cambi) {
    if (testi.has(c.file)) continue;
    const bersaglio = path.join(inDir, c.file);
    if (!fs.existsSync(bersaglio)) {
      console.error('FALLITO: il file da guastare non c\'e\': ' + c.file);
      console.error('  Prima del compito 2 (o 3) e\' NORMALE: la cura non e\' ancora scritta.');
      process.exit(1);
    }
    const src = fs.readFileSync(bersaglio, 'utf8');
    testi.set(c.file, src);
    usciti.set(c.file, src);
  }

  /* LE ESTREMITA' DI RIGA, e questa e' una trappola pagata dalla voce
     #140. I file scritti a mano in questo repo hanno CRLF; quelli nati
     da uno strumento hanno LF. Un'ancora su piu' righe scritta in un
     file .js di `strumenti/` ha sempre LF, quindi contro un bersaglio
     CRLF non si trova MAI — e il messaggio che ne esce dice «la cura non
     e' ancora scritta», cioe' manda a cercare la cosa sbagliata. Si
     prova com'e', e se non c'e' si riprova con le estremita' dell'altro
     tipo; il `metti` segue il `cerca` che ha funzionato, cosi' il file
     guastato resta coerente con se' stesso. */
  const versioni = t => [t, t.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'), t.replace(/\r\n/g, '\n')];
  for (const c of cambi) {
    const out = usciti.get(c.file);
    const vc = versioni(c.cerca), vm = versioni(c.metti);
    let k = -1;
    for (let j = 0; j < vc.length; j++) if (out.split(vc[j]).length - 1 === 1) { k = j; break; }
    if (k < 0) {
      const n = out.split(c.cerca).length - 1;
      console.error('FALLITO: l\'ancora non si trova esattamente una volta (trovata ' + n + ') in ' + c.file + ':');
      console.error('  ' + c.cerca.slice(0, 90).replace(/\n/g, ' / '));
      if (n === 0) console.error('  Prima del compito 2 (o 3) e\' NORMALE: la cura non e\' ancora scritta.');
      process.exit(1);
    }
    usciti.set(c.file, out.replace(vc[k], vm[k]));
  }

  /* quel che DEVE restare in piedi dopo la sostituzione: un falso che
     rompe tutto non dice quale prova morde. Un `atteso` puo' nominare il
     suo file; senza, vale sul primo. */
  const primoFile = cambi[0].file;
  const rotti = (conf.attesi || []).filter(([s, k, f]) => {
    const t = usciti.get(f || primoFile) || '';
    return (t.split(s).length - 1) !== k;
  }).map(([s, k, f]) => (f || primoFile) + ': ' + s.slice(0, 60) + ' atteso ' + k +
        ', trovato ' + ((usciti.get(f || primoFile) || '').split(s).length - 1));
  if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

  fs.rmSync(outDir, { recursive: true, force: true });
  copia(inDir, outDir);
  for (const [f, t] of usciti) fs.writeFileSync(path.join(outDir, f), t);

  const rel = path.relative(RADICE, outDir).replace(/\\/g, '/');
  const quali = [...usciti.keys()];
  console.log('OK  falso costruito: ' + conf.titolo);
  for (const f of quali)
    console.log('    ' + path.relative(RADICE, inDir).replace(/\\/g, '/') + '/' + f +
                '  (' + testi.get(f).length + ' byte)  ->  ' + rel + '/' + f +
                '  (' + usciti.get(f).length + ' byte)');
  /* QUALE CANCELLO GIUDICA QUESTO FALSO. Era scritto fisso
     `_q-sospetto.js`, ed era giusto finche' i falsi erano i sette del
     #137. Dalla voce #140 ce ne sono altri sei che giudica `_q-glicko.js`,
     e una riga che nomina il cancello sbagliato manda a leggere il
     verde di un altro banco — cioe' fa esattamente il danno che questi
     file esistono per impedire. */
  console.log('    prova:  node strumenti/' + (conf.cancello || '_q-sospetto.js') + ' --rete ' + rel);
  console.log('    DEVE uscire 1, e la prova che cade dev\'essere ' + conf.morde + '.');
  console.log('    Un verde qui vorrebbe dire che il banco non discrimina.');
}

/* =====================================================================
   IL TOCCO CHE I TRE FALSI DEL «NON LO SO» CONDIVIDONO.

   La tavola che accusa, da sola, non fa danno: `applica` si ferma prima
   sui tre «non lo so», quindi un falso che cambiasse solo la tavola
   resterebbe visibile al gruppo A e invisibile al gruppo B. Sarebbe un
   falso gentile, e un falso gentile non prova niente.

   Questo secondo tocco e' la versione «prudente» che qualcuno
   scriverebbe davvero — «non decido, ma me lo segno» — ed e' quella che
   accusa un innocente SENZA lasciare traccia nella colonna, cioe'
   rompendo l'invariante che rende un'accusa riproducibile. Sta qui, in
   un posto solo, perche' i tre falsi sono lo stesso difetto su tre
   verdetti diversi.
   ===================================================================== */
const GATE_CERCA = "  if (c.verificata === 0) return niente('non-lo-so');";
const GATE_METTI = [
  "  /* IL FALSO: «non chiudo la riga, ma me lo segno». E' la versione",
  "     prudente che qualcuno scriverebbe davvero, ed e' quella che accusa",
  "     un innocente senza lasciare traccia nella colonna. */",
  "  if (c.verificata === 0) {",
  "    const aperta = banco.sfida.find(x => x && x.id === idSfida);",
  "    const a0 = aperta ? prendi(banco.allenatore, aperta.attaccante) : null;",
  "    if (a0) a0.sospetto = (a0.sospetto | 0) + c.sospetto;",
  "    return niente('non-lo-so');",
  "  }",
].join('\n');

module.exports = { falso, copia, RADICE, GATE_CERCA, GATE_METTI };
