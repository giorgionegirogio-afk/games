/* =====================================================================
   _t-precedenza.js — LA PRECEDENZA FRA LE SUPERFICI DI TOCCO.
   Edizione 3, 19 agosto 2026. Toppa cerca/sostituisci: legge
   CALCETTO-il-gioco.html (o --da), sostituisce SEI tratti dentro
   Touch5, e scrive la copia in --a. Se un solo ancoraggio non compare
   ESATTAMENTE UNA VOLTA si ferma con codice diverso da zero, dice quale
   manca, e non scrive niente.

   uso:
     node strumenti/_t-precedenza.js --a fuori/dopo.html
     node strumenti/_t-precedenza.js --da altro.html --a fuori/dopo.html
     node strumenti/_t-precedenza.js --a x.html --solo 1   (solo la mezzaluna)
     node strumenti/_t-precedenza.js --a x.html --solo 2   (solo la levetta)
     node strumenti/_t-precedenza.js --dentro          (scrive nel gioco)

   I sei ancoraggi stanno in DUE GRUPPI che riparano difetti
   indipendenti, e --solo prende un gruppo alla volta: il critico ha
   chiesto di poter applicare il primo senza il secondo, e adesso si puo'.
     gruppo 1 = un ancoraggio,    la mezzaluna (dentro Touch5.start)
     gruppo 2 = cinque ancoraggi, la levetta   (start, move, chiudi, azzera x2)

   BASE. Questa edizione e' puntata sul gioco del 19 agosto 2026,
   md5 804328ee32d205024df6c265465e4ef5, 1.694.101 byte — cioe' DOPO che
   un'altra onda ha reso Touch5.release inerte, ha diviso end/cancel in
   Touch5.chiudi e ha aggiunto la riadozione dentro Touch5.move. Una
   stesura precedente di questa toppa era puntata sul gioco di ieri
   (81c7247a…, 1.689.939 byte) e non si applica piu': gli ancoraggi non
   ci sono, e la toppa lo dice invece di indovinare.

   ---------------------------------------------------------------------
   COSA CAMBIA DALL'EDIZIONE 2 (le riserve del critico, una per una).

   R1 BLOCCANTE — «la promozione gira A GIOCO IN PAUSA». CHIUSA due volte,
      e la seconda e' quella che conta:
        · la guardia `if(!G.paused){` sul blocco pend di Touch5.move,
          identica a quella che la riadozione ha due righe sopra;
        · e soprattutto l'UNIFICAZIONE con la riadozione (sotto), che
          toglie di mezzo il motivo per cui c'era qualcosa da promuovere
          a gioco fermo.
      A CHI VA IL MERITO, misurato invece che dichiarato. Il cancello
      _q-precedenza.js gira su quattro varianti costruite per differenza
      dalla stessa copia toppata (scratchpad e3/varianti.js), cosi'
      nessuna delle due riparazioni si prende il merito dell'altra:

        variante                        C3 pausa   C5 azzera neutro  C9 rete
        base senza toppa                  OK            OK             OK
        edizione 2 (nessuna delle due)    NO (78/182)   NO (pend 1,2)  NO (1764)
        e3 con la sola guardia            OK            NO (pend 1,2)  OK
        e3 con la sola unificazione       OK            OK             OK
        edizione 3 (tutte e due)          OK            OK             OK

      Cioe': la guardia da sola CHIUDE N1 ma lascia aperta N2;
      l'unificazione da sola le chiude tutte e due. La riparazione che il
      critico ha chiesto e' giusta, e non e' quella minima: quella minima
      lascia in piedi il secondo dei suoi rilievi. Ci sono tutte e due
      perche' la guardia costa zero.
      La tabella della deriva sull'edizione 2, rimisurata da me e uguale
      alla sua: 12px 0,00 · 13px 0,03 · 20px 0,24 · 30px 0,53 · 46px 1,00
      · 67px 1,00 con lo SCATTO. Sull'edizione 3, 0,00 a ogni deriva da 0
      a 90 px, per il dito che comandava e per quello che non aveva mai
      comandato: 182 combinazioni, tutte zero.

   R2 non bloccante — «azzera() non svuota pend». CHIUSA, e non con una
      riga di pulizia ma facendo delle due cose UNA SOLA. Vedi qui sotto.
      Il controllo C5 del cancello riproduce il rilievo del critico parola
      per parola — dopo azzera con due candidati fermi restavano
      pend=["1","2"] — e adesso resta il vuoto.

   R3 minore — «seq/pendSeq scritti e mai letti». CHIUSA leggendoli:
      `seq` decide quale candidato arma la riadozione quando due dita si
      sono appoggiate insieme. Non e' un ornamento: due tocchi che
      arrivano nello stesso evento touchstart hanno lo STESSO
      performance.now(), quindi `ot` pareggia e non sa dire chi era
      primo. `seq` lo sa.

   R4 non bloccante — «la prova a due dita non e' in nessun cancello».
      CHIUSA: strumenti/_q-precedenza.js e' un cancello vero (esce 1 se
      rompe), e prova due dita — al banco su Touch5 estratto byte per
      byte dal gioco, e SUL TELEFONO VERO con --telefono.
        · al banco:    sulla base 9 controlli, 5 passati e 4 ROSSI (C1,
                       C2, C6, C7 — cioe' esattamente le proprieta' che
                       questa toppa introduce); sulla copia toppata 9 su
                       9. Un cancello che non sa diventare rosso non
                       sorveglia niente: questo lo sa, e lo dimostra a
                       ogni corsa sulla base.
        · sul telefono (OnePlus 6, Android 11, due dita scritte su
          /dev/input/event2, vista 810x384, APK ricostruito con
          strumenti/_t-apk.py e reinstallato prima di ogni braccio):
              senza toppa  comando del pollice SPENTO in 42 prove su 42
              con la toppa                                 0 prove su 42
          braccio di controllo (lo stesso gesto col solo pollice) 3 su 3
          in tutti e due, zero prove nulle, e la firma del gioco letta
          DALLA PAGINA a ogni corsa.

   ---------------------------------------------------------------------
   L'UNIFICAZIONE: DOPO UN AZZERAMENTO ESISTE UNA SOLA BANDIERA.

   Il critico ha chiesto se `pend` e la riadozione possano adottare lo
   stesso dito due volte o annullarsi a vicenda. Risposta, letta nel
   codice e misurata al banco:

     · NON si annullano e NON adottano due volte SULLA STESSA SQUADRA.
       In Touch5.move la riadozione gira PRIMA (:8861-8876) e il blocco
       pend gira DOPO, e la prima cosa che il blocco pend fa e' chiedere
       «questa levetta e' gia' di questo dito?»
           if(sq.active && sq.id===id){ delete this.pend[id]; }
       cioe' se la riadozione ha appena adottato il dito, il candidato si
       ritira in silenzio. La consegna e' esplicita, non fortunata.

     · MA SI SOVRAPPONEVANO DAVVERO IN UN PUNTO: dopo un azzeramento
       c'erano DUE rappresentazioni della stessa cosa — «un dito e'
       appoggiato sul vetro e non sta piu' parlando al gioco». La
       riadozione la teneva in `s.riadotta`; l'edizione 2 di questa toppa
       ne teneva una seconda, indipendente, in `pend`. Due bandiere per
       un fatto solo: e' esattamente la forma di un difetto futuro, ed e'
       la stessa cosa che il critico ha visto come R1 e R2.

   Adesso e' UNA. `Touch5.azzera` converte i candidati in riadozione e
   svuota `pend`:
       il candidato piu' vecchio della squadra (seq minimo) diventa
       l'origine di s.riadotta, se e solo se non c'era gia' una levetta
       viva a fornirla; poi this.pend={}.
   E' la traduzione esatta di cio' che il gioco faceva PRIMA della toppa:
   prima della toppa quel dito era la levetta viva (start la assegnava
   subito), quindi azzera armava la riadozione con la sua origine. La
   toppa gliela toglie al touchstart e gliela ridA' all'azzeramento: da
   fuori, dopo una pausa, non e' cambiato niente.

   Conseguenza secca: in pausa `pend` e' VUOTO — `start` esce subito se
   G.paused, e `azzera` ha appena svuotato — quindi non c'e' piu' niente
   da promuovere a gioco fermo. La guardia `if(!G.paused){` resta lo
   stesso, perche' costa zero e perche' non voglio che la correttezza di
   Touch5.move dipenda dal fatto che qualcun altro, un giorno, si ricordi
   di chiamare azzera prima di mettere in pausa.

   L'UNICO POSTO DOVE UN DITO PUO' ANCORA ESSERE ADOTTATO DUE VOLTE, e
   non e' roba mia. A due giocatori la riadozione usa `teamOf(x)` con la
   x di ADESSO, mentre un dito porta con se' la squadra che aveva al
   touchstart. Un dito che parte a sinistra e attraversa la meta' campo,
   con la riadozione armata a destra, finisce a comandare TUTTE E DUE le
   levette. Misurato — riga «2P, dito che attraversa la meta'» di
   `node strumenti/_q-precedenza.js --misure`:
       senza questa toppa   un solo dito comanda tutte e due:  SI
       con questa toppa                                        SI
   Cioe' esiste gia' nella base, con gli stessi valori, e la toppa non lo
   crea ne' lo peggiora: prima il dito era la levetta di sinistra dal
   touchstart, adesso ci arriva con la promozione, e l'esito e' lo
   stesso. NON L'HO RIPARATO: sarebbe riscrivere la riadozione di
   un'altra onda dentro una toppa che parla d'altro. Lo lascio scritto
   qui e nel cancello, misurato, perche' qualcuno lo chiuda apposta.

   ---------------------------------------------------------------------
   DIFETTO 1 — LA MEZZALUNA CHE UCCIDE UNA PRESA LEGITTIMA.

   Il codice di prima fa le due domande — «lo prendi?» e «sei troppo
   vicino per fare altro?» — DENTRO LO STESSO CICLO, col disco grande per
   primo:

       for(const bt of touchBtnLayout(t)){
         const d=len(x-bt.x,y-bt.y);
         if(d<=bt.r+10){ ...presa...; return; }
         if(d<=bt.r+18) return;            // esclusione: il tocco muore
       }

   La geometria dichiarata dal gioco (touchBtnLayout, riga ~8800):
     · GRANDE  (VW-64, VH-60) r 40  ->  presa 50, esclusione 58
     · PICCOLO (VW-158,VH-72) r 30  ->  presa 40, esclusione 48
   fra i centri corrono radice(94^2+12^2) = 94,7629 px CSS.

   Poiche' 40 + 58 = 98 > 94,7629, l'insieme
       d(piccolo) <= 40  E  d(grande) <= 58
   NON e' vuoto: e' una mezzaluna di 53,131 px^2 (formula della lente:
   r1^2*acos(...) + r2^2*acos(...) - mezza radice di Erone; stesso numero
   a quattro cifre per quadratura numerica a 4*10^7 passi), corda 24,53 px
   e spessore 3,2371 nel punto piu' largo. Dentro quella mezzaluna il
   grande risponde «morto» PRIMA che il piccolo possa rispondere «preso»:
   una presa legittima del disco piccolo muore nell'anello di esclusione
   del grande. MISURATA, non dedotta: 47 punti di reticolo a passo 1 su
   23.116, tutti dentro la mezzaluna, tutti dello stesso tipo
   (presa30 -> morto).

   RETTIFICA DICHIARATA. L'edizione 1 di questo cappello scriveva 50,93
   px^2 per questa mezzaluna e 49,2 per la speculare. Sono sbagliati tutti
   e due, e il secondo inverte anche l'ordine. I valori giusti,
   ricalcolati in due modi indipendenti:
       diretta   (presa40 dentro escl58)  53,131 px^2
       speculare (presa50 dentro escl48)  54,078 px^2   <- la PIU' GRANDE
   Lo spessore e' identico nelle due (3,2371 = 40+58-d = 50+48-d), la
   corda no (24,53 contro 24,97).

   E non e' una mezzaluna qualunque: giace sul SEGMENTO fra i due centri,
   dalla parte del piccolo che guarda il grande — cioe' esattamente sul
   vettore con cui il pollice destro, che riposa sul grande, arriva al
   piccolo. Il difetto sta dove il dito passa, non dove non passa mai.

   La mezzaluna speculare oggi non morde per CASO: il grande e' il primo
   dell'elenco. Basta invertire l'elenco perche' il difetto si sposti li'.
   Una riparazione che dipende dall'ordine dell'elenco non e' una
   riparazione.

   LA CURA: DISTANZA NORMALIZZATA, in due passate.
     1. per ciascun disco u_presa = d / (r+10). Se il minimo e' <= 1
        vince QUEL disco — il piu' dentro in proporzione al proprio
        raggio, non il primo dell'elenco;
     2. altrimenti u_escl = d / (r+18). Se il minimo e' <= 1 il tocco
        muore (la sicura contro il flick involontario resta intatta);
     3. altrimenti e' levetta.
   Nota di onesta': coi due dischi di OGGI la normalizzazione non cambia
   nemmeno una risposta, perche' i due cerchi di presa (50 e 40) sono
   disgiunti (50+40 = 90 < 94,7629). Cio' che ripara la mezzaluna e' la
   SECONDA PASSATA. La normalizzazione serve perche' la riparazione
   sopravviva al giorno in cui qualcuno avvicina i dischi o cresce i
   raggi: costa due divisioni per disco, una volta per touchstart.

   ---------------------------------------------------------------------
   DIFETTO 2 (P6) — UNA SOLA LEVETTA PER SQUADRA, AL PRIMO CHE ARRIVA.

       const s=this.stick[t];
       if(s.active) return;

   In un giocatore teamOf() restituisce 0 per QUALUNQUE ascissa: i due
   pollici finiscono sulla stessa levetta. Un dito che manca i dischi e
   cade sull'erba DIVENTA la levetta, e da quell'istante il pollice che
   comanda la corsa e' morto finche' quel dito non si alza.

   QUANTO GRANDE, misurato con due dita, dita d'appoggio sparse su TUTTO
   il vetro (reticolo pieno della vista + corona a sette raggi attorno al
   pollice), non solo dalla parte comoda. Questi numeri sono di OGGI, del
   cancello _q-precedenza.js, sulla base del 19 agosto:
     · al banco (Blink, 915x412), un giocatore:  231 su 232  ->  0 su 232
     · al banco, due giocatori, per meta' campo:
                       sinistra 116 su 118 -> 0 · destra 116 su 122 -> 0
     · SUL TELEFONO VERO (OnePlus 6, Android 11, due dita scritte sul
       dispositivo di ingresso del kernel, vista 810x384):
                                                  42 su 42  ->  0 su 42
   L'ultimo e' una prova a DUE DITA VERE, e le due dita vive nello stesso
   istante sono CONTATE a ogni prova, non presunte: una prova in cui non
   ce n'erano due e' nulla e non entra nel conto (zero nulle in queste
   corse). C'e' anche il braccio di controllo, lo stesso gesto col solo
   pollice, 3 su 3 in tutti e due i bracci: se non comandasse nemmeno da
   solo, la prova non starebbe misurando P6.
   PERCHE' NON SONO I NUMERI DI IERI. L'edizione 2 di questo cappello
   diceva 275 su 282 al banco e 119 su 119 sul telefono. Erano misurati su
   una base diversa e con un altro attrezzo (_z-precedenza.js), che oggi
   sul telefono non arriva in fondo — muore quando un dito posato al bordo
   fa scattare il gesto INDIETRO di Android e la WebView sparisce. Non li
   ho verificati e quindi non li spedisco: al loro posto ci sono i numeri
   che chiunque puo' rifare con `node strumenti/_q-precedenza.js`.

   COSA NON E' PIU' VERO, e va detto forte. Fino a ieri questo difetto
   costava anche il pallone: quando il dito vagante si alzava,
   Touch5.release lo trovava con un solo punto di storia — velocita' zero,
   «rilascio semplice» — e partiva un doPass che nessuno aveva chiesto.
   Da oggi NO: un'altra onda ha reso release inerte (release(t,s){return
   false;}), e il cancello lo misura sul CHIAMANTE invece che sull'effetto
   (controllo C7: due dita d'erba insieme, chiamate a Touch5.release 1
   prima della toppa e 0 dopo). Il difetto che resta e' solo
   «spegne la corsa», ed e' quello che questa toppa ripara.

   ---------------------------------------------------------------------
   RITIRATA DICHIARATA — LA CURA DELL'EDIZIONE 1 ERA PEGGIORE DEL MALE.

   L'edizione 1 curava P6 cosi': la levetta si puo' TOGLIERE, ma solo
   verso il lato del movimento
       if(s.active){ const aDestra=(G.mode===2)?(t===1):true;
                     if(aDestra ? !(x<s.ox) : !(x>s.ox)) return; }
   Un critico l'ha misurata e l'ha bocciata, con ragione. Riprodotta e
   confermata dal banco di questa edizione (strumenti/_t-precedenza-
   ritirata.js costruisce il file rovinato apposta):
     · un giocatore, dito vagante fermo mentre il pollice corre:
       levetta RUBATA in 84 prove su 273, comando SPENTO nelle stesse 84,
       e le 84 stanno tutte dalla parte in cui l'edizione 1 del banco non
       aveva mai posato un dito;
     · due giocatori, la stessa regressione SPECCHIATA in tutte e due le
       meta', che il critico aveva previsto e che nessuno aveva misurato.
   E' ritirata. Qui sotto non c'e' nessuna riga che tolga la levetta a chi
   ce l'ha, in nessun modo e in nessuna direzione.

   ---------------------------------------------------------------------
   LA CURA DI ADESSO: LA LEVETTA NON SI PRENDE APPOGGIANDO IL DITO,
   SI PRENDE MUOVENDOLO.

   Quattro regole, e nessuna toglie mai niente a chi sta comandando.

     R1. AL TOUCHSTART NESSUNO PRENDE LA LEVETTA. Un dito che non e'
         finito su un pulsante diventa un CANDIDATO: origine, squadra,
         ordine d'arrivo, storia. `if(s.active) return;` resta dov'era,
         PRIMA dell'annotazione: se la levetta e' gia' di qualcuno il
         dito nuovo non viene nemmeno registrato — e' invisibile
         esattamente come prima della toppa.
     R2. LA LEVETTA VA AL PRIMO CANDIDATO CHE SI MUOVE di almeno
         SOGLIA_LEVETTA = 6 px dalla propria origine, e solo se la
         levetta e' LIBERA, e solo A GIOCO NON FERMO. L'origine promossa
         e' quella del touchstart, quindi il dx che ne esce e' identico
         px per px a quello di prima. La soglia sta SOTTO la dead-zone
         (STICK_DEAD = 12): fra 0 e 6 px il comando che il gioco ricava
         era gia' zero, quindi la promozione ritardata non toglie
         un'unita' di movimento a nessuno. Chi perde la corsa viene
         dimenticato: da quel momento e' un dito che non comanda, come lo
         era prima della toppa il secondo dito.
     R3. UN CANDIDATO CHE SI ALZA SENZA AVER MAI COMANDATO produce un
         rilascio solo se era l'UNICO contatto d'erba della sua squadra,
         e se non lo era spegne anche gli altri. Oggi non fa differenza
         perche' release e' inerte — e il banco lo misura, zero gesti da
         tutte le parti — ma il giorno in cui il rilascio tornasse a
         produrre un gesto il passaggio fantasma resterebbe impossibile
         per costruzione, non per attenzione.
     R4. UN AZZERAMENTO NON CANCELLA UN CANDIDATO, LO CONSEGNA ALLA
         RIADOZIONE. Il candidato piu' vecchio della squadra diventa
         l'origine di s.riadotta se non c'e' gia' una levetta viva a
         darla, e `pend` si svuota. Dopo un azzeramento esiste UNA sola
         bandiera per «dito appoggiato che non sta parlando», ed e'
         quella che il gioco aveva gia'.

   COSA CAMBIA E COSA NO, misurato voce per voce da _q-precedenza.js:
     · un dito solo (tocco, trascinamento, flick): identico. Il controllo
       C8 lo verifica in modo esatto — in sei direzioni e per sessantacin-
       que px, l'origine della levetta resta quella del TOUCHSTART e il dx
       che il gioco legge e' x - x0, non x - (dove il dito stava quando e'
       scattata la promozione). E il cancello _p-giocata.js --tutte da' 5
       passate su 8 sul gioco di oggi (due corse su due) e 5 su 8 sul
       gioco toppato, con le STESSE tre fallite (tocco, tiro, cross — i
       tre gesti che vivevano sul rilascio, che l'altra onda ha reso
       inerte). DICHIARAZIONE DI DISPERSIONE: una terza corsa sul gioco
       toppato ha dato 4 su 8, con «filtrante» caduta sulla velocita' del
       pallone. Lanciata da sola, quella prova passa 4 volte su 4 sul
       gioco toppato e 4 su 4 sulla base: e' dispersione di quel cancello
       dentro --tutte, non un effetto di questa toppa — ma il numero
       storto si scrive lo stesso, invece di ripetere finche' viene bello;
     · secondo dito che arriva mentre il primo COMANDA -> non registrato,
       non ruba, non rilascia: identico a prima;
     · due dita che arrivano PRIMA che qualcuno comandi -> comanda quella
       che si MUOVE, non quella che si e' appoggiata prima. E' questa la
       riparazione di P6, ed e' l'unica differenza di comportamento;
     · pausa e ripresa: identico al gioco non toppato, a ogni deriva del
       dito appoggiato (vedi la tabella qui sotto);
     · L'UNICA DIFFERENZA VISIBILE, misurata: durante un tocco FERMO la
       levetta non e' di nessuno (active false contro active true), e
       drawTouchSticks la disegna sotto il dito solo se active e' vero.
       Finche' il pollice sta dentro 6 px dall'origine quel disegno non
       compare — e per un dito che non si muove mai non compare affatto.
       Non ho misurato se un giocatore se ne accorga: ho misurato lo
       stato. (L'edizione 2 diceva «~80 ms»: era una stima, non una
       misura, e il critico ha avuto ragione a toglierla.)

   IL COSTO CHE C'ERA IERI E OGGI NON C'E' PIU'. Sulla base di ieri, con
   release ancora attivo, questa cura costava un passaggio: due contatti
   d'erba fermi, e nessuno dei due lo faceva partire (prima ne partiva uno
   su due). Sulla base di oggi il numero e' 0 contro 0, perche' nessun
   rilascio produce piu' un passaggio. Il costo di ieri non si spedisce
   piu' come costo di oggi.

   DOVE GIRA, per davvero. Il gruppo 2 sta FUORI dalla guardia
   `!G.cpu[t] && (scene play|golden|kickoff)` che si apre a :8821 e si
   chiude a :8838: gira in OGNI scena e per OGNI squadra, menu compresi.
   (L'edizione 1 di questo cappello diceva il contrario, e sbagliava: il
   critico l'ha verificato.) Fuori dal gioco non fa danno perche' l'unica
   cosa che accende e' un oggetto in `pend` che nessuno legge, e il
   rilascio e' inerte.

   COSA QUESTA TOPPA NON FA: non sposta un pixel, non cambia raggi ne'
   centri, non tocca il disegno, non riscrive una riga della riadozione
   (le sta APPENA DOPO, e le consegna i candidati invece di duplicarla).
   `__test.comandiTouch` continua a dichiarare la stessa geometria.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const DA = path.resolve(arg('da', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const A = process.argv.includes('--dentro') ? DA : arg('a', null);
const SOLO = arg('solo', null);

/* ---------------------------------------------------------------------
   GLI ANCORAGGI, byte per byte come stanno nel gioco.
   --------------------------------------------------------------------- */
