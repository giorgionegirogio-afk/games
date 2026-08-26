/* =====================================================================
   _t-l14b.js — L1.4: IL PASSAGGIO SI MIRA COL DITO (26 agosto 2026).

   E' LA SECONDA STESURA. La prima — strumenti/_t-l14.js, 20 agosto — sta
   ancora sul disco e NON va applicata: resta come verbale di quel che fu
   proposto, e la riga del gioco che dice «e' la riserva che ha bocciato
   L1.4, imparata» ha senso solo finche' quel documento esiste. Perche'
   riscriverla invece di ripararla, in una riga: quattro dei suoi tredici
   ancoraggi sono stati SUPERATI da altre onde, e tre di quei quattro
   combaciano ancora. Chi la lanciasse per intero otterrebbe un file che
   si scrive senza protestare e che contiene DUE meccanismi di chiamata
   affiancati, di cui uno morto. Una toppa ancorata che va bene solo se
   chi la lancia si ricorda di non lanciarla tutta non e' una toppa: e' una
   trappola, perche' il rifiuto automatico — l'unica garanzia del
   meccanismo — non scatta.

   ---------------------------------------------------------------------
   CHE COSA FA, in una frase: il disco PASSAGGIO smette di calciare alla
   pressione e apre una POSA; il dito trascina per scegliere il compagno e
   per alzare la palla; il rilascio esegue. Un tap resta un appoggio
   sicuro, come oggi.

   LA TESI, dal cancello _q-l14.js del 20 agosto misurata sul gioco di
   allora: il pallone parte alla pressione 24 volte su 24, e otto
   direzioni trascinate producono lo stesso ricevente — cioe' la mira non
   esiste, e la levetta (che e' la corsa) non puo' farne le veci.

   ---------------------------------------------------------------------
   CHE COSA E' STATO LASCIATO INDIETRO, e perche'. Quattro ancoraggi della
   prima stesura (10, 11, 12, 13) costruivano LA CHIAMATA del compagno con
   campi propri — q.chiamataT, q.chiamataX, q.chiamataY. Quella chiamata
   nel frattempo e' arrivata per un'altra strada, ed e' migliore:

     chiamaGiocatore(p, dirx, diry, durata)   il gesto
     puntoChiamata(p)                         dove va, ricalcolato
     scansaAvversari(...)                     47,35 -> 64,53 unita' di
                                              franco, misurato da _q-l23
     slancioChiamata(t)                       la distanza, che scala
     CHIAMA_T = 1.6 · CHIAMA_PESO = 140       il tempo e il peso nel
                                              punteggio del ricevente

   ed e' stata scritta APPOSTA per questa voce: L2.3 dichiara «il ricevente
   candidato parte quando il trascinamento arma (voce L1.4) [...] nessuno
   dei due ingressi sta qui dentro: li collegano L1.4 e chi fara' il
   contesto NOI». Quindi L1.4 non costruisce la chiamata: LA CHIAMA. Nel
   blocco grosso di questa toppa la funzione fatta in casa e' stata
   cancellata (faceva un punto FISSO a 150 unita', non scansava nessuno,
   non rifiutava portiere ed espulso, e scriveva su campi che nel gioco
   non legge nessuno) e al suo posto c'e' una riga che chiama L2.3
   passandole la sola cosa che era sua: la DIREZIONE, cioe' la linea del
   passaggio che continua (60%) piegata verso la porta (40%).

   ---------------------------------------------------------------------
   E C'E' UN ANCORAGGIO CHE NON ESISTEVA, ED E' IL PIU' IMPORTANTE: LA
   LINEA DI GUIDA. La posa del passaggio nasce con chargeGo nullo — e' la
   firma delle tenute del dito — e segniGuida disegna la linea del
   passaggio SOLO nel ramo `p.chargeGo && p.chargeKind==='passo'`. Con la
   prima stesura, dunque, tenendo PASSAGGIO non si sarebbe visto PIU'
   NIENTE: il cancello _q-linea.js prova B lo direbbe 36 volte su 36, e la
   toppa spegnerebbe una conquista (L3.1, l'anteprima) mentre ne aggiunge
   un'altra. Peggio: toglierebbe alla voce il suo stesso argomento — «il
   giocatore VEDE chi ricevera' prima di lasciare» — pagando comunque il
   45% di velocita' per tutta la mira. Da qui i due ancoraggi nuovi
   (Touch5.posaDi e il ramo di segniGuida), che sono codice nuovo e non
   spostamento di codice: ~35 righe che la prima stesura non conteneva.

   La linea chiede il bersaglio a bersaglioL14, cioe' alla STESSA funzione
   che eseguira' il calcio: e' la legge di L3.1 alla lettera — promessa ed
   esecuzione passano dallo stesso testo, quindi non possono divergere.

   ---------------------------------------------------------------------
   IL PREZZO, dichiarato prima di misurarlo:
     · il portatore rallenta al 45% per tutta la mira, non per 50 ms
       (`const slow = p.charge>=0 ? 0.45 : ...`). E' il costo del gesto, e
       si paga solo se si tiene premuto.
     · un tap arriva ~50 ms piu' tardi (al rilascio invece che 50 ms dopo
       la pressione).
     · 'through' diventa l'unico dei sei verbi che vive sul rilascio.
     · la posa non ha scadenza automatica: maturaAnticipi salta le pose
       senza chargeGo. Si chiude su chiudi / azzera / muoreAtto / ri-armo,
       che sono tutti eventi del dito. E' la stessa classe di difetto per
       cui esiste _q-l11.js, su un campo nuovo: va MISURATA, non dedotta.

   I SORTEGGI: nessuno dei dodici ancoraggi pesca un numero casuale, e
   chiamaGiocatore lo dichiara di se'. Ma chiamaGiocatore fa p.aiT=0,
   quindi COL DITO GIU' la ripianificazione di quel giocatore anticipa e
   la SEQUENZA dei sorteggi si sposta: le partite CPU contro CPU restano
   identiche al bit (nessun dito), i banchi con dito no.

   ---------------------------------------------------------------------
   I CANCELLI CHE VANNO RIFATTI NELLA STESSA PASSATA — e sono noti prima,
   non scoperti dopo (il piano completo sta in _analisi/PIANO-L14.md):
     _q-l16.js prova F   posa il dito su 'through' e pretende un calcio
                         col dito ancora giu': da riscrivere
     giocata.js filtrante  preme 80 ms senza trascinare e pretende +1
                         filtrante: adesso e' un appoggio, non una
                         filtrante
     giocata.js cross    passava dal ramo comeCross di doFiltrante: va
                         ri-puntata sul disco 'cross' di L1.6
     _q-linea.js prova B  verde solo con l'ancoraggio 12
     _q-l14.js           il banco sceglie il disco per raggio MINIMO, e
                         con i dischi di L1.6 il minimo e' 'pass' (26) non
                         'through' (30): esce 2 senza misurare. Piu':
                         azzera q.chiamataT (campo inesistente) invece di
                         q.chiamata, e la sua prova A2 ricopia smarcato()
                         senza CHIAMA_PESO, quindi boccerebbe
                         un'implementazione corretta.
     _q-l15.js:224       stesso difetto del raggio minimo

   uso:  node strumenti/_t-l14b.js --elenco
         node strumenti/_t-l14b.js --out fuori/l14.html
         node strumenti/_t-l14b.js --dentro
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

{
  nome: "1/12 Touch5.start: PASSAGGIO apre la posa al posto di doFiltrante",
  cerca:
`        else if(bt.act==='through') doFiltrante(t, humanSprint(t));
        else if(bt.act==='swap') cambiaGiocatore(t);
        /* L1.6 — i dischi nuovi. Tutti e quattro vivono sulla
           PRESSIONE, come il passaggio: il loro rilascio resta inerte
           (nessun ramo in Touch5.chiudi), quindi nessun touchcancel
           puo' produrre un calcio che il dito non ha chiesto. */`,
  metti:
`/* L1.4 — il disco del passaggio non esegue piu' alla pressione:
           apre la POSA (l'anticipo del gesto parte subito, come chiede
           la tabella del §4) e il calcio vive sul RILASCIO, dove il
           trascinamento ha ormai detto chi e quanto alto. doFiltrante
           resta per la tastiera, che non ha un trascinamento da leggere. */
        else if(bt.act==='through') apriPassaggioL14(t, id);
        else if(bt.act==='swap') cambiaGiocatore(t);
        /* L1.6 — i dischi nuovi. TRE dei quattro vivono sulla PRESSIONE
           (pass, cross, e il disco difensivo): il loro rilascio resta
           inerte, quindi nessun touchcancel puo' produrre un calcio che
           il dito non ha chiesto. IL QUARTO NO, DA OGGI (26 ago 2026):
           il disco PASSAGGIO ('through') apre una POSA alla pressione e
           calcia al RILASCIO, perche' e' l'unico che si MIRA — e una
           mira che si esegue prima di aver finito di mirare non e' una
           mira. Il suo touchcancel non calcia lo stesso: chiude la posa
           e basta (Legge 4), ed e' scritto nel ramo di Touch5.chiudi. */`,
},

{
  nome: "2/12 Touch5.chiudi: il rilascio del passaggio esegue, cancel/morto chiudono",
  cerca:
`      const tr=this.trascina(id,true);
      const lettura=(bt.act==='shot' && a && !a.morto && a.carica) ? tr : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t, lettura);
      }`,
  metti:
`      const tr=this.trascina(id,true);
      const lettura=(bt.act==='shot' && a && !a.morto && a.carica) ? tr : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t, lettura);
      }
      /* =================================================================
         L1.4 — IL PASSAGGIO VIVE SUL RILASCIO, con le stesse tre domande
         del tiro qui sopra: la posa e' di questo dito? il sistema si e'
         preso il dito (touchcancel, Legge 4), o l'atto e' morto per
         spostamento? — allora la posa si chiude SENZA calciare, e se
         l'atto era morto la CORSA del chiamato resta: e' l'uno-due.
         Altrimenti il rilascio esegue: appoggio senza trascinamento,
         passaggio mirato col trascinamento.
         LA LETTURA E' LA STESSA «tr» del tiro e della scivolata — il
         campione anteriore di 60 ms preso una volta sola, sopra, prima
         del delete. La prima stesura di questa toppa ne prendeva una
         seconda tutta sua: sarebbe un anello di otto posizioni percorso
         due volte a ogni dito che si stacca, cioe' esattamente quello
         che il commento riancorato qui sopra dice di aver evitato.
         E' un ELSE IF, non un IF: sotto questa graffa la catena continua
         con 'slide' e 'swap', e un ramo indipendente li orfanerebbe. */
      else if(bt.act==='through'){
        if(a && a.passa){
          if(annulla || a.morto || G.paused) this.chiudiPassaL14(a.passa);
          else eseguiPassaggioL14(a.passa, tr, a.bersaglio);
        }
      }`,
},

{
  nome: "3/12 Touch5.chiudiPassaL14 accanto a chiudiCarica",
  cerca:
`  chiudiCarica(p){
    if(p && p.charge>=0 && !p.chargeGo && p.chargeKind==='tiro') chiudiAnticipo(p);
  },`,
  metti:
`  chiudiCarica(p){
    if(p && p.charge>=0 && !p.chargeGo && p.chargeKind==='tiro') chiudiAnticipo(p);
  },

  /* L1.4 — la gemella per la POSA DEL PASSAGGIO: chiude senza calciare,
     sul giocatore che la teneva, con le stesse tre condizioni. Una posa
     orfana non e' innocua per la stessa ragione della carica: vale
     slow = 0,45 in updatePlayer finche' resta aperta. */
  chiudiPassaL14(p){
    if(p && p.charge>=0 && !p.chargeGo && p.chargeKind==='passo') chiudiAnticipo(p);
  },`,
},

{
  nome: "4/12 muoreAtto: la posa del passaggio si chiude, la corsa resta",
  cerca:
`    a.morto=true;
    if(a.carica){ this.chiudiCarica(a.carica); a.carica=null; }`,
  metti:
`    a.morto=true;
    if(a.carica){ this.chiudiCarica(a.carica); a.carica=null; }
    /* L1.4 — anche la posa del passaggio si chiude subito, e per la
       stessa ragione (slow 0,45). La CORSA del chiamato invece NON si
       tocca: vive sul ricevente (chiamataT) ed e' proprio cio' che
       l'annullo oltre 96 px vuole ottenere — l'uno-due senza palla. */
    if(a.passa){ this.chiudiPassaL14(a.passa); a.passa=null; }`,
},

{
  nome: "5/12 azzera: nessuna posa di passaggio sopravvive alle dita alzate",
  cerca:
`      if(bt.act==='shot' && (!a || a.carica)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }`,
  metti:
`      if(bt.act==='shot' && (!a || a.carica)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
      /* L1.4 — stessa regola per la posa del passaggio: un atto senza
         dito non esiste, e la sua posa si chiude senza calciare. */
      if(bt.act==='through' && a && a.passa) this.chiudiPassaL14(a.passa);`,
},

{
  nome: "6/12 Touch5.passo: il ri-armo chiude anche la posa del passaggio",
  cerca:
`      if(d && d.act!==a.act){
        if(a.carica) this.chiudiCarica(a.carica);`,
  metti:
`      if(d && d.act!==a.act){
        if(a.carica) this.chiudiCarica(a.carica);
        /* L1.4 — il verbo nuovo non eredita la posa del passaggio, come
           non eredita la carica del tiro: si chiude senza calciare. */
        if(a.passa){ this.chiudiPassaL14(a.passa); a.passa=null; }`,
},

{
  nome: "7/12 il tetto SHOT_HARDCAP non trasforma una posa di passaggio in un tiro",
  cerca:
`      p.charge+=dt;
      if(p.charge>SHOT_HARDCAP) releaseCharge(t);`,
  metti:
`      p.charge+=dt;
      /* L1.4 — la posa del passaggio NON ha il tetto del tiro: senza
         questa guardia, tenere PASSA per 1,25 s faceva partire
         releaseCharge, cioe' UN TIRO che l'anteprima non aveva mai
         promesso. E il tetto qui non serve: l'uno-due chiede tenute piu'
         lunghe della corsa del chiamato (1,6 s), e la protezione dagli
         orfani sta gia' in chiudi, azzera, muoreAtto e nel ri-armo. */
      if(p.charge>SHOT_HARDCAP && p.chargeKind!=='passo') releaseCharge(t);`,
},

{
  nome: "8/12 il battito di L1.4 accanto a Touch5.passo",
  cerca:
`  Touch5.passo(dt);`,
  metti:
`  Touch5.passo(dt);
  /* L1.4 — il bersaglio del passaggio e la chiamata battono qui, sullo
     stesso orologio del motore d'ingresso (Legge 1) e DOPO il suo passo,
     cosi' un atto appena ri-armato non viene letto col verbo vecchio.
     A mani libere attraversa un oggetto vuoto ed esce. */
  aggiornaPassaggioL14();`,
},

{
  nome: "9/12 le funzioni di L1.4 (posa, punteggio, esecuzione) — la chiamata la fa L2.3",
  cerca:
`/* --- CROSS: balistica sui numeri di casa (z, gravita' 560, soglie`,
  metti:
`/* =====================================================================
   L1.4 — IL PASSAGGIO DEL DITO: appoggio al rilascio, mirato col
   trascinamento, chiamata, quota. (Progetto: _analisi/agente28.md §4;
   misure: strumenti/_q-l14.js.)

   La grammatica e' quella del §3: il trascinamento e' un VETTORE
   CONTINUO letto da Touch5.trascina — non ci sono settori, non ci sono
   coni, non ci sono confini da attraversare. La direzione INCLINA il
   punteggio del candidato, non SBARRA nessuno.
   ===================================================================== */
/* le sei costanti di questa voce. K e delta sono i valori di partenza
   del progetto (§11), delta confermato dal censimento B di _q-l14.js:
   fra i primi due candidati la mediana del distacco su partite vere e'
   165 punti (taglia 5), 128 (7), 99 (11), ed entro 20 punti cade il
   5,9% / 8,3% / 12,1% dei casi — la guardia rifiuta la mira ambigua di
   rado, non un caso su tre. L'aggancio da 60 punti tiene contro un
   tremore di +-8 px (che a saturazione sposta il punteggio di ~47) e
   cede a una mira vera a 45 gradi (~190): misurato dalla prova C di
   _q-l14.js, controllo negativo compreso. */
const L14_K     = 220;   // quanto la direzione inclina (agente28 §3.1)
const L14_SAT   = 52;    // DRAG_SAT: saturazione dell'ampiezza, px CSS
const L14_DELTA = 20;    // margine di guardia sui primi due
const L14_AGG   = 60;    // isteresi SUL BERSAGLIO (non sulla direzione)

/* apre la POSA del passaggio alla pressione: il gesto si prepara subito
   (il corpo si accenna, quotaAnticipo la disegna), ma NON esegue e NON
   matura da solo — chargeGo resta nullo, come la carica del tiro: e' il
   segno che distingue le tenute del dito dagli anticipi automatici.
   Il ritardo PASS_CAR_U non si paga piu' al rilascio: e' gia' passato
   durante la tenuta. */
function apriPassaggioL14(t, id){
  if(!puoPassare(t)) return;
  const p=ctrlPlayer(t);
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);   // stava caricando il tiro: cambia idea
  if(p.charge>=0) return;                             // un gesto gia' lanciato non si scavalca
  p.charge=0; p.chargeKind='passo'; p.chargeT=PASS_CAR_U; p.chargeGo=null; p.chargeClip='passaggio';
  const a=Touch5.atti[id];
  if(a){ a.passa=p; a.bersaglio=-1; }
  else Touch5.chiudiPassaL14(p);   // senza atto nessun rilascio potrebbe chiuderla
}

/* il punteggio di TUTTI i candidati e la scelta. base(q) e' IDENTICA a
   eseguiPassUmano — smarcato() + avanti*0,9 - |d-170|*0,4 — cosi' il
   passaggio senza mira e quello mirato parlano la stessa lingua e a
   trascinamento zero la scelta E' quella di sempre. Poi la direzione
   inclina: L14_K * dot(q_vers, drag_vers) * min(1, |drag|/L14_SAT).
   LE DUE GUARDIE:
     - margine delta: se i primi due stanno entro L14_DELTA la mira e'
       ambigua e, senza un aggancio gia' preso, si ricade sul bersaglio
       BASE — il gioco rifiuta di tirare a indovinare, e il rifiuto e'
       visibile perche' la scelta non si sposta;
     - aggancio: il bersaglio gia' scelto tiene il posto finche' un
       rivale non lo batte di L14_AGG punti CON margine non ambiguo. I
       tremori non lo smuovono, una mira vera si'. */
function bersaglioL14(p, ux, uy, sat, aggancio){
  const t=p.team;
  let base=null, baseS=-1e9;
  let b1=null, s1=-1e9, s2=-1e9, agg=null, sAgg=-1e9;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    const dx=q.x-p.x, dy=q.y-p.y, l=Math.max(1,len(dx,dy));
    const s0=smarcato(p,q,t) + (t===0? q.x-p.x : p.x-q.x)*0.9 - Math.abs(l-170)*0.4;
    if(s0>baseS){ baseS=s0; base=q; }
    const s=s0 + L14_K*((dx*ux+dy*uy)/l)*sat;
    if(aggancio>=0 && G.players[aggancio]===q){ agg=q; sAgg=s; }
    if(s>s1){ s2=s1; s1=s; b1=q; }
    else if(s>s2) s2=s;
  }
  if(!b1) return null;
  let scelto;
  if(agg) scelto = (b1!==agg && s1-s2>=L14_DELTA && s1>sAgg+L14_AGG) ? b1 : agg;
  else    scelto = (s1-s2<L14_DELTA) ? base : b1;
  return { scelto: scelto, base: base };
}

/* il battito, chiamato da step() subito dopo Touch5.passo: tiene la
   quota (con l'isteresi 40/32) e il bersaglio agganciato di ogni posa
   viva, e fa PARTIRE il chiamato quando il bersaglio nasce o cambia.
   Legge il campione VIVO (finale=false): l'anteprima e la chiamata
   seguono il dito adesso; lo scarto dei 60 ms appartiene al distacco. */
function aggiornaPassaggioL14(){
  for(const id in Touch5.atti){
    const a=Touch5.atti[id];
    if(a.act!=='through' || !a.passa || a.morto) continue;
    const tr=Touch5.trascina(id,false);
    if(!tr) continue;
    if(tr.armato){
      const sc=bersaglioL14(a.passa, tr.ux, tr.uy, Math.min(1,tr.l/L14_SAT), a.bersaglio);
      const nuovo=(sc && sc.scelto) ? G.players.indexOf(sc.scelto) : -1;
      if(nuovo>=0 && nuovo!==a.bersaglio){
        a.bersaglio=nuovo;
        /* LA CHIAMATA NON LA COSTRUISCE L1.4: LA CHIAMA. Il meccanismo e'
           quello di L2.3 — chiamaGiocatore, puntoChiamata, scansaAvversari,
           slancioChiamata, e il peso CHIAMA_PESO dentro il punteggio del
           ricevente — e L2.3 ha lasciato questo ingresso aperto apposta
           («il ricevente candidato parte quando il trascinamento arma,
           voce L1.4»). La prima stesura di questa toppa se lo rifaceva in
           casa con un punto FISSO a 150 unita', senza scansare nessuno,
           senza rifiutare portiere ed espulso, e su campi (chiamataT,
           chiamataX, chiamataY) che nel gioco non legge nessuno: sarebbe
           stata una chiamata morta accanto a una viva.
           Qui si decide solo la DIREZIONE, che e' l'unica idea buona di
           quel blocco: la linea del passaggio che continua (60%) piegata
           verso la porta (40%). Normalizzazione, scansamento, clamp, i tre
           rifiuti e il riavvio di aiT sono di chiamaGiocatore e restano
           suoi. Nessuna di quelle righe pesca un numero casuale. */
        const q=G.players[nuovo], pp=a.passa;
        const gxc=(q.team===0?FW:0);
        const dxc=q.x-pp.x, dyc=q.y-pp.y, dlc=Math.max(1,len(dxc,dyc));
        const vxc=gxc-q.x, vyc=FH/2-q.y, vlc=Math.max(1,len(vxc,vyc));
        chiamaGiocatore(q, dxc/dlc*0.6+vxc/vlc*0.4, dyc/dlc*0.6+vyc/vlc*0.4);
      }
    } else a.bersaglio=-1;   // rientrato sotto R_ARMA: torna la cosa sicura
  }
}

/* IL RILASCIO. tr e' la lettura del DISTACCO (60 ms scartati); su e
   bersaglio sono lo stato che la tenuta ha maturato. Non armato =
   appoggio sicuro, cioe' eseguiPassUmano identico a prima. Armato =
   mirato: il bersaglio agganciato (se ancora in campo), l'anticipo e la
   velocita' che CRESCONO con la corsa del ricevente — la filtrante
   emerge, non si nomina — e la quota dall'ampiezza.
   La quota e' la famiglia balistica del cross di casa: vz fra 140 e 210
   (cioe' 280*T con T fra 0,5 e 0,75), tempo di volo vz/280, velocita' =
   distanza/tempo cosi' il pallone RICADE sul ricevente, che intanto ci
   va sotto perche' b.crossTo lo chiama (il ramo di aiDecide esiste gia').
   Nel fotogramma del calcio la quota decide il gate della raccolta
   (Z_SOPRA_TESTA): rasoterra si intercetta, alta si scavalca. */
function eseguiPassaggioL14(p, tr, bersaglio){
  if(p && p.charge>=0 && !p.chargeGo && p.chargeKind==='passo') chiudiAnticipo(p);
  if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return;
  if(!tr || !tr.armato){ eseguiPassUmano(p); return; }
  const t=p.team, pi=G.players.indexOf(p), b=G.ball;
  if(b.owner!==pi && len(b.x-p.x,b.y-p.y)>KICK_R) return;
  /* LA SCELTA SI RIFA' AL DISTACCO, col bersaglio agganciato come
     titolare: e' la stessa elezione della tenuta ma sulla lettura dei
     60 ms scartati — la decisione finale non puo' vivere ne' su un
     aggancio invecchiato ne' sulla deriva del polpastrello. L'aggancio
     resta protetto da L14_AGG, quindi il tremore non ribalta il
     rilascio; una mira vera arrivata negli ultimi decimi si'. */
  const sc=bersaglioL14(p, tr.ux, tr.uy, Math.min(1,tr.l/L14_SAT), bersaglio);
  const best=sc && sc.scelto;
  if(!best){ eseguiPassUmano(p); return; }
  const bi=G.players.indexOf(best);
  /* l'anticipo cresce con la corsa del ricevente: da fermo e' il lead di
     eseguiPassUmano (0,32), in corsa piena quello di eseguiFiltrante
     (0,55). Continuo, senza soglie: la filtrante e' emergente.
     E il punto di mira resta NEL CAMPO: un chiamato che corre lungo la
     riga non deve ricevere un pallone in rimessa laterale — misurato dal
     banco: senza il morsetto la palla usciva e il ricevente non esisteva. */
  const fat=Math.min(1, len(best.vx,best.vy)/P_SPEED);
  const lead=0.32+0.23*fat;
  /* ...ma l'anticipo non supera mai META' della distanza dal ricevente:
     a un chiamato in corsa a due passi il lead pieno (0,55 s di sprint,
     ~110 unita') mandava il pallone piu' lontano di quanto lui possa
     coprire durante il volo — misurato dal banco: la palla scavalcava
     l'uomo a 100 unita' e usciva dal campo. */
  const d0=len(best.x-p.x,best.y-p.y);
  let ax=best.vx*lead, ay=best.vy*lead;
  const al=len(ax,ay), amax=d0*0.5;
  if(al>amax && al>0.001){ ax*=amax/al; ay*=amax/al; }
  const tx=clamp(best.x+ax, 16, FW-16), ty=clamp(best.y+ay, 16, FH-16);
  const dx=tx-p.x, dy=ty-p.y, l=Math.max(1,len(dx,dy));
  p.chargeClip='filtrante';
  const spdP=clamp(300+l*0.9,320,520), spdF=clamp(380+l*1.1,420,640);
  const speed=spdP+(spdF-spdP)*fat;
  if(kickBall(p, dx/l, dy/l, speed, 0)){
    b.vz=0;                            // rasoterra: kickBall sopra 500 metterebbe quota
    b.passTo=bi;
    /* la filtrante emersa si conta quando il ricevente e' un chiamato in
       corsa: e' la definizione del gioco (p.chiamata, il cronometro di
       L2.3), non una soglia scelta */
    if(best.chiamata>0) G.stats.filtranti[t]=(G.stats.filtranti[t]||0)+1;
    Audio5.kick(0.35+0.15*fat);
    if(t===0 && !G.cpu[0]) Tut.notify('pass');
  }
}

/* --- CROSS: balistica sui numeri di casa (z, gravita' 560, soglie`,
},

{
  nome: "10/12 il commento di L1.5 si rettifica in chiaro",
  cerca:
`         Il disco piccolo quando dice PASSAGGIO non ha nessun ramo qui:
         quel verbo vive sulla pressione e il suo rilascio resta inerte
         com'era. */`,
  metti:
`         IL DISCO PICCOLO QUANDO DICE PASSAGGIO HA UN RAMO QUI, DAL 26
         AGOSTO 2026, e questa frase e' la rettifica di quella di ieri —
         che diceva «non ha nessun ramo qui: quel verbo vive sulla
         pressione e il suo rilascio resta inerte com'era». Con L1.4 il
         passaggio si MIRA col trascinamento, quindi deve partire quando
         il dito ha finito di mirare, cioe' al rilascio. Le tre guardie
         del raddoppio qui sotto restano parola per parola le sue. */`,
},

{
  nome: "11/12 Touch5.posaDi: chi tiene la posa di questo giocatore",
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

  /* L1.4 — QUALE DITO TIENE LA POSA DEL PASSAGGIO DI QUESTO GIOCATORE.
     Stessa forma di contiene() qui sopra, e per la stessa ragione: non
     c'e' nessuno stato da accendere e da spegnere, quindi non c'e'
     nessun modo di lasciarlo appeso — quando l'atto smette di esistere
     la risposta cambia da sola. Serve a segniGuida, che e' una funzione
     PURA e non puo' leggere un campo che qualcuno deve ricordarsi di
     azzerare al fischio, all'espulsione e al touchcancel.
     Torna l'id del tocco, oppure null. Gli atti vivi sono al massimo
     tre: e' una scansione, non un costo. */
  posaDi(p){
    for(const id in this.atti){
      const a=this.atti[id];
      if(a.passa===p && !a.morto && this.btnTouch[id]) return id;
    }
    return null;
  },`,
},

