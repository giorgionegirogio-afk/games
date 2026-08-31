/* =====================================================================
   _t-pollice-pagina.js — LA PAGINA DEI COMANDI, CHE NON C'ERA
   (29 agosto 2026).

   IL DIFETTO, e non e' «mancano delle opzioni». Il difetto e' che NON
   ESISTEVA UN POSTO DA CUI UN NUMERO DELLA GEOMETRIA DEI COMANDI POTESSE
   ARRIVARE. `touchBtnLayout` scriveva x, y e r come letterali
   (64/60/40, 158/72/30, 52/148/26, 136/158/26) e `defaultSave` non aveva
   un solo campo che parlasse del pollice: nelle Impostazioni sette voci
   piu' la riga della difficolta' (contate oggi sul DOM), zero sui
   comandi. Da quella porta chiusa dipendevano undici voci e
   mezza del confronto con FC Mobile (1, 10, 14, 17, 18, 19, 20, 25, 28,
   31, 32 e il residuo della 29).

   LA PORTA CHE SI APRE: SAVE.pollice{scala, spazio, mancino}, letto da
   touchBtnLayout attraverso due funzioni sole — pollice() che valida i
   tre numeri e pollicePosa() che li applica alla geometria — piu' una
   pagina COMANDI raggiungibile dalle Impostazioni E dalla pausa.

   ---------------------------------------------------------------------
   LA TRAPPOLA, ed e' la ragione per cui questa toppa non e' «moltiplica
   il raggio per la scala».

   La coppia piu' stretta di dischi e' TIRA-PASSA: 88,81 px fra i centri
   contro 86 di PRESE sommate (r+10, la stessa presa che Touch5.start
   usa), cioe' 2,81 px di margine. Ingrandire i raggi senza allontanare i
   centri li fa COLLIDERE, e il gioco-bugiardo che lo fa e' stato
   costruito e misurato (`_q-pollice.js --guasto scala-nuda`, 915x412):
   margine -7,09 px a taglia 115%, -16,99 a 130%, -30,24 a 150% — cioe'
   il dito che cerca PASSA arma TIRA. 27 combinazioni su 45 sotto il
   margine di serie. E' il rosso che il cancello sa accendere.

   LA CURA STA IN UNA RIGA: la distanza non cresce mai piu' piano del
   raggio.

       d = max(1, scala, spazio)

   Da qui, per ogni coppia e ogni combinazione, il margine non scende
   mai sotto quello di oggi e sopra la scala 1 cresce (la dimostrazione,
   due righe, sta accanto a pollicePosa nel gioco). Misurato a 915x412
   con strumenti/_q-pollice.js, 45 combinazioni su tre finestre:

     taglia  distanza   diametro   margine minimo   dischi sullo schermo
       85%     100%       68 px      12,71 px             3,06%
      100%     100%       80 px       2,81 px  (com'era)  4,08%
      115%     100%       92 px       6,24 px             5,23%
      130%     100%      104 px       9,66 px             6,54%
      150%     100%      120 px      14,22 px             8,50%
      100%     120%       80 px      20,58 px             4,08%
      100%     140%       80 px      38,34 px             4,08%
      150%     140%      120 px      14,22 px             8,50%

   E il conto degli UOMINI RIDIPINTI dai comandi, che e' il prezzo vero
   di una taglia grande (11 contro 11, 845x402, quattro semi, 1238
   campioni, righello a pixel — `_q-pollice.js --copertura`):

     taglia   uomini intaccati (oltre 1/4)   nascosti (oltre 1/2)
       85%             0,205                       0,006
      100%             0,242                       0,004
      115%             0,256                       0,001
      130%             0,249                       0,000
      150%             0,272                       0,000

   contro il tetto 0,38 e 0,05 di _q-dischi. La riga del 100% vale
   0,242 dove _q-dischi ne misura 0,243: i due righelli si danno
   ragione. Ingrandire i dischi COSTA — un ottavo in piu' di uomini
   intaccati fra 100% e 150%, da 0,242 a 0,272 per campione — ma resta
   sotto il tetto, e chi paga e' chi ha scelto.

   A scala 100% e spazio 100% la geometria e' IDENTICA AL BIT: d vale 1,
   e x = bx+(x-bx)*1, y = VH-(VH-y)*1, r = r*1 non spostano un pixel.
   Verificato confrontando __test.pulsanti(0) prima e dopo: 4 dischi su
   4, quattro campi su quattro, zero differenze.

   ---------------------------------------------------------------------
   IL MANCINO SPECCHIA TRE COSE, NON UNA. Girare i soli dischi li
   avrebbe seppelliti sotto la bussola: la minimappa vive inchiodata a
   x=12, cioe' nell'angolo basso-sinistro, e a specchio i dischi ci
   finiscono sopra per 1.836 px2 — misurato costruendo apposta il gioco
   che specchia i soli dischi (`_q-pollice.js --guasto mancino-monco`),
   contro 0 px2 dei due versi curati. Si specchiano insieme le tre cose
   che appartengono alle due mani:
     · i quattro dischi (touchBtnLayout);
     · la CASA DEL POLLICE, la piazzola riservata alla levetta a riposo
       (x 96 -> VW-96), che e' cio' che fa scendere la bussola;
     · la bussola stessa e il pannello dell'inferiorita' numerica, che
       abitano quell'angolo.
   Piu' la levetta della posa, cosi' le fotografie di scatta.js dicono la
   verita' anche a mancino acceso.
   In DUE giocatori il mancino non si applica: le due colonne di dischi
   occupano gia' tutti e due i lati, e specchiarle vorrebbe dire darle
   alla squadra sbagliata.

   ---------------------------------------------------------------------
   LA PAGINA DICE I NUMERI CHE MISURA, NON QUELLI CHE RICORDA. Il
   riquadro «com'e' adesso» chiama misurePollice(), che ricalcola
   touchBtnLayout con la finestra vera: diametro del disco grande,
   margine minimo fra le prese, percentuale di schermo. Se un giorno
   qualcuno cambia un raggio nel codice, la pagina lo dice il giorno
   stesso. Il cancello _q-pollice.js confronta quei tre numeri con la
   propria misura indipendente (C8): una voce che mentisse diventa rossa.

   COSA NON CAMBIA: il conto di dado() e di Math.random (verificato qui
   sotto dopo la sostituzione); l'ordine dei quattro dischi, che e' il
   contratto su cui il ri-armo di L1.1 rilegge il disco per indice; la
   forma letterale dell'elenco dentro touchBtnLayout, che cinque
   strumenti di casa leggono byte per byte (_q-dischi la scandisce con
   una regex che pretende `r:` seguito da cifre — per questo la scala si
   applica DOPO l'elenco e non dentro).

   Cancelli:
     node strumenti/collaudo.js    --gioco fuori/cmd-prima.html
     node strumenti/diritti.js     --gioco fuori/cmd-prima.html
     node strumenti/testo-fuori.js --gioco fuori/cmd-prima.html
     node strumenti/_q-carattere.js --gioco fuori/cmd-prima.html
     node strumenti/_q-dischi.js   --gioco fuori/cmd-prima.html
     node strumenti/_q-pollice.js  --gioco fuori/cmd-prima.html
     node strumenti/_q-pollice.js  --gioco fuori/cmd-prima.html --guasti

   uso:  node strumenti/_t-pollice-pagina.js --out fuori/cmd-prima.html
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

/* 1 — il salvataggio impara a parlare del pollice */
{
  /* =====================================================================
     0 — LA PAGINA STA SOPRA A CHI L'HA CHIAMATA, e senza questa riga non
     si puo' toccare.

     Il difetto, misurato da un critico avversario con elementFromPoint a
     passo di due pixel su ogni bottone — cioe' facendo al browser la
     stessa domanda che gli fa un dito:

       aperta da IMPOSTAZIONI   MANO 97,8%  TAGLIA 95,7%  INDIETRO 89,9%
       aperta dalla PAUSA       MANO   0%   TAGLIA   0%   INDIETRO   0%

     Zero. Il pannello nuovo nasce con la classe .ov, che porta
     z-index:20; il pannello di pausa vale z-index:45 ed e' fixed su
     inset:0, quindi intercetta OGNI pixel del vetro. La pagina si apriva
     sotto, si vedeva, e non rispondeva.

     La strada dei due tocchi da partita in corso — quella che la toppa
     vende come porta principale — era la sola completamente morta, e il
     cancello che la dichiarava verde non guardava chi riceve il tocco.

     Si alza sopra la pausa invece di chiudere la pausa: chiudendola
     bisognerebbe riaprirla al ritorno, e un pannello che si chiude e si
     riapre da solo e' un lampo che nessuno ha chiesto. Cosi' il velo
     scuro della pausa resta dietro, che e' anche piu' onesto — la
     partita e' ancora ferma li' sotto. */
  nome: '0/19 la pagina dei comandi sta SOPRA il pannello di pausa',
  cerca: `#pausa{z-index:45}`,
  metti: `#pausa{z-index:45}
/* la pagina dei comandi si apre anche DALLA pausa: senza un piano suo
   erediterebbe z-index:20 da .ov e finirebbe sotto il pannello che l'ha
   chiamata — visibile e non toccabile. Misurato: 0% dei bottoni
   raggiungibili da un dito. */
#comandi{z-index:50}`,
},

