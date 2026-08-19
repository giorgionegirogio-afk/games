/* =====================================================================
   _z-verbo.js — SOLA MISURA. Non scrive niente nel gioco.

   Quattro domande, e nient'altro:
     1. quando succede un VERBO (tiro, parata, cross, scivolata,
        esultanza, rovesciata) qual e' l'IMBARDATA della figura rispetto
        alla camera?
     2. quanti PIXEL e' alta quella figura, davvero, su uno schermo di
        telefono (915x412, deviceScaleFactor 2)?
     3. quali figure vengono disegnate in camera 'bassa' e quali in
        camera 'alto'?
     4. quanto costa cuocere il fondale della camera bassa?

   COME MISURA, e perche' non e' una seconda copia della verita'.
   Lo strumento AVVOLGE `Rig3D.disegna`, cioe' l'UNICA porta da cui
   passa ogni figura umana del gioco (sette punti di chiamata, tutti
   `Rig3D.disegna(...)`). Per ogni figura effettivamente disegnata
   registra i parametri VERI con cui e' stata disegnata — nome della
   camera, clip, fase, imbardata, altezza apparente hPx — piu' la
   matrice di trasformazione corrente del contesto, letta con
   `getTransform()`. Il prodotto hPx x scala verticale della matrice E'
   l'altezza della figura in pixel di periferica. Nessuna formula
   ricopiata dal gioco: il gioco la dichiara disegnandola.

   Il ciclo e' quello vero: `__test.simulate(1/60)` seguito da
   `__test.disegna()`, cioe' step + render come nel rAF. Serve perche'
   la camera (G.cam.z, G.view.S2) si aggiorna SOLO dentro render(): una
   misura di pixel fatta senza disegnare leggerebbe uno zoom fermo al
   valore di partenza.

   L'IDENTITA' GEOMETRICA che si sta interrogando (gia' verificata a
   banco su Rig3D, qui solo applicata):
        sigma2 = (hPx / 1,9) * |sin(imbardata)|      pixel per metro
   e' il valore singolare MINIMO della mappa (quota, profondita') ->
   schermo. hPx e 1,9 sono nelle stesse unita' (1,9 m = statura del rig),
   quindi sigma2 e' in PIXEL PER METRO di spostamento sagittale.

   uso:
     node strumenti/_z-verbo.js
     node strumenti/_z-verbo.js --partite 24 --seme 20260803
     node strumenti/_z-verbo.js --umano        una passata con il comandato
     node strumenti/_z-verbo.js --json fuori/verbo.json
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

const PARTITE = +arg('partite', 16);
const SEME = +arg('seme', 20260803);
const TAGLIA = +arg('taglia', 5);
const UMANO = haFlag('umano');
const JSONOUT = arg('json', '');

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RADICE) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* =====================================================================
   LA SONDA. Vive dentro la pagina. Avvolge due funzioni e non ne
   modifica nessuna: drawPlayer per sapere DI CHI e' la figura che sta
   per essere disegnata, Rig3D.disegna per registrare come e' disegnata.
   Nessun wrapper pesca un numero casuale.
   ===================================================================== */
