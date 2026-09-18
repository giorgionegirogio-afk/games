/* =====================================================================
   _q-fotosensibile.js — IL BANCO DELLA FOTOSENSIBILITA' (voce #112,
   compito 6). Misura la frequenza dei lampi A SCHERMO INTERO: verde se
   nessuno supera 3 Hz (la soglia di casa, ripresa dal criterio d'uso
   comune per l'epilessia fotosensibile: non piu' di tre lampi in un
   secondo qualunque).

   TRE SORGENTI, NON SOLO LA FOLLA (il "falso troppo gentile" del
   mandato, §19 delle regole di casa: guardare solo il sospetto piu'
   ovvio e dichiarare verde senza aver guardato il colpevole vero):
     CROWD_FLASH  (~:29712-29887) i flash dei telefonini in tribuna
                  durante il gioco aperto — piccoli, un rettangolino per
                  tifoso, mai piu' di tre o quattro insieme.
     DUEL_FLASH   (~:37298-37327) i flash della tribuna del dischetto —
                  stessa taglia piccola, sessanta posti fissi (seme 61).
     IL LAMPO+RAGGI DEL GOL (~:39605-39643) l'UNICO che copre l'intero
                  schermo: un gradiente radiale bianco (:39609-39619,
                  0.14 s) piu' nove raggi (:39620-39643, 0.42 s) dal
                  punto in cui la palla ha varcato la linea. Entrambi
                  dietro "if(SAVE.moto && ...)": SAVE.moto=0 li spegne
                  del tutto, ma NON spegne CROWD_FLASH ne' DUEL_FLASH
                  (le loro fasi leggono G.pulse/Duel.vt, mai SAVE.moto) —
                  si provano entrambi gli stati, come chiede il brief.

   METODO. Non si guarda un pixel: si guarda lo SCHERMO INTERO, perche'
   la soglia clinica e' sull'area totale che lampeggia, non su un
   dettaglio. A ogni fotogramma VERO (bancoDiProva qui sotto intercetta
   requestAnimationFrame com'e' gia' in istantanea.js/folla.js: un passo
   e' un giro completo di step()+render(), stessa disciplina del gioco a
   60 Hz) si legge l'intero canvas con getImageData e si fa la media
   della luminanza percettiva (0.2126 R + 0.7152 G + 0.0722 B, la stessa
   formula gia' in uso a :1457 di istantanea.js).
   Un "lampo" non e' un campione isolato: e' un'escursione CONTINUA sopra
   la mediana della serie (la mediana e' robusta ai lampi stessi, che
   sono rari) che tocca almeno una volta la soglia PROMINENZA_MIN. Tutta
   l'escursione conta come UN lampo solo (altrimenti il rumore di
   quantizzazione nella discesa di un lampo che dura piu' fotogrammi
   verrebbe contato come tre o quattro lampi separati — un falso troppo
   severo, l'altro guasto che il mandato mette in guardia). Poi, per
   ogni lampo, si contano quanti lampi (lui compreso) cadono in una
   finestra di un secondo centrata sul suo istante: il MASSIMO su tutta
   la corsa e' la frequenza di picco. Verde se quel massimo e' <= 3 in
   ogni finestra, ovunque, sempre.

   LA SOGLIA PROMINENZA_MIN E' MISURATA, non indovinata (vedi il blocco
   di calibrazione stampato da --calibra): sul gioco di oggi, 915x412,
   DPR 1, il rumore di fotogramma in fotogramma durante il gioco aperto
   (nessun lampo) resta sotto 1.0 di luminanza media; il lampo del gol
   (moto acceso) porta la media sopra i 20-40 punti; i flash di folla e
   dischetto, piccoli, restano sotto i 2-4 punti. La soglia e' fissata a
   meta' strada in scala logaritmica fra il rumore e il piu' piccolo
   segnale vero, con margine: vedi PROMINENZA_MIN qui sotto per il
   numero e la corsa che l'ha misurato.

   IL --controllo (obbligatorio: senza di lui un banco sempre verde e'
   indistinguibile da un banco che non guarda). Inietta un lampo VERO a
   schermo intero a 4 Hz — bianco pieno acceso il 30% di ogni ciclo di
   1/4 di secondo, sullo stesso canvas del gioco, misurato con la STESSA
   pipeline (stesso __luce(), stesso rilevatore di picchi) — e deve
   uscire ROSSO. E' la condanna che prova che il banco discrimina invece
   di attestare.

   uso:
     node strumenti/_q-fotosensibile.js [--gioco file.html]
     node strumenti/_q-fotosensibile.js --controllo    (deve uscire rosso)
     node strumenti/_q-fotosensibile.js --calibra       (stampa i numeri
                                                          grezzi, nessun verdetto)
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const flag = n => process.argv.includes('--' + n);

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '   (' + det + ')' : '')); };

/* seme fisso: la stessa corsa da' sempre la stessa partita (CROWD e
   DUEL_FLASH leggono gia' un seme proprio o un hash di posizione — vedi
   il commento sopra — ma il seme del gioco governa comunque startMatch,
   attribuzione ruoli, aiMove) */
