/* =====================================================================
   _q-invarianti.js -- IL BANCO DELLE INVARIANTI (voce #125, onda C — 1).

   IL PERCHE'. Il mandato (Appendice A, INV-01..15) chiede che certe
   proprieta' del motore valgano SEMPRE, a ogni fotogramma di qualunque
   partita: sono il prerequisito di un fuzzer (senza sapere COSA cercare,
   input casuali non dicono niente) e di un soak (1000 partite/notte, zero
   violazioni). Questo file e' un BANCO, non codice sempre-attivo: legge lo
   stato del motore via `__test` (come _diag-nan.js/_q-determinismo.js/
   _q-umore.js) durante partite CPU-CPU guidate da qui, e verifica DODICI
   invarianti (le prime sei dal compito 1, le tre successive -- clamp
   fiato/cond, >=2 uomini di movimento, palla sotto il piano/velocita' --
   dal compito 2, stesso cantiere; la decima -- il cross-proiettile di
   doCross -- dal cantiere #128, compito 1; la undicesima -- il battitore
   espulso di resetKickoff -- dal cantiere #128, compito 2; la dodicesima
   -- confini+margine (INV-04) -- dal cantiere #126, compito 2).

   LE DODICI PROVE (le prime nove nate rosse su un bugiardo, vedi sotto;
   la decima e la undicesima nascono rosse sulla funzione REALE del
   gioco, non su un bugiardo; la dodicesima torna a nascere rossa su un
   bugiardo, come le prime nove -- vedi le loro voci piu' sotto):
     1. NaN/Infinity   -- isFinite su ball.{x,y,z,vx,vy,vz} e su
        p.{x,y,vx,vy,aiTX,aiTY} per ogni giocatore. Assorbe _diag-nan.js
        come invariante permanente di batteria.
     2. owner valido   -- G.ball.owner e' -1 oppure un intero in
        [0,N-1], e se >=0 il giocatore non e' out>0 (non puo' avere la
        palla chi e' fuori dal campo).
     3. punteggio monotono -- G.score[0]/G.score[1] non diminuiscono mai
        fra due campioni consecutivi.
     4. timeLeft monotono  -- G.timeLeft non cresce mai fra due campioni
        e non e' mai < 0.
     5. durata<=tetto (INV-15) -- la partita raggiunge lo stato 'end'
        entro tettoFotogrammi(taglia) fotogrammi (18000/300s a taglia 5,
        21000/350s a taglia 7, 27000/450s a taglia 11 -- IL TETTO E' UNA
        FUNZIONE DELLA TAGLIA dalla voce #130, "il metro prima del
        giudice": prima era una costante unica tarata su taglia 5 e
        applicata a ogni taglia, un falso positivo su taglia 11 misurato
        e rettificato -- vedi la lettera di testa di tettoFotogrammi piu'
        sotto per le misure). Il numero di taglia 5 resta quello
        RICALIBRATO dalla voce #127 (il vecchio 13200/220s non copriva il
        caso peggiore del rigore a oltranza). Lo STESSO tetto per taglia
        e' condiviso anche da _q-cpu-ordine.js e _q-soak.js. Generalizzato
        a N semi (di serie 8, vedi --semi).
     6. cronometri-fratelli (LA PIU' A RISCHIO — cinque regressioni pagate
        a mano: #86/#87/#107/#117/#122) -- SUBITO dopo startMatch, prima
        di simulare un solo fotogramma, ogni cronometro della famiglia
        dichiarata NEL GIOCO STESSO e' al suo valore di riposo. La lista
        (letta dai commenti veri, non indovinata):
          G.recT        0     (CALCETTO-il-gioco.html:11103, azzerato in startMatch)
          G.vantaggio   null  (:11018, "I2", voce #107 -- un sentinel con
                                cartellino pendente sopravviveva a startMatch)
          G.possOwner   -1    (:11116, "I QUATTRO CRONOMETRI FRATELLI DI recT")
          G.possT       0     (:11116, idem — aiDecide lo LEGGE)
          G.pulse       0     (:11116, idem)
          G.crowdSndT   0     (:11116, idem)
          G.swLock      [0,0] (:11128, "IL SESTO CRONOMETRO FRATELLO", voce #117 compito 6)
          G.swTimer     [0,0] (:11128, idem)
        NOTA: la lista NON include G.spintaScalino (voce #117 compito 4):
        quel campo riposa a [1,1], non a zero (zero e' GIA' lo scalino di
        riposo, vedi CALCETTO-il-gioco.html:11094-11102) — e' un valore di
        riposo diverso, non un ottavo cronometro di questa stessa famiglia
        dichiarata, e mescolarlo qui avrebbe reso l'invariante o falsa (se
        si pretendesse zero) o taciuta (se si saltasse il controllo senza
        dirlo). Resta fuori, dichiarato, non dimenticato.
        NOTA ONESTA (dal compito 1, riportata qui per la mappa INV-01..15
        piu' sotto): G.swLock/G.swTimer sono scritti SOLO da un cambio di
        controllo umano (Touch5/tastiera) -- un banco CPU-CPU come questo
        non li tocca mai, quindi la prova 6 verifica "sono a riposo dopo
        startMatch" ma NON "vengono azzerati attivamente da qualcosa che
        li aveva sporcati": e' un'invariante DEBOLE su questi due campi
        specifici finche' un fuzzer con input umano non la esercita
        davvero (vedi la mappa INV-01..15, INV-05).
     7. clamp fiato/cond -- p.fiato e p.cond in [0,100] per OGNI
        giocatore, a OGNI tick campionato (portiere compreso: il campo
        esiste per tutti, anche se solo i giocatori di movimento lo
        consumano con lo sprint). NON duplica p.umore/p.nervi/G.spinta:
        quei tre sono gia' coperti da strumenti/_q-umore.js, PROVA STATI,
        sub-prova "e-stati" (clamp umore/nervi/spinta per l'intera
        partita) -- qui si aggiunge solo fiato/cond, che quel banco non
        guarda.
     8. >=2 uomini di movimento in campo -- per ogni squadra, a OGNI tick
        campionato, i giocatori con role!=='gk' e out<=0 sono >=2 (la
        regola di casa, CALCETTO-il-gioco.html:18514-18517: "mai sotto i
        due uomini di movimento: sotto quella soglia il gioco si rompe").
        Il gioco stesso la protegge gia' (infliggiCartellino nega
        l'espulsione se diMovimentoInCampo(team).length non e' >2 PRIMA
        del cartellino): questa prova la ricontrolla dall'esterno, sulla
        STESSA definizione (movimento = non gk, in campo = out<=0), cosi'
        una futura regressione nella guardia del gioco la condanna qui.
     9. palla sotto il piano / velocita' -- G.ball.z >= 0 SEMPRE (ogni
        tick, qualunque stato della palla: portata, ferma, in volo); la
        velocita' orizzontale (len(vx,vy)) e verticale (|vz|) SOLO a
        palla LIBERA (owner<0) restano entro un tetto calibrato (vedi
        TETTO_VEL_PALLA/TETTO_VZ_PALLA piu' sotto). La palla LIBERA e' la
        condizione giusta: a palla POSSEDUTA (owner>=0) il ramo "furto col
        corpo" (CALCETTO-il-gioco.html:18908, b.vx=(tx-b.x)*14) riusa
        vx/vy come termine di correzione verso il piede del portatore, non
        come cinematica di volo -- misurato in questo stesso compito,
        picchi fino a 5974 u/s a schermo fermo (palla "agganciata" al
        portatore, nessun moto visibile): includerlo qui avrebbe prodotto
        un falso allarme sul suo stesso meccanismo di dribbling, la
        lezione #112/#114 che il piano chiede di evitare.
     10. DOCROSS -- il cross-proiettile (voce #128, compito 1, P0-1).
        SUBITO dopo startMatch (k===0, PRIMA di ogni t.simulate()), uno
        scenario DIRETTO -- non un bugiardo, la funzione REALE del
        gioco -- forza un CROSS LUNGO: un giocatore di movimento della
        squadra 0 viene piazzato in fondo al proprio campo (x=20,
        y=FH/2), G.ball.owner viene puntato su di lui (bypassa il
        raggio KICK_R di kickBall, che a quella distanza rifiuterebbe
        il calcio), e si chiama window.doCross(p,0,0) -- window.doCross
        esiste per costruzione (una function-declaration in uno script
        non-modulo diventa una proprieta' di window; G/FW/FH restano
        nella CHIUSURA originale della funzione, quindi la fisica
        eseguita e' quella vera, non una copia). SENZA destinatario
        (mira=undefined), doCross usa il bersaglio VERO di ogni cross,
        puntoCross(p) (il secondo palo) -- non un punto sintetico.
        Subito dopo, SENZA un altro simulate(), si legge
        len(ball.vx,ball.vy): deve restare <= TETTO_VEL_PALLA (la
        stessa soglia della prova 9). IL BUG (CALCETTO-il-gioco.html:
        15888-15914): T=clamp(dist/430,0.66,0.75) e' bloccato ma dist
        NON lo e' -- l'unico tiro del gioco che non passa da
        tiroVelocita()/TIRO_TETTO. Su questo scenario (taglia 5,
        dist~1075 dal crossatore al secondo palo) T satura a 0,75 e
        speed=dist/T~1434 u/s, sopra il tetto.
        ISOLAMENTO (perche' questa prova non e' un --bugiardo che puo'
        permettersi di rompere il resto della partita): ball/touches/
        stats/posizione del giocatore vengono fotografati PRIMA della
        chiamata e RIPRISTINATI subito dopo la misura -- un pallone
        lasciato a velocita' abnorme romperebbe la prova 9 al tick
        successivo per lo STESSO seme, un effetto collaterale della
        misura, non del gioco, e contaminerebbe anche la prova 5
        (durata, il seme si fermerebbe presto) senza motivo. Gira UNA
        sola volta (k===0), indipendente da --bugiardo: e' permanente
        in batteria (cancello del cantiere #128), non una dimostrazione
        del banco.
     11. KICKOFF-ESPULSO -- il battitore espulso (voce #128, compito 2,
        P0-2). SUBITO dopo startMatch (k===0, PRIMA di ogni t.simulate()),
        uno scenario DIRETTO -- non un bugiardo, le funzioni REALI del
        gioco -- stagiona un cartellino differito sul giocatore team0/
        idx1 (il mezzalasinistra che batte sempre il calcio d'inizio,
        formation ~:10690) e forza il prossimo kickoff a passare da lui:
        G.vantaggio={team:-1,x:0,y:0,t:0,card:idx} (idx = l'indice del
        giocatore team0/idx1 -- la stessa forma che il gioco stesso
        scrive, vedi :17306/:18827), G.stats.gialli[0]=1 (il PROSSIMO
        cartellino sale a 2, e CARTELLINI_PER_ESPULSIONE=2, :4508, fa
        scattare l'espulsione dentro infliggiCartellino, :18519-18525),
        G.kickTeam=false (kt=G.kickTeam?1:0, resetKickoff :10953 -- la
        squadra 0 batte). Si chiama window.resetKickoff() -- esposto per
        costruzione, come window.doCross della prova 10 -- e si legge
        G.ball.owner: se il giocatore proprietario ha out>0, la prova e'
        rossa (un espulso non puo' avere la palla, la STESSA definizione
        della prova 2/owner-valido, qui su uno scenario diretto invece
        che su un campionamento a tappeto).
        IL BUG (CALCETTO-il-gioco.html:10904-10964): resetKickoff chiama
        scaricaCardVantaggio() PRIMA (:10922 -> infliggiCartellino, che
        marca p.out=ESPULSIONE_SEC e rilascia G.ball.owner correttamente
        SE quel giocatore lo possedeva), MA la scelta del battitore, piu'
        sotto (p.team===kt && p.idx===1, ~:10955), non controlla out<=0:
        se l'appena-espulso e' proprio l'idx1 della squadra che batte,
        resetKickoff lo rimette in campo (le sue x/y sovrascritte sul
        punto di battuta, poche righe dopo l'aver gia' scritto la
        posizione "fuori" per p.out>0 alla riga 10929) e G.ball.owner
        torna a puntarlo -- un espulso in possesso della palla.
        ISOLAMENTO (perche' questa prova non deve alterare il resto
        della partita simulata, la STESSA cautela della prova 10): ogni
        giocatore (clone completo per-oggetto, non solo i campi attesi
        -- infliggiCartellino tocca anche slide/recover/vx/vy/ax/ay/
        gialli/out, resetKickoff quasi tutto il resto), G.ball intero,
        G.ctrl, G.touches, G.vantaggio, G.kickTeam, G.stats.gialli/
        espulsi, G.battuta e G.fatti/G.fattiTot (emettiFatto('espulsione',
        ...) dentro infliggiCartellino spinge un fatto vero, che
        altrimenti verrebbe "visto" piu' tardi da step() e applicherebbe
        un impatto umore/nervi per un'espulsione mai davvero accaduta nel
        resto della partita) vengono fotografati PRIMA della chiamata e
        RIPRISTINATI subito dopo la misura -- il kickoff VERO gia'
        prodotto da startMatch (via setupPlayers, con G.kickTeam scelto
        da dado()) resta quello che il resto del seme simula, non lo
        scenario sintetico di questa prova. Gira UNA sola volta (k===0),
        indipendente da --bugiardo: e' permanente in batteria (cancello
        del cantiere #128, compito 2), non una dimostrazione del banco.

     12. CONFINI + MARGINE -- INV-04 (voce #126, onda C -- 2, compito 2).
        Ogni giocatore resta entro i limiti del campo PIU' un margine
        dichiarato, a OGNI tick campionato: -MARGINE_CONFINI <= p.x <=
        FW+MARGINE_CONFINI e -MARGINE_CONFINI <= p.y <= FH+MARGINE_CONFINI
        (FW/FH letti da t.campo, la taglia vera in corso). Verificata
        ANCHE durante il duello (scena 'freekick'): strumenti/_q-fuzzer.js
        (che riusa questa stessa funzione) continua a chiamarla li' pure,
        vedi la sua lettera di testa.
        IL MARGINE, tradotto dal mandato ("+5 m", Appendice A INV-04): il
        gioco non dichiara una conversione unita'<->metri per OGNI taglia,
        ma UNA sola calibrazione ESATTA esiste nel codice (riga ~3919 di
        CALCETTO-il-gioco.html, voce #86 compito 3): a taglia 11,
        FH:1490 = 68 m veri del campo IFAB, cioe' 1490/68 = 21,91
        unita'/metro. Nessuna calibrazione diversa e' mai stata dichiarata
        per la 5 o la 7: si usa la STESSA conversione ovunque, come
        approssimazione dichiarata (non una misura per quella taglia):
          MARGINE_CONFINI = round(5 * 1490/68) = 110 unita'.
        PERCHE' QUEL NUMERO E NON UN ALTRO: due uscite dal rettangolo di
        gioco sono gia' LEGITTIME nel motore, e il margine deve coprirle
        senza sforzo, altrimenti l'invariante condannerebbe il gioco
        sano invece di un bugiardo:
          - il portiere in tuffo (updateKeeper, CALCETTO-il-gioco.html:
            19382-19383) puo' arrivare a p.x=-(GOAL_D-8)=-26 (dentro la
            propria porta, la profondita' della rete) o FW+26 dall'altra
            parte -- GOAL_D=34, riga 4078;
          - l'espulso in panchina (updatePlayerFisica riga 18136 e
            resetKickoff riga 10929) viene piazzato a p.y=-P_R*2.4=-31,2
            (fuori dal rettangolo, DI PROPOSITO: siede fuori campo finche'
            il cronometro dell'espulsione non scade).
        110 unita' e' ben oltre entrambe (26 e 31,2 rispettivamente): il
        margine assorbe le uscite VERE e note del gioco, non le nasconde
        -- resta comunque stretto rispetto al resto del piano (1150x560 a
        taglia 5): un giocatore forzato a p.x=-500 o oltre (--bugiardo
        confini, forza p.x molto oltre il limite) resta condannato.
        NON e' una calibrazione EMPIRICA come le prove 9/10/11 (nessun
        banco CPU-CPU a seme fisso ha mai spinto un giocatore vicino al
        bordo -- e' proprio il motivo per cui questa prova era RIMANDATA
        al fuzzer, vedi la mappa INV-01..15 piu' sotto): e' una
        TRADUZIONE dichiarata del mandato, controllata contro le due
        uscite note del motore, non contro una misura di migliaia di
        fotogrammi.

   IL CLAMP GIA' NEL GIOCO (verificato prima di scrivere la prova 9).
   z: nessuna guardia nominata, ma la fisica di volo (updateBall,
   CALCETTO-il-gioco.html:18959-18963) integra b.z SOLO quando b.z>0 ||
   b.vz>0, e schiaccia b.z=0 non appena l'integrazione lo farebbe scendere
   sotto zero -- z<0 non e' raggiungibile dal motore per costruzione, non
   solo per assenza di controesempi misurati.
   velocita' orizzontale: kickBall (:14815) e' l'imbuto di OGNI calcio, e
   fireShotMirato (:16437) e sparaTiro/lob (:16187, tiroVelocita) chiudono
   la potenza in Math.min(TIRO_TETTO, ...) con TIRO_TETTO=860 (:16181,
   "oltre, il pallone diventa un proiettile" -- un tetto DICHIARATO dal
   gioco stesso, non indovinato da questo banco). Non e' un tetto
   assoluto su ogni possibile vx/vy (lo spin si somma DOPO il clamp, vedi
   sotto), ma e' la prova che il gioco ha gia' pensato al problema.
   TETTO_VEL_PALLA e TETTO_VZ_PALLA (calibrazione empirica, 17-20 settembre
   2026, strumenti/../fuori/_misura-palla.js, USA-E-GETTA, non committato):
   su 30 semi (20260920..20260949, taglia 5, stesso ordine setCpuVsCpu di
   questo banco), 222282 fotogrammi campionati, filtrando SOLO owner<0:
     massimo len(vx,vy) osservato = 902,0 u/s (seme 20260922, fotogramma
       325: vx=855,5 ny*speed+spinY=-286 -- il caso TIRO_TETTO=860 PIU' lo
       spin che fireShot somma a parte su vy, quindi la risultante supera
       leggermente 860: spiegato dal codice, non un bug).
     massimo |vz| osservato = 267,9 u/s (seme 20260937, fotogramma 4060:
       una discesa lunga e regolare da gravita' -560 u/s^2, -9,33/frame,
       fino all'atterraggio -- un pallonetto alto rimbalzato, non
       un'esplosione numerica).
     minimo z osservato = 0 su tutti i 222282 fotogrammi: ZERO violazioni
       vere. Il gioco e' SANO su questa misura: nessuna scoperta P0.
   Il tetto scelto e' l'osservato x1,5 (margine dichiarato dal piano):
     TETTO_VEL_PALLA = 902 * 1,5 = 1353 u/s
     TETTO_VZ_PALLA  = 268 * 1,5 = 402 u/s
   Il margine assorbe variazioni legittime (spin, bounce, semi diversi)
   senza inseguire il numero esatto di oggi -- la lezione #112/#114 vale
   anche qui: una soglia tirata al millimetro condannerebbe un domani
   legittimo.

   COME SI CAMPIONA. Ogni tick simulato (t.simulate(1/60)), NON
   sottocampionato: a taglia 5 sono solo 10 giocatori, il costo per tick e'
   O(giocatori) e non giustifica saltare fotogrammi (vedi Vincolo globale
   #3 del piano: le invarianti strutturali valgono a ogni taglia, qui si
   misura a taglia 5 di serie -- default storico, non piu' un limite di
   determinismo: la voce #98 e' CHIUSA dalla voce #129, rettifica a
   edizioni voce #130, 21 settembre 2026 -- con --taglia per chi vuole
   misurare a 7/11, oggi altrettanto ripetibile).
   La prova 6 si campiona una volta per partita, SUBITO dopo startMatch
   (non e' un invariante-per-tick, e' un invariante-al-fischio). Le prove
   7/8/9 sono per-tick come 1-4, sullo stesso campionamento.

   L'ORDINE DI setCpuVsCpu (voce #121, seguito #108, chiuso qui dal
   compito #124 su _c3-sorteggi): SEMPRE startMatch PRIMA, setCpuVsCpu(true)
   DOPO in questo banco (il contrario annulla l'intento e la squadra 0
   resta "umana immobile" — sintomo #108/#119). L'UNICA eccezione voluta e'
   `--bugiardo durata`, che inverte l'ordine DI PROPOSITO per riprodurre lo
   scenario-hang #119 e dimostrare che la prova 5 lo condanna.

   IL METODO BUGIARDO (ogni prova nasce rossa). `window.__test.G` e' lo
   STESSO oggetto che il motore usa (non una copia, verificato: e' un
   riferimento vivo esposto in fondo a window.__test, "G, Duel, Tut"):
   per NaN/owner/punteggio/timeLeft basta corrompere G dal banco stesso,
   nessuna patch al gioco serve — e' la "scena sintetica" prevista dal
   piano. Per il cronometro-fratello serve invece un vero bugiardo di
   gioco (l'assenza di un azzeramento in startMatch non si puo' simulare
   da fuori senza patchare il codice che dovrebbe farla): vedi
   strumenti/_crit-inv-cronometri.js, che toglie SOLO l'azzeramento di
   G.swLock e produce fuori/bugiardo-cronometri.html (gitignored, mai
   committato).
     --bugiardo nan         inietta ball.x=NaN a un fotogramma fisso
     --bugiardo owner       inietta G.ball.owner=999 (fuori range)
     --bugiardo punteggio   decrementa G.score[0] di 1
     --bugiardo timeleft    fa risalire G.timeLeft di 5 secondi
     --bugiardo durata      inverte l'ordine setCpuVsCpu/startMatch (hang #119)
     --bugiardo fiato       inietta p.fiato=150 su un giocatore (prova 7)
     --bugiardo movimento   inietta out>0 su 3 uomini di movimento della
                            stessa squadra in una scena sintetica (prova 8,
                            NON passa da infliggiCartellino: quella guardia
                            e' proprio cio' che si vuole scavalcare per
                            dimostrare che LA PROVA, non il gioco, coglie
                            la violazione)
     --bugiardo ballz       inietta G.ball.z=-10 (prova 9, sotto il piano)
     --bugiardo ballvel     inietta G.ball.vx=999999, owner=-1 (prova 9,
                            velocita' assurda a palla libera)
   L'INIEZIONE (nan/owner/punteggio/timeleft/fiato/movimento/ballz/ballvel)
   avviene DOPO un fotogramma normale gia' verificato pulito, e la verifica
   si ripete SUBITO, SENZA un altro t.simulate() in mezzo: si dimostra che
   il banco vede lo stato corrotto, senza chiedere al motore di correre
   fisica sopra uno stato che lui stesso non ha mai prodotto (es.
   G.players[999] che non esiste — rischio di un'eccezione estranea alla
   prova). Il seme interrotto da un'iniezione NON conta come violazione
   della prova 5 (durata): e' un'interruzione voluta, dichiarata, non un
   hang.
   Con --bugiardo (salvo --semi esplicito) gira UN solo seme: basta a
   dimostrare la condanna, ed e' piu' veloce da rileggere in una revisione.

   uso:  node strumenti/_q-invarianti.js
         node strumenti/_q-invarianti.js --gioco fuori/bugiardo-cronometri.html
         node strumenti/_q-invarianti.js --bugiardo nan
         node strumenti/_q-invarianti.js --bugiardo owner
         node strumenti/_q-invarianti.js --bugiardo punteggio
         node strumenti/_q-invarianti.js --bugiardo timeleft
         node strumenti/_q-invarianti.js --bugiardo durata
         node strumenti/_q-invarianti.js --bugiardo fiato
         node strumenti/_q-invarianti.js --bugiardo movimento
         node strumenti/_q-invarianti.js --bugiardo ballz
         node strumenti/_q-invarianti.js --bugiardo ballvel
         node strumenti/_q-invarianti.js --bugiardo confini
         node strumenti/_q-invarianti.js --taglia 5 --seme 20260920 --semi 8
   esce 0 se le dodici prove sono verdi, 1 se almeno una e' rossa, 2 se il
   banco stesso e' esploso (pagina, hook mancante, eccezione), 3 se l'uso
   e' sbagliato.

   LA MAPPA INV-01..15 (mandato, Appendice A, _analisi/MANDATO-STADIUM-ROAR.md
   righe 644-658 -- un mandato generico da simulatore calcistico 11-a-side;
   CALCETTO e' futsal a taglia 5/7/11, alcune INV non hanno un analogo nel
   gioco reale, dichiarato caso per caso, ONESTAMENTE — non si dichiara
   coperta un'INV che il banco non verifica davvero):
     INV-01 determinismo (stesso seed/input -> stesso hash)
       -> ALTROVE: strumenti/_q-determinismo.js (confronta lo stato intero
          fra due run identiche, non un hash di eventi come il mandato
          generico, ma lo stesso principio).
     INV-02 una sola palla; posizione finita; |velocita'|<=45 m/s; mai
          sotto il piano
       -> QUI (parziale) + N/A (parziale): "una sola palla" e' strutturale
          (G.ball e' un oggetto singolo, non un array — non testabile a
          runtime in modo significativo, vero per costruzione). Posizione
          finita: prova 1 (NaN/Infinity). Mai sotto il piano e velocita'
          entro un tetto: prova 9 -- il tetto e' in unita' di campo del
          gioco (u/s), NON in m/s: non esiste un'equivalenza dichiarata fra
          le due scale, quindi "45 m/s" del mandato generico non si traduce
          qui 1:1 -- si usa un tetto calibrato sul gioco reale (vedi sopra).
     INV-03 organico: 11/11 meno espulsi, mai <7; sostituzioni <= limite;
          un espulso non rientra mai
       -> QUI, ADATTATA: la regola di casa e' ">=2 uomini di movimento"
          (prova 8), non "mai <7" (CALCETTO e' 5/7/11, non 11 fisso).
          L'espulsione in CALCETTO e' TEMPORANEA (p.out e' un cronometro
          in secondi, CALCETTO-il-gioco.html:10629): "un espulso non
          rientra mai" non si applica, e' un disegno diverso da quello del
          mandato generico, dichiarato qui invece di forzare un'invariante
          falsa.
     INV-04 ogni giocatore dentro i confini del campo + 5 m di margine,
          salvo uscite permesse
       -> QUI (RETTIFICA, voce #126, onda C -- 2, compito 2, 20 settembre
          2026: era RIMANDATA al fuzzer/soak, riga sopra fino a oggi --
          adesso la prova 12 la implementa, in QUESTO file, riusata da
          strumenti/_q-fuzzer.js che spinge davvero lo stick verso i
          bordi, il caso che un banco CPU-CPU/a seme fisso come questo
          non forza mai di proposito). "Salvo uscite permesse": il
          margine (110 unita', vedi la prova 12) copre le due uscite
          note e dichiarate del motore (il tuffo del portiere, la
          panchina dell'espulso) -- nessun'altra e' stata misurata.
     INV-05 cronometro di partita monotono; corre durante i fermi
          "diegetici", si ferma solo per tempo non-diegetico; recupero
          proporzionale ai fermi; cambi solo a palla ferma
       -> QUI (parziale): G.timeLeft monotono non crescente e mai<0 e'
          prova 4. Il resto (recupero calcolato, cambi solo a fermo) non
          e' modellato in CALCETTO in questi termini — N/A per quella
          parte. NOTA ONESTA: i cronometri-fratelli (prova 6) toccano
          switch di controllo (G.swLock/G.swTimer) che un banco CPU-CPU
          non esercita mai da soli (li scrive solo l'input umano): la
          prova 6 e' quindi DEBOLE su quei due campi specifici finche' un
          fuzzer con input umano-simulato non la mette sotto pressione
          vera (vedi la nota nella prova 6 piu' sopra).
     INV-06 un gol richiede palla-tutta-oltre-la-linea fra i pali e sotto
          la traversa, e una sequenza di ripresa valida; niente gol diretto
          da rimessa laterale/punizione indiretta/mani del portiere
       -> RIMANDATA: nessun banco oggi verifica la VALIDITA' del gol
          (solo il conteggio, prova 3). Candidato per un banco dedicato
          futuro o per il fuzzer/soak.
     INV-07 ogni ripresa di gioco segue un fermo, e la palla e' ferma nel
          punto giusto al momento della ripresa
       -> RIMANDATA: non testata da nessun banco oggi.
     INV-08 sequenza cartellini: secondo giallo=>rosso=>fuori; i conteggi
          non diminuiscono mai; protesta riservata al capitano
       -> ALTROVE (parziale): strumenti/_q-regole.js copre gia' scenari di
          sequenza cartellino/vantaggio (giallo differito, DOGSO-gol,
          grazia-dopo-card). "I conteggi non diminuiscono mai" e' vero per
          costruzione (p.gialli++ e' l'unico sito di scrittura, mai un
          decremento) ma NESSUN banco lo asserisce esplicitamente oggi —
          dichiarato scoperto, non testato. "Protesta riservata al
          capitano" non esiste in CALCETTO — N/A.
     INV-09 il fuorigioco si decide sempre dal tick dell'ultimo tocco di un
          compagno; mai da rimessa dal fondo/laterale/corner
       -> N/A: CALCETTO/futsal non ha la regola del fuorigioco. Non
          applicabile al gioco.
     INV-10 stati emotivi in [0,1]; moltiplicatori d'effetto entro il tetto
          di 7,5; simmetria speculare della storia
       -> ALTROVE (parziale, range diverso dal mandato): strumenti/
          _q-umore.js, PROVA STATI sub-prova "e-stati" copre p.umore in
          [-1,1] (non [0,1]: il gioco usa un range con segno, adattamento
          dichiarato), p.nervi in [0,1], G.spinta in [-1,1]. "Moltiplicatori
          entro 7,5" e "simmetria speculare della storia" non hanno un
          analogo dichiarato nel gioco — N/A/rimandata.
     INV-11 fatica non crescente durante i fermi oltre il recupero base;
          la resistenza non e' mai <0
       -> QUI (parziale): p.fiato/p.cond in [0,100] e' prova 7 (il tetto
          superiore vale anche come "mai <0" sul lato basso). "Non
          crescente durante i fermi oltre il recupero base" richiederebbe
          distinguere le fasi di fermo dal resto: non verificato
          esplicitamente, dichiarato scoperto.
     INV-12 la presentazione non muta mai lo stato della simulazione
          (write-barrier)
       -> ALTROVE: il metodo due-versioni/disegno-puro dei cantieri di
          resa (es. voce #87, #107) verifica che il disegno non tocchi G.
     INV-13 rete: il tick server e' autorevole; input client fuori
          finestra scartato e contato; decode(encode(s)) entro
          quantizzazione
       -> N/A: CALCETTO e' locale, nessuna rete/multiplayer nel gioco.
     INV-14 il risultato si sottomette una volta sola, con firma valida e
          hash di replay corrispondente
       -> N/A: nessun sistema di submission/replay-hash in CALCETTO.
     INV-15 durata reale <= attesa + 25% (rileva stati bloccati)
       -> QUI: prova 5 (durata<=tettoFotogrammi(taglia) fotogrammi, 300 s
          a taglia 5 -- RICALIBRATO voce #127 compito 2 -- 350 s a taglia
          7, 450 s a taglia 11 -- IL TETTO E' PER TAGLIA dalla voce #130,
          vedi la lettera di testa di tettoFotogrammi).
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

/* REFACTOR MINIMO (voce #126, onda C -- 2, compito 1): questo blocco esce
   dal processo, quindi resta SOLO per l'uso diretto (node
   strumenti/_q-invarianti.js). Se il file viene richiesto come modulo
   (require.main !== module) -- caso nuovo, e' strumenti/_q-fuzzer.js che
   vuole riusare le prove senza riscriverle -- questo blocco tace e non
   tocca process.exit. Comportamento diretto INVARIATO. */
