/* =====================================================================
   _t-l11.js — IL MOTORE D'INGRESSO (voce L1.1 di _analisi/agente28.md
   §10, Onda 1: «la spina dorsale»).

   Toppa cerca/sostituisci: legge CALCETTO-il-gioco.html (o --in),
   sostituisce SEI tratti — cinque dentro Touch5, uno dentro step() — e
   scrive la copia in --out. Se un solo ancoraggio non compare ESATTAMENTE
   UNA VOLTA si ferma con codice diverso da zero, dice quale, e non scrive
   niente. Senza --out scrive su una copia accanto al file d'ingresso
   (nome + «.l11.html»), mai sopra l'originale.

   uso:
     node strumenti/_t-l11.js --out fuori/l11.html
     node strumenti/_t-l11.js --in fuori/prima.html --out fuori/dopo.html
     node strumenti/_t-l11.js                       (copia accanto)

   IL CANCELLO SI SCRIVE PRIMA, ED E' strumenti/_q-l11.js. Misurato il
   19 agosto 2026 sul gioco di casa (base) e sulla copia toppata, banco
   Chromium 915x412 dpr2, dita di protocollo, DT = 1/60 in mano, seme
   20260819:

     controllo                                    base            toppata
     A  scarto dei 60 ms                          ROSSO           VERDE
        errore angolare senza scarto              14,04 gradi     14,04 gradi
        errore angolare con   scarto              non esiste      0,00 gradi
        (con la toppa il pallone parte davvero a 300 unita'/s e la
         direzione del suo SPOSTAMENTO dopo 0,2 s e' -90,00 gradi, cioe'
         quella che il dito diceva; il campione usato ha 66,67 ms)
     B1 percorso 60 / spostamento 0 NON annulla   VERDE           VERDE
        (1 tiro a 860 unita'/s in tutti e due i bracci: e' il controllo
         negativo, e senza di lui l'annullo potrebbe essere un grilletto
         che scatta sempre)
     B2 spostamento 100 annulla                   ROSSO           VERDE
                                                  1 tiro,         0 tiri,
                                                  860 unita'/s    palla al piede
     C1 rilascio 50 ms dopo il furto              ROSSO           VERDE
                                                  1 calcio a      0 calci
                                                  19,19 unita'
                                                  (sotto KICK_R 26)
     C2 dito tenuto oltre SHOT_HARDCAP            ROSSO           VERDE
                                                  carica 1,10 s   carica chiusa
                                                  aperta su un
                                                  uomo che
                                                  nessuno comanda

     RETTIFICA DEL 19 AGOSTO 2026, SERA — le due righe C1 e C2 qui sopra
     sono di una scena SUPERATA, e in questa casa un numero superato si
     corregge in chiaro invece di sparire. Quella scena toglieva il
     possesso e lasciava il pallone al piede, a 19,19 unita'. Dopo la
     toppa L0.4b l'etichetta del disco la scrive puoTirare(t), che a
     quella distanza e' VERA anche col pallone dell'avversario — perche'
     premere un calcio lo produce davvero — quindi il contesto NON
     cambiava e non c'era niente da ri-armare: la scena non metteva alla
     prova la proprieta' che diceva di provare, e il verde/rosso che ne
     usciva era dell'aria. La scena e' stata rifatta in _q-l11.js (il
     ladro porta via il pallone oltre KICK_R*1.4, e la validita' si
     CHIEDE a puoTirare), ed e' nata la prova simmetrica c3.
     Sul gioco del 19 agosto sera, md5 df10ac97e47e, con le scene nuove:
     otto controlli su otto verdi. E le scene mordono, provato su due
     varianti rotte apposta: col ri-armo SPENTO escono rossi C1 e C2 e
     resta verde C3; con un ri-armo che scatta a OGNI cambio di padrone
     del pallone esce rosso C3 e restano verdi C1 e C2.
     D  touchcancel non calcia (non regressione)  VERDE           VERDE
     E  la levetta comanda ancora (idem)          VERDE           VERDE
                                                  corsa 58,12 unita' in tutti e due
                        base 3 verdi su 7   ·   toppata 7 verdi su 7

   E IL CANCELLO CHE NON E' MIO: strumenti/_q-precedenza.js, che possiede
   la levetta, la riadozione e la precedenza fra le superfici, gira su
   Touch5 estratto byte per byte dal file. Base 9 su 9, copia toppata 9
   su 9. E' la ragione per cui questo motore chiede «chi comanda» a
   ctrlPlayer(t) invece di leggere G.ctrl: una prima stesura leggeva
   G.ctrl e faceva cadere CINQUE di quei nove cancelli — non perche' il
   gioco fosse rotto, ma perche' Touch5 aveva smesso di reggersi sulle
   funzioni con cui il resto del file parla del mondo.

   COSA FA QUESTA TOPPA, e sono sei cose:
     1. PUNTO DI POSA — ogni pressione su un disco registra dove il dito
        si e' posato.
     2. ANELLO DI OTTO POSIZIONI per dito, {x, y, q}. Solo POSIZIONI, mai
        velocita' (Legge 2).
     3. SCARTO DEI 60 ms — il trascinamento si legge sul campione piu'
        recente ANTERIORE di 60 ms al distacco.
     4. R_ARMA CHE CRESCE — 22 + 14·min(1, tenuta/0,60). Sotto R_ARMA il
        trascinamento non esiste.
     5. ANNULLO PER SPOSTAMENTO — oltre 96 px di SPOSTAMENTO dal punto di
        posa (non di percorso) l'atto muore.
     6. RI-ARMO SUL CAMBIO DI CONTESTO — se il contesto cambia mentre il
        dito e' giu', l'atto congelato muore, il disco si ri-arma sul
        contesto nuovo senza eseguire niente, e il punto di posa si azzera
        sulla posizione corrente del dito.

   COSA QUESTA TOPPA NON FA, e va detto perche' e' la meta' del lavoro:
   NON aggiunge, toglie o cambia un solo verbo. Alla pressione escono
   esattamente gli stessi quattro atti di oggi (startCharge, doSlide,
   doFiltrante, cambiaGiocatore), nello stesso ordine, con gli stessi
   argomenti. Nessun verbo legge ancora il trascinamento: L1.1 lo
   MISURA e lo espone, i verbi che lo consumano sono L1.2-L1.5. Non
   sposta un pixel, non tocca il disegno, non cambia raggi ne' centri,
   non tocca la levetta ne' la sua riadozione ne' la precedenza fra le
   superfici, e non tocca la regola che touchcancel non e' touchend.

   «NON CAMBIA UN BIT», E NON E' UNA DICHIARAZIONE: e' una misura.
   Novanta secondi di partita CPU contro CPU a passo fisso (5.400 chiamate
   a simulate(1/60)), seme 20260819, e a fine partita si confrontano
   punteggio, pallone (x, y, z, vx, vy) e per OGNI giocatore x, y, vx, vy
   e charge, arrotondati al milionesimo: base e copia toppata escono
   IDENTICHE, campo per campo, 0-2 in tutt'e due. Senza un dito su un
   disco questo motore non gira nemmeno: il ciclo di Touch5.passo e'
   vuoto e l'unica cosa che succede e' che un accumulatore cresce.
   La voce e' marcata «bit: no» in §10 e la marcatura regge.

   TRE COSE VERIFICATE NEL FILE PRIMA DI SCRIVERE UNA RIGA, perche' erano
   gia' state pagate e non si regrediscono:
     · touchcancel != touchend: Touch5.end e Touch5.cancel entrano in
       Touch5.chiudi con «annulla» diverso, e il ramo del tiro chiama
       annullaCarica invece di releaseCharge. Questa toppa ENTRA in quel
       ramo e lo lascia esattamente com'era per il caso «annulla»;
       il controllo D del cancello lo sorveglia.
     · la riadozione della levetta (s.riadotta, dentro Touch5.move) sta
       DOPO la riga toccata da questa toppa e non viene sfiorata: il
       ramo modificato e' quello che esce subito per i diti gia'
       catturati da un disco, e continua a uscire subito.
     · la precedenza a distanza normalizzata dentro Touch5.start
       (u = d/(r+10) per la presa, d/(r+18) per l'esclusione) resta
       identica nei numeri e nell'ordine delle due passate: cambia solo
       che il ciclo adesso sa QUALE dei due dischi ha vinto, perche'
       serve al ri-armo.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const DA = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
/* senza --out si scrive ACCANTO alla sorgente, mai sopra, e con un nome
   che comincia con l'underscore: in questa casa i file nuovi cominciano
   cosi', e una copia toppata e' un file nuovo. */
