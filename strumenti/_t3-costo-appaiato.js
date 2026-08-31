/* =====================================================================
   _t3-costo-appaiato.js — il CRONOMETRO, ma appaiato.

   PERCHE'. La prima misura di costo di questa cura ha dato numeri
   impossibili: `tuffo`, che non e' stato toccato, passava da 1,095 a
   1,539 ms e `passaggio` da 1,434 a 1,114. Non era la cura: sulla
   stessa macchina girava un banco da sedici partite. Una misura di
   millisecondi presa in due momenti diversi su una macchina condivisa
   non misura la cura, misura il carico.

   COSA FA. Chiama `_g-costo.js` alternando i due file — A B A B A B —
   e per ogni clip prende la MEDIANA delle passate. Poi stampa il
   confronto mettendo in testa LE CLIP NON TOCCATE, che sono il
   controllo: se una posa che nessuno ha cambiato si muove del 20%, il
   20% e' rumore e non si puo' leggere niente sotto quella soglia.

   uso: node strumenti/_t3-costo-appaiato.js --a fuori/X.html --b fuori/Y.html \
          --tocche pugno,cielo [--coppie 3] [--giri 3]
   ===================================================================== */
const path = require('path');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const A = arg('a', ''), B = arg('b', '');
const TOCCHE = arg('tocche', '').split(',').filter(Boolean);
const COPPIE = +arg('coppie', 3);
const GIRI = +arg('giri', 3);
if (!A || !B) { console.error('servono --a e --b'); process.exit(2); }

function unaPassata(file) {
  const out = execFileSync(process.execPath,
    [path.join(__dirname, '_g-costo.js'), '--gioco', file, '--giri', String(GIRI)],
    { cwd: RADICE, encoding: 'utf8', maxBuffer: 1 << 24 });
  const riga = out.trim().split('\n').filter(r => r.trim().startsWith('{')).pop();
  if (!riga) throw new Error('_g-costo non ha stampato il JSON per ' + file);
  return JSON.parse(riga);
}

const mediana = a => { const b = a.slice().sort((x, y) => x - y); const m = b.length >> 1;
  return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };

(async () => {
  const acc = { a: {}, b: {} };
  for (let k = 0; k < COPPIE; k++) {
    for (const [chi, file] of [['a', A], ['b', B]]) {
      const r = unaPassata(file);
      for (const c in r) { (acc[chi][c] = acc[chi][c] || []).push(r[c]); }
      process.stderr.write('  passata ' + (k + 1) + '/' + COPPIE + ' ' + chi.toUpperCase() + ' fatta\n');
    }
  }
  const clip = Object.keys(acc.a).sort();
  const f = (x, d) => x.toFixed(d === undefined ? 3 : d);
  const righe = clip.map(c => {
    const ma = mediana(acc.a[c]), mb = mediana(acc.b[c]);
    return { c, ma, mb, d: (mb - ma) / ma * 100, tocca: TOCCHE.includes(c) };
  });
  const non = righe.filter(r => !r.tocca).map(r => Math.abs(r.d));
  const rumore = mediana(non), peggio = Math.max(...non);

  console.log('\n=== COSTO APPAIATO — ' + COPPIE + ' coppie x ' + GIRI + ' giri, 22 figure x 600 fotogrammi ===');
  console.log('  A = ' + A + '\n  B = ' + B);
  console.log('\n  IL CONTROLLO: le ' + non.length + ' clip NON toccate');
  console.log('    scarto |B-A| mediano ' + f(rumore, 1) + '%   peggiore ' + f(peggio, 1) + '%');
  console.log('    -> sotto ' + f(peggio, 1) + '% questa macchina non sa distinguere niente\n');
  console.log('  clip           A (ms)   B (ms)   scarto');
  for (const r of righe.sort((x, y) => (y.tocca - x.tocca) || (y.d - x.d)))
    console.log('  ' + (r.tocca ? '* ' : '  ') + r.c.padEnd(13) + f(r.ma).padStart(7) + f(r.mb).padStart(9) +
      (r.d >= 0 ? '  +' : '  ') + f(r.d, 1) + '%' + (r.tocca ? '   <- toccata' : ''));
  const ta = mediana(clip.map(c => mediana(acc.a[c]))), tb = mediana(clip.map(c => mediana(acc.b[c])));
  console.log('\n  mediana fra le ' + clip.length + ' clip:  A ' + f(ta) + '   B ' + f(tb) +
    '   (' + (tb >= ta ? '+' : '') + f((tb - ta) / ta * 100, 1) + '%)');
})();
