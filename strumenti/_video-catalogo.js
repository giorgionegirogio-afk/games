#!/usr/bin/env node
'use strict';
/*
 * _video-catalogo.js — estrae il catalogo delle tecniche da un video di gioco
 * leggendo la TARGA VERDE che nomina ogni tecnica.
 *
 * Che cosa MISURA (non attesta):
 *   - per ogni fotogramma campionato, quanti pixel della regione dichiarata
 *     stanno nel cono di colore della targa, e dove sono (riquadro);
 *   - da questo, gli EPISODI (intervalli continui in cui la targa e' a video),
 *     con inizio, fine, durata in fotogrammi e larghezza del riquadro;
 *   - quali episodi mostrano la STESSA targa (confronto della maschera del
 *     testo bianco, distanza di Hamming normalizzata).
 * Non legge il testo: quello lo legge un umano dal foglio contatti.
 *
 * Uso:
 *   node strumenti/_video-catalogo.js --video <file.mp4>
 *        [--fps <n>|--tutti] [--uscita <cartella>] [--regione x,y,w,h]
 *        [--attese <n>] [--diagnosi] [--sabota <modo>]
 *
 * Esce con codice != 0 se non riesce a misurare (ffmpeg assente, video
 * illeggibile, dimensioni inattese). Non inventa mai un numero.
 */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------- argomenti
function arg(nome, pre) {
  const i = process.argv.indexOf('--' + nome);
  if (i < 0) return pre;
  const v = process.argv[i + 1];
  if (v === undefined || v.startsWith('--')) return true;
  return v;
}
const HA = (n) => process.argv.includes('--' + n);

const RADICE   = path.resolve(__dirname, '..');
const VIDEO    = path.resolve(String(arg('video', path.join(RADICE, 'videoplaybackcontroller.mp4'))));
const USCITA   = path.resolve(String(arg('uscita', path.join(RADICE, '_video'))));
const TUTTI    = HA('tutti');
const DIAGNOSI = HA('diagnosi');
const ATTESE   = Number(arg('attese', 0)) || 0;
const SABOTA   = arg('sabota', null);
const SCALA    = Number(arg('scala', 3));
const COLONNE  = Number(arg('colonne', 2));

// regione dichiarata dove cerchiamo la targa (x, y, larghezza, altezza)
let REG = String(arg('regione', '0,214,360,124')).split(',').map(Number);
if (REG.length !== 4 || REG.some((v) => !Number.isFinite(v))) {
  console.error('regione non valida: serve x,y,larghezza,altezza');
  process.exit(2);
}

// cono di colore della targa, misurato su un fotogramma campione:
// verde vivo ~ (5,168,14); l'erba del campo ~ (67,108,28) e non ci entra.
const G_MIN = Number(arg('gmin', 130));   // verde minimo
const DIF   = Number(arg('dif', 100));    // quanto il verde stacca da rosso e blu

// soglie di forma della targa
const AREA_MIN = Number(arg('area', 1200)); // pixel verdi minimi
const LARG_MIN = 60;
const ALT_MIN  = 22;
const RIEMP_MIN = 0.45;                     // quota di verde dentro il riquadro
const BUCO_MAX = Number(arg('buco', 6));    // fotogrammi campionati di pausa tollerati
const DIST_UGUALI = Number(arg('uguali', 0.22)); // distanza sotto cui due targhe sono la stessa

// ---------------------------------------------------------------- ffmpeg
function trovaBinario(nome) {
  if (process.env.FFMPEG_DIR) {
    const p = path.join(process.env.FFMPEG_DIR, nome);
    if (fs.existsSync(p)) return p;
  }
  const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  try {
    for (const d of fs.readdirSync(base)) {
      if (!d.startsWith('Gyan.FFmpeg')) continue;
      const pk = path.join(base, d);
      for (const s of fs.readdirSync(pk)) {
        const p = path.join(pk, s, 'bin', nome);
        if (fs.existsSync(p)) return p;
      }
    }
  } catch (e) { /* nessuna cartella WinGet */ }
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [nome.replace('.exe', '')], { encoding: 'utf8' });
  if (r.status === 0) return r.stdout.trim().split(/\r?\n/)[0];
  return null;
}

