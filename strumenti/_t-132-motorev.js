/* =====================================================================
   _t-132-motorev.js — MOTORE_V RESTA 2? SI MISURA, NON SI OPINA
   (voce #132, compito 5). Gemello di _t-duello-motorev.js (voce #131).

   LA DOMANDA. MOTORE_V vale 2. Si incrementa quando una cura cambia
   l'esito di sequenze di comandi identiche: i nastri registrati sul
   motore vecchio vengono allora rifiutati con causa vera invece di
   essere rigiocati storti. Le cinque cure della voce #132 lo devono
   portare a 3?

   LA CATENA CHE DICE DI NO, e ogni anello e' verificabile:
     · il tipo 8 (mentalita') e il tipo 9 (troncatura) sono righe NUOVE:
       un nastro vecchio non ne ha, quindi il codice nuovo non gira;
     · l'indice di carattere sta in CODA al tipo 7: un nastro vecchio
       finisce prima, carDif resta undefined e startMatch ricade su
       caratterePer(G.oppName), cioe' su quello che faceva ieri;
     · attrRosa su un salvataggio sano e' l'identita' (nuovaRosa fa
       50+((c*26)|0), faiCrescereRosa fa ++ e si ferma a 99: interi in
       1..99);
     · il rumore bianco non pesca piu' dal dado seminato, ma nel gioco
       spedito lo sblocco dell'audio arriva PRIMA che il seme si accenda
       e SEME.accendi riazzera il flusso — questo banco riproduce quella
       configurazione (audio aperto all'apertura della pagina, come fa un
       pollice sulla copertina), e il caso in cui l'audio si apre a
       partita in corso e' misurato a parte (prova E di
       _q-ment-nastro.js, promosso a cancello di qualita' il 21 settembre
       2026: si chiamava _t-ment-nastro.js).

   MA E' UN'INFERENZA, e un'inferenza non basta per una costante che
   decide quali partite si rifiutano. Questo banco la MISURA: registra N
   nastri sul gioco di PRIMA e li rigioca sul gioco CURATO, confrontando
   impronta per impronta, punteggio e conto dei sorteggi.

   IL CONTROLLO DEL CONTROLLO VIENE PRIMA: ogni nastro si rigioca anche
   sul gioco di PRIMA. Se gia' li' non torna, la colpa non e' della cura
   e quel seme non puo' dire niente — si dichiara nullo e non si conta.
   Senza questa meta', un banco instabile accuserebbe la cura.

   A DIFFERENZA DEL BANCO DELLA VOCE #131, i semi che passano dal
   DISCHETTO non si scartano: dal #131 il duello e' dentro il nastro, e
   una partita con un duello esercita piu' motore di una senza.

   uso:  node strumenti/_t-132-motorev.js
         node strumenti/_t-132-motorev.js --prima fuori/gioco-132-base.html --n 30
         node strumenti/_t-132-motorev.js --passi 3600
   esce 0 se la misura dice «resta 2», 1 se dice «deve salire a 3»,
   2 se il banco esplode, 3 se non ha potuto misurare abbastanza semi.

   CORREZIONE DI REVISIONE (voce #132, 21 settembre 2026): il comando nudo
   rifaceva 2400 passi e 0 dal dischetto, ma MANUALE.md, PUNTO-DEL-LAVORO.md
   e il commento accanto a MOTORE_V nel gioco dichiarano 3600 passi e uno dei
   trenta dal dischetto. Il default e' salito a 3600 cosi' il comando nudo
   rifa' davvero il numero scritto nel verbale (il verdetto non cambia).
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const CURATO = arg('gioco', 'CALCETTO-il-gioco.html');
const PRIMA = arg('prima', 'fuori/gioco-132-base.html');
const N_VOLUTI = parseInt(arg('n', '30'), 10);
const MAX_SEMI = parseInt(arg('max', '45'), 10);
const SEME0 = parseInt(arg('seme', '20260801'), 10);
const PASSI = parseInt(arg('passi', '3600'), 10);   /* 60 secondi a 60 Hz */
const TAGLIA = 5;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* l'impronta di _q-replay.js, invariata */
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

/* il copione delle dita, col dischetto risolto coi tre metodi (in questo
   banco rAF e' zittito, quindi la geometria del mirino non e' mai stata
   disegnata e duelMira non saprebbe dove mandare il pallone) */
