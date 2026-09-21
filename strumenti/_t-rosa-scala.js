/* =====================================================================
   _t-rosa-scala.js — TRE RISPOSTE DIVERSE ALLO STESSO NUMERO
   (voce #132, compito 3). Nasce ROSSO.

   IL DIFETTO. Un attributo di rosa entra nella partita da quattro porte,
   e nessuna concorda con le altre:

     loadSave      :10170  `s.rosa=j.rosa`            nessun controllo
     setupPlayers  :10791  copia grezza               nessun controllo
     impaccaRosa   :42934  max(1,min(99, v|0))        250 -> 99, NaN -> 1
     startMatch    :11300  round, 1..99, ripiego 62   250 -> 99, NaN -> 62

   In una sfida Sfida.gioca NON passa mia.rosa (:43268): G.miaRosa resta
   null e setupPlayers legge SAVE.rosa GREZZA. Percio' la partita si
   gioca con 250 e il nastro registra 99 — registrato e rigiocato sono
   due numeri diversi, e chi rigioca non ha modo di saperlo.

   MISURATO (strumenti/_sonda-132-canali.js): un solo attributo a 250
   invece che a 99 fa divergere 5 semi su 5, primo scarto al passo 80.

   LE PROVE
     A) l'uomo in campo e l'uomo nel nastro hanno lo stesso numero;
     B) il replay finisce col punteggio dichiarato;
     C) le quattro porte danno la STESSA risposta allo stesso ingresso, e
        la risposta sta sempre in 1..99. La porta del salvataggio si
        esercita davvero: si scrive un salvataggio manomesso in
        localStorage e si RICARICA la pagina, perche' loadSave gira una
        volta sola all'avvio e chiamarla a mano non sarebbe la stessa
        cosa.

   uso:  node strumenti/_t-rosa-scala.js
         node strumenti/_t-rosa-scala.js --gioco fuori/falso.html
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se il gioco indicato non ha la schermata della sfida.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const N_SFIDE = parseInt(arg('sfide', '2'), 10);

/* I CASI. Non sono di fantasia: sono cio' che un salvataggio manomesso,
   un salvataggio di un'altra versione o un JSON storto possono contenere.
   null sta per «assente», la stringa per «non e' un numero». */
