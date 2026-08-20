/* =====================================================================
   _q-regia.js — IL CANCELLO DELLA REGIA: gli stacchi si CONTANO sui
   fotogrammi, non si dichiarano.

   LA VOCE (censimento 20 ago 2026, §2.5): il riferimento commerciale
   stacca la regia 2,16 volte al minuto; questo gioco ha UNA camera che
   non stacca mai (stacchi per partita: 0) e una moviola con UNA sola
   inquadratura. La toppa _t-regia.js promette: stacchi nei momenti in
   cui nessuno comanda (moviola e calcio d'inizio), MAI durante il gioco
   attivo, e tre inquadrature dentro la moviola.

   COSA MISURA QUESTO CANCELLO (tutto a passo fisso e seme fisso, quindi
   ripetibile; il verdetto legge la TRAIETTORIA DELLA CAMERA — G.cam,
   che e' simulazione — e i PIXEL della tela, mai una bandiera scritta
   dal codice che giudica):

     1. STACCO = salto della camera fra due fotogrammi consecutivi:
        zoom che cambia di >= 10% in un fotogramma, oppure pan che salta
        di > 88 px CSS. Le soglie stanno SOPRA tutto cio' che le molle
        del gioco possono fare in un fotogramma (il pan e' tappato a
        1250*dt/S2 unita' = 20,8 px; lo zoom di gioco muove il 2,5% del
        residuo) e SOTTO i salti che la toppa promette (>= 18% di zoom).
     2. GIOCO ATTIVO INTONSO: zero stacchi quando la scena e' play o
        golden. E' il patto della voce: chi conduce non perde il quadro.
     3. LA MOVIOLA A INQUADRATURE: i campioni con moviola attiva vengono
        segmentati sugli stacchi; si contano i segmenti (>= 5 fotogrammi
        l'uno) e si pretende che gli zoom mediani dei segmenti siano
        DISTINTI (rapporto >= 1,08 a coppie). Oggi: 1 segmento.
     4. LEGGIBILITA' DI OGNI STACCO (taglia 5, scenario pilotato): al
        primo fotogramma dopo lo stacco il SOGGETTO sta nel terzo
        centrale del quadro (le due misure di casa) e il suo contrasto
        contro cio' che lo circonda e' >= 3:1 (luminanza relativa WCAG,
        mediana del disco del soggetto contro mediana dell'anello
        intorno). Soggetti: il PALLONE (kickoff, totale, stretta) e il
        TORSO DEL MARCATORE (fotogramma della rete). Sul fotogramma
        della rete il gioco dichiara un lampo di 0,09 s: la misura si
        prende 6 fotogrammi dopo lo stacco, a inquadratura ferma.
     5. TOTALE: in uno scenario con un gol e la sua moviola gli stacchi
        contati (kickoff + moviola) devono essere >= 4. Oggi: 0.

   CONTROLLI NEGATIVI (uno strumento mai visto fallire non e' uno
   strumento):
     N1  si INIETTA un salto di 260 px nella camera durante il gioco e
         il rilevatore DEVE vederlo (poi quei fotogrammi si escludono
         dal verdetto 2, perche' il salto l'abbiamo fatto noi);
     N2  il metro del contrasto puntato su erba contro erba DEVE dire
         un numero sotto il 3:1 — cioe' sa dire di no.
   E il ROSSO SUL GIOCO DI OGGI e' esso stesso il controllo del prima:
   0 stacchi e 1 inquadratura sono i numeri del censimento.

   uso:
     node strumenti/_q-regia.js --gioco fuori/CALCETTO-originale-30279089.html
     node strumenti/_q-regia.js --gioco fuori/regia.html
     opzioni: --solo 5     una sola taglia
              --foto <dir> salva i PNG dei fotogrammi degli stacchi
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');
const SOLO = +arg('solo', 0) || 0;
const FOTO = arg('foto', '');
const SEME = 20260820;

/* le soglie del rilevatore — vedi il cappello per il perche' dei numeri */
const SOGLIA_PAN = 88;      // px CSS in un fotogramma
const SOGLIA_ZOOM = 1.10;   // rapporto di zoom in un fotogramma
const MIN_STACCHI = 4;      // per lo scenario con un gol
const MIN_INQ = 3;          // inquadrature distinte nella moviola
const CONTRASTO_MIN = 3.0;  // la misura di casa
const RATIO_INQ = 1.08;     // zoom mediani distinti fra segmenti

