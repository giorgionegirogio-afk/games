/* =====================================================================
   _toppa2.js — LA TOPPA "DOVE SI CORRE", applicata a una COPIA.

   Non tocca il repo. Legge un file di gioco, applica le sostituzioni qui
   sotto e scrive un file nuovo. Se una sola sostituzione non trova il suo
   testo esattamente una volta, si ferma e non scrive niente.

   COSA FA, in una riga: l'usura del prato smette di essere sparsa su
   tutto il campo e si concentra dove si corre, la terra smette di virare
   al mattone, e fra una zona di traffico e l'altra torna dell'erba
   intatta. Il perche' sta nei due cappelli che la toppa inserisce nel
   gioco (la rettifica dentro USURA e la mappa del traffico dentro
   paintField): qui non si ripete.

   IL BLOCCO VECCHIO NON SI BUTTA. I cinque fondi DURI (cemento, asfalto,
   parquet, sabbia, sintetico) non hanno una terra sotto da scoprire: il
   loro consumo lucida, e il loro impianto — sette zone, fasce, angoli,
   ventidue calvizie — e' quello giusto. La toppa lo rientra di due spazi
   dentro un ramo if(!U.nudo) e gli fa due sole cose, tutte e due
   dichiarate qui sotto: due spazi di rientro per riga (rientra()) e il
   taglio delle PELATE, che su un fondo duro non si sono mai disegnate
   perche' il loro ciclo chiede U.nudo.

   uso: node strumenti/_toppa2.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }
/* l'unica trasformazione applicata al blocco dei fondi duri: due spazi in
   piu' per riga non vuota, perche' adesso sta dentro un if */
const rientra = t => t.split('\n').map(r => r.trim() ? '  ' + r : r).join('\n');

/* ------------------------------------------------------------------ 1
   LA RETTIFICA dentro il cappello di USURA: i due numeri della prima
   passata che questa seconda supera. Si rettifica in chiaro, non si
   cancella — il conto che li ha prodotti e' ancora quello giusto. */
cambio('1. USURA — la rettifica dei due numeri superati',
`   scavare, e quello c'e' gia'.
   ===================================================================== */`,
`   scavare, e quello c'e' gia'.

   RETTIFICA DEL 17 AGOSTO 2026 — tre affermazioni di questo cappello sono
   superate, e restano scritte perche' i conti che le hanno prodotte sono
   ancora quelli giusti.
     · «oratorio (113·64·26) all'80%» non e' piu' la terra del gioco. Quel
       colore ha saturazione 0,77 e sul verde saturo del manto leggeva
       come polvere di cotto: la seconda passata lo porta a (80·64·48),
       saturazione 0,40, stessa luminanza, tinta 30 gradi. Le altre due
       terre molli seguono: erba (72·58·44), notturno (62·50·38).
     · «tinta<90 se e solo se alfa>0,594» valeva per la terra rossa. Con
       (80·64·48) la stessa disuguaglianza (2R-B>G) da' alfa>0,704.
     · «3) LE PELATE, una griglia scossa di calvizie su tutto il
       rettangolo» non esiste piu'. Quella griglia era il modo di coprire
       il campo INTERO, ed e' esattamente cio' che la seconda passata ha
       tolto: un campo si consuma dove si corre, non dappertutto. Il
       codice e' stato rimosso, non spento; al suo posto ci sono le zone
       di traffico e la grana minuta.
   Il vincolo che ha scelto la tinta — la terra piu' SCURA del manto,
   perche' collaudo.js campiona un anello attorno ai giocatori senza
   filtrare per tinta — non e' cambiato ed e' rispettato piu' di prima:
   (80·64·48) ha luminanza 66,3 contro i 78,4 del manto, cioe' il 15% piu'
   scura, dove (113·64·26) ne era il 9%.
   C'E' UNA TINTA IN PIU', ed e' la novita' della seconda passata: 'rado',
   il terriccio delle zone che sono consumate ma non nude. Ha la luminanza
   dell'ERBA RESA (oratorio 91·88·48, luminanza 85,8) e non quella del
   manto, e serve a poter fare zone consumate LARGHE: una zona larga e
   scura, per istantanea.js, e' un'ombra — e quel cancello si e' fatto
   sentire. Il conto sta nel cappello dentro paintField, alla riga della
   velatura larga.
   Dove sta l'usura, e non piu' solo di che colore e', lo spiega lo stesso
   cappello, alla riga della mappa del traffico.
   ===================================================================== */`);

/* ------------------------------------------------------------------ 2
   LE TRE TERRE MOLLI: stessa luminanza, croma dimezzata, e l'alfa della
   zolla piena alzata oltre la soglia nuova (0,704 invece di 0,594). */
cambio('2a. oratorio — la terra si spegne',
`             nudo:'113,64,26', anudo:0.80, secco:'150,146,64',`,
`             nudo:'80,64,48', anudo:0.88, secco:'146,142,84',
             rado:'91,88,48',`);

cambio('2b. erba (LA GABBIA) — la terra si spegne',
`             nudo:'96,56,24', anudo:0.74, secco:'132,128,58',`,
`             nudo:'72,58,44', anudo:0.84, secco:'128,126,78',
             rado:'48,46,25',`);

cambio('2c. notturno — la terra si spegne',
`             nudo:'84,50,22', anudo:0.70, secco:'112,110,50',`,
`             nudo:'62,50,38', anudo:0.80, secco:'108,106,66',
             rado:'30,29,15',`);

