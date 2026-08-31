/* Lo stesso delta appaiato, con l'errore standard calcolato in tre modi:
   (1) su 120 partite trattate come indipendenti  (quello dei due verbali)
   (2) raggruppato per SQUADRA  (10 gruppi)
   (3) raggruppato per SEME     (12 gruppi: il seme e' CONDIVISO fra le
       dieci squadre — semina(seme+i) e' la stessa chiamata per tutte) */
const fs = require('fs'), path = require('path');
const R = 'C:/Users/Utenteee/Desktop/GitHub/games';
const media = v => v.reduce((a, b) => a + b, 0) / v.length;
const sig = v => { const m = media(v); return Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / (v.length - 1)); };
const gr = r => (r.gol[1] | 0) - (r.gol[0] | 0);

function conto(fa, fb, etich) {
  const A = JSON.parse(fs.readFileSync(path.resolve(R, fa), 'utf8'));
  const B = JSON.parse(fs.readFileSync(path.resolve(R, fb), 'utf8'));
  const nS = A.dati.squadre.length, nP = A.dati.squadre[0].righe.length;
  const tutti = [], perSq = [], perSeme = Array.from({ length: nP }, () => []);
  for (let s = 0; s < nS; s++) {
    const sa = A.dati.squadre[s], sb = B.dati.squadre[s], dd = [];
    for (let i = 0; i < nP; i++) { const x = gr(sb.righe[i]) - gr(sa.righe[i]); tutti.push(x); dd.push(x); perSeme[i].push(x); }
    perSq.push(media(dd));
  }
  const m = media(tutti);
  const se1 = sig(tutti) / Math.sqrt(tutti.length);
  const se2 = sig(perSq) / Math.sqrt(perSq.length);
  const mSeme = perSeme.map(media);
  const se3 = sig(mSeme) / Math.sqrt(mSeme.length);
  console.log(etich.padEnd(34) + 'delta ' + m.toFixed(3).padStart(7) +
    '   t(120 indip) ' + (m / se1).toFixed(2).padStart(6) +
    '   t(per squadra,10) ' + (m / se2).toFixed(2).padStart(6) +
    '   t(per SEME,12) ' + (m / se3).toFixed(2).padStart(6));
  return { m, se1, se2, se3, mSeme };
}

console.log('--- il gioco di IERI (la coppia del primo critico) ---');
conto('fuori/car11-prima.json', 'fuori/car11-dopo.json', 'taglia 11 blocco 20260803');
conto('fuori/_c2-vecpri11b.json', 'fuori/_c2-vecdop11b.json', 'taglia 11 blocco 20261001');
console.log('--- il gioco di OGGI, la cura spedita ---');
conto('fuori/_c2-pri5.json', 'fuori/_c2-cand5.json', 'taglia  5 blocco 20260803');
conto('fuori/_c2-pri7.json', 'fuori/_c2-cand7.json', 'taglia  7 blocco 20260803');
conto('fuori/_c2-pri11.json', 'fuori/_c2-cand11.json', 'taglia 11 blocco 20260803');
conto('fuori/_c2-bpri11.json', 'fuori/_c2-bcand11.json', 'taglia 11 blocco 20261001');
console.log('--- punto (e): formaSquadre spenta (patch di prima stesura) ---');
const d1 = conto('fuori/_c2-pri11.json', 'fuori/_c2-dop11.json', 'taglia 11 patch 0,70, con spargimento');
const d2 = conto('fuori/_c2-pri11.json', 'fuori/_c2-knob11.json', 'taglia 11 patch 0,70, SENZA spargimento');

/* e la differenza fra i due, APPAIATA partita per partita: quanto vale
   davvero lo spargimento, con la sua incertezza accanto */
const P = JSON.parse(fs.readFileSync(path.resolve(R, 'fuori/_c2-dop11.json'), 'utf8'));
const Q = JSON.parse(fs.readFileSync(path.resolve(R, 'fuori/_c2-knob11.json'), 'utf8'));
const dif = [];
for (let s = 0; s < P.dati.squadre.length; s++)
  for (let i = 0; i < P.dati.squadre[s].righe.length; i++)
    dif.push(gr(P.dati.squadre[s].righe[i]) - gr(Q.dati.squadre[s].righe[i]));
const md = media(dif), sed = sig(dif) / Math.sqrt(dif.length);
console.log('  spargimento acceso MENO spento, appaiato: ' + md.toFixed(3) +
  '  es(120 indip) ' + sed.toFixed(3) + '  t ' + (md / sed).toFixed(2) +
  '   IC95 ~ [' + (md - 1.96 * sed).toFixed(3) + '; ' + (md + 1.96 * sed).toFixed(3) + ']');
