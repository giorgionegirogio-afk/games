/* =====================================================================
   _crit-staffetta-sfrenata.js — IL FRENO CHE SI CHIEDE E SI IGNORA
   (voce #138, compito 1).

   IL FALSO. Chiama `frena` a ogni riga, come si deve — e poi tira
   dritto qualunque cosa risponda. E' il difetto che si scrive da solo
   quando si aggiunge il freno «dopo», per far contento un controllo:
   la chiamata c'e', il numero nel database sale, il registro e' pieno
   di chiamate al freno, e non frena niente.

   PERCHE' IL FRENO ESISTE, e va ripetuto perche' e' l'unica cosa che
   sta fra una staffetta e il piano gratuito: nessun freno del server si
   applica a questo processo. I sei `frenato(...)` stanno negli
   ENDPOINT, e la staffetta non passa da nessun endpoint — parla a
   PostgREST con la chiave di servizio, come le funzioni Vercel. Il
   freno che si impone da se' e' l'unico che ha, e vale anche fra due
   staffette lanciate insieme, che non condividono memoria.

   COSTRUITO NEL CASO PEGGIORE: la chiamata al freno RESTA (un banco che
   contasse le chiamate invece di guardarne l'effetto non se ne
   accorgerebbe — ed e' esattamente la trappola dell'attestare invece di
   misurare). Non accusa nessuno, apre le misure giuste, tiene il
   taccuino, riparte bene: passa A, B, C, D, F e anche E2, E3 ed E4.
   Cade solo su E1, che guarda se la staffetta SI FERMA.

   uso:  node strumenti/_crit-staffetta-sfrenata.js
   ===================================================================== */
const B = require('./_crit-staffetta.js');

B.falso({
  nome: 'sfrenata',
  titolo: 'chiede il permesso al freno e poi tira dritto',
  morde: 'E1 (il freno dice no e la staffetta va avanti lo stesso)',
  cambi: [
    { cerca: B.A_FRENO,
      metti: '        /* IL FALSO (_crit-staffetta-sfrenata.js): la chiamata c\'e\', il\n' +
             '           numero sale, e non frena niente. */\n' +
             '        if (banco.frena) await banco.frena();' },
  ],
  attesi: [
    [B.A_PAROLA, 1],
    [B.A_MISURA, 1],
    [B.A_RICORDA, 1],
    /* il tetto locale per giro resta in piedi: un falso che togliesse
       tutti i freni in una volta non direbbe quale prova morde */
    ['if (scelte.length >= tetto) { ref.tettoPieno = true; break; }', 1],
  ],
});
