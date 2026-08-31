/* =====================================================================
   _t-spazio.js — IL DESTINATARIO DEL PASSAGGIO VA A PRENDERSELO
                  (27 agosto 2026).

   UNA CURA SOLA — sei righe in aiDecide, una funzione nuova di
   quattordici e, per il gruppo R, una riga in startMatch — e TRE
   BOCCIATE, con i loro numeri, in fondo a questo
   commento. Fra le tre bocciate c'e' la mappa d'influenza, che era la
   cosa che questa passata doveva costruire: e' costruita, costa il nulla
   che si sperava (misurato), e NON RENDE. Una toppa che spedisse tutte e
   quattro le cure sarebbe una toppa che ha misurato solo quello che
   sperava.
   Si spedisce anche una quinta cosa che non e' una cura di gioco: il
   gruppo R, un difetto di determinismo vecchio che la cura fa uscire
   allo scoperto e che va chiuso insieme a lei.

   ---------------------------------------------------------------------
   IL PUNTO DI PARTENZA, misurato prima di scrivere una riga di codice.
   ---------------------------------------------------------------------
   Il metro di casa dice che a 11 contro 11 la palla non e' di nessuno il
   78,4% del tempo (mediana, 100 partite, semi 20260803..20260902,
   node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803).
   Non diceva PERCHE'. Una sonda nuova — strumenti/_diag-spazio.js, 12
   partite, stessi semi — scompone quel 78% e trova la cosa che nessuno
   stava guardando:

     palla di nessuno            78,55%
       IN VOLO verso un uomo     31,64%   <-- un terzo della partita
       vagante davvero           46,91%
     passaggi a partita          43,25
       ARRIVATI al destinatario   23,93%
       intercettati               33,78%
       finiti su un corpo         35,18%
       spenti per strada           3,68%
     volo medio                  84,8 fotogrammi = 1,41 s
     distanza media dell'appoggio 711 unita' (il campo e' largo 2300)

   Un terzo della partita il pallone sta VIAGGIANDO verso un uomo
   preciso, e tre volte su quattro non ci arriva.

   IL DESTINATARIO NON SAPEVA DI ESSERLO. b.passTo esiste dal primo
   giorno: lo scrivono cinque punti del file e updateBall lo legge in due
   (il ricevitore designato non mura il proprio passaggio, e lo controlla
   anche quando arriva sopra le 420 unita' al secondo). Nessun ramo di
   aiDecide lo leggeva. Appena il piede lascia il pallone b.owner vale -1,
   weHaveBall diventa falso per TUTTI E DUE i colori, e l'uomo a cui il
   pallone e' indirizzato scende nel ramo di copertura insieme agli
   altri: gira le spalle al pallone che gli hanno appena passato.

   E' LO STESSO DIFETTO CHE IL GIOCO AVEVA GIA' RICONOSCIUTO E CURATO PER
   IL CROSS — «chi doveva riceverlo girava le spalle nell'istante esatto
   in cui il pallone partiva verso di lui», dice il commento del ramo
   b.crossTo in aiDecide — e la cura non era mai stata estesa al
   passaggio a terra — e a 11 contro 11 il pallone a terra e' tutto: la
   sonda misura 0,00% di tempo con la palla in aria e 0,00% di cross a
   quella taglia.

   MISURATO: mentre il pallone gli vola addosso, il coseno fra il
   bersaglio dell'IA del destinatario e la direzione del pallone vale
   +0,296. Chi va incontro sta a +1.

   ---------------------------------------------------------------------
   LA CURA, e perche' e' un PUNTO D'INCONTRO e non la posizione del
   pallone.
   ---------------------------------------------------------------------
   Correre dove il pallone si trova adesso vuol dire arrivarci quando non
   c'e' piu'. puntoIncontro cerca il primo istante in cui l'uomo puo'
   essere dove sara' il pallone, con la strada VERA — l'attrito dell'erba
   di updateBall e' esponenziale nel tempo, quindi in t secondi il
   pallone percorre v*(1-e^(-K t))/K con K = TIRO_ATTR, la stessa formula
   e la stessa costante che puntoCaduta usa per il volo. E' il gemello a
   terra di puntoCaduta e puntoTesta, ed e' cio' che il concorrente
   chiama lxGetInterceptPos.

   ---------------------------------------------------------------------
   IL DOPO. 100 partite CPU contro CPU, Normale, semi 20260803..20260902,
   tempo regolamentare, confronto APPAIATO partita per partita
   (strumenti/_appaiato.js: media della differenza, IC 95% bootstrap su
   4.000 giri, p per permutazione dei segni su 10.000 giri).
   ---------------------------------------------------------------------
     5 contro 5                prima    dopo    delta        IC 95%        p
       gol nei 90 s             3,02    3,56    +0,54   [+0,07; +1,01]  0,029 *
       gol al minuto            1,89    2,22    +0,33   [+0,03; +0,63]  0,038 *
       tiri                    12,46   14,97    +2,51   [+1,24; +3,74]  0,0001*
       tiri al minuto           7,57    9,20    +1,64   [+1,10; +2,18] <0,0001*
       momenti da porta/min     4,32    4,84    +0,52   [-0,05; +1,07]  0,073
       palla di nessuno %      63,95   57,90    -6,05   [-7,03; -5,05] <0,0001*
       palloni vaganti contesi 52,57   60,74    +8,17   [+5,83; +10,4] <0,0001*
       partite 0-0                7%      1%      (mediana dei gol 3 -> 4)
     7 contro 7
       momenti da porta         5,98    7,14    +1,16   [+0,34; +1,98]  0,0066*
       momenti da porta/min     2,63    3,15    +0,52   [+0,14; +0,88]  0,0084*
       tiri                    15,36   18,79    +3,43   [+2,00; +4,79] <0,0001*
       gol nei 90 s             2,23    2,62    +0,39   [-0,01; +0,79]  0,071
       palla di nessuno %      75,98   73,76    -2,22   [-2,90; -1,54] <0,0001*
       cambi di possesso       41,37   38,31    -3,06   [-4,74; -1,33]  0,0005*
       partite 0-0                8%      6%
     11 contro 11
       tiri                    15,14   24,38    +9,24   [+7,31; +11,2] <0,0001*
       tiri al minuto           4,52    7,20    +2,68   [+2,24; +3,10] <0,0001*
       palla di nessuno %      78,46   74,34    -4,12   [-4,85; -3,39] <0,0001*
       cambi di possesso       49,98   45,61    -4,37   [-6,25; -2,44] <0,0001*
       palloni vaganti contesi 67,83   78,02   +10,19   [+7,87; +12,6] <0,0001*
       momenti da porta/min     0,91    1,04    +0,13   [-0,05; +0,30]  0,163
       gol nei 90 s             1,24    1,37    +0,13   [-0,17; +0,44]  0,454
       partite 0-0               22%     26%            [-0,08; +0,16]  0,628

   COSA E' MISURATO E COSA NO, e va detto in questi termini perche' e' la
   differenza fra un risultato e una speranza:
     · MISURATI, a TUTTE E TRE le taglie: piu' tiri, meno tempo con la
       palla di nessuno, piu' palloni vaganti CONTESI (che sono un evento
       — due uomini che se la giocano — non caos: e' la definizione di
       _eventi.js, "un uomo per parte entro 90 unita'").
     · MISURATO a 5 contro 5: PIU' GOL, mezza rete a partita, e le
       partite a reti bianche scendono dal 7% all'1%.
     · MISURATO a 7 contro 7: piu' MOMENTI DA PORTA, che e' il numero che
       questa casa considera il vero — mezzo momento al minuto in piu',
       da 2,63 a 3,15.
     · NON MISURATO a 11 contro 11: i gol e i momenti da porta si muovono
       nel verso giusto ma non si distinguono dal caso, e le partite a
       reti bianche passano dal 22% al 26% (anche questo indistinguibile
       dal caso, p 0,63; il cancello --tre-taglie sui suoi 30 semi legge
       27% prima e 30% dopo, con la soglia a 33%). A quella taglia il
       collo di bottiglia non e' arrivare davanti alla porta — i tiri
       aumentano del 61% — e' la PRECISIONE: 9%, contro il 27% del 5
       contro 5. Non e' questa cura che lo chiude, e questa cura non
       promette di chiuderlo.

   E LA SONDA DELLO SPAZIO, sulle stesse 12 partite a 11 contro 11:
                                prima    dopo
     palla di nessuno %         78,55   73,60
       di cui in volo           31,64   18,35
     passaggi a partita         43,25   50,25
       ARRIVATI                 23,93%  48,66%
       intercettati             33,78%   7,52%
     volo medio (fotogrammi)     84,8    44,1
     coseno del bersaglio       +0,296  +0,644

   ---------------------------------------------------------------------
   E UN DIFETTO CHE LA CURA HA FATTO USCIRE ALLO SCOPERTO (gruppo R).
   ---------------------------------------------------------------------
   La prova A di strumenti/_q-determinismo.js gioca due volte lo stesso
   seme sulla stessa pagina e chiede che le due partite siano identiche.
   Col gioco spedito diverge una partita su dodici; con la sola cura A,
   quattro su dodici. La cura non introduce nessuno stato — legge il
   pallone e scrive due numeri su un oggetto che setupPlayers ricrea a
   ogni partita — ma cambiando le traiettorie cambia quando arrivano le
   reti, e un difetto che c'era gia' passa da raro a frequente.

   LA CACCIA, ripetibile, con due strumenti nuovi:
     strumenti/_zz-caccia-stato.js  elenca i campi che sopravvivono fra
                                    due partite sulla stessa pagina
     strumenti/_zz-det-bisez.js     li azzera uno alla volta e riprova
   Il colpevole e' UN SOLO NUMERO IN VIRGOLA MOBILE: G.recT, la fase del
   cronometro che decide quando prendere il prossimo fotogramma per
   l'anello della moviola. Non lo legge nessuno tranne
   registraFotogramma, e startMatch non lo azzerava.
     prova A, 12 semi da 20260803, 5 contro 5:
       gioco spedito                     1/12 diverge
       col solo cambio A                 4/12
       azzerando G.rec (il contenuto)    4/12  — l'anello non c'entra
       azzerando G.recT (la fase)        0/12  — e' lui
       col cambio A piu' il gruppo R    0/12  (misurato sul file spedito)
   Un fotogramma d'anello in piu' o in meno cambia di un fotogramma la
   durata della moviola dopo un gol, e mentre la moviola gira la fisica
   non avanza: da li' in poi le due partite non sono piu' allineate.
   Il gruppo R e' SPEDITO con la cura, e chiude anche il caso del gioco
   spedito (seme 20260812, che era rosso da prima e adesso non lo e'
   piu').

   ---------------------------------------------------------------------
   LE CURE BOCCIATE, coi numeri, perche' nessuno le riprovi al buio.
   Tutte e tre restano APPLICABILI da questo stesso strumento — con
   --solo — perche' una bocciatura che non si puo' rimisurare e' una
   opinione. Nessuna e' nel file spedito.
   ---------------------------------------------------------------------

   BOCCIATA B — LA CPU CHE GUARDA LA CORSIA COME LA GUARDA UNA PERSONA.
     node strumenti/_t-spazio.js --out fuori/x.html --solo 0AB
     Nel file ci sono due punteggi di smarcamento e uno dei due e' cieco:
     smarcato(p,q,t) — quello del dito — satura a 220 per avversario e
     toglie 260 per ogni avversario entro 40 unita' dalla linea di
     passaggio; eseguiAiPass — quello della macchina — satura a 200 e la
     linea non la guarda affatto. Farla leggere a tutti e due sembrava
     ovvio, e sul possesso funziona benissimo. Sul gioco no.
     Contro la sola cura A, 100 partite appaiate:
       11 contro 11  momenti da porta      -0,65  [-1,16; -0,14]  p 0,018
                     momenti da porta/min  -0,19  [-0,35; -0,02]  p 0,030
                     tiri                  -4,94  [-6,84; -3,11]  p<0,0001
                     parate                -0,35  [-0,67; -0,03]  p 0,041
                     palla di nessuno %    -4,19  [-4,90; -3,47]  p<0,0001
                     cambi di possesso     -7,64  [-9,52; -5,72]  p<0,0001
                     rimpalli sul corpo    -6,41  [-8,12; -4,74]  p<0,0001
       5 contro 5    tiri                  -1,39  [-2,44; -0,23]  p 0,017
                     tiri al minuto        -1,00  [-1,46; -0,52]  p 0,0001
                     gol                   -0,37  [-0,83; +0,09]  p 0,127
     E' un BARATTO, e va letto per intero: la squadra tiene la palla molto
     meglio (i cambi di possesso crollano di un sesto, i palloni che
     finiscono su un corpo di un quinto, la distanza media dell'appoggio
     scende da 634 a 463 unita' e gli appoggi che arrivano salgono dal 49%
     al 63%) e in cambio non arriva piu' davanti alla porta. E' il profilo
     esatto delle sei cure che il cronometro ha gia' visto morire — «i
     tiri calano e i gol seguono» — e questa volta e' anche misurato sul
     numero che conta: i momenti da porta.
     CHI LA RIPRENDE cominci da qui: il contrappeso all'avanzamento in
     eseguiAiPass vale 0,8 per unita' di campo e una corsia occupata costa
     260, cioe' 325 unita' di avanzamento. Con una penalita' piu' leggera
     il baratto potrebbe girare — ma tararla contro i momenti da porta e'
     tarare una costante contro il proprio metro, e non si fa senza una
     seconda serie di semi.

   BOCCIATA C — LA MAPPA D'INFLUENZA CHE SCEGLIE DOVE SMARCARSI.
     node strumenti/_t-spazio.js --out fuori/x.html --solo 0AMC
     E' la cura che il critico del pacchetto aveva indicato come la piu'
     preziosa: 16x8 = 128 caselle, due tabelle (una per squadra), un
     nucleo a portata finita, ricostruite quattro volte al secondo sullo
     stesso orologio del cervello di squadra. Il ramo dello smarcato,
     invece di prendere l'altezza che il modulo gli detta (side*150), la
     sceglie fra tre — quella chiesta e le due caselle sopra e sotto —
     leggendo dove gli avversari presidiano meno.
     NON COSTA NIENTE, e questo e' misurato e resta vero
     (strumenti/_costo-influenza.js, e i numeri stanno nel commento del
     gruppo M): la ricostruzione costa fra 3 e 6 microsecondi, la lettura
     30 nanosecondi, e un fotogramma intero di fisica ne costa fra 88 e
     164. Ammortizzata sui sessanta fotogrammi al secondo, la mappa e' lo
     0,002% del sedicesimo di secondo.
     E NON RENDE NIENTE. Contro la sola cura A, 100 partite appaiate:
       5 contro 5    momenti da porta      -1,01  [-1,91; -0,18]  p 0,025
                     momenti da porta/min  -0,52  [-1,03; -0,01]  p 0,050
                     gol                   -0,34  [-0,74; +0,07]  p 0,115
       11 contro 11  momenti da porta/min  -0,04  [-0,22; +0,14]  p 0,669
                     tiri                  -0,19  [-2,35; +1,82]  p 0,858
                     palla di nessuno %    +0,54  [-0,06; +1,17]  p 0,096
     A 11 non fa niente, a 5 fa danno e il danno e' misurato. La mappa non
     e' sbagliata: e' il CONSUMATORE che non paga. Del traffico intorno a
     un uomo si occupa gia' la separazione (SEP_R) e ci si occupa
     scansaAvversari, e spostare un uomo di una casella intera prima che
     quei due meccanismi facciano il loro lavoro gli toglie il posto
     invece di dargliene uno migliore.
     LA PRIMA STESURA DI C ERA ANCHE SBAGLIATA, e vale la pena scriverlo:
     teneva UNA tabella firmata (nostri meno loro) e cercava il massimo.
     Un saldo firmato e' alto anche dove ci sono tanti COMPAGNI, quindi la
     formula mandava l'uomo che si offre ad accucciarsi accanto ai suoi.
     Misurata cosi', a 11 contro 11, dava momenti da porta/min mediana
     0,66 contro 0,80 della versione con le due tabelle. La versione
     spedita del gruppo M ha le due tabelle; quella firmata non esiste
     piu' nemmeno come opzione.
     CHI LA RIPRENDE ha la mappa gia' fatta e gia' pagata: serve un
     consumatore diverso. Due che qui non sono stati provati: la ZONA di
     pressing (quale casella della nostra meta' campo tengono di piu' loro)
     e il bersaglio del portatore (verso quale casella libera portare
     palla). Il gruppo M da solo — --solo 0AM — e' identico al bit al
     gioco senza mappa, verificato: nessun consumatore, nessun sorteggio.

   BOCCIATA D — LA PERCEZIONE.
     node strumenti/_t-spazio.js --out fuori/x.html --solo 0AD
     Ogni uomo di questo gioco legge b.x e b.y senza mediazione: un
     difensore che corre verso la propria porta, con la palla alle spalle,
     sa dov'e' il pallone al centimetro e al fotogramma. La cura da' a
     ogni uomo una MEMORIA del pallone — l'ultima posizione vista e la
     velocita' di allora, estrapolate con la stessa legge d'attrito — e
     un campo visivo (il pallone e' visto se sta davanti, o se e' a meno
     di tre raggi di calciabilita', o se sono passati piu' di mezzo
     secondo dall'ultima occhiata). Il ramo che la usa e' la COPERTURA,
     cioe' l'uomo che nella realta' si posiziona su un'informazione
     vecchia; il pressatore no, lui il pallone ce l'ha davanti.
     Contro la sola cura A, 100 partite appaiate:
       11 contro 11  precisione VERA %     -1,92  [-3,72; -0,17]  p 0,039
                     momenti da porta/min  -0,11  [-0,30; +0,08]  p 0,241
                     palla di nessuno %    -0,18  [-0,78; +0,42]  p 0,554
       5 contro 5    momenti da porta/min  -0,36  [-0,90; +0,22]  p 0,216
                     gol                   -0,27  [-0,71; +0,16]  p 0,239
     Nessun guadagno misurato da nessuna parte, un danno misurato (la
     precisione dei tiri a undici) e un costo per fotogramma per ogni uomo
     invece che quattro volte al secondo. Una fallibilita' che non si
     vede e che toglie mezzo punto di precisione non e' credibilita': e'
     rumore con un nome bello.
     CHI LA RIPRENDE: il posto giusto non e' la copertura, e' il PRIMO
     TOCCO — che pero' e' gia' fallibile e in modo gia' misurato (il
     fattore «scomodo» di updateBall guarda proprio se il pallone arriva
     alle spalle). Cioe': la percezione, in questo gioco, in parte c'e'
     gia', ed e' li' che vale.

   ---------------------------------------------------------------------
   REGOLE DI CASA, verificate da questo stesso strumento a ogni
   esecuzione.
   ---------------------------------------------------------------------
   IL CONTO DEI SORTEGGI NON CAMBIA — 166 prima, 166 dopo, in nessun
   gruppo e in nessuna combinazione. Lo stampa la riga finale, e lo
   controlla il guardiano: se cambiasse, la toppa si rifiuta di scrivere.
   Nessuna riga di nessun gruppo pesca un numero, e il rnd(-30,30) dello
   smarcamento resta dov'era, a destra dello stesso corto circuito.
   (Il conto si fa DOPO aver tolto i commenti: la prima stesura contava
   anche la parola «Math.random» scritta dentro una spiegazione, e si
   rifiutava di scrivere per un commento. Un guardiano che scatta sulla
   parola invece che sul codice insegna a non scrivere commenti.)

   I GRUPPI
     0  puntoIncontro — il gemello a terra di puntoCaduta.  SPEDITO
     A  il destinatario del passaggio va incontro al pallone. SPEDITO
     R  il nastro della moviola non attraversa le partite     SPEDITO
     M  la mappa d'influenza (impianto: senza consumatori e' inerte)
     B  la CPU passa col punteggio del dito                  BOCCIATA
     C  la mappa sceglie l'altezza dello smarcamento         BOCCIATA
     D  la percezione                                        BOCCIATA
   Senza --solo si applicano 0, A e R, cioe' la cura. Con --solo si
   applica esattamente quello che si chiede: --solo 0AMC rimette in piedi
   la bocciata C, --solo 0AB la B, --solo 0AD la D.

   GLI STRUMENTI NUOVI DI QUESTA PASSATA
     strumenti/_diag-spazio.js      scompone il pallone di nessuno e
                                    misura se il destinatario ci va
     strumenti/_appaiato.js         il confronto appaiato con IC e p
     strumenti/_costo-influenza.js  quanto costa la mappa, cronometrata
                                    dentro la pagina
     strumenti/_zz-caccia-stato.js  elenca lo stato che sopravvive fra
                                    due partite sulla stessa pagina
     strumenti/_zz-det-bisez.js     lo azzera un gruppo alla volta per
                                    trovare quale rompe il determinismo
     strumenti/_zz-det-tutorial.js  un'ipotesi provata e SMENTITA sulla
                                    stessa faccenda (non era il tutorial)

   I CANCELLI DI CASA SUL FILE SPEDITO (fuori/spazio.html)
     node strumenti/collaudo.js --gioco fuori/spazio.html
       36 controlli, 36 passati
     node strumenti/_q-meta.js --tre-taglie --gioco fuori/spazio.html
       82 controlli, 82 passati — 0-0 3% a cinque, 10% a sette, 30% a
       undici (soglie 40, 70, 33). Sul gioco spedito gli stessi trenta
       semi danno 0%, 3% e 27%: a undici e' una partita in piu' su
       trenta, dentro il sigma di 9 punti che quel cancello dichiara.
     node strumenti/_q-determinismo.js --partite 12 --gioco fuori/spazio.html
       24 controlli, 24 passati. Il gioco spedito, sugli stessi dodici
       semi, ne passa 23 su 24: la cura chiude anche quello.

   IL FATTO CHE EMETTEREI, quando il registro dei fatti sara' pronto (e
   qui NON si costruisce nessun registro): al momento in cui parte un
   passaggio indirizzato,
     {quando: G.tempo, che cosa: 'passaggio', chi: passatore,
      dove: [b.x,b.y], esito: destinatario}
   e alla sua chiusura
     {quando, che cosa: 'ricezione', chi: destinatario,
      dove: puntoIncontro, esito: 'arrivato' | 'intercettato' |
      'murato' | 'spento'}
   — sono le quattro categorie che _diag-spazio.js gia' conta a mano
   avvolgendo step(); con il registro non servirebbe piu' avvolgere
   niente.

   uso:  node strumenti/_t-spazio.js --out fuori/spazio.html
         node strumenti/_t-spazio.js --out fuori/x.html --solo 0AB
         node strumenti/_t-spazio.js --elenco
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

/* ===================================================================== */
/* GRUPPO M — LA MAPPA D'INFLUENZA. NON E' NELLA CURA SPEDITA: entra solo */
/* con --solo, ed e' li' perche' la bocciatura di C si possa rimisurare.  */
/* Da sola e' INERTE — nessun consumatore, nessun sorteggio, gioco        */
/* identico al bit tranne i 3-6 microsecondi ogni quarto di secondo che   */
/* costa costruirla (misurati: strumenti/_costo-influenza.js).            */
/* ===================================================================== */

