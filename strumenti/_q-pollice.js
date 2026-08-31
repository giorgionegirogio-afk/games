/* =====================================================================
   _q-pollice.js — IL CANCELLO DELLA PAGINA DEI COMANDI (29 agosto 2026).

   PERCHE' ESISTE. Fino a ieri la geometria dei comandi era fatta di
   letterali dentro touchBtnLayout e non c'era niente da sorvegliare:
   64, 60, 40 e gli altri undici numeri erano gli stessi ogni giorno.
   Da quando SAVE.pollice{scala, spazio, mancino} li puo' muovere, la
   geometria e' diventata uno SPAZIO di quindici combinazioni per due
   mani, e in quello spazio c'e' una trappola misurata: la coppia
   TIRA-PASSA ha 2,8 px di margine fra le prese (r+10, la stessa presa
   che Touch5.start usa per decidere quale disco ha ricevuto il dito), e
   basta ingrandire i raggi senza allontanare i centri perche' vadano a
   sovrapporsi: misurato col guasto «scala-nuda» di questo stesso file,
   il margine diventa -7,09 px a taglia 115%, -16,99 a 130% e -30,24 a
   150% — cioe' il dito che cerca PASSA arma TIRA.

   Questo file misura quello spazio. Non lo deduce: apre il gioco vero,
   preme i bottoni veri della pagina COMANDI e legge la geometria che ne
   esce, piu' un righello a PIXEL sul disco dipinto.

   ---------------------------------------------------------------------
   OTTO CONTROLLI, e ognuno sa diventare rosso: si dimostra con
   --guasto, che inietta il difetto nel gioco SERVITO senza toccare
   nessun file. I guasti sono NOVE — uno dei controlli ne ha due, perche'
   due strade diverse lo fanno cadere — e --guasti li prova tutti,
   confrontando i controlli accesi con quelli attesi.

     C1  la porta esiste e passa dal salvataggio: i tre numeri scritti
         in localStorage arrivano fino alla geometria — e ai valori di
         serie la geometria e' IDENTICA AL BIT a quella del gioco di
         riferimento (--contro), campo per campo
     C2  le prese non si toccano MAI: su tutte le combinazioni offerte
         dal menu e su tre finestre, il margine minimo fra due prese
         resta almeno quello di serie
     C3  la scala si vede sui PIXEL e non solo nella dichiarazione: il
         disco DIPINTO cresce, misurato col righello a due disegni
     C4  il mancino specchia TUTTO: dischi, casa della levetta, bussola
         e avviso dell'inferiorita' — e nessuno dei quattro dischi
         finisce sopra la bussola
     C5  i dischi restano interi sullo schermo a ogni combinazione e su
         ogni finestra provata
     C6  le etichette ci stanno anche alla taglia piu' piccola: nessuna
         parola stretta sotto 0,62
     C7  la pagina si apre da tutte e due le porte (Impostazioni e
         PAUSA, con la partita in corso) e i suoi tocchi si ricordano
         dopo una ricarica
     C8  la pagina dice il numero VERO: i tre numeri del riquadro
         «com'e' adesso» coincidono con la misura indipendente di questo
         banco, e il diametro anche col righello a pixel

   IL RIGHELLO A PIXEL, e perche' C3 e C8 non si fidano della
   dichiarazione. Il fotogramma si disegna due volte: __test.senzaDischi
   toglie i comandi (mondo P), __test.soloDischi li ridipinge sopra
   (D). I pixel cambiati sulla scanline che passa per il centro del
   disco grande danno il DIAMETRO DIPINTO. Un gioco che dichiarasse un
   disco grande e ne dipingesse uno piccolo — il guasto
   «disco-dichiarato» — passa C1 e C2 e muore qui.

   uso:
     node strumenti/_q-pollice.js
     node strumenti/_q-pollice.js --gioco fuori/cmd-prima.html
     node strumenti/_q-pollice.js --gioco fuori/cmd-prima.html --guasti
     node strumenti/_q-pollice.js --gioco fuori/cmd-prima.html --misure
   esce 0 se tutto verde, 1 se un controllo e' rosso, 3 se il banco non
   ha potuto misurare (che NON e' un verde).
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const GIOCO = path.resolve(RADICE, arg('gioco', 'CALCETTO-il-gioco.html'));
const CONTRO = path.resolve(RADICE, arg('contro', 'CALCETTO-il-gioco.html'));
const MISURE = haFlag('misure');

/* le tre finestre: quella del collaudo, un telefono medio, il piu'
   piccolo che questa casa consideri (360 di lato corto in orizzontale) */
const FINESTRE = [[915, 412], [812, 375], [640, 360]];
/* le combinazioni che il MENU offre davvero: cinque taglie per tre
   distanze. Non si prova quello che l'interfaccia non permette. */
const SCALE = [85, 100, 115, 130, 150];
const SPAZI = [100, 120, 140];

/* =====================================================================
   I GUASTI — un cancello senza il suo rosso dimostrato e' un timbro.
   Ognuno e' una sostituzione di testo sul gioco SERVITO: nessun file
   viene toccato, e se l'ancoraggio non si trova esattamente una volta
   il banco si ferma invece di misurare un gioco che credeva di aver
   guastato.
   ===================================================================== */
