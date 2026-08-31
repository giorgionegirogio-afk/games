/* =====================================================================
   _t3-tuffi.js — SOLA MISURA. Non scrive una riga nel gioco.

   LA DOMANDA, una sola: quando il portiere si butta, QUANTA STRADA fa
   davvero il suo corpo, e con che angolo lo vede la camera?

   Serve alla voce 14 del referto ONDA-ANIMAZIONE (famiglia F3): oggi la
   clip si sceglie con `Math.abs(p.diveDY)>0.45`, cioe' con la sola
   DIREZIONE del tuffo. Nessuno guarda la LUNGHEZZA. Un portiere che si
   sposta di sei unita' viene disegnato in volo esattamente come uno che
   ne copre quaranta.

   L'IDENTITA' CHE QUESTO BANCO VERIFICA, e che non e' un'ipotesi:
     yaw = atan2(diveDY, diveDX) + RIG_YAW_K,  RIG_YAW_K = pi/2
     |sin(yaw)| = |cos(atan2(diveDY,diveDX))| = |diveDX|
   cioe' il fattore che nella regola sagittale (_z-rotazione /
   _z-leggibile) moltiplica l'estensione della posa E' la componente
   frontale del tuffo. La stampa lo controlla numero per numero: se un
   giorno RIG_YAW_K cambiasse, questo banco lo direbbe invece di
   continuare a stampare la formula vecchia.

   COME MISURA. Non avvolge niente: guarda lo stato del gioco dopo ogni
   `simulate(1/60)`. Un tuffo si «arma» quando `p.chargeKind==='tuffo'`
   passa da spento ad acceso; in quell'istante `diveTX/diveTY` e
   `p.x/p.y` sono i due capi della strada da fare. Nessun sorteggio, e
   la sonda non chiama mai dado().

   uso:
     node strumenti/_t3-tuffi.js --gioco fuori/anim-terza.html
     node strumenti/_t3-tuffi.js --gioco X.html --partite 16 --seme 20260827
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
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const PARTITE = +arg('partite', 16);
const SEME = +arg('seme', 20260827);
const TAGLIA = +arg('taglia', 5);
const JSONOUT = arg('json', '');
/* --disegna: rifa' anche il render a ogni fotogramma, come il protocollo
   di _z-verbo. Le grandezze che questo banco misura (dive, diveT*, celeb)
   vivono TUTTE nella simulazione, quindi di norma il render si salta: e'
   quattro volte piu' veloce. Il flag esiste per DIMOSTRARLO invece di
   affermarlo — con e senza, il conto dei tuffi deve tornare identico. */
