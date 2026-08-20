/* =====================================================================
   _p-regia.js — IL COSTO DELLA REGIA, MISURATO DOVE LA REGIA LAVORA.

   prestazione.js --contro misura la partita che scorre, ed e' giusto che
   li' la toppa della regia dia zero: non tocca UNA riga del gioco attivo.
   I fotogrammi che la toppa cambia sono quelli della MOVIOLA e del
   KICKOFF, che nella finestra di prestazione.js pesano poco. Qui si
   misura ESATTAMENTE quella finestra: dal gol forzato fino a 45
   fotogrammi dentro il kickoff successivo (festa, ripresa, moviola,
   stacco del kickoff compresi).

   LA COPPIA E' GEMELLA PER COSTRUZIONE: due pagine — l'originale e la
   toppa — con lo stesso seme, lo stesso banco a passo fisso e le stesse
   chiamate, giocano LA STESSA partita fotogramma per fotogramma, perche'
   la camera non scrive nella simulazione. Percio':
     · il numero di fotogrammi della finestra DEVE coincidere fra A e B
       (se no la toppa ha toccato la simulazione, e la misura si ferma);
     · la differenza di tempo per fotogramma e' il costo della regia e
       di cio' che il suo zoom porta in quadro, senza altro rumore che
       quello del banco — che colpisce A e B nello stesso minuto e si
       appaia coi giri alternati (AB / BA / AB ...), differenza DENTRO
       il giro, mediana delle differenze alla fine.
   Il banco e' condiviso con altri specialisti: il numero assoluto (ms a
   fotogramma in resa software) NON e' il telefono; la DIFFERENZA e' il
   dato. Accanto c'e' l'intervallo dei giri: se scavalca lo zero, il
   segno non e' provato.

   --appaiata: fabbrica anche la coppia visiva prima/dopo ALLA
   DIMENSIONE VERA (1830x824, il viewport del banco a dpr 2), stesso
   fotogramma della stessa partita: il fotogramma fermo della rete
   (+8 fotogrammi, passato il lampo), originale sopra e toppa sotto.

   uso:
     node strumenti/_p-regia.js --prima fuori/CALCETTO-originale-30279089.html --dopo fuori/regia.html
     node strumenti/_p-regia.js --prima ... --dopo ... --appaiata fuori/_regia-appaiata.png
     opzioni: --giri 6  --solo 5
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const PRIMA = arg('prima', 'fuori/CALCETTO-originale-30279089.html');
const DOPO = arg('dopo', 'fuori/regia.html');
const GIRI = +arg('giri', 6);
const SOLO = +arg('solo', 0) || 0;
const APPAIATA = arg('appaiata', '');
const SEME = 20260820;

(async () => {
  const srv = await servi();
  const br = await chromium.launch();

  async function apri(file, taglia) {
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
      deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, SEME);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/${file}?t=${Date.now()}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    /* i font vanno aspettati PRIMA del via: la ricottura del manto al
       loro arrivo consuma sorteggi su un orologio vero e spacca la
       ripetibilita' (vedi il cappello di _q-regia.js) */
    await pag.waitForFunction("document.fonts && document.fonts.status==='loaded'", null, { timeout: 15000 }).catch(() => {});
    await pag.waitForTimeout(900);
    await pag.evaluate(() => window.__banco.passo(30));
    await pag.evaluate((N) => {
      const T = window.__test;
      T.dismissSplash && T.dismissSplash();
      T.startMatch(1, 1, { size: N });
      T.Tut && T.Tut.finish && T.Tut.finish(true);
      T.setCpuVsCpu(true);
      T.save.moviola = 1; T.setMoto(true);
      T.setTimeLeft(85);
      for (let f = 0; f < 300; f++) window.__banco.passo(1);
      return T.state;
    }, taglia);
    return { pag, ctx };
  }

  /* una misura: forza un gol e cronometra la finestra fino a 45
     fotogrammi dentro il kickoff. Torna anche il conto dei fotogrammi,
     che fra A e B deve coincidere. */
  const misura = pag => pag.evaluate(() => {
    const T = window.__test;
    if (T.state === 'play' || T.state === 'golden') T.forceGoal(0);
    const t0 = Date.now();
    let frames = 0, inKick = 0;
    while (frames < 900 && inKick < 45) {
      window.__banco.passo(1); frames++;
      if (T.G.scene === 'kickoff') inKick++;
    }
    const ms = Date.now() - t0;
    /* ci si riassesta nel gioco per la misura seguente */
    for (let f = 0; f < 120; f++) window.__banco.passo(1);
    return { ms, frames };
  });

  const taglie = SOLO ? [SOLO] : [5, 7, 11];
  let valido = true;
  for (const taglia of taglie) {
    const A = await apri(PRIMA, taglia);
    const B = await apri(DOPO, taglia);
    const diffs = [], fA = [], fB = [];
    for (let g = 0; g < GIRI; g++) {
      const ordine = g % 2 === 0 ? ['A', 'B'] : ['B', 'A'];
      let mA = null, mB = null;
      for (const chi of ordine) {
        const m = await misura(chi === 'A' ? A.pag : B.pag);
        if (chi === 'A') mA = m; else mB = m;
      }
      fA.push(mA.frames); fB.push(mB.frames);
      if (mA.frames !== mB.frames) { valido = false; break; }
      diffs.push(mB.ms / mB.frames - mA.ms / mA.frames);
    }
    if (!valido) {
      console.log(`t${taglia}  NON VALIDO: finestre di ${fA.join(',')} contro ${fB.join(',')} fotogrammi — le due partite non sono gemelle, la toppa ha toccato la simulazione?`);
    } else {
      const ord = diffs.slice().sort((a, b) => a - b);
      const mediana = ord[ord.length >> 1];
      console.log(`t${taglia}  finestra del gol: ${fA[0]} fotogrammi identici nei due file — differenza per fotogramma: mediana ${mediana >= 0 ? '+' : ''}${mediana.toFixed(2)} ms  (giri: ${diffs.map(d => (d >= 0 ? '+' : '') + d.toFixed(2)).join(', ')} ms)${ord[0] <= 0 && ord[ord.length - 1] >= 0 ? '  [scavalca lo zero: segno non provato]' : ''}`);
    }

    /* ---- la coppia visiva, solo alla taglia 5 ---- */
    if (APPAIATA && taglia === 5) {
      /* si porta A al fotogramma fermo della rete (+8, passato il lampo)
         della PROSSIMA moviola, contando i fotogrammi; poi B degli stessi */
      const na = await A.pag.evaluate(() => {
        const T = window.__test;
        if (T.state === 'play' || T.state === 'golden') T.forceGoal(0);
        let n = 0, dopoRete = -1;
        while (n < 900) {
          window.__banco.passo(1); n++;
          const M = T.G.moviola;
          if (dopoRete < 0 && M && M.fase === 'rete') dopoRete = 0;
          else if (dopoRete >= 0 && ++dopoRete >= 8) break;
        }
        return n;
      });
      await B.pag.evaluate((n) => {
        const T = window.__test;
        if (T.state === 'play' || T.state === 'golden') T.forceGoal(0);
        for (let f = 0; f < n; f++) window.__banco.passo(1);
      }, na);
      const pngA = (await A.pag.screenshot()).toString('base64');
      const pngB = (await B.pag.screenshot()).toString('base64');
      const comp = await A.ctx.newPage();
      await comp.setViewportSize({ width: 915, height: 852 });
      await comp.setContent('<body style="margin:0"><canvas id="c" width="1830" height="1704"></canvas></body>');
      await comp.evaluate(([a, b]) => new Promise(res => {
        const cv = document.getElementById('c'), cx = cv.getContext('2d');
        const ia = new Image(), ib = new Image(); let n = 0;
        const via = () => { if (++n < 2) return;
          cx.drawImage(ia, 0, 0); cx.drawImage(ib, 0, 856);
          cx.fillStyle = '#000'; cx.fillRect(0, 824, 1830, 32); cx.fillRect(0, 1680, 1830, 24);
          cx.fillStyle = '#fff'; cx.font = '900 22px sans-serif';
          cx.fillText('PRIMA — la moviola rivede il gol con la stessa camera dall\'alto', 12, 847);
          cx.fillText('DOPO — stesso fotogramma della stessa partita: lo stacco composto sulla rete', 12, 1700);
          res(true); };
        ia.onload = via; ib.onload = via;
        ia.src = 'data:image/png;base64,' + a; ib.src = 'data:image/png;base64,' + b;
      }), [pngA, pngB]);
      fs.mkdirSync(path.dirname(path.resolve(APPAIATA)), { recursive: true });
      const el = await comp.$('#c');
      await el.screenshot({ path: APPAIATA });
      console.log(`     coppia appaiata (dimensione vera 1830x824 per meta'): ${APPAIATA}`);
      await comp.close();
    }
    await A.ctx.close(); await B.ctx.close();
  }
  await br.close(); srv.chiudi();
  process.exit(valido ? 0 : 1);
})();
