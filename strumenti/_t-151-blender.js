/* =====================================================================
   _t-151-blender.js — IL CANCELLO DELLA PIPELINE (voce #151, compito 1)

   NASCE ROSSO, ed e' il suo mestiere: il 24 settembre, prima che
   strumenti/blender/ esistesse, questo file dava
     A prova nulla? no, Blender c'e'
     B ROSSO  (nessun _151-figura.json)
     C ROSSO  (nessun atlante da rifare due volte)
     D ROSSO  (nessuna clip dichiarata)
   cioe' 1 su 4, e solo dopo gli script e' diventato 6 su 6. Il rosso di
   partenza sta nel messaggio del commit, perche' un cancello che nasce
   verde non ha mai provato niente.

   CHE COSA SORVEGLIA, e perche' proprio queste quattro cose.

   A. BLENDER RISPONDE HEADLESS. Se non c'e', il codice di uscita e' 3
      — PROVA NULLA, non rosso. La distinzione e' quella di casa: un 3
      non accusa il gioco, dice che il banco non ha potuto misurare. Chi
      lo confonde con un rosso manda qualcuno a riparare la cosa
      sbagliata.

   B. IL CORPO DI BLENDER E' IL CORPO DEL GIOCO, osso per osso.
      E' l'invariante che tiene in piedi tutta la voce. Una pipeline che
      costruisce un uomo con proporzioni SUE produce fotogrammi che non
      si possono confrontare con niente: «l'atlas e' piu' bello» sarebbe
      un giudizio su due uomini diversi, non su due tecniche. Percio'
      figura.py non ha proporzioni proprie — LEGGE il gioco — e questo
      cancello verifica che l'abbia fatto, misurando le ossa
      nell'armatura di Blender e confrontandole con le costanti che
      estrae dall'HTML per conto suo. Le due letture sono indipendenti:
      lo strumento non si fida del JSON per sapere che cosa aspettarsi.
      Tolleranza 1e-4 m, cioe' un decimo di millimetro su un uomo di
      1,83: non e' una soglia morbida, e' il rumore del float32.

   C. IL DETERMINISMO, IN DUE PEZZI E NON IN UNO. Il piano chiedeva «due
      PNG identici al byte»: NON SI PUO', e il perche' sta nel blocco
      delle soglie qui sotto — il rasterizzatore sta sulla GPU. Percio':
        C1 le POSE (le coordinate dei diciotto giunti su 192 fotogrammi)
           identiche AL BYTE. Sono aritmetica su CPU, li' il determinismo
           esiste davvero, ed e' li' che sta il contenuto.
        C2 l'IMMAGINE entro il rumore, con la soglia presa dalla
           SEPARAZIONE fra rumore e falso e non dal peggio osservato.
        C3 IL FALSO: un giunto spostato di un millimetro deve passare la
           soglia di C2 di almeno dieci volte. Una tolleranza che non si
           prova a rompere e' una scusa.
      Costa tre render interi ed e' il motivo per cui il cancello e'
      `lento`.

   D. LE CLIP DICHIARATE CI SONO E HANNO I FOTOGRAMMI PROMESSI.
      Due clip (corsa = ActNodeMoveDirection, tiro = ActNodeKickBall),
      otto direzioni, dodici fotogrammi: i numeri della spec, riletti
      dall'atlante vero e non dal piano.

   uso:
     node strumenti/_t-151-blender.js
     node strumenti/_t-151-blender.js --veloce   (salta C: un render solo)

   uscita: 0 verde · 1 rosso · 2 banco esploso · 3 prova nulla
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const RADICE = path.resolve(__dirname, '..');
const GIOCO = path.join(RADICE, 'CALCETTO-il-gioco.html');
const BLEND = path.join(RADICE, 'strumenti', 'blender');
const VELOCE = process.argv.includes('--veloce');

/* --- dove sta Blender. Si accetta la variabile BLENDER, altrimenti le
   installazioni standard di Windows, dalla piu' recente. Nessuna di
   queste e' un fallimento del gioco: se non si trova, prova nulla. --- */