const SONDA = String.raw`(() => {
  if (window.__zv) return 'gia-installata';

  /* i sei verbi che la giuria deve poter nominare, piu' il resto per
     contesto. La mappa clip -> verbo e' l'unica cosa dichiarata qui:
     i nomi delle clip sono quelli di Rig3D.CLIPS. */
  const VERBO = {
    tiro:'tira', parata:'para', tuffo:'para', presa:'para',
    cross:'crossa', scivolata:'scivola', rovesciata:'rovescia',
    esultanza:'esulta', pugno:'esulta', ginocchia:'esulta', cielo:'esulta'
  };

  const S = {
    fig: 0,            // figure disegnate in tutto
    perCam: {},        // camera -> conteggio
    verbFrame: [],     // un record per FIGURA-FOTOGRAMMA in cui c'e' un verbo
    verbOnset: [],     // un record per INIZIO di verbo
    altAlto: [],       // hPx in pixel di periferica, camera 'alto', in gioco
    altBassa: [],      // idem, camera 'bassa'
    campioni: [],      // (clip,u,yaw,hPxDev) per la misura dell'inchiostro
    ultimoClip: {},    // chiave figura -> ultima clip vista
    scene: {},         // scena -> figure disegnate
  };
  let CUR = null;      // il giocatore in corso di disegno (da drawPlayer)

  const _drawPlayer = window.drawPlayer;
  if (typeof _drawPlayer === 'function') {
    window.drawPlayer = function(p){
      const pi = G.players.indexOf(p);
      CUR = {
        pi, team:p.team, ruolo:p.role,
        ctrl: (!G.cpu[p.team] && G.ctrl[p.team]===pi),
        palla: !!(G.ball && G.ball.owner===pi),
        squash: p.squash||1,
        vicinoPalla: G.ball ? Math.hypot(p.x-G.ball.x, p.y-G.ball.y) : -1,
      };
      try { return _drawPlayer.apply(this, arguments); }
      finally { CUR = null; }
    };
  }

  const _dis = Rig3D.disegna;
  Rig3D.disegna = function(g, cx, cy, hPx, yaw, nomeCam, nomeClip, tSec, look, senzaOmbra, pxs, filo){
    /* la scala verticale VERA di questo contesto, in pixel di periferica
       per unita' di disegno: la seconda colonna della matrice 2x2. */
    let sc = 1;
    try { const m = g.getTransform(); sc = Math.hypot(m.b, m.d); } catch(e){}
    const hDev = hPx * sc;
    const scena = G.scene;
    S.fig++;
    S.perCam[nomeCam] = (S.perCam[nomeCam]||0)+1;
    S.scene[scena+'/'+nomeCam] = (S.scene[scena+'/'+nomeCam]||0)+1;

    /* l'imbardata riportata nel primo giro [0,2pi) e il seno assoluto */
    let y2 = yaw % (Math.PI*2); if (y2 < 0) y2 += Math.PI*2;
    const sn = Math.abs(Math.sin(yaw));
    const sigma2 = (hDev/1.9) * sn;          // pixel di periferica per metro
    const sigmaQ = hDev/1.9;                 // l'asse della QUOTA, per confronto

    /* l'altezza in pixel di ogni figura in gioco (camera 'alto'):
       e' la domanda 2, e va misurata su TUTTE le figure, non solo sui
       verbi */
    if (nomeCam === 'alto' && (scena==='play'||scena==='golden'))
      S.altAlto.push([+hDev.toFixed(2), CUR?(CUR.ctrl?1:0):-1, CUR?(CUR.palla?1:0):-1,
                      CUR?+CUR.squash.toFixed(4):0, CUR?Math.round(CUR.vicinoPalla):-1,
                      nomeClip==='fermo'?1:0]);
    if (nomeCam === 'bassa') S.altBassa.push(+hDev.toFixed(2));

    const v = VERBO[nomeClip];
    if (v) {
      const rec = [v, nomeClip, +yaw.toFixed(4), +sn.toFixed(4), +hDev.toFixed(2),
                   +sigma2.toFixed(3), nomeCam, scena,
                   CUR?(CUR.ctrl?1:0):-1, CUR?(CUR.palla?1:0):-1,
                   CUR?Math.round(CUR.vicinoPalla):-1];
      S.verbFrame.push(rec);
      /* la chiave che identifica LA FIGURA fra un fotogramma e l'altro.
         Per le figure in pianta e' l'indice del giocatore; per quelle
         della camera bassa — che non passano da drawPlayer — e' la loro
         ascissa a schermo arrotondata: i due attori del dischetto stanno
         a centinaia di pixel l'uno dall'altro. Senza questo, i due
         attori condividevano una chiave sola e ogni fotogramma contava
         come un nuovo inizio di verbo. */
      const k = nomeCam + '|' + (CUR ? CUR.pi : ('r' + Math.round(cx/24)));
      if (S.ultimoClip[k] !== nomeClip) {
        S.verbOnset.push(rec);
        if (S.campioni.length < 1500)
          S.campioni.push([nomeClip, +tSec.toFixed(5), +yaw.toFixed(4), +hDev.toFixed(3), nomeCam]);
      }
      S.ultimoClip[k] = nomeClip;
    } else {
      S.ultimoClip[nomeCam + '|' + (CUR ? CUR.pi : ('r' + Math.round(cx/24)))] = nomeClip;
    }
    return _dis.apply(this, arguments);
  };

  window.__zv = {
    azzera(){ S.fig=0; S.perCam={}; S.verbFrame.length=0; S.verbOnset.length=0;
              S.altAlto.length=0; S.altBassa.length=0; S.ultimoClip={}; S.scene={}; },
    svuotaCampioni(){ const c=S.campioni.slice(); S.campioni.length=0; return c; },
    leggi(){ return { fig:S.fig, perCam:S.perCam, scene:S.scene,
                      verbFrame:S.verbFrame.slice(), verbOnset:S.verbOnset.slice(),
                      altAlto:S.altAlto.slice(), altBassa:S.altBassa.slice() }; },
    /* CONTROLLO DI COERENZA: la scala letta dalla matrice deve essere il
       prodotto dichiarato dal gioco. Se un giorno non lo fosse, lo dice
       questo numero e non una supposizione. */
    coerenza(){
      return { S2: G.view.S2, DPR: window.devicePixelRatio,
               atteso: (G.view.S2||1)*1.18*Math.min(2,window.devicePixelRatio||1),
               RIG_H: RIG_H, P_DIS: P_DIS, SCALE: SCALE, camZ: G.cam.z,
               VW: VW, VH: VH, telaW: document.querySelector('canvas').width,
               telaH: document.querySelector('canvas').height };
    },
    /* L'INCHIOSTRO: la figura ridisegnata DA SOLA su una tela fuori
       schermo, con la stessa Rig3D e la stessa altezza apparente in
       pixel di periferica. Restituisce il riquadro dei pixel davvero
       dipinti — cioe' quanto e' alta la figura, non quanto e' alto il
       parametro. */
    inchiostro(campioni){
      const W=520, H=520;
      const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
      const g=cv.getContext('2d', {willReadFrequently:true});
      const out=[];
      for(const c of campioni){
        const [clip,tSec,yaw,hDev,cam]=c;
        g.setTransform(1,0,0,1,0,0);
        g.clearRect(0,0,W,H);
        Rig3D.disegna(g, W/2, H*0.78, hDev, yaw, cam, clip, tSec,
                      Rig3D.lookPredefinito, true, 1, 0);
        const d=g.getImageData(0,0,W,H).data;
        let x0=1e9,y0=1e9,x1=-1,y1=-1;
        for(let y=0;y<H;y++){
          const r=y*W*4;
          for(let x=0;x<W;x++){
            if(d[r+x*4+3]>24){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
          }
        }
        out.push({clip, cam, hDev:+hDev.toFixed(2), yaw:+yaw.toFixed(3),
                  inkH: y1<0?0:(y1-y0+1), inkW: x1<0?0:(x1-x0+1)});
      }
      return out;
    },
    /* LO SPESSORE DI UN ARTO in pixel di periferica: si misura sulla
       stessa figura ridisegnata, contando la corda orizzontale piu'
       stretta del braccio in una posa a braccio disteso. Serve alla
       soglia dichiarata di leggibilita', e va MISURATO. */
    spessoreArto(hDev){
      const W=520,H=520;
      const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
      const g=cv.getContext('2d',{willReadFrequently:true});
      g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,W,H);
      /* 'cielo': braccia in alto e distese, il tratto piu' isolato */
      Rig3D.disegna(g, W/2, H*0.80, hDev, Math.PI/2, 'alto', 'cielo', 0.5,
                    Rig3D.lookPredefinito, true, 1, 0);
      const d=g.getImageData(0,0,W,H).data;
      /* per ogni riga, la lunghezza delle corde piene: la MEDIANA delle
         corde strette (sotto la mediana generale) e' lo spessore d'arto */
      const corde=[];
      for(let y=0;y<H;y++){
        let run=0;
        for(let x=0;x<W;x++){
          if(d[(y*W+x)*4+3]>24) run++;
          else { if(run>0) corde.push(run); run=0; }
        }
        if(run>0) corde.push(run);
      }
      corde.sort((a,b)=>a-b);
      const q=p=>corde.length?corde[Math.min(corde.length-1,Math.floor(corde.length*p))]:0;
      return { n:corde.length, q10:q(0.10), q25:q(0.25), mediana:q(0.50), q75:q(0.75) };
    },
    /* L'ESTENSIONE SAGITTALE DELLE POSE. Rig3D espone la posa cruda
       (banco.P: x lato, y su, z AVANTI, in unita' di statura 1,9).
       Per ogni clip, su 64 fasi, quanto e' larga la posa lungo z —
       cioe' quanta informazione c'e' DA PERDERE sull'asse che si perde —
       e quanto lungo y, l'asse che non si perde mai. */
    estensioni(clips){
      const B=Rig3D.banco, out={};
      for(const c of clips){
        const dz=[], dy=[], dx=[];
        for(let k=0;k<64;k++){
          B.posa(c, k/64);
          let z0=1e9,z1=-1e9,y0=1e9,y1=-1e9,x0=1e9,x1=-1e9;
          for(let j=0;j<B.NJ;j++){
            const x=B.P[j*3], y=B.P[j*3+1], z=B.P[j*3+2];
            if(z<z0)z0=z; if(z>z1)z1=z;
            if(y<y0)y0=y; if(y>y1)y1=y;
            if(x<x0)x0=x; if(x>x1)x1=x;
          }
          dz.push(z1-z0); dy.push(y1-y0); dx.push(x1-x0);
        }
        const md=a=>{const b=a.slice().sort((p,q)=>p-q);return b[32];};
        out[c]={dz_med:+md(dz).toFixed(4), dz_max:+Math.max(...dz).toFixed(4),
                dy_med:+md(dy).toFixed(4), dy_max:+Math.max(...dy).toFixed(4),
                dx_med:+md(dx).toFixed(4)};
      }
      return out;
    },
    /* IL COSTO DI ENTRARE IN CAMERA BASSA: quanto ci mette duelFondo a
       cuocere il suo fondale a schermo pieno, e quanto a ripescarlo
       dalla cache. Misura il gioco, non un'ipotesi. */
    costoFondale(){
      if (typeof duelFondo !== 'function' || typeof duelGeo !== 'function')
        return { errore:'duelFondo/duelGeo non raggiungibili' };
      const g = duelGeo();
      const t=[];
      /* cottura vera: si sporca la chiave della cache mettendo mano solo
         alla nostra copia della geometria (il gioco non si tocca) */
      for(let i=0;i<3;i++){
        const g2 = Object.assign({}, g, {hz:g.hz+i+1});
        const a=performance.now(); duelFondo(g2, 1); const b=performance.now();
        t.push(+(b-a).toFixed(2));
      }
      const a2=performance.now(); for(let i=0;i<20;i++) duelFondo(g,1); const b2=performance.now();
      return { cottura_ms:t, cache_ms_per_chiamata:+((b2-a2)/20).toFixed(4) };
    },
  };
  return 'ok';
})()`;

