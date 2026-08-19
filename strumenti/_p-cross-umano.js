/* =====================================================================
   _p-cross-umano.js — IL CROSS DEL GIOCATORE NON E' CAMBIATO.

   La toppa _t-cross-cpu.js aggiunge a doCross un QUARTO argomento, e
   dice che senza quell'argomento il cross resta identico al bit. Questa
   e' una frase, e una frase non e' una prova. Qui si prova.

   COME. Su tutte e tre le taglie e su una griglia di posizioni del
   crossatore (le due meta' del campo in altezza, tre distanze dalla
   porta, tutte e due le squadre) si mette il pallone ai piedi di un
   giocatore in un punto ESATTO, si chiama doCross con TRE argomenti —
   la stessa chiamata che fanno il flick trasversale e doFiltrante — e
   si leggono i sette numeri che il gesto scrive: la velocita' del
   pallone sui tre assi, la sua posizione, la clip del rig del
   calciatore, il suo verso e il contatore dei cross nel tabellino.
   Poi si rifa' tutto sull'altro file e si confrontano BIT A BIT, in
   esadecimale, senza tolleranze: uno scarto di un ulp e' uno scarto.

   E DUE COSE IN PIU', chieste dal critico (a15.md, punto 5): la prima
   versione di questo cancello chiamava doCross(p,nx,ny) DIRETTAMENTE dal
   contesto valutato, cioe' provava che LA FUNZIONE a tre argomenti e'
   identica — cosa vera e utile — ma non che l'esperienza del giocatore lo
   sia, e non guardava mai che i due chiamanti veri continuassero a
   passare tre argomenti. Adesso:

   B) IL CHIAMANTE VERO. Si apre una partita a UNA PERSONA, si mette il
      pallone ai piedi dell'uomo comandato dal dito nella meta' campo
      offensiva e si chiama doFiltrante(0, true) — che e' esattamente la
      strada del pulsante del cross. Si lascia maturare l'anticipo e si
      legge quanti argomenti doCross ha ricevuto: devono essere TRE, e il
      quarto e il quinto devono essere undefined. Si controlla anche che
      un cross umano non scriva NESSUN destinatario sul pallone.

   C) TUTTI I PUNTI DI CHIAMATA, staticamente. Si elencano tutte le
      chiamate a doCross nei due file e si conta quanti argomenti passano.
      Quelle che NON stanno dentro crossCPU devono passarne tre nei due
      file, con lo stesso testo. Se un domani qualcuno aggiunge un quarto
      argomento a una chiamata umana, questo cancello diventa rosso senza
      che nessuno debba ricordarsene.

   uso: node strumenti/_p-cross-umano.js prima.html dopo.html
   Esce 0 se i due file danno gli stessi numeri, 1 se anche uno solo
   differisce (e dice quale caso e quale numero).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* i sette numeri del gesto, in esadecimale: niente arrotondamenti */
const PROVA = `(([taglia, casi]) => {
  const t = window.__test;
  t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
  t.setCpuVsCpu(true);
  const bit = x => { const b=new DataView(new ArrayBuffer(8)); b.setFloat64(0, x);
    return b.getUint32(0).toString(16).padStart(8,'0')+b.getUint32(4).toString(16).padStart(8,'0'); };
  const out = [];
  for(const [team, fx, fy, nx, ny] of casi){
    let p=null;
    for(const q of G.players){ if(q.team===team && q.role!=='gk' && q.out<=0){ p=q; break; } }
    if(!p){ out.push('nessun giocatore'); continue; }
    const pi=G.players.indexOf(p);
    /* stato ESATTO e ripetibile: il crossatore dove diciamo noi, con la
       palla ai piedi, il corpo fermo e nessun anticipo aperto */
    p.x=fx*FW; p.y=fy*FH; p.vx=0; p.vy=0; p.fx=1; p.fy=0;
    p.charge=-1; p.chargeGo=null; p.chargeClip=null; p.kickCd=0; p.slide=-1; p.recover=0; p.rove=-1;
    const b=G.ball;
    b.owner=pi; b.x=p.x; b.y=p.y; b.z=0; b.vx=0; b.vy=0; b.vz=0; b.curve=0; b.passTo=-1;
    G.stats.cross[0]=0; G.stats.cross[1]=0;
    doCross(p, nx, ny);                       // TRE argomenti: la chiamata umana
    out.push([bit(b.vx), bit(b.vy), bit(b.vz), bit(b.x), bit(b.y),
              String(p.kickClip), bit(p.fx), bit(p.fy),
              (G.stats.cross[0]|0)+'/'+(G.stats.cross[1]|0)].join(' '));
  }
  return out;
})`;