{
  g: 'M',
  nome: 'M.1 la mappa d\'influenza nasce accanto al cervello di squadra',
  cerca: `const BRAIN_HZ = 0.25;          // ogni quanto la squadra ripensa

function teamBrain(t, dt){`,
  metti:
`const BRAIN_HZ = 0.25;          // ogni quanto la squadra ripensa

/* =====================================================================
   LA MAPPA D'INFLUENZA — 128 caselle, quattro volte al secondo.

   A CHE COSA SERVE, in una riga: a rispondere alla domanda "dov'e' lo
   spazio" senza scorrere ventidue uomini ogni volta che qualcuno se lo
   chiede. Il cervello di questo gioco sapeva rispondere solo a "quanto
   e' libero QUESTO uomo", che e' una domanda su un punto gia' noto; non
   sapeva CERCARE un posto vuoto, perche' cercare vuol dire guardare
   tanti posti e guardare tanti posti costava un ciclo sugli uomini per
   ciascuno.

   PERCHE' 16x8. Non e' un gusto: e' la grana piu' grossa che resta piu'
   fine del nucleo che ci si spalma sopra, e quindi non inventa scalini
   che il nucleo non abbia gia' lisciato. A 11 contro 11 la casella e'
   143,8 x 140 unita', a 7 e' 100,6 x 98, a 5 e' 71,9 x 70; il raggio
   d'influenza qui sotto e' 226,8 unita' a tutte e tre le taglie, quindi
   il lato della casella vale fra 0,32 (a 5) e 0,63 (a 11) del raggio.
   Il numero di caselle NON scala con la taglia, e va detto: il campo
   raddoppia e la mappa resta 128, cioe' a undici la mappa e' piu'
   grossolana. E' voluto — il costo deve restare lo stesso su un telefono
   che a undici ha gia' ventidue figure da disegnare — ed e' anche
   coerente: a undici lo spazio libero e' piu' grande, quindi una casella
   piu' grande sbaglia di meno.

   IL RAGGIO NON SCALA COL CAMPO, ed e' la stessa scelta — e la stessa
   ragione — per cui P_SPEED non scala: sono gambe umane. Un uomo
   presidia lo spazio in cui puo' arrivare, e quello spazio e' lo stesso
   a 5, a 7 e a 11. E' precisamente il motivo per cui a undici lo spazio
   libero e' DAVVERO di piu': la mappa lo deve dire, non nasconderlo.
   1,35 secondi di corsa e' il tempo di volo mediano di un passaggio in
   questo gioco (84,8 fotogrammi su 43,25 passaggi a partita, 12 partite
   a 11 contro 11, strumenti/_diag-spazio.js): cioe' esattamente il tempo
   che un avversario ha per venirti addosso mentre il pallone viaggia.

   IL NUCLEO HA PORTATA FINITA, e non e' un dettaglio di comodo: e' cio'
   che rende il costo indipendente dalla taglia. w = (1 - d2/R2)^2 vale
   zero oltre R, quindi ogni uomo tocca solo le caselle che stanno dentro
   il suo cerchio, e il cerchio e' grande uguale mentre le caselle
   rimpiccioliscono col campo. Le due cose si compensano quasi
   esattamente, e questo e' CONTATO dentro la pagina a meta' di una
   partita vera, non stimato (strumenti/_costo-influenza.js):

     taglia   caselle toccate   costruzione   una lettura   un fotogramma
                per giro          (una)                      di fisica
       5           358             6,0 us        43 ns          88 us
       7           322             5,7 us        49 ns          65 us
      11           265             4,4 us        30 ns         182 us

   Il ciclo pieno — 128 caselle per ognuno dei ventidue uomini — sarebbe
   stato 2816 giri: la portata finita lo divide per otto a cinque e per
   dieci a undici. E siccome la costruzione avviene quattro volte al
   secondo e i fotogrammi sono sessanta, la spesa ammortizzata e' un
   quindicesimo di quei microsecondi: fra lo 0,16% e lo 0,58% del costo
   della fisica, e lo 0,002% del sedicesimo di secondo che un telefono ha
   a disposizione. Il PICCO — la costruzione intera — cade su un
   fotogramma su quindici e vale sei microsecondi su sedicimila.
   E non pesca nessun numero casuale, quindi i banchi a seme fisso
   restano appaiati.
   ===================================================================== */
/* LE DUE SQUADRE STANNO IN DUE TABELLE, NON IN UNA FIRMATA, e questa e'
   una correzione a una prima stesura sbagliata di questa stessa toppa.
   Con una tabella sola (nostri meno loro) la domanda "dove mi smarco?"
   si scriveva come "dove il numero e' piu' alto", e quel numero e' alto
   anche dove ci sono TANTI COMPAGNI: la formula mandava l'uomo che si
   offre ad accucciarsi accanto ai suoi, che e' l'opposto di smarcarsi.
   Chi cerca spazio deve leggere gli AVVERSARI e basta, e per leggerli da
   soli devono stare da soli. Le due somme costano lo stesso ciclo. */
const INF_X = 16, INF_Y = 8, INF_N = INF_X*INF_Y;
const INF0 = new Float32Array(INF_N), INF1 = new Float32Array(INF_N);
const INF_R = P_SPEED*1.35, INF_R2 = INF_R*INF_R;
/* di quanto si guarda avanti la corsa di un uomo prima di spalmarlo
   sulla mappa: un terzo di secondo, cioe' poco piu' di un passo di
   ripianificazione dell'IA (D.react sta fra 0,14 e 0,30). Guardare piu'
   avanti di cosi' vorrebbe dire fidarsi di una velocita' che l'uomo sta
   gia' cambiando. */
const INF_LEAD = 0.33;
let INF_T = 0;
function costruisciInfluenza(dt){
  INF_T -= dt;
  if(INF_T > 0) return;
  INF_T = BRAIN_HZ;
  INF0.fill(0); INF1.fill(0);
  const cw=FW/INF_X, ch=FH/INF_Y;
  for(const p of G.players){
    if(p.out>0) continue;
    const M = p.team===0 ? INF0 : INF1;
    const px=p.x+p.vx*INF_LEAD, py=p.y+p.vy*INF_LEAD;
    let i0=Math.floor((px-INF_R)/cw), i1=Math.floor((px+INF_R)/cw);
    let j0=Math.floor((py-INF_R)/ch), j1=Math.floor((py+INF_R)/ch);
    if(i0<0)i0=0; if(i1>INF_X-1)i1=INF_X-1;
    if(j0<0)j0=0; if(j1>INF_Y-1)j1=INF_Y-1;
    for(let j=j0;j<=j1;j++){
      const dy=(j+0.5)*ch-py, dy2=dy*dy;
      if(dy2>=INF_R2) continue;
      for(let i=i0;i<=i1;i++){
        const dx=(i+0.5)*cw-px;
        const q=1-(dx*dx+dy2)/INF_R2;
        if(q>0) M[j*INF_X+i]+=q*q;
      }
    }
  }
}
/* QUANTO PRESIDIANO GLI AVVERSARI DI t la casella che contiene (x,y).
   Zero vuol dire che li' non ci arriva nessuno di loro in un secondo e
   un terzo di corsa; uno vuol dire che ce n'e' uno esattamente sopra.
   Una moltiplicazione, due troncamenti e una lettura: e' l'unica cosa
   che questa mappa sa fare piu' in fretta di un ciclo sugli uomini, ed
   e' l'unica ragione per cui esiste.
   SI LEGGE UNA TABELLA SOLA DELLE DUE, e va detto invece di nasconderlo:
   oggi l'unico consumatore e' la ricerca dello smarcamento, e chi si
   smarca guarda gli avversari. La tabella dei propri si riempie lo
   stesso — e' lo stesso ciclo, e per la squadra opposta E' la tabella
   degli avversari — quindi non c'e' niente di sprecato. */
function presidio(x,y,t){
  let i=(x*INF_X/FW)|0; if(i<0)i=0; else if(i>INF_X-1)i=INF_X-1;
  let j=(y*INF_Y/FH)|0; if(j<0)j=0; else if(j>INF_Y-1)j=INF_Y-1;
  return (t===0 ? INF1 : INF0)[j*INF_X+i];
}

function teamBrain(t, dt){`,
},