/* ------------------------------------------------------------------ */
function stacco(a, b) {
  if (!a || !b || !a.z || !b.z) return false;
  const S2 = Math.max(a.S2 || 0, b.S2 || 0) || 1;
  const zr = Math.max(b.z / a.z, a.z / b.z);
  const dx = Math.abs(b.x - a.x) * S2, dy = Math.abs(b.y - a.y) * S2;
  return zr >= SOGLIA_ZOOM || dx > SOGLIA_PAN || dy > SOGLIA_PAN;
}

/* i segmenti della moviola: campioni contigui con moviola attiva,
   spezzati dove il rilevatore vede uno stacco */
function segmentiMoviola(tr) {
  const moviole = [];
  let corr = null;
  for (let i = 0; i < tr.length; i++) {
    const c = tr[i];
    if (c.mv) {
      if (!corr) { corr = { segs: [[]], stacchi: 0 }; moviole.push(corr); }
      else if (stacco(tr[i - 1], c) && tr[i - 1].mv) { corr.segs.push([]); corr.stacchi++; }
      corr.segs[corr.segs.length - 1].push(c);
    } else corr = null;
  }
  for (const m of moviole) {
    m.segs = m.segs.filter(s => s.length >= 5);
    const med = s => { const v = s.map(q => q.z).sort((x, y) => x - y); return v[v.length >> 1]; };
    m.zooms = m.segs.map(med);
    m.distinte = 0;
    /* quante inquadrature DISTINTE: catena golosa sui mediani ordinati */
    const zs = m.zooms.slice().sort((x, y) => x - y);
    let ult = -1;
    for (const z of zs) { if (ult < 0 || z / ult >= RATIO_INQ) { m.distinte++; ult = z; } }
  }
  return moviole;
}

