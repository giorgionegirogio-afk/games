/* =====================================================================
   _q-sfida.js — LA SCHERMATA DELLA SFIDA, PROVATA COL DITO E COL SERVER.

   _q-rete.js prova il MOTORE (chi parla col server e come tiene la coda).
   Questo prova quello che il motore non puo' provare: la voce di menu, la
   schermata, la partita che parte col seme del server, l'esito che torna
   indietro col nastro, e il replay.

   IL SERVER E' FINTO E STA QUI DENTRO, come in _q-rete.js e per la stessa
   ragione: un banco che chiama Internet e' un banco che un giorno diventa
   rosso da solo, e quel giorno nessuno guarda piu' il colore. Rispetto a
   quello di _q-rete.js questo sa una cosa in piu' — restituisce le DUE
   ROSE insieme al replay, come fa il server vero (rete/api/classifica.js:
   «le due rose servono a rimontare la scena») — perche' senza non si puo'
   provare la prova piu' importante del file:

     IL DIFENSORE RIGIOCA IL NASTRO E OTTIENE LO STESSO PUNTEGGIO.

   E' l'unica cosa che rende onesto il bottone GUARDA. Un replay che
   mostra 3-0 dove il tabellone dice 1-2 e' peggio di nessun replay: e' il
   gioco che si contraddice da solo davanti a chi l'ha subito.

   DUE PAGINE, DUE TELEFONI. La pagina A attacca, la pagina B difende e
   poi guarda. Sono due contesti separati del browser: due salvataggi
   diversi, due identita' diverse, esattamente come due telefoni.

   uso:  node strumenti/_q-sfida.js --gioco fuori/sfidaui.html
         node strumenti/_q-sfida.js --guasto-replay    (deve uscire rosso)
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se il gioco indicato non ha la schermata (prova nulla).
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
const SOLOBARRA = process.argv.indexOf('--solo-barra') > 0;
/* IL CONTROLLO NEGATIVO DELLA SEZIONE 9 — due modi, e servono tutti e
   due (vedi la nota in testa a quella sezione):
     --guasto-replay        (a)+(b): la partita diverge E il gioco tace.
                            Il referto DEVE essere rosso.
     --guasto-replay a      solo (a): la partita diverge e il gioco PARLA.
                            Il referto DEVE restare verde — e' la prova
                            che l'assenso non e' regalato dal ramo «o il
                            gioco lo dice», ma guadagnato. */
const GUASTO_REPLAY = (() => {
  const i = process.argv.indexOf('--guasto-replay');
  if (i < 0) return '';
  const v = process.argv[i + 1];
  return (v && !v.startsWith('--')) ? v : 'ab';
})();

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
   IL SERVER FINTO — il contratto dei cinque endpoint, in memoria.
   ===================================================================== */
