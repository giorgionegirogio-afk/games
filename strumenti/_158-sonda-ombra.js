/* _158-sonda-ombra.js — L'OMBRA PORTATA, da vicino, sprite e rig a confronto
   (voce #158, compito 6). Prende in mano l'orologio del gioco (lo stesso
   banco di istantanea.js: requestAnimationFrame in coda, passi da 1/60),
   avvia una partita CPU contro CPU a taglia 5 (startMatch PRIMA,
   setCpuVsCpu DOPO), la fa correre N secondi a FOTOGRAMMI VERI (cosi' la
   camera segue l'azione), poi zittisce il ciclo e disegna LO STESSO istante
   due volte con __test.disegna(): sprite accesi e rubinetto chiuso (rig).
   Attorno a ogni giocatore in quadro ritaglia un riquadro che comprende
   l'ombra (che va verso +x e un po' in giu'). Foglio:
   strumenti/_158-prove/ombra-confronto.png. Non e' un cancello.
   USO: node strumenti/_158-sonda-ombra.js [--gioco fuori/sprite/ombra-prova.html] [--secondi 20] [--n 6] [--seme 3] */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const GIOCO = (pren('--gioco') || 'fuori/sprite/ombra-prova.html').split(String.fromCharCode(92)).join('/');
const SEC = +(pren('--secondi') || 20), N = +(pren('--n') || 6), SEME = +(pren('--seme') || 3);
const FUORI = path.join(__dirname, '_158-prove');
const DPR = 2.5;
/* il montaggio in Python legge tutto da un JSON: niente percorsi di
   Windows dentro una stringa JavaScript (le barre rovesce si mangiano) */
const PY = String.raw`
from PIL import Image, ImageDraw
import os, json, sys
J=json.load(open(sys.argv[1], encoding='utf-8'))
P=J['P']; D=J['D']
S=Image.open(J['pS']).convert('RGB'); R=Image.open(J['pR']).convert('RGB')
W,H=S.size
tiles=[]
for p in P:
    cx,cy=int(p['x']*D),int(p['y']*D)
    box=(max(0,cx-150),max(0,cy-240),min(W,cx+450),min(H,cy+240))
    tiles.append((p,S.crop(box),R.crop(box)))
if not tiles: raise SystemExit('nessun giocatore in quadro')
w=max(t[1].width for t in tiles); h=max(t[1].height for t in tiles)
F=Image.new('RGB',(w*2+40,(h+24)*len(tiles)+30),(20,20,20)); d=ImageDraw.Draw(F)
d.text((8,8),'SPRITE (ombra della sagoma)',fill=(240,240,240)); d.text((w+48,8),'RIG (ombra dello scheletro) - stesso istante',fill=(240,240,240))
for k,(p,a,r) in enumerate(tiles):
    y=30+k*(h+24); F.paste(a,(0,y)); F.paste(r,(w+40,y))
    d.text((8,y+h+4),'#%d %s'%(p['i'],p['clip']),fill=(255,220,120))
out=os.path.join(J['FUORI'],'ombra-confronto.png'); F.save(out); print('ombra-confronto.png',F.size,len(tiles),'giocatori')
os.remove(J['pS']); os.remove(J['pR'])
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
  await pg.evaluate((seme) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.semina && t.semina(seme);
    t.startMatch(1, 1, { size: 5 });
    t.Tut && t.Tut.finish && t.Tut.finish(true);
    t.posaHUD && t.posaHUD(true);
    t.setCpuVsCpu && t.setCpuVsCpu(true);
  }, SEME);
  await pg.evaluate((n) => { window.__banco.passo(n); window.__banco.zitto(); }, Math.round(SEC * 60));
  /* IL VELO DELLA TRANSIZIONE (#wipe) e' un elemento del DOM animato col
     tempo VERO: a orologio preso in mano resta sopra il canvas per un
     secondo buono e lo scatto esce tutto verde scuro a bande diagonali —
     non e' l'ombra, e' il sipario. Si aspetta che sparisca, come fa
     _158-scatto-partita.js. */
  try {
    await pg.waitForFunction(() => {
      const w = document.getElementById('wipe');
      if (w && getComputedStyle(w).display !== 'none' && +getComputedStyle(w).opacity > 0.02) return false;
      const sp = document.getElementById('splash');
      if (sp) { const cs = getComputedStyle(sp); if (cs.display !== 'none' && +cs.opacity > 0.02) return false; }
      return true;
    }, null, { polling: 60, timeout: 15000 });
  } catch (e) { console.log('  ATTENZIONE: sipario ancora presente dopo 15 s'); }
  const scatta = async (nome) => { await pg.evaluate(() => { window.__test.disegna(); }); const p = path.join(FUORI, `_o-${nome}.png`); await pg.screenshot({ path: p }); return p; };
  const pS = await scatta('sprite');
  await pg.evaluate(() => { window.__test.spriteOn(false); });
  const pR = await scatta('rig');
  await pg.evaluate(() => { window.__test.spriteOn(true); });
  const pos = await pg.evaluate(() => {
    try {
      const S2 = (G.view.S2 || 1), Ax = (G.view.Ax || 0) + (G.view.sx || 0), Ay = (G.view.Ay || 0) + (G.view.sy || 0);
      return G.players.map((p, i) => ({ i, x: p.x * S2 + Ax, y: p.y * S2 + Ay, clip: p.poseClip || '', team: p.team }));
    } catch (e) { return { err: String(e) }; }
  });
  console.log('  errori di pagina:', err.length, err.slice(0, 3).join(' | '));
  await b.close();
  if (!pos || pos.err) { console.log('  ??  posizioni non lette', pos && pos.err); process.exit(2); }
  const dentro = pos.filter(p => p.x > 40 && p.x < 760 && p.y > 40 && p.y < 340).slice(0, N);
  const j = path.join(FUORI, '_ombra.json'), s = path.join(FUORI, '_ombra.py');
  fs.writeFileSync(j, JSON.stringify({ P: dentro, D: DPR, pS, pR, FUORI }));
  fs.writeFileSync(s, PY);
  console.log(require('child_process').execSync('python "' + s + '" "' + j + '"').toString().trim());
  fs.unlinkSync(j); fs.unlinkSync(s);
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
