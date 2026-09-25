/* _158-scatto-partita.js — LA PARTITA VERA, stesso istante, due grafiche.
   Apre il gioco con la toppa degli sprite, avvia una partita CPU contro
   CPU a taglia 5 (ordine sacro: startMatch PRIMA, setCpuVsCpu DOPO), la
   porta avanti di N secondi a passo fisso, e scatta lo STESSO fotogramma
   con gli sprite accesi e col rubinetto chiuso (rig): e' il confronto che
   il committente puo' giudicare senza provino. Scatti in
   strumenti/_158-prove/partita-sprite.png e partita-rig.png, piu' un
   ritaglio ingrandito x3 attorno al pallone (partita-*-zoom.png).
   USO: node strumenti/_158-scatto-partita.js [--gioco fuori/sprite/CALCETTO-sprite.html] [--secondi 25] [--seme 7]
   Non e' un cancello. Esce 2 se il gioco non si apre. */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'fuori/sprite/CALCETTO-sprite.html').split('\\').join('/');
const SEC = +(pren('--secondi') || 25);
const FUORI = path.join(__dirname, '_158-prove');
(async () => {
  fs.mkdirSync(FUORI, { recursive: true });
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 800, height: 370 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
  const err = []; pg.on('pageerror', e => err.push(String(e)));
  await pg.goto('http://127.0.0.1:8777/' + GIOCO, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pg.waitForTimeout(800);
  await pg.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1, { size: 5 });
    t.Tut && t.Tut.finish && t.Tut.finish(true);
    t.posaHUD && t.posaHUD(true);
    t.setCpuVsCpu && t.setCpuVsCpu(true);
  });
  try {
    await pg.waitForFunction(() => {
      const w = document.getElementById('wipe');
      if (w && getComputedStyle(w).display !== 'none') return false;
      const s = document.getElementById('splash');
      if (s) { const cs = getComputedStyle(s); if (cs.display !== 'none' && +cs.opacity > 0.02) return false; }
      return true;
    }, null, { polling: 60, timeout: 15000 });
  } catch (e) { console.log('  ATTENZIONE: strati del DOM ancora presenti dopo 15 s'); }
  // avanti di SEC secondi di orologio VERO: il gioco gira col suo ciclo
  // di disegno (requestAnimationFrame), che e' quello che si vuole
  // fotografare. Non e' ripetibile al bit e non deve esserlo: e' uno
  // scatto per l'occhio, non una misura.
  await pg.waitForTimeout(SEC * 1000);
  const st = await pg.evaluate(() => window.__test.sprite);
  console.log('  sprite:', JSON.stringify({ on: st.on, pronto: st.pronto, tinte: st.tinte, clip: st.clip }));
  const scatta = async (nome) => {
    const p = path.join(FUORI, 'partita-' + nome + '.png');
    await pg.screenshot({ path: p });
    return p;
  };
  const pS = await scatta('sprite');
  await pg.evaluate(() => { window.__test.spriteOn(false); });
  await pg.waitForTimeout(120);          // un paio di fotogrammi: l'azione e' quasi la stessa
  const pR = await scatta('rig');
  await pg.evaluate(() => { window.__test.spriteOn(true); });
  // le clip disegnate in quel fotogramma: la prova che gli sprite hanno lavorato
  const pose = await pg.evaluate(() => (window.__test.poseInCampo ? window.__test.poseInCampo() : null));
  if (pose) console.log('  pose in campo:', JSON.stringify(pose).slice(0, 300));
  console.log('  errori di pagina:', err.length, err.slice(0, 3).join(' | '));
  await b.close();
  // ingrandimento x3 del centro dell'azione (la fascia centrale del quadro)
  const py = `
from PIL import Image
import os
for n in ('sprite','rig'):
    im=Image.open(os.path.join(r'${FUORI.replace(/\\/g, '\\\\')}','partita-%s.png'%n))
    W,H=im.size
    box=(int(W*0.30), int(H*0.15), int(W*0.70), int(H*0.85))
    z=im.crop(box); z=z.resize((z.width*2, z.height*2), Image.NEAREST)
    z.save(os.path.join(r'${FUORI.replace(/\\/g, '\\\\')}','partita-%s-zoom.png'%n))
print('zoom ok')
`;
  fs.writeFileSync(path.join(FUORI, '_zoom.py'), py);
  console.log(require('child_process').execSync('python "' + path.join(FUORI, '_zoom.py') + '"').toString().trim());
  fs.unlinkSync(path.join(FUORI, '_zoom.py'));
  console.log('  scatti:', pS, pR);
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
