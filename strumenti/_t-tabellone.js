/* =====================================================================
   _t-tabellone.js — LA LAVAGNETTA LARGA QUANTO CIO' CHE C'E' SCRITTO
   SOPRA (29 agosto 2026).  Si applica a una COPIA: qui dentro non
   esiste nessuna opzione per scrivere sul gioco spedito.

   IL DIFETTO, MISURATO E NON DEDOTTO. Tutti i numeri di questa testata
   vengono da strumenti/_q-tabellone.js, che il tabellone lo TOGLIE dal
   fotogramma e conta i pixel che cambiano: 915x412, 11 contro 11, semi
   20260829/30/31, 60 campioni a pixel su 1800 fotogrammi, base
   CALCETTO-il-gioco.html md5 2109f7546a17d161d293b67397851fae.

   Il tabellone del punteggio e' l'oggetto d'interfaccia piu' grande del
   gioco: 512x45 px, cioe' il 6,11% dello schermo DICHIARATO e il 7,66%
   DIPINTO (circa 28.900 px medi — il piede sfumato di 12 px non sta nel
   rettangolo che il gioco dichiara, ma i suoi pixel ci sono).
   Di quei 512 px, 209 sono ARIA. I due nomi di squadra vivono in due
   riquadri da 150 px l'uno, larghi per un nome che non c'e': DOPOLAVORO
   ne occupa 69,4 e CPU 21,1. Il resto e' ardesia vuota, e si vede: fra
   il punteggio e la scritta CPU corre un vuoto di 127 px — misurato a
   pixel, non a occhio (la corsa piu' lunga di colonne senza inchiostro
   dentro il pannello; la media sui 60 campioni e' 106).
   E l'aria non e' gratis. Il pannello e' opaco, quindi:
     · il punto 6-quater di updateCamera mette un soffitto al comandato
       ogni volta che passa nella fascia BAR_X0-24..BAR_X1+24, che e'
       larga 560 px su 915 — il 61,2% del quadro, e il comandato ci
       cammina dentro nell'89,4% dei fotogrammi;
     · velaTabellone sbianca la lavagnetta a 0,34 quando una figura le
       passa sotto, e con un pannello cosi' largo succede nell'82,6% dei
       fotogrammi: il punteggio si legge velato quasi sempre;
     · 0,831 uomini per fotogramma hanno almeno un quarto di sagoma sotto
       la lavagnetta.
   Il commento del gioco, intanto, prometteva gia' cio' che non era vero:
   «adesso e' un tabellone largo quanto il suo contenuto — sbarra, nome,
   punteggio, cronometro, punteggio, nome, sbarra — piu' 14 px di respiro
   per lato». Era vero dei RIQUADRI, non del contenuto.

   IL DOPO, con lo stesso righello e le stesse tre partite:
     dipinto      ~28.900 px (7,66%) -> ~20.500 px (5,45%)   -28,9%
     dichiarato   23.040 px (6,11%)  ->  16.335 px (4,33%)
     vuoto        127 px             ->  28 px
     fascia regia 61,2% del quadro   ->  44,9%
     velata       82,6% dei fotogr.  ->  61,6%
     uomini sotto 0,831 per fotogr.  ->  0,564             -32,1%

   LA CURA, e la sua unica idea. La stessa medicina che il 28 agosto ha
   guarito l'avviso di inferiorita' numerica («IL RIQUADRO SI MISURA SUL
   TESTO. Era largo 126 per sempre, e 126 e' un numero che invecchia»):
   la geometria della lavagnetta si MISURA sul testo che ci va sopra.
   I nomi smettono di stare appesi ai bordi esterni e si accostano al
   punteggio, a sei pixel dalla pasticca delle cifre; le sbarre
   d'identita' li seguono; il pannello finisce quattordici pixel dopo la
   sbarra, come ha sempre fatto.

   IL TETTO E' LA LARGHEZZA DI IERI, AL PIXEL. Il riquadro del nome
   passa da 150 a 120 px f-scalati, ed e' il numero che rende la cura
   una monotona: con due nomi larghi esattamente 120f la formula nuova
   ridiventa, termine per termine, quella vecchia
     BAR_X0 = VW/2 - (92+120+24)f - 14   = VW/2 - 236f - 14
     BAR_X1 = VW/2 + (92+120+18)f + 6+sk+14 = VW/2 + 230f + 6 + sk + 14
   cioe' 208 e 720 a 915x412, gli stessi due numeri di ieri: il tabellone
   NON PUO' essere piu' largo di quanto era. Con lettere vere il limite
   non si tocca nemmeno — il nome piu' largo che il riquadro accetta e'
   undici W (113,7 px) e da' un pannello di 499 px su 512.
   Il prezzo, dichiarato: un nome piu' lungo di 120f px scende al gradino
   degli 11 px trenta pixel prima di prima, e se non basta si tronca con
   l'ellissi trenta pixel prima. Sui nomi che il gioco puo' davvero avere
   non succede mai: SAVE.teamName e' tagliato a 12 caratteri, e dodici M
   — le lettere piu' larghe dell'alfabeto — misurano 98,6 px in Barlow
   Condensed 700 a 15 px, contro un tetto di 120.

   COSA NON CAMBIA: le cifre. Punteggio a cx +-58f, cronometro di 68 px
   al centro, pasticca a +-86f, corpi 26/20/15/11 — non si sposta un
   pixel di cio' che si legge, e la toppa pretende quelle tre righe
   invariate parola per parola (vedi ATTESI). La simulazione nemmeno: il
   conto di dado() resta 86 (verificato a ogni applicazione, qui sotto) e
   strumenti/_z-tab-identico.js ha giocato le stesse sei partite (5 e 11
   contro 11, tre semi, 1800 passi) sui due file trovando gli stessi
   sorteggi consumati, lo stesso pallone al sesto decimale, gli stessi
   ventidue uomini e lo stesso punteggio.

   UN RITARDO DI UN FOTOGRAMMA, DICHIARATO. La larghezza la scrive
   drawHUD, che gira dopo updateCamera: il primo fotogramma dopo un
   cambio di NOME la camera lavora ancora con la larghezza di prima.
   Dura un fotogramma e capita solo quando la squadra cambia nome, cioe'
   in un menu; e prima di oggi non capitava affatto perche' la larghezza
   non dipendeva dal nome.

   TREDICI ANCORAGGI:
     1   lo stato della lavagnetta nasce accanto a BAR_X0, e il commento
         che diceva «il 56% del quadro» dice il vero
     2   resize() smette di rifare l'aritmetica di drawHUD e chiama la
         funzione sola
     3   aggiornaTabellone(), la funzione sola, davanti a drawHUD
     4   drawHUD legge f e sk invece di ricalcolarli
     5   px0/px1 dicono da dove vengono
     6   le sbarre stanno dove il nome le ha lasciate
     7   il verbale dei nomi
     7b  e il ciclo che li dipinge, con la misura gia' presa (una misura,
         due usi: geometria e disegno)
     8   la pasticca dichiara la sua frazione vera
     9a-d  i quattro verbali della camera e del velo smettono di dire 56%

   uso:
     node strumenti/_t-tabellone.js --out fuori/cmd-tabellone.html
     node strumenti/_t-tabellone.js --in fuori/base.html --out fuori/x.html
     node strumenti/_t-tabellone.js --elenco
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

/* ------------------------------------------------------------------ 1 */
{
  nome: '1/13 lo stato della lavagnetta accanto a BAR_X0 (e il 56% che non e\' piu\' vero)',
  cerca:
`/* IL TABELLONE E' LARGO IL 56% DEL QUADRO, NON IL 100% — e questi due
   numeri sono la differenza fra una regia libera e una strozzata.
   La barra del punteggio e' una lavagnetta appesa: comincia a BAR_X0 e
   finisce a BAR_X1 (vedi drawHUD, che li legge da qui e non li ricalcola:
   due copie della stessa geometria sono il modo piu' elegante di far
   divergere una regola dal suo disegno). Ai suoi lati, per il 44% della
   larghezza, sopra c'e' CAMPO: una figura che passa di li' non viene
   ghigliottinata da niente, e la camera non ha nessuna ragione di
   fermarsi per lei. Fino a ieri il punto 6 di updateCamera trattava
   l'intera fascia alta come opaca, e misurato sull'istante 1 del banco
   costava venti unita' di corsa alla camera — cioe' la sponda bassa
   mancata per otto unita'. */
let BAR_X0=0, BAR_X1=0;`,
  metti:
`/* IL TABELLONE E' LARGO QUANTO IL SUO CONTENUTO, NON QUANTO IL QUADRO —
   e questi due numeri sono la differenza fra una regia libera e una
   strozzata.
   La barra del punteggio e' una lavagnetta appesa: comincia a BAR_X0 e
   finisce a BAR_X1 (vedi drawHUD, che li legge da qui e non li ricalcola:
   due copie della stessa geometria sono il modo piu' elegante di far
   divergere una regola dal suo disegno). Ai suoi lati sopra c'e' CAMPO:
   una figura che passa di li' non viene ghigliottinata da niente, e la
   camera non ha nessuna ragione di fermarsi per lei. Fino a ieri il
   punto 6 di updateCamera trattava l'intera fascia alta come opaca, e
   misurato sull'istante 1 del banco costava venti unita' di corsa alla
   camera — cioe' la sponda bassa mancata per otto unita'.
   QUANTO E' LARGA, OGGI: la scrive aggiornaTabellone() misurando i due
   nomi di squadra. Col nome di serie — DOPOLAVORO contro CPU, a 915x412
   — sono 363 px su 915, il 39,7% del quadro; era il 55,96% (512 px), e
   la differenza erano 149 px di ardesia vuota. Il tetto resta la
   larghezza di ieri AL PIXEL: due nomi al massimo del riquadro (120f px
   l'uno) rifanno esattamente 512. */
let BAR_X0=0, BAR_X1=0;
/* Lo stato che aggiornaTabellone() scrive e drawHUD legge: la scala f e
   l'inclinazione sk delle sbarre, l'ascissa delle due sbarre, e per ogni
   squadra il nome COME VERRA' DIPINTO — testo gia' troncato, corpo gia'
   scelto, larghezza gia' misurata, ascissa del bordo sinistro. Una
   misura sola, due usi: la geometria del pannello e il disegno del nome.
   Se fossero due, il pannello e la scritta divergerebbero il giorno in
   cui cambia il carattere — ed e' gia' successo, il 28 agosto, quando
   Barlow Condensed ha spostato tutte le larghezze del gioco. */
let TAB_F=1, TAB_SK=0;
const TAB_SB=[0,0];
const TAB_NOMI=[{testo:'',fs:15,largo:0,x:0},{testo:'',fs:15,largo:0,x:0}];
/* IL TETTO DEL NOME, in px f-scalati. Era 150, ed e' 120 per una ragione
   aritmetica: 92 (dove comincia il nome, sei pixel oltre la pasticca) +
   120 + 24 (l'aria fino alla sbarra) = 236, cioe' l'esatta ascissa della
   sbarra di ieri. Con questo numero, e solo con questo, il pannello
   nuovo non puo' MAI essere piu' largo di quello vecchio. */
const TAB_NW=120;`,
},

