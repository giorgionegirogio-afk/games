/* =====================================================================
   _sonda-divise.js — IL CONTRASTO DI **TUTTE** LE DIVISE, NEL CASO
   PEGGIORE.

   PERCHE' ESISTE. Il cancello (strumenti/collaudo.js) misura DUE divise
   — quella addosso alla squadra 0 e quella addosso alla squadra 1 in
   quel momento — su tre partite, e ne stampa la MEDIA del mucchio. Il
   19 agosto 2026 quella media valeva 2,61:1 con le tre partite a
   2,05 / 4,57 / 2,13: due partite su tre sotto il minimo, e una media
   che quasi le nascondeva. Il difetto non l'aveva introdotto nessuno:
   una toppa ha cambiato il consumo dei sorteggi, il gioco ha
   cominciato a pescare coppie di divise che prima non uscivano, ed e'
   emerso qualcosa che c'era sempre.
   Un metro che guarda due divise su ventidue non e' un metro: e' un
   sondaggio. Questa sonda le guarda TUTTE.

   COME. Le stesse formule del cancello, copiate riga per riga e non
   reinventate (due formule diverse darebbero due verita'):
     - finestra del torso: tre file a -12,5 / -11,5 / -10,5 unita' sopra
       il centro, sette colonne fra -1,5 e +1,5;
     - anello d'erba fra 30 e 42 unita', SOLO nell'arco a ovest, con
       l'esclusione dei corpi e la capsula d'ombra DICHIARATA DAL GIOCO
       (window.__test.ombraCapsula), rivalidata a ogni fotogramma;
     - colore rappresentativo = mediana per canale;
     - rapporto (L1+0,05)/(L2+0,05) sulla luminanza relativa.

   COSA FA DI PIU', e sono le tre cose che la media nascondeva.

   1. OGNI DIVISA, NON QUELLE IN CAMPO. A fotogramma FERMO — fisica
      congelata, camera congelata (G.renderDT=0, quindi updateCamera
      integra zero: k = 1-2^0 = 0) — la stessa scena viene RIDIPINTA una
      volta per divisa, e ogni volta si rileggono i pixel del torso.
      E' una misura APPAIATA: tutte le divise sono misurate sulle stesse
      pose, sotto la stessa luce, sullo stesso manto. La differenza fra
      due righe della tabella e' la divisa e nient'altro.
      La divisa si dipinge su TUTTE E DUE le squadre insieme, cosi'
      ognuna raccoglie i campioni di dieci giocatori su tutte e due le
      meta' campo e non eredita il lato del quadro in cui giocava.

   2. LE DUE TONALITA' DI STRISCIA, SEPARATE. Il manto e' tosato a
      ventiquattro bande (NS = max(24, round(FW/(1150/24))), sw = FW/NS,
      pari = g1, dispari = g2): ogni campione d'erba si classifica per
      la banda su cui cade, e il rapporto si calcola contro CIASCUNA
      delle due mediane. La media delle due e' esattamente cio' che non
      si vuole.

   3. LE TRE ORE DELLA PARTITA. La rampa termica vive in buildVignette e
      cambia a scalini (scalinoOra: <0,34 / <0,67 / oltre). L'erba di
      fine partita non e' quella d'inizio. L'ora si INCHIODA scrivendo
      G.timeLeft prima di ogni passo e prima di ogni disegno —
      oraPartita() e' una funzione pura di G.timeLeft, quindi fissare
      l'una e' fissare l'altra — e il gioco ricuoce la vignettatura da
      solo quando lo scalino cambia (lo fa gia' in render).

   Il numero riportato per ogni divisa e' il MINIMO su tutte le
   combinazioni (ora x banda x seme), non la media.

   LA PROVA CHE LA SONDA SA DIRE NO. In fondo alla tabella c'e' una riga
   che NON e' una divisa del gioco: 'PROVA BANCO — verde manto #2f6b22',
   la tinta con cui GUASTO=1 dipinge le maglie in collaudo.js, cioe'
   erba su erba. Se quella riga non esce rossa, la sonda non sta
   misurando quello che dice di misurare e la tabella non vale niente.

   uso:
     node strumenti/_sonda-divise.js
     node strumenti/_sonda-divise.js --file fuori/divise.html
     node strumenti/_sonda-divise.js --semi 20260728,20260729,20260730
     node strumenti/_sonda-divise.js --ore 0.10,0.50,0.90 --json fuori/divise.json
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
const FILE = arg('file', 'CALCETTO-il-gioco.html');
const SEMI = arg('semi', '20260728,20260729,20260730').split(',').map(s => +s);
const ORE = arg('ore', '0.10,0.50,0.90').split(',').map(s => +s);
const JSONOUT = arg('json', '');
const SOGLIA = 3;

const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
               '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* ------------------------------------------------------------------ */
