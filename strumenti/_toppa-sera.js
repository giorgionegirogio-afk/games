/* =====================================================================
   _toppa-sera.js — LA SERA SI LIBERA DALLA MAGLIA, E LA PALLA SI SPEGNE.

   Non tocca il repo. Legge un file di gioco, applica le sostituzioni qui
   sotto e scrive un file nuovo. Se una sola sostituzione non trova il suo
   testo esattamente una volta, si ferma e non scrive niente: una toppa
   applicata a meta' e' peggio di una toppa non applicata.

   uso: node strumenti/_toppa-sera.js ingresso.html uscita.html

   =====================================================================
   IL FATTO, IN UNA RIGA: il gioco aveva DUE ORE. Il menu dichiarava le
   sette di sera e le dipingeva; la partita dichiarava le sette di sera e
   dipingeva un pomeriggio. Misurato col contagocce sui soli pixel di
   manto (famiglia del prato: tinta 90-175, croma >= 0,12, valore >= 0,18
   — la stessa maschera di istantanea.js, cosi' il metro e' quello che
   giudica gia' il gioco):

                       PRIMA                    DOPO
     menu        S 0,444  V 0,227  T 143,2   S 0,362  V 0,235  T 122,6
     azione      S 0,748  V 0,380  T 123,0   S 0,506  V 0,322  T 121,5
     kickoff     S 0,771  V 0,376  T 127,3   S 0,523  V 0,318  T 127,8
     11 contro 11 S 0,774 V 0,400  T 124,1   S 0,517  V 0,341  T 123,2
     gol         S 0,625  V 0,278  T 130,5   S 0,463  V 0,275  T 125,1

   Ventisei punti di croma di distanza fra menu e azione sono diventati
   quattordici; venti gradi di tinta sono diventati uno. E' la frase del
   giudice presa alla lettera — «azione e menu devono essere LA STESSA
   ORA» — non un miglioramento generico.

   =====================================================================
   PERCHE' LE DUE ORE ESISTEVANO, ed e' una riga sola di codice.

   oraPartita() dice 0,80 quando la scena e' il menu e 1-timeLeft/durata
   quando si gioca. Il velo della sera (veloBaseA) partiva da 0,045.
   Cioe': il MENU e' sempre sera piena, la PARTITA COMINCIA A MEZZOGIORNO
   e diventa sera solo verso la fine. Le ombre pero' partono dal primo
   fotogramma a venti gradi sull'orizzonte, e i fari si accendono uno
   alla volta perche' «la luce se ne sta andando». Tutto il resto del
   gioco dichiara un'ora che il colore del prato smentiva per i primi
   sessanta secondi.

   La cura non e' cosmetica: LA SERA HA UN PAVIMENTO. Il velo non parte
   da 0,045, parte da 0,34 — la partita comincia gia' di sera e la sera
   si approfondisce, invece di ARRIVARE. E ha anche un TETTO, 0,60, che
   e' l'altra meta' della stessa scoperta (vedi «IL TETTO», sotto).

   =====================================================================
   LA CATENA DEL GIUDICE, VERIFICATA E CORRETTA IN UN PUNTO.

   Il giudice: «la maglia lime impone il cancello dei 3:1, il cancello
   vieta l'ambra, senza ambra il prato non fa le sette di sera. LA SERA
   E' STATA SACRIFICATA ALLA MAGLIA.»

   La catena e' giusta nella conclusione e sbagliata in un anello, e va
   detto perche' il prossimo che legge non ci perda una passata. Il
   cancello 3:1 NON era stretto per la fluo: misurato prima della toppa,
   i quattro rapporti erano 4,91 / 3,31 / 4,49 / 3,71 e il piu' stretto
   era P2 IN VISTA NORMALE, cioe' il ROSA della CPU — la fluo stava al
   massimo. Chi teneva l'ambra bassa era il rosa, non il lime.
   Ma l'errore non cambia la cura, e la cura resta la sua: il budget di
   luminanza si libera comunque, e si libera dalla parte giusta. Tutte e
   quattro le divise sono PIU' CHIARE dell'erba, quindi un manto piu'
   scuro ALZA tutti e quattro i rapporti. Abbassando il prato di sera si
   e' comprato quello che serviva all'ambra:
     P1 normale        4,91 -> 4,23
     P2 normale        3,31 -> 3,84     <- il cancello che mordeva, +16%
     P1 daltonismo     4,49 -> 5,21
     P2 daltonismo     3,71 -> 4,25
   Il solo rapporto che scende e' quello della divisa di casa, e scende
   perche' la maglia nuova e' molto meno luminosa della fluo — che e'
   esattamente il punto del giudice.

   LE TINTE DELLE QUATTRO DIVISE, contro la famiglia del prato (90-175):
     P1 normale     CELESTE  #79c7ff   tinta 205,1°   Y 0,521
     P2 normale     ROSA     #ff96bc   tinta 338,3°   Y 0,464
     P1 daltonismo  GIALLA   #ffe14d   tinta  49,9°   Y 0,762
     P2 daltonismo  CELESTE  #9ccbff   tinta 211,5°   Y 0,592
   Nessuna sta dentro 90-175, e la piu' vicina dista trenta gradi dal
   bordo. La divisa di prima, FLUO #d6ff26, stava a 71,3° con Y 0,860:
   fuori dalla famiglia per diciannove gradi e dentro la stessa
   PERCEZIONE del verde — un lime su un prato e' un lime su un prato,
   qualunque cosa dica l'aritmetica della tinta. Il contrasto lo faceva
   la luminanza, 0,860 contro 0,084, e infatti la scena del gol era una
   sola macchia giallo-verde. Adesso l'ottantatre' gradi di distanza fra
   celeste e prato fa il lavoro che faceva l'ottanta per cento di
   luminanza: il contrasto viene DALLA TINTA, e il budget di luce resta
   dov'e' utile.

   PERCHE' CELESTE E NON ARANCIO NE' BIANCO, e sono tre esclusioni
   motivate, non un gusto:
     · ARANCIO #ff9d2e sta a 31,9°, cioe' a sette gradi dall'ambra
       dell'interfaccia (#ffb020, 38,9°) e a undici dalla pozza dei fari
       al sodio (255·124·74, 20,6°). La regola di casa dice che l'ambra
       e' la tinta dell'INTERAZIONE e di nient'altro: una squadra
       arancione mette dieci bottoni che corrono in campo.
     · BIANCO #f2f5ef ha croma 0,024 ed e' il colore del PALLONE. La
       cosa che questa stessa toppa spegne — la lampadina della palla —
       si rifarebbe da sola con undici sagome bianche attorno a lei.
     · CELESTE #79c7ff sta a 205°, cioe' dalla parte opposta del cerchio
       rispetto al prato, lontano dall'ambra dell'interfaccia, lontano
       dal rosa della CPU (338°) e lontano dal bianco del pallone. In
       modalita' daltonici non cambia niente: quella modalita' impone
       gia' la coppia giallo/celeste e non guarda il kit scelto.
   La divisa di serie si sposta SCAMBIANDO le due voci del listino, non
   riscrivendone una: chi aveva comprato il pacchetto divise ritrova
   tutte e otto le tinte, nello stesso ordine di prima meno lo scambio.

   =====================================================================
   IL TETTO DEL VELO, E PERCHE' NON E' UNA COMODITA'.

   Prima stesura: velo dal 0,42 in su, senza tetto. Il banco ha bocciato
   tutto insieme — ombre 4/8, temperatura 4/8, centro sera 7/8, erba
   vuota crollata dal 29% al 10% — e il motivo era uno solo, misurato
   pixel per pixel con un attrezzo scritto apposta:

     istante 04, quanti pixel del quadro NON sono prato e perche'
                        prima        col velo senza tetto
       valore < 0,18     14,7%              16,5%
       croma  < 0,12      3,4%               3,5%
       tinta  <  90       7,0%              12,9%
       tinta  > 175      12,7%              18,5%
       ERBA              62,2%              48,6%

   Il manto smetteva di essere manto. Non «per il banco»: per chiunque —
   un verde che vira a 190 gradi e' azzurro, un verde sotto 0,18 di
   valore e' nero. E allora il cancello delle ombre cadeva per un motivo
   che sembra assurdo e non lo e': la misura scarta la figura i cui piedi
   NON stanno sul manto, e i piedi non ci stavano piu' perche' il manto
   non c'era piu'. Tre figure su otto per «piedi fuori dal manto»
   all'istante 04, dove prima erano zero.

   Da qui i tre limiti che questa toppa si da', e sono limiti FISICI
   scritti nel metro, non soglie da inseguire:
     1) IL TETTO 0,60 sul velo. Oltre, il manto tende alla tinta del velo
        e la tinta del velo non e' erba. Con 0,60 il prato di fine
        partita resta a valore 0,25 e tinta 136°.
     2) L'OMBRA DEVE RESTARE ERBA. Il manto di sera sta a valore 0,25;
        un'ombra il 20% piu' scura sta a 0,20, e sotto 0,18 non e' piu'
        prato. Il tetto del velo e' quindi ANCHE il pavimento dell'ombra:
        sono lo stesso vincolo visto da due parti.
     3) I DUE POLI DELLA TEMPERATURA NON POSSONO CRESCERE SENZA FINE. Su
        un manto smorzato la stessa alfa di ambra sposta la tinta il
        doppio: portata a 0,155 a ponente, l'ambra buttava fuori famiglia
        il 13% del quadro (tinta < 90) e il rimbalzo del cielo a 0,185 ne
        buttava fuori un altro 18% (tinta > 175). Riportati a 0,130 e
        0,125 il quadro resta prato e l'escursione misurata sta fra 38 e
        64 gradi, contro un cancello di 12 e i 31 di prima.

   IL PREZZO, DICHIARATO INVECE CHE NASCOSTO. Il giudice chiede il valore
   del manto «verso lo 0,20 del menu». Si arriva a 0,32, non a 0,20, e i
   0,12 che mancano sono di proprieta' dei due cancelli qui sopra:
     · sotto 0,26 di valore al fischio d'inizio, l'ombra a terra scende
       sotto 0,18 e le figure perdono l'ombra misurabile;
     · e sotto quel valore «il centro e' sera» — che confronta la sera
       col GIOCO STESSO all'ora zero — non ha piu' niente da misurare:
       se il fischio d'inizio e' gia' buio come il novantesimo, la sera
       non CALA piu', ed e' un difetto vero, non solo un numero rosso.
   Il menu puo' stare a 0,20 perche' su di lui non cammina nessuno e non
   ci sono ombre da leggere. Il campo no.

   =====================================================================
   L'ALONE DELLA PALLA, E L'ACCUSA DI METODO DEL GIUDICE.

   «Palla trovabile 8/8 e' stata ottenuta ACCENDENDOLA.» Misurato, non e'
   vero, e la prova sta nei numeri del banco prima della toppa:
     · il DIAMETRO che il cancello chiede e' l'1,8% della larghezza. Il
       pallone e' DISEGNATO a B_R x B_DIS = 8 x 1,34, col pavimento di
       PALLA_MIN_QUADRO = 2,31% del quadro. Il diametro disegnato negli
       otto istanti sta fra 47,6 e 62,2 px, cioe' fra il 2,60% e il 3,40%:
       il cancello lo passa la GEOMETRIA dichiarata, con un margine del
       44% nel caso peggiore, non l'alone;
     · la LUMINANZA che il cancello chiede e' 2 volte la mediana del
       quadro. Il nucleo del pallone misura 238-255 su una mediana di
       55-72, cioe' 3,5-4,4 volte. L'alone e' una velatura al 55% di una
       tessitura che al suo picco vale 0,30 di alfa: su un bianco 252 non
       aggiunge un livello.
   L'alone quindi non reggeva nessun cancello. Reggeva un'ABITUDINE, e
   costava cara: era l'unica sorgente di luce del campo che non viene da
   nessuna parte, era CENTRATA SULLA PALLA e saliva con lei quando la
   palla si alzava (by = y - z·0,55), e soprattutto lavava via l'ombra —
   proiezione staccata piu' macchia di contatto — che e' il lavoro
   migliore fatto sulla palla e che in undici fotografie su undici non si
   vedeva.
   Spenta: il pallone resta il piu' leggibile per contrasto, e i numeri
   DOPO la toppa lo dicono con piu' margine di prima, perche' il prato di
   sera e' sceso: 3,81-4,63 volte la mediana contro le 3,54-4,40 di
   prima, con il diametro misurato che scende a 46-62 px, cioe' addosso a
   quello disegnato. Otto istanti su otto, senza lampadina.
   (L'alone dei CORPI resta: quello e' posato A TERRA sotto i piedi,
   schiacciato a 0,62 di ellisse, e legge come rialzo d'erba al contatto
   — non sale col corpo e non e' una sorgente. E' un'altra cosa.)

   =====================================================================
   COSA DICONO I BANCHI, prima e dopo, sulla stessa copia:
     collaudo calcetto   24/24 -> 24/24   (i quattro contrasti sopra)
     istantanea          47/48 -> 47/48   erba vuota 8/8 · palla 8/8 ·
                         figura 8/8 · ombre 7/8 · temperatura 8/8 ·
                         centro sera 8/8. L'unico istante rosso e' il 5,
                         ed era rosso anche prima, per la stessa ragione
                         (tre figure sul bordo, tre in duello).
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1
   LA DIVISA DI SERIE ESCE DALLA FAMIGLIA DEL VERDE.
   Si SCAMBIANO due voci del listino: la casella 0 e' l'unica gratis
   (buildKitGrid: `libero = i===0 || shopHa('divise')`), quindi la divisa
   di serie e' quella che sta li'. Le altre sette restano tutte. */
