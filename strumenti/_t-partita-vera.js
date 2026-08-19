/* =====================================================================
   _t-partita-vera.js — UNA PARTITA VERA, SUL TELEFONO VERO, CON I DUE
   DIFETTI CONTATI MENTRE SI GIOCA.

   E' strumenti/giocatore.js con la stessa regola di casa — non chiama MAI
   una funzione del gioco per agire, scrive sul dispositivo di ingresso del
   kernel come un dito — e due differenze dichiarate:

     1. IL POLLICE VA A FONDO CORSA. giocatore.js trascina a 44 px, e con
        44 px la levetta NON e' in sprint (STICK_SPRINT vale 66): quel
        pollice non poteva incontrare il difetto del pallonetto nemmeno
        volendo, e infatti non l'ha mai visto. Qui il raggio e' 80 px, che
        e' cio' che fa un pollice umano che spinge la levetta al bordo (lo
        stick "che segue" lo ferma a MAXR = 70).
     2. SI CONTA. Ogni lettura di stato confronta l'ETICHETTA dei pulsanti
        con la VERITA' sul pallone, e conta i pallonetti involontari.

   LE DUE MISURE
     etichetta sbagliata  la palla e' nostra (di un nostro uomo, oppure in
                          volo verso un nostro uomo: b.passTo) e il
                          pulsante grande dice CONTRASTA invece di TIRA.
                          Si conta in LETTURE, non in fotogrammi: si legge
                          a 20 Hz, e il numero e' una frazione di tempo.
     pallonetti           G.stats.pallonetti della nostra squadra. Ogni
                          pallonetto non chiesto e' un tiro perso.

   Non giudica: mette due numeri accanto a due versioni dello stesso gioco
   installate sullo stesso telefono nello stesso quarto d'ora.

   uso:  node strumenti/_t-partita-vera.js --sec 60 --etichetta PRIMA
         node strumenti/_t-partita-vera.js --raggio 44   (il pollice di giocatore.js)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const TARA = path.join(__dirname, 'pollici-taratura.json');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const pausa = ms => new Promise(r => setTimeout(r, ms));

function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}
const { Vetro } = require('./_vetro.js');

function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0, morto = false; const att = new Map();
    const sc = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onclose = () => { morto = true; for (const [, r] of att) r({ morto: true }); att.clear(); };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        manda(m, p = {}, q = 60000) { if (morto) return Promise.resolve({ morto: true }); const id = ++n; try { ws.send(JSON.stringify({ id, method: m, params: p })); } catch (e) { return Promise.resolve({ morto: true }); } return new Promise(r => { att.set(id, r); setTimeout(() => { if (att.has(id)) { att.delete(id); r({ scaduto: true }); } }, q); }); },
        async js(e) { const r = await this.manda('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

/* lo stato in una sola andata, con l'etichetta dei pulsanti e i contatori */
const LEGGI = `(()=>{const t=window.__test;if(!t||!t.G)return null;const G=t.G,v=t.view,b=t.ball,S=G.stats;
const me=G.ctrl&&G.ctrl[0]>=0?t.players[G.ctrl[0]]:null;
const bt=(t.pulsanti&&t.pulsanti(0))||[];
return JSON.stringify({
 stato:t.state, punti:t.score, resta:t.timeLeft,
 c:t.campo,
 b:{x:b.x,y:b.y,z:b.z,own:b.owner,passTo:b.passTo},
 io: me?{x:me.x,y:me.y,idx:me.idx}:null,
 g: t.players.map(p=>({t:p.team,i:p.idx,x:p.x,y:p.y,r:p.role,o:p.out|0})),
 s:{tiri:S.tiri[0],pall:S.pallonetti[0]|0,perf:S.perfetti[0]|0,filt:(S.filtranti&&S.filtranti[0])|0,cross:(S.cross&&S.cross[0])|0},
 btn: bt.map(x=>({act:x.act,r:x.r,x:x.x,y:x.y}))
});})()`;

