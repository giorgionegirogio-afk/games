/* =====================================================================
   _t-carattere.js — LE DIECI SQUADRE DIVENTANO DIECI SQUADRE
   (27 agosto 2026; RIVISTA E RIMISURATA ALLE TRE TAGLIE il 28 agosto).

   COSA E' CAMBIATO NELLA REVISIONE, in breve, perche' chi torna qui
   sappia subito cosa fidarsi di leggere:
     · e' caduta una DICHIARAZIONE FALSA — «l'11 contro 11 si gioca solo
       in amichevole» — che copriva Torneo e Stagione, cioe' il percorso
       piu' battuto del gioco. Vedi «DOVE SI INCONTRA IL CARATTERE».
     · tutte le misure sono state RIFATTE alle taglie 5, 7 e 11 (prima
       erano tutte a 5) e sul gioco di oggi, che nel frattempo e'
       cambiato sotto: portiere a quattro esiti, colpo di testa, il caso
       che passa da dado().
     · PRATI BASSI e' stata corretta (mira 0,70 -> 0,85): era assente
       dalla partita a tutte e tre le taglie.
     · tre affermazioni sono state corrette perche' erano false o
       superate: i tetti di shotFreq («guardie, non tarature»), il
       portiere che «non legge un solo attributo», e «monomorfe».
     · la guardia sul conto dei sorteggi era diventata CIECA (contava i
       Math.random dopo che il caso era passato a dado()) e adesso conta
       i dado( e pretende che ce ne siano.

   LA MISURA CHE HA APERTO IL LAVORO, ed e' peggio di come la si
   raccontava. Il difetto noto era «lo stile e' una didascalia»: accanto
   a ognuna delle dieci squadre di quartiere c'e' una frase — «pressing
   alto, non ti fa respirare», «difesa chiusa, zero rischi», «tiro da
   fuori come religione» — e nessuna riga di simulazione la legge (il
   campo `stile` compare in due soli posti, tutti e due a schermo:
   seaPlaySub e btnSeaPlay).

   Misurato con strumenti/_sonda-carattere.js sul gioco spedito — dieci
   squadre, 12 partite ciascuna, CPU contro CPU, taglia 5, Normale, semi
   20260803..814, gli STESSI semi per tutte e dieci, cosi' l'unica cosa
   che cambia fra una colonna e l'altra e' l'identita' dell'avversario.

   ATTENZIONE ALLA DATA: la tabella qui sotto e' del 27 AGOSTO, sul gioco
   di allora. Il gioco e' cambiato il giorno dopo e questi numeri non si
   riproducono piu' cifra per cifra — sul gioco del 28 la stessa sonda a
   taglia 5 da' separazione media 0,75 e TRE coppie gemelle invece di
   due. Resta qui perche' e' la misura che ha aperto il lavoro e il
   difetto che descrive e' lo stesso; per i numeri di oggi, alle tre
   taglie, vedi il punto 1 delle MISURE in fondo al file.

     squadra        fz    tiri  dist   gol scivo falli   poss  linea morso
     GASOMETRO      7      4.9   352  1.67   0.9   0.3  0.504  0.359    65
     MERCATO VERDE  7      4.9   352  1.67   0.9   0.3  0.504  0.359    65
     SANTA FURIA    6      5.4   348  1.58   1.3   0.6  0.510  0.359    67
     TORRE VECCHIA  6      5.4   348  1.58   1.3   0.6  0.510  0.359    67

   Quelle non sono quattro squadre che si somigliano: sono DUE squadre
   scritte due volte. Sugli stessi semi GASOMETRO e MERCATO VERDE
   giocano dodici partite su dodici identiche su TUTTE E NOVE le voci,
   una per una e non in media, e cosi' SANTA FURIA e TORRE VECCHIA. Lo
   strumento le chiama «gemelle» e ne ha contate 2 coppie sulle 45
   possibili. Il motivo e' in una riga sola di setupPlayers:

     const f2 = G.oppForza ? (52 + G.oppForza*2.2) : 62;
     p.nome=avv[i]; p.vel=f2; p.tiro=f2; p.tecnica=f2; p.tackle=f2;

   Di tutta la scheda di una squadra — nome, due tinte, motivo di
   maglia, forza, stile — la simulazione legge SOLO `forza`, e la
   trasforma in un numero unico dato a tutti e undici gli uomini. Le
   dieci squadre di TOUR_POOL hanno forze 7,5,8,3,9,6,4,6,5,7 — SETTE
   valori distinti su dieci nomi — quindi in campo sono SETTE squadre, e
   tre coppie giocano partite identiche al bit (misurato: GASOMETRO e
   MERCATO VERDE, MOLO 4 e STAZIONE FC, SANTA FURIA e TORRE VECCHIA).

   E la distanza fra la piu' forte e la piu' debole vale il 4,2% di
   velocita' (fatt(71,8) / fatt(58,6) = 1,0309 / 0,9893), che e' meno
   della differenza fra due partite della stessa squadra: la sonda
   stampa una SEPARAZIONE media di 0,99, dove 1,00 vuol dire
   «indistinguibile dal rumore».

   =====================================================================
   LA CURA, in due pezzi che sono la stessa idea.

   PEZZO 1 — LE MANOPOLE SI SDOPPIANO. Il gioco ha gia' la sua tabella
   di manopole: DIFF, tredici voci (react, speed, shotQ, shotFreq,
   shotPow, save, mateSave, passErr, steal, mateSteal, lead, standoff,
   slideP). Erano UNA per partita — DIFF[G.diff] letto dentro aiMove —
   quindi le due squadre in campo giocavano per forza con la stessa
   testa. Adesso sono DUE, una per colore, e la seconda copia e' la
   prima moltiplicata per il carattere della squadra. Cinque numeri:

     attesa   × standoff   quanto lontano si contiene il portatore
     grinta   × slideP     quanto spesso si entra in scivolata
     mira     × shotFreq   e × la LARGHEZZA della zona di tiro
     ordine   / passErr    quanti passaggi escono storti
     linea               dove sta il blocco quando la palla e' lontana

   Non e' un impianto nuovo accanto a quello vecchio: e' lo stesso
   impianto, letto due volte. Costa una moltiplicazione per voce UNA
   VOLTA al fischio d'inizio (l'oggetto si costruisce in startMatch e si
   legge per indice), cioe' zero per fotogramma.

   PEZZO 2 — GLI UNDICI DI UNA SQUADRA CON UN NOME NON SONO UNDICI
   COPIE. Chi non viene dalla rosa nominata riceveva quattro numeri
   UGUALI FRA LORO e uguali per tutti i compagni. Adesso, nelle squadre
   che hanno un carattere, i quattro attributi si spargono attorno allo
   stesso centro lungo due assi — il REPARTO (la punta corre e tira, il
   difensore contrasta) e il NOME (il seme FNV-1a che gia' decide faccia
   e capelli) — e la SOMMA del gruppo non cambia: la forza dichiarata
   resta la forza vera, cambia solo come e' distribuita. L'ampiezza e'
   anch'essa un tratto del carattere (`scarto`): STAZIONE FC,
   «discontinui», ha uomini lontanissimi fra loro; TORRE VECCHIA,
   «vecchi volponi», li ha vicini.

   =====================================================================
   COSA NON SI TOCCA, E PERCHE' — la parte piu' importante di questa
   toppa dopo la misura.

   L'AVVERSARIO ANONIMO RESTA IL METRO. Quando startMatch non riceve
   opts.opp l'avversario si chiama 'CPU' (o 'ROSA' in due giocatori):
   non ha nome, non ha carattere, e le sue manopole restano DIFF[G.diff]
   — la stessa identita' di oggetto, non una copia con moltiplicatori a
   1. Dargli un carattere avrebbe spostato in un colpo solo ogni numero
   scritto nei commenti di questo file, e un metro che si muove non e'
   un metro.

   E QUI STA IL PUNTO CIECO DEI CANCELLI, che va detto perche' e' il
   motivo per cui un difetto vero e' passato. La distinzione non e' fra
   cancelli che toccano il carattere e cancelli che non lo toccano — e'
   fra chi lo tocca per CONTARE e chi lo tocca per PESARE.

   Lo toccano davvero: _q-meta.js chiama t.startTourMatch() e
   startSeasonMatch(), che passano opp da TOUR_POOL. Ma li' controlla
   cose STRUTTURALI — quale schermata si apre, quale taglia, quale
   difficolta', chi ha segnato, se la lavagnetta torna. Tutte domande a
   cui una cura sbilanciata risponde bene lo stesso.

   Non lo toccano dove si pesa. L'unico metro di EQUILIBRIO fra i
   cancelli — il pavimento sulle partite 0-0 alle tre taglie — e i
   righelli di merito passano tutti senza opp:

     _q-meta.js (pavimento 0-0)  t.startMatch(1, 1, { size })
     _eventi.js                  t.startMatch(1, diff, taglia !== 5 ? { size: taglia } : undefined)

   quindi affrontano sempre 'CPU', manopole() torna DIFF[G.diff] e
   formaSquadre esce alla prima riga. Su quel ramo la cura e' identica
   al bit al gioco spedito: quei numeri sono veri E ciechi insieme,
   perche' misurano l'unico avversario che la cura e' scritta per non
   toccare. L'UNICO righello che pesa il carattere e' _sonda-carattere.js,
   ed e' percio' l'unico che misura qualcosa qui — a QUALUNQUE taglia
   gli si chieda, e gli si deve chiedere tutte e tre.

   E NEMMENO IL PEZZO 2 LO TOCCA, e questa NON e' la scelta con cui la
   toppa e' nata: la prima stesura spargeva gli attributi anche a lui,
   ed e' stata bocciata da duecento partite misurate (-9,4% di reti,
   cancello --tre-taglie a 11 contro 11 rosso, 37% contro il 33%
   ammesso). I numeri stanno al punto 5 delle MISURE e la ragione
   accanto alla riga che la esclude, in formaSquadre. La regola che ne
   e' uscita e' una sola, e vale per tutti e due i pezzi: NIENTE
   CARATTERE, NIENTE CAMBIAMENTO.

   DOVE SI INCONTRA IL CARATTERE, contato sulle righe che lo decidono —
   e la prima stesura di questa toppa qui diceva il FALSO. Diceva: «l'11
   contro 11 si gioca SOLO in amichevole, e l'amichevole ha solo
   l'avversario anonimo». Non e' vero, e sono due righe del gioco a
   smentirlo:

     startSeasonMatch  startMatch(1, diff, { tour:true, season:true, opp,
                         size:(SAVE.taglia===7||SAVE.taglia===11)?SAVE.taglia:5 });
     startTourMatch    startMatch(1, TOUR_DIFF[T.round], { tour:true, opp:T.teams[oi],
                         size:(SAVE.taglia===7||SAVE.taglia===11)?SAVE.taglia:5 });

   `opp` esce da S.squadre e da T.teams, che sono TOUR_POOL: quindi opp.n
   E' una chiave di CARATTERE, e la taglia e' quella che il giocatore ha
   scelto. Torneo e Stagione a 7 o a 11 fanno girare la cura INTERA —
   cinque manopole piu' formaSquadre su sei o dieci uomini di movimento
   invece di quattro. L'amichevole con l'avversario anonimo resta il
   metro, ma non e' l'unica partita che esiste.

   PERCHE' LA FRASE FALSA ERA GRAVE ANCHE SENZA UNA REGRESSIONE SOTTO.
   Non diceva soltanto una cosa sbagliata: diceva a chi legge «da qui in
   poi non serve misurare», e infatti nessuno aveva misurato. Le due
   modalita' in cui il giocatore insegue i trofei giravano su un ramo di
   codice che il file dichiarava inesistente. Il costo si e' visto
   appena si e' guardato: PRATI BASSI faceva 2-3 tiri a partita e ZERO
   gol in dodici partite a 11 contro 11 — la stessa bocciatura che
   questa toppa si era gia' data su MOLO 4, ripetuta e non vista perche'
   ogni misura del file era a --taglia 5. La cura sta nella tabella
   CARATTERE (mira 0,85) e i numeri al punto (f) delle MISURE.

   LA REGRESSIONE DI EQUILIBRIO CHE ERA STATA DENUNCIATA QUI, invece,
   NON SI RIPRODUCE, e va scritto perche' nessuno la ricorra: +0,43 con
   t = 3,19 e' un risultato di UN blocco di semi solo. Sullo stesso
   gioco, un secondo blocco indipendente da' -0,09; sul gioco di oggi i
   due blocchi danno -0,079 su 240 partite. Il conto per esteso sta al
   punto 5-bis delle MISURE. Non e' stata curata perche' non c'e'.

   QUELLO CHE RESTA APERTO, e adesso e' circoscritto per davvero: gli
   undici dell'avversario ANONIMO (amichevole, e Torneo/Stagione non lo
   incontrano mai) sono ancora undici copie, perche' senza carattere non
   c'e' spargimento. E dal sesto uomo in su la squadra di CHI GIOCA e'
   fatta di copie anche lei, a tutte le taglie: e' l'asimmetria che
   rende il numero qui sopra piu' ballerino di quanto sembri.

   LA SQUADRA DI CHI GIOCA nemmeno ha carattere: il suo modo di stare in
   campo lo decide un pollice, e meta' delle manopole (standoff, slideP,
   react) l'IA le legge solo per una squadra interamente automatica. I
   suoi primi cinque uomini hanno gia' attributi veri e diversi (la rosa
   che il giocatore cura); dal sesto in su, sulle taglie grandi, sono
   ancora copie della media — stesso gancio, stessa riga futura.

   IL PORTIERE, E QUI LA PRIMA STESURA E' STATA SUPERATA DAI FATTI.
   Diceva: «updateKeeper non legge un solo attributo del giocatore, usa
   DIFF e le costanti GK_*», e su quella frase poggiava l'esclusione dei
   portieri dal pezzo 2 («dare quattro numeri diversi a un uomo che non
   li legge sarebbe una bugia scritta nel salvataggio»). DAL 27 AGOSTO
   NON E' PIU' VERO: _t-portiere.js ha reso vivo RIFLESSI, e updateKeeper
   legge p.tecnica in un posto —

     tentaPresa(p, b, 0.58*fatt(p.tecnica, GK_RIFL_TERRA));

   quanto corpo il portiere tira su quando e' gia' a terra. PRESA
   (p.tackle) invece continua a non essere letta, e le altre due
   nemmeno: la voce [I|alto] «Attributi del portiere che contano
   davvero» resta aperta a meta'.

   I PORTIERI RESTANO FUORI DAL PEZZO 2 LO STESSO, ma per una ragione
   nuova e piu' forte della vecchia: ora che RIFLESSI morde, spargere
   p.tecnica sui portieri delle squadre col carattere sposterebbe la
   percentuale di parate: e' una modifica all'equilibrio, non una
   verniciatura, e va misurata con _sonda-portiere.js — che e' il
   righello giusto per il portiere — invece che infilata dentro una
   toppa sul carattere e misurata con la sonda sbagliata. Chi la
   provera' trovera' la riga gia' pronta: basta togliere il filtro
   p.role!=='gk' in formaSquadre.

   =====================================================================
   LA MISURA DEL DOPO. Vedi in fondo al file, sotto MISURE.

   Cancelli:  node strumenti/collaudo.js --gioco fuori/carattere2.html
              node strumenti/_q-meta.js --tre-taglie --gioco fuori/carattere2.html
   Metri:     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803 --gioco fuori/carattere2.html

   IL METRO CHE CONTA DAVVERO, e va chiesto a TUTTE E TRE le taglie
   perche' Torneo e Stagione le aprono tutte e tre — chiederlo solo alla
   5 e' l'errore che ha lasciato passare PRATI BASSI a zero gol:

     for T in 5 7 11: node strumenti/_sonda-carattere.js --partite 12 \
       --taglia $T --gioco fuori/carattere2.html --json fuori/car$T-dopo.json

   e se il numero che ne esce e' vicino alla soglia, si rifa' con un
   secondo blocco di semi (--seme 20261001) prima di crederci. A taglia
   11 questa revisione ha visto un blocco dare -0,25 e l'altro +0,09.

   uso:  node strumenti/_t-carattere.js --out fuori/carattere2.html
         node strumenti/_t-carattere.js --dentro
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

/* 1 — la tabella del carattere nasce sotto la tabella delle squadre */
{
  nome: '1/12 CARATTERE, CAR_NEUTRO, manopole() e formaSquadre()',
  cerca: `];
/* premi della stagione */
const SEA_WIN=35, SEA_DRAW=15, SEA_TITOLO=600, SEA_PODIO=200;`,
  metti:
`];
/* =====================================================================
   IL CARATTERE DI UNA SQUADRA E' CINQUE NUMERI, NON UNA FRASE.

   Accanto a ognuna delle dieci righe qui sopra c'e' un campo `+'`stile`'+`, ed
   e' una didascalia: si legge in due posti a schermo e nessuna riga di
   simulazione lo apre. Misurato (strumenti/_sonda-carattere.js, 12
   partite per squadra, taglia 5, semi 20260803..814): GASOMETRO e
   MERCATO VERDE — forza 7 tutte e due — giocano partite IDENTICHE AL
   BIT, e cosi' SANTA FURIA e TORRE VECCHIA e MOLO 4 con STAZIONE FC.
   Dieci squadre con SETTE valori distinti di forza erano, in campo,
   sette squadre — tre coppie di gemelle su dieci nomi; la
   SEPARAZIONE fra la piu' alta e la piu' bassa valeva 0,99 volte il
   rumore fra due partite della stessa squadra, cioe' niente.

   Qui la frase diventa cinque moltiplicatori, e ognuno moltiplica una
   manopola CHE ESISTE GIA' nella tabella DIFF. Non si aggiunge un
   secondo impianto accanto al primo: si legge il primo due volte, una
   per colore.

     attesa   × standoff   pressing: 0,3 addosso — 1,6 aspetta
     grinta   × slideP     scivolate: 0,6 mai — 2,0 sempre
     mira     × shotFreq   e × la larghezza della zona di tiro
     ordine   / passErr    1,4 squadra ordinata — 0,6 discontinua
     linea               altezza del blocco: 0,7 basso — 1,25 alto
     scarto              quanto sono diversi fra loro i suoi uomini

   1 = neutro su tutte e sei. I valori sono SCELTI per corrispondere
   alla frase che era gia' scritta accanto alla squadra — non sono
   misurati uno per uno, e non lo pretendono: cio' che e' misurato e'
   che l'insieme SEPARA le dieci squadre, voce per voce, e quel numero
   sta nel commento MISURE di strumenti/_t-carattere.js.

   DUE MANOPOLE SONO GIA' A FONDO CORSA, e chi tara l'undicesima squadra
   deve saperlo prima di girarle credendo che rispondano. Contate, non
   stimate:

     mira, meta' shotFreq — satura quando DIFF.shotFreq*mira supera 1.
       Facile  (0,55): mai, servirebbe mira 1,82
       Normale (0,88): da mira 1,1364 in su — CASE NUOVE 1,20,
                       PONTE ROSSO 1,35, SANTA FURIA 1,15 e
                       MERCATO VERDE 1,30 leggono TUTTE E QUATTRO
                       shotFreq 1,00: quattro squadre su dieci alla
                       difficolta' di serie.
       Duro    (0,96): da mira 1,0417 — sono CINQUE, si aggiunge
                       BORGO ALTO 1,05.

     mira, meta' zona di tiro — satura quando FW*0,40*mira supera il
       tetto fisico. Il rapporto e' 1,0975 a TUTTE E TRE le taglie (il
       tetto e' (860-330)/TIRO_ATTR e TIRO_ATTR scala con 1150/FW, cosi'
       i due termini scalano insieme): 460/505 a 5, 644/707 a 7,
       920/1010 a 11. Quindi le stesse quattro squadre hanno anche la
       zona al tetto. Su Normale, per SANTA FURIA, CASE NUOVE, MERCATO
       VERDE e PONTE ROSSO la mira e' interamente a fondo corsa: 1,15 e
       1,35 sono lo STESSO numero, e cio' che ancora le distingue sono
       le altre quattro manopole.
       Il pavimento FW*0,22 invece non morde mai: servirebbe mira 0,55 e
       la piu' bassa della tabella e' 0,85 — che e' anche il minimo che
       questa toppa si lascia spedire (MIRA_MINIMA, provata in negativo:
       rimettendo 0,70 lo strumento rifiuta). Qui c'era scritto «0,70»,
       cioe' il valore che PRATI BASSI aveva prima di questa passata: un
       commento rimasto indietro rispetto alla riga che descrive, ed e'
       la stessa specie di difetto per cui questa toppa e' stata rivista.

     attesa — su Duro DIFF[2].standoff vale 0, e zero per qualunque
       cosa fa zero: `+'`attesa`'+` e' aritmeticamente MORTA alla difficolta'
       piu' alta. Non e' un caso di scuola: TOUR_DIFF vale [0,1,2],
       quindi il Torneo gioca il suo terzo turno proprio li'.

   Il commento della prima stesura diceva «i tetti sono guardie, non
   tarature». Era falso su quattro squadre su dieci a Normale e cinque
   su dieci a Duro: li' i tetti SONO la taratura.
   ===================================================================== */
const CAR_NEUTRO = { attesa:1, grinta:1, mira:1, ordine:1, linea:1, scarto:1 };
const CARATTERE = {
  /* «gioco fisico, tanti contrasti» */
  'GASOMETRO':    { attesa:0.75, grinta:2.00, mira:1.00, ordine:0.90, linea:1.00, scarto:1.15 },
  /* «palla a terra, ritmo lento»: non entra, non tira da fuori, non sbaglia.
     mira era 0,75 e la squadra spariva dalla partita (0,92 reti fatte
     contro 1,75 subite su 12 partite): 0,85 la tiene prudente senza
     renderla assente. */
  'MOLO 4':       { attesa:1.35, grinta:0.60, mira:0.85, ordine:1.30, linea:0.90, scarto:0.85 },
  /* «pressing alto, non ti fa respirare»: e' l'unica con attesa sotto 0,5 */
  'BORGO ALTO':   { attesa:0.30, grinta:1.40, mira:1.05, ordine:1.00, linea:1.25, scarto:1.00 },
  /* «squadra di ragazzini, corre e basta»: tira sempre e sbaglia tanto */
  'CASE NUOVE':   { attesa:0.60, grinta:1.20, mira:1.20, ordine:0.70, linea:1.10, scarto:1.20 },
  /* «i favoriti: tirano da ovunque» */
  'PONTE ROSSO':  { attesa:0.85, grinta:1.10, mira:1.35, ordine:1.25, linea:1.10, scarto:1.10 },
  /* «ripartenze, aspettano l'errore»: blocco basso e attesa lunga */
  'SANTA FURIA':  { attesa:1.60, grinta:0.90, mira:1.15, ordine:1.05, linea:0.80, scarto:1.00 },
  /* «difesa chiusa, zero rischi»: la piu' bassa e la piu' prudente.
     mira era 0,70 ed era il caso MOLO 4 daccapo, solo peggio — la
     prima stesura aveva bocciato MOLO 4 a 0,75 con la frase «prudente
     e' una cosa, assente un'altra» e poi aveva spedito questa a 0,70
     senza accorgersene. Misurato sul gioco di oggi, tiri e gol della
     squadra, 12 partite per taglia, contro lo spedito:

                    tiri                     gol
       taglia   spedito  0,70   0,85    spedito  0,70   0,85
          5        6,7    2,3    4,4      1,50   0,75   1,08
          7        9,3    2,6    7,2      1,25   0,25   0,83
         11       12,8    2,9    6,1      0,58   0,00   0,25

     A 0,70 la squadra spariva: 2-3 tiri a partita a OGNI taglia, e a 11
     contro 11 ZERO gol in dodici partite. 0,85 la rimette dentro la
     partita restando la piu' prudente delle dieci, ed e' lo stesso
     numero con cui era stato corretto MOLO 4: a taglia 5 fa 1,08 reti,
     cioe' sopra lo 0,92 che era servito a bocciare MOLO 4. */
  'PRATI BASSI':  { attesa:1.45, grinta:0.70, mira:0.85, ordine:1.20, linea:0.70, scarto:0.80 },
  /* «vecchi volponi, gestiscono il tempo»: pochi errori, uomini simili */
  'TORRE VECCHIA':{ attesa:1.20, grinta:0.80, mira:0.85, ordine:1.35, linea:0.95, scarto:0.70 },
  /* «discontinui: o benissimo o malissimo». Lo scarto 1,45 e' il senso
     stesso della frase: i suoi undici sono i piu' diversi fra loro del
     campionato, e l'ordine 0,60 dice che sbagliano il doppio.
     E LO SCARTO NON E' GRATIS, ed e' la scoperta piu' scomoda di questa
     toppa: a somma costante, una squadra LARGA batte una squadra
     STRETTA. Misurato (12 partite per squadra, taglia 5, semi
     20260803..814) con mira 1,20 e grinta 1,30: STAZIONE FC, forza 5,
     usciva con la miglior differenza reti delle dieci (+1,25) davanti a
     PONTE ROSSO forza 9 (+0,58). Il campo premia il migliore piu' di
     quanto punisca il peggiore, quindi allargare la rosa e' un aumento
     di forza travestito da varieta'. Qui si paga togliendo alla stessa
     squadra due manopole d'attacco (mira 1,20 -> 0,95, grinta 1,30 ->
     1,15): resta la squadra piu' disuguale del campionato, senza essere
     anche la piu' forte. Chi aggiungera' un'undicesima squadra con
     scarto alto sappia che deve pagare lo stesso pedaggio. */
  'STAZIONE FC':  { attesa:1.00, grinta:1.15, mira:0.95, ordine:0.60, linea:1.00, scarto:1.45 },
  /* «tiro da fuori come religione» */
  'MERCATO VERDE':{ attesa:1.05, grinta:0.85, mira:1.30, ordine:1.00, linea:1.05, scarto:1.00 },
};
function caratterePer(nome){ return CARATTERE[String(nome||'')] || CAR_NEUTRO; }
/* =====================================================================
   LE MANOPOLE DELLA PARTITA, UNA COPPIA PER COLORE.

   Si costruiscono UNA VOLTA al fischio d'inizio (startMatch) e si
   leggono per indice: il costo per fotogramma e' zero, perche' aiMove
   faceva gia' un accesso a tabella (DIFF[G.diff]) e adesso ne fa un
   altro identico.

   IL RITORNO ANTICIPATO NON E' UN'OTTIMIZZAZIONE, E' UNA GARANZIA.
   Quando la squadra non ha carattere si restituisce D — lo STESSO
   oggetto, non una copia con moltiplicatori a 1 — cosi' l'avversario
   anonimo dell'amichevole e la squadra di chi gioca girano sulla
   tabella di sempre, identica all'indirizzo di memoria. Ogni misura
   presa in questa cartella e' stata presa contro l'avversario anonimo:
   spostarlo avrebbe invalidato in silenzio i numeri scritti nei
   commenti di tutto questo file.

   PERCHE' passErr SI DIVIDE E NON SI MOLTIPLICA: `+'`ordine`'+` e' una virtu' —
   piu' alto, meno errori — e una virtu' che moltiplica un DIFETTO
   andrebbe letta al contrario da chi apre la tabella fra sei mesi.
   ===================================================================== */
function manopole(t){
  const D = DIFF[G.diff];
  const c = (G.car && G.car[t]) || CAR_NEUTRO;
  if(c === CAR_NEUTRO) return D;
  return {
    react:D.react, speed:D.speed, shotQ:D.shotQ, shotPow:D.shotPow,
    save:D.save, mateSave:D.mateSave, steal:D.steal, mateSteal:D.mateSteal, lead:D.lead,
    /* IL TETTO QUI NON E' UNA GUARDIA, E' UNA TARATURA — la prima
       stesura scriveva il contrario. Vero che senza clamp shotFreq 0,96
       per 1,35 farebbe 1,30, cioe' una probabilita' maggiore di uno; ma
       il tetto non si limita a raccogliere l'assurdo, morde su quattro
       squadre su dieci a Normale (mira >= 1,1364) e cinque a Duro
       (>= 1,0417). Chi legge 1,15 e 1,35 nella tabella creda pure che
       siano due numeri diversi: da qui in giu' sono lo stesso. Il conto
       per difficolta' sta accanto alla tabella CARATTERE. */
    shotFreq: clamp(D.shotFreq*c.mira, 0.05, 1),
    passErr:  clamp(D.passErr /c.ordine, 0, 0.60),
    standoff: D.standoff*c.attesa,
    slideP:   clamp(D.slideP  *c.grinta, 0, 0.60),
    /* le due voci che DIFF non ha: sono del carattere e basta, e chi le
       legge deve mettere il proprio 1 di riserva (K.linea||1) perche'
       sulla tabella nuda valgono undefined */
    mira: c.mira, linea: c.linea,
  };
}
/* le manopole di una squadra, con la tabella di sempre come riserva:
   il menu, l'attract-mode e qualunque codice che giri prima del primo
   fischio d'inizio trovano G.knob nullo e leggono DIFF, come prima */
function manopoleDi(t){ return (G.knob && G.knob[t]) || DIFF[G.diff]; }

/* =====================================================================
   GLI UNDICI NON SONO UNDICI COPIE.

   Chi non viene dalla rosa nominata riceveva quattro numeri uguali fra
   loro e uguali per tutti i compagni: undici uomini con lo stesso
   passo, lo stesso tiro e lo stesso piede. Qui i quattro attributi si
   spargono attorno allo stesso centro lungo due assi:

     IL REPARTO  la posizione nel modulo (m.fx, frazione di campo dalla
                 propria porta) dice chi corre e tira e chi contrasta.
     IL NOME     il seme FNV-1a che gia' decide faccia, corporatura e
                 capelli decide anche i quattro dadi: due difensori
                 della stessa linea restano due uomini diversi.

   E LA SOMMA DEL GRUPPO NON CAMBIA — a meno dell'arrotondamento — su
   ognuno dei quattro attributi: i due assi sono CENTRATI sul gruppo
   prima di essere applicati. Una squadra di forza 7 resta una squadra
   di forza 7; cambia come quella forza e' distribuita. Senza questo
   vincolo lo spargimento sarebbe un aumento o un taglio di difficolta'
   mascherato da varieta'.

   AMPIEZZA. 9 punti non e' un gusto: gli attributi della rosa che il
   giocatore cura nascono fra 50 e 75 (nuovaRosa), cioe' in una banda di
   25 punti. Con amp 9 e i pesi qui sotto un uomo si allontana dal
   centro al massimo di 9·(1,1+0,55) = 15 punti, cioe' resta dentro la
   stessa banda in cui vive la sua rosa. Sotto i 5 punti gli effetti
   (fatt: ±12% velocita', ±10% tiro, ±22% contrasto) tornano nel rumore
   e si sarebbe fatto un cambio invisibile.

   I QUATTRO PESI NON SONO UGUALI, ED E' UNA MISURA CHE LI HA MESSI COSI'.
   La prima stesura dava al CONTRASTO lo stesso peso del tiro (±1,1), e
   il risultato e' stato una difesa piu' forte dell'attacco su tutte e
   due le squadre: 100 partite a 5 contro 5, semi 20260803..902, i gol
   nei novanta secondi scendevano da 3,02 a 2,72 (-10%) e i momenti da
   porta al minuto da 4,32 a 3,95 (-8,6%). Il motivo sta in fatt(): il
   contrasto ha ampiezza 0,22, il DOPPIO della velocita' (0,12) e piu'
   del doppio del tiro (0,10). Dare a tutti e tre lo stesso peso in
   PUNTI significa dare al contrasto il doppio del peso in EFFETTO, cioe'
   regalare mezzo gol a partita ai difensori. I pesi qui sotto pareggiano
   l'effetto invece dei punti: 0,90*0,12 = 0,108, 1,10*0,10 = 0,110,
   0,50*0,22 = 0,110.

   I PORTIERI SONO ESCLUSI, e non per svista — ma la ragione e' cambiata
   il 27 agosto e va riscritta. Prima era «updateKeeper non legge un solo
   attributo del giocatore, quindi sarebbe una differenza che il campo
   non puo' mostrare». Adesso RIFLESSI si legge davvero: updateKeeper
   fa 0,58*fatt(p.tecnica, GK_RIFL_TERRA) per decidere quanto corpo il
   portiere tira su da terra. Quindi spargere qui NON sarebbe piu' una
   bugia — sarebbe una modifica all'EQUILIBRIO (la percentuale di
   parate) fatta di straforo dentro una toppa sul carattere e misurata
   con la sonda sbagliata. Si toglie il giorno in cui qualcuno la
   misura con _sonda-portiere.js. PRESA (p.tackle) resta comunque non
   letta.
   ===================================================================== */
const ROSA_SCARTO = 9;
/* il peso del REPARTO: positivo verso la punta, negativo verso la
   difesa. La tecnica non ha reparto — un difensore puo' avere i piedi
   migliori della squadra, e in un campetto succede spesso. */
const PESO_REP  = { vel:0.90, tiro:1.10, tackle:-0.50, tecnica:0 };
/* il peso del DADO DEL NOME: stessa correzione del contrasto, per la
   stessa ragione */
const PESO_DADO = { vel:0.55, tiro:0.60, tackle:0.28,  tecnica:0.60 };
function formaSquadre(mod){
  for(let t=0;t<2;t++){
    const c = (G.car && G.car[t]) || CAR_NEUTRO;
    /* =====================================================================
       NIENTE CARATTERE, NIENTE SPARGIMENTO — e questa riga e' stata
       messa qui da una misura che ha bocciato la versione senza.

       La prima stesura spargeva gli attributi di CHIUNQUE avesse i
       quattro numeri uguali, avversario anonimo compreso. Costo
       misurato, e replicato su DUE blocchi di semi indipendenti da 100
       partite l'uno (5 contro 5, CPU contro CPU, Normale):

                              semi ..0803      semi ..1001
         gol nei 90 s       3,02 -> 2,70     2,81 -> 2,58
         momenti/minuto     4,32 -> 3,94     3,96 -> 3,65
         partite 0-0           7% -> 8%         3% -> 9%

       Sono duecento partite che dicono la stessa cosa nella stessa
       direzione: -9,4% di reti e -8,3% di momenti da porta. E il
       cancello node strumenti/_q-meta.js --tre-taglie, appaiato sugli
       stessi semi, passava da 8/30 a 11/30 partite 0-0 a 11 contro 11,
       cioe' dal 27% al 37% con la soglia a 33: ROSSO.

       E LA COSA CHE SPIEGA LA RIGA: dove il carattere C'E', il conto
       delle reti NON cala. Sulle dieci squadre di quartiere (12 partite
       ciascuna) i gol totali stanno a 2,70 prima e 2,72 dopo. Lo
       spargimento da solo rinforza la difesa piu' dell'attacco — quattro
       attributi con ampiezze diverse (contrasto 0,22 contro tiro 0,10)
       non si compensano — e il carattere, che allarga la zona di tiro e
       muove il pressing, e' cio' che rimette in pari il conto. Separarli
       era il difetto; tenerli insieme e' la cura.

       PROVATO E BOCCIATO PRIMA DI ARRIVARE QUI: dimezzare il peso del
       contrasto (da 1,1 a 0,5) per pareggiare le ampiezze di fatt(). Non
       ha spostato NIENTE: 100 partite, gol 2,72 contro 2,70, momenti
       3,95 contro 3,94. La correzione dei pesi resta perche' e'
       aritmeticamente giusta, ma non e' lei la causa e nessuno la
       riprovi come cura.

       COSA RESTA APERTO, dichiarato: l'undici dell'avversario ANONIMO e'
       ancora fatto di copie, e cosi' la squadra di chi gioca dal sesto
       uomo in su. Si chiude in una riga il giorno in cui l'amichevole
       pesca un avversario vero da TOUR_POOL e lo passa come opts.opp.

       QUI PRIMA C'ERA SCRITTO IL FALSO, e va detto perche' nessuno lo
       riscriva: «l'amichevole, che e' l'unica modalita' dove si gioca a
       11 contro 11». Non e' vero. startTourMatch e startSeasonMatch
       passano una squadra di TOUR_POOL come opp E aprono la taglia
       scelta dal giocatore quando vale 7 o 11, quindi Torneo e Stagione
       fanno girare questa funzione su SEI e su DIECI uomini di
       movimento, non su quattro. Ogni misura della prima stesura era a
       --taglia 5: il percorso piu' battuto del gioco non era stato
       guardato nemmeno una volta.

       E LO SPARGIMENTO SU DIECI UOMINI NON E' LO SPARGIMENTO SU QUATTRO,
       ma il pedaggio non e' quello che ci si aspettava. L'ipotesi era la
       scoperta (c) — «a somma costante una squadra LARGA batte una
       STRETTA» — moltiplicata per il numero di uomini: con la stessa
       ampiezza su 10 invece che su 4, la squadra col carattere avrebbe
       dovuto guadagnare a 11 contro 11. MISURATO, E NON E' COSI' sul
       gioco di oggi: spegnendo del tutto questa funzione a 11 contro 11
       il delta appaiato della differenza reti passa da -0,250 a -0,242
       su 120 partite appaiate. Lo spargimento vale OTTO MILLESIMI di
       gol: qualunque riscalatura dell'ampiezza puo' solo muoversi
       dentro quegli otto millesimi. Percio' l'ampiezza resta com'e' — la
       cura proposta (amp * sqrt(4/g.length)) e' stata provata sulla
       carta e scartata sui numeri, non dimenticata. Il punto 5 (e)
       delle MISURE tiene il conto.
       ===================================================================== */
    if(c === CAR_NEUTRO) continue;
    const g=[];
    for(const p of G.players) if(p.team===t && p.piatto && p.role!=='gk') g.push(p);
    if(g.length<2) continue;
    const amp = ROSA_SCARTO * c.scarto;
    /* l'asse del REPARTO, centrato sul gruppo e normalizzato a ±1 */
    let sa=0; for(const p of g) sa += mod[p.idx].fx;
    const am=sa/g.length;
    let dm=0; for(const p of g) dm=Math.max(dm, Math.abs(mod[p.idx].fx-am));
    /* i quattro dadi del NOME, anch'essi centrati sul gruppo */
    const J=[[],[],[],[]];
    for(const p of g){
      const s=semeNome(p.nome || ('X'+t+'.'+p.idx));
      for(let k=0;k<4;k++) J[k].push(((((s>>>(k*7))&255)/255)-0.5)*2);
    }
    for(let k=0;k<4;k++){
      let m=0; for(const v of J[k]) m+=v; m/=g.length;
      for(let i=0;i<g.length;i++) J[k][i]-=m;
    }
    for(let i=0;i<g.length;i++){
      const p=g[i];
      const u = dm>1e-9 ? (mod[p.idx].fx-am)/dm : 0;
      /* i quattro partono dallo stesso numero: e' proprio la condizione
         che rende questi uomini dei cloni, ed e' percio' l'unico caso in
         cui questa funzione viene chiamata (p.piatto) */
      const b=p.vel;
      p.vel    = clamp(Math.round(b+amp*(PESO_REP.vel    *u + PESO_DADO.vel    *J[0][i])), 30, 95);
      p.tiro   = clamp(Math.round(b+amp*(PESO_REP.tiro   *u + PESO_DADO.tiro   *J[1][i])), 30, 95);
      p.tackle = clamp(Math.round(b+amp*(PESO_REP.tackle *u + PESO_DADO.tackle *J[2][i])), 30, 95);
      p.tecnica= clamp(Math.round(b+amp*(PESO_REP.tecnica*u + PESO_DADO.tecnica*J[3][i])), 30, 95);
    }
  }
}
/* premi della stagione */
const SEA_WIN=35, SEA_DRAW=15, SEA_TITOLO=600, SEA_PODIO=200;`,
},

