/* =====================================================================
   _toppa-identita.js — «DI CHE SQUADRA E', E QUALE UOMO E'».

   Non tocca il repo. Legge un file di gioco, applica le sostituzioni qui
   sotto e ne scrive uno nuovo. Se una sola sostituzione non trova il suo
   testo ESATTAMENTE UNA VOLTA si ferma e non scrive niente: una toppa
   applicata a meta' e' peggio di una toppa non applicata.

   uso: node strumenti/_toppa-identita.js ingresso.html uscita.html

   ---------------------------------------------------------------------
   IL DIFETTO, detto da chi l'ha visto.

   Il giudice della giuria a 26 che valuta il gioco in piedi sull'autobus,
   con due pollici e a braccio teso:

     «NON RICONOSCO I MIEI UOMINI. Le due squadre usano GLI STESSI NUMERI:
      azzurro 2, 3, 5 — rosa 2, 3, 5. Il numero, che e' l'unico segno
      grafico ad alto contrasto che avete addosso ai corpi, non distingue
      niente: distingue il ruolo, non la squadra. E in istante-04 e
      istante-05, le due inquadrature con la sera che scende, il rosa e'
      desaturato verso il grigio e l'azzurro e' quasi nero: alla luce del
      tramonto LE DUE SQUADRE HANNO LO STESSO COLORE.»

   ---------------------------------------------------------------------
   LA MISURA CHE MANCAVA, e cos'ha trovato.

   Nessuno dei nove cancelli guardava questa cosa: il freeze-frame test
   misura la SCENA (erba vuota, palla, figura, ombre, prato, centro-sera),
   e la distinzione fra due uomini non e' la scena. E' stato costruito
   `strumenti/_identita.js`, che sugli STESSI otto istanti (stesso seme,
   stessa camera, stesso banco) legge dai PIXEL il colore della maglia di
   ogni giocatore in quadro e riporta, per ogni fotogramma, la coppia
   peggiore fra squadre diverse — in OKLab, non in RGB crudo — e quanti
   giocatori hanno un numero che un avversario in quadro porta uguale.

   MISURATO PRIMA (otto istanti, seme 20260728) e RIMISURATO IL 18 AGOSTO
   2026 sul file da 1.658.240 byte, che e' quello a cui questa toppa si
   applica. I numeri si sono mossi sotto i piedi e si riscrivono in
   chiaro, invece di lasciare i vecchi a fare bella figura:
     coppia peggiore di tutte:  dE 9,3        media delle peggiori: 12,6
     numeri ambigui:            34 su 52 giocatori in quadro (65%)
   La stesura precedente leggeva 5,1 / 9,6 / 36 su 53 su una base
   ANTERIORE alla passata della luce — vedi «LA MISURA CHE SI E' MOSSA»,
   piu' sotto: e' una correzione che toglie merito a questa toppa, non
   che gliene aggiunge.
   Due fotogrammi valgono da soli l'intera diagnosi:
     istante 1 — maglia squadra 0 letta #afcace, squadra 1 letta #ecb5b5.
                 CENTOSETTANTUNO GRADI di tinta separano le due, e la
                 distanza vale appena dE 9,3, perche' in chiarezza si
                 separano di TRE DECIMI (dL -0,3, dC -3,4). E' il difetto
                 in una riga sola: due tinte quasi opposte che all'occhio
                 valgono quanto due grigi. (La riga per istante stampa
                 9,4: e' lo stesso 9,35 arrotondato una volta in piu'.)
     istante 3 — #e2e4de contro #bfbdb7: due grigi chiari, dE 11,7,
                 differenza di tinta 30 gradi.
   Non e' un'impressione del giudice: sono gli stessi pixel, contati.

   ---------------------------------------------------------------------
   LA CAUSA DEL COLORE, e non e' quella che sembrava.

   Le due divise NON sono vicine di tinta: 116 gradi le separano in OKLab.
   Sono vicine di CHIAREZZA, e di pochissimo:
        celeste #79c7ff   OKLab L 0,801   croma 0,111
        rosa    #ff96bc   OKLab L 0,793   croma 0,133
   Otto MILLESIMI di L. Tutta la loro distanza sta nel croma — ed e'
   esattamente il canale che la sera spegne, perche' il gioco illumina le
   figure mescolando la maglia al 40% verso l'ambra a ponente e al 38%
   verso il viola-blu a levante (lumiLook): due mescole che tirano
   ENTRAMBE le divise verso le STESSE due tinte. Un velo che desatura
   comprime il croma e lascia stare la chiarezza; con la chiarezza a zero
   di differenza, di sera non resta niente.

   E C'E' UNA REGRESSIONE, DATATA. Il 16 agosto una passata («Tema 3»)
   aveva comprato apposta questa distanza: «#ffb0cf stava a Y 0,567 e la
   fluo a Y 0,860: in scala di grigi due valori VICINI, cioe' due squadre
   che a colore spento si somigliano». Le due divise furono messe su due
   gradini diversi — fluo Y 0,860 contro rosa Y 0,464, 1,77:1. Poi la
   casella 0 e' passata dalla FLUO al CELESTE per una ragione giusta (la
   fluo sta a 71 gradi, diciannove dalla famiglia del prato, e sull'erba
   legge come un lime su un lime) e nessuno ha rimisurato il gradino: il
   celeste sta a Y 0,521 contro 0,467, cioe' 1,12:1. La lezione pagata a
   Tema 3 era stata cancellata da una toppa che parlava d'altro, e nessun
   cancello poteva accorgersene perche' nessun cancello la misurava. E'
   la ragione per cui questa toppa lascia in casa uno strumento e non
   solo dei colori.

   ---------------------------------------------------------------------
   LE TRE LEVE, tutte e tre.

   1) I NUMERI NON SI RIPETONO PIU' FRA LE DUE SQUADRE.
      La regola: LA CASA NUMERA DA 1, GLI OSPITI PROSEGUONO DOVE LA CASA
      FINISCE. Cinque contro cinque: casa 1-5, ospiti 6-10. Sette contro
      sette: casa 1-7, ospiti 8-14. Undici contro undici: casa 1-11,
      ospiti 12-22 — che e' alla lettera il foglio di gara di un torneo
      vero, e dove il 12 e' il numero del secondo portiere.
      PERCHE' QUESTA E NON «CASA DISPARI, OSPITI PARI»: ventidue uomini
      con numeri distinti hanno bisogno di due cifre per almeno dodici di
      loro, qualunque regola si scelga — e questa ne usa il MINIMO
      POSSIBILE a ogni taglia (a cinque contro cinque una sola: il 10).
      Dispari/pari ne produrrebbe quattro gia' a cinque contro cinque. Su
      un torso alto quaranta pixel una cifra in piu' e' meta' larghezza
      per cifra: si spende solo dove non se ne puo' fare a meno.
      IL PORTIERE E LA CONVENZIONE DELL'1, e perche' si conserva a meta'.
      L'1 del portiere resta alla CASA. Non resta agli ospiti, e la
      ragione e' che i DUE portieri vestono la STESSA divisa (GK_UNICA,
      una sola per entrambe le porte, scelta apposta lontano dalle due
      maglie, dal prato e dalla palla): con l'1 a tutti e due, i due
      uomini piu' simili del campo sarebbero anche gli unici due
      indistinguibili al cento per cento. La convenzione «1 = portiere»
      e' una convenzione del FOGLIO DI SQUADRA, e sul foglio di squadra
      di chi gioca — la sua — sopravvive intera.

   2) IL COLORE REGGE IL TRAMONTO, e lo fa col CROMA invece che con la
      chiarezza. Il gradino di luminanza non si puo' comprare: il
      pavimento e' il 3:1 contro l'erba (luminanza relativa >= 0,35), il
      soffitto e' il bianco della palla, e dentro quella fascia i BLU non
      possono essere insieme chiari e carichi — e' la forma del gamut
      sRGB, non un'opinione: a Y 0,62 il croma OKLab massimo di un
      celeste e' 0,094, mentre a Y 0,45 e' 0,144. Un celeste chiaro e'
      un celeste PASTELLO, e due pastelli sotto un velo sono due grigi.
      Percio' si va nell'altra direzione: si scende di un filo in
      luminanza e si compra CROMA su tutte e due le divise.
        casa    #79c7ff -> #46c0ff   Y 0,521->0,462  croma 0,111->0,139
        ospiti  #ff96bc -> #ff80e6   Y 0,467->0,424  croma 0,133->0,194
      Le seconde tinte seguono: la banda della CPU #ec6a96 -> #ea62d2,
      stessa luminanza (0,303 -> 0,309, resta «la parte forte della
      maglia») e croma da 0,166 a 0,210, sulla tinta nuova. Il
      pantaloncino di casa #1e5f9e non si tocca: e' gia' scuro e carico.
      IL VINCOLO PAGATO NON SI DISFA. Le due tinte restano FUORI dalla
      famiglia del prato (90-175 gradi HSV): casa 200 gradi, ospiti 312.
      Il celeste perde cinque gradi di margine (205 -> 200) e ne resta
      con venticinque: si e' fermato li' apposta, perche' a 195 gradi il
      croma sarebbe stato ancora piu' alto ma il margine sarebbe sceso a
      venti — cioe' ESATTAMENTE il margine per cui la fluo (71 gradi,
      diciannove dal confine) era stata tolta dalla casella 0. Non si
      rifiuta una tinta per un margine e se ne accetta un'altra con lo
      stesso margine dall'altro lato.
      Sul metro del banco (la distanza peggiore fra i tre casi che il
      gioco disegna davvero — tinta piena, lato al sole, lato in ombra)
      la coppia passa da 12,5 a 16,7. Il numero che conta e' pero'
      l'altro, quello misurato sui pixel degli otto istanti, e sta qui
      sotto.

   ---------------------------------------------------------------------
   COSA SI VEDE, MISURATO (strumenti/_identita.js, otto istanti, seme
   20260728, gli STESSI del freeze-frame test). Tutta questa tabella e'
   stata RIFATTA il 18 agosto 2026 contro il file da 1.658.240 byte.

                                        coppia peggiore   media   ambigui
     PRIMA, come spedito                      9,3         12,6     34/52
     PRIMA con il numero NON disegnato       10,9         12,9       —
     DOPO  con il numero NON disegnato       14,3         16,2       —
     DOPO, come consegnato                   14,5         15,5      0/52

   Le due righe di mezzo servono a non prendersi merito che non c'e': con
   il numero tolto di mezzo resta il solo COLORE, e il colore da solo vale
   +31% sulla coppia peggiore (10,9 -> 14,3) e +26% sulla media
   (12,9 -> 16,2). Sono le due righe piu' importanti del referto, perche'
   rispondono all'unica obiezione che demolirebbe tutto: «l'alone bianco
   della cifra nuova ti entra nella finestra di misura e ti gonfia il
   numero». Non lo fa: il DOPO senza glifo (14,3) e il DOPO con glifo
   (14,5) distano due decimi.
   Nel file di PRIMA, invece, il glifo pesava eccome, e in negativo: 10,9
   senza numero contro 9,3 con il numero. Il contorno scuro scuriva il
   torso di TUTT'E DUE le squadre, cioe' le AVVICINAVA di un punto e
   mezzo. Adesso ne scurisce una e ne schiarisce l'altra.

   LA MISURA CHE SI E' MOSSA, e perche' e' onesto dirlo.
   La stesura del 18 agosto notte dichiarava un PRIMA di 5,1. Rimisurato
   oggi sullo stesso seme e sugli stessi otto istanti, il PRIMA e' 9,3.
   Non e' rumore ed e' spiegato: la riga «PRIMA senza numero» vale 10,9
   in tutt'e due le misure — il COLORE di partenza non si e' mosso di un
   centesimo. Si e' mossa la vernice del glifo, perche' fra le due misure
   e' entrata nel gioco la passata della LUCE, che ha cambiato quanto il
   contorno scuro annerisce il torso: il glifo costava 5,8 punti di
   distanza, adesso ne costa 1,6.
   Conseguenza pratica, e va scritta grande: QUESTA PASSATA GUADAGNA MENO
   DI QUANTO DICEVA. Da 5,1 a 14,5 era un x2,8; da 9,3 a 14,5 e' un +56%.
   Il guadagno resta il piu' grosso mai misurato su questa voce, ma il
   numero vero e' il secondo.

   LA SCALA, perche' un numero senza scala non dice niente (tutti e
   quattro i valori misurati oggi, stesso banco, stessa mezz'ora):
     due squadre vestite UGUALI (--guasto)          0,1   (media  2,9)
     PRIMA                                          9,3   (media 12,6)
     le divise per DALTONICI, che in casa nessuno
       ha mai contestato (--oro)                    8,6   (media 15,8)
     DOPO                                          14,5   (media 15,5)
   E qui una frase della stesura precedente va ritirata. Diceva: «la
   coppia di serie era PEGGIO della coppia disegnata per chi non distingue
   i colori». Sul file di oggi non e' piu' vero: 9,3 contro 8,6, la coppia
   di serie sta un filo SOPRA quella per daltonici sul caso peggiore
   (e ben sotto sulla media, 12,6 contro 15,8). Quello che resta vero, e
   che basta: il DOPO supera tutte e due, 14,5 contro 8,6 e contro 9,3.

   NEL SECONDO TEMPO, dove la sera e' davvero scesa (--da 46 --a 88):
     media 11,3 -> 14,1 (+25%), ambigui 36/52 -> 0/52,
     ma la coppia peggiore SCENDE: 9,2 -> 8,6.
   Questo e' l'unico numero di tutto il referto che va nella direzione
   sbagliata, e non si nasconde in fondo a una riga. La coppia che lo
   produce (istante 1 del secondo tempo) si separa per dL -7,7 con dC
   quasi nullo: e' una figura per meta' dentro la propria ombra, dove il
   colore non puo' niente e a reggere resta la CHIAREZZA — piu' il numero,
   che li' e' l'unica cosa che porti la squadra. E' esattamente il motivo
   per cui le leve sono tre e non una: se fosse stata solo la tinta,
   quell'istante sarebbe rimasto illeggibile come prima.

   IN MODALITA' DALTONICI le due divise NON si toccano — applyKit()
   riscrive giallo e celeste sopra qualunque kit, quindi la coppia nuova
   li' non entra proprio — ma numeri e verso arrivano anche li':
     peggiore 8,6 -> 13,9, media 15,8 -> 16,0, ambigui 34/52 -> 0/52.
   Cioe' in daltonismo il guadagno e' TUTTO del numero, e si vede: +62%
   sul caso peggiore senza spostare un grado di tinta.

   ---------------------------------------------------------------------
   I CANCELLI, tutti rieseguiti sulla copia toppata il 18 agosto 2026

     collaudo         36/36     (contrasto maglia/erba, i quattro numeri:
                                 P1 3,77:1  maglia #7fb6cb su erba #33562b
                                 P2 4,53:1  maglia #e39fcc su erba #2a4e2e
                                 P1 dalt 5,06:1  maglia #dfc966
                                 P2 dalt 5,40:1  maglia #b1c7d8
                                 minimo 3:1 — margini dal +26% al +80%)
     misura            7/7      senza-rete 6/6      equita 4/4
     silhouette VERDE  folla 4/4  seme VERDE  gabbia VERDE
     volti VERDE
     giocata           8/8      — DA SOLA. Dentro la batteria a quattro
                                 dava un NO sul filtrante: e' cronometrica
                                 e sotto contesa boccia il gioco per un
                                 ritardo che non e' suo. A campo libero,
                                 8 su 8, latenze da 4 a 61 ms.
     istantanea       48/56     — IDENTICA al file di partenza: stesse
                                 otto caselle rosse e stessi valori al
                                 decimo (cinque «terzo centrale», due
                                 «ombre», una «centro e' sera»). Nessuna
                                 delle otto e' di questa passata, e il
                                 totale non e' piu' 47/48 perche' nel
                                 frattempo il freeze-frame test ha preso
                                 la settima misura.

   E LA VERITA' DIETRO I QUATTRO NUMERI, misurata con una copia del gioco
   senza numero addosso, perche' il 3:1 non si legga per quello che non e':
                          misurato dal cancello   maglia vera (senza numero)
     PRIMA  P1                  4,08                     4,92
     PRIMA  P2                  3,77                     4,81
     DOPO   P1                  3,77                     4,50
     DOPO   P2                  4,53                     4,52
     PRIMA  P1 dalt             5,06                     6,09
     PRIMA  P2 dalt             4,24                     5,32
     DOPO   P1 dalt             5,06                     6,09
     DOPO   P2 dalt             5,40                     5,32
   Il contrasto VERO scende di quattro decimi su tutt'e due le divise —
   e' il prezzo del croma, dichiarato — e resta al 50% sopra la soglia.
   Il numero che il cancello STAMPA per P2 sale invece da 3,77 a 4,53
   perche' la sua sonda ha smesso di leggere il contorno scuro del
   numero: 4,53 contro 4,52 di maglia vera. Non e' il gioco che e'
   migliorato li': e' la misura che ha smesso di sbagliare.
   LE QUATTRO RIGHE IN DALTONISMO LO DIMOSTRANO SENZA APPELLO, ed e' la
   prova migliore che c'e' in questo file. Li' le divise NON cambiano di
   un bit (maglia vera 6,09 e 5,32 prima e dopo, identiche): cambia solo
   il verso del numero. E il cancello stampa lo stesso P2 da 4,24 a 5,40.
   Un punto e sedici centesimi di «miglioramento» su una divisa che
   nessuno ha toccato: quello e' il pezzo di sonda che misurava vernice.

   IL MARGINE PIU' STRETTO, che e' l'altro numero da guardare. Il
   cancello aggrega tre partite, ma le stampa anche una per una:
     PRIMA  P1 4,76 / 3,35 / 4,18      P2 4,27 / 4,26 / 3,14
     DOPO   P1 4,31 / 3,13 / 3,83      P2 4,69 / 4,84 / 3,84
   La partita piu' avara passa da 3,14 a 3,13 — un centesimo, cioe' il
   rumore del banco — e cambia soltanto di squadra: prima era la rosa a
   grattare il fondo, adesso e' il celeste. Il pavimento non si e'
   abbassato; si e' spostato di posto.

   ---------------------------------------------------------------------
   DUE COSE CHE QUESTA TOPPA NON FA, e che e' giusto sapere.

   1) `--tu` e `--loro` nel foglio di stile (riga 117) restano a
      #d6ff26 e #ff90b8, due divise che non esistono piu' in nessuna
      casella. Non e' un difetto introdotto qui — era gia' cosi' — e non
      si vede, perche' applyKit() le riscrive al primo fischio; ma e'
      una copia stantia, e quando qualcuno la ripulira' sappia che c'e'.
   2) IL TORNEO NON E' STATO GUARDATO. TOUR_POOL schiera dieci squadre
      con tinte proprie, e due di quelle stanno DENTRO la famiglia del
      prato: MERCATO VERDE #7ddf3f (96 gradi) e CASE NUOVE #f2f5ef (90
      gradi, che e' bianco ma cade li' per come si calcola la tinta di un
      grigio). Con una di quelle in campo il contrasto maglia/manto torna
      a essere tutto luminanza, che e' esattamente cio' che la sera
      spegne. Non e' il difetto che il giudice ha nominato e non si tocca
      qui, ma _identita.js sa gia' misurarlo: basta aprire una partita di
      torneo invece dell'amichevole.

   3) IL SEGNO SUL CORPO: IL NUMERO CAMBIA VERSO CON LA SQUADRA.
      Il giudice l'ha detto meglio di come si direbbe qui: il numero e'
      «l'unico segno grafico ad alto contrasto che avete addosso ai
      corpi». Allora e' quello che deve portare la squadra.
        CASA    cifra CHIARA (#f4f7f1) con contorno scuro — come prima.
        OSPITI  cifra SCURA (#0c1410) con ALONE chiaro.
      Perche' proprio il verso, e non una fascia o una banda: alla scala
      di gioco il torso e' dieci pixel per dodici e il numero ne occupa
      la meta' — a quella misura IL NUMERO E' IL PETTO, e cambiargli il
      verso e' come cambiare il colore del petto. E' il segno con il
      rapporto area/costo piu' alto che ci sia addosso a queste figure.
      COSTA ZERO: sono le stesse due chiamate di prima (uno strokeText e
      un fillText), con due costanti scelte dalla squadra. Nessun
      riempimento in piu', nessun percorso in piu', nessun oggetto nuovo
      per fotogramma.
      E SOPRAVVIVE AL VELO, che e' il punto: la mescola di lumiLook e'
      LINEARE, quindi conserva l'ordine dei valori. Comunque si spenga la
      sera, il chiaro resta piu' chiaro dello scuro; e' l'unico canale
      che il tramonto non puo' comprimere a zero.
      E I DUE PORTIERI, che vestono uguale, smettono di essere la stessa
      figura: numero diverso E verso diverso.

      L'ALONE E' LARGO 1,45 COME IL CONTORNO DI CASA, E NON DI PIU'.
      Questa e' la riga che e' costata piu' misure di tutta la toppa, e
      quello che ha trovato vale piu' della riga.
      La prima stesura dava agli ospiti un alone da 2,10 — piu' grosso,
      perche' una cifra scura ha bisogno di staccarsi dalla maglia mentre
      una chiara si stacca da sola. Con quell'alone collaudo.js dichiarava
      il contrasto maglia/erba di P2 in salita da 3,66 a 4,80. Il numero
      era vero e la conclusione sarebbe stata falsa: il glifo entra nella
      FINESTRA DELLA SONDA (le tre file -12,5/-11,5/-10,5), e un alone
      bianco li' dentro schiarisce la mediana della maglia. Il file
      dichiarava 1,2 unita' di margine; sui pixel non ce ne sono.
      MISURATO CON UN RIFERIMENTO CHE NON MENTE (strumenti/_sonda-glifo.js:
      la stessa identica finestra di collaudo.js, e una copia del gioco
      con il numero NON DISEGNATO, che da' la vera tinta della maglia):
        maglia vera, senza numero addosso       P2  Y 0,4542
        cifra chiara e contorno scuro (com'era) P2  Y 0,3441   -24%
        cifra scura e alone bianco a 2,10       P2  Y 0,4726   + 4%
        cifra scura e alone bianco a 1,45       P2  Y 0,4492   - 1%
      Cioe': la finestra della sonda era GIA' sporca, da sempre, e sporca
      di scuro — il contorno del numero le toglieva un quarto di
      luminanza. A 1,45 il bianco della cifra nuova e il nero che c'era
      prima si compensano, e la sonda misura la maglia entro l'uno per
      cento del vero. Non e' un cancello reso piu' facile: e' un cancello
      reso piu' VERO, e la prova e' il riferimento senza numero.
      RESTA APERTO, ed e' onesto dirlo: la squadra 0 tiene il contorno
      scuro, quindi la sua finestra resta sporca di scuro come prima
      (Y 0,4182 contro 0,5072 di maglia vera, -17%). Il suo 3:1 e' percio'
      misurato per difetto — sicuro, ma non esatto. Chiuderlo vuol dire
      alzare l'ancora del numero, e non si puo': a 0,88 e a 0,92 del
      segmento pelvi-collo il glifo finisce SULLA TESTA (guardato, non
      dedotto). E' un difetto della sonda, non della divisa, e va
      riparato di la'.
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1
   LA REGOLA DEI NUMERI, in un posto solo. */
