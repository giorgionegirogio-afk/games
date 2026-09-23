/* =====================================================================
   _crit-motore-muto.js — L'IMPRONTA C'E' E NESSUNO LA GUARDA
   (voce #142, compito 3: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO, ED E' IL PIU' CATTIVO DEI QUATTRO perche' e' il difetto di
   oggi travestito da cura. La riga di tipo 11 si scrive, si serializza,
   si deserializza, `improntaDelNastro` la ritrova, `__test.improntaMotore`
   la restituisce: il formato e' PERFETTO, e un banco che si limitasse a
   chiedere «il nastro porta l'impronta?» passerebbe a pieni voti. Solo,
   il vaglio non la confronta con la propria — e allora il giudice accusa
   un onesto esattamente come prima.

   E' la meta' che conta: un dato che nessuno guarda non e' un dato, e'
   un commento. E' lo stesso falso che il #133 ha costruito per lo
   schermo (`_crit-giudice-cieco-schermo.js`) e il #132 per il marchio di
   troncatura (`_crit-tronco-muto.js`), sullo stesso punto debole — e se
   il banco di oggi non lo mordesse, sarebbe la terza volta che la stessa
   ferita si riapre nello stesso posto.

   IL BANCO DEVE CADERE SU: A2 (torna ad accusare), E (un nastro senza la
   riga del motore procede invece di astenersi), F e F2 (nessuna causa e
   nessuna impronta nel referto).
   IL BANCO DEVE RESTARE VERDE SU: A1 e A1b (il mascheramento e'
   irrilevante per chi non guarda), B (sullo stesso motore torna), C e D
   (l'impronta c'e', separa ed e' stabile).

   uso:  node strumenti/_crit-motore-muto.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-motore-muto',
  titolo: 'l\'impronta del motore viaggia nel nastro, e il giudice non la legge',
  morde: 'A2, E, F e F2 di _q-motore-nastro.js',
  cerca: `  const impNastro = improntaDelNastro();
  if(!impNastro) return no('INCOMPLETO','motore-js-ignoto');
  out.impronta = impNastro;
  if(impNastro !== improntaMotore()) return no('INCOMPLETO','motore-js-diverso');`,
  metti: `  /* IL FALSO (_crit-motore-muto.js): l'impronta si legge, si mette
     perfino nel referto, e non si confronta con niente. */
  const impNastro = improntaDelNastro();
  out.impronta = impNastro;`,
  attesi: [
    /* il formato resta perfetto: e' proprio questo che rende il falso cattivo */
    ["pezzi.push(dT + ',11,' + dMs + ',' + ((r[3]|0) >>> 0));", 1],
    ['else if(tipo === 11)  this.righe.push([tick, 11, ms, (v[3]|0) >>> 0]);', 1],
    ['    Reg.motore();', 1],
    ['function improntaMotore(){', 1],
    ['function improntaDelNastro(){', 1],
    ['  improntaMotore(){ return improntaMotore(); },', 1],
  ],
});
