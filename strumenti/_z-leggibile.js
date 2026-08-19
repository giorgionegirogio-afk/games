/* =====================================================================
   _z-leggibile.js — SOLA MISURA, senza browser. Rilegge il crudo di
   _z-verbo(-prova).js e i due file di gioco, e non tocca niente.

   RISPONDE A DUE DOMANDE, e tiene separate le risposte.

   1) LA REGOLA DI _z-rotazione.js, PAROLA PER PAROLA:
          px_sagittali = dz_med(clip) · (hPx/1,9) · |sin(imbardata)|
      illeggibile quando sta sotto la larghezza del tratto. E' la regola
      con cui e' stato trovato il difetto e va rifatta identica, anche —
      soprattutto — se il numero peggiora.
      MA VA LETTA PER QUELLO CHE E': misura QUANTA ESTENSIONE SAGITTALE
      SI PERDE, non se il gesto si legge. Una posa che sull'asse
      sagittale non mette quasi niente non ha quasi niente da perdere, e
      la regola la marca illeggibile lo stesso. Lo si vede gia' nel
      referto del 18 agosto, dove `cielo` e `pugno` sono marcati NO
      (8,0 e 5,5 px sagittali contro un tratto di 11) mentre la stessa
      tabella li da' leggibili a qualunque imbardata. Chi legge solo
      questo numero conclude il contrario di quello che vede.

   2) LA PROPRIETA' CHE SOPRAVVIVE A OGNI IMBARDATA: la SIMMETRIA
      BILATERALE della sagoma proiettata (IoU della maschera con la
      propria immagine speculare attorno al baricentro). Sopravvive
      perche' il ribaltamento z -> -z la specchia e basta, e perche' non
      dipende dalla scala. Una figura ERETTA e' simmetrica; un corpo in
      volo non lo e'. Qui la simmetria si pesa con l'ISTOGRAMMA VERO
      delle imbardate letto dal crudo, non con imbardate scelte a mano.

   LA SAGOMA E' APPROSSIMATA A CAPSULE, e va detto: le ossa diventano
   segmenti spessi e la testa un cerchio, con la STESSA proiezione di
   Rig3D.disegna (righe 5435-5441 del gioco). Non e' il disegno vero —
   niente kit, niente calotte, niente contorni — quindi serve a
   ORDINARE due pose, non a certificarne una. La certificazione e' il
   provino cieco su _pose-tuffo.png.

   uso:
     node strumenti/_z-leggibile.js --prima-gioco a.html --prima-crudo a.json \
                                    --dopo-gioco  b.html --dopo-crudo  b.json
   ===================================================================== */
const fs = require('fs');
const path = require('path');

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}

/* ---- il modulo Rig3D estratto dall'HTML e valutato qui, senza DOM ---- */
function caricaRig(file) {
  const t = fs.readFileSync(file, 'utf8');
  const a = t.indexOf('const Rig3D = (function(){');
  if (a < 0) throw new Error('inizio Rig3D non trovato in ' + file);
  let b = t.indexOf('tagli:()=>TAGLI, azzeraTagli:()=>{TAGLI=0;}}};');
  if (b < 0) throw new Error('fine Rig3D non trovata in ' + file);
  b = t.indexOf('})();', b) + 5;
  const preludio = 'const RPALLA = 0.11;\n' +
    'const document = { createElement: () => ({ getContext: () => null, width:0, height:0 }) };\n';
  return new Function(preludio + t.slice(a, b) + '\n; return Rig3D;')();
}

const CE = Math.cos(42 * Math.PI / 180), SE = Math.sin(42 * Math.PI / 180);
const SPESS = { busto: 0.30, 'pelvi-torace': 0.30, 'torace-collo': 0.26, collo: 0.12,
  spalle: 0.24, fianchi: 0.24, braccioR: 0.115, avambraccioR: 0.10, braccioL: 0.115,
  avambraccioL: 0.10, cosciaR: 0.155, tibiaR: 0.125, piedeR: 0.10, cosciaL: 0.155,
  tibiaL: 0.125, piedeL: 0.10 };
const W = 128, H = 128, CX = 64, CY = 104;

