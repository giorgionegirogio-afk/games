/* =====================================================================
   _z-rotazione.js — SOLA MISURA, senza browser: rilegge il crudo di
   _z-verbo.js e non tocca niente.

   LA TERZA LEVA, che non era nell'elenco. L'identita' dice
       sigma2 = (hPx/1,9) * |sin(imbardata rispetto alla camera)|
   e le leve dichiarate erano due: l'imbardata della FIGURA e l'altezza
   hPx. Ce n'e' una terza, e vive nella stessa formula: l'imbardata
   della CAMERA. Oggi la trasformazione del mondo e' una traslazione
   piu' una scala uniforme (G.view: Ax, Ay, S2 — nessuna rotazione),
   quindi l'asse lungo del campo cade esattamente sull'orizzontale dello
   schermo e l'asse della porta esattamente sulla verticale. Se la vista
   ruotasse di fi attorno alla verticale, ogni figura vedrebbe la propria
   imbardata diventare (imbardata + fi) e sigma2 con lei.

   Questo strumento NON propone la rotazione: misura che cosa
   accadrebbe ai momenti gia' registrati, fi per fi, e stampa il costo
   e il guadagno di ciascun verbo. E' un conto su dati veri, non una
   simulazione nuova.

   uso: node strumenti/_z-rotazione.js [fuori/_zv-18.json]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const FILE = process.argv[2] || path.resolve(__dirname, '..', 'fuori', '_zv-18.json');
const D = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const VISIBILE = s => s === 'play' || s === 'golden' || s === 'kickoff' || s === 'goal';
const quart = (a, q) => { if (!a.length) return NaN; const b = a.slice().sort((x, y) => x - y); const i = (b.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };
const f = (x, d) => (isFinite(x) ? x.toFixed(d === undefined ? 2 : d) : ' -');

/* record: [verbo, clip, yaw, |sin|, hDev, sigma2, cam, scena, ctrl, palla, dPalla] */
const F = D.verbFrame.filter(r => r[6] === 'alto' && VISIBILE(r[7]));
const O = D.verbOnset.filter(r => r[6] === 'alto' && VISIBILE(r[7]));
const EST = D.est;
/* la larghezza del tratto piu' sottile, misurata da _z-verbo a hPx
   mediano, riscalata linearmente con hPx (la scala orizzontale del rig
   e' proporzionale a hPx: s = hPx/(1,9 cos E)) */
const hRif = quart(D.altAlto.map(r => r[0]), .5);
const WRIF = (D.spessore && D.spessore.q10) || 11;
const W = h => WRIF * h / hRif;

/* i pixel dell'asse sagittale di un record, con la vista ruotata di fi */
function pxSag(r, fi) {
  const e = EST[r[1]]; if (!e) return null;
  return e.dz_med * (r[4] / 1.9) * Math.abs(Math.sin(r[2] + fi));
}

const VS = ['tira', 'para', 'crossa', 'scivola', 'esulta', 'rovescia'];

console.log('\n=====================================================================');
console.log(' _z-rotazione — che cosa succede se la VISTA ruota di fi');
console.log(' crudo: ' + path.basename(FILE) + '   partite: ' + D.partite +
  '   fotogrammi di verbo (camera alto, visibili): ' + F.length);
console.log(' larghezza del tratto di riferimento: ' + WRIF + ' px a hPx ' + f(hRif, 1) + ' px');
console.log('=====================================================================\n');

const conta = (dati, fi) => {
  let n = 0, sotto = 0;
  for (const r of dati) { const p = pxSag(r, fi); if (p === null) continue; n++; if (p < W(r[4])) sotto++; }
  return n ? sotto / n * 100 : NaN;
};

console.log(' fi     TUTTI          ' + VS.map(v => v.padStart(9)).join(''));
console.log('        % sotto soglia (quanto spesso l\'asse sagittale sta sotto il tratto)');
const perVerbo = {};
for (const v of VS) perVerbo[v] = F.filter(r => r[0] === v);
for (let g = 0; g <= 90; g += 5) {
  const fi = g * Math.PI / 180;
  const riga = VS.map(v => (perVerbo[v].length ? f(conta(perVerbo[v], fi), 1) : '-').padStart(9)).join('');
  console.log(String(g).padStart(3) + 'gr ' + f(conta(F, fi), 1).padStart(8) + '%      ' + riga);
}

