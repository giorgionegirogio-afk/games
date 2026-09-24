/* =====================================================================
   _151-accanto.js — LE TRE VERSIONI A FIANCO (voce #151, compito 3)

   Confronta, fotogramma per fotogramma, le istantanee delle tre versioni:
     · il gioco di oggi (procedurale);
     · fuori/151-luce.html    (la terza via: le tabelle di Blender);
     · fuori/151-atlante.html (la prima via: gli sprite).

   NON GUIDA IL GIOCO DA SE', E LA PRIMA STESURA LO FACEVA — ed e' il
   motivo per cui questo blocco e' scritto. La prima stesura apriva le tre
   pagine, avviava la partita col suo seme e fotografava a 26 secondi:
   dava «differenza media 0,00, INERTE» su tutt'e tre, cioe' accusava le
   toppe di non fare niente. Non era vero. La schermata cadeva su un
   fotogramma in cui la camera era chiusa su un angolo di campo SENZA
   FIGURE, e tre quadri di solo prato sono identici qualunque cosa faccia
   il rig. Un banco che misura un fotogramma vuoto misura sempre zero, e
   uno zero cosi' e' peggio di nessun numero: accusa il lavoro giusto.
   LA CURA E' NON AVERE UN SECONDO BANCO. Le istantanee le sceglie gia'
   istantanea.js — otto istanti stratificati, dal seme, dentro una partita
   vera, con la garanzia misurata che siano otto campioni indipendenti — e
   qui si LEGGONO i suoi PNG invece di rifarne di peggiori.

   uso:
     node strumenti/istantanea.js --dir strumenti/_151-ist-base
     node strumenti/istantanea.js --gioco fuori/151-luce.html    --dir strumenti/_151-ist-luce
     node strumenti/istantanea.js --gioco fuori/151-atlante.html --dir strumenti/_151-ist-atl
     node strumenti/_151-accanto.js
     node strumenti/_151-accanto.js --istante 3 --ritaglio 570,265,270,150 --zoom 3
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return (i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) ? process.argv[i + 1] : d;
}
const DIRS = [
  ['oggi', path.join(RADICE, 'strumenti', '_151-ist-base')],
  ['luce', path.join(RADICE, 'strumenti', '_151-ist-luce')],
  ['atlante', path.join(RADICE, 'strumenti', '_151-ist-atl')],
];
const ISTANTE = String(arg('istante', '3')).padStart(2, '0');
const RIT = String(arg('ritaglio', '570,265,270,150')).split(',').map(Number);
const ZOOM = +arg('zoom', 3);
const FUORI = path.resolve(RADICE, arg('fuori', 'strumenti/_151-accanto'));
/* la soglia sotto la quale una toppa si dichiara INERTE. Non e' zero: due
   render della stessa pagina differiscono gia' di qualche centesimo per il
   rumore di rasterizzazione di Chromium (istantanea.js lo dichiara: 79
   pixel su un milione e mezzo). Mezzo livello di luminanza medio e' due
   ordini di grandezza sopra quel rumore e due sotto le differenze vere. */
const INERTE = 0.05;

/* ------------------------------------------------------------- PNG, letto */
function decodifica(buf) {
  let i = 8, idat = [], w = 0, h = 0, ct = 6;
  while (i < buf.length) {
    const ln = buf.readUInt32BE(i), tipo = buf.toString('latin1', i + 4, i + 8);
    if (tipo === 'IHDR') { w = buf.readUInt32BE(i + 8); h = buf.readUInt32BE(i + 12); ct = buf[i + 17]; }
    if (tipo === 'IDAT') idat.push(buf.subarray(i + 8, i + 8 + ln));
    i += 12 + ln;
  }
  const bpp = ct === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const passo = w * bpp, out = Buffer.alloc(h * passo);
  let prev = Buffer.alloc(passo), pos = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[pos++];
    const riga = Buffer.from(raw.subarray(pos, pos + passo)); pos += passo;
    for (let x = 0; x < passo; x++) {
      const a = x >= bpp ? riga[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
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
  if (bpp === 3) {
    const o = Buffer.alloc(w * h * 4);
    for (let k = 0; k < w * h; k++) { out.copy(o, k * 4, k * 3, k * 3 + 3); o[k * 4 + 3] = 255; }
    return { w: w, h: h, dati: o };
  }
  return { w: w, h: h, dati: out };
}
function chunk(tipo, dati) {
  const t = Buffer.from(tipo, 'latin1');
  const l = Buffer.alloc(4); l.writeUInt32BE(dati.length);
  const c = Buffer.alloc(4); c.writeUInt32BE(zlib.crc32 ? zlib.crc32(Buffer.concat([t, dati])) : crc32(Buffer.concat([t, dati])));
  return Buffer.concat([l, t, dati, c]);
}
function crc32(buf) {
  let tab = crc32.tab;
  if (!tab) {
    tab = crc32.tab = new Int32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tab[n] = c; }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = tab[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function scrivi(file, w, h, dati) {
  const ih = Buffer.alloc(13);
  ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  const righe = [];
  for (let y = 0; y < h; y++) righe.push(Buffer.concat([Buffer.from([0]), dati.subarray(y * w * 4, (y + 1) * w * 4)]));
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(Buffer.concat(righe), { level: 9 })),
    chunk('IEND', Buffer.alloc(0))]));
}

