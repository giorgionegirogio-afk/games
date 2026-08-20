/* =====================================================================
   _t-l15.js — IL CAMBIO UOMO GUARDA DOVE STAI GUARDANDO, E IL DITO SA
   MANDARE UN COMPAGNO A RADDOPPIARE.

   Voce L1.5 di _analisi/agente28.md (§4, riga «cambio direzionale» e riga
   «raddoppio»; §10, onda 1). Toppa cerca/sostituisci: legge
   CALCETTO-il-gioco.html (o --in), sostituisce SETTE ancoraggi ESATTI e
   scrive la copia in --out. Senza --out scrive accanto all'originale un
   file col suffisso .l15.html: mai sull'originale, se non con --dentro.
   Se anche un solo ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma
   con codice 1, dice quale, e non scrive niente.

   uso:
     node strumenti/_t-l15.js --out fuori/l15.html
     node strumenti/_t-l15.js --in altro.html --out x.html
     node strumenti/_t-l15.js --dentro
     node strumenti/_t-l15.js --elenco

   ---------------------------------------------------------------------
   IL DIFETTO, MISURATO PRIMA DI TOCCARE UNA RIGA — E LA STESSA MISURA
   RIFATTA DOPO.

   cambiaGiocatore girava in CICLO per angolo attorno al pallone: premi, e
   ti arriva il prossimo della lista. La lista non ha niente a che vedere
   con dove stai guardando, e non ce l'ha per costruzione — il ciclo la
   levetta non la legge proprio.

   IL BANCO: «node strumenti/_q-l15.js --misura», sei partite a 5 contro 5
   per colonna, semi 20260820..25, un robot col pollice sinistro sempre
   giu' e puntato verso il pallone (cioe' dove sta andando, che e' quello
   che fa chiunque difenda) e il destro che preme il disco CAMBIO ogni
   0,67 s quando il disco dice CAMBIO. Le due colonne girano lo stesso
   strumento sui due file.

                                              PRIMA (ciclo)   DOPO (direzione)
     cambi censiti                              104              78
     salto mediano dal vecchio al nuovo uomo    262,49 u        147,72 u
     errore angolare mediano levetta/uomo        42,57 gradi     32,81 gradi
     l'uomo arriva dalla parte OPPOSTA          40/104 = 38,46%  22/78 = 28,21%
     non e' il piu' vicino al pallone           70/104 = 67,31%  12/78 = 15,38%
        e quando succede, piu' lontano di       228,23 u         35,72 u
     il cambio ti allontana dal pallone         52/104 = 50,00%  40/78 = 51,28%
     -- quando un compagno DAVANTI c'e' davvero --
     casi                                       97               62
     l'uomo scelto sta davanti                  64/97 = 65,98%   56/62 = 90,32%
     errore angolare mediano                     28,61 gradi      18,91 gradi

   COME SI LEGGE, E COSA NON DICE.
   La riga che conta e' l'ultima coppia: quando dalla parte in cui il
   pollice spinge un compagno c'e' DAVVERO, adesso arriva lui nel 90% dei
   casi contro il 66% di prima, e l'errore angolare mediano scende da 28,6
   a 18,9 gradi. E la scelta smette di mandarti dall'altra parte del
   campo: «non e' il piu' vicino al pallone» crolla dal 67% al 15%, e i
   228 unita' di troppo diventano 36.
   L'errore angolare COMPLESSIVO migliora meno (42,6 -> 32,8 gradi), e la
   ragione e' scritta e voluta, non un residuo da limare: (a) in 16 cambi
   su 78 dalla parte in cui il pollice spinge non c'e' NESSUNO — il
   progetto l'aveva gia' misurato, un cono duro e' vuoto nel 71% degli
   stati a 5 contro 5 — e li' qualunque scelta e' «dietro»; (b) la regola
   pesa insieme angolo e distanza, quindi un compagno vicino un po' fuori
   asse batte apposta uno lontanissimo perfettamente in linea. La
   proprieta' angolare pura si misura dove le distanze sono uguali, ed e'
   il controllo A del cancello: 32 prove su 32 centrate, errore mediano
   0,00 gradi, a 5 e a 11.
   Nota di onesta' su cosa dice l'intera tabella: la levetta puntata verso
   il pallone e' un MODELLO dell'intenzione di chi difende, non
   l'intenzione vera, che nessuna macchina sa leggere. Cio' che si misura
   e' quanto la scelta sia legata all'unica cosa che il gioco sa della tua
   intenzione. Sul ciclo quel legame era zero per costruzione.
   E una dispersione da dichiarare: due corse dello stesso censimento
   sullo stesso file hanno dato 88 e 78 pressioni. Il robot preme quando
   il disco dice CAMBIO, e quante volte lo dica dipende da come va la
   partita: le percentuali qui sopra vanno lette come cifre tonde, non
   come decimali.

   ---------------------------------------------------------------------
   COSA FA QUESTA TOPPA, IN QUATTRO RIGHE.

   1. Alla PRESSIONE del disco CAMBIO passa l'uomo che sta nella direzione
      indicata dalla levetta. Latenza invariata: e' la stessa riga di
      prima, chiamata nello stesso istante.
   2. Senza direzione (levetta ferma o dentro la dead-zone) passa il piu'
      vicino al pallone fra gli altri. Mai nessuno.
   3. CAMBIO piu' TRASCINAMENTO ARMATO, al rilascio, manda il compagno che
      sta in quella direzione a pressare il portatore avversario: e' il
      ruolo 'raddoppio' che teamBrain gia' assegna da 7 giocatori in su e
      solo in automatico, reso comandabile.
   4. Nessun numero nuovo entra nella simulazione tranne la DURATA
      dell'ordine, che non e' nuova nemmeno lei: e' due volte RUOLO_MIN.

   ---------------------------------------------------------------------
   LE QUATTRO COSE CHE VANNO DETTE, PERCHE' NON SONO GRATIS.

   1. L'ORDINE DI RADDOPPIO BATTE IL RUOLO DI ULTIMO UOMO. In aiDecide
      l'ultimo uomo esce prima di tutti («portiere di fatto») e non
      ascolta nessuno: se l'ordine stesse dopo, indicare l'ultimo uomo
      sarebbe un comando che non fa niente, in silenzio — e un comando
      muto e' esattamente la bugia che questo progetto passa il tempo a
      togliere. Sta prima, quindi il dito puo' portare fuori posizione
      l'uomo che copre la porta. E' una scelta: il costo di un ordine
      sbagliato lo paga chi l'ha dato. Non e' misurato quanto costi in
      gol subiti, e non va scritto che e' poco.
   2. IL RADDOPPIO NON HA ANCORA UN SEGNO. Chi lo comanda vede muoversi un
      compagno e basta: nessuna linea, nessuna didascalia. La scoperta e'
      l'onda 3 (L3.1/L3.2) e non sta in questa toppa; finche' non arriva,
      questo verbo si impara solo guardando il campo.
   3. SENZA UN PORTATORE AVVERSARIO L'ORDINE NON PARTE. Il pallone in
      questo gioco non e' ai piedi di nessuno per la maggior parte del
      tempo, quindi il modificatore tace spesso. Mandare il compagno sul
      PALLONE libero invece che sull'uomo sarebbe un altro verbo, con un
      altro bersaglio e una misura sua: non l'ho fatto e non l'ho
      misurato.
   4. IL CAMBIO SENZA DIREZIONE NON E' PIU' IL PROSSIMO IN LISTA. Chi
      martellava il disco per fare il giro dei compagni adesso ottiene
      sempre lo stesso uomo (il piu' vicino al pallone fra gli altri).
      Il giro dei compagni si fa con la levetta, che e' il punto di tutta
      la voce; ma chi giocava col ciclo trova un gioco diverso.

   ---------------------------------------------------------------------
   IL COSTO PER FOTOGRAMMA: NON MISURATO OGGI, E IL BANCO LO DICE DA SOLO.

   Quello che si aggiunge dentro il ciclo di ogni fotogramma sono DUE
   confronti per giocatore non comandato (il cronometro p.raddoppio in
   aiMove) piu' un confronto in cima ad aiDecide, che gira a tempo di
   reazione e non a fotogramma. uomoVersoDirezione e comandaRaddoppio
   girano SOLO quando un dito preme o rilascia il disco: venti-trenta
   volte in novanta secondi. Questo e' un CONTEGGIO DI OPERAZIONI, non una
   misura, e come tale va letto.
   La misura appaiata e' stata fatta e NON E' UTILIZZABILE:
     node strumenti/prestazione.js --contro CALCETTO-il-gioco.html
          --gioco fuori/l15.html --taglia 5|7|11
   da' sul fotogramma medio +7,8% (taglia 5), -3,6% (7), -8,4% (11), e lo
   strumento dichiara da solo che il segno non e' sicuro perche' i giri
   scavalcano lo zero. La prova di onesta' dello strumento — lo stesso
   file contro se' stesso — oggi FALLISCE: 18,1% con cinque giri e 26,9%
   con sette, contro il 10% che l'attrezzo si da' come risoluzione. Su
   questo banco, oggi, nessun verdetto di prestazione vale niente: i tre
   numeri qui sopra stanno scritti perche' esistono, non perche' dicano
   qualcosa. Va rifatto a banco calmo.

   ---------------------------------------------------------------------
   COSA NON TOCCA. Il cambio AUTOMATICO (switchControlled) non cambia di
   un byte: l'isteresi, il lucchetto di 0,75 s e la soglia di 14 unita'
   sono quelli di prima. Il ruolo 'raddoppio' automatico di teamBrain non
   cambia condizione ne' bersaglio — cambia solo che adesso la formula del
   bersaglio ha un nome ed e' scritta una volta sola, cosi' il raddoppio
   comandato e quello automatico vanno per forza nello stesso posto.
   Il disco piccolo quando dice PASSAGGIO non e' toccato: quel verbo vive
   sulla pressione e il suo rilascio resta inerte come prima.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   GLI ANCORAGGI. Testo esatto cercato, testo esatto messo al suo posto.
   Nessuna espressione regolare, nessun numero di riga.
   -------------------------------------------------------------------- */
