/* =====================================================================
   _t-verbo-trascinato.js — IL TRASCINAMENTO SCEGLIE IL VERBO
   (famiglia 2 del confronto COMANDI con FC Mobile, 29 agosto 2026).

   IL DIFETTO, com'e' stato consegnato: «Touch5 produce UN dato continuo
   — il trascinamento — e ogni disco lo consuma come PARAMETRO di un
   verbo gia' deciso alla pressione. Non esiste da nessuna parte un
   risolutore che legga il trascinamento come SCELTA fra verbi.»

   Questa toppa mette quel risolutore — verboTrascinato(), UNA funzione,
   settore piu' ampiezza -> verbo — e lo fa leggere ai due dischi che un
   trascinamento ce l'hanno davvero. La regola e' UNA SOLA e vale su
   tutti e due:

       OLTRE 66 PIXEL, IL TRASCINAMENTO ALZA LA PALLA.

     disco FILTRANTE   66 px in QUALUNQUE direzione: il passaggio si
                       alza, e la quota cresce fino a 88 px. La
                       direzione continua a scegliere il ricevente,
                       com'era; sotto i 66 px non cambia un bit.
     disco TIRA        66 px verso l'ALTO: pallonetto. Su questo disco
                       la direzione E' gia' la mira (miraTiroF legge
                       lettura.dy e satura a MIRA_SAT = 26), quindi il
                       solo verso che puo' voler dire «alza» e' quello
                       che gia' vuol dire «alto»: si tira su il dito
                       finche' la palla passa sopra il portiere. La
                       mira non si perde — a 66 px su, f vale gia' -1,
                       cioe' il filo alto della porta, ed e' li' che il
                       pallonetto va.

   UNA STRADA BOCCIATA, COI NUMERI, prima di questa.
   La prima stesura metteva il pallonetto sul SETTORE INDIETRO del disco
   del tiro (coseno > 0,5 via dalla porta che si attacca), col ragionamento
   che «miraTiroF legge solo dy, quindi la componente x e' un asse morto».
   E' vero che nessuna riga legge dx — e falso che sia libero:
   IL GESTO DELLA MIRA DI QUESTA CASA E' UN TRASCINAMENTO INDIETRO. Il
   generatore di strumenti/_q-linea.js prova A lo scrive nero su bianco
   (dx = -46 +-5, dy = tt +-2 con tt fra -26 e 26): coseno con l'indietro
   pieno fino a 1,000, modulo fino a 58,18 px. E deve essere cosi', perche'
   la mira satura a |dy| = 26 mentre R_ARMA arriva a 36: per armare una
   mira piena SERVE una componente orizzontale, e dal disco in basso a
   destra l'unica direzione comoda e' verso il campo, cioe' indietro.
   Misura della bocciatura, strumenti/_q-linea.js prova A, 120 pressioni:
       gioco di casa            promesse diverse dall'esito   0 (0%)   scarto mediano  7,53 u
       col settore indietro                                 108 (90%)  scarto mediano 20,96 u
   Il 90% delle mire diventava un pallonetto. La cura era peggiore del
   male: il pallonetto involontario non spariva, cambiava padrone.
   Con la soglia sul verso ALTO il gesto della mira arriva a |dy| = 28
   contro i 66 richiesti — 38 px di margine — e prova A torna a 0%.

   E LA SOGLIA DEL PASSAGGIO NON E' 40. Il progetto (e la prova F di
   strumenti/_q-l14.js) la voleva a 40 px. Non regge, e il conto e' di
   costanti del gioco, non di gusto: L14_SAT vale 52, cioe' la direzione
   raggiunge la sua autorita' piena a 52 px, e R_ARMA arriva a 36. Con la
   soglia a 40 la finestra del passaggio MIRATO RASOTERRA sarebbe larga
   da 4 px (dito giu' da 0,6 s) a 18 px (dito appena posato), e un
   passaggio a piena autorita' di direzione non potrebbe piu' essere
   rasoterra: si alzerebbe sempre. A 66 px la finestra rasoterra e' larga
   30-44 px e comprende tutta la scala della direzione.
   Le soglie in fila, e sono tutte del gioco tranne l'ultima:
       22-36  R_ARMA      il trascinamento comincia a esistere
       26     MIRA_SAT    la mira del tiro e' piena
       52     L14_SAT     la direzione del passaggio e' piena
       66     TRASCINA_SU la palla si alza          <- questa toppa
       88     L14_PIENO   la quota e' piena         <- questa toppa
       96     R_ANNULLA   l'atto muore

   TRE BUGIE CHIUSE, e nessuna e' stata chiusa cancellando il commento.
     1. :13431-13437 prometteva «la quota dall'ampiezza ... vz fra 140 e
        210 (280*T con T fra 0,5 e 0,75) ... il pallone RICADE sul
        ricevente, che intanto ci va sotto perche' b.crossTo lo chiama».
        Il codice forzava b.vz = 0 e non scriveva mai b.crossTo. Adesso
        fa quello che il commento diceva, numero per numero.
     2. :13127 diceva «Sopra L14_SU la palla si alza, e allora si
        promette un arco». L14_SU non esisteva in nessuna riga del file.
        Adesso la soglia esiste (col suo nome vero, TRASCINA_SU) e l'arco
        si disegna: misurato a pixel, 118 colonne su 119 hanno ciano
        SOPRA la corda, la piu' alta a 49 px su 43,9 promessi.
     3. il pallonetto partiva dalla LEVETTA tenuta indietro, cioe' dal
        pollice che comanda la corsa: chi indietreggiava per spazzare
        alzava un pallonetto senza chiederlo. Misurato al banco prima di
        questa toppa (strumenti/_q-cmd2.js C2, cinque scene diverse
        della meta' campo offensiva, levetta a 44 px indietro — sotto lo
        sprint — e dito FERMO sul disco): 5 pallonetti su 5, quota vera
        del pallone 35,8 unita'. Dopo: 0 su 5.

   UN CANCELLO DIVENTA ROSSO APPOSTA, E VA DETTO PRIMA CHE LO SCOPRA UN
   ALTRO: strumenti/_q-l13.js prova E, «pallonetto: levetta indietro si',
   sprint no». Quella prova ha DUE meta' e questa toppa ne rovescia una:
     · levetta indietro a 40 px, con un dito sul disco: prima b.vz 205
       (pallonetto), adesso 61,69 (tiro raso). E' il contratto vecchio,
       ed e' esattamente quello che la toppa sostituisce: quando un dito
       tiene il disco, decide il dito. Il canale nuovo lo sorvegliano
       _q-cmd2 C2 (0 pallonetti su 5 dalla levetta), C2b (0 dalla mira)
       e C3 (5 su 5 dal trascinamento in su).
     · levetta avanti a fondo corsa (70 px, cioe' SPRINT): b.vz 47,
       cioe' tiro raso. Questa meta' — la non regressione vera, «lo
       sprint non alza il pallonetto» — resta VERDE.
   _q-l13.js NON e' stato toccato: e' un cancello di casa e altri lo
   stanno usando adesso su altre copie. Chi lo aggiornera' aggiorni la
   prima meta' e lasci la seconda dov'e'.

   COSA NON CAMBIA
     · nessun sorteggio nuovo: ne' verboTrascinato ne' voloL14 ne' il
       ramo alto pescano un numero. MISURATO (strumenti/_q-cmd2.js C1):
       quattro partite a semi 20260803..806, il numero di chiamate a
       dado() (3450, 2340, 3736, 1423), il punteggio e la posizione del
       pallone al millesimo sono IDENTICI prima e dopo.
     · la CPU non tocca nessun disco: tutte le simulazioni sono le stesse.
     · su tastiera nessuna lettura esiste, e il pallonetto resta quello
       di ieri — levetta indietro piu' meta' campo offensiva — parola per
       parola.
     · sotto R_ARMA non succede niente di nuovo.

   uso:  node strumenti/_t-verbo-trascinato.js --out fuori/cmd-seconda.html
   cancello: node strumenti/_q-cmd2.js --gioco fuori/cmd-seconda.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* ------------------------------------------------------------------ */
{
  nome: '1/11 il risolutore nasce accanto alle costanti che legge',
  cerca:
`const L14_K     = 220;   // quanto la direzione inclina (agente28 §3.1)
const L14_SAT   = 52;    // DRAG_SAT: saturazione dell'ampiezza, px CSS
const L14_DELTA = 20;    // margine di guardia sui primi due
const L14_AGG   = 60;    // isteresi SUL BERSAGLIO (non sulla direzione)`,
  metti:
`const L14_K     = 220;   // quanto la direzione inclina (agente28 §3.1)
const L14_SAT   = 52;    // DRAG_SAT: saturazione dell'ampiezza, px CSS
const L14_DELTA = 20;    // margine di guardia sui primi due
const L14_AGG   = 60;    // isteresi SUL BERSAGLIO (non sulla direzione)

/* =====================================================================
   IL RISOLUTORE — DA UN TRASCINAMENTO ESCE UN VERBO, NON UN PARAMETRO
   (29 agosto 2026).

   Fino a ieri Touch5 produceva UN dato continuo e ogni disco lo
   consumava come parametro di un verbo gia' deciso alla PRESSIONE: il
   trascinamento MODULAVA (la mira del tiro, il ricevente del passaggio)
   e non SCEGLIEVA mai. Questa e' la funzione che mancava — una sola,
   letta al rilascio da tutti i dischi che un trascinamento ce l'hanno, e
   letta anche dai segni di guida che lo promettono mentre il dito e'
   ancora giu'.

   LA REGOLA E' UNA SOLA, E VALE SU TUTTI E DUE I DISCHI:
   oltre TRASCINA_SU la palla si ALZA.
     sul disco della FILTRANTE conta l'AMPIEZZA, in qualunque direzione:
       la direzione la' vuol gia' dire «a chi», e alzarla non toglie
       niente a nessuno. La quota cresce da TRASCINA_SU a L14_PIENO.
     sul disco del TIRO conta il verso ALTO: la' la direzione E' la mira
       (miraTiroF legge lettura.dy) e l'unico verso che puo' voler dire
       «alza» e' quello che gia' vuol dire «in alto». A 66 px su la mira
       e' gia' saturata a f = -1, cioe' il filo alto della porta: e' li'
       che il pallonetto va, e promessa e esecuzione dicono la stessa
       cosa senza doversi accordare.

   PERCHE' 66, e perche' NON il settore indietro sul disco del tiro: la
   ragione e' misurata e sta nel cappello di strumenti/_t-verbo-trascinato.js.
   In breve: il gesto della mira di questa casa E' un trascinamento
   indietro (fino a 58,18 px di modulo, coseno 1,000 con l'indietro
   pieno), perche' la mira satura a 26 px mentre armare ne chiede fino a
   36 — la componente orizzontale serve ad armare, non a mirare. Col
   settore indietro il 90% delle mire diventava un pallonetto
   (_q-linea prova A: da 0% a 90% di promesse diverse dall'esito). Col
   verso alto il gesto della mira arriva a |dy| = 28 contro 66: 38 px di
   margine, e prova A resta a 0%.
   Le soglie in fila — le prime tre sono del gioco, le altre due di qui:
     22-36 R_ARMA · 26 MIRA_SAT · 52 L14_SAT · 66 TRASCINA_SU ·
     88 L14_PIENO · 96 R_ANNULLA.

   LA COSA SICURA E' SEMPRE IL RITORNO PIU' POVERO (P9). Nessuna lettura
   (tastiera, o dito gia' sparito) torna null e chi chiama resta padrone
   della sua regola di ieri; trascinamento non armato torna il verbo
   semplice. NESSUN SORTEGGIO qui dentro e nessuna scrittura: e' una
   funzione pura, e la chiamano anche i segni di guida, che girano a ogni
   fotogramma e anche due volte.
   ===================================================================== */
const TRASCINA_SU = 66;  // px CSS: oltre, il trascinamento chiede la palla ALTA
const L14_PIENO   = 88;  // px CSS: qui la quota del passaggio e' piena
const L14_T0 = 0.50;     // s di volo a quota minima  -> vz 140
const L14_T1 = 0.75;     // s di volo a quota piena   -> vz 210
function verboTrascinato(act, tr){
  if(!tr) return null;
  if(!tr.armato) return { act:(act==='shot' ? 'tiro' : 'passo'), su:0 };
  if(act==='shot')
    return { act:(tr.dy <= -TRASCINA_SU ? 'pallonetto' : 'tiro'), su:0 };
  if(act==='through')
    return { act:(tr.l>=TRASCINA_SU ? 'passoAlto' : 'passo'),
             su: clamp((tr.l-TRASCINA_SU)/(L14_PIENO-TRASCINA_SU), 0, 1) };
  return null;
}
/* IL TEMPO DI VOLO DEL PASSAGGIO ALTO, IN UN POSTO SOLO: lo legge
   eseguiPassaggioL14 (che lo esegue) e lo legge segniGuida (che disegna
   l'arco). Una scrittura, due letture — se no la promessa e il calcio
   divergono, ed e' la legge di L3.1.
   La famiglia balistica e' quella del cross di casa: vz = 280*T, quindi
   T fra 0,50 e 0,75 fa vz fra 140 e 210, e la velocita' orizzontale e'
   distanza/T cosi' il pallone RICADE sul ricevente. Il picco vale
   vz²/(2·560) = 70·T², cioe' da 17,5 a 39,4 unita' sulla carta. Misurato
   al banco (_q-cmd2 C4, quota vera del pallone): 19,6 a 70 px e 37,6 a
   92 px, contro i 20,8 e 39,4 della carta — l'integrazione a 1/60 taglia
   il vertice di un paio d'unita', e va detto invece che arrotondato.
   Sopra Z_SOPRA_TESTA = 26 il pallone scavalca i corpi: sulla carta da
   T = 0,609, cioe' da 75,6 px di trascinamento; misurato, fra i 70 px
   (19,6: non scavalca) e gli 80 (28,9: scavalca).
   IL PAVIMENTO SULLA DISTANZA non e' un ornamento: oltre 645 unita'
   (0,75 · TIRO_TETTO) la velocita' che servirebbe a coprire la distanza
   in 0,75 s supera il tetto del pallone di questo gioco. Allora si
   allunga il VOLO invece di far mentire la velocita' — e la quota cresce
   con lui, che e' anche quello che fa una palla lunga vera. */
function voloL14(su, dist){
  return Math.max(L14_T0 + (L14_T1-L14_T0)*su, dist/TIRO_TETTO);
}`,
},

