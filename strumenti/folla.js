/* =====================================================================
   FOLLA — il cancello della tribuna viva.

   Perche' esiste. La giuria ha bocciato il pubblico con una frase precisa
   («coriandoli di puntini statici che non reagiscono nemmeno al gol») e ha
   scritto la verifica accanto alla critica, in due misure osservabili:

     1. DUE FOTOGRAMMI CONSECUTIVI DEVONO DIFFERIRE. Una tribuna che non
        cambia da un sedicesimo di secondo all'altro e' un motivo dipinto.
     2. A CAVALLO DI UN GOL LA FOLLA DEVE CAMBIARE FORMA ENTRO MEZZO
        SECONDO. Non muoversi: cambiare FORMA — braccia su. Si misura
        come AREA DI SAGOMA nella finestra della gradinata: le braccia
        alzate sono pixel accesi che prima non c'erano, e nessuna
        traslazione di camera puo' fabbricarli.

   Si misurano sui pixel veri dell'ultimo fotogramma, dentro la finestra
   della gradinata, e non sull'intenzione di chi ha scritto il codice.

   La scena si mette in posa con gli hook window.__test di sempre, con il
   caso governato (Math.random a seme fisso) e l'orologio del gioco preso
   in mano a passo fisso: due esecuzioni danno gli stessi numeri.

   uso:  node strumenti/folla.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
               '.png':'image/png', '.json':'application/json' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(RADICE, p === '/' ? 'index.html' : p);
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* lo stesso banco a passo fisso di scatta.js: il tempo lo fa avanzare
   questo file, un fotogramma alla volta */
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) {
    n = Math.max(0, Math.round(+n || 0));
    for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO;
      for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
}

/* SOGLIE, E DA DOVE VENGONO. Non sono numeri di gusto: sono state tarate
   spegnendo l'onda della folla a mano (il CONTROLLO NEGATIVO) e guardando
   dove finiva il rumore. Misurato il 16 agosto 2026, banco a 915x412@2:
     tribuna viva     2,09% di pixel diversi · +34,6% di sagoma al gol
     tribuna dipinta  0,73% di pixel diversi ·  +0,3% di sagoma al gol
   RIFATTA IL 17 AGOSTO 2026 (finestra della sagoma 50-108, soglia 380),
   perche' la vecchia coppia finestra/soglia misurava anche il salto della
   folla e non solo la sua forma:
     tribuna viva     1,38% di pixel diversi · +14,3% di sagoma al gol
     tribuna congelata dall'esterno       ·  -0,1% di sagoma al gol
   Il congelamento si fa senza toccare il gioco: si intercettano le
   drawImage dell'atlante della tribuna e si rimettono la riga a braccia
   giu' e la y di riposo (vedi strumenti/_folla-toppa.js --gela).
   Le soglie stanno in mezzo. Un cancello che non e' stato visto FALLIRE
   non e' un cancello: e' una decorazione. */
