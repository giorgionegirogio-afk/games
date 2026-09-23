/* =====================================================================
   _crit-motore-pauroso.js — SI ASTIENE SEMPRE, ANCHE DA SE STESSO
   (voce #142, compito 3: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO, ED E' L'UNICO DEI QUATTRO CHE PASSA LA PROVA PRINCIPALE A
   PIENI VOTI. Il giudice si astiene su ogni nastro, qualunque sia
   l'impronta: zero accuse su Chromium, zero su Firefox, causa sempre
   giusta, referto sempre completo. La prova della condanna e' verde, e
   chi leggesse solo quella direbbe «cantiere chiuso».

   E' LA PERDITA DI COPERTURA MASCHERATA DA PRUDENZA. Un verificatore che
   non verifica mai niente non accusa nessun innocente: protegge gli
   onesti smettendo di proteggere chiunque altro. Tutte le sfide restano
   a `verificata = 0` per sempre, e chi bara non viene mai preso.

   PERCHE' UN BANCO CI CASCA. Perche' la prova naturale — «un nastro
   onesto su un motore diverso non deve essere accusato» — e' soddisfatta
   in pieno. Serve la META' OPPOSTA, che a quasi tutti i banchi di falsi
   manca: un nastro onesto sul motore GIUSTO deve ancora essere
   CONFERMATO.

   E QUESTO FALSO HA TROVATO UN BUCO NEL BANCO, il 23 settembre 2026.
   La prova A1 (l'esercizio) contava le accuse col motore mascherato e,
   trovandone zero, dichiarava «prova nulla» e usciva 3 — un 3 NON accusa
   il gioco, quindi il falso sarebbe passato per un banco che non poteva
   misurare invece che per un gioco rotto, e la prova B non veniva
   nemmeno stampata. Da qui A1b e lo spostamento della prova nulla in
   fondo: zero accuse perche' i nastri tornano e zero accuse perche' il
   giudice si e' astenuto sono due cose diverse, e solo la prima e'
   un'astensione del banco.

   IL BANCO DEVE CADERE SU: B (sullo stesso motore non conferma piu'
   niente) e A1b (si astiene a impronta coincidente).
   IL BANCO DEVE RESTARE VERDE SU: A2, A3, C, D, E, F, F2 — tutte.

   uso:  node strumenti/_crit-motore-pauroso.js
   ===================================================================== */
require('./_crit-giudice.js').falso({
  nome: 'crit-motore-pauroso',
  titolo: 'il giudice si astiene sempre, anche quando il motore e\' lo stesso',
  morde: 'B e A1b di _q-motore-nastro.js',
  cerca: `  if(impNastro !== improntaMotore()) return no('INCOMPLETO','motore-js-diverso');`,
  metti: `  /* IL FALSO (_crit-motore-pauroso.js): non accusa mai nessuno, e non
     conferma mai niente. Un verificatore che non verifica protegge gli
     onesti smettendo di proteggere chiunque altro. */
  if(impNastro !== improntaMotore() || true) return no('INCOMPLETO','motore-js-diverso');`,
  attesi: [
    ["pezzi.push(dT + ',11,' + dMs + ',' + ((r[3]|0) >>> 0));", 1],
    ['function improntaMotore(){', 1],
    ["  if(!impNastro) return no('INCOMPLETO','motore-js-ignoto');", 1],
  ],
});
