/* =====================================================================
   _sonda-l04.js — LE DUE ACCUSE DELLA VOCE L0.4, MISURATE SUL GIOCO DI
   OGGI INVECE CHE CITATE DAL PROGETTO.

   Il progetto (_analisi/agente28.md, L0.4) porta due accuse scritte su
   una base precedente:
     A. «ogni tiro in corsa esce pallonetto, perche' humanSprint(t) entra
        nella decisione dell'alzata: va tolto dal ramo del tiro».
     B. «possessoTeam legge b.owner, che vale -1 per tutto il volo di un
        passaggio: appena passi, i pulsanti dicono per ~0,35 s che la
        palla e' degli avversari».
   Questa sonda non le crede. Le misura.

   COSA LEGGE, E COSA SI RIFIUTA DI LEGGERE.
   * Braccio A legge LA QUOTA CHE IL PALLONE RAGGIUNGE DAVVERO (max di
     b.z nei 0,30 s dopo il rilascio), non G.stats.pallonetti: quel
     contatore lo scrive fireShot, cioe' esattamente il codice sotto
     accusa. Un pallone che sale e' un fatto; una bandiera e' una
     dichiarazione.
   * Braccio B legge CHI PRENDE DAVVERO IL PALLONE. La verita' di ogni
     fotogramma a palla libera e' «di chi e' il prossimo possesso», letta
     scorrendo la traccia in avanti. Non e' b.passTo — che e' il campo
     che la toppa candidata vorrebbe leggere — e non e' possessoTeam, che
     e' l'imputato. E' l'esito.

   IL DISCRIMINANTE DEL BRACCIO A. Non basta confrontare levetta corta e
   levetta lunga: la levetta lunga e' anche una direzione. Percio' c'e'
   una configurazione che accende lo SPRINT SENZA TOCCARE LA LEVETTA —
   il tasto ShiftLeft (KMAP[0].sprint) tenuto giu' con la levetta a 44 px
   VERSO la porta. Li' humanSprint(0) e' vero e la levetta dice «avanti».
   Se il pallonetto dipende dallo sprint, quella riga si alza; se dipende
   dalla direzione, resta rasoterra.

   PROVA DI ROSSO (obbligatoria: uno strumento mai visto fallire non e'
   uno strumento). Con --rosso la sonda si costruisce da sola le varianti
   guaste nella cartella temporanea e le misura accanto al gioco vero:
     A: il quinto argomento di fireShot torna a essere humanSprint(t)
     B: possessoTeam torna sempre false, e poi sempre true
   Se la sonda non le vede diventare rosse, la sonda non vale niente.

   uso:
     node strumenti/_sonda-l04.js --pallonetto
     node strumenti/_sonda-l04.js --etichetta
     node strumenti/_sonda-l04.js --pallonetto --etichetta --rosso
     node strumenti/_sonda-l04.js --etichetta --gioco fuori/dopo.html
     node strumenti/_sonda-l04.js --etichetta --partite 4 --seme 20260803
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const os = require('os');
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

async function apri(provaAbs, seme) {
  const srv = await servi(provaAbs);
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.addInitScript(s0 => {
    let s = s0 >>> 0 || 1;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    /* il contatore dei sorteggi consumati: e' la sveglia del banco */
    let n = 0;
    window.__semeN = () => n;
    Math.random = () => { n++; return pr() / 4294967296; };
    /* IL CICLO DELL'OROLOGIO SI SPEGNE PRIMA CHE IL GIOCO NASCA, non
       dopo. Spegnerlo dopo il caricamento lasciava girare un numero
       IMPREVEDIBILE di fotogrammi veri fra il caricamento e la riga che
       lo spegneva: due pagine identiche partivano da stati diversi, e il
       confronto fra due file misurava il carico della macchina invece
       della toppa. E' il difetto che ha fatto uscire rosso un controllo
       che il giorno prima era verde, e che ha reso necessario il
       controllo base contro base. */
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => {};
  }, seme);
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 25000 });
  /* =====================================================================
     SI ASPETTA LA QUIETE, NON L'OROLOGIO.
     Prima qui c'era waitForTimeout(150). Misurato: il gioco consuma
     ~144.700 sorteggi in avvio (folla, ritratti, manto) e a 150 ms non ha
     sempre finito — su tre corse identiche una si e' presentata a 82.965.
     Quella corsa partiva da uno stato diverso, e il confronto fra due
     file misurava il carico della macchina invece della toppa. Adesso si
     aspetta che il contatore dei sorteggi stia fermo per otto sondaggi di
     fila, e chi apre riceve il conto: se due corse non hanno lo stesso
     conto prima del fischio d'inizio, non sono confrontabili e il banco
     lo deve dire.
     ===================================================================== */
  await pag.waitForFunction(() => {
    const n = window.__semeN();
    if (window.__qN === n) window.__qK = (window.__qK || 0) + 1; else { window.__qN = n; window.__qK = 0; }
    return window.__qK >= 8;
  }, null, { timeout: 40000, polling: 50 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); });
  const semeN = await pag.evaluate('window.__semeN()');
  return { srv, br, ctx, pag, errori, semeN, chiudi: async () => { await br.close(); srv.chiudi(); } };
}

/* =====================================================================
   BRACCIO A — QUANTO IN ALTO VA IL PALLONE, E DA CHE COSA DIPENDE
   ===================================================================== */

