/* =====================================================================
   _dischetto-due-telefoni.js — L'IMPIANTO DELLA SFIDA DAL DISCHETTO
   (voce #146, compito 1). Non misura niente di suo: e' quel che
   _q-dischetto.js e i falsi _crit-dischetto-*.js si dividono.

   PERCHE' ESISTE, e perche' non basta quello del #132. L'impianto
   `_sfida-due-telefoni.js` sa aprire due telefoni e sa fingere i cinque
   endpoint della sfida ASINCRONA. La sfida dal dischetto ne chiede due
   cose che li' non ci sono, e nessuna delle due e' un vezzo:

     1. LA CASSETTA — un buca-lettere indicizzato, che e' il trasporto
        scelto dal cantiere (spec §2.2). Va finta come gli altri cinque,
        con le STESSE regole di rifiuto del vero, perche' un messaggio
        che qui passa debba passare anche di la'.

     2. I GUASTI, INIETTABILI. Il compito 4 deve misurare che cosa vede
        chi resta quando l'altro sparisce, quando un pacchetto si perde,
        quando la rete singhiozza. Un banco che quei guasti li racconta
        invece di provocarli non prova niente. Percio' la cassetta finta
        ha quattro manopole (`perdiImbuco`, `perdiRitiro`, `mille429`,
        `spegni`) e un contatore di richieste per identita' e per minuto
        — che E' la misura dei freni della spec §2.4.

   E UNA TERZA COSA, che e' la piu' importante di tutte:

     3. IL PARI FINTO. I falsi di questo cantiere NON sono, quasi tutti,
        versioni bugiarde del gioco: sono un AVVERSARIO bugiardo scritto
        in Node che parla la stessa cassetta di un gioco vero. E' la
        domanda giusta — «il gioco onesto resiste a un pari che bara?» —
        ed e' anche la piu' severa, perche' il pari finto puo' barare in
        modi che un mutante del file HTML non saprebbe (aspettare, non
        rispondere, mandare due volte, sfondare il freno).

        Il pari finto conosce il protocollo e rifa' l'impronta con la
        SHA-256 di Node. Se il gioco calcolasse un impegno diverso da
        quello di Node, il giro non chiuderebbe: la prova che le due
        impronte coincidono e' gratis, e sta dentro ogni caso verde.

   NON E' UN CANCELLO: non ha un'uscita, non stampa niente.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

const RADICE = path.resolve(__dirname, '..');

/* La versione del protocollo. Deve combaciare con DISCHETTO_V nel
   gioco: se non combacia, l'appuntamento non si fa — ed e' apposta. */
const DISCHETTO_V = 1;

/* Il tetto del freno della cassetta: gli STESSI numeri del fratello
   piu' largo del server vero (`sfl:` e `avv:` valgono 60 al minuto).
   Nessun privilegio: se il conto della spec §2.4 fosse ottimista, qui
   deve uscire un 429, non una nota a margine. */
const FRENO_TETTO = 60;
const FRENO_SEC = 60;

/* ------------------------------------------------------ il gioco servito */
/* Playwright non apre file://, quindi il repo si serve da se'. Copiato
   da _sfida-due-telefoni.js e non importato apposta: quel file serve
   anche il banco della sfida asincrona, e due cantieri che si passano
   un server si passano anche i guai. */
