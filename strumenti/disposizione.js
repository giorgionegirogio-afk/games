/* =====================================================================
   DISPOSIZIONE — il cancello che guarda COME SONO MESSE le cose.

   PERCHE' ESISTE, e la ragione porta una data. Il 28 agosto 2026 lo
   SPOGLIATOIO sul telefono si presentava cosi': SQUADRA e ROSA appaiate,
   CAMPI da solo a sinistra con mezza riga di niente accanto, e sotto un
   buco prima di TORNA AL MENU. La batteria era verde, perche' nessuno
   dei cancelli in lista guarda la GEOMETRIA.

   MISURATO, e non e' un modo di dire — stessa corsa, stesso file
   (CALCETTO-il-gioco.html, impronta 1dc9e6d73a8d, 28 agosto 2026):

     collaudo      OK   36 controlli, 36 passati        apre le schermate
                                                        e conta i nodi
     testo-fuori   OK   0 tagliati, 0 puntini, 0 sborda  confronta
                        scrollWidth con clientWidth, e dichiara da solo
                        di NON vedere ne' i vuoti ne' gli a capo
     disposizione  NO   11 guai distinti

   Gli altri due che sfiorano l'argomento non ci arrivano per costruzione:
   tocco.js chiede DOVE FINISCONO i bersagli, e CAMPI orfano sta dentro lo
   schermo e si tocca benissimo; istantanea.js fotografa e giudica la
   LUCE, non la geometria.

   Una schermata puo' essere verde su tutti, toccabile, leggibile, ben
   illuminata, e restare messa male.

   =====================================================================
   LE DUE DOMANDE, e i numeri con cui si rispondono.

   1) UNA FILA DI BOTTONI E' UNA FILA?

      In una GRIGLIA le celle di una riga sono uguali per costruzione: se
      escono diverse, qualcosa le ha sformate, ed e' un difetto. In un
      FLEX invece le larghezze diverse sono la regola dichiarata (i tre
      bottoni in fondo a SFIDA sono lunghi quanto le loro parole), quindi
      li' lo scarto si stampa e non fa rosso: un cancello che accusa il
      comportamento normale di un contenitore viene spento in un giorno.

      SCARTO    la piu' larga meno la piu' stretta, fra i bottoni della
                stessa riga. Rosso sopra 4 px, e solo in griglia.
      SBILANCIO quanto il vuoto della riga sta TUTTO DA UNA PARTE:
                |spazio a sinistra - spazio a destra|. Un bottone
                centrato da solo ha sbilancio 0 ed e' una scelta; un
                bottone lasciato in un angolo con mezza riga di niente
                accanto ha sbilancio grande ed e' un ORFANO. Rosso sopra
                il 25% del contenitore, e solo in griglia a due o piu'
                colonne — dove la riga vuota accanto e' un posto che
                esisteva e non e' stato usato.
      BUCATA    una riga che lascia un posto libero da una parte MENTRE
                SOTTO CE N'E' UN'ALTRA. L'orfano e' sempre l'ultimo; una
                cella vuota in mezzo e' un difetto diverso, e le due
                regole non si coprono a vicenda — vedi il commento sul
                posto, dove sta scritto come questa e' nata.

   2) IL PANNELLO USA LO SPAZIO CHE OCCUPA?

      Si guarda dove c'e' INCHIOSTRO (testo, bottoni, tele, icone) e dove
      no. NON i fondi dei contenitori: la fascia dei bottoni ha un
      gradiente che copre anche il suo tratto vuoto, e contarlo direbbe
      «pieno» di mezzo schermo che l'occhio legge vuoto — era proprio il
      caso dello SPOGLIATOIO.

      VUOTO   il piu' grande buco fra due contenuti. Rosso sopra un
              SESTO dell'altezza dello schermo.
      BUCHI   la somma dei buchi, sull'altezza che il pannello occupa.
              Rosso sopra UN TERZO: un pannello piu' buco che roba.

      PERCHE' DUE REGOLE E NON UNA, e qui i numeri del 28 agosto 2026
      (845x402, gioco spedito) decidono da soli. BUCHI e' la regola
      chiesta a parole — «piu' di un terzo di schermo vuoto» — e da sola
      AVREBBE MANCATO PROPRIO LA SCHERMATA DELLA SEGNALAZIONE:

                        buco piu' grande      buchi sul pannello
        SPOGLIATOIO       20,4%  ROSSO         28,8%   verde
        BACHECA           20,4%  ROSSO         35,4%   ROSSO
        IMPOSTAZIONI      20,4%  ROSSO         28,8%   verde
        TORNEO            19,9%  ROSSO         29,2%   verde
        STAGIONE          19,9%  ROSSO         27,4%   verde

      Lo SPOGLIATOIO — quello con CAMPI orfano e il buco prima di TORNA
      AL MENU, quello fotografato — sta al 28,8%, sotto il terzo. Con la
      sola regola del terzo il cancello sarebbe nato cieco al difetto per
      cui e' stato scritto, e sarebbe stato verde su quattro schermate
      malate su cinque.

      VUOTO le prende tutte e cinque, e non per un pelo: 19,9-20,4%
      contro un massimo del 16,7%. Un pannello puo' essere sfilacciato
      dappertutto (BUCHI) o avere un buco solo ma grosso (VUOTO), e sono
      due malattie diverse: servono tutte e due le regole.

      SOLO SU SCHERMATE CHE NON SCORRONO. Se una lista scorre, il vuoto
      sotto l'ultima riga non e' un buco: e' il resto della lista che
      aspetta. Le schermate che scorrono si contano e si saltano.

   =====================================================================
   COSA NON VEDE, detto perche' e' il prossimo buco:
     · gli A CAPO (la riga «UNA VOLTA, PER SEMPRE» che si spezza nei
       biglietti del negozio): un testo su due righe riempie il suo
       contenitore, e per questo cancello e' pieno. Si misura altrove
       (strumenti/_diag-acapo.js);
     · tutto cio' che e' dipinto su CANVAS: qui la tela e' un rettangolo
       di inchiostro, di quel che c'e' dentro non si sa niente;
     · l'ARMONIA. Questo dice se una fila e' storta e se un pannello e'
       bucato. Non dice se e' bello.

   uso:  node strumenti/disposizione.js
         node strumenti/disposizione.js --gioco fuori/griglia.html
         node strumenti/disposizione.js --tutto      stampa ogni misura
         node strumenti/disposizione.js --formato 845x402
         node strumenti/disposizione.js --guasto     si sabota da solo
   esce 0 verde · 1 il gioco e' rosso · 2 il banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const GIOCO_FUORI = (() => {
  const v = arg('gioco', process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + a); process.exit(3); }
  return a;
})();
const ridirigi = f => (GIOCO_FUORI && /CALCETTO-il-gioco\.html$/i.test(f)) ? GIOCO_FUORI : f;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = ridirigi(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': (f.endsWith('.html') ? 'text/html' : 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* I FORMATI. La griglia a due colonne che questo cancello sorveglia vive
   sotto @media (max-height:470px), cioe' SOLO sul telefono in
   orizzontale: e' li' che il difetto e' nato ed e' li' che si misura.
   845x402 e' il OnePlus 6 vero (2280x1080 a densita' 2,69), gli altri tre
   sono i telefoni corti che stanno ancora in giro. I formati alti
   (verticale, desktop) NON entrano: li' .menu-voci e' una colonna sola,
   ogni riga ha una voce, e non c'e' nessuna fila da confrontare — misurarli
   vorrebbe dire riempire il referto di righe che non possono mai fallire. */