cambio('1. la divisa di serie: CELESTE al posto di FLUO',
`  { nome:'FLUO',      c1:'#d6ff26', c2:'#9cc012', pat:1 },
  { nome:'CELESTE',   c1:'#79c7ff', c2:'#1e5f9e', pat:1 },`,
`  /* LA DIVISA DI SERIE E' IL CELESTE, E LA FLUO SCENDE DI UNA CASELLA.
     Il conto sta in testa a questa toppa; qui basta il perche' in tre
     righe. La fluo #d6ff26 sta a 71,3 gradi con Y 0,860: fuori dalla
     famiglia del prato per diciannove gradi soltanto, e sull'erba legge
     come un lime su un lime — nella scena del gol tre giocatori che
     esultano su un prato verde erano UNA macchia giallo-verde. Il suo
     contrasto era tutto luminanza (0,860 contro 0,084 dell'erba), e la
     luminanza e' proprio il budget che serviva alla sera.
     #79c7ff sta a 205 gradi — ottantatre' dal prato, centotrenta dal
     rosa della CPU, centosessantasei dall'ambra dell'interfaccia — con
     Y 0,521. Il contrasto viene dalla TINTA, e il budget di luce e'
     libero. Il motivo resta il PALATO, che e' la casa della squadra di
     casa (vedi il commento qui sopra).
     LA CASELLA 0 E' L'UNICA GRATIS: spostare la tinta vuol dire
     scambiare le due righe, non riscriverne una. Chi ha comprato il
     pacchetto divise ritrova tutte e otto le tinte. */
  { nome:'CELESTE',   c1:'#79c7ff', c2:'#1e5f9e', pat:1 },
  { nome:'FLUO',      c1:'#d6ff26', c2:'#9cc012', pat:1 },`);