/* IL CONFRONTO SI FA DOVE CI SONO I CORPI, non su tutto il quadro.
   Le figure occupano il due-cinque per cento dei pixel: una media sul
   quadro intero divide per cinquanta qualunque cosa succeda addosso agli
   uomini, e fa sembrare «quasi niente» una riscrittura completa
   dell'ombreggiatura. La maschera e' la SILHOUETTE che istantanea.js
   produce gia' per ogni istante — lo stesso rig, la stessa clip, la
   stessa fase, ridipinto in nero — quindi non e' una stima: e' dove il
   gioco ha messo i corpi. Si stampano tutt'e due i numeri, perche' la
   media sul quadro e' quella che decide quanto si NOTA e la media sui
   corpi e' quella che dice quanto e' CAMBIATO. */
function scartoLuminanza(a, b, maschera) {
  if (a.w !== b.w || a.h !== b.h) return null;
  let s = 0, n = 0, q = 0, sc = 0, nc = 0;
  for (let i = 0; i < a.dati.length; i += 4) {
    const la = 0.2126 * a.dati[i] + 0.7152 * a.dati[i + 1] + 0.0722 * a.dati[i + 2];
    const lb = 0.2126 * b.dati[i] + 0.7152 * b.dati[i + 1] + 0.0722 * b.dati[i + 2];
    const d = Math.abs(la - lb); s += d; n++; if (d > 8) q++;
    if (maschera && maschera.dati[i] < 100) { sc += d; nc++; }
  }
  return { media: s / n, quota: 100 * q / n,
           corpi: nc ? sc / nc : 0, pixelCorpi: nc, fraz: 100 * nc / n };
}

/* LE TINTE DELLE DIVISE: quante famiglie di colore ci sono addosso alle
   figure. E' la misura che ha smascherato il difetto che istantanea non
   vede — con l'atlas le due squadre vestono uguale, perche' lo sprite
   cuoce il kit. Si contano i pixel saturi (che il prato non e') e si
   raggruppano per tinta a passo di venti gradi. */
