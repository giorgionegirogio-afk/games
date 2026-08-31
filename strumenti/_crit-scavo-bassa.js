/* =====================================================================
   _crit-scavo-bassa.js — LO STESSO METRO, NELLA CAMERA GIUSTA.

   La cura di _t-festa-corpo.js e' stata cercata, scelta e verificata con
   `_t3-forgia.js` / `_t3-scavo.js`, che disegnano SEMPRE cosi':
       Rig3D.disegna(g,cx,cy,RIG_H,yaw,'alto',clip,...)
   cioe' in camera 'alto', a 34 px, all'imbardata pi+-0,38.

   Ma la scena per cui quelle due clip esistono — la RIPRESA DEDICATA
   DEL GOL, «il rig 3D e' nato per questa inquadratura» — le disegna in
   camera 'bassa', a 197-232 px di periferica, alle imbardate
   pi-0,42 (cielo) e pi+-0,35 (pugno), e alle fasi che la regia impone.
   Misurato con _crit-festa-pixel.js sul gol vero.

   Questo banco rifa' lo stesso conto (stesso guscio convesso, stessa
   soglia 0,33, stessa Hamming 32x32) nella camera e alle fasi VERE.

   IL ROSSO DIMOSTRATO: il banco misura anche il BIRILLO — la posa
   `fermo` in camera 'bassa' — e deve bocciarla.

   uso: node strumenti/_crit-scavo-bassa.js --a <prima> --b <dopo>
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const A = arg('a', 'fuori/_anim-terza-PRIMA.html'), B = arg('b', 'fuori/anim-terza.html');

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
  const NERO='#000';
  const nero={maglia:NERO,maglia2:NERO,pantaloncini:NERO,calze:NERO,risvolto:NERO,
    pelle:NERO,capelli:NERO,scarpe:NERO,palla:null,taglio:0,corp:3,varb:0,
    _lume:NERO,_ombra:NERO,
    _ombS:{maglia:NERO,maglia2:NERO,calze:NERO,pantaloncini:NERO,pelle:NERO}};
  function cella(clip,tSec,yaw,cam,hPx){
    const CW=Math.round(hPx*3.4), CH=Math.round(hPx*4.0);
    const cv=document.createElement('canvas'); cv.width=CW; cv.height=CH;
    const g=cv.getContext('2d',{willReadFrequently:true});
    const cx=CW/2, cy=CH-Math.round(hPx*0.42);
    g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,CW,CH);
    Rig3D.disegna(g,cx,cy,hPx,yaw,cam,clip,tSec,nero,false,1);
    return {d:g.getImageData(0,0,CW,CH).data, W:CW, H:CH};
  }
  function scavo(o){
    const W=o.W,H=o.H,dati=o.d;
    let minx=1e9,maxx=-1,miny=1e9,maxy=-1,tot=0;
    const m=new Uint8Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(dati[(y*W+x)*4+3]>128){ m[y*W+x]=1; tot++;
        if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; } }
    if(tot<20) return {vuota:true,scavo:0,forma:0,inchiostro:0};
    const bw=maxx-minx+1, bh=maxy-miny+1, PAD=3, LW=bw+2*PAD, LH=bh+2*PAD;
    const q=new Uint8Array(LW*LH);
    for(let y=0;y<bh;y++)for(let x=0;x<bw;x++) if(m[(y+miny)*W+x+minx]) q[(y+PAD)*LW+x+PAD]=1;
    const pts=[];
    for(let y=0;y<LH;y++){ let a=-1,b=-1;
      for(let x=0;x<LW;x++) if(q[y*LW+x]){ if(a<0)a=x; b=x; }
      if(a>=0){ pts.push([a,y]); if(b!==a) pts.push([b,y]); } }
    pts.sort((p,r)=>p[0]-r[0]||p[1]-r[1]);
    const cr=(o2,a,b)=>(a[0]-o2[0])*(b[1]-o2[1])-(a[1]-o2[1])*(b[0]-o2[0]);
    const lo=[],hi=[];
    for(const p of pts){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop(); lo.push(p); }
    for(let k=pts.length-1;k>=0;k--){ const p=pts[k];
      while(hi.length>=2&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop(); hi.push(p); }
    lo.pop(); hi.pop(); const hull=lo.concat(hi);
    const HL=new Int32Array(LH).fill(1e9), HR=new Int32Array(LH).fill(-1e9);
    for(let k=0;k<hull.length;k++){
      const P1=hull[k], P2=hull[(k+1)%hull.length];
      const ya=Math.min(P1[1],P2[1]), yb=Math.max(P1[1],P2[1]);
      for(let y=Math.ceil(ya);y<=Math.floor(yb);y++){
        const t=(P2[1]===P1[1])?0:(y-P1[1])/(P2[1]-P1[1]); const x=P1[0]+(P2[0]-P1[0])*t;
        if(x<HL[y])HL[y]=Math.ceil(x-0.001); if(x>HR[y])HR[y]=Math.floor(x+0.001); } }
    let vuoto=0, pieno=0;
    for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){
      if(q[y*LW+x]) { pieno++; continue; }
      if(x>=HL[y] && x<=HR[y]) vuoto++; }
    return {scavo:vuoto/(vuoto+pieno), forma:bw/bh, inchiostro:tot/(bw*bh)};
  }
  function griglia(clip,tSec,yaw,cam,hPx){
    const o=cella(clip,tSec,yaw,cam,hPx), W=o.W,H=o.H,dati=o.d;
    let minx=1e9,maxx=-1,miny=1e9,maxy=-1;
    const m=new Uint8Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)
      if(dati[(y*W+x)*4+3]>128){ m[y*W+x]=1;
        if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; }
    if(maxx<0) return new Uint8Array(1024);
    const bw=maxx-minx+1, bh=maxy-miny+1, gr=new Uint8Array(1024);
    for(let j=0;j<32;j++)for(let i=0;i<32;i++){
      const sx=minx+Math.floor(i*bw/32), sy=miny+Math.floor(j*bh/32);
      gr[j*32+i]=m[sy*W+sx]; }
    return gr;
  }
  window.__cb = {
    scavo(clip,tSec,yaw,cam,hPx){ return scavo(cella(clip,tSec,yaw,cam,hPx)); },
    hamming(a,b,cam,hPx){
      const A=griglia(a[0],a[1],a[2],cam,hPx), B=griglia(b[0],b[1],b[2],cam,hPx);
      let d=0; for(let k=0;k<1024;k++) if(A[k]!==B[k])d++;
      return d/1024; }
  };
  return 1;
})()`;

async function apri(br, srv, file) {
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const err = [];
  p.on('pageerror', e => err.push(String(e)));
  await p.goto('http://127.0.0.1:' + srv.porta + '/' + file.replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.waitForFunction(() => window.__test && window.__test.state);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.evaluate(SONDA);
  return p;
}

const f = (v, n = 3) => (v == null ? '  -  ' : v.toFixed(n));

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const pa = await apri(br, srv, A), pb = await apri(br, srv, B);

  /* le fasi VERE della ripresa, lette da _crit-festa-pixel.js sul gol vero:
     cielo  tSec 0,273 -> 1,773 a yaw pi-0,42
     pugno  tSec 0,271 -> 0,998 a yaw pi+0,35
     (tSec = l'ottavo argomento di Rig3D.disegna, cioe' i secondi di clip) */
  const SCENE = [
    { clip: 'cielo', yaw: Math.PI - 0.42, cam: 'bassa', h: 116, t0: 0.273, t1: 1.773 },
    { clip: 'pugno', yaw: Math.PI + 0.35, cam: 'bassa', h: 104, t0: 0.271, t1: 0.998 },
  ];
  console.log('=== LO SCAVO NELLA CAMERA VERA DELLA RIPRESA (bassa), ALLE FASI VERE ===');
  console.log('   veto del cancello della sagoma: 0,33\n');
  for (const s of SCENE) {
    console.log('  ' + s.clip + '  camera ' + s.cam + '  yaw ' + s.yaw.toFixed(3) + '  hPx ' + s.h);
    console.log('    tSec   scavo A   scavo B      forma A   forma B   inchio A  inchio B');
    let sa = 0, sb = 0, oa = 0, ob = 0, n = 0;
    for (let k = 0; k <= 9; k++) {
      const t = s.t0 + (s.t1 - s.t0) * k / 9;
      const a = await pa.evaluate(([c, t2, y, cam, h]) => window.__cb.scavo(c, t2, y, cam, h), [s.clip, t, s.yaw, s.cam, s.h]);
      const b = await pb.evaluate(([c, t2, y, cam, h]) => window.__cb.scavo(c, t2, y, cam, h), [s.clip, t, s.yaw, s.cam, s.h]);
      sa += a.scavo; sb += b.scavo; n++;
      oa += a.scavo >= 0.33 ? 1 : 0; ob += b.scavo >= 0.33 ? 1 : 0;
      console.log('   ' + t.toFixed(3) + '    ' + f(a.scavo) + '     ' + f(b.scavo) +
        '        ' + f(a.forma, 2) + '      ' + f(b.forma, 2) + '      ' + f(a.inchiostro, 2) + '      ' + f(b.inchiostro, 2) +
        '   ' + (b.scavo >= 0.33 ? '' : '  B sotto il veto'));
    }
    console.log('    MEDIA   ' + f(sa / n) + '     ' + f(sb / n) + '     sopra 0,33: A ' + oa + '/' + n + '   B ' + ob + '/' + n + '\n');
  }

  /* IL ROSSO: il birillo (fermo) nella stessa camera deve essere bocciato */
  for (const p of [['A', pa], ['B', pb]]) {
    const r = await p[1].evaluate(() => window.__cb.scavo('fermo', 0.4, Math.PI, 'bassa', 116));
    console.log('  ROSSO DIMOSTRATO — `fermo` (il birillo) in camera bassa, ' + p[0] + ': scavo ' + f(r.scavo) +
      (r.scavo < 0.33 ? '  BOCCIATO, come deve' : '  *** IL BANCO NON SA DIRE ROSSO ***'));
  }

  /* DISTINZIONE in camera bassa, alle fasi vere della ripresa */
  console.log('\n=== DISTINZIONE in camera bassa (Hamming 32x32, veto 0,18) ===');
  const ALTRE = [['corsa', 0.6], ['camminata', 0.3], ['fermo', 0.4], ['esultanza', 0.13],
    ['ginocchia', 0.8], ['cielo', 0.9], ['pugno', 0.82], ['delusione', 1.2], ['frenata', 0.6]];
  for (const s of SCENE) {
    for (const t of [s.t0 + (s.t1 - s.t0) * 0.33, s.t0 + (s.t1 - s.t0) * 0.66, s.t1]) {
      for (const [et, p] of [['A', pa], ['B', pb]]) {
        let dmin = 9, chi = '';
        for (const [c2, t2] of ALTRE) {
          if (c2 === s.clip) continue;
          const d = await p.evaluate(([x, y, cam, h]) => window.__cb.hamming(x, y, cam, h),
            [[s.clip, t, s.yaw], [c2, t2, s.yaw], s.cam, s.h]);
          if (d < dmin) { dmin = d; chi = c2; }
        }
        console.log('  ' + s.clip.padEnd(7) + ' t' + t.toFixed(2) + '  ' + et + ': ' + f(dmin) + ' con ' + chi.padEnd(11) +
          (dmin >= 0.18 ? '(dentro)' : '*** SOTTO IL VETO ***'));
      }
    }
  }
  await br.close(); srv.chiudi();
})();