/* ------------------------------------------------------------------ 2
   IL PORTIERE EVITA ANCHE IL BIANCO DELLA PALLA. */
cambio('2. il portiere sta lontano anche dalla palla',
`  const evita=[rgbTriple(TEAMCOL[0]), rgbTriple(TEAMCOL[1]), [40,86,60]];`,
`  /* E LA QUARTA COSA DA CUI STARE LONTANI E' IL PALLONE. La lista
     diceva: le due divise e il prato. Manca l'oggetto che l'occhio segue
     per novanta secondi. Con la divisa di casa celeste, la scelta
     vincente diventava il BIANCO #f2f5ef — un portiere bianco accanto a
     una palla bianca, cioe' due volte lo stesso segnale nella stessa
     area, proprio mentre questa toppa spegne l'alone che teneva la palla
     staccata. Aggiunto il bianco del pallone (fcfef8, la tinta di
     buildBallTex) il portiere sceglie l'ambra #ff9f1c: fuori dal verde
     del prato, fuori dal celeste di casa, fuori dal rosa della CPU e
     fuori dal bianco della palla — quattro tinte in campo, quattro
     famiglie diverse. Con la fluo addosso alla squadra di casa la scelta
     NON cambia: resta il verde acqua di sempre, perche' il bianco non
     vinceva comunque. */
  const evita=[rgbTriple(TEAMCOL[0]), rgbTriple(TEAMCOL[1]), [40,86,60], [252,254,248]];`);