/* ------------------------------------------------------------------ */
{
  nome: '2/11 il cappello di eseguiPassaggioL14 dice la verita\'',
  cerca:
`/* IL RILASCIO. tr e' la lettura del DISTACCO (60 ms scartati); su e
   bersaglio sono lo stato che la tenuta ha maturato. Non armato =
   appoggio sicuro, cioe' eseguiPassUmano identico a prima. Armato =
   mirato: il bersaglio agganciato (se ancora in campo), l'anticipo e la
   velocita' che CRESCONO con la corsa del ricevente — la filtrante
   emerge, non si nomina — e la quota dall'ampiezza.
   La quota e' la famiglia balistica del cross di casa: vz fra 140 e 210
   (cioe' 280*T con T fra 0,5 e 0,75), tempo di volo vz/280, velocita' =
   distanza/tempo cosi' il pallone RICADE sul ricevente, che intanto ci
   va sotto perche' b.crossTo lo chiama (il ramo di aiDecide esiste gia').
   Nel fotogramma del calcio la quota decide il gate della raccolta
   (Z_SOPRA_TESTA): rasoterra si intercetta, alta si scavalca. */
function eseguiPassaggioL14(p, tr, bersaglio){`,
  metti:
`/* IL RILASCIO. tr e' la lettura del DISTACCO (60 ms scartati);
   bersaglio e' l'aggancio che la tenuta ha maturato. Non armato =
   appoggio sicuro, cioe' eseguiPassUmano identico a prima. Armato =
   mirato: il bersaglio agganciato (se ancora in campo), l'anticipo e la
   velocita' che CRESCONO con la corsa del ricevente — la filtrante
   emerge, non si nomina — e, DA OGGI DAVVERO, la quota dall'ampiezza.

   LA RETTIFICA, e va scritta perche' questo commento ha mentito per
   tre giorni. Diceva gia' «la quota dall'ampiezza» e la descriveva nei
   dettagli; il codice sotto forzava b.vz = 0 e non scriveva mai
   b.crossTo. Non c'era nessun passaggio alto, e nessuno poteva
   accorgersene leggendo il commento. Adesso c'e', e i numeri sono
   quelli che il commento prometteva:
     T = voloL14(su, distanza), fra 0,50 e 0,75 s;
     vz = 280*T, cioe' fra 140 e 210;
     velocita' orizzontale = distanza / T, cosi' il pallone RICADE sul
       ricevente, che intanto ci va sotto perche' b.crossTo lo chiama
       (il ramo di aiDecide esiste da sempre, :17587) e appena la palla
       tocca terra ci pensa b.passTo (:17628).
   Nel fotogramma del calcio la quota decide il gate della raccolta
   (Z_SOPRA_TESTA = 26): rasoterra si intercetta, alta si scavalca.
   MISURATO OGGI al banco (strumenti/_q-cmd2.js C4, quota vera del
   pallone fotogramma per fotogramma, cinque ampiezze):
     40 px 0,0 · 60 px 0,0 · 70 px 19,6 · 80 px 28,9 · 92 px 37,6 unita'.
   Sotto TRASCINA_SU e' rasoterra al bit; sopra, la quota cresce, e da
   ottanta px in su scavalca le teste (Z_SOPRA_TESTA = 26).
   IL CONTO DELLA FILTRANTE resta sul rasoterra: una filtrante e' per
   definizione «tesa e rasoterra» (vedi doFiltrante), e contarci dentro
   una palla alta sarebbe una bugia nel tabellino. */
function eseguiPassaggioL14(p, tr, bersaglio){`,
},