/* la quiete: partita in corso, pallone al comandato, gli altri lontani */
const PREPARA = `(d => {
  const t=window.__test, G=t.G;
  t.setPaused(false);
  try{ if(t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); }catch(e){}
  for(let i=0;i<300 && G.scene!=='play';i++) t.simulate(0.1);
  if(G.scene!=='play') return {errore:'scena '+G.scene};
  t.setTimeLeft(80);
  const pi=G.ctrl[0]; if(pi<0) return {errore:'nessun comandato'};
  const p=G.players[pi], c=t.campo;
  for(const q of G.players) if(q.charge>=0){ q.charge=-1; q.chargeGo=null; }
  p.x=c.FW-d.dist; p.y=c.FH/2; p.vx=0; p.vy=0; p.fx=1; p.fy=0;
  p.slide=-1; p.recover=0; p.rove=-1;
  const b=G.ball;
  b.owner=pi; b.x=p.x+8; b.y=p.y; b.vx=0; b.vy=0; b.vz=0; b.z=0; b.curve=0; b.perfectT=0; b.passTo=-1;
  /* chi e' vicino si allontana: la prova misura il TIRO, non un duello */
  for(const q of G.players){
    q.vx=0; q.vy=0;
    if(q===p) continue;
    const dd=Math.hypot(q.x-b.x,q.y-b.y);
    if(dd<240){ const l=Math.max(1,dd); q.x=b.x+(q.x-b.x)/l*300; q.y=b.y+(q.y-b.y)/l*300; }
  }
  return { ok:1, pi:pi, px:p.x, py:p.y, meta: p.x>c.FW/2 };
})`;

/* legge SOLO effetti: dove sta il pallone, quanto va veloce, quanto sale */
const LEGGI = `(() => {
  const t=window.__test, G=t.G, b=G.ball;
  return { z:b.z, vz:b.vz, vel:Math.hypot(b.vx,b.vy), owner:b.owner,
           sprint: !!humanSprint(0),
           stick: Touch5.stick[0].active ? Math.hypot(Touch5.stick[0].dx,Touch5.stick[0].dy) : 0,
           carica: G.ctrl[0]>=0 ? G.players[G.ctrl[0]].charge : null };
})()`;

/* fa avanzare a passi di un fotogramma e riporta la QUOTA MASSIMA vista:
   e' l'effetto, ed e' l'unica cosa che distingue un pallonetto da un tiro */
const VOLO = `(n => {
  const t=window.__test, G=t.G, b=G.ball;
  let zmax=0, velMax=0;
  for(let i=0;i<n;i++){ t.simulate(1/60); if(b.z>zmax) zmax=b.z;
                        const v=Math.hypot(b.vx,b.vy); if(v>velMax) velMax=v; }
  return { zmax:zmax, velMax:velMax };
})`;

const CONF_A = [
  { nome: 'levetta ferma, nessuno sprint',            R: 0,  ux: 1,  uy: 0, shift: false, dist: 300 },
  { nome: 'levetta 44 px AVANTI (corsa)',             R: 44, ux: 1,  uy: 0, shift: false, dist: 300 },
  { nome: 'levetta 44 px AVANTI + TASTO SPRINT',      R: 44, ux: 1,  uy: 0, shift: true,  dist: 300 },
  { nome: 'levetta ferma + TASTO SPRINT',             R: 0,  ux: 1,  uy: 0, shift: true,  dist: 300 },
  { nome: 'levetta 80 px AVANTI (fondo corsa)',       R: 80, ux: 1,  uy: 0, shift: false, dist: 300 },
  { nome: 'levetta 80 px DI LATO (fondo corsa)',      R: 80, ux: 0,  uy: 1, shift: false, dist: 300 },
  { nome: 'levetta 80 px INDIETRO, meta offensiva',   R: 80, ux: -1, uy: 0, shift: false, dist: 300 },
  { nome: 'levetta 80 px INDIETRO, meta difensiva',   R: 80, ux: -1, uy: 0, shift: false, dist: 900 },
];

/* DOVE STA LA RIGA FRA «TESO» E «SCAVALCATO», e perche' li'.
   Ogni calcio veloce alza un po' il pallone da solo: kickBall fa
   b.vz = min(130, (velocita'-460)*0,4). Col tetto 130 e la gravita' 560
   la cima di quella parabola sta a 130^2/(2*560) = 15,1 unita'.
   Il ramo del pallonetto di fireShot imprime invece 175 (gesto storto) o
   205 (gesto perfetto): cime a 27,3 e 37,5. Fra 15,1 e 27,3 non ci puo'
   arrivare nessuna delle due strade, quindi la riga si mette in mezzo, a
   20 — e la misura non dipende da nessuna bandiera per distinguerle. */
const QUOTA_ALTO = 20;     // unita' di campo: sotto, il pallone non e' scavalcato

