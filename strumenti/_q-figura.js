/* =====================================================================
   _q-figura.js — IL CANCELLO DELLA FIGURA (voce «figura», onda del 20/8).

   Il censimento (_analisi/COSA-MANCA.md §2.3) misura sulla figura in
   partita: due soli livelli di tono per costruzione, la coscia un blocco
   unico nella tinta dei calzoncini, e il numero di maglia dipinto FUORI
   dall'ordine di profondita' — sopra la nuca quando la figura e' di
   spalle. Questo cancello legge quelle tre cose DAI PIXEL, alla scala
   vera di partita (DPR x S2 x P_DIS, letta dal gioco posato, mai
   dichiarata a mano), e DEVE nascere rosso sul gioco di oggi.

   LE CINQUE LETTURE:
     V1  BUSTO E COSCIA INSIEME: livelli di tono distinti >= 4 — e' il
         cancello del censimento §2.3, letterale. Oggi 3: lume e ombra
         del busto piu' il calzoncino; manca il quarto blocco.
     V2  COSCIA: livelli di tono distinti >= 2 (oggi 1: calzoncino
         unico dall'anca al ginocchio).
     V3  CONTROLLO NEGATIVO DEL CONTATORE: su una divisa a tinta unita il
         busto deve dare ESATTAMENTE 2. Un contatore che non sa dire
         «due» gonfierebbe V1 senza che nessuno lo veda. Deve essere
         verde su TUTTI i file, prima e dopo.
     V4  NUCA: figura di spalle in partita posata, il glifo chiaro del
         numero non deve dipingere DENTRO il disco della testa
         (oggi lo fa: e' il difetto).
     V5  IL NUMERO NON E' STATO CANCELLATO: figura di fronte, il glifo
         sta sul torso. Se una «cura» di V4 fosse una cancellazione,
         questo la coglierebbe.

   COME LEGGE. V1-V3 disegnano UNA figura con la STESSA Rig3D.disegna
   della partita su una tela fuori schermo alla scala vera, e leggono i
   pixel nei CENTRI delle bande dichiarate dalla geometria del rig
   (trapezio W_VITA/W_PETTO, strisce a 0,607 della semilarghezza,
   terminatore a 0,78): posizioni derivate, colori LETTI. V4-V5 leggono
   la tela del gioco vero, posato con strumenti/_posa.js, dopo aver
   messo in posa un giocatore in un punto sgombro.

   uso:
     node strumenti/_q-figura.js --gioco <file>
   esce 0 se tutto verde, 1 se rosso.
   ===================================================================== */
const path = require('path');
const { servi, bancoDiProva, semeFisso, posaFerma, disegnaFermo } = require('./_posa.js');

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');

const esiti = [];
function verifica(ok, testo, dettaglio) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\n         ' + dettaglio : ''));
}

