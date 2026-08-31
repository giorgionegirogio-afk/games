/* =====================================================================
   _q-mani.js — IL CANCELLO DELLE TRE MANI DEL PORTIERE.

   CHE COSA GIUDICA. tentaPresa ha quattro esiti — PRESA, PUGNI,
   SFUGGE, RESPINTA. Tre di essi muovono il pallone e, fino al 29 agosto
   2026, non muovevano il corpo. Questo banco costruisce le quattro
   situazioni chiamando la FUNZIONE VERA del gioco, lascia decidere al
   gioco quale ramo prendere, e poi misura la POSA che ne esce.

   IL ROSSO E' DIMOSTRATO, e sono DUE rossi diversi (l'opzione --bugiardo
   li fabbrica e li fa girare da se'):

     1. IL GIOCO DI IERI — nessuna clip. Il cancello deve bocciare il
        verdetto «la clip giusta» su tutti e tre gli esiti.
     2. IL GIOCO BUGIARDO — le tre voci di Rig3D.CLIPS portano il NOME
        giusto ('pugni', 'respinta', 'sfugge') e dentro hanno la posa
        dell'ATTESA. Un cancello che leggesse la dichiarazione del gioco
        (il nome della clip) direbbe verde. Questo legge i GIUNTI, e
        deve dire rosso su tutti e tre i verdetti di geometria.
     E' la trappola che questa casa ha gia' pagato tre volte: un cancello
     senza il suo rosso dimostrato e' un timbro.

   I VERDETTI, e da dove vengono le soglie (misurati sulla posa vera il
   29 agosto 2026 con strumenti/_g-manipose.js, corporatura neutra):

     V1 pugni    le DUE mani avanti e in alto nello stesso fotogramma:
                 min(z mani) >= 0,45 m e min(y mani) >= 1,30.
                 Misurato sulla posa: 0,586 e 1,471. Sull'attesa del
                 portiere la mano lontana sta a z = -0,13: rosso.
     V2 respinta una mano AVANTI e una DIETRO, e le gambe in affondo:
                 z(mano vicina) >= 0,55, z(mano lontana) <= 0,15,
                 apertura dei piedi >= 0,85 m.
                 Misurato: 0,641 / -0,053 / 1,032. Sull'attesa: 0,510 /
                 -0,130 / 0,521 — la prima e la terza cadono.
     V3 sfugge   la testa SCENDE e va AVANTI: z(testa) >= 0,40 e
                 y(testa) <= 1,32 nello stesso fotogramma.
                 Misurato: 0,491 e 1,252. Sull'attesa: 0,137 e 1,350.
     V4 la clip  per tutta la durata del latch il rig deve disegnare la
                 clip dedicata, e mai una clip di locomozione o d'attesa.
     V5 il tuffo NON viene dirottato: lo stesso esito, chiamato mentre
                 p.dive>0, deve lasciare 'tuffo'/'parata' e non armare
                 niente. E' la meta' della cura che consiste nel NON
                 fare una cosa.
     V6 la presa non e' cambiata: con un pallone lento e alto il
                 portiere prende e arma 'presa' come prima.

   COME SI COSTRUISCONO I QUATTRO ESITI. Le soglie di tentaPresa non si
   ricopiano qui — si costruisce la SITUAZIONE e si lascia che sia il
   gioco a scegliere, leggendo il nome che lui stesso grida
   (showBanner). Se il ramo che esce non e' quello voluto, il banco lo
   dichiara e non giudica: meglio un banco che si astiene di un banco
   che misura la cosa sbagliata.

   uso:  node strumenti/_q-mani.js [--gioco f] [--bugiardo]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));

/* le quattro situazioni. dy sposta il pallone di traverso al corpo
   (e' il «largo» di tentaPresa), z la sua quota, sp la sua velocita'. */
const CASI = [
  { esito:'PUGNI',    dy:0,  z:20, sp:500, clip:'pugni'    },
  { esito:'SFUGGE',   dy:0,  z:5,  sp:400, clip:'sfugge'   },
  { esito:'RESPINTA', dy:18, z:5,  sp:400, clip:'respinta' },
  { esito:'PRESA',    dy:0,  z:20, sp:120, clip:'presa'    },
];

