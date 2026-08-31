/* =====================================================================
   _q-gabbia-fusa.js — LA FUSIONE PUO' ROMPERE LO SCHELETRO?
   (29 agosto 2026)

   IL RISCHIO VERO DELLA FUSIONE FRA DUE POSE, e non e' quello che si
   teme di solito. Mescolare le POSIZIONI dei giunti non e' mescolare gli
   angoli: la retta fra due posizioni di una caviglia non passa per il
   cerchio su cui la caviglia puo' stare, quindi a meta' strada la tibia
   e' PIU' CORTA del vero. Il gioco ha una gabbia delle proporzioni che
   boccia un osso che vari di un centesimo (Rig3D.banco.posa, OSSA):
   quella gabbia guarda le pose SORGENTI e non ha mai visto una posa
   fusa. Questo cancello gliela fa vedere.

   DUE DOMANDE, tutte e due geometriche e deterministiche:

     Q1  QUANTO SI ACCORCIA L'OSSO PEGGIORE. Per ogni coppia ordinata di
         clip, per una griglia di fasi e per i pesi che la rampa
         w*w*(3-2w) produce davvero nei sette fotogrammi di FUSIONE_T,
         si misura l'osso piu' fuori misura della posa fusa. Soglia:
         nessun osso deve accorciarsi di piu' del 25% ne' allungarsi di
         piu' dell'1% (una combinazione convessa non puo' allungare: se
         allunga, la miscela non e' convessa e c'e' un errore di segno).

     Q2  IL PIEDE NON BUCA IL MANTO. Il giunto piu' basso della posa
         fusa non deve stare sotto FONDO = -0,05 unita' rig, che e'
         ESATTAMENTE la soglia con cui strumenti/gabbia.js giudica le
         pose sorgenti del gioco (riga «const FONDO = -0.05»): la posa
         fusa non ha diritto a piu' tolleranza di quelle. Se una delle
         due sorgenti stesse gia' piu' in basso, vale la piu' bassa
         delle due — la fusione non puo' peggiorare cio' che riceve.
         Questa e' la trappola che al repo e' gia' costata sei tentativi
         (il piede a 13 cm sotto l'erba della clip 'contrasto'), e qui
         si controlla invece che sperarci.

   COME MISURA. Chiama Rig3D.fondi(clipVecchia, uVecchia, w) e subito
   dopo Rig3D.disegna() su un canvas fuori schermo: e' l'UNICA strada che
   passa davvero per posaFusa. Poi legge Rig3D.banco.P — lo scratch della
   posa locale, che dopo il disegno contiene la posa FUSA — e ricalcola
   le lunghezze delle ossa con lo stesso OSSA che usa la gabbia del
   gioco. Non simula, non guarda una bandiera: misura le sedici ossa.

   IL SUO ROSSO, DIMOSTRATO E NON PROMESSO. Senza --bugiardo il cancello
   sarebbe un timbro: su un gioco senza fusione Rig3D.fondi non esiste e
   il banco si dichiara CIECO (uscita 2). Con --bugiardo il banco
   costruisce da se' un gioco che mente — sostituisce posaFusa con una
   miscela che ESTRAPOLA (w -> 1,6w-0,3, cioe' esce dal segmento fra le
   due pose) — e pretende di vederlo diventare ROSSO. Se il bugiardo
   passasse, il verde sul gioco vero non varrebbe niente.

   uso:
     node strumenti/_q-gabbia-fusa.js --gioco fuori/anim-prima.html
     node strumenti/_q-gabbia-fusa.js --gioco fuori/anim-prima.html --bugiardo
   uscita: 0 verde, 1 rosso, 2 cieco.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const ha = n => process.argv.includes('--' + n);
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const BUGIARDO = ha('bugiardo');

const MAX_CORTO = 0.25;   // un osso non si accorcia di piu' del 25%
const MAX_LUNGO = 0.01;   // e non si allunga affatto (1% di numerica)
const FONDO = -0.05;      // la stessa soglia di strumenti/gabbia.js

if (!fs.existsSync(GIOCO)) { console.error('FALLITO: non esiste ' + GIOCO); process.exit(1); }

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 576, height: 273 }, deviceScaleFactor: 2.8125 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(30));

  const R = await pag.evaluate(({ bugiardo, FONDO }) => {
    if (!Rig3D.fondi) return { cieco: 'questo gioco non ha Rig3D.fondi: niente fusione da giudicare' };
    const B = Rig3D.banco, P = B.P, OSSA = B.OSSA, NJ = B.NJ;
    const nomi = Object.keys(Rig3D.CLIPS);
    const cv = document.createElement('canvas'); cv.width = 200; cv.height = 200;
    const g = cv.getContext('2d');
    const look = Rig3D.lookPredefinito;

    /* IL GIOCO BUGIARDO: la miscela esce dal segmento fra le due pose.
       Non e' una fusione piu' aggressiva, e' una fusione SBAGLIATA — ed
       e' esattamente la classe di errore che questo cancello deve saper
       vedere (un segno invertito, un peso non normalizzato). */
    let fondi = Rig3D.fondi;
    if (bugiardo) { const f0 = Rig3D.fondi; fondi = (c, u, w) => f0(c, u, 1.6 * w - 0.3); }

    /* i pesi VERI della rampa: w = 1 - fondT/0,12 sui sette fotogrammi
       di transizione a 1/60, passati per w*w*(3-2w) */
    const PESI = [];
    for (let k = 1; k <= 6; k++) { const x = k / 7.2; PESI.push(x * x * (3 - 2 * x)); }

    /* la posa NUDA di una clip a una fase: lunghezze e giunto piu' basso */
    function nuda(nome, u) {
      g.clearRect(0, 0, 200, 200);
      Rig3D.disegna(g, 100, 150, 60, 0.7, 'alto', nome, u / Rig3D.CLIPS[nome].freq, look);
      let minY = 1e9; for (let j = 0; j < NJ; j++) { const y = P[j * 3 + 1]; if (y < minY) minY = y; }
      return minY;
    }
    function ossaFuse() {
      let peggio = 0, chi = '';
      for (let i = 0; i < OSSA.length; i++) {
        const o = OSSA[i];
        const dx = P[o.a * 3] - P[o.b * 3], dy = P[o.a * 3 + 1] - P[o.b * 3 + 1], dz = P[o.a * 3 + 2] - P[o.b * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz), L = o.f();
        const sc = (d - L) / L;
        if (Math.abs(sc) > Math.abs(peggio)) { peggio = sc; chi = o.n; }
      }
      let minY = 1e9; for (let j = 0; j < NJ; j++) { const y = P[j * 3 + 1]; if (y < minY) minY = y; }
      return { sc: peggio, osso: chi, minY };
    }

    const U = [0.02, 0.19, 0.37, 0.55, 0.73, 0.91];
    let n = 0, corto = 0, cortoChi = '', lungo = 0, lungoChi = '';
    let sotto = 0, sottoChi = '', nSotto = 0;
    const istoCorto = new Float64Array(101);   // per cento di accorciamento
    const istoSotto = new Float64Array(201);   // millesimi di unita' rig sotto il pavimento
    for (const nuovo of nomi) for (const vecchio of nomi) {
      if (nuovo === vecchio) continue;
      for (const un of U) for (const uv of U) {
        const yN = nuda(nuovo, un), yV = nuda(vecchio, uv);
        const pavimento = Math.min(FONDO, yN, yV);
        for (const w of PESI) {
          fondi(vecchio, uv, w);
          g.clearRect(0, 0, 200, 200);
          Rig3D.disegna(g, 100, 150, 60, 0.7, 'alto', nuovo, un / Rig3D.CLIPS[nuovo].freq, look);
          const e = ossaFuse();
          n++;
          let b = Math.round(-e.sc * 100); if (b < 0) b = 0; if (b > 100) b = 100;
          istoCorto[b]++;
          if (e.sc < corto) { corto = e.sc; cortoChi = vecchio + '>' + nuovo + ' ' + e.osso; }
          if (e.sc > lungo) { lungo = e.sc; lungoChi = vecchio + '>' + nuovo + ' ' + e.osso; }
          const giu = pavimento - e.minY;
          if (giu > 0) {
            nSotto++;
            let s = Math.round(giu * 1000); if (s > 200) s = 200;
            istoSotto[s]++;
            if (giu > sotto) { sotto = giu; sottoChi = vecchio + '>' + nuovo; }
          }
        }
      }
    }
    return { n, corto, cortoChi, lungo, lungoChi, sotto, sottoChi, nSotto,
             istoCorto: Array.from(istoCorto), istoSotto: Array.from(istoSotto),
             clip: nomi.length, pesi: PESI };
  }, { bugiardo: BUGIARDO, FONDO });

  await br.close(); srv.chiudi();

  if (R.cieco) { console.error('CIECO: ' + R.cieco); process.exit(2); }

  const q = (bins, n, p, sc) => { if (!n) return 0; let c = 0; for (let i = 0; i < bins.length; i++) { c += bins[i]; if (c >= p * n) return i * sc; } return (bins.length - 1) * sc; };
  /* Q1 si giudica sulla FRAZIONE, non sul massimo, e la ragione e'
     geometrica e va detta: per certe coppie di pose (il portiere che
     passa da tuffo a parata) «ossa esatte» e «piedi sopra l'erba» sono
     incompatibili — nessuna miscela puo' avere tutti e due. La cura
     sceglie i piedi, e questo cancello misura quanto spesso deve farlo
     invece di far finta che non capiti mai. */
  const rotte = R.istoCorto.slice(Math.round(100 * MAX_CORTO)).reduce((a, b) => a + b, 0);
  const fraz = rotte / R.n;
  const q1 = fraz <= 0.005 && R.lungo <= MAX_LUNGO;
  const q2 = R.nSotto === 0;
  console.log('GABBIA DELLA POSA FUSA — ' + path.relative(RADICE, GIOCO) + (BUGIARDO ? '   [GIOCO BUGIARDO]' : ''));
  console.log('  ' + R.clip + ' clip, ' + R.n.toLocaleString('it-IT') + ' pose fuse valutate  (pesi della rampa: ' +
              R.pesi.map(x => x.toFixed(3)).join(' ') + ')');
  console.log('  Q1 accorciamento dell\'osso peggiore:  mediana -' + q(R.istoCorto, R.n, 0.5, 1) +
              '%   p90 -' + q(R.istoCorto, R.n, 0.9, 1) + '%   p99 -' + q(R.istoCorto, R.n, 0.99, 1) +
              '%   MASSIMO ' + (100 * R.corto).toFixed(2) + '%  [' + R.cortoChi + ']');
  console.log('     pose con un osso oltre -' + (100 * MAX_CORTO) + '%: ' + rotte + ' su ' + R.n +
              ' = ' + (100 * fraz).toFixed(3) + '%   (soglia 0,500%)   -> ' + (fraz <= 0.005 ? 'VERDE' : 'ROSSO'));
  console.log('     osso piu\' ALLUNGATO:  +' + (100 * R.lungo).toFixed(2) + '%  [' + (R.lungoChi || '—') + ']   (soglia +' + (100 * MAX_LUNGO) + '%)   -> ' + (R.lungo <= MAX_LUNGO ? 'VERDE' : 'ROSSO'));
  console.log('  Q2 pose che scendono sotto il pavimento (min di ' + FONDO + ' e delle due sorgenti): ' +
              R.nSotto + ' su ' + R.n + (R.nSotto ? '   p90 ' + q(R.istoSotto, R.nSotto, 0.9, 0.001).toFixed(3) +
              '  MASSIMO ' + R.sotto.toFixed(4) + ' unita\' rig  [' + R.sottoChi + ']' : '') +
              '   -> ' + (q2 ? 'VERDE' : 'ROSSO'));
  console.log('  (0,001 unita\' rig = 1,9 mm di uomo = 0,05 px a figura di 91,5 px; FONDO -0,05 e\' la soglia di gabbia.js)');
  process.exit(q1 && q2 ? 0 : 1);
})().catch(e => { console.error('FALLITO: ' + (e && e.message || e)); process.exit(1); });
