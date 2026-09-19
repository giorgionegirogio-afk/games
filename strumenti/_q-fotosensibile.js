/* =====================================================================
   _q-fotosensibile.js — IL BANCO DELLA FOTOSENSIBILITA' (nato voce #112,
   compito 6; riscritto voce #114, compito 1, sulle soglie CLINICHE
   WCAG). Misura la frequenza dei lampi A SCHERMO INTERO: verde se nessuno
   supera 3 Hz in una finestra di 1 secondo (WCAG 2.3.1 "Three Flashes or
   Below Threshold", Livello A, W3C Recommendation WCAG 2.2, 5 ottobre
   2023, invariata da WCAG 2.0, 11 dicembre 2008 —
   https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html).

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
   dettaglio (il criterio d'AREA vero e proprio arriva col #114 compito 2
   — qui il proxy e' ancora la media whole-canvas, dichiarato piu' sotto).
   A ogni fotogramma VERO (bancoDiProva qui sotto intercetta
   requestAnimationFrame com'e' gia' in istantanea.js/folla.js: un passo
   e' un giro completo di step()+render(), stessa disciplina del gioco a
   60 Hz) si legge l'intero canvas con getImageData e si fa la media
   della LUMINANZA RELATIVA WCAG (installaLettoreLuce piu' sotto:
   linearizzazione gamma per canale, poi 0,2126 R + 0,7152 G + 0,0722 B,
   scala 0-1 — NON la luminanza percettiva sui byte grezzi di
   istantanea.js :1457, che serve a un altro scopo non clinico e resta
   quella).
   Un "lampo" (ora: un FLASH WCAG, trovaFlashWCAG piu' sotto) non e' un
   campione isolato: e' una coppia di transizioni OPPOSTE fra ESTREMI
   LOCALI della serie (trovaEstremi), qualificata quando ciascuna delle
   due transizioni ha ampiezza >=0,10 (10% della luminanza relativa
   massima) e luminanza del piu' scuro dei due estremi <0,80 (WCAG 2.2,
   "general flash threshold" — dettagli nel commento di trovaFlashWCAG).
   Poi, per ogni flash, si contano quanti flash (lui compreso) cadono in
   una finestra di un secondo centrata sul suo istante: il MASSIMO su
   tutta la corsa e' la frequenza di picco. Verde se quel massimo e' <= 3
   in ogni finestra, ovunque, sempre (WCAG 2.3.1).

   IL --controllo (obbligatorio: senza di lui un banco sempre verde e'
   indistinguibile da un banco che non guarda). Inietta un lampo VERO a
   schermo intero a 4 Hz — bianco pieno acceso il 30% di ogni ciclo di
   1/4 di secondo, sullo stesso canvas del gioco, misurato con la STESSA
   pipeline (stesso __luce(), stesso trovaFlashWCAG) — e deve uscire
   ROSSO. E' la condanna che prova che il banco discrimina invece di
   attestare.

   IL LIMITE DI QUESTO BANCO (dichiarato in revisione, voce #114, compito
   1 — quello del #112, la soglia PROMINENZA_MIN tarata sul gioco e non
   su una soglia clinica, e' STATO CHIUSO da questa riscrittura: la
   metrica e' ora luminanza relativa WCAG vera e il rilevatore e' la
   definizione WCAG di flash, non un numero tarato). Restano DUE limiti,
   entrambi per costruzione di questo compito (il #114 compito 2 li
   chiude):
     1. NESSUN CRITERIO D'AREA: la media e' whole-canvas, quindi un flash
        piccolo (pochi pixel, come i flash di folla/dischetto) sposta la
        media di una frazione minuscola — quasi certamente sotto 0,10 di
        luminanza relativa — e semplicemente non viene visto come flash,
        qualunque sia la sua frequenza. Questo banco NON puo' ancora
        dimostrare formalmente l'esenzione WCAG per area piccola: puo'
        solo osservare che quei flash restano invisibili alla media (il
        che li rende comunque innocui per QUESTO banco, ma non e' ancora
        la prova WCAG "area sotto soglia" in senso proprio).
     2. NESSUN RED FLASH: nessuna prova sul rosso saturo (R/(R+G+B)>=0,8,
        Δ>0,2 in CIE 1976 UCS) — un flash che resta sotto 0,10 di
        luminanza relativa (es. un rosso-su-rosso) potrebbe comunque
        qualificare come red flash WCAG e questo banco, oggi, non lo
        vedrebbe.
   Il verdetto VERDE di QUESTO compito garantisce «nessun flash generale
   WCAG (luminanza relativa, 10%/0,80) oltre 3 Hz sulla media whole-
   canvas», NON ANCORA «il gioco e' conforme a WCAG 2.3.1» in senso
   pieno (manca l'area e il red flash, compito 2).

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
   LUMINANZA RELATIVA WCAG (voce #114, in luogo della luminanza
   percettiva sui byte grezzi del #112 — quella e' rimasta la metrica di
   istantanea.js :1457, buona per un uso non clinico, ma NON e' la
   luminanza relativa che WCAG richiede: manca la linearizzazione gamma).

   Definizione (WCAG 2.2, glossario "relative luminance",
   https://www.w3.org/TR/WCAG22/#dfn-relative-luminance): per ogni canale
   c in {R,G,B}, csRGB = byte/255; c_lin = csRGB/12,92 se csRGB<=0,04045,
   altrimenti ((csRGB+0,055)/1,055)^2,4; L = 0,2126*R_lin + 0,7152*G_lin +
   0,0722*B_lin. La soglia 0,04045 e' quella IN VIGORE (corretta dal W3C
   nel 2021-2022 rispetto al vecchio 0,03928 di WCAG 2.0/2.1, un'errata
   nota del gruppo di lavoro) — si cita quella attuale, non quella
   superata (studi a edizioni).

   LUT: la linearizzazione e' una funzione di UN SOLO byte (0-255), quindi
   si calcola una volta sola all'installazione (256 valori) invece che per
   ogni canale di ogni pixel a ogni fotogramma — piu' veloce di tre
   Math.pow() per pixel, stesso risultato (l'input e' sempre un intero
   0-255, mai una frazione intermedia).

   La luminanza del fotogramma e' la MEDIA delle luminanze relative dei
   pixel campionati (qui: tutti, nessuno scarto, come nel #112), in scala
   0-1 (non piu' 0-255: chi confronta con vecchi numeri di calibrazione
   del #112 li trova ~255 volte piu' piccoli). */
