/* =====================================================================
   _t-scatto-scudo.js — IL QUINTO DISCO: LO SCATTO SI CHIEDE, E IL CORPO
   SA PROTEGGERE LA PALLA  (29 agosto 2026).

   LA FAMIGLIA. Delle 46 voci di peso alto dell'area COMANDI, la terza
   famiglia e' quella dei verbi che NON riguardano il pallone: lo scatto
   (voce 3), le mosse di gambe (4), il dribbling faccia a faccia e lo
   scudo (12), il portiere (15, 23, 24, 33), gli ordini al compagno (16)
   e l'ordine tattico col dito (35). Il difetto centrale e' uno solo:
   TUTTI E QUATTRO I DISCHI SONO LEGATI AL PALLONE — TIRA/CONTRASTA,
   FILTRANTE/CAMBIO, PASSA/PRESSA, CROSS/SCIVOLATA — e il pollice non ha
   nessun canale per un verbo del CORPO. Questa toppa apre quel canale:
   un QUINTO disco, che si TIENE, e i primi due verbi che ci passano.

   ---------------------------------------------------------------------
   LO SCATTO NON ERA UNA SCELTA, ED E' MISURATO OGGI.

   Il gioco spedito accende lo scatto quando la levetta supera
   STICK_SPRINT = 66 px; ma Touch5.move ricentra l'origine a MAXR = 70,
   quindi il vettore che il gioco legge vale ESATTAMENTE 70 appena il
   dito si allontana di piu'. Fra 66 e 70 ci sono quattro pixel, e la
   mediana della levetta in gioco ci cade dentro.

   Banco strumenti/_p-scatto.js, 3 semi x 7 gesti di pollice veri
   (Input.dispatchTouchEvent, 915x412, 11 contro 11, fotogrammi in mano
   al banco: due corse danno lo stesso numero), 1821 fotogrammi con la
   levetta fuori dalla zona morta, corsa del 29 agosto 2026 sul file
   fuori/cmd-terza-base.html (md5 2109f7546a17d161d293b67397851fae):

     |levetta|  mediana 70,0  ·  massimo 70,0  ·  oltre 66 px nel 67,1%
     scatto acceso                                              65,8%
     per gesto:  corsa lunga 95%  ·  diagonale 95%  ·  cambio 95%
                 affondo 91%  ·  MEZZA CORSA 0%  ·  correzione corta 0%
                 passettino 0%
     fiato: minimo 5,6 su 100, uomo stanco (sotto 25) nell'8,3%

   Non e' un verbo: e' una soglia di DISTANZA DEL DITO. Chi trascina piu'
   di settanta pixel scatta sempre (91-95%), chi ne trascina cinquanta
   non scatta MAI (0% sulla mezza corsa, che pure e' una corsa), e
   nessuna delle due cose l'ha chiesta. E' anche il difetto che ha gia'
   costretto il pallonetto a emigrare sulla levetta indietro: 18 tiri su
   18 scavalcati (vedi il commento di releaseCharge).

   ---------------------------------------------------------------------
   LA CURA, in tre pezzi.

   1. IL QUINTO DISCO. Due facce come tutti gli altri, e la faccia la
      decide la LEVETTA invece del possesso:
        SCATTO   quando il dito chiede andatura (levetta oltre la meta'
                 della corsa piena)
        SCUDO    quando l'uomo ha il pallone e la levetta e' quasi ferma
      Sono le due meta' della stessa TENUTA: sopra SCUDO_ANDATURA la
      spinta va nelle gambe, sotto va nel corpo. Un'etichetta sola non
      poteva dirle tutte e due senza mentire.
      Sta a (bx-220, VH-148), r 26: nella fila di mezzo, a sinistra di
      CROSS. Due posti piu' comodi al pollice sono stati provati e
      bocciati con la misura — uno da _q-dischi, uno dal telefono vero —
      e il verbale sta accanto al disco.

   2. LO SCATTO ESCE DALLA LEVETTA. `humanSprint` non guarda piu' la
      lunghezza del vettore: guarda se un dito tiene il disco (o Shift
      sulla tastiera) E se la levetta chiede andatura. STICK_SPRINT
      sparisce — una costante che non decide piu' niente e' una costante
      morta, e in questa casa ne abbiamo gia' due di avanzo (PULSE_T,
      FLICK_WIN0/1).

   3. LO SCUDO. Tenuta + pallone suo + levetta quasi ferma: l'uomo GIRA
      LE SPALLE all'avversario piu' vicino (stesso inseguimento d'angolo
      di 0,07 s di tutte le altre rotazioni: il corpo gira, non scatta) e
      il pallone gli si mette DIETRO, a CARRY_SCUDO = 11 unita' di
      bersaglio invece delle 16-33 davanti ai piedi (misurate 9-11 vere,
      perche' il pallone insegue il bersaglio con la sua molla). Non serve nessuna regola nuova sul
      furto: le due che ci sono gia' fanno tutto il lavoro —
        · il furto col corpo chiede l'avversario entro P_R+B_R+1 dal
          PALLONE, e adesso fra lui e il pallone c'e' un uomo;
        · «di spalle si ruba molto meno» (stealP*0,55) si accende da
          solo, perche' schiena contro petto e' esattamente il prodotto
          scalare che quella riga cerca.
      Zero dado() nuovi: vedi LA LEGGE SUI SORTEGGI, qui sotto.

   ---------------------------------------------------------------------
   IL DOPO, MISURATO SULLA STESSA COPIA (29 agosto 2026,
   fuori/cmd-terza.html).

   LO SCATTO, stesso banco e stesso copione di pollice del PRIMA:
     dito solo sulla levetta   scatto acceso  0,0%  su 1752 fotogrammi
     disco SCATTO tenuto       scatto acceso 70,8%  su 1821 fotogrammi
   e per gesto, col disco tenuto: corsa lunga 98%, diagonale 93%, cambio
   di direzione 86%, affondo 81%, MEZZA CORSA 67% — che prima valeva 0%,
   perche' la levetta a 51,5 px non arrivava ai 66 della soglia. E' la
   seconda meta' della cura, e vale quanto la prima: adesso si scatta
   anche a mezza andatura, se lo si chiede.
   Il fiato racconta la stessa storia: senza il dito il minimo resta
   31,9 su 100 e l'uomo non e' mai stanco (0% dei fotogrammi sotto 25);
   col dito scende a 0 e l'uomo e' stanco nel 34,9%. Prima erano 5,6 e
   8,3% senza che nessuno l'avesse chiesto.

   LO SCUDO, banco strumenti/_p-scudo.js, 480 duelli per braccio (10
   semi x 3 distanze x 8 angoli x 2 impegni), 5 contro 5:
                          un secondo e mezzo        otto secondi
     pallone ancora mio   2,5% -> 95,0%             6,0% -> 57,1%
     pallone perso       97,5% ->  5,0%           100,0% -> 43,3%
     distanza minima
     avversario-pallone   9,4 -> 32,6 unita'        3,8 -> 30,3
     quando si perde      0,47 s -> mai            0,48 s -> 6,30 s
   Il pallone si tiene NOVE VOLTE piu' a lungo, e a otto secondi si
   perde lo stesso nel 43% dei casi: il fiato finisce e la protezione
   cade. E' un baratto, non un rifugio.

   LA PROVA CHE IL BANCO NON MISURA SE STESSO: sullo stesso banco, sul
   gioco SENZA la toppa, i due bracci escono identici cifra per cifra
   (7,7% mio, 41,7% loro, 50,6% libero, distanza minima 3,8, perso allo
   0,48 s in tutti e due). Se il quinto disco non fa niente, il banco lo
   dice.

   ---------------------------------------------------------------------
   LA LEGGE SUI SORTEGGI. Nessuna riga di questa toppa chiama dado().
   Tutte e tre le strade nuove passano da isHuman o da G.cpu[t]: in una
   partita CPU contro CPU — che e' come si misurano equita' e
   determinismo — non ne gira nemmeno una. Verificato, non dedotto, e in
   due modi:
     · strumenti/_c3-sorteggi.js, 60 partite CPU contro CPU (taglie 5, 7
       e 11, semi 20260803..20260822): 524.928 sorteggi spesi prima e
       524.928 dopo, e ZERO partite con un conto diverso;
     · strumenti/_eventi.js, 100 partite a seme 20260803: il file crudo
       — non le mediane, il vettore di eventi partita per partita — e'
       IDENTICO byte per byte fra prima e dopo.
   E il cancello delle tre taglie regge: _q-meta.js --tre-taglie
   --partite 100 da' 82 controlli su 82, con gli 0-0 a 6% (5v5), 7%
   (7v7) e 30% (11v11, tetto 33%).

   ---------------------------------------------------------------------
   COSA NON FA. Non tocca la geometria degli altri quattro dischi —
   misurato, stanno agli stessi pixel prima e dopo (TIRA 841,342 ·
   FILTRANTE 747,330 · PASSA 853,254 · CROSS 769,244 a 915x412) — non
   tocca la simulazione della CPU, e non aggiunge una clip nuova al rig:
   la posa dello scudo e' la FRENATA — peso indietro, passo largo a
   compasso, braccia fuori — tenuta attorno alla fase 0,12 con un
   dondolio lento, che e' il corpo che regge la spinta. Una clip nuova
   avrebbe portato con se' il provino cieco della sagoma e la gabbia
   delle proporzioni, e non e' il prezzo di questa toppa: sta scritto
   perche' chi legge sappia che quella posa e' un PRESTITO.

   I CANCELLI, sulla copia (29 agosto 2026):
     collaudo.js           36 su 36
     diritti.js            verde
     testo-fuori.js        verde
     _q-carattere.js        9 su 9
     _q-dischi.js           8 su 8 — uomini intaccati 0,275 (era 0,243
                            con quattro dischi; tetto 0,38), dischi
                            rimessi 0 px, sorteggi spesi 0
     _q-l16.js              6 su 6 (il cancello e' stato aperto al
                            quinto disco: vedi il commento laggiu')
     _q-meta.js --tre-taglie 82 su 82
   E i tre giochi-bugiardi che li fanno diventare rossi stanno in
   strumenti/_c3-bugiardi.js.

   uso:  node strumenti/_t-scatto-scudo.js --out fuori/cmd-terza.html
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

/* 1 — le due costanti nuove, accanto a quelle che governano il pallone
       al piede: e' la stessa famiglia di numeri */
{
  nome: '1/16 CARRY_SCUDO e SCUDO_ANDATURA accanto a CARRY_SPINTA',
  cerca: `const CARRY_SPINTA = 18;           // u di bersaglio in piu' a CARRY_V1`,
  metti:
`const CARRY_SPINTA = 18;           // u di bersaglio in piu' a CARRY_V1
/* =====================================================================
   LO SCUDO — il corpo fra il pallone e l'avversario (29 agosto 2026).

   CARRY_SCUDO e' la distanza del pallone dal centro dell'uomo mentre
   protegge, e va letta insieme a CARRY_DIST (16 davanti ai piedi) e a
   CARRY_SPINTA (fino a +18 in corsa): protetto, il pallone sta a 11
   unita' DIETRO — cioe' dalla parte opposta dell'avversario, perche' il
   corpo si e' girato. Undici e non zero perche' il pallone deve restare
   calciabile (KICK_R = 26) e deve VEDERSI staccato dal corpo.

   SCUDO_ANDATURA e' la soglia che divide in due la TENUTA del quinto
   disco, e non e' in pixel di levetta: e' l'ampiezza del comando di
   movimento che humanMove restituisce (0 fermo, 1 corsa piena). Sopra,
   la spinta va nelle gambe ed e' lo SCATTO; sotto, va nel corpo ed e'
   lo SCUDO. 0,45 cade su una levetta di 27 px — meta' della corsa piena
   (STICK_FULL = 46) — cioe' esattamente al confine fra «cammino» e
   «vado».
   ===================================================================== */
const CARRY_SCUDO = 11;            // u: il pallone protetto, dietro il corpo
const SCUDO_ANDATURA = 0.45;       // ampiezza del comando sotto cui la tenuta e' scudo
/* =====================================================================
   PERCHE' LO SCUDO COSTA FIATO, e il numero viene da due varianti
   bocciate — che si rifabbricano, non si raccontano.

   Il muro non nasce dal pallone a undici unita': nasce dal CORPO. La
   separazione morbida fra giocatori tiene due uomini a 2*P_R = 26
   unita', il furto col corpo chiede l'avversario entro P_R+B_R+1 = 22
   dal PALLONE, e con il pallone dalla parte opposta quei 22 non si
   raggiungono mai. Nemmeno la scivolata passa: la CPU non entra «da
   dietro» (DIETRO_DOT) e su chi ti da' le spalle qualunque contrasto E'
   da dietro. Giusto come regola di calcio, sbagliato come gioco: senza
   un limite, chi tiene il dito tiene il pallone per novanta secondi.

   MISURATO, banco strumenti/_p-scudo.js, 480 duelli per braccio (10
   semi x 3 distanze x 8 angoli x 2 impegni), OTTO secondi l'uno, 29
   agosto 2026 — le due varianti si rifanno con
   «node strumenti/_c3-bugiardi.js»:

                                  pallone perso   fiato finale
     nessuno scudo (braccio libero)   100,0%          98,0
     variante SENZA COSTO               5,0%         100,0
     variante A UNA DOMANDA SOLA        5,0%          10,6
     QUESTA                            43,3%          15,1

   La prima variante e' il muro: reggere non costa niente e non finisce
   mai. La seconda e' piu' sottile ed e' la ragione per cui le domande
   sono DUE (scudoChiesto e scudoAttivo): consumando il fiato solo
   mentre si PROTEGGE, sotto la soglia lo scudo si spegne, il ramo del
   recupero rimette il fiato sopra la soglia nel fotogramma dopo e lo
   scudo si riaccende — un tremolio che protegge quasi quanto uno scudo
   pieno, e si riconosce dal fiato finale incollato alla guardia (10,6
   contro i 15,1 di qui).

   Il limite non e' una probabilita' nuova (sarebbe un dado in piu' e la
   casa ne conta il numero): e' il FIATO, che nel gioco c'e' gia' ed e'
   la stessa risorsa dello scatto. Venti al secondo contro i ventisei
   dello scatto — reggere un uomo costa meno che correre, ma costa — e
   la stessa guardia a 6. Da fiato pieno sono cinque secondi scarsi di
   tenuta: e' un baratto — il pallone in cambio del tempo e dell'aria —
   non un rifugio.

   RETTIFICA DEL 29 AGOSTO 2026, e la frase che c'era prima era falsa.
   Qui stava scritto «chi protegge NON AVANZA DI UN'UNITA'». Non e' vero:
   SCUDO_ANDATURA vale 0,45, cioe' la levetta e' ammessa fino al 45% di
   P_SPEED (168 unita' al secondo) — chi protegge CAMMINA, e cammina
   apposta, perche' uno scudo che inchioda sul posto non serve a portare
   il pallone via dalla pressione.
   E il banco che avrebbe dovuto accorgersene non poteva: strumenti/
   _p-scudo.js scrive S.dx = 0 e S.dy = 0 in TUTTI E DUE i bracci, cioe'
   non prova mai la levetta viva — l'unico modo in cui quel disco verra'
   davvero tenuto. Il difetto e' stato trovato da un critico avversario
   con 1440 duelli a levetta accesa (10 semi x 3 distanze x 8 angoli x 2
   impegni x 3 bracci).
   DA FARE, ed e' aperto: _p-scudo.js deve provare anche col dito che
   spinge. Finche' non lo fa, i suoi numeri valgono per uno scudo fermo,
   che non e' quello che si usa.
   ===================================================================== */
const SCUDO_FIATO = 20;            // fiato al secondo speso a reggere un uomo`,
},

