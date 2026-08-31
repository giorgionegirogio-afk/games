/* =====================================================================
   _crit-coda.js — LA POSA ARRIVA IN RITARDO, DOPO IL TUFFO?

   manoPortiere si difende con «if(p.dive>0 || p.recover>0) return;».
   Ma il portiere ha un TERZO stato prima del tuffo: la RACCOLTA
   (p.charge>=0 && p.chargeKind==='tuffo'), in cui p.dive vale ancora 0.
   Se tentaPresa scatta li', il latch si arma; poi il rig disegna
   'tuffo' (il ramo della raccolta e quello del tuffo stanno PRIMA), e
   il latch resta acceso sotto. Il gelo del colpo (0,055 s) sospende
   aggiornaPosa, quindi il latch non si consuma nemmeno.

   Questa sonda registra, per ogni esito senza presa, lo stato del corpo
   all'ARMO e la SEQUENZA delle clip nei 60 fotogrammi dopo, per vedere
   se la posa in piedi compare DOPO il tuffo invece che al suo posto.

   uso: node strumenti/_crit-coda.js --gioco f [--partite 40] [--sec 120]
   ===================================================================== */
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const arg = (n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const GIOCO = path.resolve(arg('gioco', path.join(RADICE,'fuori/anim-seconda.html')));
const PARTITE = +arg('partite', 40);
const SEC = +arg('sec', 120);
const SEME = +arg('seme', 20260803);

const SONDA = String.raw`(() => {
  const R = { ev: [] };
  const vivi = [];
  let armato = null;
  const mp0 = window.manoPortiere;
  window.manoPortiere = function(p, q){
    const r = mp0.apply(this, arguments);
    armato = { pi: G.players.indexOf(p), quale: q,
               dive:+p.dive.toFixed(3), recover:+p.recover.toFixed(3),
               charge:+(p.charge===undefined?-1:p.charge).toFixed(3),
               chargeKind: p.chargeKind||'', latch:+p.gkManiT.toFixed(3) };
    return r;
  };
  const tp0 = window.tentaPresa;
  window.tentaPresa = function(p,b,d){
    armato = null;
    const r = tp0.apply(this, arguments);
    if (armato) vivi.push({ armo: armato, seq: [], n: 0 });
    return r;
  };
  window.__cc = {
    passo(){
      for (let i = vivi.length-1; i >= 0; i--) {
        const t = vivi[i], p = G.players[t.armo.pi];
        const c = rigStato(p).clip;
        if (!t.seq.length || t.seq[t.seq.length-1][0] !== c) t.seq.push([c,1]);
        else t.seq[t.seq.length-1][1]++;
        t.n++;
        if (t.n >= 60) { R.ev.push({ armo:t.armo, seq:t.seq }); vivi.splice(i,1); }
      }
    },
    partita(){ vivi.length = 0; },
    leggi(){ return R; },
  };
})()`;

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:1 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, SEME);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil:'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(SONDA);
  for (let m = 0; m < PARTITE; m++) {
    await pag.evaluate((seme) => {
      window.__test.semina(seme);
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1,1,{size:5});
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true); window.__test.setTimeLeft(600);
      window.__cc.partita();
    }, SEME + m);
    await pag.evaluate((sec)=>{const n=Math.round(sec*60);
      for(let i=0;i<n;i++){ window.__test.simulate(1/60); window.__cc.passo(); }}, SEC);
    if((m+1)%10===0) process.stderr.write('  partita '+(m+1)+'\n');
  }
  const R = await pag.evaluate(() => window.__cc.leggi());
  await br.close(); srv.chiudi();
  const DED = { pugni:1, respinta:1, sfugge:1 };
  console.log('gioco ' + GIOCO + ' — ' + PARTITE + 'x' + SEC + 's');
  console.log('latch armati: ' + R.ev.length);
  let inRaccolta = 0, tardive = 0, lampo = 0;
  for (const e of R.ev) {
    const primo = e.seq.findIndex(x => DED[x[0]]);
    const dur = primo >= 0 ? e.seq[primo][1] : 0;
    const prima = primo > 0 ? e.seq.slice(0, primo).map(x => x[0]+'x'+x[1]).join(' ') : '';
    const tardi = primo > 0 && /tuffo|parata/.test(prima);
    if (e.armo.chargeKind === 'tuffo' && e.armo.charge >= 0) inRaccolta++;
    if (tardi) tardive++;
    if (primo >= 0 && dur <= 2) lampo++;
    console.log('  ' + e.armo.quale.padEnd(9) +
      ' armo: dive ' + e.armo.dive + ' rec ' + e.armo.recover + ' charge ' + e.armo.charge + ' ' + (e.armo.chargeKind||'-') +
      ' | seq ' + e.seq.slice(0,7).map(x=>x[0]+'x'+x[1]).join(' ') +
      (tardi ? '   <-- LA POSA ARRIVA DOPO IL TUFFO' : '') +
      (primo>=0 && dur<=2 ? '   <-- LAMPO di ' + dur + ' fotogramm' + (dur===1?'o':'i') : ''));
  }
  console.log('\narmati durante la RACCOLTA del tuffo (p.charge>=0, chargeKind tuffo): ' + inRaccolta + ' / ' + R.ev.length);
  console.log('finestre in cui la posa in piedi compare DOPO tuffo/parata: ' + tardive + ' / ' + R.ev.length);
  console.log('finestre in cui la posa dura 1-2 fotogrammi (lampo): ' + lampo + ' / ' + R.ev.length);
})();
