/* =====================================================================
   _q-schermi.js — LO STESSO NASTRO, SEI SCHERMI, UN VERDETTO SOLO
   (voce #144, compito 1). Nasce ROSSO sul difetto vero.

   CHE COSA MISURA. Oggi un comando del nastro e' un PIXEL: le righe di
   tipo 0 e 1 portano `Touch5.start(id,x,y)` e `Touch5.move(id,x,y)` in
   coordinate di schermo. Dove finisce quel pixel lo decidono tre cose
   che non stanno nel nastro e che cambiano da telefono a telefono:

     · la FINESTRA        — touchBtnLayout parte da `bx = right ? VW : 0`
     · il POLLICE         — pollice(): scala 85-150%, spazio 100-140%, mancino
     · la TACCA           — insertiSicuri(): env(safe-area-inset-*)

   Del primo canale il gioco sa qualcosa: il #133 ha messo la misura
   della finestra nel nastro (riga 10) e il giudice SI ASTIENE
   (`schermo-diverso`). Degli altri due non sa NIENTE, e li' il giudice
   non si astiene: procede, rigioca un'altra partita e dice NON TORNA —
   l'unico verdetto che muove punti — a chi aveva soltanto il pollice
   grosso.

   IL BANCO E' A BRACCI, e cambia UNA cosa sola per braccio: la geometria
   dei comandi. Stesso nastro, stesso seme, stesse due rose, stesso
   motore JavaScript (una sola istanza di Chromium, sei contesti).

     800x360    la finestra piu' stretta del #133
     844x390    una finestra di telefono
     915x412    LA MISURA DI REGISTRAZIONE — il braccio di controllo
     1280x720   la finestra piu' larga
     POLLICE    915x412, ma scala 150% / spazio 140% / MANCINO
     TACCA      915x412, ma env(safe-area-inset) a 44/59/21/59 px

   DUE MISURE PER BRACCIO, E LA SECONDA E' QUELLA CHE CONTA.
     1. IL VERDETTO del giudice sul nastro vero. Da solo non basta:
        un'astensione e' un verdetto, e un banco che misurasse solo
        l'astensione attesterebbe la cura invece di misurarla (la
        lezione del #141, e quella del #142 che ha prodotto conMotore).
     2. IL PUNTEGGIO RIGIOCATO con l'astensione AGGIRATA: la riga 10 del
        nastro riscritta alla misura locale (`_nastri-bugiardi.conSchermo`,
        il gemello di conMotore). Il giudice crede che lo schermo
        coincida, procede, e il punteggio che ne esce e' quello che
        sarebbe uscito senza astensione. E' la misura del CANALE, non
        della guardia.

   LE PROVE
     A) IL CONTROLLO DI ESERCIZIO — se queste sono rosse, tutto il resto
        non sta misurando niente
       A1) il nastro esiste, la partita e' finita e porta comandi;
       A2) il braccio di controllo (la misura di registrazione) dice
           TORNA: se no non c'e' niente da confrontare;
       A3) i sei bracci hanno davvero geometrie dei comandi DISTINTE
           (almeno cinque distinte su sei);
       A4) il braccio POLLICE ha davvero il pollice diverso (raggio e
           lato);
       A5) e il braccio TACCA vede gli inserti E li paga: i dischi si
           spostano di almeno mezza presa, se no quel braccio sarebbe
           verde anche prima della cura, cioe' attesterebbe.
     B) IL VERDETTO E' LO STESSO SU TUTTI E SEI
       B1..B6) ogni braccio da' il verdetto del braccio di controllo.
     C) IL PUNTEGGIO RIGIOCATO E' LO STESSO SU TUTTI E SEI
       C1..C6) con l'astensione aggirata, ogni braccio rigioca lo stesso
           punteggio del braccio di controllo.
     D) NESSUN INNOCENTE ACCUSATO
       D1) nessun braccio dice NON TORNA sul nastro vero;
       D2) nessun braccio dice NON TORNA con l'astensione aggirata. E'
           la prova che nomina i due canali gemelli: sul pollice e sulla
           tacca lo schermo e' IDENTICO, quindi non c'e' nessuna
           astensione da aggirare e il giudice accusa gia' oggi.
     E) LA FORMA DEL COMANDO
       E1) il nastro non porta nessun PIXEL (nessuna riga di tipo 0 o 1);
       E2) ogni atto porta la SQUADRA (il campo t, 0 o 1);
       E3) la riga 10 resta scritta: la misura della finestra non decide
           piu' niente, ma un referto deve poter dire su che telefono si
           e' giocato.
     G) DOVE CADE IL DITO, dopo. Una volta che l'atto porta l'esito e il
        disco, il punto ricostruito non decide quasi piu' niente — e per
        questo un gioco che registrasse l'atto e poi rigiocasse dal PIXEL
        darebbe gli stessi verdetti e gli stessi punteggi (MISURATO: 21
        prove su 24, come la cura onesta). Ma il punto ASSOLUTO viene
        letto — la riadozione della levetta dopo una pausa chiede
        «questo dito e' su un pulsante?» proprio sulla posizione — e un
        dito a cento pixel dal disco che l'atto nomina va visto subito.
       G1..G6) dopo il giudizio, ogni posa di disco cade nella PRESA del
           disco che l'atto nomina, e le pose d'erba cadono rispetto ai
           dischi esattamente come sul braccio di controllo.
        SULL'ERBA NON SI PUO' CHIEDERE DI PIU', e il perche' e' una
        misura: un atto d'erba non dice «il dito era fuori dagli anelli»,
        dice «la risoluzione dei dischi non si e' applicata» — perche' la
        squadra e' della macchina, o perche' la scena non e' di gioco. In
        quel caso il dito puo' benissimo essere posato sopra un disco.
        MISURATO su questo nastro: 112 atti d'erba su 197 cadono dentro
        un anello, e cadono dentro **su tutti e sei i bracci, nello
        stesso numero**. Non e' un difetto di schermo: e' quel che l'atto
        significa. Percio' la prova confronta il NUMERO con quello del
        controllo, che e' la domanda giusta — su una geometria diversa
        quel numero cambierebbe.
     F) LA SQUADRA NON SI DEDUCE DALLA x — e questa e' l'unica prova che
        gira in MODALITA' 2, dove `teamOf` fa davvero qualcosa.
        Un tocco a x = 500 su una finestra da 1280 e' della squadra 0
        (500 < 640); lo stesso nastro riletto su una finestra da 800 lo
        assegna alla squadra 1 (500 > 400). Si registra a 1280, si
        rilegge a 800, e si guarda QUALE levetta si e' mossa.
       F1) la levetta che si muove e' la stessa;
       F2) e l'altra resta ferma.

   QUEL CHE NON MISURA, dichiarato invece che taciuto:
     · il duello dal dischetto. Il tipo 6 porta gia' u,v in millesimi
       (`duelMira` arrotonda PRIMA di scrivere) e `Reg.eseguiDuello`
       rigioca senza toccare un pixel: e' gia' un atto risolto e questo
       banco non ha niente da dirgli;
     · il ritardo d'ingresso del #141: la coda sta PIU' FUORI del
       registro e questo cantiere non la tocca (`_q-ritardo` fa la
       guardia);
     · la riadozione della levetta dopo una pausa chiede «questo dito e'
       su un pulsante?» sulla posizione CORRENTE, cioe' dopo il
       trascinamento: il punto di POSA e' invariante per costruzione, il
       punto dopo un trascinamento no. Il residuo e' dichiarato nella
       spec §7 e vale la differenza fra i raggi;
     · due motori JavaScript diversi: e' il #141/#142, e qui c'e' una
       sola istanza di Chromium apposta — cosi' l'unica cosa che cambia
       fra i bracci e' la geometria.

   uso:  node strumenti/_q-schermi.js
         node strumenti/_q-schermi.js --gioco fuori/falso.html
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se il gioco indicato non ha la schermata della sfida o se la sfida
   non arriva al fischio finale (prova non fatta).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');

/* LA MISURA DI REGISTRAZIONE: quella di taratura del gioco. Il braccio
   che la usa e' il CONTROLLO — senza un braccio che oggi e' gia' verde
   non si saprebbe se un rosso viene dallo schermo o dal nastro. */
