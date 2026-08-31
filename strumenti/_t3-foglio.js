/* =====================================================================
   _t3-foglio.js — il FOGLIO A CONTATTO delle pose di festa, prima e
   dopo, riempite di nero come vuole il provino cieco.
   Non tocca il gioco: disegna due file e li mette uno sopra l'altro.

   Serve perche' i numeri ordinano ma non guardano: una posa che alza lo
   scavo e diventa un ragno lo alza lo stesso. Questo foglio esiste per
   essere GUARDATO, e per essere mostrato a chi non conosce la chiave.

   uso: node strumenti/_t3-foglio.js --prima fuori/anim-terza.html \
          --dopo fuori/_forgia.html --clip pugno --png fuori/_foglio.png
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
const PRIMA = arg('prima', 'fuori/anim-terza.html');
const DOPO = arg('dopo', 'fuori/_forgia.html');
const CLIP = arg('clip', 'pugno');
const PNG = arg('png', 'fuori/_foglio.png');
const NERO = arg('nero', '1') !== '0';
const CADENZA = { cielo: 0.45, pugno: 0.55, ginocchia: 0.50, esultanza: 2.4 };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const DISEGNA = (clip, cad, nero, etich) => `((clip, cad, nero, etich) => {
  const N=9, CW=104, CH=140, SC=2;
  const cv=document.createElement('canvas'); cv.width=N*CW*SC; cv.height=CH*SC;
  const g=cv.getContext('2d');
  g.scale(SC,SC);
  g.fillStyle='#f2f2f0'; g.fillRect(0,0,N*CW,CH);
  const K='#000';
  const look = nero ? {maglia:K,maglia2:K,pantaloncini:K,calze:K,risvolto:K,
      pelle:K,capelli:K,scarpe:K,palla:null,taglio:0,corp:3,varb:0,
      _lume:K,_ombra:K,_ombS:{maglia:K,maglia2:K,calze:K,pantaloncini:K,pelle:K}}
    : Rig3D.lookPredefinito;
  g.font='11px monospace'; g.textAlign='center';
  for(let i=0;i<N;i++){
    const el=i*0.2;
    const u = clip==='esultanza' ? (el*2.4)%1 : Math.min(0.99, el*cad);
    const cx=i*CW+CW/2, cy=CH-24;
    g.save();
    g.translate(cx,cy); g.scale(P_DIS,P_DIS); g.translate(-cx,-cy);
    Rig3D.disegna(g,cx,cy,RIG_H,Math.PI+0.38,'alto',clip,u/Rig3D.CLIPS[clip].freq,look,true,P_DIS);
    g.restore();
    g.fillStyle='#666'; g.fillText(el.toFixed(1)+'s  u'+u.toFixed(2), cx, CH-6);
    g.strokeStyle='#ccc'; g.beginPath(); g.moveTo(i*CW,0); g.lineTo(i*CW,CH); g.stroke();
  }
  g.fillStyle='#000'; g.textAlign='left'; g.font='bold 12px monospace';
  g.fillText(etich, 6, 14);
  return cv.toDataURL('image/png');
})(${JSON.stringify(clip)}, ${cad}, ${nero}, ${JSON.stringify(etich)})`;

(async () => {
  const srv = await servi();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 400 }, deviceScaleFactor: 1 });
  const fette = [];
  for (const [file, et] of [[PRIMA, 'PRIMA  ' + CLIP], [DOPO, 'DOPO   ' + CLIP]]) {
    const pag = await ctx.newPage();
    pag.on('pageerror', e => console.log('ECCEZIONE ' + file + ': ' + e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/${file}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(200);
    const dataurl = await pag.evaluate(DISEGNA(CLIP, CADENZA[CLIP] || 0.55, NERO, et));
    fette.push(dataurl);
    await pag.close();
  }
  /* i due nastri si scrivono direttamente su disco: passare da un <img>
     dentro una pagina e poi da uno screenshot ha gia' prodotto una volta
     un foglio bianco (l'immagine e' piu' larga della finestra). */
  const dest = path.resolve(RADICE, PNG);
  const png = [];
  for (const d of fette) png.push(Buffer.from(d.split(',')[1], 'base64'));
  fs.writeFileSync(dest.replace(/\.png$/, '-prima.png'), png[0]);
  fs.writeFileSync(dest.replace(/\.png$/, '-dopo.png'), png[1]);
  console.log('fogli in ' + PNG.replace(/\.png$/, '-prima.png') + ' e ' + PNG.replace(/\.png$/, '-dopo.png'));
  await browser.close(); srv.chiudi();
})();
