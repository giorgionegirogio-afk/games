/* =====================================================================
   _t-cross-cpu.js — LA TOPPA "IL CROSS ARRIVA", applicata a una COPIA.
   SECONDA STESURA, dopo la bocciatura del critico (_onda0/a15.md).

   Non tocca il repo. Legge un file di gioco, applica le sostituzioni qui
   sotto e scrive un file nuovo. Se una sola sostituzione non trova il suo
   testo ESATTAMENTE UNA VOLTA si ferma, non scrive niente, dice quale
   manca ed esce con codice diverso da zero.

   uso: node strumenti/_t-cross-cpu.js ingresso.html uscita.html
        node strumenti/_t-cross-cpu.js ingresso.html uscita.html --solo 14
        node strumenti/_t-cross-cpu.js ingresso.html uscita.html --salta 9,10
   --solo 14 applica SOLO il cambio 14, cioe' la riparazione autonoma di
   un difetto PREESISTENTE (l'annuncio del palo su un pallone che qualcuno
   sta portando). E' la forma che il critico indicava come l'unica gia'
   difendibile, e serve anche a un'altra cosa: e' il PRIMA su cui si
   misura tutto il resto, cosi' il metro non lo edita la toppa.

   =====================================================================
   COSA E' CAMBIATO RISPETTO ALLA PRIMA STESURA

   La prima stesura faceva partire 0,29 cross a partita a 5 contro 5, di
   cui ZERO arrivavano a un compagno dentro l'area e ZERO diventavano una
   conclusione. Il "+25% di momenti da porta" del titolo non lo produceva
   il cross: lo producevano i cambi sull'assetto, e quei cambi giravano su
   un flag (corsaArea) che si accendeva e non si spegneva mai.
   (I numeri di quella stesura si leggono qui come storia: quel gioco non
   esiste piu' e non si rieseguono. Tutti i numeri del PRESENTE, in questo
   file, dicono con quale strumento e con quali semi si rifanno.)

   Le dieci cose che sono cambiate, una per una:

   1. corsaArea NON E' PIU' UN INTERRUTTORE, e' un CRONOMETRO che scade da
      solo (cambio 8) e che muore all'istante quando il pallone e' in
      piedi all'avversario. Azzerarlo in testa ad aiDecide avrebbe chiuso
      il caso e lasciato aperta la classe: un interruttore che qualcuno
      deve ricordarsi di spegnere si riapre alla prima riga nuova. Il
      calcio d'inizio lo azzera lo stesso (cambio 15).
      Misurato con la sonda del critico (_zz-critico-corsa.js, invariata),
      su questa base, 6 semi a taglia 5: acceso sul 7,73% dei
      fotogrammi-uomo, e sul gioco vergine 0,00%. Il 24,46% che il critico
      misuro' sulla prima stesura, e i 20,32 punti percentuali che lo
      accompagnavano, sono discussi (e in parte ritirati) dentro il
      cambio 8 e nel rapporto.
   2. Il cross non punta piu' "un compagno in zona di tiro" ma UN COMPAGNO
      DENTRO L'AREA, previsto al tempo di volo, con la stessa scatola di
      finestraRovesciata, scritta una volta sola (cambi 4 e 5).
   3. La mira si ricalcola AL RILASCIO del gesto e non alla decisione: fra
      le due cose passano PASS_CAR = 0,11 s (cambio 5).
   4. La clausola del portiere non e' piu' un cerchio attorno a dove il
      portiere sta ADESSO — che non poteva mordere — ma l'ellisse vera di
      tentaPresa attorno alla posizione PREVISTA con la regola di
      updateKeeper (cambio 5).
   5. Il cross non puo' rubare il tiro, e adesso lo si legge invece di
      crederlo: la sua condizione e' !zonaTiro(...), cioe' la NEGAZIONE
      ESATTA della condizione del tiro (cambi 6 e 7). Il secondo punto in
      cui si guarda (cambio 7b) sta dopo che il ramo del tiro ha gia'
      rifiutato. La frase della prima stesura — "le due bande sono
      definite dallo stesso numero, quindi non si sovrappongono in nessun
      punto del campo" — era FALSA, e si trova ritrattata dentro il
      cambio 7.
   6. L'annuncio del palo porta dentro il cancello anche scossa, gelo,
      spruzzo e lampo, non solo il banner (cambio 14).
   7. TIRO_ATTR si usa invece di ricalcolare 1,0498*ATTR_K a mano, e la
      larghezza del varco e' P_R+B_R-2, che e' la larghezza con cui
      updateBall mura davvero (il muro dei corpi, d < P_R+B_R-2), non una mia.
   8. LA COSA CHE MANCAVA DAVVERO: in questo gioco NESSUNO sa dove cadra'
      un pallone per aria. Finche' un cross vola b.owner vale -1, quindi
      weHaveBall e' falso per tutti e due i colori e la squadra che ha
      crossato torna a difendere — compreso l'uomo che stava entrando in
      area per ricevere quel cross. Non era la mira: erano le gambe. I
      cambi 1, 9 e 12 mettono il punto di caduta dentro l'IA, per tutti e
      due i colori — anche per chi deve respingerlo.
   9. E LA SECONDA COSA CHE MANCAVA: la corsa in area viveva solo nel ramo
      del possesso, e in questo gioco il pallone non e' ai piedi di
      nessuno per la maggior parte del tempo. Ogni passaggio della propria
      squadra spezzava la corsa. Adesso la corsa attraversa il pallone
      libero (cambio 9) e il titolare non cambia a ogni sorpasso
      (l'isteresi di SEP_R). Misurato con _sonda-cross2.js su questa base,
      12 partite a taglia 5: 635 corse, durata mediana 0,87 s, e il 21,4%
      entra in area.
  10. E UNA RIGA MORTA IN MENO: dopo il cambio 6 nessuno legge piu'
      distGoal, e il cambio 6b la toglie. L'ha trovata il critico
      (_onda0bis/b9.md, N5).

   IL PERCORSO DI QUESTE MISURE E' NEL RAPPORTO, compresi i tre passaggi
   in cui il cross partiva ZERO volte e il perche' di ciascuno. Sono
   riportati apposta: un numero che non parte non e' un dettaglio di
   lavorazione, e' la storia della cosa.

   =====================================================================
   COSA QUESTA TOPPA GARANTISCE, E COSA NO — perche' e' la domanda che ha
   bocciato la prima stesura, ed e' giusto che stia prima dei conti.

   TUTTI I NUMERI DI QUESTA INTESTAZIONE SONO MISURATI SULLA BASE
   804328ee — l'albero di lavoro, quello su cui questa toppa si applica e
   su cui il commit andra' a finire. La stesura precedente li aveva
   misurati su 81c7247a (HEAD) e sono stati rifatti tutti qui.
   Strumento: strumenti/_q-cross2.js, 200 partite per parte a 5 contro 5,
   semi 20260803..20261002, tempo regolamentare, intervalli bootstrap al
   95% e permutazione a 5000 giri. Il PRIMA e' la stessa base col SOLO
   cambio 14 (--solo 14), cosi' il metro non lo edita la toppa.
   n = 200 E' DICHIARATO PRIMA DI GIRARE, e non si alza dopo aver visto il
   risultato: vedi qui sotto il numero che per questo motivo e' ritirato.

   GARANTISCE:
     - il cross ESISTE          0 -> 0,62 a partita   IC [0,52; 0,72]
     - e ARRIVA                 0 -> 0,37, cioe' 74 cross su 124 (60%)
                                raccolti da un COMPAGNO DENTRO L'AREA
     - e diventa una conclusione 0 -> 0,34 (69 su 124, 56%)
     - e 22 di quei 124 finiscono in rete
     - i tiri NON calano: 9,43 -> 11,60 IC [1,62; 2,72]
     - i momenti da porta al minuto: 3,15 -> 3,78 IC [0,32; 0,96]
   NON GARANTISCE:
     - che quei momenti salgano PER IL CROSS. Scomposto: senza il cross e
       coi soli cambi d'assetto (--salta 7,7b) fanno 3,51, cioe' +0,36 IC
       [0,04; 0,68] p=0,029 MISURATO; il pezzo che aggiunge il cross vale
       +0,27 IC [-0,04; +0,60] p=0,089, cioe' NON MISURATO.
       LA PRIMA STESURA, A QUESTO PUNTO, ALZAVA n DA 200 A 600 dopo aver
       visto il nullo, e riportava +0,29 IC [0,11; 0,47] p=0,003. Era
       arresto opzionale, e QUEL NUMERO E' RITIRATO: non compare piu' ne'
       qui ne' nel rapporto se non per dire che e' stato ritirato.
     - a 7 contro 7 e a 11 contro 11 IL CROSS non parte, e l'attacco
       dell'area e' spento apposta (vedi attaccaArea). Ma la toppa NON e'
       inerte a quelle taglie: i cambi 12 (l'inseguitore punta il punto di
       caduta) e 14 (il palo) restano vivi e girano su ogni pallone per
       aria. Sono MISURATI NEUTRI, non assenti — 120 partite per parte
       contro il gioco vergine, semi 20260803..20260922:
         taglia 7   tiri        11,75 -> 11,88  IC [-0,59; +0,85]  p=0,745
                    momenti/min  2,85 ->  3,03  IC [-0,19; +0,57]  p=0,344
         taglia 11  tiri         7,55 ->  7,31  IC [-0,84; +0,36]  p=0,457
                    momenti/min  0,70 ->  0,64  IC [-0,27; +0,13]  p=0,555
       Tutte e quattro NON MISURATE, che vuol dire: con questo n il segno
       non si distingue dal caso. Non vuol dire "non gira".
     - la ROVESCIATA. La finestra adesso si apre — 17 volte in 200 partite
       contro zero — perche' il cross porta la quota massima del pallone
       da una mediana di 14,0 unita' a 37,6 — ma i tentativi restano ZERO.

   =====================================================================
   IL DIFETTO DI PARTENZA, MISURATO

   doCross esiste, l'animazione esiste ed e' buona, e in partita CPU
   contro CPU non parte MAI. La causa e' di raggiungibilita': ogni
   chiamante di doCross parte dal dito.
   Sulla base 81c7247a i chiamanti erano DUE — il flick trasversale di
   Touch5.end e doFiltrante con comeCross. Sulla base 804328ee, che e'
   quella su cui questa stesura e' costruita e misurata, il flick non
   esiste piu' (la passata sui comandi a dito ha spaccato Touch5.end in
   end/cancel/chiudi e ha spostato il cross su un pulsante) e ne resta
   UNO SOLO:
     - CALCETTO-il-gioco.html:9191  doCross(q, mx, my) dentro doFiltrante
                                    con comeCross, che legge ctrlPlayer(t)
                                    e humanMove(t).
   Il numero dei chiamanti non e' scritto in nessun commento dentro il
   gioco apposta: lo conta strumenti/_p-cross-umano.js a ogni esecuzione.

   =====================================================================
   LA FISICA, perche' qui ogni soglia esce da un conto e non da un gusto

   1. doCross MIRA SENZA ATTRITO, e sbaglia. Fissa un tempo di volo
      T = dist/430 limitato fra 0,5 e 0,75 s e una velocita' dist/T. Ma
      updateBall frena il pallone a ogni fotogramma (0,35^(dt*ATTR_K)),
      quindi la strada VERA percorsa in un tempo u vale
          s(u) = v*(1 - e^(-K*u)) / K        con K = TIRO_ATTR
      (TIRO_ATTR e' 1,0498*ATTR_K, e il gioco lo scrive gia' cosi' dove
      applica la taglia)
      e a T = 0,75 il rapporto fra strada vera e distanza mirata vale
          c = (1 - e^(-0,75*K)) / (0,75*K)
      cioe' 0,692 a 5 contro 5, 0,765 a 7 e 0,827 a 11. Il cross cade fra
      il 69% e l'83% della distanza a cui era mirato. Non e' un difetto
      che questa toppa corregge — il cross del giocatore umano non si
      tocca di un bit — ma chi mira DEVE saperlo: si mira a d/c per far
      cadere il pallone a d.

   2. IL VOLO E' SEMPRE DI 0,75 s. Si crossa solo quando la distanza
      voluta supera 322,5*c unita' (322,5 = 430*0,75 e' la distanza
      mirata a cui T tocca il suo massimo). Allora c e' una costante, la
      mira si inverte con una divisione esatta, la quota di partenza vale
      280*0,75 = 210 e il picco 70*0,75^2 = 39,4 unita'.
      Perche' NON si lascia accorciare il volo: sotto T = 0,6094 il picco
      scende sotto Z_SOPRA_TESTA (26) e il pallone non scavalca le teste;
      per restare sopra Z_SOPRA_PORTIERE (34) servirebbe T >= 0,697, che
      guadagna undici unita' di distanza minima (212 invece di 223 a 5
      contro 5). Undici unita' non valgono un pallone che sfiora le teste.

   3. LA DISTANZA MASSIMA LA DECIDE LA RACCOLTA. updatePlayer riconsegna
      il pallone ai piedi solo se arriva sotto le 420 unita' al secondo
      (updatePlayer, la soglia sp<420) e doCross azzera passTo. La velocita' d'arrivo vale
      d*K*e^(-0,75K)/(1 - e^(-0,75K)), quindi
          d < 420*(1 - e^(-0,75K)) / (K*e^(-0,75K))
      cioe' 479 unita' a 5 contro 5, 423 a 7, 386 a 11.
      Finestra utile: [223, 479] / [247, 423] / [267, 386].

   4. LA SCATOLA DELL'AREA e' quella di finestraRovesciata, e adesso e'
      scritta una volta sola (dentroArea): |x-gx| <= GK_AREA_X e
      |y-FH/2| <= GOAL_H*0,77, cioe' 118x231 a 5 contro 5.
      L'AREA E' UN SOTTOINSIEME STRETTO DELLA ZONA DI TIRO: la zona di
      tiro chiede |gx-x| < min(FW*0,40, (TIRO_TETTO-TIRO_ARRIVO[1])/
      TIRO_ATTR) = 460 e |y-FH/2| < FH*0,40 = 224. Percio' un cross che
      ARRIVA e' per costruzione un pallone da cui si puo' concludere: non
      serve nessuna clausola in piu' a dirlo, e infatti non c'e'.

   5. IL PORTIERE. tentaPresa prende dentro un'ELLISSE di semiassi
      GK_REACH+B_R = 34 lungo il corpo e P_R+B_R = 21 di traverso; in
      piedi il corpo e' orientato lungo x. La prima stesura confrontava un
      CERCHIO di raggio 48 con la posizione ATTUALE del portiere, mentre
      il punto di caduta e' a 0,75 s nel futuro: il critico ha ragione,
      quella clausola non poteva mordere. Qui il portiere si PREVEDE con
      la sua regola (updateKeeper) e si confronta l'ellisse vera. Quante
      volte morde e' un numero, ed e' nel rapporto: la clausola e' una
      funzione con un nome apposta, perche' una sonda possa contarla da
      fuori senza che il gioco tenga un contatore.

   6. IL PUNTO DI CADUTA. z(t) = z + vz*t - 280*t^2 si annulla a
      t = (vz + sqrt(vz^2 + 1120*z)) / 560, e in quel tempo il pallone
      percorre v*(1 - e^(-K*t))/K con lo stesso K dell'attrito. Due righe,
      esatte, e sono le due righe che a questa IA mancavano.
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1
   IL SECONDO PALO DIVENTA UN LUOGO, IL PUNTO DI CADUTA DIVENTA UN CONTO,
   E doCross ACCETTA UN INDIRIZZO. */
