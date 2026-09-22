/* =====================================================================
   _crit-finestra-estremi.js — SOLO LA PRIMA E L'ULTIMA MISURA
   (voce #139, compito 1).

   IL FALSO. `Reg.schermo` scrive la prima misura e poi, a ogni cambio,
   SOVRASCRIVE la piu' recente invece di aggiungerne una. Nel nastro
   restano la misura di partenza e quella di arrivo, e nient'altro.

   E' il falso che giustifica il TERZO BRACCIO del banco. Su una
   partita che va e basta (915x412 -> 915x352) questo gioco e' identico
   a quello onesto: due righe, due misure, astensione. Solo sulla
   finestra che VA E TORNA (412 -> 352 -> 412) le due misure diventano
   una sola — la partenza e l'arrivo coincidono — e il giudice accusa
   un innocente che ha giocato meta' partita con un altro campo sotto
   le dita. Senza il braccio TORNA, questo falso passerebbe.

   MISURATO: il banco resta VERDE su A1 A2 A3, su B1 B2 B3 B4, su tutto
   il gruppo C e su tutto il gruppo D, e ROSSO su A4, A5 e B5. E' l'UNICO
   dei cinque che morde B5 lasciando passare B2/B3/B4: senza il braccio
   TORNA passerebbe con diciotto verdi su venti.

   uso:  node strumenti/_crit-finestra-estremi.js
   ===================================================================== */
require('./_crit-finestra.js').falso({
  nome: 'crit-finestra-estremi',
  titolo: 'nel nastro restano solo la prima misura e l\'ultima',
  morde: 'A4, A5 e B5 di _q-finestra.js (tre prove, e B5 solo lui)',
  cerca: `  schermo(w, h){
    if(this.modo !== 1) return;
    w = w|0; h = h|0;
    if(this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;
    this.ultimoSchermo = [w, h];
    this.scrivi(10, [w, h]);
  },`,
  metti: `  schermo(w, h){
    if(this.modo !== 1) return;
    w = w|0; h = h|0;
    if(this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;
    /* IL FALSO (_crit-finestra-estremi.js): la prima riga si aggiunge,
       tutte le altre SOVRASCRIVONO la piu' recente. Restano la partenza
       e l'arrivo, e una finestra che torna da dov'era sembra non essersi
       mai mossa. */
    const primo = !this.ultimoSchermo;
    this.ultimoSchermo = [w, h];
    if(primo){ this.scrivi(10, [w, h]); this.i10 = this.righe.length - 1; return; }
    for(let k = this.righe.length - 1; k > this.i10; k--){
      if(this.righe[k][1] === 10){ this.righe[k][3] = w; this.righe[k][4] = h; return; }
    }
    this.scrivi(10, [w, h]);
  },`,
  attesi: [
    ['  try{ Reg.schermo(VW, VH); }catch(e){}', 1],
    ["if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');", 1],
    ['    Reg.schermo(innerWidth|0, innerHeight|0);', 1],
  ],
});
