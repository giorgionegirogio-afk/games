/* =====================================================================
   _t3-tel-costo.js — IL COSTO DELLE POSE SUL TELEFONO VERO, clip per
   clip, dentro la WebView del OnePlus 6. Non stima e non tocca il gioco.

   PERCHE'. Il costo del rig misurato in Chromium desktop e' un
   ORDINAMENTO, non il numero del dispositivo: lo dichiara il § 6 del
   referto ONDA-ANIMAZIONE, e la prima misura di questa cura lo ha
   dimostrato — con un banco da sedici partite sulla stessa macchina,
   `tuffo` (che nessuno aveva toccato) si muoveva del 40%. Il gioco deve
   restare a 59 fotogrammi al secondo con 22 uomini in campo su un
   telefono del 2018, e quel numero si prende sul telefono.

   COME. Si installa l'APK indicato (stesso pacchetto e stessa chiave
   dell'APK del repo, quindi e' un aggiornamento e si torna indietro
   reinstallando apk/CALCETTO.apk), si apre il filo CDP con la WebView
   come fa strumenti/telefono.js, e si esegue DENTRO la pagina lo stesso
   banco che il gioco porta gia' con ?rigcosto: 22 figure x 600
   fotogrammi a 30 px in camera 'alto'. Mediana di N giri per clip,
   alternando le clip a ogni giro cosi' che una salita di temperatura
   colpisca tutte allo stesso modo invece che le ultime.

   IL CALORE si legge prima e dopo: un numero preso a telefono caldo non
   vale, ed e' la regola di casa sulla prestazione.

   uso: node strumenti/_t3-tel-costo.js --apk fuori/T3-DOPO.apk \
          --clip pugno,cielo,corsa,tuffo,esultanza --giri 5 --nome dopo
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };

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
    const ws = new WebSocket(url);
    let n = 0, morto = false;
    const attesa = new Map();
    const scaduto = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    const uccidi = () => { morto = true; clearTimeout(scaduto); for (const [, r] of attesa) r({ morto: true }); attesa.clear(); };
    ws.onclose = uccidi;
    ws.onerror = () => { clearTimeout(scaduto); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
    ws.onopen = () => { clearTimeout(scaduto);
      ok({ get morto() { return morto; },
        manda(metodo, params = {}, quanto = 180000) {
          if (morto) return Promise.resolve({ morto: true });
          const id = ++n;
          try { ws.send(JSON.stringify({ id, method: metodo, params })); }
          catch (e) { uccidi(); return Promise.resolve({ morto: true }); }
          return new Promise(res => { attesa.set(id, res);
            setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto); });
        },
        chiudi() { try { ws.close(); } catch (e) { } } });
    };
  });
}
const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };

/* IL BANCO, riga per riga quello che il gioco esegue con ?rigcosto
   (righe 7813-7831): stesso canvas, stesse 22 figure, stessi 600
   fotogrammi, stessa camera, stesso look. Non e' una copia «simile»: se
   un giorno il gioco cambiasse quel banco, questa riga andrebbe
   cambiata con lui. */
const BANCO = nome => `(() => {
  const cv=document.createElement('canvas'); cv.width=300; cv.height=300;
  const g=cv.getContext('2d');
  const lk=Rig3D.lookPredefinito;
  const t0=performance.now();
  for(let f=0;f<600;f++){
    g.clearRect(0,0,300,300);
    for(let i=0;i<22;i++)
      Rig3D.disegna(g, 30+(i%6)*48, 60+((i/6)|0)*60, 30, i*0.6, 'alto', ${JSON.stringify(nome)}, f/60+i*0.13, lk);
  }
  return (performance.now()-t0)/600;
})()`;

(async () => {
  const CLIP = String(arg('clip', 'pugno,cielo,corsa,tuffo,esultanza')).split(',').filter(Boolean);
  const GIRI = +arg('giri', 5);
  const APKF = arg('apk', '');
  const NOME = arg('nome', '');

  const adb = trovaAdb();
  if (!adb) { console.error('adb non trovato.'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato: mi fermo invece di stimare.'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  const temp = () => { try { const m = sh('shell', 'dumpsys', 'battery').match(/temperature:\s*(\d+)/); return m ? +m[1] / 10 : null; } catch (e) { return null; } };

  console.log('=== _t3-tel-costo — ' + sh('shell', 'getprop', 'ro.product.model').trim() +
    (NOME ? '   costruzione: ' + NOME : ''));
  if (APKF) {
    const f = path.resolve(RADICE, APKF);
    if (!fs.existsSync(f)) { console.error('APK non trovato: ' + f); process.exit(2); }
    console.log('installo  ' + f);
    /* -d oltre a -r: il telefono e' condiviso e sopra ci puo' essere la
       costruzione di un altro agente con versionCode piu' alto. Senza -d
       adb risponde INSTALL_FAILED_VERSION_DOWNGRADE e la misura muore. */
    sh('install', '-r', '-d', f);
  }
  const t1 = temp();
  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(3000);
  const unix = sh('shell', 'cat', '/proc/net/unix');
  const presa = (unix.match(/@(webview_devtools_remote\S*)/) || [])[1];
  if (!presa) { console.error('la WebView non espone il socket di debug: mi fermo.'); process.exit(2); }
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9223'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9223', 'localabstract:' + presa);

  let filo = null;
  for (let i = 0; i < 25 && !filo; i++) {
    try {
      const l = await (await fetch('http://127.0.0.1:9223/json/list')).json();
      const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) filo = await apriFilo(p.webSocketDebuggerUrl).catch(() => null);
    } catch (e) { }
    if (!filo) await pausa(500);
  }
  if (!filo) { console.error('nessun filo con la WebView.'); process.exit(2); }

  const val = async expr => {
    const r = await filo.manda('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (!r.result || !r.result.result) return null;
    if (r.result.exceptionDetails) return { errore: r.result.exceptionDetails.text };
    return r.result.result.value;
  };
  const pronto = await val('typeof Rig3D !== "undefined" && !!Rig3D.CLIPS');
  if (!pronto) { console.error('Rig3D non raggiungibile nella pagina.'); process.exit(2); }

  /* riscaldamento: il primo giro paga la compilazione JIT e le cache */
  for (const c of CLIP) await val(BANCO(c));

  const acc = {};
  for (const c of CLIP) acc[c] = [];
  for (let g = 0; g < GIRI; g++) {
    for (const c of CLIP) {
      const ms = await val(BANCO(c));
      if (typeof ms === 'number') acc[c].push(ms);
    }
    process.stderr.write('  giro ' + (g + 1) + '/' + GIRI + '\n');
  }
  const t2 = temp();
  filo.chiudi();

  console.log('\n  batteria: ' + t1 + ' -> ' + t2 + ' gradi' +
    (t1 !== null && t2 !== null && (t2 - t1) > 4 ? '   *** SALITA OLTRE 4 GRADI: numeri da rifare ***' : ''));
  console.log('\n  clip          ms/fotogramma (mediana di ' + GIRI + ')   min      max');
  const out = {};
  for (const c of CLIP) {
    const v = acc[c];
    if (!v.length) { console.log('  ' + c.padEnd(12) + '  nessuna misura'); continue; }
    out[c] = +mediana(v).toFixed(3);
    console.log('  ' + c.padEnd(12) + mediana(v).toFixed(3).padStart(10) +
      Math.min(...v).toFixed(3).padStart(20) + Math.max(...v).toFixed(3).padStart(9));
  }
  console.log('\n  MISURA_TEL ' + JSON.stringify({ nome: NOME, clip: out }));
})();
