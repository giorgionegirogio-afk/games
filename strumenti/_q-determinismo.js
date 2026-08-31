/* =====================================================================
   _q-determinismo.js — LA STESSA PARTITA, DUE VOLTE, E' LA STESSA?

   PERCHE' ESISTE, e non e' curiosita': dalla risposta dipende
   l'architettura del multigiocatore. Se il gioco e' deterministico dato
   il seme, due telefoni che partono dallo stesso seme e ricevono gli
   stessi comandi vedono la STESSA partita — e allora sulla rete non
   serve mandare lo stato (posizioni di ventidue uomini e di un pallone,
   sessanta volte al secondo), bastano i COMANDI: pochi byte, e la
   latenza smette di essere un problema. Se invece non lo e', bisogna
   sincronizzare lo stato, e su una rete mobile con un canvas 2D non ne
   vale la pena.

   COME SI MISURA. Si gioca la stessa partita due volte con lo stesso
   seme e si confronta un'IMPRONTA presa a intervalli fissi: posizione
   del pallone, di ogni giocatore, punteggio, possesso. Se le due impronte
   coincidono a ogni campione, il gioco e' deterministico.

   TRE PROVE, e la terza e' quella che conta:
     A  stessa pagina, due partite di fila con lo stesso seme
     B  due PAGINE diverse (due schede), stesso seme — cosi' si scopre se
        qualcosa sopravvive fra una partita e l'altra
     C  con le DITA: la stessa sequenza di comandi rigiocata deve dare la
        stessa partita. E' la prova che riguarda il multigiocatore.

   uso:  node strumenti/_q-determinismo.js
         node strumenti/_q-determinismo.js --taglia 11 --partite 4
         node strumenti/_q-determinismo.js --gioco fuori/prova.html
   esce 0 se deterministico, 1 se diverge, 2 se il banco e' esploso.
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

const TAGLIA = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
const PARTITE = parseInt(arg('partite', '3'), 10);
const SEME = parseInt(arg('seme', '20260803'), 10) >>> 0;
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

/* l'impronta: quel che basta a dire "e' la stessa partita".
   Si arrotonda al centesimo perche' il confronto sia sui numeri e non
   sulla rappresentazione binaria dei float. */
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

async function apri(browser, porta, seme) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    /* IL CASO VERO SI METTE DA PARTE, non si butta. La prova D deve
       poterlo rimettere: se il seme interno del gioco funziona solo
       perche' il banco ha gia' seminato Math.random, non funziona. */
    window.__casoVero = Math.random.bind(Math);
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = p(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, seme);
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { ctx, pag, errori };
}