cambio('1. numeroDi — la regola, in un posto solo',
`function makePlayer(team, idx, x, y, role){`,
`/* =====================================================================
   IL NUMERO DICE ANCHE LA SQUADRA, non solo il ruolo.

   Prima le due squadre numeravano tutt'e due da 1: azzurro 2, 3, 5 e
   rosa 2, 3, 5. Il numero e' il segno piu' contrastato che c'e' addosso
   a queste figure, ed era l'unico che NON portava informazione sulla
   squadra — la portava solo la tinta della maglia, che di sera si spegne.

   LA REGOLA: la casa numera da 1, gli ospiti proseguono dove la casa
   finisce. 5 contro 5 -> casa 1-5, ospiti 6-10. 7 contro 7 -> 1-7 e 8-14.
   11 contro 11 -> 1-11 e 12-22, che e' il foglio di gara di un torneo
   vero (e li' il 12 e' il numero del secondo portiere).
   Ventidue uomini con numeri distinti obbligano a due cifre per almeno
   dodici di loro, comunque si scelga; questa regola ne usa il minimo
   possibile a ogni taglia — a cinque contro cinque una sola, il 10.
   L'1 DEL PORTIERE resta alla casa e non agli ospiti: i due portieri
   vestono la STESSA divisa (una sola per entrambe le porte, vedi
   GK_UNICA), quindi un 1 in comune renderebbe i due uomini piu' simili
   del campo anche gli unici due indistinguibili. La convenzione e' del
   foglio di squadra, e sul foglio di chi gioca resta intera.
   ===================================================================== */
function numeroDi(team, idx){
  const N = (TAGLIE[TAGLIA] && TAGLIE[TAGLIA].modulo.length) || 5;
  return (team ? N : 0) + (idx|0) + 1;
}
function makePlayer(team, idx, x, y, role){`);

