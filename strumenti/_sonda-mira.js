/* =====================================================================
   _sonda-mira.js — IL PUNTO MIRATO CONTA, O E' UN DISEGNO?

   PERCHE' ESISTE. Nel duello dal dischetto il dito trascina un mirino
   dentro lo specchio della porta e il pallone parte verso quel punto:
   lo dicono il disegno (drawDuelScene legge D.aimU e D.aimV in tre
   posti), il gonfiore della rete e il lampo dell'impatto. Ma chi decide
   l'esito — Duel.resolve — legge SOLO due numeri: s.zone, cioe' il
   terzo di porta, e s.powerQ, cioe' la banda. L'altezza non la legge
   nessuno, e dentro un terzo un punto vale l'altro.
   Questa sonda non discute: conta.

   COSA MISURA, e sono cinque numeri che si leggono da soli.

   1. LA GRIGLIA. Per ogni punto mirato (u orizzontale in unita' di
      terzo, v altezza: 0 traversa, 1 linea) e per ogni qualita' della
      banda, la percentuale di GOL su N ripetizioni con il portiere che
      sceglie i tre terzi in parti uguali. Da qui escono le due misure
      che dicono se la mira e' viva:
        DISLIVELLO IN ALTEZZA  = massimo scarto di gol% fra due altezze
                                 con la stessa u e la stessa banda.
                                 Se e' zero, l'altezza e' un disegno.
        DISLIVELLO DENTRO IL TERZO = massimo scarto di gol% fra due u
                                 dentro lo STESSO terzo.
                                 Se e' zero, il mirino continuo e' una
                                 scorciatoia di tre bottoni.
   2. LA CONVERSIONE MEDIA sull'insieme della griglia: serve a sapere se
      una cura che accende la mira ha anche spostato quanti rigori
      finiscono dentro. Un rigore vero entra tre volte su quattro.
   3. IL DUELLO DELLA CPU giocato per intero (start, mira, banda, tuffo,
      risoluzione): e' quello che vede _eventi.js, dove il 25% delle
      partite si decide ai rigori.
   4. IL FILTRANTE E L'ORDINE DELL'ELENCO. scegliFiltrante e' chiamato
      con lo stesso stato di gioco e con l'elenco dei giocatori ruotato
      e rovesciato: se il ricevente cambia, la scelta dipende
      dall'ordine dell'array e non dal campo. Si contano i disaccordi.
      Piu' il COSTO: microsecondi per chiamata, perche' la linea di
      guida la chiama a ogni fotogramma mentre il dito tiene il
      passaggio.
   5. IL TIRATORE CHE NON PUO' MIRARE (aggiunta del 28 agosto 2026, su
      richiesta della revisione avversaria alla toppa _t-mira). La
      griglia della prova 1 misura SOLO il dito: fissa u e v a mano,
      cioe' fa finta che chiunque possa scegliere un punto. Ma A/S/D e
      le frecce — l'unico modo di tirare un rigore per chi gioca al
      computer, e l'unico che resti al secondo giocatore su una
      tastiera sola — non scrivono aimU/aimV da nessuna parte:
      pickZone inventa il centro del terzo (u = z-1) a mezza altezza
      (v = 0,50). Questa prova misura QUEL tiratore, che e' anche
      quello della CPU, e stampa la larghezza della banda che gli
      tocca, presa dal gioco chiamando davvero pickZone. Se una cura
      sulla mira gli fa pagare qualcosa, si vede qui e solo qui.

   IL CASO E' GOVERNATO: Math.random e' xorshift32 a seme fisso e viene
   ri-seminato all'inizio di ogni blocco, quindi due giochi diversi
   vedono la stessa sequenza di dadi.

   uso:
     node strumenti/_sonda-mira.js
     node strumenti/_sonda-mira.js --gioco fuori/mira.html
     node strumenti/_sonda-mira.js --prove 4000 --diff 1
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

const PROVE = +arg('prove', 3000);      // ripetizioni per casella x terzo del portiere
const DIFFI = +arg('diff', 1);          // 0 Facile, 1 Normale, 2 Duro
const SEME = +arg('seme', 20260803);
const DUELLI = +arg('duelli', 900);     // duelli CPU giocati per intero
const STATI = +arg('stati', 240);       // stati di gioco per la prova del filtrante
const PROVA = arg('gioco', process.env.GIOCO_PROVA || '');
const provaAbs = PROVA ? path.resolve(RADICE, PROVA) : '';
if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: non esiste ' + provaAbs); process.exit(2); }

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* le altezze e le u della griglia: coprono la finestra vera del mirino
   (duelMira taglia u a +-1,258 e v fra 0,21 e 0,80) */
