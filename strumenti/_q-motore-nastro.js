/* =====================================================================
   _q-motore-nastro.js — UN ONESTO CON UN TELEFONO DI UN'ALTRA MARCA
   (voce #142, compito 1)

   PERCHE' ESISTE. Il #141 ha misurato che Chromium (V8), WebKit
   (JavaScriptCore) e Firefox (SpiderMonkey) non producono la stessa
   partita: ECMA-262 lascia le trascendenti «implementation-approximated»
   e `Math.hypot` da' l'ultimo bit diverso su 100 valori su 200. Il #141
   ne ha tratto un NO per il lockstep dell'onda E. Ma e' anche un CRITICO
   DELL'ONDA D, gia' in produzione, e questo banco lo misura sulla
   CATENA VERA invece di ragionarci sopra.

   LA CATENA, anello per anello:
     · il verificatore differito (staffetta.js, voce #138) pesca le sfide
       a verificata = 0 e le rigioca con window.__test.giudica;
     · sul verdetto NON TORNA — l'unico che muove punti — segna_verdetto
       disfa delta_a e delta_d (punti tolti a DUE persone), alza un
       sospetto che non decade mai, e chiude la riga per sempre;
     · il nastro non dichiara il motore: Reg.schermo scrive solo
       larghezza e altezza (tipo 10);
     · e staffetta.js apre `chromium.launch()`, riga fissa, per tutto.
   Quindi un iPhone gioca onesto e Chromium lo chiama bugiardo.

   QUESTO BANCO NON SIMULA NIENTE. Due telefoni veri (due contesti
   separati, due salvataggi, due identita'), il server finto del repo,
   una sfida giocata fino al fischio finale, e il nastro preso DALLA RIGA
   CHE IL SERVER HA RICEVUTO — stretto in deflate-raw e base64url come in
   esercizio, allargato in Node come fa la staffetta. Il giudizio si
   chiede a una terza pagina che non ha giocato, con la finestra che il
   nastro dichiara.

   LE PROVE, in ordine:

     A1) L'ESERCIZIO — e' LA META' CHE MANCA A QUASI TUTTI I BANCHI.
         Dopo la cura il giudice si astiene PRIMA di rigiocare, quindi
         non si saprebbe piu' se quel nastro, su quel motore, sarebbe
         DAVVERO divergiuto: un banco che misurasse solo l'astensione
         attesterebbe la propria cura su nastri che magari non avevano
         niente da divergere. Qui si maschera l'impronta del nastro con
         quella di chi giudica (_nastri-bugiardi.conMotore): il giudice
         crede che il motore coincida, rigioca, e dice quel che avrebbe
         detto senza la cura. Se A1 non trova NON TORNA su NESSUN
         nastro, A2 non sta misurando niente e si esce 3.
         RETTIFICA A EDIZIONI (23 settembre 2026, voce #143): sul gioco
         CURATO l'esercizio non riesce piu', e non e' un guasto — il
         nastro mascherato rigioca e TORNA (misurato 6 su 6), perche' le
         trascendenti della simulazione non dipendono piu' dal motore.
         A1 misura adesso proprio quello, che e' una domanda piu' forte
         di «nessuno lo accusa»; la condanna del #142 si riproduce col
         gioco di prima (`--gioco fuori/143-prima.html`). Le righe
         precedenti restano: dicevano il vero quando furono scritte, e
         valgono ancora per ogni gioco senza la libreria del #143.
     A2) LA CONDANNA — gli stessi nastri, intatti, giudicati su Chromium:
         NESSUN NON TORNA. E' la prova che nasce ROSSA (oggi 7 su 8).
     A3) E SU FIREFOX, che non e' V8: la divergenza non e' «Chrome contro
         il resto del mondo», e' fra tutti (oggi 1 su 8).
     B)  LA COPERTURA — gli stessi nastri sullo STESSO motore che li ha
         registrati: TORNA. Senza questa, «astenersi sempre» passerebbe
         a pieni voti ed e' il falso _crit-motore-pauroso.
     C)  LA SEPARAZIONE — l'impronta e' DIVERSA sui tre motori. Un'impronta
         che non separa (pow e sqrt, misurate identiche ovunque) direbbe
         sempre «stesso motore»: attesterebbe invece di misurare.
     D)  LA STABILITA' — l'impronta e' IDENTICA su due contesti freschi
         dello stesso motore. Un'impronta che balla farebbe astenere il
         giudice da se stesso.
     E)  I NASTRI VECCHI — un nastro senza la riga del motore, giudicato
         sullo stesso motore che l'ha registrato: INCOMPLETO, mai
         un'accusa. E' il prezzo dichiarato della cura, ed e' la
         correzione di revisione che il #133 ha gia' pagato una volta
         (IMPORTANTE-1: se manca, ci si astiene lo stesso).
     F)  LA CAUSA VERA — quando si astiene per il motore, la causa e'
         `motore-js-diverso` e non una qualunque: chi legge il referto
         deve poter aprire il motore giusto invece di aprire finestre per
         sempre.

   IL BANCO DEVE ESSERE LO STESSO BANCO, e questa riga l'ha pagata il
   #141 alla sua prima corsa: le opzioni di contesto sono IDENTICHE per
   tutti e tre i motori, senza eccezioni. `isMobile` porta con se' un DPR
   diverso, un DPR diverso cuoce tele diverse, e si misurerebbe il
   contesto chiamandolo motore. Firefox non accetta `isMobile`, quindi
   NESSUNO lo riceve — e il banco stampa il banco di ognuno, cosi' un
   rosso si puo' leggere.

   NON E' RIPETIBILE COME UN BANCO A PASSO FISSO: le sfide si giocano
   davvero, con l'autoplay, e i verdetti sono conteggi. Le soglie sono
   «zero accuse» e «tutte confermate», non una percentuale.

   uso:  node strumenti/_q-motore-nastro.js
         node strumenti/_q-motore-nastro.js --sfide 8
         node strumenti/_q-motore-nastro.js --gioco fuori/falso.html
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se non c'e' stato niente da misurare (nessuna sfida al fischio
   finale, o nessun nastro che diverga).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const playwright = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const N_SFIDE = Math.max(1, parseInt(arg('sfide', '6'), 10) || 6);

/* IL MOTORE CHE REGISTRA e' WebKit, cioe' l'iPhone: e' il caso vero, ed
   e' anche il caso peggiore — la staffetta apre chromium a riga fissa,
   quindi ogni sfida giocata da un iPhone passa esattamente di qui. */
