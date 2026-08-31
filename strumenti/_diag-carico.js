/* =====================================================================
   _diag-carico.js — QUANTI METRI CORRE UN GIOCATORE, e per quanti
   secondi scatta, in una partita intera.

   PERCHE' ESISTE. Prima di scrivere una fatica bisogna sapere QUANTO
   lavoro c'e' da consumare: una condizione tarata sui novanta minuti
   non si muoverebbe di un punto in tre minuti, e una tarata a occhio
   svuoterebbe le gambe al primo minuto. Questo strumento non giudica
   niente: conta, giocatore per giocatore, lo spazio percorso e i
   secondi passati in scatto, e stampa la distribuzione. La taratura
   della condizione (vedi strumenti/_t-condizione.js) esce da qui.

   COME MISURA. Avvolge window.step come fa _eventi.js — nessun
   sorteggio in piu', nessun disegno — e prima di ogni passo salva la
   posizione di tutti, dopo il passo somma la distanza. Lo scatto lo
   legge dal campo p.sprint, che il gioco scrive gia' per conto suo.
   I PORTIERI SONO ESCLUSI dal campione (indice 0 e indice N di ogni
   formazione): non corrono, e la loro riga schiaccerebbe le mediane.

   LA PRIMA FOTOGRAFIA, ancorata (27 agosto 2026, gioco spedito, 12
   partite per taglia, semi 20260803.., CPU contro CPU, Normale,
   mediane per giocatore di movimento):

     taglia   secondi vivi   spazio percorso   secondi in scatto   u/s
      5v5         98,2          10.873              29,9          110,7
      7v7        144,4          15.711              36,8          108,8
     11v11       198,0          21.022              39,9          106,2

   La cosa da sapere prima di tarare qualunque fatica: L'ANDATURA E' LA
   STESSA A TUTTE E TRE LE TAGLIE (forbice 4%). Lo spazio percorso non
   dipende dal campo, dipende dal cronometro — e il cronometro scala col
   campo dal 26 agosto (durataPartita).

   SE IL GIOCO HA LA CONDIZIONE (p.cond, vedi strumenti/_t-condizione.js)
   lo strumento stampa anche tre righe in piu': la condizione a fine
   partita, gli acciacchi e i cambi. Sul gioco che non ce l'ha lo dice
   invece di inventare uno zero.

   uso:  node strumenti/_diag-carico.js --taglia 11 --partite 12
         node strumenti/_diag-carico.js --taglia 5 --partite 12
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}

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

const SONDA = `(() => {
  const passoVero = window.step;
  if (typeof passoVero !== 'function') return 'step non e\\' globale';
  window.__car = {
    dist: null, spr: null, sec: 0, cond: null,
    acc:0, cambi:-1, accTot:-1,
    azzera(){ this.dist=null; this.spr=null; this.sec=0; this.cond=null; this.acc=0; this.cambi=-1; this.accTot=-1; },
    leggi(){ return { dist:this.dist, spr:this.spr, sec:this.sec, cond:this.cond, acc:this.acc, cambi:this.cambi, accTot:this.accTot }; }
  };
  const PX = [], PY = [];
  window.step = function(){
    const dt = 1/60;
    const g = (typeof G !== 'undefined') ? G : null;
    const viva = g && (g.scene==='play'||g.scene==='kickoff'||g.scene==='golden');
    if (viva) {
      const n = g.players.length;
      if (!window.__car.dist) { window.__car.dist = new Array(n).fill(0); window.__car.spr = new Array(n).fill(0); }
      for (let i=0;i<n;i++){ PX[i]=g.players[i].x; PY[i]=g.players[i].y; }
      passoVero();
      for (let i=0;i<n;i++){
        const p=g.players[i];
        window.__car.dist[i] += Math.hypot(p.x-PX[i], p.y-PY[i]);
        if (p.sprint) window.__car.spr[i] += dt;
      }
      window.__car.sec += dt;
      window.__car.cond = g.players.map(p => (p.cond===undefined? -1 : p.cond));
      window.__car.acc = g.players.reduce((s,p)=>s+(p.acciacco?1:0),0);
      window.__car.cambi = g.cambi ? (g.cambi[0]+g.cambi[1]) : -1;
      window.__car.accTot = (g.stats && g.stats.acciacchi) ? (g.stats.acciacchi[0]+g.stats.acciacchi[1]) : -1;
      return;
    }
    return passoVero();
  };
  return 'ok';
})()`;

const mediana = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const quart = (a, q) => { const b = a.slice().sort((x, y) => x - y); const i = (b.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };
const media = a => a.reduce((s, x) => s + x, 0) / a.length;

(async () => {
  const taglia = +arg('taglia', 11);
  const partite = +arg('partite', 12);
  const semeBase = +arg('seme', 20260803);
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const srv = await servi(prova ? path.resolve(RADICE, prova) : null);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  pag.on('pageerror', e => console.error('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, semeBase);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('sonda: ' + inst);

  const perGioc = [], perSpr = [], perCond = [], perAcc = [], perCambi = [];
  let secTot = 0;
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([seme, taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__car.azzera();
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return window.__car.leggi();
    }, [(semeBase + i) >>> 0, taglia]);
    secTot += r.sec;
    r.dist.forEach((d, k) => { if (k % (r.dist.length / 2) !== 0) { perGioc.push(d); perSpr.push(r.spr[k]); } });
    if (r.cond) r.cond.forEach((c, k) => { if (c >= 0 && k % (r.cond.length / 2) !== 0) perCond.push(c); });
    perAcc.push(r.accTot >= 0 ? r.accTot : r.acc); perCambi.push(r.cambi);
  }
  await ctx.close(); await browser.close(); srv.chiudi();

  const f = x => x.toFixed(1).padStart(8);
  console.log(`=== CARICO — ${partite} partite, ${taglia} contro ${taglia}, semi ${semeBase}.. ===`);
  console.log(`  gioco: ${prova || 'CALCETTO-il-gioco.html (repo)'}`);
  console.log(`  secondi vivi a partita: ${(secTot / partite).toFixed(1)}`);
  console.log(`  campioni (giocatori di movimento): ${perGioc.length}`);
  console.log('  voce                        mediana   q25      q75      min      max      media');
  const r = (n, a) => console.log('  ' + n.padEnd(26) + f(mediana(a)) + f(quart(a, .25)) + f(quart(a, .75)) + f(Math.min(...a)) + f(Math.max(...a)) + f(media(a)));
  r('spazio percorso (unita)', perGioc);
  r('secondi in scatto', perSpr);
  r('spazio al secondo', perGioc.map((d, i) => d / (secTot / partite)));
  if (perCond.length) r('condizione a fine partita', perCond);
  else console.log('  condizione a fine partita: il campo p.cond non esiste in questo gioco');
  if (perCambi[0] >= 0) {
    r('acciacchi per partita', perAcc);
    r('cambi per partita', perCambi);
    console.log('  partite senza nessun cambio: ' + perCambi.filter(x => x === 0).length + '/' + perCambi.length);
    console.log('  partite senza acciacchi:   ' + perAcc.filter(x => x === 0).length + '/' + perAcc.length);
  }
})();
