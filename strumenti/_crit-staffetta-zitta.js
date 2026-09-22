/* =====================================================================
   _crit-staffetta-zitta.js — LA STAFFETTA CHE MANDA SOLO LE ACCUSE
   (voce #138, compito 1).

   IL FALSO. Spedisce `NON TORNA` e tace su tutto il resto, TORNA
   compreso: «i TORNA non cambiano niente, perche' sprecare una
   chiamata?». Sembra un'ottimizzazione e invece e' il rovescio esatto
   dello scopo del cantiere.

   PERCHE' E' GRAVE, e non e' solo una colonna che resta a zero. La
   voce #134 ha portato la colonna `verificata` fino alla riga della
   lista sul telefono di chi ha subito: con questo falso quella riga
   dice «DA VERIFICARE» per sempre a tutti gli onesti, e l'unica parola
   che arriva a destinazione e' l'accusa. Un sistema che scrive solo
   quando condanna non e' un verificatore: e' un elenco di sospetti.

   E c'e' il danno tecnico, che e' peggio del danno morale: le righe
   oneste non si chiudono mai, quindi tornano nella pesca a ogni giro
   (il `verificata = 0`), e la coda cresce per sempre. Il taccuino le
   salta — cioe' NESSUNO le guardera' piu', ma nel database restano
   aperte in eterno.

   COSTRUITO NEL CASO PEGGIORE: il verdetto RIFERITO e' giusto per tutte
   e sei le righe (B1 passa), la misura e' quella giusta (C1, C2, C4
   passano), il taccuino funziona (D3b passa), il freno si rispetta (E1,
   E2, E3, E4 passano), le porte restano chiuse (F passa).

   E MORDE PIU' DI UNA PROVA, e si dichiara invece di ammorbidire le
   altre: cade su B2 (zero verificate) e B5, e di rimbalzo su D1, D2 e
   D3, che confrontano lo STATO FINALE con quello di un giro pulito. Una
   staffetta che non chiude i TORNA ha uno stato finale diverso per
   costruzione, e dirlo e' piu' onesto che togliere dal gruppo D il
   confronto che gli serve.

   uso:  node strumenti/_crit-staffetta-zitta.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'zitta',
  titolo: 'manda solo le accuse, i TORNA li tiene per se\'',
  morde: 'MISURATO (sweep del 22 settembre 2026, banco a 42 controlli): B2 B6 C6b D4 E1 E1b E2 E3b G1 G3 G7 — 11 su 42 — zero righe chiuse a 1, e sei prove che contano le chiamate al database',
  cambi: [
    { cerca: B.A_MANDA,
      metti: "        /* IL FALSO (_crit-staffetta-zitta.js): «i TORNA non cambiano\n" +
             "           niente, perche' sprecare una chiamata?». */\n" +
             "        if (!asciutto && parola === 'NON TORNA') {" },
  ],
  attesi: [
    [B.A_PAROLA, 1],
    [B.A_MISURA, 1],
    [B.A_RICORDA, 1],
    [B.A_FRENO, 1],
  ],
});
