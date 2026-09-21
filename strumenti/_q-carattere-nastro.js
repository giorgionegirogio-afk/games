/* =====================================================================
   _q-carattere-nastro.js — DUE NOMI, DUE CPU, DUE PARTITE
   (voce #132, compito 2). Nasce ROSSO.

   PROMOSSO A CANCELLO DI QUALITA' (21 settembre 2026, voce #132,
   correzione di revisione): si chiamava _t-carattere-nastro.js, un
   attrezzo di compito. Nessun cancello della batteria si sarebbe
   accorto di una regressione sul canale (b) carattere dal nome — lo
   stesso rilievo gia' pagato dal #131 per il duello. Rinominato
   (git mv) e registrato in strumenti/tutti.js con conta:true: ~11
   secondi di corsa, misurati, non lento.

   IL DIFETTO. `G.car = [CAR_NEUTRO, caratterePer(G.oppName)]`
   (CALCETTO-il-gioco.html:11356): il NOME della squadra avversaria
   decide il carattere della CPU, sulla tabella di dieci squadre di
   :9328-9383. Il nome nel nastro non c'e' — ed e' giusto che non ci sia,
   perche' e' un dato di una persona — ma allora il carattere non e'
   deciso da niente che viaggi con la partita.

   E i due capi non lo leggono nemmeno dallo stesso posto: chi ATTACCA lo
   prende da `a.nome` (:43270, la squadra che il server gli ha dato); chi
   GUARDA lo prende da `dif.nome`, col ripiego `SAVE.teamName` se il
   server non ha piu' la riga del difensore (:43465).

   LO SCENARIO, ed e' quello vero: chi difende CAMBIA IL NOME della
   squadra fra la partita subita e il momento in cui la guarda. Nessuno
   ha barato, nessuno ha toccato il nastro, e la partita rigiocata e'
   un'altra.

   MISURATO (strumenti/_sonda-132-canali.js, CPU contro CPU, taglia 5,
   cinque semi): avversario anonimo contro avversario chiamato GASOMETRO
   diverge 5 semi su 5, primo scarto al passo 80 in quattro casi e 60 nel
   quinto, punteggio finale diverso in 4 su 5.

   LE PROVE
     A) la riga di tipo 7 porta l'indice di carattere;
     B) rigiocato dopo che il difensore si e' rinominato, il nastro da'
        la STESSA partita;
     C) e la CPU del replay ha lo stesso carattere di quella della
        partita giocata (la prova che B non passi per caso);
     D) non-regressione: fuori da una sfida il carattere resta quello del
        NOME, tabella per tabella.

   uso:  node strumenti/_q-carattere-nastro.js
         node strumenti/_q-carattere-nastro.js --gioco fuori/falso.html
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
/* GASOMETRO e' una delle dieci di CARATTERE, e non a caso la piu' marcata
   (grinta 2,00, attesa 0,75): se il carattere non viaggia, si vede. */
const NOME_CAR = arg('nome', 'GASOMETRO');
const NOME_DOPO = arg('nome2', 'QUELLI DEL PONTE');

