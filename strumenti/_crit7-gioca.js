/* CRITICO: i numeri nuovi dei commenti di _t-vero.js, misurati sul file vero. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(RADICE, u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const TAGLIE = [[915,412],[812,375],[811,384],[845,402],[740,360],[568,320],[640,360],[700,360],[480,320]];
(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  console.log('GIOCO: ' + GIOCO + '\n');
  console.log('taglia    | ecc+860 | ecc-860 | .diff | .taglia | .ment | ment small | frase righe | box w');
  for (const [w, h] of TAGLIE) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const pg = await ctx.newPage();
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(250);
    const r = await pg.evaluate(async () => {
      const g = document.getElementById('gioca');
      if (typeof goScreen === 'function') goScreen(g); else { document.querySelectorAll('.ov').forEach(o=>o.classList.add('hidden')); g.classList.remove('hidden'); }
      await new Promise(r => requestAnimationFrame(()=>requestAnimationFrame(r)));
      await new Promise(r => setTimeout(r, 200));
      const H = s => { const e = document.querySelector(s); return e ? +e.getBoundingClientRect().height.toFixed(1) : null; };
      const ecc = () => { const e = document.getElementById('gioca'); return e.scrollHeight - e.clientHeight; };
      const small = document.querySelector('#gioca .ment small');
      const frase = document.querySelector('#gioca .frase.stretta');
      let fr = 0; if (frase) { const rg = document.createRange(); rg.selectNodeContents(frase); fr = rg.getClientRects().length; }
      const box = document.querySelector('#gioca .box');
      const con = ecc();
      /* spengo la regola degli 860 e rimisuro */
      const st = document.createElement('style'); st.id = 'spegni860';
      st.textContent = '@media (max-height:540px) and (min-width:700px){#gioca .box{max-width:min(94vw,640px) !important}#gioca .frase.stretta{max-width:min(94vw,640px) !important}}';
      document.head.appendChild(st);
      await new Promise(r => requestAnimationFrame(()=>requestAnimationFrame(r)));
      await new Promise(r => setTimeout(r, 120));
      let fr2 = 0; if (frase) { const rg = document.createRange(); rg.selectNodeContents(frase); fr2 = rg.getClientRects().length; }
      const senza = ecc();
      const boxW2 = box ? +box.getBoundingClientRect().width.toFixed(1) : null;
      const fraseH2 = frase ? +frase.getBoundingClientRect().height.toFixed(1) : null;
      st.remove();
      await new Promise(r => requestAnimationFrame(()=>requestAnimationFrame(r)));
      const fraseH1 = frase ? +frase.getBoundingClientRect().height.toFixed(1) : null;
      return { con, senza, boxW2, fraseH1, fraseH2, diff: H('#gioca .diff'), taglia: H('#gioca .taglia'), ment: H('#gioca .ment'),
               mentSmall: small ? getComputedStyle(small).display : 'assente',
               fraseRighe: fr, fraseRighe640: fr2,
               boxW: box ? +box.getBoundingClientRect().width.toFixed(1) : null,
               titolo: H('#gioca .sotto-titolo') };
    });
    console.log(`${(w+'x'+h).padEnd(9)} | ${String(r.con).padStart(7)} | ${String(r.senza).padStart(7)} | ${String(r.diff).padStart(5)} | ${String(r.taglia).padStart(7)} | ${String(r.ment).padStart(5)} | ${r.mentSmall.padEnd(10)} | box ${r.boxW} -> ${r.boxW2} | frase h ${r.fraseH1} -> ${r.fraseH2}`);
    await ctx.close();
  }
  await br.close(); srv.chiudi();
})();
