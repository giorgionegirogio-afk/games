/* =====================================================================
   _q-cross2.js — IL CROSS CHE ARRIVA, contato in partita vera.

   Sostituisce strumenti/_q-cross.js, che aveva TRE difetti dichiarati dal
   critico e verificati qui riga per riga. Non e' una versione: e' un
   metro diverso, e i suoi numeri NON si confrontano con quelli vecchi.

   1. IL DENOMINATORE CRESCEVA SOTTO LA MISURA. I "momenti al minuto"
      contavano i fotogrammi di play E di golden goal, ma congelavano i
      GOL all'inizio del golden goal e non le parate ne' i legni. Il
      minuto della morte improvvisa entrava nel denominatore col
      numeratore mutilato. Qui il tempo REGOLAMENTARE e' l'unica cosa che
      si misura: appena G.golden diventa vero si congela TUTTO — gol,
      parate, legni, tiri, cross, fotogrammi. Il golden goal si stampa a
      parte, come durata, perche' e' un dato e non un rumore.

   2. I LEGNI VENIVANO DAL BANNER, cioe' dalla riga che la toppa modifica.
      Il metro era editato dalla cosa che doveva giudicare. Qui il legno
      e' l'URTO FISICO: si avvolge hitPosts, si guardano x, y, vx, vy
      prima e dopo, e si conta un contatto quando il pallone e' stato
      spostato o deviato. Si separano i due casi che il banner confondeva:
        LEGNO VERO   urto con il pallone di nessuno (b.owner<0) e sopra
                     le 320 unita' al secondo — l'occasione;
        GRATTATO     urto con il pallone in possesso — il portatore che
                     lo striscia sul montante mentre dribbla.
      Solo il primo entra nei momenti da porta. Nessuna toppa
      sull'annuncio puo' muovere questo numero.

   3. "SEGUITI DA UN TIRO" LEGGEVA ZERO PERCHE' ERA STACCATO. Agganciava
      fireShot, ma la conclusione al volo chiama kickBall e non fireShot,
      e la pendenza del cross si chiudeva al primo tocco — che e' la
      condizione perche' un tiro possa esistere. Qui la pendenza resta
      aperta due secondi OLTRE il primo tocco e il tiro si legge dal
      tabellino (G.stats.tiri della squadra che ha crossato), che copre
      il tiro normale, il volo e il colpo di prima.

   E aggiunge LA COSA CHE MANCAVA, cioe' il numero che dice se il cross
   esiste. Non "quanti cross partono":
       ARRIVATI IN AREA   un COMPAGNO del crossatore prende il pallone
                          mentre sta DENTRO l'area (la stessa scatola di
                          finestraRovesciata: |gx-x| <= GK_AREA_X e
                          |y-FH/2| <= GOAL_H*0,77);
       -> CONCLUSI        e la sua squadra tira entro due secondi;
       -> IN RETE         e segna entro tre.
   Un cross che parte e non arriva non e' un cross: e' un pallone
   regalato, e questo strumento lo chiama con quel nome (RACCOLTI
   DALL'AVVERSARIO).

   E STAMPA GLI INTERVALLI. Con uno spread per partita di dieci volte, una
   mediana a n=24 non risolve un +25%: --contro stampa l'intervallo di
   confidenza bootstrap della DIFFERENZA e il p di permutazione, e se
   l'intervallo contiene lo zero lo dice a lettere — "NON MISURATO".

   COME NON MENTE (invariato da _q-cross.js, che su questo era a posto):
     - Math.random e' xorshift32 a seme fisso, ri-seminato a ogni partita;
     - la sonda non pesca numeri casuali: avvolge e legge, non decide;
     - AUTODIAGNOSI: rigioca le prime partite su una pagina nuova e
       confronta il vettore voce per voce; se una differisce esce 1.

   uso:
     node strumenti/_q-cross2.js --partite 48 --taglia 5 --json fuori/a.json
     node strumenti/_q-cross2.js --gioco /fuori/dopo.html --contro fuori/a.json
     node strumenti/_q-cross2.js --giocatori 1     (una persona, ferma)
     node strumenti/_q-cross2.js --giocatori 2     (due persone, ferme)
     node strumenti/_q-cross2.js --confronta a.json b.json
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
const haFlag = n => process.argv.indexOf('--' + n) > 0;

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const SONDA = `(() => {
  if (window.__qc2) return 'gia-installata';
  const S = {};
  const azzera = () => {
    S.frames=0; S.golden=false; S.goldenFrames=0;
    S.legnoVero=0; S.legnoGrattato=0; S.traversa=0;
    S.crossFatti=0; S.crossInArea=0; S.crossArrivato=0; S.crossConcl=0;
    S.crossGol=0; S.crossRaccAmico=0; S.crossRaccAvv=0; S.crossRaccGK=0;
    S.crossPerso=0; S.crossDg=[];
    S.roveTent=0; S.roveFin=0; S.roveFinApri=0; S._finPrima=false;
    S._pend=[]; S.zMax=0;
    S.congelato=null;
  };
  azzera();

  const _step = window.step;
  const _hitPosts = window.hitPosts;
  const _doCross = window.doCross;
  const _tenta = window.tentaRovesciata;
  const _finestra = window.finestraRovesciata;
  const _showBanner = window.showBanner;

  /* IL LEGNO E' UN URTO, NON UN ANNUNCIO. Si guarda il pallone prima e
     dopo hitPosts: se e' stato spostato o deviato, il palo l'ha preso.
     Nessuna riga di showBanner entra in questo conto. */
  window.hitPosts = function(b){
    const x=b.x, y=b.y, vx=b.vx, vy=b.vy;
    const sp=Math.sqrt(vx*vx+vy*vy);
    const owner=b.owner;
    const r=_hitPosts.apply(this, arguments);
    if(b.x!==x||b.y!==y||b.vx!==vx||b.vy!==vy){
      if(owner<0 && sp>320) S.legnoVero++; else S.legnoGrattato++;
    }
    return r;
  };
  window.showBanner = function(t){
    if(t==='TRAVERSA!') S.traversa++;
    return _showBanner.apply(this, arguments);
  };

  /* la scatola dell'area: la STESSA di finestraRovesciata, presa da li' */
  const inArea = (team, x, y) => {
    const gx = team===0?FW:0;
    return Math.abs(x-gx)<=GK_AREA_X && Math.abs(y-FH/2)<=GOAL_H*0.77;
  };

  window.doCross = function(p){
    const c0=(G.stats.cross[0]|0)+(G.stats.cross[1]|0);
    const r=_doCross.apply(this, arguments);
    const c1=(G.stats.cross[0]|0)+(G.stats.cross[1]|0);
    if(c1>c0){
      S.crossFatti++;
      S._pend.push({ t:0, team:p.team, giu:false, primoTocco:false,
                     arrivato:false, concl:false, gol:false,
                     tiri0:(G.stats.tiri[p.team]|0), gol0:(G.score[p.team]|0) });
    }
    return r;
  };
  window.tentaRovesciata = function(p){ S.roveTent++; return _tenta.apply(this, arguments); };
  window.finestraRovesciata = function(p){
    const v=_finestra.apply(this, arguments);
    if(v) S.roveFin++;
    return v;
  };

  const istantanea = () => ({
    frames:S.frames, legnoVero:S.legnoVero, legnoGrattato:S.legnoGrattato,
    traversa:S.traversa,
    crossFatti:S.crossFatti, crossInArea:S.crossInArea,
    crossArrivato:S.crossArrivato, crossConcl:S.crossConcl, crossGol:S.crossGol,
    crossRaccAmico:S.crossRaccAmico, crossRaccAvv:S.crossRaccAvv,
    crossRaccGK:S.crossRaccGK, crossPerso:S.crossPerso,
    roveTent:S.roveTent, roveFin:S.roveFinApri,
    tiri:(G.stats.tiri[0]|0)+(G.stats.tiri[1]|0),
    parate:(G.stats.parate[0]|0)+(G.stats.parate[1]|0),
    volee:(G.stats.volee[0]|0)+(G.stats.volee[1]|0),
    gol:(G.score[0]|0)+(G.score[1]|0),
    zMax:S.zMax
  });

  window.step = function(){
    const aperta0=S.roveFin;
    _step.apply(this, arguments);
    /* IL CONFINE: il tempo regolamentare finisce quando comincia la morte
       improvvisa, e da li' in poi non si conta piu' NIENTE. Cosi'
       numeratore e denominatore parlano dello stesso pezzo di partita. */
    if(G.golden && !S.golden){ S.golden=true; S.congelato=istantanea(); }
    if(!(G.scene==='play'||G.scene==='golden')) return;
    if(S.golden){ S.goldenFrames++; }
    else S.frames++;
    const b=G.ball;
    if(b.z>S.zMax) S.zMax=b.z;
    const oraAperta = S.roveFin>aperta0;
    if(oraAperta && !S._finPrima) S.roveFinApri++;
    S._finPrima = oraAperta;

    if(S._pend.length){
      const vivi=[];
      for(const c of S._pend){
        c.t++;
        /* dove cade */
        if(!c.giu && b.z<=0){
          c.giu=true;
          const gx=c.team===0?FW:0;
          S.crossDg.push(Math.round(Math.abs(gx-b.x)));
          if(inArea(c.team, b.x, b.y)) S.crossInArea++;
        }
        /* CHI LO PRENDE, e DOVE: e' il numero che conta */
        if(!c.primoTocco && b.owner>=0){
          c.primoTocco=true;
          const q=G.players[b.owner];
          if(q.team===c.team){
            S.crossRaccAmico++;
            if(inArea(c.team, q.x, q.y)){ S.crossArrivato++; c.arrivato=true; }
          }
          else if(q.role==='gk') S.crossRaccGK++;
          else S.crossRaccAvv++;
        }
        /* LA CONCLUSIONE: il tabellino della squadra che ha crossato, e la
           finestra resta aperta OLTRE il primo tocco (2 s = 120 passi).
           Copre il tiro normale (fireShot), il volo e il colpo di prima
           (kickBall dal ramo AL VOLO), perche' li' G.stats.tiri sale
           comunque. */
        if(!c.concl && c.t<=120 && (G.stats.tiri[c.team]|0)>c.tiri0){ c.concl=true; S.crossConcl++; }
        if(!c.gol && c.t<=180 && (G.score[c.team]|0)>c.gol0){ c.gol=true; S.crossGol++; }
        if(c.t>150 && !c.primoTocco){ S.crossPerso++; continue; }
        if(c.t>180) continue;
        vivi.push(c);
      }
      S._pend=vivi;
    }
  };

  window.__qc2 = {
    azzera,
    leggi(){
      const R = S.congelato || istantanea();
      R.goldenSec = Math.round(S.goldenFrames/60*10)/10;
      R.crossDgMed = S.crossDg.length ? S.crossDg.slice().sort((a,b)=>a-b)[S.crossDg.length>>1] : null;
      R.crossDgN = S.crossDg.length;
      R.zMaxTot = Math.round(S.zMax*10)/10;
      R.zMax = Math.round(R.zMax*10)/10;
      return R;
    }
  };
  return 'ok';
})()`;

/* ------------------------------------------------------------- statistica */
const mediana = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const media = a => a.reduce((s, x) => s + x, 0) / a.length;

/* un generatore riproducibile PER LA STATISTICA: il bootstrap e la
   permutazione devono dare lo stesso intervallo a ogni esecuzione, se no
   l'intervallo diventa un'opinione. */
function caso(seme) {
  let s = seme >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
function bootDiff(A, B, stat, giri = 5000, seme = 12345) {
  const r = caso(seme), d = [];
  for (let g = 0; g < giri; g++) {
    const a = [], b = [];
    for (let i = 0; i < A.length; i++) a.push(A[(r() * A.length) | 0]);
    for (let i = 0; i < B.length; i++) b.push(B[(r() * B.length) | 0]);
    d.push(stat(b) - stat(a));
  }
  d.sort((x, y) => x - y);
  return [d[(giri * 0.025) | 0], d[(giri * 0.975) | 0]];
}
function permP(A, B, stat, giri = 5000, seme = 6789) {
  const r = caso(seme);
  const tutti = A.concat(B), n = A.length;
  const oss = Math.abs(stat(B) - stat(A));
  let piu = 0;
  for (let g = 0; g < giri; g++) {
    const c = tutti.slice();
    for (let i = c.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const t = c[i]; c[i] = c[j]; c[j] = t; }
    if (Math.abs(stat(c.slice(n)) - stat(c.slice(0, n))) >= oss - 1e-12) piu++;
  }
  return (piu + 1) / (giri + 1);
}

const DT = 1 / 60;
function derivati(p) {
  const minuti = Math.max(0.001, p.frames * DT / 60);
  const legni = p.legnoVero + p.traversa;
  const momenti = p.gol + p.parate + legni;
  return {
    cross: p.crossFatti,
    conCross: p.crossFatti > 0 ? 1 : 0,
    crossInArea: p.crossInArea,
    crossArrivato: p.crossArrivato,
    crossConcl: p.crossConcl,
    crossGol: p.crossGol,
    crossRaccAmico: p.crossRaccAmico,
    crossRaccAvv: p.crossRaccAvv,
    crossRaccGK: p.crossRaccGK,
    crossPerso: p.crossPerso,
    roveTent: p.roveTent, roveFin: p.roveFin,
    zMax: p.zMaxTot,
    tiri: p.tiri, volee: p.volee, parate: p.parate,
    legni, legnoGrattato: p.legnoGrattato, gol: p.gol,
    durata: p.frames * DT, goldenSec: p.goldenSec,
    momenti, momentiMin: momenti / minuti
  };
}

const VOCI = [
  ['CROSS partiti', 'cross', 2],
  ['  partite con >=1 cross', 'conCross', 2],
  ['  CADUTI dentro l\'area', 'crossInArea', 2],
  ['  ARRIVATI a un compagno in area', 'crossArrivato', 2],
  ['  -> seguiti da un tiro', 'crossConcl', 2],
  ['  -> finiti in rete', 'crossGol', 2],
  ['  raccolti da un compagno', 'crossRaccAmico', 2],
  ['  raccolti da un avversario', 'crossRaccAvv', 2],
  ['  presi dal portiere', 'crossRaccGK', 2],
  ['  persi (nessuno li tocca)', 'crossPerso', 2],
  ['rovesciate: finestre aperte', 'roveFin', 2],
  ['  tentate', 'roveTent', 2],
  ['quota massima palla', 'zMax', 1],
  ['tiri', 'tiri', 1],
  ['  di cui al volo', 'volee', 2],
  ['parate', 'parate', 1],
  ['legni VERI (urto, palla libera)', 'legni', 2],
  ['  grattati sul palo (in possesso)', 'legnoGrattato', 2],
  ['gol regolamentari', 'gol', 2],
  ['tempo regolamentare vivo (s)', 'durata', 1],
  ['golden goal (s)', 'goldenSec', 1],
  ['MOMENTI DA PORTA', 'momenti', 1],
  ['MOMENTI DA PORTA AL MINUTO', 'momentiMin', 2]
];

function stampa(nome, righe) {
  const d = righe.map(derivati);
  console.log(`\n=== ${nome} — ${d.length} partite ===`);
  console.log('  ' + 'voce'.padEnd(34) + 'mediana' + '     media' + '      min' + '      max' + '     somma');
  for (const [et, k, dec] of VOCI) {
    const v = d.map(x => x[k]);
    const f = (x, n) => x.toFixed(n === undefined ? 1 : n).padStart(9);
    console.log('  ' + et.padEnd(34) + f(mediana(v), dec) + f(media(v), 2) + f(Math.min(...v), dec) + f(Math.max(...v), dec) + f(v.reduce((s, x) => s + x, 0), 1));
  }
  return d;
}

/* le voci su cui vale la pena spendere ventimila permutazioni */
const CHIAVE = ['momentiMin', 'cross', 'crossArrivato', 'crossConcl', 'tiri', 'parate', 'legni', 'gol', 'momenti'];

function confronta(prima, dopo) {
  console.log(`\n=== DELTA con INTERVALLO — bootstrap 5000 giri, permutazione 5000 giri ===`);
  console.log(`    n = ${prima.length} contro ${dopo.length}. "NON MISURATO" = l'intervallo al 95% della`);
  console.log(`    differenza contiene lo zero: con questo n il segno non si distingue dal caso.`);
  for (const k of CHIAVE) {
    const A = prima.map(x => x[k]), B = dopo.map(x => x[k]);
    for (const [nome, stat] of [['media', media], ['mediana', mediana]]) {
      const a = stat(A), b = stat(B);
      const [lo, hi] = bootDiff(A, B, stat);
      const p = permP(A, B, stat);
      const zero = lo <= 0 && hi >= 0;
      console.log('  ' + (k + ' (' + nome + ')').padEnd(30) +
        a.toFixed(2).padStart(8) + ' ->' + b.toFixed(2).padStart(8) +
        '   delta ' + ((b - a >= 0 ? '+' : '') + (b - a).toFixed(2)).padStart(7) +
        '   IC95 [' + lo.toFixed(2).padStart(6) + ',' + hi.toFixed(2).padStart(6) + ']' +
        '   p=' + p.toFixed(3) +
        (zero ? '   NON MISURATO' : '   misurato'));
    }
  }
}

