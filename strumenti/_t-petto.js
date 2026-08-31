/* =====================================================================
   _t-petto.js — IL PETTO DELLA SQUADRA DI CASA SMETTE DI PAGARE
   (28 agosto 2026).

   IL FATTO. Il cancello del contrasto maglia/erba e' rosso su P1 in
   vista normale: 2,98:1 nel mucchio, peggiore partita 2,43:1, tre
   partite su nove sotto il minimo di 3:1. Non e' un difetto nato oggi —
   lungo la catena delle cure di agosto il numero scende da 3,54 a 2,98
   senza che nessuna di quelle cure abbia toccato un colore: si sono
   spostati i giocatori, non le tinte. Il contrasto era gia' al limite, e
   la media lo nascondeva.

   ---------------------------------------------------------------------
   DOVE FINISCE LA LUCE DELLA MAGLIA, misurato e non dedotto.

   La divisa di serie e' CELESTE #8ad9ff: luminanza relativa NOMINALE
   0,622. Il cancello, che legge i pixel veri dentro il torso, misura una
   mediana di #779bc9, cioe' Y 0,321 — il 52% di quella dichiarata. Meta'
   della luce della maglia sparisce fra la tinta scritta nel file e il
   pixel che arriva all'occhio, e la domanda giusta e' DOVE.

   Non basta guardare il codice: qui sotto c'e' una catena di dipinture
   sovrapposte (base, motivo, terminatore, numero, corpi che si coprono
   fra loro) e l'unico modo di sapere chi copre chi e' DIPINGERE DI FUCSIA
   un pezzo alla volta e rimisurare. Sono cinque corse del cancello, e
   valgono piu' di qualunque lettura:

     pezzo dipinto #ff00ff        P1 vista normale     che cosa dice
     ------------------------------------------------------------------
     look._ombra (lato in ombra)  2,99 (era 2,98)      il quadrante che
                                                       il cancello legge
                                                       NON e' il lato in
                                                       ombra del busto
     look._lume  (lato in luce)   1,57  9/9 sotto      lo e' il lato in
                                                       LUCE: e' lui la
                                                       mediana
     KITS[0].c2 (seconda tinta)   3,18, mediana        la SECONDA TINTA
                                  #a894d0 (violacea)   entra nel quadrante
     look.maglia2 (solo motivo)   3,02, mediana        ci entra il palato
                                  #9096cc
     look.pantaloncini (solo      3,17, mediana        e ci entrano anche
     calzoni e risvolto)          #9999cb              i CALZONI

   Il terminatore era il sospettato numero uno — il commento in
   drawPlayer dichiara che il lato in ombra sta fuori dalla colonna della
   sonda — ed e' stato scagionato dalla prima riga: il cancello legge il
   lato in luce, come quel commento promette. L'imputato vero e' la
   SECONDA TINTA DEL KIT, e ci arriva da due porte diverse.

   ---------------------------------------------------------------------
   QUANTO VALE OGNI PEZZO, misurato spegnendolo (tinta = c1):

     motivo spento  (maglia2 = c1)        3,42:1   peggiore 2,52   2/9
     calzoni spenti (pantaloncini = c1)   3,70:1   peggiore 2,64   1/9
     tutta la c2 spenta (c2 = c1)         4,09:1   peggiore 2,81   1/9

   I due contributi si sommano quasi esattamente (0,44 + 0,72 = 1,16
   contro l'1,11 misurato spegnendoli insieme): sono due strade separate
   per lo stesso pigmento. Il palato ci arriva perche' le sue due righe
   cadono nel torso; i calzoni ci arrivano perche' in mezzo al MUCCHIO il
   corpo davanti copre il petto del corpo dietro, e il pezzo di corpo che
   sta all'altezza del petto altrui e' proprio il calzoncino.

   UNA STRADA PROVATA E BOCCIATA, con il suo numero, perche' era
   l'ipotesi piu' elegante e non regge: la BARRA DEI FIANCHI e' passata
   da 0,24 a 0,30 nell'onda delle figure, e a 0,30 la sua semilarghezza
   la porta a lambire la fila bassa della sonda. Rimessa a 0,24 il
   cancello misura 2,94:1 (era 2,98): nulla, anzi un pelo peggio, cioe'
   rumore. Non e' la geometria dei fianchi propri: e' la sovrapposizione
   fra corpi. Chi tornera' qui non rifaccia questa prova.

   ---------------------------------------------------------------------
   LA TERZA LEVA, ED E' LA PIU' GROSSA: L'ORLO NERO DEL NUMERO.

   Il numero di maglia si stampa SU OGNI FIGURA, e il suo verso dice la
   squadra: casa cifra chiara con orlo scuro, ospiti cifra scura con
   alone chiaro. Quel commento porta gia' la misura che condanna la
   propria meta' di casa (drawPlayer, «L'ALONE E' LARGO 1,45»):

     maglia vera                        P2  Y 0,4542
     cifra chiara, orlo scuro           P2  Y 0,3441    -24%
     cifra scura, alone chiaro 1,45     P2  Y 0,4492    - 1%

   L'orlo e' largo quanto l'alone, ma pesa ventiquattro volte tanto: su
   una maglia chiara un filo quasi nero toglie, un filo quasi bianco non
   toglie niente. Alla scala di gioco il torso e' dieci pixel per dodici
   e il numero ne occupa la meta' — quel commento lo dice: «il numero E'
   il petto». Quindi la squadra di casa paga un quarto della luce del
   proprio petto, e la squadra ospite non paga niente: una tassa che
   colpisce una sola delle due, per un disegno che vuole essere
   simmetrico.
   MISURATO SUL CANCELLO, mettendo la cifra scura anche a casa
   (nChiaro = false): P1 sale da 2,98 a 3,96:1. Un punto pieno, di
   orlo.

   PERCHE' NON SI FA COSI'. Con la cifra scura su tutte e due le squadre
   il verso del numero smette di dire la squadra, e quel canale non e'
   decorazione: e' l'unico che il tramonto non comprime (la mescola di
   lumiLook e' lineare, quindi conserva l'ordine dei valori — comunque si
   spenga la sera, il chiaro resta piu' chiaro dello scuro). Si toglie
   invece il NERO, che il file gia' proibisce altrove: «tintaOmbra — il
   viola-blu verso cui tira ogni ombra: MAI nero puro, perche' il nero
   spegne il verde e fa sembrare sporco il campo». L'orlo del numero era
   rimasto l'ultimo nero puro addosso a una figura.
   L'orlo diventa piu' TRASPARENTE: rgba(8,16,11,.88) -> .45. Non e' una
   tinta nuova, e' la maglia stessa che traspare — quindi ogni divisa
   tiene un orlo proporzionato alla propria, senza una tabella di
   eccezioni.

   E IL FONDO DELLA SCALA E' UNA MISURA, non un gusto. L'orlo deve
   restare a 3:1 dalla cifra che circonda, che e' la stessa soglia con
   cui questo gioco giudica qualunque testo. Sulla divisa PIU' CHIARA
   delle otto (BIANCO #f2f5ef, che in luce legge #f7f0d9) l'orlo a .45
   vale Y 0,254 contro Y 0,910 della cifra #f4f7f1, cioe' 3,16:1: appena
   sopra. A .30 scenderebbe a 2,61:1 sul celeste e la cifra comincerebbe
   a sfarinare. Quindi .45 non e' «un po' meno scuro»: e' il valore piu'
   chiaro che la legge del 3:1 lascia passare.

   ---------------------------------------------------------------------
   LE TRE CURE E I LORO NUMERI (cancello completo, 9 partite a semi
   dichiarati, misura deterministica: si ripete identica).

     1  CELESTE, seconda tinta   #2f86d8 -> #68b3ef
     2  alto contrasto, seconda tinta della squadra di casa
                                 #8a6a00 -> #c9a11a
     3  orlo della cifra chiara  alfa .88 -> .45

                                     P1 vista normale      P1 alto contr.
     gioco spedito                   2,98  2,43   3/9      3,14  2,61  3/9
     solo 3 (orlo)                   3,37  2,57   3/9      3,46  2,76  2/9
     solo 1 (c2 celeste)             3,58  2,68   1/9      3,14  2,61  3/9
     solo 2 (c2 alto contrasto)      2,98  2,43   3/9      3,59  2,95  1/9
     1 + 3                           3,75  2,78   1/9      3,46  2,76  2/9
     1 + 2 + 3  (QUESTA TOPPA)       3,75  2,78   1/9      3,87  3,03  0/9

   La squadra ospite non si muove di un centesimo: 4,16 e 4,86 prima,
   4,16 e 4,86 dopo. E nemmeno l'erba: #295626 e #23512a prima, gli
   stessi due dopo — la prova, sui pixel, che il manto non e' stato
   sfiorato.
   Collaudo completo (i due giochi): 36 controlli, 36 passati.

   DUE VIE DI MEZZO, misurate, perche' la scelta della tinta nuova non
   sia un gusto. Stessa cura, stesso orlo, tutte e tre entro due gradi e
   mezzo dalla tinta di partenza; cambia solo la luminanza:
     #4f9ce4  Y 0,310    3,48:1   peggiore 2,65   2/9 sotto
     #5aa9ec  Y 0,366    3,58:1   peggiore 2,71   1/9 sotto
     #68b3ef  Y 0,414    3,75:1   peggiore 2,78   1/9 sotto
   La prima non basta: il bersaglio chiede al massimo una partita sotto
   il minimo e questa ne lascia due. La seconda passa, e chi tiene alla
   divisa piu' carica puo' fermarsi li' — sapendo che il margine sopra
   3,40 dimezza, da 0,35 a 0,18. Si e' scelta la terza perche' questo
   numero l'ha gia' dimostrato: nell'onda di agosto e' sceso da 3,54 a
   2,98 senza che nessuno toccasse un colore, solo spostando i giocatori
   in campo. Mezzo punto di deriva e' successo davvero; un margine di
   0,18 non lo regge.

   ---------------------------------------------------------------------
   E LE ALTRE VENTICINQUE DIVISE, perche' il cancello ne guarda due su
   ventisei e un metro cosi' e' un sondaggio. strumenti/_sonda-divise.js
   le misura tutte nel caso PEGGIORE (tre ore x due bande di tosatura),
   prima e dopo questa toppa:

     sotto 3:1 nel caso peggiore     17 su 26   ->   15 su 26
     CELESTE (la divisa di serie)        3,02   ->    3,69
     ROSSONERO                           3,16   ->    3,33
     VIOLA                               2,86   ->    2,91
     ORO                                 2,84   ->    2,96
     ACQUA                               2,84   ->    2,85
     ARANCIO                             2,57   ->    2,69
     BIANCO                              3,99   ->    4,13
     FLUO                                4,15   ->    4,21
     ROSA (la CPU)                       2,64   ->    2,79

   Salgono TUTTE, anche quelle che questa toppa non nomina, e la ragione
   e' la terza cura: l'orlo piu' chiaro vale per qualunque kit addosso
   alla squadra di casa, e la sonda dipinge ogni divisa su tutte e due le
   squadre. Ma quindici restano sotto il minimo nel caso peggiore, e
   nessuna delle tre cure le raggiunge: la loro seconda tinta e' scura
   come lo era quella del celeste. E' il prossimo lavoro, non questo, e
   sta scritto qui perche' non si perda.

   ---------------------------------------------------------------------
   CHE COSA COSTA ALL'IDENTITA', dichiarato prima dei complimenti.

   La seconda tinta del CELESTE sale di luminanza A TINTA FERMA: #2f86d8
   sta a 209,1 gradi con Y 0,226, #68b3ef sta a 206,7 gradi con Y 0,414.
   Due gradi e mezzo di tinta: poco piu' della meta' dello spostamento
   che il file si e' gia' concesso altrove per la stessa ragione (le sei
   divise di _t-divise.js si sono mosse fino a 4,2 gradi), e la famiglia
   del colore non cambia. Ma il salto di luminanza dentro il kit si
   accorcia, e questo si vede: la maglia
   sta a 0,622 e i calzoni passano da un terzo a due terzi di quel
   valore. La divisa resta a due tinte e resta un celeste su celeste —
   diventa una divisa piu' chiara, e chi la guarda se ne accorge. E' il
   prezzo, ed e' lo stesso prezzo che il file ha gia' pagato due volte
   sulla stessa casella (#46c0ff -> #8ad9ff sulla maglia, #1e5f9e ->
   #2f86d8 sui calzoni) per la stessa ragione.
   L'alternativa era spostare il MOTIVO dal palato alle maniche, come si
   e' fatto per ROSSONERO: toglie il palato dal torso e lascia i calzoni,
   cioe' recupera 0,44 degli 1,11 punti misurati — meno della meta' — e
   in piu' butta via «la casa della squadra di casa e' il palato», che e'
   il segno con cui le due squadre si distinguono per FORMA e non solo
   per colore. Si e' scelto di tenere il palato e di schiarirne il
   pigmento.

   L'alto contrasto sale con la stessa regola e a tinta ferma: #8a6a00
   sta a 46,1 gradi con Y 0,157, #c9a11a a 46,3 gradi con Y 0,380. La
   coppia della modalita' resta giallo contro celeste, e la distanza di
   LUMINANZA dalla seconda tinta avversaria (#123a80, Y 0,047) cresce
   invece di calare: 3,3 volte prima, 8,1 volte adesso. Il motivo resta
   il secondo canale (palato in casa, fascia agli ospiti).

   ---------------------------------------------------------------------
   CHE COSA QUESTA TOPPA NON FA.

   · NON TOCCA L'ERBA. Nessun ancoraggio sfiora FIELDS, TH, la
     vignettatura o la legge della luce. Il manto e' stato tarato di
     recente e ogni suo grado costa misure: la cura sta tutta addosso
     alle figure. Prova: i due valori dell'erba stampati dal cancello
     restano #295626 e #23512a, identici al bit prima e dopo.
   · NON TOCCA I SORTEGGI. Sono tre stringhe di colore e un numero di
     alfa: nessun ramo, nessuna chiamata a dado(). Verificato a runtime
     e non solo a occhio, col contatore SEME.n (__test.sorteggi) letto a
     sei tappe di due secondi su tutte e tre le taglie, seme 20260828:
       taglia  5   44 65 175 65351 129031 382669
       taglia  7   81588 81637 81860 82083 159600 235475
       taglia 11   104987 105123 105157 105256 105333 105823
     Diciotto numeri, identici al bit prima e dopo.
   · NON TOCCA LA SQUADRA OSPITE. P2 misura 4,16 e 4,86 prima, gli
     stessi dopo: la sua seconda tinta non e' fra le tre righe e la sua
     cifra e' scura, quindi l'orlo chiaro non la riguarda.
   · NON RIPARA LE ALTRE SEI DIVISE DEL GIOCATORE. FLUO, ARANCIO, VIOLA,
     BIANCO, ORO, ACQUA e ROSSONERO hanno la stessa seconda tinta scura
     dentro il torso, e questa toppa le lascia dove stanno: il difetto
     e' generale, la cura qui e' quella della divisa DI SERIE, che e'
     l'unica che il cancello misura. L'orlo piu' chiaro (cura 3) le aiuta
     tutte, perche' vale per qualunque kit addosso alla squadra 0.

   ---------------------------------------------------------------------
   uso:  node strumenti/_t-petto.js --out fuori/petto.html
         node strumenti/_t-petto.js --elenco
   Misura: node strumenti/collaudo.js --gioco fuori/petto.html
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

/* 1 — la seconda tinta della divisa di serie */
{
  nome: '1/3 CELESTE: la seconda tinta sale a tinta ferma',
  cerca: `  { nome:'CELESTE',   c1:'#8ad9ff', c2:'#2f86d8', pat:1 },`,
  metti:
`  /* LA SECONDA TINTA SALE ANCORA, E STAVOLTA IL CONTO E' SU CHI COPRE
     CHI (28 agosto 2026). Il commento qui sopra aveva gia' visto meta'
     del problema — «il palato e' fatto di strisce di c2 che cadono
     DENTRO il torso, quindi dentro la finestra che il cancello misura e
     dentro l'area che l'occhio legge» — e aveva alzato la tinta una
     volta, da #1e5f9e a #2f86d8. Non bastava, e le manca l'altra meta'.
     Misurato dipingendo di fucsia un pezzo alla volta e rimisurando il
     cancello (nove partite a semi dichiarati):
       motivo spento  (maglia2 = c1)      2,98 -> 3,42:1
       calzoni spenti (pantalonc. = c1)   2,98 -> 3,70:1
       tutta la c2 spenta (c2 = c1)       2,98 -> 4,09:1
     I calzoni pesano PIU' del palato, e non perche' stiano nel torso:
     ci arrivano dal MUCCHIO. Nella folla il corpo davanti copre il petto
     del corpo dietro, e quello che gli cade all'altezza del petto e'
     proprio il calzoncino. Finche' la seconda tinta e' un terzo della
     prima, ogni compagno che passa davanti spegne la maglia di chi sta
     dietro.
     #2f86d8 sta a 209,1 gradi con Y 0,226; #68b3ef a 206,7 gradi con
     Y 0,414. Due gradi e mezzo di tinta, il 183% di luminanza. La divisa
     diventa piu' chiara e si vede: e' il prezzo, ed e' scritto per
     esteso in testa a strumenti/_t-petto.js.
     DUE VIE DI MEZZO PROVATE, alla stessa tinta e con lo stesso orlo:
     #4f9ce4 (Y 0,310) da' 3,48:1 con DUE partite su nove ancora sotto
     il minimo, #5aa9ec (Y 0,366) da' 3,58:1 con una sola. Passa anche
     la seconda, e chi rivuole la divisa piu' carica sa dove fermarsi;
     il margine sopra il bersaglio pero' dimezza (0,18 invece di 0,35),
     e mezzo punto di deriva su questo numero e' gia' successo una volta
     senza che nessuno toccasse un colore. */
  { nome:'CELESTE',   c1:'#8ad9ff', c2:'#68b3ef', pat:1 },`,
},