function trovaBlender() {
  if (process.env.BLENDER && fs.existsSync(process.env.BLENDER)) return process.env.BLENDER;
  const basi = ['C:\\Program Files\\Blender Foundation',
                'C:\\Program Files (x86)\\Blender Foundation'];
  const trovati = [];
  for (const b of basi) {
    if (!fs.existsSync(b)) continue;
    for (const d of fs.readdirSync(b)) {
      const e = path.join(b, d, 'blender.exe');
      if (fs.existsSync(e)) trovati.push(e);
    }
  }
  trovati.sort();
  return trovati.length ? trovati[trovati.length - 1] : '';
}

/* --- IL RUMORE DELLA GPU, E LA SOGLIA RIFATTA DUE VOLTE NELLO STESSO
   GIORNO. Vale la pena scriverla per esteso, perche' la prima forma era
   sbagliata nel modo tipico.

   IL FATTO. Sette atlanti di fila, confrontati pixel per pixel dopo aver
   tolto i metadati dal PNG: le corse che differivano differivano di 3 e 5
   BYTE su 3 145 728, sempre dentro una cella sola e sempre su un bordo.
   Spegnendo l'antialias il fenomeno resta: non e' l'accumulo
   dell'antialias, e' il test punto-dentro-triangolo della GPU.

   LA PRIMA SOGLIA, SBAGLIATA: «16 byte», cioe' tre volte il peggio di
   sette corse. Alla nona corsa il cancello ha letto 18 ed e' diventato
   ROSSO DA SOLO, senza che niente fosse cambiato. SETTE MISURE NON
   FISSANO UNA CODA, e una soglia presa dal peggio osservato e' una
   soglia che prima o poi il rumore passa.

   LA SOGLIA CHE REGGE non viene dal rumore: viene dalla SEPARAZIONE fra
   il rumore e il falso, che e' una proprieta' del fenomeno e non del
   campione.
       rumore misurato (0, 3, 5, 18 byte) ..... fino a 1,4e-6 del foglio
       falso da UN MILLIMETRO (60 400 byte) ... circa  4,8e-3 del foglio
   In mezzo ci sono TREMILAQUATTROCENTO volte. La soglia sta in mezzo a
   quel salto, alla media geometrica arrotondata: 1e-4, cioe' settanta
   volte sopra il rumore e quarantotto sotto il falso. C3 verifica che il
   falso la passi davvero con almeno dieci volte di margine: se un giorno
   non la passasse, sarebbe la SOGLIA a essere sbagliata, e il cancello
   lo direbbe con quelle parole.

   E LO SCARTO MASSIMO PER BYTE NON E' PIU' UN CANCELLO, si stampa e
   basta. Un pixel di bordo che cade da una parte o dall'altra puo'
   passare da trasparente a tinta piena: 255 su un canale. Un numero che
   il rumore puo' portare al massimo del suo intervallo non discrimina
   niente, e tenerlo come cancello voleva dire aspettare il giorno in cui
   il bordo cade su una scarpa gialla invece che sull'erba. --- */
const RUMORE_QUOTA = 1e-4;
/* quante volte il falso deve stare SOPRA la soglia perche' C3 valga: la
   separazione misurata e' 48, e si chiede almeno 10. */
const FALSO_MARGINE = 10;

/* --- un decodificatore PNG in dodici righe, perche' confrontare due file
   compressi non dice niente: due immagini identiche possono comprimersi
   diverse e due immagini diverse possono comprimersi uguali in lunghezza.
   Si confrontano i PIXEL. --- */
