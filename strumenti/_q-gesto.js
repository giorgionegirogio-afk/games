/* =====================================================================
   _q-gesto.js — IL MOVIMENTO DEI GESTI (voce #152, compito 4)

   IL PRINCIPIO, E DA DOVE VIENE. Il committente ha indicato Subway
   Surfers e FIFA Mobile, e la cosa che quei due fanno e che un gioco
   fatto di pose non fa quasi mai e' sempre la stessa: un gesto non
   comincia quando comincia e non finisce quando finisce. Il piede si
   pianta PRIMA, il corpo continua DOPO. Senza quei due tempi la figura
   salta da una posa all'altra e legge come un burattino.

   NON SI PRENDE UN DISEGNO, SI PRENDE UN REPERTORIO. La tassonomia di
   `fcm-estratto/g-anim.txt` dice QUALI gesti contano in un gioco di
   calcio — MoveDirection, KickBall, Trap, Intercept, SlideTackle,
   StandTackle, Reaction — e le clip del gioco ci si mappano sopra. Qui
   si giudicano le dieci che sono un GESTO (non un ciclo, non una posa
   d'attesa): su una corsa «prima» e «dopo» non vogliono dire niente.

   ================= DUE MISURE ROBUSTE, E DUE SCARTATE ===============
   Si legge il rig attraverso l'API di banco che il gioco espone gia'
   (Rig3D.banco.posa + Rig3D.banco.P): diciotto giunti in metri, la
   stessa aritmetica che disegna la partita, nessuna stima.

     CAMMINO      la somma delle distanze percorse da tutti e diciotto i
                  giunti lungo il ciclo. E' «quanto si muove» e non
                  «quanto e' ampio»: una posa che va e torna conta due
                  volte, una che resta ferma conta zero.
     ESCURSIONE   la distanza massima fra la posa di partenza e
                  qualunque altra, per il giunto che si sposta di piu'.
                  Serve a smentire il cammino: mille micro-oscillazioni
                  fanno cammino e non fanno un gesto.

   DUE MISURE SONO STATE PROVATE E BUTTATE, e sta scritto qui perche'
   nessuno le rifaccia credendo di aver avuto un'idea. Si era provato a
   misurare l'ANTICIPAZIONE (quanto l'attore arretra prima di andare
   avanti) e la CHIUSURA (quanto dura la frenata dopo il picco contro la
   rincorsa prima), proiettando il cammino del giunto piu' veloce sulla
   direzione della sua velocita' al picco. Misurate sul gioco, quelle due
   bocciavano NOVE clip su dieci, compreso il TIRO — che e' la clip di
   cui il file documenta per esteso i quattro tempi, anticipo compreso.
   Un cancello che boccia la cosa meglio fatta del file non sta misurando
   quella cosa: sta misurando quale giunto capita di essere il piu'
   veloce in un fotogramma, e su un corpo a diciotto giunti quello
   cambia da una clip all'altra. Buttate.

   ================= LE SOGLIE, DALLA SEPARAZIONE =====================
   Non dal peggio osservato: e' la lezione che il #151 ha pagato due
   volte. Misurate il 24 settembre 2026 sul merge-base 4ed12a6 (240
   passi di fase, corporatura 3), ordinate per cammino:

     clip           cammino(m)   escursione(m)
     rovesciata        77,61         1,903
     tuffo             67,14         1,533
     presa             31,39         1,205
     tiro              28,41         1,275
     scivolata         23,44         0,852
     rinvio            20,99         1,244
     cross             17,41         0,859
     filtrante         17,25         0,930
     contrasto         15,91         0,795
     passaggio         13,63         0,771
     testa             12,77         0,590
     FRENATA            3,41         0,362

   Undici gesti su dodici stanno fra 12,77 e 77,61 metri; uno sta a
   3,41, cioe' quasi QUATTRO VOLTE sotto il penultimo. In mezzo non c'e'
   nessuno: e' un fosso, non una coda. La soglia sta nella media
   geometrica del fosso — sqrt(3,41 x 12,77) = 6,60 — arrotondata a
   **6,5 metri**: due volte sopra la clip che cade e due volte sotto la
   peggiore che passa. L'escursione ha lo stesso fosso (0,362 contro
   0,590, media geometrica 0,462) e la sua soglia e' **0,45 metri**.
   Le due devono passare TUTT'E DUE.

   PER CONFRONTO, e per chi vorra' allargare il cancello: le due clip
   FERME del gioco — fermo 2,71 m e attesaGK 2,18 m — stanno sotto la
   soglia, ed e' giusto: non sono gesti e non si giudicano qui. La
   frenata di oggi si muove MENO DEL DOPPIO di un uomo fermo.

   ================= NASCE ROSSO ======================================
   Sul gioco del merge-base questo cancello da' 9 su 10: la frenata e'
   rossa su tutt'e due i numeri. E' il suo mestiere.

   uso:  node strumenti/_q-gesto.js
         node strumenti/_q-gesto.js --gioco fuori/x.html
   ===================================================================== */
'use strict';
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const ha = n => process.argv.indexOf('--' + n) > 0;
const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
const PASSI = +arg('passi', 240);
const CAM_MIN = +arg('cammino', 6.5);
const ESC_MIN = +arg('escursione', 0.45);

/* LE NOVE CLIP CHE HANNO UN ISTANTE, e la voce della tassonomia di FC
   Mobile a cui rispondono. I cicli (corsa, camminata) e le pose ferme
   (fermo, attesaGK) non stanno qui: su un ciclo «prima» e «dopo» non
   vogliono dire niente. Le clip del portiere e quelle di festa non ci
   stanno perche' non hanno un contatto dichiarato — si giudicheranno il
   giorno che qualcuno glielo dara'. */