/* 2 — i due campi nello stato di gioco, cosi' non sono mai undefined */
{
  nome: '2/12 G.car e G.knob dichiarati nello stato',
  cerca: `  teamName:'DOPOLAVORO', oppName:'CPU',
  matchCtx:'friendly', // friendly | tour`,
  metti: `  teamName:'DOPOLAVORO', oppName:'CPU',
  /* IL CARATTERE DELLE DUE SQUADRE e le manopole che ne escono. Nascono
     nulli e li riempie startMatch: fuori dalla partita — menu,
     attract-mode, qualunque cosa giri prima del primo fischio —
     manopoleDi() ripiega su DIFF, cioe' su come e' sempre stato. */
  car:null, knob:null,
  matchCtx:'friendly', // friendly | tour`,
},

/* 3 — il carattere si sceglie al fischio d'inizio, PRIMA di setupPlayers
       (che lo legge per spargere gli attributi) */
{
  nome: '3/12 startMatch sceglie il carattere e costruisce le manopole',
  cerca: `  G.oppForza = opts.opp && opts.opp.forza ? opts.opp.forza : 5;
  if(opts.opp){ G.oppName=String(opts.opp.n||'CPU'); TEAMCOL[1]=opts.opp.c1; TEAMCOL2[1]=opts.opp.c2; TEAMPAT[1]=opts.opp.pat|0; }
  else { G.oppName = G.mode===2?'ROSA':'CPU'; TEAMCOL[1]=ROSA_KIT; TEAMCOL2[1]='#cf3e6b'; TEAMPAT[1]=2; }`,
  metti: `  G.oppForza = opts.opp && opts.opp.forza ? opts.opp.forza : 5;
  if(opts.opp){ G.oppName=String(opts.opp.n||'CPU'); TEAMCOL[1]=opts.opp.c1; TEAMCOL2[1]=opts.opp.c2; TEAMPAT[1]=opts.opp.pat|0; }
  else { G.oppName = G.mode===2?'ROSA':'CPU'; TEAMCOL[1]=ROSA_KIT; TEAMCOL2[1]='#cf3e6b'; TEAMPAT[1]=2; }
  /* =====================================================================
     IL CARATTERE DELLE DUE SQUADRE, deciso qui e valido per tutta la
     partita. Sta PRIMA di setupPlayers perche' setupPlayers lo legge
     (formaSquadre sparge gli attributi con l'ampiezza del carattere).

     LA SQUADRA DI CHI GIOCA NON HA CARATTERE, e non e' una dimenticanza:
     il suo modo di stare in campo lo decide un pollice, e meta' delle
     manopole (standoff, slideP, react) l'IA le legge solo per una
     squadra interamente automatica. Darle una tabella significherebbe
     scrivere un carattere che meta' delle volte non si applica.

     L'AVVERSARIO ANONIMO NEMMENO, e questa e' una scelta dichiarata:
     'CPU' e 'ROSA' non compaiono in CARATTERE, quindi caratterePer
     torna CAR_NEUTRO, quindi manopole() restituisce DIFF[G.diff] —
     lo stesso oggetto — e la partita gira sulla tabella di sempre. E'
     il metro contro cui e' stata presa ogni misura di questa cartella.
     PER UN REGISTRO DEI FATTI, se qualcuno lo scrivera' — e NON e' il
     registro dei comandi, che e' un'altra cosa ed e' gia' nel gioco:
     quello annota i tocchi del pollice per rigiocare la partita, questo
     annoterebbe cosa e' successo e perche'. Il punto in cui emettere il
     fatto di apertura sarebbe qui, e sarebbe
     {quando: 0, che cosa: 'carattere', chi: G.oppName, dove: null,
     esito: G.car[1]} — cioe' i cinque numeri con cui la squadra scende
     in campo. E' il fatto che rende leggibile tutto quello che segue:
     senza di lui, una partita con dodici scivolate e una con due si
     assomigliano nel registro. Non se ne costruisce uno qui: si lascia
     detto dove va agganciato.
     ===================================================================== */
  G.car = [CAR_NEUTRO, caratterePer(G.oppName)];
  G.knob = [manopole(0), manopole(1)];`,
},

