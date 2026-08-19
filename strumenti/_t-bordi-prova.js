/* =====================================================================
   _t-bordi-prova.js — IL BANCO DEI BORDI, seconda edizione.

   LA PRIMA EDIZIONE STAMPAVA E BASTA, e questa e' la correzione piu'
   importante di tutte. Nel modo senza telefono non c'era un solo
   `process.exit` diverso da zero: qualunque cosa misurasse, usciva verde.
   Un banco che non puo' diventare rosso non e' un cancello, e' un
   bollettino. Adesso ogni misura ha una CONDIZIONE, le condizioni stanno
   scritte in fondo in un elenco, e se una non e' soddisfatta il processo
   esce 1 dicendo quale.

   E IL SUO CONTROLLO POSITIVO GUARDAVA LA COSA SBAGLIATA. `contaOk`
   verificava che i GESTI fossero validi (il pallone al piede), non che i
   CALCI partissero. Se le spie avessero smesso di intercettare — basta
   che il gioco diventi type="module" — si sarebbe letto «strappata 0/8»
   accanto a «controllo positivo 0/5» e il banco sarebbe rimasto verde.
   Adesso il controllo positivo E' la condizione: zero calci sul braccio
   di controllo = banco cieco = rosso.

   COSA MISURA, in cinque prove.

   1. DOVE ARRIVA LA PRESA, cercandola invece di ricordarsela. Il gioco
      dichiara i centri (__test.pulsanti) ma la PRESA e' quanto sborda il
      tocco accettato, e quella sta dentro Touch5.start. Invece di
      ricopiare il «+10» si CERCA: si posa un tocco, si guarda se il gioco
      lo registra come premuto (lo dichiara lui, in
      __test.comandiTouch[].premuto), e si bisezione fino a mezzo pixel.

   2. L'ANELLO DI ESCLUSIONE, che e' un raggio DIVERSO dalla presa e che
      nessuno aveva mai misurato. Fra bt.r+presa e bt.r+anello il tocco
      non preme il pulsante e non deve nemmeno diventare levetta. Se
      qualcuno alza la presa senza alzare l'anello, l'anello sparisce
      sotto la presa in silenzio: qui si misurano tutt'e due i raggi e si
      pretende che il secondo stia sopra il primo.

   3. SE UN TOCCO STRAPPATO PRODUCE UN CALCIO. Si mette il pallone al
      piede, si preme, e poi si manda `touchCancel` — cio' che manda
      Android quando si prende il dito. Si contano le chiamate alle sei
      uscite del calcio.
      ATTENZIONE A QUALE BRACCIO E' IL CONTROLLO. Da quando il gioco ha
      separato end/cancel/release, IL RILASCIO DELLA LEVETTA E' INERTE:
      alzare il dito da una levetta non produce niente, quindi la levetta
      non ha nessun calcio da salvare e il suo «zero» non prova niente.
      Il controllo positivo valido e' IL PULSANTE GRANDE: premuto e
      rilasciato deve calciare. Su quello si pronuncia il verdetto.

   4. LA CATENA DEGLI INSERTI, provata sulla cascata vera. Chromium non ha
      tacca: env(safe-area-inset-*) vale 0 ed e' DEFINITA, quindi il
      fallback non scatta mai e «la regola vince» e «la regola perde» si
      scrivono nello stesso modo — zero. La prima edizione lo provava con
      uno stile INLINE, che scavalca la cascata e quindi non prova che la
      dichiarazione del foglio arrivi. Qui si riscrive la regola #inserti
      sostituendo le env() con due LETTERALI e si verifica che
      getComputedStyle li restituisca: e' l'unico modo di distinguere i
      due stati, ed e' un miglioramento che arriva dalla critica.

   5. I CONTATORI DEL GIOCO, letti e MESSI A CONFRONTO. Il gioco espone
      BORDI.annullati e BORDI.salvati. Esporli e non leggerli sarebbe
      arredamento; leggerli e crederci sarebbe peggio. Qui si contano gli
      stessi eventi con le spie e si pretende che i due conti coincidano:
      se il contatore del gioco e le spie non dicono la stessa cosa, uno
      dei due mente e il banco esce rosso.

   QUELLO CHE QUESTO BANCO NON PUO' FARE, e va detto per primo.
   Chromium non ha ne' tacca ne' gesti di sistema, e il touchCancel lo
   mando io: sto provando il GESTORE del gioco, non la catena d'ingresso
   di Android. E' lo stesso banco cieco che ha lasciato passare il
   difetto. Per la catena vera c'e' --telefono, che scrive su /dev/input.

   E UNA TERZA CECITA', chiusa in questa edizione: --porta FACEVA UNA
   CORSA SOLA. Stampava «73 su 289, il 25%» e quel numero e' finito dentro
   il gioco come misura. Rilanciato senza cambiare niente, lo stesso
   comando ha visto la bocca in quadro da 61 a 307 volte — dal 7% al 32%
   dei fotogrammi — e il confronto fra due assetti ha cambiato SEGNO fra
   una corsa e l'altra. Un attrezzo che varia di quattro volte su cio' che
   campiona mentre misura una differenza di uno o due punti, e che non lo
   dice, e' la stessa cecita' con un'altra faccia. Adesso --porta ripete
   (--ripeti, tre volte di default), STAMPA la dispersione, e ha un
   cancello che diventa rosso quando il rumore fra corse e' piu' grande
   della differenza fra assetti.

   uso:
     node strumenti/_t-bordi-prova.js --banco prima.html dopo.html [--striscia 40]
     node strumenti/_t-bordi-prova.js --porta prima.html dopo.html [senzatetto.html] [--ripeti 3]
     node strumenti/_t-bordi-prova.js --telefono <pacchetto> <navigazione>
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const bandiera = n => process.argv.includes('--' + n);
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const pausa = ms => new Promise(r => setTimeout(r, ms));
/* LA STRISCIA CHE IL SISTEMA RUBA NON LA MISURA QUESTO BANCO. Chromium non
   ha gesti di sistema: qui vale zero sempre, e uno zero che nessuno ha
   misurato messo dentro un confronto e' un cancello che vince da solo. Chi
   l'ha misurata col telefono (--telefono, prova 1) la passa a mano. */
const STRISCIA_DP = bandiera('striscia') ? +arg('striscia', '0') : null;

/* ---------------------------------------------------------------------
   I CANCELLI. Ogni misura ne registra uno; alla fine si stampano e si
   decide il codice d'uscita. Un cancello che non si puo' valutare NON e'
   un cancello passato: vale rosso, con la ragione scritta.
   --------------------------------------------------------------------- */
const CANCELLI = [];
function cancello(nome, esito, dettaglio) { CANCELLI.push({ nome, esito: esito === true, dettaglio }); }
function verdetto() {
  console.log('\n=== CANCELLI ===');
  let rossi = 0;
  for (const c of CANCELLI) {
    if (!c.esito) rossi++;
    console.log(`  [${c.esito ? 'ok  ' : 'ROSSO'}] ${c.nome}${c.dettaglio ? ' — ' + c.dettaglio : ''}`);
  }
  if (!CANCELLI.length) { console.log('  NESSUN CANCELLO VALUTATO: questo banco non ha misurato niente.'); return 1; }
  console.log(rossi ? `\n${rossi} cancelli su ${CANCELLI.length} sono rossi.` : `\ntutti e ${CANCELLI.length} i cancelli sono verdi.`);
  return rossi ? 1 : 0;
}

