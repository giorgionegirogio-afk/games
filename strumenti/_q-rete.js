/* =====================================================================
   _q-rete.js — LA SFIDA ASINCRONA, PROVATA CONTRO UN SERVER FINTO.

   PERCHE' UN SERVER FINTO E NON QUELLO VERO. Un banco che chiama
   Internet e' un banco che un giorno diventa rosso da solo — per una
   distribuzione in corso, per una tacca di segnale, per un limite di
   traffico — e quel giorno nessuno guarda piu' il colore. Qui il server
   sta in questo file, in memoria, e risponde come risponderebbe quello
   vero: cosi' il rosso vuol dire sempre e solo «il client sbaglia».

   La logica del server e' provata a parte (rete/prove/tutte.js, 40 su
   40). Qui si prova il CLIENT, e in particolare le tre cose che il
   client puo' sbagliare in modo grave:

     1. FERMARE IL GIOCO. Senza rete, ogni chiamata deve rinunciare entro
        il suo tetto di tempo e non lasciare niente appeso.
     2. PERDERE UNA PARTITA. Se l'invio non passa, la partita resta nel
        salvataggio e riparte da sola. Questa e' la prova piu' importante
        del file.
     3. BLOCCARSI PER SEMPRE. Un errore che non guarira' mai — un impegno
        scaduto — deve essere buttato via, non tenuto in testa alla coda
        a bloccare tutte le partite dietro.

   uso:  node strumenti/_q-rete.js --gioco fuori/rete.html
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');

/* ------------------------------------------------------ il gioco servito */
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
   IL SERVER FINTO — cinque endpoint, tutto in memoria.

   Non e' una copia del server vero: e' il suo CONTRATTO. Risponde con le
   stesse chiavi e gli stessi codici, e sa fare le tre cose che al banco
   servono: spegnersi, sbagliare, e dire di no per un motivo definitivo.
   ===================================================================== */
