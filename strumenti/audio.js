/* =====================================================================
   AUDIO — il cancello del suono.

   PERCHE' ESISTE, e la ragione e' scritta nera su bianco nel censimento
   del 20 agosto (`_analisi/COSA-MANCA.md` §3.8.1): «l'audio: 11
   oscillatori, un LFO per il boato, il coro legato al negozio — e
   nessuno strumento della casa lo nomina. Se ogni calcio diventasse
   muto, la batteria uscirebbe verde 13 su 13». Questo file toglie quel
   punto cieco.

   COSA MISURA, e come, senza toccare un byte del gioco.
   Il gioco non ha campioni audio: sintetizza tutto con WebAudio (ottima
   notizia per i diritti, e va scritta: zero file audio nell'APK, zero
   melodie di terzi). Ogni suono e' quindi un GRAFO di nodi — oscillatori,
   filtri, guadagni — costruito al volo con dei parametri. Quel grafo e'
   un'impronta digitale: se domani qualcuno cambia il suono del gol,
   l'impronta cambia e questo cancello lo dice.

   La sonda si installa PRIMA che la pagina carichi (addInitScript) e
   avvolge tre cose del browser, non del gioco:
     · i metodi create* di BaseAudioContext  -> annota ogni nodo creato;
     · i metodi di AudioParam (piu' il setter di .value) -> annota ogni
       automazione, col suo scarto dall'ADESSO del momento della chiamata,
       cosi' la firma non dipende da QUANDO la prova gira;
     · AudioNode.connect -> annota il grafo, e quando un nodo si attacca
       all'uscita lo devia dentro un ANALIZZATORE nostro che poi va
       all'uscita vera. Da li' si legge il suono VERO, in ampiezza.
   Misurato il 20 agosto: chromium headless RENDE davvero il grafo
   (un'onda quadra a guadagno 0,5 legge picco 0,495), quindi qui non si
   deduce la sonorita' dai parametri: si ascolta.

   LE QUATTRO COSE CHE SORVEGLIA
     A · OGNI VOCE SUONA. Le 17 voci di Audio5, invocate una per una,
         devono creare nodi e devono farsi SENTIRE sopra il fondo di
         rumore misurato nello stesso minuto. Zero suono = rosso.
     B · LE VOCI SONO DISTINTE, RIPETIBILI E UGUALI A IERI. Due voci con
         la stessa identica firma vogliono dire che una delle due e'
         sbagliata (il calcio che suona come il gol non e' un gioco, e'
         un difetto). Una firma che cambia fra due chiamate di fila vuol
         dire che il cancello non e' credibile e va riparato lui. Una
         firma diversa da quella registrata vuol dire che qualcuno ha
         cambiato un suono: se e' voluto si riscrive il registro con
         --registra, se non lo e' si e' appena scoperto un guasto che
         nessuno avrebbe visto.
     C · GLI EVENTI DEL GIOCO CHIAMANO LA LORO VOCE. La firma da sola non
         basta: dice che il sintetizzatore funziona, non che il gol lo
         chiami. Qui si provocano gli eventi veri — fischio d'inizio,
         gol, fischio finale, calcio, palo, parata, interfaccia, rigori —
         e si guarda quali voci partono davvero.
     D · IL VOLUME OBBEDISCE. Si preme il comando VERO dell'utente
         (#btnSetAudio) e il suono deve sparire davvero all'uscita, non
         solo cambiare una variabile. E deve restare spento nel
         salvataggio.
     E · A GIOCO NASCOSTO L'AUDIO TACE. Questa oggi e' ROSSA, ed e' il
         difetto che il cancello nasce per dire: vedi la nota in fondo.

   IL CONTROLLO NEGATIVO E' DENTRO LO STRUMENTO. `--controllo-negativo`
   copia il gioco FUORI dal repo, gli toglie il suono del gol, rilancia
   questo stesso cancello su quella copia e pretende che esca ROSSO. Uno
   strumento che nessuno ha visto fallire non e' uno strumento.

   COSA NON MISURA, e va detto:
     · la QUALITA' del suono (se il fischietto sembra un fischietto): non
       e' misurabile da una macchina, ci vuole un orecchio;
     · il suono sul TELEFONO vero: qui c'e' chromium su un banco, e la
       WebView Android puo' avere politiche di autoplay diverse;
     · il MIXAGGIO (nessuna separazione musica/effetti esiste nel gioco:
       c'e' un solo master e un interruttore acceso/spento, senza cursore
       di volume — e' un fatto d'inventario, non un rosso di questo
       cancello).

   uso:
     node strumenti/audio.js
     node strumenti/audio.js --gioco copia.html     misura QUEL file
     node strumenti/audio.js --nota-aperta nascosto  la E resta una nota
                                                     invece che un rosso
     node strumenti/audio.js --controllo-negativo    si rompe da solo e
                                                     pretende il rosso
     node strumenti/audio.js --registra              fissa le firme di oggi
                                                     come riferimento
     node strumenti/audio.js --verboso               stampa le firme intere

   CODICI DI USCITA (quelli di casa):
     0 verde · 1 il gioco e' rosso · 2 il banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const ARGV = process.argv.slice(2);
const ha = n => ARGV.includes('--' + n);
function arg(n, d) {
  const i = ARGV.indexOf('--' + n);
  return i >= 0 && ARGV[i + 1] && !ARGV[i + 1].startsWith('--') ? ARGV[i + 1] : d;
}

/* IL GIOCO PUO' ARRIVARE DA FUORI. Serve al controllo negativo (una copia
   sabotata fuori dal repo) e alla bisezione. Un percorso cablato ha gia'
   fatto sbagliare una misura in questa casa. */
const GIOCO_FUORI = (() => {
  const v = arg('gioco', process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + a); process.exit(3); }
  return a;
})();
const GIOCO = GIOCO_FUORI || path.join(RADICE, 'CALCETTO-il-gioco.html');
/* IL SEME. Il gioco usa Math.random per la fisica e per la CPU: senza un
   seme fisso la parte C (gli eventi provocati in partita) darebbe numeri
   diversi a ogni corsa, e un cancello che balla viene disattivato. Qui
   Math.random viene sostituito da fuori, PRIMA del caricamento, con un
   generatore a stato (xorshift32) — il gioco non se ne accorge e la
   partita e' la stessa a ogni esecuzione. */
const SEME = (+arg('seme', 20260820) | 0) >>> 0 || 20260820;
const VERBOSO = ha('verboso');
const NOTE_APERTE = String(arg('nota-aperta', '')).split(',').map(s => s.trim()).filter(Boolean);

/* =====================================================================
   IL CONTROLLO NEGATIVO, DENTRO LO STRUMENTO.

   La regola di casa: uno strumento che non e' stato visto FALLIRE non e'
   uno strumento. Qui il cancello si rompe da solo. Copia il gioco in una
   cartella temporanea FUORI dal repo (il file del repo non viene
   sfiorato: si legge e basta), gli toglie il suono del gol — la riga
   `Audio5.net(); Audio5.roar();` dentro addGoal — e rilancia se stesso su
   quella copia. Se il cancello NON esce rosso, il cancello e' finto, e
   allora e' LUI a essere bocciato.

   Tre sabotaggi, uno per famiglia di controllo:
     gol        toglie la voce del gol      -> deve cadere la parte 3
     muto       fa mentire l'interruttore   -> deve cadere la parte 4
     doppione   fa suonare il calcio come   -> deve cadere la parte 2
                il gol
   ===================================================================== */