/* ------------------------------------------------------------------ */
const TIPI = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};
function servi(sostituto) {
  const S = sostituto ? path.resolve(sostituto) : '';
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (S && /CALCETTO-il-gioco\.html$/i.test(f)) f = S;
      if ((!f.startsWith(RADICE) && f !== S) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function apriPagina(file, viewport) {
  const { chromium } = require('playwright');
  const srv = await servi(file);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260819);
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  pag.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  return { pag, ctx, errori, chiudi: async () => { await ctx.close(); await browser.close(); srv.chiudi(); } };
}

/* ------------------------------------------------------------------ */
/*                         BANCO (Chromium)                             */
/* ------------------------------------------------------------------ */
/* LE SEI USCITE DEL CALCIO e i QUATTRO COMANDI IMMEDIATI. I secondi non
   sono calci: partono al touchDOWN (contrasto, passaggio, cambio, carica)
   e servono a sapere se un tocco sul bordo fa comunque qualcosa che il
   giocatore non ha chiesto.

   E SI FILTRANO SULLA SQUADRA UMANA, se no si contano i calci degli
   altri. Le prime prendono un TEAM, le seconde un GIOCATORE: sono due
   filtri diversi e vanno scritti tutt'e due. Senza il filtro questo
   banco ha letto «2 calci su 8» su una levetta il cui rilascio e' inerte
   per costruzione — erano gli avversari che giocavano mentre misuravo. */
const PER_TEAM = ['doPass', 'releaseCharge', 'doSlide', 'doFiltrante', 'cambiaGiocatore', 'startCharge'];
const PER_GIOC = ['fireShot', 'startSlide', 'doCross', 'kickBall'];
const CALCI = ['doPass', 'releaseCharge', 'fireShot', 'startSlide', 'doCross', 'kickBall'];
const COMANDI = ['doSlide', 'doFiltrante', 'cambiaGiocatore', 'startCharge'];
/* il testo delle spie: lo usano sia il banco sia il telefono, cosi' non
   possono divergere. */
const TESTO_SPIE = `(()=>{
  const T=${JSON.stringify(PER_TEAM)}, G=${JSON.stringify(PER_GIOC)};
  const manca=[]; for(const n of T.concat(G)) if(typeof window[n]!=='function') manca.push(n);
  if(manca.length) return {ok:false, manca};
  if(window.__conta) return {ok:true};
  window.__conta={};
  const mio = p => { try{ const i=window.ctrlDisegno(0); return i>=0 && window.__test.players[i]===p; }catch(e){ return false; } };
  for(const n of T){ window.__conta[n]=0; const F=window[n];
    window[n]=function(t){ if((t|0)===0) window.__conta[n]++; return F.apply(null,arguments); }; }
  for(const n of G){ window.__conta[n]=0; const F=window[n];
    window[n]=function(p){ if(mio(p)) window.__conta[n]++; return F.apply(null,arguments); }; }
  return {ok:true};
})()`;

async function banco(file, viewport) {
  const { pag, ctx, errori, chiudi } = await apriPagina(file, viewport);
  const cdp = await ctx.newCDPSession(pag);
  const giu = (x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  const muovi = (x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] });
  const su = () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const strappa = () => cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  const frame = () => pag.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

  await pag.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: 5 });
  });
  await pausa(1200);
  await frame();
  await pag.evaluate(() => { window.__test.setTimeLeft(9999); });
  const V = await pag.evaluate(() => ({ w: innerWidth, h: innerHeight, scena: window.__test.state }));

  /* -------- 1-2. la presa e l'anello, cercati -------- */
  const disarma = () => pag.evaluate(() => {
    const b = window.__test.ball; b.owner = -1;
    const c = window.__test.campo; b.x = c.FW / 2; b.y = c.FH / 2; b.vx = 0; b.vy = 0;
    window.__test.setTimeLeft(9999);
  });
  /* IL CONTESTO DEVE STARE FERMO MENTRE SI MISURA, e questa e' la trappola
     piu' sottile di tutto il banco.
     Il gioco dichiara «premuto» confrontando l'ATTO memorizzato al
     touchdown con l'atto che il pulsante ha ADESSO
     (CALCETTO-il-gioco.html:26067, `e.act===bt.act`). L'atto pero' dipende
     dal possesso: se fra il dito che scende e il fotogramma che si legge
     un giocatore raccoglie il pallone, CAMBIO diventa PASSAGGIO, il
     confronto fallisce e il pulsante risulta NON premuto pur essendolo.
     La bisezione ci costruisce sopra un confine falso: una corsa ha
     stampato «sbordo presa -7,85», cioe' una presa piu' PICCOLA del
     disco — un numero impossibile, e nessuno l'avrebbe fermato.
     Qui l'atto si legge prima e dopo: se e' cambiato, il campione non
     vale e si rifa'. Dopo quattro tentativi si dichiara non misurabile
     invece di restituire un numero. */
  async function premuto(x, y, idx) {
    for (let t = 0; t < 4; t++) {
      await disarma();
      const prima = await pag.evaluate(i => { const b = window.__test.pulsanti(0); return b[i] ? b[i].act : null; }, idx);
      await giu(x, y); await frame();
      const z = await pag.evaluate(() => (window.__test.comandiTouch || []).filter(q => q.tipo === 'pulsante').map(q => ({ p: !!q.premuto, act: q.act })));
      await strappa(); await frame();
      const d = z[idx];
      if (d && d.act === prima) return d.p;
    }
    return null;
  }
  /* L'ANELLO si misura da cio' che NON succede: fra presa e anello il
     tocco non preme il pulsante E NON accende la levetta. Oltre l'anello
     la levetta si accende. La levetta il gioco la dichiara in
     comandiTouch (tipo 'stick'), quindi non serve leggere Touch5. */
  async function levetta(x, y) {
    await disarma(); await giu(x, y); await frame();
    const c = await pag.evaluate(() => (window.__test.comandiTouch || []).some(q => q.tipo === 'stick'));
    await strappa(); await frame();
    return c;
  }
  await disarma(); await frame();
  const bottoni = await pag.evaluate(() => window.__test.pulsanti(0).map(b => ({ act: b.act, label: b.label, x: b.x, y: b.y, r: b.r })));

  /* LA DIREZIONE DELLA BISEZIONE DEVE ESSERE LIBERA **E DENTRO LO
     SCHERMO**, e la seconda meta' e' costata una corsa intera.
     La prima versione cercava VERSO IL BASSO: ma il pulsante grande sta
     a venti pixel dal fondo, quindi il punto «di sicuro fuori» a r+60
     cadeva oltre il bordo della finestra. Un tocco fuori finestra non e'
     un tocco che manca il pulsante — e' un tocco che non esiste, e la
     bisezione ne ricavava un confine che non voleva dire niente (una
     corsa ha stampato «presa NON MISURABILE» e un'altra «39,39 dal bordo
     destro» per lo stesso pulsante).
     Qui si cerca VERSO L'ALTO, che per tutt'e due i comandi e' libera (il
     vicino sta di fianco, non sopra) e sta comodamente in finestra; e
     ogni punto si controlla prima di posarlo. Le distanze dai bordi si
     ricavano dal raggio trovato: la presa e' un cerchio, quindi il raggio
     misurato in una direzione vale in tutte. */
  const inFinestra = (x, y) => x >= 0 && y >= 0 && x <= V.w && y <= V.h;
  /* pred puo' rispondere null = «non ho potuto misurare»: allora tutta la
     bisezione si arrende. Un ramo indeciso trattato come «no» produce un
     confine, e un confine e' un numero: e' cosi' che un banco mente. */
  async function limite(pred, cx, cy, dx, dy, massimo) {
    let dentro = 0, fuori = massimo;
    if (!inFinestra(cx + dx * fuori, cy + dy * fuori)) return null;  // fuori finestra: non si misura
    const lontano = await pred(cx + dx * fuori, cy + dy * fuori);
    if (lontano !== false) return null;                              // il lontano deve essere fuori
    const centro = await pred(cx, cy);
    if (centro !== true) return null;                                // il centro deve essere dentro
    while (fuori - dentro > 0.5) {
      const m = (dentro + fuori) / 2;
      const q = await pred(cx + dx * m, cy + dy * m);
      if (q === null) return null;
      if (q) dentro = m; else fuori = m;
    }
    return dentro;
  }
  const presa = [];
  for (let i = 0; i < bottoni.length; i++) {
    const b = bottoni[i];
    const basso = await limite((x, y) => premuto(x, y, i), b.x, b.y, 0, -1, Math.ceil(b.r + 60));
    const destro = (i === 0 && b.x + b.r + 60 <= V.w) ? await limite((x, y) => premuto(x, y, i), b.x, b.y, 1, 0, Math.ceil(b.r + 60)) : null;
    /* L'ANELLO: il primo raggio in cui la levetta si accende. Si cerca
       VERSO L'ALTO e non verso il basso — il pulsante grande sta a venti
       pixel dal fondo, quindi un raggio di r+80 verso il basso cadrebbe
       FUORI DALLO SCHERMO e la ricerca tornerebbe sempre «non trovato».
       (E' successo: la prima corsa di questo cancello ha stampato
       «misurato null» e la ragione era questa, non il gioco.) In alto la
       strada e' libera: il disco piccolo sta a 94 px di lato. */
    let anello = null;
    if (i === 0) {
      let dentro = 0, fuori = Math.ceil(b.r + 80);
      if (inFinestra(b.x, b.y - fuori) && !(await levetta(b.x, b.y)) && await levetta(b.x, b.y - fuori)) {
        while (fuori - dentro > 0.5) { const m = (dentro + fuori) / 2; if (await levetta(b.x, b.y - m)) fuori = m; else dentro = m; }
        anello = +(fuori - b.r).toFixed(2);
      }
    }
    let sbordo = basso === null ? null : +(basso - b.r).toFixed(2);
    /* UN RAGGIO IMPOSSIBILE NON E' UNA MISURA. La presa sborda dal disco:
       se il conto esce negativo (presa piu' piccola del disco) o piu'
       grande dell'anello, non e' un dato piccolo, e' un dato rotto — e
       stamparlo sarebbe peggio che non averlo. */
    if (sbordo !== null && (sbordo <= 0 || sbordo > b.r)) sbordo = null;
    presa.push({
      act: b.act, label: b.label, x: b.x, y: b.y, r: b.r, sbordo, anello,
      daDestra: sbordo === null ? null : +(V.w - (b.x + b.r + sbordo)).toFixed(2),
      daDestraDiretta: destro === null ? null : +(V.w - (b.x + destro)).toFixed(2),
      daFondo: basso === null ? null : +(V.h - (b.y + basso)).toFixed(2),
      discoSopra: +(b.y - b.r).toFixed(1),
    });
  }
  const varco = bottoni.length >= 2 ? +Math.hypot(bottoni[0].x - bottoni[1].x, bottoni[0].y - bottoni[1].y).toFixed(2) : null;

  /* -------- 3. il tocco strappato -------- */
  const arma = () => pag.evaluate(() => {
    const i = (typeof window.ctrlDisegno === 'function') ? window.ctrlDisegno(0) : -1;
    if (i < 0) return -1;
    const p = window.__test.players[i], b = window.__test.ball;
    b.owner = i; b.x = p.x; b.y = p.y; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0;
    p.charge = -1; p.chargeGo = null; p.slide = -1; p.recover = 0; p.rove = -1;
    window.__test.setTimeLeft(9999);
    if (window.__test.azzeraBordi) window.__test.azzeraBordi();
    return i;
  });
  const spie = await pag.evaluate(TESTO_SPIE);
  const spieOk = !!(spie && spie.ok);

  async function gesto(chiusura, punto, trascina, atteso) {
    const idx = await arma();
    if (idx < 0) return { valido: false };
    await frame();
    /* IL POSSESSO SI RIVERIFICA UN ISTANTE PRIMA DEL TOCCO. Fra arma() e
       il dito passa un fotogramma, e in un fotogramma un avversario puo'
       strappare il pallone: allora il pulsante grande non e' piu' TIRA ma
       CONTRASTA, e il tocco chiama doSlide/startSlide — un «calcio» che
       non c'entra niente col furto. Due gesti su otto finivano cosi', e il
       cancello leggeva «un tocco strappato calcia 2/8» dando la colpa al
       touchcancel. Un gesto senza possesso non e' un gesto sbagliato: e'
       un gesto DIVERSO, e si scarta. */
    const own = await pag.evaluate(() => window.__test.ball.owner);
    if (own !== idx) return { valido: false };
    await pag.evaluate(() => { for (const k in window.__conta) window.__conta[k] = 0; });
    await giu(punto.x, punto.y);
    await frame();
    /* E SI GUARDA CHE ATTO IL GIOCO HA RISOLTO. Se il possesso e' caduto
       proprio mentre il dito scendeva, il pulsante grande vale CONTRASTA
       e non TIRA: e' un gesto diverso, e mescolarlo qui significa
       attribuire al touchcancel un contrasto che il touchDOWN aveva gia'
       eseguito. Il gioco l'atto lo dichiara in comandiTouch. */
    if (atteso) {
      const att = await pag.evaluate(() => (window.__test.comandiTouch || []).filter(z => z.tipo === 'pulsante' && z.premuto).map(z => z.act));
      if (!att.includes(atteso)) { await chiusura(); return { valido: false }; }
    }
    if (trascina) for (let i = 1; i <= 5; i++) { await muovi(punto.x + i * 6, punto.y - i * 3); await pausa(16); }
    else await pausa(120);
    await chiusura();
    /* si legge SUBITO: un calcio parte dentro il gestore, sincrono. Un
       fotogramma dopo la partita e' gia' andata avanti e il segno si
       sporca in tutt'e due i versi. */
    const k = await pag.evaluate(() => Object.assign({}, window.__conta));
    const b = await pag.evaluate(() => window.__test.bordi ? { a: window.__test.bordi(0).annullati, s: window.__test.bordi(0).salvati } : null);
    const calci = CALCI.reduce((s, n) => s + k[n], 0);
    const comandi = COMANDI.reduce((s, n) => s + k[n], 0);
    return { valido: true, k, calci, comandi, bordi: b };
  }
  /* I CONTATORI DEL GIOCO SI LEGGONO GESTO PER GESTO, non alla fine.
     arma() li azzera prima di ogni gesto, quindi cio' che si legge subito
     dopo e' il DELTA di quel gesto solo. Leggerli in fondo alla corsa
     avrebbe restituito i numeri dell'ultimo gesto — e infatti la prima
     versione di questo cancello leggeva zero e non se ne accorgeva. */
  const conta = async (chiusura, punto, trascina, giri, atteso) => {
    let calci = 0, validi = 0, comandi = 0, annullati = 0, salvati = 0; const quali = {};
    for (let i = 0; i < giri; i++) {
      const r = await gesto(chiusura, punto, trascina, atteso);
      if (!r.valido) continue;
      validi++; if (r.calci) calci++; if (r.comandi) comandi++;
      for (const n in r.k) if (r.k[n]) quali[n] = (quali[n] || 0) + r.k[n];
      if (r.bordi) { annullati += r.bordi.a; salvati += r.bordi.s; }
    }
    return { calci, validi, comandi, annullati, salvati, quali };
  };
  const stick = { x: Math.round(V.w * 0.25), y: Math.round(V.h * 0.70) };
  const cBt = { x: Math.round(bottoni[0].x), y: Math.round(bottoni[0].y) };
  await pag.evaluate(() => window.__test.azzeraBordi && window.__test.azzeraBordi());
  const btnStrappato = await conta(strappa, cBt, false, 12, 'shot');
  const btnAlzato = await conta(su, cBt, false, 12, 'shot');         // IL CONTROLLO POSITIVO VERO
  const stickStrappata = await conta(strappa, stick, true, 12);
  const stickAlzata = await conta(su, stick, true, 12);      // inerte per costruzione

  /* -------- 4. la catena degli inserti, sulla cascata VERA -------- */
  const catena = await pag.evaluate(() => {
    if (!window.__test.bordi) return null;
    const out = {};
    out.sondaPresente = !!document.getElementById('inserti');
    /* (a) LA CASCATA. Si riscrive la regola #inserti con due letterali:
       se getComputedStyle li restituisce, la regola del foglio batte
       davvero il *{padding:0}. Con le env() questo non si puo' sapere,
       perche' in un browser da scrivania valgono 0 e sono DEFINITE. */
    const st = document.createElement('style');
    st.textContent = '#inserti{padding-right:30px;padding-bottom:34px}';
    document.head.appendChild(st);
    const el = document.getElementById('inserti');
    const cs = el ? getComputedStyle(el) : null;
    out.cascata = cs ? (cs.paddingRight === '30px' && cs.paddingBottom === '34px') : false;
    if (window.__insertiCambiati) window.__insertiCambiati();
    const d1 = window.__test.bordi(0);
    out.margineDaSonda = { destra: d1.margini.destra, fondo: d1.margini.fondo };
    st.remove();
    if (window.__insertiCambiati) window.__insertiCambiati();
    /* (b) il canale della shell */
    window.__insertiSistema = { l: 0, r: 40, t: 0, b: 0 };
    window.__insertiCambiati();
    const d = window.__test.bordi(0);
    out.margineDaShell = d.margini.destra;
    out.presaDaShell = d.comandi[0].daDestra;
    /* (c) il tetto sul fondo: un inserto enorme non deve alzare il disco
       oltre il fondo scala dichiarato */
    window.__insertiSistema = { l: 0, r: 0, t: 0, b: 400 };
    window.__insertiCambiati();
    const dt = window.__test.bordi(0);
    out.tetto = { chiesto: 400, ottenuto: dt.margini.fondo, fondoScala: dt.minimi.tettoFondo, discoSopra: dt.comandi[0].discoSopra };
    /* (d) e quando la shell tace, si torna al minimo */
    delete window.__insertiSistema;
    window.__insertiCambiati();
    out.margineTornato = window.__test.bordi(0).margini.destra;
    out.dich = window.__test.bordi(0);
    return out;
  });

  /* -------- 6. DUE GIOCATORI, che nessuno aveva mai misurato --------
     In 2P la squadra 0 tiene i comandi a SINISTRA (bx=0, s=+1), quindi il
     margine che conta e' BORDI.mL e non mR, e il verso della geometria e'
     specchiato. E' meta' della toppa, e finora nessun numero la
     riguardava: __test.bordi(t) esiste apposta. */
  const due = await pag.evaluate(() => {
    window.__test.startMatch(2, 1, { size: 5 });
    const out = {};
    for (const t of [0, 1]) {
      const b = window.__test.pulsanti(t).map(x => ({ act: x.act, x: +x.x.toFixed(1), y: +x.y.toFixed(1), r: x.r }));
      const d = window.__test.bordi ? window.__test.bordi(t) : null;
      out[t] = { b, varco: +Math.hypot(b[0].x - b[1].x, b[0].y - b[1].y).toFixed(2), d: d ? { comandi: d.comandi.map(q => ({ label: q.label, daSinistra: q.daSinistra, daDestra: q.daDestra, daFondo: q.daFondo })), margini: d.margini } : null };
    }
    return out;
  });

  await chiudi();
  return { file, viewport, V, presa, varco, spieOk, btnStrappato, btnAlzato, stickStrappata, stickAlzata, catena, due, errori };
}

