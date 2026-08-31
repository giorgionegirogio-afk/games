/* =====================================================================
   _t-mira.js — IL PUNTO MIRATO SMETTE DI ESSERE UN DISEGNO
   (27 ago 2026 — RI-ANCORATA E CORRETTA IL 28 ago 2026).

   IL DIFETTO, ed e' una bugia allo schermo. Nel duello dal dischetto il
   dito trascina un mirino continuo dentro lo specchio della porta; il
   pallone parte verso quel punto, la rete si gonfia in quel punto, il
   lampo dell'impatto scoppia in quel punto — drawDuelScene legge D.aimU
   e D.aimV in tre posti diversi. Ma chi decide l'esito, Duel.resolve,
   di quei due numeri non ne legge nemmeno uno: guarda s.zone (il terzo
   di porta, 0/1/2) e s.powerQ (la banda). L'ALTEZZA NON ESISTE, e dentro
   un terzo un punto vale l'altro.

   ---------------------------------------------------------------------
   LA CORREZIONE DEL 28 AGOSTO, e comincia da una bocciatura: il commento
   dell'ancoraggio sulla pickZone diceva che «la CPU passa di qui con
   audacia bassa e banda larga, cioe' esattamente la banda che aveva
   ieri». ERA FALSO, e la prima misura che l'ha toccato l'ha smentito.
   Senza dito pickZone scrive aimU = z-1 e aimV = 0,50, e su quel punto
     pkAudacia(±1, 0,50) = 0,7178      pkAudacia(0, 0,50) = 0,2480
   cioe' sette decimi della scala, contro il 2,5 decimi del centro comodo
   e l'1,0 dell'incrocio: non «audacia bassa», ma quasi tre quarti del
   prezzo dell'angolo, pagato per un tiro che nessuno ha scelto. Dietro il commento c'era una CURA NON DICHIARATA sul
   tiratore da tastiera — e la tastiera non e' un dettaglio: A/S/D e le
   frecce sono l'unico modo di tirare un rigore per chi gioca al
   computer, e il suggerimento del duello le offre alla pari col dito
   («P1: A / S / D oppure trascina sulla porta»). Chi tira di tasto NON
   PUO' SCRIVERE aimU/aimV in nessun modo: pagava due volte — banda
   stretta e portiere piu' coperto — il prezzo di una scelta che non gli
   e' data.
   Il conto della tassa, misurato dalla revisione avversaria sulla prima
   stesura di questa toppa (12.000 risoluzioni per casella, portiere sui
   tre terzi, difficolta' Normale):
                                 SPEDITO   PRIMA STESURA
     larghezza della banda        0,2000   0,1246 / 0,1740 / 0,1246
     terzo laterale, powerQ 1    91,4/91,1  88,0/88,0   (-3,3)
     terzo centrale, powerQ 1      91,6     81,8        (-9,8)
     terzo laterale, powerQ 0,6  82,7/83,0  70,1/69,9  (-12,8)
     terzo centrale, powerQ 0,6    82,6     67,7       (-14,9)

   LA CURA DELLA CURA, in una riga di principio: LA GEOMETRIA DELLA MIRA
   VALE DOVE C'E' UNA MIRA. pickZone segna se il punto gliel'ha dato
   qualcuno (`this.mirato = (u!=null)`), e senza mira il duello e' quello
   di ieri ALLA CIFRA — banda 0,20, pAlta 0,60, riflesso D.save nudo.
   Verificato in due modi indipendenti:
     · la prova 5 della sonda (aggiunta apposta, vedi sotto) stampa le
       stesse dodici percentuali sul gioco spedito e sulla copia, cifra
       per cifra, e la stessa banda 0,20000;
     · _eventi.js su cento partite a 11 stampa un file identico riga per
       riga — trenta voci, quattro colonne ciascuna, su due blocchi di
       semi indipendenti — perche' in campo il rigore lo tira sempre la
       CPU, che non mira.

   Perche' NON la mezza cura che la revisione proponeva (azzerare
   l'audacia solo per la banda e lasciare il resto): perche' spezzerebbe
   in due il patto su cui questa toppa e' costruita — una scrittura, tre
   letture. La banda direbbe «rischio zero» mentre pkArrivo e pAlta
   continuerebbero a far pagare 0,7178: il cartello tornerebbe a mentire,
   solo dall'altra parte. O il punto e' una mira e allora conta tutto, o
   non lo e' e allora non conta niente.

   E' UNA PERDITA, e va scritta: la prima stesura diceva «chi non mira
   segna meno di chi mira» e lo pagava la CPU (duello CPU giocato per
   intero, 91,2% di gol contro 85,2%). Adesso la CPU torna a 91,2 esatti.
   La frase resta vera, ma girata: adesso e' un PREMIO PER CHI MIRA, non
   una tassa per chi non puo'. Misurato sulla stessa corsa della sonda,
   difficolta' Normale, portiere sui tre terzi:
     incrocio col dito (u ±1,2 v 0,24), banda perfetta   95,8 / 95,6 %
     centro del terzo col tasto (u ±1 v 0,50)            91,3 / 91,8 %
     centro comodo col dito (u 0,25 v 0,60)                   85,8 %
   Quattro punti e mezzo di premio per chi sceglie l'angolo (95,8 contro
   91,3), e per incassarli deve fermare un cursore che corre a 1,15 al
   secondo dentro una banda larga 0,095 invece di 0,20 — 83 millesimi
   invece di 174, cinque fotogrammi invece di nove. E cinque punti e
   mezzo di malus per chi mira male (85,8 contro 91,2): il dito puo' fare peggio del tasto, ed e' giusto, perche'
   il dito ha scelto. Il tasto sta esattamente in mezzo, dove stava ieri.

   ---------------------------------------------------------------------
   LA MISURA, PRIMA E DOPO, e sono la stessa corsa dello stesso strumento
   sui due file:
     node strumenti/_sonda-mira.js --prove 3000 --duelli 900 --stati 300
     node strumenti/_sonda-mira.js --prove 3000 --duelli 900 --stati 300 --gioco fuori/mira2.html
   Griglia di 6 ascisse x 4 altezze x 4 qualita' di banda, 9000
   risoluzioni per casella, portiere che sceglie i tre terzi in parti
   uguali. La soglia del rumore, che lo strumento stampa da solo, e' 1,1
   punti (sigma binomiale al 90% su 9000 prove, per radice di 2 perche'
   e' una differenza fra due caselle, per 2,5 perche' il massimo su una
   ventina di confronti sale).

                                          PRIMA     DOPO
     dislivello in ALTEZZA                 1,4      28,7   punti
       di cui a banda perfetta             0,9       8,2   punti
     dislivello DENTRO IL TERZO            1,4      12,0   punti
       di cui a banda perfetta             0,7       3,9   punti
     soglia del rumore                     1,1       1,1   punti
     conversione a banda perfetta         91,2      90,7   %
     conversione media della griglia      72,4      64,6   %
     duello CPU giocato per intero (900):
       gol                                91,2      91,2   %
       parata                              8,1       8,1   %
       fuori                               0,7       0,7   %
       banda perfetta                     97,8      97,8   %
     TIRATORE SENZA MIRA (prova 5: tastiera e CPU, gol %)
       terzo 0   banda / pQ 1 / 0,6 / 0,3 / 0,05
                 0,20000 91,3 82,6 82,3 32,6  ->  identico
       terzo 1   0,20000 91,2 82,9 83,0 31,8  ->  identico
       terzo 2   0,20000 91,8 82,9 82,2 33,5  ->  identico
     filtrante: DISACCORDI sull'ordine   201/3284    0/3574
     filtrante: coni vuoti                726(30,7%) 581(24,5%)
     filtrante: microsecondi a chiamata  5,8-9,8   5,2-8,4
                                        (sette corse prima, otto dopo: le
                                         due forcelle si sovrappongono, e
                                         quella di dopo sta piu' in basso.
                                         Cioe' invariato, o appena meglio)

   PRIMA i due dislivelli SONO il rumore: 1,4 punti contro una soglia di
   1,1, su 72 gruppi di confronto. Cioe' zero segnale. Il mirino era una
   scorciatoia grafica per tre bottoni, e adesso non lo e' piu' — 28,7
   punti sono venticinque volte il rumore.
   La conversione a banda perfetta non si muove (91,2 contro 90,7, e
   sono i numeri su cui i tre coefficienti del portiere sono stati
   TARATI apposta): questa cura sposta DOVE stanno i gol, non quanti.
   La conversione media della griglia scende perche' scende quella dei
   rigori CALCIATI MALE, ed e' il punto: prima un rigore fuori tempo
   valeva il 72% comunque, adesso vale quello che merita.
   LA PROVA 5 E' LA RIGA CHE LA REVISIONE CHIEDEVA e che nella prima
   stesura non esisteva: e' l'unica che parla del tiratore che non puo'
   mirare, e adesso e' una fila di zeri di differenza.

   IL GIOCO IN CAMPO NON SI MUOVE, ed era un requisito, non una
   speranza. Cento partite a 11 contro 11, tempo regolamentare (180 s a
   11 dal 26 agosto), semi 20260803..20260902:
     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803 [--gioco fuori/mira2.html]
                             PRIMA    DOPO
     tiri (mediana/media)   21,0/23,3  21,0/23,3
     precisione VERA %          7/8        7/8
     gol nei 90 s            1,00/1,43  1,00/1,43
     partite 0-0 nei 90 s        22%       22%
     partite decise ai rigori    25%       25%
     parate                   2,0/1,8    2,0/1,8
   TUTTE E TRENTA LE VOCI IDENTICHE, e tutte e quattro le colonne di
   ognuna — non «trentacinque su trentotto» come diceva la prima
   stesura: i due file di uscita di _eventi differiscono solo nella riga
   che dice quale file e' stato aperto e in quella dei secondi di
   orologio. Ripetuto su un secondo blocco di semi indipendente
   (--seme 20260915): stesso esito, stesso diff di due righe.
   Il duello in campo lo gioca la CPU, che non mira, e da oggi il suo
   rigore e' quello di ieri al bit.
   (Nota: questi numeri NON sono quelli della prima stesura del 27
   agosto — 13,0/15,1 tiri, 1,00/1,24 gol. In mezzo sono entrate cinque
   toppe, fra cui il cronometro che scala col campo e il portiere a
   quattro esiti. Il confronto che conta e' PRIMA contro DOPO sullo
   stesso giorno, ed e' quello qui sopra.)

   I CANCELLI, sulla copia (28 agosto 2026):
     node strumenti/collaudo.js --gioco fuori/mira2.html   36 su 36
     node strumenti/_q-meta.js --tre-taglie --gioco fuori/mira2.html   82 su 82
   (11 contro 11: 0-0 al 30%, soglia 33%. Passano anche i quattro
    controlli che il collaudo fa proprio sul rigore, compreso «nel duello
    non e' rimasto nessun bottone».)

   E LA PROVA DEL GESTO, che nessun banco fa: pointerdown/pointerup veri
   sull'elemento #duel e Duel.key('KeyA'/'KeyS'/'KeyD') sulla stessa
   pagina, piu' quattro fotogrammi disegnati davvero con il mirino
   acceso (dito che mira, mira presa, terzo preso col tasto, pallone in
   volo). Esito: col dito mirato=true e la banda passa da 0,20000 a
   0,09500 sull'incrocio e a 0,13047 sul centro comodo; col tasto
   mirato=false e la banda resta 0,20000 in tutti e tre i terzi; nessuna
   eccezione in nessuno dei quattro disegni.

   ---------------------------------------------------------------------
   LA CURA, e non e' un rifacimento: sono quattro funzioni pure, senza
   un sorteggio dentro, e la struttura dei rami di resolve() resta quella
   di ieri RIGA PER RIGA.

   1. L'AUDACIA di una mira (pkAudacia) — quanto il punto e' vicino al
      palo e quanto e' alto. Zero al centro comodo, uno all'incrocio.
      La scrive una funzione sola e la leggono in tre: la larghezza
      della banda, la deformazione del tiro sbagliato e il colore del
      mirino. Una scrittura, tre letture — il patto della tacca.

   2. LA BANDA SI STRINGE DOVE LA PORTA E' PICCOLA. La banda dolce della
      potenza era larga 0,20 sempre; adesso e' 0,20 al centro comodo e
      0,095 sull'incrocio PER CHI MIRA. Il rischio si DICHIARA prima di
      correre: appena il dito lascia il mirino, chi ha mirato all'angolo
      vede comparire una banda dimezzata. Il sorteggio della POSIZIONE
      della banda resta dov'era, in start(), e resta uno solo.

   3. IL RIGORE CALCIATO MALE NON VA A CASO: si accentra e torna verso
      l'altezza comoda del portiere (pkArrivo). E' il rigore che il
      portiere si trova addosso, ed e' deterministico — a stessa mira e
      stessa banda, stesso punto d'arrivo. La deformazione cresce con
      l'audacia: chi tenta l'incrocio e sbaglia il tempo paga piu' di
      chi tenta il centro e sbaglia il tempo.

   4. IL PORTIERE NON E' UN DISCO SUL CENTRO DEL TERZO: e' il TRATTO che
      percorre dal centro della porta al terzo scelto (pkDistanza). Un
      portiere che vola a destra spazza tutto quello che gli sta sulla
      strada e lascia vuoto quello che ha alle spalle — ed e' per questo
      che il terzo sbagliato resta gol, come ieri. La misura pesa
      l'altezza quasi il doppio della larghezza: di lato un portiere si
      allunga, in alto no.

   5. E TUTTE E QUATTRO VALGONO SOLO DOVE C'E' UNA MIRA (correzione del
      28 agosto). `Duel.mirato` e' vero soltanto quando pickZone ha
      ricevuto un punto, cioe' solo dal rilascio del dito. Senza mira
      resolve() prende i numeri di ieri — pAlta 0,60 e riflesso D.save
      nudo — e la banda resta quella che start() ha gia' posato a 0,20.
      Non e' un ramo in piu' nel percorso dei dadi: sono tre ternari che
      scelgono un NUMERO, e le due condizioni che cancellano un
      sorteggio non le tocca nessuno.

   IL CONTO DEI dado() NON CAMBIA DI UNO, e ci tengo perche' il duello e'
   dentro il banco a seme fisso: _eventi.js dice che il 25% delle partite
   a 11 si decide ai rigori (misura del 28 agosto su 100 partite; il 27
   agosto erano il 23%). Le due condizioni che cancellano un
   sorteggio — `s.powerQ<0.25 &&` e `else if(s.keeperZone===s.zone)` —
   sono INTATTE, parola per parola. Cambiano solo i due numeri con cui il
   dado si confronta, e per la CPU non cambiano nemmeno quelli.
   (Nota di ri-ancoraggio: dal 27 agosto tutto il caso del gioco passa da
   dado(); dentro il Duel non esiste piu' un Math.random. Il controllo in
   fondo a questo file conta dado() e rnd(, non Math.random, e conta
   anche i Math.random per accertarsi che restino zero.)

   ---------------------------------------------------------------------
   IL SECONDO DIFETTO, piccolo e vero: scegliFiltrante aggiornava
   `bestDot` SOLO dentro il ramo accettato, quindi dopo un sorpasso «a
   parita' di dot vince lo smarcato» il confronto successivo avveniva
   contro un bestDot che non apparteneva piu' a `best`. Il ricevente
   dipendeva dall'ORDINE dell'array dei giocatori. Il file lo sapeva gia'
   (uomoVersoDirezione lo cita come «un difetto vero»), non l'aveva mai
   misurato.

   MISURATO OGGI (_sonda-mira.js, prova 4, 300 stati di gioco, 8
   direzioni per stato, elenco dei giocatori ruotato di 5 e poi
   rovesciato — stesso campo, stessi uomini, solo un altro ordine
   nell'array):
     confronti 3284 · DISACCORDI 201 (6,1%) · coni vuoti 726 (30,7%
     delle chiamate: quasi una mira su tre moriva) · 5,8-9,8 microsecondi.
   Dopo: 3574 confronti, ZERO disaccordi, 581 coni vuoti (24,5%),
   5,2-8,4 microsecondi.

   La cura sono DUE MASSIMI invece di tre confronti concatenati: il
   coseno migliore su tutti, poi lo smarcato migliore fra i pari merito
   (entro 0,08 dal migliore — la finestra di sempre, non un numero
   nuovo). Un massimo non dipende dall'ordine, e due massimi non possono
   contraddirsi. E' anche, parola per parola, quello che il commento di
   doFiltrante prometteva gia' ieri e che il codice non faceva.
   La stessa passata allarga il cono da 0,5 a 0,35 di coseno (da 60 a 70
   gradi): il cono non serve piu' a scegliere — a quello pensano i due
   massimi — serve solo a decidere quando il dito non ha indicato
   nessuno e la filtrante si ripiega sul passaggio normale.
   E ROMPE I PAREGGI CON L'ALLINEAMENTO, non con l'indice, perche' senza
   quella riga meta' del difetto resta: smarcato satura a 220 per
   avversario e produce pareggi ESATTI. Misurato: con le sole due
   passate i disaccordi restavano 112 su 2740 (misura del 27 agosto,
   non rifatta oggi: quello che ho rimisurato e' il risultato CON la
   riga, cioe' zero disaccordi su 3574 confronti).

   ---------------------------------------------------------------------
   IL COSTO A FOTOGRAMMA. resolve() gira una volta per rigore: le quattro
   funzioni nuove sono in tutto due radici quadrate e una ventina di
   moltiplicazioni, cioe' meno di un microsecondo una volta ogni novanta
   secondi. pkAudacia entra anche nel disegno del mirino, ma solo nella
   scena del duello e solo quando una mira c'e' o si sta facendo (senza
   mira il colore non la chiama nemmeno): una radice quadrata a
   fotogramma su una scena che non disegna nemmeno il campo.
   scegliFiltrante gira invece a ogni fotogramma dentro segniGuida mentre
   il dito tiene il passaggio, ed e' l'unico punto di questa toppa dove
   il costo ha DECISO LA FORMA DEL CODICE. Tre stesure, tutte corrette,
   tutte misurate con la prova 4 della sonda (300 stati, otto direzioni).
   LE DUE BOCCIATE SONO STATE MISURATE IL 27 AGOSTO, sul gioco di allora,
   e non le ho rimisurate oggi: valgono come ordine di grandezza e come
   avviso, non come cifre di oggi. La C e' misurata oggi, contro i
   5,8-9,8 microsecondi a chiamata del gioco spedito:
     A. punteggio unico `dot*1750 + smarcato`             15,5   BOCCIATA
        (chiama smarcato per ogni candidato del cono)      (27 ago)
     B. tre passate, la terza chiama smarcato per tutti
        i pari merito                                      7,1-9,0  BOCCIATA
                                                           (27 ago)
     C. due passate, e il PRIMO pari merito si tiene da
        parte senza valutarlo: smarcato si chiama solo
        se ce n'e' un secondo con cui confrontarlo         5,2-8,4  CONSEGNATA
   La C e' quella scritta qui sotto. Il salto fra la B e la C e' tutto
   in una riga: nella stragrande maggioranza delle chiamate il pari
   merito e' uno solo, e smarcato — che scorre tutti gli avversari con
   una radice e una proiezione ciascuno — non serve proprio.

   ---------------------------------------------------------------------
   BOCCIATE, coi numeri, perche' nessuno le riprovi.

   · «AZZERARE L'AUDACIA SOLO PER LA BANDA e lasciare pkArrivo e pAlta a
     leggere i ±1 / 0,50 della tastiera» (la mezza cura proposta dalla
     revisione del 28 agosto). Riporta la banda a 0,20 e non tocca
     niente altro. MISURATA SUL GIOCO DI OGGI, non ereditata: stesso
     punto imposto dalla tastiera, resolve chiamata con la geometria
     accesa e spenta, 12.000 risoluzioni per casella, portiere sui tre
     terzi (difficolta' Normale).
        terzo             0      1      2
        pQ 1   spenta   91,4   91,6   91,1   <- quello che consegno
               accesa   88,0   81,2   87,9   <- la mezza cura
        pQ 0,6 spenta   82,7   82,6   83,0
               accesa   70,2   67,7   69,9
     Cioe' la banda tornerebbe a posto e la parte piu' grossa della
     tassa — fino a dieci punti sul terzo centrale a banda perfetta e
     quindici a banda mediocre — resterebbe in piedi e invisibile. E in
     piu' il mirino direbbe «rischio zero» mentre il pallone si
     accentra come se il rischio ci fosse: una bugia in meno e una in
     piu'. Bocciata.
     (Sono, alla cifra, i numeri che la revisione avversaria aveva
      misurato sulla prima stesura — 88,0 / 81,8 / 70,1 / 67,7 — e li
      ho riprodotti sul gioco di oggi invece di ereditarli.)

   · «DARE UNA MIRA ANCHE ALLA TASTIERA» (su/giu' che scrivono aimV,
     sinistra/destra che scrivono aimU a passi). E' la strada giusta se
     un giorno la si vuole percorrere, ed e' bocciata QUI solo per
     dimensione: i quattro tasti direzionali di ogni giocatore sono gia'
     tutti consumati da zoneFromKeys (lf→0, dn|up→1, rt→2) e liberarli
     vuol dire una fase nuova nel duello, un suggerimento nuovo, e il
     controllo del collaudo «nel duello non e' rimasto nessun bottone»
     da rifare. Non e' una toppa da dieci ancoraggi: e' un tema. Nel
     frattempo la tastiera non paga niente, che e' il minimo dovuto.

   · «FAR DECIDERE L'ESITO A UNA GEOMETRIA PIENA, senza il cancello del
     terzo» (cioe' sostituire `else if(s.keeperZone===s.zone)` con una
     condizione di distanza). Bocciata NON dalla misura ma dalla regola
     3 della casa: il ramo `else esito='gol'` oggi non pesca nessun
     dado, e una condizione geometrica lo farebbe pescare in stati in
     cui prima non pescava. Il duello sta dentro il banco a seme fisso e
     i confronti appaiati diventerebbero bugie. Il prezzo che paghiamo
     e' dichiarato: chi mira al centro e trova il portiere tuffato di
     lato segna sempre, anche se il portiere gli e' passato davanti.

   · «ABBASSARE LA CONVERSIONE DEI RIGORI verso il 76% del calcio vero»
     (alzando il primo coefficiente di pkCopertura, quello che qui
     chiamo A). Provata sul conto analitico prima di scrivere una riga
     di codice: A=2,0 porta la conversione a banda perfetta a 93,3%,
     A=2,4 a 91,0%, A=2,6 a 89,7%. Per arrivare al 76% non basta
     spostare A — servirebbe che il portiere parasse anche quando
     indovina il terzo sbagliato, cioe' proprio la bocciatura qui
     sopra. Fermato di proposito ad A=2,40, che sulla griglia misurata
     da' 90,7% contro i 91,2% del gioco spedito: QUESTA CURA SPOSTA DOVE
     STANNO I GOL, NON QUANTI. Chi vorra' cambiare quanti lo fara' con
     la sua misura e la sua toppa.

   · «MIRA DELLA CPU RICAVATA DALLA PARTE FRAZIONARIA DELLO STESSO
     DADO». Vale 1,1 punti di conversione (0,865 senza, 0,876 con, conto
     analitico su difficolta' Normale, D.save 0,52). Un anello in piu'
     nel percorso dei dadi per un punto di conversione: bocciata. E dopo
     la correzione del 28 agosto sarebbe anche peggio che inutile,
     perche' darebbe alla CPU una mira vera e quindi un prezzo vero.

   ---------------------------------------------------------------------
   IL REGISTRO DEI FATTI (arriva in parallelo, non me lo costruisco qui):
   resolve() e' il posto naturale per il fatto
     {quando, che cosa:'rigore', chi:s.shooter, esito:s.outcome,
      conMira:s.mirato, puntato:{u,v}, arrivato:{u:A.u, v:A.v},
      banda:s.powerQ, terzoPortiere:s.keeperZone}
   ed e' l'unico posto del gioco che sappia dire di quanto il pallone si
   e' allontanato da dove era stato mirato. `conMira` non e' un di piu':
   senza quel campo un rigore di tastiera e uno col dito al centro del
   terzo si leggono uguali nel registro, e non lo sono.
   (La chiave si chiama `puntato` e non `mirato` apposta: `mirato` e' gia'
   il nome del campo booleano del Duel, e due cose diverse con lo stesso
   nome sono il modo piu' rapido per farsi male.) Il collegamento si fara' dopo:
   qui c'e' solo il commento, cosi' non ci pestiamo i piedi.

   ---------------------------------------------------------------------
   Misura:  node strumenti/_sonda-mira.js --gioco fuori/mira2.html
   Banco:   node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803 --gioco fuori/mira2.html
   Cancelli: node strumenti/_q-meta.js --tre-taglie --gioco fuori/mira2.html

   uso:  node strumenti/_t-mira.js --out fuori/mira2.html
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

/* 1 — LA GEOMETRIA DEL DISCHETTO: quattro funzioni pure, zero sorteggi.
       Nascono attaccate al Duel perche' non servono a nient'altro. */
{
  nome: '1/10 le quattro funzioni della mira, prima del Duel',
  cerca:
`/* =====================================================================
   PUNIZIONE-DUELLO — overlay minigame (il momento Football-Strike)
   ===================================================================== */
const Duel = {`,
  metti:
`/* =====================================================================
   LA GEOMETRIA DEL DISCHETTO (27 agosto 2026) — quattro funzioni PURE,
   nessun sorteggio dentro, ed e' l'unico posto del gioco in cui sta
   scritto che cosa significa MIRARE.

   IL SISTEMA DI COORDINATE non e' nuovo: e' quello che duelMira gia'
   scrive dentro D.aimU e D.aimV, e che il disegno gia' legge in tre
   posti (il volo del pallone, la tasca della rete, il lampo).
     u   scarto orizzontale in unita' di «terzo». duelMira lo calcola
         come (mx-VW/2)/(GW*0,31), quindi IL PALO cade a 0,5/0,31 =
         1,6129 e il MIRINO non passa 0,39/0,31 = 1,2581, perche' il
         cerchio deve restare dentro lo specchio.
     v   altezza: 0 la traversa, 1 la linea di porta. Il mirino vive
         fra 0,21 e 0,80, per la stessa ragione.

   PERCHE' ESISTONO. Fino a ieri Duel.resolve non leggeva ne' u ne' v:
   guardava il terzo di porta e la banda. Il mirino continuo era una
   scorciatoia grafica per tre bottoni, e lo diceva la misura — 1,4 punti
   di dislivello in altezza e 1,4 dentro il terzo su una griglia di 96
   caselle da 9000 prove, contro una soglia di rumore di 1,1 punti, cioe'
   campionamento e nient'altro (strumenti/_sonda-mira.js sul gioco
   spedito).

   DOVE NON VALGONO, ed e' la correzione del 28 agosto: valgono solo
   quando una mira c'e' stata davvero (Duel.mirato). Chi tira col tasto
   A/S/D non puo' scrivere aimU/aimV in nessun modo, e far pagare a lui
   l'audacia del centro del terzo — 0,7178, piu' di quasi tutto quello
   che un dito si sceglie apposta — era una tassa su una scelta che non
   gli e' data. Vedi la testata di strumenti/_t-mira.js.
   ===================================================================== */
const PK_PALO = 1/0.62;      // 1,6129 — il palo, in unita' di aimU
const PK_ORLO = 0.39/0.31;   // 1,2581 — il bordo esterno del mirino
const PK_VPOR = 0.56;        // l'altezza comoda del portiere, in unita' di aimV
/* L'AUDACIA DI UNA MIRA, fra 0 (centro comodo) e 1 (incrocio).
   Due componenti e nient'altro, perche' due sono le sole ragioni per cui
   un rigore si puo' sbagliare: quanto e' vicino al palo e quanto e' alto.
   L'altezza si conta dal 0,62 in giu' — appena sotto il petto del
   portiere — cosi' il rasoterra non e' «audace» per il fatto di essere
   lontano dal centro geometrico, che sarebbe falso.
   Il 1,18 al denominatore fa una cosa sola e dichiarata: l'incrocio
   (radice di 2 sui due assi) arriva a 1 e si ferma li', mentre un solo
   asse portato al limite vale 0,85. Un angolo e' piu' audace di un
   bordo, ma non il doppio.
   UNA SCRITTURA, TRE LETTURE: la larghezza della banda (posaBanda), la
   deformazione del tiro sbagliato (pkArrivo) e il colore del mirino
   (drawDuelScene) leggono questo numero e mai un altro, cosi' quello che
   si vede e quello che succede non possono divergere. E tutte e tre
   leggono ZERO quando la mira non c'e': o il punto e' una mira e allora
   conta dappertutto, o non lo e' e allora non conta da nessuna parte. */
function pkAudacia(u,v){
  const lat=Math.abs(u)/PK_ORLO;
  const alt=Math.max(0,(0.62-v)/0.41);
  return clamp(Math.sqrt(lat*lat+alt*alt)/1.18, 0, 1);
}
/* DOVE ARRIVA DAVVERO IL PALLONE. Il rigore calciato fuori tempo non va
   a caso: si ACCENTRA e torna verso l'altezza comoda del portiere. E' il
   rigore che il portiere si trova addosso, ed e' quello che si vede in
   campo. Deterministico: a stessa mira e stessa banda, stesso punto —
   e' la parte della cura in cui la bravura del pollice conta e il dado
   non entra.
   La deformazione cresce con l'AUDACIA (0,45 al centro, 1,50
   all'incrocio): chi tenta l'angolo e sbaglia il tempo paga piu' di chi
   tenta il centro e sbaglia il tempo, che e' l'unica cosa che impedisce
   all'angolo di essere sempre la scelta giusta. */
function pkArrivo(u,v,pq){
  const s=clamp((1-pq)*(0.45+1.05*pkAudacia(u,v)),0,1);
  return { u: u*(1-0.70*s), v: v+(PK_VPOR-v)*0.85*s };
}
/* QUANTO IL PUNTO E' LONTANO DALLE MANI DEL PORTIERE.
   Il tuffo NON e' un disco piantato sul centro del terzo: e' il TRATTO
   che il portiere percorre dal centro della porta fino al terzo che ha
   scelto. Un portiere che vola a destra spazza tutto quello che gli sta
   sulla strada e lascia vuoto quello che ha alle spalle — ed e' anche il
   motivo per cui il terzo sbagliato resta gol, come e' sempre stato.
   Il centro del terzo esterno sta a (0,5+1,6129)/2 = 1,056.
   I due pesi non sono uguali: 0,85 di lato contro 1,60 in verticale.
   Un decimo di quel rapporto e' geometria dello schermo (una unita' di u
   vale 0,91 unita' di v, perche' GW = 2,95 GH e u si misura su 0,31 GW),
   il resto e' anatomia: di lato un portiere si allunga, in alto no. */
function pkDistanza(hu,hv,kz){
  const uk=(kz-1)*1.06;
  const t=uk!==0 ? clamp(hu/uk,0,1) : 0;
  return len((hu-uk*t)*0.85, (hv-PK_VPOR)*1.60);
}
/* QUANTO IL PORTIERE COPRE quel punto, in multipli del suo riflesso di
   base (D.save, o 0,95 se e' una persona). Sopra 1 e' il petto, sotto
   0,2 e' roba che si guarda passare.
   Il secondo fattore e' il prezzo della LARGHEZZA e vale a prescindere
   dalla geometria del tuffo: piu' il pallone passa lontano dal centro
   della porta, meno il portiere ci arriva davvero, perche' li' e' gia'
   a fine corsa e a braccia tese.
   I TRE NUMERI (2,40 il petto, 2,90 la caduta, 0,55 il prezzo della
   larghezza) sono TARATI, non scelti: tengono la conversione a banda
   perfetta sulla griglia di _sonda-mira a 90,7%, contro i 91,2% misurati
   sul gioco spedito. Questa cura sposta DOVE stanno i gol, non quanti.
   Provati e scartati: 2,00 porta la conversione a 93,3%, 2,60 la porta a
   89,7% — tutti e due spostano il gioco senza che nessuno l'abbia
   chiesto. */
function pkCopertura(hu,hv,kz){
  return clamp((2.40 - pkDistanza(hu,hv,kz)*2.90) *
               (1 - 0.55*Math.min(1,Math.abs(hu)/PK_PALO)), 0.08, 2.40);
}

/* =====================================================================
   PUNIZIONE-DUELLO — overlay minigame (il momento Football-Strike)
   ===================================================================== */
const Duel = {`,
},

