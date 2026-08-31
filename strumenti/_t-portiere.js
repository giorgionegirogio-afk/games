/* =====================================================================
   _t-portiere.js — RIFLESSI SMETTE DI ESSERE UNA BARRA DIPINTA, E LA
   PARATA HA QUATTRO ESITI (27 agosto 2026).

   COSA CAMBIA NEL GIOCO. Nella schermata ROSA l'uomo di indice 0 mostra
   due barre chiamate RIFLESSI e PRESA. Erano dipinte tutte e due:
   updateKeeper e tentaPresa non leggevano un solo attributo del
   portiere, e alzare RIFLESSI da 50 a 99 non spostava un gol.
   Da questa toppa RIFLESSI decide QUANTO CORPO il portiere tira su
   quando e' gia' a terra dopo un tuffo, e la parata smette di avere due
   soli esiti: il pallone gli puo' SFUGGIRE davanti, o essere mandato
   via COI PUGNI.
   Misurato con una sonda scritta apposta, cento partite per taglia, un
   portiere a 25 e l'altro a 99, contando quanti dei palloni che
   arrivano alla porta finiscono in rete:

     taglia        portiere 25   portiere 99    differenza
      5 contro 5      57,4%         33,0%      24,4 punti   8,8 sigma
      7 contro 7      48,7%         33,1%      15,7 punti   5,4 sigma
     11 contro 11     53,3%         35,6%      17,7 punti   4,7 sigma

   Sul banco di casa, dove i due portieri hanno lo stesso numero (63 e
   63), non si muove niente — ed e' esattamente cio' che deve succedere.

   E UNA COSA CHE NON SI E' RIUSCITI A FARE, scritta qui perche' e' la
   meta' utile di questa passata: PRESA RESTA UNA BARRA DIPINTA. Ci si
   e' provato in quattro modi diversi, tutti e quattro misurati, tutti e
   quattro bocciati, e il motivo e' sempre lo stesso e non e' nel
   portiere — e' in rinvioPortiere. Il verbale sta piu' sotto.

   ---------------------------------------------------------------------
   COME SI DIMOSTRA CHE ERANO DIPINTE. Non con un'ispezione del codice,
   che si puo' sempre sbagliare a leggere: con
   strumenti/_sonda-portiere.js, scritta per questa passata. Gioca cento
   partite col portiere di sinistra a 25 e quello di destra a 99, poi
   RIGIOCA gli stessi cento semi a ruoli scambiati — le due porte non
   sono equivalenti (la squadra 0 ha la rosa vera, la squadra 1 ha
   attributi piatti a 63: sul gioco spedito la porta 0 subisce 0,72 gol
   e la porta 1 ne subisce 0,84). Sul gioco spedito i due insiemi di gol
   subiti sono lo STESSO MUCCHIO e la differenza esce 0,000: non
   «piccola», zero esatto, perche' le due passate sono la stessa partita
   bit per bit.

   ---------------------------------------------------------------------
   DIECI LEVE PROVATE, DUE TENUTE, SETTE BOCCIATE, UNA MESSA DA PARTE.
   Ognuna ha una lettera e si monta da sola, cosi' nessuna si nasconde
   dietro l'altra e chiunque puo' rifare la misura.

     B*  i QUATTRO ESITI: presa, pugni, sfuggita, respinta
     T*  RIFLESSI allarga il corpo del portiere GIA' A TERRA
     R   RIFLESSI stringe l'errore di lettura     BOCCIATA: non fa niente
     L   RIFLESSI allarga la finestra di lettura  BOCCIATA: dipende dal campo
     M   RIFLESSI stringe la finestra di lettura  BOCCIATA: al rovescio
     P   PRESA alza la soglia di blocco           BOCCIATA: al rovescio
     S   PRESA stringe la banda di sfuggita       BOCCIATA: non fa niente
     W   PRESA allunga la respinta (i polsi)      BOCCIATA: non fa niente
     C   l'USCITA sul faccia a faccia             BOCCIATA: sfonda il cancello
     F   le mani del portiere non restano spente  RIPARAZIONE VERA, ma cara

   LA CURA E' --variante BT. F si consegna spenta, col suo prezzo
   misurato accanto (vedi in fondo).

   ---------------------------------------------------------------------
   LA COSA CHE HA INSEGNATO QUESTA PASSATA, e vale piu' della cura.

   Le cinque leve di attributo provate per prime (R, L, M, P, S)
   passavano tutte o per il TEMPO — quando il portiere si butta, quanto
   e' preciso il punto che mira — o per il POSSESSO — se il pallone
   finisce in mano sua o viene respinto. Tutte e cinque hanno dato zero
   o il segno rovesciato, e non per sfortuna: in questo gioco tutti e
   due quei canali hanno una CODA che si mangia il guadagno.

     · LA CODA DEL TEMPO. Il tuffo si chiude da solo appena il corpo ha
       superato il punto mirato (`if(rest<=0) p.dive=Math.min(p.dive,0.06)`)
       e da li' in poi il portiere e' in recover, dove copre 0,58
       dell'ellisse invece di 1. Chi legge meglio arriva prima, e chi
       arriva prima SI STENDE AD ASPETTARE il pallone con poco piu' di
       mezzo corpo. Premiare la lettura premia lo stendersi.
     · LA CODA DEL POSSESSO. La presa mette il pallone in mano al
       portiere; 0,9 s dopo rinvioPortiere lo scaglia sul compagno «piu'
       smarcato», che il suo punteggio sceglie soprattutto AVANZATO (la
       progressione in x piu' 0,6 volte la distanza dal marcatore piu'
       vicino, tagliata a 180): a 11 contro 11 e' un lancio di 1500
       unita' in mezzo agli avversari, e chi lo intercetta e' in zona di
       tiro. Premiare la presa premia il regalo.

   La leva tenuta non tocca ne' l'orologio ne' il possesso: tocca la
   GEOMETRIA, cioe' quanto corpo c'e' nel posto dove passa il pallone.

   ---------------------------------------------------------------------
      RETTIFICA DEL 28 AGOSTO 2026 — il verbale qui sotto era misurato col
      righello sbagliato, e la revisione avversaria l'ha smontato.

      QUI C'ERA SCRITTO: «funziona su tutte e tre le taglie con lo stesso
      segno e con cinque-nove sigma». Quei cinque-nove sigma sono la voce
      GOL/(GOL+PARATE), e G.stats.parate si alza a OGNI contatto di
      tentaPresa — senza tempo morto e senza chiedersi se quel pallone
      stesse entrando. E' un contatore CHE LA CURA MUOVE DA SE': a 11
      contro 11 il portiere bravo fa 1,310 parate contro 0,665 (+97%)
      mentre subisce 145 gol contro 152 (-4,6%). Centoventidue di quelle
      «parate» in piu' erano palloni che uscivano — il tuffo si arma per
      predY fino a sedici unita' FUORI dal palo (:13740), e la cura
      ingrossa il corpo proprio in quella banda.

      SUL TABELLONE, che e' l'unica voce che un giocatore vede:
        taglia  5   gol subiti 1,575 -> 1,145   +0,430   4,1 sigma
        taglia  7              1,255 -> 1,070   +0,185   1,9 sigma
        taglia 11              0,760 -> 0,725   +0,035   0,5 sigma

      A UNDICI LA LEVA NON SPOSTA IL TABELLONE. E c'e' di peggio: questa
      stessa toppa boccia la leva R con le parole «NON E' UNA LEVA: -0,040
      gol (0,5 sigma)» — cioe' con LO STESSO NUMERO che qui sopra era
      stato chiamato successo. Due leve, due righelli, e quello favorevole
      dato alla leva che si voleva tenere.

      COSA RESTA IN PIEDI: la cura a CINQUE CONTRO CINQUE, che e' la
      taglia base del gioco, con +0,430 gol a 4,1 sigma. A sette e' al
      limite del rumore, a undici non c'e'. Si applica per quello che e' —
      un portiere che a 5 contro 5 conta davvero — e non per quello che il
      verbale diceva.

      E RESTA UNA DOMANDA APERTA, che vale piu' della cura: G.stats.parate
      non e' un righello. Chiunque misuri il portiere con quel numero
      misurera' la dimensione del corpo invece delle parate. Va rifatto —
      una parata e' un pallone che stava entrando — e finche' non lo e',
      nessuna prova che lo usi vale niente.
   ---------------------------------------------------------------------
   CHI CERCHERA' UNA LEVA NUOVA PER IL PORTIERE COMINCI DA QUI: la
   domanda giusta non e' «che cosa fa meglio», e' «che cosa fa piu'
   CORPO o piu' STRADA», perche' quelle due grandezze in questo motore
   non si girano al contrario.

   ---------------------------------------------------------------------
   LE DUE LEVE TENUTE

   T — RIFLESSI: QUANTO CORPO TIRA SU DA TERRA.
       Dopo il tuffo il portiere resta 0,30 s in recover, e in quei
       trenta centesimi il suo corpo copre 0,58 dell'ellisse — un numero
       gia' misurato e gia' scritto nel gioco (a corpo pieno le reti nei
       novanta secondi scendevano da 1,17 a 0,67 e gli 0-0 risalivano al
       47%). Ma «quanto ti allunghi mentre sei per terra» E' la
       definizione dei riflessi, e finora era identico per ogni portiere
       del gioco, compreso quello della CPU che riceve f2 = 52 +
       forza*2,2 dalla forza della sua squadra e non lo usava.
       0,58*fatt(p.tecnica, +0,30) vale 0,41 a 25, 0,58 a 62 — la media
       della rosa, cioe' il gioco spedito, bit per bit — e 0,75 a 99.
       Una riga, una moltiplicazione, e solo nei diciotto fotogrammi di
       recover dopo un tuffo.

   B — QUATTRO ESITI INVECE DI DUE.
         PRESA     palla lenta e in mezzo al corpo: azione finita.
         PUGNI     palla ALTA (sopra GK_PUGNO_Z = 16, cioe' sopra il
                   petto — la presa alta del rig si arma a b.z>14) e
                   troppo forte per le mani: si smanaccia lontano. Con
                   vz fra 150 e 240 e gravita' 560 il volo dura
                   0,54-0,86 s e il pallone tocca terra fra 242 e 590
                   unita' dal portiere: fuori dall'area su tutte e tre le
                   taglie (GK_AREA_X vale 118, 136, 153).
         SFUGGE    ci ha provato con le mani e non l'ha tenuta: il
                   pallone gli cade DAVANTI a 70-150 unita'/s. E' la
                   ribattuta piu' pericolosa del calcio, e il gioco non
                   ce l'aveva.
         RESPINTA  tutto il resto: di lato, verso l'esterno, con gli
                   stessi tre numeri di ieri.
       QUANTO ESCONO DAVVERO, per partita, sonda a 100 partite per
       taglia (semi 20260803..902, variante BT):
         taglia   PRESA  RESPINTA  SFUGGE  PUGNI
           5      1,185   1,645    0,575   0,090
           7      1,210   1,710    0,565   0,000
          11      0,860   0,680    0,435   0,000
       PUGNI E' RARO E VA DETTO: nove volte ogni cento partite a cinque
       contro cinque, e MAI a sette e a undici — ne' li', ne' in
       duecento partite di sonda. Vive di palloni alti e tesi addosso al
       portiere, che la CPU non produce quasi mai; chi crossa e
       pallonetta col dito lo incontrera' molto piu' spesso. Non e'
       codice morto, e' codice che aspetta un umano — ma chi lo tocca
       sappia che oggi non e' coperto da nessuna misura di frequenza a
       sette e a undici.
       E SFUGGE NON SI ANNULLA DA SOLA, che era il dubbio serio: il
       portiere potrebbe riprendersela al fotogramma dopo, perche'
       tentaPresa non ha tempo morto (e' anche il motivo per cui
       G.stats.parate conta 1,6 mentre i tiri che finiscono in parata
       sono 0,87 — pre-esistente, non introdotto qui). Misurato con
       fuori/_chk-sfugge.js su 30 partite per taglia: dei 30 SFUGGE, 5
       hanno un secondo tocco del portiere entro mezzo secondo (0 su 11
       a cinque, 4 su 10 a sette, 1 su 9 a undici), cioe' il 17%.
       Quattro su cinque restano ribattute vere.

   ---------------------------------------------------------------------
   LA MISURA — I DUE NUMERI SONO VIVI?
   node strumenti/_sonda-portiere.js --partite 100 --taglia T
        --gioco fuori/gk-X.html
   La voce da leggere e' «su 100 palloni arrivati alla porta, quanti in
   rete»: il denominatore e' gol + parate, cioe' i due contatori che si
   accendono alla fine della corsa del pallone verso quella porta, e ha
   sotto centinaia di campioni invece di duecento partite. NON si usa
   G.stats.inPorta, che mescola l'INTENZIONE (fireShot lo alza quando la
   mira sta dentro il palo, :11420) con l'ESITO (tentaPresa lo alza
   quando il portiere tocca, :13820): e' la stessa differenza che il
   tabellino chiama «precisione tabellino» contro «precisione VERA».
   Segno POSITIVO = il portiere bravo ne fa passare meno, cioe' funziona.

     variante                 taglia 5        taglia 7       taglia 11
     gioco spedito       0,000 esatto (i due mucchi sono la stessa partita)
     B+T   <— LA CURA   +24,4  8,8s     +15,7  5,4s     +17,7  4,7s
     B+T+W              +21,5  7,9s     +16,9  5,9s     +17,9  4,8s
     B+W  (solo polsi)   -1,0  0,3s          —           -2,0  0,5s
     B+S                 -1,0  0,3s      -0,8  0,3s      -0,3  0,1s
     L+B+S               -4,8  1,6s      -9,4  3,1s     +14,6  4,0s
     L  (da sola)        -5,7  1,9s          —      (in L+B: +13,2  3,6s)
     R  (da sola)            —               —           +2,3  0,6s
     P  (da sola)            —               —          -13,5  3,6s
     R+P+M+F                 —               —          -27,9  8,7s
     L+B+S+F                 —               —          +16,8  4,8s

   ---------------------------------------------------------------------
   LA MISURA — IL BANCO A PORTIERI UGUALI. Una cura che accende un
   attributo non deve spostare il gioco quando i due portieri hanno lo
   stesso numero, e nel banco di casa ce l'hanno sempre (63 e 63).
   node strumenti/_eventi.js --taglia 11 --partite 100 --seme SEME
        --gioco fuori/gk-X.html
   DUE blocchi di semi indipendenti da cento partite ciascuno:
   b1 = 20260803..902, b2 = 20261101..1200. CPU contro CPU, Normale,
   tempo regolamentare (180 s a 11, vedi durataPartita).
   PERCHE' DUE BLOCCHI, e non e' pedanteria: su cento partite la
   frequenza degli 0-0 ha sigma 4 punti. Sul primo blocco la variante
   R+P+B sembrava un trionfo — 0-0 dal 22% al 17%, gol da 1,24 a 1,47 —
   e sul secondo blocco: 27% contro 28% e 1,23 contro 1,23, cioe'
   NIENTE. Un blocco solo mente, e in questa passata ha mentito.

                       gol nei 90 s        partite 0-0      parate
                      b1    b2   media   b1   b2  media   b1   b2
     gioco spedito   1,24  1,23  1,235  22%  28%   25%   1,6  1,6
     B+T (la cura)   1,27  1,22  1,245  21%  27%   24%   1,6  1,6
     B               1,28  1,26  1,270  21%  27%   24%   1,6  1,6
     B+T+W           1,32  1,18  1,250  22%  26%   24%   1,5  1,7
     B+S             1,28  1,26  1,270  21%  27%   24%   1,6  1,6
     L+B+S           1,22  1,13  1,175  28%  29%   28%   1,7  1,5
     L+B             1,21  1,16  1,185  29%  29%   29%   1,7  1,4
     P+L             1,22  1,14  1,180  26%  31%   28%   1,6  1,4
     F               1,28  1,03  1,155  25%  37%   31%   2,0  1,9
     R+P+B           1,47  1,23  1,350  17%  27%   22%   1,7  1,6
     R+P+B+F         1,10  1,08  1,090  31%  34%   32%   1,9  1,7
     R+P+B+C+F       1,01  1,01  1,010  34%  38%   36%   1,9  2,0

   La cura sta a 1,245 gol contro 1,235 e a 24% di 0-0 contro 25%: e' il
   gioco di ieri. I MOMENTI DA PORTA — la voce che il progetto ha messo
   apposta per non farsi ingannare dalla rissa — restano 3,0 e 2,9
   contro 3,0 e 3,0, e la precisione VERA dei tiri sale da 10% a 11% su
   tutti e due i blocchi.
   CANCELLI SULLA CURA:
     node strumenti/_q-meta.js --tre-taglie --gioco fuori/gk-BT.html
       82 su 82. 5v5 0-0 3% (soglia 40), 7v7 3% (soglia 70),
       11v11 23% (soglia 33).
     node strumenti/collaudo.js --gioco fuori/gk-BT.html
       36 su 36, nessun errore in console.

   ---------------------------------------------------------------------
   LE BOCCIATURE, coi numeri, perche' nessuno le riprovi.

   R — RIFLESSI STRINGE L'ERRORE DI LETTURA. Era la leva ovvia:
       (1-D.save)*rnd(-46,46) moltiplicato, cioe' un errore di +-21
       unita' a 99 e +-71 a 25. NON E' UNA LEVA: -0,040 gol (0,5 sigma)
       e +2,3 punti (0,6 sigma) su 200 partite. Il perche' e'
       geometrico: il corpo in tuffo e' un'ellisse da 34 unita' e SPAZZA
       un corridoio lungo tutta la distensione, quindi sbagliare il
       punto di caduta di venti o di settanta unita' cade dentro lo
       stesso corridoio. Un errore di lettura conta solo se il corpo e'
       piu' piccolo dell'errore.

   M — RIFLESSI STRINGE LA FINESTRA DI LETTURA: il portiere sveglio
       ASPETTA invece di buttarsi presto. E' la teoria che suona piu'
       giusta — «si e' buttato presto» e' il rimprovero classico — ed e'
       la bocciatura piu' netta di tutta la passata: -0,205 gol (2,6
       sigma) e -27,9 punti (8,7 sigma). Dentro quella stessa corsa si
       legge quanto pesa la finestra: con 0,79 s il portiere fa 2,245
       parate a partita, con 0,45 s ne fa 0,845. Il conto lo spiega:
       GK_RACC + GK_DIVE_T = 0,07 + 0,58 = 0,65 s, e a 0,45 s dalla fine
       il corpo e' ancora a meta' strada quando il pallone passa.

   L — RIFLESSI ALLARGA LA FINESTRA (l'opposto di M, quindi il verso
       giusto). Funziona a 11 contro 11 — +14,6 punti, 4,0 sigma — e si
       ROVESCIA sulle taglie piccole: -5,7 punti a cinque, -9,4 a sette
       (3,1 sigma). BOCCIATA, e la ragione e' un numero del gioco:
       GK_LETTURA e' un tempo ASSOLUTO (0,62 s) mentre i tempi d'arrivo
       dei tiri scalano col campo. Con l'aritmetica di TIRO_ATTR (1,0498
       a cinque, 0,5249 a undici): un tiro da 300 unita' a 700 unita'/s
       arriva in 0,71 s a cinque, un tiro da 600 arriva in 1,41 s a
       undici. La finestra del portiere andrebbe scalata col campo come
       sono scalati l'attrito, le distanze e — dal 26 agosto — il
       cronometro. E' una cura a se': cambiare GK_LETTURA cambia il
       gioco spedito su tutte e tre le taglie e vuole la sua tabella.
       Chi la fa, poi puo' riprendersi L, che a undici vale quattro
       sigma.

   P — PRESA ALZA LA SOGLIA DI BLOCCO (330 = TIRO_ARRIVO[1] diventa 439
       a 99 e 221 a 25, con la zona di mani pulite da 0,59 a 0,91).
       BOCCIATA AL ROVESCIO: -0,220 gol (2,9 sigma) e -13,5 punti (3,6
       sigma). IL PORTIERE CHE PRENDE PIU' PALLONI SUBISCE PIU' GOL, ed
       e' la coda del possesso descritta sopra.

   S — PRESA STRINGE LA BANDA IN CUI IL PALLONE SFUGGE (1,16 volte la
       soglia a 99, 1,60 a 62, 2,04 a 25). Sembrava la leva giusta
       perche' non tocca il possesso. NON FA NIENTE, e su tutte e tre le
       taglie: -1,0 punti a cinque (0,3 sigma), -0,8 a sette (0,3), -0,3
       a undici (0,1). Il motivo e' la frequenza: SFUGGE esce da 0,50 a
       0,58 volte a partita, e spostarne una frazione non muove una
       misura che sta su un gol e mezzo.

   W — PRESA ALLUNGA LA RESPINTA (i polsi): fatt(p.tackle,+0,45) sulla
       velocita' della respinta e del pugno, cioe' 84-140 unita'/s a 25
       contro 216-360 a 99. Era l'ultima strada rimasta per PRESA e non
       tocca ne' tempo ne' possesso. NON FA NIENTE: a 11 contro 11 la
       differenza dei gol e' 0,000 con 0,0 sigma e i punti sono -2,0
       (0,5 sigma); isolando il solo tackle con --campo tackle, -1,0
       punti a cinque (0,3 sigma) e -1,6 a undici (0,4 sigma). Una
       respinta piu' lunga cambia DOVE finisce il pallone ma non cambia
       chi lo riprende: il possesso a palla vagante lo decide la corsa,
       e la corsa non la fa il portiere.

   QUATTRO STRADE PER PRESA, QUATTRO NO. Il conto e' P (soglia e zona di
   mani pulite), S (banda di sfuggita) e W (polsi): tutte le grandezze
   che un portiere governa con le mani, tolta quella che governa col
   corpo, che e' gia' di RIFLESSI. Finche' rinvioPortiere regala il
   pallone, tenerlo in mano non e' un vantaggio e nessun attributo delle
   mani puo' diventarlo. IL PROSSIMO CANTIERE DEL PORTIERE E'
   rinvioPortiere, non PRESA — e questa toppa gli lascia in eredita' un
   numero: rendere la presa piu' frequente vale -13,5 punti, quindi la
   cura del rinvio si misura sulla stessa sonda e deve riportarli sopra
   lo zero.

   C — L'USCITA SUL FACCIA A FACCIA. L'implementazione c'e' tutta ed e'
       la nostra: pallone in possesso di un avversario dentro
       GK_USCITA_D volte GK_AREA_X dalla porta, dentro la luce
       allargata, e NESSUN compagno del portiere fra lui e la porta
       entro GK_USCITA_M volte GK_AREA_X — e' questa terza condizione
       che distingue il faccia a faccia dall'assedio, perche' con un
       difensore addosso al portatore uscire vuol dire lasciare la porta
       a chi riceve. Allora l'uscita passa da dl*0,10 a dl*0,42, il
       tetto da GK_AREA_X*0,62 a *0,96 e il passo da GK_SPEED a
       GK_SPEED*1,70; il latch p.gkFuori lo tiene fuori GK_USCITA_T
       secondi dopo che la condizione cade e il rientro e' al passo
       normale, cosi' chi lo salta col pallonetto (Z_SOPRA_PORTIERE =
       34, esiste gia') trova la porta vuota.
       BOCCIATA PER IL PREZZO, non per l'idea: da sola e' neutra (1,16
       gol contro 1,24 sul primo blocco), ma in compagnia porta gli 0-0
       a 34% e 38% sui due blocchi — 36% — OLTRE la soglia 33% del
       cancello --tre-taglie. Il portiere che esce chiude l'angolo piu'
       spesso di quanto la CPU sappia scavalcarlo: il prezzo che la
       toppa aveva progettato, il pallonetto sopra il portiere uscito,
       la CPU non lo sa pagare. Si riapra il giorno in cui l'attaccante
       CPU sa alzare la palla sul portiere uscito.
       UN AGGANCIO DA RICORDARE se un giorno si accende: la funzione
       crossPortiereCopre (:15175) PREVEDE dove sara' il portiere fra
       0,75 s riscrivendo a mano la formula dell'uscita. Con C accesa
       quella previsione e' sbagliata nel caso del faccia a faccia. Oggi
       le due cose non si incrociano — il cross parte solo da fuori
       zonaTiro, che a 11 contro 11 vuol dire oltre 920 unita' dalla
       porta, contro le 398 di GK_USCITA_D — ma la formula sta scritta
       in due posti, e due posti prima o poi divergono.

   ---------------------------------------------------------------------
   F — UNA RIPARAZIONE VERA CHE OGGI NON SI ACCENDE.

   IL DIFETTO non era in nessun elenco: l'ha trovato la sonda mentre
   cercava altro. In fondo a updateKeeper c'e' la riga che rende il
   portiere un corpo anche in piedi: if(p.kickCd<=0){ ... tentaPresa(p,b); }.
   Ma p.kickCd del portiere veniva scalato in UN SOLO POSTO, dentro
   if(b.owner===G.players.indexOf(p)), cioe' soltanto mentre teneva il
   pallone fra le mani: il ramo del ruolo 'gk' in updatePlayerFisica
   (:12827) ritorna PRIMA della riga che scala il kickCd di tutti gli
   altri. Appena qualcosa gliene scrive uno senza dargli la palla, quel
   numero non torna piu' a zero e le sue mani si spengono per il resto
   della partita. Succede in due modi comuni: rinvioPortiere gli lascia
   0,40 e libera il pallone nello stesso istante (:13892), e il rimpallo
   sul corpo gliene scrive 0,18 come a chiunque altro (:13460).
   MISURATO con fuori/_chk-kickcd.js, 12 partite a 11 contro 11, semi
   20260803..814, gioco spedito, sui fotogrammi in cui il portiere NON
   ha la palla in mano:
     mani ATTIVE  207.407 fotogrammi   68,9%
     mani SPENTE   93.577 fotogrammi   31,1%
   e i valori di kickCd letti al fischio finale sono 0,40 e 0,18:
   esattamente quei due numeri, mai scalati.

   LA RIPARAZIONE e' scalarlo accanto a p.gkT, una volta per fotogramma
   e in tutti gli stati, e togliere il decremento dal ramo del possesso
   (se no si scalerebbe due volte e il rinvio partirebbe in 0,45 s
   invece che in 0,90).

   IL PREZZO, misurato su 200 partite a 11 contro 11:
     parate a partita   1,6  ->  1,95   (+22%)
     gol nei 90 s     1,235 ->  1,155   (-6%)
     partite 0-0        25%  ->   31%   (+6 punti)
   Il cancello --tre-taglie ammette il 33% a 11 contro 11: F da sola
   resta verde ma si mangia due terzi del margine, e in compagnia lo
   finisce. Percio' NON sta nella cura di oggi: sta scritta, provata e
   pronta (--variante BTF), e va accesa il giorno in cui l'attacco
   restituisce quei gol. Chi la accende lo faccia con la misura in mano,
   non per pulizia.

   ---------------------------------------------------------------------
   IL CONTO DEI SORTEGGI, che e' legge in questa casa.
   La presa non pescava numeri casuali e non ne pesca; ognuno dei tre
   esiti di respinta ne pesca TRE (vx, vy, vz) come la respinta di ieri;
   updateKeeper ne pesca UNO come ieri. Non e' una promessa scritta a
   mano: la toppa CONTA i sorteggi ramo per ramo dentro tentaPresa e
   dentro updateKeeper, leggendo il file prima e dopo, e SI RIFIUTA DI
   SCRIVERE se un ramo ne pesca un numero diverso da ieri.

   IL FATTO CHE QUESTA CURA EMETTEREBBE, per il registro dei fatti che
   sta arrivando (qui NON si costruisce un registro):
     · alla parata, dove oggi c'e' showBanner:
       {quando, cosa:'parata', chi: indice del portiere, dove:{x,y},
        esito:'presa'|'pugni'|'sfuggita'|'respinta', velocita: sp}
     · all'uscita, se un giorno C si accende: {quando, cosa:'uscita',
       chi, dove, esito:'aperta'} quando p.gkFuori si accende, e
       'chiusa'|'saltato' quando si spegne, secondo che il pallone sia
       suo o no.

   IL COSTO A FOTOGRAMMA. La cura aggiunge UNA chiamata a fatt — una
   sottrazione, una divisione, una moltiplicazione, una somma — per
   portiere e solo nei 18 fotogrammi di recover che seguono un tuffo;
   e, nell'istante della parata (1,6 volte a partita, cioe' una volta
   ogni 6.750 fotogrammi a 180 secondi), due confronti in piu' per
   scegliere fra quattro rami invece che fra due. Due portieri in campo.
   Per confronto, la stessa partita conta 35,7 rimpalli sul corpo e 67,8
   palloni vaganti. Non e' misurabile a 16 ms, e non aggiunge un oggetto
   ne' un disegno: nessuna clip nuova, nessuna particella nuova.
   La variante C, quella bocciata, avrebbe aggiunto un giro sui
   giocatori (44 confronti nel caso peggiore a 11 contro 11) e soltanto
   quando il pallone ha un padrone dentro l'area allargata.

   ---------------------------------------------------------------------
   uso:  node strumenti/_t-portiere.js --variante BT --out fuori/gk.html
         node strumenti/_t-portiere.js --variante BTF --out fuori/gk-BTF.html
         node strumenti/_t-portiere.js --elenco --variante BT
   Le lettere si combinano. BT e' la cura; BTF aggiunge la riparazione
   col suo prezzo; R, L, M, P, S, W e C restano montabili SOLO per
   rifare le misure di sopra.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
/* la variante e' un INSIEME di lettere (vedi l'elenco in testa): BT e'
   la cura, ogni altra combinazione serve a rifare una misura bocciata.
   'A' resta la scorciatoia per R+P, cioe' le due leve di attributo
   provate per prime e bocciate tutte e due. */
