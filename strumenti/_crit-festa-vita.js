/* =====================================================================
   _crit-festa-vita.js — «OGNI AZIONE CALCISTICA DEVE ESSERE ANIMATA»:
   quanto SI MUOVE la festa, fotogramma per fotogramma.

   La cura di _t-festa-corpo.js allunga la tenuta del pugno (il rientro
   parte a u 0,84 invece che 0,66) e anticipa l'esplosione (u 0,21
   invece che 0,32). E' un cambio di TEMPO, non solo di forma: va
   misurato se la posa resta ferma piu' a lungo.

   Misura: spostamento medio dei 18 giunti fra un fotogramma e il
   successivo, sul cronometro VERO della festa (u = el x freq, el da 0 a
   2,4 s a 60 Hz, con il tetto u<=0,99 del gioco), in metri per
   fotogramma. Poi la piu' lunga finestra CONSECUTIVA sotto 1 mm.
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
const MIS = `((clip,cad)=>{
  const B=Rig3D.banco, N=B.NJ, prev=new Float32Array(N*3), cur=new Float32Array(N*3);
  const passi=[]; let primo=true;
  for(let f=0; f<144; f++){
    const el=f/60, u=Math.min(0.99, el*cad);
    B.posa(clip, u);                       // bancoPosa prende direttamente u
    for(let j=0;j<N*3;j++) cur[j]=B.P[j];
    if(!primo){ let s=0; for(let j=0;j<N;j++){
        const dx=cur[j*3]-prev[j*3], dy=cur[j*3+1]-prev[j*3+1], dz=cur[j*3+2]-prev[j*3+2];
        s+=Math.sqrt(dx*dx+dy*dy+dz*dz); }
      passi.push(s/N); }
    primo=false;
    for(let j=0;j<N*3;j++) prev[j]=cur[j];
  }
  let vivo=0, morto=0, run=0, runMax=0, iMax=-1, somma=0;
  for(let i=0;i<passi.length;i++){
    somma+=passi[i];
    if(passi[i]<0.001){ morto++; run++; if(run>runMax){runMax=run; iMax=i-run+1;} }
    else { vivo++; run=0; }
  }
  return {media:somma/passi.length, fermi:morto, totali:passi.length,
          catenaMax:runMax, daFotogramma:iMax, passi:passi.map(x=>+x.toFixed(5))};
})`;
(async () => {
  const srv = await servi(); const br = await chromium.launch();
  const apri = async f => { const p = await br.newPage();
    await p.goto('http://127.0.0.1:' + srv.porta + '/' + f.replace(/\\/g, '/'), { waitUntil: 'load' });
    await p.waitForFunction(() => window.__test && window.__test.state);
    await p.evaluate(() => { window.requestAnimationFrame = () => 0; }); return p; };
  const pa = await apri(A), pb = await apri(B);
  const CAD = { pugno: 0.55, cielo: 0.45, ginocchia: 0.50, esultanza: 2.4 };
  console.log('=== QUANTO SI MUOVE LA FESTA — 2,4 s a 60 Hz, spostamento medio dei 18 giunti ===');
  console.log('  clip        mm/fotogramma      fotogrammi fermi (<1 mm)     catena ferma piu\' lunga');
  for (const c of Object.keys(CAD)) {
    const a = await pa.evaluate(MIS + '(' + JSON.stringify(c) + ',' + CAD[c] + ')');
    const b = await pb.evaluate(MIS + '(' + JSON.stringify(c) + ',' + CAD[c] + ')');
    console.log('  ' + c.padEnd(11) + ' A ' + (a.media * 1000).toFixed(2).padStart(6) + '  B ' + (b.media * 1000).toFixed(2).padStart(6) +
      '      A ' + String(a.fermi).padStart(3) + '/' + a.totali + '   B ' + String(b.fermi).padStart(3) + '/' + b.totali +
      '        A ' + String(a.catenaMax).padStart(3) + ' fot. (' + (a.catenaMax / 60).toFixed(2) + ' s)  B ' + String(b.catenaMax).padStart(3) + ' fot. (' + (b.catenaMax / 60).toFixed(2) + ' s)');
  }
  await br.close(); srv.chiudi();
})();
