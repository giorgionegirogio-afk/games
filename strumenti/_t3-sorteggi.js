/* =====================================================================
   _t3-sorteggi.js — LA LEGGE SUI SORTEGGI, verificata invece che sperata.

   Il conto delle chiamate a dado() non deve cambiare fra due versioni
   del gioco. Qui si contano sul serio: si avvolge il generatore, si
   RISEMINA subito prima di ogni partita, e si fa girare la stessa
   partita a seme fisso sui due file.

   LA PROVA CHE SA FALLIRE, ed e' gia' fallita: dare lo STESSO file come
   --a e come --b. Se il verdetto non e' VERDE su tutte le taglie, e' lo
   strumento a essere rotto, non il gioco. (E' successo: vedi il cappello
   del generatore qui sotto.)

   Verde solo se il conto E il punteggio coincidono su tutte le taglie
   chieste. Un conto uguale con un punteggio diverso vorrebbe dire che i
   numeri pescati sono gli stessi ma vengono usati altrove: e' rosso lo
   stesso.

   uso: node strumenti/_t3-sorteggi.js --a fuori/A.html --b fuori/B.html \
          --taglie 5,7,11 --sec 90
   ===================================================================== */
const path = require('path');
const fs = require('fs');
const http = require('http');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const A = arg('a', ''), B = arg('b', '');
const TAGLIE = String(arg('taglie', '5,7,11')).split(',').map(Number).filter(Boolean);
const SEC = +arg('sec', 90);
const SEME = +arg('seme', 20260827);
if (!A || !B) { console.error('servono --a e --b'); process.exit(2); }

function servi() {
  return new Promise(ok => {
    const s = http.createServer((q, r) => {
      const f = path.join(RADICE, decodeURIComponent(q.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; }
      r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(r);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* IL GENERATORE, SEMINATO E CONTATO, CON LA RISEMINA A PORTATA DI MANO.
   LA PRIMA STESURA DI QUESTO FILE HA DETTO ROSSO SU UN FILE CONTRO SE
   STESSO, e va scritto perche' e' la trappola: seminava una volta sola
   all'avvio della pagina e poi faceva partire la partita. Ma fra il
   caricamento e il momento in cui il banco congela requestAnimationFrame
   passano DUE O TRE fotogrammi di splash che variano da corsa a corsa
   (misurato: G.pulse alla stessa scena oscilla di tre fotogrammi su tre
   corse dello stesso file). Quei fotogrammi consumano numeri, e la
   partita che parte dopo li trova spostati: due partite dello stesso
   gioco finivano 2-2 e 1-0. Adesso si RISEMINA subito prima di
   startMatch, come fa _z-verbo, e il conto riparte da li'. */
const SEMINA = `(() => {
  let s = 1, n = 0;
  const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; n++; return s >>> 0; };
  Math.random = () => prossimo() / 4294967296;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues)
    crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
  window.__caso = { semina(k) { s = k >>> 0 || 1; n = 0; }, quanti() { return n; } };
})()`;

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const br = await chromium.launch({ args: ['--no-sandbox'] });
  const apri = async file => {
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const pag = await ctx.newPage();
    await pag.addInitScript(SEMINA);
    await pag.goto('http://127.0.0.1:' + srv.porta + '/' + file, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(250);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    return { ctx, pag };
  };
  const misura = async (pag, taglia) => pag.evaluate(([taglia, sec, seme]) => {
    const t = window.__test;
    window.__caso.semina(seme);            // la risemina: vedi il cappello
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    t.setCpuVsCpu(true);
    let n = 0;
    while (t.state !== 'end' && n < 60 * sec) { t.simulate(1 / 60); t.disegna(); n++; }
    return { sorteggi: window.__caso.quanti(), punteggio: G.score.join('-'), fotogrammi: n };
  }, [taglia, SEC, SEME]);
  let rosso = 0;
  console.log('=== _t3-sorteggi — seme ' + SEME + ', ' + SEC + ' s per taglia ===');
  console.log('  A = ' + A + '\n  B = ' + B + '\n');
  const pa = await apri(A), pb = await apri(B);
  for (const t of TAGLIE) {
    const ra = await misura(pa.pag, t), rb = await misura(pb.pag, t);
    const ok = ra.sorteggi === rb.sorteggi && ra.punteggio === rb.punteggio && ra.fotogrammi === rb.fotogrammi;
    if (!ok) rosso++;
    console.log('  taglia ' + String(t).padStart(2) + ':  A ' + String(ra.sorteggi).padStart(7) + ' sorteggi, ' +
      ra.punteggio + ', ' + ra.fotogrammi + ' fotogrammi   |   B ' + String(rb.sorteggi).padStart(7) +
      ' sorteggi, ' + rb.punteggio + ', ' + rb.fotogrammi + ' fotogrammi   -> ' +
      (ok ? 'IDENTICI' : '*** DIVERSI ***'));
  }
  await pa.ctx.close(); await pb.ctx.close(); await br.close(); srv.chiudi();
  console.log('\n' + (rosso ? 'ROSSO: ' + rosso + ' taglie su ' + TAGLIE.length + ' non coincidono'
    : 'VERDE: stesso conto di sorteggi, stesso punteggio, stessi fotogrammi su tutte le taglie'));
  process.exit(rosso ? 1 : 0);
})();
