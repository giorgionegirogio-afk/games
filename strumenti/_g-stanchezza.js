/* =====================================================================
   _g-stanchezza.js — SOLA MISURA. «La posa della stanchezza» esiste?

   IL GIOCO LO DICHIARA (CALCETTO-il-gioco.html, commento sopra la riga
   p.amp): «LA POSA DELLA STANCHEZZA ... Si accorcia la FALCATA ... 18%
   al massimo da stanchi, 28% con un acciacco». Questa sonda non legge
   la dichiarazione: guarda i PIXEL.

   COME. Si prende la STESSA figura, alla STESSA fase, alla STESSA
   velocita', e si cambia UNA cosa sola: p.cond (e p.acciacco). Poi si
   ridisegna con la stessa Rig3D e si contano i pixel diversi e lo
   scarto di riquadro. Se la falcata si accorcia davvero, il piede
   avanti si sposta e la sagoma cambia; se cambia solo un moltiplicatore
   che non arriva agli arti, i pixel sono gli stessi.

   SI MISURANO TRE COSE, tutte e tre in pixel di periferica:
     1. la SAGOMA della figura (Rig3D.disegna su tela pulita) a parita'
        di clip e fase, con l'altezza hb = RIG_H/squash che il gioco
        userebbe per quel giocatore. L'unica strada per cui la
        stanchezza tocca la figura e' lo squash.
     2. l'ESTENSIONE ORIZZONTALE della posa cruda lungo l'asse del passo
        (banco.P): se la falcata si accorcia, questo numero scende.
     3. la SATURAZIONE: a che velocita' il clamp (p.amp-1,1)/6,5 arriva a
        1 e la differenza fra fresco e stanco sparisce del tutto.

   uso: node strumenti/_g-stanchezza.js [--gioco f]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--'+n);
  return i>0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2 });
  const pag = await ctx.newPage();
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.addInitScript(() => { window.requestIdleCallback=()=>0; window.cancelIdleCallback=()=>{}; });
  await pag.goto('http://127.0.0.1:'+srv.porta+'/'+rel+'?q='+Date.now(), { waitUntil:'load' });
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(() => { window.__test.dismissSplash&&window.__test.dismissSplash();
    window.__test.startMatch(1,1,{size:5}); window.__test.setCpuVsCpu(true);
    window.__test.setTimeLeft(600); });
  await pag.evaluate(() => { for(let i=0;i<60;i++){ window.__test.simulate(1/60); window.__test.disegna(); } });

  const R = await pag.evaluate(() => {
    /* le due formule del gioco, RILETTE dal gioco stesso: ampPasso e'
       una funzione globale, e il clamp e la riga di p.amp si rifanno
       qui identiche per poter variare la sola cond. */
    const ampP = v => ampPasso(v);
    const ampDi = (v, cond, acc) => 1.1 + (ampP(v)-1.1)*(acc ? 0.72 : (0.82+0.18*cond*0.01));
    const cl = q => Math.max(0, Math.min(1, (q-1.1)/6.5));

    /* 1. la SATURAZIONE: la velocita' oltre la quale fresco e stanco
       danno lo stesso identico clamp (entrambi 1). */
    let vSatFresco = -1, vSatStanco = -1;
    for (let v = 0; v <= 260; v += 0.5) {
      if (vSatFresco < 0 && cl(ampDi(v,100,0)) >= 0.9999) vSatFresco = v;
      if (vSatStanco < 0 && cl(ampDi(v,0,0))   >= 0.9999) vSatStanco = v;
    }

    /* la tabella clamp a cinque velocita' vere della partita */
    const tab = [40, 80, 120, 160, 200, 223].map(v => ({
      v,
      fresco: +cl(ampDi(v,100,0)).toFixed(4),
      stanco: +cl(ampDi(v,0,0)).toFixed(4),
      acciacco: +cl(ampDi(v,0,1)).toFixed(4),
    }));

    /* 2. i CAMPI che leggono p.amp — si cerca a mano quanto valgono i
       due consumatori: bob (max 0,9 u) e squash (max 0,055). */
    const conseg = tab.map(t => ({
      v: t.v,
      bobFresco: +(0.9*t.fresco).toFixed(4),
      bobStanco: +(0.9*t.stanco).toFixed(4),
      bobAcciacco: +(0.9*t.acciacco).toFixed(4),
      /* l'altezza della figura in unita' di mondo: RIG_H/squash, al
         picco del coseno (cc=1) */
      hbFresco: +(RIG_H/(1+0.055*t.fresco)).toFixed(4),
      hbStanco: +(RIG_H/(1+0.055*t.stanco)).toFixed(4),
      hbAcciacco: +(RIG_H/(1+0.055*t.acciacco)).toFixed(4),
    }));

    /* 3. LA SAGOMA. Si disegna la figura a due altezze (fresca e
       acciaccata) e si contano i pixel diversi. hPx a schermo: la scala
       vera della partita e' (G.view.S2)*P_DIS, e la figura misura
       hb*quella scala. */
    const S = (G.view.S2||1)*P_DIS*Math.min(2, window.devicePixelRatio||1);
    const W=520,H=520;
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    const g=cv.getContext('2d',{willReadFrequently:true});
    function sagoma(hb, clip, u, yaw){
      g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,W,H);
      Rig3D.disegna(g, W/2, H*0.80, hb*S, yaw, 'alto', clip, u/Rig3D.CLIPS[clip].freq,
                    Rig3D.lookPredefinito, true, 1, 0);
      return g.getImageData(0,0,W,H).data;
    }
    function diff(a,b){ let n=0, tot=0;
      for(let i=3;i<a.length;i+=4){ const A=a[i]>24, B=b[i]>24; if(A||B) tot++; if(A!==B) n++; }
      return {diversi:n, dipinti:tot, perc:+(100*n/Math.max(1,tot)).toFixed(2)}; }

    /* al picco del coseno, cioe' dove lo squash e' massimo, e su 8 fasi */
    const prove = [];
    for (const t of [{v:200,nome:'sprint 200 u/s'},{v:80,nome:'trotto 80 u/s'}]) {
      const f = cl(ampDi(t.v,100,0)), s = cl(ampDi(t.v,0,0)), a = cl(ampDi(t.v,0,1));
      const hbF = RIG_H/(1+0.055*f), hbS = RIG_H/(1+0.055*s), hbA = RIG_H/(1+0.055*a);
      let dFS=0, dFA=0, tot=0;
      for (let k=0;k<8;k++){
        const u=k/8, clip = t.v>=62?'corsa':'camminata';
        const A=sagoma(hbF,clip,u,Math.PI/2), B=sagoma(hbS,clip,u,Math.PI/2), C=sagoma(hbA,clip,u,Math.PI/2);
        const r1=diff(A,B), r2=diff(A,C);
        dFS+=r1.diversi; dFA+=r2.diversi; tot+=r1.dipinti;
      }
      prove.push({ prova:t.nome, hbFresco:+hbF.toFixed(3), hbStanco:+hbS.toFixed(3),
                   hbAcciacco:+hbA.toFixed(3),
                   pixelDiversiFrescoStanco:dFS, pixelDiversiFrescoAcciacco:dFA,
                   pixelDipinti:tot,
                   percFrescoStanco:+(100*dFS/Math.max(1,tot)).toFixed(3),
                   percFrescoAcciacco:+(100*dFA/Math.max(1,tot)).toFixed(3) });
    }

    /* 4. LA FALCATA CRUDA: l'estensione della posa lungo l'asse del
       passo (z, avanti) su 64 fasi. Se la clip e' la stessa funzione,
       questo numero NON puo' cambiare — e la prova e' che poseCorsa
       prende un solo argomento. */
    const B=Rig3D.banco;
    function estZ(clip){ let mx=0;
      for(let k=0;k<64;k++){ B.posa(clip,k/64); let a=1e9,b=-1e9;
        for(let j=0;j<B.NJ;j++){ const z=B.P[j*3+2]; if(z<a)a=z; if(z>b)b=z; }
        if(b-a>mx) mx=b-a; }
      return +mx.toFixed(4); }
    const falcata = { corsa:estZ('corsa'), camminata:estZ('camminata') };
    /* l'arita' delle pose si legge dal registro pubblico: pose(u) e
       basta vuol dire che nessun campo del giocatore entra nella posa */
    const arita = {};
    for (const k in Rig3D.CLIPS) arita[k] = Rig3D.CLIPS[k].pose.length;

    /* 5. DOVE FINISCE p.bob: sulla FIGURA o sull'OMBRA? La figura si
       disegna a cy = p.y + RIG_PIEDI (drawPlayer), l'ombra a p.y +
       GEO.piedeY*(1+h*0.05) con h che contiene p.bob. */
    return { vSaturaFresco:vSatFresco, vSaturaStanco:vSatStanco, clamp:tab,
             conseguenze:conseg, sagome:prove, falcataCruda:falcata,
             aritaDellePose:arita, scalaSchermo:+S.toFixed(4), RIG_H };
  });
  await br.close(); srv.chiudi();
  console.log(JSON.stringify(R, null, 1));
})().catch(e => { console.error('FALLITO: '+(e&&e.stack||e)); process.exit(1); });
