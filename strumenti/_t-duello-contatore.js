/* =====================================================================
   _t-duello-contatore.js — L'OROLOGIO DEL DISCHETTO ESISTE E CAMMINA
   (voce #131, compito 2). Nasce ROSSO: prima della toppa i tre
   contatori non esistono.

   COSA PROVA, e non prova altro. Questo compito non cambia NESSUN
   comportamento del gioco: accende tre contatori. Percio' le prove sono
   di due specie e vanno tenute separate.

   CHE I CONTATORI CI SIANO E DICANO IL VERO:
     A) nDuello distingue tutti i duelli di una serie dal dischetto —
        mentre Reg.tick NON li distingue (e il banco lo misura, invece di
        crederci sulla parola: e' la ragione per cui questo orologio
        esiste).
     B) passo riparte da zero a ogni duello e cresce di UNO per ogni
        Duel.update, mai di piu' e mai di meno.
     C) dentroUpdate e' vero dentro Duel.update e falso appena fuori —
        anche quando Duel.update esce dal suo return anticipato (il ramo
        dei rigori, :22564), che e' il caso in cui un flag acceso a mano
        resterebbe acceso per sempre.
     D) nDuello riparte da zero quando comincia un nastro (Reg.accendi e
        Reg.deserializza), non quando comincia una partita.

   CHE NON ABBIANO CAMBIATO NIENTE:
     E) il conto dei sorteggi e Reg.tick a fine partita sono identici a
        quelli del gioco di prima. Serve --prima <file>: senza, questa
        prova si dichiara NON MISURATA invece di darsi ragione da sola.
        (La prova larga sta in _t-duello-impronta.js, 44 duelli.)

   uso:  node strumenti/_t-duello-contatore.js
         node strumenti/_t-duello-contatore.js --prima fuori/gioco-131-base.html
   esce 0 verde, 1 rosso, 2 banco esploso.
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
const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
const PRIMA = arg('prima', null);
const SEME = 20260921, TAGLIA = 5, MAXF = 24000;

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

/* =====================================================================
   UN GIRO. Si gioca una serie dal dischetto CPU contro CPU (nessun dito:
   i contatori non dipendono da chi tocca) e si guarda l'orologio a ogni
   fotogramma.
   ===================================================================== */