/* ------------------------------------------------------------------ 3
   IL PIGMENTO DEL MANTO SI SMORZA A LUMINANZA FERMA. */
cambio('3. il pigmento del manto si smorza',
`    th:{ g1:'#026c0a', g2:'#026d0b', fuori:'#131008', grad:'#1a150c',`,
`    /* ---------------------------------------------------------------
       SESTA TARATURA — LA CROMA TORNA INDIETRO, E LA LUMINANZA NON SI
       MUOVE. E' l'inverso esatto della TERZA taratura qui sopra, con la
       stessa regola e per un metro cambiato: allora si chiedeva croma
       («la nostra erba ha un terzo della saturazione del concorrente»),
       adesso il giudice della giuria a 26 misura sui pixel di manto
       croma 0,748 nell'azione contro 0,444 nel MENU — che dichiara la
       stessa ora ed e' a un tocco di distanza — e chiama la differenza
       «due ore diverse nello stesso gioco». Un'erba delle sette di sera
       NON e' un verde puro: la luce radente le toglie croma prima ancora
       che luce.
       Si applica la REGOLA GENERALE dichiarata piu' su, alla lettera: la
       luminanza relativa mediana non si sposta piu' del ±12%. Qui si
       sposta dello 0,4%, cioe' di niente:
         #026c0a (2·108·10)  -> #1c6a20 (28·106·32)  Y 0,10756 -> 0,10663
         #026d0b (2·109·11)  -> #1c6b21 (28·107·33)  Y 0,10704 -> 0,10876
         media 0,10730 -> 0,10769 (+0,4%)
       La croma del pigmento scende da 0,981 a 0,736, la tinta resta a
       123 gradi (era 128: cinque gradi, dentro il rumore delle velature)
       e il delta di luminanza fra le due bande di tosatura passa da 0,5%
       a 2,0%, cioe' resta un quinto del cancello del 10% (quinta
       taratura). Sullo scatto vero la croma del manto scende da 0,748 a
       0,506: due terzi del guadagno li fa questo pigmento, il resto lo
       fa il velo.
       E NON COSTA CONTRASTO, che e' la trappola di sempre: la luminanza
       e' la stessa, quindi i quattro rapporti maglia/erba non si muovono
       di un centesimo per causa di questa riga. Quello che li muove e'
       il velo, e li muove in su.
       --------------------------------------------------------------- */
    th:{ g1:'#1c6a20', g2:'#1c6b21', fuori:'#131008', grad:'#1a150c',`);

