/* =====================================================================
   _q-contrasto.js — IL PIEDE TESO SI VEDE? (29 agosto 2026)

   Il banco di _t-contrasto-corpo.js. Il contrasto in piedi e' un verbo
   SOLO UMANO — p.contrasto lo accende soltanto doSlide, che passa da
   ctrlPlayer — quindi nessuna partita CPU contro CPU puo' vederlo, e
   questo banco preme il disco a mano.

   QUATTRO PROVE:

   A  IL VERBO ACCENDE LA POSA.
      Si preme il disco su un uomo in piedi e si chiede a rigStato che
      posa disegnerebbe. Deve dire 'contrasto'.

   B  LA SPAZZATA RESTA UN CALCIO — la prova della decisione.
      contrastoPasso ha un ramo che calcia davvero: pallone di nessuno
      a portata, nel proprio terzo. Quel ramo accende kickT, e il ramo
      del calcio in rigStato sta PRIMA di quello del contrasto apposta.
      Si costruisce la situazione e si verifica che la posa sia di
      CALCIO, non l'affondo. Se questa esce rossa, l'ordine dei due
      rami e' sbagliato e chi spazza fa il gesto di chi contrasta.

   C  LA POSA PERCORRE TUTTO IL SUO ARCO.
      In 0,18 s la fase deve andare da 0,26 (il piede tocca) a ~0,98
      (rientrato). Se restasse ferma, la clip sarebbe un fermo immagine.

   D  IL CONTROLLO DI CONTROLLO — la prova A sa uscire ROSSA?
      La stessa prova A sul gioco PRIMA: li' rigStato non conosce la
      parola 'contrasto' e deve rispondere altro (corsa, fermo, quel
      che sia). Se rispondesse 'contrasto' anche prima, la prova A non
      starebbe misurando la cura.

   uso:  node strumenti/_q-contrasto.js
         node strumenti/_q-contrasto.js --dopo fuori/anim.html
   esce 0 se tutto verde, 1 se una prova e' rossa, 2 se il banco esplode.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const PRIMA = arg('prima', 'CALCETTO-il-gioco.html');
const DOPO = arg('dopo', 'fuori/anim.html');

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
function esplode(m) { console.log('\nBANCO NON VALIDO - ' + m); console.log('Non e\' un giudizio sulla cura: non ho potuto misurarla.'); process.exit(2); }

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function apri(browser, porta, rel) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const err = [];
  pag.on('pageerror', e => err.push(e.message));
  await pag.addInitScript(() => {
    let s = 20260803 >>> 0;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  });
  await pag.goto('http://127.0.0.1:' + porta + '/' + rel, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (err.length) esplode('la pagina ' + rel + ' e\' partita con un errore: ' + err[0].slice(0, 160));
  return { ctx, pag, err };
}

/* ---- preme il disco del contrasto e riferisce cosa succede ----
   Non usa nessun gancio nuovo: chiama doSlide, che e' esattamente il
   punto in cui il dito entra nel gioco. */
async function premi(pag, scena) {
  return pag.evaluate(sc => {
    const t = window.__test;
    t.startMatch(1, 1);                       // squadra 0 UMANA: serve ctrlPlayer
    /* niente setCpuVsCpu: il contrasto e' un verbo umano e senza un
       uomo sotto il dito non esiste */
    /* SI ASPETTA 'play', E NON E' UN DETTAGLIO. La prima stesura di
       questo banco simulava mezzo secondo e premeva: mezzo secondo dopo
       lo start la partita e' ancora in 'kickoff', updatePlayerFisica non
       gira, e il cronometro del contrasto restava inchiodato a 0,18 per
       tutti i quattordici fotogrammi campionati. Il banco accusava la
       cura di disegnare un fermo immagine; il fermo immagine era il
       banco. Si aspetta lo stato vero, con un tetto perche' un'attesa
       infinita e' un banco appeso, non un banco rosso. */
    let giri = 0;
    while (t.state !== 'play' && giri < 600) { t.simulate(1 / 60); giri++; }
    if (t.state !== 'play') return { errore: 'la partita non entra in gioco: stato "' + t.state + '" dopo 10 s' };
    const p = ctrlPlayer(0);
    if (!p) return { errore: 'nessun giocatore controllato dalla squadra 0' };
    const b = G.ball;
    /* si mette in piedi e libero da impedimenti: la posa che stiamo
       misurando e' quella di un uomo che PUO' contrastare */
    p.out = 0; p.slide = -1; p.recover = 0; p.rove = -1; p.kickCd = 0;
    p.contrasto = 0; p.kickT = 0; p.kickB = 0; p.charge = -1; p.celeb = 0;
    p.mesto = 0; p.lodPosa = false; p.presaT = 0; p.rinvT = 0; p.fintaT = 0;
    if (sc === 'spazzata') {
      /* pallone DI NESSUNO, a portata di piede, e l'uomo nel PROPRIO
         terzo: sono le tre condizioni esatte del ramo della spazzata. */
      b.owner = -1; b.passTo = -1; b.crossTo = -1;
      p.x = (p.team === 0 ? FW * 0.12 : FW * 0.88); p.y = FH / 2;
      b.x = p.x + 10; b.y = p.y; b.z = 0; b.vx = 0; b.vy = 0; b.vz = 0;
    } else {
      /* pallone di un AVVERSARIO, a portata: il furto vero */
      let avv = null;
      for (const q of G.players) if (q.team !== p.team && q.role !== 'gk') { avv = q; break; }
      if (!avv) return { errore: 'nessun avversario in campo' };
      p.x = FW / 2; p.y = FH / 2;
      avv.x = p.x + 14; avv.y = p.y; avv.out = 0;
      b.owner = G.players.indexOf(avv); b.x = avv.x; b.y = avv.y; b.z = 0;
      b.vx = 0; b.vy = 0; b.vz = 0;
      /* faccia a faccia: p guarda avv, avv guarda p — il caso in cui il
         contrasto vale di piu' (CONTRASTO_K) */
      p.fx = 1; p.fy = 0; avv.fx = -1; avv.fy = 0;
    }
    const prima = rigStato(p).clip;
    doSlide(0, 'premi');
    const acceso = p.contrasto;
    /* il fotogramma successivo: contrastoPasso gira dentro
       updatePlayerFisica, non dentro doSlide */
    t.simulate(1 / 60);
    const st = rigStato(p);
    const dopoUnFotogramma = { clip: st.clip, u: st.u, contrasto: p.contrasto, kickT: p.kickT, kickB: p.kickB };
    /* l'arco: si campiona la fase per tutta la finestra del verbo */
    const arco = [];
    for (let i = 0; i < 14; i++) {
      const s2 = rigStato(p);
      arco.push({ clip: s2.clip, u: +s2.u.toFixed(3), c: +(p.contrasto || 0).toFixed(3) });
      t.simulate(1 / 60);
    }
    return { prima, acceso, dopoUnFotogramma, arco, owner: G.ball.owner, mio: G.players.indexOf(p) };
  }, scena);
}

