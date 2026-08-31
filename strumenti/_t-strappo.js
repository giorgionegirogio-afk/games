/* =====================================================================
   _t-strappo.js — LO STRAPPO: la finta comandata, con UN DITO SOLO
   (27 agosto 2026; rivista il 28 agosto 2026 dopo una bocciatura).

   COSA E' CAMBIATO IL 28 AGOSTO, in tre righe, perche' chi legge sappia
   subito se sta leggendo la versione vecchia:
     · la finta era OBBLIGATORIA a ogni virata di TASTIERA — 88,1% di
       palloni staccati che nessuno aveva chiesto. Chiusa: §2bis, e la
       traversata del centro adesso vale solo sotto la levetta analogica.
     · il dito ALZATO poteva far partire uno strappo. Chiuso alla fonte,
       dentro Touch5.chiudi: ancoraggio 12/12 (gli ancoraggi erano 11).
     · il banco aveva un occhio solo (toccava solo la levetta). Adesso ha
       un BRACCIO DI TASTIERA: node strumenti/_p-strappo.js --tastiera.
   E due frasi false sono cadute, piu' una conclusione superata sulla
   suola che il gioco di oggi non conferma piu' (§3 e §6).

   ---------------------------------------------------------------------
   1. IL PUNTO DI PARTENZA, misurato e non ricordato.

   Oggi in CALCETTO esiste UNA cosa che si chiama finta, ed e' un latch
   di solo disegno: aggiornaPosa lo arma da solo quando il portatore
   inverte la marcia sopra 80 u/s con un avversario entro 40 unita', dura
   0,5 s, aspetta 2 s, e — sta scritto nel gioco — «non tocca palla,
   velocita' ne' fase: sono episodi di disegno sopra la stessa fisica».
   Il confronto col concorrente lo dice in tre voci (differenze.json, area
   D e G): «Repertorio di finte comandabili: ZERO mosse abilita'»,
   «Comando delle finte: nessun comando dedicato, perche' non ci sono
   finte da comandare», «Vantaggio meccanico della finta sul difensore:
   non e' mai esistito».

   E c'e' una quarta voce che vale piu' delle altre tre (area G, «Il
   pallone davanti al piede»): da noi «la palla e' cucita a una molla,
   non calciata, e fra un "tocco" e l'altro non c'e' niente da cui
   decelerare». Da loro il tocco e' un evento e «il pallone si stacca e
   si riprende, ED E' FRA I DUE CHE IL DIFENSORE RIENTRA».
   Quella frase e' il progetto di questa toppa.

   ---------------------------------------------------------------------
   2. IL GESTO: LA LEVETTA CHE ATTRAVERSA IL CENTRO.

   I quattro dischi di L1.6 sono TUTTI occupati quando hai il pallone
   (TIRA, PASSAGGIO, PASSA, CROSS): un quinto disco non c'e' dove
   metterlo — la coppia piu' stretta di oggi corre a 88,8 px contro 86 di
   prese sommate — e comunque una finta e' un MOVIMENTO, quindi il dito
   che la chiede e' quello che gia' muove.

   LO STRAPPO E' UNA TRAVERSATA DEL CENTRO, NON UN ANGOLO. Il comando di
   corsa (humanMove: levetta O tastiera) tiene una memoria levigata del
   proprio verso. C'e' strappo quando il comando SCENDE sotto
   STRAPPO_MORTO — cioe' il pollice attraversa il mezzo della levetta —
   e RIAPPARE, entro STRAPPO_LAMPO, girato di piu' di 60 gradi.

   Chi vira ARCUANDO da fuori non entra mai nel centro, quindi non
   strappa MAI: non per una taratura fortunata, per costruzione. Chi
   strappa ci passa per forza, perche' e' l'unico modo di andare da una
   parte all'altra della levetta in fretta.
   Quanto dura la traversata e' un conto e non un'opinione: la banda
   morta e' STICK_DEAD = 12 px piu' la rampa fino a STRAPPO_MORTO, cioe'
   un'escursione sotto i 22,2 px, cioe' 44 px di corsa del pollice. Un
   dito li attraversa in 37 ms a 1200 px/s e in 176 ms a 250 px/s:
   STRAPPO_LAMPO = 0,18 s copre anche lo strappo lento, e oltre quella
   soglia il dito non e' PASSATO, si e' FERMATO — e fermarsi non e' una
   finta.

   ---------------------------------------------------------------------
   2bis. E VALE SOLO SOTTO LA LEVETTA ANALOGICA. La riga che la prima
   stesura non aveva, e il difetto che le e' costato una bocciatura
   intera (28 agosto 2026).

   LA PRIMA STESURA DAVA LA FINTA ALLA TASTIERA SENZA CHE NESSUNO LA
   CHIEDESSE, e diceva pure il contrario nel commento spedito. Il conto
   sbagliato era questo: «fra D e A c'e' sempre un fotogramma a comando
   nullo, quindi la traversata del centro vale anche sui tasti». E' vero
   che c'e' il fotogramma nullo. E' FALSO che quel fotogramma sia una
   traversata. humanMove da tastiera restituisce -1/0/+1 normalizzati:
   NON ESISTE un'ampiezza analogica, quindi «rl < STRAPPO_MORTO» non
   vuol dire «il pollice ha attraversato il mezzo della levetta», vuol
   dire esattamente «nessun tasto di direzione premuto». E ogni virata
   di tastiera ci passa dentro, per forza, perche' fra un tasto e
   l'altro il dito lascia la tastiera muta.
   Risultato misurato sulla stesura vecchia (fuori/strappo.html contro
   fuori/_strappo-base.html, stesso script e stesso seme sui due bracci,
   griglia di 540 virate di tastiera a 90 gradi, NESSUNA finta chiesta):
       pallone distaccato dal piede   PRIMA 0,0%   DOPO 88,1%
       (a 56 e 70 unita' di distanza del difensore: 100%)
   Il duello non peggiorava — tenuta 78,3 -> 80,4, loro 11,1 -> 9,6 — e
   proprio per questo nessun cancello di rendimento lo avrebbe mai
   visto: il danno non era nel risultato, era che il verbo smetteva di
   essere COMANDATO. E si mangiava se stesso: STRAPPO_ATTESA = 1,10 s
   bruciata dal gesto involontario, quindi la guardia
   «if(p.strappoCd>0 || p.kickCd>0) return false» toglieva al giocatore
   di tastiera la finta VERA per 1,1 s dopo ogni virata. La cura si
   disattivava da sola proprio quando sarebbe servita.
   Anche l'esempio del commento era rovesciato: D poi W STRAPPA (90
   gradi sono piu' dei 60 di STRAPPO_DOT), non «D poi A strappa, D poi W
   no». E «si tengono premuti tutti e due, che fa x=0 lo stesso» vale
   solo per la coppia OPPOSTA (D+A): D+W da' la diagonale (0,707;
   -0,707), modulo 1, mai zero.

   LA GUARDIA, ED E' UNA CONDIZIONE E NON UNA TARATURA: il campione «nel
   centro» conta come traversata solo se in quell'istante c'era un dito
   sulla levetta E nessun tasto di direzione premuto (memCmd.stick,
   scritto nel ramo del centro di Touch5.passo e preteso nel
   riconoscimento). Una tastiera non ha un centro da attraversare;
   adesso il gioco lo sa. Dopo la guardia, sulla stessa griglia di 540
   virate di tastiera: pallone distaccato dal piede 0,0%, cioe'
   esattamente il gioco spedito, in tutte e 540.
   IL SECONDO TERMINE — «e nessun tasto premuto» — non e' zelo: c'e' un
   caso ibrido reale (portatile touch + tastiera) in cui un dito
   appoggiato DENTRO la banda morta tiene st.active=true mentre a
   comandare e' la tastiera, perche' humanMove sovrascrive i tasti solo
   sopra STICK_DEAD. Senza quel termine il difetto tornava intero su
   quella macchina. Costa quattro letture di Keys per squadra e per
   fotogramma, e solo per una squadra umana.

   SE LA FINTA DA TASTIERA LA SI VUOLE DAVVERO, serve un TASTO SUO —
   KMAP ha dieci voci per giocatore, tutte occupate: se ne aggiunge una,
   per esempio KeyF e Period — e una misura sua. Reinterpretare una
   virata non e' comandare un verbo, e questa toppa non lo fa. Sul
   telefono, che e' il bersaglio del progetto, non cambia niente.

   IL DITO ALZATO, stesso difetto in piccolo, chiuso ALLA FONTE. Il
   commento spedito diceva «dopo STRAPPO_OBLIO nel centro la memoria si
   dimentica del tutto: un pollice alzato e riappoggiato non ha
   strappato niente». Sbagliato per un pelo di cronometro: il cancello
   che decide e' STRAPPO_LAMPO = 0,18 s, che scatta PRIMA di
   STRAPPO_OBLIO = 0,30 s, quindi la memoria non fa in tempo a
   dimenticare — e Touch5.chiudi spegneva la levetta senza toccare
   memCmd (azzera() lo faceva, chiudi() no). Adesso chiudi() azzera
   memCmd della sua squadra, ed e' il dodicesimo ancoraggio: «alzare il
   dito non fa mai partire niente» e' vero per costruzione e non per
   taratura. (La guardia memCmd.stick lo chiuderebbe comunque — a dito
   alzato st.active e' false — ma affidare una legge a un effetto
   collaterale di un'altra e' come affidarla a STRAPPO_OBLIO: funziona
   finche' nessuno tocca l'altra.)

   LA PRIMA STESURA LEGGEVA IL SOLO PRODOTTO SCALARE contro una memoria
   levigata, senza guardare il centro, ed e' BOCCIATA con la sua misura:
   con la soglia a 110 gradi il taglio a 90 — cioe' lo SCARTO, meta' del
   repertorio — non si accendeva MAI (0 accensioni su 810 duelli di
   banco), perche' 90 gradi non sono 110; e abbassando la soglia si
   accendeva anche la virata arcuata, perche' un filtro del primo ordine
   su un vettore che ruota sfasa fino a 90 gradi e li puo' sfiorare. La
   traversata del centro chiude tutti e due i lati con una condizione
   sola, e il prodotto scalare resta solo a dire QUANTO si e' girato.

   E non ruba nessun verbo: il rilascio della levetta e' INERTE da mesi
   (Touch5.release torna false), l'anello s.hist non lo legge nessuno,
   e un'inversione del pollice oggi produce esattamente «gira».

   ---------------------------------------------------------------------
   3. COSA FA: IL PALLONE SI STACCA. Due gesti, un gesto solo.

   Il verso dello strappo rispetto alla FACCIA del portatore decide, e
   sono i due soli gesti che servono — poche cose distinguibili battono
   ventotto nomi propri:
     · di lato (fino a 115 gradi)  SCARTO. Il pallone parte DOVE PUNTA IL
       POLLICE a 110 u/s piu' un decimo della corsa che avevi, e si porta
       dietro il 45% del tuo slancio: a piena corsa sono ~157 u/s in
       diagonale. Serve a passare un uomo, e lo passa.
     · all'indietro (oltre 115)    SUOLA. Il pallone torna indietro piano
       (60 u/s + 15% della corsa) e tu ci giri sopra. NON serve a passare
       un uomo e infatti non lo passa: 46% contro il 47% di una virata
       secca (edizione 28 ago 2026; il 27 agosto erano 48 e 49).
       RETTIFICA, ED E' LA PIU' IMPORTANTE DI QUESTA REVISIONE: il 27
       agosto qui c'era scritto «serve a NON PERDERLO sotto pressione, e
       la palla finisce all'avversario nel 9% dei casi contro il 14%».
       Sul gioco del 28 agosto quel guadagno NON C'E' PIU': 18% contro
       19%, cioe' niente (270 duelli per cella, sigma 2,4 punti). Il
       gioco e' cambiato sotto — _t-spazio, _t-portiere BT, _t-seme,
       _t-registro, _t-rete — e con lui i palloni vaganti. Oggi della
       suola si puo' dire una cosa sola con onesta': gira il corpo e non
       salta l'uomo. Chi la vorra' utile le trovi un mestiere e lo
       misuri; qui non si riscrive il 9% come se reggesse ancora.
   In tutti e due i casi b.owner diventa -1 e il piede va in pausa per
   STRAPPO_TOCCO = 0,18 s. QUELLA E' LA FINTA: un quinto di secondo in
   cui il pallone non e' di nessuno e chi arriva prima se lo prende — la
   raccolta a KICK_R*0,8 e il primo tocco sporco sono quelli di sempre,
   non ne nasce nessuna regola nuova.
   (I numeri della spinta non sono scelti a occhio: sono usciti da otto
   varianti misurate sullo stesso banco, e le sette bocciate stanno in
   fondo col loro numero. La QUOTA di slancio in particolare — quel 45% —
   e' la differenza fra una finta e un autopassaggio: senza, il banco
   dava uomo superato 16% contro il 63% di una virata secca.)

   AL DIFENSORE NON SI TOCCA NE' LA VELOCITA' NE' LA TESTA — GLI SI
   RIARMA LA REAZIONE, che e' un'altra cosa e che il gioco ha gia'.
   Niente stordimento (EA ce l'aveva, skill_move_stun, e l'ha tolto
   perche' faceva delle finte una scorciatoia), niente rallentamento,
   niente spinta: corre dove aveva deciso, alla sua velocita', e appena
   la sua reazione scade decide di nuovo con tutta la sua intelligenza.
   Quello che cambia e' che dopo una finta aspetta la SUA reazione
   INTERA (p.aiT = D.react, i numeri gia' scritti nella tabella delle
   difficolta': 0,42 / 0,25 / 0,12) invece di ripianificare alla fase in
   cui capitava di trovarsi. L'entita' del vantaggio la sceglie quindi la
   difficolta', non questa toppa: un difensore forte legge la finta quasi
   subito.

   E QUESTA RIGA NON E' UN LUSSO: senza, la finta REGALAVA il pallone.
   Con la palla al piede il difensore insegue un UOMO con uno standoff;
   con la palla libera insegue b.x + b.vx*lead, cioe' estrapola una
   RETTA — e un pallone spinto viaggia esattamente in retta. Il distacco
   rendeva il bersaglio PIU' prevedibile di prima. Misurato sulla griglia
   rapida, senza il riarmo: uomo superato 63,9% contro il 63,2% del gioco
   spedito, cioe' niente. Col riarmo il duello si sposta dove deve, e di
   piu' dove il difensore e' piu' bravo: +8 punti a Duro. Le varianti
   senza riarmo stanno in fondo, §10.

   Poi c'e' l'inerzia, e quella e' gratis: con P_ACC = 900 e P_SPEED =
   168, chi ti punta a tutta ci mette 0,19 s a fermarsi e 0,37 a
   invertire, e in quel tempo sfila di una trentina di unita'. Se non era
   lanciato non sfila, e la finta non gli fa niente — che e' giusto.

   L'UNICA COSA CHE IL PORTATORE RICEVE e' che le gambe erano GIA'
   caricate: p.ax/p.ay partono a P_ACC nella direzione nuova invece di
   salirci in 0,07 s (il limite di strappo di updatePlayerFisica, che
   esiste perche' «un corpo non passa da zero alla spinta massima in un
   sessantesimo: ci mette il tempo di caricare le gambe»). In una finta
   le gambe SONO caricate: e' la definizione. Rispetta P_ACC, quindi non
   produce nessuno scatto brusco per misura.js.
   E il comando resta all'uomo che ha strappato (G.swLock): un cambio
   automatico che ti togliesse l'uomo nel mezzo della tua finta sarebbe
   la cosa peggiore che questo gioco possa fare.

   ---------------------------------------------------------------------
   4. COME FALLISCE — quattro modi, NESSUNO DEI QUALI E' UN DADO NUOVO,
   piu' un quinto che NON c'e' e che va detto lo stesso.

     a) A NESSUNO. Non si rifiuta lo strappo quando non c'e' nessuno da
        saltare: una finta che non si puo' sbagliare non e' una finta.
        Nel vuoto si perde la corsa in avanti, si sta 0,18 s senza
        pallone e si aspetta 1,10 s prima di poterne fare un'altra.
     b) NON CI CASCA, ed e' il fallimento MISURATO. Contro un difensore
        che non si impegna — Facile, che pressa a 54 unita' di standoff e
        ripianifica ogni 0,42 s — lo strappo PEGGIORA le cose: uomo
        superato 79% -> 76%. Chi finta uno che sta a guardare si toglie
        da solo il pallone dai piedi.
     c) TROPPO TARDI. A 26-34 unita' il difensore e' gia' addosso e non
        c'e' piu' niente da anticipare: uomo superato 60% -> 60% e
        57% -> 59%, cioe' zero. Il guadagno comincia a 44 unita'
        (68% -> 75%), che e' un passo e mezzo: la finta ha un MOMENTO.
     d) I PIEDI. Il pallone che si riprende passa dalla raccolta normale,
        cioe' dal PRIMO TOCCO SPORCO, che pesa gia' velocita', angolo,
        pressione e TECNICA. Non una riga nuova.

     E IL QUINTO, CHE NON C'E': strappare tardi non COSTA piu' di una
     virata normale (a 26 unita' il pallone finisce all'avversario nel
     15% dei casi contro il 17% del gioco spedito: dentro il rumore). Il
     fallimento oggi e' NEUTRO, non punitivo. Chi vorra' renderlo
     costoso — per esempio un tocco piu' lungo quando l'avversario e'
     gia' dentro il raggio di raccolta — porti la sua misura: qui non si
     aggiunge una punizione che nessuno ha pesato.

   ---------------------------------------------------------------------
   5. IL CASO NON SI SPOSTA DI UN NUMERO, ED E' PROVATO AL BIT.

   Lo strappo vive SOLO sotto il dito: Touch5.passo salta le squadre CPU
   alla prima riga, e provaStrappo si chiama solo dal ramo isHuman di
   updatePlayerFisica. In CPU contro CPU — che e' il banco di casa
   (_eventi.js, _q-meta.js, equita.js, seme.js, collaudo.js) — questo
   codice non esegue una riga e non pesca un numero. Il conto delle
   chiamate a dado() nel file resta quello di partenza, e la toppa si
   RIFIUTA di scrivere se cambia: e' un «atteso», non una promessa.
   (Fino al 27 agosto l'atteso contava Math.random(). Dal 28 non serve
   piu' a niente: _t-seme.js ha portato tutto il caso dentro dado(), e
   nel gioco restano cinque Math.random() di cui quattro sono commenti.
   L'atteso conta dado() — 86 chiamate — e Math.random() gli sta accanto
   solo come porta di servizio.)

   PROVA, RIFATTA SUL GIOCO DEL 28 AGOSTO: node strumenti/_eventi.js
   --taglia 11 --partite 100 --seme 20260803, cento partite CPU contro
   CPU sul gioco base e sul gioco curato, crudo contro crudo:
       PARTITE CON VETTORE DI EVENTI DIVERSO: 0 su 100
       i due file JSON dei crudi sono la STESSA stringa.
   Non «le mediane coincidono»: ogni partita, evento per evento.
   E i due cancelli grossi, sul gioco curato (fuori/strappo2.html):
       node strumenti/collaudo.js --gioco fuori/strappo2.html
         36 controlli, 36 passati
       node strumenti/_q-meta.js --tre-taglie --gioco fuori/strappo2.html
         82 controlli, 82 passati
         (0-0: 5v5 3%, 7v7 10%, 11v11 30% con soglia 33%)

   ---------------------------------------------------------------------
   6. QUANTO RENDE — banco strumenti/_p-strappo.js, 810 duelli per
   braccio, stesso script di pollice, stesso seme per duello.

   Un portatore lanciato, un difensore piazzato a distanza, angolo e
   impegno dichiarati, due uomini parcheggiati in casa perche' i ruoli di
   squadra abbiano un senso. Il pollice corre dritto trenta fotogrammi,
   STRAPPA (passa dal centro e riappare), tiene il taglio un quarto di
   secondo e poi RADDRIZZA VERSO LA PORTA — perche' e' quello che fa chi
   gioca, ed e' la correzione che ha reso onesto questo banco (§10).
       uomo superato   il pallone e' ancora mio E il difensore e' dietro
                       di me E sono piu' avanti di dove ho strappato
       tenuta          il pallone e' mio, oppure e' libero e ci arrivo io
       loro            il pallone e' del difensore

   EDIZIONE 28 AGOSTO 2026, rimisurata da capo sul gioco di oggi. I
   numeri del 27 agosto — che stanno qui sotto, e non si cancellano —
   sono stati presi su un gioco che nel frattempo e' cambiato in cinque
   punti (_t-spazio, _t-portiere BT, _t-seme, _t-registro, _t-rete).
   Non si mescolano: si mette una data accanto a ciascuno.

                                  PRIMA      DOPO      (28 ago 2026)
     UOMO SUPERATO                65,6%      67,7%
     tenuta                       68,0%      71,0%
     pallone perso al difensore   14,8%      12,8%
     pallone staccato dal piede    0,0%      88,1%
     stacco mediano (unita')        15,6       16,5

   E il guadagno non e' spalmato: sta dove una finta serve.
                            uomo superato PRIMA -> DOPO   (28 ago 2026)
     difficolta' Facile         77%  ->  74%    (-3: non ci casca)
     difficolta' Normale        71%  ->  73%
     difficolta' Duro           49%  ->  56%    (+7)
     difensore a 26 unita'      60%  ->  59%    (tardi)
     difensore a 34 unita'      54%  ->  55%
     difensore a 44 unita'      66%  ->  71%    (+5: il momento giusto)
     difensore a 56 unita'      72%  ->  73%
     difensore a 70 unita'      77%  ->  80%
     taglio  +90 (scarto)       77%  ->  79%
     taglio  -90 (scarto)       72%  ->  78%
     taglio  175 (suola)        47%  ->  46%    e «loro» 19% -> 18%

   LA FORMA E' LA STESSA DEL 27 AGOSTO, I NUMERI NO, E UNA CONCLUSIONE E'
   CADUTA. Tiene tutto quello che tiene: il guadagno sta a Duro (+7) e al
   momento giusto (44 unita', +5), non tiene a Facile (-3) e non tiene
   tardi (26-34 unita'). CADE INVECE la riga della suola: il 27 agosto
   «loro» faceva 14% -> 9% e la suola si spediva come il gesto che NON
   perde il pallone; oggi fa 19% -> 18%, cioe' niente. Su questo gioco la
   suola gira il corpo e basta. Non si tiene un merito che il righello
   non trova piu'.
   (Il 12% di strappi che non partono e' il gesto RIFIUTATO: piede in
   pausa, attesa non scaduta, pallone gia' perso.)

   E LA TABELLA DEL 27 AGOSTO, per chi confronta le due edizioni: uomo
   superato 67,7 -> 69,9; tenuta 70,2 -> 73,2; loro 10,6 -> 8,4; stacco
   14,6 -> 16,0; Facile 79->76, Normale 72->74, Duro 52->60; 26 u 60->60,
   34 u 57->59, 44 u 68->75, 56 u 74->75, 70 u 79->81; +90 79->81,
   -90 75->81, suola 49->48 con «loro» 14->9.

   AVVERTENZA SUL RIGHELLO, perche' nessuno legga piu' di quanto c'e':
   810 duelli danno sigma 1,7 punti su una percentuale attorno al 66%.
   Il +2,1 complessivo e' poco piu' di un sigma — un indizio, non una
   sentenza. La riga che tiene da sola e' Duro +7 (sigma 3,0 su 270
   duelli, cioe' 2,3 sigma); i 44 unita' +5 sono 1,4 sigma su 162
   duelli, cioe' MENO SOLIDI di quanto lo fossero il 27 agosto, e si
   scrive. Il numero complessivo e' piccolo perche' MEDIA insieme i casi
   in cui la finta serve e quelli in cui non deve servire, ed e' giusto
   che li contenga tutti.

   E IL BRACCIO CHE IL 27 AGOSTO NON C'ERA — LA TASTIERA.
   node strumenti/_p-strappo.js --tastiera, 540 virate normali (corri a
   destra, molla, due fotogrammi di buco, premi su/giu'), piu' un
   ventaglio di buchi 0/1/2/5/10 fotogrammi. Nessuno chiede una finta:
   tutte le colonne devono valere quelle del gioco spedito.
                                    BASE    TOPPA 27 ago    OGGI
     pallone distaccato dal piede    0,0%       88,1%       0,0%
     strappo acceso (strappoCd>0)    0,0%       89,3%       0,0%
     a 56 e a 70 unita'              0,0%      100,0%       0,0%
     tenuta                         78,3%       79,1%      78,3%
   E non «si somigliano»: i due file crudi — gioco spedito e gioco
   curato, 540 virate ciascuno — sono la STESSA stringa, virata per
   virata. La colonna «TOPPA 27 ago» e' misurata oggi su una copia della
   toppa curata a cui e' stata tolta la sola guardia (m.stick), cosi' il
   confronto e' fra due file che differiscono per DUE PAROLE:
   fuori/_strappo2-senza-guardia.html.
   (Il ventaglio dei buchi ha celle da sei prove: indicative, non
   sentenze. L'unica riga da leggere e' che a buco 10 fotogrammi anche il
   GIOCO SPEDITO perde il pallone nel 33% dei casi — dieci fotogrammi
   fermi con un difensore addosso sono una palla persa, non uno strappo.
   Le celle pulite sono 0-5, e li' base e curato fanno 0,0% tutti e due.)

   E LA GUARDIA NON COSTA NIENTE DOVE IL GESTO VIVE: gli 810 duelli di
   LEVETTA della copia curata e quelli della copia senza guardia sono
   anch'essi la stessa stringa, duello per duello. La cura toglie il
   verbo dove nessuno l'aveva chiesto e non lo sfiora dove e' comandato.

   E IL DITO ALZATO, che una percentuale non sa raccontare: tre gesti
   deterministici, strumenti/_sonda-strappo-dito.js.
     A  dito alzato, due fotogrammi, riappoggiato girato di 90 gradi
     B  dito alzato DENTRO il centro e ripiantato nello stesso intervallo
        fra due passi (touchend + touchstart + touchmove senza un
        fotogramma in mezzo)
     C  CONTROLLO: la traversata vera, il dito non si alza mai
                                     A      B      C
     gioco spedito (senza il verbo)  0      0      0   (atteso 0,0,0)
     toppa senza la guardia stick    0      0      1   (atteso 0,0,1)
     toppa senza l'ancora 12/12      0      1      1   ROSSO su B
     toppa di oggi                   0      0      1   (atteso 0,0,1)
   LE DUE COPIE DI CONTROLLO SI RIFANNO IN UNA RIGA, e vale la pena
   tenerle: sono l'unica prova che i cancelli non sono ciechi.
     fuori/_strappo2-senza-guardia.html   strappo2.html con «m.stick && »
                                          tolto dal riconoscimento
     fuori/_strappo2-senza-chiudi.html    strappo2.html con la riga di
                                          memCmd tolta da Touch5.chiudi
   LA RIGA CHE CONTA E' LA TERZA, e serve a dire che l'ancora 12/12 non
   e' un doppione della guardia: il caso B — il dito che si stacca mentre
   e' gia' dentro la banda morta e si ripianta girato prima che passi un
   fotogramma — lascia memCmd con «fermo» maggiore di zero e «stick»
   ancora vero, e la guardia non lo vede. Solo l'azzeramento dentro
   Touch5.chiudi lo chiude. Il caso A invece e' chiuso da tutte e due, ed
   e' giusto che sia ridondante: e' la legge scritta due volte.

   ---------------------------------------------------------------------
   7. IL COSTO, e la parte in cui il banco dice di non saperlo.

   node strumenti/_p-strappo.js --costo, cinque finestre da 3000 passi
   con la levetta che gira (il ramo dello strappo attraversato a ogni
   fotogramma), otto corse alternate:
       base    0,162  0,174  0,173  0,103  0,115  ms/passo
       curato  0,109  0,120  0,099  0,127  0,118  ms/passo
   La differenza fra i due bracci e' PIU' PICCOLA della dispersione fra
   corse dello stesso braccio, e la dispersione ha una causa nota che non
   e' il codice: chi gira per SECONDO e' sempre il piu' veloce (invertito
   l'ordine, si inverte il risultato). Quindi il costo qui non e'
   misurabile, e scrivere «e' zero» sarebbe attestare invece di misurare.
   IL CONTO A MANO, che invece si puo' fare: per fotogramma e per squadra
   UMANA una chiamata a humanMove (il gioco ne fa gia' da cinque a nove),
   due radici, una dozzina di moltiplicazioni e un vettore di due
   allocato. Il riarmo della reazione e' un giro su al massimo ventidue
   uomini UNA volta per strappo, cioe' meno di una volta al secondo. A
   mani libere e in CPU contro CPU il ciclo esce alla prima riga: sul
   telefono, in menu e in dimostrazione, il costo e' esattamente zero.

   ---------------------------------------------------------------------
   8. LE POSE, e cosa manca davvero.

   Il rig ha 21 clip. Lo scarto riusa 'finta' (poseFinta: doppio tocco
   d'interno, il busto che sporge oltre il bacino) entrando a u = 0,26 —
   cioe' ESATTAMENTE sull'affondo del primo tocco, non 0,26 s dopo come
   farebbe partendo da capo — e uscendo col seguito; la suola riusa
   'frenata' (poseFrenata: il compasso dei piedi e i SOLCHI, che la clip
   getta da sola col suo descrittore polvere, senza una riga di
   particelle in piu' e senza un sorteggio in piu'). Sono riusi onesti —
   una suola vista dall'alto E' una frenata — ma sono riusi, e vanno
   dette le tre pose che servono e che questa toppa NON scrive, perche'
   una clip nuova e' un lavoro di sagoma e di provino cieco
   (?banco=silhouette), non una riga:
     · 'scarto'   il peso che va tutto sull'appoggio SBAGLIATO e poi la
                  spinta: quattro fotogrammi chiave, e la differenza con
                  poseFinta e' che il piede tocca UNA volta sola invece
                  di due, quindi la clip non deve tornare su se stessa;
     · 'suola'    la pianta SOPRA il pallone, la caviglia che lo copre e
                  il bacino che gira: sarebbe l'unica posa del gioco in
                  cui un piede sta sopra la palla, quindi la sua funzione
                  palla avrebbe un offset di QUOTA e non solo laterale —
                  e nessuna delle 21 clip di oggi lo fa;
     · 'inciampo' il fallimento. Oggi una finta persa si vede solo
                  perche' il pallone se ne va; il concorrente ha un
                  sistema apposta (StumbleWeightCurves). Senza questa
                  clip, dal corpo non si legge la differenza fra «l'ho
                  sbagliata» e «me l'hanno rubata».
   NOTA: registraFotogramma non salva ne' fintaT ne' frenaT, quindi la
   moviola del gol non rivede la finta — esattamente come oggi non rivede
   la finta automatica. Aggiungere due campi al fotogramma e' facile;
   farlo QUI vorrebbe dire cambiare la moviola dentro una toppa che parla
   di dita, e non si fa.

   ---------------------------------------------------------------------
   9. IL REGISTRO DEI FATTI (in arrivo in parallelo: non se ne costruisce
   uno qui). provaStrappo e' il posto in cui emettere:
       { quando: durataPartita()-G.timeLeft, che: 'strappo',
         quale: 'scarto' | 'suola', chi: pi, dove: [p.x, p.y],
         bersaglio: <indice dell'avversario piu' vicino, o -1>,
         esito: da risolvere DOPO }
   L'esito non e' noto nell'istante del gesto: si sa 0,18-0,60 s dopo, da
   CHI ha raccolto il pallone. Il fatto va quindi APERTO qui e CHIUSO
   dalla raccolta (updateBall), come _eventi.js fa col tiro. Il punto
   d'aggancio e' segnato nel codice con la sigla «FATTO:».

   ---------------------------------------------------------------------
   10. LE BOCCIATURE, COI NUMERI, perche' nessuno le riprovi.

   PRIMA, E VALE PIU' DI TUTTE LE ALTRE: UN BANCO SBAGLIATO. La prima
   stesura di _p-strappo.js teneva la levetta nella direzione del taglio
   per tutto il secondo e mezzo. Ma nessuno gioca cosi': si taglia per
   togliersi da davanti a un uomo, e appena lo si e' passato si torna a
   puntare la porta. Con la levetta bloccata di traverso il banco
   misurava una FUGA — «quanto mi allontano» — e la fuga la vince sempre
   chi ha il pallone cucito ai piedi, cioe' il gioco spedito, per
   costruzione: qualunque distacco del pallone e' una perdita secca.
   Con quella domanda TUTTE e cinque le prime varianti erano rosse
   (tenuta 52-62% contro 65,3%) e la conclusione sarebbe stata «le finte
   non servono a questo gioco» — falsa, e presa da un banco che non
   giocava a calcio. Chi rifara' un banco di duello: lo script del
   pollice deve RADDRIZZARE VERSO LA PORTA dopo il gesto.
   (Un secondo difetto dello stesso banco, piu' piccolo e piu' stupido:
   con UN solo uomo di movimento per squadra il cervello di squadra lo
   nomina ULTIMO UOMO e nessuno diventa pressatore — il "difensore" si
   ritirava a casa e il distacco mediano usciva 256 unita'. Servono due
   uomini per parte, uno parcheggiato.)

   SECONDA: IL RICONOSCIMENTO A SOLO PRODOTTO SCALARE. Vedi §2: con la
   soglia a 110 gradi lo SCARTO (taglio 90) non si accendeva MAI, 0 volte
   su 810 duelli. Abbassando la soglia si accende la virata arcuata.
   La traversata del centro chiude i due lati insieme.

   TERZA: LA SPINTA SENZA QUOTA DI SLANCIO (variante A: V0 150, VK 0,45,
   QUOTA 0, tocco 0,26 s). Un tocco che azzera la corsa in avanti del
   pallone lo lascia INDIETRO, e chi lo insegue — cioe' tu — ci arriva
   con la propria inerzia contraria addosso. Sulla griglia rapida:
   uomo superato 16,0% contro il 63,2% del gioco spedito. Non «peggio»:
   distrutto. E' la misura che ha fatto nascere STRAPPO_QUOTA.

   QUARTA: LE VARIANTI SENZA RIARMO DELLA REAZIONE. Cinque tarature
   diverse della sola spinta, griglia rapida (144 duelli), contro il
   63,2% di uomo superato del gioco spedito:
       A  V0 150  VK 0,45  QUOTA 0,00  tocco 0,26   superato 16,0%
       B  V0 130  VK 0,15  QUOTA 0,35  tocco 0,22   superato 52,8%
       C  V0 110  VK 0,10  QUOTA 0,45  tocco 0,18   superato 63,9%
       D  V0 150  VK 0,20  QUOTA 0,35  tocco 0,22   superato 49,3%
       E  V0 120  VK 0,12  QUOTA 0,55  tocco 0,16   superato 61,1%
   La migliore delle cinque PAREGGIA e basta (63,9 contro 63,2, dentro il
   rumore). La conclusione non e' «taratura sbagliata»: e' che senza il
   riarmo della reazione il pallone libero e' un bersaglio piu' facile da
   leggere di un uomo (§3), e nessuna taratura della spinta puo'
   rimediare a una cosa che sta dall'altra parte del duello.

   QUINTA: LA SPINTA GROSSA COL RIARMO (variante H: i numeri di B piu'
   il riarmo). Superato 55,6% sulla griglia rapida contro 67,4-68,1% di
   F e G. Il riarmo non salva una spinta troppo forte: se il pallone
   scappa, scappa per tutti e due.

   LE DUE SOPRAVVISSUTE, griglia intera (810 duelli), uomo superato:
       F  V0 110  VK 0,10  QUOTA 0,45  tocco 0,18  raggio 70   69,9%
       G  V0 120  VK 0,12  QUOTA 0,55  tocco 0,16  raggio 70   69,8%
   Pari nei numeri. Si spedisce F, e la ragione non e' nei numeri: ha il
   tocco piu' lungo (0,18 contro 0,16) e la quota piu' bassa, cioe' il
   pallone si stacca di piu' e per piu' tempo. Il gesto SI VEDE meglio e
   il rischio esiste di piu'. A parita' di resa si sceglie la versione in
   cui la finta e' piu' finta.

   COSA NON E' STATO FATTO, E PERCHE'
     · LA CPU NON STRAPPA. Una finta della macchina e' un'altra cura, con
       una sua decisione («quando conviene?») e una sua misura, e
       sposterebbe TUTTI i banchi a seme fisso di questa casa. Farla
       qui avrebbe reso non confrontabile ogni misura precedente.
     · IL TUNNEL non e' un verbo. Verrebbe gratis — il pallone lento non
       urta i corpi, quindi passa gia' fra le gambe — ma per NOMINARLO
       serve sapere se il pallone e' passato dentro la sagoma di un
       avversario che poi non l'ha preso, e quella e' una risposta che
       arriva mezzo secondo dopo il gesto: e' un FATTO del registro, non
       una riga di provaStrappo. Va fatto col registro, non prima.
     · NIENTE PUNTEGGIO, NIENTE CONTATORE, NIENTE STELLE. Il concorrente
       ha 28 mosse, un editor e un livello per giocatore; noi abbiamo due
       gesti e nessun requisito. Chi ha i piedi buoni gia' guadagna, e
       guadagna dal canale che esiste (il primo tocco sporco pesa la
       TECNICA): un secondo canale «non puoi fare questa mossa» sarebbe
       un divieto invece di una differenza.
     · LA FINTA DA TASTIERA. Non si fa reinterpretando una virata — ci si
       e' provato e la misura l'ha bocciata, §2bis. Si fa con un tasto
       dedicato (KMAP ha dieci voci per giocatore, tutte occupate: ne
       servirebbe un'undicesima, per esempio KeyF e Period) e con un banco
       suo. Sul telefono, che e' il bersaglio del progetto, non manca
       niente; su tastiera manca un verbo, e la lavagna adesso lo DICE
       invece di prometterlo.

   ---------------------------------------------------------------------
   11. IL VERBALE DEL CRITICO DEL 28 AGOSTO 2026, e cosa ne e' stato.

   Quattro accuse, tutte reali, tutte chiuse; e una quinta cosa che il
   critico ha controllato e trovato sana, che si tiene scritta perche' il
   prossimo non la ricontrolli a vuoto.
     1. «Sulla tastiera la finta non e' comandata: e' obbligatoria a ogni
        virata» — VERA e misurata (88,1% su 540). Chiusa con memCmd.stick,
        ancoraggi 4/12 e 5/12. Oggi 0,0%, e i crudi coincidono col gioco
        spedito virata per virata.
     2. «La toppa dichiara il contrario in tre posti» — VERA. «D poi A
        strappa, D poi W no» e «o si tengono premuti tutti e due, che fa
        x=0 lo stesso» sono cadute (§2bis e commento spedito); «il tasto
        opposto» sulla lavagna e' diventato «serve la levetta: la tastiera
        non ha un centro da attraversare».
     3. «Il dito alzato: STRAPPO_LAMPO scatta prima di STRAPPO_OBLIO, e
        chiudi() non tocca memCmd» — VERA, e il critico l'aveva data come
        INDIZIO e non come sentenza. E' peggio di un indizio: la sonda
        deterministica trova il caso B (dito alzato dentro il centro e
        ripiantato nello stesso intervallo) e nessuna delle altre difese
        lo copre. Chiuso alla fonte, ancoraggio 12/12.
     4. «Il banco non ha un braccio di tastiera» — VERA, ed e' la piu'
        importante delle quattro: senza quel braccio il difetto 1 era
        invisibile a tutti i cancelli di casa. Aggiunto, --tastiera, con
        la controprova che LO VEDE (88,1% su una copia senza la guardia).
     5. Sano e ricontrollato oggi: «pi» e' in scope al punto d'inserimento
        (CALCETTO-il-gioco.html:13397, la chiamata sta a 13419); il ramo
        umano non gira in CPU contro CPU; il latch nasce e muore in un
        passo; le classi CSS della lavagna esistono. In piu', sul gioco
        del 28 agosto: il conto dei sorteggi non e' piu' Math.random() ma
        dado(), 86 chiamate, e l'atteso della toppa e' stato spostato di
        conseguenza (contare Math.random() oggi vuol dire contare quattro
        commenti — un cancello che si apre da solo).

   Cancello:   node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803
               deve tornare IDENTICO, partita per partita, al gioco base
               (28 ago 2026: 0 partite diverse su 100, crudi stessa stringa)
   Tastiera:   node strumenti/_p-strappo.js --tastiera --gioco fuori/strappo2.html
               «distaccato» e «acceso» devono valere 0,0% come sul base
   Dito su:    node strumenti/_sonda-strappo-dito.js --gioco fuori/strappo2.html
               tre controlli deterministici, tre passati
   Rendimento: node strumenti/_p-strappo.js --gioco fuori/strappo2.html --etichetta DOPO
   Costo:      node strumenti/_p-strappo.js --costo --gioco fuori/strappo2.html

   uso:  node strumenti/_t-strappo.js --out fuori/strappo2.html
         node strumenti/_t-strappo.js --variante G --out fuori/strappo-G.html
         node strumenti/_t-strappo.js --elenco
         node strumenti/_t-strappo.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* =====================================================================
   LE VARIANTI DELLA SPINTA — perche' la prima taratura era sbagliata, e
   si vede solo misurando.

   Cambia SOLO come parte il pallone: il gesto, il riconoscimento, le
   guardie e le pose sono identici in tutte. Chi tara una finta tara tre
   numeri e nient'altro:
     V0     u/s di spinta a giocatore fermo
     VK     quanta della corsa che avevi si aggiunge alla spinta
     QUOTA  quanta della TUA velocita' il pallone si porta dietro. E' il
            numero che la prima stesura non aveva (QUOTA 0) e che le e'
            costato la bocciatura: un tocco di piede non azzera la corsa
            del pallone, e un pallone che perde tutto lo slancio in
            avanti non si riprende piu' — chi lo insegue e' lui stesso,
            e ci arriva con la propria inerzia contraria addosso.
     TOCCO  s in cui il piede resta fermo, cioe' la durata del rischio.
   La suola non ha QUOTA per definizione: e' un gesto che FERMA.
   ===================================================================== */