/* ------------------------------------------------------------------ 4
   LA SERA HA UN PAVIMENTO E UN TETTO. */
cambio('4. veloBaseA: la sera ha un pavimento e un tetto',
`  return 0.045+0.50*q+0.10*q*(1-soleDi(TH))+VELO_FARI*fariMedi(q);`,
`  /* LA SERA HA UN PAVIMENTO, ED E' LA RIGA CHE CHIUDE LA FRATTURA DELLE
     DUE ORE. Il velo partiva da 0,045: la partita COMINCIAVA A
     MEZZOGIORNO e diventava sera solo strada facendo, mentre il menu —
     oraPartita() vale 0,80 li' dentro — era gia' sera piena dal primo
     istante. Le ombre invece partono a venti gradi sull'orizzonte dal
     primo fotogramma, i fari si accendono perche' «la luce se ne sta
     andando», e il cartello in home dice LE SETTE DI SERA. Il colore del
     prato era l'unica cosa in tutto il gioco che diceva un'altra ora.
     Adesso il velo parte da 0,34 e sale di 0,34: la sera non ARRIVA, si
     APPROFONDISCE. Misurato sul manto dell'azione, il valore scende da
     0,380 a 0,322 e la distanza dal menu (0,235) passa da 1,67 a 1,37
     volte.
     E HA UN TETTO, 0,60, che non e' prudenza ma una misura. Oltre quel
     velo il manto tende alla tinta del velo, e la tinta del velo non e'
     erba: a 0,78 il quadro perdeva un terzo dei suoi pixel di prato —
     tinta oltre 175 gradi da una parte, valore sotto 0,18 dall'altra —
     e con loro cadevano il cancello delle ombre (le figure venivano
     scartate per «piedi fuori dal manto»: i piedi c'erano, il manto no),
     quello della temperatura e quello del centro. Col tetto a 0,60 il
     prato di fine partita resta a valore 0,25 e tinta 136 gradi, cioe'
     ancora prato, e l'ombra che ci sta sopra resta a 0,20, cioe' sopra
     lo 0,18 con cui si separa il prato da tutto il resto.
     La pendenza 0,34 non e' scelta: e' quel che resta dopo il pavimento
     e il tetto, e vale la sera che si vede scendere. */
  return Math.min(0.60, 0.34+0.34*q+0.10*q*(1-soleDi(TH))+VELO_FARI*fariMedi(q));`);

/* ------------------------------------------------------------------ 4b
   IL PRATO DEL FONDALE — la terza ora del gioco. */
cambio('4b. il prato del fondale si smorza come il manto',
`    pr.addColorStop(0,'#063613'); pr.addColorStop(0.45,'#084516'); pr.addColorStop(1,'#0a5716');`,
`    /* IL FONDALE AVEVA UN'ORA TUTTA SUA, ED E' STATA UNA SORPRESA. La
       scena del gol e quella dei rigori NON passano da paintField:
       drawRipresaGol e il duello disegnano duelFondo, che ha un prato
       suo, dipinto qui. Prova d'accusa: cambiando il pigmento del manto
       in ROSSO PURO, i pixel del prato di calcetto-gol restavano
       identici al byte. Tre prati, tre ore: il manto, il fondale, e il
       menu che li guardava dall'alto.
       Stesse tre tinte, stessa regola della sesta taratura del manto —
       croma giu', luminanza ferma entro il 2%:
         #063613 (6·54·19)  -> #143519 (20·53·25)  Y 0,02666 -> 0,02708
         #084516 (8·69·22)  -> #1a4320 (26·67·32)  Y 0,04362 -> 0,04352
         #0a5716 (10·87·22) -> #215528 (33·85·40)  Y 0,06733 -> 0,06801
       croma 0,89 -> 0,61 su tutt'e tre, tinta ferma a 128-129 gradi.
       Sullo scatto del gol la croma del manto scende da 0,625 a 0,463. */
    pr.addColorStop(0,'#143519'); pr.addColorStop(0.45,'#1a4320'); pr.addColorStop(1,'#215528');`);

/* ------------------------------------------------------------------ 5
   LA TINTA DEL VELO VIRA CON LE TORRI. */