const GU = [-1.20, -0.80, -0.25, 0.25, 0.80, 1.20];
const GV = [0.24, 0.42, 0.60, 0.78];
const GQ = [1, 0.6, 0.3, 0.05];

(async () => {
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, SEME);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);

  console.log(`=== SONDA MIRA — griglia ${GU.length}x${GV.length}x${GQ.length}, ${PROVE} prove per casella e terzo ===`);
  console.log(`  --    gioco: ${provaAbs ? path.relative(RADICE, provaAbs) : 'CALCETTO-il-gioco.html (repo)'}`);
  console.log(`  --    difficolta': ${['Facile', 'Normale', 'Duro'][DIFFI]}   seme ${SEME}`);

  /* ------------------------------------------------------------------
     1-2. LA GRIGLIA DELLA MIRA
     ------------------------------------------------------------------ */
  const g = await pag.evaluate(([seme, diffi, prove, GU, GV, GQ]) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    window.__caso.semina(seme);
    t.startMatch(1, diffi, { size: 11 });
    t.setCpuVsCpu(true);
    const D = t.Duel, G = t.G;
    /* il duello si prepara UNA volta (start pesca la banda e accende
       l'interfaccia); poi si riscrivono i campi e si chiama resolve.
       resolve non legge phase, quindi ripeterla e' lecito. */
    D.start(0);
    D.shooterHuman = true; D.keeperHuman = false;
    const celle = [];
    for (const u of GU) {
      for (const v of GV) {
        for (const q of GQ) {
          const conta = { gol: 0, parata: 0, fuori: 0 };
          for (let kz = 0; kz < 3; kz++) {
            for (let i = 0; i < prove; i++) {
              D.phase = 'zone';
              D.aimU = u; D.aimV = v;
              /* LA GRIGLIA E' IL DITO. Dal 28 agosto il gioco distingue
                 un punto MIRATO da un punto inventato da pickZone per
                 chi ha solo dei tasti: qui si scrivono u e v a mano,
                 quindi il tiratore che si sta misurando e' quello che
                 ha mirato. Sul gioco spedito, che questo campo non ce
                 l'ha, la riga e' una proprieta' in piu' che non legge
                 nessuno — cioe' i due file restano confrontabili. */
              D.mirato = true;
              D.zone = u < -0.5 ? 0 : (u > 0.5 ? 2 : 1);
              D.keeperZone = kz;
              D.powerQ = q;
              D.shown = false;
              D.resolve();
              conta[D.outcome]++;
            }
          }
          const tot = conta.gol + conta.parata + conta.fuori;
          celle.push({ u, v, q, gol: conta.gol / tot, parata: conta.parata / tot, fuori: conta.fuori / tot });
        }
      }
    }
    D.phase = 'off';
    return celle;
  }, [SEME, DIFFI, PROVE, GU, GV, GQ]);

  const pc = x => (x * 100).toFixed(1).padStart(5);
  console.log('\n=== 1. LA GRIGLIA — GOL % (portiere sui tre terzi in parti uguali) ===');
  for (const q of GQ) {
    console.log(`  banda ${q === 1 ? 'PERFETTA (powerQ 1)' : 'powerQ ' + q}`);
    console.log('      v \\ u   ' + GU.map(u => String(u).padStart(6)).join(''));
    for (const v of GV) {
      const riga = GU.map(u => pc(g.find(c => c.u === u && c.v === v && c.q === q).gol) + ' ');
      console.log('      ' + String(v).padStart(5) + '   ' + riga.join(''));
    }
  }

  /* i due dislivelli, e ognuno due volte: su tutte le bande e SOLO sulla
     banda perfetta. Il primo e' il numero grosso, ma prende quasi sempre
     la riga della banda sbagliata, dove l'altezza decide fra «sbucciata
     in cielo» e «accentrata addosso al portiere»; il secondo dice se la
     mira conta anche quando il pollice non sbaglia niente, ed e' quello
     che una cura puo' barare piu' facilmente. Si guardano tutti e due. */
  let dislAlt = 0, dislAltDove = '', dislAlt1 = 0;
  for (const u of GU) for (const q of GQ) {
    const vals = GV.map(v => g.find(c => c.u === u && c.v === v && c.q === q).gol);
    const d = Math.max(...vals) - Math.min(...vals);
    if (d > dislAlt) { dislAlt = d; dislAltDove = `u=${u} banda=${q}`; }
    if (q === 1 && d > dislAlt1) dislAlt1 = d;
  }
  const TERZO = u => (u < -0.5 ? 0 : (u > 0.5 ? 2 : 1));
  let dislTerzo = 0, dislTerzoDove = '', dislTerzo1 = 0;
  for (let z = 0; z < 3; z++) {
    const us = GU.filter(u => TERZO(u) === z);
    if (us.length < 2) continue;
    for (const v of GV) for (const q of GQ) {
      const vals = us.map(u => g.find(c => c.u === u && c.v === v && c.q === q).gol);
      const d = Math.max(...vals) - Math.min(...vals);
      if (d > dislTerzo) { dislTerzo = d; dislTerzoDove = `terzo=${z} v=${v} banda=${q}`; }
      if (q === 1 && d > dislTerzo1) dislTerzo1 = d;
    }
  }
  const convMedia = g.reduce((s, c) => s + c.gol, 0) / g.length;
  const convPerf = g.filter(c => c.q === 1).reduce((s, c) => s + c.gol, 0) / g.filter(c => c.q === 1).length;

  console.log('\n=== 2. I NUMERI CHE DECIDONO ===');
  console.log(`  DISLIVELLO IN ALTEZZA        ${pc(dislAlt)} punti   (${dislAltDove})`);
  console.log(`    di cui a banda perfetta    ${pc(dislAlt1)} punti`);
  console.log(`  DISLIVELLO DENTRO IL TERZO   ${pc(dislTerzo)} punti   (${dislTerzoDove})`);
  console.log(`    di cui a banda perfetta    ${pc(dislTerzo1)} punti`);
  /* IL RUMORE, perche' un dislivello va confrontato con qualcosa: sigma
     binomiale sul numero di prove per casella, moltiplicata per la radice
     di 2 (e' una differenza fra due caselle) e per 2,5 (il massimo su una
     ventina di confronti sale, e va detto). Sotto questa riga un
     dislivello non e' un segnale: e' campionamento. */
  const N = PROVE * 3;
  const rum = 2.5 * Math.SQRT2 * Math.sqrt(0.9 * 0.1 / N);
  console.log(`  soglia del rumore            ${pc(rum)} punti   (${N} prove per casella)`);
  console.log(`  conversione media griglia    ${pc(convMedia)} %`);
  console.log(`  conversione a banda perfetta ${pc(convPerf)} %`);

  /* ------------------------------------------------------------------
     3. IL DUELLO DELLA CPU, GIOCATO PER INTERO
     ------------------------------------------------------------------ */
  const d3 = await pag.evaluate(([seme, diffi, duelli]) => {
    const t = window.__test;
    window.__caso.semina(seme + 7);
    t.startMatch(1, diffi, { size: 11 });
    t.setCpuVsCpu(true);
    const D = t.Duel;
    const conta = { gol: 0, parata: 0, fuori: 0 }; let perfetti = 0, giri = 0;
    for (let i = 0; i < duelli; i++) {
      D.start(i & 1);
      let k = 0;
      while (D.phase !== 'result' && k < 900) { D.update(1 / 60); k++; }
      giri += k;
      if (D.phase === 'result') { conta[D.outcome]++; if (D.powerQ >= 1) perfetti++; }
      D.phase = 'off'; D.shown = false;
    }
    const tot = conta.gol + conta.parata + conta.fuori;
    return { gol: conta.gol / tot, parata: conta.parata / tot, fuori: conta.fuori / tot, perf: perfetti / tot, giri: giri / tot };
  }, [SEME, DIFFI, DUELLI]);
  console.log('\n=== 3. IL DUELLO DELLA CPU — ' + DUELLI + ' duelli giocati per intero ===');
  console.log(`  gol ${pc(d3.gol)} %   parata ${pc(d3.parata)} %   fuori ${pc(d3.fuori)} %   banda perfetta ${pc(d3.perf)} %`);

  /* ------------------------------------------------------------------
     4. IL FILTRANTE E L'ORDINE DELL'ELENCO
     ------------------------------------------------------------------ */
  const d4 = await pag.evaluate(([seme, diffi, stati]) => {
    const t = window.__test;
    window.__caso.semina(seme + 11);
    t.startMatch(1, diffi, { size: 11 });
    t.setCpuVsCpu(true);
    const G = t.G;
    if (typeof window.scegliFiltrante !== 'function') return { errore: 'scegliFiltrante non e\' globale' };
    let confronti = 0, disaccordi = 0, vuoti = 0, tempo = 0;
    const dirs = [[1, 0], [0.87, 0.5], [0.5, 0.87], [0, 1], [-0.5, 0.87], [0.87, -0.5], [0.5, -0.87], [0, -1]];
    for (let s = 0; s < stati; s++) {
      t.simulate(0.35);
      /* si riparte SOLO a partita finita: rilanciare a ogni scena che
         non e' 'play' (kickoff, gol, punizione) rimetterebbe la partita
         all'inizio per sempre e la prova resterebbe senza campioni */
      if (G.scene === 'end' || G.scene === 'menu') { t.startMatch(1, diffi, { size: 11 }); t.setCpuVsCpu(true); continue; }
      if (G.scene !== 'play') continue;
      /* IL PORTATORE, o in mancanza il PIU' VICINO AL PALLONE della
         squadra 0: in partita il pallone e' «di nessuno» il 78,5% del
         tempo (misurato da _eventi.js), e chiedere il possesso
         lascerebbe la prova quasi senza campioni. Chi calcia il
         filtrante non cambia niente per questa domanda: si chiede se la
         scelta dipende dall'ORDINE dell'elenco, non da chi la fa. */
      let p = null, dm = 1e9;
      for (const q of G.players) {
        if (q.team !== 0 || q.role === 'gk' || q.out > 0) continue;
        const d = Math.hypot(q.x - G.ball.x, q.y - G.ball.y);
        if (d < dm) { dm = d; p = q; }
      }
      if (!p) continue;
      const orig = G.players.slice();
      for (const dd of dirs) {
        const t0 = performance.now();
        const a = window.scegliFiltrante(p, dd[0], dd[1]);
        tempo += performance.now() - t0;
        if (!a) { vuoti++; continue; }
        /* ROTAZIONE e ROVESCIAMENTO dello stesso insieme: il campo non
           cambia di un pixel, cambia solo l'ordine dell'array */
        const rot = orig.slice(5).concat(orig.slice(0, 5));
        G.players.length = 0; for (const q of rot) G.players.push(q);
        const b = window.scegliFiltrante(p, dd[0], dd[1]);
        const rev = orig.slice().reverse();
        G.players.length = 0; for (const q of rev) G.players.push(q);
        const c = window.scegliFiltrante(p, dd[0], dd[1]);
        G.players.length = 0; for (const q of orig) G.players.push(q);
        confronti += 2;
        if (b !== a) disaccordi++;
        if (c !== a) disaccordi++;
      }
    }
    return { confronti, disaccordi, vuoti, us: tempo * 1000 / Math.max(1, confronti / 2 + vuoti) };
  }, [SEME, DIFFI, STATI]);
  console.log('\n=== 4. IL FILTRANTE — la scelta dipende dall\'ordine dell\'elenco? ===');
  if (d4.errore) console.log('  ' + d4.errore);
  else {
    console.log(`  confronti           ${d4.confronti}`);
    console.log(`  DISACCORDI          ${d4.disaccordi}  (${(100 * d4.disaccordi / Math.max(1, d4.confronti)).toFixed(1)}%)`);
    console.log(`  coni vuoti (nessun compagno nella direzione, si ripiega sul passaggio)  ${d4.vuoti}`);
    console.log(`  costo per chiamata  ${d4.us.toFixed(1)} microsecondi`);
  }

  /* ------------------------------------------------------------------
     5. IL TIRATORE CHE NON PUO' MIRARE — tastiera e CPU
     ------------------------------------------------------------------
     Non si scrivono aimU/aimV a mano: si chiama pickZone(z) SENZA punto,
     che e' letteralmente la riga che esegue Duel.key quando qualcuno
     preme A/S/D (o le frecce), e poi si legge quello che il gioco ha
     deciso — la larghezza della banda e l'esito. E' l'unica prova di
     questa sonda che passa dall'ingresso vero invece che dai campi. */
  const d5 = await pag.evaluate(([seme, diffi, prove, GQ]) => {
    const t = window.__test;
    window.__caso.semina(seme + 13);
    t.startMatch(1, diffi, { size: 11 });
    t.setCpuVsCpu(true);
    const D = t.Duel;
    const righe = [];
    for (let z = 0; z < 3; z++) {
      D.start(0);
      D.shooterHuman = true; D.keeperHuman = false;
      D.pickZone(z);                       // <- il tasto, senza punto
      const larg = D.band1 - D.band0;
      const au = D.aimU, av = D.aimV;
      for (const q of GQ) {
        const conta = { gol: 0, parata: 0, fuori: 0 };
        for (let kz = 0; kz < 3; kz++) {
          for (let i = 0; i < prove; i++) {
            D.phase = 'zone';
            D.zone = z; D.aimU = au; D.aimV = av;
            D.keeperZone = kz; D.powerQ = q; D.shown = false;
            D.resolve();
            conta[D.outcome]++;
          }
        }
        const tot = conta.gol + conta.parata + conta.fuori;
        righe.push({ z, q, larg, au, av, gol: conta.gol / tot, fuori: conta.fuori / tot });
      }
      D.phase = 'off';
    }
    return righe;
  }, [SEME, DIFFI, PROVE, GQ]);
  console.log('\n=== 5. IL TIRATORE CHE NON PUO\' MIRARE (A/S/D, frecce, CPU) ===');
  console.log('   terzo   banda    punto imposto      ' + GQ.map(q => ('powerQ ' + q).padStart(12)).join(''));
  for (let z = 0; z < 3; z++) {
    const r0 = d5.find(r => r.z === z);
    const cel = GQ.map(q => (pc(d5.find(r => r.z === z && r.q === q).gol) + '%').padStart(12)).join('');
    console.log('     ' + z + '   ' + r0.larg.toFixed(5) + '   u=' + r0.au.toFixed(2).padStart(5) +
                ' v=' + r0.av.toFixed(2) + '   ' + cel);
  }
  console.log('   (gol %, portiere sui tre terzi in parti uguali. La banda e\' quella');
  console.log('    che pickZone ha posato davvero, senza che nessuno l\'abbia scritta.)');

  if (errori.length) { console.log('\n  ATTENZIONE — eccezioni in pagina:'); for (const e of errori) console.log('    ' + e); }
  await ctx.close(); await browser.close(); srv.chiudi();
})();
