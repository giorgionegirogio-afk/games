/* Generatore di icone PNG senza dipendenze esterne.
   Node ha zlib: basta comporre i chunk PNG a mano. Disegno vettoriale
   minimale su una griglia di pixel — nessuna libreria, nessun download. */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const OUT = process.argv[2] || '.';

function crc32(buf) {
  let c, tavola = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tavola[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = tavola[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(tipo, dati) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(dati.length);
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dati]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([len, corpo, crc]);
}

/* pixel: funzione (x, y, dim) -> [r, g, b, a] */
function scriviPNG(file, dim, pixel) {
  const righe = [];
  for (let y = 0; y < dim; y++) {
    const riga = Buffer.alloc(1 + dim * 4);
    riga[0] = 0; // nessun filtro
    for (let x = 0; x < dim; x++) {
      const [r, g, b, a] = pixel(x, y, dim);
      riga[1 + x * 4] = r; riga[2 + x * 4] = g; riga[3 + x * 4] = b; riga[4 + x * 4] = a;
    }
    righe.push(riga);
  }
  const raw = Buffer.concat(righe);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(dim, 0); ihdr.writeUInt32BE(dim, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(path.join(OUT, file), png);
  return png.length;
}

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const dentroCerchio = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;

/* ---------- CALCETTO: campo notturno, pallone fluo ---------- */
function calcetto(margine) {
  const F = hex('#0b1f16'), F2 = hex('#143024'), FLUO = hex('#d8ff3d'), GESSO = hex('#f2f5ef'), SCURO = hex('#0b1f16');
  return (x, y, dim) => {
    const m = dim * margine, u = dim / 100;
    if (x < m || y < m || x > dim - m || y > dim - m) return [0, 0, 0, 0];
    const cx = dim / 2, cy = dim / 2;
    // fondo con strisce di campo
    const striscia = Math.floor(y / (dim / 7)) % 2 === 0;
    let c = striscia ? F2 : F;
    // linea di metà campo
    if (Math.abs(x - cx) < u * 1.2) c = [70, 100, 82];
    // cerchio di centrocampo
    const d = Math.hypot(x - cx, y - cy);
    if (Math.abs(d - u * 39) < u * 1.4) c = [70, 100, 82];
    // pallone: grande, perche' l'icona deve leggersi a 48 pixel
    if (dentroCerchio(x, y, cx, cy, u * 26)) {
      c = GESSO;
      const pent = [[0, 0, 8], [0, -14.5, 4.8], [-13.5, 7.5, 4.8], [13.5, 7.5, 4.8]];
      for (const [px, py, pr] of pent) if (dentroCerchio(x, y, cx + px * u, cy + py * u, pr * u)) c = SCURO;
    } else if (dentroCerchio(x, y, cx, cy, u * 31)) {
      c = FLUO; // alone fluo attorno al pallone
    }
    return [c[0], c[1], c[2], 255];
  };
}

/* ---------- CIRCOLO: panno verde, due carte, cornice oro ---------- */
function circolo(margine) {
  const PANNO = hex('#1D5537'), PANNO2 = hex('#276743'), ORO = hex('#D9A62E'), CREMA = hex('#F6ECD2'), LEGNO = hex('#6B4220');
  return (x, y, dim) => {
    const m = dim * margine, u = dim / 100;
    if (x < m || y < m || x > dim - m || y > dim - m) return [0, 0, 0, 0];
    const cx = dim / 2, cy = dim / 2;
    let c = ((x + y) % 6 < 3) ? PANNO : PANNO2;
    // cornice di legno
    const bordo = m + u * 5;
    if (x < bordo || y < bordo || x > dim - bordo || y > dim - bordo) c = LEGNO;
    // due carte incrociate
    const carta = (ox, oy, incl, larg, alt, tinta) => {
      const dx = x - (cx + ox * u), dy = y - (cy + oy * u);
      const rx = dx * Math.cos(incl) + dy * Math.sin(incl);
      const ry = -dx * Math.sin(incl) + dy * Math.cos(incl);
      if (Math.abs(rx) < larg * u && Math.abs(ry) < alt * u) {
        // bordo scuro della carta
        if (Math.abs(rx) > (larg - 1.6) * u || Math.abs(ry) > (alt - 1.6) * u) return [59, 42, 23];
        return tinta;
      }
      return null;
    };
    const c1 = carta(-9, 2, -0.22, 15, 21, CREMA);
    if (c1) c = c1;
    const c2 = carta(9, -1, 0.20, 15, 21, CREMA);
    if (c2) c = c2;
    // il denaro d'oro sulla carta davanti
    if (dentroCerchio(x, y, cx + 9 * u, cy - 1 * u, u * 6.5)) c = ORO;
    if (dentroCerchio(x, y, cx + 9 * u, cy - 1 * u, u * 3.2)) c = hex('#7C5A10');
    return [c[0], c[1], c[2], 255];
  };
}

/* Versione "maskable": Android ritaglia l'icona in cerchio e ne tiene solo
   l'80% centrale. Il motivo va rimpicciolito attorno al centro, altrimenti
   il pallone e le carte finiscono tagliati. */
function conZona(fn, zoom) {
  return (x, y, dim) => {
    const cx = dim / 2, cy = dim / 2;
    const sx = cx + (x - cx) / zoom, sy = cy + (y - cy) / zoom;
    if (sx < 0 || sy < 0 || sx >= dim || sy >= dim) {
      // fuori dal disegno: si prolunga il fondo, mai trasparenza
      return fn(Math.min(dim - 1, Math.max(0, sx)) | 0, Math.min(dim - 1, Math.max(0, sy)) | 0, dim);
    }
    return fn(sx | 0, sy | 0, dim);
  };
}

const lavori = [];
for (const px of [48, 72, 96, 144, 192]) {
  lavori.push(['icona-calcetto-' + px + '.png', px, calcetto(0)]);
  lavori.push(['icona-circolo-' + px + '.png', px, circolo(0)]);
}
for (const [nome, dim, fn] of lavori) {
  const byte = scriviPNG(nome, dim, fn);
  console.log(nome, dim + 'px', Math.round(byte / 1024) + ' kB');
}