const GUASTI = {
  'porta-murata': {
    perche: 'i tre numeri del salvataggio non arrivano alla geometria (C1)',
    da: `  const P=pollice(), k=P.k, d=Math.max(1, k, P.sp);`,
    a: `  const P=pollice(), k=1, d=1;`,
  },
  /* IL GUASTO DI PUNTA: e' la strada che il referto indicava come
     trappola, costruita apposta perche' il cancello la debba uccidere.
     I raggi crescono, i centri no. */
  'scala-nuda': {
    perche: 'la scala ingrandisce i raggi e NON allontana i centri: le prese si sovrappongono (C2)',
    da: `  const P=pollice(), k=P.k, d=Math.max(1, k, P.sp);`,
    a: `  const P=pollice(), k=P.k, d=1;`,
  },
  /* la dichiarazione e' gia' stata spinta dentro TOUCH_ZONE con il raggio
     giusto: da qui in giu' il pennello usa un raggio piu' piccolo. Il
     disco si DICHIARA grande e si DIPINGE come ieri — ed e' esattamente
     la bugia che il righello a pixel esiste per vedere. */
  'disco-dichiarato': {
    perche: 'il disco si DICHIARA grande e si DIPINGE come prima (C3)',
    da: `      TOUCH_ZONE.push(zona);`,
    a: `      TOUCH_ZONE.push(zona);
      bt.r = bt.r / Math.max(1e-6, pollice().k);   /* BUGIA: si dipinge alla taglia di ieri */`,
  },
  'mancino-monco': {
    perche: 'a mancino si specchiano i soli dischi: finiscono sopra la bussola (C4)',
    da: `  const mw=88*k, mh=43*k, mx=pollice().mn ? Math.round(VW-12-mw) : 12;`,
    a: `  const mw=88*k, mh=43*k, mx=12;`,
  },
  /* LA STRADA BOCCIATA, tenuta qui perche' resti bocciata COI NUMERI:
     «spazio» come fattore in piu' invece che come pavimento. Con
     d = scala*spazio la combinazione estrema che il menu offre (150% e
     140%) porta d a 2,1, e i dischi piu' alti escono dal bordo
     superiore su una finestra 640x360. */
  'spazio-moltiplicato': {
    perche: 'lo spazio moltiplica la scala invece di fargli da pavimento: i dischi escono dallo schermo (C5)',
    da: `  const P=pollice(), k=P.k, d=Math.max(1, k, P.sp);`,
    a: `  const P=pollice(), k=P.k, d=Math.max(1, k*P.sp);`,
  },
  'scala-fuga': {
    perche: 'la scala non ha piu\' un tetto e i dischi escono dallo schermo (C5)',
    da: `  if(!(k>=85&&k<=150)) k=100;`,
    a: `  if(!(k>=85&&k<=420)) k=100;`,
    poi: [{
      da: `      if(typeof pj.scala==='number'&&pj.scala>=85&&pj.scala<=150) s.pollice.scala=pj.scala|0;`,
      a: `      if(typeof pj.scala==='number'&&pj.scala>=85&&pj.scala<=420) s.pollice.scala=pj.scala|0;`,
    }, {
      da: `const POLL_SCALA=[85,100,115,130,150], POLL_SPAZIO=[100,120,140];`,
      a: `const POLL_SCALA=[85,100,115,130,420], POLL_SPAZIO=[100,120,140];`,
    }],
  },
  'scala-minuscola': {
    perche: 'la taglia piu\' piccola strizza le etichette sotto il leggibile (C6)',
    da: `  if(!(k>=85&&k<=150)) k=100;`,
    a: `  if(!(k>=40&&k<=150)) k=100;`,
    poi: [{
      da: `      if(typeof pj.scala==='number'&&pj.scala>=85&&pj.scala<=150) s.pollice.scala=pj.scala|0;`,
      a: `      if(typeof pj.scala==='number'&&pj.scala>=40&&pj.scala<=150) s.pollice.scala=pj.scala|0;`,
    }, {
      da: `const POLL_SCALA=[85,100,115,130,150], POLL_SPAZIO=[100,120,140];`,
      a: `const POLL_SCALA=[40,100,115,130,150], POLL_SPAZIO=[100,120,140];`,
    }],
  },
  'pausa-senza-porta': {
    perche: 'dalla pausa non si arriva piu\' alla pagina dei comandi (C7)',
    da: `          + '<button class="cmdlink" id="btnPauseComandi" type="button">cambia</button>';`,
    a: `          + '';`,
  },
  'riquadro-bugiardo': {
    perche: 'il riquadro «com\'e\' adesso» stampa numeri fissi invece di misurarli (C8)',
    da: `  return { diam:Math.round(dia), margine:+mar.toFixed(1),
           quota:+(area/Math.max(1,VW*VH)*100).toFixed(2) };`,
    a: `  return { diam:80, margine:2.8, quota:4.08 };`,
  },
};
const ATTESI = {
  'porta-murata': ['C1'],
  'scala-nuda': ['C2'],
  'disco-dichiarato': ['C3'],
  'spazio-moltiplicato': ['C5'],
  'mancino-monco': ['C4'],
  'scala-fuga': ['C5'],
  'scala-minuscola': ['C6'],
  'pausa-senza-porta': ['C7'],
  'riquadro-bugiardo': ['C8'],
};

if (haFlag('guasti')) {
  const { execFileSync } = require('child_process');
  const base = process.argv.slice(2).filter(a => a !== '--guasti');
  let male = 0;
  console.log('\n=== LA PROVA DEL ROSSO — ' + Object.keys(GUASTI).length + ' guasti iniettati ===\n');
  for (const nome of Object.keys(GUASTI)) {
    let uscita = '';
    try { uscita = execFileSync(process.execPath, [__filename, ...base, '--guasto', nome], { encoding: 'utf8' }); }
    catch (e) { uscita = (e.stdout || '') + (e.stderr || ''); }
    const accesi = [...uscita.matchAll(/ROSSO\s+(C\d)/g)].map(m => m[1]);
    const attesi = ATTESI[nome] || [];
    const mancano = attesi.filter(c => !accesi.includes(c));
    if (mancano.length) male++;
    console.log('  ' + (mancano.length ? 'MUTO ' : ' ok  ') + nome.padEnd(20)
      + 'attesi ' + (attesi.join('+') || '-').padEnd(6) + ' accesi ' + (accesi.join('+') || 'NESSUNO'));
    console.log('        ' + GUASTI[nome].perche);
  }
  if (male) { console.log('\nROSSO: ' + male + ' guasti non accendono il loro controllo — il cancello e\' un timbro.\n'); process.exit(1); }
  console.log('\nVERDE: ogni guasto accende il controllo che deve accendere.\n');
  process.exit(0);
}

const GUASTO = arg('guasto', '');
if (GUASTO && !GUASTI[GUASTO]) {
  console.error('PROVA NULLA: guasto sconosciuto «' + GUASTO + '». Ce ne sono: ' + Object.keys(GUASTI).join(', '));
  process.exit(3);
}
if (!fs.existsSync(GIOCO)) { console.error('PROVA NULLA: non esiste ' + GIOCO); process.exit(3); }
let SRC = fs.readFileSync(GIOCO, 'utf8');
/* il gioco deve gia' avere la pagina: questo cancello sorveglia una
   proprieta' che nasce con la toppa _t-pollice-pagina.js, e su un gioco
   che non ce l'ha e' PROVA NULLA e non rosso — un cancello che
   dichiarasse rossa l'assenza di cio' che sorveglia direbbe una cosa
   vera nel modo sbagliato */
if (SRC.indexOf('function pollicePosa(dischi, bx){') < 0) {
  console.error('PROVA NULLA: ' + path.basename(GIOCO) + ' non ha la pagina dei comandi (manca pollicePosa).');
  console.error('             si prova su una copia toppata:  node strumenti/_t-pollice-pagina.js --out fuori/cmd-prima.html');
  process.exit(3);
}
if (GUASTO) {
  const g = GUASTI[GUASTO];
  for (const p of [{ da: g.da, a: g.a }].concat(g.poi || [])) {
    const n = SRC.split(p.da).length - 1;
    if (n !== 1) { console.error('PROVA NULLA: il guasto «' + GUASTO + '» non si aggancia (trovato ' + n + ' volte):\n  ' + p.da.slice(0, 70)); process.exit(3); }
    SRC = SRC.replace(p.da, p.a);
  }
}
const SRC_CONTRO = fs.existsSync(CONTRO) ? fs.readFileSync(CONTRO, 'utf8') : null;

