/* _158-persone.js — VENTIDUE UOMINI, NON UN CLONE (voce #158, compito 4).
   Nel provino, stessa clip e imbardata, disegna lo sprite con le sei
   carnagioni della tavolozza SKIN del gioco (capelli fissi) e con i sei
   colori della tavolozza HAIR (pelle fissa), e compone un foglio:
   strumenti/_158-prove/persone.png. E' l'immagine con cui si giudica se
   pelle e capelli per figura reggono; non e' un cancello.
   USO: node strumenti/_158-persone.js [--gioco CALCETTO-il-gioco.html] [--clip fermo] [--yaw 180] [--h 300] */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'CALCETTO-il-gioco.html').split(String.fromCharCode(92)).join('/');
const CLIP = pren('--clip') || 'fermo', YAW = +(pren('--yaw') || 180), H = +(pren('--h') || 300);
const FUORI = path.join(__dirname, '_158-prove');
(async () => {
  fs.mkdirSync(FUORI, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  await pg.goto('http://127.0.0.1:8777/strumenti/provino.html?gioco=' + encodeURIComponent(GIOCO), { waitUntil: 'load' });
  await pg.waitForFunction(() => window.__provino && window.__provino.pronto, null, { timeout: 30000 }).catch(() => null);
  if (!(await pg.evaluate(() => !!(window.__provino && window.__provino.pronto)))) { console.log('  ??  provino non agganciato'); await b.close(); process.exit(2); }
  await pg.waitForTimeout(1500);
  const tela = await pg.$('#tela');
  const scatti = [];
  const uno = async (pelle, capelli, nome) => {
    await pg.evaluate(([clip, yaw, h, pelle, capelli]) => { window.__provino.imposta({ clip, yawDeg: yaw, h, sprite: 1, via: false, u: 0.30, lod: 'off', ombra: false, pelle, capelli }); window.__provino.disegna(); }, [CLIP, YAW, H, pelle, capelli]);
    await pg.waitForTimeout(100);
    const p = path.join(FUORI, `_p-${nome}.png`); await tela.screenshot({ path: p }); scatti.push(p);
  };
  for (let i = 0; i < 6; i++) await uno(i, 0, 'pelle' + i);
  for (let i = 0; i < 6; i++) await uno(0, i, 'capelli' + i);
  await b.close();
  const py = `
from PIL import Image, ImageDraw
import os, json
S=json.load(open(r'${path.join(FUORI, '_persone.json').replace(/\\/g, '\\\\')}'))
tiles=[]
for p in S:
    im=Image.open(p).convert('RGB'); W,H=im.size; lato=int(${H}*1.3); cx,cy=W//2,int(H*0.55)
    tiles.append(im.crop((max(0,cx-lato//2), max(0,cy-lato//2), min(W,cx+lato//2), min(H,cy+lato//2))))
    os.remove(p)
w=tiles[0].width; h=tiles[0].height
F=Image.new('RGB',(w*6+70,h*2+60),(20,20,20)); d=ImageDraw.Draw(F)
d.text((8,8),'PELLE 1..6 (tavolozza SKIN del gioco), capelli 1',fill=(240,240,240))
d.text((8,h+38),'CAPELLI 1..6 (tavolozza HAIR), pelle 1',fill=(240,240,240))
for i,t in enumerate(tiles):
    r,c=divmod(i,6); F.paste(t,(c*w+ (0 if r==0 else 70), 30+r*(h+30)))
F.save(os.path.join(r'${FUORI.replace(/\\/g, '\\\\')}','persone.png')); print('persone.png', F.size)
`;
  fs.writeFileSync(path.join(FUORI, '_persone.json'), JSON.stringify(scatti));
  fs.writeFileSync(path.join(FUORI, '_persone.py'), py);
  console.log(require('child_process').execSync('python "' + path.join(FUORI, '_persone.py') + '"').toString().trim());
  fs.unlinkSync(path.join(FUORI, '_persone.json')); fs.unlinkSync(path.join(FUORI, '_persone.py'));
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