async function braccioA(provaAbs, etichetta, prove, seme) {
  const s = await apri(provaAbs, seme);
  const { pag, ctx } = s;
  await pag.evaluate(() => window.__test.startMatch(1, 1));
  const cdp = await ctx.newCDPSession(pag);
  const VW = await pag.evaluate('innerWidth'), VH = await pag.evaluate('innerHeight');
  const btn = await pag.evaluate('window.__test.pulsanti(0)');
  const grande = btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, btn[0]);
  const CASA = { x: VW * 0.18, y: VH * 0.66 };
  const tp = (x, y, id) => ({ x, y, id, radiusX: 12, radiusY: 12, force: 1 });
  let giu = 0;
  const manda = async (type, punti, resta) => {
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: punti });
    giu = (type === 'touchEnd') ? (resta === undefined ? 0 : resta) : punti.length;
  };
  const sgombera = async () => { if (giu) await manda('touchEnd', []); };
  const STATO = `(()=>({stick:!!Touch5.stick[0].active,`
    + `len:Touch5.stick[0].active?Math.round(Math.hypot(Touch5.stick[0].dx,Touch5.stick[0].dy)):0,`
    + `bottoni:Object.keys(Touch5.btnTouch).length}))()`;

  const righe = [];
  for (const c of CONF_A) {
    const r = { nome: c.nome, tiri: 0, alti: 0, zmax: [], vz: [], sprint: 0, stick: [], errori: [] };
    for (let k = 0; k < prove; k++) {
      await sgombera();
      if (c.shift) await pag.keyboard.up('Shift').catch(() => {});
      await pag.evaluate('window.__test.simulate(0.60)');
      const p0 = await pag.evaluate(PREPARA + `({dist:${c.dist}})`);
      if (p0.errore) { r.errori.push(p0.errore); continue; }
      if (c.shift) await pag.keyboard.down('Shift');
      let sin = null;
      if (c.R > 0) {
        sin = tp(CASA.x, CASA.y, 1);
        await manda('touchStart', [sin]);
        for (const q of [0.34, 0.67, 1]) {
          sin = tp(CASA.x + c.ux * c.R * q, CASA.y + c.uy * c.R * q, 1);
          await manda('touchMove', [sin]);
        }
        await pag.evaluate('window.__test.simulate(0.20)');
      }
      const des = tp(grande.x, grande.y, 2);
      await manda('touchStart', sin ? [sin, des] : [des]);
      const d1 = await pag.evaluate(STATO);
      if (d1.bottoni !== 1 || (c.R > 0 && !d1.stick)) { r.errori.push('dita alla pressione ' + JSON.stringify(d1)); continue; }
      await pag.evaluate('window.__test.simulate(0.65)');   // dentro SHOT_MIN..SHOT_MAX
      const pre = await pag.evaluate(LEGGI);
      await manda('touchEnd', [des], sin ? 1 : 0);
      const d2 = await pag.evaluate(STATO);
      if (d2.bottoni !== 0) { r.errori.push('dita al rilascio ' + JSON.stringify(d2)); continue; }
      /* la spinta VERTICALE impressa dal calcio, letta sul pallone
         nell'istante del rilascio: e' un effetto, non un contatore */
      const post = await pag.evaluate(LEGGI);
      /* 0,30 s di volo, un fotogramma per volta: la QUOTA e' l'effetto */
      const v = await pag.evaluate(VOLO + '(18)');
      if (v.velMax < 150) { r.errori.push('nessun tiro partito (vel ' + v.velMax.toFixed(0) + ')'); continue; }
      r.tiri++;
      if (v.zmax >= QUOTA_ALTO) r.alti++;
      r.vz.push(Math.round(post.vz));
      r.zmax.push(+v.zmax.toFixed(1));
      if (pre.sprint) r.sprint++;
      r.stick.push(Math.round(pre.stick));
      if (c.shift) await pag.keyboard.up('Shift');
    }
    righe.push(r);
  }
  await sgombera();
  const err = s.errori.slice();
  await s.chiudi();
  return { etichetta, gioco: provaAbs || 'CALCETTO-il-gioco.html (repo)', righe, eccezioni: err };
}

function stampaA(res) {
  console.log(`\n=== BRACCIO A — LA QUOTA DEL PALLONE · ${res.etichetta} ===`);
  console.log('  --  gioco: ' + res.gioco + `   (alto = quota massima >= ${QUOTA_ALTO} unita' nei 0,30 s dopo il rilascio)`);
  console.log('  ' + 'configurazione'.padEnd(38) + 'tiri  alti  sprint  |stick|     vz   quota max  (mediane)');
  let tot = 0, alti = 0, totS = 0, altiS = 0, totN = 0, altiN = 0;
  for (const r of res.righe) {
    const med = r.zmax.length ? mediana(r.zmax).toFixed(1) : '-';
    const mvz = r.vz.length ? mediana(r.vz).toFixed(0) : '-';
    const st = r.stick.length ? Math.round(mediana(r.stick)) : 0;
    console.log('  ' + r.nome.padEnd(38) + String(r.tiri).padStart(4) + String(r.alti).padStart(6)
      + String(r.sprint).padStart(8) + String(st).padStart(9) + mvz.padStart(7) + med.padStart(12)
      + (r.errori.length ? '   [' + r.errori.length + ' prove nulle: ' + r.errori[0] + ']' : ''));
    tot += r.tiri; alti += r.alti;
    if (r.sprint === r.tiri && r.tiri > 0) { totS += r.tiri; altiS += r.alti; }
    if (r.sprint === 0 && r.tiri > 0) { totN += r.tiri; altiN += r.alti; }
  }
  const pc = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '-';
  console.log(`  --  TIRI ALTI IN TUTTO: ${alti}/${tot} = ${pc(alti, tot)}`);
  console.log(`  --  con humanSprint(0) VERO:  ${altiS}/${totS} = ${pc(altiS, totS)}`);
  console.log(`  --  con humanSprint(0) FALSO: ${altiN}/${totN} = ${pc(altiN, totN)}`);
  if (res.eccezioni.length) console.log('  !!  eccezioni di pagina: ' + res.eccezioni.slice(0, 3).join(' | '));
  return { alti, tot, altiS, totS, altiN, totN };
}

function mediana(a) { const b = a.slice().sort((x, y) => x - y); const n = b.length; return n ? (n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2) : 0; }

/* =====================================================================
   BRACCIO B — QUANTI MILLISECONDI L'ETICHETTA E' SBAGLIATA

   La traccia si prende UN FOTOGRAMMA PER VOLTA. Per ogni fotogramma:
     · squadra del possessore (-1 = palla di nessuno)
     · che cosa dicono i pulsanti della squadra 0, letto da
       __test.pulsanti(0): 'shot'/'through' = NOSTRA, 'slide'/'swap' = LORO
   La VERITA' si costruisce DOPO, in Node, scorrendo la traccia in
   avanti: a palla libera la verita' e' la squadra che il possesso lo
   prende davvero. Nessun campo del gioco entra nella verita'.
   ===================================================================== */
