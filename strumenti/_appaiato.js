/* =====================================================================
   _appaiato.js — IL CONFRONTO APPAIATO, con l'incertezza scritta accanto.

   _eventi.js stampa due fotografie e la differenza fra le mediane. Con
   cento partite a semi FISSI le due fotografie sono APPAIATE — partita
   per partita e' la stessa partita giocata da due gioghi diversi — e su
   dati appaiati la differenza si puo' misurare molto meglio di cosi':
     · media della differenza partita per partita
     · intervallo di confidenza al 95% per bootstrap sulle coppie
     · p per permutazione dei segni (10.000 giri, seme fisso)
   Un delta senza incertezza accanto e' un numero che invita a credergli.

   uso: node strumenti/_appaiato.js fuori/prima.json fuori/dopo.json
   ===================================================================== */
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const A = require(path.resolve(RADICE, process.argv[2]));
const B = require(path.resolve(RADICE, process.argv[3]));
const DT = 1 / 60;

function der(p) {
  const somma = a => (a[0] | 0) + (a[1] | 0);
  const gr = p.golRegol || p.gol;
  const parate = somma(p.parate), legni = p.pali + p.traverse, tiri = somma(p.tiri);
  const minuti = Math.max(0.001, p.frames * DT / 60);
  const momenti = somma(gr) + parate + legni;
  const e = p.esiti || {};
  return {
    gol: somma(gr), zeroZero: somma(gr) === 0 ? 1 : 0,
    tiri, momenti, momentiMin: momenti / minuti,
    golMin: somma(gr) / minuti,
    tiriMin: tiri / minuti,
    parate, precVera: tiri ? ((e.gol | 0) + (e.parata | 0) + (e.legno | 0)) / tiri * 100 : 0,
    liberoP: p.frames ? p.liberoFrames / p.frames * 100 : 0,
    cambi: p.cambi, cambiMin: p.cambi / minuti,
    vaganti: p.vaganti, rimpalli: p.rimpalli,
    possesso0: (p.possesso[0] + p.possesso[1]) ? p.possesso[0] / (p.possesso[0] + p.possesso[1]) * 100 : 50,
  };
}
const a = A.crudo.map(der), b = B.crudo.map(der);
if (a.length !== b.length) { console.error('campioni diversi: ' + a.length + ' e ' + b.length); process.exit(1); }
const n = a.length;

let s = 123456789;
const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
const media = v => v.reduce((x, y) => x + y, 0) / v.length;
const med = v => { const c = v.slice().sort((x, y) => x - y); const m = c.length; return m % 2 ? c[(m - 1) / 2] : (c[m / 2 - 1] + c[m / 2]) / 2; };

console.log('=== APPAIATO — ' + n + ' partite, ' + (A.gioco || 'A') + '  ->  ' + (B.gioco || 'B') + ' ===');
console.log('  voce            mediaA   mediaB    delta   IC95 bootstrap        p(perm)');
for (const k of Object.keys(a[0])) {
  const d = a.map((x, i) => b[i][k] - x[k]);
  const dm = media(d);
  const boot = [];
  for (let r = 0; r < 4000; r++) {
    let t = 0;
    for (let i = 0; i < n; i++) t += d[(rnd() * n) | 0];
    boot.push(t / n);
  }
  boot.sort((x, y) => x - y);
  const lo = boot[(0.025 * boot.length) | 0], hi = boot[(0.975 * boot.length) | 0];
  let est = 0;
  for (let r = 0; r < 10000; r++) {
    let t = 0;
    for (let i = 0; i < n; i++) t += (rnd() < 0.5 ? -d[i] : d[i]);
    if (Math.abs(t / n) >= Math.abs(dm) - 1e-12) est++;
  }
  const p = est / 10000;
  console.log('  ' + k.padEnd(13) +
    media(a.map(x => x[k])).toFixed(2).padStart(8) +
    media(b.map(x => x[k])).toFixed(2).padStart(8) +
    dm.toFixed(3).padStart(9) +
    ('  [' + lo.toFixed(3) + '; ' + hi.toFixed(3) + ']').padEnd(24) +
    (p < 0.0001 ? '<0.0001' : p.toFixed(4)).padStart(8) +
    (p < 0.05 ? '  *' : ''));
}
console.log('  (mediane: momentiMin ' + med(a.map(x => x.momentiMin)).toFixed(2) + ' -> ' + med(b.map(x => x.momentiMin)).toFixed(2) +
  ',  gol ' + med(a.map(x => x.gol)).toFixed(2) + ' -> ' + med(b.map(x => x.gol)).toFixed(2) +
  ',  0-0 ' + (media(a.map(x => x.zeroZero)) * 100).toFixed(0) + '% -> ' + (media(b.map(x => x.zeroZero)) * 100).toFixed(0) + '%)');
