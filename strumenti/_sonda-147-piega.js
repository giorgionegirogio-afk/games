/* =====================================================================
   _sonda-147-piega.js — LA PIEGA DELLA SCHERMATA SFIDA, PRIMA E DOPO
   (voce #147, compito 1)

   Non e' un cancello: non ha soglie e non giudica. Misura e stampa, ai
   due formati che gli altri banchi usano gia' (800x360 di _q-sigillo B3
   e _q-carta D4, 915x412 di _q-carta), la posizione in pixel dei
   bersagli della disposizione:

     CERCA AVVERSARIO · la prima riga della lista · il primo GUARDA ·
     SFIDA DI CARTA a lista vuota · la voce nuova (se c'e') ·
     TORNA AL MENU · l'altezza scorribile della schermata

   Serve a due cose e a nessun'altra:
     1. registrare i numeri di PRIMA, per metterli nel banco come
        costanti MISURATE e non indovinate;
     2. rimisurarli DOPO, per dire con un numero se la voce nuova ha
        mosso la piega.

   uso:  node strumenti/_sonda-147-piega.js [--gioco fuori/x.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = n => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };
const GIOCO = arg('gioco');
const PROVA = GIOCO ? path.resolve(RADICE, GIOCO) : null;
if (PROVA && !fs.existsSync(PROVA)) { console.error('PROVA NULLA: ' + GIOCO); process.exit(3); }

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) f = PROVA;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* LA LETTURA STA IN UN POSTO SOLO, e il banco la ricopia parola per
   parola: due misure della stessa cosa scritte in due modi sono due
   misure diverse che aspettano di divergere. */
const LEGGI = `async () => {
  const t = window.__test;
  t.sfida.sfide = [];
  for (let i = 0; i < 5; i++) t.sfida.sfide.push({
    id: i + 1, attaccante: 'x', seme: '7' + i, taglia: 5, gol_a: 3, gol_d: 2,
    giocata: new Date().toISOString(), vista: i > 1, verificata: 0, nome: 'SQUADRA ' + i });
  t.sfida.apri();
  for (let i = 0; i < 60 && t.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
  t.sfida.dipingi();
  const r = e => { const x = e && e.getBoundingClientRect(); return x ? Math.round(x.bottom) : -1; };
  const out = {
    h: innerHeight,
    righe: document.querySelectorAll('#sfLista .sfriga').length,
    cerca: r(document.getElementById('btnSfidaCerca')),
    primaRiga: r(document.querySelector('#sfLista .sfriga')),
    primoGuarda: r(document.querySelector('#sfLista [data-guarda]')),
  };
  t.sfida.sfide = [];
  t.sfida.dipingi();
  out.cartaVuota = r(document.getElementById('btnSfidaCarta'));
  out.discoVuota = r(document.getElementById('btnSfidaDischetto'));
  out.menuVuota = r(document.getElementById('btnBackSfida'));
  const ov = document.getElementById('sfida');
  out.scorribile = ov ? ov.scrollHeight : -1;
  return out;
}`;

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  try {
    for (const vp of [{ width: 800, height: 360 }, { width: 915, height: 412 }]) {
      const ctx = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag = await ctx.newPage();
      await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
      await pag.waitForTimeout(150);
      await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
      const m = await pag.evaluate(eval('(' + LEGGI + ')'));
      console.log(vp.width + 'x' + vp.height + '  piega ' + m.h +
        ' · righe ' + m.righe +
        ' · CERCA@' + m.cerca +
        ' · primaRiga@' + m.primaRiga +
        ' · GUARDA@' + m.primoGuarda +
        ' · CARTA(vuota)@' + m.cartaVuota +
        ' · DISCHETTO(vuota)@' + m.discoVuota +
        ' · MENU(vuota)@' + m.menuVuota +
        ' · scorribile ' + m.scorribile);
      await ctx.close();
    }
  } finally {
    await browser.close();
    srv.chiudi();
  }
})().catch(e => { console.error('BANCO ESPLOSO: ' + e.message); process.exit(2); });
