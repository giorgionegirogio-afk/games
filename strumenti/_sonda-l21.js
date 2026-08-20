/* =====================================================================
   _sonda-l21.js — QUANTO SI ALLONTANA IL PALLONE DAL PIEDE, E QUANTO
   COSTA CORRERE A TUTTA (voce L2.1).

   Tre scene, una per domanda:

   --scena dist     La distanza VERA pallone-piede in funzione della
                    velocita' del portatore, misurata sul mondo (mai su
                    una bandiera): fermo / corsa (levetta piena, niente
                    sprint) / sprint. Gli avversari sono parcheggiati
                    lontano a ogni fotogramma, cosi' la misura e' pura
                    geometria del dribbling.

   --scena duello   Un portatore umano (tastiera sintetica) corre contro
                    UN difensore CPU piazzato di fronte. Si classifica il
                    PRIMO contatto: furto (b.owner passa al difensore),
                    fallito (il kickCd del difensore salta a 0,45 e il
                    possesso resta), scivolata (esclusa: altra meccanica),
                    scappato (nessun contatto). E' l'EFFETTO della
                    probabilita' stealP letto dal mondo: a Duro
                    DIFF[2].steal=1,00 e il primo contatto frontale deve
                    rubare il 100% delle volte — se non e' cosi', il
                    banco e' rotto, non il gioco.
                    Con --passo trotto il portatore NON sprinta: il
                    confronto sprint/trotto e' la misura (b) della voce.

   --scena partite  Partite vere CPU contro CPU, griglia difficolta' x
                    taglia: furti col corpo per partita (passaggi di
                    b.owner A->B diretti fra squadre opposte, scivolata
                    esclusa), possesso (% fotogrammi con padrone, durata
                    mediana del possesso individuale), palla di nessuno,
                    gol e 0-0. Sono le misure (a) e (c) della voce, piu'
                    il controllo sull'11 contro 11.

   uso:
     node strumenti/_sonda-l21.js --scena dist
     node strumenti/_sonda-l21.js --scena duello --diff 2 --prove 60
     node strumenti/_sonda-l21.js --scena duello --diff 2 --passo trotto
     node strumenti/_sonda-l21.js --scena partite --partite 6
     node strumenti/_sonda-l21.js --gioco fuori/l21.html --scena dist
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
const mediana = a => { if (!a.length) return 0; const b = a.slice().sort((x, y) => x - y); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };

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

async function apri(provaAbs, seme) {
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const prossimo = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => prossimo() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = prossimo(); return a; };
    window.__caso = { semina(n) { s = n >>> 0 || 1; } };
  }, seme);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(150);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { pag, chiudi: async () => { await ctx.close(); await browser.close(); srv.chiudi(); }, errori };
}

/* ------------------------------------------------------------ SCENA dist
   Nel gioco il pallone insegue un bersaglio davanti ai piedi con
   b.vx=(tx-b.x)*k: a regime resta INDIETRO di v/k rispetto al bersaglio.
   Percio' la distanza vera si misura, non si legge da CARRY_DIST. */
const SCENA_DIST = ([seme, diff]) => {
  const t = window.__test;
  window.__caso.semina(seme);
  t.startMatch(1, diff);
  t.setCpuVsCpu(true);
  let attesa = 0;                      // la CPU batte il calcio d'inizio
  while (G.scene !== 'play' && attesa < 20) { t.simulate(1); attesa++; }
  t.setCpuVsCpu(false);
  const b = G.ball;
  const pi = G.players.findIndex(q => q.team === 0 && q.role !== 'gk');
  const p = G.players[pi];
  G.ctrl[0] = pi;
  const parcheggia = () => {
    for (const q of G.players) {
      if (q === p) continue;
      q.x = q.team === 1 ? FW - 40 : 40;
      q.y = 40; q.vx = 0; q.vy = 0; q.kickCd = 1; q.slide = -1; q.recover = 0;
    }
  };
  const passata = (conKeys, conSprint) => {
    Keys['KeyD'] = conKeys; Keys['ShiftLeft'] = conSprint;
    G.timeLeft = 60;                   // l'orologio non deve scadere sul banco
    /* riparti da fermo, palla ai piedi */
    p.x = 150; p.y = FH / 2; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
    p.fiato = 100; p.kickCd = 0; p.charge = -1; p.slide = -1; p.recover = 0;
    b.x = p.x + 16; b.y = p.y; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0; b.owner = pi;
    const dCamp = [], vCamp = [];
    for (let f = 0; f < 210; f++) {
      parcheggia();
      step();
      if (b.owner !== pi) return { rotto: 'possesso perso al fotogramma ' + f };
      if (f >= 90) {                    // regime raggiunto (accelerazione ~0,25 s)
        dCamp.push(len(b.x - p.x, b.y - p.y));
        vCamp.push(len(p.vx, p.vy));
      }
    }
    Keys['KeyD'] = false; Keys['ShiftLeft'] = false;
    dCamp.sort((a, c) => a - c); vCamp.sort((a, c) => a - c);
    const m = a => a[(a.length / 2) | 0];
    return { d: m(dCamp), v: m(vCamp), dMin: dCamp[0], dMax: dCamp[dCamp.length - 1] };
  };
  const fermo = passata(false, false);
  const corsa = passata(true, false);
  const sprint = passata(true, true);
  return { fermo, corsa, sprint };
};