const A = path.resolve(arg('out',
  path.join(path.dirname(DA), '_' + path.basename(DA).replace(/\.html?$/i, '') + '-l11.html')));

/* ---------------------------------------------------------------------
   GLI ANCORAGGI, byte per byte come stanno nel gioco del 19 agosto 2026.
   --------------------------------------------------------------------- */
const ANCORE = [

/* =====================================================================
   1/6 — LA PRESSIONE REGISTRA IL PUNTO DI POSA.
   ===================================================================== */
{
  nome: '1/6 — il punto di posa dentro Touch5.start',
  vecchio:
`      let preso=null, uPresa=Infinity, uEscl=Infinity;
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
      }`,
  nuovo:
`      /* LE DUE PASSATE SONO QUELLE DI PRIMA, NUMERO PER NUMERO. L'unica
         differenza e' che adesso il ciclo si ricorda anche QUALE dei due
         dischi ha vinto — il suo indice, non il suo verbo — perche' il
         ri-armo (vedi Touch5.passo) deve poter ritrovare lo stesso disco
         quando il contesto gli cambia il verbo sotto il dito. L'indice e'
         l'identita' stabile del disco: 0 e' il grande (TIRA/CONTRASTA),
         1 e' il piccolo (PASSAGGIO/CAMBIO), e touchBtnLayout li mette
         sempre in quest'ordine. */
      let preso=null, slot=-1, uPresa=Infinity, uEscl=Infinity;
      const dischi=touchBtnLayout(t);
      for(let k=0;k<dischi.length;k++){
        const bt=dischi[k];
        const d=len(x-bt.x,y-bt.y);
        const up=d/(bt.r+10); if(up<uPresa){ uPresa=up; preso=bt; slot=k; }
        const ue=d/(bt.r+18); if(ue<uEscl){ uEscl=ue; }
      }
      if(uPresa<=1){
        const bt=preso;
        this.btnTouch[id]={t,act:bt.act};
        /* =============================================================
           L1.1 — IL PUNTO DI POSA. Da qui in poi il trascinamento e' il
           vettore dal punto in cui il dito SI E' POSATO alla posizione
           del dito, e non ha piu' niente a che vedere col centro del
           disco: due dita che premono lo stesso disco in due punti
           diversi devono poter dire la stessa cosa tirando nella stessa
           direzione. Nasce prima dei verbi qui sotto apposta, cosi' se
           un verbo alla pressione cambia il mondo (cambiaGiocatore lo
           fa) l'atto e' gia' registrato con l'uomo di prima.
           ============================================================= */
        this.nasceAtto(id,t,slot,bt.act,x,y);
        if(bt.act==='shot') startCharge(t);
        else if(bt.act==='slide') doSlide(t);
        else if(bt.act==='through') doFiltrante(t, humanSprint(t));
        else if(bt.act==='swap') cambiaGiocatore(t);
        return;
      }`
},

/* =====================================================================
   2/6 — L'ANELLO E L'ANNULLO PER SPOSTAMENTO.
   ===================================================================== */
{
  nome: '2/6 — l\'anello e l\'annullo dentro Touch5.move',
  vecchio:
`  move(id,x,y){
    if(this.btnTouch[id]) return;`,
  nuovo:
`  move(id,x,y){
    /* =====================================================================
       L1.1 — L'ANELLO, E L'ANNULLO CHE VIVE SULLO SPOSTAMENTO.

       Questa riga usciva subito e basta: un dito catturato da un disco non
       ha mai avuto niente da dire mentre stava giu'. Adesso ha due cose da
       dire, e continua a uscire subito — la levetta, la sua riadozione e
       la promozione dei candidati stanno tutte sotto questa riga e non
       vedono un byte di differenza (P2: la cattura vince la geometria).

       SPOSTAMENTO E NON PERCORSO, e non e' una sfumatura. Un polpastrello
       appoggiato trema di 1-2 px per evento; a 60-120 Hz sono 60-240 px di
       PERCORSO al secondo. Con la soglia sul percorso, una tenuta di
       tiro in piedi su un autobus si annulla da sola in un secondo, in
       silenzio, e chi gioca non ha modo di capire perche'. Con la soglia
       sullo spostamento il tremore non arriva mai da nessuna parte: solo
       un dito che se ne VA davvero, di 96 px, annulla. Il prezzo, e va
       detto: verso destra e verso il basso il bordo dello schermo arriva
       prima dei 96 px, quindi si annulla trascinando verso il campo — che
       e' anche la direzione naturale del «via dal pulsante».

       UNA VOLTA MORTO, MORTO. L'atto non torna in vita rientrando: e' la
       finta, ed e' anche la sola forma in cui un annullo e' un impegno.
       Rientrare disarma il TRASCINAMENTO (sotto R_ARMA torna la cosa
       sicura) — quello si', e senza scomodare questa bandiera.
       ===================================================================== */
    if(this.btnTouch[id]){
      const a=this.atti[id];
      if(a && !a.morto){
        this.scriviAnello(a,x,y);
        if(len(x-a.posaX,y-a.posaY)>=this.R_ANNULLA) this.muoreAtto(id);
      }
      return;
    }`
},

/* =====================================================================
   3/6 — IL RILASCIO CHIEDE ALL'ATTO SE E' ANCORA VIVO.
   ===================================================================== */
{
  nome: '3/6 — il rilascio dentro Touch5.chiudi',
  vecchio:
`      if(bt.act==='shot'){
        if(annulla) this.annullaCarica(bt.t);
        else if(!G.paused) releaseCharge(bt.t);
      }
      return;`,
  nuovo:
`      /* =================================================================
         L1.1 — UN ATTO MORTO NON PRODUCE NIENTE, E UN ATTO RI-ARMATO NON
         EREDITA LA CARICA DI PRIMA.

         Le tre domande, nell'ordine in cui contano:
           · «questa carica e' di questo dito?» — a.carica tiene un
             giocatore solo se fu QUESTA pressione a chiamare
             startCharge, ed e' quel giocatore. Dopo un ri-armo
             il dito tiene un verbo nuovo che non ha eseguito niente:
             se toccasse la carica, toccherebbe quella di qualcun altro.
           · «il sistema si e' preso il dito, o l'atto e' morto per
             spostamento?» — in tutt'e due i casi la carica si chiude
             SENZA calciare. Il primo caso e' la legge che questo file ha
             gia' pagato (touchcancel != touchend) e resta identico: e'
             solo il secondo che si aggiunge accanto.
           · altrimenti il rilascio esegue, come ha sempre fatto.

         LA CARICA SI CHIUDE SULL'UOMO CHE L'HA APERTA, non su chi e'
         comandato adesso. Misurato con strumenti/_q-l11.js sul gioco di
         oggi: quando la palla viene rubata durante una carica il gioco
         cambia giocatore comandato da solo, e la carica resta aperta —
         1,10 s alla fine della prova — su un uomo che nessuno comanda
         piu' e che nessun rilascio puo' piu' chiudere, perche'
         releaseCharge lavora su ctrlPlayer(t), cioe' sull'altro. Quella
         carica vale «const slow = p.charge>=0 ? 0.45 : 1» in
         updatePlayer: un uomo della propria squadra al 45% della
         velocita' per il resto della partita.
         releaseCharge resta com'e' — legge ctrlPlayer(t) — e questa toppa
         non lo cambia: la si tocchera' quando qualcuno misurera' il caso
         «il gioco cambia uomo mentre tengo il tiro E la palla resta
         nostra», che qui non e' stato misurato.
         ================================================================= */
      const a=this.atti[id];
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t);
      }
      return;`
},

/* =====================================================================
   4/6 — LO STATO A ZERO DITA COMPRENDE ANCHE GLI ATTI.
   ===================================================================== */
{
  nome: '4/6 — gli atti dentro Touch5.azzera',
  vecchio:
`    for(const k in this.btnTouch){
      const bt=this.btnTouch[k];
      delete this.btnTouch[k];
      if(bt.act==='shot') this.annullaCarica(bt.t);
    }`,
  nuovo:
`    /* L1.1 — «ZERO DITA, STATO NEUTRO» vale anche per gli atti: se non
       li si svuotasse, al ritorno dal secondo piano resterebbero atti
       vivi senza un dito sotto, con la loro tenuta e il loro punto di
       posa di mezzo minuto fa. Come per btnTouch, un atto senza dito non
       esiste.
       E la carica si chiude sull'uomo che l'ha aperta (a.carica), per la
       stessa ragione scritta dentro Touch5.chiudi; se l'atto manca — non
       dovrebbe — si ricade sul comportamento di prima invece di non fare
       niente. */
    for(const k in this.btnTouch){
      const bt=this.btnTouch[k];
      const a=this.atti[k];
      delete this.btnTouch[k];
      if(bt.act==='shot' && (!a || a.carica)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
    }
    this.atti={};`
},

/* =====================================================================
   5/6 — IL MOTORE, tutto in un posto solo, dentro Touch5.
   ===================================================================== */
{
  nome: '5/6 — il motore d\'ingresso dentro Touch5',
  vecchio:
`     Torna sempre false: chi la chiama sa che non ha fatto niente. */
  release(t,s){ return false; }
};`,
  nuovo:
`     Torna sempre false: chi la chiama sa che non ha fatto niente. */
  release(t,s){ return false; },

  /* =====================================================================
     L1.1 — IL MOTORE D'INGRESSO. Sta SOTTO i verbi, non fra i verbi.

     Da qui non esce nessun gesto. Escono due dati, che sono i due dati
     della grammatica: il TRASCINAMENTO (un vettore continuo, mai un
     settore) e lo STATO (quanto il dito e' rimasto giu'). Chi li consuma
     — la scivolata su trascinamento armato, la mira nella bocca, il bias
     del passaggio, il raddoppio — arrivera' dopo e leggera' Touch5.trascina.
     Finche' nessuno legge, questo codice non cambia un bit del gioco: e'
     esattamente cio' che deve fare una spina dorsale.

     L'OROLOGIO E' UNO SOLO, ED E' QUELLO DELLA SIMULAZIONE.
     «tempo» avanza dentro step(), un DT = 1/60 alla volta, accanto a
     «p.charge += dt» che vive li' da sempre. Non e' pignoleria: e' la
     Legge 1. Su una CPU rallentata sei volte, 23 tap su 24 vengono letti
     come tenute se la durata si misura su performance.now(), e l'errore
     va tutto da una parte. Qui la tenuta governa R_ARMA, e R_ARMA decide
     se un trascinamento ESISTE: cioe' decide il VERBO. Un verbo che
     nasce dall'orologio degli eventi misura il telefono.
     Conseguenza dichiarata: il gioco ha un accumulatore con tetto (sei
     passi per fotogramma, poi acc=0), quindi su un telefono in affanno il
     tempo di simulazione resta INDIETRO rispetto a quello vero. I 60 ms
     scartati diventano allora un po' piu' di 60 ms veri — si butta via un
     filo di trascinamento in piu', mai un filo di meno. La direzione
     dell'errore e' quella giusta: sbagliare di qualche grado la mira e'
     benigno, iniettare la deriva del distacco nella decisione no.

     L'ANELLO TIENE UNA POSIZIONE PER FOTOGRAMMA, la piu' recente di quel
     fotogramma. Otto posizioni sono quindi sempre 133,3 ms di storia,
     qualunque sia la frequenza con cui il browser manda i touchmove e
     comunque li fonda: la finestra di 60 ms ci sta dentro con il doppio
     del margine, e non dipende da quanti eventi arrivano. Se si tenessero
     gli eventi invece dei fotogrammi, un browser che ne manda dodici in
     un fotogramma riempirebbe l'anello con 8 campioni tutti dello stesso
     istante e lo scarto non avrebbe piu' niente da scartare.
     Il primo campione dell'anello e' il punto di posa e non si sovrascrive
     mai: e' il fondo su cui si appoggia il caso del gesto brevissimo.
     ===================================================================== */
  R_ARMA_0: 22,      // px CSS: sotto, il trascinamento non esiste
  R_ARMA_1: 36,      // px CSS: la stessa soglia a tenuta piena
  ARMA_PIENA: 0.60,  // s di tenuta a cui R_ARMA arriva a R_ARMA_1
  R_ANNULLA: 96,     // px CSS di SPOSTAMENTO dal punto di posa (non di percorso)
  DROP_S: 0.060,     // s di coda scartata prima del distacco
  ANELLO: 8,         // posizioni tenute per dito, una per fotogramma

  tempo: 0,          // l'orologio della SIMULAZIONE, in secondi
  atti: {},          // id del tocco -> l'atto vivo sotto quel dito

  /* NASCE UN ATTO: dove il dito si e' posato, su quale disco, con quale
     verbo, e — se ha aperto una carica di tiro — SU QUALE UOMO.
     «carica» tiene il giocatore, non il suo indice, e si chiede a
     ctrlPlayer(t), che e' il modo con cui tutto il resto del file dice
     «il comandato di questa squadra»: cosi' questo motore non mette le
     mani dentro G.ctrl, che non e' affar suo. Vale doppio: e' anche
     l'unico campo che risponde alla domanda «questa carica e' di questo
     dito?», e la risposta serve dopo un ri-armo, quando il dito tiene un
     verbo che non ha eseguito niente. */
  nasceAtto(id,t,slot,act,x,y){
    this.atti[id]={ t:t, carica:(act==='shot' ? ctrlPlayer(t) : null),
                    slot:slot, act:act,
                    posaX:x, posaY:y, x:x, y:y, tenuta:0, morto:false,
                    anello:[{x:x,y:y,q:this.tempo}] };
  },

  /* una posizione per fotogramma: dentro lo stesso fotogramma l'ultima
     vince. Il campione del punto di posa (il primo) non si tocca mai. */
  scriviAnello(a,x,y){
    a.x=x; a.y=y;
    const n=a.anello, u=n[n.length-1];
    if(n.length>1 && u.q===this.tempo){ u.x=x; u.y=y; return; }
    n.push({x:x,y:y,q:this.tempo});
    if(n.length>this.ANELLO) n.shift();
  },

  /* R_ARMA CRESCE CON LA TENUTA. Una carica di tiro puo' durare 1,25 s
     (SHOT_HARDCAP), e in 1,25 s un pollice appoggiato rotola: la soglia
     che a inizio gesto e' 22 px arriva a 36 px dopo 0,6 s, cosi' il
     rotolamento non arma da solo un verbo che nessuno ha chiesto. */
  rArma(a){
    return this.R_ARMA_0 + (this.R_ARMA_1-this.R_ARMA_0)*Math.min(1, a.tenuta/this.ARMA_PIENA);
  },

  /* LA LETTURA. finale (default) = con lo scarto dei 60 ms, ed e' quella
     del distacco; finale===false = il campione piu' recente, ed e' quella
     dell'anteprima viva, dove il collasso dell'ellisse non c'e' ancora
     perche' il dito non si sta staccando.
     PERCHE' SI SCARTANO GLI ULTIMI 60 ms: quando un pollice si stacca,
     l'ellisse di contatto collassa verso la punta e il centroide riportato
     deriva di 1-3 mm in direzione distale, cioe' 6-18 px CSS in una
     direzione fissa — iniettati esattamente nell'istante della decisione.
     E' una misura di terzi, non di questa casa, e non e' rifacibile in
     Chromium: qui il dito e' un punto che non collassa. Al banco lo si
     riproduce a mano (strumenti/_q-l11.js, prova A): 14,04 gradi di
     errore senza lo scarto, 0,00 con.
     Se nell'anello non c'e' nessun campione abbastanza vecchio — gesto
     brevissimo — si prende il piu' vecchio, che e' il punto di posa:
     trascinamento zero, cioe' la cosa sicura. E' il verso giusto in cui
     sbagliare (P9: fra due verbi vince il meno impegnativo). */
  trascina(id,finale){
    const a=this.atti[id];
    if(!a) return null;
    const n=a.anello;
    let c=n[0];
    if(finale===false) c=n[n.length-1];
    else { const lim=this.tempo-this.DROP_S;
           for(let i=0;i<n.length;i++) if(n[i].q<=lim) c=n[i]; }
    const dx=c.x-a.posaX, dy=c.y-a.posaY, l=len(dx,dy);
    const R=this.rArma(a);
    return { dx:dx, dy:dy, l:l,
             ux: l>0 ? dx/l : 0, uy: l>0 ? dy/l : 0,
             rArma:R, armato:(!a.morto && l>=R), morto:a.morto,
             tenuta:a.tenuta, atto:a.act, slot:a.slot,
             eta:this.tempo-c.q };
  },

  /* chiude una carica di tiro SENZA calciare, su un GIOCATORE indicato,
     invece che su «quello comandato adesso». Gemella di annullaCarica,
     che resta dov'e' per i suoi chiamanti e non cambia di un byte; le
     tre condizioni sono le sue, parola per parola. */
  chiudiCarica(p){
    if(p && p.charge>=0 && !p.chargeGo && p.chargeKind==='tiro') chiudiAnticipo(p);
  },

  /* l'atto muore: il rilascio non produrra' niente, e cio' che l'atto
     teneva aperto si chiude subito. Subito e non al rilascio, perche' una
     carica aperta non e' innocua nemmeno per un istante: vale slow = 0,45
     sul giocatore e il tetto SHOT_HARDCAP la fa partire da sola. */
  muoreAtto(id){
    const a=this.atti[id];
    if(!a || a.morto) return;
    a.morto=true;
    if(a.carica){ this.chiudiCarica(a.carica); a.carica=null; }
  },

  /* =====================================================================
     IL PASSO DELLA SIMULAZIONE — la tenuta, e il ri-armo.

     IL RI-ARMO. Fino a oggi, se il contesto cambiava mentre il dito era
     giu', non succedeva niente: l'atto restava congelato su cio' che il
     disco offriva alla pressione. «Niente» sembra la scelta prudente e
     non lo e' — sto caricando il tiro, mi soffiano la palla, il dito e'
     ancora giu' e da quell'istante non comanda piu' nulla finche' non lo
     alzo e lo ripremo: 300-500 ms di paralisi nell'unico istante della
     partita in cui 300 ms costano un gol.
     Adesso l'atto congelato MUORE, il disco si RI-ARMA sul contesto nuovo
     SENZA eseguire niente, e il punto di posa si azzera sulla posizione
     corrente del dito — se no un trascinamento vecchio armerebbe il verbo
     nuovo, che e' il modo peggiore di essere utili. Anche la tenuta
     riparte da zero: la tenuta di un verbo non e' la tenuta di un altro.
     ESEGUIRE NIENTE non e' timidezza: il disco difensivo esegue il
     contrasto ALLA PRESSIONE, e una pressione che l'utente non ha fatto
     non puo' produrre un contrasto. Quello che si guadagna e' che il dito
     gia' giu' TIENE il verbo nuovo, e da li' in poi tutto funziona.

     COS'E' UN «CAMBIO DI CONTESTO», qui: che il disco sotto il dito
     offra un verbo diverso da quello che l'atto teneva. Non c'e' una
     seconda definizione di contesto scritta da nessuna parte — si chiede
     a touchBtnLayout, che e' la stessa funzione che decide le etichette e
     che risolve il tocco. Il giorno in cui il contesto diventera' tre
     (IO / NOI / LORO) e si stabilizzera' (b.passTo dentro possessoTeam,
     piu' l'isteresi), questo ri-armo seguira' senza che qui cambi una
     riga: e' un vantaggio dell'aver legato il ri-armo al VERBO OFFERTO
     invece che a una copia locale del possesso.

     COSTO. Il ciclo gira solo se c'e' almeno un dito su un disco: a mani
     libere non esegue niente. Con un dito giu' sono due oggetti allocati
     per passo (la coppia che torna touchBtnLayout), 120 al secondo.
     ===================================================================== */
  passo(dt){
    this.tempo+=dt;
    for(const id in this.atti){
      const a=this.atti[id], bt=this.btnTouch[id];
      /* un atto senza il suo dito non esiste: e' una cintura, non una
         regola — chiudi e azzera lo cancellano gia' loro */
      if(!bt){ delete this.atti[id]; continue; }
      const d=touchBtnLayout(a.t)[a.slot];
      if(d && d.act!==a.act){
        if(a.carica) this.chiudiCarica(a.carica);
        a.act=d.act; bt.act=d.act;
        /* il verbo nuovo non ha eseguito niente, quindi non tiene aperta
           nessuna carica: da qui in poi questo dito non ha piu' titolo a
           chiudere o a far partire il tiro di nessuno */
        a.carica=null;
        a.posaX=a.x; a.posaY=a.y;
        a.anello=[{x:a.x,y:a.y,q:this.tempo}];
        a.tenuta=0; a.morto=false;
        continue;
      }
      if(!a.morto) a.tenuta+=dt;
    }
  }
};`
},

/* =====================================================================
   6/6 — L'OROLOGIO DEL MOTORE E' QUELLO DI step().
   ===================================================================== */
{
  nome: '6/6 — Touch5.passo(dt) dentro step()',
  vecchio:
`  /* cariche di tiro (umani): il dito le fa crescere, il tetto le rilascia.
     Solo quelle SENZA chargeGo, cioe' quelle che aspettano un rilascio: le
     altre le fa maturare maturaAnticipi e sommare i due passi le
     raddoppierebbe la velocita'. */
  for(let t=0;t<2;t++){`,
  nuovo:
`  /* L1.1 — IL MOTORE D'INGRESSO BATTE QUI, e non altrove.
     Sta attaccato alle cariche di tiro perche' e' lo stesso orologio: dt
     e' il passo fisso della simulazione, l'unico che la Legge 1 ammette
     sotto una decisione di verbo. Sta PRIMA del ciclo qui sotto perche'
     il ri-armo puo' chiudere una carica, e una carica chiusa non deve
     crescere di un altro dt nello stesso passo. */
  Touch5.passo(dt);
  /* cariche di tiro (umani): il dito le fa crescere, il tetto le rilascia.
     Solo quelle SENZA chargeGo, cioe' quelle che aspettano un rilascio: le
     altre le fa maturare maturaAnticipi e sommare i due passi le
     raddoppierebbe la velocita'. */
  for(let t=0;t<2;t++){`
},

];

