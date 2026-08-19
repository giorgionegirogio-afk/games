/* =====================================================================
   VIDEO-TEMPI — quanti fotogrammi passano fra il tasto e la palla.

   IL PERCHE'.
   Nessuna guida scritta di FC 25 contiene i tempi di risposta, perche'
   nessuno li pubblica. Ma il video di gioco ne ha uno addosso: in alto a
   destra c'e' un DualSense disegnato che reagisce ai tasti premuti. Se so
   leggere quel disegno, ho l'istante della pressione con la precisione
   del fotogramma; se so vedere la palla partire, ho l'istante dell'azione.
   La differenza e' il numero che decide se CALCETTO sembra reattivo
   quanto FC 25.

   COSA HO SCOPERTO GUARDANDO, e che cambia il metodo.
   1) Il controller NON e' sempre in scena: sparisce nelle moviole e nelle
      scene di gol (il 14% dei fotogrammi). Entra ed esce SCIVOLANDO e
      DISSOLVENDO: durante quelle transizioni ogni sonda a posizione fissa
      si accende per finta, perche' e' il disegno che si sposta sotto di
      lei. Sono state le mie prime cinquanta misure sbagliate.
   2) Un tasto premuto non si ILLUMINA: si SCURISCE. Il disegno riempie il
      simbolo. Chi cerca un aumento di luminanza non trova niente.
   3) Il corpo del controller e' opaco e IMMOBILE al pixel quando e' in
      scena (94,5% dei fotogrammi presenti a scostamento esattamente 0,0).
      Percio' si puo' misurare per differenza da un modello mediano.

   COME MI ACCORGO DI STARE SBAGLIANDO (il punto piu' importante).
   Due sonde di CONTROLLO, identiche per forma alle quattro vere:
     - un anello sulla CROCE DIREZIONALE, che in FC si usa per le tattiche
       e quasi mai per toccare la palla;
     - un anello sul CORPO BIANCO LISCIO del pad destro, dove non c'e'
       nessun tasto.
   Se una di queste due si accende, la misura NON e' dei tasti: e' del
   video che si muove, del prato che passa sotto, o della compressione.
   Lo strumento lo dice e si ferma. E con --sabota sposto apposta le
   quattro sonde vere sul corpo liscio: se continuano a trovare eventi,
   lo strumento non sta misurando i tasti e va buttato.

   IL CONTATTO COL PALLONE: NON CI SONO RIUSCITO, e il perche' e' misurato.
   La palla e' un batuffolo chiaro di 3-5 px in un video 640x360 a
   332 kbit/s. Si vede, ma metti in fila i batuffoli e ne trovi quindici
   per fotogramma: calzettoni, maniche, linee. Tolgo il moto della
   TELECAMERA (blocchi, ricerca a tre passi) e cerco il batuffolo che da
   lento diventa veloce e dritto: ne trovo 38 in undici minuti, contro 209
   pressioni. Poi faccio LA PROVA IN BIANCO: sposto le pressioni nel tempo
   di 113, 307, 641... fotogrammi e riaccoppio. Le pressioni finte
   spiegano i colpi quanto quelle vere (14,4 contro 12: z = -1,1).
   Con una pressione ogni cento fotogrammi e una finestra di quarantacinque,
   quasi ogni colpo trova per caso una pressione che lo precede.
   Percio' lo strumento NON pubblica un ritardo: pubblica la prova in
   bianco che lo vieta. Serve un video piu' grande, non un'altra soglia.

   uso:
     node strumenti/_video-tempi.js --video <file.mp4>
     node strumenti/_video-tempi.js --video <f> --prove fuori/prove
     node strumenti/_video-tempi.js --video <f> --cache    (riusa i grezzi)
     node strumenti/_video-tempi.js --video <f> --sabota
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const bandiera = n => process.argv.includes('--' + n);

const VIDEO = path.resolve(arg('video', 'videoplaybackcontroller.mp4'));
const PROVE = arg('prove', '');
const SABOTA = bandiera('sabota');

/* =====================================================================
   LA GEOMETRIA, DICHIARATA. Coordinate in pixel del video 640x360.
   Ricavate dal modello mediano del video stesso (i quattro simboli sono
   dischi piu' scuri del corpo); chi cambia video le rimisura.
   ===================================================================== */