/* ------------------------------------------------------------------ 2 */
{
  nome: '2/13 resize() chiama la funzione sola invece di rifare l\'aritmetica',
  cerca:
`  {
    /* la stessa aritmetica di drawHUD, fatta una volta sola al resize */
    const fB=clamp((VW/2-52)/248,0.52,1), skB=Math.tan(16*Math.PI/180)*(BAR_H-3);
    BAR_X0=Math.round(VW/2-236*fB-14);
    BAR_X1=Math.round(VW/2+230*fB+6+skB+14);
  }`,
  metti:
`  /* la geometria della lavagnetta: la scrive aggiornaTabellone() e la
     chiamano in due — qui, perche' il primo fotogramma non nasca con un
     BAR_X0 a zero, e drawHUD, perche' il nome della squadra puo'
     cambiare fra due resize e cambia davvero (spogliatoio, campionato,
     due giocatori). Chi scrive resta uno solo. */
  aggiornaTabellone();`,
},

/* ------------------------------------------------------------------ 3 */
{
  nome: '3/13 aggiornaTabellone(), la funzione sola, davanti a drawHUD',
  cerca:
`const BAR_CIFRE={x0:0,y0:0,x1:0,y1:0};
function drawHUD(){`,
  metti:
`const BAR_CIFRE={x0:0,y0:0,x1:0,y1:0};
/* =====================================================================
   LA GEOMETRIA DELLA LAVAGNETTA — UNA FUNZIONE SOLA (29 agosto 2026).

   Prende i due nomi di squadra, sceglie il corpo (15, poi il gradino
   degli 11, poi l'ellissi) e li MISURA col carattere vero. Da quelle due
   larghezze discende tutto il resto: dove comincia il nome, dove sta la
   sbarra d'identita', dove finisce il pannello.

   L'ORDINE, da dentro a fuori, per lato:
     +-86f   il bordo della pasticca delle cifre (non si tocca)
     +-92f   sei pixel d'aria, e comincia il nome
     +largo  il nome, come verra' dipinto
     +24f    l'aria fino alla sbarra (a sinistra; a destra 18f, che e' la
             stessa aria vista dall'altra parte di una sbarra inclinata:
             la «/» si allontana in alto a sinistra e in basso a destra,
             ed erano gia' i due numeri di ieri, 236-212 e 230-212)
     +6+sk   la sbarra, larga 6 e sghemba di sk
     +14     il respiro del pannello, quello di sempre

   PERCHE' NON SI PUO' ALLARGARE. Con largo = TAB_NW*f la catena da'
   BAR_X0 = VW/2 - (92+120+24)f - 14 = VW/2 - 236f - 14 e
   BAR_X1 = VW/2 + (92+120+18)f + 6 + sk + 14 = VW/2 + 230f + 6 + sk + 14:
   sono, termine per termine, le due righe che stavano in resize() prima
   di oggi. Il pannello nuovo e' quello vecchio meno l'aria che i nomi
   non usano.

   COSTA DUE measureText per fotogramma nel caso normale — gli stessi che
   drawHUD spendeva gia' per decidere se troncare: qui si spendono una
   volta e si usano due volte, per il pannello e per la scritta.
   ===================================================================== */
function aggiornaTabellone(){
  const cx=VW/2, HB=BAR_H-3;
  /* le misure sono tarate sul telefono in orizzontale (915 px): su
     schermi piu' stretti si comprimono in blocco invece di accavallarsi */
  TAB_F=clamp((VW/2-52)/248,0.52,1);
  TAB_SK=Math.tan(16*Math.PI/180)*HB;
  const f=TAB_F, nw=TAB_NW*f;
  const nomi=[(G.teamName||'FLUO'), (G.oppName||'CPU')];
  const fontEra=ctx.font;
  for(let t=0;t<2;t++){
    let fs=15, nome=nomi[t];
    ctx.font='700 '+fs+'px '+FONT_C;
    let w=ctx.measureText(nome).width;
    if(w>nw){ fs=11; ctx.font='700 '+fs+'px '+FONT_C; w=ctx.measureText(nome).width; }
    if(w>nw){
      while(nome.length>1 && (w=ctx.measureText(nome+'…').width)>nw) nome=nome.slice(0,-1);
      nome+='…';
    }
    const q=TAB_NOMI[t];
    q.testo=nome; q.fs=fs; q.largo=Math.min(nw,w);
  }
  ctx.font=fontEra;
  TAB_NOMI[0].x = cx-92*f-TAB_NOMI[0].largo;
  TAB_NOMI[1].x = cx+92*f;
  TAB_SB[0] = TAB_NOMI[0].x-24*f;
  TAB_SB[1] = TAB_NOMI[1].x+TAB_NOMI[1].largo+18*f;
  BAR_X0=Math.round(TAB_SB[0]-14);
  BAR_X1=Math.round(TAB_SB[1]+6+TAB_SK+14);
}
function drawHUD(){`,
},