{
  g: 'M',
  nome: 'M.2 la mappa si ricostruisce prima che la squadra pensi',
  cerca: `  /* la squadra pensa prima dei singoli: stato, ruoli, contropiede */
  teamBrain(0,dt); teamBrain(1,dt);`,
  metti: `  /* la squadra pensa prima dei singoli: stato, ruoli, contropiede.
     E prima ancora si ridisegna la mappa dello spazio, sullo stesso
     orologio (BRAIN_HZ): il cervello e la mappa devono guardare lo
     stesso istante, se no la squadra decide su un campo di un quarto di
     secondo fa mentre crede di guardare quello di adesso. */
  costruisciInfluenza(dt);
  teamBrain(0,dt); teamBrain(1,dt);`,
},

{
  g: '0',
  nome: '0.1 il punto d\'incontro col pallone che rotola',
  cerca: `  return [ clamp(b.x+b.vx*t, 8, FW-8), clamp(b.y+b.vy*t, 8, FH-8), t ];
}
function doCross(p,nx,ny,mira,dest){`,
  metti:
`  return [ clamp(b.x+b.vx*t, 8, FW-8), clamp(b.y+b.vy*t, 8, FH-8), t ];
}
/* =====================================================================
   DOVE SI INCONTRA UN PALLONE CHE ROTOLA — la terza sorella di
   puntoCaduta e puntoTesta, e la prima che tiene conto di CHI va a
   prenderlo.

   Le altre due rispondono a "dove sara' il pallone"; questa risponde a
   "dov'e' il primo posto in cui IO posso essere prima di lui". E' la
   differenza fra inseguire e intercettare, ed e' la ragione per cui un
   destinatario che punta la posizione ATTUALE del pallone gli corre
   sempre dietro: mentre lui ci arriva, il pallone e' andato oltre.

   LA STRADA E' QUELLA VERA, non una retta a velocita' costante:
   l'attrito dell'erba di updateBall e' esponenziale nel tempo
   (b.vx *= 0,35^(dt*ATTR_K), cioe' K = TIRO_ATTR), quindi in t secondi
   il pallone percorre v*(1-e^(-K t))/K — la stessa formula, con lo
   stesso K, che puntoCaduta usa per il volo. Le due non possono
   divergere perche' leggono la stessa costante.
   L'esponenziale si calcola UNA VOLTA SOLA e poi si eleva a potenza per
   moltiplicazioni successive: otto campioni costano un exp, non otto.

   IL PASSO E LA FINESTRA. Otto campioni da 0,18 s coprono 1,44 s, che e'
   appena piu' del volo medio misurato di un passaggio in questo gioco
   (84,8 fotogrammi = 1,41 s, strumenti/_diag-spazio.js a 11 contro 11).
   Oltre quella finestra non si guarda perche' oltre quella finestra il
   passaggio e' gia' finito in un modo o nell'altro.
   Se non si arriva mai in tempo si punta il punto in cui il pallone si
   FERMA (t che tende a infinito, cioe' strada v/K): e' il posto giusto
   comunque, perche' e' li' che il pallone aspettera'.
   ===================================================================== */
function puntoIncontro(p, b){
  const K=Math.max(0.001,TIRO_ATTR);
  const smax=1/K;
  let sx=b.x+b.vx*smax, sy=b.y+b.vy*smax;
  const passo=0.18, e=Math.exp(-K*passo);
  let ek=1, t=0;
  for(let k=0;k<8;k++){
    t+=passo; ek*=e;
    const s=(1-ek)/K;
    const bx=b.x+b.vx*s, by=b.y+b.vy*s;
    /* KICK_R e' il raggio a cui si tocca il pallone: arrivare "sopra" il
       punto non serve, basta arrivare a portata di piede. */
    if(len(bx-p.x,by-p.y) <= P_SPEED*t + KICK_R){ sx=bx; sy=by; break; }
  }
  return [sx,sy];
}
function doCross(p,nx,ny,mira,dest){`,
},