const VW = 640, VH = 360;
/* ritaglio attorno al controller: tutto il lavoro sul disegno sta qui.
   ORIGINE PARI, e non e' un dettaglio: `crop=...:545:65` su un video
   yuv420 fa scattare l'origine a (544,64) senza dirlo, e chi ha ricavato
   le coordinate guardando il ritaglio le ha tutte spostate di un pixel
   rispetto al fotogramma intero. E' costato una misura intera. */
const CX = 544, CY = 64, CW = 72, CH = 52;

/* ANCORA: solo corpo bianco del controller (touchpad e fascia), nessun
   tasto, nessun prato. Serve a decidere se il fotogramma e' utilizzabile:
   se il disegno sta scivolando o dissolvendo, il residuo esplode. */
const ANCORA = { x0: 572, y0: 81, x1: 593, y1: 94 };
const RESIDUO_MAX = 4;          // luminanza media di scarto ammessa

/* ANELLI: la corona attorno a ciascun simbolo. Il centro scurisce poco
   (e' gia' scuro), la corona scurisce molto: e' li' che c'e' il segnale.
   Centri misurati sul modello mediano: triangolo (602,88), quadrato
   (598,93), cerchio (607,93), croce (602,97). */
const ANELLI = {
  'triangolo': [[602, 87], [603, 87], [604, 87], [601, 88], [604, 88], [605, 88], [601, 89], [605, 89], [601, 90], [604, 90], [605, 90], [602, 91], [603, 91], [604, 91]],
  'quadrato': [[596, 92], [597, 92], [598, 92], [599, 92], [596, 93], [600, 93], [596, 94], [600, 94], [597, 95], [598, 95], [599, 95]],
  'cerchio': [[606, 92], [607, 92], [608, 92], [609, 92], [606, 93], [609, 93], [606, 94], [609, 94], [606, 95], [607, 95], [608, 95], [609, 95]],
  'croce': [[601, 96], [602, 96], [603, 96], [604, 96], [601, 97], [604, 97], [601, 98], [604, 98], [601, 99], [602, 99], [603, 99], [604, 99], [602, 100], [603, 100]],
};
/* i centri dei quattro simboli: servono al controllo di geometria */
const CENTRI = { 'triangolo': [602, 88], 'quadrato': [598, 93], 'cerchio': [607, 93], 'croce': [602, 97] };
/* le due sonde di CONTROLLO: devono restare mute */
const CONTROLLI = {
  'ctrl:croce-direzionale': [[558, 92], [559, 92], [560, 92], [561, 92], [558, 93], [562, 93], [558, 94], [562, 94], [559, 95], [560, 95], [561, 95]],
  'ctrl:corpo-liscio': [[600, 85], [601, 85], [602, 85], [603, 85], [604, 85], [600, 86], [601, 86], [602, 86], [603, 86], [604, 86]],
};
/* sabotaggio: le quattro sonde vere spostate sul corpo liscio (+0,-7) */
function sabota(a) { const o = {}; for (const [k, v] of Object.entries(a)) o[k] = v.map(([x, y]) => [x, y - 7]); return o; }

const CALO_ALTO = 32, CALO_BASSO = 16;   // isteresi, in luminanza

/* palla: batuffolo chiaro e poco saturo, piccolo e compatto */
const PALLA = { minLum: 150, maxSat: 45, minPx: 3, maxPx: 30, maxLato: 7 };
/* campo utile: fuori dall'interfaccia in alto, dal nastro in basso, e dal
   riquadro del controller */
const dentroCampo = (x, y) => y >= 42 && y <= 306 && !(x >= 540 && y <= 120);

/* contatto: in coordinate compensate dalla telecamera */
const LENTO = 3.0;        // px/fotogramma: sotto, e' fermo o e' un giocatore
const VELOCE = 8.0;       // px/fotogramma: sopra, e' una palla calciata
const TENUTA = 6;         // fotogrammi consecutivi sopra VELOCE
const SPOSTAMENTO = 60;   // px percorsi in TENUTA fotogrammi
const FINESTRA = 45;      // fotogrammi entro cui una pressione puo' spiegare un colpo
const SFASAMENTI = [113, 307, 641, 1511, 2311, -409, -877];   // le prove in bianco