const FFMPEG  = trovaBinario('ffmpeg.exe')  || trovaBinario('ffmpeg');
const FFPROBE = trovaBinario('ffprobe.exe') || trovaBinario('ffprobe');
if (!FFMPEG || !FFPROBE) {
  console.error('ffmpeg/ffprobe non trovati. Imposta FFMPEG_DIR alla cartella bin.');
  process.exit(3);
}
if (!fs.existsSync(VIDEO)) { console.error('video assente: ' + VIDEO); process.exit(3); }

// ---------------------------------------------------------------- sonda video
function sondaVideo() {
  const r = spawnSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,nb_frames',
    '-show_entries', 'format=duration', '-of', 'json', VIDEO], { encoding: 'utf8', maxBuffer: 1 << 24 });
  if (r.status !== 0) { console.error('ffprobe fallito:\n' + r.stderr); process.exit(3); }
  const j = JSON.parse(r.stdout);
  const s = j.streams[0];
  const [a, b] = String(s.r_frame_rate).split('/').map(Number);
  return {
    larg: s.width, alt: s.height,
    fps: b ? a / b : a,
    fotogrammi: Number(s.nb_frames) || 0,
    durata: Number(j.format.duration) || 0,
  };
}

const V = sondaVideo();
const FPS_CAMP = TUTTI ? V.fps : Number(arg('fps', 4));
const W = V.larg, H = V.alt;

if (REG[0] < 0 || REG[1] < 0 || REG[0] + REG[2] > W || REG[1] + REG[3] > H) {
  console.error(`regione ${REG.join(',')} fuori dal fotogramma ${W}x${H}`);
  process.exit(2);
}

// il sabotaggio serve a controllare che lo strumento MISURI: se sposto la
// regione lontano dalla targa e trovo lo stesso numero, sto attestando.
if (SABOTA === 'regione') REG = [W - REG[2], 0, REG[2], REG[3]];
if (SABOTA === 'colore') { /* cono di colore rotto: cerca il blu */ }
const SAB_COLORE = SABOTA === 'colore';

const [RX, RY, RW, RH] = REG;

// ---------------------------------------------------------------- rilevamento
function verde(r, g, b) {
  if (SAB_COLORE) return b >= G_MIN && b - r >= DIF && b - g >= DIF;
  return g >= G_MIN && g - r >= DIF && g - b >= DIF;
}

const colc = new Int32Array(RW);
const rowc = new Int32Array(RH);

/** Misura la targa in un fotogramma. Ritorna null se non c'e'. */
function misura(buf) {
  colc.fill(0); rowc.fill(0);
  let tot = 0;
  for (let y = 0; y < RH; y++) {
    let base = ((RY + y) * W + RX) * 3;
    let rc = 0;
    for (let x = 0; x < RW; x++, base += 3) {
      if (verde(buf[base], buf[base + 1], buf[base + 2])) { rc++; colc[x]++; }
    }
    rowc[y] = rc; tot += rc;
  }
  if (tot < AREA_MIN) return null;

  const sogliaR = Math.max(8, 0.40 * Math.max(...rowc));
  const sogliaC = Math.max(8, 0.40 * Math.max(...colc));
  let y0 = -1, y1 = -1, x0 = -1, x1 = -1;
  for (let y = 0; y < RH; y++) if (rowc[y] >= sogliaR) { if (y0 < 0) y0 = y; y1 = y; }
  for (let x = 0; x < RW; x++) if (colc[x] >= sogliaC) { if (x0 < 0) x0 = x; x1 = x; }
  if (y0 < 0 || x0 < 0) return null;

  const larg = x1 - x0 + 1, alt = y1 - y0 + 1;
  if (larg < LARG_MIN || alt < ALT_MIN) return null;

  // riempimento reale dentro il riquadro + pixel di testo bianco.
  // La targa entra con una tendina: il testo bianco cresce fino a stabilizzarsi.
  // Contarlo e' come sappiamo QUALE fotogramma mostra la scritta intera.
  let dentro = 0, bianchi = 0;
  for (let y = y0; y <= y1; y++) {
    let base = ((RY + y) * W + RX + x0) * 3;
    for (let x = x0; x <= x1; x++, base += 3) {
      const r = buf[base], g = buf[base + 1], b = buf[base + 2];
      if (verde(r, g, b)) dentro++;
      else if (r > 150 && g > 165 && b > 130) bianchi++;
    }
  }
  const riemp = dentro / (larg * alt);
  if (riemp < RIEMP_MIN) return null;

  return { x0, y0, x1, y1, larg, alt, verdi: dentro, bianchi, riemp };
}