/* ===================================================================== */
/* GRUPPO A — IL DESTINATARIO VA INCONTRO AL PALLONE.                     */
/* ===================================================================== */

{
  g: 'A',
  nome: 'A.1 il passaggio a terra ha un destinatario, e adesso lo sa',
  cerca: `    p.corsaArea=CROSS_CORSA_T;
    return;
  }
  /* =====================================================================
     LA CHIAMATA (L2.3) VIENE PRIMA DI TUTTO IL RESTO`,
  metti:
`    p.corsaArea=CROSS_CORSA_T;
    return;
  }
  /* =====================================================================
     E ANCHE IL PASSAGGIO A TERRA HA UN DESTINATARIO — la stessa cura del
     ramo qui sopra, per il pallone che non si alza.

     b.passTo esiste da sempre, lo scrivono cinque punti del file
     (eseguiAiPass, eseguiPassUmano, la filtrante, il rinvio del portiere)
     e updateBall lo legge in tre (il ricevitore designato non mura il
     proprio passaggio, e lo controlla anche a piu' di 420 unita' al
     secondo). Nessun ramo dell'IA lo leggeva. Il risultato e' esattamente
     quello che il commento del cross qui sopra descrive per il pallone
     alto: appena il piede lascia il pallone b.owner vale -1, weHaveBall
     diventa falso per tutti e due i colori, e l'uomo a cui il pallone e'
     indirizzato scende nel ramo di copertura insieme a tutti gli altri.

     MISURATO PRIMA DI QUESTA RIGA, strumenti/_diag-spazio.js, 12 partite
     a 11 contro 11, semi 20260803..814:
       il pallone e' IN VOLO verso un uomo per il 31,64% della partita
       (su un 78,55% totale di pallone di nessuno);
       arriva al destinatario il 23,93% delle volte;
       mentre vola, il coseno fra il bersaglio dell'IA del destinatario e
       la direzione del pallone vale +0,296 — cioe' ci va incontro con un
       quarto della sua corsa e con gli altri tre quarti fa altro.

     Ci va UNO SOLO, quello scritto sul pallone, e ci va al PUNTO
     D'INCONTRO, non alla posizione attuale: correre dove il pallone si
     trova adesso vuol dire arrivarci quando non c'e' piu' (vedi
     puntoIncontro). Non tocca il giocatore comandato dal dito, perche'
     aiMove non gira per lui.
     ===================================================================== */
  if(b.owner<0 && b.z<=0 && b.passTo===G.players.indexOf(p)){
    const c=puntoIncontro(p, b);
    p.aiTX=clamp(c[0], 24, FW-24);
    p.aiTY=clamp(c[1], 24, FH-24);
    return;
  }
  /* =====================================================================
     LA CHIAMATA (L2.3) VIENE PRIMA DI TUTTO IL RESTO`,
},