const CASA = [915, 412];

/* IL POLLICE DEL BRACCIO GEMELLO: i tre estremi insieme. La scala e lo
   spazio ai loro tetti (150 e 140) e il mancino acceso, cioe' i dischi
   che passano dall'altra parte dello schermo. E' il caso peggiore, che
   e' l'unico che vale costruire. */
const POLLICE = { scala: 150, spazio: 140, mancino: true };

/* LA TACCA DEL BRACCIO GEMELLO: 44 in alto, 59 sui due lati, 21 in
   basso — gli inserti che un telefono con la tacca dichiara davvero in
   orizzontale, e sono il caso peggiore fra quelli reali. MISURATO che
   mordono: i cinque dischi si spostano di 35 px verso il campo
   (841 -> 806 il grande), cioe' piu' di meta' della presa (r+10 = 50).
   Con 34 px su tutti i lati lo spostamento era 10 px e il braccio
   restava verde anche prima della cura, cioe' non misurava niente.
   Si impone con un foglio di stile !important sulla SONDA di
   insertiSicuri (il div invisibile il cui padding E' l'inserto): env()
   non si scrive da JavaScript, e fingere l'inserto altrove vorrebbe
   dire misurare la finta invece della funzione. */
const TACCA = { t: 44, r: 59, b: 21, l: 59 };

