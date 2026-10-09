/* _158-clip-nuove.js — LE DIECI CLIP CHE ERANO IN PRESTITO, viste (voce #158,
   compito 5). Nel provino, per ogni clip della terza quota di Nano Banana
   (filtrante, cross, rinvio, rovesciata, finta, presa, pugni, respinta,
   sfugge, cielo) disegna lo sprite nelle otto imbardate e, nell'ultima
   colonna, il rig alla stessa fase: e' il foglio con cui si giudica se la
   posa fotografica dice la stessa cosa della posa disegnata e se la
   statura dichiarata in piano.json e' giusta (lo sprite deve stare
   nell'altezza del rig, non piu' alto ne' piu' basso). Non e' un cancello.
   USO (col server acceso: python -m http.server 8777 --bind 127.0.0.1):
     node strumenti/_158-clip-nuove.js [--gioco CALCETTO-il-gioco.html] [--h 220] [--clip a,b,c]
   Uscita: strumenti/_158-prove/clip-nuove.png */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'CALCETTO-il-gioco.html').split(String.fromCharCode(92)).join('/');
const H = +(pren('--h') || 220);
const CLIP = (pren('--clip') || 'filtrante,cross,rinvio,rovesciata,finta,presa,pugni,respinta,sfugge,cielo').split(',');
/* la fase a cui il rig mostra il gesto pieno (vedi le pose nel gioco):
   per i gesti con contatto e' l'istante del contatto, per le esultanze il
   culmine */
const FASE = { filtrante: 0.42, cross: 0.42, rinvio: 0.48, rovesciata: 0.44, finta: 0.26, presa: 0.42, pugni: 0.32, respinta: 0.20, sfugge: 0.18, cielo: 0.30 };
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
  for (const clip of CLIP) {
    const u = FASE[clip] != null ? FASE[clip] : 0.3;
    const riga = [];
    for (let d = 0; d < 9; d++) {
      const yaw = (d % 8) * 45, sprite = d < 8 ? 1 : 0;
      await pg.evaluate(([clip, yaw, h, u, sprite]) => { window.__provino.imposta({ clip, yawDeg: yaw, h, sprite, via: false, u, lod: 'off', ombra: false }); window.__provino.disegna && window.__provino.disegna(); }, [clip, yaw, H, u, sprite]);
      await pg.waitForTimeout(80);
      const p = path.join(FUORI, `_c-${clip}-${d}.png`); await tela.screenshot({ path: p }); riga.push(p);
    }
    scatti.push({ clip, riga });
  }
  await b.close();
  const py = `
from PIL import Image, ImageDraw
import os, json
S=json.load(open(r'${path.join(FUORI, '_clip.json').replace(/\\/g, '\\\\')}'))
lato=int(${H}*1.25)
righe=[]
for r in S:
    tiles=[]
    for p in r['riga']:
        im=Image.open(p).convert('RGB'); W,Hh=im.size; cx,cy=W//2,int(Hh*0.55)
        tiles.append(im.crop((max(0,cx-lato//2), max(0,cy-lato//2), min(W,cx+lato//2), min(Hh,cy+lato//2)))); os.remove(p)
    righe.append((r['clip'],tiles))
w=righe[0][1][0].width; h=righe[0][1][0].height
F=Image.new('RGB',(w*9+120,(h+26)*len(righe)+30),(20,20,20)); d=ImageDraw.Draw(F)
d.text((8,8),'sprite: 8 imbardate (0,45,...,315)  |  ultima colonna: il RIG alla stessa fase',fill=(240,240,240))
for i,(nome,tiles) in enumerate(righe):
    y=30+i*(h+26); d.text((8,y+h//2),nome,fill=(255,220,120))
    for j,t in enumerate(tiles): F.paste(t,(120+j*w,y))
F.save(os.path.join(r'${FUORI.replace(/\\/g, '\\\\')}','clip-nuove.png')); print('clip-nuove.png', F.size)
`;
  fs.writeFileSync(path.join(FUORI, '_clip.json'), JSON.stringify(scatti));
  fs.writeFileSync(path.join(FUORI, '_clip.py'), py);
  console.log(require('child_process').execSync('python "' + path.join(FUORI, '_clip.py') + '"').toString().trim());
  fs.unlinkSync(path.join(FUORI, '_clip.json')); fs.unlinkSync(path.join(FUORI, '_clip.py'));
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