const PROVA = String.raw`(async (CASI) => {
  const R = { casi:[], tuffo:null, note:[] };
  const N = { HEAD:3, HAL:6, HAR:9, FTL:12, FTR:15 };
  const B = Rig3D.banco;
  const LOCO = { fermo:1, camminata:1, corsa:1, attesaGK:1 };

  /* quale ramo ha parlato: lo dice il gioco, non una copia della regola */
  let ultimoBanner = '';
  const sb0 = window.showBanner;
  window.showBanner = function(t){ ultimoBanner = t; return sb0.apply(this, arguments); };

  const gk = () => G.players.find(p => p.team===0 && p.role==='gk' && p.out<=0);

  function pulisci(p){
    p.dive=0; p.recover=0; p.charge=-1; p.chargeKind=null; p.chargeClip=null;
    p.presaT=0; p.rinvT=0; p.kickT=0; p.kickB=0; p.kickCd=0; p.kickClip=null;
    p.slide=-1; p.rove=-1; p.celeb=0; p.mesto=0; p.fintaT=0; p.frenaT=0;
    p.lodPosa=false; p.vx=0; p.vy=0;
    if ('gkManiT' in p) { p.gkManiT=0; p.gkMani=''; }
    p.diveDX = p.team===0 ? 1 : -1; p.diveDY = 0;
  }
  function metti(p, c){
    const b = G.ball, dir = p.team===0 ? 1 : -1;
    b.owner=-1; b.passTo=-1; b.crossTo=-1; b.tiroT=-1; b.saveRolled=false;
    b.x = p.x; b.y = p.y + c.dy; b.z = c.z;
    b.vx = -dir*c.sp; b.vy = 0; b.vz = 0;
  }
  /* i giunti della posa disegnata, in metri di rig, corporatura neutra */
  function giuntiDi(st){
    B.corpora(3,0); B.posa(st.clip, st.u);
    const g = {};
    for (const k in N) g[k] = { x:B.P[N[k]*3], y:B.P[N[k]*3+1], z:B.P[N[k]*3+2] };
    return g;
  }

  for (const c of CASI) {
    const p = gk(); pulisci(p); metti(p, c);
    ultimoBanner = '';
    tentaPresa(p, G.ball);
    const ramo = ultimoBanner.replace('!','');
    /* il pallone va lontano: senza, il portiere lo ripesca al fotogramma
       dopo e il banco misurerebbe due esiti sovrapposti. E' un
       isolamento dichiarato, non una correzione del gioco. */
    G.ball.x = p.x + (p.team===0?1:-1)*900; G.ball.y = p.y; G.ball.owner=-1;
    const clipVista = {}; let nFrame = 0;
    let migPugni = null, migResp = null, migSfug = null;
    for (let f = 0; f < 24; f++) {
      const st = rigStato(p);
      clipVista[st.clip] = (clipVista[st.clip]|0) + 1;
      nFrame++;
      const g = giuntiDi(st);
      const zMin = Math.min(g.HAR.z, g.HAL.z), yMin = Math.min(g.HAR.y, g.HAL.y);
      const zAvanti = Math.max(g.HAR.z, g.HAL.z), zDietro = Math.min(g.HAR.z, g.HAL.z);
      const apert = Math.abs(g.FTR.z - g.FTL.z);
      if (!migPugni || zMin + yMin > migPugni.s) migPugni = { s:zMin+yMin, zMin:+zMin.toFixed(3), yMin:+yMin.toFixed(3), clip:st.clip, u:+st.u.toFixed(3) };
      if (!migResp || (zAvanti - zDietro) + apert > migResp.s) migResp = { s:(zAvanti-zDietro)+apert, zAvanti:+zAvanti.toFixed(3), zDietro:+zDietro.toFixed(3), apert:+apert.toFixed(3), clip:st.clip, u:+st.u.toFixed(3) };
      if (!migSfug || g.HEAD.z - g.HEAD.y > migSfug.s) migSfug = { s:g.HEAD.z-g.HEAD.y, z:+g.HEAD.z.toFixed(3), y:+g.HEAD.y.toFixed(3), clip:st.clip, u:+st.u.toFixed(3) };
      window.__test.simulate(1/60);
      if (p.dive>0 || p.recover>0) break;     // e' ripartito: la finestra e' finita
    }
    R.casi.push({ voluto:c.esito, ramoDelGioco:ramo, clipAttesa:c.clip,
                  clipViste:clipVista, fotogrammi:nFrame,
                  latch: ('gkManiT' in p) ? +Math.max(0,p.gkManiT).toFixed(3) : null,
                  pugni:migPugni, respinta:migResp, sfugge:migSfug,
                  clipDiLocomozione: Object.keys(clipVista).some(k => LOCO[k]) });
  }

  /* V5 — lo stesso esito con il portiere IN VOLO: non si dirotta */
  {
    const p = gk(); pulisci(p);
    p.dive = 0.30; p.diveDX = 0.2; p.diveDY = 0.95;
    metti(p, CASI[0]);
    ultimoBanner = '';
    tentaPresa(p, G.ball);
    const st = rigStato(p);
    R.tuffo = { ramoDelGioco: ultimoBanner.replace('!',''), clip: st.clip,
                latch: ('gkManiT' in p) ? +Math.max(0,p.gkManiT).toFixed(3) : null };
  }
  return R;
})`;

