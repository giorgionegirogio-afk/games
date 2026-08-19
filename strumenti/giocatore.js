/* =====================================================================
   GIOCATORE — una partita giocata davvero, con due pollici veri.

   IL PERCHE'.
   Il committente ha chiesto una prova prima di dare il via: che il gioco
   si possa giocare in autonomia, muovendo i giocatori, passando e
   provando a segnare. E ha ragione a chiederla, perche' «so simulare un
   tocco» e «so giocare una partita» sono due cose diverse: la prima e'
   un evento, la seconda e' un anello chiuso fra ciò che vedo e ciò che
   faccio, sessanta volte al secondo.

   LA REGOLA CHE RENDE LA PROVA UNA PROVA: questo file NON chiama mai una
   funzione del gioco per agire. Legge lo stato — cosa che un occhio
   umano farebbe guardando lo schermo — e poi agisce SOLO scrivendo sul
   dispositivo di ingresso del kernel, come un dito. Se agisse chiamando
   `__test.startCharge()` proverebbe che so chiamare una funzione, che non
   e' quello che serve sapere.

   COME MUOVE. Il pollice sinistro si appoggia e RESTA GIU' per tutta la
   partita, trascinando nella direzione voluta: e' esattamente come il
   committente ha descritto la levetta. Il destro va e viene sui due
   pulsanti.

   LA STRATEGIA E' VOLUTAMENTE SEMPLICE, e non e' pigrizia: se una
   strategia stupida riesce a segnare, i comandi sono usabili. Se anche
   una raffinata non ci riesce, il problema non sono i comandi. Non
   giudica il gioco: misura se il gioco RISPONDE.

   COSA NON PROVA, dichiarato: che i comandi siano piacevoli, e che si
   imparino. Nessuna macchina lo sa dire.

   uso:  node strumenti/giocatore.js
         node strumenti/giocatore.js --sec 90 --taglia 5
         node strumenti/giocatore.js --video fuori/partita.mp4
         node strumenti/giocatore.js --inerte      i pollici non toccano
                                                   (il controllo: deve
                                                    andare molto peggio)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const DEV_IN = '/dev/input/event2';
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

/* il vetro sta in un modulo condiviso: si ripara una volta per tutti */
const { Vetro } = require('./_vetro.js');
/* il filo di protocollo, a portata di chi ripulisce dopo un guasto */
let FILO = null;

