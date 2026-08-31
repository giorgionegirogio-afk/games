/* delta appaiato della differenza reti della squadra di quartiere (team 1)
   fra due json di _sonda-carattere.js  */
const fs = require('fs'), path = require('path');
const R = 'C:/Users/Utenteee/Desktop/GitHub/games';
const A = JSON.parse(fs.readFileSync(path.resolve(R, process.argv[2]), 'utf8'));
const B = JSON.parse(fs.readFileSync(path.resolve(R, process.argv[3]), 'utf8'));

const gr = r => { const g = r.gol; return (g[1] | 0) - (g[0] | 0); };
const media = v => v.reduce((a, b) => a + b, 0) / v.length;
const sig = v => { const m = media(v); return Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / (v.length - 1)); };

if (A.dati.squadre.length !== B.dati.squadre.length) throw new Error('squadre diverse');
const d = [], perSq = [];
let sumA = 0, sumB = 0, nTot = 0;
const forze = [], drA = [], drB = [];
for (let s = 0; s < A.dati.squadre.length; s++) {
  const sa = A.dati.squadre[s], sb = B.dati.squadre[s];
  if (sa.nome !== sb.nome) throw new Error('ordine diverso: ' + sa.nome + ' ' + sb.nome);
  if (sa.righe.length !== sb.righe.length) throw new Error('partite diverse');
  const dd = [];
  for (let i = 0; i < sa.righe.length; i++) { const x = gr(sb.righe[i]) - gr(sa.righe[i]); d.push(x); dd.push(x); }
  const ma = media(sa.righe.map(gr)), mb = media(sb.righe.map(gr));
  sumA += ma; sumB += mb; nTot++;
  forze.push(sa.forza); drA.push(ma); drB.push(mb);
  perSq.push({ nome: sa.nome, fz: sa.forza, prima: ma, dopo: mb, delta: media(dd) });
}
const m = media(d), sd = sig(d), se = sd / Math.sqrt(d.length);
const r = (x, y) => { const mx = media(x), my = media(y); let n = 0, a = 0, b = 0; for (let i = 0; i < x.length; i++) { n += (x[i] - mx) * (y[i] - my); a += (x[i] - mx) ** 2; b += (y[i] - my) ** 2; } return n / Math.sqrt(a * b); };

console.log('A=' + process.argv[2] + '  (taglia ' + A.taglia + ', seme ' + A.seme + ', partite ' + A.partite + ')');
console.log('B=' + process.argv[3] + '  (taglia ' + B.taglia + ', seme ' + B.seme + ', partite ' + B.partite + ')');
console.log('  coppie appaiate: ' + d.length);
console.log('  diff reti media  prima ' + (sumA / nTot).toFixed(3) + '   dopo ' + (sumB / nTot).toFixed(3));
console.log('  DELTA APPAIATO  ' + m.toFixed(3) + '   es ' + se.toFixed(3) + '   t = ' + (m / se).toFixed(2));
console.log('  r(forza, diff reti)  prima ' + r(forze, drA).toFixed(3) + '  ->  dopo ' + r(forze, drB).toFixed(3));
const gf = (o) => media([].concat(...o.dati.squadre.map(s => s.righe.map(x => x.gol[1]))));
const gs = (o) => media([].concat(...o.dati.squadre.map(s => s.righe.map(x => x.gol[0]))));
console.log('  gol fatti  ' + gf(A).toFixed(3) + ' -> ' + gf(B).toFixed(3) + '   subiti ' + gs(A).toFixed(3) + ' -> ' + gs(B).toFixed(3));
console.log('  squadra          fz    prima    dopo   delta');
for (const p of perSq) console.log('  ' + p.nome.padEnd(15) + String(p.fz).padEnd(4) + p.prima.toFixed(2).padStart(8) + p.dopo.toFixed(2).padStart(8) + p.delta.toFixed(2).padStart(8));