/* IL BLOCCO CHE GIRA DENTRO LA PAGINA. Una chiamata = una partita a un
   seme e a un'ora dichiarati. Non contiene nessun await: da
   window.__risemina in giu' nessun fotogramma dell'orologio vero puo'
   infilarsi in mezzo e spostare la sequenza (lezione di collaudo.js). */
function inPagina(cfg) {
  const t = window.__test;
  const cv = document.getElementById('gioco');
  const c2 = cv.getContext('2d', { willReadFrequently: true });
  const DPRc = cv.width / window.innerWidth;

  /* L'ELENCO SI COSTRUISCE DAL FILE, non si copia qui: se domani una
     divisa cambia tinta o ne nasce una nona, la sonda la vede senza che
     nessuno aggiorni una lista parallela (una copia della verita' e' il
     modo piu' silenzioso di sbagliare). */
  const lista = [];
  for (const k of KITS) lista.push({ fam: 'KIT', nome: k.nome, c1: k.c1, c2: k.c2, pat: k.pat | 0 });
  for (const s of TOUR_POOL) lista.push({ fam: 'TORNEO', nome: s.n, c1: s.c1, c2: s.c2, pat: s.pat | 0 });
  /* la CPU delle amichevoli: le due tinte sono quelle che startMatch
     scrive davvero (TEAMCOL2[1]='#cf3e6b'), non quelle della
     dichiarazione di TEAMCOL2 */
  lista.push({ fam: 'CPU', nome: 'ROSA (CPU)', c1: ROSA_KIT, c2: '#cf3e6b', pat: 2 });
  /* le due dell'alto contrasto: le scrive applyKit quando SAVE.dalt */
  lista.push({ fam: 'DALT', nome: 'GIALLO (alto contrasto)', c1: '#ffe14d', c2: '#8a6a00', pat: 1 });
  lista.push({ fam: 'DALT', nome: 'CELESTE (alto contrasto)', c1: BLU_KIT, c2: '#123a80', pat: 2 });
  /* le divise da portiere: una sola per entrambe le squadre, scelta fra
     quattro. Il cancello le tiene fuori dal suo campione (giustamente:
     e' un'altra misura), ma sono maglie sull'erba come le altre e qui si
     misurano — e SI LEGGONO DA GK_SCELTE, non si ricopiano qui: una
     lista parallela sarebbe una seconda verita' che prima o poi diverge
     (ci sono cascato al primo giro, e la sonda misurava il viola vecchio
     su un file dove il viola era gia' cambiato). */
  for (const k of GK_SCELTE) lista.push({ fam: 'PORTIERE', nome: 'gk ' + k[0], c1: k[0], c2: k[1], pat: 0 });
  /* LA RIGA CHE DEVE USCIRE ROSSA: non e' una divisa, e' il verde del
     manto. Se passa, la sonda sta misurando altro. */
  lista.push({ fam: 'PROVA', nome: 'PROVA BANCO — verde manto', c1: '#2f6b22', c2: '#2f6b22', pat: 1 });

  const lumin = (r, g, b) => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
  const rappr = a => a.length ? [mediana(a.map(c => c[0])), mediana(a.map(c => c[1])), mediana(a.map(c => c[2]))] : null;
  const rapportoDi = (mm, ee) => {
    const m = rappr(mm), e = rappr(ee);
    if (!m || !e) return null;
    const Lm = lumin(m[0], m[1], m[2]), Le = lumin(e[0], e[1], e[2]);
    return (Math.max(Lm, Le) + 0.05) / (Math.min(Lm, Le) + 0.05);
  };
  const esa = c => c ? '#' + c.map(v => v.toString(16).padStart(2, '0')).join('') : '?';

  /* la capsula d'ombra: stessa validazione di forma del cancello. Senza
     capsula valida non si campiona affatto — un numero falso e verde e'
     il modo peggiore di sbagliare. */
  const capsulaGuasta = k => {
    if (!k || typeof k !== 'object') return "ombraCapsula() non torna un oggetto: " + String(k);
    for (const n of ['ux', 'uy', 'l0', 'l1', 'semiCorto', 'piedeX', 'piedeY'])
      if (typeof k[n] !== 'number' || !isFinite(k[n])) return "manca (o non e' un numero) il campo '" + n + "'";
    const mo = Math.hypot(k.ux, k.uy);
    if (!(Math.abs(mo - 1) < 0.01)) return "(ux,uy) non e' un versore: modulo " + mo.toFixed(4);
    if (!(k.l1 > k.l0)) return "l1 non e' oltre l0";
    if (!(k.semiCorto > 0)) return "semiCorto non e' positivo";
    return null;
  };
  let OMB = null, OMB_MOTIVO = null;
  if (typeof t.ombraCapsula !== 'function') OMB_MOTIVO = "__test.ombraCapsula non e' una funzione";
  else { try { OMB = t.ombraCapsula(); } catch (e) { OMB_MOTIVO = 'ombraCapsula() e\' esplosa: ' + e.message; }
         if (!OMB_MOTIVO) { OMB_MOTIVO = capsulaGuasta(OMB); if (OMB_MOTIVO) OMB = null; } }
  if (!OMB) return { errore: 'capsula d\'ombra inutilizzabile: ' + OMB_MOTIVO };
  const dentroOmbra = (qx, qy, wx, wy) => {
    const ax = qx + OMB.piedeX, ay = qy + OMB.piedeY;
    const rx = wx - ax, ry = wy - ay;
    let t2 = rx * OMB.ux + ry * OMB.uy;
    if (t2 < OMB.l0) t2 = OMB.l0;
    if (t2 > OMB.l1) t2 = OMB.l1;
    const px = ax + OMB.ux * t2, py = ay + OMB.uy * t2;
    const semi = OMB.semiCorto * 1.6 + 4;
    return Math.hypot(wx - px, wy - py) < semi;
  };

  t.dismissSplash && t.dismissSplash();
  t.setDalt(false);
  const avvia = () => { t.setDalt(false); t.startMatch(1, 1); t.setCpuVsCpu(true); };
  /* l'ora si inchioda scrivendo il cronometro: oraPartita() e' una
     funzione pura di G.timeLeft (zero stato, zero orologio a muro) */
  let TOT = 90;
  const pin = () => { G.timeLeft = TOT * (1 - cfg.ora); };
  const avanza = sec => {
    const n = Math.round(sec * 60);
    for (let i = 0; i < n; i++) { pin(); t.simulate(1 / 60); pin(); t.disegna(); }
  };

  /* la partita di riscaldamento, buttata via: porta i latch di regia che
     startMatch non azzera a uno stato dichiarato (lezione di collaudo.js) */
  window.__risemina(cfg.semi[0]); avvia(); TOT = t.timeLeft; avanza(1.0);

  const FWl = 1150;
  const NS = Math.max(24, Math.round(t.campo.FW / (1150 / 24)));
  const sw = t.campo.FW / NS;
  /* i mucchi: erba per banda di tosatura, maglia per divisa */
  const erba = [[], []];
  const maglia = lista.map(() => []);
  let fotogrammi = 0, partite = 0;

  for (const seme of cfg.semi) {
    window.__risemina(seme); avvia(); TOT = t.timeLeft; partite++;
    for (let k = 0; k < 6; k++) {
      /* i tre secondi del primo campione: la targa dei capitani dura
         1,7 s e non deve entrare in una misura di maglie e prati */
      avanza(k === 0 ? 3.0 : 0.45);
      for (let i = 0; i < 40 && !(t.state === 'play' || t.state === 'golden'); i++) {
        if (t.state === 'end' || t.state === 'menu') break;
        avanza(0.1);
      }
      if (t.state !== 'play' && t.state !== 'golden') continue;
      let kk = null, guai = null;
      try { kk = t.ombraCapsula(); } catch (e) { guai = 'esplosa'; }
      if (!guai) guai = capsulaGuasta(kk);
      if (guai) continue;
      OMB = kk;
      fotogrammi++;

      const W = cv.width, H = cv.height;
      const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay;
      const B = t.bande, VWc = W / DPRc, VHc = H / DPRc;
      const inQuadro = (sx, sy) => sx > 2 && sx < VWc - 2 && sy > B.bar + 2 && sy < VHc - B.foot - 2;

      /* --- ERBA: si legge UNA volta, non dipende dalla divisa --- */
      const img = c2.getImageData(0, 0, W, H).data;
      const pixel = (sx, sy) => {
        const x = Math.round(sx * DPRc), y = Math.round(sy * DPRc);
        if (x < 0 || y < 0 || x >= W || y >= H) return null;
        const o = (y * W + x) * 4;
        return [img[o], img[o + 1], img[o + 2]];
      };
      const inCampo = [];
      for (const p of t.players) {
        if (p.role === 'gk' || p.out > 0) continue;
        if (p.slide >= 0 || p.recover > 0 || p.dive > 0 || p.celeb > 0) continue;
        inCampo.push(p);
        for (const r of [30, 34, 38, 42]) {
          for (let ang = 0; ang < 360; ang += 15) {
            const rad = ang * Math.PI / 180;
            const cx = Math.cos(rad), cy = Math.sin(rad);
            if (cx * OMB.ux + cy * OMB.uy > 0) continue;      // solo l'arco a ovest
            const wx = p.x + cx * r, wy = p.y + cy * r;
            if (wx < 8 || wx > t.campo.FW - 8 || wy < 8 || wy > t.campo.FH - 8) continue;
            let libero = true;
            for (const q of t.players) {
              if (q.out > 0) continue;
              if (q !== p && Math.hypot(q.x - wx, q.y - wy) < 30) { libero = false; break; }
              if (Math.abs(wx - q.x) < 20 && Math.abs(wy - (q.y + 2)) < 28) { libero = false; break; }
              if (dentroOmbra(q.x, q.y, wx, wy)) { libero = false; break; }
            }
            if (!libero) continue;
            if (Math.hypot(t.ball.x - wx, t.ball.y - wy) < 24) continue;
            const sx = wx * S2 + Ax, sy = wy * S2 + Ay;
            if (!inQuadro(sx, sy)) continue;
            const c = pixel(sx, sy);
            if (c) erba[Math.floor(wx / sw) % 2 === 0 ? 0 : 1].push(c);
          }
        }
      }
      if (!inCampo.length) continue;

      /* --- MAGLIA: il fotogramma si RIDIPINGE una volta per divisa ---
         fisica ferma e camera ferma (renderDT = 0 -> updateCamera integra
         zero), quindi tutte le divise vedono ESATTAMENTE la stessa scena */
      const salva = [TEAMCOL[0], TEAMCOL[1], TEAMCOL2[0], TEAMCOL2[1], TEAMPAT[0], TEAMPAT[1]];
      const rdtSalvo = G.renderDT;
      for (let u = 0; u < lista.length; u++) {
        const d = lista[u];
        TEAMCOL[0] = TEAMCOL[1] = d.c1;
        TEAMCOL2[0] = TEAMCOL2[1] = d.c2;
        TEAMPAT[0] = TEAMPAT[1] = d.pat;
        refreshTeamRGB();
        G.renderDT = 0; render();
        for (const p of inCampo) {
          /* si legge un solo rettangolino attorno al torso invece di
             tutta la tela: ventidue letture a schermo pieno per
             fotogramma costerebbero piu' del disegno stesso */
          const pts = [];
          for (const av of [-12.5, -11.5, -10.5])
            for (const la of [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5]) {
              const sx = (p.x + la) * S2 + Ax, sy = (p.y + av) * S2 + Ay;
              if (!inQuadro(sx, sy)) continue;
              const x = Math.round(sx * DPRc), y = Math.round(sy * DPRc);
              if (x < 0 || y < 0 || x >= cv.width || y >= cv.height) continue;
              pts.push([x, y]);
            }
          if (!pts.length) continue;
          let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
          for (const q of pts) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
          const dd = c2.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
          for (const q of pts) {
            const o = ((q[1] - y0) * dd.width + (q[0] - x0)) * 4;
            maglia[u].push([dd.data[o], dd.data[o + 1], dd.data[o + 2]]);
          }
        }
      }
      TEAMCOL[0] = salva[0]; TEAMCOL[1] = salva[1];
      TEAMCOL2[0] = salva[2]; TEAMCOL2[1] = salva[3];
      TEAMPAT[0] = salva[4]; TEAMPAT[1] = salva[5];
      refreshTeamRGB(); G.renderDT = rdtSalvo;
    }
  }

  const fuoriErba = [rappr(erba[0]), rappr(erba[1])];
  const Ydi = c => c ? lumin(c[0], c[1], c[2]) : null;
  const righe = lista.map((d, u) => {
    const m = rappr(maglia[u]);
    return {
      fam: d.fam, nome: d.nome, c1: d.c1, c2: d.c2, pat: d.pat,
      reso: esa(m), n: maglia[u].length,
      /* la luminanza NOMINALE (la tinta dichiarata nel file) accanto a
         quella RESA (i pixel che arrivano all'occhio): fra le due c'e'
         il velo dell'illuminazione, ed e' li' che si perde il contrasto */
      Ynom: lumin(parseInt(d.c1.slice(1, 3), 16), parseInt(d.c1.slice(3, 5), 16), parseInt(d.c1.slice(5, 7), 16)),
      Yres: Ydi(m),
      r: [rapportoDi(maglia[u], erba[0]), rapportoDi(maglia[u], erba[1])],
    };
  });
  t.setDalt(false);
  return { ora: cfg.ora, oraVista: t.ora, fotogrammi, partite,
           erba: [esa(fuoriErba[0]), esa(fuoriErba[1])], Yerba: [Ydi(fuoriErba[0]), Ydi(fuoriErba[1])],
           nErba: [erba[0].length, erba[1].length],
           NS, sw: +sw.toFixed(3), righe };
}