/* ---------------------------------------------------------------- 1 */
{
  nome: '1/19 SAVE.pollice nasce nel salvataggio di serie',
  cerca: `    moviola:1,                     // rivedere il gol al rallentatore`,
  metti:
`    /* =================================================================
       I TRE NUMERI DEL POLLICE, e sono i primi numeri della GEOMETRIA
       dei comandi che questo salvataggio abbia mai avuto. Prima di
       loro touchBtnLayout scriveva x, y e r come letterali e non
       esisteva un posto da cui un numero potesse arrivare: e' quella
       porta chiusa, non la mancanza di interruttori, il difetto che
       questa riga apre.
       In centesimi e non in frazioni perche' un salvataggio JSON con
       1.2999999999999998 dentro e' un salvataggio che ha gia' perso la
       sua leggibilita'. I valori di serie sono il gioco di ieri AL BIT:
       scala 100 e spazio 100 danno d=1, e la geometria non si sposta di
       un pixel (verificato su __test.pulsanti, 4 dischi su 4).
       ================================================================= */
    pollice:{ scala:100, spazio:100, mancino:0 },
    moviola:1,                     // rivedere il gol al rallentatore`,
},

/* 2 — e li rilegge come tutto il resto: solo chiavi note, solo numeri in
       un intervallo, nessuna fiducia */
{
  nome: '2/18 loadSave rilegge i tre numeri con i loro tetti',
  cerca: `    if(j.moviola===0||j.moviola===1) s.moviola=j.moviola;`,
  metti:
`    if(j.moviola===0||j.moviola===1) s.moviola=j.moviola;
    /* IL POLLICE, riletto con la disciplina del resto del blocco: solo le
       tre chiavi conosciute, solo numeri finiti, dentro l'intervallo che
       la pagina COMANDI offre. Un salvataggio manomesso non puo' chiedere
       dischi da mezzo schermo: pollice() ricontrolla comunque, ma il
       primo filtro sta qui, dove stanno tutti gli altri. */
    if(j.pollice&&typeof j.pollice==='object'){
      const pj=j.pollice;
      if(typeof pj.scala==='number'&&pj.scala>=85&&pj.scala<=150) s.pollice.scala=pj.scala|0;
      if(typeof pj.spazio==='number'&&pj.spazio>=100&&pj.spazio<=140) s.pollice.spazio=pj.spazio|0;
      s.pollice.mancino=pj.mancino?1:0;
    }`,
},

