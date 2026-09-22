/* =====================================================================
   _q-staffetta.js — IL BANCO CHE CONDANNA LA STAFFETTA (voce #138,
   compito 1). Nasce ROSSO: `strumenti/staffetta.js` non esiste ancora.

   CHE COSA MISURA, e perche' e' l'ultimo pezzo dell'onda D. Il
   verificatore differito era fatto di tre pezzi e mezzo:

     #133  LA CAPACITA'  window.__test.giudica(nastro, atteso, opz),
                         cinque verdetti, e solo NON TORNA muove punti
     #134  IL TUBO       la colonna `verificata` arriva fino alla riga
                         della lista sul telefono di chi ha subito
     #137  L'ALTRO CAPO  segna_verdetto(s_id, verdetto) nel database, il
                         sospetto che nasce SOLO da NON TORNA

   Mancava IL MEZZO: il processo che pesca le righe a `verificata = 0`,
   apre il browser DELLA MISURA CHE IL NASTRO DICHIARA, chiama `giudica`
   e passa la parola a `segna_verdetto`. Lo dicevano in chiaro tre file
   del repo (rete/LEGGIMI.md, rete/schema.sql:122, MANUALE.md §A voce
   #134): «manca quello, e non manca altro». Finche' non esiste, «la
   classifica si ripulisce da sola» e' una promessa invece che un fatto.

   PERCHE' IL BANCO NON PARLA COL DATABASE VERO. La stessa ragione di
   _q-rete, _q-sfida e _q-sospetto: un banco che chiama Internet e' un
   banco che un giorno diventa rosso da solo, e quel giorno nessuno
   guarda piu' il colore. Qui il database e' un oggetto in memoria e il
   lato-server e' `applica()` di rete/lib/verdetto.js — la DEFINIZIONE
   ESEGUIBILE della stessa regola che `segna_verdetto` rifa' in SQL.

   E QUEL CHE QUESTO BANCO NON PUO' FARE, detto subito perche' un banco
   che tace un limite e' un banco che mente (e' la stessa dichiarazione
   della voce #137):
     · L'SQL NON SI ESEGUE. Non c'e' un Postgres nel repo. La
       corrispondenza fra `applica()` e `segna_verdetto` e' guardata PER
       TESTO da _q-sospetto D5, che dichiara di attestare invece di
       misurare.
     · POSTGREST NON SI INTERROGA. Di `bancoVero` si misura la FORMA
       (che filtri verificata=0, che chiami segna_verdetto con la
       PAROLA, che rifiuti di nascere senza credenziali, che non stampi
       mai la chiave), non il viaggio.
     · IL RITMO e' misurato su QUESTA macchina, non su un CI: i numeri
       sono un ordine di grandezza, non un contratto.

   I SEI GRUPPI
     A) LA FORMA          il modulo, la misura letta dal nastro, il
                          raggruppamento, il rifiuto senza credenziali
     B) IL GIRO COMPLETO  sei sfide finte, quattro verdetti diversi, e
                          il quinto (NON FINISCE) in un giro a parte
     C) LA MISURA GIUSTA  una sfida VERA giocata a 1024x460 dentro
                          questa corsa: deve TORNARE, e torna solo se la
                          staffetta ha aperto QUELLA finestra
     D) LA RIPARTENZA     muore a meta' in due modi diversi, riparte:
                          nessuna riga persa, nessuna giudicata due
                          volte, e la guardia della struttura regge
                          anche con due staffette che pescarono insieme
     E) IL RITMO          il freno che dice no, il tetto per giro, la
                          prova a vuoto, e i millisecondi dichiarati
     F) LE PORTE          cinque endpoint, la funzione ancora revocata,
                          la chiave che non si stampa e non e' nel repo

   uso:  node strumenti/_q-staffetta.js
         node strumenti/_q-staffetta.js --staffetta fuori/staffetta-accusa.js
         node strumenti/_q-staffetta.js --solo A,B
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se la sfida vera non arriva al fischio finale (prova non fatta).
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const urlmod = require('url');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');
const FIX = require('./_nastro-duello-congelato.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const VIA_STAFFETTA = arg('staffetta', 'strumenti/staffetta.js');
const gruppiChiesti = String(arg('solo', 'A,B,C,D,E,F')).toUpperCase().split(',').map(s => s.trim());
const vuole = g => gruppiChiesti.includes(g);

/* LA SECONDA MISURA, e non e' quella di serie: e' tutto il punto del
   gruppo C. Un nastro registrato qui, giudicato a 915x412, dice
   INCOMPLETO/schermo-diverso (misurato, fuori/_sonda-138-misura.js). */
const MISURA_2 = [1024, 460];
const MISURA_1 = [915, 412];

const VERDETTI = ['TORNA', 'NON TORNA', 'INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE'];

let ok = 0, no = 0;
const di = (buono, nome, det) => {
  if (buono) { ok++; console.log('  OK  ' + nome + (det !== undefined && det !== '' ? '  [' + det + ']' : '')); }
  else { no++; console.log('  NO  ' + nome + (det !== undefined && det !== '' ? '  [' + det + ']' : '')); }
};
const titolo = t => console.log('\n' + t);
const info = (t, d) => console.log('      ' + t + (d !== undefined ? '  ' + d : ''));

/* il nastro STRETTO, cioe' la forma in cui il dato esiste davvero nel
   database: deflate-raw + base64url, come lo scrive chiudiSfida. Si
   stringe qui apposta — un banco che passasse il testo crudo non
   eserciterebbe mai la parte della staffetta che allarga. */
const stringi = crudo => zlib.deflateRawSync(Buffer.from(String(crudo), 'utf8'))
  .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/* =====================================================================
   IL DATABASE IN MEMORIA — quattro tabelle, la forma di quello vero.
   E' quello di _q-sospetto.js, copiato e non reinventato: un rosso qui e
   un rosso li' devono voler dire la stessa cosa.
   ===================================================================== */