/* 2 — lo scatto esce dalla levetta ed entra nel disco */
{
  nome: '2/16 humanSprint legge il disco, non la levetta',
  cerca:
`/* SPRINT umano: tasto dedicato da tastiera, oppure — su touch — spingendo
   la levetta oltre la corsa piena. Nessun bottone in piu' da imparare. */
const STICK_SPRINT = 66;
function humanSprint(t){
  if(Keys[KMAP[t].sprint]) return true;
  const st=Touch5.stick[t];
  if(st && st.active && len(st.dx,st.dy)>STICK_SPRINT) return true;
  return false;
}`,
  metti:
`/* =====================================================================
   LO SFORZO SI CHIEDE — e fino al 29 agosto 2026 non si poteva chiedere.

   Qui c'era una costante di sessantasei pixel — si chiamava
   STICK_SPRINT, e non c'e' piu' in nessuna riga di questo file — e un
   humanSprint che rispondeva «si'» quando il vettore della levetta la
   superava, con sopra scritto «Nessun bottone in piu' da imparare». Il
   bottone in meno costava questo: Touch5.move ricentra l'origine a
   MAXR = 70, quindi il vettore letto vale ESATTAMENTE 70 appena il dito
   si allontana; fra 66 e 70 ci sono quattro pixel e chi corre ci sta
   dentro sempre. MISURATO col dito vero il 29 agosto 2026
   (strumenti/_p-scatto.js, 3 semi x 7 gesti, 1821 fotogrammi con la
   levetta viva, 915x412, 11 contro 11, fotogrammi in mano al banco
   perche' due corse diano lo stesso numero): mediana della levetta 70,0
   su un massimo di 70,0; scatto acceso nel 65,8% dei fotogrammi, e per
   gesto e' un interruttore di DISTANZA — 95% sulla corsa lunga, 95%
   sulla diagonale, 95% sul cambio di direzione, 91% sull'affondo, e
   ZERO sulla mezza corsa (levetta a 51,5 px: e' una corsa, e non
   scattava mai), zero sulla correzione corta, zero sul passettino.
   Nessuno di quei 1199 scatti l'aveva chiesto qualcuno, e il fiato
   scendeva a 5,6 su 100.
   Col disco, sullo stesso copione: 0,0% senza il dito, 70,8% col dito,
   e la mezza corsa passa da 0% a 67%.

   Adesso lo sforzo ha un tasto — il quinto disco, che si TIENE — e la
   levetta decide dove va: sopra SCUDO_ANDATURA nelle gambe (SCATTO),
   sotto nel corpo (SCUDO). Su tastiera resta Shift, con la stessa
   regola: Shift piu' una direzione e' scatto, Shift da fermo col
   pallone e' scudo — cosi' la tastiera guadagna un verbo invece di
   perderne uno.

   STICK_SPRINT non c'e' piu': una costante che non decide piu' niente
   e' una costante morta, e di quelle in questo file ne sono gia' state
   trovate due (PULSE_T, FLICK_WIN0/1) avanzate da gesti tolti.
   ===================================================================== */
function vuoleSforzo(t){
  return !!Keys[KMAP[t].sprint] || Touch5.scatta(t);
}
function humanSprint(t){
  if(!vuoleSforzo(t)) return false;
  const m=humanMove(t);
  return len(m[0],m[1])>SCUDO_ANDATURA;
}
/* «SE TENGO ADESSO, PROTEGGO?» — la quinta capacita', sorella delle
   quattro di sopra e scritta con la loro stessa forma: guarda l'uomo
   comandato, non lo stato di un dito. E' la domanda che sceglie
   l'ETICHETTA del quinto disco, quindi non puo' dipendere dal fatto che
   il disco sia gia' premuto: dice cosa otterrebbe il dito. */
function puoScudo(t){
  const p=ctrlPlayer(t);
  if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  if(!G.ball || G.ball.owner!==G.ctrl[t]) return false;
  const m=humanMove(t);
  return len(m[0],m[1])<=SCUDO_ANDATURA;
}
/* LO SCUDO E' UNA DOMANDA, NON UNA BANDIERA — la stessa scelta di
   Touch5.contiene, e per la stessa ragione: uno stato acceso a mano
   sopravvive a un touchcancel dimenticato e lascerebbe un uomo girato
   di spalle per sempre. Lo chiamano in tre posti (la rotazione del
   corpo, il pallone al piede, la posa) e tutti e tre ottengono la
   stessa risposta nello stesso fotogramma.

   PERCHE' LE DOMANDE SONO DUE — CHIESTO e ATTIVO — e non e' un
   ornamento: e' la correzione di un difetto misurato. Con una domanda
   sola il fiato si consuma soltanto mentre si PROTEGGE: scende sotto 6,
   lo scudo si spegne, il ramo del RECUPERO lo rimette sopra 6 nel
   fotogramma dopo e lo scudo si riaccende. E' un TREMOLIO, e protegge
   quasi quanto uno scudo pieno: 480 duelli da otto secondi danno 5,0%
   di palloni persi contro il 43,3% di qui, col fiato finale incollato
   alla guardia (10,6 contro 15,1). La variante si rifabbrica e si
   rimisura — «node strumenti/_c3-bugiardi.js --bugia tremolio» — non e'
   un ricordo.
   Adesso il fiato si consuma su CHIESTO — cioe' finche' il dito tiene,
   anche a serbatoio vuoto: chi tiene sta faticando, e non recupera
   tenendo — e la protezione vive su ATTIVO. Sotto 6 la tenuta non
   protegge piu' e non torna: bisogna mollare. */
function scudoChiesto(p){
  const t=p.team;
  if(G.cpu[t] || G.ctrl[t]<0 || G.players[G.ctrl[t]]!==p) return false;
  if(!G.ball || G.ball.owner!==G.ctrl[t]) return false;
  if(p.slide>=0 || p.recover>0 || p.rove>=0 || p.charge>=0) return false;
  if(!vuoleSforzo(t)) return false;
  const m=humanMove(t);
  return len(m[0],m[1])<=SCUDO_ANDATURA;
}
function scudoAttivo(p){ return p.fiato>6 && scudoChiesto(p); }
/* l'avversario piu' vicino IN CAMPO: serve allo scudo per sapere da che
   parte mettere le spalle. Null se non c'e' nessuno da cui proteggersi
   entro SCUDO_VISTA: senza un avversario vicino lo scudo non gira
   niente, e l'uomo resta girato dove guardava. */
const SCUDO_VISTA = 140;           // u: oltre, non c'e' nessuno da cui coprirsi
function avversarioVicino(p){
  let m=null, dm=SCUDO_VISTA;
  for(const q of G.players){
    if(q.team===p.team || q.out>0 || q.role==='gk') continue;
    const d=len(q.x-p.x,q.y-p.y);
    if(d<dm){ dm=d; m=q; }
  }
  return m;
}`,
},

