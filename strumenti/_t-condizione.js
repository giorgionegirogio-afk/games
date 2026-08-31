/* =====================================================================
   _t-condizione.js — LA CONDIZIONE, L'ACCIACCO E IL CAMBIO: tre assenze
   che erano una sola (27 agosto 2026).

   ---------------------------------------------------------------------
   RIANCORATA E CORRETTA IL 28 AGOSTO 2026. Tre cose, in ordine di peso.

   1. LA PANCHINA PESCAVA COGNOMI GIA' IN CAMPO (difetto reale, chiuso).
      L'ancora 8 riusava il registro delle PESCHE invece di quello degli
      uomini in campo, e a 11 contro 11 lasciava tre cognomi liberi per
      sei rincalzi: pescaNome ripiegava in silenzio e uscivano 1:Rocco
      Piedebuono e 1:Vito Piedebuono nella stessa squadra. Misurato,
      chiuso e sorvegliato — il perche' sta per intero nell'ancora 8, la
      sonda e' strumenti/_p-nomi.js (nuova, in batteria in tutti.js) e la
      campanella e' il contatore G.__nomiEsauriti dell'ancora 13. La cura
      NON tocca il gioco: la copia col difetto e quella riparata danno lo
      stesso identico vettore di eventi su 100 partite a 11 contro 11.

   2. IL CONTO DEI SORTEGGI NON SI CONTAVA PIU'. Il controllo di casa
      guardava 'Math.random(' — ma dal 28 agosto (_t-seme.js) il caso
      passa tutto da dado(), e nel gioco restano cinque Math.random di
      cui quattro in commento. La guardia era diventata un timbro. Adesso
      si contano gli 86 dado(), e il vecchio conto resta acceso accanto.

   3. GLI ACCIACCHI ERANO DICHIARATI DUE VOLTE CON NUMERI INVERTITI.
      Rimisurati una volta sola su cento partite per taglia, e lo stesso
      numero e' adesso scritto in tutti e tre i punti del commento.

   E UNA COSA CHE NON SI E' POTUTA CHIUDERE, detta qui e non in fondo:
   il cancello _q-meta.js --tre-taglie e' ROSSO su questa toppa, 11 contro
   11, partite 0-0 al 40% e al 33,3% su due blocchi di semi contro un
   tetto del 33% (il gioco spedito, stessi due blocchi, fa 30% e 27%).
   E' il prezzo della fatica, non della cura dei nomi. Vedi «I CANCELLI
   DI CASA» in fondo: finche' quel rosso non e' chiuso questa toppa non
   entra.
   ---------------------------------------------------------------------

   LA SCOPERTA. Il gioco NON e' senza fatica: ha gia' p.fiato, 0-100, che
   lo scatto brucia a 26 al secondo e la camminata ricarica a 18. Ma il
   fiato e' una fatica che TORNA: in tre secondi di passo sei di nuovo
   come al fischio d'inizio. Manca l'altra, quella che non torna — e
   siccome non c'e' niente che si consumi per davvero, non c'e' nessun
   motivo per cambiare un uomo, e infatti la panchina nel gioco esiste
   solo come scenografia disegnata (una riga di updatePlayerFisica la usa
   per parcheggiare l'espulso temporaneo). Le tre voci che il confronto
   con FC Mobile segna a zero — «Infortuni», «Sostituzioni», «Panchina e
   riserve» — non sono tre buchi: sono lo stesso buco visto da tre
   finestre. Chi non si stanca non si fa male, e chi non si fa male non
   si cambia.

   IL CONTO CHE VIENE PRIMA DEL CODICE, ed e' l'unico modo di tarare una
   fatica su partite da 90-180 secondi invece che su novanta minuti.
   Misurato con strumenti/_diag-carico.js (12 partite per taglia, semi
   20260803.., CPU contro CPU, Normale, gioco spedito), mediane per
   giocatore di movimento:

     taglia   secondi vivi   spazio percorso   secondi in scatto   u/s
      5v5         98,2          10.873              29,9          110,7
      7v7        144,4          15.711              36,8          108,8
     11v11       198,0          21.022              39,9          106,2

   La terza colonna e' la scoperta dentro la scoperta: L'ANDATURA E' LA
   STESSA A TUTTE E TRE LE TAGLIE (110,7 / 108,8 / 106,2 unita' al
   secondo, forbice 4%). Lo spazio percorso non dipende dal campo: dipende
   dal CRONOMETRO, e il cronometro dal 26 agosto scala col campo
   (durataPartita). Diviso per il fattore di taglia lo spazio torna:
   10.873 / 1,0 = 10.873 · 15.711 / 1,4 = 11.222 · 21.022 / 2,0 = 10.511,
   cioe' gli stessi metri a meno del 6%.
   Percio' la CAPACITA' non si taglia sui metri: si taglia sulla PARTITA.
   Un uomo ha in gamba una partita, qualunque sia la taglia e qualunque
   durata abbia scelto il menu — ed e' anche la sola definizione che
   regge il 180 secondi a 5 contro 5, dove chi ha scelto il doppio del
   tempo si aspetta giustamente di finire il doppio piu' cotto.

   QUANTO DEVE SCENDERE PERCHE' SI SENTA, e il conto e' questo. La
   condizione non tocca quasi la velocita' di punta (5% in fondo alla
   scala, che su una rincorsa di 300 unita' vale nove centesimi di
   secondo: da sola non si vedrebbe mai). Tocca il FIATO, che il gioco
   gia' spende e gia' recupera, e li' il conto e' grosso. A condizione 40:
     · lo scatto costa 26*(1,5-0,5*0,4) = 33,8/s invece di 26/s, quindi
       una sprintata dura 2,8 s invece di 3,6;
     · il fiato torna a 18*(0,45+0,55*0,4) = 12,1/s invece di 18/s,
       quindi risalire dai 6 punti ai 32 che l'IA pretende per ripartire
       costa 2,16 s invece di 1,44.
   Ciclo di lavoro dello scatto: da 3,6/(3,6+1,44) = 71% a
   2,8/(2,8+2,16) = 56%. UN QUINTO DEGLI SCATTI SPARISCE. Quello si vede:
   e' l'uomo che al terzo minuto non fa piu' la seconda corsa.

   E SI VEDE ANCHE COL CORPO, che era la voce «Stanchezza che cambia la
   corsa» del confronto («il fiato c'e' e mangia velocita', ma NON esiste
   nessuna posa di stanchezza»). La falcata si accorcia: p.amp perde fino
   al 18% della sua parte in eccesso, e siccome il saliscendi del bacino
   (p.bob) e lo schiacciamento dell'appoggio (sq) leggono entrambi
   (amp-1,1)/6,5, il corpo intero si fa pesante con una moltiplicazione
   sola. A riposo la figura e' identica al bit (si scala l'ECCESSO sopra
   1,1, non l'ampiezza): un uomo fermo stanco e un uomo fermo fresco
   stanno in piedi allo stesso modo, che e' giusto.

   L'ACCIACCO NON SI TIRA A DADI, ed e' un requisito prima che una scelta
   di stile: «gli infortuni non devono essere una punizione arbitraria»,
   e in piu' in questa casa il conto dei Math.random() non si tocca (vedi
   la nota in strumenti/_t-carica.js: un sorteggio in piu' sfasa i banchi
   a seme fisso e i confronti appaiati diventano bugie). QUESTA TOPPA NON
   AGGIUNGE NEMMENO UN Math.random. L'acciacco e' una SOGLIA, non un
   dado: si prende sull'ultimo scatto di un serbatoio vuoto — fiato sotto
   35 e condizione sotto COND_STRAPPO. La soglia del fiato e' 35 e non 9
   per una ragione misurata: aiVuoleSprint smette di VOLERE lo scatto
   gia' a 32, quindi una macchina non scende mai piu' in basso, e con 9
   l'acciacco sarebbe capitato soltanto all'uomo col pollice premuto —
   zero acciacchi in dodici partite CPU contro CPU a qualunque capacita'.
   Un infortunio che colpisce solo chi gioca non e' una regola: e' una
   tassa. Chi ha amministrato non si fa male mai; chi ha scattato per tre
   minuti si fa male, e sa perche'. QUANTO SPESSO, rimisurato il 28
   agosto 2026 su CENTO partite per taglia (semi 20260803.., CPU contro
   CPU, Normale, gioco di oggi con questa toppa — tabella in fondo):
   0,3 acciacchi a partita a 5 contro 5, 0,4 a 7, 0,1 a 11 — cioe' uno
   ogni tre o quattro partite sul campo piccolo e uno ogni dieci sul
   grande, che e' la frequenza giusta per una cosa che si ricorda.
   UNA RETTIFICA, CON LA DATA, perche' qui c'erano due numeri diversi per
   la stessa cosa e nessuno poteva sapere quale fosse il vecchio. Fino al
   27 agosto questa riga diceva «0,3 a 11 contro 11, 0,2 a 5 contro 5»
   mentre la tabella in fondo diceva «5v5 0,5 · 7v7 0,4 · 11v11 0,1»: le
   due taglie erano INVERTITE nella prosa. Erano misure su dodici
   partite, dove un acciacco solo sposta la media di 0,08 e la barra
   d'errore vale mezzo acciacco a partita. Su cento partite l'ordine e'
   quello della tabella e non quello della prosa, e da oggi i tre punti
   del commento portano lo stesso numero. Il campo grande fa male meno
   perche' si scatta a intervalli piu' lunghi: 34,8 secondi in scatto a
   11 contro 11 contro 23,5 a 5 contro 5, ma su una partita che dura il
   doppio — cioe' meta' del tempo col piede sul gas.
   Un contatto duro anticipa il conto invece di sostituirlo: il fallo
   subito toglie condizione al fallito (il doppio se e' cattivo) e un po'
   anche a chi e' entrato. Cosi' l'uomo preso a spallate per tutta la
   partita arriva al limite prima — che e' esattamente come funziona — e
   il fallo pesa oltre il fischio.

   IL CAMBIO SI FA SENZA FERMARE NIENTE, e non e' un menu che manca: e'
   il gesto giusto per questa camera. FC Mobile apre una lista e ci si
   trascina sopra una carta; qui la camera insegue il pallone, quindi il
   quarto uomo alza il cartello mentre si gioca dall'altra parte —
   l'uomo si cambia solo se e' LONTANO dall'azione (CAMBIO_LONTANO unita'
   dal pallone, che scalano col campo), non ha la palla, non l'aspetta,
   non e' per terra e non e' sotto il dito. Tre per squadra, come nel
   calcio vero prima del 2020.
   QUANTO E' LONTANO 260, misurato e non a occhio: il quadro e' largo
   915 px su una scala di 1,0287 px per unita' di campo (window.__test.
   view.S2 al fischio d'inizio, telefono da 915x412), cioe' 889 unita' di
   campo, 445 per lato. A 11 contro 11 la soglia vale 520 unita' (scala
   con KPASSO) e l'uomo e' quindi FUORI QUADRO; a 5 contro 5 vale 260 ed
   e' nella meta' esterna dell'immagine, dove l'occhio non sta perche'
   sta sul pallone. Non si promette l'invisibilita' a tutte le taglie: si
   promette che il cambio non succede mai dentro l'azione.
   Il rincalzo entra NELLA STESSA CASELLA di G.players: stesso indice,
   stesso numero di maglia, stesso posto nel modulo. Non e' pigrizia, e'
   l'unica scelta sicura — G.ctrl[t] e' un indice, G.ball.owner e' un
   indice, l'attribuzione delle reti e' un indice, e G.players.indexOf(p)
   compare in undici punti del file: mutare l'array a partita in corso
   sarebbe un difetto con dodici facce. Cambia l'UOMO (nome, quattro
   attributi, faccia cotta dal nome, condizione, cartellini personali),
   resta la CASELLA. Il numero di maglia resta quello della casella, e
   questo si', e' una bugia dichiarata: numeroDi() garantisce ventidue
   numeri distinti e strumenti/_identita.js lo verifica, quindi
   rinumerare il rincalzo e' una passata a se'.
   IL RINCALZO E' PIU' FRESCO MA PIU' SCARSO (94% degli attributi del
   titolare): senza quel 6% la scelta non sarebbe una scelta, si
   cambierebbe tutti al primo minuto e la panchina diventerebbe un
   bonus. Cosi' invece e' un baratto — gambe contro piedi — e le tre
   sostituzioni sono una risorsa da spendere.

   QUANTO COSTA, detto prima di quanto rende, perche' costa davvero. In
   questo gioco tutto cio' che toglie corsa toglie tiri e con i tiri i
   gol: sei cure sono morte cosi' (l'elenco sta in _t-cronometro.js), e
   una fatica e' per definizione una cosa che toglie corsa. Il conto
   pagato, misurato e non stimato, e' il 5% dei gol e il 6% dei momenti
   davanti alla porta a 5 contro 5, e nulla di misurabile a 11 contro 11
   (tabella in fondo). Non e' gratis e non si finge che lo sia. In cambio
   arrivano tre sottosistemi che il confronto con FC Mobile segna a zero,
   la quota di partite a reti bianche non peggiora a nessuna taglia (6%
   contro 6% a 5 contro 5 su 400 partite, 23% contro 22% a 11 su 100 —
   il tetto del cancello e' 33), e gli ultimi trenta secondi smettono di
   essere uguali ai primi trenta.
   LA PANCHINA E' LA META' CHE RIPAGA, e si vede in un'ablazione:
   la stessa fatica SENZA cambi, 100 partite a 5 contro 5, faceva 3,87
   momenti al minuto contro i 3,90 con i cambi — cioe' il pareggio —
   mentre la prima stesura dei cambi (rincalzi ad attributi assoluti)
   scendeva a 3,52. Le gambe fresche rimettono in campo cio' che la
   fatica toglie, ma solo se il rincalzo e' un pari ruolo: la panchina
   paga il proprio costo, non di piu'.

   FATTI DA EMETTERE quando arrivera' IL REGISTRO DEI FATTI (il
   committente lo sta scrivendo in parallelo: qui non se ne costruisce
   uno proprio, si lascia detto dove):
     · {che:'acciacco',  chi:idx, dove:[x,y], esito:{cond, fiato}}
       in prendiAcciacco(), l'istante in cui la gamba cede;
     · {che:'cambio',    chi:idx, dove:[x,y],
        esito:{esce, entra, cond, motivo:'acciacco'|'riserva'}}
       in faiCambio(), e il motivo lo sa gia' chi chiama.

   COSA NON CAMBIA: nessun Math.random in piu' (conto invariato, e il
   sorteggio piu' vicino — p.aiT in resetKickoff — non viene sfiorato);
   il portiere non si stanca in pratica (la condizione si consuma a
   metri e lui non ne fa) e non si cambia mai in pratica; a movimento
   ridotto (SAVE.moto spento) la falcata non si tocca, perche' quel ramo
   esce prima; e la rete del rincalzo va alla CASELLA che ha preso, cioe'
   all'uomo di rosa che ha sostituito — vedi la bocciatura qui sotto.

   ---------------------------------------------------------------------
   UNA CURA BOCCIATA, coi suoi numeri, perche' nessuno la riprovi.

   «LA RETE DEL RINCALZO NON VA AL TITOLARE». Sembrava ovvio: il rincalzo
   non e' nella tua rosa di cinque, quindi la sua rete non e' di nessuno,
   esattamente come un'autorete. Scritta come guardia in faiCrescereRosa
     if(pl.rincalzo){ accreditate++; continue; }
   e messa al banco, ROMPE UN CANCELLO DI CASA:
     node strumenti/_q-meta.js --tre-taglie
     NO  nessuna rete si perde per strada fra tabellone e rosa
         [14 sul tabellone, 9 in rosa]     (col gioco spedito: 16 e 16)
   Cinque reti sparite fra il tabellone e la schermata della rosa. Il
   cancello ha ragione e la cura no: il gioco tratta gia' la CASELLA come
   l'identita' — a 11 contro 11 gli indici da 5 a 10 non hanno nessun
   uomo di rosa dietro, e le loro reti finiscono comunque nel conto per
   la via di riserva. Un rincalzo che eredita la casella eredita anche il
   tabellino di quella casella, ed e' la bugia piu' piccola disponibile:
   l'alternativa misurata non e' «la rete a nessuno», e' «la rete
   PERDUTA», che sulla schermata piu' guardata del meta-gioco vuol dire
   una carriera che non torna. Chi vorra' riprovarci porti prima una
   panchina con una scheda sua, cioe' righe di rosa vere per i rincalzi.

   «CHI E' COTTO AMMINISTRA: smette di inseguire, non di attaccare». Era
   la cura piu' elegante delle due, e sulla carta era giusta — un uomo
   stanco taglia le rincorse a tutto campo e tiene le gambe per la corsa
   in area, quindi si toglie soprattutto RECUPERO DIFENSIVO e il campo
   davanti si apre invece di chiudersi. Scritta come guardia crescente
   sul solo ramo dell'inseguimento in aiVuoleSprint
     return d>90 && d<300 && p.fiato > 32 + (100-p.cond)*0.25;
   (a condizione 100 la soglia resta il 32 di sempre; a 40 diventa 47).
   Misurata, 100 partite per riga, semi 20260803, stessa taratura:

                      5 contro 5              11 contro 11
                   momenti/min  gol      0-0    tiri   gol
     senza la riga    3,90      2,75     23%    14,6   1,21
     con la riga      3,96      2,86     29%    13,7   1,18
     gioco spedito    4,32      3,02     22%    15,1   1,24
     (il gioco spedito a 11, rimisurato su 300 partite invece di 100:
      0-0 26%, tiri 15,4 — il 22% del campione da cento era fortuna, ed
      e' il motivo per cui questa bocciatura non si appoggia allo 0-0)

   LA LETTURA ONESTA, coi sigma detti. Sullo 0-0 a cento partite la
   dispersione binomiale vale 4,4 punti: 23% e 29% distano un sigma
   scarso l'uno dall'altro e nessuno dei due e' distinguibile dal 26%
   vero. Quel numero NON dimostra niente, e sarebbe stato comodo far
   finta di si'. Cio' che si vede davvero sono i tiri — 13,7 con la
   riga contro 15,4 del gioco spedito, che a cento partite sono quasi
   tre sigma — e soprattutto cio' che NON si vede: il guadagno a 5
   contro 5 per cui la riga esisteva, sei centesimi di momento al
   minuto, cioe' meno di un sigma. Una cura che non produce l'effetto
   per cui e' stata scritta non ha diritto al beneficio del dubbio
   sull'effetto collaterale.
   E il meccanismo dice la stessa cosa, in una riga del banco: a 11
   contro 11 il pallone e' di NESSUNO il 78% del tempo, contro il 63%
   del 5 contro 5. Su quel campo l'inseguimento non e' una corsa di
   lusso da amministrare: e' il modo in cui la palla si prende.
   Tagliarlo e' tagliare il gioco. La riga e' stata tolta, non spenta
   con un interruttore: una manopola in piu' su una cura che non rende
   e' solo un posto in cui qualcuno riprovera'.

   ---------------------------------------------------------------------
   LA TARATURA, per chi vorra' rifarla. Le manopole si passano da riga di
   comando e finiscono dentro il gioco, cosi' ogni numero scritto qui
   sopra e' riproducibile e nessuno deve fidarsi di questo commento:
     --cap 21000       capacita' in unita' di spazio pesato a 90 secondi
     --spr 2           quanto pesa lo scatto rispetto alla corsa
     --morso 1         quanto la condizione morde il fiato (0 = per niente)
     --riserva 30      sotto questa condizione il direttore cambia l'uomo
     --strappo 22      sotto questa condizione l'ultimo scatto e' acciacco
     --qualita 94      percento dell'uomo che il rincalzo sostituisce
     --lontano 260     distanza dal pallone sotto cui non si cambia (5v5;
                       scala con KPASSO)
   Misura della condizione a fine partita (100 partite, non 12: a dodici
   l'errore standard degli acciacchi vale quanto il numero — vedi la
   rettifica del 28 agosto in fondo):
     node strumenti/_diag-carico.js --taglia 11 --partite 100 --seme 20260803 --gioco fuori/cond2.html
   Cancelli del gioco:
     node strumenti/collaudo.js --gioco fuori/cond2.html
     node strumenti/_p-nomi.js --gioco fuori/cond2.html
     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803 --gioco fuori/cond2.html
     node strumenti/_q-meta.js --tre-taglie --gioco fuori/cond2.html

   ---------------------------------------------------------------------
   LE DUE TABELLE QUI SOTTO SONO DEL 27 AGOSTO 2026, E DESCRIVONO UN
   GIOCO CHE NON ESISTE PIU'. Il 28 agosto sono entrate cinque passate —
   il punto d'incontro del passaggio (_t-spazio), i quattro esiti di
   parata (_t-portiere BT), il caso convogliato in dado() (_t-seme), il
   registro dei comandi (_t-registro) e la sfida asincrona (_t-rete) — e
   il gioco spedito di oggi tira 23,3 volte a partita a 11 contro 11
   dove il 27 agosto ne tirava 15,4. Le righe sotto restano perche' un
   numero cancellato e' un numero che nessuno puo' piu' controllare, ma
   NON sono la misura di oggi: si leggono come storia, non come stato.

   IL DOPO, RIMISURATO IL 28 AGOSTO 2026 sul gioco di oggi, 11 contro 11,
   DUE BLOCCHI DI SEMI INDIPENDENTI da 100 partite l'uno (semi 20260803..
   e 20261101..), CPU contro CPU, Normale. Due blocchi e non uno perche'
   lo 0-0 di questa taglia sta a ridosso del tetto del cancello, e a un
   passo dalla soglia un blocco solo non e' una misura, e' un'estrazione.
     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803
          --gioco fuori/cond2.html      (e lo stesso con --seme 20261101)
                                spedito A / B      con la condizione A / B
     tiri (media)               23,3 / 24,2            24,2 / 23,0
     gol nel tempo regol.        1,43 / 1,24            1,19 / 1,21
     partite 0-0                  22% / 24%              32% / 27%
     parate (media)               1,8 / 1,7              1,8 / 1,8
     MOMENTI DA PORTA al min.    1,07 / 0,93            0,92 / 0,97
     EVENTI AL MINUTO           43,7 / 43,5            42,7 / 42,8

   LA LETTURA ONESTA, sui 200 di ogni colonna. I tiri non si muovono
   (23,7 contro 23,6). I gol scendono da 1,33 a 1,20, cioe' il 10%, su
   un errore standard della differenza di circa 0,13: un sigma scarso.
   I momenti da porta al minuto scendono da 1,00 a 0,95, e QUANTO VALGA
   quel 0,05 lo dice il gioco spedito contro se stesso: fra i suoi due
   blocchi passa da 1,07 a 0,93, cioe' TRE VOLTE la differenza fra le due
   colonne. Su questa voce, a cento partite, non si puo' dire niente.
   LO 0-0 E' L'UNICA VOCE CHE SI MUOVE DAVVERO, e va detto forte perche'
   e' anche quella che tiene un cancello: 23% contro 29,5% sui 200, cioe'
   6,5 punti su un errore standard della differenza di 4,4 — un sigma e
   mezzo. Non e' una prova, ma il segno e' lo stesso nei due blocchi
   (+10 e +3), ed e' abbastanza per far sbattere contro il tetto del 33%
   un campione da trenta partite: vedi la riga rossa del cancello qui
   sotto. La condizione toglie corsa, e in questo gioco cio' che toglie
   corsa toglie gol: era scritto in testa alla toppa, e i numeri di oggi
   lo dicono piu' forte di quelli di ieri.

   5 CONTRO 5 — 400 partite per colonna (il 5v5 costa 0,35 s a partita:
   quattrocento si pagano, e dimezzano la barra d'errore. Le medie a 100
   partite ballavano di mezzo gol, e su cento sarebbe uscita una tabella
   diversa e ugualmente sincera — e' il motivo per cui questa e' a 400).
     node strumenti/_eventi.js --taglia 5 --partite 400 --seme 20260803
                                          spedito    con la condizione
     tiri (media)                          12,2          11,6
     gol nel tempo regolamentare (media)    2,69          2,57
     partite 0-0                             6%            6%
     parate (media)                          2,7           2,4
     legni (media)                           1,02          1,01
     MOMENTI DA PORTA al minuto (media)      3,94          3,69
     EVENTI AL MINUTO (media)               56,4          55,3

   11 CONTRO 11 — 300 partite per colonna.
     node strumenti/_eventi.js --taglia 11 --partite 300 --seme 20260803
                                          spedito    con la condizione
     tiri (media)                          15,4          15,4
     gol nel tempo regolamentare (media)    1,24          1,17
     partite 0-0                            26%           29%   (tetto 33%)
     parate (media)                          1,5           1,5
     MOMENTI DA PORTA al minuto (media)      0,88          0,88
     EVENTI AL MINUTO (media)               37,5          36,7

   LEGGERE QUESTE DUE TABELLE COI SIGMA, che e' l'unico modo onesto.
   A 11 contro 11, 300 partite: i tiri sono IDENTICI (15,4 contro 15,4),
   i momenti da porta al minuto sono IDENTICI (0,88), i gol scendono di
   0,07 su un errore standard di 0,07 — un sigma — e lo 0-0 sale di tre
   punti su un errore standard della differenza di 3,5 punti, cioe' meno
   di un sigma. Su questa taglia la condizione NON si vede nei numeri del
   risultato, e si vede solo in quelli che descrive lei (42 di condizione
   a fine partita, 3,3 cambi, 0,1 acciacchi — il terzo numero diceva 0,3
   ed era quello del 5 contro 5: rettificato il 28 agosto 2026, vedi la
   nota sugli acciacchi in testa). E' il risultato migliore che potesse
   dare.
   A 5 contro 5, 400 partite: i gol calano di 0,12 su un errore standard
   di 0,085 (1,4 sigma) e i momenti al minuto di 0,25 su 0,11 (2,3
   sigma). Qui il costo c'e' ed e' misurabile: circa il 5% dei gol e il
   6% dei momenti. Il campo e' piccolo, la panchina ha solo quattro
   uomini di movimento fra cui scegliere e i cambi riescono la meta' di
   quelli a 11 (1,6 contro 3,3): le gambe fresche rientrano meno, e la
   fatica resta scoperta.
   UN AVVERTIMENTO PER CHI RIMISURERA'. Le stesse voci a 100 partite
   davano allo 0-0 dell'11 contro 11 il 22% (spedito) e al 5 contro 5
   3,02 gol e 4,32 momenti al minuto: erano campioni fortunati, e le
   tabelle costruite su di loro avrebbero raccontato una cura molto
   peggiore di quella che e'. Cento partite bastano per il pavimento
   degli 0-0, non per un delta del 5%.

   I CANCELLI DI CASA, sul file uscito da questa toppa. Le prime due
   righe sono del 28 agosto 2026, sul gioco di oggi; le altre sono del 27
   e vanno rifatte prima di portare la toppa dentro.

     node strumenti/collaudo.js --gioco fuori/cond2.html
       36 controlli, 36 passati, 0 falliti      (28 ago 2026)

     node strumenti/_p-nomi.js --gioco fuori/cond2.html
       12 controlli, 12 passati, 0 falliti      (28 ago 2026)
       alle tre taglie tutti i cognomi in campo E IN PANCHINA sono
       distinti (28 uomini, 28 cognomi a 11 contro 11) e pescaNome non
       ha mai ripiegato. E' il cancello nato da questa bocciatura: prima
       non esisteva, e il buco stava fuori dalla portata della batteria.

     node strumenti/_q-meta.js --tre-taglie --gioco fuori/cond2.html
       81 controlli, 81 passati, 1 FALLITO — E IL FALLITO E' LA
       CONDIZIONE, non un caso. Va detto per intero perche' e' il numero
       che decide se questa toppa puo' entrare:
                            0-0 a 11 contro 11 (30 partite, tetto 33%)
                            seme 20260803    seme 20261101
         gioco spedito          30%   OK        27%     OK   (82/82, 82/82)
         con la condizione      40%   NO      33,3%     NO   (81/82, 81/82)
       Il cancello e' ROSSO su tutti e due i blocchi di semi, e non e'
       il rumore di un campione: su CENTO partite per blocco (tabella
       sopra) lo 0-0 passa da 23% a 29,5%, cioe' 6,5 punti su un errore
       standard di 4,4 — un sigma e mezzo, con lo stesso segno nei due
       blocchi. La condizione toglie corsa, la corsa fa i gol, e a 11
       contro 11 il margine sotto il tetto era di tre punti: se li mangia
       tutti. NON e' un difetto della cura dei nomi — la copia col
       difetto e quella riparata danno lo STESSO identico vettore di
       eventi su 100 partite, verificato con un diff — e' il prezzo della
       fatica, che qui si dichiara invece di scoprirlo dopo.
       CHE COSA SIGNIFICA PER CHI PORTA QUESTA TOPPA DENTRO: o si alza
       COND_CAP90 finche' lo 0-0 rientra (con --cap: 21.000 e' tarato sui
       cambi e sugli acciacchi, non sullo 0-0, e nessuno ha ancora
       misurato la coppia), oppure la toppa resta fuori. Non si porta
       dentro un rosso di cancello con la scusa che e' a un sigma e
       mezzo: il tetto del 33% e' stato comprato a caro prezzo il 26
       agosto (vedi _t-cronometro.js) e questa e' la prima cura che lo
       rimangia.

   LE TRE RIGHE QUI SOTTO SONO DEL 27 AGOSTO 2026 e NON sono state
   rifatte il 28: valgono su un gioco che nel frattempo e' cambiato in
   cinque punti, quindi si leggono come storia. Chi porta la toppa dentro
   le rifa' — e la prima, tutti.js, adesso ha SEDICI cancelli che contano
   e non quindici, perche' _p-nomi.js e' entrato in batteria.
     node strumenti/tutti.js --gioco fuori/cond.html      (27 ago)
       15 cancelli che contano, 15 passati. L'unico informativo
       (istantanea) fa 46 misure su 56 dove il gioco spedito, stesso
       banco, ne fa 45: e' rumore di inquadratura, non un peggioramento.
     node strumenti/giocata.js --tutte --gioco fuori/cond.html   (27 ago)
       7 giocate misurate, 7 passate (le sette giocate col DITO: la
       toppa e' misurata a macchina, ma le mani devono continuare a
       funzionare, e questo e' il cancello che lo dice)
     node strumenti/prestazione.js --taglia 11 --freno 4 --contro
          CALCETTO-il-gioco.html --oggi fuori/cond.html      (27 ago)
       fotogramma medio -2,7% · tipico +3,0% · p95 +4,3% — tutti dentro
       il +25% ammesso, e tutti dentro il rumore appaiato del banco.
       IL COSTO VERO, contato invece che misurato (il banco non ha la
       risoluzione per vederlo): per giocatore e per fotogramma sono una
       radice quadrata riusata, sei moltiplicazioni e tre somme nel
       blocco del fiato, piu' una moltiplicazione nella posa — su 22
       figure a 60 Hz fanno circa 13.000 operazioni al secondo, cioe'
       due millesimi di millisecondo su un bilancio di 16.
       Il direttore di panchina gira 2 volte al secondo e non 60: 44
       confronti al secondo in tutto.

   LA CONDIZIONE A FINE PARTITA, mediana per uomo di movimento.
   RIFATTA IL 28 AGOSTO 2026 su CENTO partite per taglia (era su dodici),
   sul gioco di oggi con questa toppa — cioe' il gioco DOPO le cinque
   passate del 28 agosto: spazio, portiere BT, seme, registro, rete.
     node strumenti/_diag-carico.js --taglia 11 --partite 100
          --seme 20260803 --gioco fuori/cond2.html
     taglia  condizione (q25-q75)  cambi/partita  acciacchi  senza acciacchi
      5v5      37,2  (32,6-49,2)        1,7          0,3         74 su 100
      7v7      38,7  (33,2-49,2)        2,8          0,4         80 su 100
     11v11     41,6  (35,0-47,8)        3,3          0,1         94 su 100
   Le colonne dei cambi e degli acciacchi sono MEDIE a partita (le
   mediane sono 1, 2 e 3 cambi e zero acciacchi: l'acciacco e' un evento
   raro, e una mediana di eventi rari e' sempre zero e non dice niente).
   La riga di dodici partite che stava qui diceva 38,1 / 40,9 / 42,1 di
   condizione e 0,5 / 0,4 / 0,1 di acciacchi: la condizione regge (meno
   di un punto e mezzo di scarto), gli acciacchi del 5 contro 5 no —
   0,5 su dodici partite era un campione fortunato, il valore vero e'
   0,3. Chi rimisura tenga presente che a dodici partite l'errore
   standard di questa colonna vale circa 0,2 acciacchi, cioe' quanto il
   numero che si vuole leggere.
   Una taratura sola per tre campi e tre cronometri: e' il pagamento
   della scelta di legare la capacita' alla PARTITA e non ai metri.

   ---------------------------------------------------------------------
   COSA MANCA, detto per nome cosi' nessuno lo scopre da solo.

   1. IL DITO NON SCEGLIE IL CAMBIO. Il direttore di panchina lavora per
      tutt'e due le squadre, compresa la tua: e' un allenatore, non un
      menu. FC Mobile lascia trascinare la carta del subentrante; da noi
      la scelta manuale non c'e'. Il posto naturale non e' la pausa (un
      cambio in pausa contraddice l'unica cosa buona di questo impianto,
      cioe' che non ferma niente): e' un quinto disco contestuale che
      compaia SOLO quando un tuo uomo e' in riserva o acciaccato.
   2. LA CONDIZIONE NON SI VEDE IN CIFRE. Si legge dalla falcata e dal
      nastro del cambio, e basta. Il posto piu' economico dove metterla
      e' l'anello ambra del comandato (anelloComandato): un secondo arco
      sulla STESSA ellisse, da 0 a 2pi*(cond/100), senza toccare raggi.
      La geometria dell'anello e' un vincolo misurato — «estremo laterale
      23,2 < 30, il raggio da cui collaudo.js campiona l'erba» — quindi
      si puo' cambiare il colore lungo il tracciato, mai la taglia.
   3. IL RINCALZO PORTA IL NUMERO DI CHI ESCE. numeroDi() garantisce
      ventidue numeri distinti e strumenti/_identita.js lo verifica:
      rinumerare i rincalzi vuol dire rifare quella garanzia con 28
      uomini, ed e' una passata sua.
   4. NIENTE POSA A TERRA PER L'ACCIACCATO. Si prende il latch mesto per
      1,2 s (che gia' esiste) e poi zoppica solo nei numeri. Una clip
      'dolorante' e' lavoro di rig, non di simulazione.
   5. LA CONDIZIONE NON SOPRAVVIVE ALLA PARTITA. Nessuna fatica a lungo
      termine fra una partita e l'altra, e non e' una dimenticanza: in
      un gioco senza energia da ricaricare (voce «Tetti a quanto si puo'
      giocare», dove il confronto ci da' ragione) una condizione che si
      porta dietro le partite diventerebbe proprio quel cancello li'.
   6. LO 0-0 A 11 CONTRO 11 SFONDA IL TETTO DEL CANCELLO, ed e' la voce
      che tiene fuori questa toppa (28 agosto 2026). Non e' «cosa manca»:
      e' un rosso aperto, con i numeri in «I CANCELLI DI CASA» qui sopra.
      La strada da provare per prima e' --cap: 21.000 e' stato tarato sui
      cambi e sugli acciacchi, e nessuno ha mai misurato la coppia
      capacita' / 0-0. Chi ci prova la misuri su due blocchi di semi da
      cento partite e scriva QUI la tabella, perche' a un passo dalla
      soglia un blocco solo non e' una misura.
   7. I RINCALZI NON HANNO UN COGNOME LORO, hanno una casella nel mucchio
      dei trenta. Oggi bastano — 22 in campo piu' 6 in panchina fanno 28
      su 30 (vedi l'ancora 8) — ma il margine e' DUE. Chi aggiunge un
      quarto rincalzo per squadra, o una seconda panchina, o dei nomi
      per gli arbitri, torna in rosso su _p-nomi.js e deve prima
      risolvere il fatto che allungare COGNOMI_ROSA rinomina tutte le
      squadre gia' esistenti.

   uso:  node strumenti/_t-condizione.js --out fuori/cond2.html
         (mai --dentro finche' il rosso della voce 6 e' aperto)
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* le tre manopole della taratura: valori di serie = quelli misurati */
const CAP      = String(+arg('cap', 21000));
const STRAPPO  = String(+arg('strappo', 22));
const LONTANO  = String(+arg('lontano', 260));
const SPR      = String(+arg('spr', 2));
const RISERVA  = String(+arg('riserva', 30));
const QUALITA  = String(+arg('qualita', 94));
const MORSO    = String(+arg('morso', 1));

