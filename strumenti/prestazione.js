/* =====================================================================
   PRESTAZIONE — il cancello che impedisce di fare un gioco bello che scatta.

   Stiamo per aggiungere cicli di corsa, deformazioni, particelle, fermi
   d'impatto: ogni cosa costa millisecondi. "Deve restare fluido su un
   telefono di fascia media" e' una speranza finche' nessuno la misura.
   Qui il computer viene rallentato apposta, si gioca una partita vera e
   si contano i millisecondi per fotogramma. Sopra la soglia, il lavoro
   non passa.

   ATTENZIONE, e' costato un errore evitato per un pelo: qui il browser
   disegna SENZA SCHEDA GRAFICA, in software. Senza alcun freno il banco
   segna gia' 26 ms per fotogramma, cioe' 39 al secondo. Un cancello in
   millisecondi assoluti misurerebbe la lentezza del banco, non il costo
   del gioco, e manderebbe chi lavora a rincorrere un fantasma.
   Per questo il cancello e' RELATIVO: si misura una volta il costo di
   oggi (--fissa), lo si conserva, e da li' in avanti si controlla che il
   lavoro nuovo non lo faccia crescere oltre una percentuale. Il confronto
   fra due misure sullo stesso banco e' onesto anche se il banco e' lento.

   SECONDA AVVERTENZA, segnalata da un critico e vera: senza --freno la
   CPU NON viene rallentata affatto, e a sessanta fotogrammi al secondo il
   numero che si legge e' il tetto del vsync, non il costo del gioco. Il
   confronto relativo resta onesto — stesso tetto prima e dopo — ma per
   vedere il costo VERO, e quanto margine c'e', va tirato il freno:
   --freno 2 o 4. Li' il tetto sparisce e si misura il lavoro.

   TERZA AVVERTENZA, pagata con un cancello rosso che accusava un innocente:
   UNA sola finestra di misura non distingue il gioco lento dal BANCO
   occupato. Un altro processo che ruba la CPU per qualche secondo fa
   saltare la mediana di un gradino intero di vsync (16,7 -> 33,3 ms, +99%)
   e il cancello incolpa il gioco di un costo che non ha: e' successo,
   stesso file al bit, rosso sotto carico e verde a banco libero. Per
   questo si misurano TRE finestre e per ogni voce si tiene la MEDIANA
   delle tre. Un rallentamento vero del gioco le alza tutte e tre — il
   cancello sa ancora fallire — mentre un colpo di carico del banco ne
   sporca una sola, e quella viene scartata.

   uso:  node strumenti/prestazione.js --fissa     misura e conserva il riferimento
         node strumenti/prestazione.js             confronta con il riferimento
         node strumenti/prestazione.js --freno 4   il costo vero, senza tetto
         node strumenti/prestazione.js --tolleranza 30
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
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const RIFERIMENTO = path.join(__dirname, 'prestazione-base.json');

(async () => {
  const fissa = process.argv.includes('--fissa');
  const tolleranza = +arg('tolleranza', 25);   // per cento di crescita ammessa
  const freno = +arg('freno', 1);
  const sec = +arg('sec', 10);
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();

  const cdp = await ctx.newCDPSession(pag);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(600);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1); t.setCpuVsCpu(true);
  });
  await pag.waitForTimeout(1200);

  /* il freno si tira DOPO l'avvio: quello che ci interessa e' il costo
     del gioco a regime, non quello del caricamento */
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: freno });
  const FINESTRE = 3;   // terza avvertenza: la mediana di tre finestre scarta il colpo di carico
  console.log(`computer rallentato di ${freno} volte, ${FINESTRE} finestre da ${sec} secondi di partita\n`);

  const giri = [];
  for (let g = 0; g < FINESTRE; g++) {
    const tempi = await pag.evaluate(async (secondi) => {
      const t = [];
      let ultimo = performance.now();
      return await new Promise(fine => {
        const inizio = ultimo;
        function giro(ora) {
          t.push(ora - ultimo); ultimo = ora;
          if (ora - inizio < secondi * 1000) requestAnimationFrame(giro);
          else fine(t.slice(3));         // i primi giri sono sporchi
        }
        requestAnimationFrame(giro);
      });
    }, sec);
    if (!tempi.length) { console.error('nessun fotogramma misurato'); process.exit(1); }
    const ord = [...tempi].sort((a, b) => a - b);
    const perc = q => ord[Math.min(ord.length - 1, Math.floor(ord.length * q))];
    const media = tempi.reduce((a, b) => a + b, 0) / tempi.length;
    const lenti = tempi.filter(x => x > 33.3).length;   // due fotogrammi persi
    giri.push({ n: tempi.length, media, meta: perc(0.5), p95: perc(0.95), max: ord[ord.length - 1], lenti });
    console.log(`  finestra ${g + 1}: ${String(tempi.length).padStart(3)} fotogrammi — media ${media.toFixed(1)} ms, meta' ${perc(0.5).toFixed(1)}, p95 ${perc(0.95).toFixed(1)}, peggiore ${ord[ord.length - 1].toFixed(1)}, saltati ${lenti} (${(lenti / tempi.length * 100).toFixed(1)}%)`);
  }

  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await ctx.close(); await browser.close(); srv.chiudi();

  /* per ogni voce, la mediana delle finestre: con tre valori e' il centrale */
  const centrale = a => [...a].sort((x, y) => x - y)[(a.length - 1) >> 1];
  const media = centrale(giri.map(g => g.media));
  const meta = centrale(giri.map(g => g.meta));
  const p95 = centrale(giri.map(g => g.p95));

  console.log(`\n  mediana delle finestre`);
  console.log(`  media                 ${media.toFixed(1)} ms   (${(1000 / media).toFixed(0)} al secondo)`);
  console.log(`  meta' sotto           ${meta.toFixed(1)} ms`);
  console.log(`  novantacinque su cento sotto ${p95.toFixed(1)} ms\n`);

  const ora = { media: +media.toFixed(2), meta: +meta.toFixed(2), p95: +p95.toFixed(2), freno, quando: sec };

  if (fissa) {
    fs.writeFileSync(RIFERIMENTO, JSON.stringify(ora, null, 1));
    console.log(`riferimento conservato in strumenti/prestazione-base.json`);
    console.log(`d'ora in poi il costo non deve crescere piu' del ${tolleranza}% rispetto a questo.`);
    return;
  }

  if (!fs.existsSync(RIFERIMENTO)) {
    console.log('nessun riferimento: eseguire prima  node strumenti/prestazione.js --fissa');
    process.exit(1);
  }
  const base = JSON.parse(fs.readFileSync(RIFERIMENTO, 'utf8'));
  const cresce = v => ((v.ora - v.base) / v.base * 100);
  const voci = [
    { nome: 'fotogramma medio', base: base.media, ora: ora.media },
    { nome: 'meta\' sotto', base: base.meta, ora: ora.meta },
    { nome: 'il 95 per cento sotto', base: base.p95, ora: ora.p95 },
  ];
  console.log(`riferimento del ${base.freno === freno ? 'banco identico' : 'ATTENZIONE: freno diverso'}\n`);
  let male = 0;
  for (const v of voci) {
    const d = cresce(v);
    const ok = d <= tolleranza;
    if (!ok) male++;
    console.log((ok ? '  OK   ' : '  NO   ') +
      `${v.nome}: ${v.base} -> ${v.ora} ms  (${d >= 0 ? '+' : ''}${d.toFixed(1)}%, ammesso +${tolleranza}%)`);
  }
  console.log(`\n${voci.length} confronti, ${voci.length - male} passati, ${male} falliti`);
  if (male) { console.log('\nUn gioco che scatta non e\' un gioco da vetrina, per quanto sia bello fermo.'); process.exit(1); }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
