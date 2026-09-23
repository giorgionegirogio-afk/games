/* =====================================================================
   _toppa-144-atto.js — IL COMANDO SMETTE DI ESSERE UN PIXEL
   (voce #144, compito 2)

   Spacca `Touch5.start` in RISOLVI + APPLICA, aggiunge al nastro due
   tipi di riga (il 12, l'atto risolto; il 13, lo scostamento), e insegna
   al riproduttore a ricostruire il punto nel frame di CHI RILEGGE invece
   di rimettere dov'era il pixel di chi ha registrato.

   NON TOCCA LA SIMULAZIONE. Zero sorteggi nuovi, zero rami nuovi nella
   fisica: `risolvi` e' pura e `applica` e' il corpo di prima riga per
   riga. E i tipi 0 e 1 restano LEGGIBILI, cosi' un nastro di prima si
   rigioca esattamente come si rigiocava.

   ------------------------------------------------------------------
   IL DIFETTO, MISURATO
   ------------------------------------------------------------------
   Il nastro porta i tocchi in coordinate di SCHERMO. Dove finisce un
   pixel lo decidono tre cose che nel nastro non ci sono:

     · la FINESTRA   touchBtnLayout parte da `bx = right ? VW : 0`
     · il POLLICE    pollice(): scala 85-150%, spazio 100-140%, mancino
     · la TACCA      insertiSicuri(): env(safe-area-inset-*)

   MISURATO (strumenti/_q-schermi.js, 23 settembre 2026, una sfida vera
   registrata a 915x412 e dichiarata 2-3):

     800x360    rigioca 0-5     INCOMPLETO / schermo-diverso
     844x390    rigioca 0-5     INCOMPLETO / schermo-diverso
     915x412    rigioca 2-3     TORNA            <- il controllo
     1280x720   rigioca 0-1     INCOMPLETO / schermo-diverso
     POLLICE    rigioca 0-0     INCOMPLETO / duello-senza-righe
     TACCA      rigioca 0-2     **NON TORNA**

   Il primo canale il gioco lo conosce e si astiene (#133, #139). Gli
   altri due NO, e la riga della tacca e' la peggiore che questo
   programma abbia stampato da giorni: lo schermo e' IDENTICO — 915x412
   da tutte e due le parti — quindi il giudice non ha niente su cui
   astenersi, procede, e dice NON TORNA a un onesto che aveva soltanto
   un telefono con la tacca. NON TORNA e' l'unico verdetto che muove
   punti: li toglie a DUE persone, alza un sospetto che non decade mai e
   chiude la riga per sempre.

   ------------------------------------------------------------------
   LA CURA: TRASPORTARE LA RISPOSTA, NON LA DOMANDA
   ------------------------------------------------------------------
   Un comando non e' piu' un punto: e' un ATTO, cinque numeri.

     t       la SQUADRA, 0 o 1. Oggi teamOf(x) la deduce da innerWidth/2,
             e in un 1v1 su due telefoni non esiste una x condivisa.
     esito   0 disco preso · 1 erba · 2 cella spenta · 3 anello
     slot    quale disco, per INDICE (0 il grande, 1 il piccolo)
     ux, uy  il punto di posa in unita' della geometria dei comandi

   La normalizzazione NON e' inventata qui: e' quella che il gioco usa
   gia' per decidere — u_presa = d/(r+10) e u_escl = d/(r+18). Scritto in
   quelle unita', il punto e' invariante per costruzione: chi rilegge
   moltiplica per il PROPRIO raggio e ottiene un dito nello stesso punto
   relativo del proprio disco, su qualunque schermo, con qualunque
   pollice, con qualunque tacca.

   IL VERBO NON VIAGGIA. Si rilegge in locale da
   touchBtnLayout(t)[slot].act, perche' dipende dal POSSESSO, e il
   possesso e' simulazione: gia' identico ai due capi. Un campo che si
   puo' ricavare non si spedisce.

   I MOVIMENTI VIAGGIANO COME SCOSTAMENTI dal punto di posa di quel dito,
   in pixel assoluti — ed e' l'unica forma corretta, perche' TUTTE le
   soglie che leggono un trascinamento sono in pixel assoluti e non
   scalate (SOGLIA_LEVETTA 6, STICK_DEAD 12, STICK_FULL 46, MAXR 70,
   R_ARMA, R_ANNULLA 96). Quaranta pixel di trascinamento vogliono dire
   la stessa cosa su ogni telefono; quel che cambia e' il punto da cui
   partono, ed e' esattamente cio' che l'atto risolve.

   ------------------------------------------------------------------
   QUEL CHE QUESTA TOPPA NON FA
   ------------------------------------------------------------------
   · il DUELLO non si tocca: il tipo 6 porta gia' u,v in millesimi
     (duelMira arrotonda prima di scrivere) ed e' gia' un atto risolto;
   · il RITARDO del #141 non si tocca: la sua coda sta PIU' FUORI del
     registro e l'ordine dito -> coda -> registro -> Touch5 resta quello;
   · le tre ASTENSIONI dello schermo non si tolgono qui: e' il compito 4,
     e si condizionano alla presenza di un pixel nel nastro invece che
     cancellarle, se no i nastri vecchi diventerebbero giudicabili senza
     esserlo;
   · MOTORE_V non si muove qui: si MISURA nel compito 3 e si decide col
     numero in mano.

   uso:  node strumenti/_toppa-144-atto.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
const agg = (nome, cerca, sostituisci) => CAMBI.push({ nome, cerca, sostituisci });

agg('start si spacca in risolvi, avvia e applica', `  start(id,x,y){
    if(G.paused) return;
    const t=this.teamOf(x);
    /* i pulsanti vivono SEMPRE. Il contesto (possesso o no) si risolve
       QUI, al touchstart, e l'azione risolta resta in btnTouch[id]: il
       cambio di contesto a meta' pressione non cambia il gesto in corso. */
    if(!G.cpu[t] &&
       (G.scene==='play'||G.scene==='golden'||G.scene==='kickoff')){
      /* =================================================================
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
      /* LE DUE PASSATE SONO QUELLE DI PRIMA, NUMERO PER NUMERO. L'unica
         differenza e' che adesso il ciclo si ricorda anche QUALE dei due
         dischi ha vinto — il suo indice, non il suo verbo — perche' il
         ri-armo (vedi Touch5.passo) deve poter ritrovare lo stesso disco
         quando il contesto gli cambia il verbo sotto il dito. L'indice e'
         l'identita' stabile del disco: 0 e' il grande (TIRA/CONTRASTA),
         1 e' il piccolo (FILTRANTE/CAMBIO), e touchBtnLayout li mette
         sempre in quest'ordine. */
      let preso=null, slot=-1, uPresa=Infinity, uEscl=Infinity;
      const dischi=touchBtnLayout(t);
      for(let k=0;k<dischi.length;k++){
        const bt=dischi[k];
        const d=len(x-bt.x,y-bt.y);
        const up=d/(bt.r+10); if(up<uPresa){ uPresa=up; preso=bt; slot=k; }
        const ue=d/(bt.r+18); if(ue<uEscl){ uEscl=ue; }
      }
      /* LA CELLA SPENTA NON RISPONDE (voce #88, 2 settembre 2026): il
         dito si posa e non succede niente — nessun atto nasce, nessuna
         carica si apre, e il disco non viene nemmeno registrato come
         premuto. Non e' un rifiuto VISIBILE come quello di L3.1: quello
         resta, e serve al caso opposto — cella ACCESA e corpo che non
         ce la fa (a terra, in rialzo), dove il dito ha chiesto una cosa
         lecita e merita di sapere che il corpo ha detto no. Qui invece
         il disco dichiarava gia' di essere spento: chi lo preme ha gia'
         avuto la sua risposta guardandolo. */
      if(uPresa<=1 && preso && preso.off) return;
      if(uPresa<=1){
        const bt=preso;
`,
`  /* =====================================================================
     IL PIXEL MUORE QUI, E DIVENTA UN ATTO (voce #144).

     start() faceva due mestieri in un corpo solo: RISOLVERE (di che
     squadra e' questo dito? ha preso un disco? quale? o e' erba? o e'
     morto nell'anello?) e APPLICARE (nasce l'atto, parte la carica, si
     apre la posa). I due mestieri adesso sono due funzioni, e non e'
     eleganza: e' la sola cosa che permette al nastro — e domani al filo
     del 1v1 — di portare la RISPOSTA invece della DOMANDA.

     Perche' la domanda non si puo' portare: dove finisce un pixel lo
     decidono la finestra, il pollice e la tacca, e nessuno dei tre sta
     nel nastro. MISURATO (strumenti/_q-schermi.js): lo stesso nastro
     dichiarato 2-3 rigioca 0-5 a 800x360, 0-1 a 1280x720, 0-0 col
     pollice al massimo, 0-2 con la tacca — e sull'ultimo lo schermo e'
     IDENTICO, quindi il giudice non si asteneva: diceva NON TORNA.

     La risposta invece si porta, e sta in cinque numeri. Il verbo no:
     si rilegge in locale da touchBtnLayout(t)[slot].act, perche'
     dipende dal POSSESSO, e il possesso e' simulazione, cioe' gia'
     identico ai due capi. Quel che si puo' ricavare non si spedisce.
     ===================================================================== */
  start(id,x,y){
    if(G.paused) return;
    return this.avvia(id, this.risolvi(x, y), x, y);
  },

  /* =====================================================================
     LA RISOLUZIONE. Pura: legge il mondo e non ne tocca un campo. E'
     l'unica funzione dello strato d'ingresso che guarda ancora un pixel,
     e la sola che deve.

     LA NORMALIZZAZIONE E' QUELLA CHE IL GIOCO USA GIA' PER DECIDERE, e
     non una inventata qui. Le due passate scelgono il disco col minimo
     di d/(r+10) e uccidono il tocco col minimo di d/(r+18): se il punto
     di posa si scrive in QUELLE unita', la distanza normalizzata e'
     invariante per costruzione. Un dito che al registratore era dentro
     (u <= 1) e' dentro anche a chi rilegge — su qualunque schermo, con
     qualunque pollice, con qualunque tacca — perche' il denominatore e'
     la geometria LOCALE.

     Scriverlo in pixel e moltiplicarlo per il rapporto delle finestre
     sarebbe LA MEZZA CURA: chiuderebbe il canale della finestra e
     lascerebbe aperti gli altri due. E' il falso _crit-schermi-mezza, e
     il banco lo boccia sui due bracci gemelli.
     ===================================================================== */
  risolvi(x, y){
    const t=this.teamOf(x);
    const atto={ t:t, esito:1, slot:-1, ux:0, uy:0 };
    /* =================================================================
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
       cui i raggi o i centri cambiano.

       IL CICLO GIRA SEMPRE (voce #144), anche quando la squadra e' della
       macchina o la scena non e' di gioco, dove prima non girava
       affatto. Non ha effetti — touchBtnLayout non consuma un sorteggio
       e non scrive niente — e serve all'ANCORA: anche un dito d'erba
       deve dire rispetto a QUALE disco si e' posato, se no il suo punto
       non si puo' ricostruire da nessuna parte.
       ================================================================= */
    let preso=null, slot=-1, uPresa=Infinity, uEscl=Infinity, eslot=-1;
    const dischi=touchBtnLayout(t);
    for(let k=0;k<dischi.length;k++){
      const bt=dischi[k];
      const d=len(x-bt.x,y-bt.y);
      const up=d/(bt.r+10); if(up<uPresa){ uPresa=up; preso=bt; slot=k; }
      const ue=d/(bt.r+18); if(ue<uEscl){ uEscl=ue; eslot=k; }
    }
    /* L'ANCORA: il disco rispetto a cui il punto di posa si scrive, e il
       raggio in cui si misura. Sono gli stessi due numeri della passata
       che ha deciso — se no l'atto e il punto parlerebbero due lingue. */
    const ancora=(k,R)=>{ const b=dischi[k]; atto.slot=k; atto.ux=(x-b.x)/R; atto.uy=(y-b.y)/R; return atto; };
    if(!G.cpu[t] &&
       (G.scene==='play'||G.scene==='golden'||G.scene==='kickoff')){
      /* LA CELLA SPENTA NON RISPONDE (voce #88, 2 settembre 2026): il
         dito si posa e non succede niente — nessun atto nasce, nessuna
         carica si apre, e il disco non viene nemmeno registrato come
         premuto. Non e' un rifiuto VISIBILE come quello di L3.1: quello
         resta, e serve al caso opposto — cella ACCESA e corpo che non
         ce la fa (a terra, in rialzo), dove il dito ha chiesto una cosa
         lecita e merita di sapere che il corpo ha detto no. Qui invece
         il disco dichiarava gia' di essere spento: chi lo preme ha gia'
         avuto la sua risposta guardandolo. */
      if(uPresa<=1 && preso && preso.off){ atto.esito=2; return ancora(slot, preso.r+10); }
      if(uPresa<=1){ atto.esito=0; return ancora(slot, preso.r+10); }
      /* zona di esclusione: un dito che manca il pulsante di poco NON
         diventa origine dello stick — se no il rilascio potrebbe
         partire come flick (tiro o scivolata involontari) */
      if(uEscl<=1){ atto.esito=3; return ancora(eslot, dischi[eslot].r+18); }
    }
    if(eslot>=0) ancora(eslot, dischi[eslot].r+18);
    atto.esito=1;
    return atto;
  },

  /* =====================================================================
     IL PUNTO CHE REALIZZA L'ATTO, nel frame di CHI RILEGGE (voce #144).

     Non e' il pixel del registratore rimesso dov'era — quello e' il
     falso _crit-schermi-pixel — e' il pixel che su QUESTO telefono
     produce lo stesso atto. La distanza normalizzata e' invariante,
     quindi il disco preso e' lo stesso e l'anello morde allo stesso
     modo; i trascinamenti che seguono sono scostamenti in pixel
     assoluti da questo punto, e le soglie che li leggono sono tutte in
     pixel assoluti e non scalate.

     SI ARROTONDA AL PIXEL INTERO, per la stessa ragione delle quattro
     porte (grep «IL DITO SI POSA SU UN PIXEL INTERO»): gli scostamenti
     che arrivano dopo sono interi, e sommati a un intero restano esatti.
     ===================================================================== */
  puntoDi(atto){
    const dischi=touchBtnLayout(atto.t|0);
    const b=dischi[atto.slot|0];
    /* nessun disco da cui ancorarsi: in una partita non puo' succedere
       (l'elenco ha cinque dischi in tutti e due i contesti), ma un
       nastro costruito a mano puo' dire qualunque cosa, e un comando che
       non si puo' rigiocare non deve fermare la partita */
    if(!b) return [Math.round(VW/2), 1];
    const R=(atto.esito===0||atto.esito===2) ? b.r+10 : b.r+18;
    return [Math.round(b.x + atto.ux*R), Math.round(b.y + atto.uy*R)];
  },

  /* LA PORTA DELL'ATTO. La chiamano in due: le quattro porte, con l'atto
     appena risolto da un dito vero, e il riproduttore del nastro, con
     l'atto letto dalla riga di tipo 12. La guardia della pausa sta QUI e
     non piu' solo in start, cosi' vale per tutti e due i capi: un nastro
     non puo' far nascere un atto a gioco fermo piu' di quanto possa un
     dito. */
  avvia(id, atto, x, y){
    if(G.paused) return;
    return this.applica(id, atto, x, y);
  },

  /* L'APPLICAZIONE: il corpo di start di prima, riga per riga. L'unica
     differenza e' che non decide piu' niente — la decisione arriva
     nell'atto — e che il disco si rilegge per INDICE dalla geometria
     LOCALE, che e' il punto di tutto il cantiere. */
  applica(id, atto, x, y){
    const t=atto.t;
    if(atto.esito !== 1){
      /* i due esiti morti — la cella spenta e l'anello d'esclusione —
         non fanno niente, ed e' la stessa cosa che facevano prima: due
         return nudi in mezzo alla risoluzione. Adesso la risoluzione sta
         altrove e restano due return nudi qui. */
      if(atto.esito !== 0) return;
      const preso = touchBtnLayout(t)[atto.slot];
      if(preso){
        const bt=preso;
`);

agg('l\'anello d\'esclusione passa a risolvi', `      /* zona di esclusione: un dito che manca il pulsante di poco NON
         diventa origine dello stick — se no il rilascio potrebbe
         partire come flick (tiro o scivolata involontari) */
      if(uEscl<=1) return;
    }
    const s=this.stick[t];
`,
`      /* IL DISCO C'ERA E IL DITO L'HA PRESO: qui non si arriva. Ci si
         arriva solo se l'atto nomina un disco che questa geometria non
         ha — un nastro costruito a mano — e allora il dito non diventa
         una levetta: un atto che nomina un disco ha gia' detto che non
         e' erba, e trasformarlo in levetta sarebbe inventare un comando
         che nessuno ha dato. */
      return;
    }
    const s=this.stick[t];
`);

/* ------------------------------------------------------------------
   3) i campi del registro: l'origine di ogni dito e la sua squadra
   ------------------------------------------------------------------ */
agg('campi origine e squadra', `  ultimoMotore: 0,

  accendi(){`,
`  ultimoMotore: 0,

  /* =====================================================================
     L'ORIGINE DI OGNI DITO, E LA SUA SQUADRA (voce #144).

     origine[id] e' il punto di posa di quel dito NEL FRAME DI CHI STA
     LAVORANDO: il pixel vero mentre si registra, il pixel ricostruito da
     Touch5.puntoDi mentre si rilegge. I movimenti (tipo 13) viaggiano
     come scostamenti da li', quindi senza questa tabella non si puo' ne'
     scrivere ne' rigiocare un trascinamento.

     squadraDi[id] e' la squadra scritta nell'atto di quel dito, e
     squadraOra e' quella del comando che si sta rigiocando in questo
     istante — la legge l'avvolgimento di Touch5.teamOf, che in rilettura
     NON deve dedurre la squadra da innerWidth/2. Vale -1 quando non si
     sta rigiocando niente, cosi' il dito vero non incontra mai una
     squadra imposta.
     ===================================================================== */
  origine: {},
  squadraDi: {},
  squadraOra: -1,

  accendi(){`);

/* ------------------------------------------------------------------
   4) e si azzerano dove il nastro comincia, non altrove
   ------------------------------------------------------------------ */
agg('azzeraComandi azzera le origini', `    try{ Duel.nDuello = 0; Duel.passo = 0; }catch(e){}
  },`,
`    try{ Duel.nDuello = 0; Duel.passo = 0; }catch(e){}
    /* =====================================================================
       E LE ORIGINI DEI DITI (voce #144), qui e non in azzera().

       azzeraComandi() e' chiamata da accendi() e da deserializza(), cioe'
       nei due soli istanti in cui un nastro COMINCIA, ed e' esattamente
       la vita utile di questa tabella. Azzerarla in Touch5.azzera()
       sarebbe un difetto: le dita restano sul vetro attraverso una pausa
       (e' tutto il senso della riadozione, grep «LA RIADOZIONE»), e un
       dito che sopravvive all'azzeramento deve sapere ancora da dove e'
       partito, se no i suoi scostamenti perderebbero l'origine a meta'
       gesto.
       ===================================================================== */
    this.origine = {}; this.squadraDi = {}; this.squadraOra = -1;
  },`);

/* ------------------------------------------------------------------
   5) la porta che ricorda il punto di posa
   ------------------------------------------------------------------ */
agg('Reg.posa', `  idDi(id){
    if(!this.ids.has(id)) this.ids.set(id, this.idProx++);
    return this.ids.get(id);
  },`,
`  idDi(id){
    if(!this.ids.has(id)) this.ids.set(id, this.idProx++);
    return this.ids.get(id);
  },

  /* IL PUNTO DI POSA DI UN DITO (voce #144). Si scrive SOLO a registro
     acceso, come scrivi() e come schermo(): il gioco di casa non produce
     nastri, e una tabella che crescesse anche fuori da una sfida sarebbe
     memoria che non serve a nessuno. In rilettura la riempie esegui(),
     con il punto RICOSTRUITO. */
  posa(id, x, y){
    if(this.modo !== 1) return;
    this.origine[id] = [x, y];
  },`);

/* ------------------------------------------------------------------
   6) i due rami nuovi del riproduttore
   ------------------------------------------------------------------ */
agg('esegui 12 e 13', `    else if(tipo === 4){ const c = this.tasti[r[4]]; if(c) Keys[c] = !!r[3]; }`,
`    else if(tipo === 4){ const c = this.tasti[r[4]]; if(c) Keys[c] = !!r[3]; }
    /* =====================================================================
       L'ATTO RISOLTO (voce #144). Il punto NON viene dal nastro: viene da
       Touch5.puntoDi, cioe' dalla geometria dei comandi di QUESTO
       telefono. E' tutta la cura in una riga — chi rigiocasse dal pixel
       del registratore rifarebbe il difetto (falso _crit-schermi-pixel).

       LA SQUADRA SI IMPONE, non si ricalcola. Sta nel nastro apposta:
       teamOf(x) la deduce da innerWidth/2, e su due telefoni diversi la
       stessa x cade da due parti diverse del campo. Chi la rimettesse in
       mano a teamOf butterebbe il campo che ha appena letto (falso
       _crit-schermi-ricalcola).

       IL finally NON E' PRUDENZA: se avvia() esplodesse, squadraOra
       resterebbe acceso e il primo dito VERO dopo quel replay si
       ritroverebbe assegnato d'ufficio a una squadra. */
    else if(tipo === 12){
      const atto = { t: r[4]|0, esito: r[5]|0, slot: r[6]|0, ux: (r[7]|0)/1000, uy: (r[8]|0)/1000 };
      const p = Touch5.puntoDi(atto);
      this.origine[r[3]] = p;
      this.squadraDi[r[3]] = atto.t;
      this.squadraOra = atto.t;
      try{ Touch5.avvia(r[3], atto, p[0], p[1]); } finally { this.squadraOra = -1; }
    }
    /* LO SCOSTAMENTO (voce #144): il trascinamento e' in pixel assoluti —
       tutte le soglie che lo leggono lo sono — ma il punto da cui parte
       e' quello RICOSTRUITO qui sopra. Un dito senza origine e' un dito
       il cui atto non e' mai arrivato: il suo movimento si salta, come
       ogni comando che non si puo' rigiocare. */
    else if(tipo === 13){
      const o = this.origine[r[3]];
      if(o){
        const sq = this.squadraDi[r[3]];
        this.squadraOra = (sq === undefined) ? -1 : sq;
        try{ Touch5.move(r[3], o[0] + (r[4]|0), o[1] + (r[5]|0)); } finally { this.squadraOra = -1; }
      }
    }`);

/* ------------------------------------------------------------------
   7) la scrittura nel formato
   ------------------------------------------------------------------ */
agg('serializza 12 e 13', `        pezzi.push(dT + ',11,' + dMs + ',' + ((r[3]|0) >>> 0));
      } else if(tipo === 7){`,
`        pezzi.push(dT + ',11,' + dMs + ',' + ((r[3]|0) >>> 0));
      } else if(tipo === 12){
        /* L'ATTO RISOLTO (voce #144). Sei numeri piccoli: identificativo,
           squadra, esito, disco, e il punto di posa in millesimi di
           geometria. Ne esce UNA riga per dito che si posa, cioe' meno
           di trecento in una partita intera: il peso sta tutto nei
           movimenti, ed e' la ragione per cui quelli viaggiano come
           differenze e questi no.
           IL MILLESIMO NON E' UNA SCELTA LIBERA: la banda piu' stretta
           che un disco sappia distinguere e' l'anello fra u = 1 (presa)
           e u = 1,16 (esclusione), e un millesimo sta centosessanta
           volte dentro. Quantizzare piu' grosso sposta i diti al bordo
           da una parte all'altra della presa — e' il falso
           _crit-schermi-grana, che il banco boccia. */
        const id12 = r[3]|0;
        ux.set(id12, 0); uy.set(id12, 0);
        pezzi.push(dT + ',12,' + dMs + ',' + id12 + ',' + (r[4]|0) + ',' + (r[5]|0) + ',' +
                   (r[6]|0) + ',' + (r[7]|0) + ',' + (r[8]|0));
      } else if(tipo === 13){
        /* LO SCOSTAMENTO DAL PUNTO DI POSA (voce #144). Si scrive come
           DIFFERENZA dallo scostamento precedente dello stesso dito,
           esattamente come faceva il tipo 1 col pixel: quasi tutti i
           movimenti valgono uno o due pixel, e il testo resta fatto di
           cifre piccole e virgole. */
        const id = r[3], x = Math.round(r[4]), y = Math.round(r[5]);
        const px = ux.has(id) ? ux.get(id) : 0, py = uy.has(id) ? uy.get(id) : 0;
        ux.set(id, x); uy.set(id, y);
        pezzi.push(dT + ',13,' + dMs + ',' + id + ',' + (x - px) + ',' + (y - py));
      } else if(tipo === 7){`);

/* ------------------------------------------------------------------
   8) la lettura nel formato
   ------------------------------------------------------------------ */
agg('deserializza 12 e 13', `      else if(tipo === 11)  this.righe.push([tick, 11, ms, (v[3]|0) >>> 0]);`,
`      else if(tipo === 11)  this.righe.push([tick, 11, ms, (v[3]|0) >>> 0]);
      else if(tipo === 12){
        /* l'atto azzera la catena degli scostamenti del suo dito: il
           primo movimento dopo una posa e' misurato dalla posa */
        this.righe.push([tick, 12, ms, v[3], v[4], v[5], v[6], v[7], v[8]]);
        ux.set(v[3], 0); uy.set(v[3], 0);
      }
      else if(tipo === 13){
        const id = v[3];
        const x = (ux.has(id) ? ux.get(id) : 0) + v[4];
        const y = (uy.has(id) ? uy.get(id) : 0) + v[5];
        ux.set(id, x); uy.set(id, y);
        this.righe.push([tick, 13, ms, id, x, y]);
      }`);

/* ------------------------------------------------------------------
   9) le quattro porte: il pixel entra e ne esce un atto
   ------------------------------------------------------------------ */
agg('le quattro porte scrivono l\'atto', `      if(tipo === 0 || tipo === 1){ b = Math.round(b); c = Math.round(c); }
      if(Reg.modo === 1){
        if(tipo === 0 || tipo === 1) Reg.scrivi(tipo, [Reg.idDi(a), b, c]);
        else if(tipo === 2) Reg.scrivi(2, [Reg.idDi(a), b ? 1 : 0]);
        else Reg.scrivi(3, []);
      }
      return vero.call(this, a, b, c);`,
`      if(tipo === 0 || tipo === 1){ b = Math.round(b); c = Math.round(c); }
      /* =================================================================
         E QUI IL PIXEL MUORE (voce #144).

         La porta risolve l'atto UNA VOLTA e lo passa a Touch5.avvia:
         risolvere due volte — una per scriverlo e una per eseguirlo —
         vorrebbe dire che il nastro e la partita possono non essere
         d'accordo, ed e' proprio la crepa che questo cantiere chiude.

         IL PUNTO DI POSA SI RICORDA lo stesso, perche' i movimenti
         viaggiano come scostamenti da li'. E se un movimento arriva per
         un dito di cui non si e' visto l'atto — un touchstart perso, un
         nastro cominciato a meta' — si ripiega sul PIXEL di sempre (tipo
         1) invece di buttarlo: una riga in piu' nel nastro costa niente,
         un comando perduto costa una partita. Un nastro che finisce col
         ripiego dentro porta un pixel, e il giudice lo sa: e' su quella
         presenza che il vaglio decide se astenersi sullo schermo.
         ================================================================= */
      if(tipo === 0){
        const idA = Reg.idDi(a);
        const atto = Touch5.risolvi(b, c);
        Reg.posa(idA, b, c);
        if(Reg.modo === 1) Reg.scrivi(12, [idA, atto.t, atto.esito, atto.slot,
                                           Math.round(atto.ux * 1000), Math.round(atto.uy * 1000)]);
        return Touch5.avvia(a, atto, b, c);
      }
      if(tipo === 1){
        if(Reg.modo === 1){
          const idM = Reg.idDi(a), o = Reg.origine[idM];
          if(o) Reg.scrivi(13, [idM, b - o[0], c - o[1]]);
          else Reg.scrivi(1, [idM, b, c]);
        }
        return vero.call(this, a, b, c);
      }
      if(Reg.modo === 1){
        if(tipo === 2) Reg.scrivi(2, [Reg.idDi(a), b ? 1 : 0]);
        else Reg.scrivi(3, []);
      }
      return vero.call(this, a, b, c);`);

/* ------------------------------------------------------------------
   10) e la squadra non si ricalcola in rilettura
   ------------------------------------------------------------------ */
agg('teamOf avvolto', `})();

/* =====================================================================
   IL RITARDO D'INGRESSO, DAVANTI ALLE QUATTRO PORTE (voce #141).`,
`})();

/* =====================================================================
   LA SQUADRA NON SI DEDUCE DALLA x, IN RILETTURA (voce #144).

   Stessa dottrina delle quattro porte qui sopra, e per la stessa
   ragione: dipende da un NOME, non da un corpo.

   teamOf(x) risponde «x < innerWidth/2 ? 0 : 1» in modalita' 2, e 0 in
   modalita' 1. E' giusto per un dito vero, che sta su QUESTO vetro; e'
   sbagliato per un comando che arriva da un nastro o — domani — da un
   altro telefono, dove una x condivisa non esiste. MISURATO
   (strumenti/_q-schermi.js, prova F): un tocco a x = 500 registrato su
   una finestra da 1280 e' della squadra 0; lo stesso nastro riletto su
   una da 800 muove la levetta della squadra 1.

   L'atto porta la squadra, e qui la si impone. Fuori dalla rilettura
   squadraOra vale -1 e questa funzione non esiste: il dito vero
   incontra il teamOf di sempre, carattere per carattere.
   ===================================================================== */
(function(){
  const vero = Touch5.teamOf;
  Touch5.teamOf = function(x){
    if(Reg.modo === 2 && Reg.squadraOra >= 0) return Reg.squadraOra;
    return vero.call(this, x);
  };
})();

/* =====================================================================
   IL RITARDO D'INGRESSO, DAVANTI ALLE QUATTRO PORTE (voce #141).`);

/* ------------------------------------------------------------------
   11) il disco si rilegge per INDICE, e l'indice sta nell'atto
   ------------------------------------------------------------------ */
agg('nasceAtto legge lo slot scritto nell atto', `        this.nasceAtto(id,t,slot,bt.act,x,y);`,
`        this.nasceAtto(id,t,atto.slot,bt.act,x,y);`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-144-atto.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve esattamente 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
