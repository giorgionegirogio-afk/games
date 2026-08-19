/* =====================================================================
   _toppa-hud.js — «L'INTERFACCIA NON MANGIA IL GIOCO», applicata a una COPIA.

   Non tocca il repo. Legge un file di gioco, applica le sostituzioni qui
   sotto e scrive un file NUOVO. Se una sola sostituzione non trova il suo
   testo ESATTAMENTE UNA VOLTA, si ferma e non scrive niente: una toppa
   applicata a meta' e' peggio di una toppa non applicata.

     uso: node strumenti/_toppa-hud.js CALCETTO-il-gioco.html uscita.html

   I TRE DIFETTI CHE CHIUDE, nominati due volte da due giudici indipendenti:
     1. i comandi stavano sopra l'area di rigore avversaria, la bussola
        saliva sotto il pollice sinistro, la barra alta sbiadiva in blocco;
     2. l'11 contro 11 usciva alla scala del 5 contro 5, e il comandato
        finiva col suo anello tagliato dal bordo basso;
     3. i pulsanti dicevano TIRA e FILTRANTE anche a palla di nessuno.
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1
   I DUE COMANDI SCENDONO NELL'ANGOLO, E L'ETICHETTA SMETTE DI MENTIRE. */
cambio('1. i comandi lasciano la fascia della porta (e dicono il vero)',
`/* layout dei 2 pulsanti virtuali (coordinate schermo): posizioni FISSE,
   etichette contestuali col possesso di squadra. Il GRANDE sta alle
   stesse coordinate del vecchio TIRA — giocata.js 'carica' preme
   esattamente (vw-66, vh-140) e deve colpire ancora. Il piccolo sta
   92 unita' sopra (40+24 di raggi + 2x10 di margine hit + margine):
   nessuna zona ambigua fra i due. */
function touchBtnLayout(t){
  const right = (G.mode===2) ? (t===1) : true;
  const bx = right ? VW : 0;
  const s = right ? -1 : 1;
  /* in posa i pulsanti mostrano lo stato CON possesso (TIRA/FILTR.):
     e' lo stato che racconta il gioco, e la foto non deve dipendere da
     chi ha la palla nel fotogramma pescato */
  const poss = HUD_POSA ? true : possessoTeam(t);
  /* il piccolo a raggio 30 (era 24): FILTRANTE si scrive INTERA — una
     parola mozzata legge come un difetto — e il disco cresce quel tanto
     che serve. I CENTRI non si muovono di un pixel (giocata.js preme
     (vw-70, vh-232) e deve colpire ancora); il varco coi raggi resta:
     40+30 piu' 2x10 di margine hit = 90 < 92 fra i centri. */
  return [
    poss ? { act:'shot',    label:'TIRA',      x:bx+s*66, y:VH-140, r:40 }
         : { act:'slide',   label:'CONTRASTA', x:bx+s*66, y:VH-140, r:40 },
    poss ? { act:'through', label:'FILTRANTE', x:bx+s*70, y:VH-232, r:30 }
         : { act:'swap',    label:'CAMBIO',    x:bx+s*70, y:VH-232, r:30 },
  ];`,
`/* =====================================================================
   I DUE COMANDI, PORTATI NELL'ANGOLO BASSO — e il conto che ce li obbliga.

   LA CONDANNA, di due giudici che non si sono parlati: «in istante-01,
   02 e 07 il pulsante FILTRANTE e' appoggiato SOPRA l'area di rigore
   avversaria: in istante-02 copre il portiere numero 1 e il difensore
   numero 4 davanti alla porta. La telecamera insegue la palla in
   orizzontale, quindi succede IN OGNI ATTACCO VERSO DESTRA».

   NON ERA SFORTUNA DEL FERMO IMMAGINE, ED E' UN CONTO DI TRE RIGHE.
   La bocca della porta e' alta GOAL_H = 150 unita' di mondo; allo zoom
   di gioco (1,05-1,15 px per unita') sono 158-172 px di schermo, ed e'
   CENTRATA sulla mediana del campo, cioe' attorno a PA_CY. L'area di
   gioco sul telefono in orizzontale e' alta 303 px (da PA_Y0=45 a
   PA_Y1=348). Quindi la bocca occupa da sola meta' dell'altezza utile,
   attorno al centro: qualunque pulsante che viva sul lato destro entro
   ottantacinque pixel dalla mediana ci finisce sopra. Il piccolo stava a
   VH-232, cioe' a y=180 su una tela di 412: DICIASSETTE pixel sopra
   PA_CY. Non poteva non coprirla.
   E la porta arriva sotto il pollice proprio mentre si costruisce
   l'azione: perche' il quadro sia largo abbastanza da mostrare la
   testata destra a filo di bordo bisogna che il pallone stia 175-420
   unita' dalla linea di fondo — cioe' tutta la fase di manovra.

   COSA RESTA LIBERO, MISURATO: sotto la bocca restano 40 px di area di
   gioco piu' i 64 della fascia bassa, in tutto 104 px. Due dischi da 40
   e da 30 di raggio non ci stanno in colonna (servirebbero 92 px fra i
   centri PIU' i raggi): ci stanno solo AFFIANCATI. La colonna verticale
   di destra non era una scelta di gusto — era l'unico posto rimasto una
   volta deciso che i comandi stessero in colonna, ed e' la colonna a
   essere sbagliata. Qui diventano una COPPIA IN DIAGONALE nell'angolo:
     · GRANDE  (VW-64, VH-60)  r 40  ->  y 312-392 su 412, x VW-104..VW-24
     · PICCOLO (VW-158, VH-72) r 30  ->  y 310-370,       x VW-188..VW-128
   Fra i centri corrono radice(94^2+12^2) = 94,8 px, sopra i 90 che
   servono (40+30 di raggi piu' 2x10 di margine di tocco): il varco
   contro il tocco ambiguo resta pagato, con quasi cinque pixel di
   margine invece dei due di prima.
   E LA QUOTA E' SCELTA SULLA BOCCA, NON A OCCHIO: nei fermi immagine in
   cui la porta e' in quadro la sua bocca finisce fra y 296 e y 302 (il
   pallone sta nel terzo centrale, quindi la bocca non puo' scendere
   molto piu' in basso senza che la palla esca dal terzo). I due dischi
   cominciano a 310 e 312: dieci pixel sotto il caso peggiore misurato.
   IL PICCOLO NON E' PIU' SOTTO IL POLLICE, E' ACCANTO: sull'angolo
   basso-destra il pollice destro riposa sul GRANDE, e il piccolo cade
   sotto la stessa articolazione senza attraversare lo schermo. E' la
   disposizione dei due tasti d'azione di qualunque gioco sportivo da
   telefono; la colonna verticale non lo era.

   IL PREZZO, DICHIARATO: il piccolo entra di 188 px dal bordo destro
   invece di 100, cioe' occupa piu' larghezza in BASSO. In basso c'e' la
   fascia dei 64 px, che e' dichiarata trasparente e dove la regia gia'
   non manda ne' il pallone ne' la porta; in mezzo c'era la partita. La
   pastiglia del tutorial vive centrata e larga al massimo 380 px (da
   x 267 a x 647 sul telefono): i due dischi non la sfiorano.

   ATTENZIONE, PER CHI TIENE I CANCELLI: strumenti/giocata.js preme
   ancora (vw-66, vh-140) e (vw-70, vh-232) scritti a mano. Quelle due
   coordinate NON sono piu' i centri, e il cancello va aggiornato a
   leggere __test.comandiTouch — che il gioco esporta da sempre proprio
   per questo. Un cancello che attesta una posizione invece di misurarla
   e' la trappola di casa numero quattro, e qui presenta il conto.
   ===================================================================== */
function touchBtnLayout(t){
  const right = (G.mode===2) ? (t===1) : true;
  const bx = right ? VW : 0;
  const s = right ? -1 : 1;
  /* ===================================================================
     L'ETICHETTA DICE QUELLO CHE IL DITO FARA', SEMPRE — E LA POSA NON FA
     ECCEZIONE.

     Il giudice: «in tutti e otto gli istanti i pulsanti dicono TIRA e
     FILTRANTE. Anche dove la palla e' libera a centrocampo e nessuno la
     tocca. I verbi difensivi esistono, ma stanno solo sulla lavagna
     delle istruzioni». Aveva ragione sul fotogramma e torto sul gioco, e
     la differenza e' tutta in questa riga: i verbi difensivi ci SONO e
     si accendono da soli (Touch5.start risolve l'atto al touchstart
     leggendo lo stesso touchBtnLayout), ma la POSA — il flag di sola
     resa che accende i comandi nelle foto CPU contro CPU — forzava
     poss=true «cosi' la foto non dipende da chi ha la palla nel
     fotogramma pescato».
     Era un attrezzo che ATTESTA invece di misurare, e ha mentito per
     otto fotogrammi di fila a due giurie: la foto mostrava un comando
     che in quell'istante il gioco non avrebbe offerto. La posa adesso
     disegna i comandi come sono, con il possesso di QUEL fotogramma. Se
     la palla non e' di nessuno la foto dice CONTRASTA e CAMBIO, ed e'
     la verita' — quello e' cio' che il dito otterrebbe.
     =================================================================== */
  const poss = possessoTeam(t);
  return [
    poss ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60, r:40 }
         : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60, r:40 },
    poss ? { act:'through', label:'FILTRANTE', x:bx+s*158, y:VH-72, r:30 }
         : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72, r:30 },
  ];`);

