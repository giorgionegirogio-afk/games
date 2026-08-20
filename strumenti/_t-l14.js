/* =====================================================================
   _t-l14.js — L1.4: IL DISCO VICINO CON PALLA — il passaggio mirato,
   la chiamata, l'uno-due, la quota. (Voce L1.4 di _analisi/agente28.md.)

   Toppa cerca/sostituisci sul modello di strumenti/_t-l04b.js: legge
   CALCETTO-il-gioco.html (o --in), sostituisce TREDICI ancoraggi ESATTI
   e scrive la copia in --out. Senza --out scrive accanto all'originale
   col suffisso .l14.html: mai sull'originale, se non con --dentro. Se
   anche un solo ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma
   con codice 1, dice quale, e non scrive niente.

   uso:
     node strumenti/_t-l14.js --out fuori/l14.html
     node strumenti/_t-l14.js --in altro.html --out x.html
     node strumenti/_t-l14.js --elenco

   ---------------------------------------------------------------------
   LA TESI. Oggi il disco PASSAGGIO esegue ALLA PRESSIONE (doFiltrante),
   la mira viene dalla LEVETTA (canale gia' pieno: e' la corsa), e la
   scelta del ricevente passa da un cono duro con dot>0,5. Il cancello
   strumenti/_q-l14.js lo ha misurato sul gioco di oggi: il pallone parte
   alla pressione 24 volte su 24, e 8 direzioni trascinate producono al
   massimo 2 riceventi distinti per configurazione.

   Da questa toppa (agente28.md §4, tabella IO):
     · APPOGGIO SICURO — PASSA senza trascinamento: esegue al RILASCIO,
       col ricevente di eseguiPassUmano (il piu' smarcato). La posa
       d'anticipo parte alla PRESSIONE, quindi su questo ramo il ritardo
       PASS_CAR_U (50 ms) non si paga piu' al momento del calcio;
     · PASSAGGIO MIRATO — PASSA piu' trascinamento (letto da
       Touch5.trascina, il motore L1.1):
           punteggio(q) = base(q) + K*dot(q_vers, drag_vers)*min(1,|drag|/52)
       con K = 220 e base(q) IDENTICA a eseguiPassUmano (smarcato +
       avanti*0,9 - |d-170|*0,4). La direzione INCLINA, non SBARRA:
       niente settori, niente coni, niente confini;
     · MARGINE DI GUARDIA delta = 20: se i primi due stanno entro delta
       la mira e' ambigua e si ricade sul bersaglio BASE (quello senza
       trascinamento) invece di tirare a indovinare. Misurato dal
       censimento B di _q-l14.js su partite vere (12 direzioni ogni mezzo
       secondo di possesso): mediana del distacco fra i primi due 165
       (taglia 5), 128 (7), 99 (11); entro 20 punti cade il 5,9% / 8,3% /
       12,1% dei casi. delta=20 rifiuta quindi una mira su venti a taglia
       5, non una su tre — e' il valore di partenza del progetto,
       confermato dalla misura;
     · AGGANCIO DEL BERSAGLIO, isteresi L14_AGG = 60 punti: una volta
       scelto un uomo, per soffiargli il posto un rivale deve batterlo di
       60, cioe' (a saturazione) 0,27 di coseno — un tremore di +-8 px
       sposta il punteggio di ~47 e NON basta, una mira vera a 45 gradi
       sposta di ~190 e basta. Misurato dalla prova C di _q-l14.js con
       il controllo negativo (L14_AGG=0): senza isteresi corrono in due,
       con l'isteresi corre uno solo e il ricevente non balla;
     · LA CHIAMATA: appena il trascinamento arma, il candidato PARTE —
       corsa di 1,6 s (campo chiamataT sul ricevente, ramo in cima ad
       aiDecide, sprint da aiVuoleSprint), indipendente dal dito;
     · CHIAMA SENZA PASSARE: oltre R_ANNULLA = 96 px l'atto muore (gia'
       L1.1), il rilascio non calcia, la corsa RESTA. E' l'uno-due lento;
     · FILTRANTE EMERGENTE: nessun verbo nuovo — l'anticipo sulla corsa
       del ricevente cresce col SUO stato di moto: lead da 0,32 (fermo,
       il valore di eseguiPassUmano) a 0,55 (in corsa piena, il valore di
       eseguiFiltrante), e cosi' la velocita' del pallone (320-520 da
       fermo, fino a 420-640 sulla corsa: le due rampe gia' del gioco);
     · QUOTA: ampiezza oltre QUOTA_SU = 40 px (isteresi a 32) alza la
       palla; vz cresce con l'ampiezza da 140 a 210 — la stessa famiglia
       del cross di casa (vz = 280*T con T fra 0,5 e 0,75) — e la
       velocita' si ricava perche' il pallone ricada sul ricevente
       (t_volo = vz/280). Il ricevente della palla alta si scrive su
       b.crossTo, cosi' VA sotto il pallone col ramo che il gioco ha gia';
     · TAP oltre 1,25 s: la tenuta del passaggio NON ha il tetto del tiro
       (SHOT_HARDCAP faceva partire releaseCharge, cioe' UN TIRO, da una
       posa di passaggio): l'uno-due richiede tenute piu' lunghe di 1,6 s
       e la protezione dagli orfani vive gia' in chiudi/azzera/muoreAtto/
       ri-armo.

   LE QUATTRO LEGGI: la tenuta vive su Touch5.tempo (accumulatore di
   step, Legge 1); si leggono solo posizioni e stati, mai velocita' del
   dito (Legge 2 — la velocita' del RICEVENTE e' stato del mondo, ed e'
   il canale che il §3 del progetto assegna esplicitamente al passaggio);
   questa toppa non disegna nulla (Legge 3 — l'anteprima e' la voce
   L3.1); touchcancel e atto morto chiudono la posa SENZA calciare, il
   rilascio della levetta resta inerte (Legge 4).

   I COSTI, dichiarati:
     · mentre si tiene il disco PASSA il portatore va al 45% (la stessa
       riga "slow" della carica del tiro: qualunque tenuta col pallone
       paga il 55%, agente28.md §0). Prima la pressione pagava solo i
       50 ms dell'anticipo; adesso si paga per la durata della mira;
     · il tap secco passa al RILASCIO, non piu' 50 ms dopo la pressione:
       per un tap di ~100 ms la latenza cresce di ~50 ms, per uno di
       50 ms non cambia. In cambio il passaggio si puo' mirare e si puo'
       DISFARE (oltre 96 px), che alla pressione era impossibile;
     · G.stats.filtranti si incrementa solo quando il ricevente e' un
       chiamato in corsa (chiamataT>0): la tastiera (doFiltrante) conta
       come prima, il dito conta le filtranti emergenti.

   COSA NON CAMBIA: la tastiera (doPass, doFiltrante, eseguiFiltrante,
   doCross) non cambia di un byte; la CPU (eseguiAiPass) nemmeno; a mani
   libere aggiornaPassaggioL14 attraversa un oggetto vuoto ed esce — le
   partite CPU contro CPU restano identiche al bit (verificato: stesso
   seme, censimento B di _q-l14.js identico prima e dopo la toppa).
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

/* 1 — la pressione sul disco PASSA apre la POSA, non esegue piu' */
{
  nome: '1/13 Touch5.start: PASSA apre la posa al posto di doFiltrante',
  cerca:
`        else if(bt.act==='through') doFiltrante(t, humanSprint(t));`,
  metti:
`        /* L1.4 — il disco del passaggio non esegue piu' alla pressione:
           apre la POSA (l'anticipo del gesto parte subito, come chiede
           la tabella del §4) e il calcio vive sul RILASCIO, dove il
           trascinamento ha ormai detto chi e quanto alto. doFiltrante
           resta per la tastiera, che non ha un trascinamento da leggere. */
        else if(bt.act==='through') apriPassaggioL14(t, id);`,
},

