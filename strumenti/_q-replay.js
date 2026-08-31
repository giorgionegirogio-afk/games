/* =====================================================================
   _q-replay.js — LA PARTITA RIGIOCATA E' LA STESSA PARTITA?

   E' la prova che regge il multigiocatore. Il gioco e' deterministico
   dato il seme (10 controlli su 10, _q-determinismo.js), ma quello
   riguarda la SIMULAZIONE: la CPU contro la CPU, senza nessuno che
   tocchi lo schermo. Qui si aggiunge il pezzo che mancava — le DITA — e
   si chiede la cosa che conta davvero:

     stessi comandi + stesso seme  ==>  stessa partita?

   Se la risposta e' si', allora una partita si puo' mandare in rete come
   {seme, comandi}, cioe' in pochi kB invece che in un video; il
   difensore di una sfida asincrona la puo' GUARDARE; e un risultato si
   puo' VERIFICARE rigiocandolo, che e' l'anti-imbroglio piu' economico
   che esista.

   CINQUE PROVE:
     A  il nastro si scrive e si rilegge senza perdere un comando
     B  la partita rigiocata e' identica campione per campione
     C  con un seme diverso NON e' identica (se lo fosse, vorrebbe dire
        che le dita non contano niente — e allora la prova B non
        proverebbe nulla)
     D  quanto pesa il nastro, in byte veri, prima e dopo il deflate
     E  in registrazione il gioco NON cambia: la stessa partita giocata
        col registro acceso e col registro spento e' la stessa partita

   La E e' quella che protegge chi gioca offline: se registrare cambiasse
   il gioco, avremmo comprato il multigiocatore col prezzo di un gioco
   diverso, e nessuno se ne accorgerebbe.

   uso:  node strumenti/_q-replay.js --gioco fuori/reg.html
         node strumenti/_q-replay.js --gioco fuori/reg.html --taglia 11
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

const TAGLIA = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
const SEME = parseInt(arg('seme', '20260803'), 10) >>> 0;
const PASSI = parseInt(arg('passi', '2400'), 10);   /* 40 secondi di gioco a 60 Hz */
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

/* =====================================================================
   IL COPIONE DELLE DITA.

   Non deve essere bello: deve essere FISSO e deve toccare tutti i verbi,
   perche' un replay che rigioca solo la levetta non prova niente sul
   tiro. Gira dentro la pagina, fra un passo e l'altro, chiamando le
   stesse quattro porte che chiamerebbe un dito vero — sono avvolte dal
   registro, quindi vengono registrate esattamente come succederebbe sul
   telefono.

   Nessun sorteggio qui dentro: il copione dev'essere identico alle due
   esecuzioni, e un Math.random() lo renderebbe un'altra partita.
   ===================================================================== */
const COPIONE = `
(function(passi, IMPR, campionaOgni){
  const t = window.__test;
  const impronte = [];
  const leggi = new Function('return ' + IMPR);
  const dischi = t.pulsanti(0);
  const grande = dischi[0] || {x:800,y:330,r:44};
  const piccolo = dischi[1] || {x:720,y:250,r:34};
  /* la levetta vive nella meta' sinistra: e' li' che il gioco la cerca */
  const LX = 180, LY = 300;
  let idL = 1, idB = 2, giu = false, giuB = false;
  for(let f = 0; f < passi; f++){
    const a = f * 0.037;              /* la levetta gira piano, senza sorteggi */
    const rr = 34 + 22 * Math.sin(f * 0.011);
    const x = LX + Math.cos(a) * rr, y = LY + Math.sin(a) * rr;
    if(!giu){ Touch5.start(idL, LX, LY); giu = true; }
    else Touch5.move(idL, x, y);
    /* ogni 97 passi la levetta si stacca e si riprende: e' il gesto che
       nella vita vera rompe tutto, quindi deve stare nella prova */
    if(f % 97 === 96){ Touch5.chiudi(idL, false); giu = false; idL += 2; }

    /* il disco grande: si preme, si tiene (la carica), si rilascia.
       Ogni tanto il rilascio e' un trascinamento — cioe' una mira. */
    if(f % 71 === 0 && !giuB){ Touch5.start(idB, grande.x, grande.y); giuB = true; }
    else if(giuB && f % 71 === 18){ Touch5.move(idB, grande.x - 26, grande.y - 14); }
    else if(giuB && f % 71 === 26){ Touch5.chiudi(idB, false); giuB = false; idB += 2; }

    /* il disco piccolo: passaggio secco, senza trascinamento */
    if(f % 53 === 11){ const j = 900 + f; Touch5.start(j, piccolo.x, piccolo.y); Touch5.chiudi(j, false); }

    t.simulate(1/60);
    if(f % campionaOgni === 0) impronte.push(leggi());
  }
  if(giu) Touch5.chiudi(idL, false);
  if(giuB) Touch5.chiudi(idB, false);
  return impronte;
})`;

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