cambio('1b. ogni giocatore nasce col suo numero',
`    team, idx, x, y, vx:0, vy:0,`,
`    team, idx, x, y, vx:0, vy:0,
    /* IL NUMERO E' UN CAMPO, non un conto rifatto dove serve. Lo legge
       chi disegna, chi scrive il tabellino e chi misura da fuori
       (strumenti/_identita.js): tre copie della stessa regola sono una
       regola che prima o poi diverge. */
    numero: numeroDi(team, idx),`);

/* ------------------------------------------------------------------ 2
   IL NUMERO SULLA SCHIENA: quale, quanto grande, e di che verso. */
cambio('2. la cifra viene dal campo, non da idx+1',
`      const cifra=String(p.idx+1);`,
`      const cifra=String(p.numero!=null?p.numero:p.idx+1);`);

cambio('2b. due cifre stanno nella larghezza di una',
`      const fs=Math.max(7, 6.5/sPix);`,
`      let fs=Math.max(7, 6.5/sPix);
      /* DUE CIFRE DEVONO STARE NELLA LARGHEZZA DI UN TORSO, che e' la
         stessa di prima. Il glifo si stringe del 18%: e' il minimo che
         fa entrare "10" dove entrava "1" senza che le due cifre si
         tocchino, e non e' una perdita di leggibilita' perche' il
         vincolo di un numero a due cifre non e' l'altezza ma la
         larghezza — a torso pieno si legge meglio "12" a 5,7 unita' che
         "12" a 7 unita' con le cifre mangiate dal bordo del busto.
         Effetto collaterale voluto: un glifo piu' piccolo allontana la
         sua frangia scura dalla finestra con cui collaudo.js misura il
         contrasto maglia/erba. */
      if(cifra.length>1) fs*=0.82;`);

