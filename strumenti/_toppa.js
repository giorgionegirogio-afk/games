/* =====================================================================
   _toppa.js — LA TOPPA "IL TERRENO AFFIORA", applicata a una COPIA.

   Non tocca il repo. Legge un file di gioco, applica le sostituzioni
   qui sotto e scrive un file nuovo. Se una sola sostituzione non trova
   il suo testo, si ferma e non scrive niente: una toppa applicata a
   meta' e' peggio di una toppa non applicata.

   uso: node strumenti/_toppa.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1
   USURA: ogni fondo MOLLE dichiara il colore della TERRA NUDA e l'alfa
   a cui si dipinge. I fondi duri non la dichiarano e restano identici. */
cambio('1. USURA — il colore della terra nuda',
`const USURA={`,
`/* =====================================================================
   IL TERRENO AFFIORA — perche' la biografia del campetto non si vedeva.

   Tutto l'impianto delle zone consumate qui sotto era gia' al suo posto:
   le bocche di porta, i dischetti, le fasce, gli angoli, ventidue
   calvizie. Quello che mancava era che si VEDESSERO, e la ragione e' un
   conto di due righe che nessuno aveva fatto.

   La chiazza si dipinge in source-over sul manto base dell'oratorio,
   che e' #026c0a = (2·108·10). Con la terra (104·84·46) all'alfa 0,36:
       R = 2 + 0,36·102 = 38,7   G = 108 - 0,36·24 = 99,4   B = 10 + 0,36·36 = 23,0
       massimo G, minimo B, delta 76,4
       tinta = 60·((23,0-38,7)/76,4 + 2) = 107,7 gradi
   Centosette gradi e' DENTRO la famiglia del prato (90-175): il banco
   guarda quel pixel e lo chiama erba. Non e' una svista del banco, e'
   la verita' — al 36% su un verde saturo il marrone non vince, il
   canale verde resta il piu' grosso e il pixel resta verde. La stessa
   cosa che vede la misura la vede l'occhio: nelle otto istantanee le
   chiazze si leggono come ombre molli, non come terra.
   DOVE STA LA SOGLIA, ed e' il numero che governa tutta questa passata:
       tinta < 90  <=>  (B-R)/(G-B) < -0,5  <=>  alfa > 0,594
   Sotto 0,594 si dipinge un verde piu' spento; sopra, si dipinge terra.
   Trentasei centesimi non erano "poca terra": erano zero terra.

   COSA SI FA, e sono tre cose che stanno tutte dentro la cottura della
   tessitura (costo a fotogramma: zero):
     1) ogni fondo molle dichiara 'nudo' — il colore del terreno NUDO —
        e 'anudo', l'alfa a cui si dipinge, che sta di la' dalla soglia;
     2) il CALPESTIO smette di essere polvere colorata: nel terzo
        interno di ogni zona i suoi granelli diventano terra vera — la
        velatura di sempre, ma a piena forza invece che a un quinto.
        Non costa un rettangolo in piu': sono gli stessi granelli, con
        un altro pennello;
     3) LE PELATE, una griglia scossa di calvizie su tutto il rettangolo:
        e' l'unico pezzo nuovo, e c'e' perche' le sette zone del
        regolamento e le ventidue calvizie a caso lasciano vuoti larghi
        mezzo campo, e la camera segue il pallone proprio li'.

   COSA SI VEDE, MISURATO SULLO SCATTO VERO e non stimato: su un riquadro
   di solo manto (1200x500 px al centro di calcetto-azione) i pixel che
   NON stanno nella famiglia del prato passano dall'1,08% al 4,42%, e la
   loro tinta media e' rgb(82·73·37), 48 gradi, luminanza 72,5 contro i
   74,8 del prato che li circonda. Terra, e terra un filo piu' scura
   dell'erba. La mediana del prato si sposta da rgb(24·93·32) a
   rgb(26·94·33), cioe' di un punto percentuale di luminanza: meno della
   forbice che collaudo.js ha su due esecuzioni della stessa versione
   (misurato appaiato: il rapporto peggiore va da 3,37 a 3,31).

   PERCHE' LA TERRA NUDA NON PUO' ESSERE PIU' CHIARA DEL PRATO, ed e'
   il vincolo che ne ha scelto la tinta. La terra-velatura dei temi
   (104·84·46) ha luminanza 85,5 contro i 78,4 del manto: SCHIARISCE.
   Tutte e quattro le divise sono piu' chiare dell'erba, e collaudo.js
   campiona un anello di pixel attorno a ogni giocatore senza filtrare
   per tinta — la terra se la prende tutta. Un manto che si schiarisce
   abbassa tutti e quattro i rapporti maglia/manto, cioe' spende il
   cancello 3:1. La terra nuda e' percio' piu' rossa e piu' scura:
       oratorio (113·64·26) all'80% su (2·108·10) -> (90,8 · 72,8 · 22,8)
       massimo R, minimo B, delta 68,0
       tinta = 60·(72,8-22,8)/68,0 = 44,1 gradi — fuori dalla famiglia
       luminanza 73,0 contro i 78,4 del manto: 7% piu' scura
   Quarantaquattro gradi contro una soglia di novanta: quarantasei gradi
   di margine, che bastano e avanzano alle due additive della temperatura
   (l'ambra a ponente e il rimbalzo del cielo a levante spostano la tinta
   di una decina di gradi per lato).

   I FONDI DURI NON DICHIARANO 'nudo' e non cambiano di un pixel: sul
   cemento, sull'asfalto e sul parquet il consumo LUCIDA invece di
   scavare, e quello c'e' gia'.
   ===================================================================== */
const USURA={`);

