/* =====================================================================
   _q-ment-nastro.js — LA MENTALITA' E' UNA MOSSA, E LE MOSSE SI
   REGISTRANO (voce #132, compito 1). Nasce ROSSO.

   PROMOSSO A CANCELLO DI QUALITA' (21 settembre 2026, voce #132,
   correzione di revisione): si chiamava _t-ment-nastro.js, un attrezzo
   di compito. Nessun cancello della batteria si sarebbe accorto di una
   regressione sui canali (a) mentalita' o (e) audio — lo stesso rilievo
   gia' pagato dal #131 per il duello. Rinominato (git mv) e registrato
   in strumenti/tutti.js con conta:true: ~11 secondi di corsa, misurati,
   non lento.

   IL DIFETTO. Il bottone della mentalita' in pausa
   (CALCETTO-il-gioco.html:40888-40924) fa girare G.ment[0] fra DIFESA,
   EQUILIBRIO e ATTACCO senza nessuna guardia su G.sfida ne' su Reg.modo,
   e non scrive niente nel registro. Percio':

     · chi attacca cambia mentalita' a meta' partita, e il nastro non se
       ne accorge: in rilettura la squadra resta com'era al fischio
       d'inizio, e la partita rigiocata NON e' quella giocata. Chi
       guardera' vedra' un punteggio diverso da quello del tabellone, e
       chiudiSfida dara' la colpa alla rosa cresciuta di un altro.
     · chi GUARDA puo' aprire la pausa e cambiare la mentalita' della
       squadra di chi l'ha attaccato. Da li' in poi il replay non e' piu'
       la partita subita: e' una partita inventata dal pollice di chi la
       sta guardando.

   MISURATO (strumenti/_sonda-132-canali.js, CPU contro CPU, taglia 5):
   EQUILIBRIO -> ATTACCO fa divergere 5 semi su 5, primo scarto al passo
   80, punteggio finale diverso in 2 su 5 a 2.000 passi e 5 su 5 a 3.000.

   LE QUATTRO PROVE
     A) il nastro porta una riga di tipo 8 per il cambio;
     B) a fine replay la mentalita' e' quella di fine registrazione;
     C) il replay finisce col punteggio dichiarato;
     D) durante un replay il bottone NON cambia la partita di un altro;
     E) aprire l'audio non sposta il flusso dei sorteggi (il canale in
        piu', trovato misurando: grep _sonda-132-rumore.js).

   A, B e D sono deterministiche: oggi sono rosse sempre. C dipende dal
   seme e si misura su piu' sfide — si stampa il conto, non un aggettivo.

   uso:  node strumenti/_q-ment-nastro.js
         node strumenti/_q-ment-nastro.js --gioco fuori/falso.html --sfide 2
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
const QUANDO = parseInt(arg('quando', '600'), 10);   /* il fotogramma del cambio */
const PULITO = process.argv.indexOf('--pulito') > 0;   /* diagnostica: nessuno sporca il replay */
const SENZA = process.argv.indexOf('--senza-cambio') > 0; /* diagnostica: nessun cambio di mentalita' */

/* IL CAMBIO, DAL BOTTONE VERO. Non si chiama setMentalita: quello e' il
   gancio del banco e salta proprio il gestore che questo cancello
   misura. Qui si apre la pausa, si preme la voce, si riprende — la
   stessa sequenza di un pollice. */
const CAMBIA = `(function(){
  const t = window.__test;
  const prima = t.mentalita.slice();
  document.getElementById('pauseBtn').click();
  document.getElementById('btnPauseMent').click();
  const dopo = t.mentalita.slice();
  if(G.paused) document.getElementById('btnResume').click();
  return prima.join('/') + ' -> ' + dopo.join('/');
})()`;

