/* =====================================================================
   _toppa-152-gesto.js — L'ARRESTO DIVENTA UN GESTO (voce #152, compito 4)

   ====================== CHE COSA SI TOCCA, E PERCHE' QUELLO ===========
   `strumenti/_q-gesto.js` ha misurato il CAMMINO di ogni clip — la somma
   delle distanze percorse da tutti e diciotto i giunti lungo il ciclo —
   e la risposta e' stata netta:

     rovesciata 77,61 · tuffo 67,14 · presa 31,39 · tiro 28,41 ·
     scivolata 23,44 · rinvio 20,99 · cross 17,41 · filtrante 17,25 ·
     contrasto 15,91 · passaggio 13,63 · testa 12,77 · FRENATA 3,41

   Undici gesti fra 12,77 e 77,61 metri, e uno a 3,41: quasi quattro
   volte sotto il penultimo, e MENO DEL DOPPIO DI UN UOMO FERMO (la clip
   `fermo` ne fa 2,71). L'arresto — `MoveDirection` nella tassonomia di
   FC Mobile, e in partita il gesto che si vede ogni volta che qualcuno
   smette di correre — era una posa con un'oscillazione smorzata sopra.

   ====================== I TRE TEMPI CHE MANCAVANO =====================
   Un arresto vero, e i due riferimenti del committente lo fanno tutt'e
   due, ha tre tempi e la clip ne aveva mezzo:

     PIANTATA   la suola morde e il bacino AFFONDA sotto il peso che
                arriva. Nella clip il bacino stava a quota fissa: un
                uomo che passa da sette metri al secondo a zero senza
                che il baricentro si muova di un centimetro.
     SOVRAPPOSIZIONE  i piedi si fermano, il busto NO. E' la cosa che
                distingue un corpo da un manichino, ed e' letteralmente
                la seconda legge di Newton messa in scena: il tronco
                continua verso dove si andava e solo dopo torna
                indietro sul peso. La clip aveva il busto gia' arretrato
                al primo fotogramma, cioe' ARRIVAVA a fine gesto.
     CHIUSURA   la gamba di dietro, aperta a compasso dalla frenata, si
                RACCOGLIE. Nella clip restava aperta fino alla fine: il
                compasso era l'inizio e la fine dello stesso disegno.

   ====================== COME SONO SCRITTI ============================
   Con le stesse forme che il file usa gia' nelle altre clip — due
   gaussiane strette per gli istanti, una smoothstep per il tempo lungo —
   e nessuna costante nuova fuori dalla funzione:

     affondo  Mexp(-((u-0,18)/0,10)^2)   il peso che arriva sulla suola
     avanti   Mexp(-((u-0,10)/0,09)^2)   il busto che continua
     chiude   sm(u, 0,34, 0,86)          la gamba che raccoglie

   IL FOTOGRAMMA DELL'AFFONDO E' 0,18 E NON UN ALTRO, e il numero viene
   dalla clip stessa: `largo` — il compasso che si apre — finisce a 0,16,
   e il peso arriva quando il piede ha finito di piantarsi, non prima.
   IL BUSTO PARTE PRIMA (0,10) perche' la sovrapposizione E' un ritardo:
   se il busto si fermasse insieme ai piedi non ci sarebbe niente da
   guardare.

   ====================== QUANTO E' PAGATO IN TEMPO VERO ===============
   E' la regola che il #147 ha scritto col respiro: l'anticipazione dura
   quanto il ritardo vero, e non si inventa tempo che il gioco non ha.
   Qui il tempo c'e' gia' ed e' dichiarato: `rigStato` manda la clip da
   0,04 a 0,74 lungo FRENA_T, cioe' i tre tempi cadono dentro una
   finestra che la simulazione spende davvero a fermare il giocatore.
   Non si sposta un fotogramma della fase: 0,04..0,74 resta 0,04..0,74.

   ====================== IL CONTRASTO NON SI TOCCA, E PERCHE' =========
   `contrasto` (StandTackle) ha il picco di velocita' alla fase 0,154 —
   il piu' precoce di tutte le clip, cioe' il gesto che comincia piu'
   vicino al suo inizio — e la tentazione di dargli una carica era forte.
   NON SI FA, e la ragione e' scritta nel gioco accanto a rigStato: «la
   fase parte da 0,26 — il fotogramma in cui il piede tocca — e corre a
   0,98: quello che sta prima di 0,26 e' la rincorsa, e in partita non si
   vede, PERCHE' IL CONTRASTO NON HA CARICA». La carica e' gia' disegnata
   nella clip; il gioco sceglie di non mostrarla perche' la meccanica non
   concede un istante fra la decisione e il contatto. Dargliela vorrebbe
   dire far partire la gamba dopo il momento in cui il contrasto morde:
   un'animazione piu' bella e una bugia sulla meccanica. E' esattamente
   il caso che il #147 ha risolto nell'altro verso — li' il ritardo c'era
   davvero e l'anticipazione lo ha messo in scena.

   ====================== COSA NON CAMBIA ==============================
   La posa e' presentazione: `poseFrenata` scrive nel buffer P dei giunti
   e non legge ne' scrive uno stato di gioco, non consuma un sorteggio, e
   MOTORE_V non si muove. La gabbia degli angoli (`gabbia.js`) e la
   sagoma in nero (`silhouette.js`) sono i due cancelli che giudicano
   questa funzione, e vanno rilanciati.

   uso:  node strumenti/_toppa-152-gesto.js ingresso.html uscita.html
   ===================================================================== */