const SABOTAGGI = {
  gol: {
    cerca: 'Audio5.net(); Audio5.roar();',
    metti: '/* SABOTATO DAL CONTROLLO NEGATIVO: il gol e\' muto */',
    rompe: 'la parte 3 (il gol non chiama piu\' net e roar)',
  },
  muto: {
    cerca: 'if(this.master) this.master.gain.value = m?0:1;',
    metti: 'if(this.master) this.master.gain.value = m?0.35:1;   /* SABOTATO: OFF che non spegne */',
    rompe: 'la parte 4 (a AUDIO: OFF si sente ancora)',
  },
  /* IL SABOTAGGIO PIU' IMPORTANTE, perche' e' l'unico che nessun altro
     controllo puo' prendere: il gol continua a suonare, e' udibile, e'
     distinto da tutti gli altri — semplicemente NON E' PIU' QUELLO. Una
     nota della trombetta spostata di undici hertz. Se il registro delle
     firme non lo vede, la promessa «se qualcuno rompe il suono del gol
     il cancello lo dice» e' falsa. */
  timbro: {
    cerca: 'o.frequency.setValueAtTime(233,t+0.25);',
    metti: 'o.frequency.setValueAtTime(244,t+0.25);  /* SABOTATO: la trombetta del gol e\' un\'altra */',
    rompe: 'la parte 2 (la firma del boato non e\' piu\' quella registrata)',
  },
  doppione: {
    cerca: '  /* calcio: thump di rumore filtrato passa-basso */\n  kick(pow){',
    metti: '  /* calcio: SABOTATO, e\' diventato il boato del gol */\n  kick(pow){ return this.roar(); }, /* eslint-disable-line */\n  kickVecchio(pow){',
    rompe: 'la parte 2 (calcio e gol hanno la stessa firma)',
  },
};

async function controlloNegativo() {
  const { spawnSync } = require('child_process');
  const testo = fs.readFileSync(GIOCO, 'utf8');
  const tana = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-controllo-'));
  console.log('CONTROLLO NEGATIVO del cancello dell\'audio');
  console.log('copie sabotate in: ' + tana + '   (il file del repo non viene toccato)\n');
  let tutteRosse = true;
  for (const [nome, S] of Object.entries(SABOTAGGI)) {
    const dove = testo.indexOf(S.cerca);
    if (dove < 0) {
      console.log('  ??   sabotaggio «' + nome + '»: l\'ancoraggio non c\'e\' piu\' nel gioco. NON MISURATO — ' +
        'il testo cercato era:\n         ' + JSON.stringify(S.cerca.slice(0, 70)));
      tutteRosse = false; continue;
    }
    const copia = path.join(tana, 'CALCETTO-' + nome + '.html');
    fs.writeFileSync(copia, testo.slice(0, dove) + S.metti + testo.slice(dove + S.cerca.length));
    const r = spawnSync(process.execPath, [__filename, '--gioco', copia, '--nota-aperta', 'nascosto'],
      { cwd: RADICE, encoding: 'utf8', windowsHide: true, timeout: 300000 });
    const uscita = r.status;
    /* si riporta la riga NO E la sua nota, che e' quella che dice COSA
       e' cambiato: senza, il referto del controllo negativo dice che il
       cancello e' rosso ma non fa vedere che ha capito la ragione */
    const tutte = String(r.stdout || '').split(/\r?\n/);
    const righe = [];
    for (let i = 0; i < tutte.length; i++) {
      if (!/^\s*NO\s/.test(tutte[i])) continue;
      righe.push(tutte[i].trim());
      if (tutte[i + 1] && /^\s{7,}\S/.test(tutte[i + 1])) righe.push('    ' + tutte[i + 1].trim());
    }
    const rosso = uscita === 1;
    if (!rosso) tutteRosse = false;
    console.log((rosso ? '  OK   ' : '  NO   ') + 'sabotaggio «' + nome + '» -> uscita ' + uscita +
      ' (atteso 1 = rosso); doveva cadere ' + S.rompe);
    for (const l of righe.slice(0, 6)) console.log('         ' + l);
    if (!righe.length && !rosso) console.log('         ' + String(r.stdout || r.stderr || '').split(/\r?\n/).slice(-6).join('\n         '));
  }
  const n = Object.keys(SABOTAGGI).length;
  console.log('\n' + (tutteRosse
    ? 'VERDE: il cancello sa uscire rosso su tutti e ' + n + ' i sabotaggi. E\' uno strumento.'
    : 'ROSSO: il cancello NON sa fallire su almeno uno dei ' + n + ' sabotaggi: non si puo\' credere al suo verde.'));
  process.exit(tutteRosse ? 0 : 1);
}