/* ---------------------------------------------------------------------
   PRIMA SI CONTROLLA TUTTO, POI SI SCRIVE. Una toppa che applica il primo
   ancoraggio e inciampa sul secondo lascia un file a meta': peggio di una
   toppa che non applica.
   --------------------------------------------------------------------- */
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }
if (path.resolve(A) === path.resolve(DA)) {
  console.error('FALLITO: --out coincide con --in. Questa toppa non scrive mai sopra il file d\'ingresso.');
  process.exit(1);
}

let src = fs.readFileSync(DA, 'utf8');
const primaCar = src.length, primaByte = Buffer.byteLength(src, 'utf8');

let male = 0;
for (const a of ANCORE) {
  const n = src.split(a.vecchio).length - 1;
  if (n !== 1) {
    male++;
    console.error('FALLITO: ancoraggio «' + a.nome + '» trovato ' + n + ' volte, non 1.');
    console.error('  cercavo:\n' + a.vecchio.split('\n').map(r => '    | ' + r).join('\n'));
  }
  const g = src.split(a.nuovo).length - 1;
  if (g !== 0) { male++; console.error('FALLITO: «' + a.nome + '» risulta GIA\' applicato (' + g + ' volte).'); }
}
if (male) { console.error('\nNon scrivo niente. ' + male + ' ancoraggi fuori posto.'); process.exit(1); }

for (const a of ANCORE) src = src.split(a.vecchio).join(a.nuovo);

fs.mkdirSync(path.dirname(A), { recursive: true });
fs.writeFileSync(A, src);
const dopoCar = src.length, dopoByte = Buffer.byteLength(src, 'utf8');
console.log('toppa L1.1 applicata: ' + ANCORE.length + ' ancoraggi su ' + ANCORE.length);
for (const a of ANCORE) console.log('    · ' + a.nome);
console.log('  da:   ' + DA);
console.log('  a:    ' + A);
/* caratteri e byte non sono la stessa cosa: src.length conta unita'
   UTF-16, il file sul disco conta byte UTF-8, e in questi commenti ci
   sono accenti e virgolette basse */
console.log('  delta: ' + (dopoCar - primaCar) + ' caratteri  ·  ' + (dopoByte - primaByte) + ' byte UTF-8 sul disco');
console.log('  il cancello: node strumenti/_q-l11.js --gioco ' + path.relative(RADICE, A).replace(/\\/g, '/'));
