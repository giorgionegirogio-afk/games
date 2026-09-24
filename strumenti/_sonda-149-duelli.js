/* =====================================================================
   _sonda-149-duelli.js — QUANTI COMANDI DI DUELLO RESTANO IN CANNA?
   (voce #149, sonda usa-e-getta)

   LA DOMANDA (nella forma in cui è nata). La guardia del residuo, nella
   sua prima stesura, prendeva il residuo
   del #147 (la riga 15 e le 14 tolte) — ma ha preso anche il caso
   «seme sbagliato» di `_q-staffetta` B1, che il #133 aveva deciso di
   trattare come NON TORNA. Prima di scegliere una forma piu' stretta
   bisogna sapere QUANTI comandi restano in canna nei due casi: se sono
   numeri diversi in natura, una forma piu' stretta esiste; se sono lo
   stesso numero, la scelta e' fra due principi e va dichiarata.

   uso:  node strumenti/_sonda-149-duelli.js
   ===================================================================== */
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');
const FIX = require('./_nastro-duello-congelato.js');

const mossaTiro = t => ({ ruolo: 't', z: t % 3, u: ((t * 317) % 1600) - 800, v: 200 + ((t * 211) % 600), ps: 30 + (t * 7) % 40 });
const mossaPara = t => ({ ruolo: 'p', z: (t * 2 + 1) % 3 });
const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_scegli = (P, m) => P.pag.evaluate(m => window.__test.dischetto.scegli(m), m);

function togliTipo(testo, tipo) {
  const p = String(testo).split('|');
  const pezzi = (p[3] || '').split(';').filter(Boolean).map(z => {
    const v = z.split(',');
    return v[1] === String(tipo) ? v[0] + ',3,' + v[2] : z;
  });
  return p[0] + '|' + p[1] + '|' + p[2] + '|' + pezzi.join(';');
}
const quantiTipo = (testo, tipo) =>
  (String(testo).split('|')[3] || '').split(';').filter(z => z && z.split(',')[1] === String(tipo)).length;

(async () => {
  const sg = await T.serviGioco(null);
  const cass = await T.serviCassetta({ frenoAcceso: false });
  const browser = await chromium.launch();
  const chiedi = (P, n, a, s) => P.pag.evaluate(([n, a, s]) => {
    const v = window.__test.giudica(n, a, { seme: String(s), taglia: 5 });
    return { verdetto: v.verdetto, causa: v.causa, gol: v.gol, passi: v.passi, avanzati: v.avanzati };
  }, [n, a, s]);
  try {
    const Gi = await T.apri(browser, sg.porta);

    /* ---- il nastro della sfida congelata, col seme giusto e sbagliato */
    const crudo = N.conPixel(N.allarga(FIX.replay));
    const d6 = quantiTipo(crudo, 6);
    const buono = await chiedi(Gi, crudo, [FIX.gol_a, FIX.gol_d], FIX.seme);
    const storto = await chiedi(Gi, crudo, [FIX.gol_a, FIX.gol_d], String(FIX.seme) + '7');
    const gonfio = await chiedi(Gi, crudo, [FIX.gol_a + 1, FIX.gol_d], FIX.seme);
    console.log('\nLA SFIDA CONGELATA (' + d6 + ' righe di tipo 6)');
    console.log('  seme giusto   ' + JSON.stringify(buono));
    console.log('  seme sbagliato' + JSON.stringify(storto));
    console.log('  punteggio +1  ' + JSON.stringify(gonfio));

    /* ---- il nastro di una serie vera, e il residuo del #147 */
    const A = await T.apri(browser, sg.porta);
    const B = await T.apri(browser, sg.porta);
    await T.collega(A, cass.porta, 'ALFA'); await T.collega(B, cass.porta, 'BETAX');
    await T.entra(A); await T.entra(B);
    const r = await A.pag.evaluate(async () => await window.__test.dischetto.crea());
    await B.pag.evaluate(async s => await window.__test.dischetto.entra(s), r.stanza);
    for (let g = 0; g < 400; g++) {
      for (const P of [A, B]) {
        const s = await d_stato(P);
        if (s && s.fase === 'scegli') await d_scegli(P, s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro));
      }
      await Promise.all([d_giro(A), d_giro(B)]);
      const sa = await d_stato(A), sb = await d_stato(B);
      if (sa.fase === 'fine' && sb.fase === 'fine') break;
    }
    const sA = await d_stato(A);
    const nA = await A.pag.evaluate(() => window.__test.nastro());
    const seg = [sA.serie.seg[0] | 0, sA.serie.seg[1] | 0];
    const s6 = quantiTipo(nA, 6);
    const residuo = togliTipo(togliTipo(nA, 15), 14);
    const solo15 = togliTipo(nA, 15);
    console.log('\nLA SERIE VERA ' + seg.join('-') + ' (' + s6 + ' righe di tipo 6, seme ' + sA.seme + ')');
    console.log('  intatta       ' + JSON.stringify(await chiedi(Gi, nA, seg, sA.seme)));
    console.log('  senza la 15   ' + JSON.stringify(await chiedi(Gi, solo15, seg, sA.seme)));
    console.log('  il residuo    ' + JSON.stringify(await chiedi(Gi, residuo, seg, sA.seme)));
    console.log('  seme sbagliato' + JSON.stringify(await chiedi(Gi, nA, seg, String(sA.seme) + '7')));

    await A.ctx.close(); await B.ctx.close(); await Gi.ctx.close();
  } finally {
    try { await browser.close(); } catch (e) {}
    try { sg.chiudi(); } catch (e) {}
    try { cass.chiudi(); } catch (e) {}
  }
})();