/* =====================================================================
   MODO --cancello: IL PROTOCOLLO DI collaudo.js, ALLA LETTERA.

   PERCHE' SERVE UN SECONDO MODO. La tabella qui sopra e' una misura
   APPAIATA: tutte le divise sulle stesse pose, quindi l'ordine fra due
   righe e' esatto. Ma i suoi fotogrammi NON sono quelli del cancello —
   ridipingere ventisei volte lo stesso fotogramma consuma sorteggi (la
   folla ne brucia qualche migliaio per disegno) e da li' in poi la
   partita diverge. Sul livello ASSOLUTO, quindi, la tabella appaiata e
   il cancello non sono la stessa cosa, e la differenza e' grossa: sul
   file di partenza il celeste vale 3,30 li' e 2,61 qui.
   Questo modo rifa' il protocollo del cancello riga per riga — nessuna
   ridipintura, orologio naturale, tre semi dichiarati, mucchio unico e
   le tre partite stampate una per una — e in piu' lo ripete per OGNI
   kit del giocatore e per OGNI squadra di torneo, che il cancello non
   fa. La sua fedelta' si verifica in un modo solo: sul file di partenza
   deve ridare i numeri del cancello. Se non li ridesse, non varrebbe.
   ===================================================================== */
function inPaginaCancello(cfg) {
  const t = window.__test;
  const cv = document.getElementById('gioco');
  const c2 = cv.getContext('2d', { willReadFrequently: true });
  const DPRc = cv.width / window.innerWidth;
  const SEMI = cfg.semi;

  const lumin = (r, g, b) => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
  const rappr = a => a.length ? [mediana(a.map(c => c[0])), mediana(a.map(c => c[1])), mediana(a.map(c => c[2]))] : null;
  const rapportoDi = (mm, ee) => {
    const m = rappr(mm), e = rappr(ee);
    if (!m || !e) return null;
    const Lm = lumin(m[0], m[1], m[2]), Le = lumin(e[0], e[1], e[2]);
    return (Math.max(Lm, Le) + 0.05) / (Math.min(Lm, Le) + 0.05);
  };
  const esa = c => c ? '#' + c.map(v => v.toString(16).padStart(2, '0')).join('') : '?';
  const capsulaGuasta = k => {
    if (!k || typeof k !== 'object') return 'non e\' un oggetto';
    for (const n of ['ux', 'uy', 'l0', 'l1', 'semiCorto', 'piedeX', 'piedeY'])
      if (typeof k[n] !== 'number' || !isFinite(k[n])) return "manca il campo '" + n + "'";
    if (!(Math.abs(Math.hypot(k.ux, k.uy) - 1) < 0.01)) return 'non e\' un versore';
    if (!(k.l1 > k.l0)) return 'l1 non e\' oltre l0';
    if (!(k.semiCorto > 0)) return 'semiCorto non positivo';
    return null;
  };
  let OMB = null;
  try { OMB = t.ombraCapsula(); } catch (e) { OMB = null; }
  if (!OMB || capsulaGuasta(OMB)) return { errore: 'capsula d\'ombra inutilizzabile' };
  const dentroOmbra = (qx, qy, wx, wy) => {
    const ax = qx + OMB.piedeX, ay = qy + OMB.piedeY;
    let t2 = (wx - ax) * OMB.ux + (wy - ay) * OMB.uy;
    if (t2 < OMB.l0) t2 = OMB.l0;
    if (t2 > OMB.l1) t2 = OMB.l1;
    return Math.hypot(wx - (ax + OMB.ux * t2), wy - (ay + OMB.uy * t2)) < OMB.semiCorto * 1.6 + 4;
  };

  t.dismissSplash && t.dismissSplash();
  const opp = cfg.opp >= 0 ? TOUR_POOL[cfg.opp] : null;
  const avviaPartita = () => {
    t.setDalt(!!cfg.dalt);
    SAVE.kit = cfg.kit | 0;                  // il kit del giocatore, come lo sceglie il menu
    t.startMatch(1, 1, opp ? { opp } : undefined);
    t.setCpuVsCpu(true);
  };
  const avanza = sec => { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) { t.simulate(1 / 60); t.disegna(); } };
  const FW = 1150, FH = 560;
  const maglia = [[], []], erba = [[], []];
  const perPartita = [];
  let fotogrammi = 0;

  window.__risemina(SEMI[0]); avviaPartita(); avanza(1.5);   // riscaldamento, buttato via

  for (const seme of SEMI) {
    window.__risemina(seme); avviaPartita();
    const mP = [[], []], eP = [[], []];
    for (let k = 0; k < 6; k++) {
      avanza(k === 0 ? 3.0 : 0.45);
      for (let i = 0; i < 60 && !(t.state === 'play' || t.state === 'golden'); i++) {
        if (t.state === 'end' || t.state === 'menu') break;
        avanza(0.1);
      }
      if (t.state !== 'play' && t.state !== 'golden') continue;
      let kk = null; try { kk = t.ombraCapsula(); } catch (e) { kk = null; }
      if (!kk || capsulaGuasta(kk)) continue;
      OMB = kk;
      fotogrammi++;
      const img = c2.getImageData(0, 0, cv.width, cv.height).data;
      const W = cv.width, H = cv.height;
      const S2 = t.view.S2, Ax = t.view.Ax, Ay = t.view.Ay;
      const B = t.bande, VWc = W / DPRc, VHc = H / DPRc;
      const pixel = (sx, sy) => {
        const x = Math.round(sx * DPRc), y = Math.round(sy * DPRc);
        if (x < 0 || y < 0 || x >= W || y >= H) return null;
        const o = (y * W + x) * 4;
        return [img[o], img[o + 1], img[o + 2]];
      };
      const inQuadro = (sx, sy) => sx > 2 && sx < VWc - 2 && sy > B.bar + 2 && sy < VHc - B.foot - 2;
      for (const p of t.players) {
        if (p.role === 'gk' || p.out > 0) continue;
        if (p.slide >= 0 || p.recover > 0 || p.dive > 0 || p.celeb > 0) continue;
        for (const av of [-12.5, -11.5, -10.5])
          for (const la of [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5]) {
            const sx = (p.x + la) * S2 + Ax, sy = (p.y + av) * S2 + Ay;
            if (!inQuadro(sx, sy)) continue;
            const c = pixel(sx, sy); if (c) mP[p.team].push(c);
          }
        for (const r of [30, 34, 38, 42])
          for (let ang = 0; ang < 360; ang += 15) {
            const rad = ang * Math.PI / 180, cx = Math.cos(rad), cy = Math.sin(rad);
            if (cx * OMB.ux + cy * OMB.uy > 0) continue;
            const wx = p.x + cx * r, wy = p.y + cy * r;
            if (wx < 8 || wx > FW - 8 || wy < 8 || wy > FH - 8) continue;
            let libero = true;
            for (const q of t.players) {
              if (q.out > 0) continue;
              if (q !== p && Math.hypot(q.x - wx, q.y - wy) < 30) { libero = false; break; }
              if (Math.abs(wx - q.x) < 20 && Math.abs(wy - (q.y + 2)) < 28) { libero = false; break; }
              if (dentroOmbra(q.x, q.y, wx, wy)) { libero = false; break; }
            }
            if (!libero) continue;
            if (Math.hypot(t.ball.x - wx, t.ball.y - wy) < 24) continue;
            const sx = wx * S2 + Ax, sy = wy * S2 + Ay;
            if (!inQuadro(sx, sy)) continue;
            const c = pixel(sx, sy); if (c) eP[p.team].push(c);
          }
      }
    }
    const rP = [];
    for (let sq = 0; sq < 2; sq++) {
      for (const c of mP[sq]) maglia[sq].push(c);
      for (const c of eP[sq]) erba[sq].push(c);
      rP.push(rapportoDi(mP[sq], eP[sq]));
    }
    perPartita.push({ seme, r: rP });
  }
  const sq = [];
  for (let s = 0; s < 2; s++) sq.push({
    rapporto: rapportoDi(maglia[s], erba[s]), maglia: esa(rappr(maglia[s])), erba: esa(rappr(erba[s])),
    singole: perPartita.map(p => p.r[s]),
    nMaglia: maglia[s].length, nErba: erba[s].length,
  });
  /* LE DUE SQUADRE DEVONO RESTARE DISTINGUIBILI FRA LORO, e questo e' il
     modo di dimostrarlo senza riaprire il compito chiuso: la distanza
     OKLab fra i due colori RESI — i pixel veri delle due maglie nello
     stesso fotogramma, gia' passati sotto il velo che spegne il croma —
     misurata prima e dopo. Se scende, la cura del contrasto contro
     l'erba l'ha pagata la separazione fra le squadre. */
  const oklab = c => {
    const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const r = f(c[0]), g = f(c[1]), b = f(c[2]);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s2 = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s2,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s2,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s2];
  };
  const m0 = rappr(maglia[0]), m1 = rappr(maglia[1]);
  let dE = null, dL = null;
  if (m0 && m1) {
    const a = oklab(m0), b = oklab(m1);
    dE = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    dL = Math.abs(a[0] - b[0]);
  }
  t.setDalt(false);
  return { fotogrammi, sq, dE, dL, gkUnica: GK_UNICA[0],
           kitNome: KITS[cfg.kit | 0].nome, kitC1: KITS[cfg.kit | 0].c1,
           oppNome: opp ? opp.n : (cfg.dalt ? 'CELESTE alto contrasto' : 'ROSA (CPU)'),
           oppC1: opp ? opp.c1 : (cfg.dalt ? BLU_KIT : ROSA_KIT) };
}