function serviGioco(prova) {
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

/* =====================================================================
   LA CASSETTA FINTA — il contratto di /api/dischetto, in memoria.

   Due verbi soli:
     POST /api/dischetto   {stanza,k,r,t,d}  imbuca    -> {ok,i}
     GET  /api/dischetto?stanza=X&da=N       ritira    -> {ok,msg,i}

   LE TRE REGOLE CHE LA RENDONO UN TRASPORTO ONESTO, e che il server
   vero deve avere identiche:

   a) L'INDICE E' DEL SERVER. Ogni messaggio imbucato prende un numero
      crescente dentro la sua stanza, e il ritiro chiede «tutto dopo N».
      E' quel che rende un ritiro perso un non-evento: il ritiro dopo
      riporta anche quel che il precedente non ha visto. Se l'indice
      fosse del client, un client che sbaglia a contare perderebbe
      messaggi per sempre.

   b) SI SCRIVE UNA VOLTA SOLA per (stanza, tiro, lato, tipo). Il
      secondo imbuco IDENTICO e' un si' (il ritentativo dopo un imbuco
      perso deve poter funzionare); il secondo imbuco DIVERSO e' un no
      — ed e' la guardia che impedisce di cambiare idea dopo aver
      parlato. Non e' una cortesia: e' meta' della fiducia.

   c) LA STANZA E' IL NOME DELLA CASSETTA, e nient'altro. Non c'e' una
      tabella di persone, non c'e' un conto, non c'e' un'identita' che
      viaggia. L'identita' serve solo al freno, ed e' quella che il
      gioco ha gia' (Authorization: Calcetto <id>.<segreto>).
   ===================================================================== */
function serviCassetta(opz) {
  const db = { allenatori: new Map(), stanze: new Map(), freno: new Map() };
  const stato = {
    su: true,
    /* le quattro manopole del guasto */
    perdiImbuco: 0,      /* quanti imbuchi accettare e NON scrivere */
    perdiRitiro: 0,      /* quanti ritiri far tornare vuoti */
    mille429: 0,         /* quante richieste rifiutare con 429 */
    frenoAcceso: (opz && opz.frenoAcceso) !== false,
    /* la contabilita', che e' una misura e non un registro */
    richieste: [],       /* {q: quando, chi, via, esito} */
  };
  const digest = s => crypto.createHash('sha256').update(String(s)).digest('hex');

  const chiSei = req => {
    const h = req.headers.authorization || '';
    const m = /^Calcetto\s+([^.\s]+)\.(\S+)$/.exec(h);
    if (!m) return null;
    const a = db.allenatori.get(m[1]);
    return (a && a.segreto === digest(m[2])) ? m[1] : null;
  };

  /* Il freno, con la stessa forma di quello vero: `frena(k, tetto,
     secondi)` in rete/schema.sql:269 — finestra che si azzera quando e'
     scaduta, rifiuto quando il conto ha raggiunto il tetto. */
  const frenato = (chiave, tetto, secondi) => {
    if (!stato.frenoAcceso) return false;
    const ora = Date.now();
    let f = db.freno.get(chiave);
    if (!f || ora - f.finestra > secondi * 1000) { db.freno.set(chiave, { conta: 1, finestra: ora }); return false; }
    if (f.conta >= tetto) return true;
    f.conta++;
    return false;
  };

  const s = http.createServer(async (req, res) => {
    const via = req.url.split('?')[0];
    const q = new URLSearchParams(req.url.split('?')[1] || '');
    const di = (codice, corpo) => {
      res.writeHead(codice, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      });
      res.end(JSON.stringify(corpo));
    };
    if (req.method === 'OPTIONS') return di(204, {});
    /* SPENTO vuol dire spento: la socket cade, e il gioco deve vedere
       'assente', non un 500 cortese. */
    if (!stato.su) { req.socket.destroy(); return; }

    let corpo = {};
    if (req.method !== 'GET') {
      let g = ''; for await (const p of req) g += p;
      try { corpo = g ? JSON.parse(g) : {}; } catch { corpo = {}; }
    }

    /* ------------------------------------------------- l'identita' */
    if (via === '/api/entra') {
      if (corpo && corpo.id && db.allenatori.has(corpo.id)) return di(200, { ok: true, id: corpo.id });
      const id = crypto.randomUUID();
      const segreto = crypto.randomBytes(16).toString('hex');
      db.allenatori.set(id, { segreto: digest(segreto) });
      return di(200, { ok: true, id, segreto });
    }

    /* La vetrina non serve al dischetto, ma il gioco la chiama da se'
       quando la rosa cambia: se rispondesse 404 il banco misurerebbe un
       errore che non c'entra niente con quel che sta provando. */
    if (via === '/api/squadra') return di(200, { ok: true });

    /* ------------------------------------------------- LA CASSETTA */
    if (via === '/api/dischetto') {
      const io = chiSei(req);
      if (!io) { stato.richieste.push({ q: Date.now(), chi: '?', via, esito: 401 }); return di(401, { ok: false, errore: 'ignoto' }); }

      if (stato.mille429 > 0) {
        stato.mille429--;
        stato.richieste.push({ q: Date.now(), chi: io, via, esito: 429 });
        return di(429, { ok: false, errore: 'troppe' });
      }
      if (frenato('dis:' + io, FRENO_TETTO, FRENO_SEC)) {
        stato.richieste.push({ q: Date.now(), chi: io, via, esito: 429 });
        return di(429, { ok: false, errore: 'troppe' });
      }

      /* ---------------------------------------------------- RITIRO */
      if (req.method === 'GET') {
        const nome = String(q.get('stanza') || '');
        const da = Math.max(0, parseInt(q.get('da') || '0', 10) || 0);
        stato.richieste.push({ q: Date.now(), chi: io, via, esito: 200, verbo: 'ritira' });
        if (stato.perdiRitiro > 0) {
          /* IL RITIRO PERSO non e' un errore: e' una risposta vuota che
             arriva. Il gioco non deve accorgersene, perche' l'indice non
             si muove e il ritiro dopo riporta tutto. E' proprio questo
             che il compito 4 deve misurare: «che cosa vede chi resta» =
             NIENTE. */
          stato.perdiRitiro--;
          return di(200, { ok: true, msg: [], i: da });
        }
        const c = db.stanze.get(nome);
        if (!c) return di(200, { ok: true, msg: [], i: 0 });
        return di(200, { ok: true, msg: c.msg.filter(m => m.i > da), i: c.msg.length });
      }

      /* ---------------------------------------------------- IMBUCO */
      if (req.method !== 'POST') return di(405, { ok: false, errore: 'metodo' });
      stato.richieste.push({ q: Date.now(), chi: io, via, esito: 200, verbo: 'imbuca' });

      const nome = String(corpo.stanza || '');
      if (!/^[A-Z0-9]{4,12}$/.test(nome)) return di(400, { ok: false, errore: 'stanza-forma' });
      const k = String(corpo.k || '');
      if (!/^[SIRF]$/.test(k)) return di(400, { ok: false, errore: 'tipo' });
      const r = String(corpo.r || '');
      if (r !== 'a' && r !== 'b') return di(400, { ok: false, errore: 'lato' });
      const t = Math.round(Number(corpo.t));
      if (!(t >= 0 && t <= 40)) return di(400, { ok: false, errore: 'tiro' });
      const d = corpo.d;
      const testo = JSON.stringify(d === undefined ? null : d);
      if (testo.length > 4096) return di(413, { ok: false, errore: 'grosso' });

      if (stato.perdiImbuco > 0) {
        /* L'IMBUCO PERSO e' il caso cattivo: il server dice di si' e non
           scrive. Chi ha imbucato crede di aver parlato e non ha
           parlato. Si cura solo col ritentativo, e il ritentativo si
           puo' fare solo perche' l'imbuco e' idempotente. */
        stato.perdiImbuco--;
        return di(200, { ok: true, i: 0, perso: true });
      }

      let c = db.stanze.get(nome);
      if (!c) { c = { msg: [] }; db.stanze.set(nome, c); }
      const chiave = k + '|' + r + '|' + t;
      const gia = c.msg.find(m => m.chiave === chiave);
      if (gia) {
        /* (b): identico si', diverso no. */
        if (gia.testo === testo) return di(200, { ok: true, i: gia.i, ripetuto: true });
        return di(409, { ok: false, errore: 'gia-detto' });
      }
      const m = { i: c.msg.length + 1, chiave, k, r, t, d, testo };
      c.msg.push(m);
      return di(200, { ok: true, i: m.i });
    }

    return di(404, { ok: false, errore: 'via' });
  });

  return new Promise(ok => s.listen(0, '127.0.0.1', () => ok({
    porta: s.address().port, chiudi: () => s.close(), db, stato,
    /* LE RICHIESTE AL MINUTO, che e' la misura dei freni. Si guarda la
       finestra scorrevole piu' affollata, non la media: una media che
       sta sotto il tetto puo' nascondere un picco che lo sfonda. */
    puntaAlMinuto(chi) {
      const v = stato.richieste.filter(x => !chi || x.chi === chi).map(x => x.q).sort((a, b) => a - b);
      let punta = 0;
      for (let i = 0; i < v.length; i++) {
        let j = i; while (j < v.length && v[j] - v[i] < 60000) j++;
        if (j - i > punta) punta = j - i;
      }
      return punta;
    },
    conta(chi, verbo) {
      return stato.richieste.filter(x => (!chi || x.chi === chi) && (!verbo || x.verbo === verbo)).length;
    },
    azzeraConto() { stato.richieste.length = 0; },
  })));
}

