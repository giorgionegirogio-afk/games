/* =====================================================================
   _sonda-carattere.js — LE DIECI SQUADRE SONO DIECI SQUADRE DIVERSE?

   PERCHE' ESISTE. TOUR_POOL dichiara dieci squadre di quartiere, e
   accanto a ognuna c'e' una frase: «pressing alto, non ti fa
   respirare», «difesa chiusa, zero rischi», «tiro da fuori come
   religione». Nessuna riga di simulazione legge quel campo — si legge
   solo a schermo, in due posti (il sottotitolo della giornata e il
   pulsante GIOCA LA GIORNATA). Questo strumento chiede al gioco, coi
   numeri, se le dieci squadre si comportano in dieci modi diversi.

   COSA MISURA, per ognuna delle dieci, come SQUADRA 1 contro la stessa
   squadra 0 (il Dopolavoro), CPU contro CPU, semi identici per tutte —
   cosi' la sola cosa che cambia fra una colonna e l'altra e' l'identita'
   dell'avversario:

     tiri        tiri della squadra di quartiere
     dist        distanza mediana del tiro dalla porta (unita')
     gol         reti nel tempo regolamentare
     scivo       scivolate tentate
     falli       falli commessi
     rubate      palloni rubati
     poss        possesso, in frazione
     linea       baricentro della squadra, in frazione di campo verso
                 la porta avversaria (0 = tutti in casa, 1 = tutti li')
     morso       distanza mediana del suo uomo piu' vicino al pallone
                 quando il pallone e' del Dopolavoro. E' il pressing:
                 piccolo = addosso, grande = aspetta.

   E stampa, in fondo, la RIGA CHE CONTA: lo scarto fra la squadra piu'
   alta e la piu' bassa su ogni voce, in unita' di scarto tipo fra le
   partite. Se quel numero e' sotto 1 le dieci squadre sono la stessa
   squadra con dieci nomi.

   IL CASO E' GOVERNATO come in _eventi.js: Math.random e' xorshift32 a
   seme fisso, ri-seminato allo stesso valore per ognuna delle dieci
   squadre, e il ciclo di disegno e' spento.

   uso:
     node strumenti/_sonda-carattere.js
     node strumenti/_sonda-carattere.js --partite 16 --taglia 5
     node strumenti/_sonda-carattere.js --gioco fuori/carattere.html --etichetta DOPO
     node strumenti/_sonda-carattere.js --json fuori/car-prima.json
     node strumenti/_sonda-carattere.js --contro fuori/car-prima.json
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

/* --------------------------------------------------------------- la sonda */
/* Avvolge step, startSlide e fireShot. Nessun wrapper pesca un numero
   casuale: la partita misurata e' la partita non misurata. */
const SONDA = `(() => {
  if (window.__car) return 'gia-installata';
  const S = {};
  const azzera = () => {
    S.frames=0; S.scivo=[0,0]; S.tiriD=[[],[]];
    S.baric=[0,0]; S.morso=[]; S.golRegol=null;
  };
  azzera();
  const _step = window.step, _startSlide = window.startSlide, _fireShot = window.fireShot;

  window.startSlide = function(p){ if(p&&p.team!==undefined) S.scivo[p.team]++; return _startSlide.apply(this, arguments); };
  window.fireShot = function(p,nx,ny,q,lob){
    if(p&&p.team!==undefined){
      const gx = p.team===0 ? FW : 0;
      S.tiriD[p.team].push(Math.hypot(p.x-gx, p.y-FH/2));
    }
    return _fireShot.apply(this, arguments);
  };
  window.step = function(){
    _step.apply(this, arguments);
    if(G.golden && !S.golRegol) S.golRegol=[G.score[0],G.score[1]];
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    /* baricentro delle due squadre, in frazione di campo verso la porta
       avversaria: la stessa domanda per tutti e due i colori */
    for(let t=0;t<2;t++){
      let s=0,n=0;
      for(const p of G.players){ if(p.team!==t||p.out>0||p.role==='gk') continue; s+=p.x; n++; }
      if(n) S.baric[t]+= (t===0 ? s/n/FW : 1-s/n/FW);
    }
    /* il MORSO: quando il pallone e' del Dopolavoro, quanto e' vicino
       l'uomo piu' vicino della squadra 1. E' il pressing, misurato. */
    const b=G.ball;
    if(b.owner>=0 && G.players[b.owner] && G.players[b.owner].team===0){
      let d=1e9;
      for(const p of G.players){ if(p.team!==1||p.out>0||p.role==='gk') continue; d=Math.min(d,Math.hypot(p.x-b.x,p.y-b.y)); }
      if(d<1e8) S.morso.push(d);
    }
  };
  const med = a => { if(!a.length) return 0; const b=a.slice().sort((x,y)=>x-y); const n=b.length; return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2; };
  window.__car = { azzera, leggi(){
    const st=G.stats, due=a=>[(a&&a[0])|0,(a&&a[1])|0];
    const gr = S.golRegol || due(G.score);
    const pos = due(st.possesso), tot = Math.max(1, pos[0]+pos[1]);
    return {
      tiri: due(st.tiri), gol: gr, falli: due(st.falli), rubate: due(st.rubate),
      parate: due(st.parate), specchio: due(st.inPorta),
      scivo: S.scivo.slice(), dist: [med(S.tiriD[0]), med(S.tiriD[1])],
      nTiri: [S.tiriD[0].length, S.tiriD[1].length],
      poss: [pos[0]/tot, pos[1]/tot],
      linea: S.frames ? [S.baric[0]/S.frames, S.baric[1]/S.frames] : [0,0],
      morso: med(S.morso), frames: S.frames
    };
  }};
  return 'ok';
})()`;

