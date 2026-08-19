/* =====================================================================
   _p-l03.js — IL GESTO «INDIETRO» RUBA LA PRESA DEL DISCO DESTRO?

   L'ACCUSA (voce L0.3, `_analisi/agente28.md` §2.2): il gioco dichiara
   `viewport-fit=cover` e non usa nemmeno una `env(safe-area-inset-*)`;
   la presa del disco grande arriva a 14 px dal bordo destro e a 10 px
   dal fondo, cioe' DENTRO la fascia del gesto «indietro» di Android
   (~24 dp) e dentro la striscia dell'home indicator. Trascinare verso
   sinistra partendo di li' e' il gesto «indietro»: il sistema si prende
   il tocco e il gioco riceve `touchcancel`, o non riceve niente.

   PERCHE' NON BASTA IL BANCO. Chromium headless non ha inserti di
   sistema e non ha un navigatore a gesti: e' lo stesso banco che ha
   reso invisibile il problema per ventotto agenti. E nemmeno
   `Input.dispatchTouchEvent` via DevTools serve, perche' entra DENTRO
   la pagina e salta la catena di ingresso di Android — cioe' e' cieco
   esattamente al difetto che si vuole misurare. L'unico modo e'
   scrivere `input_event` sul dispositivo del kernel: lo fa
   `strumenti/_vetro.js`, e questo file lo usa.

   COSA MISURA. Su N ripetizioni, un dito si posa dentro la PRESA del
   disco grande e trascina verso sinistra di 110 px CSS. Il tocco si
   dichiara RUBATO se accade una delle due cose che l'accusa nomina:
     · alla pagina non arriva nessun `touchstart`;
     · alla pagina arriva un `touchcancel`.
   Il braccio di CONTROLLO fa lo stesso identico gesto partendo dal
   CENTRO del disco (64 px dal bordo, fuori dalla fascia): se anche li'
   il tocco sparisce, il difetto non e' del bordo ed e' il banco a
   essere rotto — e questa misura non dice niente.

   TESTIMONE INDIPENDENTE: durante una partita il tasto/gesto Indietro
   fa `setPaused(!G.paused)` (`window.__indietro`, :29986). Se la pausa
   si accende da sola dopo un trascinamento, non e' un'interpretazione:
   e' il sistema che ha eseguito «indietro» al posto del gioco.

   uso:  node strumenti/_p-l03.js
         node strumenti/_p-l03.js --prove 20
         node strumenti/_p-l03.js --sweep      quanto e' larga la fascia
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Vetro } = require('./_vetro.js');

const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const TARA = path.join(__dirname, 'pollici-taratura.json');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const bandiera = n => process.argv.includes('--' + n);
const pausa = ms => new Promise(r => setTimeout(r, ms));

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
    ws.onclose = () => { morto = true; for (const [, r] of att) r({}); att.clear(); };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        manda(m, p = {}) { if (morto) return Promise.resolve({}); const id = ++n; ws.send(JSON.stringify({ id, method: m, params: p })); return new Promise(r => { att.set(id, r); setTimeout(() => { if (att.has(id)) { att.delete(id); r({}); } }, 30000); }); },
        async js(e) { const r = await this.manda('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

/* la spia: ogni tocco che ARRIVA alla pagina, in coordinate CSS */
const SPIA = `(() => {
  if (window.__spiaL03) return 'gia attiva';
  const s = { eventi: [] };
  window.__spiaL03 = s;
  for (const tipo of ['touchstart','touchmove','touchend','touchcancel']) {
    document.addEventListener(tipo, ev => {
      for (const t of ev.changedTouches) s.eventi.push({ tipo, x: +t.clientX.toFixed(1), y: +t.clientY.toFixed(1) });
      if (s.eventi.length > 4000) s.eventi.splice(0, 2000);
    }, { capture: true, passive: true });
  }
  return 'installata';
})()`;

