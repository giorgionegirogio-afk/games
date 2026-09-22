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

   Il banco deve restare ROSSO sul gruppo A (il gioco non scrive) e sul
   gruppo B (senza la seconda misura il giudice torna ad accusare), e
   VERDE su C e su D2/D3 — i nastri vecchi e le parole di sempre non
   c'entrano niente con questo falso.

   uso:  node strumenti/_crit-finestra-sorda.js
   ===================================================================== */
require('./_crit-finestra.js').falso({
  nome: 'crit-finestra-sorda',
  titolo: 'resize() non lo dice al registro',
  morde: 'A2 A3 A4 A5 e il gruppo B di _q-finestra.js',
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