/* ------------------------------------------------------------------ */
/* V1-V3: il contatore di toni, dentro la pagina.                      */
/* ------------------------------------------------------------------ */
function contaToni(disegno) {
  /* gira dentro la pagina; disegno: 'strisce' o 'tinta' */
  const G = window.__test.G;
  /* P_DIS=1,18 e RIG_H=34 sono le costanti di disegno della figura in
     partita (drawPlayer); W_PETTO/W_VITA il trapezio del busto; 0,607 e
     0,0717 la geometria delle strisce di motivo(); 0,78 il terminatore.
     Sono POSIZIONI di lettura derivate dal disegno dichiarato: se il
     gioco le cambia, questo cancello diventa rosso e va ritarato — e'
     il comportamento giusto per un cancello ancorato. */
  const P_DIS = 1.18, RIG_H = 34, W_PETTO = 0.345, W_VITA = 0.195, TERM = 0.78;
  const S2 = G.view.S2 || 1, DPR = window.devicePixelRatio || 1;
  const pxs = S2 * P_DIS;            /* quello che drawPlayer passa al rig */
  const k = DPR * pxs;               /* pixel VERI di schermo per unita' */
  const cv = document.createElement('canvas');
  cv.width = 220; cv.height = 220;
  const g = cv.getContext('2d');
  g.fillStyle = '#4a8a42'; g.fillRect(0, 0, 220, 220);
  g.save(); g.scale(k, k);
  const look = Object.assign({}, Rig3D.lookPredefinito, { disegno });
  delete look._lume; delete look._ombra; delete look._ombS;
  /* 'esultanza' a mezzo giro: braccia alzate, il busto resta sgombro
     (in 'fermo' le braccia cadono davanti ai fili del torso e
     sporcherebbero le bande). La coscia si legge su 'fermo'. */
  Rig3D.disegna(g, 110 / k, 190 / k, RIG_H, Math.PI, 'alto', 'esultanza',
                0.50 / Rig3D.CLIPS.esultanza.freq, look, true, pxs, 0);
  const J = Rig3D.giunti(), nm = J.nomi;
  const px = (x, y) => { const d = g.getImageData(Math.round(x), Math.round(y), 1, 1).data; return [d[0], d[1], d[2]]; };
  const dist = (a, b) => Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
  const ERBA = [74, 138, 66];
  const cam = Rig3D.CAMERE.alto;
  const s = RIG_H / (1.9 * Math.max(0.58, cam.ce));      /* la scala interna del rig */
  /* punto sulla riga trasversale del busto: frazione t lungo pelvi-collo,
     banda laterale f (0 = filo ovest, 1 = filo est), come troncoQuad */
  const punto = (t, f) => {
    const ax = J.x[nm.PELVIS], ay = J.y[nm.PELVIS];
    const bx = J.x[nm.NECK], by = J.y[nm.NECK];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    let nx = -dy / L, ny = dx / L; if (nx > 0) { nx = -nx; ny = -ny; }
    const w = (W_VITA + (W_PETTO - W_VITA) * t) * s * 0.5;
    const o = w * (1 - 2 * f);
    return [(ax + dx * t + nx * o) * k, (ay + dy * t + ny * o) * k];
  };
  /* le quattro bande del busto: lume-base, striscia ovest, striscia est,
     ombra-base — centri derivati (striscia a 0,607 => f 0,197 / 0,803) */
  const BANDE = [0.50, 0.1965, 0.8035, 0.93];
  const righe = [0.60, 0.74];
  const bande = [];
  let instabile = '';
  for (let b = 0; b < 4; b++) {
    const c0 = px(...punto(righe[0], BANDE[b]));
    const c1 = px(...punto(righe[1], BANDE[b]));
    if (dist(c0, c1) > 26) instabile += ` banda f=${BANDE[b]} differisce fra le righe (${c0} | ${c1})`;
    if (dist(c0, ERBA) < 26 || dist(c1, ERBA) < 26) instabile += ` banda f=${BANDE[b]} ha pescato erba`;
    bande.push(c0);
  }
  /* quanti colori DISTINTI fra le quattro bande (soglia 30 in RGB) */
  const gruppi = [];
  for (const c of bande) {
    let trovato = false;
    for (const q of gruppi) if (dist(c, q) < 30) { trovato = true; break; }
    if (!trovato) gruppi.push(c);
  }
  /* la coscia OVEST su 'fermo': calzoncino in alto, e cosa c'e' sotto */
  Rig3D.disegna(g, 110 / k, 190 / k, RIG_H, Math.PI, 'alto', 'fermo',
                0.30 / Rig3D.CLIPS.fermo.freq, look, true, pxs, 0);
  const J2 = Rig3D.giunti();
  const ovest = (J2.x[nm.HIPR] < J2.x[nm.PELVIS]) ? [nm.HIPR, nm.KNR] : [nm.HIPL, nm.KNL];
  const lungo = (t) => {
    const ax = J2.x[ovest[0]], ay = J2.y[ovest[0]];
    const bx = J2.x[ovest[1]], by = J2.y[ovest[1]];
    return px((ax + (bx - ax) * t) * k, (ay + (by - ay) * t) * k);
  };
  const cAlto = lungo(0.28), cBasso = lungo(0.80);
  if (dist(cAlto, ERBA) < 26 || dist(cBasso, ERBA) < 26) instabile += ' la sonda della coscia ha pescato erba';
  const toniCoscia = dist(cAlto, cBasso) > 30 ? 2 : 1;
  return { toniBusto: gruppi.length, toniCoscia, bande, cAlto, cBasso, instabile,
           k: +k.toFixed(3), pxs: +pxs.toFixed(3) };
}

