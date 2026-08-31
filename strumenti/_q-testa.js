/* =====================================================================
   _q-testa.js — IL COLPO DI TESTA HA UN CORPO? (29 agosto 2026)

   Il banco della cura _t-testa-corpo.js. Quattro prove, e la quarta e'
   quella che impedisce a questo file di essere l'ennesimo cancello che
   ATTESTA invece di misurare.

   A  LA FISICA NON E' CAMBIATA DI UN BIT.
      La stessa partita, stesso seme, giocata dal gioco PRIMA e dal gioco
      DOPO: l'impronta (pallone, ventidue uomini, punteggio, cronometro)
      deve coincidere campione per campione. La cura promette di toccare
      solo il DISEGNO; questa prova e' la promessa messa per iscritto.
      Se diverge, la patch ha toccato la simulazione e va rifatta.

   B  IL COLPO DI TESTA PERCORRE LA CLIP 'testa'.
      Si campiona a 1/60 e si guardano le TRANSIZIONI: l'istante in cui
      un giocatore passa da kickT=0 a kickT>0. Se al campione precedente
      il pallone stava sopra quota 26 e nessuno lo possedeva, quel calcio
      e' un colpo di testa — e p.kickClip deve valere 'testa'.
      NESSUNA MODIFICA AL GIOCO: si guarda lo stato, non si inietta una
      sonda dentro colpoDiTesta. Un banco che riscrive il pezzo che deve
      misurare misura sé stesso.

   C  QUANTO PESA.
      Quanti colpi di testa per partita, alle tre taglie. Serve a dire se
      la cura vale il codice che costa: una posa che si vede due volte
      l'anno non e' una cura, e' un ornamento.

   D  IL CONTROLLO DI CONTROLLO — la prova B sa uscire ROSSA?
      La stessa prova B girata sul gioco PRIMA: li' ogni colpo di testa
      deve risultare 'passaggio'. Se anche prima dicesse 'testa', vorrebbe
      dire che la sonda non guarda quello che crede di guardare, e allora
      il verde della prova B non varrebbe niente.
      Questa e' la classe di errore che in questa casa e' gia' costata
      tre cancelli (uno leggeva la dichiarazione del gioco invece dei
      pixel, uno aveva l'iniezione costruita in modo che meta' del
      cancello non potesse scattare, una media query era scritta prima
      delle regole che doveva battere). Non se ne fa un quarto.

   uso:  node strumenti/_q-testa.js
         node strumenti/_q-testa.js --taglie 5,7,11 --partite 3
   esce 0 se tutto verde, 1 se una prova e' rossa, 2 se il banco esplode.
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

const PRIMA = arg('prima', 'CALCETTO-il-gioco.html');
const DOPO = arg('dopo', 'fuori/testa.html');
const TAGLIE = arg('taglie', '5,7,11').split(',').map(Number);
const PARTITE = parseInt(arg('partite', '3'), 10);
const SEME = parseInt(arg('seme', '20260803'), 10) >>> 0;

const esiti = [];
const di = (ok, nome, det) => {
  esiti.push(ok);
  console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : ''));
};
function esplode(motivo) {
  console.log('\nBANCO NON VALIDO - ' + motivo);
  console.log('Non e\' un giudizio sulla cura: non ho potuto misurarla.');
  process.exit(2);
}

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function apri(browser, porta, rel, seme) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = p(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, seme);
  await pag.goto('http://127.0.0.1:' + porta + '/' + rel, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (errori.length) esplode('la pagina ' + rel + ' e\' partita con un errore: ' + errori[0].slice(0, 160));
  return { ctx, pag, errori };
}

/* ---- l'impronta della prova A: la SIMULAZIONE, non il disegno ---- */
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

async function partitaImpronta(pag, seme, taglia) {
  return pag.evaluate(([seme, taglia, IMPR]) => {
    const t = window.__test;
    window.__caso.semina(seme);
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    t.setCpuVsCpu(true);
    const impronte = [];
    const leggi = new Function('return (' + IMPR + ')');
    let sim = 0;
    while (t.state !== 'end' && sim < 600) { t.simulate(1); sim += 1; impronte.push(leggi()); }
    return { impronte, gol: [G.score[0], G.score[1]] };
  }, [seme, taglia, IMPRONTA]);
}

/* ---- la sonda delle prove B/C/D: campiona a 1/60 e guarda le
   TRANSIZIONI di kickT. Non modifica una riga del gioco. ---- */
async function partitaColpi(pag, seme, taglia) {
  return pag.evaluate(([seme, taglia]) => {
    const t = window.__test;
    window.__caso.semina(seme);
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    t.setCpuVsCpu(true);
    const DT = 1 / 60;
    /* la quota oltre la quale il pallone passa sopra i corpi: la
       ricopio qui perche' il banco non deve leggere una costante del
       gioco che il gioco stesso potrebbe cambiare sotto di lui */
    const Z_SOPRA_TESTA = 26, Z_TESTA_MAX = 46;
    let prima = G.players.map(p => p.kickT || 0);
    let bz = G.ball.z || 0, bown = G.ball.owner;
    const colpi = [];          // i colpi di testa: {clip}
    const calci = [];          // tutti gli altri calci: {clip}
    let passi = 0;
    while (t.state !== 'end' && passi < 60 * 600) {
      t.simulate(DT); passi++;
      const ps = G.players;
      for (let i = 0; i < ps.length; i++) {
        const k = ps[i].kickT || 0;
        if (k > 0 && prima[i] <= 0) {
          /* un calcio E' COMINCIATO su questo giocatore. Era di testa?
             Lo dice la QUOTA DEL PALLONE AL CAMPIONE PRECEDENTE, che e'
             la condizione esatta con cui updateBall sceglie la testa. */
          const rec = { clip: ps[i].kickClip || null };
          if (bown < 0 && bz > Z_SOPRA_TESTA && bz <= Z_TESTA_MAX) colpi.push(rec);
          else calci.push(rec);
        }
        prima[i] = k;
      }
      bz = G.ball.z || 0; bown = G.ball.owner;
    }
    return { colpi, calci, gol: [G.score[0], G.score[1]] };
  }, [seme, taglia]);
}

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