async function gioca(browser, porta, partite, semeBase, diff, etichetta, taglia, giocatori) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));

  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, semeBase);

  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('la sonda non si e\' installata: ' + inst);

  const out = [];
  const inizio = Date.now();
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([seme, diff, taglia, gioc]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__qc2.azzera();
      t.startMatch(gioc >= 2 ? 2 : 1, diff, taglia !== 5 ? { size: taglia } : undefined);
      if (!gioc) t.setCpuVsCpu(true);
      /* MODO 3 — DUE SQUADRE UMANE SENZA NESSUN DITO SOPRA.
         Il modo 2 (due persone, dita ferme) e' stato misurato e non dice
         niente: chi batte il calcio d'inizio e' comandato dal dito, il dito
         non si muove, e la partita resta ferma — zero tiri, zero tutto, nei
         due file uguale. Serve a dichiararlo, non a giudicare.
         Il modo 3 toglie il dito da tutti e due i colori (G.ctrl = -1)
         lasciando G.cpu = [false, false]: e' ESATTAMENTE il ramo di codice
         che il critico chiedeva di guardare — aiDecide e aiCarrier che
         girano per i compagni di una squadra UMANA, su tutte e due le
         squadre, con isCpuTeam falso (reazione 0,14 invece di D.react,
         velocita' 0,95, e la scivolata decisa dalla CPU spenta). */
      if (gioc === 3) { G.ctrl[0] = -1; G.ctrl[1] = -1; }
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      const e = window.__qc2.leggi();
      e.scena = t.state;
      return e;
    }, [(semeBase + i) >>> 0, diff, taglia, giocatori]);
    out.push(r);
    if (partite >= 20 && (i + 1) % 12 === 0) console.log(`  --    ${etichetta}: ${i + 1}/${partite} partite`);
  }
  const ms = Date.now() - inizio;
  await ctx.close();
  return { partite: out, ms, errori };
}