/* --------------------------------------------------------------------- */
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const mediana = a => { const o = [...a].sort((x, y) => x - y); return o.length ? o[o.length >> 1] : NaN; };
const pct = (a, p) => { const o = [...a].sort((x, y) => x - y); return o.length ? o[Math.min(o.length - 1, Math.max(0, Math.round(p * (o.length - 1))))] : NaN; };

function ffmpeg(args, onData, onClose) {
  const p = spawn('ffmpeg', args);
  let err = '';
  p.stdout.on('data', onData);
  p.stderr.on('data', d => { err += d; });
  p.on('close', c => onClose(c, err));
  return p;
}

/* =====================================================================
   UNA SOLA PASSATA. E' una scelta, non pigrizia: la prima versione ne
   faceva due, una sul RITAGLIO del controller e una sul fotogramma
   intero, e le due davano pixel DIVERSI sugli stessi punti (il ritaglio
   parte da x=545, dispari: in yuv420 il croma si riallinea e la
   luminanza ricostruita cambia di parecchio). Il modello costruito su
   una passata non combaciava con le misure dell'altra e il cancello
   scartava il 99,97% dei fotogrammi. Adesso il ritaglio si tiene in
   memoria (235 MB) e il modello e le misure vengono dagli stessi byte.
   ===================================================================== */
