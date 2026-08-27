/* =====================================================================
   _lac-sessione — LA SESSIONE LUNGA SUL TELEFONO VERO.

   COSA-MANCA.md par. 5.1 elenca fra i punti ciechi «la sessione lunga
   (memoria, degrado del fotogramma, ritorno dal secondo piano)» e «gli
   errori non catturati (unhandledrejection non e' ascoltato da nessuno
   strumento)». Qui si misurano tutti e tre, sul dispositivo, in una
   corsa sola:

     1. IL DEGRADO. Partite in fila senza mai chiudere l'app. Per ogni
        partita: lavoro per fotogramma (mediana e p95) misurato DENTRO
        la pagina avvolgendo window.frame, come telefono.js.
     2. LA MEMORIA. performance.memory (heap JS) e dumpsys meminfo (PSS
        del processo) letti alla stessa cadenza. Un heap che sale e non
        scende e' una perdita; un PSS che sale mentre l'heap sta fermo
        e' la tela o le tessiture.
     3. GLI ERRORI. window.onerror e unhandledrejection agganciati
        PRIMA della prima partita, piu' Log.entryAdded del protocollo:
        ogni eccezione che il gioco ingoia in silenzio finisce qui.
     4. IL TEMPO MORTO. Da startMatch() al primo fotogramma in cui la
        scena e' giocabile e il pallone esiste: quanto si aspetta fra
        «gioca» e «si gioca».

   uso: node strumenti/_lac-sessione.js [--partite 8] [--sec 25] [--taglia 5]
   ===================================================================== */
const path = require('path');
const { execFileSync } = require('child_process');