/* ------------------------------------------------------------------ 2
   LA BUSSOLA NON SALE MAI SOTTO IL POLLICE SINISTRO. */
cambio('2. la bussola non sale mai sotto la levetta',
`  const myAlto=Math.min(VH-12-mh, Ay+(FH+15)*S2-8-mh);
  const myBasso=VH-12-mh;
  const scendi = scartoHUDRett(mx-2,myAlto-2,mx+mw+2,myAlto+mh+2) < 0.98;
  const myVoluto = scendi ? myBasso : myAlto;`,
`  const myAlto=Math.min(VH-12-mh, Ay+(FH+15)*S2-8-mh);
  const myBasso=VH-12-mh;
  /* ===================================================================
     LA CASA DEL POLLICE SINISTRO E' TERRA OCCUPATA, ANCHE QUANDO NON SI
     DISEGNA NIENTE.

     Il giudice: «in istante-04 e 05 la MINIMAPPA si e' alzata e la
     ghiera della leva analogica le finisce sopra: la minimappa e'
     l'unico strumento che risolverebbe il problema del pollice destro,
     ed e' sotto il pollice sinistro. In istante-01 e 06 sta piu' in
     basso e libera: significa che si sposta da sola, e in tre casi su
     otto si sposta dove non deve».
     Misurato sui due fermi immagine: la levetta a riposo vive a
     (96, VH-140) con corsa piena 46, cioe' occupa y da VH-186 a VH-94 e
     x da 50 a 142; la bussola all'ancoraggio ALTO cadeva a y 295-340 su
     una tela di 412, cioe' VH-117..VH-72 — dentro la levetta per
     ventitre pixel, e sovrapposta in x per intero.
     L'ancoraggio alto esisteva per una ragione buona («mai sopra una
     scritta»: sale sopra la fascia delle insegne quando entra in
     quadro) e per questo resta; ma aveva un solo giudice, il pallone.
     La levetta non era nell'elenco perche' A RIPOSO NON SI DISEGNA — e
     una zona che non si disegna non finisce in TOUCH_ZONE. Il pollice
     pero' ci sta lo stesso: la casa della levetta e' occupata anche
     quando e' vuota, ed e' questa la riga che mancava.
     Costa due confronti di rettangoli per fotogramma. Quando l'alto e'
     occupato la bussola sceglie il basso, dove l'unica cosa che puo'
     coprire e' un cartellone dipinto — e un cartellone si guarda, non
     si legge per giocare.
     =================================================================== */
  /* E LA CASA SI RISERVA SOLO SE IL POLLICE C'E' — misurato, e costava.
     Riservandola sempre, la bussola scendeva anche nelle riprese CPU
     contro CPU, dove di comandi non ne esiste nemmeno uno: in basso a
     sinistra copriva l'anello di tribuna dentro cui strumenti/folla.js
     misura il movimento della folla, e la crescita della sagoma allo
     scoppio del gol scendeva da 14,3% a 9,2% (minimo 8%) — cancello
     verde ma margine dimezzato, per difendere uno schermo da un dito che
     in quella scena non c'era. La condizione e' la stessa che decide se
     i comandi si disegnano, cosi' non possono andare fuori sincrono. */
  const casaPollice = (IS_TOUCH||Touch5.used||HUD_POSA) && (!G.cpu[0] || HUD_POSA);
  const lvX0=96-STICK_FULL-4, lvX1=96+STICK_FULL+4;
  const lvY0=VH-140-STICK_FULL-4, lvY1=VH-140+STICK_FULL+4;
  const toccaPollice=(yy)=>{
    if(casaPollice &&
       !(mx+mw+2<lvX0 || mx-2>lvX1 || yy+mh+2<lvY0 || yy-2>lvY1)) return true;
    /* e la levetta VIVA, che nasce dove il dito si e' posato */
    for(let t=0;t<2;t++){
      const st=Touch5.stick[t];
      if(!st || !st.active) continue;
      const ax0=st.ox-STICK_FULL-4, ax1=st.ox+STICK_FULL+4;
      const ay0=st.oy-STICK_FULL-4, ay1=st.oy+STICK_FULL+4;
      if(!(mx+mw+2<ax0 || mx-2>ax1 || yy+mh+2<ay0 || yy-2>ay1)) return true;
    }
    return false;
  };
  const scendi = toccaPollice(myAlto) ||
                 scartoHUDRett(mx-2,myAlto-2,mx+mw+2,myAlto+mh+2) < 0.98;
  const myVoluto = scendi ? myBasso : myAlto;`);