/* 4 — l'IA legge le manopole della SUA squadra */
{
  nome: '4/12 aiMove legge le manopole della propria squadra',
  cerca: `function aiMove(p,dt){
  const D=DIFF[G.diff];
  const b=G.ball;`,
  metti: `function aiMove(p,dt){
  /* LE MANOPOLE SONO DELLA SQUADRA, NON DELLA PARTITA. Questa riga era
     `+'`const D=DIFF[G.diff]`'+`, cioe' la stessa testa per tutti e ventidue gli
     uomini in campo: due squadre non potevano giocare in due modi
     diversi nemmeno volendo. D scende poi in aiDecide e in aiCarrier
     come argomento, quindi cambiare qui cambia tutto il ramo. */
  const D=manopoleDi(p.team);
  const b=G.ball;`,
},

/* 5 — la zona di tiro conosce chi tira */
{
  nome: '5/12 zonaTiro conosce la squadra che tira',
  cerca: `function zonaTiro(x, y, opGoalX){
  return Math.abs(opGoalX-x) < Math.min(FW*0.40, (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR)
      && Math.abs(y-FH/2) < FH*0.40;
}`,
  metti: `/* IL QUARTO ARGOMENTO E' LA SQUADRA, e senza di lui «tirano da ovunque»
   sarebbe rimasta una frase. Il carattere `+'`mira`'+` allarga o stringe la sola
   banda ORIZZONTALE; la fascia verticale non si tocca, perche' da lassu'
   la porta non si vede e non e' una questione di coraggio.
   IL TETTO FISICO RESTA IL PADRONE. La seconda voce del Math.min di
   prima — (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR — e' la distanza massima
   da cui un tiro puo' ancora PRESENTARSI in porta a 330 unita' al
   secondo: 505 a 5 contro 5, 707 a 7, 1010 a 11. Nessun carattere puo'
   superarla, perche' oltre quella riga non si tira da lontano, si regala
   il pallone. A 5 contro 5 FW*0,40 vale 460 e il tetto 505: chi ha mira
   alta guadagna quelle 45 unita' e non una di piu'.
   E C'E' ANCHE UN PAVIMENTO, FW*0,22, perche' una squadra che non tira
   MAI non e' prudente, e' assente.
   Senza il quarto argomento la funzione torna esattamente la riga di
   prima: mira 1 da' FW*0,40, che e' il valore che c'era. */
function zonaTiro(x, y, opGoalX, team){
  const m = team===undefined ? 1 : (manopoleDi(team).mira || 1);
  return Math.abs(opGoalX-x) < clamp(FW*0.40*m, FW*0.22, (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR)
      && Math.abs(y-FH/2) < FH*0.40;
}`,
},