const TRACCIA = `(n => {
  const t=window.__test, G=t.G;
  const out=[];
  for(let i=0;i<n;i++){
    if(G.scene==='menu'||G.scene==='end') break;
    t.simulate(1/60);
    const b=G.ball;
    const ow = b.owner>=0 && G.players[b.owner] ? G.players[b.owner].team : -1;
    const bt = t.pulsanti(0);
    let g=bt[0]; for(const q of bt) if((q.r||0)>(g.r||0)) g=q;
    /* QUANTO E' LONTANO IL PALLONE DAL PIU' VICINO DEI NOSTRI UOMINI DI
       MOVIMENTO. Serve alla colonna che conta le promesse impossibili:
       startCharge e doFiltrante non fanno NIENTE se il pallone non e'
       suo e sta oltre KICK_R*1,4. E' una precondizione del gioco, letta
       come distanza — cioe' un effetto — non una bandiera. */
    let dmin=1e9;
    for(const p of G.players){ if(p.team!==0 || p.out>0 || p.role==='gk') continue;
      const d=Math.hypot(p.x-b.x,p.y-b.y); if(d<dmin) dmin=d; }
    out.push([ ow, (g.act==='shot'||g.act==='through')?1:0,
               G.scene==='play'?1:0, Math.round(Math.hypot(b.vx,b.vy)),
               Math.round(dmin) ]);
  }
  return out;
})`;

async function braccioB(provaAbs, etichetta, partite, seme, cpu) {
  const righe = [];
  for (let m = 0; m < partite; m++) {
    const s = await apri(provaAbs, seme + m);
    await s.pag.evaluate(() => { const t = window.__test; t.startMatch(1, 1); });
    await s.pag.evaluate(c => { if (c) window.__test.setCpuVsCpu(true); }, cpu);
    await s.pag.evaluate(() => { const t = window.__test, G = t.G; for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1); });
    const tr = await s.pag.evaluate(TRACCIA + '(6200)');   // ~103 s: piu' di una partita
    righe.push(tr);
    await s.chiudi();
  }
  return { etichetta, gioco: provaAbs || 'CALCETTO-il-gioco.html (repo)', tracce: righe };
}

/* la verita' d'esito, e i conti in millisecondi */
function contaB(tracce) {
  const MS = 1000 / 60;
  let fr = 0, msErrLoro = 0, msErrNostra = 0;
  let voliNostri = 0, msVoliNostriSbagliati = 0, durateVoli = [];
  let voliPersi = 0, msVoliPersiDettiNostri = 0;
  let msSenzaEsito = 0;
  /* la promessa impossibile: dice NOSTRA e nessun nostro uomo di
     movimento arriva al pallone, quindi TIRA e PASSAGGIO non farebbero
     niente. KICK_R = 26, e startCharge concede KICK_R*1,4 = 36,4. */
  const PORTATA = 26 * 1.4;
  let msPromessaVuota = 0, msDiceNostra = 0;
  for (const tr of tracce) {
    /* verita' d'esito: a palla libera, la squadra che prende il possesso dopo */
    const ver = new Array(tr.length).fill(-1);
    let next = -1;
    for (let i = tr.length - 1; i >= 0; i--) {
      if (tr[i][0] >= 0) { next = tr[i][0]; ver[i] = tr[i][0]; }
      else ver[i] = next;                       // -1 se la traccia finisce a palla libera
    }
    for (let i = 0; i < tr.length; i++) {
      if (!tr[i][2]) continue;                  // solo scena 'play'
      fr++;
      const diceNostra = tr[i][1] === 1;
      if (diceNostra) { msDiceNostra += MS; if (tr[i][4] > PORTATA) msPromessaVuota += MS; }
      if (ver[i] < 0) { msSenzaEsito += MS; continue; }
      if (ver[i] === 0 && !diceNostra) msErrLoro += MS;      // e' nostra e dice LORO
      if (ver[i] === 1 && diceNostra) msErrNostra += MS;     // e' loro e dice NOSTRA
    }
    /* i voli: tratti a palla di nessuno fra due possessi */
    let i = 0;
    while (i < tr.length) {
      if (tr[i][0] >= 0) { i++; continue; }
      let j = i; while (j < tr.length && tr[j][0] < 0) j++;
      const prima = i > 0 ? tr[i - 1][0] : -1;
      const dopo = j < tr.length ? tr[j][0] : -1;
      let dur = 0, sb = 0, dettiNostri = 0;
      for (let k = i; k < j; k++) { if (!tr[k][2]) continue; dur += MS; if (tr[k][1] !== 1) sb += MS; else dettiNostri += MS; }
      if (prima === 0 && dopo === 0 && dur > 0) { voliNostri++; msVoliNostriSbagliati += sb; durateVoli.push(dur); }
      if (prima === 0 && dopo === 1 && dur > 0) { voliPersi++; msVoliPersiDettiNostri += dettiNostri; }
      i = j;
    }
  }
  return { fr, sec: fr / 60, msErrLoro, msErrNostra, voliNostri, msVoliNostriSbagliati,
           medVolo: durateVoli.length ? mediana(durateVoli) : 0, voliPersi, msVoliPersiDettiNostri, msSenzaEsito,
           msPromessaVuota, msDiceNostra };
}