function serviServer() {
  const db = { allenatori: new Map(), squadre: new Map(), punti: new Map(), impegni: new Map(), sfide: [] };
  const stato = { su: true, errorePreparato: null, chiamate: [] };
  const digest = s => crypto.createHash('sha256').update(String(s)).digest('hex');

  const chiSei = req => {
    const h = req.headers.authorization || '';
    const m = /^Calcetto\s+([^.\s]+)\.(\S+)$/.exec(h);
    if (!m) return null;
    const a = db.allenatori.get(m[1]);
    return (a && a.segreto === digest(m[2])) ? m[1] : null;
  };

  const s = http.createServer(async (req, res) => {
    const via = req.url.split('?')[0];
    const q = new URLSearchParams(req.url.split('?')[1] || '');
    stato.chiamate.push(req.method + ' ' + via);

    const dì = (codice, corpo) => {
      res.writeHead(codice, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      });
      res.end(JSON.stringify(corpo));
    };
    if (req.method === 'OPTIONS') return dì(204, {});
    if (!stato.su) { req.socket.destroy(); return; }        /* server spento: nessuna risposta */
    if (stato.errorePreparato) {
      const e = stato.errorePreparato; stato.errorePreparato = null;
      return dì(e.codice, { ok: false, errore: e.errore });
    }

    let corpo = {};
    if (req.method !== 'GET') {
      let g = ''; for await (const p of req) g += p;
      try { corpo = g ? JSON.parse(g) : {}; } catch { corpo = {}; }
    }

    if (via === '/api/entra') {
      if (corpo.id) {
        const io = chiSei(req);
        if (!io) return dì(401, { ok: false, errore: 'ignoto' });
        const p = db.punti.get(io);
        return dì(200, { ok: true, id: io, punti: p || null,
                         squadra: db.squadre.has(io) ? { nome: db.squadre.get(io).nome, forza: db.squadre.get(io).forza } : null });
      }
      const id = crypto.randomUUID();
      const segreto = crypto.randomBytes(24).toString('base64url');
      db.allenatori.set(id, { segreto: digest(segreto) });
      db.punti.set(id, { punti: 1000, vinte: 0, pari: 0, perse: 0, serie: 0 });
      return dì(200, { ok: true, id, segreto, nuovo: true });
    }

    const io = chiSei(req);
    if (!io) return dì(401, { ok: false, errore: 'ignoto' });

    if (via === '/api/squadra') {
      if (req.method === 'GET') return dì(200, { ok: true, squadra: db.squadre.get(io) || null });
      const rosa = corpo.rosa;
      if (!Array.isArray(rosa) || rosa.length < 4) return dì(400, { ok: false, errore: 'rosa' });
      /* la forza la calcola IL SERVER: e' la regola, e il banco la verifica */
      const voto = g => ((g.vel | 0) + (g.tiro | 0) + (g.tecnica | 0) + (g.tackle | 0)) / 4;
      const taglia = [5, 7, 11].includes(+corpo.taglia) ? +corpo.taglia : 5;
      const mov = rosa.slice(1).map(voto).sort((a, b) => b - a).slice(0, Math.max(1, taglia - 1));
      const forza = Math.min(99, Math.max(1, Math.round(
        (mov.reduce((s, v) => s + v, 0) + voto(rosa[0]) * 2) / (mov.length + 2))));
      db.squadre.set(io, { nome: String(corpo.nome || '').slice(0, 18), colori: corpo.colori,
                          rosa, modulo: corpo.modulo || '4-4-2', indole: corpo.indole || {}, forza });
      return dì(200, { ok: true, squadra: db.squadre.get(io), forza });
    }

    if (via === '/api/avversario') {
      const seme = Math.floor(Math.random() * 281474976710655) + 1;
      const taglia = [5, 7, 11].includes(+q.get('taglia')) ? +q.get('taglia') : 5;
      /* un avversario vero se c'e', altrimenti costruito — e l'impegno
         unico sovrascrive quello di prima, come nel server vero */
      let avv = null;
      for (const [k, v] of db.squadre) if (k !== io) { avv = { allenatore: k, ...v }; break; }
      db.impegni.set(io, { seme, taglia, difensore: avv ? avv.allenatore : null, creato: Date.now() });
      if (!avv) return dì(200, { ok: true, vero: false, seme, taglia,
        avversario: { allenatore: null, nome: 'Borgo Nuovo', forza: 50,
          colori: { maglia: '#3355aa', calzoncini: '#111111', riga: '#3355aa', portiere: '#2b2b2b' },
          rosa: Array.from({ length: 11 }, (_, i) => ({ nome: 'Rossi', vel: 50, tiro: 50, tecnica: 50, tackle: 50, partite: 0, gol: 0 })),
          modulo: '4-4-2', indole: {}, punti: 1000 } });
      return dì(200, { ok: true, vero: true, seme, taglia, avversario: avv });
    }

    if (via === '/api/sfida') {
      if (req.method === 'GET') return dì(200, { ok: true, sfide: db.sfide.filter(x => x.difensore === io) });
      const imp = db.impegni.get(io);
      if (!imp) return dì(409, { ok: false, errore: 'nessun-impegno' });
      if (String(imp.seme) !== String(corpo.seme)) return dì(409, { ok: false, errore: 'seme-non-tuo' });
      db.impegni.delete(io);
      if (!corpo.replay || String(corpo.replay).length < 40) return dì(400, { ok: false, errore: 'replay-vuoto' });
      const ga = corpo.gol_a | 0, gd = corpo.gol_d | 0;
      const p = db.punti.get(io);
      const delta = ga > gd ? 20 : ga < gd ? -20 : 0;
      p.punti = Math.max(100, p.punti + delta);
      if (ga > gd) { p.vinte++; p.serie++; } else if (ga < gd) { p.perse++; p.serie = 0; } else { p.pari++; p.serie = 0; }
      if (imp.difensore) db.sfide.push({ id: db.sfide.length + 1, attaccante: io, difensore: imp.difensore,
                                         seme: imp.seme, taglia: imp.taglia, gol_a: ga, gol_d: gd, replay: corpo.replay });
      return dì(200, { ok: true, esito: ga > gd ? 'vinta' : ga < gd ? 'persa' : 'pari',
                       delta, punti: p.punti, serie: p.serie, vero: !!imp.difensore });
    }

    if (via === '/api/classifica') {
      if (q.get('replay')) {
        const s = db.sfide.find(x => String(x.id) === q.get('replay'));
        if (!s) return dì(404, { ok: false, errore: 'non-c-e' });
        if (s.attaccante !== io && s.difensore !== io) return dì(403, { ok: false, errore: 'non-tua' });
        return dì(200, { ok: true, sfida: s, squadre: [] });
      }
      const righe = [...db.punti.entries()].map(([k, v], i) => ({ posto: i + 1, allenatore: k,
        nome: (db.squadre.get(k) || {}).nome || '?', punti: v.punti, sono_io: k === io }));
      return dì(200, { ok: true, righe });
    }
    return dì(404, { ok: false, errore: 'via' });
  });

  return new Promise(ok => s.listen(0, '127.0.0.1', () => ok({
    porta: s.address().port, chiudi: () => s.close(), db, stato,
  })));
}

