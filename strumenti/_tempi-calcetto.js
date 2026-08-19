/* =====================================================================
   TEMPI-CALCETTO — quanti fotogrammi fra il dito e la palla che parte.

   IL PERCHE'. Di FC 25 ho misurato le pressioni sul controller disegnato
   (strumenti/_video-tempi.js). Perche' il confronto abbia senso serve lo
   stesso numero per CALCETTO, e finora non esisteva.

   DOVE GIRA, DICHIARATO. Il telefono vero c'e' ma adb lo vede
   `unauthorized`: l'autorizzazione USB va accettata sullo schermo del
   telefono e da qui non si tocca. Percio' questa misura NON e' sul
   telefono: e' nel motore, in Chromium, con eventi touch veri iniettati
   dal protocollo di debug. Misura i fotogrammi che il GIOCO impiega a
   trasformare un tocco in velocita' del pallone. NON contiene la catena
   del telefono (digitalizzatore, coda di ingresso di Android, WebView,
   composizione, pannello): quella parte non l'ho misurata, e va aggiunta
   a parte il giorno che il telefono e' autorizzato.

   COME MISURA. Un ricciolo su requestAnimationFrame registra, ad ogni
   fotogramma, la velocita' del pallone e chi lo possiede; i tocchi
   registrano il numero di fotogramma in cui arrivano. Il contatto NON e'
   un salto di velocita' scelto a occhio: e' il PALLONE CHE CAMBIA
   PROPRIETARIO, che il gioco dichiara, confermato da un salto di velocita'.

   I DUE GESTI NON SI CONTANO DALLO STESSO ISTANTE, e il gioco dice perche':
   'through' (FILTRANTE) chiama doFiltrante SULLA PRESSIONE, 'shot' (TIRA)
   apre startCharge sulla pressione e calcia in releaseCharge, cioe' AL
   RILASCIO. Mescolarli darebbe una mediana che non descrive nessuno dei due.

   TRE CONTROLLI, perche' un numero solo non si sa se e' vero:
   1) si contano solo i tocchi in cui il pallone era GIA' del giocatore
      comandato: se non ce l'ha, il pulsante non puo' calciare;
   2) PROVA IN BIANCO: si rifa' il conto spostando i tocchi nel tempo. Il
      confronto NON e' su quante volte si trova un calcio (sul banco se ne
      calcia uno al secondo, e una finestra a caso ne pesca uno sei volte
      su dieci: contare non distingue niente) ma sulla STRETTEZZA della
      distribuzione: un legame vero ammucchia i ritardi, un incontro
      casuale li spalma;
   3) se i casi sono meno di otto o non battono la prova in bianco, lo
      strumento NON stampa una mediana. In partita libera succede: il
      pallone e' del giocatore comandato troppo di rado.

   uso:  node strumenti/_tempi-calcetto.js --banco --prove 60   (consigliato)
         node strumenti/_tempi-calcetto.js --sec 240            (partita libera)
         node strumenti/_tempi-calcetto.js --mostra     (finestra visibile)
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const bandiera = n => process.argv.includes('--' + n);
const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length ? o[o.length >> 1] : NaN; };
const pct = (a, p) => { const o = [...a].sort((x, y) => x - y); return o.length ? o[Math.min(o.length - 1, Math.max(0, Math.round(p * (o.length - 1))))] : NaN; };

const SEC = +arg('sec', 75);
const TAGLIA = +arg('taglia', 5);
const PORTA = +arg('porta', 8791);
const SOGLIA_CALCIO = +arg('soglia', 40);    // salto di velocita' in unita'/fotogramma
const FINESTRA = 20;                          // fotogrammi in cui cerco il calcio
const SFASAMENTI = [37, 91, 173, 311, -59, -137];

/* --- il ricciolo che registra, iniettato nella pagina --- */
const REGISTRA = `(()=>{
  if(window.__mis) return 'gia";
  const M = {f:0, palla:[], tocchi:[]};
  window.__mis = M;
  const T = window.__test;
  function tic(){
    try{
      const b=T.ball, G=T.G||null;
      const ctrl = T.G && T.G.ctrl ? T.G.ctrl[0] : -1;
      M.palla.push([M.f, +b.vx, +b.vy, b.owner|0, ctrl|0, T.state]);
    }catch(e){}
    M.f++;
    requestAnimationFrame(tic);
  }
  requestAnimationFrame(tic);
  addEventListener('touchstart', e=>{ const t=e.changedTouches[0]; M.tocchi.push(['giu', M.f, t.clientX, t.clientY]); }, {capture:true});
  addEventListener('touchend',   e=>{ M.tocchi.push(['su', M.f, -1, -1]); }, {capture:true});
  return 'ok';
})()`.replace("'gia\"", "'gia'");