const ANCORE = [
  {
    id: '1', gruppo: '1',
    nome: '1/6 — il ciclo unico presa+esclusione dentro Touch5.start',
    vecchio:
`      for(const bt of touchBtnLayout(t)){
        const d=len(x-bt.x,y-bt.y);
        if(d<=bt.r+10){
          this.btnTouch[id]={t,act:bt.act};
          if(bt.act==='shot') startCharge(t);
          else if(bt.act==='slide') doSlide(t);
          else if(bt.act==='through') doFiltrante(t, humanSprint(t));
          else if(bt.act==='swap') cambiaGiocatore(t);
          return;
        }
        /* zona di esclusione: un dito che manca il pulsante di poco NON
           diventa origine dello stick — se no il rilascio potrebbe
           partire come flick (tiro o scivolata involontari) */
        if(d<=bt.r+18) return;
      }`,
    nuovo:
`      /* =================================================================
         LA PRECEDENZA FRA LE SUPERFICI, IN DISTANZA NORMALIZZATA.

         Prima presa ed esclusione stavano nello STESSO ciclo, col disco
         grande per primo: il grande rispondeva «morto» (raggio 58) prima
         che il piccolo potesse rispondere «preso» (raggio 40). Fra i due
         centri corrono radice(94^2+12^2) = 94,7629 px e 40+58 = 98:
         esisteva quindi una MEZZALUNA — d(piccolo)<=40 e d(grande)<=58,
         53,131 px^2, corda 24,53 px, spessore 3,2371 — in cui una presa
         LEGITTIMA del disco piccolo moriva dentro l'anello di esclusione
         del grande. E quella mezzaluna giace sul segmento fra i due
         centri, dalla parte del piccolo che guarda il grande: cioe'
         esattamente sul vettore con cui il pollice destro, che riposa sul
         grande, arriva al piccolo. Il difetto stava dove il dito passa.
         (La mezzaluna SPECULARE — presa50 dentro escl48 — e' ancora piu'
         grande, 54,078 px^2, e oggi non morde solo perche' il grande e'
         il primo dell'elenco.)

         Adesso le due domande sono in DUE PASSATE, in distanza
         normalizzata u = d / R:
           1. u_presa = d/(r+10) su ogni disco: se il minimo e' <= 1
              vince QUEL disco — il piu' dentro in proporzione al proprio
              raggio, non il primo dell'elenco;
           2. altrimenti u_escl = d/(r+18): se il minimo e' <= 1 il tocco
              muore, e la sicura contro il flick involontario resta;
           3. altrimenti e' levetta.
         Coi due dischi di oggi la normalizzazione non cambia nessuna
         risposta (i cerchi di presa, 50 e 40, sono disgiunti: 90 <
         94,7629): a riparare la mezzaluna e' la seconda passata. La
         normalizzazione serve perche' la riparazione regga il giorno in
         cui i raggi o i centri cambiano — senza di essa il primo disco
         dell'elenco vincerebbe anche dove il dito e' visibilmente piu'
         dentro l'altro.
         ================================================================= */
      let preso=null, uPresa=Infinity, uEscl=Infinity;
      for(const bt of touchBtnLayout(t)){
        const d=len(x-bt.x,y-bt.y);
        const up=d/(bt.r+10); if(up<uPresa){ uPresa=up; preso=bt; }
        const ue=d/(bt.r+18); if(ue<uEscl){ uEscl=ue; }
      }
      if(uPresa<=1){
        const bt=preso;
        this.btnTouch[id]={t,act:bt.act};
        if(bt.act==='shot') startCharge(t);
        else if(bt.act==='slide') doSlide(t);
        else if(bt.act==='through') doFiltrante(t, humanSprint(t));
        else if(bt.act==='swap') cambiaGiocatore(t);
        return;
      }
      /* zona di esclusione: un dito che manca il pulsante di poco NON
         diventa origine dello stick — se no il rilascio potrebbe
         partire come flick (tiro o scivolata involontari) */
      if(uEscl<=1) return;`,
  },
  {
    id: '2', gruppo: '2',
    nome: '2/6 (P6) — al touchstart la levetta non si assegna a nessuno',
    vecchio:
`    const s=this.stick[t];
    if(s.active) return;
    s.active=true; s.id=id; s.ox=x; s.oy=y; s.dx=0; s.dy=0;
    s.riadotta=null;    /* un dito nuovo batte sempre quello da riadottare */
    s.hist=[{x,y,t:performance.now()}];
  },
`,
    nuovo:
`    const s=this.stick[t];
    /* ===================================================================
       LA LEVETTA NON SI PRENDE APPOGGIANDO IL DITO: SI PRENDE MUOVENDOLO.

       Qui c'era, subito dopo la riga sopra:
           if(s.active) return;
           s.active=true; s.id=id; s.ox=x; s.oy=y; ...
       cioe' UNA levetta per squadra, al primo dito che si appoggia. In un
       giocatore teamOf() risponde 0 per qualunque ascissa, quindi i due
       pollici si contendono la STESSA levetta e vince chi ha toccato
       prima. Conseguenza (P6): un dito che manca i dischi e cade
       sull'erba diventa la levetta, e da quell'istante il pollice che
       comanda la corsa non esiste piu' finche' quel dito non si alza.
       MISURATO, e rifacibile con «node strumenti/_q-precedenza.js»:
       comando del pollice spento in 231 prove su 232 al banco (dita
       d'appoggio sparse su tutto il vetro) e in 42 su 42 con due dita
       VERE sul telefono; con questa toppa, 0 e 0. Il braccio di
       controllo — lo stesso gesto col solo pollice — comanda in tutti e
       due i casi, prima e dopo.

       LA RIGA «if(s.active) return;» RESTA, ed e' la prima cosa che si
       legge: finche' una levetta e' di qualcuno, nessun altro dito la
       tocca — non la ruba, non la sposta, non la spegne. Un tentativo
       precedente di curare P6 dando la levetta «al dito piu' avanzato
       verso il lato del movimento» e' stato misurato e ritirato: rubava
       la levetta a un pollice in corsa e gli spegneva il comando. Il
       numero di quella bocciatura sta in strumenti/_t-precedenza.js
       insieme all'attrezzo che ricostruisce il file rovinato: qui non ci
       va, perche' un numero dentro il gioco resta per anni e nessuno lo
       rimisura.

       Quello che cambia e' PRIMA: al touchstart la levetta non si assegna
       a nessuno. Il dito diventa un CANDIDATO. La levetta va al primo
       candidato che si MUOVE di SOGLIA_LEVETTA px (vedi Touch5.move), un
       candidato che si alza senza aver mai comandato non produce nessun
       gesto e spegne gli altri candidati della sua squadra (vedi
       Touch5.chiudi), e un azzeramento non lo cancella ma lo consegna
       alla riadozione (vedi Touch5.azzera). Da qui: in P6 comanda il
       pollice che trascina, non quello che si e' appoggiato per primo; e
       un dito vagante non puo' far partire un rilascio, perche' finche'
       e' sul vetro insieme a un altro contatto d'erba nessun rilascio
       parte, e se l'altro comanda il vagante non e' nemmeno registrato.

       «s.riadotta=null» resta dov'era per la stessa ragione di prima —
       un dito nuovo batte sempre quello da riadottare — e sta ora nel
       ramo che tutti i touchstart d'erba attraversano.
       =================================================================== */
    if(s.active) return;
    s.riadotta=null;    /* un dito nuovo batte sempre quello da riadottare */
    this.pend[id]={t,ox:x,oy:y,ot:performance.now(),seq:++this.pendSeq,
                   hist:[{x,y,t:performance.now()}]};
    /* una sola rete di sicurezza: se un touchend si perde (schermata
       spenta, applicazione in fondo), il candidato resterebbe li' per
       sempre. Dopo un minuto non e' piu' un dito. */
    for(const k in this.pend) if(this.pend[k].ot < this.pend[id].ot-60000) delete this.pend[k];
  },
  /* i candidati alla levetta: identificativo del tocco -> {t,ox,oy,ot,seq,hist}.
     «seq» non e' un ornamento: due dita che si appoggiano nello stesso
     evento touchstart condividono lo stesso performance.now(), quindi
     «ot» pareggia e non sa dire chi e' arrivato prima. Lo legge
     Touch5.azzera per scegliere quale candidato arma la riadozione. */
  pend:{},
  pendSeq:0,
  /* quanto deve spostarsi un dito prima di poter comandare la levetta.
     6 px: SOTTO la dead-zone dello stick (STICK_DEAD = 12), quindi fra 0
     e 6 px il comando che il gioco ricava era gia' zero e la promozione
     ritardata non toglie un'unita' di movimento a nessuno; e sopra il
     tremolio di un polpastrello appoggiato che non vuole correre. */
  SOGLIA_LEVETTA:6,
`,
  },
  {
    id: '3', gruppo: '2',
    nome: '3/6 (P6) — la promozione, dentro Touch5.move, DOPO la riadozione e a gioco non fermo',
    vecchio:
`    for(let t=0;t<2;t++){
      const s=this.stick[t];
      if(s.active && s.id===id){
        s.dx=x-s.ox; s.dy=y-s.oy;
`,
    nuovo:
`    /* ===================================================================
       LA PROMOZIONE. Il candidato che si muove di SOGLIA_LEVETTA px
       prende la levetta — ma SOLO SE E' LIBERA: non esiste in tutta
       questa toppa un ramo che la tolga a chi ce l'ha.
       L'origine promossa e' quella del TOUCHSTART, non quella del momento
       della promozione, quindi il dx che ne esce e' identico px per px a
       quello di prima. E siccome la soglia (6) sta sotto la dead-zone
       (STICK_DEAD 12), nell'intervallo in cui la promozione ritarda il
       comando era gia' zero: non si perde un'unita' di movimento.

       «if(!G.paused)» E' LA STESSA GUARDIA CHE HA LA RIADOZIONE DUE
       RIGHE SOPRA, e per la stessa ragione, scritta nel gioco accanto a
       setPaused: «in pausa si alzano le dita: se no si riprende con la
       levetta ancora premuta dov'era e il giocatore riparte da solo».
       Oggi e' una cintura oltre alle bretelle — a gioco fermo «pend» e'
       vuoto, perche' start esce subito e azzera l'ha appena svuotato —
       ma non voglio che la correttezza di questa funzione dipenda dal
       fatto che qualcun altro si ricordi di chiamare azzera.

       Sta DOPO la riadozione apposta, e non la duplica: se la riadozione
       ha gia' adottato questo dito, il candidato si ritira in silenzio
       (primo ramo qui sotto). Dopo un azzeramento la bandiera e' una
       sola, ed e' «s.riadotta»: i candidati gliela consegnano dentro
       Touch5.azzera.
       =================================================================== */
    if(!G.paused){
      const q=this.pend[id];
      if(q){
        const sq=this.stick[q.t];
        if(sq.active && sq.id===id){
          delete this.pend[id];          /* adottato: non e' piu' un candidato */
        } else {
          q.hist.push({x,y,t:performance.now()});
          if(q.hist.length>14) q.hist.shift();
          if(!sq.active && len(x-q.ox,y-q.oy)>=this.SOGLIA_LEVETTA){
            sq.active=true; sq.id=id; sq.ox=q.ox; sq.oy=q.oy;
            sq.dx=x-sq.ox; sq.dy=y-sq.oy;
            const lq=len(sq.dx,sq.dy);
            if(lq>70){ sq.ox=x-sq.dx/lq*70; sq.oy=y-sq.dy/lq*70; sq.dx=x-sq.ox; sq.dy=y-sq.oy; }
            sq.hist=q.hist; sq.riadotta=null;
            delete this.pend[id];
            /* chi ha perso la corsa smette di esistere per il comando:
               e' lo stato in cui prima della toppa si trovava il secondo
               dito arrivato — sul vetro, ma senza voce. */
            for(const k in this.pend) if(this.pend[k].t===q.t) delete this.pend[k];
          }
          return;
        }
      }
    }
    for(let t=0;t<2;t++){
      const s=this.stick[t];
      if(s.active && s.id===id){
        s.dx=x-s.ox; s.dy=y-s.oy;
`,
  },
  {
    id: '4', gruppo: '2',
    nome: '4/6 (P6) — il candidato che si alza, dentro Touch5.chiudi',
    vecchio:
`    for(let t=0;t<2;t++){
      const s=this.stick[t];
      if(s.active && s.id===id){
        s.active=false; s.id=-1;
        this.release(t,s);
        s.dx=0; s.dy=0; s.hist=[];
      }
    }
  },
`,
    nuovo:
`    /* ===================================================================
       IL CANDIDATO CHE SI ALZA SENZA AVER MAI COMANDATO.
       Produce un rilascio solo se era l'UNICO contatto d'erba della sua
       squadra; e se non lo era, il gesto e' finito per tutti — gli altri
       candidati di quella squadra si spengono, se no il dito vagante
       otterrebbe il suo rilascio un momento piu' tardi, quando resta solo
       lui sul vetro. Non e' un'ipotesi: un banco l'ha visto succedere su
       una stesura precedente di questa toppa, quando Touch5.release
       faceva ancora partire un doPass — il dito vagante otteneva il suo
       passaggio alla seconda alzata invece che alla prima.
       Regola netta: se due dita d'erba della stessa squadra si sono
       trovate insieme sul vetro, da quel gesto non esce nessun rilascio.
       NOTA DI ONESTA': oggi Touch5.release e' INERTE — torna false e non
       fa niente — quindi questo ramo non cambia nulla di visibile. Cio'
       che si misura non e' l'effetto ma la CHIAMATA, che e' la proprieta'
       di questo codice e non di release: controllo C7 di
       strumenti/_q-precedenza.js, chiamate a Touch5.release con due dita
       d'erba insieme, 1 prima e 0 dopo.
       Sta qui per il giorno in cui il rilascio tornasse a produrre un
       gesto: allora il passaggio fantasma resterebbe impossibile senza
       che nessuno debba ricordarsene. La stessa ragione per cui
       Touch5.release e' rimasta al suo posto invece di sparire.
       =================================================================== */
    {
      const q=this.pend[id];
      if(q){
        delete this.pend[id];
        let solo=true;
        for(const k in this.pend) if(this.pend[k].t===q.t){ solo=false; break; }
        if(solo){ if(!this.stick[q.t].active) this.release(q.t,q); }
        else for(const k in this.pend) if(this.pend[k].t===q.t) delete this.pend[k];
        /* QUI C'ERA UN return, E LASCIAVA UN GIOCATORE A CORRERE DA SOLO
           PER SEMPRE. Il caso, misurato: due giocatori, entrambi corrono,
           pausa col tasto Indietro, ripresa, il primo alza il pollice e lo
           riappoggia vicino alla riga di meta' campo, scivola di CINQUE
           pixel e lo rialza. Sotto i 6 px il candidato resta in pend
           mentre la riadozione dell'altra meta' ha gia' adottato il dito:
           al touchend questo ramo cancellava il candidato e usciva,
           saltando il ciclo qui sotto che spegne la levetta dell'altra
           squadra. Risultato: il giocatore 2 corre a velocita' piena CON
           LO SCATTO, senza un dito sul vetro, e non si spegne piu' —
           nessun touchstart nuovo lo tocca (if s.active return), solo
           un'altra pausa lo libera. Griglia deterministica sulle pose
           vicino alla riga: 765 su 1530 con il return, 0 su 1530 senza.
           Nessun cancello lo vedeva: la rete casuale tira coordinate
           uniformi su tutta la vista e non genera mai un movimento dentro
           la banda 0-6 px, che e' l'unica che questo ramo governa. Ci
           voleva un controllo deterministico, non piu' casualita'.
           Togliendo il return il ciclo sotto gira sempre, e non sporca
           niente: chiama release solo per una levetta attiva con questo
           id, che nel caso normale non esiste. */
      }
    }
    for(let t=0;t<2;t++){
      const s=this.stick[t];
      if(s.active && s.id===id){
        s.active=false; s.id=-1;
        this.release(t,s);
        s.dx=0; s.dy=0; s.hist=[];
      }
    }
  },
`,
  },
  {
    id: '5', gruppo: '2',
    nome: '5/6 — azzera: i candidati si consegnano alla riadozione, e pend si svuota',
    vecchio:
`    for(const k in this.btnTouch){
      const bt=this.btnTouch[k];
      delete this.btnTouch[k];
      if(bt.act==='shot') this.annullaCarica(bt.t);
    }
    for(let t=0;t<2;t++){`,
    nuovo:
`    for(const k in this.btnTouch){
      const bt=this.btnTouch[k];
      delete this.btnTouch[k];
      if(bt.act==='shot') this.annullaCarica(bt.t);
    }
    /* ===================================================================
       I CANDIDATI SI CONSEGNANO ALLA RIADOZIONE, E POI NON ESISTONO PIU'.

       Un candidato e' un dito appoggiato sul vetro che non ha ancora
       comandato. Un azzeramento non lo alza — il pollice e' ancora li' —
       quindi cancellarlo e basta lo renderebbe muto per sempre: nessun
       touchstart nuovo arrivera' mai per lui. E' esattamente il difetto
       che la riadozione qui sotto esiste per curare.
       Quindi il candidato piu' vecchio della squadra («seq» minimo:
       «ot» non basta, due dita che si appoggiano nello stesso evento
       hanno lo stesso performance.now()) diventa l'origine di
       s.riadotta, ma solo se non c'e' gia' una levetta VIVA a darla —
       quella ha sempre la precedenza. Poi «pend» si svuota.

       E' la traduzione esatta di cio' che il gioco faceva prima della
       toppa: prima, quel dito era la levetta viva fin dal touchstart, e
       azzera armava la riadozione con la sua origine. La toppa gliela
       toglie all'inizio del gesto e gliela restituisce qui. Da fuori,
       dopo una pausa, non cambia niente: misurato a NOVANTUNO derive del
       dito appoggiato (da 0 a 90 px) per due dita diverse — quella che
       comandava e quella che non aveva mai comandato — e alla ripresa il
       giocatore sta fermo in tutte e 182, come sul gioco non toppato;
       poi al primo movimento riprende a comandare, come sul gioco non
       toppato. Controlli C3 e C4 di strumenti/_q-precedenza.js.

       E soprattutto: da qui in poi «un dito e' giu' e non sta parlando»
       ha UNA sola rappresentazione, «s.riadotta», non due. Il contratto
       scritto qui sopra — ZERO DITA, STATO NEUTRO — vale di nuovo per
       tutto lo stato del tocco, «pend» compreso.
       =================================================================== */
    const pri=[null,null];
    for(const k in this.pend){
      const q=this.pend[k];
      if(!pri[q.t] || q.seq<pri[q.t].seq) pri[q.t]=q;
    }
    this.pend={};
    for(let t=0;t<2;t++){`,
  },
  {
    id: '6', gruppo: '2',
    nome: '6/6 — azzera: la riadozione si arma anche dal candidato',
    vecchio:
`      s.riadotta = s.active ? { ox: s.ox, oy: s.oy } : null;`,
    nuovo:
`      s.riadotta = s.active ? { ox: s.ox, oy: s.oy }
                            : (pri[t] ? { ox: pri[t].ox, oy: pri[t].oy } : null);`,
  },
];

