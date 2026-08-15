/* =====================================================================
   SILHOUETTE — il banco della sagoma.

   PERCHE' ESISTE. La verifica che la giuria ha promesso di usare non e'
   «la figura e' bella»: e' «riempila di nero, mostrala a quaranta pixel
   a un estraneo, fatti dire che azione sta facendo». Se non ci riesce,
   la posa non e' una posa. E' un cancello onesto e brutale, ma e' anche
   un cancello UMANO: non si puo' chiamare un estraneo venti volte in un
   pomeriggio, e senza una misura in mezzo lo sciame lavora alla cieca.

   Questo strumento e' il PRE-cancello. Apre la pagina con
   ?banco=silhouette, la pagina disegna dieci azioni a quaranta pixel
   con OGNI colore a nero — stessa Rig3D.disegna della partita, stessa
   camera, stessa scala: un banco che disegnasse a modo suo direbbe
   verde su una figura che in campo non esiste — e misura sulla maschera
   cinque proprieta' senza le quali nessuna sagoma puo' essere letta:

     inchiostro   quanto della scatola e' pieno, fra 0,28 e 0,52. Sotto
                  e' uno scheletro di fili, sopra e' un blocco.
     masse        almeno DUE strozzature nel profilo delle scansioni
                  orizzontali: il collo e il bacino. Sono i due minimi
                  che dicono «testa, busto, gambe» invece di «ovale».
     arti         almeno tre righe con due tratti neri separati nella
                  meta' bassa: due gambe, non un tronco di cono.
     forma        larghezza/altezza fra 0,35 e 0,75 in piedi; sopra
                  1,15 per scivolata e tuffo, che devono leggere
                  ORIZZONTALI.
     distinzione  distanza di Hamming su griglia 32x32 fra ogni coppia
                  delle dieci: >= 0,18. Un solo numero che meccanizza
                  insieme «le azioni si distinguono» e «mai due
                  giocatori nella stessa posa».

   Il banco ripete tutto su 3 corporature x 4 direzioni di marcia (0,
   90, 180, 270 gradi): la sagoma deve reggere anche di fronte e di
   spalle, che e' dove una posa costruita di profilo crolla.

   ESCE anche un PNG a contatto (foto-figure2-dopo/silhouette.png) con
   le dieci sagome, piu' la CHIAVE DI RISPOSTA separata su stdout: al
   provino umano si mostra il foglio, non la chiave.

   USO:  node strumenti/silhouette.js
         node strumenti/silhouette.js --dir foto-figure2-dopo
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const DIR = arg('dir', 'foto-figure2-dopo');
const DIST_MIN = 0.18;      // distanza di Hamming minima fra due sagome

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(RADICE, u === '/' ? 'index.html' : u);
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html'
          : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const pg = await br.newPage();
  const righe = [];
  pg.on('console', m => righe.push(m.text()));
  pg.on('pageerror', e => righe.push('ERRORE ' + e.message));
  /* cache-busting: senza, il browser rilegge il file di ieri */
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?banco=silhouette&t=${Date.now()}`);
  await pg.waitForTimeout(3000);
  await br.close(); srv.chiudi();

  const riga = righe.find(r => r.startsWith('[silhouette] '));
  if (!riga) {
    console.log('BANCO MUTO — la pagina non ha stampato niente.');
    for (const r of righe.slice(0, 12)) console.log('   ' + r);
    process.exit(1);
  }
  if (riga.includes('fallito')) { console.log(riga); process.exit(1); }
  const d = JSON.parse(riga.slice(13));

  const png = righe.find(r => r.startsWith('[silhouette-png] '));
  let dove = null;
  if (png) {
    const b64 = png.slice(png.indexOf(',') + 1);
    fs.mkdirSync(path.join(RADICE, DIR), { recursive: true });
    dove = path.join(RADICE, DIR, 'silhouette.png');
    fs.writeFileSync(dove, Buffer.from(b64, 'base64'));
  }

  console.log('\n=== SILHOUETTE: 10 sagome a 40 px, nero pieno ===\n');
  console.log('     azione                    inchiostro   forma   masse  arti');
  let rossi = 0;
  for (const f of d.fig) {
    const male = !(f.ok.inchiostro && f.ok.forma && f.ok.masse && f.ok.arti);
    if (male) rossi++;
    console.log(
      `  ${male ? 'X ' : '  '}${f.nome.padEnd(24)} ` +
      `${f.inchiostro.toFixed(3)}${f.ok.inchiostro ? ' ' : '!'}     ` +
      `${f.forma.toFixed(2)}${f.ok.forma ? ' ' : '!'}    ` +
      `${f.masse}${f.ok.masse ? ' ' : '!'}      ` +
      `${f.arti}${f.ok.arti ? '' : '!'}`);
  }
  const distOK = d.distanza >= DIST_MIN;
  console.log(`\n  distinzione: la coppia piu' vicina dista ${d.distanza.toFixed(3)} ` +
    `(minimo ${DIST_MIN}) — ${d.coppia}`);
  console.log(`  di fronte, di spalle, tre corporature: ${d.nGiri} sagome fuori misura su 120`);
  for (const gg of d.giri.slice(0, 10)) {
    console.log(`     corp ${gg.corp} a ${gg.yaw}gradi  ${gg.nome.padEnd(24)} ` +
      `inch ${gg.inchiostro} forma ${gg.forma} masse ${gg.masse} arti ${gg.arti}`);
  }
  /* --profilo stampa la scansione riga per riga: quando il banco dice
     «zero strozzature» questa e' l'unica domanda che resta */
  if (process.argv.includes('--profilo')) {
    for (const f of d.fig) {
      console.log(`\n  ${f.nome} — scatola ${f.bw}x${f.bh}`);
      console.log('     ' + (f.prof || []).join(' '));
    }
  }
  if (dove) console.log(`\n  foglio a contatto: ${dove}`);
  /* LA CHIAVE STA SOTTO, SEPARATA: al provino umano si mostra il PNG e
     basta. Una chiave stampata accanto alle figure e' un provino che si
     autorisponde. */
  console.log('\n  chiave di risposta (NON mostrarla a chi fa il provino):');
  console.log('     ' + d.fig.map((f, i) => (i + 1) + '. ' + f.nome).join('  ·  '));

  if (rossi === 0 && distOK && d.nGiri === 0) {
    console.log('\nVERDE: dieci sagome su dieci dentro le cinque misure, a ogni angolo ' +
      'e per ogni corporatura. Resta il provino umano: >= 8 su 10.\n');
  } else {
    console.log(`\nROSSO: ${rossi} sagome fuori misura di fronte, ` +
      `${d.nGiri} fuori misura girando, distinzione ${distOK ? 'ok' : 'INSUFFICIENTE'}.\n`);
    process.exit(1);
  }
})();