/* ------------------------------------------------------------------ */
{
  nome: '3/11 il bivio dell\'ampiezza nel calcio del passaggio',
  cerca:
`  const spdP=clamp(300+l*0.9,320,520), spdF=clamp(380+l*1.1,420,640);
  const speed=spdP+(spdF-spdP)*fat;
  if(kickBall(p, dx/l, dy/l, speed, 0)){
    b.vz=0;                            // rasoterra: kickBall sopra 500 metterebbe quota
    b.passTo=bi;`,
  metti:
`  const spdP=clamp(300+l*0.9,320,520), spdF=clamp(380+l*1.1,420,640);
  /* =================================================================
     IL BIVIO DELL'AMPIEZZA, e da qui esce un VERBO e non un numero.
     verboTrascinato e' l'unico posto in cui il trascinamento diventa
     una scelta; qui si legge il suo verdetto e basta. Sotto TRASCINA_SU
     non cambia un bit rispetto a ieri: stessa velocita', stessa quota
     zero, stesso bersaglio. Sopra, la famiglia balistica del cross.
     ================================================================= */
  const vt=verboTrascinato('through', tr);
  const alto=!!(vt && vt.act==='passoAlto');
  const T=alto ? voloL14(vt.su, l) : 0;
  const speed=alto ? l/T : spdP+(spdF-spdP)*fat;
  if(kickBall(p, dx/l, dy/l, speed, 0)){
    b.vz=alto ? 280*T : 0;             // rasoterra: kickBall sopra 500 metterebbe quota
    b.passTo=bi;
    /* CHI E' ATTESO SOTTO IL PALLONE, la stessa riga del cross (:13607)
       e per la stessa ragione: finche' e' per aria b.owner vale -1,
       weHaveBall e' falso per tutti e due i colori e il ricevente
       tornerebbe a difendere proprio mentre la palla gli arriva
       addosso. Con l'indirizzo scritto sul pallone ci va lui, e solo
       lui, al punto in cui la palla scende a quota di testa. */
    if(alto) b.crossTo=bi;`,
},