function maschera(R, clip, u, yaw, corp, S) {
  const B = R.banco;
  B.corpora(corp, 0); B.posa(clip, u);
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const p = [];
  for (let j = 0; j < B.NJ; j++) {
    const x = B.P[j * 3], y = B.P[j * 3 + 1], z = B.P[j * 3 + 2];
    const xw = x * cy + z * sy, zw = z * cy - x * sy;
    p.push([xw, -(y * CE + zw * SE)]);
  }
  const seg = [];
  for (const o of B.OSSA) seg.push([p[o.a], p[o.b], (SPESS[o.n] || 0.1) / 2]);
  seg.push([p[3], p[3], B.testa()]);
  const m = new Uint8Array(W * H);
  for (const [a, b, r] of seg) {
    const ax = CX + a[0] * S, ay = CY + a[1] * S, bx = CX + b[0] * S, by = CY + b[1] * S, rr = r * S;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - rr)), x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx) + rr));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by) - rr)), y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by) + rr));
    const dx = bx - ax, dy = by - ay, dd = dx * dx + dy * dy;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      let t = dd > 1e-9 ? ((x - ax) * dx + (y - ay) * dy) / dd : 0;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      const qx = ax + t * dx - x, qy = ay + t * dy - y;
      if (qx * qx + qy * qy <= rr * rr) m[y * W + x] = 1;
    }
  }
  return m;
}
const iou = (a, b) => { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { const p = a[k], q = b[k]; if (p | q) { u++; if (p & q) i++; } } return u ? i / u : 1; };
function simmetria(m) {
  let sx = 0, n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m[y * W + x]) { sx += x; n++; }
  if (!n) return NaN;
  const cx = Math.round(sx / n);
  let i = 0, un = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const xs = 2 * cx - x; if (xs < 0 || xs >= W) continue;
    const a = m[y * W + x], b = m[y * W + xs];
    if (a | b) { un++; if (a & b) i++; }
  }
  return un ? i / un : NaN;
}