console.log('\n mediana di |sin(imbardata + fi)| per verbo:');
console.log(' fi     ' + VS.map(v => v.padStart(9)).join(''));
for (let g = 0; g <= 90; g += 5) {
  const fi = g * Math.PI / 180;
  console.log(String(g).padStart(3) + 'gr   ' +
    VS.map(v => (perVerbo[v].length ? f(quart(perVerbo[v].map(r => Math.abs(Math.sin(r[2] + fi))), .5), 3) : '-').padStart(9)).join(''));
}

console.log('\n gli stessi conti sugli INIZI di verbo (' + O.length + ' momenti):');
const perVerboO = {};
for (const v of VS) perVerboO[v] = O.filter(r => r[0] === v);
console.log(' fi     TUTTI          ' + VS.map(v => v.padStart(9)).join(''));
for (let g = 0; g <= 90; g += 15) {
  const fi = g * Math.PI / 180;
  console.log(String(g).padStart(3) + 'gr ' + f(conta(O, fi), 1).padStart(8) + '%      ' +
    VS.map(v => (perVerboO[v].length ? f(conta(perVerboO[v], fi), 1) : '-').padStart(9)).join(''));
}

/* LA DOMANDA LETTERALE: quanti pixel, in assoluto, ha l'asse sagittale */
console.log('\n QUANTI PIXEL, IN ASSOLUTO (vista non ruotata, camera 42 gradi):');
console.log(' px sagittali = dz(clip) x (hPx/1,9) x |sin(imbardata)|, per fotogramma di verbo');
{
  const px = [];
  for (const r of F) { const p = pxSag(r, 0); if (p !== null) px.push(p); }
  console.log('  n=' + px.length + '   min ' + f(Math.min(...px), 1) + '   q10 ' + f(quart(px, .10), 1) +
    '   q25 ' + f(quart(px, .25), 1) + '   MEDIANA ' + f(quart(px, .50), 1) +
    '   q75 ' + f(quart(px, .75), 1) + '   max ' + f(Math.max(...px), 1));
  for (const s of [1, 2, 3, 4, 8, 11, 16, 24]) {
    const q = px.filter(x => x < s).length / px.length * 100;
    console.log('   sotto ' + String(s).padStart(2) + ' px: ' + f(q, 1).padStart(6) + '%   ' + '#'.repeat(Math.round(q / 2)));
  }
  console.log('  per verbo (mediana dei px sagittali):');
  for (const v of VS) {
    const d = perVerbo[v]; if (!d.length) continue;
    const p = d.map(r => pxSag(r, 0)).filter(x => x !== null);
    console.log('    ' + v.padEnd(10) + 'n=' + String(p.length).padStart(6) + '   MED ' + f(quart(p, .5), 1).padStart(6) +
      '   q10 ' + f(quart(p, .10), 1).padStart(6) + '   sotto 4 px ' +
      f(p.filter(x => x < 4).length / p.length * 100, 1) + '%');
  }
}

/* e la seconda leva, per confronto: la stessa quota di momenti illeggibili
   in funzione dell'ALTEZZA della figura, a vista non ruotata */
console.log('\n E LA LEVA DELL\'ALTEZZA, per confronto (vista non ruotata):');
console.log(' la soglia cresce con hPx tanto quanto il segnale — il tratto e il');
console.log(' gesto si ingrandiscono insieme — quindi la frazione NON si muove.');
console.log(' Lo si verifica riscalando ogni record di un fattore k:');
console.log('  k      hPx mediano   % sotto soglia');
for (const k of [0.5, 0.75, 1, 1.5, 2, 3]) {
  let n = 0, sotto = 0;
  for (const r of F) {
    const e = EST[r[1]]; if (!e) continue;
    const h = r[4] * k;
    const p = e.dz_med * (h / 1.9) * r[3];
    n++; if (p < W(h)) sotto++;
  }
  console.log('  ' + String(k).padEnd(7) + f(hRif * k, 1).padStart(9) + '     ' + f(sotto / n * 100, 1) + '%');
}
console.log('\n (e infatti e\' cosi\': ingrandire la figura ingrandisce insieme il');
console.log('  segnale sagittale e il tratto che lo nasconde. L\'altezza compra');
console.log('  pixel ASSOLUTI — utile contro il pixel dello schermo e contro');
console.log("  l'antialias — ma non cambia il RAPPORTO fra gesto e tratto.)\n");
