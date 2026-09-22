/* =====================================================================
   _crit-sigillo-server-sordo.js — IL SERVER CHE NON DICE IL VERDETTO
   (voce #134, compito 1). Il falso che condanna il gruppo A di
   `_q-sigillo.js`.

   CHE COSA FALSIFICA: il `GET /api/sfida` torna com'era prima della
   cura, cioe' con `verificata` fuori dalla `select`. Tutto il resto
   resta identico — il freno c'e', la risposta e' 200, la riga ha i suoi
   otto campi, i nomi degli attaccanti arrivano. E' il CASO PEGGIORE
   apposta: un falso che rompesse anche il freno cadrebbe su A3 e non
   proverebbe niente su A1/A2.

   L'ESITO ATTESO: `_q-sigillo.js --api fuori/api-sfida-sordo.mjs` deve
   diventare ROSSO su A1 e A2, e restare VERDE su A3a e A3b. Un banco che
   restasse verde qui non starebbe misurando il tubo: starebbe leggendo
   il proprio server finto.

   PERCHE' `.mjs` E PERCHE' IN `fuori/`: la cartella `rete/` e'
   `"type": "module"`, la radice del repo e' `"type": "commonjs"`. Un
   `.js` in `fuori/` verrebbe letto come CommonJS e la prima `import`
   sarebbe un errore di sintassi. L'estensione `.mjs` lo dichiara ESM
   comunque sia il pacchetto che lo contiene, e la `import` di
   `comuni.js` si riscrive in modo che risolva dalla nuova cartella —
   cosi' il falso e il vero condividono LO STESSO modulo `comuni.js`,
   che e' il punto: il `db` di carta che il banco infila ci arriva per
   tutti e due.

   uso:  node strumenti/_crit-sigillo-server-sordo.js
         node strumenti/_q-sigillo.js --api fuori/api-sfida-sordo.mjs
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'rete/api/sfida.js'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/api-sfida-sordo.mjs'));

/* --------------------------------------------------- le due ancore */
const A1 = "from '../lib/comuni.js';";
const B1 = "from '../rete/lib/comuni.js';";
const A2 = "&select=id,seme,taglia,gol_a,gol_d,giocata,vista,verificata,attaccante');";
const B2 = "&select=id,seme,taglia,gol_a,gol_d,giocata,vista,attaccante');";

const src = fs.readFileSync(inFile, 'utf8');
for (const [a, q] of [[A1, 1], [A2, 1]]) {
  const n = src.split(a).length - 1;
  if (n !== q) { console.error('FALLITO: ancora non trovata ' + q + ' volta (trovata ' + n + '): ' + a); process.exit(1); }
}
const out = src.replace(A1, B1).replace(A2, B2);

const attesi = [
  ['verificata,attaccante', 0],            /* la colonna e' sparita dalla select */
  ["frenato('sfl:' + io.id, 60, 60)", 1],  /* il freno resta: e' il caso peggiore */
  ["errore: 'troppe'", 2],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il server sordo e\' pronto: `verificata` fuori dalla select, freno intatto');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-sigillo.js --api ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su A1 e A2, VERDE su A3a e A3b');