function stampaB(res) {
  const c = contaB(res.tracce);
  console.log(`\n=== BRACCIO B — L'ETICHETTA CONTRO L'ESITO · ${res.etichetta} ===`);
  console.log('  --  gioco: ' + res.gioco);
  console.log(`  --  ${res.tracce.length} partite · ${c.fr} fotogrammi di gioco (${c.sec.toFixed(0)} s)`);
  console.log(`  L'ACCUSA DEL PROGETTO (stretta): i voli di un NOSTRO passaggio che arriva a un NOSTRO uomo`);
  console.log(`     voli ${c.voliNostri} · durata mediana del volo ${c.medVolo.toFixed(0)} ms`);
  console.log(`     millisecondi in cui i pulsanti dicono LORO: ${c.msVoliNostriSbagliati.toFixed(0)} ms`
    + (c.voliNostri ? `  (${(c.msVoliNostriSbagliati / c.voliNostri).toFixed(0)} ms per passaggio)` : ''));
  console.log(`  IL CONTO SIMMETRICO (largo), verita' = chi prende il possesso dopo:`);
  console.log(`     e' NOSTRA e i pulsanti dicono LORO   ${c.msErrLoro.toFixed(0)} ms  (${(100 * c.msErrLoro / 1000 / c.sec).toFixed(1)}% del tempo)`);
  console.log(`     e' LORO e i pulsanti dicono NOSTRA   ${c.msErrNostra.toFixed(0)} ms  (${(100 * c.msErrNostra / 1000 / c.sec).toFixed(1)}% del tempo)`);
  console.log(`     TOTALE SBAGLIATO                     ${(c.msErrLoro + c.msErrNostra).toFixed(0)} ms  (${(100 * (c.msErrLoro + c.msErrNostra) / 1000 / c.sec).toFixed(1)}%)`);
  console.log(`  IL PREZZO — la promessa impossibile (dice NOSTRA e nessun nostro uomo di movimento`);
  console.log(`     arriva al pallone, quindi TIRA/PASSAGGIO non farebbero niente):`);
  console.log(`     ${c.msPromessaVuota.toFixed(0)} ms su ${c.msDiceNostra.toFixed(0)} ms di NOSTRA`
    + ` = ${c.msDiceNostra ? (100 * c.msPromessaVuota / c.msDiceNostra).toFixed(1) : '-'}%`
    + `   (${(100 * c.msPromessaVuota / 1000 / c.sec).toFixed(1)}% del tempo di gioco)`);
  console.log(`  --  contorno: nostri passaggi PERSI (finiti a loro) ${c.voliPersi}, di cui ${c.msVoliPersiDettiNostri.toFixed(0)} ms gia' oggi detti NOSTRA`
    + ` · ${c.msSenzaEsito.toFixed(0)} ms scartati perche' la traccia finisce a palla libera`);
  return c;
}

/* =====================================================================
   BRACCIO C — L'ETICHETTA PER CAPACITA' (voce L1)

   Tre misure, e nessuna riscrive una guardia del gioco.

   C1 IDENTITA' DELLA TRACCIA. Un robot che preme SEMPRE LO STESSO
      CALENDARIO (non guarda l'etichetta: chiama le quattro azioni a
      fotogrammi fissi) gira sui due file. Se la toppa non cambia un bit
      di comportamento, le due tracce — pallone, possesso, uomo
      controllato, punteggio, fotogramma per fotogramma — devono essere
      IDENTICHE. E' anche il controllo che i predicati non consumino un
      sorteggio: un solo Math.random in piu' e le tracce divergono.

   C2 ONESTA' DELL'ETICHETTA. Un secondo robot preme DAVVERO il disco, con
      Touch5.start alle coordinate che il gioco dichiara, e legge l'atto
      che il gioco stesso ha risolto (Touch5.btnTouch). Poi guarda se il
      MONDO E' CAMBIATO: carica aperta, scivolata preparata, uomo
      controllato diverso, pallone ripartito. Nessun predicato riscritto,
      nessuna bandiera: la promessa e' mantenuta se qualcosa e' successo.

   C3 SFARFALLIO E STRAPPI. Per ogni fotogramma si registrano i due atti
      dichiarati. Da li': quanti cambi al secondo, quanti duravano meno di
      0,25 s e meno di 0,08 s, e — delle volte in cui il pallone passa da
      un nostro uomo a un loro uomo — in quante un verbo difensivo compare
      entro mezzo secondo.
   ===================================================================== */

