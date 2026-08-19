/* =====================================================================
   _z-provino.js — IL FOGLIO CONTATTI DEL PROVINO CIECO.

   Venti celle, nessuna etichetta, nessuna chiave dentro l'immagine.
   Dieci vengono dal gioco NUOVO e dieci dal TESTIMONE (il gioco di
   oggi), sulle STESSE dieci coppie (fase, imbardata): cosi' fra i due
   gruppi cambia una cosa sola, la posa. Divisa, fondale, scala,
   ingrandimento e ritaglio sono identici — se differissero, la giuria
   potrebbe raggruppare le celle senza guardare il gesto.

   LA SCALA E' QUELLA VERA. La figura si disegna con la stessa
   Rig3D.disegna della partita, all'altezza in PIXEL DI PERIFERICA che
   _z-verbo ha misurato in campo sui fotogrammi di questa clip
   (mediana 92,7 px su telefono 915x412 con deviceScaleFactor 2). Poi la
   CELLA — non la figura — si ingrandisce di --zoom con l'interpolazione
   accesa: e' avvicinare l'occhio al telefono, non ridisegnare piu'
   grande. Nessun pixel di informazione entra o esce.

   COSA NON C'E', e perche'. L'OMBRA PORTATA: in partita la disegna
   drawOmbreGiocatori, non il rig (che infatti riceve senzaOmbra=true).
   Qui non c'e' perche' su questo progetto e' gia' stato misurato che
   l'ombra ha ZERO pixel sopra 3:1 di contrasto contro l'erba, cioe' non
   porta verbo; disegnarla aggiungerebbe una macchia identica in tutte
   e venti le celle. Chi non fosse d'accordo la rimetta e rifaccia il
   foglio: il resto dello strumento non cambia.

   uso:
     node strumenti/_z-provino.js --nuovo fuori/dopo.html \
          --testimone CALCETTO-il-gioco.html --out _pose-tuffo.png
     ... --zoom 3 --seme 7
   La chiave (quale cella e' quale) va su stdout, MAI nell'immagine.
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
const NUOVO = path.resolve(arg('nuovo', ''));
const TEST = path.resolve(arg('testimone', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const OUT = path.resolve(arg('out', path.join(RADICE, '_pose-tuffo.png')));
const ZOOM = +arg('zoom', 3);
const SEME = +arg('seme', 20260818);
const HDEV = +arg('hdev', 92.7);     // la mediana misurata in campo
const CELLA = +arg('cella', 168);    // lato della cella in pixel di periferica

/* LE DIECI POSE, prese dove stanno i fotogrammi veri. rigStato mappa
   l'avanzamento del tuffo su u = 0,08 + 0,50·e (riga 24088 del gioco),
   quindi la finestra e' 0,08-0,58. Le imbardate seguono l'istogramma
   misurato su 4.276 fotogrammi: 41,6% a 180 gradi, 12,2% a 0, 6,5% a
   195, 6,7% a 15, 5,2% a 165 — piu' UNA cella a 90 gradi, che e' il 3,4%
   dei casi e sarebbe scorretto non rappresentare. */
const POSE = [
  { u: 0.20, yaw: 180 }, { u: 0.24, yaw: 0 }, { u: 0.28, yaw: 195 },
  { u: 0.32, yaw: 180 }, { u: 0.36, yaw: 15 }, { u: 0.40, yaw: 165 },
  { u: 0.44, yaw: 180 }, { u: 0.48, yaw: 0 }, { u: 0.52, yaw: 210 },
  { u: 0.56, yaw: 90 },
];
/* PERCHE' SI COMINCIA DA 0,20 E NON DA 0,08. Sotto u = 0,15 la posa
   nuova e quella vecchia sono LA STESSA FUNZIONE: il volo entra con
   sm(u,0,15,0,31) e prima di 0,15 pesa zero, perche' fino a li' il
   portiere e' ancora raccolto e nessuno dei due tuffi e' cominciato.
   Mettere quelle fasi nel foglio vorrebbe dire spendere celle "nuove"
   per disegnare il testimone: si vedrebbero due celle identiche e la
   prova perderebbe potenza senza guadagnare verita'. Sono il 24% dei
   fotogrammi di tuffo (u 0,08-0,20 su 0,08-0,58) e restano invariati:
   sta scritto qui e nel rapporto, non e' nascosto. */

