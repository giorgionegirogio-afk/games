/* =====================================================================
   _crit-tel-costo.js — IL COSTO SUL TELEFONO ALLA TAGLIA VERA.

   `_t3-tel-costo.js` misura il banco che il gioco porta con ?rigcosto:
   22 figure a **30 px, senza ombra**. Ma le due clip toccate si vedono
   solo nella ripresa del gol, dove il gioco le disegna a **105-232 px
   di periferica, CON ombra** (misurato sul gol vero da
   _crit-festa-pixel.js). Il riempimento va col quadrato dell'altezza:
   un costo preso a 30 px non e' il costo di quella scena.

   Qui si misurano DUE banchi nella stessa sessione:
     A30   il banco del gioco, identico (22 x 30 px, niente ombra)
     R200  la ripresa vera:  5 figure x 200 px, ombra accesa, scala 2
   e si alterna PRIMA-DOPO-PRIMA-DOPO reinstallando, cosi' una salita di
   temperatura colpisce tutti e due.

   uso: node strumenti/_crit-tel-costo.js --a fuori/T3-PRIMA.apk
                                          --b fuori/T3-DOPO.apk --giri 4
   ===================================================================== */
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const RADICE = path.resolve(__dirname, '..');
const PACCHETTO = 'it.dopolavoro.calcetto', ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const ADB = 'C:/Users/Utenteee/Android/Sdk/platform-tools/adb.exe';
const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };

function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0, morto = false; const attesa = new Map();
    const scaduto = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    const uccidi = () => { morto = true; clearTimeout(scaduto); for (const [, r] of attesa) r({ morto: true }); attesa.clear(); };
    ws.onclose = uccidi;
    ws.onerror = () => { clearTimeout(scaduto); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
    ws.onopen = () => { clearTimeout(scaduto); ok({
      manda(metodo, params = {}, quanto = 180000) {
        if (morto) return Promise.resolve({ morto: true });
        const id = ++n; try { ws.send(JSON.stringify({ id, method: metodo, params })); } catch (e) { uccidi(); return Promise.resolve({ morto: true }); }
        return new Promise(res => { attesa.set(id, res); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto); });
      }, chiudi() { try { ws.close(); } catch (e) { } } }); };
  });
}

/* banco A30 — copia riga per riga di ?rigcosto del gioco */
const A30 = nome => `(() => {
  const cv=document.createElement('canvas'); cv.width=300; cv.height=300;
  const g=cv.getContext('2d'); const lk=Rig3D.lookPredefinito;
  const t0=performance.now();
  for(let f=0;f<600;f++){ g.clearRect(0,0,300,300);
    for(let i=0;i<22;i++) Rig3D.disegna(g, 30+(i%6)*48, 60+((i/6)|0)*60, 30, i*0.6, 'alto', ${JSON.stringify(nome)}, f/60+i*0.13, lk); }
  return (performance.now()-t0)/600; })()`;

/* banco R200 — la ripresa del gol: 5 figure grandi, camera bassa, ombra */
const R200 = nome => `(() => {
  const cv=document.createElement('canvas'); cv.width=915; cv.height=412;
  const g=cv.getContext('2d'); const lk=Rig3D.lookPredefinito;
  const t0=performance.now();
  for(let f=0;f<300;f++){ g.clearRect(0,0,915,412);
    for(let i=0;i<5;i++) Rig3D.disegna(g, 100+i*180, 330, 200, Math.PI+(i&1?0.35:-0.42), 'bassa', ${JSON.stringify(nome)}, f/60+i*0.13, lk, true, 2); }
  return (performance.now()-t0)/300; })()`;