/** Copia la regione dichiarata (per poterla ritagliare dopo). */
function copiaRegione(buf) {
  const out = Buffer.allocUnsafe(RW * RH * 3);
  for (let y = 0; y < RH; y++) {
    buf.copy(out, y * RW * 3, ((RY + y) * W + RX) * 3, ((RY + y) * W + RX + RW) * 3);
  }
  return out;
}

// ---------------------------------------------------------------- passata
function passata(cb) {
  return new Promise((ris, rif) => {
    const filtro = TUTTI ? [] : ['-vf', `fps=${FPS_CAMP}`];
    const p = spawn(FFMPEG, ['-v', 'error', '-i', VIDEO, ...filtro,
      '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const TAGLIA = W * H * 3;
    let coda = [];
    let codaLen = 0;
    let n = 0;
    let err = '';
    p.stderr.on('data', (d) => { err += d.toString(); });
    p.stdout.on('data', (d) => {
      coda.push(d); codaLen += d.length;
      while (codaLen >= TAGLIA) {
        const unito = coda.length === 1 ? coda[0] : Buffer.concat(coda, codaLen);
        const f = unito.subarray(0, TAGLIA);
        const resto = unito.subarray(TAGLIA);
        coda = resto.length ? [resto] : []; codaLen = resto.length;
        cb(f, n++);
      }
    });
    p.on('error', rif);
    p.on('close', (c) => {
      if (c !== 0) return rif(new Error('ffmpeg uscito con ' + c + '\n' + err));
      ris(n);
    });
  });
}

// ---------------------------------------------------------------- episodi
const episodi = [];
let corrente = null;
let ultimoVisto = -1e9;
let campionati = 0;

function chiudi() {
  if (!corrente) return;
  const q = corrente.quadri;
  // fotogramma rappresentativo = quello con la scritta piu' completa
  // (piu' pixel di testo bianco); a pari merito, il mediano fra quelli.
  const maxA = Math.max(...q.map((k) => k.m.larg * k.m.alt));
  const interi = q.filter((k) => k.m.larg * k.m.alt >= 0.97 * maxA);
  const maxB = Math.max(...interi.map((k) => k.m.bianchi));
  const buoni = interi.filter((k) => k.m.bianchi >= 0.97 * maxB);
  const rap = buoni[Math.floor(buoni.length / 2)];
  episodi.push({
    id: episodi.length,
    iInizio: corrente.iInizio, iFine: corrente.iFine,
    tInizio: corrente.iInizio / FPS_CAMP, tFine: corrente.iFine / FPS_CAMP,
    nCampioni: q.length, nInteri: buoni.length,
    durataFotogrammi: Math.round((corrente.iFine - corrente.iInizio + 1) * (V.fps / FPS_CAMP)),
    m: rap.m, tRap: rap.i / FPS_CAMP, regione: rap.reg,
  });
  corrente = null;
}

function suFotogramma(buf, i) {
  campionati++;
  if (ALTROVE) cercaAltrove(buf, i);
  const m = misura(buf);
  if (!m) {
    if (corrente && i - ultimoVisto > BUCO_MAX) chiudi();
    return;
  }
  if (corrente && i - ultimoVisto > BUCO_MAX) chiudi();
  if (!corrente) corrente = { iInizio: i, iFine: i, quadri: [] };
  corrente.iFine = i;
  corrente.quadri.push({ i, m, reg: copiaRegione(buf) });
  ultimoVisto = i;
}

// ------------------------------------------------- targhe ALTROVE nel fotogramma
// Serve a rispondere alla domanda "quante ne ho perse?": cerca macchie verdi
// compatte su TUTTO il fotogramma, non solo nella regione dichiarata.
const ALTROVE = HA('altrove');
const DW = W >> 1, DH = H >> 1;
const mappa = new Int32Array(DW * DH);
const pila = new Int32Array(DW * DH);
const macchie = [];
function cercaAltrove(buf, i) {
  mappa.fill(0);
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
    const j = ((y * 2) * W + x * 2) * 3;
    mappa[y * DW + x] = verde(buf[j], buf[j + 1], buf[j + 2]) ? -1 : 0;
  }
  for (let s = 0; s < DW * DH; s++) {
    if (mappa[s] !== -1) continue;
    let sp = 0; pila[sp++] = s; mappa[s] = 1;
    let n = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    while (sp) {
      const c = pila[--sp]; const cx = c % DW, cy = (c / DW) | 0;
      n++; if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
      if (cx > 0 && mappa[c - 1] === -1) { mappa[c - 1] = 1; pila[sp++] = c - 1; }
      if (cx < DW - 1 && mappa[c + 1] === -1) { mappa[c + 1] = 1; pila[sp++] = c + 1; }
      if (cy > 0 && mappa[c - DW] === -1) { mappa[c - DW] = 1; pila[sp++] = c - DW; }
      if (cy < DH - 1 && mappa[c + DW] === -1) { mappa[c + DW] = 1; pila[sp++] = c + DW; }
    }
    const l = (x1 - x0 + 1) * 2, a = (y1 - y0 + 1) * 2;
    if (n * 4 < AREA_MIN || l < LARG_MIN || a < ALT_MIN) continue;
    if ((n * 4) / (l * a) < RIEMP_MIN) continue;
    macchie.push({ t: i / FPS_CAMP, x0: x0 * 2, y0: y0 * 2, x1: x1 * 2, y1: y1 * 2, l, a, px: n * 4 });
  }
}

// ---------------------------------------------------------------- firma / uguaglianza
const FW = 300, FH = 70; // tela della firma, ancorata all'angolo alto-sinistro della targa
function firma(ep) {
  const b = new Uint8Array(FW * FH);
  const { x0, y0, x1, y1 } = ep.m;
  for (let y = y0; y <= y1 && y - y0 < FH; y++) {
    for (let x = x0; x <= x1 && x - x0 < FW; x++) {
      const i = (y * RW + x) * 3;
      const r = ep.regione[i], g = ep.regione[i + 1], bl = ep.regione[i + 2];
      // testo bianco sopra il verde
      if (r > 130 && g > 150 && bl > 110) b[(y - y0) * FW + (x - x0)] = 1;
    }
  }
  return b;
}
function distanza(a, b) {
  let diff = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { if (a[i]) na++; if (b[i]) nb++; if (a[i] !== b[i]) diff++; }
  const den = Math.max(na, nb, 1);
  return diff / den;
}

// ---------------------------------------------------------------- font 5x7
const FONT = {
  '0': '01110,10001,10011,10101,11001,10001,01110', '1': '00100,01100,00100,00100,00100,00100,01110',
  '2': '01110,10001,00001,00010,00100,01000,11111', '3': '11111,00010,00100,00010,00001,10001,01110',
  '4': '00010,00110,01010,10010,11111,00010,00010', '5': '11111,10000,11110,00001,00001,10001,01110',
  '6': '00110,01000,10000,11110,10001,10001,01110', '7': '11111,00001,00010,00100,01000,01000,01000',
  '8': '01110,10001,10001,01110,10001,10001,01110', '9': '01110,10001,10001,01111,00001,00010,01100',
  ':': '00000,00100,00100,00000,00100,00100,00000', '.': '00000,00000,00000,00000,00000,01100,01100',
  '-': '00000,00000,00000,11111,00000,00000,00000', '/': '00001,00010,00010,00100,01000,01000,10000',
  '(': '00010,00100,01000,01000,01000,00100,00010', ')': '01000,00100,00010,00010,00010,00100,01000',
  '+': '00000,00100,00100,11111,00100,00100,00000', '#': '01010,01010,11111,01010,11111,01010,01010',
  ' ': '00000,00000,00000,00000,00000,00000,00000',
  A: '01110,10001,10001,11111,10001,10001,10001', B: '11110,10001,10001,11110,10001,10001,11110',
  C: '01110,10001,10000,10000,10000,10001,01110', D: '11110,10001,10001,10001,10001,10001,11110',
  E: '11111,10000,10000,11110,10000,10000,11111', F: '11111,10000,10000,11110,10000,10000,10000',
  G: '01110,10001,10000,10111,10001,10001,01111', H: '10001,10001,10001,11111,10001,10001,10001',
  I: '01110,00100,00100,00100,00100,00100,01110', J: '00111,00010,00010,00010,00010,10010,01100',
  K: '10001,10010,10100,11000,10100,10010,10001', L: '10000,10000,10000,10000,10000,10000,11111',
  M: '10001,11011,10101,10101,10001,10001,10001', N: '10001,10001,11001,10101,10011,10001,10001',
  O: '01110,10001,10001,10001,10001,10001,01110', P: '11110,10001,10001,11110,10000,10000,10000',
  Q: '01110,10001,10001,10001,10101,10010,01101', R: '11110,10001,10001,11110,10100,10010,10001',
  S: '01111,10000,10000,01110,00001,00001,11110', T: '11111,00100,00100,00100,00100,00100,00100',
  U: '10001,10001,10001,10001,10001,10001,01110', V: '10001,10001,10001,10001,10001,01010,00100',
  W: '10001,10001,10001,10101,10101,11011,10001', X: '10001,10001,01010,00100,01010,10001,10001',
  Y: '10001,10001,01010,00100,00100,00100,00100', Z: '11111,00001,00010,00100,01000,10000,11111',
};

function scrivi(tela, tw, th, testo, px, py, s, col) {
  let cx = px;
  for (const ch of String(testo).toUpperCase()) {
    const g = FONT[ch] || FONT[' '];
    const righe = g.split(',');
    for (let ry = 0; ry < 7; ry++) {
      for (let rx = 0; rx < 5; rx++) {
        if (righe[ry][rx] !== '1') continue;
        for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) {
          const X = cx + rx * s + dx, Y = py + ry * s + dy;
          if (X < 0 || Y < 0 || X >= tw || Y >= th) continue;
          const i = (Y * tw + X) * 3;
          tela[i] = col[0]; tela[i + 1] = col[1]; tela[i + 2] = col[2];
        }
      }
    }
    cx += 6 * s;
  }
  return cx;
}