const FORMATI = [
  { w: 845, h: 402, n: 'OnePlus 6 oriz' },
  { w: 915, h: 412, n: 'telefono grande oriz' },
  { w: 812, h: 375, n: 'telefono medio oriz' },
  { w: 740, h: 360, n: 'telefono corto oriz' },
  /* 822x325 NON e' un telefono: e' il OnePlus 6 in orizzontale DENTRO
     CHROME, con la barra dell'indirizzo che si mangia 77 px di altezza.
     E' il formato in cui il 28 agosto 2026 si e' visto, sul telefono
     vero, che la cura dell'orfano aveva spinto NEGOZIO fuori dalla fila
     della home — e i quattro formati qui sopra non lo dicevano. Un
     cancello che misura solo la finestra ideale non e' il telefono. */
  { w: 822, h: 325, n: 'OnePlus 6 in Chrome (con barra indirizzo)' },
  /* =====================================================================
     LE DUE TAGLIE STRETTE, aggiunte il 28 agosto 2026 a sera, e la
     ragione e' un difetto vero passato in mezzo.

     I cinque formati qui sopra sono tutti larghi 740 px o piu'. La home
     del gioco cambia griglia a `@media (max-height:470px) and
     (max-width:700px)`: sotto quei 700 px prende un'altra impaginazione,
     con un numero di colonne diverso. Cioe' questo cancello — che esiste
     APPOSTA per le voci orfane in una fila — non ha mai guardato la sola
     zona in cui la fila e' diversa. Il difetto viveva nella fessura fra
     740 e 700, e la fessura non era visibile da nessuna parte: nessun
     formato la nominava, nessun commento la dichiarava.
     COSA C'ERA DENTRO, misurato il 28 agosto 2026 a sera sul gioco
     spedito: sette voci in sei colonne, cioe' NEGOZIO da solo su una
     seconda riga a 568x320 e a 640x360 (chiuso da strumenti/_t-vero.js).
     640x360 e' il 16:9 piu' stretto che si vende; 568x320 e' il telefono
     vecchio coricato, ed e' la stessa coppia che tocco.js gia' misura —
     due cancelli sulla stessa taglia dicono cose diverse, e il confronto
     e' utile. */
  { w: 640, h: 360, n: '16:9 coricato, il piu\' stretto che si vende' },
  { w: 568, h: 320, n: 'telefono vecchio coricato — sotto la soglia dei 700 px' },
];