/* 3 — la tenuta del quinto disco si legge dagli atti vivi */
{
  nome: '3/16 Touch5.scatta accanto a Touch5.contiene',
  cerca:
`  contiene(t){
    for(const id in this.atti){
      const a=this.atti[id];
      if(a.t===t && a.act==='slide' && !a.morto && this.btnTouch[id]) return true;
    }
    return false;
  },`,
  metti:
`  contiene(t){
    for(const id in this.atti){
      const a=this.atti[id];
      if(a.t===t && a.act==='slide' && !a.morto && this.btnTouch[id]) return true;
    }
    return false;
  },

  /* L3 — «C'E' UN DITO, DI QUESTA SQUADRA, CHE TIENE IL QUINTO DISCO?»
     Gemella esatta di contiene() qui sopra, atto diverso. Il quinto
     disco non FA niente alla pressione e niente al rilascio: il verbo e'
     la tenuta, e la tenuta si legge dagli atti vivi. Chi la chiede:
     humanSprint (le gambe) e scudoAttivo (il corpo). */
  scatta(t){
    for(const id in this.atti){
      const a=this.atti[id];
      if(a.t===t && a.act==='sprint' && !a.morto && this.btnTouch[id]) return true;
    }
    return false;
  },`,
},

/* 4 — la quinta domanda accanto alle altre due */
{
  nome: '4/16 touchBtnLayout si fa anche la domanda dello scudo',
  cerca: `  const tira = puoTirare(t), passa = puoPassare(t);`,
  metti: `  const tira = puoTirare(t), passa = puoPassare(t), scudo = puoScudo(t);`,
},

