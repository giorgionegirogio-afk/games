/* =====================================================================
   _t-sonda-etichetta.js — QUANTO MENTE L'ETICHETTA DEI PULSANTI.

   PERCHE'. I due pulsanti di destra cambiano verbo col possesso:
   TIRA/FILTRANTE quando la palla e' nostra, CONTRASTA/CAMBIO quando non
   lo e'. Il contesto lo decide `possessoTeam(t)`, che legge SOLO
   `b.owner` — e `b.owner` vale -1 per tutto il volo di un passaggio.
   Quindi dopo ogni passaggio i pulsanti dicono la cosa sbagliata mentre
   la palla e' ancora nostra. Questo file non lo suppone: lo conta.

   COSA CONTA, fotogramma per fotogramma, in partite a seme fisso.
   La VERITA' dichiarata (e non l'implementazione) e':
       nostra  = il pallone e' di un nostro uomo, OPPURE e' in volo
                 verso un nostro uomo (b.passTo)
       loro    = lo stesso per l'altra squadra
       libera  = ne' l'uno ne' l'altro
   e da li' tre famiglie di errore, tenute separate perche' NON hanno lo
   stesso prezzo:
     FN  falso negativo — la palla e' NOSTRA e il pulsante dice
         CONTRASTA/CAMBIO. E' l'errore che costa: il dito chiede il tiro
         e ottiene una scivolata.
     FP-loro  il pulsante dice TIRA e il pallone ce l'ha l'AVVERSARIO.
         Costa quasi quanto: chiedi contrasto e non arriva.
     FP-libera  il pulsante dice TIRA e il pallone non e' di nessuno.
         E' il prezzo dichiarato di un'eventuale isteresi: una palla che
         abbiamo appena calciato resta "nostra" per un attimo.
   Piu' lo SFARFALLIO: quante volte l'etichetta cambia, e quanti degli
   intervalli che mostra durano meno di un quarto di secondo — cioe'
   quante volte scrive una parola che nessun occhio fa in tempo a
   leggere.

   COME NON MENTE. Stesso impianto di _eventi.js: Math.random governato
   da xorshift32 a seme fisso prima che la pagina esegua una riga, ciclo
   di disegno spento, fisica avanzata solo da __test.simulate. La sonda
   avvolge window.step e legge, dopo ogni passo, `possessoTeam(0/1)` —
   cioe' ESATTAMENTE la funzione che il gioco usa per scrivere i verbi —
   piu' lo stato del pallone. Non pesca numeri casuali: la partita
   misurata e' la partita non misurata. La ripetibilita' si controlla da
   se' (--diagnosi rigioca le prime partite su una pagina nuova).

   uso:
     node strumenti/_t-sonda-etichetta.js
     node strumenti/_t-sonda-etichetta.js --gioco fuori/dopo.html --etichetta DOPO
     node strumenti/_t-sonda-etichetta.js --partite 12 --seme 20260803 --taglia 5
     node strumenti/_t-sonda-etichetta.js --json fuori/prima.json
     node strumenti/_t-sonda-etichetta.js --contro fuori/prima.json
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

/* --------------------------------------------------------------- sonda */
const SONDA = `(() => {
  if (window.__et) return 'gia-installata';
  const S = {};
  const azzera = () => {
    S.f=0;
    /* per squadra: [0]=noi visti da 0, [1]=noi visti da 1 */
    S.q=[0,1].map(()=>({
      frames:0, nostra:0, loro:0, libera:0,
      lab:0,                    // fotogrammi con l'etichetta "possesso"
      fn:0, fnPass:0, fnAltro:0,
      fpLoro:0, fpLibera:0,
      cambi:0, run:[], corti:0, cortiVeri:0,
      passVoli:0, passFrames:0, voli:[], passLento:0, passFermo:0,
      _lab:null, _runDa:0, _pass:false, _voloDa:0
    }));
  };
  azzera();
  const _step = window.step;
  const teamOf = i => (i>=0 && G.players[i]) ? G.players[i].team : -1;

  window.step = function(){
    _step.apply(this, arguments);
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.f++;
    const b=G.ball;
    const to=teamOf(b.owner), tp=(b.owner<0)?teamOf(b.passTo):-1;
    for(let t=0;t<2;t++){
      const q=S.q[t];
      const nostra = (to===t) || (tp===t);
      const loro   = (to===(1-t)) || (tp===(1-t));
      const libera = !nostra && !loro;
      const lab = !!possessoTeam(t);
      q.frames++;
      if(nostra) q.nostra++; else if(loro) q.loro++; else q.libera++;
      if(lab) q.lab++;
      if(!lab && nostra){ q.fn++; if(tp===t) q.fnPass++; else q.fnAltro++; }
      if(lab && !nostra){ if(loro) q.fpLoro++; else q.fpLibera++; }
      /* volo del passaggio: quanti fotogrammi la palla e' in aria verso
         un nostro uomo, e quanti voli distinti */
      if(tp===t){
        q.passFrames++;
        const sp=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
        if(sp<150) q.passLento++;
        if(sp<40) q.passFermo++;
        if(!q._pass){ q.passVoli++; q._pass=true; q._voloDa=q.frames; }
      } else {
        if(q._pass) q.voli.push(q.frames-q._voloDa);
        q._pass=false;
      }
      /* durata degli intervalli mostrati */
      if(q._lab===null){ q._lab=lab; q._runDa=q.frames; }
      else if(lab!==q._lab){
        const len=q.frames-q._runDa;
        q.cambi++; q.run.push(len);
        if(len<15) q.corti++;
        q._lab=lab; q._runDa=q.frames;
      }
    }
  };

  window.__et = { azzera, leggi(){
    return S.q.map(q=>{
      const o={}; for(const k in q) if(k[0]!=='_' && k!=='run' && k!=='voli') o[k]=q[k];
      const v=q.voli.slice().sort((a,b)=>a-b);
      o.voloN=v.length;
      o.voloMed=v.length?v[(v.length-1)>>1]:0;
      o.voloMax=v.length?v[v.length-1]:0;
      o.volo15=v.filter(x=>x>15).length;   // oltre 0,25 s
      o.volo60=v.filter(x=>x>60).length;   // oltre 1 s
      o.volo180=v.filter(x=>x>180).length; // oltre 3 s: passTo rancido
      /* la classifica delle durate mostrate, in fotogrammi */
      const r=q.run.slice().sort((a,b)=>a-b);
      o.runN=r.length;
      o.runMed=r.length?r[(r.length-1)>>1]:0;
      o.runMin=r.length?r[0]:0;
      o.run5=r.filter(x=>x<5).length;
      o.run15=r.filter(x=>x<15).length;
      o.run30=r.filter(x=>x<30).length;
      return o;
    });
  }};
  return 'ok';
})()`;

