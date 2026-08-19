/* =====================================================================
   _p-passaggi.js — SUL TELEFONO VERO: quanti passaggi ARRIVANO, quanti
   gol, e quanti palloni partono da un pollice che si stacca.

   PERCHE' NON BASTA giocatore.js. Quello strumento e' la prova che il
   gioco si puo' giocare in autonomia, ed e' un ottimo strumento; ma il
   numero che stampa sotto la voce «passaggi tentati» e' il numero di
   volte in cui HA PREMUTO IL PULSANTE. Se il pulsante non facesse piu'
   niente, quel numero resterebbe identico: e' un'attestazione, non una
   misura, ed e' proprio la trappola di casa numero uno. Qui il
   passaggio si conta quando la palla ARRIVA al compagno.

   E c'e' una seconda cosa che giocatore.js non puo' vedere per come e'
   fatto: il suo pollice sinistro si appoggia all'inizio e NON SI ALZA
   PIU' per tutta la partita. Il difetto che si sta riparando vive
   esattamente nell'atto che quel pollice non compie mai. Qui il
   pollice sinistro si RIPRENDE — si stacca e si riappoggia — come fa
   una mano vera che si riassesta, e ogni stacco e' una prova.

   COSA CONTA, e come.
     · PASSAGGIO PARTITO dal mio uomo: il gioco marca il ricevitore
       designato (b.passTo) e l'ultimo che ha toccato (b.lastTouch). Un
       passaggio del comandato e' passTo che passa da -1 a k mentre
       lastTouch e' il mio uomo.
     · PASSAGGIO RIUSCITO: piu' tardi b.owner diventa proprio quel k.
       Se la palla la prende un altro, o si ferma, il passaggio e'
       fallito — e si conta fra i falliti, non si butta via.
     · GOL: le variazioni del tabellino.
     · CALCIO NON RICHIESTO: nei 400 ms dopo uno stacco del pollice
       sinistro, un passaggio partito dal mio uomo. Il pollice destro
       in quella finestra sta fermo apposta: non c'e' nessun altro
       comando che possa averlo prodotto.

   DICE SEMPRE CHE VERSIONE STA MISURANDO. Un banco che gira su un APK
   vecchio e stampa numeri nuovi e' il modo piu' silenzioso di sbagliare
   che ci sia. Qui si legge il SORGENTE delle funzioni dentro la WebView
   e si dichiara: rilascio inerte o no, come si chiama il pulsante
   piccolo, se la filtrante ripiega sul passaggio.

   NON CHIAMA MAI UNA FUNZIONE DEL GIOCO PER AGIRE: legge lo stato (come
   farebbe un occhio) e agisce solo scrivendo sul dispositivo di
   ingresso del kernel (come farebbe un dito). Stessa regola di
   giocatore.js, stessa taratura.

   uso:
     node strumenti/_p-passaggi.js
     node strumenti/_p-passaggi.js --sec 90 --taglia 5 --stacchi 24
     node strumenti/_p-passaggi.js --json fuori/tel-prima.json
     node strumenti/_p-passaggi.js --contro fuori/tel-prima.json
     node strumenti/_p-passaggi.js --inerte     (controllo: nessun dito)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const PACCHETTO = 'it.dopolavoro.calcetto';
const ATTIVITA = 'it.dopolavoro.gioco.Gioco';
const TARA = path.join(__dirname, 'pollici-taratura.json');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const bandiera = n => process.argv.includes('--' + n);
const pausa = ms => new Promise(r => setTimeout(r, ms));
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length ? (o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2) : 0; };

function trovaAdb() {
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME || path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); return c; } catch (e) { }
  }
  return null;
}
const { Vetro } = require('./_vetro.js');

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
        manda(m, p = {}, q = 60000) { if (morto) return Promise.resolve({ morto: true }); const id = ++n; try { ws.send(JSON.stringify({ id, method: m, params: p })); } catch (e) { return Promise.resolve({ morto: true }); } return new Promise(r => { att.set(id, r); setTimeout(() => { if (att.has(id)) { att.delete(id); r({ scaduto: true }); } }, q); }); },
        async js(e) { const r = await this.manda('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : undefined; },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

/* lo stato in una sola andata. Rispetto a giocatore.js ci sono in piu'
   lastTouch (chi ha toccato per ultimo: serve ad attribuire il
   passaggio) e la velocita' della palla. */
