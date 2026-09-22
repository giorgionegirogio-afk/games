/* =====================================================================
   _crit-staffetta-rassegnata.js — LA FINESTRA NEGATA FINISCE NEL
   TACCUINO (voce #138, compito 3).

   IL FALSO. Una riga sola: anche la finestra negata si scrive nel
   taccuino. Sembra coerente — «il giudice ha risposto, ho un verdetto,
   me lo segno» — e invece e' il modo di perdere righe per sempre.

   LA DIFFERENZA FRA UN «NON LO SO» E UN GUASTO. Un
   INCOMPLETO/schermo-ignoto e' una proprieta' del NASTRO: quel nastro
   non dira' mai quale schermo vuole, e rigiudicarlo domani dara' lo
   stesso verdetto — nel taccuino ci va, se no si rimacina in eterno. Un
   INCOMPLETO/schermo-diverso su una riga per cui la staffetta aveva
   chiesto PROPRIO quella misura e' un'altra cosa: e' la MACCHINA che
   non ha dato la finestra (uno schermo piu' grande del display, una
   barra del browser, un server X che ridimensiona). Domani, su un'altra
   macchina, quella riga si giudica benissimo.

   COSA FA DAVVERO: la riga entra nel taccuino, il giro dopo la salta, e
   nessuno la guardera' mai piu'. Resta a `verificata = 0` in eterno con
   dentro un imbroglio o un'onesta — non si sapra'. E non si vede da
   nessuna parte: il referto continua a gridare la finestra negata, il
   database non si muove, nessuno viene accusato.

   COSTRUITO NEL CASO PEGGIORE: il grido nel referto RESTA (un banco che
   guardasse solo `finestreNegate` non se ne accorgerebbe — e' la stessa
   trappola dell'attestare invece di misurare), e tutto il resto passa:
   i verdetti sono giusti, le misure sono giuste, la ripartenza
   funziona, il freno si rispetta, il filo e' quello.

   uso:  node strumenti/_crit-staffetta-rassegnata.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'rassegnata',
  titolo: 'anche la finestra negata si scrive nel taccuino, e quella riga non torna mai piu\'',
  morde: 'MISURATO (sweep del 22 settembre 2026, banco a 42 controlli): C6 C6b — 2 su 42 — e SOLO quelle due: quaranta prove su quarantadue passano',
  cambi: [
    { cerca: B.A_RICORDA,
      metti: '        /* IL FALSO (_crit-staffetta-rassegnata.js): «il giudice ha\n' +
             '           risposto, ho un verdetto, me lo segno». */\n' +
             '        const daRicordare = !!tac && !!parola;' },
  ],
  attesi: [
    [B.A_PAROLA, 1],
    [B.A_MISURA, 1],
    [B.A_FRENO, 1],
    /* il grido nel referto resta: e' quel che rende il falso cattivo */
    ['if (finestraNegata) ref.finestreNegate.push(', 1],
  ],
});