function unGiro({ seme, taglia, maxf, conContatori }) {
  const t = window.__test;
  t.fermaRegistro && t.fermaRegistro();
  for (const k of Object.keys(t.save)) if (!(k in window.__save0)) delete t.save[k];
  for (const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
  if (typeof Reg !== 'undefined') Reg.azzeraComandi();

  t.registra();                       /* il registro acceso: serve a leggere Reg.tick */
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia, sponde: 'gabbia', miraGuidata: 'pieno' });
  t.setCpuVsCpu(true);                /* ORDINE SACRO: startMatch prima */
  const nDuelloDopoAccendi = conContatori ? Duel.nDuello : null;
  /* DUE SECONDI DI PARTITA VERA PRIMA DEL DISCHETTO, e non sono un
     capriccio: senza, Reg.tick varrebbe zero per tutta la corsa e la
     prova «il tick sta fermo durante il duello» sarebbe vera per il
     motivo sbagliato (non e' mai partito). Cosi' invece il tick arriva a
     un numero suo, e poi si vede congelare. */
  for (let i = 0; i < 120; i++) t.simulate(1 / 60);
  const tickPrimaDelDischetto = Reg.tick;
  t.rigori();

  /* CHE dentroUpdate SIA VERO DENTRO E FALSO FUORI si misura da dentro:
     ci si appende a una funzione che il motore del duello chiama DA SE'
     (pickKeeper, il ripiego del portiere a :22501) e a una che nessuno
     chiama dal motore. La spia non cambia niente: legge e basta. */
  const spia = { dentroVisto: [], fuoriVisto: [] };
  if (conContatori) {
    const veroPK = Duel.pickKeeper;
    Duel.pickKeeper = function (z) { spia.dentroVisto.push(!!Duel.dentroUpdate); return veroPK.call(this, z); };
    window.__spiaVera = veroPK;
  }

  const duelli = [];
  let nD = 0, passi = 0, fasePrec = Duel.phase, vistoRes = false;
  let passoVistoMax = 0, saltiPasso = 0, passoPrec = conContatori ? Duel.passo : 0;
  let tickDuello = new Set(), nDuelloVisti = new Set();
  let f = 0;
  for (; f < maxf && t.state !== 'end'; f++) {
    const eraDuello = (G.scene === 'freekick');
    t.simulate(1 / 60);
    if (conContatori) spia.fuoriVisto.push(!!Duel.dentroUpdate);
    const ph = Duel.phase;
    const nuovo = (ph === 'zone' && fasePrec !== 'zone');
    fasePrec = ph;
    if (nuovo) { nD++; vistoRes = false; }
    if (ph === 'off') { passoPrec = conContatori ? Duel.passo : 0; continue; }
    passi++;
    if (conContatori) {
      /* il passo deve crescere di UNO per aggiornamento, e ripartire da
         zero quando il duello riparte */
      if (!nuovo && eraDuello && Duel.passo !== passoPrec + 1) saltiPasso++;
      passoPrec = Duel.passo;
      if (Duel.passo > passoVistoMax) passoVistoMax = Duel.passo;
      tickDuello.add(Reg.tick);
      nDuelloVisti.add(Duel.nDuello);
    }
    if (ph === 'result' && !vistoRes) {
      vistoRes = true;
      duelli.push({
        n: nD, esito: Duel.outcome,
        nDuello: conContatori ? Duel.nDuello : null,
        passo: conContatori ? Duel.passo : null,
        tick: Reg.tick,
      });
    }
  }
  if (conContatori && window.__spiaVera) { Duel.pickKeeper = window.__spiaVera; delete window.__spiaVera; }
  const out = {
    duelli, fotogrammi: f, stato: t.state, sorteggi: t.sorteggi, tickFine: Reg.tick,
    punteggio: [G.score[0], G.score[1]], passi, tickPrimaDelDischetto,
    nDuelloDopoAccendi, passoVistoMax, saltiPasso,
    tickDiversi: conContatori ? tickDuello.size : null,
    nDuelliDiversi: conContatori ? nDuelloVisti.size : null,
    dentroVisto: spia.dentroVisto, fuoriVisto: spia.fuoriVisto.filter(Boolean).length,
    dentroUpdateFuori: conContatori ? !!Duel.dentroUpdate : null,
  };
  t.fermaRegistro();
  return out;
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };
const nonMisurato = (nome, perche) => console.log('  ??  ' + nome + '\n         NON MISURATA: ' + perche);