/* ------------------------------------------------------------------ */
{
  nome: '4/11 la filtrante si conta solo rasoterra',
  cerca:
`    if(best.chiamata>0) G.stats.filtranti[t]=(G.stats.filtranti[t]||0)+1;`,
  metti:
`    if(best.chiamata>0 && !alto) G.stats.filtranti[t]=(G.stats.filtranti[t]||0)+1;`,
},

/* ------------------------------------------------------------------ */
{
  nome: '5/11 il pallonetto lo chiede il DITO sul disco del tiro',
  cerca:
`  if(((t===0 ? -mx : mx) > 0.5) && metaOffensiva(p)){
    fireShot(p, dx/l, dy/l, q, true);
    return;
  }
  fireShotMirato(p, c, finestra, lettura, my);`,
  metti:
`  /* =================================================================
     IL PALLONETTO LO CHIEDE IL DITO CHE TIENE IL DISCO DEL TIRO, e la
     levetta non lo chiede piu'.
     Il difetto di ieri, e i numeri sono di oggi: la levetta si ricentra
     a MAXR = 70 e lo sprint scatta a 66, quindi chi corre e' quasi
     sempre a fondo corsa; il pallonetto viveva sulla levetta tenuta
     INDIETRO, cioe' su uno STATO del pollice che comanda la corsa, e
     chi indietreggiava per spazzare lo alzava senza averlo chiesto.
     Misurato prima di questa toppa (strumenti/_q-cmd2.js C2, cinque
     scene della meta' campo offensiva, levetta a 44 px indietro — sotto
     lo sprint — e dito FERMO sul disco): 5 pallonetti su 5, quota vera
     35,8 unita'. Dopo: 0 su 5.
     IL CANALE NUOVO E' IL VERSO ALTO DEL TRASCINAMENTO, non il settore
     indietro: il settore indietro e' stato provato e BOCCIATO perche' la
     mira di questa casa E' un trascinamento indietro (il 90% delle mire
     diventava un pallonetto — _q-linea prova A, da 0% a 90% di promesse
     diverse dall'esito). Il conto sta nel cappello della toppa.
     LA PRECEDENZA E' DEL DITO, ED E' UNA RIGA SOLA. Se una lettura c'e'
     — cioe' se un dito sta tenendo il disco — decide lei, e la levetta
     non puo' piu' alzare niente: e' cosi' che il pallonetto involontario
     smette di esistere, per costruzione e non per taratura. Se la
     lettura non c'e' (tastiera, o rilascio del tetto senza dito) resta
     la regola di ieri, parola per parola.
     E IL PALLONETTO CHIESTO COL DITO MIRA DOVE MIRA IL DITO: a 66 px in
     su la mira e' gia' saturata a f = -1, cioe' il filo alto della
     porta. Il ramo della levetta tiene invece la correzione my*260 di
     sempre, perche' la' non c'e' nessun f da leggere.
     metaOffensiva resta la stessa guardia di ieri per tutti e due i
     canali: e' una regola del gioco, non una toppa contro gli
     incidenti, e toglierla al solo canale nuovo darebbe al dito un
     pallonetto che la tastiera non ha.
     ================================================================= */
  const vt=verboTrascinato('shot', lettura);
  const chiedeLob = vt ? (vt.act==='pallonetto') : (((t===0 ? -mx : mx) > 0.5));
  if(chiedeLob && metaOffensiva(p)){
    const fL = vt ? miraTiroF(lettura) : null;
    if(fL!==null) dy = (FH/2 + fL*(GOAL_H/2-24)) - p.y;
    const lL = Math.max(1,len(dx,dy));
    fireShot(p, dx/lL, dy/lL, q, true);
    return;
  }
  fireShotMirato(p, c, finestra, lettura, my);`,
},

