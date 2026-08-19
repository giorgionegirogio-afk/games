/* =====================================================================
   _p-pausa-dito.js — LA PAUSA UCCIDE IL DITO APPOGGIATO?

   PERCHE'. Il critico della toppa del rilascio ha sollevato una riserva
   bloccante e non l'ha potuta chiudere da solo: la toppa aggiunge una
   gestione della pausa che azzera lo stato del tocco, e nessuno ha
   verificato cosa succede al DITO CHE RESTA APPOGGIATO.

   Conta perche' il committente ha descritto cosi' il movimento: «il
   pollice rimane sullo schermo a sinistra e mantenendolo premuto lo
   sposto verso la direzione scelta». Il pollice sinistro sta giu' per
   tutta la partita. E il tasto Indietro e' il tasto piu' premuto di un
   telefono Android. Se dopo ogni pausa il gesto primario muore finche'
   non alzi e riappoggi il dito, e' un prezzo che va deciso in chiaro,
   non scoperto da chi gioca.

   COME. Sul telefono vero, non sul banco: il tasto Indietro e' un fatto
   del sistema operativo, e la pausa qui nasce da li'.
     1. si appoggia il pollice e si trascina: la levetta e' viva;
     2. si legge humanMove(0) — deve essere diverso da zero;
     3. si preme INDIETRO (keyevent 4): il gioco va in pausa;
     4. si preme di nuovo INDIETRO: il gioco riprende;
     5. SENZA ALZARE IL DITO si rilegge humanMove(0).
   Se al punto 5 torna [0,0] mentre il dito e' ancora sul vetro e ancora
   spostato, il gesto e' morto.

   E il controllo che rende la misura una misura: la stessa sequenza
   SENZA la pausa. Se anche li' torna zero, il difetto non e' la pausa.

   uso:  node strumenti/_p-pausa-dito.js
         node strumenti/_p-pausa-dito.js --giri 6
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Vetro } = require('./_vetro.js');

const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const TARA = path.join(__dirname, 'pollici-taratura.json');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
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
    ws.onclose = () => { morto = true; for (const [, r] of att) r({ morto: true }); att.clear(); };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && att.has(m.id)) { att.get(m.id)(m); att.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        manda(m, p = {}) { if (morto) return Promise.resolve({}); const id = ++n; ws.send(JSON.stringify({ id, method: m, params: p })); return new Promise(r => { att.set(id, r); setTimeout(() => { if (att.has(id)) { att.delete(id); r({ scaduto: true }); } }, 30000); }); },
        async js(e) { const r = await this.manda('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

(async () => {
  const GIRI = +arg('giri', 5);
  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const disp = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 })
    .split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato: mi fermo invece di stimare.'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  if (!fs.existsSync(TARA)) { console.error('manca la taratura: esegui prima  node strumenti/pollici.js'); process.exit(2); }
  const T = JSON.parse(fs.readFileSync(TARA, 'utf8'));
  const versoPannello = (cx, cy) => ({ px: T.indietro.a * cx + T.indietro.b * cy + T.indietro.c, py: T.indietro.d * cx + T.indietro.e * cy + T.indietro.f });

  console.log('=== LA PAUSA UCCIDE IL DITO APPOGGIATO? ===\n');
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
  for (let i = 0; i < 50; i++) { if (await c.js('!!window.__test')) break; await pausa(300); }
  /* IL RIQUADRO DEL TUTORIAL SI MANGIA I TOCCHI, e la prima stesura di
     questo file non lo chiudeva: la levetta non si armava quasi mai e
     anche il braccio di CONTROLLO moriva — il segno che il difetto era
     del banco. Lo chiude gia' `_p-verbi.js` nella sua preparazione, e la
     riga era li' da copiare. Poi si aspetta che la scena sia davvero di
     gioco: dopo startMatch c'e' il calcio d'inizio, e durante quello i
     tocchi non comandano. */
  await c.js(`(()=>{const t=window.__test;
    t.dismissSplash&&t.dismissSplash();
    try{ if(t.Tut&&t.Tut.active&&t.Tut.finish) t.Tut.finish(true); }catch(e){}
    t.setPaused&&t.setPaused(false);
    t.startMatch(1,1,{size:5});
    return 1;})()`);
  for (let i = 0; i < 60; i++) {
    const s = await c.js('window.__test.state');
    if (s === 'play') break;
    await pausa(300);
  }
  await c.js(`(()=>{const t=window.__test; try{ if(t.Tut&&t.Tut.active&&t.Tut.finish) t.Tut.finish(true); }catch(e){} return t.state;})()`);
  await pausa(1200);
  const VW = await c.js('innerWidth'), VH = await c.js('innerHeight');

  /* la levetta si legge dal gioco: `humanMove(t)` e' la funzione che
     traduce lo stato del dito nella direzione di corsa. E' la cosa che
     conta, non il fatto che il dito sia registrato da qualche parte. */
  const LEGGI = `(()=>{try{
    const m = (typeof humanMove==='function') ? humanMove(0) : null;
    const s = (typeof Touch5!=='undefined' && Touch5.stick) ? Touch5.stick[0] : null;
    return JSON.stringify({ m: m?[+m[0].toFixed(3),+m[1].toFixed(3)]:null,
      attivo: s?!!s.active:null, id: s?s.id:null,
      pausa: !!(window.__test&&window.__test.paused), scena: window.__test?window.__test.state:null });
  }catch(e){return JSON.stringify({errore:String(e.message)});}})()`;

  const vetro = new Vetro(adb, dev);
  await pausa(400);
  const CASA = { x: VW * 0.20, y: VH * 0.66 };
  const casaP = versoPannello(CASA.x, CASA.y);
  const viaP = versoPannello(CASA.x + 42, CASA.y - 18);

  const prova = async (conPausa) => {
    /* IL TOCCO INIZIALE DEVE ARRIVARE DA SOLO, e questa riga e' costata una
       corsa intera. Con 120 ms fra la posa e il primo trascinamento, il
       sistema fondeva i due eventi: la levetta si armava ALL'ARRIVO, cioe'
       col dito gia' spostato, e lo scostamento nasceva a zero. Da fuori si
       leggeva `attivo true` con `humanMove` [0,0] — e anche il braccio di
       controllo falliva, che e' il segno che il difetto era del banco.
       E' la stessa fusione dei touchmove che questo gioco ha gia' pagato
       una volta sul tiro. Qui si paga con l'attesa: 300 ms perche' il
       touchstart viaggi da solo, 45 fra un passo e l'altro. */
    vetro.giu(0, casaP.px, casaP.py);
    await pausa(300);
    for (let i = 1; i <= 6; i++) {
      vetro.muovi(0, casaP.px + (viaP.px - casaP.px) * i / 6, casaP.py + (viaP.py - casaP.py) * i / 6);
      await pausa(45);
    }
    await pausa(300);
    const prima = JSON.parse(await c.js(LEGGI));
    /* LEGGERE SENZA MUOVERE IL DITO NON MISURA LA RIPARAZIONE, e questo
       file l'ha sbagliato una volta — dopo che la stessa cosa era gia'
       stata corretta sul banco da tavolo, il che rende l'errore peggiore.
       Il pollice torna a comandare al PRIMO MOVIMENTO, perche' un dito che
       non manda eventi e' indistinguibile da un dito che si e' alzato
       durante la pausa. Un pollice vero appoggiato sul vetro trema sempre
       di un paio di pixel, quindi le due cose si misurano separate:
         FERMO   subito dopo la ripresa, senza un solo evento;
         TREMA   dopo tre pixel, cioe' quello che fa una mano. */
    const leggi = async () => { const v = await c.js(LEGGI); try { return JSON.parse(v); } catch (e) { return { m: null, errore: 'lettura persa' }; } };
    let dentro = null;
    if (conPausa) {
      sh('shell', 'input', 'keyevent', '4');      // INDIETRO: mette in pausa
      await pausa(900);
      dentro = await leggi();
      sh('shell', 'input', 'keyevent', '4');      // INDIETRO: riprende
      await pausa(900);
    } else {
      await pausa(1800);                          // stessa durata, senza pausa
    }
    const dopoFermo = await leggi();
    vetro.muovi(0, viaP.px + 3, viaP.py + 2);
    await pausa(180);
    const dopo = await leggi();
    vetro.su(0); await pausa(250);
    return { prima, dentro, dopoFermo, dopo };
  };

  const vivo = m => m && m.m && (Math.abs(m.m[0]) > 0.01 || Math.abs(m.m[1]) > 0.01);
  const R = { pausa: { vivi: 0, morti: 0 }, controllo: { vivi: 0, morti: 0 } };

  for (const conPausa of [true, false]) {
    const nome = conPausa ? 'CON PAUSA' : 'CONTROLLO (stessa attesa, nessuna pausa)';
    console.log('--- ' + nome + ' ---');
    for (let g = 0; g < GIRI; g++) {
      const r = await prova(conPausa);
      const k = conPausa ? R.pausa : R.controllo;
      /* UNA PROVA IN CUI LA LEVETTA NON SI E' ARMATA NON MISURA NIENTE, e
         contarla come fallimento fa dire al verdetto «il dito muore»
         quando il dito non e' mai nato. Si ripete, e le nulle si
         dichiarano invece di sparire nel conteggio. */
      if (!vivo(r.prima)) {
        k.nulle = (k.nulle || 0) + 1;
        console.log(`  giro ${g + 1}   prova NULLA (la levetta non si e' armata: ${JSON.stringify(r.prima.m)}): non conta`);
        if (k.nulle <= GIRI) { g--; continue; }
        console.log('           troppe prove nulle: smetto di ripetere');
        continue;
      }
      k.validi = (k.validi || 0) + 1;
      if (vivo(r.dopo)) k.vivi++; else k.morti++;
      if (vivo(r.dopoFermo)) k.fermi = (k.fermi || 0) + 1;
      console.log(`  giro ${g + 1}   prima ${JSON.stringify(r.prima.m)}` +
        (r.dentro ? `   pausa ${JSON.stringify(r.dentro.m)} (in pausa ${r.dentro.pausa})` : '') +
        `   FERMO ${JSON.stringify(r.dopoFermo.m)}` +
        `   TREMA ${JSON.stringify(r.dopo.m)} (attivo ${r.dopo.attivo})` +
        `   -> ${vivo(r.dopo) ? 'VIVO' : 'MORTO'}`);
    }
    console.log('');
  }

  vetro.chiudi();
  console.log('--- VERDETTO ---');
  const dimmi = (ok, t, e) => console.log((ok ? '  OK   ' : '  NO   ') + t + (e ? '\n         ' + e : ''));
  const vC = R.controllo.validi || 0, vP = R.pausa.validi || 0;
  dimmi(vC > 0 && R.controllo.vivi === vC, `il controllo tiene: ${R.controllo.vivi}/${vC} prove valide, dita ancora vive senza pausa`,
    R.controllo.vivi < GIRI ? 'se il controllo non tiene, la colpa non e\' della pausa e questa misura non dice niente' : '');
  dimmi(vP > 0 && R.pausa.vivi === vP, `dopo il tasto INDIETRO vero, al primo tremore del pollice, il dito comanda ancora: ${R.pausa.vivi}/${vP} prove valide`,
    R.pausa.vivi < GIRI ? 'il gesto primario muore dopo il tasto piu\' premuto del telefono, e finche\' non alzi e riappoggi il pollice il giocatore non si muove' : '');
  console.log(`\n  con pausa ${R.pausa.vivi} vivi / ${R.pausa.morti} morti   ·   controllo ${R.controllo.vivi} vivi / ${R.controllo.morti} morti`);
  console.log('\nQuesta misura NON dice se il prezzo sia accettabile: dice se il prezzo c\'e\'.');
  c.chiudi();
  if (R.controllo.vivi < GIRI || R.pausa.vivi < GIRI) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