/* 3 — le due funzioni, accanto a dentroGliInserti: la geometria dei
       comandi vive tutta in queste tre righe di file */
{
  nome: '3/18 pollice() e pollicePosa() nascono accanto a dentroGliInserti',
  cerca: `function dentroGliInserti(dischi, verso){`,
  metti:
`/* =====================================================================
   I TRE NUMERI DEL POLLICE, LETTI UNA VOLTA SOLA.

   pollice() e' l'unico posto che tocca SAVE.pollice, e lo tocca sotto
   typeof: i banchi di casa che estraggono touchBtnLayout byte per byte
   (_q-precedenza.js) lo eseguono fuori dal gioco, dove SAVE non esiste,
   e devono ottenere i valori di serie invece di morire. I tetti sono
   ripetuti qui e in loadSave apposta: il salvataggio filtra cio' che
   entra, questa funzione difende cio' che esce, e nessuna delle due si
   fida dell'altra.
   ===================================================================== */
function pollice(){
  const P=(typeof SAVE!=='undefined'&&SAVE&&SAVE.pollice)||null;
  let k=P?+P.scala:100, sp=P?+P.spazio:100;
  if(!(k>=85&&k<=150)) k=100;
  if(!(sp>=100&&sp<=140)) sp=100;
  return { k:k/100, sp:sp/100, mn:!!(P&&P.mancino) };
}
/* =====================================================================
   LA SCALA SI PAGA SULLA DISTANZA, E LA REGOLA STA IN UNA RIGA.

   La coppia piu' stretta e' TIRA-PASSA: 88,81 px fra i centri contro 86
   di PRESE sommate (r+10, la stessa presa che Touch5.start usa per
   decidere quale disco ha ricevuto il dito), cioe' 2,81 px di margine.
   Ingrandire i raggi e basta li fa COLLIDERE: misurato su una copia
   costruita apposta per farlo (strumenti/_q-pollice.js --guasto
   scala-nuda) il margine diventa -7,09 px a taglia 115%, -16,99 a 130%
   e -30,24 a 150%, e il dito che cerca PASSA arma TIRA. Quindi la
   distanza NON PUO' CRESCERE PIU' PIANO DEL RAGGIO:

       d = max(1, scala, spazio)

   e da questa riga sola discende la garanzia, che vale per OGNI coppia
   di dischi e per OGNI combinazione delle due manopole. Chiamando
   m0 = dist - r_i - r_j - 20 il margine di oggi:
     · se scala <= 1: d >= 1 e i raggi calano, quindi
       margine = d*dist - k*(r_i+r_j) - 20 >= dist - r_i - r_j - 20 = m0;
     · se scala > 1: d >= scala, quindi
       margine >= k*(dist - r_i - r_j) - 20 >= m0, perche' k > 1 e
       (dist - r_i - r_j) e' positivo su tutte le coppie.
   Il margine non scende MAI sotto quello di oggi, e sopra 1 CRESCE:
   sulla coppia peggiore va da 2,81 px a 14,22 px a taglia 150%
   (misurato). Chi ha un
   pollice piu' grosso non ottiene solo bersagli piu' grossi: ottiene
   anche piu' spazio vuoto in mezzo, che e' meta' del problema.

   PERCHE' «spazio» E' UN PAVIMENTO E NON UN FATTORE IN PIU'. La strada
   d = scala*spazio e' stata provata e bocciata con la misura: con la
   combinazione estrema che il menu offre (taglia 150%, distanza 140%)
   d arriva a 2,1 e DUE dischi escono dallo schermo, il primo gia' a
   812x375 (misurato: _q-pollice.js --guasto spazio-moltiplicato, C5
   rosso). Si guadagnerebbe una spaziatura che nessuno ha chiesto e si
   perderebbe il disco. Con il massimo fra i tre, d non passa mai 1,5 e
   i quattro dischi restano interi su tutte e 45 le combinazioni delle
   tre finestre provate (915x412, 812x375, 640x360): 180 disco-
   combinazione, zero tagliati. Il prezzo dichiarato: a taglia 150% la
   manopola della distanza non fa piu' niente, perche' la taglia l'ha
   gia' alzata da sola — e la voce del menu lo dice invece di fingere.

   L'ELENCO ARRIVA GIA' FATTO, e resta letterale dentro touchBtnLayout
   perche' cinque strumenti di casa lo leggono byte per byte: _q-dischi
   lo scandisce con una regex che pretende «r:» seguito da CIFRE, e una
   moltiplicazione dentro l'elenco lo renderebbe cieco senza che nessuno
   se ne accorga. La scala si applica qui, dopo.
   ===================================================================== */
function pollicePosa(dischi, bx){
  const P=pollice(), k=P.k, d=Math.max(1, k, P.sp);
  for(const b of dischi){ b.x=bx+(b.x-bx)*d; b.y=VH-(VH-b.y)*d; b.r=b.r*k; }
  return dischi;
}
/* I TRE NUMERI DELLA PAGINA COMANDI, MISURATI E NON RICORDATI. Il
   riquadro «com'e' adesso» non stampa costanti: ricalcola la geometria
   vera con la finestra vera, cosi' il giorno in cui qualcuno cambia un
   raggio la pagina lo dice da sola. Il cancello _q-pollice.js confronta
   questi tre numeri con la propria misura indipendente. */
function misurePollice(){
  const b=touchBtnLayout(0);
  let mar=1e9, area=0, dia=0;
  for(let i=0;i<b.length;i++){
    area+=Math.PI*(b[i].r+4)*(b[i].r+4);
    dia=Math.max(dia,b[i].r*2);
    for(let j=i+1;j<b.length;j++)
      mar=Math.min(mar, Math.hypot(b[i].x-b[j].x,b[i].y-b[j].y)-(b[i].r+10)-(b[j].r+10));
  }
  return { diam:Math.round(dia), margine:+mar.toFixed(1),
           quota:+(area/Math.max(1,VW*VH)*100).toFixed(2) };
}
function dentroGliInserti(dischi, verso){`,
},

