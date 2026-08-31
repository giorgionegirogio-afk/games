/* _crit3-terzo-fantasma.js — CRITICO 3 SU _t-mira.js
   IL PALLONE ARRIVA IN UN TERZO E IL CANCELLO NE GUARDA UN ALTRO.

   pkArrivo ACCENTRA il pallone del rigore calciato fuori tempo, e la riga
   nuova `s.aimU=A.u; s.aimV=A.v;` fa seguire al DISEGNO quel punto. Ma il
   cancello dell'esito e' rimasto `s.keeperZone===s.zone`, dove s.zone e'
   il terzo MIRATO. Quando l'accentramento porta il pallone dentro il
   terzo centrale e il portiere ha scelto il terzo centrale, il confronto
   fallisce (1 !== 0/2) e l'esito e' GOL CERTO — con il pallone disegnato
   addosso al portiere, ad altezza petto.

   Prima della toppa non poteva succedere: s.aimU non veniva mai
   riscritto, quindi il terzo del pallone disegnato ERA sempre s.zone.

   uso: node strumenti/_crit3-terzo-fantasma.js [file.html]
*/
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const PROVA = process.argv[2] ? path.resolve(RADICE, process.argv[2]) : '';
const SEME = 20260803;

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

(async () => {
  const srv = await servi(PROVA);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, SEME);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);

  const r = await pag.evaluate(([seme]) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    window.__caso.semina(seme);
    t.startMatch(1, 1, { size: 11 });
    t.setCpuVsCpu(true);
    const D = t.Duel;
    D.start(0);
    D.shooterHuman = true; D.keeperHuman = false;
    const terzo = u => u < -0.5 ? 0 : (u > 0.5 ? 2 : 1);
    const PROVE = 4000;
    const casi = [];
    /* mire LATERALI (terzo 0 o 2) col portiere che sceglie il CENTRO */
    for (const u of [-1.20, -0.80, 0.80, 1.20]) {
      for (const v of [0.24, 0.42, 0.60, 0.78]) {
        for (const q of [0.6, 0.3]) {
          const z = terzo(u);
          const conta = { gol: 0, parata: 0, fuori: 0 };
          let arr = null;
          for (let i = 0; i < PROVE; i++) {
            D.phase = 'zone'; D.aimU = u; D.aimV = v; D.mirato = true;
            D.zone = z; D.keeperZone = 1; D.powerQ = q; D.shown = false;
            D.resolve();
            conta[D.outcome]++;
            if (!arr) arr = { u: D.aimU, v: D.aimV };   // dove il DISEGNO manda il pallone
          }
          const tot = conta.gol + conta.parata + conta.fuori;
          casi.push({
            u, v, q, zMirato: z, zArrivo: terzo(arr.u),
            arrU: +arr.u.toFixed(4), arrV: +arr.v.toFixed(4),
            copertura: typeof window.pkCopertura === 'function'
              ? +window.pkCopertura(arr.u, arr.v, 1).toFixed(3) : -1,
            gol: +(100 * conta.gol / tot).toFixed(1),
            parata: +(100 * conta.parata / tot).toFixed(1),
            fuori: +(100 * conta.fuori / tot).toFixed(1),
          });
        }
      }
    }
    D.phase = 'off';
    return { casi, haPk: typeof window.pkCopertura === 'function' };
  }, [SEME]);

  if (!r.haPk) { console.log('pkCopertura non e\' globale su questo file'); }
  console.log('   u      v    pq  zMir zArr    A.u     A.v  copert.   gol%  par%  fuori%   VERDETTO');
  let n = 0;
  for (const c of r.casi) {
    const bugia = (c.zArrivo === 1 && c.zMirato !== 1);
    if (bugia) n++;
    console.log([c.u, c.v, c.q, c.zMirato, c.zArrivo, c.arrU, c.arrV, c.copertura,
      c.gol, c.parata, c.fuori].map(x => String(x).padStart(7)).join('') +
      '   ' + (bugia ? '<-- il pallone arriva nel terzo del PORTIERE ed e\' GOL' : ''));
  }
  console.log('\n  caselle con il pallone che finisce nel terzo dove sta il portiere: ' + n + ' su ' + r.casi.length);
  if (errori.length) console.log('ECCEZIONI: ' + errori.join(' | '));
  await ctx.close(); await browser.close(); srv.chiudi();
})();
