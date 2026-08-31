/* =====================================================================
   _t3-forgia.js — IL BANCO DELLA POSA IN LAVORAZIONE.
   Non tocca il gioco: scrive una COPIA di prova e misura quella.

   A che serve. Riscrivere una posa a occhio e poi misurarla una volta
   sola e' come tarare una soglia guardando un solo campione. Qui la
   posa candidata si mette in un file di prova, si apre, e si leggono
   TRE numeri con lo stesso metro con cui li leggera' il cancello:

     SCAVO      la frazione del guscio convesso occupata da sfondo, il
                criterio VETO di strumenti/silhouette.js (soglia 0,33),
                l'unico dei cinque nato da un provino cieco umano.
                Misurato all'imbardata VERA della festa e alle fasi VERE
                che rigStato manda nei primi 1,6 s dal gol.
     dz_med     l'estensione sagittale mediana su 64 fasi, cioe' il
                numero che la regola di _z-leggibile moltiplica per
                hPx/1,9 e per |sin(imbardata)|.
     TAGLI      quante volte la scatola degli angoli ha dovuto correggere
                la posa su 64 fasi x 4 corporature. Una posa corretta dal
                clamp e' una posa scritta male (vedi gabbia.js).

   uso:
     node strumenti/_t3-forgia.js --base fuori/anim-terza.html \
          --clip pugno --cand fuori/_cand-pugno.js
     ... e senza --cand misura la posa che c'e' gia' (la linea di partenza).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const BASE = arg('base', 'fuori/anim-terza.html');
const CLIP = arg('clip', 'pugno');
const CAND = arg('cand', '');
const NOME_FN = 'pose' + CLIP[0].toUpperCase() + CLIP.slice(1);
const CADENZA = { cielo: 0.45, pugno: 0.55, ginocchia: 0.50, esultanza: 2.4 };

/* la sostituzione e' ANCORATA come una toppa vera: si cerca la funzione
   intera dal suo `function poseX(u){` alla riga `}` in colonna zero, e
   deve trovarsi esattamente una volta. */