/* ===================================================================== */
/* GRUPPO R — IL NASTRO DELLA MOVIOLA NON ATTRAVERSA LE PARTITE.          */
/* Non e' una cura di gioco: e' il difetto che la cura A ha fatto uscire  */
/* allo scoperto, e va spedito con lei perche' senza di lui un cancello   */
/* di casa diventa rosso. Il perche' sta nel commento qui sotto.          */
/* ===================================================================== */

{
  g: 'R',
  nome: 'R.1 startMatch azzera il nastro della moviola, contenuto E FASE',
  cerca: `  G.ripresa=null; G.ripresaFatta=false; G.moviola=null; G.moviolaFatta=false;`,
  metti:
`  G.ripresa=null; G.ripresaFatta=false; G.moviola=null; G.moviolaFatta=false;
  /* =====================================================================
     IL NASTRO DELLA MOVIOLA NON ATTRAVERSA LE PARTITE — e finora lo
     faceva, in un modo che nessuno poteva vedere a occhio e che rendeva
     due partite con lo stesso seme due partite diverse.

     G.rec e' l'anello dei cinque secondi che la moviola rivede, e G.recT
     e' il cronometro che decide QUANDO prendere il prossimo fotogramma
     (registraFotogramma: recT scende di dt, e quando passa lo zero
     riparte da 1/REC_HZ). Dopo un gol il gioco azzera l'anello — lo fa
     in due punti di step, tutte e due dopo la rete — ma a INIZIO PARTITA
     non lo azzerava nessuno: la partita nuova ereditava dalla precedente
     sia i cento fotogrammi dell'anello sia, soprattutto, la FASE del
     cronometro.

     PERCHE' UNA FASE FA DIVERGERE UNA PARTITA. Il numero di fotogrammi
     registrati al secondo non cambia — sono sempre REC_HZ — ma cambia
     QUALI. Quando arriva una rete, avviaMoviola taglia gli ultimi
     REC_HZ*0,8 fotogrammi dell'anello e la moviola dura quanto sono
     lunghi; e mentre la moviola gira, step ESCE PRIMA e la fisica non
     avanza. Un fotogramma di anello in piu' o in meno e' un fotogramma
     di partita in piu' o in meno dopo ogni gol: da li' in poi le due
     partite non sono piu' allineate.

     MISURATO, e la caccia e' ripetibile (strumenti/_zz-caccia-stato.js
     elenca i campi che sopravvivono, strumenti/_zz-det-bisez.js li
     azzera uno alla volta):
       prova A di _q-determinismo.js, 12 semi da 20260803, 5 contro 5
         gioco spedito            1 partita su 12 diverge (seme 20260812)
         col solo cambio A        4 partite su 12
         azzerando G.rec          4 su 12   — l'anello NON c'entra
         azzerando G.recT         0 su 12   — e' la FASE, un float
         azzerando tutti e due    0 su 12
     Un solo numero in virgola mobile, mai letto da nessuno tranne
     registraFotogramma, decideva se due partite identiche restavano
     identiche.

     PERCHE' STA IN QUESTA TOPPA E NON IN UNA SUA. Perche' e' la cura A a
     portarlo alla luce: cambiando le traiettorie cambia quando arrivano
     le reti, e il difetto si vede da una partita su dodici a quattro.
     Spedire A senza questa riga vorrebbe dire spedire un cancello che
     diventa rosso e dire che era gia' rotto — vero, ma inutile. Le due
     righe azzerano anche il CONTENUTO dell'anello: non serve al
     determinismo (misurato: da solo non cambia niente) ma serve al
     gioco, perche' un gol al primo secondo di una partita nuova
     rivedrebbe un fotogramma della partita di prima.
     ===================================================================== */
  G.rec.length=0; G.recT=0;`,
},

/* ===================================================================== */
/* GRUPPO B — LA CPU PASSA COME PASSA UNA PERSONA.                        */
/* ===================================================================== */

