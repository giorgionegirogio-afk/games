/* =====================================================================
   _q-carattere.js — IL GIOCO SCRIVE NEL SUO CARATTERE, O NEL RIPIEGO?

   PERCHE' ESISTE. Per un mese CALCETTO ha portato due caratteri
   incorporati che non contenevano una sola lettera dell'alfabeto — i
   sottoinsiemi sbagliati, latin-ext e vietnamita — e ha scritto tutto in
   ripiego di sistema senza che nessuno se ne accorgesse. Venti cancelli
   giravano in Chromium su Windows, dove il ripiego (Arial Black)
   somiglia abbastanza al vero da non far sospettare niente.

   Un @font-face che si carica NON dice niente: si carica anche se dentro
   non c'e' la lettera che serve. La sola domanda che conta e':

     quando scrivo «A», il glifo che compare viene dal MIO carattere?

   e si risponde in un modo solo — misurando la LARGHEZZA di una parola
   nel carattere dichiarato e confrontandola con la stessa parola nei
   ripieghi. Se coincide con un ripiego, il carattere non c'e'.

   uso:  node strumenti/_q-carattere.js --gioco fuori/car.html
   esce 0 se il gioco scrive nel suo carattere, 1 se no, 2 se esplode.
   IL ROSSO SI DIMOSTRA con un file: strumenti/_t-guasto-car.js scrive
   una copia in cui il marchio ha il carattere condensato al posto di
   Archivo Black, e questo cancello la vede rossa (misurato il 28 agosto
   2026: stiramento 1,611 contro una banda 0,88..1,14).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');

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

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  const browser = await chromium.launch();
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => document.fonts.ready);

  console.log('=== IL GIOCO SCRIVE NEL SUO CARATTERE? ===\n');

  const m = await pag.evaluate(() => {
    /* la larghezza di una parola in un carattere dato, misurata su un
       canvas fuori schermo: e' il modo piu' diretto e non dipende dalla
       disposizione della pagina */
    const c = document.createElement('canvas').getContext('2d');
    const largo = (fam, peso, testo) => { c.font = (peso || 400) + ' 100px ' + fam; return +c.measureText(testo).width.toFixed(2); };
    const PAROLA = 'CALCETTO';
    const ACCENTI = 'MENTALITÀ DIFFICOLTÀ PIÙ È';
    return {
      /* i tre caratteri del gioco */
      archivo:   largo("'Archivo Black'", 400, PAROLA),
      barlow4:   largo("'Barlow Condensed'", 400, PAROLA),
      barlow7:   largo("'Barlow Condensed'", 700, PAROLA),
      /* i ripieghi con cui si confrontano */
      serif:     largo('serif', 400, PAROLA),
      sans:      largo('sans-serif', 400, PAROLA),
      arialBlack:largo("'Arial Black'", 400, PAROLA),
      /* le accentate: se il sottoinsieme non le ha, cadono nel ripiego
         una per una e la parola esce mezza in un carattere e mezza in un
         altro — si vede, e qui si misura */
      accArchivo: largo("'Archivo Black'", 400, ACCENTI),
      accSerif:   largo('serif', 400, ACCENTI),
      accBarlow:  largo("'Barlow Condensed'", 400, ACCENTI),
      /* e quel che il browser dichiara di avere caricato */
      caricati: [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status),
      pronte: document.fonts.status,
      checkA: document.fonts.check("100px 'Archivo Black'"),
      checkB: document.fonts.check("100px 'Barlow Condensed'"),
      checkB7: document.fonts.check("700 100px 'Barlow Condensed'"),
    };
  });

  console.log('  --   caratteri dichiarati: ' + m.caricati.join(' · '));
  console.log('  --   «CALCETTO» a 100px:  Archivo ' + m.archivo + '   Barlow400 ' + m.barlow4 +
              '   Barlow700 ' + m.barlow7 + '   |ripieghi| serif ' + m.serif + '  sans ' + m.sans + '\n');

  di(m.pronte === 'loaded', 'i caratteri finiscono di caricarsi', m.pronte);
  di(m.checkA && m.checkB && m.checkB7, 'il browser dichiara di avere i tre caratteri',
     'archivo ' + m.checkA + ', barlow ' + m.checkB + ', barlow700 ' + m.checkB7);

  /* =====================================================================
     LA PROVA CHE CONTA, e le altre non la sostituiscono.
     Se il carattere non ha le lettere, il browser lo carica lo stesso,
     `check` dice true lo stesso, e per ogni lettera scende al ripiego:
     la larghezza misurata diventa quella del ripiego, cifra per cifra.
     E' cosi' che il difetto e' vissuto un mese in mezzo a venti banchi.
     ===================================================================== */
  di(Math.abs(m.archivo - m.serif) > 1,
     'ARCHIVO BLACK scrive coi suoi glifi, non col ripiego',
     m.archivo + ' contro serif ' + m.serif + (Math.abs(m.archivo - m.serif) <= 1 ? '  <- IDENTICO: e\' il ripiego' : ''));
  di(Math.abs(m.barlow4 - m.serif) > 1 && Math.abs(m.barlow4 - m.sans) > 1,
     'BARLOW CONDENSED scrive coi suoi glifi',
     m.barlow4 + ' contro serif ' + m.serif + ', sans ' + m.sans);
  di(Math.abs(m.barlow7 - m.barlow4) > 1,
     'il GRASSETTO e\' un taglio diverso dal tondo, non lo stesso ingrassato',
     'tondo ' + m.barlow4 + ', grassetto ' + m.barlow7);

  /* le accentate: il gioco e' in italiano */
  di(Math.abs(m.accArchivo - m.accSerif) > 1,
     'le lettere accentate escono dal carattere del gioco, non dal ripiego',
     m.accArchivo + ' contro serif ' + m.accSerif);
  di(Math.abs(m.accBarlow - m.accSerif) > 1,
     'e lo stesso vale per il condensato', m.accBarlow + ' contro ' + m.accSerif);

  /* =====================================================================
     E IL MARCHIO: la parola dev'essere larga quanto la geometria si
     aspetta, se no la O si stacca (e' il difetto da cui e' partito tutto).

     RETTIFICA DEL 28 AGOSTO 2026, ORE 20 — e riguarda proprio la riga
     scritta qui sotto per prima. Fino a stasera questa prova misurava
     getComputedTextLength() e basta. Ma il marchio porta
     textLength="515", che OBBLIGA il browser a stendere i glifi su 515
     unita' qualunque cosa dica il carattere: la larghezza misurata era
     sempre quella dichiarata, il vuoto era sempre 8, e IL CONTROLLO NON
     POTEVA CADERE. Si autoconvalidava — il referto lo diceva pure, e
     nessuno l'ha letto: «vuoto 8 unita' (la parola misura 515,
     dichiarata 515)».
     Adesso si misura anche la larghezza NATURALE, togliendo textLength
     per un istante, e si controlla lo STIRAMENTO. Con la geometria a
     posto e un carattere condensato al posto di Archivo Black, il vuoto
     resta 8 e lo stiramento va a 1,611: il primo controllo tace, il
     secondo parla. Le due bande, misurate oggi sul gioco spedito
     (vuoto 8,0 · stiramento 1,000), sono le stesse di
     strumenti/testo-fuori.js, che ha imparato la stessa lezione lo
     stesso giorno: -8..38 per il vuoto (38 e' meta' diametro della O) e
     0,88..1,14 per lo stiramento.
     ===================================================================== */
  const marchio = await pag.evaluate(() => {
    const t = [...document.querySelectorAll('svg text')].filter(e => /CALCETT/i.test(e.textContent || ''))[0];
    if (!t) return null;
    const cerchio = t.closest('svg') && t.closest('svg').querySelector('circle');
    const largo = +t.getComputedTextLength().toFixed(1);
    const tl = t.getAttribute('textLength');
    if (tl) t.removeAttribute('textLength');
    const naturale = +t.getComputedTextLength().toFixed(1);
    if (tl) t.setAttribute('textLength', tl);
    return {
      largo, naturale,
      dichiarato: tl,
      cx: cerchio ? +cerchio.getAttribute('cx') : null,
      r: cerchio ? +cerchio.getAttribute('r') : null,
      sw: cerchio ? +cerchio.getAttribute('stroke-width') : null,
      x: +t.getAttribute('x') || 0,
    };
  });
  if (!marchio) console.log('  --   il marchio non e\' un <text> in <svg>: la prova del vuoto non si applica');
  else {
    const inizioO = marchio.cx - marchio.r - marchio.sw / 2;
    const vuoto = +(inizioO - (marchio.x + marchio.largo)).toFixed(1);
    const stira = marchio.naturale > 0 ? +(marchio.largo / marchio.naturale).toFixed(3) : 0;
    di(vuoto >= -8 && vuoto <= 38,
       'la O del marchio non si stacca dalla parola',
       'vuoto ' + vuoto + ' unita\' (la parola occupa ' + marchio.largo +
       (marchio.dichiarato ? ', dichiarata ' + marchio.dichiarato : '') + ')');
    di(stira >= 0.88 && stira <= 1.14,
       'e i glifi non sono STESI da textLength per arrivarci',
       'stiramento ' + stira.toFixed(3) + ' (occupa ' + marchio.largo +
       ', ne vorrebbe ' + marchio.naturale + ')' +
       (stira > 1.14 ? '  <- il carattere che scrive il marchio non e\' quello previsto' : ''));
  }

  await browser.close(); srv.chiudi();
  if (errori.length) { console.error('\nECCEZIONI: ' + errori.slice(0, 3).join(' | ')); process.exit(2); }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  if (rossi) {
    console.log('\nUn carattere che si carica non e\' un carattere che scrive: se dentro non');
    console.log('ci sono le lettere, il browser scende al ripiego una lettera alla volta e');
    console.log('nessun controllo di forma se ne accorge. Si guarda la LARGHEZZA.');
  }
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + e.message); process.exit(2); });