function stampaBanco(r) {
  const eti = path.basename(r.file);
  console.log(`\n--- ${eti} --- viewport ${r.V.w}x${r.V.h} CSS, scena ${r.V.scena}`);
  for (const p of r.presa) {
    console.log(`  ${(p.label + ' (' + p.act + ')').padEnd(22)} centro (${Math.round(p.x)},${Math.round(p.y)}) r ${p.r}` +
      `  sbordo presa ${p.sbordo === null ? 'NON MISURABILE' : p.sbordo}` +
      (p.anello === null ? '' : `  anello ${p.anello}`) +
      `  ·  dal bordo destro ${p.daDestra === null ? '?' : p.daDestra}${p.daDestraDiretta === null ? '' : ' (diretta ' + p.daDestraDiretta + ')'}` +
      `  dal fondo ${p.daFondo === null ? '?' : p.daFondo}  ·  disco da y ${p.discoSopra}`);
  }
  console.log(`  varco fra i centri: ${r.varco}  (il gioco lo vuole sopra 90)`);
  const q = z => `${z.calci} calci / ${z.comandi} comandi su ${z.validi} gesti validi` +
    (Object.keys(z.quali).length ? '  [' + Object.entries(z.quali).map(([n, v]) => n + ' ' + v).join(', ') + ']' : '');
  console.log(`  pulsante grande RILASCIATO:  ${q(r.btnAlzato)}   <- IL CONTROLLO POSITIVO: se qui non parte niente, il banco e' cieco`);
  console.log(`  pulsante grande STRAPPATO:   ${q(r.btnStrappato)}   <- il furto non deve calciare`);
  console.log(`  levetta alzata normalmente:  ${q(r.stickAlzata)}   <- INERTE PER COSTRUZIONE (release torna false): lo zero qui non prova niente`);
  console.log(`  levetta STRAPPATA:           ${q(r.stickStrappata)}`);

  const nome = n => eti + ': ' + n;
  cancello(nome('le spie sono installate'), r.spieOk === true, r.spieOk ? '' : 'una delle dieci funzioni non sta su window');
  cancello(nome('controllo positivo — un rilascio VERO del pulsante calcia'),
    r.btnAlzato.validi > 0 && r.btnAlzato.calci > 0,
    `${r.btnAlzato.calci}/${r.btnAlzato.validi}`);
  cancello(nome('un tocco STRAPPATO non calcia'),
    r.btnStrappato.validi > 0 && r.btnStrappato.calci === 0,
    `${r.btnStrappato.calci}/${r.btnStrappato.validi}`);
  cancello(nome('la levetta strappata non calcia'),
    r.stickStrappata.validi > 0 && r.stickStrappata.calci === 0,
    `${r.stickStrappata.calci}/${r.stickStrappata.validi}`);
  cancello(nome('il varco fra i due comandi resta sopra 90'), r.varco !== null && r.varco > 90, String(r.varco));
  cancello(nome('nessun errore in console'), r.errori.length === 0, r.errori.slice(0, 2).join(' | '));

  if (r.catena) {
    const k = r.catena, d = k.dich;
    console.log(`  il gioco dichiara: inserti l${d.inserti.l} r${d.inserti.r} b${d.inserti.b} · gesto l${d.gesto.l} r${d.gesto.r} b${d.gesto.b}` +
      ` · margini sx ${d.margini.sinistra} dx ${d.margini.destra} fondo ${d.margini.fondo} (tetto ${d.minimi.tettoFondo})` +
      ` · presa ${d.presa} · anello ${d.anello} · annullati ${d.annullati} salvati ${d.salvati}`);
    console.log(`  catena: sonda ${k.sondaPresente}; la CASCATA arriva ${k.cascata} (7px/11px letti da getComputedStyle);` +
      ` sonda -> margini dx ${k.margineDaSonda.destra} fondo ${k.margineDaSonda.fondo};` +
      ` gesto 40 -> margine ${k.margineDaShell}, presa a ${k.presaDaShell} dal bordo; tolto tutto -> ${k.margineTornato}`);
    console.log(`  tetto: inserto ${k.tetto.chiesto} -> margine fondo ${k.tetto.ottenuto} (fondo scala ${k.tetto.fondoScala}), disco alto y ${k.tetto.discoSopra}`);
    cancello(nome('la sonda degli inserti esiste'), k.sondaPresente === true);
    cancello(nome('la regola #inserti batte il *{padding:0} — cascata provata coi letterali'), k.cascata === true);
    /* 30 px di lato stanno SOPRA il pavimento (24) e sotto nessun tetto:
       il margine deve diventare 30. 34 px dal fondo stanno sopra il
       pavimento (20) ma anche sopra il TETTO (20): il margine deve
       restare 20. Le due righe insieme provano che il canale arriva E
       che il tetto tiene. */
    cancello(nome('la sonda muove i margini di lato'), k.margineDaSonda.destra === 30, `dx ${k.margineDaSonda.destra} (chiesti 30)`);
    cancello(nome('la sonda NON scavalca il tetto dal fondo'), k.margineDaSonda.fondo === d.minimi.tettoFondo,
      `fondo ${k.margineDaSonda.fondo} (chiesti 34, tetto ${d.minimi.tettoFondo})`);
    cancello(nome('il canale della shell muove la geometria'), k.margineDaShell === 40 && k.presaDaShell === 40,
      `margine ${k.margineDaShell}, presa ${k.presaDaShell}`);
    cancello(nome('il margine dal fondo ha un TETTO'), k.tetto.ottenuto === k.tetto.fondoScala,
      `chiesto ${k.tetto.chiesto}, ottenuto ${k.tetto.ottenuto}, fondo scala ${k.tetto.fondoScala}`);
    cancello(nome('se la shell tace il margine torna al minimo'), k.margineTornato === 24, String(k.margineTornato));
    cancello(nome('l\'anello di esclusione sta SOPRA la presa'), d.anello > d.presa, `presa ${d.presa}, anello ${d.anello}`);
    const p0 = r.presa[0];
    cancello(nome('l\'anello MISURATO coincide con quello dichiarato'),
      p0.anello !== null && Math.abs(p0.anello - d.anello) <= 1,
      `misurato ${p0.anello}, dichiarato ${d.anello}`);
    cancello(nome('la presa MISURATA coincide con quella dichiarata'),
      p0.sbordo !== null && Math.abs(p0.sbordo - d.presa) <= 1,
      `misurata ${p0.sbordo}, dichiarata ${d.presa}`);
    /* I CONTATORI DEL GIOCO CONTRO LE SPIE, che e' l'unico modo di
       sapere se contano davvero.
       · otto strappi sul pulsante -> otto annullati, uno per gesto;
       · otto RILASCI veri -> zero annullati (end non e' cancel);
       · e SALVATI: ogni strappo sul pulsante interrompe una carica aperta
         col pallone al piede, quindi salvati deve valere otto. Se valesse
         di piu' conterebbe furti che non avrebbero calciato — che e'
         esattamente il modo in cui un contatore gonfia un difetto. */
    console.log(`  contatori del gioco: strappi sul pulsante -> annullati ${r.btnStrappato.annullati}, salvati ${r.btnStrappato.salvati}` +
      ` · rilasci veri -> annullati ${r.btnAlzato.annullati}, salvati ${r.btnAlzato.salvati}` +
      ` · levetta strappata -> annullati ${r.stickStrappata.annullati}, salvati ${r.stickStrappata.salvati}`);
    cancello(nome('BORDI.annullati conta UN furto per strappo'),
      r.btnStrappato.annullati === r.btnStrappato.validi,
      `${r.btnStrappato.annullati} su ${r.btnStrappato.validi} strappi`);
    cancello(nome('BORDI.annullati NON conta i rilasci veri'), r.btnAlzato.annullati === 0, `${r.btnAlzato.annullati}`);
    cancello(nome('BORDI.salvati conta i furti che avrebbero calciato'),
      r.btnStrappato.salvati === r.btnStrappato.validi,
      `${r.btnStrappato.salvati} su ${r.btnStrappato.validi} strappi, e il rilascio vero calcia ${r.btnAlzato.calci}/${r.btnAlzato.validi}`);
    cancello(nome('BORDI.salvati resta ZERO sulla levetta (release e\' inerte: non c\'e\' niente da salvare)'),
      r.stickStrappata.salvati === 0, `${r.stickStrappata.salvati}`);
  } else {
    console.log('  il gioco NON dichiara i bordi (__test.bordi assente): questa e\' la versione senza toppa');
  }
  if (r.due) {
    console.log('  DUE GIOCATORI (2P, schermo diviso):');
    for (const t of [0, 1]) {
      const u = r.due[t];
      console.log(`    squadra ${t} (comandi a ${t === 0 ? 'SINISTRA' : 'destra'}): ` +
        u.b.map(q => `${q.act}(${q.x},${q.y})`).join(' ') + ` · varco ${u.varco}` +
        (u.d ? ` · presa dal bordo: ` + u.d.comandi.map(q => `${q.label} sx ${q.daSinistra} dx ${q.daDestra} fondo ${q.daFondo}`).join(' | ') : ''));
    }
    cancello(nome('2P: il varco regge su tutt\'e due i lati'),
      r.due[0].varco > 90 && r.due[1].varco > 90, `sx ${r.due[0].varco}, dx ${r.due[1].varco}`);
    if (r.due[0].d) {
      const s0 = Math.min(...r.due[0].d.comandi.map(q => q.daSinistra));
      const f0 = Math.min(...r.due[0].d.comandi.map(q => q.daFondo));
      /* IL CANCELLO DI IERI ERA IL GIOCO CONTRO SE STESSO, e il critico
         l'ha smontato in una riga: confrontava la presa con
         `d.margini.sinistra`, cioe' col margine che il gioco ha appena
         dichiarato. Ma daSinistra = max(24, mL, ...) >= mL PER
         COSTRUZIONE: quel confronto non puo' fallire nemmeno se qualcuno
         porta MIN_LAT a zero, perche' allora scendono tutti e due insieme.
         Un cancello che non puo' diventare rosso non e' un cancello.
         Adesso il pavimento e' scritto QUI, in questo banco: se il gioco
         abbassa il proprio minimo, il numero del gioco scende e questo no,
         e la riga diventa rossa. */
      const PAV_LAT = 24, PAV_BOT = 20;
      console.log(`    pavimento preteso DA QUESTO BANCO (non chiesto al gioco): ${PAV_LAT} px di lato, ${PAV_BOT} dal fondo`);
      cancello(nome(`2P: la presa della squadra 0 sta oltre il pavimento scritto nel banco (${PAV_LAT}/${PAV_BOT})`),
        s0 >= PAV_LAT - 0.01 && f0 >= PAV_BOT - 0.01,
        `dal bordo sinistro ${s0}, dal fondo ${f0} · il gioco dichiara margini ${r.due[0].d.margini.sinistra}/${r.due[0].d.margini.fondo}`);
      /* E IL PAVIMENTO NON E' LA STRISCIA RUBATA. Ventiquattro px sono una
         scelta di casa, non la misura di un telefono: sul OnePlus 6 la
         striscia rubata sul bordo SINISTRO e' stata misurata a 40 dp, cioe'
         sedici piu' del pavimento. Questo banco non la puo' misurare
         (Chromium non ha gesti di sistema) e quindi non deve fingere: o
         gliela si passa con --striscia N e allora il cancello e' vero, o
         si stampa che non e' misurata. */
      if (STRISCIA_DP !== null)
        cancello(nome('2P: la presa della squadra 0 sta FUORI dalla striscia rubata misurata sul telefono'),
          s0 >= STRISCIA_DP, `presa a ${s0} px dal bordo sinistro, striscia rubata ${STRISCIA_DP} dp`);
      else
        console.log('    striscia rubata sul bordo SINISTRO: NON MISURATA da questo banco (Chromium non ha');
      if (STRISCIA_DP === null)
        console.log('    gesti di sistema). Chi l\'ha misurata sul telefono la passa con --striscia N.');
    }
  }
  if (r.errori.length) console.log('  errori in console: ' + r.errori.slice(0, 3).join(' | '));
}

