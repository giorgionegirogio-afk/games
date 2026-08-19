/* =====================================================================
   _z-ripresa.js — LA RIPRESA DEL GOL ENTRA NELLA TABELLA.

   Il critico ha ragione su due cose e vanno misurate, non ammesse:
     1. il sigillo dell'orizzonte sta dentro duelFondo, e duelFondo lo usa
        ANCHE drawRipresaGol. Quindi la toppa del duello cambia i pixel
        della ripresa del gol, che il rapporto dichiarava intatta;
     2. la ripresa esce presto DA SEMPRE, quindi sotto il suo fondale non
        c'e' mai stato il mondo: se il fondale trapassa, quello e' un
        difetto in produzione da sempre, che nessuno ha mai guardato.

   PERCHE' NON RIUSO _zz-ripresa.js. Perche' quel banco ha lo stesso vizio
   che rende non ripetibile _zz-critica.js, e qui e' PEGGIO: updateCamera()
   sta dentro render(), e nella scena del gol la camera STRINGE sul
   marcatore — si muove di parecchio a ogni fotogramma. Il metodo
   nero-contro-bianco scatta due fotogrammi consecutivi: se la camera si
   muove fra i due, l'immagine cambia da sola e il conto dei pixel «che
   lasciano passare» diventa il conto dei pixel «che si sono mossi».
   Misurato: sulla costruzione NON toppata, camera libera, il duello dava
   fino a 17.455 px Δ141 di falso trapasso; con la camera inchiodata, ZERO.
   Qui la camera si inchioda, e il numero misura la copertura.

   E C'E' UNA MISURA CHE NON HA BISOGNO DI UN BANCO RIPETIBILE, ed e'
   quella che conta davvero. Il fondale della ripresa e' UNA drawImage a
   (0,0,VW,VH) senza traslazione: l'unico modo in cui puo' lasciar passare
   cio' che sta sotto e' essere TRASPARENTE. E la trasparenza sta scritta
   nel canale alfa della tessitura, che si legge direttamente — niente due
   scatti, niente camera, niente stato nascosto. Questo file legge l'alfa
   di duelBg[0].tex e conta i texel sotto 255, riga per riga. E' la misura
   con cui il sigillo si giudica.

   E UN NUMERO CHE QUESTO FILE STAMPAVA E' STATO TOLTO, perche' era falso.
   Diceva «sui soli 1.498.537 pixel DETERMINISTICI: trapassa 4750 px Δmax
   237», e accusava il fondale di un trapasso che non esiste. Il difetto e'
   nella sequenza: N B N, due scatti su nero al primo e al terzo posto. Un
   processo a PERIODO 2 vale uguale al primo e al terzo per costruzione,
   quindi il cancello lo dichiara deterministico e il suo movimento finisce
   contato come trapasso. La scena del gol un processo cosi' ce l'ha.
   Il conto giusto vuole due scatti consecutivi per gruppo — N N B B N N B B
   — e sta in strumenti/_zz-primer.js. Qui si dichiara quanti pixel si sono
   mossi e si manda li'; un numero comodo prodotto da un cancello che non lo
   regge e' esattamente la cosa che questo deposito non spedisce, e il verso
   in cui sbagliava (accusare invece di assolvere) non lo rende meno falso.

   uso: node strumenti/_z-ripresa.js <cartella> <file.html> [w] [h]
        (aggiungi --libera per rivedere il falso positivo)
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const DIR = path.resolve(process.argv[2]), FILE = process.argv[3];
const VW = +(process.argv[4] || 915), VH = +(process.argv[5] || 412), DPR = 2;
const FERMO = !process.argv.includes('--libera');

function servi(r) {
  return new Promise(ok => {
    const s = http.createServer((q, res) => {
      const f = path.join(r, decodeURIComponent(q.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
(async () => {
  const srv = await servi(DIR);
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR });
  await c.addInitScript(() => {
    let s = 20260819 >>> 0;
    Math.random = function () { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  });
  const p = await c.newPage();
  await p.goto(`http://127.0.0.1:${srv.porta}/${FILE}`, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__test && window.__test.state, null, { timeout: 30000 });
  await p.evaluate(() => window.__test.start ? window.__test.start() : window.__test.rigori());
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.waitForTimeout(200);

  const r = await p.evaluate((fermo) => {
    Duel.phase = 'off';
    G.goalTeam = 0; G.goalIdx = G.players.findIndex(q => q.team === 0 && q.role !== 'gk');
    G.goalSpot = { x: 300, y: 200 };
    avviaRipresa();
    const set = () => { G.scene = 'goal'; G.ripresa.t = 0.9; G.pulse = 20; G.sceneT = 3; G.timeLeft = 60; G.shake = 0; Duel.phase = 'off'; };
    set();
    duelBg[0].key = ''; duelBg[1].key = '';
    /* si lascia assestare la camera del gol PRIMA di inchiodarla: se la si
       ferma sul primo fotogramma si misura un'inquadratura che il giocatore
       non vede mai */
    for (let i = 0; i < 24; i++) { set(); render(); }
    if (fermo) window.updateCamera = function () { };
    for (let i = 0; i < 3; i++) { set(); render(); }

    const W = cv.width, H = cv.height;
    const prm = (col) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); };
    const sh = () => Uint8Array.from(ctx.getImageData(0, 0, W, H).data);
    /* IL CANCELLO DI DETERMINISMO, prima di contare qualunque cosa.
       Il metodo nero-contro-bianco vale SOLO se lo stesso fotogramma,
       disegnato due volte con lo stesso primer, da' la stessa immagine.
       Nella scena del gol non e' scontato, e la prima stesura di questo
       file ha stampato 9555 px in una passata e 17931 nella successiva
       sullo STESSO file: due numeri di cui almeno uno era una bugia.
       Qui si scatta il nero DUE volte, una prima e una dopo il bianco: se
       le due non sono identiche, il banco ha uno stato nascosto e il
       conteggio non misura la copertura. Si dice e si esce. */
    set(); prm('#000000'); render(); const A = sh();
    set(); prm('#ffffff'); render(); const B = sh();
    set(); prm('#000000'); render(); const A2 = sh();
    let deriva = 0;
    for (let i = 0; i < A.length; i += 4) if (A[i] !== A2[i] || A[i + 1] !== A2[i + 1] || A[i + 2] !== A2[i + 2]) deriva++;
    const righe = new Int32Array(H), colonne = new Int32Array(W);
    let n = 0, mx = 0, det = 0;
    for (let i = 0, px = 0; i < A.length; i += 4, px++) {
      const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
      if (d > 0) { n++; if (d > mx) mx = d; righe[(px / W) | 0]++; colonne[px % W]++; }
      /* QUI STAVA IL NUMERO PIU' SBAGLIATO DI QUESTO FILE, e va raccontato
         invece che cancellato in silenzio.
         La stesura scorsa chiamava DETERMINISTICO ogni pixel su cui i due
         scatti su nero (A e A2) coincidono, e stampava il trapasso contato
         su quelli: «sui soli 1.498.537 pixel deterministici: trapassa 4750
         px Δmax 237». Il numero era falso, e il difetto e' aritmetico, non
         di misura: la sequenza e' N B N, cioe' i due scatti su nero sono il
         PRIMO e il TERZO. Un processo a PERIODO 2 — uno stato che si
         alterna a ogni render — vale uguale al primo e al terzo per
         costruzione, quindi passa il cancello indenne e finisce dentro i
         «deterministici» portandosi appresso tutta la sua differenza. E la
         scena del gol ne ha uno: si vede confrontando il secondo scatto su
         nero di due passate diverse. Il conto che ne usciva non misurava la
         copertura, misurava l'alternanza — e accusava il fondale di un
         trapasso che non c'e'.
         Il cancello giusto ha bisogno di DUE scatti consecutivi per gruppo
         (N N B B N N B B): li' un processo a periodo 2 cade in tutti e due
         i gruppi e si autoesclude. Non e' rifatto qui per non tenere due
         copie della stessa aritmetica in due file: sta in
         strumenti/_zz-primer.js, e il comando e' stampato in fondo al
         referto. Da qui in poi questo file conta i pixel INSTABILI e lo
         dice; non chiama piu' «deterministico» quello che non ha provato
         che lo sia. */
      const uguali = (A[i] === A2[i] && A[i + 1] === A2[i + 1] && A[i + 2] === A2[i + 2]);
      if (uguali) det++;
    }
    const v = [];
    for (let i = 0; i < H; i++) if (righe[i]) v.push(i + ':' + righe[i]);
    const cc = [];
    for (let i = 0; i < W; i++) if (colonne[i]) cc.push([i, colonne[i]]);
    cc.sort((a, b) => b[1] - a[1]);
    /* L'ALFA DELLA TESSITURA, la misura che non dipende dal banco. */
    const T = duelBg[0].tex || duelBg[1].tex;
    let alfa = null;
    if (T) {
      const tc = T.getContext('2d');
      const dd = tc.getImageData(0, 0, T.width, T.height).data;
      const perRiga = new Int32Array(T.height);
      let sotto = 0, minA = 255;
      for (let i = 3, px = 0; i < dd.length; i += 4, px++) {
        const A0 = dd[i];
        if (A0 < 255) { sotto++; if (A0 < minA) minA = A0; perRiga[(px / T.width) | 0]++; }
      }
      const rr = [];
      for (let i = 0; i < T.height; i++) if (perRiga[i]) rr.push(i + ':' + perRiga[i]);
      alfa = { w: T.width, h: T.height, sotto, minA: sotto ? minA : 255, righe: rr.slice(0, 8), nRighe: rr.length };
    }
    return {
      alfa,
      deriva, det,
      n, mx, W, H, righe: v.slice(0, 12), nRighe: v.length, nCol: cc.length,
      colTop: cc.slice(0, 10).map(a => a[0] + ':' + a[1]),
      hz: (typeof ripresaGeo === 'function' ? +ripresaGeo().hz.toFixed(4) : null),
    };
  }, FERMO);
  console.log(`${FILE.padEnd(20)} RIPRESA DEL GOL  tela ${r.W}x${r.H}  camera ${FERMO ? 'INCHIODATA' : 'libera'}`);
  if (r.alfa) {
    console.log(`   TESSITURA duelFondo ${r.alfa.w}x${r.alfa.h}: ${r.alfa.sotto} texel con alfa<255` +
      (r.alfa.sotto ? `, alfa minima ${r.alfa.minA}/255, su ${r.alfa.nRighe} righe  [${r.alfa.righe.join('  ')}]` : '  — OPACA'));
  }
  if (r.deriva) {
    console.log(`   BANCO NON RIPETIBILE: lo stesso fotogramma disegnato due volte sullo stesso`);
    console.log(`   primer differisce in ${r.deriva} px. Il conteggio qui sotto NON misura la`);
    console.log(`   copertura, misura lo stato nascosto. Non usarlo.`);
  }
  console.log(`   trapassa ${r.n} px  Δmax ${r.mx}   righe toccate ${r.nRighe}/${r.H}   (orizzonte g.hz=${r.hz})`);
  if (r.righe.length) console.log('   y:conteggio  ' + r.righe.join('  '));
  console.log(`   colonne toccate ${r.nCol}/${r.W}   x:conteggio  ` + r.colTop.join('  '));
  /* IL NUMERO CHE QUESTO FILE NON HA IL DIRITTO DI DARE, detto in chiaro.
     Vedi il commento lungo nel corpo: la sequenza N B N non sa distinguere
     un pixel fermo da un pixel che si alterna a periodo 2, quindi qualunque
     conteggio «sui soli pixel deterministici» sarebbe una stima spacciata
     per una misura. Si dichiara quanti pixel il cancello ha visto muoversi
     e si manda a chi il numero lo sa fare. */
  console.log(`   pixel su cui i due scatti su nero NON coincidono: ${r.W * r.H - r.det} su ${r.W * r.H}`);
  console.log(`   IL TRAPASSO VERO QUESTO FILE NON LO DA'. La sequenza qui e' N B N: un processo`);
  console.log(`   a periodo 2 e' uguale al primo e al terzo scatto per costruzione, passa il`);
  console.log(`   cancello e falsa il conto. Serve N N B B N N B B:`);
  console.log(`      node strumenti/_zz-primer.js ${path.relative(process.cwd(), DIR)} ${FILE} ${VW} ${VH} gol`);
  await b.close(); srv.chiudi();
  process.exit(r.deriva ? 1 : 0);
})();