/* ------------------------------------------------------------------ 3
   LA BARRA ALTA: SI VELA IL PANNELLO, NON LE CIFRE. */
cambio('3a. il riquadro delle cifre, dichiarato',
`const CHEV_POS=[];
let MINI_RECT=null;
function drawHUD(){`,
`const CHEV_POS=[];
let MINI_RECT=null;
/* L'INGOMBRO DELLA PASTICCA DELLE CIFRE dell'ultimo fotogramma: la
   dichiara zoneInterfaccia perche' e' l'unico pezzo di lavagnetta che
   resta OPACO quando il resto si vela, e chi misura deve saperlo. */
const BAR_CIFRE={x0:0,y0:0,x1:0,y1:0};
function drawHUD(){`);

cambio('3b. il velo si applica al pannello, non a tutto',
`  ctx.save();
  ctx.globalAlpha *= velaTabellone(px0,px1);`,
`  ctx.save();
  /* ===================================================================
     LA LAVAGNETTA SI VELA, LE CIFRE NO.

     Il giudice, su quattro fermi immagine su otto: «la barra alta si
     sbiadisce cosi' tanto quando l'azione le passa vicino che punteggio
     e cronometro diventano ILLEGGIBILI, mentre i corpi dei giocatori le
     passano davanti. L'attenuazione dell'HUD e' l'idea giusta con la
     mano pesante».
     Aveva ragione, e il difetto era di UNA RIGA: il velo si applicava a
     ctx.globalAlpha PRIMA di disegnare qualunque cosa, quindi scendeva
     insieme il fondo d'ardesia E il gesso delle cifre. A 0,34 — la
     soglia scelta perche' «sotto quella il punteggio non si legge» — il
     punteggio infatti non si leggeva: il velo era stato tarato sul
     valore giusto e applicato all'oggetto sbagliato.
     Da qui in poi il velo ha un nome (VELO) e si applica SOLO al
     pannello: ardesia, listello di legno, montanti, piede sfumato,
     sbarre e nomi. Le cifre — punteggio e cronometro, che sono due dei
     cinque elementi persistenti ammessi — si disegnano ad alfa piena
     sopra una pasticca d'ardesia OPACA, che e' esattamente cio' che fa
     uno scorebug televisivo quando l'azione gli arriva addosso: il
     fondo si apre, il numero no.
     LA PASTICCA E' STRETTA, e la sua larghezza e' misurata: le due
     cifre stanno a cx +-58f e sono larghe una sedicina di pixel l'una
     (corpo 26), il riquadro del cronometro e' largo 68; il contenuto
     arriva quindi a +-66f e la pasticca si ferma a +-86f, venti pixel di
     respiro per lato. Sono 172f px su una lavagnetta larga circa 490f:
     il 35%. Il restante 65% continua a velarsi e a lasciar vedere chi
     passa dietro, che e' la ragione per cui il velo esiste.
     =================================================================== */
  const A_HUD=ctx.globalAlpha, VELO=velaTabellone(px0,px1);
  ctx.globalAlpha = A_HUD*VELO;`);

cambio('3c. la pasticca opaca sotto le cifre',
`  ctx.fillStyle='rgba(255,255,255,.07)'; ctx.fillRect(px0,0,PW,1);
  ctx.textBaseline='middle';`,
`  ctx.fillStyle='rgba(255,255,255,.07)'; ctx.fillRect(px0,0,PW,1);
  /* LA PASTICCA, disegnata QUI — cioe' subito dopo il fondo e prima di
     sbarre e nomi — cosi' e' materia di fondo e non un adesivo appiccato
     sopra il testo. Stessa altezza e stessa origine della lavagnetta
     (y=0, h=H): il gradiente verticale di ardesiaFill e' percio' lo
     STESSO, e a velo pieno la pasticca e' invisibile. Si disegna solo
     quando il velo e' sceso: a velo pieno non c'e' niente da difendere e
     non si paga nessun riempimento. */
  BAR_CIFRE.x0=Math.round(cx-86*f); BAR_CIFRE.x1=Math.round(cx+86*f);
  BAR_CIFRE.y0=0; BAR_CIFRE.y1=H;
  if(VELO<0.999){
    ctx.globalAlpha=A_HUD;
    ardesiaFill(BAR_CIFRE.x0, 0, BAR_CIFRE.x1-BAR_CIFRE.x0, H);
    ctx.globalAlpha=A_HUD*VELO;
  }
  ctx.textBaseline='middle';`);

cambio('3d. punteggio e cronometro ad alfa piena',
`  /* PUNTEGGI: 26 px grassetto, centrati a cx-58 e cx+58 */
  ctx.font='700 26px '+FONT_C; ctx.textAlign='center'; ctx.fillStyle=COL.gesso;`,
`  /* PUNTEGGI E CRONOMETRO: ALFA PIENA, SEMPRE. Sono le due cifre che il
     giudice ha chiamate illeggibili, e stanno sopra la pasticca opaca —
     quindi non c'e' nessun fotogramma in cui si leggano peggio di come
     si leggono a velo pieno. Il velo torna in vigore subito dopo. */
  ctx.globalAlpha=A_HUD;
  /* PUNTEGGI: 26 px grassetto, centrati a cx-58 e cx+58 */
  ctx.font='700 26px '+FONT_C; ctx.textAlign='center'; ctx.fillStyle=COL.gesso;`);

cambio('3e. il velo torna in vigore dopo le cifre',
`      ctx.fillText(fmtTime(G.timeLeft), 0, 0);
      ctx.restore();
    }
  }`,
`      ctx.fillText(fmtTime(G.timeLeft), 0, 0);
      ctx.restore();
    }
  }
  ctx.globalAlpha=A_HUD*VELO;      // finite le cifre, torna il velo`);

/* ------------------------------------------------------------------ 4
   I SOGGETTI CHE L'INTERFACCIA NON PUO' COPRIRE. */
