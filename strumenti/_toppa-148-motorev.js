/* =====================================================================
   _toppa-148-motorev.js — MOTORE_V DA 4 A 5, CON LA PROVA IN MANO
   (voce #148, compito 3)

   LA MISURA CHE DECIDE, e non e' quella che ci si aspettava. I tre versi
   di strumenti/_t-148-motorev.js, 24 settembre 2026, merge-base 01265bc:

     VERSO 1  quattro nastri della sfida registrati sul merge-base e
              rigiocati sul curato: QUATTRO SU QUATTRO IDENTICI, 80
              campioni ciascuno. La cura, di suo, non cambia nessuna
              partita.
     VERSO 2  un nastro di una serie vera del curato, LETTO dal gioco di
              ieri: 34 righe contro 34 — nessuno dei tipi nuovi e' un
              tipo, sono righe nuove di tipi che il gioco di ieri conosce
              da mesi — 100 campioni identici, stesso punteggio
              rigiocato. Col testimone: un nastro sporcato in un comando
              diverge al campione 69.
     VERSO 3  lo stesso nastro, GIUDICATO. Oggi TORNA (atteso 2-3,
              rigiocato 2-3, 1011 passi). Ieri NON TORNA (rigiocato 1-3,
              7156 passi).

   ED E' IL TERZO CHE COMANDA. Il criterio di casa — «MOTORE_V si
   incrementa quando una cura cambia l'esito di sequenze di comandi
   identiche» — qui guarderebbe il verso 2 e direbbe di no: il gioco di
   ieri legge lo stesso nastro allo stesso modo, riga per riga e campione
   per campione. Il pericolo sta un piano piu' su. Quel che il #148 ha
   cambiato non e' come si LEGGE un nastro: e' come si GIUDICA. Il gioco
   di ieri trova le rose, le testimonianze e l'impronta al loro posto,
   passa il vaglio, e poi rigioca una serie di rigori come novanta
   secondi di calcio: 7156 passi, e un NON TORNA a due persone oneste.

   NON TORNA E' L'UNICO DEI CINQUE VERDETTI CHE MUOVE PUNTI: li toglie a
   DUE persone, alza un sospetto che non decade mai e chiude la riga per
   sempre. Col numero a 5 quel telefono dice ALTRO MOTORE, che e' un «non
   lo so» e non costa niente a nessuno. E' parola per parola la cura del
   #144, dove pero' il guasto si vedeva gia' nelle righe lette.

   IL PREZZO, dichiarato: i nastri v4 diventano ingiudicabili. Si paga
   volentieri e dura poco — v4 e' di ieri (#144, 23 settembre 2026) — e
   la riga resta a verificata = 0, cioe' torna giudicabile da se'.

   E IL NUMERO PROTEGGE ANCHE L'APPUNTAMENTO: `chiudiAppuntamento`
   rifiuta un pari con `suo.mv !== MOTORE_V`, quindi un telefono v4 e uno
   v5 non cominciano nemmeno la serie. `DISCHETTO_V` resta 1, e non e'
   una dimenticanza: nessun MESSAGGIO del protocollo e' cambiato. Il
   secondo numero della riga 15 e' una riga di nastro, non un messaggio.

   LA FIXTURE CONGELATA VA RIGENERATA dopo questa toppa
   (strumenti/_gen-nastro-duello-congelato.js): dichiara motoreV 4 e
   senza di lei _q-staffetta direbbe ALTRO MOTORE su tutto. E' successo
   anche al #143, ed e' scritto nella sua lettera di testa.

   uso:  node strumenti/_toppa-148-motorev.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const A = `const MOTORE_V = 4;`;
const B = `/* =====================================================================
   RETTIFICA A EDIZIONI (24 settembre 2026, voce #148). IL NUMERO QUI
   SOTTO NON E' PIU' 4, E' 5 — e stavolta non e' cambiata ne' la
   simulazione (come al #143) ne' quel che si REGISTRA (come al #144):
   e' cambiato che cosa si SA GIUDICARE.

   Dal #148 il nastro di una serie dal dischetto porta le sue tre righe
   d'identita' (le rose, lo schermo, l'impronta) e la riga 15 dice anche
   chi ha tirato per primo; e il giudice, davanti a un nastro cosi', APRE
   LA SERIE invece di rigiocare novanta secondi di calcio.

   Un gioco della versione di ieri quelle righe le legge tutte — non sono
   tipi nuovi, sono righe nuove di tipi vecchi — e proprio per questo il
   vaglio le accetta, e poi la rigiocata va a sbattere.

   MISURATO con strumenti/_t-148-motorev.js, nei TRE versi:
     · quattro nastri della SFIDA registrati sul merge-base (01265bc) e
       rigiocati sul curato: QUATTRO SU QUATTRO IDENTICI, 80 campioni
       ciascuno. La cura, di suo, non cambia nessuna partita;
     · un nastro di una SERIE vera del curato, LETTO dal gioco di ieri:
       34 righe contro 34, 100 campioni identici, stesso punteggio. Lo
       scarto di righe e' ZERO, che e' esattamente il numero di righe dei
       tipi nuovi (nessuno): il criterio del #147 tenuto stretto, non
       rilassato;
     · lo stesso nastro GIUDICATO: oggi TORNA (2-3, 1011 passi), ieri
       NON TORNA (1-3, 7156 passi).

   Percio' il numero sale: non per la cura, ma perche' senza di lui un
   telefono rimasto indietro direbbe NON TORNA a DUE persone oneste
   invece di ALTRO MOTORE. E NON TORNA e' l'unico dei cinque verdetti che
   muove punti. Il prezzo — i nastri v4 diventano ingiudicabili — si paga
   volentieri e dura poco: v4 e' del 23 settembre.

   E UNA NOTA PER CHI LEGGERA' DOMANI: il criterio scritto in casa parla
   di «esito di sequenze di comandi identiche», e qui i comandi danno lo
   stesso esito (verso 2). Il criterio va letto piu' largo di come e'
   scritto: quel che protegge non e' la simulazione, e' il VERDETTO. Se
   una cura cambia il verdetto che un altro telefono darebbe sullo stesso
   nastro, il numero sale.
   ===================================================================== */
const MOTORE_V = 5;`;

const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-148-motorev.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const n = t.split(A).length - 1;
if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora «MOTORE_V» trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
t = t.replace(A, B);
for (const [k, q] of [['const MOTORE_V = 5;', 1], ['const MOTORE_V = 4;', 0]]) {
  const m = t.split(k).length - 1;
  if (m !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + m + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: MOTORE_V da 4 a 5, ' + ing + ' -> ' + usc);
