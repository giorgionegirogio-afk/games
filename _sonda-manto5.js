/* _sonda-manto5.js — la coppia appaiata prima/dopo ALLA DIMENSIONE VERA.
   Stessa posa (posaFerma taglia 5), stesso ritaglio in pixel di canvas,
   nessun riscalamento: sinistra PRIMA (CALCETTO-il-gioco.html), destra
   DOPO (fuori/manto.html). Due fasce: manto+gesso, e manto con figure.
   Scrive fuori/manto-prima-dopo.png e i due interi fuori/manto-{prima,dopo}-intero.png */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { servi, bancoDiProva, semeFisso, posaFerma, disegnaFermo } =
  require(path.resolve(__dirname, 'strumenti/_posa.js'));

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const quadri = {};
  for (const [nome, file] of [['prima','CALCETTO-il-gioco.html'], ['dopo','fuori/manto.html']]) {
    const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2,
      isMobile:true, hasTouch:true, locale:'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, 20260819);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/${file}`, { waitUntil:'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout:15000 });
    await pag.waitForTimeout(400);
    await posaFerma(pag, { taglia: 5 });
    await disegnaFermo(pag);
    quadri[nome] = await pag.evaluate(() => cv.toDataURL('image/png'));
    await ctx.close();
  }
  /* composizione in una pagina nuda */
  const pag2 = await br.newPage();
  const b64 = await pag2.evaluate(async (Q) => {
    const carica = src => new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.src = src; });
    const A = await carica(Q.prima), B = await carica(Q.dopo);
    /* due ritagli a dimensione vera: manto+gesso (area sinistra) e centro con figure */
    const RIT = [ {x:330, y:280, w:520, h:260}, {x:760, y:300, w:520, h:260} ];
    const GAP = 6, ETI = 22;
    const W = 520*2 + GAP*3, H = ETI + (260 + GAP) * RIT.length + GAP;
    const cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H;
    const c = cv2.getContext('2d');
    c.fillStyle = '#101010'; c.fillRect(0,0,W,H);
    c.fillStyle = '#e8e8e8'; c.font = '700 14px sans-serif'; c.textAlign = 'center';
    c.fillText('PRIMA (1,67x, filtro spento)', GAP + 260, 15);
    c.fillText('DOPO (atlante di gioco, ~1:1)', GAP*2 + 520 + 260, 15);
    c.imageSmoothingEnabled = false;
    RIT.forEach((r, i) => {
      const y = ETI + i * (260 + GAP);
      c.drawImage(A, r.x, r.y, r.w, r.h, GAP, y, r.w, r.h);
      c.drawImage(B, r.x, r.y, r.w, r.h, GAP*2 + 520, y, r.w, r.h);
    });
    return cv2.toDataURL('image/png').split(',')[1];
  }, quadri);
  fs.writeFileSync('fuori/manto-prima-dopo.png', Buffer.from(b64, 'base64'));
  fs.writeFileSync('fuori/manto-prima-intero.png', Buffer.from(quadri.prima.split(',')[1], 'base64'));
  fs.writeFileSync('fuori/manto-dopo-intero.png', Buffer.from(quadri.dopo.split(',')[1], 'base64'));
  console.log('scritti fuori/manto-prima-dopo.png e i due interi');
  await br.close(); srv.chiudi();
})().catch(e => { console.error('FALLITO:', e); process.exit(1); });