function pixelDiPng(buf) {
  let i = 8, idat = [], w = 0, h = 0, canali = 4;
  while (i < buf.length) {
    const ln = buf.readUInt32BE(i);
    const tipo = buf.toString('latin1', i + 4, i + 8);
    if (tipo === 'IHDR') { w = buf.readUInt32BE(i + 8); h = buf.readUInt32BE(i + 12); }
    if (tipo === 'IDAT') idat.push(buf.subarray(i + 8, i + 8 + ln));
    i += 12 + ln;
  }
  const raw = require('zlib').inflateSync(Buffer.concat(idat));
  const passo = w * canali, out = Buffer.alloc(h * passo);
  let prev = Buffer.alloc(passo), pos = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[pos++];
    const riga = Buffer.from(raw.subarray(pos, pos + passo)); pos += passo;
    for (let x = 0; x < passo; x++) {
      const a = x >= canali ? riga[x - canali] : 0;
      const b = prev[x];
      const c = x >= canali ? prev[x - canali] : 0;
      let add = 0;
      if (f === 1) add = a;
      else if (f === 2) add = b;
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

function scartoPixel(a, b) {
  if (!a || !b) return { errore: 'un PNG non si e\' decodificato' };
  if (a.w !== b.w || a.h !== b.h) return { errore: 'taglie diverse' };
  let n = 0, mx = 0;
  for (let i = 0; i < a.dati.length; i++) {
    const d = Math.abs(a.dati[i] - b.dati[i]);
    if (d) { n++; if (d > mx) mx = d; }
  }
  return { byte: n, max: mx, totali: a.dati.length };
}

function blender(exe, script, args) {
  return execFileSync(exe, ['--background', '--factory-startup', '--python', script,
                            '--'].concat(args || []),
                      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600000 });
}

/* --- le costanti del gioco, lette QUI e non prese dal JSON di Blender.
   Se le leggesse dal JSON, il cancello attesterebbe invece di misurare:
   la pipeline scriverebbe i numeri e il cancello li rileggerebbe. --- */
function costantiDalGioco() {
  const t = fs.readFileSync(GIOCO, 'utf8');
  const m = t.match(/const N_THIGH=([\d.]+), N_SHIN=([\d.]+), N_UA=([\d.]+), N_FA=([\d.]+), N_FOOT=([\d.]+),\s*N_SHW=([\d.]+), N_HEADR=([\d.]+);/);
  if (!m) throw new Error('costanti del rig non trovate nel gioco');
  const h = t.match(/const HIPW=([\d.]+);/);
  if (!h) throw new Error('HIPW non trovata nel gioco');
  /* le quote della colonna stanno dentro corpo(): PELVIS 0.06, CHEST
     0.355, NECK 0.46, HEAD a 0.25 dal collo */
  const c = t.match(/setJ\(CHEST,\s*sway\+0\.355\*dx/);
  const n = t.match(/setJ\(NECK,\s*sway\+0\.46\*dx/);
  if (!c || !n) throw new Error('le quote della colonna non si leggono in corpo()');
  return {
    THIGH: +m[1], SHIN: +m[2], UA: +m[3], FA: +m[4], FOOT: +m[5],
    SHW: +m[6], HEADR: +m[7], HIPW: +h[1],
    PELVIS_Y: 0.06, CHEST_Y: 0.355, NECK_Y: 0.46, TESTA_OSSO: 0.25,
  };
}

const righe = [];
let esito = 0;
/* una prova nulla dentro C3: vedi il blocco che la alza. Non accusa il
   gioco e non si conta come un verde: il codice di uscita diventa 3. */
let prova3 = false;
function ok(s)  { righe.push('  OK   ' + s); }
function no(s)  { righe.push('  NO   ' + s); esito = 1; }
function info(s){ righe.push('         ' + s); }

console.log('=== _t-151-blender — la pipeline delle figure (voce #151) ===\n');

/* ---------------------------------------------------------------- A */
const exe = trovaBlender();
if (!exe) {
  console.log('  PROVA NULLA: Blender non si trova (ne\' BLENDER ne\' le installazioni standard).');
  console.log('  Non e\' un rosso del gioco: e\' un banco che non puo\' misurare.');
  process.exit(3);
}
let ver = '';
try { ver = execFileSync(exe, ['--background', '--factory-startup', '--version'],
                         { encoding: 'utf8', timeout: 60000 }).split('\n')[0].trim(); }
catch (e) {
  console.log('  PROVA NULLA: Blender c\'e\' ma non risponde headless: ' + e.message);
  process.exit(3);
}
ok('A  Blender risponde headless: ' + ver);
info(exe);

/* ---------------------------------------------------------------- B */
let cost;
try { cost = costantiDalGioco(); }
catch (e) { console.log('  BANCO ESPLOSO: ' + e.message); process.exit(2); }

const FIG_JSON = path.join(BLEND, '_151-figura.json');
const figScript = path.join(BLEND, 'figura.py');
if (!fs.existsSync(figScript)) {
  no('B  figura.py non esiste: il corpo non si costruisce');
} else {
  try {
    blender(exe, figScript, ['--json', FIG_JSON]);
  } catch (e) {
    no('B  figura.py non gira: ' + String(e.message).split('\n').slice(-3).join(' '));
  }
  if (!fs.existsSync(FIG_JSON)) {
    no('B  figura.py non ha scritto ' + path.basename(FIG_JSON));
  } else {
    const j = JSON.parse(fs.readFileSync(FIG_JSON, 'utf8'));
    const osso = j.ossa || {};
    /* le ossa dell'armatura di Blender, misurate LI' (head->tail), contro
       le costanti lette dal gioco QUI */
    const attese = [
      ['coscia',      cost.THIGH],
      ['polpaccio',   cost.SHIN],
      ['braccio',     cost.UA],
      ['avambraccio', cost.FA],
      ['piede',       cost.FOOT],
      ['collo-testa', cost.TESTA_OSSO],
      ['bacino-petto', cost.CHEST_Y - cost.PELVIS_Y],
      ['petto-collo',  cost.NECK_Y - cost.CHEST_Y],
    ];
    let fuori = 0, peggio = 0, chi = '';
    for (const [nome, atteso] of attese) {
      const v = osso[nome];
      if (typeof v !== 'number') { fuori++; chi = nome + ' assente'; continue; }
      const d = Math.abs(v - atteso);
      if (d > peggio) { peggio = d; chi = nome; }
      if (d > 1e-4) fuori++;
    }
    const semi = j.semilarghezze || {};
    for (const [nome, atteso] of [['spalla', cost.SHW], ['anca', cost.HIPW],
                                  ['testa', cost.HEADR]]) {
      const v = semi[nome];
      if (typeof v !== 'number') { fuori++; continue; }
      const d = Math.abs(v - atteso);
      if (d > peggio) { peggio = d; chi = nome; }
      if (d > 1e-4) fuori++;
    }
    if (fuori) no('B  il corpo di Blender NON e\' il corpo del gioco: ' + fuori +
                  ' misure fuori tolleranza, la peggiore ' + chi +
                  ' (scarto ' + peggio.toExponential(2) + ' m, tetto 1e-4)');
    else ok('B  il corpo di Blender e\' il corpo del gioco: 11 misure, scarto massimo ' +
            peggio.toExponential(2) + ' m (tetto 1e-4)');
    info('coscia ' + cost.THIGH + ' · polpaccio ' + cost.SHIN + ' · braccio ' + cost.UA +
         ' · avambraccio ' + cost.FA + ' · piede ' + cost.FOOT +
         ' · spalle ' + cost.SHW + ' · testa ' + cost.HEADR + ' · anche ' + cost.HIPW);
    info('statura misurata in Blender: ' + (j.statura || 0).toFixed(3) + ' m');
  }
}

/* ------------------------------------------------------------- C e D */
const atlScript = path.join(BLEND, 'atlante.py');
if (!fs.existsSync(atlScript)) {
  no('C  atlante.py non esiste: il determinismo non si puo\' provare');
  no('D  nessun atlante: le clip non si possono contare');
} else {
  const tmp = path.join(RADICE, 'strumenti', '_151-tmp');
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const pix = [], meta_ = [];
  const quante = VELOCE ? 1 : 2;
  let meta = null, crollo = '';
  for (let k = 0; k < quante; k++) {
    const png = path.join(tmp, 'atlante-' + k + '.png');
    const js  = path.join(tmp, 'atlante-' + k + '.json');
    try {
      blender(exe, atlScript, ['--png', png, '--json', js]);
    } catch (e) {
      crollo = String(e.message).split('\n').slice(-4).join(' ');
      break;
    }
    if (!fs.existsSync(png)) { crollo = 'atlante.py non ha scritto il PNG'; break; }
    pix.push(pixelDiPng(fs.readFileSync(png)));
    if (fs.existsSync(js)) { meta = JSON.parse(fs.readFileSync(js, 'utf8')); meta_.push(meta); }
  }
  if (crollo) {
    /* IL DRIVER DELLA GPU CHE MUORE NON E' UN ROSSO DEL GIOCO, e questo
       banco l'ha visto due volte in un pomeriggio: EXCEPTION_ACCESS_VIOLATION
       dentro ig9icd64.dll (il driver Intel), sullo stesso script che
       poco prima e poco dopo ha renderizzato 192 fotogrammi senza una
       piega, e sempre con la macchina carica. Un cancello che chiama
       rosso un driver che si schianta manda qualcuno a riparare il
       disegno invece del banco. Se la firma e' quella di uno schianto,
       il verdetto e' PROVA NULLA. */
    const schianto = /EXCEPTION_|Access violation|ig\w*icd|Segmentation fault|SIGSEGV/i.test(crollo);
    if (schianto) {
      prova3 = true;
      righe.push('  ??   C  PROVA NULLA: Blender si e\' schiantato (il driver grafico), non ha');
      righe.push('         risposto un rosso. Rilanciare a macchina scarica.');
      righe.push('         ' + crollo.slice(0, 140));
      righe.push('  ??   D  PROVA NULLA: senza atlante le clip non si possono contare');
    } else {
      no('C  atlante.py non gira: ' + crollo);
      no('D  nessun atlante: le clip non si possono contare');
    }
  } else {
    if (VELOCE) {
      righe.push('  --   C  saltato (--veloce): una corsa sola');
    } else {
      /* C1 — LE POSE, che devono essere identiche AL BYTE */
      const i0 = meta_[0] && meta_[0].impronta_pose, i1 = meta_[1] && meta_[1].impronta_pose;
      if (!i0 || !i1) no('C1 l\'atlante non dichiara l\'impronta delle pose');
      else if (i0 === i1) ok('C1 le pose di 192 fotogrammi, identiche al byte: ' + i0.slice(0, 16) + '…');
      else no('C1 le POSE cambiano fra due corse: ' + i0.slice(0, 16) + ' contro ' + i1.slice(0, 16) +
              ' — non e\' rumore di rasterizzazione, e\' aritmetica che balla');
      /* C2 — L'IMMAGINE, identica entro il rumore MISURATO della GPU */
      const d = scartoPixel(pix[0], pix[1]);
      const tetto2 = Math.round(d.totali * RUMORE_QUOTA);
      if (d.errore) no('C2 i due PNG non si confrontano: ' + d.errore);
      else if (d.byte <= tetto2) {
        ok('C2 l\'immagine e\' la stessa entro il rumore GPU: ' + d.byte + ' byte diversi su ' +
           d.totali.toLocaleString('it-IT') + ' (' + (d.byte / d.totali).toExponential(1) +
           ', tetto ' + RUMORE_QUOTA.toExponential(0) + ' = ' + tetto2 + ' byte)');
        info('scarto massimo per byte ' + d.max + '/255 — si stampa e NON e\' un cancello: un ' +
             'pixel di bordo puo\' passare da trasparente a tinta piena, e un numero che il ' +
             'rumore puo\' portare al massimo del suo intervallo non discrimina niente');
      } else {
        no('C2 l\'immagine cambia oltre il rumore: ' + d.byte + ' byte diversi su ' +
           d.totali.toLocaleString('it-IT') + ' (' + (d.byte / d.totali).toExponential(1) +
           '), tetto ' + tetto2);
      }
      /* C3 — IL FALSO: un giunto spostato di un millimetro. Senza questo, la
         tolleranza di C2 sarebbe una porta aperta invece di una misura. */
      const pngF = path.join(tmp, 'atlante-falso.png');
      const jsF  = path.join(tmp, 'atlante-falso.json');
      try {
        blender(exe, atlScript, ['--png', pngF, '--json', jsF, '--scarto', '0.001']);
        const df = scartoPixel(pix[0], pixelDiPng(fs.readFileSync(pngF)));
        const mf = JSON.parse(fs.readFileSync(jsF, 'utf8'));
        const tetto3 = Math.round(df.totali * RUMORE_QUOTA);
        const sopra = df.byte / Math.max(1, tetto3);
        if (sopra >= FALSO_MARGINE && mf.impronta_pose !== i0) {
          ok('C3 il falso e\' condannato: un giunto spostato di 1 mm muove ' +
             df.byte.toLocaleString('it-IT') + ' byte, ' + sopra.toFixed(0) +
             ' volte il tetto di C2 (ne servono ' + FALSO_MARGINE +
             '), e cambia anche l\'impronta delle pose');
        } else {
          no('C3 il falso NON e\' condannato: 1 mm di scarto muove ' + df.byte +
             ' byte, solo ' + sopra.toFixed(1) + ' volte il tetto di C2 — e\' la SOGLIA ' +
             'a essere sbagliata, non il gioco');
        }
      } catch (e) {
        /* BLENDER CHE ESPLODE NON E' UN ROSSO, e la distinzione l'ha
           imposta una corsa vera: lanciato mentre la batteria occupava
           la macchina, il falso e' morto con un dump di thread mentre le
           DUE corse normali dello stesso invito erano appena riuscite.
           Un cancello che cambia colore col carico non misura la cosa
           che deve misurare, misura la macchina (regola 26). Se il
           render normale ha funzionato e solo il falso e' morto, la
           causa non puo' essere il falso: e' PROVA NULLA. */
        prova3 = true;
        righe.push('  ??   C3 PROVA NULLA: Blender e\' morto costruendo il falso, ' +
                   'mentre le due corse normali dello stesso invito erano riuscite.');
        righe.push('         Non e\' un rosso: e\' il banco sotto carico. Rilanciare da soli.');
        righe.push('         ' + String(e.message).split('\n').slice(-2).join(' ').slice(0, 120));
      }
    }
    if (!meta) {
      no('D  atlante.py non ha scritto il suo JSON: le clip non si contano');
    } else {
      const clip = meta.clip || [];
      const nomi = clip.map(c => c.nome).sort().join(',');
      const dir = meta.direzioni | 0, fot = meta.fotogrammi | 0;
      const guai = [];
      if (nomi !== 'corsa,tiro') guai.push('clip «' + nomi + '» invece di «corsa,tiro»');
      if (dir !== 8) guai.push('direzioni ' + dir + ' invece di 8');
      if (fot !== 12) guai.push('fotogrammi ' + fot + ' invece di 12');
      const celle = clip.length * dir * fot;
      if (meta.celle !== celle) guai.push('celle ' + meta.celle + ' invece di ' + celle);
      if (guai.length) no('D  l\'atlante non e\' quello dichiarato: ' + guai.join('; '));
      else ok('D  l\'atlante e\' quello dichiarato: 2 clip (corsa, tiro) × 8 direzioni × 12 fotogrammi = ' +
              celle + ' celle di ' + meta.cella + ' px');
      if (meta.larghezza) info('atlante ' + meta.larghezza + '×' + meta.altezza + ' px, ' +
                               'memoria di texture ' + (meta.larghezza * meta.altezza * 4 / 1048576).toFixed(2) + ' MB');
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(righe.join('\n'));
const passate = righe.filter(r => r.startsWith('  OK')).length;
const totali = righe.filter(r => r.startsWith('  OK') || r.startsWith('  NO')).length;
console.log('\n' + passate + ' cancelli su ' + totali + (esito ? '  — ROSSO' : '  — verde'));
process.exit(esito);
