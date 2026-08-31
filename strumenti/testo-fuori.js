/* =====================================================================
   TESTO-FUORI — il cancello che vede le parole tagliate.

   PERCHE' ESISTE, e la ragione porta una data. Il 28 agosto 2026 il
   titolo del gioco si leggeva «CALCETT» sulla schermata principale di
   un OnePlus 6 vero, e nessuno dei venti cancelli l'aveva mai detto.
   Non per distrazione: nessuno di loro GUARDA IL TESTO. Misurano
   pixel del campo, sorteggi, gol, contrasti, licenze, byte — e il
   nome del gioco scritto male in home passava sotto tutti.

   Un testo che esce dal suo contenitore non e' una questione di
   gusto: e' un numero che sta nel DOM. Un elemento sa quanto e' largo
   il suo contenuto (scrollWidth) e quanto e' largo il suo riquadro
   (clientWidth). Se il primo supera il secondo, il contenuto sporge; e
   se qualcuno lungo la catena dei genitori ritaglia (overflow diverso
   da visible), quel contenuto NON SI LEGGE PIU'.

   QUATTRO CATEGORIE, e vanno tenute separate perche' costano diverso:

     TAGLIATO — il contenuto sporge, qualcuno lo ritaglia, e NON c'e'
                nessun segno che avverta: le lettere spariscono e basta.
                E' il rosso, e il rosso e' zero.
     PUNTINI  — il contenuto sporge, qualcuno lo ritaglia, ma c'e'
                text-overflow:ellipsis: le lettere che mancano LO DICONO.
                E' una scelta di impaginazione dichiarata (i nomi lunghi
                della rosa), non una perdita silenziosa. Si conta e si
                stampa, non fa rosso da solo.
     SBORDA   — il contenuto sporge ma niente lo ritaglia: le lettere si
                leggono ancora, appoggiate su quello che c'e' sotto.
                Brutto, spesso il preavviso del taglio, ma non e' una
                perdita: si stampa e si conta.
     MARCHIO  — il caso di «CALCETT», che si misura in un modo TUTTO SUO
                ed e' spiegato qui sotto. Rosso, e il rosso e' zero.

   PUNTINI e SBORDA hanno un riferimento scritto qui sotto, con la data:
   diventano rossi quando PEGGIORANO, non perche' esistono.

   ================= IL CASO «CALCETT», E PERCHE' NON BASTAVA ============
   RETTIFICA DEL 28 AGOSTO 2026, ORE 20. Fino a stasera queste righe
   dicevano che il caso di «CALCETT» era il rosso di scrollWidth. NON ERA
   VERO, ed e' il difetto peggiore che un cancello possa avere: dichiarare
   di sorvegliare la cosa per cui e' nato senza poterla vedere.
   Il marchio non e' una parola in una scatola. E' un <text> dentro un
   <defs> di un <svg>, e la O finale non e' una lettera: e' un <circle>
   inchiodato a cx=561, r=38, cioe' che comincia a 523. Da qui:
     · un elemento dentro <defs> non e' impaginato — il suo
       getBoundingClientRect() e' largo ZERO e alto zero (misurato oggi);
     · scrollWidth e clientWidth su un elemento SVG valgono zero tutti e
       due, quindi la differenza fra i due — l'unica cosa che questo
       cancello guardava — e' zero per costruzione;
     · e anche se non lo fossero, il difetto NON E' un traboccamento: la
       parola era troppo CORTA, non troppo lunga. Restava un vuoto di 99
       unita' fra la fine della T e l'inizio del cerchio, e l'occhio
       leggeva «CALCETT» piu' un pallino a parte.
   Quindi da stasera il marchio si misura come lo misura
   strumenti/_q-carattere.js, e cioe' con l'unica domanda che ha senso:

     DOVE FINISCE LA PAROLA, E DOVE COMINCIA IL CERCHIO?

   getComputedTextLength() da' l'avanzamento vero della parola in unita'
   del disegno, e funziona anche dentro <defs>. Il vuoto e' l'inizio del
   cerchio meno la fine della parola. Misurato oggi sul gioco spedito:
   vuoto 8 unita' su un font-size di 100. La banda ammessa e' -8..+38: 38
   e' MEZZO DIAMETRO della O (che ne misura 76), e oltre mezza O di vuoto
   la parola e il cerchio smettono di leggersi come una parola sola. Il
   difetto vero, sul OnePlus 6, ne aveva 99.

   E LA SECONDA DOMANDA, che _q-carattere.js non fa e che senza di essa
   il primo controllo si autoconvalida: il marchio porta textLength="515",
   che OBBLIGA il browser a stendere i glifi su 515 unita' qualunque cosa
   dica il carattere. Con textLength addosso, la larghezza misurata e'
   sempre quella dichiarata — cioe' il vuoto e' sempre 8 e il controllo
   non puo' cadere. Percio' si misura ANCHE la larghezza NATURALE (lo
   stesso <text> con textLength tolto per un istante) e si controlla lo
   STIRAMENTO = dichiarata / naturale. Oggi vale 1,000: Archivo Black
   scrive «CALCETT» in 515 unita' esatte, cioe' textLength non sta
   raddrizzando niente. La banda e' 0,88..1,14, perche' un carattere
   steso del 60% (e' il caso del condensato: 319,6 unita') si legge
   deformato anche quando la geometria torna.

   COME SI VEDE IL ROSSO:  node strumenti/testo-fuori.js --guasto
   toglie il textLength e fa vincere alla cascata il carattere
   condensato del gioco — che e' la forma esatta del difetto vero (li'
   vinceva Roboto sul telefono, 424 unita' invece di 515). Numeri visti
   il 28 agosto 2026 col guasto: parola 319,6, vuoto 203,4, stiramento
   1,000 -> il cancello esce ROSSO. Senza guasto, verde.

   COSA NON VEDE, ed e' onesto dirlo perche' e' il buco da cui e'
   passato il difetto gemello di quel giorno:
     · un testo che va A CAPO invece di sporgere non muove ne'
       scrollWidth ne' clientWidth. «DOPOLAVORO FC · LE SETTE DI SERA»
       lasciava SERA da sola sulla seconda riga e per questo banco era
       perfetto. Il rimedio non e' qui dentro: e' nel CSS, dove le righe
       che devono stare su una riga sola portano white-space:nowrap —
       cosi' un traboccamento futuro diventa visibile a questa misura
       invece di nascondersi in un a-capo;
     · un testo tagliato DA UN CANVAS (il tabellone, l'HUD, i numeri
       dipinti) non sta nel DOM e qui non arriva;
     · un testo tagliato IN ALTEZZA si misura (scrollHeight contro
       clientHeight) e si stampa, ma non e' rosso: mezza dozzina di
       pannelli del gioco scorrono per costruzione.

   COME MISURA. Apre la pagina, e per ogni formato passa in rassegna
   TUTTE le schermate (le .ov piu' la pausa), una alla volta, con
   goScreen; in ognuna prende ogni elemento che contiene testo suo
   (nodi di testo non vuoti), lo misura, e per quelli che sporgono
   cerca il primo antenato che ritaglia.

   I FORMATI sono quelli dei telefoni veri, orizzontale e verticale, piu'
   un desktop: 845x402 e' il OnePlus 6 (2280x1080 a densita' 2,69), cioe'
   la macchina su cui il difetto e' stato visto.

   uso:  node strumenti/testo-fuori.js
         node strumenti/testo-fuori.js --gioco fuori/titolo.html
         node strumenti/testo-fuori.js --tutto      stampa anche gli SBORDA
         node strumenti/testo-fuori.js --formato 845x402
         node strumenti/testo-fuori.js --guasto     il controllo negativo
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

/* --- IL GIOCO PUO' ARRIVARE DA FUORI (regola di casa: nessun percorso
   cablato, o una bisezione misura tre volte lo stesso file). --- */
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
        const t = f.endsWith('.html') ? 'text/html'
          : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* I FORMATI. Non sono tondi per caso: 845x402 e' il OnePlus 6 in
   orizzontale (2280x1080 fisici a densita' 2,69), 915x412 e 412x915 sono
   il telefono grande nelle due posizioni, 360x640 e' il telefono piccolo
   che sta ancora in giro, 1440x900 il desktop dove girano tutti gli
   altri cancelli — ed e' proprio la ragione per cui il difetto del 28
   agosto non si vedeva: li' Arial Black esiste. */
const FORMATI = [
  { w: 845, h: 402, n: 'OnePlus 6 oriz' },
  { w: 915, h: 412, n: 'telefono grande oriz' },
  { w: 812, h: 375, n: 'telefono medio oriz' },
  { w: 740, h: 360, n: 'telefono corto oriz' },
  { w: 412, h: 915, n: 'telefono grande vert' },
  { w: 360, h: 640, n: 'telefono piccolo vert' },
  { w: 1440, h: 900, n: 'desktop' },
];

/* ===================================================================
   I DUE RIFERIMENTI, e perche' non sono zero.

   Ne' gli SBORDA ne' i PUNTINI perdono lettere in silenzio. Metterli a
   zero vorrebbe dire chiedere una riscrittura dell'impaginato per
   difetti che non si vedono o che sono voluti; ignorarli vorrebbe dire
   non accorgersi del giorno in cui diventano trenta. Percio' il conto
   e' fissato, si stampa, e si rettifica IN CHIARO con la data.

   RETTIFICA DEL 28 AGOSTO 2026, ORE 20 — e i numeri vecchi restano
   scritti, perche' la ragione per cui sono caduti vale piu' di loro.

   FINO A STAMATTINA qui c'era scritto: PUNTINI 2 (i due nomi lunghi
   della rosa a 740x360, «Bruno il Ragioniere» 154 px in 139 e «Memmo
   Zero Fiato» 147 in 139), SBORDA 8 (sette bottoni «SBLOCCA · N» in
   CAMPI che sporgono di 5-9 px, piu' «CONTRASTO» che ne sporge 13), e
   una riga che prometteva 4 tagli sul gioco spedito.

   OGGI, MISURATI SUL GIOCO SPEDITO (sette formati per ventuno
   schermate, schermate riempite dai loro build*UI):
     TAGLIATI 0   ·   PUNTINI 0   ·   SBORDA 0
   Non e' un miglioramento di impaginazione: e' che stamattina il gioco
   ha finalmente i suoi CARATTERI VERI. Per un mese i due woff2
   incorporati non contenevano una sola lettera A-Z e ogni parola usciva
   in ripiego di sistema; Barlow Condensed scrive «CALCETTO» in 339,3
   unita' dove il ripiego ne usava 520,4 (misurato oggi con
   strumenti/_q-carattere.js). Un terzo di larghezza in meno su ogni
   parola del gioco: tutto quello che traboccava e' rientrato.

   PERCHE' I RIFERIMENTI SCENDONO A ZERO, e non e' una formalita'. Un
   riferimento di 8 dove la realta' e' 0 e' OTTO DIFETTI DI CREDITO: il
   cancello resterebbe verde mentre otto nuove parole cominciano a
   sporgere. Un riferimento e' una fotografia della realta' di oggi, non
   una franchigia. Se domani una scelta di impaginato ne vuole indietro
   qualcuno — i nomi lunghi in una cella sono una scelta legittima — si
   rialza QUI, con la data e il conto, come e' stato fatto adesso.
   =================================================================== */
const PUNTINI_RIF = 0;
const SBORDA_RIF = 0;

/* ===================================================================
   IL MARCHIO — la banda, e da dove escono i due numeri.
   Misurati il 28 agosto 2026 sul gioco spedito, a 915x412:
     vuoto 8,0 unita'   ·   stiramento 1,000 (parola 515, naturale 515)
   VUOTO_MIN/MAX: -8 e +38. 38 e' meta' del diametro della O (76 unita'):
   oltre mezza O di vuoto la parola e il cerchio non si leggono piu' come
   una parola sola — il difetto vero sul OnePlus 6 ne aveva 99. Sotto
   -8 la parola entrerebbe DENTRO il cerchio.
   STIRA_MIN/MAX: 0,88 e 1,14. textLength puo' raddrizzare la geometria
   ma non la forma: un carattere steso del 14% si vede.
   =================================================================== */
const VUOTO_MIN = -8, VUOTO_MAX = 38;
const STIRA_MIN = 0.88, STIRA_MAX = 1.14;

const SONDA = `(() => {
  /* si guarda SOLO cio' che e' davvero a schermo */
  const visibile = el => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.02;
  };
  /* «contiene testo suo» = ha almeno un nodo di testo non vuoto fra i
     figli diretti. Senza questo filtro si misurerebbero i contenitori,
     che sporgono per mille ragioni che non sono parole tagliate. */
  const suoTesto = el => {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    return false;
  };
  const strada = el => {
    const p = [];
    for (let x = el; x && x !== document.body; x = x.parentElement) p.unshift(x.id ? '#' + x.id : (x.className && typeof x.className === 'string' ? '.' + x.className.trim().split(/\\s+/)[0] : x.tagName.toLowerCase()));
    return p.slice(-3).join(' ');
  };
  const fuori = [];
  for (const el of document.querySelectorAll('*')) {
    if (!suoTesto(el) || !visibile(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'inline') continue;             // clientWidth non significa niente
    const dx = el.scrollWidth - el.clientWidth;
    const dy = el.scrollHeight - el.clientHeight;
    if (dx <= 1 && dy <= 1) continue;
    /* chi ritaglia: il primo fra se' e i genitori con overflow diverso
       da visible. E' quello che decide se le lettere si perdono o no. */
    let taglia = null;
    for (let x = el; x && x !== document.documentElement; x = x.parentElement) {
      const c = getComputedStyle(x);
      if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { taglia = { el: x, ox: c.overflowX, oy: c.overflowY }; break; }
    }
    const tagliatoX = dx > 1 && taglia && taglia.ox !== 'visible';
    const tagliatoY = dy > 1 && taglia && taglia.oy !== 'visible';
    /* I PUNTINI SONO UNA DICHIARAZIONE. text-overflow:ellipsis dice al
       lettore che manca qualcosa: le lettere si perdono lo stesso, ma
       nessuno crede di aver letto tutto. E' la differenza fra un nome
       lungo in una cella e il nome del gioco scritto male. */
    const puntini = /ellipsis|fade/.test(cs.textOverflow) ||
      (taglia && taglia.el !== el && /ellipsis|fade/.test(getComputedStyle(taglia.el).textOverflow));
    fuori.push({
      via: strada(el),
      testo: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 46),
      dx, dy,
      w: el.clientWidth, sw: el.scrollWidth,
      ritaglio: taglia ? (taglia.el.id ? '#' + taglia.el.id : taglia.el.tagName.toLowerCase()) + ' ' + taglia.ox + '/' + taglia.oy : '-',
      tagliatoX, tagliatoY, puntini,
      /* uno che SCORRE per costruzione non e' un taglio: le lettere
         ci sono, basta trascinare. Si distingue e non fa rosso. */
      scorre: !!(taglia && /auto|scroll/.test(taglia.ox + taglia.oy)),
    });
  }
  return fuori;
})()`;

/* =====================================================================
   LA SONDA DEL MARCHIO. Vive a parte dalla sonda del DOM perche' misura
   una cosa diversa con strumenti diversi: unita' del disegno invece di
   pixel, avanzamento del testo invece di scrollWidth, e un elemento che
   nel DOM impaginato NON C'E' (sta in <defs>, largo zero).
   Torna null se il marchio non e' fatto cosi': un cancello che non trova
   il suo bersaglio lo dice, non finge di averlo assolto.
   ===================================================================== */
const SONDA_MARCHIO = `(() => {
  const testi = [...document.querySelectorAll('svg text')].filter(t => /CALCETT/i.test(t.textContent || ''));
  if (!testi.length) return null;
  const out = [];
  for (const t of testi) {
    /* il cerchio che fa da O: sta nello stesso gruppo del testo */
    const g = t.parentElement;
    const ce = g && g.querySelector('circle');
    if (!ce) continue;
    const dich = +t.getComputedTextLength().toFixed(1);
    /* LA LARGHEZZA NATURALE: si toglie textLength per un istante e si
       rimisura. Senza questo, textLength si autoconvalida. */
    const tl = t.getAttribute('textLength');
    if (tl) t.removeAttribute('textLength');
    const nat = +t.getComputedTextLength().toFixed(1);
    if (tl) t.setAttribute('textLength', tl);
    const cx = +ce.getAttribute('cx'), r = +ce.getAttribute('r');
    const sw = +(ce.getAttribute('stroke-width') || 0);
    const x = +t.getAttribute('x') || 0;
    out.push({
      parola: (t.textContent || '').trim(),
      dich, nat, textLength: tl, x,
      inizioO: +(cx - r - sw / 2).toFixed(1),
      vuoto: +((cx - r - sw / 2) - (x + dich)).toFixed(1),
      stira: nat > 0 ? +(dich / nat).toFixed(3) : 0,
      /* utile a chi legge: che carattere ha vinto la cascata */
      fam: getComputedStyle(t).fontFamily.split(',')[0].replace(/["']/g, ''),
    });
  }
  return out;
})()`;

/* =====================================================================
   I DUE GUASTI, e sono DUE apposta.

   Il controllo del marchio ha due meta' che si possono rompere una
   senza l'altra, e un guasto solo ne accenderebbe una sola — che e'
   esattamente il modo in cui in questa casa un controllo negativo ha
   gia' finto di dimostrare qualcosa. Quindi:

     --guasto stacco  (il difetto vero, e il difetto di default)
        Il woff2 non aveva le lettere, la cascata scendeva a Roboto (424
        unita' invece di 515) e la O restava indietro di 99. Su QUESTO
        banco quel guasto non si riproduce spegnendo il carattere: su
        Windows il ripiego e' Arial Black, che misura 515 esatte come
        Archivo Black, e il difetto sparisce da solo — ed e' precisamente
        la ragione per cui in Chromium nessuno l'ha mai visto. Allora si
        fa vincere alla cascata un carattere piu' stretto che il gioco ha
        gia' in casa (Barlow Condensed, 319,6 unita') e si toglie il
        textLength. Accende IL VUOTO, e lascia lo stiramento a 1,000.

     --guasto steso
        Stesso carattere stretto ma il textLength RESTA. La geometria
        torna perfetta — vuoto 8, il primo controllo non fiata — e i
        glifi vengono stesi del 61% per arrivare a 515. E' il caso in cui
        il marchio «e' al suo posto» ed e' deformato. Accende LO
        STIRAMENTO, e lascia il vuoto in banda.

   Numeri visti il 28 agosto 2026 (915x412, gioco spedito): stacco ->
   vuoto 203,4 e 193,4, stiramento 1,000; steso -> vuoto 8 e -2,
   stiramento 1,611. Ogni meta' del cancello ha il suo rosso.
   ===================================================================== */
const guasto = (() => {
  const i = process.argv.indexOf('--guasto');
  if (i < 0) return '';
  const v = process.argv[i + 1];
  return (v && !v.startsWith('--')) ? v : 'stacco';
})();
const GUASTO = tieni => `(() => {
  let n = 0;
  for (const t of document.querySelectorAll('svg text')) {
    if (!/CALCETT/i.test(t.textContent || '')) continue;
    if (!${tieni}) { t.removeAttribute('textLength'); t.removeAttribute('lengthAdjust'); }
    t.setAttribute('font-family', "'Barlow Condensed',sans-serif");
    n++;
  }
  return n;
})()`;

(async () => {
  const srv = await servi();
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('BANCO ESPLOSO: Chromium non parte — ' + e.message); srv.chiudi(); process.exit(2); }

  const soloFormato = arg('formato', '');
  const formati = soloFormato ? FORMATI.filter(f => `${f.w}x${f.h}` === soloFormato) : FORMATI;
  if (!formati.length) { console.error('PROVA NULLA: formato sconosciuto ' + soloFormato); await br.close(); srv.chiudi(); process.exit(3); }

  const tagli = [], sborda = [], puntini = [];
  let schermateViste = 0;
  let marchio = null;                 // misurato una volta sola: sono unita' del disegno, non pixel

  for (const f of formati) {
    const pg = await br.newPage({ viewport: { width: f.w, height: f.h } });
    const errori = [];
    pg.on('pageerror', e => errori.push(e.message));
    await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load' });
    await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    /* I CARATTERI PRIMA DI TUTTO. Misurare la larghezza di una parola
       mentre il woff2 sta ancora scendendo vuol dire misurare il ripiego
       e chiamarlo il carattere del gioco. */
    await pg.evaluate(() => document.fonts.ready);
    if (guasto) {
      if (!['stacco', 'steso'].includes(guasto)) {
        console.error('PROVA NULLA: guasto sconosciuto «' + guasto + '». Sono: stacco, steso.');
        await br.close(); srv.chiudi(); process.exit(3);
      }
      const n = await pg.evaluate(GUASTO(guasto === 'steso'));
      if (!n) { console.error('PROVA NULLA: il guasto «' + guasto + '» non ha trovato niente da rompere.'); await br.close(); srv.chiudi(); process.exit(3); }
      if (f === formati[0]) console.log(`  (GUASTO «${guasto}» iniettato su ${n} <text> del marchio: questo referto DEVE essere rosso)`);
    }
    await pg.evaluate(() => window.__test.dismissSplash());
    await pg.waitForTimeout(500);
    if (!marchio) marchio = await pg.evaluate(SONDA_MARCHIO);

    /* ============ LE SCHERMATE SI RIEMPIONO PRIMA DI MISURARLE ========
       Meta' del gioco non ha testo nel sorgente: rosa, trofei,
       statistiche, campi, negozio, torneo e stagione li scrive un
       build*UI() al momento in cui si apre la schermata. Aprendole con
       goScreen e basta si misuravano SCATOLE VUOTE — quattro elementi
       di testo in ROSA invece di trenta — cioe' si dichiarava verde una
       cosa mai guardata. Qui si chiamano tutti i costruttori, uno per
       uno e ognuno nel suo try: quelli che hanno bisogno di una
       stagione o di un torneo in corso possono rifiutarsi, e il conto
       di quanti hanno risposto si stampa invece di sparire. */
    const riempiti = await pg.evaluate(() => {
      const nomi = ['buildRosaUI', 'buildStagioneUI', 'buildTorneoUI', 'buildCampiUI', 'buildNegozioUI',
        'buildKitGrid', 'buildTrofeiUI', 'buildStatsUI', 'refreshImpostUI', 'montaEroi', 'montaCoppe'];
      const ok = [], no = [];
      for (const n of nomi) {
        try { if (typeof window[n] === 'function') { window[n](); ok.push(n); } else no.push(n + ' (assente)'); }
        catch (e) { no.push(n + ' (' + String(e.message).slice(0, 40) + ')'); }
      }
      return { ok: ok.length, no };
    });
    if (riempiti.no.length) console.log(`  (${f.w}x${f.h}: ${riempiti.ok} schermate riempite, non riuscite: ${riempiti.no.join(', ')})`);

    /* l'elenco delle schermate lo da' la pagina, non questo file: se
       domani ne nasce una, entra da sola nel giro */
    const schermi = await pg.evaluate(() => [...document.querySelectorAll('.ov')].map(e => e.id).filter(Boolean));
    if (!schermi.length) { console.error('BANCO MUTO: nessuna schermata trovata.'); await br.close(); srv.chiudi(); process.exit(2); }

    for (const id of schermi) {
      const ok = await pg.evaluate(i => {
        const el = document.getElementById(i);
        if (!el) return false;
        if (typeof goScreen === 'function' && !el.classList.contains('trasp')) { goScreen(el); }
        else { document.querySelectorAll('.ov').forEach(o => o.classList.add('hidden')); el.classList.remove('hidden'); }
        return true;
      }, id);
      if (!ok) continue;
      /* si aspetta l'impaginazione vera: il tabellone si ridipinge in un
         requestAnimationFrame dopo goScreen, e misurare prima vuol dire
         misurare un riquadro largo zero */
      await pg.waitForTimeout(180);
      const trovati = await pg.evaluate(SONDA);
      schermateViste++;
      for (const t of trovati) {
        const riga = { ...t, formato: `${f.w}x${f.h}`, schermo: id };
        if (t.tagliatoX && !t.scorre) (t.puntini ? puntini : tagli).push(riga);
        else if (t.dx > 1) sborda.push(riga);
      }
    }
    if (errori.length) console.log(`  (${f.w}x${f.h}: ${errori.length} errori di pagina, il primo: ${errori[0].slice(0, 90)})`);
    await pg.close();
  }
  await br.close(); srv.chiudi();

  console.log(`\n=== TESTO FUORI DAL CONTENITORE — ${formati.length} formati x ${Math.round(schermateViste / formati.length)} schermate ===\n`);

  if (tagli.length) {
    console.log('  TAGLIATI — sporge, viene ritagliato, e NIENTE lo dice: lettere perdute in silenzio');
    for (const t of tagli) {
      console.log(`   X ${t.formato.padEnd(9)} ${t.schermo.padEnd(13)} ${t.via.padEnd(34)} ${String(t.sw).padStart(5)}/${String(t.w).padEnd(5)} (+${t.dx})  ritaglia ${t.ritaglio}`);
      console.log(`       «${t.testo}»`);
    }
  } else {
    console.log('  TAGLIATI: nessuno.');
  }

  /* lo stesso elemento su sette formati e' UN difetto, non sette */
  const raggruppa = elenco => {
    const g = new Map();
    for (const s of elenco) {
      const k = s.schermo + '|' + s.via + '|' + s.testo;
      if (!g.has(k)) g.set(k, { ...s, formati: [] });
      g.get(k).formati.push(s.formato);
    }
    return g;
  };
  const stampa = (titolo, gruppi, rif) => {
    const peggio = gruppi.size > rif;
    console.log(`\n  ${titolo}: ${gruppi.size} elementi distinti, riferimento ${rif}${peggio ? '   PEGGIORATO' : ''}`);
    if (haFlag('tutto') || peggio) {
      for (const g of gruppi.values()) {
        console.log(`     · ${g.schermo.padEnd(13)} ${g.via.padEnd(34)} +${String(g.dx).padStart(4)} px  su ${g.formati.length} formati (${g.formati[0]}...)`);
        console.log(`       «${g.testo}»`);
      }
    }
    return peggio;
  };
  const gp = raggruppa(puntini), gs = raggruppa(sborda);
  const pPeggio = stampa('PUNTINI (ritagliato ma con text-overflow:ellipsis, cioe\' dichiarato)', gp, PUNTINI_RIF);
  const sPeggio = stampa('SBORDA  (sporge ma nessuno lo ritaglia: si legge lo stesso)', gs, SBORDA_RIF);

  /* ================= IL MARCHIO, misurato e non guardato ================
     Se il marchio non c'e' piu' nella forma <text>+<circle> il cancello
     NON assolve: dichiara di non avere misurato ed esce 3 (prova nulla).
     Un cancello che non trova il bersaglio e stampa verde e' il modo in
     cui questa riga e' rimasta finta per un giorno intero. */
  let marchioRosso = 0;
  console.log('\n  MARCHIO  (il <text> in <defs> e la O che e\' un <circle>: qui scrollWidth vale zero)');
  if (!marchio || !marchio.length) {
    console.log('     PROVA NULLA: nessun <text> con «CALCETT» accanto a un <circle>. Non misuro, e non assolvo.');
    process.exit(3);   // browser e server sono gia' chiusi qui sopra
  }
  for (const m of marchio) {
    const vOk = m.vuoto >= VUOTO_MIN && m.vuoto <= VUOTO_MAX;
    const sOk = m.stira >= STIRA_MIN && m.stira <= STIRA_MAX;
    if (!vOk || !sOk) marchioRosso++;
    console.log(`     ${vOk && sOk ? 'ok' : ' X'}  «${m.parola}» larga ${m.dich} (naturale ${m.nat}${m.textLength ? ', textLength ' + m.textLength : ', senza textLength'})` +
                `, la O comincia a ${m.inizioO}`);
    console.log(`         vuoto ${m.vuoto} unita' (banda ${VUOTO_MIN}..${VUOTO_MAX})${vOk ? '' : '   <- LA O SI STACCA: si legge «' + m.parola + '» e un pallino a parte'}`);
    console.log(`         stiramento ${m.stira.toFixed(3)} (banda ${STIRA_MIN}..${STIRA_MAX})${sOk ? '' : '   <- i glifi sono stesi da textLength: la geometria torna, la forma no'}`);
    console.log(`         carattere che ha vinto la cascata: ${m.fam}`);
  }

  if (!tagli.length && !pPeggio && !sPeggio && !marchioRosso) {
    console.log('\nVERDE: nessun testo tagliato in silenzio, il marchio sta insieme, e i due riferimenti non sono peggiorati.\n');
    process.exit(0);
  }
  const perche = [];
  if (tagli.length) perche.push(`${tagli.length} testi tagliati senza avviso`);
  if (marchioRosso) perche.push(`il marchio si sfascia in ${marchioRosso} punti su ${marchio.length}`);
  if (pPeggio) perche.push(`i troncamenti coi puntini sono ${gp.size} contro ${PUNTINI_RIF}`);
  if (sPeggio) perche.push(`gli sborda sono ${gs.size} contro ${SBORDA_RIF}`);
  console.log(`\nROSSO: ${perche.join(', ')}.\n`);
  process.exit(1);
})();
