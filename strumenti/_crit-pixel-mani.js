/* =====================================================================
   _crit-pixel-mani.js — I PIXEL, NON IL CODICE.

   Costruisce le tre situazioni (PUGNI, SFUGGE, RESPINTA) chiamando la
   funzione vera del gioco, poi DISEGNA davvero, fotogramma per
   fotogramma, e ritaglia il portiere. Fa lo stesso su due giochi (prima
   e dopo) e conta i pixel che cambiano.

   Tre domande:
     A. il corpo del portiere cambia davvero sullo schermo? (dopo vs prima)
     B. il PRIMO fotogramma — quello che il fermo-immagine del colpo
        (gelo 0,055 s) tiene fermo davanti agli occhi — e' gia' diverso,
        o e' ancora la posa vecchia?
     C. le tre pose si distinguono FRA LORO in maschera? (dopo vs dopo)

   uso: node strumenti/_crit-pixel-mani.js --a fuori/anim-seconda-prima.html
                                           --b fuori/anim-seconda.html
                                           [--fg 24] [--dir fuori/_crit-mani]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const A = path.resolve(arg('a', path.join(RADICE, 'fuori/anim-seconda-prima.html')));
const B = path.resolve(arg('b', path.join(RADICE, 'fuori/anim-seconda.html')));
const FG = +arg('fg', 24);
const DIR = path.resolve(arg('dir', path.join(RADICE, 'fuori/_crit-mani')));

const CASI = [
  { esito:'PUGNI',    dy:0,  z:20, sp:500 },
  { esito:'SFUGGE',   dy:0,  z:5,  sp:400 },
  { esito:'RESPINTA', dy:18, z:5,  sp:400 },
];

/* prepara il caso e restituisce il riquadro di schermo del portiere */
const PREP = String.raw`(async (c, FG) => {
  const gk = G.players.find(p => p.team===0 && p.role==='gk' && p.out<=0);
  gk.dive=0; gk.recover=0; gk.charge=-1; gk.chargeKind=null; gk.chargeClip=null;
  gk.presaT=0; gk.rinvT=0; gk.kickT=0; gk.kickB=0; gk.kickCd=0; gk.kickClip=null;
  gk.slide=-1; gk.rove=-1; gk.celeb=0; gk.mesto=0; gk.fintaT=0; gk.frenaT=0;
  gk.lodPosa=false; gk.vx=0; gk.vy=0; gk.fase=0;
  if ('gkManiT' in gk) { gk.gkManiT=0; gk.gkMani=''; }
  gk.diveDX = 1; gk.diveDY = 0;
  /* tutti gli altri lontanissimi: nel ritaglio deve esserci solo lui */
  for (const p of G.players) if (p !== gk) { p.x = FW*0.90; p.y = FH*0.5 + (G.players.indexOf(p)%7)*22; p.vx=0; p.vy=0; }
  const b = G.ball;
  b.owner=-1; b.passTo=-1; b.crossTo=-1; b.tiroT=-1; b.saveRolled=false;
  b.x = gk.x; b.y = gk.y + c.dy; b.z = c.z; b.vx = -c.sp; b.vy = 0; b.vz = 0;
  let ban = '';
  const sb0 = window.showBanner; window.showBanner = function(t){ ban=t; return sb0.apply(this,arguments); };
  tentaPresa(gk, b);
  window.showBanner = sb0;
  /* NON si sposta il pallone: la camera lo segue, e mandarlo via
     porterebbe il portiere fuori dallo schermo (e' l'errore della prima
     stesura di questo banco: A e B davano ZERO pixel diversi perche' la
     figura non era nel quadro). Invece si spegne la ripesca mettendo
     kickCd: la riga del gioco e' «if(p.kickCd<=0){ ... tentaPresa }». */
  gk.kickCd = 5;
  /* un disegno per fissare la trasformazione, poi si legge dove cade */
  window.__test.disegna();
  const S2 = G.view.S2||1, Ax=G.view.Ax||0, Ay=G.view.Ay||0;
  return { ban: ban, gk:{x:gk.x,y:gk.y}, S2, Ax, Ay,
           sx: gk.x*S2+Ax, sy: gk.y*S2+Ay,
           clip: (typeof rigStato==='function') ? rigStato(gk).clip : '?',
           latch: ('gkManiT' in gk) ? gk.gkManiT : null };
})`;

async function gira(file, tag) {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, file).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil:'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: 5 });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true); window.__test.setTimeLeft(600);
  });
  await pag.evaluate(() => { for (let i=0;i<900;i++){ window.__test.simulate(1/60); if (window.__test.G.scene==='play') break; } });
  /* si toglie di mezzo il sipario/HUD che potrebbero coprire */
  const out = {};
  for (const c of CASI) {
    const info = await pag.evaluate(PREP + '(' + JSON.stringify(c) + ',' + FG + ')');
    /* il ritaglio: 130x130 px CSS centrati sul portiere, dentro il quadro */
    const L = 130;
    const cx = Math.max(0, Math.min(915 - L, info.sx - L/2));
    const cy = Math.max(0, Math.min(412 - L, info.sy - L*0.62));
    info.ritaglio = { x: Math.round(cx), y: Math.round(cy), width: L, height: L };
    const scatti = [];
    for (let f = 0; f < FG; f++) {
      const st = await pag.evaluate(() => { const g=G.players.find(p=>p.team===0&&p.role==='gk'); const s=rigStato(g);
        return { clip:s.clip, u:+s.u.toFixed(3), freeze:+(G.freeze||0).toFixed(3),
                 sx:+(g.x*(G.view.S2||1)+(G.view.Ax||0)).toFixed(1), sy:+(g.y*(G.view.S2||1)+(G.view.Ay||0)).toFixed(1),
                 lod: !!g.lodPosa }; });
      const png = await pag.screenshot({ clip: info.ritaglio });
      scatti.push({ f, st, png });
      await pag.evaluate(() => { window.__test.simulate(1/60); window.__test.disegna(); });
    }
    out[c.esito] = { info, scatti };
  }
  await br.close(); srv.chiudi();
  return out;
}

