/* =====================================================================
   _q-grumo.js — QUANTI UOMINI ATTACCANO L'AREA INSIEME.

   Nasce da un'obiezione del critico (_onda0bis/b9.md, N1) che era giusta:
   il commento di attaccaArea diceva "Uno solo e non due", e il codice
   ammette DUE. Un commento che afferma un'invariante che il codice non
   garantisce e' esattamente la famiglia di difetti per cui la prima
   stesura era stata bocciata, quindi il numero vero va misurato, non
   stimato — e va misurato da uno strumento che chiunque puo' rilanciare.

   COSA CONTA, a ogni fotogramma di gioco e per ogni squadra:
     quanti uomini hanno corsaArea > 0 (il cronometro della corsa in
     area). Zero, uno, due, tre... la distribuzione intera, non il
     massimo, perche' il massimo lo tocca anche un solo fotogramma.

   E SEPARA LE DUE CAUSE, che il codice rende leggibili:
     CAMBIO DI TITOLARE  attaccaArea elegge un uomo per squadra ma NON
                         azzera chi perde l'elezione: il vecchio finisce
                         la coda del cronometro (CROSS_CORSA_T) mentre il
                         nuovo comincia la sua;
     DESTINATARIO        il ramo del destinatario di un cross (aiDecide)
                         scrive corsaArea FUORI dall'elezione e torna
                         prima di arrivarci: chi ha il pallone scritto
                         addosso (G.ball.crossTo) ci va comunque.
     Un fotogramma con due uomini in cui uno dei due e' il destinatario
     scritto sul pallone si attribuisce al DESTINATARIO; gli altri al
     cambio di titolare.

   E MISURA LA DURATA degli episodi con due uomini insieme, perche' e' la
   cosa che dice se sono un grumo o un incrocio: un episodio che dura meno
   della coda del cronometro e' una consegna, non due uomini fermi sullo
   stesso punto.

   E LA DISTANZA FRA I DUE, perche' "grumo" vuol dire vicini: si stampa la
   mediana e il minimo della distanza fra i due uomini in corsa, contro
   SEP_R, che e' la distanza alla quale questo gioco considera due
   compagni "nello stesso posto".

   COME NON MENTE, che e' la parte che conta:
     - Math.random e' xorshift32 a seme fisso, ri-seminato a ogni partita;
     - la sonda avvolge step() e LEGGE: non pesca numeri e non decide;
     - CONTROLLO NEGATIVO: sul gioco vergine corsaArea non esiste e lo
       strumento stampa zero ovunque. Se stampasse qualcosa, se lo sarebbe
       inventato;
     - AUTODIAGNOSI: le prime partite si rigiocano su una PAGINA NUOVA e
       si confronta il vettore voce per voce, distanze comprese. Se
       differisce, lo strumento e' cieco, lo dice ed esce 1. Con
       --no-diagnosi si salta, e allora il referto lo dichiara.

   uso:
     node strumenti/_q-grumo.js --partite 24 --taglia 5
     node strumenti/_q-grumo.js --partite 24 --gioco fuori/dopo.html
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
  if (window.__grumo) return 'gia-installata';
  const S = {};
  const azzera = () => {
    S.frames=0;
    S.isto=[0,0,0,0,0,0];        // fotogrammi-squadra con 0,1,2,3,4,5+ uomini
    S.frDue=0;                   // fotogrammi (di partita) con ALMENO una squadra a >=2
    S.max=0;
    S.dovuti={dest:0, titolare:0};
    S.epis=[];                   // durata in fotogrammi degli episodi a >=2
    S._ep=[0,0];
    S.dist=[];                   // distanza fra i due, quando sono esattamente due
  };
  azzera();
  const _step = window.step;

  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    let unaDue=false;
    for(let t=0;t<2;t++){
      const q=[];
      for(const p of G.players){
        if(p.team!==t || p.out>0 || p.role==='gk') continue;
        if(p.corsaArea>0) q.push(p);
      }
      const n=q.length;
      S.isto[Math.min(5,n)]++;
      if(n>S.max) S.max=n;
      if(n>=2){
        unaDue=true;
        S._ep[t]++;
        const dest = G.ball.crossTo;
        const c = q.some(p=>G.players.indexOf(p)===dest);
        if(c) S.dovuti.dest++; else S.dovuti.titolare++;
        if(n===2){
          const dx=q[0].x-q[1].x, dy=q[0].y-q[1].y;
          S.dist.push(Math.sqrt(dx*dx+dy*dy));
        }
      }else{
        if(S._ep[t]>0){ S.epis.push(S._ep[t]); S._ep[t]=0; }
      }
    }
    if(unaDue) S.frDue++;
  };

  window.__grumo = {
    azzera,
    leggi(){
      for(let t=0;t<2;t++) if(S._ep[t]>0){ S.epis.push(S._ep[t]); S._ep[t]=0; }
      return { frames:S.frames, isto:S.isto.slice(), frDue:S.frDue, max:S.max,
               dest:S.dovuti.dest, titolare:S.dovuti.titolare,
               epis:S.epis.slice(), dist:S.dist.slice(),
               sepR: (typeof SEP_R!=='undefined'? SEP_R : null),
               coda: (typeof CROSS_CORSA_T!=='undefined'? CROSS_CORSA_T : null) };
    }
  };
  return 'ok';
})()`;

const mediana = a => { if (!a.length) return null; const b = a.slice().sort((x, y) => x - y); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };

/* UNA PAGINA, UNA CORSA — e la corsa si sa rifare da capo su una pagina
   nuova, che e' l'unico modo di sapere se questo strumento vede o crede. */