/* --------------------------------------------------------------- corsa */
async function gioca(browser, porta, partite, semeBase, diff, taglia, etichetta) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    }
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, semeBase);
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('la sonda non si e\' installata: ' + inst);

  const out = [];
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([seme, diff, taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__et.azzera();
      t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      return { q: window.__et.leggi(), scena: t.state };
    }, [(semeBase + i) >>> 0, diff, taglia]);
    out.push(r);
  }
  await ctx.close();
  return { partite: out, errori };
}

/* --------------------------------------------------------------- somma */
function somma(righe, t) {
  const s = {};
  for (const r of righe) for (const k in r.q[t]) s[k] = (s[k] || 0) + r.q[t][k];
  return s;
}
const DT = 1 / 60;
function stampa(nome, righe) {
  console.log(`\n=== ${nome} — ${righe.length} partite ===`);
  const out = [];
  for (let t = 0; t < 2; t++) {
    const s = somma(righe, t);
    const sec = x => (x * DT).toFixed(2) + ' s';
    const pc = x => (x / Math.max(1, s.frames) * 100).toFixed(2) + '%';
    console.log(`  --- squadra ${t} ---`);
    console.log(`  fotogrammi di gioco              ${s.frames}   (${(s.frames * DT).toFixed(0)} s)`);
    console.log(`  la palla e' nostra               ${pc(s.nostra)}   loro ${pc(s.loro)}   di nessuno ${pc(s.libera)}`);
    console.log(`  etichetta "possesso"             ${pc(s.lab)}`);
    console.log(`  FN  nostra ma dice CONTRASTA     ${s.fn}  (${pc(s.fn)}, ${(s.fn * DT / righe.length).toFixed(2)} s a partita)`);
    console.log(`        di cui passaggio in volo   ${s.fnPass}`);
    console.log(`        di cui altro               ${s.fnAltro}`);
    console.log(`  FP  dice TIRA e l'ha l'AVVERSARIO ${s.fpLoro}  (${pc(s.fpLoro)})`);
    console.log(`  FP  dice TIRA e la palla e' libera ${s.fpLibera}  (${pc(s.fpLibera)})`);
    console.log(`  voli di passaggio verso di noi   ${s.passVoli}   (${s.passFrames} fotogrammi, ${(s.passFrames / Math.max(1, s.passVoli) * DT * 1000).toFixed(0)} ms l'uno)`);
    console.log(`        volo: ${s.voloN} conclusi · mediana per partita ${(s.voloMed / Math.max(1, righe.length) * DT * 1000).toFixed(0)} ms · oltre 1 s ${s.volo60} · oltre 3 s ${s.volo180}`);
    console.log(`        fotogrammi di volo con palla sotto 150 u/s  ${s.passLento}  (sotto 40 u/s: ${s.passFermo})`);
    console.log(`  cambi di etichetta               ${s.cambi}   (${(s.cambi / (s.frames * DT / 60)).toFixed(1)} al minuto)`);
    console.log(`  intervalli mostrati piu' corti di 0,25 s   ${s.run15} su ${s.runN}   (sotto 0,08 s: ${s.run5})`);
    out.push(s);
  }
  return out;
}
function delta(a, b) {
  console.log('\n=== DELTA (somme, squadra 0) ===');
  const A = a[0], B = b[0];
  const voci = ['frames', 'fn', 'fnPass', 'fnAltro', 'fpLoro', 'fpLibera', 'cambi', 'run5', 'run15', 'runN'];
  console.log('  ' + 'voce'.padEnd(24) + 'prima'.padStart(9) + 'dopo'.padStart(9) + 'delta'.padStart(9));
  for (const k of voci) {
    const x = A[k] | 0, y = B[k] | 0;
    console.log('  ' + k.padEnd(24) + String(x).padStart(9) + String(y).padStart(9) + ((y - x >= 0 ? '+' : '') + (y - x)).padStart(9));
  }
}