'use strict';
const fs = require('fs');

const CAMBI = [];
const cambio = (nome, cerca, sostituisci) => CAMBI.push({ nome, cerca, sostituisci });

cambio('1. la frenata prende i suoi tre tempi',
`function poseFrenata(u){
  const osc=Msin(u*TAU*1.8)*Mexp(-2.5*u);
  const largo=sm(u,0.0,0.16);            // il passo si allarga a compasso
  const terzo=1-sm(u,0.26,0.44);         // il primo terzo dell'arresto
  const crouch=0.24+0.03*osc, lean=-0.38+0.10*osc;
  const pelvY=0.93-crouch;
  corpo(pelvY,0,lean,0);
  const dz=-0.09;                        // il bacino arretra dietro l'appoggio`,
`/* =====================================================================
   L'ARRESTO, IN TRE TEMPI (voce #152).

   MISURATO PRIMA DI TOCCARLO: strumenti/_q-gesto.js somma le distanze
   percorse dai diciotto giunti lungo ogni clip, e questa ne faceva
   3,41 metri contro i 12,77 della penultima (il colpo di testa) e i
   77,61 della prima (la rovesciata). Meno del doppio di un uomo FERMO,
   che ne fa 2,71. Era una posa con un'oscillazione smorzata sopra, e in
   partita e' il gesto che si vede ogni volta che qualcuno smette di
   correre.

   I TRE TEMPI, e le tre righe che li scrivono:

     PIANTATA (affondo). La suola morde e il bacino AFFONDA sotto il peso
       che arriva, poi risale. Prima stava a quota fissa: un uomo che
       passa da sette metri al secondo a zero senza che il baricentro si
       muova di un centimetro. Il fotogramma e' 0,18 e non un altro,
       perche' 'largo' — il compasso che si apre — finisce a 0,16: il
       peso arriva quando il piede ha finito di piantarsi.

     SOVRAPPOSIZIONE (avanti). I piedi si fermano, il busto NO. E' la
       cosa che distingue un corpo da un manichino, ed e' la seconda
       legge di Newton messa in scena: il tronco continua verso dove si
       andava e solo dopo torna indietro sul peso. Prima il busto era
       gia' arretrato al primo fotogramma, cioe' ARRIVAVA a gesto finito
       invece di finirci. Parte a 0,10, prima dell'affondo, perche' la
       sovrapposizione E' un ritardo: un busto che si ferma insieme ai
       piedi non ha niente da mostrare.

     CHIUSURA (chiude). La gamba di dietro, aperta a compasso dalla
       frenata, si RACCOGLIE sotto il corpo fra 0,34 e 0,86. Prima
       restava aperta fino alla fine: il compasso era l'inizio e la fine
       dello stesso disegno.

   IL TEMPO NON E' INVENTATO, ed e' la regola che il #147 ha scritto col
   respiro: l'anticipazione dura quanto il ritardo vero. rigStato manda
   questa clip da 0,04 a 0,74 lungo FRENA_T — una finestra che la
   simulazione spende davvero a fermare il giocatore — e quella finestra
   non si tocca: cambia cosa ci sta dentro, non quanto dura.

   COSTO: zero. Tre numeri in piu' per fotogramma dentro una funzione di
   posa che ne calcola gia' venti, e nessun tratto di canvas aggiunto.
   ===================================================================== */
function poseFrenata(u){
  const osc=Msin(u*TAU*1.8)*Mexp(-2.5*u);
  const largo=sm(u,0.0,0.16);            // il passo si allarga a compasso
  const terzo=1-sm(u,0.26,0.44);         // il primo terzo dell'arresto
  const da=(u-0.18)/0.10, affondo=Mexp(-da*da);   // il peso che arriva
  const db=(u-0.10)/0.09, avanti=Mexp(-db*db);    // il busto che continua
  const chiude=sm(u,0.34,0.86);                   // la gamba che raccoglie
  const crouch=0.24+0.03*osc+0.150*affondo;
  /* lean negativo = peso INDIETRO (la convenzione di questa clip). Il
     busto parte quasi dritto — sta ancora andando avanti — e arriva
     a -0,38 quando il peso e' tutto sul tallone. */
  const lean=-0.38+0.10*osc+0.34*avanti;
  const pelvY=0.93-crouch;
  corpo(pelvY,0,lean,0.03*avanti-0.02*chiude);
  /* il bacino arretra dietro l'appoggio, e arretra DI PIU' mentre il
     busto e' ancora avanti: e' il contrappeso della sovrapposizione */
  const dz=-0.09-0.06*avanti;`);