const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };
const quant = (a, q) => { const o = [...a].sort((x, y) => x - y); return o[Math.min(o.length - 1, Math.floor(o.length * q))]; };

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
    const ws = new WebSocket(url); let n = 0; const attesa = new Map(); const eventi = [];
    const scaduto = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onerror = () => { clearTimeout(scaduto); no(new Error('websocket rifiutato')); };
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); }
      else if (m.method) eventi.push(m);
    };
    ws.onopen = () => {
      clearTimeout(scaduto);
      ok({
        eventi,
        manda(metodo, params = {}, quanto = 180000) {
          const id = ++n; ws.send(JSON.stringify({ id, method: metodo, params }));
          return new Promise(res => { attesa.set(id, res); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto); });
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

(async () => {
  const NP = +arg('partite', 8), SEC = +arg('sec', 25), TAGLIA = +arg('taglia', 5);
  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  const pss = () => { const t = sh('shell', 'dumpsys', 'meminfo', PACCHETTO); const m = t.match(/TOTAL(?:\s+PSS)?:\s*(\d+)/); return m ? +m[1] : null; };
  const gradi = () => { const t = sh('shell', 'dumpsys', 'battery'); const m = t.match(/temperature:\s*(\d+)/); return m ? +m[1] / 10 : null; };

  console.log(`=== LA SESSIONE LUNGA — ${NP} partite da ${SEC} s a ${TAGLIA} contro ${TAGLIA}, senza mai chiudere l'app ===\n`);
  console.log(`dispositivo ${sh('shell', 'getprop', 'ro.product.model').trim()} · Android ${sh('shell', 'getprop', 'ro.build.version.release').trim()}`);

  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(3500);
  const pid = sh('shell', 'pidof', PACCHETTO).trim().split(/\s+/)[0];
  const unix = sh('shell', 'cat', '/proc/net/unix');
  const tutte = [...unix.matchAll(/@(webview_devtools_remote\S*)/g)].map(m => m[1]);
  const presa = tutte.find(s => s.endsWith('_' + pid));
  if (!presa) { console.error('socket del gioco non trovato (pid ' + pid + ')'); process.exit(2); }
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9222', 'localabstract:' + presa);

  let filo = null;
  for (let i = 0; i < 25 && !filo; i++) {
    try {
      const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
      const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl && !/doubleclick|googleads/.test(t.url || ''));
      if (p) filo = await apriFilo(p.webSocketDebuggerUrl).catch(() => null);
    } catch (e) { }
    if (!filo) await pausa(500);
  }
  if (!filo) { console.error('nessun filo con la WebView del gioco'); process.exit(2); }
  await filo.manda('Runtime.enable');
  await filo.manda('Log.enable');

  const val = async src => {
    const r = await filo.manda('Runtime.evaluate', { expression: src, awaitPromise: true, returnByValue: true });
    if (r && r.result && r.result.exceptionDetails) return { errore: JSON.stringify(r.result.exceptionDetails).slice(0, 300) };
    return r && r.result && r.result.result ? r.result.result.value : null;
  };

  /* le trappole degli errori PRIMA di qualunque partita */
  await val(`(() => {
    if (window.__lacErr) return 'gia';
    window.__lacErr = [];
    addEventListener('error', e => window.__lacErr.push('error: ' + (e.message||'') + ' @' + (e.filename||'') + ':' + (e.lineno||0)));
    addEventListener('unhandledrejection', e => window.__lacErr.push('rejection: ' + ((e.reason && (e.reason.message||e.reason)) || '?')));
    const oc = console.error;
    console.error = function(){ try { window.__lacErr.push('console.error: ' + Array.from(arguments).join(' ').slice(0,200)); } catch(x){} return oc.apply(this, arguments); };
    return 'ok';
  })()`);
  for (let i = 0; i < 200; i++) { const t = await val('typeof window.__test'); if (t === 'object') break; await pausa(100); }
  await val(`window.__test && window.__test.dismissSplash && window.__test.dismissSplash()`);

  const T0 = gradi();
  /* IL DETTAGLIO DELLA MEMORIA, non solo il totale: un PSS che sale
     mentre l'heap JS sta fermo va attribuito a una riga precisa. */
  const voci = t => {
    const o = {};
    for (const n of ['Native Heap', 'Graphics', 'GL mtrack', 'EGL mtrack', 'Gfx dev', 'Dalvik Heap', 'Unknown', 'TOTAL']) {
      const m = t.match(new RegExp('^\\s*' + n.replace(/ /g, '\\s+') + ':?\\s+(\\d+)', 'm'));
      if (m) o[n] = +m[1];
    }
    return o;
  };
  const MEM0 = voci(sh('shell', 'dumpsys', 'meminfo', PACCHETTO));
  const righe = [];
  for (let g = 1; g <= NP; g++) {
    const r = await val(`(async () => {
      const t = window.__test;
      const t0 = performance.now();
      t.startMatch(1, 1, {size: ${TAGLIA}});
      let vivo = -1;
      for (let i=0;i<600;i++){ await new Promise(r=>requestAnimationFrame(r)); if ((t.state==='play'||t.state==='kickoff') && t.ball) { vivo = performance.now() - t0; break; } }
      for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r));
      const lavoro = [];
      let rip = null;
      if (typeof window.frame === 'function') {
        const orig = window.frame;
        window.frame = function(){ const a = performance.now(); try { return orig.apply(this, arguments); } finally { lavoro.push(performance.now()-a); } };
        rip = () => { window.frame = orig; };
      }
      const fine = performance.now() + ${SEC}*1000;
      while (performance.now() < fine) await new Promise(r=>requestAnimationFrame(r));
      if (rip) rip();
      const m = performance.memory ? Math.round(performance.memory.usedJSHeapSize/1048576*10)/10 : null;
      return JSON.stringify({ vivo, lavoro, heap: m, scena: t.state, err: window.__lacErr.length });
    })()`);
    if (!r || r.errore) { console.log(`  partita ${g}: FALLITA ${r && r.errore}`); continue; }
    const o = JSON.parse(r);
    const lm = mediana(o.lavoro), l95 = quant(o.lavoro, 0.95);
    const P = pss();
    righe.push({ g, vivo: o.vivo, lm, l95, heap: o.heap, pss: P, err: o.err, n: o.lavoro.length });
    console.log(`  partita ${g}/${NP}  attesa GIOCA->pallone ${o.vivo.toFixed(0)} ms  ·  lavoro ${lm.toFixed(2)} ms (p95 ${l95.toFixed(2)})  ·  heap ${o.heap} MB  ·  PSS ${P} kB  ·  errori ${o.err}`);
  }
  const T1 = gradi();
  const MEM1 = voci(sh('shell', 'dumpsys', 'meminfo', PACCHETTO));
  console.log('\n--- DOVE VA LA MEMORIA (kB di PSS, per voce di dumpsys) ---');
  for (const k of Object.keys(MEM1)) console.log(`  ${k.padEnd(14)} ${String(MEM0[k] ?? '-').padStart(9)} -> ${String(MEM1[k]).padStart(9)}   (${MEM0[k] != null ? (MEM1[k] - MEM0[k] >= 0 ? '+' : '') + (MEM1[k] - MEM0[k]) : '?'})`);
  const err = await val('JSON.stringify(window.__lacErr.slice(0,25))');
  const log = filo.eventi.filter(e => e.method === 'Log.entryAdded' && e.params && e.params.entry && e.params.entry.level === 'error');
  filo.chiudi();

  console.log('\n--- IL DEGRADO ---');
  if (righe.length >= 2) {
    const a = righe[0], z = righe[righe.length - 1];
    const dl = (z.lm - a.lm) / a.lm * 100, dh = z.heap != null && a.heap != null ? z.heap - a.heap : null;
    const dp = z.pss != null && a.pss != null ? z.pss - a.pss : null;
    console.log(`  lavoro per fotogramma  prima ${a.lm.toFixed(2)} ms -> dopo ${z.lm.toFixed(2)} ms  (${dl >= 0 ? '+' : ''}${dl.toFixed(1)}%)`);
    console.log(`  heap JS                prima ${a.heap} MB -> dopo ${z.heap} MB  (${dh >= 0 ? '+' : ''}${dh} MB)`);
    console.log(`  PSS del processo       prima ${a.pss} kB -> dopo ${z.pss} kB  (${dp >= 0 ? '+' : ''}${dp} kB, ${(dp / a.pss * 100).toFixed(1)}%)`);
    const att = righe.map(r => r.vivo);
    console.log(`  attesa GIOCA->pallone  mediana ${mediana(att).toFixed(0)} ms, peggiore ${Math.max(...att).toFixed(0)} ms su ${att.length} avvii`);
  }
  console.log(`  batteria ${T0}°C -> ${T1}°C`);
  console.log('\n--- GLI ERRORI CHE IL GIOCO INGOIA ---');
  console.log('  raccolti in pagina: ' + err);
  console.log('  Log.entryAdded di livello error: ' + log.length + (log.length ? ' — ' + log.slice(0, 5).map(e => (e.params.entry.text || '').slice(0, 160)).join(' | ') : ''));
})();