/* 4 — touchBtnLayout: da che parte sta la mano */
{
  nome: '4/18 touchBtnLayout sceglie il lato secondo la mano',
  cerca: `function touchBtnLayout(t){
  const right = (G.mode===2) ? (t===1) : true;`,
  metti:
`function touchBtnLayout(t){
  /* LA MANO. In UN giocatore i dischi stanno a destra perche' il pollice
     destro e' quello che li preme; a mancino acceso passano a sinistra e
     con loro la casa della levetta, la bussola e il pannello
     dell'inferiorita' (vedi pollice(): tre specchi, non uno).
     In DUE giocatori il mancino NON si applica e non e' una svista: le
     due colonne occupano gia' tutti e due i lati, e specchiarle vorrebbe
     dire dare i comandi alla squadra sbagliata. */
  const right = (G.mode===2) ? (t===1) : !pollice().mn;`,
},

/* 5 — e la geometria passa dalla scala prima degli inserti */
{
  nome: '5/18 l\'elenco letterale passa da pollicePosa prima degli inserti',
  cerca: `          : { act:'tackle',  label:'SCIVOLATA', x:bx+s*136, y:VH-158, r:26 },
  ], s);
}`,
  metti:
`          : { act:'tackle',  label:'SCIVOLATA', x:bx+s*136, y:VH-158, r:26 },
  /* L'ORDINE DELLE DUE OPERAZIONI CONTA. pollicePosa scala prima, gli
     inserti di sistema ritagliano dopo: se fosse al contrario un disco
     ingrandito potrebbe finire sotto la barra dei gesti di Android, che
     e' il difetto che dentroGliInserti esiste per chiudere. */
  ], bx), s);
}`,
},
{
  nome: '6/18 la chiamata a pollicePosa avvolge l\'elenco',
  cerca: `  return dentroGliInserti([
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }`,
  metti:
`  return dentroGliInserti(pollicePosa([
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }`,
},

/* 7 — la bussola segue la mano */
{
  nome: '7/18 la bussola si specchia col mancino',
  cerca: `  const mw=88*k, mh=43*k, mx=12;`,
  metti:
`  /* LA BUSSOLA STA NELL'ANGOLO LIBERO, E QUALE SIA LIBERO LO DECIDE LA
     MANO. A destrorso e' il basso-sinistra (i dischi sono a destra); a
     mancino i dischi passano di la' e senza questa riga ci finirebbero
     sopra — misurato: 3.848 px2 di sovrapposizione fra il disco TIRA e
     il riquadro della bussola. */
  const mw=88*k, mh=43*k, mx=pollice().mn ? Math.round(VW-12-mw) : 12;`,
},

