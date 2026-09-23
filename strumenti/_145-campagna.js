/* =====================================================================
   _145-campagna.js — LA CAMPAGNA DI MISURA DELLA RETE
   (voce #145, compito 2)

   Questa NON e' un cancello: e' una campagna. Tocca la rete vera,
   quindi non e' ripetibile, quindi non va in batteria (regola di casa:
   un cancello che ogni giorno dipende da un servizio esterno insegna a
   ignorarsi). Il cancello e' `_q-rete-latenza.js`, gira offline e
   misura IL METRO; questa alimenta il metro con la rete.

   ---------------------------------------------------------------
   DA DOVE MISURO, e sta scritto in ogni campione che deposito:
   UNA MACCHINA SOLA, Windows 10, su una connessione FISSA italiana, il
   23 settembre 2026. Nessun numero prodotto qui e' «la latenza di due
   telefoni italiani su rete mobile», e il deposito rifiuta di
   scriverlo (prova 1c del cancello).

   ---------------------------------------------------------------
   LE CINQUE SONDE

   A) LA NOSTRA INFRASTRUTTURA. RTT applicativo verso il deployment di
      produzione di `calcetto-rete` su Vercel. E' l'unica misura di
      casa: il pavimento di qualunque cosa passi da li', segnalazione
      compresa. Il metro NON la converte in D_rete, perche' un RTT
      verso un server non e' un percorso fra pari (prova 0j).

   B) UN RELAY WebSocket. Surroga DICHIARATA di Supabase Realtime, che
      da qui non e' misurabile (sonda D). Misura la FORMA — due gambe,
      jitter, coda, perdita — non il VALORE di Supabase.
      E c'e' una guardia che nasce da un inganno preso in faccia
      durante la ricognizione di questo cantiere: `echo.websocket.org`
      manda un messaggio di SALUTO appena apri la connessione, prima di
      echeggiare qualunque cosa. Chi cronometra «primo messaggio
      ricevuto» misura 2 ms e scrive che il relay e' velocissimo.
      Qui ogni pacchetto porta un numero di serie e si aspetta QUELLO.

   C) WebRTC. Tre domande: escono candidati riflessi con solo STUN?
      Che tipo di mappatura NAT ha questa rete — si confronta la porta
      mappata da DUE STUN diversi, che e' il modo classico di
      distinguere un NAT a cono da uno simmetrico? E un DataChannel si
      apre davvero? La latenza di un canale fra due pari sulla STESSA
      macchina e' locale, e il metro la rifiuta: e' giusto cosi', e la
      si misura lo stesso perche' dice quanto costa il TRASPORTO a
      parita' di rete zero.

   D) SUPABASE. Esiste un progetto sul piano in uso? Non e' una
      latenza, e' un fatto, e decide se la riga 167-168 di
      `rete/LEGGIMI.md` parla di qualcosa che c'e'.

   E) IL CONTROLLO DEL BANCO. Lo stesso client della sonda B contro un
      relay WebSocket sul loopback, scritto a mano qui dentro. Risponde
      alla sola domanda che potrebbe annullare la sonda B: la coda
      lunga e' della rete, o dell'anello degli eventi di Node?

   uso:  node strumenti/_145-campagna.js
         node strumenti/_145-campagna.js --sonde A,B --campioni 800
   esce  0 se ha misurato · 2 se e' esplosa · 3 se non c'e' niente da
         misurare (PROVA NULLA: la rete non c'e', o le sonde sono tutte
         fallite). MAI verde senza misura.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

const RADICE = path.resolve(__dirname, '..');
const M = require('./_145-metro-rete.js');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const SONDE = arg('sonde', 'A,B,E,C,D').split(',').map(s => s.trim().toUpperCase());
const NCAMP = parseInt(arg('campioni', '3000'), 10);
const DEPOSITO = path.join(RADICE, '_analisi', 'misura-rete-145.json');
const DA_DOVE = 'macchina di casa (Windows 10, connessione fissa italiana), 23 settembre 2026';

const dorm = (ms) => new Promise(r => setTimeout(r, ms));
const campioni = [];
const note = [];
const censimento = {};

/* ===================================================================== A */
async function sondaA() {
  const URL = 'https://calcetto-rete-bufeq9rla-just-news-projects.vercel.app/api/classifica';
  console.log('\nA) LA NOSTRA INFRASTRUTTURA — RTT applicativo verso calcetto-rete su Vercel');
  const n = Math.min(300, NCAMP);
  const mis = []; let persi = 0, stato = null, regione = null;
  for (let i = 0; i < n; i++) {
    const t0 = process.hrtime.bigint();
    try {
      const c = AbortSignal.timeout(M.SOGLIE.TETTO_MS);
      const r = await fetch(URL, { signal: c, cache: 'no-store', headers: { 'cache-control': 'no-cache' } });
      await r.arrayBuffer();
      mis.push(Number(process.hrtime.bigint() - t0) / 1e6);
      if (stato === null) { stato = r.status; regione = (r.headers.get('x-vercel-id') || '').split('::')[0]; }
    } catch (e) { persi++; }
    await dorm(60);
  }
  if (!mis.length) { console.log('   nessuna risposta: sonda fallita'); return false; }
  console.log('   stato HTTP ' + stato + ' · edge ' + (regione || '?') + ' · ' + mis.length + '/' + n + ' tornati');
  /* IL LIMITE, e va scritto nel campione e non in un commento: il
     deployment e' in PAUSA (DEPLOYMENT_PAUSED) e il progetto non ha
     nemmeno una variabile d'ambiente. Quindi l'edge risponde 503 SENZA
     invocare la funzione: questo numero e' la gamba di rete fino
     all'edge di Francoforte, NON un giro completo fino a Postgres.
     Un giro vero e' piu' lento, non piu' veloce. */
  campioni.push({
    sonda: 'A', data: '2026-09-23', sorgente: DA_DOVE + ' -> edge Vercel ' + (regione || '?'),
    tipo: 'http', misure: mis, persi, tettoMs: M.SOGLIE.TETTO_MS,
    note: 'deployment in PAUSA e progetto senza variabili d\'ambiente: l\'edge risponde ' + stato +
          ' SENZA invocare la funzione. E\' la gamba fino all\'edge, non un giro fino a Postgres. ' +
          'Un giro vero e\' PIU\' LENTO di questo, mai piu\' veloce.'
  });
  return true;
}

