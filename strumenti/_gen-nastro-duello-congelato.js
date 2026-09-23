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

   COME E' NATA. Cercata giocando sfide vere in sequenza (stesso copione
   fisso di _sfida-due-telefoni.js, server finto, nessuna forzatura
   fuori banda) finche' una non e' passata da sola dal dischetto: il
   server assegna i semi in ordine da 20260801, ma QUANTE sfide servano
   per trovarne una con un duello non e' fisso da sessione a sessione
   (la ricerca dell'avversario nel server finto consuma un numero di
   turni variabile) -- il seme ${trovata.riga.seme} e' semplicemente quello su
   cui e' capitata la ricerca l'ultima volta, alla ${n}-esima sfida. NON e'
   un numero da cui si possa dedurre "la N-esima sfida ce l'ha sempre":
   e' solo il seme di QUESTA fixture, congelato cosi' com'e' uscito.
   PROVATO E SCARTATO: forzare rigori() a meta' partita con l'azione
   fuori banda del copione (vedi B.giocaUna, parametro \`azioni\`) rompe
   la ripetibilita' del nastro -- giudicato INTATTO da' NON TORNA
   invece di TORNA, perche' quella chiamata non e' una riga del nastro
   e sul replay non si ripete (misurato il 22 settembre 2026, revisione
   voce #133). Un nastro non ripetibile non e' un nastro vero: da qui
   la scelta di cercare un duello NATURALE invece di forzarlo.
   Generata da strumenti/_gen-nastro-duello-congelato.js, che si puo'
   rilanciare se una cura futura del motore (MOTORE_V) invalida questa
   fixture -- ED E' SUCCESSO: la voce #143 ha portato MOTORE_V da 2 a 3
   (le trascendenti scritte in casa) e la fixture di allora veniva
   respinta con ALTRO MOTORE/motore-diverso da quattro banchi in una
   volta (giudice, finestra, staffetta, e la staffetta su sette prove).
   Il rifiuto era GIUSTO -- e' la guardia che fa il suo mestiere -- e la
   cura e' rigenerare, non allentare.

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