/* 2 — il campo che divide il mondo in due: c'e' stata una mira, o c'e'
       stato solo un tasto? */
{
  nome: '2/10 il campo `mirato`, dichiarato accanto ad aimU/aimV',
  cerca: `  aimU:0, aimV:0.50, dito:-1, mira:false,`,
  metti:
`  aimU:0, aimV:0.50, dito:-1, mira:false,
  /* MIRATO — vero solo quando il punto gliel'ha dato QUALCUNO, cioe' solo
     quando il dito ha rilasciato dentro lo specchio e pickZone ha
     ricevuto u e v. Falso per la CPU e falso per chi tira col tasto
     (A/S/D o le frecce), che un punto non lo puo' scrivere in nessun
     modo: per loro pickZone inventa il centro del terzo, e un punto
     inventato non e' una mira.
     Lo leggono in tre — la larghezza della banda, la risoluzione e il
     colore del mirino — ed e' il campo che tiene la geometria della mira
     confinata dentro la mira. Senza di lui il rigore da tastiera pagava
     un'audacia di 0,7178 (il centro del terzo laterale) senza che nessuno
     l'avesse scelta. Misurato sul gioco di oggi, 12.000 risoluzioni per
     casella, portiere sui tre terzi, banda perfetta: 91,4 / 91,6 / 91,1
     per cento di gol con questo campo, 88,0 / 81,2 / 87,9 senza. A banda
     0,6: 82,7 / 82,6 / 83,0 contro 70,2 / 67,7 / 69,9. Non lo legge la simulazione in
     campo, non entra in nessun salvataggio. */
  mirato:false,`,
},