/* 2 — la seconda tinta della squadra di casa in alto contrasto */
{
  nome: '2/3 alto contrasto: la seconda tinta di casa esce dal buio',
  cerca: `    TEAMCOL[0]='#ffe14d'; TEAMCOL2[0]='#8a6a00'; TEAMPAT[0]=1;`,
  metti:
`    /* LA SECONDA TINTA DI CASA SALE ANCHE QUI, per la stessa ragione
       misurata sulla divisa di serie: a Y 0,157 contro gli 0,756 della
       maglia, #8a6a00 era un buco nel petto — sul palato e, attraverso i
       calzoni, addosso a chiunque passi davanti. Il cancello lo vede:
       P1 in alto contrasto stava a 3,14:1 con peggiore partita 2,61 e
       TRE partite su nove sotto il minimo, cioe' dentro il verde ma per
       un soffio, e proprio nella modalita' che esiste per chi il colore
       non lo separa. Con #c9a11a sale a 3,59:1, peggiore 2,95, una sola
       partita sotto.
       #8a6a00 sta a 46,1 gradi, #c9a11a a 46,3: la tinta non si muove,
       si muove la luminanza (0,157 -> 0,380). La coppia della modalita'
       resta giallo contro celeste; la distanza di luminanza dalla
       seconda tinta avversaria (#123a80, Y 0,047) passa da 3,3 volte a
       8,1, quindi la separazione cresce invece di calare. Il motivo
       resta il secondo canale: palato in casa, fascia agli ospiti. */
    TEAMCOL[0]='#ffe14d'; TEAMCOL2[0]='#c9a11a'; TEAMPAT[0]=1;`,
},