const VAR = String(arg('variante', 'BT')).toUpperCase();
if (!/^[ABCFLMRPSTW]+$/.test(VAR) || (VAR.includes('L') && VAR.includes('M'))) {
  console.error('FALLITO: --variante e\' una combinazione di A, B, C, F e UNA sola fra L e M (es. AB, ABF, ABMF, ABCFM)');
  process.exit(2);
}
/* A si spacchetta in due leve misurabili una per una:
     R  l'ERRORE DI LETTURA lo fa RIFLESSI
     P  le MANI (soglia di blocco, zona di mani pulite, crescita) le fa PRESA
   'A' resta la scorciatoia per «tutte e due». */
const conR = VAR.includes('A') || VAR.includes('R');
const conP = VAR.includes('A') || VAR.includes('P');
const conS = VAR.includes('S');   // PRESA governa la banda in cui il pallone sfugge (richiede B)
const conA = conR && conP;
const conB = VAR.includes('B');
const conC = VAR.includes('C');
const conF = VAR.includes('F');
if (conS && !conB) {
  /* S vive DENTRO l'esito SFUGGE, che nasce con B: senza B non c'e'
     banda da stringere, e una lettera che non fa niente e' peggio di un
     errore. */
  console.error('FALLITO: la leva S (la banda di sfuggita) richiede B (i quattro esiti). Usa --variante BS.');
  process.exit(2);
}
const conT = VAR.includes('T');   // RIFLESSI allarga il corpo a terra
const conW = VAR.includes('W');   // PRESA allunga la respinta
if (conW && !conB) {
  console.error('FALLITO: la leva W (i polsi) vive dentro i quattro esiti: richiede B. Usa --variante BW.');
  process.exit(2);
}
const conL = VAR.includes('L');   // finestra LARGA coi riflessi: il verso bocciato
const conM = VAR.includes('M');   // finestra STRETTA coi riflessi: il portiere sveglio aspetta

