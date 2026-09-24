/* =====================================================================
   _sonda-147-quattordici.js — LE TESTIMONIANZE ARRIVANO NEL NASTRO?
   (voce #147, compito 1)

   Non e' un cancello: misura e stampa. La domanda e' una sola, ed e'
   nata leggendo `Reg.serializza` e non volendo concluderne niente:

     una riga di tipo 14, scritta da `Dischetto.testimonia`, sopravvive
     alla serializzazione del nastro?

   Si gioca una serie vera fra due telefoni, si prende il nastro, e si
   contano le righe per tipo PRIMA (in memoria) e DOPO (rilette dal
   testo). Se il conto delle 14 cala a zero, il buco dichiarato dal #146
   («vagliaNastro non pretende le righe di tipo 14») e' piu' grande di
   come e' stato scritto, e la cura va disegnata su quel fatto.

   uso:  node strumenti/_sonda-147-quattordici.js
   ===================================================================== */
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const mossaTiro = t => ({ ruolo: 't', z: t % 3, u: ((t * 317) % 1600) - 800, v: 200 + ((t * 211) % 600), ps: 30 + (t * 7) % 40 });
const mossaPara = t => ({ ruolo: 'p', z: (t * 2 + 1) % 3 });

const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_scegli = (P, m) => P.pag.evaluate(m => window.__test.dischetto.scegli(m), m);

(async () => {
  const srv = await T.serviGioco(null);
  const cass = await T.serviCassetta({});
  const browser = await chromium.launch();
  const A = await T.apri(browser, srv.porta);
  const B = await T.apri(browser, srv.porta);
  try {
    const base = 'http://127.0.0.1:' + cass.porta;
    await T.collega(A, cass.porta, 'ALFA');
    await T.collega(B, cass.porta, 'BETAX');
    await T.entra(A); await T.entra(B);

    const r = await A.pag.evaluate(async () => await window.__test.dischetto.crea());
    await B.pag.evaluate(async s => await window.__test.dischetto.entra(s), r.stanza);

    for (let g = 0; g < 200; g++) {
      for (const P of [A, B]) {
        const s = await d_stato(P);
        if (s && s.fase === 'scegli') await d_scegli(P, s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro));
      }
      await Promise.all([d_giro(A), d_giro(B)]);
      const sa = await d_stato(A);
      if (sa.tiro >= 3 || sa.fase === 'fine') break;
    }

    const m = await A.pag.evaluate(() => {
      const t = window.__test;
      const prima = t.registroRighe;
      const testo = t.nastro();
      const conta = {};
      for (const pezzo of (String(testo).split('|')[3] || '').split(';')) {
        if (!pezzo) continue;
        const tipo = Number(pezzo.split(',')[1]);
        conta[tipo] = (conta[tipo] || 0) + 1;
      }
      const dopo = t.rigioca(testo);
      const st = t.dischetto.stato;
      const verdetto = t.giudica(testo, [st.serie.seg[0], st.serie.seg[1]],
                                 { seme: String(st.seme), taglia: 5 });
      return { righeInMemoria: prima, caratteri: testo.length, conta, righeRilette: dopo,
               stato: st, verdetto: { verdetto: verdetto.verdetto, causa: verdetto.causa } };
    });

    console.log('righe in memoria : ' + m.righeInMemoria);
    console.log('righe rilette    : ' + m.righeRilette);
    console.log('caratteri nastro : ' + m.caratteri);
    console.log('per tipo nel testo: ' + JSON.stringify(m.conta));
    console.log('tiri giocati     : ' + m.stato.tiro + ' · fase ' + m.stato.fase + ' · causa ' + m.stato.causa);
    console.log('verdetto oggi   : ' + m.verdetto.verdetto + ' / ' + m.verdetto.causa);
    console.log((m.conta[14] ? 'LE 14 CI SONO: ' + m.conta[14] : 'LE 14 NON CI SONO NEL TESTO'));
  } finally {
    await A.ctx.close(); await B.ctx.close();
    await browser.close(); srv.chiudi(); cass.chiudi();
  }
})().catch(e => { console.error('BANCO ESPLOSO: ' + e.message); process.exit(2); });
