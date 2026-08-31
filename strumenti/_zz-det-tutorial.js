/* =====================================================================
   _zz-det-tutorial.js — LA PROVA A DI _q-determinismo.js, COL TUTORIAL
   SPENTO.

   UN'IPOTESI PROVATA E SMENTITA, e sta qui perche' nessuno la riprovi.

   La prova A di strumenti/_q-determinismo.js gioca due volte di fila lo
   stesso seme sulla stessa pagina e chiede che le due partite siano
   identiche. E' l'unico banco di casa che NON spegne il tutorial
   (_eventi.js e _q-meta.js fanno "t.save.tutorialDone = 1" subito dopo
   dismissSplash; questo no), e il tutorial e' davvero uno stato che
   sopravvive: nella prima partita Tut.active vale true e Tut.step 0, il
   tutorial si completa, scrive SAVE.tutorialDone, e nella seconda
   partita e' spento. Sembrava la spiegazione ovvia della prova A rossa.

   NON LO E'. Misurato con questo strumento, 12 semi da 20260803:
     gioco spedito           col tutorial 1/12 rotte, senza tutorial 1/12
     con la cura dello spazio             4/12                     4/12
   Identico. Il tutorial e' un'asimmetria vera fra le due partite e non
   sposta nulla, perche' in CPU contro CPU (setCpuVsCpu) il tutorial non
   riceve mai un evento e non tocca la fisica.
   Il colpevole vero e' G.recT — la FASE del cronometro dell'anello della
   moviola — e lo trova strumenti/_zz-det-bisez.js.

   Lo strumento resta perche' l'asimmetria del tutorial nella prova A
   esiste ancora e prima o poi qualcuno la notera': questo dice, con dei
   numeri, che non e' quella.

   uso: node strumenti/_zz-det-tutorial.js [--gioco fuori/x.html]
        [--partite 12] [--seme 20260803]
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const provaRel = arg('gioco', '');
const SEME = +arg('seme', 20260803), N = +arg('partite', 12);

function servi(prova) {
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

/* la stessa impronta, carattere per carattere, di _q-determinismo.js */
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  const browser = await chromium.launch();

  async function passata(spegniTutorial) {
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(s0 => {
      let s = s0 >>> 0 || 1;
      const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => pr() / 4294967296;
      window.__caso = { semina(n) { s = n >>> 0 || 1; } };
    }, SEME);
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined');
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    if (spegniTutorial) await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    const gioca = seme => pag.evaluate(([seme, IMPR]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      t.startMatch(1, 1);
      t.setCpuVsCpu(true);
      const leggi = new Function('return ' + IMPR);
      const im = [];
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(1); sim += 1; im.push(leggi()); }
      return im;
    }, [seme, IMPRONTA]);
    let rotte = 0;
    const dove = [];
    for (let i = 0; i < N; i++) {
      const s = (SEME + i) >>> 0;
      const u = await gioca(s), d = await gioca(s);
      let k = -1;
      const m = Math.min(u.length, d.length);
      for (let j = 0; j < m; j++) if (u[j] !== d[j]) { k = j; break; }
      if (k < 0 && u.length !== d.length) k = m;
      if (k >= 0) { rotte++; dove.push(s + '@' + k); }
    }
    await ctx.close();
    return { rotte, dove };
  }

  const con = await passata(false);
  const senza = await passata(true);
  console.log('=== PROVA A, ' + N + ' semi da ' + SEME + (provaRel ? ', gioco ' + provaRel : ', gioco spedito') + ' ===');
  console.log('  col tutorial acceso (come fa _q-determinismo.js): ' + con.rotte + '/' + N + ' rotte  ' + con.dove.join(' '));
  console.log('  col tutorial spento (come fanno tutti gli altri): ' + senza.rotte + '/' + N + ' rotte  ' + senza.dove.join(' '));
  await browser.close(); srv.chiudi();
})();