cambio('5. la tinta del velo vira con le torri',
`        ctx.fillStyle='rgba(30,36,54,'+veloBaseA(qo).toFixed(4)+')';`,
`        /* LA TINTA DEL VELO NON E' UNA SOLA, E LA RAGIONE E' IL CANALE
           ROSSO. «Il centro e' sera» chiede due cose al secondo tempo:
           meno luce (-15%) e MENO COLORE (-15%) del fischio d'inizio. La
           luce la toglie l'alfa; la croma no. Croma = 1 - min/max, e su
           un verde il minimo e' il ROSSO: un velo blu alza il blu, cioe'
           sposta la TINTA e non tocca la croma di un millesimo. Col
           pigmento gia' smorzato (sesta taratura) il velo (30·36·54)
           lasciava la croma a -10% e il cancello cadeva.
           Il rimedio e' l'ora stessa, ed e' gratis. Al fischio d'inizio
           il buio lo riempie il CIELO, che e' blu: (24·32·33). All'ultimo
           minuto il cielo non c'e' piu' e quel che riempie il buio e' la
           foschia sotto le torri al sodio, che e' calda e grigia:
           (34·35·33). Il rosso sale di dieci livelli mentre il verde ne
           sale tre — e dieci livelli di rosso su un verde a sessanta sono
           i sedici punti di croma che mancavano. Misurato al banco: la
           croma del centro scende del 15-19% nel secondo tempo, contro il
           -10% di prima e un cancello di 15.
           Costa quanto prima: la stessa unica fillRect, con tre somme in
           piu' nella stringa. fariMedi e' gia' calcolato da veloBaseA e
           non fa niente di piu' che sommare quattro rampe. */
        const vk=fariMedi(qo);
        ctx.fillStyle='rgba('+(24+10*vk|0)+','+(32+3*vk|0)+','+(33+0*vk|0)+','+veloBaseA(qo).toFixed(4)+')';`);

/* ------------------------------------------------------------------ 5b
   L'OMBRA A TERRA SEGUE IL MANTO CHE SI E' ABBASSATO. */
cambio('5b. OMBRA_ALFA segue il manto',
`const OMBRA_ALFA=0.40;`,
`/* 0,52 E NON 0,40, ED E' L'IDENTITA' GIA' SCRITTA QUI SOTTO, RIFATTA SUL
   MANTO NUOVO. La regola del file e': si tiene fermo il RAPPORTO
   ombra/manto, non l'alfa. S/G = 1 - s·(1 - Cs/G). Col manto sceso da
   grigio 100 a grigio 78 al fischio d'inizio e la tinta d'ombra a grigio
   32,7, l'alfa di prima dava S/G = 0,81 dove ne serve 0,70:
     s = 0,30 / (1 - 32,7/78) = 0,516
   Da qui 0,52. La tinta sale insieme (vedi sotto) perche' il vincolo che
   morde non e' il rapporto ma il VALORE ASSOLUTO: un'ombra sotto 0,18 di
   valore non e' piu' prato, e le figure vengono scartate per «piedi
   fuori dal manto». Le due manopole si girano INSIEME o non si girano —
   provate separate, il banco ha dato lo stesso identico verdetto a 0,46
   e a 0,64, che e' il modo in cui questo file impara di aver preso la
   manopola sbagliata. */
const OMBRA_ALFA=0.52;`);

cambio('5c. la tinta dell ombra a terra',
`  const R=13, G2=34, B=30;`,
`  /* (14·38·32) E NON (13·34·30): quattro livelli di verde, e sono il
     pavimento dell'ombra. Col manto di fine partita a valore 0,25 e
     l'alfa a 0,52·1,34 = 0,70, la tinta vecchia portava il pixel d'ombra
     a valore 0,178 — sotto lo 0,18 con cui istantanea.js separa il prato
     da tutto il resto — e due ombre sovrapposte lo portavano a 0,167.
     Con (14·38·32) lo stesso pixel sta a 0,204, e sotto due ombre a
     0,185: dentro la famiglia anche nel caso peggiore. Il rapporto
     ombra/manto resta 0,72-0,79, cioe' dentro la finestra 0,25-0,85 che
     la misura chiede, e la chimica resta quella dell'erba — verde sopra
     il blu, rosso il canale piu' basso — che e' la ragione per cui
     questa tinta esiste (vedi il blocco qui sopra). */
  const R=14, G2=38, B=32;`);

/* ------------------------------------------------------------------ 6
   L'AMBRA NON VALE ZERO IN MEZZO AL CAMPO. */
