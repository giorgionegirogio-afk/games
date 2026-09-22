/* =====================================================================
   _crit-finestra-raffica.js — UNA RIGA A OGNI RESIZE, ANCHE A MISURA
   IMMUTATA (voce #139, compito 1).

   IL FALSO. `Reg.schermo` perde la guardia che confronta la misura con
   l'ultima scritta: ogni giro di `resize()` lascia una riga nel nastro,
   anche quando la finestra non si e' mossa di un pixel. Il giudizio non
   cambia — si contano le misure DISTINTE — quindi nessun innocente
   viene accusato: cambia il PESO del nastro.

   E NON E' UN CASO DI SCUOLA. Il commento di `resize()` lo dice da se':
   «la barra del browser che compare e sparisce scatena resize a
   raffica». Quella guardia li' ferma gli eventi a misura immutata, ma
   `RESIZE_FORZA` (lo accende `setTaglia`) fa girare `resize()` per
   intero anche a finestra ferma — ed e' esattamente il buco da cui un
   nastro si riempie di righe che non dicono niente, fino al tetto delle
   40.000 e al marchio di troncatura (#132), che a quel punto direbbe
   «INCOMPLETO / nastro-troncato» su una partita onesta.

   Il banco deve restare VERDE su B, C e D — il giudizio non si muove —
   e ROSSO sul conto delle righe.

   uso:  node strumenti/_crit-finestra-raffica.js
   ===================================================================== */
require('./_crit-finestra.js').falso({
  nome: 'crit-finestra-raffica',
  titolo: 'una riga a ogni resize, anche quando la misura non e\' cambiata',
  morde: 'A3, A4 e A5 di _q-finestra.js',
  cerca: '    if(this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;',
  metti: '    /* IL FALSO (_crit-finestra-raffica.js): la guardia non guarda. */\n' +
         '    if(false && this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;',
  attesi: [
    ['  try{ Reg.schermo(VW, VH); }catch(e){}', 1],
    ["if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');", 1],
    ['    Reg.schermo(innerWidth|0, innerHeight|0);', 1],
  ],
});