async function gioca(browser, porta, partite, semeBase, diff, taglia) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, semeBase);
  await pag.goto('http://127.0.0.1:' + porta + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('la sonda non si e\' installata: ' + inst);
  const out = [];
  for (let i = 0; i < partite; i++) {
    out.push(await pag.evaluate(([seme, diff, tg]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__grumo.azzera();
      t.startMatch(1, diff, tg !== 5 ? { size: tg } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return window.__grumo.leggi();
    }, [(semeBase + i) >>> 0, diff, taglia]));
  }
  await ctx.close();
  return { out, errori };
}

/* la firma di una partita: quello che l'autodiagnosi confronta */
const firma = r => [r.frames, r.frDue, r.max, r.dest, r.titolare,
r.isto.join('/'), r.epis.join('/'), r.dist.map(x => x.toFixed(6)).join('/')].join(' ');

(async () => {
  const partite = Math.max(1, +arg('partite', 24) | 0);
  const semeBase = +arg('seme', 20260803);
  const taglia = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
  const diff = Math.max(0, Math.min(2, +arg('diff', 1) | 0));
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const diagnosi = !haFlag('no-diagnosi');
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();

  console.log(`\n=== DUE UOMINI IN AREA — ${partite} partite, CPU contro CPU, semi ${semeBase}..${semeBase + partite - 1}, ${taglia} contro ${taglia} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  const A = await gioca(browser, srv.porta, partite, semeBase, diff, taglia);
  if (A.errori.length) { console.error('  NO   eccezioni: ' + A.errori[0]); await browser.close(); srv.chiudi(); process.exit(1); }

  const tot = { frames: 0, isto: [0, 0, 0, 0, 0, 0], frDue: 0, max: 0, dest: 0, titolare: 0, epis: [], dist: [], sepR: A.out[0].sepR, coda: A.out[0].coda };
  for (const r of A.out) {
    tot.frames += r.frames; tot.frDue += r.frDue; tot.dest += r.dest; tot.titolare += r.titolare;
    tot.max = Math.max(tot.max, r.max);
    for (let k = 0; k < 6; k++) tot.isto[k] += r.isto[k];
    tot.epis = tot.epis.concat(r.epis);
    tot.dist = tot.dist.concat(r.dist);
  }

  let diagOK = true, guai = [];
  if (diagnosi) {
    const n = Math.min(3, partite);
    const B = await gioca(browser, srv.porta, n, semeBase, diff, taglia);
    for (let i = 0; i < n; i++) if (firma(A.out[i]) !== firma(B.out[i])) guai.push(`partita ${i}:\n        ${firma(A.out[i])}\n        ${firma(B.out[i])}`);
    diagOK = guai.length === 0;
  }
  await browser.close(); srv.chiudi();

  const fp = tot.frames || 1;
  const sq = tot.isto.reduce((s, x) => s + x, 0) || 1;
  console.log(`\n  fotogrammi di partita              ${tot.frames}`);
  console.log(`  fotogrammi-SQUADRA                 ${sq}`);
  console.log(`  massimo uomini in corsa insieme    ${tot.max}`);
  console.log(`  distribuzione (fotogrammi-squadra):`);
  for (let k = 0; k < 6; k++) if (tot.isto[k]) console.log(`      ${k === 5 ? '5+' : k} uomini   ${tot.isto[k]}   ${(tot.isto[k] / sq * 100).toFixed(3)}%`);
  console.log(`  fotogrammi di partita con almeno una squadra a >=2:  ${tot.frDue}   ${(tot.frDue / fp * 100).toFixed(3)}%`);
  const due = tot.dest + tot.titolare;
  if (due) {
    console.log(`  causa dei fotogrammi-squadra a >=2:`);
    console.log(`      destinatario di un cross (b.crossTo)     ${tot.dest}   ${(tot.dest / due * 100).toFixed(1)}%`);
    console.log(`      cambio di titolare (coda del cronometro) ${tot.titolare}   ${(tot.titolare / due * 100).toFixed(1)}%`);
  }
  if (tot.epis.length) {
    const s = tot.epis.slice().sort((a, b) => a - b);
    console.log(`  episodi con due o piu' insieme     ${tot.epis.length}`);
    console.log(`      durata mediana   ${(mediana(tot.epis) / 60).toFixed(3)} s   massima ${(s[s.length - 1] / 60).toFixed(3)} s   (coda del cronometro CROSS_CORSA_T = ${tot.coda})`);
    console.log(`      episodi piu' lunghi della coda   ${tot.epis.filter(x => x / 60 > (tot.coda || 0.6) + 1e-9).length}`);
  }
  if (tot.dist.length) {
    const s = tot.dist.slice().sort((a, b) => a - b);
    console.log(`  distanza fra i due (quando sono due): mediana ${mediana(tot.dist).toFixed(1)}   minimo ${s[0].toFixed(1)}   SEP_R = ${tot.sepR}`);
    console.log(`      fotogrammi con i due piu' vicini di SEP_R   ${tot.dist.filter(x => x < tot.sepR).length}`);
  }
  if (!tot.isto[1] && !tot.isto[2]) console.log('\n  --    nessuna corsa in area: su questo file corsaArea non si accende mai (controllo negativo, gioco vergine).');

  if (!diagnosi) console.log('\n  --    autodiagnosi SALTATA (--no-diagnosi): questi numeri non sono stati riverificati su una pagina nuova.');
  else console.log(`\n  ${diagOK ? 'OK  ' : 'NO  '} autodiagnosi: ${Math.min(3, partite)} partite rigiocate su pagina nuova danno lo stesso vettore`);
  if (!diagOK) { console.log('        ' + guai.join('\n        ') + '\n        la misura non e\' riproducibile: lo strumento e\' cieco e non va creduto'); process.exit(1); }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
