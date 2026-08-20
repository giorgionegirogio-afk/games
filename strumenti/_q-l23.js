/* =====================================================================
   _q-l23.js — IL CANCELLO DELLA CHIAMATA (voce L2.3 di
   _analisi/agente28.md §10: «la chiamata: un campo per giocatore + un
   ramo in cima ad aiDecide»).

   Sorveglia CINQUE proprieta' del meccanismo, e nessuna di piu':

     A) UN CHIAMATO SI MUOVE DAVVERO, E PER CIRCA 1,6 s. La chiamata si
        manda nel verso OPPOSTO a quello che l'IA sceglierebbe da sola,
        cosi' il segno dello spostamento dice da solo chi comanda: finche'
        la chiamata vive l'uomo va di la', quando scade torna indietro. La
        durata misurata e' l'istante in cui l'uomo raggiunge il punto piu'
        lontano nel verso chiamato, cioe' quando smette di andarci.
     B) CORRE VERSO LO SPAZIO, NON DENTRO UN AVVERSARIO. La chiamata si
        punta ADDOSSO a un avversario e si misura la distanza minima dal
        piu' vicino durante la corsa; accanto, la stessa misura per un
        compagno NON chiamato nella stessa scena.
     C) IL SUO PESO NEL PUNTEGGIO DEL RICEVENTE SALE. Su 24 scene con un
        marcatore a distanza crescente si conta QUANTE VOLTE il pallone
        arriva davvero al chiamato, con e senza chiamata.
     D) LA CHIAMATA SCADE. Le stesse 24 scene, col passaggio battuto 0,6 s
        DOPO la scadenza: la scelta deve tornare esattamente quella di
        base. Un latch che non si consuma cade qui.
     E) LA CHIAMATA SI CONSUMA QUANDO IL PALLONE ARRIVA. Al chiamato si
        consegna il pallone a meta' corsa: deve giocare, non continuare la
        corsa chiamata.

   COME SI LEGGE UN VERDETTO, QUI DENTRO. Ogni verdetto sta su un EFFETTO
   della simulazione, mai su una bandiera scritta dal codice giudicato:
     · «si muove» — lo spostamento VERO dell'uomo in unita' di campo,
       fotogramma per fotogramma;
     · «verso lo spazio» — la distanza VERA dall'avversario piu' vicino;
     · «viene scelto» — CHI PRENDE DAVVERO IL PALLONE, letto da
       G.ball.owner dopo aver lasciato volare il passaggio; non b.passTo,
       che e' l'intenzione, e non il punteggio, che e' il codice giudicato.
   L'unica lettura non-effetto e' «esiste chiamaGiocatore», che e' una
   domanda di capacita' e non un verdetto: se manca, i cinque effetti sono
   assenti e i cinque verdetti sono rossi, con la ragione stampata.

   IL BANCO E' UN BROWSER, NON UN VETRO. Chromium, pagina vera servita da
   un server vero, tempo a passo fisso (__test.simulate(1/60), un passo di
   step() per chiamata) e Math.random a seme fisso RIMESSO A ZERO prima di
   ogni braccio, cosi' i due bracci di ogni confronto pescano gli stessi
   numeri. Due corse danno gli stessi risultati.

   GLI AVVERSARI SONO INCHIODATI, e va detto perche' e' una scelta del
   banco che cambia cio' che si misura: dopo ogni fotogramma le loro
   coordinate vengono rimesse dove stavano. Senza, la distanza misurata in
   B sarebbe la somma di due movimenti e non direbbe niente su dove va il
   chiamato; e in C e D il marcatore si sposterebbe fra un braccio e
   l'altro. Nelle prove C e D sono inchiodati ANCHE il chiamato e il
   compagno di controllo: cosi' fra i tre bracci l'unica differenza
   rimasta e' il peso, non la posizione.

   uso:
     node strumenti/_q-l23.js                        (sul gioco di casa)
     node strumenti/_q-l23.js --gioco fuori/dopo.html
     node strumenti/_q-l23.js --taglia 11            (7 e 11: scene riscalate)
     node strumenti/_q-l23.js --testa                (finestra visibile)
   esce 0 se tutti i verdetti sono verdi, 1 se anche uno solo e' rosso,
   2 se il banco e' esploso.

   ---------------------------------------------------------------------
   OGNI RIGA DI QUESTO CANCELLO E' STATA VISTA FALLIRE, e non solo sul
   gioco senza la voce (dove sono rossi tutti e sei per la ragione banale
   che chiamaGiocatore non esiste). Sono state costruite cinque copie
   GUASTE della toppa, una per proprieta', e questo e' cio' che hanno
   dato — 20 agosto 2026:

     guasto                                          A   B1  B2  C   D   E
     la chiamata non scade mai (CHIAMA_T = 99)       R   .   .   .   R   .
     il chiamato non scansa gli avversari            .   R   .   .   .   .
     la chiamata non pesa niente (CHIAMA_PESO = 0)   .   .   .   R   R   .
     il pallone ricevuto non spegne la chiamata      .   .   .   .   .   R
     il ramo di aiDecide non fa niente               R   R   R   .   .   .
     gioco di oggi, senza la voce                    R   R   R   R   R   R

   Il doppio rosso di D sul peso a zero non e' un difetto: D contiene la
   precondizione «la chiamata viva DEVE aver spostato la scelta», se no
   «e' tornata alla base» sarebbe vero perche' non e' mai partita.

   COME SI RIFANNO I CINQUE GUASTI, perche' un controllo negativo che non
   si puo' ripetere non e' un controllo. Si applica la toppa a una copia
   (node strumenti/_t-l23.js --out fuori/l23.html) e nella copia si
   sostituisce, una alla volta, una di queste righe:
     1  const CHIAMA_T = 1.6;      ->  const CHIAMA_T = 99;
     2  in chiamaGiocatore, «const ty=scansaAvversari(p.team, tx, ...);»
        ->  «const ty=clamp(p.y+uy*s, 50, FH-50);»
     3  const CHIAMA_PESO = 140;   ->  const CHIAMA_PESO = 0;
     4  «if(chi===p || (chi && chi.team!==p.team)) p.chiamata=0;»
        ->  «if(chi && chi.team!==p.team) p.chiamata=0;»
     5  nel ramo della chiamata in aiDecide, si tolgono le due righe che
        scrivono p.aiTX/p.aiTY e resta il solo «return;»
   Poi: node strumenti/_q-l23.js --gioco fuori/quella-copia.html
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
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const TESTA = process.argv.includes('--testa');
const SEME = +arg('seme', 20260820);
const TAGLIA = +arg('taglia', 5);
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.json': 'application/json' };

/* Playwright non apre file: — serve un server locale. Qualunque richiesta
   del gioco viene deviata sul file che stiamo giudicando. */
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end('no'); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream',
                           'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il generatore a seme fisso, con la maniglia per RIMETTERLO A ZERO: i
   bracci di un confronto appaiato devono pescare gli stessi numeri, se no
   la differenza misurata contiene anche il caso */