cambio('1. puntoCross(), puntoCaduta() e doCross con la mira facoltativa',
`function doCross(p,nx,ny){
  const t=p.team;
  const b=G.ball;
  p.chargeClip='cross';                   // la clip del gesto per kickBall
  const goalX = t===0?FW:0;
  const lx = goalX + (t===0?-55:55);
  const ly = FH/2 + (p.y<FH/2?1:-1)*GOAL_H*0.28;   // secondo palo
  const dx=lx-p.x, dy=ly-p.y, dist=Math.max(1,len(dx,dy));`,
`/* IL SECONDO PALO — dove cade un cross di p quando nessuno dice altro.
   Erano due righe dentro doCross, e questo bastava a renderle un
   segreto: chi doveva ANDARCI non poteva saperle. Non sono cambiate di
   un carattere. */
function puntoCross(p){
  const gx = p.team===0?FW:0;
  return [ gx + (p.team===0?-55:55),
           FH/2 + (p.y<FH/2?1:-1)*GOAL_H*0.28 ];
}
/* DOVE CADE UN PALLONE PER ARIA — due righe che a questo gioco mancavano.
   La quota fa z + vz*t - 280*t^2 e si annulla a
       t = (vz + sqrt(vz^2 + 1120*z)) / 560
   e in quel tempo il pallone percorre v*(1 - e^(-K*t))/K, con lo STESSO
   attrito di updateBall (0,35^(dt*ATTR_K), cioe' K = TIRO_ATTR). Non e'
   una stima: e' la soluzione, e serve a chi deve andare a prenderlo.
   Torna [x, y, t]. */
function puntoCaduta(b){
  const disc=b.vz*b.vz+1120*Math.max(0,b.z);
  const t=Math.max(0,(b.vz+Math.sqrt(Math.max(0,disc)))/560);
  const K=Math.max(0.001,TIRO_ATTR);
  const s=(1-Math.exp(-K*t))/K;
  return [ clamp(b.x+b.vx*s, 8, FW-8), clamp(b.y+b.vy*s, 8, FH-8), t ];
}
/* IL QUARTO E IL QUINTO ARGOMENTO — l'indirizzo e il destinatario, e
   perche' sono facoltativi. La chiamata umana — doFiltrante col cross,
   cioe' il pulsante — passa TRE argomenti: mira e dest restano
   undefined, si ricade sul secondo palo di sempre e su crossTo = -1, e
   il cross del giocatore e' identico al bit — lo prova
   strumenti/_p-cross-umano.js, che confronta sette numeri in esadecimale
   su 120 casi (40 posizioni per tre taglie) e legge i punti di chiamata
   nel testo dei due file, uno per uno.
   QUANTI SIANO I CHIAMANTI UMANI QUESTO COMMENTO NON LO DICE, e non e'
   pigrizia: la prima stesura scriveva "le due chiamate umane (il flick
   trasversale di Touch5.end e doFiltrante col cross)" ed e' invecchiata
   in un giorno, perche' la passata sui comandi a dito ha tolto il flick.
   Il cancello li conta da solo a ogni esecuzione e pretende che siano gli
   stessi nei due file, con lo stesso testo: un numero scritto qui
   sarebbe una copia che nessuno rimisura. */
function doCross(p,nx,ny,mira,dest){
  const t=p.team;
  const b=G.ball;
  p.chargeClip='cross';                   // la clip del gesto per kickBall
  const pc = mira || puntoCross(p);
  const lx=pc[0], ly=pc[1];               // secondo palo, oppure l'indirizzo
  const dx=lx-p.x, dy=ly-p.y, dist=Math.max(1,len(dx,dy));`);