async function gira(file, etichetta) {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, file).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil: 'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1, 1, { size: 5 });
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true); window.__test.setTimeLeft(600);
  });
  /* si aspetta lo stato 'play': a kickoff updatePlayerFisica non gira e
     i cronometri restano inchiodati. E' la trappola che il banco del
     contrasto ha gia' pagato — con un tetto, perche' un'attesa infinita
     e' un banco appeso. */
  const arrivato = await pag.evaluate(() => {
    for (let i = 0; i < 900; i++) { window.__test.simulate(1/60); if (window.__test.G.scene === 'play') return true; }
    return window.__test.G.scene === 'play';
  });
  if (!arrivato) { await br.close(); srv.chiudi(); throw new Error('la partita non e\' arrivata a play'); }
  const R = await pag.evaluate(PROVA + '(' + JSON.stringify(CASI) + ')');
  await br.close(); srv.chiudi();
  R.gioco = etichetta;
  return R;
}

const SOGLIE = { pugniZ:0.45, pugniY:1.30, respAv:0.55, respDi:0.15, respAp:0.85, sfugZ:0.40, sfugY:1.32 };

function giudica(R) {
  const v = [];
  const perEsito = {};
  for (const c of R.casi) perEsito[c.voluto] = c;
  const astieni = [];
  for (const c of R.casi) if (c.ramoDelGioco !== c.voluto)
    astieni.push(c.voluto + ': il gioco ha preso il ramo ' + (c.ramoDelGioco || '(nessuno)'));

  const p = perEsito.PUGNI, r = perEsito.RESPINTA, s = perEsito.SFUGGE, pr = perEsito.PRESA;
  v.push({ id:'V1 pugni: le due mani avanti e in alto',
           ok: !!p && p.pugni.zMin >= SOGLIE.pugniZ && p.pugni.yMin >= SOGLIE.pugniY,
           n: p ? ('z min ' + p.pugni.zMin + ' (>=' + SOGLIE.pugniZ + '), y min ' + p.pugni.yMin + ' (>=' + SOGLIE.pugniY + '), clip ' + p.pugni.clip) : '-' });
  v.push({ id:'V2 respinta: una mano avanti, una dietro, gambe in affondo',
           ok: !!r && r.respinta.zAvanti >= SOGLIE.respAv && r.respinta.zDietro <= SOGLIE.respDi && r.respinta.apert >= SOGLIE.respAp,
           n: r ? ('avanti ' + r.respinta.zAvanti + ' (>=' + SOGLIE.respAv + '), dietro ' + r.respinta.zDietro + ' (<=' + SOGLIE.respDi + '), apertura ' + r.respinta.apert + ' (>=' + SOGLIE.respAp + ')') : '-' });
  v.push({ id:'V3 sfugge: la testa scende e va avanti',
           ok: !!s && s.sfugge.z >= SOGLIE.sfugZ && s.sfugge.y <= SOGLIE.sfugY,
           n: s ? ('z testa ' + s.sfugge.z + ' (>=' + SOGLIE.sfugZ + '), y testa ' + s.sfugge.y + ' (<=' + SOGLIE.sfugY + ')') : '-' });
  const clipOk = c => c && (c.clipViste[c.clipAttesa] | 0) > 0 && !c.clipDiLocomozione;
  v.push({ id:'V4 la clip dedicata, e mai una di locomozione',
           ok: clipOk(p) && clipOk(r) && clipOk(s),
           n: ['PUGNI ' + JSON.stringify(p ? p.clipViste : {}),
               'RESPINTA ' + JSON.stringify(r ? r.clipViste : {}),
               'SFUGGE ' + JSON.stringify(s ? s.clipViste : {})].join(' | ') });
  v.push({ id:'V5 il tuffo non viene dirottato',
           ok: !!R.tuffo && (R.tuffo.clip === 'tuffo' || R.tuffo.clip === 'parata') && (R.tuffo.latch === null || R.tuffo.latch === 0),
           n: R.tuffo ? ('ramo ' + R.tuffo.ramoDelGioco + ', clip ' + R.tuffo.clip + ', latch ' + R.tuffo.latch) : '-' });
  v.push({ id:'V6 la presa alta non e\' cambiata',
           ok: !!pr && (pr.clipViste['presa'] | 0) > 0,
           n: pr ? JSON.stringify(pr.clipViste) : '-' });
  return { v, astieni };
}

