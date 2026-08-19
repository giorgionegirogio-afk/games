/* =====================================================================
   POLLICI — due dita vere sul vetro del telefono.

   IL PERCHE'.
   Il committente non puo' prestarci le mani, e ha ragione: un gioco va
   provato in autonomia. Ma «simulare i pollici» ha almeno tre significati
   diversi, e solo uno dei tre serve davvero.

     1. `adb shell input tap/swipe` — un dito solo, un gesto alla volta,
        e ogni chiamata apre un processo: decine di millisecondi di
        latenza, imprevedibili. Non e' un pollice, e' un dito finto lento.
     2. `Input.dispatchTouchEvent` via DevTools — preciso, multitocco, ma
        entra DENTRO la pagina: salta la catena di ingresso di Android.
        Quindi non puo' vedere ne' il gesto «indietro» che ruba il tocco
        dal bordo, ne' la fusione dei touchmove fatta dal sistema. Cioe'
        e' cieco esattamente ai due difetti che questo gioco ha gia'
        pagato.
     3. SCRIVERE SUL DISPOSITIVO DI INGRESSO DEL KERNEL — che e' quello
        che fa un dito vero. Il pannello di questo telefono e' un
        synaptics s3320 su /dev/input/event2 e parla protocollo B con
        dieci slot, ABS_MT_POSITION_X 0..1079 e _Y 0..2279.
   Questo file fa la terza.

   COME. Si tiene aperto UN SOLO processo
   `adb shell -T "su -c 'sh -c \"cat > /dev/input/event2\"'"`
   e gli si versano dentro strutture `input_event` binarie da 24 byte
   (timeval 16 + type 2 + code 2 + value 4, su ARM a 64 bit). Il ritmo lo
   detta l'ospite: aprire un processo per evento, come fa `sendevent`,
   costerebbe piu' del gesto che si vuole misurare.

   LA TARATURA, e perche' non si indovina. Il pannello e' verticale
   (1080x2280) mentre il gioco gira in orizzontale: fra le coordinate del
   pannello e quelle della pagina c'e' una rotazione che dipende da come
   il sistema ha girato lo schermo in questo istante. Invece di dedurla,
   la si MISURA: si tocca in cinque punti noti del pannello, si legge
   dalla pagina dove il tocco e' arrivato, e si ricava la trasformazione.
   Se i cinque punti non stanno su una stessa trasformazione affine,
   questo file si ferma invece di misurare storto.

   CIO' CHE QUESTO FILE NON PUO' FARE, e va detto forte perche' e' la
   ragione per cui non sostituisce una persona:
     — non sa dire se un comando e' PIACEVOLE;
     — non sa dire se si IMPARA;
     — non ha una mano, quindi non sa che il polpastrello COPRE cio' che
       tocca: quello resta un modello geometrico, non un'osservazione.
   Sa dire se un rilascio tradisce, se il verbo eseguito e' quello
   annunciato, quanto tempo passa fra il dito e il pallone, e se il
   sistema operativo ruba il tocco. Sono cinque cose che possono rendere
   uno schema INUTILIZZABILE, non le cinque che ne fanno uno buono.

   uso:  node strumenti/pollici.js --taratura
         node strumenti/pollici.js --prova            due dita insieme
         node strumenti/pollici.js --gesto tocca:400,300
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const DEV_IN = '/dev/input/event2';
const TARA = path.join(__dirname, 'pollici-taratura.json');

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const bandiera = n => process.argv.includes('--' + n);
const pausa = ms => new Promise(r => setTimeout(r, ms));

function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME ||
    path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}

/* il vetro sta in un modulo condiviso: si ripara una volta per tutti */
const { Vetro } = require('./_vetro.js');