cambio('2. il destinatario del cross viaggia col pallone',
`    b.vz=280*T;                                // la quota del cross, sopra ogni testa
    b.passTo=-1;`,
`    b.vz=280*T;                                // la quota del cross, sopra ogni testa
    b.passTo=-1;
    /* CHI E' ATTESO SOTTO IL PALLONE. Un cross senza destinatario resta
       quello di sempre (crossTo = -1, azzerato da kickBall un istante
       prima): nessuno cambia comportamento e il gesto del dito e'
       identico. Con un destinatario, quell'uomo — e solo quello — sa che
       il pallone e' per lui e ci va, finche' e' per aria (vedi aiDecide).
       E' l'unica riga che rende un cross una cosa che ARRIVA invece di
       una cosa che parte. */
    if(dest!==undefined) b.crossTo=dest;`);

cambio('3. ogni calcio chiude il cross precedente',
`  b.tiroT=-1;
  /* quota finta sui tiri forti */`,
`  b.tiroT=-1;
  /* ...e con lei l'indirizzo del cross: ogni calcio e' un gesto nuovo, e
     un destinatario dimenticato manderebbe un uomo sotto un pallone che
     non e' piu' il suo. kickBall e' l'unico imbuto di tutti i calci del
     gioco, quindi qui la cosa si chiude una volta sola. */
  b.crossTo=-1;
  /* quota finta sui tiri forti */`);

/* ------------------------------------------------------------------ 4
   L'AREA SI SCRIVE UNA VOLTA SOLA. */
cambio('4. dentroArea() usata anche da finestraRovesciata',
`  const gx=p.team===0?FW:0;
  if(Math.abs(lx-gx)>GK_AREA_X || Math.abs(ly-FH/2)>GOAL_H*0.77) return false;`,
`  const gx=p.team===0?FW:0;
  if(!dentroArea(p.team, lx, ly)) return false;   // la stessa scatola, scritta una volta`);

/* ------------------------------------------------------------------ 5
   LA CONDIZIONE DI CROSS, e le tre clausole che si possono contare. */