cambio('2c. IL VERSO DEL NUMERO DICE LA SQUADRA',
`        ctx.strokeStyle='rgba(8,16,11,.88)'; ctx.lineWidth=1.45*fs/7;
        ctx.strokeText(cifra, nx, ny);
        ctx.fillStyle='#f4f7f1';
        ctx.fillText(cifra, nx, ny);`,
`        /* IL VERSO DEL NUMERO DICE LA SQUADRA — la terza leva, e costa
           zero: sono le stesse due chiamate di prima con due costanti
           scelte dalla squadra.
             CASA    cifra CHIARA con contorno scuro (come sempre)
             OSPITI  cifra SCURA con alone chiaro
           Alla scala di gioco il torso e' dieci pixel per dodici e il
           numero ne occupa la meta': a quella misura IL NUMERO E' IL
           PETTO, e cambiargli il verso vale quanto cambiare il colore
           del petto. E' anche l'unico canale che il tramonto non puo'
           comprimere: la mescola di lumiLook e' lineare, quindi conserva
           l'ordine dei valori — comunque si spenga la sera, il chiaro
           resta piu' chiaro dello scuro. La tinta no: la sera la tira
           verso l'ambra a ponente e verso il viola-blu a levante, cioe'
           verso le stesse due tinte per tutt'e due le squadre, ed e'
           esattamente il modo in cui le due divise si confondevano.
           E I DUE PORTIERI, che vestono la stessa identica divisa,
           smettono di essere la stessa figura: numero diverso E verso
           diverso.
           L'ALONE E' LARGO 1,45 COME IL CONTORNO, e la larghezza e' una
           MISURA e non un gusto. Il glifo entra nella finestra con cui
           collaudo.js legge il contrasto maglia/erba — il margine di 1,2
           unita' dichiarato qui sopra sui pixel non c'e'. Misurato con
           una copia del gioco senza numero addosso (la vera tinta della
           maglia) e la stessa finestra della sonda:
             maglia vera                       P2  Y 0,4542
             cifra chiara, contorno scuro      P2  Y 0,3441   -24%
             cifra scura, alone bianco 2,10    P2  Y 0,4726   + 4%
             cifra scura, alone bianco 1,45    P2  Y 0,4492   - 1%
           A 2,10 il cancello saliva da 3,66 a 4,80 per merito del
           BIANCO, non della maglia. A 1,45 il chiaro nuovo e lo scuro di
           prima si compensano e la sonda torna a misurare la maglia. */
        const nChiaro = (p.team===0);
        ctx.strokeStyle = nChiaro ? 'rgba(8,16,11,.88)' : 'rgba(246,249,243,.94)';
        ctx.lineWidth = 1.45*fs/7;
        ctx.strokeText(cifra, nx, ny);
        ctx.fillStyle = nChiaro ? '#f4f7f1' : '#0c1410';
        ctx.fillText(cifra, nx, ny);`);

