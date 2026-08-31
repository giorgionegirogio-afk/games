/* =====================================================================
   _foto-store.js — LE FOTOGRAFIE PER LA SCHEDA DI GOOGLE PLAY.

   Prende le schermate che la Play Console chiede, dal gioco VERO in
   Chromium — niente montaggi, niente cornici: Play penalizza le
   schermate che non sono il gioco. Formati:
     · schermate telefono: 1920x1080 (16:9, dentro i limiti 320..3840)
     · immagine in evidenza: 1024x500 esatti (una scena di partita)

   Le scene si raggiungono come le raggiunge un giocatore (click sui
   bottoni veri) dove si puo', e con gli hook __test dove serve una
   partita in un momento interessante. Il seme e' fisso: le stesse
   fotografie escono uguali a ogni corsa, e si vede subito se una
   versione nuova le cambia.

   uso:  node strumenti/_foto-store.js            -> fuori/store/*.png
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const USCITA = path.join(RADICE, 'fuori', 'store');

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

async function pagina(browser, porta, larg, alt) {
  const ctx = await browser.newContext({
    viewport: { width: larg, height: alt }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  await pag.addInitScript(() => {
    let s = 20260831 >>> 0;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  });
  await pag.goto('http://127.0.0.1:' + porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });
  await pag.waitForTimeout(400);
  return { ctx, pag };
}

/* una partita portata a un momento vivo. La corsa a passo fisso blocca
   il filo della pagina: la TENDINA di cambio scena (#wipe) parte solo
   quando l'evaluate finisce, e una fotografia a 250 ms la prende a
   meta' schermo — misurato alla prima corsa di questo strumento. Dopo
   la corsa si aspetta il tempo VERO della tendina (e la partita
   continua da sola, che e' quello che si vuole fotografare). */
async function partitaViva(pag, taglia, secondi) {
  await pag.evaluate(([taglia, secondi]) => {
    const t = window.__test;
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    t.setCpuVsCpu(true);
    for (let i = 0; i < secondi * 60; i++) t.simulate(1 / 60);
  }, [taglia, secondi]);
  await pag.waitForTimeout(1600);
}

async function foto(pag, nome) {
  const f = path.join(USCITA, nome);
  await pag.screenshot({ path: f });
  console.log('  ' + nome + '  (' + Math.round(fs.statSync(f).size / 1024) + ' kB)');
}

(async () => {
  fs.mkdirSync(USCITA, { recursive: true });
  const srv = await servi();
  const browser = await chromium.launch();

  console.log('schermate 1920x1080:');
  {
    const { ctx, pag } = await pagina(browser, srv.porta, 1920, 1080);
    await foto(pag, '01-menu.png');
    await pag.click('#btnGioca'); await pag.waitForTimeout(500);
    await foto(pag, '02-gioca.png');
    /* tre candidate per taglia, a due secondi vere l'una dall'altra: la
       partita corre da sola e si sceglie a occhio il momento migliore */
    await partitaViva(pag, 5, 25);
    await foto(pag, '03-partita-5-a.png');
    await pag.waitForTimeout(2000); await foto(pag, '03-partita-5-b.png');
    await pag.waitForTimeout(2000); await foto(pag, '03-partita-5-c.png');
    await partitaViva(pag, 11, 40);
    await foto(pag, '04-partita-11-a.png');
    await pag.waitForTimeout(2000); await foto(pag, '04-partita-11-b.png');
    await pag.waitForTimeout(2000); await foto(pag, '04-partita-11-c.png');
    await ctx.close();
  }
  {
    const { ctx, pag } = await pagina(browser, srv.porta, 1920, 1080);
    await pag.click('#btnSpogliatoio'); await pag.waitForTimeout(400);
    await pag.click('#btnSquadra'); await pag.waitForTimeout(400);
    await foto(pag, '05-squadra.png');
    await ctx.close();
  }
  {
    const { ctx, pag } = await pagina(browser, srv.porta, 1920, 1080);
    await pag.click('#btnTorneo'); await pag.waitForTimeout(400);
    await foto(pag, '06-torneo.png');
    await ctx.close();
  }

  console.log('immagine in evidenza 1024x500:');
  {
    const { ctx, pag } = await pagina(browser, srv.porta, 1024, 500);
    await partitaViva(pag, 5, 30);
    await foto(pag, 'evidenza-1024x500-a.png');
    await pag.waitForTimeout(2000); await foto(pag, 'evidenza-1024x500-b.png');
    await pag.waitForTimeout(2000); await foto(pag, 'evidenza-1024x500-c.png');
    await ctx.close();
  }

  await browser.close(); srv.chiudi();
  console.log('fatte. Stanno in fuori/store/');
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });
