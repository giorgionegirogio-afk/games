/* =====================================================================
   _151-peso-atlante.js — QUANTO COSTA L'ATLAS (voce #151, compito 2)

   Misura il prototipo degli sprite su tutte le grandezze che decidono, e
   le decide il criterio di rinuncia della spec (sezione 6), scritto prima
   di vedere un numero:

     1. PESO      l'atlante in base64 non deve passare i 700 kB, cioe' il
                  25% del file di oggi. Il prototipo e' 2 clip su 25: a
                  700 kB la copertura piena passa gli 8 MB e «un file
                  solo» diventa una bugia.
     2. MEMORIA   la texture a runtime non deve passare i 24 MB.
     3. DECODIFICA quanto costa aprirla su una macchina lenta.

   E LE MISURA NEL CASO PIU' FAVOREVOLE ALL'ATLAS, non nel piu' comodo
   per chi lo boccia. Tre forme dello stesso foglio:
     · COM'E'     truecolor RGBA, come esce da Blender;
     · RITAGLIATO la cella stretta sul riquadro davvero occupato (il
                  render dichiara quale: sprecare aria e' un difetto del
                  prototipo, non dell'idea);
     · INDICIZZATO se i colori distinti stanno in una tavolozza, il PNG a
                  indici e' il piu' piccolo che quel disegno possa dare.
   Se la forma migliore non passa, non passa nessuna.

   LA DECODIFICA SI MISURA IN CHROME, col freno. Il tempo di
   Image.decode() su un desktop non dice niente su una WebView vecchia: si
   tira Emulation.setCPUThrottlingRate a 1, 4 e 6 e si dichiara il profilo
   accanto al numero. Tre ripetizioni per punto, e si stampa la
   dispersione: un numero con la dispersione fuori soglia non si
   trascrive da nessuna parte.

   LA COPERTURA PIENA non si stima a occhio: si calcola dal foglio vero.
   25 clip invece di 2, 3 corporature invece di 1. Il numero che ne esce e'
   quello che il committente deve vedere.

   uso:
     node strumenti/_151-peso-atlante.js
     node strumenti/_151-peso-atlante.js --png fuori/151-atlante.png
     node strumenti/_151-peso-atlante.js --senza-chrome
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const http = require('http');

const RADICE = path.resolve(__dirname, '..');
function arg(nome, pre) {
  const i = process.argv.indexOf('--' + nome);
  return (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--'))
    ? process.argv[i + 1] : pre;
}
const PNG = path.resolve(RADICE, arg('png', 'fuori/151-atlante.png'));
const META = path.resolve(RADICE, arg('meta', 'fuori/151-atlante.json'));
const SENZA_CHROME = process.argv.includes('--senza-chrome');
/* il file del gioco, per dire i pesi in frazione di quello che c'e' gia' */
const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');
/* le soglie della spec, sezione 6. Stanno QUI e in chiaro perche' un
   criterio di rinuncia che vive solo in un documento non ferma nessuno. */
const TETTO_BASE64 = 700 * 1024;
const TETTO_MEMORIA = 24 * 1024 * 1024;
/* quante clip ha il gioco (CLIPS, riga 7415) e quante corporature (CORPI,
   riga 5199): si contano nel gioco, non si ricordano */
function coperturaDalGioco() {
  const t = fs.readFileSync(GIOCO, 'utf8');
  const blocco = t.slice(t.indexOf('const CLIPS={'));
  const fine = blocco.indexOf('\n};');
  const clip = (blocco.slice(0, fine).match(/^\s{2}\w+:\s*\{freq:/gm) || []).length;
  const corpi = (t.match(/\/\* \d [a-z]+\s*\*\/ \{g:/g) || []).length + 1;
  return { clip: clip, corpi: corpi };
}

/* ------------------------------------------------ PNG: leggere e scrivere */
function decodifica(buf) {
  let i = 8, idat = [], w = 0, h = 0;
  while (i < buf.length) {
    const ln = buf.readUInt32BE(i), tipo = buf.toString('latin1', i + 4, i + 8);
    if (tipo === 'IHDR') { w = buf.readUInt32BE(i + 8); h = buf.readUInt32BE(i + 12); }
    if (tipo === 'IDAT') idat.push(buf.subarray(i + 8, i + 8 + ln));
    i += 12 + ln;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const passo = w * 4, out = Buffer.alloc(h * passo);
  let prev = Buffer.alloc(passo), pos = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[pos++];
    const riga = Buffer.from(raw.subarray(pos, pos + passo)); pos += passo;
    for (let x = 0; x < passo; x++) {
      const a = x >= 4 ? riga[x - 4] : 0, b = prev[x], c = x >= 4 ? prev[x - 4] : 0;
      let add = 0;
      if (f === 1) add = a; else if (f === 2) add = b;
      else if (f === 3) add = (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        add = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      riga[x] = (riga[x] + add) & 255;
    }
    riga.copy(out, y * passo); prev = riga;
  }
  return { w: w, h: h, dati: out };
}

function crc32(buf) {
  let c, tab = crc32.tab;
  if (!tab) {
    tab = crc32.tab = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      tab[n] = c;
    }
  }
  c = -1;
  for (let i = 0; i < buf.length; i++) c = tab[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(tipo, dati) {
  const t = Buffer.from(tipo, 'latin1');
  const l = Buffer.alloc(4); l.writeUInt32BE(dati.length);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, dati])));
  return Buffer.concat([l, t, dati, c]);
}
/* il filtro PNG «su»/«Paeth» scelto riga per riga col criterio della somma
   dei valori assoluti: e' quello che usa libpng, e senza di lui il
   confronto fra le tre forme misurerebbe la compressione e non il disegno */
function comprimi(righeGrezze) {
  return zlib.deflateSync(Buffer.concat(righeGrezze), { level: 9 });
}
function filtra(dati, w, h, bpp) {
  const passo = w * bpp, fuori = [];
  let prev = Buffer.alloc(passo);
  for (let y = 0; y < h; y++) {
    const riga = dati.subarray(y * passo, (y + 1) * passo);
    let miglior = null, migliorCosto = Infinity, migliorTipo = 0;
    for (let f = 0; f <= 4; f++) {
      const o = Buffer.alloc(passo);
      let costo = 0;
      for (let x = 0; x < passo; x++) {
        const a = x >= bpp ? riga[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
        let sub = 0;
        if (f === 1) sub = a; else if (f === 2) sub = b;
        else if (f === 3) sub = (a + b) >> 1;
        else if (f === 4) {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          sub = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        }
        o[x] = (riga[x] - sub) & 255;
        costo += o[x] < 128 ? o[x] : 256 - o[x];
      }
      if (costo < migliorCosto) { migliorCosto = costo; miglior = o; migliorTipo = f; }
    }
    fuori.push(Buffer.concat([Buffer.from([migliorTipo]), miglior]));
    prev = riga;
  }
  return fuori;
}
function scriviRGBA(w, h, dati) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
                        chunk('IHDR', ihdr), chunk('IDAT', comprimi(filtra(dati, w, h, 4))),
                        chunk('IEND', Buffer.alloc(0))]).length;
}
function scriviIndicizzato(w, h, indici, tavolozza) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 3; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const plte = Buffer.alloc(tavolozza.length * 3);
  const trns = Buffer.alloc(tavolozza.length);
  tavolozza.forEach((c, i) => {
    plte[i * 3] = c[0]; plte[i * 3 + 1] = c[1]; plte[i * 3 + 2] = c[2]; trns[i] = c[3];
  });
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
                        chunk('IHDR', ihdr), chunk('PLTE', plte), chunk('tRNS', trns),
                        chunk('IDAT', comprimi(filtra(indici, w, h, 1))),
                        chunk('IEND', Buffer.alloc(0))]).length;
}