/* ------------------------------------------------------------------ 4 */
{
  nome: '4/13 drawHUD legge f e sk invece di ricalcolarli',
  cerca:
`  /* le misure sono tarate sul telefono in orizzontale (915 px): su schermi
     piu' stretti si comprimono in blocco invece di accavallarsi */
  const f=clamp((VW/2-52)/248,0.52,1);
  const cyT=(H-3)/2, HB=H-3;
  const sk=Math.tan(16*Math.PI/180)*HB;`,
  metti:
`  /* la geometria della lavagnetta si riscrive adesso, prima di leggerla:
     il nome della squadra puo' essere cambiato dopo l'ultimo resize (lo
     spogliatoio, il campionato, la partita a due). f e sk NON si
     ricalcolano qui — li scrive quella funzione, e due copie della
     stessa aritmetica sono il modo piu' elegante di far divergere una
     regola dal suo disegno. */
  aggiornaTabellone();
  const f=TAB_F, sk=TAB_SK;
  const cyT=(H-3)/2, HB=H-3;`,
},

/* ------------------------------------------------------------------ 5 */
{
  nome: '5/13 px0/px1 dicono da dove vengono',
  cerca: `  const px0=BAR_X0, px1=BAR_X1, PW=px1-px0;   // calcolati in resize(), vedi BAR_X0`,
  metti: `  const px0=BAR_X0, px1=BAR_X1, PW=px1-px0;   // li scrive aggiornaTabellone(), vedi BAR_X0`,
},