const COPIONE = `
(function(passi, IMPR, campionaOgni){
  const t = window.__test;
  const D = t.Duel;
  const impronte = [];
  const leggi = new Function('return ' + IMPR);
  const dischi = t.pulsanti(0);
  const grande = dischi[0] || {x:800,y:330,r:44};
  const piccolo = dischi[1] || {x:720,y:250,r:34};
  const LX = 180, LY = 300;
  let idL = 1, idB = 2, giu = false, giuB = false, duello = 0;
  for(let f = 0; f < passi; f++){
    if(t.state === 'freekick'){
      duello++;
      if(D.phase === 'zone' && D.shooterHuman) D.pickZone(2, 0.74, 0.44);
      else if(D.phase === 'power' && D.shooterHuman) D.stopPower();
      else if(D.phase === 'wait' && D.keeperHuman && D.keeperZone < 0) D.pickKeeper(0);
      t.simulate(1/60);
      if(f % campionaOgni === 0) impronte.push(leggi());
      continue;
    }
    const a = f * 0.037;
    const rr = 34 + 22 * Math.sin(f * 0.011);
    const x = LX + Math.cos(a) * rr, y = LY + Math.sin(a) * rr;
    if(!giu){ Touch5.start(idL, LX, LY); giu = true; }
    else Touch5.move(idL, x, y);
    if(f % 97 === 96){ Touch5.chiudi(idL, false); giu = false; idL += 2; }
    if(f % 71 === 0 && !giuB){ Touch5.start(idB, grande.x, grande.y); giuB = true; }
    else if(giuB && f % 71 === 18){ Touch5.move(idB, grande.x - 26, grande.y - 14); }
    else if(giuB && f % 71 === 26){ Touch5.chiudi(idB, false); giuB = false; idB += 2; }
    if(f % 53 === 11){ const j = 900 + f; Touch5.start(j, piccolo.x, piccolo.y); Touch5.chiudi(j, false); }
    t.simulate(1/60);
    if(f % campionaOgni === 0) impronte.push(leggi());
  }
  if(giu) Touch5.chiudi(idL, false);
  if(giuB) Touch5.chiudi(idB, false);
  return { impronte, duello };
})`;

/* e il copione MUTO della rilettura: nessun dito, li mette il nastro —
   compreso il dischetto, dal #131 */
const MUTO = `
(function(passi, IMPR, campionaOgni){
  const t = window.__test;
  const impronte = [];
  const leggi = new Function('return ' + IMPR);
  let duello = 0;
  for(let f = 0; f < passi; f++){
    t.simulate(1/60);
    if(t.state === 'freekick') duello++;
    if(f % campionaOgni === 0) impronte.push(leggi());
  }
  return { impronte, duello };
})`;

const PARTENZA = `(function(){
  const t = window.__test;
  if(window.__save0){
    for(const k of Object.keys(t.save)) if(!(k in window.__save0)) delete t.save[k];
    for(const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
  }
  if(typeof Reg !== 'undefined') Reg.azzeraComandi();
})()`;

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

