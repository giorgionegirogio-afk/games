/* =====================================================================
   _p-indietro.js — IL TASTO INDIETRO VERO, CON UN POLLICE CHE SI MUOVE.

   PERCHE' ESISTE, dopo due sonde fallite. La domanda e' semplice: dopo
   aver premuto il tasto Indietro di Android — il piu' premuto di un
   telefono — il pollice appoggiato torna a comandare il giocatore?

   La prima sonda (`_p-pausa-dito.js`) posava il dito, lo trascinava una
   volta e poi LO TENEVA FERMO leggendo lo stato. Non ha mai funzionato:
   la levetta risultava attiva con spostamento zero, e falliva anche il
   braccio di CONTROLLO — il segno inequivocabile che il difetto era del
   banco e non del gioco. Il motivo e' che un dito che si posa e si sposta
   una volta sola, con pause di centinaia di millisecondi, non e' quello
   che il sistema di ingresso si aspetta: gli eventi si fondono e la
   levetta nasce dove il dito e' arrivato, cioe' con scostamento nullo.

   Questo file misura come si muove una mano vera, ed e' la stessa cosa
   che fa `strumenti/giocatore.js` quando gioca una partita intera senza
   problemi: IL POLLICE NON SI FERMA MAI. Descrive un piccolo cerchio
   attorno alla casa della levetta, venti volte al secondo, per tutta la
   prova. E la domanda non si legge piu' da `humanMove` in un istante, ma
   da QUANTA STRADA HA PERCORSO IL GIOCATORE in una finestra di tempo:
   e' la cosa che un essere umano vedrebbe guardando lo schermo.

     1. il pollice comincia a girare: si misura la strada in 1,5 s;
     2. INDIETRO -> pausa;
     3. INDIETRO -> riprende, e il pollice NON si e' mai alzato;
     4. si misura la strada nei 1,5 s successivi.
   Se la seconda e' vicina alla prima, il gesto e' sopravvissuto.

   IL CONTROLLO: la stessa cosa senza premere niente. Se anche li' la
   strada crolla, il crollo non c'entra col tasto Indietro.

   uso:  node strumenti/_p-indietro.js
         node strumenti/_p-indietro.js --giri 4
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Vetro } = require('./_vetro.js');

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
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0, morto = false; const att = new Map();
    const sc = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onclose = () => { morto = true; for (const [, r] of att) r({}); att.clear(); };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        manda(m, p = {}) { if (morto) return Promise.resolve({}); const id = ++n; ws.send(JSON.stringify({ id, method: m, params: p })); return new Promise(r => { att.set(id, r); setTimeout(() => { if (att.has(id)) { att.delete(id); r({}); } }, 30000); }); },
        async js(e) { const r = await this.manda('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

(async () => {
  const GIRI = +arg('giri', 3);
  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const disp = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 })
    .split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato: mi fermo invece di stimare.'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  if (!fs.existsSync(TARA)) { console.error('manca la taratura: esegui prima  node strumenti/pollici.js'); process.exit(2); }
  const T = JSON.parse(fs.readFileSync(TARA, 'utf8'));
  const versoPannello = (cx, cy) => ({ px: T.indietro.a * cx + T.indietro.b * cy + T.indietro.c, py: T.indietro.d * cx + T.indietro.e * cy + T.indietro.f });

  console.log('=== IL TASTO INDIETRO VERO, CON UN POLLICE CHE SI MUOVE ===\n');
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
  await c.js(`(()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();
    try{ if(t.Tut&&t.Tut.active&&t.Tut.finish) t.Tut.finish(true); }catch(e){}
    t.startMatch(1,1,{size:5}); return 1;})()`);
  for (let i = 0; i < 60; i++) { if (await c.js('window.__test.state') === 'play') break; await pausa(300); }
  await pausa(900);

  const VW = await c.js('innerWidth'), VH = await c.js('innerHeight');
  const CASA = { x: VW * 0.18, y: VH * 0.66 };
  const R = 40;                       // raggio del cerchio: oltre STICK_FULL
  const stato = () => c.js(`(()=>{const t=window.__test,G=t.G;
    const p=G.ctrl[0]>=0?t.players[G.ctrl[0]]:null;
    const s=(typeof Touch5!=='undefined'&&Touch5.stick)?Touch5.stick[0]:null;
    return JSON.stringify({x:p?+p.x.toFixed(1):null,y:p?+p.y.toFixed(1):null,
      attivo:s?!!s.active:null,pausa:!!t.paused,scena:t.state});})()`);

  const vetro = new Vetro(adb, dev);
  await pausa(400);

  /* il pollice gira, e non si ferma: e' il moto di una mano vera */
  let ang = 0, giraAcceso = false;
  const gira = async (ms) => {
    const fine = Date.now() + ms;
    while (Date.now() < fine) {
      ang += 0.55;
      const p = versoPannello(CASA.x + Math.cos(ang) * R, CASA.y + Math.sin(ang) * R * 0.6);
      vetro.muovi(0, p.px, p.py);
      await pausa(50);
    }
  };
  const strada = async (ms) => {
    const a = JSON.parse(await stato());
    await gira(ms);
    const b = JSON.parse(await stato());
    if (a.x == null || b.x == null) return { d: -1, a, b };
    return { d: Math.hypot(b.x - a.x, b.y - a.y), a, b };
  };

  const RIS = { pausa: [], controllo: [] };
  for (const conIndietro of [false, true]) {
    console.log('--- ' + (conIndietro ? 'CON IL TASTO INDIETRO (pausa e ripresa, pollice sempre giu\')' : 'CONTROLLO (nessun tasto)') + ' ---');
    for (let g = 0; g < GIRI; g++) {
      const p0 = versoPannello(CASA.x + R, CASA.y);
      vetro.giu(0, p0.px, p0.py);
      await pausa(150);
      const prima = await strada(1500);
      if (conIndietro) {
        sh('shell', 'input', 'keyevent', '4'); await pausa(1000);
        const dentro = JSON.parse(await stato());
        sh('shell', 'input', 'keyevent', '4'); await pausa(1000);
        var inPausa = dentro.pausa;
      } else { await pausa(2000); var inPausa = null; }
      const dopo = await strada(1500);
      vetro.su(0);
      await pausa(400);
      (conIndietro ? RIS.pausa : RIS.controllo).push({ prima: prima.d, dopo: dopo.d, attivo: dopo.b.attivo, scena: dopo.b.scena, inPausa });
      console.log(`  giro ${g + 1}   strada PRIMA ${prima.d.toFixed(0)} u   ->   DOPO ${dopo.d.toFixed(0)} u` +
        (conIndietro ? `   (in pausa: ${inPausa})` : '') +
        `   levetta attiva ${dopo.b.attivo}   scena ${dopo.b.scena}` +
        `   -> ${dopo.d > prima.d * 0.4 ? 'SOPRAVVIVE' : 'MUORE'}`);
    }
    console.log('');
  }
  vetro.chiudi();

  const med = a => { const o = [...a].sort((x, y) => x - y); return o.length ? o[(o.length - 1) >> 1] : 0; };
  const quota = r => r.filter(x => x.dopo > x.prima * 0.4).length;
  console.log('--- VERDETTO ---');
  let male = 0;
  const dimmi = (ok, t, e) => { if (!ok) male++; console.log((ok ? '  OK   ' : '  NO   ') + t + (e ? '\n         ' + e : '')); };
  dimmi(quota(RIS.controllo) === RIS.controllo.length,
    `il controllo tiene: ${quota(RIS.controllo)}/${RIS.controllo.length}  (strada mediana prima ${med(RIS.controllo.map(x => x.prima)).toFixed(0)} u, dopo ${med(RIS.controllo.map(x => x.dopo)).toFixed(0)} u)`,
    quota(RIS.controllo) < RIS.controllo.length ? 'se il controllo non tiene, la colpa non e\' del tasto Indietro e questa misura non dice niente' : '');
  dimmi(quota(RIS.pausa) === RIS.pausa.length,
    `dopo il tasto INDIETRO il pollice comanda ancora: ${quota(RIS.pausa)}/${RIS.pausa.length}  (strada mediana prima ${med(RIS.pausa.map(x => x.prima)).toFixed(0)} u, dopo ${med(RIS.pausa.map(x => x.dopo)).toFixed(0)} u)`,
    quota(RIS.pausa) < RIS.pausa.length ? 'il gesto primario muore dopo il tasto piu\' premuto del telefono' : '');
  console.log('\n  La soglia e\' «la strada dopo vale almeno il 40% della strada prima»: e\' larga');
  console.log('  di proposito, perche\' il giocatore nel frattempo puo\' incontrare un avversario o');
  console.log('  un bordo. Serve a distinguere «cammina» da «e\' fermo», non a misurare la velocita\'.');
  c.chiudi();
  if (male) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