/* ------------------------------------------------------------------ */
/*        PORTA — la bocca della porta contro i dischi dei comandi      */
/* ------------------------------------------------------------------ */
/* IL PERCHE'. Il commento del gioco dice che la bocca della porta
   attaccata «finisce fra y 296 e y 302» e che i dischi stanno a 310/312
   apposta per starle sotto. Quel numero viene da otto FERMI IMMAGINE, non
   da una distribuzione: la bocca segue la camera, e la camera segue il
   pallone. Prima di alzare un disco di dieci pixel bisogna sapere dove la
   bocca sta DAVVERO, e per quanto tempo.
   COME. La bocca il gioco la dichiara gia': __test.copertura() incrocia i
   soggetti chiave — fra cui 'porta' — con this.zoneInterfaccia(). Quella
   funzione si puo' sostituire con un PETTINE di strisce alte e larghe un
   pixel: le strisce che riportano il soggetto danno il suo rettangolo
   esatto. Non si tocca il gioco, si scambia una funzione di __test.
   POI: gli stessi campioni si giudicano contro TUTTI gli assetti dei
   comandi (base, toppa a inserto 0, 32, 48), cosi' la differenza fra due
   assetti e' la differenza fra due assetti e non fra due partite. */
const SONDA_PORTA = `(()=>{
  const T=window.__test;
  T.__rett=function(quale){
    const O=T.zoneInterfaccia;
    const con=(gen)=>{ T.zoneInterfaccia=gen; let f=[]; try{f=T.copertura();}catch(e){} T.zoneInterfaccia=O; return f; };
    const fy=con(()=>{const z=[];for(let y=0;y<innerHeight;y++)z.push({tipo:'r'+y,x0:-9,y0:y,x1:innerWidth+9,y1:y+1,alfa:1});return z;});
    const yy=fy.filter(q=>q.soggetto===quale).map(q=>+q.pannello.slice(1));
    if(!yy.length) return null;
    const fx=con(()=>{const z=[];for(let x=0;x<innerWidth;x++)z.push({tipo:'c'+x,x0:x,y0:-9,x1:x+1,y1:innerHeight+9,alfa:1});return z;});
    const xx=fx.filter(q=>q.soggetto===quale).map(q=>+q.pannello.slice(1));
    return {x0:Math.min(...xx), x1:Math.max(...xx)+1, y0:Math.min(...yy), y1:Math.max(...yy)+1};
  };
  return 1;
})()`;
const INSERTI = [['0', null], ['32', { l: 24, r: 24, b: 32 }], ['48', { l: 40, r: 40, b: 48 }]];
/* la stessa forma che usa copertura(): disco tondo contro rettangolo */
function copre(rect, cx, cy, raggio) {
  const dx = Math.max(cx - rect.x1, 0, rect.x0 - cx), dy = Math.max(cy - rect.y1, 0, rect.y0 - cy);
  if (Math.hypot(dx, dy) >= raggio) return 0;
  const ix = Math.min(rect.x1, cx + raggio) - Math.max(rect.x0, cx - raggio);
  const iy = Math.min(rect.y1, cy + raggio) - Math.max(rect.y0, cy - raggio);
  return Math.max(0, ix) * Math.max(0, iy);
}
async function assetti(file, taglia, viewport) {
  const { pag, chiudi } = await apriPagina(file, viewport);
  await pag.evaluate(t => { window.__test.dismissSplash && window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: t }); }, taglia);
  await pausa(900);
  const out = {};
  for (const [n, i] of INSERTI) {
    out[n] = await pag.evaluate(b => {
      if (b) window.__insertiSistema = { l: b.l, r: b.r, b: b.b }; else delete window.__insertiSistema;
      if (window.__insertiCambiati) window.__insertiCambiati();
      const bd = window.__test.bordi ? window.__test.bordi(0) : null;
      return { bt: window.__test.pulsanti(0).map(x => ({ x: x.x, y: x.y, r: x.r })), mB: bd ? bd.margini.fondo : null };
    }, i || null);
    if (!out[n].mB) break;   // la versione senza toppa non ha inserti: un assetto solo
  }
  await chiudi();
  return out;
}
async function campionaPorta(file, taglia, viewport, secondi) {
  const { pag, chiudi } = await apriPagina(file, viewport);
  await pag.evaluate(t => { window.__test.dismissSplash && window.__test.dismissSplash(); window.__test.startMatch(1, 1, { size: t }); }, taglia);
  await pausa(900);
  await pag.evaluate(SONDA_PORTA);
  /* SQUADRA 0 ALLA CPU: senza un dito la squadra umana non attacca mai e
     la bocca della porta attaccata non entra quasi mai in quadro — si
     misurerebbe una partita che nessuno gioca. posaHUD tiene i comandi
     disegnati, che e' la condizione perche' esistano da coprire. */
  await pag.evaluate(() => { window.__test.setCpuVsCpu(true); window.__test.posaHUD(true); });
  const part = [], t0 = Date.now();
  while (Date.now() - t0 < secondi * 1000) {
    part.push(await pag.evaluate(() => { const T = window.__test; T.setTimeLeft(9999); return { r: T.__rett('porta'), alfa: T.zoneInterfaccia().filter(z => z.tipo === 'pulsante').map(z => z.alfa) }; }));
    await pausa(45);
  }
  /* la SPAZZATA: il caso peggiore, che una partita corta puo' non pescare */
  const spaz = [];
  const c = await pag.evaluate(() => window.__test.campo);
  for (const fx of [0.995, 0.96, 0.9, 0.82, 0.72, 0.62])
    for (const fy of [0.04, 0.15, 0.28, 0.4, 0.5, 0.6, 0.72, 0.85, 0.96]) {
      for (let k = 0; k < 10; k++) {
        await pag.evaluate(([x, y]) => { const b = window.__test.ball; b.owner = -1; b.x = x; b.y = y; b.vx = 0; b.vy = 0; b.z = 0; window.__test.setTimeLeft(9999); }, [c.FW * fx, c.FH * fy]);
        await pausa(45);
      }
      const r = await pag.evaluate(() => window.__test.__rett('porta'));
      if (r) spaz.push(r);
    }
  await chiudi();
  return { part, spaz };
}