function semeFisso(s0) {
  let s = s0 >>> 0 || 1;
  const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
  Math.random = () => p() / 4294967296;
  window.__seme = v => { s = (v >>> 0) || 1; };
}

/* ---------------------------------------------------------------------
   GLI ATTREZZI DI SCENA, installati nella pagina.
   Non ricostruiscono niente del gioco: aprono la partita vera, spostano
   i corpi e chiamano __test.simulate. Nessun new Function, nessuna copia
   di funzioni del gioco.
   --------------------------------------------------------------------- */
function attrezziL23() {
  window.__L23 = {
    /* porta la partita in gioco, alla taglia chiesta.
       LE SCENE SONO SCRITTE IN COORDINATE DELLA TAGLIA 5 (campo 1150x560)
       e vengono riscalate: le POSIZIONI col campo, e le distanze che
       rappresentano lo SLANCIO dell'IA con KPASSO, che e' la scala con cui
       il gioco stesso allunga le sue poche distanze assolute (1 / 1,15 /
       1,3 contro 1 / 1,4 / 2 del campo). Le distanze che entrano nel
       punteggio del ricevente non si scalano affatto: satura a 220 unita'
       su ogni campo. */
    avvia(tg) {
      const t = window.__test, G = t.G;
      try { t.dismissSplash && t.dismissSplash(); } catch (e) {}
      try { t.setPaused(false); } catch (e) {}
      try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
      for (let g = 0; g < 3 && (G.scene !== 'play' || t.taglia !== tg); g++) {
        if (G.scene !== 'play' || t.taglia !== tg) { t.startMatch(1, 1, { size: tg }); }
        for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1);
      }
      window.__K = { kx: t.campo.FW / 1150, ky: t.campo.FH / 560,
                     kp: (typeof KPASSO !== 'undefined') ? KPASSO : 1 };
      return { scene: G.scene, taglia: t.taglia, FW: t.campo.FW, FH: t.campo.FH,
               kx: window.__K.kx, ky: window.__K.ky, kp: window.__K.kp,
               saChiamare: typeof window.chiamaGiocatore === 'function' };
    },
    /* un punto della scena, dalle coordinate della taglia 5 a quelle vere */
    P(x, y) { return [x * window.__K.kx, y * window.__K.ky]; },
    /* LA POSA. Azzera ogni gesto in corso su tutti, mette i corpi dove
       dice cfg e consegna il pallone al comandato della squadra 0.
       Torna gli indici: portatore, A (il chiamato), B (il controllo). */
    posa(cfg) {
      const t = window.__test, G = t.G;
      if (G.scene !== 'play') return { errore: "la partita non e' in gioco: scena '" + G.scene + "'" };
      t.setTimeLeft(80);
      if (cfg.cpuCasa !== undefined) t.setCpuVsCpu(!!cfg.cpuCasa);
      const P = G.players;
      const noi = [], loro = [];
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.vx = 0; p.vy = 0; p.ax = 0; p.ay = 0; p.pvx = 0; p.pvy = 0;
        p.slide = -1; p.recover = 0; p.rove = -1; p.out = 0;
        p.fiato = 100; p.kickCd = 0; p.kickT = 0; p.kickB = 0; p.celeb = 0;
        p.aiT = 0; p.sprint = false;
        try { chiudiAnticipo(p); } catch (e) {}
        if (p.corsaArea !== undefined) p.corsaArea = 0;
        if (p.chiamata !== undefined) p.chiamata = 0;
        if (p.role === 'gk') { p.x = p.team === 0 ? 40 : t.campo.FW - 40; p.y = t.campo.FH / 2; continue; }
        (p.team === 0 ? noi : loro).push(i);
      }
      if (noi.length < 3 || loro.length < 2) return { errore: 'servono almeno 3 uomini in casa e 2 fuori' };
      /* il portatore e' il comandato quando c'e', se no il primo di casa */
      const pi = (G.ctrl[0] >= 0 && P[G.ctrl[0]].role !== 'gk') ? G.ctrl[0] : noi[0];
      const resto = noi.filter(i => i !== pi);
      const iA = resto[0], iB = resto[1];
      const altri = resto.slice(2);
      P[pi].x = cfg.portatore[0]; P[pi].y = cfg.portatore[1];
      P[pi].fx = 1; P[pi].fy = 0;
      P[iA].x = cfg.A[0]; P[iA].y = cfg.A[1];
      P[iB].x = cfg.B[0]; P[iB].y = cfg.B[1];
      for (let k = 0; k < altri.length; k++) {
        const q = (cfg.compagni && cfg.compagni[k]) || [60, 40 + k * 40];
        P[altri[k]].x = q[0]; P[altri[k]].y = q[1];
      }
      for (let k = 0; k < loro.length; k++) {
        const q = (cfg.avversari && cfg.avversari[k]) || [t.campo.FW - 60, 40 + k * 40];
        P[loro[k]].x = q[0]; P[loro[k]].y = q[1];
      }
      const b = G.ball;
      b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.perfectT = 0;
      b.passTo = -1; b.crossTo = -1; b.tiroT = -1;
      b.owner = pi; b.x = P[pi].x + 14; b.y = P[pi].y;
      try { segnaTocco(pi); } catch (e) {}
      /* le squadre ripensano subito, se no i ruoli sono quelli della
         scena precedente e il primo mezzo secondo misura il passato */
      try { G.brain[0].t = 0; G.brain[0].ruoloT = 0; G.brain[1].t = 0; G.brain[1].ruoloT = 0; } catch (e) {}
      return { pi, iA, iB, loro, altri, FW: t.campo.FW, FH: t.campo.FH };
    },
    /* un fotogramma di gioco, poi i corpi inchiodati tornano al loro posto */
    passo(inchiodati) {
      const t = window.__test, G = t.G;
      t.simulate(1 / 60);
      if (inchiodati) for (const r of inchiodati) {
        const p = G.players[r[0]];
        p.x = r[1]; p.y = r[2]; p.vx = 0; p.vy = 0; p.ax = 0; p.ay = 0;
      }
    },
    /* la distanza dall'avversario piu' vicino, in unita' di campo */
    varco(i) {
      const G = window.__test.G, p = G.players[i];
      let d = 1e9;
      for (const o of G.players) {
        if (o.team === p.team || o.out > 0) continue;
        d = Math.min(d, Math.hypot(o.x - p.x, o.y - p.y));
      }
      return d;
    },
  };
}