cambio('5. dentroArea(), crossBersaglio(), crossPortiereCopre(), crossVarcoLibero(), crossCPU()',
`/* il portatore CPU: alterna in modo leggibile dribbling / passaggio / tiro */
function aiCarrier(p, opGoalX, D){`,
`/* =====================================================================
   L'AREA — la scatola dentro cui un cross vale qualcosa.

   E' la stessa che finestraRovesciata usava scritta a mano, ed e' la
   stessa che il disegno del campo usa per la riga bianca (AREA_Wu =
   Math.round(118*KPASSO): cercalo per nome, non per numero di riga — i
   numeri di riga di questo file invecchiano in un giorno).
   Scriverla una volta sola non e' pulizia: e' il modo di garantire che
   "il cross cade in area" e "la rovesciata si puo' aprire" parlino dello
   stesso rettangolo. Se un giorno uno dei due si muove, si muovono tutti
   e due.
   ===================================================================== */
function dentroArea(team, x, y){
  const gx = team===0?FW:0;
  return Math.abs(x-gx) <= GK_AREA_X && Math.abs(y-FH/2) <= GOAL_H*0.77;
}

/* =====================================================================
   LA ZONA DA CUI SI TIRA, estratta da aiCarrier senza cambiare un
   carattere dell'espressione. Adesso la leggono in due: il portatore,
   per decidere se tirare, e il cross, per NON partire mai da dentro. La
   frase "il cross non ruba il tiro" smette di essere un'affermazione da
   credere e diventa una riga da leggere: il cross chiede !zonaTiro(...),
   che e' la negazione esatta della condizione del tiro.
   ===================================================================== */
function zonaTiro(x, y, opGoalX){
  return Math.abs(opGoalX-x) < Math.min(FW*0.40, (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR)
      && Math.abs(y-FH/2) < FH*0.40;
}

/* =====================================================================
   LA FINESTRA DI DISTANZA DEL CROSS, tutta dedotta (vedi l'intestazione).
   Nessuno di questi numeri e' scelto: escono da TIRO_ATTR, cioe' dalla
   taglia del campo, e da due soglie che il gioco gia' dichiara.
   ===================================================================== */
const CROSS_ZONA  = 0.48;    // il portatore: dentro l'ultimo 48% del campo
const CROSS_TVOLO = 0.75;    // il volo, sempre il piu' lungo che doCross sappia
const CROSS_RACC  = 420;     // sopra questa velocita' d'arrivo nessuno la ferma
function crossFinestra(){
  const K = Math.max(0.001, TIRO_ATTR);
  const e = Math.exp(-CROSS_TVOLO*K);
  const c = (1-e)/(CROSS_TVOLO*K);          // strada vera / distanza mirata
  return { K, c, dMin: 430*CROSS_TVOLO*c, dMax: CROSS_RACC*(1-e)/(K*e) };
}

/* =====================================================================
   IL PORTIERE CI ARRIVA? — e questa volta la domanda ha una risposta.

   La prima stesura chiedeva len(gk - caduta) < GK_REACH+B_R+P_R, cioe'
   un CERCHIO di raggio 48 attorno a dove il portiere si trova ADESSO,
   contro un punto di caduta che sta a 0,75 s nel futuro. Due errori in
   una riga: il portiere copre 112 unita' in quel tempo (GK_SPEED = 150),
   quindi il cerchio era nel posto sbagliato; e la presa non e' un cerchio
   ma un'ellisse (tentaPresa: semiassi 34 lungo il corpo, 21 di traverso),
   che al secondo palo boccia dove il cerchio prendeva.
   Qui il portiere si porta avanti con la SUA regola, quella di
   updateKeeper — retta palla-porta, uscita clamp(dl*0,10, 16,
   GK_AREA_X*0,62), passo al massimo GK_SPEED — e poi si confronta
   l'ellisse vera, con l'orientamento che ha in piedi (lungo x).
   ===================================================================== */
function crossPortiereCopre(team, lx, ly){
  const gk = portiereDi(1-team);
  if(!gk || gk.out>0) return false;
  const goalX = team===0?FW:0;
  const dx=lx-goalX, dy=ly-FH/2, dl=Math.max(1,len(dx,dy));
  const usc=clamp(dl*0.10, 16, GK_AREA_X*0.62);
  const tx=goalX+dx/dl*usc;
  const ty=clamp(FH/2+dy*0.55, GY0+6, GY1-6);
  /* dove sara' fra CROSS_TVOLO: verso la sua meta, al suo passo */
  let px=tx-gk.x, py=ty-gk.y;
  const pl=len(px,py), corsa=GK_SPEED*CROSS_TVOLO;
  let fx=tx, fy=ty;
  if(pl>corsa){ fx=gk.x+px/pl*corsa; fy=gk.y+py/pl*corsa; }
  /* l'ellisse di tentaPresa, col corpo in piedi orientato lungo x */
  const A=GK_REACH+B_R, Bb=P_R+B_R;
  const lungo=lx-fx, largo=ly-fy;
  return (lungo*lungo)/(A*A) + (largo*largo)/(Bb*Bb) <= 1;
}

/* =====================================================================
   C'E' SPAZIO DAVANTI? — il VARCO, cioe' la strada vera che il pallone
   fa PRIMA di salire sopra le teste, con l'attrito dentro. Oltre quel
   tratto il pallone e' alto e non lo tocca nessuno: chiedere il
   corridoio libero fino in fondo sarebbe chiedere piu' di quanto la
   fisica richieda. Anche questa e' una funzione con un nome perche' si
   possa contare da fuori quante volte boccia.
   ===================================================================== */
function crossVarcoLibero(p, nx, ny, dA){
  const K=Math.max(0.001, TIRO_ATTR);
  const t0=(CROSS_TVOLO-Math.sqrt(Math.max(0,CROSS_TVOLO*CROSS_TVOLO-4*Z_SOPRA_TESTA/280)))/2;
  const varco=(dA/CROSS_TVOLO)*(1-Math.exp(-K*t0))/K;
  for(const o of G.players){
    if(o.team===p.team || o.out>0) continue;
    const ox=o.x-p.x, oy=o.y-p.y;
    const lungo=ox*nx+oy*ny;
    if(lungo<=0 || lungo>=varco) continue;
    /* la larghezza e' quella del gioco, non una mia: updateBall mura a
       d < P_R+B_R-2. Scriverne una piu' larga significherebbe
       rinunciare a cross che nessuno intercetta. */
    if(Math.abs(-ox*ny+oy*nx) < P_R+B_R-2) return false;
  }
  return true;
}

/* =====================================================================
   IL DESTINATARIO — e qui sta la differenza fra un cross che parte e un
   cross che arriva.

   La prima stesura cercava "il compagno piu' vicino alla porta che al
   tempo di volo sta nella ZONA DI TIRO". La zona di tiro e' l'ultimo 40%
   del campo: 460 per 448 unita' a 5 contro 5 — un cross che cade li'
   dentro non e' un cross, e' un cambio di gioco, e infatti non arrivava
   a nessuno.
   Qui il compagno deve stare, al tempo di volo, DENTRO L'AREA — che e'
   una scatola di 118 per 231 unita', cioe' 27.258 unita' quadre contro
   le 206.080 della zona di tiro: un ottavo scarso.
   Cosa produce, misurato con strumenti/_q-cross2.js su 200 partite a
   taglia 5, semi 20260803..20261002: 124 cross partiti, 97 caduti dentro
   l'area, 74 raccolti da un COMPAGNO che sta dentro l'area (il 60%),
   69 seguiti da un tiro, 22 finiti in rete.
   E l'anticipo non e' un lead scelto a gusto ma il TEMPO DI VOLO stesso,
   perche' e' il momento in cui il pallone e lui devono trovarsi nello
   stesso posto.
   Fra quelli che tengono vince il piu' vicino alla porta.
   ===================================================================== */
function crossBersaglio(p, opGoalX){
  const t=p.team;
  const F=crossFinestra();
  let scelto=null, meglio=1e9;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    const qx=q.x+q.vx*CROSS_TVOLO, qy=q.y+q.vy*CROSS_TVOLO;
    if(!dentroArea(t, qx, qy)) continue;
    const d=len(qx-p.x, qy-p.y);
    if(d<F.dMin || d>F.dMax) continue;
    if(crossPortiereCopre(t, qx, qy)) continue;
    const nx=(qx-p.x)/d, ny=(qy-p.y)/d;
    const dA=d/F.c;                       // si mira a d/c perche' cada a d
    if(!crossVarcoLibero(p, nx, ny, dA)) continue;
    const dg=Math.abs(opGoalX-qx);
    if(dg<meglio){ meglio=dg; scelto={ q, nx, ny, mira:[p.x+nx*dA, p.y+ny*dA] }; }
  }
  return scelto;
}

/* =====================================================================
   LA CONDIZIONE DI CROSS — deterministica, zero Math.random, e il conto
   si rifa' AL RILASCIO.

   IL RITARDO CHE LA PRIMA STESURA NON NOMINAVA. Tutto l'impianto ("il
   volo e' sempre 0,75 s", "c e' una costante", "d/c e' una divisione
   esatta") veniva calcolato al momento della DECISIONE e poi consegnato
   ad anticipa(...), che matura PASS_CAR = 0,11 s dopo. In undici
   centesimi il portatore cammina fino a diciotto unita' e il destinatario
   pure: la distanza cambia, e con lei cambia tutto. Qui dentro l'anticipo
   si guarda il campo un'altra volta e si rifa' il conto — che e'
   esattamente quello che eseguiFiltrante e sparaTiroCpu gia' fanno con la
   direzione, e per lo stesso motivo.
   Se nel frattempo il quadro e' cambiato e nessun compagno e' piu' in
   area, NON si cerca un ripiego: il portatore tiene il pallone e ridecide
   al passo dopo. Un cross sparato "perche' ormai era deciso" e' il
   pallone regalato che questa toppa esiste per non fare piu'.
   ===================================================================== */
function crossCPU(p, opGoalX){
  if(Math.abs(opGoalX-p.x) > FW*CROSS_ZONA) return false;
  if(Math.abs(p.y-FH/2) < GOAL_H) return false;          // non e' sulla fascia
  if(!crossBersaglio(p, opGoalX)) return false;
  /* SI CAMBIA IDEA SU UN APPOGGIO, MAI SU UN TIRO.
     Senza questa riga il cross non parte quasi mai, e il perche' e' una
     misura, non un sospetto. Misurato con strumenti/_sonda-cross2.js su
     questo stesso gioco, 12 partite a taglia 5, semi 20260803..814: nei
     fotogrammi in cui crossBersaglio trova davvero un compagno in area
     (90 in tutto), il portatore sta GIA' accennando un gesto in 81 casi
     — il 90% — e resta libero in 9. anticipa() rifiuta di aprire una
     carica sopra un'altra, quindi senza questa riga si perderebbero
     quelle 81. Non e' un caso: un portatore pressato sulla fascia decide
     di scaricare a ogni tempo di reazione, mentre il compagno impiega
     piu' di un secondo ad arrivare in area. Quando arriva, l'appoggio e'
     gia' partito come pensiero.
     Il gioco questa mossa la fa gia': doFiltrante chiude la carica aperta
     quando il dito chiede un'altra cosa (dentro doFiltrante, la riga
     "stava caricando il tiro: cambia idea"). Qui vale la stessa regola con un limite in piu': si
     cambia idea solo su un APPOGGIO, mai su un tiro — il tiro ha la
     precedenza, e questa e' la terza riga che glielo garantisce.
     La clip 'cross' distingue la carica del cross da quella
     dell'appoggio, cosi' il cross non annulla se stesso. */
  if(p.charge>=0){
    if(p.chargeKind!=='passo' || p.chargeClip==='cross') return false;
    chiudiAnticipo(p);
  }
  if(!anticipa(p, 'passo', PASS_CAR, q=>{
    const b=crossBersaglio(q, opGoalX);
    if(!b) return;                       // il quadro e' cambiato: non si regala
    doCross(q, b.nx, b.ny, b.mira, G.players.indexOf(b.q));
  })) return false;
  p.chargeClip='cross';
  return true;
}

/* il portatore CPU: alterna in modo leggibile dribbling / passaggio / tiro */
function aiCarrier(p, opGoalX, D){`);