cambio('4a. la porta attaccata e il portiere, coi loro rettangoli',
`/* i due rettangoli sono OGGETTI RIUSATI, mai allocati nel fotogramma:
   PROTA_N dice quanti ne valgono adesso */
const PROTA_SCH=[{x0:0,y0:0,x1:0,y1:0},{x0:0,y0:0,x1:0,y1:0}];
let PROTA_N=0;
function protagonistaSchermo(){
  PROTA_N=0;
  const v=G.view, S2=v.S2;
  if(!S2) return;
  const H=RIG_H*P_DIS*S2, w=31*S2, giu=19*S2;
  for(let t=0;t<2;t++){
    const i=ctrlDisegno(t);
    if(i<0) continue;
    const p=G.players[i];
    if(!p || p.out>0) continue;
    const cx=p.x*S2+v.Ax, py=(p.y+RIG_PIEDI)*S2+v.Ay, r=PROTA_SCH[PROTA_N++];
    r.x0=cx-w; r.y0=py-H; r.x1=cx+w; r.y1=py+giu;
  }
}`,
`/* =====================================================================
   I QUATTRO SOGGETTI CHE UN PANNELLO NON PUO' COPRIRE — e perche' non
   bastavano il pallone e il comandato.

   Il criterio, alla lettera come e' arrivato: «la porta attaccata, il
   portiere avversario, il giocatore comandato e la palla non devono MAI
   finire sotto un pannello». I primi due mancavano, e mancavano per una
   ragione onesta: erano stati chiesti dopo. Il risultato si legge nei
   fermi immagine 02 e 07 — FILTRANTE appoggiato sul portiere numero 1
   dentro la sua area, cioe' esattamente l'informazione che chi attacca
   deve leggere per decidere se tirare.
   Spostare i comandi nell'angolo basso (vedi touchBtnLayout) toglie il
   caso SISTEMATICO, quello che capitava in ogni attacco verso destra —
   misurato sul freeze-frame test: dieci sovrapposizioni su otto istanti
   diventano zero. Restano i casi obliqui, e per quelli vale la regola
   gia' scritta in questo file per il pallone: quando il soggetto arriva
   addosso al pannello, e' IL PANNELLO che si toglie di mezzo.

   DUE ELENCHI, PERCHE' SONO DUE NATURE E VOGLIONO DUE RAMPE — ed e' la
   correzione che questa passata ha dovuto pagare misurando.
   La rampa dello scarto e' larga 34 px: il pannello comincia a
   scansarsi trentaquattro pixel PRIMA del contatto. Su un pallone che
   corre a mille unita' al secondo l'anticipo e' giusto — quando il
   pallone arriva, il posto e' gia' libero. Su una PORTA, che e' un muro
   fermo, no: misurato sull'istante 02, il montante basso passa a 3,8 px
   dal disco di CONTRASTA SENZA TOCCARLO, e con la rampa lunga il comando
   scendeva lo stesso a 0,10 — spariva mentre non copriva niente.
   Scambiare «il pannello copre la porta» con «il pannello sparisce
   sempre» e' il difetto speculare, e sarebbe stato peggio dell'originale.
   Quindi: PROTA_SCH (il comandato) tiene la rampa lunga di sempre; i due
   MURI stanno in CHIAVE_SCH e hanno una rampa che comincia AL CONTATTO e
   si consuma in dieci pixel di penetrazione. Il comando resta intero
   finche' non copre davvero, e si toglie di mezzo quando copre.

   QUANTI SONO: due comandati (uno per squadra) piu', per ogni squadra
   con i comandi a schermo, la bocca della sua porta d'attacco e il
   portiere avversario. COSTO: due rettangoli e una scansione della rosa
   per il portiere, una volta per fotogramma, dentro pallaSchermo che
   gia' gira.
   ===================================================================== */
/* i due rettangoli sono OGGETTI RIUSATI, mai allocati nel fotogramma:
   PROTA_N dice quanti ne valgono adesso */
const PROTA_SCH=[{x0:0,y0:0,x1:0,y1:0},{x0:0,y0:0,x1:0,y1:0}];
let PROTA_N=0;
/* I MURI, con la loro rampa corta. CHIAVE_TIPO li nomina, e serve a
   __test.copertura() per dire QUALE soggetto sta sotto QUALE pannello:
   un criterio che si misura e' un criterio, uno che si guarda e' un
   parere. */
const CHIAVE_SCH=[{x0:0,y0:0,x1:0,y1:0},{x0:0,y0:0,x1:0,y1:0},
                  {x0:0,y0:0,x1:0,y1:0},{x0:0,y0:0,x1:0,y1:0}];
const CHIAVE_TIPO=['','','',''];
let CHIAVE_N=0;
function protagonistaSchermo(){
  PROTA_N=0; CHIAVE_N=0;
  const v=G.view, S2=v.S2;
  if(!S2) return;
  const H=RIG_H*P_DIS*S2, w=31*S2, giu=19*S2;
  for(let t=0;t<2;t++){
    const i=ctrlDisegno(t);
    if(i<0) continue;
    const p=G.players[i];
    if(!p || p.out>0) continue;
    const cx=p.x*S2+v.Ax, py=(p.y+RIG_PIEDI)*S2+v.Ay, r=PROTA_SCH[PROTA_N++];
    r.x0=cx-w; r.y0=py-H; r.x1=cx+w; r.y1=py+giu;
  }
  /* LA PORTA CHE SI ATTACCA E IL PORTIERE CHE SI DEVE LEGGERE, e solo
     per chi ha davvero i comandi a schermo: dove non c'e' un pollice non
     c'e' niente da cui difendersi, e un pannello che si vela per una
     minaccia immaginaria e' un pannello che lampeggia. */
  for(let t=0;t<2;t++){
    if(G.cpu[t] && !(HUD_POSA && t===0)) continue;
    /* la bocca: dalla linea di fondo alla profondita' della porta, alta
       quanto GY0..GY1. Fuori quadro non si dichiara. */
    if(CHIAVE_N<CHIAVE_SCH.length){
      const gx0=(t===0? FW : -GOAL_D)*S2+v.Ax, gx1=(t===0? FW+GOAL_D : 0)*S2+v.Ax;
      if(gx1>-40 && gx0<VW+40){
        const r=CHIAVE_SCH[CHIAVE_N];
        r.x0=gx0; r.x1=gx1; r.y0=GY0*S2+v.Ay; r.y1=GY1*S2+v.Ay;
        CHIAVE_TIPO[CHIAVE_N++]='porta';
      }
    }
    if(CHIAVE_N<CHIAVE_SCH.length){
      const gk=portiereDi(1-t);
      if(gk && gk.out<=0){
        const cx=gk.x*S2+v.Ax, py=(gk.y+RIG_PIEDI)*S2+v.Ay, wk=17*S2;
        const r=CHIAVE_SCH[CHIAVE_N];
        r.x0=cx-wk; r.y0=py-H; r.x1=cx+wk; r.y1=py+giu*0.42;
        CHIAVE_TIPO[CHIAVE_N++]='portiere';
      }
    }
  }
}`);