/* ------------------------------------------------------------------ 6 */
{
  nome: '6/13 le sbarre stanno dove il nome le ha lasciate',
  cerca:
`  sbarra(cx-236*f, TEAMCOL[0]);
  sbarra(cx+230*f, TEAMCOL[1]);`,
  metti:
`  sbarra(TAB_SB[0], TEAMCOL[0]);
  sbarra(TAB_SB[1], TEAMCOL[1]);`,
},

/* ------------------------------------------------------------------ 7 */
{
  nome: '7/13 i nomi accosto al punteggio, con la misura gia\' presa',
  cerca:
`  /* NOMI SQUADRA: riquadri da 150 px, corpo che scende fino a 11 px e poi
     tronca con ellissi.
     I TRE PALLINI DEI FALLI SONO SPARITI. In partita l'interfaccia deve`,
  metti:
`  /* NOMI SQUADRA: ACCOSTO AL PUNTEGGIO, non appesi ai bordi.
     Stavano in due riquadri fissi da 150 px allineati all'esterno, e
     DOPOLAVORO ne riempiva 69 su 150, CPU 21 su 150: fra il punteggio e
     la scritta CPU restava un vuoto di 127 px di ardesia — misurato a
     pixel dal cancello strumenti/_q-tabellone.js, non a occhio.
     Adesso il nome comincia sei pixel dopo la pasticca delle cifre e il
     pannello finisce dove finisce lui: l'aria che avanza non viene piu'
     dipinta. Il corpo, il troncamento e la larghezza li ha gia' decisi
     la funzione qui sopra: qui si dipinge e basta, se no la scritta e il
     pannello che la contiene potrebbero non essere d'accordo.
     I TRE PALLINI DEI FALLI SONO SPARITI. In partita l'interfaccia deve`,
},