(async () => {
  const PROVE = +arg('prove', 20);
  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato: mi fermo.'); process.exit(2); }
  const disp = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 })
    .split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato: mi fermo invece di stimare.'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  const chiSono = sh('shell', 'su', '-c', 'id').trim();
  if (!/uid=0/.test(chiSono)) { console.error('serve root per scrivere sul dispositivo di ingresso. Ho letto: ' + chiSono); process.exit(2); }
  if (!fs.existsSync(TARA)) { console.error('manca la taratura: esegui prima  node strumenti/pollici.js --taratura'); process.exit(2); }
  const T = JSON.parse(fs.readFileSync(TARA, 'utf8'));
  const versoPannello = (cx, cy) => ({ px: T.indietro.a * cx + T.indietro.b * cy + T.indietro.c, py: T.indietro.d * cx + T.indietro.e * cy + T.indietro.f });

  console.log('=== L0.3 — IL BORDO DESTRO E IL GESTO INDIETRO, SUL TELEFONO VERO ===\n');
  const nav = sh('shell', 'settings', 'get', 'secure', 'navigation_mode').trim();
  console.log(`  navigation_mode = ${nav}  (0 = tre tasti, 1 = due tasti, 2 = GESTI)`);
  if (nav !== '2') console.log('  ATTENZIONE: senza navigatore a gesti il gesto «indietro» dal bordo non esiste,\n  e questa misura non puo\' riprodurre l\'accusa.');
  const vers = sh('shell', 'dumpsys', 'package', PACCHETTO).match(/versionName=(\S+)/);
  console.log(`  pacchetto installato: ${PACCHETTO}  ${vers ? vers[1] : '(versione ignota)'}`);

  /* IL FILO SI PUO' RIANNODARE, e deve. Il gesto rubato dal FONDO manda
     l'applicazione in secondo piano, e quando torna Android puo' aver
     ricostruito l'attivita': la WebView e' un'altra, il bersaglio DevTools
     di prima non esiste piu' e ogni Runtime.evaluate torna «undefined»
     per sempre. Una prima stesura lo scambiava per «l'applicazione non
     torna davanti» e si fermava a meta' misura con il telefono che invece
     mostrava il gioco. Quindi il collegamento e' una funzione, non due
     righe, e si puo' rifare da capo. */
  async function connetti(riavvia) {
    if (riavvia) { sh('shell', 'am', 'force-stop', PACCHETTO); sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`); await pausa(2600); }
    const u = sh('shell', 'cat', '/proc/net/unix');
    const pr = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
    if (!pr) return null;
    try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
    sh('forward', 'tcp:9222', 'localabstract:' + pr);
    await pausa(700);
    let pg = null;
    for (let k = 0; k < 15 && !pg; k++) {
      try { pg = (await (await fetch('http://127.0.0.1:9222/json/list')).json()).find(t => t.type === 'page' && t.webSocketDebuggerUrl); } catch (e) { }
      if (!pg) await pausa(400);
    }
    if (!pg) return null;
    const cc = await apriFilo(pg.webSocketDebuggerUrl);
    for (let i = 0; i < 60; i++) { if (await cc.js('!!window.__test')) break; await pausa(300); }
    if (!await cc.js('!!window.__test')) return null;
    if (!['play', 'kickoff', 'golden', 'goal'].includes(await cc.js('window.__test.state'))) {
      await cc.js(`(()=>{const t=window.__test;t.dismissSplash&&t.dismissSplash();
        try{ if(t.Tut&&t.Tut.active&&t.Tut.finish) t.Tut.finish(true); }catch(e){}
        t.startMatch(1,1,{size:5}); return 1;})()`);
      for (let i = 0; i < 80; i++) { if (await cc.js('window.__test.state') === 'play') break; await pausa(300); }
      await pausa(1000);
    }
    await cc.js(SPIA);
    return cc;
  }

  let c = await connetti(true);
  if (!c) { console.error('nessun filo con la WebView: mi fermo.'); process.exit(2); }
  console.log('  spia sui tocchi: installata');

  const V = JSON.parse(await c.js('JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio})'));
  console.log(`  pagina ${V.w}x${V.h} px CSS a dpr ${V.dpr}   (1 px CSS = 1 dp: width=device-width con scala 1)`);
  if (V.w !== T.viewport.w || V.h !== T.viewport.h) {
    console.error(`  la taratura e' su ${T.viewport.w}x${T.viewport.h}: rifare  node strumenti/pollici.js --taratura`);
    process.exit(2);
  }
  /* gli inserti che il gioco DICHIARA di leggere: se sono tutti a zero
     e non esiste una lettura di env(), il riquadro dei comandi non sa
     nulla dei bordi di sistema. Si legge, non si presume. */
  const INS = await c.js(`(()=>{const d=document.createElement('div');
    d.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(d); const s=getComputedStyle(d);
    const r=[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].map(v=>parseFloat(v)||0);
    d.remove(); return r.join(',');})()`);
  console.log(`  env(safe-area-inset-*) letti dalla pagina: sopra/destra/sotto/sinistra = ${INS} px CSS`);
  const B = JSON.parse(await c.js('JSON.stringify(window.__test.pulsanti(0))'));
  const grande = B[0];
  const PRESA = grande.r + 10;      // il raggio con cui il tocco «prende» il disco (:8869)
  console.log(`  disco grande dichiarato dal gioco: centro (${grande.x}, ${grande.y}) r ${grande.r}  ->  presa ${PRESA} px`);
  console.log(`  la presa arriva a x ${grande.x + PRESA} (${(V.w - grande.x - PRESA).toFixed(0)} px dal bordo destro) e y ${grande.y + PRESA} (${(V.h - grande.y - PRESA).toFixed(0)} px dal fondo)\n`);

  const vetro = new Vetro(adb, dev);
  await pausa(500);

  /* MAI un JSON.parse su cio' che torna dal filo senza rete: se il
     bersaglio DevTools e' morto a meta' gesto la risposta e' «undefined»,
     e una misura che si schianta li' butta via tutto il braccio. Si
     restituisce un valore neutro e la prova si rifa'. */
  const leggi = async () => {
    const s = await c.js('JSON.stringify({pausa:!!window.__test.paused,scena:window.__test.state})');
    try { return JSON.parse(s); } catch (e) { return { pausa: null, scena: null, morto: true }; }
  };
  const sPausa = async (v) => { await c.js(`(()=>{const t=window.__test; if(!!t.paused!==${v}) (window.__indietro?window.__indietro():0); return 1;})()`); };

  /* un trascinamento partendo da (x0,y0) in px CSS. dir = -1 verso
     sinistra (il gesto «indietro» dal bordo destro), oppure 'su' verso
     l'alto (il gesto «home» dalla striscia in fondo). */
  async function trascina(x0, y0, verso = 'sx') {
    await c.js('window.__spiaL03 && (window.__spiaL03.eventi.length=0); 1');
    const st0 = await leggi();
    const p0 = versoPannello(x0, y0);
    vetro.giu(0, p0.px, p0.py);
    await pausa(45);
    for (let i = 1; i <= 10; i++) {
      const p = verso === 'su' ? versoPannello(x0, y0 - 11 * i) : versoPannello(x0 - 11 * i, y0);
      vetro.muovi(0, p.px, p.py);
      await pausa(16);
    }
    await pausa(110);
    vetro.su(0);
    await pausa(450);
    let ev = [];
    try { ev = JSON.parse(await c.js('JSON.stringify(window.__spiaL03 ? window.__spiaL03.eventi : [])') || '[]'); } catch (e) { ev = null; }
    const st1 = await leggi();
    /* SE IL FILO E' MORTO NON SO COSA E' ARRIVATO ALLA PAGINA, e non ho
       il diritto di chiamarlo «rubato»: la prova si annulla e si rifa'. */
    if (ev === null || st1.morto) return { nulla: true };
    const n = t => ev.filter(e => e.tipo === t).length;
    const rubato = n('touchstart') === 0 || n('touchcancel') > 0;
    return { rubato, start: n('touchstart'), move: n('touchmove'), end: n('touchend'), cancel: n('touchcancel'), pausaCambiata: st0.pausa !== st1.pausa, st1 };
  }

  /* IL RIENTRO, e perche' senza di esso la misura si avvelena da sola.
     Il gesto rubato dal FONDO e' «home»: manda l'applicazione in secondo
     piano. Da quell'istante nessun tocco arriva piu' alla pagina — e le
     prove successive, comprese quelle del braccio di CONTROLLO, uscirebbero
     tutte «rubate» per un motivo che non c'entra col bordo. Misurato:
     una prima stesura senza rientro ha dato controllo 20/20 «rubato»
     invece di 0/20. Quindi prima di ogni prova si guarda se la pagina e'
     visibile, e se non lo e' si riporta l'applicazione davanti. */
  async function rientra() {
    for (let k = 0; k < 12; k++) {
      /* prima si guarda se il FILO e' vivo: un bersaglio DevTools morto
         risponde «undefined» a tutto, e scambiarlo per «applicazione in
         secondo piano» avvelena la misura invece di ripararla */
      if (await c.js('1+1') !== 2) {
        if (bandiera('chiacchiera')) console.log(`      [rientro ${k}] il filo e' morto: lo riannodo`);
        try { c.chiudi(); } catch (e) { }
        const n = await connetti(false);
        if (n) { c = n; continue; }
        await pausa(800); continue;
      }
      const vis = await c.js('document.visibilityState');
      if (bandiera('chiacchiera')) console.log(`      [rientro ${k}] visibilityState = ${vis}`);
      if (vis === 'visible') {
        /* e la partita dev'essere ancora in piedi: i comandi esistono solo
           in partita, e una prova fatta al menu non misura niente */
        const sc = await c.js('window.__test && window.__test.state');
        if (!['play', 'kickoff', 'golden', 'goal'].includes(sc)) {
          await c.js(`(()=>{const t=window.__test;t.startMatch(1,1,{size:5});return 1;})()`);
          await pausa(1400);
        }
        return true;
      }
      /* IL RIENTRO A TRE GRADINI, e ognuno cura un guasto diverso che ho
         visto davvero su questo telefono.
         1. `am start` con MAIN/LAUNCHER RIPRENDE il compito che c'e' gia'
            invece di impilare una seconda copia: partita e filo restano.
         2. Ma il trascinamento dal fondo, tenuto giu' un decimo di
            secondo prima di alzarsi, non e' «home»: e' «home e tieni»,
            cioe' la PANORAMICA DEI RECENTI. Li' l'applicazione si vede ma
            e' in pausa — visibilityState resta «hidden» e `am start` non
            la scioglie. Misurato: dodici tentativi di fila tutti hidden
            con il gioco a fuoco secondo dumpsys. Il tasto HOME la scioglie.
         3. Se dopo sei tentativi siamo ancora fuori, si riparte da zero:
            meglio una partita nuova che una misura sporca. */
      if (k >= 1) { sh('shell', 'input', 'keyevent', '3'); await pausa(600); }
      if (k >= 6) {
        try { c.chiudi(); } catch (e) { }
        const n = await connetti(true);
        if (n) { c = n; continue; }
      }
      sh('shell', 'am', 'start', '-a', 'android.intent.action.MAIN',
        '-c', 'android.intent.category.LAUNCHER', '-n', `${PACCHETTO}/${ATTIVITA}`);
      await pausa(900);
    }
    return false;
  }

  async function braccio(nome, x0, y0, quante, verso = 'sx') {
    const r = [];
    let nulle = 0;
    for (let i = 0; i < quante; i++) {
      if (!await rientra()) { console.error('  l\'applicazione non torna davanti: mi fermo.'); process.exit(2); }
      await sPausa(false);
      await pausa(250);
      const q = await trascina(x0, y0, verso);
      if (q.nulla) {
        /* prova NULLA, non «rubata»: il filo e' caduto e non so cosa sia
           arrivato. Si rifa'. Il conto delle nulle si dichiara in fondo:
           un referto che non dice quante prove ha buttato non e' un referto. */
        nulle++; i--;
        if (nulle > quante) { console.error('  troppe prove nulle: il banco non regge, mi fermo.'); process.exit(2); }
        console.log(`  ${nome}  (prova nulla: filo caduto, la rifaccio)`);
        continue;
      }
      r.push(q);
      console.log(`  ${nome}  prova ${String(i + 1).padStart(2)}   start ${q.start} move ${String(q.move).padStart(2)} end ${q.end} cancel ${q.cancel}` +
        `   pausa scattata: ${q.pausaCambiata ? 'SI' : 'no'}   -> ${q.rubato ? 'RUBATO' : 'arrivato'}`);
    }
    if (nulle) console.log(`  ${nome}  prove nulle rifatte: ${nulle}`);
    r.nulle = nulle;
    return r;
  }

  /* la scaldata: in immersivo appiccicoso la primissima strisciata dal
     bordo puo' servire solo a far riapparire le barre di sistema. Non
     entra nel conto, e lo dico invece di nasconderlo. */
  const XB = V.w - 16, YB = grande.y;      // dentro la presa (d=48<=50) e a 16 px dal bordo
  console.log('  (scaldata, fuori conteggio)');
  await trascina(XB, YB);
  await pausa(600);

  if (bandiera('sweep')) {
    console.log('\n--- QUANTO E\' LARGA LA FASCIA: 6 prove per ogni distanza dal bordo ---\n');
    for (const d of String(arg('dist', '4,10,16,22,28,40,64')).split(',').map(Number)) {
      const r = await braccio(`bordo-${String(d).padStart(2)}`, V.w - d, YB, 6);
      console.log(`     distanza ${d} px dal bordo: RUBATI ${r.filter(x => x.rubato).length}/6\n`);
    }
    vetro.chiudi(); c.chiudi(); return;
  }

  console.log(`\n--- BRACCIO A: punto FISSO a 16 px dal bordo destro (${XB}, ${YB}) ---`);
  console.log('    Non si muove con la toppa: misura se il SISTEMA cede quella striscia.\n');
  const A = await braccio('bordo ', XB, YB, PROVE);
  /* IL BRACCIO CHE SEGUE LA PRESA. Il punto fisso qui sopra risponde a
     «il sistema mi lascia i tocchi la'?»; questo risponde alla domanda
     dell'accusa, che e' un'altra: «la PRESA del disco, dovunque sia
     finita, sta in un posto dove il dito viene ascoltato?». Prima della
     toppa i due punti quasi coincidono (la presa arriva a 14 px dal
     bordo); dopo, questo si sposta col disco e l'altro no — ed e'
     esattamente la differenza che separa il merito della toppa nel gioco
     da quello dell'esclusione nel guscio Java. */
  const XP = grande.x + PRESA - 2;
  console.log(`\n--- BRACCIO P: il punto piu' esterno della PRESA (${XP}, ${YB}), ${(V.w - XP).toFixed(0)} px dal bordo ---\n`);
  const P = await braccio('presa ', XP, YB, PROVE);
  console.log(`\n--- BRACCIO B: FONDO, il punto piu' basso della presa (${grande.x}, ${grande.y + PRESA}), trascinato in su ---\n`);
  const F = await braccio('fondo ', grande.x, grande.y + PRESA, PROVE, 'su');
  console.log(`\n--- BRACCIO DI CONTROLLO: stesso gesto dal CENTRO del disco (${grande.x}, ${grande.y}), 64 px dal bordo ---\n`);
  const C = await braccio('centro', grande.x, grande.y, PROVE);
  vetro.chiudi();

  const rub = r => r.filter(x => x.rubato).length;
  const pau = r => r.filter(x => x.pausaCambiata).length;
  console.log('\n--- MISURA ---');
  console.log(`  BORDO   (punto fisso a 16 px dal bordo):     RUBATI ${rub(A)} su ${A.length}   ·   pausa scattata da sola ${pau(A)} volte`);
  console.log(`  PRESA   (bordo esterno della presa, ${(V.w - XP).toFixed(0)} px):   RUBATI ${rub(P)} su ${P.length}   ·   pausa scattata da sola ${pau(P)} volte`);
  console.log(`  FONDO   (punto piu' basso della presa, ${(V.h - grande.y - PRESA).toFixed(0)} px): RUBATI ${rub(F)} su ${F.length}`);
  console.log(`  CONTROLLO (centro del disco, ${(V.w - grande.x).toFixed(0)} px dal bordo): RUBATI ${rub(C)} su ${C.length}   ·   pausa scattata da sola ${pau(C)} volte`);
  console.log(`  prove NULLE buttate e rifatte (filo caduto): ${A.nulle + P.nulle + F.nulle + C.nulle}`);
  if (vetro.err.trim()) console.log(`  rumore dal canale di ingresso: ${vetro.rotture} riallineamenti · ${vetro.err.trim().slice(0, 200)}`);
  console.log('\n--- VERDETTO ---');
  if (rub(C) > 0) console.log('  IL CONTROLLO NON TIENE: il tocco sparisce anche lontano dal bordo. La colpa non e\'\n  dimostrata del bordo, e questa misura non dice niente. Riparare prima il banco.');
  else if (rub(P) === 0 && rub(A) === 0 && rub(F) === 0) console.log('  L\'ACCUSA NON SI RIPRODUCE su questo telefono, con questa navigazione, oggi.');
  else console.log(`  L'ACCUSA SI RIPRODUCE: presa ${rub(P)}/${P.length}, punto fisso ${rub(A)}/${A.length}, fondo ${rub(F)}/${F.length}, contro ${rub(C)}/${C.length} dal centro.`);
  c.chiudi();
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