const REGISTRA = 'webkit';
const GIUDICI = ['webkit', 'chromium', 'firefox'];

/* LE OPZIONI DI CONTESTO, IDENTICHE PER TUTTI E TRE (vedi la lettera di
   testa). Non passano da B.apri perche' quella accende isMobile, che
   Firefox non accetta: qui l'unica cosa che deve cambiare fra due pagine
   e' il MOTORE. */
const OPZ = { viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' };

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
const info = (nome, det) => console.log('  --  ' + nome + (det ? '  [' + det + ']' : ''));

async function apri(browser, porta) {
  const ctx = await browser.newContext(Object.assign({}, OPZ));
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  /* I TEMPI SONO LARGHI APPOSTA, e li ha misurati la batteria (23
     settembre 2026, voce #142, compito 4). Questo banco apre TRE motori
     veri e serve un file da 2,7 MB a sei contesti; lanciato in compagnia
     di altri tre cancelli, il `goto` di serie (30 s) scadeva e il banco
     usciva 2 — cioe' si dichiarava cieco per il carico della macchina
     invece di misurare il gioco. La cura vera e' `solo:true` in
     `tutti.js` (un banco cosi' non corre in compagnia); questi numeri
     sono la seconda rete, per la macchina che quel giorno e' lenta lo
     stesso. Un banco che esplode non accusa nessuno, ma non misura
     nemmeno, e un cancello che non misura non serve a niente. */
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load', timeout: 120000 });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 120000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });
  await pag.evaluate(() => { try { Audio5.unlock(); } catch (e) {} });
  return { ctx, pag, errori };
}

/* il giudizio, dalla parte di chi non ha giocato */
const giudizio = (pag, nastro, atteso, opz) => pag.evaluate(([n, a, o]) => {
  const t = window.__test;
  if (typeof t.giudica !== 'function') return { manca: true, verdetto: '', causa: 'niente-giudice' };
  try {
    const r = t.giudica(n, a, o);
    return Object.assign({ manca: false }, r && typeof r === 'object' ? r : { verdetto: String(r) });
  } catch (e) { return { manca: false, verdetto: '', causa: 'giudizio-esploso', eccezione: e.message }; }
}, [nastro, atteso, opz]);

/* L'IMPRONTA SI CHIEDE AL GIOCO, ed e' l'unica cosa che si puo' chiedere
   solo a lui: e' il gioco a decidere che cosa scrivera' nel nastro. Se
   non esiste ancora, torna null e le prove che la riguardano sono rosse
   — non nulle: «non c'e'» e' un esito, non un'astensione del banco. */
const improntaDi = pag => pag.evaluate(() => {
  const t = window.__test;
  if (typeof t.improntaMotore !== 'function') return null;
  try { return t.improntaMotore() >>> 0; } catch (e) { return null; }
});

const bancoDi = pag => pag.evaluate(() =>
  [devicePixelRatio, innerWidth, innerHeight].join(','));

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  const browser = {};
  const G = {};             /* le pagine-giudice, una per motore */
  let nulla = '';
  let nienteDaAccusare = false;   /* vedi A1 e PROVA NULLA */
  /* il testo del gioco che si sta provando: serve alla rettifica di A1
     (voce #143), che deve sapere se le trascendenti passano da casa */
  const testoGioco = fs.readFileSync(prova || path.join(RADICE, 'CALCETTO-il-gioco.html'), 'utf8');
  try {
    console.log('=== UN ONESTO CON UN TELEFONO DI UN\'ALTRA MARCA (voce #142) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', ' + N_SFIDE +
                ' sfide vere registrate su ' + REGISTRA + ', giudicate su ' + GIUDICI.join(' / '));
    console.log('    (contesto identico per tutti e tre: niente isMobile, che Firefox non');
    console.log('     accetta e che porta un DPR diverso — il #141 ci ha gia\' perso una corsa)\n');

    for (const m of new Set([REGISTRA].concat(GIUDICI))) {
      if (!playwright[m]) throw Object.assign(new Error('motore sconosciuto: ' + m), { banco: true });
      try { browser[m] = await playwright[m].launch(); }
      catch (e) { throw Object.assign(new Error('non si apre ' + m + ': ' + e.message), { banco: true }); }
    }

    /* --- i due telefoni, sul motore che registra --- */
    const At = await apri(browser[REGISTRA], sg.porta);
    const Bt = await apri(browser[REGISTRA], sg.porta);
    const c = await At.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida') }));
    if (!c.schermata) { nulla = 'questo gioco non ha la schermata della sfida'; throw new Error(nulla); }
    await B.collega(Bt, ss.porta, 'BORGATA');
    await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(Bt); await B.entra(At);
    await B.pubblica(Bt); await B.pubblica(At);

    /* --- le tre pagine che giudicano, piu' una seconda per ogni motore
       (serve alla prova D, la stabilita' dell'impronta) --- */
    const imp = {}, imp2 = {}, banco = {};
    for (const m of GIUDICI) {
      G[m] = await apri(browser[m], sg.porta);
      banco[m] = await bancoDi(G[m].pag);
      imp[m] = await improntaDi(G[m].pag);
      const secondo = await apri(browser[m], sg.porta);
      imp2[m] = await improntaDi(secondo.pag);
      await secondo.ctx.close();
    }
    for (const m of GIUDICI) info('banco ' + m.padEnd(9) + banco[m] + '   impronta ' +
      (imp[m] === null ? '(il gioco non la sa dare)' : imp[m]));
    console.log('');
    if (banco[GIUDICI[0]] !== banco[GIUDICI[1]] || banco[GIUDICI[0]] !== banco[GIUDICI[2]]) {
      nulla = 'i tre motori non partono dallo stesso banco: un confronto qui misurerebbe il contesto';
      throw new Error(nulla);
    }

    /* --- le sfide vere --- */
    const sfide = [];
    for (let i = 0; i < N_SFIDE; i++) {
      const s = await B.giocaUna(At, ss, [], 24000, 0);
      if (s.partita && s.riga) sfide.push(s);
    }
    if (!sfide.length) { nulla = 'nessuna sfida e\' arrivata al fischio finale'; throw new Error(nulla); }
    for (const s of sfide) s.crudo = N.allarga(s.riga.replay);
    if (!sfide[0].crudo || sfide[0].crudo.indexOf('|') < 0) { nulla = 'il nastro non si e\' allargato'; throw new Error(nulla); }

    /* --- i giudizi --- */
    const R = { A1: [], A2: [], A3: [], B: [], E: [] };
    for (const s of sfide) {
      const atteso = [s.riga.gol_a | 0, s.riga.gol_d | 0];
      const opz = { seme: s.riga.seme, taglia: s.riga.taglia | 0 };
      const nastroNel = N.improntaDi(s.crudo);

      /* A1 — IL MOTORE MASCHERATO. Su Chromium, col nastro che dichiara
         l'impronta DI CHROMIUM: il giudice non ha niente di cui
         accorgersi e rigioca. E' quel che il giudizio diretto faceva
         prima della cura, e continua a farlo dopo. */
      const mascherato = imp.chromium === null ? s.crudo : N.conMotore(s.crudo, imp.chromium);
      R.A1.push(await giudizio(G.chromium.pag, mascherato, atteso, opz));
      /* A2 / A3 — gli stessi nastri, intatti */
      R.A2.push(await giudizio(G.chromium.pag, s.crudo, atteso, opz));
      R.A3.push(await giudizio(G.firefox.pag, s.crudo, atteso, opz));
      /* B — sullo stesso motore che ha registrato */
      R.B.push(await giudizio(G[REGISTRA].pag, s.crudo, atteso, opz));
      /* E — il nastro vecchio: senza la riga del motore, sul motore
         giusto. Se la riga non c'e' nemmeno adesso, senzaMotore torna
         null e la prova lo dice invece di fingere. */
      const vecchio = N.senzaMotore(s.crudo);
      R.E.push(vecchio === null ? { verdetto: '', causa: 'niente-riga-11', nonCe: true }
                                : await giudizio(G[REGISTRA].pag, vecchio, atteso, opz));
      s.nelNastro = nastroNel;
    }

    const conta = v => { const o = {}; for (const x of v) { const k = (x.verdetto || '(niente)') + (x.causa ? '/' + x.causa : ''); o[k] = (o[k] | 0) + 1; } return o; };
    const stampa = o => Object.keys(o).sort().map(k => k + ' ' + o[k]).join(' · ');
    const quanti = (v, p) => v.filter(p).length;
    const accuse = v => quanti(v, x => x.verdetto === 'NON TORNA');
    const n = sfide.length;

    console.log('I NASTRI: ' + n + ' sfide vere, ' + sfide[0].crudo.length + ' caratteri la prima, ' +
                'impronta nel nastro ' + (sfide[0].nelNastro === null ? '(assente)' : sfide[0].nelNastro));
    for (const s of sfide)
      info('  seme ' + s.riga.seme + ' taglia ' + s.riga.taglia + ' atteso ' +
           (s.riga.gol_a | 0) + '-' + (s.riga.gol_d | 0));
    console.log('');

    /* ---- A1: l'esercizio ---- */
    console.log('A1) L\'ESERCIZIO — col motore MASCHERATO il giudice rigioca, e su un motore diverso sbaglia');
    console.log('    (senza questa riga, «zero accuse» potrebbe voler dire «non c\'era niente da accusare»)');
    const eser = accuse(R.A1);
    /* =================================================================
       E ZERO ACCUSE QUI HA DUE CAUSE DIVERSE, che il banco NON deve
       confondere (rilievo trovato dal falso _crit-motore-pauroso, voce
       #142, compito 3: il banco usciva 3 — «prova nulla» — dove doveva
       uscire 1, e un 3 non accusa nessuno).

         · zero accuse perche' i nastri TORNANO anche su chromium: non
           c'era niente da accusare, e allora A2 non misura niente ->
           PROVA NULLA, si esce 3 (e la si valuta IN FONDO, dopo aver
           stampato tutto: fermarsi qui nasconderebbe la prova B, che e'
           proprio quella che morde il caso qui sotto);
         · zero accuse perche' il giudice SI E' ASTENUTO lo stesso, a
           impronta coincidente: quella non e' prudenza, e' perdita di
           copertura, ed e' un ROSSO che va detto qui e non altrove.
       ================================================================= */
    const astenutoInA1 = quanti(R.A1, x => x.verdetto === 'INCOMPLETO' &&
                                           String(x.causa || '').indexOf('motore-js') === 0);
    di(astenutoInA1 === 0, 'A1b) e a impronta COINCIDENTE non si astiene: sarebbe copertura buttata via',
       astenutoInA1 + '/' + n + ' astensioni per il motore');
    /* =====================================================================
       RETTIFICA A EDIZIONI (23 settembre 2026, voce #143, compito 4):
       L'ESERCIZIO NON RIESCE PIU', E NON E' UN GUASTO — E' LA CURA.

       A1 chiedeva: «col motore mascherato, il nastro di WebKit rigiocato
       su Chromium da' NON TORNA?». Era la condanna del #142, e nasceva
       verde perche' le trascendenti native davano l'ultimo bit diverso.
       Il #143 le ha scritte in casa: adesso quel nastro, rigiocato
       DAVVERO su Chromium, TORNA — misurato qui, 6 su 6. La domanda
       vecchia non ha piu' risposta possibile su un gioco curato, e un
       banco che continuasse a pretenderla sarebbe rosso per sempre su un
       difetto che non c'e' piu'.

       COSA MISURA ADESSO, ed e' una domanda piu' forte, non piu' debole:
       che il nastro mascherato TORNI. Non «nessuno lo accusa» — quello
       lo direbbe anche un giudice che si astiene sempre — ma «rigiocato
       fino in fondo su un altro motore, il conto torna». E' la soglia
       del #143 vista dal posto del giudice, e diventa rossa il giorno in
       cui una trascendente tornasse in mano al telefono.

       E LA CONDANNA DEL #142 NON SI PERDE: si riproduce quando serve, sul
       gioco di prima —
         node strumenti/_q-motore-nastro.js --gioco fuori/143-prima.html
       che e' il gioco di `main` a `a2607d0`. La dottrina del #142 resta
       necessaria: `pow` e `sqrt` restano native (misurate concordi, non
       obbligate da nessuna norma tranne sqrt), il DISEGNO resta nativo, e
       i nastri scritti prima del #143 esistono ancora.
       ===================================================================== */
    const curato = testoGioco.indexOf('LA MATEMATICA IN CASA (voce #143)') >= 0;
    const tornaInA1 = quanti(R.A1, x => x.verdetto === 'TORNA');
    if (curato) {
      di(tornaInA1 === n && astenutoInA1 === 0,
         'A1) il gioco porta la matematica in casa (#143): il nastro mascherato RIGIOCA E TORNA su un altro motore',
         tornaInA1 + '/' + n + ' TORNA, ' + eser + ' accuse — ' + stampa(conta(R.A1)));
      console.log('    (la condanna del #142 non si riproduce piu\' qui, ed e\' la cura: per rivederla,');
      console.log('     `--gioco fuori/143-prima.html`, cioe\' il gioco di prima del #143)');
    } else {
      di(eser > 0 || astenutoInA1 > 0, 'A1) su chromium, il nastro che dichiara l\'impronta DI CHROMIUM da\' NON TORNA',
         eser + '/' + n + ' accuse — ' + stampa(conta(R.A1)));
    }
    console.log('');
    /* la prova nulla si decide in fondo: vedi PROVA NULLA piu' sotto.
       Sul gioco curato «zero accuse» NON e' una prova nulla: e' il
       risultato atteso e misurato, e la copertura che A1 dava prima la
       da' adesso la riga qui sopra (il nastro TORNA, non «non lo accusa
       nessuno»). */
    nienteDaAccusare = !curato && eser === 0 && astenutoInA1 === 0;

    /* ---- A2 / A3: la condanna ---- */
    console.log('A2/A3) LA CONDANNA — gli stessi nastri onesti, intatti, su un motore che non e\' il loro');
    di(accuse(R.A2) === 0, 'A2) su chromium NESSUN nastro onesto viene accusato',
       accuse(R.A2) + '/' + n + ' accuse — ' + stampa(conta(R.A2)));
    di(accuse(R.A3) === 0, 'A3) e nemmeno su firefox, che non e\' V8',
       accuse(R.A3) + '/' + n + ' accuse — ' + stampa(conta(R.A3)));
    console.log('');

    /* ---- B: la copertura ---- */
    console.log('B) LA COPERTURA — sullo STESSO motore i nastri onesti si confermano ancora');
    console.log('   (senza, «astenersi sempre» passerebbe a pieni voti: e\' il falso _crit-motore-pauroso)');
    di(quanti(R.B, x => x.verdetto === 'TORNA') === n,
       'B) su ' + REGISTRA + ' tutti e ' + n + ' i nastri danno TORNA',
       stampa(conta(R.B)));
    console.log('');

    /* ---- C / D: l'impronta ---- */
    console.log('C/D) L\'IMPRONTA — separa i motori, e non balla fra due corse dello stesso');
    const ci = GIUDICI.map(m => imp[m]);
    di(ci.every(x => x !== null), 'C0) il gioco sa dare la sua impronta di motore',
       GIUDICI.map((m, i) => m + ' ' + (ci[i] === null ? 'NO' : ci[i])).join(' · '));
    di(ci.every(x => x !== null) && new Set(ci).size === GIUDICI.length,
       'C) l\'impronta e\' DIVERSA su tutti e ' + GIUDICI.length + ' i motori',
       ci.every(x => x !== null) ? new Set(ci).size + ' valori distinti su ' + GIUDICI.length : 'non c\'e\'');
    di(GIUDICI.every(m => imp[m] !== null && imp[m] === imp2[m]),
       'D) e IDENTICA su un secondo contesto dello stesso motore',
       GIUDICI.map(m => m + ' ' + (imp[m] === null ? 'NO' : (imp[m] === imp2[m] ? 'stabile' : imp[m] + '->' + imp2[m]))).join(' · '));
    console.log('');

    /* ---- E: i nastri vecchi ---- */
    console.log('E) I NASTRI VECCHI — senza la riga del motore, e sul motore GIUSTO: ci si astiene lo stesso');
    console.log('   (correzione di revisione del #133, IMPORTANTE-1: se manca non si procede alla cieca)');
    const nonCe = quanti(R.E, x => x.nonCe);
    if (nonCe === n) {
      di(false, 'E) un nastro senza la riga del motore da\' INCOMPLETO/motore-js-ignoto',
         'il nastro non ha nessuna riga di tipo 11 da togliere: il gioco non la scrive');
    } else {
      di(quanti(R.E, x => x.verdetto === 'INCOMPLETO' && x.causa === 'motore-js-ignoto') === n - nonCe,
         'E) un nastro senza la riga del motore da\' INCOMPLETO/motore-js-ignoto',
         stampa(conta(R.E.filter(x => !x.nonCe))));
    }
    console.log('');

    /* ---- F: la causa vera ---- */
    console.log('F) LA CAUSA VERA — chi si astiene deve dire PERCHE\', o chi legge apre finestre per sempre');
    const asten = R.A2.filter(x => x.verdetto === 'INCOMPLETO');
    di(asten.length === n && asten.every(x => x.causa === 'motore-js-diverso'),
       'F) su chromium la causa e\' motore-js-diverso su tutti e ' + n + ' i nastri',
       stampa(conta(R.A2)));
    const conImp = R.A2.filter(x => x.causa === 'motore-js-diverso' && (x.impronta >>> 0) > 0);
    di(asten.length > 0 && conImp.length === asten.filter(x => x.causa === 'motore-js-diverso').length &&
       conImp.length > 0 && conImp.every(x => (x.impronta >>> 0) === (sfide[0].nelNastro >>> 0)),
       'F2) e il referto porta l\'impronta CHE IL NASTRO CHIEDE, cosi\' si puo\' aprire il motore giusto',
       conImp.length ? 'referto ' + (conImp[0].impronta >>> 0) + ', nastro ' + (sfide[0].nelNastro >>> 0)
                     : 'nessun referto con impronta');
    console.log('');

    const errori = [].concat(...GIUDICI.map(m => G[m].errori), At.errori, Bt.errori);
    if (errori.length) {
      console.error('ECCEZIONI DI PAGINA: ' + errori.slice(0, 3).join(' | '));
      throw Object.assign(new Error('eccezioni di pagina'), { banco: true, gia: true });
    }
  } catch (e) {
    for (const m of Object.keys(browser)) { try { await browser[m].close(); } catch (x) {} }
    try { sg.chiudi(); ss.chiudi(); } catch (x) {}
    if (nulla) { console.error('\nPROVA NULLA: ' + nulla); process.exit(3); }
    console.error('\nFALLITO (banco): ' + e.message);
    process.exit(e.gia ? 2 : 2);
  }
  for (const m of Object.keys(browser)) { try { await browser[m].close(); } catch (x) {} }
  try { sg.chiudi(); ss.chiudi(); } catch (x) {}

  const rossi = esiti.filter(x => !x).length;
  console.log(esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti\n');
  /* ---- PROVA NULLA, e si decide QUI e non a meta' banco (vedi A1) ----
     Nessuno dei nastri di questa sessione divergeva su chromium nemmeno
     a motore mascherato: allora «zero accuse» in A2 non e' una cura, e'
     un caso fortunato, e un banco che lo chiamasse verde attesterebbe.
     Si esce 3, che NON accusa il gioco, e si chiede piu' nastri. */
  if (nienteDaAccusare) {
    console.error('PROVA NULLA: nessuno dei ' + N_SFIDE + ' nastri diverge su chromium nemmeno a');
    console.error('motore mascherato, quindi «zero accuse» non misurerebbe niente. Rilanciare');
    console.error('con piu\' sfide (--sfide 8).');
    process.exit(3);
  }
  if (!rossi) {
    console.log('>>> UN ONESTO CON UN TELEFONO DI UN\'ALTRA MARCA NON VIENE PIU\' ACCUSATO:');
    console.log('    il nastro dichiara il motore, il giudice si astiene invece di togliere');
    console.log('    punti, e sullo stesso motore la conferma esce ancora.');
    process.exit(0);
  }
  console.log('>>> IL CRITICO C\'E\'. Un nastro ONESTO, giudicato su un motore diverso da');
  console.log('    quello che l\'ha registrato, fa togliere i punti a due persone e alza un');
  console.log('    sospetto che non decade mai. Non e\' un caso raro: fra un iPhone e un');
  console.log('    Android il motore JavaScript e\' SEMPRE diverso.');
  process.exit(1);
})();