/* ---------------------------------------------------------- SCENA duello */
const SCENA_DUELLO = ([seme, diff, prove, trotto, lato]) => {
  const t = window.__test;
  window.__caso.semina(seme);
  t.startMatch(1, diff);
  t.setCpuVsCpu(true);
  let attesa = 0;
  while (G.scene !== 'play' && attesa < 20) { t.simulate(1); attesa++; }
  t.setCpuVsCpu(false);
  const b = G.ball;
  const pi = G.players.findIndex(q => q.team === 0 && q.role !== 'gk');
  const p = G.players[pi];
  G.ctrl[0] = pi;
  const dif = G.players.find(q => q.team === 1 && q.role !== 'gk');
  const R = { furto: 0, fallito: 0, scivolata: 0, scappato: 0, altro: 0, fotogrammiAlContatto: [] };
  const parcheggia = () => {
    for (const q of G.players) {
      if (q === p || q === dif) continue;
      q.x = q.team === 1 ? FW - 40 : 40;
      q.y = 40; q.vx = 0; q.vy = 0; q.kickCd = 1; q.slide = -1; q.recover = 0;
    }
  };
  for (let i = 0; i < prove; i++) {
    window.__caso.semina(seme + 1000 + i);
    Keys['KeyD'] = true; Keys['ShiftLeft'] = !trotto;
    G.timeLeft = 60;                   // l'orologio non deve scadere sul banco
    p.x = FW * 0.22; p.y = FH / 2; p.vx = 0; p.vy = 0; p.fx = 1; p.fy = 0;
    p.fiato = 100; p.kickCd = 0; p.charge = -1; p.slide = -1; p.recover = 0; p.out = 0;
    dif.x = p.x + 130; dif.y = FH / 2 - (lato || 0); dif.vx = 0; dif.vy = 0; dif.fx = -1; dif.fy = 0;
    dif.fiato = 100; dif.kickCd = 0; dif.charge = -1; dif.slide = -1; dif.recover = 0; dif.out = 0;
    b.x = p.x + 16; b.y = p.y; b.vx = 0; b.vy = 0; b.z = 0; b.vz = 0; b.owner = pi;
    let esito = 'scappato';
    for (let f = 0; f < 300; f++) {
      parcheggia();
      const kdPrima = dif.kickCd;
      step();
      if (dif.slide >= 0) { esito = 'scivolata'; break; }
      if (b.owner !== pi) {
        esito = (G.players[b.owner] === dif) ? 'furto' : 'altro';
        R.fotogrammiAlContatto.push(f);
        break;
      }
      if (kdPrima <= 0 && dif.kickCd > 0.40) {      // tentativo fallito: kickCd=0,45
        esito = 'fallito';
        R.fotogrammiAlContatto.push(f);
        break;
      }
      if (p.x > FW * 0.72) break;
    }
    R[esito]++;
  }
  Keys['KeyD'] = false; Keys['ShiftLeft'] = false;
  return R;
};