/* ===================================================================== B
   Un relay a eco. Ogni pacchetto porta un numero di serie e si aspetta
   QUELLO: la guardia contro il saluto di benvenuto. */
function relay(url, n, passo) {
  return new Promise((risolvi) => {
    const mis = []; const atteso = new Map(); let seq = 0, persi = 0, salutiScartati = 0;
    let w, chiuso = false, tAperta = 0;
    const fine = (causa) => {
      if (chiuso) return; chiuso = true;
      try { w && w.close(); } catch (e) {}
      risolvi({ mis, persi: persi + atteso.size, salutiScartati, causa, tAperta, inviati: seq });
    };
    const t0 = Date.now();
    try { w = new WebSocket(url); } catch (e) { return risolvi({ mis: [], persi: 0, causa: 'ctor ' + e.message }); }
    const scadenza = setTimeout(() => fine('tempo scaduto'), n * passo + 30000);
    w.onerror = () => { clearTimeout(scadenza); fine('errore di connessione'); };
    w.onclose = () => { clearTimeout(scadenza); fine('chiusa dal relay'); };
    w.onmessage = (m) => {
      const d = String(m.data);
      const g = d.match(/CALC145:(\d+)/);
      if (!g) { salutiScartati++; return; }      /* saluto o rumore: NON e' una misura */
      const k = +g[1], t = atteso.get(k);
      if (t === undefined) return;
      atteso.delete(k);
      mis.push(Date.now() - t);
    };
    w.onopen = async () => {
      tAperta = Date.now() - t0;
      for (let i = 0; i < n && !chiuso; i++) {
        const k = seq++;
        atteso.set(k, Date.now());
        try { w.send('CALC145:' + k); } catch (e) { atteso.delete(k); persi++; break; }
        /* chi non e' tornato entro il tetto e' perso, non lento */
        setTimeout(() => { if (atteso.has(k)) { atteso.delete(k); persi++; } }, M.SOGLIE.TETTO_MS);
        await dorm(passo);
      }
      await dorm(M.SOGLIE.TETTO_MS + 500);
      clearTimeout(scadenza); fine('completata');
    };
  });
}