/* 3 — la banda nasce da UNA funzione, non da due copie: la posizione la
       pesca start() (un solo rnd, come ieri), la LARGHEZZA la decide
       l'audacia della mira quando la mira c'e'. */
{
  nome: '3/10 la banda si stringe dove la porta e\' piccola',
  cerca:
`    /* banda dolce in posizione casuale */
    const w=0.2, c=rnd(0.35,0.85);
    this.band0=clamp(c-w/2,0.05,0.95-w); this.band1=this.band0+w;
    this.cursor=0; this.dir=1;
    this.phase='zone'; this.cpuT=rnd(0.5,1.1); this.poseT=0;
    this.aimU=0; this.aimV=0.50; this.dito=-1; this.mira=false;`,
  metti:
`    /* banda dolce in posizione casuale. IL SORTEGGIO E' UNO SOLO E STA
       ANCORA QUI: si pesca il CENTRO della banda, che non dipende dalla
       mira perche' la mira ancora non c'e'. La larghezza la decide dopo
       posaBanda, quando il dito ha lasciato il mirino — e se il dito non
       c'e' resta questa, 0,20 esatti, cioe' quella di ieri. */
    this.bandC=rnd(0.35,0.85);
    this.posaBanda(0);
    this.cursor=0; this.dir=1;
    this.phase='zone'; this.cpuT=rnd(0.5,1.1); this.poseT=0;
    this.aimU=0; this.aimV=0.50; this.dito=-1; this.mira=false; this.mirato=false;`,
},