/* la riga di testa del nastro, letta con le stesse funzioni del gioco */
const LEGGI7 = `(function(){
  const d = Reg.righe.filter(r => r[1] === 7)[0];
  if(!d) return { c7:false };
  const p1 = spaccaRosa(d, 5, []);
  const p2 = spaccaRosa(d, p1.fine, []);
  return { c7:true, lung:d.length, fine:p2.fine,
           car: d.length > p2.fine ? d[p2.fine] : null };
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
  let tabella = null;
  try {
    browser = await chromium.launch();
    console.log('=== IL CARATTERE NEL NASTRO (voce #132, compito 2) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', ' + N_SFIDE +
                ' sfide, difensore «' + NOME_CAR + '» che poi si rinomina «' + NOME_DOPO + '»\n');

    const Bt = await B.apri(browser, sg.porta);   /* difende e poi guarda */
    const At = await B.apri(browser, sg.porta);   /* attacca */
    const c = await At.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida'),
                                             tabella: typeof CARATTERE !== 'undefined' }));
    if (!c.schermata || !c.tabella) {
      console.error('PROVA NULLA: questo gioco non ha la schermata della sfida o la tabella dei caratteri.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    await B.collega(Bt, ss.porta, NOME_CAR);
    await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(Bt); await B.entra(At);
    await B.pubblica(Bt); await B.pubblica(At);

    for (let k = 0; k < N_SFIDE; k++) {
      /* il difensore torna al suo nome vero prima di essere attaccato:
         la partita si gioca contro GASOMETRO, sempre */
      await Bt.pag.evaluate(n => { window.__test.save.teamName = n; }, NOME_CAR);
      await B.pubblica(Bt);

      const g = await B.giocaUna(At, ss, []);
      if (!g.partita || !g.riga) { righe.push({ nullo: true }); continue; }
      const testa = await At.pag.evaluate(t => (new Function('return ' + t))(), LEGGI7);

      /* ============ E QUI IL DIFENSORE SI RINOMINA ==================
         Nessuno ha barato: ha solo cambiato il nome della sua squadra,
         che e' una cosa che il gioco gli offre. Poi guarda la partita
         che ha subito. */
      await Bt.pag.evaluate(n => { window.__test.save.teamName = n; }, NOME_DOPO);
      await B.pubblica(Bt);

      const r = await B.guardaUna(Bt, g.id, []);
      righe.push({
        nullo: false, seme: g.via.seme, testa: testa,
        carA: g.via.car, carB: r.partito ? r.partito.car : '?',
        golA: g.fine.score, golB: r.fine ? r.fine.score : null,
        duello: g.fine.duello,
      });
    }

    /* ---- D) fuori da una sfida, il carattere resta quello del nome --- */
    tabella = await At.pag.evaluate(() => {
      const t = window.__test;
      const fuori = [];
      for (const nome of Object.keys(CARATTERE).concat(['SQUADRA QUALUNQUE'])) {
        t.fermaRegistro(); t.desemina();
        t.startMatch(1, 1, { size: 5, sponde: 'gabbia', miraGuidata: 'pieno', opp: { n: nome } });
        fuori.push(nome + '=' + Object.values(G.car[1]).join('/'));
      }
      const atteso = Object.keys(CARATTERE).map(n => n + '=' + Object.values(CARATTERE[n]).join('/'))
        .concat(['SQUADRA QUALUNQUE=' + Object.values(CAR_NEUTRO).join('/')]);
      return { visto: fuori.join(' | '), atteso: atteso.join(' | ') };
    });

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
    console.log('  seme ' + r.seme + ': testa del nastro lunga ' + r.testa.lung + ' (rose fino a ' + r.testa.fine +
      '), indice di carattere ' + (r.testa.car === null ? 'ASSENTE' : r.testa.car) +
      '\n              giocata ' + r.golA.join('-') + ' con CPU [' + r.carA + ']' +
      '\n              rigiocata ' + (r.golB ? r.golB.join('-') : '—') + ' con CPU [' + r.carB + ']' +
      (r.duello ? '  (dal dischetto)' : ''));
  console.log('');

  const conIndice = buone.filter(r => r.testa.car !== null && r.testa.car >= 0);
  di(conIndice.length === buone.length, 'A) la riga di tipo 7 porta l\'indice di carattere del difensore',
     buone.map(r => (r.testa.car === null ? 'ASSENTE' : r.testa.car)).join(' '));

  const golUguale = buone.filter(r => r.golB && r.golA.join('-') === r.golB.join('-'));
  di(golUguale.length === buone.length,
     'B) rigiocato dopo che il difensore si e\' rinominato, il nastro da\' la stessa partita',
     golUguale.length + '/' + buone.length + ' identici');

  const carUguale = buone.filter(r => r.carA === r.carB);
  di(carUguale.length === buone.length, 'C) e la CPU del replay ha il carattere di quella della partita',
     carUguale.length + '/' + buone.length + ' uguali');

  di(tabella.visto === tabella.atteso, 'D) fuori da una sfida il carattere resta quello del NOME',
     tabella.visto === tabella.atteso ? (Object.keys({}).length, '11 nomi, 11 tabelle giuste')
       : ('visto ' + tabella.visto.slice(0, 120) + ' / atteso ' + tabella.atteso.slice(0, 120)));

  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})();
