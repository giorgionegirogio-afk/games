/* Parla con la WebView dell'APK via DevTools Protocol.
   Serve perche' lo screencap dell'emulatore restituisce nero sui livelli
   accelerati: qui invece la figura la produce Chromium stesso.

   uso:  node cdp.js foto <file.png>
         node cdp.js js "<espressione>"
         node cdp.js tocca <x> <y>          (coordinate CSS)
*/
const fs = require('fs');

const PORTA = process.env.PORTA || 9222;

async function bersaglio() {
  const r = await fetch(`http://127.0.0.1:${PORTA}/json/list`);
  const l = await r.json();
  const p = l.find(t => t.type === 'page');
  if (!p) throw new Error('nessuna pagina nella WebView');
  return p.webSocketDebuggerUrl;
}

function apri(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url);
    let n = 0;
    const attesa = new Map();
    ws.onopen = () => ok({
      manda(metodo, params = {}) {
        const id = ++n;
        ws.send(JSON.stringify({ id, method: metodo, params }));
        return new Promise(res => attesa.set(id, res));
      },
      chiudi() { ws.close(); },
    });
    ws.onerror = e => no(new Error('websocket: ' + e.message));
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); }
    };
  });
}

const pausa = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const c = await apri(await bersaglio());
  const [cmd, a, b] = process.argv.slice(2);

  if (cmd === 'foto') {
    /* Nota: sull'emulatore senza GPU vera la fotografia non si ottiene in
       nessun modo — "adb screencap" da' un rettangolo nero e questa chiamata
       resta appesa, anche con fromSurface:false. Li' si verifica leggendo il
       DOM e i pixel del canvas ("js"), non guardando. Su un telefono vero
       invece funziona. */
    await c.manda('Page.enable');
    const r = await c.manda('Page.captureScreenshot', {
      format: 'png', fromSurface: false, captureBeyondViewport: false,
    });
    if (!r.result || !r.result.data) { console.log('ERRORE', JSON.stringify(r)); process.exit(1); }
    fs.writeFileSync(a, Buffer.from(r.result.data, 'base64'));
    console.log('scritto', a, fs.statSync(a).size, 'byte');
  }

  else if (cmd === 'js') {
    const r = await c.manda('Runtime.evaluate', {
      expression: a, returnByValue: true, awaitPromise: true,
    });
    const v = r.result;
    if (v.exceptionDetails) console.log('ECCEZIONE:', JSON.stringify(v.exceptionDetails.exception));
    else console.log(JSON.stringify(v.result.value, null, 1));
  }

  else if (cmd === 'tocca') {
    const x = Number(a), y = Number(b);
    await c.manda('Input.dispatchTouchEvent', {
      type: 'touchStart', touchPoints: [{ x, y, radiusX: 8, radiusY: 8, force: 1 }],
    });
    await pausa(60);
    await c.manda('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    console.log('toccato', x, y);
  }

  await pausa(120);
  c.chiudi();
  process.exit(0);
})().catch(e => { console.log('FALLITO:', e.message); process.exit(1); });
