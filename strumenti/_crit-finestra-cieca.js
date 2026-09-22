/* =====================================================================
   _crit-finestra-cieca.js — LE MISURE CI SONO E IL VAGLIO GUARDA SOLO
   LA PRIMA (voce #139, compito 1).

   IL FALSO. Il nastro porta tutte le misure, col tick giusto, nel
   posto giusto: il formato e' PERFETTO, e un controllo che guardi solo
   «il nastro porta i cambi» passerebbe. Ma `schermiDelNastro` si ferma
   alla prima riga di tipo 10, quindi il vaglio vede sempre UNA misura
   sola e il giudice accusa come prima.

   E' la meta' che conta: una riga che nessuno guarda non e' un dato,
   e' un commento. Lo stesso punto debole che la voce #132 aveva
   attaccato col marchio di troncatura (_crit-tronco-muto.js) e la voce
   #133 con la riga dello schermo (_crit-giudice-cieco-schermo.js).

   MISURATO: il banco resta VERDE su tutto il gruppo A — il gioco scrive
   davvero, e il conto delle righe nel nastro lo dice — e su C1-C4 e
   D1 D2 D3; ROSSO su B2 B3 B4 B5, su C5 e su D4/D5.

   uso:  node strumenti/_crit-finestra-cieca.js
   ===================================================================== */
require('./_crit-finestra.js').falso({
  nome: 'crit-finestra-cieca',
  titolo: 'le misure viaggiano, e il vaglio ne guarda una sola',
  morde: 'B2 B3 B4 B5, C5, D4 e D5 di _q-finestra.js (sette prove)',
  cerca: `      if(!c) v.push([w, h]);
    }
  }catch(e){}
  return v;
}`,
  metti: `      /* IL FALSO (_crit-finestra-cieca.js): la prima, e poi basta. */
      if(!c) v.push([w, h]);
      break;
    }
  }catch(e){}
  return v;
}`,
  attesi: [
    ['  schermo(w, h){', 1],
    ['  try{ Reg.schermo(VW, VH); }catch(e){}', 1],
    ["if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');", 1],
  ],
});
