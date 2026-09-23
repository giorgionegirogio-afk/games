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
     · POSTGREST SI INTERROGA, MA E' FINTO (gruppo G). Il filo — la via,
       i filtri, le intestazioni, i nomi degli argomenti — si misura
       contro un http che parla la FORMA di PostgREST, con sotto lo
       stesso database in memoria. Quel che NON si misura e' il Postgres
       vero: se un giorno la funzione cambiasse firma nello schema, qui
       non si vedrebbe.
     · IL RITMO e' misurato su QUESTA macchina, non su un CI: i numeri
       sono un ordine di grandezza, non un contratto.
     · QUATTRO COMPORTAMENTI DELLA STAFFETTA NON HANNO UNA PROVA, e si
       elencano invece di lasciarli scoprire: il ripiego del FRENO ROTTO
       (se `/rpc/frena` non risponde il giro va avanti, come in
       comuni.js: «un freno rotto che chiude il gioco sarebbe peggio del
       traffico che doveva evitare»); la bandiera `--riprova`, che
       ignora il taccuino; `--gioco`, che punta la staffetta a un'altra
       copia del gioco; e il rifiuto di `serviGioco` quando il file non
       c'e'. Tutti e quattro hanno la stessa forma: al peggio fanno
       lavoro in piu' o non partono, e nessuno dei quattro puo' muovere
       un punto.
     · SI GIRA A TAGLIA 5, e non e' una svista: il determinismo pieno
       vale li' (voce #98, `rebuildCrowd` consuma PRNG in proporzione al
       campo). Che il GIUDICE torni anche a 7 e a 11 e' misurato
       altrove, da `giudice` — 14 partite oneste su 14 nelle tre taglie,
       zero falsi NON TORNA (voce #133). Questo banco misura il GIRO, e
       il giro non cambia con la taglia: cambia il tetto della rigiocata,
       che e' del giudice.

   I SETTE GRUPPI
     A) LA FORMA          il modulo, la misura letta dal nastro, il
                          raggruppamento, il rifiuto senza credenziali
     B) IL GIRO COMPLETO  sei sfide finte, quattro verdetti diversi, e
                          il quinto (NON FINISCE) in un giro a parte
     C) LA MISURA GIUSTA  una sfida VERA giocata a 1024x460 dentro
                          questa corsa: deve TORNARE, e torna solo se la
                          staffetta ha aperto QUELLA finestra. Piu' la
                          FINESTRA NEGATA: se la misura chiesta non si
                          ottiene, la colpa e' della macchina e non del
                          nastro, e quella riga non deve finire nel
                          taccuino — il giro dopo la riprende
     D) LA RIPARTENZA     muore a meta' in due modi diversi, riparte:
                          nessuna riga persa, nessuna giudicata due
                          volte, e la guardia della struttura regge
                          anche con due staffette che pescarono insieme
     E) IL RITMO          il freno che dice no, il tetto per giro, la
                          prova a vuoto — che giudica, non manda niente
                          e NON avvelena il taccuino — e i millisecondi
     F) LE PORTE          cinque endpoint, la funzione ancora revocata,
                          la chiave che non si stampa e non e' nel repo
     G) IL FILO           `bancoVero` contro un server che parla la
                          forma di PostgREST: la via, i filtri, le
                          intestazioni, i nomi degli argomenti — e il
                          programma VERO lanciato come si lancia

   SA FALLIRE, e si dice QUALI prove lo sanno e quali no. DIECI falsi
   (`_crit-staffetta-*`), ognuno costruito nel caso peggiore, ognuno
   bocciato dalla sua prova — misurato il 22 settembre 2026. La lista
   per esteso di cio' che ciascuno morde sta in testa al suo file.

   E DUE DI LORO HANNO RIPARATO IL BANCO PRIMA DI ESSERNE BOCCIATI, che
   e' la ragione per cui i falsi si costruiscono invece di raccontarli:
     · `cieca` PASSAVA C2. La prova leggeva la chiave del gruppo — cioe'
       quel che il NASTRO dichiara — invece della finestra aperta
       davvero.
     · `filo` PASSAVA G7. La prova lanciava `strumenti/staffetta.js` per
       percorso fisso, quindi provava sempre quella onesta qualunque
       cosa le si puntasse contro con `--staffetta`.
   Due righe che attestavano invece di misurare, in un banco scritto per
   non farlo. A trovarle non e' stato chi le ha scritte.

   E NESSUN FALSO CONDANNA, e sono QUATTORDICI su quarantadue,
   misurate e non stimate: A1 A2 A3 A5 · D2 D5 · E3 E4 · F1 F2 F3 F4 ·
   G2 G5. I gruppi A ed F sono guardie
   di FORMA e di PORTE — dicono che il modulo esiste e che questo
   cantiere non ha aperto niente — e restano verdi anche senza la
   staffetta (tre su tre nella corsa del compito 1): non provano il giro,
   e non devono sembrare di provarlo. Le altre provano comportamenti che
   nessuno dei nove guasta; un falso in piu' per ognuna si puo' scrivere
   il giorno in cui uno di quei numeri si muove.

   E QUATTRO FALSI SONO NATI DALLA DOMANDA OPPOSTA — *quale asserzione,
   qui dentro, non ha un giudice?* — che e' la stessa disciplina vista
   dall'altro capo: `sprecona` per C4 (l'unica asserzione che nessun
   altro condannava), `filo` per tutto il gruppo G, `rassegnata` per
   C6/C6b (la finestra negata: una regola scritta in tre documenti e
   misurata in nessuno), `avvelenata` per E3b. Un'asserzione senza falso
   e' un attestato.

   E L'ULTIMA DI QUELLE QUATTRO HA TROVATO UN DIFETTO VERO, non un buco
   del banco: la staffetta scriveva nel taccuino anche durante il giro a
   VUOTO (`--asciutto`). Il giro a vuoto giudica e non manda niente,
   quindi quelle righe restano a `verificata = 0`: messe nel taccuino,
   il giro vero del giorno dopo le avrebbe SALTATE, e non le avrebbe
   guardate mai piu' nessuno. Non sbagliava niente: dimenticava. Curato
   al compito 3, e adesso ha la sua prova (E3b) e il suo falso.

   uso:  node strumenti/_q-staffetta.js
         node strumenti/_q-staffetta.js --staffetta fuori/staffetta-accusa.js
         node strumenti/_q-staffetta.js --solo A,B
   `--solo` serve a guardare, non a giudicare: C ed E4 leggono il giro
   del gruppo B, e chiesti da soli non hanno niente da leggere. Il verde
   che conta e' quello della corsa intera.
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se la sfida vera non arriva al fischio finale (prova non fatta).
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const http = require('http');
const path = require('path');
const zlib = require('zlib');
const urlmod = require('url');
const { spawn } = require('child_process');
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
const gruppiChiesti = String(arg('solo', 'A,B,C,D,E,F,G')).toUpperCase().split(',').map(s => s.trim());
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

