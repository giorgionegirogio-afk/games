/* =====================================================================
   _lac-gfx — I FOTOGRAMMI IN RITARDO, MISURATI A REGIME E NON ALL'AVVIO.

   FCMOBILE-OSSERVATO.md riporta «Janky frames: 606 (87,95%)» su 689
   fotogrammi, e dichiara subito che la finestra comprendeva l'avvio e il
   primo caricamento — quindi il numero e' gonfiato e va rimisurato IN
   PARTITA. Questo strumento lo rimisura: entra in partita dalla WebView
   vera, aspetta che il gioco sia a regime, AZZERA i contatori di
   SurfaceFlinger/HWUI con `dumpsys gfxinfo <pkg> reset`, lascia correre
   N secondi di partita vera e rilegge.

   Che cosa NON puo' dire: niente su FC Mobile. Il suo motore disegna su
   una superficie propria e lo stesso comando la' dichiara «Total frames
   rendered: 0». I due numeri non si affiancano — questo strumento misura
   soltanto NOI, contro il tetto dei 16,67 ms del vsync.

   uso: node strumenti/_lac-gfx.js [--sec 40] [--taglia 5|7|11]
   ===================================================================== */
const path = require('path');
const { execFileSync } = require('child_process');

const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const pausa = ms => new Promise(r => setTimeout(r, ms));

function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME ||
    path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}

