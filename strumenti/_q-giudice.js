/* =====================================================================
   _q-giudice.js — IL BANCO CHE CONDANNA IL GIUDICE
   (voce #133, compito 1). Nasce ROSSO: `window.__test.giudica` non
   esiste ancora.

   CHE COSA MISURA. Il mandato (S10.5) chiede il verificatore differito
   delle sfide: rigiocare il nastro di una partita e confermarne il
   punteggio, cosi' che «la classifica si ripulisce da sola» smetta di
   essere una promessa architetturale. La capacita' c'e' gia' dentro
   Sfida.guarda, ma sta dentro a una schermata: la voce #133 la rende
   chiamabile SENZA SCHERMO come giudica(nastro, atteso, opz), e questo
   banco e' quello che dice se il giudice e' un giudice o un timbro.

   I CINQUE VERDETTI, e uno solo puo' muovere punti:
     TORNA         il punteggio rigiocato coincide con quello dichiarato
     NON TORNA     coincide male — l'unico che puo' togliere punti
     INCOMPLETO    il nastro non basta a decidere
     ALTRO MOTORE  MOTORE_V diverso: causa vera, nessun accusato
     NON FINISCE   la rigiocata non arriva alla fine entro il tetto

   PERCHE' TRE PAGINE E NON DUE. Una sfida si registra solo attaccando e
   si rivede solo difendendo (da qui le due pagine di
   _sfida-due-telefoni.js). Il GIUDICE pero' non e' nessuno dei due: e'
   un browser che apre il file e basta. La terza pagina non si collega al
   server, non entra, non gioca: ha la rosa vergine del salvataggio nuovo
   — cioe' una rosa DIVERSA da tutte e due quelle della partita. Se il
   giudice leggesse il profilo vivo invece del nastro, su quella pagina
   ogni verdetto sarebbe NON TORNA. E' la lezione della voce #131, dove
   una prova passava sia col gioco giusto sia col falso perche' leggeva
   un contatore su una pagina che non aveva mai giocato: qui la pagina
   che non ha mai giocato e' il punto, non l'errore.

   LE PROVE
     A) forma: giudica e' una funzione e torna un verdetto della tavola;
     B) TORNA sul nastro vero col punteggio vero, sulla pagina GIUDICE;
     B2) e lo stesso sulla pagina del DIFENSORE, che ha una rosa sua:
         la prova che le rose escono dal nastro e non dal profilo vivo;
     C) NON TORNA col punteggio gonfiato di un gol;
     D) INCOMPLETO/nastro-vuoto;
     E) INCOMPLETO/nastro-troncato (nastro tagliato e marchiato);
     F) INCOMPLETO/rose-assenti (testa di tipo 7 tolta);
     G) ALTRO MOTORE (versione in testa portata a 99);
     H) NON TORNA con un ALTRO seme — la prova che il giudice RIGIOCA
        invece di leggere il punteggio da qualche parte;
     I) NON FINISCE con un tetto piu' stretto del dovuto;
     J) ripetibile: due chiamate danno lo stesso verdetto, gli stessi
        gol e lo stesso numero di passi;
     K) il tetto di serie e' tettoFotogrammi(taglia) di _q-invarianti.js,
        taglia per taglia (5, 7, 11) — non un numero fisso;
     L) il giudice non muove niente: salvataggio, punti e coda uguali
        prima e dopo una raffica di giudizi;
     M) i cinque verdetti sono DISTINTI fra loro — un banco che non li
        distingue attesta invece di misurare.

   LA PROVA CHE PUO' NON ESERCITARSI. Il caso INCOMPLETO/duello-senza-
   righe (la rigiocata arriva a un calcio piazzato di cui il nastro non
   ha i comandi) si costruisce da un nastro che ABBIA righe di tipo 6, e
   col copione fisso una sfida su trenta ci passa (misurato dalla voce
   #132). Se nessuna delle sfide giocate qui ne ha una, la prova si
   dichiara NON ESERCITATA e non si conta: un controllo che passa perche'
   non ha trovato niente da guardare e' un timbro.

   uso:  node strumenti/_q-giudice.js
         node strumenti/_q-giudice.js --gioco fuori/falso.html
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se il gioco indicato non ha la schermata della sfida o se le sfide
   non arrivano al fischio finale (prova non fatta).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');
const { tettoFotogrammi } = require('./_q-invarianti.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
/* due sfide: una fa da metro, la seconda alza la probabilita' di
   incontrare un duello (la prova che puo' non esercitarsi) */
