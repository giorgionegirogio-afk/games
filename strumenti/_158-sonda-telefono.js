/* _158-sonda-telefono.js — IL DA-VICINO SUL TELEFONO VERO (voce #158,
   compito 8). L'atlante a 192 px decodifica tre bitmap da 3072x3072 alla
   prima ripresa del gol: quanto costa in memoria e in fotogrammi su un
   telefono, e lo sfratto li restituisce davvero? Nessun banco da tavolo
   puo' dirlo. Questa sonda:
     1. forza la chiusura dell'app, la riavvia, si attacca alla WebView via
        DevTools (stessa catena di avvio-telefono.js: socket cercato col pid,
        adb forward 9222);
     2. avvia una partita CPU contro CPU a taglia 5 e la lascia correre a
        tempo vero; misura fps in pianta e memoria (dumpsys meminfo: PSS
        totale e grafica);
     3. forza un gol: aspetta la ripresa, cronometra la decodifica
        dell'atlante grande, misura fps e memoria DENTRO la ripresa, scatta
        una foto (Page.captureScreenshot: sul telefono vero funziona);
     4. aspetta la fine della ripresa e lo sfratto (8 s di camera alta),
        rimisura memoria e stato;
     5. rifa' il gol col rubinetto del da-vicino CHIUSO (cella 144) per il
        confronto: fps, memoria, foto.
   Stampa una tabella e salva strumenti/_158-prove/telefono.json e le foto
   telefono-ripresa-192.png / telefono-ripresa-144.png.
   USCITA: 0 misurato · 3 PROVA NULLA (niente adb, niente telefono, niente
   socket): un 3 non accusa il gioco. Non e' un cancello: non ha soglie,
   perche' il numero giusto dipende dal telefono.
   USO: node strumenti/_158-sonda-telefono.js [--seriale 01c8eb5a] [--adb C:\...\adb.exe] */
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i+1] ? argv[i+1] : d; };
const PACCHETTO = 'it.dopolavoro.calcetto', ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const FUORI = path.join(__dirname, '_158-prove');
const pausa = ms => new Promise(r => setTimeout(r, ms));
const T0 = Date.now(); let FILO_CHIUSO = false;
/* un battito che tiene vivo il processo e lo spegne con causa dopo dieci
   minuti: cosi' non puo' mai finire «bene» per sfinimento */