cambio('1b. oratorio — terra nuda',
`  oratorio:{ a:0.36, terra:'104,84,46', chiaro:'128,102,58,.24', scuro:'34,26,12,.20',`,
`  oratorio:{ a:0.36, terra:'104,84,46', chiaro:'128,102,58,.24', scuro:'34,26,12,.20',
             nudo:'113,64,26', anudo:0.80, secco:'150,146,64',`);

cambio('1c. erba (LA GABBIA) — terra nuda',
`  erba:{     a:0.34, terra:'86,70,38', chiaro:'110,90,50,.20', scuro:'20,18,8,.18',`,
`  erba:{     a:0.34, terra:'86,70,38', chiaro:'110,90,50,.20', scuro:'20,18,8,.18',
             nudo:'96,56,24', anudo:0.74, secco:'132,128,58',`);

cambio('1d. notturno — terra nuda',
`  notturno:{ a:0.30, terra:'76,62,34', chiaro:'98,80,44,.18', scuro:'14,14,6,.16',`,
`  notturno:{ a:0.30, terra:'76,62,34', chiaro:'98,80,44,.18', scuro:'14,14,6,.16',
             nudo:'84,50,22', anudo:0.70, secco:'112,110,50',`);

/* ------------------------------------------------------------------ 2
   IL CALPESTIO DIVENTA TERRA. Stessi granelli, stesso numero di
   fillRect, pennello diverso. */
