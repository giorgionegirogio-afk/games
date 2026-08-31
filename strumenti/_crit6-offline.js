/* sonda critica: OFFLINE E' IL MODO NORMALE.
   Ogni richiesta verso il server viene ABORTITA (come un telefono in aereo)
   e contata. Si guarda:
     A) quante richieste partono all'avvio, senza toccare niente
     B) quante ne partono giocando un'amichevole intera
     C) cosa succede aprendo SFIDA senza rete: quanto aspetta, cosa dice,
        e se dopo si riesce a tornare e giocare
   uso: node strumenti/_crit6-offline.js fuori/sfidaui.html */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const prova = path.resolve(process.argv[2]);

function serviGioco(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const sg = await serviGioco(prova);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const richieste = [];
  await ctx.route('**://calcetto-rete.vercel.app/**', r => { richieste.push(r.request().url()); r.abort('internetdisconnected'); });
  const pag = await ctx.newPage();
  const errori = [], consErr = [];
  pag.on('pageerror', e => errori.push(e.message));
  pag.on('console', m => { if (m.type() === 'error') consErr.push(m.text()); });

  await pag.goto(`http://127.0.0.1:${sg.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(300);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  await pag.waitForTimeout(3000);
  console.log('A) richieste all\'avvio (3 s fermi al menu): ' + richieste.length + (richieste.length ? '  ' + richieste.join(' ') : ''));

  const primaB = richieste.length;
  // B) un'amichevole intera, senza toccare la sfida
  const b = await pag.evaluate(async () => {
    const t = window.__test;
    t.startMatch(5, 1);
    let f = 0;
    while (t.state !== 'end' && f < 60 * 60 * 10) { t.simulate(1 / 60); f++; }
    return { scena: t.state, passi: f, punteggio: t.score ? t.score.join('-') : '?' };
  });
  await pag.waitForTimeout(1200);
  console.log('B) amichevole intera: scena=' + b.scena + ' passi=' + b.passi + ' -> richieste in piu\': ' + (richieste.length - primaB));

  // torna al menu
  await pag.evaluate(() => { const t = window.__test; t.setScene && t.setScene('menu'); });
  await pag.waitForTimeout(200);

  // C) aprire SFIDA senza rete
  const primaC = richieste.length;
  const t0 = Date.now();
  const cliccato = await pag.evaluate(() => {
    const b = document.getElementById('btnSfida');
    if (!b) return 'NIENTE BOTTONE';
    b.click(); return 'ok';
  });
  console.log('C) click su SFIDA: ' + cliccato);
  // aspetta che la schermata compaia
  let visto = 0;
  for (let i = 0; i < 60; i++) {
    const v = await pag.evaluate(() => {
      const s = document.getElementById('sfida');
      if (!s) return null;
      const st = getComputedStyle(s);
      return { visibile: st.display !== 'none' && st.opacity !== '0', testo: (s.innerText || '').replace(/\s+/g, ' ').slice(0, 400) };
    });
    if (v && v.visibile) { visto = Date.now() - t0; console.log('   schermata visibile dopo ' + visto + ' ms'); break; }
    await pag.waitForTimeout(100);
  }
  await pag.waitForTimeout(9000);   // oltre il tetto di 8 s di Rete.chiama
  const finale = await pag.evaluate(() => {
    const s = document.getElementById('sfida');
    const st = s ? getComputedStyle(s) : null;
    return {
      visibile: !!st && st.display !== 'none',
      testo: s ? (s.innerText || '').replace(/\s+/g, ' ') : '',
      inCorso: (window.__test && window.__test.rete) ? window.__test.rete.inCorso : '?',
      stato: (window.__test && window.__test.rete) ? window.__test.rete.stato : '?',
      scena: window.__test ? window.__test.state : '?',
    };
  });
  console.log('   richieste tentate aprendo SFIDA: ' + (richieste.length - primaC));
  console.log('   dopo 9 s: visibile=' + finale.visibile + ' inCorso=' + finale.inCorso + ' stato=' + finale.stato + ' scena=' + finale.scena);
  console.log('   TESTO DELLA SCHERMATA: <<' + finale.testo.slice(0, 700) + '>>');
  await pag.screenshot({ path: path.join(RADICE, 'fuori', '_crit6-sfida-offline.png') });

  // D) si torna indietro e si gioca ancora?
  const d = await pag.evaluate(async () => {
    const b = document.getElementById('btnBackSfida');
    if (b) b.click();
    await new Promise(r => setTimeout(r, 300));
    const t = window.__test;
    t.startMatch(5, 1);
    let f = 0;
    while (t.state !== 'end' && f < 60 * 60 * 10) { t.simulate(1 / 60); f++; }
    return { scena: t.state, passi: f, punteggio: t.score ? t.score.join('-') : '?', seminato: !!(window.__test.semeAcceso ? window.__test.semeAcceso() : false) };
  });
  console.log('D) dopo SFIDA offline, un\'altra amichevole: scena=' + d.scena + ' passi=' + d.passi + ' ' + d.punteggio);

  console.log('errori di pagina: ' + errori.length + (errori.length ? '  ' + errori.join(' | ') : ''));
  console.log('errori in console: ' + consErr.length + (consErr.length ? '  ' + consErr.slice(0, 5).join(' | ') : ''));
  console.log('TOTALE richieste al server: ' + richieste.length);
  await browser.close(); sg.chiudi();
})();
