/* banco avversario: l'altezza del pannello di PAUSA con la riga dei comandi
   nuova (piu' lunga: «a destra»/«a sinistra» + il bottone «cambia»).
   Misura il rettangolo VERO di ABBANDONA e dice se il centro esce dal
   bordo basso della finestra. */
const { chromium } = require('playwright');
const B = 'http://127.0.0.1:8791/';
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};

const CASI = [
  ['spedito',  'CALCETTO-il-gioco.html', 0],
  ['toppa-dx', 'fuori/cmd-prima.html',   0],
  ['toppa-sx', 'fuori/cmd-prima.html',   1],
];
const FIN = [[915,412],[812,375],[740,360],[640,360],[667,375],[853,384],[412,915]];

(async()=>{
  const b = await chromium.launch();
  const righe=[];
  for(const [nome,file,mn] of CASI){
    for(const [w,h] of FIN){
      const ctx = await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,hasTouch:true});
      const pg = await ctx.newPage();
      const err=[];
      pg.on('pageerror',e=>err.push(String(e.message).slice(0,90)));
      await pg.goto(B+file+'?v='+Date.now(),{waitUntil:'load'});
      await pg.waitForFunction('window.__test && window.__test.state',null,{timeout:20000});
      /* mancino acceso PRIMA della partita, dal salvataggio vero */
      if(mn) await pg.evaluate(()=>{ SAVE.pollice.mancino=1; persistSave(); });
      const r = await pg.evaluate(async ()=>{
        __test.startMatch(1,1);
        /* stato peggiore: possesso campionato e falli in tabella, cosi' la
           lavagnetta c'e' — e' il caso che il commento del gioco dichiara
           come «ogni pausa dopo la prima» */
        G.stats.possesso=[220,180]; G.stats.falli=[2,1];
        G.scene='play';
        setPaused(true);
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        const q=document.getElementById('btnQuit').getBoundingClientRect();
        const pc=document.getElementById('pausaCmd').getBoundingClientRect();
        const box=document.querySelector('#pausa .box').getBoundingClientRect();
        const ov=document.getElementById('pausa');
        return { quit:{t:+q.top.toFixed(1),b:+q.bottom.toFixed(1),c:+((q.top+q.bottom)/2).toFixed(1)},
                 cmdH:+pc.height.toFixed(1), cmdW:+pc.width.toFixed(1),
                 boxH:+box.height.toFixed(1), boxTop:+box.top.toFixed(1),
                 scrollH:ov.scrollHeight, clientH:ov.clientHeight,
                 VH:innerHeight, paused:!!G.paused, cls:ov.className,
                 stat:document.getElementById('pausaStat').className,
                 testo:document.getElementById('pausaCmd').textContent.slice(0,200) };
      });
      const fuori = r.quit.c > r.VH || r.quit.b > r.VH;
      righe.push([nome,w+'x'+h,'quit c='+r.quit.c+' b='+r.quit.b+' VH='+r.VH,
                  'cmdH='+r.cmdH,'boxH='+r.boxH,'scroll='+r.scrollH+'/'+r.clientH,
                  fuori?'*** FUORI ***':'ok', 'paused='+r.paused, 'cls='+r.cls, 'stat='+r.stat,
                  JSON.stringify(r.testo), err.length?('ERR '+err[0]):''].join(' | '));
      await ctx.close();
    }
  }
  console.log(righe.join('\n'));
  await b.close();
})();
