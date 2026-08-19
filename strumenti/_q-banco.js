/* _q-banco.js — come strumenti/_banco.js, ma per TUTTA la batteria.
   Genera in strumenti/ una copia `_q-<nome>.js` di ogni cancello, in cui
   solo il risolutore di file del server e' toccato: se GIOCO_PROVA e'
   valorizzata, `/CALCETTO-il-gioco.html` viene servito da li'.
   Genera anche _q-tutti.js, che lancia le copie invece degli originali.
   uso: node strumenti/_q-banco.js */
const fs = require('fs');
const path = require('path');

const QUI = __dirname;
const CANCELLI = ['collaudo.js', 'misura.js', 'senza-rete.js', 'equita.js',
  'silhouette.js', 'folla.js', 'seme.js', 'gabbia.js', 'istantanea.js',
  'volti.js', 'giocata.js', 'avvio.js', 'scatta.js'];

const PRELUDIO = `
/* --- innesto di _q-banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\\.html$/i.test(f)) ? __PROVA : f;
`;

let fatti = 0; const saltati = [];
for (const nome of CANCELLI) {
  const src = path.join(QUI, nome);
  let t = fs.readFileSync(src, 'utf8');
  const mR = t.match(/^const RADICE = .*$/m);
  if (!mR) { saltati.push(nome + ' (RADICE)'); continue; }
  t = t.replace(mR[0], mR[0] + PRELUDIO);
  const mF = t.match(/const f = (path\.join\(RADICE,[\s\S]*?\));/);
  if (!mF) { saltati.push(nome + ' (risolutore)'); continue; }
  t = t.replace(mF[0], 'const f = __rid(' + mF[1] + ');');
  const nG = (t.match(/!f\.startsWith\(RADICE\)/g) || []).length;
  if (nG) t = t.replace(/!f\.startsWith\(RADICE\)/g, '(!f.startsWith(RADICE) && f !== __PROVA)');
  fs.writeFileSync(path.join(QUI, '_q-' + nome), t);
  fatti++;
}

/* tutti.js: stesso innesto sull'impronta del file + i comandi ai _q- */
{
  let t = fs.readFileSync(path.join(QUI, 'tutti.js'), 'utf8');
  const g = `const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');`;
  if (!t.includes(g)) { saltati.push('tutti.js (GIOCO)'); }
  else {
    t = t.replace(g, `const GIOCO = process.env.GIOCO_PROVA ? path.resolve(process.env.GIOCO_PROVA) : path.join(RADICE, 'CALCETTO-il-gioco.html');`);
    t = t.replace(/'strumenti\/([a-z-]+)\.js'/g, (m, n) => `'strumenti/_q-${n}.js'`);
    /* prestazione non serve il file da un server: lo legge. Ha gia' --oggi. */
    t = t.replace(`cmd: ['strumenti/_q-prestazione.js']`,
      `cmd: ['strumenti/prestazione.js', '--oggi', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html']`);
    fs.writeFileSync(path.join(QUI, '_q-tutti.js'), t);
    fatti++;
  }
}
console.log(`_q-banco: ${fatti} copie` + (saltati.length ? `; SALTATI: ${saltati.join(', ')}` : ''));
if (saltati.length) process.exitCode = 1;
