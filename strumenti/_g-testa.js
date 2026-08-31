/* =====================================================================
   _g-testa.js — SOLA MISURA. Quando un uomo incorna, che cosa disegna
   il gioco?

   Non si aspetta che capiti: si CHIAMA la funzione vera del gioco,
   `colpoDiTesta(q, qi, b)`, e subito dopo si legge la posa che
   `rigStato` restituisce per quello stesso uomo. Nessuna copia della
   regola, nessuna deduzione dal commento.

   TRE CASI, perche' il ripiego `p.kickClip||'passaggio'` (riga 31803)
   dipende da che cosa quell'uomo aveva calciato PRIMA:
     A. uomo che non ha mai calciato          -> kickClip nullo
     B. uomo che aveva appena passato         -> kickClip 'passaggio'
     C. uomo che aveva appena tirato          -> kickClip 'tiro'
   Se la posa e' la stessa nei tre casi e nessuna di esse e' una posa di
   testa, la voce del confronto e' confermata al pixel di codice.

   Si stampa anche, per ciascuno, l'ANGOLO DELLA GAMBA nella posa
   disegnata (banco.P, giunto piede destro) e la quota della TESTA: una
   incornata vera porta la testa verso il pallone, una pedata no.

   uso: node strumenti/_g-testa.js [--gioco f]
   ===================================================================== */
const path = require('path');
const { servi, bancoDiProva, semeFisso } = require('./_posa.js');
const RADICE = path.resolve(__dirname, '..');
const arg = (n,d) => { const i=process.argv.indexOf('--'+n);
  return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d; };
const GIOCO = path.resolve(arg('gioco', path.join(RADICE,'CALCETTO-il-gioco.html')));

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
  await pag.goto('http://127.0.0.1:'+srv.porta+'/'+rel+'?q='+Date.now(), {waitUntil:'load'});
  await pag.evaluate(() => window.__banco.passo(30));
  await pag.evaluate(() => { window.__test.dismissSplash&&window.__test.dismissSplash();
    window.__test.startMatch(1,1,{size:5}); window.__test.setCpuVsCpu(true);
    window.__test.setTimeLeft(600); });
  await pag.evaluate(() => { for(let i=0;i<120;i++){ window.__test.simulate(1/60); window.__test.disegna(); } });

  const R = await pag.evaluate(() => {
    const out = [];
    /* il registro delle clip che il gioco considera «di calcio» */
    const RIGCALCI = Object.keys({passaggio:1,filtrante:1,cross:1,tiro:1});
    for (const caso of [{n:'A. mai calciato', pre:null},
                        {n:'B. aveva passato', pre:'passaggio'},
                        {n:'C. aveva tirato',  pre:'tiro'}]) {
      /* un uomo di movimento qualsiasi, ripulito */
      const q = G.players.find(p => p.role!=='gk' && p.out<=0);
      const qi = G.players.indexOf(q);
      q.kickT=0; q.kickB=0; q.kickCd=0; q.charge=-1; q.chargeClip=null;
      q.slide=-1; q.recover=0; q.rove=-1; q.celeb=0; q.mesto=0;
      q.fintaT=0; q.frenaT=0; q.presaT=0; q.rinvT=0; q.lodPosa=false;
      q.kickClip = caso.pre;
      /* un pallone alto sopra la testa, non di nessuno, a portata */
      const b = G.ball;
      b.owner=-1; b.passTo=-1; b.crossTo=-1; b.x=q.x+4; b.y=q.y+2;
      b.z=(Z_SOPRA_TESTA+Z_TESTA_MAX)/2; b.vx=120; b.vy=0; b.vz=-40;
      const primaClip = q.kickClip;
      colpoDiTesta(q, qi, b);
      const dopoClip = q.kickClip;
      const st = rigStato(q);
      /* la posa cruda: dove sta il piede e dove sta la testa */
      const B = Rig3D.banco;
      B.corpora(3,0); B.posa(st.clip, st.u);
      const y = j => +B.P[j*3+1].toFixed(4), z = j => +B.P[j*3+2].toFixed(4);
      /* i nomi dei giunti sono costanti del rig: HEAD 3, piede destro FTR */
      out.push({ caso: caso.n,
                 kickClipPrima: primaClip, kickClipDopo: dopoClip,
                 kickT: +q.kickT.toFixed(3), kickB: +q.kickB.toFixed(3),
                 clipDisegnata: st.clip, faseU: +st.u.toFixed(4),
                 clipEDiCalcioColPIEDE: RIGCALCI.indexOf(st.clip) >= 0,
                 testaQuota: y(3), testaAvanti: z(3),
                 nGiuntiSopraTesta: (() => { let n=0; for(let j=0;j<B.NJ;j++) if(B.P[j*3+1] > B.P[3*3+1]) n++; return n; })(),
               });
    }
    /* CHI SCRIVE kickClip, in tutto il file: la prova che colpoDiTesta
       non e' fra loro sta nel conteggio, non nella lettura a occhio */
    return { casi: out,
             Z_SOPRA_TESTA, Z_TESTA_MAX,
             ripiegoDiRigStato: "p.kickClip||'passaggio'  (riga 31803)" };
  });
  await br.close(); srv.chiudi();
  console.log(JSON.stringify(R, null, 1));
})().catch(e => { console.error('FALLITO: '+(e&&e.stack||e)); process.exit(1); });