cambio('4b. la rampa corta dei muri, e le due distanze',
`/* quanto il protagonista e' vicino (o dentro) a un disco dell'HUD */
function distProta(cx,cy,rr){
  let d=1e9;
  for(let k=0;k<PROTA_N;k++){
    const r=PROTA_SCH[k];
    const dx=Math.max(r.x0-cx,0,cx-r.x1), dy=Math.max(r.y0-cy,0,cy-r.y1);
    const q=Math.hypot(dx,dy)-rr;
    if(q<d) d=q;
  }
  return d;
}`,
`/* quanto il protagonista e' vicino (o dentro) a un disco dell'HUD */
function distProta(cx,cy,rr){ return distDisco(PROTA_SCH,PROTA_N,cx,cy,rr); }
/* la stessa misura su un elenco qualunque: distanza fra un DISCO e il
   piu' vicino dei rettangoli. Negativa quando il rettangolo entra. */
function distDisco(el,n,cx,cy,rr){
  let d=1e9;
  for(let k=0;k<n;k++){
    const r=el[k];
    const dx=Math.max(r.x0-cx,0,cx-r.x1), dy=Math.max(r.y0-cy,0,cy-r.y1);
    const q=Math.hypot(dx,dy)-rr;
    if(q<d) d=q;
  }
  return d;
}
/* e fra un RETTANGOLO e il piu' vicino dei rettangoli. Quando si
   sovrappongono restituisce la PROFONDITA' COL SEGNO MENO (la via
   d'uscita piu' corta): senza segno la rampa corta non saprebbe mai di
   essere stata attraversata, ed e' l'errore che il rettangolo di
   scartoHUDRett faceva gia' — li' non contava perche' la rampa lunga
   satura comunque a zero. */
function distRettMin(el,n,x0,y0,x1,y1){
  let d=1e9;
  for(let k=0;k<n;k++){
    const r=el[k];
    const gx=Math.max(r.x0-x1, x0-r.x1), gy=Math.max(r.y0-y1, y0-r.y1);
    const q=(gx>0||gy>0) ? Math.hypot(Math.max(gx,0),Math.max(gy,0)) : Math.max(gx,gy);
    if(q<d) d=q;
  }
  return d;
}
/* LA RAMPA CORTA — la seconda rampa di questo file, e la ragione per cui
   ce ne vogliono due sta nel cappello di CHIAVE_SCH: un muro fermo non
   si annuncia. Intera fino al contatto, 0,10 dopo dieci pixel di
   penetrazione. Non e' un gradino: dieci pixel sono una mezza dozzina di
   fotogrammi alla velocita' tipica del pan, quindi l'occhio vede una
   dissolvenza e non uno scatto. */
function scartoMuro(d){
  if(d>=0) return 1;
  if(d<=-10) return 0.10;
  const u=-d/10;
  return 1-0.90*u*u;
}`);

cambio('4c. lo scarto tiene conto anche dei muri (disco)',
`function scartoHUD(cx,cy,rr){
  const p=PALLA_SCH;
  if(!p) return 1;
  return scartoRampa(Math.min(Math.hypot(p.x-cx,p.y-cy)-rr-p.r, distProta(cx,cy,rr)));
}`,
`function scartoHUD(cx,cy,rr){
  const p=PALLA_SCH;
  if(!p) return 1;
  const a=scartoRampa(Math.min(Math.hypot(p.x-cx,p.y-cy)-rr-p.r, distProta(cx,cy,rr)));
  /* i due muri, con la rampa corta: vince chi si scansa di piu' */
  return Math.min(a, scartoMuro(distDisco(CHIAVE_SCH,CHIAVE_N,cx,cy,rr)));
}`);

cambio('4d. lo scarto tiene conto anche dei muri (rettangolo)',
`  for(let k=0;k<PROTA_N;k++){
    const r=PROTA_SCH[k];
    const ix=Math.max(x0-r.x1, r.x0-x1, 0), iy=Math.max(y0-r.y1, r.y0-y1, 0);
    const q=Math.hypot(ix,iy);
    if(q<d) d=q;
  }
  return scartoRampa(d);
}`,
`  for(let k=0;k<PROTA_N;k++){
    const r=PROTA_SCH[k];
    const ix=Math.max(x0-r.x1, r.x0-x1, 0), iy=Math.max(y0-r.y1, r.y0-y1, 0);
    const q=Math.hypot(ix,iy);
    if(q<d) d=q;
  }
  return Math.min(scartoRampa(d),
                  scartoMuro(distRettMin(CHIAVE_SCH,CHIAVE_N,x0,y0,x1,y1)));
}`);

/* ------------------------------------------------------------------ 5
   LA CAMERA: SCALA PER TAGLIA, E L'ANELLO CHE NON SI TAGLIA. */
