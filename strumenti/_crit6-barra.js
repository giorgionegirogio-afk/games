/* sonda critica: misura, per una griglia di formati,
   - fuori   = scrollWidth-clientWidth della .menu-voci
   - sotto   = voci col piede oltre innerHeight
   - taglio  = quanti px il TESTO di ogni voce esce dal parallelogramma
               (clip-path: al piede il bordo destro rientra di 14px)
   uso: node _crit-barra.js <gioco.html> [--formati a,b;c,d] */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = 'C:/Users/Utenteee/Desktop/GitHub/games';
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

const MISURA = () => {
  const g = document.querySelector('#menu .menu-voci');
  const voci = [...document.querySelectorAll('#menu .menu-voci .voce')];
  // il taglio: clip-path polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)
  // -> a quota y (0 in cima, h in fondo) il bordo destro sta a right - 14*y/h
  //    e il bordo sinistro a left + 14*(1 - y/h)
  const rettoDelTesto = el => {
    // rettangolo stretto del testo (non della scatola): Range sui nodi di testo
    let best = null;
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const r = document.createRange(); r.selectNodeContents(n);
        const rr = r.getBoundingClientRect();
        if (rr.width > 0) best = best ? { left: Math.min(best.left, rr.left), right: Math.max(best.right, rr.right), top: Math.min(best.top, rr.top), bottom: Math.max(best.bottom, rr.bottom) } : { left: rr.left, right: rr.right, top: rr.top, bottom: rr.bottom };
      }
    }
    return best;
  };
  const clip = getComputedStyle(voci[0] || document.body).clipPath || '';
  const det = [];
  let peggioTaglio = 0;
  for (const v of voci) {
    const box = v.getBoundingClientRect();
    const parti = [{ el: v, che: 'parola' }];
    const sm = v.querySelector('small');
    if (sm && getComputedStyle(sm).display !== 'none') parti.push({ el: sm, che: 'small' });
    for (const p of parti) {
      const t = rettoDelTesto(p.el);
      if (!t) continue;
      // il punto piu' stretto e' il piede del testo
      const yr = Math.min(1, Math.max(0, (t.bottom - box.top) / box.height));
      const limDx = box.right - 14 * yr;
      const limSx = box.left + 14 * (1 - yr);
      const fuoriDx = t.right - limDx;
      const fuoriSx = limSx - t.left;
      const tag = Math.max(fuoriDx, fuoriSx);
      if (tag > peggioTaglio) peggioTaglio = tag;
      if (tag > 0.5) det.push(v.id + '/' + p.che + ' +' + tag.toFixed(1));
    }
  }
  return {
    quante: voci.length,
    clipAttivo: /polygon/.test(clip),
    fuori: +(g.scrollWidth - g.clientWidth).toFixed(1),
    sotto: voci.filter(v => v.getBoundingClientRect().bottom > innerHeight + 0.5).length,
    scrollY: g.closest('#menu') ? (document.querySelector('#menu').scrollHeight - document.querySelector('#menu').clientHeight) : 0,
    taglio: +peggioTaglio.toFixed(1),
    det: det.join(' '),
    griglia: getComputedStyle(g).display,
  };
};

(async () => {
  const sg = await serviGioco(prova);
  const browser = await chromium.launch();
  const arg = process.argv.find(a => a.startsWith('--formati='));
  let SCHERMI;
  if (arg) {
    SCHERMI = arg.slice(10).split(';').map(s => { const [w, h] = s.split(',').map(Number); return { n: w + 'x' + h, w, h }; });
  } else {
    SCHERMI = [];
    for (const w of [568, 600, 640, 667, 700, 740, 780, 781, 800, 812, 850, 899, 900, 915, 960, 1024]) {
      for (const h of [320, 360, 375, 412, 450, 470]) SCHERMI.push({ n: w + 'x' + h, w, h });
    }
  }
  console.log('gioco: ' + prova);
  for (const s of SCHERMI) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, isMobile: s.w < 1000, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.goto(`http://127.0.0.1:${sg.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(120);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.waitForTimeout(80);
    const m = await pag.evaluate(MISURA);
    const rotto = (m.fuori > 0.5 || m.sotto > 0 || m.taglio > 0.5);
    console.log((rotto ? 'NO  ' : 'ok  ') + s.n.padEnd(9) + ' voci=' + m.quante + ' disp=' + m.griglia.padEnd(5) +
      ' fuori=' + String(m.fuori).padEnd(6) + ' sotto=' + m.sotto + ' taglio=' + String(m.taglio).padEnd(6) + ' ' + m.det);
    await ctx.close();
  }
  await browser.close(); sg.chiudi();
})();