/* ------------------------------------------------------------------ */
/* V4-V5: il numero e la nuca, sulla tela del gioco vero.              */
/* ------------------------------------------------------------------ */
function leggiNumero(ang) {
  /* gira dentro la pagina, a gioco posato; ang mette in posa il primo
     giocatore di movimento della squadra 0 (di spalle: -pi/2). */
  const G = window.__test.G;
  const S2 = G.view.S2 || 1, DPR = window.devicePixelRatio || 1;
  const Ax = G.view.Ax || 0, Ay = G.view.Ay || 0;
  const VW = window.innerWidth, VH = window.innerHeight;
  let p = null;
  for (const q of G.players) { if (q.team === 0 && q.role !== 'gk' && !(q.out > 0)) { p = q; break; } }
  if (!p) return { errore: 'nessun giocatore di movimento della squadra 0' };
  /* un punto SGOMBRO dentro il quadro: fra i candidati si prende quello
     piu' lontano da tutti gli altri corpi e dal pallone */
  /* i candidati si scelgono in coordinate SCHERMO, nella fascia centrale
     del quadro: sopra ci sono tribuna e cartelloni, sotto c'e' la fascia
     dei comandi — tutte cose che non sono erba e hanno gia' rotto due
     volte la stima del riquadro della figura. Poi si converte in mondo. */
  let meglio = null, md = -1;
  for (const [fx, fy] of [[0.30, 0.40], [0.70, 0.40], [0.25, 0.55], [0.75, 0.55], [0.50, 0.36], [0.42, 0.52]]) {
    const X = (VW * fx - Ax) / S2, Y = (VH * fy - Ay) / S2;
    let dmin = 1e9;
    for (const q of G.players) { if (q === p) continue;
      const d = Math.hypot(q.x - X, q.y - Y); if (d < dmin) dmin = d; }
    if (G.ball) { const d = Math.hypot(G.ball.x - X, G.ball.y - Y); if (d < dmin) dmin = d; }
    if (dmin > md) { md = dmin; meglio = [X, Y]; }
  }
  /* IN CORSA, NON DA FERMO: il difetto della nuca nasce dall'inclinazione
     del busto — di spalle il collo proietta VERSO la testa e il glifo,
     ancorato allo 0,80 del segmento pelvi-collo, finisce sopra i capelli.
     Da fermo (busto dritto) non si innesca: misurato, 0 pixel. La corsa
     e' anche la posa del 95% delle figure in partita. */
  p.x = meglio[0]; p.y = meglio[1]; p.ang = ang;
  p.vx = 90 * Math.cos(ang); p.vy = 90 * Math.sin(ang);
  p.celeb = 0; p.slide = -1; p.recover = 0; p.kickT = 0; p.kickB = 0; p.charge = -1;
  p.rollio = 0;      /* niente tilt: la misura non deve dipendere dal rollio vivo */
  return null;
}
/* LA LETTURA E' DIFFERENZIALE, e il perche' va scritto: la scena passa
   dalla post-produzione (grana, vignettatura), quindi NESSUN colore
   arriva ai pixel esatto — il glifo #f4f7f1 a tolleranza 5 dava zero
   pixel, e a tolleranza 12 contava i calzoncini bianchi (#f5f2ea, a
   distanza 8,7) come numero: misurato, 68 falsi pixel. Qui si disegnano
   DUE fotogrammi identici in tutto salvo la CIFRA sul petto (8 contro 1,
   stessa larghezza di glifo): i pixel che differiscono SONO il glifo,
   qualunque velo ci sia sopra. Il disegno posato e' idempotente
   (strumenti/_posa.js, verificato byte per byte), quindi la differenza
   non ha rumore. */
function fissaNumero(n) {
  const G = window.__test.G;
  for (const q of G.players) {
    if (q.team === 0 && q.role !== 'gk' && !(q.out > 0)) { q.numero = n; return null; }
  }
  return { errore: 'nessun giocatore' };
}
function salvaRegione() {
  const G = window.__test.G;
  const S2 = G.view.S2 || 1, DPR = window.devicePixelRatio || 1;
  const Ax = G.view.Ax || 0, Ay = G.view.Ay || 0;
  let p = null;
  for (const q of G.players) { if (q.team === 0 && q.role !== 'gk' && !(q.out > 0)) { p = q; break; } }
  const ax = (Ax + p.x * S2) * DPR, ay = (Ay + p.y * S2) * DPR;
  const mezzaL = 26 * S2 * DPR, sopra = 54 * S2 * DPR, sotto = 22 * S2 * DPR;
  const x0 = Math.round(ax - mezzaL), y0 = Math.round(ay - sopra);
  const W = Math.round(2 * mezzaL), H = Math.round(sopra + sotto);
  const cv = document.querySelector('canvas');
  window.__qfigura = { x0, y0, W, H,
    dati: cv.getContext('2d').getImageData(x0, y0, W, H) };
  return { W, H };
}
function diffRegione() {
  const R = window.__qfigura;
  if (!R) return { errore: 'manca il primo fotogramma' };
  const cv = document.querySelector('canvas');
  const B = cv.getContext('2d').getImageData(R.x0, R.y0, R.W, R.H).data;
  const A = R.dati.data, W = R.W, H = R.H;
  /* NIENTE STIMA DEL DISCO DELLA TESTA, ed e' una lezione pagata: la
     stima dal riquadro non-erba pescava i cartelloni, poi le toppe di
     terra del manto (marroni, non «verdi dominanti»), e sbagliava due
     volte su due. Qui la domanda si fa al pixel stesso: dove il glifo
     e' presente in UNO solo dei due fotogrammi, il colore dell'ALTRO
     fotogramma e' la superficie che il glifo sta coprendo. Se quella
     superficie e' testa — capelli o pelle, cioe' R>G>B con R-B>25, che
     esclude erba (verde dominante), divisa azzurra (blu alto), bianco
     (piatto) e contorno scuro (quasi piatto) — il numero sta dipingendo
     sopra la testa. Vale con la divisa di casa (azzurra): se un giorno
     la squadra 0 vestisse un rosso-bruno, questo classificatore andra'
     ritarato, e il controllo V5 qui sotto lo direbbe subito. */
  const pare = (D, i) => (D[i] > D[i + 1] && D[i + 1] > D[i + 2] && D[i] - D[i + 2] > 25);
  let sullaTesta = 0, sulResto = 0, diffTot = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]);
    if (d <= 6) continue;                 /* stesso pixel nei due disegni */
    diffTot++;
    if (pare(A, i) || pare(B, i)) sullaTesta++; else sulResto++;
  }
  return { sullaTesta, sulResto, diffTot };
}