/* 4 — la funzione che scrive la banda: una scrittura, due chiamate */
{
  nome: '4/10 posaBanda, l\'unica che scrive band0/band1',
  cerca: `  nomeT(t){ return t===0?G.teamName:G.oppName; },`,
  metti:
`  /* LA LARGHEZZA DELLA BANDA E' IL PREZZO DELL'AUDACIA, e si dichiara
     PRIMA di correre: appena il dito lascia il mirino sull'incrocio,
     chi ha mirato li' vede comparire una banda dimezzata. Era 0,20
     sempre; adesso e' 0,20 al centro comodo e 0,095 all'incrocio.
     0,095 non e' una crudelta': il cursore fa 1,15 di corsa al secondo,
     quindi la banda stretta dura 83 millesimi — cinque fotogrammi a
     sessanta al secondo — contro i 174 della larga.
     E' l'unico posto che scrive band0 e band1: la posa iniziale
     (audacia 0, perche' la mira non c'e' ancora) e la posa vera dopo
     pickZone passano tutte e due di qui, quindi non possono divergere.
     CHI NON MIRA NON LA VEDE MAI STRINGERSI: pickZone la richiama solo
     se this.mirato, e quindi per la CPU e per la tastiera resta la posa
     iniziale, 0,20 esatti. */
  posaBanda(aud){
    const w=0.20-0.105*clamp(aud,0,1);
    this.band0=clamp(this.bandC-w/2,0.05,0.95-w); this.band1=this.band0+w;
  },
  nomeT(t){ return t===0?G.teamName:G.oppName; },`,
},

