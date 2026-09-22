/* =====================================================================
   _crit-finestra-accusa.js — VEDE IL CAMBIO E LO CHIAMA UNA COLPA
   (voce #139, compito 1).

   IL FALSO. Tutto funziona: il nastro porta le misure, il vaglio le
   conta, il cambio viene visto. Solo che al posto dell'astensione esce
   l'accusa — `NON TORNA / schermo-cambiato` — cioe' l'unico verdetto
   che muove punti, che toglie i punti a due persone, alza un sospetto
   che non decade mai e chiude la riga per sempre.

   E' il falso piu' importante dei cinque, perche' e' l'errore che si
   fa per zelo: «il nastro e' sporco, quindi qualcuno ha barato». Un
   nastro che non si puo' verificare non e' la prova di niente, e tutta
   l'onda D esiste per non confondere le due cose.

   MISURATO: il banco resta VERDE su tutto A (il gioco scrive), su C1-C4
   e su D1 D2 D3 D5 — la frase e le misure sono quelle giuste, e' la
   PAROLA che e' sbagliata — e ROSSO su B2 B3 B4 B5, C5 e D4.

   uso:  node strumenti/_crit-finestra-accusa.js
   ===================================================================== */
require('./_crit-finestra.js').falso({
  nome: 'crit-finestra-accusa',
  titolo: 'il cambio di finestra diventa un\'accusa invece di un «non lo so»',
  morde: 'B2 B3 B4 B5, C5 e D4 di _q-finestra.js (sei prove)',
  cerca: "  if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');",
  metti: '  /* IL FALSO (_crit-finestra-accusa.js): la vede, e la chiama colpa. */\n' +
         "  if(sc.length > 1) return no('NON TORNA','schermo-cambiato');",
  attesi: [
    ['  schermo(w, h){', 1],
    ['  try{ Reg.schermo(VW, VH); }catch(e){}', 1],
    ["if(c === 'schermo-cambiato'){", 1],
  ],
});
