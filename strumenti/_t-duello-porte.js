/* =====================================================================
   _t-duello-porte.js — IL DUELLO ENTRA NEL NASTRO, E SOLO QUELLO CHE DEVE
   (voce #131, compito 4). Nasce ROSSO: prima della toppa il tipo 6 non
   esiste.

   LE PROVE.
     A) un duello con un umano dentro produce righe di tipo 6 — una per
        ogni decisione umana, ne' una di piu' ne' una di meno.
     B) un duello tutto CPU ne produce ZERO. E' la meta' che smaschera la
        trappola: Duel.update chiama da se' pickZone, stopPower e
        pickKeeper, e se il nastro le registrasse sarebbe pieno di righe
        anche senza che nessuno tocchi.
     C) IL RIPIEGO DEL PORTIERE NON FINISCE NEL NASTRO. E' il caso
        peggiore, perche' e' l'unico in cui il motore decide AL POSTO di
        un umano: stopPower arma cpuT=3,0 per il portiere umano
        (:22377) e allo scadere Duel.update tuffa da solo (:22501). Il
        banco costruisce apposta la situazione — portiere umano che NON
        tocca — e verifica che il tuffo avvenga (quindi il ramo e' stato
        davvero percorso) e che nel nastro non ce ne sia traccia.
     D) scritto, riletto e riscritto: lo STESSO testo. E' la prova che il
        formato a lunghezza variabile regge il giro.
     E) il conto dei sorteggi non cambia: scrivere nel nastro non tira
        dadi. Due giri sulla stessa pagina, uno col registro acceso e uno
        spento, devono dare la stessa partita.
     F) le righe portano numeri sensati: nDuello crescente, passo dentro
        la forcella misurata, mira per mille dentro il campo dichiarato.

   uso:  node strumenti/_t-duello-porte.js
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
const SEME = 20260921, TAGLIA = 5, MAXF = 24000;

const COPIONE = {
  passoZone: 30, passoPower: 45, attesaKeeper: 15,
  mire: [
    { z: 0, u: -0.731, v: 0.343 }, { z: 2, u: 0.810, v: 0.629 },
    { z: 1, u: 0.112, v: 0.487 }, { z: 2, u: 1.046, v: 0.251 },
    { z: 0, u: -1.119, v: 0.714 }, { z: 1, u: -0.294, v: 0.551 },
  ],
  tuffi: [1, 0, 2, 2, 1, 0],
};

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
   UN GIRO. `regime` dice chi tocca:
     'umano'    il copione tocca tutte e tre le porte quando tocca a lui;
     'cpu'      CPU contro CPU, nessuno tocca;
     'pigro'    modalita' un giocatore, ma il portiere umano NON tocca
                mai: e' il caso in cui il ripiego di Duel.update tuffa al
                posto suo (prova C).
   ===================================================================== */
function unGiro({ seme, taglia, maxf, regime, copione, registra }) {
  const t = window.__test;
  t.fermaRegistro && t.fermaRegistro();
  for (const k of Object.keys(t.save)) if (!(k in window.__save0)) delete t.save[k];
  for (const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
  if (typeof Reg !== 'undefined') Reg.azzeraComandi();

  if (registra) t.registra();
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia, sponde: 'gabbia', miraGuidata: 'pieno' });
  if (regime === 'cpu') t.setCpuVsCpu(true);      /* ORDINE SACRO */
  t.rigori();

  let toccate = 0, tuffiDalMotore = 0, tuffiDalMotoreUmano = 0, duelliConPortiereUmano = 0;
  const duelli = [];
  let nD = 1, passo = 0, fasePrec = Duel.phase, faseCorr = Duel.phase, passoFase = 0;
  let fattoZone = false, fattoPower = false, fattoKeeper = false, vistoRes = false, contatoGk = false;
  let f = 0;
  for (; f < maxf && t.state !== 'end'; f++) {
    const kzPrima = Duel.keeperZone, faseP = Duel.phase;
    t.simulate(1 / 60);
    /* IL TUFFO NATO DAL MOTORE si riconosce cosi': keeperZone e' passato
       da <0 a >=0 durante un Duel.update, e nessuno l'ha chiamato da
       fuori in questo fotogramma. */
    if (faseP !== 'off' && kzPrima < 0 && Duel.keeperZone >= 0 && !fattoKeeper) {
      tuffiDalMotore++;
      /* il caso che conta e' questo: il portiere e' UMANO e ha tuffato
         lo stesso, perche' i tre secondi di cpuT sono scaduti */
      if (Duel.keeperHuman) tuffiDalMotoreUmano++;
    }
    const ph = Duel.phase;
    const nuovo = (ph === 'zone' && fasePrec !== 'zone');
    fasePrec = ph;
    if (nuovo) {
      nD++; passo = 0; faseCorr = ph; passoFase = 0;
      fattoZone = fattoPower = fattoKeeper = vistoRes = contatoGk = false;
      continue;
    }
    if (ph === 'off') continue;
    passo++;
    if (ph !== faseCorr) { faseCorr = ph; passoFase = passo; }
    if (!contatoGk) { contatoGk = true; if (Duel.keeperHuman) duelliConPortiereUmano++; }

    if (regime !== 'cpu') {
      const m = copione.mire[(nD - 1) % copione.mire.length];
      if (!fattoZone && ph === 'zone' && Duel.shooterHuman && passo >= copione.passoZone) {
        fattoZone = true; toccate++; Duel.pickZone(m.z, m.u, m.v);
      } else if (!fattoPower && Duel.phase === 'power' && Duel.shooterHuman && passo >= copione.passoPower) {
        fattoPower = true; toccate++; Duel.stopPower();
      } else if (regime === 'umano' && !fattoKeeper && Duel.phase === 'wait' && Duel.keeperHuman &&
                 Duel.keeperZone < 0 && (passo - passoFase) >= copione.attesaKeeper) {
        fattoKeeper = true; toccate++; Duel.pickKeeper(copione.tuffi[(nD - 1) % copione.tuffi.length]);
      }
    }

    if (Duel.phase === 'result' && !vistoRes) {
      vistoRes = true;
      duelli.push({ n: nD, esito: Duel.outcome, kz: Duel.keeperZone, gkUmano: !!Duel.keeperHuman });
    }
  }
  const out = {
    duelli, toccate, tuffiDalMotore, tuffiDalMotoreUmano, duelliConPortiereUmano, fotogrammi: f,
    punteggio: [G.score[0], G.score[1]], sorteggi: t.sorteggi, stato: t.state,
  };
  if (registra) { out.nastro = t.nastro(); out.righe = t.registroRighe; out.rifatto = null; }
  t.fermaRegistro();
  return out;
}

