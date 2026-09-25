/* _158-confronto.js — PRIMA/DOPO appaiato: il rig e lo sprite, stessa
   clip, stessa imbardata, stessa altezza, fianco a fianco (voce #158).
   E' l'immagine con cui il committente giudica; non e' un cancello.
   Apre il provino sul gioco con la toppa, per ogni clip che ha sprite
   scatta la tela con S.sprite=0 e S.sprite=1 a due altezze (la figura
   grande da giudizio e la taglia di partita), e salva gli scatti in
   strumenti/_158-prove/confronto-<clip>-<h>.png (rig a sinistra, sprite
   a destra), piu' un foglio unico confronto.png.
   USO: node strumenti/_158-confronto.js [--gioco fuori/sprite/CALCETTO-sprite.html] [--h 320,50]
   Esce 0 se ha scattato, 2 se il provino non si aggancia. */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'fuori/sprite/CALCETTO-sprite.html').split('\\').join('/');
const ALT = (pren('--h') || '320,50').split(',').map(Number);
const FUORI = path.join(__dirname, '_158-prove');
(async () => {
  fs.mkdirSync(FUORI, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  await pg.goto('http://127.0.0.1:8777/strumenti/provino.html?gioco=' + encodeURIComponent(GIOCO), { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__provino && window.__provino.pronto, null, { timeout: 30000 }).catch(() => null);
  if (!(await pg.evaluate(() => !!(window.__provino && window.__provino.pronto)))) { console.log('  ??  provino non agganciato'); await b.close(); process.exit(2); }
  await pg.waitForTimeout(1500);
  const clipSprite = await pg.evaluate(() => { try { return (window.frames[0].eval('Sprite3D')).stato().clip; } catch (e) { return []; } });
  console.log('  clip con sprite:', clipSprite.join(', '));
  const tela = await pg.$('#tela');
  const scatti = [];
  for (const clip of clipSprite) for (const h of ALT) for (const yaw of [180, 54]) {
    const coppia = [];
    for (const sprite of [0, 1]) {
      await pg.evaluate(([clip, yaw, h, sprite]) => { window.__provino.imposta({ clip, yawDeg: yaw, h, sprite, via: false, u: 0.30, lod: 'auto', ombra: true }); window.__provino.disegna(); }, [clip, yaw, h, sprite]);
      await pg.waitForTimeout(120);
      const p = path.join(FUORI, `_t-${clip}-${h}-${yaw}-${sprite}.png`);
      await tela.screenshot({ path: p }); coppia.push(p);
    }
    scatti.push({ clip, h, yaw, coppia });
  }
  await b.close();
  // il montaggio lo fa Pillow: rig a sinistra, sprite a destra, un ritaglio centrato sulla figura
  const py = `
from PIL import Image, ImageDraw
import json, os
S=json.load(open(r'${path.join(FUORI, '_scatti.json').replace(/\\/g, '\\\\')}'))
tiles=[]
for s in S:
    a=Image.open(s['coppia'][0]).convert('RGB'); b=Image.open(s['coppia'][1]).convert('RGB')
    W,H=a.size; lato=min(W,H, int(s['h']*2.2)+80); cx,cy=W//2,int(H*0.55)
    box=(max(0,cx-lato//2), max(0,cy-lato//2), min(W,cx+lato//2), min(H,cy+lato//2))
    a=a.crop(box); b=b.crop(box)
    if s['h']<=60:
        k=4; a=a.resize((a.width*k,a.height*k),Image.NEAREST); b=b.resize((b.width*k,b.height*k),Image.NEAREST)
    t=Image.new('RGB',(a.width+b.width+12,a.height+28),(20,20,20)); t.paste(a,(0,28)); t.paste(b,(a.width+12,28))
    d=ImageDraw.Draw(t); d.text((4,6),'%s  yaw %d  h %d px   |   rig (sx)  ->  SPRITE (dx)'%(s['clip'],s['yaw'],s['h']),fill=(240,240,240))
    t.save(os.path.join(r'${FUORI.replace(/\\/g, '\\\\')}','confronto-%s-%d-%d.png'%(s['clip'],s['h'],s['yaw'])))
    tiles.append(t)
    for p in s['coppia']: os.remove(p)
w=max(t.width for t in tiles); h=sum(t.height for t in tiles)
F=Image.new('RGB',(w,h),(20,20,20)); y=0
for t in tiles: F.paste(t,(0,y)); y+=t.height
F.save(os.path.join(r'${FUORI.replace(/\\/g, '\\\\')}','confronto.png')); print('confronto.png', F.size)
`;
  fs.writeFileSync(path.join(FUORI, '_scatti.json'), JSON.stringify(scatti));
  fs.writeFileSync(path.join(FUORI, '_monta.py'), py);
  const { execSync } = require('child_process');
  console.log(execSync('python "' + path.join(FUORI, '_monta.py') + '"').toString().trim());
  fs.unlinkSync(path.join(FUORI, '_scatti.json')); fs.unlinkSync(path.join(FUORI, '_monta.py'));
  console.log('  scatti in', FUORI);
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