/* ------------------------------------------------------------------ */
{
  nome: '6/11 la balistica del pallonetto in un posto solo',
  cerca:
`  if(lob){
    /* pallonetto: la quota e' l'arma, la potenza il prezzo */
    const b=G.ball;
    const potenza = (q===1?430:q===0?330:370)*pow;
    kickBall(p, nx, ny, potenza, 0);
    b.vz = q===1 ? 205 : 175;`,
  metti:
`  if(lob){
    /* pallonetto: la quota e' l'arma, la potenza il prezzo.
       I NUMERI STANNO IN lobBalistica, non qui: adesso li legge anche
       segniGuida per promettere l'arco mentre il dito e' ancora giu',
       e due copie degli stessi numeri sono due copie che divergono. */
    const b=G.ball;
    const bl=lobBalistica(q,pow);
    const potenza = bl.potenza;
    kickBall(p, nx, ny, potenza, 0);
    b.vz = bl.vz;`,
},

/* ------------------------------------------------------------------ */
{
  nome: '7/11 lobBalistica dichiarata sopra fireShot',
  cerca:
`function fireShot(p, nx, ny, q, lob){
  const t=p.team, pi=G.players.indexOf(p);`,
  metti:
`/* LA BALISTICA DEL PALLONETTO — una scrittura, due letture: la esegue
   fireShot qui sotto e la promette segniGuida, che disegna l'arco
   mentre il dito tiene ancora il disco. I numeri sono quelli di sempre
   (430/330/370 di potenza, 205 o 175 di quota); qui si aggiungono solo
   le tre conseguenze, che sono aritmetica e non scelte:
     volo    = 2·vz/560, perche' la gravita' di questo gioco e' 560;
     gittata = potenza·volo, perche' in volo il pallone non paga
               attrito (l'attrito di updateBall si paga solo a terra);
     picco   = vz²/(2·560) = vz²/1120, cioe' 37,5 unita' a quota 205 e
               27,3 a quota 175. */
function lobBalistica(q, pow){
  const vz = (q===1 ? 205 : 175);
  const volo = 2*vz/560;
  const potenza = (q===1?430:q===0?330:370)*pow;
  return { potenza:potenza, vz:vz, volo:volo, gittata:potenza*volo, picco:vz*vz/1120 };
}
function fireShot(p, nx, ny, q, lob){
  const t=p.team, pi=G.players.indexOf(p);`,
},