if (require.main === module && (process.argv.includes('--help') || process.argv.includes('-h'))) {
  console.log('uso: node strumenti/_q-invarianti.js [--gioco file.html] [--taglia 5] [--seme N] [--semi 8]');
  console.log('                                     [--bugiardo nan|owner|punteggio|timeleft|durata|fiato|movimento|ballz|ballvel|confini]');
  process.exit(3);
}

const BUGIARDI_NOTI = new Set(['nan', 'owner', 'punteggio', 'timeleft', 'durata', 'fiato', 'movimento', 'ballz', 'ballvel', 'confini']);
const BUGIARDO = arg('bugiardo', '');
/* GUARDIA require.main===module (voce #127, compito 2, 20 settembre
   2026 -- STESSA guardia gia' messa al blocco --help dal refactor #126,
   ma dimenticata qui): senza di lei, `process.exit(3)` scattava anche
   quando questo file viene RICHIESTO come modulo (require.main!==module)
   da un banco che ha un proprio --bugiardo con valori DIVERSI dai
   nostri -- scoperto da _q-soak.js, che ha aggiunto --bugiardo bande
   (compito 2): la riga sotto leggeva lo STESSO process.argv del
   processo (condiviso fra chi richiede e chi e' richiesto), vedeva
   "bande" non in BUGIARDI_NOTI e uccideva l'intero processo PRIMA che
   _q-soak.js potesse leggere il proprio flag. L'uso diretto di questo
   file (node strumenti/_q-invarianti.js --bugiardo qualcosa) resta
   IDENTICO: la guardia salta solo quando qualcun altro ci richiede. */
