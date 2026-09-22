/* USA E GETTA: genera strumenti/_nastro-duello-congelato.js pescando,
   da una sessione fresca del server finto, la sfida (deterministica: i
   semi sono assegnati in sequenza da 20260801) che passa naturalmente
   dal dischetto. Si rilancia solo se la fixture va rigenerata. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');

const RADICE = B.RADICE;
const MAX = 40;

(async () => {
  const sg = await B.serviGioco('');
  const ss = await B.serviServer();
  let browser;
  try {
    browser = await chromium.launch();
    const Bt = await B.apri(browser, sg.porta);
    const At = await B.apri(browser, sg.porta);
    await B.collega(Bt, ss.porta, 'BORGATA'); await B.collega(At, ss.porta, 'DOPOLAVORO');
    await B.entra(Bt); await B.entra(At); await B.pubblica(Bt); await B.pubblica(At);
    let trovata = null, n = 0;
    for (let i = 0; i < MAX; i++) {
      const s = await B.giocaUna(At, ss, [], 24000, 0);
      n = i + 1;
      if (s.partita && s.riga && s.fine && s.fine.duello) { trovata = s; break; }
    }
    if (!trovata) throw new Error('nessuna sfida con duello naturale su ' + MAX);
    const crudo = N.allarga(trovata.riga.replay);
    const scher = N.schermoDi(crudo);
    const out = `/* =====================================================================
   _nastro-duello-congelato.js — UNA SFIDA VERA, CONGELATA
   (voce #133, correzione di revisione, IMPORTANTE-2).

   PERCHE' ESISTE. Il caso INCOMPLETO/duello-senza-righe (la rigiocata
   arriva a un calcio piazzato di cui il nastro non ha i comandi) si
   costruisce da un nastro che abbia un duello VERO -- e col copione
   fisso di _sfida-due-telefoni.js una sfida su trenta ci passa
   (misurato dalla voce #132). Una prova che dipende da quella fortuna
   e' una prova che puo' non esercitarsi mai in una sessione data --
   ed e' esattamente il rilievo IMPORTANTE-2 della revisione finale del
   cantiere: due mutanti sul cammino 'divagata' passavano 18/18 perche'
   nessuna asserzione lo condannava con certezza.

   COME E' NATA. Il server finto assegna i semi in sequenza da 20260801
   (grep "semeProssimo" in _sfida-due-telefoni.js): a partire da una
   sessione vergine, la 12-esima sfida giocata dal copione fisso prende
   il seme ${trovata.riga.seme} e passa naturalmente dal dischetto (nessuna
   forzatura fuori banda: t.rigori() chiamato a meta' partita rompe la
   ripetibilita' del nastro, misurato e scartato -- vedi il verbale del
   22 settembre 2026 in MANUALE.md). Generata da
   strumenti/_gen-nastro-duello-congelato.js, che si puo' rilanciare se
   una cura futura del motore (MOTORE_V) invalida questa fixture.

   USO: _q-giudice.js la rigioca INTATTA (deve TORNARE) e poi senza le
   righe di tipo 6 del duello (N.senzaDuelli), che deve dare
   INCOMPLETO/duello-senza-righe -- deterministico, senza nuove sfide.
   ===================================================================== */
module.exports = {
  seme: ${JSON.stringify(String(trovata.riga.seme))},
  taglia: ${trovata.riga.taglia | 0},
  gol_a: ${trovata.riga.gol_a | 0},
  gol_d: ${trovata.riga.gol_d | 0},
  schermo: ${JSON.stringify(scher)},
  replay: ${JSON.stringify(String(trovata.riga.replay))},
};
`;
    fs.writeFileSync(path.resolve(RADICE, 'strumenti/_nastro-duello-congelato.js'), out);
    console.log('scritta dopo ' + n + ' sfide, seme ' + trovata.riga.seme + ', score ' +
      trovata.riga.gol_a + '-' + trovata.riga.gol_d + ', schermo ' + scher +
      ', replay ' + String(trovata.riga.replay).length + ' byte stretto / ' + crudo.length + ' crudo');
  } finally {
    if (browser) await browser.close();
    sg.chiudi(); ss.chiudi();
  }
})();
