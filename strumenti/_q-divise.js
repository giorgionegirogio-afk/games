/* =====================================================================
   _q-divise.js — LE DUE SQUADRE SI DISTINGUONO? (voce #152, compito 1)

   LA COLONNA CHE MANCAVA AL METRO. Il #151 ha scoperto un buco, e non in
   una misura di contorno: `istantanea.js` da' **42/56 anche a una
   versione in cui le due squadre vestono uguale**. Lo sprite cuoce le
   cinque tinte del kit, sul campo restano ventidue maglie rosse
   identiche, e le sette colonne del freeze-frame test — erba, palla,
   figura, ombre, prato, centro sera, centro abitato — non ne contano
   nemmeno una che dica «si capisce chi e' chi». Un gioco di calcio in
   cui le due squadre non si distinguono non e' un gioco con un difetto
   di grafica: e' un gioco che non si puo' giocare.

   SI MISURA SUI PIXEL, E NON SI PUO' FARE ALTRIMENTI. Il controllo
   ovvio — `TEAMCOL[0] !== TEAMCOL[1]` — sarebbe passato sull'atlas:
   li' i due kit erano diversi NELLO STATO e identici SULLO SCHERMO. La
   catena si spezza fra lo stato e il disegno, quindi la misura deve
   stare dopo il disegno. Qui si legge il fotogramma VERO, sotto una
   maschera che e' la stessa `Rig3D.disegna` di quel fotogramma
   ridipinta in nero — lo stesso metodo di `istantanea.js`, e le figure
   portano gia' l'etichetta della loro squadra.

   IL NUMERO CHE DECIDE E' LA DISTANZA FRA DUE ISTOGRAMMI DI TINTA, non
   un conteggio di colori. La ragione e' un errore gia' pagato dal #151:
   contando le COLONNE di tinta, un kit rosso cade su 340, 0, 20 e 40
   gradi — perche' l'ombreggiatura lo sposta di qualche grado — e la
   versione che veste tutti uguale risultava PIU' VARIA del gioco. Un
   numero che sale quando la cosa misurata scompare non la sta
   misurando. Qui invece si costruisce un istogramma per SQUADRA e si
   misura quanto i due si sovrappongono:

     TV = 1/2 · somma |p_A(tinta) − p_B(tinta)|

   cioe' la distanza in variazione totale, fra 0 e 1. Vale 0 quando le
   due squadre hanno esattamente la stessa distribuzione di tinte addosso
   (pelle compresa: la pelle e' comune e si cancella da se'), e cresce
   quanto piu' i due kit occupano tinte diverse. Non e' simmetrico per
   caso: e' simmetrico per costruzione, e non ha un «primo» e un
   «secondo» kit.

   ACCANTO, PER LEGGERLO: la distanza circolare fra le due tinte
   dominanti, in gradi, e gli ARCHI CONTIGUI di tinta addosso a tutte le
   figure insieme — il numero del #151, tenuto perche' le sue misure
   restino confrontabili con queste (oggi 3, atlante 1).

   SA DIRE «NON HO MISURATO». Se in un istante una delle due squadre non
   ha abbastanza pixel di corpo saturi (figure lontane, camera stretta,
   una squadra fuori quadro), quell'istante non si giudica; se non ne
   resta nessuno, il cancello esce 3 — PROVA NULLA — e non un verde
   regalato.

   IL BANCO E' RIPETIBILE: passo fisso, seme fisso, taglia 5, la posa di
   `_posa.js` e il disegno idempotente. Non guida tocchi reali, quindi un
   rosso qui e' un rosso, non rumore.

   uso:
     node strumenti/_q-divise.js
     node strumenti/_q-divise.js --gioco fuori/152-falso-divise-uguale.html
     node strumenti/_q-divise.js --istanti 6 --primo 6 --passo 7
   ===================================================================== */
'use strict';
const path = require('path');
const { servi, bancoDiProva, semeFisso, posaFerma, disegnaFermo } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };

const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
const ISTANTI = Math.max(1, +arg('istanti', 4));
const PRIMO = +arg('primo', 6);
const PASSO = +arg('passo', 7);
const SEME = +arg('seme', 20260924);