if (require.main === module && BUGIARDO && !BUGIARDI_NOTI.has(BUGIARDO)) {
  console.error('USO: --bugiardo deve essere uno fra: ' + [...BUGIARDI_NOTI].join(', '));
  process.exit(3);
}

const SEME_CANTIERE = 20260920;   // la data del piano d'esecuzione del cantiere (voce #125), default del flag --seme
/* MISURA DI SERIE A TAGLIA 5 -- default storico. La voce #98
   (determinismo instabile a 7/11) e' CHIUSA dalla voce #129 (rettifica a
   edizioni voce #130, 21 settembre 2026): il flag --taglia resta per chi
   vuole misurare a 7/11, oggi altrettanto ripetibile, non piu' "una
   deviazione da dichiarare". */
const TAGLIA_BANCO = +arg('taglia', 5);
const SEME = +arg('seme', SEME_CANTIERE);
const argSemiEsplicito = process.argv.includes('--semi');
/* Di serie 8 semi (il piano suggerisce 8-10): generalizza la prova 5
   (durata) oltre i due scenari fissi di _q-cpu-ordine.js, e da' alla
   prova 6 (cronometri-fratelli) almeno una seconda partita sulla stessa
   pagina, condizione necessaria perche' una sopravvivenza si veda (la
   primissima partita dopo il caricamento e' gia' a riposo per
   dichiarazione iniziale, azzerata o no da startMatch). In modalita'
   --bugiardo nan/owner/punteggio/timeleft/fiato/movimento/ballz/ballvel/
   confini basta UN seme a dimostrare la condanna (l'iniezione e'
   indipendente dal seme): di serie si riduce a 1, salvo --semi esplicito.
   --bugiardo durata E' DIVERSO, MISURATO: l'ordine sbagliato NON blocca
   OGNI seme in 'freekick' (la squadra 0 "umana immobile" si incastra solo
   se il gioco la porta a battere una punizione) -- su 20 semi da
   SEME_CANTIERE, 10 su 20 restano incastrati, gli altri 10 raggiungono
   'end' lo stesso (misurato in questo stesso cantiere). Un solo seme
   sarebbe un'estrazione: qui la condanna deve essere ROBUSTA, non un
   colpo di fortuna, quindi durata usa 10 semi di serie anche senza
   --semi esplicito. */