/* 5 — il quinto disco */
{
  /* RI-ANCORATO IL 29 AGOSTO 2026: la toppa della pagina dei comandi
     (_t-pollice-pagina.js) inserisce un commento subito dopo la chiusura
     dell'elenco, quindi il vecchio ancoraggio — che comprendeva anche
     «], s);» — non si trovava piu'. Le due righe del quinto disco sono
     l'ancora stabile: descrivono i dischi, non quello che gli sta
     intorno. Ancorare a cio' che si sta cambiando, non a cio' che ci
     confina. */
  nome: '5/16 il quinto disco: SCATTO / SCUDO',
  cerca:
`    passa ? { act:'cross',   label:'CROSS',     x:bx+s*136, y:VH-158, r:26 }
          : { act:'tackle',  label:'SCIVOLATA', x:bx+s*136, y:VH-158, r:26 },`,
  metti:
`    passa ? { act:'cross',   label:'CROSS',     x:bx+s*136, y:VH-158, r:26 }
          : { act:'tackle',  label:'SCIVOLATA', x:bx+s*136, y:VH-158, r:26 },
    /* L3 — IL QUINTO DISCO, E PERCHE' LA SUA FACCIA NON LA DECIDE IL
       POSSESSO. Gli altri quattro chiedono «di chi e' il pallone»,
       questo chiede «dove sta andando la spinta»: e' un modificatore
       TENUTO, e la tenuta ha due esiti a seconda della levetta —
       andatura oltre SCUDO_ANDATURA vuol dire gambe (SCATTO), sotto
       vuol dire corpo (SCUDO, e solo col pallone al piede). Un'etichetta
       sola avrebbe mentito in meta' dei fotogrammi.
       L'ATTO E' LO STESSO NELLE DUE FACCE, ed e' voluto: e' un tasto
       solo, e Touch5.scatta lo cerca per atto. Chi legge l'elenco per
       INDICE non si accorge di niente — il contratto dell'ordine (0 il
       grande, 1 il piccolo, 2 e 3 quelli di L1.6) e' intatto, il quinto
       sta in coda.
       DOVE STA, E DUE POSTI BOCCIATI PRIMA DI QUESTO — tutti misurati
       il 29 agosto 2026.

       Sta nella FILA DI MEZZO, a sinistra di CROSS: margine di presa
       12,6 px contro CROSS a 915x412 (84,6 di distanza, 72 di prese
       sommate), cioe' esattamente l'aria che PASSA e CROSS hanno gia'
       fra loro, e quattro volte i 2,8 px della coppia piu' stretta del
       gioco (TIRA-PASSA).

       BOCCIATO 1 — in basso a sinistra del grappolo (bx-252, VH-56),
       dove il pollice arriva prima e dove i margini erano perfino piu'
       larghi (19,4 px). L'ha ucciso _q-dischi con un numero: 5187 pixel
       su 33 prove in cui il fotogramma vero e i dischi rimessi sopra non
       coincidevano, tutti nello stesso riquadro (x 556-610, y 342-366 a
       845x402). Non era un difetto del righello: e' il NASTRO
       DELL'EVENTO — PALO!, RUBATA PULITA!, FALLO! — che vive a y =
       VH-58, largo min(VW*0,62, 420) e centrato, e cadeva ESATTAMENTE
       sopra il disco. Un comando coperto da una didascalia non e' un
       comando.

       BOCCIATO 2 — in cima alla colonna di destra (bx-64, VH-232),
       sopra PASSA. Tutti i cancelli verdi a 845x402 e a 915x412, ma sul
       telefono vero (OnePlus 6, Chrome con la barra dell'indirizzo, che
       lascia al gioco 782x299 CSS) il disco saliva a y 57, con la
       pastiglia che comincia a 31 px dal filo alto, e finiva addosso
       alla freccia «PORTA» del bordo destro. E' la stessa aritmetica di
       sempre, letta dalla parte dell'altezza: quella riga tiene la cima
       del riquadro dichiarato a VH-272 (VH-232, meno i 10 px con cui
       dentroGliInserti alza il grappolo, meno i 30 del riquadro), cioe'
       resta sotto la fascia del tabellone — alta 45 px a 915x412, 41
       misurati sul telefono — solo da VH 317 in su. Questa la tiene a
       VH-188 e regge da VH 233. Sul telefono, in cifre: la posizione
       bocciata metteva la cima a 27 px dal filo alto, cioe' DENTRO la
       fascia; questa la mette a 111, settanta px sotto la fascia.

       E IL NASTRO NON ARRIVA NEMMENO QUI, e non per fortuna: il nastro
       occupa la fascia VH-58..VH-16 e il bordo basso di questo disco sta
       a VH-118. Sessanta pixel di distanza, a QUALUNQUE altezza di
       schermo, perche' i due numeri scalano insieme. */
    scudo ? { act:'sprint',  label:'SCUDO',     x:bx+s*220, y:VH-148, r:26 }
          : { act:'sprint',  label:'SCATTO',    x:bx+s*220, y:VH-148, r:26 },`,
  /* La coda «], s);» NON sta qui, e la ragione e' che l'ancoraggio non la
     comprende piu': la toppa della pagina dei comandi inserisce un
     commento fra l'ultimo disco e la chiusura dell'elenco. Lasciandola
     nel testo sostitutivo veniva AGGIUNTA invece che rimessa, e il file
     usciva con due chiusure — «missing ) after argument list», gioco
     morto all'apertura, __test mai nato. Regola: cio' che non e' nel
     `+`cerca`+` non puo' stare nel `+`metti`+`. */
},