/* =====================================================================
   LE SOGLIE, E DA DOVE VENGONO.

   NON VENGONO DAL PEGGIO OSSERVATO. E' la lezione che il #151 ha pagato
   due volte nello stesso giorno: una soglia presa dal peggio di sette
   corse e' una soglia che il rumore prima o poi passa (successe alla
   nona corsa, e il cancello diventa rosso da solo). La forma che regge
   viene dalla SEPARAZIONE, che e' una proprieta' del fenomeno e non del
   campione: si misura il gioco, si misurano i falsi, e la soglia sta in
   mezzo alla media geometrica.

   MISURATO IL 24 SETTEMBRE 2026, quattro istanti, seme 20260924,
   taglia 5, mediana sugli istanti giudicabili:

     gioco                  TV 0,665   (istanti 0,578 · 0,662 · 0,668 · 0,708)
     falso «uguale»         TV 0,203   (la squadra 1 disegnata col kit della 0)
     falso «quasi»          TV 0,237   (dodici gradi di tinta fra i due kit)

   Il falso che morde e' «quasi», non «uguale», ed e' il motivo per cui
   esiste: fra 0,237 e 0,665 ci sono 2,8 volte, e la media geometrica e'
   0,397. La soglia e' **0,40** — 1,7 volte sopra il falso peggiore e
   1,7 volte sotto il gioco, con il peggior istante del gioco (0,578) che
   la passa di 1,4 volte e il migliore dei falsi (0,304) che la manca di
   1,3. Chi la tocca deve rifare le tre misure, non indovinare.

   PERCHE' IL FALSO NON SCENDE A ZERO, e va detto perche' sembra strano:
   anche vestendo le due squadre uguali, le figure delle due meta' campo
   stanno a profondita' diverse, prendono ombreggiature diverse e cadono
   in colonne di tinta vicine ma non identiche. Zero non e' raggiungibile
   e non e' il bersaglio: il bersaglio e' che fra «due kit» e «un kit
   solo» ci sia un fosso, e il fosso misurato e' di 2,8 volte.

   LA TINTA DOMINANTE E' LA SECONDA CAMPANA, e non e' ridondante:
   gioco 180 gradi, tutt'e due i falsi 0. La soglia e' **45 gradi**.
   I due numeri devono passare TUTT'E DUE, perche' ognuno dei due ha un
   modo di essere aggirato e insieme no — misurato: nell'istante 3 i due
   falsi danno 180 gradi di distanza fra le dominanti (la squadra vestita
   di rosso ha come colonna piu' piena la PELLE, che sta a 30 gradi), e
   se la dominante fosse il solo cancello quell'istante sarebbe passato.
   La TV lo boccia a 0,149 e 0,184. */
const TV_MIN = +arg('tv', 0.40);
const DOM_MIN = +arg('dom', 45);
/* pixel di corpo saturi, per squadra, sotto i quali l'istante non si
   giudica. Una figura a quaranta pixel ne porta qualche centinaio: mille
   sono all'incirca due figure intere per squadra, che e' il minimo con
   cui la parola «squadra» significa qualcosa. */
const PIXEL_MIN = +arg('pixel', 1000);
/* quanti istanti giudicabili servono perche' la corsa valga */
const ISTANTI_MIN = +arg('istantiMin', 2);

/* =====================================================================
   LA MISURA, DENTRO LA PAGINA. */