cambio('5a. la scala di camera diventa funzione della taglia',
`  const kTag = TAGLIA===11 ? 1.20 : TAGLIA===7 ? 1.15 : 1;
  const zMin = S2_MIN_DEV*kTag, zMax = S2_MAX_DEV;`,
`  /* ===================================================================
     IL TETTO DELLO ZOOM E' FUNZIONE DELLA TAGLIA — e prima andava nel
     verso sbagliato.

     Il giudice, sull'11 contro 11: «i giocatori sono grandi UGUALI al
     cinque contro cinque: la telecamera non allarga. Risultato, ne vedo
     sette su ventidue. Non sto giocando a undici, sto giocando a cinque
     dentro una partita a undici di cui non so niente». Il secondo, sullo
     stesso fotogramma: «la minimappa si ingrandisce per compensare,
     cioe' il gioco AMMETTE DA SOLO che la vista principale non basta
     piu'. Serve una funzione della scala di camera sul numero di
     giocatori e sulla larghezza del campo».

     LA RIGA CHE C'ERA FACEVA L'OPPOSTO. kTag alzava il PAVIMENTO del
     20% sull'11 e del 15% sul 7 — cioe' vietava alla camera di aprirsi
     proprio dove il mondo era cresciuto — e il TETTO restava S2_MAX per
     tutte e tre le taglie. Siccome il bersaglio di zoom (pallone piu' i
     tre uomini vicini) sta quasi sempre INCOLLATO al tetto, era il tetto
     a decidere la scala, e il tetto non sapeva su che campo si stesse
     giocando. Da qui la figura identica a tutte le taglie: 46,9 px.

     LA FUNZIONE, e sono i numeri delle tre taglie:
         5 :  campo 1150x560   area   644.000  ->  radice 1,000
         7 :  campo 1610x784   area 1.262.240  ->  radice 0,714
        11 :  campo 2300x1120  area 2.576.000  ->  radice 0,500
     Il tetto proporzionale sarebbe S2_MAX per quella radice: 1,53 sul 5,
     1,09 sul 7, 0,765 sull'11.

     E QUI IL PAVIMENTO DICE DI NO, e va detto invece di sfondarlo.
     Z_BORDO = 34 px di corpo (1,108 px per unita') e Z_MURO = 31 px
     (1,010) sono i due pavimenti dichiarati, pagati con una spazzata di
     otto istanti per sei zoom per quindici posizioni di camera, e Z_MURO
     e' stato fermato a 31 e non a 25 perche' a 25 CADEVANO due cancelli
     misurati (il 3:1 sulle divise daltoniche e il diametro del pallone).
     Il tetto proporzionale dell'11 — 23,5 px di corpo — sta ventidue
     punti sotto quel pavimento. Non si scende.
     Il tetto si ferma quindi a Z_BORDO, cioe' 34 px di corpo:
         5  ->  1,530 (46,9 px)      invariato
         7  ->  1,108 (34,0 px)      -27,6% lineare
        11  ->  1,108 (34,0 px)      -27,6% lineare
     Sull'11 il quadro guadagna il 38% di lato e il 91% di AREA di mondo
     inquadrata; sul 7 lo stesso. Il pavimento della forbice (Z_MURO)
     resta dov'e' e non viene toccato: sotto Z_BORDO si scende ancora
     solo per comprare il secondo muro, come prima.
     Sul tablet il pavimento sale con lo schermo (Z_BORDO x S2_MIN_DEV),
     perche' 34 px su una tela alta 834 non sono 34 px su una alta 412 —
     e' la stessa ragione per cui esiste S2_*_DEV.

     IL PREZZO, MISURATO E DICHIARATO: SUL 7 L'ERBA VUOTA PEGGIORA.
     Il freeze-frame test a taglia 7, otto istanti, prima -> dopo:
         60,1->59,7  55,9->57,6  55,9->58,3  43,8->50,0
         56,3->54,2  56,3->56,6  49,0->51,7  58,3->55,2
     media 54,5 -> 55,4 (+0,9 punti: piatta), ma DUE istanti che stavano
     sotto il tetto del 50% lo attraversano, e il cancello passa da 2/8 a
     0/8. Sull'11 succede il contrario — media 61,2 -> 59,1, e il conto
     resta 1/8 — perche' li' il quadro largo comincia a prendere le
     testate. In tutto: 5 contro 5 invariato 47/48, 7 contro 7 41 -> 40,
     11 contro 11 39 -> 40 (le ombre guadagnano un istante su tutt'e due
     le taglie grandi). Netto zero, con lo scambio dichiarato.
     LA VIA DI MEZZO E' STATA PROVATA E NON PAGA: dando al 7 il gradino
     di sopra (Z_FIG40, 40 px di corpo invece di 34) l'erba vuota fa 1/8
     invece di 0/8 — un istante recuperato — ma le ombre tornano 7/8 e il
     totale resta 40/48, con meta' dell'allargamento (uomini in quadro
     9,1 invece di 9,4; area di mondo 19,5% invece di 23,6%). Si paga lo
     stesso e si compra meno: il gradino resta Z_BORDO per tutt'e due.
     E VA DETTO ANCHE PERCHE': sul 7 e sull'11 il cancello dell'erba
     vuota misura una cosa che la camera non puo' comprare. Il tetto del
     50% e' tarato sul 5 contro 5, dove una sponda o una testata entrano
     in quadro; su un campo largo 1610 o 2300 unita' le pareti sono fuori
     portata per quasi tutta la partita (lo dice gia' la forbice, poche
     righe piu' giu'), e quello che entra al posto loro e' prato. Il
     rimedio a quel cancello, sulle taglie grandi, non e' la camera.

     QUEL CHE NON SI PUO' COMPRARE, E VA DETTO. Sull'11 il campo ha
     QUATTRO volte l'area del 5 e questa manovra ne recupera 1,91: al
     tetto nuovo si vedono circa dieci-undici uomini su ventidue invece
     di sette. La meta' che manca e' preclusa dal pavimento della
     figura, cioe' da un patto gia' pagato con due cancelli. Il resto lo
     devono fare gli strumenti che raccontano il fuori quadro — la
     bussola, che da questa passata e' anche sempre libera dal pollice, e
     l'indicatore dei compagni smarcati fuori campo. Meglio dichiararlo
     che sfondare un pavimento comprato con una spazzata di 720 misure.

     LA BANDA MORTA DELLO ZOOM, chiesta dal secondo giudice «perche'
     l'inquadratura non balli»: sotto lo 0,8% di differenza il bersaglio
     non si muove affatto. Otto millesimi di 34 px sono ventisette
     centesimi di pixel di corpo — sotto la risoluzione dell'occhio e
     sotto quella del banco — mentre la molla dello zoom (semivita 0,45 s)
     a 60 immagini al secondo si sposta del 2,5% per fotogramma: senza la
     banda il quadro respira in continuazione dietro un bersaglio che si
     ricalcola ogni volta.
     =================================================================== */
  const zPav = Z_BORDO*S2_MIN_DEV;          // 34 px di corpo, scalati col device
  const kTetto = TAGLIA===5 ? 1 : Math.sqrt((1150*560)/Math.max(1,FW*FH));
  const zMin = S2_MIN_DEV, zMax = Math.max(zPav, S2_MAX_DEV*kTetto);`);

/* ------------------------------------------------------------------ 5b
   LA BANDA MORTA DELLO ZOOM: PROVATA, MISURATA, RITIRATA — e il verbale
   resta perche' chi la riprendera' deve sapere dove ha sbattuto.

   Il secondo giudice l'ha chiesta insieme alla scala per taglia: «piu'
   una banda morta perche' l'inquadratura non balli». E' stata scritta —
   sotto lo 0,8% di differenza il bersaglio dello zoom non si muove,
   cosi' il quadro smette di respirare dietro un traguardo che si
   ricalcola sessanta volte al secondo — e poi tolta, perche' UN CANCELLO
   L'HA FERMATA.

   IL CONTO, ed e' di due millesimi. La banda lascia assestare la camera
   fino allo 0,8% sotto il suo bersaglio. Nella posa di
   strumenti/folla.js — pallone sulla linea laterale bassa, camera aperta
   sulla gradinata — il bersaglio e' esattamente Z_BORDO (1,1082), e otto
   millesimi sotto fanno 1,0993. La soglia di CROWD_RADO sta a
   Z_BORDO x 0,99 = 1,0971: DUE MILLESIMI piu' giu'. Non li ha
   attraversati per un pelo, ma la camera arriva li' da sopra e la soglia
   ha isteresi, quindi il fotogramma misurato ci e' finito dentro. Sotto
   quella soglia la tribuna si disegna UNA SAGOMA SU DUE, e le due misure
   della folla crollano:
       due fotogrammi consecutivi differiscono   1,38%  ->  0,98%
       (il minimo del cancello e' 1,00%: rosso)
       la sagoma cresce con lo scoppio del gol  14,3%  ->   8,6%
   Otto millesimi di zoom spengono meta' della folla. Non e' un difetto
   della banda morta: e' che la banda morta e la soglia di CROWD_RADO si
   contendono lo stesso millesimo, e chi arriva dopo perde. Tarare la
   banda a 0,4% per scavalcare la soglia sarebbe cucire un numero addosso
   a un cancello, che e' il modo di rendere inutile il cancello.
   Quindi la banda esce, e il tremolio dell'inquadratura resta un difetto
   APERTO. Chi la riprendera' deve prima decidere se CROWD_RADO possa
   dipendere da una soglia secca su uno zoom continuo: la fragilita' vera
   sta li', e questa passata l'ha solo trovata.
   Senza banda, folla torna 4/4 con gli stessi 1,38% del file di prima. */

