/* =====================================================================
   _z-telefono-duello.js — IL FOTOGRAMMA DI UN RIGORE, SUL TELEFONO VERO.

   PERCHE' NON BASTA telefono.js. Quello misura una PARTITA: chiama
   t.startMatch e cronometra i fotogrammi della vista dall'alto. La toppa
   _t-duello.js non tocca la partita di un millisecondo — tocca il
   fotogramma del DUELLO DAL DISCHETTO, cioe' una scena in cui
   telefono.js non entra mai. Misurare la partita per giudicare la toppa
   darebbe zero e sarebbe un numero vero e inutile.

   Questo file fa la stessa cosa di telefono.js — stesso adb, stesso
   socket della WebView, stessa funzione di fotogramma avvolta, stessa
   lettura della temperatura della batteria prima e dopo — ma sulla scena
   giusta: si entra nella serie di rigori (t.rigori()), si aspetta la fase
   'zone', cioe' il dito che mira, e si cronometra li'.

   COSA CRONOMETRA, e perche' non l'intervallo. Su uno schermo a 60 Hz
   l'intervallo fra due fotogrammi vale 16,7 ms qualunque cosa il gioco
   faccia: e' il vsync. Qui si avvolge window.frame e si misura il LAVORO
   dentro. E' l'unica misura che dice quanto margine resta.

   LA FASE SI RILEGGE DAL GIOCO, e se non e' quella la misura si butta. Un
   numero attribuito alla scena sbagliata e' peggio di nessun numero: e' il
   tranello in cui telefono.js e' gia' caduto una volta con le taglie.

   LA PROVA CHE SA FALLIRE: --sabota N inietta N millisecondi di lavoro
   sincrono vero dentro ogni fotogramma di duello. Se con --sabota 20
   questo file dice ancora che il duello e' leggero, e' rotto e va buttato.

   uso:
     node strumenti/_z-telefono-duello.js --apk fuori/PRIMA.apk --nome prima
     node strumenti/_z-telefono-duello.js --apk fuori/DOPO.apk  --nome dopo
     ... --sec 20 --giri 3 --sabota 20 --caldo 4
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const bandiera = n => process.argv.includes('--' + n);

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
    ws.onopen = () => {
      clearTimeout(scaduto);
      ok({
        get morto() { return morto; },
        manda(metodo, params = {}, quanto = 120000) {
          if (morto) return Promise.resolve({ morto: true });
          const id = ++n;
          try { ws.send(JSON.stringify({ id, method: metodo, params })); }
          catch (e) { uccidi(); return Promise.resolve({ morto: true }); }
          return new Promise(res => {
            attesa.set(id, res);
            setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto);
          });
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2; };
const quant = (a, q) => { const o = [...a].sort((x, y) => x - y); return o[Math.min(o.length - 1, Math.floor(o.length * q))]; };

/* ---------------------------------------------------------------------
   LA SONDA — dentro la pagina, sulla scena del duello.
   --------------------------------------------------------------------- */