/* ------------------------------------------------------------------ */
/* 1 — LE COSTANTI, tutte accanto alle altre GK_* e tutte dichiarate.  */
const CERCA_COST =
`const GK_RACC = 0.07, GK_RACC_V = 0.30;
const GK_SCATTO = 0.80, GK_SCATTO_T = 0.14;
const GK_DIVE_T = 0.58;`;

/* Si scrivono SOLO le costanti che la variante montata usa davvero:
   una costante dichiarata e mai letta e' codice morto, e in un file da
   due mega di gioco il codice morto non lo trova piu' nessuno. Le
   ampiezze delle leve bocciate compaiono quindi solo quando qualcuno
   rimonta quella leva per rifare la misura. */
const COST = [];
if (conB) COST.push(
`/* =====================================================================
   I QUATTRO ESITI DELLA PARATA.
   GK_PUGNO_Z sta a 16 perche' la presa alta del rig si arma gia' a
   b.z>14 (cercala qui sotto in tentaPresa): sopra il petto le mani non
   trattengono, smanacciano. GK_SFUGGE dice fin dove il portiere ci
   PROVA con le mani: oltre 1,60 volte la soglia di blocco non prova
   nemmeno, respinge di lato — ed e' la respinta che il gioco ha gia'.
   Il pallone che SFUGGE gli cade davanti, ed e' la ribattuta piu'
   pericolosa del calcio: misurato, esce da 0,44 a 0,58 volte a partita
   secondo la taglia, e solo il 17% se lo riprende lui.
   ===================================================================== */
const GK_PUGNO_Z = 16;       // sopra questa quota la palla forte si smanaccia
const GK_SFUGGE  = 1.60;     // fin dove ci prova con le mani, in multipli della soglia`);
if (conT) COST.push(
`/* =====================================================================
   RIFLESSI E' UN NUMERO CHE ADESSO SI LEGGE, e si legge in un posto
   solo: quanto corpo il portiere tira su quando e' GIA' A TERRA.
   fatt(v, ampiezza) vale 1 esatto a 62 — la media della rosa — quindi
   un portiere medio si comporta come il portiere di ieri, bit per bit:
     fatt(25,+0,30) = 0,708      fatt(99,+0,30) = 1,292
   e la copertura in recover, che era 0,58 per tutti, diventa 0,41 a 25
   e 0,75 a 99.
   PERCHE' QUI E NON NELLA LETTURA. Le leve di lettura (l'errore, la
   finestra) sono state provate e bocciate tutte: in questo motore chi
   legge meglio arriva prima sul punto, e chi arriva prima CHIUDE il
   tuffo e si stende ad aspettare con 0,58 di corpo. La geometria non
   ha quella coda. I numeri stanno in testa alla toppa.
   ===================================================================== */
const GK_RIFL_TERRA = 0.30;  // quanto i riflessi allargano il corpo a terra`);
if (conR) COST.push(`const GK_RIFL_ERR = 0.55;    // BOCCIATA: quanto i riflessi stringono l'errore di lettura`);
if (conL || conM) COST.push(`const GK_RIFL_LET = 0.28;    // BOCCIATA: quanto i riflessi spostano la finestra di lettura`);
if (conP) COST.push(
`const GK_PRESA_V  = 0.34;    // BOCCIATA: quanto la presa alza la soglia di blocco (330)
const GK_PRESA_L  = 0.22;    // BOCCIATA: quanto la presa allarga la zona di mani pulite (0,75)`);
if (conS) COST.push(`const GK_PRESA_S = 0.75;     // BOCCIATA: quanto le mani stringono la banda di sfuggita`);
if (conW) COST.push(`const GK_PRESA_W = 0.45;     // BOCCIATA: quanto i polsi allungano la respinta`);
if (conC) COST.push(
`/* =====================================================================
   L'USCITA SUL FACCIA A FACCIA (variante BOCCIATA: vedi in testa).
   Le tre distanze sono multipli di GK_AREA_X e non numeri assoluti,
   perche' GK_AREA_X e' l'unica misura del portiere che gia' scala col
   campo (setTaglia: GK_AREA_X = round(118*KPASSO), cioe' 118 a 5, 136 a
   7, 153 a 11). Un'uscita scritta in unita' assolute sarebbe tre uscite
   diverse sulle tre taglie.
   ===================================================================== */
const GK_USCITA_D = 2.60;    // quanto vicino dev'essere il portatore, in GK_AREA_X
const GK_USCITA_M = 0.90;    // entro quanto un compagno lo copre, in GK_AREA_X
const GK_USCITA_T = 0.35;    // il latch: quanto resta fuori dopo che la condizione cade
const GK_RUSH     = 1.70;    // di quanto accelera il passo mentre esce`);