/* ------------------------------------------------------------------ */
/*                    TELEFONO (la catena vera)                         */
/* ------------------------------------------------------------------ */
const TARA = path.join(__dirname, 'pollici-taratura.json');
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
        async js(expr) {
          const r = await this.manda('Runtime.evaluate', { expression: expr, returnByValue: true });
          if (r.result && r.result.exceptionDetails) throw new Error('JS: ' + JSON.stringify(r.result.exceptionDetails.exception || {}).slice(0, 200));
          return r.result && r.result.result ? r.result.result.value : undefined;
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}
async function collega(adb, dev) {
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  for (let i = 0; i < 25; i++) {
    const u = sh('shell', 'cat', '/proc/net/unix');
    const p = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
    if (p) {
      try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
      sh('forward', 'tcp:9222', 'localabstract:' + p);
      for (let k = 0; k < 25; k++) {
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
const SPIA = `(()=>{ if(!window.__spia){ const s={eventi:[]}; window.__spia=s;
  for(const t of ['touchstart','touchmove','touchend','touchcancel'])
    document.addEventListener(t, ev=>{ for(const q of ev.changedTouches) s.eventi.push({tipo:t,x:+q.clientX.toFixed(1),y:+q.clientY.toFixed(1)}); }, {capture:true,passive:true}); }
  window.__spia.eventi.length=0; return 'ok'; })()`;

async function telefono() {
  /* LE SPIE SUL TELEFONO NON POSSONO AVVOLGERE Touch5: e' una const
     lessicale (CALCETTO-il-gioco.html:8806), NON sta su window. La prima
     edizione di questo file provava a fare `window.Touch5.release`, il
     riferimento lanciava, l'eccezione non veniva letta e il banco
     stampava zero calci PER SEMPRE. E' il difetto peggiore che possa
     avere uno strumento: un verde che non guarda niente. Qui si
     avvolgono le funzioni DICHIARATE, si verifica che ci siano, e se una
     manca il banco esce rosso senza stampare un numero. */
  const PKG = arg('telefono', null) || arg('pacchetto', 'it.dopolavoro.calcetto');
  const NAV = arg('navigazione', null);
  const GIRI = +(arg('giri', '6'));
  const adb = trovaAdb();
  if (!adb) { console.error('adb non trovato'); process.exit(2); }
  const righe = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 }).split('\n').slice(1).map(r => r.trim()).filter(Boolean);
  const disp = righe.filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) {
    console.error('NESSUN TELEFONO PRONTO. adb dice:\n  ' + (righe.join('\n  ') || '(nessun dispositivo)'));
    console.error('Mi fermo invece di inventare un numero: questa misura si fa sul telefono o non si fa.');
    process.exit(2);
  }
  const dev = disp[0];
  /* CAMBIARE LA MODALITA' DI NAVIGAZIONE FA RIPARTIRE SystemUI, e per
     qualche secondo adb dichiara il telefono `offline`. La prima corsa e'
     morta cosi': un force-stop sul dispositivo che non c'era piu' ha
     buttato giu' tutte e quattro le combinazioni. Qui il canale con adb
     si aspetta invece di darlo per scontato — e se non torna entro un
     minuto, ci si ferma dicendo perche'. */
  function vivo() {
    try { return /\tdevice$/m.test(execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 30000 })); } catch (e) { return false; }
  }
  function attendi(quanto = 60000) {
    const t0 = Date.now();
    while (Date.now() - t0 < quanto) { if (vivo()) return true; try { execFileSync(adb, ['wait-for-device'], { timeout: 8000 }); } catch (e) { } }
    return vivo();
  }
  const sh = (...a) => {
    for (let t = 0; t < 3; t++) {
      try { return execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 }); }
      catch (e) { if (t === 2) throw e; attendi(); }
    }
  };
  if (!/uid=0/.test(sh('shell', 'su', '-c', 'id'))) { console.error('serve root per scrivere su /dev/input/event2'); process.exit(2); }
  const navPrima = (sh('shell', 'cmd', 'overlay', 'list', 'android').split('\n').find(r => /^\[x\].*navbar/.test(r.trim())) || '').trim().replace('[x] com.android.internal.systemui.navbar.', '');
  /* ACCENDERE UN SOVRAPPOSTO NON BASTA: SE NE SPEGNE UNO.
     `cmd overlay enable threebutton` lascia acceso anche `gestural`, i due
     confliggono e vince quello di prima. Il telefono ha risposto
     `navigation_mode=2` — cioe' ancora a gesti — mentre il banco stampava
     «navigazione threebutton»: la corsa «senza furto» stava misurando il
     furto, con l'etichetta sbagliata sopra. Adesso si spengono tutti gli
     altri, e SI VERIFICA il numero che il telefono dichiara: 0 = tre
     tasti, 2 = gesti. Se non corrisponde, non si misura.  */
  const TUTTI = ['gestural', 'gestural_narrow_back', 'gestural_wide_back', 'gestural_extra_wide_back', 'threebutton'];
  const ATTESO = { threebutton: '0', gestural: '2', gestural_narrow_back: '2', gestural_wide_back: '2', gestural_extra_wide_back: '2' };
  if (NAV) {
    for (const o of TUTTI) if (o !== NAV) { try { sh('shell', 'cmd', 'overlay', 'disable', 'com.android.internal.systemui.navbar.' + o); } catch (e) { } }
    sh('shell', 'cmd', 'overlay', 'enable', 'com.android.internal.systemui.navbar.' + NAV);
    await pausa(3000); attendi(); await pausa(2500);
  }
  const navOra = sh('shell', 'settings', 'get', 'secure', 'navigation_mode').trim();
  if (NAV && ATTESO[NAV] && navOra !== ATTESO[NAV]) {
    console.error(`HO CHIESTO ${NAV} (navigation_mode ${ATTESO[NAV]}) MA IL TELEFONO DICE ${navOra}.`);
    console.error('Misurare con l\'etichetta sbagliata e\' peggio che non misurare: mi fermo.');
    cancello('telefono: la modalita\' di navigazione e\' quella chiesta', false, `chiesta ${NAV}, navigation_mode ${navOra}`);
    return;
  }
  console.log(`=== BORDI SUL TELEFONO VERO ===`);
  console.log(`${dev} · ${sh('shell', 'getprop', 'ro.product.model').trim()} · Android ${sh('shell', 'getprop', 'ro.build.version.release').trim()}`);
  console.log(`pacchetto ${PKG} · navigazione ${NAV || navPrima} (navigation_mode=${navOra}) · era ${navPrima}`);

  let uscita = 1;
  try {
    sh('shell', 'am', 'force-stop', PKG);
    sh('shell', 'am', 'start', '-W', '-n', PKG + '/it.dopolavoro.gioco.Gioco');
    await pausa(3000);
    let c = await collega(adb, dev);
    if (!c) { console.error('nessun filo con la WebView'); return; }
    for (let i = 0; i < 50; i++) { if (await c.js('!!window.__test')) break; await pausa(300); }
    await c.js(`window.__test.dismissSplash&&window.__test.dismissSplash(); window.__test.startMatch(1,1,{size:5}); 1`);
    await pausa(1800);
    await c.js(SPIA);
    const spie = await c.js(TESTO_SPIE);
    cancello('telefono: le spie sono installate', !!(spie && spie.ok), spie && spie.manca ? 'mancano ' + spie.manca.join(',') : '');
    if (!spie || !spie.ok) { c.chiudi(); return; }

    const V = JSON.parse(await c.js('JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio})'));
    const bt = JSON.parse(await c.js('JSON.stringify(window.__test.pulsanti(0))'));
    const bdS = await c.js('window.__test.bordi?JSON.stringify(window.__test.bordi(0)):""');
    const bd = bdS ? JSON.parse(bdS) : null;
    console.log(`pagina ${V.w}x${V.h} CSS a dpr ${V.dpr} · comandi ` + bt.map(b => `${b.label}(${b.x.toFixed(0)},${b.y.toFixed(0)}) r${b.r}`).join(' '));
    const presaDx = bd ? bd.comandi[0].daDestra : +(V.w - (bt[0].x + bt[0].r + 10)).toFixed(0);
    const presaFo = bd ? bd.comandi[0].daFondo : +(V.h - (bt[0].y + bt[0].r + 10)).toFixed(0);
    if (bd) console.log(`  DICHIARA: margini sx ${bd.margini.sinistra} dx ${bd.margini.destra} fondo ${bd.margini.fondo} · presa ${bd.presa} · anello ${bd.anello} · env l${bd.inserti.l} r${bd.inserti.r} b${bd.inserti.b} · gesto l${bd.gesto.l} r${bd.gesto.r} b${bd.gesto.b} · shell ${bd.shell}`);
    else console.log('  NON dichiara i bordi: versione senza toppa.');
    console.log(`  la presa del grande arriva a ${presaDx} px dal bordo destro e ${presaFo} dal fondo`);

    const tar = fs.existsSync(TARA) ? JSON.parse(fs.readFileSync(TARA, 'utf8')) : null;
    if (!tar || !tar.indietro) { console.error('manca la taratura: lancia prima  node strumenti/pollici.js --taratura'); c.chiudi(); return; }
    if (tar.viewport.w !== V.w || tar.viewport.h !== V.h) {
      console.error(`LA TARATURA E' PER ${tar.viewport.w}x${tar.viewport.h} MA LA PAGINA E' ${V.w}x${V.h}: le coordinate sarebbero sbagliate. Mi fermo.`);
      c.chiudi(); return;
    }
    const inv = tar.indietro;
    const P = (cx, cy) => ({ px: inv.a * cx + inv.b * cy + inv.c, py: inv.d * cx + inv.e * cy + inv.f });
    const { Vetro } = require('./_vetro.js');
    const vetro = new Vetro(adb, dev);
    vetro.PASSO_MS = 10;
    await pausa(600);

    let rinascite = 0;
    const arma = () => c.js(`(()=>{const T=window.__test;
      if(typeof G!=='undefined'&&G.paused&&typeof setPaused==='function') setPaused(false);
      if(T.state!=='play'&&T.state!=='kickoff'&&T.state!=='golden'){ T.startMatch(1,1,{size:5}); return -2; }
      const i=(typeof window.ctrlDisegno==='function')?window.ctrlDisegno(0):-1; if(i<0) return -1;
      const p=T.players[i],b=T.ball; b.owner=i;b.x=p.x;b.y=p.y;b.vx=0;b.vy=0;b.z=0;b.vz=0;
      p.charge=-1; p.chargeGo=null; p.slide=-1; p.recover=0; p.rove=-1;
      T.setTimeLeft(9999); for(const k in window.__conta) window.__conta[k]=0; return i;})()`);

    /* IL GESTO DAL FONDO E' HOME: manda l'app dietro. E riportarla davanti
       NON BASTA — l'attivita' viene ricreata, la WebView e' un'altra, il
       filo con DevTools e' morto e le spie sono sparite insieme alla
       pagina. Chiedere qualcosa a quel filo restituisce `undefined`, che
       JSON.parse trasforma in un errore a meta' corsa (e' successo). Qui
       si rileva, si riporta davanti, e SE il filo e' morto si rifa' tutto:
       collegamento, spie, partita. Un banco che non sa rimettersi in piedi
       dopo il gesto che sta misurando non puo' misurare quel gesto. */
    async function inPrimoPiano() {
      for (let t = 0; t < 6; t++) {
        let vivo = false;
        try { vivo = (await c.js('typeof document!=="undefined" && !document.hidden && !!window.__test')) === true; } catch (e) { }
        if (vivo) {
          if ((await c.js('!!window.__conta')) !== true) { await c.js(SPIA); await c.js(TESTO_SPIE); }
          return true;
        }
        try { sh('shell', 'monkey', '-p', PKG, '-c', 'android.intent.category.LAUNCHER', '1'); } catch (e) { }
        await pausa(1500);
        try { c.chiudi(); } catch (e) { }
        const nc = await collega(adb, dev);
        if (nc) {
          c = nc;
          for (let i = 0; i < 40; i++) { try { if (await c.js('!!window.__test')) break; } catch (e) { } await pausa(300); }
          try {
            if ((await c.js('window.__test.state')) === 'menu') { await c.js(`window.__test.dismissSplash&&window.__test.dismissSplash(); window.__test.startMatch(1,1,{size:5}); 1`); await pausa(1500); }
            await c.js(SPIA); await c.js(TESTO_SPIE);
          } catch (e) { }
          rinascite++;
        }
      }
      return false;
    }
    async function grezzo(x0, y0, x1, y1, passi) {
      await arma();
      await c.js('window.__spia.eventi.length=0; for(const k in window.__conta) window.__conta[k]=0; 1');
      const rott0 = vetro.rotture;
      const A = P(x0, y0); vetro.giu(0, A.px, A.py); await pausa(40);
      for (let i = 1; i <= passi; i++) { const t = i / passi, Q = P(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t); vetro.muovi(0, Q.px, Q.py); await pausa(18); }
      await pausa(50); vetro.su(0); await pausa(380);
      const ev = JSON.parse(await c.js('JSON.stringify(window.__spia.eventi)') || '[]');
      const k = JSON.parse(await c.js('JSON.stringify(window.__conta)'));
      const st = JSON.parse(await c.js(`JSON.stringify({paused:(typeof G!=='undefined')?!!G.paused:null, scena:window.__test.state})`));
      const n = t => ev.filter(e => e.tipo === t).length;
      /* DOVE la pagina crede che il dito sia sceso. Non e' una curiosita':
         su questo telefono un dito che parte dal bordo viene consegnato
         alla pagina DECINE DI PIXEL PIU' DENTRO, e il touchdown finto
         puo' cadere sopra un comando. Senza questa coordinata il banco
         vedrebbe «un comando e' partito» e non saprebbe da dove. */
      const s1 = ev.find(e => e.tipo === 'touchstart');
      return { start: n('touchstart'), cancel: n('touchcancel'), k, st, rotto: vetro.rotture !== rott0,
        giu1: s1 ? { x: s1.x, y: s1.y } : null,
        calci: CALCI.reduce((s, q) => s + k[q], 0), comandi: COMANDI.reduce((s, q) => s + k[q], 0) };
    }
    const controllo = async () => {
      const r = await grezzo(Math.round(bt[0].x), Math.round(bt[0].y), Math.round(bt[0].x), Math.round(bt[0].y), 2);
      return r.calci + r.comandi > 0 && !r.rotto;
    };
    /* OGNI CAMPIONE PORTA IL SUO CONTROLLO. Il canale d'ingresso si
       disallinea, e allora NIENTE arriva: e' lo stesso zero del furto. */
    let buttati = 0;
    async function prova(x0, y0, x1, y1, passi) {
      for (let t = 0; t < 4; t++) {
        const r = await grezzo(x0, y0, x1, y1, passi);
        if (await inPrimoPiano() && !r.rotto && await controllo()) return r;
        buttati++; await pausa(500); await inPrimoPiano();
      }
      return null;
    }
    const tap = (x, y) => prova(x, y, x, y, 2);

    let ok0 = 0; for (let g = 0; g < 4; g++) if (await controllo()) ok0++;
    console.log(`\n0) CONTROLLO POSITIVO — dito sul centro del pulsante: risponde ${ok0}/4`);
    cancello('telefono: il banco non e\' cieco (il pulsante risponde al dito vero)', ok0 > 0, `${ok0}/4`);
    if (ok0 === 0) { vetro.chiudi(); c.chiudi(); return; }

    console.log('\n1) LA STRISCIA IN CUI IL SISTEMA SI PRENDE IL DITO (strisciata di 90 px verso l\'interno)');
    const scala = [2, 5, 8, 12, 16, 20, 24, 30, 40];
    const strisce = {};
    for (const [nome, fai] of [
      ['destro', d => [V.w - d, Math.round(V.h * 0.55), V.w - d - 90, Math.round(V.h * 0.55)]],
      ['sinistro', d => [d, Math.round(V.h * 0.55), d + 90, Math.round(V.h * 0.55)]],
      ['fondo', d => [Math.round(V.w * 0.5), V.h - d, Math.round(V.w * 0.5), V.h - d - 90]],
    ]) {
      const es = [];
      for (const d of scala) { const [a, b, x, y] = fai(d); es.push({ d, r: await prova(a, b, x, y, 8) }); }
      const buoni = es.filter(e => e.r);
      const rub = buoni.filter(e => e.r.start === 0 || e.r.cancel > 0).map(e => e.d);
      strisce[nome] = { rub, n: buoni.length, persi: es.length - buoni.length, pause: buoni.filter(e => e.r.st.paused).length };
      console.log(`   bordo ${nome.padEnd(9)} ` + es.map(e => e.r ? `${e.d}${(e.r.start === 0 || e.r.cancel > 0) ? 'R' : '.'}` : `${e.d}?`).join(' ') +
        `   rubati {${rub.join(',')}}   · pause causate ${strisce[nome].pause}/${buoni.length}` + (strisce[nome].persi ? `   · ${strisce[nome].persi} PERSI` : ''));
    }
    const largh = n => strisce[n].rub.length ? Math.max(...strisce[n].rub) : 0;
    console.log(`   larghezza misurata della striscia rubata: destro ${largh('destro')}, sinistro ${largh('sinistro')}, fondo ${largh('fondo')} px CSS (= dp)`);

    console.log('\n2) DOVE COMINCIA LA PRESA, cercata col dito VERO (bisezione a 1 px)');
    async function confine(gen, lo, hi) {
      const r0 = await tap(...gen(hi)); if (!r0 || r0.calci + r0.comandi === 0) return null;
      while (hi - lo > 1) { const m = Math.round((lo + hi) / 2); const r = await tap(...gen(m)); if (!r) return null; if (r.calci + r.comandi > 0) hi = m; else lo = m; }
      return hi;
    }
    const cD = await confine(d => [V.w - d, Math.round(bt[0].y)], 1, 48);
    const cF = await confine(d => [Math.round(bt[0].x), V.h - d], 1, 48);
    console.log(`   il comando risponde da ${cD === null ? '(non trovato entro 48)' : cD} px dal bordo DESTRO e da ${cF === null ? '(non trovato entro 48)' : cF} dal FONDO`);
    console.log(`   (il gioco dichiara la presa a ${presaDx} e ${presaFo})`);
    /* IL CANCELLO CHE CONTA: il comando dev'essere premibile PRIMA che il
       sistema si prenda il dito, se no il pollice appoggiato sul bordo
       apre il gesto invece di tirare. */
    cancello('telefono: la presa comincia FUORI dalla striscia rubata (bordo destro)',
      cD !== null && cD >= largh('destro'),
      `presa da ${cD}, striscia rubata fino a ${largh('destro')}`);

    console.log('\n3) LA STRISCIATA DAL BORDO DESTRO ALL\'ALTEZZA DEL PULSANTE GRANDE');
    const s3 = { n: 0, arriva: 0, cancel: 0, pausa: 0, calci: 0, comandi: 0 }; const d3 = [];
    for (let g = 0; g < GIRI; g++) {
      const r = await prova(V.w - 3, Math.round(bt[0].y), V.w - 130, Math.round(bt[0].y), 8);
      if (!r) continue;
      s3.n++; if (r.start) s3.arriva++; if (r.cancel) s3.cancel++; if (r.st.paused) s3.pausa++;
      if (r.calci) s3.calci++; if (r.comandi) s3.comandi++; d3.push(r);
    }
    const viv = d3.reduce((a, r) => { for (const n in r.k) a[n] = (a[n] || 0) + r.k[n]; return a; }, {});
    console.log(`   ${s3.n} strisciate valide · il dito arriva ${s3.arriva} · touchcancel ${s3.cancel} · LA PARTITA VA IN PAUSA ${s3.pausa}`);
    console.log(`   CALCI ${s3.calci}/${s3.n} · COMANDI IMMEDIATI ${s3.comandi}/${s3.n} · chiamate ` + JSON.stringify(Object.fromEntries(Object.entries(viv).filter(([, v]) => v))));
    /* IL RITARDO DI CONSEGNA AL BORDO, che e' la ragione dei numeri di
       sopra e non si vede da nessun'altra parte.
       Il dito scende a VW-3. Quando il sistema NON lo ruba, la pagina non
       riceve sempre il touchdown li': spesso il primo touchstart arriva
       gia' spostato all'interno, perche' i primi campioni al bordo se li
       tiene la catena d'ingresso (disambiguazione del gesto, soppressione
       del palmo sul bordo del pannello). Se quel punto finto cade dentro
       la presa di un comando, il gioco legge una PRESSIONE che nessuno ha
       fatto — ed e' cosi' che una strisciata dal bordo diventa un tiro.
       Questo scostamento e' la misura che decide se la toppa Java si puo'
       spedire: nessun margine lo copre, perche' non e' una questione di
       dove sta il comando ma di dove il sistema dice che sia il dito. */
    const dentro = d3.filter(r => r.giu1).map(r => V.w - 3 - r.giu1.x);
    if (dentro.length) {
      const dist = {}; for (const d of dentro) dist[d] = (dist[d] || 0) + 1;
      console.log(`   il primo touchstart arriva ${Math.min(...dentro)}..${Math.max(...dentro)} px PIU' DENTRO del punto in cui il dito e' sceso` +
        `  (distribuzione ${JSON.stringify(dist)})`);
      const R = bt[0].r + (bd ? bd.presa : 10);
      const finti = d3.filter(r => r.giu1 && Math.hypot(r.giu1.x - bt[0].x, r.giu1.y - bt[0].y) <= R).length;
      console.log(`   e in ${finti}/${d3.length} casi quel punto CADE DENTRO LA PRESA del pulsante grande: e' li' che nasce il comando non chiesto`);
      cancello('telefono: il tocco al bordo arriva dove il dito e\' sceso (scostamento sotto la presa)',
        Math.max(...dentro) < R, `scostamento massimo ${Math.max(...dentro)} px, presa ${R} px`);
    }
    cancello('telefono: una strisciata dal bordo non produce un calcio', s3.n > 0 && s3.calci === 0, `${s3.calci}/${s3.n}`);
    cancello('telefono: una strisciata dal bordo non produce un comando non chiesto', s3.n > 0 && s3.comandi === 0, `${s3.comandi}/${s3.n}`);

    /* IL PUNTO PIU' ESTERNO DELLA PRESA STA SULLA DIAGONALE, NON
       NELL'ANGOLO DEL RIQUADRO. La presa e' un CERCHIO: (VW-14, VH-10) e'
       lo spigolo del quadrato circoscritto, e dista dal centro 70,7 px —
       venti piu' del raggio della presa. Una corsa l'ha posato li' e ha
       letto «arriva 6/6, risponde 0/6», che sembrava un furto e invece
       era un dito fuori dal cerchio: il banco stava misurando la propria
       aritmetica. Il punto giusto e' centro + (r+presa)/radice(2) su
       tutt'e due gli assi. */
    const R = bt[0].r + (bd ? bd.presa : 10), diag = R / Math.SQRT2;
    console.log('\n4) IL POLLICE POSATO NELL\'ANGOLO (punti sulla DIAGONALE della presa, non sugli spigoli)');
    for (const [nome, x, y] of [
      ['il punto della presa piu\' vicino all\'angolo basso-destro', Math.round(bt[0].x + diag), Math.round(bt[0].y + diag)],
      ['lo stesso punto se il comando fosse dove sta nel gioco BASE', Math.round(V.w - 64 + diag), Math.round(V.h - 60 + diag)],
      ['il centro del pulsante come sta nel gioco BASE  (VW-64,VH-60)', V.w - 64, V.h - 60],
    ]) {
      let risp = 0, arr = 0, pau = 0, n = 0;
      for (let g = 0; g < GIRI; g++) { const r = await tap(x, y); if (!r) continue; n++; if (r.calci + r.comandi > 0) risp++; if (r.start) arr++; if (r.st.paused) pau++; }
      console.log(`   ${nome.padEnd(54)} arriva ${arr}/${n} · risponde ${risp}/${n} · pause ${pau}/${n}`);
    }
    console.log(`\n   campioni buttati perche' il controllo non passava: ${buttati} · riallineamenti del canale: ${vetro.rotture}`);
    cancello('telefono: il canale d\'ingresso ha retto (meno di un campione buttato su due)', buttati < 40, `buttati ${buttati}, riallineamenti ${vetro.rotture}`);
    vetro.chiudi(); c.chiudi();
    uscita = 0;
  } finally {
    sh('shell', 'am', 'force-stop', PKG);
    /* IL TELEFONO SI RESTITUISCE COM'ERA. La modalita' di navigazione e'
       un'impostazione del proprietario, non una variabile del banco. */
    if (NAV && navPrima && NAV !== navPrima) {
      try {
        attendi();
        for (const o of TUTTI) if (o !== navPrima) { try { sh('shell', 'cmd', 'overlay', 'disable', 'com.android.internal.systemui.navbar.' + o); } catch (e) { } }
        sh('shell', 'cmd', 'overlay', 'enable', 'com.android.internal.systemui.navbar.' + navPrima);
        await pausa(2500); attendi();
        console.log(`\n(navigazione riportata a ${navPrima}: navigation_mode ora ${sh('shell', 'settings', 'get', 'secure', 'navigation_mode').trim()})`);
      } catch (e) { console.log('\nATTENZIONE: non sono riuscito a riportare la navigazione a ' + navPrima + ' — va rimessa a mano.'); }
    }
  }
  return uscita;
}