/* 5 — pickZone: qui si decide se c'e' stata una mira, e solo in quel
       caso si posa la banda che quella mira merita */
{
  nome: '5/10 pickZone segna la mira e posa la banda solo se c\'e\'',
  cerca:
`    this.aimU = (u==null) ? (z-1) : u;
    this.aimV = (v==null) ? 0.50 : v;
    this.dito=-1; this.mira=false;
    Audio5.beep(520);
    this.phase='power'; this.poseT=0;
    this.cursor=0; this.dir=1;
    ui.powerBand.style.left=(this.band0*100)+'%';`,
  metti:
`    this.aimU = (u==null) ? (z-1) : u;
    this.aimV = (v==null) ? 0.50 : v;
    /* LA RIGA CHE DIVIDE I DUE MONDI. Se u e v ci sono, qualcuno ha
       mirato e da qui in poi la geometria della mira conta tutta. Se non
       ci sono — CPU, oppure A/S/D e le frecce, che sono l'unico modo di
       tirare per chi non ha un dito — le due righe qui sopra hanno
       INVENTATO un punto per farci volare il pallone nel disegno, e un
       punto inventato non e' una mira: non stringe la banda, non deforma
       il tiro, non avvicina il portiere. Il rigore di chi non puo'
       scegliere resta quello di ieri, alla cifra. */
    this.mirato = (u!=null);
    this.dito=-1; this.mira=false;
    Audio5.beep(520);
    this.phase='power'; this.poseT=0;
    this.cursor=0; this.dir=1;
    /* qui la mira e' presa, quindi qui — e non prima — si sa quanto
       stretta deve essere la banda. Senza mira non si tocca niente: la
       banda resta i 0,20 che start() ha gia' posato. */
    if(this.mirato) this.posaBanda(pkAudacia(this.aimU,this.aimV));
    ui.powerBand.style.left=(this.band0*100)+'%';`,
},