function passata(anelli, controlli) {
  const FS = VW * VH * 3, CFS = CW * CH * 3;
  const idxC = (x, y) => (y - CY) * CW + (x - CX);
  const ancPx = []; for (let y = ANCORA.y0; y <= ANCORA.y1; y++) for (let x = ANCORA.x0; x <= ANCORA.x1; x++) ancPx.push(idxC(x, y));
  const sonde = Object.entries(Object.assign({}, anelli, controlli)).map(([n, pts]) => [n, pts.map(([x, y]) => idxC(x, y))]);
  const pezzi = [];

  const HW = VW >> 1, HH = VH >> 1;
  const B = 12, ANC = [];
  for (let by = 30; by <= 140; by += 22) for (let bx = 20; bx <= 300; bx += 32) { if (bx > 260 && by < 65) continue; ANC.push([bx, by]); }

  const cam = [], cand = [];
  const m = new Uint8Array(VW * VH), vis = new Uint8Array(VW * VH), pila = new Int32Array(4096);
  let prevL = null, curL = new Uint8Array(HW * HH);

  function sad(a, b, ax, ay, bx, by) { let s = 0; for (let y = 0; y < B; y++) { const ra = (ay + y) * HW + ax, rb = (by + y) * HW + bx; for (let x = 0; x < B; x++) s += Math.abs(a[ra + x] - b[rb + x]); } return s; }

  function analizza(fr) {
    /* --- il ritaglio del controller, messo da parte tale e quale --- */
    const pz = Buffer.allocUnsafe(CFS);
    for (let y = 0; y < CH; y++) fr.copy(pz, y * CW * 3, ((CY + y) * VW + CX) * 3, ((CY + y) * VW + CX + CW) * 3);
    pezzi.push(pz);

    /* --- luminanza a mezza risoluzione e moto globale --- */
    for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) {
      let s = 0;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const q = (((y * 2 + dy) * VW) + x * 2 + dx) * 3; s += lum(fr[q], fr[q + 1], fr[q + 2]); }
      curL[y * HW + x] = s / 4;
    }
    if (!prevL) cam.push([0, 0]);
    else {
      const vx = [], vy = [];
      for (const [ax, ay] of ANC) {
        let cx = 0, cy = 0, passo = 8, best = Infinity;
        while (passo >= 1) {
          let nx = cx, ny = cy;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const tx = cx + dx * passo, ty = cy + dy * passo;
            if (ax + tx < 0 || ay + ty < 0 || ax + tx + B > HW || ay + ty + B > HH) continue;
            const v = sad(prevL, curL, ax, ay, ax + tx, ay + ty);
            if (v < best) { best = v; nx = tx; ny = ty; }
          }
          cx = nx; cy = ny; passo >>= 1;
        }
        vx.push(cx); vy.push(cy);
      }
      cam.push([mediana(vx) * 2, mediana(vy) * 2]);
    }
    const t = prevL; prevL = curL; curL = t || new Uint8Array(HW * HH);

    /* --- batuffoli candidati --- */
    m.fill(0); vis.fill(0);
    for (let y = 42; y <= 306; y++) for (let x = 0; x < VW; x++) {
      if (!dentroCampo(x, y)) continue;
      const q = (y * VW + x) * 3, R = fr[q], G = fr[q + 1], Bc = fr[q + 2];
      const mx = R > G ? (R > Bc ? R : Bc) : (G > Bc ? G : Bc), mn = R < G ? (R < Bc ? R : Bc) : (G < Bc ? G : Bc);
      if (mn >= PALLA.minLum && mx - mn <= PALLA.maxSat) m[y * VW + x] = 1;
    }
    const cc = [];
    for (let y = 42; y <= 306; y++) for (let x = 0; x < VW; x++) {
      const p0 = y * VW + x; if (!m[p0] || vis[p0]) continue;
      let sp = 0; pila[sp++] = p0; vis[p0] = 1;
      let n = 0, sx = 0, sy = 0, x0 = x, x1 = x, y0 = y, y1 = y, troppo = false;
      while (sp) {
        const c = pila[--sp], cx = c % VW, cy = (c / VW) | 0;
        n++; sx += cx; sy += cy;
        if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
        if (n > 400) { troppo = true; break; }
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 42 || nx >= VW || ny > 306) continue;
          const np = ny * VW + nx; if (m[np] && !vis[np] && sp < 4090) { vis[np] = 1; pila[sp++] = np; }
        }
      }
      if (troppo) continue;
      if (n >= PALLA.minPx && n <= PALLA.maxPx && x1 - x0 + 1 <= PALLA.maxLato && y1 - y0 + 1 <= PALLA.maxLato) cc.push([sx / n, sy / n]);
    }
    cand.push(cc);
  }

  return new Promise((ok, no) => {
    let buf = Buffer.alloc(0), f = 0;
    ffmpeg(['-v', 'error', '-i', VIDEO, '-vf', 'format=rgb24', '-f', 'rawvideo', '-'],
      d => {
        buf = buf.length ? Buffer.concat([buf, d]) : d;
        while (buf.length >= FS) { analizza(buf.subarray(0, FS)); buf = buf.subarray(FS); f++; if (f % 2000 === 0) process.stderr.write('  ' + f + ' fotogrammi\n'); }
      },
      (c, err) => {
        if (c !== 0) return no(new Error('ffmpeg e\' fallito: ' + err.split('\n')[0]));
        const NF = pezzi.length;
        /* --- il modello mediano, dagli stessi byte che poi misuro --- */
        const N = CW * CH * 3, hist = new Uint16Array(N * 256);
        let camp = 0;
        for (let k = 0; k < NF; k += 3) { const p = pezzi[k]; for (let i = 0; i < N; i++) hist[i * 256 + p[i]]++; camp++; }
        const med = new Uint8Array(N);
        for (let i = 0; i < N; i++) { let s = 0; for (let v = 0; v < 256; v++) { s += hist[i * 256 + v]; if (s >= camp / 2) { med[i] = v; break; } } }
        const lumMed = new Float32Array(CW * CH);
        for (let p = 0; p < CW * CH; p++) lumMed[p] = lum(med[p * 3], med[p * 3 + 1], med[p * 3 + 2]);
        /* --- residuo dell'ancora e sonde --- */
        const res = new Float32Array(NF), serie = new Map(sonde.map(([n]) => [n, new Float32Array(NF)]));
        for (let k = 0; k < NF; k++) {
          const p = pezzi[k];
          let r = 0; for (const q of ancPx) r += Math.abs(lum(p[q * 3], p[q * 3 + 1], p[q * 3 + 2]) - lumMed[q]);
          res[k] = r / ancPx.length;
          for (const [n, px] of sonde) { let s = 0; for (const q of px) s += lum(p[q * 3], p[q * 3 + 1], p[q * 3 + 2]); serie.get(n)[k] = s / px.length; }
        }
        ok({ res: Array.from(res), serie: new Map([...serie].map(([n, a]) => [n, Array.from(a)])), cam, cand, nFrame: NF, med });
      });
  });
}

