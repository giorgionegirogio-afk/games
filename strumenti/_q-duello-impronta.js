/* =====================================================================
   _q-duello-impronta.js — L'IMPRONTA CHE NON GUARDA IL NASTRO
   (voce #131, compito 0: la rete di sicurezza, congelata PRIMA di
   toccare qualunque cosa).

   PROMOSSO A CANCELLO DI QUALITA' (21 settembre 2026, voce #131,
   correzione di revisione): si chiamava _t-duello-impronta.js, un
   attrezzo di compito. Nessun _t-duello-* era registrato in
   strumenti/tutti.js, e il commento accanto a MOTORE_V nel gioco
   promette «si rimisura con quello strumento il giorno che qualcuno
   tocchi di nuovo il duello» — un'istruzione a memoria senza cancello
   dietro, proprio mentre l'onda D sta per rientrare nel duello col
   GIUDICE (voce #133). Rinominato (git mv) e registrato in tutti.js con
   conta:true: 3,1 secondi di corsa, misurati, non lento.

   PERCHE' ESISTE. Nel cantiere #131 registrazione e riproduzione del
   duello sono la STESSA riga di codice: ogni gancio piantato dentro il
   dischetto e' un tocco alla fisica del dischetto. E un errore di UN
   fotogramma non da' un test rosso vistoso — da' un giudice che
   condanna innocenti. Misurato nel dossier: spostare stopPower di un
   solo aggiornamento (16,7 ms) cambia il 5% degli esiti, il conto dei
   sorteggi in 5 partite su 40 e il PUNTEGGIO FINALE in 2 su 40.

   QUESTO BANCO NON GUARDA IL NASTRO. Non registra, non rigioca, non
   sa nemmeno che il registro esiste: misura il DUELLO NUDO a seme
   fisso e ne congela l'impronta. Se dopo una cura l'impronta si muove
   di un numero, la cura ha cambiato il gioco — anche se tutti i test
   nuovi sono verdi.

   LE DUE PROVE, e servono tutte e due.
     A) CPU CONTRO CPU. Nessun dito: la serie dal dischetto si gioca da
        sola. E' il percorso in cui Duel.update chiama DA SE' pickZone,
        stopPower e pickKeeper — cioe' la trappola B del dossier (il
        ripiego del portiere a cpuT=3,0 gira anche col portiere umano).
     B) UMANO A COPIONE. G.cpu resta [false,true] (modalita' un
        giocatore, dove MISURATO ogni duello ha un umano dentro:
        169/169) e le tre decisioni si chiamano dal banco a un numero
        FISSO di aggiornamenti dall'inizio del duello — un dito
        deterministico. E' l'unico modo di rendere ripetibile un
        percorso che dal vivo non lo e', ed e' il percorso che le porte
        del compito 4 avvolgeranno.

   I NUMERI CON CUI VIENE FIRMATO OGNI DUELLO: esito, cursore a CINQUE
   decimali (il cursore e' il numero che stopPower legge all'istante:
   un aggiornamento vale il 10-20% della banda, quindi e' il campo piu'
   sensibile che esista qui dentro), powerQ a cinque decimali, il terzo
   scelto, il terzo del portiere, il passo dell'aggiornamento e il
   conto dei sorteggi a quell'istante. In coda: punteggio finale,
   fotogrammi e sorteggi totali.

   I VALORI u,v DEL COPIONE HANNO CINQUE DECIMALI APPOSTA. Il compito 3
   quantizza u,v a un millesimo ALLA SORGENTE (duelMira), che il copione
   non attraversa: se un giorno qualcuno quantizzasse dentro pickZone
   invece, questi decimali lo farebbero vedere subito.

   uso:
     node strumenti/_q-duello-impronta.js --salva strumenti/duello-impronta.json
     node strumenti/_q-duello-impronta.js            (confronta con la copia congelata)
     node strumenti/_q-duello-impronta.js --gioco fuori/x.html

   esce 0 se l'impronta combacia, 1 se si e' mossa, 2 se il banco esplode,
   3 se non c'e' niente da confrontare (prova nulla).
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
/* l'impronta congelata sta in strumenti/ e non in strumenti/_z-dati/
   perche' _z-dati e' nel .gitignore: un riferimento che non viaggia col
   repo non e' un riferimento, e' un ricordo di questa macchina */
const CONGELATA = path.resolve(RADICE, arg('contro', 'strumenti/duello-impronta.json'));
const SALVA = arg('salva', null);

/* i semi sono TRE apposta: una sola serie dal dischetto puo' finire in
   quattro tiri, e quattro duelli non bastano a smascherare uno scarto
   del 5% */
const SEMI = [20260921, 20260922, 20260923];
const TAGLIA = 5, MAXF = 24000;