const BRACCI = [
  { nome: '800x360',  misura: [800, 360] },
  { nome: '844x390',  misura: [844, 390] },
  { nome: '915x412',  misura: CASA, controllo: true },
  { nome: '1280x720', misura: [1280, 720] },
  { nome: 'POLLICE',  misura: CASA, pollice: POLLICE },
  { nome: 'TACCA',    misura: CASA, tacca: TACCA },
];

/* =====================================================================
   IL DITO SUL BORDO DELLA PRESA — e senza di lui il braccio TACCA non
   misura niente.

   MISURATO: col solo copione di casa (che preme i dischi al CENTRO) una
   tacca da 59 px sposta i cinque dischi di 35 px e la partita rigiocata
   resta identica — 0-2 prima e 0-2 dopo. E' giusto che sia cosi': 35 px
   di spostamento su una presa di 50 px lasciano il centro dentro la
   presa, e il dito trova lo stesso disco. Il canale c'e', ma su quel
   copione non morde, e un braccio che non morde e' un braccio che
   ATTESTA.

   Il caso peggiore e' il dito che si posa sul BORDO della presa: a 45 px
   dal centro (u = 45/50 = 0,9) il disco e' preso; spostato di 35 px
   diventano 80 px (u = 1,6) e il dito non prende piu' niente — anzi
   nemmeno muore nell'anello, diventa un candidato levetta. Lo stesso
   pixel, tre esiti diversi a seconda della tacca.

   SI ANNULLA invece di rilasciare (`chiudi(j, true)`, cioe' touchcancel)
   perche' un rilascio calcerebbe: quel che deve restare e' la CARICA
   aperta per nove fotogrammi — l'uomo comandato al 45% della velocita',
   che e' una divergenza vera e misurabile — non una raffica di tiri che
   cambierebbe la partita in qualcosa che non somiglia piu' a niente. */
const BORDO_PX = 45;
const BORDO_OGNI = 53;
const BORDO_TENUTA = 9;
const BORDO_DA = 60;
const BORDO_A = 5400;
function azioniBordo() {
  const a = [];
  for (let f = BORDO_DA; f < BORDO_A; f += BORDO_OGNI) {
    a.push({ f: f, js: '(function(){ const d = window.__test.pulsanti(0)[0]; ' +
                       'Touch5.start(7700 + ' + f + ', Math.round(d.x + ' + BORDO_PX + '), Math.round(d.y)); return "giu"; })()' });
    a.push({ f: f + BORDO_TENUTA, js: '(function(){ Touch5.chiudi(7700 + ' + f + ', true); return "su"; })()' });
  }
  return a;
}

/* LA PROVA F, a parte: due finestre e nessun server. */
const F_LARGA = [1280, 720];
const F_STRETTA = [800, 360];
const F_X = 500;          /* 500 < 1280/2 e 500 > 800/2: la x che cambia squadra */
const F_PASSI = 240;
const F_SEME = 20260923;

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
const titolo = t => console.log('\n' + t);