(async () => {
  const A = arg('a', 'fuori/T3-PRIMA.apk'), B = arg('b', 'fuori/T3-DOPO.apk');
  const GIRI = +arg('giri', 4);
  const CLIP = String(arg('clip', 'pugno,cielo,corsa,esultanza')).split(',');
  const sh = (...a) => execFileSync(ADB, ['-s', '01c8eb5a', ...a], { encoding: 'utf8', timeout: 900000 });
  const temp = () => { try { const m = sh('shell', 'dumpsys', 'battery').match(/temperature:\s*(\d+)/); return m ? +m[1] / 10 : null; } catch (e) { return null; } };

  async function misura(apk) {
    sh('install', '-r', '-d', path.resolve(RADICE, apk));
    sh('shell', 'am', 'force-stop', PACCHETTO);
    sh('shell', 'am', 'start', '-W', '-n', PACCHETTO + '/' + ATTIVITA);
    await pausa(3000);
    const presa = (sh('shell', 'cat', '/proc/net/unix').match(/@(webview_devtools_remote\S*)/) || [])[1];
    if (!presa) throw new Error('niente socket WebView');
    try { execFileSync(ADB, ['-s', '01c8eb5a', 'forward', '--remove', 'tcp:9224'], { stdio: 'pipe' }); } catch (e) { }
    sh('forward', 'tcp:9224', 'localabstract:' + presa);
    let filo = null;
    for (let i = 0; i < 25 && !filo; i++) {
      try { const l = await (await fetch('http://127.0.0.1:9224/json/list')).json();
        const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
        if (p) filo = await apriFilo(p.webSocketDebuggerUrl).catch(() => null); } catch (e) { }
      if (!filo) await pausa(500);
    }
    if (!filo) throw new Error('niente filo CDP');
    const val = async e => { const r = await filo.manda('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
      return r.result && r.result.result ? r.result.result.value : null; };
    if (!await val('typeof Rig3D!=="undefined" && !!Rig3D.CLIPS')) throw new Error('Rig3D irraggiungibile');
    for (const c of CLIP) { await val(A30(c)); await val(R200(c)); }   // riscaldamento
    const out = {};
    for (const c of CLIP) out[c] = { a30: [], r200: [] };
    for (let g = 0; g < GIRI; g++) for (const c of CLIP) {
      out[c].a30.push(await val(A30(c)));
      out[c].r200.push(await val(R200(c)));
    }
    filo.chiudi();
    try { execFileSync(ADB, ['-s', '01c8eb5a', 'forward', '--remove', 'tcp:9224'], { stdio: 'pipe' }); } catch (e) { }
    return out;
  }

  const t0 = temp();
  console.log('=== _crit-tel-costo — OnePlus 6, batteria ' + t0 + ' gradi ===');
  const ra = [], rb = [];
  for (let ciclo = 0; ciclo < 2; ciclo++) {
    process.stderr.write('ciclo ' + (ciclo + 1) + ' — PRIMA\n'); ra.push(await misura(A));
    process.stderr.write('ciclo ' + (ciclo + 1) + ' — DOPO\n'); rb.push(await misura(B));
  }
  const t1 = temp();
  const rac = (arr, c, k) => arr.flatMap(o => o[c][k]).filter(x => typeof x === 'number');
  console.log('  batteria a fine misura: ' + t1 + ' gradi' + ((t1 - t0) > 4 ? '  *** SALITA OLTRE 4 GRADI ***' : ''));
  for (const banco of ['a30', 'r200']) {
    console.log('\n  banco ' + (banco === 'a30' ? 'A30  (22 figure x 30 px, niente ombra — quello del gioco)'
      : 'R200 (5 figure x 200 px, camera bassa, ombra — la ripresa vera)'));
    console.log('    clip          PRIMA     DOPO    scarto      (crudi)');
    for (const c of CLIP) {
      const a = rac(ra, c, banco), b = rac(rb, c, banco);
      if (!a.length || !b.length) { console.log('    ' + c + ' nessuna misura'); continue; }
      const ma = mediana(a), mb = mediana(b);
      console.log('    ' + c.padEnd(12) + ma.toFixed(3).padStart(7) + mb.toFixed(3).padStart(9) +
        ('  ' + (100 * (mb - ma) / ma).toFixed(2) + '%').padStart(10) +
        '   A ' + a.map(x => x.toFixed(2)).join('/') + '  B ' + b.map(x => x.toFixed(2)).join('/'));
    }
  }
})();