/* ------------------------------------------------------------------ 6
   LA ZONA DI TIRO DIVENTA UNA FUNZIONE — stessa espressione, due lettori,
   e adesso quella funzione serve a DIMOSTRARE che il cross non ruba il
   tiro invece che ad affermarlo. */
cambio('6. la zona di tiro diventa zonaTiro()',
`  const inRange = distGoal<Math.min(FW*0.40, (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR) && Math.abs(p.y-FH/2)<FH*0.40;`,
`  const inRange = zonaTiro(p.x, p.y, opGoalX);`);

/* ------------------------------------------------------------------ 6b
   ...E LA VARIABILE CHE RESTAVA A TERRA. Il cambio 6 toglie l'unica
   lettura di distGoal in tutto il file: dopo di lui la riga qui sotto
   calcola un numero che nessuno guarda piu'. Il critico l'ha trovata
   (_onda0bis/b9.md, N5) e ha ragione — una riga morta dentro una funzione
   che gira per ogni portatore a ogni fotogramma non e' un dettaglio di
   stile: e' un invito a rimetterla in uso senza sapere cosa significava.
   Va via qui e non nel cambio 6 perche' e' una cosa diversa, e perche'
   cosi' si puo' saltare (--salta 6b) senza toccare il resto. */
cambio('6b. via distGoal, che dopo il cambio 6 non la legge piu\' nessuno',
`  const distGoal=Math.abs(opGoalX-p.x);
  /* pressione avversaria */`,
`  /* pressione avversaria */`);

cambio('7. il ramo del cross in aiCarrier: fuori dalla zona di tiro, e a ogni fotogramma',
`  if(p.aiActT===undefined) p.aiActT=0;
  p.aiActT-=DT;
  if(p.aiActT>0) return;`,
`  /* =====================================================================
     IL CROSS SI GUARDA A OGNI FOTOGRAMMA, E NON PUO' RUBARE IL TIRO.

     DUE COSE SONO CAMBIATE RISPETTO ALLA PRIMA STESURA, e la prima e' una
     ritrattazione. La prima stesura scriveva: "le due bande sono definite
     dallo STESSO numero, GOAL_H, quindi non si sovrappongono in nessun
     punto del campo". Era falso, e il critico l'ha misurato: la banda del
     cross era |y-FH/2| > GOAL_H, quella del tiro |y-FH/2| < FH*0,40, e
     fra le due c'e' una striscia contesa che vale il 26% del campo a 5
     contro 5, il 36% a 7 e il 45% a 11. In quella striscia il cross
     rubava il tiro, e lo rubava per progetto: stava prima apposta.
     Adesso la condizione e' la NEGAZIONE ESATTA della condizione del
     tiro, non un'altra disuguaglianza che le assomiglia: si crossa solo
     dove zonaTiro(x,y) e' falsa, cioe' esattamente dove il ramo del tiro
     qui sotto non entrerebbe mai. Le due cose non si sovrappongono perche'
     sono l'una il complemento dell'altra — e adesso e' vero, e si legge
     in una riga invece di doverlo credere.

     LA SECONDA: si guarda a OGNI FOTOGRAMMA, prima del ritmo delle
     azioni. Il ritmo (una decisione ogni 0,22-0,4 s, cioe' da 13 a 24
     fotogrammi) esiste perche' la CPU non balli fra un'idea e l'altra,
     ed e' giusto per dribbling, passaggio e tiro, che sono alternative
     fra loro. Il cross non e' un'alternativa: e' una finestra che si apre
     e si chiude, e guardare una finestra rara con un occhio lento
     significa non vederla.
     QUANTO VALE, misurato togliendo questo cambio e rigiocando le stesse
     partite — node strumenti/_t-cross-cpu.js ... --salta 7, poi
     strumenti/_q-cross2.js --partite 200 --taglia 5, semi
     20260803..20261002: i cross partiti scendono da 124 a 86 e le
     conclusioni da 69 a 35. Un terzo dei cross, e la meta' di quelli che
     finiscono in un tiro, stanno tutti nei fotogrammi che il ritmo delle
     azioni salta.
     Non fa ballare niente: crossCPU torna vero solo quando esiste un
     compagno IN AREA, il portiere non ci arriva e il varco e' libero;
     quando torna vero il pallone parte e il possesso finisce.
     ===================================================================== */
  if(p.kickCd<=0 && !zonaTiro(p.x, p.y, opGoalX) && crossCPU(p, opGoalX)){
    p.aiActT=Math.max(p.aiActT||0, 0.30);   // non decide altro mentre il piede va
    return;
  }

  if(p.aiActT===undefined) p.aiActT=0;
  p.aiActT-=DT;
  if(p.aiActT>0) return;`);

/* ------------------------------------------------------------------ 7b
   ...e il SECONDO posto in cui si guarda: dentro la zona di tiro, ma solo
   dopo che il tiro ha detto di no. Anche questo non ruba niente. */
cambio('7b. il cross dentro la zona di tiro, ma solo dopo il rifiuto del tiro',
`    return;
  }
  /* scarica se pressato */
  if(press<80 && Math.random()<0.75){ aiPass(p, D); return; }`,
`    return;
  }

  /* IL SECONDO POSTO, e vale la stessa garanzia.
     Qui ci si arriva solo se il ramo del tiro NON ha fatto "return", cioe'
     se il portatore era fuori dalla zona di tiro (e allora il cross l'ha
     gia' guardato piu' sopra, e questa riga non trova niente di nuovo)
     oppure se era dentro e il dado della frequenza di tiro ha detto di no.
     In tutti e due i casi il tiro ha gia' avuto la sua occasione e l'ha
     rifiutata: il cross non gliene toglie nessuna. Quello che sostituisce
     e' il PASSAGGIO delle due righe qui sotto, che e' l'alternativa vera.
     Serve perche' la striscia contesa — 26% del campo a 5 contro 5, 36% a
     7, 45% a 11 — e' anche quella da cui si crossa meglio.
     QUANTO VALE, ed e' POCO, e va detto poco: togliendo questo ramo
     (--salta 7b) e rigiocando le stesse 200 partite, i cross scendono da
     124 a 115 e le conclusioni da 69 a 64. Nove cross su 124, il 7%.
     E' il ramo che potrebbe rubare un tiro, ed e' il piu' piccolo dei
     due: chi va a cercare un danno, sappia che e' grande cosi'. */
  if(p.kickCd<=0 && crossCPU(p, opGoalX)){
    p.aiActT=Math.max(p.aiActT||0, 0.30);
    return;
  }

  /* scarica se pressato */
  if(press<80 && Math.random()<0.75){ aiPass(p, D); return; }`);

/* ------------------------------------------------------------------ 9
   L'ATTACCO DELL'AREA, L'INTERRUTTORE CHE SI SPEGNE, E CHI E' ATTESO
   SOTTO IL PALLONE. */