/* 8 — la casa del pollice segue la mano */
{
  nome: '8/18 la casa della levetta si specchia col mancino',
  cerca: `  const lvX0=96-STICK_FULL-4, lvX1=96+STICK_FULL+4;`,
  metti:
`  /* la piazzola riservata alla levetta a riposo cambia lato con la mano:
     e' il pollice che MUOVE, e a mancino muove il destro */
  const lvCx=pollice().mn ? VW-96 : 96;
  const lvX0=lvCx-STICK_FULL-4, lvX1=lvCx+STICK_FULL+4;`,
},

/* 9 — il pannello dell'inferiorita' abita lo stesso angolo, e lo segue */
{
  nome: '9/18 l\'avviso dell\'inferiorita\' si specchia col mancino',
  cerca: `bh=22, bx=12, by=fondo-bh-dy; dy+=bh+5;`,
  metti: `bh=22, bx=(pollice().mn?Math.round(VW-12-bw):12), by=fondo-bh-dy; dy+=bh+5;`,
},

/* 10 — e la levetta della posa, cosi' le fotografie non mentono */
{
  nome: '10/18 la levetta della posa si specchia col mancino',
  cerca: `      s={ox:96,oy:VH-140,dx:0,dy:0};`,
  metti: `      s={ox:pollice().mn?VW-96:96,oy:VH-140,dx:0,dy:0};`,
},

/* 11 — il banco puo' leggere i tre numeri come li legge il gioco */
{
  nome: '11/18 __test espone i tre numeri del pollice e le tre misure',
  cerca: `  saveKey:SAVE_KEY,`,
  metti:
`  saveKey:SAVE_KEY,
  /* i tre numeri del pollice COME LI LEGGE touchBtnLayout (non come li
     scrive il salvataggio: fra i due c'e' pollice(), che valida), e le
     tre misure che la pagina COMANDI stampa. Il cancello _q-pollice.js
     confronta queste ultime con la propria misura indipendente. */
  get pollice(){ return pollice(); },
  misurePollice:()=>misurePollice(),`,
},

/* 12 — il vestito della pagina nuova */
{
  nome: '12/18 il foglio di stile della pagina COMANDI',
  cerca: `.pausacmd{max-width:340px;margin:-6px auto 16px;text-align:center;
  font-family:var(--cond);font-weight:600;font-size:11.5px;letter-spacing:.09em;
  text-transform:uppercase;color:var(--grigio)}`,
  metti:
`.pausacmd{max-width:340px;margin:-6px auto 16px;text-align:center;
  font-family:var(--cond);font-weight:600;font-size:11.5px;letter-spacing:.09em;
  text-transform:uppercase;color:var(--grigio)}
/* =====================================================================
   LA PORTA DEI COMANDI DENTRO LA PAUSA NON COSTA UNA RIGA.
   Il pannello di pausa e' gia' al limite dell'altezza su uno schermo da
   412 px: c'e' un commento qui sopra che racconta come ABBANDONA fosse
   finito col centro a y=428, e la cura fu stringere tutto. Una sesta
   voce lo rimetterebbe la'. Percio' la porta e' un bottone IN LINEA
   dentro la riga che gia' descrive i comandi: zero pixel di altezza
   nuovi, e sta esattamente dove uno la cerca.
   ===================================================================== */
.cmdlink{display:inline;background:none;border:0;padding:0 0 0 6px;cursor:pointer;
  font-family:var(--cond);font-weight:800;font-size:11.5px;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ambra);text-decoration:underline;
  text-underline-offset:2px}
.cmdlink:hover,.cmdlink:focus-visible{color:var(--gesso)}
/* il riquadro «com'e' adesso»: tre numeri MISURATI a ogni apertura, nel
   gesso della lavagna, e la stessa ardesia di tutti i pannelli.
   IL «grid-column» NON E' DI TROPPO fuori dalla media query: .setwrap e'
   una colonna flex finche' lo schermo e' alto, e li' la riga e' inerte;
   diventa una griglia a due colonne sotto i 470 px di altezza, ed e'
   allora che serve — se no il riquadro dei tre numeri sta in mezza
   pagina e accanto gli resta un buco, che e' il difetto che questa casa
   ha gia' pagato su AZZERA TUTTI I DATI. Stessa cura, stesso motivo.
   MANO prende la riga intera per la ragione opposta: e' la voce che non
   ha compagna (TAGLIA e DISTANZA sono una coppia), e da sola in colonna
   lasciava il buco dall'altra parte. */
.cmdmis{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;
  grid-column:1 / -1;
  padding:10px 14px;border:2px solid var(--legno);border-radius:2px;
  background:linear-gradient(180deg,var(--ardesia-luce),var(--ardesia) 60%,var(--ardesia-ombra))}
.setwrap>#btnCmdMano{grid-column:1 / -1}
.cmdmis div{text-align:center;flex:1 1 30%}
.cmdmis b{display:block;font-family:var(--cond);font-weight:800;font-size:19px;color:var(--gesso)}
.cmdmis span{display:block;font-family:var(--cond);font-weight:600;font-size:9.5px;
  letter-spacing:.13em;text-transform:uppercase;color:var(--grigio)}`,
},