{
  g: 'B',
  nome: 'B.1 eseguiAiPass legge lo stesso punteggio di smarcato()',
  cerca: `  const b=G.ball;
  let best=null,bs=-1e9;
  for(const q of G.players){
    if(q.team!==p.team||q===p||q.out>0||q.role==='gk') continue;
    let s=0;
    for(const o of G.players){ if(o.team!==p.team && o.out<=0) s+=clamp(len(o.x-q.x,o.y-q.y),0,200); }
    s+=(p.team===0?q.x-p.x:p.x-q.x)*0.8;`,
  metti:
`  const b=G.ball;
  let best=null,bs=-1e9;
  for(const q of G.players){
    if(q.team!==p.team||q===p||q.out>0||q.role==='gk') continue;
    /* =====================================================================
       LA CPU GUARDA LA CORSIA, COME LA GUARDA UNA PERSONA.

       In questo file c'erano DUE punteggi di smarcamento, e uno dei due
       era cieco:
         smarcato(p,q,t)  — quello del giocatore umano. Satura a 220 per
                            avversario e TOGLIE 260 per ogni avversario
                            entro 40 unita' dalla linea di passaggio, fra
                            il 10% e il 95% della sua lunghezza.
         queste due righe  — quello della CPU. Saturava a 200 e la linea
                            di passaggio non la guardava affatto.
       Il commento di smarcato dichiara gia' "adesso lo leggono in due —
       il passaggio e la filtrante — e la logica vive in un posto solo":
       la CPU era il terzo lettore che mancava, e la sua mancanza si
       misura. Su 43,25 passaggi a partita a 11 contro 11
       (strumenti/_diag-spazio.js, 12 partite, semi 20260803..814):
         arrivati al destinatario   23,93%
         finiti su un CORPO         35,18%   <-- la corsia non guardata
         intercettati               33,78%
         spenti per strada           3,68%
       e la distanza media di un appoggio era 711 unita' su un campo
       largo 2300, perche' senza penalita' di corsia il punteggio premia
       chi sta piu' lontano da tutti — cioe' chi e' piu' difficile da
       raggiungere.

       PERCHE' NON UNA LETTURA DELLA MAPPA D'INFLUENZA, che questo stesso
       strumento sa aggiungere col gruppo M. Perche' qui la domanda e' su
       punti GIA' NOTI (questo compagno, questa retta) e per un punto noto
       la geometria esatta costa quanto una lettura di casella ed e'
       esatta. Una mappa serve a CERCARE, non a valutare; usata dove basta
       un prodotto scalare e' peso senza resa.

       E QUESTO GRUPPO E' BOCCIATO — sta in questo file solo perche' la
       bocciatura si possa rimisurare, e nel gioco spedito non c'e'.
       Contro la sola cura A, 100 partite appaiate a semi fissi
       (strumenti/_appaiato.js, IC 95% bootstrap, p per permutazione):
         11v11  momenti da porta      -0,65  [-1,16; -0,14]  p 0,018
                momenti da porta/min  -0,19  [-0,35; -0,02]  p 0,030
                tiri                  -4,94  [-6,84; -3,11]  p<0,0001
                palla di nessuno %    -4,19  [-4,90; -3,47]  p<0,0001
                cambi di possesso     -7,64  [-9,52; -5,72]  p<0,0001
                rimpalli sul corpo    -6,41  [-8,12; -4,74]  p<0,0001
          5v5   tiri                  -1,39  [-2,44; -0,23]  p 0,017
                gol                   -0,37  [-0,83; +0,09]  p 0,127
       Fa esattamente quello che prometteva — gli appoggi che arrivano
       salgono dal 49% al 63%, la distanza media scende da 634 a 463
       unita', i palloni che finiscono su un corpo crollano — e in cambio
       la squadra non arriva piu' davanti alla porta. E' il profilo delle
       sei cure che il cronometro ha gia' visto morire.

       COSA CAMBIA NEI NUMERI: la saturazione passa da 200 a 220 (e' la
       stessa grandezza, la stessa unita' e la stessa scala: cambia il
       punto in cui un avversario lontano smette di contare) e CHIAMA_PESO
       arriva da dentro smarcato invece che da qui sotto — per questo la
       riga che lo aggiungeva sparisce, altrimenti la chiamata varrebbe il
       doppio per la sola CPU. Il termine di AVANZAMENTO resta qui e non
       entra in smarcato: e' l'unica cosa che distingue il passaggio della
       macchina da quello della persona (la persona sceglie da se' se
       andare avanti; la macchina ha bisogno che il punteggio glielo
       dica), e spostarlo dentro cambierebbe anche il passaggio del dito.
       ===================================================================== */
    let s=smarcato(p,q,p.team);
    s+=(p.team===0?q.x-p.x:p.x-q.x)*0.8;`,
},

{
  g: 'B',
  nome: 'B.2 la chiamata non si conta due volte',
  cerca: `    /* LO STESSO PESO DELLA CHIAMATA, e qui non e' simmetria per bellezza.
       Questo e' il passaggio della CPU, cioe' il passaggio che riceve la
       meta' «CHIEDO PALLA» del progetto (§4, contesto NOI): li' il
       portatore e' un compagno guidato dalla macchina, e se il suo
       punteggio non vedesse la chiamata quella meta' del meccanismo non
       farebbe niente. Il punteggio di questa funzione NON e' smarcato() —
       satura a 200 invece che a 220 e non ha la penalita' della linea di
       passaggio — ma e' della stessa specie e della stessa scala: una
       somma di distanze in unita' di campo. Il numero e' lo stesso, e
       vale quanto ci si aspetta che valga. */
    if(q.chiamata>0) s+=CHIAMA_PESO;
`,
  metti: `    /* IL PESO DELLA CHIAMATA ADESSO ARRIVA DA DENTRO smarcato(), che lo
       aggiunge lui — e' l'ultima riga di quella funzione. La riga che
       stava qui lo sommava una seconda volta, e sommarlo due volte
       vorrebbe dire che chiamare un compagno pesa il doppio quando il
       portatore e' la macchina e il peso normale quando e' una persona:
       due verbi diversi col nome uguale, che e' precisamente cio' che
       l'estrazione di smarcato esisteva per impedire.
       La meta' «CHIEDO PALLA» del progetto (§4, contesto NOI) continua a
       funzionare: passa per smarcato come passa per il dito. */
`,
},

/* ===================================================================== */
/* GRUPPO D — LA PERCEZIONE: un uomo si muove sul pallone CHE HA VISTO.   */
/* ===================================================================== */

{
  g: 'D',
  nome: 'D.1 percepisci() e pallaVista(): la memoria del pallone',
  cerca: `function ruoloDi(p){
  const B = G.brain[p.team];`,
  metti:
`/* =====================================================================
   LA PERCEZIONE — il pallone che un uomo HA VISTO, non quello che c'e'.

   Oggi ogni uomo di questo gioco legge b.x e b.y senza mediazione: un
   difensore che corre verso la propria porta, con la palla alle spalle,
   sa dov'e' il pallone al centimetro e al fotogramma. Il concorrente ha
   un gestore della percezione con un oggetto per il pallone; da noi
   "perception" compare zero volte. Questa e' la nostra versione, e sta
   in due funzioni e cinque campi per uomo.

   COSA VUOL DIRE VEDERE. Il pallone e' visto se sta davanti (prodotto
   scalare positivo fra il verso in cui l'uomo guarda e la direzione del
   pallone: e' lo stesso p.fx/p.fy che il primo tocco usa gia' per
   decidere se il pallone arriva "in faccia" o "alle spalle") oppure se
   e' vicinissimo — a meno di tre raggi di calciabilita' non serve
   guardare, si sente.

   QUANDO NON SI VEDE, non si perde il pallone: si RICORDA dov'era e in
   che direzione andava, e si stima dove sara' adesso con la stessa legge
   d'attrito dell'erba che usano puntoCaduta e puntoIncontro. E' cosi'
   che sbaglia un calciatore: non a caso, ma seguendo un pallone che nel
   frattempo ha cambiato strada.

   MEZZO SECONDO, E NON E' UN NUMERO MISURATO — e' dichiarato: e' il
   tempo entro cui un uomo che corre si gira a guardare. Serve un tetto,
   perche' senza tetto un difensore in ritirata non rivedrebbe il pallone
   fino a fine azione e la memoria diventerebbe una cecita'.

   NESSUN SORTEGGIO. La fallibilita' qui non e' un dado: e' geometria
   (dove guardavi) piu' aritmetica (quanto tempo fa). Un dado avrebbe
   sfasato ogni banco a seme fisso e non avrebbe aggiunto niente che si
   veda in campo.

   ED E' BOCCIATA. Contro la sola cura A, 100 partite appaiate:
     11v11  precisione VERA %     -1,92  [-3,72; -0,17]  p 0,039
            momenti da porta/min  -0,11  [-0,30; +0,08]  p 0,241
            palla di nessuno %    -0,18  [-0,78; +0,42]  p 0,554
      5v5   momenti da porta/min  -0,36  [-0,90; +0,22]  p 0,216
            gol                   -0,27  [-0,71; +0,16]  p 0,239
   Nessun guadagno misurato da nessuna parte, un danno misurato (la
   precisione dei tiri a undici), e un costo che si paga a OGNI
   fotogramma per ogni uomo invece che quattro volte al secondo. Una
   fallibilita' che non si vede e che toglie due punti di precisione non
   e' credibilita': e' rumore con un nome bello.
   DOVE VALE DAVVERO, per chi la riprende: non nella copertura ma nel
   PRIMO TOCCO — dove pero' c'e' gia', ed e' gia' misurata (il fattore
   «scomodo» di updateBall guarda esattamente se il pallone arriva alle
   spalle di chi lo riceve).
   ===================================================================== */
const VISTA_MAX = 0.5;
function percepisci(p, b, dt){
  if(p.vista===undefined){ p.vista=0; p.vbX=b.x; p.vbY=b.y; p.vbVX=b.vx; p.vbVY=b.vy; return; }
  const dx=b.x-p.x, dy=b.y-p.y, d=Math.max(1,len(dx,dy));
  if(dx*p.fx+dy*p.fy > 0 || d < KICK_R*3 || p.vista >= VISTA_MAX){
    p.vista=0; p.vbX=b.x; p.vbY=b.y; p.vbVX=b.vx; p.vbVY=b.vy;
  }else p.vista+=dt;
}
/* dove l'uomo CREDE che sia il pallone: l'ultima posizione vista piu' la
   strada che il pallone avrebbe fatto con la sua velocita' di allora.
   Quando l'ha appena visto torna esattamente il pallone vero, quindi
   chiamarla al posto di b.x/b.y non e' mai sbagliato. */
function pallaVista(p, b){
  if(!(p.vista>0)) return [b.x, b.y];
  const K=Math.max(0.001,TIRO_ATTR);
  const s=(1-Math.exp(-K*p.vista))/K;
  return [clamp(p.vbX+p.vbVX*s, 0, FW), clamp(p.vbY+p.vbVY*s, 0, FH)];
}

function ruoloDi(p){
  const B = G.brain[p.team];`,
},