/* ------------------------------------------------------------------ 7b */
{
  nome: '7b/13 il ciclo che dipinge i nomi',
  cerca:
`  const nomi=[(G.teamName||'FLUO'), (G.oppName||'CPU')];
  const nw=150*f;
  for(let t=0;t<2;t++){
    const x0 = t===0 ? cx-212*f : cx+62*f;
    let fs=15, nome=nomi[t];
    ctx.font='700 '+fs+'px '+FONT_C;
    if(ctx.measureText(nome).width>nw){ fs=11; ctx.font='700 '+fs+'px '+FONT_C; }
    if(ctx.measureText(nome).width>nw){
      while(nome.length>1 && ctx.measureText(nome+'…').width>nw) nome=nome.slice(0,-1);
      nome+='…';
    }
    ctx.fillStyle=TEAMCOL[t];
    ctx.textAlign = t===0 ? 'left' : 'right';
    ctx.fillText(nome, t===0?x0:x0+nw, cyT);
  }`,
  metti:
`  for(let t=0;t<2;t++){
    const q=TAB_NOMI[t];
    ctx.font='700 '+q.fs+'px '+FONT_C;
    ctx.fillStyle=TEAMCOL[t];
    ctx.textAlign='left';
    ctx.fillText(q.testo, q.x, cyT);
  }`,
},

