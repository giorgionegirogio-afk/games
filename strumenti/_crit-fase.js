/* =====================================================================
   _crit-fase.js — LA FINESTRA DICHIARATA E QUELLA CHE SI VEDE.

   GK_MANI_T = 0,34 s. Il commento della toppa dice che 0,50 s era troppo
   («il gesto restava acceso mentre il portiere rientrava sui pali e la
   posa diventava una statua che trasla»). Qui si misura la finestra VERA
   in cui rigStato restituisce una delle tre clip nuove, e si guarda se
   la fase st.u va SEMPRE avanti o se torna indietro (il gesto che
   riparte da capo a meta' seguito).

   uso: node strumenti/_crit-fase.js --gioco f [--partite 40] [--sec 120]
   ===================================================================== */
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'fuori/anim-seconda.html')));
const PARTITE = +arg('partite', 40);
const SEC = +arg('sec', 120);
const SEME = +arg('seme', 20260803);

const SONDA = String.raw`(() => {
  const R = { fin: [], nMano: 0, nBanner: 0 };
  let armi = 0;
  const mp0 = window.manoPortiere;
  if (mp0) window.manoPortiere = function(p, q){ R.nMano++; armi++; return mp0.apply(this, arguments); };
  const gkIdx = () => G.players.map((p,i)=>({p,i})).filter(o=>o.p.role==='gk').map(o=>o.i);
  const stato = {};   // pi -> traccia in corso
  window.__cf = {
    passo(){
      for (const i of gkIdx()) {
        const p = G.players[i];
        const st = rigStato(p);
        const ded = (st.clip==='pugni'||st.clip==='respinta'||st.clip==='sfugge');
        if (ded) {
          if (!stato[i]) stato[i] = { clip: st.clip, u: [], armi0: armi, freeze: 0 };
          stato[i].u.push(+st.u.toFixed(3));
          if (G.freeze > 0) stato[i].freeze++;
        } else if (stato[i]) {
          const t = stato[i]; delete stato[i];
          let indietro = 0, salti = [];
          for (let k = 1; k < t.u.length; k++) if (t.u[k] < t.u[k-1] - 1e-6) { indietro++; salti.push(t.u[k-1] + '->' + t.u[k]); }
          R.fin.push({ clip: t.clip, frames: t.u.length, sec: +(t.u.length/60).toFixed(3),
                       fotogrammiCongelati: t.freeze,
                       armiDurante: armi - t.armi0, tornaIndietro: indietro,
                       salti: salti.slice(0,4), u0: t.u[0], uMax: Math.max.apply(null,t.u), uFine: t.u[t.u.length-1] });
        }
      }
    },
    partita(){ for (const k in stato) delete stato[k]; },
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
      window.__test.startMatch(1, 1, { size: 5 });
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true); window.__test.setTimeLeft(600);
      window.__cf.partita();
    }, SEME + m);
    await pag.evaluate((sec) => { const n = Math.round(sec*60);
      for (let i = 0; i < n; i++) { window.__test.simulate(1/60); window.__cf.passo(); } }, SEC);
    if ((m+1)%10===0) process.stderr.write('  partita '+(m+1)+'\n');
  }
  const R = await pag.evaluate(() => window.__cf.leggi());
  await br.close(); srv.chiudi();
  const f = R.fin.filter(x => x.frames >= 3);
  console.log('gioco ' + GIOCO + ' — ' + PARTITE + 'x' + SEC + 's, seme base ' + SEME);
  console.log('chiamate a manoPortiere: ' + R.nMano);
  console.log('finestre con clip dedicata (>=3 fotogrammi): ' + f.length + '  (tutte: ' + R.fin.length + ')');
  const sec = f.map(x=>x.sec).sort((a,b)=>a-b);
  if (sec.length) {
    console.log('DURATA IN SCENA (s): min ' + sec[0] + '  mediana ' + sec[Math.floor(sec.length/2)] + '  max ' + sec[sec.length-1] + '   (dichiarata GK_MANI_T = 0,34)');
    console.log('finestre oltre 0,34 s: ' + f.filter(x=>x.sec>0.345).length + ' / ' + f.length);
    console.log('finestre oltre 0,50 s (il valore BOCCIATO nel commento): ' + f.filter(x=>x.sec>0.505).length + ' / ' + f.length);
    console.log('finestre in cui la fase TORNA INDIETRO: ' + f.filter(x=>x.tornaIndietro>0).length + ' / ' + f.length);
  }
  for (const x of f) console.log('  ' + x.clip.padEnd(9) + ' ' + String(x.frames).padStart(2) + ' fg = ' + x.sec.toFixed(3) + ' s' +
    '  congelati ' + String(x.fotogrammiCongelati).padStart(2) + '  riarmi ' + x.armiDurante +
    '  u ' + x.u0 + '->' + x.uFine + ' (max ' + x.uMax + ')  indietro ' + x.tornaIndietro + (x.salti.length?('  '+x.salti.join(' ')):''));
})();