const SEMI_BANCO = argSemiEsplicito ? +arg('semi', 8) : (BUGIARDO === 'durata' ? 10 : (BUGIARDO ? 1 : 8));
/* TETTO_FOTOGRAMMI -- RICALIBRATO (voce #127, onda C -- 3, compito 2,
   20 settembre 2026). QUESTO NUMERO HA GIA' SBAGLIATO UNA VOLTA:
   scoperta P0 del compito 1 (_q-soak.js, commit precedente) -- a volume
   (--partite 1000, stesso semeBase) 5/1000 partite (0,5%) SANE (nessun
   hang, nessuna violazione delle altre undici invarianti) sforavano il
   vecchio tetto di 13200/220s, tutte bloccate in scena 'freekick' a
   esattamente 13200 fotogrammi. Con un tetto esteso (diagnosi usa-e-
   getta) le cinque raggiungevano 'end' da sole in 13267-14181
   fotogrammi (221,1-236,3s): non un hang infinito, un RIGORE A
   OLTRANZA (sudden-death ai calci di rigore) che arriva al limite di
   sicurezza del gioco stesso (CALCETTO-il-gioco.html:18523, 9 tiri a
   testa = 18 rigori totali) prima che il vecchio tetto, tarato sulla
   durata ORDINARIA, scadesse.

   IL VECCHIO 13200 (220s) era gia' "attesa +25%" DEL MANDATO -- ma
   applicato alla durata ORDINARIA di una partita CPU-CPU (_q-umore.js/
   _q-cpu-ordine.js, ~176s "attesa" x1,25). Il rigore a oltranza e' un
   esito LEGITTIMO del gioco (il gioco stesso lo decide cosi', non e' un
   bug), quindi il +25% del mandato va applicato al CASO PEGGIORE
   LEGITTIMO -- che include il rigore a oltranza -- non alla sola
   durata media. Da qui la ricalibrazione, in due pezzi misurati
   separatamente (diagnosi usa-e-getta, fuori/_misura-oltranza.js e
   fuori/_misura-pre-rigori.js, non committate, gitignored):

   1. IL PRE-RIGORI (tempo per arrivare al fischio che apre la serie).
      MATCH_SEC=90 (CALCETTO-il-gioco.html:4086) e' ESATTO a taglia 5
      (durataPartita()=round(90*FW/1150)=90 quando FW=1150, la taglia
      5 stessa, riga 3956) + fino a 40s di golden goal (limite fisso,
      riga ~17370: "G.goldenT>=40 && !G.rigori => avviaRigori()") = 130s
      di OROLOGIO DI GIOCO, ma G.timeLeft/G.goldenT NON scorrono durante
      kickoff/goal/punizioni (il gate e' "scene!=='play' && scene!==
      'golden' => return", riga ~17217): il tempo REALE (fotogrammi) e'
      quello + gli stacchi. Misurato su 427 partite reali (i 2 semi noti
      del compito 1, 20261074/20261103, con tetto esteso, PIU' 400 semi
      diversi con tetto esteso): 25/400 hanno raggiunto avviaRigori
      naturalmente, fotogramma di innesco fra 8100 e 10854 (135-180,9s),
      MASSIMO osservato 10854. Con margine (la coda a 27 campioni non e'
      detto sia il vero massimo su volumi molto piu' grandi): 12000
      fotogrammi (200s).
   2. LA SERIE A OLTRANZA (fino a 18 tiri). Ogni tiro e' un duello
      (Duel, CALCETTO-il-gioco.html:22144) con fasi zone->power->wait->
      result. Le fasi zone/wait hanno un timeout ESPLICITO lato CPU
      (cpuT<=1,1s in zone, 0,3s in wait -- vedi Duel.start/stopPower);
      la fase power (la barra che il tiratore CPU ferma da solo, righe
      ~22450-22456) NON ha un timeout in codice -- e' probabilistica
      (dado() ogni fotogramma vicino al centro/al massimo della barra),
      quindi non ha un tetto TEORICO a priori. Misurata empiricamente
      forzando t.rigori() (l'hook di test gia' esposto dal gioco,
      CALCETTO-il-gioco.html:43909) su 5000 serie a oltranza intere
      (46776 tiri campionati, 1077/5000 arrivate al limite dei 18 tiri):
      MASSIMO osservato per UN SOLO tiro = 328 fotogrammi (5,47s);
      MASSIMO osservato per una SERIE INTERA (18 tiri) = 4105 fotogrammi
      (68,4s). Il caso peggiore TEORICO (non l'osservato, per non
      ri-sforare su volumi piu' grandi del campione misurato): 18 tiri,
      OGNUNO al massimo storico di 328 fotogrammi = 5904 fotogrammi
      (98,4s) -- gia' il 44% oltre la serie intera peggiore realmente
      osservata (4105), perche' assume la coincidenza (mai vista in
      46776 tiri) che TUTTI E DICIOTTO i tiri capitino nel loro
      fotogramma peggiore insieme.

   SOMMA: 12000 (pre-rigori, con margine) + 5904 (serie a oltranza,
   teorico) = 17904 fotogrammi (298,4s). ARROTONDATO A 18000 (300s) --
   un numero tondo, leggermente sopra la somma con margine, e ben sopra
   sia il peggior caso REALE noto (14182 fotogrammi/236,4s, compito 1)
   sia la somma "cruda" dei due massimi osservati senza margine
   (10854+4105=14959): +20% su quella, +27% sul peggior caso reale.
   VECCHIO 13200 (220s, senza rigore a oltranza) -> NUOVO 18000 (300s,
   +36%): il +25% del mandato e' speso qui sul caso peggiore LEGITTIMO
   (il rigore a oltranza), non piu' sulla sola durata ordinaria.

   L'HANG (#119, timeLeft/scena congelati per sempre) resta colto da
   QUALUNQUE tetto finito: un ciclo che non finisce mai supera 18000
   fotogrammi esattamente come superava 13200 -- alzare il tetto non
   nasconde un hang, sposta solo il confine fra "lento ma legittimo" e
   "bloccato". Verificato: `node strumenti/_q-soak.js --bugiardo durata`
   resta ROSSO col tetto nuovo (vedi il suo cancello).

   CONDIVISA da _q-cpu-ordine.js (voce #121): quel banco teneva una
   COPIA LOCALE di questa costante (13200, mai importata da qui, un
   secondo numero magico duplicato a mano nonostante il refactor #126
   avesse gia' esportato questa) -- scoperto e corretto in questo stesso
   compito: ora importa TETTO_FOTOGRAMMI da qui, come _q-fuzzer.js/
   _q-soak.js gia' facevano. */