{
  const i = process.argv.indexOf('--confronta');
  if (i > 0 && process.argv[i + 1] && process.argv[i + 2]) {
    const A = JSON.parse(fs.readFileSync(path.resolve(process.argv[i + 1]), 'utf8'));
    const B = JSON.parse(fs.readFileSync(path.resolve(process.argv[i + 2]), 'utf8'));
    stampa(A.etichetta, A.crudo); stampa(B.etichetta, B.crudo);
    confronta(A.crudo.map(derivati), B.crudo.map(derivati));
    process.exit(0);
  }
}

(async () => {
  const partite = Math.max(1, +arg('partite', 24) | 0);
  const semeBase = +arg('seme', 20260803);
  const diff = Math.max(0, Math.min(2, +arg('diff', 1) | 0));
  const taglia = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
  const giocatori = Math.max(0, Math.min(3, +arg('giocatori', 0) | 0));
  const etichetta = arg('etichetta', 'FOTOGRAFIA');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const fileJson = arg('json', '');
  const contro = arg('contro', '');
  const diagnosi = !haFlag('no-diagnosi');

  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco di prova inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();

  const chi = giocatori === 0 ? 'CPU contro CPU' : giocatori === 1 ? 'UNA persona (ferma) contro CPU' : giocatori === 2 ? 'DUE persone (ferme)' : 'DUE squadre umane, nessun dito (G.ctrl = -1)';
  console.log(`\n=== CROSS CHE ARRIVA — ${partite} partite, ${chi}, semi ${semeBase}..${semeBase + partite - 1}, ${['Facile', 'Normale', 'Duro'][diff]}, ${taglia} contro ${taglia} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  const A = await gioca(browser, srv.porta, partite, semeBase, diff, etichetta, taglia, giocatori);
  console.log(`  --    ${(A.ms / 1000).toFixed(1)} s in tutto = ${(A.ms / partite / 1000).toFixed(2)} s a partita`);
  const nonFinite = A.partite.filter(p => p.scena !== 'end');
  if (nonFinite.length) console.log(`  NO    ${nonFinite.length} partite non arrivano al fischio finale`);
  if (A.errori.length) console.log(`  NO    eccezioni: ${A.errori[0]}`);

  const d = stampa(etichetta, A.partite);

  const dgTutti = A.partite.filter(p => p.crossDgMed !== null).map(p => p.crossDgMed);
  if (dgTutti.length) console.log(`\n  --    distanza dalla porta del punto di caduta: mediana per partita su ${dgTutti.length}/${partite} partite con almeno un cross, mediana delle mediane ${mediana(dgTutti)}`);
  else console.log('\n  --    punto di caduta: nessun cross, nessuna mediana (non si stampa un sentinella)');

  let diagOK = true;
  if (diagnosi) {
    const n = Math.min(3, partite);
    const B = await gioca(browser, srv.porta, n, semeBase, diff, 'diagnosi', taglia, giocatori);
    const chiavi = ['cross', 'crossArrivato', 'crossConcl', 'tiri', 'parate', 'legni', 'gol', 'momenti', 'durata'];
    const dB = B.partite.map(derivati);
    const guai = [];
    for (let i = 0; i < n; i++) for (const k of chiavi) if (d[i][k] !== dB[i][k]) guai.push(`partita ${i} voce ${k}: ${d[i][k]} contro ${dB[i][k]}`);
    diagOK = guai.length === 0;
    console.log(`\n  ${diagOK ? 'OK  ' : 'NO  '} autodiagnosi: ${n} partite rigiocate su pagina nuova danno lo stesso vettore`);
    if (!diagOK) console.log('        ' + guai.slice(0, 5).join('\n        ') +
      '\n        la misura non e\' riproducibile: lo strumento e\' cieco e non va creduto');
  }

  await browser.close(); srv.chiudi();

  if (fileJson) {
    fs.writeFileSync(path.resolve(fileJson), JSON.stringify({ etichetta, partite, semeBase, diff, taglia, giocatori, gioco: provaAbs || 'repo', crudo: A.partite }, null, 1));
    console.log(`\n  --    crudo salvato in ${fileJson}`);
  }
  if (contro) {
    const prima = JSON.parse(fs.readFileSync(path.resolve(contro), 'utf8'));
    console.log(`\n  --    confronto con ${prima.etichetta} (${prima.partite} partite, seme ${prima.semeBase}, taglia ${prima.taglia}, giocatori ${prima.giocatori | 0})`);
    if (prima.taglia !== taglia || prima.semeBase !== semeBase || (prima.giocatori | 0) !== giocatori)
      console.log('  NO    il confronto NON e\' appaiato: taglia/seme/giocatori diversi');
    confronta(prima.crudo.map(derivati), d);
  }

  if (!diagOK || nonFinite.length || A.errori.length) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