/* --------------------------------------------------------------- statistica */
const media = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
const sigma = a => { if (a.length < 2) return 0; const m = media(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1)); };

const VOCI = [
  ['tiri',  v => v.tiri[1],           1],
  ['dist',  v => v.dist[1],           0],
  ['gol',   v => v.gol[1],            2],
  ['scivo', v => v.scivo[1],          1],
  ['falli', v => v.falli[1],          1],
  ['rubate',v => v.rubate[1],         1],
  ['poss',  v => v.poss[1],           3],
  ['linea', v => v.linea[1],          3],
  ['morso', v => v.morso,             0],
];

async function gira(browser, porta, partite, seme, taglia, diff, etichetta) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => p() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = p(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, seme);
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'ok') throw new Error('la sonda non si e\' installata: ' + inst);

  const squadre = await pag.evaluate(() => TOUR_POOL.map(o => ({ n: o.n, c1: o.c1, c2: o.c2, pat: o.pat, forza: o.forza, stile: o.stile })));
  const out = [];
  for (const sq of squadre) {
    const righe = [];
    for (let i = 0; i < partite; i++) {
      const r = await pag.evaluate(([seme, diff, taglia, sq]) => {
        const t = window.__test;
        window.__caso.semina(seme);
        window.__car.azzera();
        t.startMatch(1, diff, { size: taglia, opp: sq });
        t.setCpuVsCpu(true);
        let sim = 0;
        while (t.state !== 'end' && sim < 900) { t.simulate(10); sim += 10; }
        return window.__car.leggi();
      }, [(seme + i) >>> 0, diff, taglia, sq]);
      righe.push(r);
    }
    out.push({ nome: sq.n, forza: sq.forza, stile: sq.stile, righe });
    console.log(`  --    ${etichetta}: ${sq.n} fatta`);
  }
  await ctx.close();
  return { squadre: out, errori };
}