cambio('2. il calpestio affiora',
`    const calpestio=(cx,cy,rx,ry,dens)=>{
      const n=Math.round(dens*q);
      for(let i=0;i<n;i++){
        const th2=RU()*6.2832, rr=Math.sqrt(RU());
        c.fillStyle= RU()<0.62 ? 'rgba('+U.chiaro+')' : 'rgba('+U.scuro+')';
        c.fillRect(cx+Math.cos(th2)*rx*rr, cy+Math.sin(th2)*ry*rr, 1.6,1.6);
      }
    };`,
`    /* IL CALPESTIO AFFIORA — e non costa un rettangolo in piu'.
       Erano tremila granelli da 1,6 unita' a un quinto d'alfa: polvere
       colorata sopra il verde, cioe' verde. Adesso, NEL TERZO INTERNO di
       ogni zona, il 46% di loro e' terra: la stessa velatura 'terra' di
       sempre ma al 66-82% invece che al 20%, cioe' oltre la soglia dei
       0,594 (a 0,70 su (2·108·10) fa (73·91·35), tinta 79 gradi, fuori
       dalla famiglia del prato). E misura fra 1,9 e 3,2 unita' invece di
       1,6 fisse, perche' la briciola che una scarpa stacca non e' un
       quadretto tutto uguale.
       Il conto che conta, ed e' quello del banco: nella bocca di una
       porta ci sono 300 granelli su un'ellisse di 62x96 unita'. Il terzo
       interno (rr<0,58) e' il 33,6% di quell'area, cioe' 6.280 unita'
       quadre, e ci cadono 46 briciole da 6,5 unita' quadre l'una: 300
       unita' quadre, il 4,8% della zona — sopra il 3% che toglie una
       cella dal conto dell'erba vuota.
       I fondi che non dichiarano 'nudo' (cemento, asfalto, parquet,
       sabbia, sintetico) non entrano qui: il loro consumo lucida, e
       lucidare e' gia' quello che facevano i due pennelli di prima. */
    const calpestio=(cx,cy,rx,ry,dens)=>{
      const n=Math.round(dens*q);
      for(let i=0;i<n;i++){
        const th2=RU()*6.2832, rr=Math.sqrt(RU()), d=RU();
        let s=1.6;
        /* LA TERRA STA AL CENTRO DELLA ZONA, MAI SUL SUO ORLO — ed e' la
           regola che toglie di mezzo le briciole isolate. Il calpestio si
           addensa verso il centro (rr = radice del caso), quindi al centro
           una briciola ha venti compagne dentro la stessa cella e legge
           come terra sbriciolata, mentre sull'orlo ne ha due e legge come
           un puntino colorato. Qui la briciola diventa terra solo dentro
           il 58% del raggio, cioe' nel terzo interno dell'area, dove i
           granelli sono tre volte piu' fitti. Fuori resta la polvere di
           sempre. E' anche cio' che fa una zona consumata vera: nuda in
           mezzo, sfumata sui bordi. */
        if(U.nudo && rr<0.58 && d<0.46){
          /* LA BRICIOLA E' 'terra', NON 'nudo', ED E' UNA CORREZIONE PAGATA.
             Con la tinta del cuore (113·64·26) i granelli della fascia
             laterale — 520 su una striscia lunga mezzo campo e alta 16
             unita', quindi ISOLATI l'uno dall'altro sul verde — leggevano
             come coccinelle: quattro pixel di rosso saturo su un verde
             saturo si vedono da soli, e quello che a venti granelli per
             cella e' terra sbriciolata, a due granelli per cella e' un
             puntino colorato. La velatura di sempre (104·84·46) e' bruno
             oliva invece che rossa, sta comunque oltre la soglia dei
             0,594 (a 0,70 fa (73·91·35), tinta 79 gradi, fuori dalla
             famiglia) e a briciola isolata legge come terra. */
          c.fillStyle='rgba('+U.terra+','+(0.66+RU()*0.16).toFixed(3)+')';
          s=1.9+RU()*1.3;
        }else c.fillStyle= d<0.76 ? 'rgba('+U.chiaro+')' : 'rgba('+U.scuro+')';
        c.fillRect(cx+Math.cos(th2)*rx*rr, cy+Math.sin(th2)*ry*rr, s,s);
      }
    };`);

/* ------------------------------------------------------------------ 3
   LE PELATE: la griglia scossa. */
