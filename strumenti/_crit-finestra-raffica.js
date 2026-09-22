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

   MISURATO: il banco resta VERDE su diciannove prove su venti — il
   giudizio non si muove di una parola, perche' si contano le misure
   DISTINTE — e ROSSO sulla sola A5, che e' la ragione per cui il braccio
   RAFFICA esiste. In una partita normale questo falso non si vede
   nemmeno: `resize()` gira per intero solo sugli eventi veri, e
   `RESIZE_FORZA` durante una sfida a taglia immutata non si accende.

   uso:  node strumenti/_crit-finestra-raffica.js
   ===================================================================== */
require('./_crit-finestra.js').falso({
  nome: 'crit-finestra-raffica',
  titolo: 'una riga a ogni resize, anche quando la misura non e\' cambiata',
  morde: 'A5 di _q-finestra.js — una prova sola, ed e\' la sua',
  cerca: '    if(this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;',
  metti: '    /* IL FALSO (_crit-finestra-raffica.js): la guardia non guarda. */\n' +
         '    if(false && this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;',
  attesi: [
    ['  try{ Reg.schermo(VW, VH); }catch(e){}', 1],
    ["if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');", 1],
    ['    Reg.schermo(innerWidth|0, innerHeight|0);', 1],
  ],
});