function SONDA(secondi, sabota) {
  return `(async () => {
    const t = window.__test;
    if (!t) return JSON.stringify({errore:'window.__test non esiste'});
    try { t.dismissSplash && t.dismissSplash(); } catch(e){}
    if (!t.rigori) return JSON.stringify({errore:'window.__test.rigori non esiste'});
    try { t.rigori(); } catch(e){ return JSON.stringify({errore:'rigori(): '+e.message}); }

    /* si aspetta che il DUELLO sia davvero in piedi. Duel non e' esposto
       da __test: si legge dal contesto globale della pagina, che nella
       WebView e' lo stesso. */
    const fase = () => { try { return (typeof Duel!=='undefined') ? Duel.phase : null; } catch(e){ return null; } };
    for (let i=0; i<600; i++) {
      await new Promise(r=>requestAnimationFrame(r));
      if (fase() && fase() !== 'off') break;
    }
    if (!fase() || fase()==='off') return JSON.stringify({errore:'il duello non e\\' partito'});

    /* LA FASE SI INCHIODA SU 'zone'. E' la fase in cui il dito mira, ed e'
       quella che dura di piu'; se la si lascia correre, il duello passa a
       'power'/'result' e poi finisce, e la misura diventa un miscuglio di
       scene diverse. La si riscrive a ogni fotogramma dentro la funzione
       avvolta, cosi' non puo' scappare. */
    const lavoro = [];
    const fasi = {};
    let ripristina = null;
    if (typeof window.frame === 'function') {
      const orig = window.frame;
      window.frame = function () {
        try { if (typeof Duel!=='undefined') { Duel.phase='zone'; Duel.resultT=0; Duel.dito=-1; Duel.mira=false; } } catch(e){}
        const a = performance.now();
        try { return orig.apply(this, arguments); }
        finally {
          ${sabota > 0 ? `{ const f = performance.now(); while (performance.now() - f < ${sabota}); }` : ''}
          lavoro.push(performance.now() - a);
          const p = fase(); fasi[p] = (fasi[p]||0)+1;
        }
      };
      ripristina = () => { window.frame = orig; };
    }

    const dt = [];
    let prec = performance.now();
    const fine = prec + ${secondi} * 1000;
    while (performance.now() < fine) {
      await new Promise(r=>requestAnimationFrame(r));
      const ora = performance.now();
      dt.push(ora - prec);
      prec = ora;
    }
    if (ripristina) ripristina();

    let scena = null;
    try { scena = t.state; } catch(e){}
    return JSON.stringify({ dt, lavoro, scena, fasi,
      avvolto: !!ripristina, dpr: window.devicePixelRatio,
      largo: window.innerWidth, alto: window.innerHeight,
      tela: (function(){ const c=document.querySelector('canvas'); return c ? c.width+'x'+c.height : '?'; })() });
  })()`;
}

function temperatura(sh) {
  try {
    const d = sh('shell', 'dumpsys', 'battery');
    const m = d.match(/temperature:\s*(\d+)/);
    if (m) return +m[1] / 10;
  } catch (e) { }
  return null;
}