(async () => {
  const t0 = Date.now();
  const srv = await servi();
  const br = await chromium.launch();
  const esiti = [];
  const di = (nome, ok, testo) => { esiti.push({ nome, ok });
    console.log(`  ${ok ? 'OK  ' : 'NO  '} ${nome}: ${testo}`); };

  async function apri(taglia) {
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 },
      deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    const errori = [];
    pag.on('pageerror', e => errori.push(String(e)));
    await pag.addInitScript(semeFisso, SEME);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}?t=${Date.now()}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    /* =================================================================
       LA RICOTTURA DEI FONT VA ASPETTATA PRIMA DEL VIA — scoperta di
       questo cancello, stessa famiglia della "tenda" di _posa.js.
       All'arrivo dei woff2 (document.fonts.ready, orologio VERO) il
       gioco ricuoce il manto con requestIdleCallback, e buildFieldTex
       consuma MIGLIAIA di sorteggi: se la ricottura cade a meta' della
       partita del banco, il flusso del seme si sposta li' dove capita e
       due corse identiche divergono (misurato: stessa scena bistabile,
       palla a 758 o a 460 al fotogramma 120, con i conteggi __quanti
       uguali fino al lancio della moneta). Aspettando i font E un tempo
       vero di quiete PRIMA di startMatch, i sorteggi della ricottura
       escono dal conto della partita: tre corse su tre identiche.
       ================================================================= */
    await pag.waitForFunction("document.fonts && document.fonts.status==='loaded'", null, { timeout: 15000 }).catch(() => {});
    await pag.waitForTimeout(900);
    await pag.evaluate(() => window.__banco.passo(30));
    await pag.evaluate((N) => {
      const T = window.__test;
      T.dismissSplash && T.dismissSplash();
      T.startMatch(1, 1, { size: N });
      T.Tut && T.Tut.finish && T.Tut.finish(true);
      T.setCpuVsCpu(true);
      T.save.moviola = 1; T.setMoto(true);
      T.setTimeLeft(85);
      /* il campionatore: legge camera, scena, moviola e pallone dopo OGNI
         fotogramma del banco. E' la traiettoria su cui si giudica. */
      window.__regia = {
        camp() {
          const G = T.G, v = G.view || {};
          return { sc: G.scene, x: G.cam.x, y: G.cam.y, z: G.cam.z, S2: v.S2 || 0,
                   mv: G.moviola ? (G.moviola.fase + ':' + G.moviola.i) : '',
                   fase: G.moviola ? G.moviola.fase : '',
                   bx: G.ball ? G.ball.x : 0, by: G.ball ? G.ball.y : 0 };
        },
        passi(n) { const out = []; for (let i = 0; i < n; i++) { window.__banco.passo(1); out.push(this.camp()); } return out; },
        _rl(d, i) { const f = u => { u /= 255; return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]); },
        /* mediana della luminanza su un disco e sull'anello intorno, in
           px CSS; il rapporto e' il contrasto WCAG del soggetto.
           r0/r1 (in raggi) dicono DOVE sta l'anello: per il pallone
           bastano 1,9-3,2 raggi; per il torso di una figura in primo
           piano l'anello a 1,9-3,2 raggi cade ANCORA SUL CORPO (misurato:
           1,03:1 corpo contro corpo) e va spinto a 4,2-6,2 raggi, fuori
           dalla sagoma, dove c'e' il manto che il torso deve staccare */
        contrasto(xc, yc, r, r0, r1) {
          const rr0 = r0 || 1.9, rr1 = r1 || 3.2;
          const cv = document.getElementById('gioco'), c2 = cv.getContext('2d');
          const dpr = cv.width / window.innerWidth;
          const X = xc * dpr, Y = yc * dpr, R = Math.max(4, r * dpr);
          const est = R * (rr1 + 0.4);
          const x0 = Math.max(0, Math.round(X - est)), y0 = Math.max(0, Math.round(Y - est));
          const w = Math.min(cv.width - x0, Math.round(est * 2)), h = Math.min(cv.height - y0, Math.round(est * 2));
          if (w < 4 || h < 4) return null;
          const D = c2.getImageData(x0, y0, w, h).data;
          const dentro = [], anello = [];
          const passo = Math.max(1, Math.round(R / 7));
          for (let y = 0; y < h; y += passo) for (let x = 0; x < w; x += passo) {
            const dx = x + x0 - X, dy = y + y0 - Y, d = Math.hypot(dx, dy);
            const i = (y * w + x) * 4;
            if (d <= R * 0.85) dentro.push(this._rl(D, i));
            else if (d >= R * rr0 && d <= R * rr1) anello.push(this._rl(D, i));
          }
          const med = v => { if (!v.length) return null; v.sort((a, b) => a - b); return v[v.length >> 1]; };
          const a = med(dentro), b = med(anello);
          if (a === null || b === null) return null;
          return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), sopra: a > b };
        },
        /* il soggetto: pallone (dal gioco stesso: pallaSchermo) o la
           figura del marcatore (proiettata con la vista corrente; il
           punto di composizione e' il centro figura, ~10 unita' sopra
           i piedi) */
        soggetto(tipo) {
          const G = T.G, v = G.view;
          if (tipo === 'palla') { const p = T.pallaSchermo; return p ? { x: p.x, y: p.y, r: Math.max(5, p.r) } : null; }
          if (G.goalIdx < 0 || !G.players[G.goalIdx]) return null;
          const p = G.players[G.goalIdx];
          return { x: p.x * v.S2 + v.Ax, y: p.y * v.S2 + v.Ay - 10 * v.S2, r: 6.5 * v.S2 };
        },
        /* il contrasto di una FIGURA non si misura su un punto scelto a
           tavolino: l'occhio la legge dove stacca di piu' (e' la lezione
           della sezione tonale: contano le BANDE). Si scandisce la
           colonna del corpo (0..-20 unita' sopra i piedi, tre colonne)
           con dischi piccoli, e il contrasto del soggetto e' il MASSIMO
           contro l'erba mediana campionata intorno, fuori dalla sagoma.
           Misurato sul primo tentativo sbagliato: un disco unico posato
           "sul torso" dava 1,12:1 mentre il numero bianco sulla maglia
           stacca a 7,25:1 — il metro mancava la figura, non il gioco. */
        contrastoFigura(px, py) {
          const G = T.G, v = G.view;
          const sx = px * v.S2 + v.Ax, syP = py * v.S2 + v.Ay;
          const cv = document.getElementById('gioco'), c2 = cv.getContext('2d');
          const dpr = cv.width / window.innerWidth;
          const rl = (d, i) => { const f = u => { u /= 255; return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); };
            return 0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]); };
          const med = (xc, yc, r) => {
            const X = xc * dpr, Y = yc * dpr, R = Math.max(3, r * dpr);
            const x0 = Math.round(X - R), y0 = Math.round(Y - R), w = Math.round(2 * R), h = Math.round(2 * R);
            if (x0 < 0 || y0 < 0 || x0 + w > cv.width || y0 + h > cv.height) return null;
            const D = c2.getImageData(x0, y0, w, h).data; const vv = [];
            for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
              const dx = x + x0 - X, dy = y + y0 - Y;
              if (dx * dx + dy * dy <= R * R) vv.push(rl(D, (y * w + x) * 4));
            }
            vv.sort((a, b) => a - b); return vv.length ? vv[vv.length >> 1] : null;
          };
          /* l'erba di riferimento: otto dischi su un anello largo, fuori
             dalla sagoma (25 unita' dal piede), mediana delle mediane */
          const an = [];
          for (let a = 0; a < 8; a++) {
            const m = med(sx + Math.cos(a * 0.785) * 25 * v.S2, syP + Math.sin(a * 0.785) * 25 * v.S2, 3 * v.S2);
            if (m !== null) an.push(m);
          }
          if (!an.length) return null;
          an.sort((a, b) => a - b); const erba = an[an.length >> 1];
          let max = 1;
          for (let du = 0; du >= -20; du -= 2) for (const dx of [-3, 0, 3]) {
            const m = med(sx + dx * v.S2 * 0.5, syP + du * v.S2, 2.2 * v.S2);
            if (m === null) continue;
            const r = (Math.max(m, erba) + 0.05) / (Math.min(m, erba) + 0.05);
            if (r > max) max = r;
          }
          return { ratio: max, erba };
        },
      };
      return true;
    }, taglia);
    return { pag, ctx, errori };
  }

  /* leggibilita' di uno stacco: soggetto nel terzo centrale + contrasto */
  async function leggibilita(pag, tipo) {
    return pag.evaluate((tp) => {
      const R = window.__regia, s = R.soggetto(tp);
      if (!s) return { ok: false, perche: 'soggetto non trovato' };
      const VW = window.innerWidth, VH = window.innerHeight;
      const terzo = s.x >= VW / 3 && s.x <= 2 * VW / 3 && s.y >= VH / 3 && s.y <= 2 * VH / 3;
      let c;
      if (tp === 'marcatore') {
        const G = window.__test.G, p = G.players[G.goalIdx];
        c = R.contrastoFigura(p.x, p.y);
      } else c = R.contrasto(s.x, s.y, s.r);
      return { ok: terzo && !!c && c.ratio >= 3.0, terzo,
               contrasto: c ? +c.ratio.toFixed(2) : null,
               x: +(s.x / VW).toFixed(3), y: +(s.y / VH).toFixed(3) };
    }, tipo);
  }

  /* ============ LO SCENARIO: kickoff, gioco, un gol, moviola ========= */
  async function scenario(taglia, conPixel) {
    const { pag, ctx, errori } = await apri(taglia);
    const tr = [];        // la traiettoria campionata, fotogramma per fotogramma
    const escl = new Set(); // coppie escluse dal verdetto play (iniezione N1)
    const letture = [];   // leggibilita' misurate sugli stacchi
    const foto = [];

    const avanza = async n => { const c = await pag.evaluate(k => window.__regia.passi(k), n); tr.push(...c); };

    /* 1) kickoff iniziale + primo gioco */
    await avanza(240);
    /* 2) gioco: 8 secondi — la finestra del verdetto "mai in play" */
    await avanza(480);
    /* 3) si arriva al gol: se il caso non l'ha gia' dato, lo si forza
       quando il pallone sta in zona centrale ADESSO e ci stava anche
       0,8 s fa (cosi' il nastro della moviola vive lontano dai muri e la
       composizione si puo' giudicare al netto dei casi limite) */
    let forzato = false;
    {
      let st = await pag.evaluate(() => window.__test.state);
      let visto = tr.some(c => c.sc === 'goal');
      if (!visto && (st === 'play' || st === 'golden')) {
        const inBox = c => c.bx > 250 && c.bx < (taglia === 5 ? 900 : 1300) && c.by > 120 && c.by < 440;
        for (let g = 0; g < 600; g++) {
          const c = (await pag.evaluate(() => window.__regia.passi(1)))[0];
          tr.push(c);
          const prima = tr[tr.length - 49];
          if (c.sc === 'goal') { visto = true; break; }
          if (c.sc === 'play' && inBox(c) && prima && inBox(prima)) {
            const ok = await pag.evaluate(() => window.__test.forceGoal(0));
            if (ok) { forzato = true; break; }
          }
        }
        if (!visto && !forzato) {
          const ok = await pag.evaluate(() => window.__test.state === 'play' && window.__test.forceGoal(0));
          forzato = !!ok;
        }
      }
    }
    /* 4) la scena del gol, fotogramma per fotogramma: qui si contano gli
       stacchi della moviola e si misurano i pixel appena uno stacco
       compare. Ci si ferma 45 fotogrammi dentro il kickoff successivo. */
    let inKick = 0, daMisurareRete = -1;
    for (let f = 0; f < 900 && inKick < 45; f++) {
      const c = (await pag.evaluate(() => window.__regia.passi(1)))[0];
      tr.push(c);
      const prima = tr[tr.length - 2];
      if (c.sc === 'kickoff') inKick++;
      const salto = stacco(prima, c);
      if (conPixel && salto && (c.mv || c.sc === 'kickoff')) {
        if (c.fase === 'rete' || c.fase === 'uscita') daMisurareRete = 6; /* il lampo dichiarato dura 0,09 s */
        else {
          const l = await leggibilita(pag, 'palla');
          l.dove = c.mv ? ('moviola ' + c.mv) : 'kickoff';
          letture.push(l);
          if (FOTO) { const nome = path.join(FOTO, `regia-stacco-${letture.length}-${path.basename(GIOCO, '.html')}.png`);
            fs.mkdirSync(FOTO, { recursive: true }); await pag.screenshot({ path: nome }); foto.push(nome); }
        }
      }
      if (conPixel && daMisurareRete > 0 && --daMisurareRete === 0) {
        const l = await leggibilita(pag, 'marcatore');
        l.dove = 'moviola rete (marcatore)';
        letture.push(l);
        if (FOTO) { const nome = path.join(FOTO, `regia-stacco-rete-${path.basename(GIOCO, '.html')}.png`);
          fs.mkdirSync(FOTO, { recursive: true }); await pag.screenshot({ path: nome }); foto.push(nome); }
      }
    }

    /* 5) controllo negativo N1: un salto iniettato in play DEVE vedersi */
    let n1 = null;
    {
      /* si torna al gioco: qualche fotogramma dopo il kickoff */
      await avanza(90);
      const st = await pag.evaluate(() => window.__test.state);
      if (st === 'play' || st === 'golden') {
        const primaIdx = tr.length - 1;
        await pag.evaluate(() => { const G = window.__test.G; G.cam.x += 260 / (G.view.S2 || 1); });
        const c = (await pag.evaluate(() => window.__regia.passi(1)))[0];
        tr.push(c);
        n1 = stacco(tr[primaIdx], c);
        escl.add(tr.length - 1);           // il salto l'abbiamo fatto noi
        escl.add(tr.length);               // e il fotogramma di rientro
        await avanza(4);
      }
    }
    /* 6) controlli negativi N2/N3: i due metri del contrasto puntati
       sull'erba nuda devono dire un numero sotto il 3:1 */
    let n2 = null, n3 = null;
    if (conPixel) {
      n2 = await pag.evaluate(() => {
        const R = window.__regia, VW = window.innerWidth, VH = window.innerHeight;
        const c = R.contrasto(VW * 0.5 + 150, VH * 0.52, 9);
        return c ? +c.ratio.toFixed(2) : null;
      });
      n3 = await pag.evaluate(() => {
        /* una "figura" che non c'e': il punto d'erba nuda piu' lontano
           da tutti i corpi, fuori dal cerchio e dalla linea mediana */
        const T = window.__test, G = T.G, FW = T.campo.FW, FH = T.campo.FH;
        let best = { x: FW / 2 + 110, y: FH / 2 + 60, d: -1 };
        for (const gx of [-150, -110, -90, 90, 110, 150]) for (const gy of [-90, -60, 60, 90]) {
          const x = FW / 2 + gx, y = FH / 2 + gy; let d = 1e9;
          for (const p of G.players) { if (p.out > 0) continue;
            const dd = Math.hypot(p.x - x, p.y - y); if (dd < d) d = dd; }
          if (d > best.d) best = { x, y, d };
        }
        const c = window.__regia.contrastoFigura(best.x, best.y);
        return c ? +c.ratio.toFixed(2) : null;
      });
    }

    await ctx.close();
    return { tr, escl, letture, foto, errori, forzato, n1, n2, n3 };
  }

  /* ================== il giudizio su una taglia ====================== */
  async function giudica(taglia, conPixel) {
    console.log(`\n--- taglia ${taglia} ---`);
    const S = await scenario(taglia, conPixel);
    const tr = S.tr;

    /* stacchi nelle due finestre promesse */
    let stKick = 0, stMov = 0, violaPlay = 0;
    for (let i = 1; i < tr.length; i++) {
      if (S.escl.has(i)) continue;
      const a = tr[i - 1], b = tr[i];
      if (!stacco(a, b)) continue;
      if (b.mv) stMov++;
      else if (b.sc === 'kickoff') stKick++;
      else if ((a.sc === 'play' || a.sc === 'golden') && (b.sc === 'play' || b.sc === 'golden')) violaPlay++;
    }
    const moviole = segmentiMoviola(tr);
    const minInq = moviole.length ? Math.min(...moviole.map(m => m.distinte)) : 0;
    const totale = stKick + stMov;

    di(`t${taglia} gioco attivo intonso`, violaPlay === 0,
       `${violaPlay} stacchi in play/golden su ${tr.length} fotogrammi (servono 0)`);
    di(`t${taglia} stacchi per partita`, totale >= MIN_STACCHI,
       `${totale} (kickoff ${stKick} + moviola ${stMov}; oggi il censimento dice 0, servono >= ${MIN_STACCHI})`);
    di(`t${taglia} inquadrature moviola`, moviole.length > 0 && minInq >= MIN_INQ,
       moviole.length ? `${moviole.map(m => m.distinte).join(', ')} distinte (zoom mediani ${moviole.map(m => m.zooms.map(z => z.toFixed(2)).join('/')).join(' | ')}; servono >= ${MIN_INQ})`
                      : 'nessuna moviola vista: scenario rotto');
    if (S.n1 !== null) di(`t${taglia} controllo negativo N1 (salto iniettato)`, S.n1 === true,
       S.n1 ? 'il rilevatore lo VEDE' : 'il rilevatore NON lo vede: soglie rotte');
    if (conPixel) {
      const tutteOk = S.letture.length >= 3 && S.letture.every(l => l.ok);
      di(`t${taglia} leggibilita' degli stacchi`, tutteOk,
         S.letture.length ? S.letture.map(l => `${l.dove}: terzo=${l.terzo ? 'si' : 'NO'} contrasto=${l.contrasto}:1 (x=${l.x} y=${l.y})`).join(' · ')
                          : 'nessuno stacco da misurare (0 stacchi)');
      if (S.n2 !== null) di(`t${taglia} controllo negativo N2 (erba su erba)`, S.n2 < CONTRASTO_MIN,
         `${S.n2}:1 — il metro del pallone ${S.n2 < CONTRASTO_MIN ? 'sa dire di no' : 'NON SA dire di no: misura rotta'}`);
      if (S.n3 !== null) di(`t${taglia} controllo negativo N3 (figura che non c'e')`, S.n3 < CONTRASTO_MIN,
         `${S.n3}:1 — il metro della figura ${S.n3 < CONTRASTO_MIN ? 'sa dire di no' : 'NON SA dire di no: misura rotta'}`);
    }
    if (S.errori.length) di(`t${taglia} errori di pagina`, false, S.errori.slice(0, 2).join(' | '));
    if (S.foto.length) console.log('       foto: ' + S.foto.join(', '));
  }

  console.log(`=== _q-regia · ${GIOCO} · seme ${SEME} · soglie: pan ${SOGLIA_PAN}px, zoom ${SOGLIA_ZOOM} ===`);
  const taglie = SOLO ? [SOLO] : [5, 7, 11];
  for (const t of taglie) await giudica(t, t === 5);

  await br.close(); srv.chiudi();
  const rossi = esiti.filter(e => !e.ok).length;
  console.log(`\n${esiti.length} verdetti, ${esiti.length - rossi} verdi, ${rossi} rossi  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  process.exit(rossi ? 1 : 0);
})();