const quart = (a, q) => { if (!a.length) return NaN; const b = a.slice().sort((x, y) => x - y); const i = (b.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };
const f = (x, d) => (isFinite(x) ? x.toFixed(d === undefined ? 2 : d) : '  -');
const VISIBILE = s => s === 'play' || s === 'golden' || s === 'kickoff' || s === 'goal';
const VS = ['tira', 'para', 'crossa', 'scivola', 'esulta', 'rovescia'];

/* ------------------ 1. la regola di _z-rotazione, identica ----------- */
function regolaSagittale(D, nome) {
  const F = D.verbFrame.filter(r => r[6] === 'alto' && VISIBILE(r[7]));
  const O = D.verbOnset.filter(r => r[6] === 'alto' && VISIBILE(r[7]));
  const hRif = quart(D.altAlto.map(r => r[0]), .5);
  const WRIF = (D.spessore && D.spessore.q10) || 11;
  const larg = h => WRIF * h / hRif;
  /* LE DUE SOGLIE DEL REPO NON SONO LA STESSA, e vanno stampate tutte e
     due o i numeri non si confrontano con niente.
       _z-verbo.js      usa W_ARTO COSTANTE (il decile inferiore delle
                        corde piene, 11 px, misurato a hPx mediano);
       _z-rotazione.js  la riscala con hPx, W(h) = 11 · h/hRif.
     Sul verbo `para` le due quasi coincidono (hPx del tuffo ~ hPx
     mediano), su `esulta` no: le esultanze si vedono in scena `goal`,
     dove la figura e' piu' grande, e la soglia riscalata cresce con lei.
     E' la ragione per cui lo stesso repo ha due numeri per `esulta`
     (39,1% e 88,6%): non e' un errore di nessuno dei due, e' la stessa
     regola con due soglie. */
  const conta = (dati, riscala) => {
    let n = 0, sotto = 0; const perV = {};
    for (const r of dati) {
      const e = D.est[r[1]]; if (!e) continue;
      n++;
      const px = e.dz_med * (r[4] / 1.9) * r[3];
      const s = px < (riscala ? larg(r[4]) : WRIF);
      if (s) sotto++;
      const k = perV[r[0]] = perV[r[0]] || { n: 0, s: 0, px: [] };
      k.n++; if (s) k.s++; k.px.push(px);
    }
    return { n, sotto, perV };
  };
  console.log('\n-- ' + nome + ': LA REGOLA SAGITTALE DI _z-rotazione.js, IDENTICA --');
  console.log('   tratto di riferimento ' + WRIF + ' px a hPx ' + f(hRif, 1) + '   dz_med(tuffo) = ' + f(D.est.tuffo.dz_med, 4));
  for (const [et, dati] of [['inizî di verbo', O], ['fotogrammi di verbo', F]]) {
    const a = conta(dati, false), b = conta(dati, true);
    console.log('   ' + et + ': soglia COSTANTE (_z-verbo) ' + a.sotto + '/' + a.n + ' = ' +
      f(a.sotto / a.n * 100, 1) + '%   |   soglia RISCALATA (_z-rotazione) ' + b.sotto + '/' + b.n +
      ' = ' + f(b.sotto / b.n * 100, 1) + '%');
    console.log('       ' + 'verbo'.padEnd(9) + '   costante   riscalata     px sagittali MED');
    for (const v of VS) if (a.perV[v]) console.log('       ' + v.padEnd(9) +
      f(a.perV[v].s / a.perV[v].n * 100, 1).padStart(8) + '%' +
      f(b.perV[v].s / b.perV[v].n * 100, 1).padStart(11) + '%' +
      f(quart(a.perV[v].px, .5), 1).padStart(16) + '   (n=' + a.perV[v].n + ')');
  }
  return { F, O, hRif, WRIF };
}

/* ------------------ 2. la simmetria, pesata sull'istogramma vero ----- */
function pesoImbardate(D, clip) {
  const F = D.verbFrame.filter(r => r[6] === 'alto' && VISIBILE(r[7]) && r[1] === clip);
  const b = new Map();
  for (const r of F) {
    let y = r[2] % (Math.PI * 2); if (y < 0) y += Math.PI * 2;
    const k = Math.round(y / (Math.PI / 12));           // passi di 15 gradi
    b.set(k % 24, (b.get(k % 24) || 0) + 1);
  }
  return { isto: b, n: F.length, hMed: quart(F.map(r => r[4]), .5) };
}

function simmetriaPesata(R, clip, peso, u0, u1, corp, S) {
  let somma = 0, tot = 0;
  const fasi = []; for (let k = 0; k <= 10; k++) fasi.push(u0 + (u1 - u0) * k / 10);
  for (const [k, w] of peso.isto) {
    const yaw = k * Math.PI / 12;
    let s = 0; for (const u of fasi) s += simmetria(maschera(R, clip, u, yaw, corp, S));
    somma += w * s / fasi.length; tot += w;
  }
  return tot ? somma / tot : NaN;
}

function confusionePesata(R, clip, peso, u0, u1, corp, S) {
  const altre = Object.keys(R.CLIPS).filter(c => c !== clip);
  const uA = []; for (let k = 0; k < 12; k++) uA.push(k / 12);
  const yawA = []; for (let k = 0; k < 16; k++) yawA.push(k * Math.PI / 8);
  const banco = [];
  for (const c of altre) for (const u of uA) for (const y of yawA) banco.push(maschera(R, c, u, y, corp, S));
  const fasi = []; for (let k = 0; k <= 6; k++) fasi.push(u0 + (u1 - u0) * k / 6);
  let somma = 0, tot = 0;
  for (const [k, w] of peso.isto) {
    const yaw = k * Math.PI / 12;
    let s = 0;
    for (const u of fasi) {
      const m = maschera(R, clip, u, yaw, corp, S);
      let best = 0; for (const b of banco) { const v = iou(m, b); if (v > best) best = v; }
      s += best;
    }
    somma += w * s / fasi.length; tot += w;
  }
  return tot ? somma / tot : NaN;
}

(async () => {
  const PG = arg('prima-gioco', ''), PC = arg('prima-crudo', '');
  const DG = arg('dopo-gioco', ''), DC = arg('dopo-crudo', '');
  for (const [v, n] of [[PG, 'prima-gioco'], [PC, 'prima-crudo'], [DG, 'dopo-gioco'], [DC, 'dopo-crudo']])
    if (!v || !fs.existsSync(path.resolve(v))) { console.error('FALLITO: manca o non esiste --' + n); process.exit(1); }

  const Dp = JSON.parse(fs.readFileSync(path.resolve(PC), 'utf8'));
  const Dd = JSON.parse(fs.readFileSync(path.resolve(DC), 'utf8'));
  const Rp = caricaRig(path.resolve(PG)), Rd = caricaRig(path.resolve(DG));

  console.log('\n=====================================================================');
  console.log(' _z-leggibile — il verbo `para`, prima e dopo');
  console.log(' prima: ' + path.basename(PG) + '  +  ' + path.basename(PC) + '  (' + Dp.partite + ' partite, seme ' + Dp.seme + ')');
  console.log(' dopo:  ' + path.basename(DG) + '  +  ' + path.basename(DC) + '  (' + Dd.partite + ' partite, seme ' + Dd.seme + ')');
  console.log('=====================================================================');

  /* la partita e' la stessa? se non lo fosse, il confronto non sarebbe appaiato */
  const np = Dp.verbFrame.length, nd = Dd.verbFrame.length;
  const yawUguali = np === nd && Dp.verbFrame.every((r, i) => r[2] === Dd.verbFrame[i][2] && r[4] === Dd.verbFrame[i][4]);
  console.log('\n-- IL CONFRONTO E\' APPAIATO? ---------------------------------------');
  console.log('   fotogrammi di verbo: ' + np + ' contro ' + nd);
  console.log('   ogni imbardata e ogni hPx identici, fotogramma per fotogramma: ' + (yawUguali ? 'SI' : 'NO'));
  if (yawUguali) console.log('   -> la posa non entra nella fisica ne\' nella camera: cambia SOLO il disegno.');
  else console.log('   -> ATTENZIONE: qualcosa oltre la posa e\' cambiato; i due numeri non sono appaiati.');

  console.log('\n-- LE ESTENSIONI DELLA POSA CRUDA (64 fasi, dal banco del rig) ------');
  console.log('   ' + 'clip'.padEnd(11) + '   dz_med          dy_med          dx_med');
  for (const c of ['tuffo', 'parata', 'presa', 'scivolata', 'cielo', 'pugno']) {
    const a = Dp.est[c], b = Dd.est[c];
    const r = (x, y) => f(x, 4).padStart(7) + ' -> ' + f(y, 4).padStart(7);
    console.log('   ' + c.padEnd(11) + '  ' + r(a.dz_med, b.dz_med) + '  ' + r(a.dy_med, b.dy_med) + '  ' +
      (a.dx_med !== undefined ? r(a.dx_med, b.dx_med) : '(non nel crudo)'));
  }

  regolaSagittale(Dp, 'PRIMA');
  regolaSagittale(Dd, 'DOPO');

  const peso = pesoImbardate(Dd, 'tuffo');
  const S = peso.hMed / (1.9 * CE);
  console.log('\n-- 2. LA SIMMETRIA BILATERALE, PESATA SULL\'ISTOGRAMMA VERO ---------');
  console.log('   ' + peso.n + ' fotogrammi di `tuffo`, hPx mediano ' + f(peso.hMed, 1) +
    ' px di periferica, ' + peso.isto.size + ' bidoni di imbardata da 15 gradi.');
  console.log('   finestra di fase u 0,08-0,58, che e\' quella che rigStato mostra (riga 24088).');
  const sp = simmetriaPesata(Rp, 'tuffo', peso, 0.08, 0.58, 2, S);
  const sd = simmetriaPesata(Rd, 'tuffo', peso, 0.08, 0.58, 2, S);
  console.log('\n   simmetria di `tuffo`   PRIMA ' + f(sp, 3) + '   DOPO ' + f(sd, 3) +
    '   (' + (sd < sp ? '-' : '+') + f(Math.abs(sd - sp) / sp * 100, 1) + '%)');
  console.log('\n   e i riferimenti, alle stesse imbardate pesate (gioco di prima):');
  for (const c of ['cielo', 'fermo', 'parata', 'corsa', 'attesaGK', 'scivolata'])
    console.log('     ' + c.padEnd(11) + f(simmetriaPesata(Rp, c, peso, 0.05, 0.95, 2, S), 3));
  console.log('   Una figura ERETTA e\' simmetrica. Il tuffo di prima stava fra `cielo`');
  console.log('   e `fermo`: era disegnato come un uomo in piedi.');

  console.log('\n-- 3. LA CONFUSIONE COL RESTO DEL VOCABOLARIO ----------------------');
  console.log('   IoU con la sagoma piu\' simile fra tutte le altre clip (20 clip x 12');
  console.log('   fasi x 16 imbardate), pesata sulle stesse imbardate. Piu\' basso e\'');
  console.log('   meglio: la figura somiglia meno a qualcos\'altro.');
  const cp = confusionePesata(Rp, 'tuffo', peso, 0.08, 0.58, 2, S);
  const cd = confusionePesata(Rd, 'tuffo', peso, 0.08, 0.58, 2, S);
  console.log('   PRIMA ' + f(cp, 3) + '   DOPO ' + f(cd, 3) + '   (' + (cd < cp ? '-' : '+') +
    f(Math.abs(cd - cp) / cp * 100, 1) + '%)');
  console.log('\n   NESSUNO DI QUESTI DUE NUMERI E\' IL VERDETTO. Sono due ordinamenti su');
  console.log('   sagome a capsule; il verdetto e\' il provino cieco su _pose-tuffo.png.\n');
})();