async function sondaB() {
  console.log('\nB) UN RELAY WebSocket — surroga DICHIARATA di Supabase Realtime');
  const RELAY = [
    ['ws.postman-echo.com', 'wss://ws.postman-echo.com/raw', NCAMP, 40],
    ['echo.websocket.org', 'wss://echo.websocket.org/', Math.min(800, NCAMP), 50]
  ];
  let almeno = false;
  for (const [nome, url, n, passo] of RELAY) {
    process.stdout.write('   ' + nome + ' ... ');
    const r = await relay(url, n, passo);
    if (!r.mis.length) { console.log('fallito (' + r.causa + ')'); continue; }
    almeno = true;
    console.log(r.mis.length + '/' + r.inviati + ' tornati, ' + r.persi + ' persi, apertura ' + r.tAperta +
                ' ms' + (r.salutiScartati ? ', ' + r.salutiScartati + ' messaggi non-eco scartati' : ''));
    if (r.salutiScartati) note.push('Il relay ' + nome + ' ha mandato ' + r.salutiScartati +
      ' messaggi che non erano l\'eco del pacchetto: senza il numero di serie sarebbero diventati misure da pochi ms.');
    campioni.push({
      sonda: 'B', data: '2026-09-23', sorgente: DA_DOVE + ' -> relay ' + nome,
      tipo: 'relay', misure: r.mis, persi: r.persi, tettoMs: M.SOGLIE.TETTO_MS,
      note: 'SURROGA di Supabase Realtime, che da qui non e\' misurabile (sonda D). ' +
            'Misura la FORMA del percorso a due gambe, non il VALORE di Supabase. ' +
            'Ipotesi dichiarata: i due pari equidistanti dal relay. ' +
            'Guardia: ogni pacchetto porta un numero di serie e si aspetta quello, ' +
            'perche\' un relay che saluta all\'apertura regala un falso di pochi ms.'
    });
  }
  return almeno;
}

/* ===================================================================== E
   IL CONTROLLO DEL BANCO, e senza questo la sonda B non vale niente.

   La sonda B misura con `Date.now()` dentro un processo Node a un filo
   solo, che dorme fra un invio e l'altro. Se l'anello degli eventi si
   ferma 200 ms per una raccolta di memoria, quel ritardo finisce nella
   MISURA e diventa «coda della rete». E la coda e' precisamente cio'
   che decide questo cantiere: se fosse mia, il verdetto sarebbe mio e
   non della rete.

   Quindi si rigira lo STESSO client contro un relay WebSocket sul
   LOOPBACK — stesso codice, stesse dormite, stesso parsing dei
   fotogrammi, zero rete. Il relay e' scritto qui sotto a mano (la
   stretta di mano e' uno SHA-1 e un base64; i fotogrammi di testo corti
   sono venti righe) perche' il progetto non ha dipendenze e non e' il
   caso di aggiungerne una per un controllo.

   Il metro RIFIUTA questo campione, ed e' giusto: e' un giro locale.
   Serve solo a rispondere a una domanda: **la coda e' della rete o
   mia?** */
function relayLocale() {
  const net = require('net'), crypto = require('crypto');
  return new Promise((risolvi) => {
    const srv = net.createServer((sock) => {
      let fase = 0, buf = Buffer.alloc(0);
      sock.on('data', (d) => {
        buf = Buffer.concat([buf, d]);
        if (fase === 0) {
          const i = buf.indexOf('\r\n\r\n');
          if (i < 0) return;
          const testa = buf.slice(0, i).toString();
          buf = buf.slice(i + 4);
          const k = (testa.match(/Sec-WebSocket-Key: (.+)/i) || [])[1].trim();
          const a = crypto.createHash('sha1').update(k + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
          sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
                     'Sec-WebSocket-Accept: ' + a + '\r\n\r\n');
          fase = 1;
        }
        /* fotogrammi di testo corti e mascherati (il client maschera sempre) */
        while (buf.length >= 2) {
          const len = buf[1] & 127;
          if (len > 125) { buf = Buffer.alloc(0); break; }    /* i nostri sono corti */
          const mascherato = !!(buf[1] & 128);
          const testaLen = 2 + (mascherato ? 4 : 0);
          if (buf.length < testaLen + len) break;
          const m = mascherato ? buf.slice(2, 6) : null;
          const carico = Buffer.from(buf.slice(testaLen, testaLen + len));
          if (m) for (let j = 0; j < carico.length; j++) carico[j] ^= m[j & 3];
          buf = buf.slice(testaLen + len);
          /* si rimanda indietro lo stesso carico, non mascherato */
          const fuori = Buffer.alloc(2 + carico.length);
          fuori[0] = 0x81; fuori[1] = carico.length; carico.copy(fuori, 2);
          sock.write(fuori);
        }
      });
      sock.on('error', () => {});
    });
    srv.listen(0, '127.0.0.1', () => risolvi({ porta: srv.address().port, chiudi: () => srv.close() }));
  });
}