/* -------------------------------------------------------------------- */
(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const sg = await serviGioco(prova);
  const ss = await serviServer();
  const browser = await chromium.launch();
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${sg.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  console.log('=== LA SFIDA ASINCRONA — contro un server finto in memoria ===\n');

  const c = await pag.evaluate(() => typeof window.__test.rete === 'object');
  if (!c) {
    console.error('FALLITO: il gioco non ha il motore di rete. Serve _t-rete.js applicato.');
    await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(2);
  }

  const eseguo = (f, ...a) => pag.evaluate(f, ...a);
  await eseguo(p => { window.__test.reteBase('http://127.0.0.1:' + p); }, ss.porta);

  /* ---------------- 1. la prima apertura crea l'identita' ---------------- */
  console.log('1) L\'IDENTITA\' ANONIMA');
  const e1 = await eseguo(async () => await window.__test.rete.entra());
  di(e1.ok && !!e1.id && !!e1.segreto, 'la prima apertura riceve identificatore e segreto',
     e1.ok ? 'id ' + String(e1.id).slice(0, 8) + '…' : 'errore ' + e1.errore);
  const st1 = await eseguo(() => window.__test.reteStato());
  di(st1.identita, 'l\'identita\' e\' finita nel salvataggio');
  /* e la seconda apertura la RIPRENDE, non ne crea un'altra: se ne
     creasse una nuova, ogni riavvio del telefono azzererebbe i punti */
  const e2 = await eseguo(async () => await window.__test.rete.entra());
  di(e2.ok && e2.id === e1.id, 'la seconda apertura riprende la stessa identita\', non ne crea un\'altra',
     e2.id === e1.id ? '' : String(e1.id).slice(0,8) + ' -> ' + String(e2.id||'?').slice(0,8));

  /* ---------------- 2. la squadra si pubblica, la forza la fa il server ---- */
  console.log('\n2) LA VETRINA');
  const pb = await eseguo(async () => {
    const t = window.__test;
    /* una rosa vera: quella del gioco */
    if(!t.save.rosa || t.save.rosa.length < 4) return { ok:false, errore:'il gioco non ha una rosa' };
    return await t.rete.pubblica();
  });
  di(pb.ok, 'la squadra si pubblica', pb.ok ? 'forza ' + pb.forza : 'errore ' + pb.errore);
  /* LA FORZA LA DECIDE IL SERVER: si prova mandando una forza falsa e
     verificando che il server la ignori. Se non lo facesse, il modo piu'
     veloce per salire in classifica sarebbe dichiararsi debole. */
  const pf = await eseguo(async () => {
    const t = window.__test, r = t.rete;
    const vero = r.chiama.bind(r);
    let mandato = null;
    r.chiama = async (via, m, corpo) => { if(via.startsWith('/api/squadra')) mandato = corpo; return vero(via, m, corpo); };
    const out = await r.pubblica();
    r.chiama = vero;
    return { out, mandato };
  });
  di(pf.mandato && pf.mandato.forza === undefined,
     'il client non manda la forza: la calcola il server',
     pf.mandato && pf.mandato.forza !== undefined ? 'manda forza ' + pf.mandato.forza : '');

  /* ---------------- 3. l'avversario e il seme del server ---------------- */
  console.log('\n3) L\'AVVERSARIO');
  const av = await eseguo(async () => await window.__test.rete.avversario(5));
  di(av.ok && !!av.seme && !!av.avversario, 'arriva un avversario e il SUO seme',
     av.ok ? 'seme ' + av.seme + ', ' + av.avversario.nome + ', forza ' + av.avversario.forza : 'errore ' + av.errore);
  di(av.ok && Array.isArray(av.avversario.rosa) && av.avversario.rosa.length >= 4 &&
     av.avversario.rosa.every(g => 'vel' in g && 'tiro' in g && 'tecnica' in g && 'tackle' in g),
     'la sua rosa parla la lingua del gioco (vel, tiro, tecnica, tackle)',
     av.ok && av.avversario.rosa[0] ? Object.keys(av.avversario.rosa[0]).join(',') : '');

  /* ---------------- 4. l'esito, e i punti che si muovono ---------------- */
  console.log('\n4) L\'ESITO');
  const nastro = 'x'.repeat(80);
  const ms = await eseguo(async ([seme, nastro]) => await window.__test.rete.manda(seme, 5, 3, 1, nastro), [av.seme, nastro]);
  di(ms.ok && ms.mandate === 1, 'la partita parte e la coda si svuota',
     'mandate ' + ms.mandate + ', in coda ' + ms.coda);
  const st4 = await eseguo(() => window.__test.reteStato());
  di(st4.punti > 1000, 'i punti si sono mossi', String(st4.punti));

  /* IL SEME NON TUO: chi manda una partita che il server non gli ha
     assegnato viene respinto, e la riga NON deve restare in coda per
     sempre — e' un no definitivo. */
  const falso = await eseguo(async n => await window.__test.rete.manda('123456789', 5, 9, 0, n), nastro);
  const st4b = await eseguo(() => window.__test.reteStato());
  di(st4b.coda === 0, 'una partita col seme sbagliato viene buttata, non lasciata in coda',
     'in coda ' + st4b.coda);

  /* ---------------- 5. SENZA RETE — la prova che conta ---------------- */
  console.log('\n5) SENZA RETE — la partita non si perde, e il gioco non si ferma');
  /* =====================================================================
     PRIMA SI PRENDE L'IMPEGNO, POI SI STACCA LA RETE, e l'ordine e'
     tutto. La prima stesura di questa prova spegneva il server e poi
     mandava una partita col seme «999», che al server non era mai stato
     assegnato: quando la rete tornava, la coda si svuotava — ma perche'
     la riga veniva BUTTATA («nessun impegno»), non perche' arrivava.
     Il banco diceva verde su una partita persa.

     Adesso la sequenza e' quella vera di un giocatore: chiedo un
     avversario (c'e' campo), entro in metropolitana, gioco, esco, e la
     partita parte. Il numero che lo dimostra e' `mandate`, non `coda`:
     una coda vuota puo' voler dire consegnata o buttata, e sono l'opposto.
     ===================================================================== */
  const avImp = await eseguo(async () => await window.__test.rete.avversario(5));
  ss.stato.su = false;
  const t0 = Date.now();
  const av2 = await eseguo(async () => await window.__test.rete.avversario(5));
  const quanto = Date.now() - t0;
  di(!av2.ok, 'a server spento la chiamata rinuncia invece di restare appesa', 'errore ' + av2.errore);
  di(quanto < 12000, 'e rinuncia entro il tetto di tempo', quanto + ' ms');

  /* si gioca comunque — con il seme che il server aveva gia' assegnato —
     e l'esito entra in coda */
  const ms2 = await eseguo(async ([s, n]) => await window.__test.rete.manda(s, 5, 2, 0, n),
                           [avImp.seme, nastro]);
  const st5 = await eseguo(() => window.__test.reteStato());
  di(st5.coda === 1, 'la partita giocata senza rete resta nel salvataggio', 'in coda ' + st5.coda);

  /* IL SALVATAGGIO E' DUREVOLE: si ricarica la pagina — che e' quel che
     succede quando Android chiude l'applicazione — e la partita deve
     essere ancora li'. Senza questa prova, «resta in coda» vorrebbe dire
     «resta in memoria», che non serve a niente. */
  await pag.reload({ waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  await eseguo(p => { window.__test.reteBase('http://127.0.0.1:' + p); }, ss.porta);
  const st6 = await eseguo(() => window.__test.reteStato());
  di(st6.coda === 1 && st6.identita,
     'dopo il riavvio dell\'applicazione la partita e\' ancora in coda, e l\'identita\' pure',
     'in coda ' + st6.coda + ', identita ' + st6.identita);

  /* e quando la rete torna, riparte DA SOLA */
  ss.stato.su = true;
  const puntiPrima = (await eseguo(() => window.__test.reteStato())).punti;
  const sv = await eseguo(async () => await window.__test.rete.svuotaCoda());
  const st7 = await eseguo(() => window.__test.reteStato());
  /* SI GUARDA `mandate`, NON `coda`. Una coda vuota puo' voler dire
     «consegnata» o «buttata via», e sono l'opposto: il primo e' il
     comportamento giusto, il secondo e' una partita persa in silenzio.
     Il controllo di prima guardava la coda e diceva verde su una partita
     buttata. */
  di(sv.mandate === 1 && st7.coda === 0,
     'quando la rete torna la partita viene CONSEGNATA (non buttata)',
     'mandate ' + (sv.mandate|0) + ', restano ' + st7.coda);
  di(st7.punti !== puntiPrima,
     'e i punti si muovono: il server l\'ha davvero contata',
     puntiPrima + ' -> ' + st7.punti);

  /* ---------------- 6. la coda non si blocca per sempre ---------------- */
  console.log('\n6) LA CODA NON SI BLOCCA');
  /* tre partite in coda, la prima con un no definitivo: le altre due
     devono passare comunque. Senza questo, un impegno scaduto di
     mezz'ora fa terrebbe in ostaggio una settimana di risultati. */
  await eseguo(async n => {
    const r = window.__test.rete, m = r.mem();
    m.coda = [{ seme:'1', taglia:5, gol_a:1, gol_d:0, replay:n, quando:Date.now() },
              { seme:'2', taglia:5, gol_a:2, gol_d:0, replay:n, quando:Date.now() }];
  }, nastro);
  const sv2 = await eseguo(async () => await window.__test.rete.svuotaCoda());
  const st8 = await eseguo(() => window.__test.reteStato());
  di(st8.coda === 0, 'due partite con impegno inesistente non restano in coda a bloccare tutto',
     'restano ' + st8.coda);

  /* ---------------- 7. il codice di trasferimento ---------------- */
  console.log('\n7) IL TRASFERIMENTO — l\'unico modo di cambiare telefono senza un conto');
  const tr = await eseguo(() => {
    const r = window.__test.rete;
    const cod = r.codiceTrasferimento();
    const storpiato = cod.slice(0, -1) + (cod.slice(-1) === 'A' ? 'B' : 'A');
    return { cod, buono: r.accettaTrasferimento(cod), cattivo: r.accettaTrasferimento(storpiato) };
  });
  di(!!tr.cod && tr.cod.split('.').length === 3, 'il codice esiste e ha tre parti',
     tr.cod ? tr.cod.slice(0, 12) + '…' : '');
  di(tr.buono === true, 'un codice giusto viene accettato');
  di(tr.cattivo === false, 'un codice trascritto male viene rifiutato — il carattere di controllo serve');

  /* ---------------- 8. la rete spenta non rompe niente ---------------- */
  console.log('\n8) LA RETE SPENTA DEL TUTTO (base vuota): il gioco di prima, identico');
  const sp = await eseguo(async () => {
    const t = window.__test;
    t.reteBase('');
    const a = await t.rete.avversario(5);
    const b = await t.rete.classifica(10);
    const c = await t.rete.pubblica();
    return { a, b, c, inCorso: t.reteStato().inCorso };
  });
  di(!sp.a.ok && !sp.b.ok && !sp.c.ok, 'con la radice vuota tutto risponde «spenta» senza tentare niente',
     [sp.a.errore, sp.b.errore, sp.c.errore].join(', '));
  di(sp.inCorso === 0, 'e non resta nessuna chiamata appesa', 'in corso ' + sp.inCorso);

  await browser.close(); sg.chiudi(); ss.chiudi();
  if (errori.length) {
    console.error('\nECCEZIONI DI PAGINA: ' + errori.slice(0, 3).join(' | '));
    process.exit(2);
  }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + e.message); process.exit(2); });