const N_SFIDE = parseInt(arg('sfide', '2'), 10);

const VERDETTI = ['TORNA', 'NON TORNA', 'INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE'];

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
const info = (nome, det) => console.log('  --  ' + nome + (det ? '  [' + det + ']' : ''));

/* il giudizio, dalla parte di chi non ha giocato */
const giudizio = (P, nastro, atteso, opz) => P.pag.evaluate(([n, a, o]) => {
  const t = window.__test;
  if (typeof t.giudica !== 'function') return { manca: true };
  try {
    const r = t.giudica(n, a, o);
    return Object.assign({ manca: false }, r && typeof r === 'object' ? r : { verdetto: String(r) });
  } catch (e) { return { manca: false, eccezione: e.message }; }
}, [nastro, atteso, opz]);

const fotoStato = P => P.pag.evaluate(() => ({
  save: JSON.stringify(window.__test.save),
  rete: JSON.stringify(window.__test.reteStato()),
}));

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  let browser;
  const sfide = [];
  let r = {};            /* tutti i giudizi raccolti */
  let primaG = null, dopoG = null, primaB = null, dopoB = null;
  try {
    browser = await chromium.launch();
    console.log('=== IL GIUDICE — cinque verdetti, e uno solo muove punti (voce #133) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', taglia 5, ' + N_SFIDE + ' sfide vere\n');

    const Bt = await B.apri(browser, sg.porta);
    const At = await B.apri(browser, sg.porta);
    const c = await At.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida') }));
    if (!c.schermata) {
      console.error('PROVA NULLA: questo gioco non ha la schermata della sfida.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    await B.collega(Bt, ss.porta, 'BORGATA');
    await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(Bt); await B.entra(At);
    await B.pubblica(Bt); await B.pubblica(At);

    for (let i = 0; i < N_SFIDE; i++) {
      const s = await B.giocaUna(At, ss, [], 24000, 0);
      if (s.partita && s.riga) sfide.push(s);
    }

    /* =================================================================
       LA TERZA PAGINA: IL GIUDICE. Non si collega, non entra, non gioca.
       La sua rosa e' quella del salvataggio vergine, cioe' DIVERSA da
       tutte e due quelle della partita.

       E LE SUE IMPOSTAZIONI LOCALI SONO QUELLE SBAGLIATE APPOSTA: sponde
       a CAMPO VERO e mira ESSENZIALE, l'opposto di quello che una sfida
       forza (`sponde:'gabbia'`, `miraGuidata:'pieno'`, vedi Sfida.gioca
       e Sfida.guarda). Sono due impostazioni del TELEFONO, e un giudice
       che le seguisse rigiocherebbe il nastro su un motore diverso da
       quello con cui la partita fu giocata: direbbe NON TORNA per colpa
       del motore invece che per colpa della rosa, cioe' toglierebbe
       punti a un innocente. Da qui in poi la prova B non prova solo che
       il giudice funziona: prova il primo punto del contratto.
       ================================================================= */
    const Gt = await B.apri(browser, sg.porta);
    await Gt.pag.evaluate(() => {
      const t = window.__test;
      t.save.sponde = 'campo';
      t.save.miraGuidata = 'essenziale';
      t.save.teamName = 'GIUDICE';
    });

    if (!sfide.length) throw new Error('nessuna sfida arrivata al fischio finale');
    for (const s of sfide) s.crudo = N.allarga(s.riga.replay);
    const s0 = sfide[0];
    const nastro = s0.crudo;
    if (!nastro || nastro.indexOf('|') < 0) throw new Error('il nastro non si e\' allargato');
    const atteso = [s0.riga.gol_a | 0, s0.riga.gol_d | 0];
    const opz = { seme: s0.riga.seme, taglia: s0.riga.taglia | 0 };

    primaG = await fotoStato(Gt);
    primaB = await fotoStato(Bt);

    r.torna     = await giudizio(Gt, nastro, atteso, opz);
    r.tornaDif  = await giudizio(Bt, nastro, atteso, opz);
    r.gonfio    = await giudizio(Gt, nastro, [atteso[0] + 1, atteso[1]], opz);
    r.vuoto     = await giudizio(Gt, N.vuoto(nastro), atteso, opz);
    r.mozzo     = await giudizio(Gt, N.mozzato(nastro), atteso, opz);
    r.marchio   = await giudizio(Gt, N.marchiato(nastro), atteso, opz);
    r.illegg    = await giudizio(Gt, N.illeggibile(nastro), atteso, opz);
    const senza = N.senzaRose(nastro);
    r.rose      = senza ? await giudizio(Gt, senza, atteso, opz) : { saltata: true };
    r.motore    = await giudizio(Gt, N.altroMotore(nastro), atteso, opz);
    r.seme      = await giudizio(Gt, nastro, atteso, { seme: String(opz.seme) + '7', taglia: opz.taglia });
    r.stretto   = await giudizio(Gt, nastro, atteso, { seme: opz.seme, taglia: opz.taglia, tetto: 300 });
    r.bis1      = await giudizio(Gt, nastro, atteso, opz);
    r.bis2      = await giudizio(Gt, nastro, atteso, opz);
    r.t5        = await giudizio(Gt, '1|2||', [0, 0], { seme: '1', taglia: 5 });
    r.t7        = await giudizio(Gt, '1|2||', [0, 0], { seme: '1', taglia: 7 });
    r.t11       = await giudizio(Gt, '1|2||', [0, 0], { seme: '1', taglia: 11 });

    /* la prova che puo' non esercitarsi: serve un nastro con righe di
       tipo 6, cioe' una sfida passata da un calcio piazzato */
    let conDuello = null;
    for (const s of sfide) { const z = N.senzaDuelli(s.crudo || ''); if (z) { conDuello = { s, z }; break; } }
    r.duello = conDuello
      ? await giudizio(Gt, conDuello.z, [conDuello.s.riga.gol_a | 0, conDuello.s.riga.gol_d | 0],
                       { seme: conDuello.s.riga.seme, taglia: conDuello.s.riga.taglia | 0 })
      : { saltata: true };

    dopoG = await fotoStato(Gt);
    dopoB = await fotoStato(Bt);

    /* =================================================================
       LO SCHERMO (voce #133, compito 3). Il nastro porta i tocchi in
       COORDINATE DI SCHERMO, e dove finisce un tocco lo decidono
       touchBtnLayout e SCALE/OX/OY, che vengono da innerWidth/
       innerHeight. Su uno schermo diverso lo stesso nastro e' un'altra
       partita — misurato, 800x360 contro 915x412: 0-3 dove il tabellone
       dice 3-4. Il giudice deve RIFIUTARSI, non accusare. */
    r.schermo = { dentroNastro: N.schermoDi(nastro) };
    const Gs = await B.apri(browser, sg.porta, { width: 800, height: 360 });
    r.altroSchermo = await giudizio(Gs, nastro, atteso, opz);
    await Gs.ctx.close();

    if (At.errori.length || Bt.errori.length || Gt.errori.length)
      throw new Error('eccezione di pagina: ' + (At.errori[0] || Bt.errori[0] || Gt.errori[0]));
    await At.ctx.close(); await Bt.ctx.close(); await Gt.ctx.close();
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    sg.chiudi(); ss.chiudi(); process.exit(2);
  }
  await browser.close(); sg.chiudi(); ss.chiudi();

  if (!sfide.length) { console.error('PROVA NULLA: nessuna sfida e\' arrivata al fischio finale.'); process.exit(3); }

  const s0 = sfide[0];
  for (const s of sfide)
    console.log('  sfida seme ' + s.riga.seme + ' taglia ' + s.riga.taglia + ': ' + s.fine.score.join('-') +
      ', ' + s.fine.righe + ' comandi in ' + s.fine.passi + ' passi, tipi [' +
      [...new Set(String(s.fine.tipi).split(''))].sort().join('') + '], nastro ' + String(s.riga.replay).length +
      ' byte stretto / ' + String(s.crudo || '').length + ' crudo');
  console.log('');

  const v = x => (x && x.manca) ? 'ASSENTE' : (x && x.eccezione) ? ('ECCEZIONE ' + x.eccezione) : (x && x.saltata) ? '—' : String(x && x.verdetto);
  const g = x => (x && Array.isArray(x.gol)) ? x.gol.join('-') : '—';

  /* ---- A) la forma ------------------------------------------------- */
  const tuttiOggetti = [r.torna, r.gonfio, r.vuoto, r.mozzo, r.motore, r.seme, r.stretto];
  const formaOk = tuttiOggetti.every(x => x && !x.manca && !x.eccezione && VERDETTI.includes(x.verdetto));
  di(formaOk, 'A) giudica() esiste e torna sempre un verdetto della tavola dei cinque',
     tuttiOggetti.map(v).join(' · '));

  /* ---- B) TORNA ----------------------------------------------------- */
  di(v(r.torna) === 'TORNA' && g(r.torna) === s0.fine.score.join('-'),
     'B) il nastro vero TORNA su una pagina mai giocata, con sponde CAMPO VERO e mira ESSENZIALE',
     v(r.torna) + ', rigiocata ' + g(r.torna) + ' contro ' + s0.fine.score.join('-') +
     ', ' + (r.torna && r.torna.passi) + ' passi su un tetto di ' + (r.torna && r.torna.tetto));

  di(v(r.tornaDif) === 'TORNA',
     'B2) e TORNA anche sul telefono del DIFENSORE, che ha una rosa sua (le rose escono dal nastro)',
     v(r.tornaDif) + ', rigiocata ' + g(r.tornaDif));

  /* ---- C) NON TORNA ------------------------------------------------- */
  di(v(r.gonfio) === 'NON TORNA',
     'C) lo stesso nastro col punteggio gonfiato di un gol da\' NON TORNA',
     v(r.gonfio) + ', dichiarato ' + (atteso0(s0)[0] + 1) + '-' + atteso0(s0)[1] + ', rigiocata ' + g(r.gonfio));

  /* ---- D/E/F) INCOMPLETO, con la causa giusta ------------------------ */
  di(v(r.vuoto) === 'INCOMPLETO' && r.vuoto.causa === 'nastro-vuoto',
     'D) un nastro vuoto e\' INCOMPLETO, non un\'accusa', v(r.vuoto) + '/' + (r.vuoto && r.vuoto.causa));
  di(v(r.mozzo) === 'INCOMPLETO' && r.mozzo.causa === 'nastro-troncato',
     'E) un nastro tagliato e marchiato e\' INCOMPLETO', v(r.mozzo) + '/' + (r.mozzo && r.mozzo.causa));
  di(v(r.marchio) === 'INCOMPLETO' && r.marchio.causa === 'duello-marchiato',
     'E2) un nastro col marchio del duello (tipo 5, prima della voce #131) e\' INCOMPLETO',
     v(r.marchio) + '/' + (r.marchio && r.marchio.causa));
  di(v(r.illegg) === 'INCOMPLETO' && r.illegg.causa === 'nastro-illeggibile',
     'E3) un nastro di una forma che il gioco non sa leggere e\' INCOMPLETO, non un\'accusa',
     v(r.illegg) + '/' + (r.illegg && r.illegg.causa));
  di(!r.rose.saltata && v(r.rose) === 'INCOMPLETO' && r.rose.causa === 'rose-assenti',
     'F) un nastro senza le due rose e\' INCOMPLETO: il giudice NON ripiega sul profilo vivo',
     v(r.rose) + '/' + (r.rose && r.rose.causa));

  /* ---- G) ALTRO MOTORE ---------------------------------------------- */
  di(v(r.motore) === 'ALTRO MOTORE',
     'G) un nastro di un altro motore si rifiuta con la causa vera, senza accusare nessuno',
     v(r.motore) + ', motoreV del nastro ' + (r.motore && r.motore.motoreV));

  /* ---- H) il giudice RIGIOCA ----------------------------------------- */
  di(v(r.seme) === 'NON TORNA',
     'H) con un ALTRO seme lo stesso nastro NON TORNA: il giudice rigioca, non legge',
     v(r.seme) + ', rigiocata ' + g(r.seme) + ' contro ' + s0.fine.score.join('-'));

  /* ---- I) NON FINISCE ------------------------------------------------ */
  di(v(r.stretto) === 'NON FINISCE' && (r.stretto.passi | 0) === 300,
     'I) con un tetto piu\' stretto della partita il verdetto e\' NON FINISCE, non NON TORNA',
     v(r.stretto) + ', ' + (r.stretto && r.stretto.passi) + ' passi su un tetto di ' + (r.stretto && r.stretto.tetto));

  /* ---- J) ripetibile -------------------------------------------------- */
  /* LA GUARDIA CONTRO IL VERDE GENTILE: due assenze sono uguali fra loro,
     e senza questa riga la prova passerebbe su un gioco senza giudice. */
  const ripet = r.bis1 && r.bis2 && !r.bis1.manca && VERDETTI.includes(r.bis1.verdetto) &&
    r.bis1.verdetto === r.bis2.verdetto &&
    g(r.bis1) === g(r.bis2) && (r.bis1.passi | 0) === (r.bis2.passi | 0);
  di(ripet, 'J) due chiamate sullo stesso nastro danno lo stesso verdetto, gli stessi gol e gli stessi passi',
     v(r.bis1) + ' ' + g(r.bis1) + ' ' + (r.bis1 && r.bis1.passi) + ' passi  contro  ' +
     v(r.bis2) + ' ' + g(r.bis2) + ' ' + (r.bis2 && r.bis2.passi) + ' passi');

  /* ---- K) il tetto e' quello della taglia ----------------------------- */
  const tetti = [[5, r.t5], [7, r.t7], [11, r.t11]];
  const tettoOk = tetti.every(([t, x]) => x && (x.tetto | 0) === tettoFotogrammi(t));
  di(tettoOk, 'K) il tetto di serie e\' tettoFotogrammi(taglia), taglia per taglia (voce #130)',
     tetti.map(([t, x]) => t + ':' + (x && x.tetto) + ' atteso ' + tettoFotogrammi(t)).join(' · '));

  /* ---- L) il giudice non muove niente --------------------------------- */
  /* stessa guardia della J: un giudice che non esiste non muove niente,
     e non e' una virtu' */
  const fermo = formaOk && primaG.save === dopoG.save && primaG.rete === dopoG.rete &&
                primaB.save === dopoB.save && primaB.rete === dopoB.rete;
  di(fermo, 'L) dopo una raffica di giudizi salvataggio, punti e coda sono quelli di prima',
     'giudice ' + (primaG.save === dopoG.save ? 'fermo' : 'MOSSO') + '/' + (primaG.rete === dopoG.rete ? 'fermo' : 'MOSSO') +
     ', difensore ' + (primaB.save === dopoB.save ? 'fermo' : 'MOSSO') + '/' + (primaB.rete === dopoB.rete ? 'fermo' : 'MOSSO'));

  /* ---- M) i cinque verdetti sono DISTINTI ----------------------------- */
  const visti = [...new Set([r.torna, r.gonfio, r.vuoto, r.motore, r.stretto].map(v))].sort();
  di(visti.length === 5 && VERDETTI.every(x => visti.includes(x)),
     'M) il banco vede tutti e cinque i verdetti, distinti fra loro', visti.join(' · '));

  /* ---- O/P) lo schermo, il sesto canale ------------------------------- */
  const scN = r.schermo && r.schermo.dentroNastro;
  di(!!scN && scN[0] === 915 && scN[1] === 412,
     'O) il nastro porta lo schermo su cui e\' stato registrato (riga di tipo 10)',
     (scN ? scN.join('x') : 'ASSENTE') + ', atteso 915x412');
  di(v(r.altroSchermo) === 'INCOMPLETO' && r.altroSchermo.causa === 'schermo-diverso' &&
     Array.isArray(r.altroSchermo.schermo),
     'P) su uno schermo diverso (800x360) il giudice si rifiuta e dice quale serve — MAI NON TORNA',
     v(r.altroSchermo) + '/' + (r.altroSchermo && r.altroSchermo.causa) + ', serve ' +
     ((r.altroSchermo && r.altroSchermo.schermo) ? r.altroSchermo.schermo.join('x') : '—'));

  /* ---- la prova che puo' non esercitarsi ------------------------------ */
  if (r.duello.saltata)
    info('INCOMPLETO/duello-senza-righe: NON ESERCITATA (nessuna delle ' + sfide.length +
         ' sfide e\' passata da un calcio piazzato)');
  else
    di(v(r.duello) === 'INCOMPLETO' && r.duello.causa === 'duello-senza-righe',
       'N) un nastro senza i comandi di un duello che si apre e\' INCOMPLETO',
       v(r.duello) + '/' + (r.duello && r.duello.causa));

  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})();

function atteso0(s) { return [s.riga.gol_a | 0, s.riga.gol_d | 0]; }