/* ------------------------------------------------------------------ */
(async () => {
  const VP = { width: +(arg('largo', '915')), height: +(arg('alto', '412')) };
  const files = process.argv.slice(2).filter(a => !a.startsWith('--') && /\.html$/i.test(a));

  if (bandiera('telefono') || arg('telefono', null)) { await telefono(); process.exit(verdetto()); }

  if (bandiera('porta')) {
    if (!files.length) { console.error('uso: node strumenti/_t-bordi-prova.js --porta prima.html dopo.html [senzatetto.html]'); process.exit(2); }
    const secondi = +(arg('secondi', '60'));
    /* =================================================================
       PERCHE' SI RIPETE, e perche' il valore predefinito e' TRE.

       Questa e' la correzione che il critico ha chiesto e che il banco si
       era meritata. La prima edizione faceva UNA corsa, stampava
       «73/289, il 25%», e chi leggeva prendeva quel 25% per una misura.
       Non lo era: rilanciata, la stessa identica invocazione ha dato 296,
       165, 61 e 307 campioni con la bocca in quadro — da 7% a 32% dei
       fotogrammi — e il segno del confronto fra due assetti si e'
       ribaltato fra una corsa e l'altra. La differenza cercata vale 1-3
       punti; il rumore fra corse ne vale piu' di venti.

       IL SEME E' FISSO MA IL TEMPO NO: Math.random e' sostituito da una
       sequenza deterministica (vedi apriPagina), pero' la partita gira su
       requestAnimationFrame e il campionamento su un setTimeout da 45 ms.
       Due corse pescano fotogrammi diversi di partite diverse. Nessun
       seme lo puo' aggiustare, quindi si ripete e si dichiara la
       dispersione — che e' l'unica cosa onesta che un banco cosi' puo'
       fare.

       CIO' CHE NON SI RIPETE, E PERCHE'. Gli ASSETTI (dove stanno i due
       dischi con un dato inserto) si leggono una volta sola: sono
       geometria pura, non dipendono dalla partita. E il confronto fra
       assetti e' APPAIATO — dentro una corsa i vari assetti sono
       giudicati sugli STESSI campioni — quindi la quantita' che conta e'
       la differenza appaiata corsa per corsa, non la media di due corse
       diverse.
       ================================================================= */
    const R = Math.max(1, +(arg('ripeti', '3')));
    console.log('=== LA BOCCA DELLA PORTA CONTRO I COMANDI ===');
    console.log('La bocca segue la camera, la camera segue il pallone: NON e\' la fascia fissa');
    console.log('y 296-302 che il commento del gioco cita da otto fermi immagine. Qui si');
    console.log('campiona in partita (CPU contro CPU, cosi\' si attacca davvero) e si spazza');
    console.log('l\'area d\'attacco a mano per il caso peggiore.');
    console.log(`RIPETIBILITA': ${R} corse per cella. Questo banco NON E' RIPETIBILE — la quota`);
    console.log('di fotogrammi con la bocca in quadro cambia molto fra una corsa e l\'altra, e');
    console.log('la differenza fra due assetti e\' piccola: percio\' si stampa la dispersione e');
    console.log('c\'e\' un cancello che diventa rosso quando il rumore supera l\'effetto.');
    for (const vp of [VP]) for (const taglia of (arg('taglie', '5,11').split(',').map(Number))) {
      /* la geometria una volta sola: non dipende dalla partita */
      const conf = [];
      for (const f of files) {
        const A = await assetti(f, taglia, vp);
        for (const [n] of INSERTI) if (A[n]) conf.push([`${path.basename(f)} ins ${n}`, A[n]]);
      }
      console.log(`\n===== ${taglia}v${taglia} · ${vp.width}x${vp.height} · ${R} corse da ${secondi}s =====`);
      const corse = [];
      for (let g = 0; g < R; g++) {
        const S = await campionaPorta(files[0], taglia, vp, secondi);
        const conP = S.part.filter(q => q.r);
        if (!conP.length) { console.log(`  corsa ${g + 1}: la bocca non e' MAI entrata in quadro.`); corse.push(null); continue; }
        const y0 = conP.map(q => q.r.y0), y1 = conP.map(q => q.r.y1);
        const vel = S.part.filter(q => q.alfa.some(a => a < 0.999)).length;
        const cn = (d, el) => { let n = 0, mx = 0; for (const r of el) { const a = copre(r, d.bt[0].x, d.bt[0].y, d.bt[0].r) + copre(r, d.bt[1].x, d.bt[1].y, d.bt[1].r); if (a > 0) { n++; mx = Math.max(mx, a); } } return { n, mx: Math.round(mx), pct: 100 * n / el.length }; };
        const per = conf.map(([nome, d]) => ({ nome, d, part: cn(d, conP.map(q => q.r)), spaz: cn(d, S.spaz) }));
        corse.push({ n: conP.length, tot: S.part.length, y0a: Math.min(...y0), y0b: Math.max(...y0), y1a: Math.min(...y1), y1b: Math.max(...y1), vel, spazN: S.spaz.length, spazY1a: Math.min(...S.spaz.map(r => r.y1)), spazY1b: Math.max(...S.spaz.map(r => r.y1)), per });
        console.log(`  corsa ${g + 1}: bocca in quadro ${conP.length}/${S.part.length} (${(100 * conP.length / S.part.length).toFixed(0)}%)` +
          ` · y0 ${Math.min(...y0)}..${Math.max(...y0)} · y1 ${Math.min(...y1)}..${Math.max(...y1)}` +
          ` · comandi velati ${vel}/${S.part.length} (${(100 * vel / S.part.length).toFixed(0)}%)` +
          ` · spazzata ${S.spaz.length}/54 y1 ${Math.min(...S.spaz.map(r => r.y1))}..${Math.max(...S.spaz.map(r => r.y1))}`);
        for (const p of per)
          console.log(`     ${p.nome.padEnd(30)} disco grande alto y ${(p.d.bt[0].y - p.d.bt[0].r).toFixed(0)} (margine ${p.d.mB === null ? '-' : p.d.mB})` +
            ` | bocca sotto un comando ${p.part.n}/${conP.length} (${p.part.pct.toFixed(0)}%) max ${p.part.mx} px` +
            ` | spazzata ${p.spaz.n}/${S.spaz.length} max ${p.spaz.mx} px`);
      }
      const buone = corse.filter(Boolean);
      cancello(`porta ${taglia}v${taglia}: ogni corsa ha visto la bocca abbastanza da misurare`,
        buone.length === R && buone.every(c => c.n >= 30),
        buone.length ? `campioni per corsa ${buone.map(c => c.n).join(', ')}` : 'nessuna corsa utile');
      if (!buone.length) continue;

      /* -------- LA DISPERSIONE, DICHIARATA -------- */
      const iv = v => `${Math.min(...v)}..${Math.max(...v)}`;
      console.log(`  DISPERSIONE FRA LE ${buone.length} CORSE:`);
      console.log(`    campioni con la bocca in quadro ${iv(buone.map(c => c.n))} su ${iv(buone.map(c => c.tot))}` +
        ` (${iv(buone.map(c => Math.round(100 * c.n / c.tot)))}%)`);
      console.log(`    bordo BASSO della bocca (y1) ${Math.min(...buone.map(c => c.y1a))}..${Math.max(...buone.map(c => c.y1b))}` +
        ` · bordo ALTO (y0) ${Math.min(...buone.map(c => c.y0a))}..${Math.max(...buone.map(c => c.y0b))}` +
        `   <- se questo intervallo e' largo, la "fascia fissa" non esiste`);
      console.log(`    comandi velati da scartoHUD ${iv(buone.map(c => Math.round(100 * c.vel / c.tot)))}%`);
      for (let i = 0; i < conf.length; i++)
        console.log(`    ${conf[i][0].padEnd(30)} bocca sotto un comando ${iv(buone.map(c => Math.round(c.per[i].part.pct)))}% ` +
          `(conteggi ${buone.map(c => c.per[i].part.n).join(',')}) · max sovrapposizione ${iv(buone.map(c => c.per[i].part.mx))} px`);

      /* -------- IL CANCELLO CHE IERI NON C'ERA --------
         Il confronto e' APPAIATO: dentro una corsa, gli assetti si
         giudicano sugli stessi campioni. Quindi per ogni assetto si
         calcola la differenza in punti percentuali contro l'assetto di
         riferimento (il primo), corsa per corsa. Se la MEDIA di quelle
         differenze non e' piu' grande della loro DISPERSIONE, il banco
         non sa distinguere i due assetti: e' rosso, e il numero non si
         scrive da nessuna parte. Con una corsa sola la dispersione non
         esiste e il cancello e' rosso per definizione — una corsa non
         dice niente sulla ripetibilita', e fingere di si' e' il difetto
         che questa riga esiste per chiudere. */
      if (conf.length >= 2) {
        /* QUALI COPPIE. Due famiglie, e la seconda e' quella che decide
           il TETTO: (a) ogni assetto contro il riferimento, cioe' il
           primo file all'inserto 0 — di solito il gioco senza toppa;
           (b) lo STESSO inserto in file diversi, che e' il confronto
           «col tetto contro senza tetto» a parita' di tutto il resto.
           Due assetti con la stessa identica geometria non si
           confrontano: la differenza sarebbe zero per costruzione, e un
           cancello che valuta una tautologia e' peggio di uno che manca. */
        const geo = d => `${d.bt[0].x},${d.bt[0].y},${d.bt[1].x},${d.bt[1].y}`;
        const ins = s => (s.match(/ins (\d+)$/) || [])[1];
        const coppie = [];
        for (let i = 1; i < conf.length; i++) coppie.push([i, 0]);
        for (let i = 1; i < conf.length; i++) for (let j = i + 1; j < conf.length; j++)
          if (ins(conf[i][0]) && ins(conf[i][0]) === ins(conf[j][0])) coppie.push([j, i]);
        let tuttiConcludono = true; const righe = [];
        for (const [i, j] of coppie) {
          if (geo(conf[i][1]) === geo(conf[j][1])) {
            righe.push(`${conf[i][0]} contro ${conf[j][0]}: geometria IDENTICA, niente da confrontare`);
            continue;
          }
          const d = buone.map(c => c.per[i].part.pct - c.per[j].part.pct);
          const media = d.reduce((a, b) => a + b, 0) / d.length;
          const disp = Math.max(...d) - Math.min(...d);
          /* TRE ESITI, non due, e il terzo e' quello che si sbaglia piu'
             facilmente. Un banco conclude quando la differenza che misura
             e' piu' grande di quanto vaga fra una corsa e l'altra; ma
             conclude ANCHE quando la differenza e' zero e non vaga —
             quello e' «non c'e' differenza», che e' una risposta e non
             un'incertezza. Il rosso e' per il caso in mezzo: una
             differenza apparente che il rumore da solo saprebbe
             produrre. E' li' che nasce il numero da non spedire. */
          const nulla = Math.abs(media) < 0.05 && disp < 0.05;
          const conclude = buone.length >= 2 && (nulla || Math.abs(media) > disp);
          if (!conclude) tuttiConcludono = false;
          righe.push(`${conf[i][0]} contro ${conf[j][0]}: differenza ${d.map(x => (x >= 0 ? '+' : '') + x.toFixed(1)).join(' / ')} punti` +
            ` → media ${media >= 0 ? '+' : ''}${media.toFixed(1)}, dispersione ${disp.toFixed(1)} → ` +
            (nulla ? 'NESSUNA DIFFERENZA (e il banco qui e\' fermo)' : conclude ? 'DIFFERENZA MISURATA' : 'NON CONCLUDE'));
        }
        console.log('  CONFRONTO APPAIATO (stessi campioni dentro ogni corsa):');
        for (const r of righe) console.log('    ' + r);
        cancello(`porta ${taglia}v${taglia}: il confronto fra assetti supera il rumore fra corse`,
          tuttiConcludono,
          buone.length < 2 ? 'una corsa sola: la dispersione non e\' misurabile' : righe.filter(r => /NON CONCLUDE/.test(r)).join(' ; ') || 'tutti concludono');
      }
    }
    process.exit(verdetto());
  }

  if (!files.length) {
    console.error('uso: node strumenti/_t-bordi-prova.js --banco prima.html dopo.html');
    console.error('     node strumenti/_t-bordi-prova.js --porta dopo.html');
    console.error('     node strumenti/_t-bordi-prova.js --telefono <pacchetto> [--navigazione gestural|threebutton]');
    process.exit(2);
  }
  console.log(`=== BANCO DEI BORDI (Chromium ${VP.width}x${VP.height}) ===`);
  console.log('AVVERTENZA: Chromium non ha ne\' tacca ne\' gesti di sistema. Gli inserti valgono');
  console.log('zero e il touchcancel lo manda questo strumento. Qui si prova il GESTORE del');
  console.log('gioco; la catena d\'ingresso di Android si prova solo con --telefono.');
  const out = [];
  for (const f of files) { const r = await banco(f, VP); out.push(r); stampaBanco(r); }
  if (out.length === 2) {
    console.log('\n=== APPAIATO ===');
    const [a, b] = out;
    for (let i = 0; i < Math.min(a.presa.length, b.presa.length); i++) {
      const x = a.presa[i], y = b.presa[i];
      console.log(`  ${y.label.padEnd(11)} dal bordo destro ${x.daDestra} -> ${y.daDestra}   dal fondo ${x.daFondo} -> ${y.daFondo}   disco da y ${x.discoSopra} -> ${y.discoSopra}`);
    }
    console.log(`  varco fra i centri ${a.varco} -> ${b.varco}`);
    console.log(`  pulsante RILASCIATO (controllo):   ${a.btnAlzato.calci}/${a.btnAlzato.validi} -> ${b.btnAlzato.calci}/${b.btnAlzato.validi}`);
    console.log(`  pulsante STRAPPATO, calci partiti: ${a.btnStrappato.calci}/${a.btnStrappato.validi} -> ${b.btnStrappato.calci}/${b.btnStrappato.validi}`);
    console.log(`  levetta STRAPPATA, calci partiti:  ${a.stickStrappata.calci}/${a.stickStrappata.validi} -> ${b.stickStrappata.calci}/${b.stickStrappata.validi}`);
  }
  process.exit(verdetto());
})().catch(e => { console.error('FALLITO:', e.stack || e.message); process.exit(1); });