/* =====================================================================
   UN TELEFONO — un contesto Playwright, un salvataggio, un'identita'.
   Stessa forma di _sfida-due-telefoni.js: rAF zittito (il banco fa
   avanzare il tempo da se', se no due esecuzioni non sono
   confrontabili), splash chiuso, tutorial fatto.
   ===================================================================== */
async function apri(browser, porta, viewport) {
  const ctx = await browser.newContext({
    viewport: viewport || { width: 915, height: 412 },
    isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { ctx, pag, errori };
}

/* collega il telefono alla cassetta finta e gli da' una rosa sua.

   LA ROSA VARIA SULL'INTERO NOME, non sulla sua LUNGHEZZA — e questa
   riga e' costata un rosso. La prima versione copiava l'idioma del #132
   (`nome.length`) e dava ad ALFA e BETA, che hanno quattro lettere
   tutte e due, LA STESSA ROSA IDENTICA. Il banco dichiarava rosso «ognuno
   vede la rosa dell'altro e le due non sono la stessa» mentre il gioco
   si comportava benissimo: stava misurando la propria tavola dei nomi.
   E' la lezione 13 in miniatura — un banco deve poter misurare la
   propria capacita' di distinguere prima di accusare qualcuno. */
const collega = (P, portaServer, nome) => P.pag.evaluate(([p, nome]) => {
  const t = window.__test;
  t.reteBase('http://127.0.0.1:' + p);
  t.save.teamName = nome;
  let sm = 0;
  for (let i = 0; i < nome.length; i++) sm = (sm * 31 + nome.charCodeAt(i)) >>> 0;
  t.save.rosa = t.save.rosa.map((r, i) => Object.assign({}, r, {
    nome: nome + ' ' + (i + 1),
    vel: 50 + ((i * 7 + sm * 3) % 30),
    tiro: 50 + ((i * 11 + sm * 5) % 30),
    tecnica: 50 + ((i * 5 + sm * 7) % 30),
    tackle: 50 + ((i * 13 + sm * 2) % 30),
  }));
}, [portaServer, nome]);

const entra = P => P.pag.evaluate(async () => await window.__test.rete.entra());

/* =====================================================================
   IL PARI FINTO — un avversario scritto in Node che parla la cassetta.

   Onesto se non gli si dice altro. Le bugie si accendono una per una, e
   ognuna e' uno dei falsi del cantiere:

     veggente  aspetta la RIVELAZIONE dell'altro prima di impegnarsi, e
               poi sceglie la mossa che batte. E' il baro classico, ed e'
               il caso peggiore: non "prova" a barare, bara sapendo tutto.
     bugiardo  impegna una mossa e ne rivela un'altra.
     semesuo   sceglie il proprio nonce DOPO aver visto quello dell'altro,
               per pilotare il seme della serie.
     esitosuo  dichiara un esito diverso da quello vero.
     muto      sparisce dopo aver letto la rivelazione dell'altro.
     sfrenato  ritira a raffica finche' il freno non morde.

   L'IMPRONTA LA FA NODE, e questo e' un controllo gratis: se il gioco
   calcolasse un impegno diverso, la verifica dell'altro lato non
   chiuderebbe e il caso onesto sarebbe rosso. Non c'e' bisogno di una
   prova apposta perche' le due SHA-256 coincidano: ogni caso verde la
   contiene.
   ===================================================================== */
const esa = b => Buffer.from(b).toString('hex');

/* l'impegno: SHA-256 del tiro, del lato, della mossa e del nonce,
   troncata a 128 bit. La forma della stringa e' il contratto, e va
   identica nel gioco: cambiare un separatore qui e non la' vuol dire
   che nessuno dei due riesce piu' a credere all'altro. */
function impegnoDi(t, lato, mossa, nonce) {
  const s = 'D1|' + t + '|' + lato + '|' + testoMossa(mossa) + '|' + nonce;
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 32);
}

/* LA MOSSA SI SCRIVE IN UN MODO SOLO. Un impegno e' un hash di una
   stringa: se il gioco scrivesse {z,u,v} e Node {u,v,z}, gli hash non
   combacerebbero mai e la colpa sembrerebbe del protocollo. */
function testoMossa(m) {
  if (!m) return '-';
  if (m.ruolo === 'p') return 'p' + (m.z | 0);
  return 't' + (m.z | 0) + ',' + (m.u | 0) + ',' + (m.v | 0) + ',' + (m.ps | 0);
}

/* il seme a due mani: nessuno dei due lo controlla, perche' nessuno dei
   due conosce il nonce dell'altro quando sceglie il proprio */
function mescola(na, nb) {
  const h = crypto.createHash('sha256').update('D1|' + na + '|' + nb).digest();
  return h.readUInt32BE(0);
}

/* =====================================================================
   L'IMPEGNO DEL SALUTO (voce #150) — lo stesso schema in due tempi che
   il #146 usa per i tiri, applicato al nonce dell'appuntamento.

   IL LATO STA DENTRO LA STRINGA, e non e' un vezzo. Senza, il baro
   copierebbe l'impegno dell'altro, aspetterebbe la sua rivelazione e
   rivelerebbe lo STESSO nonce: il seme diventerebbe mescola(n, n), cioe'
   un numero che l'onesto non ha scelto da solo. Col lato dentro, la
   copia non ricompone e cade su `saluto-non-torna`.

   La forma della stringa e' il contratto e va identica nel gioco
   (`dsImpegnoSaluto`): cambiare un separatore qui e non la' vuol dire
   che nessuno dei due riesce piu' a credere all'altro.
   ===================================================================== */
function impegnoSaluto(lato, nonce) {
  return crypto.createHash('sha256').update('DS1|' + lato + '|' + nonce).digest('hex').slice(0, 32);
}

class PariFinto {
  constructor(base, cred, stanza, lato, bugia) {
    this.base = base; this.cred = cred; this.stanza = stanza;
    this.lato = lato; this.bugia = bugia || {};
    this.da = 0; this.visti = []; this.mieNonce = {}; this.mieMosse = {};
    this.ritiri = 0; this.rifiuti = 0; this.morto = false;
  }
  async chiama(via, metodo, corpo) {
    const t = { Authorization: 'Calcetto ' + this.cred.id + '.' + this.cred.segreto };
    if (corpo) t['Content-Type'] = 'application/json';
    try {
      const r = await fetch(this.base + via, {
        method: metodo, headers: t, body: corpo ? JSON.stringify(corpo) : undefined,
      });
      const v = await r.json().catch(() => null);
      if (r.status === 429) this.rifiuti++;
      return v || { ok: false, errore: 'http ' + r.status };
    } catch (e) { return { ok: false, errore: 'assente' }; }
  }
  async ritira() {
    this.ritiri++;
    const r = await this.chiama('/api/dischetto?stanza=' + this.stanza + '&da=' + this.da, 'GET');
    if (r && r.ok && r.msg) {
      for (const m of r.msg) this.visti.push(m);
      if (r.i > this.da) this.da = r.i;
    }
    return r;
  }
  trova(k, lato, t) { return this.visti.find(m => m.k === k && m.r === lato && m.t === t); }
  get altro() { return this.lato === 'a' ? 'b' : 'a'; }
  async imbuca(k, t, d) {
    return this.chiama('/api/dischetto', 'POST', { stanza: this.stanza, k, r: this.lato, t, d });
  }

  /* =====================================================================
     IL SALUTO, E LE QUATTRO MANI CHE PROVANO A SCEGLIERE IL SEME.

     IL PARI PARLA TUTTE E DUE LE VERSIONI (voce #150), e lo decide dal
     `v` che gli si mette in mano — non da una manopola sua. Un pari che
     scegliesse da se' la versione misurerebbe la propria idea del
     protocollo invece di quella del gioco.

       v1  il nonce viaggia DENTRO il saluto, in chiaro.
       v2  il saluto porta l'IMPEGNO del nonce; il nonce si rivela con
           una busta `N`, e il pari onesto la manda solo quando ha in
           casa l'impegno dell'altro — la stessa regola d'oro del gioco.

     LE BUGIE DEL SEME, tutte e tre nel caso peggiore:

       semesuo      ritarda il saluto finche' non vede quello dell'altro,
                    e poi macina 4096 nonce per il bit che vuole. Su v1
                    vince sempre; su v2 il saluto dell'altro porta solo
                    un impegno e la macinatura non serve a niente.
       semerivelato si impegna su un nonce, aspetta la RIVELAZIONE
                    dell'altro e poi ne rivela un ALTRO, scelto. E' il
                    baro che l'impegno esiste per fermare.
       semepaziente non parla finche' non ha in mano il NONCE dell'altro.
                    Su v1 lo trova dentro il saluto; su v2 non arriva
                    mai, perche' l'onesto non rivela a chi non si e'
                    impegnato. Il suo esito atteso e' lo STALLO.
     ===================================================================== */

  /* il nonce dell'altro, comunque il protocollo glielo faccia arrivare:
     dentro la sua rivelazione (v2) o dentro il suo saluto (v1) */
  suoNonce() {
    const n = this.trova('N', this.altro, 0);
    if (n && n.d && n.d.n) return n.d.n;
    const s = this.trova('S', this.altro, 0);
    return (s && s.d && s.d.n) || null;
  }

  /* macina nonce finche' non ne trova uno che dia il seme col bit che il
     baro vuole — cioe' «tiro io per primo». 4096 tentativi bastano: il
     bit e' uno solo, e la probabilita' di non trovarlo e' 2^-4096. */
  macina(suo) {
    if (!suo) return this.mioNonce;
    for (let k = 0; k < 4096; k++) {
      const n = esa(crypto.randomBytes(8));
      const sm = this.lato === 'a' ? mescola(n, suo) : mescola(suo, n);
      if ((sm & 1) === (this.lato === 'b' ? 1 : 0)) return n;
    }
    return this.mioNonce;
  }

  async saluta(dati) {
    this.duetempi = (dati && (dati.v | 0)) >= 2;
    this.mioNonce = (dati && dati.n) || esa(crypto.randomBytes(8));
    this.mandataN = false;
    this.nonceRivelato = null;
    this.pazienzaPersa = false;

    if (this.bugia.semepaziente) {
      /* NON SI IMPEGNA FINCHE' NON SA TUTTO. Su v2 non sapra' mai niente:
         il gioco non rivela a chi non ha parlato, e questo e' lo stallo
         che il cancello pretende. */
      for (let g = 0; g < 40 && !this.suoNonce(); g++) await this.ritira();
      const suo = this.suoNonce();
      if (suo) this.mioNonce = this.macina(suo);
      else { this.pazienzaPersa = true; return { ok: false, errore: 'mai-visto-il-nonce' }; }
    } else if (this.bugia.semesuo) {
      for (let g = 0; g < 40 && !this.trova('S', this.altro, 0); g++) await this.ritira();
      const suo = this.trova('S', this.altro, 0);
      /* su v1 `suo.d.n` c'e' e la macinatura morde; su v2 c'e' solo
         `suo.d.hn`, e macina() torna il nonce di partenza */
      if (suo) this.mioNonce = this.macina(suo.d && suo.d.n);
    }

    const d = Object.assign({}, dati);
    if (this.duetempi) { delete d.n; d.hn = impegnoSaluto(this.lato, this.mioNonce); }
    else d.n = this.mioNonce;
    this.mioSaluto = d;
    return this.imbuca('S', 0, d);
  }

  /* IL SECONDO TEMPO. Si chiama a ogni giro del banco: parla da se'
     quando puo', e la regola d'oro vale anche per il pari onesto —
     niente rivelazione senza l'impegno dell'altro in casa. */
  async rivelaNonce() {
    if (this.mandataN) return null;

    if (!this.duetempi) {
      /* v1 NON HA UN SECONDO TEMPO. Il caso peggiore che resta al baro e'
         REIMBUCARE il saluto con un nonce diverso dopo aver visto quello
         dell'altro: la cassetta risponde 409 'gia-detto' e il gioco ha
         gia' letto il primo. E' la guardia del TRASPORTO, non quella del
         protocollo, e il cancello deve saperlo distinguere. */
      if (!this.bugia.semerivelato || this.ritentato) return null;
      const suo = this.suoNonce();
      if (!suo) return null;
      this.ritentato = true;
      this.nonceRivelato = this.macina(suo);
      const d = Object.assign({}, this.mioSaluto, { n: this.nonceRivelato });
      return this.imbuca('S', 0, d);
    }

    let n = this.mioNonce;
    if (this.bugia.semerivelato) {
      /* aspetta la rivelazione dell'altro, poi ne rivela una DIVERSA da
         quella impegnata: l'impegno esiste per bocciare esattamente
         questo, e se non lo boccia il cancello deve accorgersene */
      const suo = this.suoNonce();
      if (!suo) return null;
      n = this.macina(suo);
    } else if (!this.bugia.rivelasubito && !this.trova('S', this.altro, 0)) {
      return null;
    }
    this.mandataN = true;
    this.nonceRivelato = n;
    return this.imbuca('N', 0, { n });
  }

  /* L'IMPEGNO. `veggente` aspetta la RIVELAZIONE dell'altro: e' quel
     che un baro farebbe se il protocollo glielo lasciasse fare. */
  async impegna(t, scegli) {
    if (this.bugia.veggente) {
      for (let g = 0; g < 60 && !this.trova('R', this.altro, t); g++) await this.ritira();
      const sua = this.trova('R', this.altro, t);
      if (sua) this.sbirciato = sua.d.m;
    }
    const m = scegli(this.sbirciato);
    const n = esa(crypto.randomBytes(16));
    this.mieNonce[t] = n; this.mieMosse[t] = m;
    const h = impegnoDi(t, this.lato, this.bugia.bugiardo ? this.bugia.bugiardo(m) : m, n);
    return this.imbuca('I', t, { h });
  }

  async rivela(t, esito) {
    if (this.bugia.muto) { this.morto = true; return { ok: false, errore: 'sparito' }; }
    const e = this.bugia.esitosuo ? this.bugia.esitosuo(esito) : esito;
    return this.imbuca('R', t, { m: this.mieMosse[t], n: this.mieNonce[t], e });
  }

  /* sfrenato: ritira finche' il freno non morde. Deve prendere 429, e
     il banco deve vedere che il freno c'e'. */
  async raffica(quante) {
    for (let i = 0; i < quante; i++) await this.ritira();
    return this.rifiuti;
  }
}

/* LA ROSA DEL PARI FINTO, nella forma che `impaccaRosa` produce:
   [quanti, vel,tiro,tecnica,tackle, ...]. La prima versione mandava
   [1,2,3] — tre numeri qualsiasi — e il gioco rispondeva, giustamente,
   `rose-corte`: il banco stava misurando la propria pigrizia e non il
   protocollo. Un pari finto che non sa vestirsi non e' un avversario,
   e' un messaggio malformato: quello va provato apposta, non per sbaglio
   dentro a una prova che parla d'altro. */
function rosaFinta(sale) {
  const v = [5];
  for (let i = 0; i < 5; i++) {
    v.push(50 + ((i * 7 + sale * 3) % 30), 50 + ((i * 11 + sale * 5) % 30),
           50 + ((i * 5 + sale * 7) % 30), 50 + ((i * 13 + sale * 2) % 30));
  }
  return v;
}

/* l'identita' del pari finto: la conia la cassetta come per un telefono
   vero, perche' il freno e' per identita' e un pari senza identita' non
   sarebbe frenato da niente */
async function credenziali(base) {
  const r = await fetch(base + '/api/entra', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  return r.json();
}

module.exports = {
  RADICE, DISCHETTO_V, FRENO_TETTO, FRENO_SEC,
  serviGioco, serviCassetta, apri, collega, entra,
  PariFinto, credenziali, rosaFinta, impegnoDi, impegnoSaluto, testoMossa, mescola, esa,
};