/* =====================================================================
   EVENTI DI PRESSIONE
   ===================================================================== */
function eventi(s, buono) {
  const base = mediana(s.filter((_, f) => buono[f]));
  const ev = []; let on = false, ini = 0;
  for (let f = 0; f < s.length; f++) {
    if (!buono[f]) { if (on) { ev.push([ini, f - 1]); on = false; } continue; }
    const d = base - s[f];
    if (!on && d >= CALO_ALTO) { on = true; ini = f; }
    else if (on && d < CALO_BASSO) { ev.push([ini, f - 1]); on = false; }
  }
  if (on) ev.push([ini, s.length - 1]);
  return { base, ev };
}

/* =====================================================================
   COLPI SUL PALLONE, trovati DA SOLI (non a partire dalle pressioni).

   La direzione conta. Cercare «il contatto dopo questa pressione» trova
   sempre qualcosa, perche' in quaranta fotogrammi di partita qualche
   batuffolo veloce c'e' sempre: e' una macchina per confermare. Trovare
   prima i colpi, e solo dopo chiedersi quale pressione li precede,
   permette la prova in bianco: sposto le pressioni nel tempo e guardo se
   l'accoppiamento peggiora. Se non peggiora, il legame non c'e'.
   ===================================================================== */
function trovaColpi(cand, cam) {
  const NF = cand.length;
  const cum = new Float64Array(NF * 2);
  for (let f = 1; f < NF; f++) { cum[f * 2] = cum[(f - 1) * 2] + cam[f][0]; cum[f * 2 + 1] = cum[(f - 1) * 2 + 1] + cam[f][1]; }
  const C = []; for (let f = 0; f < NF; f++) C.push(cand[f].map(([x, y]) => [x + cum[f * 2], y + cum[f * 2 + 1]]));
  const colpi = [];
  for (let f0 = 3; f0 < NF - TENUTA - 1; f0++) {
    for (const p0 of C[f0]) {
      let cx = p0[0], cy = p0[1], lento = true;
      for (let k = 1; k <= 3; k++) {
        let best = null, bd = 6;
        for (const q of C[f0 - k]) { const d = Math.hypot(q[0] - cx, q[1] - cy); if (d < bd) { bd = d; best = q; } }
        if (!best || bd > LENTO) { lento = false; break; }
        cx = best[0]; cy = best[1];
      }
      if (!lento) continue;
      cx = p0[0]; cy = p0[1]; let vx = 0, vy = 0;
      const tr = [[f0, cx, cy]];
      for (let f = f0 + 1; f < NF && tr.length < 40; f++) {
        let best = null, bd = 14;
        for (const q of C[f]) { const d = Math.hypot(q[0] - (cx + vx), q[1] - (cy + vy)); if (d < bd) { bd = d; best = q; } }
        if (!best) break;
        vx = best[0] - cx; vy = best[1] - cy; cx = best[0]; cy = best[1]; tr.push([f, cx, cy]);
      }
      if (tr.length < TENUTA + 1) continue;
      let ok = true, perc = 0;
      for (let k = 1; k <= TENUTA; k++) { const d = Math.hypot(tr[k][1] - tr[k - 1][1], tr[k][2] - tr[k - 1][2]); perc += d; if (d < VELOCE) { ok = false; break; } }
      if (!ok) continue;
      const D = Math.hypot(tr[TENUTA][1] - tr[0][1], tr[TENUTA][2] - tr[0][2]);
      if (D < SPOSTAMENTO || D / perc < 0.9) continue;
      colpi.push({ f: f0, D: Math.round(D), n: tr.length });
    }
  }
  colpi.sort((a, b) => a.f - b.f || b.n - a.n);
  const ded = []; for (const c of colpi) if (!ded.length || c.f - ded[ded.length - 1].f > 6) ded.push(c);
  return ded;
}
function accoppia(colpi, press, sfasa, NF) {
  const T = press.map(p => (p.T + sfasa + NF) % NF).sort((a, b) => a - b);
  const rit = [];
  for (const c of colpi) { let bp = -1; for (const t of T) if (t <= c.f && c.f - t <= FINESTRA && t > bp) bp = t; if (bp >= 0) rit.push(c.f - bp); }
  return rit;
}