/* il robot vive dentro la pagina: qui non c'e' orologio, solo fotogrammi */
const ROBOT = `((modo, frames) => {
  const t=window.__test, G=t.G;
  const S={ traccia:[], atti:[], prove:[], costi:[] };
  const stickVersoPalla = () => {
    const p = G.ctrl[0]>=0 ? G.players[G.ctrl[0]] : null;
    const st = Touch5.stick[0];
    if(!p){ st.active=false; return; }
    const dx=G.ball.x-p.x, dy=G.ball.y-p.y, l=Math.max(1,Math.hypot(dx,dy));
    st.active=true; st.id=99; st.ox=0; st.oy=0; st.dx=dx/l*66; st.dy=dy/l*66;
  };
  const foto = () => {
    const p = G.ctrl[0]>=0 ? G.players[G.ctrl[0]] : null;
    const b=G.ball;
    return { car: p?p.charge:-9, go: p?!!p.chargeGo:false, sli: p?p.slide:-9,
             rov: p?p.rove:-9, ctrl:G.ctrl[0], own:b.owner,
             vx:Math.round(b.vx), vy:Math.round(b.vy) };
  };
  const diverso = (a,b) => a.car!==b.car||a.go!==b.go||a.sli!==b.sli||a.rov!==b.rov
                        || a.ctrl!==b.ctrl||a.own!==b.own||a.vx!==b.vx||a.vy!==b.vy;
  let f=0;
  for(let i=0;i<frames;i++){
    if(G.scene==='menu'||G.scene==='end') break;
    stickVersoPalla();
    const inGioco = (G.scene==='play');
    if(inGioco){
      f++;
      /* IL COSTO SI MISURA SU STATI DI GIOCO VERI, sparsi nella partita,
         e non su uno solo: il ramo caro (finestraRovesciata) si attraversa
         solo quando il pallone e' fuori dal raggio di calcio, quindi una
         misura presa in un istante solo dice quanto costava QUELL'istante.
         Venti campioni, e nella consegna va la mediana. */
      if(f%450===0){
        let acc=0;
        for(let i=0;i<4000;i++) acc+=touchBtnLayout(0).length;   // scalda
        const c0=performance.now();
        for(let i=0;i<40000;i++) acc+=touchBtnLayout(0).length;
        S.costi.push((performance.now()-c0)*1000/40000 + (acc<0?1:0));
      }
      const bt = touchBtnLayout(0);
      let g=bt[0], s=bt[1]; if((s.r||0)>(g.r||0)){ g=bt[1]; s=bt[0]; }
      S.atti.push([g.act, s.act, G.ball.owner>=0?G.players[G.ball.owner].team:-1]);
      if(modo==='calendario'){
        /* IL CALENDARIO NON GUARDA L'ETICHETTA: e' identico sui due file,
           ed e' l'unico modo perche' il confronto delle tracce misuri la
           toppa invece che le decisioni del robot. */
        if(f%24===0) startCharge(0);
        if(f%24===12) releaseCharge(0);
        if(f%37===0) doFiltrante(0,false);
        if(f%53===0) doSlide(0);
        if(f%71===0) cambiaGiocatore(0);
      } else if(modo==='osserva'){
        /* NON SI PREME NIENTE. Serve a separare lo sfarfallio che nasce
           dalla REGOLA da quello che nasce dai GESTI: un anticipo aperto
           spegne il verbo per la durata della preparazione, e un robot
           che preme cinque volte al secondo se lo produce da solo. */
      } else if(f%11===0){
        /* SI PREME DAVVERO, dove il gioco dichiara che sta il disco, e
           l'atto lo dice il gioco (Touch5.btnTouch), non questo file. */
        const disco = (f%22===0) ? g : s;
        const pri = foto();
        Touch5.start(77, disco.x, disco.y);
        const reg = Touch5.btnTouch[77];
        const atto = reg ? reg.act : null;
        const dopo = foto();
        Touch5.chiudi(77, true);
        /* per le pressioni a vuoto si registra anche lo STATO DI PARTENZA:
           il perche' di una promessa mancata conta piu' del suo numero */
        const perche = pri.sli>=0 ? 'a terra' : pri.rov>=0 ? 'in rovesciata'
                     : (pri.car>=0 && pri.go) ? 'gesto gia in preparazione'
                     : pri.car>=0 ? 'carica di tiro gia aperta' : 'altro';
        if(atto) S.prove.push([atto, diverso(pri,dopo)?1:0, perche]);
      }
    }
    t.simulate(1/60);
    const b=G.ball;
    S.traccia.push([Math.round(b.x*64), Math.round(b.y*64), b.owner, G.ctrl[0],
                    G.score[0], G.score[1]]);
  }
  return S;
})`;

/* il costo: la stessa chiamata che fa il disegno, cronometrata */
const COSTO = `(n => {
  let acc=0;
  /* una passata a vuoto perche' il compilatore scaldi il codice */
  for(let i=0;i<2000;i++) acc+=touchBtnLayout(0).length;
  const t0=performance.now();
  for(let i=0;i<n;i++) acc+=touchBtnLayout(0).length;
  const t1=performance.now();
  return { us: (t1-t0)*1000/n, acc:acc };
})`;

async function braccioC(provaAbs, etichetta, modo, seme, frames, partite) {
  const tot = { traccia: [], atti: [], prove: [], costi: [] };
  let costo = { us: 0 }; const err = []; const semi = [];
  for (let m = 0; m < (partite || 1); m++) {
    const s = await apri(provaAbs, seme + m);
    semi.push(s.semeN);
    await s.pag.evaluate(() => { const t = window.__test; t.startMatch(1, 1); });
    await s.pag.evaluate(() => { const t = window.__test, G = t.G; for (let i = 0; i < 200 && G.scene !== 'play'; i++) t.simulate(0.1); });
    const r = await s.pag.evaluate(ROBOT + `(${JSON.stringify(modo)}, ${frames})`);
    /* le partite si accodano; il confronto delle tracce resta valido
       perche' i semi sono gli stessi sui due file, nello stesso ordine */
    tot.traccia.push(...r.traccia); tot.atti.push(...r.atti); tot.prove.push(...r.prove); tot.costi.push(...r.costi);
    err.push(...s.errori);
    await s.chiudi();
  }
  costo = { us: tot.costi.length ? mediana(tot.costi) : 0, n: tot.costi.length,
            min: tot.costi.length ? Math.min(...tot.costi) : 0,
            max: tot.costi.length ? Math.max(...tot.costi) : 0 };
  return { etichetta, gioco: provaAbs || 'CALCETTO-il-gioco.html (repo)', modo, ...tot, costo, eccezioni: err, semi };
}