function misuraDivise(pixelMin) {
  const t = window.__test, G = t.G;
  const cv = document.querySelector('canvas');
  if (!cv) return { errore: 'nessuna tela' };
  const W = cv.width, H = cv.height;
  const rc = cv.getBoundingClientRect();
  const dpr = rc.width ? W / rc.width : (window.devicePixelRatio || 1);
  const ctx = cv.getContext('2d');
  let dati;
  try { dati = ctx.getImageData(0, 0, W, H).data; }
  catch (e) { return { errore: 'tela non leggibile: ' + e.message }; }

  const S2 = G.view.S2 || 1;
  const Ax = (G.view.Ax || 0) + (G.view.sx || 0);
  const Ay = (G.view.Ay || 0) + (G.view.sy || 0);
  const sx = x => (x * S2 + Ax) * dpr, sy = y => (y * S2 + Ay) * dpr;

  const mancanti = [];
  const P_DIS_ = (typeof P_DIS !== 'undefined') ? P_DIS : (mancanti.push('P_DIS'), 1.18);
  const RIG_H_ = (typeof RIG_H !== 'undefined') ? RIG_H : (mancanti.push('RIG_H'), 34);
  const RIG_PIEDI_ = (typeof RIG_PIEDI !== 'undefined') ? RIG_PIEDI : (mancanti.push('RIG_PIEDI'), 10);
  const RIG_YAW_K_ = (typeof RIG_YAW_K !== 'undefined') ? RIG_YAW_K : (mancanti.push('RIG_YAW_K'), Math.PI / 2);
  const rig = (typeof Rig3D !== 'undefined') ? Rig3D : null;
  const statoDi = (typeof rigStato === 'function') ? rigStato : null;
  if (!rig) mancanti.push('Rig3D');
  if (!statoDi) mancanti.push('rigStato');
  if (!rig || !statoDi) return { errore: 'mancano ' + mancanti.join(', ') };

  /* LA MASCHERA E' UNA SOLA FIGURA ALLA VOLTA, e non la silhouette di
     tutto il quadro: serve l'etichetta della squadra, e la silhouette
     intera la perde nel momento in cui due sagome si toccano. */
  const NERO = {
    maglia: '#000', maglia2: '#000', disegno: 'tinta',
    pantaloncini: '#000', calze: '#000', risvolto: '#000',
    pelle: '#000', capelli: '#000', scarpe: '#000',
    palla: null, taglio: 0,
  };
  const scr = document.createElement('canvas');

  /* due istogrammi di tinta a passo di venti gradi, uno per squadra, piu'
     il conto dei pixel di corpo (saturi e no) che li hanno riempiti */
  const isto = [new Float64Array(18), new Float64Array(18)];
  const sat = [0, 0], tot = [0, 0];
  const istoTutti = new Float64Array(18);

  const qx0 = (-Ax) / S2 - 34, qx1 = (W / dpr - Ax) / S2 + 34;
  const qy0 = (-Ay) / S2 - 34, qy1 = (H / dpr - Ay) / S2 + 34;
  let figure = 0;
  for (const p of G.players) {
    if (p.out > 0) continue;
    if (p.x < qx0 || p.x > qx1 || p.y < qy0 || p.y > qy1) continue;
    if (typeof fermoCoperto === 'function' && fermoCoperto(p)) continue;
    const pi = G.players.indexOf(p);
    const hasBall = G.ball && G.ball.owner === pi;
    const isCtrl = !G.cpu[p.team] && G.ctrl[p.team] === pi;
    const celeb = p.celeb > 0;
    const lod = !isCtrl && !hasBall && !celeb &&
      (typeof figuraLontana === 'function' ? figuraLontana(p) : false);
    const st = statoDi(p);
    let clip = st.clip, u = st.u;
    if (lod) { clip = 'fermo'; u = 0.30; }
    const gk = p.role === 'gk';
    let a;
    if (p.dive > 0 || (gk && p.recover > 0)) a = Math.atan2(p.diveDY, p.diveDX);
    else if (p.rove >= 0 || (p.charge >= 0 && p.chargeKind === 'rovesciata'))
      a = Math.atan2(-(p.roveDY || p.fy), -(p.roveDX || p.fx));
    else if (p.slide >= 0 || p.recover > 0) a = Math.atan2(p.slideDY || p.fy, p.slideDX || p.fx);
    else if (celeb) a = Math.PI / 2 + ((p.idx & 1) ? 0.38 : -0.38);
    else a = p.ang;
    const yaw = a + RIG_YAW_K_;
    const hPx = (RIG_H_ / (p.squash || 1)) * P_DIS_ * S2 * dpr;
    const gx = sx(p.x), gy = sy(p.y + RIG_PIEDI_ * P_DIS_);
    const box = Math.max(24, Math.ceil(hPx * 3));
    scr.width = box; scr.height = box;
    const s2 = scr.getContext('2d');
    const cxs = box / 2, cys = box * 0.72;
    const clipDef = rig.CLIPS[clip];
    if (!clipDef) continue;
    try {
      s2.save();
      const tilt = (typeof SAVE !== 'undefined' && SAVE.moto) ? (p.rollio || 0) * 0.30 : 0;
      if (tilt > 0.02 || tilt < -0.02) { s2.translate(cxs, cys); s2.rotate(tilt); s2.translate(-cxs, -cys); }
      rig.disegna(s2, cxs, cys, hPx, yaw, 'alto', clip, u / clipDef.freq, NERO, true, 1 / dpr);
      s2.restore();
    } catch (e) { continue; }
    const m = s2.getImageData(0, 0, box, box).data;
    const ox = Math.round(gx - cxs), oy = Math.round(gy - cys);
    const team = p.team | 0;
    let presi = 0;
    /* L'EROSIONE DI UN PIXEL, E NON E' PIGNOLERIA. Il bordo della sagoma
       e' antialias: meta' maglia e meta' erba, cioe' una tinta che non
       esiste addosso a nessuno. Su una figura di quaranta pixel il bordo
       e' un quinto dei pixel, abbastanza da spostare un istogramma. Si
       tengono solo i pixel pieni CIRCONDATI da pixel pieni. */
    for (let y = 1; y < box - 1; y++) {
      const fy = oy + y; if (fy < 0 || fy >= H) continue;
      for (let x = 1; x < box - 1; x++) {
        const j = (y * box + x) * 4 + 3;
        if (m[j] < 250) continue;
        if (m[j - 4] < 250 || m[j + 4] < 250 || m[j - box * 4] < 250 || m[j + box * 4] < 250) continue;
        const fx = ox + x; if (fx < 0 || fx >= W) continue;
        const k = (fy * W + fx) * 4;
        const r = dati[k] / 255, g = dati[k + 1] / 255, b = dati[k + 2] / 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
        tot[team]++; presi++;
        /* i pixel spenti non sono una divisa: il contorno nero, la suola
           delle scarpe, l'ombra interna al limite. Sotto saturazione 0,30
           o valore 0,12 non c'e' tinta da attribuire a nessuno. */
        if (mx < 0.12 || !d || d / mx < 0.30) continue;
        let h = 0;
        if (mx === r) h = 60 * (((g - b) / d) % 6);
        else if (mx === g) h = 60 * ((b - r) / d + 2);
        else h = 60 * ((r - g) / d + 4);
        if (h < 0) h += 360;
        const c = Math.min(17, Math.floor(h / 20));
        isto[team][c]++; sat[team]++;
        istoTutti[c]++;
      }
    }
    if (presi > 0) figure++;
  }

  if (sat[0] < pixelMin || sat[1] < pixelMin)
    return { giudicabile: false, sat: sat.slice(), tot: tot.slice(), figure };

  /* LA DISTANZA IN VARIAZIONE TOTALE fra i due istogrammi normalizzati */
  let tv = 0;
  for (let c = 0; c < 18; c++) tv += Math.abs(isto[0][c] / sat[0] - isto[1][c] / sat[1]);
  tv *= 0.5;

  /* la tinta dominante di ogni squadra, e la loro distanza circolare */
  const dom = [0, 1].map(k => {
    let mi = 0, mv = -1;
    for (let c = 0; c < 18; c++) if (isto[k][c] > mv) { mv = isto[k][c]; mi = c; }
    return mi * 20 + 10;
  });
  let dd = Math.abs(dom[0] - dom[1]); if (dd > 180) dd = 360 - dd;

  /* GLI ARCHI CONTIGUI, il numero del #151, tenuto per confrontabilita'.
     Si contano su tutte le figure insieme, si scartano le colonne sotto
     il cinque per cento e si ricuce il giro fra 340 e 0 gradi. */
  const totT = istoTutti.reduce((a, b) => a + b, 0) || 1;
  const vive = [];
  for (let c = 0; c < 18; c++) if (istoTutti[c] / totT >= 0.05) vive.push(c);
  const archi = [];
  for (const c of vive) {
    const prec = (c + 17) % 18;
    const dove = archi.find(a => a.indexOf(prec) >= 0);
    if (dove) dove.push(c); else archi.push([c]);
  }
  if (archi.length > 1) {
    const primo = archi[0], ultimo = archi[archi.length - 1];
    if (primo[0] === 0 && ultimo[ultimo.length - 1] === 17) { archi[archi.length - 1] = ultimo.concat(primo); archi.shift(); }
  }

  return {
    giudicabile: true, figure,
    tv: +tv.toFixed(4), dom, domDist: dd,
    sat: sat.slice(), tot: tot.slice(),
    archi: archi.length,
    istoA: Array.from(isto[0], v => +(v / sat[0]).toFixed(4)),
    istoB: Array.from(isto[1], v => +(v / sat[1]).toFixed(4)),
  };
}