/* 3 — l'orlo della cifra chiara smette di essere nero puro */
{
  nome: '3/3 l\'orlo della cifra chiara non e\' piu\' nero puro',
  cerca: `        ctx.strokeStyle = nChiaro ? 'rgba(8,16,11,.88)' : 'rgba(246,249,243,.94)';`,
  metti:
`        /* L'ORLO NON E' PIU' NERO PURO, ED ERA L'ULTIMO ADDOSSO A UNA
           FIGURA. La tabella qui sopra lo dichiara gia': la cifra chiara
           col suo orlo costa alla maglia il 24% della luminanza, l'alone
           chiaro della cifra scura l'1%. Stessa larghezza, ventiquattro
           volte il prezzo — perche' su una maglia chiara un filo quasi
           nero toglie e un filo quasi bianco no. E siccome «il numero e'
           il petto», quel 24% e' un quarto della luce con cui la squadra
           di casa si stacca dal prato: misurato sul cancello, mettendo
           la cifra scura anche a casa P1 sale da 2,98 a 3,96:1.
           Non si fa cosi', perche' il verso del numero e' il canale che
           dice la squadra e che il tramonto non puo' comprimere. Si
           toglie il NERO, che questo file gia' proibisce altrove (vedi
           SOLE.tintaOmbra: «MAI nero puro»). Con l'alfa a .45 l'orlo non
           e' una tinta nuova: e' la maglia stessa che traspare, quindi
           ogni divisa tiene un orlo proporzionato alla propria senza
           tabelle di eccezioni. Misurato da solo: 2,98 -> 3,37:1.
           .45 E' IL FONDO DELLA SCALA, e il fondo e' una misura. L'orlo
           deve restare a 3:1 dalla cifra che circonda — la stessa soglia
           con cui il gioco giudica qualunque testo. Sulla divisa PIU'
           CHIARA delle otto (BIANCO #f2f5ef, che in luce legge #f7f0d9)
           l'orlo a .45 vale Y 0,254 contro Y 0,910 della cifra: 3,16:1,
           appena sopra. A .30 scende a 2,61:1 sul celeste. */
        ctx.strokeStyle = nChiaro ? 'rgba(8,16,11,.45)' : 'rgba(246,249,243,.94)';`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-petto.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

/* --dentro non esiste in questa toppa: si prova su copia e basta. */
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.petto.html';
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

/* I CONTROLLI DOPO LA SOSTITUZIONE. Le tre tinte nuove ci devono essere
   una volta sola, le tre vecchie zero volte, e — la parte che conta — le
   cose che questa toppa PROMETTE DI NON TOCCARE devono essere intatte:
   il manto, la maglia di casa, la divisa dell'avversaria, l'alone chiaro
   della cifra scura. Una promessa verificata dopo vale una promessa; una
   scritta in testa al file e basta, no. */
const attesi = [
  [`c2:'#68b3ef'`, 1],
  [`c2:'#2f86d8'`, 0],
  [`TEAMCOL2[0]='#c9a11a'`, 1],
  [`TEAMCOL2[0]='#8a6a00'`, 0],
  [`'rgba(8,16,11,.45)'`, 1],
  /* IL NERO RESTA DOVE SERVE, e questo controllo lo inchioda. Il numero
     si stampa in tre posti: la figura di partita (qui sopra) e i due
     primi piani — il gol e la ripresa — dove la figura e' alta cento
     pixel invece di dieci. Li' il numero e' una frazione piccola di un
     torso grande, la tassa del 24% non c'e' (era misurata proprio
     perche' «il numero E' il petto», e a cento pixel non lo e'), e un
     orlo fermo compra leggibilita' dove c'e' spazio per leggerla. Le
     tre righe di quei due primi piani devono restare a .88: se un
     giorno qualcuno le cambia, questo numero cade e la toppa si
     rifiuta di scrivere. */
  [`'rgba(8,16,11,.88)'`, 4],
  [`ctx.strokeStyle = nChiaro ? 'rgba(8,16,11,.88)'`, 0],
  /* intatti: la maglia di casa, l'alto contrasto di casa e la sua
     avversaria, l'alone della cifra scura, il verso del numero */
  [`c1:'#8ad9ff'`, 1],
  [`TEAMCOL[0]='#ffe14d'`, 1],
  [`TEAMCOL[1]=BLU_KIT;   TEAMCOL2[1]='#123a80'; TEAMPAT[1]=2;`, 1],
  [`'rgba(246,249,243,.94)'`, 3],
  [`const nChiaro = (p.team===0);`, 1],
  /* intatto: il manto. Le due bande di tosatura dell'oratorio, che sono
     l'erba su cui il cancello misura. */
  [`g1:'#0e6e10', g2:'#0e6f11'`, 1],
  /* intatta: la rosa della CPU, che il cancello misura come P2 */
  [`const ROSA_KIT='#ff80e6';`, 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