const METTI_COST = CERCA_COST + (COST.length ? '\n' + COST.join('\n') : '');

/* ------------------------------------------------------------------ */
/* 2 — A: L'ERRORE DI LETTURA lo fa RIFLESSI                          */
const CERCA_ERR = `      const err = (1-D.save)*rnd(-46,46);       // lettura imperfetta della traiettoria`;
const METTI_ERR =
`      /* RIFLESSI: L'ERRORE DI LETTURA E' SUO.
         Il portiere non legge la traiettoria esatta: sbaglia il punto
         di caduta di un tanto, e finora quel tanto era uguale per
         tutti i portieri del gioco. Adesso e' il suo.
         Il sorteggio resta UNO e resta QUI dentro, dove stava: si
         moltiplica il risultato, non si aggiunge una pescata. A 62 —
         la media della rosa — fatt vale 1 esatto e l'errore e' +-46
         unita' come nel gioco spedito; a 99 e' +-21, a 25 e' +-71. */
      const err = (1-D.save)*rnd(-46,46)*fatt(p.tecnica, -GK_RIFL_ERR);   // lettura imperfetta della traiettoria`;

/* 2-bis — L e M: LA FINESTRA DI LETTURA, nei due versi.
   L allarga la finestra coi riflessi (il portiere sveglio si accorge
   PRIMA e parte prima); M la stringe (il portiere sveglio ASPETTA e
   parte tardi). Sono due teorie opposte dello stesso attributo e una
   delle due e' sbagliata: la misura dice quale. */
