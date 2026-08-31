/* =====================================================================
   _crit-geom-mani.js — I NUMERI SCRITTI NEI COMMENTI, MISURATI OGGI.

   Misura sulla posa vera (Rig3D.banco, corporatura neutra) tutto quello
   che i commenti della toppa _t-mani-portiere.js dichiarano, e in piu':
     · la posa nel FOTOGRAMMA DEL FERMO IMMAGINE (u di partenza, tenuta
       ferma dal gelo di 0,055 s che tentaPresa accende) — cioe' quello
       che l'occhio guarda per primo;
     · il confronto della posa di partenza con l'ATTESA del portiere,
       che e' quello che si vedeva prima;
     · la proiezione: quanti px di schermo vale un metro AVANTI e un
       metro DI LATO all'imbardata del portiere in piedi e a quella del
       tuffo.
   uso: node strumenti/_crit-geom-mani.js --gioco fuori/anim-seconda.html
   ===================================================================== */
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const arg = (n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const GIOCO = path.resolve(arg('gioco', path.join(RADICE,'fuori/anim-seconda.html')));

const PROVA = String.raw`(() => {
  const B = Rig3D.banco;
  const N = { HEAD:3, HAL:6, HAR:9, ELL:5, ELR:8, FTL:12, FTR:15 };
  function g(clip, u){
    B.corpora(3,0); B.posa(clip, u/Rig3D.CLIPS[clip].freq);
    const o = {};
    for (const k in N) o[k] = { x:+B.P[N[k]*3].toFixed(3), y:+B.P[N[k]*3+1].toFixed(3), z:+B.P[N[k]*3+2].toFixed(3) };
    return o;
  }
  function riass(clip, u){
    const j = g(clip,u);
    return { u:+u.toFixed(3),
      manoAvZ: Math.max(j.HAR.z, j.HAL.z), manoDiZ: Math.min(j.HAR.z, j.HAL.z),
      manoMinY: Math.min(j.HAR.y, j.HAL.y), manoMaxY: Math.max(j.HAR.y, j.HAL.y),
      testaY: j.HEAD.y, testaZ: j.HEAD.z,
      apertPiedi: +Math.abs(j.FTR.z - j.FTL.z).toFixed(3),
      cima: j.HEAD.y };
  }
  /* la distanza fra due pose, in metri di rig, sui 7 giunti letti */
  function dist(c1,u1,c2,u2){
    const a=g(c1,u1), b=g(c2,u2); let s=0, n=0, mx=0;
    for(const k in a){ const d=Math.hypot(a[k].x-b[k].x, a[k].y-b[k].y, a[k].z-b[k].z); s+=d; n++; if(d>mx) mx=d; }
    return { media:+(s/n).toFixed(4), max:+mx.toFixed(4) };
  }
  const U0 = { pugni:0.24, respinta:0.12, sfugge:0.10 };
  const R = { partenza:{}, migliore:{}, attesa:riass('attesaGK',0),
              scartoDaAttesa:{}, scartoMigliore:{}, tagli:{}, proiezione:{} };
  for (const c in U0) {
    R.partenza[c] = riass(c, U0[c]);
    /* il fotogramma migliore per il criterio del cancello */
    let best=null;
    for (let k=0;k<=100;k++){ const u=U0[c]+(0.98-U0[c])*k/100; const r=riass(c,u);
      const s = c==='pugni' ? Math.min(r.manoAvZ,r.manoDiZ)+r.manoMinY
              : c==='respinta' ? (r.manoAvZ-r.manoDiZ)+r.apertPiedi
              : (r.testaZ - r.testaY);
      if (!best || s>best.s) best={s,r,u}; }
    R.migliore[c] = best.r;
    R.scartoDaAttesa[c] = dist(c, U0[c], 'attesaGK', 0);
    R.scartoMigliore[c] = dist(c, best.u, 'attesaGK', 0);
  }
  /* i tagli della cinematica inversa su tutte le fasi e le corporature */
  for (const c in U0) {
    B.azzeraTagli();
    for (let ci=0;ci<4;ci++){ B.corpora(ci,0);
      for (let f=0;f<64;f++) Rig3D.CLIPS[c].pose(f/64); }
    R.tagli[c] = B.tagli();
  }
  B.corpora(3,0);
  /* LA PROIEZIONE. Un metro di rig AVANTI (z) e uno DI LATO (x) quanti
     px di schermo valgono, a una data imbardata? Si legge dal disegno
     stesso: si spostano i giunti di 1 m e si guarda dove finiscono.
     Qui si usa la formula del gioco: SCA in pianta e S2*P_DIS. */
  const SCA = RIG_H/(1.9*Rig3D.CAMERE.alto.ce)*P_DIS;
  const S2 = G.view.S2||1;
  for (const nome of ['inPiedi','tuffo']) {
    const yaw = nome==='inPiedi' ? Math.PI/2 : 0;   // pi/2 = guarda lungo x
    /* avanti del rig = z; sullo schermo: (z*cos yaw, z*sin yaw)*SCA*S2 */
    R.proiezione[nome] = {
      yaw:+yaw.toFixed(3),
      avantiOrizz:+(Math.abs(Math.cos(yaw))*SCA*S2).toFixed(2),
      avantiVert :+(Math.abs(Math.sin(yaw))*SCA*S2).toFixed(2),
      lateraleOrizz:+(Math.abs(Math.sin(yaw))*SCA*S2).toFixed(2),
      lateraleVert :+(Math.abs(Math.cos(yaw))*SCA*S2).toFixed(2) };
  }
  R.scala = { RIG_H, P_DIS, S2:+S2.toFixed(4), SCA:+SCA.toFixed(3),
              figuraPx:+(RIG_H*P_DIS*S2).toFixed(1),
              ce:Rig3D.CAMERE.alto.ce };
  /* l'imbardata VERA dei due portieri in campo adesso */
  R.imbardate = G.players.filter(p=>p.role==='gk').map(p=>({
     team:p.team, ang:+rigAngolo(p).toFixed(3), sin:+Math.abs(Math.sin(rigAngolo(p))).toFixed(3) }));
  return R;
})()`;

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.addInitScript(() => { window.requestIdleCallback = () => 0; window.cancelIdleCallback = () => {}; });
  await pag.goto('http://127.0.0.1:' + srv.porta + '/' + rel + '?q=' + Date.now(), { waitUntil:'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(() => {
    window.__test.dismissSplash && window.__test.dismissSplash();
    window.__test.startMatch(1,1,{size:5});
    window.__test.Tut && window.__test.Tut.finish && window.__test.Tut.finish(true);
    window.__test.setCpuVsCpu(true); window.__test.setTimeLeft(600);
  });
  await pag.evaluate(() => { for(let i=0;i<900;i++){ window.__test.simulate(1/60); if(window.__test.G.scene==='play') break; } window.__test.disegna(); });
  const R = await pag.evaluate(PROVA);
  await br.close(); srv.chiudi();
  console.log(JSON.stringify(R, null, 1));
})();