/* =========================================================================
   IL TETTO DIVENTA FUNZIONE DELLA TAGLIA (voce #130, 21 settembre 2026,
   "IL METRO PRIMA DEL GIUDICE").

   LA RETTIFICA CHE HA APERTO QUESTO CANTIERE. Il verbale #129 (MANUALE.md
   SA registro) e PUNTO-DEL-LAVORO.md (riga 11) dichiaravano: "seme
   20260924 a taglia 11 bloccato in freekick a 18000 fotogrammi,
   PRE-ESISTENTE, difetto di gioco scollegato dalla cosmetica". MISURATO
   DI NUOVO qui (fuori/_misura-seme-20260924.js, non committato --
   convenzione di casa per le sonde usa-e-getta): la partita NON e'
   bloccata, raggiunge 'end' al fotogramma 19502 (325,0s) con punteggio
   2-1, passando per una serie a rigori (G.rigori===true). Il rosso era
   IL TETTO (18000, tarato sul caso peggiore di TAGLIA 5), applicato a una
   taglia dove durataPartita() (CALCETTO-il-gioco.html:4105-4123,
   round(MATCH_SEC*FW/1150)) vale gia' 180s invece di 90s (FW=2300 contro
   1150): un rigore a oltranza legittimo a quella taglia arriva molto
   piu' vicino al tetto tarato per un'altra taglia, e lo sfonda. La
   diagnosi "difetto di gioco" del #129 era un'inferenza sbagliata sopra
   una misura vera (il taglio a 18000 leggeva probabilmente la scena
   'freekick' di passaggio, non un blocco). Rettificato a edizioni in
   MANUALE.md e PUNTO-DEL-LAVORO.md (voce #130, compito 3).

   LE MISURE PER TAGLIA (fuori/_misura-preRigori.js, stesso metodo del
   #127: simula ogni seme fino a che G.rigori diventa vero -- si apre la
   serie -- o t.state==='end' -- vittoria diretta -- e riporta il
   fotogramma di decisione; poi si somma la componente oltranza teorica).
     TAGLIA 5  -- INVARIATA, il numero storico del #127 (campione 427
                  partite, massimo osservato 10854, margine ~10,6% ->
                  12000 pre-rigori, + 18*328=5904 oltranza, arrotondato a
                  18000/300s). Nessun banco a taglia 5 cambia numero.
     TAGLIA 7  -- MISURATO 21 settembre 2026 (--taglia 7 --n 100
                  --semeBase 20260921 --tetto 25000): MASSIMO fotogramma
                  di decisione 12252 su 100 partite (13 arrivate ai
                  rigori, 0 incomplete). Margine +20% (piu' prudente del
                  10,6% storico: il campione qui e' 100 contro 427) ->
                  14702. + oltranza teorica 5904 = 20606, arrotondato a
                  21000 (350s).
     TAGLIA 11 -- MISURATO 21 settembre 2026 (--taglia 11 --n 150
                  --semeBase 20260921 --tetto 35000): MASSIMO fotogramma
                  di decisione 17136 su 150 partite (23 arrivate ai
                  rigori, 0 incomplete). Margine +20% -> 20563. +
                  oltranza teorica 5904 = 26467, arrotondato a 27000
                  (450s). Copre il seme 20260924 (19502) con margine
                  comodo.

   L'OLTRANZA E' TAGLIA-INDIPENDENTE -- VERIFICATO, non solo ragionato.
   La fase power del Duel (CALCETTO-il-gioco.html ~22479-22497) avanza il
   cursore con `s.cursor+=s.dir*dt*1.15` e decide con `dado()` (probabilita'
   legata alla difficolta', mai a FW/taglia): ne' l'incremento ne' la
   decisione dipendono dalla dimensione del campo. Confermato con una
   misura di controllo (fuori/_misura-oltranza.js, t.rigori() forzato
   ripetuto): massimo per-un-solo-tiro 276 fotogrammi su 948 tiri
   campionati a taglia 5, 277 su 2882 tiri a taglia 11 -- stesso ordine di
   grandezza del 328/46776 storico di taglia 5 (voce #127, campione molto
   piu' grande). Si tiene 328 (il campione piu' grande, quello storico)
   come base del teorico 18*328=5904 per OGNI taglia: un numero diverso
   per taglia qui non avrebbe alcuna giustificazione nel codice.

   PERCHE' NON SI E' STIMATO IL PRE-RIGORI PER PROPORZIONE (scartato in
   spec). Il rapporto fra durata-orologio (durataPartita()+40s golden) e
   fotogrammi-reali-misurati NON e' costante fra le taglie sui campioni
   raccolti: 200/130=1,538 a taglia 5 (campione 427), 204,2/166=1,230 a
   taglia 7 (campione 100), 285,6/220=1,298 a taglia 11 (campione 150) --
   probabile effetto della differenza di taglia-campione, non una legge
   fisica affidabile da estrapolare. Misurare per ogni taglia resta piu'
   onesto che dedurre da un rapporto che non torna. */
const TETTI_PER_TAGLIA = { 5: 18000, 7: 21000, 11: 27000 };
function tettoFotogrammi(taglia) {
  const t = [5, 7, 11].includes(+taglia) ? +taglia : 5;
  return TETTI_PER_TAGLIA[t];
}
/* RETROCOMPATIBILITA': chi importava la costante flat (_q-soak.js,
   _q-cpu-ordine.js prima di questo compito) continua a funzionare senza
   modifiche -- vale il numero di taglia 5, INVARIATO rispetto a prima di
   questo compito. I due banchi sono stati aggiornati in questo stesso
   compito a usare tettoFotogrammi(taglia): altrimenti riprodurrebbero,
   a --taglia 11, lo stesso falso positivo che ha aperto questo cantiere. */
const TETTO_FOTOGRAMMI = tettoFotogrammi(5);
/* Il fotogramma dell'iniezione per i bugiardi nan/owner/punteggio/
   timeleft: 150 = 2,5 s, ben oltre il kickoff piu' lungo (stesso ordine
   di grandezza del CARTELLINO_FRAME=120 di _q-umore.js), cosi' la scena
   e' gia' 'play' con ball/players popolati e in moto. */
const INIETTA_AL_FRAME = 150;
/* PROVA 9 -- calibrazione empirica (vedi la lettera di testa): massimo
   osservato su 30 semi/222282 fotogrammi a palla libera (owner<0), poi
   osservato x1,5 come margine dichiarato. */
const OSSERVATO_SP_MAX_LIBERA = 902;   // u/s, len(vx,vy), palla libera
const OSSERVATO_VZ_MAX = 268;          // u/s, |vz|, palla libera
const TETTO_VEL_PALLA = OSSERVATO_SP_MAX_LIBERA * 1.5;   // 1353
const TETTO_VZ_PALLA = OSSERVATO_VZ_MAX * 1.5;           // 402
/* PROVA 12 -- INV-04, confini+margine (voce #126, onda C -- 2, compito 2;
   vedi la lettera di testa per il perche' di questo numero: la sola
   conversione unita'<->metri ESATTA dichiarata nel gioco, taglia 11,
   FH:1490=68 m IFAB, applicata come approssimazione a qualunque taglia,
   e verificata contro le due uscite legittime note del motore -- il
   tuffo del portiere, -26/+26 unita', e la panchina dell'espulso,
   -31,2 unita' -- che deve coprire senza condannare il gioco sano). */
const U_PER_METRO_IFAB11 = 1490 / 68;              // 21,91 -- la sola calibrazione esatta nel gioco (taglia 11)
const MARGINE_CONFINI = Math.round(5 * U_PER_METRO_IFAB11);   // 110 unita' (mandato: +5 m)

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