async function sondaE(n, passo) {
  console.log('\nE) IL CONTROLLO DEL BANCO — lo stesso client contro un relay su LOOPBACK');
  const s = await relayLocale();
  const r = await relay('ws://127.0.0.1:' + s.porta + '/', n, passo);
  s.chiudi();
  if (!r.mis.length) { console.log('   il relay locale non ha risposto: controllo non fatto'); return false; }
  console.log('   ' + r.mis.length + '/' + r.inviati + ' tornati, ' + r.persi + ' persi');
  campioni.push({
    sonda: 'E', data: '2026-09-23', sorgente: 'loopback 127.0.0.1 (relay WebSocket scritto a mano, stessa macchina)',
    tipo: 'relay', misure: r.mis, persi: r.persi, tettoMs: M.SOGLIE.TETTO_MS,
    note: 'NON e\' una misura di rete, ed e\' depositata apposta perche\' il metro la RIFIUTI (prova 0b). ' +
          'Risponde a UNA domanda sola: la coda lunga della sonda B e\' della rete o dell\'anello degli ' +
          'eventi di Node? Stesso client, stesse dormite, stesso parsing dei fotogrammi, zero rete.'
  });
  return true;
}

/* ===================================================================== C */
async function sondaC() {
  console.log('\nC) WebRTC — candidati riflessi, tipo di mappatura NAT, DataChannel');
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) { console.log('   playwright assente: sonda saltata'); return false; }
  const b = await chromium.launch();
  const pag = await (await b.newContext()).newPage();
  await pag.goto('about:blank');
  const out = await pag.evaluate(async () => {
    const STUN = ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302',
                  'stun:stun.cloudflare.com:3478'];

    /* --------------------------------------------------------------
       LA TRAPPOLA CHE QUESTO BANCO SI E' PRESO IN FACCIA, e che sta qui
       scritta perche' e' facilissima da rifare.

       La prima versione apriva TRE `RTCPeerConnection`, una per ogni
       STUN, e confrontava le porte mappate. Uscivano tre porte diverse
       (54986, 53587, 54035) e lo strumento stampava «NAT SIMMETRICO,
       serve un TURN» — cioe' condannava il P2P dell'intera onda E.

       Era falso. Tre connessioni diverse usano TRE SOCKET LOCALI
       DIVERSI, e un NAT qualunque, anche il piu' permissivo, da' a
       socket diversi porte esterne diverse. Quel banco misurava il
       proprio numero di socket.

       Il test giusto interroga piu' STUN DALLO STESSO SOCKET: si mette
       piu' di un server nello STESSO `iceServers`, e si contano i
       candidati riflessi DISTINTI. Uno solo => il NAT mappa quel socket
       alla stessa porta esterna verso destinazioni diverse, cioe'
       MAPPATURA INDIPENDENTE DALL'ENDPOINT e il P2P con solo STUN
       passa. Piu' di uno => mappatura dipendente, NAT simmetrico, e
       senza TURN non passa.

       E SERVE LA GUARDIA, o il test giusto mente al contrario: se due
       dei tre server non rispondessero, il candidato riflesso sarebbe
       uno solo lo stesso, e si concluderebbe «cono» misurando il
       silenzio. Percio' si fa PRIMA il giro uno-per-uno — che serve
       SOLO a provare che tutti e tre rispondono — e poi quello
       congiunto, che e' l'unico da cui si conclude.
       -------------------------------------------------------------- */
    async function raccogli(urls) {
      const pc = new RTCPeerConnection({ iceServers: [{ urls }], iceCandidatePoolSize: 0 });
      pc.createDataChannel('x');
      const cand = []; const t0 = performance.now();
      const fatto = new Promise(res => {
        pc.onicecandidate = (e) => { if (e.candidate) cand.push(e.candidate.candidate); else res(); };
        setTimeout(res, 10000);
      });
      await pc.setLocalDescription(await pc.createOffer());
      await fatto;
      const ms = performance.now() - t0;
      pc.close();
      const srflx = cand.filter(c => / typ srflx /.test(c));
      const rel = cand.filter(c => / typ relay /.test(c));
      const porte = srflx.map(c => { const p = c.split(' '); return p[4] + ':' + p[5]; });
      return { url: Array.isArray(urls) ? urls.join(' + ') : urls,
               tot: cand.length, srflx: srflx.length, relay: rel.length,
               porte, distinte: [...new Set(porte)].length, ms: Math.round(ms) };
    }
    /* 1) la GUARDIA: uno per uno, solo per sapere chi risponde.
          Da questi NON si conclude niente sulla mappatura. */
    const giri = [];
    for (const s of STUN) { try { giri.push(await raccogli(s)); } catch (e) { giri.push({ url: s, errore: String(e) }); } }
    /* 2) il TEST: tutti e tre dallo stesso socket, ripetuto tre volte
          perche' un solo giro su un banco a tempo reale non e' una prova. */
    const congiunti = [];
    for (let i = 0; i < 3; i++) {
      try { congiunti.push(await raccogli(STUN)); } catch (e) { congiunti.push({ errore: String(e) }); }
    }

    /* e un DataChannel VERO fra due pari sulla stessa macchina: dice se
       il codice regge, e quanto costa il trasporto a rete zero */
    let canale = null;
    try {
      const a = new RTCPeerConnection(), z = new RTCPeerConnection();
      a.onicecandidate = e => e.candidate && z.addIceCandidate(e.candidate);
      z.onicecandidate = e => e.candidate && a.addIceCandidate(e.candidate);
      const dc = a.createDataChannel('calcetto', { ordered: true, maxRetransmits: 0 });
      const pronto = new Promise(res => { dc.onopen = res; setTimeout(res, 8000); });
      const eco = new Promise(res => { z.ondatachannel = (e) => { e.channel.onmessage = (m) => e.channel.send(m.data); res(); }; setTimeout(res, 8000); });
      await a.setLocalDescription(await a.createOffer());
      await z.setRemoteDescription(a.localDescription);
      await z.setLocalDescription(await z.createAnswer());
      await a.setRemoteDescription(z.localDescription);
      await pronto; await eco;
      if (dc.readyState === 'open') {
        const mis = [];
        for (let i = 0; i < 400; i++) {
          const t = performance.now();
          const r = new Promise(res => { dc.onmessage = res; });
          dc.send('p' + i); await r;
          mis.push(performance.now() - t);
          await new Promise(res => setTimeout(res, 5));
        }
        canale = { aperto: true, misure: mis, byteHeader: 'SCTP/DTLS' };
      } else canale = { aperto: false };
      a.close(); z.close();
    } catch (e) { canale = { aperto: false, errore: String(e) }; }
    return { giri, congiunti, canale };
  });
  await b.close();

  console.log('   GUARDIA — uno STUN per volta (socket DIVERSI: da qui non si conclude la mappatura)');
  for (const g of out.giri) {
    if (g.errore) { console.log('     ' + g.url + ' -> errore ' + g.errore); continue; }
    console.log('     ' + g.url + ' -> ' + g.srflx + ' riflessi, ' + g.relay + ' di relay, ' +
                g.ms + ' ms' + (g.porte.length ? ' · mappato ' + g.porte.join(' ') : ''));
  }
  const rispondono = out.giri.filter(g => g.srflx > 0).length;
  console.log('     -> ' + rispondono + '/' + out.giri.length + ' STUN rispondono');

  console.log('   IL TEST — tutti e tre dallo STESSO socket, tre volte');
  for (const g of out.congiunti) {
    if (g.errore) { console.log('     errore ' + g.errore); continue; }
    console.log('     ' + g.srflx + ' riflessi, ' + g.distinte + ' porte mappate distinte' +
                (g.porte.length ? ' (' + [...new Set(g.porte)].join(' ') + ')' : '') + ', ' + g.ms + ' ms');
  }
  let mappatura;
  const buoni = out.congiunti.filter(g => !g.errore && g.srflx > 0);
  if (rispondono < 2) {
    mappatura = 'NON DETERMINATA: meno di due STUN rispondono, e un candidato solo puo\' essere silenzio';
  } else if (!buoni.length) {
    mappatura = 'NON DETERMINATA: nessun giro congiunto ha prodotto un candidato riflesso';
  } else if (buoni.every(g => g.distinte === 1)) {
    mappatura = 'INDIPENDENTE DALL\'ENDPOINT (NAT a cono): ' + rispondono + ' STUN diversi, interrogati ' +
                'dallo STESSO socket, vedono la STESSA porta esterna. Con solo STUN il P2P passa DA QUI.';
  } else {
    mappatura = 'DIPENDENTE DALL\'ENDPOINT (NAT simmetrico): lo stesso socket viene mappato a porte ' +
                'diverse verso destinazioni diverse. Con solo STUN il P2P NON passa: serve un TURN.';
  }
  console.log('   -> ' + mappatura);
  censimento.webrtc = {
    guardiaUnoPerUno: out.giri, testCongiunto: out.congiunti, mappatura,
    stunRispondono: rispondono + '/' + out.giri.length,
    canaleAperto: !!(out.canale && out.canale.aperto),
    limite: 'Misurato dalla rete FISSA di casa. Dice che il P2P con solo STUN passa DA QUI. ' +
            'Non dice niente sul CGNAT delle reti mobili italiane, che e\' proprio il caso duro.'
  };
  if (out.canale && out.canale.aperto) {
    const mis = out.canale.misure;
    console.log('   DataChannel aperto fra due pari SULLA STESSA MACCHINA: ' + mis.length + ' eco, mediana ' +
                mis.slice().sort((a, b) => a - b)[Math.floor(mis.length / 2)].toFixed(2) + ' ms');
    campioni.push({
      sonda: 'C', data: '2026-09-23', sorgente: 'stessa-macchina (due RTCPeerConnection in una pagina)',
      tipo: 'p2p', misure: mis, persi: 0, tettoMs: M.SOGLIE.TETTO_MS,
      note: 'NON e\' una misura di rete, ed e\' depositata apposta perche\' il metro la RIFIUTI ' +
            '(prova 0b): dice quanto costa il trasporto SCTP/DTLS a rete zero, cioe\' il pavimento ' +
            'che una rete vera non puo\' scendere sotto.'
    });
  } else {
    console.log('   DataChannel NON aperto' + (out.canale && out.canale.errore ? ': ' + out.canale.errore : ''));
  }
  return true;
}

