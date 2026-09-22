/* =====================================================================
   _crit-finestra-sorda.js — LA FINESTRA SI MUOVE E IL NASTRO NON LO SA
   (voce #139, compito 1: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. La porta c'e' (`Reg.schermo`), il vaglio guarda le misure
   distinte, la frase e' quella giusta: la meta' che GIUDICA e' intera.
   Manca solo l'anello in mezzo — `resize()` non lo dice al registro —
   e allora nel nastro resta la sola misura di partenza, esattamente
   come prima della cura.

   E' la forma piu' insidiosa del difetto, perche' tutto quello che si
   legge nel codice dice che la cura c'e'. Una cura fatta a meta' e' il
   modo piu' economico di sembrare curati.

   MISURATO: il banco resta ROSSO su A2 A3 A4 A5 (il gioco non scrive),
   su tutto il gruppo B (senza la seconda misura il giudice torna ad
   accusare: NON TORNA sul braccio che cambia) e su D4/D5, e VERDE su A1,
   su tutto il gruppo C e su D1 D2 D3 — i nastri vecchi e le parole di
   sempre non c'entrano niente con questo falso, e la meta' che GIUDICA
   e' intera (C5, che infila la seconda misura in Node, passa).

   uso:  node strumenti/_crit-finestra-sorda.js
   ===================================================================== */
require('./_crit-finestra.js').falso({
  nome: 'crit-finestra-sorda',
  titolo: 'resize() non lo dice al registro',
  morde: 'A2 A3 A4 A5, B2 B3 B4 B5, D4 e D5 di _q-finestra.js (dieci prove)',
  cerca: '  try{ Reg.schermo(VW, VH); }catch(e){}',
  metti: '  /* IL FALSO (_crit-finestra-sorda.js): la porta c\'e\', e da qui\n' +
         '     nessuno ci passa mai. */\n' +
         '  if(false) try{ Reg.schermo(VW, VH); }catch(e){}',
  attesi: [
    ['  schermo(w, h){', 1],
    ["if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');", 1],
    ['    Reg.schermo(innerWidth|0, innerHeight|0);', 1],
  ],
});