/* =========================================================================
   LE DUE FUNZIONI DI VERIFICA -- ESTRATTE PER ESSERE RIUSATE (voce #126,
   onda C -- 2, compito 1). REFACTOR MINIMO, comportamento IDENTICO a
   prima: e' lo STESSO codice che viveva scritto in linea dentro SONDA qui
   sotto (prova 6 e prove 1/2/3/4/7/8/9), spostato in due funzioni con
   nome, SELF-CONTAINED (nessuna chiusura su variabili esterne al modulo:
   tutto cio' che serve arriva per parametro, comprese le due soglie della
   prova 9). Il motivo del nome: strumenti/_q-fuzzer.js gira il suo
   generatore di comandi TUTTO dentro un solo page.evaluate (come SONDA fa
   qui), e da dentro una pagina non si puo' fare `require('./_q-invarianti.js')`
   -- si puo' pero' prendere il CODICE SORGENTE di una funzione Node con
   `.toString()` e incollarlo nello script che si manda alla pagina (lo
   stesso trucco con cui SONDA stessa arriva li' sotto, vedi
   `pag.evaluate('(' + SONDA + ')(...)')`). Chi riusa: require('./_q-invarianti.js'),
   poi `${verificaTickInvarianti.toString()}` in testa al proprio script di
   pagina. SONDA, qui sotto, le chiama al posto del codice che prima stava
   scritto in linea: stessi campi, stessi nomi, stesso risultato -- questo
   file, eseguito direttamente, si comporta ESATTAMENTE come prima. LE
   PROVE 10/11 (DOCROSS/KICKOFF-ESPULSO, voce #128) NON entrano in questa
   estrazione: sono scenari diretti one-shot (k===0), non un controllo
   per-tick, e restano scritte in linea dentro SONDA (vedi piu' sotto) --
   nessun chiamante esterno le ha richieste finora, e duplicare la loro
   fotografia/ripristino in una terza funzione avrebbe complicato la firma
   senza un bisogno reale. */
function verificaCronometriFratelli(G, r, seme, indiceMatch) {
  const guasti = [];
  if (G.recT !== 0) guasti.push('G.recT=' + G.recT + ' (atteso 0)');
  if (G.vantaggio !== null) guasti.push('G.vantaggio=' + JSON.stringify(G.vantaggio) + ' (atteso null)');
  if (!(G.possOwner === -1)) guasti.push('G.possOwner=' + G.possOwner + ' (atteso -1)');
  if (!(G.possT === 0)) guasti.push('G.possT=' + G.possT + ' (atteso 0)');
  if (!(G.pulse === 0)) guasti.push('G.pulse=' + G.pulse + ' (atteso 0)');
  if (!(G.crowdSndT === 0)) guasti.push('G.crowdSndT=' + G.crowdSndT + ' (atteso 0)');
  if (!(G.swLock[0] === 0 && G.swLock[1] === 0)) guasti.push('G.swLock=' + JSON.stringify(G.swLock) + ' (atteso [0,0])');
  if (!(G.swTimer[0] === 0 && G.swTimer[1] === 0)) guasti.push('G.swTimer=' + JSON.stringify(G.swTimer) + ' (atteso [0,0])');
  if (guasti.length) r.cronometri.push({ seme, indiceMatch, guasti });
  return guasti.length === 0;
}

function verificaTickInvarianti(G, r, seme, fotogramma, fase, stato, cfg) {
  const CAMPI_BALL = ['x', 'y', 'z', 'vx', 'vy', 'vz'];
  const CAMPI_P = ['x', 'y', 'vx', 'vy', 'aiTX', 'aiTY'];
  let violato = false;
  const b = G.ball;
  for (const kk of CAMPI_BALL) {
    if (!Number.isFinite(b[kk])) { r.nan.push({ seme, fotogramma, fase, chi: 'ball.' + kk, val: b[kk] }); violato = true; }
  }
  /* PROVA 8 -- >=2 uomini di movimento in campo, per squadra. Stessa
     definizione del gioco (CALCETTO-il-gioco.html:18508-18509,
     diMovimentoInCampo): role!=='gk' && out<=0. */
  const movimentoInCampo = [0, 0];
  for (let i = 0; i < G.players.length; i++) {
    const p = G.players[i];
    if (p.role !== 'gk' && p.out <= 0) movimentoInCampo[p.team]++;
  }
  for (let tt = 0; tt < 2; tt++) {
    if (movimentoInCampo[tt] < 2) {
      r.movimento.push({ seme, fotogramma, fase, team: tt, inCampo: movimentoInCampo[tt] }); violato = true;
    }
  }
  for (let i = 0; i < G.players.length; i++) {
    const p = G.players[i];
    for (const kk of CAMPI_P) {
      if (!Number.isFinite(p[kk])) { r.nan.push({ seme, fotogramma, fase, chi: 'p' + i + '.' + kk + ' (' + p.role + ')', val: p[kk] }); violato = true; }
    }
    /* PROVA 7 -- clamp fiato/cond. */
    if (!(p.fiato >= 0 && p.fiato <= 100)) { r.clamp.push({ seme, fotogramma, fase, chi: 'p' + i + '.fiato (' + p.role + ')', val: p.fiato }); violato = true; }
    if (!(p.cond >= 0 && p.cond <= 100)) { r.clamp.push({ seme, fotogramma, fase, chi: 'p' + i + '.cond (' + p.role + ')', val: p.cond }); violato = true; }
    /* PROVA 12 -- INV-04, confini+margine (voce #126, onda C -- 2, compito
       2; vedi la lettera di testa per il perche' del margine). cfg.FW/
       cfg.FH arrivano dal chiamante (letti da t.campo, la taglia vera in
       corso); cfg.marginBordi e' MARGINE_CONFINI. */
    if (p.x < -cfg.marginBordi || p.x > cfg.FW + cfg.marginBordi ||
        p.y < -cfg.marginBordi || p.y > cfg.FH + cfg.marginBordi) {
      r.confini.push({ seme, fotogramma, fase, chi: 'p' + i + ' (' + p.role + ')', x: p.x, y: p.y }); violato = true;
    }
  }
  const owner = G.ball.owner;
  const ownerOk = owner === -1 || (Number.isInteger(owner) && owner >= 0 && owner < G.players.length && !(G.players[owner].out > 0));
  if (!ownerOk) { r.owner.push({ seme, fotogramma, fase, owner, nGiocatori: G.players.length }); violato = true; }

  /* PROVA 9 -- palla sotto il piano / velocita'. */
  if (b.z < 0) { r.palla.push({ seme, fotogramma, fase, tipo: 'z', val: b.z }); violato = true; }
  if (owner < 0) {
    const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (sp > cfg.tettoVelPalla) { r.palla.push({ seme, fotogramma, fase, tipo: 'velocita', val: sp, vx: b.vx, vy: b.vy }); violato = true; }
    if (Math.abs(b.vz) > cfg.tettoVzPalla) { r.palla.push({ seme, fotogramma, fase, tipo: 'vz', val: b.vz }); violato = true; }
  }

  if (G.score[0] < stato.prevScore[0] || G.score[1] < stato.prevScore[1]) {
    r.punteggio.push({ seme, fotogramma, fase, prima: stato.prevScore.slice(), dopo: G.score.slice() }); violato = true;
  }
  stato.prevScore = [G.score[0], G.score[1]];

  if (G.timeLeft > stato.prevTimeLeft + 1e-9 || G.timeLeft < 0) {
    r.timeLeft.push({ seme, fotogramma, fase, prima: stato.prevTimeLeft, dopo: G.timeLeft }); violato = true;
  }
  stato.prevTimeLeft = G.timeLeft;
  return violato;
}

/* ESPORTATE per il fuzzer (voce #126). TETTO_FOTOGRAMMI/TETTO_VEL_PALLA/
   TETTO_VZ_PALLA/SEME_CANTIERE/MARGINE_CONFINI escono anche loro: un'unica
   fonte per le soglie, invece di un secondo numero magico duplicato a
   mano altrove. tettoFotogrammi/TETTI_PER_TAGLIA (voce #130): il tetto
   per taglia, accanto alla costante flat che resta per chi non e' stato
   aggiornato (vale il numero di taglia 5, identico a prima). */
module.exports = {
  verificaCronometriFratelli, verificaTickInvarianti,
  TETTO_FOTOGRAMMI, TETTO_VEL_PALLA, TETTO_VZ_PALLA, SEME_CANTIERE, MARGINE_CONFINI,
  tettoFotogrammi, TETTI_PER_TAGLIA,
};

/* =========================================================================
   LA SONDA -- gira dentro la pagina, in UN SOLO page.evaluate: come ogni
   banco di casa, nessun rumore di rete fra un fotogramma e l'altro. */