/* 6, 7, 8 — i tre posti che la chiamano passano la squadra. Il tiro e il
   cross DEVONO leggere la stessa zona, se no «il cross non ruba il tiro»
   smette di essere vero: la condizione del cross e' la negazione esatta
   di quella del tiro, e una negazione esatta di due zone diverse non e'
   una negazione. */
{
  nome: '6/12 il colpo di testa legge la zona della sua squadra',
  cerca: `  const inZona=zonaTiro(q.x, q.y, gx);`,
  metti: `  const inZona=zonaTiro(q.x, q.y, gx, t);`,
},
{
  nome: '7/12 il cross legge la zona della sua squadra',
  cerca: `  if(p.kickCd<=0 && !zonaTiro(p.x, p.y, opGoalX) && crossCPU(p, opGoalX)){`,
  metti: `  if(p.kickCd<=0 && !zonaTiro(p.x, p.y, opGoalX, p.team) && crossCPU(p, opGoalX)){`,
},
{
  nome: '8/12 il tiro legge la zona della sua squadra',
  cerca: `  const inRange = zonaTiro(p.x, p.y, opGoalX);`,
  metti: `  const inRange = zonaTiro(p.x, p.y, opGoalX, p.team);`,
},

/* 9 — l'altezza della linea: dove sta l'ultimo uomo quando la palla e'
       lontana. E' il primo dei due posti in cui `linea` morde. */
{
  nome: '9/12 l\'ultimo uomo tiene la linea del suo carattere',
  cerca: `    const near=ballNearOurGoal;
    const gx = myGoalX===0 ? (near?26:92) : (near?FW-26:FW-92);`,
  metti: `    const near=ballNearOurGoal;
    /* L'ALTEZZA DELLA LINEA (carattere `+'`linea`'+`), e vale SOLO col pallone
       lontano: alzare la linea vuol dire stare alti quando il pericolo
       e' lontano, non quando ce l'hai in area. Col pallone addosso alla
       propria porta le 26 unita' restano 26 per tutti, che e' la
       differenza fra una linea alta e un errore.
       Il fattore 2,2 amplifica: linea 1,25 (BORGO ALTO) porta l'ultimo
       uomo da 92 a 143 unita' dalla riga, linea 0,70 (PRATI BASSI) a 31.
       Con linea 1 il conto e' 92*(1+0) = 92, cioe' il numero di prima. */
    const alto = near ? 26 : clamp(92*(1+((D.linea||1)-1)*2.2), 30, 260);
    const gx = myGoalX===0 ? alto : FW-alto;`,
},