/* ===================================================================== D */
async function sondaD() {
  console.log('\nD) SUPABASE — esiste un progetto sul piano in uso?');
  const fatti = [];
  /* 1. una chiave nel repo? il #138 aveva verificato zero chiavi su 1898
     file, e il cancello lo ricontrolla: qui si guarda solo se esiste un
     riferimento a un progetto, cioe' un sottodominio */
  const { execFileSync } = require('child_process');
  let rif = '';
  try {
    rif = execFileSync('git', ['grep', '-l', '-I', '-E', '[a-z]{20}\\.supabase\\.co'], { cwd: RADICE, encoding: 'utf8' });
  } catch (e) { rif = ''; }
  fatti.push(['riferimenti a un progetto Supabase nel repo (<ref>.supabase.co)',
              rif.trim() ? rif.trim().split('\n').length + ' file' : 'NESSUNO']);
  /* 2. variabili d'ambiente in questa sessione */
  const env = Object.keys(process.env).filter(k => /SUPABASE/i.test(k));
  fatti.push(['variabili d\'ambiente SUPABASE_* in questa sessione', env.length ? env.join(', ') : 'NESSUNA']);
  /* 3. il DNS con un riferimento inventato: se il carattere jolly
     rispondesse, non si potrebbe concludere niente da un NXDOMAIN */
  let jolly = '';
  try { await dns.lookup('abcdefghijklmnopqrst.supabase.co'); jolly = 'RISOLVE (c\'e\' un carattere jolly: il DNS non prova niente)'; }
  catch (e) { jolly = 'NXDOMAIN (nessun carattere jolly: un progetto inesistente non risolve)'; }
  fatti.push(['DNS di un riferimento inventato', jolly]);
  for (const [k, v] of fatti) console.log('   ' + k + ': ' + v);
  censimento.supabase = { fatti, conclusione: null };
  const c = (!rif.trim() && !env.length)
    ? 'NON ESISTE un progetto Supabase raggiungibile da qui: nessun riferimento nel repo, ' +
      'nessuna variabile d\'ambiente, e il progetto Vercel calcetto-rete non ha nemmeno una ' +
      'variabile configurata. La riga 167-168 di rete/LEGGIMI.md descrive un trasporto che ' +
      'oggi non e\' collegato a niente.'
    : 'un riferimento esiste: la misura di Supabase Realtime va rifatta contro il progetto vero.';
  censimento.supabase.conclusione = c;
  console.log('   -> ' + c);
  return true;
}