const CASI = [
  { n: 'fuori scala alto', v: 250 },
  { n: 'zero', v: 0 },
  { n: 'negativo', v: -5 },
  { n: 'assente', v: null },
  { n: 'non numero', v: 'abc' },
  { n: 'con la virgola', v: 62.5 },
  { n: 'al tetto', v: 99 },
  { n: 'al pavimento', v: 1 },
];

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  let browser;
  const righe = [];
  let porte = [];
  try {
    browser = await chromium.launch();
    console.log('=== LA SCALA DI UN ATTRIBUTO DI ROSA (voce #132, compito 3) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', ' + N_SFIDE + ' sfide\n');

    /* ================ C) LE QUATTRO PORTE, UNA PER UNA ================ */
    const P = await B.apri(browser, sg.porta);
    for (const caso of CASI) {
      /* SI SPORCA IL SALVATAGGIO VIVO E LO SI FA SCRIVERE AL GIOCO, poi
         si ricarica. Scrivere direttamente in localStorage non basta: il
         gioco persiste da se' fra un tocco e l'altro e si riscrive
         addosso il salvataggio buono prima che la pagina riparta
         (misurato: il primo giro di questo cancello leggeva 73 in tutti
         e otto i casi, cioe' non stava provando niente). */
      await P.pag.evaluate(v => {
        window.__test.save.rosa[0].vel = v;
        persistSave();
      }, caso.v);
      await P.pag.reload({ waitUntil: 'load' });
      await P.pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await P.pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
      await P.pag.waitForTimeout(80);
      const m = await P.pag.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        const salvato = t.save.rosa[0].vel;
        const nastro = impaccaRosa(t.save.rosa)[1];
        t.fermaRegistro(); t.desemina();
        t.startMatch(1, 1, { size: 5, sponde: 'gabbia', miraGuidata: 'pieno' });
        const campo = G.players[0].vel;
        /* e la porta del replay: la stessa rosa passata come opts.mia,
           che e' la strada che Sfida.guarda usa davvero */
        t.startMatch(1, 1, { size: 5, sponde: 'gabbia', miraGuidata: 'pieno',
                             mia: { rosa: t.save.rosa.map(r => Object.assign({}, r)) } });
        const replay = G.players[0].vel;
        return { salvato, nastro, campo, replay };
      });
      porte.push({ caso: caso.n, dato: JSON.stringify(caso.v), ...m });
    }
    await P.ctx.close();

    /* ============ A) e B) UNA SFIDA VERA, CON UN NUMERO FUORI SCALA ==== */
    const Bt = await B.apri(browser, sg.porta);
    const At = await B.apri(browser, sg.porta);
    const c = await At.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida') }));
    if (!c.schermata) {
      console.error('PROVA NULLA: questo gioco non ha la schermata della sfida.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    await B.collega(Bt, ss.porta, 'BORGATA');
    /* IL SALVATAGGIO STORTO DI CHI ATTACCA: due uomini fuori scala, uno
       alto e uno che non e' un numero. E' quel che resta di un
       salvataggio manomesso o di una versione precedente. */
    await B.collega(At, ss.porta, 'DOPOLAVORO',
      'rosa[1].vel = 250; rosa[2].tiro = 250; rosa[3].tackle = 250;');
    await B.entra(Bt); await B.entra(At);
    await B.pubblica(Bt); await B.pubblica(At);

    for (let k = 0; k < N_SFIDE; k++) {
      const g = await B.giocaUna(At, ss, []);
      if (!g.partita || !g.riga) { righe.push({ nullo: true }); continue; }
      const testa = await At.pag.evaluate(() => {
        const d = Reg.righe.filter(r => r[1] === 7)[0];
        if (!d) return { c7: false };
        const p1 = spaccaRosa(d, 5, []);
        return { c7: true, rosa: p1.rosa.map(x => [x.vel, x.tiro, x.tecnica, x.tackle].join('/')).join(' ') };
      });
      const r = await B.guardaUna(Bt, g.id, []);
      righe.push({
        nullo: false, seme: g.via.seme,
        campo: g.via.attrMiei, nastro: testa.c7 ? testa.rosa : '(niente tipo 7)',
        replay: r.partito ? r.partito.attrMiei : '?',
        golA: g.fine.score, golB: r.fine ? r.fine.score : null, duello: g.fine.duello,
      });
    }
    if (At.errori.length || Bt.errori.length)
      throw new Error('eccezione di pagina: ' + (At.errori[0] || Bt.errori[0]));
    await At.ctx.close(); await Bt.ctx.close();
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    sg.chiudi(); ss.chiudi(); process.exit(2);
  }
  await browser.close(); sg.chiudi(); ss.chiudi();

  console.log('  C) LE QUATTRO PORTE DI UN ATTRIBUTO');
  console.log('     ' + 'caso'.padEnd(20) + 'scritto'.padEnd(10) + 'salvataggio  nastro  campo  replay');
  for (const p of porte)
    console.log('     ' + p.caso.padEnd(20) + String(p.dato).padEnd(10) +
      String(p.salvato).padStart(8) + String(p.nastro).padStart(9) +
      String(p.campo).padStart(8) + String(p.replay).padStart(8) +
      ((p.salvato === p.nastro && p.nastro === p.campo && p.campo === p.replay) ? '' : '   <- DISCORDI'));
  console.log('');
  const buone = righe.filter(r => !r.nullo);
  if (buone.length < N_SFIDE) {
    console.error('PROVA NULLA: ' + buone.length + ' sfide su ' + N_SFIDE + ' sono arrivate al fischio finale.');
    process.exit(3);
  }
  for (const r of buone) {
    console.log('  seme ' + r.seme + ': giocata ' + r.golA.join('-') + ', rigiocata ' +
      (r.golB ? r.golB.join('-') : '—') + (r.duello ? '  (dal dischetto)' : ''));
    console.log('        in campo  ' + r.campo);
    console.log('        nel nastro ' + r.nastro);
    console.log('        nel replay ' + r.replay);
  }
  console.log('');

  const uguali = buone.filter(r => r.campo === r.nastro);
  di(uguali.length === buone.length, 'A) l\'uomo in campo e l\'uomo nel nastro hanno lo stesso numero',
     uguali.length + '/' + buone.length);

  const golUguale = buone.filter(r => r.golB && r.golA.join('-') === r.golB.join('-'));
  di(golUguale.length === buone.length, 'B) il replay finisce col punteggio dichiarato',
     golUguale.length + '/' + buone.length + ' identici');

  const concordi = porte.filter(p => p.salvato === p.nastro && p.nastro === p.campo && p.campo === p.replay);
  di(concordi.length === porte.length, 'C1) le quattro porte danno la stessa risposta allo stesso ingresso',
     concordi.length + '/' + porte.length + ' concordi');
  const inScala = porte.filter(p => Number.isFinite(+p.salvato) && +p.salvato >= 1 && +p.salvato <= 99);
  di(inScala.length === porte.length, 'C2) e la risposta sta sempre in 1..99',
     inScala.length + '/' + porte.length + ' in scala; fuori: ' +
     porte.filter(p => !(Number.isFinite(+p.salvato) && +p.salvato >= 1 && +p.salvato <= 99))
       .map(p => p.caso + '=' + p.salvato).join(', '));

  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})();