const LEGGI = `(()=>{const t=window.__test;if(!t||!t.G)return null;const G=t.G,v=t.view,b=t.ball;
const me=G.ctrl&&G.ctrl[0]>=0?t.players[G.ctrl[0]]:null;
return JSON.stringify({
 stato:t.state, punti:t.score, resta:t.timeLeft,
 c:t.campo,
 b:{x:b.x,y:b.y,sp:Math.hypot(b.vx,b.vy),own:b.owner,passTo:b.passTo,lt:b.lastTouch},
 io: me?{x:me.x,y:me.y,idx:me.idx,car:me.charge,
      /* LA PALLA E' A PORTATA? E' la condizione vera di doPass
         (owner mio oppure entro KICK_R): un rilascio puo' calciare
         anche mentre il pallone rimbalza ai piedi senza essere
         "posseduto", e usare il solo possesso come denominatore dava
         il 133% — cioe' un numero impossibile, che e' il modo in cui
         un banco dice che il denominatore e' sbagliato. */
      port: (b.owner===me.idx) || Math.hypot(b.x-me.x,b.y-me.y)<=KICK_R}:null,
 g: t.players.map(p=>({t:p.team,i:p.idx,x:p.x,y:p.y,r:p.role,o:p.out|0})),
 btn: (t.pulsanti&&t.pulsanti(0))||[]
});})()`;

/* CHI STO MISURANDO. Si legge il sorgente delle funzioni vive dentro la
   WebView: non e' un'etichetta di versione che qualcuno ha scritto a
   mano, e' il codice che sta girando. */
const IDENTITA = `(()=>{const s=f=>{try{return String(f)}catch(e){return ''}};
const b=(window.__test.pulsanti&&window.__test.pulsanti(0))||[];
const gr=b.reduce((a,c)=>(c.r||0)>(a.r||0)?c:a,b[0]||{});
const pi=b.find(c=>c!==gr)||{};
return JSON.stringify({
 grande: gr.label||'?', piccolo: pi.label||'?',
 filtranteRipiega: /eseguiPassUmano\\(p\\)/.test(s(window.eseguiFiltrante)),
 flickVivo: /fspeed>650/.test(document.documentElement.innerHTML||''),
 passaggioSuRilascio: /if\\(carrying\\) doPass\\(t\\)/.test(document.documentElement.innerHTML||'')
});})()`;