/* --------------------------------------------------------- SCENA partite */
const SONDA_PARTITE = `(() => {
  if (window.__l21) return 'gia';
  const S = {};
  const azzera = () => {
    S.frames=0; S.conPadrone=0;
    S.furtiCorpo=[0,0];        // b.owner A->B diretto fra squadre opposte, senza scivolata del ladro
    S.perseNonPassaggio=0;     // A -> -1 con passTo<0 (contrasti, spazzate, rimpalli)
    S.spellPossesso=[];        // durata in fotogrammi di ogni possesso individuale
    S.spellCorrente=0;
    S.vPortatore=[];           // velocita' del portatore campionata 1 volta su 6
    S.fischio=null;            // punteggio quando l'orologio tocca zero (prima del golden gol)
    /* misura (b): il portatore lento/di corsa/a tutta quanto spesso subisce
       un furto col corpo, NORMALIZZATO sul tempo passato in quella fascia.
       Fasce di velocita': <120 (lento: sotto non c'e' spinta), 120-190
       (corsa), >190 (a tutta: solo lo sprint ci arriva). */
    S.fasceFrames=[0,0,0];
    S.furtiFascia=[0,0,0];
    S.vUltimo=0;
  };
  const fascia = v => v<120?0 : v<=190?1 : 2;
  azzera();
  const _step = window.step;
  window.step = function(){
    const b=G.ball;
    const prima = b ? b.owner : -1;
    _step.apply(this, arguments);
    if(!S.fischio && G.timeLeft<=0) S.fischio=[G.score[0],G.score[1]];
    if(!(G.scene==='play'||G.scene==='golden')) return;
    S.frames++;
    if(b.owner>=0){
      S.conPadrone++;
      const o=G.players[b.owner];
      const v=len(o.vx,o.vy);
      S.fasceFrames[fascia(v)]++;
      if(b.owner===prima) S.vUltimo=v;   // la velocita' PRIMA del furto, non dopo
      if(S.frames%6===0) S.vPortatore.push(Math.round(v));
    }
    if(b.owner!==prima){
      if(prima>=0 && S.spellCorrente>0){ S.spellPossesso.push(S.spellCorrente); S.spellCorrente=0; }
      if(prima>=0 && b.owner>=0){
        const A=G.players[prima], B=G.players[b.owner];
        if(A && B && A.team!==B.team && B.slide<0){ S.furtiCorpo[B.team]++; S.furtiFascia[fascia(S.vUltimo)]++; }
      }
      if(prima>=0 && b.owner<0 && b.passTo<0) S.perseNonPassaggio++;
    }
    if(b.owner>=0) S.spellCorrente++;
  };
  window.__l21 = { azzera, leggi(){ if(S.spellCorrente>0){S.spellPossesso.push(S.spellCorrente);S.spellCorrente=0;} return JSON.parse(JSON.stringify(S)); } };
  return 'ok';
})()`;