function contaC(res) {
  const MS = 1000 / 60;
  /* promesse: per atto, quante pressioni hanno cambiato il mondo */
  const per = {};
  for (const [atto, ok, perche] of res.prove) {
    per[atto] = per[atto] || { n: 0, vuote: 0, cause: {} };
    per[atto].n++;
    if (!ok) { per[atto].vuote++; per[atto].cause[perche] = (per[atto].cause[perche] || 0) + 1; }
  }
  /* sfarfallio sul disco grande e sul piccolo */
  const sfarf = k => {
    let cambi = 0, sotto25 = 0, sotto08 = 0, da = 0, prec = null;
    for (let i = 0; i < res.atti.length; i++) {
      const a = res.atti[i][k];
      if (prec === null) { prec = a; da = i; continue; }
      if (a !== prec) { const d = (i - da) * MS; cambi++; if (d < 250) sotto25++; if (d < 80) sotto08++; prec = a; da = i; }
    }
    return { cambi, sotto25, sotto08 };
  };
  /* strappi: il possesso passa da noi a loro. Il verbo difensivo compare
     entro mezzo secondo su almeno uno dei due dischi? */
  let strappi = 0, conDifesa = 0, conSlide = 0; const senza = {};
  let ultimo = -1;
  for (let i = 0; i < res.atti.length; i++) {
    const o = res.atti[i][2];
    if (o < 0) continue;
    if (ultimo === 0 && o === 1) {
      strappi++;
      let d = false, sl = false;
      for (let k = i; k < Math.min(res.atti.length, i + 30); k++) {
        if (res.atti[k][0] === 'slide') { sl = true; d = true; }
        if (res.atti[k][1] === 'swap') d = true;
      }
      if (d) conDifesa++;
      if (sl) conSlide++;
      /* QUANDO IL VERBO DIFENSIVO NON C'E', CHE COSA C'E' AL SUO POSTO?
         «manca il contrasto» e «non c'e' niente da premere» sono due cose
         diverse, e la seconda sarebbe una bocciatura mentre la prima no. */
      if (!d) { const k = res.atti[i][0] + '+' + res.atti[i][1]; senza[k] = (senza[k] || 0) + 1; }
    }
    ultimo = o;
  }
  return { per, grande: sfarf(0), piccolo: sfarf(1), strappi, conDifesa, conSlide, senza,
           sec: res.atti.length / 60 };
}