const VARIANTI = {
  A: { V0:150, VK:0.45, QUOTA:0.00, TOCCO:0.26, SU0:70, SUK:0.20, RAGGIO:0 },
  B: { V0:130, VK:0.15, QUOTA:0.35, TOCCO:0.22, SU0:70, SUK:0.20, RAGGIO:0 },
  C: { V0:110, VK:0.10, QUOTA:0.45, TOCCO:0.18, SU0:60, SUK:0.15, RAGGIO:0 },
  D: { V0:150, VK:0.20, QUOTA:0.35, TOCCO:0.22, SU0:80, SUK:0.20, RAGGIO:0 },
  E: { V0:120, VK:0.12, QUOTA:0.55, TOCCO:0.16, SU0:60, SUK:0.15, RAGGIO:0 },
  /* da qui in giu' si aggiunge il RIARMO DELLA REAZIONE: vedi il commento
     dentro provaStrappo. RAGGIO = 0 lo spegne, ed e' cosi' che le prime
     cinque varianti non lo hanno. */
  F: { V0:110, VK:0.10, QUOTA:0.45, TOCCO:0.18, SU0:60, SUK:0.15, RAGGIO:70 },
  G: { V0:120, VK:0.12, QUOTA:0.55, TOCCO:0.16, SU0:60, SUK:0.15, RAGGIO:70 },
  H: { V0:130, VK:0.15, QUOTA:0.35, TOCCO:0.22, SU0:70, SUK:0.20, RAGGIO:70 },
};
const VAR = (arg('variante', 'F') + '').toUpperCase();
if (!VARIANTI[VAR]) { console.error('FALLITO: variante sconosciuta ' + VAR + ' (A..' + Object.keys(VARIANTI).pop() + ')'); process.exit(1); }
const V = VARIANTI[VAR];