/* ------------------------------------------------------------------ */
if (!A) { console.error('FALLITO: manca --a <destinazione> (o --dentro).'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }
if (SOLO && !ANCORE.some(a => a.gruppo === SOLO)) {
  console.error('FALLITO: --solo ' + SOLO + ' non esiste. Gruppi: 1 (mezzaluna), 2 (levetta).');
  process.exit(1);
}
const DAFARE = SOLO ? ANCORE.filter(a => a.gruppo === SOLO) : ANCORE;

let src = fs.readFileSync(DA, 'utf8');
const primaCar = src.length;
const primaByte = Buffer.byteLength(src, 'utf8');

/* PRIMA SI CONTROLLA TUTTO, POI SI SCRIVE. Una toppa che applica il primo
   ancoraggio e inciampa sul secondo lascia un file a meta': peggio di una
   toppa che non applica. */
let male = 0;
for (const a of DAFARE) {
  const n = src.split(a.vecchio).length - 1;
  if (n !== 1) {
    male++;
    console.error(`FALLITO: ancoraggio «${a.nome}» trovato ${n} volte, non 1.`);
    console.error('  cercavo:\n' + a.vecchio.split('\n').map(r => '    | ' + r).join('\n'));
  }
  /* e non deve essere GIA' toppato: se il testo nuovo c'e' gia', ci si
     ferma invece di raddoppiarlo */
  const g = src.split(a.nuovo).length - 1;
  if (g !== 0) { male++; console.error(`FALLITO: «${a.nome}» risulta GIA' applicato (${g} volte).`); }
}
if (male) { console.error('\nNon scrivo niente. ' + male + ' ancoraggi fuori posto.'); process.exit(1); }

for (const a of DAFARE) src = src.split(a.vecchio).join(a.nuovo);

const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
const dopoCar = src.length, dopoByte = Buffer.byteLength(src, 'utf8');
console.log(`toppa applicata: ${DAFARE.length} ancoraggi su ${ANCORE.length}` +
  (SOLO ? ` (--solo ${SOLO})` : '') + ', dentro Touch5');
for (const a of DAFARE) console.log('    · ' + a.nome);
console.log('  da:   ' + DA);
console.log('  a:    ' + dest);
/* CARATTERI E BYTE NON SONO LA STESSA COSA, e l'edizione 1 li confondeva:
   src.length conta unita' UTF-16, il file sul disco conta byte UTF-8, e
   in questi commenti ci sono accenti e virgolette basse. Si stampano
   tutti e due, con il nome giusto. */
console.log(`  delta: ${dopoCar - primaCar} caratteri  ·  ${dopoByte - primaByte} byte UTF-8 sul disco`);