/* 6 — la pressione non fa niente: il verbo e' la tenuta */
{
  nome: '6/16 Touch5.start: il quinto disco vive sulla tenuta',
  cerca:
`        else if(bt.act==='press') comandaPressa(t);
        else if(bt.act==='tackle') doSlide(t);`,
  metti:
`        else if(bt.act==='press') comandaPressa(t);
        else if(bt.act==='tackle') doSlide(t);
        /* L3 — IL QUINTO DISCO NON FA NIENTE QUI, ED E' IL PUNTO: il
           suo verbo e' la TENUTA, che Touch5.scatta legge dagli atti
           vivi (come contiene() legge il contenimento). Niente alla
           pressione e niente al rilascio vuol dire anche che nessun
           touchcancel puo' produrre uno scatto che il dito non ha
           chiesto: quando l'atto smette di esistere, lo scatto si
           spegne da solo. */
        else if(bt.act==='sprint'){ /* la tenuta E' il verbo */ }`,
},

/* 6bis — lo scudo si chiede UNA volta per fotogramma, accanto al
          contenimento: e' la stessa specie di domanda, e la risposta
          serve a tre righe di questa funzione (il corpo che gira, il
          fiato che si consuma, e — via updateBall — il pallone) */
{
  nome: '7/16 la domanda dello scudo accanto a quella del contenimento',
  cerca: `  const contieni = isHuman && Touch5.contiene(p.team);`,
  metti:
`  const contieni = isHuman && Touch5.contiene(p.team);
  /* L3 — LO SCUDO SI CHIEDE QUI, UNA VOLTA. scudoAttivo e' una funzione
     pura di stato (nessuna bandiera da azzerare), ma chiamarla tre volte
     nella stessa funzione vorrebbe dire tre humanMove: la risposta si
     prende una volta e si passa a chi la usa. La guardia isHuman davanti
     e' la stessa di contieni, e chiude il corto circuito prima di
     qualunque lettura. */
  const scudaC = isHuman && scudoChiesto(p);
  const scuda = scudaC && p.fiato>6;`,
},