cambio('2. la gamba di dietro raccoglie, quella davanti regge il peso',
`  gamba(HIPR,KNR,FTR,TOR,  HIPW*ch, pelvY, dz+HIPW*shh,  0.72+0.05*osc, 0.06,  0.11+0.13*largo);
  gamba(HIPL,KNL,FTL,TOL, -HIPW*ch, pelvY, dz-HIPW*shh,  0.05, 0.95+0.08*osc, -0.14-0.13*largo);`,
`  /* LA DESTRA E' QUELLA CHE PIANTA: il ginocchio si flette sotto il
     peso nell'attimo dell'affondo e si ridistende. La SINISTRA e' quella
     che resta indietro, e adesso si raccoglie invece di restare aperta
     a compasso fino all'ultimo fotogramma. */
  gamba(HIPR,KNR,FTR,TOR,  HIPW*ch, pelvY, dz+HIPW*shh,  0.72+0.05*osc-0.12*affondo, 0.06+0.38*affondo,  0.11+0.13*largo);
  gamba(HIPL,KNL,FTL,TOL, -HIPW*ch, pelvY, dz-HIPW*shh,  0.05+0.42*chiude, 0.95+0.08*osc-0.46*chiude, -0.14-0.13*largo+0.20*chiude);`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-152-gesto.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
for (const [k, q] of [['const da=(u-0.18)/0.10, affondo=Mexp(-da*da);', 1],
                      ['const chiude=sm(u,0.34,0.86);', 1],
                      ['0.05+0.42*chiude', 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: il gesto dell\'arresto, ' + CAMBI.length + ' cambi, ' + ing + ' -> ' + usc);
console.log('  il file cresce di ' + (Buffer.byteLength(t, 'utf8') - fs.statSync(ing).size) + ' byte');