/* 6 — IL CUORE: resolve legge il punto, non piu' solo il terzo — ma solo
       quando un punto c'e' */
{
  nome: '6/10 resolve: la mira decide, e i due dadi restano due',
  cerca:
`    /* risoluzione: stessa zona + riflesso buono = parata, altrimenti gol */
    const D=DIFF[G.diff];
    let esito;
    if(s.powerQ<0.25 && dado()<0.6) esito='fuori';
    else if(s.keeperZone===s.zone){
      let reflex = s.keeperHuman ? 0.95 : D.save;
      if(s.powerQ>=1) reflex*=0.5;         // il tiro perfetto buca anche il lato giusto
      esito = dado()<reflex ? 'parata' : 'gol';
    }else esito='gol';
    s.outcome=esito;`,
  metti:
`    /* risoluzione: stessa zona + riflesso buono = parata, altrimenti gol.
       LA MIRA ADESSO CONTA, e la struttura dei rami non e' cambiata di
       una parola. Le due condizioni che cancellano un sorteggio —
       \`s.powerQ<0.25 &&\` e \`else if(s.keeperZone===s.zone)\` — sono
       quelle di ieri alla lettera: cambiano SOLO i due numeri con cui il
       dado si confronta. Il duello sta dentro il banco a seme fisso (il
       25% delle partite a 11 si decide ai rigori, misurato da _eventi),
       e un dado in piu' o in meno lo sfaserebbe. */
    const D=DIFF[G.diff];
    /* SENZA MIRA, IL DUELLO DI IERI ALLA CIFRA (correzione del 28 agosto
       2026). Tre ternari, un solo interruttore, nessun ramo nuovo nel
       percorso dei dadi: quando s.mirato e' falso pAlta torna a 0,60 e il
       riflesso torna a D.save nudo, cioe' esattamente le due costanti che
       stavano scritte qui prima di questa toppa. Non e' un riguardo per
       la CPU: e' che A/S/D e le frecce non possono scrivere aimU/aimV, e
       il punto che pickZone inventa per loro (centro del terzo, mezza
       altezza) vale 0,7178 di audacia — piu' di quasi tutto quello che un
       dito sceglie apposta. Far pagare quel numero a chi non puo'
       sceglierlo era una tassa nascosta: 91,4% -> 88,0% sul terzo
       laterale a banda perfetta e 91,6% -> 81,2% sul centrale, e a banda
       0,6 82,6% -> 67,7%, piu' la banda dimezzata sopra. Adesso e'
       zero. */
    const mirato = s.mirato;
    /* IL PUNTO D'ARRIVO. Da qui in poi comanda lui, e lo leggono in due:
       la risoluzione, qui sotto, e il disegno — le due righe in fondo lo
       scrivono dentro aimU/aimV, che sono i campi che drawDuelScene gia'
       usa per il volo del pallone, la tasca della rete e il lampo
       dell'impatto. Promessa ed esecuzione non possono piu' divergere.
       Senza mira il punto d'arrivo E' il punto di partenza: il pallone va
       dove il terzo dice, come ieri. */
    const A = mirato ? pkArrivo(s.aimU, s.aimV, s.powerQ) : { u:s.aimU, v:s.aimV };
    /* IL PALLONE SI ALZA. Il rigore sbagliato di piede o si accentra —
       ed e' A, qui sopra, che e' deterministico — o si sbuccia in cielo,
       e la seconda cosa capita tanto piu' spesso quanto piu' era audace
       la mira: 0,84 sull'incrocio, 0,22 sul centro comodo. Senza mira
       resta il 0,60 secco di ieri, che e' quello che il banco a seme
       fisso si aspetta. */
    const pAlta = mirato ? clamp(0.22 + 0.62*pkAudacia(s.aimU,s.aimV), 0.15, 0.90) : 0.60;
    let esito;
    if(s.powerQ<0.25 && dado()<pAlta) esito='fuori';
    else if(s.keeperZone===s.zone){
      /* IL TERZO GIUSTO NON BASTA PIU', SE QUALCUNO HA MIRATO. Il portiere
         e' partito verso il suo terzo: quanto para dipende da dove passa
         il pallone rispetto al tratto che sta percorrendo (pkDistanza) e
         da quanto e' lontano dal centro della porta (pkCopertura). Sul
         petto il riflesso arriva al tetto; all'incrocio del terzo che ha
         scelto crolla sotto un decimo. Il tetto 0,97 e il pavimento 0,02
         esistono perche' un rigore non e' mai ne' certo ne' impossibile,
         e non toccano il caso senza mira: li' il fattore e' 1 e D.save
         vale 0,22 / 0,52 / 0,74, tutti dentro la forcella. */
      let reflex = (s.keeperHuman ? 0.95 : D.save) *
                   (mirato ? pkCopertura(A.u,A.v,s.keeperZone) : 1);
      if(s.powerQ>=1) reflex*=0.5;         // il tiro perfetto buca anche il lato giusto
      esito = dado()<clamp(reflex,0.02,0.97) ? 'parata' : 'gol';
    }else esito='gol';
    s.outcome=esito;
    /* IL DISEGNO SEGUE IL PALLONE VERO, NON L'INTENZIONE. Una riga, e
       tutta la scena smette di mentire insieme: il volo, la tasca della
       rete e il lampo leggono gia' questi due campi, e il mirino a
       questo punto e' spento da un pezzo (si disegna solo nelle fasi
       zone/power/wait). Senza mira A e' il punto di partenza e queste due
       assegnazioni non spostano niente.
       IL FATTO CHE EMETTEREI, quando il registro arrivera':
         {quando, che cosa:'rigore', chi:s.shooter, esito:s.outcome,
          conMira:mirato, puntato:{u:s.aimU,v:s.aimV},
          arrivato:{u:A.u,v:A.v},
          banda:s.powerQ, terzoPortiere:s.keeperZone}
       — e' l'unico posto del gioco che sappia dire di quanto il pallone
       si e' allontanato da dove era stato mirato. Il collegamento lo fa
       chi scrive il registro: qui c'e' solo il commento. */
    s.aimU=A.u; s.aimV=A.v;`,
},

/* 7 — il pallone fuori vola SOPRA, non di lato: era l'unico esito che
       il disegno raccontava alla maniera vecchia */
{
  nome: '7/10 il pallone fuori se ne va sopra la traversa, dove era mirato',
  cerca:
`        if(D.outcome==='fuori'){
          tx2=VW/2+(D.zone-1)*g.GW*0.78+(D.zone===1?g.GW*0.5:0);
          ty2=g.gy0-g.GH*0.42;
        }else{`,
  metti:
`        if(D.outcome==='fuori'){
          /* IL PALLONE SBUCCIATO SE NE VA SOPRA, NON DI LATO. Qui il
             volo si calcolava sul TERZO, e il terzo centrale non aveva
             un fuori: gli si sommava mezza porta a destra, sempre a
             destra, cioe' un rigore centrale sbagliato usciva dalla
             parte del palo destro anche quando era stato calciato
             leggermente a sinistra. Adesso segue la mira (0,44 invece di
             0,31 e' la stessa retta, allungata: il pallone continua per
             la sua strada) e passa sopra la traversa, che e' l'unico
             modo in cui un rigore si sbaglia dopo la cura — vedi pAlta
             in Duel.resolve. */
          tx2=VW/2+D.aimU*g.GW*0.44;
          ty2=g.gy0-g.GH*0.42;
        }else{`,
},

/* 8 — il mirino brucia dove la porta e' piccola: il rischio si VEDE */
{
  nome: '8/10 il mirino cambia colore con l\'audacia, e solo se si mira',
  cerca:
`      ctx.lineCap='round';
      ctx.strokeStyle='rgba(4,12,8,.55)'; ctx.lineWidth=Math.max(4,g.GH*0.030);
      ctx.beginPath(); ctx.arc(mx,my,r,0,6.2832); ctx.stroke();
      ctx.strokeStyle='rgba(255,176,32,.96)'; ctx.lineWidth=Math.max(2.4,g.GH*0.018);
      ctx.beginPath(); ctx.arc(mx,my,r,0,6.2832); ctx.stroke();`,
  metti:
`      ctx.lineCap='round';
      /* IL MIRINO BRUCIA DOVE LA PORTA E' PICCOLA. Il prezzo dell'audacia
         (banda della potenza dimezzata, pallone che si accentra se il
         tempo e' sbagliato) si pagava senza che niente lo avesse detto
         prima. Qui lo dice il colore, e lo dice con lo stesso numero che
         lo fa pagare — pkAudacia, una scrittura e tre letture — quindi
         il cartello non puo' mentire: ambra (255,176,32) al centro
         comodo, rosso (255,77,77) all'incrocio, e in mezzo la strada.
         E NON MENTE NEMMENO AL CONTRARIO: il colore si accende solo
         mentre il dito mira (D.mira) o quando una mira c'e' stata
         (D.mirato). Il mirino che sta al centro del terzo perche' l'ha
         messo li' un tasto A/S/D non fa pagare niente, e quindi resta
         ambra — dire «rischio» a chi non ha scelto nessun rischio
         sarebbe la stessa bugia di prima, girata.
         Costa una radice quadrata a fotogramma, e solo mentre il dito
         mira in una scena che non disegna nemmeno il campo. */
      const aud=(D.mira||D.mirato) ? pkAudacia(D.aimU,D.aimV) : 0;
      const mirCol='rgba(255,'+((176-99*aud)|0)+','+((32+45*aud)|0)+',';
      ctx.strokeStyle='rgba(4,12,8,.55)'; ctx.lineWidth=Math.max(4,g.GH*0.030);
      ctx.beginPath(); ctx.arc(mx,my,r,0,6.2832); ctx.stroke();
      ctx.strokeStyle=mirCol+'.96)'; ctx.lineWidth=Math.max(2.4,g.GH*0.018);
      ctx.beginPath(); ctx.arc(mx,my,r,0,6.2832); ctx.stroke();`,
},

