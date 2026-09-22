/* =====================================================================
   _crit-staffetta-avvelenata.js — LA PROVA A VUOTO CHE AVVELENA IL
   TACCUINO (voce #138, compito 3).

   IL FALSO. Una condizione tolta: anche il giro a vuoto (`--asciutto`)
   scrive nel taccuino. E' la versione che questa staffetta AVEVA
   davvero, trovata rileggendo il codice e non da un rosso — nessuna
   prova la condannava, perche' E3 guardava il database e le chiamate, e
   il taccuino nessuno lo apriva.

   COSA FA DAVVERO, e non si vede da nessuna parte. `--asciutto` esiste
   per guardare prima di far muovere punti: giudica e non manda niente,
   quindi quelle righe restano a `verificata = 0`. Se finiscono nel
   taccuino, il giro VERO del giorno dopo le SALTA — e non le guardera'
   mai piu' nessuno. Una riga onesta resta «DA VERIFICARE» per sempre;
   una disonesta pure. Il referto del giro a vuoto e' pieno di verdetti
   giusti, il database e' intatto, nessuno e' stato accusato: tutto a
   posto, tranne che il lavoro e' stato buttato E le righe sono perse.

   E' il difetto nella forma piu' insidiosa che questo cantiere abbia
   incontrato: **non sbaglia niente, dimentica**.

   COSTRUITO NEL CASO PEGGIORE: E3 resta verde (il database non si
   muove, zero chiamate, tre verdetti giusti), e passano tutti e sette
   gli altri gruppi. Cade solo su E3b, che e' la prova scritta apposta.

   uso:  node strumenti/_crit-staffetta-avvelenata.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'avvelenata',
  titolo: 'la prova a vuoto scrive nel taccuino, e quelle righe non torneranno mai piu\'',
  morde: 'MISURATO (sweep del 22 settembre 2026, banco a 42 controlli): E3b — 1 su 42 — e SOLO E3b: quarantuno prove su quarantadue passano',
  cambi: [
    { cerca: '        if (daRicordare && !asciutto)',
      metti: '        /* IL FALSO (_crit-staffetta-avvelenata.js): «ho un verdetto,\n' +
             "           me lo segno» — anche quando non l'ho mandato a nessuno. */\n" +
             '        if (daRicordare)' },
  ],
  attesi: [
    [B.A_PAROLA, 1],
    [B.A_MISURA, 1],
    [B.A_RICORDA, 1],
    [B.A_FRENO, 1],
    /* il giro a vuoto continua a NON mandare niente: e' quel che rende
       il falso silenzioso invece che goffo */
    [B.A_MANDA, 1],
  ],
});