(async () => {
  const srv = await servi();
  let browser, r, base = null;
  try {
    browser = await chromium.launch();
    const giraSu = async (file, conContatori) => {
      const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag = await ctx.newPage();
      await pag.addInitScript(semeFisso, SEME);
      const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
      await pag.goto(`http://127.0.0.1:${srv.porta}/${file}`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await pag.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        if (t.save) t.save.tutorialDone = 1;
        window.__save0 = JSON.parse(JSON.stringify(t.save));
      });
      const ci = await pag.evaluate(() => typeof Duel !== 'undefined' && typeof Duel.nDuello === 'number' &&
        typeof Duel.dentroUpdate === 'boolean' && typeof Reg.passoDuello === 'function');
      const out = await pag.evaluate(new Function('p', 'return (' + unGiro.toString() + ')(p)'),
        { seme: SEME, taglia: TAGLIA, maxf: MAXF, conContatori: conContatori === undefined ? ci : conContatori });
      out.contatori = ci;
      if (ecc.length) throw new Error('eccezione di pagina (' + file + '): ' + ecc[0]);
      await ctx.close();
      return out;
    };

    console.log('=== L\'OROLOGIO DEL DISCHETTO — contatori (voce #131, compito 2) ===');
    console.log('    gioco ' + GIOCO + ', seme ' + SEME + ', taglia ' + TAGLIA + ', CPU contro CPU');
    r = await giraSu(GIOCO);
    if (PRIMA) base = await giraSu(PRIMA, false);
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();

  console.log('  ' + r.duelli.length + ' duelli [' + r.duelli.map(d => d.esito[0]).join('') + '], ' +
    r.punteggio.join('-') + ', ' + r.passi + ' aggiornamenti di duello, ' + r.sorteggi + ' sorteggi, tick finale ' + r.tickFine);

  if (!r.contatori) {
    di(false, 'i tre contatori esistono (Duel.nDuello, Duel.passo, Duel.dentroUpdate, Reg.passoDuello)',
      'LA TOPPA NON E\' ANCORA APPLICATA: il dischetto non ha orologio, e le prove A-D non hanno niente da misurare');
    console.log('\n0 prove su 1 — ROSSO (la cura manca)');
    process.exit(1);
  }
  di(true, 'i tre contatori esistono (Duel.nDuello, Duel.passo, Duel.dentroUpdate, Reg.passoDuello)');

  /* A) nDuello distingue, Reg.tick no — e la seconda meta' e' quella che
     giustifica l'esistenza del primo */
  di(r.nDuelliDiversi === r.duelli.length && r.duelli.length >= 4,
    'A) nDuello distingue tutti i duelli della serie',
    r.nDuelliDiversi + ' ordinali diversi per ' + r.duelli.length + ' duelli');
  di(r.tickDiversi === 1 && r.tickPrimaDelDischetto > 100,
    'A bis) Reg.tick NON li distingue — ed e\' la ragione per cui nDuello esiste',
    'il tick era arrivato a ' + r.tickPrimaDelDischetto + ' giocando, poi ' + r.tickDiversi +
    ' solo valore su ' + r.passi + ' aggiornamenti di duello e ' + r.duelli.length +
    ' duelli: si congela (in freekick frame() chiama Duel.update e non step)');

  /* B) il passo cresce di uno e riparte */
  di(r.saltiPasso === 0,
    'B) passo cresce di UNO per ogni Duel.update, mai di piu\' ne\' di meno',
    r.saltiPasso + ' salti su ' + r.passi + ' aggiornamenti');
  const passiPrimoDuello = r.duelli.length ? r.duelli[0].passo : 0;
  di(r.duelli.every(d => d.passo > 0 && d.passo < 400),
    'B bis) passo riparte a ogni duello (non e\' un contatore che cresce per tutta la partita)',
    'passo alla risoluzione: ' + r.duelli.map(d => d.passo).join(', ') +
    ' — mai cumulativi, e il massimo visto e\' ' + r.passoVistoMax);

  /* C) dentroUpdate */
  di(r.dentroVisto.length > 0 && r.dentroVisto.every(v => v === true),
    'C) dentroUpdate e\' VERO quando il motore del duello chiama da se\' (pickKeeper, il ripiego del portiere)',
    r.dentroVisto.length + ' chiamate nate dentro Duel.update, ' +
    r.dentroVisto.filter(v => v).length + ' con la spia accesa');
  di(r.fuoriVisto === 0 && r.dentroUpdateFuori === false,
    'C bis) dentroUpdate e\' FALSO fuori — anche dopo il return anticipato del ramo dei rigori',
    r.fuoriVisto + ' fotogrammi su ' + r.fotogrammi + ' con la spia rimasta accesa fuori da Duel.update');

  /* D) l'ordinale riparte col nastro */
  di(r.nDuelloDopoAccendi === 0,
    'D) nDuello riparte da zero quando comincia un nastro (Reg.accendi -> azzeraComandi)',
    'dopo registra(): nDuello = ' + r.nDuelloDopoAccendi);

  /* E) niente e' cambiato */
  if (!base) {
    nonMisurato('E) sorteggi e Reg.tick identici al gioco di prima',
      'serve --prima <file del gioco non curato>. La prova larga sta in _t-duello-impronta.js.');
  } else {
    di(base.sorteggi === r.sorteggi && base.tickFine === r.tickFine &&
       base.punteggio.join() === r.punteggio.join() && base.duelli.length === r.duelli.length &&
       base.duelli.every((d, i) => d.esito === r.duelli[i].esito && d.tick === r.duelli[i].tick),
      'E) sorteggi, Reg.tick, punteggio ed esiti identici al gioco di prima',
      'prima ' + base.sorteggi + ' sorteggi / tick ' + base.tickFine + ' / ' + base.punteggio.join('-') +
      ' [' + base.duelli.map(d => d.esito[0]).join('') + ']   dopo ' + r.sorteggi + ' / ' + r.tickFine +
      ' / ' + r.punteggio.join('-') + ' [' + r.duelli.map(d => d.esito[0]).join('') + ']');
  }

  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' +
    (rossi ? 'ROSSO' : 'VERDE: il dischetto ha un orologio, e non ha cambiato niente'));
  process.exit(rossi ? 1 : 0);
})();