(async () => {
  const SEC = +arg('sec', 90);
  const TAGLIA = +arg('taglia', 5);
  const STACCHI = +arg('stacchi', 24);
  const INERTE = bandiera('inerte');
  const JSONOUT = arg('json', '');
  const CONTRO = arg('contro', '');

  const adb = trovaAdb(); if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const disp = lista.split('\n').slice(1).map(r => r.trim()).filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) { console.error('nessun telefono collegato'); process.exit(2); }
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  if (!fs.existsSync(TARA)) { console.error('manca la taratura: esegui prima  node strumenti/pollici.js'); process.exit(2); }
  const T = JSON.parse(fs.readFileSync(TARA, 'utf8'));
  const versoPannello = (cx, cy) => ({ px: T.indietro.a * cx + T.indietro.b * cy + T.indietro.c, py: T.indietro.d * cx + T.indietro.e * cy + T.indietro.f });

  console.log('=== PASSAGGI SUL TELEFONO — quanti ne arrivano davvero ===\n');
  console.log(`dispositivo ${dev} · ${SEC} s · ${TAGLIA} contro ${TAGLIA} · ${STACCHI} stacchi del pollice sinistro` + (INERTE ? ' · POLLICI INERTI' : ''));

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
  await c.js(`window.__test.dismissSplash&&window.__test.dismissSplash();window.__test.startMatch(1,1,{size:${TAGLIA}});1`);
  await pausa(2200);

  const ID = JSON.parse(await c.js(IDENTITA) || '{}');
  console.log('\n--- CHE VERSIONE C\'E\' SUL TELEFONO (letta dal codice vivo) ---');
  console.log(`  pulsanti col possesso:            ${ID.grande} (grande) · ${ID.piccolo} (piccolo)`);
  console.log(`  il rilascio della levetta passa:  ${ID.passaggioSuRilascio ? 'SI  <- versione di prima' : 'no  <- toppa applicata'}`);
  console.log(`  la soglia del flick e' nel file:  ${ID.flickVivo ? 'SI' : 'no'}`);
  console.log(`  la filtrante ripiega sul passaggio: ${ID.filtranteRipiega ? 'si' : 'NO  <- versione di prima'}`);

  const vetro = new Vetro(adb, dev);
  await pausa(400);
  const S0 = JSON.parse(await c.js(LEGGI) || 'null');
  if (!S0) { console.error('non riesco a leggere lo stato'); process.exit(2); }
  const VW = await c.js('innerWidth'), VH = await c.js('innerHeight');
  const CASA = { x: VW * 0.18, y: VH * 0.66 };
  const btnGrande = S0.btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, S0.btn[0]);
  const btnPiccolo = S0.btn.find(b => b !== btnGrande) || btnGrande;
  console.log(`\n  pulsanti: grande (${Math.round(btnGrande.x)},${Math.round(btnGrande.y)}) r${Math.round(btnGrande.r)} · piccolo (${Math.round(btnPiccolo.x)},${Math.round(btnPiccolo.y)}) r${Math.round(btnPiccolo.r)}`);

  const casaP = versoPannello(CASA.x, CASA.y);
  if (!INERTE) vetro.giu(0, casaP.px, casaP.py);
  await pausa(120);

  const K = {
    tick: 0, premuteTiro: 0, premutePass: 0, premuteContrasto: 0, premuteCambio: 0,
    passPartiti: 0, passRiusciti: 0, passFalliti: 0,
    golFatti: 0, golPresi: 0, distanza: 0, possessoMio: 0, possessoLoro: 0, libera: 0,
    stacchi: 0, stacchiConPalla: 0, calciDopoStacco: 0, quandoStacco: [],
  };
  let ultimoMe = null, ultimoPunti = [...S0.punti], destroLibero = 0, tiroFinoA = 0;
  let volo = null;                      // il passaggio in volo: {k, t}
  let ultimoPassTo = -1;
  let prossimoStacco = 0, staccoFinoA = 0, finestraStacco = 0, giuSinistro = !INERTE;
  const t0 = Date.now();
  const passoStacco = STACCHI > 0 ? (SEC * 1000) / (STACCHI + 1) : 1e9;
  prossimoStacco = t0 + passoStacco;
  let ultimaLettura = 0, S = S0;

  while ((Date.now() - t0) / 1000 < SEC) {
    const ora = Date.now();
    if (ora - ultimaLettura >= 50) {
      const raw = await c.js(LEGGI);
      ultimaLettura = ora;
      if (raw) { try { S = JSON.parse(raw); } catch (e) { } }
      if (!S || !S.io) { await pausa(60); continue; }
      K.tick++;

      if (S.punti[0] !== ultimoPunti[0]) K.golFatti += S.punti[0] - ultimoPunti[0];
      if (S.punti[1] !== ultimoPunti[1]) K.golPresi += S.punti[1] - ultimoPunti[1];
      ultimoPunti = [...S.punti];
      if (ultimoMe) K.distanza += Math.hypot(S.io.x - ultimoMe.x, S.io.y - ultimoMe.y);
      ultimoMe = { x: S.io.x, y: S.io.y };
      const mio = S.b.own >= 0 && S.g[S.b.own] && S.g[S.b.own].t === 0;
      const loro = S.b.own >= 0 && S.g[S.b.own] && S.g[S.b.own].t === 1;
      if (mio) K.possessoMio++; else if (loro) K.possessoLoro++; else K.libera++;

      /* ---------- IL PASSAGGIO, contato dove arriva ---------- */
      if (S.b.passTo >= 0 && ultimoPassTo < 0 && S.b.lt === S.io.idx) {
        K.passPartiti++;
        volo = { k: S.b.passTo, t: ora };
        if (finestraStacco && ora <= finestraStacco) { K.calciDopoStacco++; K.quandoStacco.push(ora - (finestraStacco - 400)); }
      }
      ultimoPassTo = S.b.passTo;
      if (volo) {
        if (S.b.own === volo.k) { K.passRiusciti++; volo = null; }
        else if (S.b.own >= 0 && S.b.own !== volo.k) { K.passFalliti++; volo = null; }
        else if (ora - volo.t > 3000) { K.passFalliti++; volo = null; }
      }

      if (S.stato !== 'play' && S.stato !== 'kickoff') {
        if (!INERTE) { const p = versoPannello(VW * 0.5, VH * 0.35); vetro.giu(1, p.px, p.py); await pausa(60); vetro.su(1); }
        await pausa(180);
        continue;
      }

      if (!INERTE) {
        const PORTA = { x: S.c.FW, y: S.c.FH / 2 };
        const hoIo = S.b.own === S.io.idx;
        const dPorta = Math.hypot(PORTA.x - S.io.x, PORTA.y - S.io.y);

        /* ---------- LO STACCO DEL POLLICE SINISTRO ----------
           E' la prova: si alza, si aspetta, si riappoggia. Nella
           finestra il pollice DESTRO non tocca niente, cosi' qualunque
           pallone parta in quei 400 ms l'ha prodotto lo stacco. */
        if (giuSinistro && ora >= prossimoStacco && !tiroFinoA) {
          vetro.su(0); giuSinistro = false;
          K.stacchi++;
          /* IL DENOMINATORE ONESTO. Un rilascio puo' battere un
             passaggio solo se in quel momento la palla ce l'ho io: se
             la squadra e' senza pallone il rilascio non ha niente da
             calciare, e contarlo fra i tentativi diluirebbe la
             percentuale fino a farla sparire. Si contano tutti e due i
             denominatori e si stampano tutti e due. */
          if (S.io.port) K.stacchiConPalla++;
          finestraStacco = ora + 400;
          staccoFinoA = ora + 520;          // resta staccato un po', come una mano vera
          prossimoStacco = ora + passoStacco;
        }
        if (!giuSinistro && ora >= staccoFinoA) {
          vetro.giu(0, casaP.px, casaP.py); giuSinistro = true;
        }
        if (finestraStacco && ora > finestraStacco) finestraStacco = 0;

        /* ---------- IL POLLICE SINISTRO: dove vado ---------- */
        if (giuSinistro) {
          let dx, dy;
          if (hoIo) { dx = PORTA.x - S.io.x; dy = PORTA.y - S.io.y; }
          else if (mio) { dx = PORTA.x - S.io.x; dy = (S.c.FH * (S.io.idx % 2 ? 0.28 : 0.72)) - S.io.y; }
          else { dx = S.b.x - S.io.x; dy = S.b.y - S.io.y; }
          const L = Math.hypot(dx, dy) || 1;
          const R = 44;
          const p = versoPannello(CASA.x + dx / L * R, CASA.y + dy / L * R);
          vetro.muovi(0, p.px, p.py);
        }

        /* ---------- IL POLLICE DESTRO: fermo dentro la finestra ---------- */
        if (finestraStacco) { /* niente: la finestra deve restare pulita */ }
        else if (tiroFinoA && ora >= tiroFinoA) { vetro.su(1); tiroFinoA = 0; destroLibero = ora + 260; K.premuteTiro++; }
        else if (!tiroFinoA && ora >= destroLibero) {
          if (hoIo && dPorta < 430) {
            const q = versoPannello(btnGrande.x, btnGrande.y);
            vetro.giu(1, q.px, q.py); tiroFinoA = ora + 620;
          } else if (hoIo) {
            const q = versoPannello(btnPiccolo.x, btnPiccolo.y);
            vetro.giu(1, q.px, q.py); await pausa(45); vetro.su(1);
            K.premutePass++; destroLibero = ora + 900;
          } else if (!mio) {
            const dBall = Math.hypot(S.b.x - S.io.x, S.b.y - S.io.y);
            const vicino = dBall < 55;
            const q = versoPannello(vicino ? btnGrande.x : btnPiccolo.x, vicino ? btnGrande.y : btnPiccolo.y);
            vetro.giu(1, q.px, q.py); await pausa(45); vetro.su(1);
            if (vicino) { K.premuteContrasto++; destroLibero = ora + 700; }
            else { K.premuteCambio++; destroLibero = ora + 1100; }
          }
        }
      }
    }
    await pausa(20);
  }

  if (!INERTE) { vetro.su(1); vetro.su(0); }
  await pausa(500);
  const fine = JSON.parse(await c.js(LEGGI) || 'null');
  vetro.chiudi();
  const durata = (Date.now() - t0) / 1000;
  const tot = K.possessoMio + K.possessoLoro + K.libera || 1;

  console.log('\n--- COSA E\' SUCCESSO IN ' + durata.toFixed(0) + ' SECONDI ---\n');
  console.log(`  punteggio finale         ${fine ? fine.punti.join(' - ') : '?'}   (gol fatti ${K.golFatti}, subiti ${K.golPresi})`);
  console.log(`  letture di stato         ${K.tick}  (${(K.tick / durata).toFixed(1)}/s)`);
  console.log(`  possesso                 mio ${(K.possessoMio / tot * 100).toFixed(0)}%  ·  loro ${(K.possessoLoro / tot * 100).toFixed(0)}%  ·  di nessuno ${(K.libera / tot * 100).toFixed(0)}%`);
  console.log(`  distanza percorsa        ${K.distanza.toFixed(0)} unita'`);
  console.log('');
  console.log(`  PASSAGGI PARTITI dal mio uomo    ${K.passPartiti}`);
  console.log(`  PASSAGGI RIUSCITI (arrivati)     ${K.passRiusciti}` +
    (K.passPartiti ? `   (${(K.passRiusciti / K.passPartiti * 100).toFixed(0)}%)` : ''));
  console.log(`  passaggi persi per strada        ${K.passFalliti}`);
  console.log(`  pressioni del pulsante passaggio ${K.premutePass}   <- quello che giocatore.js chiama "passaggi tentati"`);
  console.log(`  pressioni del pulsante tiro      ${K.premuteTiro}`);
  console.log(`  pressioni contrasto / cambio     ${K.premuteContrasto} / ${K.premuteCambio}`);
  console.log('');
  console.log(`  STACCHI del pollice sinistro     ${K.stacchi}`);
  console.log(`  di cui col PALLONE A PORTATA     ${K.stacchiConPalla}   <- gli unici che potevano calciare`);
  console.log(`  seguiti da un pallone giocato entro 400 ms          ${K.calciDopoStacco}` +
    (K.stacchiConPalla ? `   (${(K.calciDopoStacco / K.stacchiConPalla * 100).toFixed(0)}% degli stacchi col pallone, ${(K.calciDopoStacco / K.stacchi * 100).toFixed(0)}% di tutti)` : ''));
  console.log(`  riallineamenti del canale        ${vetro.rotture}`);
  if (vetro.err.trim()) console.log(`  rumore dal vetro: ${vetro.err.trim().slice(0, 200)}`);

  const R = { id: ID, durata, K };
  if (JSONOUT) {
    const d = path.resolve(JSONOUT);
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.writeFileSync(d, JSON.stringify(R, null, 1));
    console.log('\n  crudo in ' + d);
  }
  if (CONTRO && fs.existsSync(CONTRO)) {
    const P = JSON.parse(fs.readFileSync(CONTRO, 'utf8'));
    console.log('\n--- CONTRO LA CORSA DI PRIMA ---');
    console.log('                                    prima    oggi');
    const r = (n, a, b) => console.log('  ' + n.padEnd(34) + String(a).padStart(5) + String(b).padStart(8));
    r('passaggi partiti', P.K.passPartiti, K.passPartiti);
    r('passaggi RIUSCITI', P.K.passRiusciti, K.passRiusciti);
    r('gol fatti', P.K.golFatti, K.golFatti);
    r('gol subiti', P.K.golPresi, K.golPresi);
    r('stacchi del pollice', P.K.stacchi, K.stacchi);
    r('  di cui col pallone a portata', P.K.stacchiConPalla, K.stacchiConPalla);
    r('calci non richiesti dopo lo stacco', P.K.calciDopoStacco, K.calciDopoStacco);
  }

  console.log('\n--- VERDETTO ---');
  let male = 0;
  const dimmi = (ok, t, extra) => { if (!ok) male++; console.log((ok ? '  OK   ' : '  NO   ') + t + (extra ? '\n         ' + extra : '')); };
  if (INERTE) console.log('  (corsa di controllo: i pollici non hanno toccato.)');
  else {
    dimmi(K.passPartiti > 0, `dal mio uomo sono partiti dei passaggi: ${K.passPartiti}`);
    dimmi(K.passRiusciti > 0, `e ne sono ARRIVATI: ${K.passRiusciti}`);
    dimmi(K.distanza > 300, `il giocatore si e' mosso: ${K.distanza.toFixed(0)} unita'`);
    dimmi(K.stacchi > 0, `il pollice sinistro si e' staccato: ${K.stacchi} volte`);
    dimmi(K.calciDopoStacco === 0,
      `nessun pallone e' partito da uno stacco: ${K.calciDopoStacco} su ${K.stacchi}`,
      K.calciDopoStacco ? 'alzare il pollice batte un passaggio che nessuno ha chiesto' : '');
  }
  console.log(`\n${male === 0 ? 'tutti i controlli passati' : male + ' controlli falliti'}`);
  c.chiudi();
  if (male) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