cambio('2d. il tabellino legge lo stesso campo',
`    G.goalNum  = pl ? pl.idx+1 : 0;`,
`    G.goalNum  = pl ? (pl.numero!=null?pl.numero:pl.idx+1) : 0;`);

/* ------------------------------------------------------------------ 3
   IL DUELLO DAL DISCHETTO parla la stessa lingua. */
cambio('3. rigore — il portiere porta il numero della sua porta',
`      ctx.strokeText('1', nx, ny);
      ctx.fillStyle='#f4f7f1';
      ctx.fillText('1', nx, ny);`,
`      /* IL NUMERO DEL PORTIERE E' QUELLO DELLA SUA SQUADRA, e non un '1'
         scritto a mano: qui il portiere puo' essere di casa o ospite, e
         due scene che numerano con due regole diverse sono due giochi.
         Il verso lo dice la squadra, come in campo. */
      const nK=String(numeroDi(D.keeper,0)), kChiaro=(D.keeper===0);
      ctx.strokeStyle = kChiaro ? 'rgba(8,16,11,.88)' : 'rgba(246,249,243,.94)';
      ctx.lineWidth = Math.max(1.7,hbK*0.040);
      ctx.strokeText(nK, nx, ny);
      ctx.fillStyle = kChiaro ? '#f4f7f1' : '#0c1410';
      ctx.fillText(nK, nx, ny);`);