const ANCORE = [

/* 1 — la scelta direzionale, il cambio, e l'ordine di raddoppio */
{
  nome: '1/7 cambiaGiocatore: dal ciclo orario alla direzione della levetta',
  cerca:
`/* ---------- cambio giocatore MANUALE ----------
   Senza questo non esistono anticipo, raddoppio e copertura: si e' sempre
   incollati al piu' vicino alla palla. Cicla per angolo rispetto al pallone,
   cosi' si sceglie DA CHE PARTE aggredire, non solo chi e' piu' vicino. */
function cambiaGiocatore(t){
  if(G.ctrl[t]<0) return;
  const b=G.ball;
  const miei=G.players.map((p,i)=>({p,i})).filter(o=>o.p.team===t && o.p.out<=0 && o.p.role!=='gk');
  if(miei.length<2) return;
  const ang=o=>Math.atan2(o.p.y-b.y, o.p.x-b.x);
  miei.sort((a,c)=>ang(a)-ang(c));
  const k=miei.findIndex(o=>o.i===G.ctrl[t]);
  const next=miei[(k+1+miei.length)%miei.length];
  if(!next || next.i===G.ctrl[t]) return;
  G.ctrl[t]=next.i;
  G.swLock[t]=0.75;                        // il cambio automatico non lo ruba subito
  G.swTimer[t]=0;
  Audio5.beep(520);
}`,
  metti:
`/* =====================================================================
   L1.5 — L'UOMO CHE STA IN QUELLA DIREZIONE.

   E' l'unica funzione che risponde alla domanda «quale dei miei sta di
   la'», e la usano in due: il CAMBIO alla pressione, dove la direzione la
   da' la levetta, e il RADDOPPIO al rilascio, dove la da' il
   trascinamento sul disco. Una scrittura sola, quindi il dito che sceglie
   un uomo e il dito che ne comanda un altro non possono litigare.

   COME SCEGLIE: la distanza dalla SEMIRETTA che parte dall'uomo comandato
   e va nella direzione indicata. Chi ci sta sopra ha zero; chi sta di
   fianco paga il proprio scostamento; chi sta DIETRO paga tutta la
   propria distanza, perche' per una semiretta il punto piu' vicino
   all'indietro e' l'origine. Tre proprieta', e sono la ragione della
   scelta:
     · NIENTE SETTORI E NIENTE CONI (§3 del progetto). Non ci sono confini
       da attraversare, quindi non esiste la classe di errori che nasce
       quando la spazzata naturale del pollice cade su un confine — ed e'
       la classe di errori per cui una rosa a quattro settori era stata
       bocciata sia allineata allo schermo sia ruotata.
     · LA DIREZIONE INCLINA, NON SBARRA. Un compagno alle spalle resta
       scegli-bile se e' l'unico che c'e'. Il cono duro che il progetto
       aveva misurato era VUOTO nel 71% degli stati a 5 contro 5: un
       ingresso che non seleziona niente e' peggio di uno che seleziona
       male.
     · ANGOLO E DISTANZA SI PESANO DA SOLI, senza un numero da tarare,
       perche' lo scostamento E' distanza per seno dell'angolo. Un
       compagno a 50 unita' e 40 gradi (scostamento 32) batte uno a 700
       unita' e 10 gradi (scostamento 121). Nessuna costante nuova entra
       nel gioco da questa parte.

   SENZA DIREZIONE — levetta ferma, o dentro la sua dead-zone, o tastiera
   senza frecce — si ricade sul piu' vicino al PALLONE fra gli altri. Non
   e' un ripiego qualunque: il cambio AUTOMATICO ti tiene gia' incollato
   al piu' vicino, quindi il manuale senza direzione ti da' il secondo,
   che e' l'unica risposta che aggiunge qualcosa. E non torna mai
   «nessuno» finche' un compagno di movimento esiste.

   PAREGGI: vince l'indice piu' basso, perche' il confronto e' stretto.
   E' un caso di misura nulla in un continuo, ma va detto che esiste: in
   questo file un ordinamento nascosto ha gia' prodotto un difetto vero
   una volta (il bestDot di eseguiFiltrante), e un difetto conosciuto
   scritto vale piu' di un difetto elegante taciuto.
   ===================================================================== */
function uomoVersoDirezione(t, dx, dy, escludi){
  const p0=ctrlPlayer(t);
  if(!p0) return -1;
  const dl=len(dx,dy);
  const ux=dl>0?dx/dl:0, uy=dl>0?dy/dl:0;
  let best=-1, bs=Infinity;
  for(let i=0;i<G.players.length;i++){
    const q=G.players[i];
    if(i===escludi || q.team!==t || q.out>0 || q.role==='gk') continue;
    let s;
    if(dl>0){
      const vx=q.x-p0.x, vy=q.y-p0.y;
      const par=vx*ux+vy*uy;
      s = par>0 ? Math.abs(vx*uy-vy*ux) : len(vx,vy);
    }else s = len(q.x-G.ball.x, q.y-G.ball.y);
    if(s<bs){ bs=s; best=i; }
  }
  return best;
}

/* ---------- cambio giocatore MANUALE, ALLA PRESSIONE ----------
   Senza questo non esistono anticipo, raddoppio e copertura: si e' sempre
   incollati al piu' vicino alla palla.

   QUI C'ERA UN CICLO per angolo attorno al pallone: premi e ti arriva il
   prossimo della lista, in un ordine che non ha niente a che vedere con
   dove stai guardando — e non ce l'ha per costruzione, perche' il ciclo
   la levetta non la leggeva. Misurato su sei partite a 5 contro 5 col
   pollice sinistro puntato dove il giocatore stava andando
   (strumenti/_q-l15.js --misura, 104 cambi): mediana di 42,57 gradi fra
   la levetta e l'uomo che arrivava, 40 volte su 104 l'uomo arrivava dalla
   parte OPPOSTA, e 70 volte su 104 non era il piu' vicino al pallone fra
   quelli disponibili — in media 228 unita' piu' lontano. Con la stessa
   misura, dopo: 22 su 78 dalla parte opposta e 12 su 78 non i piu'
   vicini, con 36 unita' invece di 228.
   Il conto delle pressioni per partita non e' mio: il progetto stima il
   cambio uomo a 20-30 volte in 90 secondi, secondo verbo dopo il
   passaggio.

   Adesso la direzione la da' humanMove(t), cioe' ESATTAMENTE la stessa
   cosa che fa correre il giocatore — levetta oltre la dead-zone, oppure
   frecce da tastiera. Non c'e' un secondo modo di dire «di la'», e questo
   e' il punto: la mano non deve imparare niente di nuovo.
   La latenza non cambia di un fotogramma: questa funzione e' chiamata
   dove era chiamata prima, alla PRESSIONE del disco. */
function cambiaGiocatore(t){
  if(G.ctrl[t]<0) return;
  const [mx,my]=humanMove(t);
  const k=uomoVersoDirezione(t, mx, my, G.ctrl[t]);
  if(k<0 || k===G.ctrl[t]) return;
  G.ctrl[t]=k;
  G.swLock[t]=0.75;                        // il cambio automatico non lo ruba subito
  G.swTimer[t]=0;
  Audio5.beep(520);
}

/* ---------- il RADDOPPIO comandato: CAMBIO piu' trascinamento ----------
   Il compagno che sta nella direzione del trascinamento va a pressare il
   portatore avversario. Non e' un ruolo nuovo e non e' un comportamento
   nuovo: e' il ruolo 'raddoppio' che teamBrain assegna gia', ma solo
   dalle taglie 7 in su e solo per decisione della squadra. Qui lo puo'
   chiedere il dito, a ogni taglia.

   SENZA UN PORTATORE AVVERSARIO NON PARTE, e torna false per dirlo: il
   verbo si chiama raddoppio perche' raddoppia SU UN UOMO. Con il pallone
   di nessuno — che in questo gioco e' la maggior parte del tempo — il
   modificatore tace. Mandare il compagno sul pallone libero sarebbe un
   altro verbo, con un altro bersaglio, e vorrebbe una misura sua.

   L'uomo comandato non si puo' indicare da solo (escludi): quello lo stai
   gia' muovendo tu. */
function comandaRaddoppio(t, ux, uy){
  const b=G.ball;
  const carrier = b.owner>=0 ? G.players[b.owner] : null;
  if(!carrier || carrier.team===t) return false;
  const k=uomoVersoDirezione(t, ux, uy, G.ctrl[t]);
  if(k<0) return false;
  G.players[k].raddoppio=RADDOPPIO_T;
  return true;
}`,
},

/* 2 — il rilascio del disco piccolo */
{
  nome: '2/7 Touch5.chiudi: il trascinamento sul disco CAMBIO comanda il raddoppio',
  cerca:
`      const lettura=(bt.act==='shot' && a && !a.morto && a.carica) ? this.trascina(id,true) : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t, lettura);
      }
      return;`,
  metti:
`      /* RIANCORATO IL 20 AGOSTO, e la ragione va scritta perche' vale per
         chiunque tocchera' questo blocco dopo di noi.
         L1.3 (la mira del tiro) e L1.5 (il raddoppio) sono nate in
         parallelo e leggono TUTTE E DUE il trascinamento al distacco,
         perche' e' l'unico istante in cui l'atto e' ancora vivo:
         trascina() lavora su this.atti[id], e la riga del delete
         lo cancella. Applicate in fila, la seconda trovava il blocco
         gia' riscritto dalla prima.
         La cura non e' leggere due volte — sarebbe un anello di otto
         posizioni percorso due volte per ogni dito che si stacca — ma
         leggere UNA volta e servire tutti e due i verbi. Il tiro
         pretende in piu' che la carica sia sua e che l'atto non sia
         morto, e quelle tre condizioni restano dove stavano: sono sue,
         non della lettura. */
      const tr=this.trascina(id,true);
      const lettura=(bt.act==='shot' && a && !a.morto && a.carica) ? tr : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t, lettura);
      }
      /* =================================================================
         L1.5 — IL RADDOPPIO, CIOE' CAMBIO PIU' TRASCINAMENTO.
         Il cambio uomo e' gia' partito alla PRESSIONE e non aspetta
         niente: qui c'e' soltanto il modificatore, che vive sul rilascio
         come tutte le mire di questo schema.
         Le tre guardie sono tre leggi, e nessuna e' un'opinione:
           · annulla — touchcancel non e' touchend (Legge 4). Il sistema
             che ti prende il dito non puo' comandare un uomo;
           · tr.armato — sotto R_ARMA il trascinamento non esiste, quindi
             un rilascio senza trascinamento non produce niente (P9: fra
             due verbi vince il meno impegnativo). Dentro «armato» c'e'
             anche «non morto», cioe' l'annullo per spostamento: chi ha
             portato il dito oltre R_ANNULLA ha gia' rinunciato, e non si
             rientra;
           · G.paused — a gioco fermo nessun dito comanda.
         Il disco piccolo quando dice PASSAGGIO non ha nessun ramo qui:
         quel verbo vive sulla pressione e il suo rilascio resta inerte
         com'era. */
      else if(bt.act==='swap' && !annulla && !G.paused && tr && tr.armato) comandaRaddoppio(bt.t, tr.ux, tr.uy);
      return;`,
},

/* 3 — il bersaglio del raddoppio, e la durata dell'ordine */
{
  nome: '3/7 puntoRaddoppio + RADDOPPIO_T, accanto a ruoloDi',
  cerca:
`function ruoloDi(p){
  const B = G.brain[p.team];
  const i = G.players.indexOf(p);
  return (B && B.ruoli && B.ruoli[i]) || 'libero';
}`,
  metti:
`function ruoloDi(p){
  const B = G.brain[p.team];
  const i = G.players.indexOf(p);
  return (B && B.ruoli && B.ruoli[i]) || 'libero';
}

/* =====================================================================
   L1.5 — DOVE SI VA A RADDOPPIARE, E PER QUANTO.

   IL POSTO. Fra il portatore e la PROPRIA porta, un passo piu' largo del
   pressatore: cosi' i due uomini non finiscono sullo stesso punto e la
   linea verso la porta resta chiusa. La formula era scritta dentro il
   ramo del ruolo 'raddoppio' di aiDecide; adesso la leggono in due — il
   ruolo automatico e l'ordine del dito — e sta scritta una volta sola,
   perche' due copie che possono divergere sono il modo in cui «comandato»
   e «automatico» diventerebbero due verbi diversi col nome uguale.

   LA DURATA. Due volte RUOLO_MIN. Non e' un numero nuovo e non e' una
   taratura: RUOLO_MIN e' quanto dura un incarico in questo gioco, e
   teamBrain riassegna i ruoli ogni RUOLO_MIN. Un ordine che durasse meno
   verrebbe scavalcato dalla prima riassegnazione della squadra e sarebbe
   uno sfarfallio; due incarichi e' la durata piu' corta che sopravvive a
   un confine di riassegnazione anche nel caso peggiore, cioe' quando
   l'ordine arriva un istante prima che la squadra ripensi.
   ===================================================================== */
function puntoRaddoppio(carrier, myGoalX){
  const vx=myGoalX-carrier.x, vy=FH/2-carrier.y, vl=Math.max(1,len(vx,vy));
  const so=64*KPASSO;
  return [clamp(carrier.x+vx/vl*so, P_R, FW-P_R), clamp(carrier.y+vy/vl*so, P_R, FH-P_R)];
}
const RADDOPPIO_T = RUOLO_MIN*2;`,
},

/* 4 — l'ordine del dito, in cima ad aiDecide */
{
  nome: '4/7 aiDecide: l\'ordine di raddoppio viene prima del ruolo',
  cerca:
`  const ballNearOurGoal = Math.abs(b.x-myGoalX)<FW*0.42;

  if(p===deepest && !weHaveBall){`,
  metti:
`  const ballNearOurGoal = Math.abs(b.x-myGoalX)<FW*0.42;

  /* =====================================================================
     L1.5 — L'ORDINE DEL DITO VIENE PRIMA DEL RUOLO.

     p.raddoppio e' un cronometro, non un interruttore, e lo scrive
     comandaRaddoppio quando il dito rilascia il disco CAMBIO con un
     trascinamento armato. Finche' corre, questo uomo va a pressare il
     portatore avversario e non fa nient'altro.

     STA IN CIMA, E BATTE ANCHE L'ULTIMO UOMO. Il ramo qui sotto fa uscire
     l'ultimo uomo prima di ogni altra cosa: se l'ordine stesse dopo,
     indicare l'ultimo uomo sarebbe un comando che non fa niente, e non
     fare niente IN SILENZIO e' la bugia che questo schema passa il tempo
     a togliere dai dischi. Il prezzo e' dichiarato e non e' piccolo: il
     dito puo' portare fuori posizione l'uomo che copre la porta, ed e'
     una palla persa che diventa un tiro a porta vuota. Lo paga chi ha
     dato l'ordine, che e' l'unico modo giusto di farglielo imparare.
     Quanto costi in gol subiti NON E' MISURATO.
     ===================================================================== */
  if(p.raddoppio>0 && carrier && carrier.team!==myTeam){
    const r=puntoRaddoppio(carrier, myGoalX);
    p.aiTX=r[0]; p.aiTY=r[1];
    return;
  }

  if(p===deepest && !weHaveBall){`,
},

/* 5 — il ruolo automatico chiama la stessa formula */
{
  nome: '5/7 aiDecide: il ruolo raddoppio legge puntoRaddoppio',
  cerca:
`    }else if(mioRuolo==='raddoppio' && carrier && carrier.team!==myTeam){
      /* seconda pressione (taglie 7/11): chiude il portatore dal lato
         della propria porta, un passo piu' largo del pressatore */
      const vx=myGoalX-carrier.x, vy=FH/2-carrier.y, vl=Math.max(1,len(vx,vy));
      const so=64*KPASSO;
      p.aiTX=clamp(carrier.x+vx/vl*so, P_R, FW-P_R);
      p.aiTY=clamp(carrier.y+vy/vl*so, P_R, FH-P_R);
    }else{`,
  metti:
`    }else if(mioRuolo==='raddoppio' && carrier && carrier.team!==myTeam){
      /* seconda pressione (taglie 7/11): chiude il portatore dal lato
         della propria porta, un passo piu' largo del pressatore.
         La formula sta in puntoRaddoppio e non piu' qui, perche' adesso
         la leggono in due: questo ruolo, che la squadra assegna da sola, e
         l'ordine del dito in cima a questa funzione (L1.5). Una scrittura
         sola vuol dire che il raddoppio comandato e quello automatico
         vanno per forza nello stesso posto. */
      const r=puntoRaddoppio(carrier, myGoalX);
      p.aiTX=r[0]; p.aiTY=r[1];
    }else{`,
},

/* 6 — il cronometro dell'ordine */
{
  nome: '6/7 aiMove: p.raddoppio e\' un cronometro e si spegne da solo',
  cerca:
`  if(p.corsaArea>0) p.corsaArea=Math.max(0, p.corsaArea-dt);
  if(carrier && carrier.team!==myTeam) p.corsaArea=0;`,
  metti:
`  if(p.corsaArea>0) p.corsaArea=Math.max(0, p.corsaArea-dt);
  if(carrier && carrier.team!==myTeam) p.corsaArea=0;
  /* L1.5 — L'ORDINE DI RADDOPPIO E' UN CRONOMETRO, per la stessa ragione
     scritta qui sopra per la corsa in area: un interruttore che una
     funzione accende e un'altra deve ricordarsi di spegnere prima o poi
     resta acceso, e un cronometro no. Muore da solo dopo RADDOPPIO_T, e
     muore SUBITO quando non c'e' piu' un portatore avversario — che e' la
     condizione stessa dell'ordine, non una precauzione.
     Sta qui, cioe' dentro il ramo dell'IA: mentre un uomo e' comandato
     dal dito il suo cronometro non scorre, perche' in quei fotogrammi
     l'ordine non lo muove nessuno. Se il controllo lo lascia mentre un
     avversario ha ancora il pallone, l'ordine riprende da dov'era. */
  if(p.raddoppio>0) p.raddoppio=Math.max(0, p.raddoppio-dt);
  if(!carrier || carrier.team===myTeam) p.raddoppio=0;`,
},

/* 7 — il fischio azzera gli ordini */
{
  nome: '7/7 resetKickoff: nessun ordine sopravvive al fischio',
  cerca:
`    p.corsaArea=0;                                              // e la corsa in area`,
  metti:
`    p.corsaArea=0;                                              // e la corsa in area
    p.raddoppio=0;                       // e l'ordine di raddoppio del dito (L1.5)`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l15.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l15.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* un controllo dopo la sostituzione: ogni pezzo nuovo deve essere definito
   una volta sola e chiamato dove ci si aspetta */
/* i conti comprendono le occorrenze nei COMMENTI, ed e' voluto: se
   qualcuno riscrive un commento e sposta un nome, questo controllo se ne
   accorge e obbliga a rileggere. */
const attesi = [
  ['function uomoVersoDirezione(', 1], ['uomoVersoDirezione(t,', 3],
  ['function comandaRaddoppio(', 1], ['comandaRaddoppio(', 2],
  ['function puntoRaddoppio(', 1], ['puntoRaddoppio(', 3],
  ['const RADDOPPIO_T', 1], ['RADDOPPIO_T', 3],
  ['p.raddoppio', 7], ['.raddoppio=RADDOPPIO_T', 1],
  ['const par=vx*ux+vy*uy;', 1],
  /* il ciclo orario non deve esistere piu' da nessuna parte */
  ['miei.sort((a,c)=>ang(a)-ang(c));', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte, ' + (out.length - src.length >= 0 ? '+' : '') + (out.length - src.length) + ')');
