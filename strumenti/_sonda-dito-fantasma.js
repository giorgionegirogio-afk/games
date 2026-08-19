/* =====================================================================
   SONDA: DOPO IL GIRO, RESTA UN DITO SUL VETRO?

   Il difetto che la toppa "banco onesto" chiude su giocatore.js e' che
   un'uscita anticipata lasciava il pollice sinistro PREMUTO sullo
   schermo del telefono. La prova offline (_sonda-dita-su.js) conta i
   byte scritti sul dispositivo di ingresso; questa invece guarda il
   TELEFONO DOPO, e non ha bisogno di sapere niente del vetro:

     se un dito e' rimasto giu' sulla levetta, humanMove non e' [0,0] e
     il giocatore comandato CONTINUA A CORRERE da solo.

   DUE BRACCI, PERCHE' UN NUMERO SOLO NON E' UNA MISURA:
     A (libero)    nessuno tocca niente: e' lo stato in cui la toppa
                   dice di lasciare il telefono;
     B (controllo) la sonda appoggia LEI un dito sulla levetta e lo
                   spinge di 44 px, e lo lascia giu' — cioe' rifa' il
                   difetto. Poi lo alza per davvero.
   Il verdetto e' il CONFRONTO fra i due, non una soglia inventata: se A
   non e' nettamente sotto B, o le dita non si sono alzate, o questa
   sonda non sa vedere quello che dice di cercare.

   ATTENZIONE: si misura solo in scena di gioco. Durante 'goal', 'end' e
   la moviola i giocatori si muovono per conto loro, e contarli sarebbe
   attribuire al dito cio' che fa la regia (misurato: 66,1 unita' subito
   dopo un gol, con le dita gia' alzate).

   uso:  node strumenti/_sonda-dito-fantasma.js [--sec 8]
         (la WebView del gioco dev'essere gia' aperta: fai girare prima
          strumenti/giocatore.js)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const pausa = ms => new Promise(r => setTimeout(r, ms));
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };

function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0, morto = false; const att = new Map();
    const sc = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onclose = () => { morto = true; };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        manda(m, p = {}) { const id = ++n; ws.send(JSON.stringify({ id, method: m, params: p })); return new Promise(r => att.set(id, r)); },
        async js(e) { const r = await this.manda('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

const LEGGI = "(()=>{const G=window.__test.G;const i=G.ctrl[0];const p=i>=0?G.players[i]:null;" +
  "return JSON.stringify({i,x:p?p.x:null,y:p?p.y:null,vx:p?p.vx:null,vy:p?p.vy:null,scena:G.scene});})()";

async function campiona(c, SEC) {
  let strada = 0, vmax = 0, prec = null, n = 0, nGioco = 0, cambi = 0;
  const t0 = Date.now();
  while ((Date.now() - t0) / 1000 < SEC) {
    const s = JSON.parse(await c.js(LEGGI) || 'null');
    if (s && s.x != null) {
      const inGioco = s.scena === 'play' || s.scena === 'kickoff' || s.scena === 'golden';
      if (inGioco) {
        nGioco++;
        if (prec && prec.gioco) {
          if (prec.i === s.i) { strada += Math.hypot(s.x - prec.x, s.y - prec.y); vmax = Math.max(vmax, Math.hypot(s.vx || 0, s.vy || 0)); }
          else cambi++;
        }
      }
      s.gioco = inGioco; prec = s; n++;
    }
    await pausa(80);
  }
  return { strada, vmax, n, nGioco, cambi, scena: prec ? prec.scena : '?', us: nGioco ? strada / (nGioco * 0.08) : 0 };
}

(async () => {
  const SEC = +arg('sec', 8);
  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const dev = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0])[0];
  if (!dev) { console.error('nessun telefono collegato'); process.exit(2); }
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 120000 });
  const u = sh('shell', 'cat', '/proc/net/unix');
  const presa = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
  if (!presa) { console.error("la WebView del gioco non e' aperta: fai prima girare strumenti/giocatore.js"); process.exit(2); }
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9223'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9223', 'localabstract:' + presa);
  await pausa(400);
  const l = await (await fetch('http://127.0.0.1:9223/json/list')).json();
  const c = await apriFilo(l.find(t => t.type === 'page').webSocketDebuggerUrl);

  console.log('=== IL DITO FANTASMA, DUE BRACCI ===\n');
  console.log('A (libero) — nessuno tocca niente, ' + SEC + ' s');
  const A = await campiona(c, SEC);
  console.log('    ' + A.nGioco + ' campioni in gioco su ' + A.n + " (scena '" + A.scena + "')  ·  " +
    A.cambi + ' cambi di comandato');
  console.log('    strada ' + A.strada.toFixed(1) + " unita'  ·  " + A.us.toFixed(1) + " unita'/s");

  /* --- braccio di controllo: un dito incollato apposta --- */
  const { Vetro } = require('./_vetro.js');
  const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'pollici-taratura.json'), 'utf8'));
  const vp = (cx, cy) => ({ px: T.indietro.a * cx + T.indietro.b * cy + T.indietro.c, py: T.indietro.d * cx + T.indietro.e * cy + T.indietro.f });
  const VW = await c.js('innerWidth'), VH = await c.js('innerHeight');
  const casa = vp(VW * 0.18, VH * 0.66), spinto = vp(VW * 0.18 + 44, VH * 0.66);
  const vetro = new Vetro(adb, dev);
  await pausa(400);
  vetro.giu(0, casa.px, casa.py); await pausa(120);
  vetro.muovi(0, spinto.px, spinto.py); await pausa(200);
  console.log('\nB (controllo) — un dito appoggiato e spinto di 44 px, LASCIATO GIU\', ' + SEC + ' s');
  const B = await campiona(c, SEC);
  console.log('    ' + B.nGioco + ' campioni in gioco su ' + B.n + " (scena '" + B.scena + "')  ·  " +
    B.cambi + ' cambi di comandato');
  console.log('    strada ' + B.strada.toFixed(1) + " unita'  ·  " + B.us.toFixed(1) + " unita'/s");
  /* si alza per davvero: su(), si aspetta che la coda si versi, si chiude */
  try { vetro.su(0); } catch (e) { }
  for (let i = 0; i < 200 && vetro.coda && vetro.coda.length; i++) await pausa(5);
  await pausa(120);
  try { vetro.chiudi(); } catch (e) { }
  await pausa(80);
  c.chiudi();

  console.log('\n--- VERDETTO ---');
  if (A.nGioco < 20 || B.nGioco < 20) {
    console.error('MISURA NON VALIDA: troppi pochi campioni in scena di gioco (' + A.nGioco + ' e ' + B.nGioco + ').');
    process.exit(2);
  }
  const rapporto = A.us > 0 ? B.us / A.us : Infinity;
  console.log('  braccio libero ' + A.us.toFixed(1) + " u/s  ·  braccio col dito incollato " + B.us.toFixed(1) +
    " u/s  ·  rapporto " + (isFinite(rapporto) ? rapporto.toFixed(1) : '∞') + 'x');
  if (rapporto >= 3) {
    console.log('  -> le dita si sono alzate: il braccio libero e\' un\'altra cosa dal braccio col dito giu\'.');
    console.log('     (il residuo del braccio libero non e\' un dito: e\' il cambio automatico di comandato');
    console.log('      e le spinte fra i corpi. Non e\' zero e non si spaccia per zero.)');
  } else {
    console.log('  -> I DUE BRACCI NON SI DISTINGUONO: o un dito e\' rimasto sul vetro, o questa sonda');
    console.log('     non sa vedere il difetto che cerca. In tutti e due i casi non e\' una prova.');
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