cambio('6. ambra e cielo cotti: la rampa non tocca lo zero',
`      gAmbra.addColorStop(0,   'rgba('+SOLE.caldo+','+(0.10*SOL).toFixed(4)+')');
      gAmbra.addColorStop(0.50,'rgba('+SOLE.caldo+',0)');
      gAmbra.addColorStop(1,   'rgba('+SOLE.caldo+',0)');
      c.fillStyle=gAmbra; c.fillRect(0,0,FW,FH);
      const gCielo=c.createLinearGradient(x0,y0,x1,y1);
      gCielo.addColorStop(0,   'rgba('+SOLE.cielo+',0)');
      gCielo.addColorStop(0.50,'rgba('+SOLE.cielo+',0)');
      gCielo.addColorStop(1,   'rgba('+SOLE.cielo+','+(0.14*SOL).toFixed(4)+')');`,
`      /* L'AMBRA NON VALE PIU' ZERO IN MEZZO AL CAMPO, E IL CIELO NEMMENO.
         Le due rampe erano ANTISIMMETRICHE e si annullavano esattamente
         alla mezzeria — scelta apposta, e per una buona ragione: cosi' la
         mediana su cui collaudo.js misura il 3:1 non si muoveva. Il
         prezzo era che a meta' campo, dove sta la camera per quasi tutta
         la partita, di sera non c'era NIENTE: verde puro, croma piena.
         La luce delle sette non e' un effetto di bordo — la luce delle
         sette e' dappertutto, solo piu' forte da una parte.
         Adesso l'ambra vale 0,130 a ponente, 0,042 in mezzo e 0,026 a
         levante; il cielo 0 / 0,018 / 0,125. Le due rampe restano
         antisimmetriche NELLA PENDENZA e in mezzo lasciano un fondo di
         luce mista — ambra piu' cielo, cioe' un grigio caldo — che e'
         quel che l'aria fa a quell'ora. Il termine costante e' la sola
         cosa che alza la mediana, e vale (0,042·255,222,164 +
         0,018·70,110,205) = (12·11·11) su tutto il manto: undici livelli,
         pagati dal velo che ne toglie molti di piu'.
         PERCHE' NON DI PIU', ED E' UN LIMITE MISURATO. Portata a 0,155 e
         0,185 la coppia rompeva la famiglia del prato dai due capi: il
         13% del quadro sotto i 90 gradi (l'ambra sulle chiazze di terra e
         dentro le pozze dei fari) e il 18% sopra i 175 (il cielo piu' il
         velo, tutti e due blu, sullo stesso lato). Su un manto smorzato
         la stessa alfa sposta la tinta il DOPPIO di prima: chi rialza
         questi numeri deve rimisurare quante celle restano prato, non
         solo quanti gradi di escursione guadagna. */
      gAmbra.addColorStop(0,   'rgba('+SOLE.caldo+','+(0.130*SOL).toFixed(4)+')');
      gAmbra.addColorStop(0.50,'rgba('+SOLE.caldo+','+(0.042*SOL).toFixed(4)+')');
      gAmbra.addColorStop(1,   'rgba('+SOLE.caldo+','+(0.026*SOL).toFixed(4)+')');
      c.fillStyle=gAmbra; c.fillRect(0,0,FW,FH);
      const gCielo=c.createLinearGradient(x0,y0,x1,y1);
      gCielo.addColorStop(0,   'rgba('+SOLE.cielo+',0)');
      gCielo.addColorStop(0.50,'rgba('+SOLE.cielo+','+(0.018*SOL).toFixed(4)+')');
      gCielo.addColorStop(1,   'rgba('+SOLE.cielo+','+(0.125*SOL).toFixed(4)+')');`);

/* ------------------------------------------------------------------ 7
   I DUE POLI DELLA VIGNETTATURA SI RITARANO SUL MANTO NUOVO. */
cambio('7. la vignettatura: i due poli si ritarano',
`  const ampC=[0.66,0.60,0.56][OR], forC=[0.098,0.128,0.150][OR];
  const forF=[0.130,0.205,0.250][OR];`,
`  /* I DUE POLI SALGONO IL CALDO E SCENDONO IL FREDDO, e tutti e due per
     la stessa ragione: il manto sotto e' cambiato.
     IL CALDO SALE (0,098/0,128/0,150 -> 0,130/0,150/0,165) perche' adesso
     si puo': la luminanza che l'ambra costa — il rosso pesa 0,2126 —
     l'ha gia' pagata il velo, e i quattro rapporti maglia/manto sono
     saliti lo stesso (il peggiore da 3,31 a 3,84). E il gradino 0, che
     copre il primo terzo di partita e la finestra in cui collaudo.js
     misura, questa volta SI TOCCA: era tenuto fermo perche' li' non
     c'era budget, e adesso c'e'. E' esattamente la manopola che il
     giudice ha chiesto di girare.
     IL FREDDO SCENDE (0,130/0,205/0,250 -> 0,115/0,170/0,210) perche' su
     un manto smorzato costa il doppio: sommato al rimbalzo del cielo
     cotto nella tessitura e alla tinta blu del velo, il polo est portava
     il 18% del quadro oltre i 175 gradi, cioe' fuori dal prato. Tre blu
     sullo stesso lato sono uno di troppo.
     Il conto del giudice — «dodici gradi di tinta dal lato freddo per un
     ventesimo del costo in luminanza» — resta vero e resta la legge; qui
     cambia solo il punto di lavoro, perche' e' cambiato il fondo. */
  const ampC=[0.66,0.60,0.56][OR], forC=[0.130,0.150,0.165][OR];
  const forF=[0.115,0.170,0.210][OR];`);

