/* =====================================================================
   _COLORE — LO STESSO FOGLIO, DIPINTO COME IN PARTITA.

   PERCHE' ESISTE. `strumenti/silhouette.js` stampa dieci azioni in NERO
   PIENO su BIANCO, a quaranta pixel, e tre persone in cieco ne hanno
   nominate fra zero e due. Prima di riscrivere le pose bisogna sapere
   CHE COSA ha fallito: la posa, o l'astrazione. Una sagoma nera isolata
   su bianco toglie al giocatore tutto quello che in partita lo aiuta —
   il colore della divisa, il manto, l'ombra, il pallone — e chiedere a
   un estraneo di nominare un gesto senza nessuno di quegli indizi e' una
   prova piu' severa del reale.

   Questo attrezzo produce il SECONDO FOGLIO: le STESSE DIECI AZIONI,
   nello stesso ordine, alla stessa scala, nelle stesse celle, ma
   dipinte come le dipinge la partita. Se le stesse pose diventano
   nominabili, il difetto stava nell'astrazione e il gioco va bene.
   Se restano illeggibili, il difetto e' nelle pose.

   =====================================================================
   COME SI TIENE FERMO IL CONFRONTO (e' tutto il valore della prova).

   Le pose NON si riscrivono qui. Si apre la pagina con
   ?banco=silhouette — lo STESSO banco che fa il foglio nero — si legge
   dal suo JSON la lista delle dieci celle (clip, fase, ordine) e si
   ridisegna con la STESSA trasformazione: stessa Rig3D.disegna, stessa
   camera 'alto', stesso yaw 0,95, stessa corporatura 3, stesso
   RIG_H x P_DIS = 40 px, stesse celle 104x124 su una griglia 5x2.

   L'UNICA cosa che cambia e' il LOOK: dove il banco nero scriveva '#000'
   in ogni campo, qui ci sono i colori veri (TEAMCOL della squadra di
   casa, kit del portiere per le due celle del portiere). taglio, corp e
   varb restano IDENTICI a quelli del banco nero — sono i tre campi che
   toccano la GEOMETRIA della sagoma, e cambiarli vorrebbe dire cambiare
   la posa di nascosto.

   Il foglio esce con:
     · IL MANTO VERO. Non un verde piatto: paintField, lo stesso pennello
       procedurale che cuoce fieldTex in partita, dipinto a scala 1 (un
       pixel per unita' di campo: e' la scala a cui in partita la figura
       misura RIG_H x P_DIS). Sopra, il velo del calcio d'inizio
       (veloBaseA(0)), che e' la passata che in partita sta SOTTO i
       corpi. Il ritaglio di prato si sceglie da solo: fra i candidati si
       prende quello con meno gesso dentro, cosi' nessuna riga di campo
       taglia una figura.
     · L'OMBRA. Due modi, e si sceglie da riga di comando:
         --ombra lunga  (predefinito) l'ombra della PARTITA: stessa
                        ombraGeometria(), stesse ombraLungaTex/ombraTex,
                        stessa ombraAlfa(), stessa aritmetica di
                        drawOmbreGiocatori per una figura a terra.
         --ombra rig    l'ellisse che Rig3D.disegna sa fare da sola
                        (senzaOmbra=false): piu' compatta, e sui corpi in
                        volo si STACCA, che e' l'indizio d'aria.
     · IL PALLONE, dove l'azione lo prevede. La POSIZIONE non se la
       inventa questo attrezzo: la da' clip.palla(u) del rig — la stessa
       traiettoria che la libreria usa per la palla della clip —
       proiettata con la stessa formula di Rig3D.disegna. Il DISEGNO e'
       quello della partita: pallone() al raggio pallaRD(), con l'ombra
       di ombraTex e l'alone di staccoTex, esattamente come drawBallAt.
       (Il rig ha una palla sua, ma minuscola: sei pixel contro i
       ventuno che il giocatore vede in campo. In partita vale
       l'adattamento (a) — look.palla=null, la palla la disegna
       drawBall — e qui si fa lo stesso.)
       Le clip che una palla ce l'hanno sono tre: le due del tiro e
       quella del tuffo. Alla scivolata la palla la mette questo
       attrezzo, ed e' l'UNICA licenza del foglio: posata a terra appena
       oltre la punta del piede teso, con la direzione presa dai giunti
       veri (Rig3D.giunti(): pelvi -> punta). E' dichiarata qui perche'
       chi legge il rapporto sappia distinguere cio' che dice il gioco da
       cio' che dice l'attrezzo. Le altre sei celle NON hanno palla:
       aggiungerne una a «corre» o a «cammina» cambierebbe il verbo
       (chi corre con la palla CONDUCE, ed e' un'altra azione), e un
       foglio che cambia le azioni non e' piu' confrontabile col nero.

   =====================================================================
   LA PROVA CHE IL CONFRONTO SIA ONESTO, e non e' un'opinione.

   Un foglio a colori che mostrasse pose anche solo leggermente diverse
   renderebbe il provino inutile senza che si veda. Percio' prima di
   scrivere il PNG l'attrezzo misura, cella per cella, DUE cose:

     1. LA SCATOLA. Ogni figura viene ridisegnata una seconda volta su
        fondo trasparente, col look a colori ma senza manto, senza ombra
        e senza palla, e se ne misura la scatola (alpha > 128). La si
        confronta con quella che il banco nero ha DICHIARATO nel suo
        JSON (bw x bh) e con la posizione dell'angolo. Tolleranza: 1 px.
     2. LA MASCHERA. Non basta la scatola: due pose diverse possono
        avere la stessa scatola. Si decodifica anche il PNG NERO, si
        estrae la sua maschera cella per cella, e si calcola
        l'intersezione su unione con la maschera a colori. Sotto 0,97
        l'attrezzo si ferma e NON scrive il foglio.

   Se una sola delle due misure non torna, il messaggio e' esplicito e
   il file non si scrive: meglio nessun foglio che un foglio che sembra
   confrontabile e non lo e'.

   NON STAMPA LA CHIAVE. Al foglio nuovo deve fare un provino cieco una
   persona che non deve poter trovare la risposta: qui le celle si
   chiamano 1..10 e basta. La chiave esiste gia', ed e' quella che
   stampa silhouette.js.

   USO:  node strumenti/_colore.js
         node strumenti/_colore.js --ombra rig
         node strumenti/_colore.js --dir foto-figure2-dopo
         node strumenti/_colore.js --file ALTRO.html
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
const DIR = arg('dir', 'foto-figure2-dopo');
const FILE = arg('file', 'CALCETTO-il-gioco.html');
const OMBRA = arg('ombra', 'lunga') === 'rig' ? 'rig' : 'lunga';
const TOLL_PX = 1;        // scarto massimo ammesso sulla scatola, in pixel
const IOU_MIN = 0.97;     // sovrapposizione minima fra maschera nera e maschera a colori

/* il server: la pagina non si apre da file:// (il browser non le da'
   canvas leggibili) e serve il cache-busting. Porta effimera, cosi' un
   server del committente gia' acceso non da' fastidio a nessuno. */
