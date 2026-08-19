/* =====================================================================
   _t-lob-indietro.js — IL BANCO CHE PUO' BOCCIARE LA TOPPA DEL
   PALLONETTO.

   PERCHE' ESISTE. Il banco precedente (_t-partita-banco.js) puntava la
   levetta SEMPRE verso la porta: con `(t===0 ? -mx : mx) > 0.5` il suo
   «0 pallonetti dopo la toppa» era garantito prima di premere invio. E'
   lo stesso punto cieco di strumenti/giocatore.js:208 (pollice a 44 px,
   sotto STICK_SPRINT 66), un piano piu' su. Qui il pollice tira
   INDIETRO apposta, ed e' l'unico modo di far uscire il numero che la
   toppa rischia: il pallonetto che parte mentre spazzi arretrando.

   COSA CONTA. Ogni volta che il robot RILASCIA il pulsante del tiro:
     - il tiro e' partito? (fireShot esce a vuoto se il pallone non c'e')
     - e' un pallonetto?
     - com'era la levetta in quell'istante: lunghezza in px e coseno
       rispetto all'indietro.
   Da li' tre numeri per configurazione: tiri, pallonetti, e la quota di
   pallonetti NON CHIESTI — cioe' quelli usciti quando il robot stava
   attaccando, non spazzando.

   LE CONFIGURAZIONI, e perche' proprio queste:
     attaccante-80   punta la porta, pollice a fondo corsa. E' il caso
                     che PRIMA sbagliava sempre (24 tiri su 24) e che
                     DOPO deve azzerarsi.
     difensore-80    ha la palla nella propria meta' con un avversario
                     addosso: indietreggia e spazza. Pollice a fondo
                     corsa: PRIMA era pallonetto per via dello sprint,
                     DOPO e' pallonetto per via dell'indietro. Se i due
                     numeri sono uguali, la toppa NON ha peggiorato
                     questo caso — ed e' quello che il critico chiedeva
                     di verificare invece di dedurre.
     difensore-44    lo stesso, ma col pollice a 44 px: SOTTO
                     STICK_SPRINT (66) e sopra la meta' della corsa
                     piena. E' la BANDA DEL RISCHIO NUOVO: prima non era
                     pallonetto (niente sprint), dopo lo diventa
                     (mx normalizzato oltre 0,5 all'indietro). Qui la
                     toppa puo' solo peggiorare, e il banco lo misura.
     misto-44        gioca normale a 44 px: attacca, ma indietreggia
                     quando e' pressato. E' la stima di quanto capita
                     per sbaglio in una partita che nessuno ha truccato.

   COME NON MENTE. Partite a seme fisso, ciclo di disegno spento, fisica
   avanzata solo da __test.simulate, squadra 0 umana pilotata da un robot
   deterministico che scrive nello stick (Touch5.stick[0]) e chiama
   startCharge/releaseCharge — cioe' esattamente quello che fa il dito
   sul pulsante grande. Un tiro conta solo se il tabellino lo registra:
   fireShot esce PRIMA di G.stats.tiri++ quando il pallone non e' ne' al
   piede ne' a portata, e contare le chiamate invece dei tiri gonfia i
   pallonetti (e' gia' successo).
   Il banco si autodiagnostica: due corse su pagina nuova devono dare gli
   stessi conteggi.

   uso:
     node strumenti/_t-lob-indietro.js --etichetta PRIMA
     node strumenti/_t-lob-indietro.js --gioco fuori/lob.html --etichetta DOPO
     node strumenti/_t-lob-indietro.js --partite 6 --taglia 11
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
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
  if (window.__li) return 'gia-installata';
  const T = 0;
  const S = { f:0, tiri:0, lob:0, lobAttacco:0, lobDifesa:0, chiamate:0,
              rilasciIndietro:0, rilasciAvanti:0, lung:[], _stile:'attaccante', _R:80,
              _inRilascio:false, _indietro:false, spazzate:0, spazzateLob:0,
              attacchi:0, attacchiLob:0 };
  const azzera = (stile,R) => {
    S.f=0; S.tiri=0; S.lob=0; S.lobAttacco=0; S.lobDifesa=0; S.chiamate=0;
    S.rilasciIndietro=0; S.rilasciAvanti=0; S.lung=[];
    S.spazzate=0; S.spazzateLob=0; S.attacchi=0; S.attacchiLob=0;
    S._stile=stile; S._R=R; S._inRilascio=false; S._indietro=false;
    carica=0; attesa=0; ritirata=0;
  };
  const idx = p => G.players.indexOf(p);

  /* IL CONTATORE E' SUL TIRO CHE PARTE, non sulla chiamata. */
  const _fire = window.fireShot;
  window.fireShot = function(p,nx,ny,q,lob){
    const t0 = G.stats.tiri[p.team];
    const r = _fire.apply(this, arguments);
    if(p.team!==T || G.stats.tiri[T]===t0 || !S._inRilascio) return r;
    S.tiri++;
    if(lob){ S.lob++; if(S._indietro) S.lobDifesa++; else S.lobAttacco++; }
    if(S._indietro){ S.spazzate++; if(lob) S.spazzateLob++; }
    else { S.attacchi++; if(lob) S.attacchiLob++; }
    return r;
  };

  let carica=0, attesa=0, ritirata=0;
  const _step = window.step;
  function robot(){
    const p = ctrlPlayer(T); if(!p) return;
    const b = G.ball, pi = idx(p);
    const gx = FW, gy = FH/2;                  // la squadra 0 attacca +x
    const mia = b.owner===pi;
    /* c'e' un avversario addosso? */
    let vic = 1e9;
    for(const q of G.players) if(q.team!==T && q.out<=0) vic = Math.min(vic, Math.hypot(q.x-p.x,q.y-p.y));
    const meta = p.x < FW/2;                   // nella nostra meta' campo
    let indietro = false;
    if(S._stile==='difensore') indietro = mia;
    else if(S._stile==='misto') indietro = mia && meta && vic<70;
    /* la ritirata dura almeno mezzo secondo: un dito non cambia idea a
       ogni fotogramma */
    if(indietro) ritirata = S.f+30;
    indietro = indietro || S.f<ritirata;
    let dx,dy;
    if(mia && indietro){ dx = -(gx-p.x); dy = -(gy-p.y); }      // via dalla porta che attacco
    else if(mia){ dx = gx-p.x; dy = gy-p.y; }
    else { dx = b.x-p.x; dy = b.y-p.y; }
    const L = Math.hypot(dx,dy)||1;
    const st = Touch5.stick[T];
    st.active=true; st.id=-1; st.ox=0; st.oy=0; st.dx=dx/L*S._R; st.dy=dy/L*S._R;
    S._indietro = mia && indietro;

    if(mia){
      const pronto = indietro ? (vic<110 || S.f>=attesa) : (Math.hypot(gx-p.x,gy-p.y)<430);
      if(pronto){
        if(!carica){ startCharge(T); carica=S.f+21; }
        else if(S.f>=carica){
          /* IL GESTO CHIESTO: chi vuole il pallonetto attacca normalmente e
             tira indietro la levetta NELL'ISTANTE del rilascio. Serve a
             verificare che l'arma nuova esista davvero, non solo che quella
             vecchia sia spenta. */
          if(S._stile==='chiedente'){ st.dx=-(gx-p.x)/L*S._R; st.dy=-(gy-p.y)/L*S._R; }
          const l = Math.hypot(st.dx,st.dy);
          const mx = (function(){ const [x] = humanMove(T); return x; })();
          S.lung.push(Math.round(l));
          if((-mx)>0.5) S.rilasciIndietro++; else S.rilasciAvanti++;
          S.chiamate++;
          S._inRilascio=true; releaseCharge(T); S._inRilascio=false;
          carica=0; attesa=S.f+40;
        }
      }
    } else if(carica){
      S._inRilascio=true; releaseCharge(T); S._inRilascio=false;
      carica=0; attesa=S.f+40;
    }
  }
  window.step = function(){ robot(); _step.apply(this, arguments); S.f++; };
  window.__li = { azzera, leggi(){ const o={}; for(const k in S) if(k[0]!=='_') o[k]=S[k];
    const l=S.lung.slice().sort((a,b)=>a-b); o.lungMed = l.length?l[(l.length-1)>>1]:0; delete o.lung; return o; } };
  return 'ok';
})()`;

const CONFIG = [
  { nome: 'attaccante-80', stile: 'attaccante', R: 80 },
  { nome: 'difensore-80', stile: 'difensore', R: 80 },
  { nome: 'difensore-44', stile: 'difensore', R: 44 },
  { nome: 'misto-44', stile: 'misto', R: 44 },
  { nome: 'chiedente-80', stile: 'chiedente', R: 80 },
  { nome: 'chiedente-44', stile: 'chiedente', R: 44 },
];

async function gioca(browser, porta, partite, semeBase, diff, taglia) {
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
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  if (await pag.evaluate(SONDA) !== 'ok') throw new Error('la sonda non si e\' installata');

  const out = {};
  for (const c of CONFIG) {
    const acc = {};
    for (let i = 0; i < partite; i++) {
      const r = await pag.evaluate(([seme, diff, taglia, stile, R]) => {
        const t = window.__test;
        window.__caso.semina(seme);
        window.__li.azzera(stile, R);
        t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined);
        let sim = 0;
        while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
        return window.__li.leggi();
      }, [(semeBase + i) >>> 0, diff, taglia, c.stile, c.R]);
      for (const k in r) acc[k] = (acc[k] || 0) + r[k];
    }
    out[c.nome] = acc;
  }
  await ctx.close();
  return { conf: out, errori };
}

(async () => {
  const partite = Math.max(1, +arg('partite', 6) | 0);
  const semeBase = +arg('seme', 20260803);
  const diff = Math.max(0, Math.min(2, +arg('diff', 1) | 0));
  const taglia = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
  const etichetta = arg('etichetta', 'OGGI');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco di prova inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  console.log(`\n=== PALLONETTO INDIETRO — ${etichetta}, ${partite} partite, semi ${semeBase}..${semeBase + partite - 1}, ${taglia}v${taglia} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  const A = await gioca(browser, srv.porta, partite, semeBase, diff, taglia);
  if (A.errori.length) console.log('  NO    eccezioni: ' + A.errori[0]);

  const L = [16, 8, 12, 12, 12, 14, 12];
  const H = ['configurazione', 'tiri', 'pallonetti', 'in attacco', 'spazzando', 'levetta ind.', 'levetta px'];
  console.log('\n  ' + H.map((h, i) => h.padStart(L[i])).join(''));
  for (const c of CONFIG) {
    const s = A.conf[c.nome];
    const q = s.tiri ? (s.lob / s.tiri * 100).toFixed(0) + '%' : '-';
    console.log('  ' + [c.nome, s.tiri, `${s.lob} (${q})`, `${s.attacchiLob}/${s.attacchi}`,
      `${s.spazzateLob}/${s.spazzate}`, `${s.rilasciIndietro}/${s.chiamate}`, s.lungMed / Math.max(1, 1)]
      .map((x, i) => String(x).padStart(L[i])).join(''));
  }
  console.log('\n  in attacco / spazzando = pallonetti su tiri, separati per come stava andando il');
  console.log('  robot in quell\'istante; levetta ind. = rilasci con la levetta tirata indietro');
  console.log('  oltre il coseno 0,5; levetta px = somma delle lunghezze mediane per partita.');

  let diagOK = true;
  if (!haFlag('no-diagnosi')) {
    /* due corse CORTE ma uguali fra loro, su due pagine nuove: se i
       conteggi non coincidono il banco non e' ripetibile e non si legge
       nient'altro. (Non si confronta con la corsa lunga: quella fa piu'
       partite e le somme sarebbero diverse per costruzione.) */
    const B = await gioca(browser, srv.porta, Math.min(2, partite), semeBase, diff, taglia);
    const C = await gioca(browser, srv.porta, Math.min(2, partite), semeBase, diff, taglia);
    const bad = [];
    for (const c of CONFIG) for (const k of ['tiri', 'lob', 'chiamate', 'spazzate'])
      if (B.conf[c.nome][k] !== C.conf[c.nome][k]) bad.push(`${c.nome}.${k}: ${B.conf[c.nome][k]} contro ${C.conf[c.nome][k]}`);
    diagOK = !bad.length;
    console.log(`\n  ${diagOK ? 'OK  ' : 'NO  '} autodiagnosi: due corse su pagina nuova danno gli stessi conteggi`);
    if (!diagOK) console.log('        ' + bad.slice(0, 4).join('\n        '));
  }
  await browser.close(); srv.chiudi();
  if (!diagOK || A.errori.length) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