/* ===================================================================== */
(async () => {
  console.log('LA CAMPAGNA DI MISURA DELLA RETE — voce #145');
  console.log('DA DOVE: ' + DA_DOVE);
  console.log('Nessun numero prodotto qui e\' «la latenza di due telefoni italiani su rete mobile».');
  let riuscite = 0;

  /* --rileggi: rigiudica il deposito SENZA toccare la rete. Si puo'
     fare perche' il metro e' puro — prende campioni e rende un referto
     — e serve a due cose: rileggere un verdetto senza rimisurare
     (quindi senza cambiarlo per caso), e provare su una misura vera
     che il metro e' deterministico. */
  if (process.argv.includes('--rileggi')) {
    if (!fs.existsSync(DEPOSITO)) { console.log('\n>>> PROVA NULLA: non c\'e\' niente di depositato.'); process.exit(3); }
    const d = JSON.parse(fs.readFileSync(DEPOSITO, 'utf8'));
    for (const c of (d.campioni || [])) if (c.misure) campioni.push(c);
    if (d.censimento) Object.assign(censimento, d.censimento);
    for (const n of (d.note || [])) note.push(n);
    console.log('\n(RILETTURA del deposito del ' + d.data + ': nessuna rete toccata)');
  } else
  try {
    if (SONDE.includes('A') && await sondaA()) riuscite++;
    if (SONDE.includes('B') && await sondaB()) riuscite++;
    if (SONDE.includes('E') && await sondaE(Math.min(3000, NCAMP), 40)) riuscite++;
    if (SONDE.includes('C') && await sondaC()) riuscite++;
    if (SONDE.includes('D') && await sondaD()) riuscite++;
  } catch (e) {
    console.log('\n>>> LA CAMPAGNA E\' ESPLOSA: ' + e.message);
    console.log(e.stack);
    process.exit(2);
  }

  if (!campioni.length) {
    console.log('\n>>> PROVA NULLA: nessuna sonda ha prodotto un campione. La rete non c\'e\', o');
    console.log('    i servizi non rispondono. Non si scrive un numero, e non si dichiara verde.');
    process.exit(3);
  }

  /* ---------------------------------------------------- il referto */
  console.log('\n' + '='.repeat(72));
  console.log('IL REFERTO — ogni numero con la sua sorgente\n');
  for (const c of campioni) {
    const r = M.referto(c);
    const g = M.giudica(r);
    console.log('[' + c.sonda + '] ' + c.sorgente);
    console.log('    tipo ' + r.tipo + ' · ' + r.inviati + ' inviati, ' + r.tornati + ' tornati, ' +
                r.persi + ' persi (' + (r.perditaPct === null ? '—' : r.perditaPct.toFixed(2) + '%') + ')');
    const f = (x) => (x === null || x === undefined) ? '—' : (isFinite(x) ? x.toFixed(1) : 'inf');
    if (r.causa) {
      /* un rifiuto NON deve nascondere la misura: il metro si rifiuta di
         convertirla in D_rete, ma i numeri grezzi restano un fatto e
         servono (l'RTT verso il nostro edge e' il pavimento di tutto
         cio' che passa da li'; il giro locale dice se la coda e' mia) */
      if (r.p50 !== undefined) {
        console.log('    grezzo   p50 ' + f(r.p50) + '  p95 ' + f(r.p95) + '  p99 ' + f(r.p99) +
                    '  ' + r.pStalloEtichetta + ' ' + f(r.pStallo) + '  max ' + f(r.max) + '  jitter ' + f(r.jitter));
      }
      console.log('    RIFIUTATO dal metro: ' + r.causa + ' — ' + (r.nota || ''));
      console.log('    (il rifiuto vale per D_rete; i numeri grezzi qui sopra restano un fatto)');
      console.log(); continue;
    }
    console.log('    grezzo   p50 ' + f(r.p50) + '  p95 ' + f(r.p95) + '  p99 ' + f(r.p99) +
                '  ' + r.pStalloEtichetta + ' ' + f(r.pStallo) + '  max ' + f(r.max) + '  jitter ' + f(r.jitter));
    console.log('    andata   ' + r.percorso);
    console.log('             p50 ' + f(r.andata_p50) + '  p95 ' + f(r.andata_p95) + '  p99 ' + f(r.andata_p99));
    console.log('    D_rete   ' + f(r.D_rete_ms) + ' ms = ' + f(r.D_rete_tick) + ' tick' +
                '   ·   D_stallo ' + f(r.D_stallo_ms) + ' ms = ' + f(r.D_stallo_tick) + ' tick' +
                ' (' + r.nOltreStallo + ' campioni in quella coda)');
    /* la ridondanza di §2.4 del progetto d'onda: ogni pacchetto porta
       gli ultimi R comandi, quindi uno stallo chiede che R pacchetti
       CONSECUTIVI siano in ritardo. E' la mitigazione piu' a buon
       mercato che esista, e va messa accanto al numero severo o il
       verdetto sembra piu' chiuso di quanto sia. STIMA: assume perdite
       indipendenti, e le perdite di rete arrivano a raffica. */
    console.log('    con ridondanza R=3 (STIMA, perdite indipendenti): D_stallo ' +
                f(r.D_stallo_R3_ms) + ' ms = ' + f(r.D_stallo_R3_ms / M.TICK_MS) + ' tick');
    if (r.stalli) {
      /* la domanda detta dalla parte di chi gioca */
      for (const s of r.stalli) {
        console.log('    se D = ' + s.D_tick + ' tick (' + s.D_ms.toFixed(0) + ' ms): la partita si ferma ' +
                    s.alMinuto.toFixed(1) + ' volte al minuto' +
                    (s.oltre ? ', in media ' + s.durataMedia_ms.toFixed(0) + ' ms (peggiore ' +
                     s.durataMax_ms.toFixed(0) + ' ms)' : '') +
                    '   [soglia S3: < 1/minuto, mai oltre ' + M.SOGLIE.S3_STALLO_MAX_MS + ' ms]');
      }
    }
    if (r.raffica) {
      const q = r.raffica.quotaPct;
      console.log('    raffica  ' + r.raffica.attaccati + ' dei ' + r.raffica.sopra + ' campioni sopra il p95 ' +
                  'hanno subito prima un altro sopra il p95 = ' + f(q) + '% (se indipendenti: 5%)' +
                  (q !== null && q > 15 ? '  ->  LA CODA ARRIVA A RAFFICA: la stima con ridondanza NON vale' :
                   q !== null ? '  ->  coda sparsa: la stima con ridondanza regge' : ''));
    }
    console.log('    IC p95   [' + f(r.icP95[0]) + ', ' + f(r.icP95[1]) + '] semiampiezza ' + f(r.icSemiampiezza) +
                ' ms · N minimo ' + (r.nMinimo || '—'));
    for (const riga of g.righe) console.log('    ' + riga.esito.padEnd(12) + riga.soglia + '  [' + riga.det + ']');
    console.log('    ESITO: ' + g.esito);
    console.log();
  }
  if (note.length) { console.log('NOTE DI MISURA:'); for (const n of note) console.log('  · ' + n); console.log(); }

  /* ---------------------------------------------------- il deposito */
  if (!fs.existsSync(path.dirname(DEPOSITO))) fs.mkdirSync(path.dirname(DEPOSITO), { recursive: true });
  /* UNA GUARDIA PAGATA SUBITO. Una corsa con `--sonde E` per provare una
     modifica ha riscritto il deposito con UN campione solo al posto di
     cinque, e la misura buona era gia' committata: si e' ripresa da li'.
     La prossima volta potrebbe non esserlo. Quindi una corsa PARZIALE
     non sovrascrive un deposito piu' ricco: si ferma e dice come
     forzarla. Un attrezzo che cancella una misura per distrazione e'
     peggio di un attrezzo che non misura. */
  if (fs.existsSync(DEPOSITO) && !process.argv.includes('--sovrascrivi')) {
    const q = JSON.parse(fs.readFileSync(DEPOSITO, 'utf8'));
    const vecchieSonde = new Set((q.campioni || []).filter(x => x.misure).map(x => x.sonda));
    const nuoveSonde = new Set(campioni.map(x => x.sonda));
    const perse = [...vecchieSonde].filter(s => !nuoveSonde.has(s));
    if (perse.length) {
      console.log('\n>>> NON SOVRASCRIVO: il deposito ha le sonde ' + [...vecchieSonde].join(',') +
                  ' e questa corsa ne porta ' + [...nuoveSonde].join(',') + '.');
      console.log('    Perderei ' + perse.join(',') + '. Rilancia con tutte le sonde, oppure --sovrascrivi');
      console.log('    se e\' proprio quel che vuoi. Il referto qui sopra resta valido e stampato.');
      process.exit(0);
    }
  }
  /* la letteratura sta in un file SUO, versionato a parte: i numeri che
     non sono miei non si rigenerano a ogni corsa, e non si mescolano mai
     coi campioni misurati */
  const fLett = path.join(RADICE, '_analisi', 'misura-rete-145-letteratura.json');
  const letteratura = fs.existsSync(fLett) ? (JSON.parse(fs.readFileSync(fLett, 'utf8')).voci || []) : [];
  fs.writeFileSync(DEPOSITO, JSON.stringify({
    voce: 145, data: '2026-09-23', daDove: DA_DOVE,
    avvertenza: 'Misure da UNA macchina su connessione FISSA italiana. Non sono, e non vanno ' +
                'citate come, misure da due telefoni italiani su rete mobile.',
    censimento, note,
    campioni: campioni.concat(letteratura)
  }, null, 1) + '\n');
  console.log('depositato in ' + path.relative(RADICE, DEPOSITO) + ' (' + campioni.length + ' campioni misurati, ' +
              letteratura.filter(x => x.letteratura).length + ' voci di letteratura, ' +
              letteratura.filter(x => x.non_reperito).length + ' assenze dichiarate)');
  process.exit(0);
})();
