/* _158-tre-uomini.js — TRE UOMINI DA VICINO, cella 192 contro 144 (voce #158,
   compito 7). Apre il gioco, aspetta l'atlante, e su una tela sopra la pagina
   disegna tre look (pelle scura e capelli grigi; pelle media e capelli rossi;
   pelle media e capelli neri) a camera bassa, alti 400 px, prima col da-vicino
   aperto e poi chiuso. E' il foglio con cui si vede che pelle e capelli ci
   sono anche nella cella grande e che la stoffa non prende la carnagione.
   Scatto: strumenti/_158-prove/_dbg-vicino.png. Non e' un cancello.
   USO (server acceso): node strumenti/_158-tre-uomini.js [--gioco CALCETTO-il-gioco.html] */
const { chromium } = require('playwright');
const argv = process.argv.slice(2); const ia = argv.indexOf('--gioco'); const GIOCO = (ia >= 0 && argv[ia+1]) ? argv[ia+1].split(String.fromCharCode(92)).join('/') : 'CALCETTO-il-gioco.html';
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1000, height: 460 } });
  await pg.goto('http://127.0.0.1:8777/' + GIOCO, { waitUntil: 'load' });
  await pg.waitForFunction('window.__test && window.__test.sprite && window.__test.sprite.pronto', null, { timeout: 30000 });
  await pg.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 1000; c.height = 460; c.style.cssText = 'position:fixed;left:0;top:0;z-index:999999'; document.body.appendChild(c);
    const g = c.getContext('2d'); g.fillStyle = '#4a8a3a'; g.fillRect(0, 0, 1000, 460);
    const looks = [
      { maglia: '#1e88e5', pantaloncini: '#123a80', pelle: '#6e4429', capelli: '#8e867c', corp: 3 },
      { maglia: '#ffa3e5', pantaloncini: '#5a2a3a', pelle: '#c98d5a', capelli: '#7a3b1e', corp: 0 },
      { maglia: '#e8d8a0', pantaloncini: '#3a2a10', pelle: '#8d5a3b', capelli: '#101010', corp: 2 },
    ];
    Sprite3D.vicinoOn(true);
    Sprite3D.disegna(g, 80, 440, 400, Math.PI / 2, 'bassa', 'fermo', 0.3, looks[0], true, 1, 0);
    const t0 = Date.now(); while (!window.__test.sprite.vicino.pronto && Date.now() - t0 < 8000) await new Promise(r => setTimeout(r, 50));
    g.fillStyle = '#4a8a3a'; g.fillRect(0, 0, 1000, 460);
    g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.fillText('192 (da vicino)', 20, 20); g.fillText('144 (pianta ingrandita)', 520, 20);
    for (let i = 0; i < 3; i++) {
      Sprite3D.vicinoOn(true);  Sprite3D.disegna(g, 90 + i * 150, 440, 400, Math.PI / 2, 'bassa', i === 1 ? 'esultanza' : 'fermo', 0.3, looks[i], true, 1, 0);
      Sprite3D.vicinoOn(false); Sprite3D.disegna(g, 590 + i * 150, 440, 400, Math.PI / 2, 'bassa', i === 1 ? 'esultanza' : 'fermo', 0.3, looks[i], true, 1, 0);
    }
    Sprite3D.vicinoOn(true);
  });
  await pg.screenshot({ path: 'strumenti/_158-prove/_dbg-vicino.png', clip: { x: 0, y: 0, width: 1000, height: 460 } });
  console.log(JSON.stringify(await pg.evaluate(() => window.__test.sprite.vicino)));
  await b.close();
})().catch(e => { console.log('esploso', e.message); process.exit(2); });