const ANCORE = [

/* 1 — le costanti, accanto a quelle che governano il pallone al piede */
{
  nome: '1/12 le costanti dello strappo, accanto a CARRY_*',
  cerca: `const CARRY_SPINTA = 18;           // u di bersaglio in piu' a CARRY_V1`,
  metti:
`const CARRY_SPINTA = 18;           // u di bersaglio in piu' a CARRY_V1
/* =====================================================================
   LO STRAPPO — la finta comandata col pollice.

   IL GESTO, E LA COSA CHE LO DISTINGUE DA UNA VIRATA: IL DITO PASSA DAL
   CENTRO. Il comando di corsa (humanMove: levetta o tastiera) ha una
   memoria levigata del proprio verso. C'e' strappo quando, in un LAMPO,
   il comando scende sotto STRAPPO_MORTO — cioe' il pollice attraversa il
   mezzo della levetta — e RIAPPARE girato di piu' di 60 gradi.
   Chi vira arcuando fuori non entra mai nel centro e non strappa MAI,
   per costruzione e non per taratura. Chi strappa ci passa: e' l'unico
   modo di andare da una parte all'altra della levetta in fretta.
   Quanto dura la traversata e' un conto, non un'opinione: la banda morta
   vale STICK_DEAD = 12 px piu' la rampa fino a STRAPPO_MORTO, cioe' un
   comando sotto i 22,2 px di escursione — 44 px di corsa da attraversare.
   Un pollice li fa in 37 ms a 1200 px/s e in 176 ms a 250, quindi
   STRAPPO_LAMPO = 0,18 s copre anche lo strappo lento; oltre, il dito non
   e' passato: si e' FERMATO, e fermarsi non e' una finta.
   Dopo STRAPPO_OBLIO nel centro la memoria si dimentica del tutto.

   E SOLO SOTTO LA LEVETTA ANALOGICA, per costruzione. Da tastiera
   humanMove torna -1/0/+1 normalizzati: non c'e' ampiezza, quindi «il
   comando e' sotto STRAPPO_MORTO» non vuol dire «il pollice ha
   attraversato il centro», vuol dire «nessun tasto premuto» — e OGNI
   virata di tastiera ci passa dentro, perche' fra un tasto e l'altro la
   tastiera tace. (E non si scappa tenendoli premuti tutti e due: D+A fa
   zero, ma D+W da' la diagonale piena.) Percio' la traversata conta
   solo se in quell'istante c'era un dito sulla levetta E nessun tasto
   di direzione premuto: e' memCmd.stick, scritto qui sotto nel ramo del
   centro. Misurato prima della guardia, su 540 virate di tastiera a 90
   gradi senza che nessuno chiedesse una finta: il pallone si staccava
   dal piede nell'88,1% dei casi. Con la guardia: 0,0%, come sul gioco
   spedito. Chi vorra' la finta da tastiera le dia un TASTO SUO e una
   misura sua — reinterpretare una virata non e' comandare un verbo.

   LA SPINTA. Il pallone parte DOVE PUNTA IL POLLICE, non dove
   converrebbe: e' l'unico contratto che chi gioca puo' imparare in un
   secondo. Quanto lontano lo decide la corsa che avevi, perche' un
   pallone spinto di lato da fermo non e' una finta, e' un appoggio.
   Non scala con la taglia del campo (niente KPASSO): qui si salta un
   CORPO, e P_R e P_SPEED sono gli stessi su tutti e tre i campi.

   IL TOCCO. STRAPPO_TOCCO e' il tempo in cui il piede sta fermo e il
   pallone non e' di nessuno. E' il rischio, cioe' la finta.
   ===================================================================== */
const STRAPPO_MORTO  = 0.30;  // ampiezza di comando sotto la quale il dito e' "nel centro"
const STRAPPO_MEM    = 0.45;  // ampiezza minima della memoria: sotto, non c'e' un verso da tradire
const STRAPPO_DOT    = 0.50;  // coseno: oltre 60 gradi di scarto e' una virata, non una correzione
const STRAPPO_LAMPO  = 0.18;  // s: quanto puo' durare la traversata del centro
const STRAPPO_TAU    = 0.13;  // s: costante di tempo della memoria del comando
const STRAPPO_OBLIO  = 0.30;  // s nel centro dopo i quali la memoria non vale piu'
const STRAPPO_ATTESA = 1.10;  // s fra uno strappo e il successivo
const STRAPPO_TOCCO  = ${V.TOCCO.toFixed(2)};  // s in cui il pallone non e' di nessuno
const STRAPPO_DIETRO = -0.42; // coseno: sotto, lo strappo e' una SUOLA e non uno SCARTO
const STRAPPO_RAGGIO = ${V.RAGGIO};   // u: entro quanto un avversario "vede" la finta (0 = nessun riarmo)
const SCARTO_V0 = ${V.V0}, SCARTO_VK = ${V.VK};   // u/s: spinta fissa + quota della corsa
const STRAPPO_QUOTA = ${V.QUOTA.toFixed(2)};  // quanta della TUA corsa se ne porta il pallone
const SUOLA_V0  = ${V.SU0},  SUOLA_VK  = ${V.SUK};   // la suola trattiene: torna indietro piano`,
},

/* 2 — il cronometro dell'attesa nasce con l'uomo */
{
  nome: '2/12 il campo strappoCd nasce col giocatore',
  cerca: `    frenaT:0, frenaAcc:0, fintaT:0, fintaCd:0, mesto:0, presaT:0, rinvT:0,`,
  metti:
`    frenaT:0, frenaAcc:0, fintaT:0, fintaCd:0, mesto:0, presaT:0, rinvT:0,
    /* strappoCd NON e' un latch del rig: e' l'attesa fra due finte
       COMANDATE, e sta di proposito lontano da fintaCd. Se lo strappo
       usasse fintaCd, la finta automatica di aggiornaPosa — che si arma
       da sola a ogni inversione di marcia — gli mangerebbe l'attesa e il
       gesto comandato smetterebbe di rispondere senza che si capisca
       perche'. Due meccaniche, due cronometri. */
    strappoCd:0,`,
},

/* 3 — e si azzera col fischio, come gli altri */
{
  nome: '3/12 il fischio azzera anche l\'attesa dello strappo',
  cerca: `    p.mesto=0; p.frenaT=0; p.fintaT=0; p.presaT=0; p.rinvT=0;   // i latch del rig`,
  metti: `    p.mesto=0; p.frenaT=0; p.fintaT=0; p.presaT=0; p.rinvT=0;   // i latch del rig
    p.strappoCd=0;                       // e l'attesa fra due finte comandate`,
},

/* 4 — il motore d'ingresso impara a ricordare il verso del comando */
{
  nome: '4/12 la memoria del comando e il latch dello strappo, in Touch5',
  cerca: `  atti: {},          // id del tocco -> l'atto vivo sotto quel dito`,
  metti:
`  atti: {},          // id del tocco -> l'atto vivo sotto quel dito

  /* =====================================================================
     LO STRAPPO — E DA QUI NON ESCE UN GESTO, ESCE UN DATO.

     E' la stessa legge scritta sopra questo motore: «Da qui non esce
     nessun gesto. Escono due dati». Adesso i dati sono tre. Questo dice
     «il comando di corsa di questa squadra ha appena SALTATO al
     contrario», e nient'altro: chi lo consuma (provaStrappo, dal ramo
     umano di updatePlayerFisica) decide se sia una finta, quale, e se si
     possa fare. Se nessuno lo consuma, il gioco non cambia di un bit.

     memCmd  la memoria levigata del comando, per squadra:
             {x,y,fermo,stick} — «fermo» sono i secondi passati col
             comando nel centro, «stick» dice se quel centro era il
             centro di una LEVETTA (dito giu', nessun tasto premuto)
             oppure solo il silenzio di una tastiera. Senza «stick» la
             tastiera strappava a ogni virata: vedi §2bis.
     strappo il dato del passo: {ux,uy} oppure null. Nasce e muore in un
             passo di simulazione, come deve fare un evento.
     ===================================================================== */
  memCmd: [ {x:0,y:0,fermo:0,daLevetta:false}, {x:0,y:0,fermo:0,daLevetta:false} ],
  strappo: [ null, null ],`,
},

/* 5 — il passo della simulazione aggiorna la memoria e accende il latch */
{
  nome: '5/12 Touch5.passo legge il comando e riconosce lo strappo',
  cerca: `  passo(dt){
    this.tempo+=dt;`,
  metti:
`  passo(dt){
    this.tempo+=dt;
    /* =====================================================================
       LA MEMORIA DEL COMANDO, e lo strappo che ne esce.

       Sta QUI e non dentro humanMove perche' humanMove e' chiamata da
       nove punti diversi del file, e piu' di una volta nello stesso
       fotogramma: una memoria aggiornata la' dentro avanzerebbe piu'
       volte per passo, e il suo tau non vorrebbe piu' dire niente. Qui avanza una volta sola, col dt FISSO della
       simulazione, che e' la Legge 1 — la stessa ragione per cui la
       tenuta degli atti batte qui e non su performance.now().

       A MANI LIBERE E IN CPU CONTRO CPU NON ESEGUE NIENTE: il ramo esce
       alla prima riga, e i banchi a seme fisso di questa casa (che sono
       tutti CPU contro CPU) non vedono un bit di differenza.

       LA MEMORIA SI CONGELA NEL CENTRO, non decade. Decadendo perderebbe
       il verso da tradire proprio nell'istante in cui il pollice lo sta
       attraversando — cioe' proprio quando serve. E il tempo passato nel
       centro si CONTA, perche' e' quello a dire se il dito e' passato o
       si e' fermato.

       E SI GUARDA CHE CENTRO SIA. Un comando nullo puo' voler dire due
       cose opposte: «il pollice sta attraversando il mezzo della
       levetta» oppure «la tastiera tace». La prima e' una traversata,
       la seconda e' il buco fra due tasti che c'e' in QUALUNQUE virata.
       Distinguerle e' l'unica cosa che separa una finta da una virata,
       e senza questa riga la tastiera strappava a ogni cambio di
       direzione: misurato, 88,1% di palloni staccati su 540 virate che
       nessuno aveva chiesto (§2bis di strumenti/_t-strappo.js).
       ===================================================================== */
    for(let t=0;t<2;t++){
      const m=this.memCmd[t];
      if(G.cpu[t]){ m.x=0; m.y=0; m.fermo=0; m.daLevetta=false; this.strappo[t]=null; continue; }
      const mv=humanMove(t);
      const rx=mv[0], ry=mv[1], rl=len(rx,ry);
      if(rl<STRAPPO_MORTO){
        /* il comando e' nel mezzo: la memoria tiene il verso e il
           cronometro della traversata avanza */
        m.fermo+=dt;
        /* =================================================================
           MA IL VERSO DI PRIMA VENIVA DA UNA LEVETTA?

           NON si guarda qui, e la prima stesura sbagliava proprio qui.
           Guardava «dito giu' E nessun tasto premuto» nell'istante del
           centro — ma in QUESTO ramo il comando e' quasi nullo, e da
           tastiera «comando nullo» vuol dire ESATTAMENTE «nessun tasto
           premuto». Il secondo termine era quindi vero in ogni virata
           normale: non proteggeva niente, e l'unica difesa restava
           sk.active, che un dito fermo sul vetro rende vero. Su un
           portatile con touchscreen — un dito appoggiato fra SOGLIA_LEVETTA
           (6) e STICK_DEAD (12), dove la levetta e' viva ma humanMove usa
           ancora i tasti — il difetto tornava intero, 88,1%.

           LA DOMANDA GIUSTA E' SUL VERSO DI PRIMA, non sul centro: una
           finta e' una levetta che attraversa il mezzo, quindi conta da
           dove veniva il vettore che si sta abbandonando. Lo si segna
           quando lo si memorizza (piu' sotto, m.daLevetta), con la stessa
           identica condizione che humanMove usa per preferire la levetta
           ai tasti — sopra la banda morta. Cosi':
             tastiera pura      il verso viene dai tasti  -> niente finta
             ibrido, dito fermo il verso viene dai tasti  -> niente finta
             levetta vera       il verso viene dal dito   -> finta
           ================================================================= */
        if(m.fermo>STRAPPO_OBLIO){ m.x=0; m.y=0; m.daLevetta=false; }
        this.strappo[t]=null;
        continue;
      }
      const ml=len(m.x,m.y);
      let s=null;
      if(m.fermo>0){
        /* IL DITO E' RIAPPARSO. Se e' passato dal CENTRO DELLA LEVETTA in
           un lampo e riappare girato di piu' di 60 gradi (il coseno
           STRAPPO_DOT), e' uno strappo. E il
           verso nuovo si prende COM'E', senza inseguirlo col tau: la
           memoria non deve piu' niente a una direzione che il dito ha
           gia' abbandonato. */
        if(m.daLevetta && m.fermo<=STRAPPO_LAMPO && ml>=STRAPPO_MEM &&
           (rx*m.x+ry*m.y)/(rl*ml) < STRAPPO_DOT) s={ ux:rx/rl, uy:ry/rl };
        m.x=rx; m.y=ry;
      }else{
        const k=Math.min(1, dt/STRAPPO_TAU); m.x+=(rx-m.x)*k; m.y+=(ry-m.y)*k;
      }
      /* DA DOVE VIENE QUESTO VERSO, segnato dove il verso si forma.
         La condizione e' la STESSA che humanMove usa per preferire la
         levetta ai tasti (attiva e oltre la banda morta): se fosse anche
         solo leggermente diversa, esisterebbe una fascia in cui il gioco
         obbedisce alla levetta e la finta crede alla tastiera, o il
         contrario. */
      const sk=this.stick[t];
      m.daLevetta = !!(sk && sk.active && len(sk.dx, sk.dy) > STICK_DEAD);
      m.fermo=0;
      this.strappo[t]=s;
    }`,
},

/* 6 — zero dita, stato neutro: vale anche per la memoria del comando */
{
  nome: '6/12 azzera() dimentica anche il verso del comando',
  cerca: `    this.atti={};`,
  metti:
`    this.atti={};
    /* «ZERO DITA, STATO NEUTRO» vale anche per la memoria del comando:
       al ritorno dal secondo piano il verso di mezzo minuto fa non e' un
       verso, e uno strappo contro di esso sarebbe una finta che nessuno
       ha chiesto. (Il ciclo di passo() la dimenticherebbe comunque dopo
       STRAPPO_OBLIO: questa riga la spegne SUBITO, che e' il contratto.) */
    for(let t=0;t<2;t++){ const m=this.memCmd[t]; m.x=0; m.y=0; m.fermo=0; m.daLevetta=false; this.strappo[t]=null; }`,
},

/* 7 — E ANCHE ALZARE UN DITO SOLO. azzera() copre la pausa e il secondo
        piano; ma il caso di tutti i giorni e' UN dito che si stacca e si
        riappoggia, e quello passa da chiudi(), che spegneva la levetta
        senza dire niente alla memoria del comando. Il commento spedito
        se la cavava con STRAPPO_OBLIO (0,30 s), ma il cancello che
        decide e' STRAPPO_LAMPO (0,18 s) e scatta prima: la memoria non
        faceva in tempo a dimenticare. Adesso la legge «alzare il dito
        non fa mai partire niente» e' vera per costruzione. */
{
  nome: '7/12 chiudi(): alzare il dito dimentica il verso del comando',
  cerca:
`        s.active=false; s.id=-1;
        this.release(t,s);
        s.dx=0; s.dy=0; s.hist=[];`,
  metti:
`        s.active=false; s.id=-1;
        this.release(t,s);
        s.dx=0; s.dy=0; s.hist=[];
        /* IL DITO SI E' ALZATO: la memoria del comando muore con lui.
           Senza questa riga il verso di prima sopravviveva al distacco e
           un dito riappoggiato girato entro STRAPPO_LAMPO produceva uno
           strappo che nessuno aveva chiesto — la stessa legge che
           azzera() applica alla pausa, applicata al gesto di ogni
           giorno. E' l'unico posto in cui una levetta viva si spegne per
           volonta' del dito. */
        { const m=this.memCmd[t]; m.x=0; m.y=0; m.fermo=0; m.daLevetta=false; this.strappo[t]=null; }`,
},

/* 8 — il verbo */
{
  nome: '8/12 provaStrappo: il pallone si stacca dal piede',
  cerca: `/* ---------- aggiornamento giocatore ---------- */
function updatePlayer(p,dt){`,
  metti:
`/* =====================================================================
   LO STRAPPO — SCARTO E SUOLA, e il quarto di secondo in cui il pallone
   non e' di nessuno.

   Questa e' l'unica cosa nuova che la finta fa al mondo: STACCA il
   pallone. Da noi il pallone e' cucito ai piedi da una molla (updateBall:
   b.vx=(tx-b.x)*14) e non si stacca MAI finche' non lo si calcia; qui si
   stacca, va dove punta il pollice, e per STRAPPO_TOCCO secondi il piede
   e' in pausa. In quel quarto di secondo chi arriva prima se lo prende,
   e ci arriva con la raccolta di sempre (KICK_R*0,8) e col primo tocco
   sporco di sempre: nessuna regola nuova, nessun dado nuovo.

   AL DIFENSORE NON SUCCEDE NIENTE, ed e' voluto. Niente stordimento
   (EA ce l'aveva, skill_move_stun, e l'ha tolto perche' faceva delle
   finte una scorciatoia), niente rallentamento, niente spinta. Chi ti
   puntava a tutta ci mette 0,19 s a fermarsi e 0,37 a invertire: e'
   la sua inerzia a punirlo, e se non era lanciato non viene punito
   affatto — che e' come funziona una finta vera.

   L'UNICA COSA CHE RICEVE IL PORTATORE e' che le gambe erano gia'
   caricate: p.ax parte a P_ACC invece di salirci in 0,07 s (il limite di
   strappo di updatePlayerFisica esiste perche' «un corpo ci mette il
   tempo di caricare le gambe», e in una finta le gambe SONO caricate).
   Rispetta P_ACC, quindi non produce nessuno scatto brusco per misura.js.

   NON SI RIFIUTA MAI PER MANCANZA DI BERSAGLIO. Una finta a nessuno
   costa la corsa in avanti, 0,26 s senza pallone e 1,10 s di attesa:
   se il gioco la rifiutasse sarebbe gratis, e una finta gratis e' un
   teletrasporto.
   ===================================================================== */
function provaStrappo(p, pi, s){
  const b=G.ball;
  if(!b || b.owner!==pi) return false;                 // si strappa col pallone al piede
  if(p.strappoCd>0 || p.kickCd>0) return false;
  if(p.charge>=0 || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  if(p.role==='gk') return false;
  /* IL VERSO DECIDE IL GESTO: di lato e' uno SCARTO, all'indietro una
     SUOLA. Si misura sulla FACCIA e non sulla velocita' perche' la
     faccia e' cio' che si vede, e perche' un uomo quasi fermo ha una
     velocita' che non punta da nessuna parte. */
  const vP=len(p.vx,p.vy);
  const indietro=(s.ux*p.fx + s.uy*p.fy) < STRAPPO_DIETRO;
  const spinta = indietro ? (SUOLA_V0 + SUOLA_VK*vP) : (SCARTO_V0 + SCARTO_VK*vP);
  b.owner=-1; b.passTo=-1; b.crossTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=false;
  b.tiroT=-1;                                          // una finta non e' un tiro
  /* IL PALLONE SI PORTA DIETRO UNA QUOTA DELLA TUA CORSA, e non e' un
     dettaglio: e' la differenza fra una finta e un autopassaggio.
     Un piede che tocca di lato un pallone lanciato non gli azzera lo
     slancio in avanti, e se glielo azzerasse chi lo insegue — cioe' TU —
     ci arriverebbe con tutta la propria inerzia contraria addosso: il
     pallone resta indietro e diventa di chiunque. Misurato sulla prima
     stesura, che aveva QUOTA zero: uomo superato nel 16% dei duelli
     contro il 63% che da' una virata secca senza finta. Non «peggio»:
     distrutto. Il numero e i sette tentativi che lo circondano stanno
     in strumenti/_t-strappo.js, §10.
     La suola non ha quota per definizione: e' il gesto che FERMA. */
  const q = indietro ? 0 : STRAPPO_QUOTA;
  b.vx=p.vx*q + s.ux*spinta; b.vy=p.vy*q + s.uy*spinta; b.z=0; b.vz=0;
  segnaTocco(pi);                                      // e' un tocco suo: la rete lo sa
  p.kickCd=STRAPPO_TOCCO;
  p.strappoCd=STRAPPO_ATTESA;
  p.ax=s.ux*P_ACC; p.ay=s.uy*P_ACC;
  /* IL COMANDO RESTA A CHI HA STRAPPATO. Il cambio automatico segue il
     piu' vicino al pallone: senza questa riga, un compagno poteva
     ereditare l'uomo nel mezzo della finta e il dito si trovava a
     comandare qualcun altro — il modo peggiore di perdere un pallone. */
  G.swLock[p.team]=STRAPPO_TOCCO+0.15;
  /* =====================================================================
     LA DECEZIONE E' UN TEMPO DI REAZIONE, NON UNO STORDIMENTO.

     Chi ti stava addosso aveva un piano — «vai su quell'uomo, a quella
     distanza» — e il mondo gli e' appena cambiato sotto. Il gioco ha gia'
     il modello di quel ritardo, e non e' nuovo: p.aiT, il tempo di
     reazione che aiMove consuma prima di ripianificare, dichiarato nella
     tabella delle difficolta' (react 0,42 / 0,25 / 0,12). Qui si RIARMA,
     non si allunga: dopo una finta il difensore aspetta la SUA reazione
     intera invece di ripianificare alla fase in cui capitava di trovarsi.

     Perche' non e' lo stordimento che EA ha tolto: non gli si tocca ne'
     la velocita', ne' la direzione, ne' la facolta' di decidere; corre
     dove aveva deciso di correre, e appena scade la sua reazione decide
     di nuovo, con tutta la sua intelligenza. E l'entita' del vantaggio la
     sceglie la DIFFICOLTA', non questa toppa: 0,42 s a Facile, 0,12 a
     Duro. Un giocatore forte legge la finta quasi subito.

     Perche' serve, ed e' un fatto misurato e non un'opinione: senza
     questa riga la finta REGALA il pallone all'IA. Con la palla al piede
     il difensore insegue un UOMO con uno standoff; con la palla libera
     insegue b.x + b.vx*lead, cioe' estrapola una retta — e un pallone
     spinto viaggia esattamente in retta. Il distacco rendeva il bersaglio
     PIU' prevedibile di prima: misurato, uomo superato 63,9% con lo
     strappo contro 63,2% senza, cioe' niente.
     ===================================================================== */
  if(STRAPPO_RAGGIO>0){
    for(const o of G.players){
      if(o.team===p.team || o.out>0 || o.role==='gk') continue;
      if(len(o.x-p.x,o.y-p.y) > STRAPPO_RAGGIO) continue;
      const r = G.cpu[o.team] ? DIFF[G.diff].react : 0.14;   // gli stessi due numeri di aiMove
      if(o.aiT < r) o.aiT = r;
    }
  }
  /* LE POSE, e sono due riusi dichiarati (vedi strumenti/_t-strappo.js
     §8): lo scarto prende 'finta' (poseFinta, doppio tocco d'interno) e
     ne mostra mezzo giro, cioe' UN tocco; la suola prende 'frenata'
     (poseFrenata: compasso dei piedi e solchi), perche' una suola vista
     dall'alto E' una frenata — e la clip getta i solchi da sola col suo
     descrittore polvere, senza una riga di particelle qui. */
  if(indietro){ p.frenaT=FRENA_T; p.frenaAcc=0; }
  /* 0,24 E NON 0,5, ED E' UN CONTO SULLA CLIP. rigStato legge
     u = 0,5*(1 - fintaT/0,5), e in poseFinta l'affondo del primo tocco
     — il fotogramma in cui il piede attraversa il pallone — cade a
     u = 0,26. Partendo da 0,5 quell'affondo arriverebbe 0,26 s DOPO che
     il pallone e' gia' partito: il corpo racconterebbe il tocco un
     quarto di secondo in ritardo. Partendo da 0,24 la posa entra
     ESATTAMENTE sull'affondo e finisce col seguito, e il rig torna alla
     corsa quando il piede e' di nuovo libero. */
  else p.fintaT=0.24;
  schiacciaPalla(0.12, s.ux, s.uy);                    // il pallone e' stato COLPITO
  Audio5.kick(0.22);                                   // un tocco corto, non una botta
  /* FATTO: qui si apre l'evento
       {quando, che:'strappo', quale: indietro?'suola':'scarto', chi:pi,
        dove:[p.x,p.y], esito: da chiudere alla raccolta}
     L'esito non e' noto adesso — si sa 0,26-0,60 s dopo, da chi prende
     il pallone — quindi il fatto va APERTO qui e CHIUSO in updateBall,
     come _eventi.js fa col tiro. Non si costruisce un registro qui. */
  return true;
}

/* ---------- aggiornamento giocatore ---------- */
function updatePlayer(p,dt){`,
},

/* 9 — l'attesa scorre accanto a quella del piede, che e' la sua parente */
{
  nome: '9/12 l\'attesa fra due strappi scorre col piede',
  cerca: `  p.kickCd=Math.max(0,p.kickCd-dt);`,
  metti: `  p.kickCd=Math.max(0,p.kickCd-dt);
  /* l'attesa fra due finte comandate scorre accanto a quella del piede,
     che e' la sua parente: tutte e due dicono «questo uomo ha appena
     toccato il pallone e per un po' non lo ritocca». Non sta fra i latch
     del rig di aggiornaPosa perche' non e' disegno: e' una regola. */
  if(p.strappoCd>0) p.strappoCd=Math.max(0,p.strappoCd-dt);`,
},

/* 10 — chi consuma il dato */
{
  nome: '10/12 il ramo umano consuma lo strappo',
  cerca: `  if(isHuman){ [ix,iy]=humanMove(p.team); }
  else { [ix,iy]=aiMove(p,dt); }`,
  metti:
`  if(isHuman){
    [ix,iy]=humanMove(p.team);
    /* LO STRAPPO SI CONSUMA QUI, e solo qui. Touch5 ha prodotto il DATO
       («il comando ha saltato al contrario»); il VERBO lo decide questa
       riga, che e' l'unica del gioco a sapere chi e' l'uomo sotto il
       dito. La CPU non passa di qua: una finta della macchina sarebbe
       un'altra cura, con una sua decisione e una sua misura, e
       sposterebbe tutti i banchi a seme fisso della casa. */
    if(Touch5.strappo[p.team]) provaStrappo(p, pi, Touch5.strappo[p.team]);
  }
  else { [ix,iy]=aiMove(p,dt); }`,
},

/* 11 — la lavagna del mister impara il gesto: un verbo che non si sa
        fare non esiste, e questa lavagna e' l'unico posto in cui il
        gioco spiega i suoi gesti */
{
  nome: '11/12 la lavagna del mister insegna lo strappo',
  cerca: `            <b class="gn">Pressa</b><span class="gt">pulsante <b>PRESSA</b> &mdash; il compagno in direzione del portatore va a raddoppiare</span></div>`,
  metti:
`            <b class="gn">Pressa</b><span class="gt">pulsante <b>PRESSA</b> &mdash; il compagno in direzione del portatore va a raddoppiare</span></div>
          <div class="ges"><svg class="gsvg" viewBox="0 0 120 64" aria-hidden="true"><path d="M14 40l12 14m0-14L14 54"/><circle class="palla" cx="30" cy="47" r="3.6"/><circle class="avv" cx="64" cy="46" r="8"/><path class="trat" d="M34 46 L56 43"/><path d="M56 43 Q78 38 100 16"/><path d="M100 16l-9 2m9-2l-2 9"/></svg>
            <b class="gn">Strappo (finta)</b><span class="gt">col pallone al piede, <b>strappa la levetta dall'altra parte passando dal centro</b><span class="soloKb"> &middot; serve la levetta: la tastiera non ha un centro da attraversare</span> &mdash; il pallone si stacca e va dove punta il dito: di lato &egrave; uno <b>scarto</b>, all'indietro una <b>suola</b>. Per un quinto di secondo non &egrave; di nessuno: chi arriva prima se lo prende</span></div>`,
},

/* 12 — e la riga che riassume i comandi non mente piu' per omissione */
{
  nome: '12/12 il riassunto dei comandi nomina lo strappo',
  cerca: `Alzare il dito dalla levetta non fa mai partire niente: i gesti si battono coi dischi.`,
  metti: `Alzare il dito dalla levetta non fa mai partire niente: i gesti si battono coi dischi &mdash; tranne uno: <b>strappare la levetta dall'altra parte, passando dal centro</b>, &egrave; la finta. Girare arcuando da fuori resta una virata normale.`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-strappo.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.strappo.html';
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

/* GLI ATTESI. Il primo gruppo dice che la cura c'e'; il secondo — ed e'
   quello che conta in questa casa — dice che NON HA SPOSTATO IL CASO:
   il conto dei SORTEGGI nel file deve restare quello del gioco spedito,
   perche' un sorteggio in piu' o in meno rende bugiardi tutti i confronti
   appaiati (la lezione di strumenti/_t-carica.js).

   SI CONTA dado(), NON Math.random(). Dal 28 agosto 2026 (_t-seme.js) il
   caso passa tutto da dado(), e nel file non resta un solo Math.random()
   di codice fuori dal corpo di dado() stesso: le cinque occorrenze
   rimaste sono quattro commenti piu' la riga «if(!SEME.on) return
   Math.random()». Contare Math.random() oggi vorrebbe dire contare i
   commenti — un cancello che si apre da solo. */
const attesi = [
  ['function provaStrappo(p, pi, s){', 1],
  ['const STRAPPO_QUOTA = ', 1],
  ['const STRAPPO_RAGGIO = ', 1],
  ['const STRAPPO_LAMPO  = 0.18;', 1],
  ['if(Touch5.strappo[p.team]) provaStrappo(p, pi, Touch5.strappo[p.team]);', 1],
  ['strappoCd:0,', 1],
  ['if(p.strappoCd>0) p.strappoCd=Math.max(0,p.strappoCd-dt);', 1],
  ['memCmd: [ {x:0,y:0,fermo:0,daLevetta:false}, {x:0,y:0,fermo:0,daLevetta:false} ],', 1],
  /* il dato nasce in UN solo posto e si consuma in UN solo posto */
  ['this.strappo[t]=s;', 1],
  /* LA GUARDIA DELLA LEVETTA — il difetto del 28 agosto (§2bis), nella
     forma corretta dalla seconda revisione. Deve esistere in UN solo
     posto e il riconoscimento deve pretenderla: se un domani qualcuno
     toglie una delle due righe, la tastiera ricomincia a strappare a ogni
     virata e nessun cancello di rendimento lo vede.
     La prima stesura guardava i tasti nell'ISTANTE DEL CENTRO, dove da
     tastiera «comando nullo» e «nessun tasto premuto» sono la stessa
     cosa: la guardia era sempre vera e non guardava niente. Adesso si
     segna da dove viene il VERSO, con la stessa condizione che humanMove
     usa per preferire la levetta ai tasti. */
  ['m.daLevetta = !!(sk && sk.active && len(sk.dx, sk.dy) > STICK_DEAD);', 1],
  ['if(m.daLevetta && m.fermo<=STRAPPO_LAMPO && ml>=STRAPPO_MEM &&', 1],
  /* e non deve restare in giro la vecchia guardia: due guardie che
     dicono cose diverse sono peggio di nessuna */
  ['m.stick', 0],
  /* e la memoria si spegne in tutti e tre i posti in cui il dito se ne va:
     CPU, azzera() (pausa e secondo piano) e chiudi() (il dito alzato) */
  ['m.x=0; m.y=0; m.fermo=0; m.daLevetta=false; this.strappo[t]=null;', 3],
  /* e la finta automatica del rig resta intatta: due meccaniche, due
     cronometri, e fintaCd non lo tocca nessuno da qui */
  ['if(p.fintaCd>0) p.fintaCd-=dt;', 1],
  ['p.fintaT=0.5; p.fintaCd=2; break;', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
/* il conto dei sorteggi: non un numero scritto a mano, ma quello del
   file di partenza — cosi' l'attesa resta vera anche se un domani
   qualcun altro ne aggiunge o ne toglie uno prima di questa toppa */
const casiPrima = (src.match(/dado\(\)/g) || []).length;
const casiDopo = (out.match(/dado\(\)/g) || []).length;
if (casiPrima !== casiDopo) rotti.push('dado(): ' + casiPrima + ' prima, ' + casiDopo + ' dopo — questa toppa non ne deve aggiungere NESSUNO');
/* e nemmeno di nascosto dalla porta di servizio */
const rndPrima = (src.match(/Math\.random\(\)/g) || []).length;
const rndDopo = (out.match(/Math\.random\(\)/g) || []).length;
if (rndPrima !== rndDopo) rotti.push('Math.random(): ' + rndPrima + ' prima, ' + rndDopo + ' dopo');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    dado() invariati: ' + casiDopo + '   (Math.random() ' + rndDopo + ', tutti commenti tranne il corpo di dado)');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