/* ------------------------------------------------------------------ */
(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, 20260819);
  await pag.addInitScript(bancoDiProva);
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 15000 });
  await pag.waitForTimeout(400);

  console.log(`\n=== _q-figura — ${GIOCO} ===\n`);
  await posaFerma(pag, { taglia: 5, secondi: 12 });

  /* V1-V2: i toni della figura, busto e coscia */
  const t1 = await pag.evaluate(contaToni, 'strisce');
  verifica(!t1.instabile, `la sonda dei toni e' stabile (scala vera ${t1.k} px/unita')`,
           t1.instabile || undefined);
  /* il conteggio congiunto (bande del busto + i due punti della coscia)
     con la stessa regola di distinzione della pagina: distanza RGB > 30 */
  const dist = (a, b) => Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
  const gruppi = [];
  for (const c of [...t1.bande, t1.cAlto, t1.cBasso]) {
    if (!gruppi.some(q => dist(c, q) < 30)) gruppi.push(c);
  }
  verifica(gruppi.length >= 4,
           `V1 busto+coscia: livelli di tono distinti ${gruppi.length} (minimo 4, censimento §2.3)`,
           'letti: ' + gruppi.map(c => c.join(',')).join(' | '));
  verifica(t1.toniCoscia >= 2,
           `V2 coscia: livelli di tono distinti ${t1.toniCoscia} (minimo 2)`,
           `alto ${t1.cAlto.join(',')}  basso ${t1.cBasso.join(',')}`);

  /* V3: controllo negativo del contatore, tinta unita => esattamente 2 */
  const t2 = await pag.evaluate(contaToni, 'tinta');
  verifica(t2.toniBusto === 2,
           `V3 controllo negativo: busto a tinta unita da' ${t2.toniBusto} toni (atteso esattamente 2)`,
           'bande lette: ' + t2.bande.map(c => c.join(',')).join(' | '));

  /* V4-V5: la coppia di disegni che differiscono solo per la cifra */
  const coppia = async (ang) => {
    let err = await pag.evaluate(leggiNumero, ang);
    if (err && err.errore) throw new Error(err.errore);
    err = await pag.evaluate(fissaNumero, 8);
    if (err && err.errore) throw new Error(err.errore);
    await disegnaFermo(pag);
    await pag.evaluate(salvaRegione);
    await pag.evaluate(fissaNumero, 1);
    await disegnaFermo(pag);
    return pag.evaluate(diffRegione);
  };

  /* V4: di spalle e in corsa, il glifo non dipinge sopra la testa */
  const spalle = await coppia(-Math.PI / 2);
  verifica(!spalle.errore && spalle.sullaTesta === 0 && spalle.diffTot > 0,
           `V4 nuca: pixel del glifo sopra capelli o pelle, di spalle: ${spalle.errore || spalle.sullaTesta} (attesi 0, con glifo vivo altrove)`,
           JSON.stringify(spalle));

  /* V5: di fronte il numero esiste ancora sul petto (una «cura» di V4
     che fosse una cancellazione qui diventerebbe rossa) */
  const fronte = await coppia(Math.PI / 2);
  verifica(!fronte.errore && fronte.sulResto >= 20,
           `V5 il numero non e' stato cancellato: pixel del glifo sulla maglia, di fronte: ${fronte.errore || fronte.sulResto} (minimo 20)`,
           JSON.stringify(fronte));

  const rossi = esiti.filter(e => !e).length;
  console.log(`\n${esiti.length} controlli, ${esiti.length - rossi} verdi, ${rossi} rossi -> ${rossi ? 'ROSSO' : 'VERDE'}`);
  await br.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('ERRORE:', e.message); process.exit(2); });