/* 2 — il rilascio del disco PASSA esegue; cancel e morte no */
{
  nome: '2/13 Touch5.chiudi: il rilascio del passaggio esegue, cancel/morto chiudono',
  cerca:
`      const a=this.atti[id];
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t);
      }
      return;`,
  metti:
`      const a=this.atti[id];
      /* L1.4 — la lettura del distacco (il campione anteriore di 60 ms,
         lo scarto della deriva del polpastrello) si prende PRIMA che
         l'atto sparisca, perche' trascina legge this.atti. */
      const trPassa = (bt.act==='through' && a && !a.morto && a.passa) ? this.trascina(id,true) : null;
      delete this.atti[id];
      if(bt.act==='shot'){
        if(a && !a.carica){ /* la carica non e' di questo dito: non si tocca */ }
        else if(annulla || (a && a.morto)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
        else if(!G.paused) releaseCharge(bt.t);
      }
      /* L1.4 — il passaggio vive sul rilascio, con le stesse tre domande
         del tiro qui sopra: la posa e' di questo dito? il sistema si e'
         preso il dito, o l'atto e' morto per spostamento? — allora la
         posa si chiude SENZA calciare (Legge 4; se l'atto era morto la
         CORSA del chiamato resta: e' l'uno-due). Altrimenti il rilascio
         esegue: appoggio senza trascinamento, mirato col trascinamento. */
      if(bt.act==='through' && a && a.passa){
        if(annulla || a.morto || G.paused) this.chiudiPassaL14(a.passa);
        else eseguiPassaggioL14(a.passa, trPassa, a.su, a.bersaglio);
      }
      return;`,
},