/* IL COPIONE DEL DITO — fisso, dichiarato, con cinque decimali. */
const COPIONE = {
  passoZone: 30,      /* mezzo secondo dopo l'inizio: il mirino e' posato */
  passoPower: 45,     /* il cursore ha fatto 0,8625 di corsa */
  attesaKeeper: 15,   /* aggiornamenti dopo l'ingresso in 'wait' */
  mire: [
    { z: 0, u: -0.73146, v: 0.34271 },
    { z: 2, u: 0.81037, v: 0.62918 },
    { z: 1, u: 0.11204, v: 0.48663 },
    { z: 2, u: 1.04592, v: 0.25107 },
    { z: 0, u: -1.11873, v: 0.71449 },
    { z: 1, u: -0.29365, v: 0.55082 },
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
   IL GIRO, DENTRO LA PAGINA. Un solo evaluate per non lasciare al banco
   il tempo di cambiare idea fra un fotogramma e l'altro.
   ===================================================================== */
function unaSerie({ seme, taglia, maxf, cpu, cop, copione }) {
  const t = window.__test;
  t.fermaRegistro && t.fermaRegistro();
  t.semina(seme);
  t.startMatch(1, 1, { size: taglia, sponde: 'gabbia', miraGuidata: 'pieno' });
  /* ORDINE SACRO: startMatch PRIMA, setCpuVsCpu DOPO (voci #107/#108) */
  if (cpu) t.setCpuVsCpu(true);
  t.rigori();

  const duelli = [];
  let nD = 1, passo = 0, fasePrec = Duel.phase, faseCorr = Duel.phase, passoFase = 0;
  let fattoZone = false, fattoPower = false, fattoKeeper = false, vistoRes = false;
  let f = 0;
  for (; f < maxf && t.state !== 'end'; f++) {
    t.simulate(1 / 60);
    const ph = Duel.phase;
    /* un duello comincia SEMPRE in 'zone': vederla dopo una fase diversa
       vuol dire che il dischetto si e' riarmato. Il fotogramma che apre
       il duello nuovo ha gia' speso il suo aggiornamento per il duello
       VECCHIO (esitoRigore gira dentro Duel.update), quindi qui il passo
       riparte da zero senza contarlo. */
    const nuovo = (ph === 'zone' && fasePrec !== 'zone');
    fasePrec = ph;
    if (nuovo) {
      nD++; passo = 0; faseCorr = ph; passoFase = 0;
      fattoZone = fattoPower = fattoKeeper = vistoRes = false;
      continue;
    }
    if (ph === 'off') continue;
    passo++;
    if (ph !== faseCorr) { faseCorr = ph; passoFase = passo; }

    /* IL DITO ARRIVA FRA DUE AGGIORNAMENTI, che e' esattamente cio' che
       succede dal vivo: il pointer del browser non cade mai dentro
       Duel.update. */
    if (cop) {
      const m = copione.mire[(nD - 1) % copione.mire.length];
      if (!fattoZone && ph === 'zone' && Duel.shooterHuman && passo >= copione.passoZone) {
        fattoZone = true; Duel.pickZone(m.z, m.u, m.v);
      } else if (!fattoPower && Duel.phase === 'power' && Duel.shooterHuman && passo >= copione.passoPower) {
        fattoPower = true; Duel.stopPower();
      } else if (!fattoKeeper && Duel.phase === 'wait' && Duel.keeperHuman && Duel.keeperZone < 0 &&
                 (passo - passoFase) >= copione.attesaKeeper) {
        fattoKeeper = true; Duel.pickKeeper(copione.tuffi[(nD - 1) % copione.tuffi.length]);
      }
    }

    if (Duel.phase === 'result' && !vistoRes) {
      vistoRes = true;
      duelli.push({
        n: nD, passo,
        esito: Duel.outcome,
        cursor: +Duel.cursor.toFixed(5),
        powerQ: +Duel.powerQ.toFixed(5),
        z: Duel.zone, kz: Duel.keeperZone,
        mirato: !!Duel.mirato,
        aimU: +Duel.aimU.toFixed(5), aimV: +Duel.aimV.toFixed(5),
        band0: +Duel.band0.toFixed(5), band1: +Duel.band1.toFixed(5),
        sorteggi: t.sorteggi,
      });
    }
  }
  return {
    seme, duelli, fotogrammi: f, stato: t.state,
    punteggio: [G.score[0], G.score[1]],
    serie: G.rigori ? { seg: G.rigori.seg.slice(), tiri: G.rigori.tiri.slice() } : null,
    sorteggi: t.sorteggi,
  };
}

/* ------------------------------------------------------- il confronto */
function primoScarto(a, b, via) {
  via = via || '';
  if (a === b) return null;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object')
    return via + ': ' + JSON.stringify(a) + ' -> ' + JSON.stringify(b);
  if (Array.isArray(a) !== Array.isArray(b)) return via + ': forma diversa';
  if (Array.isArray(a)) {
    if (a.length !== b.length) return via + '.length: ' + a.length + ' -> ' + b.length;
    for (let i = 0; i < a.length; i++) { const s = primoScarto(a[i], b[i], via + '[' + i + ']'); if (s) return s; }
    return null;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.join(',') !== kb.join(',')) return via + ': chiavi diverse';
  for (const k of ka) { const s = primoScarto(a[k], b[k], via + '.' + k); if (s) return s; }
  return null;
}

(async () => {
  const srv = await servi();
  let browser;
  let impronta;
  try {
    browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, SEMI[0]);
    const ecc = []; pag.on('pageerror', e => ecc.push(e.message));

    console.log('=== IMPRONTA DEL DUELLO — la rete che non guarda il nastro (voce #131) ===');
    console.log('    gioco ' + GIOCO + ', taglia ' + TAGLIA + ', semi ' + SEMI.join('/'));

    await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
    await pag.evaluate(() => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
      /* il salvataggio si congela: la rosa cresce fra una partita e
         l'altra e senza questo la seconda serie non e' la prima
         (lezione di _q-replay.js) */
      window.__save0 = JSON.parse(JSON.stringify(t.save));
    });

    const A = [], B = [];
    for (const seme of SEMI) {
      for (const cpu of [true, false]) {
        await pag.evaluate(() => {
          const t = window.__test;
          for (const k of Object.keys(t.save)) if (!(k in window.__save0)) delete t.save[k];
          for (const k in window.__save0) t.save[k] = JSON.parse(JSON.stringify(window.__save0[k]));
          if (typeof Reg !== 'undefined') Reg.azzeraComandi();
        });
        const r = await pag.evaluate(new Function('p', 'return (' + unaSerie.toString() + ')(p)'),
          { seme, taglia: TAGLIA, maxf: MAXF, cpu, cop: !cpu, copione: COPIONE });
        (cpu ? A : B).push(r);
      }
    }
    impronta = { versione: 1, taglia: TAGLIA, semi: SEMI, copione: COPIONE, A, B };

    if (ecc.length) { console.error('FALLITO (banco): eccezione di pagina: ' + ecc[0]); await browser.close(); srv.chiudi(); process.exit(2); }
    await ctx.close();
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    srv.chiudi();
    process.exit(2);
  }
  await browser.close(); srv.chiudi();

  const rif = (n) => n.toLocaleString('it-IT');
  for (const [nome, serie] of [['A) CPU contro CPU   ', impronta.A], ['B) umano a copione  ', impronta.B]]) {
    for (const s of serie) {
      console.log('  ' + nome + 'seme ' + s.seme + ': ' + s.duelli.length + ' duelli [' +
        s.duelli.map(d => d.esito[0]).join('') + '], ' + s.punteggio.join('-') +
        ', ' + rif(s.fotogrammi) + ' fotogrammi, ' + rif(s.sorteggi) + ' sorteggi');
    }
  }
  const nDuelli = impronta.A.concat(impronta.B).reduce((n, s) => n + s.duelli.length, 0);
  console.log('  TOTALE ' + nDuelli + ' duelli firmati');

  if (SALVA) {
    const dove = path.resolve(RADICE, SALVA);
    fs.mkdirSync(path.dirname(dove), { recursive: true });
    fs.writeFileSync(dove, JSON.stringify(impronta, null, 1));
    console.log('\nCONGELATA in ' + dove);
    process.exit(0);
  }

  if (!fs.existsSync(CONGELATA)) {
    console.error('\nPROVA NULLA: non c\'e\' nessuna impronta congelata in ' + CONGELATA +
      '\n  (si congela con --salva strumenti/duello-impronta.json)');
    process.exit(3);
  }
  const vecchia = JSON.parse(fs.readFileSync(CONGELATA, 'utf8'));
  const scarto = primoScarto(vecchia, impronta, 'impronta');
  if (scarto) {
    console.error('\nROSSO — L\'IMPRONTA SI E\' MOSSA. La cura ha cambiato il duello.');
    console.error('  primo scarto  ' + scarto);
    console.error('  Non e\' un dettaglio: un solo numero diverso qui significa che una\n' +
                  '  partita rigiocata puo\' finire con un altro punteggio.');
    process.exit(1);
  }
  console.log('\nVERDE — l\'impronta e\' quella di sempre, numero per numero (' + nDuelli + ' duelli).');
  process.exit(0);
})();