/* PNG -> pixel grezzi, senza librerie: si passa dal canvas di playwright?
   No: si confrontano i BYTE dei PNG solo per sapere se sono uguali, e per
   contare i pixel si ridecodifica con una pagina vuota. Qui si usa la via
   semplice e onesta: si conta con una seconda pagina headless. */
async function contaDiff(coppie) {
  const { chromium } = require('playwright');
  const br = await chromium.launch();
  const pag = await (await br.newContext()).newPage();
  await pag.goto('about:blank');
  const res = [];
  for (const [a, b] of coppie) {
    const r = await pag.evaluate(async ([da, db]) => {
      const img = s => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = s; });
      const ia = await img(da), ib = await img(db);
      const w = ia.width, h = ia.height;
      const ca = new OffscreenCanvas(w,h), cb = new OffscreenCanvas(w,h);
      const xa = ca.getContext('2d'), xb = cb.getContext('2d');
      xa.drawImage(ia,0,0); xb.drawImage(ib,0,0);
      const pa = xa.getImageData(0,0,w,h).data, pb = xb.getImageData(0,0,w,h).data;
      let n = 0, x0=1e9,y0=1e9,x1=-1,y1=-1, somma=0;
      for (let i = 0, px = 0; i < pa.length; i += 4, px++) {
        const d = Math.abs(pa[i]-pb[i]) + Math.abs(pa[i+1]-pb[i+1]) + Math.abs(pa[i+2]-pb[i+2]);
        if (d > 12) { n++; somma += d;
          const x = px % w, y = (px / w) | 0;
          if (x<x0) x0=x; if (x>x1) x1=x; if (y<y0) y0=y; if (y>y1) y1=y; }
      }
      return { n, tot: w*h, w, h, bbox: x1<0?null:{x0,y0,x1,y1}, medio: n? +(somma/n).toFixed(1):0 };
    }, [a, b]);
    res.push(r);
  }
  await br.close();
  return res;
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  process.stderr.write('giro A (' + path.basename(A) + ')\n');
  const ra = await gira(A, 'prima');
  process.stderr.write('giro B (' + path.basename(B) + ')\n');
  const rb = await gira(B, 'dopo');

  for (const c of CASI) {
    const e = c.esito;
    console.log('\n===== ' + e + ' =====');
    console.log('  ramo del gioco: A=' + ra[e].info.ban + '  B=' + rb[e].info.ban);
    console.log('  portiere sullo schermo A (' + ra[e].info.sx.toFixed(1) + ',' + ra[e].info.sy.toFixed(1) + ')  ritaglio ' + JSON.stringify(ra[e].info.ritaglio));
    const coppie = [];
    for (let f = 0; f < FG; f++)
      coppie.push(['data:image/png;base64,' + ra[e].scatti[f].png.toString('base64'),
                   'data:image/png;base64,' + rb[e].scatti[f].png.toString('base64')]);
    const d = await contaDiff(coppie);
    for (let f = 0; f < FG; f++) {
      const sa = ra[e].scatti[f].st, sb = rb[e].scatti[f].st;
      console.log('  f' + String(f).padStart(2) + '  A ' + sa.clip.padEnd(9) + ' u' + String(sa.u).padEnd(6) +
                  ' | B ' + sb.clip.padEnd(9) + ' u' + String(sb.u).padEnd(6) +
                  ' | gelo ' + sb.freeze +
                  ' | pixel diversi ' + String(d[f].n).padStart(6) + '/' + d[f].tot +
                  (d[f].bbox ? ('  riquadro ' + (d[f].bbox.x1-d[f].bbox.x0+1) + 'x' + (d[f].bbox.y1-d[f].bbox.y0+1)) : '  —'));
    }
    fs.writeFileSync(path.join(DIR, '_' + e + '-A-f00.png'), ra[e].scatti[0].png);
    fs.writeFileSync(path.join(DIR, '_' + e + '-B-f00.png'), rb[e].scatti[0].png);
    const mid = Math.min(FG-1, 8);
    fs.writeFileSync(path.join(DIR, '_' + e + '-A-f' + String(mid).padStart(2,'0') + '.png'), ra[e].scatti[mid].png);
    fs.writeFileSync(path.join(DIR, '_' + e + '-B-f' + String(mid).padStart(2,'0') + '.png'), rb[e].scatti[mid].png);
  }

  /* C — le tre pose fra loro, sullo stesso gioco B, allo stesso fotogramma */
  console.log('\n===== LE TRE POSE FRA LORO (gioco B) =====');
  const nomi = CASI.map(c => c.esito);
  for (let f of [0, 4, 8, 12]) {
    const cop = [];
    const et = [];
    for (let i = 0; i < nomi.length; i++) for (let j = i+1; j < nomi.length; j++) {
      cop.push(['data:image/png;base64,' + rb[nomi[i]].scatti[f].png.toString('base64'),
                'data:image/png;base64,' + rb[nomi[j]].scatti[f].png.toString('base64')]);
      et.push(nomi[i] + ' vs ' + nomi[j]);
    }
    const d = await contaDiff(cop);
    for (let k = 0; k < et.length; k++)
      console.log('  f' + String(f).padStart(2) + '  ' + et[k].padEnd(22) + ' pixel diversi ' + String(d[k].n).padStart(6));
  }
})();
