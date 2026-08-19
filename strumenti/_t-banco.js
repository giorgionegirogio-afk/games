/* =====================================================================
   _t-banco.js — le copie dei cancelli che sanno puntare a un gioco di
   prova. E' _banco.js con un solo cambio: le copie si chiamano
   _t-p-<nome> invece di _p-<nome>, cosi' due lavoranti che provano due
   toppe diverse nello stesso minuto non si sovrascrivono il banco a
   vicenda (e' successo: la cartella e' piena di _p-*, _q-*, _z-*).

   Il testo dei cancelli NON viene toccato in nessun altro punto: solo il
   risolutore di file del server, che con GIOCO_PROVA valorizzato serve
   quel file al posto di CALCETTO-il-gioco.html.

   uso:
     node strumenti/_t-banco.js
     GIOCO_PROVA=fuori/dopo.html node strumenti/_t-p-collaudo.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const QUI = __dirname;
const CANCELLI = ['collaudo.js', 'giocata.js', 'equita.js', 'istantanea.js', 'senza-rete.js', 'misura.js'];

const PRELUDIO = `\n/* --- innesto di _t-banco.js: la radice resta il repo, ma il gioco puo'\n   arrivare da fuori. Nessun altro comportamento e' toccato. --- */\nconst __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';\nconst __rid = f => (__PROVA && /CALCETTO-il-gioco\\.html$/i.test(f)) ? __PROVA : f;\n`;

let fatti = 0; const saltati = [];
for (const nome of CANCELLI) {
  const src = path.join(QUI, nome);
  if (!fs.existsSync(src)) { saltati.push(nome + ' (non c\'e\')'); continue; }
  let t = fs.readFileSync(src, 'utf8');
  const mR = t.match(/^const RADICE = .*$/m);
  if (!mR) { saltati.push(nome + ' (RADICE non trovata)'); continue; }
  t = t.replace(mR[0], mR[0] + PRELUDIO);
  const mF = t.match(/const f = (path\.join\(RADICE,[\s\S]*?\));/);
  if (!mF) { saltati.push(nome + ' (risolutore non trovato)'); continue; }
  t = t.replace(mF[0], 'const f = __rid(' + mF[1] + ');');
  const nG = (t.match(/!f\.startsWith\(RADICE\)/g) || []).length;
  if (nG !== 1) { saltati.push(nome + ` (guardia trovata ${nG} volte)`); continue; }
  t = t.replace('!f.startsWith(RADICE)', '(!f.startsWith(RADICE) && f !== __PROVA)');
  fs.writeFileSync(path.join(QUI, '_t-p-' + nome), t);
  fatti++;
}
console.log(`copie fatte: ${fatti}` + (saltati.length ? '\nsaltati:\n  ' + saltati.join('\n  ') : ''));