const CERCA_FIN = `    if(predY>GY0-16 && predY<GY1+16 && tArr<GK_LETTURA){`;
const mettiFin = segno =>
`    /* RIFLESSI: LA FINESTRA DI LETTURA — QUANDO SI BUTTA.
       Il tuffo intero costa GK_RACC + GK_DIVE_T = 0,07 + 0,58 = 0,65 s,
       e si CHIUDE da solo appena il corpo ha superato il punto mirato:
       da li' in poi il portiere e' in recover, e in recover copre 0,58
       dell'ellisse invece di 1. Chi si butta troppo presto arriva sul
       posto e ASPETTA il pallone da terra, con poco piu' di meta' corpo.
       ${segno < 0
    ? `Percio' il verso giusto e' questo: il portiere con RIFLESSI alti
       aspetta (finestra 0,45 s a 99) e parte quando il tuffo copre
       esattamente il volo; quello con RIFLESSI bassi si butta presto
       (0,79 s a 25) e si stende ad aspettare. E' anche quello che si
       dice di un portiere vero: si butta presto.`
    : `Questa e' la teoria OPPOSTA — sveglio vuol dire accorgersi prima,
       finestra 0,79 s a 99 e 0,45 a 25 — ed e' quella BOCCIATA: vedi
       i numeri in testa alla toppa.`}
       A 62, la media della rosa, fatt vale 1 esatto: 0,62 s, cioe' il
       gioco spedito. */
    const lettura = GK_LETTURA*fatt(p.tecnica, ${segno < 0 ? '-' : ''}GK_RIFL_LET);
    if(predY>GY0-16 && predY<GY1+16 && tArr<lettura){`;

/* ------------------------------------------------------------------ */
/* 3 — P e S: LE MANI. La soglia di blocco, la zona di mani pulite e la
   banda in cui il pallone SFUGGE. Le tre grandezze prendono un nome qui
   perche' i quattro esiti la' sotto le leggono tutte e tre. */
const CERCA_SOGLIA = `  if(sp<330 && Math.abs(largo)<B*0.75){`;

const capoP = conP
  ? `  /* PRESA: LA SOGLIA DI BLOCCO E LA ZONA DI MANI PULITE SONO SUE.
     330 resta il centro della scala e non e' un numero di gusto: e'
     TIRO_ARRIVO[1], la velocita' d'arrivo dichiarata del tiro perfetto.
     Un portiere da 99 di PRESA blocca fino a 439 unita'/s con una zona
     di mani pulite larga 0,91 del semiasse; uno da 25 si ferma a 221 e
     0,59. A 62 escono 330 e 0,75, cioe' i due numeri di ieri.
     ATTENZIONE, E' UNA LEVA BOCCIATA: vedi i numeri in testa alla
     toppa. In questo gioco prendere il pallone COSTA, perche' il
     rinvio lo regala. */
  const sogliaPresa = 330*fatt(p.tackle, GK_PRESA_V);
  const zonaMani = B*(0.75*fatt(p.tackle, GK_PRESA_L));`
  : `  /* Le grandezze delle mani hanno un nome perche' i quattro esiti qui
     sotto le leggono tutte. Qui valgono i numeri del gioco spedito:
     330 (= TIRO_ARRIVO[1]) e 0,75 del semiasse. */
  const sogliaPresa = 330;
  const zonaMani = B*0.75;`;

const capoW = !conW ? '' : `
  /* PRESA: QUANTO LONTANO LI MANDA — i polsi.
     Una respinta corta lascia il pallone dove si puo' ribattere; una
     lunga lo toglie dall'area. Finora era lo stesso identico intervallo
     per ogni portiere del gioco. fatt(v,+0,45) vale 0,56 a 25, 1,00 a
     62 (il gioco spedito, intervallo 150-250) e 1,44 a 99: il portiere
     con le mani buone respinge a 216-360 unita'/s, quello scarso a
     84-140 e se lo ritrova addosso.
     Moltiplica un sorteggio, non ne aggiunge uno; e non tocca ne' il
     tempo ne' il possesso, quindi non ha la coda che ha rovesciato il
     segno alle altre leve (vedi le bocciature). */
  const polsi = fatt(p.tackle, GK_PRESA_W);`;

const capoS = !conB ? '' : (conS
  ? `
  /* PRESA: QUANTO FACILMENTE IL PALLONE GLI SFUGGE — ed e' QUESTA la
     leva onesta di PRESA, non la soglia di blocco.
     Sopra la soglia il portiere ci prova lo stesso con le mani, e
     dentro la banda qui sotto non lo tiene: il pallone gli cade
     davanti (l'esito SFUGGE). Con GK_PRESA_S = 0,75 la banda vale
     1,16 volte la soglia a 99 (quasi mai gli sfugge), 1,60 a 62 —
     cioe' il valore di serie — e 2,04 a 25 (gli sfugge spesso).
     Cambia SOLO che cosa succede quando NON prende: il numero di
     prese resta quello di ieri, e con lui il rinvio. */
  const bandaSfugge = 1 + (GK_SFUGGE-1)*fatt(p.tackle, -GK_PRESA_S);`
  : `
  const bandaSfugge = GK_SFUGGE;`);

const METTI_SOGLIA_TESTA = capoP + capoW + capoS + `
  if(sp<sogliaPresa && Math.abs(largo)<zonaMani){`;