/* ------------------------------ LE SOGLIE ------------------------------
   Ognuna con il numero misurato il 28 agosto 2026 su fuori/griglia.html
   (il gioco spedito, coi caratteri veri), 845x402, che le ha decise. */
const SCARTO_MAX = 4;        // px. In griglia le celle sono uguali per costruzione: 4 px e' l'arrotondamento, non un difetto. Serve anche di soglia al posto libero di BUCATA.
const SBILANCIO_MAX = 25;    // % del contenitore. CAMPI orfano nello SPOGLIATOIO misurava 50,5%; la fila sana ne fa 0.
const VUOTO_MAX = 100 / 6;   // % dell'altezza dello schermo. I cinque buchi sopra TORNA AL MENU: 19,9-20,4% (80-82 px su 402).
const BUCHI_MAX = 100 / 3;   // % dell'altezza del pannello. Solo BACHECA la superava (35,4%); SPOGLIATOIO 28,8%, TORNEO 29,2%, STAGIONE 27,4% no — vedi la tabella in testa.

const SONDA = fs.readFileSync(path.join(__dirname, '_sonda-disposizione.js'), 'utf8');

/* =====================================================================
   UN BUCO SI CONFERMA GUARDANDO I PIXEL, e questa non e' una raffinatezza:
   e' la riga che ha impedito a questo cancello di nascere bugiardo.

   Il DOM sa dove stanno i suoi elementi e non sa NIENTE di quello che
   c'e' dietro. Alla prima corsa questo cancello ha accusato la HOME di
   avere un buco di 122 px fra il tabellone e le sette voci. In quei 122
   px c'e' il CAMPETTO CON I GIOCATORI: una tela dipinta sotto le
   schermate, che il gioco mostra apposta («sotto si apre una FINESTRA
   sul campetto — che e' la scena, non un vuoto», scritto nel CSS dal
   2470). Lo stesso vale per FISCHIO FINALE e per PAUSA, che sono velari
   sopra la partita.

   Un cancello che accusa la scena piu' curata del gioco di essere un
   vuoto verrebbe spento la settimana dopo, e con lui il difetto vero.

   Percio' ogni buco candidato si guarda in fotografia, e si misura la
   DENSITA' DI BORDI: quanti pixel differiscono nettamente dal vicino. Un
   gradiente — il prato in ombra, la velatura della fascia — cambia di un
   valore o due alla volta e non fa bordi. Un giocatore, una lettera, una
   cornice ne fanno tanti. Sotto SOGLIA_BORDI il buco e' vuoto davvero;
   sopra, dentro c'e' qualcosa che questo cancello non sa nominare, e
   allora tace invece di accusare.

   I NUMERI, misurati il 28 agosto 2026 a 845x402 sul gioco spedito:
     SPOGLIATOIO,  buco di 82 px sopra TORNA AL MENU     bordi 0,44%
     BACHECA,      buco di 82 px                         bordi 0,42%
     TORNEO,       buco di 80 px                         bordi 0,45%
     STAGIONE,     buco di 80 px                         bordi 0,46%
     HOME,      «buco» di 122,2 px col campetto dentro    bordi 3,67%
     FISCHIO FINALE, «buco» di 101,4 px sulla partita     bordi 2,22%
   Fra 0,46 (il piu' sporco dei vuoti veri) e 2,22 (il piu' pulito dei
   pieni) c'e' un fosso largo cinque volte: la soglia sta a 1,0%.

   E SOLO IL SALTO VERTICALE, non quello orizzontale — vedi il commento
   dentro MISURA_BORDI: col salto orizzontale i vuoti veri misuravano
   fino al 13,98% per via della tosatura a strisce del prato, cioe' piu'
   del campetto coi giocatori, e la conferma avrebbe assolto tutto.
   ===================================================================== */