/* e lo stesso gesto DENTRO un replay, dove non deve avere effetto */
const SPORCA = `(function(){
  const t = window.__test;
  const prima = t.mentalita.slice();
  document.getElementById('btnPauseMent').click();
  const dopo = t.mentalita.slice();
  if(G.paused) document.getElementById('btnResume').click();
  return prima.join('/') + ' -> ' + dopo.join('/');
})()`;

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  let browser;
  const righe = [];
  let audio = { costo: -1, sampleRate: 0 };
  try {
    browser = await chromium.launch();
    console.log('=== LA MENTALITA\' NEL NASTRO (voce #132, compito 1) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', ' + N_SFIDE +
                ' sfide, cambio al fotogramma ' + QUANDO + '\n');

    /* =====================================================================
       PRIMA DI TUTTO, LA PROVA E — e sta qui perche' si puo' fare UNA
       volta sola per pagina: il telefono che attacca si apre con l'audio
       ancora chiuso, si misura quanto costa aprirlo, e da li' in poi e'
       un telefono come gli altri.
       ===================================================================== */
    const At = await B.apri(browser, sg.porta, null, true);   /* attacca, audio ancora chiuso */
    audio = await B.costoAudio(At);
    const Bt = await B.apri(browser, sg.porta);               /* difende e poi guarda */
    const c = await At.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida'),
                                             bottone: !!document.getElementById('btnPauseMent') }));
    if (!c.schermata || !c.bottone) {
      console.error('PROVA NULLA: questo gioco non ha la schermata della sfida o il bottone della mentalita\'.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    await B.collega(Bt, ss.porta, 'BORGATA');
    await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(Bt); await B.entra(At);
    await B.pubblica(Bt); await B.pubblica(At);

    for (let k = 0; k < N_SFIDE; k++) {
      const g = await B.giocaUna(At, ss, SENZA ? [] : [{ f: QUANDO, js: CAMBIA }]);
      if (!g.partita || !g.riga) { righe.push({ nullo: true }); continue; }
      const r = await B.guardaUna(Bt, g.id, (k === 0 && !PULITO) ? [{ f: 300, js: SPORCA }] : []);
      righe.push({
        nullo: false, seme: g.via.seme, cambio: (g.fine.fatte[0] || {}).esito || 'NON FATTO',
        tipi: g.fine.tipi, mentA: g.fine.ment, mentB: r.fine ? r.fine.ment : null,
        golA: g.fine.score, golB: r.fine ? r.fine.score : null,
        sporcato: r.fine && r.fine.fatte.length ? r.fine.fatte[0].esito : '',
        scenaB: r.fine ? r.fine.scena : '(rifiutato)', rifiutato: r.rifiutato,
        duello: g.fine.duello, riga: r.rigaFine,
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

  const buone = righe.filter(r => !r.nullo);
  if (buone.length < N_SFIDE) {
    console.error('PROVA NULLA: ' + buone.length + ' sfide su ' + N_SFIDE + ' sono arrivate al fischio finale.');
    process.exit(3);
  }
  for (const r of buone)
    console.log('  seme ' + r.seme + ': cambio ' + r.cambio + ', tipi di riga [' +
      [...new Set(r.tipi.split(''))].sort().join('') + '], giocata ' + r.golA.join('-') +
      ' ment ' + r.mentA.join('/') + ', rigiocata ' + (r.golB ? r.golB.join('-') : '—') +
      ' ment ' + (r.mentB ? r.mentB.join('/') : '—') + (r.duello ? ', dal dischetto' : ''));
  console.log('');

  /* ---- A) il cambio e' successo davvero, ed e' finito nel nastro ---- */
  const cambiate = buone.filter(r => /->/.test(r.cambio) && r.cambio.split(' -> ')[0] !== r.cambio.split(' -> ')[1]);
  di(cambiate.length === buone.length, 'il bottone della pausa cambia davvero la mentalita\' durante la sfida',
     cambiate.length + '/' + buone.length + ', es. ' + buone[0].cambio);
  const conOtto = buone.filter(r => r.tipi.indexOf('8') >= 0);
  di(conOtto.length === buone.length, 'A) il nastro porta la riga di tipo 8 del cambio',
     conOtto.length + '/' + buone.length + ' nastri con un tipo 8');

  /* ---- B) e in rilettura la mentalita' e' quella di allora ---------- */
  const mentUguale = buone.filter(r => r.mentB && r.mentA.join('/') === r.mentB.join('/'));
  di(mentUguale.length === buone.length, 'B) a fine replay la mentalita\' e\' quella di fine registrazione',
     mentUguale.map(r => r.mentA.join('/')).join(' ') + ' contro ' +
     buone.map(r => (r.mentB ? r.mentB.join('/') : '—')).join(' '));

  /* ---- C) e il punteggio e' quello dichiarato ---------------------- */
  const golUguale = buone.filter(r => r.golB && r.golA.join('-') === r.golB.join('-'));
  di(golUguale.length === buone.length, 'C) il replay finisce col punteggio dichiarato',
     golUguale.length + '/' + buone.length + ' identici');

  /* ---- D) il pollice di chi guarda non decide --------------------- */
  const sporcate = buone.filter(r => r.sporcato);
  const inerti = sporcate.filter(r => r.sporcato.split(' -> ')[0] === r.sporcato.split(' -> ')[1]);
  di(sporcate.length > 0 && inerti.length === sporcate.length,
     'D) durante un replay il bottone NON cambia la partita di un altro',
     sporcate.length ? sporcate.map(r => r.sporcato).join(' ; ') : 'nessun replay sporcato: prova non fatta');

  /* ---- E) e il caso dell'audio non e' il caso della partita -------
     TROVATA MISURANDO: questo cancello restava rosso su una sfida su due
     anche a cura applicata, e non per la mentalita'. Audio5.init ->
     startCrowd -> noiseBuf riempiva un secondo di campionamento con
     dado(), cioe' col generatore SEMINATO: il primo sblocco dell'audio
     costava 48.000 pesche, e quante ne costa lo decide la frequenza di
     campionamento dell'APPARECCHIO (44.100 o 48.000). */
  di(audio.costo === 0, 'E) aprire l\'audio non sposta il flusso dei sorteggi della partita',
     audio.costo + ' sorteggi a ' + audio.sampleRate + ' Hz');

  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})();
