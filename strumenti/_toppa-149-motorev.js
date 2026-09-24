/* =====================================================================
   _toppa-149-motorev.js — MOTORE_V DA 5 A 6, CON LA PROVA IN MANO
   (voce #149, compito 2)

   LA MISURA CHE DECIDE: strumenti/_t-149-motorev.js, 24 settembre 2026,
   merge-base b87f512, QUATTRO serie vere fra due telefoni.

     VERSO 1  il nastro ONESTO, dai due giudici: NEUTRO 4 volte su 4 —
              stesso verdetto (TORNA), stesso punteggio rigiocato, stesso
              numero di passi (646 e 1011). La cura, di suo, non cambia
              nessuna partita e nessun verdetto onesto.
     VERSO 2  i quattro nastri della revisione (la 15 tolta; la 15 e le
              14 tolte; il bit del primo capovolto; la versione ignota),
              dai due giudici: SEDICI verdetti su sedici CAMBIANO, e
              NOVE di quei sedici sono un NON TORNA del giudice di ieri.

   PERCIO' IL NUMERO SALE. NON TORNA e' l'unico dei cinque verdetti che
   muove punti: li toglie a DUE persone, alza un sospetto che non decade
   e chiude la riga per sempre. Col numero a 6 un telefono rimasto
   indietro dice ALTRO MOTORE — un «non lo so» che non costa niente a
   nessuno — invece di accusare. E' parola per parola l'argomento del
   #144 e del #148.

   E NON SI PROTEGGE IL MANOMETTITORE: si protegge la coppia che ha
   giocato. Un nastro puo' perdere la riga 15 senza che nessuno bari — la
   scrittura di quella riga sta dentro un `catch` muto (`:48147`) — e il
   telefono che giudica non sa distinguere le due cose.

   IL CRITERIO USATO E' QUELLO ALLARGATO DAL #148, parola per parola:
   «se una cura cambia il verdetto che un altro telefono darebbe sullo
   stesso nastro, il numero sale». Il criterio STRETTO («l'esito di
   sequenze di comandi identiche») qui direbbe di no, come al #148: i
   comandi danno lo stesso esito, il verso 1 lo misura.

   E LA MISURA VOLEVA PIU' DI UNA SERIE. Alla prima corsa, una serie
   sola (1-2, seme 2485500926), il giudice di ieri disse TORNA su tre
   casi su quattro: novanta secondi di calcio finiti PER CASO con lo
   stesso punteggio della serie. Con quel referto in mano si sarebbe
   scritto «MOTORE_V puo' restare 5» avendo in mano una moneta. Su
   quattro serie le accuse sono nove su sedici.

   IL PREZZO, dichiarato: i nastri v5 diventano ingiudicabili. Si paga
   volentieri e dura poco — v5 e' di stanotte (#148, 24 settembre 2026) —
   e la riga resta a verificata = 0, cioe' torna giudicabile da se'.

   DISCHETTO_V RESTA 1, e non e' una dimenticanza: nessun MESSAGGIO del
   protocollo e' cambiato. `dsPrimoDalSeme` e' la stessa regola di prima
   messa in un posto solo, e le due guardie nuove leggono il NASTRO.

   LA FIXTURE CONGELATA VA RIGENERATA dopo questa toppa
   (strumenti/_gen-nastro-duello-congelato.js): dichiara il motoreV di
   ieri, e senza di lei _q-staffetta direbbe ALTRO MOTORE su tutto. E'
   successo al #143 e al #148, ed e' scritto nelle loro lettere di testa.

   uso:  node strumenti/_toppa-149-motorev.js [file.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const FILE = process.argv[2] ? path.resolve(RADICE, process.argv[2])
                             : path.join(RADICE, 'CALCETTO-il-gioco.html');
if (!fs.existsSync(FILE)) { console.error('TOPPA NON APPLICATA: ' + FILE + ' non esiste'); process.exit(1); }

const A = `const MOTORE_V = 5;`;
const B = `/* =====================================================================
   RETTIFICA A EDIZIONI (24 settembre 2026, voce #149). IL NUMERO QUI
   SOTTO NON E' PIU' 5, E' 6 — e per la stessa ragione del #148, un
   piano piu' su della simulazione: non e' cambiato come si LEGGE un
   nastro, e' cambiato che cosa si SA RIFIUTARE.

   Dal #149 il giudice si astiene su quattro nastri su cui prima dava un
   verdetto: la riga 15 tolta mentre le 14 restano (dischetto-assente),
   la 15 E le 14 tolte (duelli-senza-atti), il bit del primo tiratore che
   non torna col seme (dischetto-primo-incoerente), una versione del
   protocollo che non conosciamo (dischetto-versione).

   MISURATO con strumenti/_t-149-motorev.js su QUATTRO serie vere:
     · il nastro ONESTO da' lo stesso verdetto dai due giudici, con lo
       stesso punteggio e lo stesso numero di passi: 4 volte su 4;
     · i quattro nastri della revisione cambiano verdetto 16 volte su
       16, e NOVE di quei sedici sono un NON TORNA del giudice di ieri.

   Percio' il numero sale: non per la cura, ma perche' senza di lui un
   telefono rimasto indietro accuserebbe DUE persone oneste invece di
   dire ALTRO MOTORE. Il prezzo — i nastri v5 diventano ingiudicabili —
   dura poco: v5 e' di stanotte.
   ===================================================================== */
const MOTORE_V = 6;`;

let t = fs.readFileSync(FILE, 'utf8');
const n = t.split(A).length - 1;
if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora «MOTORE_V» trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(A, B);
for (const [k, q] of [['const MOTORE_V = 6;', 1], ['const MOTORE_V = 5;', 0]]) {
  const m = t.split(k).length - 1;
  if (m !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + m + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(FILE, t);
console.log('toppa applicata: MOTORE_V da 5 a 6 in ' + path.relative(RADICE, FILE));