/* ---------------------------------------------------------------------
   IL SERVER. Playwright non apre file:// (trappola gia' pagata due volte
   in questa casa), quindi il gioco si serve da 127.0.0.1 su porta
   effimera, con no-store per non incontrare mai una copia vecchia.
   --------------------------------------------------------------------- */
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (GIOCO_FUORI && /CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO_FUORI;
      if ((!f.startsWith(RADICE) && f !== GIOCO_FUORI) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* =====================================================================
   LA SONDA. Gira nel browser PRIMA di ogni script del gioco.
   Non tocca il gioco: avvolge il BROWSER.
   ===================================================================== */
function SONDA(seme) {
  /* --- il caso, reso ripetibile. xorshift32: due righe, nessuna
     dipendenza, e la stessa sequenza a ogni corsa. --- */
  let s = seme >>> 0 || 1;
  Math.random = function () {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };

  const R = { ctx: null, tap: null, an: null, nodi: [], auto: [], archi: [], chiamate: [], seq: 0, rotta: null };
  window.__sonda = R;
  const AP = window.AudioParam && window.AudioParam.prototype;
  const AN = window.AudioNode && window.AudioNode.prototype;
  const BA = window.BaseAudioContext ? window.BaseAudioContext.prototype
    : (window.AudioContext && window.AudioContext.prototype);
  if (!AP || !AN || !BA) { R.rotta = 'questo browser non ha WebAudio: non c\'e' + ' niente da misurare'; return; }

  const connect0 = AN.connect;
  const creaGain0 = BA.createGain;
  const creaAn0 = BA.createAnalyser;
  const ora = () => (R.ctx ? R.ctx.currentTime : 0);

  /* LE AUTOMAZIONI DEI PARAMETRI, e qui c'e' la lezione piu' cara di
     questo strumento.

     La prima stesura annotava lo scarto `tempo - ctx.currentTime` letto
     AL MOMENTO della chiamata. Sembrava giusto e non lo era: in Chrome
     `currentTime` avanza a quanti di 128 campioni (2,7 ms a 48 kHz) e
     puo' cambiare DENTRO lo stesso blocco sincrono. Cosi' `t+0.04`
     diventava 0,0373 una volta e 0,0400 la volta dopo, e due corse sullo
     stesso file davano firme diverse per slideS e per la melodia del
     menu. Un cancello che balla e' peggio di nessun cancello: lo si
     spegne la prima volta che sbaglia.

     La cura: si annota il tempo ASSOLUTO cosi' com'e' arrivato, e la
     firma lo rende relativo al PRIMO tempo assoluto della finestra. Ogni
     voce legge `this.ctx.currentTime` UNA volta sola e ci somma degli
     scarti fissi, quindi le differenze fra i suoi tempi sono esatte al
     bit e non dipendono da quando la prova gira. Misurato: due corse di
     fila danno le stesse 17 firme su 17 (parte 2c).

     La colonna del tempo non e' la stessa per tutti i metodi: in
     cancelScheduledValues sta al posto zero, negli altri al posto uno. */
  const POSTO_T = {
    setValueAtTime: 1, linearRampToValueAtTime: 1, exponentialRampToValueAtTime: 1,
    setTargetAtTime: 1, setValueCurveAtTime: 1, cancelScheduledValues: 0, cancelAndHoldAtTime: 0,
  };
  for (const m of Object.keys(POSTO_T)) {
    if (typeof AP[m] !== 'function') continue;
    const o = AP[m]; const it = POSTO_T[m];
    AP[m] = function (...a) {
      R.auto.push({
        nodo: this.__nodo | 0, nome: this.__nome || '?', m,
        v: (it === 1 && typeof a[0] === 'number') ? a[0] : null,
        ta: typeof a[it] === 'number' ? a[it] : null,
        k: typeof a[2] === 'number' ? a[2] : null,
      });
      return o.apply(this, a);
    };
  }
  const dv = Object.getOwnPropertyDescriptor(AP, 'value');
  if (dv && dv.set) {
    Object.defineProperty(AP, 'value', {
      get: dv.get, configurable: true, enumerable: dv.enumerable,
      set: function (v) {
        R.auto.push({ nodo: this.__nodo | 0, nome: this.__nome || '?', m: 'value', v, ta: null, k: null });
        return dv.set.call(this, v);
      },
    });
  }

  /* ogni nodo creato riceve un numero d'ordine e i suoi parametri
     vengono marchiati col nome, cosi' un'automazione sa da chi arriva */
  function marchia(n, tipo) {
    n.__id = ++R.seq; n.__tipo = tipo;
    R.nodi.push({ id: n.__id, tipo, ref: n });
    try {
      for (const k in n) {
        let p; try { p = n[k]; } catch (e) { continue; }
        if (p instanceof window.AudioParam) { p.__nodo = n.__id; p.__nome = k; }
      }
    } catch (e) {}
    return n;
  }
  for (const k of Object.getOwnPropertyNames(BA)) {
    if (!/^create/.test(k) || typeof BA[k] !== 'function') continue;
    const o = BA[k];
    BA[k] = function (...a) {
      if (!R.ctx) R.ctx = this;
      const n = o.apply(this, a);
      return (n && typeof n === 'object') ? marchia(n, k.replace(/^create/, '').toLowerCase()) : n;
    };
  }

  /* IL RUBINETTO. Chi si attacca all'uscita passa da un nostro
     analizzatore: e' l'unico modo di ascoltare il gioco invece di
     dedurne il volume dai parametri. Il nostro nodo NON consuma un
     numero d'ordine (lo creiamo con la funzione originale), se no la
     numerazione del gioco slitterebbe e le firme cambierebbero solo
     perche' c'e' la sonda. */
  AN.connect = function (dest, ...r) {
    let vero = dest;
    if (R.ctx && dest === R.ctx.destination) {
      if (!R.tap) {
        R.tap = creaGain0.call(R.ctx); R.tap.gain.value = 1;
        R.an = creaAn0.call(R.ctx); R.an.fftSize = 2048;
        connect0.call(R.tap, R.an); connect0.call(R.an, R.ctx.destination);
      }
      vero = R.tap;
      R.archi.push({ da: this.__id | 0, a: 'USCITA' });
    } else {
      R.archi.push({
        da: this.__id | 0,
        a: (window.AudioParam && dest instanceof window.AudioParam)
          ? { p: dest.__nodo | 0, n: dest.__nome || '?' } : (dest.__id | 0),
      });
    }
    return connect0.call(this, vero, ...r);
  };

  /* start/stop: quando una sorgente parte e quando smette, in scarto
     dall'adesso. E' la meta' della firma di un suono percussivo. */
  const proto = [];
  if (window.AudioScheduledSourceNode) proto.push(window.AudioScheduledSourceNode.prototype);
  if (window.OscillatorNode) proto.push(window.OscillatorNode.prototype);
  if (window.AudioBufferSourceNode) proto.push(window.AudioBufferSourceNode.prototype);
  for (const P of proto) {
    for (const m of ['start', 'stop']) {
      if (!Object.prototype.hasOwnProperty.call(P, m)) continue;
      const o = P[m];
      P[m] = function (...a) {
        R.auto.push({ nodo: this.__id | 0, nome: '-', m, v: null,
          /* start() senza argomento vuol dire «adesso»: si annota come
             tale invece di leggere l'orologio, che salterebbe di quanto */
          ta: typeof a[0] === 'number' ? a[0] : null, k: null, subito: a.length === 0 });
        return o.apply(this, a);
      };
    }
  }
  /* resume/suspend/close: servono alla parte E (il gioco nascosto) */
  const AC = window.AudioContext && window.AudioContext.prototype;
  if (AC) for (const m of ['resume', 'suspend', 'close']) {
    if (typeof AC[m] !== 'function') continue;
    const o = AC[m];
    AC[m] = function (...a) { R.chiamate.push(m); return o.apply(this, a); };
  }

  /* ---- gli attrezzi che il banco chiama da fuori ---- */
  const num = v => (v === null || v === undefined ? '-' : (Math.abs(v) < 1e-9 ? '0' : (+v).toFixed(4).replace(/0+$/, '').replace(/\.$/, '')));
  R.marca = () => ({ n: R.nodi.length, a: R.auto.length, e: R.archi.length, c: R.chiamate.length });
  R.conta = m => ({ nodi: R.nodi.length - m.n, auto: R.auto.length - m.a, archi: R.archi.length - m.e });
  /* LA FIRMA. Le identita' dei nodi diventano relative alla finestra
     (#0, #1, ...), cosi' due esecuzioni della stessa voce in momenti
     diversi danno la stessa stringa. I nodi nati PRIMA della finestra
     (il master, la folla) restano assoluti con la sigla E<n>: sono
     stabili perche' nascono sempre nello stesso ordine all'init. */
  R.firma = function (m) {
    const nodi = R.nodi.slice(m.n);
    const base = nodi.length ? nodi[0].id : R.seq + 1;
    const eti = id => { const k = id - base; return (k >= 0 && k < nodi.length) ? '#' + k : 'E' + id; };
    const pezzi = [];
    for (const x of nodi) {
      const d = [x.tipo]; const r = x.ref;
      if (typeof r.type === 'string') d.push('t=' + r.type);
      if (typeof r.loop === 'boolean') d.push('loop=' + (r.loop ? 1 : 0));
      if (r.buffer && r.buffer.length) d.push('buf=' + r.buffer.length);
      if (x.tipo === 'buffer' && r.length) d.push('len=' + r.length + 'x' + r.numberOfChannels);
      pezzi.push(eti(x.id) + '{' + d.join(',') + '}');
    }
    /* i tempi si raccontano rispetto al PRIMO tempo assoluto della
       finestra: dentro una voce sono differenze esatte, fra una corsa e
       l'altra sono le stesse. Vedi il verbale sopra POSTO_T. */
    const autos = R.auto.slice(m.a);
    let T0 = null;
    for (const a of autos) if (a.ta !== null && a.ta !== undefined) { T0 = a.ta; break; }
    for (const a of autos)
      pezzi.push(eti(a.nodo) + '.' + a.nome + ' ' + a.m + '(' + num(a.v) +
        (a.subito ? '@subito' : (a.ta === null || a.ta === undefined || T0 === null ? '' : '@' + num(a.ta - T0))) +
        (a.k === null ? '' : '~' + num(a.k)) + ')');
    for (const e of R.archi.slice(m.e))
      pezzi.push(eti(e.da) + '>' + (typeof e.a === 'object' ? 'par:' + eti(e.a.p) + '.' + e.a.n
        : (e.a === 'USCITA' ? 'USCITA' : eti(e.a))));
    return pezzi.join(' | ');
  };
  /* IL PICCO ALL'USCITA. Si legge dal nostro analizzatore, cioe' dopo il
     master: e' esattamente cio' che uscirebbe dall'altoparlante. */
  R.picco = async function (ms) {
    if (!R.an) return -1;
    const buf = new Float32Array(R.an.fftSize);
    let p = 0; const t0 = performance.now();
    do {
      await new Promise(r => setTimeout(r, 18));
      R.an.getFloatTimeDomainData(buf);
      for (let i = 0; i < buf.length; i++) { const v = Math.abs(buf[i]); if (v > p) p = v; }
    } while (performance.now() - t0 < ms);
    return p;
  };
}

/* =====================================================================
   LE VOCI. Ogni riga: nome, come si invoca, e a quale momento del gioco
   appartiene. L'elenco e' esaustivo rispetto all'oggetto Audio5: se
   domani ne nasce una e nessuno la mette qui, la parte A se ne accorge
   (confronta l'elenco con le chiavi vere dell'oggetto).
   ===================================================================== */
const VOCI = [
  { v: 'whistle-corto', ch: 'whistle', a: [false], q: 'fischio d\'inizio, punizione, ripresa' },
  { v: 'whistle-lungo', ch: 'whistle', a: [true], q: 'fischio finale' },
  { v: 'kick-piano', ch: 'kick', a: [0.25], q: 'tocco / passaggio corto' },
  { v: 'kick-forte', ch: 'kick', a: [1], q: 'tiro a piena potenza' },
  { v: 'clack-duro', ch: 'clack', a: [true], q: 'parata, rubata pulita' },
  { v: 'clack-morbido', ch: 'clack', a: [false], q: 'sponda, muro del difensore' },
  { v: 'roar', ch: 'roar', a: [], q: 'boato della folla sul gol' },
  { v: 'post', ch: 'post', a: [], q: 'palo e traversa' },
  { v: 'net', ch: 'net', a: [], q: 'la palla entra in rete' },
  { v: 'slideS', ch: 'slideS', a: [], q: 'scivolata' },
  { v: 'swell', ch: 'swell', a: [], q: 'suspense del duello / rigore' },
  { v: 'perfect', ch: 'perfect', a: [], q: 'tiro perfetto' },
  { v: 'coro', ch: 'coro', a: [], q: 'coro della curva (oggetto del negozio)' },
  { v: 'beep', ch: 'beep', a: [520], q: 'ritorno dell\'interfaccia e degli eventi minori' },
  { v: 'uiTick', ch: 'uiTick', a: [], q: 'click su qualunque bottone' },
  { v: 'tamburo', ch: '_tamb', a: ['ORA', 1], q: 'tamburo della curva (oggetto del negozio)' },
  { v: 'jingle', ch: 'jingleTick', a: [], q: 'melodia del menu' },
];

const breve = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);

/* =====================================================================
   IL REFERTO. Ogni controllo porta il suo esito, il suo peso (se conta
   per il verdetto) e la sua frase.
   ===================================================================== */
const CTRL = [];
function ctrl(sez, ok, testo, conta = true, nota = '') {
  CTRL.push({ sez, ok, testo, conta, nota });
  const tag = ok === null ? '  ??   ' : (ok ? '  OK   ' : (conta ? '  NO   ' : '  --   '));
  console.log(tag + testo + (nota ? '\n         ' + nota : ''));
  return ok;
}

(async () => {
  if (ha('controllo-negativo')) return controlloNegativo();
  const impronta0 = crypto.createHash('md5').update(fs.readFileSync(GIOCO)).digest('hex').slice(0, 12);
  console.log('AUDIO — il cancello del suono');
  console.log('gioco: ' + path.basename(GIOCO) + '  md5 ' + impronta0 + '  (' + fs.statSync(GIOCO).size + ' byte)');
  console.log('seme del caso: ' + SEME + '  (Math.random sostituito da fuori: la partita e\' la stessa a ogni corsa)');

  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT',
  });
  await ctx.addInitScript(SONDA, SEME);
  const pag = await ctx.newPage();
  const eccezioni = [];
  const eccezioniUI = [];
  pag.on('pageerror', e => eccezioni.push(e.message));

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
  await pag.waitForTimeout(400);

  const rotta = await pag.evaluate(() => window.__sonda.rotta);
  if (rotta) { console.error('PROVA NULLA: ' + rotta); await browser.close(); srv.chiudi(); process.exit(3); }

  /* ---------------------------------------------------------------
     0 — LO SBLOCCO. Un browser non lascia suonare una pagina che
     nessuno ha toccato: il gioco deve aprire il contesto audio al
     primo dito, non prima e non mai.
     --------------------------------------------------------------- */
  console.log('\n--- 0. LO SBLOCCO AL PRIMO DITO ---');
  const prima = await pag.evaluate(() => ({
    nodi: window.__sonda.nodi.length,
    audio: (typeof Audio5 !== 'undefined') ? !!Audio5.ctx : null,
  }));
  if (prima.audio === null) {
    console.error('PROVA NULLA: l\'oggetto Audio5 non e\' raggiungibile dalla pagina: questo cancello non puo\' misurare niente.');
    await browser.close(); srv.chiudi(); process.exit(3);
  }
  ctrl('0', prima.audio === false && prima.nodi === 0,
    'prima di qualunque tocco il gioco NON ha aperto il contesto audio (nodi creati: ' + prima.nodi + ')');
  await pag.touchscreen.tap(457, 206);
  await pag.waitForTimeout(350);
  const dopo = await pag.evaluate(() => ({
    nodi: window.__sonda.nodi.map(n => n.tipo).join(' '),
    n: window.__sonda.nodi.length,
    stato: window.__sonda.ctx ? window.__sonda.ctx.state : null,
    tap: !!window.__sonda.an,
  }));
  ctrl('0', dopo.n > 0 && dopo.stato === 'running' && dopo.tap,
    'un tocco sul campo apre l\'audio: ' + dopo.n + ' nodi, contesto «' + dopo.stato + '»',
    true, 'catena d\'avvio: ' + dopo.nodi);
  if (!dopo.tap) {
    console.error('PROVA NULLA: nessun nodo si e\' attaccato all\'uscita, il rubinetto non esiste: non si puo\' ascoltare niente.');
    await browser.close(); srv.chiudi(); process.exit(3);
  }

  /* ---------------------------------------------------------------
     1 — L'INVENTARIO. Quali voci esistono davvero nell'oggetto Audio5
     e quante volte il gioco le chiama. Non e' un giudizio: e' la
     mappa che finora non esisteva.
     --------------------------------------------------------------- */
  console.log('\n--- 1. L\'INVENTARIO DELLE VOCI ---');
  const chiaviVere = await pag.evaluate(() => Object.keys(Audio5).filter(k => typeof Audio5[k] === 'function'));
  const sorgente = fs.readFileSync(GIOCO, 'utf8');
  /* i punti di chiamata: dentro l'oggetto i metodi si scrivono `kick(pow){`,
     fuori si scrivono `Audio5.kick(`. Quindi questo conteggio NON include
     la definizione e non va corretto di uno — un errore che questa stessa
     riga ha fatto alla prima stesura, accusando slideS e jingleTick di
     essere codice morto quando hanno un punto di chiamata a testa. */
  const conteggi = {};
  for (const k of chiaviVere) {
    const re = new RegExp('Audio5\\.' + k.replace(/[$]/g, '\\$') + '\\s*\\(', 'g');
    conteggi[k] = (sorgente.match(re) || []).length;
  }
  /* impianto = non e' una voce, e' la struttura: apertura del contesto,
     rumore bianco riusato, master, interruttore. crowdLevel e curvaTamburo
     restano fuori dalle firme per una ragione loro: la prima non crea
     nodi (muove il guadagno di un nodo gia' vivo), la seconda pianifica
     colpi con un accumulatore che dipende dall'orologio — la sua voce
     vera, _tamb, e' misurata. */
  const impianto = ['init', 'unlock', 'setMuted', 'noiseBuf', 'startCrowd', 'crowdLevel', 'curvaTamburo'];
  const cantanti = chiaviVere.filter(k => !impianto.includes(k));
  console.log('  --   ' + chiaviVere.length + ' funzioni in Audio5: ' + impianto.length + ' d\'impianto, ' +
    cantanti.length + ' voci.');
  console.log('  --   punti di chiamata nel gioco: ' + cantanti.map(k => k + ':' + conteggi[k]).join(' ') +
    '   (crowdLevel:' + conteggi.crowdLevel + ' curvaTamburo:' + conteggi.curvaTamburo + ')');
  /* _tamb e' chiamata solo da curvaTamburo, che sta dentro l'oggetto:
     e' l'unica voce che puo' legittimamente avere zero Audio5.<nome>( */
  const mute = cantanti.filter(k => conteggi[k] === 0 && k !== '_tamb');
  ctrl('1', mute.length === 0,
    'nessuna voce e\' codice morto: tutte hanno almeno un punto di chiamata nel gioco',
    true, mute.length ? 'voci mai chiamate: ' + mute.join(', ') : '');
  const nonCoperte = cantanti.filter(k => !VOCI.some(v => v.ch === k));
  ctrl('1', nonCoperte.length === 0,
    'questo cancello copre tutte le voci che esistono (' + VOCI.length + ' prove su ' + cantanti.length + ' voci)',
    true, nonCoperte.length ? 'voci NUOVE che nessuno misura: ' + nonCoperte.join(', ') + ' — vanno aggiunte a VOCI in strumenti/audio.js' : '');
  console.log('  --   nessun campione audio: tutto sintetizzato a runtime (0 file audio nel gioco, verificato: ' +
    ((sorgente.match(/data:audio\//g) || []).length) + ' occorrenze di data:audio/)');

  /* ---------------------------------------------------------------
     2 — OGNI VOCE SUONA, E SUONA DIVERSA DALLE ALTRE.
     Il menu tiene la melodia accesa ogni 460 ms: per misurare una
     voce sola la si zittisce e la si rimette a posto dopo. Il fondo
     di rumore si misura nello stesso minuto, non si presume.
     --------------------------------------------------------------- */
  console.log('\n--- 2. OGNI VOCE SUONA, E SUONA DIVERSA ---');
  await pag.evaluate(() => {
    window.__orig = { jingleTick: Audio5.jingleTick };
    Audio5.jingleTick = function () {};          // la melodia del menu non deve sporcare le misure
    Audio5.crowdLevel(0);                        // e nemmeno la folla
  });
  await pag.waitForTimeout(2500);                // la folla scende con costante 0,6 s: 2,5 s bastano
  const fondo = await pag.evaluate(() => window.__sonda.picco(700));
  const SOGLIA = Math.max(0.0020, fondo * 3);
  console.log('  --   fondo di rumore misurato adesso: ' + fondo.toFixed(5) +
    '  ->  una voce si considera udita sopra ' + SOGLIA.toFixed(5));
  /* PERCHE' IL FONDO NON E' ZERO, e non e' un difetto del banco.
     startCrowd porta il guadagno della folla a 0, ma ci attacca sopra un
     LFO a 0,13 Hz con ampiezza 0,008 (righe 7317-7321): il guadagno
     oscilla fra -0,008 e +0,008 invece di stare fermo a zero, quindi il
     rumore di folla filtrato NON tace mai del tutto, nemmeno al menu con
     la folla «spenta». Si sente solo con le cuffie, e' un decimo di una
     voce, e l'unico modo di azzerarlo davvero e' l'interruttore
     dell'audio (che agisce sul master). Va scritto perche' nessuno lo
     aveva mai misurato, non perche' sia grave. */
  console.log('  --   il fondo non e\' zero, e la spiegazione e\' LETTA nel codice (righe 7317-7321), non dedotta dal numero: ' +
    'startCrowd collega un LFO a 0,13 Hz e ampiezza 0,008 DENTRO crowdGain.gain, e in WebAudio un segnale collegato');
  console.log('  --   si SOMMA al valore del parametro. A folla «spenta» il guadagno oscilla quindi fra -0,008 e +0,008 invece ' +
    'di stare a zero: l\'unica cosa che azzera davvero l\'uscita e\' l\'interruttore dell\'audio (parte 4).');
  if (fondo > 0.05) {
    console.error('PROVA NULLA: il fondo e\' troppo alto (' + fondo.toFixed(4) + '): non si distinguerebbe una voce dal rumore.');
    await browser.close(); srv.chiudi(); process.exit(3);
  }

  const misure = [];
  for (const V of VOCI) {
    const r = await pag.evaluate(async ({ ch, a, mnu }) => {
      const R = window.__sonda;
      if (mnu) G.scene = 'menu';                 // la melodia esiste solo al menu
      if (ch === 'jingleTick') { Audio5._jgStep = 0; }
      const f = (ch === 'jingleTick') ? window.__orig.jingleTick : Audio5[ch];
      if (typeof f !== 'function') return { manca: true };
      const arg = a.map(x => x === 'ORA' ? R.ctx.currentTime : x);
      const m = R.marca();
      let err = null;
      try { f.apply(Audio5, arg); } catch (e) { err = e.message; }
      const firma = R.firma(m);                  // SINCRONA: nessun altro suono puo' infilarsi
      const c = R.conta(m);
      const picco = await R.picco(900);
      /* LA STESSA VOCE, UNA SECONDA VOLTA. Se le due firme non
         coincidono la firma non e' un'impronta ma un rumore, e va detto
         accanto al numero invece che nascosto. */
      if (mnu) Audio5._jgStep = 0;
      const m2 = R.marca();
      const arg2 = a.map(x => x === 'ORA' ? R.ctx.currentTime : x);
      try { f.apply(Audio5, arg2); } catch (e) {}
      const firma2 = R.firma(m2);
      return { firma, firma2, ...c, picco, err };
    }, { ch: V.ch, a: V.a, mnu: V.ch === 'jingleTick' });
    r.v = V.v; r.q = V.q; r.hash = r.firma ? breve(r.firma) : '-';
    r.stabile = r.firma === r.firma2;
    misure.push(r);
    await pag.waitForTimeout(120);
  }

  await pag.evaluate(() => { Audio5.jingleTick = window.__orig.jingleTick; });

  console.log('  voce             nodi auto archi   picco    impronta   quando');
  for (const m of misure) {
    console.log('  ' + m.v.padEnd(16) + String(m.nodi).padStart(4) + String(m.auto).padStart(5) +
      String(m.archi).padStart(6) + '  ' + (m.picco < 0 ? '  n/m' : m.picco.toFixed(4)).padStart(7) +
      '  ' + m.hash + (m.stabile ? ' ' : '!') + ' ' + m.q);
    if (VERBOSO) console.log('         ' + m.firma);
    if (VERBOSO && !m.stabile) console.log('    2a:  ' + m.firma2);
  }
  const mute2 = misure.filter(m => m.manca || m.err || m.nodi === 0);
  ctrl('2', mute2.length === 0, 'ogni voce costruisce un grafo audio quando la si chiama',
    true, mute2.length ? 'MUTE: ' + mute2.map(m => m.v + (m.err ? ' (' + m.err + ')' : '')).join(', ') : '');
  const sotto = misure.filter(m => !m.manca && m.picco >= 0 && m.picco < SOGLIA);
  ctrl('2', sotto.length === 0, 'ogni voce si SENTE davvero all\'uscita, sopra il fondo di rumore',
    true, sotto.length ? 'inudibili: ' + sotto.map(m => m.v + ' ' + m.picco.toFixed(5)).join(', ') : '');
  const gemelle = [];
  for (let i = 0; i < misure.length; i++)
    for (let j = i + 1; j < misure.length; j++)
      if (misure[i].firma && misure[i].firma === misure[j].firma) gemelle.push(misure[i].v + ' = ' + misure[j].v);
  ctrl('2', gemelle.length === 0, 'nessuna voce ha la stessa identica firma di un\'altra (' +
    (misure.length * (misure.length - 1) / 2) + ' coppie confrontate)',
    true, gemelle.length ? 'GEMELLE: ' + gemelle.join('; ') : '');
  /* LA FIRMA DEVE ESSERE UN'IMPRONTA, NON UN RUMORE. Ogni voce e' stata
     chiamata due volte di fila: se le due firme non coincidono, questo
     cancello non puo' accorgersi di niente e va riparato PRIMA di
     credergli. E' il controllo che questo strumento fa su se' stesso. */
  const ballerine = misure.filter(m => m.firma && !m.stabile);
  ctrl('2', ballerine.length === 0,
    'la firma e\' ripetibile: due chiamate di fila danno la stessa impronta per tutte le ' +
    misure.length + ' voci',
    true, ballerine.length ? 'FIRME CHE BALLANO (il cancello non e\' credibile): ' + ballerine.map(m => m.v).join(', ') : '');

  /* ---------------------------------------------------------------
     IL REGISTRO DELLE FIRME. E' la meta' del cancello che il censimento
     chiedeva davvero: «se domani qualcuno rompe il suono del gol, la
     firma cambia e il cancello lo dice». I tre controlli qui sopra
     scoprono il suono SPARITO, quello INUDIBILE e quello DOPPIONE; solo
     il confronto con un riferimento scritto scopre il suono CAMBIATO —
     un gol che diventa un altro gol, udibile e distinto, senza che
     nessuno l'abbia deciso.
     Come il registro di tutti.js, si scrive SOLO con --registra: se si
     aggiornasse da solo, un cambiamento verrebbe segnalato una volta e
     poi assorbito in silenzio, che e' la malattia che il registro cura.
     Se il cambiamento e' voluto, si riscrive il riferimento con una
     riga sola e si dice nel commit COSA e' cambiato.
     --------------------------------------------------------------- */
  const FIRMARIO = path.join(__dirname, 'audio-firme.json');
  if (ha('registra')) {
    const voci = {};
    for (const m of misure) voci[m.v] = { impronta: m.hash, nodi: m.nodi, auto: m.auto, archi: m.archi, quando: m.q };
    fs.writeFileSync(FIRMARIO, JSON.stringify({
      quando: new Date().toISOString(), gioco: path.basename(GIOCO), md5: impronta0,
      nota: 'le impronte del grafo WebAudio, voce per voce. Scritto da strumenti/audio.js --registra. ' +
        'Un\'impronta che cambia senza che nessuno l\'abbia deciso e\' un suono rotto.',
      voci,
    }, null, 1));
    console.log('  --   registro delle firme riscritto: ' + FIRMARIO);
  }
  let rif = null;
  try { rif = JSON.parse(fs.readFileSync(FIRMARIO, 'utf8')); } catch (e) {}
  if (!rif) {
    ctrl('2', null, 'nessun registro delle firme: non c\'e\' termine di paragone', false,
      'si fissa con:  node strumenti/audio.js --registra');
  } else {
    const cambiate = misure.filter(m => rif.voci[m.v] && rif.voci[m.v].impronta !== m.hash)
      .map(m => m.v + ' ' + rif.voci[m.v].impronta + '->' + m.hash);
    const sparite = Object.keys(rif.voci).filter(k => !misure.some(m => m.v === k));
    ctrl('2', cambiate.length === 0 && sparite.length === 0,
      'ogni voce suona come il ' + String(rif.quando).slice(0, 10) + ' (registro su md5 ' + rif.md5 +
      (rif.md5 === impronta0 ? ', lo stesso file' : ', UN ALTRO file: il confronto e\' fra due versioni') + ')',
      true, (cambiate.length ? 'CAMBIATE: ' + cambiate.join(', ') + '. Se e\' voluto: node strumenti/audio.js --registra' : '') +
      (sparite.length ? ' SPARITE dal banco: ' + sparite.join(', ') : ''));
  }

  /* ---------------------------------------------------------------
     3 — GLI EVENTI DEL GIOCO CHIAMANO LA LORO VOCE.
     Qui non si chiama il sintetizzatore: si fa succedere il fatto e
     si guarda chi canta. La spia avvolge Audio5 DA FUORI (il file del
     gioco non viene toccato).
     --------------------------------------------------------------- */
  console.log('\n--- 3. GLI EVENTI DEL GIOCO CHIAMANO LA LORO VOCE ---');
  await pag.evaluate(() => {
    window.__spia = { on: false, log: [] };
    const chiavi = Object.keys(Audio5).filter(k => typeof Audio5[k] === 'function');
    window.__spiaOrig = {};
    for (const k of chiavi) {
      const o = Audio5[k]; window.__spiaOrig[k] = o;
      Audio5[k] = function (...a) {
        /* si annota anche il PRIMO argomento, perche' clack(true) e'
           la parata e clack(false) e' la sponda: sono due eventi
           diversi che passano dalla stessa voce, e un cancello che non
           li distingue accetterebbe una parata muta purche' un pallone
           abbia sbattuto su una sponda nello stesso secondo */
        if (window.__spia.on) window.__spia.log.push({ v: k, a: a.length ? a[0] : undefined });
        return o.apply(this, a);
      };
    }
    /* riporta la partita a uno stato giocabile: la scena del gol e il
       replay durano qualche secondo e si chiudono dentro step(), quindi
       si simula finche' il pallone non e' di nuovo in gioco */
    window.__pronto = function (max) {
      for (let i = 0; i < (max || 30); i++) {
        if (__test.state === 'play' || __test.state === 'kickoff') break;
        __test.simulate(0.5);
      }
      return __test.state;
    };
  });

  /* quali = elenco di attese. «net» = la voce e' partita almeno una volta;
     «clack:true» = e' partita col primo argomento true.
     IL PICCO QUI E' INFORMATIVO E NON GIUDICA, e la ragione e' misurata:
     startMatch ricostruisce la texture del campo e blocca il filo
     principale per centinaia di millisecondi, durante i quali l'orologio
     audio corre e il fischio finisce PRIMA che si possa leggere
     l'analizzatore (che sta anche lui sul filo principale). Un cancello
     che giudicasse su quel numero boccerebbe il gioco per un difetto del
     banco. Che ogni voce si SENTA e' gia' provato dalla parte 2, e che la
     catena arrivi all'uscita dalla parte 4: qui si prova il LEGAME fra
     l'evento e la sua voce, che e' un fatto binario e stabile. */
  async function evento(nome, quali, azione, attesa = 0) {
    const r = await pag.evaluate(async ({ src, attesa }) => {
      const R = window.__sonda;
      window.__spia.log = []; window.__spia.on = true;
      const m = R.marca();
      let err = null;
      try { await (new Function('return (' + src + ')'))()(); } catch (e) { err = e && e.message; }
      if (attesa) await new Promise(r => setTimeout(r, attesa));
      const picco = await R.picco(700);
      window.__spia.on = false;
      const voci = {}; const arg = {};
      for (const x of window.__spia.log) {
        voci[x.v] = (voci[x.v] || 0) + 1;
        (arg[x.v] = arg[x.v] || []).push(x.a === undefined ? '-' : String(x.a));
      }
      return { voci, arg, picco, err, ...R.conta(m) };
    }, { src: azione.toString(), attesa });
    const mancano = quali.filter(q => {
      const [k, v] = q.split(':');
      if (!(r.voci[k] > 0)) return true;
      return v !== undefined && !(r.arg[k] || []).includes(v);
    });
    ctrl('3', !r.err && mancano.length === 0,
      nome.padEnd(22) + ' -> ' + (Object.keys(r.voci).length
        ? Object.entries(r.voci).map(([k, n]) => k + (n > 1 ? '×' + n : '')).join(' ') : 'SILENZIO') +
      '   [atteso: ' + quali.join(' ') + ']   picco ' + r.picco.toFixed(4),
      true, (r.err ? 'eccezione: ' + r.err : '') + (mancano.length ? ' voci attese e mai partite: ' + mancano.join(', ') : ''));
    return r;
  }

  /* L'INTERFACCIA per prima, perche' vuole il MENU: un dito vero
     sull'ingranaggio, che e' un bottone vero e visibile fuori dalla
     partita. Il gioco lega il micro-click a pointerdown in cattura su
     qualunque <button>: qui non si chiama niente, si preme. */
  await pag.evaluate(() => { window.__spia.log = []; window.__spia.on = true; });
  const box = await pag.locator('#gearBtn').boundingBox().catch(() => null);
  if (box) await pag.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  else eccezioniUI.push('#gearBtn non ha un riquadro: non e\' visibile');
  const ui = await pag.evaluate(async () => {
    const picco = await window.__sonda.picco(500);
    window.__spia.on = false;
    const voci = {}; for (const x of window.__spia.log) voci[x.v] = (voci[x.v] || 0) + 1;
    return { voci, picco };
  });
  ctrl('3', !!box && (ui.voci.uiTick > 0 || ui.voci.beep > 0),
    'interfaccia (dito vero sull\'ingranaggio) -> ' + (Object.keys(ui.voci).join(' ') || 'SILENZIO') +
    '   [atteso: uiTick]   picco ' + ui.picco.toFixed(4), true, eccezioniUI.join('; '));
  await pag.evaluate(() => { const b = document.getElementById('btnBackExtra'); if (b) b.click(); });

  await evento('fischio d\'inizio', ['whistle:false', 'crowdLevel'], () => {
    __test.dismissSplash(); __test.startMatch(1, 1);
  }, 200);
  await evento('calcio (CPU vs CPU)', ['kick'], () => {
    __test.setCpuVsCpu(true); __test.simulate(8);
  }, 100);
  await evento('gol', ['net', 'roar'], () => {
    window.__pronto(); __test.forceGoal(0);
  }, 200);
  /* IL PALO E LA PARATA SI ALLESTISCONO, NON SI ASPETTANO.
     Prima stesura: si lanciava il pallone verso la porta e si sperava.
     Due corse di fila hanno dato esiti diversi (una parata e un gol), e
     un cancello che balla e' peggio di nessun cancello. Adesso il campo
     si SGOMBRA — tutti fuori tranne chi serve, con p.out, che e' lo
     stesso campo che il gioco usa per gli espulsi — e restano in scena
     solo il pallone, il montante e il portiere. La fisica e' quella
     vera: cambia solo che nessun altro puo' mettersi in mezzo.
     Le coordinate arrivano da __test.campo, non da costanti scritte a
     mano che invecchiano in silenzio. */
  await evento('palo', ['post'], () => {
    window.__pronto();                                     // esce dalla scena del gol
    const c = __test.campo, b = __test.ball;
    for (const p of __test.players) p.out = 3;             // campo sgombro
    b.owner = -1; b.passTo = -1; b.z = 0; b.vz = 0;
    b.x = c.FW - 34; b.y = c.GY0; b.vx = 620; b.vy = 0;
    __test.simulate(0.35);
  }, 100);
  /* LA PARATA. Il portiere del gioco e' un corpo vero, non un dado: gli
     si tira addosso e le mani ci sono. I due numeri (420 unita' al
     secondo da 0,68 di campo) NON sono a gusto: sono stati cercati su
     una griglia di 5 velocita' x 3 distanze x 3 ripetizioni
     (strumenti/audio.js, spike del 20 agosto) e sono l'unica coppia che
     ha dato parata 3 volte su 3 con margine da tutt'e due i lati —
     sotto le 300 unita' il pallone si ferma per attrito prima di
     arrivare, sopra le 520 da vicino entra prima che il portiere si
     distenda. Il portiere si azzera nei campi che il gioco usa per
     dire «sto gia' facendo qualcos'altro» (kickCd, gkT, presaT, rinvT):
     un portiere che ha appena rinviato non para, e senza questo azzero
     la prova dipendeva da cosa fosse successo un secondo prima. */
  await evento('parata del portiere', ['clack:true'], () => {
    window.__pronto();
    const c = __test.campo, b = __test.ball, ps = __test.players;
    let gk = null;
    for (const p of ps) { p.out = 3; if (p.team === 1 && p.role === 'gk') gk = p; }
    if (!gk) throw new Error('nessun portiere nella squadra 1: non si puo\' misurare la parata');
    gk.out = 0; gk.dive = 0; gk.charge = -1; gk.recover = 0; gk.slide = -1;
    gk.kickCd = 0; gk.gkT = 0; gk.presaT = 0; gk.rinvT = 0;
    gk.x = c.FW - 18; gk.y = (c.GY0 + c.GY1) / 2; gk.vx = 0; gk.vy = 0;
    b.owner = -1; b.passTo = -1; b.z = 0; b.vz = 0; b.saveRolled = false;
    b.x = c.FW * 0.68; b.y = gk.y; b.vx = 420; b.vy = 0;
    __test.simulate(2.0);
  }, 100);
  await evento('coro della curva', ['coro'], () => {
    __test.attivaOggetti(['curva']);
    for (const p of __test.players) p.out = 0;             // il campo torna pieno
    window.__pronto(); __test.forceGoal(0);
  }, 300);
  await evento('fischio finale', ['whistle:true'], () => {
    window.__pronto(); __test.forceWinMatch();
  }, 200);
  await evento('rigori', ['whistle:true', 'swell'], () => {
    __test.dismissSplash(); __test.startMatch(1, 1); __test.rigori();
  }, 200);

  /* ---------------------------------------------------------------
     4 — IL VOLUME OBBEDISCE.
     Si preme il comando VERO dell'utente. E si controlla all'uscita,
     non nella variabile: se il gioco spegnesse solo l'etichetta, qui
     si sentirebbe lo stesso.
     --------------------------------------------------------------- */
  console.log('\n--- 4. IL VOLUME OBBEDISCE ALL\'IMPOSTAZIONE ---');
  const vol = await pag.evaluate(async (SOGLIA) => {
    const R = window.__sonda;
    const out = {};
    __test.dismissSplash(); __test.startMatch(1, 1); await new Promise(r => setTimeout(r, 250));
    Audio5.roar(); out.acceso = await R.picco(800);
    /* il comando vero: quello che l'utente trova in PAUSA e in PREFERENZE */
    const b = document.getElementById('btnSetAudio');
    out.comandoEsiste = !!b;
    out.etichetta0 = b ? b.textContent : '';
    if (b) b.click();
    out.muted = Audio5.muted;
    out.etichetta = b ? b.textContent : '';
    await new Promise(r => setTimeout(r, 120));
    Audio5.roar(); Audio5.kick(1); Audio5.whistle(false);
    out.spento = await R.picco(800);
    try { out.salvato = JSON.parse(localStorage.getItem(__test.saveKey) || '{}').mute; } catch (e) { out.salvato = 'illeggibile'; }
    if (b) b.click();
    await new Promise(r => setTimeout(r, 120));
    Audio5.roar(); out.riacceso = await R.picco(800);
    out.master = Audio5.master ? Audio5.master.gain.value : null;
    /* c'e' un cursore di volume da qualche parte? */
    out.cursori = Array.from(document.querySelectorAll('input[type=range]')).length;
    return out;
  }, SOGLIA);
  ctrl('4', vol.comandoEsiste, 'il comando dell\'utente esiste ed e\' premibile (#btnSetAudio: «' +
    vol.etichetta0 + '» -> «' + vol.etichetta + '»)');
  /* L'INTERRUTTORE NON DEVE MENTIRE: l'etichetta e lo stato vero devono
     dire la stessa cosa. E' lo stesso difetto che il censimento ha
     trovato su VIBRAZIONE (caso 8), cercato qui prima che nasca. */
  ctrl('4', /OFF/.test(vol.etichetta) === !!vol.muted,
    'l\'etichetta del comando dice la verita\' sullo stato (etichetta «' + vol.etichetta +
    '», muted = ' + vol.muted + ')');
  ctrl('4', vol.acceso > SOGLIA, 'ad audio acceso il boato esce dall\'uscita: picco ' + vol.acceso.toFixed(4));
  ctrl('4', vol.spento < 1e-6, 'a AUDIO: OFF l\'uscita e\' silenzio ESATTO: picco ' + vol.spento.toExponential(2) +
    ' (tre voci chiamate insieme)');
  ctrl('4', vol.salvato === 1 || vol.salvato === true, 'lo spegnimento finisce nel salvataggio (SAVE.mute = ' + JSON.stringify(vol.salvato) + ')');
  ctrl('4', vol.riacceso > SOGLIA, 'riaccendendo il suono torna: picco ' + vol.riacceso.toFixed(4));
  console.log('  --   NON c\'e\' un cursore di volume in tutto il gioco (input[type=range] trovati: ' + vol.cursori +
    '), ne\' una separazione musica/effetti: l\'audio e\' acceso/spento e basta. E\' un limite di prodotto, non un rosso di questo cancello.');

  /* ---------------------------------------------------------------
     5 — A GIOCO NASCOSTO L'AUDIO DEVE TACERE.
     Il gioco mette in pausa su visibilitychange (verificato: due
     ascoltatori, righe 9776 e 30655) ma NON sospende il contesto
     audio. Un gioco che continua a suonare in tasca e' un difetto
     vero, e questo e' il controllo che lo dice.
     --------------------------------------------------------------- */
  console.log('\n--- 5. A GIOCO NASCOSTO L\'AUDIO TACE ---');
  /* prima si prova la strada VERA: un'altra scheda in primo piano. Se il
     banco non sa nasconderla, si ripiega sulla simulazione e LO SI DICE. */
  /* si parte da una partita in corso e QUIETA: se si nascondesse la
     pagina mentre il boato di un gol sta ancora suonando, il picco
     misurato dopo sarebbe la coda di quel boato e non la prova di
     niente. Un secondo e mezzo di gioco normale spegne le code. */
  await pag.evaluate(() => { window.__pronto(); });
  await pag.waitForTimeout(1500);
  let modoNascondi = 'reale (una seconda scheda in primo piano)';
  const pag2 = await ctx.newPage();
  await pag2.goto('about:blank');
  await pag2.bringToFront();
  await pag.waitForTimeout(300);
  let davveroNascosta = await pag.evaluate(() => document.hidden === true);
  if (!davveroNascosta) {
    modoNascondi = 'simulato (document.hidden forzato + evento visibilitychange): il banco headless non nasconde le schede';
    await pag.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  }
  console.log('  --   modo: ' + modoNascondi);
  const nasc = await pag.evaluate(async () => {
    const R = window.__sonda;
    window.__spia.log = []; window.__spia.on = true;
    const m = R.marca();
    const picco = await R.picco(1600);
    window.__spia.on = false;
    const voci = {}; for (const x of window.__spia.log) voci[x.v] = (voci[x.v] || 0) + 1;
    return { picco, voci, stato: R.ctx.state, sosp: R.chiamate.filter(c => c === 'suspend').length,
      ...R.conta(m), inPausa: __test.paused, scena: __test.state };
  });
  const notaAperta = NOTE_APERTE.includes('nascosto');
  const grepSusp = (sorgente.match(/\.suspend\s*\(/g) || []).length;
  ctrl('5', nasc.sosp > 0, 'con la pagina nascosta il gioco SOSPENDE il contesto audio (chiamate a suspend: ' + nasc.sosp + ')',
    !notaAperta, 'contesto: «' + nasc.stato + '» — occorrenze di .suspend( in tutto il file: ' + grepSusp);
  ctrl('5', nasc.nodi === 0, 'in PARTITA, nascosta, il gioco smette di costruire suoni (nodi nuovi in 1,6 s: ' + nasc.nodi + ')',
    !notaAperta, 'voci partite a schermo spento: ' + (Object.entries(nasc.voci).map(([k, n]) => k + '×' + n).join(' ') || 'nessuna') +
    ' — scena «' + nasc.scena + '», in pausa: ' + (nasc.inPausa ? 'si' : 'no'));
  /* UN CONTESTO SOSPESO E' SILENZIO PER DEFINIZIONE, e va detto perche'
     altrimenti questo controllo resterebbe rosso proprio quando il gioco
     e' stato riparato: con il contesto fermo l'analizzatore non riceve
     piu' campioni e restituisce l'ultimo buffer, che e' vecchio. Il
     picco si legge quando il contesto gira; quando e' sospeso, la prova
     e' lo stato stesso. */
  ctrl('5', nasc.stato === 'suspended' || nasc.picco < 1e-6,
    'in PARTITA, nascosta, l\'uscita e\' silenzio: ' +
    (nasc.stato === 'suspended' ? 'contesto sospeso' : 'picco ' + nasc.picco.toExponential(2)),
    !notaAperta, notaAperta ? 'NOTA APERTA: difetto noto del 20 agosto, la toppa e\' pronta e non applicata (strumenti/_toppa-audio-sospendi.js)' : '');

  /* IL CASO PEGGIORE E' IL MENU, e nessuno l'aveva guardato: setPaused
     esce subito se non si e' in partita («if(v && !inMatch) return»),
     quindi al menu nascondere la pagina non mette in pausa niente e la
     melodia continua a costruire oscillatori ogni 460 ms. E' il gioco
     che canta in tasca a schermo spento. */
  const nascMenu = await pag.evaluate(async () => {
    const R = window.__sonda;
    __test.G.scene = 'menu';                       // torna al menu senza ricaricare
    window.__spia.log = []; window.__spia.on = true;
    await new Promise(r => setTimeout(r, 200));
    const m = R.marca();
    const picco = await R.picco(1600);
    window.__spia.on = false;
    const voci = {}; for (const x of window.__spia.log) voci[x.v] = (voci[x.v] || 0) + 1;
    return { picco, voci, ...R.conta(m), nascosta: document.hidden };
  });
  ctrl('5', nascMenu.nodi === 0,
    'al MENU con la pagina nascosta il gioco non costruisce piu\' suoni (nodi nuovi in 1,6 s: ' +
    nascMenu.nodi + ', picco ' + nascMenu.picco.toExponential(2) + ')',
    !notaAperta, 'voci partite: ' + (Object.entries(nascMenu.voci).map(([k, n]) => k + '×' + n).join(' ') || 'nessuna') +
    (nascMenu.nodi > 0 ? ' — setPaused esce subito fuori dalla partita («if(v && !inMatch) return»), quindi al menu il nascondimento non ferma niente' : ''));

  if (davveroNascosta) await pag.bringToFront();
  await pag2.close().catch(() => {});

  /* ---------------------------------------------------------------
     Il bersaglio non si e' mosso? Se il file e' cambiato mentre
     misuravamo, il referto parla di un file che non esiste piu'.
     --------------------------------------------------------------- */
  const impronta1 = crypto.createHash('md5').update(fs.readFileSync(GIOCO)).digest('hex').slice(0, 12);
  await browser.close(); srv.chiudi();
  if (impronta1 !== impronta0) {
    console.error('\nPROVA NULLA: il gioco e\' cambiato durante la misura (' + impronta0 + ' -> ' + impronta1 + ').');
    process.exit(3);
  }
  if (eccezioni.length) console.log('\n  --   eccezioni della pagina durante la prova: ' + eccezioni.slice(0, 3).join(' | '));

  const contati = CTRL.filter(c => c.conta);
  const rossi = contati.filter(c => !c.ok);
  const note = CTRL.filter(c => !c.conta && !c.ok);
  console.log('\n' + contati.length + ' controlli, ' + (contati.length - rossi.length) + ' passati, ' + rossi.length + ' falliti');
  if (note.length) {
    console.log('NOTE APERTE (dichiarate, non contate in questa corsa): ' + note.length);
    for (const n of note) console.log('   · ' + n.testo);
  }
  if (rossi.length) {
    console.log('ROSSO: ' + rossi.map(r => r.sez + '.' + r.testo.slice(0, 60)).join(' | '));
    process.exit(1);
  }
  console.log('VERDE');
  process.exit(0);
})().catch(e => {
  console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
  process.exit(2);
});