(async () => {
  const APK = arg('apk', '');
  const NOME = arg('nome', APK ? path.basename(APK) : 'in-linea');
  const secondi = +arg('sec', 15);
  const giri = +arg('giri', 3);
  const sabota = +arg('sabota', 0);
  const caldoMax = +arg('caldo', 4);

  const adb = trovaAdb();
  if (!adb) { console.error('adb non trovato ne nel PATH ne nell\'SDK.'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato: questo strumento non stima, quindi si ferma.'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });

  const modello = sh('shell', 'getprop', 'ro.product.model').trim();
  const android = sh('shell', 'getprop', 'ro.build.version.release').trim();
  const schermo = (sh('shell', 'wm', 'size').match(/(\d+x\d+)/) || [])[1] || '?';
  const dens = (sh('shell', 'wm', 'density').match(/(\d+)/) || [])[1] || '?';

  console.log('=== IL FOTOGRAMMA DI UN RIGORE, SUL TELEFONO VERO ===\n');
  console.log(`dispositivo  ${modello}  ·  Android ${android}  ·  ${schermo} a densita' ${dens}`);
  console.log(`costruzione  ${NOME}${APK ? '   (' + APK + ')' : ''}`);
  if (APK) {
    if (!fs.existsSync(APK)) { console.error('APK non trovato: ' + APK); process.exit(2); }
    console.log('installo ...');
    sh('install', '-r', APK);
  }
  if (sabota) console.log(`SABOTAGGIO ATTIVO: ${sabota} ms di lavoro sincrono in ogni fotogramma`);
  console.log('');

  const rinnovaInoltro = () => {
    for (let i = 0; i < 20; i++) {
      try {
        const u = sh('shell', 'cat', '/proc/net/unix');
        const p = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
        if (p) {
          try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
          sh('forward', 'tcp:9222', 'localabstract:' + p);
          return p;
        }
      } catch (e) { }
      execFileSync(adb, ['-s', dev, 'shell', 'sleep', '0.4'], { stdio: 'pipe' });
    }
    return null;
  };
  const riattacca = async () => {
    if (!rinnovaInoltro()) return null;
    for (let i = 0; i < 25; i++) {
      try {
        const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
        const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
        if (p) return await apriFilo(p.webSocketDebuggerUrl).catch(() => null);
      } catch (e) { }
      await pausa(400);
    }
    return null;
  };

  const t0 = temperatura(sh);
  let tFine = t0;
  const tutti = [];

  for (let g = 0; g < giri; g++) {
    sh('shell', 'am', 'force-stop', PACCHETTO);
    sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
    await pausa(2500);
    const c = await riattacca();
    if (!c) { console.log(`  giro ${g + 1}: nessun filo con la WebView`); continue; }
    await c.manda('Runtime.enable');
    let pronto = false;
    for (let i = 0; i < 60 && !pronto; i++) {
      const r = await c.manda('Runtime.evaluate', { expression: '!!window.__test', returnByValue: true });
      pronto = !!(r.result && r.result.result && r.result.result.value);
      if (!pronto) await pausa(300);
    }
    if (!pronto) { console.log(`  giro ${g + 1}: il gioco non e' arrivato a __test`); c.chiudi(); continue; }

    const r = await c.manda('Runtime.evaluate', {
      expression: SONDA(secondi, sabota), awaitPromise: true, returnByValue: true,
    }, (secondi + 60) * 1000);
    c.chiudi();
    const v = r.result && r.result.result && r.result.result.value;
    if (!v) { console.log(`  giro ${g + 1}: nessuna risposta`); continue; }
    const o = JSON.parse(v);
    if (o.errore) { console.log(`  giro ${g + 1}: ${o.errore}`); continue; }
    if (!o.avvolto) { console.log(`  giro ${g + 1}: BUTTATA — non sono riuscito ad avvolgere window.frame, niente misura del lavoro`); continue; }

    /* LA SCENA SI RILEGGE. Se i fotogrammi non sono tutti di fase 'zone',
       la misura non e' del duello e si butta invece di essere spacciata. */
    const fasi = o.fasi || {};
    const tot = Object.values(fasi).reduce((a, b) => a + b, 0);
    const zone = fasi.zone || 0;
    if (!tot || zone / tot < 0.98) {
      console.log(`  giro ${g + 1}: BUTTATA — solo ${zone}/${tot} fotogrammi in fase 'zone' (${JSON.stringify(fasi)})`);
      continue;
    }
    const lav = o.lavoro.slice(2).filter(x => x >= 0 && x < 5000);
    const dt = o.dt.slice(1).filter(x => x > 0 && x < 5000);
    if (lav.length < 30) { console.log(`  giro ${g + 1}: solo ${lav.length} fotogrammi, non basta`); continue; }
    const persi = dt.filter(x => x > 20).length;
    tutti.push({ lav, dt, persi, o });
    console.log(`  giro ${g + 1}: ${lav.length} fotogrammi di duello, fase 'zone' ${zone}/${tot}` +
      `   lavoro mediano ${mediana(lav).toFixed(2)} ms   p95 ${quant(lav, 0.95).toFixed(2)}   peggiore ${Math.max(...lav).toFixed(2)}` +
      `   persi ${(100 * persi / dt.length).toFixed(1)}%`);
    tFine = temperatura(sh);
  }

  console.log('');
  if (!tutti.length) { console.log('NESSUNA MISURA VALIDA: non scrivo un numero.'); process.exit(1); }
  const lav = [].concat(...tutti.map(t => t.lav));
  const dt = [].concat(...tutti.map(t => t.dt));
  const persi = dt.filter(x => x > 20).length;
  const u = tutti[0].o;
  console.log(`vista ${u.largo}x${u.alto} dpr ${u.dpr}  tela ${u.tela}`);
  console.log(`LAVORO PER FOTOGRAMMA nel duello, ${lav.length} fotogrammi su ${tutti.length} giri:`);
  console.log(`   mediana ${mediana(lav).toFixed(2)} ms   tipico(25-75) ${quant(lav, 0.25).toFixed(2)}-${quant(lav, 0.75).toFixed(2)}` +
    `   p95 ${quant(lav, 0.95).toFixed(2)}   peggiore ${Math.max(...lav).toFixed(2)}`);
  console.log(`   fotogrammi persi (intervallo > 20 ms): ${(100 * persi / dt.length).toFixed(1)}%   su ${dt.length}`);
  if (t0 != null && tFine != null) {
    const salita = tFine - t0;
    console.log(`batteria ${t0.toFixed(1)} -> ${tFine.toFixed(1)} gradi (${salita >= 0 ? '+' : ''}${salita.toFixed(1)})` +
      (salita > caldoMax ? `  ATTENZIONE: oltre i ${caldoMax} gradi ammessi — il telefono ha scaldato e questi numeri sono peggiorati da soli.` : ''));
  }
  process.exit(0);
})();
