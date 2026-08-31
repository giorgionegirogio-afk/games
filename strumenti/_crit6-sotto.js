/* _crit6-sotto.js — LA SEZIONE CAMPO E' ANCORA SOTTO LA BARRA?
   Il centro che riceve il colpo non basta: il difetto fotografato sul
   telefono era «si legge CA...», cioe' il bottone TAGLIATO dalla fascia.
   Qui si misura la sovrapposizione geometrica fra .azioni e ogni pezzo
   della sezione CAMPO, a riposo, senza scorrere.
   uso: node strumenti/_crit6-sotto.js --gioco fuori/campocop.html */
const http = require('http'); const fs = require('fs'); const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const TAGLIE = [[811,384],[915,412],[812,375],[740,360],[640,360],[667,375],[568,320],[1024,600],[844,390],[736,414]];
(async () => {
  const { chromium } = require('playwright');
  const prova = arg('gioco', ''); const provaAbs = prova ? path.resolve(prova) : '';
  const browser = await chromium.launch();
  const srv = await servi(provaAbs);
  console.log('\n=== LA SEZIONE CAMPO E\' ANCORA SOTTO LA BARRA? ===  ' + (provaAbs || 'repo'));
  console.log('  «velo» = quanti px della voce stanno dentro il rettangolo di .azioni, a riposo.\n');
  console.log('  taglia     ecc   azioni.top   CAMBIA CAMPO y      velo   eti CAMPO y      velo   nome campo y     velo');
  for (const [w, h] of TAGLIE) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const pag = await ctx.newPage();
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
    await pag.evaluate(() => { const t = window.__test; if (t.dismissSplash) t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(() => { document.getElementById('btnGioca').click(); });
    await pag.waitForTimeout(250);
    const r = await pag.evaluate(() => {
      const g = document.getElementById('gioca'); g.scrollTop = 0;
      const az = g.querySelector('.azioni').getBoundingClientRect();
      const bt = document.getElementById('btnCambiaCampo').getBoundingClientRect();
      /* l'etichetta CAMPO e il nome del campo: si cercano per testo */
      let eti = null, nome = null;
      for (const e of g.querySelectorAll('.eti')) if (/CAMPO/i.test(e.textContent)) eti = e.getBoundingClientRect();
      const nm = document.getElementById('campoNomeGioca') || document.getElementById('nomeCampoGioca');
      if (nm) nome = nm.getBoundingClientRect();
      else { /* fallback: il fratello precedente del bottone */
        const p = document.getElementById('btnCambiaCampo').parentElement;
        if (p && p.previousElementSibling) nome = p.previousElementSibling.getBoundingClientRect();
      }
      const velo = q => q ? Math.max(0, Math.round(Math.min(q.bottom, az.bottom) - Math.max(q.top, az.top))) : -1;
      const f = q => q ? (Math.round(q.top) + '..' + Math.round(q.bottom)) : '—';
      return { ecc: g.scrollHeight - g.clientHeight, azt: Math.round(az.top), azb: Math.round(az.bottom),
        bt: f(bt), btv: velo(bt), eti: f(eti), etiv: velo(eti), nome: f(nome), nomev: velo(nome), vh: innerHeight };
    });
    console.log('  ' + (w + 'x' + h).padEnd(10) + String(r.ecc).padStart(4) + '   ' + String(r.azt).padStart(4) + '..' + String(r.azb).padEnd(6) +
      r.bt.padStart(10) + String(r.btv).padStart(9) + '   ' + r.eti.padStart(10) + String(r.etiv).padStart(8) + '   ' + r.nome.padStart(10) + String(r.nomev).padStart(8));
    await ctx.close();
  }
  await browser.close(); srv.chiudi();
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