const SOGLIA_BORDI = 1.0;   // % di pixel con un bordo: sotto, il buco e' vuoto davvero

/* La funzione viaggia come FUNZIONE, non come stringa: passata a
   pg.evaluate come testo, Playwright la valutava senza mai chiamarla e
   tornava undefined — cioe' la conferma fotografica non avveniva e il
   cancello avrebbe accusato lo stesso. */
async function MISURA_BORDI({ b64, bande }) {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  const cv = document.createElement('canvas');
  cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.drawImage(img, 0, 0);
  const D = cx.getImageData(0, 0, cv.width, cv.height).data;
  const luma = (x, y) => { const i = (y * cv.width + x) * 4; return .299 * D[i] + .587 * D[i + 1] + .114 * D[i + 2]; };
  return bande.map(({ x0, x1, y0, y1 }) => {
    const ax = Math.max(1, Math.round(x0)), bx = Math.min(cv.width - 3, Math.round(x1));
    const ay = Math.max(1, Math.round(y0)), by = Math.min(cv.height - 3, Math.round(y1));
    let n = 0, bordi = 0;
    for (let y = ay; y < by; y++) for (let x = ax; x < bx; x++) {
      n++;
      /* SOLO IL SALTO VERTICALE, e non e' un dettaglio: il prato ha la
         TOSATURA A STRISCE VERTICALI, cioe' gradini netti da sinistra a
         destra. Contando anche il salto orizzontale, il buco piu' vuoto
         del gioco — gli 82 px sopra TORNA AL MENU — misurava 13,98% di
         bordi, piu' del campetto coi giocatori: la conferma fotografica
         avrebbe assolto tutto. Una striscia e' costante lungo y; un
         giocatore, una lettera, una cornice no. */
      if (Math.abs(luma(x, y) - luma(x, y + 2)) > 18) bordi++;
    }
    return n ? +(bordi / n * 100).toFixed(2) : 0;
  });
}