/* 10 — l'altezza della linea, secondo posto: dove si piazza chi copre.
        E' il ramo in cui vive la maggior parte degli uomini per la
        maggior parte del tempo, quindi e' quello che il baricentro di
        squadra misura davvero. */
{
  nome: '10/12 chi copre tiene il blocco all\'altezza del carattere',
  cerca: `      p.aiTX=clamp(cx2*0.55 + anc[0]*0.45, 40, FW-40);
      p.aiTY=clamp(cy2*0.55 + anc[1]*0.45, 40, FH-40);`,
  metti: `      /* IL BLOCCO SI ALZA E SI ABBASSA COL CARATTERE. L'ancora di ruolo
         e' la casella di formazione: spostarla verso la porta avversaria
         alza tutto il reparto senza toccare ne' i ruoli ne' la
         separazione fra compagni. 0,35 del campo per punto di `+'`linea`'+`,
         che pesato 0,45 fa 3,9% di campo per BORGO ALTO (+45 unita' a 5
         contro 5) e -4,7% per PRATI BASSI. Con linea 1 la spinta e' zero
         e la riga e' quella di prima, cifra per cifra. */
      const spinta = ((D.linea||1)-1)*FW*0.35*(myGoalX===0?1:-1);
      p.aiTX=clamp(cx2*0.55 + (anc[0]+spinta)*0.45, 40, FW-40);
      p.aiTY=clamp(cy2*0.55 + anc[1]*0.45, 40, FH-40);`,
},