function installaLettoreLuce() {
  const LUT_LIN = new Float64Array(256);
  for (let i = 0; i < 256; i++) {
    const csRGB = i / 255;
    LUT_LIN[i] = csRGB <= 0.04045 ? csRGB / 12.92 : Math.pow((csRGB + 0.055) / 1.055, 2.4);
  }
  window.__luce = function () {
    const cv = document.getElementById('gioco');
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const d = cx.getImageData(0, 0, W, H).data;
    let somma = 0;
    const n = d.length;
    for (let i = 0; i < n; i += 4) {
      somma += 0.2126 * LUT_LIN[d[i]] + 0.7152 * LUT_LIN[d[i + 1]] + 0.0722 * LUT_LIN[d[i + 2]];
    }
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

/* GLI ESTREMI LOCALI della serie (picchi e valli), con una piccola
   ISTERESI per non scambiare il rumore di quantizzazione fotogramma-a-
   fotogramma per un'inversione di tendenza. Algoritmo a "candidato
   corrente" (lo stesso principio degli indicatori zig-zag): finche' la
   serie prosegue nella direzione in corso si allarga il candidato (il
   punto piu' alto/basso visto finora); quando arriva un ripiegamento di
   almeno ISTERESI dal candidato, il candidato si conferma come estremo e
   la direzione si inverte. Il primo campione e l'ultimo candidato aperto
   a fine serie sono sempre inclusi (bordi di misura). Misurata con
   --calibra sulle scene senza lampi (SERA e DISCHETTO, moto on/off): il
   salto massimo fotogramma-a-fotogramma non supera 0,01 di luminanza
   relativa — ISTERESI qui sotto (0,02) sta sopra quel rumore misurato,
   ma resta comunque molto piu' piccola della soglia di flash (0,10):
   anche con ISTERESI=0 nessun falso lampo passerebbe il cancello di
   ampiezza qui sotto, il margine e' solo per non moltiplicare estremi
   spuri inerti. VERIFICATO: --controllo resta rosso (15 flash su 4 s,
   spaziati esattamente ogni 0,25 s = 4,000 Hz, picco 5 in una finestra di
   1 s — il picco e' 5 e non 4 per un effetto di bordo: la finestra e'
   CHIUSA su [-0,5s,+0,5s] e un segnale a passo esatto 0,25 s allinea
   entrambi gli estremi della finestra su un flash, includendone 5 invece
   di 4; la CADENZA reale, misurata sugli istanti, e' 4,000 Hz esatti) e
   le tre scene del gioco restano verdi con zero falsi flash su SERA e
   DISCHETTO (nessun lampo iniettato, nessuno rilevato). */
const ISTERESI_ESTREMI = 0.02;
function trovaEstremi(serie, isteresi) {
  const idx = [];
  if (!serie.length) return idx;
  idx.push(0);
  let direzione = 0;            // 0 ignota, 1 salita in corso, -1 discesa in corso
  let iCandidato = 0;           // indice del massimo (se direzione=1) o minimo (se -1) visto finora
  for (let i = 1; i < serie.length; i++) {
    const v = serie[i];
    if (direzione === 0) {
      // ancora nessuna direzione stabilita: si confronta sempre contro
      // l'ancora fissa idx[0] (il primo campione), non contro un
      // candidato mobile, finche' un vero movimento non supera ISTERESI.
      const d = v - serie[idx[0]];
      if (d >= isteresi) { direzione = 1; iCandidato = i; }
      else if (-d >= isteresi) { direzione = -1; iCandidato = i; }
    } else if (direzione === 1) {
      if (v >= serie[iCandidato]) iCandidato = i;
      else if (serie[iCandidato] - v >= isteresi) { idx.push(iCandidato); direzione = -1; iCandidato = i; }
    } else {
      if (v <= serie[iCandidato]) iCandidato = i;
      else if (v - serie[iCandidato] >= isteresi) { idx.push(iCandidato); direzione = 1; iCandidato = i; }
    }
  }
  if (direzione !== 0) idx.push(iCandidato);
  return idx;
}

/* IL RILEVATORE DI FLASH WCAG (voce #114, in luogo di PROMINENZA_MIN/
   trovaLampi del #112 — quella soglia era TARATA sul gioco di oggi, "a
   meta' strada fra il rumore e il piu' piccolo segnale vero misurati QUI"
   — non una soglia clinica). Definizione (WCAG 2.2, "general flash
   threshold", Understanding SC 2.3.1,
   https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html):
   un FLASH e' una coppia di transizioni OPPOSTE (salita poi discesa, o
   discesa poi salita) nella luminanza relativa, dove OGNI transizione
   della coppia ha un'ampiezza di almeno 0,10 (10% della luminanza
   relativa massima, 1,0) E la luminanza relativa del piu' SCURO dei due
   estremi che la delimitano e' sotto 0,80.
   Si opera sugli ESTREMI LOCALI della serie (trovaEstremi sopra): fra
   estremi consecutivi c'e' una TRANSIZIONE (idx[k]->idx[k+1]); le
   transizioni si raggruppano DUE a DUE, SENZA SOVRAPPOSIZIONE (una
   transizione che ha gia' formato un flash non ne forma un altro).
   QUESTA e' la correzione del compito 1 (revisione): la prima stesura
   contava un flash a OGNI estremo interno (coppie SOVRAPPOSTE: la stessa
   transizione contava sia come uscita del flash precedente sia come
   entrata del successivo), il che raddoppiava il conteggio rispetto alla
   frequenza fisica del segnale (un'onda quadra periodica a f Hz dava 2f
   flash/s). Con le coppie NON sovrapposte, un segnale periodico a f Hz
   da' f flash/s: il NUMERO diventa la FREQUENZA, che e' esattamente il
   punto di un banco ANCORATO a WCAG 2.3.1 — la soglia "<=3 flash in
   qualunque finestra di 1 s" e' notoriamente equivalente a "<=3 Hz", e lo
   e' solo se il conteggio segue questa convenzione (altrimenti "3 flash"
   nel banco varrebbe 1,5 Hz nel mondo, e il verdetto "conforme a WCAG
   2.3.1" citerebbe una soglia che non e' quella misurata).
   LA SCANSIONE E' GOLOSA, non a parita' fissa dell'indice: si scorre un
   puntatore k lungo le transizioni; se (T[k], T[k+1]) qualificano
   ENTRAMBE si conta un flash e il puntatore avanza di 2 (le due
   transizioni sono consumate, non riusabili); altrimenti il puntatore
   avanza di 1 sola posizione (NON di 2), cosi' la transizione T[k+1] resta
   libera per essere provata insieme a T[k+2]. La differenza conta: nel
   mezzo del gioco vero, prima e dopo un lampo vero ci sono estremi
   REALI (non rumore: movimento di giocatori/palla che trovaEstremi vede
   perche' supera ISTERESI ma non supera mai SOGLIA_AMPIEZZA_FLASH) in
   numero imprevedibile. Una scansione a PARITA' FISSA (transizioni 0+1,
   poi 2+3, poi 4+5, ...) puo' per puro accidente di conteggio associare
   la transizione di entrata del lampo vero a UNA transizione di
   contenuto precedente (fallendo) e la sua transizione di uscita a UNA
   transizione di contenuto successiva (fallendo anch'essa) — orfanizzando
   un flash vero per un disallineamento di parita' che non ha nulla a che
   fare col flash. Misurato: la versione a parita' fissa faceva sparire
   l'unico flash del gol (moto=on, che deve restare ~1, non 0) proprio per
   questo motivo. La scansione golosa non ha questo problema: scorre le
   transizioni non qualificanti una a una senza mai "sprecare" una
   transizione buona abbinandola a una cattiva per un caso di parita'. */
const SOGLIA_AMPIEZZA_FLASH = 0.10;   // WCAG 2.2, 10% della luminanza relativa massima
const SOGLIA_SCURO_FLASH = 0.80;      // WCAG 2.2, luminanza del piu' scuro dei due estremi
function trovaFlashWCAG(serie, fps, isteresi) {
  const idx = trovaEstremi(serie, isteresi);
  const flash = [];
  let k = 0;
  while (k + 2 < idx.length) {
    const a = serie[idx[k]], b = serie[idx[k + 1]], c = serie[idx[k + 2]];
    const entrante = Math.abs(b - a) >= SOGLIA_AMPIEZZA_FLASH && Math.min(a, b) < SOGLIA_SCURO_FLASH;
    const uscente = Math.abs(c - b) >= SOGLIA_AMPIEZZA_FLASH && Math.min(b, c) < SOGLIA_SCURO_FLASH;
    if (entrante && uscente) { flash.push({ i: idx[k + 1], t: idx[k + 1] / fps, v: b }); k += 2; }
    else k += 1;
  }
  return flash;
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
    const lampi = trovaFlashWCAG(rep.serie, FPS, ISTERESI_ESTREMI);
    const { massimo, centroMassimo } = frequenzaMassima(lampi);
    const durata = (rep.serie.length / FPS).toFixed(1);
    const dettaglio = lampi.length + ' flash WCAG su ' + durata + ' s, picco ' + massimo + ' in una finestra di 1 s'
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