const v = g => (g && g.verdetto) || (g && g.eccezione ? 'ECCEZIONE' : '?');
const vc = g => v(g) + (g && g.causa ? '/' + g.causa : '');
const gol = g => (g && Array.isArray(g.gol)) ? (g.gol[0] + '-' + g.gol[1]) : 'niente';

/* =====================================================================
   DOVE CADE IL DITO, DOPO — e senza questa misura il banco promuove due
   falsi su cinque.

   MISURATO il 23 settembre 2026, e la scoperta vale piu' della prova:
   una volta che l'atto porta l'ESITO e il DISCO, il punto ricostruito
   non decide quasi piu' niente. Il disco preso sta nell'atto, l'anello
   sta nell'atto, e tutto quel che viene dopo (la levetta, l'anello del
   trascinamento, l'armamento, l'annullo) si misura in SCOSTAMENTI dal
   punto di posa, che si cancellano. Percio' un gioco che registrasse
   l'atto e poi rigiocasse dal PIXEL del registratore — il falso
   _crit-schermi-pixel — darebbe gli stessi verdetti e gli stessi
   punteggi, e il banco lo promuoverebbe: 21 prove su 24, identiche a
   quelle della cura onesta.

   E' un difetto del banco, non una scusa. Il punto di posa ASSOLUTO
   esiste e viene letto: la riadozione della levetta dopo una pausa
   chiede «questo dito e' su un pulsante?» proprio sulla posizione, e
   domani il filo del 1v1 ne leggera' altre. Un dito che nel frame di chi
   rilegge cade a cento pixel dal disco che l'atto nomina e' un dito che
   non e' dove dice di essere, e va visto SUBITO — non il giorno in cui
   qualcuno aggiunge la riga che lo legge.

   Quindi si guarda dove il riproduttore ha davvero posato le dita:
   `Reg.origine` dopo un giudizio, contro la geometria LOCALE. Un atto
   che nomina un disco deve cadere nella PRESA di quel disco (r+10); un
   atto d'erba deve cadere FUORI da ogni anello d'esclusione (r+18).
   ===================================================================== */
const DOVE = `(function(){
  let dentro = 0, fuori = 0, erbaOk = 0, erbaNo = 0, senza = 0, peggio = 0;
  try{
    for(const r of Reg.righe){
      if(r[1] !== 12) continue;
      const o = Reg.origine[r[3]];
      if(!o){ senza++; continue; }
      const dischi = touchBtnLayout(r[4]|0);
      if((r[5]|0) === 0){
        const b = dischi[r[6]|0];
        if(!b){ fuori++; continue; }
        const d = len(o[0]-b.x, o[1]-b.y);
        if(d <= b.r + 10) dentro++; else { fuori++; if(d > peggio) peggio = d; }
      } else if((r[5]|0) === 1){
        let su = false;
        for(const b of dischi) if(len(o[0]-b.x, o[1]-b.y) <= b.r + 18) su = true;
        if(su) erbaNo++; else erbaOk++;
      }
    }
  }catch(e){ return { errore: String(e && e.message || e) }; }
  return { dentro:dentro, fuori:fuori, erbaOk:erbaOk, erbaNo:erbaNo,
           senza:senza, peggio:Math.round(peggio) };
})`;

const dove = P => P.pag.evaluate(c => (new Function('return ' + c))()(), DOVE);

const giudizio = (P, nastro, atteso, opz) => P.pag.evaluate(([n, a, o]) => {
  const t = window.__test;
  if (typeof t.giudica !== 'function') return { manca: true };
  try {
    const r = t.giudica(n, a, o);
    return Object.assign({ manca: false }, r && typeof r === 'object' ? r : { verdetto: String(r) });
  } catch (e) { return { manca: false, eccezione: e.message }; }
}, [nastro, atteso, opz]);

/* =====================================================================
   LA PAGINA DI UN BRACCIO. Si apre alla sua misura, le si mette addosso
   il pollice o la tacca del braccio, e POI si legge la geometria dei
   comandi che ne esce: e' quella la variabile indipendente del banco, e
   va misurata invece che assunta.
   ===================================================================== */