function serviServer() {
  const db = { allenatori: new Map(), squadre: new Map(), punti: new Map(), impegni: new Map(), sfide: [] };
  const stato = { su: true, semeProssimo: 0 };
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
    if (!stato.su) { req.socket.destroy(); return; }

    let corpo = {};
    if (req.method !== 'GET') {
      let g = ''; for await (const p of req) g += p;
      try { corpo = g ? JSON.parse(g) : {}; } catch { corpo = {}; }
    }

    if (via === '/api/entra') {
      if (corpo.id) {
        const io = chiSei(req);
        if (!io) return di(401, { ok: false, errore: 'ignoto' });
        return di(200, { ok: true, id: io, punti: db.punti.get(io) || null });
      }
      const id = crypto.randomUUID();
      const segreto = crypto.randomBytes(24).toString('base64url');
      db.allenatori.set(id, { segreto: digest(segreto) });
      db.punti.set(id, { punti: 1000, vinte: 0, pari: 0, perse: 0, serie: 0 });
      return di(200, { ok: true, id, segreto, nuovo: true });
    }

    const io = chiSei(req);
    if (!io) return di(401, { ok: false, errore: 'ignoto' });

    if (via === '/api/squadra') {
      const rosa = corpo.rosa;
      if (!Array.isArray(rosa) || rosa.length < 4) return di(400, { ok: false, errore: 'rosa' });
      const voto = g => ((g.vel | 0) + (g.tiro | 0) + (g.tecnica | 0) + (g.tackle | 0)) / 4;
      const taglia = [5, 7, 11].includes(+corpo.taglia) ? +corpo.taglia : 5;
      const mov = rosa.slice(1).map(voto).sort((a, b) => b - a).slice(0, Math.max(1, taglia - 1));
      const forza = Math.min(99, Math.max(1, Math.round(
        (mov.reduce((s, v) => s + v, 0) + voto(rosa[0]) * 2) / (mov.length + 2))));
      db.squadre.set(io, {
        allenatore: io, nome: String(corpo.nome || '').slice(0, 18), colori: corpo.colori,
        rosa, modulo: corpo.modulo || '4-4-2', indole: corpo.indole || {}, forza,
      });
      return di(200, { ok: true, squadra: db.squadre.get(io), forza });
    }

    if (via === '/api/avversario') {
      /* IL SEME LO DA' IL SERVER, e in un banco dev'essere ripetibile:
         qui e' un contatore, non un sorteggio, cosi' la prova del replay
         confronta due volte la stessa partita e non due partite. */
      stato.semeProssimo += 1;
      const seme = 20260800 + stato.semeProssimo;
      const taglia = [5, 7, 11].includes(+q.get('taglia')) ? +q.get('taglia') : 5;
      let avv = null;
      for (const [k, v] of db.squadre) if (k !== io) { avv = v; break; }
      db.impegni.set(io, { seme, taglia, difensore: avv ? avv.allenatore : null, creato: Date.now() });
      if (!avv) return di(200, { ok: true, vero: false, seme, taglia,
        avversario: { allenatore: null, nome: 'Borgo Nuovo', forza: 50,
          colori: { maglia: '#3355aa', calzoncini: '#111111', riga: '#3355aa', portiere: '#2b2b2b' },
          rosa: Array.from({ length: 5 }, () => ({ nome: 'Rossi', vel: 50, tiro: 50, tecnica: 50, tackle: 50, partite: 0, gol: 0 })),
          modulo: '4-4-2', indole: {}, punti: 1000 } });
      return di(200, { ok: true, vero: true, seme, taglia, avversario: avv });
    }

    if (via === '/api/sfida') {
      if (req.method === 'GET') {
        return di(200, { ok: true, sfide: db.sfide.filter(x => x.difensore === io).map(x => ({
          id: x.id, seme: x.seme, taglia: x.taglia, gol_a: x.gol_a, gol_d: x.gol_d,
          giocata: x.giocata, vista: x.vista,
          sfidante: db.squadre.get(x.attaccante)
            ? { nome: db.squadre.get(x.attaccante).nome, colori: db.squadre.get(x.attaccante).colori } : null,
        })) });
      }
      const imp = db.impegni.get(io);
      if (!imp) return di(409, { ok: false, errore: 'nessun-impegno' });
      if (String(imp.seme) !== String(corpo.seme)) return di(409, { ok: false, errore: 'seme-non-tuo' });
      db.impegni.delete(io);
      /* =================================================================
         IL CONTRATTO DEL NASTRO, COPIATO DAL SERVER VERO.

         rete/api/sfida.js accetta SOLO base64url e non piu' di 64 kB:
             if (replay.length > REPLAY_MAX)  -> 'replay-grosso'
             if (!/^[A-Za-z0-9_\-=+/]+$/)     -> 'replay-forma'
         Un server finto che accetta qualunque cosa e' un server finto
         che mente: il gioco spedito mandava il testo CRUDO di
         Reg.serializza — virgole, punti e virgola, barre verticali —
         e ogni sfida sarebbe stata respinta con 'replay-forma', che e'
         un no DEFINITIVO, cioe' la partita sarebbe stata buttata invece
         che riprovata. Nessun banco se ne accorgeva. Adesso si'.
         ================================================================= */
      if (!corpo.replay || String(corpo.replay).length < 40) return di(400, { ok: false, errore: 'replay-vuoto' });
      if (String(corpo.replay).length > 64 * 1024) return di(413, { ok: false, errore: 'replay-grosso' });
      if (!/^[A-Za-z0-9_\-=+/]+$/.test(String(corpo.replay))) return di(400, { ok: false, errore: 'replay-forma' });
      const ga = corpo.gol_a | 0, gd = corpo.gol_d | 0;
      const p = db.punti.get(io);
      const delta = ga > gd ? 20 : ga < gd ? -20 : 0;
      p.punti = Math.max(100, p.punti + delta);
      if (imp.difensore) db.sfide.push({
        id: db.sfide.length + 1, attaccante: io, difensore: imp.difensore,
        seme: imp.seme, taglia: imp.taglia, gol_a: ga, gol_d: gd, replay: corpo.replay,
        giocata: new Date().toISOString(), vista: false,
      });
      return di(200, { ok: true, esito: ga > gd ? 'vinta' : ga < gd ? 'persa' : 'pari',
                       delta, punti: p.punti, vero: !!imp.difensore });
    }

    if (via === '/api/classifica') {
      if (q.get('replay')) {
        const sf = db.sfide.find(x => String(x.id) === q.get('replay'));
        if (!sf) return di(404, { ok: false, errore: 'non-c-e' });
        if (sf.attaccante !== io && sf.difensore !== io) return di(403, { ok: false, errore: 'non-tua' });
        if (sf.difensore === io) sf.vista = true;
        /* LE DUE ROSE, come le manda il server vero: senza, il replay
           rigioca la partita giusta con le squadre sbagliate. */
        const rose = [db.squadre.get(sf.attaccante), db.squadre.get(sf.difensore)].filter(Boolean);
        return di(200, { ok: true, sfida: sf, squadre: rose });
      }
      const righe = [...db.punti.entries()].map(([k, v], i) => ({
        posto: i + 1, allenatore: k, nome: (db.squadre.get(k) || {}).nome || '?',
        punti: v.punti, sono_io: k === io,
      }));
      return di(200, { ok: true, righe });
    }
    return di(404, { ok: false, errore: 'via' });
  });

  return new Promise(ok => s.listen(0, '127.0.0.1', () => ok({
    porta: s.address().port, chiudi: () => s.close(), db, stato,
  })));
}

/* =====================================================================
   IL COPIONE DELLE DITA — lo stesso di _q-replay.js, e per la stessa
   ragione: deve essere FISSO (nessun sorteggio, se no le due esecuzioni
   non sono confrontabili) e deve toccare tutti i verbi, se no il nastro
   prova solo la levetta.
   ===================================================================== */
const COPIONE = `(function(passiMax){
  const t = window.__test;
  const D = t.Duel;
  const dischi = t.pulsanti(0);
  const grande = dischi[0] || {x:800,y:330,r:44};
  const piccolo = dischi[1] || {x:720,y:250,r:34};
  const LX = 180, LY = 300;
  let idL = 1, idB = 2, giu = false, giuB = false, duello = false, f = 0;
  /* IL DUELLO DAL DISCHETTO SI RISOLVE COL POINTER, non con Touch5, ed e'
     esattamente il difetto che questo banco misura: quei gesti NON
     entrano nel nastro. Qui si fanno lo stesso — se no la partita non
     arriva mai al fischio finale — e si segna che sono successi. */
  /* SI CHIAMANO I TRE METODI, non si toccano i pixel: in questo banco
     rAF e' zittito, quindi la geometria del mirino non e' mai stata
     disegnata e duelMira non saprebbe dove mandare il pallone. I tre
     metodi sono gli stessi che il dito chiama, e sono i tre che il
     registro NON annota — che e' il punto della misura. */
  while(f < passiMax){
    if(t.state === 'end') break;
    if(t.state === 'freekick'){
      duello = true;
      if(D.phase === 'zone' && D.shooterHuman) D.pickZone(2, 0.74, 0.44);
      else if(D.phase === 'power' && D.shooterHuman) D.stopPower();
      else if(D.phase === 'wait' && D.keeperHuman && D.keeperZone < 0) D.pickKeeper(0);
      t.simulate(1/60); f++;
      continue;
    }
    const a = f * 0.037;
    const rr = 34 + 22 * Math.sin(f * 0.011);
    const x = LX + Math.cos(a) * rr, y = LY + Math.sin(a) * rr;
    if(!giu){ Touch5.start(idL, LX, LY); giu = true; }
    else Touch5.move(idL, x, y);
    if(f % 97 === 96){ Touch5.chiudi(idL, false); giu = false; idL += 2; }
    if(f % 71 === 0 && !giuB){ Touch5.start(idB, grande.x, grande.y); giuB = true; }
    else if(giuB && f % 71 === 18){ Touch5.move(idB, grande.x - 26, grande.y - 14); }
    else if(giuB && f % 71 === 26){ Touch5.chiudi(idB, false); giuB = false; idB += 2; }
    if(f % 53 === 11){ const j = 900 + f; Touch5.start(j, piccolo.x, piccolo.y); Touch5.chiudi(j, false); }
    t.simulate(1/60); f++;
  }
  if(giu) Touch5.chiudi(idL, false);
  if(giuB) Touch5.chiudi(idB, false);
  return { score:[G.score[0],G.score[1]], scena:t.state, righe:t.registroRighe, duello:duello,
           rigori:!!G.rigori, golden:!!G.golden, passi:f };
})`;

