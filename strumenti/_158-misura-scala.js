/* _158-misura-scala.js — QUANTO E' ALTO lo sprite rispetto al rig, alla
   stessa hPx (voce #158). Il foglio a 50 px mostrava lo sprite piu'
   basso del rig: il rig aggiunge alla campata dei giunti il raggio della
   testa e la scarpa. Qui si MISURA, nel provino, l'altezza in pixel della
   sagoma (pixel non-sfondo) del rig e dello sprite sulla stessa clip,
   stessa imbardata, stessa hCss; il rapporto e' il numero che Sprite3D
   deve usare per non disegnare un uomo piu' piccolo di quello che c'era.
   USO: node strumenti/_158-misura-scala.js [--gioco fuori/sprite/CALCETTO-sprite.html]
   Non e' un cancello: stampa e basta. Esce 2 se il provino non si aggancia. */
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'fuori/sprite/CALCETTO-sprite.html').split('\\').join('/');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await pg.goto('http://127.0.0.1:8777/strumenti/provino.html?gioco=' + encodeURIComponent(GIOCO), { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__provino && window.__provino.pronto, null, { timeout: 30000 }).catch(() => null);
  const ok = await pg.evaluate(() => !!(window.__provino && window.__provino.pronto));
  if (!ok) { console.log('  ??  il provino non si e\' agganciato'); await b.close(); process.exit(2); }
  await pg.waitForTimeout(1500);   // l'atlante decodifica in differita
  const misura = async (clip, yawDeg, sprite) => pg.evaluate(([clip, yawDeg, sprite]) => {
    window.__provino.imposta({ clip, yawDeg, h: 420, sprite, via: false, u: 0.20, lod: 'off', ombra: false });
    window.__provino.disegna();
    const c = document.getElementById('tela'); const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    // lo sfondo del provino e' un verde piatto: un pixel e' figura se si
    // discosta dal colore dell'angolo in alto a sinistra
    const r0 = d[0], g0 = d[1], b0 = d[2];
    let y0 = 1e9, y1 = -1, x0 = 1e9, x1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      if (Math.abs(d[i] - r0) + Math.abs(d[i+1] - g0) + Math.abs(d[i+2] - b0) > 60) {
        if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x;
      }
    }
    return { h: y1 - y0 + 1, w: x1 - x0 + 1, y0, y1, dpr: c.width / c.clientWidth };
  }, [clip, yawDeg, sprite]);
  const righe = [];
  for (const clip of ['fermo', 'corsa']) for (const yaw of [180, 54, 90, 0]) {
    const R = await misura(clip, yaw, 0), S = await misura(clip, yaw, 1);
    righe.push({ clip, yaw, rig: R.h, sprite: S.h, rapporto: +(R.h / S.h).toFixed(3), piediRig: R.y1, piediSprite: S.y1 });
  }
  console.log('  clip      yaw   rig(px)  sprite(px)  rig/sprite   piedi rig / sprite');
  for (const r of righe) console.log('  ' + r.clip.padEnd(9) + String(r.yaw).padStart(4) + String(r.rig).padStart(9) + String(r.sprite).padStart(11) + String(r.rapporto).padStart(11) + '     ' + r.piediRig + ' / ' + r.piediSprite);
  const media = righe.filter(r => r.clip === 'fermo').reduce((s, r) => s + r.rapporto, 0) / 4;
  console.log('  rapporto medio su fermo: ' + media.toFixed(3));
  await b.close();
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