function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(RADICE, u === '/' ? 'index.html' : u);
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

/* =====================================================================
   IL COSTRUTTORE, che gira DENTRO la pagina.
   Sta in una stringa sola perche' e' un solo page.evaluate: tutto quello
   che tocca (Rig3D, paintField, pallone, ombraLungaTex, TEAMCOL...) vive
   nello scope globale della pagina e non si puo' importare da fuori.
   ===================================================================== */
const COSTRUISCI = async ({ celle, pngNero, modoOmbra }) => {
  const out = { err: null, note: [] };
  try {
    const COL = 5, RIG = 2, CW = 104, CH = 124, N = celle.length;
    const YAW = 0.95, CORP = 3;

    /* ---- 1. IL LOOK A COLORI. taglio/corp/varb IDENTICI al banco nero:
       sono i tre campi che muovono la geometria della sagoma. ---- */
    const base = Rig3D.lookPredefinito;
    const c1 = (typeof TEAMCOL !== 'undefined' && TEAMCOL[0]) || base.maglia;
    const c2 = (typeof TEAMCOL2 !== 'undefined' && TEAMCOL2[0]) || base.maglia2;
    const pat = (typeof TEAMPAT !== 'undefined') ? (TEAMPAT[0] | 0) : 1;
    let g1 = '#f2f5ef', g2 = '#5a5a5a';
    try { const a = gkKit(0, 0), b = gkKit(0, 1); if (a) g1 = a; if (b) g2 = b; } catch (e) { }
    const lookDi = (gk) => ({
      maglia: gk ? g1 : c1, maglia2: gk ? g2 : c2,
      disegno: gk ? 'tinta' : (pat === 1 ? 'strisce' : pat === 2 ? 'fascia' : 'tinta'),
      pantaloncini: gk ? g2 : c2, calze: gk ? g1 : c1, risvolto: gk ? g1 : c2,
      pelle: base.pelle, capelli: base.capelli, scarpe: '#15181a',
      palla: null,                 /* adattamento (a): la palla la mette la partita */
      taglio: 0, corp: CORP, varb: 0,
    });
    const GK = { attesaGK: 1, tuffo: 1 };
    const looks = celle.map(c => lookDi(!!GK[c.clip]));

    /* ---- 2. IL MANTO. paintField a scala 1, poi il velo del calcio
       d'inizio: e' la stessa passata che in partita sta SOTTO i corpi. ---- */
    const TH = FIELDS[clamp(G.fieldIdx | 0, 0, FIELDS.length - 1)].th;
    const PW = FW + PADX * 2, PH = FH + PADY * 2;
    const pcv = document.createElement('canvas');
    pcv.width = PW; pcv.height = PH;
    const pg = pcv.getContext('2d', { willReadFrequently: true });
    pg.setTransform(1, 0, 0, 1, PADX, PADY);
    paintField(pg, TH, PADX, PADY, 1, true);
    pg.setTransform(1, 0, 0, 1, 0, 0);
    pg.fillStyle = 'rgba(30,36,54,' + veloBaseA(0).toFixed(4) + ')';
    pg.fillRect(0, 0, PW, PH);

    /* IL RITAGLIO SI SCEGLIE DA SOLO. Un pezzo di prato con dentro la
       riga di centrocampo o il dischetto metterebbe un tratto bianco
       attraverso una figura, e sarebbe rumore che il foglio nero non ha.
       Si scandiscono i candidati dentro il rettangolo di gioco e si
       prende quello con meno pixel chiari (il gesso). */
    const SW = COL * CW, SH = RIG * CH;
    /* si scarta il GESSO (pixel chiari: righe, dischetto) e anche lo SCURO
       (la rete della porta, il bordo delle gradinate): tutt'e due sono
       strutture che il foglio nero non ha, e una rete a maglie dietro una
       figura e' rumore che nessuno dei due provini deve pagare. */
    let bx = PADX + 40, by = PADY + 40, bSporco = Infinity, bGe = 0, bSc = 0;
    const X0 = PADX + Math.round(FW * 0.18), X1 = PADX + FW - Math.round(FW * 0.18) - SW;
    const Y0 = PADY + Math.round(FH * 0.06), Y1 = PADY + FH - Math.round(FH * 0.06) - SH;
    for (let y = Math.round(Y0); y <= Y1; y += 24) {
      for (let x = Math.round(X0); x <= X1; x += 32) {
        const d = pg.getImageData(x, y, SW, SH).data;
        let ge = 0, sc = 0;
        for (let k = 0; k < d.length; k += 16) {   /* un pixel ogni quattro: basta */
          const L = 0.30 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2];
          if (L > 140) ge++; else if (L < 34) sc++;
        }
        if (ge + sc < bSporco) { bSporco = ge + sc; bx = x; by = y; bGe = ge; bSc = sc; }
      }
    }
    out.note.push('prato: ritaglio ' + SW + 'x' + SH + ' preso a (' + Math.round(bx - PADX) +
      ',' + Math.round(by - PADY) + ') del rettangolo di gioco — ' + bGe +
      ' campioni di gesso e ' + bSc + ' di scuro, su ' + Math.round(SW * SH / 4) + ' campionati');

    /* ---- 3. IL FOGLIO ---- */
    const cv = document.createElement('canvas');
    cv.width = SW; cv.height = SH;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(pcv, bx, by, SW, SH, 0, 0, SW, SH);

    /* le tessiture della partita, cotte se non lo sono gia' */
    if (typeof buildOmbraTex === 'function' && !ombraTex) buildOmbraTex();
    if (typeof buildOmbraLungaTex === 'function' && !ombraLungaTex) buildOmbraLungaTex();
    if (typeof buildStaccoTex === 'function' && !staccoTex) buildStaccoTex();

    const cam = Rig3D.CAMERE.alto;
    const ceCl = cam.ce < 0.58 ? 0.58 : cam.ce;
    const SCA = RIG_H / (1.9 * ceCl);       // la stessa s di Rig3D.disegna
    const cyw = Math.cos(YAW), syw = Math.sin(YAW);
    const RPALLA = 0.11;                    // raggio della palla in unita' rig (Rig3D)

    /* L'OMBRA DELLA PARTITA per una figura a terra: e' drawOmbreGiocatori
       con h=0 (nessun salto), velocita' nulla (nessuna stretta) e una sola
       figura. GEO, le due tessiture e l'alfa sono quelle del gioco. */
    const GEO = ombraGeometria(), OMA = ombraAlfa();
    function ombraLunga(cx, cyPiedi) {
      const px = cx, py = cyPiedi - RIG_PIEDI;      // il centro-corpo come in partita
      const fx = px + GEO.piedeX, fy = py + GEO.piedeY;
      const C = GEO.ux, S = GEO.uy;
      const X = fx * C + fy * S, Y = -fx * S + fy * C;
      g.save(); g.rotate(GEO.rot);
      g.globalAlpha = OMA;
      g.drawImage(ombraLungaTex, X - GEO.lungRiposo * 0.1455, Y - GEO.semiCorto,
        GEO.lungRiposo * 1.164, GEO.semiCorto * 2);
      const cx2 = px, cy2 = py + 7.0;
      const CX = cx2 * C + cy2 * S, CY = -cx2 * S + cy2 * C;
      g.globalAlpha = OMA * 0.80;
      g.drawImage(ombraTex, CX - 10, CY - 5.6, 20, 11.2);
      g.globalAlpha = 1; g.restore();
    }

    /* IL PALLONE della partita, posato dove la clip lo mette. */
    const RD = pallaRD();
    function palloneA(sx, sy, terrenoY, zRig) {
      const z = zRig * (RIG_H / 1.9);              // quota in unita' di campo
      const k = 1 + z * 0.012, q = z > 0 ? z : 0;
      const oK = 1 + 0.35 * solePiuBasso();
      const ox = sx + (3.0 + q * 0.20) * oK, oy = terrenoY + 5.6;
      const gg = B_DIS, r = 70 / (70 + q), a = 0.96 * 70 / (70 + 1.1 * q);
      g.globalAlpha = a;
      g.drawImage(ombraTex, ox - 10.8 * gg * r, oy - 5.0 * gg * r, 21.6 * gg * r, 10.0 * gg * r);
      const ac = 0.62 * (1 - q / 9);
      if (ac > 0.02) {
        g.globalAlpha = ac;
        g.drawImage(ombraTex, ox - 5.4 * gg * r, oy - 2.6 * gg * r, 10.8 * gg * r, 5.2 * gg * r);
      }
      const ar = RD * k * 1.7;
      g.globalAlpha = 0.55;
      g.drawImage(staccoTex, sx - ar, sy - ar, ar * 2, ar * 2);
      g.globalAlpha = 1;
      pallone(sx, sy, RD * k, 0.6, 0, 0, g);
    }

    /* LA PALLA DELLA CLIP, proiettata con la formula di Rig3D.disegna.
       `u` e' la FASE (0..1), la stessa che disegna() ricava da tSec: passare
       qui il tSec invece della fase sposta la palla in un altro istante del
       gesto — e' l'errore che al primo giro metteva la palla del tuffo due
       celle piu' in la'. */
    const PB = new Float32Array(4);
    function pallaDellaClip(clip, u, cx, cy) {
      const cl = Rig3D.CLIPS[clip];
      if (!cl || !cl.palla) return null;
      cl.palla(u, PB);
      let x = PB[0]; const y = PB[1], z = PB[2];
      let wq = (0.56 - (y - RPALLA)) * 2.2;
      if (wq > 0) { if (wq > 1) wq = 1; x += 0.085 * syw * wq; }
      const xw = x * cyw + z * syw, zw = z * cyw - x * syw;
      return { sx: cx + xw * SCA, sy: cy - (y * cam.ce + zw * cam.se) * SCA,
               ty: cy - zw * cam.se * SCA, z: y };
    }

    function disegnaFigura(ctx2, i, cx, cy, senzaOmbra) {
      const c = celle[i];
      ctx2.save();
      ctx2.translate(cx, cy); ctx2.scale(P_DIS, P_DIS); ctx2.translate(-cx, -cy);
      Rig3D.disegna(ctx2, cx, cy, RIG_H, YAW, 'alto', c.clip,
        c.u / Rig3D.CLIPS[c.clip].freq, looks[i], senzaOmbra, P_DIS);
      return ctx2;   /* il restore lo fa il chiamante: serve la trasformazione */
    }

    for (let i = 0; i < N; i++) {
      const cx = (i % COL) * CW + CW / 2, cy = ((i / COL) | 0) * CH + CH - 14;
      const c = celle[i];
      /* tutto quel che segue vive nella trasformazione della cella, cosi'
         ombra, figura e pallone stanno alla stessa scala della figura */
      g.save();
      g.translate(cx, cy); g.scale(P_DIS, P_DIS); g.translate(-cx, -cy);
      if (modoOmbra === 'lunga') ombraLunga(cx, cy);
      Rig3D.disegna(g, cx, cy, RIG_H, YAW, 'alto', c.clip,
        c.u / Rig3D.CLIPS[c.clip].freq, looks[i], modoOmbra === 'lunga', P_DIS);
      /* LA PALLA SI DISEGNA SOLO SE CADE NELLA PROPRIA CELLA. La
         traiettoria della clip e' quella del gioco e non si tocca, ma dopo
         l'impatto del tiro la palla percorre in fretta piu' di mezzo campo:
         disegnata com'e', finirebbe addosso all'azione della cella accanto e
         le cambierebbe il verbo. Quando esce, non si disegna e si DICE. */
      const cellaX0 = (i % COL) * CW, cellaY0 = ((i / COL) | 0) * CH;
      const dentro = (x, y) => x >= cellaX0 && x < cellaX0 + CW && y >= cellaY0 && y < cellaY0 + CH;
      const p = pallaDellaClip(c.clip, c.u % 1, cx, cy);
      if (p && dentro(p.sx, p.sy)) { palloneA(p.sx, p.sy, p.ty, p.z); out.palle = (out.palle || []).concat(i + 1); }
      else if (p) out.fuori = (out.fuori || []).concat(i + 1);
      else if (c.clip === 'scivolata') {
        /* L'UNICA PALLA CHE METTE L'ATTREZZO. Direzione dai giunti veri:
           dalla pelvi alla punta piu' lontana, posata a terra appena oltre
           lo scarpino. La scivolata e' l'azione che i due provini ciechi
           hanno confuso col tuffo, e in partita cio' che le distingue e'
           dove sta la palla. */
        const J = Rig3D.giunti(), n = J.nomi;
        const px = J.x[n.PELVIS], py = J.y[n.PELVIS];
        let tx = J.x[n.TOL], ty = J.y[n.TOL];
        if (Math.hypot(J.x[n.TOR] - px, J.y[n.TOR] - py) > Math.hypot(tx - px, ty - py))
          { tx = J.x[n.TOR]; ty = J.y[n.TOR]; }
        const dx = tx - px, dy = ty - py, L = Math.hypot(dx, dy) || 1;
        const sx = tx + dx / L * (RD * 0.95), sy = ty + dy / L * (RD * 0.55);
        if (dentro(sx, sy)) { palloneA(sx, sy, sy + RD * 0.35, 0); out.attrezzo = i + 1; }
      }
      g.restore();
    }

    /* ---- 4. LA PROVA: scatola e maschera, contro il foglio nero ---- */
    const mcv = document.createElement('canvas');
    mcv.width = SW; mcv.height = SH;
    const mg = mcv.getContext('2d', { willReadFrequently: true });
    for (let i = 0; i < N; i++) {
      const cx = (i % COL) * CW + CW / 2, cy = ((i / COL) | 0) * CH + CH - 14;
      mg.save();
      mg.translate(cx, cy); mg.scale(P_DIS, P_DIS); mg.translate(-cx, -cy);
      Rig3D.disegna(mg, cx, cy, RIG_H, YAW, 'alto', celle[i].clip,
        celle[i].u / Rig3D.CLIPS[celle[i].clip].freq, looks[i], true, P_DIS);
      mg.restore();
    }
    const dCol = mg.getImageData(0, 0, SW, SH).data;

    const im = new Image();
    await new Promise((ok, ko) => { im.onload = ok; im.onerror = ko; im.src = pngNero; });
    if (im.width !== SW || im.height !== SH) {
      out.err = 'il foglio nero misura ' + im.width + 'x' + im.height + ' invece di ' + SW + 'x' + SH;
      return out;
    }
    const ncv = document.createElement('canvas');
    ncv.width = SW; ncv.height = SH;
    const ng = ncv.getContext('2d', { willReadFrequently: true });
    ng.drawImage(im, 0, 0);
    const dNer = ng.getImageData(0, 0, SW, SH).data;

    const scatola = (d, x0, y0) => {
      let mnx = 1e9, mxx = -1, mny = 1e9, mxy = -1, tot = 0;
      for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CW; x++)
        if (d[(y * SW + x) * 4 + 3] > 128) {
          tot++; if (x < mnx) mnx = x; if (x > mxx) mxx = x;
          if (y < mny) mny = y; if (y > mxy) mxy = y;
        }
      return tot ? { x: mnx - x0, y: mny - y0, w: mxx - mnx + 1, h: mxy - mny + 1, tot } : null;
    };
    out.prova = [];
    for (let i = 0; i < N; i++) {
      const x0 = (i % COL) * CW, y0 = ((i / COL) | 0) * CH;
      const A = scatola(dCol, x0, y0), B = scatola(dNer, x0, y0);
      let inter = 0, unione = 0;
      for (let y = y0; y < y0 + CH; y++) for (let x = x0; x < x0 + CW; x++) {
        const k = (y * SW + x) * 4 + 3;
        const a = dCol[k] > 128 ? 1 : 0, b = dNer[k] > 128 ? 1 : 0;
        if (a & b) inter++; if (a | b) unione++;
      }
      out.prova.push({
        i, col: A, ner: B, dich: { w: celle[i].bw, h: celle[i].bh },
        iou: unione ? inter / unione : 0
      });
    }
    out.png = cv.toDataURL('image/png');
    out.w = SW; out.h = SH;
  } catch (e) { out.err = (e && e.message) || String(e); out.stack = e && e.stack; }
  return out;
};

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const pgn = await br.newPage();
  const righe = [];
  pgn.on('console', m => righe.push(m.text()));
  pgn.on('pageerror', e => righe.push('ERRORE ' + e.message));
  await pgn.goto(`http://127.0.0.1:${srv.porta}/${FILE}?banco=silhouette&t=${Date.now()}`);
  await pgn.waitForTimeout(3000);

  const riga = righe.find(r => r.startsWith('[silhouette] '));
  const pngR = righe.find(r => r.startsWith('[silhouette-png] '));
  if (!riga || !pngR) {
    console.log('BANCO MUTO — ?banco=silhouette non ha stampato ne\' i numeri ne\' il foglio.');
    for (const r of righe.slice(0, 12)) console.log('   ' + r);
    await br.close(); srv.chiudi(); process.exit(1);
  }
  const d = JSON.parse(riga.slice(13));
  const pngNero = pngR.slice(pngR.indexOf('data:'));
  /* SOLO clip, fase e scatola: il nome dell'azione non entra nemmeno in
     memoria qui dentro, cosi' nessuna riga stampata puo' farselo scappare */
  const celle = d.fig.map(f => ({ clip: f.clip, u: f.u, bw: f.bw, bh: f.bh }));

  const r = await pgn.evaluate(COSTRUISCI, { celle, pngNero, modoOmbra: OMBRA });
  await br.close(); srv.chiudi();

  console.log('\n=== _COLORE — le stesse dieci azioni, dipinte come in partita ===');
  if (r.err) {
    console.log('\nFALLITO: ' + r.err);
    if (r.stack) console.log(r.stack.split('\n').slice(0, 5).join('\n'));
    process.exit(1);
  }
  for (const n of r.note) console.log('  ' + n);
  console.log('  ombra: ' + (OMBRA === 'lunga'
    ? 'quella della partita (ombraGeometria + ombraLungaTex + ombraTex)'
    : 'l\'ellisse che Rig3D disegna da sola'));
  console.log('  pallone: ' + ((r.palle || []).length
    ? 'celle ' + (r.palle || []).join(', ') + ' — posizione data da clip.palla() del rig'
    : 'nessuna cella lo prevede'));
  /* si dice CHE cella, non che cosa ci fa la figura: il numero e' gia'
     visibile sul foglio, il gesto no, e questa uscita non deve poter
     diventare mezza chiave di risposta */
  if (r.attrezzo) console.log('           cella ' + r.attrezzo +
    ' — palla posata dall\'ATTREZZO e non dal gioco: quella clip non ha una\n' +
    '           palla sua. La posizione viene dai giunti veri (Rig3D.giunti()),\n' +
    '           ed e\' l\'unica licenza del foglio — vedi il cappello del file');
  if (r.fuori) console.log('           celle ' + r.fuori.join(', ') +
    ' — la palla della clip cade FUORI dalla cella e non e\' disegnata:\n' +
    '           disegnarla vorrebbe dire metterla addosso all\'azione accanto');

  /* ---- LA PROVA CHE LE POSE SIANO LE STESSE ---- */
  console.log('\nLA PROVA — il foglio nuovo deve mostrare le STESSE pose del nero.');
  console.log('  Ogni figura e\' ridisegnata a parte, senza manto, senza ombra e senza');
  console.log('  palla: quella maschera si confronta con la cella del PNG nero e con la');
  console.log('  scatola che il banco ha dichiarato.\n');
  console.log('  cella   colore     nero    dichiarata   scarto      IoU');
  let male = 0;
  for (const p of r.prova) {
    if (!p.col || !p.ner) {
      console.log(`   ${String(p.i + 1).padStart(2)}     ${p.col ? 'ok' : 'VUOTA'}      ${p.ner ? 'ok' : 'VUOTA'}   — cella senza figura`);
      male++; continue;
    }
    const dw = Math.abs(p.col.w - p.ner.w), dh = Math.abs(p.col.h - p.ner.h);
    const dx = Math.abs(p.col.x - p.ner.x), dy = Math.abs(p.col.y - p.ner.y);
    const dd = Math.abs(p.ner.w - p.dich.w) + Math.abs(p.ner.h - p.dich.h);
    const ko = dw > TOLL_PX || dh > TOLL_PX || dx > TOLL_PX || dy > TOLL_PX ||
      dd > 0 || p.iou < IOU_MIN;
    if (ko) male++;
    console.log(`   ${String(p.i + 1).padStart(2)}    ${String(p.col.w + 'x' + p.col.h).padStart(7)}` +
      `  ${String(p.ner.w + 'x' + p.ner.h).padStart(7)}    ${String(p.dich.w + 'x' + p.dich.h).padStart(7)}` +
      `    ${dw}x${dh} +${dx},${dy}   ${p.iou.toFixed(4)}${ko ? '   FUORI' : ''}`);
  }
  if (male) {
    console.log(`\n${male} celle su ${r.prova.length} NON coincidono col foglio nero.`);
    console.log('Il foglio a colori NON e\' stato scritto: mostrerebbe pose diverse da quelle');
    console.log('del provino nero, e il confronto fra i due provini non varrebbe niente.');
    console.log(`(tolleranza: ${TOLL_PX} px sulla scatola e sull'angolo, IoU minima ${IOU_MIN})`);
    process.exit(1);
  }
  const iouMin = Math.min(...r.prova.map(p => p.iou));
  console.log(`\n  TUTTE E ${r.prova.length} COINCIDONO. Scatole identiche entro ${TOLL_PX} px, ` +
    `IoU peggiore ${iouMin.toFixed(4)}\n  (minimo richiesto ${IOU_MIN}). Le pose sono le stesse: ` +
    `cambia solo come sono dipinte.`);

  fs.mkdirSync(path.join(RADICE, DIR), { recursive: true });
  const dove = path.join(RADICE, DIR, 'colore.png');
  fs.writeFileSync(dove, Buffer.from(r.png.slice(r.png.indexOf(',') + 1), 'base64'));
  console.log(`\n  foglio a colori (${r.w}x${r.h}, celle 104x124): ${dove}`);
  console.log('  Nessuna chiave qui dentro: al provino cieco si mostra il foglio e basta.');
  console.log('  La chiave delle dieci azioni la stampa strumenti/silhouette.js.\n');
})();