const MIN_DIFF_FRAME = 1.0;   // % di pixel della gradinata diversi fra due fotogrammi
const MIN_CRESCITA   = 8;     // % di sagoma in piu' con lo scoppio del gol

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
  }, 20260728);
  await pag.addInitScript(bancoDiProva);

  const errori = [];
  pag.on('console', m => { if (m.type() === 'error') errori.push(m.text()); });
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 15000 });
  await pag.waitForTimeout(400);
  await pag.evaluate(() => window.__banco.passo(30));

  /* LA POSA. Il pallone si porta sulla linea laterale bassa perche' la
     camera inquadri la gradinata, che nel gioco normale entra in quadro
     solo di striscio. La sponda BASSA e non quella alta perche' in alto
     la barra del punteggio mangia i primi 45 px e della tribuna resta una
     striscia di venti: troppo poco per misurare qualcosa.
     La scena resta 'play' per tutta la misura — non si segna mai — e
     quindi la fascia GOL!, che vive nel 18,5% basso dello schermo, non
     esiste e non puo' inquinare la finestra.

     MA LA FASCIA DEL GOL NON E' L'UNICO CARTELLO, e questo e' costato una
     giornata. Il 19 agosto 2026 questo cancello e' uscito rosso su un
     gioco MIGLIORATO: crescita della sagoma da 12,8% a 1,6%, differenza
     fra fotogrammi da 1,23% a 0,66%. La bisezione ha accusato la toppa
     che insegna alla CPU a crossare. La toppa era innocente: insegnando
     alla CPU a crossare, in quei quattro secondi di simulazione la
     macchina ha cominciato a produrre EVENTI che prima non produceva mai,
     e uno di questi ha acceso il banner «TIRO PERFETTO!» — bianco su
     verde, largo mezzo schermo, piantato in mezzo alla finestra di
     misura. Il banner non e' folla e non si muove, quindi:
       — aggiunge 14.500 pixel accesi al denominatore della sagoma, e la
         crescita percentuale crolla anche se le braccia alzate valgono
         gli stessi 300 pixel di prima (misurato: 2.656 -> 16.944);
       — copre le sagome che si muovevano, e dimezza il primo controllo.
     Cioe' il cancello dichiarava morta la tribuna ogni volta che il gioco
     aveva qualcosa da annunciare. Un cancello che si rompe quando il
     gioco migliora e' peggio di nessun cancello: manda a rifare del
     lavoro buono.
     Si spegne il cartello, come gia' si spengono le luci della sera per
     il primo controllo, e alla fine si VERIFICA che sia rimasto spento:
     se il gioco lo riaccende da solo la misura non vale e il cancello lo
     dice, invece di scriverne un numero storto. */
  await pag.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1);
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true);
    window.__test.simulate(4.0);
    window.__test.setTimeLeft(30);
    const G = window.__test.G;
    G.ball.x = FW * 0.42; G.ball.y = FH - 8; G.ball.vx = 0; G.ball.vy = 0; G.ball.z = 0;
    for (const p of G.players) p.y = Math.min(p.y, FH - 14);
  });
  /* in pausa la simulazione sta ferma e la camera si posa sul bordo */
  await pag.evaluate(() => window.__test.setPaused(true));
  await pag.evaluate(() => window.__banco.passo(200));
  await pag.evaluate(() => window.__test.setPaused(false));
  /* il cartello spento: vedi la nota lunga sopra */
  await pag.evaluate(() => { const G = window.__test.G; G.banner = ''; G.bannerT = 0; });

  const R = await pag.evaluate(() => {
    const v = window.__test.view;
    /* LA FINESTRA COMINCIA A SETTANTA UNITA' DALLA RIGA, non a trentaquattro:
       fra 34 e 70 ci stanno la lavagnetta del punteggio e il quartiere
       (venditore, cane, ragazzini), che si muovono di loro. Misurati li'
       dentro, facevano differire due fotogrammi anche con la tribuna
       congelata a mano. Da 70 in giu' ci sono solo gli ultimi due anelli
       di gente: quello che si muove, li', e' la folla e nient'altro. */
    const y0 = Math.max(0, Math.round(v.Ay + (FH + 70) * v.S2));
    const y1 = Math.min(VH, Math.round(v.Ay + (FH + 108) * v.S2));
    return (y1 - y0 >= 16) ? { x: 0, y: y0, w: 915, h: y1 - y0 } : null;
  });

  /* LA SAGOMA SI MISURA IN UN'ALTRA FINESTRA, E COMINCIA VENTI UNITA' PIU'
     IN ALTO. Non e' un capriccio: NELLO SCOPPIO LA FOLLA SALTA. Il salto
     vale 3,0 + 1,8 x hype unita' di mondo (drawCrowd, riga 17780:
     yo = -Math.max(0,w)*(3.0+hype*1.8)), cioe' 7,2 a hype 2,35, piu' 2,4
     per chi sta in piedi (d.st): quasi DIECI delle trentotto unita' della
     finestra di sopra. Cosi' l'anello di tribuna che sta in cima esce dal
     bordo alto mentre le braccia entrano dal basso, e la misura addebita
     alla FORMA cio' che ha perso per TRASLAZIONE.
     Misurato scomponendo il fotogramma — le drawImage dell'atlante
     intercettate da fuori, riga dell'atlante e y forzate una alla volta —
     a 915x412@2, 17 agosto 2026, con la finestra 70-108 e la soglia 430:
       solo braccia (salto annullato)   +10,5%
       solo salto  (braccia abbassate)   -5,1%
       tutt'e due insieme                -1,3%   <- il rosso
       tribuna congelata (controllo)     -1,1%
     Con la finestra 50-108 e la soglia 380 il termine di sola traslazione
     si annulla (-0,0%) e resta la forma: +15,2% contro un controllo
     negativo di -0,2%.
     LA FINESTRA DI SOPRA NON SI TOCCA: fra 50 e 70 passano le gambe
     penzoloni dei ragazzini del muretto (drawSponda a FH+48), che si
     muovono da sole e regalerebbero il primo controllo. */
  const RS = await pag.evaluate(() => {
    const v = window.__test.view;
    const y0 = Math.max(0, Math.round(v.Ay + (FH + 50) * v.S2));
    const y1 = Math.min(VH, Math.round(v.Ay + (FH + 108) * v.S2));
    return (y1 - y0 >= 16) ? { x: 0, y: y0, w: 915, h: y1 - y0 } : null;
  });

  const esiti = [];
  const dice = (ok, testo) => { esiti.push(ok); console.log(`  ${ok ? 'OK  ' : 'NO  '} ${testo}`); };
  console.log('\n=== FOLLA E QUARTIERE ===');

  if (!R || !RS) {
    dice(false, 'la gradinata non entra mai in quadro: non c\'e' + ' niente da misurare');
  } else {
    const pixel = r => pag.evaluate(r => {
      const c = document.getElementById('gioco').getContext('2d');
      return Array.from(c.getImageData(r.x * 2, r.y * 2, r.w * 2, r.h * 2).data);
    }, r);
    /* PRIMA MISURA CON LE LUCI SPENTE. I flash dei fotografi e i telefonini
       accesi sono lampi grandi e bianchi: da soli fanno differire due
       fotogrammi anche con una tribuna di cartone, e questo cancello
       diventerebbe una carezza. Si porta il cronometro all'inizio della
       partita (q<0,30, nessuna luce) e cio' che resta a muoversi e' il
       RESPIRO delle sagome. Poi si torna a sera per il resto. */
    await pag.evaluate(() => {
      window.__test.setTimeLeft(80);
      window.__test.setPaused(true);       // la camera e il pallone stanno fermi
      window.__test.disegna();
    });
    const A = await pixel(R);
    await pag.evaluate(() => {
      /* SI AVANZA SOLO L'OROLOGIO DEL DISEGNO. Far girare un fotogramma
         vero muove anche la camera, e una camera che scivola di mezzo
         pixel fa "differire" ogni pixel dello schermo: il cancello
         passerebbe con una tribuna dipinta a mano (provato). Qui la
         simulazione e' in pausa, la camera e' inchiodata, e l'unica cosa
         che cambia e' il sedicesimo di secondo che la folla ha in piu'. */
      const G = window.__test.G, c = window.__test.cam;
      const s = { x: c.x, y: c.y, z: c.z };
      G.pulse += 1 / 60;
      window.__test.disegna();
      c.x = s.x; c.y = s.y; c.z = s.z;
    });
    const B = await pixel(R);
    await pag.evaluate(() => {
      window.__test.setPaused(false);
      window.__test.setTimeLeft(30);
      window.__test.disegna();
    });
    let div = 0;
    for (let i = 0; i < A.length; i += 4)
      if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 6) div++;
    const qDiff = 100 * div / (A.length / 4);
    dice(qDiff >= MIN_DIFF_FRAME,
      `due fotogrammi consecutivi differiscono (senza flash): ${qDiff.toFixed(2)}% dei pixel di tribuna (minimo ${MIN_DIFF_FRAME}%)`);

    /* ---------------------------------------------------------------
       COME SI ISOLA LA FOLLA DAL RESTO DEL GOL.
       La strada ovvia — segna, aspetta mezzo secondo, riguarda — misura
       tutto TRANNE la folla: al gol cambiano scena (e con essa il centro
       verticale del quadro), zoom, scossa e fascia bassa, e il confronto
       passa anche con una tribuna dipinta. Provato: con l'onda spenta a
       mano il cancello dava esattamente gli stessi numeri.
       Quindi si spezza in due misure oneste, e IN QUEST'ORDINE:
         a) che una folla accesa CAMBI FORMA, misurato sui pixel con la
            scena, la camera e il cronometro di disegno fermi dov'erano —
            si accende crowdHype a mano, senza segnare;
         b) che un gol ACCENDA la folla (crowdHype), letto dallo stato —
            e questa viene DOPO, perche' forceGoal cambia scena e da li'
            in poi nessuna misura sui pixel vale piu' niente.
       --------------------------------------------------------------- */
    const A0 = await pixel(RS);
    await pag.evaluate(() => {
      /* 0,25 s dopo il gol: dentro lo scoppio, quando la tribuna e' su */
      window.__test.G.crowdHype = 2.35;
      window.__test.disegna();
    });
    const A1 = await pixel(RS);

    let px0 = 0, px1 = 0;
    for (let i = 0; i < A0.length; i += 4) {
      /* SOGLIA ALTA, non media: sotto i 380 di somma RGB ci sono anche il
         fondale, la recinzione e le case, che non c'entrano niente e
         diluirebbero il segnale. Sopra restano teste e MANI — e le mani,
         quando le braccia salgono, sono pixel chiari che prima non
         c'erano da nessuna parte.
         DA 430 A 380, e il numero non e' di gusto. 430 era la soglia del
         16 agosto; da onda 5 la gradinata sta in ombra e la mano, larga
         quattro pixel dopo la riduzione dell'atlante, cade fra 300 e 430:
         a 430 restavano fuori proprio i pixel che il gol aggiunge. A 380
         il termine di sola traslazione si annulla e resta la forma. */
      if (A0[i] + A0[i + 1] + A0[i + 2] > 380) px0++;
      if (A1[i] + A1[i + 1] + A1[i + 2] > 380) px1++;
    }
    const cresc = px0 ? 100 * (px1 / px0 - 1) : 0;
    dice(cresc >= MIN_CRESCITA,
      `la sagoma della folla cresce con lo scoppio del gol (braccia su): ${cresc.toFixed(1)}% (minimo ${MIN_CRESCITA}%)`);

    /* LA MISURA VALEVA? Il cartello si spegne prima; se durante le due
       misure sui pixel il gioco ne ha riacceso uno, i due numeri qui
       sopra sono spazzatura e vanno dichiarati tali, non pubblicati.
       Questo controllo va PRIMA di forceGoal, che il banner lo accende
       per mestiere. */
    const cartello = await pag.evaluate(() => {
      const G = window.__test.G;
      return { testo: G.banner || '', t: +G.bannerT || 0 };
    });
    dice(!(cartello.t > 0 && cartello.testo),
      `nessun cartello dentro la finestra durante la misura${cartello.testo ? ': «' + cartello.testo + '» acceso per ' + cartello.t.toFixed(2) + ' s' : ''}`);

    const hypeGol = await pag.evaluate(() => {
      window.__test.G.crowdHype = 0;
      window.__test.forceGoal(0);
      return window.__test.G.crowdHype;
    });
    dice(hypeGol >= 2, `un gol accende la folla (crowdHype ${hypeGol.toFixed(2)}, minimo 2)`);
  }

  dice(errori.length === 0, `nessun errore in console${errori.length ? ': ' + errori[0] : ''}`);

  const passati = esiti.filter(Boolean).length;
  console.log(`\n${esiti.length} controlli, ${passati} passati, ${esiti.length - passati} falliti`);
  await br.close(); srv.chiudi();
  process.exit(passati === esiti.length ? 0 : 1);
})();