/* 11 — chi ha gli attributi piatti si marca, e a fine schieramento gli
        attributi si spargono */
{
  nome: '11/12 i giocatori a quattro numeri uguali si marcano',
  cerca: `      }else if(t===0){
        p.nome=casa?casa[i]:''; p.vel=med; p.tiro=med; p.tecnica=med; p.tackle=med;
      }else{
        const f2 = G.oppForza ? (52 + G.oppForza*2.2) : 62;
        p.nome=avv[i]; p.vel=f2; p.tiro=f2; p.tecnica=f2; p.tackle=f2;
      }`,
  metti: `      }else if(t===0){
        /* p.piatto: quattro numeri UGUALI FRA LORO e uguali a quelli di
           tutti i compagni. E' la marca dei cloni, e formaSquadre — piu'
           sotto, a schieramento finito — e' l'unica cosa che la legge. */
        p.nome=casa?casa[i]:''; p.vel=med; p.tiro=med; p.tecnica=med; p.tackle=med; p.piatto=1;
      }else{
        const f2 = G.oppForza ? (52 + G.oppForza*2.2) : 62;
        p.nome=avv[i]; p.vel=f2; p.tiro=f2; p.tecnica=f2; p.tackle=f2; p.piatto=1;
      }`,
},
{
  nome: '12/12 a schieramento finito gli attributi si spargono',
  cerca: `      G.players.push(p);
    }
  }
  /* =====================================================================
     I TRATTI FISICI, E LA GARANZIA CHE DUE COMPAGNI NON SIANO GEMELLI.`,
  metti: `      G.players.push(p);
    }
  }
  /* GLI UNDICI SMETTONO DI ESSERE UNDICI COPIE. Sta QUI e non dentro il
     ciclo perche' gli scarti sono centrati sul GRUPPO — la somma di ogni
     attributo non cambia — e un gruppo si conosce solo quando e'
     completo. I nomi ci sono gia' (li scrive il ciclo qui sopra), e i
     nomi servono: sono il secondo dei due assi dello spargimento. */
  formaSquadre(mod);
  /* =====================================================================
     I TRATTI FISICI, E LA GARANZIA CHE DUE COMPAGNI NON SIANO GEMELLI.`,
},

];