async function braccio(browser, sg, b) {
  const P = await B.apri(browser, sg.porta, { width: b.misura[0], height: b.misura[1] });
  await P.pag.evaluate(() => { window.__test.save.teamName = 'GIUDICE'; });
  if (b.pollice) {
    await P.pag.evaluate(p => { window.__test.save.pollice = p; }, b.pollice);
  }
  if (b.tacca) {
    await P.pag.evaluate(t => {
      /* la sonda di insertiSicuri nasce alla prima chiamata: si chiama
         una volta per farla nascere, poi le si mette sopra il foglio */
      try { insertiSicuri(); } catch (e) {}
      const s = document.createElement('style');
      s.textContent = 'div[style*="safe-area-inset-top"]{padding:' +
        t.t + 'px ' + t.r + 'px ' + t.b + 'px ' + t.l + 'px !important}';
      document.head.appendChild(s);
      /* e la cache di un secondo si svuota a mano: se no il braccio
         misurerebbe la lettura di prima */
      try { _insMis = ''; _insQuando = 0; } catch (e) {}
    }, b.tacca);
  }
  const geo = await P.pag.evaluate(() => {
    let ins = null;
    try { ins = insertiSicuri(); } catch (e) {}
    return {
      misura: [innerWidth | 0, innerHeight | 0],
      quadro: [VW | 0, VH | 0],
      dischi: window.__test.pulsanti(0).map(d => [Math.round(d.x), Math.round(d.y), Math.round(d.r)]),
      pollice: (typeof pollice === 'function') ? pollice() : null,
      inserti: ins,
      giudice: typeof window.__test.giudica === 'function',
    };
  });
  return { conf: b, pag: P, geo };
}

/* =====================================================================
   LA PROVA F — LA SQUADRA, IN MODALITA' 2. Nessun server, nessuna
   sfida: due finestre, lo stesso seme, e un dito solo.

   L'ORDINE E' QUELLO SACRO DELLA CASA: startMatch PRIMA, tutto il resto
   DOPO. Reg.accendi() azzera i comandi, quindi deve venire dopo che la
   partita e' cominciata, o azzererebbe uno stato che startMatch rimette.
   ===================================================================== */
const F_REGISTRA = `(function(x, passi, seme){
  const t = window.__test;
  t.semina(seme);
  t.startMatch(2, 1, { size:5 });
  t.registra();
  /* un dito solo, che si posa in alto (i dischi stanno tutti in basso,
     y = VH-60 e sopra) e poi trascina: la posa lo rende candidato, il
     trascinamento gli da' la levetta */
  Touch5.start(31, x, 40);
  for(let f = 0; f < passi; f++){
    Touch5.move(31, x + 30 + (f % 7), 40 + 24);
    t.simulate(1/60);
  }
  return { nastro: t.nastro(), misura:[innerWidth|0, innerHeight|0],
           stick:[ {a:Touch5.stick[0].active, dx:Math.round(Touch5.stick[0].dx), dy:Math.round(Touch5.stick[0].dy)},
                   {a:Touch5.stick[1].active, dx:Math.round(Touch5.stick[1].dx), dy:Math.round(Touch5.stick[1].dy)} ] };
})`;

const F_RILEGGE = `(function(nastro, passi, seme){
  const t = window.__test;
  t.semina(seme);
  t.startMatch(2, 1, { size:5 });
  const n = t.rigioca(nastro);
  for(let f = 0; f < passi; f++) t.simulate(1/60);
  return { righe:n, misura:[innerWidth|0, innerHeight|0],
           stick:[ {a:Touch5.stick[0].active, dx:Math.round(Touch5.stick[0].dx), dy:Math.round(Touch5.stick[0].dy)},
                   {a:Touch5.stick[1].active, dx:Math.round(Touch5.stick[1].dx), dy:Math.round(Touch5.stick[1].dy)} ] };
})`;