/* =====================================================================
   IL SERVER FINTO CHE PARLA POSTGREST — il filo, senza Internet.

   PERCHE' ESISTE. `bancoVero` e' l'unico pezzo della staffetta che parla
   col mondo, ed e' anche l'unico che, senza questo, nessuno proverebbe:
   una `l` di troppo in `verificata=eq.0`, o un `id` scritto dove il
   database vuole `s_id`, e la staffetta gira per sempre senza chiudere
   una riga — senza un rosso da nessuna parte, perche' tutto il resto
   funziona.

   NON E' UN POSTGRES, E VA DETTO: e' un http che parla la FORMA di
   PostgREST — i filtri `eq.`/`gt.`, l'`order`, il `limit`, il `select`,
   e le funzioni sotto `/rpc/` che tornano un ARRAY perche' in SQL
   `segna_verdetto` e' un `returns table`. Sotto ci sta il database in
   memoria di questo banco e `applica()` di rete/lib/verdetto.js, come
   per il banco finto. Quel che si misura e' IL FILO: la via, i filtri,
   le intestazioni, i nomi degli argomenti. Quel che non si misura resta
   l'SQL vero, e resta dichiarato.

   E RIFIUTA COME RIFIUTEREBBE POSTGREST: un argomento con il nome
   sbagliato non e' un silenzio, e' un 400 «Could not find the function
   ... in the schema cache». E' il modo in cui il difetto si vedrebbe
   davvero, e il falso `filo` e' costruito apposta per infilarcisi.
   ===================================================================== */