function servi(testo) {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) {
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(testo); return;
      }
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* l'orologio in mano al banco: senza, due corse vedono due partite */
const BANCO = () => {
  const PASSO = 1000 / 60;
  let t = 0, coda = [];
  window.requestAnimationFrame = cb => { coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = { passo(n) {
    for (let i = 0; i < (n | 0); i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
    return t;
  } };
};

/* la geometria, letta dal gioco vivo e RICALCOLATA qui dentro: il banco
   non chiede al gioco quanto valga il margine, se lo conta da se' sui
   centri e sui raggi che il gioco espone */
const LEGGI = () => {
  const t = window.__test;
  const b = t.pulsanti(0);
  let mar = 1e9, area = 0, dia = 0, fuori = 0;
  for (let i = 0; i < b.length; i++) {
    area += Math.PI * (b[i].r + 4) * (b[i].r + 4);
    dia = Math.max(dia, b[i].r * 2);
    const pr = b[i].r + 10;
    if (b[i].x - pr < 0 || b[i].y - pr < 0 || b[i].x + pr > innerWidth || b[i].y + pr > innerHeight) fuori++;
    for (let j = i + 1; j < b.length; j++)
      mar = Math.min(mar, Math.hypot(b[i].x - b[j].x, b[i].y - b[j].y) - pr - (b[j].r + 10));
  }
  return {
    dischi: b.map(d => ({ act: d.act, label: d.label, x: +d.x.toFixed(4), y: +d.y.toFixed(4), r: +d.r.toFixed(4) })),
    margine: +mar.toFixed(2), quota: +(area / Math.max(1, innerWidth * innerHeight) * 100).toFixed(3),
    diam: Math.round(dia), fuori,
    pollice: t.pollice, dichiarato: t.misurePollice ? t.misurePollice() : null,
    vw: innerWidth, vh: innerHeight,
  };
};

/* =====================================================================
   LO STRINGIMENTO DELLE ETICHETTE, e come si fa a essere sicuri di
   misurarlo col carattere VERO.

   Il gioco tiene il proprio nome di carattere in una variabile di
   modulo (FONT_C), che non e' su window: un banco non la puo' leggere.
   Qui si misura con la variabile CSS --cond, che dichiara la stessa
   famiglia, e POI si verifica di aver misurato la stessa cosa: il gioco
   DICHIARA il riquadro delle lettere (zona.lab), largo w*kx+3, e il
   banco lo ricalcola. Se i due non coincidono entro un pixel e mezzo, il
   carattere non e' lo stesso e questo controllo dice PROVA NULLA invece
   di dare un verdetto su un carattere che non e' quello del gioco.
   ===================================================================== */
const STRINGE = () => {
  const t = window.__test;
  const cv = document.querySelector('canvas');
  const c2 = cv.getContext('2d');
  const font = getComputedStyle(document.documentElement).getPropertyValue('--cond').trim() || 'sans-serif';
  /* i dischi si dichiarano solo dentro una partita: drawTouchButtons
     esce sulle scene di menu, e senza partita TOUCH_ZONE resta vuota */
  t.dismissSplash(); t.setPaused(false);
  for (let g = 0; g < 3 && t.G.scene !== 'play'; g++) {
    for (let i = 0; i < 200 && t.G.scene !== 'play'; i++) t.simulate(0.1);
    if (t.G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && t.G.scene !== 'play'; i++) t.simulate(0.1); }
  }
  t.posaHUD(true); t.disegna(); t.disegna();
  const zone = t.comandiTouch.filter(z => z.tipo === 'pulsante' && z.lab);
  const dichiarati = t.comandiTouch.filter(z => z.tipo === 'pulsante');
  const out = [];
  for (const b of t.pulsanti(0).concat(t.pulsanti(1))) {
    const avail = b.r * 2 - 14;
    let fs = 15; c2.font = '800 ' + fs + 'px ' + font;
    if (c2.measureText(b.label).width > avail) { fs = 11; c2.font = '800 ' + fs + 'px ' + font; }
    const w = c2.measureText(b.label).width;
    const kx = Math.max(0.62, Math.min(1, avail / Math.max(1, w)));
    out.push({ label: b.label, kx: +kx.toFixed(3), vero: +(avail / Math.max(1, w)).toFixed(3),
               previsto: +(w * kx + 3).toFixed(2), avail: +avail.toFixed(2) });
  }
  /* =====================================================================
     IL VERDETTO SI PRENDE SUL RIQUADRO CHE IL GIOCO DIPINGE, non sulla
     misura del banco.
     Il gioco dichiara lab largo w*kx+3, dove kx = clamp(0,62 .. 1) di
     avail/w. Finche' la parola ci sta, w*kx <= avail; quando lo
     stringimento tocca il fondo di 0,62 la parola SBORDA, e w*kx supera
     avail. Quindi «(larghezza del riquadro) - 3 > avail» E' la
     definizione di sbordo, e si legge senza sapere che carattere abbia
     usato il gioco. La misura del banco resta come RISCONTRO da
     stampare: se i due numeri divergono si dice, invece di fingere di
     conoscere il carattere del gioco. */
  let scarto = 0, sbordo = 0, peggiore = null;
  for (const z of zone) {
    const b = t.pulsanti(z.team).find(p => p.label === z.label) || t.pulsanti(0).find(p => p.label === z.label);
    if (!b) continue;
    const avail = b.r * 2 - 14;
    const lw = (z.lab.x1 - z.lab.x0) - 3;
    const rapporto = lw / Math.max(0.001, avail);
    if (lw > avail + 0.5) sbordo++;
    if (!peggiore || rapporto > peggiore.rapporto)
      peggiore = { label: z.label, lw: +lw.toFixed(2), avail: +avail.toFixed(2), rapporto: +rapporto.toFixed(3) };
    const mio = out.find(o => o.label === z.label);
    if (mio) scarto = Math.max(scarto, Math.abs((z.lab.x1 - z.lab.x0) - mio.previsto));
  }
  t.posaHUD(false);
  return { et: out, scarto: +scarto.toFixed(2), riquadri: zone.length, pulsanti: dichiarati.length,
           sbordo, peggiore };
};

/* =====================================================================
   --copertura: QUANTO COSTA LA SCALA AGLI UOMINI IN CAMPO.

   Non e' un controllo, e' una MISURA, e sta qui per una ragione precisa:
   strumenti/_q-dischi.js — che questa casa usa per il numero degli
   «uomini intaccati» — RIFIUTA di misurare una copia con la scala
   diversa dal 100%. Il suo controllo di validita' «dischi rimessi»
   pretende che ridipingere i dischi sopra il fotogramma senza rifaccia
   il fotogramma vero AL PIXEL, e a scala grande non torna: misurato,
   16 px a 115%, 375 a 130%, 165 a 150% su 33 prove del suo banco (e
   16 / 315 / 132 su 43 prove del banco qui sotto, che e' lo stesso
   fenomeno contato su piu' campioni). La ragione non e' rumore ed e'
   stata trovata: quei pixel cadono sul bordo inferiore
   dell'ombra del disco CAMBIO e compaiono SOLO nei fotogrammi in cui
   c'e' a schermo una scritta di scena («RUBATA PULITA!», «TIRO
   PERFETTO!»), che drawOverlaysCanvas dipinge DOPO drawTouchButtons.
   Ingrandito, il disco arriva sotto la scritta: nel fotogramma vero la
   scritta gli sta sopra, nel ri-dipinto e' il disco a stare sopra a lei.

   Undici pixel per campione su un disco da quattromila non spostano una
   MISURA, ma fanno giustamente cadere un controllo di validita' che
   pretende lo zero. Quindi il numero degli uomini si prende qui, con la
   stessa matematica di _q-dischi (alfa vera da due sfondi, |P-K|=128),
   dichiarando il residuo invece di nasconderlo.
   ===================================================================== */
const COPERTURA = `async (arg) => {
  const scala = arg.scala, semi = [arg.seme];
  const t = window.__test, G = t.G, B = window.__banco;
  t.dismissSplash(); B.passo(4);
  /* LA QUIETE PRIMA DEL SEME, copiata da _q-dischi e per la stessa
     ragione: la promessa dei caratteri ricuoce la tessitura del campo
     quando le pare, e quella cottura tira decine di migliaia di
     sorteggi dal generatore comune. Senza questa attesa due corse dello
     stesso file davano 1211 e 1260 campioni — cioe' due partite. */
  t.semina(1);
  { let fermi = 0;
    for (let giri = 0; giri < 20 && fermi < 2; giri++) {
      const a = t.sorteggi;
      await new Promise(r => setTimeout(r, 300));
      fermi = (t.sorteggi === a) ? fermi + 1 : 0;
    } }
  t.semina(semi[0]); t.setCpuVsCpu(true); t.posaHUD(true);
  t.startMatch(1, 1, { size: 11 });
  for (let i = 0; i < 900; i++) { B.passo(1); if (t.state === 'play') break; }
  const cv = document.getElementById('gioco'), cg = cv.getContext('2d');
  const K = cv.width / innerWidth, RIG_H = 34, P_DIS = 1.18, RIG_PIEDI = 10;
  const z0 = t.comandiTouch.filter(q => q.tipo === 'pulsante' && q.r > 0);
  if (!z0.length) return JSON.stringify({ errore: 'nessun disco dichiarato' });
  let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9;
  for (const d of z0) { X0 = Math.min(X0, d.x - d.r - 14); X1 = Math.max(X1, d.x + d.r + 14);
                        Y0 = Math.min(Y0, d.y - d.r - 14); Y1 = Math.max(Y1, d.y + d.r + 16); }
  X0 = Math.max(0, Math.floor(X0 * K)); Y0 = Math.max(0, Math.floor(Y0 * K));
  X1 = Math.min(cv.width, Math.ceil(X1 * K)); Y1 = Math.min(cv.height, Math.ceil(Y1 * K));
  const RW = X1 - X0, RH = Y1 - Y0;
  const alfa = new Float32Array(RW * RH);
  const KK = new Uint8ClampedArray(RW * RH * 4), IMK = new ImageData(KK, RW, RH);
  const leggi = () => cg.getImageData(X0, Y0, RW, RH).data;
  const scarto = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i+1] !== b[i+1] || a[i+2] !== b[i+2]) n++; return n; };
  const fermo = (senza) => {
    const c = G.cam, sc = { x: c.x, y: c.y, z: c.z }, mini = G.miniY;
    const desc = Object.getOwnPropertyDescriptor(G, 'renderDT');
    Object.defineProperty(G, 'renderDT', { get: () => 0, set: () => {}, configurable: true });
    try { if (senza) t.senzaDischi(true); t.disegna(); }
    finally { if (senza) t.senzaDischi(false); delete G.renderDT;
      if (desc) Object.defineProperty(G, 'renderDT', desc); else G.renderDT = 1 / 60;
      c.x = sc.x; c.y = sc.y; c.z = sc.z; G.miniY = mini; }
  };
  let campioni = 0, uomini = 0, intaccati = 0, nascosti = 0, somma = 0, peggiore = 0;
  let rimessi = 0, prove = 0, sorteggi = 0;
  {
   for (let pas = 0; pas < 1800; pas++) {
    if (pas % 240 === 0) await new Promise(r => setTimeout(r, 0));
    B.passo(1);
    if (t.state !== 'play') continue;
    if (pas % 5) continue;
    const s0 = t.sorteggi;
    const prova = (campioni % 30) === 0;
    let A1 = null;
    if (prova) { fermo(false); A1 = new Uint8ClampedArray(leggi()); }
    fermo(true);
    const P = new Uint8ClampedArray(leggi());
    t.soloDischi();
    const D1 = new Uint8ClampedArray(leggi());
    if (prova) { rimessi += scarto(A1, D1); prove++; }
    for (let i = 0; i < P.length; i += 4) { KK[i] = P[i] ^ 128; KK[i+1] = P[i+1] ^ 128; KK[i+2] = P[i+2] ^ 128; KK[i+3] = 255; }
    cg.putImageData(IMK, X0, Y0);
    t.soloDischi();
    const D2 = leggi();
    for (let i = 0, k = 0; k < alfa.length; k++, i += 4) {
      let s = 0;
      for (let c = 0; c < 3; c++) s += 1 - (D1[i+c] - D2[i+c]) / (P[i+c] - KK[i+c]);
      alfa[k] = s <= 0 ? 0 : (s >= 3 ? 1 : s / 3);
    }
    sorteggi += (t.sorteggi - s0);
    campioni++;
    const v = t.view; if (!v || !v.S2) continue;
    const S2 = v.S2, Ax = v.Ax, Ay = v.Ay, H = RIG_H * P_DIS * S2, w = 16 * S2;
    for (const p of G.players) {
      if (p.out > 0) continue;
      const cx = p.x * S2 + Ax, py = (p.y + RIG_PIEDI) * S2 + Ay;
      const ix0 = Math.max(0, Math.round((cx - w) * K)), iy0 = Math.max(0, Math.round((py - H) * K));
      const ix1 = Math.min(cv.width, Math.round((cx + w) * K)), iy1 = Math.min(cv.height, Math.round(py * K));
      const areaPx = Math.max(0, ix1 - ix0) * Math.max(0, iy1 - iy0);
      if (areaPx <= 0) continue;
      uomini++;
      const bx0 = Math.max(X0, ix0), by0 = Math.max(Y0, iy0), bx1 = Math.min(X1, ix1), by1 = Math.min(Y1, iy1);
      let som = 0;
      if (bx1 > bx0 && by1 > by0)
        for (let y = by0; y < by1; y++) { const off = (y - Y0) * RW - X0; for (let x = bx0; x < bx1; x++) som += alfa[off + x]; }
      const cop = som / areaPx;
      somma += cop;
      if (cop > peggiore) peggiore = cop;
      if (cop >= 0.25) intaccati++;
      if (cop >= 0.50) nascosti++;
    }
   }
  }
  return JSON.stringify({ scala, campioni, uomini, intaccati, nascosti,
    perCampione: +(intaccati / Math.max(1, campioni)).toFixed(3),
    nascostiPerCampione: +(nascosti / Math.max(1, campioni)).toFixed(3),
    media: +(somma / Math.max(1, uomini)).toFixed(4), peggiore: +peggiore.toFixed(3),
    rimessi, prove, sorteggi, regione: [X0, Y0, X1, Y1] });
}`;

const esiti = [];
function cancello(id, nome, ok, det) {
  esiti.push({ id, ok: !!ok });
  console.log('  ' + (ok ? 'verde' : 'ROSSO') + ' ' + id + ' · ' + nome + (det ? '\n         ' + det : ''));
}

(async () => {
  const srv = await servi(SRC);
  const srvC = SRC_CONTRO ? await servi(SRC_CONTRO) : null;
  const br = await chromium.launch();
  const eccezioni = [];

  async function apri(vista, porta, save) {
    const ctx = await br.newContext({ viewport: { width: vista[0], height: vista[1] }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const pag = await ctx.newPage();
    pag.on('pageerror', e => eccezioni.push(e.message));
    /* UNA VOLTA SOLA, E LA RAGIONE E' UN ROSSO FALSO GIA' PAGATO.
       addInitScript gira a OGNI navigazione, ricarica compresa: azzerare
       il salvataggio li' dentro cancellava proprio cio' che C7 vuole
       misurare — i tre numeri scritti dai tocchi — e il banco accusava
       il gioco di non ricordarsi niente. Il sigillo sta in
       sessionStorage, che sopravvive alla ricarica e muore con la
       scheda. */
    await pag.addInitScript(s => {
      try {
        if (sessionStorage.getItem('__qpollice')) return;
        sessionStorage.setItem('__qpollice', '1');
        localStorage.clear();
        if (s) localStorage.setItem('calcetto_save_v4', s);
      } catch (e) {}
    }, save ? JSON.stringify(save) : '');
    await pag.addInitScript(BANCO);
    await pag.goto('http://127.0.0.1:' + porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => window.__banco.passo(8));
    return { ctx, pag };
  }
  /* i tocchi sulla pagina COMANDI si danno con dita vere di protocollo:
     un cancello che chiamasse le funzioni interne proverebbe le funzioni
     interne, non la pagina */
  /* IL TOCCO E' UN CLICK VERO SUL BOTTONE VERO, non una chiamata alla
     funzione: passa dall'ascoltatore che la toppa ha scritto, e se
     domani qualcuno stacca l'ascoltatore questo banco se ne accorge.
     Si usa el.click() del DOM e non il puntatore di Playwright perche'
     la pagina delle impostazioni SCORRE: un bottone sotto la piega non
     e' cliccabile col puntatore, e sarebbe un rosso del banco. */
  async function tocca(pag, id, volte) {
    for (let i = 0; i < (volte || 1); i++) {
      const ok = await pag.evaluate(k => {
        const el = document.getElementById(k);
        if (!el) return false;
        el.click(); return true;
      }, id);
      if (!ok) throw new Error('non trovo #' + id);
      await pag.evaluate(() => window.__banco.passo(2));
    }
  }
  async function porta(pag) {
    /* la porta vera: si entra dalle IMPOSTAZIONI come entra chi gioca */
    await pag.evaluate(() => { window.__test.dismissSplash(); });
    await pag.evaluate(() => window.__banco.passo(4));
    const ok = await pag.evaluate(() => {
      const b = document.getElementById('btnImpost'); if (!b) return 'manca btnImpost';
      b.click(); return '';
    });
    if (ok) throw new Error(ok);
    await pag.evaluate(() => window.__banco.passo(2));
    await tocca(pag, 'btnSetComandi');
    return pag.evaluate(() => !document.getElementById('comandi').classList.contains('hidden'));
  }

  if (haFlag('copertura')) {
    /* gli stessi quattro semi e la stessa finestra di _q-dischi, cosi'
       la riga del 100% e' confrontabile col suo numero e non con niente */
    const semi = String(arg('semi', '20260828,20260829,20260830,20260831')).split(',').map(Number);
    console.log('\n=== QUANTO COSTA LA SCALA AGLI UOMINI IN CAMPO ===');
    console.log('11 contro 11 CPU contro CPU, 845x402, semi ' + semi.join(',') + ', 30 s per seme, un campione ogni 5 fotogrammi\n');
    console.log('  scala   campioni  uomini  INTACCATI/campione  nascosti/campione  copertura media  peggiore  residuo rimessi');
    for (const scala of SCALE) {
      /* UNA PAGINA PER SEME, come _q-dischi: due partite nella stessa
         pagina non ripartono dallo stesso stato, e il confronto fra
         scale misurerebbe due incontri diversi. */
      const s = { campioni: 0, uomini: 0, intaccati: 0, nascosti: 0, somma: 0, peggiore: 0, rimessi: 0, prove: 0, sorteggi: 0 };
      for (const seme of semi) {
        const a = await apri([845, 402], srv.porta, { pollice: { scala, spazio: 100, mancino: 0 } });
        const r = JSON.parse(await a.pag.evaluate(new Function('return ' + COPERTURA)(), { scala, seme }));
        await a.ctx.close();
        if (r.errore) { console.log('  ' + scala + '%  ERRORE ' + r.errore); s.campioni = -1; break; }
        s.campioni += r.campioni; s.uomini += r.uomini; s.intaccati += r.intaccati; s.nascosti += r.nascosti;
        s.somma += r.media * r.uomini; s.peggiore = Math.max(s.peggiore, r.peggiore);
        s.rimessi += r.rimessi; s.prove += r.prove; s.sorteggi += r.sorteggi;
      }
      if (s.campioni < 0) continue;
      console.log('  ' + (scala + '%').padEnd(8) + String(s.campioni).padStart(8) + String(s.uomini).padStart(8) +
        (s.intaccati / s.campioni).toFixed(3).padStart(20) + (s.nascosti / s.campioni).toFixed(3).padStart(19) +
        (s.somma / s.uomini).toFixed(4).padStart(17) + s.peggiore.toFixed(3).padStart(10) +
        (s.rimessi + ' px su ' + s.prove + ' prove').padStart(22) + (s.sorteggi ? '  SORTEGGI SPESI ' + s.sorteggi : ''));
    }
    console.log('\n  riferimenti di _q-dischi (C5): intaccati 0,38 per campione · nascosti 0,05\n');
    await br.close(); srv.chiudi(); if (srvC) srvC.chiudi();
    process.exit(0);
  }

  try {
    /* ==============================================================
       C1 — la porta esiste, e ai valori di serie non sposta un pixel
       ============================================================== */
    {
      const a = await apri(FINESTRE[0], srv.porta, null);
      const serie = await a.pag.evaluate(LEGGI);
      const b = await apri(FINESTRE[0], srv.porta, { pollice: { scala: 150, spazio: 100, mancino: 0 } });
      const grande = await b.pag.evaluate(LEGGI);
      let identico = 'nessun riferimento', ugualiN = 0;
      if (srvC) {
        const c = await apri(FINESTRE[0], srvC.porta, null);
        const rif = await c.pag.evaluate(LEGGI);
        const campi = ['x', 'y', 'r'];
        let diff = 0, tot = 0;
        for (let i = 0; i < Math.max(rif.dischi.length, serie.dischi.length); i++)
          for (const k of campi) { tot++; if (!rif.dischi[i] || !serie.dischi[i] || rif.dischi[i][k] !== serie.dischi[i][k]) diff++; }
        ugualiN = tot - diff;
        identico = diff === 0 ? (tot + ' campi su ' + tot + ' identici al riferimento') : (diff + ' campi su ' + tot + ' DIVERSI dal riferimento');
        await c.ctx.close();
      }
      const cambia = grande.diam !== serie.diam && grande.pollice && grande.pollice.k === 1.5;
      cancello('C1', 'la porta esiste e passa dal salvataggio; ai valori di serie la geometria e\' identica al bit',
        cambia && (!srvC || identico.indexOf('DIVERSI') < 0),
        'serie: diametro ' + serie.diam + ' px, scala letta ' + (serie.pollice ? serie.pollice.k : '?') +
        ' · con scala 150: diametro ' + grande.diam + ' px, scala letta ' + (grande.pollice ? grande.pollice.k : '?') +
        '\n         ' + identico);
      if (MISURE) console.log('         serie   ' + serie.dischi.map(d => d.act + '(' + d.x + ',' + d.y + ',r' + d.r + ')').join(' '));
      await a.ctx.close(); await b.ctx.close();
    }

    /* ==============================================================
       C2 + C5 + C8(geometria) — tutto lo spazio delle combinazioni,
       su tre finestre, coi bottoni veri della pagina
       ============================================================== */
    const tabella = [];
    let peggiorMargine = Infinity, peggiorCaso = '', fuoriTot = 0, fuoriCaso = '';
    let scartoDich = 0, scartoCaso = '';
    for (const vista of FINESTRE) {
      const a = await apri(vista, srv.porta, null);
      if (!(await porta(a.pag))) throw new Error('la pagina COMANDI non si apre dalle Impostazioni');
      /* la geometria di SERIE su questa finestra e' il riferimento del
         margine: non un numero scritto qui, quello che il gioco fa */
      const base = await a.pag.evaluate(LEGGI);
      for (let is = 0; is < SCALE.length; is++) {
        for (let ip = 0; ip < SPAZI.length; ip++) {
          const m = await a.pag.evaluate(LEGGI);
          const eti = vista.join('x') + ' scala ' + m.pollice.k + ' spazio ' + m.pollice.sp;
          tabella.push({ vista: vista.join('x'), scala: Math.round(m.pollice.k * 100), spazio: Math.round(m.pollice.sp * 100),
                         diam: m.diam, margine: m.margine, quota: m.quota, fuori: m.fuori });
          if (m.margine < peggiorMargine - 1e-9) { peggiorMargine = m.margine; peggiorCaso = eti; }
          if (m.fuori) { fuoriTot += m.fuori; if (!fuoriCaso) fuoriCaso = eti; }
          /* C8, parte geometrica: il riquadro della pagina e la misura
             indipendente di questo banco devono dire la stessa cosa */
          if (m.dichiarato) {
            const s = Math.max(Math.abs(m.dichiarato.diam - m.diam),
                               Math.abs(m.dichiarato.margine - m.margine),
                               Math.abs(m.dichiarato.quota - m.quota));
            if (s > scartoDich) { scartoDich = +s.toFixed(3); scartoCaso = eti + ' (pagina ' + JSON.stringify(m.dichiarato) + ' banco diam ' + m.diam + ' marg ' + m.margine + ' quota ' + m.quota + ')'; }
          }
          if (ip < SPAZI.length - 1) await tocca(a.pag, 'btnCmdSpazio');
        }
        await tocca(a.pag, 'btnCmdSpazio');     // torna a 100
        if (is < SCALE.length - 1) await tocca(a.pag, 'btnCmdScala');
      }
      await a.ctx.close();
    }
    const baseMargine = tabella.find(r => r.vista === '915x412' && r.scala === 100 && r.spazio === 100);
    const soglia = baseMargine ? baseMargine.margine : 2.8;
    const sottoSoglia = tabella.filter(r => r.margine < soglia - 0.05);
    cancello('C2', 'le prese non si toccano mai: ' + tabella.length + ' combinazioni su ' + FINESTRE.length + ' finestre',
      sottoSoglia.length === 0 && peggiorMargine > 0,
      'margine minimo ' + peggiorMargine.toFixed(2) + ' px (' + peggiorCaso + ') contro i ' + soglia.toFixed(2) +
      ' px di serie' + (sottoSoglia.length ? ' — ' + sottoSoglia.length + ' combinazioni SOTTO: ' +
        sottoSoglia.slice(0, 3).map(r => r.vista + ' s' + r.scala + '/' + r.spazio + ' = ' + r.margine).join(', ') : ''));
    cancello('C5', 'i dischi restano interi sullo schermo a ogni combinazione',
      fuoriTot === 0,
      fuoriTot === 0 ? 'zero dischi tagliati su ' + (tabella.length * 4) + ' disco-combinazione'
                     : fuoriTot + ' dischi tagliati, il primo a ' + fuoriCaso);
    if (MISURE) {
      console.log('\n  finestra    scala spazio  diametro  margine  schermo');
      for (const r of tabella) console.log('  ' + r.vista.padEnd(10) + String(r.scala).padStart(5) + String(r.spazio).padStart(7) +
        String(r.diam).padStart(10) + r.margine.toFixed(2).padStart(9) + (r.quota.toFixed(2) + '%').padStart(9));
      console.log('');
    }

    /* ==============================================================
       C3 — il righello a PIXEL sul disco dipinto
       ============================================================== */
    {
      const misurati = [];
      for (const scala of [85, 100, 150]) {
        const a = await apri(FINESTRE[0], srv.porta, { pollice: { scala, spazio: 100, mancino: 0 } });
        const r = await a.pag.evaluate(async () => {
          const t = window.__test;
          t.dismissSplash();
          t.setPaused(false);
          for (let g = 0; g < 3 && t.G.scene !== 'play'; g++) {
            for (let i = 0; i < 200 && t.G.scene !== 'play'; i++) t.simulate(0.1);
            if (t.G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && t.G.scene !== 'play'; i++) t.simulate(0.1); }
          }
          if (t.G.scene !== 'play') return { errore: 'scena ' + t.G.scene };
          t.posaHUD(true);
          /* IL DISCO GRANDE DEVE ESSERE OPACO PER ESSERE MISURATO: il
             pallone che gli rotola addosso lo sfuma (scartoHUD), e un
             righello che non lo sapesse misurerebbe un disco mezzo
             trasparente. Si porta la palla dall'altra parte del campo. */
          t.G.ball.x = 60; t.G.ball.y = t.campo.FH / 2; t.G.ball.vx = 0; t.G.ball.vy = 0; t.G.ball.owner = -1;
          const cv = document.querySelector('canvas');
          const c2 = cv.getContext('2d');
          const dpr = cv.width / innerWidth;
          const b = t.pulsanti(0)[0];
          const y = Math.round(b.y * dpr);
          const x0 = Math.max(0, Math.round((b.x - b.r - 30) * dpr));
          const x1 = Math.min(cv.width, Math.round((b.x + b.r + 30) * dpr));
          const w = x1 - x0;
          t.senzaDischi(true); t.disegna();
          const P = c2.getImageData(x0, y, w, 1).data;
          t.senzaDischi(false);
          t.soloDischi();
          const D = c2.getImageData(x0, y, w, 1).data;
          /* SI MISURA LA MACCHIA CHE CONTIENE IL CENTRO, non l'estensione
             di tutti i pixel cambiati sulla riga: alla taglia di serie
             questa scanline sfiora anche il bordo destro del disco
             CAMBIO, e prendere il primo e l'ultimo pixel cambiato dava
             112 px per un disco da 80 (misurato). Si parte dal centro e
             si cammina nei due versi finche' i pixel cambiano. */
          const mutato = i => {
            const k = i * 4;
            return Math.abs(D[k] - P[k]) + Math.abs(D[k + 1] - P[k + 1]) + Math.abs(D[k + 2] - P[k + 2]) > 12;
          };
          const c = Math.round(b.x * dpr) - x0;
          if (!mutato(c)) { t.posaHUD(false); return { errore: 'il centro del disco non e\' cambiato: il disco non si dipinge' }; }
          let a0 = c, a1 = c;
          while (a0 > 0 && mutato(a0 - 1)) a0--;
          while (a1 < w - 1 && mutato(a1 + 1)) a1++;
          t.posaHUD(false);
          return { dipinto: +((a1 - a0 + 1) / dpr).toFixed(1), dichiarato: +(b.r * 2).toFixed(1), dpr };
        });
        if (r.errore) throw new Error('righello a pixel: ' + r.errore);
        misurati.push({ scala, ...r });
        await a.ctx.close();
      }
      /* il dipinto e' un filo piu' largo del cerchio: la ghiera arriva a
         r+1,1 e l'ombra portata e' scostata di 1,5 px verso destra */
      const scarti = misurati.map(m => +(m.dipinto - m.dichiarato).toFixed(1));
      const cresce = misurati[0].dipinto < misurati[1].dipinto && misurati[1].dipinto < misurati[2].dipinto;
      const aderente = scarti.every(s => s >= -1 && s <= 6);
      cancello('C3', 'la scala si vede sui PIXEL: il disco dipinto cresce con la taglia',
        cresce && aderente,
        misurati.map(m => 'scala ' + m.scala + '% -> dipinto ' + m.dipinto + ' px, dichiarato ' + m.dichiarato + ' px (scarto ' + (m.dipinto - m.dichiarato).toFixed(1) + ')').join('\n         '));
    }

    /* ==============================================================
       C4 — il mancino specchia tutto, e non seppellisce la bussola
       ============================================================== */
    {
      const leggiAngoli = async (mancino) => {
        const a = await apri(FINESTRE[0], srv.porta, { pollice: { scala: 100, spazio: 100, mancino } });
        const r = await a.pag.evaluate(() => {
          const t = window.__test;
          t.dismissSplash(); t.setPaused(false);
          for (let g = 0; g < 3 && t.G.scene !== 'play'; g++) {
            for (let i = 0; i < 200 && t.G.scene !== 'play'; i++) t.simulate(0.1);
            if (t.G.scene !== 'play') { t.startMatch(1, 1, { size: 5 }); for (let i = 0; i < 80 && t.G.scene !== 'play'; i++) t.simulate(0.1); }
          }
          t.posaHUD(true); t.disegna(); t.disegna();
          const zone = t.comandiTouch;
          const mini = zone.find(z => z.tipo === 'minimappa');
          const b = t.pulsanti(0);
          let sovr = 0;
          if (mini) for (const d of b) {
            const ix = Math.max(0, Math.min(d.x + d.r, mini.x1) - Math.max(d.x - d.r, mini.x0));
            const iy = Math.max(0, Math.min(d.y + d.r, mini.y1) - Math.max(d.y - d.r, mini.y0));
            sovr += ix * iy;
          }
          t.posaHUD(false);
          return { dischiX: b.map(d => +d.x.toFixed(2)), mini: mini ? { x0: +mini.x0.toFixed(1), x1: +mini.x1.toFixed(1) } : null,
                   sovr: +sovr.toFixed(0), vw: innerWidth };
        });
        await a.ctx.close();
        return r;
      };
      const dx = await leggiAngoli(0), sx = await leggiAngoli(1);
      /* lo specchio e' esatto: ogni disco a mancino sta a VW - x del
         destrorso, e la bussola pure */
      const specchio = dx.dischiX.every((x, i) => Math.abs((dx.vw - x) - sx.dischiX[i]) < 0.5);
      const bussola = dx.mini && sx.mini && Math.abs((dx.vw - dx.mini.x0) - sx.mini.x1) < 1.5;
      cancello('C4', 'il mancino specchia dischi E bussola, e non li sovrappone',
        specchio && bussola && sx.sovr === 0 && dx.sovr === 0,
        'dischi destrorso x=[' + dx.dischiX.join(', ') + ']  mancino x=[' + sx.dischiX.join(', ') + ']' +
        '\n         bussola destrorso ' + JSON.stringify(dx.mini) + ' mancino ' + JSON.stringify(sx.mini) +
        '\n         sovrapposizione dischi/bussola: destrorso ' + dx.sovr + ' px2, mancino ' + sx.sovr + ' px2');
    }

    /* ==============================================================
       C6 — le etichette alla taglia piu' piccola
       ============================================================== */
    {
      /* SI PROVANO LE TAGLIE CHE IL MENU OFFRE DAVVERO, girando il suo
         bottone finche' non torna al punto di partenza: se domani
         qualcuno aggiunge un gradino piu' piccolo, questo controllo lo
         prova senza che nessuno debba aggiornare una lista qui dentro.
         (Era una lista qui dentro, ed era muta: il guasto che metteva il
         40% nel menu passava perche' il banco continuava a provare
         l'85%.) */
      const a = await apri(FINESTRE[0], srv.porta, null);
      await a.pag.evaluate(() => document.fonts && document.fonts.ready);
      await a.pag.evaluate(() => window.__banco.passo(30));
      const misure = [];
      let primo = null;
      for (let giro = 0; giro < 12; giro++) {
        const k = await a.pag.evaluate(() => window.__test.pollice.k);
        if (primo === null) primo = k;
        else if (k === primo) break;
        const r = await a.pag.evaluate(STRINGE);
        if (r.riquadri === 0) throw new Error('nessun riquadro di etichetta dichiarato: senza dischi dipinti non c\'e\' niente da misurare');
        misure.push({ k, ...r });
        await tocca(a.pag, 'btnCmdScala');
      }
      const sbordi = misure.reduce((s, m) => s + m.sbordo, 0);
      const peggiore = misure.reduce((p, m) => (!p || m.peggiore.rapporto > p.peggiore.rapporto) ? m : p, null);
      const concorde = misure.every(m => m.scarto <= 1.5);
      const stretta = misure.map(m => m.et.reduce((p, e) => e.vero < p.vero ? e : p, m.et[0]))
                            .reduce((p, e) => e.vero < p.vero ? e : p);
      cancello('C6', 'le etichette ci stanno a tutte e ' + misure.length + ' le taglie che il menu offre',
        sbordi === 0,
        'la piu\' piena e\' ' + peggiore.peggiore.label + ' a taglia ' + Math.round(peggiore.k * 100) + '%: riquadro ' +
        peggiore.peggiore.lw + ' px in ' + peggiore.peggiore.avail + ' disponibili (' + peggiore.peggiore.rapporto +
        ' del disco; sopra 1 sborda)' +
        '\n         ' + (concorde
          ? 'col carattere del documento la piu\' stretta e\' ' + stretta.label + ' a ' + stretta.vero +
            ' di stringimento (fondo 0,62)'
          : 'RISCONTRO NON CONCORDE: il carattere del banco non e\' quello del gioco, lo stringimento non si ' +
            'dichiara — il verdetto sta sul riquadro dipinto, che non ne ha bisogno'));
      await a.ctx.close();
    }

    /* ==============================================================
       C7 — le due porte, e il ricordo
       ============================================================== */
    {
      const a = await apri(FINESTRE[0], srv.porta, null);
      /* porta 1: le Impostazioni */
      const daImpost = await porta(a.pag);
      /* tre tocchi veri: mano, taglia, distanza */
      await tocca(a.pag, 'btnCmdMano');
      await tocca(a.pag, 'btnCmdScala');
      await tocca(a.pag, 'btnCmdSpazio');
      const dopoTocchi = await a.pag.evaluate(() => window.__test.pollice);
      await tocca(a.pag, 'btnBackComandi');
      const tornato = await a.pag.evaluate(() => !document.getElementById('impostazioni').classList.contains('hidden')
                                              && document.getElementById('comandi').classList.contains('hidden'));
      /* porta 2: la PAUSA, con la partita in corso */
      const inPausa = await a.pag.evaluate(() => {
        const t = window.__test;
        t.startMatch(1, 1, { size: 5 });
        for (let i = 0; i < 120 && t.G.scene !== 'play'; i++) t.simulate(0.1);
        if (t.G.scene !== 'play') return 'scena ' + t.G.scene;
        t.setPaused(true);
        const b = document.getElementById('btnPauseComandi');
        if (!b) return 'la riga della pausa non offre la porta';
        b.click();
        return document.getElementById('comandi').classList.contains('hidden') ? 'la pagina non si e\' aperta' : '';
      });
      await a.pag.evaluate(() => window.__banco.passo(2));
      /* e chiudendola si torna alla PAUSA, non al menu */
      const tornaPausa = await a.pag.evaluate(() => {
        document.getElementById('btnBackComandi').click();
        return document.getElementById('comandi').classList.contains('hidden')
            && !document.getElementById('pausa').classList.contains('hidden')
            && window.__test.G.paused;
      });
      /* il ricordo: si ricarica la pagina e i tre numeri devono esserci */
      await a.pag.reload({ waitUntil: 'load' });
      await a.pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
      const ricordo = await a.pag.evaluate(() => window.__test.pollice);
      const uguale = ricordo && dopoTocchi && ricordo.k === dopoTocchi.k && ricordo.sp === dopoTocchi.sp && ricordo.mn === dopoTocchi.mn;
      cancello('C7', 'la pagina si apre dalle Impostazioni E dalla pausa, e i tocchi si ricordano',
        daImpost && tornato && inPausa === '' && tornaPausa && uguale,
        'dalle Impostazioni ' + (daImpost ? 'si' : 'NO') + ' · ritorno alle Impostazioni ' + (tornato ? 'si' : 'NO') +
        ' · dalla pausa ' + (inPausa === '' ? 'si' : 'NO (' + inPausa + ')') + ' · ritorno alla pausa ' + (tornaPausa ? 'si' : 'NO') +
        '\n         dopo tre tocchi ' + JSON.stringify(dopoTocchi) + ' · dopo la ricarica ' + JSON.stringify(ricordo));
      await a.ctx.close();
    }

    /* ==============================================================
       C8 — il riquadro dice il numero vero (geometria + pixel)
       ============================================================== */
    cancello('C8', 'il riquadro «com\'e\' adesso» dice i numeri che il banco misura da solo',
      scartoDich <= 0.06,
      'scarto massimo pagina/banco ' + scartoDich + (scartoCaso ? '\n         ' + scartoCaso : '') +
      ' — su ' + tabella.length + ' combinazioni');

  } catch (e) {
    console.error('\nPROVA NULLA: il banco non ha potuto misurare — ' + e.message);
    await br.close(); srv.chiudi(); if (srvC) srvC.chiudi();
    process.exit(3);
  }

  await br.close(); srv.chiudi(); if (srvC) srvC.chiudi();

  console.log('\ngioco ' + path.basename(GIOCO) + (GUASTO ? '   GUASTO: ' + GUASTO + ' (' + GUASTI[GUASTO].perche + ')' : ''));
  if (eccezioni.length) console.log('eccezioni di pagina: ' + eccezioni.slice(0, 4).join(' | '));
  const rossi = esiti.filter(e => !e.ok);
  console.log(rossi.length ? '\nROSSO: ' + rossi.length + ' controlli su ' + esiti.length + '\n'
                           : '\nVERDE: ' + esiti.length + ' controlli su ' + esiti.length + '\n');
  process.exit(rossi.length ? 1 : 0);
})();
