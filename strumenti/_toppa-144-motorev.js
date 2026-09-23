/* =====================================================================
   _toppa-144-motorev.js — MOTORE_V DA 3 A 4
   (voce #144, compito 3)

   UNA SOSTITUZIONE, e il numero non viene da un ragionamento: viene da
   strumenti/_t-144-motorev.js, che ha misurato nei DUE VERSI.

   VERSO 1 — la cura e' NEUTRA. Quattro nastri registrati sul merge-base
   (c71a83e) e rigiocati sul curato: **quattro su quattro identici**,
   ottanta campioni d'impronta ciascuno, stesso punteggio, nessuno
   scarto. Il primo criterio di MOTORE_V — «una cura cambia l'esito di
   sequenze di comandi identiche» — NON scatta, ed era giusto
   attenderselo: `risolvi` e' pura, `applica` e' il corpo di prima riga
   per riga, e i tipi 0 e 1 restano leggibili.

   VERSO 2 — ma il formato e' ASIMMETRICO, e l'asimmetria e' pericolosa
   in una sola direzione. Quattro nastri registrati sul curato e
   rigiocati sul gioco di ieri: **quattro su quattro finiscono in una
   partita diversa**, e tutti e quattro allo stesso campione — il primo,
   cioe' entro il primo mezzo secondo. Il gioco vecchio non conosce i
   tipi 12 e 13, `esegui` non ha un ramo per loro e li butta in silenzio:
   **legge 170 righe su 2749**, cioe' perde il 94% dei comandi, e rigioca
   una partita in cui nessuno ha mai toccato lo schermo.

   Quel telefono non e' un'ipotesi: e' una copia in cache che non si e'
   aggiornata, ed e' proprio il caso che il service worker di casa rende
   facile (ignora la query string, quindi un `?v=N` non lo sveglia).
   Senza questa riga direbbe **NON TORNA** a un onesto — l'unico verdetto
   che muove punti, che li toglie a DUE persone, alza un sospetto che non
   decade mai e chiude la riga per sempre.

   Con MOTORE_V a 4 quel telefono dice invece **ALTRO MOTORE /
   motore-diverso**: un'astensione con la causa vera, e la riga resta a
   `verificata = 0` finche' qualcuno con la versione giusta la rigioca.

   IL PREZZO, DICHIARATO. I nastri v3 gia' sul server diventano
   ingiudicabili — si astengono, non vengono accusati. Costa poco perche'
   il #143 ha alzato MOTORE_V a 3 IERI: i nastri v3 esistenti hanno meno
   di un giorno. E il verso 1 dice che la cura non era obbligata a
   rompere niente: si rompe qui, apposta, per non accusare nessuno.

   uso:  node strumenti/_toppa-144-motorev.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CERCA =
`   metodo che descrivono e' quello che ha deciso anche questa volta.
   ===================================================================== */
const MOTORE_V = 3;`;

const METTI =
`   metodo che descrivono e' quello che ha deciso anche questa volta.

   RETTIFICA A EDIZIONI (23 settembre 2026, voce #144). Il numero qui
   sotto **non e' piu' 3, e' 4**, e stavolta NON perche' la simulazione
   sia cambiata: e' cambiato che cosa si REGISTRA. I comandi non sono
   piu' pixel (tipi 0 e 1) ma atti risolti (tipi 12 e 13), e un gioco
   della versione di ieri non ha un ramo per leggerli: li butta in
   silenzio e rigioca una partita in cui nessuno ha toccato lo schermo.

   MISURATO con strumenti/_t-144-motorev.js, nei due versi:
     · quattro nastri del merge-base (c71a83e) rigiocati sul curato:
       **quattro su quattro IDENTICI**, ottanta campioni d'impronta
       ciascuno. La cura, di suo, non cambia nessuna partita;
     · quattro nastri del curato rigiocati sul gioco di ieri: **quattro
       su quattro in una partita DIVERSA**, tutti allo stesso campione —
       il primo, cioe' entro il primo mezzo secondo — con **170 righe
       lette su 2749**.

   Percio' il numero sale: non per la cura, ma perche' senza di lui un
   telefono rimasto indietro (e il service worker ignora la query
   string, quindi restare indietro e' facile) direbbe NON TORNA a un
   onesto invece di ALTRO MOTORE. Il prezzo — i nastri v3 diventano
   ingiudicabili — si paga volentieri e dura poco: v3 e' di ieri.
   ===================================================================== */
const MOTORE_V = 4;`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-144-motorev.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(CERCA).length - 1;
if (n !== 1) { console.error('TOPPA NON APPLICATA: ancoraggio trovato ' + n + ' volte (ne serve esattamente 1)'); process.exit(1); }
t = t.replace(CERCA, METTI);
if (t.split('const MOTORE_V = 4;').length - 1 !== 1 || t.split('const MOTORE_V = 3;').length - 1 !== 0) {
  console.error('TOPPA NON APPLICATA: dopo la sostituzione MOTORE_V non e\' 4 esattamente una volta');
  process.exit(1);
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: MOTORE_V 3 -> 4, ' + ing + ' -> ' + usc);