cambio('9. attaccaArea(), l\'azzeramento di corsaArea e il ramo del pallone in volo',
`function aiDecide(p, b, carrier, weHaveBall, myGoalX, opGoalX, isCpuTeam, D){
  const myTeam=p.team;`,
`/* =====================================================================
   L'ATTACCO DELL'AREA — l'uomo che si stacca e va a farsi trovare.

   Senza questa corsa il cross non ha un destinatario, e non per colpa
   della mira: in questo gioco chi non ha il pallone si offre AL FIANCO
   del portatore (il ramo dello smarcato, qui sotto), quindi al tempo di
   volo dentro l'area non c'e' nessuno e crossBersaglio torna null sempre.
   Con la corsa, misurato su questo gioco con strumenti/_sonda-cross2.js —
   12 partite CPU contro CPU, taglia 5, semi 20260803..814: 635 corse in
   area, durata mediana 0,87 s, distanza dalla porta da 498 unita' a 362,
   e 136 su 635 — il 21,4% — che entrano davvero in area.
   Qui SI ELEGGE UN UOMO PER SQUADRA — il piu' avanzato, escluso l'ultimo
   uomo, scelto senza pescare un numero — che smette di offrirsi al fianco
   e va al secondo palo, cioe' esattamente dove puntoCross fa cadere un
   cross.
   L'ultimo uomo non ci va mai: e' la regola di casa che impedisce che una
   palla persa diventi un tiro a porta vuota.

   "UNO" E' IL RISULTATO DELL'ELEZIONE, NON UN'INVARIANTE — e la prima
   stesura di questo commento affermava il contrario ("uno solo e non
   due"), che era FALSO. La correzione sta qui perche' e' esattamente il
   genere di frase per cui questa toppa era stata bocciata: un commento
   che promette una garanzia che il codice sotto non da'.
   Il codice ammette DUE uomini in corsa insieme, per due strade che si
   leggono qui accanto:
     - corsaArea e' un cronometro con la coda di CROSS_CORSA_T e questa
       funzione NON azzera chi perde l'elezione: al cambio di titolare il
       vecchio finisce la coda mentre il nuovo comincia la sua. E' il
       prezzo del cronometro, ed e' pagato apposta: un azzeramento in
       testa e' l'interruttore da spegnere a mano che il cambio 8 esiste
       per togliere;
     - il ramo del DESTINATARIO DI UN CROSS in aiDecide scrive corsaArea
       fuori dall'elezione e torna prima di arrivarci: chi ha il pallone
       scritto addosso ci va comunque.
   MISURATO, non stimato, con strumenti/_q-grumo.js — 24 partite CPU
   contro CPU, taglia 5, semi 20260803..826, su questo gioco (base
   md5 804328ee piu' questa toppa; sul gioco vergine lo stesso strumento
   stampa zero ovunque, ed e' il controllo che non se lo inventa):
     mai tre insieme; due insieme sullo 0,94% dei fotogrammi-squadra
     (1,87% dei fotogrammi di partita), 147 episodi, durata mediana
     0,33 s e massima 0,90 s; la causa e' il cambio di titolare nel 94,8%
     dei casi e il destinatario di un cross nel 5,2%.
   E NON SONO UN GRUMO, che era la ragione vera della frase: quando sono
   due, la distanza fra loro ha mediana 98,1 unita' contro SEP_R = 54, e
   scende sotto SEP_R in 186 fotogrammi-squadra su 294.998, cioe' lo
   0,063%. La separazione fa il suo lavoro; se un giorno smettesse di
   farlo, e' questo numero che si muove per primo.
   ===================================================================== */
const CROSS_CORSA = 0.58;     // da dove comincia la corsa: la meta' campo offensiva
const CROSS_CORSA_T = 0.60;   // quanto dura una corsa senza essere rinnovata
function attaccaArea(p, carrier){
  /* =====================================================================
     SOLO DOVE IL GIOCO NON HA GIA' UN UOMO DAVANTI, e non e' una scelta
     di comodo: e' la riga piu' cara di questa toppa, pagata con una
     misura che l'ha bocciata a due taglie su tre.

     Dalla taglia 7 questo gioco assegna gia' il ruolo 'punta' — "come
     c'e' un uomo che non sale mai, c'e' un uomo che non scende mai" — con
     una stazione (PUNTA_X = 0,70) tarata su cinque valori misurati a 12
     partite ciascuno. Mettere un SECONDO uomo fisso davanti rompe quella
     forma.

     E QUESTA RIGA SI PUO' TOGLIERE PER RIFARE LA MISURA, che e' l'unica
     forma in cui una misura scritta in un commento vale qualcosa:
       node strumenti/_t-cross-cpu.js  CALCETTO-il-gioco.html dopo.html
       node strumenti/_t-area-ovunque.js dopo.html arm.html
       node strumenti/_q-cross2.js --partite 120 --taglia 7 --gioco arm.html
     Misurato cosi', 120 partite per condizione, semi 20260803..20260922,
     tempo regolamentare, IC bootstrap al 95% e permutazione a 5000 giri:
       taglia 7    attacco dell'area ACCESO   tiri  8,91  momenti/min 1,99
                   spento, com'e' spedito     tiri 11,88  momenti/min 3,03
                   gioco vergine              tiri 11,75  momenti/min 2,85
         acceso contro spedito: tiri -2,97 IC [-3,73; -2,22] p<0,001, e
         momenti/min -1,05 IC [-1,44; -0,66] p<0,001. Tutti e due MISURATI.
       taglia 11   acceso                     tiri  5,06  momenti/min 0,63
                   spento, com'e' spedito     tiri  7,31  momenti/min 0,64
                   gioco vergine              tiri  7,55  momenti/min 0,70
         acceso contro spedito: tiri -2,25 IC [-2,85; -1,66] p<0,001,
         MISURATO; ma momenti/min -0,01 IC [-0,19; +0,18] p=0,949, cioe'
         NON MISURATO. A undici quello che cala sono i TIRI, e i momenti
         da porta non si distinguono dal caso: va detto cosi', perche' la
         prima stesura affiancava 0,63 a 0,70 come se fosse una
         differenza, e non lo e'.
         E i cross restano ZERO anche con la riga tolta: a undici non ne
         parte nemmeno uno.
     A 5 contro 5 la punta NON esiste — teamBrain la assegna solo da
     TAGLIA>=7, e il suo commento spiega perche': "a 5 contro 5 sono due
     su quattro e non si vede" — quindi non c'e' nessuna forma da
     rompere, e li' i numeri vanno nell'altro verso.
     Percio' la corsa in area vive dove il gioco non ha gia' un uomo
     davanti, e in nessun altro posto. Il cross a 7 e a 11 resta una cosa
     NON FATTA, ed e' scritto cosi' nel rapporto invece di essere spedito
     con un numero che dice il contrario di quello che promette.
     ===================================================================== */
  if(TAGLIA>=7) return false;
  const t=p.team, gx=t===0?FW:0;
  if(Math.abs(gx-carrier.x) > FW*CROSS_CORSA) return false;
  if(ruoloDi(p)==='ultimo') return false;
  /* CHI CI VA NON CAMBIA VENTI VOLTE AL SECONDO.
     "Il piu' avanzato" cambia titolare di continuo, perche' due uomini
     che corrono vicini si superano a ogni passo: senza isteresi la corsa
     non e' lenta, e' spezzata in venti pezzi, e nessun pezzo fa in tempo
     ad arrivare. Con l'isteresi, la corsa dura in mediana 0,87 s e una su
     cinque entra in area (il numero e i suoi semi stanno qui sopra).
     Chi ha gia' cominciato tiene il posto finche' non e' piu' indietro
     del migliore di SEP_R, che e' la distanza alla quale questo gioco
     considera due compagni "nello stesso posto" (la separazione). Non e'
     un numero nuovo: e' quello. */
  let best=null, bd=-1e9;
  for(const q of G.players){
    if(q.team!==t || q===carrier || q.out>0 || q.role==='gk') continue;
    if(ruoloDi(q)==='ultimo') continue;
    const d=-Math.abs(gx-q.x) + (q.corsaArea>0 ? SEP_R : 0);
    if(d>bd){ bd=d; best=q; }
  }
  if(best!==p) return false;
  const pc=puntoCross(carrier);
  p.aiTX=clamp(pc[0], 60, FW-60);
  p.aiTY=clamp(pc[1], 40, FH-40);
  p.corsaArea=CROSS_CORSA_T;
  return true;
}

function aiDecide(p, b, carrier, weHaveBall, myGoalX, opGoalX, isCpuTeam, D){
  /* =====================================================================
     IL PALLONE IN VOLO E' ANCORA DI QUALCUNO.
     Finche' un cross e' per aria b.owner vale -1, quindi weHaveBall e'
     falso per tutti e due i colori e la squadra che ha crossato torna a
     difendere — compreso l'uomo che stava entrando in area per ricevere
     quel cross. Il cross non arrivava per QUESTO, non per la mira: chi
     doveva riceverlo girava le spalle nell'istante esatto in cui il
     pallone partiva verso di lui.
     Chi e' indirizzato ci va, al punto di caduta vero (puntoCaduta, con
     l'attrito dentro), e ci va di corsa. Uno solo, quello scritto sul
     pallone. Il cross del dito non scrive nessun indirizzo, quindi per il
     giocatore umano qui non cambia niente.
     ===================================================================== */
  if(b.owner<0 && b.z>0 && b.crossTo===G.players.indexOf(p)){
    const c=puntoCaduta(b);
    p.aiTX=clamp(c[0], 30, FW-30);
    p.aiTY=clamp(c[1], 30, FH-30);
    p.corsaArea=CROSS_CORSA_T;
    return;
  }
  /* =====================================================================
     LA CORSA IN AREA ATTRAVERSA IL PALLONE DI NESSUNO — ed e' la seconda
     meta' della ragione per cui il cross non arrivava.
     In questo gioco il pallone non e' ai piedi di nessuno per la maggior
     parte del tempo (lo dice il commento di teamBrain: "il 65%"), e a
     ogni passaggio weHaveBall diventa falso e TUTTA la squadra scende nel
     ramo di copertura. Se la corsa in area vive solo dentro il ramo del
     possesso, la spezza ogni passaggio della PROPRIA squadra, e una corsa
     che riparte da zero a ogni passaggio non arriva mai in fondo: il
     cross non puo' avere un destinatario perche' nessuno arriva mai a
     destinazione. Quanto duri e quanto spesso arrivi adesso e' scritto
     con i suoi semi nel commento di attaccaArea.
     Qui la corsa continua mentre il pallone e' libero nella meta' campo
     offensiva. Muore lo stesso, e subito, quando il pallone e' in piedi
     all'avversario (e' la seconda riga del cambio 8); non tocca l'ultimo
     uomo ne' chi deve andare sul pallone; e non parte mai se il pallone
     e' a casa nostra.
     ===================================================================== */
  if(!weHaveBall && !carrier &&
     Math.abs(opGoalX-b.x) < FW*CROSS_CORSA &&
     ruoloDi(p)!=='pressa' &&
     attaccaArea(p, {team:p.team, x:b.x, y:b.y})) return;
  const myTeam=p.team;`);