function righeDelNastro(testo) {
  const p = String(testo).split('|');
  const pezzi = (p.length >= 4 ? p[3] : p[2]) || '';
  const out = [];
  for (const pz of pezzi.split(';')) {
    if (!pz) continue;
    const v = pz.split(',').map(Number);
    out.push({ tipo: v[1], arg: v.slice(3) });
  }
  return out;
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

(async () => {
  const srv = await servi();
  let browser, umano, cpu, pigro, spento, giro;
  try {
    browser = await chromium.launch();
    const apri = async () => {
      const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag = await ctx.newPage();
      await pag.addInitScript(semeFisso, SEME);
      const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
      await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await pag.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        if (t.save) t.save.tutorialDone = 1;
        window.__save0 = JSON.parse(JSON.stringify(t.save));
      });
      return { ctx, pag, ecc };
    };
    const A = await apri();
    giro = (p) => A.pag.evaluate(new Function('p', 'return (' + unGiro.toString() + ')(p)'), p);
    const base = { seme: SEME, taglia: TAGLIA, maxf: MAXF, copione: COPIONE };
    await giro({ ...base, regime: 'umano', registra: false });     /* riscaldamento, si butta */
    umano = await giro({ ...base, regime: 'umano', registra: true });
    cpu = await giro({ ...base, regime: 'cpu', registra: true });
    pigro = await giro({ ...base, regime: 'pigro', registra: true });
    spento = await giro({ ...base, regime: 'umano', registra: false });
    /* il riletto-e-riscritto, su una pagina fresca */
    const B = await apri();
    umano.rifatto = await B.pag.evaluate(n => { window.__test.rigioca(n); return window.__test.nastro(); }, umano.nastro);
    if (A.ecc.length || B.ecc.length) throw new Error('eccezione di pagina: ' + (A.ecc[0] || B.ecc[0]));
    await A.ctx.close(); await B.ctx.close();
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();

  console.log('=== LE TRE PORTE DEL DISCHETTO (voce #131, compito 4) ===');
  console.log('    gioco ' + GIOCO + ', seme ' + SEME + ', taglia ' + TAGLIA);
  const conta = (r) => { const c = {}; for (const x of righeDelNastro(r.nastro)) c[x.tipo] = (c[x.tipo] || 0) + 1; return c; };
  const cU = conta(umano), cC = conta(cpu), cP = conta(pigro);
  console.log('    umano: ' + umano.duelli.length + ' duelli, ' + umano.toccate + ' decisioni umane, righe ' +
    Object.keys(cU).sort().map(k => k + '=' + cU[k]).join(' '));
  console.log('    CPU:   ' + cpu.duelli.length + ' duelli, ' + cpu.toccate + ' decisioni umane, righe ' +
    Object.keys(cC).sort().map(k => k + '=' + cC[k]).join(' '));
  console.log('    pigro: ' + pigro.duelli.length + ' duelli, ' + pigro.toccate + ' decisioni umane, ' +
    pigro.tuffiDalMotore + ' tuffi decisi dal motore, righe ' +
    Object.keys(cP).sort().map(k => k + '=' + cP[k]).join(' '));

  di((cU['6'] | 0) > 0,
    'A) un duello con un umano dentro produce righe di tipo 6',
    (cU['6'] | 0) + ' righe di tipo 6' + ((cU['6'] | 0) ? '' : ' — il tipo 6 non esiste ancora'));
  di((cU['6'] | 0) === umano.toccate,
    'A bis) una riga per decisione umana, ne\' una di piu\' ne\' una di meno',
    (cU['6'] | 0) + ' righe contro ' + umano.toccate + ' decisioni');

  di((cC['6'] | 0) === 0 && cpu.duelli.length >= 4,
    'B) un duello tutto CPU non scrive NIENTE nel nastro',
    cpu.duelli.length + ' duelli CPU contro CPU, ' + (cC['6'] | 0) + ' righe di tipo 6' +
    ((cC['6'] | 0) ? ' — il motore sta registrando le proprie chiamate' : ''));

  /* IL NUMERO CHE CONTA E' tuffiDalMotoreUmano, non tuffiDalMotore: anche
     il portiere della CPU tuffa dal motore, e contarli insieme farebbe
     passare questa prova anche se il caso peggiore non fosse mai
     capitato. */
  di(pigro.tuffiDalMotoreUmano > 0 && pigro.duelliConPortiereUmano > 0,
    'C) il caso peggiore e\' stato davvero percorso: il portiere UMANO non ha toccato e il motore ha tuffato per lui',
    pigro.duelliConPortiereUmano + ' duelli col portiere umano, ' + pigro.tuffiDalMotoreUmano +
    ' tuffi decisi da Duel.update col portiere UMANO (il ripiego a cpuT=3,0), su ' +
    pigro.tuffiDalMotore + ' tuffi dal motore in tutto');
  const verbi = righeDelNastro(pigro.nastro).filter(x => x.tipo === 6).map(x => x.arg[2]);
  di(verbi.filter(v => v === 2).length === 0,
    'C bis) e nel nastro non c\'e\' traccia di quei tuffi (nessun verbo 2)',
    verbi.filter(v => v === 2).length + ' righe di tuffo su ' + verbi.length + ' righe di duello' +
    ' — se ce ne fossero, in rilettura keeperZone si fisserebbe per primo e il dado() del ripiego non si consumerebbe');

  di(umano.rifatto === umano.nastro,
    'D) scritto, riletto e riscritto: lo stesso testo',
    umano.rifatto === umano.nastro ? Buffer.byteLength(umano.nastro, 'utf8') + ' byte, identici al secondo giro'
      : 'il testo cambia al secondo giro');

  di(spento.sorteggi === umano.sorteggi && spento.punteggio.join() === umano.punteggio.join() &&
     spento.duelli.length === umano.duelli.length &&
     spento.duelli.every((d, i) => d.esito === umano.duelli[i].esito),
    'E) registrare non tira un dado: stessa partita col registro acceso e spento',
    'acceso ' + umano.sorteggi + ' sorteggi / ' + umano.punteggio.join('-') + ' [' + umano.duelli.map(d => d.esito[0]).join('') + ']' +
    '   spento ' + spento.sorteggi + ' / ' + spento.punteggio.join('-') + ' [' + spento.duelli.map(d => d.esito[0]).join('') + ']');

  /* F) i numeri delle righe hanno senso */
  const rg = righeDelNastro(umano.nastro).filter(x => x.tipo === 6).map(x => x.arg);
  let male = [];
  let nPrec = 0;
  for (const a of rg) {
    const [nD, passo, verbo] = a;
    if (nD < nPrec) male.push('nDuello torna indietro: ' + nPrec + ' -> ' + nD);
    nPrec = nD;
    if (!(passo >= 0 && passo < 400)) male.push('passo fuori forcella: ' + passo);
    if (![0, 1, 2].includes(verbo)) male.push('verbo sconosciuto: ' + verbo);
    if (verbo === 0 && a.length === 6) {
      if (!(a[4] >= -1258 && a[4] <= 1258)) male.push('u fuori campo: ' + a[4]);
      if (!(a[5] >= 0 && a[5] <= 1000)) male.push('v fuori campo: ' + a[5]);
    }
    if (verbo === 1 && a.length !== 3) male.push('stopPower con argomenti di troppo: ' + a.length);
    if (verbo === 2 && a.length !== 4) male.push('pickKeeper con argomenti sbagliati: ' + a.length);
  }
  di(rg.length > 0 && male.length === 0,
    'F) le righe portano numeri sensati (nDuello crescente, passo in forcella, mira nel campo dichiarato)',
    rg.length ? (male.length ? male.slice(0, 3).join('; ') : rg.length + ' righe controllate, nDuello fino a ' + nPrec)
              : 'nessuna riga di tipo 6 da controllare');

  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' +
    (rossi ? 'ROSSO' : 'VERDE: il duello entra nel nastro, e solo quello che deve'));
  process.exit(rossi ? 1 : 0);
})();