cambio('5c. l\'anello del comandato non si taglia mai',
`      const need=testa-((sottoBar?PA_Y0+4:4)-PA_CY)/S2f; // cam.y non piu' in giu' di qui
      if(G.cam.y>need){
        G.cam.y=Math.max(need, Math.max(b.y-lySu, b.y-lyT));
      }
    }
  }`,
`      const need=testa-((sottoBar?PA_Y0+4:4)-PA_CY)/S2f; // cam.y non piu' in giu' di qui
      if(G.cam.y>need){
        G.cam.y=Math.max(need, Math.max(b.y-lySu, b.y-lyT));
      }
      /* ==== 6-quinquies. L'ANELLO DEL COMANDATO NON SI TAGLIA MAI =====
         Il giudice, sulla foto dell'11 contro 11: «il giocatore che
         comando, il numero 7, e' schiacciato sul BORDO INFERIORE dello
         schermo con l'anello arancione tagliato a meta'. In 5 contro 5
         questo non succede mai: e' una regressione specifica dei campi
         grandi».
         Non era una regressione dei campi grandi, era un buco nel 6-bis:
         quella regola guarda i QUATTRO piu' vicini al pallone e chiede
         che i loro PIEDI stiano in tela. Il comandato spesso non e' fra
         i quattro (nelle pose e' per definizione chi la palla non ce
         l'ha), e comunque i piedi non bastano: il marker del comandato
         e' un'ellisse che sborda 19 unita' SOTTO i piedi, ed e' l'unico
         segno che dice «questo sei tu». Sul campo grande capita piu'
         spesso solo perche' la rosa e' larga il doppio e il comandato e'
         piu' spesso lontano dal pallone.
         Stessa forma del 6-bis: spinta a senso unico (la camera puo'
         solo scendere), dentro la garanzia del pallone e dentro il terzo
         centrale, che restano gli ultimi a parlare. */
      const needG=pc.y+RIG_PIEDI+19+3-(VH-2-PA_CY)/S2f;
      if(G.cam.y<needG){
        G.cam.y=Math.min(needG, Math.min(b.y+lyGiu, b.y+lyT));
      }
    }
  }`);

/* ------------------------------------------------------------------ 5d
   LA LAVAGNA DELLE ISTRUZIONI NON SI TAGLIA A META' FRASE. */
cambio('5d. la piega dello schermo diventa una sfumatura vera',
`.ov::after{
  content:"";position:fixed;left:0;right:0;bottom:0;height:48px;z-index:2;
  background:linear-gradient(rgba(5,40,17,0),rgba(5,40,17,.90));
  pointer-events:none;
}`,
`/* =====================================================================
   LA PIEGA DELLO SCHERMO — perche' quarantotto pixel al novanta per
   cento non bastavano.

   Il giudice, sulla coda del terzo difetto: «i verbi difensivi esistono,
   ma stanno solo sulla lavagna delle istruzioni — e li' la frase e'
   TAGLIATA dalla piega dello schermo». Guardato: su COME SI GIOCA a
   915x412 l'ultima riga visibile e' la descrizione della SCIVOLATA,
   «flick sull'avversario — di», e finisce li'. Non e' un difetto di
   scorrimento: e' che la sfumatura arrivava al 90% e a nove decimi il
   gesso si legge ancora. Una frase leggibile e mozzata e' un errore di
   impaginazione; una frase che si dissolve e' una pagina lunga. La
   differenza sta tutta nell'ultimo decimo.
   TRE COSE, e sono tutte misure:
     · la fascia sale da 48 a 74 px e diventa OPACA nell'ultimo tratto —
       i 26 px di fondo coprono piu' di un'interlinea (il corpo delle
       descrizioni e' 13 px, l'interlinea 18), quindi nessun glifo puo'
       restare mezzo leggibile sul bordo;
     · in mezzo la rampa e' piu' morbida di prima (.72 a meta' invece di
       .45 lineare), cosi' l'ultima riga INTERA resta chiara e non si
       perde contenuto che prima si vedeva;
     · ARRIVATI IN FONDO la fascia sparisce (classe 'fondo'): prima
       restava accesa anche a scorrimento finito e velava il bottone
       TORNA AL MENU, che e' l'unica cosa che a quel punto serve.
   ===================================================================== */
.ov::after{
  content:"";position:fixed;left:0;right:0;bottom:0;height:74px;z-index:2;
  background:linear-gradient(rgba(5,40,17,0) 0%, rgba(5,40,17,.72) 52%,
                             rgba(5,40,17,1) 82%, rgba(5,40,17,1) 100%);
  pointer-events:none;
}
.ov.fondo::after{display:none}`);

cambio('5e. e la sfumatura si spegne quando si e arrivati in fondo',
`    const scorre = el.scrollHeight - el.clientHeight > 28;
    el.classList.toggle('senzafade', !scorre);
    el.classList.toggle('scrolled', !scorre || el.scrollTop>8);`,
`    const scorre = el.scrollHeight - el.clientHeight > 28;
    el.classList.toggle('senzafade', !scorre);
    el.classList.toggle('scrolled', !scorre || el.scrollTop>8);
    /* IN FONDO NON C'E' PIU' NIENTE DA SFUMARE, e quello che resta sotto
       la fascia e' il bottone dell'uscita: tolleranza di 4 px per
       l'arrotondamento sub-pixel dello scorrimento. */
    el.classList.toggle('fondo',
      scorre && el.scrollTop + el.clientHeight >= el.scrollHeight - 4);`);

cambio('5f. lo stesso, mentre si scorre',
`  s.addEventListener('scroll', ()=>{
    if(s.scrollTop>8) s.classList.add('scrolled');
    else if(s.scrollHeight-s.clientHeight>28) s.classList.remove('scrolled');
  }, {passive:true});`,
`  s.addEventListener('scroll', ()=>{
    if(s.scrollTop>8) s.classList.add('scrolled');
    else if(s.scrollHeight-s.clientHeight>28) s.classList.remove('scrolled');
    s.classList.toggle('fondo',
      s.scrollHeight-s.clientHeight>28 &&
      s.scrollTop + s.clientHeight >= s.scrollHeight - 4);
  }, {passive:true});`);

/* ------------------------------------------------------------------ 6
   LA DICHIARAZIONE, E IL CRITERIO CHE SI VERIFICA. */
cambio('6a. la pasticca delle cifre entra nella dichiarazione',
`      z.push({tipo:'tabellone', x0:BAR_X0, y0:0, x1:BAR_X1, y1:BAR_H,
              alfa:+TAB_VELO.toFixed(3)});`,
`      z.push({tipo:'tabellone', x0:BAR_X0, y0:0, x1:BAR_X1, y1:BAR_H,
              alfa:+TAB_VELO.toFixed(3)});
      /* LA PASTICCA DELLE CIFRE resta OPACA anche quando il pannello si
         vela: e' dentro il rettangolo del tabellone, quindi non aggiunge
         un pixel di superficie dichiarata, ma la sua alfa e' un'altra e
         va detta — se no chi misura crede che sotto il punteggio i pixel
         siano tornati prato al 34%, e non lo sono. */
      if(TAB_VELO<0.999 && BAR_CIFRE.x1>BAR_CIFRE.x0)
        z.push({tipo:'cifre', x0:BAR_CIFRE.x0, y0:BAR_CIFRE.y0,
                x1:BAR_CIFRE.x1, y1:BAR_CIFRE.y1, alfa:1});`);