/* ------------------------------------------------------------------ 8 */
{
  nome: '8/13 la pasticca dichiara la sua frazione vera',
  cerca:
`     LA PASTICCA E' STRETTA, e la sua larghezza e' misurata: le due
     cifre stanno a cx +-58f e sono larghe una sedicina di pixel l'una
     (corpo 26), il riquadro del cronometro e' largo 68; il contenuto
     arriva quindi a +-66f e la pasticca si ferma a +-86f, venti pixel di
     respiro per lato. Sono 172f px su una lavagnetta larga circa 490f:
     il 35%. Il restante 65% continua a velarsi e a lasciar vedere chi
     passa dietro, che e' la ragione per cui il velo esiste.`,
  metti:
`     LA PASTICCA E' STRETTA, e la sua larghezza e' misurata: le due
     cifre stanno a cx +-58f e sono larghe dodici pixel l'una (corpo 26,
     misurato: 11,78 px per la cifra 0 in Barlow Condensed), il riquadro
     del cronometro e' largo 68; il contenuto arriva quindi a +-66f e la
     pasticca si ferma a +-86f, venti pixel di respiro per lato. Sono
     172f px, e la frazione di lavagnetta che coprono dipende adesso dai
     nomi: col nome di serie (DOPOLAVORO contro CPU, 915x412) la
     lavagnetta e' larga 363 px e la pasticca ne e' il 47%; al limite del
     riquadro (120f per nome) torna larga 512 px e la pasticca ne e' il
     34%. Il resto continua a velarsi e a lasciar vedere chi passa
     dietro, che e' la ragione per cui il velo esiste.`,
},

/* ------------------------------------------------------------------ 9 */
{
  nome: '9a/13 il verbale della camera (punto 6): niente piu\' 56%',
  cerca:
`         La lavagnetta e' larga il 56% del quadro (BAR_X0/BAR_X1): sopra un
         corpo che passa ai suoi lati non c'e' niente da cui essere`,
  metti:
`         La lavagnetta e' larga quanto il suo contenuto (BAR_X0/BAR_X1):
         il 39,7% del quadro coi nomi di serie, mai piu' del 55,96% di
         ieri. Sopra un
         corpo che passa ai suoi lati non c'e' niente da cui essere`,
},
{
  nome: '9b/13 il verbale della camera (6-quater): niente piu\' 56%',
  cerca:
`      /* LA LAVAGNETTA E' LARGA IL 56% (BAR_X0/BAR_X1), e il comandato ha`,
  metti:
`      /* LA LAVAGNETTA E' LARGA QUANTO IL SUO CONTENUTO (BAR_X0/BAR_X1 —
         il 39,7% del quadro coi nomi di serie, il 55,96% al massimo del
         riquadro), e il comandato ha`,
},
{
  nome: '9c/13 il verbale del velo: niente piu\' 56%',
  cerca:
`   che nessuna delle dieci figure passi mai sotto un pannello largo il 56%
   del quadro vuol dire una camera che non si muove piu'.`,
  metti:
`   che nessuna delle dieci figure passi mai sotto un pannello largo il 40%
   del quadro vuol dire una camera che non si muove piu'.`,
},
{
  nome: '9d/13 il verbale della sponda alta: niente piu\' 56%',
  cerca:
`       del punteggio, opaca e larga il 56% del quadro. La camera comprava`,
  metti:
`       del punteggio, opaca e larga quanto il suo contenuto (il 40% del
       quadro coi nomi di serie). La camera comprava`,
},

];

/* =====================================================================
   I CONTROLLI DOPO LA SOSTITUZIONE. Non «ho scritto», ma «c'e' ed e'
   uno solo»: una toppa applicata a meta' e' peggio di una non applicata.
   ===================================================================== */