function servi(mappa) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const nome = decodeURIComponent(req.url.split('?')[0]);
      let f = mappa[nome] || path.join(RADICE, nome);
      if ((!f.startsWith(RADICE) && !Object.values(mappa).includes(f)) ||
        !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* la sonda che disegna una cella: vive nella pagina del gioco da
   ritrarre, e usa la SUA Rig3D */
const CELLE = `(pose, CELLA, HDEV, verdeImposto) => {
  /* IL VERDE E' QUELLO DEL CAMPO, non un verde scelto qui: si legge dal
     manto gia' dipinto sulla tela della partita. Se per qualunque
     ragione non si potesse leggere, lo strumento lo DICE invece di
     inventarne uno.
     LA SECONDA PAGINA RIUSA IL VERDE DELLA PRIMA. Il manto e' a strisce
     e la camera non si ferma nello stesso punto nelle due partite: senza
     questo i due gruppi di celle avevano fondali diversi di un'unita'
     (13,27,17 contro 14,28,17), cioe' un indizio sistematico che permette
     di raggruppare le celle senza guardare il gesto. Un provino cieco con
     un fondale che tradisce il gruppo non e' un provino cieco. */
  let verde = verdeImposto || null;
  if (!verde) try {
    const tela = document.querySelector('canvas');
    const g0 = tela.getContext('2d');
    const d = g0.getImageData((tela.width*0.5)|0, (tela.height*0.62)|0, 1, 1).data;
    if (d[3] > 200) verde = 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')';
  } catch(e) {}
  if (!verde) return { errore: 'non riesco a leggere il verde del manto' };

  /* LA DIVISA E' QUELLA VERA DEL PORTIERE, presa da rigLook sul portiere
     in campo: gkKit, non i colori di squadra. Un provino con la maglia
     sbagliata toglierebbe alla giuria l'unico indizio di RUOLO che il
     gioco da' davvero. E porta con se' palla:null, che e' l'adattamento
     (a) del rig in pianta: il pallone della clip NON si disegna, quello
     vero lo disegna drawBall. Senza questo il foglio regalerebbe alla
     giuria un pallone che sullo schermo non c'e'. */
  const gk = G.players.find(p => p.role === 'gk');
  if (!gk) return { errore: 'nessun portiere in campo' };
  const look = rigLook(gk);
  if (look.palla !== null) return { errore: 'rigLook non porta palla:null, il foglio mentirebbe' };

  const out = [];
  for (const p of pose) {
    const cv = document.createElement('canvas');
    cv.width = CELLA; cv.height = CELLA;
    const g = cv.getContext('2d');
    g.fillStyle = verde; g.fillRect(0,0,CELLA,CELLA);
    /* il punto a terra della figura sta al 76% dell'altezza della cella:
       sopra ci sta la figura, sotto le resta il margine che in partita
       occupa l'ombra */
    Rig3D.disegna(g, CELLA/2, CELLA*0.76, HDEV, p.yaw*Math.PI/180, 'alto',
                  'tuffo', p.u/Rig3D.CLIPS.tuffo.freq, look,
                  true, 1, 0);
    out.push(cv.toDataURL('image/png'));
  }
  return { verde, celle: out, kit: JSON.stringify(Object.entries(look).filter(([k,v]) => typeof v === 'string' && v[0] === '#').slice(0,4)) };
}`;

/* il compositore: prende venti immagini gia' fatte e le mette in griglia
   nell'ordine dato. Non disegna niente per conto suo. */
const COMPONI = `async (urls, ordine, CELLA, ZOOM) => {
  const COL = 5, RIG = 4, M = 8;
  const L = Math.round(CELLA*ZOOM);
  const W = COL*L + (COL+1)*M, H = RIG*L + (RIG+1)*M;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = '#20242a'; g.fillRect(0,0,W,H);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  for (let i = 0; i < ordine.length; i++) {
    const im = new Image();
    await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = urls[ordine[i]]; });
    const cx = M + (i % COL)*(L+M), cy = M + ((i/COL)|0)*(L+M);
    g.drawImage(im, 0, 0, CELLA, CELLA, cx, cy, L, L);
  }
  return cv.toDataURL('image/png');
}`;

async function celleDa(browser, porta, nome, verdeImposto) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  /* IL CASO E' GOVERNATO, come in ogni altro strumento di questa
     cartella: senza questo le due pagine giocano due partite diverse e
     la camera si ferma su due strisce d'erba diverse. */
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
  }, SEME);
  await pag.goto(`http://127.0.0.1:${porta}/${nome}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(250);
  /* una partita vera e un fotogramma disegnato: serve perche' il verde si
     legge dal manto DIPINTO, non da una costante ricopiata */
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
    t.startMatch(1, 1); t.setCpuVsCpu(true);
    for (let i = 0; i < 30; i++) { t.simulate(1 / 60); }
    t.disegna();
  });
  await pag.evaluate(s => { window.__prov = eval(s); }, CELLE);
  const r = await pag.evaluate(([p, c, h, v]) => window.__prov(p, c, h, v), [POSE, CELLA, HDEV, verdeImposto || null]);
  if (r.errore) throw new Error(nome + ': ' + r.errore);
  if (errori.length) console.log('  (eccezioni di pagina su ' + nome + ': ' + errori[0] + ')');
  return { celle: r.celle, verde: r.verde, ctx, pag };
}

(async () => {
  if (!arg('nuovo', '')) { console.error('FALLITO: manca --nuovo <file.html>'); process.exit(1); }
  for (const f of [NUOVO, TEST]) if (!fs.existsSync(f)) { console.error('FALLITO: inesistente ' + f); process.exit(1); }

  const srv = await servi({ '/NUOVO.html': NUOVO, '/TESTIMONE.html': TEST });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const A = await celleDa(browser, srv.porta, 'NUOVO.html');
    const B = await celleDa(browser, srv.porta, 'TESTIMONE.html', A.verde);
    console.log('  divisa del portiere: ' + A.kit + ' / ' + B.kit);
    if (A.verde !== B.verde) console.log('  ATTENZIONE: i due fondali non sono lo stesso verde (' + A.verde + ' contro ' + B.verde + ')');
    await A.ctx.close();

    /* 0..9 = nuovo, 10..19 = testimone; poi la permutazione, dichiarata */
    const urls = A.celle.concat(B.celle);
    let s = SEME >>> 0 || 1;
    const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    const ordine = [...Array(20).keys()];
    for (let i = 19; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ordine[i], ordine[j]] = [ordine[j], ordine[i]]; }

    await B.pag.evaluate(s2 => { window.__comp = eval(s2); }, COMPONI);
    const dataURL = await B.pag.evaluate(([u, o, c, z]) => window.__comp(u, o, c, z), [urls, ordine, CELLA, ZOOM]);
    await B.ctx.close();

    fs.writeFileSync(OUT, Buffer.from(dataURL.split(',')[1], 'base64'));

    const LET = 'ABCDEFGHIJKLMNOPQRST';
    console.log('\n=====================================================================');
    console.log(' FOGLIO CONTATTI scritto in ' + OUT);
    console.log(' 20 celle, griglia 5x4, lette da sinistra a destra e dall\'alto in basso.');
    console.log(' figura ad altezza vera ' + HDEV + ' px di periferica; cella ' + CELLA +
      ' px ingrandita ' + ZOOM + 'x con interpolazione; fondale ' + A.verde + ' letto dal manto.');
    console.log(' nuovo: ' + NUOVO);
    console.log(' testimone: ' + TEST);
    console.log(' permutazione (seme ' + SEME + ', Fisher-Yates su xorshift32): [' + ordine.join(',') + ']');
    console.log('=====================================================================');
    console.log('\n CHIAVE DI RISPOSTA — non sta nell\'immagine:');
    console.log(' cella  gruppo       fase u   imbardata');
    for (let i = 0; i < 20; i++) {
      const k = ordine[i], nuovo = k < 10, p = POSE[k % 10];
      console.log('   ' + LET[i] + '    ' + (nuovo ? 'NUOVO    ' : 'TESTIMONE') +
        '     ' + p.u.toFixed(2) + '      ' + String(p.yaw).padStart(3) + ' gradi');
    }
    const nuoveIn = ordine.map((k, i) => k < 10 ? LET[i] : null).filter(Boolean);
    console.log('\n celle NUOVE: ' + nuoveIn.join(' '));
    console.log(' celle TESTIMONE: ' + ordine.map((k, i) => k >= 10 ? LET[i] : null).filter(Boolean).join(' '));
  } finally {
    await browser.close(); srv.chiudi();
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