const DISEGNA = process.argv.indexOf('--disegna') > 0;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const ord = a => a.slice().sort((x, y) => x - y);
const quart = (a, q) => { if (!a.length) return NaN; const b = ord(a); const i = (b.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };
const f = (x, d) => (isFinite(x) ? x.toFixed(d === undefined ? 2 : d) : '  -');

(async () => {
  const srv = await servi();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, locale: 'it-IT'
  });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues)
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, SEME);
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(250);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });

  const tuffi = [], fotogrammi = [];
  const t0 = Date.now();
  for (let i = 0; i < PARTITE; i++) {
    const r = await pag.evaluate(([seme, taglia, dis]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      const armati = [], fot = [];
      const acceso = {};
      let n = 0;
      const MAX = 60 * 240;
      while (t.state !== 'end' && n < MAX) {
        t.simulate(1 / 60); if (dis) t.disegna(); n++;
        for (const p of G.players) {
          if (p.role !== 'gk') continue;
          const k = G.players.indexOf(p);
          const on = (p.charge >= 0 && p.chargeKind === 'tuffo');
          if (on && !acceso[k]) {
            /* i due capi della strada, nell'istante in cui il tuffo si arma */
            const L = Math.hypot((p.diveTX - p.x), (p.diveTY - p.y));
            armati.push([+L.toFixed(2), +Math.abs(p.diveDX).toFixed(4),
                         +Math.abs(p.diveDY).toFixed(4), t.state]);
          }
          acceso[k] = on;
          if (p.dive > 0 || p.recover > 0) {
            const st = rigStato(p);
            const yaw = rigAngolo(p) + RIG_YAW_K;
            fot.push([st.clip, +Math.abs(Math.sin(yaw)).toFixed(4),
                      +Math.abs(p.diveDX).toFixed(4)]);
          }
        }
      }
      return { armati, fot, frames: n };
    }, [(SEME + i * 7919) >>> 0, TAGLIA, DISEGNA]);
    tuffi.push(...r.armati); fotogrammi.push(...r.fot);
    console.log(`  -- partita ${i + 1}/${PARTITE}: ${r.frames} fotogrammi, ${r.armati.length} tuffi armati  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  await ctx.close(); await browser.close(); srv.chiudi();

  if (errori.length) { console.log('\n  ECCEZIONI:'); errori.forEach(e => console.log('   ' + e)); }

  const L = tuffi.map(r => r[0]);
  const DX = tuffi.map(r => r[1]);
  console.log('\n=====================================================================');
  console.log(' _t3-tuffi — ' + GIOCO + '   ' + PARTITE + ' partite, taglia ' + TAGLIA + ', seme ' + SEME);
  console.log('=====================================================================');
  console.log(' tuffi armati: ' + tuffi.length);
  console.log('\n LUNGHEZZA DELLA STRADA CHE IL CORPO DEVE FARE (unita\' di campo)');
  console.log('   q10 ' + f(quart(L, .10), 1) + '   q25 ' + f(quart(L, .25), 1) +
    '   MEDIANA ' + f(quart(L, .50), 1) + '   q75 ' + f(quart(L, .75), 1) +
    '   q90 ' + f(quart(L, .90), 1) + '   max ' + f(Math.max(...L), 1));
  for (const s of [8, 12, 16, 20, 26, 34, 46]) {
    const n = L.filter(x => x < s).length;
    console.log('   sotto ' + String(s).padStart(3) + ' unita\': ' + String(n).padStart(4) +
      '  (' + f(n / L.length * 100, 1) + '%)');
  }
  console.log('\n |diveDX| ALL\'ARMO — e\' il |sin(imbardata)| della regola sagittale');
  console.log('   q10 ' + f(quart(DX, .10), 3) + '   MEDIANA ' + f(quart(DX, .50), 3) +
    '   q90 ' + f(quart(DX, .90), 3));
  const soprasoglia = tuffi.filter(r => r[2] > 0.45).length;
  console.log('   |diveDY|>0,45 (cioe\' clip "tuffo" con la regola di oggi): ' +
    soprasoglia + '/' + tuffi.length + '  (' + f(soprasoglia / tuffi.length * 100, 1) + '%)');

  /* la verifica dell'identita' dichiarata in testa: |sin(yaw)| == |diveDX| */
  let peggio = 0, nf = 0;
  const perClip = {};
  for (const [clip, sn, dx] of fotogrammi) {
    perClip[clip] = perClip[clip] || { n: 0, sn: [] };
    perClip[clip].n++; perClip[clip].sn.push(sn);
    const d = Math.abs(sn - dx); if (d > peggio) peggio = d; nf++;
  }
  console.log('\n CONTROLLO DELL\'IDENTITA\'  |sin(yaw)| = |diveDX|  su ' + nf + ' fotogrammi di portiere');
  console.log('   scarto peggiore: ' + peggio.toExponential(2) +
    (peggio < 1e-6 ? '   -> l\'identita\' regge' : '   -> ATTENZIONE: non regge piu\''));
  console.log('\n FOTOGRAMMI DI PORTIERE IN TUFFO/RECUPERO, per clip');
  for (const c of Object.keys(perClip).sort((a, b) => perClip[b].n - perClip[a].n))
    console.log('   ' + c.padEnd(10) + String(perClip[c].n).padStart(6) +
      '   |sin| mediano ' + f(quart(perClip[c].sn, .5), 3));

  if (JSONOUT) {
    fs.writeFileSync(path.resolve(RADICE, JSONOUT),
      JSON.stringify({ gioco: GIOCO, partite: PARTITE, seme: SEME, taglia: TAGLIA, tuffi, perClip:
        Object.fromEntries(Object.entries(perClip).map(([k, v]) => [k, { n: v.n, snMed: quart(v.sn, .5) }])) }));
    console.log('\n   crudo in ' + JSONOUT);
  }
})();
