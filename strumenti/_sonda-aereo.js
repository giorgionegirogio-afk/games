/* =====================================================================
   _sonda-aereo.js — QUANTO GIOCO AEREO C'E' DAVVERO, prima di toccare
   una riga.

   Serve a rispondere a tre domande che nessuno strumento di casa aveva
   mai posto, e le cui risposte decidono la forma della toppa:

     1. Quanti palloni salgono sopra Z_SOPRA_TESTA (26) in una partita
        vera, e per quanti fotogrammi ci restano?
     2. A che QUOTA viene raccolto un pallone, oggi? Il gate della
        raccolta dice b.z<=26, ma se in pratica tutte le raccolte
        avvengono a quota zero, abbassare quel numero non costa niente —
        e se invece la fascia 15-26 e' popolata, abbassarlo cambia la
        partita e va detto.
     3. Che fine fanno i cross alti: chi li raccoglie, e dopo quanto.

   COME NON MENTE. Math.random sostituito con xorshift32 a seme fisso
   prima di ogni riga di pagina (stesso impianto di _q-cross.js), la
   sonda avvolge step/doCross/segnaTocco e NON pesca numeri casuali:
   la partita misurata e' la partita non misurata.

   uso:
     node strumenti/_sonda-aereo.js --gioco fuori/CALCETTO-originale-30279089.html
     node strumenti/_sonda-aereo.js --partite 12 --taglia 5
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
  if (window.__sa) return 'gia';
  const S = {};
  const azzera = () => {
    S.frames=0;
    S.altiFrame=0;          // fotogrammi col pallone libero sopra 26
    S.pettoFrame=0;         // fotogrammi col pallone libero fra 15 e 26
    S.voliAlti=0;           // episodi distinti sopra 26 (fronte)
    S._eraAlto=false;
    S.zMax=0;
    S.raccolte=0;           // quante volte b.owner passa da <0 a >=0
    S.zRacc=[0,0,0,0,0,0];  // istogramma quota alla raccolta: 0-2,2-6,6-10,10-15,15-20,20-26
    S.zRaccMax=0;
    S.cross=0;
    S.crossAlti=0;          // cross che superano 26
    S.crossRacc=0;          // cross poi raccolti (entro 4 s dal lancio)
    S.crossTerra=0;         // cross che toccano terra prima di essere raccolti
    S._pend=[];
    S.gol=[0,0];
    S.testa=0; S.petto=0;   // esistono? oggi no: si contano per il confronto
  };
  azzera();

  const _step = window.step;
  const _doCross = window.doCross;

  window.doCross = function(p){
    const c0=(G.stats.cross[0]|0)+(G.stats.cross[1]|0);
    const r=_doCross.apply(this, arguments);
    const c1=(G.stats.cross[0]|0)+(G.stats.cross[1]|0);
    if(c1>c0){ S.cross++; S._pend.push({t:0, alto:false, terra:false, esito:0}); }
    return r;
  };

  let ownPrima=-1, zPrima=0;
  window.step = function(){
    const b=G.ball;
    ownPrima=b.owner; zPrima=b.z;
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    if(b.z>S.zMax) S.zMax=b.z;
    const libero = b.owner<0;
    const alto = libero && b.z>26;
    if(alto) S.altiFrame++;
    if(libero && b.z>15 && b.z<=26) S.pettoFrame++;
    if(alto && !S._eraAlto) S.voliAlti++;
    S._eraAlto = alto;
    /* LA RACCOLTA: il fronte owner<0 -> owner>=0. La quota che conta e'
       quella del fotogramma PRIMA, perche' updateBall schiaccia b.z
       appena il pallone diventa di qualcuno (b.z*=0.8). */
    if(ownPrima<0 && b.owner>=0){
      S.raccolte++;
      const z=zPrima;
      if(z>S.zRaccMax) S.zRaccMax=z;
      const i = z<=2?0 : z<=6?1 : z<=10?2 : z<=15?3 : z<=20?4 : 5;
      S.zRacc[i]++;
      for(const c of S._pend) if(!c.esito) c.esito=1;
    }
    if(S._pend.length){
      const vivi=[];
      for(const c of S._pend){
        c.t++;
        if(b.z>26) c.alto=true;
        if(b.z<=0.5) c.terra=true;
        if(c.esito===1){
          if(c.alto) S.crossAlti++;
          S.crossRacc++;
          if(c.terra) S.crossTerra++;
          continue;
        }
        if(c.t>240){ if(c.alto) S.crossAlti++; continue; }
        vivi.push(c);
      }
      S._pend=vivi;
    }
  };

  window.__sa = { azzera, leggi(){ S.gol=[G.score[0],G.score[1]]; return JSON.parse(JSON.stringify(S)); } };
  return 'ok';
})()`;

(async () => {
  const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
  const N = +arg('partite', 12);
  const TAGLIA = +arg('taglia', 5);
  const SEME0 = +arg('seme', 20260803);
  const prova = path.isAbsolute(GIOCO) ? GIOCO : path.join(RADICE, GIOCO);
  const srv = await servi(prova);
  const br = await chromium.launch();
  const tot = { frames:0, altiFrame:0, pettoFrame:0, voliAlti:0, raccolte:0,
                zRacc:[0,0,0,0,0,0], zRaccMax:0, cross:0, crossAlti:0, crossRacc:0,
                crossTerra:0, gol:0, zMax:0 };
  for (let k = 0; k < N; k++) {
    const seme = SEME0 + k;
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1 });
    const pag = await ctx.newPage();
    await pag.addInitScript(s => {
      let x = s >>> 0 || 1;
      Math.random = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
    }, seme);
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(SONDA);
    const r = await pag.evaluate(t => {
      window.__test.dismissSplash && window.__test.dismissSplash();
      window.__test.startMatch(1, 1, { size: t });
      window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
      window.__test.setCpuVsCpu(true);
      window.__sa.azzera();
      window.__test.simulate(95);
      return window.__sa.leggi();
    }, TAGLIA);
    tot.frames += r.frames; tot.altiFrame += r.altiFrame; tot.pettoFrame += r.pettoFrame;
    tot.voliAlti += r.voliAlti; tot.raccolte += r.raccolte;
    for (let i = 0; i < 6; i++) tot.zRacc[i] += r.zRacc[i];
    tot.zRaccMax = Math.max(tot.zRaccMax, r.zRaccMax);
    tot.zMax = Math.max(tot.zMax, r.zMax);
    tot.cross += r.cross; tot.crossAlti += r.crossAlti; tot.crossRacc += r.crossRacc;
    tot.crossTerra += r.crossTerra; tot.gol += r.gol[0] + r.gol[1];
    process.stdout.write(`  partita ${k + 1}/${N} seme ${seme}: cross ${r.cross} (alti ${r.crossAlti}), voli alti ${r.voliAlti}, raccolte ${r.raccolte}, gol ${r.gol[0] + r.gol[1]}\n`);
    await ctx.close();
  }
  const et = ['0-2', '2-6', '6-10', '10-15', '15-20', '20-26'];
  console.log(`\n=== ${GIOCO} — ${N} partite, taglia ${TAGLIA}, semi ${SEME0}..${SEME0 + N - 1} ===`);
  console.log(`  fotogrammi di gioco vivo ...... ${tot.frames}`);
  console.log(`  quota massima toccata ......... ${tot.zMax.toFixed(1)}`);
  console.log(`  episodi col pallone sopra 26 .. ${tot.voliAlti}  (${tot.altiFrame} fotogrammi, ${(100 * tot.altiFrame / tot.frames).toFixed(2)}%)`);
  console.log(`  fotogrammi fra 15 e 26 ........ ${tot.pettoFrame}  (${(100 * tot.pettoFrame / tot.frames).toFixed(2)}%)`);
  console.log(`  raccolte totali ............... ${tot.raccolte}   quota max alla raccolta ${tot.zRaccMax.toFixed(1)}`);
  for (let i = 0; i < 6; i++) console.log(`     quota ${et[i].padEnd(6)} : ${String(tot.zRacc[i]).padStart(5)}  ${(100 * tot.zRacc[i] / Math.max(1, tot.raccolte)).toFixed(2)}%`);
  console.log(`  cross ......................... ${tot.cross}  (saliti sopra 26: ${tot.crossAlti})`);
  console.log(`  cross poi raccolti ............ ${tot.crossRacc}  (di cui gia' a terra: ${tot.crossTerra})`);
  console.log(`  gol totali .................... ${tot.gol}`);
  console.log(`  gol di testa .................. 0 (la parola non esiste nel file)`);
  await br.close(); srv.chiudi();
})();