/* ------------------------------------------------------------------ 3
   LA MAPPA DEL TRAFFICO. Il blocco dell'usura si sdoppia: i fondi duri
   tengono l'impianto di sempre (rientrato, non toccato), i fondi molli ne
   prendono uno nuovo. */
const VECCHIO = `    const A=U.a;
    /* --- la bocca di sinistra: LARGA E SCHIACCIATA, tre gobbe grosse --- */
    chiazza(46, FH/2,      52, 84, A,      0.10, 3,0.155, 7,0.070, 13,0.030);
    /* --- la bocca di destra: PIU' STRETTA, PIU' ALTA, INCLINATA, e con
           cinque gobbe invece di tre: e' un'altra macchia, non la stessa
           girata. Anche il centro e' spostato di sei unita' verso l'alto,
           perche' nessun portiere logora simmetrico. --- */
    chiazza(FW-52, FH/2-7, 41, 97, A*0.94, -0.22, 5,0.130, 9,0.085,  3,0.055);
    /* --- il cerchio di centrocampo: dove si batte il calcio d'inizio.
           Consumo piu' leggero e piu' largo del cerchio disegnato. --- */
    chiazza(FW/2, FH/2,    70, 58, A*0.62,  0.55, 4,0.120, 6,0.060, 11,0.028);
    /* --- i due dischetti: un tondo piccolo e sfrangiato. Sono il segno
           che in questo gioco si tirano i rigori davvero. --- */
    chiazza(DISCHu,    FH/2, 15, 13, A*1.15, 0.9, 3,0.190, 8,0.090, 5,0.050);
    chiazza(FW-DISCHu, FH/2, 13, 15, A*1.15, 2.4, 4,0.170, 7,0.100, 3,0.060);
    /* --- i due semicerchi d'area: la mezzaluna calpestata dai difensori
           che si dispongono. Larga, bassissima di alfa, tagliata dalla
           riga dell'area. --- */
    for(const side of [0,1]){
      const bx = side ? FW-AREA_Wu*0.52 : AREA_Wu*0.52;
      chiazza(bx, FH/2, AREA_Wu*0.58, GOAL_H*1.02, A*0.24, side?0.3:-0.4,
              3,0.185, 5,0.115, 9,0.055);
    }
    /* =================================================================
       L'USURA ESCE DAL CORRIDOIO CENTRALE (difetto 6 del giudice).
       Le sette zone qui sopra stanno TUTTE sulla riga mediana
       orizzontale del campo: le due bocche di porta, i due dischetti, i
       due semicerchi, il cerchio di centro. La camera pero' segue il
       pallone, e nove fermi-immagine su dieci cadono altrove — in una
       fascia, in un angolo, a meta' fra il centro e la bandierina. Li'
       il campo era nuovo di zecca, ed e' la ragione per cui la terra
       battuta si vedeva in una scena su sei.
       Il rimedio non e' alzare l'alfa (si sposterebbe la mediana
       dell'erba, cioe' il cancello 3:1): e' DISTRIBUIRE. Quattro
       famiglie nuove, tutte a forza bassa, tutte con lo stesso seme del
       campo — stesso campetto, stessa biografia, per sempre.
       ================================================================= */
    /* --- LE DUE FASCE. Un campetto si consuma dove si CORRE, e si corre
           lungo le linee laterali: cinque chiazze lunghe e basse per
           fascia, sfalsate, piu' la loro grana di calpestio. --- */
    for(const sy of [0,1]){
      const cyF = sy ? FH-27 : 27;
      for(let k=0;k<5;k++)
        chiazza(FW*(0.12+k*0.19), cyF+(RU()-0.5)*15, 92+RU()*52, 14+RU()*10,
                A*0.58, (RU()-0.5)*0.26, 3,0.200, 6,0.100, 11,0.048);
      calpestio(FW/2, cyF, FW*0.44, 16, 520);
    }
    /* --- I QUATTRO ANGOLI: la bandierina e il quarto di cerchio dove si
           batte il corner. Sono l'unico posto del campo dove si sta
           fermi a calpestare, e si vede. --- */
    for(const [ax,ay] of [[0,0],[FW,0],[FW,FH],[0,FH]]){
      chiazza(ax,ay, 30+RU()*13, 30+RU()*13, A*0.64, RU()*3, 3,0.225, 7,0.095, 5,0.050);
      calpestio(ax,ay, 32, 32, 90);
    }
    /* --- LA MEDIANA per lungo: si passa di li' a ogni ripartenza, e
           quattro chiazze verticali la accompagnano da fascia a fascia. */
    for(let k=0;k<4;k++)
      chiazza(FW/2+(RU()-0.5)*24, FH*(0.13+k*0.246), 15+RU()*13, 32+RU()*20,
              A*0.40, (RU()-0.5)*0.4, 4,0.170, 8,0.080, 3,0.050);
    /* --- DIECI CALVIZIE QUALUNQUE: un campetto non si consuma solo dove
           dice il regolamento. Sparse su tutto il rettangolo, mai due
           uguali, e sono loro a garantire che un fermo-immagine preso a
           caso abbia della terra dentro.
           SI E' PROVATO A PORTARLE A VENTIDUE, e il verbale vale piu' del
           tentativo: sul freeze-frame test non hanno spostato di un
           decimo nessuno degli otto istanti (l'erba vuota non guarda
           QUANTE chiazze ci sono, guarda se il pixel esce dalla famiglia
           del verde — e a questo pensa l'alfa, non il conteggio), mentre
           paintField e' la funzione che campoVivoDisegna RICUOCE dal vivo
           a ogni panoramica: dodici chiazze in piu', ognuna col suo
           calpestio di sessanta rettangoli, si pagano a ogni ricottura.
           Il numero resta dieci; a fare la differenza e' l'alfa. --- */
    for(let k=0;k<22;k++){
      const bx2=FW*(0.09+RU()*0.82), by2=FH*(0.09+RU()*0.82);
      chiazza(bx2,by2, 14+RU()*29, 11+RU()*23, A*0.52, RU()*3, 3,0.240, 6,0.120, 9,0.060);
      /* LA GRANA SI SPARPAGLIA, NON SI MOLTIPLICA: ventisette puntini per
         chiazza invece di sessanta, cosi' ventidue calvizie costano gli
         stessi seicento fillRect che ne costavano dieci. Il conto va
         fatto, perche' paintField non e' cotta una volta sola:
         campoVivoDisegna la RICUOCE dal vivo a ogni panoramica che esce
         dalla finestra gia' cotta, e ventidue calpestii pieni portavano
         il fotogramma medio da 22 a 32 ms — il cancello di
         prestazione.js. Sparpagliata, la stessa grana copre il doppio
         dei posti allo stesso prezzo. */
      calpestio(bx2,by2, 20+RU()*22, 16+RU()*18, 27);
    }
    /* =================================================================
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
    calpestio(46, FH/2,      62, 96, 300);
    calpestio(FW-52, FH/2-7, 52,110, 300);
    calpestio(FW/2, FH/2,    78, 66, 220);
    calpestio(DISCHu,    FH/2, 20, 18, 70);
    calpestio(FW-DISCHu, FH/2, 18, 20, 70);`;