/* ------------------------------------------------------------------ */
/* 3-bis — A: E LA PRESA, CHE NON CRESCEVA MAI.                        */
const CERCA_CRESCITA = `  if(S.parate[0]>0) candidati.push({i:0, k:'tecnica'});`;
const METTI_CRESCITA =
`  if(S.parate[0]>0) candidati.push({i:0, k:'tecnica'});
  /* E LA PRESA, CHE NON CRESCEVA MAI.
     I cinque candidati della crescita davano al portiere una sola
     strada, 'tecnica', cioe' RIFLESSI. La barra PRESA (tackle) poteva
     salire soltanto col jolly del tutto casuale, un quinto di un
     quinto: il giocatore la vedeva ferma per decine di partite.
     Il fatto che la fa salire e' la PORTA IMBATTUTA, che e' proprio
     quello che vuol dire tenere il pallone: e' anche il fatto che il
     gioco gia' premia con le monete (COIN_CLEAN).
     Nessun sorteggio nuovo: questa riga non pesca, e le tre pescate
     dei candidati restano dentro le loro condizioni. */
  if(G.score[1]===0) candidati.push({i:0, k:'tackle'});`;

/* ------------------------------------------------------------------ */
/* 4 — B: I QUATTRO ESITI                                             */
const CERCA_ESITI =
`  }else{
    /* RESPINTA: devia verso l'esterno, mai al centro */
    const fuori = (b.y>FH/2?1:-1);
    const dir = p.team===0?1:-1;
    b.x = p.x + dir*(P_R+B_R+3);
    /* LA RESPINTA E' CORTA. Usciva a 245-431 unita' al secondo, cioe'
       fino a 410 unita' di corsa: la palla finiva fuori area e la
       ribattuta non esisteva. A 186-326 la corsa e' 177-310 unita', e il
       pallone resta dove si puo' ribattere. Resta la regola vecchia, che
       e' giusta: si respinge verso l'ESTERNO, mai al centro. */
    b.vx = dir*rnd(150,250);
    b.vy = fuori*rnd(110,210);
    b.vz = rnd(40,110);
    showBanner('RESPINTA!','#39d3e6',0.85);
  }`;

const METTI_ESITI = (W =>
`  }else if(Math.abs(largo)<zonaMani && b.z>GK_PUGNO_Z){
    /* PUGNI: la palla e' ALTA e troppo forte per le mani.
       Sopra il petto (GK_PUGNO_Z = 16, e la presa alta del rig si arma
       a b.z>14) non si trattiene: si smanaccia. E' l'unico dei quattro
       esiti che ALLONTANA il pericolo invece di consegnarlo, e ripara
       una cosa che si vedeva: un pallone alto e teso diventava una
       respintina da 150-250 unita'/s che ricadeva dentro l'area.
       Tre sorteggi, come la respinta di ieri: vx, vy, vz. */
    const fuori = (b.y>FH/2?1:-1);
    const dir = p.team===0?1:-1;
    b.x = p.x + dir*(P_R+B_R+3);
    b.vx = dir*rnd(430,620)${W};
    b.vy = fuori*rnd(140,300)${W};
    b.vz = rnd(150,240);
    /* NIENTE CLIP NUOVA, e non e' pigrizia: p.presaT e' la presa alta,
       cioe' i guantoni sopra la testa CON il pallone fermo nelle mani
       (pallaPresa lo disegna mentre scende dentro le mani). Su un pugno
       il pallone se ne va, e mostrare la clip della presa sarebbe
       disegnare una bugia. Il gesto giusto e' da fare, non da riciclare.
       Con vz fra 150 e 240 e gravita' 560 il volo dura da 0,54 a 0,86 s
       e il pallone tocca terra fra 242 e 590 unita' dal portiere: fuori
       dall'area su tutte e tre le taglie (GK_AREA_X vale 118, 136, 153). */
    showBanner('PUGNI!','#39d3e6',0.85);
  }else if(Math.abs(largo)<zonaMani && sp<sogliaPresa*bandaSfugge){
    /* SE LA FA SFUGGIRE: ci ha provato con le mani e non l'ha tenuta.
       E' la palla in mezzo al corpo, oltre la soglia di blocco ma
       ancora dentro il tratto in cui un portiere PROVA a trattenere
       (GK_SFUGGE = 1,60 volte la sua soglia). Il pallone gli cade
       davanti, vivo e lento: e' la ribattuta piu' pericolosa del
       calcio, e il gioco non ce l'aveva.
       Chi ha PRESA alta ne vede pochissime da tutte e due le parti:
       alza la soglia (piu' prese sotto) e alza il tetto della banda
       (piu' tentativi al posto della respinta di lato).
       Tre sorteggi, come la respinta di ieri. */
    const fuori = (b.y>FH/2?1:-1);
    const dir = p.team===0?1:-1;
    b.x = p.x + dir*(P_R+B_R+3);
    b.vx = dir*rnd(70,150);
    b.vy = fuori*rnd(25,90);
    b.vz = rnd(70,130);
    showBanner('SFUGGE!','#ffb020',0.85);
  }else{
    /* RESPINTA: devia verso l'esterno, mai al centro */
    const fuori = (b.y>FH/2?1:-1);
    const dir = p.team===0?1:-1;
    b.x = p.x + dir*(P_R+B_R+3);
    /* LA RESPINTA E' CORTA. Usciva a 245-431 unita' al secondo, cioe'
       fino a 410 unita' di corsa: la palla finiva fuori area e la
       ribattuta non esisteva. A 186-326 la corsa e' 177-310 unita', e il
       pallone resta dove si puo' ribattere. Resta la regola vecchia, che
       e' giusta: si respinge verso l'ESTERNO, mai al centro. */
    b.vx = dir*rnd(150,250)${W};
    b.vy = fuori*rnd(110,210)${W};
    b.vz = rnd(40,110);
    showBanner('RESPINTA!','#39d3e6',0.85);
  }`)(conW ? '*polsi' : '');

/* ------------------------------------------------------------------ */
/* 4-bis — T: LE MANI DA TERRA. */
const CERCA_TERRA = `    tentaPresa(p,b,0.58);`;
const METTI_TERRA =
`    /* RIFLESSI: QUANTO CORPO TIRA SU DA TERRA.
       0,58 e' la copertura del portiere gia' disteso dopo il tuffo, ed
       e' un numero misurato (vedi il verbale qui sopra: a corpo pieno
       le reti scendevano da 1,17 a 0,67). Ma «quanto ti allunghi
       mentre sei per terra» E' la definizione di riflessi, e finora era
       uguale per tutti. 0,58*fatt vale 0,41 a 25, 0,58 a 62 — la media
       della rosa, cioe' il gioco spedito, bit per bit — e 0,75 a 99.
       Questa leva non ha orologio: allarga un'ellisse e basta. E' il
       motivo per cui funziona dove le altre si sono rovesciate. */
    tentaPresa(p,b, 0.58*fatt(p.tecnica, GK_RIFL_TERRA));`;

/* 5 — I CRONOMETRI CHE DEVONO SCALARE SEMPRE, accanto a gkT.
   C: il latch dell'uscita, perche' i rami del tuffo, della raccolta e
      del recupero escono da updateKeeper PRIMA del posizionamento: un
      latch che scala solo da in piedi sopravvive a un tuffo intero e fa
      ripartire l'uscita su un pallone che non e' piu' di nessuno.
   F: p.kickCd, e questa e' una RIPARAZIONE, non una scelta di gioco.
      Vedi il verbale nel commento che la toppa inserisce. */
const CERCA_LATCH = `  p.gkT=Math.max(0,p.gkT-dt);`;
const LATCH_C =
`
  /* il latch dell'uscita (vedi il faccia a faccia piu' sotto) scala qui,
     accanto a gkT, perche' i rami del tuffo e del recupero ritornano
     prima del posizionamento: scalarlo la' sotto vorrebbe dire tenerlo
     acceso per tutto un tuffo e rimettersi a correre appena rialzati. */
  p.gkFuori=Math.max(0,(p.gkFuori||0)-dt);`;