const GESTI = [
  ['tiro', 'KickBall'],
  ['passaggio', 'KickBall'],
  ['filtrante', 'KickBall'],
  ['cross', 'KickBall'],
  ['testa', 'KickBall (di testa)'],
  ['rinvio', 'KickBall (del portiere)'],
  ['rovesciata', 'KickBall (acrobatico)'],
  ['scivolata', 'SlideTackle'],
  ['contrasto', 'StandTackle'],
  ['frenata', 'MoveDirection (l\'arresto)'],
];

function misura([passi, gesti]) {
  const B = Rig3D.banco, NJ = B.NJ;
  B.corpora(3, 0);
  const fuori = [];
  for (const nome of gesti) {
    if (!Rig3D.CLIPS[nome]) { fuori.push({ nome, manca: true }); continue; }
    const pos = [];
    for (let k = 0; k <= passi; k++) {
      B.posa(nome, k / passi);
      pos.push(Array.from(B.P.slice(0, NJ * 3)));
    }
    /* il cammino di tutti i giunti, e il PICCO: il fotogramma in cui un
       giunto qualsiasi si muove piu' in fretta. Quel giunto e' l'attore. */
    let cammino = 0, picco = 0, kP = 1, jP = 0;
    for (let k = 1; k <= passi; k++) {
      for (let j = 0; j < NJ; j++) {
        const dx = pos[k][j * 3] - pos[k - 1][j * 3];
        const dy = pos[k][j * 3 + 1] - pos[k - 1][j * 3 + 1];
        const dz = pos[k][j * 3 + 2] - pos[k - 1][j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        cammino += d;
        if (d > picco) { picco = d; kP = k; jP = j; }
      }
    }
    /* L'ESCURSIONE: per ogni giunto, la distanza fra la posa di
       partenza e la piu' lontana; si tiene la massima. E' lei a
       smentire il cammino, che da solo premierebbe mille oscillazioni. */
    let esc = 0, chi = -1;
    for (let j = 0; j < NJ; j++) {
      let m = 0;
      for (let k = 0; k <= passi; k++) {
        const dx = pos[k][j * 3] - pos[0][j * 3];
        const dy = pos[k][j * 3 + 1] - pos[0][j * 3 + 1];
        const dz = pos[k][j * 3 + 2] - pos[0][j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > m) m = d;
      }
      if (m > esc) { esc = m; chi = j; }
    }
    fuori.push({ nome, cammino: +cammino.toFixed(3), picco: +(picco * passi).toFixed(2),
                 fase: +(kP / passi).toFixed(3), esc: +esc.toFixed(3), attore: chi });
  }
  return fuori;
}

(async () => {
  let browser, srv;
  try {
    const { chromium } = require('playwright');
    srv = await servi();
    browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 } });
    const pag = await ctx.newPage();
    await pag.addInitScript(bancoDiProva);
    await pag.addInitScript(semeFisso, 20260924);
    const rel = path.relative(RADICE, path.resolve(RADICE, GIOCO)).split(path.sep).join('/');
    await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
    await pag.evaluate(() => window.__banco.passo(10));
    const esiste = await pag.evaluate(() => typeof Rig3D !== 'undefined' && !!(Rig3D.banco && Rig3D.banco.posa));
    if (!esiste) { console.log('PROVA NULLA: il gioco non espone Rig3D.banco.posa'); process.exit(3); }
    const r = await pag.evaluate(misura, [PASSI, GESTI.map(g => g[0])]);
    await browser.close(); srv.chiudi();

    console.log('=== _q-gesto — IL MOVIMENTO DEI GESTI ===');
    console.log('  gioco: ' + rel + '   ' + PASSI + ' passi di fase, corporatura 3');
    console.log('  soglie: cammino >= ' + CAM_MIN + ' m, escursione >= ' + ESC_MIN + ' m');
    console.log('');
    console.log('  clip           voce FCM                  cammino  escurs.  picco@fase');
    let passati = 0, giudicate = 0;
    const rossi = [];
    for (const [nome, voce] of GESTI) {
      const d = r.find(x => x.nome === nome);
      if (!d || d.manca) { console.log('  ' + nome.padEnd(14) + '  CLIP ASSENTE'); continue; }
      giudicate++;
      const ok = d.cammino >= CAM_MIN && d.esc >= ESC_MIN;
      if (ok) passati++; else rossi.push(nome);
      console.log('  ' + (ok ? 'OK ' : 'NO ') + nome.padEnd(11) + voce.padEnd(26) +
                  d.cammino.toFixed(2).padStart(7) + d.esc.toFixed(3).padStart(9) +
                  ('  ' + d.fase.toFixed(3)).padStart(12));
    }
    if (!giudicate) { console.log('\nPROVA NULLA: nessuna clip giudicabile.'); process.exit(3); }
    console.log('\n' + passati + ' gesti su ' + giudicate + ' si muovono come un gesto.');
    if (rossi.length) {
      console.log('ROSSO — il movimento e\' povero: ' + rossi.join(', ') + '.');
      console.log('  Una clip che si muove come una posa d\'attesa non e\' un gesto:');
      console.log('  e\' una posa a cui qualcuno ha dato un nome.');
    } else console.log('OK — tutti i gesti giudicati si muovono come un gesto.');
    process.exit(rossi.length ? 1 : 0);
  } catch (e) {
    try { if (browser) await browser.close(); } catch (_) {}
    try { if (srv) srv.chiudi(); } catch (_) {}
    console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
    process.exit(2);
  }
})();