(async () => {
  const partite = Math.max(1, +arg('partite', 12) | 0);
  const semeBase = +arg('seme', 20260803);
  const diff = Math.max(0, Math.min(2, +arg('diff', 1) | 0));
  const taglia = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
  const etichetta = arg('etichetta', 'OGGI');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const fileJson = arg('json', '');
  const contro = arg('contro', '');
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco di prova inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  console.log(`\n=== ETICHETTA — ${partite} partite, semi ${semeBase}..${semeBase + partite - 1}, ${taglia} contro ${taglia} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  const A = await gioca(browser, srv.porta, partite, semeBase, diff, taglia, etichetta);
  if (A.errori.length) console.log('  NO    eccezioni: ' + A.errori[0]);
  const s = stampa(etichetta, A.partite);

  let diagOK = true;
  if (!haFlag('no-diagnosi')) {
    const n = Math.min(3, partite);
    const B = await gioca(browser, srv.porta, n, semeBase, diff, taglia, 'diagnosi');
    const bad = [];
    for (let i = 0; i < n; i++) for (let t = 0; t < 2; t++)
      for (const k of ['frames', 'fn', 'fpLoro', 'fpLibera', 'cambi'])
        if (A.partite[i].q[t][k] !== B.partite[i].q[t][k]) bad.push(`partita ${i} squadra ${t} ${k}: ${A.partite[i].q[t][k]} contro ${B.partite[i].q[t][k]}`);
    diagOK = !bad.length;
    console.log(`\n  ${diagOK ? 'OK  ' : 'NO  '} autodiagnosi: ${n} partite rigiocate su pagina nuova danno gli stessi conteggi`);
    if (!diagOK) console.log('        ' + bad.slice(0, 4).join('\n        '));
  }
  await browser.close(); srv.chiudi();

  if (fileJson) {
    fs.writeFileSync(path.resolve(fileJson), JSON.stringify({ etichetta, partite, semeBase, taglia, gioco: provaAbs || 'repo', crudo: A.partite }, null, 1));
    console.log(`\n  --    crudo salvato in ${fileJson}`);
  }
  if (contro) {
    const p = JSON.parse(fs.readFileSync(path.resolve(contro), 'utf8'));
    console.log(`\n  --    confronto con ${p.etichetta}`);
    const sA = [0, 1].map(t => somma(p.crudo, t));
    delta(sA, s);
  }
  if (!diagOK || A.errori.length) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