/* --------------------------------------------------------------- statistica */
const ord = a => a.slice().sort((x, y) => x - y);
const quart = (a, q) => { if (!a.length) return NaN; const b = ord(a); const i = (b.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return b[lo] + (b[hi] - b[lo]) * (i - lo); };
const media = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN;
/* MIN e MAX A CICLO, non con lo spread: Math.min(...a) su un array di
   ottocentomila elementi solleva RangeError (stack). E' costato una
   corsa intera di cinquanta minuti, il 18 agosto. */
const mn = a => { let m = Infinity; for (const x of a) if (x < m) m = x; return m; };
const mx = a => { let m = -Infinity; for (const x of a) if (x > m) m = x; return m; };
const f = (x, d) => (isFinite(x) ? x.toFixed(d === undefined ? 2 : d) : '  -');

function istogramma(vals, bordi, etichette) {
  const c = new Array(bordi.length).fill(0);
  for (const v of vals) {
    let k = bordi.length - 1;
    for (let i = 0; i < bordi.length; i++) if (v < bordi[i]) { k = i; break; }
    c[k]++;
  }
  const tot = vals.length || 1;
  const out = [];
  for (let i = 0; i < c.length; i++) {
    const barra = '#'.repeat(Math.round(c[i] / tot * 52));
    out.push('    ' + etichette[i].padEnd(18) + String(c[i]).padStart(6) + '  ' +
      (c[i] / tot * 100).toFixed(1).padStart(5) + '%  ' + barra);
  }
  return out.join('\n');
}

/* --------------------------------------------------------------- la passata */
async function passata(browser, porta, etichetta, umano) {
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT'
  });
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
  }, SEME);

  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(250);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('la sonda non si e\' installata: ' + inst);

  const acc = { verbFrame: [], verbOnset: [], altAlto: [], altBassa: [], perCam: {}, scene: {}, fig: 0 };
  let coerenza = null, campioni = [];
  const t0 = Date.now();
  for (let i = 0; i < PARTITE; i++) {
    const r = await pag.evaluate(([seme, taglia, umano]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__zv.azzera();
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      if (!umano) t.setCpuVsCpu(true);
      let n = 0;
      const MAX = 60 * 240;
      while (t.state !== 'end' && n < MAX) { t.simulate(1 / 60); t.disegna(); n++; }
      const out = window.__zv.leggi();
      out.frames = n; out.scena = t.state;
      return out;
    }, [(SEME + i * 7919) >>> 0, TAGLIA, umano]);
    acc.fig += r.fig; acc.frames = (acc.frames || 0) + r.frames;
    for (const k in r.perCam) acc.perCam[k] = (acc.perCam[k] || 0) + r.perCam[k];
    for (const k in r.scene) acc.scene[k] = (acc.scene[k] || 0) + r.scene[k];
    acc.verbFrame.push(...r.verbFrame);
    acc.verbOnset.push(...r.verbOnset);
    acc.altAlto.push(...r.altAlto);
    acc.altBassa.push(...r.altBassa);
    if (i === 0) coerenza = await pag.evaluate(() => window.__zv.coerenza());
    console.log(`  -- ${etichetta}: partita ${i + 1}/${PARTITE}  (${r.frames} fotogrammi, ${r.verbOnset.length} inizî di verbo, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  campioni = await pag.evaluate(() => window.__zv.svuotaCampioni());
  const costo = await pag.evaluate(() => window.__zv.costoFondale());
  const est = await pag.evaluate(() => window.__zv.estensioni(Object.keys(Rig3D.CLIPS)));
  await ctx.close();
  return { acc, coerenza, campioni, costo, est, errori, ms: Date.now() - t0 };
}

/* ------------------------------------------------------------------- stampa */
(async () => {
  const srv = await servi();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const R = await passata(browser, srv.porta, UMANO ? 'UMANO' : 'CPUvCPU', UMANO);
    const A = R.acc;
    /* IL CRUDO SI SALVA PRIMA DI ESSERE LETTO. Il 18 agosto questa corsa
       e' morta in stampa — Math.min(...) su ottocentomila elementi — e con
       lei cinquanta minuti di banco, perche' il salvataggio stava in fondo.
       Un attrezzo di misura scrive quello che ha misurato PRIMA di
       interpretarlo: l'interpretazione si puo' rifare in un secondo, la
       misura no. */
    if (JSONOUT) {
      const dest = path.resolve(RADICE, JSONOUT);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, JSON.stringify({
        partite: PARTITE, seme: SEME, taglia: TAGLIA, umano: UMANO,
        coerenza: R.coerenza, perCam: A.perCam, scene: A.scene, est: R.est,
        altAlto: A.altAlto, altBassa: A.altBassa,
        verbOnset: A.verbOnset, verbFrame: A.verbFrame, costo: R.costo
      }));
      console.log('\n   crudo salvato SUBITO in ' + JSONOUT);
    }

    console.log('\n=====================================================================');
    console.log(' _z-verbo — telefono 915x412, deviceScaleFactor 2  (tela ' +
      (R.coerenza ? R.coerenza.telaW + 'x' + R.coerenza.telaH : '?') + ')');
    console.log(' partite: ' + PARTITE + '   taglia: ' + TAGLIA + '   seme base: ' + SEME +
      '   ' + (UMANO ? 'squadra 0 UMANA (nessun ingresso)' : 'CPU contro CPU'));
    console.log(' fotogrammi disegnati: ' + A.frames + '   figure disegnate: ' + A.fig);
    console.log('=====================================================================');
    if (R.errori.length) console.log(' ERRORI DI PAGINA: ' + R.errori.join(' | '));

    console.log('\n-- CAMERA USATA DA OGNI FIGURA DISEGNATA -------------------------');
    for (const k of Object.keys(A.perCam).sort())
      console.log('   camera ' + k.padEnd(8) + String(A.perCam[k]).padStart(9) +
        '  ' + (A.perCam[k] / A.fig * 100).toFixed(3) + '%');
    console.log('   per scena:');
    for (const k of Object.keys(A.scene).sort())
      console.log('     ' + k.padEnd(22) + String(A.scene[k]).padStart(9) +
        '  ' + (A.scene[k] / A.fig * 100).toFixed(3) + '%');

    /* ---------------- 2. ALTEZZA DELLA FIGURA IN PIXEL ---------------- */
    const hAlto = A.altAlto.map(r => r[0]);
    const hCtrl = A.altAlto.filter(r => r[1] === 1).map(r => r[0]);
    const hPalla = A.altAlto.filter(r => r[2] === 1).map(r => r[0]);
    const hAltri = A.altAlto.filter(r => r[1] !== 1 && r[2] !== 1).map(r => r[0]);
    const hLod = A.altAlto.filter(r => r[5] === 1).map(r => r[0]);
    const squash = A.altAlto.map(r => r[3]);
    console.log('\n-- 2. ALTEZZA DELLA FIGURA, IN PIXEL DI PERIFERICA ---------------');
    console.log('   (hPx passato a Rig3D.disegna x scala verticale della matrice del contesto)');
    const rigaH = (n, a) => '   ' + n.padEnd(26) + String(a.length).padStart(8) +
      '  min ' + f(mn(a), 1) + '  q25 ' + f(quart(a, .25), 1) +
      '  MED ' + f(quart(a, .50), 1) + '  q75 ' + f(quart(a, .75), 1) +
      '  max ' + f(mx(a), 1) + '  media ' + f(media(a), 1);
    if (hAlto.length) console.log(rigaH('tutte (camera alto)', hAlto));
    if (hCtrl.length) console.log(rigaH('  il COMANDATO', hCtrl));
    if (hPalla.length) console.log(rigaH('  chi ha la PALLA', hPalla));
    if (hAltri.length) console.log(rigaH('  gli altri', hAltri));
    if (hLod.length) console.log(rigaH('  in dettaglio ridotto', hLod));
    if (A.altBassa.length) console.log(rigaH('camera BASSA (rigori/gol)', A.altBassa));
    console.log('   squash (accorciamento): min ' + f(mn(squash), 3) +
      '  MED ' + f(quart(squash, .5), 3) + '  max ' + f(mx(squash), 3));
    if (R.coerenza) {
      console.log('   controllo di coerenza sul primo fotogramma:');
      console.log('     G.view.S2 = ' + f(R.coerenza.S2, 4) + '   SCALE = ' + f(R.coerenza.SCALE, 4) +
        '   G.cam.z = ' + f(R.coerenza.camZ, 4) + '   DPR = ' + R.coerenza.DPR);
      console.log('     scala attesa S2 x P_DIS x DPR = ' + f(R.coerenza.atteso, 4) +
        '   -> altezza attesa RIG_H x scala = ' + f(R.coerenza.RIG_H * R.coerenza.atteso, 2) + ' px');
    }

    /* ---------------- 1. IMBARDATA AI MOMENTI DEL VERBO --------------- */
    const VS = ['tira', 'para', 'crossa', 'scivola', 'esulta', 'rovescia'];
    const BORDI = [0.02, 0.05, 0.10, 0.20, 0.30, 0.50, 0.70, 0.90, 1.01];
    const ETI = ['|sin| < 0,02', '0,02-0,05', '0,05-0,10', '0,10-0,20', '0,20-0,30',
      '0,30-0,50', '0,50-0,70', '0,70-0,90', '0,90-1,00'];
    const stampaVerbi = (dati, titolo) => {
      console.log('\n-- 1. ' + titolo + ' -----------------');
      const tot = dati.length;
      console.log('   momenti in tutto: ' + tot);
      const perVerbo = {};
      for (const r of dati) (perVerbo[r[0]] = perVerbo[r[0]] || []).push(r);
      console.log('   ' + 'verbo'.padEnd(10) + 'n'.padStart(7) + '   ' +
        '|sin(imb)| MED'.padStart(15) + '   sigma2 MED (px/m)'.padStart(20) +
        '   quota MED (px/m)'.padStart(19) + '   |sin|<0,10   <0,20   <0,30');
      const linea = (nome, d) => {
        if (!d.length) { console.log('   ' + nome.padEnd(10) + '      0'); return; }
        const sn = d.map(r => r[3]), s2 = d.map(r => r[5]), qq = d.map(r => r[4] / 1.9);
        const fr = t => (d.filter(r => r[3] < t).length / d.length * 100).toFixed(1).padStart(6) + '%';
        console.log('   ' + nome.padEnd(10) + String(d.length).padStart(7) + '   ' +
          f(quart(sn, .5), 3).padStart(15) + '   ' + f(quart(s2, .5), 1).padStart(20) +
          '   ' + f(quart(qq, .5), 1).padStart(19) + '   ' + fr(0.10) + '  ' + fr(0.20) + '  ' + fr(0.30));
      };
      for (const v of VS) {
        linea(v, perVerbo[v] || []);
        const perClip = {};
        for (const r of (perVerbo[v] || [])) (perClip[r[1]] = perClip[r[1]] || []).push(r);
        const cl = Object.keys(perClip);
        if (cl.length > 1) for (const c of cl.sort()) linea('  ' + c, perClip[c]);
      }
      const tuttiSn = dati.map(r => r[3]);
      console.log('\n   ISTOGRAMMA di |sin(imbardata)| su tutti i momenti di verbo:');
      console.log(istogramma(tuttiSn, BORDI, ETI));
      /* e l'angolo dall'asse cieco, che e' quello che si legge a occhio */
      const gradi = dati.map(r => {
        const a = Math.abs(Math.asin(Math.min(1, r[3]))) * 180 / Math.PI; return a;
      });
      const GB = [2, 5, 10, 15, 20, 30, 45, 60, 91];
      const GE = ['< 2 gradi', '2-5', '5-10', '10-15', '15-20', '20-30', '30-45', '45-60', '60-90'];
      console.log('\n   ISTOGRAMMA dell\'angolo fra la figura e l\'ASSE CIECO (su/giu\' per lo schermo):');
      console.log(istogramma(gradi, GB, GE));
      return { tuttiSn, dati };
    };

    /* SI ESCLUDE LA SCENA 'freekick'. Durante il duello dal dischetto il
       gioco disegna PRIMA tutto il mondo in pianta e POI ci stende sopra
       il fondale a schermo pieno del duello (riga 21984 del gioco): quelle
       figure in camera 'alto' esistono nel rasterizzatore e non sullo
       schermo. Contarle vorrebbe dire misurare pixel che nessuno vede. */
    const VISIBILE = s => s === 'play' || s === 'golden' || s === 'kickoff' || s === 'goal';
    const onsetGioco = A.verbOnset.filter(r => r[6] === 'alto' && VISIBILE(r[7]));
    const frameGioco = A.verbFrame.filter(r => r[6] === 'alto' && VISIBILE(r[7]));
    const onsetBassa = A.verbOnset.filter(r => r[6] === 'bassa');
    const frameBassa = A.verbFrame.filter(r => r[6] === 'bassa');
    const O = stampaVerbi(onsetGioco, 'IMBARDATA ALL\'INIZIO DEL VERBO (camera alto, scene visibili)');
    const F = stampaVerbi(frameGioco, 'IMBARDATA IN OGNI FOTOGRAMMA DI VERBO (camera alto, scene visibili)');
    if (frameBassa.length) stampaVerbi(frameBassa, 'IMBARDATA IN CAMERA BASSA (duello e ripresa del gol)');

    /* ---------------- inchiostro e spessore --------------------------- */
    console.log('\n-- L\'INCHIOSTRO: quanto e\' alta la figura DIPINTA -----------------');
    const pag2 = await (async () => {
      const c = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      const p = await c.newPage();
      await p.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
      await p.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
      await p.evaluate(SONDA);
      return { p, c };
    })();
    const passo = Math.max(1, Math.ceil(R.campioni.length / 240));
    const camp = R.campioni.filter((_, i) => i % passo === 0).slice(0, 240);
    const ink = camp.length ? await pag2.p.evaluate(c => window.__zv.inchiostro(c), camp) : [];
    if (ink.length) {
      const perClip = {};
      for (const k of ink) (perClip[k.clip + ' / ' + k.cam] = perClip[k.clip + ' / ' + k.cam] || []).push(k);
      console.log('   clip / camera        n   hPx nominale MED   altezza DIPINTA MED   rapporto   larghezza MED');
      for (const c of Object.keys(perClip).sort()) {
        const d = perClip[c];
        const hn = d.map(x => x.hDev), hi = d.map(x => x.inkH), wi = d.map(x => x.inkW);
        console.log('   ' + c.padEnd(19) + String(d.length).padStart(4) + '   ' +
          f(quart(hn, .5), 1).padStart(15) + '   ' + f(quart(hi, .5), 1).padStart(19) + '   ' +
          f(quart(hi, .5) / quart(hn, .5), 3).padStart(8) + '   ' + f(quart(wi, .5), 1).padStart(13));
      }
      const tuttiInk = ink.map(x => x.inkH);
      console.log('   TUTTE: min ' + f(mn(tuttiInk), 1) + '  MED ' + f(quart(tuttiInk, .5), 1) +
        '  max ' + f(mx(tuttiInk), 1));
    }
    const hMed = hAlto.length ? quart(hAlto, .5) : 94;
    const sp = await pag2.p.evaluate(h => window.__zv.spessoreArto(h), hMed);
    console.log('   spessore dei tratti a hPx=' + f(hMed, 1) + ' px (corde orizzontali piene, posa "cielo"):');
    console.log('     n=' + sp.n + '  q10 ' + sp.q10 + '  q25 ' + sp.q25 + '  MEDIANA ' + sp.mediana + '  q75 ' + sp.q75 + ' px');
    await pag2.c.close();

    /* ------- l'estensione sagittale delle pose, e i pixel veri --------- */
    console.log('\n-- QUANTI PIXEL HA DAVVERO L\'ASSE SAGITTALE ----------------------');
    console.log('   Estensione della posa nel corpo (unita\' di statura 1,9) e sua');
    console.log('   proiezione a schermo con hPx mediano = ' + f(hMed, 1) + ' px di periferica.');
    console.log('   ' + 'clip'.padEnd(12) + 'dz MED'.padStart(8) + 'dz MAX'.padStart(8) +
      'dy MED'.padStart(8) + '   | px SAGITTALI a |sin| MED   a |sin|=1   | px di QUOTA');
    const VCL = ['tiro', 'parata', 'tuffo', 'presa', 'cross', 'scivolata', 'rovesciata',
      'esultanza', 'pugno', 'ginocchia', 'cielo', 'corsa'];
    const snPerClip = {};
    for (const r of frameGioco) (snPerClip[r[1]] = snPerClip[r[1]] || []).push(r[3]);
    const pxSag = {};
    for (const c of VCL) {
      const e = R.est[c]; if (!e) continue;
      const snm = snPerClip[c] ? quart(snPerClip[c], .5) : NaN;
      const kq = hMed / 1.9;
      const a = e.dz_med * kq * (isFinite(snm) ? snm : 0);
      const b = e.dz_med * kq;
      const q = e.dy_med * kq;
      pxSag[c] = { a, b, q, snm };
      console.log('   ' + c.padEnd(12) + f(e.dz_med, 3).padStart(8) + f(e.dz_max, 3).padStart(8) +
        f(e.dy_med, 3).padStart(8) + '   | ' + (isFinite(snm) ? f(a, 1).padStart(22) : '           (mai in campo)') +
        '   ' + f(b, 1).padStart(9) + '   | ' + f(q, 1).padStart(11));
    }

    /* ---------------- la soglia dichiarata ---------------------------- */
    console.log('\n-- LA SOGLIA, DICHIARATA -----------------------------------------');
    const W_ARTO = sp.q10 || 8;
    console.log('   La larghezza del TRATTO piu\' sottile con cui la figura e\' dipinta');
    console.log('   (decile inferiore delle corde piene, misurato qui sopra): ' + W_ARTO + ' px.');
    console.log('   Riscontro indipendente col conto scritto nel gioco (braccio 0,138 x');
    console.log('   hPx/(1,9 cos42) = ' + f(0.138 * hMed / (1.9 * Math.cos(42 * Math.PI / 180)), 1) +
      ' px di riempimento, ' + f(0.138 * hMed / (1.9 * Math.cos(42 * Math.PI / 180)) * 1.48, 1) + ' col contorno).');
    console.log('   REGOLA: uno spostamento sagittale si VEDE solo se supera la larghezza');
    console.log('   del tratto che lo disegna. Sotto, i due tratti si sovrappongono e le');
    console.log('   due pose danno gli stessi pixel.');
    console.log('');
    console.log('   ' + 'clip'.padEnd(12) + '  px sagittali (mediana in campo)   supera ' + W_ARTO + ' px?');
    for (const c of VCL) {
      if (!pxSag[c] || !isFinite(pxSag[c].snm)) continue;
      console.log('   ' + c.padEnd(12) + f(pxSag[c].a, 1).padStart(20) + '                ' +
        (pxSag[c].a > W_ARTO ? 'SI' : 'NO') + '   (al meglio possibile: ' + f(pxSag[c].b, 1) + ' px)');
    }
    /* la frazione di momenti sotto soglia, per verbo, con la soglia
       ricavata dall'estensione VERA di quella clip */
    console.log('\n   FRAZIONE DI MOMENTI IN CUI L\'ASSE SAGITTALE STA SOTTO IL TRATTO:');
    for (const [nome, d] of [['inizî di verbo', onsetGioco], ['fotogrammi di verbo', frameGioco]]) {
      if (!d.length) continue;
      let sotto = 0, valid = 0;
      const perV = {};
      for (const r of d) {
        const e = R.est[r[1]]; if (!e) continue;
        valid++;
        const px = e.dz_med * (r[4] / 1.9) * r[3];
        const s = px < W_ARTO;
        if (s) sotto++;
        const k = perV[r[0]] = perV[r[0]] || { n: 0, s: 0 };
        k.n++; if (s) k.s++;
      }
      console.log('   ' + nome + ': ' + sotto + '/' + valid + ' = ' + (sotto / valid * 100).toFixed(1) + '%');
      for (const v of VS) if (perV[v]) console.log('       ' + v.padEnd(10) + String(perV[v].s).padStart(6) + '/' +
        String(perV[v].n).padEnd(6) + ' = ' + (perV[v].s / perV[v].n * 100).toFixed(1) + '%');
    }
    console.log('\n   IL TETTO. Anche a imbardata perfetta (|sin|=1) l\'asse sagittale');
    console.log('   vale al massimo dz x hPx/1,9 px. Per raddoppiarlo servirebbe');
    console.log('   raddoppiare hPx, cioe\' la figura sullo schermo.');

    /* ---------------- 4. costo del fondale ---------------------------- */
    console.log('\n-- 4. COSTO DI ENTRARE IN CAMERA BASSA ---------------------------');
    console.log('   duelFondo (fondale a schermo pieno della camera bassa):');
    console.log('     ' + JSON.stringify(R.costo));

    if (JSONOUT) {
      fs.mkdirSync(path.dirname(path.resolve(RADICE, JSONOUT)), { recursive: true });
      fs.writeFileSync(path.resolve(RADICE, JSONOUT), JSON.stringify({
        partite: PARTITE, seme: SEME, taglia: TAGLIA, umano: UMANO,
        coerenza: R.coerenza, perCam: A.perCam, scene: A.scene, est: R.est,
        altAlto: A.altAlto, altBassa: A.altBassa,
        verbOnset: A.verbOnset, verbFrame: A.verbFrame, ink, spessore: sp, costo: R.costo
      }));
      console.log('\n   crudo salvato in ' + JSONOUT);
    }
    console.log('\n   tempo: ' + (R.ms / 1000).toFixed(0) + ' s\n');
  } finally {
    await browser.close();
    srv.chiudi();
  }
})().catch(e => { console.error(e); process.exit(1); });