/* 7 — il corpo gira le spalle */
{
  nome: '8/16 chi protegge gira le spalle all\'avversario',
  cerca: `    if(portato){ const dx=portato.x-p.x, dy=portato.y-p.y, dl=len(dx,dy); if(dl>1){ tfx=dx/dl; tfy=dy/dl; } }`,
  metti:
`    /* L3 — CHI PROTEGGE GIRA LE SPALLE, ed e' l'unica cosa che lo scudo
       fa al corpo: il pallone lo segue da solo, perche' updateBall lo
       mette a CARRY_SCUDO lungo p.fx/p.fy — cioe' dalla parte opposta.
       Passa dallo stesso inseguimento d'angolo di 0,07 s di tutti gli
       altri, quindi la figura GIRA e non scatta: e' la rotazione che si
       vede, e insieme al pallone che scivola dietro il corpo e' cio' che
       rende lo scudo un'azione e non uno stato. Se non c'e' nessun
       avversario entro SCUDO_VISTA non c'e' niente da cui coprirsi, e
       questo ramo non trova niente: il corpo torna a guardare dove va,
       senza un ramo in piu' (stessa forma del contenimento qui sotto). */
    if(scuda){
      const av=avversarioVicino(p);
      if(av){ const dx=p.x-av.x, dy=p.y-av.y, dl=len(dx,dy); if(dl>1){ tfx=dx/dl; tfy=dy/dl; } }
    }
    if(!tfx && !tfy && portato){ const dx=portato.x-p.x, dy=portato.y-p.y, dl=len(dx,dy); if(dl>1){ tfx=dx/dl; tfy=dy/dl; } }`,
},

/* 8 — il pallone si mette dietro il corpo */
{
  nome: '9/16 updateBall: il pallone protetto sta dietro',
  cerca:
`      const vP=len(o.vx,o.vy);
      const slancio=clamp((vP-CARRY_V0)/(CARRY_V1-CARRY_V0),0,1);
      const avanti=CARRY_DIST+CARRY_SPINTA*slancio*slancio;`,
  metti:
`      const vP=len(o.vx,o.vy);
      const slancio=clamp((vP-CARRY_V0)/(CARRY_V1-CARRY_V0),0,1);
      /* L3 — LO SCUDO NON HA UNA REGOLA SUA SUL FURTO, E NON GLI SERVE.
         Chi protegge si e' girato (vedi la rotazione in
         updatePlayerFisica), quindi mettere il pallone a CARRY_SCUDO
         lungo il suo p.fx/p.fy lo mette DIETRO il corpo, dalla parte
         opposta dell'avversario. Da li' in poi lavorano due righe che
         esistevano gia': il furto col corpo chiede l'avversario entro
         P_R+B_R+1 dal PALLONE — e adesso in mezzo c'e' un uomo — e lo
         sconto «di spalle si ruba molto meno» (stealP*0,55) si accende
         da solo, perche' schiena contro petto e' proprio il prodotto
         scalare che quella riga cerca. Nessun dado() nuovo. */
      const avanti=scudoAttivo(o) ? CARRY_SCUDO
                 : CARRY_DIST+CARRY_SPINTA*slancio*slancio;`,
},