const SONDA = (cfg) => {
  const t = window.__test;
  const r = {
    nan: [], owner: [], punteggio: [], timeLeft: [], durata: [], cronometri: [],
    clamp: [], movimento: [], palla: [], docross: [], kickoffEspulso: [], confini: [],
    semiAbortitiDaViolazione: [], semiEseguiti: 0, tickTotali: 0,
  };

  for (let k = 0; k < cfg.semi; k++) {
    const seme = cfg.seme0 + k;
    t.semina(seme);

    /* L'ORDINE (vedi la lettera di testa): giusto di serie, invertito
       SOLO per --bugiardo durata, e per TUTTI i semi di quella corsa —
       lo scenario-hang #119 non dipende dal seme. */
    if (cfg.ordineSbagliato) {
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: cfg.taglia });
    } else {
      t.startMatch(1, 1, { size: cfg.taglia });
      t.setCpuVsCpu(true);
    }

    /* PROVA 6 -- CRONOMETRI-FRATELLI, SUBITO dopo startMatch. RIUSATA
       (vedi la nota sopra servi()): stesso controllo, stesso risultato. */
    const G = t.G;
    verificaCronometriFratelli(G, r, seme, k);

    /* PROVA 12 -- INV-04, confini+margine: FW/FH letti da t.campo DOPO
       startMatch (dipendono dalla taglia scelta da setTaglia). Fissi per
       tutta la partita (la taglia non cambia a meta' seme): si rilegge a
       ogni k per correttezza, il costo e' un getter, non un ciclo caldo. */
    cfg.FW = t.campo.FW; cfg.FH = t.campo.FH;

    /* PROVA 10 -- DOCROSS, il cross-proiettile (voce #128, compito 1,
       P0-1; vedi la lettera di testa per il perche' e i numeri attesi).
       Gira UNA sola volta (k===0): lo scenario e' sintetico e non
       dipende dal seme, ripeterlo su altri semi non aggiungerebbe
       nulla. Indipendente da --bugiardo: e' permanente in batteria. */
    if (k === 0) {
      const p0 = G.players.find(pl => pl.team === 0 && pl.role !== 'gk' && pl.out <= 0);
      if (!p0) {
        r.docross.push({ seme, errore: 'nessun giocatore di movimento (squadra 0) trovato' });
      } else {
        const idx0 = G.players.indexOf(p0);
        /* ISOLAMENTO (vedi la lettera di testa): si fotografa tutto cio'
           che window.doCross(p0,0,0) puo' toccare -- ball intero (incl.
           owner/vx/vy/vz/lastTouch/toccoPiede/crossTo...), G.touches
           (segnaTocco vi spinge un elemento), G.stats.cross[team]
           (contatore), e x/y/chargeClip del giocatore -- per poterlo
           ripristinare SUBITO dopo la misura, prima che il resto del
           tick loop riprenda su questo stesso seme. */
        const ballSnap = Object.assign({}, G.ball);
        const touchesSnap = G.touches.slice();
        const crossStatSnap = G.stats.cross[p0.team] || 0;
        const px0 = p0.x, py0 = p0.y, clip0 = p0.chargeClip;

        const FH = t.campo.FH;
        p0.x = 20; p0.y = FH / 2;             // in fondo al proprio campo -- un cross lungo VERO
        G.ball.x = p0.x; G.ball.y = p0.y;      // coerenza di scena (non necessario alla fisica: kickBall legge p, non b)
        G.ball.owner = idx0;                   // bypassa il raggio KICK_R di kickBall (vedi la lettera di testa)
        window.doCross(p0, 0, 0);              // SENZA destinatario: usa il bersaglio vero, puntoCross(p0) (secondo palo)

        const sp = Math.sqrt(G.ball.vx * G.ball.vx + G.ball.vy * G.ball.vy);
        if (!(sp <= cfg.tettoVelPalla)) {
          r.docross.push({ seme, sp, vx: G.ball.vx, vy: G.ball.vy, tetto: cfg.tettoVelPalla });
        }

        Object.assign(G.ball, ballSnap);
        G.touches.length = 0; for (const el of touchesSnap) G.touches.push(el);
        G.stats.cross[p0.team] = crossStatSnap;
        p0.x = px0; p0.y = py0; p0.chargeClip = clip0;
      }
    }

    /* PROVA 11 -- KICKOFF-ESPULSO, il battitore espulso (voce #128,
       compito 2, P0-2; vedi la lettera di testa per il perche', il bug
       e l'isolamento). Gira UNA sola volta (k===0), indipendente da
       --bugiardo: e' permanente in batteria. */
    if (k === 0) {
      const bersaglio = G.players.find(pl => pl.team === 0 && pl.idx === 1);
      if (!bersaglio) {
        r.kickoffEspulso.push({ seme, errore: 'nessun giocatore team0/idx1 trovato' });
      } else {
        const idxBersaglio = G.players.indexOf(bersaglio);
        /* ISOLAMENTO (vedi la lettera di testa): si fotografa TUTTO cio'
           che resetKickoff()/scaricaCardVantaggio()/infliggiCartellino
           possono toccare -- clone completo di ogni giocatore (non solo
           i campi attesi), G.ball intero, G.ctrl, G.touches, G.vantaggio,
           G.kickTeam, G.stats.gialli/espulsi, G.battuta, G.fatti/
           G.fattiTot -- per ripristinare ESATTAMENTE il kickoff vero
           gia' prodotto da startMatch (via setupPlayers, G.kickTeam
           scelto da dado()) subito dopo la misura. */
        const playersSnap = G.players.map(p => Object.assign({}, p));
        const ballSnap = Object.assign({}, G.ball);
        const ctrlSnap = G.ctrl.slice();
        const touchesSnap = G.touches.slice();
        const vantaggioSnap = G.vantaggio;
        const kickTeamSnap = G.kickTeam;
        const gialliSnap = G.stats.gialli.slice();
        const espulsiSnap = G.stats.espulsi.slice();
        const battutaSnap = G.battuta;
        const fattiSnap = G.fatti.slice();
        const fattiTotSnap = G.fattiTot;

        /* LO SCENARIO: un cartellino differito sul team0/idx1 (il
           battitore di sempre, formation ~:10690), con la squadra gia'
           a quota 1 giallo -- il PROSSIMO (il suo) sale a 2, e
           CARTELLINI_PER_ESPULSIONE=2 fa scattare l'espulsione
           (infliggiCartellino, :18519-18525). G.kickTeam=false forza la
           squadra 0 a battere (kt=G.kickTeam?1:0, resetKickoff :10953). */
        G.vantaggio = { team: -1, x: 0, y: 0, t: 0, card: idxBersaglio };
        G.stats.gialli[0] = 1;
        G.kickTeam = false;

        window.resetKickoff();

        const owner = G.ball.owner;
        const ownerP = (owner >= 0 && owner < G.players.length) ? G.players[owner] : null;
        if (ownerP && ownerP.out > 0) {
          r.kickoffEspulso.push({ seme, owner, out: ownerP.out, team: ownerP.team, idx: ownerP.idx });
        }

        /* RIPRISTINO -- vedi ISOLAMENTO qui sopra. */
        for (let i = 0; i < G.players.length; i++) Object.assign(G.players[i], playersSnap[i]);
        Object.assign(G.ball, ballSnap);
        G.ctrl[0] = ctrlSnap[0]; G.ctrl[1] = ctrlSnap[1];
        G.touches.length = 0; for (const el of touchesSnap) G.touches.push(el);
        G.vantaggio = vantaggioSnap;
        G.kickTeam = kickTeamSnap;
        G.stats.gialli[0] = gialliSnap[0]; G.stats.gialli[1] = gialliSnap[1];
        G.stats.espulsi[0] = espulsiSnap[0]; G.stats.espulsi[1] = espulsiSnap[1];
        G.battuta = battutaSnap;
        G.fatti.length = 0; for (const el of fattiSnap) G.fatti.push(el);
        G.fattiTot = fattiTotSnap;
      }
    }

    const stato = { prevScore: [G.score[0], G.score[1]], prevTimeLeft: G.timeLeft };
    /* PROVE 1/2/3/4/7/8/9 -- RIUSATE (vedi la nota sopra servi()): stesso
       controllo, stesso risultato, spostato in verificaTickInvarianti. */
    const verificaTick = (fotogramma, fase) => verificaTickInvarianti(G, r, seme, fotogramma, fase, stato, cfg);

    let fotogrammi = 0, raggiuntoEnd = false, violatoQuiSeme = false;
    for (; fotogrammi < cfg.tetto; fotogrammi++) {
      t.simulate(1 / 60);
      r.tickTotali++;
      if (verificaTick(fotogrammi, 'normale')) { violatoQuiSeme = true; break; }

      if (cfg.bugiardo && k === 0 && cfg.bugiardo !== 'durata' && fotogrammi === cfg.iniettaAlFrame) {
        /* L'INIEZIONE -- vedi la lettera di testa: si corrompe G (lo
           stesso oggetto vivo del motore), poi si richiama verificaTick
           UNA volta, SENZA un altro simulate() in mezzo. */
        if (cfg.bugiardo === 'nan') G.ball.x = NaN;
        else if (cfg.bugiardo === 'owner') G.ball.owner = 999;
        else if (cfg.bugiardo === 'punteggio') {
          /* PER FAR SCENDERE UN PUNTEGGIO SERVE PRIMA UN VALORE VERO DA
             FAR SCENDERE: a inizio partita G.score e' spesso ancora
             [0,0], e un decremento clampato a 0 (Math.max(0,-1)) non
             cambierebbe nulla -- il bugiardo condannerebbe la prova
             SBAGLIATA (5, durata: il seme si fermerebbe senza violazione
             vera, e verrebbe letto come un hang). Si sale di proposito
             (lecito, non viola nulla: sale) per avere un campione fresco,
             poi si scende sotto QUEL campione. */
          G.score[0] = G.score[0] + 3;
          verificaTick(fotogrammi, 'iniettato-salita-lecita');
          G.score[0] = G.score[0] - 1;
        }
        else if (cfg.bugiardo === 'timeleft') G.timeLeft = G.timeLeft + 5;
        else if (cfg.bugiardo === 'fiato') G.players[0].fiato = 150;
        else if (cfg.bugiardo === 'movimento') {
          /* SCENA SINTETICA (prova 8): out>0 su 3 uomini di movimento
             della squadra 0, SENZA passare da infliggiCartellino -- la
             guardia del gioco (inCampo>2) e' proprio cio' che si scavalca
             per dimostrare che LA PROVA, non la guardia, condanna. Si
             ESCLUDE apposta il portatore di palla corrente (se e' della
             squadra 0): altrimenti la scena condannerebbe ANCHE la prova
             2 (owner) per un effetto collaterale, e la dimostrazione non
             sarebbe piu' isolata alla sola prova 8. */
          let messi = 0;
          for (let i = 0; i < G.players.length && messi < 3; i++) {
            const p = G.players[i];
            if (p.team === 0 && p.role !== 'gk' && p.out <= 0 && i !== G.ball.owner) { p.out = 1; messi++; }
          }
        }
        else if (cfg.bugiardo === 'ballz') G.ball.z = -10;
        else if (cfg.bugiardo === 'ballvel') { G.ball.owner = -1; G.ball.vx = 999999; G.ball.vy = 0; }
        /* PROVA 12 (INV-04) -- si forza p.x MOLTO oltre il limite (il
           margine e' 110 unita', qui si va a -99999): un numero finito,
           non NaN, cosi' la condanna e' isolata alla sola prova 12 (la
           prova 1/NaN resterebbe verde, come deve). */
        else if (cfg.bugiardo === 'confini') G.players[0].x = -99999;
        if (verificaTick(fotogrammi, 'iniettato')) violatoQuiSeme = true;
        break;
      }

      if (t.state === 'end') { raggiuntoEnd = true; break; }
    }

    /* PROVA 5 -- DURATA<=TETTO. Un seme interrotto DI PROPOSITO da
       un'iniezione (bugiardo nan/owner/punteggio/timeleft) non e' un
       hang: si dichiara ESCLUSO, non lo si fa passare per una violazione
       che non e'. Lo scenario --bugiardo durata invece DEVE contare qui
       (e' esattamente cio' che deve condannare). */
    if (!raggiuntoEnd) {
      if (violatoQuiSeme && cfg.bugiardo && cfg.bugiardo !== 'durata') {
        r.semiAbortitiDaViolazione.push({ seme, motivo: cfg.bugiardo });
      } else {
        r.durata.push({ seme, fotogrammi, statoFinale: t.state });
      }
    }
    r.semiEseguiti++;
  }
  return r;
};

