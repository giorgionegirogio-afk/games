/* =====================================================================
   _t3-scavo.js — SOLA MISURA. Non scrive una riga nel gioco.

   LA DOMANDA. Il referto ONDA-ANIMAZIONE (voce 38, famiglia F3) accusa
   `cielo` e `pugno` di non leggersi, e la prova che porta e' la REGOLA
   SAGITTALE: 100,0% e 91,4% dei loro inizi «sotto il tratto».
   Ma il cappello di `strumenti/_z-leggibile.js` — cioe' lo strumento
   che quella regola la calcola — dichiara per iscritto che su queste
   DUE clip la regola e' un falso positivo:

     «Una posa che sull'asse sagittale non mette quasi niente non ha
      quasi niente da perdere, e la regola la marca illeggibile lo
      stesso. Lo si vede gia' nel referto del 18 agosto, dove `cielo` e
      `pugno` sono marcati NO ... mentre la stessa tabella li da'
      leggibili a qualunque imbardata.»

   Prima di riscrivere due pose che forse funzionano, si misura con
   l'ALTRO metro — quello che in questa casa e' stato pagato con un
   provino cieco umano il 17 agosto 2026 e che sta scritto in
   `strumenti/silhouette.js`:

     SCAVO = frazione del guscio convesso della sagoma occupata da
             SFONDO. Soglia 0,33. E' l'unico dei cinque criteri che
             separi le tre pose che l'uomo ha NOMINATO (0,364 0,349
             0,401) dalle quattro che ha visto FUSE (0,278 0,303 0,268
             0,319). E' un VETO nel cancello della sagoma.

   IL CONTROLLO DI CONTROLLO, e senza di esso questo banco sarebbe un
   timbro. Prima di misurare qualunque cosa nuova, lo strumento
   RIPRODUCE le dieci celle del provino di silhouette.js (yaw 0,95,
   corporatura 3, le stesse fasi) e confronta con i valori pubblicati
   nel cappello di quel file. Se anche una sola cella non torna entro
   0,02, si ferma: vorrebbe dire che sta misurando un'altra cosa.
   In piu' disegna DUE SAGOME BUGIARDE costruite apposta per essere
   illeggibili — la figura a riposo e il birillo (braccia e gambe
   incollate al corpo, ottenute chiedendo al rig la posa `fermo`
   schiacciata a un'imbardata frontale) — e pretende che il numero le
   bocci. Un banco che non sa dire rosso non sa dire verde.

   uso:
     node strumenti/_t3-scavo.js --gioco fuori/anim-terza.html
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
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');

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

/* le dieci celle del provino cieco. La colonna «atteso» e' quella che
   `node strumenti/silhouette.js --gioco <lo stesso file>` STAMPA OGGI,
   non quella scritta nel cappello di silhouette.js.

   PERCHE', ed e' una trappola da lasciare scritta: i numeri del cappello
   (0,278 0,303 0,268 0,364 0,349 0,384 0,279 0,319 0,401 0,351) sono del
   17 agosto 2026, e da allora meta' di quelle pose e' stata riscritta —
   il tuffo per primo. Ancorando il controllo a quelli, la prima stesura
   di questo banco si e' fermata con uno scarto peggiore di 0,113 su
   «corre» e 0,080 sul tuffo: NON stava sbagliando, stava confrontando due
   edizioni. Contro i valori di oggi lo scarto peggiore e' zero a tre
   decimali su tutte e dieci le celle. */
const RIFERIMENTO = [
  ['fermo', 0.20, 'sta fermo', 0.330],
  ['camminata', 0.15, 'cammina', 0.338],
  ['corsa', 0.32, 'corre', 0.381],
  ['tiro', 0.30, 'carica il tiro', 0.332],
  ['tiro', 0.62, 'ha appena tirato', 0.356],
  ['scivolata', 0.35, 'scivola', 0.418],
  ['tuffo', 0.42, 'il portiere si tuffa', 0.359],
  ['attesaGK', 0.25, 'il portiere aspetta', 0.348],
  ['esultanza', 0.30, 'esulta', 0.408],
  ['delusione', 0.55, "e' deluso", 0.355],
];