const LATCH_F =
`
  /* =====================================================================
     LE MANI DEL PORTIERE NON RESTANO SPENTE — e questa e' una
     riparazione, non una scelta di gioco.

     In fondo a updateKeeper c'e' la riga che rende il portiere un corpo
     anche in piedi: if(p.kickCd<=0){ ... tentaPresa(p,b); }. Ma p.kickCd
     del portiere veniva scalato in UN SOLO POSTO — dentro
     if(b.owner===G.players.indexOf(p)) — cioe' soltanto mentre teneva il
     pallone fra le mani. Il ramo del ruolo 'gk' in updatePlayerFisica
     ritorna PRIMA della riga p.kickCd=Math.max(0,p.kickCd-dt) che scala
     quello di tutti gli altri.
     Conseguenza: appena qualcosa gli scrive un kickCd senza dargli la
     palla, quel numero non torna piu' a zero e le sue mani si spengono
     per il resto della partita. Succede in due modi, tutti e due
     comuni: rinvioPortiere gli lascia 0,40 e libera subito il pallone,
     e il rimpallo sul corpo (il ramo dei tiri sopra le 420 unita') gli
     scrive 0,18 addosso come a chiunque altro.
     MISURATO (12 partite a 11 contro 11, semi 20260803..814, gioco
     spedito, fotogrammi in cui il portiere NON ha la palla in mano):
       mani ATTIVE  207.407 fotogrammi   68,9%
       mani SPENTE   93.577 fotogrammi   31,1%
     Un portiere su tre fotogrammi utili non e' un corpo. E i valori di
     kickCd letti al fischio finale sono 0,40 e 0,18: esattamente i due
     numeri qui sopra, mai scalati.
     La riparazione e' scalarlo qui, dove si scala gkT, e togliere il
     decremento dal ramo del possesso (se no si scalerebbe due volte per
     fotogramma e il rinvio partirebbe a meta' tempo).
     ===================================================================== */
  p.kickCd=Math.max(0,p.kickCd-dt);`;

/* 5-bis — F: il rinvio smette di scalare per conto suo */
const CERCA_RINVIO =
`  /* rinvio: se ha la palla tra le mani, la rilancia entro un attimo */
  if(b.owner===G.players.indexOf(p)){
    p.kickCd-=dt;
    if(p.kickCd<=0) rinvioPortiere(p);
  }`;
const METTI_RINVIO =
`  /* rinvio: se ha la palla tra le mani, la rilancia entro un attimo.
     Il cronometro NON si scala piu' qui: lo scala la riga accanto a gkT,
     una volta per fotogramma e in tutti gli stati (vedi il verbale
     lassu'). Scalarlo anche qui vorrebbe dire due volte per fotogramma,
     cioe' un rinvio che parte in 0,45 s invece che in 0,90. */
  if(b.owner===G.players.indexOf(p) && p.kickCd<=0) rinvioPortiere(p);`;

/* 6 — C: L'USCITA SUL FACCIA A FACCIA                                */
const CERCA_USCITA =
`  /* posizionamento: sulla retta palla-centro porta, uscita proporzionata */
  const dx=b.x-goalX, dy=b.y-FH/2, dl=Math.max(1,len(dx,dy));
  const uscita = clamp(dl*0.10, 16, GK_AREA_X*0.62);
  const tx = goalX + dx/dl*uscita*dir*dir;      // sempre verso il campo
  const ty = clamp(FH/2 + dy*0.55, GY0+6, GY1-6);
  const mx=(goalX===0?Math.max(14,tx):Math.min(FW-14,tx))-p.x, my=ty-p.y;
  const ml=len(mx,my);
  if(ml>3){
    const s=Math.min(GK_SPEED, ml*6);`;

const METTI_USCITA =
`  /* =====================================================================
     L'USCITA SUL FACCIA A FACCIA, E IL PREZZO CHE SI PAGA.

     Fino a ieri il portiere non usciva mai: uscita = clamp(dl*0,10, 16,
     GK_AREA_X*0,62), cioe' al massimo 73 unita' dalla linea a 5 contro 5
     e 95 a 11. Un attaccante che arrivava solo davanti alla porta
     trovava sempre lo stesso uomo nello stesso posto, e la sola cosa che
     decideva era il tuffo.

     La condizione e' tre cose insieme, e sono tutte e tre necessarie:
       · il pallone ha un padrone e il padrone e' un avversario (chi
         corre dietro a un pallone vagante non e' un faccia a faccia:
         e' una corsa, e il portiere che esce su quella la regala);
       · sta dentro GK_USCITA_D volte GK_AREA_X dalla porta e dentro la
         luce allargata;
       · NESSUN compagno del portiere sta fra lui e la porta entro
         GK_USCITA_M volte GK_AREA_X. E' questa la riga che distingue
         il faccia a faccia dall'assedio: con un difensore addosso al
         portatore, uscire e' lasciare la porta a chi riceve.

     IL PREZZO NON E' SIMULATO. Il latch p.gkFuori tiene il portiere
     fuori per GK_USCITA_T secondi dopo che la condizione cade, e il
     rientro e' al passo normale: chi lo salta con un passaggio o con un
     pallonetto (Z_SOPRA_PORTIERE = 34, il pallonetto c'e' gia') trova
     la porta vuota. Il latch serve anche a non far tremolare la
     decisione a ogni cambio di possesso.

     COSTO: un giro sui giocatori, e solo quando il pallone ha un padrone
     e quel padrone e' gia' dentro la distanza. Nel caso peggiore due
     portieri x 22 uomini = 44 confronti per fotogramma, contro i 35,7
     rimpalli e i 67,8 palloni vaganti che una partita a 11 conta gia'.
     ===================================================================== */
  if(b.owner>=0){
    const att = G.players[b.owner];
    if(att.team!==p.team && att.out<=0){
      const dgol = Math.abs(att.x-goalX);
      if(dgol < GK_AREA_X*GK_USCITA_D && Math.abs(att.y-FH/2) < GOAL_H*1.10){
        let coperto = false;
        for(const q of G.players){
          if(q.team!==p.team || q===p || q.out>0) continue;
          if(Math.abs(q.x-goalX) < dgol && len(q.x-att.x, q.y-att.y) < GK_AREA_X*GK_USCITA_M){ coperto=true; break; }
        }
        if(!coperto) p.gkFuori = GK_USCITA_T;
      }
    }
  }
  const fuoriPosto = p.gkFuori>0;

  /* posizionamento: sulla retta palla-centro porta, uscita proporzionata */
  const dx=b.x-goalX, dy=b.y-FH/2, dl=Math.max(1,len(dx,dy));
  /* uscendo, il portiere segue il pallone anche IN LARGHEZZA (0,85
     invece di 0,55): chiudere l'angolo senza portarsi sulla retta
     sarebbe uscire dalla parte sbagliata, cioe' regalare la porta */
  const uscita = fuoriPosto ? clamp(dl*0.42, 16, GK_AREA_X*0.96)
                            : clamp(dl*0.10, 16, GK_AREA_X*0.62);
  const tx = goalX + dx/dl*uscita*dir*dir;      // sempre verso il campo
  const ty = clamp(FH/2 + dy*(fuoriPosto?0.85:0.55), GY0+6, GY1-6);
  const mx=(goalX===0?Math.max(14,tx):Math.min(FW-14,tx))-p.x, my=ty-p.y;
  const ml=len(mx,my);
  if(ml>3){
    const s=Math.min(fuoriPosto?GK_SPEED*GK_RUSH:GK_SPEED, ml*6);`;

/* ------------------------------------------------------------------ */
const ANCORE = [{ nome: 'le costanti del portiere, tutte dichiarate', cerca: CERCA_COST, metti: METTI_COST }];
if (conR) ANCORE.push({ nome: 'R l\'errore di lettura legge RIFLESSI', cerca: CERCA_ERR, metti: METTI_ERR });
if (conL || conM) ANCORE.push({ nome: (conM?'M':'L') + ' la finestra di lettura legge RIFLESSI', cerca: CERCA_FIN, metti: mettiFin(conM ? -1 : 1) });
ANCORE.push({ nome: ((conP?'P':'') + (conS?'S':'') + (conW?'W':'') || '-') + ' le mani: soglia, zona, banda di sfuggita, polsi', cerca: CERCA_SOGLIA, metti: METTI_SOGLIA_TESTA });
if (conP) ANCORE.push({ nome: 'P la PRESA cresce con la porta imbattuta', cerca: CERCA_CRESCITA, metti: METTI_CRESCITA });
if (conB) ANCORE.push({ nome: (conW?'BW':'B') + ' i quattro esiti della parata', cerca: CERCA_ESITI, metti: METTI_ESITI });
if (conT) ANCORE.push({ nome: 'T le mani da terra leggono RIFLESSI', cerca: CERCA_TERRA, metti: METTI_TERRA });
if (conC || conF) ANCORE.push({
  nome: (conC ? 'C' : '') + (conF ? 'F' : '') + ' i cronometri che scalano accanto a gkT',
  cerca: CERCA_LATCH,
  metti: CERCA_LATCH + (conC ? LATCH_C : '') + (conF ? LATCH_F : '')
});
if (conF) ANCORE.push({ nome: 'F il rinvio non scala piu\' il cronometro da solo', cerca: CERCA_RINVIO, metti: METTI_RINVIO });
if (conC) ANCORE.push({ nome: 'C l\'uscita sul faccia a faccia', cerca: CERCA_USCITA, metti: METTI_USCITA });

