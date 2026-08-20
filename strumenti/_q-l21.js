/* =====================================================================
   _q-l21.js — IL CANCELLO DELLA VOCE L2.1: il pallone si allontana dal
   piede quando corri, e a Duro il contatto smette di essere una condanna
   certa.

   SCRITTO PRIMA DELLA TOPPA (strumenti/_t-l21.js), e ROSSO sul gioco del
   20 agosto 2026 (md5 30279089de83249e44e66d2247294f5f). Ogni soglia
   discende da una misura fatta quel giorno con strumenti/_sonda-l21.js,
   riportata accanto.

   COSA LEGGE. Solo EFFETTI nel mondo simulato:
     - la DISTANZA pallone-piede (len(b.x-p.x, b.y-p.y)) a regime, per tre
       andature del portatore. Non legge CARRY_DIST: nel gioco il pallone
       insegue un bersaglio con ritardo, e la distanza vera e' un'altra
       cosa (misurato: bersaglio 16, distanza vera 3,8 in sprint).
     - il PASSAGGIO DI b.owner al difensore nel primo contatto di un
       duello frontale (furto), contro il suo kickCd che sale a 0,45 col
       possesso intatto (tentativo fallito). Nessuna bandiera scritta dal
       codice sotto esame: owner e kickCd sono lo stato che il resto del
       gioco consuma.

   LE SEI ASSERZIONI (semi fissi: la ripetizione da' gli stessi numeri).

   A1 (controllo negativo) — da fermo la distanza resta 15..17 u.
      Misurato oggi: 16,00. La toppa NON deve toccare il pallone da fermo
      (i piazzamenti di calcio d'inizio usano la stessa costante).
   A2 — distanza(sprint) - distanza(corsa) >= +4,0 u.
      Oggi: 3,79 - 6,89 = -3,10 --> ROSSO. Oggi chi corre piu' forte ha il
      pallone PIU' vicino: l'esposizione e' invertita. Il +4 e' meta'
      abbondante dell'effetto che la toppa disegna (~+10), cosi' il verde
      non dipende dal decimale.
   A3 — distanza(sprint) >= 15,0 u.
      Oggi: 3,79 --> ROSSO. «Esposto» significa: almeno quanto il pallone
      di chi sta FERMO (16 u, meno 1 di tolleranza di regime). Se a tutta
      velocita' il pallone sta piu' vicino che da fermo, la voce non e'
      entrata.
   B1 (validita' del banco) — contatti classificati nel duello a Duro
      >= 40 su 60 prove. Oggi: 60. Sotto, B2 non prova niente.
   B2 — quota di furto al primo contatto frontale, a Duro, <= 92%.
      Oggi: 60/60 = 100,0% --> ROSSO. DIFF[2].steal=1,00: il contatto e'
      una condanna, non una probabilita'. La toppa mette il tetto a 0,85;
      il 92% sta a meta' fra 85 e 100 (con n>=40 e p=0,85 il 92% e' a piu'
      di un sigma e mezzo, e coi semi fissi il numero non balla affatto).
   B3 (controllo negativo) — a Medio la stessa quota resta in 55..88%.
      Oggi: 44/60 = 73,3% (DIFF[1].steal=0,72). Prova due cose: che il
      banco legge davvero una probabilita' (non un ramo rotto), e che la
      toppa non ha toccato le difficolta' sotto il tetto.

   uso:
     node strumenti/_q-l21.js                       (gioco del repo)
     node strumenti/_q-l21.js --gioco fuori/l21.html
   esce 0 se 6/6, altrimenti 1.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}

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

/* la stessa geometria di _sonda-l21.js --scena dist: avversari
   parcheggiati, tre passate, distanza mediana a regime */
const DIST = ([seme]) => {
  const t = window.__test;
  window.__caso.semina(seme);
  t.startMatch(1, 1);
  t.setCpuVsCpu(true);
  let attesa = 0;
  while (G.scene !== 'play' && attesa < 20) { t.simulate(1); attesa++; }
  t.setCpuVsCpu(false);
  const b = G.ball;
  const pi = G.players.findIndex(q => q.team === 0 && q.role !== 'gk');
  const p = G.players[pi];
  G.ctrl[0] = pi;
  const parcheggia = () => {
    for (const q of G.players) {
      if (q === p) continue;
      q.x = q.team === 1 ? FW - 40 : 40;
      q.y = 40; q.vx = 0; q.vy = 0; q.kickCd = 1; q.slide = -1; q.recover = 0;
    }
  };
  const passata = (conKeys, conSprint) => {
    Keys['KeyD'] = conKeys; Keys['ShiftLeft'] = conSprint;
    G.timeLeft = 60;
    p.x = 150; p.y = FH / 2; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
    p.fiato = 100; p.kickCd = 0; p.charge = -1; p.slide = -1; p.recover = 0;
    b.x = p.x + 16; b.y = p.y; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0; b.owner = pi;
    const dCamp = [];
    for (let f = 0; f < 210; f++) {
      parcheggia();
      step();
      if (b.owner !== pi) return { rotto: 'possesso perso al fotogramma ' + f };
      if (f >= 90) dCamp.push(len(b.x - p.x, b.y - p.y));
    }
    Keys['KeyD'] = false; Keys['ShiftLeft'] = false;
    dCamp.sort((a, c) => a - c);
    return { d: dCamp[(dCamp.length / 2) | 0] };
  };
  return { fermo: passata(false, false), corsa: passata(true, false), sprint: passata(true, true) };
};

