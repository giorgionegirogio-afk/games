/* =====================================================================
   _t-giudice-schermo.js — IL SESTO CANALE: LO SCHERMO
   (voce #133, compito 3). Nasce ROSSO.

   TROVATO MISURANDO, e non ragionando. Il compito 3 doveva solo
   dichiarare il tasso di falsi «NON TORNA» su partite oneste (0 su 14,
   taglie 5/7/11). Fra i tre canali sospetti c'era la FINESTRA, messa in
   lista perche' un verificatore su un server non ha lo schermo di un
   telefono, e perche' la voce #98 aveva insegnato che il campo puo'
   consumare sorteggi in proporzione alle sue misure — cosa poi curata
   dalla voce #129 (la cosmetica pesca da DECO, un generatore suo).

   LA CURA DELLA #129 TIENE. Il canale e' un altro, e non passa dai
   sorteggi: PASSA DAI PIXEL.

   Il nastro registra i tocchi in COORDINATE DI SCHERMO. Dove finisce un
   tocco lo decidono `touchBtnLayout` (i pulsanti virtuali) e
   `SCALE/OX/OY` (la conversione schermo -> campo), e tutti e tre
   derivano da `innerWidth`/`innerHeight` (grep `function resize`). Lo
   stesso tocco a (841, 342) preme il disco grande su uno schermo
   915x412 e non preme NIENTE su uno 800x360, dove quel punto e' fuori
   dalla finestra.

   MISURATO (fuori/_sonda-133-finestra.js, stesso nastro vero, nove
   viste, partita dichiarata 3-4):
     915x412  TORNA 3-4 (8819 passi)   <- lo schermo di chi ha registrato
     915x413  TORNA 3-4                930x412  TORNA 3-4
     916x412  TORNA 3-4                915x430  TORNA 3-4
     1024x460 NON TORNA 1-3 (7064 passi)
     1280x720 INCOMPLETO/duello-senza-righe 0-4 (5353)
     844x390  NON TORNA 0-3 (6717)     <- iPhone 14
     800x360  NON TORNA 0-3 (6717)     <- Android stretto
   Non e' una lama: uno scarto di quindici pixel non sposta niente, uno
   di settanta sposta tutto.

   E NON E' UN DIFETTO DEL GIUDICE: C'E' GIA', IN PRODUZIONE. Misurato
   (fuori/_sonda-133-schermi.js) col replay vero, due telefoni:
     A 915x412, B 915x412  ->  dichiarato 3-4, rigiocato 3-4   TORNA
     A 915x412, B 844x390  ->  dichiarato 3-4, rigiocato 0-3   NON TORNA
     A 844x390, B 915x412  ->  dichiarato 3-4, rigiocato 1-3   NON TORNA
     A 915x412, B 800x360  ->  dichiarato 3-4, rigiocato 0-3   NON TORNA
   e in tutti e tre i casi il gioco scrive, testualmente: «La squadra di
   chi ti ha attaccato e' cambiata da allora». L'innocente accusato — la
   stessa frase, la stessa colpa attribuita alla cosa sbagliata, che il
   cantiere #132 ha tolto di mezzo cinque volte. E' il SESTO canale, ed
   e' il piu' grosso di tutti: in produzione due telefoni con lo stesso
   schermo sono l'eccezione, non la regola.

   LA CURA, e non e' la cura definitiva. Il nastro porta lo schermo su
   cui e' stato registrato (riga di tipo 10, due numeri), e da li':
     · il GIUDICE, su uno schermo diverso, si RIFIUTA — INCOMPLETO,
       causa `schermo-diverso` — e dichiara quale schermo serve. Un
       verificatore differito apre il browser di quella misura e giudica
       davvero. Non accusa nessuno: e' il punto 3 del contratto.
     · il REPLAY di produzione continua a mostrare il film (rifiutarlo
       vorrebbe dire spegnere la funzione per quasi tutti) ma quando il
       punteggio non torna dice la CAUSA VERA invece di dare la colpa
       alla rosa cresciuta di un altro.
   La cura definitiva — registrare i tocchi in coordinate che non
   dipendono dallo schermo — e' un cantiere suo, ed e' dichiarata
   seguito.

   LE PROVE
     A) il nastro di una sfida porta la riga di tipo 10 con lo schermo
        di chi ha giocato;
     B) il giudice, su uno schermo diverso, dice INCOMPLETO/
        schermo-diverso e dichiara lo schermo che serve — MAI NON TORNA;
     C) e aperto a quello schermo, torna a dire TORNA;
     D) il replay di produzione, su uno schermo diverso, da' la causa
        VERA (lo schermo) invece di accusare la rosa;
     E) non-regressione: a schermo uguale il replay torna e non scrive
        nessun cartello di scarto.

   uso:  node strumenti/_t-giudice-schermo.js
         node strumenti/_t-giudice-schermo.js --gioco fuori/falso.html
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se non c'e' niente da misurare.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const VISTA_A = { width: 915, height: 412 };          /* chi gioca */
const VISTA_B = { width: 800, height: 360 };          /* chi guarda: un Android stretto */

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };

const giudizio = (P, nastro, atteso, opz) => P.pag.evaluate(([n, a, o]) => {
  const t = window.__test;
  if (typeof t.giudica !== 'function') return { manca: true, verdetto: 'ASSENTE' };
  try { return Object.assign({ manca: false }, t.giudica(n, a, o)); }
  catch (e) { return { manca: false, verdetto: 'ECCEZIONE', causa: e.message }; }
}, [nastro, atteso, opz]);

/* la riga di tipo 10 letta dal testo del nastro, in Node: il banco non
   deve chiedere al gioco se il gioco ha fatto il suo lavoro */
function schermoDelNastro(crudo) {
  for (const z of N.spacca(crudo).pezzi) {
    const v = z.split(',');
    if (v[1] === '10') return [+v[3], +v[4]];
  }
  return null;
}

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  let browser;
  let s = null, crudo = '', schermo = null;
  let gDiverso = null, gGiusto = null, repDiverso = null, repUguale = null, sUguale = null;
  try {
    browser = await chromium.launch();
    console.log('=== IL SESTO CANALE: LO SCHERMO (voce #133, compito 3) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') +
      ', chi gioca ' + VISTA_A.width + 'x' + VISTA_A.height +
      ', chi guarda ' + VISTA_B.width + 'x' + VISTA_B.height + '\n');

    /* ---- il caso DIVERSO: A gioca su una vista, B guarda su un'altra ---- */
    const Bt = await B.apri(browser, sg.porta, VISTA_B);
    const At = await B.apri(browser, sg.porta, VISTA_A);
    const c = await At.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida') }));
    if (!c.schermata) { console.error('PROVA NULLA: questo gioco non ha la schermata della sfida.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3); }
    await B.collega(Bt, ss.porta, 'BORGATA'); await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(Bt); await B.entra(At); await B.pubblica(Bt); await B.pubblica(At);
    s = await B.giocaUna(At, ss, [], 24000, 0);
    if (!s.partita || !s.riga) throw new Error('la sfida non e\' arrivata al fischio finale');
    crudo = N.allarga(s.riga.replay);
    schermo = schermoDelNastro(crudo);
    const att = [s.riga.gol_a | 0, s.riga.gol_d | 0];
    const opz = { seme: s.riga.seme, taglia: s.riga.taglia | 0 };

    repDiverso = await B.guardaUna(Bt, s.id, []);

    /* il giudice su uno schermo diverso, e su quello dichiarato */
    const Jx = await B.apri(browser, sg.porta, VISTA_B);
    gDiverso = await giudizio(Jx, crudo, att, opz);
    await Jx.ctx.close();
    const Jg = await B.apri(browser, sg.porta, schermo ? { width: schermo[0], height: schermo[1] } : VISTA_A);
    gGiusto = await giudizio(Jg, crudo, att, opz);
    await Jg.ctx.close();
    await At.ctx.close(); await Bt.ctx.close();

    /* ---- il caso UGUALE: la non-regressione ---- */
    const ss2 = await B.serviServer();
    const B2 = await B.apri(browser, sg.porta, VISTA_A);
    const A2 = await B.apri(browser, sg.porta, VISTA_A);
    await B.collega(B2, ss2.porta, 'BORGATA'); await B.collega(A2, ss2.porta, 'DOPOLAVORO');
    await B.entra(B2); await B.entra(A2); await B.pubblica(B2); await B.pubblica(A2);
    sUguale = await B.giocaUna(A2, ss2, [], 24000, 0);
    if (sUguale.partita && sUguale.riga) repUguale = await B.guardaUna(B2, sUguale.id, []);
    await A2.ctx.close(); await B2.ctx.close(); ss2.chiudi();
  } catch (e) {
    console.error('FALLITO (banco): ' + e.message);
    if (browser) await browser.close();
    sg.chiudi(); ss.chiudi(); process.exit(2);
  }
  await browser.close(); sg.chiudi(); ss.chiudi();

  const dich = (s.riga.gol_a | 0) + '-' + (s.riga.gol_d | 0);
  console.log('  sfida seme ' + s.riga.seme + ': dichiarata ' + dich + ', ' + s.fine.passi + ' passi');
  console.log('  schermo nel nastro: ' + (schermo ? schermo.join('x') : 'ASSENTE') + '\n');

  di(!!schermo && schermo[0] === VISTA_A.width && schermo[1] === VISTA_A.height,
     'A) il nastro porta lo schermo di chi ha giocato (riga di tipo 10)',
     (schermo ? schermo.join('x') : 'ASSENTE') + ', atteso ' + VISTA_A.width + 'x' + VISTA_A.height);

  const vd = String(gDiverso && gDiverso.verdetto);
  di(vd === 'INCOMPLETO' && gDiverso.causa === 'schermo-diverso' &&
     Array.isArray(gDiverso.schermo) && gDiverso.schermo[0] === VISTA_A.width,
     'B) su uno schermo diverso il giudice si rifiuta e dice quale schermo serve — MAI NON TORNA',
     vd + '/' + (gDiverso && gDiverso.causa) + ', schermo che serve ' +
     ((gDiverso && gDiverso.schermo) ? gDiverso.schermo.join('x') : '—') +
     ', rigiocata ' + ((gDiverso && gDiverso.gol) || []).join('-'));

  di(String(gGiusto && gGiusto.verdetto) === 'TORNA',
     'C) e aperto allo schermo che il nastro dichiara, TORNA',
     String(gGiusto && gGiusto.verdetto) + ', rigiocata ' + ((gGiusto && gGiusto.gol) || []).join('-') + ' contro ' + dich);

  const rigaD = String((repDiverso && repDiverso.rigaFine) || '');
  const rigD = (repDiverso && repDiverso.fine) ? repDiverso.fine.score.join('-') : '—';
  /* la prova ha senso solo se il replay e' DAVVERO divergente: se per caso
     tornasse, il cartello non uscirebbe e non ci sarebbe niente da leggere */
  const divergeDavvero = rigD !== dich;
  di(divergeDavvero && /schermo/i.test(rigaD) && !/squadra di chi ti ha attaccato/i.test(rigaD),
     'D) il replay di produzione da\' la causa VERA (lo schermo) invece di accusare la rosa',
     'dichiarato ' + dich + ', rigiocato ' + rigD + (divergeDavvero ? '' : ' (NON diverge: prova senza morso)') +
     ', cartello «' + rigaD.slice(0, 80) + '»');

  const rigU = (repUguale && repUguale.fine) ? repUguale.fine.score.join('-') : '—';
  const dichU = sUguale && sUguale.riga ? (sUguale.riga.gol_a | 0) + '-' + (sUguale.riga.gol_d | 0) : '—';
  const rigaU = String((repUguale && repUguale.rigaFine) || '');
  di(rigU === dichU && !/schermo|squadra di chi ti ha attaccato/i.test(rigaU),
     'E) non-regressione: a schermo uguale il replay torna e non scrive nessun cartello di scarto',
     'dichiarato ' + dichU + ', rigiocato ' + rigU + ', cartello «' + rigaU.slice(0, 60) + '»');

  const rossi = esiti.filter(x => !x).length;
  console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
  process.exit(rossi ? 1 : 0);
})();