cambio('3b. rigore — il tiratore porta un numero della sua squadra',
`      ctx.strokeText('10', nx, ny);
      ctx.fillStyle='#f4f7f1';
      ctx.fillText('10', nx, ny);`,
`      /* IL TIRATORE: il numero 10 della SUA squadra, cioe' il decimo
         della sua serie quando c'e' (undici contro undici) e altrimenti
         l'ultimo — il nove di un cinque contro cinque non esiste. Stessa
         regola, stesso verso. */
      const modS=(TAGLIE[TAGLIA] && TAGLIE[TAGLIA].modulo.length)||5;
      const nS=String(numeroDi(D.shooter, Math.min(9, modS-1))), sChiaro=(D.shooter===0);
      ctx.strokeStyle = sChiaro ? 'rgba(8,16,11,.88)' : 'rgba(246,249,243,.94)';
      ctx.lineWidth = Math.max(1.7,hbS*0.040);
      ctx.strokeText(nS, nx, ny);
      ctx.fillStyle = sChiaro ? '#f4f7f1' : '#0c1410';
      ctx.fillText(nS, nx, ny);`);

/* ------------------------------------------------------------------ 4
   LE DUE DIVISE: piu' croma, stessa famiglia, stesso vincolo. */
cambio('4. CELESTE — piu\' croma, cinque gradi piu\' vicino al confine e non uno di piu\'',
`  { nome:'CELESTE',   c1:'#79c7ff', c2:'#1e5f9e', pat:1 },`,
`  /* IL CELESTE SI CARICA, E IL PERCHE' E' UN CONTO SUL GAMUT.
     #79c7ff e #ff96bc distavano 116 gradi di tinta e OTTO MILLESIMI di
     chiarezza OKLab (0,801 contro 0,793): tutta la loro distanza stava
     nel croma, che e' il canale che la sera spegne — il gioco illumina
     le figure mescolandole al 40% verso l'ambra a ponente e al 38% verso
     il viola-blu a levante, cioe' tirando ENTRAMBE le divise verso le
     STESSE due tinte. Misurato sui pixel degli otto fermi immagine, la
     coppia peggiore in quadro scendeva a dE 9,3 e la media a 12,6; e il
     fotogramma che lo dice meglio e' il primo, dove le due maglie
     leggono #afcace e #ecb5b5 — CENTOSETTANTUNO gradi di tinta l'una
     dall'altra, e appena tre decimi di chiarezza, che e' quanto resta
     quando il velo della sera ha spento il croma.
     IL GRADINO DI CHIAREZZA NON SI PUO' COMPRARE, e va detto perche' e'
     la prima cosa che si prova: il pavimento e' il 3:1 contro l'erba
     (Y >= 0,35) e dentro quella fascia i blu non possono essere insieme
     chiari e carichi — a Y 0,62 il croma OKLab massimo di un celeste e'
     0,094, a Y 0,45 e' 0,144. Un celeste piu' chiaro e' un celeste piu'
     PASTELLO, e due pastelli sotto un velo sono due grigi: provato sul
     metro, #a8dcff con la rosa di prima faceva PEGGIO di #79c7ff.
     Percio' si scende di un filo in luminanza e si compra croma:
       #46c0ff  Y 0,462 (era 0,521)  croma OKLab 0,139 (era 0,111)
     LA TINTA SI FERMA A 200 GRADI, e non a 195 dove il croma sarebbe
     ancora piu' alto: a 195 il margine dalla famiglia del prato (90-175)
     scenderebbe a venti gradi, che e' ESATTAMENTE il margine per cui la
     fluo — 71 gradi, diciannove dal confine — e' stata tolta da questa
     casella. Non si rifiuta una tinta per un margine e se ne accetta
     un'altra con lo stesso margine dall'altro lato. A 200 gradi il
     margine e' venticinque. */
  { nome:'CELESTE',   c1:'#46c0ff', c2:'#1e5f9e', pat:1 },`);