function bancoNuovo() { return { allenatore: new Map(), punti: new Map(), sfida: [] }; }
function allenatoreNuovo(b, id, punti) {
  b.allenatore.set(id, { id, sospetto: 0, bandito: false });
  b.punti.set(id, { allenatore: id, punti: punti === undefined ? 1000 : punti,
                    vinte: 0, pari: 0, perse: 0, fatti: 0, subiti: 0, serie: 0 });
}
/* una sfida COME IL SERVER LA REGISTRA: i delta sono quelli che
   /api/sfida ha scritto davvero, e sono l'unico modo di disfare */
function sfidaNuova(b, r) {
  const id = b.sfida.length + 1;
  b.sfida.push({ id, attaccante: r.att, difensore: r.dif, seme: String(r.seme),
                 taglia: r.taglia | 0, gol_a: r.gol_a | 0, gol_d: r.gol_d | 0,
                 replay: stringi(r.crudo), peso: String(r.crudo).length,
                 giocata: '2026-09-22T10:0' + (id % 10) + ':00Z',
                 vista: false, verificata: 0,
                 delta_a: r.delta_a | 0, delta_d: r.delta_d | 0 });
  const pa = b.punti.get(r.att), pd = b.punti.get(r.dif);
  pa.punti = Math.max(100, pa.punti + (r.delta_a | 0));
  pa.fatti += r.gol_a | 0; pa.subiti += r.gol_d | 0;
  if (r.gol_a > r.gol_d) { pa.vinte++; pa.serie++; } else if (r.gol_a < r.gol_d) { pa.perse++; pa.serie = 0; } else { pa.pari++; pa.serie = 0; }
  if (pd) {
    pd.punti = Math.max(100, pd.punti + (r.delta_d | 0));
    pd.fatti += r.gol_d | 0; pd.subiti += r.gol_a | 0;
    if (r.gol_d > r.gol_a) pd.vinte++; else if (r.gol_d < r.gol_a) pd.perse++; else pd.pari++;
  }
  return id;
}

/* =====================================================================
   IL LATO-DATABASE CHE LA STAFFETTA VEDE — tre verbi e un registro.

   `segna` chiama `applica()` di rete/lib/verdetto.js, che e' la regola
   di `segna_verdetto` scritta dove si puo' eseguire. `frena` risponde
   come la funzione `frena` del database: true = passa, false = fermati.

   I due guasti finti servono al gruppo D, e sono DUE CASI DIVERSI:
     esplodePrima  la chiamata non e' partita   -> la riga resta aperta
     esplodeDopo   la risposta si e' persa      -> la riga e' gia' chiusa
   Il secondo e' quello pericoloso: la staffetta non sa di aver vinto.
   ===================================================================== */
function bancoFinto(db, V, opz) {
  opz = opz || {};
  const log = { pesca: 0, segna: [], frena: 0 };
  let contoFreno = 0;
  return {
    log,
    async pesca(quanti, dopo) {
      log.pesca++;
      /* LA PESCA STANTIA (gruppo D4): due staffette partite insieme
         vedono tutte e due le stesse righe ancora aperte. Si simula
         restituendo una lista congelata, che ignora `verificata`. */
      if (opz.pescaFissa) return opz.pescaFissa.map(id => db.sfida.find(s => s.id === id))
        .filter(Boolean).map(s => ({ ...s }));
      /* e questa e' la pesca vera: verificata = 0, per id crescente
         (bigserial, cioe' l'ordine di registrazione), dopo il cursore */
      return db.sfida
        .filter(s => (s.verificata | 0) === 0 && s.id > ((dopo | 0) || 0))
        .sort((a, b) => a.id - b.id)
        .slice(0, quanti | 0 || 50)
        .map(s => ({ ...s }));
    },
    async segna(id, parola) {
      log.segna.push({ id, parola });
      if (opz.esplodePrima === id) throw new Error('rete caduta prima di segnare');
      const r = V.applica(db, id, parola);
      if (opz.esplodeDopo === id) throw new Error('risposta persa dopo aver segnato');
      return { mosso: !!r.mosso, esito: r.esito | 0, sospetto: r.sospetto | 0, causa: r.causa || '' };
    },
    async frena() {
      log.frena++; contoFreno++;
      if (opz.frenoFino !== undefined && contoFreno > opz.frenoFino) return false;
      return true;
    },
  };
}

/* quanti sospetti, e l'invariante del #137: il sospetto di ognuno E' il
   numero delle sue righe a -1 */
function invariante(db) {
  const rotte = [];
  for (const [id, a] of db.allenatore) {
    const conto = db.sfida.filter(s => s.attaccante === id && s.verificata === -1).length;
    if ((a.sospetto | 0) !== conto) rotte.push(id + ': sospetto ' + a.sospetto + ' contro ' + conto + ' righe');
  }
  return rotte;
}
const conta = (db, v) => db.sfida.filter(s => (s.verificata | 0) === v).length;
const sosp = (db, id) => (db.allenatore.get(id) || {}).sospetto | 0;