function stampa(R) {
  const { v, astieni } = giudica(R);
  console.log('\n=== _q-mani — ' + R.gioco + ' ===');
  for (const a of astieni) console.log('  ASTENUTO  ' + a);
  let rossi = 0;
  for (const x of v) { if (!x.ok) rossi++; console.log('  ' + (x.ok ? 'verde ' : 'ROSSO ') + x.id + '\n            ' + x.n); }
  console.log('  ' + (rossi ? 'ROSSO: ' + rossi + ' verdetti su ' + v.length : 'VERDE: ' + v.length + ' verdetti su ' + v.length));
  return rossi;
}

/* IL GIOCO BUGIARDO: i NOMI delle tre clip restano, le POSE diventano
   quella dell'attesa. Chi legge la dichiarazione dice verde. */
function fabbricaBugiardo(src, dest) {
  let s = fs.readFileSync(src, 'utf8');
  const cambi = [
    ['  pugni:     {freq:1.0, pose:posePugni},', '  pugni:     {freq:1.0, pose:poseAttesaGK},'],
    ['  respinta:  {freq:1.0, pose:poseRespinta},', '  respinta:  {freq:1.0, pose:poseAttesaGK},'],
    ['  sfugge:    {freq:1.0, pose:poseSfugge},', '  sfugge:    {freq:1.0, pose:poseAttesaGK},'],
  ];
  for (const [a, b] of cambi) {
    if (s.split(a).length - 1 !== 1) throw new Error('bugiardo: non trovo esattamente una volta ' + a);
    s = s.replace(a, b);
  }
  fs.writeFileSync(dest, s);
  return dest;
}

(async () => {
  const R0 = await gira(GIOCO, path.relative(RADICE, GIOCO));
  if (haFlag('crudo')) console.log(JSON.stringify(R0, null, 1));
  let rossiTot = stampa(R0);

  if (haFlag('bugiardo')) {
    const dest = path.join(RADICE, 'fuori', '_bugiardo-mani.html');
    fabbricaBugiardo(GIOCO, dest);
    const Rb = await gira(dest, 'GIOCO BUGIARDO (nomi giusti, posa dell\'attesa)');
    const rb = stampa(Rb);
    const gb = giudica(Rb);
    /* il bugiardo DEVE fallire i tre verdetti di geometria e PASSARE
       quello del nome: e' la prova che il cancello guarda i giunti */
    const geomRosse = ['V1','V2','V3'].every(k => gb.v.find(x => x.id.startsWith(k)) && !gb.v.find(x => x.id.startsWith(k)).ok);
    const nomeVerde = gb.v.find(x => x.id.startsWith('V4')).ok;
    console.log('\n  --- il rosso dimostrato ---');
    console.log('  il bugiardo fallisce V1, V2 e V3 (la geometria): ' + (geomRosse ? 'SI' : 'NO'));
    console.log('  e PASSA V4 (il nome della clip):                 ' + (nomeVerde ? 'SI' : 'NO'));
    console.log('  ' + ((geomRosse && nomeVerde)
      ? 'il cancello legge i GIUNTI, non la dichiarazione del gioco.'
      : 'ATTENZIONE: il rosso non e\' dimostrato come previsto.'));
    if (!(geomRosse && nomeVerde)) rossiTot++;
  }
  process.exit(rossiTot ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + (e && e.stack || e)); process.exit(2); });
