/* =====================================================================
   _sonda-portiere.js — I DUE NUMERI DEL PORTIERE SONO VIVI O MORTI?

   PERCHE' ESISTE. La schermata ROSA mostra al giocatore, per l'uomo di
   indice 0, due barre chiamate RIFLESSI e PRESA (sono tecnica e tackle
   rinominati: CALCETTO-il-gioco.html:33633). updateKeeper e tentaPresa
   non leggono un solo attributo del portiere, quindi alzare RIFLESSI da
   50 a 99 non sposta una virgola. _eventi.js non se ne puo' accorgere:
   li' i due portieri hanno 63 e 63, cioe' lo stesso numero, e una
   differenza fra due cose uguali e' zero anche quando la meccanica
   funziona.

   COSA MISURA. Cento partite CPU contro CPU con i DUE PORTIERI
   DIVERSI: al portiere della squadra 0 si scrivono gli attributi A, a
   quello della squadra 1 gli attributi B, subito dopo startMatch (che
   e' l'unico posto in cui setupPlayers gira: :8194). Poi si contano i
   gol SUBITI da ciascuno dei due, le prese e le respinte.
   Se i due numeri sono etichette morte, i gol subiti dai due portieri
   sono la stessa cosa a meno del rumore. Se sono vivi, si separano.

   La passata si fa DUE VOLTE a ruoli scambiati (A a sinistra e poi A a
   destra) sugli stessi semi, perche' le due squadre non sono
   intercambiabili — attaccano in versi diversi, e il campo non e'
   simmetrico nel codice quanto lo e' nel disegno. Il numero da leggere
   e' la media delle due, e la distanza fra le due righe e' la misura
   di quanto il banco stesso e' sbilanciato.

   IL CASO E' GOVERNATO come in _eventi.js: Math.random e' xorshift32 a
   seme fisso, ri-seminato a ogni partita, il ciclo di disegno e' spento
   e la sonda non pesca mai un numero casuale (legge G.stats e G.score
   dopo il fischio finale).

   uso:
     node strumenti/_sonda-portiere.js --partite 100 --taglia 11
     node strumenti/_sonda-portiere.js --a 25 --b 99 --partite 100
     node strumenti/_sonda-portiere.js --gioco fuori/gk.html --partite 100
     node strumenti/_sonda-portiere.js --campo tecnica    (solo RIFLESSI)
     node strumenti/_sonda-portiere.js --campo tackle     (solo PRESA)
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

const PARTITE = +arg('partite', 60);
const TAGLIA = +arg('taglia', 11);
const SEME = +arg('seme', 20260803);
const DIFF = +arg('diff', 1);
const VA = +arg('a', 25);
const VB = +arg('b', 99);
const CAMPO = String(arg('campo', 'tutti'));   // 'tecnica' | 'tackle' | 'tutti'
const DURATA = +arg('durata', 0) || null;
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

const media = a => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
const sigma = a => { const m = media(a); return Math.sqrt(media(a.map(x => (x - m) * (x - m)))); };

async function passata(browser, porta, vSin, vDes, etichetta) {
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
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    /* IL CONTATORE DEI QUATTRO ESITI. showBanner e' una dichiarazione di
       primo livello, quindi e' una proprieta' del globale e la si puo'
       avvolgere: il wrapper non pesca un numero casuale, quindi la
       partita misurata e' la partita non misurata. */
    const _sb = window.showBanner;
    window.__esiti = {};
    window.showBanner = function (txt) { window.__esiti[txt] = (window.__esiti[txt] | 0) + 1; return _sb.apply(this, arguments); };
  });

  const out = [];
  for (let i = 0; i < PARTITE; i++) {
    const r = await pag.evaluate(([seme, diff, taglia, durata, vS, vD, campo]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__esiti = {};
      if (durata && t.save) t.save.durata = durata;
      t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      /* LA SCRITTURA DEGLI ATTRIBUTI NON PESCA UN NUMERO: due assegnazioni
         su due oggetti gia' costruiti, dopo l'unica chiamata a
         setupPlayers. Il flusso dei dadi resta quello del gioco vergine. */
      for (const p of t.players) {
        if (p.role !== 'gk') continue;
        const v = p.team === 0 ? vS : vD;
        if (campo === 'tutti' || campo === 'tecnica') p.tecnica = v;
        if (campo === 'tutti' || campo === 'tackle') p.tackle = v;
      }
      let sim = 0;
      while (t.state !== 'end' && sim < 900) { t.simulate(10); sim += 10; }
      const s = t.stats;
      return {
        gol0: t.score[0], gol1: t.score[1],
        par0: s.parate[0] | 0, par1: s.parate[1] | 0,
        tiri0: s.tiri[0] | 0, tiri1: s.tiri[1] | 0,
        spec0: s.inPorta[0] | 0, spec1: s.inPorta[1] | 0,
        esiti: Object.assign({}, window.__esiti),
        scena: t.state
      };
    }, [(SEME + i) >>> 0, DIFF, TAGLIA, DURATA, vSin, vDes, CAMPO]);
    out.push(r);
    if (PARTITE >= 20 && (i + 1) % 20 === 0) console.log(`  --    ${etichetta}: ${i + 1}/${PARTITE}`);
  }
  await ctx.close();
  return { out, errori };
}