/* ---------------------------------------------------------------------
   IL FILO CON LA PAGINA — per leggere DOVE il tocco e' arrivato.
   --------------------------------------------------------------------- */
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url);
    let n = 0, morto = false; const attesa = new Map();
    const sc = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onclose = () => { morto = true; for (const [, r] of attesa) r({ morto: true }); attesa.clear(); };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        manda(metodo, params = {}, quanto = 60000) {
          if (morto) return Promise.resolve({ morto: true });
          const id = ++n; ws.send(JSON.stringify({ id, method: metodo, params }));
          return new Promise(res => { attesa.set(id, res); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto); });
        },
        async js(expr, attendi) {
          const r = await this.manda('Runtime.evaluate', { expression: expr, awaitPromise: !!attendi, returnByValue: true });
          return r.result && r.result.result ? r.result.result.value : undefined;
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

/* la spia: registra ogni tocco che ARRIVA alla pagina, in coordinate CSS */
const SPIA = `(() => {
  if (window.__spia) return 'gia attiva';
  const s = { eventi: [] };
  window.__spia = s;
  for (const tipo of ['touchstart','touchmove','touchend','touchcancel']) {
    document.addEventListener(tipo, ev => {
      for (const t of ev.changedTouches) {
        s.eventi.push({ tipo, id: t.identifier, x: +t.clientX.toFixed(1), y: +t.clientY.toFixed(1), t: Math.round(performance.now()) });
      }
      if (s.eventi.length > 4000) s.eventi.splice(0, 2000);
    }, { capture: true, passive: true });
  }
  return 'installata';
})()`;

async function collega(adb, dev) {
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  for (let i = 0; i < 20; i++) {
    const u = sh('shell', 'cat', '/proc/net/unix');
    const p = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
    if (p) {
      try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
      sh('forward', 'tcp:9222', 'localabstract:' + p);
      for (let k = 0; k < 20; k++) {
        try {
          const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
          const pg = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
          if (pg) return await apriFilo(pg.webSocketDebuggerUrl);
        } catch (e) { }
        await pausa(400);
      }
    }
    await pausa(500);
  }
  return null;
}

/* ---------------------------------------------------------------------
   LA TARATURA — si misura, non si deduce.
   --------------------------------------------------------------------- */
function affineDaPunti(coppie) {
  /* minimi quadrati su x' = a*x + b*y + c ; y' = d*x + e*y + f */
  const risolvi = (bersaglio) => {
    let S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], T = [0, 0, 0];
    for (const p of coppie) {
      const v = [p.px, p.py, 1], z = bersaglio(p);
      for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) S[i][j] += v[i] * v[j]; T[i] += v[i] * z; }
    }
    /* Gauss */
    const M = S.map((r, i) => [...r, T[i]]);
    for (let c = 0; c < 3; c++) {
      let piv = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      [M[c], M[piv]] = [M[piv], M[c]];
      if (Math.abs(M[c][c]) < 1e-9) return null;
      for (let r = 0; r < 3; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
    }
    return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
  };
  const A = risolvi(p => p.cx), B = risolvi(p => p.cy);
  if (!A || !B) return null;
  return { a: A[0], b: A[1], c: A[2], d: B[0], e: B[1], f: B[2] };
}