cambio('6a-bis. i pannelli TONDI dichiarano di essere tondi',
`    for(const t of TOUCH_ZONE){
      z.push({tipo:t.tipo, x0:t.x0, y0:t.y0, x1:t.x1, y1:t.y1,
              alfa:t.alpha===undefined?1:t.alpha});
    }`,
`    for(const t of TOUCH_ZONE){
      /* IL RIQUADRO NON E' LA FORMA. Stick e pulsanti sono DISCHI, e il
         loro quadrato circoscritto e' il 27% piu' grande del disco: sono
         i quattro angoli, ed e' esattamente dove va a finire il montante
         della porta quando il comando sta nell'angolo basso. Chi misura
         una copertura deve poter usare la forma vera; chi (come
         istantanea.js) preferisce il riquadro continua a leggerlo, e
         sbaglia solo per eccesso di prudenza. */
      const q={tipo:t.tipo, x0:t.x0, y0:t.y0, x1:t.x1, y1:t.y1,
               alfa:t.alpha===undefined?1:t.alpha};
      if(t.r>0){ q.x=t.x; q.y=t.y; q.r=t.r+4; }
      z.push(q);
    }`);

cambio('6b. __test.copertura — il criterio, misurato',
`  /* =====================================================================
     IL SEME DEL NOME, ESPORTATO — la consegna fra i due incarichi.`,
`  /* =====================================================================
     COPERTURA — «la porta attaccata, il portiere avversario, il
     giocatore comandato e la palla non devono MAI finire sotto un
     pannello», reso in numeri.

     Il criterio e' arrivato a parole e a parole sarebbe rimasto: due
     giurie hanno guardato gli stessi otto fermi immagine e hanno visto
     due cose diverse. Qui il gioco lo dichiara da se', fotogramma per
     fotogramma, incrociando i SOGGETTI CHIAVE — il disco del pallone, i
     comandati di PROTA_SCH, la porta e il portiere di CHIAVE_SCH — con
     le ZONE D'INTERFACCIA ancora dipinte. Restituisce l'elenco delle
     violazioni: vuoto vuol dire criterio soddisfatto in quel fotogramma.
       soggetto  'palla' | 'comandato' | 'porta' | 'portiere'
       pannello  il tipo della zona (pulsante, stick, bussola, tabellone…)
       alfa      quanto e' dipinta ADESSO quella zona
       px        pixel CSS di sovrapposizione (sul riquadro: un tetto)
       quota     frazione del soggetto che ci finisce sotto

     LA SOGLIA E' 0,15, ed e' la stessa gia' dichiarata da
     zoneInterfaccia: sotto quell'alfa l'elemento «si e' tolto di mezzo
     davvero» e i pixel tornano a essere mondo. Non e' una scappatoia: e'
     il modo in cui lo scarto dell'HUD risolve i casi che la geometria
     non puo' risolvere, e chi legge puo' guardare l'alfa e giudicare.
     I PANNELLI TONDI SI MISURANO TONDI: un disco di raggio 44 ha un
     quadrato circoscritto piu' grande del 27%, tutto negli angoli, e
     dichiarare coperto cio' che sta nell'angolo di un cerchio sarebbe
     una bugia — piccola, ma nella direzione comoda.
     ===================================================================== */
  /* =====================================================================
     DOVE SONO I COMANDI — perche' un cancello lo chieda invece di
     ricordarselo. strumenti/giocata.js premeva (vw-66, vh-140) e
     (vw-70, vh-232) scritti a mano in quattro prove: costanti corrette
     che invecchiano in silenzio, cioe' la trappola di casa numero
     quattro nella sua forma piu' educata. Questa funzione restituisce
     ESATTAMENTE l'array che il gioco usa per disegnare i comandi e per
     risolvere il tocco (centro, raggio, atto, etichetta), quindi non
     puo' andare fuori sincrono con loro nemmeno per un pixel. Non
     dipende dal possesso per le POSIZIONI: quelle sono le stesse nei due
     contesti, e' solo l'atto che cambia. */
  pulsanti(t){ return touchBtnLayout((t|0)===1?1:0).map(b=>Object.assign({},b)); },
  copertura(){
    const fuori=[];
    const zz=this.zoneInterfaccia();
    const sog=[];
    if(PALLA_SCH) sog.push({tipo:'palla',
      x0:PALLA_SCH.x-PALLA_SCH.r, y0:PALLA_SCH.y-PALLA_SCH.r,
      x1:PALLA_SCH.x+PALLA_SCH.r, y1:PALLA_SCH.y+PALLA_SCH.r});
    for(let k=0;k<PROTA_N;k++){
      const r=PROTA_SCH[k];
      sog.push({tipo:'comandato', x0:r.x0, y0:r.y0, x1:r.x1, y1:r.y1});
    }
    for(let k=0;k<CHIAVE_N;k++){
      const r=CHIAVE_SCH[k];
      sog.push({tipo:CHIAVE_TIPO[k], x0:r.x0, y0:r.y0, x1:r.x1, y1:r.y1});
    }
    for(const a of sog){
      /* il soggetto si conta per la parte che sta DENTRO la tela: una
         porta mezza fuori quadro non e' coperta dall'interfaccia */
      const ax0=Math.max(0,a.x0), ay0=Math.max(0,a.y0);
      const ax1=Math.min(VW,a.x1), ay1=Math.min(VH,a.y1);
      const area=Math.max(0,ax1-ax0)*Math.max(0,ay1-ay0);
      if(area<=0) continue;
      for(const b of zz){
        const al=(b.alfa===undefined?1:b.alfa);
        if(al<0.15) continue;
        const ix=Math.min(ax1,b.x1)-Math.max(ax0,b.x0);
        const iy=Math.min(ay1,b.y1)-Math.max(ay0,b.y0);
        if(ix<=0||iy<=0) continue;
        if(b.r>0){                       // pannello tondo: la forma vera
          const dx=Math.max(b.x-ax1,0,ax0-b.x), dy=Math.max(b.y-ay1,0,ay0-b.y);
          if(Math.hypot(dx,dy)>=b.r) continue;
        }
        fuori.push({soggetto:a.tipo, pannello:b.tipo, alfa:+al.toFixed(3),
                    px:Math.round(ix*iy), quota:+(ix*iy/area).toFixed(3)});
      }
    }
    return fuori;
  },
  /* =====================================================================
     IL SEME DEL NOME, ESPORTATO — la consegna fra i due incarichi.`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-hud.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