const n2 = v => (v === null || v === undefined || !isFinite(v)) ? 'n/d' : (Math.round(v * 100) / 100).toString().replace('.', ',');
const pc = v => (v === null || !isFinite(v)) ? 'n/d' : n2(v * 100) + '%';

/* ===================================================================== */
(async () => {
  const srv = await servi();
  const br = await chromium.launch({ headless: !TESTA });
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const eccezioni = [];
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(attrezziL23);
  pag.on('pageerror', e => eccezioni.push(e.message));
  await pag.goto('http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  const avvio = await pag.evaluate(tg => window.__L23.avvia(tg), TAGLIA);
  if (avvio.scene !== 'play') { console.error('FALLITO: la partita non arriva in gioco (scena ' + avvio.scene + ')'); process.exit(2); }
  if (avvio.taglia !== TAGLIA) { console.error('FALLITO: chiesta la taglia ' + TAGLIA + ', il gioco e\' a ' + avvio.taglia); process.exit(2); }

  const FW = avvio.FW, FH = avvio.FH;
  const SA = avvio.saChiamare;
  const esiti = [];
  const stampa = s => console.log(s);

  stampa('=== CANCELLO L2.3 — la chiamata ===');
  stampa('  gioco: ' + GIOCO);
  stampa('  banco: Chromium 915x412, campo ' + FW + 'x' + FH + ' (taglia ' + avvio.taglia +
         ', scene riscalate x' + n2(avvio.kx) + '/' + n2(avvio.ky) + ', KPASSO ' + n2(avvio.kp) + '), passo fisso 1/60, seme ' + SEME);
  stampa('  il gioco sa chiamare (window.chiamaGiocatore): ' + (SA ? 'SI' : 'NO'));
  stampa('');

  /* ===================================================================
     A — SI MUOVE DAVVERO, E PER CIRCA 1,6 s.

     La scena: il portatore fermo al centro col pallone al piede, il
     chiamato 100 unita' davanti a lui, gli avversari lontani e
     inchiodati. Da solo, il ramo dello smarcato di aiDecide manda il
     chiamato AVANTI (verso la porta avversaria, che per la squadra 0 e'
     a destra). La chiamata lo manda INDIETRO. Percio' il verso dello
     spostamento e' un verdetto: finche' va indietro comanda la chiamata,
     e l'istante in cui raggiunge il punto piu' a sinistra e' l'istante in
     cui la chiamata ha smesso di comandare.
     Il braccio di controllo e' la stessa scena senza chiamata.
     =================================================================== */
  async function provaA(chiama) {
    return await pag.evaluate(cfg => {
      const L = window.__L23, t = window.__test, G = t.G;
      window.__seme(cfg.seme);
      const s = L.posa({
        portatore: L.P(600, 280), A: L.P(700, 180), B: L.P(700, 380),
        compagni: [L.P(120, 120)],
        avversari: [L.P(1080, 120), L.P(1080, 200), L.P(1080, 360), L.P(1080, 440)],
      });
      if (s.errore) return { errore: s.errore };
      const inch = s.loro.map(i => [i, G.players[i].x, G.players[i].y]);
      const A = G.players[s.iA];
      const x0 = A.x, y0 = A.y;
      if (cfg.chiama) {
        if (typeof window.chiamaGiocatore !== 'function') return { senzaMotore: true };
        chiamaGiocatore(A, -1, 0);
      }
      const traccia = [];
      for (let f = 0; f < cfg.frames; f++) {
        L.passo(inch);
        traccia.push([+(x0 - A.x).toFixed(2), +(A.y - y0).toFixed(2)]);
      }
      /* DUE ISTANTI, NON UNO, perche' un corpo che scatta non si ferma su
         un centesimo.
           tPicco   quando arriva al punto piu' lontano nel verso chiamato:
                    e' la fine della corsa VISTA DA FUORI, e comprende la
                    decelerazione;
           tSpinta  l'ultimo fotogramma in cui stava ancora andando in quel
                    verso a piena andatura (>= il 90% del passo massimo):
                    e' l'istante in cui il bersaglio ha smesso di essere
                    quello della chiamata. */
      let best = -1e9, fBest = -1, passoMax = 0;
      const passi = [];
      for (let f = 0; f < traccia.length; f++) {
        if (traccia[f][0] > best) { best = traccia[f][0]; fBest = f; }
        const d = traccia[f][0] - (f ? traccia[f - 1][0] : 0);
        passi.push(d);
        if (d > passoMax) passoMax = d;
      }
      let fSpinta = -1;
      for (let f = 0; f < passi.length; f++) if (passi[f] >= passoMax * 0.9) fSpinta = f;
      return { avanzata: best, tSec: (fBest + 1) / 60, tSpinta: (fSpinta + 1) / 60,
               fine: traccia[traccia.length - 1][0], x0, y0, xFine: A.x, yFine: A.y };
    }, { chiama, frames: 180, seme: SEME });
  }

  {
    const conChiamata = await provaA(true);
    const senza = await provaA(false);
    let ok = false, nota = '';
    stampa('A) SI MUOVE DAVVERO, E PER CIRCA 1,6 s — chiamata verso SINISTRA, cioe\' contro il verso che l\'IA sceglie da sola');
    if (conChiamata.errore || senza.errore) { nota = 'scena non montata: ' + (conChiamata.errore || senza.errore); stampa('   ' + nota); }
    else if (conChiamata.senzaMotore) {
      nota = 'il gioco non sa chiamare nessuno: window.chiamaGiocatore non esiste';
      stampa('   chiamato:      n/d — ' + nota);
      stampa('   non chiamato:  avanzata verso sinistra ' + n2(senza.avanzata) + ' unita\' (va dall\'altra parte, come deve)');
    } else {
      stampa('   chiamato:      avanzata verso sinistra ' + n2(conChiamata.avanzata) + ' unita\'' +
             '  ·  ultima spinta piena a ' + n2(conChiamata.tSpinta) + ' s' +
             '  ·  punto piu\' lontano a ' + n2(conChiamata.tSec) + ' s' +
             '  (a 3,00 s e\' tornato a ' + n2(conChiamata.fine) + ')');
      stampa('   non chiamato:  avanzata verso sinistra ' + n2(senza.avanzata) + ' unita\' (l\'IA lo manda a destra: il numero deve restare piccolo)');
      ok = conChiamata.avanzata >= 120 && senza.avanzata <= 25 &&
           conChiamata.tSpinta >= 1.40 && conChiamata.tSpinta <= 1.80 &&
           conChiamata.tSec >= 1.50 && conChiamata.tSec <= 2.20;
    }
    stampa('   atteso: chiamato >= 120 unita\' · non chiamato <= 25 · spinta piena fino a 1,40-1,80 s · inversione fra 1,50 e 2,20 s  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
    esiti.push({ id: 'A', nome: 'il chiamato corre davvero, e per circa 1,6 s', ok });
  }

  /* ===================================================================
     B — VERSO LO SPAZIO, NON DENTRO UN AVVERSARIO.
     Due misure, e sono due domande diverse.

     B1 · LA SCENA AVVERSA. La chiamata si punta ADDOSSO a un avversario
     piantato esattamente sulla rotta, a 170 unita' davanti al chiamato
     (che e' lo SLANCIO del ramo dello smarcato, cioe' la lunghezza che il
     gioco stesso usa per un'offerta in avanti). Si misura la distanza
     minima dall'avversario piu' vicino durante 1,6 s.
     LA SOGLIA E' COSTRUITA CON I NUMERI DEL GIOCO, non scelta a gusto:
     sta a meta' fra P_R*2 = 26 unita' (due corpi che si toccano: e' il
     numero che esce quando si corre addosso a qualcuno) e 70 unita' (il
     raggio con cui il gioco stesso, nel ramo dello smarcato, dichiara che
     «li' c'e' un avversario»). Meta' di 26 e 70 fa 48.
     QUI NON SI CONFRONTA CON UN NON CHIAMATO, e non e' una dimenticanza:
     un non chiamato in questa scena non e' comparabile, perche' non gli
     ha detto nessuno di andare addosso a quell'uomo. Il confronto chiesto
     dalla consegna e' B2.

     B2 · IL CONFRONTO. Una scena ordinaria, con gli avversari sparsi
     davanti. Lo STESSO uomo, nello STESSO mondo, misurato in nove modi:
     non chiamato, e chiamato in otto direzioni di bussola. Se una
     chiamata portasse sistematicamente addosso a qualcuno, la mediana
     delle otto starebbe sotto quella del non chiamato.
     IL VERDETTO STA SULLA MEDIANA, NON SULLA PEGGIORE, e la ragione va
     detta perche' e' una scelta e non una svista. La direzione la sceglie
     una persona, e una persona puo' chiamare dentro il traffico: chiedere
     che anche la PEGGIORE delle otto direzioni pretese stia sopra la
     scelta che l'IA avrebbe fatto da sola non e' un confronto alla pari,
     e' chiedere al meccanismo di rifiutare le chiamate scomode. La
     peggiore si stampa lo stesso, col suo numero, perche' e' li' che si
     vede il limite dichiarato dello scansamento: guarda il punto
     d'arrivo, quindi non vede chi sta OLTRE la carota. Misurato sulla
     copia toppata il 20 agosto 2026, la peggiore delle otto: 23,73 unita'
     a taglia 5 (dove pero' il NON chiamato arriva a 22,40, cioe' peggio),
     46,58 a taglia 7 e 63,46 a taglia 11.
     =================================================================== */
  const SOGLIA_VARCO = 48;
  {
    const r = await pag.evaluate(cfg => {
      const L = window.__L23, t = window.__test, G = t.G;
      window.__seme(cfg.seme);
      const casaA = L.P(600, 190);
      const s = L.posa({
        portatore: L.P(500, 280), A: casaA, B: L.P(600, 370),
        compagni: [L.P(120, 120)],
        /* il marcatore e' piantato esattamente sulla rotta, allo SLANCIO
           (170 unita' per KPASSO) davanti al chiamato; gli altri tre
           lontani */
        avversari: [[casaA[0] + 170 * window.__K.kp, casaA[1]],
                    L.P(1090, 260), L.P(1090, 120), L.P(1090, 440)],
      });
      if (s.errore) return { errore: s.errore };
      const inch = s.loro.map(i => [i, G.players[i].x, G.players[i].y]);
      const A = G.players[s.iA];
      if (typeof window.chiamaGiocatore !== 'function') return { senzaMotore: true };
      chiamaGiocatore(A, 1, 0);
      let mA = 1e9;
      const fin = [];
      for (let f = 0; f < 96; f++) {
        L.passo(inch);
        const a = L.varco(s.iA);
        mA = Math.min(mA, a);
        if (f >= 66) fin.push(a);
      }
      const med = v => { const w = v.slice().sort((x, y) => x - y); return w[w.length >> 1]; };
      return { senzaMotore: false, minA: mA, finA: med(fin),
               xA: G.players[s.iA].x, yA: G.players[s.iA].y };
    }, { seme: SEME });
    let ok = false;
    stampa('B1) SCENA AVVERSA — chiamata puntata ADDOSSO a un avversario piantato a 170 unita\' sulla rotta');
    if (r.errore) stampa('   scena non montata: ' + r.errore);
    else if (r.senzaMotore) stampa('   n/d — window.chiamaGiocatore non esiste: nessuno puo\' essere chiamato');
    else {
      stampa('   distanza minima dall\'avversario piu\' vicino durante 1,6 s: ' + n2(r.minA) + ' unita\'  ·  negli ultimi 0,5 s ' + n2(r.finA));
      stampa('   (riferimenti del gioco: due corpi che si toccano 26 unita\'; «li\' c\'e\' un avversario» 70)');
      ok = r.minA >= SOGLIA_VARCO;
    }
    stampa('   atteso: >= ' + SOGLIA_VARCO + ' unita\', cioe\' a meta\' strada fra i due numeri del gioco  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
    esiti.push({ id: 'B1', nome: 'chiamato addosso a un avversario, gli gira intorno', ok });
  }

  {
    const r = await pag.evaluate(cfg => {
      const L = window.__L23, t = window.__test, G = t.G;
      const bussola = [[1, 0], [0.707, 0.707], [0, 1], [-0.707, 0.707], [-1, 0], [-0.707, -0.707], [0, -1], [0.707, -0.707]];
      const scena = {
        portatore: L.P(500, 280), A: L.P(620, 200), B: L.P(620, 360),
        compagni: [L.P(120, 120)],
        avversari: [L.P(700, 140), L.P(760, 300), L.P(860, 220), L.P(900, 400)],
      };
      function corri(dir) {
        window.__seme(cfg.seme);
        const s = L.posa(scena);
        if (s.errore) return null;
        const inch = s.loro.map(i => [i, G.players[i].x, G.players[i].y]);
        if (dir) {
          if (typeof window.chiamaGiocatore !== 'function') return 'senzaMotore';
          chiamaGiocatore(G.players[s.iA], dir[0], dir[1]);
        }
        let m = 1e9, mB = 1e9;
        for (let f = 0; f < 96; f++) { L.passo(inch); m = Math.min(m, L.varco(s.iA)); mB = Math.min(mB, L.varco(s.iB)); }
        return { A: m, B: mB };
      }
      const controllo = corri(null);
      if (controllo === null) return { errore: 'scena non montata' };
      const chiamate = [];
      for (const d of bussola) {
        const v = corri(d);
        if (v === 'senzaMotore') return { senzaMotore: true, controllo };
        chiamate.push(v.A);
      }
      const ord = chiamate.slice().sort((a, b) => a - b);
      return { senzaMotore: false, controllo, chiamate,
               peggio: ord[0], mediana: ord[ord.length >> 1], meglio: ord[ord.length - 1] };
    }, { seme: SEME });
    let ok = false;
    stampa('B2) IL CONFRONTO — scena ordinaria, lo stesso uomo: non chiamato, e chiamato nelle otto direzioni di bussola');
    if (r.errore) stampa('   scena non montata: ' + r.errore);
    else if (r.senzaMotore) {
      stampa('   NON CHIAMATO  distanza minima dall\'avversario piu\' vicino ' + n2(r.controllo.A) + ' unita\'');
      stampa('   CHIAMATO      n/d — window.chiamaGiocatore non esiste');
    } else {
      stampa('   NON CHIAMATO  distanza minima dall\'avversario piu\' vicino ' + n2(r.controllo.A) + ' unita\'' +
             '  (il compagno di controllo, sempre non chiamato: ' + n2(r.controllo.B) + ')');
      stampa('   CHIAMATO      sulle otto direzioni: peggiore ' + n2(r.peggio) + '  ·  MEDIANA ' + n2(r.mediana) + '  ·  migliore ' + n2(r.meglio));
      stampa('                 le otto, da est in senso orario: ' + r.chiamate.map(v => n2(v)).join(' · '));
      stampa('   la peggiore delle otto e\' il LIMITE DICHIARATO, non il verdetto: lo scansamento guarda il punto');
      stampa('   d\'arrivo della chiamata, quindi non vede chi sta OLTRE la carota. Chi chiama dentro il traffico');
      stampa('   ci va: il meccanismo non rifiuta le chiamate scomode, e non e\' scritto per rifiutarle.');
    /* IL PAVIMENTO E' IL MINORE FRA 26 (due corpi che si toccano) E IL
       NON CHIAMATO. Il secondo termine non e' una scusa: in certe scene
       il gioco, da solo, porta l'uomo piu' vicino di 26 — a taglia 5 in
       questa scena il non chiamato arriva a 22,4 — e pretendere dalla
       chiamata piu' di quanto il gioco fa da se' vorrebbe dire giudicare
       il gioco con l'etichetta della chiamata. */
      const pavimento = Math.min(2 * 13, r.controllo.A);
      ok = r.mediana >= Math.max(SOGLIA_VARCO, r.controllo.A - 20) && r.peggio >= pavimento;
      stampa('   pavimento di questa scena: ' + n2(pavimento) + ' unita\' (il minore fra i 26 dei corpi e le ' + n2(r.controllo.A) + ' del non chiamato)');
    }
    stampa('   atteso: mediana >= ' + SOGLIA_VARCO + ' e non peggiore del non chiamato di oltre 20 · nessuna direzione sotto il pavimento  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
    esiti.push({ id: 'B2', nome: 'chiamato non sta piu\' addosso agli avversari di un non chiamato', ok });
  }

  /* ===================================================================
     C e D — IL PESO, E LA SUA SCADENZA.

     Ventiquattro scene uguali tranne per una cosa: il marcatore del
     chiamato si allontana da lui di otto unita' per volta, da 20 a 204.
     Il punteggio del ricevente sale con quella distanza, e il marcatore
     del compagno di controllo sta fisso a 180: percio' le ventiquattro
     scene spazzano proprio la zona in cui la scelta cambia idea, e la
     quota di base non e' ne' zero ne' tutto. In ciascuna si batte
     il passaggio del dito (doPass, cioe' la strada che finisce in
     eseguiPassUmano, dove smarcato e' il termine principale) e si guarda
     CHI PRENDE DAVVERO IL PALLONE.

     Tre bracci, appaiati fino al bit: stesso seme rimesso a zero, stesse
     posizioni, e il chiamato e il compagno di controllo INCHIODATI, cosi'
     l'unica differenza fra i bracci e' il peso.
       i   senza chiamata
       ii  chiamata, passaggio subito              -> misura C
       iii chiamata, passaggio a 2,20 s (0,60 s dopo la scadenza) -> D
     =================================================================== */
  async function provaCD(quando, chiama) {
    return await pag.evaluate(cfg => {
      const L = window.__L23, t = window.__test, G = t.G;
      const esiti = [];
      for (let v = 0; v < cfg.varianti; v++) {
        window.__seme(cfg.seme + v);
        const dist = 20 + v * 8;                   // il marcatore si allontana dal chiamato
        const cA = L.P(720, 180), cB = L.P(720, 380);
        const s = L.posa({
          portatore: L.P(480, 280), A: cA, B: cB,
          compagni: [L.P(100, 120)],
          /* marcatore del chiamato: a «dist» OLTRE di lui, cioe' dietro
             le sue spalle e mai sulla linea di passaggio (il conto sta
             nella consegna). Marcatore del controllo: fisso a 180, oltre
             di lui allo stesso modo. Queste due distanze NON si scalano
             con il campo: entrano in un punteggio che satura a 220 unita'
             su ogni taglia. Gli altri due avversari lontani e simmetrici,
             cosi' contribuiscono uguale ai due candidati. */
          avversari: [[cA[0] + dist, cA[1]], [cB[0] + 180, cB[1]],
                      L.P(1090, 100), L.P(1090, 460)],
        });
        if (s.errore) return { errore: s.errore };
        const inch = s.loro.map(i => [i, G.players[i].x, G.players[i].y]);
        inch.push([s.iA, G.players[s.iA].x, G.players[s.iA].y]);
        inch.push([s.iB, G.players[s.iB].x, G.players[s.iB].y]);
        if (cfg.chiama) {
          if (typeof window.chiamaGiocatore !== 'function') return { senzaMotore: true };
          chiamaGiocatore(G.players[s.iA], 1, 0);
        }
        for (let f = 0; f < cfg.attesa; f++) L.passo(inch);
        /* il passaggio del dito */
        if (typeof window.doPass !== 'function') return { errore: 'doPass non esiste su questo gioco' };
        doPass(0);
        let chi = -1;
        for (let f = 0; f < 170; f++) {
          L.passo(inch);
          if (G.ball.owner >= 0 && G.ball.owner !== s.pi) { chi = G.ball.owner; break; }
        }
        esiti.push({ dist, chi, aA: chi === s.iA, aB: chi === s.iB, nessuno: chi < 0 });
      }
      return { esiti };
    }, { varianti: 24, seme: SEME, attesa: quando, chiama });
  }

  {
    const base = await provaCD(3, false);
    const subito = await provaCD(3, true);
    const tardi = await provaCD(Math.round(2.2 * 60), true);
    const quota = r => (r && r.esiti) ? r.esiti.filter(e => e.aA).length / r.esiti.length : null;
    const persi = r => (r && r.esiti) ? r.esiti.filter(e => e.nessuno).length : null;
    const qBase = quota(base), qSub = quota(subito), qTar = quota(tardi);

    stampa('C) IL PESO SALE — 24 scene, il marcatore del chiamato da 20 a 204 unita\' (il controllo ce l\'ha fisso a 180); si conta chi prende DAVVERO il pallone');
    if (!base.esiti) stampa('   scena non montata: ' + (base.errore || 'ignoto'));
    if (subito.senzaMotore || tardi.senzaMotore) {
      stampa('   senza chiamata:  il pallone arriva al candidato A in ' + (qBase === null ? 'n/d' : Math.round(qBase * 24) + '/24 scene (' + pc(qBase) + ')'));
      stampa('   con la chiamata: n/d — window.chiamaGiocatore non esiste');
    } else {
      stampa('   senza chiamata:  A riceve in ' + Math.round(qBase * 24) + '/24 scene (' + pc(qBase) + ')  ·  passaggi che non arrivano a nessuno: ' + persi(base));
      stampa('   con la chiamata: A riceve in ' + Math.round(qSub * 24) + '/24 scene (' + pc(qSub) + ')  ·  passaggi che non arrivano a nessuno: ' + persi(subito));
    }
    const okC = qBase !== null && qSub !== null && !subito.senzaMotore &&
                (qSub - qBase) >= 0.25 && qBase < 0.75;
    stampa('   atteso: la quota sale di almeno 25 punti, e la base lascia spazio per salire (< 75%)  ->  ' + (okC ? 'VERDE' : 'ROSSO'));
    stampa('');
    esiti.push({ id: 'C', nome: 'il peso del chiamato nel punteggio del ricevente sale', ok: okC });

    stampa('D) LA CHIAMATA SCADE — le stesse 24 scene, passaggio battuto a 2,20 s, cioe\' 0,60 s dopo la scadenza');
    if (tardi.senzaMotore) stampa('   n/d — window.chiamaGiocatore non esiste');
    else {
      stampa('   dopo la scadenza: A riceve in ' + Math.round(qTar * 24) + '/24 scene (' + pc(qTar) + ')');
      stampa('   riferimento senza chiamata: ' + Math.round(qBase * 24) + '/24 (' + pc(qBase) + ')  ·  con la chiamata viva: ' + Math.round(qSub * 24) + '/24 (' + pc(qSub) + ')');
    }
    /* LA SECONDA CONDIZIONE E' UNA PRECONDIZIONE, non un doppione di C:
       se la chiamata viva non avesse spostato niente, «torna alla base»
       sarebbe vero per il motivo sbagliato — non e' scaduta, non e' mai
       partita — e questo verdetto sarebbe verde su un meccanismo morto. */
    const okD = qBase !== null && qTar !== null && !tardi.senzaMotore &&
                Math.abs(qTar - qBase) <= 1 / 24 + 1e-9 && (qSub - qBase) >= 0.25;
    stampa('   atteso: la quota torna quella di base (scarto <= 1 scena su 24), E la chiamata viva l\'aveva spostata di almeno 25 punti  ->  ' + (okD ? 'VERDE' : 'ROSSO'));
    stampa('');
    esiti.push({ id: 'D', nome: 'la chiamata scade e non resta appesa', ok: okD });
  }

  /* ===================================================================
     E — LA CHIAMATA SI CONSUMA QUANDO IL PALLONE ARRIVA.
     Al chiamato, a meta' corsa, si consegna il pallone. Da quell'istante
     e' il portatore, e deve fare cio' che fa un portatore — puntare la
     porta avversaria, che sta dalla parte OPPOSTA alla chiamata. Se la
     chiamata gli restasse addosso continuerebbe la corsa chiamata col
     pallone al piede, che e' il latch che non si consuma.
     Qui la squadra di casa e' affidata alla CPU: se no, quando il pallone
     cambia piede il gioco cambia da solo l'uomo comandato e il chiamato
     finirebbe sotto il dito invece che sotto aiDecide.
     =================================================================== */
  {
    const r = await pag.evaluate(cfg => {
      const L = window.__L23, t = window.__test, G = t.G;
      window.__seme(cfg.seme);
      const s = L.posa({
        cpuCasa: true,
        portatore: L.P(600, 280), A: L.P(700, 180), B: L.P(700, 380),
        compagni: [L.P(120, 120)],
        avversari: [L.P(1080, 120), L.P(1080, 200), L.P(1080, 360), L.P(1080, 440)],
      });
      if (s.errore) return { errore: s.errore };
      const inch = s.loro.map(i => [i, G.players[i].x, G.players[i].y]);
      const A = G.players[s.iA];
      if (typeof window.chiamaGiocatore !== 'function') return { senzaMotore: true };
      chiamaGiocatore(A, -1, 0);
      for (let f = 0; f < 30; f++) L.passo(inch);       // mezza corsa: 0,5 s
      const xConsegna = A.x;
      const b = G.ball;
      b.owner = s.iA; b.x = A.x + 14; b.y = A.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.passTo = -1;
      try { segnaTocco(s.iA); } catch (e) {}
      for (let f = 0; f < 48; f++) L.passo(inch);       // 0,8 s col pallone
      return { senzaMotore: false, xConsegna, xFine: A.x,
               avanti: A.x - xConsegna, indietro: xConsegna - A.x, owner: G.ball.owner, iA: s.iA };
    }, { seme: SEME });
    let ok = false;
    stampa('E) LA CHIAMATA SI CONSUMA ALLA RICEZIONE — pallone consegnato al chiamato a meta\' corsa');
    if (r.errore) stampa('   scena non montata: ' + r.errore);
    else if (r.senzaMotore) stampa('   n/d — window.chiamaGiocatore non esiste');
    else {
      stampa('   nei 0,80 s dopo la consegna si e\' spostato di ' + n2(r.indietro) + ' unita\' NEL VERSO CHIAMATO (verso sinistra)');
      stampa('   pallone alla fine: ' + (r.owner === r.iA ? 'ancora suo' : (r.owner < 0 ? 'in volo (l\'ha giocato)' : 'di un altro')));
      ok = r.indietro <= 25;
    }
    stampa('   atteso: <= 25 unita\' nel verso chiamato: il pallone spegne la chiamata  ->  ' + (ok ? 'VERDE' : 'ROSSO'));
    stampa('');
    esiti.push({ id: 'E', nome: 'la chiamata si consuma quando il pallone arriva', ok });
  }

  await br.close(); srv.chiudi();

  const rossi = esiti.filter(e => !e.ok);
  stampa('--- ESITO ---');
  for (const e of esiti) stampa('  ' + (e.ok ? 'VERDE' : 'ROSSO') + '  ' + e.id + '  ' + e.nome);
  if (eccezioni.length) stampa('  eccezioni in pagina: ' + eccezioni.length + ' — ' + eccezioni.slice(0, 3).join(' | '));
  stampa('verdi ' + (esiti.length - rossi.length) + ' · rossi ' + rossi.length + ' · su ' + esiti.length);
  if (rossi.length) stampa('CANCELLO ROSSO: ' + rossi.length + ' controlli falliti.');
  else stampa('CANCELLO VERDE: ' + esiti.length + ' controlli su ' + esiti.length + '.');
  process.exit(rossi.length ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(2); });
