/* =====================================================================
   _crit-staffetta-smemorata.js — IL TACCUINO CHE RICORDA SOLO CIO' CHE
   IL DATABASE RICORDA GIA' (voce #138, compito 1).

   IL FALSO. Nel taccuino ci finiscono solo i due verdetti che CHIUDONO
   la riga — TORNA e NON TORNA. Sembra la scelta pulita: «il taccuino e'
   una cache del database, e nel database ci sta solo cio' che e'
   deciso». Ed e' invece il modo di renderlo inutile, perche' quei due
   verdetti il database li ricorda gia' da se' (la riga esce dalla pesca
   per il `verificata = 0`), e gli UNICI che il taccuino deve ricordare
   sono proprio i tre che restano a zero per disegno.

   COSA FA DAVVERO: la staffetta rimacina a ogni giro tutti i nastri
   ingiudicabili — quelli scritti prima di una cura, quelli di un altro
   motore, quelli senza riga di schermo — per sempre. Ogni giro costa un
   secondo per riga e non produce niente, e piu' la coda cresce meno
   riga nuova entra nella finestra: e' la staffetta che gira a vuoto
   mentre il referto dice che sta lavorando.

   COSTRUITO NEL CASO PEGGIORE: non accusa nessuno (B passa tutto),
   apre la misura giusta (C passa), rispetta il freno (E passa), le
   porte restano chiuse (F passa). E passa anche D1, D2, D3, D4 e D5 —
   perche' nessuno di quei cinque parla del lavoro sprecato: parlano di
   righe perse e di accuse doppie, e questo falso non ne fa. Cade su
   D3b, che e' la prova scritta apposta.

   uso:  node strumenti/_crit-staffetta-smemorata.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'smemorata',
  titolo: 'il taccuino ricorda solo i verdetti che chiudono la riga',
  morde: 'MISURATO: D3b, e SOLO D3b — trentuno prove su trentadue passano',
  cambi: [
    { cerca: B.A_RICORDA,
      metti: '        /* IL FALSO (_crit-staffetta-smemorata.js): «il taccuino e\' una\n' +
             '           cache del database». Gli unici che servono sono proprio i tre\n' +
             '           che il database non ricorda. */\n' +
             "        const daRicordare = !!tac && !finestraNegata &&\n" +
             "          (parola === 'TORNA' || parola === 'NON TORNA');" },
  ],
  attesi: [
    [B.A_PAROLA, 1],
    [B.A_MISURA, 1],
    [B.A_FRENO, 1],
    /* il salto delle righe gia' viste resta: e' il taccuino a mentire,
       non la pesca */
    ['if (tac && tac.ha(r.id)) { ref.saltate++; continue; }', 1],
  ],
});