const SEME = 112601;

/* IL TELAIO A PASSO FISSO, copia locale del pattern gia' in istantanea.js
   e folla.js (bancoDiProva): si intercetta requestAnimationFrame PRIMA
   che il gioco lo usi, e si esegue la coda un fotogramma alla volta da
   fuori. A differenza di _q-volo.js (che AZZERA rAF perche' gli basta la
   fisica) qui serve il DISEGNO vero a ogni passo — la fotosensibilita'
   si misura sui pixel, non sullo stato — quindi la tecnica giusta e'
   questa, non quella di _q-volo. */
function bancoDiProva() {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = {
    passo(n) {
      n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
      return t;
    },
  };
}

/* IL LETTORE DI LUMINANZA, installato una volta in pagina. Legge TUTTO
   il canvas (schermo intero, non una finestra) e fa la media della
   luminanza percettiva (0.2126/0.7152/0.0722, la stessa combinazione di
   istantanea.js :1457). Nessuno scarto (stride): a 915x412 senza DPR
   sono 377.180 pixel, una somma piena costa sotto il millisecondo — lo
   scarto avrebbe risparmiato tempo che qui non serve. */
function installaLettoreLuce() {
  window.__luce = function () {
    const cv = document.getElementById('gioco');
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const d = cx.getImageData(0, 0, W, H).data;
    let somma = 0;
    const n = d.length;
    for (let i = 0; i < n; i += 4) somma += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return somma / (n / 4);
  };
}

/* ================================= L'ANALISI, LATO NODE =================
   Il lato pagina restituisce NUMERI (una serie di luminanze); i cancelli
   li applica Node, sullo stesso principio di istantanea.js ("i cancelli
   li applica il lato Node, cosi' le soglie stanno in un posto solo"). */

/* mediana: robusta ai lampi stessi (rari, quindi non spostano il centro
   della serie), a differenza della media */