const CAPPELLO = `    /* =====================================================================
       DOVE SI CONSUMA UN CAMPO, E SOPRATTUTTO DOVE NO — seconda passata
       sull'usura, 17 agosto 2026.

       La prima passata (vedi il cappello di USURA) aveva risolto il
       problema giusto: la terra non si vedeva perche' al 36% di alfa era
       ancora verde. Ne aveva pero' aperto un altro, che il numero non
       misurava e l'occhio legge in un istante — il prato non sembrava
       vissuto, sembrava malato. Tre difetti, e sono tre difetti diversi.

       1) L'USURA ERA ISOTROPA. Sette zone di regolamento, ventidue
          calvizie tirate a caso, quattro angoli, dieci chiazze di fascia
          e una griglia scossa di duecento pelate coprivano il rettangolo
          quasi per intero, comprese le parti dove non passa mai nessuno:
          gli angoli, il prato oltre le linee, la fascia a meta' campo
          lontana dall'azione. Ma cio' che racconta l'uso e' il CONTRASTO
          fra il consumato e l'intatto: dove non c'e' un punto chiaramente
          intatto non ce n'e' nessuno chiaramente consumato. Adesso il
          consumo sta dove si CORRE, e sono sei famiglie e non una di piu':
          le due bocche di porta, le due mezzelune davanti alle aree coi
          loro dischetti, il cerchio d'inizio, due corsie sulle fasce e la
          spina che unisce le due aree. Gli angoli sono tornati verdi: il
          corner si batte ogni dieci minuti e ci si sta fermi, non ci si
          corre.

       2) ERANO DUECENTO MACCHIE DELLA STESSA TAGLIA. Duecento macchie
          della stessa taglia sono una tessitura, o un esantema; non sono
          mai un'usura. Adesso una zona consumata e' uno SCIAME di zolle
          sovrapposte e l'alfa si accumula da sola (il commento dello
          sciame fa il conto), cosi' il contorno viene frastagliato e
          connesso — e' l'unione di molte ellissi, non il perimetro di
          una — e dentro l'erba prima dirada e poi sparisce senza che
          nessuno dipinga un gradiente.

       3) IL COLORE VIRAVA AL MATTONE. La terra della prima passata,
          (113·64·26), ha saturazione 0,77: su un verde saturo un arancio
          saturo non sprofonda, salta fuori, e le chiazze leggevano come
          polvere di cotto — sabbia rossa versata, non erba consumata. Le
          tre tinte nuove tengono la luminanza di prima e DIMEZZANO la
          croma: oratorio (80·64·48), saturazione 0,40 contro 0,77, tinta
          30 gradi contro 26. E' un bruno spento, non un mattone.

       QUESTO SPOSTA LA SOGLIA DELLA PRIMA PASSATA, ED E' UNA RETTIFICA IN
       CHIARO. Con la terra rossa il pixel usciva dalla famiglia del prato
       oltre alfa 0,594; con una terra meno rossa ci vuole piu' terra. Su
       (2·108·10), con nudo (80·64·48), la condizione tinta<90 e' 2R-B>G:
           2(2+78a) - (10+38a) > 108 - 44a   ->   162a > 114   ->   a > 0,704
       Per questo le zolle si dipingono a 0,80-0,95 invece che a 0,66-0,82,
       e per questo lo sciame conta gli strati.

       LA COSA CHE NON ERA PREVISTA, e che ha riscritto meta' della
       passata: IL CANCELLO DELLE OMBRE SI PAGA IN BUIO, NON IN TERRA.
       istantanea.js chiama ombra ogni pixel di PRATO sceso sotto lo 0,85
       della luminanza locale, e attorno ai piedi di ogni figura cerca il
       corridoio buio piu' lungo; se ne trova due lontani piu' di sessanta
       gradi, scarta la figura («due ombre addosso»). Una stesura che
       faceva le zone consumate larghe E SCURE ha portato quel cancello da
       7 istanti su 8 a 4, con quella motivazione — lo strumento vedeva
       doppio, e aveva ragione: una macchia di manto imbrunito larga
       centocinquanta unita' e' un'ombra, chiunque la guardi. La regola
       che ne e' uscita governa tutta la tavolozza qui sotto:
         · SCURO SOLO IN PICCOLO. Il cuore nudo di ogni zona sta dentro il
           42% del raggio; tutto il resto della zona e' consumato ma non
           scuro, dipinto col terriccio 'rado' che ha la luminanza
           dell'erba e ne cambia solo la croma.
         · La velatura larga ha le macchie SCURE piu' piccole delle
           chiare, per la stessa ragione.
         · La grana minuta e' fatta di due materiali, e nessuno dei due e'
           piu' scuro del prato che lo circonda.
       La sfumatura dal nudo all'intatto e' percio' di CROMA e non di
       valore, ed e' anche piu' vera: una zona secca non e' una zona in
       ombra.

       IL COSTO, MISURATO E NON STIMATO, e con dentro una lezione che vale
       piu' del numero. Tutto quello che sta qui sotto e' cotto UNA volta
       nella tessitura del manto: a fotogramma non si paga niente. La
       cottura completa (strumenti/_cottura.js, ventuno ripetizioni per
       giro, sedici giri alternati fra i due file sullo stesso banco) passa
       da 59,5 a 67,9 ms: +8,4 ms, +15% sulla mediana dei sedici scarti
       appaiati (i singoli scarti vanno da +1,3 a +18,9 ms — il banco di
       oggi, con un server acceso accanto, fa ballare la stessa cottura
       fra 43 e 69 ms, e per questo si guarda lo scarto appaiato e non il
       tempo assoluto). Il grosso di quegli 8,4 ms sono i circa novecento
       riempimenti dello sciame, e quelli non si possono raggruppare:
       e' proprio la loro SOVRAPPOSIZIONE, una alla volta, a fare l'alfa
       che si accumula.
       LA LEZIONE, che e' costata una misura e ne ha salvate cento: la
       grana minuta, dipinta un granello per volta, portava la cottura a
       199,5 ms — quattro volte. Non per i pixel (sono trentamila in tutto)
       ma per il NUMERO DI CHIAMATE. Raggruppata in otto percorsi e' tornata
       a costare quanto niente. Chi domani aggiunge una passata di migliaia
       di forme minute su questa tessitura la raggruppi prima di misurarla,
       o misuri prima di aggiungerla.

       I FONDI DURI NON PASSANO DI QUI. Cemento, asfalto, parquet, sabbia
       e sintetico non dichiarano 'nudo': il loro consumo LUCIDA invece di
       scavare, non ha bocche di porta pelate fino alla terra, e l'impianto
       che avevano — sette zone, fasce, angoli, calvizie — resta quello,
       byte per byte, dentro il ramo qui sotto.
       ===================================================================== */`;

