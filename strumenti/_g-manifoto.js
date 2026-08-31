/* _g-manifoto.js — il foglio a contatto delle tre pose nuove del
   portiere, disegnato con la STESSA Rig3D.disegna della partita, alla
   stessa camera 'alto' e all'imbardata vera del portiere in piedi
   (pi/2: guarda lungo l'asse x). Due file: a colori e in maschera nera.
   uso: node strumenti/_g-manifoto.js --gioco fuori/anim-seconda.html --out fuori/mani.png */
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n,d) => { const i=process.argv.indexOf('--'+n);
  return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE,'CALCETTO-il-gioco.html')));
const OUT = path.resolve(arg('out', path.join(RADICE,'fuori','mani.png')));

const CELLE = [
  ['attesaGK',0.00,'attesa'], ['pugni',0.24,'pugni 0,24'], ['pugni',0.40,'pugni 0,40'],
  ['pugni',0.55,'pugni 0,55'], ['respinta',0.12,'respinta 0,12'], ['respinta',0.28,'respinta 0,28'],
  ['respinta',0.45,'respinta 0,45'], ['sfugge',0.12,'sfugge 0,12'], ['sfugge',0.28,'sfugge 0,28'],
  ['sfugge',0.44,'sfugge 0,44'], ['tuffo',0.35,'tuffo'], ['presa',0.45,'presa'],
];

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:960,height:560}, deviceScaleFactor:2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.goto('http://127.0.0.1:'+srv.porta+'/'+rel+'?q='+Date.now(), {waitUntil:'load'});
  await pag.evaluate(() => window.__banco.passo(20));
  await pag.evaluate((CELLE) => {
    const cv = document.createElement('canvas');
    cv.width=1920; cv.height=1120; cv.style.cssText='position:fixed;left:0;top:0;width:960px;height:560px;z-index:999999';
    document.body.appendChild(cv);
    const g = cv.getContext('2d');
    const look = Object.assign({}, Rig3D.lookPredefinito);
    const nero = {}; for(const k in look) nero[k] = (k==='taglio'||k==='palla') ? look[k] : '#000';
    g.fillStyle='#cfd8c2'; g.fillRect(0,0,1920,1120);
    const COL=6, W=1920/COL, H=560/2;
    for (let i=0;i<CELLE.length;i++){
      const [clip,u,nome]=CELLE[i];
      const cx=(i%COL)*W+W/2, cy=Math.floor(i/COL)*H+H*0.80;
      /* imbardata pi/2 = la figura guarda lungo l'asse x, come il
         portiere in piedi (p.ang 0 + RIG_YAW_K) */
      Rig3D.disegna(g, cx, cy, 200, Math.PI/2, 'alto', clip, u/Rig3D.CLIPS[clip].freq, look, true, 2, 0);
      /* la stessa figura a 40 px, in nero, accanto */
      Rig3D.disegna(g, cx+W*0.34, cy, 80, Math.PI/2, 'alto', clip, u/Rig3D.CLIPS[clip].freq, nero, true, 1, 0);
      g.fillStyle='#20301a'; g.font='22px sans-serif'; g.textAlign='center';
      g.fillText(nome, cx, Math.floor(i/COL)*H+H*0.96);
    }
    /* la seconda fila di riferimento a 40 px in nero, tutta di seguito */
    window.__foto = cv;
  }, CELLE);
  await pag.screenshot({ path: OUT, clip:{x:0,y:0,width:960,height:560} });
  await br.close(); srv.chiudi();
  console.log('scritto '+OUT);
})().catch(e => { console.error('FALLITO: '+(e&&e.stack||e)); process.exit(1); });