const ATTESI = [
  ['function aggiornaTabellone(){', 1],
  ['  aggiornaTabellone();', 2],            // resize() e drawHUD
  ['const TAB_NW=120;', 1],
  ['let TAB_F=1, TAB_SK=0;', 1],
  ['const TAB_SB=[0,0];', 1],
  ['  const f=TAB_F, sk=TAB_SK;', 1],
  ['  sbarra(TAB_SB[0], TEAMCOL[0]);', 1],
  ['  sbarra(TAB_SB[1], TEAMCOL[1]);', 1],
  ['    ctx.fillText(q.testo, q.x, cyT);', 1],
  ['56%', 2],                               // le due rimaste non parlano del tabellone
  ['const nw=150*f;', 0],
  ['cx-236*f', 0],
  ['cx+230*f', 0],
  ['BAR_X0=Math.round(TAB_SB[0]-14);', 1],
  ['BAR_X1=Math.round(TAB_SB[1]+6+TAB_SK+14);', 1],
  /* la pasticca e le cifre non si muovono: le tre righe che le decidono
     devono restare parola per parola */
  ["  BAR_CIFRE.x0=Math.round(cx-86*f); BAR_CIFRE.x1=Math.round(cx+86*f);", 1],
  ["  ctx.fillText(String(G.score[0]), cx-58*f, cyT+1);", 1],
  ["    const tw=68*Math.max(f,0.78);", 1],
];

const conta = (s, re) => (s.match(re) || []).length;

function applica(src) {
  if (src.indexOf('function aggiornaTabellone(){') >= 0) return { out: src, ancore: 0, gia: true };
  let out = src;
  const mancanti = [];
  for (const a of ANCORE) {
    const n = out.split(a.cerca).length - 1;
    if (n !== 1) { mancanti.push(a.nome + ': trovato ' + n + ' volte'); continue; }
    out = out.replace(a.cerca, a.metti);
  }
  if (mancanti.length) throw new Error('ancoraggi non trovati esattamente una volta:\n  · ' + mancanti.join('\n  · '));
  const rotti = ATTESI.filter(([s, n]) => (out.split(s).length - 1) !== n)
    .map(([s, n]) => JSON.stringify(s) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
  if (rotti.length) throw new Error('dopo la sostituzione:\n  ' + rotti.join('\n  '));
  /* LA LEGGE SUI SORTEGGI: il conto di dado() non cambia, ne' quello
     letterale ne' quello con la rete larga, e nessun Math.random di
     contrabbando. Questa toppa disegna: non sorteggia. */
  const d0 = conta(src, /dado\(/g), d1 = conta(out, /dado\(/g);
  const l0 = conta(src, /\bdado\s*\(/g), l1 = conta(out, /\bdado\s*\(/g);
  const r0 = conta(src, /Math\.random\s*\(/g), r1 = conta(out, /Math\.random\s*\(/g);
  if (d0 !== d1 || l0 !== l1) throw new Error('dado() ' + d0 + ' -> ' + d1 + ' (largo ' + l0 + ' -> ' + l1 + ')');
  if (r0 !== r1) throw new Error('Math.random ' + r0 + ' -> ' + r1);
  return { out, ancore: ANCORE.length, gia: false, dado: d1, random: r1 };
}

module.exports = { ANCORE, applica };

/* ------------------------------------------------------------ comando */
if (require.main === module) {
  if (haFlag('elenco')) {
    console.log('_t-tabellone.js — ' + ANCORE.length + ' ancoraggi:');
    for (const a of ANCORE) console.log('  · ' + a.nome);
    process.exit(0);
  }
  if (haFlag('dentro')) { console.error('FALLITO: --dentro non e\' ammesso in questa casa. Si prova su copia con --out.'); process.exit(2); }

  const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
  if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }
  let outFile = arg('out', '');
  if (!outFile) outFile = 'fuori/cmd-tabellone.html';
  outFile = path.resolve(RADICE, outFile);
  if (outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

  const src = fs.readFileSync(inFile, 'utf8');
  let r;
  try { r = applica(src); }
  catch (e) { console.error('FALLITO: ' + e.message); process.exit(1); }
  if (r.gia) { console.error('FALLITO: ' + inFile + ' ha gia\' la cura dentro.'); process.exit(1); }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, r.out);
  console.log('OK  ' + r.ancore + ' ancoraggi applicati · dado() ' + r.dado + ' invariate · Math.random ' + r.random + ' invariate');
  console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
  console.log('    a    ' + outFile + '  (' + r.out.length + ' caratteri)');
}