/* =====================================================================
   IL SABOTAGGIO — perche' un cancello senza il suo rosso dimostrato e'
   un timbro, e perche' questo qui e' fatto proprio cosi'.

   Colpisce una schermata SANA (BACHECA: due voci appaiate, pannello
   compatto), non quella gia' malata: sabotare il malato non dimostra
   niente. E gli fa QUATTRO ferite, una per ogni regola che il cancello
   dichiara, perche' un guasto che accende tre regole su quattro lascia
   la quarta senza prova — ed e' gia' successo in questa casa.

     SCARTO   TROFEI stretto al 60% e appoggiato a sinistra: due celle
              dichiarate uguali che escono di larghezze diverse.
     ORFANO   una terza voce inchiodata a UNA colonna, ultima della sua
              griglia. L'inchiodatura (grid-column:auto) e' necessaria:
              senza, la cura del 28 agosto le darebbe tutta la riga e il
              guasto si curerebbe da solo — cioe' non proverebbe piu'
              niente. E' il modo in cui un controllo negativo diventa
              finto senza che si veda.
     BUCATA   una QUARTA voce spinta alla terza riga: cosi' la seconda
              riga resta a meta' con una riga sotto, che e' la ferita che
              ORFANO non sa fare (l'orfano e' sempre ULTIMO).
     VUOTO    uno spaziatore di 110 px: il 27% di uno schermo alto 402,
              oltre il sesto ammesso.
     BUCHI    lo stesso spaziatore porta il pannello oltre il terzo.
   ===================================================================== */
const GUASTO = `(() => {
  const b = document.getElementById('bacheca');
  const voci = b.querySelector('.menu-voci');
  document.getElementById('btnTrofei').style.width = '60%';
  document.getElementById('btnTrofei').style.justifySelf = 'start';
  const voce = (id, testo, riga) => {
    const e = document.createElement('button');
    e.className = 'voce'; e.id = id;
    e.style.gridColumn = 'auto';
    if (riga) e.style.gridRow = riga;
    e.innerHTML = testo + ' <small>il guasto di prova</small>';
    voci.appendChild(e);
  };
  voce('btnGuasto1', 'ALBO D\\'ORO');            // riga 2, colonna 1: accanto resta un buco
  voce('btnGuasto2', 'PALMARES', '3');           // riga 3: e cosi' la 2 non e' piu' l'ultima
  /* LE DUE FERITE VERTICALI VANNO SU UN'ALTRA SCHERMATA SANA, e la
     ragione e' misurata: messe qui, le tre righe di voci piu' i 110 px
     facevano SCORRERE la BACHECA — e su una schermata che scorre le
     regole del pannello si astengono apposta. Il guasto si sarebbe
     autoassolto, e VUOTO e BUCHI sarebbero rimasti senza prova. */
  const buco = document.createElement('div');
  buco.style.height = '110px';
  document.getElementById('spogliatoio').querySelector('.menu-voci').after(buco);
  return true;
})()`;