(async () => {
  for (const f of [PRIMA, DOPO]) if (!fs.existsSync(path.resolve(RADICE, f))) esplode('manca il file ' + f);
  const srv = await servi();
  const browser = await chromium.launch();
  console.log('=== IL PIEDE TESO SI VEDE? ===');
  console.log('prima: ' + PRIMA + '\ndopo:  ' + DOPO + '\n');

  const dopo = await apri(browser, srv.porta, DOPO);

  console.log('A) PREMUTO IL DISCO, IL CORPO FA L\'AFFONDO');
  const a = await premi(dopo.pag, 'furto');
  if (a.errore) esplode(a.errore);
  di(a.acceso > 0, 'il verbo accende il cronometro', 'p.contrasto = ' + a.acceso);
  di(a.dopoUnFotogramma.clip === 'contrasto', 'la posa e\' l\'affondo',
     'prima era "' + a.prima + '", dopo e\' "' + a.dopoUnFotogramma.clip
     + '" alla fase ' + a.dopoUnFotogramma.u.toFixed(3));

  console.log('\nB) LA SPAZZATA RESTA UN CALCIO (l\'ordine dei due rami)');
  const b = await premi(dopo.pag, 'spazzata');
  if (b.errore) esplode(b.errore);
  const clipCalcio = ['passaggio', 'filtrante', 'cross', 'tiro', 'testa'];
  const haCalciato = b.dopoUnFotogramma.kickT > 0 || b.dopoUnFotogramma.kickB > 0;
  if (!haCalciato) {
    /* se la spazzata non e' partita, questa prova non ha potuto
       misurare niente: si dichiara, non si dipinge di verde */
    di(false, 'la spazzata e\' partita davvero',
       'nessun kickT acceso: la situazione costruita non ha prodotto una spazzata, prova NON ESEGUITA');
  } else {
    di(clipCalcio.includes(b.dopoUnFotogramma.clip),
       'chi spazza fa il gesto del CALCIO, non l\'affondo',
       'clip "' + b.dopoUnFotogramma.clip + '", kickT ' + b.dopoUnFotogramma.kickT.toFixed(3));
  }

  console.log('\nC) LA POSA PERCORRE IL SUO ARCO in 0,18 s');
  const soloContrasto = a.arco.filter(x => x.clip === 'contrasto');
  const u0 = soloContrasto.length ? soloContrasto[0].u : 0;
  const u1 = soloContrasto.length ? soloContrasto[soloContrasto.length - 1].u : 0;
  di(soloContrasto.length >= 8 && u1 - u0 > 0.5,
     'la fase corre da ' + u0.toFixed(2) + ' a ' + u1.toFixed(2),
     soloContrasto.length + ' fotogrammi di affondo su ' + a.arco.length + ' campionati');
  console.log('     arco: ' + a.arco.map(x => x.clip.slice(0, 4) + ' ' + x.u.toFixed(2)).join(' | '));
  await dopo.ctx.close();

  console.log('\nD) IL CONTROLLO DI CONTROLLO: sul gioco PRIMA la prova A deve uscire ROSSA');
  const prima = await apri(browser, srv.porta, PRIMA);
  const d = await premi(prima.pag, 'furto');
  if (d.errore) esplode(d.errore);
  di(d.acceso > 0 && d.dopoUnFotogramma.clip !== 'contrasto',
     'il difetto c\'era: il cronometro si accendeva e nessuno lo leggeva',
     'p.contrasto = ' + d.acceso + ' ma la posa era "' + d.dopoUnFotogramma.clip + '"');
  await prima.ctx.close();

  await browser.close(); srv.chiudi();
  const f = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' prove, ' + (esiti.length - f) + ' passate, ' + f + ' fallite');
  process.exit(f ? 1 : 0);
})().catch(e => esplode(e.message));
