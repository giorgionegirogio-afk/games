/* sonda: parlare con la WebView del telefono e vedere COSA risponde */
const path = require('path');
const { execFileSync } = require('child_process');
const adb = path.join(process.env.USERPROFILE, 'Android', 'Sdk', 'platform-tools', 'adb.exe');
const dev = execFileSync(adb, ['devices'], { encoding: 'utf8' }).split('\n')[1].split('\t')[0];
const sh = (...a) => { try { return execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 120000 }); } catch (e) { return 'ERR ' + e.message; } };
const attendi = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  sh('shell', 'am', 'start', '-n', 'it.dopolavoro.calcetto/it.dopolavoro.gioco.Gioco');
  await attendi(6000);
  const unix = sh('shell', 'cat', '/proc/net/unix');
  const m = unix.match(/@(webview_devtools_remote_\S+)/);
  console.log('socket:', m && m[1]);
  if (!m) return;
  sh('forward', 'tcp:9222', 'localabstract:' + m[1]);
  const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  console.log('bersagli:', JSON.stringify(l.map(t => ({ type: t.type, url: (t.url || '').slice(0, 60), title: (t.title || '').slice(0, 40) }))));
  const p = l.find(t => t.type === 'page');
  if (!p) return;
  const ws = new WebSocket(p.webSocketDebuggerUrl);
  await new Promise(ok => { ws.onopen = ok; });
  let n = 0; const attesa = new Map();
  ws.onmessage = ev => { const x = JSON.parse(ev.data); if (x.id && attesa.has(x.id)) { attesa.get(x.id)(x); attesa.delete(x.id); } };
  const manda = (metodo, params = {}) => { const id = ++n; ws.send(JSON.stringify({ id, method: metodo, params })); return new Promise(r => { attesa.set(id, r); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); r({ scaduto: true }); } }, 15000); }); };
  console.log('enable:', JSON.stringify(await manda('Runtime.enable')).slice(0, 200));
  const ESPRESSIONI = process.argv.slice(2).length ? process.argv.slice(2) : ['1+1', 'location.href', 'typeof window.__test',
    'JSON.stringify(Object.keys(localStorage))',
    'localStorage.getItem("calcetto_save_v4")',
    '(function(){ try{ return String(window.__test && window.__test.save.coins); }catch(e){ return "ERR "+e.message; } })()'];
  for (const e of ESPRESSIONI) {
    const r = await manda('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
    console.log(e + '  ->  ' + JSON.stringify(r).slice(0, 300));
  }
  ws.close(); sh('forward', '--remove', 'tcp:9222');
})();