(async () => {
  const SEC = +arg('sec', 60);
  const TAGLIA = +arg('taglia', 5);
  const RAGGIO = +arg('raggio', 80);
  const ETI = arg('etichetta', 'OGGI');

  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  if (!fs.existsSync(TARA)) { console.error('manca la taratura: node strumenti/pollici.js'); process.exit(2); }
  const T = JSON.parse(fs.readFileSync(TARA, 'utf8'));
  const versoPannello = (cx, cy) => ({ px: T.indietro.a * cx + T.indietro.b * cy + T.indietro.c, py: T.indietro.d * cx + T.indietro.e * cy + T.indietro.f });

  console.log(`\n=== PARTITA VERA — ${ETI} ===`);
  console.log(`dispositivo ${dev} · ${SEC} s · ${TAGLIA} contro ${TAGLIA} · pollice a ${RAGGIO} px (sprint sopra 66)`);

  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(2600);
  const u = sh('shell', 'cat', '/proc/net/unix');
  const presa = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
  if (!presa) { console.error('la WebView non espone il socket di debug'); process.exit(2); }
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9222', 'localabstract:' + presa);
  await pausa(600);
  const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const c = await apriFilo(l.find(t => t.type === 'page').webSocketDebuggerUrl);
  for (let i = 0; i < 50; i++) { if (await c.js('!!window.__test')) break; await pausa(300); }
  await c.js(`window.__test.dismissSplash&&window.__test.dismissSplash();window.__test.startMatch(1,1,{size:${TAGLIA}});1`);
  await pausa(2200);

  const vetro = new Vetro(adb, dev);
  await pausa(400);
  const S0 = JSON.parse(await c.js(LEGGI) || 'null');
  if (!S0) { console.error('non riesco a leggere lo stato'); process.exit(2); }
  const VW = await c.js('innerWidth'), VH = await c.js('innerHeight');
  const CASA = { x: VW * 0.18, y: VH * 0.66 };
  const btnGrande = S0.btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, S0.btn[0]);
  const btnPiccolo = S0.btn.find(b => b !== btnGrande) || btnGrande;

  const casaP = versoPannello(CASA.x, CASA.y);
  vetro.giu(0, casaP.px, casaP.py);
  await pausa(120);

  const K = { letture: 0, giocate: 0, nostra: 0, loro: 0, libera: 0, etichettaSi: 0,
    FN: 0, FPloro: 0, FPlibera: 0, cambiEtichetta: 0, tiri: 0, pallonetti: 0, filt: 0, cross: 0,
    golFatti: 0, golPresi: 0, errori: 0 };
  let ultimaEti = null, ultimoPunti = [...S0.punti], destroLibero = 0, tiroFinoA = 0, S = S0;
  const s0 = { ...S0.s };
  const t0 = Date.now();
  let ultimaLettura = 0;

  while ((Date.now() - t0) / 1000 < SEC) {
    const ora = Date.now();
    if (ora - ultimaLettura >= 50) {
      const raw = await c.js(LEGGI);
      ultimaLettura = ora;
      if (raw) { try { S = JSON.parse(raw); } catch (e) { K.errori++; } }
      if (!S || !S.io) { await pausa(60); continue; }
      K.letture++;
      if (S.punti[0] !== ultimoPunti[0]) K.golFatti += S.punti[0] - ultimoPunti[0];
      if (S.punti[1] !== ultimoPunti[1]) K.golPresi += S.punti[1] - ultimoPunti[1];
      ultimoPunti = [...S.punti];

      const PORTA = { x: S.c.FW, y: S.c.FH / 2 };
      const squadraDi = i => (i >= 0 && S.g[i]) ? S.g[i].t : -1;
      const to = squadraDi(S.b.own), tp = S.b.own < 0 ? squadraDi(S.b.passTo) : -1;
      const nostra = to === 0 || tp === 0, loro = to === 1 || tp === 1;
      const eti = (S.btn[0] || {}).act === 'shot';   // il grande dice TIRA?

      if (S.stato === 'play' || S.stato === 'kickoff') {
        K.giocate++;
        if (nostra) K.nostra++; else if (loro) K.loro++; else K.libera++;
        if (eti) K.etichettaSi++;
        if (!eti && nostra) K.FN++;
        if (eti && !nostra) { if (loro) K.FPloro++; else K.FPlibera++; }
        if (ultimaEti !== null && eti !== ultimaEti) K.cambiEtichetta++;
        ultimaEti = eti;
      }

      if (S.stato !== 'play' && S.stato !== 'kickoff') {
        const p = versoPannello(VW * 0.5, VH * 0.35); vetro.giu(1, p.px, p.py); await pausa(60); vetro.su(1);
        await pausa(180); continue;
      }

      /* ---------- pollice sinistro: a FONDO CORSA nella direzione voluta ---------- */
      const hoIo = S.b.own === S.io.idx;
      let dx, dy;
      if (hoIo) { dx = PORTA.x - S.io.x; dy = PORTA.y - S.io.y; }
      else if (nostra) { dx = PORTA.x - S.io.x; dy = (S.c.FH * (S.io.idx % 2 ? 0.28 : 0.72)) - S.io.y; }
      else { dx = S.b.x - S.io.x; dy = S.b.y - S.io.y; }
      const L = Math.hypot(dx, dy) || 1;
      const p = versoPannello(CASA.x + dx / L * RAGGIO, CASA.y + dy / L * RAGGIO);
      vetro.muovi(0, p.px, p.py);

      /* ---------- pollice destro ---------- */
      const dPorta = Math.hypot(PORTA.x - S.io.x, PORTA.y - S.io.y);
      if (tiroFinoA && ora >= tiroFinoA) { vetro.su(1); tiroFinoA = 0; destroLibero = ora + 260; }
      else if (!tiroFinoA && ora >= destroLibero) {
        if (hoIo && dPorta < 430) {
          const q = versoPannello(btnGrande.x, btnGrande.y);
          vetro.giu(1, q.px, q.py); tiroFinoA = ora + 620;
        } else if (hoIo) {
          const q = versoPannello(btnPiccolo.x, btnPiccolo.y);
          vetro.giu(1, q.px, q.py); await pausa(45); vetro.su(1); destroLibero = ora + 900;
        } else if (!nostra) {
          const dBall = Math.hypot(S.b.x - S.io.x, S.b.y - S.io.y);
          const q = versoPannello(dBall < 55 ? btnGrande.x : btnPiccolo.x, dBall < 55 ? btnGrande.y : btnPiccolo.y);
          vetro.giu(1, q.px, q.py); await pausa(45); vetro.su(1);
          destroLibero = ora + (dBall < 55 ? 700 : 1100);
        }
      }
    }
    await pausa(20);
  }
  vetro.su(1); vetro.su(0);
  await pausa(500);
  const fine = JSON.parse(await c.js(LEGGI) || 'null');
  vetro.chiudi();
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }

  const g = Math.max(1, K.giocate);
  const s1 = fine ? fine.s : s0;
  console.log(`\n  punteggio                 ${fine ? fine.punti.join(' - ') : '?'}`);
  console.log(`  letture di gioco          ${K.giocate} (${(K.giocate / SEC).toFixed(1)} al secondo)` + (K.errori ? `  letture perse ${K.errori}` : ''));
  console.log(`  la palla e' nostra        ${(K.nostra / g * 100).toFixed(1)}%   loro ${(K.loro / g * 100).toFixed(1)}%   di nessuno ${(K.libera / g * 100).toFixed(1)}%`);
  console.log(`  il pulsante dice TIRA     ${(K.etichettaSi / g * 100).toFixed(1)}%`);
  console.log(`  ETICHETTA SBAGLIATA (FN)  ${K.FN}  = ${(K.FN / g * 100).toFixed(1)}% del tempo giocato  (${(K.FN * 0.05).toFixed(1)} s su ${(g * 0.05).toFixed(0)})`);
  console.log(`  dice TIRA e l'ha l'avversario   ${K.FPloro}  (${(K.FPloro / g * 100).toFixed(1)}%)`);
  console.log(`  dice TIRA e la palla e' libera  ${K.FPlibera}  (${(K.FPlibera / g * 100).toFixed(1)}%)`);
  console.log(`  cambi di etichetta        ${K.cambiEtichetta}  (${(K.cambiEtichetta / SEC * 60).toFixed(0)} al minuto)`);
  console.log(`  tiri ${s1.tiri - s0.tiri}   di cui PALLONETTI ${s1.pall - s0.pall}   perfetti ${s1.perf - s0.perf}   filtranti ${s1.filt - s0.filt}   cross ${s1.cross - s0.cross}`);
  console.log(`  gol fatti ${K.golFatti}  subiti ${K.golPresi}`);
  console.log(`  riallineamenti del canale ${vetro.rotture}`);
  c.chiudi();
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