(async () => {
  if (!fs.existsSync(path.join(RADICE, PRIMA))) {
    console.error('PROVA NULLA: manca il gioco di PRIMA (' + PRIMA + ').');
    console.error('  si costruisce con:  git show main:CALCETTO-il-gioco.html > ' + PRIMA);
    process.exit(3);
  }
  const srv = await servi();
  let browser, righe = [], nulli = 0, provati = 0, conDuello = 0;
  try {
    browser = await chromium.launch();
    const apri = async (file) => {
      const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag = await ctx.newPage();
      await pag.addInitScript(semeFisso, SEME0);
      const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
      await pag.goto(`http://127.0.0.1:${srv.porta}/${file}`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
      await pag.waitForTimeout(150);
      await pag.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        if (t.save) t.save.tutorialDone = 1;
        /* L'AUDIO SI APRE QUI, come fa un pollice sulla copertina: e' la
           configurazione del gioco spedito, cioe' PRIMA che il seme si
           accenda. Il caso opposto e' misurato dalla prova E di
           _q-ment-nastro.js (_t-ment-nastro.js prima della promozione a
           cancello, 21 settembre 2026), non da qui. */
        try { Audio5.unlock(); } catch (e) {}
        window.__save0 = JSON.parse(JSON.stringify(t.save));
      });
      return { ctx, pag, ecc };
    };

    console.log('=== MOTORE_V: SI MISURA (voce #132, compito 5) ===');
    console.log('    prima  ' + PRIMA);
    console.log('    dopo   ' + CURATO);
    console.log('    ' + N_VOLUTI + ' nastri, taglia ' + TAGLIA + ', ' + PASSI + ' passi, semi da ' + SEME0);

    const A = await apri(PRIMA);        /* registra */
    const A2 = await apri(PRIMA);       /* rigioca sul gioco di PRIMA: il controllo */
    const Bp = await apri(CURATO);      /* rigioca sul gioco CURATO: la misura */

    const registra = (seme) => A.pag.evaluate(([seme, taglia, passi, IMPR, COP, PART]) => {
      const t = window.__test;
      t.fermaRegistro();
      (new Function(PART))();
      t.semina(seme);
      t.registra();
      t.startMatch(1, 1, { size: taglia, sponde: 'gabbia', miraGuidata: 'pieno' });
      const r = (new Function('return (' + COP + ')'))()(passi, IMPR, 20);
      const nastro = t.nastro();
      t.fermaRegistro();
      return { impronte: r.impronte, duello: r.duello, nastro, righe: t.registroRighe,
               gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi };
    }, [seme, TAGLIA, PASSI, IMPRONTA, COPIONE, PARTENZA]);

    const rigioca = (P, nastro, seme) => P.pag.evaluate(([nastro, seme, taglia, passi, IMPR, MUT, PART]) => {
      const t = window.__test;
      t.fermaRegistro();
      (new Function(PART))();
      t.rigioca(nastro);
      t.semina(seme);
      t.startMatch(1, 1, { size: taglia, sponde: 'gabbia', miraGuidata: 'pieno' });
      const r = (new Function('return (' + MUT + ')'))()(passi, IMPR, 20);
      return { impronte: r.impronte, duello: r.duello, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi };
    }, [nastro, seme, TAGLIA, PASSI, IMPRONTA, MUTO, PARTENZA]);

    await registra(SEME0 - 1);          /* riscaldamento, si butta */

    for (let i = 0; i < MAX_SEMI && righe.length < N_VOLUTI; i++) {
      const seme = SEME0 + i;
      provati++;
      const reg = await registra(seme);
      if (reg.duello > 0) conDuello++;
      const ctrl = await rigioca(A2, reg.nastro, seme);
      const cur = await rigioca(Bp, reg.nastro, seme);
      const kC = primoScarto(reg.impronte, ctrl.impronte);
      if (kC >= 0 || ctrl.gol.join() !== reg.gol.join() || ctrl.sorteggi !== reg.sorteggi) {
        nulli++;
        continue;
      }
      const kB = primoScarto(reg.impronte, cur.impronte);
      righe.push({
        seme, kB, reg, cur,
        uguale: kB < 0 && cur.gol.join() === reg.gol.join() && cur.sorteggi === reg.sorteggi,
      });
    }
    if (A.ecc.length || A2.ecc.length || Bp.ecc.length)
      throw new Error('eccezione di pagina: ' + (A.ecc[0] || A2.ecc[0] || Bp.ecc[0]));
    await A.ctx.close(); await A2.ctx.close(); await Bp.ctx.close();
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();

  const uguali = righe.filter(r => r.uguale);
  const diversi = righe.filter(r => !r.uguale);

  console.log('  semi provati ' + provati + ', dichiarati nulli dal controllo ' + nulli +
    ', misurati ' + righe.length + ' (di cui passati dal dischetto ' + conDuello + ')');
  if (righe.length) {
    const r0 = righe[0];
    console.log('  esempio: seme ' + r0.seme + ', ' + r0.reg.righe + ' comandi, ' +
      r0.reg.gol.join('-') + ', ' + r0.reg.sorteggi + ' sorteggi, ' + r0.reg.impronte.length + ' campioni');
  }
  for (const d of diversi)
    console.log('  SCARTO seme ' + d.seme + ': campione ' + d.kB + ' (passo ' + (d.kB * 20) + '), ' +
      d.reg.gol.join('-') + ' contro ' + d.cur.gol.join('-') + ', ' +
      d.reg.sorteggi + ' sorteggi contro ' + d.cur.sorteggi);

  if (righe.length < N_VOLUTI) {
    console.error('\nPROVA NULLA: misurati solo ' + righe.length + ' nastri su ' + N_VOLUTI +
      ' voluti (provati ' + provati + ' semi, ' + nulli + ' nulli).');
    console.error('  Una misura piu\' corta di quella dichiarata non si trascrive da nessuna parte.');
    process.exit(3);
  }

  di(uguali.length === righe.length,
    'I nastri del gioco di prima, rigiocati sul curato, danno la stessa partita',
    uguali.length + ' su ' + righe.length + ' identici (impronta, punteggio e conto dei sorteggi)');

  console.log('');
  if (uguali.length === righe.length) {
    console.log('VERDETTO — MOTORE_V RESTA 2.');
    console.log('  ' + righe.length + ' nastri su ' + righe.length + ' registrati sul gioco di prima e rigiocati');
    console.log('  sul curato danno la stessa partita, campione per campione. Le cinque cure sono');
    console.log('  additive: per un nastro vecchio il codice nuovo non gira mai.');
    process.exit(0);
  }
  console.log('VERDETTO — MOTORE_V DEVE SALIRE A 3.');
  console.log('  ' + diversi.length + ' nastri su ' + righe.length + ' danno una partita diversa: un nastro');
  console.log('  vecchio rigiocato oggi userebbe gli stessi comandi su un motore che si comporta');
  console.log('  diversamente, e va rifiutato con causa vera invece che rigiocato storto.');
  process.exit(1);
})();