/* =====================================================================
   FOTOGRAMMI DI PROVA — la striscia che permette di NON credermi.
   Tre fotogrammi prima della pressione, otto dopo, sul solo pad destro
   ingrandito venti volte. Se il tasto giusto non si riempie di scuro
   nella striscia, la misura e' sbagliata e si vede a occhio.
   ===================================================================== */
function salvaProve(dir, casi) {
  fs.mkdirSync(dir, { recursive: true });
  for (const c of casi) {
    const a = c.T - 3, b = c.T + 8;
    const n = c.nome + '_' + c.T;
    try {
      execFileSync('ffmpeg', ['-v', 'error', '-i', VIDEO, '-vf',
        `select=between(n\\,${a}\\,${b}),crop=20:20:594:84,scale=200:200:flags=neighbor,tile=${b - a + 1}x1:padding=3:color=red`,
        '-vsync', '0', '-frames:v', '1', '-y', path.join(dir, 'tasto_' + n + '.png')], { stdio: 'pipe', timeout: 300000 });
    } catch (e) { console.log('  (prova ' + n + ' non salvata: ' + String(e.message).split('\n')[0].slice(0, 70) + ')'); }
  }
}

/* ===================================================================== */
(async () => {
  if (!fs.existsSync(VIDEO)) { console.error('video non trovato: ' + VIDEO); process.exit(2); }
  console.log('=== VIDEO-TEMPI — dal tasto al pallone ===\n');
  console.log('video ' + path.basename(VIDEO) + (SABOTA ? '   ·   SABOTAGGIO ATTIVO (le sonde sono spostate sul liscio)' : ''));

  const anelli = SABOTA ? sabota(ANELLI) : ANELLI;
  /* la lettura del video costa due minuti e mezzo: si mette da parte, cosi'
     chi cambia una soglia non ripaga il decodificatore */
  const cache = path.resolve(__dirname, '..', 'fuori', '_video-tempi-grezzi.json');
  let B;
  if (!SABOTA && bandiera('cache') && fs.existsSync(cache)) {
    process.stderr.write('riuso i dati grezzi gia' + "'" + ' letti (' + cache + ')\n');
    const g = JSON.parse(fs.readFileSync(cache, 'utf8'));
    B = { res: g.res, serie: new Map(Object.entries(g.serie)), cam: g.cam, cand: g.cand, nFrame: g.nFrame, med: Uint8Array.from(g.med) };
  } else {
    process.stderr.write('lettura del video...\n');
    B = await passata(anelli, CONTROLLI);
    if (!SABOTA) {
      fs.mkdirSync(path.dirname(cache), { recursive: true });
      fs.writeFileSync(cache, JSON.stringify({ res: B.res, serie: Object.fromEntries(B.serie), cam: B.cam, cand: B.cand, nFrame: B.nFrame, med: Array.from(B.med) }));
    }
  }
  const NF = B.nFrame;

  /* --- controllo di geometria: il modello sa dove sono i tasti? ---
     Se il video cambia inquadratura, o se qualcuno sposta il ritaglio, le
     coordinate qui sopra puntano al vuoto e ogni numero che segue e'
     inventato. I quattro simboli devono essere piu' scuri del corpo. */
  const idxC = (x, y) => (y - CY) * CW + (x - CX);
  const lm = p => lum(B.med[p * 3], B.med[p * 3 + 1], B.med[p * 3 + 2]);
  const corpo = mediana(CONTROLLI['ctrl:corpo-liscio'].map(([x, y]) => lm(idxC(x, y))));
  console.log('\n--- CONTROLLO DI GEOMETRIA (sul modello mediano) ---');
  console.log(`  corpo bianco del pad destro: ${corpo.toFixed(0)}`);
  let geoRotta = 0;
  for (const [n, [x, y]] of Object.entries(CENTRI)) {
    const v = mediana([[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1]].map(([a, b]) => lm(idxC(x + a, y + b))));
    const scuro = corpo - v;
    if (scuro < 15) geoRotta++;
    console.log(`  ${n.padEnd(11)} centro (${x},${y}) = ${v.toFixed(0)}   piu' scuro del corpo di ${scuro.toFixed(0)}` + (scuro < 15 ? '   <-- TROPPO POCO' : ''));
  }
  if (geoRotta) { console.log('\n  Le sonde non stanno sui tasti. Rimisurare la geometria: non pubblico numeri.'); process.exit(1); }

  const buono = B.res.map(r => r < RESIDUO_MAX);
  const nBuoni = buono.filter(Boolean).length;
  console.log(`fotogrammi ${NF}  ·  con il controller fermo e opaco ${nBuoni} (${(nBuoni / NF * 100).toFixed(1)}%)`);
  console.log(`  i restanti sono moviole, scene di gol e le dissolvenze di entrata/uscita: scartati.\n`);

  /* --- i controlli parlano per primi --- */
  console.log('--- LE DUE SONDE DI CONTROLLO (devono restare mute) ---');
  let controlliRotti = 0;
  for (const n of Object.keys(CONTROLLI)) {
    const { base, ev } = eventi(B.serie.get(n), buono);
    const cali = B.serie.get(n).filter((_, f) => buono[f]).map(v => base - v);
    console.log(`  ${n.padEnd(24)} base ${base.toFixed(0)}  ·  calo massimo ${Math.max(...cali).toFixed(0)}  ·  eventi ${ev.length}`);
    if (ev.length) controlliRotti++;
  }
  if (controlliRotti) {
    console.log('\n  UNA SONDA DI CONTROLLO SI E\' ACCESA. Quello che segue non e\' una misura');
    console.log('  dei tasti: e\' rumore. Rimisurare la geometria prima di credere a un numero.');
    process.exit(1);
  }
  console.log('  mute. La soglia ' + CALO_ALTO + ' e\' quindi sopra il rumore, non dentro.\n');

  /* --- le pressioni --- */
  console.log('--- PRESSIONI (il simbolo si riempie di scuro) ---');
  const tutte = [];
  for (const n of Object.keys(anelli)) {
    const { base, ev } = eventi(B.serie.get(n), buono);
    const cali = B.serie.get(n).filter((_, f) => buono[f]).map(v => base - v);
    const dur = ev.map(e => e[1] - e[0] + 1);
    console.log(`  ${n.padEnd(11)} base ${base.toFixed(0)}  ·  calo max ${Math.max(...cali).toFixed(0)}  ·  pressioni ${String(ev.length).padStart(3)}` +
      (ev.length ? `  ·  tenuta mediana ${mediana(dur)} fr (${(mediana(dur) / 30 * 1000).toFixed(0)} ms), p95 ${pct(dur, .95)} fr, max ${Math.max(...dur)} fr` : ''));
    for (const e of ev) tutte.push({ nome: n, T: e[0], fine: e[1], tenuta: e[1] - e[0] + 1 });
  }
  tutte.sort((a, b) => a.T - b.T);
  console.log(`  totale ${tutte.length} pressioni in ${(NF / 30).toFixed(0)} s di video`);
  if (SABOTA) {
    console.log('\n  CON IL SABOTAGGIO le sonde stanno sul corpo liscio. Se il numero qui sopra');
    console.log('  non e\' crollato quasi a zero, lo strumento non misura i tasti.');
    process.exit(0);
  }

  /* --- intervalli fra pressioni consecutive --- */
  const gap = []; for (let i = 1; i < tutte.length; i++) if (buono[tutte[i].T]) gap.push(tutte[i].T - tutte[i - 1].T);
  console.log(`\n--- INTERVALLO FRA PRESSIONI CONSECUTIVE (qualunque tasto) ---`);
  console.log(`  mediana ${mediana(gap)} fr (${(mediana(gap) / 30 * 1000).toFixed(0)} ms)  ·  p05 ${pct(gap, .05)} fr  ·  p95 ${pct(gap, .95)} fr  ·  n=${gap.length}`);

  /* --- il contatto col pallone --- */
  console.log('\n--- DALLA PRESSIONE AL PALLONE CHE PARTE ---');
  const vel = B.cam.map(c => Math.hypot(c[0], c[1]));
  console.log(`  moto della telecamera stimato: mediana ${mediana(vel).toFixed(1)} px/fr, p95 ${pct(vel, .95).toFixed(1)}, max ${Math.max(...vel).toFixed(1)}`);
  const colpi = trovaColpi(B.cand, B.cam);
  console.log(`  colpi sul pallone riconosciuti in tutto il video: ${colpi.length}`);
  const veroR = accoppia(colpi, tutte, 0, NF);
  const nulli = SFASAMENTI.map(s => accoppia(colpi, tutte, s, NF));
  const mN = nulli.reduce((a, b) => a + b.length, 0) / nulli.length;
  const sdN = Math.sqrt(nulli.reduce((a, b) => a + (b.length - mN) ** 2, 0) / nulli.length) || 1;
  const z = (veroR.length - mN) / sdN;
  console.log(`  colpi spiegati da una pressione nei ${FINESTRA} fotogrammi precedenti: ${veroR.length}/${colpi.length} (${(veroR.length / colpi.length * 100).toFixed(0)}%)`);
  console.log(`  PROVA IN BIANCO — le stesse pressioni spostate nel tempo di ${SFASAMENTI.join(', ')} fotogrammi:`);
  console.log(`    accoppiati per caso: ${nulli.map(n => n.length).join(', ')}  ·  media ${mN.toFixed(1)}  ·  scarto ${sdN.toFixed(1)}`);
  console.log(`    il vero supera il caso di z = ${z.toFixed(1)}`);
  if (z < 3) {
    console.log('\n  IL LEGAME NON SI DISTINGUE DAL CASO. Con una pressione ogni ' + Math.round(NF / tutte.length) + ' fotogrammi');
    console.log('  e una finestra di ' + FINESTRA + ', quasi ogni colpo trova per caso una pressione che lo precede.');
    console.log('  NON scrivo una mediana del ritardo: sarebbe un numero senza misura dietro.');
    console.log('  Quello che manca e\' il riconoscimento del pallone: in un 640x360 a 332 kbit/s la');
    console.log('  palla e\' un batuffolo di 3-5 px in mezzo a una quindicina di calzettoni bianchi,');
    console.log('  e i colpi trovati sono ' + colpi.length + ' contro le ' + tutte.length + ' pressioni: ne manca la maggior parte.');
    console.log('  Per avere questo numero serve un video piu\' grande, non un\'altra soglia.');
  } else {
    console.log(`  ritardo: mediana ${mediana(veroR)} fr = ${(mediana(veroR) / 30 * 1000).toFixed(0)} ms  ·  p05 ${pct(veroR, .05)} fr  ·  p95 ${pct(veroR, .95)} fr = ${(pct(veroR, .95) / 30 * 1000).toFixed(0)} ms  ·  n=${veroR.length}`);
    const istog = {}; for (const r of veroR) istog[r] = (istog[r] || 0) + 1;
    console.log('  distribuzione (fotogrammi -> quante volte): ' + Object.keys(istog).sort((a, b) => a - b).map(k => k + ':' + istog[k]).join(' '));
  }

  const fuori = { video: path.basename(VIDEO), nFrame: NF, fps: 30, buoni: nBuoni, pressioni: tutte };
  fs.mkdirSync(path.resolve(__dirname, '..', 'fuori'), { recursive: true });
  const dest = path.resolve(__dirname, '..', 'fuori', '_video-tempi.json');
  fs.writeFileSync(dest, JSON.stringify(fuori, null, 1));
  console.log('\ndati completi in ' + dest);

  if (PROVE) {
    const casi = [];
    for (const n of Object.keys(anelli)) { const c = tutte.filter(p => p.nome === n); for (const k of [0, 1, 2]) if (c[k]) casi.push(c[k]); }
    
    salvaProve(path.resolve(PROVE), casi);
    console.log('fotogrammi di prova in ' + path.resolve(PROVE) + ' (' + casi.length + ' casi)');
  }
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(1); });