if (haFlag('elenco')) {
  console.log('_t-portiere.js variante ' + VAR + ' — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.gk-' + VAR + '.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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

/* --- gli attesi: quello che DEVE esserci dopo la sostituzione --- */
const attesi = [
  ['const GK_PUGNO_Z = 16;', conB ? 1 : 0],
  ['const GK_RIFL_TERRA = 0.30;', conT ? 1 : 0],
  ['const GK_RIFL_ERR = 0.55;', conR ? 1 : 0],
  ['const GK_RIFL_LET = 0.28;', (conL || conM) ? 1 : 0],
  ['const GK_PRESA_V  = 0.34;', conP ? 1 : 0],
  ['const GK_PRESA_S = 0.75;', conS ? 1 : 0],
  ['const GK_PRESA_W = 0.45;', conW ? 1 : 0],
  ['const GK_USCITA_D = 2.60;', conC ? 1 : 0],
  ['const sogliaPresa =', 1],
  ['const zonaMani =', 1],
  ['if(sp<sogliaPresa && Math.abs(largo)<zonaMani){', 1],
  ['if(sp<330 && Math.abs(largo)<B*0.75){', 0],
];
if (conR) attesi.push(
  ['const err = (1-D.save)*rnd(-46,46)*fatt(p.tecnica, -GK_RIFL_ERR);', 1],
  ['const err = (1-D.save)*rnd(-46,46);       //', 0]
);
else attesi.push(['const err = (1-D.save)*rnd(-46,46);       //', 1]);
if (conT) attesi.push(['tentaPresa(p,b, 0.58*fatt(p.tecnica, GK_RIFL_TERRA));', 1], ['tentaPresa(p,b,0.58);', 0]);
else attesi.push(['tentaPresa(p,b,0.58);', 1]);
if (conW) attesi.push(['const polsi = fatt(p.tackle, GK_PRESA_W);', 1], ['b.vx = dir*rnd(150,250)*polsi;', 1]);
else attesi.push(['*polsi', 0]);
if (conS) attesi.push(['const bandaSfugge = 1 + (GK_SFUGGE-1)*fatt(p.tackle, -GK_PRESA_S);', 1]);
else if (conB) attesi.push(['const bandaSfugge = GK_SFUGGE;', 1]);
if (conP) attesi.push(
  ['const sogliaPresa = 330*fatt(p.tackle, GK_PRESA_V);', 1],
  ["if(G.score[1]===0) candidati.push({i:0, k:'tackle'});", 1]
);
else attesi.push(
  /* senza la leva P le mani del portiere restano quelle di ieri. Non si
     conta 'fatt(p.tackle' in tutto il file: quella chiamata esiste gia'
     per il contrasto degli uomini di movimento. */
  ['const sogliaPresa = 330;', 1],
  ['fatt(p.tackle, GK_PRESA_V)', 0],
  ['fatt(p.tackle, GK_PRESA_L)', 0]
);
if (conL) attesi.push(['const lettura = GK_LETTURA*fatt(p.tecnica, GK_RIFL_LET);', 1], ['tArr<GK_LETTURA){', 0]);
else if (conM) attesi.push(['const lettura = GK_LETTURA*fatt(p.tecnica, -GK_RIFL_LET);', 1], ['tArr<GK_LETTURA){', 0]);
else attesi.push(['fatt(p.tecnica, GK_RIFL_LET)', 0], ['tArr<GK_LETTURA){', 1]);
if (conB) attesi.push(
  ["showBanner('PUGNI!','#39d3e6',0.85);", 1],
  ["showBanner('SFUGGE!','#ffb020',0.85);", 1],
  ["showBanner('RESPINTA!','#39d3e6',0.85);", 1]
);
else attesi.push(["showBanner('PUGNI!'", 0], ["showBanner('SFUGGE!'", 0]);
if (conC) attesi.push(
  ['p.gkFuori=Math.max(0,(p.gkFuori||0)-dt);', 1],
  ['const fuoriPosto = p.gkFuori>0;', 1],
  ['const uscita = clamp(dl*0.10, 16, GK_AREA_X*0.62);', 0],
  ['const s=Math.min(fuoriPosto?GK_SPEED*GK_RUSH:GK_SPEED, ml*6);', 1]
);
else attesi.push(['p.gkFuori', 0], ['const uscita = clamp(dl*0.10, 16, GK_AREA_X*0.62);', 1]);
if (conF) attesi.push(
  ['  p.kickCd=Math.max(0,p.kickCd-dt);\n  /* L1.2', 1],   // quella degli uomini di movimento, intatta
  ['if(b.owner===G.players.indexOf(p) && p.kickCd<=0) rinvioPortiere(p);', 1],
  ['    p.kickCd-=dt;\n    if(p.kickCd<=0) rinvioPortiere(p);', 0]
);
else attesi.push(
  ['    p.kickCd-=dt;\n    if(p.kickCd<=0) rinvioPortiere(p);', 1]
);

const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

/* --- IL CANCELLO DEI SORTEGGI, e non e' una formalita'.
   Regola della casa: il conto dei Math.random() non deve cambiare, e un
   sorteggio non si sposta mai fuori da un corto circuito &&. Qui si
   verifica la cosa vera, che non e' il conto testuale (la variante B
   scrive tre rami dove ce n'era uno) ma il conto PER ESITO: ogni ramo
   di respinta pesca esattamente tre volte come la respinta di ieri, e
   il ramo della presa zero. Si conta dentro tentaPresa, che e' l'unica
   funzione toccata che pesca. --- */
function corpoDi(testo, firma) {
  const i = testo.indexOf(firma);
  if (i < 0) return null;
  let d = 0, dentroCorpo = false;
  for (let k = i; k < testo.length; k++) {
    const c = testo[k];
    if (c === '{') { d++; dentroCorpo = true; }
    else if (c === '}') { d--; if (dentroCorpo && d === 0) return testo.slice(i, k + 1); }
  }
  return null;
}
const tpNuovo = corpoDi(out, 'function tentaPresa(p,b,disteso){');
const tpVecchio = corpoDi(src, 'function tentaPresa(p,b,disteso){');
if (!tpNuovo || !tpVecchio) { console.error('FALLITO: non si legge il corpo di tentaPresa'); process.exit(1); }
const rami = tpNuovo.split(/\}else(?: if\([^\n]*\))?\{/);
const pescateVecchie = (tpVecchio.match(/rnd\(/g) || []).length;      // 3 nel gioco spedito
const pescatePerRamo = rami.map(r => (r.match(/rnd\(/g) || []).length);
/* il primo pezzo e' l'intestazione + il ramo della presa: zero pescate.
   Ogni ramo successivo (respinta, e nella variante B pugni e sfugge)
   ne deve avere esattamente quante ne aveva la respinta di ieri. */
if (pescatePerRamo[0] !== 0) {
  console.error('FALLITO: il ramo della PRESA pesca ' + pescatePerRamo[0] + ' numeri, ieri ne pescava 0'); process.exit(1);
}
for (let i = 1; i < pescatePerRamo.length; i++) {
  if (pescatePerRamo[i] !== pescateVecchie) {
    console.error('FALLITO: il ramo ' + i + ' pesca ' + pescatePerRamo[i] + ' numeri, la respinta di ieri ne pescava ' + pescateVecchie);
    process.exit(1);
  }
}
/* e nessuna pescata dev'essere comparsa in updateKeeper oltre a quella
   che c'era gia' (la lettura della traiettoria) */
const ukNuovo = corpoDi(out, 'function updateKeeper(p, dt){');
const ukVecchio = corpoDi(src, 'function updateKeeper(p, dt){');
const rN = (ukNuovo.match(/rnd\(|Math\.random\(/g) || []).length;
const rV = (ukVecchio.match(/rnd\(|Math\.random\(/g) || []).length;
if (rN !== rV) { console.error('FALLITO: updateKeeper pesca ' + rN + ' numeri, ieri ne pescava ' + rV); process.exit(1); }
/* F: dentro updateKeeper il cronometro del piede si scala una volta
   sola per fotogramma, mai due (se no il rinvio parte a meta' tempo) */
const scaliKick = (ukNuovo.match(/p\.kickCd\s*=\s*Math\.max\(0,\s*p\.kickCd-dt\);|p\.kickCd-=dt;/g) || []).length;
if (scaliKick !== (conF ? 1 : 1)) {
  console.error('FALLITO: dentro updateKeeper il cronometro del piede si scala ' + scaliKick + ' volte, ne serve 1');
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  variante ' + VAR + ', ' + ANCORE.length + ' ancoraggi applicati');
console.log('    sorteggi: presa 0, ogni respinta ' + pescateVecchie + ' (come ieri); updateKeeper ' + rN + ' (come ieri)');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