/* ------------------------------------------------------------------ 8
   LA CORSA IN AREA E' UN CRONOMETRO, NON UN INTERRUTTORE. */
cambio('8. corsaArea scade da sola e muore quando la palla e\' loro',
`  const isCpuTeam = G.cpu[myTeam];

  /* ricalcola il bersaglio con un tempo di reazione */
  p.aiT-=dt;`,
`  const isCpuTeam = G.cpu[myTeam];

  /* =====================================================================
     LA CORSA IN AREA E' UN CRONOMETRO, NON UN INTERRUTTORE — e questo e'
     il difetto piu' grosso che la prima stesura aveva.

     corsaArea si scriveva in due soli punti, tutti e due DENTRO
     attaccaArea, e attaccaArea e' chiamata in UN SOLO ramo di aiDecide:
     quello dello smarcato, cioe' solo quando la squadra ha la palla e tu
     non sei ne' il portatore ne' l'ultimo uomo. Ma il flag lo legge OGNI
     FOTOGRAMMA aiVuoleSprint. Al primo pallone perso il ramo cambia,
     attaccaArea non viene piu' chiamata, e il flag restava ACCESO: chi
     attaccava l'area tornava a difendere scattando a comando fisso,
     saltando la regola "tiene da parte il fiato" che quella funzione
     esiste per applicare. Sopravviveva al gol e al calcio d'inizio.
     QUANTO VALEVA, E CON QUALE ETICHETTA — perche' anche qui un numero e'
     stato ritirato. Il critico misuro' sulla prima stesura il 24,46% dei
     fotogrammi-uomo con il flag acceso, cioe' il DOPPIO del tetto
     aritmetico per "un uomo solo, e solo nella squadra in possesso"
     (1 su 8 uomini di movimento = 12,5%): il tetto e' un conto, si rifa'
     a mente, e da solo basta a dire che il flag restava acceso fuori
     posto. I 20,32 punti percentuali che accompagnavano quel numero
     erano etichettati "con la palla all'AVVERSARIO", e l'ETICHETTA ERA
     SBAGLIATA — quella voce conta anche il pallone di NESSUNO, che e'
     esattamente il tempo in cui la corsa in area DEVE continuare (vedi in
     aiDecide il ramo del pallone libero). Il critico l'ha ritirata lui
     stesso, e qui non si riporta.
     Quello che si misura OGGI, su questo gioco, e' questo:
       strumenti/_zz-critico-corsa.js (la sonda del critico, invariata),
       6 semi, taglia 5: corsaArea accesa sul 7,73% dei fotogrammi-uomo,
       sotto il tetto di 12,5%; sul gioco vergine 0,00%;
       strumenti/_sonda-cross2.js, 12 partite, taglia 5, che separa i
       casi: la palla e' IN PIEDI ALL'AVVERSARIO nello 0,07%.
     La seconda riga qui sotto e' quella che quello 0,07% lo garantisce.

     Azzerarlo in testa ad aiDecide chiuderebbe QUESTO caso e lascerebbe
     aperta la classe: un interruttore che una funzione accende e
     un'altra deve ricordarsi di spegnere e' un difetto che si riapre
     alla prossima riga che qualcuno aggiunge. Un CRONOMETRO non si puo'
     dimenticare acceso, perche' si spegne da solo — e questo posto e'
     l'unico che gira a ogni fotogramma per ogni uomo non comandato dal
     dito. Scade in CROSS_CORSA_T = 0,60 s, cioe' piu' del passo massimo
     di ripianificazione (0,5 s per un libero lontano), quindi una corsa
     che serve viene rinnovata prima di scadere; e muore SUBITO, senza
     aspettare la scadenza, quando il pallone e' in piedi all'avversario.
     ===================================================================== */
  if(p.corsaArea>0) p.corsaArea=Math.max(0, p.corsaArea-dt);
  if(carrier && carrier.team!==myTeam) p.corsaArea=0;

  /* ricalcola il bersaglio con un tempo di reazione */
  p.aiT-=dt;`);

cambio('10. l\'attacco dell\'area (il ramo di aiDecide)',
`    }else{
      /* smarcato: offri una linea di passaggio avanzata sul lato.
         Il lato viene dalla voce di formazione (-1/0/+1), non piu'
         dall'indice: stessa logica, dato invece di numero magico. */
      const side = p.lato ? p.lato : (p.y<FH/2?-1:1);`,
`    }else{
      /* L'AREA VIENE PRIMA DELL'APPOGGIO AL FIANCO, per uno solo. */
      if(attaccaArea(p, carrier)) return;
      /* smarcato: offri una linea di passaggio avanzata sul lato.
         Il lato viene dalla voce di formazione (-1/0/+1), non piu'
         dall'indice: stessa logica, dato invece di numero magico. */
      const side = p.lato ? p.lato : (p.y<FH/2?-1:1);`);

cambio('11. chi attacca l\'area ci va di corsa',
`function aiVuoleSprint(p){
  if(p.fiato<32) return false;`,
`function aiVuoleSprint(p){
  if(p.fiato<32) return false;
  if(p.corsaArea) return true;      // chi attacca l'area ci va di corsa`);

/* ------------------------------------------------------------------ 12
   CHI INSEGUE UN PALLONE PER ARIA VA DOVE CADE, NON DOVE E'. */
cambio('12. l\'inseguitore punta il punto di caduta, per tutti e due i colori',
`        /* attacco diretto alla palla; Duro legge la traiettoria in anticipo */
        const lead = carrier ? 0.10+D.lead*0.5 : 0.16+D.lead;
        p.aiTX=b.x+b.vx*lead; p.aiTY=b.y+b.vy*lead;`,
`        /* attacco diretto alla palla; Duro legge la traiettoria in anticipo */
        const lead = carrier ? 0.10+D.lead*0.5 : 0.16+D.lead;
        p.aiTX=b.x+b.vx*lead; p.aiTY=b.y+b.vy*lead;
        /* UN PALLONE PER ARIA HA UN POSTO DOVE CADE, e prima di questa
           riga nessuno in questo gioco lo sapeva: si inseguiva l'ombra
           corrente piu' un decimo di secondo, che su un pallone alto e'
           un bersaglio che scappa per tutta la durata del volo. Vale per
           tutti e due i colori — e' una cosa che all'IA mancava, non un
           vantaggio dato a chi crossa: senza questa riga la difesa non
           saprebbe respingere il cross che i cambi qui sopra rendono
           possibile, e sarebbe un regalo invece di un duello. */
        if(b.z>0 || b.vz>0){ const c=puntoCaduta(b); p.aiTX=c[0]; p.aiTY=c[1]; }`);

/* ------------------------------------------------------------------ 13
   IL PORTATORE TIENE LA FASCIA MENTRE IL COMPAGNO ENTRA IN AREA. */