/* ------------------------------------------------------------------ */
{
  nome: '8/11 l\'arco del pallonetto, promesso mentre il dito tiene',
  cerca:
`      const f=miraTiroF(letturaTiroViva(t,p));
      const c=p.charge;
      const larg=(p.tecnica-62)/38*0.045;
      const finestra=(c>=SHOT_MIN-larg && c<=SHOT_MAX+larg);
      const mv=humanMove(t);
      const bg=bersaglioTiroMirato(p,finestra,f,mv[1]);
      const dx=bg[0]-p.x, dy=bg[1]-p.y, l=Math.max(1,len(dx,dy));
      const nx=dx/l, ny=dy/l;
      const seg=Math.abs(nx)>0.05 ? (bg[0]-b.x)/nx : l;
      if(seg>24) out.push({tipo:'linea-tiro', x0w:b.x, y0w:b.y,
                           x1w:b.x+nx*seg, y1w:b.y+ny*seg, dentro:finestra});`,
  metti:
`      const lt=letturaTiroViva(t,p);
      const f=miraTiroF(lt);
      const c=p.charge;
      const larg=(p.tecnica-62)/38*0.045;
      const finestra=(c>=SHOT_MIN-larg && c<=SHOT_MAX+larg);
      const mv=humanMove(t);
      /* ===============================================================
         IL PALLONETTO SI PROMETTE COME ARCO. Prima di questa riga un
         pallonetto in partenza aveva la promessa di un tiro raso: una
         retta fino al piano di porta, mentre il pallone stava per
         alzarsi. La promessa e l'esecuzione dicevano due cose diverse,
         ed e' esattamente cio' che L3.1 vieta. Il verbo si chiede alla
         STESSA funzione che lo decidera' al rilascio (verboTrascinato),
         la mira alla stessa (miraTiroF) e la forma alla stessa che la
         eseguira' (lobBalistica), con la stessa guardia metaOffensiva:
         non possono divergere.
         =============================================================== */
      const vtl=verboTrascinato('shot', lt);
      if(vtl && vtl.act==='pallonetto' && metaOffensiva(p)){
        const gX=t===0?FW:0;
        const ly=(f!==null ? (FH/2 + f*(GOAL_H/2-24)) : (FH/2 + mv[1]*260));
        const ldx=gX-p.x, ldy=ly-p.y, ll=Math.max(1,len(ldx,ldy));
        const bl=lobBalistica(finestra?1:(c<SHOT_MIN-larg?0:2),
                              (G.cpu[t] ? DIFF[G.diff].shotPow : 1)*fatt(p.tiro,0.10));
        const gi=Math.min(bl.gittata, ll);
        if(gi>24) out.push({tipo:'arco-tiro', x0w:b.x, y0w:b.y,
                            x1w:b.x+ldx/ll*gi, y1w:b.y+ldy/ll*gi,
                            picco:bl.picco*0.55, dentro:finestra});
      }else{
      const bg=bersaglioTiroMirato(p,finestra,f,mv[1]);
      const dx=bg[0]-p.x, dy=bg[1]-p.y, l=Math.max(1,len(dx,dy));
      const nx=dx/l, ny=dy/l;
      const seg=Math.abs(nx)>0.05 ? (bg[0]-b.x)/nx : l;
      if(seg>24) out.push({tipo:'linea-tiro', x0w:b.x, y0w:b.y,
                           x1w:b.x+nx*seg, y1w:b.y+ny*seg, dentro:finestra});
      }`,
},