/* una partita, con l'impronta presa ogni `ogni` secondi di gioco */
async function gioca(pag, seme, taglia, ogni) {
  return pag.evaluate(([seme, taglia, ogni, IMPR]) => {
    const t = window.__test;
    window.__caso.semina(seme);
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    t.setCpuVsCpu(true);
    const impronte = [];
    const leggi = new Function('return ' + IMPR);
    let sim = 0;
    while (t.state !== 'end' && sim < 600) {
      t.simulate(ogni); sim += ogni;
      impronte.push(leggi());
    }
    return { impronte, scena: t.state, gol: [G.score[0], G.score[1]] };
  }, [seme, taglia, ogni, IMPRONTA]);
}

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  const browser = await chromium.launch();
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

  console.log('=== IL GIOCO E\' DETERMINISTICO? — ' + PARTITE + ' partite a ' + TAGLIA + ' contro ' + TAGLIA +
              ', semi ' + SEME + '..' + (SEME + PARTITE - 1) + (provaRel ? ', gioco ' + provaRel : '') + ' ===\n');

  /* ---- A: stessa pagina, due volte di fila ---- */
  console.log('A) LA STESSA PAGINA, due volte con lo stesso seme');
  const A = await apri(browser, srv.porta, SEME);
  for (let i = 0; i < PARTITE; i++) {
    const s = (SEME + i) >>> 0;
    const u = await gioca(A.pag, s, TAGLIA, 1);
    const d = await gioca(A.pag, s, TAGLIA, 1);
    const k = primoScarto(u.impronte, d.impronte);
    di(k < 0, 'seme ' + s + ': due partite identiche',
       k < 0 ? u.impronte.length + ' campioni, ' + u.gol.join('-')
             : 'divergono al campione ' + k + ' (secondo ' + k + '), ' + u.gol.join('-') + ' contro ' + d.gol.join('-'));
  }
  console.log('');

  /* ---- B: due pagine diverse ---- */
  console.log('B) DUE PAGINE DIVERSE, stesso seme — quel che sopravvive fra le partite qui non c\'e\'');
  const B = await apri(browser, srv.porta, SEME);
  for (let i = 0; i < PARTITE; i++) {
    const s = (SEME + i) >>> 0;
    const u = await gioca(A.pag, s, TAGLIA, 1);
    const d = await gioca(B.pag, s, TAGLIA, 1);
    const k = primoScarto(u.impronte, d.impronte);
    di(k < 0, 'seme ' + s + ': la pagina nuova vede la stessa partita',
       k < 0 ? u.impronte.length + ' campioni' : 'divergono al campione ' + k);
  }
  console.log('');

  /* ---- C: con le dita ---- */
  console.log('C) CON LE DITA — la stessa sequenza di comandi rigiocata da' + '\'' + ' la stessa partita');
  console.log('   (e\' la prova che riguarda il multigiocatore: se passa, sulla rete bastano i comandi)');
  const conDita = async (pag, seme) => pag.evaluate(([seme, taglia, IMPR]) => {
    const t = window.__test;
    window.__caso.semina(seme);
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    const leggi = new Function('return ' + IMPR);
    const impronte = [];
    /* un copione di comandi FISSO, senza sorteggi: la levetta gira, e il
       disco grande si preme a cadenza regolare. Non serve che sia bello:
       serve che sia identico due volte. */
    for (let f = 0; f < 300; f++) {
      const a = f * 0.11;
      if (typeof umanoLevetta === 'function') { /* se un giorno esistesse */ }
      G.stick = G.stick || {};
      if (t.dita) t.dita(Math.cos(a), Math.sin(a), (f % 37) === 0);
      t.simulate(1 / 60);
      if (f % 6 === 0) impronte.push(leggi());
    }
    return { impronte, gol: [G.score[0], G.score[1]], haDita: typeof t.dita === 'function' };
  }, [seme, TAGLIA, IMPRONTA]);
  const c1 = await conDita(A.pag, SEME);
  const c2 = await conDita(B.pag, SEME);
  const kc = primoScarto(c1.impronte, c2.impronte);
  if (!c1.haDita) {
    console.log('  --   il gioco non espone __test.dita: la prova col dito non si puo\' fare da qui.');
    console.log('       Resta valida la prova A e B, che coprono la simulazione; il comando');
    console.log('       umano andra\' misurato quando il registratore dei comandi esistera\'.');
  } else {
    di(kc < 0, 'la stessa sequenza di comandi da\' la stessa partita',
       kc < 0 ? c1.impronte.length + ' campioni' : 'divergono al campione ' + kc);
  }

  /* ---- D: il seme DENTRO il gioco, col caso del browser rimesso ---- */
  console.log('');
  console.log('D) IL SEME DENTRO IL GIOCO — col caso vero del browser rimesso al suo posto');
  console.log('   (le prove A e B valgono perche\' e\' il banco a seminare Math.random. Questa');
  console.log('    e\' l\'unica che dice se il gioco sa seminarsi DA SOLO, che e\' cio\' che');
  console.log('    serve a due telefoni veri.)');
  const haSeme = await A.pag.evaluate(() => typeof window.__test.semina === 'function');
  if (!haSeme) {
    console.log('  --   il gioco non espone __test.semina: la toppa _t-seme.js non e\' applicata.');
    console.log('       Finche\' non lo e\', il determinismo esiste solo sul banco.');
  } else {
    const conSeme = async (pag, seme) => pag.evaluate(([seme, taglia, IMPR]) => {
      const t = window.__test;
      /* IL CASO VERO TORNA AL SUO POSTO. Da qui in poi Math.random e'
         quello del browser: se la partita e' ancora ripetibile, e' merito
         del seme del gioco e di nient'altro. */
      if (window.__casoVero) Math.random = window.__casoVero;
      t.semina(seme);
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      const leggi = new Function('return ' + IMPR);
      const impronte = [];
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(1); sim += 1; impronte.push(leggi()); }
      return { impronte, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi };
    }, [seme, TAGLIA, IMPRONTA]);

    for (let i = 0; i < PARTITE; i++) {
      const s = (SEME + i) >>> 0;
      const u = await conSeme(A.pag, s);
      const d = await conSeme(B.pag, s);   /* pagina diversa: nessuno stato in comune */
      const k = primoScarto(u.impronte, d.impronte);
      di(k < 0, 'seme interno ' + s + ': due telefoni vedono la stessa partita',
         k < 0 ? u.impronte.length + ' campioni, ' + u.gol.join('-') + ', ' +
                 u.sorteggi.toLocaleString('it-IT') + ' sorteggi'
               : 'divergono al campione ' + k + ' (secondo ' + k + '), ' +
                 u.gol.join('-') + ' contro ' + d.gol.join('-'));
    }

    /* E il rovescio: SPENTO il seme, la partita NON deve ripetersi. Se si
       ripetesse lo stesso, vorrebbe dire che il caso non entra piu' nel
       gioco — cioe' che abbiamo tolto la varieta' a chi gioca offline
       per far funzionare la rete. Sarebbe il modo peggiore di passare
       questa prova. */
    const senzaSeme = async pag => pag.evaluate(([taglia, IMPR]) => {
      const t = window.__test;
      if (window.__casoVero) Math.random = window.__casoVero;
      t.desemina();
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      const leggi = new Function('return ' + IMPR);
      const impronte = [];
      let sim = 0;
      while (t.state !== 'end' && sim < 120) { t.simulate(1); sim += 1; impronte.push(leggi()); }
      return impronte;
    }, [TAGLIA, IMPRONTA]);
    const x = await senzaSeme(A.pag), y = await senzaSeme(A.pag);
    di(primoScarto(x, y) >= 0,
       'col seme SPENTO due partite sono diverse — il gioco offline non ha perso il caso',
       primoScarto(x, y) >= 0 ? 'divergono al campione ' + primoScarto(x, y)
                              : 'IDENTICHE: il caso non entra piu\' nel gioco');
  }

  await browser.close(); srv.chiudi();
  if (A.errori.length || B.errori.length) {
    console.error('\nECCEZIONI DI PAGINA: ' + [...A.errori, ...B.errori].slice(0, 3).join(' | '));
    process.exit(2);
  }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  if (rossi) {
    console.log('\nIL GIOCO NON E\' DETERMINISTICO: sulla rete non bastano i comandi, e il');
    console.log('multigiocatore deve sincronizzare lo stato. Prima di costruirlo, trovare');
    console.log('che cosa diverge — il campione dello scarto dice a che secondo guardare.');
  } else {
    console.log('\nIL GIOCO E\' DETERMINISTICO: due telefoni con lo stesso seme e gli stessi');
    console.log('comandi vedono la stessa partita. Sulla rete bastano i COMANDI.');
  }
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + e.message); process.exit(2); });