const NUOVO = `    }else{
      /* ---------------------------------------------------------------
         LA MAPPA DEL TRAFFICO. Ogni riga e' un posto in cui si CORRE, e
         non ce ne sono altri:
           cx,cy   dove sta la zona
           rx,ry   quanto e' larga
           n       quante zolle la compongono
           fo      la forza della singola zolla, in frazione di U.anudo
           lr,sq   raggio e schiacciamento della zolla
           rt      il verso: un campo si consuma nel verso in cui si corre
           gr      quanti granelli di calpestio le cadono dentro
         --------------------------------------------------------------- */
      const NU=U.nudo.split(',').map(Number);
      const zolla=(k,al)=>'rgba('+Math.round(NU[0]*k)+','+Math.round(NU[1]*k)+','+
                          Math.round(NU[2]*k)+','+al.toFixed(3)+')';
      const GH=GOAL_H, DS=DISCHu;
      const PISTE=[
        /* LA BOCCA DI SINISTRA, la piu' pelata del campo: il portiere si
           sposta di un metro e mezzo per novanta minuti e li' non cresce
           piu' niente. Il centro sta a ventidue unita' dalla linea di
           fondo e l'ellisse la scavalca: la terra arriva fino al palo. */
        [ 22,          FH/2,   40, GH*0.88, 62, 0.54, 19, 0.62,  0.10, 210],
        [ 74,          FH/2+4, 56, GH*0.62, 34, 0.34, 18, 0.58,  0.16, 110],
        /* LA BOCCA DI DESTRA: piu' stretta, piu' alta e spostata in su.
           Nessun portiere logora simmetrico. */
        [ FW-20,       FH/2-9, 37, GH*0.95, 62, 0.54, 19, 0.62, -0.12, 210],
        [ FW-76,       FH/2-2, 52, GH*0.66, 34, 0.34, 18, 0.58, -0.18, 110],
        /* LE DUE MEZZELUNE davanti all'area, dove i difensori si
           dispongono, col loro dischetto dentro. */
        [ DS*1.04,     FH/2,   42, GH*0.68, 34, 0.30, 16, 0.54, -0.26,  85],
        [ FW-DS*1.04,  FH/2+7, 40, GH*0.64, 34, 0.30, 16, 0.54,  0.24,  85],
        [ DS,          FH/2,   16, 14,      15, 0.66,  8, 0.84,  0.60,  45],
        [ FW-DS,       FH/2,   14, 16,      15, 0.66,  8, 0.84,  2.40,  45],
        /* IL CERCHIO D'INIZIO e il punto da cui si batte. */
        [ FW/2,        FH/2,   70, 54,      40, 0.28, 17, 0.52,  0.50, 130],
        [ FW/2,        FH/2,   15, 13,      14, 0.62,  7, 0.88,  1.10,  40],
      ];
      /* LE DUE PISTE SULLE FASCE. Non cinque macchie in fila come prima —
         una CORSIA: dieci sciami che si SALDANO lungo un'onda (passo 97
         unita', corpo largo 90 e frangia larga 156: il corpo di uno tocca
         quello del vicino, ed e' la differenza fra una pista e una fila
         di salsicce),
         dentro il campo e non sulla riga laterale — a ventisette unita'
         dal bordo si consumava il prato dove non ci passa nessuno, a
         novanta ci passa l'ala.
         Due cose la salvano dall'essere una banda uniforme: si ferma al
         12% e all'88% della lunghezza, perche' gli angoli sono zone morte
         e restano verdi; ed e' PIU' CONSUMATA AI DUE CAPI che in mezzo —
         si scatta partendo da dietro e si crossa arrivando, a meta' campo
         ci si passa e basta. */
      const ondaY=(x,sy)=>FH*(sy?0.840:0.160)+Math.sin(x/FW*5.6+(sy?2.4:0))*FH*0.030;
      for(const sy of [0,1]) for(let k=0;k<10;k++){
        const u=k/9, x=FW*(0.12+u*0.76), f=0.66+0.34*Math.abs(Math.cos(u*3.1416));
        PISTE.push([x, ondaY(x,sy), 78, 19, Math.round(13*f), 0.30*f, 13, 0.40,
                    (sy?-1:1)*0.13, Math.round(52*f)]);
      }
      /* IL CORRIDOIO CENTRALE, ed e' la zona che una prima stesura aveva
         dimenticato con un costo misurabile. Fra un'area e l'altra la
         palla passa sempre di li': in una partita a cinque la spina
         centrale e' la seconda superficie piu' calpestata del campo, dopo
         le bocche di porta. Senza, il quadro di gioco — che segue il
         pallone, e il pallone sta quasi sempre sulla spina — restava erba
         intatta per il 51 e il 53% in due istantanee su otto, contro un
         tetto del 50: due bocciature.
         E' PIU' STRETTO E PIU' DEBOLE DELLE FASCE, e serpeggia: alfa 0,20
         contro 0,30, mezza altezza, e un'onda di venticinque unita' che
         gli toglie il passo. Tre bande orizzontali diritte sarebbero una
         bandiera; tre sentieri che ondeggiano sono un campetto. Fra la
         spina e ciascuna fascia restano centoventi unita' — quattro celle
         del banco — di erba a cui non e' successo niente. */
      const spinaY=(x)=>FH/2+Math.sin(x/FW*4.2+1.1)*FH*0.045;
      for(let k=0;k<7;k++){
        const u=k/6, x=FW*(0.20+u*0.60);
        PISTE.push([x, spinaY(x), 68, 26, 10, 0.20, 12, 0.44,
                    Math.sin(u*4.2+1.1)*0.22, 34]);
      }
      /* =================================================================
         PRIMA DI TUTTO, LA GEOGRAFIA DEL PRATO — ed e' la passata che da'
         all'occhio l'erba INTATTA con cui misurare quella consumata.
         Un prato non e' un tappeto: dove tira e' piu' scuro e piu' fitto,
         dove e' stanco ingiallisce, e sono macchie larghe mezza area, non
         puntini. Le due tinte sono quelle delle toppe che gia' esistono —
         una piu' scura e una piu' chiara del manto, in parti uguali, cosi'
         la mediana dell'erba (quella del cancello 3:1) non si muove — ma
         messe dove lo dice il RUMORE invece che a caso: due seni
         incrociati, periodo di tre-quattro maglie, cioe' zone larghe
         centocinquanta-trecento unita'. Invece di quarantaquattro macchie
         si legge una geografia.
         Lo stesso rumore decide poi dove cade la grana minuta: cosi' la
         zona folta e' folta in tutte e due le passate, e resta un pezzo di
         campo su cui non c'e' NIENTE.
         NON SONO OVALI. Tre ellissi sfalsate dentro UN SOLO percorso: un
         beginPath, tre ellipse, un fill. Costa come un ovale e non lo e' —
         e siccome e' un percorso solo, le tre ellissi non si sommano in
         opacita' dove si sovrappongono, che e' il motivo per cui non si
         possono disegnare separate. Con gli ovali si vedevano cento
         cerchi pallidi; cosi' si vede una macchia d'erba. ============== */
      const rumore=(x,y)=>{
        const u=x/FW*24, v=y/FH*12;
        return Math.sin(u*0.87+v*0.63)*Math.cos(u*0.41-v*1.13);
      };
      const lobi=(cx,cy,rx,ry)=>{
        c.beginPath();
        c.ellipse(cx,cy, rx,ry, RU()*3.14,0,6.2832);
        c.ellipse(cx+(RU()-0.5)*rx*1.2, cy+(RU()-0.5)*ry*1.4,
                  rx*(0.50+RU()*0.40), ry*(0.50+RU()*0.40), RU()*3.14,0,6.2832);
        c.ellipse(cx+(RU()-0.5)*rx*1.5, cy+(RU()-0.5)*ry*1.7,
                  rx*(0.34+RU()*0.30), ry*(0.34+RU()*0.30), RU()*3.14,0,6.2832);
        c.fill();
      };
      /* LE SCURE SONO PIU' PICCOLE DELLE CHIARE, e non e' un capriccio: e'
         il vincolo che il cancello delle OMBRE impone a tutta questa
         passata. istantanea.js chiama ombra ogni pixel di PRATO sceso
         sotto lo 0,85 della luminanza locale, e poi cerca attorno ai piedi
         di ogni figura il corridoio buio piu' lungo. Una macchia d'erba
         piu' scura larga centocinquanta unita' e' esattamente quello: un
         corridoio buio, in una direzione che non e' quella del sole. Una
         stesura che le faceva grandi quanto le chiare ha portato il
         cancello da 7 istanti su 8 a 4, con la motivazione «due ombre
         addosso e nessuna attribuibile» — cioe' lo strumento vedeva
         doppio, e aveva ragione. Trentasei unita' di raggio massimo sono
         sotto la lunghezza di un'ombra vera (due volte la figura, cioe'
         oltre novanta) e la marcia non le segue. */
      for(let k=0;k<88;k++){
        const x=RU()*FW, y=RU()*FH, folto=rumore(x,y)<0.08;
        const rr= folto ? 15+RU()*21 : 25+RU()*35;
        c.fillStyle= folto ? 'rgba('+U.toppaB+')' : 'rgba('+U.toppaA+')';
        lobi(x,y, rr, rr*(0.52+RU()*0.50));
      }
      /* =================================================================
         LO SCIAME. Una zona consumata non e' UNA macchia: e' venti-sessanta
         zolle che si sovrappongono dentro la stessa ellisse, fitte al
         centro e rade all'orlo. Siccome si dipingono in source-over una
         sopra l'altra, l'alfa si ACCUMULA da sola: al centro tre o quattro
         strati fanno terra piena (0,85-0,95, cioe' oltre la soglia dei
         0,704 spiegata poco sopra), all'orlo un solo strato ne fa 0,47 —
         sotto la soglia, quindi erba appena spenta, che il banco non conta
         e non deve contare.
         E' questo che sostituisce il gradiente dipinto: la sfumatura dal
         nudo all'intatto non e' una velatura, e' il DIRADARSI delle zolle.
         Il contorno viene frastagliato e connesso per la stessa ragione:
         e' l'unione di molte ellissi, non il perimetro di una.
         E LA SFUMATURA E' DI CROMA, NON DI VALORE. Andando dal cuore
         all'orlo la zona non si SCHIARISCE verso il verde: cambia
         materia — dal bruno scuro della terra battuta al giallo spento
         del terriccio rado, che ha la stessa luminanza dell'erba — e solo
         all'ultimo l'erba torna verde. Non e' un vezzo: e' l'unico modo di
         avere zone consumate LARGHE senza fabbricare ombre finte (il
         perche' sta nel commento della velatura, poco sopra).
         ================================================================= */
      const posa=(cx,cy,rx,ry,n,al,lr,sq,rt,conc,tinta)=>{
        for(let i=0;i<n;i++){
          const th=RU()*6.2832, rr=Math.pow(RU(),conc), r1=lr*(0.52+RU()*0.88);
          const a2=al*(0.72+RU()*0.56);
          c.fillStyle= tinta ? 'rgba('+tinta+','+a2.toFixed(3)+')'
                             : zolla(0.80+RU()*0.33, a2);
          c.beginPath();
          c.ellipse(cx+Math.cos(th)*rx*rr, cy+Math.sin(th)*ry*rr,
                    r1, r1*sq*(0.70+RU()*0.62), rt+(RU()-0.5)*0.9, 0, 6.2832);
          c.fill();
        }
      };
      /* TRE PASSATE PER ZONA, E LA PRIMA E' LA PIU' IMPORTANTE.
         1) IL LOGORO copre la zona INTERA col terriccio rado, che ha la
            luminanza dell'erba: la zona diventa gialla e spenta senza
            diventare SCURA. E' cio' che permette a una zona consumata di
            essere larga. Una zona larga e scura e' un'ombra per il
            cancello delle ombre (vedi la velatura qui sopra) e un buco
            nero per l'occhio; una zona larga e SPENTA e' terra secca.
         2) IL CUORE, dentro il 44% del raggio, e' l'unico posto dove la
            terra e' nuda e scura. E' piccolo per la stessa ragione, ed e'
            giusto che lo sia: su un campetto la terra battuta vera sta in
            un fazzoletto in mezzo alla bocca della porta, non su tutta
            l'area di rigore.
         3) LA FRANGIA, minuta e debolissima, sborda del 6% oltre l'orlo e
            gli toglie il contorno d'ameba. */
      for(const P of PISTE){
        const al=U.anudo*P[5];
        posa(P[0],P[1], P[2],      P[3],      P[4],                  al*0.66, P[6]*0.86, P[7], P[8], 0.92, null);
        posa(P[0],P[1], P[2]*0.42, P[3]*0.42, Math.round(P[4]*0.44), al,      P[6]*0.90, P[7], P[8], 1.30, null);
        posa(P[0],P[1], P[2]*1.08, P[3]*1.08, Math.round(P[4]*0.42), al*0.42, P[6]*0.40, P[7], P[8], 0.60, U.rado);
        calpestio(P[0],P[1], P[2]*0.62, P[3]*0.62, P[9]);
      }
      /* =================================================================
         IL PRATO RADO — la grana che sta FRA una pista e l'altra, e
         perche' non e' ne' il morbillo di prima ne' i coriandoli.

         Fra le zone di traffico un campetto non e' un tappeto da biliardo:
         l'erba e' rada a chiazze e sotto affiora il terriccio asciutto.
         Due regole, e sono costate una stesura buttata l'una e l'altra.

         LA TAGLIA. Una pelata della passata precedente era larga sette
         unita' — sedici punti sullo schermo di gioco, dove un'unita' vale
         2,31 punti — e a sedici punti una macchia bruna su un verde saturo
         E' una macchia. Qui il granello e' largo due unita', cinque punti,
         e cade in gruppetti stretti dentro sei-sette unita': non un
         puntino ogni tanto, una CHIAZZETTA di erba rada.

         LA LUMINANZA, ed e' la regola che ha salvato la passata. La prima
         stesura usava per la grana la stessa terra scura delle zolle
         (luminanza 66 contro i 78,4 del manto) e il risultato erano
         coriandoli: un granello molto piu' SCURO dell'erba si vede uno per
         uno, e cinquemila granelli che si vedono uno per uno sono
         un'eruzione, non una tessitura. Il granello deve avere la
         luminanza dell'ERBA CHE GLI STA ATTORNO, e allora l'occhio legge
         un cambio di materia invece di una macchia.
         E QUELLA NON E' LA LUMINANZA DEL MANTO, ed e' il numero che la
         seconda stesura ha sbagliato. Il granello si dipinge sopra la
         grana e sopra i seimila fili d'erba, quindi li CANCELLA: l'erba
         resa vale piu' del suo fondo. Misurato sullo scatto della
         tessitura, in fascia: l'erba sta a luminanza 91-110, e un granello
         dipinto alla luminanza del manto (78,4) usciva a 76-93, cioe' un
         quinto piu' scuro di cio' che lo circonda — e si vedeva. Il
         terriccio rado e' percio' (91·88·48), luminanza 85,8: fra il manto
         e l'erba resa, e molto piu' vicino alla seconda.
         LA TINTA VA TENUTA GIALLA, non neutra, e questa e' la terza cosa
         imparata: una tinta neutra accanto a un verde saturo l'occhio la
         legge ROSA. Non e' un modo di dire — la stesura con (92·78·56),
         che aveva la luminanza giusta e saturazione 0,39, faceva
         coriandoli rosa. Qui la tinta e' 56 gradi in tinta piena e 73 in
         composizione, cioe' erba ingiallita, e il granello sprofonda nel
         prato invece di saltarci sopra.
         Il banco lo conta lo stesso: la solita 2R-B>G, su (91·88·48), da'
         alfa>0,713, e i granelli si dipingono fra 0,80 e 0,95.

         DOVE CADONO, E PERCHE' O TANTI O NESSUNO. Il rumore di sopra dice
         se il prato li' e' folto o stanco; la vicinanza a una pista alza
         la mano (l'alone e' largo una volta e mezza la pista, quindi ogni
         zona di traffico ha attorno una cintura di erba che dirada). Ma la
         soglia e' NETTA e la densita' dentro e' ALTA — da uno a cinque
         granelli per nodo, cioe' una decina per cella del banco dove la
         grana c'e' (misurato: 2.157 nodi accesi su 3.444, 6.785 granelli
         in tutto) — invece di una
         polvere sottile stesa su tutto. E' la stessa quantita' d'inchiostro
         disposta in un altro modo, e la ragione e' che il banco chiede il
         3% di non-prato PER CELLA: una polvere uniforme al 2% non rompe
         nessuna cella e si vede dappertutto, mentre meta' campo al 4% e
         meta' campo a zero rompe meta' celle e lascia l'altra meta'
         intatta all'occhio. Il cancello e la giuria chiedono, per una
         volta, la stessa cosa: che ci sia un dentro e un fuori.
         Dove il prato e' folto non cade NIENTE, ed e' li' che l'occhio
         trova l'erba con cui misurare il consumato.
         DUE GRANELLI E NON TRE. Una stesura aveva provato a mettere, nella
         cintura attorno alle piste, dei fiocchi della TERRA scura delle
         zolle — l'idea era che a due passi da una zona nuda un fiocco
         bruno non e' un coriandolo ma un pezzo di quella zona. Non e'
         vero: misurato, quei fiocchi escono a luminanza 70 dove l'erba
         attorno sta a 100, e sono esattamente i coriandoli rosa che il
         cappello di sopra spiega. La grana e' percio' di due sole specie,
         tutte e due alla luminanza dell'erba: tre su dieci ERBA SECCA (che
         sta nella famiglia del prato, e il banco la conta come erba perche'
         erba e') e sette terriccio rado. La terra scura sta dentro le
         piste, e li' non la disegna la grana, la disegna il calpestio.
         ================================================================= */
      const ALONI=[[34,FH/2,84,GH*1.10],[FW-34,FH/2-6,78,GH*1.15],
                   [DS*1.06,FH/2,58,GH*0.82],[FW-DS*1.06,FH/2+6,56,GH*0.78],
                   [FW/2,FH/2,84,66],
                   [FW*0.24,ondaY(FW*0.24,0),120,30],[FW*0.50,ondaY(FW*0.50,0),120,30],
                   [FW*0.76,ondaY(FW*0.76,0),120,30],
                   [FW*0.24,ondaY(FW*0.24,1),120,30],[FW*0.50,ondaY(FW*0.50,1),120,30],
                   [FW*0.76,ondaY(FW*0.76,1),120,30],
                   [FW*0.28,spinaY(FW*0.28),110,38],[FW*0.50,spinaY(FW*0.50),110,38],
                   [FW*0.72,spinaY(FW*0.72),110,38]];
      const traffico=(x,y)=>{
        let m=0;
        for(let i=0;i<ALONI.length;i++){
          const P=ALONI[i], u=(x-P[0])/P[2], v=(y-P[1])/P[3];
          const d=1-(u*u+v*v)*0.44;
          if(d>m) m=d;
        }
        return m>0?m:0;
      };
      /* q>0.5 e' la solita soglia delle anteprime: le otto miniature della
         schermata CAMPI sono larghe 212 pixel, dove un granello da due
         unita' misura mezzo pixel. */
      if(q>0.5 && U.rado){
        /* SEIMILASETTECENTO RIEMPIMENTI COSTANO, OTTO NO — ed e' la misura
           che ha salvato questa passata dal cestino. La prima stesura
           dipingeva un granello per volta: 6.785 fillRect, e la cottura
           della tessitura passava da 45,9 a 199,5 ms. Non e' il numero di
           pixel — sono in tutto trentamila — e' il numero di CHIAMATE: su
           una tela di 1915x1371 ogni riempimento porta con se' il suo
           allestimento di stato, e a diciannove microsecondi l'uno
           seimila di loro fanno centotrenta millisecondi. (Provato anche
           col colore costante: 191 ms. Il colore vale 26 ms, il resto e'
           tutto allestimento.)
           Qui i granelli si ACCUMULANO in otto liste — due materiali per
           quattro gradini d'alfa — e ogni lista diventa UN percorso con
           dentro migliaia di rect e UN solo fill. Il disegno e' lo stesso
           salvo una cosa, e quella cosa e' un guadagno: due granelli
           della stessa lista che si sovrappongono non raddoppiano l'alfa,
           perche' stanno nello stesso percorso.
           I quattro gradini d'alfa esistono perche' un solo valore
           avrebbe fatto una grana piatta: 0,80/0,85/0,90/0,95 per il
           terriccio (tutti oltre la soglia dei 0,713, quindi tutti contati
           dal banco) e 0,20/0,26/0,32/0,38 per l'erba secca. */
        const RGX=Math.min(96,Math.round(FW/(13.7*KPASSO)));
        const RGY=Math.min(48,Math.round(FH/(13.7*KPASSO)));
        const spx=FW/RGX, spy=FH/RGY;
        const vie=[[],[],[],[],[],[],[],[]];
        for(let gy=0;gy<RGY;gy++) for(let gx=0;gx<RGX;gx++){
          const x=(gx+0.5+(RU()-0.5)*0.94)*spx, y=(gy+0.5+(RU()-0.5)*0.94)*spy;
          const p=rumore(x,y)*0.62+traffico(x,y)*0.62-0.06;
          if(p<=0) continue;
          const n=1+Math.round((p*1.5>1?1:p*1.5)*4);
          for(let i=0;i<n;i++){
            const dx=x+(RU()-0.5)*spx*0.52, dy=y+(RU()-0.5)*spy*0.52;
            const secco=RU()<0.30, v=vie[(secco?4:0)+(RU()*4|0)];
            if(secco) v.push(dx,dy, 2.0+RU()*2.6, 1.4+RU()*1.6);
            else      v.push(dx,dy, 1.6+RU()*1.8, 1.3+RU()*1.4);
          }
        }
        const ALFA=['0.800','0.850','0.900','0.950','0.200','0.260','0.320','0.380'];
        for(let b=0;b<8;b++){
          const v=vie[b];
          if(!v.length) continue;
          c.fillStyle='rgba('+(b<4?U.rado:U.secco)+','+ALFA[b]+')';
          c.beginPath();
          for(let i=0;i<v.length;i+=4) c.rect(v[i],v[i+1],v[i+2],v[i+3]);
          c.fill();
        }
      }
    }`;

