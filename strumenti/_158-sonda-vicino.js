/* _158-sonda-vicino.js — LA RIPRESA DEL GOL DA VICINO, cella da 192 contro
   cella da 144 (voce #158, compito 7). Prende in mano l'orologio del gioco
   (banco di istantanea.js), avvia una partita CPU contro CPU a taglia 5,
   forza un gol, fa correre la ripresa per un secondo e mezzo a fotogrammi
   veri e disegna LO STESSO istante due volte: col rubinetto del da-vicino
   aperto (atlante a 192, se pronto) e chiuso (144). Ritaglia la fascia
   centrale ingrandita x2. Foglio: strumenti/_158-prove/vicino-confronto.png.
   Stampa anche lo stato del da-vicino (decodificato? quante celle composte?).
   Non e' un cancello.
   USO: node strumenti/_158-sonda-vicino.js [--gioco fuori/sprite/vicino-prova.html] [--seme 3] */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'fuori/sprite/vicino-prova.html').split(String.fromCharCode(92)).join('/');
const SEME = +(pren('--seme') || 3);
const FUORI = path.join(__dirname, '_158-prove');
const DPR = 2.5;
const PY = String.raw`
from PIL import Image, ImageDraw
import os, json, sys
J=json.load(open(sys.argv[1], encoding='utf-8'))
A=Image.open(J['pA']).convert('RGB'); B=Image.open(J['pB']).convert('RGB')
W,H=A.size
box=(int(W*0.25), int(H*0.08), int(W*0.75), int(H*0.92))
a=A.crop(box); b=B.crop(box)
a=a.resize((a.width*2,a.height*2),Image.NEAREST); b=b.resize((b.width*2,b.height*2),Image.NEAREST)
F=Image.new('RGB',(a.width*2+40,a.height+40),(20,20,20)); d=ImageDraw.Draw(F)
d.text((8,8),'DA VICINO: cella 192 (atlante secondo)',fill=(240,240,240)); d.text((a.width+48,8),'cella 144 (atlante di pianta ingrandito)',fill=(240,240,240))
F.paste(a,(0,30)); F.paste(b,(a.width+40,30))
F.save(os.path.join(J['FUORI'],'vicino-confronto.png')); print('vicino-confronto.png',F.size)
`;
(async () => {
  fs.mkdirSync(FUORI, { recursive: true });
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 800, height: 370 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  await pg.addInitScript(() => {
    const PASSO = 1000 / 60; let t = 0, coda = [], muto = false;
    window.requestAnimationFrame = cb => { if (muto) return 0; coda.push(cb); return coda.length; };
    window.cancelAnimationFrame = () => {};
    try { performance.now = () => t; } catch (e) {}
    window.__banco = { passo(n) { for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } } return t; }, zitto() { muto = true; coda.length = 0; } };
  });
  const err = []; pg.on('pageerror', e => err.push(String(e)));
  await pg.goto('http://127.0.0.1:8777/' + GIOCO, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined && window.__test.sprite && window.__test.sprite.pronto', null, { timeout: 30000 });
  const esito = await pg.evaluate(async (seme) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.semina && t.semina(seme);
    t.startMatch(1, 1, { size: 5 });
    t.Tut && t.Tut.finish && t.Tut.finish(true);
    t.posaHUD && t.posaHUD(true);
    t.setCpuVsCpu && t.setCpuVsCpu(true);
    window.__banco.passo(180);
    const ok = t.forceGoal(0);
    /* fino alla ripresa, poi un secondo e mezzo dentro */
    let n = 0; while (!G.ripresa && n < 900) { window.__banco.passo(1); n++; }
    const dentro = !!G.ripresa;
    window.__banco.passo(90);
    /* la prima richiesta a camera bassa avvia la decodifica del secondo
       atlante: si aspetta che sia pronto (tempo vero), poi si ridisegna */
    const t0 = Date.now(); while (t.sprite.vicino && t.sprite.vicino.tavola && !t.sprite.vicino.pronto && !t.sprite.vicino.fallito && Date.now() - t0 < 8000) { await new Promise(r => setTimeout(r, 50)); }
    window.__banco.passo(2);
    window.__banco.zitto();
    return { gol: ok, dentro, passi: n, scena: G.scene, vicino: t.sprite.vicino };
  }, SEME);
  console.log('  esito:', JSON.stringify(esito));
  const scatta = async (nome) => { await pg.evaluate(() => { window.__test.disegna(); }); const p = path.join(FUORI, `vicino-${nome}.png`); await pg.screenshot({ path: p }); return p; };
  const pA = await scatta('192');
  await pg.evaluate(() => { window.__test.vicinoOn(false); });
  const pB = await scatta('144');
  const st = await pg.evaluate(() => { window.__test.vicinoOn(true); return window.__test.sprite.vicino; });
  console.log('  da vicino:', JSON.stringify(st));
  console.log('  errori di pagina:', err.length, err.slice(0, 3).join(' | '));
  await b.close();
  const j = path.join(FUORI, '_vicino.json'), s = path.join(FUORI, '_vicino.py');
  fs.writeFileSync(j, JSON.stringify({ pA, pB, FUORI }));
  fs.writeFileSync(s, PY);
  console.log(require('child_process').execSync('python "' + s + '" "' + j + '"').toString().trim());
  fs.unlinkSync(j); fs.unlinkSync(s);
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