/* --- B) il chiamante vero: doFiltrante col cross --- */
const PROVA_CHIAMANTE = `(() => {
  const t = window.__test;
  t.startMatch(1, 1);                       // una persona: la squadra 0 ha un dito
  const out = { arg: [], crossTo: [], chiamate: 0, via: 'doFiltrante(0,true)' };
  const _dc = window.doCross;
  window.doCross = function(){
    out.chiamate++;
    out.arg.push(arguments.length + 'arg ' +
      (arguments[3]===undefined?'mira=undefined':'mira=DATA') + ' ' +
      (arguments[4]===undefined?'dest=undefined':'dest=DATO'));
    const r = _dc.apply(this, arguments);
    out.crossTo.push(G.ball.crossTo===undefined ? 'assente' : String(G.ball.crossTo));
    return r;
  };
  const pi = G.ctrl[0];
  const p = G.players[pi];
  if(!p){ window.doCross=_dc; out.errore='nessun uomo comandato dal dito'; return out; }
  p.x = FW*0.80; p.y = FH*0.20; p.vx=0; p.vy=0; p.fx=1; p.fy=0;
  p.charge=-1; p.chargeGo=null; p.chargeClip=null; p.kickCd=0; p.slide=-1; p.recover=0; p.rove=-1;
  const b=G.ball;
  b.owner=pi; b.x=p.x; b.y=p.y; b.z=0; b.vx=0; b.vy=0; b.vz=0; b.curve=0; b.passTo=-1;
  doFiltrante(0, true);
  for(let i=0;i<20 && out.chiamate===0;i++) maturaAnticipi(1/60);
  window.doCross = _dc;
  return out;
})`;

/* --- C) tutti i punti di chiamata, letti nel testo del file --- */
function chiamate(sorgente) {
  const out = [];
  const re = /doCross\s*\(/g;
  let m;
  while ((m = re.exec(sorgente)) !== null) {
    const pre = sorgente.slice(Math.max(0, m.index - 9), m.index);
    if (/function\s*$/.test(pre)) continue;            // la dichiarazione, non una chiamata
    let i = re.lastIndex, dep = 1, virg = 0;
    while (i < sorgente.length && dep > 0) {
      const c = sorgente[i];
      if (c === '(') dep++;
      else if (c === ')') dep--;
      else if (c === ',' && dep === 1) virg++;
      i++;
    }
    const testo = sorgente.slice(m.index, i).replace(/\s+/g, ' ');
    /* sta dentro crossCPU? l'ultima "function" dichiarata prima e' quella */
    const prima = sorgente.slice(0, m.index);
    const ult = prima.lastIndexOf('\nfunction ');
    const dentro = ult >= 0 && prima.slice(ult + 1, ult + 30).indexOf('crossCPU') >= 0;
    out.push({ argomenti: virg + 1, dentro, testo });
  }
  return out;
}

const CASI = [];
for (const team of [0, 1])
  for (const fy of [0.12, 0.30, 0.70, 0.88])
    for (const fx of [0.20, 0.45, 0.62, 0.80, 0.93])
      CASI.push([team, fx, fy, 0.3, 0.9]);

async function misura(browser, porta, taglia) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(() => {
    let s = 20260803 >>> 0;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
  });
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); });
  const r = await pag.evaluate(`(${PROVA})([${taglia}, ${JSON.stringify(CASI)}])`);
  await ctx.close();
  if (errori.length) throw new Error('eccezione nella pagina: ' + errori[0]);
  return r;
}