/* 3 — la gemella di chiudiCarica per la posa del passaggio */
{
  nome: '3/13 Touch5.chiudiPassaL14 accanto a chiudiCarica',
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

/* 4 — l'atto che muore chiude anche la posa del passaggio */
{
  nome: '4/13 muoreAtto: la posa del passaggio si chiude, la corsa resta',
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

/* 5 — azzera: zero dita, stato neutro, anche per la posa del passaggio */
{
  nome: '5/13 azzera: nessuna posa di passaggio sopravvive alle dita alzate',
  cerca:
`      if(bt.act==='shot' && (!a || a.carica)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }`,
  metti:
`      if(bt.act==='shot' && (!a || a.carica)){ if(a) this.chiudiCarica(a.carica); else this.annullaCarica(bt.t); }
      /* L1.4 — stessa regola per la posa del passaggio: un atto senza
         dito non esiste, e la sua posa si chiude senza calciare. */
      if(bt.act==='through' && a && a.passa) this.chiudiPassaL14(a.passa);`,
},

/* 6 — il ri-armo chiude la posa del verbo vecchio */
{
  nome: '6/13 Touch5.passo: il ri-armo chiude anche la posa del passaggio',
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

/* 7 — il tetto del tiro non spara una posa di passaggio */
{
  nome: '7/13 il tetto SHOT_HARDCAP non trasforma una posa di passaggio in un tiro',
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

/* 8 — il battito del bersaglio e della chiamata, accanto al motore */
{
  nome: '8/13 il battito di L1.4 accanto a Touch5.passo',
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

/* 9 — le funzioni nuove, prima del cross */
{
  nome: '9/13 le funzioni di L1.4 (posa, punteggio, chiamata, esecuzione)',
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
const L14_SU    = 40;    // QUOTA_SU: da qui la palla si alza (px CSS)
const L14_GIU   = 32;    // isteresi della quota: rasoterra sotto questa
const L14_CORSA = 1.6;   // s di corsa del chiamato, indipendente dal dito

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
  if(a){ a.passa=p; a.su=false; a.bersaglio=-1; }
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

/* LA CHIAMATA: il candidato parte — 1,6 s di corsa, indipendente dal
   dito. La direzione e' la linea del passaggio che continua (60%) piegata
   verso la porta (40%): e' la corsa che rende naturale la filtrante, e
   il punto sta nel campo, mai fuori. Il campo chiamataT lo consuma
   aiDecide (il ramo in cima), lo sprint lo legge aiVuoleSprint, e il
   cronometro — come corsaArea, e per la stessa ragione — si spegne da
   solo e muore subito se il pallone passa all'avversario. */
function chiamaCorsaL14(q, p){
  const gx=q.team===0?FW:0;
  const dx=q.x-p.x, dy=q.y-p.y, l=Math.max(1,len(dx,dy));
  let ux=dx/l*0.6, uy=dy/l*0.6;
  const vx=gx-q.x, vy=FH/2-q.y, vl=Math.max(1,len(vx,vy));
  ux+=vx/vl*0.4; uy+=vy/vl*0.4;
  const ul=Math.max(0.001,len(ux,uy));
  q.chiamataT=L14_CORSA;
  q.chiamataX=clamp(q.x+ux/ul*150, 30, FW-30);
  q.chiamataY=clamp(q.y+uy/ul*150, 30, FH-30);
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
    if(tr.l>=L14_SU) a.su=true; else if(tr.l<=L14_GIU) a.su=false;
    if(tr.armato){
      const sc=bersaglioL14(a.passa, tr.ux, tr.uy, Math.min(1,tr.l/L14_SAT), a.bersaglio);
      const nuovo=(sc && sc.scelto) ? G.players.indexOf(sc.scelto) : -1;
      if(nuovo>=0 && nuovo!==a.bersaglio){
        a.bersaglio=nuovo;
        chiamaCorsaL14(G.players[nuovo], a.passa);
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
function eseguiPassaggioL14(p, tr, su, bersaglio){
  if(p && p.charge>=0 && !p.chargeGo && p.chargeKind==='passo') chiudiAnticipo(p);
  if(!p || p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return;
  if(!tr || !tr.armato){ eseguiPassUmano(p); return; }
  const t=p.team, pi=G.players.indexOf(p), b=G.ball;
  if(b.owner!==pi && len(b.x-p.x,b.y-p.y)>KICK_R) return;
  const alto = tr.l>=L14_SU ? true : (tr.l<=L14_GIU ? false : !!su);
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
  if(alto){
    p.chargeClip='cross';
    const vz=140+70*Math.min(1,(tr.l-L14_SU)/(Touch5.R_ANNULLA-L14_SU));
    const T=vz/280;
    const speed=clamp(l/T, 320, 800);
    if(kickBall(p, dx/l, dy/l, speed, 0)){
      b.vz=vz;
      /* DUE INDIRIZZI, DUE DIRITTI. crossTo manda il ricevente sotto il
         pallone (il ramo di aiDecide del punto di caduta); passTo gli da'
         il DIRITTO DI CONTROLLO: la raccolta ammette solo sp<420 oppure
         il ricevitore designato, e il muro dei corpi lo esenta. Il cross
         di sempre lascia passTo=-1 perche' non designa nessuno; questa
         palla alta designa un uomo, ed e' un passaggio. Senza questa
         riga il banco ha misurato l'arrivo a 727 unita'/s: nessuno
         poteva controllarlo e il pallone rotolava fuori dal fondo. */
      b.passTo=bi; b.crossTo=bi;
      G.stats.cross[t]=(G.stats.cross[t]||0)+1;
      Audio5.kick(0.6);
      if(t===0 && !G.cpu[0]) Tut.notify('pass');
    }
    return;
  }
  p.chargeClip='filtrante';
  const spdP=clamp(300+l*0.9,320,520), spdF=clamp(380+l*1.1,420,640);
  const speed=spdP+(spdF-spdP)*fat;
  if(kickBall(p, dx/l, dy/l, speed, 0)){
    b.vz=0;                            // rasoterra: kickBall sopra 500 metterebbe quota
    b.passTo=bi;
    /* la filtrante emersa si conta quando il ricevente e' un chiamato in
       corsa: e' la definizione del gioco (chiamataT), non una soglia */
    if(best.chiamataT>0) G.stats.filtranti[t]=(G.stats.filtranti[t]||0)+1;
    Audio5.kick(0.35+0.15*fat);
    if(t===0 && !G.cpu[0]) Tut.notify('pass');
  }
}

/* --- CROSS: balistica sui numeri di casa (z, gravita' 560, soglie`,
},

/* 10 — il campo della chiamata nasce azzerato al calcio d'inizio */
{
  nome: '10/13 resetKickoff: la chiamata non sopravvive al fischio',
  cerca:
`    p.corsaArea=0;                                              // e la corsa in area`,
  metti:
`    p.corsaArea=0;                                              // e la corsa in area
    p.chiamataT=0;                                              // e la chiamata (L1.4)`,
},

/* 11 — lo sprint del chiamato */
{
  nome: '11/13 aiVuoleSprint: il chiamato ci va di corsa',
  cerca:
`  if(p.corsaArea) return true;      // chi attacca l'area ci va di corsa`,
  metti:
`  if(p.corsaArea) return true;      // chi attacca l'area ci va di corsa
  if(p.chiamataT>0) return true;    // e il chiamato pure (L1.4)`,
},

/* 12 — il cronometro della chiamata, accanto a quello della corsa in area */
{
  nome: '12/13 aiMove: la chiamata e\' un cronometro, non un interruttore',
  cerca:
`  if(p.corsaArea>0) p.corsaArea=Math.max(0, p.corsaArea-dt);
  if(carrier && carrier.team!==myTeam) p.corsaArea=0;`,
  metti:
`  if(p.corsaArea>0) p.corsaArea=Math.max(0, p.corsaArea-dt);
  /* L1.4 — la chiamata e' un cronometro come corsaArea, e per la stessa
     ragione: si spegne da solo, e muore subito se il pallone e' in piedi
     all'avversario. */
  if(p.chiamataT>0) p.chiamataT=Math.max(0, p.chiamataT-dt);
  if(carrier && carrier.team!==myTeam){ p.corsaArea=0; p.chiamataT=0; }`,
},

/* 13 — il ramo della chiamata in cima ad aiDecide */
{
  nome: '13/13 aiDecide: il chiamato corre dove la chiamata lo manda',
  cerca:
`  if(b.owner<0 && b.z>0 && b.crossTo===G.players.indexOf(p)){
    const c=puntoCaduta(b);
    p.aiTX=clamp(c[0], 30, FW-30);
    p.aiTY=clamp(c[1], 30, FH-30);
    p.corsaArea=CROSS_CORSA_T;
    return;
  }`,
  metti:
`  if(b.owner<0 && b.z>0 && b.crossTo===G.players.indexOf(p)){
    const c=puntoCaduta(b);
    p.aiTX=clamp(c[0], 30, FW-30);
    p.aiTY=clamp(c[1], 30, FH-30);
    p.corsaArea=CROSS_CORSA_T;
    return;
  }
  /* L1.4 — LA CHIAMATA: il compagno chiamato dal trascinamento corre nel
     punto della chiamata finche' il cronometro vive (1,6 s, si spegne da
     solo e muore se la palla passa all'avversario: vedi aiMove). Sta
     sotto il ramo del cross — un pallone gia' in volo verso di me vince —
     e sopra tutto il resto: una corsa chiamata non si ripianifica. */
  if(p.chiamataT>0){
    p.aiTX=p.chiamataX; p.aiTY=p.chiamataY;
    return;
  }`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l14.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l14.html';
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
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* controlli dopo la sostituzione: le funzioni nuove esistono una volta,
   i chiamanti sono dove ci si aspetta, e la costante dell'aggancio e'
   scritta una volta sola (il controllo negativo di _q-l14.js la cerca
   per costruire la variante senza isteresi). */
const attesi = [
  ['function apriPassaggioL14(', 1], ['function bersaglioL14(', 1],
  ['function chiamaCorsaL14(', 1], ['function aggiornaPassaggioL14(', 1],
  ['function eseguiPassaggioL14(', 1],
  ['apriPassaggioL14(t, id)', 2], ['aggiornaPassaggioL14();', 1],
  ['chiudiPassaL14', 6],
  ['L14_AGG   = 60', 1],
  ['p.chiamataT', 7], ['chiamataX', 2], ['chiamataY', 2],
  ["else if(bt.act==='through') doFiltrante", 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
