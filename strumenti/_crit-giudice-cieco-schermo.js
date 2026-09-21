/* =====================================================================
   _crit-giudice-cieco-schermo.js — LA RIGA C'E' E NESSUNO LA GUARDA
   (voce #133, compito 3: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO. La riga di tipo 10 si scrive, si serializza, si
   deserializza — il formato e' PERFETTO, e un controllo che guardi solo
   «il nastro porta lo schermo» passerebbe. Ma i due che la leggono
   (`giudica` e `chiudiSfida`) trovano sempre null, quindi il giudice
   accusa lo stesso e il replay continua a dare la colpa alla rosa.

   E' la meta' che conta: una riga che nessuno guarda non e' un dato, e'
   un commento. E' lo stesso falso che la voce #132 ha costruito per il
   marchio di troncatura (`_crit-tronco-muto.js`), sullo stesso punto
   debole.

   Il banco deve restare rosso sulle prove B e D di
   _t-giudice-schermo.js, e VERDE su A, C ed E — la riga viaggia ancora,
   e a schermo uguale non cambia niente.

   uso:  node strumenti/_crit-giudice-cieco-schermo.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-giudice-cieco-schermo',
  titolo: 'la riga dello schermo viaggia, e nessuno la legge',
  morde: 'B e D di _t-giudice-schermo.js',
  cerca: '    for(const r of Reg.righe) if(r[1] === 10) return [r[3]|0, r[4]|0];',
  metti: '    /* IL FALSO (_crit-giudice-cieco-schermo.js): la riga c\'e\', e chi\n' +
         '       la cerca non la trova mai. */\n' +
         '    if(false) for(const r of Reg.righe) if(r[1] === 10) return [r[3]|0, r[4]|0];',
  attesi: [
    ["pezzi.push(dT + ',10,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));", 1],
    ['else if(tipo === 10)  this.righe.push([tick, 10, ms, v[3], v[4]]);', 1],
    ['Reg.scrivi(10, [innerWidth|0, innerHeight|0]);', 1],
    ["return fermo('INCOMPLETO','schermo-diverso', { schermo:sc });", 1],
  ],
});