(async () => {
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  console.log(`=== SONDA PORTIERE — ${PARTITE} partite, ${TAGLIA} contro ${TAGLIA}, semi ${SEME}..${SEME + PARTITE - 1} ===`);
  console.log(`  --    gioco: ${provaAbs ? path.relative(RADICE, provaAbs) : 'CALCETTO-il-gioco.html (repo)'}`);
  console.log(`  --    campo: ${CAMPO}   valori: A=${VA}  B=${VB}`);

  const A = await passata(browser, srv.porta, VA, VB, `A sinistra (${VA} vs ${VB})`);
  const B = await passata(browser, srv.porta, VB, VA, `A destra (${VB} vs ${VA})`);
  await browser.close(); srv.chiudi();

  const err = [...A.errori, ...B.errori];
  if (err.length) { console.error('ECCEZIONI IN PAGINA:'); for (const e of err.slice(0, 5)) console.error('   ' + e); }

  /* gol SUBITI dal portiere con l'attributo A e da quello con B.
     Nella passata A il portiere con VA difende la porta 0, quindi
     subisce i gol della squadra 1; nella passata B i ruoli si scambiano. */
  const subitiA = [], subitiB = [], parA = [], parB = [], specA = [], specB = [];
  for (const r of A.out) { subitiA.push(r.gol1); subitiB.push(r.gol0); parA.push(r.par0); parB.push(r.par1); specA.push(r.spec1); specB.push(r.spec0); }
  for (const r of B.out) { subitiB.push(r.gol1); subitiA.push(r.gol0); parB.push(r.par0); parA.push(r.par1); specB.push(r.spec1); specA.push(r.spec0); }

  const sinA = A.out.map(r => r.gol1), desA = B.out.map(r => r.gol0);
  const stampa = (t, a) => `${t}  ${media(a).toFixed(3)}  (sigma ${sigma(a).toFixed(2)}, n=${a.length})`;
  console.log('');
  console.log('  ' + stampa(`gol SUBITI dal portiere con ${CAMPO}=${VA}: `, subitiA));
  console.log('  ' + stampa(`gol SUBITI dal portiere con ${CAMPO}=${VB}: `, subitiB));
  const d = media(subitiA) - media(subitiB);
  const es = Math.sqrt(sigma(subitiA) ** 2 / subitiA.length + sigma(subitiB) ** 2 / subitiB.length);
  console.log(`  DIFFERENZA (scarso - bravo): ${d >= 0 ? '+' : ''}${d.toFixed(3)}  errore standard ${es.toFixed(3)}  ->  ${Math.abs(d / Math.max(1e-9, es)).toFixed(1)} sigma`);
  console.log('');
  console.log('  ' + stampa(`PARATE del portiere con ${CAMPO}=${VA}:    `, parA));
  console.log('  ' + stampa(`PARATE del portiere con ${CAMPO}=${VB}:    `, parB));
  /* =====================================================================
     LA MISURA A BASSA VARIANZA: QUANTI DEI PALLONI CHE ARRIVANO ALLA
     PORTA FINISCONO IN RETE.
     I gol per partita sono rari (meno di uno) e chiassosi: con 200
     campioni l'errore standard vale 0,08 gol, cioe' quasi quanto
     l'effetto che si cerca. Ma un portiere non decide QUANTI palloni
     gli arrivano: decide quanti ne passano. Il denominatore giusto e'
     gol + parate — i due contatori che si accendono TUTTI E DUE alla
     fine della corsa del pallone verso la sua porta, uno in addGoal e
     l'altro in tentaPresa — e il rapporto ha sotto centinaia di
     campioni invece di duecento.
     NON si usa G.stats.inPorta: quel contatore mescola l'INTENZIONE
     (fireShot lo alza quando la mira sta dentro il palo, :11420) con
     l'ESITO (tentaPresa lo alza quando il portiere tocca, :13820), ed
     e' proprio la differenza che il tabellino chiama «precisione
     tabellino» contro «precisione VERA».
     L'errore e' quello binomiale sul totale. */
  const somma = a => a.reduce((s, x) => s + x, 0);
  const gA = somma(subitiA), tA = gA + somma(parA), gB = somma(subitiB), tB = gB + somma(parB);
  const pA = tA ? gA / tA : 0, pB = tB ? gB / tB : 0;
  const esP = Math.sqrt((pA * (1 - pA)) / Math.max(1, tA) + (pB * (1 - pB)) / Math.max(1, tB));
  console.log('');
  console.log(`  su 100 palloni arrivati alla porta, quanti in rete — ${CAMPO}=${VA}:  ${(pA * 100).toFixed(1)}   (${gA} su ${tA})`);
  console.log(`  su 100 palloni arrivati alla porta, quanti in rete — ${CAMPO}=${VB}:  ${(pB * 100).toFixed(1)}   (${gB} su ${tB})`);
  console.log(`  DIFFERENZA (scarso - bravo): ${(pA - pB) >= 0 ? '+' : ''}${((pA - pB) * 100).toFixed(1)} punti  errore standard ${(esP * 100).toFixed(1)}  ->  ${Math.abs((pA - pB) / Math.max(1e-9, esP)).toFixed(1)} sigma`);

  console.log('');
  const tot = {};
  for (const r of [...A.out, ...B.out]) for (const k in r.esiti) tot[k] = (tot[k] | 0) + r.esiti[k];
  const n2 = A.out.length + B.out.length;
  const esitiPar = ['PRESA!', 'RESPINTA!', 'PUGNI!', 'SFUGGE!'];
  console.log('  i QUATTRO ESITI della parata, per partita (su ' + n2 + ' partite):');
  for (const k of esitiPar) console.log('    ' + k.padEnd(12) + ((tot[k] | 0) / n2).toFixed(3));
  console.log('');
  console.log('  controllo di sbilanciamento del banco (STESSO attributo, due porte):');
  console.log(`    porta 0 con ${VA}: ${media(sinA).toFixed(3)}     porta 1 con ${VA}: ${media(desA).toFixed(3)}`);
  console.log('');
  console.log('  Se la differenza sta sotto 1 sigma, i due numeri sono etichette morte.');
})();