// ---------------------------------------------------------------- ingrandimento
function cr(t, a, b, c, d) { // Catmull-Rom
  return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
}
/** ritaglia src(RWxRH) nel rettangolo e lo ingrandisce di s con Catmull-Rom */
function ingrandisci(src, sw, sh, rx, ry, rw, rh, s) {
  const dw = Math.round(rw * s), dh = Math.round(rh * s);
  const out = Buffer.allocUnsafe(dw * dh * 3);
  const P = (x, y, c) => {
    x = Math.min(sw - 1, Math.max(0, x)); y = Math.min(sh - 1, Math.max(0, y));
    return src[(y * sw + x) * 3 + c];
  };
  for (let dy = 0; dy < dh; dy++) {
    const sy = ry + (dy + 0.5) / s - 0.5;
    const iy = Math.floor(sy), fy = sy - iy;
    for (let dx = 0; dx < dw; dx++) {
      const sx = rx + (dx + 0.5) / s - 0.5;
      const ix = Math.floor(sx), fx = sx - ix;
      for (let c = 0; c < 3; c++) {
        const r0 = cr(fx, P(ix - 1, iy - 1, c), P(ix, iy - 1, c), P(ix + 1, iy - 1, c), P(ix + 2, iy - 1, c));
        const r1 = cr(fx, P(ix - 1, iy, c), P(ix, iy, c), P(ix + 1, iy, c), P(ix + 2, iy, c));
        const r2 = cr(fx, P(ix - 1, iy + 1, c), P(ix, iy + 1, c), P(ix + 1, iy + 1, c), P(ix + 2, iy + 1, c));
        const r3 = cr(fx, P(ix - 1, iy + 2, c), P(ix, iy + 2, c), P(ix + 1, iy + 2, c), P(ix + 2, iy + 2, c));
        let v = cr(fy, r0, r1, r2, r3);
        out[(dy * dw + dx) * 3 + c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
  }
  return { buf: out, w: dw, h: dh };
}

// ---------------------------------------------------------------- PNG via ffmpeg
function scriviPng(buf, w, h, dove) {
  fs.mkdirSync(path.dirname(dove), { recursive: true });
  const r = spawnSync(FFMPEG, ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
    '-s', `${w}x${h}`, '-i', '-', '-frames:v', '1', dove], { input: buf, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error('png fallito: ' + r.stderr);
}

function mmss(t) {
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${String(Math.floor(s)).padStart(2, '0')}`;
}

// ---------------------------------------------------------------- corpo
(async () => {
  const t0 = Date.now();
  console.log(`video     ${VIDEO}`);
  console.log(`formato   ${W}x${H}, ${V.fps} fot/s, ${V.fotogrammi} fotogrammi, ${V.durata.toFixed(2)} s`);
  console.log(`regione   x=${RX} y=${RY} l=${RW} a=${RH}${SABOTA ? '  [SABOTATO: ' + SABOTA + ']' : ''}`);
  console.log(`colore    g>=${G_MIN}, g-r>=${DIF}, g-b>=${DIF}; area>=${AREA_MIN}, riemp>=${RIEMP_MIN}`);
  console.log(`campiono  ${TUTTI ? 'TUTTI i fotogrammi' : FPS_CAMP + ' fot/s'}`);

  const n = await passata(suFotogramma);
  chiudi();
  const secondi = (Date.now() - t0) / 1000;
  console.log(`letti     ${n} fotogrammi in ${secondi.toFixed(1)} s`);
  console.log(`episodi   ${episodi.length}`);

  if (!episodi.length) { console.error('nessuna targa trovata: la regione o il colore sono sbagliati'); process.exit(4); }

  // durata minima: dice se un campionamento piu' rado avrebbe perso qualcosa
  const durate = episodi.map((e) => e.durataFotogrammi).sort((a, b) => a - b);
  console.log(`durata episodi (fotogrammi del video): min ${durate[0]}, mediana ${durate[Math.floor(durate.length / 2)]}, max ${durate[durate.length - 1]}`);

  // firme e raggruppamento
  const gruppi = [];
  for (const ep of episodi) {
    ep.firma = firma(ep);
    let dove = -1, best = 1e9;
    for (let i = 0; i < gruppi.length; i++) {
      const d = distanza(ep.firma, gruppi[i].capo.firma);
      if (d < best) { best = d; if (d <= DIST_UGUALI) dove = i; }
    }
    ep.distMin = best;
    if (dove >= 0) { gruppi[dove].membri.push(ep); ep.gruppo = dove; }
    else { ep.gruppo = gruppi.length; gruppi.push({ id: gruppi.length, capo: ep, membri: [ep] }); }
  }
  console.log(`targhe distinte  ${gruppi.length}`);
  if (ATTESE) console.log(`attese dal titolo ${ATTESE} -> scarto ${gruppi.length - ATTESE}`);

  if (ALTROVE) {
    // raggruppa le macchie in intervalli, e separa quelle che NON sono la targa
    const dentro = (m) => m.x0 >= RX && m.x1 <= RX + RW && m.y0 >= RY && m.y1 <= RY + RH;
    const fuori = macchie.filter((m) => !dentro(m));
    console.log(`\n-- macchie verdi compatte su TUTTO il fotogramma --`);
    console.log(`totali ${macchie.length}, dentro la regione dichiarata ${macchie.length - fuori.length}, FUORI ${fuori.length}`);
    const grp = [];
    for (const m of fuori) {
      const u = grp[grp.length - 1];
      if (u && m.t - u.tFine <= 1.5 && Math.abs(m.y0 - u.y0) < 24 && Math.abs(m.x0 - u.x0) < 40) { u.tFine = m.t; u.n++; }
      else grp.push({ tInizio: m.t, tFine: m.t, n: 1, x0: m.x0, y0: m.y0, l: m.l, a: m.a });
    }
    console.log(`intervalli fuori regione: ${grp.length}`);
    for (const g of grp) console.log(`  ${mmss(g.tInizio)}-${mmss(g.tFine)}  (${g.x0},${g.y0}) ${g.l}x${g.a}  ${g.n} campioni`);
  }

  if (DIAGNOSI) {
    console.log('\n-- episodi --');
    for (const e of episodi) {
      console.log(`#${String(e.id).padStart(3)} ${mmss(e.tInizio)}-${mmss(e.tFine)} ` +
        `riq(${e.m.x0},${e.m.y0})-(${e.m.x1},${e.m.y1}) ${e.m.larg}x${e.m.alt} ` +
        `riemp ${e.m.riemp.toFixed(2)} dur ${e.durataFotogrammi}f dist ${e.distMin.toFixed(3)} gr ${e.gruppo}`);
    }
  }

  // ---- foglio contatti
  const cx0 = Math.min(...gruppi.map((g) => g.capo.m.x0));
  const cy0 = Math.min(...gruppi.map((g) => g.capo.m.y0));
  const cy1 = Math.max(...gruppi.map((g) => g.capo.m.y1));
  const cx1 = Math.max(...gruppi.map((g) => g.capo.m.x1));
  const MG = 3;
  const rx = Math.max(0, cx0 - MG), ry = Math.max(0, cy0 - MG);
  const rw = Math.min(RW - rx, cx1 - cx0 + 1 + 2 * MG), rh = Math.min(RH - ry, cy1 - cy0 + 1 + 2 * MG);

  const cellaL = Math.round(rw * SCALA), cellaA = Math.round(rh * SCALA);
  const BARRA = 22, PAD = 10;
  const colL = cellaL + PAD * 2, colA = BARRA + cellaA + PAD;
  const righe = Math.ceil(gruppi.length / COLONNE);
  const TESTA = 46;
  const TL = colL * COLONNE, TA = TESTA + colA * righe + PAD;

  const tela = Buffer.alloc(TL * TA * 3, 0x14);
  scrivi(tela, TL, TA, `TARGHE DISTINTE: ${gruppi.length}` + (ATTESE ? `  ATTESE: ${ATTESE}` : ''), PAD, 8, 2, [255, 255, 255]);
  scrivi(tela, TL, TA, `${path.basename(VIDEO)}  ${W}X${H}  ${V.fotogrammi} FOTOGRAMMI  ${TUTTI ? 'TUTTI' : FPS_CAMP + ' FOT/S'}`, PAD, 26, 1, [150, 200, 150]);

  fs.mkdirSync(path.join(USCITA, 'ritagli'), { recursive: true });

  gruppi.forEach((g, i) => {
    const c = i % COLONNE, r = Math.floor(i / COLONNE);
    const px = c * colL + PAD, py = TESTA + r * colA;
    const et = `${String(i + 1).padStart(2, '0')}  ${mmss(g.capo.tInizio)}` +
      (g.membri.length > 1 ? `  (${g.membri.length} VOLTE)` : '');
    scrivi(tela, TL, TA, et, px, py + 5, 2, [230, 255, 230]);
    const ing = ingrandisci(g.capo.regione, RW, RH, rx, ry, rw, rh, SCALA);
    for (let y = 0; y < ing.h; y++) {
      const Y = py + BARRA + y;
      if (Y >= TA) break;
      ing.buf.copy(tela, (Y * TL + px) * 3, y * ing.w * 3, (y * ing.w + Math.min(ing.w, TL - px)) * 3);
    }
    // ritaglio singolo, ingrandito 4x, per lettura ravvicinata
    const solo = ingrandisci(g.capo.regione, RW, RH, rx, ry, rw, rh, 4);
    scriviPng(solo.buf, solo.w, solo.h, path.join(USCITA, 'ritagli', `${String(i + 1).padStart(2, '0')}.png`));
  });

  const dove = path.join(USCITA, 'targhe.png');
  scriviPng(tela, TL, TA, dove);
  console.log(`foglio    ${dove} (${TL}x${TA})`);

  // ---- tabella
  console.log('\nN   PRIMA  APPARIZIONI  ISTANTI');
  gruppi.forEach((g, i) => {
    console.log(`${String(i + 1).padStart(2, '0')}  ${mmss(g.capo.tInizio).padStart(5)}  ${String(g.membri.length).padStart(11)}  ` +
      g.membri.map((m) => mmss(m.tInizio)).join(' '));
  });

  fs.writeFileSync(path.join(USCITA, 'targhe.json'), JSON.stringify({
    video: VIDEO, larghezza: W, altezza: H, fps: V.fps, fotogrammi: V.fotogrammi, durata: V.durata,
    regione: { x: RX, y: RY, l: RW, a: RH }, campionamento: TUTTI ? 'tutti' : FPS_CAMP,
    episodi: episodi.length, distinte: gruppi.length, attese: ATTESE || null,
    targhe: gruppi.map((g, i) => ({
      n: i + 1, primaS: +g.capo.tInizio.toFixed(2), prima: mmss(g.capo.tInizio),
      apparizioni: g.membri.length,
      istanti: g.membri.map((m) => ({ s: +m.tInizio.toFixed(2), mmss: mmss(m.tInizio), durataFotogrammi: m.durataFotogrammi })),
      riquadro: g.capo.m, ritaglio: `ritagli/${String(i + 1).padStart(2, '0')}.png`,
    })),
  }, null, 2));
  console.log(`dati      ${path.join(USCITA, 'targhe.json')}`);
})().catch((e) => { console.error(e.stack || String(e)); process.exit(5); });