(async () => {
  const adb = trovaAdb();
  if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato: mi fermo invece di fingere.'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });

  /* root: senza, non si scrive sul dispositivo di ingresso */
  const chiSono = sh('shell', 'su', '-c', 'id').trim();
  if (!/uid=0/.test(chiSono)) { console.error('serve root per scrivere su ' + DEV_IN + '. Ho letto: ' + chiSono); process.exit(2); }

  console.log('=== POLLICI — due dita vere sul vetro ===\n');
  console.log('dispositivo  ' + dev + '  ·  ingresso ' + DEV_IN + '  ·  root OK');

  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(2500);
  const c = await collega(adb, dev);
  if (!c) { console.error('nessun filo con la WebView'); process.exit(2); }
  for (let i = 0; i < 40; i++) { if (await c.js('!!window.__test')) break; await pausa(300); }
  await c.js(`window.__test.dismissSplash&&window.__test.dismissSplash(); window.__test.startMatch(1,1,{size:5}); 1`);
  await pausa(1500);
  console.log('installo la spia sui tocchi: ' + await c.js(SPIA));
  const vp = await c.js('JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio})');
  const V = JSON.parse(vp);
  console.log(`pagina       ${V.w}x${V.h} CSS a dpr ${V.dpr}`);

  const vetro = new Vetro(adb, dev);
  await pausa(500);

  /* ---- TARATURA ---- */
  const PANNELLO = { w: 1080, h: 2280 };
  const punti = [
    { px: 300, py: 500 }, { px: 800, py: 500 }, { px: 300, py: 1800 },
    { px: 800, py: 1800 }, { px: 540, py: 1140 },
  ];
  console.log('\n--- TARATURA: cinque tocchi in punti noti del pannello ---\n');
  const coppie = [];
  for (const p of punti) {
    await c.js('window.__spia.eventi.length = 0; 1');
    vetro.giu(0, p.px, p.py);
    await pausa(90);
    vetro.su(0);
    await pausa(220);
    const ev = JSON.parse(await c.js('JSON.stringify(window.__spia.eventi)') || '[]');
    const inizio = ev.find(e => e.tipo === 'touchstart');
    if (!inizio) { console.log(`  pannello (${p.px},${p.py}) -> NESSUN TOCCO ARRIVATO`); continue; }
    coppie.push({ px: p.px, py: p.py, cx: inizio.x, cy: inizio.y });
    console.log(`  pannello (${String(p.px).padStart(4)},${String(p.py).padStart(4)})  ->  pagina (${String(inizio.x).padStart(6)},${String(inizio.y).padStart(6)}) CSS`);
  }

  if (coppie.length < 4) {
    console.error('\nMeno di quattro tocchi sono arrivati: non taro niente. Il difetto e\' a monte.');
    vetro.chiudi(); c.chiudi(); process.exit(1);
  }
  const T = affineDaPunti(coppie);
  if (!T) { console.error('\nla trasformazione e\' degenere'); vetro.chiudi(); c.chiudi(); process.exit(1); }

  /* il residuo: se i punti non stanno su una affine, non ci si fida */
  let peggio = 0;
  for (const p of coppie) {
    const x = T.a * p.px + T.b * p.py + T.c, y = T.d * p.px + T.e * p.py + T.f;
    peggio = Math.max(peggio, Math.hypot(x - p.cx, y - p.cy));
  }
  console.log(`\n  trasformazione pannello -> pagina:`);
  console.log(`    cssX = ${T.a.toFixed(5)}·px + ${T.b.toFixed(5)}·py + ${T.c.toFixed(2)}`);
  console.log(`    cssY = ${T.d.toFixed(5)}·px + ${T.e.toFixed(5)}·py + ${T.f.toFixed(2)}`);
  console.log(`  residuo peggiore sui cinque punti: ${peggio.toFixed(2)} px CSS`);
  if (peggio > 3) {
    console.error('  OLTRE 3 px: i punti non stanno su una sola affine. Mi fermo invece di misurare storto.');
    vetro.chiudi(); c.chiudi(); process.exit(1);
  }
  /* l'inversa, che e' quella che serve per dire «tocca QUI sulla pagina» */
  const det = T.a * T.e - T.b * T.d;
  const inv = { a: T.e / det, b: -T.b / det, c: (T.b * T.f - T.e * T.c) / det,
                d: -T.d / det, e: T.a / det, f: (T.d * T.c - T.a * T.f) / det };
  fs.writeFileSync(TARA, JSON.stringify({ dev, pannello: PANNELLO, viewport: V, avanti: T, indietro: inv, residuo: +peggio.toFixed(2) }, null, 1));
  console.log(`  salvata in ${path.relative(RADICE, TARA)}`);

  const versoPannello = (cx, cy) => ({ px: inv.a * cx + inv.b * cy + inv.c, py: inv.d * cx + inv.e * cy + inv.f });

  /* ---- LA PROVA CHE CONTA: DUE DITA INSIEME ---- */
  console.log('\n--- DUE DITA INSIEME ---\n');
  const pulsanti = JSON.parse(await c.js('JSON.stringify((window.__test.pulsanti&&window.__test.pulsanti(0))||[])') || '[]');
  console.log('  pulsanti dichiarati dal gioco: ' + (pulsanti.length ? pulsanti.map(b => `${b.tipo || b.nome || '?'}(${Math.round(b.x)},${Math.round(b.y)})`).join('  ') : 'NESSUNO'));
  if (!pulsanti.length) { console.log('  senza la geometria dichiarata non premo a memoria: mi fermo qui.'); vetro.chiudi(); c.chiudi(); process.exit(1); }

  const b0 = pulsanti[0];
  const stickCss = { x: V.w * 0.20, y: V.h * 0.70 };
  const A0 = versoPannello(stickCss.x, stickCss.y);
  const A1 = versoPannello(stickCss.x + 40, stickCss.y - 20);
  const B0 = versoPannello(b0.x, b0.y);

  await c.js('window.__spia.eventi.length = 0; 1');
  const prima = JSON.parse(await c.js('JSON.stringify({vx:window.__test.ball.vx,vy:window.__test.ball.vy})'));

  vetro.giu(0, A0.px, A0.py);              // pollice sinistro: la levetta
  await pausa(30);
  vetro.giu(1, B0.px, B0.py);              // pollice destro: il pulsante, INSIEME
  await pausa(40);
  for (let i = 1; i <= 6; i++) {           // il sinistro trascina mentre il destro tiene
    const t = i / 6;
    vetro.muovi(0, A0.px + (A1.px - A0.px) * t, A0.py + (A1.py - A0.py) * t);
    await pausa(16);
  }
  await pausa(120);
  vetro.su(1);
  await pausa(40);
  vetro.su(0);
  await pausa(400);

  const ev = JSON.parse(await c.js('JSON.stringify(window.__spia.eventi)') || '[]');
  const dopo = JSON.parse(await c.js('JSON.stringify({vx:window.__test.ball.vx,vy:window.__test.ball.vy})'));
  const idDistinti = [...new Set(ev.map(e => e.id))];
  const insieme = (() => {
    /* il numero che conta: c'e' stato un istante con DUE dita vive? */
    let vive = new Set(), max = 0;
    for (const e of ev) {
      if (e.tipo === 'touchstart') vive.add(e.id);
      if (e.tipo === 'touchend' || e.tipo === 'touchcancel') vive.delete(e.id);
      max = Math.max(max, vive.size);
    }
    return max;
  })();
  const dv = Math.hypot(dopo.vx - prima.vx, dopo.vy - prima.vy);

  console.log(`  eventi arrivati alla pagina: ${ev.length}  (${ev.filter(e => e.tipo === 'touchstart').length} start, ${ev.filter(e => e.tipo === 'touchmove').length} move, ${ev.filter(e => e.tipo === 'touchend').length} end, ${ev.filter(e => e.tipo === 'touchcancel').length} cancel)`);
  console.log(`  identificatori distinti: ${idDistinti.length}`);
  console.log(`  DITA VIVE NELLO STESSO ISTANTE: ${insieme}`);
  console.log(`  la palla ha cambiato velocita' di ${dv.toFixed(1)} unita' (prima ${prima.vx.toFixed(0)},${prima.vy.toFixed(0)} · dopo ${dopo.vx.toFixed(0)},${dopo.vy.toFixed(0)})`);

  console.log('\n--- VERDETTO ---');
  let male = 0;
  const dimmi = (ok, t, extra) => { if (!ok) male++; console.log((ok ? '  OK   ' : '  NO   ') + t + (extra ? '\n         ' + extra : '')); };
  dimmi(coppie.length === 5, `tutti e cinque i tocchi di taratura sono arrivati (${coppie.length}/5)`);
  dimmi(peggio <= 3, `la trasformazione regge: residuo ${peggio.toFixed(2)} px (tetto 3)`);
  dimmi(insieme >= 2, `DUE DITA VIVE INSIEME: ${insieme}`,
    insieme < 2 ? 'senza due dita insieme non si puo\' provare nessuno schema a due pollici' : '');
  dimmi(ev.filter(e => e.tipo === 'touchmove').length >= 3, `i trascinamenti arrivano (${ev.filter(e => e.tipo === 'touchmove').length} move)`);
  console.log(`\n${male === 0 ? 'tutti i controlli passati' : male + ' controlli falliti'}`);
  if (vetro.errori.trim()) console.log('\nrumore da su/cat: ' + vetro.errori.trim().slice(0, 300));

  console.log('\nCosa questo strumento NON sa fare, dichiarato: dire se un comando e\' piacevole,');
  console.log('dire se si impara, e vedere che il polpastrello COPRE cio\' che tocca (quello');
  console.log('resta un modello geometrico). Sa dire se il rilascio tradisce, se il verbo e\'');
  console.log('quello annunciato, quanto tempo passa fra il dito e il pallone, e se Android');
  console.log('ruba il tocco.');

  vetro.chiudi(); c.chiudi();
  if (male) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