/* ===================================================================== */
(async () => {
  let browser, srv;
  try {
    const { chromium } = require('playwright');
    srv = await servi();
    browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
    const pag = await ctx.newPage();
    await pag.addInitScript(bancoDiProva);
    await pag.addInitScript(semeFisso, SEME);
    const rel = path.relative(RADICE, path.resolve(RADICE, GIOCO)).split(path.sep).join('/');
    await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
    await posaFerma(pag, { secondi: PRIMO, taglia: 5, cpu: true });

    console.log('=== _q-divise — LE DUE SQUADRE SI DISTINGUONO? ===');
    console.log('  gioco: ' + rel + '   seme ' + SEME + ', taglia 5, ' + ISTANTI + ' istanti\n');

    const righe = [];
    for (let k = 0; k < ISTANTI; k++) {
      if (k > 0) await disegnaFermo(pag, { avanzaGioco: PASSO });
      const m = await pag.evaluate(misuraDivise, PIXEL_MIN);
      if (m.errore) { console.error('  BANCO: ' + m.errore); process.exit(2); }
      righe.push(m);
      if (!m.giudicabile) {
        console.log('  istante ' + (k + 1) + '  NON GIUDICABILE: pixel saturi per squadra ' +
                    m.sat[0] + ' / ' + m.sat[1] + ' (min ' + PIXEL_MIN + '), ' + m.figure + ' figure');
        continue;
      }
      const ok = m.tv >= TV_MIN && m.domDist >= DOM_MIN;
      console.log('  istante ' + (k + 1) + '  ' + (ok ? 'OK' : 'NO') +
                  '   TV ' + m.tv.toFixed(3) + ' (min ' + TV_MIN.toFixed(2) + ')' +
                  '   tinte dominanti ' + m.dom[0] + '° / ' + m.dom[1] + '° = ' + m.domDist + '° (min ' + DOM_MIN + '°)');
      console.log('              ' + m.figure + ' figure, pixel di corpo ' + m.tot[0] + ' / ' + m.tot[1] +
                  ' (saturi ' + m.sat[0] + ' / ' + m.sat[1] + '), archi di tinta ' + m.archi +
                  (m.archi < 2 ? '  ← UNO SOLO: le due squadre vestono uguale' : ''));
    }

    const buoni = righe.filter(r => r.giudicabile);
    if (buoni.length < ISTANTI_MIN) {
      console.log('\nPROVA NULLA: ' + buoni.length + ' istanti giudicabili su ' + ISTANTI +
                  ' (ne servono ' + ISTANTI_MIN + '). Non si da\' un verdetto su meno.');
      process.exit(3);
    }
    const mediana = a => { const s = a.slice().sort((x, y) => x - y); const n = s.length;
      return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
    const tvM = mediana(buoni.map(r => r.tv));
    const domM = mediana(buoni.map(r => r.domDist));
    const passati = buoni.filter(r => r.tv >= TV_MIN && r.domDist >= DOM_MIN).length;
    console.log('\n  MEDIANA su ' + buoni.length + ' istanti giudicabili:  TV ' + tvM.toFixed(3) +
                '   tinte dominanti a ' + domM + '°   ·   ' + passati + '/' + buoni.length + ' istanti passati');
    /* IL VERDETTO E' SULLA MEDIANA, NON SUL MINIMO. Un istante in cui una
       squadra e' quasi tutta fuori quadro porta la TV giu' per un fatto
       di inquadratura e non di divise, e un cancello che prende il minimo
       di quattro campioni diventa rumoroso senza dirlo. La mediana degli
       istanti giudicabili e' la stessa forma con cui `prestazione` e
       `_q-motori` leggono i loro tempi. */
    const verde = tvM >= TV_MIN && domM >= DOM_MIN;
    console.log(verde
      ? '\nOK — le due squadre si distinguono sullo schermo.'
      : '\nROSSO — le due squadre NON si distinguono sullo schermo: TV ' + tvM.toFixed(3) +
        ' (min ' + TV_MIN.toFixed(2) + '), tinte dominanti a ' + domM + '° (min ' + DOM_MIN + '°).');
    await browser.close(); srv.chiudi();
    process.exit(verde ? 0 : 1);
  } catch (e) {
    try { if (browser) await browser.close(); } catch (_) {}
    try { if (srv) srv.chiudi(); } catch (_) {}
    console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
    process.exit(2);
  }
})();