function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0; const attesa = new Map();
    const scaduto = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onerror = () => { clearTimeout(scaduto); no(new Error('websocket rifiutato')); };
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(scaduto);
      ok({
        manda(metodo, params = {}, quanto = 180000) {
          const id = ++n; ws.send(JSON.stringify({ id, method: metodo, params }));
          return new Promise(res => { attesa.set(id, res); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto); });
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

function leggiGfx(testo) {
  const num = re => { const m = testo.match(re); return m ? +m[1].replace(/,/g, '.') : null; };
  const out = {
    totali: num(/Total frames rendered:\s*(\d+)/),
    ritardo: num(/Janky frames:\s*(\d+)/),
    ritardoPct: num(/Janky frames:\s*\d+\s*\(([\d.,]+)%\)/),
    p50: num(/50th percentile:\s*(\d+)ms/),
    p90: num(/90th percentile:\s*(\d+)ms/),
    p95: num(/95th percentile:\s*(\d+)ms/),
    p99: num(/99th percentile:\s*(\d+)ms/),
    oltre16: num(/Number Missed Vsync:\s*(\d+)/),
    lentiUI: num(/Number Slow UI thread:\s*(\d+)/),
    lentiBitmap: num(/Number Slow bitmap uploads:\s*(\d+)/),
    lentiDraw: num(/Number Slow issue draw commands:\s*(\d+)/),
    saltiFrame: num(/Number Frame deadline missed:\s*(\d+)/),
  };
  const isto = [];
  const m = testo.match(/HISTOGRAM:\s*([^\n]+)/);
  if (m) for (const p of m[1].trim().split(/\s+/)) {
    const q = p.match(/(\d+)ms=(\d+)/); if (q) isto.push([+q[1], +q[2]]);
  }
  out.isto = isto;
  return out;
}

(async () => {
  const secondi = +arg('sec', 40);
  const taglia = +arg('taglia', 5);
  const adb = trovaAdb();
  if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });

  console.log(`=== FOTOGRAMMI IN RITARDO, A REGIME — ${taglia} contro ${taglia}, ${secondi} s ===\n`);
  console.log(`dispositivo ${sh('shell', 'getprop', 'ro.product.model').trim()} · Android ${sh('shell', 'getprop', 'ro.build.version.release').trim()}`);

  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(3000);
  /* IL SOCKET GIUSTO E' QUELLO DEL NOSTRO PID, e questa riga e' costata
     due corse a vuoto: sul telefono c'e' piu' di una WebView aperta (un
     SDK pubblicitario di un'altra app ne tiene una), /proc/net/unix le
     elenca tutte e la prima che capita non e' la nostra. Si legge il pid
     del pacchetto e si prende webview_devtools_remote_<pid>. */
  const pid = sh('shell', 'pidof', PACCHETTO).trim().split(/\s+/)[0];
  const unix = sh('shell', 'cat', '/proc/net/unix');
  const tutte = [...unix.matchAll(/@(webview_devtools_remote\S*)/g)].map(m => m[1]);
  const presa = tutte.find(s => s.endsWith('_' + pid)) || null;
  if (!presa) { console.error('la WebView del gioco (pid ' + pid + ') non espone il socket: viste ' + tutte.join(', ')); process.exit(2); }
  console.log(`socket      ${presa} (pid ${pid}); altre WebView sul telefono: ${tutte.filter(s => s !== presa).join(', ') || 'nessuna'}`);
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9222', 'localabstract:' + presa);

  let filo = null;
  for (let i = 0; i < 25 && !filo; i++) {
    try {
      const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
      const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) filo = await apriFilo(p.webSocketDebuggerUrl).catch(() => null);
    } catch (e) { }
    if (!filo) await pausa(500);
  }
  if (!filo) { console.error('nessun filo con la WebView'); process.exit(2); }

  const val = async src => {
    const r = await filo.manda('Runtime.evaluate', { expression: src, awaitPromise: true, returnByValue: true });
    return r && r.result && r.result.result ? r.result.result.value : null;
  };

  /* si entra in partita e si aspetta il regime: la cottura del manto NON
     e' il gioco, ed e' proprio la finestra che gonfiava il numero vecchio */
  const avvio = await val(`(async () => {
    for (let i=0;i<200 && !window.__test;i++) await new Promise(r=>setTimeout(r,100));
    const t = window.__test; if (!t) return 'niente __test dopo 20 s · url=' + location.href;
    try { t.dismissSplash && t.dismissSplash(); } catch(e){}
    t.startMatch(1, 1, {size: ${taglia}});
    for (let i=0;i<300;i++){ await new Promise(r=>requestAnimationFrame(r)); if ((t.state==='play'||t.state==='kickoff')&&t.ball) break; }
    for (let i=0;i<180;i++) await new Promise(r=>requestAnimationFrame(r));
    return t.state + ' / ' + (t.players||[]).length + ' uomini / dpr ' + window.devicePixelRatio +
           ' / tela ' + document.querySelector('canvas').width + 'x' + document.querySelector('canvas').height;
  })()`);
  console.log('stato       ' + avvio + '\n');

  /* azzeramento DOPO il regime: da qui in poi si conta solo la partita */
  sh('shell', 'dumpsys', 'gfxinfo', PACCHETTO, 'reset');
  const t0 = Date.now();
  await pausa(secondi * 1000);
  const dopo = sh('shell', 'dumpsys', 'gfxinfo', PACCHETTO);
  const durata = (Date.now() - t0) / 1000;
  const stato = await val(`window.__test.state + ' ' + JSON.stringify(window.__test.score)`);
  filo.chiudi();

  const g = leggiGfx(dopo);
  console.log(`finestra    ${durata.toFixed(1)} s di partita a regime, scena finale: ${stato}`);
  console.log(`fotogrammi  ${g.totali} disegnati (${(g.totali / durata).toFixed(1)}/s)`);
  console.log(`IN RITARDO  ${g.ritardo} (${g.ritardoPct}%)   <- il numero da confrontare con l'87,95% dell'avvio`);
  console.log(`percentili  50° ${g.p50} ms · 90° ${g.p90} ms · 95° ${g.p95} ms · 99° ${g.p99} ms`);
  console.log(`cause       vsync persi ${g.oltre16} · UI lenta ${g.lentiUI} · bitmap ${g.lentiBitmap} · comandi ${g.lentiDraw} · scadenza mancata ${g.saltiFrame}`);
  if (g.isto.length) {
    const tot = g.isto.reduce((a, b) => a + b[1], 0);
    let sopra = 0; for (const [ms, n] of g.isto) if (ms >= 17) sopra += n;
    console.log(`istogramma  ${tot} campioni, ${sopra} sopra i 16 ms (${(100 * sopra / tot).toFixed(1)}%)`);
    const peggio = g.isto.filter(x => x[1] > 0).slice(-6).map(x => x[0] + 'ms×' + x[1]).join(' ');
    console.log(`coda alta   ${peggio}`);
  }
  console.log('\nCosa questo strumento NON dice: nulla su FC Mobile (il suo motore');
  console.log('disegna su una superficie che HWUI non conta). Misura solo noi.');
})();