/* lo stesso duello di _sonda-l21.js --scena duello, in sprint */
const DUELLO = ([seme, diff, prove]) => {
  const t = window.__test;
  window.__caso.semina(seme);
  t.startMatch(1, diff);
  t.setCpuVsCpu(true);
  let attesa = 0;
  while (G.scene !== 'play' && attesa < 20) { t.simulate(1); attesa++; }
  t.setCpuVsCpu(false);
  const b = G.ball;
  const pi = G.players.findIndex(q => q.team === 0 && q.role !== 'gk');
  const p = G.players[pi];
  G.ctrl[0] = pi;
  const dif = G.players.find(q => q.team === 1 && q.role !== 'gk');
  const R = { furto: 0, fallito: 0, scivolata: 0, scappato: 0, altro: 0 };
  const parcheggia = () => {
    for (const q of G.players) {
      if (q === p || q === dif) continue;
      q.x = q.team === 1 ? FW - 40 : 40;
      q.y = 40; q.vx = 0; q.vy = 0; q.kickCd = 1; q.slide = -1; q.recover = 0;
    }
  };
  for (let i = 0; i < prove; i++) {
    window.__caso.semina(seme + 1000 + i);
    Keys['KeyD'] = true; Keys['ShiftLeft'] = true;
    G.timeLeft = 60;
    p.x = FW * 0.22; p.y = FH / 2; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
    p.fiato = 100; p.kickCd = 0; p.charge = -1; p.slide = -1; p.recover = 0; p.out = 0;
    dif.x = p.x + 130; dif.y = FH / 2; dif.vx = 0; dif.vy = 0; dif.fx = -1; dif.fy = 0;
    dif.fiato = 100; dif.kickCd = 0; dif.charge = -1; dif.slide = -1; dif.recover = 0; dif.out = 0;
    b.x = p.x + 16; b.y = p.y; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0; b.owner = pi;
    let esito = 'scappato';
    for (let f = 0; f < 300; f++) {
      parcheggia();
      const kdPrima = dif.kickCd;
      step();
      if (dif.slide >= 0) { esito = 'scivolata'; break; }
      if (b.owner !== pi) { esito = (G.players[b.owner] === dif) ? 'furto' : 'altro'; break; }
      if (kdPrima <= 0 && dif.kickCd > 0.40) { esito = 'fallito'; break; }
      if (p.x > FW * 0.72) break;
    }
    R[esito]++;
  }
  Keys['KeyD'] = false; Keys['ShiftLeft'] = false;
  return R;
};

(async () => {
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco inesistente: ' + provaAbs); process.exit(1); }
  const SEME = 20260820;
  const PROVE = 60;

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, SEME);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  const dist = await pag.evaluate(DIST, [SEME]);
  const duro = await pag.evaluate(DUELLO, [SEME, 2, PROVE]);
  const medio = await pag.evaluate(DUELLO, [SEME, 1, PROVE]);
  await ctx.close(); await browser.close(); srv.chiudi();

  console.log('\n=== _q-l21 — il pallone si allontana dal piede quando corri ===');
  console.log('  gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  if (errori.length) { console.error('  FALLITO: ' + errori[0]); process.exit(1); }
  for (const k of ['fermo', 'corsa', 'sprint']) {
    if (dist[k].rotto) { console.error(`  FALLITO: passata ${k} rotta: ${dist[k].rotto}`); process.exit(1); }
  }

  const esiti = [];
  const dice = (nome, ok, testo) => { esiti.push(ok); console.log(`  ${ok ? 'VERDE' : 'ROSSO'}  ${nome}  ${testo}`); };

  const dF = dist.fermo.d, dC = dist.corsa.d, dS = dist.sprint.d;
  dice('A1 fermo 15..17 u        ', dF >= 15 && dF <= 17, `distanza da fermo ${dF.toFixed(2)} u`);
  dice('A2 sprint-corsa >= +4 u  ', dS - dC >= 4.0, `${dS.toFixed(2)} - ${dC.toFixed(2)} = ${(dS - dC).toFixed(2)} u`);
  dice('A3 sprint >= 15 u        ', dS >= 15.0, `distanza in sprint ${dS.toFixed(2)} u`);

  const cDuro = duro.furto + duro.fallito;
  const qDuro = cDuro ? duro.furto / cDuro : NaN;
  dice('B1 contatti a Duro >= 40 ', cDuro >= 40, `${cDuro} contatti classificati su ${PROVE} prove (scivolate ${duro.scivolata}, scappati ${duro.scappato})`);
  dice('B2 furto a Duro <= 92%   ', cDuro >= 40 && qDuro <= 0.92, `${duro.furto}/${cDuro} = ${(qDuro * 100).toFixed(1)}%`);
  const cMed = medio.furto + medio.fallito;
  const qMed = cMed ? medio.furto / cMed : NaN;
  dice('B3 furto a Medio 55..88% ', cMed >= 40 && qMed >= 0.55 && qMed <= 0.88, `${medio.furto}/${cMed} = ${(qMed * 100).toFixed(1)}%`);

  const verdi = esiti.filter(Boolean).length;
  console.log(`\n  ${verdi}/${esiti.length}`);
  process.exit(verdi === esiti.length ? 0 : 1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