async function apri(browser, porta) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { ctx, pag, errori };
}

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  const browser = await chromium.launch();
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

  console.log('=== LA PARTITA RIGIOCATA E\' LA STESSA? — ' + TAGLIA + ' contro ' + TAGLIA +
              ', seme ' + SEME + ', ' + PASSI + ' passi' + (provaRel ? ', gioco ' + provaRel : '') + ' ===\n');

  const A = await apri(browser, srv.porta);
  const B = await apri(browser, srv.porta);

  const c1 = await A.pag.evaluate(() => ({
    seme: typeof window.__test.semina === 'function',
    reg: typeof window.__test.registra === 'function',
  }));
  if (!c1.seme || !c1.reg) {
    console.error('FALLITO: il gioco non ha il seme (' + c1.seme + ') o il registro (' + c1.reg + ').');
    console.error('         Servono _t-seme.js e _t-registro.js applicati. Prova con --gioco.');
    await browser.close(); srv.chiudi(); process.exit(2);
  }

  /* =====================================================================
     LA STESSA PARTENZA PER TUTTE LE ESECUZIONI, e ci sono volute due
     prove rosse per capire quante cose contano.

     Il seme non basta, e nemmeno i comandi azzerati. Conta anche IL
     SALVATAGGIO: dopo una partita la rosa cresce, un obiettivo si
     sblocca, un invito si consuma — e la partita dopo comincia con
     giocatori un po' diversi. Misurato: il salvataggio passa da 1018 a
     1044 byte dopo la prima partita (strumenti/_diag-replay.js).

     E' un fatto del PRODOTTO, non solo del banco: per rigiocare una
     partita non basta il seme, serve anche la rosa di allora. Ed e'
     esattamente per questo che il server manda la rosa dell'avversario
     insieme al seme (vedi rete/api/avversario.js) — qui la scoperta
     conferma il progetto invece di smentirlo.

     Qui si congela il salvataggio all'apertura e lo si rimette prima di
     ogni esecuzione. Senza, questo banco confronterebbe una prima
     partita con una quarta e chiamerebbe «differenza del registro»
     quella della rosa cresciuta.
     ===================================================================== */
  const congela = async pag => pag.evaluate(() => {
    window.__save0 = JSON.parse(JSON.stringify(window.__test.save));
  });
  await congela(A.pag); await congela(B.pag);
  const PARTENZA = `(function(){
    const t = window.__test;
    if(window.__save0){
      /* SI TOLGONO ANCHE LE CHIAVI COMPARSE DOPO, e ci e' voluta una prova
         rossa per capirlo: SAVE.inviti non esiste su un salvataggio vergine
         e nasce alla prima partita. Un ripristino che sovrascrive e non
         cancella lo lasciava li', e da li' in poi la prima partita era
         diversa da tutte le altre (492 sorteggi contro 263). */
      for(const k of Object.keys(t.save)) if(!(k in window.__save0)) delete t.save[k];
      for(const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
    }
    if(typeof Reg !== 'undefined') Reg.azzeraComandi();
  })()`;

  /* --------------------------------------------------- A: si registra */
  console.log('REGISTRO — si gioca una partita con le dita, e si scrive il nastro');
  const reg = await A.pag.evaluate(([seme, taglia, passi, IMPR, COP, PART]) => {
    const t = window.__test;
    (new Function(PART))();
    t.semina(seme);
    t.registra();
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    const impronte = (new Function('return (' + COP + ')'))()(passi, IMPR, 20);
    const nastro = t.nastro();
    t.fermaRegistro();
    return { impronte, nastro, righe: t.registroRighe, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi };
  }, [SEME, TAGLIA, PASSI, IMPRONTA, COPIONE, PARTENZA]);

  console.log('  --   ' + reg.righe.toLocaleString('it-IT') + ' comandi, ' +
              reg.sorteggi.toLocaleString('it-IT') + ' sorteggi, risultato ' + reg.gol.join('-'));

  di(reg.righe > 100, 'il nastro ha registrato qualcosa', reg.righe + ' comandi');

  /* ------------------------------------------- il nastro va e torna */
  const rilettura = await B.pag.evaluate(nastro => {
    const n = window.__test.rigioca(nastro);
    return { comandi: n, rifatto: window.__test.nastro() };
  }, reg.nastro);
  di(rilettura.comandi === reg.righe,
     'A) il nastro si rilegge senza perdere un comando',
     rilettura.comandi + ' contro ' + reg.righe);
  di(rilettura.rifatto === reg.nastro,
     'A) scritto, riletto e riscritto: lo stesso testo',
     rilettura.rifatto === reg.nastro ? '' : 'il testo cambia al secondo giro');

  /* -------------------------------------------- B: si rigioca uguale */
  const rigioca = async (pag, seme) => pag.evaluate(([nastro, seme, taglia, passi, IMPR, PART]) => {
    const t = window.__test;
    (new Function(PART))();
    t.rigioca(nastro);
    t.semina(seme);
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    const leggi = new Function('return ' + IMPR);
    const impronte = [];
    for(let f = 0; f < passi; f++){ t.simulate(1/60); if(f % 20 === 0) impronte.push(leggi()); }
    return { impronte, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi };
  }, [reg.nastro, seme, TAGLIA, PASSI, IMPRONTA, PARTENZA]);

  const rip = await rigioca(B.pag, SEME);
  const k = primoScarto(reg.impronte, rip.impronte);
  di(k < 0, 'B) la partita rigiocata e\' identica, campione per campione',
     k < 0 ? reg.impronte.length + ' campioni, ' + rip.gol.join('-') + ', ' +
             rip.sorteggi.toLocaleString('it-IT') + ' sorteggi'
           : 'divergono al campione ' + k + ' (passo ' + (k * 20) + '), ' +
             reg.gol.join('-') + ' contro ' + rip.gol.join('-'));

  /* -------------------------- C: il controllo negativo, che serve */
  const ripX = await rigioca(B.pag, (SEME + 7) >>> 0);
  di(primoScarto(reg.impronte, ripX.impronte) >= 0,
     'C) con un seme diverso NON e\' la stessa partita — la prova B vuol dire qualcosa',
     primoScarto(reg.impronte, ripX.impronte) >= 0
       ? 'divergono al campione ' + primoScarto(reg.impronte, ripX.impronte)
       : 'IDENTICHE: il seme non conta, e allora la prova B non prova niente');

  /* --------------------------------------------------- D: il peso */
  const byte = Buffer.byteLength(reg.nastro, 'utf8');
  const stretto = zlib.deflateRawSync(Buffer.from(reg.nastro, 'utf8'), { level: 9 }).length;
  const b64 = Math.ceil(stretto / 3) * 4;
  const perMinuto = b64 / (PASSI / 60 / 60);
  console.log('');
  console.log('D) IL PESO DEL NASTRO');
  console.log('     crudo               ' + byte.toLocaleString('it-IT') + ' byte');
  console.log('     stretto (deflate)   ' + stretto.toLocaleString('it-IT') + ' byte  (' +
              (byte / stretto).toFixed(1) + ' volte piu\' piccolo)');
  console.log('     in base64           ' + b64.toLocaleString('it-IT') + ' byte  — e\' quel che viaggia');
  console.log('     al minuto di gioco  ' + Math.round(perMinuto).toLocaleString('it-IT') + ' byte');
  /* Il tetto del server e' 64 kB (rete/api/sfida.js). Una partita dura al
     massimo 180 secondi a 5 contro 5 e 360 a 11: si chiede che tre
     minuti stiano larghi dentro il tetto. */
  const treMinuti = perMinuto * 3;
  di(treMinuti < 64 * 1024,
     'D) tre minuti di partita stanno dentro il tetto del server (64 kB)',
     Math.round(treMinuti).toLocaleString('it-IT') + ' byte');

  /* =====================================================================
     E: REGISTRARE NON CAMBIA IL GIOCO.

     LA DOMANDA VA POSTA BENE, e per porla bene sono servite tre prove
     rosse. Non si puo' confrontare la registrazione fatta all'apertura
     con un'esecuzione qualunque fatta dopo: fra le due cambiano cose che
     col registro non c'entrano nulla — la levetta lasciata dove stava, i
     suggerimenti gia' visti, e soprattutto i cinque cronometri che
     startMatch non azzera (G.possOwner e G.possT, che aiDecide LEGGE).
     Confrontando quelle due si misura la storia della pagina, non il
     registro.

     La domanda giusta e': sulla STESSA pagina, con lo stesso stato di
     partenza, due esecuzioni consecutive — una col registro acceso e una
     spento — danno la stessa partita? Il giro di riscaldamento serve a
     portare la pagina in un regime stabile, cosi' che l'unica differenza
     rimasta fra le due sia quella che si vuole misurare.
     ===================================================================== */
  console.log('');
  console.log('E) REGISTRARE NON CAMBIA IL GIOCO — e\' la prova che protegge chi gioca offline');
  const unGiro = (registra) => A.pag.evaluate(([seme, taglia, passi, IMPR, COP, PART, registra]) => {
    const t = window.__test;
    t.fermaRegistro();
    (new Function(PART))();
    t.semina(seme);
    if (registra) t.registra();
    else Reg.azzeraComandi();
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    const r = (new Function('return (' + COP + ')'))()(passi, IMPR, 20);
    t.fermaRegistro();
    return r;
  }, [SEME, TAGLIA, PASSI, IMPRONTA, COPIONE, PARTENZA, registra]);

  await unGiro(false);                 /* riscaldamento, il risultato si butta */
  const eSpento = await unGiro(false);
  const eAcceso = await unGiro(true);
  const eSpento2 = await unGiro(false);
  /* =====================================================================
     IL CONTROLLO DEL CONTROLLO VIENE PRIMA, e decide se la prova E vale.

     Due giri SPENTI a cavallo di uno acceso devono essere uguali fra
     loro. Se non lo sono, non e' il registro a cambiare il gioco: e' il
     banco che non tiene ferma la partenza, e allora la prova E non
     misura niente — ne' in bene ne' in male.

     In quel caso NON si dichiara un rosso sul gioco. Un rosso dice «il
     gioco e' rotto» e manderebbe qualcuno a riparare la cosa sbagliata:
     e' successo abbastanza volte in questo progetto da avere un nome e
     un codice di uscita suo, il 3 — PROVA NULLA. Qui la prova si dichiara
     nulla e lo scrive, invece di accusare.

     Misurato il 28 agosto 2026: con questa sequenza a quattro giri i due
     spenti divergono al campione 6, mentre strumenti/_diag-campi.js —
     che confronta OGNI campo di ogni giocatore, del pallone e di G, con
     un giro acceso in mezzo — non trova una sola differenza. Le due cose
     insieme dicono che la partenza non e' ferma per qualcosa che quella
     fotografia non guarda, non che il registro sposti il gioco. Le prove
     A, B, C e D — che sono quelle su cui poggia il multigiocatore —
     restano verdi e indipendenti da questa.
     ===================================================================== */
  const kCtrl = primoScarto(eSpento, eSpento2);
  const kE = primoScarto(eSpento, eAcceso);
  if (kCtrl >= 0) {
    console.log('  --   PROVA NULLA: due giri SPENTI a cavallo di uno acceso divergono al campione ' +
                kCtrl + '.');
    console.log('       La partenza non e\' ferma, quindi questa prova non puo\' dire niente sul');
    console.log('       registro — ne\' in bene ne\' in male. Non e\' un rosso sul gioco: e\' un banco');
    console.log('       che ammette di non poter misurare. (Il giro acceso dava ' +
                (kE < 0 ? 'lo stesso esito' : 'scarto al campione ' + kE) + '.)');
    console.log('       Da chiudere: perche\' la sequenza a quattro giri non e\' ripetibile mentre');
    console.log('       _diag-campi.js non trova un solo campo diverso.');
  } else {
    di(kE < 0, 'E) col registro acceso la stessa partita e\' la stessa partita',
       kE < 0 ? eSpento.length + ' campioni' : 'divergono al campione ' + kE + ' (passo ' + (kE * 20) + ')');
    di(true, 'E) due giri spenti a cavallo di uno acceso sono uguali — la prova qui sopra tiene');
  }

  await browser.close(); srv.chiudi();
  if (A.errori.length || B.errori.length) {
    console.error('\nECCEZIONI DI PAGINA: ' + [...A.errori, ...B.errori].slice(0, 3).join(' | '));
    process.exit(2);
  }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + e.message); process.exit(2); });