const SONDA = String.raw`(() => {
  const CW=104, CH=124;
  const cv=document.createElement('canvas'); cv.width=CW; cv.height=CH;
  const g=cv.getContext('2d',{willReadFrequently:true});
  const NERO='#000';
  const nero={maglia:NERO,maglia2:NERO,pantaloncini:NERO,calze:NERO,risvolto:NERO,
    pelle:NERO,capelli:NERO,scarpe:NERO,palla:null,taglio:0,corp:3,varb:0,
    _lume:NERO,_ombra:NERO,
    _ombS:{maglia:NERO,maglia2:NERO,calze:NERO,pantaloncini:NERO,pelle:NERO}};

  /* IL DISEGNO E' QUELLO DEL GIOCO, riga per riga come ?banco=silhouette:
     stessa Rig3D.disegna, stessa camera 'alto', stessa scala RIG_H x P_DIS. */
  function cella(clip,u,yaw,corp){
    const cx=CW/2, cy=CH-14;
    nero.corp=corp;
    g.setTransform(1,0,0,1,0,0);
    g.clearRect(0,0,CW,CH);
    g.save();
    g.translate(cx,cy); g.scale(P_DIS,P_DIS); g.translate(-cx,-cy);
    Rig3D.disegna(g,cx,cy,RIG_H,yaw,'alto',clip,u/Rig3D.CLIPS[clip].freq,nero,true,P_DIS);
    g.restore();
    return g.getImageData(0,0,CW,CH).data;
  }

  /* lo SCAVO, identico al MISURA_SCAVO di strumenti/silhouette.js */
  function scavo(dati){
    const W=CW,H=CH;
    let minx=1e9,maxx=-1,miny=1e9,maxy=-1,tot=0;
    const m=new Uint8Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(dati[(y*W+x)*4+3]>128){ m[y*W+x]=1; tot++;
        if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; }
    }
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
    return {scavo:vuoto/(vuoto+pieno), bw, bh, forma:bw/bh, inchiostro:tot/(bw*bh)};
  }

  /* LE DUE SAGOME BUGIARDE, e sono geometria pura perche' devono avere
     una risposta NOTA PRIMA di misurarla:
       il BLOCCO   un ellisse pieno. E' convesso: dentro il suo guscio non
                   c'e' un pixel di sfondo, quindi lo scavo deve valere 0.
                   E' il «birillo» del cappello di silhouette.js.
       la CROCE    quattro bracci sottili che escono da un centro. Il
                   guscio e' un quadrato e i quattro quadranti sono vuoti:
                   lo scavo deve stare largamente sopra la soglia.
     Se il banco non separa questi due non separa niente. */
  function bugiarda(quale){
    g.setTransform(1,0,0,1,0,0);
    g.clearRect(0,0,CW,CH);
    g.fillStyle='#000';
    if(quale==='blocco'){ g.beginPath(); g.ellipse(CW/2,CH/2,17,44,0,0,Math.PI*2); g.fill(); }
    else { g.fillRect(CW/2-4,CH/2-44,8,88); g.fillRect(CW/2-38,CH/2-4,76,8); }
    return scavo(g.getImageData(0,0,CW,CH).data);
  }

  window.__t3 = {
    misura(clip,u,yaw,corp){ return scavo(cella(clip,u,yaw,corp===undefined?3:corp)); },
    bugiarda,
    clips(){ return Object.keys(Rig3D.CLIPS); },
  };
  return 'ok';
})()`;

const f = (x, d) => (isFinite(x) ? x.toFixed(d === undefined ? 3 : d) : '  -');