function stampaC(res) {
  const c = contaC(res);
  console.log(`\n=== BRACCIO C — L'ETICHETTA PER CAPACITA' · ${res.etichetta} ===`);
  console.log('  --  gioco: ' + res.gioco + `  · robot "${res.modo}" · ${c.sec.toFixed(0)} s di gioco`);
  if (res.modo === 'osserva') {
    console.log('  C3 · SFARFALLIO SENZA PRESSIONI (solo la regola, nessun gesto):');
    for (const [k, d] of [['disco grande', c.grande], ['disco piccolo', c.piccolo]])
      console.log(`     ${k.padEnd(14)} ${String(d.cambi).padStart(4)} cambi = ${(d.cambi / c.sec).toFixed(2)}/s`
        + ` · sotto 0,25 s: ${d.sotto25} (${(d.sotto25 / c.sec).toFixed(3)}/s) · sotto 0,08 s: ${d.sotto08} (${(d.sotto08 / c.sec).toFixed(3)}/s)`);
    console.log(`  C3 · STRAPPI: ${c.strappi} · verbo difensivo entro 0,5 s: ${c.conDifesa}/${c.strappi}`
      + ` · CONTRASTA sul disco grande: ${c.conSlide}/${c.strappi}`);
    const sz = Object.entries(c.senza).sort((x,y)=>y[1]-x[1]).map(([k,v])=>k+' x'+v).join(', ');
    if (sz) console.log('     dove manca, i due dischi offrivano: ' + sz);
  }
  if (res.modo === 'etichetta') {
    console.log('  C2 · SI PREME IL DISCO E SI GUARDA SE IL MONDO CAMBIA:');
    const ordine = ['shot', 'through', 'slide', 'swap'];
    const nome = { shot: 'TIRA', through: 'PASSAGGIO', slide: 'CONTRASTA', swap: 'CAMBIO' };
    for (const a of ordine) {
      const p = c.per[a]; if (!p) continue;
      const why = Object.entries(p.cause).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${v}`).join(', ');
      console.log(`     dice ${nome[a].padEnd(10)} e non succede niente: ${String(p.vuote).padStart(4)} su ${String(p.n).padStart(4)} pressioni`
        + ` = ${(100 * p.vuote / p.n).toFixed(2)}%` + (why ? `   [${why}]` : ''));
    }
    console.log('  C3 · SFARFALLIO:');
    for (const [k, d] of [['disco grande', c.grande], ['disco piccolo', c.piccolo]])
      console.log(`     ${k.padEnd(14)} ${String(d.cambi).padStart(4)} cambi = ${(d.cambi / c.sec).toFixed(2)}/s`
        + ` · sotto 0,25 s: ${d.sotto25} · sotto 0,08 s: ${d.sotto08}`);
    console.log(`  C3 · STRAPPI (il possesso passa da noi a loro): ${c.strappi}`);
    console.log(`     un verbo difensivo entro 0,5 s: ${c.conDifesa}/${c.strappi}`
      + `   di cui CONTRASTA sul disco grande: ${c.conSlide}/${c.strappi}`);
  }
  console.log(`  C1 · COSTO di touchBtnLayout (i DUE dischi insieme): mediana ${res.costo.us.toFixed(3)} us per chiamata` +
    ` (da ${res.costo.min.toFixed(3)} a ${res.costo.max.toFixed(3)} su ${res.costo.n} campioni sparsi nella partita)`);
  if (res.eccezioni.length) console.log('  !!  eccezioni di pagina: ' + res.eccezioni.slice(0, 3).join(' | '));
  return { c, traccia: res.traccia };
}

/* =====================================================================
   LE VARIANTI GUASTE — la sonda deve saperle vedere diventare rosse
   ===================================================================== */
function variante(nome, sost) {
  const src = fs.readFileSync(path.join(RADICE, 'CALCETTO-il-gioco.html'), 'utf8');
  let out = src;
  for (const [a, b] of sost) {
    const n = out.split(a).length - 1;
    if (n !== 1) { console.error(`FALLITO: la variante "${nome}" non trova esattamente una volta:\n  ${a}\n  (trovato ${n})`); process.exit(1); }
    out = out.replace(a, b);
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'l04-'));
  const f = path.join(dir, 'CALCETTO-il-gioco.html');
  fs.writeFileSync(f, out);
  return f;
}

const ANC_LOB = 'fireShot(p, dx/l, dy/l, q, ((t===0 ? -mx : mx) > 0.5) && metaOffensiva(p));';
const ANC_POSS = 'return G.ball && G.ball.owner>=0 && G.players[G.ball.owner] && G.players[G.ball.owner].team===t;';

(async () => {
  const provaAbs = arg('gioco', '') ? path.resolve(arg('gioco', '')) : '';
  if (provaAbs && !fs.existsSync(provaAbs)) { console.error('FALLITO: gioco inesistente ' + provaAbs); process.exit(1); }
  const etichetta = arg('etichetta-nome', provaAbs ? path.basename(provaAbs) : 'OGGI');
  const prove = Math.max(1, +arg('prove', 6) | 0);
  const partite = Math.max(1, +arg('partite', 3) | 0);
  const seme = +arg('seme', 20260803) | 0;
  const cpu = !haFlag('umano');
  const rosso = haFlag('rosso');

  if (haFlag('pallonetto')) {
    stampaA(await braccioA(provaAbs, etichetta, prove, seme));
    if (rosso) {
      const g = variante('humanSprint rimesso nel tiro', [[ANC_LOB, 'fireShot(p, dx/l, dy/l, q, humanSprint(t));']]);
      stampaA(await braccioA(g, 'ROSSO: humanSprint(t) rimesso nel ramo del tiro', prove, seme));
    }
  }
  if (haFlag('etichetta')) {
    stampaB(await braccioB(provaAbs, etichetta, partite, seme, cpu));
    if (rosso) {
      const g1 = variante('possessoTeam sempre falso', [[ANC_POSS, 'return false;']]);
      stampaB(await braccioB(g1, 'ROSSO: possessoTeam sempre FALSO', partite, seme, cpu));
      const g2 = variante('possessoTeam sempre vero', [[ANC_POSS, 'return true;']]);
      stampaB(await braccioB(g2, 'ROSSO: possessoTeam sempre VERO', partite, seme, cpu));
    }
  }
  if (haFlag('capacita')) {
    const altro = arg('contro', '') ? path.resolve(arg('contro', '')) : '';
    const frames = Math.max(600, +arg('frames', 6200) | 0);
    /* C2/C3 sul file chiesto */
    stampaC(await braccioC(provaAbs, etichetta, 'etichetta', seme, frames, partite));
    if (altro) stampaC(await braccioC(altro, path.basename(altro), 'etichetta', seme, frames, partite));
    /* lo sfarfallio della sola REGOLA, senza gesti che se lo producano */
    stampaC(await braccioC(provaAbs, etichetta, 'osserva', seme, frames, partite));
    if (altro) stampaC(await braccioC(altro, path.basename(altro), 'osserva', seme, frames, partite));
    /* C1: la stessa identica sequenza di chiamate sui due file */
    if (altro) {
      console.log(`\n=== C1 — IDENTITA' DELLA TRACCIA (robot a calendario fisso, stesse chiamate sui due file) ===`);
      const a = await braccioC(provaAbs, etichetta, 'calendario', seme, frames, partite);
      /* IL CONTROLLO CHE VIENE PRIMA: la stessa corsa, DUE VOLTE SULLO
         STESSO FILE. Se questo non e' identico il banco non e' ripetibile
         e il confronto fra due file non vuol dire niente. Un banco di
         prova non ripetibile rende ciechi senza che si veda. */
      const a2 = await braccioC(provaAbs, etichetta, 'calendario', seme, frames, partite);
      const b = await braccioC(altro, path.basename(altro), 'calendario', seme, frames, partite);
      const confronta = (x, y, nome) => {
        if (JSON.stringify(x.semi) !== JSON.stringify(y.semi)) {
          console.log(`  ROSSO ${nome}: i sorteggi consumati prima del fischio non coincidono`
            + ` (${x.semi.join('/')} contro ${y.semi.join('/')}) — le due corse non sono confrontabili.`);
          return false;
        }
        const tx = JSON.stringify(x.traccia), ty = JSON.stringify(y.traccia);
        if (tx === ty) { console.log(`  OK   ${nome}: ${x.traccia.length} fotogrammi IDENTICI`); return true; }
        let k = 0; while (k < x.traccia.length && k < y.traccia.length && JSON.stringify(x.traccia[k]) === JSON.stringify(y.traccia[k])) k++;
        console.log(`  ROSSO ${nome}: divergono al fotogramma ${k} (${(k / 60).toFixed(2)} s)`);
        console.log('        ' + JSON.stringify(x.traccia[k]) + '  contro  ' + JSON.stringify(y.traccia[k]));
        return false;
      };
      const rip = confronta(a, a2, 'controllo di ripetibilita (stesso file, due corse)');
      const ide = confronta(a, b, 'base contro toppa');
      if (!rip) console.log('  --   il confronto fra i due file NON SI LEGGE finche il controllo di ripetibilita e rosso.');
      else if (ide) console.log('  --   la toppa non cambia un bit, e nessun predicato consuma un sorteggio.');
      console.log(`  costo touchBtnLayout (mediana): ${a.costo.us.toFixed(3)} us contro ${b.costo.us.toFixed(3)} us per chiamata`);
    }
  }
  if (!haFlag('pallonetto') && !haFlag('etichetta') && !haFlag('capacita'))
    console.log('uso: node strumenti/_sonda-l04.js --pallonetto | --etichetta | --capacita --contro fuori/l04b.html');
})();