/* =====================================================================
   MISURE — il prima e il dopo, coi comandi che li hanno prodotti.

   RIMISURATO DA CAPO IL 28 AGOSTO 2026, ALLE TRE TAGLIE. La prima
   stesura (27 agosto) aveva misurato tutto a --taglia 5 e dichiarato
   che le taglie grandi non incontravano il carattere: era falso, lo
   spiega il capitolo «DOVE SI INCONTRA IL CARATTERE» in testa al file.
   Nel frattempo il gioco sotto e' cambiato — portiere a quattro esiti,
   colpo di testa, il caso che passa da dado() — e i numeri del 27 non
   valgono piu' nemmeno a taglia 5. Quelli qui sotto sono tutti nuovi,
   sul gioco di oggi (1.983.851 byte, copia curata 2.008.299).

   ---------------------------------------------------------------------
   1. LE DIECI SQUADRE SONO DIECI SQUADRE? (la misura che conta)

     node strumenti/_sonda-carattere.js --partite 12 --taglia 5  [--gioco fuori/carattere2.html]
     node strumenti/_sonda-carattere.js --partite 12 --taglia 7  [--gioco fuori/carattere2.html]
     node strumenti/_sonda-carattere.js --partite 12 --taglia 11 [--gioco fuori/carattere2.html]

   12 partite per squadra, CPU contro CPU, Normale, semi 20260803..814,
   gli stessi semi per tutte e dieci. «Separazione» = scarto fra la
   squadra piu' alta e la piu' bassa diviso il rumore fra partite della
   STESSA squadra: 1,00 vuol dire indistinguibile.

     separazione     taglia 5      taglia 7      taglia 11
                   prima dopo    prima dopo    prima  dopo
     tiri           0,75  2,86    0,58  1,50    0,33   3,36
     distanza tiro  0,71  2,28    1,40  2,22    0,80   3,44
     gol            0,41  1,02    0,61  1,38    0,72   1,05
     scivolate      0,83  2,64    0,95  1,81    1,02   2,12
     falli          1,02  2,17    0,61  1,19    1,30   1,07
     rubate         0,54  1,27    0,84  0,74    0,71   1,08
     possesso       0,86  2,10    1,05  2,08    0,51   1,95
     baricentro     0,90  2,97    0,80  3,75    0,76   6,23
     morso          0,36  1,18    0,73  0,96    0,77   2,16
     MEDIA          0,75  2,06    0,84  1,74    0,77   2,50
     GEMELLI (su 45)   3     0       2     0       2      0

   La cura FUNZIONA A TUTTE E TRE LE TAGLIE, e funziona meglio alla piu'
   grande: a 11 contro 11 la separazione media passa da 0,77 a 2,50, la
   piu' alta delle tre. Le coppie gemelle — squadre che sugli stessi
   semi giocavano partite identiche al bit — vanno a zero ovunque.

   IL CONTO DELLE RETI NON SI GONFIA:
     taglia  5   fatti 1,63 -> 1,77   subiti 1,94 -> 2,12   somma 3,58 -> 3,89
     taglia  7   fatti 1,10 -> 1,32   subiti 1,17 -> 1,38   somma 2,27 -> 2,70
     taglia 11   fatti 0,65 -> 0,57   subiti 0,54 -> 0,68   somma 1,19 -> 1,26
   Le reti totali salgono dell'8% a 5, del 19% a 7, del 6% a 11: la
   varieta' non e' stata comprata con l'inflazione, ma a taglia 7 il
   +19% e' piu' di quanto si vorrebbe e va tenuto d'occhio.

   ---------------------------------------------------------------------
   1-bis. LA SQUADRA COL CARATTERE E' DIVENTATA PIU' FORTE? — la misura
          che la prima stesura non aveva fatto, ed e' la ragione per cui
          esiste questa revisione.

   Il metro e' il DELTA APPAIATO della differenza reti della squadra di
   quartiere: per ogni squadra e ogni seme, (gol fatti - gol subiti)
   dopo meno prima. Zero vuol dire «la cura non ha spostato l'equilibrio».
   120 partite appaiate per blocco.

     taglia 5    -0,033   (t = -0,14)
     taglia 7    +0,017   (t = +0,08)
     taglia 11   -0,217   (t = -1,51)  blocco semi 20260803
                 +0,083   (t = +0,50)  blocco semi 20261001
                 -0,067   (t = -0,60)  i due blocchi insieme, 240 partite

   A 11 contro 11 SERVIVANO DUE BLOCCHI e la regola di casa aveva
   ragione: un blocco solo diceva -0,22 e l'altro +0,08. Insieme fanno
   -0,067 con errore standard 0,111, cioe' NIENTE. L'equilibrio non si
   sposta a nessuna delle tre taglie.

   E LA SCALA DELLE FORZE E' PIU' RISPETTATA DI PRIMA A TUTTE E TRE:
   correlazione fra forza dichiarata (3-9) e differenza reti,
     taglia 5   r -0,006 -> 0,490
     taglia 7   r  0,387 -> 0,476
     taglia 11  r  0,084 -> 0,195  (blocco ..0803)
                r  0,802 -> 0,501  (blocco ..1001)
   Il rovesciamento dei due blocchi a 11 dice cio' che la prima stesura
   diceva gia': su DIECI punti e 12 partite per punto, r e' un numero
   grosso e ballerino. Si legge come «non peggiora», non come un valore.

   ---------------------------------------------------------------------
   2. QUANTO SI E' MOSSO IL GIOCO CHE SI MISURAVA PRIMA: NIENTE.

     node strumenti/_eventi.js --taglia 5  --partite 100 --seme 20260803
     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803
       (una volta sul gioco spedito, una con --gioco fuori/carattere2.html)

   Duecento partite in tutto, RIFATTE IL 28 AGOSTO sul gioco di oggi, e
   il crudo salvato e' IDENTICO EVENTO PER EVENTO fra prima e dopo, a
   tutte e due le taglie. Non «entro il rumore»: identico, confrontato
   partita per partita sul JSON crudo. E' una conseguenza di come e'
   scritta la cura, non una fortuna — l'avversario anonimo non ha
   carattere, manopole() restituisce lo STESSO oggetto DIFF[G.diff],
   zonaTiro con mira 1 da' FW*0,40 come prima, l'altezza della linea con
   linea 1 da' 92 come prima, e formaSquadre esce subito.

   E QUESTA IDENTITA' E' ANCHE IL LIMITE DELLA MISURA, che la prima
   stesura presentava come un trionfo e trionfo non e': _eventi.js non
   passa opp, quindi «identico al bit» qui vuol dire «questo righello
   non tocca la cura». Serve a dimostrare che NON si e' rotto niente di
   quello che si misurava prima — ed e' una garanzia forte, la piu'
   forte possibile — ma non e' una misura della cura. Quella e' al
   punto 1-bis, e ci vuole _sonda-carattere.js.

   ---------------------------------------------------------------------
   3. I CANCELLI (28 agosto 2026, sulla copia fuori/carattere2.html)

     node strumenti/_q-meta.js --tre-taglie --gioco fuori/carattere2.html
       82 controlli, 82 passati, 0 falliti
       5v5   0-0  1/30 =  3%  (soglia <= 40%)
       7v7   0-0  3/30 = 10%  (soglia <= 70%)
       11v11 0-0  9/30 = 30%  (soglia <= 33%)

     node strumenti/collaudo.js --gioco fuori/carattere2.html
       36 controlli, 36 passati, 0 falliti

   E VANNO LETTI SAPENDO COSA NON GUARDANO. Il pavimento sulle 0-0 gira
   con startMatch(1,1,{size}), cioe' contro l'avversario ANONIMO: su
   quel ramo la copia curata e' identica al bit al gioco spedito, quindi
   quei tre numeri sono i numeri dello spedito e non dicono niente sulla
   cura. Sono un cancello anti-regressione, non un metro del carattere.
   Il metro del carattere e' il punto 1-bis, e nessun cancello lo copre.

   ---------------------------------------------------------------------
   4. IL COSTO A FOTOGRAMMA — misura del 27 AGOSTO, NON rifatta il 28.
      Si dichiara invece di lasciarla passare per fresca: la revisione
      del 28 non ha ri-cronometrato niente, perche' il banco (vedi sotto)
      non risolve nulla sotto il 25% e il codice della cura non e'
      cambiato di una riga sul ramo che gira per fotogramma — l'unica
      modifica del 28 e' un numero nella tabella CARATTERE. Chi volesse
      il numero fresco rifaccia il comando con --oggi fuori/carattere2.html.

     node strumenti/prestazione.js --contro CALCETTO-il-gioco.html \
          --oggi fuori/carattere.html --taglia 11 --freno 4
       fotogramma medio 39,9 -> 46,8 ms (+17,3%, ammesso +25%): PASSA,
       ma lo strumento stesso dichiara «non provate: i giri scavalcano
       lo zero».
     node strumenti/prestazione.js --prova-uguale --taglia 11 --freno 4
       lo STESSO file contro se' stesso, stesso banco, stessa mezz'ora:
       -0,1% / +5,4% / +0,1%, coi singoli giri da -12,3% a +24,8%.

   Cioe': il banco di oggi non risolve nulla sotto il 25%, e il +17,3%
   sta dentro il suo rumore. Il numero onesto non viene dal cronometro,
   viene dal codice: contro l'avversario anonimo la simulazione e'
   IDENTICA AL BIT (misura 2), quindi l'unico lavoro in piu' e' una
   chiamata a manopoleDi() al posto di un accesso a DIFF[G.diff] dentro
   aiMove — 22 chiamate per fotogramma a 11 contro 11, minuscole. Anche
   a 5 ns l'una fanno 0,1 µs sui 16.000 µs del fotogramma, cioe'
   0,0007%. Il resto (le manopole, lo spargimento) si paga UNA VOLTA al
   fischio d'inizio.

   UNA PAROLA ERA SBAGLIATA e la si corregge: la prima stesura diceva
   che quelle letture sono «monomorfe». Non lo sono. L'oggetto che
   manopole() costruisce ha 15 proprieta' in ordine diverso dalle 13 di
   DIFF, quindi contro una squadra con carattere le letture di D in
   aiMove, aiDecide e aiCarrier vedono DUE forme e diventano POLIMORFE.
   Non si paga niente di misurabile — due forme restano nel caso veloce
   della cache in linea — ma «monomorfe» era una parola messa li' senza
   contarla.

   ---------------------------------------------------------------------
   5. QUELLO CHE NON HA FUNZIONATO, coi numeri, perche' nessuno lo
      riprovi.

      LE DATE CONTANO: (a)-(d) sono del 27 agosto, sul gioco di allora e
      tutti a taglia 5, e NON sono stati rifatti — restano validi come
      bocciature (dicono «questa strada e' stata provata e costa»), non
      come numeri di oggi. (e) e (f) sono del 28 agosto, sul gioco di
      oggi, e (f) e' alle tre taglie con due blocchi di semi a 11.

   (a) SPARGERE GLI ATTRIBUTI ANCHE ALL'AVVERSARIO ANONIMO. Bocciata.
       Due blocchi indipendenti da 100 partite (5 contro 5, semi ..0803 e
       ..1001): gol 3,02 -> 2,70 e 2,81 -> 2,58; momenti da porta al
       minuto 4,32 -> 3,94 e 3,96 -> 3,65. Duecento partite, stessa
       direzione: -9,4% di reti, -8,3% di momenti. E il cancello
       --tre-taglie a 11 contro 11 passava da 8/30 a 11/30 partite 0-0,
       cioe' dal 27% al 37% con la soglia a 33: ROSSO. Il perche' e'
       scritto accanto alla riga che la esclude, in formaSquadre.

   (b) DIMEZZARE IL PESO DEL CONTRASTO per pareggiare le ampiezze di
       fatt() (contrasto 0,22 contro tiro 0,10 e velocita' 0,12) come
       CURA del calo di reti del punto (a). Bocciata: 100 partite, gol
       2,72 con peso 1,1 contro 2,70 con peso 0,5, momenti 3,95 contro
       3,94. Non ha spostato niente e non e' lei la causa. La correzione
       dei pesi e' rimasta perche' e' aritmeticamente giusta — pareggia
       l'EFFETTO invece dei PUNTI — non perche' curi qualcosa.

   (c) STAZIONE FC con mira 1,20 e grinta 1,30. Bocciata sui numeri:
       forza 5, e usciva con la MIGLIOR differenza reti delle dieci
       (+1,25) davanti a PONTE ROSSO forza 9 (+0,58), portando la
       correlazione forza/differenza a 0,607 invece di 0,810. Lo scarto
       largo (1,45) e' di per se' un aumento di forza: il campo premia il
       migliore piu' di quanto punisca il peggiore. Corretta a mira 0,95
       e grinta 1,15.

   (d) MOLO 4 con mira 0,75. Bocciata: 0,92 reti fatte contro 1,75
       subite, 2 vittorie su 12. Prudente e' una cosa, assente un'altra.
       Corretta a 0,85. — E POI LA STESSA BOCCIATURA E' STATA IGNORATA
       DUE RIGHE PIU' SOTTO: PRATI BASSI e' stata spedita a mira 0,70,
       cioe' PIU' bassa del valore appena bocciato. Vedi (f).

   (e) SCALARE L'AMPIEZZA DELLO SPARGIMENTO COL NUMERO DI UOMINI —
       amp * sqrt(4/g.length), che vale 1 a taglia 5 e 0,63 a taglia 11.
       E' il rimedio che la revisione avversaria proponeva come «la cura
       vera», sull'ipotesi che il pedaggio della scoperta (c) crescesse
       col numero di uomini sparsi (4 a taglia 5, 10 a taglia 11).
       BOCCIATA PERCHE' NON C'E' NIENTE DA CURARE, e non serve provare
       nessun esponente per saperlo: basta misurare l'ESTREMO. Spegnendo
       formaSquadre DEL TUTTO a 11 contro 11 — che a quella taglia e'
       anche il rimedio minimo «esci se g.length > 4» — il delta
       appaiato della differenza reti passa da -0,250 a -0,242 su 120
       partite appaiate. Lo spargimento intero vale OTTO MILLESIMI di
       gol, e qualunque riscalatura dell'ampiezza puo' solo cadere fra
       quei due numeri. Costruire una manopola nuova per spartirsi otto
       millesimi sarebbe stato aggiungere codice non misurabile.

       Come rifarla: si prende la copia curata e si sostituisce la riga
         "\n  formaSquadre(mod);"
       con
         "\n  void(mod);"
       (una riga, nessun dado( toccato, quindi il confronto resta
       appaiato seme per seme), poi

         node strumenti/_sonda-carattere.js --partite 12 --taglia 11 \
              --gioco fuori/soloknob.html --json fuori/soloknob11.json

   (f) PRATI BASSI a mira 0,70: bocciata, e questa e' l'unica cura di
       equilibrio che questa revisione ha davvero applicato. I numeri
       stanno accanto alla riga, nella tabella CARATTERE. In breve: 2-3
       tiri a partita a tutte e tre le taglie e ZERO gol in dodici
       partite a 11 contro 11 — la bocciatura (d) alla lettera, sfuggita
       perche' nessuno aveva guardato oltre la taglia 5. Corretta a
       0,85, replicata su due blocchi di semi a taglia 11 (tiri 2,9 ->
       6,1 e 2,0 -> 6,7; gol 0,00 -> 0,25 e 0,17 -> 0,33).

   ---------------------------------------------------------------------
   5-bis. LA REGRESSIONE CHE LA REVISIONE AVVERSARIA AVEVA MISURATO, E
          PERCHE' NON E' STATA «CURATA»: NON SI RIPRODUCE.

   L'accusa era precisa e citava un numero forte: a 11 contro 11 la
   squadra col carattere passa da sfavorita a favorita, delta appaiato
   della differenza reti +0,43 con t = 3,19 su 120 partite, e la
   correlazione forza/risultato che si rovescia da 0,874 a 0,595.
   Il primo passo e' stato riprodurlo, e si riproduce: con lo strumento
   dell'autore e i file della revisione (fuori/car11-prima.json e
   car11-dopo.json) escono +0,425 e t = 3,19, cifra per cifra.

   Il secondo passo e' stato chiedergli un SECONDO BLOCCO DI SEMI, che
   e' la regola di casa quando una misura decide qualcosa. Perche' il
   confronto sia lo stesso confronto e non un altro, tutti e due i capi
   della coppia sono stati VERIFICATI prima di usarli: il gioco spedito
   di allora (git show HEAD:CALCETTO-il-gioco.html, 1.938.699 byte)
   riproduce car11-prima.json partita per partita, e la copia curata di
   allora (fuori/rifiuto-carattere.html) riproduce car11-dopo.json
   partita per partita. Sono gli stessi due file, non due file simili.
   Su quella coppia:

     blocco semi 20260803   +0,425   (t = +3,19)   <- quello della revisione
     blocco semi 20261001   -0,092   (t = -0,67)
     i due insieme, 240 partite   +0,167   (t = 1,73)

   Il segno si rovescia. E si rovesciano con lui tutte e due le frasi
   che la revisione aveva costruito sopra: sul blocco ..1001 la
   differenza reti va da +0,03 a -0,07 (nessun passaggio da sfavorita a
   favorita) e la correlazione va da -0,067 a 0,300, cioe' MIGLIORA
   invece di rovesciarsi. Un blocco solo su dieci squadre, con r
   calcolato su dieci punti, produce t = 3,19 senza che ci sia niente
   sotto: e' esattamente il caso che la regola dei due blocchi esiste
   per intercettare.

   Il terzo passo e' stato rimisurare sul gioco DI OGGI, dove nel
   frattempo il portiere ha quattro esiti, il colpo di testa esiste e il
   caso passa da dado(). A 11 contro 11 i tiri per squadra sono passati
   da ~6,5 a ~12 e i gol da 0,45 a 0,65: sotto la cura c'e' un altro
   gioco. Delta appaiato della differenza reti, di nuovo due blocchi:

     blocco semi 20260803   -0,250   (t = -1,67)
     blocco semi 20261001   +0,092   (t = +0,54)
     i due insieme, 240 partite   -0,079   (t = -0,70)

   CONCLUSIONE, detta come va detta: la dichiarazione falsa era falsa e
   andava tolta — quello e' un fatto di codice, non di statistica, e la
   revisione aveva ragione piena. La regressione che quella
   dichiarazione avrebbe dovuto nascondere, invece, non e' mai stata
   stabilita: un blocco solo la vedeva, due no. Non e' stata «curata»
   perche' non c'era niente da curare, e inventarle una cura avrebbe
   voluto dire aggiungere una manopola per inseguire del rumore.
   Cio' che il sospetto ha fatto trovare guardando finalmente le taglie
   grandi e' un difetto vero e diverso — PRATI BASSI assente, punto (f)
   — e quello e' stato chiuso.

   ---------------------------------------------------------------------
   6. UNA COSA CHE QUESTA MISURA HA SCOPERTO E CHE NON E' DI QUESTA
      TOPPA: IN CALCETTO STARE INDIETRO NON PAGA.

   PRATI BASSI — «difesa chiusa, zero rischi», attesa 1,45 e linea 0,70,
   cioe' il blocco piu' basso e l'attesa piu' lunga del campionato — con
   il carattere subisce PIU' reti di prima, non meno. Rimisurato alle
   tre taglie il 28 agosto, gol SUBITI dalla squadra:

     taglia  5   1,92 -> 2,58   (+34%)
     taglia  7   1,33 -> 1,33   (invariato)
     taglia 11   0,75 -> 0,92   (+23%)

   Vale a 5 e a 11, non a 7: si scrive com'e' invece di fare una media
   che nasconde il buco in mezzo. La sua frase e la sua difesa non
   tornano, e la colpa non e' del numero:
   e' che questo gioco assegna UN SOLO pressatore per squadra (piu'
   l'ultimo uomo, piu' il raddoppio dalla taglia 7), quindi alzare
   standoff non compatta niente — regala spazio al portatore e non lo
   toglie a nessun altro. Una difesa bassa che funzioni ha bisogno di una
   LINEA vera, cioe' di piu' uomini che tengano una riga insieme: e' la
   voce [D|medio] «Linea difensiva e trappola del fuorigioco» di
   _analisi/confronto-fcmobile/differenze.json, ed e' un lavoro suo, non
   una manopola.
   ===================================================================== */

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-carattere.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.carattere.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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