/* 13 — la voce che apre la pagina, nelle Impostazioni */
{
  nome: '13/18 la sezione COMANDI compare nelle Impostazioni',
  cerca: `      <div class="eti">Accessibilit&agrave;</div>`,
  metti:
`      <!-- LA SEZIONE CHE NON C'ERA. Otto voci di impostazioni e nessuna
           sui comandi: era il cancello di undici voci e mezza del
           confronto. Sta PRIMA di Accessibilita' perche' la geometria
           del pollice e' la cosa che si sbaglia per prima su un telefono
           nuovo, e dopo Gioco perche' audio e vibrazione sono i due
           interruttori che tutti cercano per primi. -->
      <div class="eti">Comandi</div>
      <button class="voce" id="btnSetComandi">COMANDI SUL VETRO <small>mano, taglia dei dischi, distanza fra i dischi</small></button>
      <div class="eti">Accessibilit&agrave;</div>`,
},

/* 14 — la pagina */
{
  nome: '14/18 la pagina COMANDI entra nel documento',
  cerca: `<!-- ============ RUOTA IL TELEFONO (partita in portrait) ============ -->`,
  metti:
`<!-- ============ COMANDI ============ -->
<!-- LA PAGINA CHE NON C'ERA. Si apre dalle IMPOSTAZIONI e dalla PAUSA —
     cioe' anche a partita in corso, che e' quando uno si accorge che i
     dischi sono troppo piccoli — e per questo non passa da goScreen: la
     pausa non e' una schermata di SCREENS e goScreen la lascerebbe sotto
     mentre porta il menu sopra al campo. Si apre e si chiude a mano, e
     il tasto Indietro di Android la chiude per prima. -->
<div id="comandi" class="ov hidden">
  <div class="box">
    <h1 class="sotto-titolo">COMANDI</h1>
    <div class="setwrap">
      <div class="eti">Il pollice</div>
      <button class="voce sw" id="btnCmdMano">MANO: DESTRA</button>
      <button class="voce" id="btnCmdScala">TAGLIA DEI DISCHI: 100%</button>
      <button class="voce" id="btnCmdSpazio">DISTANZA FRA I DISCHI: 100%</button>
      <div class="eti">Com'&egrave; adesso</div>
      <!-- TRE NUMERI MISURATI, NON RICORDATI: li ricalcola misurePollice()
           sulla finestra vera a ogni apertura e a ogni tocco. -->
      <div class="cmdmis" id="cmdMisura"></div>
    </div>
    <div style="height:16px"></div>
    <div class="azioni"><button class="btnA sec" id="btnBackComandi">INDIETRO</button></div>
  </div>
</div>

<!-- ============ RUOTA IL TELEFONO (partita in portrait) ============ -->`,
},

/* 15 — la riga della pausa diventa una porta */
{
  nome: '15/18 la riga dei comandi in pausa porta alla pagina, e dice la mano',
  cerca: `    { const pc=document.getElementById('pausaCmd');
      if(pc) pc.textContent = InputPref.touch
        ? 'Stick a sinistra · quattro dischi che cambiano col possesso: TIRA, FILTRANTE, PASSA e CROSS'
        : 'C passa · X tira · E filtrante · Z contrasta · Q cambia · Shift scatto'; }`,
  metti:
`    /* LA RIGA DICE LA VERITA' SUL LATO. Diceva «Stick a sinistra» anche
       a mancino acceso, cioe' avrebbe mentito il giorno stesso in cui il
       mancino e' nato: adesso il lato lo legge da pollice(), che e' la
       stessa funzione da cui lo legge touchBtnLayout. */
    { const pc=document.getElementById('pausaCmd');
      if(pc){
        const mn=pollice().mn;
        pc.innerHTML = (InputPref.touch
          ? 'Stick a '+(mn?'destra':'sinistra')+' · quattro dischi a '+(mn?'sinistra':'destra')+' che cambiano col possesso: TIRA, FILTRANTE, PASSA e CROSS'
          : 'C passa · X tira · E filtrante · Z contrasta · Q cambia · Shift scatto')
          + '<button class="cmdlink" id="btnPauseComandi" type="button">cambia</button>';
      } }`,
},

