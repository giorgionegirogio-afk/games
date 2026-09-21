/* =====================================================================
   _sonda-132-rumore.js — IL RUMORE BIANCO MANGIA I SORTEGGI?
   (voce #132). Sonda diagnostica, non un cancello.

   IL SOSPETTO, nato da un rosso residuo del cancello della mentalita':
   Audio5.noiseBuf() (:10221-10225) riempie un buffer lungo un secondo
   di campionamento con dado(), cioe' col GENERATORE SEMINATO della
   partita. Il buffer si costruisce UNA volta sola per pagina, e QUANDO
   si costruisce dipende dall'audio: se il contesto non e' ancora
   sbloccato nessun suono suona e nessun dado si consuma.

   Se e' vero, due telefoni con storia audio diversa rigiocano lo stesso
   nastro su due flussi di sorteggi diversi — ed e' esattamente la
   famiglia di difetti di questo cantiere.

   uso:  node strumenti/_sonda-132-rumore.js
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  const r = await pag.evaluate(() => {
    const t = window.__test;
    const out = {};
    out.ctxPrima = !!Audio5.ctx;
    out.bufPrima = !!Audio5._nb;
    t.semina(20260921);
    out.sorteggi0 = t.sorteggi;
    Audio5.unlock();
    out.ctxDopoUnlock = !!Audio5.ctx;
    out.sorteggiDopoUnlock = t.sorteggi;
    out.sampleRate = Audio5.ctx ? Audio5.ctx.sampleRate : 0;
    try { Audio5.noiseBuf(); } catch (e) { out.errore = e.message; }
    out.bufDopo = !!Audio5._nb;
    out.sorteggiDopoBuf = t.sorteggi;
    return out;
  });

  console.log('=== IL RUMORE BIANCO E IL GENERATORE SEMINATO (voce #132) ===');
  console.log('  contesto audio prima dello sblocco: ' + r.ctxPrima + ', buffer: ' + r.bufPrima);
  console.log('  dopo Audio5.unlock(): contesto ' + r.ctxDopoUnlock + ', sample rate ' + r.sampleRate);
  console.log('  sorteggi: ' + r.sorteggi0 + ' -> ' + r.sorteggiDopoUnlock + ' (sblocco) -> ' +
              r.sorteggiDopoBuf + ' (noiseBuf)');
  console.log('  IL BUFFER COSTA ' + (r.sorteggiDopoBuf - r.sorteggiDopoUnlock) + ' SORTEGGI' +
              (r.errore ? ('  [' + r.errore + ']') : ''));
  if (r.sorteggiDopoBuf - r.sorteggiDopoUnlock > 0)
    console.log('\n  CONFERMATO: un suono che arriva a partita in corso sposta il flusso dei\n' +
                '  sorteggi di ' + (r.sorteggiDopoBuf - r.sorteggiDopoUnlock) + ' pesche. Chi rigioca il nastro con l\'audio in\n' +
                '  un altro stato NON rigioca la stessa partita.');
  else
    console.log('\n  NON confermato su questo gioco.');

  await browser.close(); srv.chiudi();
})();
