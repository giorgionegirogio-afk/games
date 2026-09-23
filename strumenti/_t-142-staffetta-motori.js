/* =====================================================================
   _t-142-staffetta-motori.js — LA STAFFETTA APRE IL MOTORE GIUSTO
   (voce #142, compito 4)

   `_q-staffetta.js` misura il raggruppamento e la scelta del motore in
   UNITA' (prove A6 e A7): due righe della stessa misura e di due motori
   diversi fanno due gruppi, e chi chiede un motore che nessuno ha
   ottiene null invece di un ripiego. Sono le due domande giuste, e non
   bastano: un raggruppamento perfetto che poi apra sempre lo stesso
   browser darebbe le stesse risposte in unita' e continuerebbe ad
   accusare gli innocenti nel giro vero.

   QUESTO ATTREZZO FA IL GIRO VERO. Due sfide giocate DAVVERO su due
   motori diversi — una su WebKit, una su Chromium — messe nello stesso
   banco finto, e una staffetta sola che deve giudicarle tutte e due:

     1) CON TUTTI E DUE I MOTORI IN MANO: due contesti, ognuno del motore
        che il suo nastro chiede, e DUE TORNA. Se la staffetta aprisse un
        browser solo, uno dei due nastri darebbe INCOMPLETO/
        motore-js-diverso e la copertura sarebbe persa — cioe'
        l'astensione del compito 3 sarebbe una resa invece di una
        complicazione operativa.

     2) CON UN MOTORE SOLO: la riga che chiede l'altro NON si giudica su
        quello che c'e'. Resta a verificata = 0, non entra nel taccuino,
        e il referto la grida. Ripiegare sarebbe tornare al difetto che
        il #142 cura.

   PERCHE' NON IN BATTERIA: apre due motori veri e gioca due sfide
   intere. Le due domande che vanno sorvegliate a ogni compito sono gia'
   in `_q-motore-nastro` (l'accusa) e in `_q-staffetta` A6/A7 (la
   scelta): questo e' l'anello che le lega, e si rilancia a mano quando
   qualcuno tocca il raggruppamento o la scelta del motore.

   uso:  node strumenti/_t-142-staffetta-motori.js
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se le sfide non arrivano al fischio finale.
   ===================================================================== */
const path = require('path');
const playwright = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');
const S = require('./staffetta.js');

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
const info = (nome, det) => console.log('  --  ' + nome + (det ? '  [' + det + ']' : ''));

/* IL BANCO FINTO, e la sua guardia e' quella vera: `segna_verdetto` ha
   `where verificata = 0`, quindi una riga gia' chiusa non si muove due
   volte. Qui si riproduce quella riga sola, perche' e' la sola che
   conta per quel che si sta misurando. */
function bancoFinto(righe) {
  const stato = righe.map(r => Object.assign({}, r, { verificata: 0 }));
  const mandati = [];
  return {
    stato, mandati,
    async pesca(quanti, dopo) {
      return stato.filter(r => r.verificata === 0 && r.id > (dopo | 0))
                  .sort((a, b) => a.id - b.id).slice(0, Math.max(1, quanti | 0))
                  .map(r => Object.assign({}, r));
    },
    async segna(id, parola) {
      mandati.push({ id, parola });
      const r = stato.find(x => x.id === id);
      if (!r || r.verificata !== 0) return { mosso: false, esito: 0, sospetto: 0 };
      if (parola === 'TORNA') { r.verificata = 1; return { mosso: true, esito: 1, sospetto: 0 }; }
      if (parola === 'NON TORNA') { r.verificata = -1; return { mosso: true, esito: -1, sospetto: 1 }; }
      return { mosso: false, esito: 0, sospetto: 0 };  /* i tre «non lo so» restano a 0 */
    },
    async frena() { return true; },
  };
}