/* ------------------------------------------------------------------ */
{
  nome: '9/11 l\'arco del passaggio alto, promesso mentre il dito tiene',
  cerca:
`          const sc = bersaglioL14(p, tr.ux, tr.uy, Math.min(1,tr.l/L14_SAT), -1);
          const q = sc && sc.scelto;
          /* le stesse chiavi degli altri due rami — x0w/y0w/x1w/y1w sono
             coordinate di MONDO, e disegnaLineaGuida disegna sotto la
             trasformazione della camera. La linea parte dal PALLONE, non
             dal piede: e' il pallone che si muovera'. Sempre rasoterra:
             la palla alta su questo disco non esiste piu' (vedi il
             cappello della toppa), e promettere un arco sarebbe
             promettere un calcio che non parte. */
          if(q) out.push({tipo:'linea-passaggio', x0w:b.x, y0w:b.y, x1w:q.x, y1w:q.y});`,
  metti:
`          const sc = bersaglioL14(p, tr.ux, tr.uy, Math.min(1,tr.l/L14_SAT), -1);
          const q = sc && sc.scelto;
          /* le stesse chiavi degli altri due rami — x0w/y0w/x1w/y1w sono
             coordinate di MONDO, e disegnaLineaGuida disegna sotto la
             trasformazione della camera. La linea parte dal PALLONE, non
             dal piede: e' il pallone che si muovera'.
             E ADESSO SOPRA TRASCINA_SU C'E' DAVVERO L'ARCO. Qui c'era
             scritto «sempre rasoterra: la palla alta su questo disco non
             esiste piu'», ed era la seconda meta' della stessa bugia — il
             commento venti righe piu' su prometteva gia' l'arco «sopra
             L14_SU», e L14_SU non esisteva in nessuna riga del file. Il
             verbo si chiede a verboTrascinato e il tempo di volo a
             voloL14, cioe' alle DUE STESSE funzioni che eseguiranno il
             calcio: promessa ed esecuzione non possono divergere. */
          if(q){
            const vt = verboTrascinato('through', tr);
            if(vt && vt.act==='passoAlto'){
              const dd = Math.max(1, len(q.x-b.x, q.y-b.y));
              const T = voloL14(vt.su, dd);
              out.push({tipo:'arco-passaggio', x0w:b.x, y0w:b.y, x1w:q.x, y1w:q.y,
                        picco:70*T*T*0.55});
            }
            else out.push({tipo:'linea-passaggio', x0w:b.x, y0w:b.y, x1w:q.x, y1w:q.y});
          }`,
},

/* ------------------------------------------------------------------ */
{
  nome: '10/11 il disegno sa che gli archi sono tre, non uno',
  cerca:
`      const arco=(s.tipo==='arco-cross');`,
  metti:
`      /* L'ARCO NON E' PIU' SOLO QUELLO DEL CROSS. La domanda giusta non
         e' «di che tipo sei» ma «hai un picco»: chi ha un picco vola, e
         chi vola si disegna curvo. Cosi' i due segni nuovi — l'arco del
         pallonetto e quello del passaggio alto — non hanno dovuto
         aggiungere un nome a questa riga, e il prossimo nemmeno.
         zoneInterfaccia gia' ragionava cosi' (:39251, «s.picco?»). */
      const arco=(s.picco>0);`,
},