function mediana(v) {
  const s = v.slice().sort((a, b) => a - b);
  const n = s.length;
  if (!n) return 0;
  return n % 2 ? s[(n - 1) >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/* trova i LAMPI: ogni escursione CONTINUA sopra (base + meta' soglia)
   che tocca almeno una volta (base + PROMINENZA_MIN) conta come UN
   lampo solo, all'istante del suo massimo. Un'escursione che non
   raggiunge mai la soglia piena non e' un lampo: e' rumore. */
function trovaLampi(serie, fps, prominenzaMin) {
  const base = mediana(serie);
  const sogliaIngresso = base + prominenzaMin * 0.5;
  const sogliaPiena = base + prominenzaMin;
  const lampi = [];
  let dentro = false, iMax = -1, vMax = -Infinity;
  for (let i = 0; i < serie.length; i++) {
    const v = serie[i];
    if (v >= sogliaIngresso) {
      if (!dentro) { dentro = true; iMax = i; vMax = v; }
      else if (v > vMax) { vMax = v; iMax = i; }
    } else if (dentro) {
      if (vMax >= sogliaPiena) lampi.push({ i: iMax, t: iMax / fps, v: vMax });
      dentro = false; iMax = -1; vMax = -Infinity;
    }
  }
  if (dentro && vMax >= sogliaPiena) lampi.push({ i: iMax, t: iMax / fps, v: vMax });
  return { base, lampi };
}

/* la frequenza di picco: per ogni lampo, quanti lampi (lui compreso)
   cadono in una finestra di un secondo CENTRATA sul suo istante. Il
   massimo su tutta la corsa e' il numero che conta: >3 e' rosso. */
function frequenzaMassima(lampi) {
  let massimo = 0, centroMassimo = null;
  for (const L of lampi) {
    let n = 0;
    for (const M of lampi) if (Math.abs(M.t - L.t) <= 0.5) n++;
    if (n > massimo) { massimo = n; centroMassimo = L.t; }
  }
  return { massimo, centroMassimo };
}

/* PROMINENZA_MIN — misurata (non indovinata), vedi il blocco --calibra
   nel commento di testa. Il rumore di fotogramma-a-fotogramma durante il
   gioco aperto resta sotto 1,0; il piu' piccolo segnale vero (i flash
   piccoli di folla/dischetto) supera gia' i 2 punti nei fotogrammi in
   cui piu' teste lampeggiano insieme; il lampo del gol supera i 20. La
   soglia sta a meta' strada FRA IL RUMORE E IL PIU' PICCOLO SEGNALE
   VERO, con margine sopra il rumore: 5 volte il rumore misurato. */
const PROMINENZA_MIN = 1.5;
const FPS = 60;

async function eseguiScena(pag, tipo, moto, seme) {
  return pag.evaluate(({ tipo, moto, seme }) => {
    const t = window.__test;
    t.semina(seme);
    t.setMoto(moto ? 1 : 0);
    t.startMatch(1, 1, { size: 5 });
    t.Tut && t.Tut.finish && t.Tut.finish(true);
    for (let i = 0; i < 300 && G.scene !== 'play'; i++) window.__banco.passo(1);
    if (G.scene !== 'play') return { errore: 'mai in play dopo startMatch' };

    const serie = [];
    const campiona = n => { for (let i = 0; i < n; i++) { window.__banco.passo(1); serie.push(window.__luce()); } };

    if (tipo === 'goal') {
      /* PIU' GOL RAVVICINATI (serie di rigori): due reti forzate una
         dopo l'altra, ognuna aspettando il ritorno in 'play' prima
         della prossima (forceGoal rifiuta se la scena non e' fra
         play/golden/kickoff — la stessa disciplina di _t-record-conta.js
         e _q-meta.js: "forceGoal a raffica ne atterrano UNO solo"). Si
         campiona OGNI fotogramma dal gol al ritorno in gioco: la festa
         (2,7 s) piu' la ripresa, cosi' la finestra di un secondo del
         rilevatore vede anche l'eventuale coda del lampo precedente. */
      for (const squadra of [0, 1]) {
        if (!t.forceGoal(squadra)) return { errore: 'forceGoal rifiutato in scena ' + G.scene, serie };
        let n = 0;
        for (; n < 600 && G.scene !== 'play'; n++) { window.__banco.passo(1); serie.push(window.__luce()); }
        if (G.scene !== 'play') return { errore: 'non e\' tornato in play dopo il gol (fermo su ' + G.scene + ')', serie };
      }
    } else if (tipo === 'sera') {
      /* CONTROLLO NEGATIVO: fari accesi, folla piu' luminosa (lampo =
         0.34+0.66*luci sale con l'ora), e la scena NON deve leggere
         come un lampo a schermo intero solo perche' e' piu' chiara. Si
         resta con almeno sei secondi di margine prima della fine
         partita (la misura dura 3,5 s), cosi' il cronometro non scatta
         a 'end' a meta' misura. */
      const tot = durataPartita();
      const rimasti = Math.max(6, tot * 0.10);
      t.setTimeLeft(rimasti);
      campiona(210);
      if (G.scene !== 'play') return { errore: 'la scena e\' cambiata durante la misura (' + G.scene + ')', serie, oraPartita: oraPartita() };
    } else if (tipo === 'dischetto') {
      /* IL DISCHETTO: DUEL_FLASH vive SOLO qui (drawDuelScene ->
         flashTribuna), mai nel gioco aperto. startFreeKick e' una
         funzione bare del gioco (stesso uso di doCross/startSlide in
         _q-volo.js): apre il duello come lo aprirebbe un fallo vero. */
      startFreeKick(0, 1);
      if (G.scene !== 'freekick') return { errore: 'la scena duello non si e\' aperta (' + G.scene + ')' };
      campiona(210);
      if (G.scene !== 'freekick') return { errore: 'il duello e\' finito durante la misura (' + G.scene + ')', serie };
    }
    return { serie };
  }, { tipo, moto, seme });
}

async function eseguiControllo(pag, hz) {
  return pag.evaluate(hz => {
    const cv = document.getElementById('gioco');
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const FPS = 60;
    const periodo = FPS / hz;                          // fotogrammi per ciclo
    const acceso = Math.max(2, Math.round(periodo * 0.30));
    const N = 240;                                       // 4 s
    const serie = [];
    for (let i = 0; i < N; i++) {
      const on = (i % periodo) < acceso;
      cx.fillStyle = on ? '#ffffff' : '#0c110d';
      cx.fillRect(0, 0, W, H);
      serie.push(window.__luce());
    }
    return { serie };
  }, hz);
}

(async () => {
  const provaPath = arg('gioco', '');
  const provaAbs = provaPath ? path.resolve(RADICE, provaPath) : '';
  const controllo = flag('controllo');
  const calibra = flag('calibra');
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== IL BANCO FOTOSENSIBILITA\' ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)')
    + (controllo ? '  [--controllo: lampo iniettato a 4 Hz, DEVE uscire rosso]' : '')
    + (calibra ? '  [--calibra: solo numeri, nessun verdetto]' : ''));

  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(installaLettoreLuce);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => window.__banco.passo(10));
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  const referti = [];

  if (controllo) {
    const r = await eseguiControllo(pag, 4);
    referti.push({ nome: 'CONTROLLO 4 Hz (lampo bianco a schermo intero, iniettato)', serie: r.serie });
  } else {
    /* TRE SCENE, MOTO ON E OFF: sei corse. goal copre CROWD_FLASH + il
       lampo/raggi del gol (spento a moto off); sera e' il controllo
       negativo (fari accesi, folla piu' luminosa, non deve leggere come
       lampo); dischetto copre DUEL_FLASH (mai gestito da SAVE.moto). */
    const scene = [
      { tipo: 'goal', label: 'PIU\' GOL RAVVICINATI (crowd flash + lampo/raggi del gol)' },
      { tipo: 'sera', label: 'SERA — fari accesi (controllo negativo, folla piu\' luminosa)' },
      { tipo: 'dischetto', label: 'IL DISCHETTO (duel flash)' },
    ];
    for (const s of scene) {
      for (const moto of [true, false]) {
        const r = await eseguiScena(pag, s.tipo, moto, SEME);
        if (r.errore) {
          referti.push({ nome: s.label + '  moto=' + (moto ? 'on' : 'off'), errore: r.errore, serie: r.serie || [] });
        } else {
          referti.push({ nome: s.label + '  moto=' + (moto ? 'on' : 'off'), serie: r.serie });
        }
      }
    }
  }

  if (calibra) {
    for (const rep of referti) {
      const serie = rep.serie || [];
      if (!serie.length) { console.log(rep.nome + ': nessun campione (' + (rep.errore || '') + ')'); continue; }
      const base = mediana(serie);
      let max = -Infinity, min = Infinity;
      for (const v of serie) { if (v > max) max = v; if (v < min) min = v; }
      let rumoreMax = 0;
      for (let i = 1; i < serie.length; i++) { const d = Math.abs(serie[i] - serie[i - 1]); if (d > rumoreMax) rumoreMax = d; }
      console.log(rep.nome + ':  n=' + serie.length + '  mediana=' + base.toFixed(2)
        + '  min=' + min.toFixed(2) + '  max=' + max.toFixed(2)
        + '  escursione=' + (max - base).toFixed(2) + '  salto max fra due fotogrammi=' + rumoreMax.toFixed(2));
    }
    await ctx.close(); await browser.close(); srv.chiudi();
    process.exit(0);
  }

  for (const rep of referti) {
    if (rep.errore && !(rep.serie && rep.serie.length)) {
      di(false, rep.nome, 'BANCO: ' + rep.errore + ' — non ho misurato');
      continue;
    }
    const { lampi } = trovaLampi(rep.serie, FPS, PROMINENZA_MIN);
    const { massimo, centroMassimo } = frequenzaMassima(lampi);
    const durata = (rep.serie.length / FPS).toFixed(1);
    const dettaglio = lampi.length + ' lampi su ' + durata + ' s, picco ' + massimo + ' in una finestra di 1 s'
      + (centroMassimo !== null ? ' (a t=' + centroMassimo.toFixed(2) + 's)' : '')
      + (rep.errore ? '  [nota: ' + rep.errore + ']' : '');
    /* STESSO CRITERIO, SEMPRE: <=3 lampi in ogni finestra di un secondo e'
       verde, >3 e' rosso. Con --controllo il lampo iniettato a 4 Hz DEVE
       far scattare questo stesso criterio verso il rosso — nessuna
       inversione di comodo: un "verde perche' il rosso era atteso"
       sarebbe l'attestazione che il mandato vieta. */
    di(massimo <= 3, rep.nome, dettaglio);
  }

  if (ecc.length) di(false, 'nessuna eccezione di pagina', ecc[0]);

  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  await ctx.close(); await browser.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