/* ------------------------------------------------------------------ */
(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    window.__risemina = n => { s = (n >>> 0) || 1; };
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
  }, 20260728);
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/${FILE}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(400);

  if (process.argv.includes('--cancello')) {
    /* IL PROTOCOLLO DEL CANCELLO, RIPETUTO SU OGNI DIVISA CHE PUO'
       ARRIVARCI: gli otto kit del giocatore (P1 contro la ROSA della
       CPU), le dieci squadre di torneo (P2 contro il kit di serie) e la
       coppia dell'alto contrasto. Si stampa il mucchio unico E le tre
       partite una per una: e' la dispersione che la media nasconde. */
    const conf = [];
    const nKit = await pag.evaluate(() => KITS.length);
    const nTour = await pag.evaluate(() => TOUR_POOL.length);
    for (let i = 0; i < nKit; i++) conf.push({ kit: i, opp: -1, dalt: false, chi: 0 });
    conf.push({ kit: 0, opp: -1, dalt: false, chi: 1 });      // la ROSA della CPU: e' il P2 del cancello
    for (let j = 0; j < nTour; j++) conf.push({ kit: 0, opp: j, dalt: false, chi: 1 });
    conf.push({ kit: 0, opp: -1, dalt: true, chi: 0 });
    conf.push({ kit: 0, opp: -1, dalt: true, chi: 1 });
    console.log('protocollo del cancello (3 partite a semi ' + SEMI.join('/') + '), minimo ' + SOGLIA + ':1');
    console.log('DIVISA                       tinta     resa      mucchio   le tre partite         sotto  dE');
    const righe = [];
    for (const c of conf) {
      const m = await pag.evaluate(inPaginaCancello, { kit: c.kit, opp: c.opp, dalt: c.dalt, semi: SEMI });
      if (m.errore) { console.error('FALLITA: ' + m.errore); process.exit(1); }
      const s = m.sq[c.chi];
      const nome = (c.dalt ? (c.chi ? 'CELESTE alto contr.' : 'GIALLO alto contr.') : (c.chi ? m.oppNome : m.kitNome));
      const tinta = c.dalt ? (c.chi ? m.oppC1 : '#ffe14d') : (c.chi ? m.oppC1 : m.kitC1);
      const sotto = s.singole.filter(v => v != null && v < SOGLIA).length;
      righe.push({ nome, tinta, chi: c.chi, r: s.rapporto, singole: s.singole, sotto, maglia: s.maglia, erba: s.erba, dE: m.dE, dL: m.dL, gk: m.gkUnica });
      console.log((nome + '                            ').slice(0, 28) + ' ' + tinta + '   ' + s.maglia + '   ' +
        (s.rapporto < SOGLIA ? 'NO ' : 'ok ') + s.rapporto.toFixed(2) + '   ' +
        s.singole.map(v => v == null ? ' ?  ' : v.toFixed(2)).join(' / ') + '   ' + sotto + '/' + s.singole.length +
        '  ' + (m.dE == null ? ' ?   ' : m.dE.toFixed(3)) + ' gk ' + m.gkUnica);
    }
    const male = righe.filter(r => r.r < SOGLIA || r.sotto > 0);
    console.log(`\n${righe.length} configurazioni; ${righe.filter(r => r.r < SOGLIA).length} col mucchio sotto ${SOGLIA}:1, ` +
      `${male.length} con almeno una partita sotto.`);
    if (JSONOUT) { fs.mkdirSync(path.dirname(path.resolve(JSONOUT)), { recursive: true }); fs.writeFileSync(path.resolve(JSONOUT), JSON.stringify({ file: FILE, semi: SEMI, righe }, null, 1)); console.log('scritto ' + JSONOUT); }
    await browser.close(); srv.chiudi();
    return;
  }

  const misure = [];
  for (const ora of ORE) {
    const m = await pag.evaluate(inPagina, { ora, semi: SEMI });
    if (m.errore) { console.error('FALLITA: ' + m.errore); process.exit(1); }
    misure.push(m);
    /* LE DUE BANDE SI CHIAMANO g1 E g2, NON "chiara" E "scura": quale
       delle due sia la piu' chiara lo decide il tema del campo (per
       l'oratorio g2 #1c6b21 e' un filo piu' chiara di g1 #1c6a20), e
       scriverlo al contrario sarebbe scrivere un numero non misurato.
       Accanto a ognuna si stampa la luminanza relativa, che e' il fatto. */
    console.log(`ora ${ora.toFixed(2)} (il gioco dichiara ${m.oraVista.toFixed(2)}): ` +
      `${m.fotogrammi} fotogrammi su ${m.partite} partite, ` +
      `banda g1 ${m.erba[0]} Y ${m.Yerba[0].toFixed(5)} (${m.nErba[0]} campioni) / ` +
      `banda g2 ${m.erba[1]} Y ${m.Yerba[1].toFixed(5)} (${m.nErba[1]})`);
  }
  await browser.close(); srv.chiudi();
  if (errori.length) console.log('errori in pagina: ' + errori.slice(0, 3).join(' | '));

  /* il peggiore su tutte le combinazioni ora x banda: non la media */
  const base = misure[0].righe;
  const out = base.map((r0, i) => {
    let peggio = Infinity, dove = '';
    const per = [];
    for (const m of misure) for (let b = 0; b < 2; b++) {
      const v = m.righe[i].r[b];
      per.push({ ora: m.ora, banda: b, v });
      if (v != null && v < peggio) { peggio = v; dove = `ora ${m.ora.toFixed(2)} banda ${b ? 'g2' : 'g1'}`; }
    }
    return { fam: r0.fam, nome: r0.nome, c1: r0.c1, c2: r0.c2, pat: r0.pat,
             reso: r0.reso, n: r0.n, Ynom: r0.Ynom, Yres: r0.Yres, peggio, dove, per };
  });
  out.sort((a, b) => a.peggio - b.peggio);
  console.log('');
  console.log('DIVISA                          fam       tinta     resa      peggiore   dove');
  for (const r of out) {
    console.log(
      (r.nome + '                              ').slice(0, 30) + '  ' +
      (r.fam + '        ').slice(0, 9) + ' ' +
      r.c1 + '   ' + r.reso + '   ' +
      (r.peggio === Infinity ? '   ---' : (r.peggio < SOGLIA ? 'NO ' : 'ok ') + r.peggio.toFixed(2)) +
      '   ' + r.dove);
  }
  const rossi = out.filter(r => r.peggio < SOGLIA);
  console.log(`\n${out.length} divise misurate, ${rossi.length} sotto ${SOGLIA}:1 nel caso peggiore.`);
  const prova = out.find(r => r.fam === 'PROVA');
  console.log('prova del banco (verde manto, DEVE essere rossa): ' +
    (prova ? prova.peggio.toFixed(2) + ':1 — ' + (prova.peggio < SOGLIA ? 'ROSSA, la sonda sa dire no' : 'VERDE: LA SONDA NON VALE NIENTE') : 'assente'));
  if (JSONOUT) { fs.mkdirSync(path.dirname(path.resolve(JSONOUT)), { recursive: true }); fs.writeFileSync(path.resolve(JSONOUT), JSON.stringify({ file: FILE, semi: SEMI, ore: ORE, misure, out }, null, 1)); console.log('scritto ' + JSONOUT); }
})().catch(e => { console.error('SONDA IN ERRORE:', e.stack || e.message); process.exit(1); });