(async () => {
  const srv = await servi();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(250);
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('sonda non installata: ' + inst);

  const mis = (clip, u, yaw, corp) => pag.evaluate(([c, u2, y, k]) => window.__t3.misura(c, u2, y, k), [clip, u, yaw, corp === undefined ? 3 : corp]);

  console.log('=====================================================================');
  console.log(' _t3-scavo — ' + GIOCO);
  console.log('=====================================================================');

  /* ---------- 1. il controllo di controllo ---------- */
  console.log('\n 1. CONTROLLO: le dieci celle del provino cieco di silhouette.js');
  console.log('    (yaw 0,95  corporatura 3 — l\'angolo di presentazione)\n');
  console.log('    posa                        scavo qui   pubblicato   scarto');
  let peggio = 0;
  for (const [clip, u, nome, atteso] of RIFERIMENTO) {
    const r = await mis(clip, u, 0.95, 3);
    const d = Math.abs(r.scavo - atteso);
    if (d > peggio) peggio = d;
    console.log('    ' + nome.padEnd(24) + f(r.scavo).padStart(8) + f(atteso).padStart(13) + f(d).padStart(10));
  }
  console.log('\n    scarto peggiore ' + f(peggio) + (peggio <= 0.02
    ? '  -> il banco misura la stessa cosa di silhouette.js'
    : '  -> FERMATI: sta misurando un\'altra cosa'));
  if (peggio > 0.02) { await browser.close(); srv.chiudi(); process.exit(2); }

  /* ---------- 2. le sagome bugiarde ---------- */
  console.log('\n 2. IL ROSSO DIMOSTRATO: due sagome con la risposta nota PRIMA della misura');
  let controlloOk = true;
  for (const [q, nome, atteso] of [['blocco', 'il BLOCCO (ellisse pieno) — deve dare zero', 'rosso'],
                                   ['croce', 'la CROCE (quattro bracci nudi) — deve dare molto', 'verde']]) {
    const r = await pag.evaluate(x => window.__t3.bugiarda(x), q);
    const esito = r.scavo < 0.33 ? 'rosso' : 'verde';
    if (esito !== atteso) controlloOk = false;
    console.log('    ' + nome.padEnd(50) + 'scavo ' + f(r.scavo) + '  -> ' + esito +
      (esito === atteso ? '   (giusto)' : '   *** IL BANCO NON SA GIUDICARE ***'));
  }
  if (!controlloOk) { await browser.close(); srv.chiudi(); process.exit(3); }

  /* ---------- 3. le quattro clip di festa, all'angolo VERO del gioco ---------- */
  /* rigAngolo: la festa guarda pi/2 +- 0,38 (riga 31929 del gioco), quindi
     lo yaw passato a Rig3D.disegna e' quello + RIG_YAW_K = pi/2. */
  const YAW_FESTA = [Math.PI / 2 + 0.38 + Math.PI / 2, Math.PI / 2 - 0.38 + Math.PI / 2];
  console.log('\n 3. LE QUATTRO CLIP DI FESTA, ALL\'IMBARDATA VERA DELLA FESTA');
  console.log('    (yaw = pi/2 +- 0,38 + RIG_YAW_K, cioe\' ' +
    f(YAW_FESTA[0], 3) + ' e ' + f(YAW_FESTA[1], 3) + ' rad; soglia scavo 0,33)\n');
  console.log('    clip         fase   scavo A  scavo B   forma   verdetto');
  /* le fasi VERE degli inizi: rigStato manda u = el*k (+ scarto d'indice),
     con el = secondi dal gol. Si misura a 0,00 / 0,15 / 0,40 / 0,80 s. */
  const CADENZA = { cielo: 0.45, pugno: 0.55, ginocchia: 0.50, esultanza: 2.4 };
  for (const clip of ['cielo', 'pugno', 'ginocchia', 'esultanza']) {
    for (const el of [0.00, 0.15, 0.40, 0.80, 1.40]) {
      const u = clip === 'esultanza' ? (el * 2.4) % 1 : Math.min(0.99, el * CADENZA[clip]);
      const a = await mis(clip, u, YAW_FESTA[0], 3);
      const b = await mis(clip, u, YAW_FESTA[1], 3);
      const pass = a.scavo >= 0.33 && b.scavo >= 0.33;
      console.log('    ' + clip.padEnd(12) + f(u, 2).padStart(5) + f(a.scavo).padStart(9) +
        f(b.scavo).padStart(9) + f(a.forma).padStart(8) + '   ' +
        (pass ? 'nominabile' : 'sotto la soglia') + '   (el=' + el.toFixed(2) + ' s)');
    }
    console.log('');
  }

  /* ---------- 4. tuffo e parata, agli angoli veri del portiere ---------- */
  console.log(' 4. TUFFO E PARATA, agli angoli veri del portiere');
  console.log('    (|sin(yaw)| = |diveDX|: 0,20 e\' la mediana del tuffo, 0,95 quella della parata)\n');
  console.log('    clip      fase   yaw     |sin|   scavo   forma');
  for (const [clip, u] of [['tuffo', 0.42], ['tuffo', 0.30], ['parata', 0.30], ['parata', 0.50]]) {
    for (const sn of [0.20, 0.50, 0.95]) {
      const yaw = Math.asin(sn);
      const r = await mis(clip, u, yaw, 3);
      console.log('    ' + clip.padEnd(9) + f(u, 2).padStart(5) + f(yaw, 3).padStart(8) +
        f(sn, 2).padStart(8) + f(r.scavo).padStart(8) + f(r.forma).padStart(8));
    }
  }

  /* ---------- 5. LA SPAZZATA D'IMBARDATA sulle quattro clip di festa ----------
     rigAngolo dichiara «la festa va verso la curva sud di TRE QUARTI»
     (riga 31929 del gioco) e poi scrive pi/2 +- 0,38: ventidue gradi, non
     quarantacinque. Qui si misura che cosa costa quella differenza.
     La finestra campionata e' 0-1,6 s dal gol ogni 0,2 s, sui due lati:
     e' quella che la ripresa del gol mette in scena. */
  const SCARTI = [0.00, 0.20, 0.38, 0.55, 0.70, 0.85, 1.00, 1.20];
  const CAD2 = { cielo: 0.45, pugno: 0.55, ginocchia: 0.50, esultanza: 2.4 };
  const raccogli = async (clip, d) => {
    const v = [];
    for (let el = 0; el <= 1.6001; el += 0.2) {
      const u = clip === 'esultanza' ? (el * 2.4) % 1 : Math.min(0.99, el * CAD2[clip]);
      for (const sgn of [1, -1]) v.push((await mis(clip, u, Math.PI + sgn * d, 3)).scavo);
    }
    return v;
  };
  console.log('\n 5. SPAZZATA D\'IMBARDATA — scavo MEDIO nei primi 1,6 s di festa');
  console.log('    scarto = di quanto la festa si gira via dal frontale. Oggi: 0,38 rad.');
  console.log('    |sin(yaw)| e\' il fattore della regola sagittale allo stesso angolo.\n');
  console.log('    scarto rad  ' + SCARTI.map(d => f(d, 2).padStart(7)).join(''));
  console.log('    |sin(yaw)|  ' + SCARTI.map(d => f(Math.abs(Math.sin(Math.PI + d)), 2).padStart(7)).join(''));
  const tabella = {};
  for (const clip of ['cielo', 'pugno', 'ginocchia', 'esultanza']) {
    tabella[clip] = [];
    for (const d of SCARTI) tabella[clip].push(await raccogli(clip, d));
    console.log('    ' + clip.padEnd(12) +
      tabella[clip].map(v => f(v.reduce((a, b) => a + b, 0) / v.length).padStart(7)).join(''));
  }
  console.log('\n    e la frazione di quei campioni SOPRA la soglia 0,33:');
  console.log('    scarto rad  ' + SCARTI.map(d => f(d, 2).padStart(7)).join(''));
  for (const clip of ['cielo', 'pugno', 'ginocchia', 'esultanza'])
    console.log('    ' + clip.padEnd(12) + tabella[clip].map(v =>
      (v.filter(x => x >= 0.33).length / v.length * 100).toFixed(0).padStart(6) + '%').join(''));

  if (errori.length) { console.log('\n ECCEZIONI:'); errori.forEach(e => console.log('  ' + e)); }
  await browser.close(); srv.chiudi();
})();