/* --- il filo con la pagina, per LEGGERE (mai per agire) --- */
function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url); let n = 0, morto = false; const att = new Map();
    const sc = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onclose = () => { morto = true; for (const [, r] of att) r({ morto: true }); att.clear(); };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        get morto() { return morto; },
        manda(m, p = {}, q = 60000) { if (morto) return Promise.resolve({ morto: true }); const id = ++n; try { ws.send(JSON.stringify({ id, method: m, params: p })); } catch (e) { return Promise.resolve({ morto: true }); } return new Promise(r => { att.set(id, r); setTimeout(() => { if (att.has(id)) { att.delete(id); r({ scaduto: true }); } }, q); }); },
        async js(e) { const r = await this.manda('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

/* Lo STATO, letto in una sola andata: un viaggio di protocollo per
   fotogramma e' gia' tanto; due sarebbero rumore sulla misura. */
const LEGGI = `(()=>{const t=window.__test;if(!t||!t.G)return null;const G=t.G,v=t.view,b=t.ball;
const me=G.ctrl&&G.ctrl[0]>=0?t.players[G.ctrl[0]]:null;
return JSON.stringify({
 stato:t.state, punti:t.score, resta:t.timeLeft,
 v:{Ax:v.Ax,Ay:v.Ay,S2:v.S2},
 c:t.campo,
 b:{x:b.x,y:b.y,vx:b.vx,vy:b.vy,z:b.z,own:b.owner,passTo:b.passTo,tiroT:b.tiroT},
 io: me?{x:me.x,y:me.y,idx:me.idx,num:me.numero,fx:me.fx,fy:me.fy}:null,
 g: t.players.map(p=>({t:p.team,i:p.idx,x:p.x,y:p.y,r:p.role,o:p.out|0})),
 btn: (typeof t.pulsanti==='function')?t.pulsanti(0):null,
 dip: Array.isArray(t.comandiTouch)?t.comandiTouch.filter(z=>z.tipo==='pulsante'&&(z.team|0)===0).map(z=>({act:z.act,x:z.x,y:z.y,r:z.r,pr:!!z.premuto,al:z.alpha})):null
});})()`;

const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length ? (o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2) : 0; };

(async () => {
  const SEC = +arg('sec', 60);
  const TAGLIA = +arg('taglia', 5);
  const VIDEO = arg('video', '');
  const INERTE = bandiera('inerte');
  /* --indietro N: ogni N secondi si preme due volte il tasto INDIETRO di
     Android — pausa e ripresa — SENZA che il pollice si alzi mai.
     Esiste perche' tre sonde dedicate hanno fallito nel misurare la stessa
     cosa, e ognuna delle tre falliva per un difetto suo: il tocco fuso col
     trascinamento, il tutorial che si mangia i tocchi, il dito tenuto
     immobile dove una mano vera trema. Questo giro invece funziona — ha
     giocato partite intere, segnato gol — quindi la misura si appende a
     lui invece di costruirne una quarta.
     Il numero da guardare e' la DISTANZA PERCORSA dal comandato: se dopo
     ogni pausa il pollice muore, quella distanza crolla. */
  const INDIETRO = +arg('indietro', 0);

  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });

  if (!fs.existsSync(TARA)) { console.error('manca la taratura: esegui prima  node strumenti/pollici.js'); process.exit(2); }
  const T = JSON.parse(fs.readFileSync(TARA, 'utf8'));
  const versoPannello = (cx, cy) => ({ px: T.indietro.a * cx + T.indietro.b * cy + T.indietro.c, py: T.indietro.d * cx + T.indietro.e * cy + T.indietro.f });

  console.log('=== GIOCATORE — una partita con due pollici veri ===\n');
  console.log(`dispositivo ${dev} · ${SEC} s · ${TAGLIA} contro ${TAGLIA}` + (INERTE ? ' · POLLICI INERTI (controllo)' : ''));

  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(2600);
  const u = sh('shell', 'cat', '/proc/net/unix');
  const presa = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
  if (!presa) { console.error('la WebView non espone il socket di debug'); process.exit(2); }
  try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
  sh('forward', 'tcp:9222', 'localabstract:' + presa);
  await pausa(600);
  const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const c = await apriFilo(l.find(t => t.type === 'page').webSocketDebuggerUrl);
  FILO = c;                          // BANCO ONESTO: nessun ripiego muto: lo chiude anche chi muore male
  for (let i = 0; i < 50; i++) { if (await c.js('!!window.__test')) break; await pausa(300); }
  await c.js(`window.__test.dismissSplash&&window.__test.dismissSplash();window.__test.startMatch(1,1,{size:${TAGLIA}});1`);
  await pausa(2200);

  /* --- il video, se richiesto: e' la prova che si guarda --- */
  let rec = null;
  if (VIDEO) {
    sh('shell', 'rm', '-f', '/sdcard/_partita.mp4');
    rec = spawn(adb, ['-s', dev, 'shell', 'screenrecord', '--bit-rate', '6000000', '--time-limit', String(Math.min(180, SEC + 8)), '/sdcard/_partita.mp4'], { stdio: 'ignore' });
    await pausa(1200);
  }

  const vetro = new Vetro(adb, dev);
  await pausa(400);
  /* ===================================================================
     LE DITA SI ALZANO SEMPRE. BANCO ONESTO: nessun ripiego muto.

     Il pollice sinistro si appoggia sul vetro venti righe piu' in giu' e
     NON SI ALZA PIU' per tutta la partita (e' la levetta). Qualunque
     uscita che salti le due righe di chiusura lascia un TOCCO FANTASMA
     sullo schermo del telefono del committente, e il socket del vetro
     aperto: il telefono resta con un dito premuto finche' qualcuno non
     se ne accorge. Nella prima edizione di questa toppa il controllo dei
     pulsanti usciva con process.exit(2) da dentro il giro, cioe' faceva
     esattamente questo. Adesso non esce nessuno da dentro il giro: si
     lancia, e il finally alza le dita.

     E NON BASTA CHIAMARE su() E CHIUDERE. Vetro.w() mette i gruppi in
     una CODA che si versa uno ogni 3 ms (vedi _vetro.js): chiudere
     subito dopo un su() butta via il "dito su" che non e' ancora
     passato per stdin. Qui si aspetta che la coda sia davvero vuota. */
  let smontato = false;
  const smonta = async () => {
    if (smontato) return; smontato = true;
    try { vetro.su(1); vetro.su(0); } catch (e) { }
    for (let i = 0; i < 200 && vetro.coda && vetro.coda.length; i++) await pausa(5);
    await pausa(120);                 // l'ultimo gruppo, gia' scritto, deve arrivare
    try { vetro.chiudi(); } catch (e) { }
    await pausa(80);
  };
  /* anche il colpo di Ctrl-C: il telefono non sa che qualcuno ha
     cambiato idea, e il dito resterebbe giu' lo stesso */
  for (const sg of ['SIGINT', 'SIGTERM']) {
    process.once(sg, async () => {
      console.error('\n(' + sg + ": alzo le dita dal vetro e chiudo, poi esco)");
      await smonta();
      try { FILO && FILO.chiudi(); } catch (e) { }
      process.exit(130);
    });
  }

  const S0 = JSON.parse(await c.js(LEGGI) || 'null');
  if (!S0) { console.error('non riesco a leggere lo stato'); await smonta(); try { FILO && FILO.chiudi(); } catch (e) { } process.exit(2); }
  /* BANCO ONESTO: nessun ripiego muto. Senza i pulsanti dichiarati
     questo strumento non ripiega e nemmeno muore di TypeError venti
     righe piu' in giu': lo dice. Con btn = [] i due pollici avrebbero
     premuto un punto qualsiasi e i contatori (tiri, passaggi, cambi,
     contrasti) sarebbero stati un racconto. E le sorgenti sono DUE:
     comandiTouch e' il dipinto, pulsanti(0) il ricalcolo. */
  if (!Array.isArray(S0.btn) || S0.btn.length < 2) {
    console.error("\nBANCO NON VALIDO — __test.pulsanti non c'e' o non dichiara due pulsanti.");
    console.error('Senza la geometria dichiarata i due pollici premerebbero il prato e i contatori');
    console.error('di questa partita sarebbero un racconto. Mi fermo.');
    await smonta(); try { FILO && FILO.chiudi(); } catch (e) { }
    process.exit(2);
  }
  if (!Array.isArray(S0.dip) || S0.dip.length < 2) {
    console.error("\nBANCO NON VALIDO — __test.comandiTouch non dichiara i due comandi dipinti.");
    console.error('Con una sola sorgente non posso accorgermi di un export che mente sempre allo stesso');
    console.error('modo: cinque pixel di bugia costante passerebbero inosservati. Mi fermo.');
    await smonta(); try { FILO && FILO.chiudi(); } catch (e) { }
    process.exit(2);
  }
  const VW = await c.js('innerWidth'), VH = await c.js('innerHeight');
  const CASA = { x: VW * 0.18, y: VH * 0.66 };          // dove si posa il pollice sinistro
  const btnGrande = S0.btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, S0.btn[0]);
  const btnPiccolo = S0.btn.find(b => b !== btnGrande) || btnGrande;
  /* IL CENTRO DI ADESSO, DA DUE SORGENTI. I pulsanti tornano a ogni
     lettura di stato (20 volte al secondo): prima di ogni pressione si
     prende il centro RICALCOLATO e lo si incrocia col centro DIPINTO
     dell'ultimo fotogramma. Se le due non tornano entro 1 px — tolto
     l'affondamento di 2 px del tasto premuto — una delle due mente e non
     si sa quale: non si preme.
     Non si confronta col centro di t=0: quello vedrebbe solo un pulsante
     che si sposta, e uno che si sposta si preme dove sta adesso. */
  const TOLL_INCROCIO = 1, AFFONDAMENTO = 2;
  const centroOra = (St, quale) => {
    const bt = St && St.btn, dp = St && St.dip;
    if (!Array.isArray(bt) || bt.length < 2)
      throw Object.assign(new Error("__test.pulsanti non dichiara piu' due pulsanti: non premo a memoria"), { banco: true });
    if (!Array.isArray(dp) || !dp.length)
      throw Object.assign(new Error("il gioco non sta DIPINGENDO nessun comando (comandiTouch vuoto): premerei un pulsante che non c'e' sullo schermo"), { banco: true });
    const gr = bt.reduce((a, z) => ((z.r || 0) > (a.r || 0) ? z : a), bt[0]);
    const s = quale === 'grande' ? gr : (bt.filter(z => z !== gr)[0] || gr);
    const z = dp.find(q => Math.abs((q.r || 0) - (s.r || 0)) < 0.5) ||
              dp.reduce((a, q) => ((q.r || 0) > (a.r || 0) ? q : a), dp[0]);
    const zy = z.y - (z.pr ? AFFONDAMENTO : 0);
    const d = Math.hypot(z.x - s.x, zy - s.y);
    if (!(d <= TOLL_INCROCIO))
      throw Object.assign(new Error('LE DUE SORGENTI NON TORNANO sul pulsante ' + quale + ': pulsanti(0) dice (' +
        Math.round(s.x) + ',' + Math.round(s.y) + '), il gioco ha DIPINTO (' + Math.round(z.x) + ',' + Math.round(zy) +
        '): ' + d.toFixed(2) + ' px. Una delle due mente e non so quale: non premo.'), { banco: true });
    return s;
  };
  console.log(`pulsanti: grande (${Math.round(btnGrande.x)},${Math.round(btnGrande.y)}) r${Math.round(btnGrande.r)} · piccolo (${Math.round(btnPiccolo.x)},${Math.round(btnPiccolo.y)}) r${Math.round(btnPiccolo.r)}`);
  console.log(`levetta a riposo (${Math.round(CASA.x)},${Math.round(CASA.y)}) · attacco verso x=${S0.c.FW}\n`);

  /* il pollice sinistro si appoggia e NON si alza piu' */
  const casaP = versoPannello(CASA.x, CASA.y);
  if (!INERTE) vetro.giu(0, casaP.px, casaP.py);
  await pausa(120);

  /* --- contatori --- */
  const K = { tick: 0, tiri: 0, passaggi: 0, cambi: 0, contrasti: 0, golFatti: 0, golPresi: 0,
    possessoMio: 0, possessoLoro: 0, libera: 0, distanza: 0, minDistPorta: 1e9, tiriInPorta: 0, errori: 0 };
  let ultimoMe = null, ultimoPunti = [...S0.punti], destroLibero = 0, tiroFinoA = 0;
  const t0 = Date.now();
  let ultimaLettura = 0, S = S0;

  let prossimoIndietro = INDIETRO ? t0 + INDIETRO * 1000 : Infinity;
  let quantiIndietro = 0, stradaPrima = 0, stradaDopo = 0, misuraDopo = 0;
  /* IL TRY CHE PROTEGGE IL TELEFONO. Dentro questo giro il pollice
     sinistro e' GIU'. Qualunque cosa succeda — un banco non valido, una
     lettura sfondata, un errore di adb — le dita si alzano nel finally
     prima che l'errore risalga. (Il corpo del giro non e' stato
     reindentato di proposito: una toppa che sposta trecento righe per
     due spazi non si rilegge.) */
  try {
  while ((Date.now() - t0) / 1000 < SEC) {
    const ora = Date.now();
    /* IL TASTO INDIETRO, DUE VOLTE: pausa e ripresa. Il pollice non si
       alza mai. Si contano le unita' percorse nei tre secondi PRIMA e nei
       tre DOPO: se il gesto muore, la seconda cifra crolla. */
    if (ora >= prossimoIndietro) {
      quantiIndietro++;
      stradaPrima = K.distanza;
      sh('shell', 'input', 'keyevent', '4');
      await pausa(800);
      sh('shell', 'input', 'keyevent', '4');
      await pausa(800);
      misuraDopo = K.distanza;
      prossimoIndietro = ora + INDIETRO * 1000;
      setTimeout(() => { stradaDopo += (K.distanza - misuraDopo); }, 3000);
    }
    /* lo stato si rilegge a 20 Hz: piu' spesso e' rumore di protocollo */
    if (ora - ultimaLettura >= 50) {
      const raw = await c.js(LEGGI);
      ultimaLettura = ora;
      if (raw) { try { S = JSON.parse(raw); } catch (e) { K.errori++; } }
      if (!S || !S.io) { await pausa(60); continue; }
      K.tick++;

      if (S.punti[0] !== ultimoPunti[0]) { K.golFatti += S.punti[0] - ultimoPunti[0]; }
      if (S.punti[1] !== ultimoPunti[1]) { K.golPresi += S.punti[1] - ultimoPunti[1]; }
      ultimoPunti = [...S.punti];

      if (ultimoMe) K.distanza += Math.hypot(S.io.x - ultimoMe.x, S.io.y - ultimoMe.y);
      ultimoMe = { x: S.io.x, y: S.io.y };

      const mio = S.b.own >= 0 && S.g[S.b.own] && S.g[S.b.own].t === 0;
      const loro = S.b.own >= 0 && S.g[S.b.own] && S.g[S.b.own].t === 1;
      if (mio) K.possessoMio++; else if (loro) K.possessoLoro++; else K.libera++;

      const PORTA = { x: S.c.FW, y: S.c.FH / 2 };
      const dPorta = Math.hypot(PORTA.x - S.io.x, PORTA.y - S.io.y);
      if (mio && S.b.own === S.io.idx) K.minDistPorta = Math.min(K.minDistPorta, dPorta);

      /* la scena non e' di gioco (gol, moviola, festa): si tocca per saltare */
      if (S.stato !== 'play' && S.stato !== 'kickoff') {
        if (!INERTE) { const p = versoPannello(VW * 0.5, VH * 0.35); vetro.giu(1, p.px, p.py); await pausa(60); vetro.su(1); }
        await pausa(180);
        continue;
      }

      if (!INERTE) {
        /* ---------- IL POLLICE SINISTRO: dove vado ---------- */
        let dx, dy;
        const hoIo = S.b.own === S.io.idx;
        if (hoIo) { dx = PORTA.x - S.io.x; dy = PORTA.y - S.io.y; }
        else if (mio) {                       // ce l'ha un compagno: mi apro avanti
          dx = PORTA.x - S.io.x; dy = (S.c.FH * (S.io.idx % 2 ? 0.28 : 0.72)) - S.io.y;
        } else { dx = S.b.x - S.io.x; dy = S.b.y - S.io.y; }
        const L = Math.hypot(dx, dy) || 1;
        const R = 44;                          // oltre STICK_FULL: corsa piena
        const p = versoPannello(CASA.x + dx / L * R, CASA.y + dy / L * R);
        vetro.muovi(0, p.px, p.py);

        /* ---------- IL POLLICE DESTRO: cosa faccio ---------- */
        if (tiroFinoA && ora >= tiroFinoA) { vetro.su(1); tiroFinoA = 0; destroLibero = ora + 260; K.tiri++; }
        else if (!tiroFinoA && ora >= destroLibero) {
          if (hoIo && dPorta < 430) {
            /* tiro: si tiene e si rilascia dentro la finestra buona */
            const cc = centroOra(S, 'grande');
            const q = versoPannello(cc.x, cc.y);
            vetro.giu(1, q.px, q.py);
            tiroFinoA = ora + 620;
            if (dPorta < 330) K.tiriInPorta++;
          } else if (hoIo) {
            /* passaggio: il pulsante piccolo (FILTRANTE col possesso) */
            const cc = centroOra(S, 'piccolo');
            const q = versoPannello(cc.x, cc.y);
            vetro.giu(1, q.px, q.py); await pausa(45); vetro.su(1);
            K.passaggi++; destroLibero = ora + 900;
          } else if (!mio) {
            const dBall = Math.hypot(S.b.x - S.io.x, S.b.y - S.io.y);
            const cc = centroOra(S, dBall < 55 ? 'grande' : 'piccolo');
            const q = versoPannello(cc.x, cc.y);
            vetro.giu(1, q.px, q.py); await pausa(45); vetro.su(1);
            if (dBall < 55) { K.contrasti++; destroLibero = ora + 700; }
            else { K.cambi++; destroLibero = ora + 1100; }
          }
        }
      }
    }
    await pausa(20);
  }

  } finally {
    /* LE DITA SI ALZANO QUI, sempre: uscita buona, errore, banco non
       valido. Prima di qualunque altra cosa, perche' e' l'unica che
       tocca l'hardware di qualcun altro. */
    await smonta();
  }
  const fine = JSON.parse(await c.js(LEGGI) || 'null');

  if (rec) { await pausa(1500); try { rec.kill(); } catch (e) { } await pausa(2500);
    try { fs.mkdirSync(path.dirname(path.resolve(VIDEO)), { recursive: true }); sh('pull', '/sdcard/_partita.mp4', path.resolve(VIDEO)); } catch (e) { console.log('  (il video non si e\' potuto tirare giu\': ' + String(e.message).split('\n')[0].slice(0, 90) + ')'); }
  }

  const durata = (Date.now() - t0) / 1000;
  const tot = K.possessoMio + K.possessoLoro + K.libera || 1;
  console.log('\n--- COSA E\' SUCCESSO IN ' + durata.toFixed(0) + ' SECONDI ---\n');
  console.log(`  punteggio finale        ${fine ? fine.punti.join(' - ') : '?'}   (gol fatti ${K.golFatti}, subiti ${K.golPresi})`);
  console.log(`  letture di stato        ${K.tick}  (${(K.tick / durata).toFixed(1)} al secondo)`);
  console.log(`  distanza percorsa dal giocatore comandato   ${K.distanza.toFixed(0)} unita'  (${(K.distanza / durata).toFixed(1)} u/s)`);
  if (INDIETRO) {
    console.log(`  tasto INDIETRO premuto (pausa+ripresa)      ${quantiIndietro} volte, ogni ${INDIETRO} s`);
    console.log(`  unita' percorse nei 3 s DOPO ogni ripresa   ${stradaDopo.toFixed(0)}  (${quantiIndietro ? (stradaDopo / quantiIndietro).toFixed(0) : '-'} per ripresa)`);
    console.log(`  Se il pollice morisse a ogni pausa, questa riga sarebbe vicina a zero.`);
  }
  console.log(`  possesso   mio ${(K.possessoMio / tot * 100).toFixed(0)}%   loro ${(K.possessoLoro / tot * 100).toFixed(0)}%   palla di nessuno ${(K.libera / tot * 100).toFixed(0)}%`);
  console.log(`  tiri tentati            ${K.tiri}   (di cui da meno di 330 unita': ${K.tiriInPorta})`);
  console.log(`  passaggi tentati        ${K.passaggi}`);
  console.log(`  contrasti tentati       ${K.contrasti}`);
  console.log(`  cambi di uomo           ${K.cambi}`);
  console.log(`  piu' vicino alla porta col pallone   ${K.minDistPorta < 1e9 ? K.minDistPorta.toFixed(0) + ' unita\'' : 'mai avuto il pallone'}`);
  if (K.errori) console.log(`  letture perse           ${K.errori}`);
  console.log(`  riallineamenti del canale   ${vetro.rotture}` + (vetro.rotture
    ? `   <- il flusso si e${"'"} spezzato a meta${"'"} evento e si e${"'"} riaperto`
    : `   (nessuno: il flusso non si e${"'"} mai disallineato)`));
  if (vetro.err.trim()) console.log(`  rumore dal vetro: ${vetro.err.trim().slice(0, 200)}`);

  console.log('\n--- VERDETTO ---');
  let male = 0;
  const dimmi = (ok, t, extra) => { if (!ok) male++; console.log((ok ? '  OK   ' : '  NO   ') + t + (extra ? '\n         ' + extra : '')); };
  if (INERTE) {
    console.log('  (corsa di controllo: i pollici non hanno toccato. Serve solo da paragone.)');
  } else {
    dimmi(K.distanza > 300, `il giocatore si e' MOSSO: ${K.distanza.toFixed(0)} unita' percorse`);
    dimmi(K.passaggi + K.tiri + K.contrasti + K.cambi > 10, `i pulsanti hanno prodotto azioni: ${K.passaggi + K.tiri + K.contrasti + K.cambi}`);
    dimmi(K.tiri > 0, `si e' TIRATO almeno una volta: ${K.tiri}`);
    dimmi(K.minDistPorta < 500, `il pallone e' arrivato in zona d'attacco: ${K.minDistPorta < 1e9 ? K.minDistPorta.toFixed(0) : 'mai'} unita' dalla porta`);
    dimmi(K.possessoMio > 0, `la squadra comandata ha avuto il pallone: ${(K.possessoMio / tot * 100).toFixed(0)}% del tempo`);
  }
  console.log(`\n${male === 0 ? 'tutti i controlli passati' : male + ' controlli falliti'}`);
  console.log('\nQuesto NON prova che i comandi siano piacevoli o che si imparino: nessuna');
  console.log('macchina lo sa dire. Prova che il gioco si puo\' giocare in autonomia.');
  c.chiudi();
  if (male) process.exit(1);
})().catch(e => {
  /* BANCO ONESTO: nessun ripiego muto: un banco che non si e' potuto
     usare esce con 2, non con 1. "Non ho potuto misurare" non si scrive
     come "il gioco non risponde". */
  if (e && e.banco) {
    console.error('\nBANCO NON VALIDO — ' + e.message);
    console.error('Non premo a memoria: i contatori di questa partita sarebbero un racconto.');
  } else {
    console.error('FALLITO:', e.message);
  }
  try { FILO && FILO.chiudi(); } catch (x) { }
  process.exit(e && e.banco ? 2 : 1);
});