/* GLI ATTESI. Le righe sul conto dei sorteggi sono le piu' importanti di
   tutto lo strumento: la regola della casa dice che quel conto non deve
   cambiare, perche' i banchi a seme fisso si sfasano e i confronti
   appaiati diventano bugie. Questa toppa non aggiunge e non toglie un
   solo sorteggio — moltiplica soglie gia' confrontate — e qui lo si
   VERIFICA invece di dirlo. */
const attesi = [
  ['const CARATTERE = {', 1],
  ['function manopole(t){', 1],
  ['function manopoleDi(t){', 1],
  ['function formaSquadre(mod){', 1],
  ['  const D=manopoleDi(p.team);', 1],
  ['function zonaTiro(x, y, opGoalX, team){', 1],
  ['zonaTiro(x, y, opGoalX)', 0],                 // la firma a tre argomenti e' sparita
  ['zonaTiro(q.x, q.y, gx, t)', 1],
  ['zonaTiro(p.x, p.y, opGoalX, p.team)', 2],     // il cross e il tiro
  ['G.car = [CAR_NEUTRO, caratterePer(G.oppName)];', 1],
  ['G.knob = [manopole(0), manopole(1)];', 1],
  ['  formaSquadre(mod);', 1],
  ['p.piatto=1;', 2],
  ['const D=DIFF[G.diff];\n  const b=G.ball;', 0], // aiMove non legge piu' la tabella nuda
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => JSON.stringify(s) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));

/* =====================================================================
   IL CONTO DEI SORTEGGI, contato e non promesso.

   E QUESTA GUARDIA ERA DIVENTATA CIECA SENZA CHE SI VEDESSE. Fino al 27
   agosto contava i Math.random( e andava bene. Poi _t-seme.js ha fatto
   passare tutto il caso da dado(), e nel gioco di oggi di Math.random(
   ne restano CINQUE: quattro dentro dei commenti e uno nella riga di
   ripiego di dado() stesso. La riga qui sotto non era cambiata di un
   carattere e continuava a stampare «5 prima, 5 dopo, regola
   rispettata» — cioe' confrontava due numeri che questa toppa non puo'
   toccare nemmeno volendo. Una guardia che non puo' fallire non e' una
   guardia.

   Adesso si contano i dado(, e si PRETENDE che ce ne siano tanti: se
   domani il caso cambiasse porta un'altra volta, il minimo qui sotto
   fa fallire lo strumento invece di lasciarlo passare a mani vuote. I
   Math.random( si continuano a contare come secondo giro di chiave.
   ===================================================================== */
const conta = (s, re) => (s.match(re) || []).length;
const SORTEGGI_MINIMI = 40;                 // oggi ne ha 86: il margine e' largo apposta

/* PRIMA ANCORA DEL TOTALE, IL CONTO ANCORAGGIO PER ANCORAGGIO. Il totale
   sul file intero e' una rete a maglie larghe: un sorteggio tolto da un
   punto e rimesso in un altro passerebbe liscio. Qui si chiede a ogni
   sostituzione di non toccarne nemmeno uno, che e' la forma forte della
   regola — e siccome NESSUN ancoraggio di questa toppa contiene un
   dado(, la somma attesa e' zero contro zero, dodici volte. */
for (const a of ANCORE) {
  const c = conta(a.cerca, /dado\(/g), m = conta(a.metti, /dado\(/g);
  if (c !== m) rotti.push('ancoraggio ' + a.nome + ': dado( ' + c + ' -> ' + m +
    ' — la sostituzione sposta un sorteggio');
}

const dPrima = conta(src, /dado\(/g), dDopo = conta(out, /dado\(/g);
const nPrima = conta(src, /Math\.random\(/g), nDopo = conta(out, /Math\.random\(/g);
if (dPrima < SORTEGGI_MINIMI)
  rotti.push('dado(: solo ' + dPrima + ' nel gioco in ingresso (attesi almeno ' + SORTEGGI_MINIMI +
    ') — il caso non passa piu\' da questa porta e la guardia sui sorteggi e\' cieca: va ri-ancorata');
if (dPrima !== dDopo)
  rotti.push('dado(: prima ' + dPrima + ', dopo ' + dDopo + ' — la regola della casa e\' rotta');
if (nPrima !== nDopo)
  rotti.push('Math.random(: prima ' + nPrima + ', dopo ' + nDopo + ' — la regola della casa e\' rotta');

/* le dieci squadre di TOUR_POOL devono avere tutte un carattere: una
   squadra dimenticata tornerebbe in silenzio a CAR_NEUTRO, cioe' al
   difetto che questa toppa chiude, e nessuno se ne accorgerebbe */
const nomiPool = [...out.matchAll(/\{ n:'([^']+)',\s+c1:/g)].map(m => m[1]);
const bloccoCar = out.slice(out.indexOf('const CARATTERE = {'), out.indexOf('function caratterePer'));
const senzaCar = nomiPool.filter(n => bloccoCar.indexOf("'" + n + "':") < 0);
if (nomiPool.length !== 10) rotti.push('TOUR_POOL: attese 10 squadre, trovate ' + nomiPool.length);
if (senzaCar.length) rotti.push('squadre senza carattere: ' + senzaCar.join(', '));

/* =====================================================================
   NESSUNA SQUADRA SOTTO mira 0,85 — la bocciatura (d)/(f) scritta in
   una guardia invece che in un commento.

   Questa toppa ha bocciato MOLO 4 a mira 0,75 («prudente e' una cosa,
   assente un'altra»), ha scritto la bocciatura nel commento, e poi ha
   spedito PRATI BASSI a 0,70 senza che nessuno se ne accorgesse per un
   giorno intero. Un commento non ferma niente. Il numero misurato che
   giustifica la soglia: a 0,70 PRATI BASSI faceva 2-3 tiri a partita a
   tutte e tre le taglie e ZERO gol in dodici partite a 11 contro 11.
   Chi vuole scendere sotto 0,85 rimisuri con _sonda-carattere.js alle
   TRE taglie e sposti questa soglia con i numeri in mano. */
const MIRA_MINIMA = 0.85;
const mireBasse = [...bloccoCar.matchAll(/'([^']+)':\s*\{[^}]*mira:\s*([0-9.]+)/g)]
  .filter(m => parseFloat(m[2]) < MIRA_MINIMA - 1e-9)
  .map(m => m[1] + ' ' + m[2]);
if (mireBasse.length) rotti.push('mira sotto ' + MIRA_MINIMA + ' (bocciatura (d)/(f), la squadra sparisce dalla partita): ' + mireBasse.join(', '));
const nMire = [...bloccoCar.matchAll(/mira:\s*[0-9.]+/g)].length;
if (nMire !== 10) rotti.push('la guardia sulla mira ha letto ' + nMire + ' valori invece di 10: e\' cieca, va ri-ancorata');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    ' + nomiPool.length + ' squadre, tutte con carattere');
console.log('    sorteggi  dado(): ' + dPrima + ' prima, ' + dDopo + ' dopo');
console.log('    Math.random(): ' + nPrima + ' prima, ' + nDopo + ' dopo  (tutti in commento o nel ripiego di dado())');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