{
  g: 'D',
  nome: 'D.2 la memoria si aggiorna dove scorrono gli altri cronometri',
  cerca: `  if(p.raddoppio>0) p.raddoppio=Math.max(0, p.raddoppio-dt);
  if(!carrier || carrier.team===myTeam) p.raddoppio=0;`,
  metti: `  if(p.raddoppio>0) p.raddoppio=Math.max(0, p.raddoppio-dt);
  if(!carrier || carrier.team===myTeam) p.raddoppio=0;
  /* LA MEMORIA DEL PALLONE SCORRE QUI, insieme agli altri due cronometri
     di questa funzione e per la stessa ragione: e' l'unico posto che
     gira a ogni fotogramma per ogni uomo non comandato dal dito. Chi
     tiene il dito su un uomo vede con i propri occhi, e la sua memoria
     resta ferma all'ultima cosa che l'IA sapeva — che e' giusto: quando
     il dito lo lascia, quell'uomo si guarda intorno (il tetto di mezzo
     secondo lo obbliga entro mezzo secondo). */
  percepisci(p, b, dt);`,
},

{
  g: 'D',
  nome: 'D.3 chi copre insegue il pallone che ha visto',
  cerca: `      /* copertura: taglia la linea di passaggio verso l'attaccante piu' pericoloso */
      let danger=null, ddg=1e9;
      for(const o of G.players){
        if(o.team===myTeam||o===carrier||o.out>0||o.role==='gk') continue;
        const d=Math.abs(o.x-myGoalX)+len(o.x-b.x,o.y-b.y)*0.25;
        if(d<ddg){ ddg=d; danger=o; }
      }`,
  metti:
`      /* copertura: taglia la linea di passaggio verso l'attaccante piu' pericoloso.
         E LA TAGLIA SUL PALLONE CHE HA VISTO. Questo e' il ramo dove la
         percezione morde davvero: chi copre corre verso la propria porta,
         cioe' spesso con la palla alle spalle, ed e' esattamente l'uomo
         che nella realta' si posiziona su un'informazione vecchia di
         qualche decimo. Il pressatore no: lui il pallone ce l'ha davanti
         per definizione, e infatti il suo ramo legge il pallone vero. */
      const pv=pallaVista(p, b), bvx=pv[0], bvy=pv[1];
      let danger=null, ddg=1e9;
      for(const o of G.players){
        if(o.team===myTeam||o===carrier||o.out>0||o.role==='gk') continue;
        const d=Math.abs(o.x-myGoalX)+len(o.x-bvx,o.y-bvy)*0.25;
        if(d<ddg){ ddg=d; danger=o; }
      }`,
},

{
  g: 'D',
  nome: 'D.4 il bersaglio della copertura usa la stessa palla vista',
  cerca: `      const anc=formation(myTeam)[p.idx];
      let cx2, cy2;
      if(danger){
        cx2=(danger.x+b.x)/2 + (myGoalX===0?-24:24);
        cy2=(danger.y+b.y)/2;
      }else{
        const gx=myGoalX===0?140:FW-140;
        cx2=(b.x+gx)/2; cy2=(b.y+FH/2)/2;
      }`,
  metti: `      const anc=formation(myTeam)[p.idx];
      let cx2, cy2;
      if(danger){
        cx2=(danger.x+bvx)/2 + (myGoalX===0?-24:24);
        cy2=(danger.y+bvy)/2;
      }else{
        const gx=myGoalX===0?140:FW-140;
        cx2=(bvx+gx)/2; cy2=(bvy+FH/2)/2;
      }`,
},

/* ===================================================================== */
/* GRUPPO C — LA MAPPA SCEGLIE DOVE SMARCARSI.                            */
/* ===================================================================== */

{
  g: 'C',
  nome: 'C.1 altezzaLibera: la ricerca che la mappa rende possibile',
  cerca: `function scansaAvversari(t, tx, ty, side){`,
  metti:
`/* =====================================================================
   L'ALTEZZA PIU' LIBERA — la sola cosa in questa toppa che la mappa
   d'influenza sa fare e un ciclo sugli uomini non saprebbe fare gratis.

   scansaAvversari, qui sotto, risponde a "c'e' qualcuno ADDOSSO al punto
   dove vado?" e in caso lo sposta di 70 unita'. E' un riflesso corto:
   guarda un cerchio di 70 unita' intorno a un punto solo, e non ha
   nessun modo di sapere se il posto in cui ti sta spostando e' migliore
   o peggiore di quello da cui ti toglie. Questa funzione risponde alla
   domanda prima: "delle tre altezze possibili, quale presidiano meno?".

   TRE LETTURE, e non una di piu'. La casella sopra, quella chiesta, la
   casella sotto: uno spostamento di FH/INF_Y, che a 11 contro 11 vale
   140 unita' ed e' dello stesso ordine dello scarto di lato del ramo
   dello smarcato (side*150). Cercare piu' lontano vorrebbe dire mandare
   l'uomo in un posto che non ha niente a che fare con l'azione; cercare
   piu' fitto vorrebbe dire leggere la stessa casella due volte.

   SI GUARDANO GLI AVVERSARI E BASTA, non il saldo fra le due squadre, e
   la prima stesura di questa toppa sbagliava proprio qui. Un saldo
   «nostri meno loro» e' alto anche dove ci sono tanti COMPAGNI: chiedere
   il massimo del saldo vuol dire mandare l'uomo che si offre ad
   accucciarsi accanto ai suoi. Chi cerca spazio cerca l'ASSENZA DI
   AVVERSARI, e presidio() risponde esattamente a quella domanda. Del
   traffico fra compagni si occupa gia' la separazione (SEP_R), che e'
   una forza e non un bersaglio, e fa il suo lavoro qualunque bersaglio
   riceva.

   ED E' BOCCIATA. Contro la sola cura A, 100 partite appaiate:
     5v5    momenti da porta      -1,01  [-1,91; -0,18]  p 0,025
            momenti da porta/min  -0,52  [-1,03; -0,01]  p 0,050
     11v11  momenti da porta/min  -0,04  [-0,22; +0,14]  p 0,669
            palla di nessuno %    +0,54  [-0,06; +1,17]  p 0,096
   A undici non fa niente, a cinque fa danno e il danno e' misurato. La
   mappa non e' sbagliata — costa 4-6 microsecondi ogni quarto di secondo
   e li vale — e' questo CONSUMATORE che non paga: del traffico intorno a
   un uomo si occupano gia' la separazione e scansaAvversari, e spostarlo
   di una casella intera PRIMA che quei due lavorino gli toglie il posto
   invece di dargliene uno migliore. Serve un consumatore diverso.

   I PAREGGI TENGONO L'ALTEZZA CHIESTA, perche' il confronto e' STRETTO e
   il valore di partenza e' quello del punto chiesto. Non e' pignoleria:
   senza questa regola un uomo fermo in mezzo a due caselle uguali
   ballerebbe fra le due a ogni ripianificazione, che e' lo stesso
   sfarfallio per cui la corsa in area ha dovuto imparare l'isteresi.
   E l'ordine di scansione e' fisso (prima sopra, poi sotto), quindi non
   c'e' niente da sorteggiare: il seme scorre come prima.
   ===================================================================== */
function altezzaLibera(t, x, y){
  const ch=FH/INF_Y;
  let bestY=y, bestV=presidio(x,y,t);
  const su=clamp(y-ch, 50, FH-50), giu=clamp(y+ch, 50, FH-50);
  let v=presidio(x,su,t);   if(v<bestV){ bestV=v; bestY=su; }
  v=presidio(x,giu,t);      if(v<bestV){ bestV=v; bestY=giu; }
  return bestY;
}
function scansaAvversari(t, tx, ty, side){`,
},

