/* _z-banco.js — copia di _q-banco.js con prefisso _z-, per non pestare i
   piedi a chi sta gia' usando le copie _q-. Stesso identico innesto:
   se GIOCO_PROVA e' valorizzata, `/CALCETTO-il-gioco.html` arriva da li'.
   uso: node strumenti/_z-banco.js */
const fs = require('fs');
const path = require('path');

const QUI = __dirname;
const P = '_z-';
const CANCELLI = ['collaudo.js', 'misura.js', 'senza-rete.js', 'equita.js',
  'silhouette.js', 'folla.js', 'seme.js', 'gabbia.js', 'istantanea.js',
  'volti.js', 'giocata.js', 'avvio.js', 'scatta.js'];

const PRELUDIO = `
/* --- innesto di _z-banco.js: la radice resta il repo, ma il gioco puo'
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
  fs.writeFileSync(path.join(QUI, P + nome), t);
  fatti++;
}

{
  let t = fs.readFileSync(path.join(QUI, 'tutti.js'), 'utf8');
  const g = `const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');`;
  if (!t.includes(g)) { saltati.push('tutti.js (GIOCO)'); }
  else {
    t = t.replace(g, `const GIOCO = process.env.GIOCO_PROVA ? path.resolve(process.env.GIOCO_PROVA) : path.join(RADICE, 'CALCETTO-il-gioco.html');`);
    t = t.replace(/'strumenti\/([a-z-]+)\.js'/g, (m, n) => `'strumenti/${P}${n}.js'`);
    t = t.replace(`cmd: ['strumenti/${P}prestazione.js']`,
      `cmd: ['strumenti/prestazione.js', '--oggi', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html']`);
    fs.writeFileSync(path.join(QUI, P + 'tutti.js'), t);
    fatti++;
  }
}
console.log(`_z-banco: ${fatti} copie` + (saltati.length ? `; SALTATI: ${saltati.join(', ')}` : ''));
if (saltati.length) process.exitCode = 1;