async function chiamante(browser, porta) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(() => {
    let s = 20260803 >>> 0;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
  });
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); });
  const r = await pag.evaluate(`(${PROVA_CHIAMANTE})()`);
  await ctx.close();
  if (errori.length) throw new Error('eccezione nella pagina: ' + errori[0]);
  return r;
}

(async () => {
  const [, , A, B] = process.argv;
  if (!A || !B) { console.error('uso: node strumenti/_p-cross-umano.js prima.html dopo.html'); process.exit(2); }
  const guai = [];
  let confronti = 0;
  const browser = await chromium.launch();

  /* --- C) i punti di chiamata, nel testo dei due file --- */
  const cA = chiamate(fs.readFileSync(path.resolve(A), 'utf8'));
  const cB = chiamate(fs.readFileSync(path.resolve(B), 'utf8'));
  const umA = cA.filter(c => !c.dentro), umB = cB.filter(c => !c.dentro);
  console.log(`  --    punti di chiamata a doCross: ${cA.length} in A, ${cB.length} in B`);
  for (const c of cB) console.log(`        ${c.argomenti} argomenti ${c.dentro ? '(dentro crossCPU)' : '(UMANO)'}: ${c.testo}`);
  if (umA.length !== umB.length) guai.push(`i chiamanti umani sono ${umA.length} in A e ${umB.length} in B`);
  else for (let i = 0; i < umA.length; i++) {
    confronti++;
    if (umA[i].argomenti !== 3 || umB[i].argomenti !== 3)
      guai.push(`chiamante umano ${i}: ${umA[i].argomenti} argomenti in A, ${umB[i].argomenti} in B (ne servono 3)`);
    if (umA[i].testo !== umB[i].testo)
      guai.push(`chiamante umano ${i} cambiato:\n        A: ${umA[i].testo}\n        B: ${umB[i].testo}`);
  }

  /* --- B) il chiamante vero, in una partita a una persona --- */
  for (const [et, f] of [['A', A], ['B', B]]) {
    const srv = await servi(path.resolve(f));
    const r = await chiamante(browser, srv.porta); srv.chiudi();
    console.log(`  --    ${et}: ${r.via} -> doCross chiamata ${r.chiamate} volte  [${r.arg.join(' | ')}]  crossTo=[${r.crossTo.join(',')}]`);
    confronti++;
    if (r.errore) guai.push(`${et}: ${r.errore}`);
    else if (r.chiamate !== 1) guai.push(`${et}: il pulsante del cross ha chiamato doCross ${r.chiamate} volte invece di 1`);
    else if (!/^3arg mira=undefined dest=undefined$/.test(r.arg[0]))
      guai.push(`${et}: il chiamante umano passa "${r.arg[0]}" invece di tre argomenti nudi`);
    else if (!['assente', '-1'].includes(r.crossTo[0]))
      guai.push(`${et}: un cross umano ha scritto un destinatario sul pallone (crossTo=${r.crossTo[0]})`);
  }
  for (const taglia of [5, 7, 11]) {
    const sa = await servi(path.resolve(A));
    const ra = await misura(browser, sa.porta, taglia); sa.chiudi();
    const sb = await servi(path.resolve(B));
    const rb = await misura(browser, sb.porta, taglia); sb.chiudi();
    for (let i = 0; i < ra.length; i++) {
      confronti++;
      if (ra[i] !== rb[i]) guai.push(`taglia ${taglia}, caso ${JSON.stringify(CASI[i])}\n        A: ${ra[i]}\n        B: ${rb[i]}`);
    }
    console.log(`  --    taglia ${taglia}: ${ra.length} cross umani confrontati bit a bit`);
  }
  await browser.close();
  if (guai.length) {
    console.log(`\n  NO   il cross del giocatore E' CAMBIATO: ${guai.length} guai su ${confronti} confronti`);
    console.log('        ' + guai.slice(0, 4).join('\n        '));
    process.exit(1);
  }
  console.log(`\n  OK   il cross del giocatore e' identico al bit in tutti e ${confronti} i confronti,`);
  console.log('  OK   il chiamante vero (doFiltrante) passa tre argomenti nudi e non scrive destinatari,');
  console.log('  OK   e nessun punto di chiamata umano e\' cambiato di un carattere.');
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
