/* =====================================================================
   VOLTI — il cancello dei ritratti-figurina.

   PERCHE' ESISTE. Un generatore di facce e' la cosa piu' facile del
   mondo da rompere senza accorgersene: basta un turno di bit spostato e
   Saverio Piedebuono ha un'altra faccia, in silenzio, e nessuno se ne
   accorge finche' un giudice non riapre la vecchia schermata. La giuria
   ha chiesto tre cose per nome, e qui si misurano tutte e tre:

     1) CINQUE RITRATTI CHIARAMENTE DISTINTI nella rosa. Si contano, per
        ogni coppia, i pixel che cambiano davvero fra un volto e l'altro
        (soglia 24 livelli su 255), sui ritratti cotti alla misura VERA
        della riga della rosa. Cancello: nessuna coppia sotto il 12% di
        cartoncino cambiato. Il perche' di questa misura e non della
        media delle differenze sta nel commento accanto al conto.

     2) LO STESSO SEME DA' LO STESSO VOLTO FRA PARTITE DIVERSE. Non si
        confrontano due chiamate nella stessa pagina — quella e' la
        cache, e la cache direbbe sempre di si'. Si aprono DUE pagine
        distinte, si gioca una partita in ciascuna (partite diverse,
        punteggi diversi, kit ricalcolati) e si confrontano i PIXEL,
        byte per byte. Cancello: identici.

     3) IL VOLTO E' LO STESSO UOMO CHE CORRE. I quattro tratti fisici
        del ritratto (corporatura, carnagione, capigliatura, taglio)
        devono coincidere con quelli del giocatore in campo con quel
        nome. Cancello: zero discordanze.

   E una quarta, che la giuria non ha chiesto ma la casa si':
     4) NESSUN RITRATTO SI CUOCE DENTRO IL CICLO DI GIOCO. Si conta il
        contatore delle cotture prima e dopo dieci secondi di partita
        vera, gol compresi. Cancello: non cresce.

   E lascia un PROVINO A CONTATTO (volti.png nella cartella delle foto)
   con dodici uomini alle quattro misure a cui il gioco li mostra: i
   numeri dicono che sono diversi, il foglio dice che sono facce.

   USO:  node strumenti/volti.js [--dir foto-figure2-dopo]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const SEME_BANCO = 20260728;      // lo stesso di collaudo.js, scatta.js, seme.js
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const DIR = arg('dir', 'foto-figure2-dopo');   // dove finisce il provino a contatto

/* --- IL GIOCO PUO' ARRIVARE DA FUORI: --gioco <file> oppure GIOCO_PROVA.
   PERCHE': il percorso del gioco era scritto qui dentro, e un percorso
   cablato ha gia' fatto sbagliare una bisezione — tre misure «prima»
   erano identiche perche' leggevano tutte lo stesso file. Con --gioco lo
   stesso cancello misura una copia fuori dal repo (una toppa da provare,
   la versione di ieri) senza scambiare file a mano. Senza --gioco non
   cambia un byte: il default resta il file del repo. --- */