function tinteDivisa(im, maschera) {
  const conta = new Map();
  for (let i = 0; i < im.dati.length; i += 4) {
    /* SOLO DOVE C'E' UN CORPO. Senza la maschera il conto pescava la
       folla oltre la rete, il tabellone e i pulsanti, e dava CINQUE
       famiglie all'atlas — che veste tutti uguale — contro le quattro
       del gioco. Un numero che sale quando la cosa misurata scompare non
       la sta misurando. */
    if (maschera && maschera.dati[i] >= 100) continue;
    const r = im.dati[i] / 255, g = im.dati[i + 1] / 255, b = im.dati[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx ? (mx - mn) / mx : 0;
    if (sat < 0.35 || mx < 0.30) continue;
    let h = 0;
    if (mx === mn) h = 0;
    else if (mx === r) h = 60 * (((g - b) / (mx - mn)) % 6);
    else if (mx === g) h = 60 * ((b - r) / (mx - mn) + 2);
    else h = 60 * ((r - g) / (mx - mn) + 4);
    if (h < 0) h += 360;
    /* il verde del manto (80-160 gradi) non e' una divisa */
    if (h > 78 && h < 165) continue;
    const k = Math.floor(h / 20) * 20;
    conta.set(k, (conta.get(k) || 0) + 1);
  }
  const tot = [...conta.values()].reduce((a, b) => a + b, 0) || 1;
  /* NON SI CONTANO LE COLONNE, SI CONTANO GLI ARCHI CONTIGUI, e la
     differenza e' tutto il punto. Un kit rosso cade su 340, 0, 20 e 40
     gradi perche' l'ombreggiatura lo sposta di qualche grado: contando le
     colonne fanno QUATTRO famiglie, e l'atlas — che veste tutti uguale —
     sembrava piu' vario del gioco. Contando gli archi ne fa UNO. Due
     divise diverse stanno su archi SEPARATI, e quello e' il fatto. */
  const vive = new Set([...conta.entries()].filter(([, v]) => v / tot >= 0.05).map(([k]) => k));
  const archi = [];
  for (const k of [...vive].sort((a, b) => a - b)) {
    const prec = (k - 20 + 360) % 360;
    const dove = archi.find(a => a.includes(prec));
    if (dove) dove.push(k); else archi.push([k]);
  }
  /* 340 e 0 sono adiacenti: si ricuce il giro */
  if (archi.length > 1) {
    const primo = archi[0], ultimo = archi[archi.length - 1];
    if (primo[0] === 0 && ultimo[ultimo.length - 1] === 340) {
      archi[archi.length - 1] = ultimo.concat(primo); archi.shift();
    }
  }
  return archi;
}

/* --------------------------------------------------------------- la corsa */
for (const [nome, d] of DIRS) {
  if (!fs.existsSync(path.join(d, 'istante-' + ISTANTE + '.png'))) {
    console.log('PROVA NULLA: manca ' + path.join(d, 'istante-' + ISTANTE + '.png'));
    console.log('  le tre corse di istantanea vanno fatte prima (vedi l\'uso in testa al file).');
    process.exit(3);
  }
}
fs.mkdirSync(FUORI, { recursive: true });
console.log('=== _151-accanto — le tre versioni sugli stessi otto istanti ===\n');

const quanti = fs.readdirSync(DIRS[0][1]).filter(f => /^istante-\d+\.png$/.test(f)).length;
const base = {};
console.log('  QUANTO CAMBIA IL QUADRO rispetto al gioco di oggi (luminanza 0-255, ' + quanti + ' istanti):');
let inerte = [];
for (const [nome, d] of DIRS.slice(1)) {
  const medie = [], quote = [], corpi = [], frazioni = [];
  for (let k = 1; k <= quanti; k++) {
    const n = String(k).padStart(2, '0');
    const a = decodifica(fs.readFileSync(path.join(DIRS[0][1], 'istante-' + n + '.png')));
    const b = decodifica(fs.readFileSync(path.join(d, 'istante-' + n + '.png')));
    const sil = path.join(DIRS[0][1], 'silhouette-' + n + '.png');
    const m = fs.existsSync(sil) ? decodifica(fs.readFileSync(sil)) : null;
    const s = scartoLuminanza(a, b, m);
    if (s) { medie.push(s.media); quote.push(s.quota); corpi.push(s.corpi); frazioni.push(s.fraz); }
  }
  const m = medie.reduce((a, b) => a + b, 0) / medie.length;
  const q = quote.reduce((a, b) => a + b, 0) / quote.length;
  const mc = corpi.reduce((a, b) => a + b, 0) / corpi.length;
  const fr = frazioni.reduce((a, b) => a + b, 0) / frazioni.length;
  console.log('    · ' + nome.padEnd(8) + ' sul QUADRO ' + m.toFixed(2) +
              ' (da ' + Math.min.apply(null, medie).toFixed(2) + ' a ' + Math.max.apply(null, medie).toFixed(2) +
              '), quadro cambiato di oltre otto livelli ' + q.toFixed(1) + '%');
  console.log('               SUI CORPI  ' + mc.toFixed(2) +
              '   (i corpi sono il ' + fr.toFixed(1) + '% del quadro: e\' li\' che si e\' lavorato)');
  if (m < INERTE) { console.log('      ← INERTE: la toppa non ha cambiato niente'); inerte.push(nome); }
}

console.log('\n  LE FAMIGLIE DI TINTA ADDOSSO ALLE FIGURE — quante divise si distinguono');
console.log('  (istante ' + ISTANTE + '; il verde del manto e i pixel poco saturi non contano)');
for (const [nome, d] of DIRS) {
  const im = decodifica(fs.readFileSync(path.join(d, 'istante-' + ISTANTE + '.png')));
  const sil = path.join(d, 'silhouette-' + ISTANTE + '.png');
  const t = tinteDivisa(im, fs.existsSync(sil) ? decodifica(fs.readFileSync(sil)) : null);
  console.log('    · ' + nome.padEnd(8) + t.length + (t.length === 1 ? ' arco:   ' : ' archi:  ') +
              t.map(a => '[' + a.map(h => h + '°').join(' ') + ']').join('  ') +
              (t.length < 2 ? '   ← UNO SOLO: le due squadre vestono uguale' : ''));
}

/* il ritaglio a fianco, che e' la prova che si guarda */
const [x0, y0, ww, hh] = RIT;
const pezzi = DIRS.map(([nome, d]) => {
  const im = decodifica(fs.readFileSync(path.join(d, 'istante-' + ISTANTE + '.png')));
  const W = ww * ZOOM, H = hh * ZOOM, o = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const sx = x0 + (x / ZOOM | 0), sy = y0 + (y / ZOOM | 0);
    if (sx < im.w && sy < im.h) im.dati.copy(o, (y * W + x) * 4, (sy * im.w + sx) * 4, (sy * im.w + sx) * 4 + 4);
  }
  return { nome: nome, w: W, h: H, dati: o };
});
const W = pezzi.reduce((a, p) => a + p.w, 0) + 8 * (pezzi.length - 1);
const H = Math.max(...pezzi.map(p => p.h));
const tela = Buffer.alloc(W * H * 4, 0);
for (let i = 3; i < tela.length; i += 4) tela[i] = 255;
let ox = 0;
for (const p of pezzi) {
  for (let y = 0; y < p.h; y++) p.dati.copy(tela, (y * W + ox) * 4, y * p.w * 4, (y + 1) * p.w * 4);
  ox += p.w + 8;
}
const file = path.join(FUORI, 'accanto-' + ISTANTE + '.png');
scrivi(file, W, H, tela);
console.log('\n  IL RITAGLIO A FIANCO (oggi · luce · atlante), zoom ' + ZOOM + 'x:');
console.log('    ' + path.relative(RADICE, file));
process.exit(inerte.length === DIRS.length - 1 ? 3 : 0);