/* ------------------------------------------------------------------ Chrome */
function servi(file) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      if (req.url.startsWith('/atlante.png')) {
        const b = fs.readFileSync(file);
        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store', 'Content-Length': b.length });
        res.end(b); return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('<!doctype html><meta charset="utf-8"><title>peso</title><body></body>');
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

async function inChrome(file, W, H) {
  const { chromium } = require('playwright');
  const srv = await servi(file);
  const browser = await chromium.launch();
  const fuori = [];
  try {
    for (const freno of [1, 4, 6]) {
      const ctx = await browser.newContext({
        viewport: { width: 915, height: 412 }, deviceScaleFactor: 2,
        isMobile: true, hasTouch: true, locale: 'it-IT',
      });
      const pag = await ctx.newPage();
      const cdp = await ctx.newCDPSession(pag);
      await pag.goto('http://127.0.0.1:' + srv.porta + '/', { waitUntil: 'load' });
      if (freno > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: freno });
      const r = await pag.evaluate(async ([porta, W, H]) => {
        const tempi = [], disegni = [];
        for (let k = 0; k < 3; k++) {
          const im = new Image();
          im.src = 'http://127.0.0.1:' + porta + '/atlante.png?k=' + k;
          await new Promise(r2 => { im.onload = r2; im.onerror = r2; });
          const t0 = performance.now();
          await im.decode();
          tempi.push(performance.now() - t0);
          /* il costo VERO di un fotogramma: ventidue figure, una blit
             ciascuna dalla cella giusta. E' quello che il gioco farebbe. */
          const c = document.createElement('canvas');
          c.width = 915 * 2; c.height = 412 * 2;
          const g = c.getContext('2d');
          const t1 = performance.now();
          for (let f = 0; f < 22; f++) {
            const sx = (f % 12) * 128, sy = ((f * 7) % 16) * 128;
            g.drawImage(im, sx, sy, 128, 128, (f * 71) % 1600, (f * 53) % 700, 128, 128);
          }
          disegni.push(performance.now() - t1);
        }
        return { tempi: tempi, disegni: disegni,
                 memoria: (performance.memory && performance.memory.usedJSHeapSize) || 0 };
      }, [srv.porta, W, H]);
      if (freno > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      await ctx.close();
      fuori.push({ freno: freno, tempi: r.tempi, disegni: r.disegni });
    }
  } finally { await browser.close(); srv.chiudi(); }
  return fuori;
}

/* --------------------------------------------------------------- la corsa */
function mediana(v) { const s = v.slice().sort((a, b) => a - b); return s[s.length >> 1]; }
function disp(v) { return (Math.max(...v) - Math.min(...v)) / Math.max(1e-9, mediana(v)); }
function kB(n) { return (n / 1024).toFixed(1) + ' kB'; }
function MB(n) { return (n / 1048576).toFixed(2) + ' MB'; }

(async function () {
  if (!fs.existsSync(PNG)) {
    console.log('PROVA NULLA: l\'atlante non c\'e\'. Prima:');
    console.log('  blender --background --factory-startup --python strumenti/blender/atlante.py -- \\');
    console.log('          --png fuori/151-atlante.png --json fuori/151-atlante.json');
    process.exit(3);
  }
  const buf = fs.readFileSync(PNG);
  const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {};
  const im = decodifica(buf);
  const pesoGioco = fs.statSync(GIOCO).size;
  const cop = coperturaDalGioco();

  console.log('=== _151-peso-atlante — quanto costa il prototipo degli sprite ===\n');
  console.log('  IL FOGLIO: ' + im.w + '×' + im.h + ' px, ' + (meta.celle || '?') + ' celle di ' +
              (meta.cella || '?') + ', ' + (meta.clip ? meta.clip.map(c => c.nome).join(' + ') : '?') +
              ', ' + (meta.direzioni || '?') + ' direzioni × ' + (meta.fotogrammi || '?') + ' fotogrammi,');
  console.log('             UNA figura e UNA divisa — il caso piu\' favorevole all\'atlas.\n');

  /* --- 1. le tre forme -------------------------------------------------- */
  const b64 = Math.ceil(buf.length / 3) * 4;
  console.log('  1. IL PESO, nelle tre forme');
  console.log('     · com\'e\' (RGBA truecolor) .... PNG ' + kB(buf.length) +
              '  ·  base64 ' + kB(b64) + '  (' + (100 * b64 / pesoGioco).toFixed(0) +
              '% del gioco di oggi, ' + MB(pesoGioco) + ')');

  /* ritagliato sul riquadro vero */
  let ritPeso = 0, rw = 0, rh = 0;
  if (meta.riquadro_occupato && meta.cella) {
    const [x0, y0, x1, y1] = meta.riquadro_occupato;
    rw = x1 - x0; rh = y1 - y0;
    const cel = meta.cella, cols = im.w / cel, rows = im.h / cel;
    const W2 = cols * rw, H2 = rows * rh;
    const d2 = Buffer.alloc(W2 * H2 * 4);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
      for (let y = 0; y < rh; y++) {
        const src = ((r * cel + y0 + y) * im.w + c * cel + x0) * 4;
        im.dati.copy(d2, ((r * rh + y) * W2 + c * rw) * 4, src, src + rw * 4);
      }
    ritPeso = scriviRGBA(W2, H2, d2);
    console.log('     · ritagliato (' + rw + '×' + rh + ') ....... PNG ' + kB(ritPeso) +
                '  ·  base64 ' + kB(Math.ceil(ritPeso / 3) * 4) +
                '   memoria ' + MB(W2 * H2 * 4));
  }

  /* indicizzato, se i colori ci stanno */
  const visti = new Map();
  for (let i = 0; i < im.dati.length; i += 4) {
    const k = im.dati.readUInt32BE(i);
    if (!visti.has(k)) visti.set(k, visti.size);
    if (visti.size > 4096) break;
  }
  let indPeso = 0;
  if (visti.size <= 256) {
    const tav = []; visti.forEach((v, k) => { tav[v] = [(k >>> 24) & 255, (k >>> 16) & 255, (k >>> 8) & 255, k & 255]; });
    const idx = Buffer.alloc(im.w * im.h);
    for (let i = 0, j = 0; i < im.dati.length; i += 4, j++) idx[j] = visti.get(im.dati.readUInt32BE(i));
    indPeso = scriviIndicizzato(im.w, im.h, idx, tav);
    console.log('     · indicizzato (' + visti.size + ' colori) ... PNG ' + kB(indPeso) +
                '  ·  base64 ' + kB(Math.ceil(indPeso / 3) * 4));
  } else {
    console.log('     · indicizzato ................ NO: ' + (visti.size > 4096 ? 'oltre 4096' : visti.size) +
                ' colori distinti, una tavolozza a 256 non li tiene');
    console.log('       (e non e\' un dettaglio: l\'ombreggiatura morbida che da\' il volume');
    console.log('        e\' fatta di gradazioni, cioe\' proprio di quello che una tavolozza non comprime)');
  }

  const migliore = Math.min(...[buf.length, ritPeso || Infinity, indPeso || Infinity]);
  const migliore64 = Math.ceil(migliore / 3) * 4;
  console.log('     LA FORMA MIGLIORE in base64: ' + kB(migliore64) + '  contro il tetto di ' +
              kB(TETTO_BASE64) + '  →  ' + (migliore64 <= TETTO_BASE64 ? 'PASSA' :
              'SFORA di ' + (migliore64 / TETTO_BASE64).toFixed(2) + ' volte'));

  /* --- 2. la memoria ---------------------------------------------------- */
  const mem = im.w * im.h * 4;
  console.log('\n  2. LA MEMORIA DI TEXTURE — non si comprime: e\' larghezza × altezza × 4');
  console.log('     · prototipo (2 clip, 1 corporatura, 1 divisa) ... ' + MB(mem) +
              '  contro il tetto di ' + MB(TETTO_MEMORIA) + '  →  ' +
              (mem <= TETTO_MEMORIA ? 'passa' : 'SFORA'));
  console.log('     · COPERTURA PIENA: il gioco ha ' + cop.clip + ' clip e ' + cop.corpi +
              ' corporature (contate nel gioco, non ricordate)');
  const pieno = mem * (cop.clip / 2) * cop.corpi;
  const pienoPng = buf.length * (cop.clip / 2) * cop.corpi;
  console.log('       memoria ' + MB(pieno) + ' (' + (pieno / TETTO_MEMORIA).toFixed(0) +
              ' volte il tetto)  ·  base64 nel file ' + MB(Math.ceil(pienoPng / 3) * 4) +
              ' (' + (Math.ceil(pienoPng / 3) * 4 / pesoGioco).toFixed(0) + ' volte il gioco intero)');
  console.log('     · e le DIVISE non sono in questo conto: nel gioco le squadre nascono');
  console.log('       generate, e uno sprite cuoce le cinque tinte del kit.');

  /* --- 3. Chrome -------------------------------------------------------- */
  if (SENZA_CHROME) { console.log('\n  3. DECODIFICA: saltata (--senza-chrome)'); }
  else {
    console.log('\n  3. LA DECODIFICA IN CHROME, col freno — profilo dichiarato:');
    console.log('     915×412 a 2 punti per pixel, isMobile, Emulation.setCPUThrottlingRate');
    const r = await inChrome(PNG, im.w, im.h);
    for (const p of r) {
      const dt = disp(p.tempi), dd = disp(p.disegni);
      console.log('     · freno ' + p.freno + '×  decodifica ' + mediana(p.tempi).toFixed(1) +
                  ' ms (dispersione ' + (dt * 100).toFixed(0) + '%)' +
                  '  ·  22 figure disegnate ' + mediana(p.disegni).toFixed(2) + ' ms' +
                  ' (dispersione ' + (dd * 100).toFixed(0) + '%)' +
                  (dt > 0.35 ? '   ← dispersione alta: il numero non si trascrive' : ''));
    }
    console.log('     (22 figure a 16,7 ms per fotogramma e\' il bilancio di un 60 fps)');
  }

  /* --- il verdetto dei due criteri ------------------------------------- */
  console.log('\n  === I DUE CRITERI DELLA SPEC, APPLICATI ===');
  const c1 = migliore64 <= TETTO_BASE64, c2 = mem <= TETTO_MEMORIA;
  console.log('     criterio 1 (peso, base64 ≤ ' + kB(TETTO_BASE64) + ') ..... ' +
              (c1 ? 'passato' : 'NON PASSATO: ' + kB(migliore64)));
  console.log('     criterio 2 (memoria ≤ ' + MB(TETTO_MEMORIA) + ') ......... ' +
              (c2 ? 'passato sul prototipo' : 'NON PASSATO: ' + MB(mem)) +
              (pieno > TETTO_MEMORIA ? '  — ma NON PASSATO a copertura piena: ' + MB(pieno) : ''));
  console.log('\n' + ((c1 && c2 && pieno <= TETTO_MEMORIA)
    ? '  L\'ATLAS STA NEL BUDGET.'
    : '  L\'ATLAS NON STA NEL BUDGET, e il criterio era scritto prima di misurarlo.'));
  process.exit(0);
})().catch(e => { console.error('BANCO ESPLOSO: ' + e.stack); process.exit(2); });