/* -------------------------------------------------------------------- */
(async () => {
  /* IL MODULO. Se non c'e', il banco NON esplode: dice rosso. Un
     cancello che esce 2 perche' la cosa da misurare non e' stata ancora
     scritta manderebbe a riparare il banco invece di scrivere la cura. */
  const viaS = path.resolve(RADICE, VIA_STAFFETTA);
  let S = null, guastoS = '';
  if (fs.existsSync(viaS)) { try { S = require(viaS); } catch (e) { guastoS = e.message; } }
  const haS = !!(S && typeof S.giro === 'function');

  /* rete/lib/verdetto.js e' un modulo ESM: si carica come in _q-sospetto */
  let V = null;
  const viaV = path.join(RADICE, 'rete', 'lib', 'verdetto.js');
  if (fs.existsSync(viaV)) { try { V = await import(urlmod.pathToFileURL(viaV).href); } catch (e) { V = null; } }
  const haV = !!(V && typeof V.applica === 'function');

  console.log('=== LA STAFFETTA — pesca, apre la misura giusta, giudica, rimanda (voce #138) ===');
  console.log('    processo misurato: ' + path.relative(RADICE, viaS).replace(/\\/g, '/'));
  if (!fs.existsSync(viaS)) console.log('    NON C\'E\' ANCORA: al compito 1 e\' cosi\' per costruzione.');
  else if (guastoS) console.log('    ROTTO — ' + guastoS);
  if (!haV) console.log('    rete/lib/verdetto.js: NON C\'E\' (il lato-database del banco)');

  /* UN TACCUINO NUOVO A OGNI CHIAMATA, e il perche' e' una trappola
     pagata il 22 settembre 2026: le scene di questo banco ricominciano
     gli id da 1, e il taccuino e' indicizzato per id. Con un file solo,
     la riga 1 della scena da sei faceva SALTARE la riga 1 della scena da
     tre, e cinque prove su trentadue misuravano il taccuino invece della
     staffetta — «giro pulito: zero verificate», cioe' un metro di
     paragone tarato sul niente. Chi vuole DUE giri sullo stesso taccuino
     se lo tiene in una variabile, come fanno D1, D2, D3b ed E1. */
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'staffetta-'));
  let nTacc = 0;
  const tacNuovo = () => haS ? S.taccuino(path.join(tmp, 'taccuino-' + (++nTacc) + '.json')) : null;

  /* ===================================================================
     LA SCENA: un gioco servito, un browser, e UNA sfida VERA giocata a
     1024x460 — la misura che non e' quella di serie.
     =================================================================== */
  let sg = null, ss = null, browser = null, vera = null;
  try {
    sg = await B.serviGioco('');
    ss = await B.serviServer();
    browser = await chromium.launch();
    const Bt = await B.apri(browser, sg.porta, { width: MISURA_2[0], height: MISURA_2[1] });
    const At = await B.apri(browser, sg.porta, { width: MISURA_2[0], height: MISURA_2[1] });
    const c = await At.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida'),
                                             giudice: typeof window.__test.giudica === 'function' }));
    if (!c.schermata || !c.giudice) {
      console.error('PROVA NULLA: questo gioco non ha la schermata della sfida o non ha giudica().');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    await B.collega(Bt, ss.porta, 'BORGATA');
    await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(Bt); await B.entra(At);
    await B.pubblica(Bt); await B.pubblica(At);
    const s = await B.giocaUna(At, ss, [], 24000, 0);
    await At.ctx.close(); await Bt.ctx.close();
    if (!(s.partita && s.riga)) {
      console.error('PROVA NULLA: la sfida a ' + MISURA_2.join('x') + ' non e\' arrivata al fischio finale.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    vera = { crudo: N.allarga(s.riga.replay), seme: s.riga.seme, taglia: s.riga.taglia | 0,
             gol_a: s.riga.gol_a | 0, gol_d: s.riga.gol_d | 0 };
    console.log('    sfida vera a ' + MISURA_2.join('x') + ': ' + vera.gol_a + '-' + vera.gol_d +
                ', seme ' + vera.seme + ', nastro ' + vera.crudo.length + ' byte crudi, schermo nel nastro ' +
                JSON.stringify(N.schermoDi(vera.crudo)));
    console.log('    sfida congelata a ' + FIX.schermo.join('x') + ': ' + FIX.gol_a + '-' + FIX.gol_d +
                ', seme ' + FIX.seme);
  } catch (e) {
    console.error('FALLITO (banco): ' + (e && e.stack || e));
    if (browser) await browser.close();
    if (sg) sg.chiudi(); if (ss) ss.chiudi();
    process.exit(2);
  }

  const CRUDO = N.allarga(FIX.replay);
  const indirizzo = 'http://127.0.0.1:' + sg.porta + '/CALCETTO-il-gioco.html';
  /* i due nastri costruiti devono esistere DAVVERO: senzaSchermo torna
     null se quel nastro non aveva una riga di tipo 10, e un banco che
     ci costruisse sopra una riga misurerebbe la stringa «null» */
  const SENZA_SCHERMO = N.senzaSchermo(CRUDO);
  if (!SENZA_SCHERMO || !CRUDO || CRUDO.indexOf('|') < 0) {
    console.error('PROVA NULLA: la sfida congelata non si e\' allargata, o non ha la riga di schermo ' +
                  'da togliere (rigenerarla con strumenti/_gen-nastro-duello-congelato.js).');
    await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
  }

  /* LE SEI RIGHE del giro completo, e ognuna esiste per un verdetto.
     Gli attaccanti sono tre: A onesto, B con due NON TORNA, C con la
     sfida vera. Cosi' il sospetto si puo' guardare per persona. */
  function scenaSei() {
    const db = bancoNuovo();
    for (const k of ['A', 'B', 'C', 'DIF']) allenatoreNuovo(db, k, 1000);
    const ids = {};
    ids.torna    = sfidaNuova(db, { att: 'A', dif: 'DIF', crudo: CRUDO, seme: FIX.seme, taglia: FIX.taglia,
                                    gol_a: FIX.gol_a, gol_d: FIX.gol_d, delta_a: -20, delta_d: 20 });
    ids.gonfio   = sfidaNuova(db, { att: 'B', dif: 'DIF', crudo: CRUDO, seme: FIX.seme, taglia: FIX.taglia,
                                    gol_a: FIX.gol_a + 1, gol_d: FIX.gol_d, delta_a: 20, delta_d: -10 });
    ids.seme     = sfidaNuova(db, { att: 'B', dif: 'DIF', crudo: CRUDO, seme: String(FIX.seme) + '7',
                                    taglia: FIX.taglia, gol_a: FIX.gol_a, gol_d: FIX.gol_d,
                                    delta_a: 18, delta_d: -9 });
    ids.motore   = sfidaNuova(db, { att: 'A', dif: 'DIF', crudo: N.altroMotore(CRUDO), seme: FIX.seme,
                                    taglia: FIX.taglia, gol_a: FIX.gol_a, gol_d: FIX.gol_d,
                                    delta_a: 0, delta_d: 0 });
    ids.vera     = sfidaNuova(db, { att: 'C', dif: 'DIF', crudo: vera.crudo, seme: vera.seme, taglia: vera.taglia,
                                    gol_a: vera.gol_a, gol_d: vera.gol_d, delta_a: 20, delta_d: -10 });
    ids.ignoto   = sfidaNuova(db, { att: 'A', dif: 'DIF', crudo: SENZA_SCHERMO, seme: FIX.seme,
                                    taglia: FIX.taglia, gol_a: FIX.gol_a, gol_d: FIX.gol_d,
                                    delta_a: 0, delta_d: 0 });
    return { db, ids };
  }

  /* LA SCENA CORTA dei gruppi D ed E: una misura sola, tre righe, un
     contesto. Le ripartenze e i freni non parlano di misure, e un giro
     in meno da 1,2 s per contesto e' un giro in meno per otto prove. */
  function scenaTre() {
    const db = bancoNuovo();
    for (const k of ['A', 'B', 'DIF']) allenatoreNuovo(db, k, 1000);
    const ids = {};
    ids.torna  = sfidaNuova(db, { att: 'A', dif: 'DIF', crudo: CRUDO, seme: FIX.seme, taglia: FIX.taglia,
                                  gol_a: FIX.gol_a, gol_d: FIX.gol_d, delta_a: -20, delta_d: 20 });
    ids.gonfio = sfidaNuova(db, { att: 'B', dif: 'DIF', crudo: CRUDO, seme: FIX.seme, taglia: FIX.taglia,
                                  gol_a: FIX.gol_a + 1, gol_d: FIX.gol_d, delta_a: 20, delta_d: -10 });
    ids.motore = sfidaNuova(db, { att: 'A', dif: 'DIF', crudo: N.altroMotore(CRUDO), seme: FIX.seme,
                                  taglia: FIX.taglia, gol_a: FIX.gol_a, gol_d: FIX.gol_d,
                                  delta_a: 0, delta_d: 0 });
    return { db, ids };
  }

  /* un giro, con i ripieghi buoni: se il modulo non c'e' si restituisce
     un referto vuoto invece di esplodere */
  const giro = async (banco, opz) => {
    if (!haS) return { pescate: 0, giudicate: 0, contesti: 0, esiti: [], misure: [], verdetti: {},
                       frenata: false, guasto: 'la staffetta non c\'e\'' };
    try {
      return await S.giro(Object.assign({ banco, browser, indirizzo, pausa: 0, tetto: 50 }, opz || {}));
    } catch (e) { return { pescate: 0, giudicate: 0, contesti: 0, esiti: [], misure: [], verdetti: {},
                           frenata: false, guasto: 'ESPLOSA: ' + e.message }; }
  };
  const verdettoDi = (ref, id) => {
    const e = (ref.esiti || []).find(x => x && x.id === id);
    return e ? e.verdetto + (e.causa ? '/' + e.causa : '') : '—';
  };

  try {
    /* =================================================================
       A) LA FORMA
       ================================================================= */
    if (vuole('A')) {
      titolo('A) LA FORMA — il modulo, la misura letta dal nastro, il raggruppamento');

      di(haS && typeof S.giro === 'function' && typeof S.misuraDelNastro === 'function' &&
         typeof S.raggruppa === 'function' && typeof S.taccuino === 'function' &&
         typeof S.bancoVero === 'function',
         'A1) il modulo esiste ed espone giro, misuraDelNastro, raggruppa, taccuino, bancoVero',
         haS ? Object.keys(S).sort().join(' ') : (guastoS || 'non c\'e\''));

      const m1 = haS ? S.misuraDelNastro(CRUDO) : null;
      const m0 = haS ? S.misuraDelNastro(N.senzaSchermo(CRUDO)) : 'x';
      di(!!m1 && m1[0] === MISURA_1[0] && m1[1] === MISURA_1[1] && m0 === null,
         'A2) la misura si legge dal nastro PRIMA di aprire il browser, e senza riga di tipo 10 e\' null',
         (m1 ? m1.join('x') : 'null') + ' / ' + (m0 === null ? 'null' : String(m0)));

      /* e si legge anche dal nastro STRETTO, che e' la forma vera */
      const mS = haS ? S.misuraDelNastro(stringi(CRUDO)) : null;
      di(!!mS && mS[0] === MISURA_1[0] && mS[1] === MISURA_1[1],
         'A3) e si legge anche dal nastro STRETTO come sta nel database (deflate-raw + base64url)',
         mS ? mS.join('x') : 'null');

      const { db } = scenaSei();
      const gr = haS ? S.raggruppa(db.sfida.map(s => ({ ...s }))) : [];
      const chiavi = gr.map(g => g.chiave);
      di(gr.length === 3 && chiavi[0] === '915x412' && chiavi[1] === '1024x460' && chiavi[2] === 'ignota' &&
         gr[0].righe.length === 4 && gr[1].righe.length === 1 && gr[2].righe.length === 1,
         'A4) sei righe diventano TRE gruppi, in ordine di prima apparizione, e i nastri senza schermo stanno a parte',
         chiavi.map((c, i) => c + ':' + gr[i].righe.length).join(' · ') || 'nessun gruppo');

      /* IL RIFIUTO SENZA CREDENZIALI. Non e' una cortesia: una staffetta
         che parte senza chiave e non lo dice pesca zero righe e riferisce
         «niente da fare», cioe' mente col silenzio. */
      let rifiuto = '';
      if (haS) { try { S.bancoVero({ url: '', chiave: '' }); rifiuto = 'NON HA RIFIUTATO'; }
                 catch (e) { rifiuto = e.message; } }
      di(haS && /credenzial|SUPABASE|chiave/i.test(rifiuto),
         'A5) senza SUPABASE_URL e SUPABASE_SERVICE_KEY la staffetta si RIFIUTA di partire, e dice perche\'',
         rifiuto || 'il modulo non c\'e\'');
    }

    /* =================================================================
       B) IL GIRO COMPLETO
       ================================================================= */
    let refSei = null, scSei = null;
    if (vuole('B') || vuole('C')) {
      titolo('B) IL GIRO COMPLETO — sei righe, quattro verdetti, e i punti che tornano indietro');
      scSei = scenaSei();
      const puntiBprima = scSei.db.punti.get('B').punti;
      const banco = bancoFinto(scSei.db, V, {});
      refSei = await giro(banco, { taccuino: tacNuovo() });
      if (refSei.guasto) info('guasto del giro:', refSei.guasto);
      info('verdetti:', (refSei.esiti || []).map(e => '#' + e.id + ' ' + e.verdetto +
        (e.causa ? '/' + e.causa : '')).join(' · ') || 'nessuno');
      info('misure aperte:', (refSei.misure || []).map(m => m.chiave + '(' + m.righe + ' righe, ' +
        m.ms + ' ms)').join(' · ') || 'nessuna');

      const attesi = [
        [scSei.ids.torna, 'TORNA'], [scSei.ids.vera, 'TORNA'],
        [scSei.ids.gonfio, 'NON TORNA'], [scSei.ids.seme, 'NON TORNA'],
        [scSei.ids.motore, 'ALTRO MOTORE'], [scSei.ids.ignoto, 'INCOMPLETO'],
      ];
      const storti = attesi.filter(([id, v]) => verdettoDi(refSei, id).split('/')[0] !== v)
        .map(([id, v]) => '#' + id + ' atteso ' + v + ' avuto ' + verdettoDi(refSei, id));
      di(haV && storti.length === 0 && (refSei.esiti || []).length === 6,
         'B1) i sei nastri danno i quattro verdetti attesi, uno per uno',
         storti.length ? storti.join(' | ') : ((refSei.esiti || []).length + ' righe giudicate'));

      di(conta(scSei.db, 1) === 2 && conta(scSei.db, -1) === 2 && conta(scSei.db, 0) === 2,
         'B2) due righe si chiudono a 1, due a -1, e i due «non lo so» restano APERTE a 0',
         'verificata 1:' + conta(scSei.db, 1) + ' -1:' + conta(scSei.db, -1) + ' 0:' + conta(scSei.db, 0));

      di(sosp(scSei.db, 'B') === 2 && sosp(scSei.db, 'A') === 0 && sosp(scSei.db, 'C') === 0,
         'B3) il sospetto sale SOLO su chi ha i NON TORNA, e di uno per riga: B=2, A=0, C=0',
         'A=' + sosp(scSei.db, 'A') + ' B=' + sosp(scSei.db, 'B') + ' C=' + sosp(scSei.db, 'C'));

      /* e la guardia contro il verde gentile: quattro conti a zero
         tornano sempre, e un giro che non e' successo non e' una prova */
      const rotte = invariante(scSei.db);
      const sospTot = ['A', 'B', 'C'].reduce((s, k) => s + sosp(scSei.db, k), 0);
      di(haV && rotte.length === 0 && sospTot > 0,
         'B4) L\'INVARIANTE del #137 regge dopo il giro: il sospetto di ognuno E\' il numero delle sue righe a -1',
         rotte.length ? rotte.join(' | ') : (sospTot + ' sospetti in tutto, quattro conti su quattro'));

      di(scSei.db.punti.get('B').punti === puntiBprima - 38,
         'B5) i punti delle due sfide non-torna tornano indietro per intero (delta 20 + 18)',
         puntiBprima + ' -> ' + scSei.db.punti.get('B').punti + ', atteso ' + (puntiBprima - 38));

      const parole = banco.log.segna.map(x => x.parola);
      di(parole.length === 6 && parole.every(p => VERDETTI.includes(p)),
         'B6) la staffetta manda LA PAROLA, non un numero: sei chiamate, sei parole della tavola dei cinque',
         parole.join(' · ') || 'nessuna chiamata');

      /* IL QUINTO VERDETTO. Il tetto della rigiocata si puo' SOLO
         stringere (Math.min(pieno, tetto) dentro giudica) e NON FINISCE
         non muove punti: un tetto stretto non puo' far danno a nessuno. */
      const scNF = scenaTre();
      const bancoNF = bancoFinto(scNF.db, V, {});
      const refNF = await giro(bancoNF, { taccuino: tacNuovo(), fotogrammi: 300 });
      const vNF = verdettoDi(refNF, scNF.ids.torna).split('/')[0];
      di(vNF === 'NON FINISCE' && conta(scNF.db, -1) === 0 && sosp(scNF.db, 'A') === 0,
         'B7) col tetto della rigiocata a 300 fotogrammi il verdetto e\' NON FINISCE, e non accusa NESSUNO',
         vNF + ', righe a -1: ' + conta(scNF.db, -1) + ', sospetto A ' + sosp(scNF.db, 'A'));
    }

    /* =================================================================
       C) LA MISURA GIUSTA
       ================================================================= */
    if (vuole('C')) {
      titolo('C) LA MISURA GIUSTA — una sfida vera a 1024x460, e la finestra che la staffetta apre');

      di(verdettoDi(refSei, scSei.ids.vera) === 'TORNA',
         'C1) la sfida registrata a ' + MISURA_2.join('x') + ' TORNA: la staffetta ha aperto QUELLA finestra, non la sua',
         verdettoDi(refSei, scSei.ids.vera) + ' (a ' + MISURA_1.join('x') + ' sarebbe INCOMPLETO/schermo-diverso)');

      const apr = (refSei.misure || []).map(m => m.chiave);
      di(apr.includes('1024x460') && apr.includes('915x412'),
         'C2) fra le finestre aperte ci sono tutte e due le misure dichiarate dai nastri',
         apr.join(' · ') || 'nessuna');

      di(verdettoDi(refSei, scSei.ids.ignoto) === 'INCOMPLETO/schermo-ignoto' &&
         scSei.db.sfida[scSei.ids.ignoto - 1].verificata === 0 && sosp(scSei.db, 'A') === 0,
         'C3) un nastro SENZA riga di schermo e\' INCOMPLETO/schermo-ignoto, resta aperto e non accusa — MAI NON TORNA',
         verdettoDi(refSei, scSei.ids.ignoto) + ', verificata ' + scSei.db.sfida[scSei.ids.ignoto - 1].verificata);

      di((refSei.contesti | 0) === 3 && (refSei.esiti || []).length === 6,
         'C4) si apre UN contesto per misura e non uno per riga: tre contesti per sei righe',
         refSei.contesti + ' contesti, ' + (refSei.esiti || []).length + ' righe');

      /* IL CONTROFATTUALE, misurato e non raccontato: lo stesso nastro
         giudicato alla misura di serie. Senza questa riga «apre la
         misura giusta» sarebbe un racconto — e sarebbe verde anche su
         una staffetta che apre sempre 915x412, perche' quattro righe su
         sei quella misura ce l'hanno. */
      const scU = bancoNuovo();
      allenatoreNuovo(scU, 'C', 1000); allenatoreNuovo(scU, 'DIF', 1000);
      const idU = sfidaNuova(scU, { att: 'C', dif: 'DIF', crudo: vera.crudo, seme: vera.seme,
                                    taglia: vera.taglia, gol_a: vera.gol_a, gol_d: vera.gol_d,
                                    delta_a: 20, delta_d: -10 });
      const bancoU = bancoFinto(scU, V, {});
      const refU = await giro(bancoU, { taccuino: tacNuovo(), misuraFissa: MISURA_1 });
      const vU = verdettoDi(refU, idU);
      di(vU === 'INCOMPLETO/schermo-diverso' && scU.sfida[idU - 1].verificata === 0,
         'C5) LO STESSO nastro, aperto di forza a ' + MISURA_1.join('x') + ', si rifiuta con schermo-diverso — non accusa',
         vU + ', verificata ' + scU.sfida[idU - 1].verificata);
    }

    /* =================================================================
       D) LA RIPARTENZA E L'IDEMPOTENZA
       ================================================================= */
    if (vuole('D')) {
      titolo('D) LA RIPARTENZA — muore a meta\', riparte, e non perde ne\' raddoppia niente');

      /* il giro PULITO, il metro di paragone */
      const pul = scenaTre();
      const bPul = bancoFinto(pul.db, V, {});
      await giro(bPul, { taccuino: tacNuovo() });
      const metro = { uno: conta(pul.db, 1), meno: conta(pul.db, -1), zero: conta(pul.db, 0),
                      sospB: sosp(pul.db, 'B'), puntiB: pul.db.punti.get('B').punti };
      info('giro pulito:', 'verificata 1:' + metro.uno + ' -1:' + metro.meno + ' 0:' + metro.zero +
           ', sospetto B ' + metro.sospB + ', punti B ' + metro.puntiB);

      /* D1 — LA RISPOSTA PERSA: la chiamata e' arrivata, l'esito no.
         E' il caso pericoloso, perche' la staffetta non sa di aver vinto. */
      const d1 = scenaTre();
      const t1 = tacNuovo();
      const b1a = bancoFinto(d1.db, V, { esplodeDopo: d1.ids.gonfio });
      const r1a = await giro(b1a, { taccuino: t1 });
      const b1b = bancoFinto(d1.db, V, {});
      const r1b = await giro(b1b, { taccuino: t1 });
      /* SI CONTANO I GIUDIZI, non le chiamate al database: «giudicare due
         volte» e' il lavoro sprecato, e una staffetta che giudicasse due
         volte e mandasse una volta sola avrebbe lo stesso difetto. */
      const tutti1 = [...(r1a.esiti || []), ...(r1b.esiti || [])].map(x => x.id);
      const doppi1 = tutti1.filter((x, i) => tutti1.indexOf(x) !== i);
      di(!!r1a.guasto && doppi1.length === 0 &&
         new Set(tutti1).size === 3 &&
         conta(d1.db, 1) === metro.uno && conta(d1.db, -1) === metro.meno &&
         sosp(d1.db, 'B') === metro.sospB && d1.db.punti.get('B').punti === metro.puntiB,
         'D1) la risposta persa: il giro si ferma, quello dopo finisce il lavoro, e lo stato e\' quello del giro pulito',
         'giudicate ' + tutti1.join(',') + ', doppie ' + (doppi1.length || 'nessuna') +
         ', sospetto B ' + sosp(d1.db, 'B') + ' (pulito ' + metro.sospB + ')');

      /* D2 — LA CHIAMATA MAI PARTITA: la riga resta aperta, e DEVE
         tornare. Qui una rigiocata in piu' e' giusta: meglio ripetere
         che perdere, perche' la guardia della struttura la rende
         innocua. */
      const d2 = scenaTre();
      const t2 = tacNuovo();
      const b2a = bancoFinto(d2.db, V, { esplodePrima: d2.ids.gonfio });
      const r2a = await giro(b2a, { taccuino: t2 });
      const b2b = bancoFinto(d2.db, V, {});
      const r2b = await giro(b2b, { taccuino: t2 });
      const tutti2 = [...(r2a.esiti || []), ...(r2b.esiti || [])].map(x => x.id);
      const doppi2 = tutti2.filter((x, i) => tutti2.indexOf(x) !== i);
      di(!!r2a.guasto && doppi2.length === 1 && doppi2[0] === d2.ids.gonfio &&
         new Set(tutti2).size === 3 &&
         conta(d2.db, 1) === metro.uno && conta(d2.db, -1) === metro.meno &&
         sosp(d2.db, 'B') === metro.sospB && d2.db.punti.get('B').punti === metro.puntiB,
         'D2) la chiamata mai partita: quella riga — e SOLO quella — si rigiudica, e lo stato finale non cambia',
         'giudicate ' + tutti2.join(',') + ', doppie ' + (doppi2.join(',') || 'nessuna') +
         ', sospetto B ' + sosp(d2.db, 'B'));

      /* D3 — IL TACCUINO CANCELLATO. Cambia il LAVORO, non l'ESITO: a
         proteggere e' la struttura, non il quaderno. */
      const d3 = scenaTre();
      const b3a = bancoFinto(d3.db, V, {});
      await giro(b3a, { taccuino: tacNuovo() });
      const b3b = bancoFinto(d3.db, V, {});
      const r3b = await giro(b3b, { taccuino: tacNuovo() });
      di((r3b.esiti || []).length > 0 && conta(d3.db, 1) === metro.uno && conta(d3.db, -1) === metro.meno &&
         sosp(d3.db, 'B') === metro.sospB && d3.db.punti.get('B').punti === metro.puntiB &&
         invariante(d3.db).length === 0,
         'D3) col taccuino cancellato il secondo giro rifa\' il lavoro degli ingiudicabili, ma l\'esito e\' identico',
         'secondo giro: ' + (r3b.esiti || []).length + ' righe rigiudicate, sospetto B ' + sosp(d3.db, 'B') +
         ', punti B ' + d3.db.punti.get('B').punti);

      /* D3b — e col taccuino INTATTO quelle righe non si rimacinano */
      const d3b = scenaTre();
      const t3b = tacNuovo();
      const b3c = bancoFinto(d3b.db, V, {});
      await giro(b3c, { taccuino: t3b });
      const b3d = bancoFinto(d3b.db, V, {});
      const r3d = await giro(b3d, { taccuino: t3b });
      di((r3d.esiti || []).length === 0 && (r3d.contesti | 0) === 0 && (r3d.saltate | 0) > 0,
         'D3b) col taccuino INTATTO il giro dopo non rimacina gli ingiudicabili: zero contesti, zero giudizi',
         (r3d.saltate | 0) + ' saltate, ' + (r3d.esiti || []).length + ' rigiudicate, ' + (r3d.contesti | 0) + ' contesti');

      /* D4 — DUE STAFFETTE CHE PESCARONO INSIEME: la pesca stantia
         riporta righe che l'altra ha gia' chiuso. E' l'unico caso in cui
         la GUARDIA della struttura (`and verificata = 0`) viene davvero
         esercitata, ed e' la ragione per cui esiste. */
      const d4 = scenaTre();
      const fotoIds = d4.db.sfida.map(s => s.id);
      const b4a = bancoFinto(d4.db, V, {});
      await giro(b4a, { taccuino: tacNuovo() });
      const sospDopoUno = sosp(d4.db, 'B'), puntiDopoUno = d4.db.punti.get('B').punti;
      const b4b = bancoFinto(d4.db, V, { pescaFissa: fotoIds });
      await giro(b4b, { taccuino: tacNuovo() });
      di(b4b.log.segna.length === 3 && sosp(d4.db, 'B') === sospDopoUno &&
         d4.db.punti.get('B').punti === puntiDopoUno && invariante(d4.db).length === 0,
         'D4) due staffette che pescarono insieme: la seconda rimanda tutto, e la guardia non fa disfare niente due volte',
         'rimandate ' + b4b.log.segna.length + ', sospetto B ' + sospDopoUno + '->' + sosp(d4.db, 'B') +
         ', punti B ' + puntiDopoUno + '->' + d4.db.punti.get('B').punti);

      /* D5 — un giro su un database senza niente da fare non deve
         aprire un browser per dirlo */
      const d5 = scenaTre();
      for (const s of d5.db.sfida) s.verificata = 1;
      const b5 = bancoFinto(d5.db, V, {});
      const r5 = await giro(b5, { taccuino: tacNuovo() });
      /* LA GUARDIA CONTRO IL VERDE GENTILE: una staffetta che non esiste
         non apre contesti e non chiama nessuno, e non e' una virtu'. La
         prova chiede anche che il giro sia arrivato in fondo SENZA
         guasti e che il banco abbia davvero pescato. */
      di((r5.pescate | 0) === 0 && (r5.contesti | 0) === 0 && b5.log.segna.length === 0 &&
         !r5.guasto && b5.log.pesca > 0,
         'D5) niente da verificare: zero contesti aperti, zero chiamate, e nessun guasto',
         (r5.pescate | 0) + ' pescate in ' + b5.log.pesca + ' interrogazioni, ' +
         (r5.contesti | 0) + ' contesti, guasto: ' + (r5.guasto || 'nessuno'));
    }

    /* =================================================================
       E) IL RITMO E I FRENI
       ================================================================= */
    if (vuole('E')) {
      titolo('E) IL RITMO E I FRENI — la staffetta non passa da nessun endpoint, quindi si frena da se\'');

      /* E1 — il freno che dice no alla terza riga */
      const e1 = scenaTre();
      const tE = tacNuovo();
      const bE1 = bancoFinto(e1.db, V, { frenoFino: 2 });
      const rE1 = await giro(bE1, { taccuino: tE });
      const apertePrima = conta(e1.db, 0);
      di(!!rE1.frenata && bE1.log.segna.length === 2 && apertePrima >= 1,
         'E1) quando il freno del database dice no la staffetta SI FERMA: due righe rimandate, il resto resta a 0',
         'frenata=' + !!rE1.frenata + ', rimandate ' + bE1.log.segna.length + ', ancora aperte ' + apertePrima);

      const bE1b = bancoFinto(e1.db, V, {});
      const rE1b = await giro(bE1b, { taccuino: tE });
      di(bE1b.log.segna.length >= 1 && !rE1b.frenata,
         'E1b) e col freno aperto il giro dopo riprende le righe che erano rimaste',
         bE1b.log.segna.length + ' rimandate, verificata 0 rimaste ' + conta(e1.db, 0));

      /* E2 — il tetto per giro */
      const e2 = scenaTre();
      const bE2 = bancoFinto(e2.db, V, {});
      const rE2 = await giro(bE2, { taccuino: tacNuovo(), tetto: 2 });
      di((rE2.pescate | 0) === 2 && bE2.log.segna.length === 2,
         'E2) --tetto 2 pesca due righe e due sole: il piano gratuito non si svuota per distrazione',
         (rE2.pescate | 0) + ' pescate, ' + bE2.log.segna.length + ' rimandate');

      /* E3 — LA PROVA A VUOTO: giudica e non muove niente. E' il modo di
         guardare prima di far togliere punti a qualcuno. */
      const e3 = scenaTre();
      const bE3 = bancoFinto(e3.db, V, {});
      const rE3 = await giro(bE3, { taccuino: tacNuovo(), asciutto: true });
      di((rE3.esiti || []).length === 3 && bE3.log.segna.length === 0 &&
         conta(e3.db, 0) === 3 && sosp(e3.db, 'B') === 0,
         'E3) --asciutto: giudica tutto e NON manda niente — tre verdetti, zero chiamate, database fermo',
         (rE3.esiti || []).length + ' verdetti, ' + bE3.log.segna.length + ' chiamate, righe aperte ' + conta(e3.db, 0));

      /* E4 — IL RITMO, DICHIARATO. La staffetta si impone da se' un tetto
         di FRENO_TETTO righe al minuto (il freno del database, che vale
         anche fra due staffette lanciate insieme). Se la pausa di serie
         non bastasse a starci sotto, la staffetta sbatterebbe sul
         proprio freno a ogni giro: sarebbe corretto ma stupido. */
      const ms = refSei ? refSei : { ms: 0, msGiudizio: 0, msContesto: 0, contesti: 0 };
      const pausaSerie = haS ? (S.PAUSA | 0) : 0;
      const tettoFreno = haS ? (S.FRENO_TETTO | 0) : 0;
      const perMin = ms.msGiudizio > 0 && (ms.msGiudizio + pausaSerie) > 0
        ? Math.round(60000 / (ms.msGiudizio + pausaSerie)) : 0;
      info('ritmo misurato su questa macchina:',
           'contesto ' + (ms.msContesto | 0) + ' ms, giudizio ' + (ms.msGiudizio | 0) + ' ms, ' +
           'giro di sei righe ' + (ms.ms | 0) + ' ms');
      info('con la pausa di serie (' + pausaSerie + ' ms):',
           'circa ' + perMin + ' righe al minuto, 2 chiamate al database per riga piu\' una per giro');
      di((ms.msGiudizio | 0) > 0 && perMin > 0 && tettoFreno > 0 && perMin <= tettoFreno,
         'E4) col respiro di serie il ritmo sta sotto il tetto che la staffetta si impone da se\'',
         perMin + ' righe/minuto contro un tetto di ' + tettoFreno);
    }

    /* =================================================================
       F) LE PORTE E LA CHIAVE
       ================================================================= */
    if (vuole('F')) {
      titolo('F) LE PORTE E LA CHIAVE — la staffetta non apre niente, e non stampa niente');

      const apiDir = path.join(RADICE, 'rete', 'api');
      const api = fs.existsSync(apiDir) ? fs.readdirSync(apiDir).filter(f => f.endsWith('.js')) : [];
      di(api.length === 5,
         'F1) gli endpoint sono ancora CINQUE: la staffetta non e\' un endpoint e non ne apre uno',
         api.join(', '));

      const schema = fs.existsSync(path.join(RADICE, 'rete', 'schema.sql'))
        ? fs.readFileSync(path.join(RADICE, 'rete', 'schema.sql'), 'utf8') : '';
      di(/revoke all on function\s+segna_verdetto\s*\(\s*bigint\s*,\s*text\s*\)/i.test(schema),
         'F2) segna_verdetto resta REVOCATA ad anon e authenticated: si chiama solo con la chiave di servizio',
         schema ? 'revoke presente' : 'schema.sql non letto');

      /* F3 — LA CHIAVE NON SI STAMPA. Si prova sbattendo la staffetta
         contro una porta chiusa e leggendo il messaggio che ne esce. */
      const SEGRETO = 'CHIAVE-FINTA-DA-NON-STAMPARE-138';
      let messaggio = '';
      if (haS) {
        try {
          const bv = S.bancoVero({ url: 'http://127.0.0.1:1/nessuno', chiave: SEGRETO });
          await bv.pesca(5);
          messaggio = 'NON HA FALLITO';
        } catch (e) { messaggio = String(e && (e.stack || e.message) || e); }
      }
      di(haS && messaggio.length > 0 && messaggio.indexOf(SEGRETO) < 0,
         'F3) quando il database non risponde, la chiave NON compare nel messaggio di guasto',
         messaggio ? messaggio.slice(0, 80).replace(/\n/g, ' ') : 'il modulo non c\'e\'');

      /* F4 — e non e' nel repo. Si guardano i file TRACCIATI, perche'
         quelli sono gli unici che viaggiano. */
      const tracciati = (() => {
        try { return require('child_process').execSync('git ls-files', { cwd: RADICE, encoding: 'utf8' })
          .split('\n').map(s => s.trim()).filter(Boolean); } catch (e) { return []; }
      })();
      const sospetti = [];
      for (const f of tracciati) {
        const p = path.join(RADICE, f);
        let st; try { st = fs.statSync(p); } catch (e) { continue; }
        if (!st.isFile() || st.size > 4 * 1024 * 1024) continue;
        let t; try { t = fs.readFileSync(p, 'utf8'); } catch (e) { continue; }
        /* una chiave di servizio e' un JWT: tre pezzi base64url separati
           da un punto, e i primi due cominciano per `eyJ` */
        if (/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\./.test(t)) sospetti.push(f + ' (jwt)');
        /* o una variabile assegnata a un valore lungo invece che letta
           dall'ambiente. La soglia di trenta caratteri non e' pigrizia:
           i banchi del repo assegnano credenziali FINTE e corte apposta
           (`_q-sigillo.js` mette 'chiave-di-carta', quindici lettere),
           e un cancello che le chiamasse chiavi urlerebbe al lupo ogni
           giorno finche' nessuno lo guarda piu'. Una chiave di servizio
           Supabase e' un JWT da duecento caratteri. */
        if (/SUPABASE_SERVICE_KEY\s*[=:]\s*['"][A-Za-z0-9_\-.]{30,}['"]/.test(t))
          sospetti.push(f + ' (assegnata a un valore lungo)');
      }
      di(tracciati.length > 0 && sospetti.length === 0,
         'F4) nessuna chiave di servizio dentro i ' + tracciati.length + ' file tracciati del repo',
         sospetti.length ? sospetti.slice(0, 3).join(', ') : 'zero su ' + tracciati.length);
    }
  } catch (e) {
    console.error('FALLITO (banco): ' + (e && e.stack || e));
    await browser.close(); sg.chiudi(); ss.chiudi();
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (x) {}
    process.exit(2);
  }

  await browser.close(); sg.chiudi(); ss.chiudi();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log('\n' + (ok + no) + ' controlli, ' + ok + ' passati, ' + no + ' falliti');
  process.exit(no ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + (e && e.stack ? e.stack : e)); process.exit(2); });