/* 16 — il comportamento: tre voci, tre cicli, un riquadro che misura */
{
  nome: '16/18 la pagina COMANDI prende vita',
  cerca: `$('btnSetMoviola').addEventListener('click', ()=>{
  SAVE.moviola = SAVE.moviola?0:1; persistSave(); refreshImpostUI(); Audio5.beep(440);
});`,
  metti:
`/* =====================================================================
   LA PAGINA DEI COMANDI, VIVA.

   Tre voci, e ognuna cicla su una scala DICHIARATA invece che su un
   cursore: un cursore continuo su un vetro chiede una precisione che il
   pollice non ha, e sotto ogni gradino ci sono cinque pixel di
   differenza che nessuno vede. I gradini sono cinque e tre perche' fra
   85% e 150% ci stanno le due mani vere — quella che vuole piu' campo e
   quella che vuole piu' bersaglio — e oltre 150% i dischi comincerebbero
   a mangiare il campo piu' di quanto il pollice ci guadagni (a 150% sono
   gia' il 9,2% dello schermo contro il 4,1% di serie).

   IL RIQUADRO SOTTO NON E' DECORAZIONE: e' il modo in cui questa pagina
   rispetta la regola dei numeri veri. Non stampa costanti, chiama
   misurePollice() che ricalcola touchBtnLayout con la finestra di
   adesso. Chi sposta un raggio nel codice vede il numero cambiare senza
   toccare una riga di testo.
   ===================================================================== */
const POLL_SCALA=[85,100,115,130,150], POLL_SPAZIO=[100,120,140];
function pollGiro(elenco, v){ const i=elenco.indexOf(v|0); return elenco[(i<0?0:i+1)%elenco.length]; }
function refreshComandiUI(){
  if(!SAVE.pollice) SAVE.pollice={scala:100,spazio:100,mancino:0};
  const P=SAVE.pollice;
  const bm=$('btnCmdMano');
  if(bm){
    bm.innerHTML='MANO: '+(P.mancino?'SINISTRA':'DESTRA')+
      ' <small>'+(P.mancino
        ? 'dischi a sinistra, levetta e bussola a destra'
        : 'dischi a destra, levetta e bussola a sinistra')+'</small>';
    bm.classList.toggle('on', !!P.mancino);
  }
  const bs=$('btnCmdScala');
  if(bs) bs.innerHTML='TAGLIA DEI DISCHI: '+P.scala+'% <small>da 85 a 150 — la distanza cresce con loro, cos&igrave; le prese non si toccano mai</small>';
  const bp=$('btnCmdSpazio');
  /* LA VOCE DICE ANCHE QUANDO NON FA NIENTE. La distanza vera e' il
     massimo fra questa manopola e la taglia: a taglia 150% e distanza
     120% comanda la taglia, e una voce che tacesse lascerebbe credere a
     un tocco senza effetto. */
  if(bp) bp.innerHTML='DISTANZA FRA I DISCHI: '+P.spazio+'% <small>'+
    (P.scala>P.spazio ? 'la taglia al '+P.scala+'% la tiene gi&agrave; pi&ugrave; larga'
                      : 'allontana i quattro dischi senza ingrandirli')+'</small>';
  const mm=$('cmdMisura');
  if(mm){
    const m=misurePollice();
    mm.innerHTML='<div><b>'+m.diam+' px</b><span>disco grande</span></div>'+
                 '<div><b>'+m.margine.toFixed(1).replace('.',',')+' px</b><span>fra due prese</span></div>'+
                 '<div><b>'+m.quota.toFixed(1).replace('.',',')+'%</b><span>di schermo</span></div>';
  }
  const bc=$('btnSetComandi');
  if(bc) bc.innerHTML='COMANDI SUL VETRO <small>'+(SAVE.pollice.mancino?'mano sinistra':'mano destra')+
    ' — dischi al '+SAVE.pollice.scala+'%, distanza al '+SAVE.pollice.spazio+'%</small>';
}
/* da dove si e' entrati: dalle Impostazioni si torna alle Impostazioni,
   dalla pausa si torna alla pausa — che e' ancora li' sotto */
let comandiDa='';
function apriComandi(da){
  comandiDa=da;
  refreshComandiUI();
  show($('comandi'));
}
function chiudiComandi(){
  hide($('comandi'));
  if(comandiDa==='impost'){ goScreen(ui.impostazioni); refreshImpostUI(); }
  comandiDa='';
}
$('btnSetComandi').addEventListener('click', ()=>{ Audio5.unlock(); Audio5.beep(520); apriComandi('impost'); });
$('btnBackComandi').addEventListener('click', ()=>{ Audio5.unlock(); chiudiComandi(); });
/* il bottone della pausa nasce e muore a ogni apertura del pannello
   (setPaused riscrive la riga): si ascolta il contenitore, che non
   cambia mai, invece di riagganciare un ascoltatore ogni volta */
$('pausaCmd').addEventListener('click', e=>{
  if(!e.target || e.target.id!=='btnPauseComandi') return;
  Audio5.unlock(); Audio5.beep(520); apriComandi('pausa');
});
$('btnCmdMano').addEventListener('click', ()=>{
  Audio5.unlock(); Audio5.beep(500);
  SAVE.pollice.mancino = SAVE.pollice.mancino?0:1;
  persistSave(); refreshComandiUI();
});
$('btnCmdScala').addEventListener('click', ()=>{
  Audio5.unlock(); Audio5.beep(540);
  SAVE.pollice.scala = pollGiro(POLL_SCALA, SAVE.pollice.scala);
  persistSave(); refreshComandiUI();
});
$('btnCmdSpazio').addEventListener('click', ()=>{
  Audio5.unlock(); Audio5.beep(560);
  SAVE.pollice.spazio = pollGiro(POLL_SPAZIO, SAVE.pollice.spazio);
  persistSave(); refreshComandiUI();
});
$('btnSetMoviola').addEventListener('click', ()=>{
  SAVE.moviola = SAVE.moviola?0:1; persistSave(); refreshImpostUI(); Audio5.beep(440);
});`,
},