cambio('3. le pelate a griglia scossa',
`    calpestio(46, FH/2,      62, 96, 300);`,
`    /* =================================================================
       LE PELATE — LA GRIGLIA SCOSSA, e il perche' e' una griglia.

       Le sette zone del regolamento stanno tutte sulla mediana
       orizzontale; le ventidue calvizie sono tirate a caso. Il caso su
       ventidue estrazioni NON copre: lascia buchi larghi mezzo campo, e
       la camera segue il pallone proprio dentro quei buchi. Misurato:
       nei due istanti peggiori il quadro e' erba vuota per il 61,8% e il
       60,8%, e la mappa delle celle mostra il vuoto tutto in mezzo, non
       ai bordi. La cura non e' estrarre di piu' — raddoppiando le
       estrazioni si raddoppiano anche i grumi. E' SCUOTERE UNA GRIGLIA:
       ventiquattro per dodici maglie da 48x47 unita', il seme dentro la
       sua maglia con uno scarto di +-47% del passo, e tre maglie su
       dieci lasciate a erba piena — quali, lo decide il rumore descritto
       poco piu' sotto. Restano circa 202 semi. Nessuna pelata sta in
       riga con un'altra, e nessun riquadro largo quanto una cella del
       banco (33x29 unita' allo zoom di gioco) resta lontano da tutte.

       DUE STRATI, E FANNO DUE MESTIERI DIVERSI.

       1) LA ZONA DIRADATA, larga e molle: erba INGIALLITA, non terra. Un
          velo di (150·146·64) al 13-19% sul manto da' (26·114·19), tinta
          115 gradi — DENTRO la famiglia del prato. Il banco la conta come
          erba, ed e' giusto: e' erba. Non serve al numero, serve
          all'occhio, ed e' la parte piu' importante di tutta la passata.
          Senza di lei una macchia di terra col bordo netto in mezzo al
          verde e' un adesivo; con lei e' il centro di una zona che si sta
          spelando. L'erba non muore di colpo: prima ingiallisce.

       2) IL CUORE, largo in media 6,6x4,1 unita': quasi otto volte su
          dieci e' terra vera, oltre la soglia dei 0,594 (vedi il cappello
          di USURA), e le altre due e' solo erba RADA — la velatura di
          sempre, sotto la soglia, che il banco NON conta e non deve
          contare. Un campetto ha piu' posti in cui l'erba e' corta che
          posti in cui non c'e'. Restano cosi' circa 158 cuori di terra,
          e uno solo di essi porta la sua cella al 10% di non-prato,
          cioe' al triplo del 3% che serve.

       PERCHE' NON SONO OVALI, ed e' costato una passata sbagliata: la
       prima stesura metteva un'ellisse per seme e il risultato era un
       campo col morbillo — duecento macchie tonde tutte uguali, con la
       cadenza della griglia leggibile a occhio. Qui ogni forma e'
       l'UNIONE di tre ellissi sfalsate dentro UN SOLO percorso: un
       beginPath, tre ellipse, un fill. Costa un riempimento come un
       ovale, e non e' un ovale — e siccome e' un percorso solo, le tre
       ellissi non si sovrappongono in scurita', il che e' esattamente il
       motivo per cui non si possono disegnare separate.

       IL VERSO: schiacciate lungo X con una rotazione di +-0,35 radianti,
       perche' un campo si consuma nella direzione in cui si corre — la
       stessa forma che hanno gia' le cinque chiazze per fascia.

       COSTO: 202 semi in media, due riempimenti l'uno (il bordo e il
       cuore), cioe' circa 404 riempimenti dentro una cottura che ne fa
       diecimila. MISURATO, e non stimato: la cottura completa della
       tessitura (buildFieldTex, ventuno ripetizioni per giro, sette giri
       alternati fra i due file sullo stesso banco) passa da 43,0 a 45,5
       ms, cioe' +2,5 ms e +5,8%. A fotogramma non si paga niente: la
       cottura completa avviene all'avvio della partita e al cambio di
       campo o di taglia, e la ricottura viva della panoramica
       (campoVivoDisegna) copre la finestra inquadrata, che e' il 43%
       dell'area del campo — un millisecondo scarso. prestazione.js
       appaiato, tre giri e poi sette, ha dato +8,5% e -4,7%: la
       differenza a fotogramma sta SOTTO la risoluzione dell'attrezzo su
       questo banco, che balla del 55-183% fra repliche dello stesso
       file. Il numero da credere e' quello della cottura. */
    /* q>0.5 e' la stessa soglia che gia' governa toppe, ciuffi e
       cartacce, e vale per la stessa ragione: le otto anteprime della
       schermata CAMPI cuociono un campo largo 212 pixel, dove una pelata
       da sei unita' misura un pixel e un quinto. Duemila riempimenti per
       aprire una schermata, per niente che si veda. */
    if(U.nudo && q>0.5){
      const PGX=24, PGY=12, psx=FW/PGX, psy=FH/PGY;
      /* la forma: tre ellissi sfalsate in un percorso solo */
      const lobi=(cx,cy,rx,ry,rot)=>{
        c.beginPath();
        c.ellipse(cx, cy, rx, ry, rot, 0, 6.2832);
        c.ellipse(cx+(RU()-0.5)*rx*1.3, cy+(RU()-0.5)*ry*1.5,
                  rx*(0.46+RU()*0.30), ry*(0.50+RU()*0.34), rot+(RU()-0.5), 0, 6.2832);
        c.ellipse(cx+(RU()-0.5)*rx*1.5, cy+(RU()-0.5)*ry*1.7,
                  rx*(0.34+RU()*0.26), ry*(0.38+RU()*0.30), rot-(RU()-0.5), 0, 6.2832);
        c.fill();
      };
      for(let gy=0;gy<PGY;gy++) for(let gx=0;gx<PGX;gx++){
        /* LA MISERIA NON E' UNIFORME, e questo e' cio' che toglie alla
           griglia la sua cadenza: due seni incrociati fanno zone povere e
           zone ancora folte, larghe tre-quattro maglie. Costa due chiamate
           trigonometriche per maglia e vale piu' di qualunque altro
           numero di questo blocco — con la soglia costante il prato
           prendeva il morbillo, con questa prende delle ZONE. */
        const magra=0.5+0.5*Math.sin(gx*0.87+gy*0.63)*Math.cos(gx*0.41-gy*1.13);
        if(RU()>0.42+0.56*magra) continue;
        const cx=(gx+0.5+(RU()-0.5)*0.94)*psx;
        const cy=(gy+0.5+(RU()-0.5)*0.94)*psy;
        const t=RU(), gr=0.62+t*t*1.4;          // poche grandi, molte piccole
        const rot=(RU()-0.5)*0.7;
        const rx=(4.6+RU()*3.0)*gr, ry=rx*(0.46+RU()*0.32);
        /* IL BORDO INGIALLITO, largo il doppio del cuore e non di piu':
           la prima stesura lo faceva largo quattro volte e il campo
           usciva mimetizzato — trecento aloni pallidi da 55 unita' su
           maglie da 56 si toccano fra loro e diventano un quadro di
           camuffamento. Due volte il cuore e' un bordo; quattro volte
           e' una seconda macchia. */
        if(U.secco){
          c.fillStyle='rgba('+U.secco+','+(0.13+RU()*0.06).toFixed(3)+')';
          lobi(cx,cy, rx*2.0, ry*2.1, rot);
        }
        /* IL CUORE, e sei volte su dieci e' terra: le altre quattro sono
           erba solamente RADA, dipinta con la velatura di sempre e sotto
           la soglia dei 0,594. Il banco non le conta, e non devono
           contare — un campetto ha piu' posti in cui l'erba e' corta che
           posti in cui non c'e'. Serve la varieta', non il numero. */
        const pieno=RU()<0.78;
        c.fillStyle= pieno
          ? 'rgba('+U.nudo+','+(U.anudo*(0.84+RU()*0.16)).toFixed(3)+')'
          : 'rgba('+U.terra+','+(0.30+RU()*0.20).toFixed(3)+')';
        lobi(cx,cy, rx, ry, rot);
      }
    }
    calpestio(46, FH/2,      62, 96, 300);`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa.js ingresso.html uscita.html'); process.exit(2); }
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