(async () => {
  const scena = arg('scena', 'dist');
  const prova = arg('gioco', process.env.GIOCO_PROVA || '');
  const provaAbs = prova ? path.resolve(prova) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco inesistente: ' + provaAbs); process.exit(1); }
  const semeBase = +arg('seme', 20260820);
  const etichettaGioco = provaAbs || 'CALCETTO-il-gioco.html (repo)';

  if (scena === 'dist') {
    const { pag, chiudi, errori } = await apri(provaAbs, semeBase);
    const r = await pag.evaluate(SCENA_DIST, [semeBase, 1]);
    await chiudi();
    console.log(`\n=== DIST — pallone-piede in funzione della velocita' ===`);
    console.log('  gioco: ' + etichettaGioco);
    for (const k of ['fermo', 'corsa', 'sprint']) {
      const x = r[k];
      if (x.rotto) { console.log(`  ${k.padEnd(8)} ROTTO: ${x.rotto}`); continue; }
      console.log(`  ${k.padEnd(8)} v mediana ${x.v.toFixed(1).padStart(6)} u/s   distanza mediana ${x.d.toFixed(2).padStart(6)} u   (min ${x.dMin.toFixed(1)}  max ${x.dMax.toFixed(1)})`);
    }
    if (r.corsa.d !== undefined && r.sprint.d !== undefined)
      console.log(`  sprint - corsa = ${(r.sprint.d - r.corsa.d).toFixed(2)} u`);
    if (errori.length) console.log('  NO  ' + errori[0]);
    return;
  }

  if (scena === 'duello') {
    const diff = Math.max(0, Math.min(2, +arg('diff', 2) | 0));
    const prove = Math.max(1, +arg('prove', 60) | 0);
    const trotto = arg('passo', 'sprint') === 'trotto';
    const lato = +arg('lato', 0) || 0;
    const { pag, chiudi, errori } = await apri(provaAbs, semeBase);
    const r = await pag.evaluate(SCENA_DUELLO, [semeBase, diff, prove, trotto, lato]);
    await chiudi();
    const contatti = r.furto + r.fallito;
    console.log(`\n=== DUELLO — diff ${diff}, passo ${trotto ? 'trotto' : 'sprint'}${lato ? ', difensore fuori asse di ' + lato + ' u' : ''}, ${prove} prove ===`);
    console.log('  gioco: ' + etichettaGioco);
    console.log(`  furti al primo contatto     ${r.furto}`);
    console.log(`  tentativi falliti           ${r.fallito}`);
    console.log(`  scivolate (escluse)         ${r.scivolata}`);
    console.log(`  scappato senza contatto     ${r.scappato}`);
    console.log(`  altro (palla ad altri)      ${r.altro}`);
    if (contatti) console.log(`  QUOTA FURTO al 1o contatto  ${r.furto}/${contatti} = ${(r.furto / contatti * 100).toFixed(1)}%`);
    if (r.fotogrammiAlContatto.length) console.log(`  fotogramma mediano del contatto: ${mediana(r.fotogrammiAlContatto)}`);
    if (errori.length) console.log('  NO  ' + errori[0]);
    return;
  }

  if (scena === 'partite') {
    const nPart = Math.max(1, +arg('partite', 6) | 0);
    const taglie = (arg('taglie', '5,7,11')).split(',').map(Number);
    const diffs = (arg('diffs', '0,1,2')).split(',').map(Number);
    const { pag, chiudi, errori } = await apri(provaAbs, semeBase);
    const inst = await pag.evaluate(SONDA_PARTITE);
    if (inst !== 'ok') throw new Error('sonda non installata: ' + inst);
    console.log(`\n=== PARTITE CPU-CPU — ${nPart} per cella, semi ${semeBase}.. ===`);
    console.log('  gioco: ' + etichettaGioco);
    console.log('  NB: in CPU-CPU stealP e\' sempre 0,42 (il ramo DIFF.steal vale solo su portatore umano):');
    console.log('      qui la difficolta\' sposta contatti e pressing, non la probabilita\'.');
    console.log('\n  diff taglia | furti-corpo/part  perse-nonpass  possesso%  vaganti%  spell-med(s)  v-port-med  gol-tot  0-0');
    for (const diff of diffs) {
      for (const taglia of taglie) {
        const righe = [];
        for (let i = 0; i < nPart; i++) {
          const r = await pag.evaluate(async ([seme, diff, taglia]) => {
            const t = window.__test;
            window.__caso.semina(seme);
            window.__l21.azzera();
            t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined);
            t.setCpuVsCpu(true);
            let sim = 0;
            while (t.state !== 'end' && sim < 600) { t.simulate(10); sim += 10; }
            const e = window.__l21.leggi();
            e.score = [G.score[0], G.score[1]];
            return e;
          }, [(semeBase + i) >>> 0, diff, taglia]);
          righe.push(r);
        }
        const furti = righe.map(r => r.furtiCorpo[0] + r.furtiCorpo[1]);
        const perse = righe.map(r => r.perseNonPassaggio);
        const poss = righe.map(r => r.conPadrone / Math.max(1, r.frames) * 100);
        const vag = righe.map(r => 100 - r.conPadrone / Math.max(1, r.frames) * 100);
        const spell = righe.map(r => mediana(r.spellPossesso) / 60);
        const vport = righe.map(r => mediana(r.vPortatore));
        const golTot = righe.reduce((s, r) => s + r.score[0] + r.score[1], 0);
        const zz = righe.filter(r => r.fischio && r.fischio[0] === 0 && r.fischio[1] === 0).length;
        console.log(`   ${diff}    ${String(taglia).padStart(2)}   |      ${mediana(furti).toFixed(1).padStart(5)}          ${mediana(perse).toFixed(1).padStart(5)}       ${mediana(poss).toFixed(1).padStart(5)}     ${mediana(vag).toFixed(1).padStart(5)}      ${mediana(spell).toFixed(2).padStart(5)}       ${mediana(vport).toFixed(0).padStart(4)}      ${String(golTot).padStart(3)}    ${zz}/${nPart}`);
        /* misura (b): furti col corpo AL MINUTO di possesso, per fascia di
           velocita' del portatore al momento del furto (somma sulle N partite) */
        const fF=[0,0,0], fT=[0,0,0];
        for(const r of righe){ for(let k=0;k<3;k++){ fF[k]+=r.furtiFascia[k]; fT[k]+=r.fasceFrames[k]; } }
        const ratei = fF.map((n,k)=> fT[k]>0 ? (n/(fT[k]/3600)) : NaN);
        console.log(`               esposizione: furti/min di possesso  lento(<120) ${isNaN(ratei[0])?'--':ratei[0].toFixed(2)} (${fF[0]}/${(fT[0]/3600).toFixed(1)}m)  corsa(120-190) ${isNaN(ratei[1])?'--':ratei[1].toFixed(2)} (${fF[1]}/${(fT[1]/3600).toFixed(1)}m)  tutta(>190) ${isNaN(ratei[2])?'--':ratei[2].toFixed(2)} (${fF[2]}/${(fT[2]/3600).toFixed(1)}m)`);
      }
    }
    await chiudi();
    if (errori.length) console.log('  NO  ' + errori[0]);
    return;
  }

  console.error('FALLITO: --scena deve essere dist | duello | partite');
  process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