/* LE PELATE ESCONO DAL RAMO DEI FONDI DURI, e sono l'unica cosa che il
   blocco vecchio perde. Il loro ciclo comincia con if(U.nudo && q>0.5):
   su cemento, asfalto, parquet, sabbia e sintetico non si e' mai disegnata
   una pelata, perche' quei fondi non dichiarano 'nudo'. Lasciarle dentro
   il ramo !U.nudo vorrebbe dire tenere un if che non puo' essere vero, con
   sopra centoventi righe di commento che spiegano una cosa che non
   succede. Il taglio e' quindi a comportamento invariato per definizione,
   e si verifica: la tessitura dei fondi duri esce identica al pixel.
   Se i due estremi non si delimitano, la toppa si ferma come per ogni
   altro ancoraggio. */
const PEL0 = VECCHIO.indexOf(`    /* =================================================================
       LE PELATE — LA GRIGLIA SCOSSA`);
const PEL1 = VECCHIO.indexOf(`    calpestio(46, FH/2,      62, 96, 300);`);
if (!(PEL0 > 0 && PEL1 > PEL0)) {
  console.error('TOPPA NON APPLICATA: il blocco delle pelate non si delimita');
  process.exit(1);
}
const DURO = VECCHIO.slice(0, PEL0) + VECCHIO.slice(PEL1);

cambio('3. l\'usura va dove si corre',
  VECCHIO,
  CAPPELLO + '\n    if(!U.nudo){\n' + rientra(DURO) + '\n' + NUOVO);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa2.js ingresso.html uscita.html'); process.exit(2); }
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