/* _crit-lente.js — la lente: ritaglia lo STESSO riquadro dai due
   fotogrammi (prima/dopo) e li mette affiancati, ingranditi.
   uso: node strumenti/_crit-lente.js --k 14 --x 1150 --y 250 --w 330 --h 340 --z 2 --png fuori/_lente.png */
const fs = require('fs'), path = require('path'), { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const KS = arg('k', '14').split(',').map(Number);
const X = +arg('x', 1150), Y = +arg('y', 250), W = +arg('w', 330), H = +arg('h', 340), Z = +arg('z', 2);
const PNG = arg('png', 'fuori/_lente.png');
const A = arg('a', 'fuori/_crit-festa-PRIMA'), B = arg('b', 'fuori/_crit-festa-DOPO');
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(path.resolve(RADICE, f)).toString('base64');
(async () => {
  const righe = KS.map(k => ({ k, a: b64(A + '/f' + String(k).padStart(2, '0') + '.png'), b: b64(B + '/f' + String(k).padStart(2, '0') + '.png') }));
  const br = await chromium.launch();
  const pag = await br.newPage({ viewport: { width: KS.length * W * Z + 90, height: 2 * H * Z + 60 } });
  await pag.setContent(`<body style="margin:0;background:#111;font:12px monospace;color:#fff">
   <div id=r></div><script>
   const R=${JSON.stringify(righe)}, W=${W},H=${H},X=${X},Y=${Y},Z=${Z};
   const c=document.createElement('canvas'); c.width=R.length*W*Z+90; c.height=2*H*Z+60;
   const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
   g.fillStyle='#111'; g.fillRect(0,0,c.width,c.height);
   let n=0; const fine=()=>{ if(++n===R.length*2){ document.getElementById('r').innerHTML='<img src="'+c.toDataURL()+'">'; window.__ok=1; } };
   g.fillStyle='#fff'; g.font='bold 16px monospace';
   R.forEach((r,i)=>{
     ['a','b'].forEach((k,j)=>{
       const im=new Image(); im.onload=()=>{ g.drawImage(im, X,Y,W,H, 90+i*W*Z, 30+j*H*Z, W*Z,H*Z);
         g.fillStyle='#fff'; g.fillText(k==='a'?'PRIMA':'DOPO', 6, 30+j*H*Z+20);
         g.fillText('k'+r.k, 90+i*W*Z+4, 22); fine(); };
       im.src=r[k];
     });
   });
   </script></body>`);
  await pag.waitForFunction(() => window.__ok);
  await pag.locator('img').screenshot({ path: path.resolve(RADICE, PNG) });
  console.log('scritto ' + PNG);
  await br.close();
})();