function sostituisci(src, nomeFn, nuovo) {
  const a = src.indexOf('function ' + nomeFn + '(u){');
  if (a < 0) throw new Error('non trovo function ' + nomeFn + '(u){');
  if (src.indexOf('function ' + nomeFn + '(u){', a + 1) >= 0) throw new Error(nomeFn + ' trovata piu\' di una volta');
  const b = src.indexOf('\n}\n', a);
  if (b < 0) throw new Error('non trovo la chiusura di ' + nomeFn);
  return src.slice(0, a) + nuovo.trim() + src.slice(b + 3);
}

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const SONDA = String.raw`(() => {
  const CW=104, CH=124;
  const cv=document.createElement('canvas'); cv.width=CW; cv.height=CH;
  const g=cv.getContext('2d',{willReadFrequently:true});
  const NERO='#000';
  const nero={maglia:NERO,maglia2:NERO,pantaloncini:NERO,calze:NERO,risvolto:NERO,
    pelle:NERO,capelli:NERO,scarpe:NERO,palla:null,taglio:0,corp:3,varb:0,
    _lume:NERO,_ombra:NERO,
    _ombS:{maglia:NERO,maglia2:NERO,calze:NERO,pantaloncini:NERO,pelle:NERO}};
  function cella(clip,u,yaw,corp){
    const cx=CW/2, cy=CH-14;
    nero.corp=corp;
    g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,CW,CH);
    g.save(); g.translate(cx,cy); g.scale(P_DIS,P_DIS); g.translate(-cx,-cy);
    Rig3D.disegna(g,cx,cy,RIG_H,yaw,'alto',clip,u/Rig3D.CLIPS[clip].freq,nero,true,P_DIS);
    g.restore();
    return g.getImageData(0,0,CW,CH).data;
  }
  function scavo(dati){
    const W=CW,H=CH;
    let minx=1e9,maxx=-1,miny=1e9,maxy=-1,tot=0;
    const m=new Uint8Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(dati[(y*W+x)*4+3]>128){ m[y*W+x]=1; tot++;
        if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; } }
    if(tot<20) return {vuota:true};
    const bw=maxx-minx+1, bh=maxy-miny+1, PAD=3, LW=bw+2*PAD, LH=bh+2*PAD;
    const q=new Uint8Array(LW*LH);
    for(let y=0;y<bh;y++)for(let x=0;x<bw;x++) if(m[(y+miny)*W+x+minx]) q[(y+PAD)*LW+x+PAD]=1;
    const pts=[];
    for(let y=0;y<LH;y++){ let a=-1,b=-1;
      for(let x=0;x<LW;x++) if(q[y*LW+x]){ if(a<0)a=x; b=x; }
      if(a>=0){ pts.push([a,y]); if(b!==a) pts.push([b,y]); } }
    pts.sort((p,r)=>p[0]-r[0]||p[1]-r[1]);
    const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
    const lo=[],hi=[];
    for(const p of pts){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop(); lo.push(p); }
    for(let k=pts.length-1;k>=0;k--){ const p=pts[k];
      while(hi.length>=2&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop(); hi.push(p); }
    lo.pop(); hi.pop(); const hull=lo.concat(hi);
    const HL=new Int32Array(LH).fill(1e9), HR=new Int32Array(LH).fill(-1e9);
    for(let k=0;k<hull.length;k++){
      const A=hull[k], Bp=hull[(k+1)%hull.length];
      const ya=Math.min(A[1],Bp[1]), yb=Math.max(A[1],Bp[1]);
      for(let y=Math.ceil(ya);y<=Math.floor(yb);y++){
        const t=(Bp[1]===A[1])?0:(y-A[1])/(Bp[1]-A[1]); const x=A[0]+(Bp[0]-A[0])*t;
        if(x<HL[y])HL[y]=Math.ceil(x-0.001); if(x>HR[y])HR[y]=Math.floor(x+0.001); } }
    let vuoto=0, pieno=0;
    for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){
      if(q[y*LW+x]) { pieno++; continue; }
      if(x>=HL[y] && x<=HR[y]) vuoto++; }
    return {scavo:vuoto/(vuoto+pieno), forma:bw/bh, inchiostro:tot/(bw*bh)};
  }
  /* LA GRIGLIA 32x32 NORMALIZZATA ALLA PROPRIA SCATOLA — e' la stessa
     distinzione di ?banco=silhouette, il criterio VETO che dice «non
     sono la stessa posa» (Hamming >= 0,18). Serve qui perche' aprire gli
     arti di una posa la puo' avvicinare alla CORSA, e una festa che
     legge «corre» e' il difetto che il secondo provino cieco ha trovato
     su tre celle su dieci. */
  function griglia(clip,u,yaw,corp){
    const dati=cella(clip,u,yaw,corp);
    const W=CW,H=CH;
    let minx=1e9,maxx=-1,miny=1e9,maxy=-1;
    const m=new Uint8Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)
      if(dati[(y*W+x)*4+3]>128){ m[y*W+x]=1;
        if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; }
    if(maxx<0) return new Uint8Array(1024);
    const bw=maxx-minx+1, bh=maxy-miny+1, gr=new Uint8Array(1024);
    for(let j=0;j<32;j++)for(let i=0;i<32;i++){
      const sx=minx+Math.floor(i*bw/32), sy=miny+Math.floor(j*bh/32);
      gr[j*32+i]=m[sy*W+sx];
    }
    return gr;
  }

  window.__fg = {
    scavo(clip,u,yaw,corp){ return scavo(cella(clip,u,yaw,corp)); },
    hamming(a,b){
      const A=griglia(a[0],a[1],a[2],3), B=griglia(b[0],b[1],b[2],3);
      let d=0; for(let k=0;k<1024;k++) if(A[k]!==B[k])d++;
      return d/1024;
    },
    /* estensioni della posa cruda, come __zv.estensioni di _z-verbo */
    est(clip){
      const B=Rig3D.banco, dz=[], dy=[], dx=[];
      for(let k=0;k<64;k++){
        B.posa(clip,k/64);
        let z0=1e9,z1=-1e9,y0=1e9,y1=-1e9,x0=1e9,x1=-1e9;
        for(let j=0;j<B.NJ;j++){
          const x=B.P[j*3], y=B.P[j*3+1], z=B.P[j*3+2];
          if(z<z0)z0=z; if(z>z1)z1=z; if(y<y0)y0=y; if(y>y1)y1=y;
          if(x<x0)x0=x; if(x>x1)x1=x; }
        dz.push(z1-z0); dy.push(y1-y0); dx.push(x1-x0); }
      const md=a=>{const b=a.slice().sort((p,q)=>p-q);return b[32];};
      return {dz_med:md(dz), dy_med:md(dy), dx_med:md(dx)};
    },
    /* tagli e quota minima, come gabbia.js: 64 fasi x 4 corporature */
    gabbia(clip){
      const B=Rig3D.banco;
      B.azzeraTagli();
      let qmin=1e9, cima=0;
      for(let c=0;c<B.nCorpi;c++){
        B.corpora(c,0);
        for(let k=0;k<64;k++){
          B.posa(clip,k/64);
          for(let j=0;j<B.NJ;j++){
            const y=B.P[j*3+1];
            if(y<qmin)qmin=y;
            if(y>cima)cima=y; } } }
      B.corpora(3,0);
      return {tagli:B.tagli(), quotaMin:qmin, cima};
    },
  };
  return 'ok';
})()`;

const f = (x, d) => (isFinite(x) ? x.toFixed(d === undefined ? 3 : d) : '  -');