/* 17 — la voce delle Impostazioni dice lo stato senza che nessuno gliel'abbia
       scritto a mano */
{
  nome: '17/18 refreshImpostUI ridipinge anche la voce COMANDI',
  cerca: `  $('btnSetMoviola').classList.toggle('on', !!SAVE.moviola);
}`,
  metti:
`  $('btnSetMoviola').classList.toggle('on', !!SAVE.moviola);
  /* LA VOCE COMANDI PORTA IL SUO STATO ADDOSSO, come tutte le altre di
     questa pagina: chi apre le Impostazioni legge la mano e le due
     percentuali senza dover entrare. La stringa la scrive
     refreshComandiUI, cosi' esiste UNA sola frase per quello stato. */
  refreshComandiUI();
}`,
},

/* 18 — il tasto Indietro chiude prima la pagina */
{
  nome: '18/18 il tasto Indietro chiude prima la pagina dei comandi',
  cerca: `window.__indietro = function(){
  const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='golden'||
                  G.scene==='goal'||G.scene==='freekick';`,
  metti:
`window.__indietro = function(){
  const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='golden'||
                  G.scene==='goal'||G.scene==='freekick';

  /* LA PAGINA DEI COMANDI SI CHIUDE PER PRIMA. E' l'unica che si apre
     SOPRA la pausa: senza questa riga il tasto Indietro riprenderebbe la
     partita lasciandola aperta sopra il campo, cioe' un pannello che
     copre il gioco e non risponde piu' a niente. */
  { const cm=$('comandi');
    if(cm && !cm.classList.contains('hidden')){ chiudiComandi(); return true; } }`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-pollice-pagina.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}
if (haFlag('dentro')) { console.error('FALLITO: --dentro non e\' ammesso in questa casa. Si prova su copia con --out.'); process.exit(2); }

const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }
let outFile = arg('out', '');
if (!outFile) outFile = 'fuori/cmd-prima.html';
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

/* I CONTROLLI DOPO LA SOSTITUZIONE. Non «ha funzionato?» ma «il file che
   esce ha esattamente la forma che questa toppa promette?». */
const attesi = [
  ['function pollice(){', 1],
  ['function pollicePosa(dischi, bx){', 1],
  ['function misurePollice(){', 1],
  ['return dentroGliInserti(pollicePosa([', 1],
  ['  ], bx), s);', 1],
  ['pollice:{ scala:100, spazio:100, mancino:0 },', 1],
  ['id="comandi"', 1],
  ['id="btnCmdMano"', 1],
  ['id="btnCmdScala"', 1],
  ['id="btnCmdSpazio"', 1],
  ['id="btnSetComandi"', 1],
  ['id="btnPauseComandi"', 1],
  /* l'elenco letterale dei quattro dischi NON e' stato toccato: e' la
     forma che _q-dischi scandisce con una regex che pretende cifre */
  ["x:bx+s*64,  y:VH-60,  r:40 }", 2],
  ["x:bx+s*158, y:VH-72,  r:30 }", 2],
  ["x:bx+s*52,  y:VH-148, r:26 }", 2],
  ["x:bx+s*136, y:VH-158, r:26 }", 2],
  /* e la vecchia forma del lato non esiste piu' */
  ['const right = (G.mode===2) ? (t===1) : true;', 0],
  ['const mw=88*k, mh=43*k, mx=12;', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => JSON.stringify(s) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

/* LA LEGGE SUI SORTEGGI, verificata e non data per scontata: questa toppa
   non aggiunge ne' toglie una chiamata a dado(), e nemmeno un Math.random
   di contrabbando. Si contano tutt'e due i modi, quello letterale e
   quello largo del modello di casa. */
const conta = (s, re) => (s.match(re) || []).length;
const d0 = conta(src, /dado\(/g), d1 = conta(out, /dado\(/g);
const l0 = conta(src, /\bdado\s*\(/g), l1 = conta(out, /\bdado\s*\(/g);
const r0 = conta(src, /Math\.random\s*\(/g), r1 = conta(out, /Math\.random\s*\(/g);
if (d0 !== d1 || l0 !== l1) { console.error('FALLITO: dado() ' + d0 + ' -> ' + d1 + ' (largo ' + l0 + ' -> ' + l1 + ')'); process.exit(1); }
if (r0 !== r1) { console.error('FALLITO: Math.random ' + r0 + ' -> ' + r1); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati · dado() ' + d1 + ' invariate (largo ' + l1 + ') · Math.random ' + r1 + ' invariate');
console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri)');