(async () => {
  const srv = await servi();
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('BANCO ESPLOSO: Chromium non parte — ' + e.message); srv.chiudi(); process.exit(2); }

  const soloFormato = arg('formato', '');
  const formati = soloFormato ? FORMATI.filter(f => `${f.w}x${f.h}` === soloFormato) : FORMATI;
  if (!formati.length) { console.error('PROVA NULLA: formato sconosciuto ' + soloFormato); await br.close(); srv.chiudi(); process.exit(3); }
  const guasto = haFlag('guasto');

  const guai = [], misure = [], pieni = [];
  let viste = 0, scorrono = 0;

  for (const f of formati) {
    const ctx = await br.newContext({ viewport: { width: f.w, height: f.h }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pg = await ctx.newPage();
    const errori = [];
    pg.on('pageerror', e => errori.push(e.message));
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pg.evaluate(() => document.fonts.ready);
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.waitForTimeout(400);

    /* le schermate vuote non si misurano: meta' del gioco la scrive un
       build*UI() al momento in cui si apre (stessa ragione di testo-fuori.js) */
    await pg.evaluate(() => {
      for (const n of ['buildRosaUI', 'buildStagioneUI', 'buildTorneoUI', 'buildCampiUI', 'buildNegozioUI',
        'buildKitGrid', 'buildTrofeiUI', 'buildStatsUI', 'refreshImpostUI', 'montaEroi', 'montaCoppe'])
      { try { if (typeof window[n] === 'function') window[n](); } catch (e) {} }
    });
    if (guasto) await pg.evaluate(GUASTO);

    const schermi = await pg.evaluate(() => [...document.querySelectorAll('.ov')].map(e => e.id).filter(Boolean));
    if (!schermi.length) { console.error('BANCO MUTO: nessuna schermata trovata.'); await br.close(); srv.chiudi(); process.exit(2); }

    for (const id of schermi) {
      await pg.evaluate(i => {
        const el = document.getElementById(i); if (!el) return;
        /* SI SPENGONO TUTTE, POI SE NE ACCENDE UNA. goScreen() governa solo
           le schermate piene: le sovrapposte (.trasp — PAUSA, FISCHIO
           FINALE) restano accese sopra tutto il resto. PAUSA e' la prima
           .ov del documento, quindi si apriva per prima e ci restava: la
           fotografia dello SPOGLIATOIO era la fotografia di PAUSA, e il
           buco piu' vuoto del gioco «misurava» 9,58% di bordi perche'
           dentro ci stava il pannello di PAUSA. Il DOM diceva il vero e i
           pixel no: e' esattamente il modo in cui una conferma diventa
           una bugia. */
        document.querySelectorAll('.ov').forEach(o => o.classList.add('hidden'));
        if (typeof goScreen === 'function' && !el.classList.contains('trasp')) goScreen(el);
        else el.classList.remove('hidden');
        window.__sondaOv = i;
      }, id);
      await pg.waitForTimeout(180);
      const m = await pg.evaluate(SONDA);
      if (!m || m.id !== id) continue;
      viste++;
      const dove = `${f.w}x${f.h}`;

      /* ---------------- 1. le file di bottoni ---------------- */
      for (const c of m.file) {
        const griglia = c.display.includes('grid');
        /* LE COLONNE DICHIARATE DIVERSE NON SONO UN DIFETTO. La home ha
           `1.5fr repeat(6,1fr)`: GIOCA e' una volta e mezzo le altre
           APPOSTA, e sta scritto nel CSS («la gerarchia non si perde»).
           Lo scarto si misura solo dove le colonne dichiarate sono
           uguali fra loro — la' l'uguaglianza e' una promessa, e romperla
           e' un difetto. */
        const tracce = griglia ? (c.colonne || '').trim().split(/\s+/).map(parseFloat).filter(Number.isFinite) : [];
        const colonnePari = tracce.length >= 2 && (Math.max(...tracce) - Math.min(...tracce)) <= 1;
        for (const r of c.righe) {
          misure.push({ tipo: 'fila', dove, schermo: id, via: c.via, riga: r.n, griglia, colonnePari,
            scarto: r.scarto, sbilancio: r.sbilancioPc, colonne: c.nColonne, voci: r.bottoni.length });
          if (griglia && colonnePari && r.soloBottoni && r.scarto > SCARTO_MAX)
            guai.push({ tipo: 'SCARTO', dove, schermo: id, via: c.via,
              det: `riga ${r.n}: larghezze ${r.larghezze.join('/')} in colonne dichiarate uguali — scarto ${r.scarto} px su un massimo di ${SCARTO_MAX}`,
              chi: r.bottoni.map(b => b.t).join(' · ') });
          if (griglia && c.nColonne >= 2 && r.sbilancioPc > SBILANCIO_MAX)
            guai.push({ tipo: 'ORFANO', dove, schermo: id, via: c.via,
              det: `riga ${r.n}: ${r.bottoni.length} voce/i in ${c.nColonne} colonne — vuoto ${r.sx} a sinistra e ${r.dx} a destra, sbilancio ${r.sbilancioPc}% su un massimo di ${SBILANCIO_MAX}%`,
              chi: r.bottoni.map(b => b.t).join(' · ') });
          /* =================================================================
             UNA RIGA DI MEZZO NON PUO' AVERE CELLE VUOTE.
             Se sotto c'e' un'altra riga, il posto lasciato libero in
             questa non e' «la lista che finisce»: e' un BUCO, e la voce
             che sta sotto poteva starci.
             Questa regola e' nata da un errore mio, il 28 agosto 2026: la
             cura dell'orfano dava tutta la riga all'ultima voce dispari, e
             in HOME — dove la griglia ha SETTE colonne, non due — ha
             spinto NEGOZIO da solo su una seconda riga larga tutto,
             lasciando una cella vuota nella prima. Su TUTTI E CINQUE i
             formati. E questo cancello era VERDE, perche' lo sbilancio
             della prima riga era 13,5%, sotto la soglia del 25%. L'ha
             visto il telefono, non il banco. Adesso lo vede il banco.

             LO SPAZIO DEV'ESSERE ARENATO DA UNA PARTE, non diviso: la
             riga FACILE/NORMALE/DURO delle preferenze e' un selettore
             centrato che lascia 100 px per parte ed e' una scelta, non
             una cella vuota. Si chiede quindi ANCHE lo sbilancio, che li'
             vale 0 e nella home valeva 109,4. */
          if (griglia && c.nColonne >= 2 && r.n < c.righe.length &&
              r.dx > SCARTO_MAX && r.sbilancio > SCARTO_MAX)
            guai.push({ tipo: 'BUCATA', dove, schermo: id, via: c.via,
              det: `riga ${r.n} di ${c.righe.length}: ${r.bottoni.length} voci in ${c.nColonne} colonne lasciano ${r.dx} px liberi a destra (e ${r.sx} a sinistra), e sotto c'e' un'altra riga — quel posto poteva essere usato`,
              chi: r.bottoni.map(b => b.t).join(' · ') });
        }
      }

      /* ---------------- 2. il pannello ---------------- */
      if (m.scorre) { scorrono++; continue; }
      const span = m.bande.length > 1 ? m.bande[m.bande.length - 1].b - m.bande[0].a : 0;

      /* I BUCHI CANDIDATI SI GUARDANO IN FOTOGRAFIA prima di accusarli:
         dietro puo' esserci il campetto, o la partita. Vedi MISURA_BORDI. */
      let vuoti = m.vuoti;
      if (vuoti.length) {
        const scatto = (await pg.screenshot({ type: 'png' })).toString('base64');
        const bande = vuoti.map(v => ({ x0: m.box.x, x1: m.box.x + m.box.w, y0: v.a, y1: v.b }));
        const bordi = await pg.evaluate(MISURA_BORDI, { b64: scatto, bande });
        vuoti = vuoti.map((v, i) => ({ ...v, bordi: bordi[i] }));
        for (const v of vuoti) if (v.bordi > SOGLIA_BORDI) pieni.push({ dove, schermo: id, v });
        vuoti = vuoti.filter(v => v.bordi <= SOGLIA_BORDI);
      }
      const somma = vuoti.reduce((a, v) => a + v.px, 0);
      const buchiPc = span > 0 ? +(somma / span * 100).toFixed(1) : 0;
      const vuotoMax = vuoti.length ? Math.max(...vuoti.map(v => v.px)) : 0;
      const vuotoMaxPc = +(vuotoMax / m.vh * 100).toFixed(1);
      misure.push({ tipo: 'pannello', dove, schermo: id, vuoto: vuotoMaxPc, buchi: buchiPc, span: +span.toFixed(1) });
      if (vuotoMaxPc > VUOTO_MAX) {
        const v = vuoti.reduce((a, b) => b.px > a.px ? b : a, vuoti[0]);
        guai.push({ tipo: 'VUOTO', dove, schermo: id, via: '(pannello)',
          det: `un buco di ${v.px} px fra y=${v.a} e y=${v.b} su uno schermo alto ${m.vh}: ${vuotoMaxPc}% contro un massimo di ${VUOTO_MAX.toFixed(1)}% — e in fotografia e' vuoto davvero (bordi ${v.bordi}%)`,
          chi: '' });
      }
      if (buchiPc > BUCHI_MAX)
        guai.push({ tipo: 'BUCHI', dove, schermo: id, via: '(pannello)',
          det: `${somma.toFixed(1)} px di buchi sui ${span.toFixed(1)} px che il pannello occupa: ${buchiPc}% contro un massimo di ${BUCHI_MAX.toFixed(1)}%`,
          chi: '' });
    }
    if (errori.length) console.log(`  (${f.w}x${f.h}: ${errori.length} errori di pagina, il primo: ${errori[0].slice(0, 90)})`);
    await ctx.close();
  }
  await br.close(); srv.chiudi();

  if (!viste) { console.error('PROVA NULLA: nessuna schermata misurata.'); process.exit(3); }

  console.log(`\n=== DISPOSIZIONE — ${formati.length} formati x ${Math.round(viste / formati.length)} schermate ===`);
  console.log(`    (${scorrono} misure di pannello saltate: quelle schermate scorrono, e li' il vuoto in fondo e' la lista che continua)\n`);

  if (pieni.length) {
    /* SI STAMPA SEMPRE, anche in verde: e' la lista di quello che il
       cancello ha deciso di NON accusare, e un cancello che tace le sue
       assoluzioni si puo' addomesticare senza che nessuno lo veda. */
    const q = new Map();
    for (const p of pieni) {
      const k = p.schermo + '|' + p.v.a;
      if (!q.has(k)) q.set(k, { ...p, n: 0 });
      q.get(k).n++;
    }
    console.log('  BUCHI CANDIDATI ASSOLTI DALLA FOTOGRAFIA (dentro c\'e\' roba che il DOM non sa nominare):');
    for (const p of q.values())
      console.log('    ' + p.schermo.padEnd(13) + ' ' + String(p.v.px).padStart(6) + ' px fra y=' + p.v.a + ' e y=' + p.v.b + '  bordi ' + p.v.bordi + '% (soglia ' + SOGLIA_BORDI + '%)  su ' + p.n + ' formati');
    console.log('');
  }

  if (haFlag('tutto')) {
    console.log('  OGNI MISURA:');
    for (const x of misure) {
      if (x.tipo === 'fila') console.log(`    fila     ${x.dove.padEnd(8)} ${x.schermo.padEnd(13)} ${x.via.padEnd(14)} riga ${x.riga}  ${String(x.voci).padStart(2)} voci in ${x.colonne || '-'} col  scarto ${String(x.scarto).padStart(6)}  sbilancio ${String(x.sbilancio).padStart(6)}%${x.griglia ? '' : '   (flex: non fa rosso)'}`);
      else console.log(`    pannello ${x.dove.padEnd(8)} ${x.schermo.padEnd(13)} vuoto piu' grande ${String(x.vuoto).padStart(5)}%  buchi ${String(x.buchi).padStart(5)}% di ${x.span} px`);
    }
    console.log('');
  }

  /* lo stesso difetto su quattro formati e' UN difetto, non quattro */
  const g = new Map();
  for (const x of guai) {
    const k = x.tipo + '|' + x.schermo + '|' + x.via + '|' + x.chi;
    if (!g.has(k)) g.set(k, { ...x, formati: [] });
    g.get(k).formati.push(x.dove);
  }

  if (!g.size) {
    console.log('VERDE: nessuna fila storta, nessun pannello bucato.\n');
    process.exit(0);
  }
  console.log('  GUAI, uno per riga (lo stesso su piu\' formati e\' contato una volta):\n');
  for (const x of g.values()) {
    console.log(`   X ${x.tipo.padEnd(7)} ${x.schermo.padEnd(13)} ${x.via.padEnd(14)} su ${x.formati.length} formati (${x.formati[0]}...)`);
    console.log(`       ${x.det}`);
    if (x.chi) console.log(`       voci: ${x.chi}`);
  }
  const perTipo = {};
  for (const x of g.values()) perTipo[x.tipo] = (perTipo[x.tipo] || 0) + 1;
  console.log(`\nROSSO: ${g.size} guai distinti — ` + Object.entries(perTipo).map(([k, v]) => `${v} ${k}`).join(', ') + '.\n');
  process.exit(1);
})().catch(e => { console.error('BANCO ESPLOSO: ' + e.stack); process.exit(2); });
