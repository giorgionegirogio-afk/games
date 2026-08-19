/* =====================================================================
   _q-cross.js — I CROSS E LE ROVESCIATE, contati in partita vera.

   PERCHE' ESISTE. strumenti/_eventi.js misura la partita ma non guarda
   ne' G.stats.cross ne' G.stats.rovesciate: sono le due voci del
   tabellino che nessuno strumento ha mai letto, ed e' per questo che
   «la CPU non crossa mai» e' rimasto invisibile per cinque onde.
   Questo strumento le legge, e legge anche le tre cose che spiegano il
   numero quando e' zero:
     - quante volte si APRE la finestra della rovesciata
       (finestraRovesciata torna true: senza finestra non c'e' dado che
       tenga, e il conto dei tentativi non dice niente);
     - quanti cross vengono RACCOLTI, e da chi;
     - quanti cross sono seguiti da una conclusione entro due secondi.

   COME NON MENTE.
     1. Math.random e' sostituito con xorshift32 a seme fisso prima che
        la pagina esegua una riga, e ri-seminato a ogni partita: stesso
        impianto di _eventi.js, equita.js e scatta.js.
     2. La sonda NON pesca numeri casuali. Avvolge quattro funzioni
        globali (step, doCross, tentaRovesciata, finestraRovesciata) e
        legge G.stats: la partita misurata e' la partita non misurata.
     3. AUTODIAGNOSI: alla fine rigioca le prime partite su una pagina
        NUOVA con gli stessi semi e confronta il vettore voce per voce.
        Se una sola differisce lo strumento lo DICE ed esce con 1.
     4. I MOMENTI DA PORTA si ricalcolano qui con la stessa definizione
        di _eventi.js (gol regolamentari + parate + legni, al minuto di
        gioco vivo). Sono la ridondanza volontaria: se i due strumenti
        non danno lo stesso numero sulla stessa versione e sugli stessi
        semi, uno dei due e' rotto e si vede subito.

   uso:
     node strumenti/_q-cross.js
     node strumenti/_q-cross.js --gioco /fuori/prova.html --etichetta DOPO
     node strumenti/_q-cross.js --partite 24 --seme 20260803 --taglia 11
     node strumenti/_q-cross.js --json fuori/dopo.json
     node strumenti/_q-cross.js --contro fuori/prima.json
     node strumenti/_q-cross.js --no-diagnosi
   La variabile d'ambiente GIOCO_PROVA vale come --gioco.
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
  if (window.__qc) return 'gia-installata';
  const S = {};
  const azzera = () => {
    S.frames=0; S.crossFatti=0; S.roveTent=0; S.roveFin=0; S.roveFinApri=0;
    S._finPrima=false;
    S.banner={};
    S.crossRaccAmico=0; S.crossRaccAvv=0; S.crossRaccGK=0; S.crossPerso=0;
    S.crossConcl=0;
    S.crossDgAtt=[]; S.crossInArea=0;
    S._pend=[];
    S.zMax=0;
    S.golRegol=null; S.golden=false;
  };
  azzera();

  const _step = window.step;
  const _doCross = window.doCross;
  const _tenta = window.tentaRovesciata;
  const _finestra = window.finestraRovesciata;
  const _showBanner = window.showBanner;
  const _fireShot = window.fireShot;

  window.showBanner = function(t){ S.banner[t]=(S.banner[t]||0)+1; return _showBanner.apply(this, arguments); };

  window.doCross = function(p,nx,ny){
    const c0=(G.stats.cross[0]|0)+(G.stats.cross[1]|0);
    const r=_doCross.apply(this, arguments);
    const c1=(G.stats.cross[0]|0)+(G.stats.cross[1]|0);
    /* si conta il cross PARTITO (doCross puo' fallire su kickBall), e lo
       dice il tabellino del gioco, non la chiamata */
    if(c1>c0){ S.crossFatti++; S._pend.push({t:0, team:p.team, tiro:false, giu:false}); }
    return r;
  };

  window.tentaRovesciata = function(p){ S.roveTent++; return _tenta.apply(this, arguments); };

  /* la FINESTRA: quante volte si apre. Si conta il FRONTE (chiusa ->
     aperta su un qualunque giocatore) e non il fotogramma, perche' una
     finestra che resta aperta dieci fotogrammi e' una occasione sola. */
  window.finestraRovesciata = function(p){
    const v = _finestra.apply(this, arguments);
    if(v) S.roveFin++;
    return v;
  };

  window.fireShot = function(p,nx,ny,q,lob){
    for(const c of S._pend) if(c.team===p.team && !c.tiro){ c.tiro=true; S.crossConcl++; }
    return _fireShot.apply(this, arguments);
  };

  window.step = function(){
    const aperta0=S.roveFin;
    _step.apply(this, arguments);
    /* il punteggio REGOLAMENTARE, con la stessa regola di _eventi.js:
       si congela quando comincia il golden goal, cosi' i rigori non
       entrano nei momenti da porta */
    if(G.golden && !S.golden){ S.golden=true; S.golRegol=[G.score[0],G.score[1]]; }
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    const b=G.ball;
    if(b.z>S.zMax) S.zMax=b.z;
    /* un FRONTE di finestra: prima nessuna, adesso almeno una */
    const oraAperta = S.roveFin>aperta0;
    if(oraAperta && !S._finPrima) S.roveFinApri++;
    S._finPrima = oraAperta;
    /* esito dei cross in volo */
    if(S._pend.length){
      const vivi=[];
      for(const c of S._pend){
        c.t++;
        /* DOVE CADE IL CROSS: la distanza dalla porta nell'istante in cui
           il pallone torna a terra. Serve alla rovesciata: la sua
           finestra vuole il punto di caduta DENTRO la scatola del
           portiere (|lx-gx| <= GK_AREA_X). */
        if(!c.giu && b.z<=0){
          c.giu=true;
          const gx=c.team===0?FW:0;
          const dg=Math.abs(gx-b.x);
          S.crossDgAtt.push(Math.round(dg));
          if(dg<=GK_AREA_X && Math.abs(b.y-FH/2)<=GOAL_H*0.77) S.crossInArea++;
        }
        if(b.owner>=0){
          const q=G.players[b.owner];
          if(q.team===c.team) S.crossRaccAmico++;
          else if(q.role==='gk') S.crossRaccGK++;
          else S.crossRaccAvv++;
          continue;
        }
        if(c.t>150){ S.crossPerso++; continue; }
        vivi.push(c);
      }
      S._pend=vivi;
    }
  };

  window.__qc = {
    azzera,
    leggi(){
      const bn = n => S.banner[n]||0;
      const st = G.stats;
      const due = a => ((a&&a[0])|0) + ((a&&a[1])|0);
      return {
        cross: due(st.cross),
        rovesciate: due(st.rovesciate),
        roveTent: S.roveTent,
        roveFinestre: S.roveFinApri,
        crossRaccAmico: S.crossRaccAmico,
        crossRaccAvv: S.crossRaccAvv,
        crossRaccGK: S.crossRaccGK,
        crossPerso: S.crossPerso,
        crossConcl: S.crossConcl,
        crossInArea: S.crossInArea,
        crossDgMed: S.crossDgAtt.length ? S.crossDgAtt.slice().sort((a,b2)=>a-b2)[S.crossDgAtt.length>>1] : -1,
        zMax: Math.round(S.zMax*10)/10,
        gol: S.golRegol ? ((S.golRegol[0]|0)+(S.golRegol[1]|0)) : due(G.score),
        golTot: due(G.score),
        tiri: due(st.tiri),
        parate: due(st.parate),
        filtranti: due(st.filtranti),
        pali: bn('PALO!'), traverse: bn('TRAVERSA!'),
        frames: S.frames
      };
    }
  };
  return 'ok';
})()`;

const mediana = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const media = a => a.reduce((s, x) => s + x, 0) / a.length;

const DT = 1 / 60;
function derivati(p) {
  const legni = p.pali + p.traverse;
  const minuti = Math.max(0.001, p.frames * DT / 60);
  const momenti = p.gol + p.parate + legni;
  return {
    cross: p.cross, rovesciate: p.rovesciate, roveTent: p.roveTent, roveFinestre: p.roveFinestre,
    crossRaccAmico: p.crossRaccAmico, crossRaccAvv: p.crossRaccAvv,
    crossRaccGK: p.crossRaccGK, crossPerso: p.crossPerso, crossConcl: p.crossConcl,
    crossInArea: p.crossInArea, crossDgMed: p.crossDgMed,
    zMax: p.zMax,
    conCross: p.cross > 0 ? 1 : 0,
    tiri: p.tiri, parate: p.parate, legni, gol: p.gol, filtranti: p.filtranti,
    durata: p.frames * DT,
    momenti, momentiMin: momenti / minuti
  };
}

const VOCI = [
  ['CROSS', 'cross', 2],
  ['  partite con >=1 cross', 'conCross', 2],
  ['  raccolti da un compagno', 'crossRaccAmico', 2],
  ['  raccolti da un avversario', 'crossRaccAvv', 2],
  ['  presi dal portiere', 'crossRaccGK', 2],
  ['  persi (fuori/nessuno)', 'crossPerso', 2],
  ['  seguiti da un tiro', 'crossConcl', 2],
  ['  caduti DENTRO l\'area', 'crossInArea', 2],
  ['  dg del punto di caduta', 'crossDgMed', 0],
  ['ROVESCIATE riuscite', 'rovesciate', 2],
  ['  tentate', 'roveTent', 2],
  ['  finestre aperte', 'roveFinestre', 2],
  ['quota massima palla', 'zMax', 1],
  ['filtranti', 'filtranti', 2],
  ['tiri', 'tiri', 1],
  ['parate', 'parate', 1],
  ['legni', 'legni', 2],
  ['gol', 'gol', 2],
  ['durata gioco vivo (s)', 'durata', 1],
  ['MOMENTI DA PORTA', 'momenti', 1],
  ['MOMENTI DA PORTA AL MINUTO', 'momentiMin', 2]
];

function stampa(nome, righe) {
  const d = righe.map(derivati);
  console.log(`\n=== ${nome} — ${d.length} partite ===`);
  console.log('  ' + 'voce'.padEnd(30) + 'mediana' + '     media' + '      min' + '      max' + '     somma');
  for (const [et, k, dec] of VOCI) {
    const v = d.map(x => x[k]);
    const f = (x, n) => x.toFixed(n === undefined ? 1 : n).padStart(8);
    console.log('  ' + et.padEnd(30) + f(mediana(v), dec) + f(media(v), 2) + f(Math.min(...v), dec) + f(Math.max(...v), dec) + f(v.reduce((s, x) => s + x, 0), 1));
  }
  return d;
}

function confronta(prima, dopo) {
  console.log(`\n=== DELTA (medie) ===`);
  console.log('  ' + 'voce'.padEnd(30) + '  prima     dopo    delta');
  for (const [et, k] of VOCI) {
    const a = media(prima.map(x => x[k])), b = media(dopo.map(x => x[k]));
    const seg = b - a >= 0 ? '+' : '';
    console.log('  ' + et.padEnd(30) + a.toFixed(2).padStart(7) + b.toFixed(2).padStart(9) + (seg + (b - a).toFixed(2)).padStart(9) +
      (a ? ('   ' + seg + ((b - a) / a * 100).toFixed(0) + '%') : ''));
  }
}

async function gioca(browser, porta, partite, semeBase, diff, etichetta, taglia) {
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
  const inizio = Date.now();
  for (let i = 0; i < partite; i++) {
    const r = await pag.evaluate(([seme, diff, taglia]) => {
      const t = window.__test;
      window.__caso.semina(seme);
      window.__qc.azzera();
      t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      let sim = 0;
      while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
      const e = window.__qc.leggi();
      e.scena = t.state;
      return e;
    }, [(semeBase + i) >>> 0, diff, taglia]);
    out.push(r);
    if (partite >= 20 && (i + 1) % 10 === 0) console.log(`  --    ${etichetta}: ${i + 1}/${partite} partite`);
  }
  const ms = Date.now() - inizio;
  await ctx.close();
  return { partite: out, ms, errori };
}

{
  const i = process.argv.indexOf('--confronta');
  if (i > 0 && process.argv[i + 1] && process.argv[i + 2]) {
    const A = JSON.parse(fs.readFileSync(path.resolve(process.argv[i + 1]), 'utf8'));
    const B = JSON.parse(fs.readFileSync(path.resolve(process.argv[i + 2]), 'utf8'));
    stampa(A.etichetta, A.crudo); stampa(B.etichetta, B.crudo);
    confronta(A.crudo.map(derivati), B.crudo.map(derivati));
    process.exit(0);
  }
}

(async () => {
  const partite = Math.max(1, +arg('partite', 24) | 0);
  const semeBase = +arg('seme', 20260803);
  const diff = Math.max(0, Math.min(2, +arg('diff', 1) | 0));
  const taglia = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
  const etichetta = arg('etichetta', 'FOTOGRAFIA');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const fileJson = arg('json', '');
  const contro = arg('contro', '');
  const diagnosi = !haFlag('no-diagnosi');

  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco di prova inesistente: ' + provaAbs); process.exit(1); }

  const srv = await servi(provaAbs);
  const browser = await chromium.launch();

  console.log(`\n=== CROSS E ROVESCIATE — ${partite} partite CPU contro CPU, semi ${semeBase}..${semeBase + partite - 1}, difficolta' ${['Facile', 'Normale', 'Duro'][diff]}, ${taglia} contro ${taglia} ===`);
  console.log('  --    gioco: ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));

  const A = await gioca(browser, srv.porta, partite, semeBase, diff, etichetta, taglia);
  console.log(`  --    ${(A.ms / 1000).toFixed(1)} s in tutto = ${(A.ms / partite / 1000).toFixed(2)} s a partita`);
  const nonFinite = A.partite.filter(p => p.scena !== 'end');
  if (nonFinite.length) console.log(`  NO    ${nonFinite.length} partite non arrivano al fischio finale`);
  if (A.errori.length) console.log(`  NO    eccezioni: ${A.errori[0]}`);

  const d = stampa(etichetta, A.partite);

  let diagOK = true;
  if (diagnosi) {
    const n = Math.min(3, partite);
    const B = await gioca(browser, srv.porta, n, semeBase, diff, 'diagnosi', taglia);
    const chiavi = ['cross', 'rovesciate', 'roveTent', 'roveFinestre', 'tiri', 'parate', 'legni', 'gol', 'momenti'];
    const dB = B.partite.map(derivati);
    const guai = [];
    for (let i = 0; i < n; i++) for (const k of chiavi) if (d[i][k] !== dB[i][k]) guai.push(`partita ${i} voce ${k}: ${d[i][k]} contro ${dB[i][k]}`);
    diagOK = guai.length === 0;
    console.log(`\n  ${diagOK ? 'OK  ' : 'NO  '} autodiagnosi: ${n} partite rigiocate su pagina nuova danno lo stesso vettore`);
    if (!diagOK) console.log('        ' + guai.slice(0, 5).join('\n        ') +
      '\n        la misura non e\' riproducibile: lo strumento e\' cieco e non va creduto');
  }

  await browser.close(); srv.chiudi();

  if (fileJson) {
    fs.writeFileSync(path.resolve(fileJson), JSON.stringify({ etichetta, partite, semeBase, diff, taglia, gioco: provaAbs || 'repo', crudo: A.partite }, null, 1));
    console.log(`\n  --    crudo salvato in ${fileJson}`);
  }
  if (contro) {
    const prima = JSON.parse(fs.readFileSync(path.resolve(contro), 'utf8'));
    console.log(`\n  --    confronto con ${prima.etichetta} (${prima.partite} partite, seme ${prima.semeBase}, taglia ${prima.taglia})`);
    confronta(prima.crudo.map(derivati), d);
  }

  if (!diagOK || nonFinite.length || A.errori.length) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
