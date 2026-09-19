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

   METODO. Si guarda SIA lo schermo intero (la media whole-canvas, per
   trovare i lampi E la loro frequenza) SIA il singolo pixel (la frazione
   d'area che cambia, per il criterio d'AREA che poi FILTRA quei lampi —
   voce #114 compito 2, vedi installaLettoreLuce e trovaFlashWCAG piu'
   sotto): le due letture nascono dalla STESSA getImageData, un'unica
   lettura del canvas per fotogramma.
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

   IL CRITERIO D'AREA (voce #114, compito 2 — chiude il limite 1 del
   compito 1). E' un FILTRO A VALLE su trovaFlashWCAG (compito 1,
   invariato): fra i fotogrammi della transizione di un flash gia'
   rilevato dalla media whole-canvas, si guarda il picco della frazione
   di pixel che e' cambiata di almeno 0,10 (vedi installaLettoreLuce); se
   supera SOGLIA_AREA_FRAZ (~2,77%) il flash CONTA, altrimenti e' ESENTE
   e non entra nel conteggio di frequenza. E' esattamente cio' che chiede
   il mandato ("un flash RILEVATO conta solo se...").
   UN RILEVATORE D'AREA INDIPENDENTE (non un filtro a valle, ma una
   ricerca di estremi propria sulla serie di "area") E' STATO PROVATO E
   SCARTATO in questa stessa revisione: misurato con --calibra sulle
   scene vere (SERA/DISCHETTO, nessun lampo iniettato), la frazione
   d'area oscilla per il semplice movimento di giocatori/palla fino al
   5-7% del canvas fotogramma per fotogramma — sopra la soglia di
   esenzione e ordini di grandezza sopra il segnale di un flash piccolo
   vero (~0,07% per un quadratino di 15 px). Non esiste un'isteresi che
   separi quel rumore dal segnale: un rilevatore indipendente sul canvas
   intero produceva un FALSO POSITIVO misurato su SERA (4 flash/s di
   picco, senza che nulla fosse mai stato iniettato) che il compito 1 non
   aveva. Il filtro a valle, piu' semplice, non ha questo problema perche'
   eredita la STESSA immunita' al rumore incoerente della media
   whole-canvas (compito 1): il movimento di giocatori in direzioni
   scorrelate si annulla nella media, non nella frazione d'area grezza.
   IL DUBBIO ONESTO SUL FILTRO A VALLE, RISOLTO: per COSTRUZIONE
   ARITMETICA, uno spostamento della media whole-canvas di 0,10 richiede
   un'area di almeno il 10% SE lo sfondo resta immutato (area *
   delta_max_pixel(1,0) >= 0,10 => area>=10%, gia' 4 volte la soglia
   ~2,77%) — un flash isolato su sfondo fermo che la media rileva e'
   quindi SEMPRE sopra soglia d'area, e il filtro sembrerebbe un dead
   code sulle scene vere (difatti: folla/duello, con l'ampiezza che
   hanno oggi, restano invisibili alla media anche PRIMA del filtro
   d'area — limite 1 del compito 1, mai chiuso da un puro filtro a
   valle). Il caso sintetico PICCOLO (vedi eseguiControlloLocale) prova
   pero' che il filtro NON e' un dead code in generale: se lo SFONDO
   cambia anch'esso, ma sotto la soglia di 0,10 per pixel (un lavaggio
   di grigio, che NON entra nel conteggio d'area ma CONTRIBUISCE alla
   media), un quadratino piccolo (sotto soglia d'area) puo' portare la
   media whole-canvas sopra 0,10 pur restando, da solo, sotto la soglia
   d'area — esattamente la distinzione che WCAG traccia fra "il flash e'
   rilevabile" e "il flash e' abbastanza grande da contare": qui il
   filtro ESENTA DAVVERO, misurato, non per costruzione impossibile.

   IL RED FLASH (voce #114, compito 2 — chiude il limite 2 del compito 1).
   trovaRedFlashWCAG (piu' sotto) opera sulla SATURAZIONE ROSSA media del
   fotogramma (R/(R+G+B) sui valori sRGB NON linearizzati — la formula di
   saturazione WCAG vuole i byte grezzi, non la luminanza relativa),
   calcolata nella STESSA lettura di __luce() (nessun secondo passaggio
   sui pixel). Una coppia di transizioni opposte conta come red flash
   quando almeno uno dei due stati ha saturazione >=0,80 E la distanza fra
   i due stati nel diagramma CIE 1976 UCS (u'v', conversione sRGB->lineare
   ->XYZ->u'v', matrice D65 standard IEC 61966-2-1) supera 0,2.
   LIMITE DICHIARATO: la saturazione e' una media whole-canvas, quindi
   soffre della STESSA diluizione della luminanza whole-canvas del
   compito 1 — un red flash confinato a una piccola area (che sposti la
   media di un rosso saturo sotto la sensibilita' del rilevatore) non
   verrebbe visto. Qui NON e' stato aggiunto un rilevatore d'area per il
   red flash (fuori dal perimetro di questo compito): e' innocuo per
   QUESTO gioco perche' la tinta piu' satura fra tutte le maglie
   disponibili (kit fissi + tutte le squadre CPU della rosa, misurato: v.
   nota nel verbale) e' 0,649 di R/(R+G+B) (#7a4200) — sotto 0,80 anche a
   schermo intero, quindi nessuna combinazione di area la farebbe
   qualificare. (Rettifica di revisione: il valore 0,623 scritto prima
   era #ff4d4d, un accento d'interfaccia, non una maglia.)
   Il verdetto VERDE di QUESTO compito garantisce «nessun flash generale
   WCAG (luminanza relativa, 10%/0,80, area >=~2,77% del canvas) e nessun
   red flash (saturazione >=0,80, Δu'v'>0,2) oltre 3 Hz» sulle scene
   provate — la verifica autorevole promessa dallo spec arriva col
   compito 3 (batteria completa + verbale).

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
   del #112 li trova ~255 volte piu' piccoli).

   VOCE #114 COMPITO 2 — DUE LETTURE IN PIU', STESSA getImageData (un
   unico accesso ai pixel per fotogramma, mai due):
     (1) AREA: oltre alla media, si campiona (passo AREA_PASSO=4, "1
         pixel ogni 4" in ciascuna dimensione — 16 volte meno pixel — come
         suggerito dal mandato: il calcolo pixel-per-pixel di due
         fotogrammi consecutivi a piena risoluzione e' evitabile, l'area
         e' comunque una FRAZIONE statistica, non un conteggio esatto) la
         luminanza relativa dei pixel scelti e la si confronta con lo
         STESSO campione del fotogramma precedente (chiuso in questa
         closure, azzerato da __areaReset fra una scena sintetica/reale e
         l'altra — vedi eseguiScena/eseguiControllo*). La frazione di
         campioni che cambia di almeno 0,10 di luminanza relativa (la
         STESSA soglia WCAG del flash generale, applicata pixel per pixel
         invece che sulla media) e' "area" del fotogramma — usata da
         trovaFlashWCAG lato Node come filtro a valle (vedi il commento
         "IL CRITERIO D'AREA" in cima al file per il perche' e' un filtro
         e non un rilevatore proprio).
         Primo fotogramma di ogni serie: nessun precedente, area=0.
     (2) COLORE MEDIO GREZZO (r,g,b in 0-1, sRGB NON linearizzato — la
         formula di saturazione rossa WCAG, R/(R+G+B), vuole i byte
         grezzi, non la luminanza relativa): serve a trovaRedFlashWCAG.
         Calcolato nello STESSO ciclo a piena risoluzione della luminanza
         (tre accumulatori in piu', nessun secondo giro sui pixel).

   NOTA TECNICA: questa funzione e' iniettata via page.addInitScript e
   girera' DENTRO la pagina, isolata dallo scope Node — non puo' leggere
   le const definite piu' sotto in questo file (SOGLIA_AMPIEZZA_FLASH,
   ecc: quelle sono lato Node, per trovaFlashWCAG). Percio'
   AREA_PASSO e la soglia dell'area sono ridichiarate QUI, localmente,
   come gia' faceva bancoDiProva con PASSO=1000/60. Sono la STESSA cifra
   e la STESSA fonte (WCAG 2.2, general flash threshold, 10%): se una
   cambia, l'altra va cambiata a mano — un solo punto lato Node e uno
   lato pagina, non automaticamente sincronizzati, dichiarato qui perche'
   non sia una sorpresa in revisione. */
function installaLettoreLuce() {
  const AREA_PASSO = 4;                    // "1 pixel ogni 4" per lato, dichiarato nel mandato
  const SOGLIA_AMPIEZZA_PIXEL = 0.10;      // WCAG 2.2 general flash threshold, 10% — v. SOGLIA_AMPIEZZA_FLASH lato Node
  const LUT_LIN = new Float64Array(256);
  for (let i = 0; i < 256; i++) {
    const csRGB = i / 255;
    LUT_LIN[i] = csRGB <= 0.04045 ? csRGB / 12.92 : Math.pow((csRGB + 0.055) / 1.055, 2.4);
  }
  let campionePrec = null;   // Float32Array del fotogramma precedente, per l'area
  window.__areaReset = function () { campionePrec = null; };
  window.__luce = function () {
    const cv = document.getElementById('gioco');
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const d = cx.getImageData(0, 0, W, H).data;
    const n = d.length;
    let sommaLum = 0, sommaR = 0, sommaG = 0, sommaB = 0;
    for (let i = 0; i < n; i += 4) {
      sommaLum += 0.2126 * LUT_LIN[d[i]] + 0.7152 * LUT_LIN[d[i + 1]] + 0.0722 * LUT_LIN[d[i + 2]];
      sommaR += d[i]; sommaG += d[i + 1]; sommaB += d[i + 2];
    }
    const nPix = n / 4;
    /* l'area: un secondo giro, MOLTO piu' raro (passo AREA_PASSO in
       entrambe le dimensioni), sullo STESSO buffer d gia' letto sopra */
    const campioneOra = new Float32Array(Math.ceil(W / AREA_PASSO) * Math.ceil(H / AREA_PASSO));
    let iCamp = 0, cambiati = 0;
    for (let y = 0; y < H; y += AREA_PASSO) {
      const riga = y * W;
      for (let x = 0; x < W; x += AREA_PASSO) {
        const i = (riga + x) * 4;
        const lumPix = 0.2126 * LUT_LIN[d[i]] + 0.7152 * LUT_LIN[d[i + 1]] + 0.0722 * LUT_LIN[d[i + 2]];
        campioneOra[iCamp] = lumPix;
        if (campionePrec && Math.abs(lumPix - campionePrec[iCamp]) >= SOGLIA_AMPIEZZA_PIXEL) cambiati++;
        iCamp++;
      }
    }
    const area = campionePrec ? cambiati / iCamp : 0;
    campionePrec = campioneOra;
    return { lum: sommaLum / nPix, area, r: sommaR / nPix / 255, g: sommaG / nPix / 255, b: sommaB / nPix / 255 };
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
/* PARAMETRO: qui "rec" e' l'array di RECORD per fotogramma prodotto da
   __luce() lato pagina ({lum,area,r,g,b}), non piu' un array di numeri
   nudi (voce #114 compito 2 — serve anche "area" per il cancello sotto).
   La logica di rilevamento e' INVARIATA dal compito 1: opera sulla serie
   di LUMINANZA (rec[i].lum), estraendola qui. */
function trovaFlashWCAG(rec, fps, isteresi) {
  const serie = rec.map(x => x.lum);
  const idx = trovaEstremi(serie, isteresi);
  const flash = [];
  let k = 0;
  while (k + 2 < idx.length) {
    const a = serie[idx[k]], b = serie[idx[k + 1]], c = serie[idx[k + 2]];
    const entrante = Math.abs(b - a) >= SOGLIA_AMPIEZZA_FLASH && Math.min(a, b) < SOGLIA_SCURO_FLASH;
    const uscente = Math.abs(c - b) >= SOGLIA_AMPIEZZA_FLASH && Math.min(b, c) < SOGLIA_SCURO_FLASH;
    if (entrante && uscente) {
      /* IL CRITERIO D'AREA (voce #114 compito 2): fra i fotogrammi della
         transizione (dall'estremo d'entrata a quello d'uscita), il picco
         della frazione d'area che lampeggia. "conta" se supera
         SOGLIA_AREA_FRAZ (vedi sotto): altrimenti il flash e' ESENTE
         (rilevato, ma non qualifica per 2.3.1 — non entra nel conteggio
         di frequenza, vedi frequenzaMassima(flashContano) piu' sotto). */
      let areaPicco = 0;
      for (let i = idx[k]; i <= idx[k + 2]; i++) if (rec[i].area > areaPicco) areaPicco = rec[i].area;
      flash.push({ i: idx[k + 1], t: idx[k + 1] / fps, v: b, area: areaPicco, conta: areaPicco > SOGLIA_AREA_FRAZ });
      k += 2;
    } else k += 1;
  }
  return flash;
}

/* IL CRITERIO D'AREA — LA SOGLIA (voce #114 compito 2, spec/piano
   19/9/2026). WCAG 2.2, "general flash and red flash thresholds",
   Understanding SC 2.3.1: un flash conta per 2.3.1 solo se l'area
   combinata supera 0,006 steradianti = 25% di un campo visivo di 10
   gradi; risoluzione di riferimento WCAG per stimare quel campo: un
   rettangolo di 341x256 px su uno schermo di 1024x768 px (a distanza
   tipica di visione). Si scrive la formula per intero, non il numero
   arrotondato, cosi' la provenienza resta verificabile a colpo d'occhio:
   25% dell'area di riferimento (341*256*0,25 = 21824 px) sul totale
   dell'area di riferimento (1024*768 = 786432 px) = 0,027751 (2,7751%)
   (correzione voce #114 compito 3: il commento del compito 2 arrotondava
   a 0,027753/2,7753%, un refuso di calcolo a mano di due decimillesimi —
   il valore VERO, quello che SOGLIA_AREA_FRAZ calcola davvero dalla
   formula qui sotto, e' 0,0277506...).
   APPROSSIMAZIONE DICHIARATA: e' una frazione di SCHERMO derivata dalla
   risoluzione e distanza di riferimento WCAG, non una misura in
   steradianti del campo visivo REALE di chi gioca (che dipende dal
   dispositivo e dalla distanza vera) — il mandato la richiede come
   proxy, e la dichiara "robusta in pratica" perche' folla/duello sono
   due ordini di grandezza sotto (vedi i numeri nel verbale) e il gol e'
   a schermo intero (due ordini di grandezza sopra): l'approssimazione
   non decide nessun caso vicino al confine, in questo gioco. */
const SOGLIA_AREA_FRAZ = (341 * 256 * 0.25) / (1024 * 768);

/* PERCHE' NON SERVE UN SECONDO RILEVATORE (scoperta di progettazione,
   misurata e non un'opinione — tentata e scartata in revisione). Un
   "filtro d'area indipendente" (una serie propria, estremi propri sulla
   FRAZIONE d'area anziche' sulla media) SEMBRA la scelta ovvia, ma
   MISURATO sulle scene vere (--calibra, SERA/DISCHETTO: nessun lampo
   iniettato) la frazione d'area campionata oscilla per il semplice
   movimento di giocatori/palla fino al 5-7% del canvas fotogramma per
   fotogramma — SOPRA la soglia di esenzione (~2,77%) e ORDINI DI
   GRANDEZZA sopra il segnale vero di un flash piccolo sintetico (~0,07%
   per un quadratino di 15 px): non esiste un'isteresi che separi il
   rumore di movimento normale dal segnale, un rilevatore d'area
   indipendente sul canvas intero condanna SERA (misurato: 4 flash/s
   picco da pura animazione, in un run in cui non e' mai stato iniettato
   nulla) — un FALSO POSITIVO che il compito 1 non aveva. Scartato.
   Il criterio d'area RESTA quindi un FILTRO A VALLE su trovaFlashWCAG
   (l'unico rilevatore, quello del compito 1, invariato), esattamente
   come richiesto dal mandato ("un flash RILEVATO conta solo se..."). */

/* ================================= IL RED FLASH (voce #114 compito 2) ===
   WCAG 2.2, "red flash threshold", Understanding SC 2.3.1
   (https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html):
   una coppia di transizioni opposte conta come RED FLASH quando almeno
   uno dei due stati che la delimitano e' un rosso saturo — R/(R+G+B) >=
   0,8, sui valori sRGB 0-1 NON linearizzati (e' una formula di
   saturazione del colore percepito, non di luminanza fisica: qui si
   vuole il byte grezzo, non il valore linearizzato di __luce()) — E la
   differenza fra i due stati nel diagramma di cromaticita' CIE 1976 UCS
   (u',v') supera 0,2. */
function linearizzaContinuo(c) {
  // stessa formula della LUT lato pagina, ma per un valore CONTINUO 0-1
  // (la media multi-pixel non e' un byte 0-255: la LUT non si applica)
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
/* sRGB (0-1) -> XYZ, matrice standard D65 (IEC 61966-2-1, la stessa
   matrice di conversione sRGB->XYZ ovunque citata per questo spazio
   colore) -> u'v' (CIE 1976 UCS): u'=4X/(X+15Y+3Z), v'=9Y/(X+15Y+3Z) —
   formula citata nello spec del #114 (19/9/2026). */
function srgbAUv(r, g, b) {
  const R = linearizzaContinuo(r), G = linearizzaContinuo(g), B = linearizzaContinuo(b);
  const X = 0.4124 * R + 0.3576 * G + 0.1805 * B;
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const Z = 0.0193 * R + 0.1192 * G + 0.9505 * B;
  const den = Math.max(X + 15 * Y + 3 * Z, 1e-9);   // guardia: nero puro (0,0,0) darebbe 0/0
  return { u: 4 * X / den, v: 9 * Y / den };
}
function deltaUV(c1, c2) {
  const p1 = srgbAUv(c1.r, c1.g, c1.b), p2 = srgbAUv(c2.r, c2.g, c2.b);
  return Math.hypot(p1.u - p2.u, p1.v - p2.v);
}
/* R/(R+G+B) sui byte grezzi sRGB 0-1: la formula di saturazione rossa
   WCAG. Guardia sul nero puro (somma~0): non e' un rosso saturo, si
   dichiara 0 invece di NaN (0/0). */
function saturazioneRossa(c) {
  const somma = c.r + c.g + c.b;
  return somma > 1e-6 ? c.r / somma : 0;
}
const SOGLIA_SATURAZIONE_ROSSO = 0.80;   // WCAG 2.2, R/(R+G+B) >= 0,8
const SOGLIA_DELTA_UV = 0.2;             // WCAG 2.2, distanza CIE 1976 UCS > 0,2
/* ISTERESI_ROSSO: misurata con --calibra come ISTERESI_ESTREMI (v. sopra)
   — sopra il rumore di saturazione osservato su SERA/DISCHETTO a riposo,
   molto sotto SOGLIA_SATURAZIONE_ROSSO/SOGLIA_DELTA_UV (che restano il
   vero cancello di qualificazione: l'isteresi qui serve solo a trovare
   gli estremi della serie, non a decidere il verdetto). */
const ISTERESI_ROSSO = 0.02;
function trovaRedFlashWCAG(rec, fps) {
  const serie = rec.map(saturazioneRossa);
  const idx = trovaEstremi(serie, ISTERESI_ROSSO);
  const flash = [];
  let k = 0;
  while (k + 2 < idx.length) {
    const a = rec[idx[k]], b = rec[idx[k + 1]], c = rec[idx[k + 2]];
    const dAB = deltaUV(a, b), dBC = deltaUV(b, c);
    const sAB = Math.max(saturazioneRossa(a), saturazioneRossa(b));
    const sBC = Math.max(saturazioneRossa(b), saturazioneRossa(c));
    const entrante = dAB > SOGLIA_DELTA_UV && sAB >= SOGLIA_SATURAZIONE_ROSSO;
    const uscente = dBC > SOGLIA_DELTA_UV && sBC >= SOGLIA_SATURAZIONE_ROSSO;
    if (entrante && uscente) { flash.push({ i: idx[k + 1], t: idx[k + 1] / fps, sat: serie[idx[k + 1]] }); k += 2; }
    else k += 1;
  }
  return flash;
}

/* la frequenza di picco: per ogni lampo, quanti lampi (lui compreso)
   cadono in una finestra di un secondo CENTRATA sul suo istante. Il
   massimo su tutta la corsa e' il numero che conta: >3 e' rosso.
   Generica: usa solo il campo ".t" — serve per il flash generale (solo
   quelli che "contano" per area, vedi flashContano piu' sotto) e per il
   red flash. */
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
    window.__areaReset();   // ogni scena riparte con la sua base d'area (voce #114 compito 2)
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
    window.__areaReset();
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

/* IL CASO PICCOLO (voce #114 compito 2 — "il banco deve MISURARE, non
   attestare"): la dimostrazione che l'esenzione d'area esenta DAVVERO, e
   non che il flash e' semplicemente invisibile alla media (limite gia'
   dichiarato del compito 1). UN QUADRATINO DA SOLO NON BASTA A
   DIMOSTRARLO: per costruzione aritmetica un flash isolato su sfondo
   fermo che sposta la media whole-canvas di 0,10 (la soglia che lo fa
   RILEVARE) copre SEMPRE almeno il 10% del canvas — gia' quattro volte
   la soglia di esenzione (~2,77%) — quindi non sarebbe mai esentato: si
   limiterebbe a restare invisibile, come oggi (vedi il commento "IL
   CRITERIO D'AREA" in cima al file per la prova per esteso).
   LA COSTRUZIONE CHE FUNZIONA: uno SFONDO che lampeggia anch'esso, ma
   SOTTO 0,10 di luminanza relativa per pixel (un lavaggio grigio — non
   entra MAI nel conteggio d'area, che conta solo pixel con |Δ|>=0,10),
   PIU' un quadratino piccolo che lampeggia a piena ampiezza (nero<->
   bianco). Il quadratino da solo resta sotto soglia d'area; il lavaggio
   da solo resta sotto 0,10 quindi trovaEstremi/trovaFlashWCAG non lo
   vedrebbe nemmeno come lampo; ASSIEME, il loro contributo alla MEDIA
   whole-canvas supera 0,10 (rilevato) mentre l'AREA che li supera
   individualmente resta il solo quadratino (esente). Numeri (calcolati
   con la stessa formula di luminanza relativa di installaLettoreLuce,
   canvas 915x412):
     LATO_PATCH=100 px (10000 px, 2,653% del canvas — sotto SOGLIA_AREA_FRAZ
     ~2,7751%); V_SFONDO=81 (grigio #515151, luminanza relativa 0,0823 —
     sotto 0,10, quindi MAI contato nell'area); ampiezza whole-canvas fra
     "acceso" (patch bianco 1,0 + sfondo grigio 0,0823) e "spento" (tutto
     nero, 0) = 0,02653*1,0 + 0,97347*0,0823 = 0,1066 — sopra
     SOGLIA_AMPIEZZA_FLASH (0,10), con margine di sicurezza ~6,6%.
   Posizione (8,8) e lato multiplo di AREA_PASSO=4: il campionamento
   dell'area cade esattamente sui bordi del quadratino, senza rumore di
   allineamento. DEVE restare VERDE anche a 4 Hz. */
const LATO_PATCH_PICCOLO = 100;
const V_SFONDO_PICCOLO = 81;
async function eseguiControlloLocale(pag, hz) {
  return pag.evaluate(({ hz, lato, vBg }) => {
    window.__areaReset();
    const cv = document.getElementById('gioco');
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const FPS = 60;
    const periodo = FPS / hz;
    const acceso = Math.max(2, Math.round(periodo * 0.30));
    const N = 240;
    const serie = [];
    const grigio = 'rgb(' + vBg + ',' + vBg + ',' + vBg + ')';
    const px = 8, py = 8;
    for (let i = 0; i < N; i++) {
      const on = (i % periodo) < acceso;
      // "acceso": sfondo grigio (sotto soglia d'area) + quadratino bianco
      // (sopra); "spento": tutto nero — un solo fillRect di sfondo, poi
      // il quadratino, ogni fotogramma (niente stato residuo da pulire)
      cx.fillStyle = on ? grigio : '#000000';
      cx.fillRect(0, 0, W, H);
      cx.fillStyle = on ? '#ffffff' : '#000000';
      cx.fillRect(px, py, lato, lato);
      serie.push(window.__luce());
    }
    return { serie };
  }, { hz, lato: LATO_PATCH_PICCOLO, vBg: V_SFONDO_PICCOLO });
}

/* IL CASO RED FLASH (voce #114 compito 2): schermo intero che alterna un
   rosso saturo (#ff0000, R/(R+G+B)=1,0 >= 0,80) e lo sfondo scuro del
   gioco (#0c110d, non rosso), alla stessa cadenza/duty cycle dei casi
   sopra. DEVE uscire ROSSO sul canale red flash (e, per costruzione,
   anche sul canale generale: un'escursione di luminanza cosi' grande a
   schermo intero qualifica per ENTRAMBI i criteri — coerente con WCAG,
   dove i due criteri non si escludono a vicenda). */
async function eseguiControlloRosso(pag, hz) {
  return pag.evaluate(hz => {
    window.__areaReset();
    const cv = document.getElementById('gioco');
    const cx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const FPS = 60;
    const periodo = FPS / hz;
    const acceso = Math.max(2, Math.round(periodo * 0.30));
    const N = 240;
    const serie = [];
    for (let i = 0; i < N; i++) {
      const on = (i % periodo) < acceso;
      cx.fillStyle = on ? '#ff0000' : '#0c110d';
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
    + (controllo ? '  [--controllo: 3 casi sintetici nati per condannare/esentare]' : '')
    + (calibra ? '  [--calibra: solo numeri, nessun verdetto]' : ''));

  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(installaLettoreLuce);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => window.__banco.passo(10));
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  const referti = [];

  if (controllo) {
    /* I TRE CASI SINTETICI (voce #114 compito 2 — "ogni nuova regola
       nasce in grado di condannare/esentare davvero", vedi spec/piano
       19/9/2026). GRANDE prova il criterio generale+area insieme (deve
       restare rosso come nel compito 1 — la stessa iniezione a 4 Hz);
       PICCOLO prova che l'esenzione d'area esenta DAVVERO (deve restare
       verde nonostante gli stessi 4 Hz); ROSSO prova il canale red flash
       (deve uscire rosso). */
    const rGrande = await eseguiControllo(pag, 4);
    referti.push({ nome: 'CONTROLLO GRANDE 4 Hz (schermo intero, lampo bianco iniettato)', serie: rGrande.serie });
    const rPiccolo = await eseguiControlloLocale(pag, 4);
    referti.push({ nome: 'CONTROLLO PICCOLO 4 Hz (quadratino 100x100 px sotto soglia d\'area + lavaggio grigio sotto soglia d\'ampiezza)', serie: rPiccolo.serie });
    const rRosso = await eseguiControlloRosso(pag, 4);
    referti.push({ nome: 'CONTROLLO RED FLASH 4 Hz (schermo intero, rosso saturo #ff0000)', serie: rRosso.serie });
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
      const rec = rep.serie || [];
      if (!rec.length) { console.log(rep.nome + ': nessun campione (' + (rep.errore || '') + ')'); continue; }
      const lum = rec.map(x => x.lum), area = rec.map(x => x.area), sat = rec.map(saturazioneRossa);
      const base = mediana(lum);
      let max = -Infinity, min = Infinity;
      for (const v of lum) { if (v > max) max = v; if (v < min) min = v; }
      let rumoreMax = 0;
      for (let i = 1; i < lum.length; i++) { const d = Math.abs(lum[i] - lum[i - 1]); if (d > rumoreMax) rumoreMax = d; }
      let areaMax = 0; for (const v of area) if (v > areaMax) areaMax = v;
      let areaRumore = 0;
      for (let i = 1; i < area.length; i++) { const d = Math.abs(area[i] - area[i - 1]); if (d > areaRumore) areaRumore = d; }
      let satMax = -Infinity, satMin = Infinity;
      for (const v of sat) { if (v > satMax) satMax = v; if (v < satMin) satMin = v; }
      console.log(rep.nome + ':  n=' + lum.length + '  mediana=' + base.toFixed(4)
        + '  min=' + min.toFixed(4) + '  max=' + max.toFixed(4)
        + '  escursione=' + (max - base).toFixed(4) + '  salto max fra due fotogrammi=' + rumoreMax.toFixed(4)
        + '  |  area: picco=' + (areaMax * 100).toFixed(3) + '%  salto max=' + (areaRumore * 100).toFixed(3) + '%'
        + '  |  saturaz.rossa: min=' + satMin.toFixed(3) + ' max=' + satMax.toFixed(3));
    }
    await ctx.close(); await browser.close(); srv.chiudi();
    process.exit(0);
  }

  for (const rep of referti) {
    if (rep.errore && !(rep.serie && rep.serie.length)) {
      di(false, rep.nome, 'BANCO: ' + rep.errore + ' — non ho misurato');
      continue;
    }
    /* IL FLASH GENERALE: trovaFlashWCAG (compito 1, INVARIATO) rileva
       sulla media whole-canvas; il CRITERIO D'AREA (compito 2) e' un
       filtro A VALLE sui flash cosi' trovati — "conta" solo se l'area di
       picco nella sua transizione supera SOGLIA_AREA_FRAZ, altrimenti e'
       ESENTE (rilevato ma non qualifica per 2.3.1 — vedi il commento
       "PERCHE' NON SERVE UN SECONDO RILEVATORE" sopra trovaRedFlashWCAG
       per la scoperta che ha escluso un rilevatore d'area indipendente). */
    const lampi = trovaFlashWCAG(rep.serie, FPS, ISTERESI_ESTREMI);
    const flashContano = lampi.filter(f => f.conta);
    const esenti = lampi.length - flashContano.length;
    const areaPicco = lampi.length ? Math.max(...lampi.map(f => f.area || 0)) : 0;
    const { massimo, centroMassimo } = frequenzaMassima(flashContano);

    /* IL RED FLASH: canale indipendente (voce #114 compito 2), stessa
       finestra di 1 s, stesso criterio <=3. */
    const redFlash = trovaRedFlashWCAG(rep.serie, FPS);
    const { massimo: massimoRed, centroMassimo: centroRed } = frequenzaMassima(redFlash);

    const durata = (rep.serie.length / FPS).toFixed(1);
    const dettaglio = lampi.length + ' flash rilevati (' + flashContano.length + ' sopra soglia d\'area, '
      + esenti + ' esenti), area di picco ' + (areaPicco * 100).toFixed(2) + '% (soglia '
      + (SOGLIA_AREA_FRAZ * 100).toFixed(2) + '%), picco frequenza ' + massimo + '/s'
      + (centroMassimo !== null ? ' (a t=' + centroMassimo.toFixed(2) + 's)' : '')
      + '  |  red flash: ' + redFlash.length + ' rilevati, picco ' + massimoRed + '/s'
      + (centroRed !== null ? ' (a t=' + centroRed.toFixed(2) + 's)' : '')
      + '  su ' + durata + ' s'
      + (rep.errore ? '  [nota: ' + rep.errore + ']' : '');
    /* STESSO CRITERIO, SEMPRE: <=3 in ogni finestra di un secondo e'
       verde (su ENTRAMBI i canali, generale e red flash), >3 su ALMENO
       UNO e' rosso — coerente con WCAG 2.3.1 ("non piu' di 3 flash
       generali E/O 3 red flash"). Con --controllo i tre casi sintetici
       DEVONO far scattare questo stesso criterio come previsto — nessuna
       inversione di comodo: un "verde perche' il rosso era atteso"
       sarebbe l'attestazione che il mandato vieta. */
    di(massimo <= 3 && massimoRed <= 3, rep.nome, dettaglio);
  }

  if (ecc.length) di(false, 'nessuna eccezione di pagina', ecc[0]);

  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  await ctx.close(); await browser.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