{
  g: 'C',
  nome: 'C.2 lo smarcato chiede alla mappa prima di chiedere al riflesso',
  cerca: `      let ty = clamp(carrier.y + side*150 + rnd(-30,30), 50, FH-50);`,
  metti:
`      let ty = clamp(carrier.y + side*150 + rnd(-30,30), 50, FH-50);
      /* LA MAPPA PRIMA DEL RIFLESSO. L'altezza chiesta dal modulo
         (side*150) e' una regola di forma, non una lettura del campo: se
         quella corsia e' piena, la forma manda l'uomo dentro il traffico
         e poi scansaAvversari lo sposta di settanta unita' senza sapere
         dove. Qui si guarda prima quale delle tre altezze gli avversari
         presidiano di meno, e SOLO DOPO si applica lo scarto corto.
         Il sorteggio della riga qui sopra non si tocca e non si sposta:
         resta dov'era, con lo stesso conto di Math.random(). */
      ty = altezzaLibera(myTeam, aheadX, ty);`,
},

];

/* --------------------------------------------------------------------
   LA CURA SPEDITA E' 0+A, e le tre bocciate si applicano solo se qualcuno
   le chiede per nome. Il verso di questa scelta conta: una toppa in cui
   il comportamento di serie e' "tutto quello che c'e' scritto" spedirebbe
   nel gioco anche le cure che questa stessa toppa dichiara dannose, e
   basterebbe distrarsi una volta.
   -------------------------------------------------------------------- */
const SPEDITI = '0AR';
const solo = arg('solo', '');
const chiesti = solo || SPEDITI;
const scelte = ANCORE.filter(a => chiesti.includes(a.g));
if (!scelte.length) { console.error('FALLITO: --solo ' + solo + ' non seleziona nessun gruppo.'); process.exit(2); }
/* CHI DIPENDE DA CHI, dichiarato invece che scoperto a schermo nero: A
   chiama puntoIncontro (gruppo 0) e C chiama presidio (gruppo M). Un
   --solo che chiedesse il consumatore senza l'impianto scriverebbe un
   file che si rompe al primo passaggio, e si romperebbe DENTRO la
   partita, dove un banco lo vedrebbe come "zero eventi" invece che come
   un errore. */
for (const [chi, serve] of [['A', '0'], ['C', 'M']]) {
  if (chiesti.includes(chi) && !chiesti.includes(serve)) {
    console.error('FALLITO: il gruppo ' + chi + ' ha bisogno del gruppo ' + serve + '. Usa --solo ' + serve + chi + '.');
    process.exit(2);
  }
}

if (haFlag('elenco')) {
  console.log('_t-spazio.js — ' + ANCORE.length + ' ancoraggi, di serie i gruppi ' + SPEDITI + ':');
  for (const a of ANCORE) console.log('  [' + a.g + '] ' + (SPEDITI.includes(a.g) ? 'SPEDITO ' : 'bocciato') + '  ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.spazio.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of scelte) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}

/* GLI ATTESI. Ogni riga vale solo se il suo gruppo e' stato applicato:
   un atteso che non guarda i gruppi renderebbe --solo inutilizzabile,
   e --solo e' lo strumento con cui si misura quanto vale ogni pezzo. */
const usa = g => scelte.some(a => a.g === g);
const attesi = [];
if (usa('M')) attesi.push(
  ['const INF0 = new Float32Array(INF_N), INF1 = new Float32Array(INF_N);', 1],
  ['function costruisciInfluenza(dt){', 1],
  ['  costruisciInfluenza(dt);\n  teamBrain(0,dt); teamBrain(1,dt);', 1],
  ['function presidio(x,y,t){', 1],
);
if (usa('0')) attesi.push(
  ['function puntoIncontro(p, b){', 1],
);
if (usa('A')) attesi.push(
  ['if(b.owner<0 && b.z<=0 && b.passTo===G.players.indexOf(p)){', 1],
  ['const c=puntoIncontro(p, b);', 1],
);
/* LA MAPPA NON ENTRA DI CONTRABBANDO. Se il gruppo M non e' stato
   chiesto, nel file spedito non deve comparire nemmeno il suo nome:
   questa riga e' quella che rende vera la frase "la mappa e' bocciata,
   nel gioco non c'e'". */
if (!usa('M')) attesi.push(['costruisciInfluenza', 0], ['presidio(', 0]);
/* e senza il gruppo C nessuno puo' chiamare una funzione che non c'e' */
if (!usa('C')) attesi.push(['altezzaLibera', 0]);
if (!usa('D')) attesi.push(['pallaVista', 0], ['percepisci', 0]);
if (usa('R')) attesi.push(
  ['  G.rec.length=0; G.recT=0;', 1],
);
if (usa('B')) attesi.push(
  ['let s=smarcato(p,q,p.team);', 1],
  /* il vecchio punteggio cieco non deve sopravvivere da nessuna parte */
  ['s+=clamp(len(o.x-q.x,o.y-q.y),0,200);', 0],
  /* CHIAMA_PESO resta scritto in DUE posti soli: la sua dichiarazione e
     l'unica riga che lo somma, dentro smarcato() */
  ['if(q.chiamata>0) openness+=CHIAMA_PESO;', 1],
  ['if(q.chiamata>0) s+=CHIAMA_PESO;', 0],
);
if (usa('D')) attesi.push(
  ['function percepisci(p, b, dt){', 1],
  ['function pallaVista(p, b){', 1],
  ['  percepisci(p, b, dt);', 1],
  ['const pv=pallaVista(p, b), bvx=pv[0], bvy=pv[1];', 1],
  /* il ramo del pressatore NON deve aver perso il pallone vero */
  ['p.aiTX=b.x+b.vx*lead; p.aiTY=b.y+b.vy*lead;', 1],
);
if (usa('C')) attesi.push(
  ['function altezzaLibera(t, x, y){', 1],
  ['ty = altezzaLibera(myTeam, aheadX, ty);', 1],
  /* il sorteggio dello smarcamento non si e' spostato ne' moltiplicato */
  ['clamp(carrier.y + side*150 + rnd(-30,30), 50, FH-50)', 1],
);
/* IL CONTO DEI SORTEGGI. Non e' una formalita': la regola di casa dice
   che il numero di sorteggi non deve cambiare, e qui si conta davvero,
   su tutto il file, prima e dopo.
   I COMMENTI SI TOLGONO PRIMA DI CONTARE, e la prima stesura di questo
   strumento non lo faceva: bastava una riga di commento che NOMINAVA il
   sorteggio perche' il conto salisse di uno e la toppa si rifiutasse di
   scrivere. Un guardiano che scatta sulla parola invece che sul codice
   e' un guardiano che insegna a non scrivere commenti. Lo stesso taglio
   si applica al prima e al dopo, quindi qualunque imprecisione della
   regola pesa uguale sui due lati e la DIFFERENZA resta buona. */
const senzaCommenti = t => t.replace(/\/\*[\s\S]*?\*\//g, ' ');
const contaCaso = t => {
  const c = senzaCommenti(t);
  return (c.match(/Math\.random\(\)/g) || []).length + (c.match(/\brnd\(/g) || []).length;
};
if (contaCaso(src) !== contaCaso(out)) {
  attesi.push(['SORTEGGI: ' + contaCaso(src) + ' prima, ' + contaCaso(out) + ' dopo', -1]);
}

const rotti = attesi.filter(([s, n]) => n < 0 || (out.split(s).length - 1) !== n)
  .map(([s, n]) => n < 0 ? s : (s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + scelte.length + '/' + ANCORE.length + ' ancoraggi applicati' + (solo ? '  (--solo ' + solo + ')' : ''));
console.log('    sorteggi: ' + contaCaso(src) + ' prima, ' + contaCaso(out) + ' dopo');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
