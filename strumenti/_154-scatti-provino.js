/* =====================================================================
   _154-scatti-provino.js — le prove che IL PROVINO funziona, rigenerate.

   PERCHE' ESISTE: provino.html e' una pagina che un essere umano apre e
   guarda; per mandarne conto a chi non la apre servono immagini, e le
   immagini NON si committano — si rigenerano (vedi il commit «Il
   ritaglio prima-dopo si rigenera, quindi non si committa»). Questo
   script e' quel generatore: apre il provino con Playwright, gli chiede
   da window.__provino le misure che la pagina dichiara, e salva gli
   scatti in strumenti/_154-prove/.

   NON E' UN CANCELLO e non entra in batteria: non ha una soglia, non
   boccia niente. Stampa le misure e le immagini, e il giudizio resta
   all'uomo — che e' precisamente il punto del provino.

   Uso (col server acceso: python -m http.server 8777 --bind 127.0.0.1):
     node strumenti/_154-scatti-provino.js
     node strumenti/_154-scatti-provino.js --porta 8777

   Uscita: 0 se la pagina si e' agganciata e ha scattato tutto,
           2 se il banco non e' riuscito ad aprirla (non accusa il gioco).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const arg = process.argv.slice(2);
const PORTA = (() => { const i = arg.indexOf('--porta'); return i >= 0 ? arg[i + 1] : '8777'; })();
const RADICE = path.resolve(__dirname, '..');
const FUORI = path.join(__dirname, '_154-prove');

/* le viste da fotografare, con lo stato che le mette nella posa che
   risponde alla domanda: non una fase a caso (un provino a fase casuale
   misura il fotogramma di passaggio, non il gesto) */
const SCATTI = [
  ['figura',    { vista:'figura', clip:'tiro',   u:0.340, h:520, via:false, lod:'auto' }],
  ['scale',     { vista:'scale',  clip:'corsa',  u:0.320, via:false }],
  ['lod',       { vista:'lod',    clip:'fermo',  u:0.200, h:420, via:false }],
  ['lod-corsa', { vista:'lod',    clip:'corsa',  u:0.320, h:420, via:false }],
  ['statura',   { vista:'statura',clip:'fermo',  u:0.200, h:460, via:false }],
  ['piede',     { vista:'piede',  via:false }],
  ['corsa',     { vista:'corsa',  clip:'corsa',  u:0.320, h:420, via:false }],
  ['fasi',      { vista:'fasi',   clip:'tuffo',  via:false }],
  ['portiere',  { vista:'figura', clip:'tuffo',  u:0.420, h:460, ruolo:'gk', via:false }],
];

/* i due fogli interi: non il ritaglio della finestra ma LA TELA, che e'
   cio' che il bottone «salva PNG» della pagina produce */
const FOGLI = [
  ['foglio-a-contatto', { vista:'foglio', u:0.300, via:false, ruolo:'campo', kit:0, corp:1 }],
  ['fasi-rovesciata',   { vista:'fasi', clip:'rovesciata', u:0.300, via:false, ruolo:'campo' }],
];

(async () => {
  if (!fs.existsSync(FUORI)) fs.mkdirSync(FUORI, { recursive: true });
  let b;
  try {
    b = await chromium.launch();
  } catch (e) {
    console.log('[154] BANCO: playwright non parte: ' + e.message);
    process.exit(2);
  }
  const ctx = await b.newContext({ viewport: { width: 1500, height: 920 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const guai = [];
  pg.on('pageerror', e => guai.push('errore di pagina: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') guai.push('console: ' + m.text().slice(0, 300)); });

  try {
    await pg.goto('http://127.0.0.1:' + PORTA + '/strumenti/provino.html');
    await pg.waitForFunction('window.__provino && window.__provino.pronto', { timeout: 45000 });
  } catch (e) {
    console.log('[154] BANCO: il provino non si e\' agganciato (server acceso su '
              + PORTA + '?): ' + e.message);
    await b.close();
    process.exit(2);
  }

  /* LE MISURE CHE LA PAGINA DICHIARA, stampate qui perche' un numero
     mostrato a schermo e mai riletto e' un numero di cui nessuno
     risponde */
  const clip = await pg.evaluate(() => window.__provino.clip());
  const cost = await pg.evaluate(() => window.__provino.costanti());
  const sog  = await pg.evaluate(() => window.__provino.soglia());
  const pie  = await pg.evaluate(() => window.__provino.piede());
  const cor  = await pg.evaluate(() => window.__provino.corsa());
  const sta  = await pg.evaluate(() => window.__provino.statura(360));

  console.log('[154] clip trovate: ' + clip.length);
  console.log('[154] ' + clip.join(' '));
  console.log('[154] costanti: ' + JSON.stringify(cost));
  console.log('[154] soglia del dettaglio MISURATA: ' + sog.soglia + ' px'
            + ' (salto ' + sog.salto + ' pixel, secondo salto ' + sog.secondo + ')'
            + (sog.soglia === cost.LOD ? '  = dichiarata' : '  DIVERSA dalla dichiarata ' + cost.LOD));
  console.log('[154] piede che arma: '
            + pie.map(t => t.clip + '=' + t.arma + '(zR ' + t.zR + ' vs zL ' + t.zL + ')').join('  '));
  console.log('[154] corsa: freq ' + cor.freq + ' · falcate '
            + cor.righe.map(r => r.falcata).join(' / '));
  console.log('[154] statura a schermo (360 px chiesti): '
            + sta.map(s => s.alt).join(' / ') + ' px');

  for (const [nome, st] of SCATTI) {
    await pg.evaluate(q => window.__provino.imposta(q), st);
    await pg.waitForTimeout(450);
    await pg.evaluate(() => window.__provino.disegna());
    await pg.screenshot({ path: path.join(FUORI, 'prova-' + nome + '.png') });
    console.log('[154] scatto ' + nome);
  }
  for (const [nome, st] of FOGLI) {
    await pg.evaluate(q => window.__provino.imposta(q), st);
    await pg.waitForTimeout(500);
    await pg.evaluate(() => window.__provino.disegna());
    const d = await pg.evaluate(() => document.getElementById('tela').toDataURL('image/png'));
    fs.writeFileSync(path.join(FUORI, nome + '.png'), Buffer.from(d.split(',')[1], 'base64'));
    console.log('[154] foglio ' + nome);
  }

  console.log('[154] errori di pagina: ' + (guai.length ? JSON.stringify(guai) : 'nessuno'));
  console.log('[154] immagini in ' + path.relative(RADICE, FUORI));
  await b.close();
  process.exit(guai.length ? 1 : 0);
})();