async function provaSquadra(browser, sg) {
  const A = await B.apri(browser, sg.porta, { width: F_LARGA[0], height: F_LARGA[1] });
  const r1 = await A.pag.evaluate(([c, x, p, s]) => (new Function('return ' + c))()(x, p, s),
                                  [F_REGISTRA, F_X, F_PASSI, F_SEME]);
  await A.ctx.close();
  const C = await B.apri(browser, sg.porta, { width: F_STRETTA[0], height: F_STRETTA[1] });
  const r2 = await C.pag.evaluate(([c, n, p, s]) => (new Function('return ' + c))()(n, p, s),
                                  [F_RILEGGE, r1.nastro, F_PASSI, F_SEME]);
  await C.ctx.close();
  return { largo: r1, stretto: r2 };
}

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  let browser;
  try {
    browser = await chromium.launch();
    console.log('=== LO STESSO NASTRO, SEI SCHERMI — il comando e\' un atto, non un pixel (voce #144) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', taglia 5, registrato a ' +
                CASA.join('x') + '\n');

    /* ---------------------------------------------- il nastro onesto */
    const Bt = await B.apri(browser, sg.porta, { width: CASA[0], height: CASA[1] });
    const c0 = await Bt.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida'),
                                              giudice: typeof window.__test.giudica === 'function' }));
    if (!c0.schermata || !c0.giudice) {
      console.error('PROVA NULLA: questo gioco non ha la schermata della sfida o window.__test.giudica.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    /* il difensore, una volta sola: senza una seconda squadra pubblicata
       il server finto non ha un difensore e non archivia la riga */
    await B.collega(Bt, ss.porta, 'BORGATA');
    await B.entra(Bt); await B.pubblica(Bt);

    ss.stato.semeProssimo = 0;
    const At = await B.apri(browser, sg.porta, { width: CASA[0], height: CASA[1] });
    await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(At); await B.pubblica(At);
    const reg = await B.giocaUna(At, ss, azioniBordo(), 24000, 0);
    await At.ctx.close();
    if (!reg.partita || !reg.riga) {
      console.error('PROVA NULLA: la sfida non e\' arrivata al fischio finale.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    const crudo = N.allarga(reg.riga.replay);
    const tipi = N.tipiDi(crudo);
    const atti = N.attiDi(crudo);
    const atteso = [reg.riga.gol_a | 0, reg.riga.gol_d | 0];
    const opz = { seme: reg.riga.seme, taglia: reg.riga.taglia | 0 };
    console.log('  nastro: ' + reg.fine.passi + ' passi, tabellone ' + atteso.join('-') +
                ', ' + crudo.length + ' caratteri, misure nel nastro ' +
                N.schermiDi(crudo).map(s => s.join('x')).join(' -> '));
    console.log('  tipi di riga: ' + Object.keys(tipi).sort((a, b) => a - b)
                .map(k => k + 'x' + tipi[k]).join(' ') +
                ', dita sul bordo della presa: ' + reg.fine.fatte.length);

    /* ---------------------------------------------------- i sei bracci */
    const br = [];
    for (const b of BRACCI) br.push(await braccio(browser, sg, b));
    const ctrl = br.find(x => x.conf.controllo);

    for (const x of br) {
      x.verdetto = await giudizio(x.pag, crudo, atteso, opz);
      x.aggirato = await giudizio(x.pag, N.conSchermo(crudo, x.geo.misura), atteso, opz);
      /* SUBITO DOPO il giudizio aggirato, che e' l'unico che rigioca su
         tutti i bracci: Reg.origine tiene i punti che quel replay ha
         davvero usato, e Reg.righe il nastro che li ha chiesti */
      x.dove = await dove(x.pag);
    }

    console.log('');
    for (const x of br) {
      console.log('  braccio ' + x.conf.nome.padEnd(9) +
                  ' dischi ' + x.geo.dischi.map(d => d.join('/')).join(' ') +
                  (x.geo.inserti ? '  inserti ' + [x.geo.inserti.t, x.geo.inserti.r, x.geo.inserti.b, x.geo.inserti.l].join('/') : ''));
      console.log('      verdetto ' + vc(x.verdetto).padEnd(28) +
                  ' | aggirando l\'astensione: ' + vc(x.aggirato).padEnd(28) +
                  ' rigiocato ' + gol(x.aggirato));
    }

    /* ------------------------------------------------------ la prova F */
    let F = null;
    try { F = await provaSquadra(browser, sg); }
    catch (e) { console.log('\n  prova F esplosa: ' + e.message); }
    if (F) {
      console.log('\n  prova F  registrato a ' + F.largo.misura.join('x') +
                  ' -> levette ' + F.largo.stick.map(s => (s.a ? 'VIVA ' + s.dx + ',' + s.dy : 'ferma')).join(' | '));
      console.log('           riletto   a ' + F.stretto.misura.join('x') +
                  ' -> levette ' + F.stretto.stick.map(s => (s.a ? 'VIVA ' + s.dx + ',' + s.dy : 'ferma')).join(' | ') +
                  '  (' + F.stretto.righe + ' righe)');
    }

    /* =================================================================
       A) IL CONTROLLO DI ESERCIZIO
       ================================================================= */
    titolo('A) IL CONTROLLO DI ESERCIZIO — se queste sono rosse il resto non misura niente');
    di(reg.fine.scena === 'end' && reg.fine.righe > 100, 'A1 il nastro esiste, la partita e\' finita e porta comandi',
       reg.fine.scena + ', ' + reg.fine.righe + ' righe');
    di(v(ctrl.verdetto) === 'TORNA', 'A2 il braccio di controllo (' + ctrl.conf.nome + ') dice TORNA', vc(ctrl.verdetto));
    const geoChiavi = br.map(x => JSON.stringify(x.geo.dischi));
    const distinte = new Set(geoChiavi).size;
    di(distinte >= 5, 'A3 i sei bracci hanno geometrie dei comandi distinte', distinte + ' distinte su 6');
    const bp = br.find(x => x.conf.nome === 'POLLICE'), bt = br.find(x => x.conf.nome === 'TACCA');
    const rC = ctrl.geo.dischi[0] ? ctrl.geo.dischi[0][2] : 0;
    const rP = bp.geo.dischi[0] ? bp.geo.dischi[0][2] : 0;
    const latoDiverso = !!(bp.geo.dischi[0] && ctrl.geo.dischi[0] &&
                          (bp.geo.dischi[0][0] < ctrl.geo.misura[0] / 2) !== (ctrl.geo.dischi[0][0] < ctrl.geo.misura[0] / 2));
    const taccaVista = !!(bt.geo.inserti && (bt.geo.inserti.t > 0 || bt.geo.inserti.l > 0 || bt.geo.inserti.r > 0));
    di(rP > rC && latoDiverso, 'A4 il braccio POLLICE ha davvero il pollice diverso',
       'raggio ' + rC + ' -> ' + rP + ', lato ' + (latoDiverso ? 'specchiato' : 'UGUALE'));
    /* LA TACCA DEVE MORDERE, non solo esistere: con 34 px su tutti i
       lati i dischi si spostavano di 10 px e questo braccio era verde
       anche PRIMA della cura, cioe' attestava. La soglia e' meta' della
       presa del disco grande (r+10 = 50), perche' sotto meta' presa un
       dito al centro resta al centro e il banco non separa niente. */
    const sposta = (bt.geo.dischi[0] && ctrl.geo.dischi[0]) ? Math.abs(bt.geo.dischi[0][0] - ctrl.geo.dischi[0][0]) : 0;
    di(taccaVista && sposta >= 25, 'A5 la tacca si vede E sposta i dischi',
       'inserti ' + (taccaVista ? 'visti' : 'NON VISTI') + ', spostamento ' + sposta + ' px');

    /* =================================================================
       B) IL VERDETTO E' LO STESSO SU TUTTI E SEI
       ================================================================= */
    titolo('B) IL VERDETTO E\' LO STESSO SU TUTTI E SEI');
    const vCtrl = vc(ctrl.verdetto);
    br.forEach((x, i) => di(vc(x.verdetto) === vCtrl, 'B' + (i + 1) + ' ' + x.conf.nome.padEnd(9) + ' da' + '̀' + ' ' + vCtrl,
                            vc(x.verdetto)));

    /* =================================================================
       C) IL PUNTEGGIO RIGIOCATO E' LO STESSO SU TUTTI E SEI
       ================================================================= */
    titolo('C) IL PUNTEGGIO RIGIOCATO E\' LO STESSO SU TUTTI E SEI (astensione aggirata)');
    const gCtrl = gol(ctrl.aggirato);
    br.forEach((x, i) => di(gol(x.aggirato) === gCtrl && gCtrl !== 'niente',
                            'C' + (i + 1) + ' ' + x.conf.nome.padEnd(9) + ' rigioca ' + gCtrl, gol(x.aggirato)));

    /* =================================================================
       D) NESSUN INNOCENTE ACCUSATO
       ================================================================= */
    titolo('D) NESSUN INNOCENTE ACCUSATO');
    const acc1 = br.filter(x => v(x.verdetto) === 'NON TORNA').map(x => x.conf.nome);
    di(acc1.length === 0, 'D1 nessun braccio dice NON TORNA sul nastro vero', acc1.join(' ') || 'nessuno');
    const acc2 = br.filter(x => v(x.aggirato) === 'NON TORNA').map(x => x.conf.nome);
    di(acc2.length === 0, 'D2 nessun braccio dice NON TORNA con l\'astensione aggirata', acc2.join(' ') || 'nessuno');

    /* =================================================================
       E) LA FORMA DEL COMANDO
       ================================================================= */
    titolo('E) LA FORMA DEL COMANDO');
    const pixel = (tipi['0'] | 0) + (tipi['1'] | 0);
    di(pixel === 0, 'E1 il nastro non porta nessun PIXEL (tipi 0 e 1)', pixel + ' righe di pixel');
    di(atti.length > 0 && atti.every(a => a.t === 0 || a.t === 1),
       'E2 ogni atto porta la squadra', atti.length + ' atti');
    di(N.schermiDi(crudo).length > 0, 'E3 la riga 10 resta scritta (non decide piu\', ma si legge)',
       N.schermiDi(crudo).map(s => s.join('x')).join(' '));

    /* =================================================================
       G) DOVE CADONO LE DITA, NEL FRAME DI CHI RILEGGE
       ================================================================= */
    titolo("G) IL PUNTO DI POSA CADE DOVE L'ATTO DICE");
    const dC = ctrl.dove || {};
    br.forEach((x, i) => {
      const d = x.dove || {};
      const disco = !d.errore && (d.dentro | 0) > 0 && (d.fuori | 0) === 0;
      const erba = (d.erbaOk | 0) === (dC.erbaOk | 0) && (d.erbaNo | 0) === (dC.erbaNo | 0);
      di(disco && erba, 'G' + (i + 1) + ' ' + x.conf.nome.padEnd(9) + " ogni posa di disco e' sul suo disco, e l'erba cade come sul controllo",
         d.errore ? d.errore : (d.dentro | 0) + ' sul disco, ' + (d.fuori | 0) + ' fuori' +
         ((d.fuori | 0) ? ' (il peggiore a ' + d.peggio + ' px)' : '') +
         ', erba ' + (d.erbaOk | 0) + '/' + (d.erbaNo | 0) + ' contro ' + (dC.erbaOk | 0) + '/' + (dC.erbaNo | 0) + ' del controllo');
    });

    /* =================================================================
       F) LA SQUADRA NON SI DEDUCE DALLA x
       ================================================================= */
    titolo('F) LA SQUADRA NON SI DEDUCE DALLA x (modalita\' 2)');
    if (!F) { di(false, 'F1 la prova non e\' girata'); di(false, 'F2 la prova non e\' girata'); }
    else {
      const viva = s => s.findIndex(x => x.a);
      const vL = viva(F.largo.stick), vS = viva(F.stretto.stick);
      di(vL >= 0 && vL === vS, 'F1 la levetta che si muove e\' la stessa',
         'registrata ' + (vL < 0 ? 'nessuna' : vL) + ', riletta ' + (vS < 0 ? 'nessuna' : vS));
      const altraFerma = vL >= 0 && !F.stretto.stick[1 - vL].a;
      di(altraFerma, 'F2 e l\'altra resta ferma',
         F.stretto.stick.map((s, i) => i + (s.a ? ':viva' : ':ferma')).join(' '));
    }

    await browser.close(); sg.chiudi(); ss.chiudi();
    const male = esiti.filter(x => !x).length;
    console.log('\n' + (male ? 'ROSSO' : 'VERDE') + ': ' + (esiti.length - male) + '/' + esiti.length + ' prove');
    process.exit(male ? 1 : 0);
  } catch (e) {
    console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
    try { if (browser) await browser.close(); } catch (x) {}
    try { sg.chiudi(); ss.chiudi(); } catch (x) {}
    process.exit(2);
  }
})();
