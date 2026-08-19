/* il percorso VERO, riletto sulla base di oggi (md5 804328ee32d205024df6c265465e4ef5):
   :10669  scossa(cattivo?7.4:5.0, 0.30, p.slideDX, p.slideDY)
   :10686  startFreeKick(carrier.team, p.team)
   nello STESSO fotogramma, e niente azzera G.shake in mezzo.
   Quanti fotogrammi di fase 'zone' hanno G.shake>0?

   E UNA COSA CHE IL RAPPORTO SI ERA PORTATO DIETRO SBAGLIATA: la direzione
   della scossa NON e' (0.80,0.60). E' (p.slideDX, p.slideDY), cioe' la
   direzione in cui il difensore stava scivolando — normalizzata, quindi di
   segno qualunque nei due assi. Il caso «a segni misti» non e' un caso di
   laboratorio: e' meta' dei falli. Qui sotto si tiene (0.80,0.60) perche'
   la domanda e' QUANTO DURA la scossa, che dal segno non dipende; i segni
   li spazza strumenti/_z-scossona.js, tutti e quattro i quadranti. */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const DIR = path.resolve(process.argv[2]), FILE = process.argv[3];
function servi(r) {
  return new Promise(ok => {
    const s = http.createServer((q, res) => {
      const f = path.join(r, decodeURIComponent(q.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi(DIR);
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(`http://127.0.0.1:${srv.porta}/${FILE}`, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__test && window.__test.state, null, { timeout: 30000 });
  await p.evaluate(() => window.__test.start ? window.__test.start() : null);
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const motoDefault = SAVE.moto;
    // esattamente le due righe del fallo, nell'ordine in cui il gioco le esegue
    scossa(7.4, 0.30, 0.80, 0.60);
    startFreeKick(0, 1);
    const traccia = [];
    for (let i = 0; i < 24; i++) {
      const SC = scossaOff();
      traccia.push({ f: i, fase: Duel.phase, shake: +G.shake.toFixed(4), sx: +SC[0].toFixed(2), sy: +SC[1].toFixed(2) });
      Duel.update(1 / 60);
      G.shake = Math.max(0, G.shake - 1 / 60);   // :28744
    }
    const scoperti = traccia.filter(t => t.fase === 'zone' && (t.sx !== 0 || t.sy !== 0));
    return { motoDefault, tot: traccia.length, scoperti: scoperti.length, primi: traccia.slice(0, 6), max: Math.max(...scoperti.map(t => Math.hypot(t.sx, t.sy))) };
  });
  console.log(`SAVE.moto di serie = ${r.motoDefault}`);
  console.log(`fotogrammi in fase 'zone' con scossa attiva dopo un fallo: ${r.scoperti} su ${r.tot}`);
  console.log(`scarto massimo della scossa in quei fotogrammi: ${r.max.toFixed(2)} px css (=${(r.max * 2).toFixed(1)} px di periferica a dpr2)`);
  console.table(r.primi);
  await b.close(); srv.chiudi();
})();