/* REFACTOR MINIMO (voce #126, onda C -- 2, compito 1): questa IIFE apre un
   browser e stampa il verbale -- resta SOLO per l'uso diretto. Se il file
   e' require()-ato da un altro banco (_q-fuzzer.js), require.main non e'
   questo modulo e la IIFE non parte: nessun browser fantasma, nessuna
   stampa estranea nell'output di chi ha fatto il require. Comportamento
   diretto (node strumenti/_q-invarianti.js) INVARIATO: require.main===module
   e' vero esattamente nel caso di sempre. */
if (require.main === module) (async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));

  console.log('\n=== IL BANCO DELLE INVARIANTI (voce #125) ===  ' +
    (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  taglia ' + TAGLIA_BANCO +
    '  seme ' + SEME + '  semi ' + SEMI_BANCO + (BUGIARDO ? '  bugiardo=' + BUGIARDO : ''));

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(({ seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    }, { seme: SEME });

    /* Le due funzioni riusabili vanno IN TESTA allo script di pagina, come
       dichiarazioni dentro una IIFE: page.evaluate(stringa) vuole UNA sola
       espressione (misurato: due `function` di seguito a livello di
       statement danno "Unexpected token 'function'" -- Playwright
       racchiude la stringa fra parentesi per farne un'espressione, e due
       dichiarazioni consecutive dentro le stesse parentesi non sono
       un'espressione valida). L'IIFE le rende UNA espressione sola: dentro,
       tornano dichiarazioni di statement normalissime. SONDA le chiama per
       nome (vedi sopra). Eseguito direttamente qui e' un giro a vuoto (le
       stesse funzioni sono gia' nello scope del modulo) -- ma e' la STESSA
       composizione che usera' chi fa require() da fuori pagina
       (_q-fuzzer.js), quindi si tiene questa forma per esercitarla anche
       qui. */
    /* IL TETTO E' PER TAGLIA (voce #130): un banco lanciato con --taglia
       11 usava fino a questo compito il tetto flat di taglia 5 (18000),
       troppo stretto per una partita di regolamento da 180s -- lo stesso
       falso positivo che ha aperto il cantiere (vedi la lettera di testa
       di tettoFotogrammi). */
    const TETTO_ATTIVO = tettoFotogrammi(TAGLIA_BANCO);
    const r = await pag.evaluate(`(function(){
      ${verificaCronometriFratelli.toString()}
      ${verificaTickInvarianti.toString()}
      return (${SONDA})(${JSON.stringify({
      taglia: TAGLIA_BANCO, seme0: SEME, semi: SEMI_BANCO, tetto: TETTO_ATTIVO,
      bugiardo: BUGIARDO, iniettaAlFrame: INIETTA_AL_FRAME, ordineSbagliato: BUGIARDO === 'durata',
      tettoVelPalla: TETTO_VEL_PALLA, tettoVzPalla: TETTO_VZ_PALLA, marginBordi: MARGINE_CONFINI,
    })});
    })()`);

    const primi = (arr, n, f) => arr.slice(0, n).map(f).join('\n         ') + (arr.length > n ? '\n         … e altri ' + (arr.length - n) : '');

    di(r.nan.length === 0, '1. NaN/Infinity -- ball.{x,y,z,vx,vy,vz} e p.{x,y,vx,vy,aiTX,aiTY} sempre finiti',
      r.nan.length === 0 ? r.tickTotali + ' fotogrammi campionati su ' + r.semiEseguiti + ' semi, nessun NaN/Infinity'
        : primi(r.nan, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.chi + '=' + v.val));

    di(r.owner.length === 0, '2. owner valido -- G.ball.owner e\' -1 oppure 0..N-1, e se >=0 il giocatore non e\' out>0',
      r.owner.length === 0 ? r.tickTotali + ' fotogrammi campionati, owner sempre valido'
        : primi(r.owner, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): owner=' + v.owner + ' (N=' + v.nGiocatori + ')'));

    di(r.punteggio.length === 0, '3. punteggio monotono -- G.score non diminuisce mai fra due campioni',
      r.punteggio.length === 0 ? r.tickTotali + ' fotogrammi campionati, punteggio sempre non decrescente'
        : primi(r.punteggio, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.prima.join('-') + ' -> ' + v.dopo.join('-')));

    di(r.timeLeft.length === 0, '4. timeLeft monotono -- G.timeLeft non cresce mai fra due campioni e non e\' mai < 0',
      r.timeLeft.length === 0 ? r.tickTotali + ' fotogrammi campionati, timeLeft sempre non crescente e >=0'
        : primi(r.timeLeft, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.prima.toFixed(3) + ' -> ' + v.dopo.toFixed(3)));

    let detDurata;
    if (r.durata.length === 0) {
      detDurata = r.semiEseguiti + ' semi, tutte le partite non escluse hanno raggiunto \'end\' entro ' + TETTO_ATTIVO + ' fotogrammi (taglia ' + TAGLIA_BANCO + ')';
      if (r.semiAbortitiDaViolazione.length) detDurata += ' (' + r.semiAbortitiDaViolazione.length + ' semi esclusi: interrotti di proposito da --bugiardo ' + BUGIARDO + ', non un hang)';
    } else {
      detDurata = primi(r.durata, 5, v => 'seme ' + v.seme + ': ' + v.fotogrammi + ' fotogrammi, stato finale \'' + v.statoFinale + '\' (non ha raggiunto \'end\')');
    }
    di(r.durata.length === 0, '5. durata<=tetto (INV-15) -- ogni partita raggiunge \'end\' entro ' + TETTO_ATTIVO + ' fotogrammi (' + (TETTO_ATTIVO / 60).toFixed(0) + ' s, tetto per taglia ' + TAGLIA_BANCO + ')', detDurata);

    di(r.cronometri.length === 0, '6. cronometri-fratelli -- recT/vantaggio/possOwner/possT/pulse/crowdSndT/swLock/swTimer al riposo subito dopo startMatch',
      r.cronometri.length === 0 ? r.semiEseguiti + ' partite (stessa pagina), tutti i cronometri a riposo a ogni startMatch'
        : primi(r.cronometri, 5, v => 'seme ' + v.seme + ' (partita #' + v.indiceMatch + ' sulla pagina): ' + v.guasti.join(', ')));

    di(r.clamp.length === 0, '7. clamp fiato/cond -- p.fiato e p.cond in [0,100] per ogni giocatore (umore/nervi/spinta: vedi _q-umore.js)',
      r.clamp.length === 0 ? r.tickTotali + ' fotogrammi campionati, fiato/cond sempre in [0,100]'
        : primi(r.clamp, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.chi + '=' + v.val));

    di(r.movimento.length === 0, '8. >=2 uomini di movimento in campo per squadra (role!=gk, out<=0)',
      r.movimento.length === 0 ? r.tickTotali + ' fotogrammi campionati, entrambe le squadre sempre >=2 uomini di movimento'
        : primi(r.movimento, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): squadra ' + v.team + ' ha ' + v.inCampo + ' uomini di movimento'));

    di(r.palla.length === 0, '9. palla sotto il piano/velocita\' -- z>=0 sempre; a palla libera len(vx,vy)<=' + TETTO_VEL_PALLA + ' e |vz|<=' + TETTO_VZ_PALLA,
      r.palla.length === 0 ? r.tickTotali + ' fotogrammi campionati, z sempre >=0 e velocita\' a palla libera sempre entro i tetti (osservato max ' + OSSERVATO_SP_MAX_LIBERA + '/' + OSSERVATO_VZ_MAX + ' u/s su 30 semi di calibrazione)'
        : primi(r.palla, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.tipo + '=' + v.val));

    di(r.docross.length === 0, '10. DOCROSS -- il cross-proiettile (doCross, voce #128): dopo un cross lungo diretto, len(vx,vy)<=' + TETTO_VEL_PALLA,
      r.docross.length === 0 ? 'scenario diretto (crossatore in fondo al proprio campo, bersaglio vero puntoCross): velocita\' del cross entro il tetto'
        : primi(r.docross, 5, v => v.errore ? ('seme ' + v.seme + ': ' + v.errore) : ('seme ' + v.seme + ': velocita\'=' + v.sp.toFixed(1) + ' u/s (vx=' + v.vx.toFixed(1) + ', vy=' + v.vy.toFixed(1) + ') sopra il tetto ' + v.tetto)));

    di(r.kickoffEspulso.length === 0, '11. KICKOFF-ESPULSO -- il battitore espulso (resetKickoff, voce #128): dopo un cartellino differito che espelle l\'idx1 della squadra che batte, G.ball.owner non e\' mai un giocatore out>0',
      r.kickoffEspulso.length === 0 ? 'scenario diretto (cartellino differito su team0/idx1, secondo giallo di squadra, kickTeam=team0): il battitore scelto e\' sempre out<=0'
        : primi(r.kickoffEspulso, 5, v => v.errore ? ('seme ' + v.seme + ': ' + v.errore) : ('seme ' + v.seme + ': owner=' + v.owner + ' (team ' + v.team + ' idx ' + v.idx + ') ha out=' + v.out)));

    di(r.confini.length === 0, '12. CONFINI+MARGINE (INV-04, voce #126) -- ogni giocatore entro [-' + MARGINE_CONFINI + ', FW+' + MARGINE_CONFINI + '] x [-' + MARGINE_CONFINI + ', FH+' + MARGINE_CONFINI + ']',
      r.confini.length === 0 ? r.tickTotali + ' fotogrammi campionati, nessun giocatore oltre il margine di ' + MARGINE_CONFINI + ' unita\' (5 m)'
        : primi(r.confini, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.chi + ' x=' + v.x.toFixed(1) + ' y=' + v.y.toFixed(1)));

    if (ecc.length) di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]);
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' -- ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