(async () => {
  const sg = await B.serviGioco('');
  const ss = await B.serviServer();
  const indirizzo = 'http://127.0.0.1:' + sg.porta + '/CALCETTO-il-gioco.html';
  const aperti = {};
  let nulla = '';
  try {
    console.log('=== LA STAFFETTA APRE IL MOTORE GIUSTO (voce #142, compito 4) ===\n');

    /* --- una sfida vera PER MOTORE, giocata davvero --- */
    const righe = [];
    let id = 1;
    for (const nome of ['webkit', 'chromium']) {
      aperti[nome] = await playwright[nome].launch();
      const At = await B.apri(aperti[nome], sg.porta);
      const Bt = await B.apri(aperti[nome], sg.porta);
      await B.collega(Bt, ss.porta, 'BORGATA-' + nome.toUpperCase());
      await B.collega(At, ss.porta, 'DOPOLAVORO-' + nome.toUpperCase());
      await B.entra(Bt); await B.entra(At);
      await B.pubblica(Bt); await B.pubblica(At);
      const s = await B.giocaUna(At, ss, [], 24000, 0);
      if (!(s.partita && s.riga)) { nulla = 'la sfida su ' + nome + ' non e\' arrivata al fischio finale'; throw new Error(nulla); }
      const imp = N.improntaDi(N.allarga(s.riga.replay));
      righe.push({ id: id++, motore: nome, impronta: imp, attaccante: 'A',
                   seme: s.riga.seme, taglia: s.riga.taglia | 0,
                   gol_a: s.riga.gol_a | 0, gol_d: s.riga.gol_d | 0, replay: s.riga.replay });
      info('sfida vera su ' + nome.padEnd(9) + ' ' + (s.riga.gol_a | 0) + '-' + (s.riga.gol_d | 0) +
           ', seme ' + s.riga.seme + ', impronta nel nastro ' + imp);
      await At.ctx.close(); await Bt.ctx.close();
    }
    console.log('');

    const impW = righe[0].impronta, impC = righe[1].impronta;
    di(impW && impC && impW !== impC,
       'A) le due sfide portano DUE impronte diverse, altrimenti non c\'e\' niente da separare',
       'webkit ' + impW + ', chromium ' + impC);

    /* --- il raggruppamento: due righe, due gruppi --- */
    const gr = S.raggruppa(righe);
    di(gr.length === 2 && gr.every(g => g.righe.length === 1),
       'B) la staffetta ne fa DUE gruppi, uno per motore',
       gr.map(g => g.chiave + ':' + g.righe.length).join(' · '));
    console.log('');

    /* --- 1) con tutti e due i motori in mano --- */
    console.log('CON TUTTI E DUE I MOTORI IN MANO');
    const motoriDue = [
      { nome: 'webkit', browser: aperti.webkit, impronta: impW },
      { nome: 'chromium', browser: aperti.chromium, impronta: impC },
    ];
    const b1 = bancoFinto(righe);
    const r1 = await S.giro({ banco: b1, motori: motoriDue, browser: aperti.chromium,
                              indirizzo, tetto: 10, pausa: 0, taccuino: null });
    const tornati1 = r1.esiti.filter(e => e.verdetto === 'TORNA').length;
    di(!r1.guasto && r1.giudicate === 2 && tornati1 === 2,
       'C) tutte e due le sfide si CONFERMANO: due contesti, due TORNA',
       'giudicate ' + r1.giudicate + ' in ' + r1.contesti + ' contesti, verdetti ' +
       r1.esiti.map(e => e.verdetto + (e.causa ? '/' + e.causa : '')).join(' · ') +
       (r1.guasto ? ', GUASTO ' + r1.guasto : ''));
    const usati = r1.misure.map(m => m.motore).sort().join(',');
    di(usati === 'chromium,webkit',
       'D) e ognuna e\' stata aperta sul SUO motore, non su uno solo',
       r1.misure.map(m => m.chiave + ' -> ' + m.motore).join(' · ') || 'nessuna');
    di(r1.motoriAssenti.length === 0, 'E) nessun motore dichiarato assente quando ci sono tutti e due',
       r1.motoriAssenti.length + ' gruppi lasciati indietro');
    console.log('');

    /* --- 2) con un motore solo --- */
    console.log('CON UN MOTORE SOLO (chromium), COME SU UNA MACCHINA CHE NON HA WEBKIT');
    const b2 = bancoFinto(righe);
    const r2 = await S.giro({ banco: b2, motori: [{ nome: 'chromium', browser: aperti.chromium, impronta: impC }],
                              browser: aperti.chromium, indirizzo, tetto: 10, pausa: 0, taccuino: null });
    di(r2.giudicate === 1 && r2.esiti.length === 1 && r2.esiti[0].verdetto === 'TORNA' &&
       r2.esiti[0].id === righe[1].id,
       'F) si giudica SOLO la sfida di chromium, e quella si conferma',
       'giudicate ' + r2.giudicate + ', verdetti ' + r2.esiti.map(e => '#' + e.id + ' ' + e.verdetto).join(' · '));
    di(r2.motoriAssenti.length === 1 && r2.motoriAssenti[0].righe === 1 &&
       ((r2.motoriAssenti[0].impronta | 0) >>> 0) === ((impW | 0) >>> 0),
       'G) e quella di webkit e\' DICHIARATA ASSENTE, non giudicata su chromium',
       r2.motoriAssenti.map(m => m.chiave + ' (' + m.righe + ' righe)').join(' · ') || 'nessuna');
    const riga1 = b2.stato.find(x => x.id === righe[0].id);
    di(!!riga1 && riga1.verificata === 0 && !b2.mandati.some(m => m.id === righe[0].id),
       'H) resta a verificata = 0 e NESSUNA parola parte per lei: torna al giro dopo',
       'verificata ' + (riga1 ? riga1.verificata : '?') + ', parole mandate ' +
       (b2.mandati.map(m => '#' + m.id + ' ' + m.parola).join(' · ') || 'nessuna'));
    console.log('');
  } catch (e) {
    for (const k of Object.keys(aperti)) { try { await aperti[k].close(); } catch (x) {} }
    try { sg.chiudi(); ss.chiudi(); } catch (x) {}
    if (nulla) { console.error('PROVA NULLA: ' + nulla); process.exit(3); }
    console.error('FALLITO (banco): ' + (e && e.stack || e));
    process.exit(2);
  }
  for (const k of Object.keys(aperti)) { try { await aperti[k].close(); } catch (x) {} }
  try { sg.chiudi(); ss.chiudi(); } catch (x) {}

  const rossi = esiti.filter(x => !x).length;
  console.log(esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti\n');
  if (rossi) {
    console.log('>>> L\'ASTENSIONE DEL COMPITO 3 E\' UNA RESA, NON UNA COMPLICAZIONE OPERATIVA:');
    console.log('    finche\' la staffetta non apre il motore che il nastro chiede, le sfide');
    console.log('    giocate da un iPhone non si verificano mai.');
    process.exit(1);
  }
  console.log('>>> LA STAFFETTA APRE IL MOTORE GIUSTO, E QUANDO NON CE L\'HA LO DICE.');
  process.exit(0);
})();
