/* =====================================================================
   _lac-vetro — QUANTO SCHERMO MANGIANO I COMANDI, sul telefono vero.

   Il gioco DICHIARA i propri riquadri d'interfaccia in
   window.__test.comandiTouch (tipo, rettangolo, motivo). Qui si sommano
   le aree, sul dispositivo, alla geometria vera del pannello — non a
   quella del banco, che e' un'altra forma.

   Si misura anche quanto spesso un riquadro di comando COPRE il
   protagonista o la bocca della porta, leggendo i rettangoli che il
   gioco espone (__test.copertura), fotogramma per fotogramma.

   uso: node strumenti/_lac-vetro.js [--sec 30] [--taglia 5]
   ===================================================================== */
const path = require('path');
const { execFileSync } = require('child_process');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const pausa = ms => new Promise(r => setTimeout(r, ms));
function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) { try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { } }
  return null;
}
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0; const attesa = new Map();
    const sc = setTimeout(() => no(new Error('muta')), 20000);
    ws.onerror = () => { clearTimeout(sc); no(new Error('rifiutato')); };
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
    ws.onopen = () => { clearTimeout(sc); ok({ manda(me, p = {}, q = 180000) { const id = ++n; ws.send(JSON.stringify({ id, method: me, params: p })); return new Promise(r => { attesa.set(id, r); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); r({ scaduto: true }); } }, q); }); }, chiudi() { try { ws.close(); } catch (e) { } } }); };
  });
}
(async () => {
  const SEC = +arg('sec', 30), TAGLIA = +arg('taglia', 5);
  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const dev = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0])[0];
  if (!dev) { console.error('nessun telefono'); process.exit(2); }
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(3500);
  const pid = sh('shell', 'pidof', PACCHETTO).trim().split(/\s+/)[0];
  const tutte = [...sh('shell', 'cat', '/proc/net/unix').matchAll(/@(webview_devtools_remote\S*)/g)].map(m => m[1]);
  const presa = tutte.find(s => s.endsWith('_' + pid));
  if (!presa) { console.error('socket del gioco assente'); process.exit(2); }
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9222', 'localabstract:' + presa);
  let filo = null;
  for (let i = 0; i < 25 && !filo; i++) {
    try { const l = await (await fetch('http://127.0.0.1:9222/json/list')).json(); const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl && !/doubleclick|googleads/.test(t.url || '')); if (p) filo = await apriFilo(p.webSocketDebuggerUrl).catch(() => null); } catch (e) { }
    if (!filo) await pausa(500);
  }
  if (!filo) { console.error('nessun filo'); process.exit(2); }
  const val = async src => { const r = await filo.manda('Runtime.evaluate', { expression: src, awaitPromise: true, returnByValue: true }); if (r && r.result && r.result.exceptionDetails) return { errore: JSON.stringify(r.result.exceptionDetails).slice(0, 400) }; return r && r.result && r.result.result ? r.result.result.value : null; };
  for (let i = 0; i < 200; i++) { if (await val('typeof window.__test') === 'object') break; await pausa(100); }

  const out = await val(`(async () => {
    const t = window.__test;
    try { t.dismissSplash && t.dismissSplash(); } catch(e){}
    t.startMatch(1, 1, {size: ${TAGLIA}});
    for (let i=0;i<400;i++){ await new Promise(r=>requestAnimationFrame(r)); if ((t.state==='play'||t.state==='kickoff')&&t.ball) break; }
    for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r));
    const W = innerWidth, H = innerHeight, A = W*H;
    const acc = {}; let nf = 0, coperti = 0, campioni = 0;
    const perTipo = {};
    const fine = performance.now() + ${SEC}*1000;
    let areaMax = 0, areaSom = 0;
    while (performance.now() < fine) {
      await new Promise(r=>requestAnimationFrame(r));
      /* zoneInterfaccia() e' la DICHIARAZIONE del gioco: ogni riquadro
         d'interfaccia col suo tipo e la sua alfa. I segni di guida
         (linea di mira, tacca sulla porta) nascono attaccati al
         soggetto e non sono pannelli: si escludono, come fa
         copertura() per la stessa ragione. */
      const z = (t.zoneInterfaccia ? t.zoneInterfaccia() : (t.comandiTouch||[])).filter(r => !(r.tipo && r.tipo.lastIndexOf('guida-',0)===0));
      let a = 0;
      for (const r of z) {
        const w = Math.max(0, Math.min(W, r.x1) - Math.max(0, r.x0));
        const h = Math.max(0, Math.min(H, r.y1) - Math.max(0, r.y0));
        const q = (r.r>0 ? Math.PI*r.r*r.r : w*h); a += q;
        perTipo[r.tipo] = perTipo[r.tipo] || {n:0, a:0};
        perTipo[r.tipo].n++; perTipo[r.tipo].a += q;
      }
      areaSom += a; if (a > areaMax) areaMax = a;
      nf++;
      /* copertura: un soggetto chiave dentro un riquadro di comando */
      try {
        const c = t.copertura ? t.copertura() : null;
        if (c) { campioni++; if (c.length) coperti++; }
      } catch(e){}
    }
    for (const k in perTipo) perTipo[k].mediaPct = perTipo[k].a / perTipo[k].n / A * 100;
    return JSON.stringify({ W, H, dpr: devicePixelRatio, nf,
      mediaPct: areaSom/nf/A*100, maxPct: areaMax/A*100, perTipo,
      campioni, coperti, scena: t.state });
  })()`);
  filo.chiudi();
  if (!out || out.errore) { console.error('sonda fallita: ' + (out && out.errore)); process.exit(2); }
  const o = JSON.parse(out);
  console.log(`=== QUANTO SCHERMO MANGIANO I COMANDI — ${TAGLIA} contro ${TAGLIA}, ${SEC} s sul telefono ===\n`);
  console.log(`viewport ${o.W}x${o.H} CSS (dpr ${o.dpr}) · ${o.nf} fotogrammi · scena ${o.scena}`);
  console.log(`\nAREA DEI RIQUADRI DI COMANDO, in percentuale del quadro:`);
  console.log(`  media ${o.mediaPct.toFixed(1)}%   ·   picco ${o.maxPct.toFixed(1)}%`);
  console.log(`\nper tipo (quota media del quadro, e in quanti fotogrammi compare):`);
  for (const k in o.perTipo) console.log(`  ${k.padEnd(12)} ${o.perTipo[k].mediaPct.toFixed(2)}%   in ${o.perTipo[k].n} riquadri-fotogramma`);
  if (o.campioni) console.log(`\ncopertura di un soggetto chiave: ${o.coperti}/${o.campioni} fotogrammi (${(100*o.coperti/o.campioni).toFixed(1)}%)`);
})();
