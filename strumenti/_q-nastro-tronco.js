/* =====================================================================
   _q-nastro-tronco.js — IL REGISTRO TACE QUANDO TRONCA
   (voce #132, compito 4). Nasce ROSSO.

   PROMOSSO A CANCELLO DI QUALITA' (21 settembre 2026, voce #132,
   correzione di revisione): si chiamava _t-nastro-tronco.js, un
   attrezzo di compito. Nessun cancello della batteria si sarebbe
   accorto di una regressione sul canale (d) marchio di troncatura — lo
   stesso rilievo gia' pagato dal #131 per il duello. Rinominato
   (git mv) e registrato in strumenti/tutti.js con conta:true: ~11
   secondi di corsa, misurati, non lento.

   IL DIFETTO. `Reg.scrivi` (CALCETTO-il-gioco.html:13419) si ferma a
   40.000 righe IN SILENZIO. Un nastro troncato non e' distinguibile da
   uno intero: stessa forma, stessa versione di motore, stesso tutto. In
   rilettura i comandi finiscono a meta' partita, i pollici si fermano,
   il punteggio non torna — e il confronto di fine replay (grep S.atteso)
   da' la colpa alla rosa cresciuta di chi ha attaccato. Innocente,
   accusato.

   E IL TETTO NON E' LONTANO. Il registro scrive UNA RIGA PER DITO PER
   FOTOGRAMMA — misurato (strumenti/_sonda-132-canali.js): 1,00 con un
   dito, 3,01 con tre, 6,01 con sei, 10,02 con dieci. Quindi il tetto
   arriva a 663 s con un dito ma a 111 s con sei e a 67 s con dieci. Una
   sfida dura 90 s piu' 40 di golden goal piu' la serie dal dischetto:
   con sei dita appoggiate sullo schermo il tetto cade DENTRO una partita
   onesta. Questo cancello NON abbassa il tetto — lo raggiunge con le
   dita, su una sfida vera, perche' un tetto abbassato proverebbe il
   banco e non il gioco.

   E L'ALTRA META': un nastro VUOTO passa. `Sfida.guarda` (:43324) fa
   `let righe = testo ? 0 : -1`, poi deserializza; un testo non vuoto ma
   senza comandi (`1|2||`, cinque caratteri) da' `righe === 0`, che non
   e' `< 0`: si accetta, si rigioca una partita senza un dito, e il
   punteggio non torna quasi mai. Di nuovo la causa vera sostituita da
   quella sbagliata.

   LE PROVE
     A) un nastro che ha toccato il tetto porta il marchio;
     B) e Sfida.guarda lo rifiuta, dicendo perche';
     C) un nastro vuoto viene rifiutato, E PER LA CAUSA GIUSTA;
     D) non-regressione: un nastro normale non porta il marchio e si
        rivede come prima, col punteggio dichiarato.

   RETTIFICA A EDIZIONI (24 settembre 2026, voce #149). LA PROVA C ERA
   VERDE PER IL MOTIVO SBAGLIATO, e la revisione d'insieme dell'onda E
   l'ha presa. Il nastro finto era scritto `'1|2||'`: quel `2` e' il
   MOTORE_V del nastro, e da quando il numero e' salito (4 al #144, 5 al
   #148, 6 al #149) a respingerlo non era piu' la guardia del nastro
   vuoto ma `motoreV !== MOTORE_V`. Se la guardia del vuoto fosse
   sparita, la prova sarebbe restata verde: un cancello che attesta
   invece di misurare.

   LA CURA, in due pezzi. Il primo: MOTORE_V si LEGGE DAL FILE del gioco
   in prova (come fa `_t-143-motorev.js:177`), cosi' il nastro finto ha
   la versione giusta e la strada del motore e' chiusa. Il secondo: non
   basta piu' «rifiutato», si pretende la CAUSA — `nastro-vuoto` — e la
   si chiede a `giudica`, che e' la stessa porta di `Sfida.guarda`
   (`vagliaNastro`, voce #134). Col falso `_crit-vuoto-cieco.js`, che
   toglie quella riga sola, la prova diventa rossa: MISURATO.

   uso:  node strumenti/_q-nastro-tronco.js
         node strumenti/_q-nastro-tronco.js --gioco fuori/falso.html
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se il gioco indicato non ha la schermata della sfida o se la sfida
   lunga non e' arrivata al tetto (prova non fatta).
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
/* dieci dita: 10,02 comandi per passo, tetto a 67 s — dentro i tempi
   regolamentari di una sfida, senza toccare il tetto del gioco */