(async () => {
  for (const f of [PRIMA, DOPO])
    if (!fs.existsSync(path.resolve(RADICE, f))) esplode('manca il file ' + f);

  const srv = await servi();
  const browser = await chromium.launch();
  console.log('=== IL COLPO DI TESTA HA UN CORPO? ===');
  console.log('prima: ' + PRIMA + '\ndopo:  ' + DOPO);
  console.log('taglie ' + TAGLIE.join('/') + ', ' + PARTITE + ' partite per taglia, semi '
              + SEME + '..' + (SEME + PARTITE - 1) + '\n');

  /* ================= A — LA FISICA NON E' CAMBIATA ================= */
  console.log('A) LA STESSA PARTITA, PRIMA E DOPO: la simulazione coincide?');
  const pA = await apri(browser, srv.porta, PRIMA, SEME);
  const pB = await apri(browser, srv.porta, DOPO, SEME);
  for (const taglia of TAGLIE) {
    for (let i = 0; i < PARTITE; i++) {
      const s = (SEME + i) >>> 0;
      const a = await partitaImpronta(pA.pag, s, taglia);
      const b = await partitaImpronta(pB.pag, s, taglia);
      const k = primoScarto(a.impronte, b.impronte);
      di(k === -1, taglia + 'v' + taglia + ' seme ' + s,
         k === -1 ? a.impronte.length + ' campioni identici, ' + a.gol.join('-')
                  : 'DIVERGE al campione ' + k + ' — ' + a.gol.join('-') + ' contro ' + b.gol.join('-'));
    }
  }
  await pA.ctx.close(); await pB.ctx.close();

  /* ============ B + C + D — LA CLIP, IL PESO, IL CONTROLLO ========= */
  console.log('\nB) OGNI COLPO DI TESTA PERCORRE LA CLIP "testa"?');
  const dopo = await apri(browser, srv.porta, DOPO, SEME);
  const contoDopo = {};
  for (const taglia of TAGLIE) {
    let colpi = 0, giusti = 0, sbagliate = {};
    for (let i = 0; i < PARTITE; i++) {
      const r = await partitaColpi(dopo.pag, (SEME + i) >>> 0, taglia);
      for (const c of r.colpi) {
        colpi++;
        if (c.clip === 'testa') giusti++;
        else sbagliate[String(c.clip)] = (sbagliate[String(c.clip)] || 0) + 1;
      }
    }
    contoDopo[taglia] = colpi;
    const male = Object.entries(sbagliate).map(([k, v]) => v + 'x' + k).join(' ');
    di(colpi > 0 && giusti === colpi, taglia + 'v' + taglia,
       colpi === 0 ? 'NESSUN COLPO DI TESTA in ' + PARTITE + ' partite: non misurato, non verde'
                   : giusti + '/' + colpi + ' con la clip giusta' + (male ? ' — sbagliate: ' + male : ''));
  }

  console.log('\nC) QUANTO PESA: colpi di testa per partita');
  for (const taglia of TAGLIE)
    console.log('     ' + taglia + 'v' + taglia + '  ' + (contoDopo[taglia] / PARTITE).toFixed(1) + ' a partita'
                + '  (' + contoDopo[taglia] + ' in ' + PARTITE + ')');
  await dopo.ctx.close();

  console.log('\nD) IL CONTROLLO DI CONTROLLO: sul gioco PRIMA la prova B deve uscire ROSSA');
  const prima = await apri(browser, srv.porta, PRIMA, SEME);
  for (const taglia of TAGLIE) {
    let colpi = 0, conTesta = 0, ripiego = {};
    for (let i = 0; i < PARTITE; i++) {
      const r = await partitaColpi(prima.pag, (SEME + i) >>> 0, taglia);
      for (const c of r.colpi) {
        colpi++;
        if (c.clip === 'testa') conTesta++;
        else ripiego[String(c.clip)] = (ripiego[String(c.clip)] || 0) + 1;
      }
    }
    const elenco = Object.entries(ripiego).map(([k, v]) => v + 'x' + k).join(' ');
    /* verde QUI vuol dire: il difetto c'era davvero, e la sonda lo vede.
       Se sul gioco vecchio nessun colpo risultasse sbagliato, la sonda
       non starebbe guardando niente. */
    di(colpi > 0 && conTesta === 0, taglia + 'v' + taglia + ' il difetto c\'era, e si vede',
       colpi === 0 ? 'NESSUN COLPO DI TESTA: la sonda non ha potuto provare niente'
                   : colpi + ' colpi, 0 con la clip giusta — ripiego: ' + elenco);
  }
  await prima.ctx.close();

  await browser.close(); srv.chiudi();
  const falliti = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' prove, ' + (esiti.length - falliti) + ' passate, ' + falliti + ' fallite');
  process.exit(falliti ? 1 : 0);
})().catch(e => esplode(e.message));