function stampa(dati, etichetta) {
  console.log('');
  console.log('=== ' + etichetta + ' ===');
  const cap = '  ' + 'squadra'.padEnd(15) + 'fz  ' + VOCI.map(v => v[0].padStart(7)).join('');
  console.log(cap);
  console.log('  ' + '-'.repeat(cap.length - 2));
  const colonne = VOCI.map(() => []);
  const rumore = VOCI.map(() => []);
  for (const s of dati.squadre) {
    const cel = VOCI.map(([, f, d], k) => {
      const vals = s.righe.map(f);
      colonne[k].push(media(vals));
      rumore[k].push(sigma(vals));
      return media(vals).toFixed(d).padStart(7);
    });
    console.log('  ' + s.nome.padEnd(15) + String(s.forza).padEnd(4) + cel.join(''));
  }
  console.log('  ' + '-'.repeat(cap.length - 2));
  console.log('  ' + 'SCARTO max-min'.padEnd(19) + VOCI.map(([, , d], k) =>
    (Math.max(...colonne[k]) - Math.min(...colonne[k])).toFixed(d).padStart(7)).join(''));
  console.log('  ' + 'rumore (sigma)'.padEnd(19) + VOCI.map(([, , d], k) =>
    media(rumore[k]).toFixed(d).padStart(7)).join(''));
  const sep = VOCI.map((v, k) => {
    const r = media(rumore[k]);
    return r > 1e-9 ? (Math.max(...colonne[k]) - Math.min(...colonne[k])) / r : 0;
  });
  console.log('  ' + 'SEPARAZIONE'.padEnd(19) + sep.map(x => x.toFixed(2).padStart(7)).join(''));
  console.log('');
  /* =====================================================================
     I GEMELLI — ed e' la riga che vale tutto lo strumento.
     Due squadre sono GEMELLE se, sugli stessi semi, ogni partita esce
     identica al bit: stessi tiri, stessi gol, stesso tutto. Se succede,
     quelle due squadre NON SONO due squadre: sono un nome e un colore
     sopra la stessa macchina. Nessuna media puo' nasconderlo e nessun
     rumore puo' spiegarlo.
     ===================================================================== */
  const firma = s => JSON.stringify(s.righe.map(r => VOCI.map(([, f]) => f(r))));
  const gem = [];
  for (let i = 0; i < dati.squadre.length; i++)
    for (let j = i + 1; j < dati.squadre.length; j++)
      if (firma(dati.squadre[i]) === firma(dati.squadre[j]))
        gem.push(dati.squadre[i].nome + ' = ' + dati.squadre[j].nome +
          '  (forza ' + dati.squadre[i].forza + ' e ' + dati.squadre[j].forza + ')');
  console.log('  GEMELLI (partite identiche al bit sugli stessi semi): ' + gem.length + ' coppie su 45');
  for (const g of gem) console.log('    · ' + g);
  console.log('');
  console.log('  La SEPARAZIONE e\' lo scarto fra la squadra piu\' alta e la piu\' bassa');
  console.log('  diviso il rumore fra partite della stessa squadra. Sotto 1 le dieci');
  console.log('  squadre sono indistinguibili; sopra 2 si vedono a occhio nudo.');
  console.log('  Media della separazione sulle nove voci: ' + (sep.reduce((a, b) => a + b, 0) / sep.length).toFixed(2));
  return { sep, gemelli: gem.length };
}

(async () => {
  const partite = parseInt(arg('partite', '12'), 10);
  const taglia = parseInt(arg('taglia', '5'), 10);
  const diff = parseInt(arg('diff', '1'), 10);
  const seme = parseInt(arg('seme', '20260803'), 10);
  const etichetta = arg('etichetta', 'ORA');
  const gioco = arg('gioco', process.env.GIOCO_PROVA || '');
  const prova = gioco ? path.resolve(RADICE, gioco) : null;
  if (prova && !fs.existsSync(prova)) { console.error('non esiste ' + prova); process.exit(1); }

  const srv = await servi(prova);
  const browser = await chromium.launch();
  let dati;
  try {
    dati = await gira(browser, srv.porta, partite, seme, taglia, diff, etichetta);
  } finally { await browser.close(); srv.chiudi(); }
  if (dati.errori.length) { console.error('ERRORI DI PAGINA:'); for (const e of dati.errori) console.error('  ' + e); }

  console.log('');
  console.log(`  gioco: ${prova || 'CALCETTO-il-gioco.html'}`);
  console.log(`  ${partite} partite per squadra, taglia ${taglia}, difficolta' ${diff}, semi ${seme}..${seme + partite - 1}`);
  const esito = stampa(dati, etichetta);
  const sep = esito.sep;

  const jf = arg('json', '');
  if (jf) { fs.mkdirSync(path.dirname(path.resolve(RADICE, jf)), { recursive: true }); fs.writeFileSync(path.resolve(RADICE, jf), JSON.stringify({ partite, taglia, diff, seme, dati, sep, gemelli: esito.gemelli }, null, 1)); console.log('  scritto ' + jf); }

  const cf = arg('contro', '');
  if (cf) {
    const p = JSON.parse(fs.readFileSync(path.resolve(RADICE, cf), 'utf8'));
    console.log('');
    console.log('=== DELTA contro ' + cf + ' ===');
    console.log('  ' + 'voce'.padEnd(10) + 'PRIMA'.padStart(9) + 'DOPO'.padStart(9));
    for (let k = 0; k < VOCI.length; k++) {
      console.log('  ' + ('sep ' + VOCI[k][0]).padEnd(10) + p.sep[k].toFixed(2).padStart(9) + sep[k].toFixed(2).padStart(9));
    }
    console.log('  ' + 'GEMELLI'.padEnd(10) + String(p.gemelli).padStart(9) + String(esito.gemelli).padStart(9));
  }
  if (dati.errori.length) process.exit(1);
})();