/* LE MISURE DELLA BARRA — undici formati veri, gli stessi con cui la
   toppa e' stata tarata. Il numero che conta e' quanti pixel la griglia
   delle voci sfora la sua scatola, e se una voce ha il piede oltre il
   bordo basso. */
const SCHERMI = [
  { n: '915x412', w: 915, h: 412 }, { n: '812x375', w: 812, h: 375 },
  { n: '740x360', w: 740, h: 360 }, { n: '667x375', w: 667, h: 375 },
  { n: '640x360', w: 640, h: 360 }, { n: '568x320', w: 568, h: 320 },
  { n: '412x915', w: 412, h: 915 }, { n: '390x844', w: 390, h: 844 },
  { n: '360x800', w: 360, h: 800 }, { n: '360x640', w: 360, h: 640 },
  { n: '1024x768', w: 1024, h: 768 },
];

async function apri(browser, porta, viewport) {
  const ctx = await browser.newContext({
    viewport: viewport || { width: 915, height: 412 },
    isMobile: !viewport || viewport.width < 1000, hasTouch: true, locale: 'it-IT',
  });
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

/* -------------------------------------------------------------------- */
(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await serviGioco(prova);
  const ss = await serviServer();
  const browser = await chromium.launch();
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
  const errori = [];

  console.log('=== LA SFIDA — la schermata, col dito e con un server finto ===\n');

  /* ================================================================ */
  console.log('1) LA SETTIMA VOCE IN HOME');
  {
    const A = await apri(browser, sg.porta);
    errori.push(...A.errori);
    const c = await A.pag.evaluate(() => ({
      esiste: !!document.getElementById('btnSfida'),
      schermata: !!document.getElementById('sfida'),
      classifica: !!document.getElementById('classifica'),
      quante: document.querySelectorAll('#menu .menu-voci .voce').length,
      posto: [...document.querySelectorAll('#menu .menu-voci .voce')].map(v => v.id).join(','),
      glifo: !!(document.querySelector('#btnSfida .vico svg')),
      gancio: typeof (window.__test.sfida || {}).apri === 'function',
    }));
    if (!c.esiste || !c.schermata) {
      console.error('\nPROVA NULLA: questo gioco non ha la schermata della sfida. Serve _t-sfida-ui.js applicato.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    di(c.quante === 7, 'la home ha sette voci', c.posto);
    di(c.glifo, 'la voce porta il suo glifo, come le altre sei');
    di(c.classifica, 'la schermata della classifica esiste');
    di(c.gancio, 'il banco puo\' guidare la schermata (__test.sfida)');
    /* il tocco vero: si preme la voce e deve aprirsi la schermata */
    await A.pag.evaluate(() => { window.__test.reteBase(''); });
    await A.pag.click('#btnSfida');
    await A.pag.waitForTimeout(200);
    const ap = await A.pag.evaluate(() => ({
      aperta: !document.getElementById('sfida').classList.contains('hidden'),
      menu: document.getElementById('menu').classList.contains('hidden'),
      riga: (document.getElementById('sfStato') || {}).textContent || '',
      appese: window.__test.reteStato().inCorso,
    }));
    di(ap.aperta && ap.menu, 'il tocco sulla voce apre la schermata e chiude il menu');
    /* ============ SENZA RETE ============ */
    console.log('\n2) SENZA RETE — la schermata si apre lo stesso e lo dice in una riga');
    di(ap.riga.length > 20 && ap.riga.length < 220, 'c\'e\' UNA riga che spiega, non una schermata di errore',
       ap.riga.slice(0, 90));
    di(ap.appese === 0, 'e non resta nessuna chiamata appesa', 'in corso ' + ap.appese);
    /* e il gioco resta il gioco: una partita normale parte e finisce */
    const g = await A.pag.evaluate(() => {
      const t = window.__test;
      t.startMatch(1, 1);
      const r = t.simulate(200);
      return { scena: r.scene, seminato: t.seminato, durata: t.timeLeft };
    });
    /* NON si chiede 'end': il duello dal dischetto aspetta un dito e la
       scena resta 'freekick' per sempre in un banco senza dita. Quel che
       si chiede e' che il gioco VIVA: che una partita parta e la
       simulazione avanzi, cioe' che aver aperto la sfida senza rete non
       abbia lasciato niente di rotto dietro di se'. */
    di(g.scena !== 'menu', 'subito dopo, una partita normale parte e gira', 'scena ' + g.scena);
    di(g.seminato === false, 'e il caso e\' quello del browser: la sfida non ha seminato niente');
    await A.ctx.close();
  }

  /* ================================================================ */
  console.log('\n3) LA GUIDA A SETTE CASELLE NON SFORA');
  {
    let rotti = 0, peggio = '';
    for (const s of SCHERMI) {
      const P = await apri(browser, sg.porta, { width: s.w, height: s.h });
      const m = await P.pag.evaluate(() => {
        const g = document.querySelector('#menu .menu-voci');
        const voci = [...document.querySelectorAll('#menu .menu-voci .voce')];
        return {
          fuori: Math.round(g.scrollWidth - g.clientWidth),
          sotto: voci.filter(v => v.getBoundingClientRect().bottom > innerHeight + 0.5).length,
        };
      });
      if (m.fuori > 0 || m.sotto > 0) { rotti++; peggio += s.n + ' (fuori ' + m.fuori + ', sotto ' + m.sotto + ') '; }
      await P.ctx.close();
    }
    di(rotti === 0, 'su undici formati la griglia non esce e nessuna voce va sotto la piega',
       rotti ? peggio : '11 su 11 puliti');
  }

  if (SOLOBARRA) {
    await browser.close(); sg.chiudi(); ss.chiudi();
    const rossi = esiti.filter(x => !x).length;
    console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
    process.exit(rossi ? 1 : 0);
  }

  /* ================================================================
     DA QUI IN POI SERVONO DUE TELEFONI: B difende, A attacca.
     ================================================================ */
  const B = await apri(browser, sg.porta);
  const A = await apri(browser, sg.porta);
  errori.push(...A.errori, ...B.errori);
  const collega = async (P, nome) => P.pag.evaluate(([p, nome]) => {
    const t = window.__test;
    t.reteBase('http://127.0.0.1:' + p);
    t.save.teamName = nome;
    /* due rose diverse: se fossero uguali, una squadra scambiata per
       l'altra non si vedrebbe */
    t.save.rosa = t.save.rosa.map((r, i) => Object.assign({}, r, {
      nome: nome + ' ' + (i + 1),
      vel: 50 + ((i * 7 + nome.length * 3) % 30),
      tiro: 50 + ((i * 11 + nome.length * 5) % 30),
      tecnica: 50 + ((i * 5 + nome.length * 7) % 30),
      tackle: 50 + ((i * 13 + nome.length * 2) % 30),
    }));
  }, [ss.porta, nome]);
  /* L'IDENTITA' PRIMA DELLA VETRINA: pubblica() senza identita' risponde
     'senza-identita' e non manda niente. Nel gioco vero lo fa aggiorna(),
     qui si chiama a mano perche' le due pagine devono essere pronte prima
     che una attacchi l'altra. */
  const entra = async P => P.pag.evaluate(async () => await window.__test.rete.entra());

  console.log('\n4) DUE TELEFONI, DUE SQUADRE');
  await collega(B, 'BORGATA');
  await collega(A, 'DOPOLAVORO');
  await entra(B); await entra(A);
  const pb = await B.pag.evaluate(async () => await window.__test.rete.pubblica());
  const pa = await A.pag.evaluate(async () => await window.__test.rete.pubblica());
  di(pb.ok && pa.ok, 'le due squadre si pubblicano', 'forze ' + pa.forza + ' e ' + pb.forza);
  /* IL NOME PUBBLICATO E' QUELLO VERO. Prima della toppa il client
     leggeva un campo inesistente e ogni squadra si chiamava uguale. */
  const nomiVisti = [...ss.db.squadre.values()].map(x => x.nome).sort().join(',');
  di(nomiVisti === 'BORGATA,DOPOLAVORO', 'ognuna col NOME che ha davvero, non un ripiego uguale per tutti', nomiVisti);

  /* ================================================================ */
  console.log('\n5) LA SFIDA SI GIOCA COL SEME DEL SERVER');
  /* la durata scelta nel menu e' 180: la sfida deve ignorarla, se no il
     replay dell'altro (che ne ha 90) non torna */
  await A.pag.evaluate(() => { window.__test.save.durata = 180; });

  /* =====================================================================
     UNA SFIDA INTERA, dal CERCA AVVERSARIO al fischio finale, col
     copione fisso al posto delle dita. Torna anche se la partita ha
     incontrato un CALCIO PIAZZATO: quel dato serve, perche' il duello
     dal dischetto non entra nel nastro e una partita che ne ha uno non
     si puo' rivedere.
     ===================================================================== */
  const giocaUna = async () => {
    const r = await A.pag.evaluate(async c => {
      const t = window.__test;
      await t.sfida.cerca();
      if (!t.sfidaStato.inPartita) return { partita: false };
      const via = {
        seme: t.sfidaStato.seme, taglia: t.sfidaStato.taglia,
        timeLeft: Math.round(t.timeLeft), registro: t.registroModo, seminato: t.seminato,
        loro: t.players.filter(p => p.team === 1).map(p => p.nome).join(','),
        miei: t.players.filter(p => p.team === 0).map(p => p.nome).join(','),
      };
      /* VENTIQUATTROMILA PASSI = SEI MINUTI di partita. Non e' abbondanza:
         una sfida pari va al GOLDEN GOAL (90 s + 40) e poi ai RIGORI, che
         sono una catena di duelli. Con novemila la prima partita del banco
         restava in mezzo alla serie dal dischetto e non arrivava mai. */
      const fine = (new Function('return ' + c))()(24000);
      return { partita: true, via, fine };
    }, COPIONE);
    /* chiudiSfida spedisce senza che nessuno la aspetti: qui si aspetta */
    await A.pag.waitForTimeout(700);
    /* L'ID VERO LO DA' IL SERVER, e non e' il numero della partita
       giocata: una partita che non arriva al fischio finale non viene
       mandata, quindi contare i tentativi sfaserebbe tutti gli id. */
    r.id = ss.db.sfide.length ? ss.db.sfide[ss.db.sfide.length - 1].id : 0;
    return r;
  };

  const uno = await giocaUna();
  di(uno.partita && !!uno.via.seme, 'la partita e\' partita e porta il seme del server',
     uno.partita ? ('seme ' + uno.via.seme) : 'non e\' partita');
  di(uno.partita && uno.via.seminato === true && uno.via.registro === 1,
     'il caso e\' seminato e il registro sta scrivendo',
     uno.partita ? ('seminato ' + uno.via.seminato + ', registro ' + uno.via.registro) : '');
  di(uno.partita && /BORGATA/.test(uno.via.loro), 'in campo c\'e\' la ROSA dell\'avversario, coi suoi nomi',
     uno.partita ? uno.via.loro.slice(0, 46) : '');
  di(uno.partita && /DOPOLAVORO/.test(uno.via.miei), 'e dall\'altra parte la mia',
     uno.partita ? uno.via.miei.slice(0, 46) : '');
  /* IL CRONOMETRO DI RETE: 90 secondi a 5 contro 5, non i 180 del menu */
  di(uno.partita && uno.via.timeLeft === 90,
     'il cronometro e\' quello di rete (90), non la preferenza del menu (180)',
     uno.partita ? (uno.via.timeLeft + ' s') : '');
  di(uno.partita && uno.fine.scena === 'end', 'la sfida arriva al fischio finale',
     uno.partita ? (uno.fine.score.join('-') + ', ' + uno.fine.passi + ' passi, scena ' + uno.fine.scena +
                    (uno.fine.rigori ? ', dal dischetto' : '')) : '');
  di(uno.partita && uno.fine.righe > 100, 'e il nastro ha registrato le dita',
     uno.partita ? (uno.fine.righe + ' comandi') : '');

  const dopo = await A.pag.evaluate(() => ({ rete: window.__test.reteStato(), sfida: window.__test.sfidaStato,
                                             seminato: window.__test.seminato, registro: window.__test.registroModo }));
  const arrivata = ss.db.sfide[0];
  di(!!arrivata, 'l\'esito e\' arrivato al server', arrivata ? ('sfida #' + arrivata.id) : 'niente');
  di(!!arrivata && arrivata.gol_a === uno.fine.score[0] && arrivata.gol_d === uno.fine.score[1],
     'col punteggio giusto', arrivata ? (arrivata.gol_a + '-' + arrivata.gol_d) : '');
  di(!!arrivata && String(arrivata.replay).length > 200, 'e col nastro dentro',
     arrivata ? (String(arrivata.replay).length + ' byte') : '');
  /* IL NASTRO E' NELLA FORMA CHE IL SERVER VERO ACCETTA: base64url e
     sotto i 64 kB. Il crudo di Reg.serializza non lo sarebbe. */
  di(!!arrivata && /^[A-Za-z0-9_\-=+/]+$/.test(String(arrivata.replay)) &&
     String(arrivata.replay).length <= 64 * 1024,
     'e nella forma che il server vero pretende (base64url, sotto i 64 kB)',
     arrivata ? (String(arrivata.replay).length + ' byte, ' +
       (/[|,;.]/.test(String(arrivata.replay)) ? 'CRUDO' : 'stretto')) : '');
  di(dopo.rete.punti !== 1000 && dopo.rete.punti > 0, 'i punti si sono mossi', String(dopo.rete.punti));
  /* IL CASO TORNA QUELLO DEL BROWSER: se restasse seminato, tutte le
     amichevoli successive sarebbero la stessa partita */
  di(dopo.seminato === false && dopo.registro === 0 && !dopo.sfida.inPartita,
     'a partita finita il seme e il registro si spengono',
     'seminato ' + dopo.seminato + ', registro ' + dopo.registro);
  di(dopo.sfida.fine === 1, 'e la schermata di fine sa che era una sfida', 'fine ' + dopo.sfida.fine);

  /* =====================================================================
     QUANTE SFIDE INCONTRANO UN CALCIO PIAZZATO. Non e' una curiosita':
     e' la frequenza con cui il bottone GUARDA non potra' mostrare il
     film, e va misurata invece che stimata. Il copione e' piu' ruvido di
     un pollice vero (preme il disco grande ogni 71 fotogrammi), quindi
     questo numero e' un TETTO, non una media.
     ===================================================================== */
  console.log('\n6) QUANTE SFIDE FINISCONO SUL DISCHETTO');
  const partite = [{ duello: uno.fine.duello, score: uno.fine.score, id: uno.id,
                     scena: uno.fine.scena, rigori: uno.fine.rigori }];
  const TENTATIVI = 5;
  for (let k = 0; k < TENTATIVI; k++) {
    const p = await giocaUna();
    if (!p.partita) break;
    partite.push({ duello: p.fine.duello, score: p.fine.score, scena: p.fine.scena,
                   id: p.id, rigori: p.fine.rigori });
  }
  const conDuello = partite.filter(p => p.duello).length;
  const conRigori = partite.filter(p => p.rigori).length;
  di(true, 'su ' + partite.length + ' sfide giocate col copione, ' + conDuello +
     ' hanno incontrato un calcio piazzato (' + Math.round(conDuello / partite.length * 100) + '%)');
  /* UNA SFIDA PARI FINISCE SEMPRE DAL DISCHETTO, e la serie dal dischetto
     e' tutta duelli: quelle partite non si possono rivedere in nessun
     caso. Il numero sta accanto all'altro perche' e' la stessa ferita. */
  di(true, 'e ' + conRigori + ' sono finite ai rigori (una sfida pari ci finisce sempre: golden goal, poi dischetto)');
  /* gli indici (1-based, come gli id del server) delle due sfide che
     servono alle due prove del replay */
  const arrivate = partite.filter(p => p.scena === 'end' && p.id);
  /* SI RIVEDE L'ULTIMA SENZA DUELLO, non la prima, e la ragione e' una
     misura: il server restituisce la squadra di OGGI di chi ha attaccato,
     non quella del giorno della partita. La rosa cresce a ogni partita e
     l'indole si muove, quindi piu' e' vecchia la sfida piu' e' probabile
     che il profilo sia cambiato. Il caso vero — ti attaccano, apri il
     gioco e guardi — e' quello della piu' recente. */
  const senza = arrivate.filter(p => !p.duello).slice(-1)[0] || null;
  const con   = arrivate.filter(p => p.duello)[0] || null;
  di(arrivate.length === ss.db.sfide.length && arrivate.length > 0,
     'e tutte quelle arrivate al fischio finale sono arrivate al server',
     arrivate.length + ' su ' + partite.length + ', sul server ' + ss.db.sfide.length);

  /* ================================================================ */
  console.log('\n7) ABBANDONARE A META\' NON LASCIA IL GIOCO SEMINATO');
  const sfidePrima = ss.db.sfide.length;
  const abb = await A.pag.evaluate(async () => {
    const t = window.__test;
    await t.sfida.cerca();
    t.simulate(3);
    const dentro = t.seminato;
    document.getElementById('btnQuit').click();
    return { dentro, seminato: t.seminato, registro: t.registroModo, inPartita: t.sfidaStato.inPartita };
  });
  await A.pag.waitForTimeout(400);
  di(abb.dentro === true && abb.seminato === false && abb.registro === 0 && !abb.inPartita,
     'uscendo col tasto ESCI il seme e il registro si spengono e la sfida sparisce',
     'seminato ' + abb.seminato + ', registro ' + abb.registro);
  di(ss.db.sfide.length === sfidePrima, 'e la partita abbandonata non arriva al server',
     ss.db.sfide.length + ' sfide sul server, erano ' + sfidePrima);

  /* ================================================================ */
  console.log('\n8) IL DIFENSORE VEDE LE SFIDE SUBITE');
  const el = await B.pag.evaluate(async () => {
    const t = window.__test;
    await t.sfida.aggiorna();
    const righe = [...document.querySelectorAll('#sfLista .sfriga')];
    return { quante: righe.length, nuove: righe.filter(r => r.classList.contains('nuova')).length,
             testo: righe.map(r => r.textContent.replace(/\s+/g, ' ').trim()).join(' | '),
             bottone: righe.filter(r => r.querySelector('[data-guarda]')).length };
  });
  di(el.quante === ss.db.sfide.length, 'l\'elenco ha tutte le sfide subite', el.testo.slice(0, 100));
  di(el.nuove === el.quante, 'tutte col pallino: non ne ha ancora guardata nessuna');
  di(el.bottone === el.quante, 'e ognuna col bottone per guardarla');

  /* ================================================================
     9) LA PROVA CHE CONTA — il replay riproduce il punteggio.

     RETTIFICA DEL 28 AGOSTO 2026, ORE 20. Fino a stasera questa sezione
     portava questo titolo e NON confrontava i due punteggi: `atteso`
     entrava solo nell'etichetta stampata accanto a un OK. Il 28 agosto
     2026, sul gioco spedito, la riga diceva alla lettera

       OK  e la partita rigiocata arriva al fischio finale da sola
           [giocata 0-2, rigiocata 1-2]

     cioe' il banco ha STAMPATO la contraddizione che la riga 17 di
     questo file dichiara peggiore di nessun replay, e l'ha chiamata OK.
     Un cancello che sa scrivere il difetto e non sa vederlo e' un
     timbro.

     COSA SI PRETENDE, ADESSO, E PERCHE' NON E' «I DUE PUNTEGGI SONO
     UGUALI». Perche' quella non e' una promessa che il gioco puo'
     mantenere oggi, e pretenderla vorrebbe dire un rosso perpetuo che
     insegna a non guardare. La promessa mantenibile — ed e' quella che
     rende onesto il bottone GUARDA — e':

       IL REPLAY NON CONTRADDICE IL TABELLONE IN SILENZIO.

     O i due punteggi coincidono, O il gioco DICE che la partita non e'
     stata ricostruita (lo fa in due posti: il toast «NON ERA QUESTA LA
     PARTITA» e la riga #sfStato). Il rosso e' il terzo caso: punteggi
     diversi e nessuno che lo dica. Il conto di quante volte serve la
     seconda strada invece della prima si misura, e sta in 9b.

     IL ROSSO, DIMOSTRATO: `--guasto-replay`. Due sabotaggi, e servono
     tutti e due perche' il difetto e' fatto di due pezzi.
       (a) la partita rigiocata DIVERGE davvero: a ogni passo del replay
           si riscrivono gli attributi dei ventidue in campo (chi ha il
           nastro a 95, gli altri a 30). Non e' un capriccio del banco:
           e' alla lettera la causa che il gioco stesso scrive nel suo
           commento — «i comandi giusti muovono uomini un po' diversi e
           il punteggio puo' cambiare»;
       (b) il gioco PERDE la voce: si spegne Sfida.stato, da cui esce la
           frase «Il replay non ha ricostruito la partita». Senza quella,
           il replay sbagliato passa per vero.

     I DUE MODI, E SERVONO TUTTI E DUE — misurati il 28 agosto 2026 sul
     gioco spedito, e sono la prova che questa riga non e' ne' un timbro
     ne' un rosso regalato:
       --guasto-replay a    (a) da solo: tabellone 1-2, replay 0-2, e la
                            riga di stato dice «Il replay non ha
                            ricostruito la partita: e' finito 0-2 e
                            quella vera era 1-2». VERDE, 57 su 57 — la
                            seconda strada e' mantenuta davvero, non e'
                            un ramo morto che assolve sempre.
       --guasto-replay      (a)+(b): tabellone 0-1, replay 0-2, riga di
                            stato MUTA. ROSSO, uscita 1, e rosso UNO
                            SOLO su 57: il guasto si spegne appena
                            finita la sezione 9, cosi' 9b e 10 non
                            diventano rosse per contagio e il controllo
                            negativo dimostra una cosa sola.
     PRIMA STESURA BOCCIATA, e vale la pena scriverla: il sabotaggio (a)
     era applicato UNA VOLTA a replay partito, e si lavava via al primo
     calcio d'inizio (il gioco ri-semina gli attributi dalla rosa). Dava
     0-2 contro 0-2: un guasto che non guasta niente e un verde che non
     dimostra niente.
     ================================================================ */
  console.log('\n9) IL REPLAY — la partita che hai subito, rigiocata da te');
  const guarda = async (id, rompi) => B.pag.evaluate(async ([id, rompi]) => {
    const t = window.__test;
    await t.sfida.guarda(id);
    const partito = { scena: t.state, seminato: t.seminato, registro: t.registroModo,
                      stato: t.sfidaStato, timeLeft: Math.round(t.timeLeft),
                      miei: t.players ? t.players.filter(p => p.team === 0).map(p => p.nome).join(',') : '',
                      loro: t.players ? t.players.filter(p => p.team === 1).map(p => p.nome).join(',') : '' };
    /* ============ IL GUASTO, e vive qui perche' qui c'e' la partita ====
       (a) i ventidue diventano altri ventidue: i comandi del nastro sono
           gli stessi ma muovono uomini diversi, che e' la causa vera di
           divergenza scritta dentro il gioco;
       (b) il gioco perde il punteggio dichiarato, quindi il confronto
           che fa da solo a fine replay non ha piu' niente da confrontare
           e il replay passa per vero.
       Si tocca SOLO col guasto acceso, e solo dopo che il replay e'
       partito: prima non ci sarebbe niente da rompere. */
    /* (a) I VENTIDUE DIVENTANO ALTRI VENTIDUE. Si riapplica a ogni passo
       e non una volta sola: al calcio d'inizio il gioco ri-semina gli
       attributi dei giocatori dalla rosa (vedi «p.vel=r.vel; p.tiro=...»
       nella formazione), quindi un solo colpo si lavava via al primo gol
       — misurato: alla prima stesura il guasto dava 0-2 contro 0-2, cioe'
       non guastava niente. */
    const rompiOra = () => {
      if (!rompi || !t.players || t.registroModo !== 2) return;
      for (const p of t.players) {
        const v = p.team === 0 ? 95 : 30;
        p.vel = v; p.tiro = v; p.tecnica = v; p.tackle = v;
      }
    };
    /* (b) e il gioco perde la voce: Sfida.stato e' il posto da cui esce
       la frase «Il replay non ha ricostruito la partita». Spegnerla e'
       una regressione plausibile (chi rinomina o toglie quella chiamata),
       ed e' l'unica meta' del difetto che il sabotaggio (a) non produce.
       Si tiene da parte l'originale: il guasto deve valere per la sezione
       9, non sporcare le sezioni dopo. */
    if (rompi === 'ab' && t.registroModo === 2) {
      if (!window.__statoVero) window.__statoVero = t.sfida.stato;
      t.sfida.stato = function () {};
    }
    /* NIENTE DITA QUI: il nastro le mette da solo. Se il replay avesse
       bisogno di un dito, non sarebbe un replay. */
    let r = null;
    for (let g = 0; g < 12 && (!r || r.scene !== 'end'); g++) { rompiOra(); r = t.simulate(20); }
    return { partito, fine: r, scenaFine: t.state,
             riga: (document.getElementById('sfStato') || {}).textContent || '' };
  }, [id, rompi || '']);

  /* il guasto vale per la sezione 9 e basta: qui la voce del gioco torna,
     se no le sezioni 9b e 10 diventerebbero rosse per contagio e il
     controllo negativo dimostrerebbe tre cose invece di una */
  const ridaiLaVoce = () => B.pag.evaluate(() => {
    const t = window.__test;
    if (window.__statoVero) { t.sfida.stato = window.__statoVero; delete window.__statoVero; return true; }
    return false;
  });

  if (senza) {
    const atteso = senza.score;
    const rep = await guarda(senza.id, GUASTO_REPLAY);
    di(rep.partito.registro === 2, 'il nastro e\' in rilettura, non in scrittura', 'registro ' + rep.partito.registro);
    di(rep.partito.seminato === true, 'e il caso e\' quello di allora');
    di(rep.partito.timeLeft === 90, 'col cronometro di allora', rep.partito.timeLeft + ' s');
    di(/DOPOLAVORO/.test(rep.partito.miei), 'in campo, dalla parte del nastro, c\'e\' la squadra di CHI HA ATTACCATO',
       rep.partito.miei.slice(0, 46));
    di(/BORGATA/.test(rep.partito.loro), 'e dall\'altra la tua', rep.partito.loro.slice(0, 46));
    di(!!rep.fine && rep.fine.scene === 'end', 'e la partita rigiocata arriva al fischio finale da sola',
       'giocata ' + atteso.join('-') + ', rigiocata ' + (rep.fine ? rep.fine.score.join('-') : '?'));
    await B.pag.waitForTimeout(300);
    const dopoRep = await B.pag.evaluate(() => ({
      seminato: window.__test.seminato, registro: window.__test.registroModo,
      fine: window.__test.sfidaStato.fine, monete: window.__test.save.coins,
      riga: (document.getElementById('sfStato') || {}).textContent || '',
    }));

    /* =================== LA PROVA CHE CONTA, e adesso CONTA ============
       Qui si confrontano i due punteggi davvero, invece di stamparli
       accanto a un OK. Vedi la nota in testa alla sezione: il rosso non
       e' «diversi», e' «diversi e taciuti». */
    const rigiocato = rep.fine ? rep.fine.score : null;
    const uguale = !!rigiocato && rigiocato[0] === atteso[0] && rigiocato[1] === atteso[1];
    const dichiarato = /non ha ricostruito la partita/i.test(dopoRep.riga);
    di(uguale || dichiarato,
       'IL REPLAY NON CONTRADDICE IL TABELLONE IN SILENZIO' +
       (uguale ? ': i due punteggi coincidono'
               : (dichiarato ? ': non coincidono, E IL GIOCO LO DICE'
                             : ': NON COINCIDONO E NESSUNO LO DICE')),
       'tabellone ' + atteso.join('-') + ', replay ' +
       (rigiocato ? rigiocato.join('-') : '?') +
       (uguale ? '' : '   riga di stato: «' + (dopoRep.riga.trim().slice(0, 78) || 'MUTA') + '»'));
    di(dopoRep.seminato === false && dopoRep.registro === 0,
       'finito il replay, seme e registro si spengono');
    di(ss.db.sfide.filter(x => x.id === senza.id)[0].vista === true, 'il server sa che l\'hai guardata: il pallino non torna');
    di(dopoRep.fine === 2, 'e la schermata di fine sa che era un replay, non una partita', 'fine ' + dopoRep.fine);
    di(true, 'monete dopo il replay: ' + dopoRep.monete + ' (il premio e\' spento da G.matchRewarded)');
    if (await ridaiLaVoce()) console.log('  (guasto spento: la voce del gioco torna per le sezioni 9b e 10)');
  } else {
    di(false, 'NON C\'E\' UNA SOLA SFIDA SENZA CALCIO PIAZZATO: la prova del replay non si e\' potuta fare');
  }

  /* =====================================================================
     9b) QUANTE SE NE RIGIOCANO UGUALI, e quando no il gioco lo dice.

     Il server tiene UNA copia della squadra di chi attacca — quella di
     oggi — e non una fotografia del giorno della partita. Piu' e'
     vecchia la sfida, piu' e' probabile che quella copia non sia piu'
     quella che ha giocato. Non e' riparabile dal telefono; qui si misura
     quanto pesa, e si controlla che quando la partita non torna il gioco
     lo DICA invece di far credere a un risultato mai successo.
     ===================================================================== */
  console.log(String.fromCharCode(10) + '9b) IL PROFILO CHE CAMBIA: quanto pesa, e che cosa dice il gioco');
  {
    const senzaDuello = arrivate.filter(p => !p.duello);
    let mostrate = 0, uguali = 0, diverse = 0, rifiutate = 0, dette = 0, detteFine = 0;
    for (const p of senzaDuello) {
      await B.pag.evaluate(() => { window.__test.sfida.apri(); });
      await B.pag.waitForTimeout(250);
      const r = await guarda(p.id);
      /* IL RIFIUTO SI RICONOSCE COSI': il replay non e' nemmeno partito
         (registro spento, nessuna partita in corso) e la riga di stato
         dice che le squadre non sono piu' quelle. */
      if (r.partito.registro !== 2) {
        rifiutate++;
        const riga = await B.pag.evaluate(() => (document.getElementById('sfStato') || {}).textContent || '');
        if (/cambiata da quella partita/i.test(riga)) dette++;
        continue;
      }
      mostrate++;
      const ok2 = !!r.fine && r.fine.score[0] === p.score[0] && r.fine.score[1] === p.score[1];
      console.log('       sfida #' + p.id + ': giocata ' + p.score.join('-') +
                  ', rigiocata ' + (r.fine ? r.fine.score.join('-') : '?') + (ok2 ? '' : '   << diversa'));
      if (ok2) { uguali++; continue; }
      diverse++;
      await B.pag.waitForTimeout(250);
      const detto = await B.pag.evaluate(() =>
        (document.getElementById('sfStato') || {}).textContent || '');
      if (/non ha ricostruito la partita/i.test(detto)) detteFine++;
    }
    di(mostrate === senzaDuello.length,
       'ogni sfida senza duello si lascia rivedere', mostrate + ' su ' + senzaDuello.length);
    /* IL NUMERO. Le due squadre viaggiano dentro il nastro, quindi il
       profilo che cambia non conta piu' niente: quel che resta e' il
       residuo di stato fra una partita e la successiva sulla STESSA
       pagina, che e' un difetto del gioco gia' censito e ancora aperto
       (_q-replay.js, prova E: "due giri spenti a cavallo di uno acceso
       divergono al campione 6 ... da chiudere"). Si vede quando la
       partita rigiocata e' la N-esima della pagina che guarda e la
       partita vera era la M-esima della pagina che ha giocato, con N
       diverso da M. */
    di(true, 'di quelle mostrate, ' + uguali + ' su ' + mostrate +
       ' finiscono col punteggio dichiarato al gol');
    /* E QUESTA E' LA PROMESSA CHE SI PUO' MANTENERE OGGI: quando la
       partita rigiocata NON e' quella, il gioco lo dice invece di farla
       passare per vera. */
    di(diverse === detteFine, 'e ogni volta che NON torna, il gioco lo dice invece di farla passare per vera',
       detteFine + ' su ' + diverse);
  }

  /* ================================================================
     10) E QUANDO IL NASTRO NON BASTA, NON SI FA VEDERE NIENTE.
     ================================================================ */
  console.log('\n10) UNA PARTITA COL DISCHETTO NON SI FA VEDERE AFFATTO');
  if (con) {
    await B.pag.evaluate(() => { window.__test.sfida.apri(); });
    await B.pag.waitForTimeout(400);
    const rc = await guarda(con.id);
    await B.pag.waitForTimeout(400);
    const st = await B.pag.evaluate(() => ({
      scena: window.__test.state, seminato: window.__test.seminato,
      registro: window.__test.registroModo, inPartita: window.__test.sfidaStato.inPartita,
      riga: (document.getElementById('sfStato') || {}).textContent || '',
      aperta: !document.getElementById('sfida').classList.contains('hidden'),
    }));
    /* IL NASTRO SI DICHIARA INCOMPLETO e il replay non parte nemmeno: non
       si mostra una partita sbagliata, si dice che non si puo' mostrare. */
    di(!rc.partito.stato.inPartita && rc.partito.registro === 0,
       'il replay non parte proprio: il nastro dichiara di essere incompleto',
       'registro ' + rc.partito.registro + ', in partita ' + rc.partito.stato.inPartita);
    di(st.scena !== 'play' && st.scena !== 'kickoff' && !st.inPartita,
       'e non resta nessuna partita appesa', 'scena ' + st.scena);
    di(st.seminato === false && st.registro === 0, 'e non lascia il gioco seminato');
    di(st.aperta && /calcio piazzato/i.test(st.riga), 'e dice perche\', invece di sparire in silenzio',
       st.riga.slice(0, 110));
  } else {
    di(true, 'nessuna delle sfide giocate ha incontrato un calcio piazzato: la guardia non si e\' potuta provare');
  }

  /* ================================================================ */
  console.log('\n11) LA CLASSIFICA');
  const cla = await B.pag.evaluate(async () => {
    await window.__test.sfida.apriClassifica();
    const r = [...document.querySelectorAll('#claLista .clariga')];
    return { quante: r.length, io: r.filter(x => x.classList.contains('io')).length,
             testo: r.map(x => x.textContent.replace(/\s+/g, ' ').trim()).join(' | ') };
  });
  di(cla.quante >= 2, 'la classifica si legge', cla.testo.slice(0, 90));
  di(cla.io === 1, 'e la tua riga c\'e\', segnata');

  /* ================================================================ */
  console.log('\n12) IL CAMBIO DI TELEFONO');
  const cod = await A.pag.evaluate(() => {
    document.getElementById('btnSfidaCodice').click();
    const p = document.getElementById('sfidaCodice');
    return { aperto: !p.classList.contains('hidden'),
             codice: document.getElementById('sfCodMio').value,
             avviso: p.textContent.replace(/\s+/g, ' ') };
  });
  di(cod.aperto && cod.codice.split('.').length === 3, 'il codice c\'e\' e ha tre parti',
     cod.codice.slice(0, 14) + '…');
  di(/perdi il telefono, perdi la squadra/i.test(cod.avviso),
     'e accanto c\'e\' scritto che se perdi il telefono perdi la squadra');
  di(!/email|e-mail|account/i.test(cod.avviso) || /nessuna email/i.test(cod.avviso),
     'senza chiedere niente a nessuno: nessuna email, nessun conto');

  await browser.close(); sg.chiudi(); ss.chiudi();
  const veri = errori.filter(e => !/MIME/i.test(e));
  if (veri.length) {
    console.error('\nECCEZIONI DI PAGINA: ' + veri.slice(0, 3).join(' | '));
    process.exit(2);
  }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + (e && e.stack || e)); process.exit(2); });