cambio('4b. ROSA — la CPU prende croma sulla stessa famiglia',
`const ROSA_KIT='#ff96bc';                    // la CPU: rosa saturo, un gradino sotto la fluo`,
`/* E ADESSO SI CARICA ANCHE LEI, per lo stesso conto e in coppia col
   celeste nuovo (vedi il cappello della casella CELESTE in KITS).
   #ff96bc aveva croma OKLab 0,133 a Y 0,467: un rosa PASTELLO, e sotto
   la mescola della sera restava un grigio rosato — misurato #bfbdb7 al
   terzo fermo immagine (contro un #e2e4de di casa: due grigi chiari a
   trenta gradi di tinta) e #ecb5b5 al primo. #ff80e6 tiene la stessa
   famiglia (resta la ROSA, che e' anche il nome che la squadra porta in
   due giocatori) e porta il croma a 0,194, cioe' il 46% in piu', con Y
   0,424: quattro centesimi sotto prima, dentro il pavimento dei 0,35 con
   il 21% di margine, e il rapporto misurato contro l'erba lo stampa
   collaudo.js.
   Tinta 312 gradi HSV: centotrentasette dal confine caldo della famiglia
   del prato, e cento e passa dal celeste di casa. */
const ROSA_KIT='#ff80e6';                    // la CPU: magenta-rosa carico, fuori dal prato di 137 gradi`);

