/* =====================================================================
   _g-costo.js — SOLA MISURA. Il COSTO del rig oggi, clip per clip, col
   banco che il gioco porta gia' dentro (?rigcosto): 22 figure x 600
   fotogrammi a 30 px in camera 'alto'.

   Serve a chi curera': ogni cura d'animazione va misurata anche col
   cronometro, e il numero da non perdere e' questo. Si stampa la
   MEDIANA di tre passate per clip, non una passata sola.

   uso: node strumenti/_g-costo.js [--gioco f] [--giri 3]
   ===================================================================== */
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n,d) => { const i=process.argv.indexOf('--'+n);
  return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE,'CALCETTO-il-gioco.html')));
const GIRI = +arg('giri', 3);

(async () => {
  const { chromium } = require('playwright');
  const srv = await servi();
  const rel = path.relative(RADICE, GIOCO).split(path.sep).join('/');
  const br = await chromium.launch();
  /* il OnePlus 6: 576x273 CSS a deviceScaleFactor 2,8125 */
  const ctx = await br.newContext({ viewport:{width:576,height:273}, deviceScaleFactor:2.8125 });
  const pag = await ctx.newPage();
  /* IL CRONOMETRO VERO VA SALVATO PRIMA DEL BANCO. bancoDiProva
     sostituisce performance.now con un orologio a passi fissi: misurare
     con quello da' ZERO millisecondi per qualunque clip, ed e' successo
     alla prima stesura di questo file. Si mette da parte l'originale in
     uno script che gira PRIMA. */
  await pag.addInitScript(() => { window.__oraVera = performance.now.bind(performance); });
  await pag.addInitScript(bancoDiProva);
  await pag.addInitScript(semeFisso, 20260829);
  await pag.addInitScript(() => { window.requestIdleCallback=()=>0; window.cancelIdleCallback=()=>{}; });
  await pag.goto('http://127.0.0.1:'+srv.porta+'/'+rel+'?q='+Date.now(), {waitUntil:'load'});
  await pag.evaluate(() => window.__banco.passo(30));

  const R = await pag.evaluate((giri) => {
    const cv=document.createElement('canvas'); cv.width=300; cv.height=300;
    const g=cv.getContext('2d');
    const lk=Rig3D.lookPredefinito;
    function unGiro(nome){
      const t0=window.__oraVera();
      for(let f=0;f<600;f++){
        g.clearRect(0,0,300,300);
        for(let i=0;i<22;i++)
          Rig3D.disegna(g, 30+(i%6)*48, 60+((i/6)|0)*60, 30, i*0.6, 'alto', nome, f/60+i*0.13, lk);
      }
      return (window.__oraVera()-t0)/600;
    }
    /* riscaldamento: la prima passata paga la compilazione */
    unGiro('corsa'); unGiro('corsa');
    const out = {};
    for (const nome in Rig3D.CLIPS) {
      const t=[]; for(let k=0;k<giri;k++) t.push(unGiro(nome));
      t.sort((a,b)=>a-b);
      out[nome] = +t[(t.length/2)|0].toFixed(3);
    }
    return out;
  }, GIRI);
  await br.close(); srv.chiudi();

  const righe = Object.entries(R).sort((a,b)=>b[1]-a[1]);
  const tot = righe.reduce((s,r)=>s+r[1],0)/righe.length;
  console.log('COSTO DEL RIG — 22 figure x 600 fotogrammi a 30 px, camera alto, mediana di '+GIRI+' giri');
  for (const [k,v] of righe) console.log('  '+k.padEnd(12)+' '+v.toFixed(3)+' ms/fotogramma   ('+(1000/v|0)+' fps se fosse tutto)');
  /* IL NUMERO DELLE CLIP SI CONTA, NON SI SCRIVE A MANO: qui c'era
     «21», e il giorno in cui il registro e' passato a 23 la riga
     mentiva. Un commento che cita un numero deve misurarlo. */
  console.log('  MEDIA fra le '+righe.length+' clip: '+tot.toFixed(3)+' ms');
  console.log(JSON.stringify(R));
})().catch(e => { console.error('FALLITO: '+(e&&e.stack||e)); process.exit(1); });
