/* _crit-tel2.js — misura la costruzione GIA' installata sul telefono
   con due banchi: A30 (quello del gioco, 22 x 30 px) e R200 (la ripresa
   vera: 5 figure x 200 px, camera bassa, ombra). Non installa niente.
   uso: node strumenti/_crit-tel2.js --nome prima --giri 5 */
const path = require('path');
const { execFileSync } = require('child_process');
const PACCHETTO = 'it.dopolavoro.calcetto', ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const ADB = 'C:/Users/Utenteee/Android/Sdk/platform-tools/adb.exe';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0, morto = false; const attesa = new Map();
    const scaduto = setTimeout(() => no(new Error('timeout')), 20000);
    const uccidi = () => { morto = true; clearTimeout(scaduto); for (const [, r] of attesa) r({ morto: true }); attesa.clear(); };
    ws.onclose = uccidi;
    ws.onerror = () => { clearTimeout(scaduto); if (!morto) { morto = true; no(new Error('ws rifiutato')); } };
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
    ws.onopen = () => { clearTimeout(scaduto); ok({
      manda(metodo, params = {}, quanto = 180000) {
        if (morto) return Promise.resolve({ morto: true });
        const id = ++n; try { ws.send(JSON.stringify({ id, method: metodo, params })); } catch (e) { uccidi(); return Promise.resolve({ morto: true }); }
        return new Promise(res => { attesa.set(id, res); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto); });
      }, chiudi() { try { ws.close(); } catch (e) { } } }); };
  });
}
const A30 = n => `(() => { const cv=document.createElement('canvas'); cv.width=300; cv.height=300;
  const g=cv.getContext('2d'); const lk=Rig3D.lookPredefinito; const t0=performance.now();
  for(let f=0;f<600;f++){ g.clearRect(0,0,300,300);
    for(let i=0;i<22;i++) Rig3D.disegna(g, 30+(i%6)*48, 60+((i/6)|0)*60, 30, i*0.6, 'alto', ${JSON.stringify(n)}, f/60+i*0.13, lk); }
  return (performance.now()-t0)/600; })()`;
const R200 = n => `(() => { const cv=document.createElement('canvas'); cv.width=915; cv.height=412;
  const g=cv.getContext('2d'); const lk=Rig3D.lookPredefinito; const t0=performance.now();
  for(let f=0;f<300;f++){ g.clearRect(0,0,915,412);
    for(let i=0;i<5;i++) Rig3D.disegna(g, 100+i*180, 330, 200, Math.PI+(i&1?0.35:-0.42), 'bassa', ${JSON.stringify(n)}, f/60+i*0.13, lk, true, 2); }
  return (performance.now()-t0)/300; })()`;
(async () => {
  const NOME = arg('nome', '?'), GIRI = +arg('giri', 5);
  const CLIP = String(arg('clip', 'pugno,cielo,corsa,esultanza')).split(',');
  const sh = (...a) => execFileSync(ADB, ['-s', '01c8eb5a', ...a], { encoding: 'utf8', timeout: 240000 });
  const temp = () => { try { const m = sh('shell', 'dumpsys', 'battery').match(/temperature:\s*(\d+)/); return m ? +m[1] / 10 : null; } catch (e) { return null; } };
  const ver = (sh('shell', 'dumpsys', 'package', PACCHETTO).match(/versionName=(.*)/) || [])[1];
  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', PACCHETTO + '/' + ATTIVITA);
  await pausa(3000);
  const presa = (sh('shell', 'cat', '/proc/net/unix').match(/@(webview_devtools_remote\S*)/) || [])[1];
  if (!presa) { console.error('niente socket WebView'); process.exit(2); }
  try { execFileSync(ADB, ['-s', '01c8eb5a', 'forward', '--remove', 'tcp:9224'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9224', 'localabstract:' + presa);
  let filo = null;
  for (let i = 0; i < 30 && !filo; i++) {
    try { const l = await (await fetch('http://127.0.0.1:9224/json/list')).json();
      const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) filo = await apriFilo(p.webSocketDebuggerUrl).catch(() => null); } catch (e) { }
    if (!filo) await pausa(500);
  }
  if (!filo) { console.error('niente filo'); process.exit(2); }
  const val = async e => { const r = await filo.manda('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true });
    return r.result && r.result.result ? r.result.result.value : null; };
  if (!await val('typeof Rig3D!=="undefined" && !!Rig3D.CLIPS')) { console.error('Rig3D irraggiungibile'); process.exit(2); }
  const t0 = temp();
  for (const c of CLIP) { await val(A30(c)); await val(R200(c)); }
  const out = {}; for (const c of CLIP) out[c] = { a30: [], r200: [] };
  for (let g = 0; g < GIRI; g++) for (const c of CLIP) {
    out[c].a30.push(await val(A30(c))); out[c].r200.push(await val(R200(c)));
  }
  const t1 = temp();
  filo.chiudi();
  try { execFileSync(ADB, ['-s', '01c8eb5a', 'forward', '--remove', 'tcp:9224'], { stdio: 'pipe' }); } catch (e) { }
  const r = { nome: NOME, versione: ver ? ver.trim() : '?', batteria: [t0, t1] };
  for (const c of CLIP) r[c] = { a30: +mediana(out[c].a30).toFixed(3), r200: +mediana(out[c].r200).toFixed(3),
                                 a30crudi: out[c].a30.map(x => +x.toFixed(2)), r200crudi: out[c].r200.map(x => +x.toFixed(2)) };
  console.log('MISURA ' + JSON.stringify(r));
})();