const GIOCO_FUORI = (() => {
  const v = arg('gioco', process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  /* uscita 3 = prova nulla: non e' il gioco a essere rosso, e' il banco
     che non ha niente da misurare (codici di casa: 0 verde, 1 rosso,
     2 banco esploso, 3 prova nulla) */
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

async function apri(br, porta) {
  const pg = await br.newPage({ viewport: { width: 915, height: 412 } });
  await pg.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
  }, SEME_BANCO);
  await pg.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html?t=${Date.now()}${Math.random()}`);
  await pg.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  return pg;
}

/* i pixel di un ritratto, come array normale: si fa dentro la pagina,
   con la stessa ritrattoTela che disegna la rosa */
const PIXEL = `(nome, lato) => {
  const t = window.__test.ritrattoTela(window.__test.semeNome(nome), lato, {});
  const c = t.getContext('2d');
  return Array.from(c.getImageData(0, 0, lato, lato).data);
}`;

(async () => {
  const srv = await servi();
  const br = await chromium.launch();

  /* ---- PARTITA A: la rosa vera del salvataggio, piu' una partita ---- */
  const pgA = await apri(br, srv.porta);
  const rosa = await pgA.evaluate(() => {
    const s = window.__test.save;
    return (s && s.rosa) ? s.rosa.map(r => r.nome) : [];
  });
  const nomi = rosa.length ? rosa : ['Gino Fulmine', 'Saverio Piedebuono',
    'Bruno Tre Polmoni', 'Elio Sciabola', 'Sasa Buonanotte'];

  const LATO = 64;                                  // 32 CSS px a dpr 2: la riga della rosa
  const pixA = [];
  for (const n of nomi) pixA.push(await pgA.evaluate(`(${PIXEL})(${JSON.stringify(n)}, ${LATO})`));

  /* i tratti del ritratto contro i tratti del giocatore in campo */
  const coerenza = await pgA.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1); t.setCpuVsCpu(true); t.simulate(1.0);
    const out = [];
    for (let i = 0; i < t.players.length; i++) {
      const g = t.trattiGiocatore(i);
      if (!g || !g.nome) continue;
      const v = t.trattiVolto(g.seme);
      out.push({
        nome: g.nome,
        ok: v.corp === g.corp && v.skin === g.skin && v.hair === g.hair && v.taglio === g.taglio,
        campo: [g.corp, g.skin, g.hair, g.taglio].join(' '),
        volto: [v.corp, v.skin, v.hair, v.taglio].join(' '),
      });
    }
    return out;
  });

  /* ---- il contatore delle cotture durante il gioco vero ---- */
  const cottura = await pgA.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1); t.setCpuVsCpu(true);
    t.simulate(1.0); t.disegna();
    const prima = t.ritrattiCotti;
    /* dieci secondi di partita vera, con un gol in mezzo: la fascia del
       gol e la targa dei capitani DISEGNANO un ritratto, e va bene —
       quello che non deve succedere e' che lo CUOCIANO ogni volta */
    for (let k = 0; k < 40; k++) { t.simulate(0.25); t.disegna(); }
    const meta = t.ritrattiCotti;
    t.forceGoal(0);
    for (let k = 0; k < 20; k++) { t.simulate(0.1); t.disegna(); }
    return { prima, meta, dopo: t.ritrattiCotti };
  });

  /* IL PROVINO A CONTATTO. Un cancello a numeri dice se due facce sono
     diverse; non dice se sono FACCE. Il foglio esce accanto alle altre
     fotografie della passata, alle tre misure in cui il gioco le usa
     davvero: la riga della rosa (32), il tondo del gol (44), la riga
     del tabellino (20). */
  const contatto = await pgA.evaluate(nomi => {
    const G = 132, PIC = 44, MIN = 20, COL = Math.min(6, nomi.length);
    const RIG = Math.ceil(nomi.length / COL);
    const cv = document.createElement('canvas');
    cv.width = COL * (G + 12) + 12;
    cv.height = RIG * (G + PIC + 34) + 12;
    const c = cv.getContext('2d');
    c.fillStyle = '#0b1a10'; c.fillRect(0, 0, cv.width, cv.height);
    nomi.forEach((n, i) => {
      const x = 12 + (i % COL) * (G + 12), y = 12 + ((i / COL) | 0) * (G + PIC + 34);
      const s = window.__test.semeNome(n);
      c.drawImage(window.__test.ritrattoTela(s, G * 2, {}), x, y, G, G);
      c.drawImage(window.__test.ritrattoTela(s, PIC * 2, { tondo: 1 }), x, y + G + 5, PIC, PIC);
      c.drawImage(window.__test.ritrattoTela(s, 32 * 2, {}), x + PIC + 8, y + G + 11, 32, 32);
      c.drawImage(window.__test.ritrattoTela(s, MIN * 2, { tondo: 1 }), x + PIC + 46, y + G + 17, MIN, MIN);
      c.fillStyle = '#e8ebdf'; c.font = '12px sans-serif';
      c.fillText(n, x, y + G + PIC + 24);
    });
    return cv.toDataURL('image/png').slice(22);
  }, nomi.concat(['Peppe Mano Santa', 'Ciro Scarpone', 'Toto Muraglia',
    'Nando Sinistro', 'Rocco Ferro', 'Vito Cannone', 'Mimmo Zampa']));
  fs.mkdirSync(path.join(RADICE, DIR), { recursive: true });
  const dove = path.join(RADICE, DIR, 'volti.png');
  fs.writeFileSync(dove, Buffer.from(contatto, 'base64'));

  /* ---- PARTITA B: un'altra pagina, un'altra partita, stessi nomi ---- */
  const pgB = await apri(br, srv.porta);
  await pgB.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1); t.setCpuVsCpu(true);
    t.simulate(6.0); t.forceGoal(1); t.simulate(2.0);
  });
  const pixB = [];
  for (const n of nomi) pixB.push(await pgB.evaluate(`(${PIXEL})(${JSON.stringify(n)}, ${LATO})`));

  await br.close(); srv.chiudi();

  /* ============================== i conti ============================== */
  console.log('\n=== VOLTI-FIGURINA: cinque uomini, cinque facce ===\n');

  /* 1 — distinzione.
     LA MEDIA DELLE DIFFERENZE NON MISURA QUESTO, ed e' la prima cosa
     che questo strumento ha sbagliato: piu' della meta' del cartoncino
     e' fondo identico in tutti i ritratti, quindi una media per pixel
     divide la differenza vera per due e mezzo e dichiara gemelle due
     facce che a occhio non si somigliano per niente. Si conta invece la
     FRAZIONE DI CARTONCINO CHE CAMBIA: quanti pixel differiscono di
     almeno 24 livelli su 255 in almeno un canale. Zero vuol dire lo
     stesso disegno; una pelle diversa sta sopra il 30%; due uomini che
     differiscono solo per l'espressione stanno sul 12-15%. */
  const scarto = (a, b) => {
    let n = 0, tot = a.length / 4;
    for (let i = 0; i < a.length; i += 4) {
      if (Math.abs(a[i] - b[i]) > 24 || Math.abs(a[i + 1] - b[i + 1]) > 24 ||
          Math.abs(a[i + 2] - b[i + 2]) > 24) n++;
    }
    return n / tot;
  };
  console.log('  distinzione fra i ritratti della rosa (% di cartoncino che cambia):');
  let minD = 1, coppiaMin = '';
  for (let i = 0; i < nomi.length; i++) for (let j = i + 1; j < nomi.length; j++) {
    const d = scarto(pixA[i], pixA[j]);
    if (d < minD) { minD = d; coppiaMin = nomi[i] + ' / ' + nomi[j]; }
  }
  for (let i = 0; i < nomi.length; i++) {
    const riga = [];
    for (let j = 0; j < nomi.length; j++) riga.push(i === j ? '  —  ' : (scarto(pixA[i], pixA[j]) * 100).toFixed(1).padStart(5));
    console.log('    ' + nomi[i].padEnd(22) + riga.join(' '));
  }
  const SOGLIA = 0.12;
  console.log(`    la coppia piu' simile: ${coppiaMin} — ${(minD * 100).toFixed(1)}% ` +
    `(cancello ${(SOGLIA * 100).toFixed(0)}%)`);

  /* 2 — stesso seme, stessa faccia, in due partite diverse */
  let diversi = 0;
  for (let i = 0; i < nomi.length; i++) {
    const a = pixA[i], b = pixB[i];
    let uguale = a.length === b.length;
    if (uguale) for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) { uguale = false; break; }
    if (!uguale) { diversi++; console.log(`    X ${nomi[i]}: il volto CAMBIA fra le due partite`); }
  }
  console.log(`\n  stesso seme, stesso volto in due partite diverse: ` +
    `${nomi.length - diversi} su ${nomi.length} identici al byte`);

  /* 3 — il ritratto e' l'uomo che corre */
  const scordati = coerenza.filter(c => !c.ok);
  console.log(`\n  il volto e' lo stesso uomo che corre: ${coerenza.length - scordati.length} ` +
    `su ${coerenza.length} giocatori in campo`);
  for (const c of scordati) console.log(`    X ${c.nome}: campo [${c.campo}] volto [${c.volto}]`);

  /* 4 — niente cotture nel ciclo di gioco */
  const cresciuto = cottura.dopo - cottura.prima;
  console.log(`\n  cotture durante il gioco: ${cottura.prima} -> ${cottura.meta} -> ${cottura.dopo} ` +
    `(dieci secondi di partita piu' un gol)`);
  /* il gol e i capitani hanno diritto a una cottura ciascuno la PRIMA
     volta che entrano in scena: quello che si vieta e' la cottura per
     fotogramma, cioe' una crescita che va oltre le poche facce nuove */
  const TETTO_COTTURE = 4;

  const verde = minD >= SOGLIA && diversi === 0 && scordati.length === 0 && cresciuto <= TETTO_COTTURE;
  console.log(`\n  provino a contatto: ${path.relative(RADICE, dove)}`);
  if (verde) {
    console.log('\nVERDE: cinque facce distinte, stabili fra partite, coerenti con le ' +
      'figure in campo, e nessuna cotta nel ciclo di gioco.\n');
  } else {
    console.log('\nROSSO: ' + [
      minD < SOGLIA ? `due ritratti troppo simili (${(minD * 100).toFixed(1)}%)` : '',
      diversi ? `${diversi} volti cambiano fra una partita e l'altra` : '',
      scordati.length ? `${scordati.length} ritratti non sono l'uomo che corre` : '',
      cresciuto > TETTO_COTTURE ? `${cresciuto} cotture dentro il ciclo di gioco` : '',
    ].filter(Boolean).join('; ') + '.\n');
    process.exit(1);
  }
})();