cambio('13. il portatore aspetta il compagno invece di stringere al centro',
`    if(carrier===p){
      /* portatore: punta la porta (la logica azione sta in aiCarrier) */
      const ty=clamp(b.y+(FH/2-b.y)*0.1, 50, FH-50);
      p.aiTX=opGoalX===FW?Math.min(FW-70,p.x+120*KPASSO):Math.max(70,p.x-120*KPASSO);
      p.aiTY=ty;`,
`    if(carrier===p){
      /* portatore: punta la porta (la logica azione sta in aiCarrier) */
      const ty=clamp(b.y+(FH/2-b.y)*0.1, 50, FH-50);
      p.aiTX=opGoalX===FW?Math.min(FW-70,p.x+120*KPASSO):Math.max(70,p.x-120*KPASSO);
      p.aiTY=ty;
      /* IL PORTATORE ASPETTA, E TIENE LA FASCIA.
         La riga qui sopra fa rientrare il portatore verso l'asse del 10% a
         ogni ripianificazione: in due secondi e' lui dentro l'area, e da
         li' un cross non ha piu' ne' distanza (serve dMin = 223 unita' a 5
         contro 5) ne' angolo. Cioe': il portatore si toglieva da solo la
         possibilita' di crossare.
         Mentre un compagno sta correndo in area — e SOLO allora, e solo se
         il portatore e' gia' fuori dalla banda della porta — la larghezza
         si tiene. Non ferma nessuno: il bersaglio resta piu' avanti di
         dove si sta, e il ramo del tiro conserva la precedenza. */
      if(Math.abs(p.y-FH/2)>GOAL_H){
        for(const q of G.players){
          if(q.team===p.team && q!==p && q.corsaArea && q.out<=0){ p.aiTY=p.y; break; }
        }
      }`);

/* ------------------------------------------------------------------ 14
   IL PALO NON SI ANNUNCIA VENTI VOLTE — un preesistente, trovato qui.
   E' l'unico cambio che si puo' applicare da solo: --solo 14. */
cambio('14. il palo non si annuncia (ne\' scuote, ne\' gela) sul pallone che qualcuno sta portando',
`    tagliaScia();
    if(sp>320){
      /* IL PALO. Il colpo piu' secco del calcio: metallo contro cuoio, e
         la palla riparte dall'altra parte. La scossa va lungo la NORMALE
         del palo, cioe' esattamente da dove la palla e' stata respinta. */
      scossa(8.0, 0.28, nx, ny);
      gelo(0.065);
      spruzzo(cx, cy, nx, ny, 11, 1.4);
      lampo(cx, cy, nx, ny, 1.15);
      showBanner('PALO!','#39d3e6',1.0);
      Audio5.post(); buzz(25);
      G.crowdHype=Math.max(G.crowdHype,0.9);
    }else Audio5.clack(false);`,
`    tagliaScia();
    /* IL PALO E' UN EVENTO, NON UNO STATO — ed e' un difetto PREESISTENTE.
       hitPosts non ha nessun tempo morto E gira anche nel ramo del
       DRIBBLING di updateBall: quel ramo chiama ballWalls, e ballWalls
       chiama hitPosts come PRIMA cosa, senza mai guardare b.owner.
       Un portatore che spinge il pallone contro il
       montante lo fa rimbalzare e lo riprende a ogni fotogramma: la
       velocita' di inseguimento del dribbling vale (bersaglio-palla)*14 e
       supera le 320 unita' della soglia, quindi ogni rimbalzo si annuncia.

       E QUI VA RITIRATO UN NUMERO DELLA PRIMA STESURA. Quella diceva
       "DICIASSETTE PALO! fra il fotogramma 2636 e il 2716, taglia 7, seme
       20260812" e "seme 20260807 da 11 a 2 legni". NON SONO RIPRODUCIBILI.
       Misurato con strumenti/_sonda-palo2.js, che conta esattamente la
       classe che questo cancello chiude (urto col montante sopra le 320
       unita' con il pallone IN POSSESSO): sul gioco vergine, 24 partite per
       taglia a 5, 7 e 11 con i semi 20260803..826, quella classe vale
       ZERO, ZERO e ZERO. Su quel campione questo cambio non toglie
       nemmeno un annuncio, e i numeri della prima stesura vengono da un
       altro flusso di dadi (o da un gioco gia' toppato).
       Quello che si misura davvero e' questo, e si rifa' con due comandi
       (la copia toppata SENZA questo cambio, contro la copia toppata):
         node strumenti/_t-cross-cpu.js CALCETTO-il-gioco.html senza14.html --salta 14
         node strumenti/_sonda-palo2.js senza14.html 7 24
       Taglia 7, 24 partite, semi 20260803..826: la classe esiste — 7 urti
       col pallone in possesso, di cui una raffica di 7 consecutivi — e il
       cancello toglie 8 annunci su 34 e 14 chiamate a gelo() su 1051.
       A taglia 5 e a taglia 11, sullo stesso campione, toglie ZERO.
       Il difetto e' vero nel codice, e' raro nei fatti, e questo cambio lo
       chiude: tutte e tre le cose insieme.

       IL CANCELLO PRENDE TUTTO IL BLOCCO, non solo l'annuncio. La prima
       stesura ci metteva dentro showBanner, Audio5.post e buzz e lasciava
       fuori scossa, gelo, spruzzo e lampo: chiudeva due delle tre cose che
       elencava fra i danni, e il gelo — l'hit-stop, cioe' la cosa che si
       SENTE di piu' — restava a sparare a ogni fotogramma.
       La FISICA non e' toccata: il pallone continua a rimbalzare sul palo,
       come deve. Un pallone che stai portando non prende un palo: lo stai
       grattando. */
    if(sp>320 && b.owner<0){
      /* IL PALO. Il colpo piu' secco del calcio: metallo contro cuoio, e
         la palla riparte dall'altra parte. La scossa va lungo la NORMALE
         del palo, cioe' esattamente da dove la palla e' stata respinta. */
      scossa(8.0, 0.28, nx, ny);
      gelo(0.065);
      spruzzo(cx, cy, nx, ny, 11, 1.4);
      lampo(cx, cy, nx, ny, 1.15);
      showBanner('PALO!','#39d3e6',1.0);
      Audio5.post(); buzz(25);
      G.crowdHype=Math.max(G.crowdHype,0.9);
    }else Audio5.clack(false);`);

/* ------------------------------------------------------------------ 15
   IL CALCIO D'INIZIO SPEGNE ANCHE QUESTO. */
cambio('15. corsaArea fra i latch azzerati dal calcio d\'inizio',
`    p.mesto=0; p.frenaT=0; p.fintaT=0; p.presaT=0; p.rinvT=0;   // i latch del rig`,
`    p.mesto=0; p.frenaT=0; p.fintaT=0; p.presaT=0; p.rinvT=0;   // i latch del rig
    p.corsaArea=0;                                              // e la corsa in area`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_t-cross-cpu.js ingresso.html uscita.html [--salta 1,2] [--solo 14]'); process.exit(2); }
function lista(nome) {
  const i = process.argv.indexOf('--' + nome);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1].split(',').map(s => s.trim()).filter(Boolean) : [];
}
const SALTA = lista('salta'), SOLO = lista('solo');
const numero = c => c.nome.split('.')[0];
const daSaltare = c => SOLO.length ? !SOLO.includes(numero(c)) : SALTA.includes(numero(c));
/* CHI HA BISOGNO DI CHI. Un --salta che toglie una definizione e lascia
   il suo chiamante non produce un gioco piu' semplice: produce un gioco
   che si spegne alla prima riga di console, e la sonda lo racconterebbe
   come "zero cross" invece che come "gioco rotto". La toppa si rifiuta,
   e dice quale coppia. */
const DIPENDE = {
  '2': ['1'],                     // il quinto argomento senza la firma nuova
  '4': ['5'],                     // dentroArea la definisce il 5
  '5': ['1', '2'],                // crossCPU chiama doCross a cinque argomenti
  '6': ['5'], '7': ['5', '6'], '7b': ['5'],
  '6b': ['6'],                    // togliere distGoal senza il cambio 6 rompe inRange
  '9': ['1'],                     // attaccaArea usa puntoCross e puntoCaduta
  '10': ['9'],                    // il ramo chiama attaccaArea
  '12': ['1'],                    // l'inseguitore usa puntoCaduta
};
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
const attivi = new Set(CAMBI.filter(c => !daSaltare(c)).map(numero));
for (const n of attivi) for (const d of (DIPENDE[n] || []))
  if (!attivi.has(d)) guai.push(`il cambio ${n} ha bisogno del cambio ${d}, che e' stato escluso`);
let fatti = 0, saltati = 0;
for (const c of CAMBI) {
  if (daSaltare(c)) { saltati++; continue; }
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
  fatti++;
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${fatti} cambi su ${CAMBI.length}` +
  (saltati ? ` (${saltati} saltati)` : '') + `, ${ing} -> ${usc}`);