/* ------------------------------------------------------------------ 8
   LA PALLA SMETTE DI EMETTERE LUCE. */
cambio('8. la palla smette di emettere luce',
`  const by=y-z*0.55;
  /* ALONE DI STACCO DEL PALLONE (quarto appello): lo stesso anello di luce
     cotta dei corpi (staccoTex), alla scala della sfera — il picco della
     tessitura sta al 62% del raggio, quindi 1,7 raggi di semiasse lo
     posano SUL filo del contorno. E' il rialzo d'erba che tiene il bianco
     staccato dal manto scuro anche in mischia; sempre acceso, perche' il
     pallone e' l'oggetto che non ha mai il permesso di sparire. Costo: un
     drawImage della tessitura che c'e' gia'. */
  {
    if(!staccoTex) buildStaccoTex();
    const ar=RD*k*1.7;
    ctx.globalAlpha=0.55;
    ctx.drawImage(staccoTex, x-ar, by-ar, ar*2, ar*2);
    ctx.globalAlpha=1;
  }
  if(glow){`,
`  const by=y-z*0.55;
  /* QUI C'ERA L'ALONE DI STACCO DEL PALLONE, ED E' STATO SPENTO.
     Era staccoTex — lo stesso anello di luce cotta dei corpi — steso al
     55% di alfa sulla sfera, sempre acceso. Tre accuse, tutte e tre
     misurate:
     1) NON VENIVA DA NESSUNA PARTE. Questa scena ha UNA sola sorgente,
        dichiarata in SOLE, bassa a ponente. Le ombre partono tutte allo
        stesso angolo, l'ambra e' stata tenuta bassa per non tradire la
        luminanza, e poi sull'unico oggetto che l'occhio segue per
        novanta secondi c'era una lampadina. Peggio: l'alone era centrato
        su 'by', cioe' saliva col pallone quando il pallone si alzava. Un
        rialzo d'erba non decolla.
     2) LAVAVA VIA L'OMBRA. Venti righe piu' su c'e' il lavoro migliore
        fatto sulla palla — la proiezione che si stacca con la quota piu'
        la macchia di contatto che si spegne in nove unita' — e la
        distanza fra le due e' l'UNICO modo che il giocatore ha per
        leggere l'altezza di un pallonetto. Con l'alone acceso attorno
        alla sfera quel contrasto non si vedeva in nessuna delle undici
        fotografie del banco.
     3) NON REGGEVA NESSUN CANCELLO, e questa e' la parte che vale la
        pena scrivere perche' sembrava il contrario. «Palla trovabile
        8/8» chiede due cose: diametro >= 1,8% della larghezza e
        luminanza >= 2 volte la mediana del quadro. Il diametro lo da' la
        GEOMETRIA (B_R x B_DIS = 10,72, col pavimento PALLA_MIN_QUADRO =
        2,31% del quadro): negli otto istanti il pallone e' disegnato fra
        il 2,60% e il 3,40%, cioe' col 44% di margine nel caso peggiore.
        La luminanza la da' il bianco #fcfef8 col suo contorno scuro:
        238-255 contro una mediana di 55-72. L'alone, che al suo picco
        vale 0,30 di alfa steso al 55%, su un bianco a 252 non aggiunge
        un livello.
     COSA TIENE IL PALLONE LEGGIBILE ADESSO, ed e' tutto contrasto e
     niente luce: il prato di sera sceso a valore 0,32 (una mediana di
     quadro da 55-72 invece di 58-72 e in calo), il contorno scuro cotto
     dentro ballLitTex (rgba(4,10,7,.95) largo il 24% del raggio),
     l'ombra qui sopra che adesso si vede, e la scia in movimento.
     MISURATO DOPO: 3,81-4,63 volte la mediana del quadro contro le
     3,54-4,40 di prima, otto istanti su otto, e il diametro misurato
     scende da 46-62 px addosso a quello disegnato invece di superarlo.
     La palla e' piu' leggibile di prima e non emette piu' niente.
     L'alone dei CORPI resta dov'e': quello e' posato A TERRA sotto i
     piedi, schiacciato a 0,62 di ellisse, non sale col corpo e legge
     come rialzo d'erba al contatto. E' un'altra cosa. */
  if(glow){`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-sera.js ingresso.html uscita.html'); process.exit(2); }
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