/* ------------------------------------------------------------------ */
{
  nome: '11/11 il colore dei segni nuovi',
  cerca:
`      ctx.strokeStyle= arco ? COL.ciano : (s.tipo==='linea-tiro' ? (s.dentro?COL.ambra:COL.gesso) : COL.gesso);`,
  metti:
`      /* la tinta la decide il VERBO, non la forma: ambra e' il tiro
         dentro la finestra (in tutte e due le sue forme, retta e arco),
         ciano e' la palla che vola verso un compagno, gesso tutto il
         resto. Prima l'arco era ciano per definizione, e un pallonetto
         dentro la finestra avrebbe perso l'unico segno che dice
         «adesso» a chi tiene il disco. */
      ctx.strokeStyle= (s.tipo==='linea-tiro'||s.tipo==='arco-tiro')
        ? (s.dentro?COL.ambra:COL.gesso)
        : (arco ? COL.ciano : COL.gesso);`,
},

/* ---------------------------------------------------------------- 12 */
{
  /* =====================================================================
     E ANCHE IL CAPO DELL'ARCO, che la stesura di prima aveva dimenticato.

     L'ancoraggio 10 ha cambiato  const arco=(s.tipo==='arco-cross')  in
     const arco=(s.picco>0), perche' adesso l'arco lo fa anche il
     pallonetto. Ma dodici righe piu' sotto il BOLLO in fondo all'arco era
     rimasto  ctx.fillStyle=COL.ciano  senza condizioni: da quel momento
     il capo di un TIRO a scavalcare usciva ciano, cioe' del colore che
     l'ancoraggio 11 — scritto dalla stessa toppa — dichiara riservato
     alla «palla che vola verso un compagno».

     Un tiro che dice «compagno». Trovato da un critico avversario
     leggendo i pixel della tela vera, non il codice: e' la specie di
     difetto che nasce quando si cambia una condizione e si dimentica chi
     altro la legge. Qui il bollo prende la STESSA tinta della linea, per
     costruzione: `+`ctx.fillStyle=ctx.strokeStyle`+` non puo' divergere. */
  nome: '12/12 il capo dell\'arco prende la tinta del suo verbo',
  cerca: `      if(arco){ ctx.fillStyle=COL.ciano; ctx.beginPath(); ctx.arc(s.x1w,s.y1w,3.2,0,6.2832); ctx.fill(); }`,
  metti: `      if(arco){ ctx.fillStyle=ctx.strokeStyle; ctx.beginPath(); ctx.arc(s.x1w,s.y1w,3.2,0,6.2832); ctx.fill(); }`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-verbo-trascinato.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
if (dentro) { console.error('FALLITO: --dentro non e\' ammesso in questa casa. Usa --out fuori/<nome>.html'); process.exit(3); }
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.verbo.html';
outFile = path.resolve(RADICE, outFile);
if (outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}

/* i controlli DOPO la sostituzione: ogni riga qui e' una cosa che deve
   essere vera nel file uscito, non una che speriamo di aver fatto */
const attesi = [
  ['function verboTrascinato(act, tr){', 1],
  ['function voloL14(su, dist){', 1],
  ['function lobBalistica(q, pow){', 1],
  ['const TRASCINA_SU = 66;', 1],
  ['const L14_PIENO   = 88;', 1],
  /* i quattro consumatori del risolutore: i due esecutori e i due archi */
  ["verboTrascinato('through', tr)", 2],
  ["verboTrascinato('shot', lettura)", 1],
  ["verboTrascinato('shot', lt)", 1],
  /* la quota non e' piu' zero per decreto */
  ['b.vz=alto ? 280*T : 0;', 1],
  ['b.vz=0;                            // rasoterra', 0],
  ['if(alto) b.crossTo=bi;', 1],
  /* la levetta non decide piu' il pallonetto da sola */
  ["const chiedeLob = vt ? (vt.act==='pallonetto') : (((t===0 ? -mx : mx) > 0.5));", 1],
  ['if(((t===0 ? -mx : mx) > 0.5) && metaOffensiva(p)){', 0],
  /* la balistica in un posto solo */
  ['b.vz = q===1 ? 205 : 175;', 0],
  ['b.vz = bl.vz;', 1],
  /* i segni */
  ["tipo:'arco-tiro'", 1],
  ["tipo:'arco-passaggio'", 1],
  ['const arco=(s.picco>0);', 1],
  /* il bollo prende la tinta della linea, non il ciano fisso: un tiro a
     scavalcare dipinto col colore del passaggio direbbe «compagno» */
  ['if(arco){ ctx.fillStyle=ctx.strokeStyle;', 1],
  ['ctx.fillStyle=COL.ciano; ctx.beginPath(); ctx.arc(s.x1w', 0],
  ["const arco=(s.tipo==='arco-cross');", 0],
  /* le due bugie non ci sono piu' */
  ["La quota e' la famiglia balistica del cross di casa: vz fra 140 e 210", 0],
  ['Sempre rasoterra:', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => JSON.stringify(s) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati, ' + attesi.length + ' controlli dopo');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
