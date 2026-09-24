/* =====================================================================
   _152-accanto.js — IL PRIMA E IL DOPO, A FIANCO (voce #152)

   Non misura niente: fa la PROVA CHE SI GUARDA. Ritaglia lo stesso
   riquadro dallo stesso istante di due corse di `istantanea.js` — quella
   del merge-base e quella di oggi — e le affianca ingrandite.

   PERCHE' GLI ISTANTI DI istantanea E NON UNO SCATTO NUOVO: e' la
   lezione che il #151 ha pagato e ha scritto. La sua prima stesura
   guidava il gioco da se' e fotografava a ventisei secondi: la
   schermata cadeva su un angolo di campo SENZA FIGURE, e tre quadri di
   solo prato sono identici qualunque cosa faccia il rig. Gli otto
   istanti li sceglie gia' istantanea, dentro una partita vera, con la
   garanzia misurata che siano otto campioni indipendenti.

   uso:
     node strumenti/istantanea.js --gioco <prima> --dir <cartellaPrima>
     node strumenti/istantanea.js --dir <cartellaDopo>
     node strumenti/_152-accanto.js --prima <cartellaPrima> --dopo <cartellaDopo>
                                    [--istante 5] [--ritaglio x,y,w,h] [--zoom 3]
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return (i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) ? process.argv[i + 1] : d; };
const PRIMA = path.resolve(arg('prima', 'istantanee-prima'));
const DOPO = path.resolve(arg('dopo', 'istantanee'));
const IST = String(arg('istante', '5')).padStart(2, '0');
const RIT = String(arg('ritaglio', '380,180,300,200')).split(',').map(Number);
const ZOOM = +arg('zoom', 3);
const FUORI = path.resolve(RADICE, arg('fuori', 'strumenti/_152-accanto'));

/* ------------------------------------------------------------- PNG letto */
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
    return { w, h, dati: o };
  }
  return { w, h, dati: out };
}
function crc32(buf) {
  let tab = crc32.tab;
  if (!tab) { tab = crc32.tab = new Int32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tab[n] = c; } }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = tab[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(tipo, dati) {
  const t = Buffer.from(tipo, 'latin1');
  const l = Buffer.alloc(4); l.writeUInt32BE(dati.length);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, dati])));
  return Buffer.concat([l, t, dati, c]);
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

/* ------------------------------------------------------------- la corsa */
const file = (d) => path.join(d, 'istante-' + IST + '.png');
for (const d of [PRIMA, DOPO]) {
  if (!fs.existsSync(file(d))) {
    console.log('PROVA NULLA: manca ' + file(d));
    console.log('  le due corse di istantanea vanno fatte prima (vedi l\'uso in testa al file).');
    process.exit(3);
  }
}
fs.mkdirSync(FUORI, { recursive: true });
const [x0, y0, ww, hh] = RIT;
const pezzi = [['prima', PRIMA], ['dopo', DOPO]].map(([nome, d]) => {
  const im = decodifica(fs.readFileSync(file(d)));
  const W = ww * ZOOM, H = hh * ZOOM, o = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const sx = x0 + ((x / ZOOM) | 0), sy = y0 + ((y / ZOOM) | 0);
    if (sx < im.w && sy < im.h) im.dati.copy(o, (y * W + x) * 4, (sy * im.w + sx) * 4, (sy * im.w + sx) * 4 + 4);
  }
  return { nome, w: W, h: H, dati: o, orig: [im.w, im.h] };
});
const W = pezzi[0].w + pezzi[1].w + 10, H = Math.max(pezzi[0].h, pezzi[1].h);
const tela = Buffer.alloc(W * H * 4, 0);
for (let i = 3; i < tela.length; i += 4) tela[i] = 255;
let ox = 0;
for (const p of pezzi) {
  for (let y = 0; y < p.h; y++) p.dati.copy(tela, (y * W + ox) * 4, y * p.w * 4, (y + 1) * p.w * 4);
  ox += p.w + 10;
}
const out = path.join(FUORI, 'accanto-' + IST + '.png');
scrivi(out, W, H, tela);
console.log('=== _152-accanto — il prima e il dopo, istante ' + IST + ' ===');
console.log('  quadro sorgente ' + pezzi[0].orig.join('x') + ', ritaglio ' + RIT.join(',') + ', zoom ' + ZOOM + 'x');
console.log('  a sinistra il merge-base, a destra il gioco di oggi:');
console.log('    ' + path.relative(RADICE, out));