const ANCORE = [

/* 1 — le costanti e le due funzioni, accanto a P_SPEED perche' chi
       cerca «quanto corre un uomo» le deve trovare li' */
{
  nome: ' 1/13 le costanti della condizione, accanto a P_SPEED',
  cerca: `const P_SPEED = 168;               // velocità max (unità/s)`,
  metti:
`const P_SPEED = 168;               // velocità max (unità/s)
/* =====================================================================
   LA CONDIZIONE — LA SECONDA FATICA, quella che non torna.

   p.fiato e' la fatica a breve: lo scatto la brucia, la camminata la
   ridona, e in tre secondi sei di nuovo al fischio d'inizio. p.cond e' la
   fatica a lungo: scende e basta, e l'unico modo di rialzarla e' un
   altro paio di gambe.

   LA CAPACITA' E' UNA PARTITA, non un numero di metri. Misurato con
   strumenti/_diag-carico.js (12 partite per taglia, semi 20260803..,
   CPU contro CPU, gioco spedito) lo spazio percorso da un uomo di
   movimento e' 10.873 unita' a 5 contro 5, 15.711 a 7 e 21.022 a 11 —
   ma l'ANDATURA e' la stessa (110,7 · 108,8 · 106,2 unita' al secondo,
   forbice 4%): a cambiare non e' il campo, e' il cronometro, che dal 26
   agosto scala col campo. Diviso per il fattore di taglia lo spazio
   torna uguale a meno del 6%. Percio' la capacita' scala con
   durataPartita(): un uomo ha in gamba UNA partita, a qualunque taglia
   e a qualunque durata scelta nel menu.

   COND_CAP90 e' lo spazio PESATO (lo scatto vale doppio: e' la corsa
   che costa, non i secondi) che porta la condizione da 100 a 0 in una
   partita da 90 secondi. IL NUMERO E' TARATO, non scelto: con 34.000 la
   condizione finiva a 61 di mediana e in dodici partite si vedeva UN
   cambio in tutto — un impianto che non succede; con 18.000 finivano
   tutte e sei le sostituzioni in undici partite su dodici, cioe' la
   panchina diventava obbligatoria invece che una scelta. Con 21.000, a
   11 contro 11 (rimisurato il 28 agosto 2026 su cento partite invece di
   dodici): condizione mediana a fine partita 41,6 (quartili 35,0-47,8,
   il piu' generoso a 11), 3,3 cambi a partita sui 6 disponibili, 0,1
   acciacchi — qui c'era scritto 0,3, ed era il numero del 5 contro 5.
   La forbice fra il piu' pigro e il piu' generoso e' quello
   che rende sensato un direttore di panchina: senza, non ci sarebbe
   nessuno da cambiare.
   ===================================================================== */
const COND_CAP90 = ${CAP};         // spazio pesato che svuota le gambe in 90 s
const COND_SPR = ${SPR};           // lo scatto pesa piu' della corsa: e' quello che spacca
const COND_URTO = 9;               // punti che costa un contatto duro subito
const COND_RISERVA = ${RISERVA};   // sotto: il campanello del direttore di panchina
const COND_STRAPPO = ${STRAPPO};   // sotto: uno scatto a fiato vuoto diventa acciacco
const CAMBI_MAX = 3;               // tre per squadra, come nel calcio prima del 2020
const CAMBIO_LONTANO = ${LONTANO}; // unita' dal pallone (a 5v5) sotto cui non si cambia
const CAMBIO_OGNI = 0.5;           // il direttore guarda due volte al secondo, non 60
const COND_MORSO = ${MORSO};       // quanto la condizione morde il fiato (1 = piena)`,
},

/* 2 — i tre campi del giocatore, accanto al fiato che gia' c'era */
{
  nome: ' 2/13 p.cond, p.acciacco e p.rincalzo accanto a p.fiato',
  cerca: `    fiato:100,                         // 0-100: lo sprint lo consuma, la camminata lo recupera
    sprint:false,                      // sta scattando in questo istante`,
  metti:
`    fiato:100,                         // 0-100: lo sprint lo consuma, la camminata lo recupera
    /* LA FATICA A LUNGO. Sta accanto al fiato perche' e' la sua meta'
       mancante: il fiato torna, la condizione no. 100 = gambe intere,
       0 = a secco. La consuma lo SPAZIO percorso (updatePlayerFisica),
       non i secondi: chi cammina paga poco. */
    cond:100,
    acciacco:0,                        // 1 = ha ceduto qualcosa: niente scatto, passo corto
    rincalzo:0,                        // 1 = e' entrato dalla panchina (non e' nella tua rosa)
    sprint:false,                      // sta scattando in questo istante`,
},

/* 3 — i campi di partita: panchina, cambi fatti, capacita' del giorno */
{
  nome: ' 3/13 i campi di partita nella dichiarazione di G',
  cerca: `  sceneT:0,            // timer della scena corrente
  goalTeam:0,          // chi ha segnato (per la scritta)`,
  metti:
`  sceneT:0,            // timer della scena corrente
  /* LA PANCHINA. panchina[t] e' la fila dei rincalzi ancora seduti
     (oggetti leggeri: nome e quattro attributi, nessun corpo in campo
     finche' non entrano); cambi[t] quanti ne sono gia' entrati; capCond
     la capacita' di gambe di QUESTA partita, calcolata una volta in
     setupPlayers perche' dipende dalla durata e dalla taglia. Il valore
     di ripiego non e' decorativo: se restasse indefinito la divisione
     per fotogramma darebbe NaN e la condizione morirebbe in silenzio. */
  panchina:[[],[]], cambi:[0,0], capCond:${CAP}, cambioT:0,
  /* QUANTE VOLTE pescaNome HA DOVUTO RIPIEGARE da quando la pagina e'
     aperta (vedi l'ancora 13). Nasce a ZERO e non a «indefinito» perche'
     e' la differenza fra «misurato e nessuno» e «non lo misura nessuno»:
     con l'indefinito strumenti/_p-nomi.js non saprebbe distinguere un
     gioco sano da un gioco senza campanella, e dichiarerebbe non
     misurato un controllo che invece e' verde. Non si azzera a ogni
     fischio d'inizio: un ripiego avvenuto tre partite fa e' comunque un
     elenco che sta finendo, e va visto. */
  __nomiEsauriti:0,
  goalTeam:0,          // chi ha segnato (per la scritta)`,
},

/* 4 — IL CUORE: il consumo e i tre effetti, dentro il blocco del fiato */
{
  nome: ' 4/13 il consumo della condizione e i suoi effetti sul fiato',
  cerca: `  p.sprint = !!vuoleSprint && p.fiato>6 && p.slide<0 && p.recover<=0 && p.charge<0;
  if(p.sprint) p.fiato=Math.max(0,p.fiato-26*dt);
  else p.fiato=Math.min(100,p.fiato + (len(p.vx,p.vy)<60?18:11)*dt);
  /* stanchezza: sotto il 25% di fiato si perde passo anche camminando */
  const stanco = p.fiato<25 ? (0.86+0.14*(p.fiato/25)) : 1;`,
  metti:
`  /* CHI HA UN ACCIACCO NON SCATTA PIU'. Non e' una penalita' aggiunta a
     mano: e' la definizione di acciacco. E sta dentro la stessa riga di
     guardia degli altri quattro impedimenti (fiato, scivolata, corpo a
     terra, carica) perche' e' della stessa specie. */
  p.sprint = !!vuoleSprint && p.fiato>6 && p.slide<0 && p.recover<=0 && p.charge<0 && !p.acciacco;
  /* LA VELOCITA' SI LEGGE UNA VOLTA SOLA. Prima len(p.vx,p.vy) viveva
     dentro il ramo «else» del fiato; adesso serve anche al consumo della
     condizione, che vale in tutti e due i rami. Il costo netto e' una
     radice in piu' sul ~25% dei fotogrammi-giocatore in cui si scatta,
     cioe' 330 radici al secondo su ventidue figure a 60 Hz. */
  const vp = len(p.vx,p.vy);
  /* LA CONDIZIONE SI CONSUMA A METRI, NON A SECONDI, e lo scatto pesa
     doppio: chi amministra arriva in fondo, chi corre sempre no. La
     capacita' e' quella della partita (vedi COND_CAP90), quindi la
     stessa curva vale a 5, a 7 e a 11. */
  if(p.cond>0){
    p.cond -= vp*(p.sprint?COND_SPR:1)*dt*100/G.capCond;
    if(p.cond<0) p.cond=0;
  }
  /* L'ACCIACCO E' UNA SOGLIA, NON UN DADO: si prende sull'ULTIMO SCATTO
     DI UN SERBATOIO VUOTO — fiato in fondo alla sua corsa su una
     condizione gia' spesa. Nessun Math.random: chi si fa male sa perche',
     e chi ha amministrato non si fa male mai.
     PERCHE' 35 E NON 9, e la prima stesura sbagliava. Il fiato sotto 9
     sembrava il fondo del fondo (sotto 6 lo scatto si spegne da solo),
     ma aiVuoleSprint smette di VOLERE lo scatto gia' a 32: una macchina
     non scende mai sotto quella soglia, quindi con 9 l'acciacco poteva
     capitare soltanto all'uomo col pollice premuto — misurato, zero
     acciacchi in 12 partite CPU contro CPU a qualunque capacita'. Un
     infortunio che colpisce solo chi gioca non e' una regola del gioco:
     e' una tassa. 35 e' appena sopra il 32 dell'IA, cioe' l'ultimo
     respiro del suo serbatoio, e l'uomo che tiene giu' il pollice ci
     passa in mezzo comunque scendendo verso 6. Stessa regola per tutti.
     STA FUORI dal blocco qui sopra, e non e' un dettaglio: dentro, l'uomo
     ARRIVATO a zero — cioe' il piu' esausto di tutti — sarebbe stato
     l'unico immune, perche' quel blocco smette di girare a condizione
     nulla. Il primo termine e' p.sprint apposta: e' falso nella grande
     maggioranza dei fotogrammi-giocatore e il corto circuito chiude li'. */
  if(p.sprint && p.fiato<35 && p.cond<COND_STRAPPO) prendiAcciacco(p);
  /* q: 1 = gambe intere, 0 = a secco. Un solo numero, tre effetti. */
  const q = p.cond*0.01;
  /* LO SCATTO COSTA DI PIU' E IL FIATO TORNA PIU' PIANO. E' qui che la
     condizione si SENTE, e il conto sta nel commento della toppa: a
     condizione 40 il ciclo di lavoro dello scatto scende dal 71% al 56%,
     cioe' un quinto degli scatti sparisce. Sulla velocita' di punta
     invece la condizione tocca appena (5% in fondo alla scala): una
     figura che rallenta e basta legge come un bug del motore, una che
     smette di fare la seconda corsa legge come un uomo stanco. */
  if(p.sprint) p.fiato=Math.max(0,p.fiato-26*(1+COND_MORSO*0.5*(1-q))*dt);
  else p.fiato=Math.min(100,p.fiato + (vp<60?18:11)*(1-COND_MORSO*0.55*(1-q))*dt);
  /* stanchezza: sotto il 25% di fiato si perde passo anche camminando */
  const stanco = (p.fiato<25 ? (0.86+0.14*(p.fiato/25)) : 1) * (p.acciacco ? 0.86 : (0.95+0.05*q));`,
},

/* 5 — la falcata si accorcia: la posa della stanchezza, che non esisteva */
{
  nome: ' 5/13 la falcata si accorcia con la condizione',
  cerca: `  p.amp = ampPasso(v);`,
  metti:
`  /* LA POSA DELLA STANCHEZZA, che in questo file non esisteva (il
     confronto la segna a zero: «il fiato mangia velocita' ma NON esiste
     nessuna posa di stanchezza»). Si accorcia la FALCATA, cioe' la parte
     di p.amp che eccede il valore di riposo 1,1 — non l'ampiezza intera,
     se no un uomo fermo e stanco starebbe in piedi diverso da un uomo
     fermo e fresco, che e' falso. Una moltiplicazione, e il corpo intero
     si fa pesante: il saliscendi del bacino (p.bob) e lo schiacciamento
     dell'appoggio leggono tutti e due (p.amp-1,1)/6,5 poche righe piu'
     sotto, quindi calano insieme senza una riga in piu'.
     18% al massimo da stanchi, 28% con un acciacco: si scende, mai si
     sale, quindi nessuna finestra di collaudo.js puo' andare in
     sfondamento per colpa di questa riga. */
  p.amp = 1.1 + (ampPasso(v)-1.1)*(p.acciacco ? 0.72 : (0.82+0.18*p.cond*0.01));`,
},

/* 6 — il contrasto stanco: si arriva tardi, e si prende l'uomo */
{
  nome: ' 6/13 la scivolata di chi e\' cotto pulisce meno',
  cerca: `      const suPalla = d < SLIDE_BALL_R * fatt(p.tackle,0.22);`,
  metti:
`      /* CHI E' COTTO ENTRA TARDI. Il contrasto e' la giocata che chiede
         al corpo tutto insieme, ed e' la prima cosa che se ne va: la
         finestra di presa pulita si stringe con la condizione, e chi
         resta fuori tempo non prende la palla, prende l'uomo. E' anche
         l'effetto che tiene APERTA la partita invece di spegnerla —
         negli ultimi secondi la difesa perde il tempo prima della corsa,
         che e' esattamente cio' che succede a un campo vero. */
      const suPalla = d < SLIDE_BALL_R * fatt(p.tackle*(0.75+0.25*p.cond*0.01),0.22);`,
},

/* 7 — il contatto duro anticipa il conto */
{
  nome: ' 7/13 il fallo subito costa condizione',
  cerca: `        carrier.recover=Math.max(carrier.recover,0.35);`,
  metti:
`        carrier.recover=Math.max(carrier.recover,0.35);
        /* IL COLPO SI PAGA IN GAMBE, e il fallo pesa oltre il fischio.
           Non e' un secondo sistema di infortuni: e' lo stesso conto,
           anticipato. Chi viene preso a spallate per tutta la partita
           arriva al limite prima di chi non lo e' stato, ed e' cosi'
           che si prendono gli acciacchi veri. Anche chi entra paga, la
           meta': una scivolata costa a tutt'e due. */
        carrier.cond=Math.max(0, carrier.cond - (cattivo?COND_URTO*2:COND_URTO));
        p.cond=Math.max(0, p.cond - COND_URTO*0.5);`,
},

/* 8 — la panchina nasce con la formazione, e la capacita' del giorno */
{
  nome: ' 8/13 la panchina e la capacita\' nascono in setupPlayers',
  cerca: `  G.ball = { x:FW/2, y:FH/2, vx:0, vy:0, owner:-1, lastTouch:-1, passTo:-1,`,
  metti:
`  /* =====================================================================
     LA PANCHINA — tre rincalzi per squadra, e perche' sono piu' scarsi.

     I NOMI escono dallo stesso generatore deterministico dei titolari,
     con un seme di squadra diverso ('PANCHINA·nome') e passando un
     registro di chi e' gia' in campo: nessun rincalzo si chiama come uno
     che si vede giocare, ne' della sua squadra ne' dell'altra. La
     chiamata sta DOPO quelle dei titolari apposta — chiedere piu' nomi
     alle due chiamate di prima avrebbe spostato le pesche seguenti, e le
     squadre note devono continuare a schierare gli stessi uomini.

     IL REGISTRO DELLA PANCHINA E' QUELLO DI CHI SI VEDE, NON QUELLO
     DELLE PESCHE, e la prima stesura sbagliava proprio qui. Riusava
     il «registro», cioe' il registro delle CHIAMATE, che a 11 contro 11
     arriva a 27 cognomi su 30: 5 iniettati da rosaAvversaria a partire
     da SAVE.rosa, piu' 11 per gli avversari, piu' 11 per il quartiere.
     Ma solo 22 di quei 27 finiscono addosso a un uomo — le caselle 0-4
     della chiamata «casa» le sovrascrive SAVE.rosa, e quei 5 cognomi
     restano bruciati nel registro senza che nessuno li porti. Cosi' alla
     panchina restavano 3 cognomi liberi per 6 rincalzi, e pescaNome
     quando non trova niente RIPIEGA IN SILENZIO su lista[k%30], cioe'
     restituisce un cognome gia' assegnato.
     NON ERA TEORIA, era misurato: sul seme 20260803, a 11 contro 11,
     28 uomini portavano 26 cognomi — 1:Rocco Piedebuono in campo e
     1:Vito Piedebuono in panchina NELLA STESSA SQUADRA, piu' 0:Peppe
     Nocchia contro 1:Mimmo Nocchia. E' esattamente la ferita che il
     gioco aveva gia' trovato e riparato una volta (vedi il commento di
     COGNOMI_ROSA: «Cesare Tacco Fino e Vito Tacco Fino nella STESSA
     squadra»), e il rincalzo che segna compare per NOME nel tabellino.
     Costruendo il registro dai soli uomini VERAMENTE IN CAMPO i cognomi
     occupati sono 22 e ne restano 8 per 6: adesso il «22 + 6 = 28 su
     30» e' vero invece che promesso. rosaAvversaria reinietta comunque
     SAVE.rosa in usatiC, ma quei 5 sono gia' dentro e non tolgono nulla.
     LE ALTRE DUE STRADE SONO PEGGIO, e vanno dette perche' sembrano piu'
     ovvie: allungare COGNOMI_ROSA cambia TUTTI i nomi gia' esistenti
     (pescaNome parte da k=(val*lista.length)|0, quindi la lunghezza e'
     dentro l'indice) e le squadre note smetterebbero di essere
     riconoscibili; spostare la pesca della panchina prima dei titolari
     sposta le pesche seguenti, stesso danno.
     E NESSUN CANCELLO DI CASA GUARDAVA I NOMI — _identita.js, citato a
     garanzia dalla prima stesura di questa toppa, misura maglie e numeri
     — quindi la cura viene con la sua sonda: strumenti/_p-nomi.js, in
     batteria in tutti.js, piu' il contatore G.__nomiEsauriti che fa
     gridare pescaNome invece di lasciarlo ripiegare zitto.

     GLI ATTRIBUTI QUI NON CI SONO, e la riga qui sotto tiene apposta
     solo il nome: il rincalzo entra al 94% dell'UOMO CHE SOSTITUISCE, e
     quel numero lo si sa solo al momento del cambio (vedi faiCambio, che
     porta anche la misura per cui la prima stesura — attributi assoluti
     pari alla media della rosa — peggiorava il gioco invece di
     migliorarlo). Quel 6% e' tutto il gioco della panchina: senza, si
     cambierebbe tutti al primo minuto e le tre sostituzioni sarebbero un
     bonus invece di una scelta.

     LA CAPACITA' DI GAMBE della partita si calcola qui, una volta:
     dipende dalla durata scelta e dalla taglia, e sotto sta il conto
     (vedi COND_CAP90). Sta accanto alla panchina perche' sono la stessa
     cosa vista dai due lati: quanto dura un uomo, e chi c'e' dopo.
     ===================================================================== */
  G.capCond = COND_CAP90 * durataPartita() / 90;
  G.cambi=[0,0]; G.cambioT=CAMBIO_OGNI;
  /* il registro di chi si vede: si legge dai nomi VERI di G.players, che a
     questo punto sono gia' tutti assegnati (SAVE.rosa compresa). Chi non
     e' in nessuno dei due elenchi — le squadre senza rosa nominata, che
     hanno il nome vuoto — non occupa nessuna casella, ed e' giusto. */
  const rInCampo = { n:new Set(), c:new Set() };
  for(const p of G.players){
    const q=String(p.nome||'').split(' ');
    const iN=NOMI_ROSA.indexOf(q[0]);                    if(iN>=0) rInCampo.n.add(iN);
    const iC=COGNOMI_ROSA.indexOf(q.slice(1).join(' ')); if(iC>=0) rInCampo.c.add(iC);
  }
  G.panchina = [ rosaAvversaria('PANCHINA·'+G.teamName, 3, rInCampo).map(n=>({nome:n})),
                 rosaAvversaria('PANCHINA·'+G.oppName,  3, rInCampo).map(n=>({nome:n})) ];
  G.ball = { x:FW/2, y:FH/2, vx:0, vy:0, owner:-1, lastTouch:-1, passTo:-1,`,
},

/* 9 — il direttore di panchina entra nel passo, sotto la guardia della scena */
{
  nome: ' 9/13 la chiamata del direttore di panchina dentro lo step',
  cerca: `  if(G.scene!=='play' && G.scene!=='golden') return;`,
  metti:
`  if(G.scene!=='play' && G.scene!=='golden') return;
  /* IL DIRETTORE DI PANCHINA gira solo a partita viva, e sta qui — sotto
     la guardia della scena — perche' un cambio durante il fermo immagine
     del gol o dentro la moviola sarebbe un uomo che si teletrasporta in
     un fotogramma che nessuno puo' spiegare. */
  panchinaPasso(dt);`,
},

/* 10 — le funzioni vere, appese sotto aiVuoleSprint (che e' il posto in
        cui il gioco tiene gia' le decisioni sulle gambe) */
{
  nome: '10/13 le tre funzioni: prendiAcciacco, faiCambio, panchinaPasso',
  cerca: `/* SPRINT della IA: scatta quando serve davvero, e tiene da parte il fiato */
function aiVuoleSprint(p){
  if(p.fiato<32) return false;`,
  metti:
`/* =====================================================================
   L'ACCIACCO E IL CAMBIO — le tre funzioni, e nessun dado dentro.

   Stanno qui, sotto aiVuoleSprint, perche' e' il posto in cui il gioco
   tiene gia' le decisioni che riguardano le gambe.
   ===================================================================== */
/* LA GAMBA CEDE. Chiamata da un solo punto (il consumo della condizione
   in updatePlayerFisica), una volta sola per uomo: da qui in poi
   p.acciacco vale 1 e la guardia dello scatto non lascia piu' passare la
   condizione che l'ha causato. Non guarisce col tempo, e non e' una
   dimenticanza: se guarisse da solo non ci sarebbe piu' nessun motivo di
   cambiare l'uomo, cioe' si toglierebbe la ragione per cui questa toppa
   esiste. La cura e' la panchina. */
function prendiAcciacco(p){
  if(p.acciacco) return;
  p.acciacco=1;
  p.fiato=Math.min(p.fiato, 20);
  p.mesto=1.2;                        // il latch della delusione: gia' esiste, e dice questo
  if(G.stats.acciacchi) G.stats.acciacchi[p.team]++;
  /* FATTO DA EMETTERE (registro dei fatti, in arrivo):
     {che:'acciacco', chi:G.players.indexOf(p), dove:[p.x,p.y],
      esito:{cond:p.cond, fiato:p.fiato}} */
  showBanner('ACCIACCO · '+cognomeBreve(p.nome), '#ff4d4d', 1.4);
  /* un colpo sordo e basso, non il fischio: il gioco NON si ferma per un
     acciacco (nel calcio l'arbitro fischia solo se il pallone e' morto o
     se e' grave), e un fischio direbbe una cosa che non succede */
  Audio5.beep(180);
}
/* il cognome, senza l'articolo: «il Muro» sul nastro diventa «Muro».
   Il nastro del banner e' largo 420 px a 26 px di carattere nero, cioe'
   ventisei lettere scarse: un nome intero non ci sta, e un nastro che
   sfonda e' peggio di un nastro che non c'e'. */
function cognomeBreve(nome){
  const p=String(nome||'').split(' ');
  const c=p.length>1 ? p.slice(1).join(' ') : p[0];
  return c.replace(/^il /,'');
}
/* IL CAMBIO, NELLA STESSA CASELLA. Vedi il commento in testa alla toppa
   per il perche' l'array non si tocca: dodici punti del file indicizzano
   G.players, e mutarlo a partita in corso sarebbe un difetto con dodici
   facce. Qui cambia l'uomo, non il posto. */
function faiCambio(p, r){
  p.nome=r.nome;
  /* IL RINCALZO ENTRA AL ${QUALITA}% DELL'UOMO CHE SOSTITUISCE, e non ha
     numeri suoi. La prima stesura gli dava attributi assoluti pari alla
     MEDIA della rosa, ed era un errore misurato: a 5 contro 5 la media
     della rosa e' 62 mentre un titolare puo' stare a 75, quindi il
     cambio dell'uomo migliore era un taglio del 23% e non del 6%, e il
     banco lo vedeva — 3,52 momenti da porta al minuto contro i 3,87 con
     la stessa fatica ma senza panchina, cioe' la panchina PEGGIORAVA il
     gioco (100 partite, semi 20260803, 5 contro 5).
     Un pari ruolo un filo meno bravo: e' il baratto — gambe fresche
     contro piedi appena peggiori — e resta una scelta invece di un
     regalo. Il giorno che la panchina avra' una schermata avra' anche
     numeri propri; finche' non ce l'ha, dei numeri propri non si
     accorgerebbe nessuno tranne il bilanciamento. */
  const kq = ${QUALITA}/100;
  p.vel=Math.max(35,Math.round(p.vel*kq)); p.tiro=Math.max(35,Math.round(p.tiro*kq));
  p.tecnica=Math.max(35,Math.round(p.tecnica*kq)); p.tackle=Math.max(35,Math.round(p.tackle*kq));
  /* E' UN ALTRO UOMO, QUINDI UN'ALTRA FACCIA — e non puo' essere la
     faccia di un compagno. setupPlayers garantisce a inizio partita che
     due della stessa squadra differiscano per almeno un tratto fisico
     (corporatura, pelle, capelli, taglio) e rilancia il seme in modo
     deterministico alla collisione; un rincalzo che entrasse senza la
     stessa verifica potrebbe romperla al terzo minuto. Stesso rilancio,
     stesso deterministico: nessun dado. */
  let s=vestiDalNome(p, 'rinc·'+p.team+'·'+p.idx);
  for(let g=0; g<24; g++){
    let scontro=false;
    for(const q of G.players){
      if(q!==p && q.team===p.team && q.corp===p.corp && q.skin===p.skin
         && q.hair===p.hair && q.taglio===p.taglio){ scontro=true; break; }
    }
    if(!scontro) break;
    s=(Math.imul(s,31)+7)>>>0;
    p.seme=s; p.corp=s%3; p.skin=SKIN[(s>>>3)%SKIN.length];
    p.hair=HAIR[(s>>>11)%HAIR.length]; p.taglio=(s>>>19)%4;
  }
  p.cond=100; p.fiato=100; p.acciacco=0; p.rincalzo=1;
  p.gialli=0;                          // i cartellini sono personali, e lui non ne ha
  p.mesto=0; p.celeb=0; p.fintaT=0; p.frenaT=0;
  /* FATTO DA EMETTERE (registro dei fatti, in arrivo):
     {che:'cambio', chi:G.players.indexOf(p), dove:[p.x,p.y],
      esito:{esce, entra:p.nome, cond, motivo:'acciacco'|'riserva'}} */
  showBanner('CAMBIO · '+cognomeBreve(p.nome), TEAMCOL[p.team], 1.4);
  Audio5.beep(520);
}
/* IL DIRETTORE DI PANCHINA. Due sguardi al secondo, non sessanta: un
   allenatore non riconsidera la formazione ogni sedici millesimi, e a
   CAMBIO_OGNI il costo e' 44 confronti al secondo su ventidue uomini —
   sotto il rumore di qualunque misura di fotogramma.
   IL CAMBIO NON SI VEDE AVVENIRE, e' la regola che rende inutile un menu
   in questa camera: l'uomo si sostituisce solo se e' lontano dal
   pallone (la camera insegue il pallone, quindi lui e' fuori quadro o ai
   margini), non ce l'ha, e non e' quello sotto il dito. E' il quarto
   uomo che alza il cartello mentre si gioca dall'altra parte. */
function panchinaPasso(dt){
  G.cambioT-=dt;
  if(G.cambioT>0) return;
  G.cambioT=CAMBIO_OGNI;
  const b=G.ball;
  const soglia=CAMBIO_LONTANO*KPASSO;
  for(let t=0;t<2;t++){
    if(G.cambi[t]>=CAMBI_MAX) continue;
    const banco=G.panchina[t];
    if(!banco || !banco.length) continue;
    let scelto=-1, peggio=COND_RISERVA;
    for(let i=0;i<G.players.length;i++){
      const p=G.players[i];
      if(p.team!==t || p.role==='gk') continue;
      /* niente cambi a chi non e' in condizione di uscire dal campo con
         le sue gambe in questo istante: espulso temporaneo, corpo a
         terra, scivolata o rovesciata in corso */
      if(p.out>0 || p.recover>0 || p.slide>=0 || p.rove>=0) continue;
      if(b.owner===i || b.passTo===i) continue;       // non ha la palla, e non l'aspetta
      if(G.ctrl[t]===i) continue;                     // ne' e' l'uomo sotto il dito
      if(len(p.x-b.x, p.y-b.y) < soglia) continue;    // ed e' lontano dall'azione
      /* l'acciaccato precede chiunque: e' l'unico che non recupera piu' */
      const v = p.acciacco ? -1 : p.cond;
      if(v<peggio){ peggio=v; scelto=i; }
    }
    if(scelto<0) continue;
    faiCambio(G.players[scelto], banco.shift());
    G.cambi[t]++;
  }
}
/* SPRINT della IA: scatta quando serve davvero, e tiene da parte il fiato */
function aiVuoleSprint(p){
  if(p.fiato<32) return false;`,
},

/* 11 — il tabellino dice quanti cambi e quanti acciacchi, se ce ne sono
        stati: una riga che compare solo quando ha qualcosa da dire */
{
  nome: '11/13 il tabellino conta i cambi e gli acciacchi',
  cerca: `    (nz(S.espulsi) ? riga('Espulsioni temporanee', S.espulsi) : '');`,
  metti:
`    (nz(S.espulsi) ? riga('Espulsioni temporanee', S.espulsi) : '') +
    /* le due righe della panchina: compaiono solo se sono successe, come
       tutte le altre (regola della meta' di tabella a zero contro zero).
       I cambi si leggono da G.cambi, che e' il contatore vero, cosi' non
       ci sono due copie dello stesso numero da tenere allineate. */
    (nz(S.acciacchi) ? riga('Acciacchi', S.acciacchi) : '') +
    (nz(G.cambi) ? riga('Cambi', G.cambi) : '');`,
},

/* 12 — i contatori rinascono col fischio d'inizio */
{
  nome: '12/13 startMatch azzera i contatori della panchina',
  cerca: `  G.roveCPU=0;   // rate-limit: la CPU non tenta due rovesciate a partita, salvo fortuna`,
  metti:
`  G.stats.acciacchi=[0,0];
  /* i tre contatori della panchina rinascono col resto della partita.
     G.panchina e G.capCond li riempie setupPlayers, che gira sotto. */
  G.cambi=[0,0]; G.cambioT=CAMBIO_OGNI;
  G.roveCPU=0;   // rate-limit: la CPU non tenta due rovesciate a partita, salvo fortuna`,
},

/* 13 — pescaNome GRIDA invece di ripiegare zitto. Questa toppa ha gia'
        esaurito l'elenco dei cognomi una volta (vedi l'ancora 8): la
        cura vera e' li', questa e' la campanella perche' il prossimo lo
        scopra da uno strumento e non da uno screenshot. */
{
  nome: '13/13 pescaNome lascia una traccia quando l\'elenco e\' finito',
  cerca: `  for(let g=0;g<lista.length;g++){ const j=(k+g)%lista.length; if(!usati.has(j)){ usati.add(j); return lista[j]; } }
  return lista[k%lista.length];`,
  metti:
`  for(let g=0;g<lista.length;g++){ const j=(k+g)%lista.length; if(!usati.has(j)){ usati.add(j); return lista[j]; } }
  /* L'ELENCO E' FINITO. Questo ramo restituisce un nome GIA' ASSEGNATO —
     e' il ripiego dichiarato di pescaNome, e non lo si toglie: senza,
     qui bisognerebbe scegliere fra un nome vuoto e un'eccezione, che
     sono tutt'e due peggio di un doppione. Ma finora ripiegava ZITTO, e
     un ripiego zitto si scopre solo dal tabellino di fine partita: e'
     successo due volte (i quindici cognomi per ventidue uomini, poi i
     sei rincalzi di panchina su tre cognomi liberi). Il contatore costa
     un incremento su un ramo che in un gioco sano non viene mai preso, e
     lo legge strumenti/_p-nomi.js, che sta in batteria in tutti.js.
     G e' dichiarato ~700 righe sopra e inizializzato prima di qualunque
     chiamata a pescaNome (la prima e' nuovaRosa, al caricamento del
     salvataggio), quindi qui non e' mai in zona morta. */
  G.__nomiEsauriti=(G.__nomiEsauriti|0)+1;
  return lista[k%lista.length];`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-condizione.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.cond.html';
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

/* GLI ATTESI. Il primo gruppo verifica che le sostituzioni ci siano; il
   secondo — quello che conta davvero in questa casa — verifica che il
   CONTO DEI SORTEGGI sia rimasto identico al bit. Un sorteggio in piu'
   non rompe il gioco: rompe il confronto, perche' i banchi a seme fisso
   smettono di essere appaiati (vedi la nota in _t-carica.js).

   IL SORTEGGIO SI CHIAMA dado() DAL 28 AGOSTO 2026, e questa guardia era
   diventata cieca senza dirlo. _t-seme.js ha convogliato tutto il caso in
   una funzione sola: nel gioco di oggi restano CINQUE 'Math.random(' e
   quattro sono commenti o la riga sotto il coperchio di dado() stesso —
   contarli non sorveglia piu' niente. I sorteggi veri sono 86 'dado(', e
   sono quelli che si contano adesso. Il vecchio conto resta acceso
   accanto al nuovo: costa niente e coglie chi reintroducesse un
   Math.random crudo scavalcando il seme. */
const contaCaso = s => s.split('Math.random(').length - 1;
const contaDado = s => s.split('dado(').length - 1;
const attesi = [
  ['const COND_CAP90 = ', 1],
  ['const COND_MORSO = ', 1],
  ['cond:100,', 1],
  ['function prendiAcciacco(p){', 1],
  ['function faiCambio(p, r){', 1],
  ['const kq = ', 1],
  ['function panchinaPasso(dt){', 1],
  ['  panchinaPasso(dt);', 1],
  ['const vp = len(p.vx,p.vy);', 1],
  ['G.capCond = COND_CAP90 * durataPartita() / 90;', 1],
  ['G.panchina = [ rosaAvversaria', 1],
  /* LA PANCHINA PESCA DAL REGISTRO DI CHI SI VEDE, non da quello delle
     pesche: la riga rotta (che riusava `registro`, gia' esaurito) non
     deve poter tornare in silenzio, quindi si pretendono tutte e due le
     forme — la nuova presente, la vecchia assente. */
  ['const rInCampo = { n:new Set(), c:new Set() };', 1],
  ["rosaAvversaria('PANCHINA·'+G.teamName, 3, rInCampo)", 1],
  ["rosaAvversaria('PANCHINA·'+G.oppName,  3, rInCampo)", 1],
  ["rosaAvversaria('PANCHINA·'+G.teamName, 3, registro)", 0],
  ["rosaAvversaria('PANCHINA·'+G.oppName,  3, registro)", 0],
  /* la campanella dell'elenco esaurito: senza, il ripiego di pescaNome
     torna a essere invisibile e _p-nomi.js perde il suo quarto controllo */
  ['G.__nomiEsauriti=(G.__nomiEsauriti|0)+1;', 1],
  ['__nomiEsauriti:0,', 1],
  ['p.acciacco=1;', 1],
  ["riga('Cambi', G.cambi)", 1],
  ['G.stats.acciacchi=[0,0];', 1],
  /* il valore di ripiego nella dichiarazione di G, la capacita' vera in
     setupPlayers, e la divisione per fotogramma: se manca il primo, la
     divisione dara' NaN e la condizione morira' in silenzio */
  ['capCond:', 1],
  ['/G.capCond;', 1],
  /* le righe di prima non devono sopravvivere da nessuna parte */
  ['if(p.sprint) p.fiato=Math.max(0,p.fiato-26*dt);', 0],
  ['const stanco = p.fiato<25 ? (0.86+0.14*(p.fiato/25)) : 1;', 0],
  ['  p.amp = ampPasso(v);', 0],
  ['fatt(p.tackle,0.22)', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
const casoPrima = contaCaso(src), casoDopo = contaCaso(out);
const dadoPrima = contaDado(src), dadoDopo = contaDado(out);
if (dadoPrima !== dadoDopo) {
  rotti.push('IL CONTO DEI dado() E\' CAMBIATO: ' + dadoPrima + ' -> ' + dadoDopo +
             ' (regola della casa: i banchi a seme fisso si sfasano)');
}
if (casoPrima !== casoDopo) {
  rotti.push('IL CONTO DEI Math.random() E\' CAMBIATO: ' + casoPrima + ' -> ' + casoDopo +
             ' (regola della casa: i banchi a seme fisso si sfasano)');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    taratura: cap=' + CAP + '  spr=' + SPR + '  riserva=' + RISERVA + '  qualita=' + QUALITA + '  morso=' + MORSO + '  strappo=' + STRAPPO + '  lontano=' + LONTANO);
console.log('    sorteggi: dado() ' + dadoPrima + ' prima, ' + dadoDopo + ' dopo (identico)' +
            '   ·   Math.random( ' + casoPrima + ' -> ' + casoDopo + ')');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