(async () => {
  const src = fs.readFileSync(path.resolve(RADICE, BASE), 'utf8');
  let file = BASE;
  if (CAND) {
    const nuovo = fs.readFileSync(path.resolve(RADICE, CAND), 'utf8');
    const out = sostituisci(src, NOME_FN, nuovo);
    if (out.length === src.length) throw new Error('la sostituzione non ha cambiato niente');
    file = 'fuori/_forgia.html';
    fs.writeFileSync(path.resolve(RADICE, file), out);
  }
  const srv = await servi();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/${file}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  if (errori.length) { console.log('ECCEZIONI ALLA PARTENZA:'); errori.forEach(e => console.log('  ' + e)); process.exit(1); }
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('sonda: ' + inst);

  console.log('=== _t3-forgia — clip "' + CLIP + '" su ' + file + (CAND ? '   (candidata ' + CAND + ')' : '   (LINEA DI PARTENZA)') + ' ===');

  const est = await pag.evaluate(c => window.__fg.est(c), CLIP);
  const gab = await pag.evaluate(c => window.__fg.gabbia(c), CLIP);
  console.log('  dz_med ' + f(est.dz_med, 4) + '   dy_med ' + f(est.dy_med, 4) +
    '   dx_med ' + f(est.dx_med, 4) + '   |   tagli ' + gab.tagli +
    '   quota minima ' + f(gab.quotaMin, 4) + (gab.quotaMin < 0 ? '  *** SOTTO IL MANTO ***' : ''));

  /* lo scavo alle fasi vere della festa, ai due lati dell'imbardata */
  const cad = CADENZA[CLIP] || 0.55;
  console.log('\n  el(s)   fase    scavo+   scavo-   forma+   sopra 0,33?');
  let ok = 0, n = 0, somma = 0;
  for (let el = 0; el <= 1.6001; el += 0.2) {
    const u = CLIP === 'esultanza' ? (el * 2.4) % 1 : Math.min(0.99, el * cad);
    const a = await pag.evaluate(([c, u2, y]) => window.__fg.scavo(c, u2, y, 3), [CLIP, u, Math.PI + 0.38]);
    const b = await pag.evaluate(([c, u2, y]) => window.__fg.scavo(c, u2, y, 3), [CLIP, u, Math.PI - 0.38]);
    somma += a.scavo + b.scavo; n += 2;
    ok += (a.scavo >= 0.33 ? 1 : 0) + (b.scavo >= 0.33 ? 1 : 0);
    console.log('  ' + el.toFixed(2).padStart(5) + f(u, 3).padStart(8) + f(a.scavo).padStart(9) +
      f(b.scavo).padStart(9) + f(a.forma).padStart(9) + '     ' +
      (a.scavo >= 0.33 && b.scavo >= 0.33 ? 'si' : (a.scavo >= 0.33 || b.scavo >= 0.33 ? 'meta\'' : 'NO')));
  }
  console.log('\n  scavo MEDIO ' + f(somma / n) + '   campioni sopra 0,33: ' + ok + '/' + n +
    '  (' + f(ok / n * 100, 1) + '%)');
  /* e all'angolo di presentazione, per confronto col foglio di silhouette */
  const pres = await pag.evaluate(([c, u]) => window.__fg.scavo(c, u, 0.95, 3), [CLIP, CLIP === 'esultanza' ? 0.30 : 0.45]);
  console.log('  all\'angolo di presentazione (yaw 0,95, fase ' + (CLIP === 'esultanza' ? '0,30' : '0,45') + '): scavo ' + f(pres.scavo) + '   forma ' + f(pres.forma) + '   inchiostro ' + f(pres.inchiostro));

  /* DISTINZIONE: la posa nuova non deve diventare un'altra posa gia' in
     catalogo. Si confronta alle sue fasi di regime contro le altre clip
     alle loro fasi significative, alla stessa imbardata della festa. */
  const ALTRE = [['corsa', 0.32], ['camminata', 0.15], ['fermo', 0.20], ['tiro', 0.30],
    ['esultanza', 0.30], ['ginocchia', 0.40], ['cielo', 0.45], ['pugno', 0.45],
    ['delusione', 0.55], ['scivolata', 0.35], ['frenata', 0.30]];
  const FASI = CLIP === 'esultanza' ? [0.30] : [0.33, 0.55, 0.77];
  console.log('\n  DISTINZIONE (Hamming su griglie 32x32, veto del gioco: >= 0,18)');
  console.log('    imbardata della festa, pi+0,38 — la piu\' vicina per ogni fase:');
  for (const uu of FASI) {
    let dmin = 9, chi = '';
    for (const [c2, u2] of ALTRE) {
      if (c2 === CLIP) continue;
      const d = await pag.evaluate(([a, b]) => window.__fg.hamming(a, b),
        [[CLIP, uu, Math.PI + 0.38], [c2, u2, Math.PI + 0.38]]);
      if (d < dmin) { dmin = d; chi = c2 + ' u' + u2; }
    }
    console.log('    fase ' + f(uu, 2) + ':  ' + f(dmin) + '  con ' + chi +
      (dmin >= 0.18 ? '   (dentro)' : '   *** SOTTO IL VETO ***'));
  }

  if (errori.length) { console.log('\n  ECCEZIONI:'); errori.forEach(e => console.log('   ' + e)); }
  await browser.close(); srv.chiudi();
})();