/* 9 — la posa */
{
  nome: '10/16 rigStato: la posa di chi protegge',
  cerca: `  /* ---- finta e frenata: latch cosmetici (vedi aggiornaPosa) ---- */`,
  metti:
`  /* ---- LO SCUDO: la FRENATA tenuta, con un dondolio lento ----
     Non e' una clip nuova, ed e' una scelta dichiarata: poseFrenata alla
     fase 0,12 e' gia' il corpo che si pianta — peso indietro (lean
     -0,38), passo largo a compasso, braccia basse e FUORI — cioe'
     esattamente la postura di chi regge una spinta. Una clip nuova
     avrebbe portato con se' il provino cieco della sagoma e la gabbia
     delle proporzioni, e non e' il prezzo di questa toppa: sta scritto
     qui perche' chi legge sappia che e' un prestito, non una posa
     disegnata per lo scudo.
     Il dondolio (+-0,04 di fase, un giro ogni 2,9 secondi) serve a due
     cose: si vede che il corpo lavora, e due uomini non cadono mai sulla
     stessa fase perche' l'indice li sfasa. ---- */
  if(scudoAttivo(p)){ st.clip='frenata'; st.u=0.12+0.04*Math.sin(G.pulse*2.2+p.idx); return st; }
  /* ---- finta e frenata: latch cosmetici (vedi aggiornaPosa) ---- */`,
},

/* 10 — l'arco dello scatto attorno alla levetta */
{
  nome: '11/16 la levetta accende l\'arco quando si scatta',
  cerca:
`    /* la dead-zone: una riga di gesso incisa, non un filo bianco */
    ctx.strokeStyle='rgba(242,245,239,.20)'; ctx.lineWidth=1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(s.ox,s.oy,STICK_DEAD,0,6.2832); ctx.stroke();
    ctx.setLineDash([]);`,
  metti:
`    /* la dead-zone: una riga di gesso incisa, non un filo bianco */
    ctx.strokeStyle='rgba(242,245,239,.20)'; ctx.lineWidth=1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(s.ox,s.oy,STICK_DEAD,0,6.2832); ctx.stroke();
    ctx.setLineDash([]);
    /* L3 — L'ANELLO DELLO SCATTO. Adesso che lo scatto si CHIEDE, deve
       anche VEDERSI: quando il dito tiene il quinto disco e la levetta
       chiede andatura, la pista si accende d'ambra dall'interno. Sta a
       STICK_FULL-3 con un filo da 3, cioe' TUTTO DENTRO il raggio che
       TOUCH_ZONE dichiara qui sopra: un pixel d'interfaccia dipinto
       fuori dal rettangolo dichiarato e' una dichiarazione che mente, e
       questa casa quel difetto l'ha gia' pagato tre volte. */
    if(!G.cpu[t] && humanSprint(t)){
      ctx.strokeStyle='rgba(240,176,74,.90)'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(s.ox,s.oy,STICK_FULL-3,0,6.2832); ctx.stroke();
    }`,
},

/* 11 — la lavagna del mister dice la verita' */
{
  nome: '12/16 COME SI GIOCA: lo scatto ha un tasto, e adesso ha lo scudo accanto',
  cerca: `            <b class="gn">Scatto</b><span class="gt">levetta oltre il bordo<span class="soloKb"> &middot; <kbd>Shift</kbd></span> &mdash; +34%, ma il fiato finisce</span></div>`,
  metti: `            <b class="gn">Scatto</b><span class="gt">tieni il disco <b>SCATTO</b> e spingi la levetta<span class="soloKb"> &middot; <kbd>Shift</kbd> con una direzione</span> &mdash; +34%, ma il fiato finisce</span></div>
          <div class="ges"><svg class="gsvg" viewBox="0 0 120 64" aria-hidden="true"><circle class="avv" cx="86" cy="32" r="8"/><path d="M50 20l12 24m0-24L50 44"/><circle class="palla" cx="34" cy="32" r="3.6"/><path class="lieve" d="M62 18l8 4-8 4m0 12l8 4-8 4"/></svg>
            <b class="gn">Scudo</b><span class="gt">tieni <b>SCUDO</b> col pallone al piede e la levetta ferma<span class="soloKb"> &middot; <kbd>Shift</kbd> senza direzione</span> &mdash; giri le spalle e il pallone ti va dietro: per rubarlo devono passare dal tuo corpo</span></div>`,
},

