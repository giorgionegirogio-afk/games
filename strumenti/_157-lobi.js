/* =====================================================================
   _157-lobi.js — PERCHE' LA MISURA DEL MUSO CHE LA GIURIA HA PROPOSTO
   NON PUO' FUNZIONARE, dimostrato invece che affermato.

   Il verbale del giro 3 chiedeva, per il criterio C2: «il baricentro
   della maschera-testa stia fuori dal centro della sua scatola, verso
   il davanti, in 8 casi su 8». E' una misura ragionevole a leggerla, ed
   e' sbagliata a farla: va nel verso OPPOSTO a cio' che il criterio
   chiede, e non per poco.

   IL PERCHE', in una riga: una sporgenza STRETTA allunga la scatola di
   tutta la sua lunghezza e sposta il baricentro di pochissimo, perche'
   porta poca area. Quindi piu' il muso rompe il contorno — che e'
   esattamente cio' che la giuria vuole — piu' il centro della scatola
   scappa in avanti e il baricentro resta indietro.

   QUI SI MISURA, non si argomenta. La testa del gioco e' l'unione di
   tre cerchi: il cranio (raggio 1), la NUCA scostata all'indietro e il
   MUSO scostato in avanti, tutti e tre ingrassati del contorno. Si
   integra su una griglia fitta, si prende il baricentro dell'unione e
   il centro della sua scatola, e si stampa lo scarto in frazione della
   semi-scatola — lo stesso numero che _157-misure.js legge sui pixel.

   USO:  node strumenti/_157-lobi.js
   Non apre il gioco, non ha bisogno del server: e' aritmetica.
   ===================================================================== */
const BD = 0.09;          // il contorno, in frazioni del raggio della testa
const N = 700, R = 2.4;   // griglia e mezzo lato dell'integrazione

function misura(no, nr, mo, mr) {
  let sx = 0, n = 0, x0 = 9, x1 = -9;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = -R + 2*R*(i+0.5)/N, y = -R + 2*R*(j+0.5)/N;
    const dentro = (x*x + y*y) <= (1+BD)*(1+BD)
                || ((x+no)*(x+no) + y*y) <= (nr+BD)*(nr+BD)
                || ((x-mo)*(x-mo) + y*y) <= (mr+BD)*(mr+BD);
    if (!dentro) continue;
    sx += x; n++;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
  }
  const c = sx/n, bc = (x0+x1)/2;
  return { sporg: (c-bc)/((x1-x0)/2), avanti: x1, dietro: -x0 };
}

const CASI = [
  ['la testa di ieri  (nuca 0,62/0,77 · muso assente)', 0.62, 0.77, 0.00, 0.00],
  ['muso RIENTRATO    (nuca 0,48/0,74 · muso 0,32/0,62)', 0.48, 0.74, 0.32, 0.62],
  ['la testa di oggi  (nuca 0,34/0,68 · muso 0,50/0,64)', 0.34, 0.68, 0.50, 0.64],
  ['muso SPORGENTE    (nuca 0,34/0,64 · muso 0,46/0,74)', 0.34, 0.64, 0.46, 0.74],
  ['muso MOLTO fuori  (nuca 0,30/0,62 · muso 0,50/0,76)', 0.30, 0.62, 0.50, 0.76],
];

console.log('[157-lobi] il baricentro contro il centro della scatola, su tre cerchi');
console.log('  caso                                                  avanti  dietro   baricentro');
let peggio = null;
for (const [nome, no, nr, mo, mr] of CASI) {
  const m = misura(no, nr, mo, mr);
  console.log('  ' + nome.padEnd(52)
            + m.avanti.toFixed(2).padStart(6) + m.dietro.toFixed(2).padStart(8)
            + ((m.sporg>=0?'+':'') + m.sporg.toFixed(3)).padStart(13));
  if (!peggio || m.avanti > peggio.avanti) peggio = { avanti: m.avanti, sporg: m.sporg, nome };
}
console.log('');
console.log('  LA LETTURA: la colonna «avanti» e la colonna «baricentro» vanno in');
console.log('  direzioni OPPOSTE. Il caso col muso piu' + "'" + ' sporgente (' + peggio.nome.trim().split(' ')[1] + ')');
console.log('  prende il baricentro piu' + "'" + ' basso. La misura proposta dalla giuria');
console.log('  penalizza esattamente la testa che il criterio C2 chiede.');
console.log('  Percio' + "'" + ' _157-misure.js la stampa ma non ci decide sopra: decide la');
console.log('  DIREZIONE DI MASSIMA SPORGENZA, che e' + "'" + ' la domanda del criterio');
console.log('  («si indovina il davanti entro +-45 gradi») e non ha questo rovescio.');