(async () => {
  const { chromium } = require(path.join(RADICE, 'node_modules', 'playwright'));

  /* --- il server: file: non basta (e il service worker va tolto) --- */
  const srv = http.createServer((req, res) => {
    const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
    if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => srv.listen(PORTA, '127.0.0.1', r));

  const br = await chromium.launch({ headless: !bandiera('mostra') });
  /* schermo del OnePlus 6 in orizzontale: 2280x1080 fisici, dpr 2 */
  const ctx = await br.newContext({ viewport: { width: 810, height: 384 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  const errori = [];
  pg.on('pageerror', e => errori.push(String(e.message).slice(0, 120)));

  console.log('=== TEMPI-CALCETTO — dal dito al pallone ===\n');
  console.log(`nel motore (Chromium), NON sul telefono: adb vede il OnePlus 6 "unauthorized".`);
  console.log(`${SEC} s · ${TAGLIA} contro ${TAGLIA} · tela 1620x768 come sul telefono (810x384 css @dpr2)\n`);

  await pg.goto(`http://127.0.0.1:${PORTA}/CALCETTO-il-gioco.html`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  /* la trappola gia' pagata due volte: il service worker serve la copia vecchia */
  await pg.evaluate(async () => {
    if (navigator.serviceWorker) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
    if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
  });
  for (let i = 0; i < 100 && !(await pg.evaluate('!!window.__test')); i++) await pausa(200);
  if (!(await pg.evaluate('!!window.__test'))) { console.error('window.__test non e\' comparso'); process.exit(2); }

  await pg.evaluate(`window.__test.dismissSplash&&window.__test.dismissSplash();window.__test.startMatch(1,1,{size:${TAGLIA}});1`);
  await pausa(2000);
  const reg = await pg.evaluate(REGISTRA);
  if (reg !== 'ok') { console.error('il registratore non si e\' installato'); process.exit(2); }

  /* la levetta e' FLOTTANTE: non esiste finche' un pollice non si posa,
     percio' non compare in comandiTouch. Si sceglie la casa come fa
     giocatore.js, e si dichiara. I pulsanti invece il gioco li espone. */
  const [VWpg, VHpg] = await pg.evaluate('[innerWidth, innerHeight]');
  const stick = { x: VWpg * 0.18, y: VHpg * 0.66, r: 44 };
  const bt = await pg.evaluate('window.__test.pulsanti(0)');
  const tira = bt.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, bt[0]);
  const filtra = bt.find(b => b !== tira) || tira;
  if (!tira) { console.error('non trovo i pulsanti'); process.exit(2); }
  console.log(`levetta scelta (${stick.x.toFixed(0)},${stick.y.toFixed(0)}) r${stick.r.toFixed(0)} · TIRA (${tira.x.toFixed(0)},${tira.y.toFixed(0)}) r${tira.r} · FILTRANTE (${filtra.x.toFixed(0)},${filtra.y.toFixed(0)}) r${filtra.r}\n`);

  /* --- i due pollici, per protocollo di debug --- */
  const dita = new Map();
  async function tocco(tipo, id, x, y) {
    if (tipo === 'giu') dita.set(id, { x, y, id }); else if (tipo === 'su') dita.delete(id); else if (dita.has(id)) Object.assign(dita.get(id), { x, y });
    const punti = [...dita.values()].map(d => ({ x: d.x, y: d.y, id: d.id, radiusX: 12, radiusY: 12, force: 1 }));
    const t = tipo === 'giu' ? 'touchStart' : tipo === 'su' ? (punti.length ? 'touchEnd' : 'touchEnd') : 'touchMove';
    if (tipo === 'su') {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }).catch(() => { });
      for (const d of dita.values()) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.x, y: d.y, id: d.id, radiusX: 12, radiusY: 12, force: 1 }] }).catch(() => { });
      return;
    }
    await cdp.send('Input.dispatchTouchEvent', { type: t, touchPoints: punti }).catch(() => { });
  }

  /* =====================================================================
     IL BANCO. In partita libera il pallone e' del giocatore comandato per
     una frazione del tempo: in due minuti sono venuti fuori undici
     passaggi, che non fanno una distribuzione. Il banco non falsifica la
     misura, prepara la situazione: POSA il pallone ai piedi del giocatore
     comandato e lascia che sia il GIOCO a decidere il possesso; poi
     preme. Il numero misurato resta lo stesso — fotogrammi fra il dito e
     il pallone che parte — su cinquanta prove invece che su undici.
     ===================================================================== */
  const POSA = `(()=>{const t=window.__test,G=t.G;const i=G&&G.ctrl?G.ctrl[0]:-1;if(i<0)return -1;
    const p=t.players[i],b=t.ball;const fx=p.fx||1,fy=p.fy||0,l=Math.hypot(fx,fy)||1;
    b.x=p.x+fx/l*9; b.y=p.y+fy/l*9; b.vx=0;b.vy=0;b.z=0;b.vz=0; return window.__mis.f;})()`;
  if (bandiera('banco')) {
    const tBanco = Date.now();
    const PROVE = +arg('prove', 50);
    console.log(`--- BANCO: ${PROVE} prove per gesto, pallone posato ai piedi ---\n`);
    await tocco('giu', 1, stick.x, stick.y);
    await tocco('muovi', 1, stick.x + stick.r, stick.y);
    const bancoPass = [], bancoTiro = [];
    for (let k = 0; k < PROVE * 2; k++) {
      const tiro = k % 2 === 1;
      await pg.evaluate(POSA); await pausa(180);
      const S = await pg.evaluate(`(()=>{const t=window.__test,G=t.G,b=t.ball;const i=G&&G.ctrl?G.ctrl[0]:-1;
        return {st:t.state,own:b.owner,i,f:window.__mis.f};})()`);
      if (S.st !== 'play' || S.own !== S.i || S.i < 0) { await pausa(120); continue; }
      if (tiro) {
        await tocco('giu', 2, tira.x, tira.y);
        await pausa(620);                       // dentro la finestra dolce SHOT_MIN..SHOT_MAX
        const f = await pg.evaluate('window.__mis.f'); await tocco('su', 2); bancoTiro.push(f);
      } else {
        const f = await pg.evaluate('window.__mis.f');
        await tocco('giu', 2, filtra.x, filtra.y); bancoPass.push(f);
        await pausa(90); await tocco('su', 2);
      }
      await pausa(220);
    }
    await tocco('su', 2); await tocco('su', 1);
    await pausa(300);
    const M = await pg.evaluate('({palla:window.__mis.palla, tocchi:window.__mis.tocchi, f:window.__mis.f})');
    await br.close(); srv.close();
    return rapporto(M, bancoPass, bancoTiro, 'banco', (Date.now() - tBanco) / 1000, filtra, tira, errori);
  }

  /* --- la partita: il sinistro tiene, il destro batte ---
     I DUE PULSANTI NON SI COMPORTANO ALLO STESSO MODO, e il gioco lo dice
     nel suo codice: 'through' (FILTRANTE) esegue doFiltrante SULLA
     PRESSIONE; 'shot' (TIRA) apre startCharge sulla pressione e calcia su
     releaseCharge, cioe' AL RILASCIO. Percio' il ritardo del passaggio si
     conta dal dito che scende, quello del tiro dal dito che sale.
     Mescolarli darebbe una mediana che non descrive nessuno dei due. */
  const t0 = Date.now();
  await tocco('giu', 1, stick.x, stick.y);
  let destroLibero = 0, tenuta = 0, alterna = 0;
  const rilasci = [];
  while ((Date.now() - t0) / 1000 < SEC) {
    const S = await pg.evaluate(`(()=>{const t=window.__test,b=t.ball,G=t.G;const i=G&&G.ctrl?G.ctrl[0]:-1;const me=i>=0?t.players[i]:null;
      return {st:t.state,bx:b.x,by:b.y,own:b.owner,i,mx:me?me.x:0,my:me?me.y:0,FW:t.campo.FW,FH:t.campo.FH,f:window.__mis.f};})()`);
    const ora = Date.now();
    if (!S || S.i < 0) { await pausa(30); continue; }
    if (S.st !== 'play' && S.st !== 'kickoff') { if (tenuta) { await tocco('su', 2); tenuta = 0; } await tocco('giu', 2, VWpg * 0.5, VHpg * 0.35); await pausa(40); await tocco('su', 2); await pausa(150); continue; }
    const mio = S.own === S.i;
    const dx = (mio ? S.FW : S.bx) - S.mx, dy = (mio ? S.FH / 2 : S.by) - S.my;
    const L = Math.hypot(dx, dy) || 1;
    await tocco('muovi', 1, stick.x + dx / L * (stick.r * 1.1), stick.y + dy / L * (stick.r * 1.1));
    if (tenuta && ora >= tenuta) { const f = await pg.evaluate('window.__mis.f'); await tocco('su', 2); rilasci.push(f); tenuta = 0; destroLibero = ora + 260; }
    else if (!tenuta && ora >= destroLibero) {
      if (mio) {
        /* col pallone: tre passaggi ogni tiro, cosi' i campioni del
           passaggio (che e' la misura pulita) sono tanti */
        if ((alterna++ % 4) === 3) { await tocco('giu', 2, tira.x, tira.y); tenuta = ora + 300; }
        else { await tocco('giu', 2, filtra.x, filtra.y); await pausa(30); await tocco('su', 2); destroLibero = ora + 340; }
      } else {
        /* senza pallone il grande e' CONTRASTA e il piccolo e' CAMBIO */
        const q = Math.hypot(S.bx - S.mx, S.by - S.my) < 60 ? tira : filtra;
        await tocco('giu', 2, q.x, q.y); await pausa(30); await tocco('su', 2); destroLibero = ora + 420;
      }
    }
    await pausa(12);
  }
  if (tenuta) await tocco('su', 2);
  await tocco('su', 1);
  await pausa(300);

  const M = await pg.evaluate('({palla:window.__mis.palla, tocchi:window.__mis.tocchi, f:window.__mis.f})');
  await br.close(); srv.close();
  return rapporto(M, null, rilasci, 'partita', SEC, filtra, tira, errori);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });

/* =====================================================================
   IL RAPPORTO — uno solo per i due modi, cosi' non divergono.
   ===================================================================== */
function rapporto(M, passForzati, rilasci, modo, durata, filtra, tira, errori) {
  /* --- la misura --- */
  const P = M.palla, NF = P.length;
  const vel = new Float64Array(NF);
  for (let k = 0; k < NF; k++) vel[k] = Math.hypot(P[k][1], P[k][2]);
  const salto = new Float64Array(NF);
  for (let k = 1; k < NF; k++) salto[k] = Math.abs(vel[k] - vel[k - 1]);
  const tuttiSalti = Array.from(salto).filter(v => v > 0);
  const FPS = NF / durata;
  console.log(`
--- IL MOTORE (modo: ${modo}) ---`);
  console.log(`  fotogrammi registrati ${NF} in ${durata.toFixed(0)} s = ${FPS.toFixed(1)} al secondo`);
  console.log(`  salto di velocita' del pallone fra fotogrammi: mediana ${mediana(tuttiSalti).toFixed(1)}, p95 ${pct(tuttiSalti, .95).toFixed(1)}, p999 ${pct(tuttiSalti, .999).toFixed(1)}, max ${Math.max(...tuttiSalti).toFixed(1)}`);
  console.log(`  soglia dichiarata per "calcio": ${SOGLIA_CALCIO}`);

  const giu = M.tocchi.filter(t => t[0] === 'giu');
  const suFiltra = giu.filter(t => Math.hypot(t[2] - filtra.x, t[3] - filtra.y) <= filtra.r + 6);
  const mioAl = n => { const r = P[Math.min(NF - 1, Math.max(0, n))]; return r && r[3] >= 0 && r[3] === r[4]; };
  /* PASSAGGIO: si conta dal dito che SCENDE (doFiltrante e' sulla pressione) */
  const passaggi = suFiltra.filter(t => mioAl(t[1])).map(t => t[1]);
  /* TIRO: si conta dal dito che SALE (releaseCharge e' sul rilascio) */
  const tiri = rilasci.filter(f => mioAl(f - 1));
  console.log(`\n--- I TOCCHI ---`);
  console.log(`  tocchi totali ${giu.length}`);
  console.log(`  PASSAGGI (pressione su FILTRANTE col pallone gia' mio)  ${passaggi.length}`);
  console.log(`  TIRI     (rilascio di TIRA col pallone gia' mio)        ${tiri.length}`);

  /* il contatto: il pallone LASCIA il piede. Non e' un salto di velocita'
     scelto a occhio: e' il cambio di proprietario, che il gioco dichiara. */
  function ritardi(istanti, sfasa) {
    const out = [];
    for (const n0 of istanti) {
      const n = n0 + sfasa;
      if (n < 1 || n >= NF) continue;
      const mio = P[n] && P[n][3];
      for (let k = n; k < Math.min(NF, n + FINESTRA); k++) if (P[k][3] !== mio && salto[k] >= SOGLIA_CALCIO) { out.push(k - n); break; }
    }
    return out;
  }
  console.log(`\n--- DAL DITO AL PALLONE CHE LASCIA IL PIEDE ---`);
  console.log(`  (contatto = il pallone cambia proprietario E la sua velocita' salta di >= ${SOGLIA_CALCIO})`);
  const esiti = {};
  /* LA STATISTICA GIUSTA E' LA STRETTEZZA, non il conteggio. Sul banco si
     calcia una volta al secondo: una finestra di venti fotogrammi pescata
     a caso trova un calcio sei volte su dieci, quindi contare quante volte
     trova qualcosa non distingue niente. Cio' che un legame vero produce e'
     una distribuzione STRETTA: se il ritardo e' davvero causato dal dito,
     i valori si ammucchiano; se e' un incontro casuale, si spalmano sulla
     finestra. Si misura la quota di ritardi entro un fotogramma dalla
     mediana, vero contro sfasati. */
  const concentr = R => { if (!R.length) return 0; const m = mediana(R); return R.filter(v => Math.abs(v - m) <= 1).length / R.length; };
  for (const [nome, ist] of [['passaggio', passaggi], ['tiro', tiri]]) {
    const R = ritardi(ist, 0);
    const nulli = SFASAMENTI.map(s => ritardi(ist, s));
    const cV = concentr(R), cN = nulli.map(concentr);
    const mC = cN.reduce((a, b) => a + b, 0) / cN.length;
    const sdC = Math.sqrt(cN.reduce((a, b) => a + (b - mC) ** 2, 0) / cN.length) || 0.001;
    const z = (cV - mC) / sdC;
    console.log(`  ${nome.toUpperCase()}: seguiti dal pallone che parte entro ${FINESTRA} fr: ${R.length}/${ist.length}` + (ist.length ? ` (${(R.length / ist.length * 100).toFixed(0)}%)` : ''));
    console.log(`    prova in bianco (istanti spostati di ${SFASAMENTI.join(', ')} fotogrammi):`);
    console.log(`    quota entro 1 fotogramma dalla mediana — vero ${(cV * 100).toFixed(0)}%   sfasati ${cN.map(c => (c * 100).toFixed(0) + '%').join(' ')}   media ${(mC * 100).toFixed(0)}%   z = ${z.toFixed(1)}`);
    if (R.length >= 8 && z >= 3) {
      const h = {}; for (const r of R) h[r] = (h[r] || 0) + 1;
      console.log(`    RITARDO mediana ${mediana(R)} fotogrammi  ·  p05 ${pct(R, .05)}  ·  p95 ${pct(R, .95)}  ·  n=${R.length}`);
        console.log(`    a ${FPS.toFixed(1)} fotogrammi al secondo sono ${(mediana(R) / FPS * 1000).toFixed(0)} ms (mediana) e ${(pct(R, .95) / FPS * 1000).toFixed(0)} ms (p95)`);
      console.log('    distribuzione: ' + Object.keys(h).sort((a, b) => a - b).map(k => k + ':' + h[k]).join(' '));
      esiti[nome] = { n: R.length, mediana: mediana(R), p05: pct(R, .05), p95: pct(R, .95), concentrazione: +cV.toFixed(2), z: +z.toFixed(1), ritardi: R };
    } else {
      console.log('    NON pubblico una mediana: o i casi sono troppo pochi, o non battono la prova in bianco.');
      esiti[nome] = { n: R.length, z: +z.toFixed(1), pubblicato: false };
    }
  }
  if (errori.length) console.log('\n  errori dalla pagina: ' + [...new Set(errori)].slice(0, 3).join(' | '));
  const dest = path.join(RADICE, 'fuori', '_tempi-calcetto-' + modo + '.json');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify({ modo, NF, sec: +durata.toFixed(1), fps: +FPS.toFixed(1), tocchi: M.tocchi.length, passaggi: passaggi.length, tiri: tiri.length, esiti }, null, 1));
  console.log('\ndati in ' + dest);
  console.log('\nNON misurato: la catena del telefono (tocco->WebView->pannello). Il telefono e\' collegato');
  console.log('ma adb lo vede "unauthorized": serve accettare l\'autorizzazione USB sullo schermo.');
}