cambio('4c. la banda della CPU segue la maglia',
`const TEAMCOL2=['#9cc012','#ec6a96'];        // seconda tinta della maglia`,
`/* LA BANDA SEGUE LA MAGLIA, A LUMINANZA FERMA. #ec6a96 stava a Y 0,303
   e la regola scritta qui sopra dice che dev'essere «la parte FORTE
   della maglia e non la parte spenta». #ea62d2 sta a Y 0,309 — la stessa
   luminanza, quindi il margine contro il manto non si muove — sulla
   tinta nuova (311 gradi contro i 312 della maglia) e con croma da 0,166
   a 0,210. Cambia il colore, non il peso. */
const TEAMCOL2=['#9cc012','#ea62d2'];        // seconda tinta della maglia`);

cambio('4d. il ripiego "r,g,b" non resta indietro',
`const TEAMRGB=['214,255,38','255,176,207'];  // versione "r,g,b" per anelli e stick`,
`/* i valori di partenza (li riscrive refreshTeamRGB al primo kit): erano
   rimasti a due divise che non esistono piu' in nessuna delle due
   caselle — una copia stantia della verita' e' il modo piu' silenzioso
   di sbagliare */
const TEAMRGB=['70,192,255','255,128,230'];  // versione "r,g,b" per anelli e stick`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-identita.js ingresso.html uscita.html'); process.exit(2); }
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