/* 8bis — reggere un uomo costa aria: e' il solo limite dello scudo */
{
  nome: '13/16 lo scudo consuma fiato, e sotto 6 si spegne da solo',
  cerca:
`  if(p.sprint) p.fiato=Math.max(0,p.fiato-26*(1+COND_MORSO*0.5*(1-q))*dt);
  else p.fiato=Math.min(100,p.fiato + (vp<60?18:11)*(1-COND_MORSO*0.55*(1-q))*dt);`,
  metti:
`  if(p.sprint) p.fiato=Math.max(0,p.fiato-26*(1+COND_MORSO*0.5*(1-q))*dt);
  /* L3 — REGGERE UN UOMO COSTA ARIA, e questo e' l'UNICO limite dello
     scudo: senza, e' un muro (0 palloni persi su 96 duelli, misura del
     29 agosto 2026 in _p-scudo.js — vedi il conto sopra SCUDO_FIATO).
     Non e' un dado nuovo, e' la risorsa che lo scatto usa gia': venti al
     secondo contro ventisei, con lo stesso morso della condizione. La
     guardia a 6 sta dentro scudoAttivo, come per lo scatto: sotto quella
     soglia questo ramo non gira piu' e il fiato riprende a salire dal
     ramo di sotto, senza nessun caso speciale.
     NON PRENDE ACCIACCHI: la riga della gamba che cede sopra guarda
     p.sprint e solo quello. Chi protegge si stanca, non si rompe. */
  else if(scudaC) p.fiato=Math.max(0,p.fiato-SCUDO_FIATO*(1+COND_MORSO*0.5*(1-q))*dt);
  else p.fiato=Math.min(100,p.fiato + (vp<60?18:11)*(1-COND_MORSO*0.55*(1-q))*dt);`,
},

/* 12 — i commenti dicono la verita' sui numeri: i dischi sono cinque */
{
  nome: '14/16 il contratto dell\'ordine parla di cinque dischi',
  cerca: `  /* L1.6 — QUATTRO DISCHI, E L'ORDINE E' UN CONTRATTO: 0 il grande,`,
  metti: `  /* L1.6 — CINQUE DISCHI (quattro fino al 29 agosto 2026), E L'ORDINE
     E' UN CONTRATTO: 0 il grande,`,
},

/* 13 — e anche il cappello di chi li dipinge */
{
  nome: '15/16 drawTouchButtons: cinque dischi, non quattro',
  cerca: `/* i QUATTRO dischi contestuali dello schema unico (L1.6): TIRA/CONTRASTA`,
  metti: `/* i CINQUE dischi contestuali dello schema unico (quattro di L1.6 piu'
   SCATTO/SCUDO dal 29 agosto 2026): TIRA/CONTRASTA`,
},

/* 14 — la lavagna del mister conta i dischi, e li contava quattro */
{
  nome: '16/16 la lavagna del mister conta cinque dischi',
  cerca: `<b>Stick a sinistra; a destra quattro dischi che cambiano col possesso: TIRA/CONTRASTA, FILTRANTE/CAMBIO, PASSA/PRESSA e CROSS/SCIVOLATA</b>`,
  metti: `<b>Stick a sinistra; a destra cinque dischi: TIRA/CONTRASTA, FILTRANTE/CAMBIO, PASSA/PRESSA, CROSS/SCIVOLATA e SCATTO/SCUDO, che si TIENE</b>`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-scatto-scudo.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) { console.error('FALLITO: --dentro non e\' ammesso da questa toppa: si prova su copia.'); process.exit(2); }
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.scatto.html';
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

/* I CONTROLLI DOPO LA SOSTITUZIONE. Non «e' andata bene»: si conta. */
const attesi = [
  ['const STICK_SPRINT', 0],            // la costante morta se n'e' andata
  ['function vuoleSforzo(t){', 1],
  ['function humanSprint(t){', 1],
  ['function puoScudo(t){', 1],
  ['function scudoChiesto(p){', 1],
  ['function scudoAttivo(p){ return p.fiato>6 && scudoChiesto(p); }', 1],
  ['function avversarioVicino(p){', 1],
  ['const CARRY_SCUDO = 11;', 1],
  ['const SCUDO_ANDATURA = 0.45;', 1],
  ['const SCUDO_FIATO = 20;', 1],
  ['const scudaC = isHuman && scudoChiesto(p);', 1],
  ['const scuda = scudaC && p.fiato>6;', 1],
  ['else if(scudaC) p.fiato', 1],
  ['  scatta(t){', 1],
  ["act:'sprint'", 2],                  // le due facce del quinto disco
  ["label:'SCATTO'", 1],
  ["label:'SCUDO'", 1],
  ['scudo = puoScudo(t)', 1],
  ['scudoAttivo(o) ? CARRY_SCUDO', 1],
  ["st.clip='frenata'; st.u=0.12", 1],
  ['humanSprint(t)){', 1],              // l'arco della levetta
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

/* IL CONTO DEI DISCHI, letto come lo legge il cancello _q-dischi:
   dieci letterali in touchBtnLayout, cioe' cinque dischi a due facce. */
{
  const i = out.indexOf('function touchBtnLayout(t){');
  const j = out.indexOf('\n}\n', i);
  const layout = out.slice(i, j);
  const re = /\{\s*act:'([a-z]+)',\s*label:'([^']+)',\s*x:[^,]+,\s*y:[^,]+,\s*r:\s*(\d+)\s*\}/g;
  const trovati = [...layout.matchAll(re)];
  if (trovati.length !== 10) {
    console.error('FALLITO: da touchBtnLayout si leggono ' + trovati.length + ' facce, ne servono 10 (cinque dischi).');
    process.exit(1);
  }
  /* C7 in anticipo: nessuna coppia di dischi DIVERSI condivide le prime
     quattro lettere, ne' e' prefisso dell'altra */
  const simili = [];
  for (let a = 0; a < trovati.length; a++) for (let b = a + 1; b < trovati.length; b++) {
    if ((a >> 1) === (b >> 1)) continue;
    const x = trovati[a][2], y = trovati[b][2];
    if (x.startsWith(y) || y.startsWith(x) || x.slice(0, 4) === y.slice(0, 4)) simili.push(x + '/' + y);
  }
  if (simili.length) { console.error('FALLITO: etichette confondibili: ' + simili.join(' · ')); process.exit(1); }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati, 10 facce di disco lette da touchBtnLayout');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
