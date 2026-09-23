/* =====================================================================
   _toppa-143-motorev.js — MOTORE_V SALE A 3, E LA MISURA STA ACCANTO
   (voce #143, compito 4)

   La regola di casa: `MOTORE_V` si incrementa quando una cura cambia
   l'esito di SEQUENZE DI COMANDI IDENTICHE. Il #131, il #132 e il #133
   l'hanno lasciato a 2 dopo averlo MISURATO — 30 nastri su 30 identici.
   Il #143 lo alza per la stessa ragione al contrario, e con lo stesso
   metodo: MISURATO con `strumenti/_t-143-motorev.js`, 23 settembre
   2026, sei nastri registrati sul gioco di prima (`a2607d0`) e
   rigiocati sul curato, taglia 5, 2400 passi, semi da 20260923: **sei
   su sei finiscono in una partita diversa**, e tutti e sei divergono
   entro il quarto campione — uno al terzo, cinque al quarto, cioe'
   entro il primo secondo e mezzo di partita.

   PERCHE' NON E' UNA FORMALITA'. Un nastro e' {seme, comandi}: il
   difensore di una sfida lo guarda, e il verificatore differito lo
   RIGIOCA per decidere se qualcuno ha imbrogliato. Un nastro scritto
   col motore vecchio, rigiocato col motore nuovo che non lo dichiara,
   finisce con un punteggio diverso — e il verdetto e' NON TORNA, cioe'
   punti tolti a DUE persone e un sospetto che non decade mai. E'
   letteralmente il critico che il #142 ha appena curato, per un'altra
   causa: allora era il motore JAVASCRIPT, qui e' il motore DI GIOCO.

   Con MOTORE_V a 3 la guardia che esiste gia' in `vagliaNastro` scatta
   da sola: verdetto ALTRO MOTORE, causa `motore-diverso`, nessun
   accusato, nessun punto mosso, e il risultato resta quello scritto
   nella lista. Si perde il film, non la persona.

   uso:  node strumenti/_toppa-143-motorev.js ingresso.html uscita.html
   ===================================================================== */
'use strict';
const fs = require('fs');

const CAMBI = [];
const agg = (nome, cerca, sostituisci) => CAMBI.push({ nome, cerca, sostituisci });

/* ------------------------------------------------------------------
   1) il numero, con la misura accanto
   ------------------------------------------------------------------ */
agg('MOTORE_V a 3', `   un posto in piu' dove la stessa ferita si riapre da sola.
   ===================================================================== */
const MOTORE_V = 2;`,
`   un posto in piu' dove la stessa ferita si riapre da sola.

   RETTIFICA A EDIZIONI (23 settembre 2026, voce #143). Il numero qui
   sotto **non e' piu' 2, e' 3**, e il motivo e' la prima cura di questo
   programma che cambia la simulazione DA CIMA A FONDO: le funzioni
   trascendenti — sin, cos, tan, exp, log, atan2, hypot — non sono piu'
   quelle del motore JavaScript del telefono, sono scritte in casa con
   sole operazioni che IEEE-754 obbliga a essere correttamente
   arrotondate. Serviva perche' V8, JavaScriptCore e SpiderMonkey
   davano l'ultimo bit diverso e quindi partite diverse (voce #141, 0
   semi concordi su 8); adesso ne danno 20 su 20.

   Ma un ultimo bit diverso e' comunque un numero diverso, e i nastri
   scritti prima lo portano dentro. MISURATO con
   strumenti/_t-143-motorev.js: sei nastri registrati sul gioco di
   prima (a2607d0) e rigiocati sul curato, taglia 5, 2400 passi, semi
   da 20260923, **sei su sei finiscono in una partita diversa**, e tutti
   e sei entro il quarto campione — uno al terzo, cinque al quarto,
   cioe' entro il primo secondo e mezzo di partita. Le righe precedenti restano
   com'erano scritte: dicevano il vero quando furono scritte, e il
   metodo che descrivono e' quello che ha deciso anche questa volta.
   ===================================================================== */
const MOTORE_V = 3;`);

/* ------------------------------------------------------------------
   2) la riga del #131 che diceva «MOTORE_V e' rimasto 2»: si rettifica
      in chiaro invece di cancellarla, e si dice cosa succede adesso
   ------------------------------------------------------------------ */
agg('rettifica del marchio di tipo 5', `       l'hanno davvero, e MOTORE_V e' rimasto 2 — misurato, 30 nastri su
       30 — proprio perche' questo controllo li tiene fuori. Il giorno che
       MOTORE_V salisse, questo blocco si potrebbe togliere: i nastri
       vecchi verrebbero gia' respinti dal confronto di versione, qui
       sopra.`,
`       l'hanno davvero, e MOTORE_V e' rimasto 2 — misurato, 30 nastri su
       30 — proprio perche' questo controllo li tiene fuori. Il giorno che
       MOTORE_V salisse, questo blocco si potrebbe togliere: i nastri
       vecchi verrebbero gia' respinti dal confronto di versione, qui
       sopra.

       RETTIFICA A EDIZIONI (23 settembre 2026, voce #143). Quel giorno
       e' arrivato: MOTORE_V vale 3 (sei nastri su sei rigiocati diversi,
       strumenti/_t-143-motorev.js), quindi i nastri col marchio di tipo
       5 sono gia' tutti respinti dal confronto di versione qui sopra e
       questo blocco non vede piu' nessuno. NON SI TOGLIE LO STESSO, ed
       e' una scelta: e' l'unica guardia che separa «il duello non c'era
       nel nastro» da «il motore e' cambiato», e il giorno in cui
       qualcuno rimettesse in circolo un nastro di allora — una prova,
       una migrazione, un archivio — tornerebbe a essere l'unica cosa fra
       chi guarda e una partita inventata. Costa un confronto di interi
       per nastro.`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-143-motorev.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(c.nome + ': ancoraggio trovato ' + n + ' volte (ne serve esattamente 1)'); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
if ((t.match(/const MOTORE_V = 3;/g) || []).length !== 1) { console.error('TOPPA NON APPLICATA: MOTORE_V non e\' 3 una volta sola'); process.exit(1); }
fs.writeFileSync(usc, t);
console.log('toppa applicata: MOTORE_V 2 -> 3, ' + CAMBI.length + ' cambi, ' + ing + ' -> ' + usc);