function serviPostgrest(db, V, opz) {
  opz = opz || {};
  const log = { richieste: [] };
  let frenaConta = 0;
  const s = http.createServer(async (req, res) => {
    const pezzi = req.url.split('?');
    const via = pezzi[0], query = pezzi[1] || '';
    let corpo = '';
    if (req.method !== 'GET') { for await (const p of req) corpo += p; }
    log.richieste.push({ metodo: req.method, via, query,
                         auth: req.headers.authorization || '', apikey: req.headers.apikey || '', corpo });
    const di = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };

    if (via === '/rest/v1/sfida' && req.method === 'GET') {
      const p = new URLSearchParams(query);
      let righe = db.sfida.slice();
      const ver = p.get('verificata');
      if (ver) { const m = /^eq\.(-?\d+)$/.exec(ver); if (m) righe = righe.filter(x => (x.verificata | 0) === +m[1]); }
      const idf = p.get('id');
      if (idf) { const m = /^gt\.(\d+)$/.exec(idf); if (m) righe = righe.filter(x => x.id > +m[1]); }
      if (p.get('order') === 'id.asc') righe.sort((a, b) => a.id - b.id);
      const lim = parseInt(p.get('limit') || '0', 10);
      if (lim > 0) righe = righe.slice(0, lim);
      const sel = String(p.get('select') || '*');
      if (sel === '*') return di(200, righe.map(r => Object.assign({}, r)));
      const cols = sel.split(',').map(c => c.trim()).filter(Boolean);
      return di(200, righe.map(r => {
        const o = {}; for (const c of cols) o[c] = r[c]; return o;
      }));
    }

    if (via === '/rest/v1/rpc/segna_verdetto' && req.method === 'POST') {
      let b = {}; try { b = JSON.parse(corpo || '{}'); } catch (e) { b = {}; }
      if (!Object.prototype.hasOwnProperty.call(b, 's_id') ||
          !Object.prototype.hasOwnProperty.call(b, 'verdetto'))
        return di(400, { message: 'Could not find the function public.segna_verdetto(' +
                          Object.keys(b).sort().join(', ') + ') in the schema cache' });
      const r = V.applica(db, b.s_id, b.verdetto);
      /* `returns table` in PostgREST e' un ARRAY di righe */
      return di(200, [{ mosso: !!r.mosso, esito: r.esito | 0, sospetto_nuovo: r.sospetto | 0 }]);
    }

    if (via === '/rest/v1/rpc/frena' && req.method === 'POST') {
      let b = {}; try { b = JSON.parse(corpo || '{}'); } catch (e) { b = {}; }
      if (typeof b.k !== 'string' || typeof b.tetto !== 'number' || typeof b.secondi !== 'number')
        return di(400, { message: 'Could not find the function public.frena(' +
                          Object.keys(b).sort().join(', ') + ') in the schema cache' });
      frenaConta++;
      return di(200, (opz.frenoFino !== undefined && frenaConta > opz.frenoFino) ? false : true);
    }

    di(404, { message: 'no route to ' + via });
  });
  return new Promise(ok => s.listen(0, '127.0.0.1', () => ok({
    porta: s.address().port, url: 'http://127.0.0.1:' + s.address().port,
    log, chiudi: () => s.close(),
  })));
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
  let sg = null, ss = null, browser = null, vera = null, impQui = 0;
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
    /* L'IMPRONTA DEL MOTORE DI QUESTA MACCHINA (voce #142), letta prima
       di chiudere le due pagine: serve a completare la fixture congelata
       qui sotto, che e' di prima di quella cura. */
    impQui = await At.pag.evaluate(() =>
      (window.__test && typeof window.__test.improntaMotore === 'function') ? window.__test.improntaMotore() : 0);
    await At.ctx.close(); await Bt.ctx.close();
    if (!(s.partita && s.riga)) {
      console.error('PROVA NULLA: la sfida a ' + MISURA_2.join('x') + ' non e\' arrivata al fischio finale.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    vera = { crudo: N.conPixel(N.allarga(s.riga.replay)), seme: s.riga.seme, taglia: s.riga.taglia | 0,
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

/* =====================================================================
   LA FIXTURE E' DI PRIMA DELLA VOCE #142 e non porta la riga di tipo 11,
   l'impronta del motore JavaScript. Dal #142 il giudice si astiene su un
   nastro cosi' (INCOMPLETO/motore-js-ignoto), e tutte le prove qui sotto
   — che misurano il GIRO della staffetta, i cinque verdetti, il
   taccuino, il freno — smetterebbero di misurare quel che dicono.

   Si completa con l'impronta di CHI GIUDICA, letta a runtime, e non si
   rigenera la fixture con un numero fisso: quel numero cambia con la
   versione del browser, e una fixture legata al Chromium installato si
   spegnerebbe da sola su un'altra macchina. Che un nastro senza riga 11
   faccia astenere il giudice e' misurato dove deve esserlo, nella prova
   E di _q-motore-nastro.js.
   ===================================================================== */
  /* =====================================================================
     E DAL #144 LA FIXTURE E' UN NASTRO DI ATTI, cioe' non chiede nessuna
     finestra: `misuraDelNastro` torna null e la chiave del gruppo
     diventa «qualunque@…». Giusto per il gioco, ma tutto il gruppo A di
     questo banco misura il RAGGRUPPAMENTO PER MISURA, che serve ai
     nastri che una misura la chiedono — quelli con un pixel dentro, che
     sono quelli sul server adesso. Percio' la fixture si usa in due
     forme: `CRUDO_ATTI` com'e', per misurare che un nastro di atti
     finisce in «qualunque» (prova A4b), e `CRUDO` con un pixel inerte in
     testa (`N.conPixel`), per tutto il resto. Senza questa distinzione
     il banco misurerebbe l'assenza del raggruppamento invece del
     raggruppamento, cioe' attesterebbe. */
  const CRUDO_ATTI = impQui ? N.conMotore(N.allarga(FIX.replay), impQui) : N.allarga(FIX.replay);
  const CRUDO = N.conPixel(CRUDO_ATTI);
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
      /* LA CHIAVE E' UNA COPPIA DALLA VOCE #142 — «915x412@3274447767» —
         perche' due nastri della stessa misura e di due motori diversi
         non possono stare nella stessa finestra. Qui si controlla il
         PREFISSO, cioe' il contratto che questa prova ha sempre
         misurato: sei righe, tre gruppi, in ordine di prima apparizione.
         Che la parte dopo la chiocciola separi davvero i motori lo
         misura A6, qui sotto. Legare questa riga al formato esatto della
         chiave vorrebbe dire rifarla a ogni cambio di stampa. */
      di(gr.length === 3 && chiavi[0].indexOf('915x412@') === 0 && chiavi[1].indexOf('1024x460@') === 0 &&
         chiavi[2].indexOf('ignota@') === 0 &&
         gr[0].righe.length === 4 && gr[1].righe.length === 1 && gr[2].righe.length === 1,
         'A4) sei righe diventano TRE gruppi, in ordine di prima apparizione, e i nastri senza schermo stanno a parte',
         chiavi.map((c, i) => c + ':' + gr[i].righe.length).join(' · ') || 'nessun gruppo');

      /* =================================================================
         A4b — IL NASTRO DI ATTI NON CHIEDE NESSUNA FINESTRA (voce #144).

         Dal #144 un comando non e' piu' un punto ma un atto risolto, e un
         nastro fatto di atti si giudica DOVE CAPITA: la sua chiave e'
         «qualunque@impronta», e la finestra che si apre e' quella di
         serie. TRE etichette e non due — «qualunque» (non chiede),
         «ignota» (chiederebbe e non sa dire quale, cioe' i nastri di
         prima del #133) e la misura vera — perche' confonderle farebbe
         leggere un referto come se meta' delle righe fossero casi persi,
         e non lo sono piu'.
         ================================================================= */
      const grA = haS ? S.raggruppa([{ replay: CRUDO_ATTI }, { replay: CRUDO }]) : [];
      di(grA.length === 2 && grA.some(g => g.chiave.indexOf('qualunque@') === 0) &&
         grA.some(g => g.chiave.indexOf('915x412@') === 0),
         'A4b) un nastro di ATTI finisce in «qualunque», uno con un pixel nella sua misura',
         grA.map(g => g.chiave).join(' · ') || 'nessun gruppo');

      /* =================================================================
         A6 — IL MOTORE SEPARA I GRUPPI QUANTO LO SCHERMO (voce #142).

         Due righe con LA STESSA MISURA e due impronte diverse devono
         diventare DUE gruppi, o la staffetta aprirebbe una finestra sola
         e giudicherebbe meta' dei nastri sul motore sbagliato — che e'
         il difetto che il #142 cura. E due righe con la stessa misura e
         la STESSA impronta devono restare un gruppo solo, o si
         perderebbe il risparmio che il #138 ha misurato (1165 ms per
         contesto contro 938 per un giudizio in piu' sulla stessa
         pagina).
         ================================================================= */
      const IMP_A = 111111111, IMP_B = 222222222;
      const dueMotori = haS ? S.raggruppa([
        { id: 1, replay: N.conMotore(CRUDO, IMP_A) },
        { id: 2, replay: N.conMotore(CRUDO, IMP_B) },
        { id: 3, replay: N.conMotore(CRUDO, IMP_A) },
      ]) : [];
      di(dueMotori.length === 2 &&
         dueMotori[0].righe.length === 2 && dueMotori[1].righe.length === 1 &&
         dueMotori[0].impronta === IMP_A && dueMotori[1].impronta === IMP_B,
         'A6) stessa misura e due MOTORI diversi fanno DUE gruppi; stesso motore resta un gruppo solo',
         dueMotori.map(g => g.chiave + ':' + g.righe.length).join(' · ') || 'nessun gruppo');

      /* e la scelta del motore: chi chiede un'impronta che nessuno ha
         non si ripiega su un motore qualunque — torna null, e quelle
         righe restano a verificata = 0 */
      const finti = [{ nome: 'uno', browser: {}, impronta: IMP_A }, { nome: 'due', browser: {}, impronta: IMP_B }];
      const sA = haS && S.scegliMotore ? S.scegliMotore(finti, null, IMP_B) : null;
      const sIgn = haS && S.scegliMotore ? S.scegliMotore(finti, null, 0) : null;
      const sNo = haS && S.scegliMotore ? S.scegliMotore(finti, null, 999999999) : 'x';
      di(!!sA && sA.nome === 'due' && !!sIgn && sIgn.nome === 'uno' && sNo === null,
         'A7) si apre il motore che il nastro chiede; se nessuno ce l\'ha si torna null invece di ripiegare',
         (sA ? sA.nome : 'null') + ' / ' + (sIgn ? sIgn.nome : 'null') + ' / ' +
         (sNo === null ? 'null' : String(sNo && sNo.nome)));

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

      /* SI LEGGE LA FINESTRA APERTA, NON LA CHIAVE DEL GRUPPO, e la
         differenza non e' accademica: la chiave viene dal nastro e la
         finestra dal browser. Nella prima stesura questa riga guardava
         `m.chiave`, cioe' quel che il nastro DICHIARA — e restava verde
         anche sul falso `cieca`, che apre sempre 915x412 (misurato il 22
         settembre 2026). Era una riga che attestava invece di misurare. */
      const apr = (refSei.misure || []).map(m => (m.misura || []).join('x'));
      di(apr.includes('1024x460') && apr.includes('915x412'),
         'C2) fra le finestre APERTE DAVVERO ci sono tutte e due le misure dichiarate dai nastri',
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
      const tacU = tacNuovo();
      const refU = await giro(bancoU, { taccuino: tacU, misuraFissa: MISURA_1 });
      const vU = verdettoDi(refU, idU);
      di(vU === 'INCOMPLETO/schermo-diverso' && scU.sfida[idU - 1].verificata === 0,
         'C5) LO STESSO nastro, aperto di forza a ' + MISURA_1.join('x') + ', si rifiuta con schermo-diverso — non accusa',
         vU + ', verificata ' + scU.sfida[idU - 1].verificata);

      /* =================================================================
         C6) LA FINESTRA NEGATA, e non e' un «non lo so» del nastro.
         Se la staffetta aveva chiesto PROPRIO quella misura e non l'ha
         ottenuta, il colpevole e' la macchina che ospita (uno schermo
         piu' grande del display, una barra del browser, un server X che
         ridimensiona) — non il nastro. Quella riga NON deve entrare nel
         taccuino, se no la si perde per sempre: il taccuino la
         salterebbe a ogni giro futuro e nessuno la guarderebbe piu'.
         E deve essere GRIDATA nel referto, perche' e' un guasto
         operativo e non un esito.
         ================================================================= */
      const negate = (refU.finestreNegate || []);
      di(negate.length === 1 && negate[0].id === idU &&
         !!tacU && !tacU.ha(idU) && tacU.quanti() === 0,
         'C6) e quella riga NON entra nel taccuino: il giro dopo la riprende, e il referto GRIDA la finestra negata',
         negate.length + ' finestre negate' +
         (negate.length ? ' (#' + negate[0].id + ' chiesta ' + negate[0].chiesta.join('x') +
          ', serve ' + (negate[0].serve ? negate[0].serve.join('x') : '?') + ')' : '') +
         ', taccuino ' + (tacU ? tacU.quanti() : '?') + ' righe');

      /* e il giro DOPO, con lo stesso taccuino e la finestra giusta,
         la giudica davvero: e' la prova che non si e' persa */
      const bancoU2 = bancoFinto(scU, V, {});
      const refU2 = await giro(bancoU2, { taccuino: tacU });
      di(verdettoDi(refU2, idU) === 'TORNA' && scU.sfida[idU - 1].verificata === 1,
         'C6b) e col giro dopo, alla misura giusta, la stessa riga TORNA: la finestra negata non perde niente',
         verdettoDi(refU2, idU) + ', verificata ' + scU.sfida[idU - 1].verificata);
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
      const tE3 = tacNuovo();
      const rE3 = await giro(bE3, { taccuino: tE3, asciutto: true });
      di((rE3.esiti || []).length === 3 && bE3.log.segna.length === 0 &&
         conta(e3.db, 0) === 3 && sosp(e3.db, 'B') === 0,
         'E3) --asciutto: giudica tutto e NON manda niente — tre verdetti, zero chiamate, database fermo',
         (rE3.esiti || []).length + ' verdetti, ' + bE3.log.segna.length + ' chiamate, righe aperte ' + conta(e3.db, 0));

      /* =================================================================
         E3b) E LA PROVA A VUOTO NON AVVELENA IL TACCUINO.

         E' il difetto che questa prova e' nata per prendere, trovato
         rileggendo il codice il 22 settembre 2026 e non da un rosso:
         `--asciutto` giudica e non manda niente, quindi quelle righe
         restano a `verificata = 0`. Se finissero nel taccuino, il giro
         VERO del giorno dopo le salterebbe — e sarebbero perse per
         sempre, senza che niente diventi rosso da nessuna parte. Una
         prova a vuoto che fa perdere righe e' peggio di nessuna prova a
         vuoto.

         Si misura in due tempi: il taccuino resta VUOTO dopo il giro a
         vuoto, e il giro vero che viene dopo — con lo STESSO taccuino —
         le rimanda tutte e tre.
         ================================================================= */
      const taccDopoVuoto = tE3 ? tE3.quanti() : -1;
      const bE3b = bancoFinto(e3.db, V, {});
      const rE3b = await giro(bE3b, { taccuino: tE3 });
      di(taccDopoVuoto === 0 && bE3b.log.segna.length === 3 && (rE3b.saltate | 0) === 0 &&
         conta(e3.db, 1) === 1 && conta(e3.db, -1) === 1,
         'E3b) e la prova a vuoto NON avvelena il taccuino: il giro vero dopo le rimanda tutte e tre',
         'taccuino dopo il giro a vuoto ' + taccDopoVuoto + ' righe, poi ' + (rE3b.saltate | 0) +
         ' saltate e ' + bE3b.log.segna.length + ' rimandate, ' +
         'verificata 1:' + conta(e3.db, 1) + ' -1:' + conta(e3.db, -1));

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
      /* RETTIFICA A EDIZIONI (24 settembre 2026, voce #146). Qui c'era
         `api.length === 5`. Oggi sono SEI: la voce #146 ha aperto
         `/api/dischetto`, la cassetta della sfida dal dischetto, e l'ha
         aperto APPOSTA. Il vecchio numero non era sbagliato quando fu
         scritto: diceva «LA STAFFETTA non apre endpoint», ed e' ancora
         vero — la staffetta resta un processo che apre un browser, e la
         ragione per cui non e' un endpoint sta in testa a
         strumenti/staffetta.js e non e' cambiata di una virgola (una
         funzione Vercel non ha un browser, e il giudice E' il gioco).

         E' la TERZA guardia della stessa famiglia trovata in questo
         cantiere — le altre due sono `_q-sospetto` D8 e `_q-glicko`
         D2/D8 — e questa e' saltata fuori SOLO dalla batteria dei
         cancelli lenti, che il piano del compito non nominava. Lezione
         22, alla seconda occasione nella stessa giornata.
         Fonte: rete/api/dischetto.js. */
      di(api.length === 6,
         'F1) gli endpoint sono SEI e la staffetta non e\' uno di loro (edizione del 24/9/2026: erano cinque)',
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

    /* =================================================================
       G) IL FILO — bancoVero contro un server che parla PostgREST
       ================================================================= */
    if (vuole('G')) {
      titolo('G) IL FILO — la via, i filtri, le intestazioni e i nomi degli argomenti, contro un server finto');

      const gdb = scenaTre();
      const srv = await serviPostgrest(gdb.db, V, {});
      const CHIAVE = 'chiave-di-servizio-finta-138';
      let rG = { esiti: [], guasto: 'il modulo non c\'e\'' };
      try {
        if (haS) {
          const bv = S.bancoVero({ url: srv.url, chiave: CHIAVE, nome: 'prova' });
          rG = await giro(bv, { taccuino: tacNuovo() });
        }
      } catch (e) { rG = { esiti: [], guasto: 'ESPLOSA: ' + e.message }; }
      if (rG.guasto) info('guasto del giro:', rG.guasto);

      di(!rG.guasto && conta(gdb.db, 1) === 1 && conta(gdb.db, -1) === 1 && conta(gdb.db, 0) === 1 &&
         sosp(gdb.db, 'B') === 1 && invariante(gdb.db).length === 0,
         'G1) il giro INTERO passa dal filo e chiude le righe: una a 1, una a -1, una ancora aperta',
         'verificata 1:' + conta(gdb.db, 1) + ' -1:' + conta(gdb.db, -1) + ' 0:' + conta(gdb.db, 0) +
         ', sospetto B ' + sosp(gdb.db, 'B'));

      const pesche = srv.log.richieste.filter(r => r.via === '/rest/v1/sfida');
      const q0 = pesche.length ? pesche[0].query : '';
      di(pesche.length > 0 && /(^|&)verificata=eq\.0(&|$)/.test(q0) && /(^|&)order=id\.asc(&|$)/.test(q0) &&
         /(^|&)limit=\d+(&|$)/.test(q0) && /select=[^&]*replay/.test(q0),
         'G2) la pesca chiede verificata=eq.0, in ordine di id, con un tetto e col replay fra le colonne',
         q0 ? decodeURIComponent(q0).slice(0, 110) : 'nessuna pesca');

      const rpc = srv.log.richieste.filter(r => r.via === '/rest/v1/rpc/segna_verdetto');
      const corpi = rpc.map(r => { try { return JSON.parse(r.corpo || '{}'); } catch (e) { return {}; } });
      const parole = corpi.map(c => c.verdetto);
      di(rpc.length === 3 && corpi.every(c => typeof c.s_id === 'number' && typeof c.verdetto === 'string') &&
         parole.every(p => VERDETTI.includes(p)),
         'G3) segna_verdetto si chiama con s_id e con LA PAROLA, tre volte su tre — il nome dell\'argomento e\' quello dell\'SQL',
         rpc.length + ' chiamate: ' + corpi.map(c => '#' + c.s_id + ' ' + c.verdetto).join(' · '));

      const freni = srv.log.richieste.filter(r => r.via === '/rest/v1/rpc/frena');
      const cf = freni.length ? (() => { try { return JSON.parse(freni[0].corpo || '{}'); } catch (e) { return {}; } })() : {};
      di(freni.length === 3 && cf.k === 'staffetta:prova' && cf.tetto > 0 && cf.secondi > 0,
         'G4) il freno si chiede al database una volta per riga, con la chiave della staffetta',
         freni.length + ' chiamate, ' + JSON.stringify(cf));

      const tutte = srv.log.richieste;
      di(tutte.length > 0 && tutte.every(r => r.apikey === CHIAVE && r.auth === 'Bearer ' + CHIAVE),
         'G5) ogni richiesta porta la chiave di servizio in tutte e due le intestazioni, come rete/lib/comuni.js',
         tutte.length + ' richieste, apikey e Bearer su tutte');

      /* G6 — IL CURSORE. Con una riga gia' nel taccuino e un tetto di
         due, la prima pagina ne rende due e una si salta: la staffetta
         deve chiedere LA PAGINA DOPO, se no le righe gia' viste
         mangerebbero la finestra e le nuove non arriverebbero mai. */
      const g2db = scenaTre();
      const srv2 = await serviPostgrest(g2db.db, V, {});
      const tacG = tacNuovo();
      if (tacG) tacG.segna(g2db.ids.torna, { verdetto: 'ALTRO MOTORE', causa: 'finta', misura: '915x412', quando: '' });
      let rG2 = { saltate: 0 };
      try {
        if (haS) rG2 = await giro(S.bancoVero({ url: srv2.url, chiave: CHIAVE, nome: 'prova' }),
                                  { taccuino: tacG, tetto: 2 });
      } catch (e) { rG2 = { saltate: 0, guasto: e.message }; }
      const pesche2 = srv2.log.richieste.filter(r => r.via === '/rest/v1/sfida');
      const conCursore = pesche2.filter(r => /(^|&)id=gt\.\d+(&|$)/.test(r.query));
      di(pesche2.length >= 2 && conCursore.length >= 1 && (rG2.saltate | 0) === 1 &&
         (rG2.esiti || []).length === 2,
         'G6) le righe gia' + '\' viste non mangiano la finestra: si chiede la pagina dopo col cursore id=gt.',
         pesche2.length + ' pagine, ' + conCursore.length + ' col cursore, ' +
         (rG2.saltate | 0) + ' saltate, ' + (rG2.esiti || []).length + ' giudicate');

      srv.chiudi(); srv2.chiudi();

      /* G7 — IL PROGRAMMA VERO, lanciato come si lancia in esercizio:
         `node strumenti/staffetta.js` con le due variabili d'ambiente.
         Apre il suo server del gioco, il suo browser, e chiude le righe.
         E' l'unica prova che tocca main(), serviGioco() e la riga di
         comando — cioe' tutto quel che un banco che chiama `giro` da
         dentro non vedrebbe mai. */
      const g3db = scenaTre();
      const srv3 = await serviPostgrest(g3db.db, V, {});
      const viaTaccCli = path.join(tmp, 'taccuino-cli.json');
      /* SPAWN E NON SPAWNSYNC, e la trappola e' costata un ETIMEDOUT:
         `spawnSync` blocca il ciclo degli eventi del processo padre, e
         il server finto che il figlio deve interrogare vive PROPRIO in
         questo processo. Bloccato il padre, nessuno risponde, e il
         figlio aspetta finche' il tetto lo ammazza — un rosso che
         accusava la staffetta per colpa del banco. */
      const esec = haS ? await new Promise(ok => {
        /* SI LANCIA IL MODULO SOTTO MISURA, non `strumenti/staffetta.js`
           a mano: con il percorso fisso questa prova restava verde su
           OGNI falso, perche' lanciava sempre quello onesto. Trovata dal
           falso `filo` il 22 settembre 2026 — era la seconda riga di
           questo banco che attestava invece di misurare. */
        const p = spawn(process.execPath,
          [viaS, '--tetto', '3', '--pausa', '0',
           '--taccuino', viaTaccCli, '--nome', 'cli'],
          { cwd: RADICE,
            env: Object.assign({}, process.env, { SUPABASE_URL: srv3.url, SUPABASE_SERVICE_KEY: CHIAVE }) });
        let out = '', err = '';
        p.stdout.on('data', d => { out += d; });
        p.stderr.on('data', d => { err += d; });
        const morte = setTimeout(() => { try { p.kill(); } catch (e) {} }, 180000);
        p.on('close', c => { clearTimeout(morte); ok({ status: c, stdout: out, stderr: err }); });
        p.on('error', e => { clearTimeout(morte); ok({ status: null, stdout: out, stderr: String(e && e.message) }); });
      }) : { status: 1, stdout: '', stderr: 'il modulo non c\'e\'' };
      const usc = esec.status;
      const detto = String(esec.stdout || '');
      di(usc === 0 && conta(g3db.db, 1) === 1 && conta(g3db.db, -1) === 1 && conta(g3db.db, 0) === 1 &&
         sosp(g3db.db, 'B') === 1 && fs.existsSync(viaTaccCli) &&
         detto.indexOf(CHIAVE) < 0,
         'G7) `node strumenti/staffetta.js` lanciato davvero chiude le righe, scrive il taccuino e non stampa la chiave',
         'uscita ' + usc + ', verificata 1:' + conta(g3db.db, 1) + ' -1:' + conta(g3db.db, -1) +
         ' 0:' + conta(g3db.db, 0) + ', taccuino ' + (fs.existsSync(viaTaccCli) ? 'scritto' : 'ASSENTE') +
         (usc !== 0 ? ' — ' + String((esec.error && esec.error.message) || esec.stderr ||
                                     detto || 'nessun messaggio').slice(0, 200).replace(/\n/g, ' | ') : ''));
      for (const r of detto.split('\n').filter(l => /pescate|verdetti|righe chiuse|tempi/.test(l)))
        info('dal programma:', r.trim());
      srv3.chiudi();
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
