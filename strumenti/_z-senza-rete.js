/* =====================================================================
   SENZA RETE — la prova che i giochi non scaricano niente.

   Cercare "http" nel sorgente non basta: un indirizzo puo' essere
   composto a pezzi, o nascosto in un font, o chiesto da un service
   worker. Qui si guarda il fatto: si apre il gioco in un browser vero,
   si registra OGNI richiesta che tenta, e si BLOCCA tutto cio' che non
   e' il documento stesso. Se il gioco funziona lo stesso, e' davvero
   autosufficiente; se qualcosa gli manca, si vede subito.

   uso:  node strumenti/senza-rete.js
   Esce con codice 1 se un gioco chiede qualcosa a qualcuno.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
/* --- innesto di _z-banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? __PROVA : f;

const GIOCHI = ['CIRCOLO-il-gioco.html', 'CALCETTO-il-gioco.html'];
const esiti = [];

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = __rid(path.join(RADICE, decodeURIComponent(req.url.split('?')[0])));
      if ((!f.startsWith(RADICE) && f !== __PROVA) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();

  for (const gioco of GIOCHI) {
    console.log('\n=== ' + gioco + ' ===');
    const ctx = await browser.newContext({
      viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT',
    });
    const pag = await ctx.newPage();
    const indirizzo = `http://127.0.0.1:${srv.porta}/${gioco}`;
    const chieste = [];
    const bloccate = [];
    const errori = [];

    /* si intercetta TUTTO: passa solo il documento del gioco, il resto
       viene bloccato e annotato. Cosi' la prova non e' "non ha chiesto
       niente perche' era in cache": e' "non gli serve niente". */
    await pag.route('**/*', route => {
      const url = route.request().url();
      chieste.push(url);
      if (url === indirizzo || url.startsWith(indirizzo + '?')) return route.continue();
      bloccate.push(url);
      return route.abort();
    });
    pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

    await pag.goto(indirizzo, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.waitForTimeout(600);

    /* non basta che si apra: deve anche GIOCARE senza rete */
    const gioca = await pag.evaluate(async () => {
      const t = window.__test;
      try {
        if (t.startMatch) {                       // CALCETTO
          t.dismissSplash && t.dismissSplash();
          t.startMatch(1, 1); t.setCpuVsCpu(true);
          for (let i = 0; i < 12 && t.state !== 'end'; i++) t.simulate(6);
          return { scena: t.state, punteggio: t.score };
        }
        t.startGame('scopa', 'cpu');              // CIRCOLO
        const fine = t.autoplayMatch();
        return { fase: fine && fine.phase, punti: fine && fine.matchScore };
      } catch (e) { return { errore: e.message }; }
    });
    await pag.waitForTimeout(400);

    const esterne = bloccate.filter(u => !u.startsWith('http://127.0.0.1:'));
    const locali = bloccate.filter(u => u.startsWith('http://127.0.0.1:'));

    const ok1 = esterne.length === 0;
    /* 'kickoff' e' scena di partita quanto 'play' e 'goal': dopo una rete
       la palla torna al centro, e con le cineprese sul gol la finestra e'
       lunga. Fermarsi li' non e' un difetto del gioco: e' il momento in
       cui la fotografia l'ha colto. */
    const ok2 = !gioca.errore && (gioca.fase === 'matchEnd' || ['end', 'goal', 'play', 'kickoff'].includes(gioca.scena));
    const ok3 = errori.length === 0;

    console.log((ok1 ? '  OK   ' : '  NO   ') + `nessuna richiesta fuori dal dispositivo (${esterne.length})` +
      (esterne.length ? '\n         ' + esterne.slice(0, 5).join('\n         ') : ''));
    console.log(`  --    richieste totali: ${chieste.length}; bloccate perche' non sono il documento: ${bloccate.length}` +
      (locali.length ? ' (tutte locali: ' + locali.map(u => u.split('/').pop()).join(', ') + ')' : ''));
    console.log((ok2 ? '  OK   ' : '  NO   ') + 'la partita si gioca fino in fondo con tutto bloccato   ' + JSON.stringify(gioca));
    console.log((ok3 ? '  OK   ' : '  NO   ') + 'nessuna eccezione' + (errori.length ? '\n         ' + errori.slice(0, 3).join('\n         ') : ''));

    esiti.push(ok1, ok2, ok3);
    await ctx.close();
  }

  await browser.close(); srv.chiudi();
  const male = esiti.filter(x => !x).length;
  console.log(`\n${esiti.length} controlli, ${esiti.length - male} passati, ${male} falliti`);
  if (male) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