const DITA = parseInt(arg('dita', '10'), 10);

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  let browser;
  let lunga = null, lungaRep = null, corta = null, cortaRep = null, vuotaRep = null, vuotaId = 0;
  let vuotaVerdetto = null, mvFile = 0;
  try {
    browser = await chromium.launch();
    console.log('=== IL NASTRO CHE TRONCA IN SILENZIO (voce #132, compito 4) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', ' + DITA + ' dita in piu\' sullo schermo\n');

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

    /* ---- D) prima la sfida NORMALE, che fa da metro -------------- */
    corta = await B.giocaUna(At, ss, [], 24000, 0);
    if (corta.partita && corta.riga) cortaRep = await B.guardaUna(Bt, corta.id, []);

    /* ---- A) e B) la sfida che arriva al tetto -------------------- */
    lunga = await B.giocaUna(At, ss, [], 24000, DITA);
    if (lunga.partita && lunga.riga) lungaRep = await B.guardaUna(Bt, lunga.id, []);

    /* ---- C) e il nastro VUOTO --------------------------------------
       Si infila nel server una riga di sfida col nastro vuoto — cinque
       caratteri di forma perfetta e zero comandi dentro. Non passa dal
       gioco perche' il gioco un nastro cosi' non lo produce: il punto e'
       che chi RILEGGE deve accorgersene comunque, che sia arrivato da un
       guasto, da una rete storta o da qualcuno che ci prova. */
    if (corta.riga) {
      /* IL MOTORE_V SI LEGGE DAL FILE, non si indovina (voce #149): con
         un numero qualunque in testa il nastro finto verrebbe respinto
         da `motoreV !== MOTORE_V` e la guardia del vuoto non sarebbe
         mai raggiunta. E' la stessa lettura di `_t-143-motorev.js`. */
      const testoGioco = fs.readFileSync(prova || path.join(RADICE, 'CALCETTO-il-gioco.html'), 'utf8');
      const mm = testoGioco.match(/const MOTORE_V = (\d+)/);
      if (!mm) throw new Error('MOTORE_V non trovato nel file del gioco');
      mvFile = parseInt(mm[1], 10);
      const nastroVuoto = '1|' + mvFile + '||';
      vuotaId = ss.db.sfide.length + 1;
      ss.db.sfide.push(Object.assign({}, corta.riga, {
        id: vuotaId, replay: nastroVuoto, gol_a: 3, gol_d: 0, vista: false,
      }));
      vuotaRep = await B.guardaUna(Bt, vuotaId, []);
      /* E LA CAUSA, chiesta alla stessa porta che usa Sfida.guarda. Su
         una TERZA pagina pulita: Bt ha appena finito un replay, e un
         giudizio dentro la pagina che ha appena riletto misurerebbe
         quella pagina. */
      const Gt = await B.apri(browser, sg.porta);
      vuotaVerdetto = await Gt.pag.evaluate(([n, s]) => {
        const v = window.__test.giudica(n, [3, 0], { seme: String(s), taglia: 5 });
        return { verdetto: v.verdetto, causa: v.causa, motoreV: v.motoreV };
      }, [nastroVuoto, corta.via && corta.via.seme ? corta.via.seme : 20260801]);
      await Gt.ctx.close();
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

  if (!corta.partita || !lunga.partita) {
    console.error('PROVA NULLA: una delle due sfide non e\' arrivata al fischio finale.');
    process.exit(3);
  }
  const TETTO = 40000;
  console.log('  sfida NORMALE   seme ' + corta.via.seme + ': ' + corta.fine.righe + ' comandi in ' +
    corta.fine.passi + ' passi (' + (corta.fine.righe / corta.fine.passi).toFixed(2) + ' per passo), ' +
    corta.fine.score.join('-') + ', nastro ' + String(corta.riga.replay).length + ' byte');
  console.log('  sfida CON ' + DITA + ' DITA seme ' + lunga.via.seme + ': ' + lunga.fine.righe + ' comandi in ' +
    lunga.fine.passi + ' passi (' + (lunga.fine.righe / lunga.fine.passi).toFixed(2) + ' per passo), ' +
    lunga.fine.score.join('-') + ', nastro ' + (lunga.riga ? String(lunga.riga.replay).length : 0) + ' byte');
  console.log('');

  if (lunga.fine.righe <= TETTO) {
    console.error('PROVA NULLA: la sfida lunga si e\' fermata a ' + lunga.fine.righe +
      ' comandi, sotto il tetto di ' + TETTO + '. Serve piu\' di un dito (--dita N).');
    process.exit(3);
  }
  di(true, 'la sfida lunga arriva davvero al tetto del registro',
     lunga.fine.righe + ' comandi contro un tetto di ' + TETTO);

  const marchio = lunga.fine.tipi.indexOf('9') >= 0 || lunga.fine.troncato === true;
  di(marchio, 'A) il nastro che ha toccato il tetto porta il marchio di troncatura',
     'tipi di riga [' + [...new Set(lunga.fine.tipi.split(''))].sort().join('') + '], Reg.troncato ' + lunga.fine.troncato);

  const rifiutaTronco = !!(lungaRep && lungaRep.rifiutato);
  di(rifiutaTronco, 'B) e Sfida.guarda lo rifiuta invece di rigiocarlo mezzo',
     (lungaRep ? ('rifiutato ' + lungaRep.rifiutato + ', rigiocata ' +
       (lungaRep.fine ? lungaRep.fine.score.join('-') : '—') + ' contro ' + lunga.fine.score.join('-') +
       ', riga «' + String(lungaRep.rigaFine).slice(0, 70) + '»') : 'nessun replay'));

  const rifiutaVuoto = !!(vuotaRep && vuotaRep.rifiutato);
  const causaVuoto = vuotaVerdetto ? (vuotaVerdetto.verdetto + '/' + vuotaVerdetto.causa) : '';
  di(rifiutaVuoto && causaVuoto === 'INCOMPLETO/nastro-vuoto',
     'C) e un nastro VUOTO non passa per buono, E PER LA CAUSA GIUSTA',
     (vuotaRep ? ('MOTORE_V del file ' + mvFile + ' (niente strada del motore) · rifiutato ' +
       vuotaRep.rifiutato + ' · causa ' + (causaVuoto || 'NON CHIESTA') + ' · riga «' +
       String(vuotaRep.rigaFine).slice(0, 70) + '»') : 'nessun replay'));

  const nienteMarchio = corta.fine.tipi.indexOf('9') < 0 && corta.fine.troncato !== true;
  const cortaUguale = !!(cortaRep && cortaRep.fine &&
    cortaRep.fine.score.join('-') === corta.fine.score.join('-'));
  di(nienteMarchio && cortaUguale, 'D) e un nastro normale non porta il marchio e si rivede col punteggio giusto',
     'marchio ' + (nienteMarchio ? 'assente' : 'PRESENTE') + ', giocata ' + corta.fine.score.join('-') +
     ', rigiocata ' + (cortaRep && cortaRep.fine ? cortaRep.fine.score.join('-') : '—'));

  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})();