const BATTITO = setInterval(() => { if (Date.now() - T0 > 600000) { console.log('  ??  dieci minuti: la sonda si ferma (filo chiuso: ' + FILO_CHIUSO + ')'); process.exit(2); } }, 1000);
function trovaAdb() {
  const scelto = arg('adb', ''); if (scelto) return fs.existsSync(scelto) ? scelto : null;
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) { try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { } }
  return null;
}
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0; const attesa = new Map();
    ws.onopen = () => ok({
      manda(metodo, params = {}) { const id = ++n; ws.send(JSON.stringify({ id, method: metodo, params })); return new Promise(res => attesa.set(id, res)); },
      chiudi() { try { ws.close(); } catch (e) { } },
    });
    ws.onerror = e => { no(new Error('websocket')); };
    /* SE IL FILO SI CHIUDE, SI DICE. La prima stesura taceva: le promesse
       in attesa non si risolvevano piu', il ciclo degli eventi di node si
       svuotava e il processo usciva con 0 a meta' misura — due corse
       "finite" senza esito e senza errore. */
    ws.onclose = ev => { console.log('  !!  il filo con la WebView si e` chiuso (codice ' + ev.code + ') dopo ' + Math.round((Date.now() - T0) / 1000) + ' s'); for (const res of attesa.values()) res({ chiuso: true }); attesa.clear(); FILO_CHIUSO = true; };
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
  });
}
(async () => {
  fs.mkdirSync(FUORI, { recursive: true });
  const adb = trovaAdb();
  if (!adb) { console.log('  PROVA NULLA: adb non trovato (--adb C:\\...\\adb.exe)'); process.exit(3); }
  let dev = arg('seriale', '');
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8' }).split('\n').map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!dev) dev = lista[0];
  if (!dev) { console.log('  PROVA NULLA: nessun telefono collegato (adb devices)'); process.exit(3); }
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 120000, maxBuffer: 64 * 1024 * 1024 });
  const modello = sh('shell', 'getprop', 'ro.product.model').trim(), android = sh('shell', 'getprop', 'ro.build.version.release').trim();
  const memTot = (sh('shell', 'cat', '/proc/meminfo').match(/MemTotal:\s+(\d+)/) || [])[1];
  console.log(`  telefono: ${modello}, Android ${android}, RAM ${memTot ? (memTot / 1024 / 1024).toFixed(1) + ' GB' : '?'}`);
  const mem = (nome) => {
    let out = ''; try { out = sh('shell', 'dumpsys', 'meminfo', PACCHETTO); } catch (e) { return { nome, pss: null }; }
    const tot = (out.match(/TOTAL PSS:\s+(\d+)/) || out.match(/\n\s*TOTAL\s+(\d+)/) || [])[1];
    const graf = (out.match(/Graphics:\s+(\d+)/) || [])[1];
    const gl = (out.match(/GL mtrack\s+(\d+)/) || [])[1];
    const egl = (out.match(/EGL mtrack\s+(\d+)/) || [])[1];
    const nat = (out.match(/Native Heap\s+(\d+)/) || [])[1];
    return { nome, pss: tot ? Math.round(tot / 1024) : null, grafica: graf ? Math.round(graf / 1024) : null, gl: gl ? Math.round(gl / 1024) : null, egl: egl ? Math.round(egl / 1024) : null, nativo: nat ? Math.round(nat / 1024) : null };
  };
  /* 1. riavvio e aggancio */
  try { sh('shell', 'am', 'force-stop', PACCHETTO); } catch (e) { }
  try { sh('forward', '--remove', 'tcp:9222'); } catch (e) { }   // puo' non esserci: adb lo dice e non e' un errore
  await pausa(1200);
  const cmd = 'am start -n ' + PACCHETTO + '/' + ATTIVITA + ' >/dev/null 2>&1 & i=0; while [ $i -lt 4000 ]; do q=$(pidof ' + PACCHETTO + '); for z in $q; do if grep -q "webview_devtools_remote_$z" /proc/net/unix; then echo "SOCK=webview_devtools_remote_$z"; exit 0; fi; done; i=$((i+1)); done; echo NIENTE';
  const out = sh('shell', cmd);
  const sock = (out.match(/SOCK=(\S+)/) || [])[1];
  if (!sock) { console.log('  PROVA NULLA: la WebView non espone il socket di debug (debug USB acceso? calcetto_collaudo?)'); process.exit(3); }
  sh('forward', 'tcp:9222', 'localabstract:' + sock);
  let pagina = null;
  for (let i = 0; i < 300 && !pagina; i++) { try { const l = await (await fetch('http://127.0.0.1:9222/json/list')).json(); pagina = l.find(x => x.type === 'page' && x.webSocketDebuggerUrl); } catch (e) { } if (!pagina) await pausa(20); }
  if (!pagina) { console.log('  PROVA NULLA: nessuna pagina nella WebView'); process.exit(3); }
  const filo = await apriFilo(pagina.webSocketDebuggerUrl);
  const js = async (expr) => { if (FILO_CHIUSO) throw new Error('filo chiuso'); const r = await filo.manda('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.chiuso) throw new Error('filo chiuso durante: ' + expr.slice(0, 60)); if (r.result && r.result.exceptionDetails) throw new Error('JS: ' + JSON.stringify(r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description || r.result.exceptionDetails.text)); return r.result && r.result.result ? r.result.result.value : undefined; };
  /* il sipario (#wipe) e' un elemento del DOM a tempo vero: copre la foto
     se si scatta mentre e' su (la prima foto sul telefono e' uscita tutta
     verde scuro: era lui). Si aspetta che sparisca, al massimo tre secondi. */
  const foto = async (nome) => { for (let i = 0; i < 30; i++) { const su = await js("(function(){ const w=document.getElementById('wipe'); if(!w) return false; const cs=getComputedStyle(w); return cs.display!=='none' && +cs.opacity>0.02; })()"); if (!su) break; await pausa(100); } await filo.manda('Page.enable'); const r = await filo.manda('Page.captureScreenshot', { format: 'png' }); if (r.result && r.result.data) { const p = path.join(FUORI, nome); fs.writeFileSync(p, Buffer.from(r.result.data, 'base64')); return p; } return null; };
  const fps = () => js(`new Promise(r=>{let n=0,t0=performance.now();(function f(){n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(+(n/((performance.now()-t0)/1000)).toFixed(1));})();})`);
  /* 2. la partita */
  for (let i = 0; i < 300; i++) { if (await js('!!(window.__test && window.__test.sprite && window.__test.sprite.pronto)')) break; await pausa(100); }
  const st0 = await js('JSON.stringify(window.__test.sprite)');
  await js(`(function(){ const t=window.__test; t.dismissSplash&&t.dismissSplash(); t.startMatch(1,1,{size:5}); t.Tut&&t.Tut.finish&&t.Tut.finish(true); t.posaHUD&&t.posaHUD(true); t.setCpuVsCpu&&t.setCpuVsCpu(true); return true; })()`);
  await pausa(5000);
  const R = { telefono: { modello, android, ramGB: memTot ? +(memTot / 1024 / 1024).toFixed(1) : null }, sprite: JSON.parse(st0), passi: [] };
  R.passi.push({ fase: 'pianta', fps: await fps(), mem: mem('pianta') });
  console.log('  pianta:', JSON.stringify(R.passi[0]));
  /* 3. la ripresa col da-vicino */
  const ripresa = async (nome, vicino) => {
    await js(`window.__test.vicinoOn(${vicino ? 'true' : 'false'})`);
    const okGol = await js('window.__test.forceGoal(0)');
    const tGol = Date.now(); let dentro = false;
    for (let i = 0; i < 200; i++) { if (await js('!!G.ripresa')) { dentro = true; break; } await pausa(100); }
    if (!dentro) return { fase: nome, errore: 'nessuna ripresa entro 20 s (gol forzato: ' + okGol + ')' };
    const tRip = Date.now();
    let tPronto = null;
    if (vicino) { for (let i = 0; i < 100; i++) { const v = await js('JSON.stringify(window.__test.sprite.vicino)'); if (JSON.parse(v).pronto) { tPronto = Date.now() - tRip; break; } await pausa(50); } }
    const f = await fps();
    const m = mem(nome);
    const v = JSON.parse(await js('JSON.stringify(window.__test.sprite.vicino)'));
    const p = await foto('telefono-ripresa-' + (vicino ? '192' : '144') + '.png');
    for (let i = 0; i < 300; i++) { if (!(await js('!!G.ripresa'))) break; await pausa(100); }
    return { fase: nome, golForzato: okGol, msAllaRipresa: tRip - tGol, msDecodifica: tPronto, fps: f, mem: m, vicino: v, foto: p };
  };
  const r192 = await ripresa('ripresa-192', true); R.passi.push(r192); console.log('  ripresa 192:', JSON.stringify(r192));
  /* 4. lo sfratto: la camera alta torna a disegnare, dopo 8 s senza richieste le immagini si lasciano andare */
  await pausa(10000);
  const dopo = { fase: 'dopo-sfratto', fps: await fps(), mem: mem('dopo'), vicino: JSON.parse(await js('JSON.stringify(window.__test.sprite.vicino)')) };
  R.passi.push(dopo); console.log('  dopo lo sfratto:', JSON.stringify(dopo));
  /* 5. il confronto: la stessa ripresa con la cella da 144 */
  await pausa(3000);
  const r144 = await ripresa('ripresa-144', false); R.passi.push(r144); console.log('  ripresa 144:', JSON.stringify(r144));
  await js('window.__test.vicinoOn(true)');
  fs.writeFileSync(path.join(FUORI, 'telefono.json'), JSON.stringify(R, null, 1));
  console.log('\n  fase            fps    PSS MB  grafica MB  nativo MB');
  for (const p of R.passi) if (p.mem) console.log('  ' + p.fase.padEnd(15) + String(p.fps).padStart(5) + String(p.mem.pss).padStart(9) + String(p.mem.grafica).padStart(12) + String(p.mem.nativo).padStart(11));
  if (r192.msDecodifica != null) console.log('  decodifica dell\'atlante grande: ' + r192.msDecodifica + ' ms dalla ripresa');
  filo.chiudi(); clearInterval(BATTITO); try { sh('forward', '--remove', 'tcp:9222'); } catch (e) { }
  process.exit(0);
})().catch(e => { console.log('  ??  esploso:', e.message); process.exit(2); });