/* 9 — la goccia al centro del mirino e' l'ultimo pezzo rimasto ambra:
       l'anello e la crocetta gia' bruciano, e un puntino di un altro
       colore dentro un mirino rosso si legge come un errore di disegno,
       non come una scelta */
{
  nome: '9/10 anche la goccia al centro del mirino segue l\'audacia',
  cerca: `      ctx.fillStyle='rgba(255,176,32,.96)';
      ctx.beginPath(); ctx.arc(mx,my,Math.max(1.6,g.GH*0.014),0,6.2832); ctx.fill();`,
  metti: `      ctx.fillStyle=mirCol+'.96)';
      ctx.beginPath(); ctx.arc(mx,my,Math.max(1.6,g.GH*0.014),0,6.2832); ctx.fill();`,
},

/* 10 — il filtrante non dipende piu' dall'ordine dell'elenco */
{
  nome: '10/10 scegliFiltrante: un punteggio solo, e l\'ordine non conta',
  cerca:
`function scegliFiltrante(p,mx,my){
  const t=p.team;
  let best=null, bestDot=-1;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    const dx=q.x-p.x, dy=q.y-p.y, l=Math.max(1,len(dx,dy));
    const dot=(dx*mx+dy*my)/l;
    if(dot<=0.5) continue;
    if(!best || dot>bestDot+0.08 ||
       (dot>bestDot-0.08 && smarcato(p,q,t)>smarcato(p,best,t))){
      if(dot>bestDot){ bestDot=dot; }
      best=q;
    }
  }
  return best;
}`,
  metti:
`/* =====================================================================
   UN PUNTEGGIO SOLO, E L'ORDINE DELL'ELENCO NON CONTA PIU'
   (27 agosto 2026).

   IL DIFETTO, che questo file conosceva gia' e non aveva mai misurato
   (lo cita uomoVersoDirezione: «il bestDot di eseguiFiltrante»).
   bestDot si aggiornava SOLO dentro il ramo accettato e SOLO quando il
   nuovo dot era maggiore. Dopo un sorpasso della clausola «a parita' di
   dot vince lo smarcato» — che accetta un candidato con dot MINORE —
   \`best\` cambiava e bestDot no: da li' in poi ogni confronto avveniva
   contro un numero che non apparteneva piu' al migliore. Il ricevente
   dipendeva dall'ORDINE dell'array dei giocatori, cioe' da un dettaglio
   che in campo non esiste.

   MISURATO (strumenti/_sonda-mira.js prova 4: 300 stati di gioco, otto
   direzioni per stato, l'elenco dei giocatori ruotato di cinque e poi
   rovesciato — stesso campo, stessi uomini, solo un altro ordine):
     PRIMA  3284 confronti · 201 DISACCORDI (6,1%)
     DOPO   3574 confronti ·   0 DISACCORDI
   Il costo per chiamata sta fra 5,8 e 9,8 microsecondi prima (sette
   corse) e fra 5,2 e 8,4 dopo (otto corse): le due forcelle si
   sovrappongono, cioe' non e' cambiato — e non e' stato facile, vedi
   piu' sotto le due stesure bocciate dal costo.

   LA CURA SONO DUE MASSIMI, e dicono ALLA LETTERA quello che il commento
   di doFiltrante prometteva gia' ieri («vince il dot migliore, e a
   parita' vince lo smarcato»):
     1. il coseno MIGLIORE, preso come massimo su tutti;
     2. fra i pari merito, cioe' entro 0,08 dal migliore (la finestra di
        sempre, non un numero nuovo), lo smarcato MIGLIORE.
   Un massimo non dipende dall'ordine, e due massimi non possono
   contraddirsi come si contraddicevano i tre confronti concatenati di
   ieri.

   IL CONO SI ALLARGA da 0,5 a 0,35 di coseno (da 60 a 70 gradi), e non
   costa niente perche' la seconda passata guarda solo i pari merito.
   Serve a una cosa sola: decidere QUANDO il dito non ha indicato
   nessuno e la filtrante si ripiega sul passaggio normale. Sul gioco
   spedito i coni vuoti erano il 30,7% delle chiamate — quasi una mira
   su tre moriva senza che il giocatore lo sapesse; adesso il 24,5%.
   (Il 27 agosto la stessa prova diceva 48,5% e 42,1%: in mezzo il
   passaggio ha imparato il punto d'incontro — _t-spazio.js — e i
   compagni stanno piu' spesso davanti a chi ha la palla. Il segno della
   cura e' lo stesso, la taglia no.)

   DUE STESURE CORRETTE SONO STATE BOCCIATE DAL COSTO, e i numeri stanno
   qui perche' nessuno le riprovi. Il metro e' sempre la prova 4 della
   sonda. LE DUE BOCCIATE SONO DEL 27 AGOSTO e non sono state
   rimisurate oggi; il metro di allora era 5,7-8,2 microsecondi a
   chiamata, quello di oggi 5,8-9,8:
     · punteggio unico \`dot*1750 + smarcato\` (1750 = 140/0,08, la
       vecchia finestra di parita' valutata al peso di CHIAMA_PESO):
       piu' corta e altrettanto priva di ordinamento, ma chiama smarcato
       per OGNI candidato del cono.            15,5 microsecondi.
     · tre passate, con la terza che valuta smarcato per tutti i pari
       merito.                                  7,1-9,0 microsecondi.
   Su una funzione che gira a ogni fotogramma mentre il dito tiene il
   passaggio, e su un telefono che ha sedici millesimi, un fattore due e
   mezzo per zero gol in piu' e' il tipo di cura che va bocciata da chi
   la scrive.

   IL PAREGGIO NON LO DECIDE PIU' L'INDICE. Prima la clausola di parita'
   creava una zona larga 0,16 di coseno in cui l'ordine dell'array
   decideva davvero; adesso i pari merito si ordinano per smarcato e, a
   smarcato uguale, per coseno. Un pareggio su tutti e due gli assi ha
   misura nulla in un continuo — ma va detto che se capitasse vincerebbe
   l'indice piu' basso, che e' la stessa scelta dichiarata da
   uomoVersoDirezione.
   ===================================================================== */
/* LA LAVAGNETTA DEI COSENI, allocata una volta sola e riscritta a ogni
   chiamata. scegliFiltrante gira a OGNI FOTOGRAMMA dentro segniGuida
   mentre il dito tiene il passaggio: un array nuovo per fotogramma — o
   anche solo due chiusure nuove per fotogramma, che e' la stessa cosa —
   e' spazzatura che il raccoglitore poi presenta tutta insieme in un
   fotogramma solo, ed e' esattamente il tipo di scatto che su un
   telefono si vede. Le caselle oltre G.players.length non si leggono
   mai: la prima passata le riscrive tutte prima che qualcuno le guardi.
   Non la legge nessun altro e la simulazione non la conosce. */
const _filtCos = [];
function scegliFiltrante(p,mx,my){
  const t=p.team, L=G.players;
  /* PRIMA PASSATA — i coseni, e il migliore. Nessuna chiamata a
     smarcato: qui si spende una radice per compagno e basta. Chi non e'
     un candidato prende -2, che sta sotto qualunque soglia possibile
     (un coseno non scende mai sotto -1). */
  let bestDot=-1;
  for(let i=0;i<L.length;i++){
    const q=L[i];
    let d=-2;
    if(q.team===t && q!==p && q.out<=0 && q.role!=='gk'){
      const dx=q.x-p.x, dy=q.y-p.y;
      d=(dx*mx+dy*my)/Math.max(1,len(dx,dy));
      if(d>bestDot) bestDot=d;
    }
    _filtCos[i]=d;
  }
  if(bestDot<=0.35) return null;
  /* SECONDA PASSATA — fra i pari merito (entro 0,08 dal coseno migliore,
     la finestra di sempre) vince lo smarcato.
     IL PRIMO PARI MERITO SI TIENE DA PARTE SENZA VALUTARLO, e non e' un
     vezzo: smarcato() e' la parte cara — scorre tutti gli avversari con
     una radice e una proiezione ciascuno — e nella stragrande
     maggioranza delle chiamate il pari merito e' UNO SOLO, cioe' non
     c'e' niente da confrontare. Valutarlo comunque faceva costare la
     versione corretta piu' di quella difettosa, ed era la sola ragione
     per cui poteva essere bocciata dal costo invece che dal merito.
     -Infinity, non -1: smarcato e' negativo quando la linea di passaggio
     e' occupata (-260 per ogni avversario in mezzo), e un pavimento a -1
     scarterebbe l'unico compagno disponibile solo perche' e' marcato.
     IL PAREGGIO SI ROMPE CON L'ALLINEAMENTO, NON CON L'INDICE, e senza
     questa riga meta' del difetto sarebbe ancora qui: smarcato somma
     clamp(distanza,0,220) per ogni avversario, cioe' SATURA, e quando
     nessun avversario sta entro 220 unita' da nessuno dei due candidati
     e nessuna linea di passaggio e' occupata i due ricevono lo STESSO
     IDENTICO numero — non «quasi», identico, perche' 220 sommato dieci
     volte fa 2200 in tutte e due i casi. Su un campo largo 2300 succede
     spesso. Misurato: con la sola riscrittura a passate i disaccordi
     restavano 112 su 2740 (4,1%), praticamente tutti quelli di partenza
     — misura del 27 agosto, non rifatta oggi; quello che e' stato
     rimisurato oggi e' il risultato CON la riga: ZERO disaccordi su
     3574 confronti. */
  const SOGLIA=bestDot-0.08;
  let best=null, bestS=-Infinity, bestD=-1, quanti=0;
  for(let i=0;i<L.length;i++){
    const d=_filtCos[i];
    if(d<SOGLIA) continue;
    quanti++;
    if(quanti===1){ best=L[i]; bestD=d; continue; }         // tenuto da parte, non valutato
    if(quanti===2) bestS=smarcato(p,best,t);                // adesso serve: c'e' con chi confrontarlo
    const s=smarcato(p,L[i],t);
    if(s>bestS || (s===bestS && d>bestD)){ bestS=s; bestD=d; best=L[i]; }
  }
  return best;
}`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-mira.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

/* --dentro NON ESISTE PIU' in questa toppa: si prova solo su copia, e la
   copia si sceglie a mano con --out. La regola di casa e' quella, e una
   toppa che non offre la scorciatoia non la fa prendere per sbaglio. */
if (haFlag('dentro')) {
  console.error('FALLITO: --dentro non e\' previsto. Usa --out fuori/<nome>.html.');
  process.exit(2);
}

const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.mira.html';
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

/* GLI ATTESI. I primi guardano che la cura ci sia; quelli di mezzo che la
   correzione del 28 agosto ci sia DAVVERO (senza mira, i numeri di ieri);
   gli ultimi sono i piu' importanti e guardano che il PERCORSO DEI DADI
   non si sia mosso: le due condizioni che cancellano un sorteggio devono
   comparire ancora una volta ciascuna, parola per parola. */
const attesi = [
  ['function pkAudacia(u,v){', 1],
  ['function pkArrivo(u,v,pq){', 1],
  ['function pkDistanza(hu,hv,kz){', 1],
  ['function pkCopertura(hu,hv,kz){', 1],
  ['  posaBanda(aud){', 1],
  ['this.posaBanda(0);', 1],
  /* la correzione del 28 agosto, riga per riga: il campo, la scrittura,
     e le tre letture che tornano ai numeri di ieri quando e' falso */
  ['  mirato:false,', 1],
  ['this.mirato = (u!=null);', 1],
  ['this.mira=false; this.mirato=false;', 1],
  ['if(this.mirato) this.posaBanda(pkAudacia(this.aimU,this.aimV));', 1],
  ['const mirato = s.mirato;', 1],
  ['const A = mirato ? pkArrivo(s.aimU, s.aimV, s.powerQ) : { u:s.aimU, v:s.aimV };', 1],
  ['const pAlta = mirato ? clamp(0.22 + 0.62*pkAudacia(s.aimU,s.aimV), 0.15, 0.90) : 0.60;', 1],
  ['(mirato ? pkCopertura(A.u,A.v,s.keeperZone) : 1);', 1],
  ['const aud=(D.mira||D.mirato) ? pkAudacia(D.aimU,D.aimV) : 0;', 1],
  /* la banda non deve mai piu' stringersi senza il cancello di mirato */
  ['this.posaBanda(pkAudacia(this.aimU,this.aimV));', 1],
  /* i due rami, alla lettera: se uno di questi cade a 0 il conto dei dadi
     e' cambiato e la toppa non deve scriversi */
  ['if(s.powerQ<0.25 && dado()<pAlta) esito=\'fuori\';', 1],
  ['else if(s.keeperZone===s.zone){', 1],
  ['esito = dado()<clamp(reflex,0.02,0.97) ? \'parata\' : \'gol\';', 1],
  ['}else esito=\'gol\';', 1],
  ['s.aimU=A.u; s.aimV=A.v;', 1],
  /* le vecchie versioni non devono sopravvivere da nessuna parte */
  ['if(s.powerQ<0.25 && dado()<0.6) esito=\'fuori\';', 0],
  ['const w=0.2, c=rnd(0.35,0.85);', 0],
  ['let best=null, bestDot=-1;', 0],
  ['if(dot<=0.5) continue;', 0],
  ['tx2=VW/2+(D.zone-1)*g.GW*0.78', 0],
  ['const _filtCos = [];', 1],
  ["ctx.fillStyle=mirCol+'.96)';", 1],
  ["ctx.fillStyle='rgba(255,176,32,.96)';", 0],
  ['let best=null, bestS=-Infinity, bestD=-1, quanti=0;', 1],
  ['if(s>bestS || (s===bestS && d>bestD)){ bestS=s; bestD=d; best=L[i]; }', 1],
  ['if(bestDot<=0.35) return null;', 1],
  ['if(quanti===1){ best=L[i]; bestD=d; continue; }', 1],
  ['if(quanti===2) bestS=smarcato(p,best,t);', 1],
  ['const punti=dot*1750', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

/* IL CONTO DEI DADI, contato davvero e non promesso: dentro il corpo del
   Duel (da `const Duel = {` fino a `function startFreeKick`) il numero di
   sorteggi deve essere identico prima e dopo. E' la regola 3 della casa,
   ed e' l'unica che non si puo' verificare a occhio.
   DAL 27 AGOSTO IL CASO PASSA DA dado(): dentro il Duel non c'e' piu' un
   solo Math.random, e contarli sarebbe contare zero — cioe' non
   controllare niente. Si contano i dado() diretti, i rnd() (che sono un
   dado() ciascuno) e ANCHE i Math.random, che devono restare zero: se
   qualcuno ne rimettesse uno, sfuggirebbe al seme del multigiocatore. */
const conta = (t, re) => (t.match(re) || []).length;
const ritaglia = t => {
  const a = t.indexOf('const Duel = {');
  const b = t.indexOf('function startFreeKick', a);
  return (a < 0 || b < 0) ? '' : t.slice(a, b);
};
const qPrima = ritaglia(src), qDopo = ritaglia(out);
const dPrima = conta(qPrima, /dado\(\)/g), dDopo = conta(qDopo, /dado\(\)/g);
const rPrima = conta(qPrima, /\brnd\(/g), rDopo = conta(qDopo, /\brnd\(/g);
const mPrima = conta(qPrima, /Math\.random\(\)/g), mDopo = conta(qDopo, /Math\.random\(\)/g);
if (!dPrima || dPrima !== dDopo || rPrima !== rDopo || mPrima !== 0 || mDopo !== 0) {
  console.error('FALLITO: il percorso dei dadi dentro il Duel si e\' mosso.');
  console.error('  dado()      ' + dPrima + ' -> ' + dDopo);
  console.error('  rnd(        ' + rPrima + ' -> ' + rDopo);
  console.error('  Math.random ' + mPrima + ' -> ' + mDopo + '   (devono essere zero tutti e due)');
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    sorteggi dentro il Duel: dado() ' + dPrima + ' -> ' + dDopo +
            ', rnd( ' + rPrima + ' -> ' + rDopo + ', Math.random ' + mPrima + ' -> ' + mDopo);
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