{
  nome: "12/12 segniGuida: la linea del passaggio mirato",
  cerca:
`    }else if(p.chargeGo && p.chargeKind==='passo'){`,
  metti:
`    }else if(!p.chargeGo && p.chargeKind==='passo'){
      /* =================================================================
         L1.4 — LA LINEA DEL PASSAGGIO MIRATO, e senza questo ramo la voce
         spegnerebbe una conquista invece di aggiungerne una.
         La posa del passaggio nasce con chargeGo NULLO — e' la firma
         delle tenute del dito, quella che le distingue dagli anticipi che
         maturano da soli — quindi non cade ne' nel ramo del tiro qui
         sopra (che chiede chargeKind 'tiro') ne' in quello del passaggio
         automatico qui sotto (che chiede chargeGo). Senza questo ramo
         segniGuida tornerebbe vuota e tenendo PASSAGGIO non si vedrebbe
         PIU' NIENTE: il cancello _q-linea.js lo direbbe 36 volte su 36.
         IL BERSAGLIO SI CHIEDE A bersaglioL14, cioe' ALLA STESSA
         FUNZIONE CHE ESEGUIRA' IL CALCIO. E' la legge di L3.1 alla
         lettera: la promessa della linea e l'esecuzione del calcio
         passano dallo stesso testo, quindi non possono divergere. E la
         lettura e' quella VIVA (finale=false): lo scarto dei 60 ms
         appartiene al distacco, non all'anteprima.
         Sopra L14_SU la palla si alza, e allora si promette un arco: una
         linea dritta prometterebbe un rasoterra che non arriva. */
      const idp = Touch5.posaDi(p);
      if(idp!==null){
        const tr = Touch5.trascina(idp, false);
        if(tr && !tr.armato){
          /* IL TAP HA UNA PROMESSA ANCHE LUI, ed e' la seconda meta'
             della legge di L3.1. Sotto R_ARMA non c'e' nessuna mira,
             quindi il rilascio fara' l'appoggio sicuro: eseguiPassUmano,
             che sceglie con scegliSmarcato. La linea deve dire QUELLO —
             la stessa funzione, con lo stesso anticipo di 0,32 s — se no
             chi posa il dito non vede niente e non impara mai che il tap
             e' un verbo. La prima stesura di questo ramo pretendeva
             tr.armato e lasciava lo schermo muto: il cancello della
             linea lo ha detto 36 volte su 36. */
          const b2 = scegliSmarcato(p);
          if(b2) out.push({tipo:'linea-passaggio', x0w:b.x, y0w:b.y,
                           x1w:b2.x+b2.vx*0.32, y1w:b2.y+b2.vy*0.32});
        }else if(tr){
          const sc = bersaglioL14(p, tr.ux, tr.uy, Math.min(1,tr.l/L14_SAT), -1);
          const q = sc && sc.scelto;
          /* le stesse chiavi degli altri due rami — x0w/y0w/x1w/y1w sono
             coordinate di MONDO, e disegnaLineaGuida disegna sotto la
             trasformazione della camera. La linea parte dal PALLONE, non
             dal piede: e' il pallone che si muovera'. Sempre rasoterra:
             la palla alta su questo disco non esiste piu' (vedi il
             cappello della toppa), e promettere un arco sarebbe
             promettere un calcio che non parte. */
          if(q) out.push({tipo:'linea-passaggio', x0w:b.x, y0w:b.y, x1w:q.x, y1w:q.y});
        }
      }
    }else if(p.chargeGo && p.chargeKind==='passo'){`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l14b.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l14b.html';
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

/* GLI ATTESI, e due di loro sono CINTURE contro un ritorno.
   - i campi 'q.chiamataT', '.chiamataT>' e 'chiamataX=' a ZERO: sono la
     chiamata fatta in casa che questa seconda stesura ha cancellato. Se
     riapparissero, vorrebbe dire che qualcuno ha rimesso il doppione. Si
     cercano con la punteggiatura del CODICE e non come parole nude,
     perche' i commenti devono poter nominare cio' che spiegano — e qui
     lo spiegano.
   - 'chiamaGiocatore(q, dxc/dlc*0.6' a UNO: e' la prova che la chiamata
     la fa L2.3 e non L1.4.
   - 'Touch5.posaDi(p)' a UNO: senza di lui la linea di guida muore, e
     muore in silenzio. */
const attesi = [
  ['function apriPassaggioL14(', 1],
  ['function bersaglioL14(', 1],
  ['function aggiornaPassaggioL14(', 1],
  ['function eseguiPassaggioL14(', 1],
  ['chiamaGiocatore(q, dxc/dlc*0.6', 1],
  ['const idp = Touch5.posaDi(p);', 1],
  ['posaDi(p){', 1],
  ['best.chiamata>0', 1],
  ["else if(bt.act==='through') doFiltrante(t, humanSprint(t));", 0],
  ['q.chiamataT', 0],
  ['.chiamataT>', 0],
  ['chiamataX=', 0],
  ['chiamaCorsaL14(', 0],
  ['L14_CORSA', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
