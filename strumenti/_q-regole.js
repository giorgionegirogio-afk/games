/* =====================================================================
   _q-regole.js -- LE REGOLE A LEVA CORTA (voce #107, compito 1).

   IL PERCHE'. Il cantiere #107 porta a codice quattro cure piccole con
   le leve gia' in casa (mandato, _analisi/MAPPA-MANDATO.md area 1; lo
   spec docs/superpowers/specs/2026-09-18-regole-leva-corta-design.md).
   Questo file e' il banco NUOVO che le mette alla prova, sul telaio di
   strumenti/_q-battute.js (voce #87): server locale, seme fisso da
   _posa.js, flag --gioco/--taglia/--seme. Come li', un banco che
   nascesse verde su tutto non avrebbe misurato niente: qui la condanna
   e' il prodotto del compito 1, non un incidente.

   SEI PROVE (nomi vincolanti del piano; le prove 4 e 5 nascono nel
   compito 2, voce #107 -- RETRO-TESTA e RETRO-AVVERSARIO):

     1. RIGORE-DENTRO -- fallo da scivolata DENTRO l'area vera
        (VERNICE.areaProf/areaSemi, letta da t.proporzioni(), la stessa
        tavola che dentroArea() gia' usa altrove nel file -- ramo #86):
        deve aprire il duello (G.scene diventa 'freekick', via
        startFreeKick). E' verde ANCHE sul gioco di oggi -- a x=60 dalla
        porta e y sul centro campo, sia la vecchia fascia
        (zonaCalda=|goalX-p.x|<260) sia l'area vera dicono "dentro":
        e' il CONTROLLO DISCRIMINANTE, non la condanna.
     2. RIGORE-FUORI -- LA CONDANNA. Fallo alla STESSA x=60 (dentro la
        fascia 260 e dentro la profondita' dell'area vera a ogni
        taglia: 173/268/361) ma a y FUORI dalla semilarghezza dell'area
        (areaSemi: 216/288/441 a 5/7/11) -- una divergenza PURA a ogni
        taglia, perche' zonaCalda guarda solo la x mentre l'area vera
        guarda anche la y. Sul gioco di oggi il fallo apre comunque il
        duello (la fascia non vede la y): rossa per costruzione. Dopo
        la cura deve dare punizione rapida (G.scene resta 'play').
     3. RETRO-PRESA -- un compagno passa al portiere COL PIEDE
        (kickBall, l'imbuto vero di ogni calcio -- CALCETTO-il-gioco.
        html ~14493): oggi tentaPresa non legge mai l'ultimo tocco, e
        la presa avviene comunque. Rossa fino al compito 2 (mandato
        SS6.5/App. D, che dara' a b un campo tipo b.tockind scritto da
        kickBall stesso).
     4. RETRO-TESTA -- un compagno CROSSA/RILANCIA DI TESTA verso il
        portiere (colpoDiTesta, CALCETTO-il-gioco.html ~18218): la presa
        con le mani resta lecita, perche' non e' un calcio di piede.
        CONTROLLO DISCRIMINANTE: verde ANCHE sul gioco di oggi (che
        prende tutto senza guardare l'ultimo tocco) e verde dopo la cura
        del compito 2 (che nega solo sul piede di un compagno, mai sulla
        testa) -- prova che la negazione non sia diventata troppo larga.
     5. RETRO-AVVERSARIO -- un AVVERSARIO tocca/passa col piede verso il
        portiere: la presa resta lecita, perche' la regola vale solo sui
        compagni. CONTROLLO DISCRIMINANTE, verde prima e dopo la cura --
        prova che la negazione guardi la SQUADRA dell'ultimo tocco, non
        solo se e' stato un piede.
     6. VANTAGGIO-FISCHIA-SEMPRE -- fallo mentre l'azione dell'attacco
        prosegue (la vittima avanza col pallone): oggi punizioneRapida
        azzera SEMPRE la velocita' del pallone
        (CALCETTO-il-gioco.html, punizioneRapida: "b.vx=0;b.vy=0;
        b.vz=0;", nessuna eccezione) e la stringa 'VANTAGGIO' non esiste
        nel file (grep fatto prima di scrivere questa prova: zero
        occorrenze come banner di gioco). Rossa fino al compito 3.

   RETTIFICA (voce #107, correzione di revisione compito 2, 18 settembre
   2026): il rilievo del revisore ha misurato un caso di mezzo che
   RETRO-PRESA non isolava mai -- un retropassaggio a velocita' 40, quasi
   fermo, che si ferma a distanza P_R+B_R dal portiere per una cinquantina
   di fotogrammi prima che un compagno qualunque lo raggiunga e il gioco
   torni vivo. IL FILE GUADAGNA LA SETTIMA PROVA, il controllo dedicato:
     7. RETRO-FERMO -- CONTROLLO DISCRIMINANTE, nasce verde: non esercita
        codice nuovo, misura il caso di mezzo con tre condanne che
        RETRO-PRESA non copriva -- il portiere non deve mai prendere con
        le mani, il pallone non deve mai attraversarlo (distanza mai
        sotto P_R+B_R, con tolleranza, mentre il regime di negazione e'
        attivo) e il pallone deve tornare vivo entro 5 s, cosi' un fermo
        che non si scioglie mai non passerebbe per una regola sana.

   RETTIFICA (voce #107, compito 3, 18 settembre 2026): la 6.
   VANTAGGIO-FISCHIA-SEMPRE diventa verde (l'azione sostenuta non fischia
   piu', banner VANTAGGIO, nessun duello aperto) e il file guadagna DUE
   prove nuove, con l'ADATTAMENTO DICHIARATO che la nota di registro del
   compito chiedeva di dichiarare (la scena del fallo lontano muove il
   GIOCATORE vittima con vx=-300 una volta sola, non il pallone: lasciata
   a se stessa contro CPU l'azione si scioglie da sola ben prima di
   VANT_T, un difensore ruba palla intorno a 1,6-1,7 s -- non un difetto
   della regola. SOSTIENI_AVANTI tiene l'offeso in corsa e in possesso
   per tutta la finestra, isolando la VALUTAZIONE dalla tenuta dell'IA):
     8. VANTAGGIO-SFUMATO -- la conservazione si perde apposta (il
        pallone passa al colpevole e si teletrasporta a un decoy, lontano
        dal punto del fallo): il fischio ritardato deve tornare al punto
        SALVATO, mai al decoy.
     9. CARD-DIFFERITO -- lo stesso fallo da giallo, ma con l'azione
        sostenuta fino a VANT_T: nessun fischio, il cartellino resta
        pendente; alla prima palla ferma vera (una fascia lunga a campo
        VERO) il giallo arriva e t.disciplina.gialli sale di uno.
   Il file e' adesso a nove prove.

   CORREZIONE DI REVISIONE (voce #107, compito 3, 18 settembre 2026). La
   misura indipendente del revisore (150 partite, taglia 5, contabilita'
   vera sulle finestre) trovava il vantaggio pieno a ZERO su 260 finestre
   e il 93% degli sfumati morto al PRIMO controllo: lo stordimento
   preesistente carrier.recover=0.35 s mangiava la finestra di grazia
   VANT_VALUTA=0.5 s, perche' G.vantaggio.t partiva da zero anche mentre
   il fallito era ancora a terra. F1 (attrezzo
   strumenti/_t-vantaggio-taratura.js) fa partire t da -(carrier.recover)
   invece che da zero: l'accumulo e i due controlli restano invariati, la
   finestra adesso misura MOTO LIBERO. Un secondo rilievo, indipendente:
   la "punizione dal punto" del ramo punizioneRapida reggeva un solo
   fotogramma, perche' il sostituto non era co-locato sul punto salvato e
   la molla del dribbling lo trascinava via appena la fisica ripartiva.
   F3 (stesso attrezzo) co-loca il sostituto sul punto PRIMA della
   battuta, come posaBattuta fa col suo battitore. Il file guadagna una
   decima prova (F4, il controllo che nessuna prova esercitava ancora):
     10. DOGSO-GOL -- fallo da giallo, l'azione prosegue, GOL segnato
         DENTRO la finestra di vantaggio: il gol vale, nessun fischio del
         fallo, il cartellino arriva SOLO alla ripresa dopo la festa
         (niente doppio castigo). Nasce verde per costruzione (la guardia
         di scena in step() esclude 'goal' dalla valutazione del
         vantaggio): una rossa qui sarebbe un bug vero da curare.
   La prova 8 (VANTAGGIO-SFUMATO) guadagna un'ESTENSIONE (F3): la
   distanza dal punto salvato si traccia per 20 fotogrammi dopo il
   fischio, non solo nell'istante del fischio (tolleranza stretta, 25
   unita', molto sotto le 120 generose della prima misura).
   Il file e' adesso a dieci prove.

   CHIUSURA ARBITRALE (voce #107, compito 3, 18 settembre 2026). La
   contabilita' vera dell'arbitro (150 partite CPU-CPU VERO, sonda a
   quadratura) ha inchiodato W1: checkSlideContact (~18352) fischiava
   SUBITO il fallo successivo a un vantaggio gia' CONCESSO per intero,
   perche' controllava solo "if(G.vantaggio)" -- vero anche sul sentinel
   {team:-1,...,card} che VANT_T lascia dietro di se' per portare il
   cartellino pendente fino alla prossima palla ferma (riga 17057). Il
   blocco di valutazione in step() (riga 16980) gia' chiedeva
   G.vantaggio.team>=0: checkSlideContact no. Un fallo su venti (5,0% in
   base, 4,7% sulla correzione di revisione) perdeva cosi' la propria
   finestra. CURA: la stessa guardia, "G.vantaggio && G.vantaggio.
   team>=0". Il file guadagna una undicesima prova, la prova che inchioda
   il bug:
     11. GRAZIA-DOPO-CARD -- un primo fallo da giallo apre il vantaggio,
         l'azione regge fino a VANT_T (VANTAGGIO concesso, il cartellino
         resta pendente nel sentinel team:-1), POI un secondo fallo,
         PRIMA di qualunque palla ferma, DEVE aprire la propria finestra
         (G.vantaggio.team>=0), non fischiare subito. NATA ROSSA sulla
         correzione di revisione (senza W1): il secondo fallo leggeva il
         sentinel come "vantaggio gia' pendente" e fischiava all'istante.
         Verde dopo W1.
   Il file e' adesso a undici prove.

   MICRO-CODA (voce #107, micro-coda del compito 3, 18 settembre 2026).
   La chiusura arbitrale 3b ha lasciato un dubbio dichiarato (i Dubbi del
   suo rapporto): quando G.vantaggio porta il sentinel del cartellino in
   differita ({team:-1,...,card}, parcheggiato dopo un vantaggio concesso
   per intero) e un secondo fallo apre una finestra NUOVA (W1 lo permette,
   giustamente), l'assegnazione che costruisce il nuovo G.vantaggio
   SOVRASCRIVE il sentinel senza mai scaricarlo: il cartellino dovuto del
   PRIMO fallo sparisce in silenzio, mai inflitto. CURA (attrezzo
   strumenti/_t-card-non-si-perde.js): PRIMA di costruire il nuovo G.
   vantaggio, se quello vecchio porta un cartellino pendente (card!=null,
   non la sua verita': un indice puo' essere zero) lo si scarica con
   scaricaCardVantaggio() -- la stessa funzione, nessuna fonte nuova. Il
   file guadagna una dodicesima prova:
     12. CARD-NON-SI-PERDE -- vantaggio concesso per intero con un
         cartellino pendente, POI un secondo fallo che apre la propria
         finestra: il giallo del PRIMO fallo deve essere stato inflitto
         (disciplina di squadra +1) E la finestra nuova deve esistere
         davvero (G.vantaggio.team>=0) -- le due cose insieme, non l'una
         al posto dell'altra. NATA ROSSA sulla chiusura arbitrale 3b
         (832cff2): la finestra nuova si apre gia' (W1), ma il cartellino
         del primo fallo non arriva mai. Verde dopo la cura.
   Il file e' adesso a dodici prove.

   COMPITO 4 (voce #107, 18 settembre 2026): IL NASTRO CONOSCE IL SUO
   MOTORE, e la voce #96 si chiude. MOTORE_V (costante nuova, accanto a
   Reg -- CALCETTO-il-gioco.html, grep MOTORE_V) viaggia nella testa del
   nastro (Reg.serializza/deserializza, attrezzo
   strumenti/_t-nastro-versione.js): un nastro vecchio (senza il campo,
   o con un campo che non combacia) rende Sfida.guarda inaffidabile
   sugli STESSI comandi, perche' le cure dei compiti 1-3 hanno gia'
   cambiato la simulazione. Il file guadagna la tredicesima prova:
     13. NASTRO-VERSIONE -- un nastro ARTEFATTO a versione 0 (il caso
         "nessun campo", cioe' un nastro di prima della voce #107),
         rigiocato via Sfida.guarda con dati finti (Rete.replay
         sostituita, zero rete vera): deve chiudersi SUBITO col
         messaggio a CAUSA VERA ("un'altra versione del motore") e
         ZERO PENALITA' -- nessuna partita avviata (sfidaStato.replay
         resta false), non l'accusa sbagliata "la squadra e' cambiata
         da allora" che chiudiSfida darebbe se la partita fosse lasciata
         correre fino in fondo. Un nastro alla versione CORRENTE (preso
         dal gioco stesso, t.registra()+t.nastro()) deve rigiocare come
         sempre: la partita si avvia (sfidaStato.replay diventa true).
         NATA ROSSA sulla base pre-cura (fuori/r4-base.html, git show
         700f775:...): senza MOTORE_V nel nastro e senza il controllo in
         Sfida.guarda, un nastro a versione 0 passerebbe per buono.
   Il file e' adesso a tredici prove.

   ONDA DI CORREZIONE DELLA REVISIONE FINALE (voce #107, ramo voce-107-
   regole-leva-corta, 18 settembre 2026). La revisione finale del ramo
   ha misurato TRE rilievi (uno CRITICO) e ha chiesto la riscrittura di
   una prova esistente. Il file guadagna TRE prove nuove:
     14. CARD-NON-ATTRAVERSA (I2) -- startMatch non azzerava G.vantaggio:
         un sentinel con un cartellino pendente sopravviveva a una
         partita nuova, e resetKickoff (dentro startMatch stesso) lo
         leggeva con la rosa APPENA rifatta, ammonendo un giocatore
         innocente al fischio d'inizio. CURA: G.vantaggio=null accanto a
         G.rigori=null. NATA ROSSA su b837824.
     15. PALLA-FUORI-IN-FINESTRA (I3) -- setScene scaricava il
         cartellino anche con una finestra ANCORA VIVA (team>=0): una
         palla spedita fuori campo durante la finestra faceva sparire il
         cartellino SENZA fischio ne' punizione (il 5,1% "silenzioso"
         della contabilita' arbitrale del compito 3, mai spiegato
         allora). CURA: pallaFuori intercetta una finestra viva PRIMA di
         costruire la battuta e le da' l'esito SFUMATO vero
         (eseguiSfumato(), estratta dal ramo che viveva inline in
         step()); setScene scarica il cartellino SOLO per il sentinel
         (team<0). NATA ROSSA su b837824.
     16. VANTAGGIO-IN-AREA (I5) -- CONTROLLO DISCRIMINANTE, nasce verde:
         checkSlideContact apre la finestra ANCHE per un fallo dentro
         l'area (nessun dentroArea() sulla riga che apre G.vantaggio);
         un rigore sfumato arriva quindi con un ritardo di 0,85-2,85 s,
         mai un fischio subito. Nessun codice cambiato: mancava solo un
         controllo che lo dichiarasse.
   Il file e' adesso a SEDICI prove.

   RISCRITTURA (I4b): la PROVA 1 (RIGORE-DENTRO) leggeva lo stato
   FINALE al fotogramma 200 ("freekick"), un'asserzione vera allora solo
   per un artefatto del banco -- il SEGUITO #108 (censimento del 18
   settembre 2026: 25 strumenti sotto strumenti/ chiamavano setCpuVsCpu
   PRIMA di startMatch, COMPRESO QUESTO STESSO FILE -- 15 siti a quella
   HEAD, erano 11 quando il censimento fu misurato su b837824: le prove
   14-16 di quella stessa onda ne avevano aggiunti 4) faceva si' che la
   squadra 0 (che difende) restasse "umana" immobile per tutta la prova:
   nessun avversario vero conduceva mai il duello, e lo stato restava
   'freekick' fino al fotogramma 200 per assenza di un difensore, non
   per la regola. L'asserzione fu riscritta come "la scena freekick e'
   stata ATTRAVERSATA" (campionata a ogni fotogramma) proprio per restare
   verde a prescindere da come venisse chiuso #108 su questo file.

   #108 CHIUSO su questo banco (voce #121, compito 1, 19 settembre
   2026): i 15 siti sono stati corretti spostando setCpuVsCpu(true) DOPO
   startMatch (stessa cura su _q-battute.js, 5 siti, li' 11/11 verde).
   La squadra 0 gioca ora da CPU vera in tutte le prove di questo file.
   Applicata la cura, la PROVA 1 si e' scoperta ROSSA una prima volta --
   non per l'hang in freekick del sintomo #108/#119 (il contrario: lo
   stato non attraversava mai 'freekick', la scena finiva dritta in
   'goal'). Causa: con la squadra 0 davvero mobile, il vantaggio in area
   a volte si chiude con un gol della squadra offesa PRIMA che l'arbitro
   fischi il rigore ritardato -- un esito LECITO della regola del
   vantaggio (voce #107, gia' decisa), non un bug. L'asserzione
   "solo freekick attraversata" era troppo stretta: RISCRITTA (vedi il
   commento della PROVA 1 piu' sotto) come "freekick attraversata OPPURE
   gol della squadra offesa nella finestra", verificando DI CHI e' il
   gol (t.score) per restare un controllo discriminante vero e non una
   tautologia. Con la riscrittura, 16/16 verde, letto riga per riga,
   nessuna partita bloccata in freekick. Il vecchio censimento sopra
   (18 settembre 2026, 25 strumenti/15 siti qui) resta per la cronaca
   dello stato PRIMA di questa cura -- non e' piu' lo stato attuale.

   NOTA DICHIARATA (C1, non curata: fuori dal perimetro di questa onda).
   Le prove 6 (VANTAGGIO-FISCHIA-SEMPRE) e 8 (VANTAGGIO-SFUMATO) restano
   ROSSE a taglia 7/11 con questo seme (misurato: taglia 7, entrambe
   rosse; taglia 11, solo la 6). La causa e' un artefatto di SCALA nel
   BANCO, non nella regola: SOSTIENI_AVANTI e SCENA_VANTAGGIO_SFUMATO_
   ESEGUI corrono un numero FISSO di fotogrammi (230/260/FOTOGRAMMI_
   ATTESA) pensato per il kickoff piu' corto (taglia 5); il kickoff vero
   sale a ~1,5 s alle taglie grandi (formation piu' larga da
   raggiungere), e la finestra di vantaggio misura da VANT_VALUTA=0,5s a
   VANT_T~2,867s (F1) DAL MOMENTO in cui il fallito si rialza -- la somma
   dei due margini supera il budget fisso della scena prima che la
   valutazione finale (banner VANTAGGIO o SFUMATO) abbia il tempo di
   comparire. Non tocca checkSlideContact, tentaPresa ne' il blocco di
   valutazione del vantaggio: e' il banco che non allarga il proprio
   orologio con la taglia, dichiarato qui invece di curato (fuori dal
   perimetro dei rilievi C1/I2/I3/I5 di questa onda, che non toccano i
   tempi delle scene 6/8).

   MICRO-ONDA DEL RI-VERDETTO (voce #107, ramo voce-107-regole-leva-corta,
   18 settembre 2026). Il ri-verdetto sulla stessa onda ha misurato che
   eseguiSfumato() (CALCETTO-il-gioco.html, ~18306-18345) azzerava
   owner/x/y/z/vz/vx/vy/curve/perfectT/saveRolled/passTo ma NON b.crossTo
   -- la stessa ferita della lezione hitPosts/crossTo (voce #88): un
   pallone congelato al punto salvato restava "diretto" al destinatario
   di un cross dichiarato PRIMA del fallo, letto dai consumatori veri
   (tentaPresa, il verbo del pollice, la freccia HUD). CURA:
   b.crossTo=-1 accanto a b.passTo=-1. PROVA 15 (PALLA-FUORI-IN-FINESTRA)
   ESTESA: arma t.ball.crossTo=0 PRIMA di spedire la palla fuori,
   verifica t.ball.crossTo===-1 dopo lo sfumato -- CONDANNA misurata sul
   commit senza la cura, VERDE dopo. Nessuna prova nuova: il file resta a
   SEDICI prove.

   ZERO dado() NUOVI. Le scene si scrivono direttamente sullo stato del
   gioco (G.players/G.ball, la stessa tecnica di _q-battute.js) e il
   fallo da scivolata si ottiene con un'entrata DA DIETRO: la vittima
   guarda verso la propria porta d'attacco (carrier.fx=-1,fy=0) e
   l'entrata arriva nella STESSA direzione (slideDX=-1,slideDY=0) --
   checkSlideContact (CALCETTO-il-gioco.html ~18108) manda sempre al
   ramo del fallo quando "daDietro" e' vero
   (p.slideDX*carrier.fx+p.slideDY*carrier.fy > DIETRO_DOT), qualunque
   sia il sorteggio del tackle: non serve pescare dado() per garantire
   il fallo, basta la geometria.

   uso:  node strumenti/_q-regole.js
         node strumenti/_q-regole.js --gioco fuori/r1-base.html
         node strumenti/_q-regole.js --taglia 7 --seme 123
   esce 0 se tutte le prove sono verdi, 1 se almeno una e' rossa,
   2 se il banco stesso e' esploso (pagina, hook mancante, eccezione).
   Il 3 resta riservato (convenzione di _q-battute.js/_q-replay.js) e
   non e' usato da nessuna delle sedici prove di oggi (RETTIFICA, voce
   #107 compito 4: il numero era rimasto scritto "sette" da quando il
   file ne aveva solo sette, senza aggiornarlo alle rette successive --
   corretto allora; salito di nuovo a sedici con l'onda di correzione
   della revisione finale, sopra).
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

const SEME_CANTIERE = 20260918;   // il seme dichiarato della voce #107, default del flag --seme
const TAGLIA_BANCO = +arg('taglia', 5);   // taglia delle scene
const SEME = +arg('seme', SEME_CANTIERE);

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '\n         ' + det : '')); };

/* =====================================================================
   LE SCENE, INIETTATE UNA VOLTA SOLA NELLA PAGINA (window.SCENA_*),
   perche' leggono G/checkSlideContact/kickBall per riferimento bare --
   vivono lato browser, come SCENA_FASCIA/SCENA_FONDO in _q-battute.js.

   SCENA_FALLO(modo): costruisce un fallo da scivolata garantito (entrata
   da dietro, zero dado()) a una x fissa (60 unita' dalla porta che la
   vittima attacca), con la y decisa dal modo:
     'dentro'  -- y sul centro campo: dentro l'area vera E dentro la
                  vecchia fascia a ogni taglia (controllo discriminante).
     'fuori'   -- y a 30 unita' oltre la semilarghezza dell'area vera:
                  ancora dentro la vecchia fascia (x=60<260) ma fuori
                  dall'area vera -- la divergenza pura del compito 1.
     'lontano' -- x al 70% del campo: fuori da fascia E area di
                  ENTRAMBE le porte, per la prova del vantaggio (che non
                  deve dipendere dalla cura del rigore).
   La vittima e' un giocatore di movimento della squadra 1 (attacca la
   porta a x=0); l'autore del fallo e' un giocatore di movimento della
   squadra 0 (difende quella porta). G.stats.falli si azzera qui: il
   cumulo falli (dal terzo in su si tira comunque, MANUALE SS6) non deve
   inquinare una misura che vuole isolare la sola decisione dell'area.
   ===================================================================== */
function INIETTA_SCENE() {
  window.SCENA_FALLO = function (modo) {
    const t = window.__test;
    const prop = t.proporzioni();
    const V = prop.VERNICE;
    let x, y;
    if (modo === 'lontano') { x = prop.FW * 0.7; y = prop.FH / 2; }
    else {
      x = 60;
      y = modo === 'dentro' ? prop.FH / 2 : (prop.FH / 2 - V.areaSemi - 30);
    }
    const vittima = t.players.find(p => p.team === 1 && p.role !== 'gk');
    const tackler = t.players.find(p => p.team === 0 && p.role !== 'gk');
    if (!vittima || !tackler) return { errore: 'giocatori non trovati (team 1/team 0 di movimento)' };
    const vi = t.players.indexOf(vittima), ti = t.players.indexOf(tackler);
    Object.assign(vittima, {
      x, y, fx: -1, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0,
    });
    Object.assign(tackler, {
      x: x + 6, y, fx: 1, fy: 0, vx: 0, vy: 0,
      slide: 0, slideDX: -1, slideDY: 0, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: vi, x, y, z: 0, vx: 0, vy: 0, vz: 0 });
    G.stats.falli = [0, 0];
    return {
      ok: true, vittimaIdx: vi, tacklerIdx: ti, x, y,
      areaProf: V.areaProf, areaSemi: V.areaSemi, FH: prop.FH, FW: prop.FW,
    };
  };
  /* SCENA_RETROPASSO: un compagno del portiere gli passa la palla COL
     PIEDE, chiamando kickBall -- l'imbuto vero di ogni calcio del
     gioco, non un canale sintetico inventato per il banco. Il compagno
     nasce a 40 unita' dal portiere, sulla sua stessa fascia orizzontale
     (dy=0), e calcia a velocita' 220 (sotto sogliaPresa=330): un
     appoggio lento, la firma del retropassaggio. */
  window.SCENA_RETROPASSO = function () {
    const t = window.__test;
    const gk = t.players.find(p => p.team === 0 && p.role === 'gk');
    const compagno = t.players.find(p => p.team === 0 && p.role !== 'gk');
    if (!gk || !compagno) return { errore: 'portiere o compagno non trovati (squadra 0)' };
    const gi = t.players.indexOf(gk), ci = t.players.indexOf(compagno);
    const dir = gk.x < compagno.x ? -1 : 1;   // verso il portiere, qualunque sia il lato
    Object.assign(compagno, {
      x: gk.x - dir * 40, y: gk.y, fx: dir, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: ci, x: compagno.x, y: compagno.y, z: 0, vx: 0, vy: 0, vz: 0 });
    kickBall(compagno, dir, 0, 220, 0);
    return { ok: true, gkIdx: gi, compagnoIdx: ci };
  };
  /* SCENA_RETROTESTA: un compagno del portiere colpisce di testa,
     chiamando colpoDiTesta -- il gesto vero, non un canale sintetico --
     cosi' b.lastTouch/b.toccoPiede portano la verita' del colpo (falso:
     non e' un piede). colpoDiTesta punta SEMPRE alla porta che la
     squadra ATTACCA (mai alla propria: non accetta una direzione a
     scelta come kickBall), quindi il pallone riparte lontano dal
     portiere -- lo si teletrasporta DOPO, sulla fascia del portiere e
     a velocita' lenta (220, sotto sogliaPresa), la STESSA tecnica di
     teletrasporto gia' usata da SCENA_FALLO: i due bit del tocco restano
     quelli scritti dalla funzione vera, solo la posizione si sposta. */
  window.SCENA_RETROTESTA = function () {
    const t = window.__test;
    const gk = t.players.find(p => p.team === 0 && p.role === 'gk');
    const compagno = t.players.find(p => p.team === 0 && p.role !== 'gk');
    if (!gk || !compagno) return { errore: 'portiere o compagno non trovati (squadra 0)' };
    const gi = t.players.indexOf(gk), ci = t.players.indexOf(compagno);
    Object.assign(compagno, {
      x: t.ball.x, y: t.ball.y, fx: 1, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: -1, x: compagno.x, y: compagno.y, z: 30, vx: 0, vy: 0, vz: 0 });
    colpoDiTesta(compagno, ci, t.ball);   // scrive lastTouch=ci, toccoPiede=false: la verita' del gesto
    const dir = gk.x < compagno.x ? -1 : 1;
    Object.assign(t.ball, { x: gk.x - dir * 40, y: gk.y, z: 0, vx: dir * 220, vy: 0, vz: 0 });
    return { ok: true, gkIdx: gi, compagnoIdx: ci };
  };
  /* SCENA_RETROAVVERSARIO: un giocatore della squadra AVVERSARIA passa
     col piede verso il portiere -- stessa tecnica di SCENA_RETROPASSO
     (kickBall, l'imbuto vero), ma il battitore e' di squadra 1, non 0:
     lastTouch resta di piede (vero) ma di una squadra DIVERSA da quella
     del portiere, il controllo discriminante della regola. */
  window.SCENA_RETROAVVERSARIO = function () {
    const t = window.__test;
    const gk = t.players.find(p => p.team === 0 && p.role === 'gk');
    const avversario = t.players.find(p => p.team === 1 && p.role !== 'gk');
    if (!gk || !avversario) return { errore: 'portiere o avversario non trovati (squadra 1 di movimento)' };
    const gi = t.players.indexOf(gk), ai = t.players.indexOf(avversario);
    const dir = gk.x < avversario.x ? -1 : 1;
    Object.assign(avversario, {
      x: gk.x - dir * 40, y: gk.y, fx: dir, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: ai, x: avversario.x, y: avversario.y, z: 0, vx: 0, vy: 0, vz: 0 });
    kickBall(avversario, dir, 0, 220, 0);
    return { ok: true, gkIdx: gi, avversarioIdx: ai };
  };
  /* SCENA_RETROFERMO (voce #107, correzione di revisione compito 2): il
     retropassaggio QUASI FERMO che il caso RETRO-PRESA non isolava mai --
     lento abbastanza da non essere ne' presa ne' rinvio, un caso di
     mezzo che il rilievo del revisore ha misurato a parte (velocita' 40,
     ben sotto sogliaPresa=330 e sotto anche il rinvio). Il compagno
     calcia DAVVERO (kickBall, l'imbuto vero: lastTouch/toccoPiede sono
     il gesto, non un canale sintetico), poi il pallone si teletrasporta
     -- STESSA TECNICA di SCENA_RETROTESTA -- a portata del portiere,
     ancora alla velocita' dichiarata: a 40 unita'/s l'attrito del campo
     spegnerebbe il pallone entro una ventina di unita' di corsa (misurato:
     lanciato da 60 unita' di distanza si ferma sotto il solo attrito a
     ~44 dal portiere, mai dentro l'ellisse di tentaPresa), e nel
     frattempo un compagno qualunque -- non il portiere -- lo
     raccoglierebbe per conto suo: la scena non arriverebbe mai a
     esercitare il ramo che nega la presa. Il teletrasporto arriva a
     P_R+B_R+9 dal portiere, sulla sua stessa fascia orizzontale: dentro
     il semiasse lungo dell'ellisse (GK_REACH+B_R), fuori dal raggio di
     riposo (P_R+B_R) -- cosi' la prova osserva davvero l'avvicinamento e
     l'arresto, non parte gia' ferma. */
  window.SCENA_RETROFERMO = function () {
    const t = window.__test;
    const gk = t.players.find(p => p.team === 0 && p.role === 'gk');
    const compagno = t.players.find(p => p.team === 0 && p.role !== 'gk');
    if (!gk || !compagno) return { errore: 'portiere o compagno non trovati (squadra 0)' };
    const gi = t.players.indexOf(gk), ci = t.players.indexOf(compagno);
    const dir = gk.x < compagno.x ? -1 : 1;
    Object.assign(compagno, {
      x: gk.x - dir * 40, y: gk.y, fx: dir, fy: 0, vx: 0, vy: 0,
      slide: -1, recover: 0, rove: -1, charge: -1, out: 0, kickCd: 0,
    });
    Object.assign(t.ball, { owner: ci, x: compagno.x, y: compagno.y, z: 0, vx: 0, vy: 0, vz: 0 });
    kickBall(compagno, dir, 0, 40, 0);
    const raggioFermo = P_R + B_R, offerta = raggioFermo + 9;
    Object.assign(t.ball, { x: gk.x - dir * offerta, y: gk.y, z: 0, vx: dir * 40, vy: 0, vz: 0 });
    return { ok: true, gkIdx: gi, compagnoIdx: ci, raggioFermo };
  };
  /* =====================================================================
     IL VANTAGGIO (voce #107, compito 3): tre funzioni nuove.

     SOSTIENI_AVANTI(vittimaIdx, n) -- ADATTAMENTO DICHIARATO della scena
     del fallo (nota di registro del compito: "quella scena muove il
     GIOCATORE vittima con vx=-300, non il pallone"). Misurato PRIMA di
     scrivere questa funzione: lasciata a se stessa (CPU contro CPU, la
     vittima spinta una volta sola) l'azione si scioglie da sola --
     il pallone diventa libero dopo mezzo secondo e un difensore lo ruba
     intorno a 1,6-1,7 s, molto prima di VANT_T=2,5 s. La causa non e'
     un difetto della regola: e' che una spinta UNA VOLTA SOLA non e' un
     giocatore che continua a portare palla. SOSTIENI_AVANTI tiene
     l'offeso in corsa E in possesso per n fotogrammi (owner forzato,
     slide chiuso ogni passo, la stessa lezione gia' applicata alle
     scene di _q-battute per isolare cio' che la prova vuole misurare
     dalla tenuta dell'IA): cosi' la prova isola la VALUTAZIONE del
     vantaggio, non la capacita' di un attaccante di resistere a un
     pressing di CPU per due secondi e mezzo. Zero dado() nuovo: non
     sceglie niente, forza uno stato gia' scelto dal chiamante. */
  window.SOSTIENI_AVANTI = function (vittimaIdx, n) {
    const t = window.__test;
    let vistoVantaggio = false, vistoSfumato = false;
    for (let i = 0; i < n; i++) {
      const v = t.players[vittimaIdx];
      if (v) { v.vx = -300; v.vy = 0; v.slide = -1; }
      t.ball.owner = vittimaIdx;
      t.simulate(1 / 60);
      const ban = t.banner;
      if (ban && ban.text) {
        const up = String(ban.text).toUpperCase();
        if (up.indexOf('SFUMATO') >= 0) vistoSfumato = true;
        else if (up.indexOf('VANTAGGIO') >= 0) vistoVantaggio = true;
      }
    }
    return { vistoVantaggio, vistoSfumato, statoFinale: t.state };
  };
  /* SCENA_VANTAGGIO_SFUMATO_ESEGUI: il fallo lontano da area/fascia di
     SCENA_FALLO('lontano') (niente duello per costruzione: la prova
     isola il vantaggio dalla cura del compito 1), lasciato correre fino
     a quando G.vantaggio si apre davvero (checkSlideContact non gira
     mai durante 'kickoff': la finestra non puo' aprirsi prima che la
     scena sia 'play', quindi si aspetta invece di contare fotogrammi a
     occhio), poi la conservazione si CORROMPE apposta: il pallone passa
     al colpevole (squadraDelPallone() smette di essere la squadra
     offesa) e si teletrasporta lontano dal punto SALVATO -- un decoy,
     apposta per poter distinguere "il fischio ritardato torna al punto
     del fallo" da "il fischio ritardato torna dove sta la palla ora". */
  window.SCENA_VANTAGGIO_SFUMATO_ESEGUI = function (totale) {
    const t = window.__test;
    const s = SCENA_FALLO('lontano');
    if (s.errore) return s;
    let aperto = false;
    for (let i = 0; i < 180 && !aperto; i++) {
      t.simulate(1 / 60);
      if (typeof G !== 'undefined' && G.vantaggio) aperto = true;
    }
    if (!aperto) return { errore: "G.vantaggio non si e' mai aperto entro 3 s" };
    const savedX = G.vantaggio.x, savedY = G.vantaggio.y, savedCard = G.vantaggio.card;
    const decoyX = savedX - 300;
    Object.assign(t.ball, { owner: s.tacklerIdx, x: decoyX, y: savedY, vx: 0, vy: 0, z: 0, vz: 0 });
    /* F3 (correzione di revisione, voce #107 compito 3): "la punizione
       resta sul punto" e' un fatto nel TEMPO, non solo nel fotogramma del
       fischio -- prima della cura il sostituto non era co-locato e la
       molla del dribbling di updateBall lo trascinava via appena la
       fisica ripartiva (misurato dal revisore: ~38 unita' in 0,33 s).
       maxDistPost20 traccia la distanza dal punto SALVATO per i 20
       fotogrammi a partire dal fischio (compreso): deve restare piccola
       per tutta la finestra, non solo scattare bassa un istante e poi
       scappare. */
    let vistoSfumato = false, bxAlFischio = null, byAlFischio = null;
    let contPost = -1, maxDistPost20 = 0;
    for (let i = 0; i < totale; i++) {
      t.simulate(1 / 60);
      const ban = t.banner;
      if (!vistoSfumato && ban && ban.text && String(ban.text).toUpperCase().indexOf('SFUMATO') >= 0) {
        vistoSfumato = true; bxAlFischio = t.ball.x; byAlFischio = t.ball.y;
        contPost = 0;
        maxDistPost20 = Math.hypot(bxAlFischio - savedX, byAlFischio - savedY);
      } else if (contPost >= 0 && contPost < 20) {
        const dd = Math.hypot(t.ball.x - savedX, t.ball.y - savedY);
        if (dd > maxDistPost20) maxDistPost20 = dd;
        contPost++;
      }
    }
    return Object.assign({}, s, { savedX, savedY, savedCard, decoyX, vistoSfumato, bxAlFischio, byAlFischio, maxDistPost20, statoFinale: t.state });
  };
  /* SCENA_CARD_DIFFERITO_ESEGUI: lo stesso fallo cattivo (SCENA_FALLO
     garantisce sempre un'entrata da dietro, sempre cattivo) ma con
     l'azione sostenuta fino a VANT_T (SOSTIENI_AVANTI): il vantaggio
     regge, il cartellino resta pendente. Poi una palla ferma vera --
     il campo VERO (opts.sponde:'campo', dichiarato: di serie la taglia
     5 nasce in gabbia, dove pallaFuori non scatta mai) e il pallone
     teletrasportato fuori da una fascia lunga, lontano dalla luce della
     porta -- chiude la prima palla ferma dopo il vantaggio concesso. */
  window.SCENA_CARD_DIFFERITO_ESEGUI = function (taglia) {
    const t = window.__test;
    const s = SCENA_FALLO('lontano');
    if (s.errore) return s;
    let aperto = false;
    for (let i = 0; i < 180 && !aperto; i++) {
      t.simulate(1 / 60);
      if (typeof G !== 'undefined' && G.vantaggio) aperto = true;
    }
    if (!aperto) return { errore: "G.vantaggio non si e' mai aperto entro 3 s" };
    if (G.vantaggio.card == null) return { errore: 'il fallo scriptato non ha prodotto un cartellino dovuto (card null)' };
    const foulTeam = 1 - G.vantaggio.team;
    const sost = SOSTIENI_AVANTI(s.vittimaIdx, 230);
    if (!sost.vistoVantaggio) return Object.assign({ errore: 'il vantaggio non e\' mai stato concesso entro 230 fotogrammi' }, sost);
    const gialliPrima = t.disciplina.gialli[foulTeam];
    Object.assign(t.ball, { owner: -1, x: -5, y: 20, vx: -80, vy: 0, z: 0, vz: 0 });
    for (let i = 0; i < 10; i++) t.simulate(1 / 60);
    const gialliDopo = t.disciplina.gialli[foulTeam];
    return { ok: true, foulTeam, gialliPrima, gialliDopo, statoDopo: t.state };
  };
  /* SCENA_DOGSO_GOL_ESEGUI (F4, correzione di revisione, voce #107
     compito 3, 18 settembre 2026): il controllo discriminante che
     nessuna prova esercitava ancora -- fallo da giallo, l'azione
     prosegue, GOL segnato DENTRO la finestra di vantaggio. Lo stesso
     fallo di SCENA_FALLO('lontano') (sempre un'entrata da dietro,
     sempre cattivo: un cartellino resta pendente in G.vantaggio.card)
     apre la finestra come sempre. Il gol si costruisce teletrasportando
     la palla appena oltre la linea della porta che la squadra OFFESA
     ATTACCA (team 0 -> +x, team 1 -> -x, la stessa convenzione di
     dentroArea/resetKickoff in questo file) subito dopo l'apertura --
     ben PRIMA di VANT_VALUTA (dopo F1 il fallito e' ancora a terra,
     G.vantaggio.t parte negativo: vedi _t-vantaggio-taratura.js), cosi'
     il blocco di valutazione dentro step() non ha mai occasione di
     risolversi (SFUMATO o VANTAGGIO) prima che ballWalls veda la palla
     oltre la linea e chiami addGoal da solo -- un gol vero, non un
     canale sintetico.
     ATTESO: il gol vale, checkSlideContact non rifischia mai da solo
     (nessun banner di fallo/punizione fra l'apertura e il gol) e il
     cartellino arriva SOLO alla ripresa dopo la festa (resetKickoff,
     App. D): niente doppio castigo, il gol resta. Se invece la scena
     'goal' tornasse indietro a 'freekick', o il gol non valesse, o il
     giallo arrivasse PRIMA della ripresa, sarebbe un bug vero (la
     finestra di vantaggio che interrompe una festa gia' iniziata): da
     curare e dichiarare, non da nascondere.
     saltaRipresa/saltaMoviola sono verbi VERI del gioco (lo stesso
     tocco che un giocatore userebbe per non aspettare la festa): li si
     richiama a ogni fotogramma finche' la scena non torna 'play', cosi'
     la prova non dipende dalla durata (variabile) di ripresa e moviola. */
  window.SCENA_DOGSO_GOL_ESEGUI = function () {
    const t = window.__test;
    const s = SCENA_FALLO('lontano');
    if (s.errore) return s;
    let aperto = false;
    for (let i = 0; i < 180 && !aperto; i++) {
      t.simulate(1 / 60);
      if (typeof G !== 'undefined' && G.vantaggio) aperto = true;
    }
    if (!aperto) return { errore: "G.vantaggio non si e' mai aperto entro 3 s" };
    if (G.vantaggio.card == null) return { errore: 'il fallo scriptato non ha prodotto un cartellino dovuto (card null)' };
    const vTeam = G.vantaggio.team, foulTeam = 1 - vTeam;
    const tAllApertura = G.vantaggio.t;
    const gialliPrima = t.disciplina.gialli[foulTeam];
    const scorePrima = t.score.slice();
    const golX = vTeam === 0 ? (FW + 6) : -6;
    Object.assign(t.ball, { owner: -1, x: golX, y: FH / 2, vx: (vTeam === 0 ? 1 : -1) * 150, vy: 0, z: 0, vz: 0 });
    let fischioFallo = false;
    for (let i = 0; i < 10 && t.state !== 'goal'; i++) {
      t.simulate(1 / 60);
      const ban = t.banner;
      if (ban && ban.text && /VANTAGGIO|PUNIZIONE|FALLO/.test(String(ban.text).toUpperCase())) fischioFallo = true;
    }
    const golSegnato = t.state === 'goal';
    const scoreAlGol = t.score.slice();
    const vantaggioApertoAlGol = !!G.vantaggio;
    const gialliAlGol = t.disciplina.gialli[foulTeam];
    /* si corre fino alla ripresa (resetKickoff -> setScene('kickoff')),
       saltando ripresa/moviola col verbo vero -- la loro durata non e'
       una soglia di questa prova. */
    for (let i = 0; i < 300 && t.state !== 'play'; i++) {
      if (typeof G !== 'undefined') {
        if (G.ripresa) saltaRipresa();
        else if (G.moviola) saltaMoviola();
      }
      t.simulate(1 / 60);
    }
    const gialliDopoRipresa = t.disciplina.gialli[foulTeam];
    return {
      ok: true, vTeam, foulTeam, tAllApertura, fischioFallo,
      gialliPrima, gialliAlGol, gialliDopoRipresa,
      scorePrima, scoreAlGol, golSegnato, vantaggioApertoAlGol,
      statoDopoRipresa: t.state,
    };
  };
  /* SCENA_GRAZIA_DOPO_CARD_ESEGUI (chiusura arbitrale, voce #107 compito
     3, 18 settembre 2026): la prova che inchioda W1. Un PRIMO fallo da
     giallo (SCENA_FALLO('lontano'), sempre un'entrata da dietro, sempre
     cattivo) apre il vantaggio; SOSTIENI_AVANTI lo tiene in corsa fino a
     VANT_T -- VANTAGGIO concesso per intero, il cartellino resta
     pendente nel sentinel {team:-1,...,card} che il blocco di
     valutazione lascia dietro di se' (CALCETTO-il-gioco.html ~17057).
     PRIMA di qualunque palla ferma (niente setScene/resetKickoff nel
     mezzo: scaricaCardVantaggio non gira mai), un SECONDO fallo si
     costruisce da capo -- STESSA tecnica, un'altra chiamata a
     SCENA_FALLO('lontano'), che riposiziona gli stessi due giocatori per
     un'altra entrata da dietro garantita, zero dado() nuovo -- e deve
     aprire la PROPRIA finestra (G.vantaggio.team>=0), non fischiare
     subito. La misura che discrimina: G.vantaggio.team>=0 diventa vero
     (finestra vera aperta) E nessun banner FALLO/PUNIZIONE compare prima
     -- l'unico testo che matcherebbe quel pattern e' quello di un
     fischio SUBITO (checkSlideContact chiama showBanner solo sul ramo
     immediato; aprire una finestra nuova e' silenzioso, per costruzione
     del file). Il banner 'VANTAGGIO' del primo fallo resta come testo
     scaduto in G.banner finche' nessuno lo sovrascrive (get banner(),
     CALCETTO-il-gioco.html ~43075: G.banner non si azzera da solo) ma
     non contiene ne' 'FALLO' ne' 'PUNIZIONE', quindi non falsa la
     misura. */
  window.SCENA_GRAZIA_DOPO_CARD_ESEGUI = function () {
    const t = window.__test;
    const s1 = SCENA_FALLO('lontano');
    if (s1.errore) return s1;
    let aperto1 = false;
    for (let i = 0; i < 180 && !aperto1; i++) {
      t.simulate(1 / 60);
      if (typeof G !== 'undefined' && G.vantaggio && G.vantaggio.team >= 0) aperto1 = true;
    }
    if (!aperto1) return { errore: "G.vantaggio (primo fallo) non si e' mai aperto entro 3 s" };
    if (G.vantaggio.card == null) return { errore: 'il primo fallo scriptato non ha prodotto un cartellino dovuto (card null)' };
    const sost = SOSTIENI_AVANTI(s1.vittimaIdx, 230);
    if (!sost.vistoVantaggio) return Object.assign({ errore: "il primo vantaggio non e' mai stato concesso entro 230 fotogrammi" }, sost);
    const sentinelDopoPrimo = (typeof G !== 'undefined' && G.vantaggio) ? Object.assign({}, G.vantaggio) : null;
    if (!sentinelDopoPrimo || sentinelDopoPrimo.team !== -1) {
      return { errore: "atteso il sentinel {team:-1,...} dopo il vantaggio concesso, trovato: " + JSON.stringify(sentinelDopoPrimo) };
    }
    const s2 = SCENA_FALLO('lontano');
    if (s2.errore) return s2;
    let aperto2 = false, fischioPrimaDiAprire = false;
    for (let i = 0; i < 180 && !aperto2; i++) {
      t.simulate(1 / 60);
      const ban = t.banner;
      if (!aperto2 && ban && ban.text && /FALLO|PUNIZIONE/.test(String(ban.text).toUpperCase())) fischioPrimaDiAprire = true;
      if (typeof G !== 'undefined' && G.vantaggio && G.vantaggio.team >= 0) aperto2 = true;
    }
    const vantaggioDopo2 = (typeof G !== 'undefined' && G.vantaggio) ? Object.assign({}, G.vantaggio) : null;
    return {
      ok: true, sentinelCardDopoPrimo: sentinelDopoPrimo.card,
      aperto2, fischioPrimaDiAprire, vantaggioDopo2,
      statoFinale: t.state,
    };
  };
  /* SCENA_CARD_NON_SI_PERDE_ESEGUI (micro-coda del compito 3, voce #107,
     18 settembre 2026): il dubbio dichiarato dalla chiusura arbitrale
     3b, chiuso qui. STESSA costruzione di SCENA_GRAZIA_DOPO_CARD_ESEGUI
     fino al sentinel confermato (un primo fallo da giallo, sostenuto
     fino a VANT_T, il cartellino resta pendente nel sentinel {team:-1,
     ...,card}) -- ma la misura che discrimina non e' piu' se la seconda
     finestra si apre (W1 lo garantisce gia', chiusura arbitrale 3b): e'
     se il cartellino pendente del PRIMO fallo viene inflitto PRIMA che
     il secondo fallo lo sovrascriva. La disciplina di squadra
     (t.disciplina.gialli[foulTeam]) e' l'unico testimone che conta:
     scaricaCardVantaggio() chiama infliggiCartellino sincronamente,
     nello stesso fotogramma in cui il secondo fallo apre la propria
     finestra -- se il conteggio non e' salito, il cartellino e' morto
     sovrascritto. */
  window.SCENA_CARD_NON_SI_PERDE_ESEGUI = function () {
    const t = window.__test;
    const s1 = SCENA_FALLO('lontano');
    if (s1.errore) return s1;
    let aperto1 = false;
    for (let i = 0; i < 180 && !aperto1; i++) {
      t.simulate(1 / 60);
      if (typeof G !== 'undefined' && G.vantaggio && G.vantaggio.team >= 0) aperto1 = true;
    }
    if (!aperto1) return { errore: "G.vantaggio (primo fallo) non si e' mai aperto entro 3 s" };
    if (G.vantaggio.card == null) return { errore: 'il primo fallo scriptato non ha prodotto un cartellino dovuto (card null)' };
    const foulTeam = 1 - G.vantaggio.team;
    const sost = SOSTIENI_AVANTI(s1.vittimaIdx, 230);
    if (!sost.vistoVantaggio) return Object.assign({ errore: "il primo vantaggio non e' mai stato concesso entro 230 fotogrammi" }, sost);
    const sentinelDopoPrimo = (typeof G !== 'undefined' && G.vantaggio) ? Object.assign({}, G.vantaggio) : null;
    if (!sentinelDopoPrimo || sentinelDopoPrimo.team !== -1) {
      return { errore: "atteso il sentinel {team:-1,...} dopo il vantaggio concesso, trovato: " + JSON.stringify(sentinelDopoPrimo) };
    }
    const gialliPrimaDelSecondo = t.disciplina.gialli[foulTeam];
    const s2 = SCENA_FALLO('lontano');
    if (s2.errore) return s2;
    let aperto2 = false;
    for (let i = 0; i < 180 && !aperto2; i++) {
      t.simulate(1 / 60);
      if (typeof G !== 'undefined' && G.vantaggio && G.vantaggio.team >= 0) aperto2 = true;
    }
    const vantaggioDopo2 = (typeof G !== 'undefined' && G.vantaggio) ? Object.assign({}, G.vantaggio) : null;
    const gialliDopoIlSecondo = t.disciplina.gialli[foulTeam];
    return {
      ok: true, foulTeam, sentinelCardDopoPrimo: sentinelDopoPrimo.card,
      gialliPrimaDelSecondo, gialliDopoIlSecondo,
      aperto2, vantaggioDopo2, statoFinale: t.state,
    };
  };
  /* =====================================================================
     ONDA DI CORREZIONE DELLA REVISIONE FINALE (voce #107, 18 settembre
     2026): TRE funzioni nuove, per I2/CARD-NON-ATTRAVERSA, I3/
     PALLA-FUORI-IN-FINESTRA e I5/VANTAGGIO-IN-AREA.

     SCENA_CARD_NON_ATTRAVERSA_ESEGUI (I2): costruisce il sentinel
     esattamente come SCENA_GRAZIA_DOPO_CARD_ESEGUI (un fallo da giallo,
     sostenuto fino a VANT_T: VANTAGGIO concesso per intero, il
     cartellino resta pendente in {team:-1,...,card}) -- poi chiama
     startMatch DI NUOVO, con la STESSA taglia, la "partita nuova" che
     il rilievo I2 misurava: PRIMA della cura G.vantaggio sopravviveva a
     startMatch, e resetKickoff (dentro startMatch stesso, via
     setupPlayers()) lo leggeva con la rosa APPENA rifatta -- un indice
     valido ma un titolare diverso, innocente. */
  window.SCENA_CARD_NON_ATTRAVERSA_ESEGUI = function (taglia) {
    const t = window.__test;
    const s1 = SCENA_FALLO('lontano');
    if (s1.errore) return s1;
    let aperto1 = false;
    for (let i = 0; i < 180 && !aperto1; i++) {
      t.simulate(1 / 60);
      if (typeof G !== 'undefined' && G.vantaggio && G.vantaggio.team >= 0) aperto1 = true;
    }
    if (!aperto1) return { errore: "G.vantaggio non si e' mai aperto entro 3 s" };
    if (G.vantaggio.card == null) return { errore: 'il fallo scriptato non ha prodotto un cartellino dovuto (card null)' };
    const sost = SOSTIENI_AVANTI(s1.vittimaIdx, 230);
    if (!sost.vistoVantaggio) return Object.assign({ errore: "il vantaggio non e' mai stato concesso entro 230 fotogrammi" }, sost);
    const sentinelFinePartita = (typeof G !== 'undefined' && G.vantaggio) ? Object.assign({}, G.vantaggio) : null;
    if (!sentinelFinePartita || sentinelFinePartita.team !== -1) {
      return { errore: "atteso il sentinel {team:-1,...} a fine partita, trovato: " + JSON.stringify(sentinelFinePartita) };
    }
    /* LA PARTITA NUOVA. Nessuno azzera G.vantaggio a mano qui: e'
       esattamente il caso che I2 cura (o non cura) dentro startMatch. */
    t.startMatch(1, 1, { size: taglia });
    t.setCpuVsCpu(true);
    const vantaggioDopoStartMatch = (typeof G !== 'undefined') ? G.vantaggio : 'non definito';
    let bannerCartellinoVisto = false;
    for (let i = 0; i < 30; i++) {
      t.simulate(1 / 60);
      const ban = t.banner;
      if (ban && ban.text && String(ban.text).toUpperCase().indexOf('CARTELLINO') >= 0) bannerCartellinoVisto = true;
    }
    const gialliDopo = t.disciplina.gialli.slice();
    return {
      ok: true, sentinelCardFinePartita: sentinelFinePartita.card,
      vantaggioDopoStartMatch, bannerCartellinoVisto, gialliDopo,
    };
  };
  /* SCENA_PALLA_FUORI_IN_FINESTRA_ESEGUI (I3): lo stesso fallo lontano
     di SCENA_FALLO('lontano') apre la finestra come sempre; appena e'
     viva (team>=0, ben prima che VANT_VALUTA la valuti), il pallone si
     manda fuori dal campo sulla fascia lunga (y<B_R, G.campoVero
     richiesto: opts.sponde:'campo', dichiarato -- di serie la taglia 5
     nasce in gabbia, dove pallaFuori non scatta mai) esattamente sul
     punto salvato -- lo stesso imbuto fisico (ballWalls) che le
     partite vere userebbero, non una chiamata diretta a pallaFuori().
     PRIMA della cura questo sarebbe scivolato in setScene('battuta'),
     scaricando il cartellino pendente in silenzio (I3c) senza fischio
     ne' punizione -- il 5,1% "silenzioso" della contabilita' arbitrale
     del compito 3, mai spiegato allora. */
  window.SCENA_PALLA_FUORI_IN_FINESTRA_ESEGUI = function () {
    const t = window.__test;
    const s = SCENA_FALLO('lontano');
    if (s.errore) return s;
    let aperto = false;
    for (let i = 0; i < 180 && !aperto; i++) {
      t.simulate(1 / 60);
      if (typeof G !== 'undefined' && G.vantaggio && G.vantaggio.team >= 0) aperto = true;
    }
    if (!aperto) return { errore: "G.vantaggio non si e' mai aperto entro 3 s" };
    const savedX = G.vantaggio.x, savedY = G.vantaggio.y, cardAttesa = G.vantaggio.card;
    const foulTeam = 1 - G.vantaggio.team;
    const gialliPrima = t.disciplina.gialli[foulTeam];
    /* CROSSTO ARMATO PRIMA DELL'USCITA (ri-verdetto, voce #107, micro-onda
       finale, 18 settembre 2026): un valore rancido come quello che un
       cross lasciava PRIMA del fallo -- se eseguiSfumato() non lo
       azzera, il pallone congelato al punto salvato resta "diretto" a
       questo indice anche dopo lo sfumato. LETTO AL PRIMO FOTOGRAMMA DEL
       BANNER, non a fine loop: punizioneRapida() da' il pallone al
       fallito e lo lascia FERMO (G.freeze=0,16s), ma non lo calcia --
       il prossimo calcio vero (kickBall, ~14626) azzera crossTo per
       conto suo su OGNI calcio del gioco, sfumato o no. Leggerlo dopo i
       60 fotogrammi interi avrebbe quasi certamente gia' visto quel
       calcio successivo, e la prova sarebbe rimasta verde ANCHE senza
       la cura di eseguiSfumato -- misurato: e' esattamente quello che
       succedeva prima di questa correzione (falso verde su 288f4a1). */
    t.ball.crossTo = 0;
    Object.assign(t.ball, { owner: -1, x: savedX, y: -30, vx: 0, vy: -80, z: 0, vz: 0 });
    let vistoSfumato = false, battutaVista = false, crossToAlSfumato = null;
    for (let i = 0; i < 60; i++) {
      t.simulate(1 / 60);
      const ban = t.banner;
      if (ban && ban.text && String(ban.text).toUpperCase().indexOf('SFUMATO') >= 0) {
        if (!vistoSfumato) crossToAlSfumato = t.ball.crossTo;
        vistoSfumato = true;
      }
      if (t.state === 'battuta') battutaVista = true;
    }
    const gialliDopo = t.disciplina.gialli[foulTeam];
    return {
      ok: true, savedX, savedY, cardAttesa, foulTeam,
      vistoSfumato, battutaVista, statoFinale: t.state,
      gialliPrima, gialliDopo, crossToAlSfumato,
    };
  };
  /* SCENA_VANTAGGIO_AREA_ESEGUI (I5): SCENA_FALLO('dentro') e' la
     STESSA scena di PROVA 1 -- x=60, y=centro campo, dentro l'area vera
     a ogni taglia. Fase 1: si aspetta che la finestra si apra davvero
     (fino a 180 fotogrammi: la stessa attesa del kickoff che
     SCENA_GRAZIA_DOPO_CARD_ESEGUI/SCENA_CARD_NON_SI_PERDE_ESEGUI gia'
     rispettano -- il fallo non puo' registrarsi finche' la scena e'
     ancora 'kickoff'), tracciando se un 'freekick' sia MAI comparso nel
     frattempo: il codice non guarda mai dentroArea() sulla riga che
     apre G.vantaggio (checkSlideContact), quindi un fallo in area non
     e' mai un rigore SUBITO -- ma il PRIMO fallo di una partita non lo
     sarebbe comunque (il ramo del fischio immediato chiede G.vantaggio
     gia' esistente), quindi qui si misura semplicemente cio' che la
     regola garantisce per costruzione, non un caso limite. Fase 2: la
     conservazione si corrompe apposta (il pallone passa al colpevole
     sul punto salvato, come PROVA 8) e si aspetta il fischio ritardato:
     con inArea vera alla risoluzione, deve dare RIGORE (scena
     'freekick'), mai una punizione rapida. */
  window.SCENA_VANTAGGIO_AREA_ESEGUI = function (totale) {
    const t = window.__test;
    const s = SCENA_FALLO('dentro');
    if (s.errore) return s;
    /* NIENTE forzatura della velocita' qui (a differenza di PROVA 6/9/
       10/11/12, che sostengono l'azione con SOSTIENI_AVANTI DOPO che la
       finestra e' gia' aperta): a x=60 -- appena fuori dalla linea di
       porta -- una vittima spinta a vx=-300 verso -x rischia di uscire
       dal campo o segnare PRIMA che il fallo si registri, mentre la
       scena e' ancora 'kickoff' e le posizioni non sono ancora vive.
       Questa fase misura solo l'apertura della finestra e l'assenza di
       un fischio immediato -- lo stesso pattern, identico, di
       SCENA_GRAZIA_DOPO_CARD_ESEGUI/SCENA_CARD_NON_SI_PERDE_ESEGUI. */
    let aperto = false, fischioImmediato = false;
    for (let i = 0; i < 180 && !aperto; i++) {
      t.simulate(1 / 60);
      if (t.state === 'freekick') fischioImmediato = true;
      if (typeof G !== 'undefined' && G.vantaggio && G.vantaggio.team >= 0) aperto = true;
    }
    if (!aperto) {
      return { errore: "G.vantaggio non si e' mai aperto entro 3 s (fischio immediato visto: " + fischioImmediato + ')' };
    }
    const savedX = G.vantaggio.x, savedY = G.vantaggio.y;
    Object.assign(t.ball, { owner: s.tacklerIdx, x: savedX, y: savedY, vx: 0, vy: 0, z: 0, vz: 0 });
    let vistoSfumato = false;
    for (let i = 0; i < totale && !vistoSfumato; i++) {
      t.simulate(1 / 60);
      const ban = t.banner;
      if (ban && ban.text && String(ban.text).toUpperCase().indexOf('SFUMATO') >= 0) vistoSfumato = true;
    }
    return {
      ok: true, fischioImmediato, vantaggioApertoSubito: aperto, vistoSfumato,
      statoFinale: t.state, areaProf: s.areaProf, areaSemi: s.areaSemi,
    };
  };
}

/* fa scorrere n fotogrammi e torna lo stato finale -- copre il fermo del
   kickoff (1,0-1,5 s secondo la taglia, CALCETTO-il-gioco.html: step())
   PRIMA che la scena costruita in kickoff possa muoversi davvero. */
const CORRI = (n) => `
(function(){
  const t = window.__test;
  for(let i=0;i<${n};i++) t.simulate(1/60);
  return { stato: t.state };
})()`;

/* come CORRI ma traccia, fotogramma per fotogramma, se il pallone e'
   mai passato nelle mani del portiere (owner===gkIdx) -- la presa puo'
   avvenire su un fotogramma solo e poi il portiere rinvia, quindi lo
   stato FINALE non basterebbe. */
const CORRI_TRACCIA_PRESA = (n, gkIdx) => `
(function(){
  const t = window.__test;
  let presa = false, fotogramma = -1;
  for(let i=0;i<${n};i++){
    t.simulate(1/60);
    if(t.ball.owner===${gkIdx}){ presa = true; fotogramma = i; break; }
  }
  return { presa, fotogramma, statoFinale: t.state };
})()`;

/* per il vantaggio: campiona a ogni fotogramma il banner (cerca la
   stringa 'VANTAGGIO', maiuscole/minuscole) e se la velocita' del
   pallone e' mai stata azzerata di netto (la firma di punizioneRapida,
   che scrive b.vx=0;b.vy=0;b.vz=0; senza eccezioni). */
const CORRI_TRACCIA_VANTAGGIO = (n) => `
(function(){
  const t = window.__test;
  let vistoVantaggio = false, fermata = false, fotogrammaFermata = -1;
  for(let i=0;i<${n};i++){
    t.simulate(1/60);
    const ban = t.banner;
    if(ban && ban.text && String(ban.text).toUpperCase().indexOf('VANTAGGIO')>=0) vistoVantaggio = true;
    if(!fermata && t.ball.vx===0 && t.ball.vy===0){ fermata = true; fotogrammaFermata = i; }
  }
  return { vistoVantaggio, fermata, fotogrammaFermata, statoFinale: t.state };
})()`;

/* per RETRO-FERMO: traccia, fotogramma per fotogramma, TRE cose --
   (i) se la presa e' MAI avvenuta (b.owner===gkIdx, come CORRI_TRACCIA_PRESA);
   (ii) la distanza minima dal portiere MENTRE IL REGIME DI NEGAZIONE E'
   ATTIVO (pallone libero, toccoPiede vero, ultimo tocco ancora il
   compagno che ha calciato) -- fuori da quella finestra un compagno puo'
   benissimo dribblare vicino al proprio portiere senza che sia un
   attraversamento, quindi la soglia non si applica li';
   (iii) il primo fotogramma in cui il pallone torna vivo (posseduto da
   qualcuno o piu' veloce di 50), a partire dal fischio d'inizio. */
const CORRI_TRACCIA_RETROFERMO = (n, gkIdx, ciIdx) => `
(function(){
  const t = window.__test;
  let presa = false, minDistRegime = Infinity, vivo = false, vivoFotogramma = -1;
  for(let i=0;i<${n};i++){
    t.simulate(1/60);
    const b = t.ball, gk = t.players[${gkIdx}];
    const d = Math.hypot(b.x-gk.x, b.y-gk.y);
    const regimeAttivo = b.owner<0 && b.toccoPiede===true && b.lastTouch===${ciIdx};
    if(regimeAttivo && d<minDistRegime) minDistRegime=d;
    if(b.owner===${gkIdx}) presa = true;
    if(!vivo && (b.owner>=0 || Math.hypot(b.vx,b.vy)>50)){ vivo = true; vivoFotogramma = i; }
  }
  return { presa, minDistRegime, vivo, vivoFotogramma };
})()`;

const FOTOGRAMMI_ATTESA = 200;   // 3,33 s: copre il kickoff piu' lungo (1,5 s a 7/11) con largo margine

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== LE REGOLE A LEVA CORTA ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  -- taglia ' + TAGLIA_BANCO + ', seme ' + SEME);

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    });
    await pag.evaluate(INIETTA_SCENE);

    const nuovaScenaFallo = (modo) => pag.evaluate(({ seme, taglia, modo }) => {
      const t = window.__test;
      t.semina(seme);
      t.startMatch(1, 1, { size: taglia });
      t.setCpuVsCpu(true);
      return SCENA_FALLO(modo);
    }, { seme: SEME, taglia: TAGLIA_BANCO, modo }).catch(e => ({ errore: e.message }));

    /* ===================================================================
       PROVA 1 -- RIGORE-DENTRO. Controllo discriminante: fallo a x=60,
       y=centro campo. Dentro l'area vera E dentro la vecchia fascia a
       ogni taglia: deve produrre uno dei DUE esiti leciti di un fallo
       in area, MAI il terzo (la punizione rapida da fuori-area, la
       condanna gemella di PROVA 2).

       STORIA (per la cronaca, non piu' lo stato attuale). RISCRITTA
       (I4b, revisione finale, voce #107, 18 settembre 2026):
       l'asserzione originale era "lo stato al fotogramma 200 e'
       freekick" -- vera allora solo perche' il SEGUITO #108 (25
       strumenti, compreso questo file, chiamavano setCpuVsCpu PRIMA di
       startMatch) teneva la squadra 0 "umana" immobile: nessun
       avversario vero conduceva il duello, lo stato restava 'freekick'
       per assenza di un difensore, non per la regola. Fu riscritta come
       "la scena freekick e' stata ATTRAVERSATA" (campionata a ogni
       fotogramma), creduta "robusta a un futuro #108" -- ma quando la
       cura dell'ordine e' arrivata davvero (voce #121, compito 1, 19
       settembre 2026) la prova si e' scoperta ROSSA lo stesso: con la
       difesa vera, il vantaggio in area a volte si chiude con un GOL
       della squadra offesa PRIMA che l'arbitro fischi il rigore
       ritardato (misurato: 'freekick' mai vista, stato finale 'goal').
       Non e' un bug -- e' la regola del VANTAGGIO (voce #107, gia'
       decisa): se l'offesa segna nella finestra, il rigore non si batte
       piu', e resta un esito lecito del fallo in area. L'asserzione
       "solo freekick" era percio' troppo stretta.

       RISCRITTA DI NUOVO (#121, compito 1, 19 settembre 2026, QUESTA
       VOLTA CHIUSA): l'invariante vero per un fallo IN AREA e' "rigore
       fischiato (freekick attraversata) OPPURE vantaggio giocato e
       segnato dalla squadra OFFESA" -- si verifica di chi e' il gol
       (t.score per squadra, non un gol qualsiasi: un gol della squadra
       che ha COMMESSO il fallo non conta come esito lecito e resta
       rosso) per restare un controllo discriminante vero, non una
       tautologia che accetta qualunque cosa. L'esito condannato resta
       lo stesso: se la scena si stabilizza senza mai vedere 'freekick'
       e senza che l'offesa segni (es. 'play'/punizione rapida, come se
       il fallo fosse fuori area), la prova e' rossa -- esattamente il
       comportamento che PROVA 2 chiede per un fallo VERAMENTE fuori
       area, quindi la distinzione area-vera-vs-fascia resta preservata
       fra le due prove gemelle. */
    {
      const scena = await nuovaScenaFallo('dentro');
      if (scena.errore) { di(false, '1. RIGORE-DENTRO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(({ n, vIdx }) => {
          const t = window.__test;
          const offesa = t.players[vIdx].team;
          const scorePrima = t.score.slice();
          let freekickVisto = false;
          for (let i = 0; i < n; i++) {
            t.simulate(1 / 60);
            if (t.state === 'freekick') freekickVisto = true;
          }
          const scoreDopo = t.score.slice();
          return {
            freekickVisto, statoFinale: t.state, offesa, scorePrima, scoreDopo,
            golOffesa: scoreDopo[offesa] === scorePrima[offesa] + 1,
          };
        }, { n: FOTOGRAMMI_ATTESA, vIdx: scena.vittimaIdx });
        const ok = r.freekickVisto || r.golOffesa;
        di(ok, '1. RIGORE-DENTRO -- fallo a x=' + scena.x + ',y=' + scena.y + ' (centro campo): DUE esiti leciti (rigore fischiato O vantaggio giocato e segnato dall\'offesa), MAI la punizione rapida da fuori-area (CONTROLLO DISCRIMINANTE, riscritta #121)',
          'freekick vista: ' + r.freekickVisto + '   gol squadra offesa (' + r.offesa + '): ' + r.golOffesa + ' (' + r.scorePrima.join('-') + ' -> ' + r.scoreDopo.join('-') + ')   stato al fotogramma ' + FOTOGRAMMI_ATTESA + ': ' + r.statoFinale + ' -- areaProf=' + scena.areaProf + ', areaSemi=' + scena.areaSemi + ', FH=' + scena.FH);
      }
    }

    /* ===================================================================
       PROVA 2 -- RIGORE-FUORI. LA CONDANNA. Fallo alla stessa x=60 ma a
       y = FH/2 - areaSemi - 30: fuori dall'area vera, ancora dentro la
       vecchia fascia (x=60<260). Sul gioco di oggi la fascia (solo-x)
       non vede la y e apre comunque il duello: rossa per costruzione.
       Dopo la cura deve dare punizione rapida (scena resta 'play'). */
    {
      const scena = await nuovaScenaFallo('fuori');
      if (scena.errore) { di(false, '2. RIGORE-FUORI', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI(FOTOGRAMMI_ATTESA));
        const ok = r.stato === 'play';
        const confineY = scena.FH / 2 - scena.areaSemi;
        di(ok, '2. RIGORE-FUORI -- fallo a x=' + scena.x + ',y=' + scena.y + ' (fuori area, dentro fascia 260): punizione rapida, niente duello',
          'stato dopo il fallo: ' + r.stato + ' (atteso play, NON freekick) -- confine y dell\'area: ' + confineY +
          ' (y del fallo sta ' + (confineY - scena.y) + ' unita\' oltre) -- x=' + scena.x + ' e\' dentro sia la fascia (260) sia la profondita\' dell\'area (' + scena.areaProf + ')');
      }
    }

    /* ===================================================================
       PROVA 3 -- RETRO-PRESA. Un compagno del portiere gli passa la
       palla col piede (kickBall, l'imbuto vero). Oggi tentaPresa non
       legge mai l'ultimo tocco: la presa avviene. Rossa fino al
       compito 2 (mandato SS6.5/App. D). */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_RETROPASSO();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '3. RETRO-PRESA', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI_TRACCIA_PRESA(FOTOGRAMMI_ATTESA, scena.gkIdx));
        const ok = !r.presa;
        di(ok, '3. RETRO-PRESA -- compagno passa col piede al portiere: la presa con le mani NON deve avvenire',
          r.presa ? ('presa avvenuta al fotogramma ' + r.fotogramma + ' (oggi tentaPresa non guarda l\'ultimo tocco)')
                  : ('mai presa in ' + FOTOGRAMMI_ATTESA + ' fotogrammi'));
      }
    }

    /* ===================================================================
       PROVA 4 -- RETRO-TESTA. Un compagno del portiere colpisce di
       testa (colpoDiTesta): toccoPiede resta falso, quindi la presa con
       le mani DEVE restare lecita. CONTROLLO DISCRIMINANTE: verde sia
       oggi (che prende tutto) sia dopo la cura (che nega solo il piede
       di un compagno, mai la testa). */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_RETROTESTA();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '4. RETRO-TESTA', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI_TRACCIA_PRESA(FOTOGRAMMI_ATTESA, scena.gkIdx));
        const ok = r.presa;
        di(ok, '4. RETRO-TESTA -- compagno colpisce di testa verso il portiere: la presa con le mani resta lecita (CONTROLLO DISCRIMINANTE)',
          r.presa ? ('presa avvenuta al fotogramma ' + r.fotogramma)
                  : ('mai presa in ' + FOTOGRAMMI_ATTESA + ' fotogrammi -- la negazione ha morso anche sulla testa: troppo larga'));
      }
    }

    /* ===================================================================
       PROVA 5 -- RETRO-AVVERSARIO. Un avversario passa col piede verso
       il portiere: toccoPiede e' vero ma la squadra dell'ultimo tocco e'
       diversa da quella del portiere, quindi la presa resta lecita.
       CONTROLLO DISCRIMINANTE, verde prima e dopo la cura. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_RETROAVVERSARIO();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '5. RETRO-AVVERSARIO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI_TRACCIA_PRESA(FOTOGRAMMI_ATTESA, scena.gkIdx));
        const ok = r.presa;
        di(ok, '5. RETRO-AVVERSARIO -- avversario passa col piede verso il portiere: la presa resta lecita (CONTROLLO DISCRIMINANTE)',
          r.presa ? ('presa avvenuta al fotogramma ' + r.fotogramma)
                  : ('mai presa in ' + FOTOGRAMMI_ATTESA + ' fotogrammi -- la negazione ha morso anche sull\'avversario: guarda solo il piede, non la squadra'));
      }
    }

    /* ===================================================================
       PROVA 6 -- VANTAGGIO-FISCHIA-SEMPRE (voce #107, compito 3). Fallo
       lontano da ogni area/fascia (niente duello per costruzione, la
       cura del compito 1 non c'entra) MENTRE la vittima avanza col
       pallone: un vantaggio vero lascia proseguire l'azione (banner
       VANTAGGIO, nessun fischio, nessun duello aperto). PRIMA del
       compito 3 punizioneRapida azzerava SEMPRE la velocita' del
       pallone e 'VANTAGGIO' non esisteva nel file: era rossa per
       costruzione.
       ADATTAMENTO DICHIARATO (nota di registro del compito: la scena
       muove il GIOCATORE con vx=-300 una volta sola, non il pallone):
       misurato che l'azione, lasciata a se stessa, si scioglie da sola
       molto prima di VANT_T=2,5 s (il pallone diventa libero a ~0,5 s e
       un difensore CPU lo ruba a ~1,6-1,7 s) -- non un difetto della
       regola, ma il fatto che una spinta una tantum non e' un giocatore
       che continua a portare palla. SOSTIENI_AVANTI tiene l'offeso in
       corsa e in possesso per tutta la finestra, isolando la
       VALUTAZIONE del vantaggio dalla tenuta dell'IA (la stessa lezione
       gia' applicata alle scene di _q-battute). La condanna vera resta
       su vistoVantaggio E su nessun duello aperto (statoFinale==='play'):
       un banner visto per un attimo e poi un fischio ritardato non
       sarebbe questa prova, sarebbe la 8. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_FALLO('lontano');
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '6. VANTAGGIO-FISCHIA-SEMPRE', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(({ vi, n }) => SOSTIENI_AVANTI(vi, n), { vi: scena.vittimaIdx, n: 260 });
        const ok = r.vistoVantaggio && !r.vistoSfumato && r.statoFinale === 'play';
        di(ok, "6. VANTAGGIO-FISCHIA-SEMPRE -- fallo con azione sostenuta: atteso banner VANTAGGIO, nessun fischio, nessun duello",
          'banner VANTAGGIO visto: ' + r.vistoVantaggio + '   banner SFUMATO visto: ' + r.vistoSfumato +
          '   stato finale: ' + r.statoFinale + " (atteso play, mai freekick)");
      }
    }

    /* ===================================================================
       PROVA 7 -- RETRO-FERMO (voce #107, correzione di revisione compito
       2). CONTROLLO DISCRIMINANTE, nasce verde: non esercita codice
       nuovo, misura il caso di mezzo -- un retropassaggio a velocita' 40,
       quasi fermo -- che RETRO-PRESA non isolava mai. Tre condanne
       possibili, tutte diverse dal semplice "presa si'/no" di RETRO-PRESA:
       (i) il portiere non deve MAI prendere con le mani; (ii) il pallone
       non deve MAI attraversarlo (distanza dal portiere mai sotto
       P_R+B_R, con una tolleranza), mentre il regime di negazione e'
       attivo; (iii) entro 5 s (300 fotogrammi) il pallone deve tornare
       vivo -- posseduto da qualcuno o piu' veloce di 50 -- perche' un
       fermo che non si scioglie mai sarebbe uno stallo, non una regola. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_RETROFERMO();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '7. RETRO-FERMO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const TOLLERANZA_FERMO = 2;   // assorbe il rumore in virgola mobile del rimbalzo, non un vero attraversamento
        const r = await pag.evaluate(CORRI_TRACCIA_RETROFERMO(300, scena.gkIdx, scena.compagnoIdx));
        const okPresa = !r.presa;
        const okAttraversa = r.minDistRegime >= (scena.raggioFermo - TOLLERANZA_FERMO);
        const okVivo = r.vivo && r.vivoFotogramma < 300;
        const ok = okPresa && okAttraversa && okVivo;
        const f2 = v => (isFinite(v) ? v.toFixed(2) : 'n/d');
        di(ok, "7. RETRO-FERMO -- retropassaggio quasi fermo (velocita' 40): niente presa, niente attraversamento, il pallone torna vivo entro 5 s",
          'presa: ' + r.presa + ' (atteso false)   distanza minima nel regime di negazione: ' + f2(r.minDistRegime) +
          ' (atteso >= ' + f2(scena.raggioFermo - TOLLERANZA_FERMO) + ' = P_R+B_R-' + TOLLERANZA_FERMO + ')   ' +
          'vivo: ' + r.vivo + (r.vivo ? (' al fotogramma ' + r.vivoFotogramma) : '') + ' su 300 (5 s)');
      }
    }

    /* ===================================================================
       PROVA 8 -- VANTAGGIO-SFUMATO (voce #107, compito 3, prova NUOVA).
       Lo stesso fallo lontano da area/fascia di SCENA_FALLO('lontano'),
       ma la conservazione si perde apposta appena la finestra si apre:
       il pallone passa al colpevole (squadraDelPallone() smette di
       essere la squadra offesa) e si teletrasporta a un DECOY, 300
       unita' lontano dal punto salvato. Il fischio ritardato deve
       tornare al punto SALVATO -- mai al decoy, mai a dove sta la palla
       ora: e' il controllo che la prova isola (tolleranza generosa,
       120 unita': il ramo punizioneRapida cede la palla al compagno
       offeso piu' vicino al punto salvato, non incolla la palla al
       millimetro, e un fotogramma di fisica gira comunque dopo).

       ESTENSIONE F3 (correzione di revisione, 18 settembre 2026): "la
       punizione resta sul punto" e' un fatto nel TEMPO, non solo nel
       fotogramma del fischio -- prima della cura il sostituto non era
       co-locato e la molla del dribbling di updateBall lo trascinava
       via appena la fisica ripartiva (misurato dal revisore: ~38 unita'
       in 0,33 s). maxDistPost20 (dentro SCENA_VANTAGGIO_SFUMATO_ESEGUI)
       traccia la distanza dal punto salvato per i primi 20 fotogrammi a
       partire dal fischio: deve restare stretta (25 unita', molto sotto
       la tolleranza generosa di sopra) per TUTTA la finestra, non solo
       nell'istante del fischio. */
    {
      const scena = await pag.evaluate(({ seme, taglia, n }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_VANTAGGIO_SFUMATO_ESEGUI(n);
      }, { seme: SEME, taglia: TAGLIA_BANCO, n: FOTOGRAMMI_ATTESA }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '8. VANTAGGIO-SFUMATO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const TOLLERANZA_PUNTO = 120;
        const TOLLERANZA_TENUTA = 25;   // F3: la stessa punizione, sostenuta per 20 fotogrammi
        const dist = scena.vistoSfumato ? Math.hypot(scena.bxAlFischio - scena.savedX, scena.byAlFischio - scena.savedY) : Infinity;
        const distDaDecoy = scena.vistoSfumato ? Math.abs(scena.bxAlFischio - scena.decoyX) : 0;
        const okTenuta = scena.vistoSfumato && scena.maxDistPost20 <= TOLLERANZA_TENUTA;
        const ok = scena.vistoSfumato && dist <= TOLLERANZA_PUNTO && okTenuta;
        di(ok, "8. VANTAGGIO-SFUMATO -- palla persa in finestra: fischio ritardato dal punto SALVATO, non dal decoy, e la punizione REGGE (F3)",
          'banner SFUMATO visto: ' + scena.vistoSfumato + '   punto salvato: (' + scena.savedX.toFixed(1) + ',' + scena.savedY.toFixed(1) +
          ')   decoy: ' + scena.decoyX.toFixed(1) + '   palla al fischio: (' + (scena.bxAlFischio == null ? 'n/d' : scena.bxAlFischio.toFixed(1)) + ',' +
          (scena.byAlFischio == null ? 'n/d' : scena.byAlFischio.toFixed(1)) + ')   distanza dal punto salvato: ' + (isFinite(dist) ? dist.toFixed(1) : 'n/d') +
          ' (atteso <= ' + TOLLERANZA_PUNTO + ')   distanza dal decoy: ' + distDaDecoy.toFixed(1) +
          '   distanza MASSIMA nei 20 fotogrammi dopo il fischio: ' + (scena.maxDistPost20 == null ? 'n/d' : scena.maxDistPost20.toFixed(1)) +
          ' (atteso <= ' + TOLLERANZA_TENUTA + ', F3)');
      }
    }

    /* ===================================================================
       PROVA 9 -- CARD-DIFFERITO (voce #107, compito 3, prova NUOVA). Un
       fallo da giallo (SCENA_FALLO e' sempre un'entrata da dietro,
       sempre cattivo) con l'azione sostenuta fino a VANT_T: nessun
       fischio, il cartellino resta pendente in G.vantaggio.card. Alla
       PRIMA palla ferma vera -- qui una fascia lunga a campo VERO
       (opts.sponde:'campo', dichiarato: di serie la taglia 5 nasce in
       gabbia, dove pallaFuori non scatta mai) -- il giallo arriva e il
       conteggio di squadra (t.disciplina.gialli) sale di uno. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia, sponde: 'campo' });
        t.setCpuVsCpu(true);
        return SCENA_CARD_DIFFERITO_ESEGUI(taglia);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '9. CARD-DIFFERITO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const ok = scena.gialliDopo === scena.gialliPrima + 1;
        di(ok, "9. CARD-DIFFERITO -- vantaggio concesso su fallo da giallo: nessun fischio subito, il giallo arriva alla prima palla ferma",
          'squadra del fallo: ' + scena.foulTeam + '   gialli prima della palla ferma: ' + scena.gialliPrima +
          '   gialli dopo (atteso +1): ' + scena.gialliDopo + '   stato dopo la palla ferma: ' + scena.statoDopo);
      }
    }

    /* ===================================================================
       PROVA 10 -- DOGSO-GOL (F4, correzione di revisione compito 3, 18
       settembre 2026). CONTROLLO DISCRIMINANTE che nessuna prova di
       questo file esercitava ancora: fallo da giallo, l'azione prosegue,
       GOL segnato DENTRO la finestra di vantaggio. Nasce verde per
       costruzione del file (setScene('goal') passa da addGoal, che il
       blocco di valutazione del vantaggio in step() non intercetta mai
       -- la guardia G.scene!=='play'&&G.scene!=='golden' esce PRIMA di
       arrivarci): se nascesse ROSSA sarebbe un bug vero (la finestra di
       vantaggio che interrompe una festa di gol gia' iniziata), da
       curare e dichiarare, non da nascondere. La condanna vera e' sui
       quattro fatti insieme: il gol conta, nessun banner di fallo fra
       l'apertura e il gol, il cartellino NON e' ancora arrivato al gol
       (arriva dopo, alla ripresa) e ARRIVA per davvero dopo la festa. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_DOGSO_GOL_ESEGUI();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '10. DOGSO-GOL', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const golContato = scena.scoreAlGol[scena.vTeam] === scena.scorePrima[scena.vTeam] + 1;
        const nessunFischioAlGol = !scena.fischioFallo;
        const cardNonAlGol = scena.gialliAlGol === scena.gialliPrima;
        const cardAllaRipresa = scena.gialliDopoRipresa === scena.gialliPrima + 1;
        const ok = scena.golSegnato && golContato && nessunFischioAlGol && cardNonAlGol && cardAllaRipresa;
        di(ok, "10. DOGSO-GOL -- fallo da giallo, il gol arriva dentro la finestra: il gol vale, nessun fischio, il giallo arriva alla ripresa",
          'gol segnato: ' + scena.golSegnato + '   punteggio ' + scena.scorePrima.join('-') + ' -> ' + scena.scoreAlGol.join('-') +
          ' (squadra offesa ' + scena.vTeam + ', atteso +1)   fischio del fallo prima del gol: ' + scena.fischioFallo + ' (atteso false)   ' +
          'gialli alla porta: ' + scena.gialliAlGol + ' (atteso ' + scena.gialliPrima + ', invariato)   ' +
          'gialli dopo la ripresa: ' + scena.gialliDopoRipresa + ' (atteso ' + (scena.gialliPrima + 1) + ')   ' +
          't del vantaggio all\'apertura: ' + scena.tAllApertura.toFixed(3) + '   stato dopo la ripresa: ' + scena.statoDopoRipresa);
      }
    }

    /* ===================================================================
       PROVA 11 -- GRAZIA-DOPO-CARD (chiusura arbitrale, voce #107 compito
       3, 18 settembre 2026). La prova che inchioda W1: checkSlideContact
       fischiava SUBITO il fallo successivo a un vantaggio gia' CONCESSO
       per intero, perche' la guardia li' era "if(G.vantaggio)" senza
       "team>=0" -- vera anche sul sentinel {team:-1,...,card} che VANT_T
       lascia dietro di se' per il cartellino ancora da scaricare (App. D).
       Un PRIMO fallo da giallo apre il vantaggio e regge fino a VANT_T
       (VANTAGGIO concesso, sentinel confermato), poi un SECONDO fallo,
       PRIMA di qualunque palla ferma, deve aprire la PROPRIA finestra
       (G.vantaggio.team>=0) invece di fischiare all'istante. NATA ROSSA
       sulla correzione di revisione (b241c43, senza W1): il secondo
       fallo leggeva il sentinel come "vantaggio gia' pendente" e
       fischiava subito (banner FALLO/PUNIZIONE, mai una finestra nuova).
       Verde dopo W1. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_GRAZIA_DOPO_CARD_ESEGUI();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '11. GRAZIA-DOPO-CARD', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const ok = scena.aperto2 && !scena.fischioPrimaDiAprire;
        di(ok, "11. GRAZIA-DOPO-CARD -- secondo fallo su un vantaggio GIA' CONCESSO (sentinel pendente): deve aprire la propria finestra, non fischiare subito",
          'cartellino pendente dopo il primo vantaggio: idx ' + scena.sentinelCardDopoPrimo +
          '   seconda finestra aperta (team>=0): ' + scena.aperto2 + ' (atteso true)   ' +
          'fischio immediato prima di aprire (banner FALLO/PUNIZIONE): ' + scena.fischioPrimaDiAprire + ' (atteso false)   ' +
          'G.vantaggio dopo il secondo fallo: ' + JSON.stringify(scena.vantaggioDopo2) + '   stato finale: ' + scena.statoFinale);
      }
    }

    /* ===================================================================
       PROVA 12 -- CARD-NON-SI-PERDE (micro-coda del compito 3, voce
       #107, 18 settembre 2026). Il dubbio dichiarato dalla chiusura
       arbitrale 3b: quando un secondo fallo apre una finestra NUOVA
       sopra il sentinel del cartellino in differita, l'assegnazione che
       costruisce il nuovo G.vantaggio sovrascriveva il sentinel senza
       mai scaricarlo -- il cartellino del PRIMO fallo spariva in
       silenzio. NATA ROSSA sulla chiusura arbitrale 3b (832cff2): la
       finestra nuova si apre gia' (W1), ma la disciplina di squadra non
       sale mai. Verde dopo la cura (scaricaCardVantaggio() PRIMA di
       sovrascrivere il vecchio G.vantaggio). */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_CARD_NON_SI_PERDE_ESEGUI();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '12. CARD-NON-SI-PERDE', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const cardInflitto = scena.gialliDopoIlSecondo === scena.gialliPrimaDelSecondo + 1;
        const finestraNuova = scena.aperto2 && !!scena.vantaggioDopo2 && scena.vantaggioDopo2.team >= 0;
        const ok = cardInflitto && finestraNuova;
        di(ok, "12. CARD-NON-SI-PERDE -- secondo fallo su un sentinel col cartellino pendente: il giallo del primo fallo deve essere inflitto E la finestra nuova deve esistere",
          'cartellino pendente dopo il primo vantaggio: idx ' + scena.sentinelCardDopoPrimo +
          '   gialli squadra ' + scena.foulTeam + ' prima del secondo fallo: ' + scena.gialliPrimaDelSecondo +
          ' -> dopo: ' + scena.gialliDopoIlSecondo + ' (atteso +1)   ' +
          'finestra nuova aperta (team>=0): ' + finestraNuova + ' (atteso true)   ' +
          'G.vantaggio dopo il secondo fallo: ' + JSON.stringify(scena.vantaggioDopo2));
      }
    }

    /* ===================================================================
       PROVA 13 -- NASTRO-VERSIONE (voce #107, compito 4, chiude la voce
       #96). MOTORE_V viaggia nella testa del nastro (Reg.serializza) e
       Sfida.guarda lo confronta PRIMA di fidarsi del replay (grep
       Reg.motoreV in CALCETTO-il-gioco.html). Sfida.guarda si esercita
       con dati FINTI -- Rete.replay sostituita con una funzione che
       risponde subito, zero rete vera, la stessa filosofia delle
       SCENA_* (zero dado(), stato scritto direttamente) applicata al
       lato rete invece che al campo. Una rosa minima (4 giocatori,
       giusto il numero che la guardia "att.rosa.length<4" richiede) per
       ATT e DIF, taglia quella del banco.

       CASO A -- nastro ARTEFATTO a versione 0 ('1||', il formato v1 di
       sempre ma senza il campo nuovo: esattamente un nastro di prima
       della voce #107): Reg.motoreV resta 0 dopo la lettura, diverso da
       MOTORE_V, e Sfida.guarda deve chiudersi SUBITO -- messaggio a
       CAUSA VERA (il testo dichiara "un'altra versione del motore"),
       nessuna partita avviata (sfidaStato.replay resta false: G.sfida
       non viene mai scritto, la riga che lo farebbe sta DOPO il
       controllo nuovo).
       CASO B -- nastro alla versione CORRENTE, preso dal gioco stesso
       (t.registra()+t.nastro(): non un testo scritto a mano, il
       serializzatore vero) con zero comandi: Reg.motoreV deve leggere
       MOTORE_V, e Sfida.guarda deve proseguire fino a startMatch come
       sempre (sfidaStato.replay diventa true). Il controllo NON inchioda
       il valore numerico (motoreVLetto>0, non "===1"): un nastro scritto
       e riletto dalla stessa istanza del gioco porta per costruzione la
       versione CORRENTE, qualunque essa sia -- inchiodare "1" e' stato
       il difetto esatto che ha rotto questa prova il giorno che la voce
       #128 ha alzato MOTORE_V a 2 (vedi CASO C).

       CASO C (voce #128, compito 3) -- nastro con MOTORE_V=1 ESPLICITO
       ('1|1||': marcatore di formato, poi il campo di versione con un
       numero vero, non assente come nel CASO A), rigiocato su un gioco
       che oggi vale MOTORE_V=2: e' il caso concreto che le due cure P0
       del cantiere (doCross, il cross-proiettile -- resetKickoff, il
       battitore espulso) rendono pericoloso, perche' cambiano come uno
       STESSO nastro finisce. Deve chiudersi come il CASO A: stesso
       confronto (Reg.motoreV !== MOTORE_V), causa vera, zero penalita'. */
    {
      const provaNastro = (nastro) => pag.evaluate(({ nastro, taglia }) => {
        const t = window.__test;
        t.reteBase('http://127.0.0.1:1');   // basta non-vuoto: Rete.replay e' sostituita, non chiama la rete vera
        const rete = t.rete;
        const rosaFinta = () => Array.from({ length: 4 }, (_, i) => ({ nome: 'GIOCATORE' + i, vel: 50, tiro: 50, tecnica: 50, tackle: 50 }));
        const orig = rete.replay;
        rete.replay = async () => ({
          ok: true,
          sfida: { attaccante: 'ATT', difensore: 'DIF', taglia, seme: '20260918', gol_a: 3, gol_d: 1, replay: nastro },
          squadre: [
            { allenatore: 'ATT', nome: 'CHI ATTACCA', colori: {}, indole: {}, rosa: rosaFinta() },
            { allenatore: 'DIF', nome: 'CHI DIFENDE', colori: {}, indole: {}, rosa: rosaFinta() },
          ],
        });
        return t.sfida.guarda(999).then(() => {
          rete.replay = orig;   // ripristinata subito dopo l'uso, come Sfida.stato in _q-sfida.js
          return {
            motoreVLetto: t.registroMotoreV,
            replayInCorso: t.sfidaStato.replay,
            messaggio: (document.getElementById('sfStato') || {}).textContent || '',
          };
        });
      }, { nastro, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));

      const nastroVecchio = '1||';   // formato v1 di sempre, MOTORE_V assente per costruzione: versione 0
      const casoVecchio = await provaNastro(nastroVecchio);
      /* CASO C (voce #128, compito 3, aggiunto quando MOTORE_V e' salito
         da 1 a 2): un nastro che porta il campo ESPLICITO "MOTORE_V=1"
         -- non il vecchio artefatto senza campo (versione 0), un vero
         disaccordo di versione fra un nastro di IERI e il gioco di OGGI.
         E' esattamente il caso che le due cure P0 del cantiere (doCross,
         resetKickoff) rendono pericoloso: gli stessi comandi, un motore
         che si comporta diversamente sui cross lunghi e sui kickoff
         dopo un'espulsione. Deve chiudersi come il caso VECCHIO --
         stesso confronto (Reg.motoreV !== MOTORE_V), un numero diverso
         a sinistra. */
      const nastroV1 = '1|1||';
      const casoV1 = await provaNastro(nastroV1);
      const nastroAttuale = await pag.evaluate(() => {
        const t = window.__test;
        t.registra(); const n = t.nastro(); t.fermaRegistro();
        return n;
      }).catch(e => ({ errore: e.message }));
      const casoAttuale = (typeof nastroAttuale === 'string') ? await provaNastro(nastroAttuale) : { errore: 'nastro attuale non costruito' };

      if (casoVecchio.errore || casoV1.errore || casoAttuale.errore) {
        di(false, '13. NASTRO-VERSIONE', 'BANCO: ' + (casoVecchio.errore || casoV1.errore || casoAttuale.errore));
      } else {
        const okVecchio = casoVecchio.motoreVLetto === 0 && casoVecchio.replayInCorso === false &&
          casoVecchio.messaggio.indexOf('versione del motore') >= 0 &&
          casoVecchio.messaggio.indexOf('cambiata da allora') < 0;
        const okV1 = casoV1.motoreVLetto === 1 && casoV1.replayInCorso === false &&
          casoV1.messaggio.indexOf('versione del motore') >= 0 &&
          casoV1.messaggio.indexOf('cambiata da allora') < 0;
        /* ATTUALE: il numero non si inchioda (era "=== 1" quando MOTORE_V
           valeva 1 -- si e' rotto da solo il giorno che la voce #128 ha
           alzato la costante a 2, il difetto esatto che questa prova
           deve evitare di ripetere ad ogni futuro incremento). Il nastro
           e' scritto e riletto dalla STESSA istanza appena prima: se il
           gioco sa di che versione e' (motoreVLetto>0, mai 0 = versione
           assente/artefatto) e lascia proseguire il replay, la versione
           corrente e' gestita correttamente qualunque sia il suo valore. */
        const okAttuale = casoAttuale.motoreVLetto > 0 && casoAttuale.replayInCorso === true;
        const ok = okVecchio && okV1 && okAttuale;
        di(ok, "13. NASTRO-VERSIONE -- nastro a versione 0 (artefatto) e nastro a MOTORE_V=1 esplicito: messaggio a causa vera, zero penalita'; nastro a versione corrente: rigioca normale",
          'VECCHIO (v0) -- motoreV letto: ' + casoVecchio.motoreVLetto + ' (atteso 0)   partita avviata: ' + casoVecchio.replayInCorso + ' (atteso false)   ' +
          'messaggio: "' + casoVecchio.messaggio + '"' +
          '\n         V1 ESPLICITO -- motoreV letto: ' + casoV1.motoreVLetto + ' (atteso 1)   partita avviata: ' + casoV1.replayInCorso + ' (atteso false)   ' +
          'messaggio: "' + casoV1.messaggio + '"' +
          '\n         ATTUALE -- motoreV letto: ' + casoAttuale.motoreVLetto + ' (atteso > 0 = MOTORE_V corrente)   partita avviata: ' + casoAttuale.replayInCorso + ' (atteso true)');
      }
    }

    /* ===================================================================
       PROVA 14 -- CARD-NON-ATTRAVERSA (I2, onda di correzione della
       revisione finale, voce #107, 18 settembre 2026). startMatch non
       azzerava G.vantaggio: un sentinel con un cartellino pendente
       ({team:-1,...,card}, lasciato da un vantaggio CONCESSO per intero
       nella partita precedente) sopravviveva a startMatch, e
       resetKickoff (dentro startMatch stesso) lo leggeva gia' con la
       rosa NUOVA -- scaricaCardVantaggio() ammoniva un giocatore
       innocente al fischio d'inizio della partita nuova. NATA ROSSA su
       b837824 (prima di questa onda): zero banner cartellino atteso,
       gialli [0,0] attesi, ma G.vantaggio sopravviveva a startMatch e
       il banner CARTELLINO GIALLO compariva al kickoff. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_CARD_NON_ATTRAVERSA_ESEGUI(taglia);
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '14. CARD-NON-ATTRAVERSA', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const vantaggioAzzerato = scena.vantaggioDopoStartMatch === null;
        const zeroGialli = scena.gialliDopo[0] === 0 && scena.gialliDopo[1] === 0;
        const ok = vantaggioAzzerato && !scena.bannerCartellinoVisto && zeroGialli;
        di(ok, "14. CARD-NON-ATTRAVERSA -- sentinel con cartellino pendente a fine partita: startMatch nuova, zero banner cartellino, gialli [0,0]",
          'cartellino pendente a fine partita: idx ' + scena.sentinelCardFinePartita +
          '   G.vantaggio dopo startMatch: ' + JSON.stringify(scena.vantaggioDopoStartMatch) + ' (atteso null)   ' +
          'banner CARTELLINO visto al kickoff: ' + scena.bannerCartellinoVisto + ' (atteso false)   ' +
          'gialli dopo il kickoff: [' + scena.gialliDopo.join(',') + '] (atteso [0,0])');
      }
    }

    /* ===================================================================
       PROVA 15 -- PALLA-FUORI-IN-FINESTRA (I3, onda di correzione della
       revisione finale, voce #107, 18 settembre 2026). setScene
       scaricava il cartellino pendente anche con una finestra ANCORA
       VIVA: una palla spedita fuori campo durante la finestra faceva
       sparire il cartellino SENZA fischio ne' punizione -- il 5,1%
       "silenzioso" della contabilita' arbitrale del compito 3, mai
       spiegato allora. Dopo la cura, la palla ferma vera da' l'esito
       SFUMATO -- fischio ritardato dal punto salvato, NIENTE battuta,
       cartellino (se dovuto) al fischio -- perche' pallaFuori()
       intercetta la finestra viva PRIMA di costruire G.battuta. NATA
       ROSSA su b837824: nessun banner SFUMATO, la scena passava per
       'battuta', il cartellino spariva senza salire in t.disciplina.
       gialli. */
    {
      const scena = await pag.evaluate(({ seme, taglia }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia, sponde: 'campo' });
        t.setCpuVsCpu(true);
        return SCENA_PALLA_FUORI_IN_FINESTRA_ESEGUI();
      }, { seme: SEME, taglia: TAGLIA_BANCO }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '15. PALLA-FUORI-IN-FINESTRA', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const okCard = scena.cardAttesa == null || scena.gialliDopo === scena.gialliPrima + 1;
        const okCross = scena.crossToAlSfumato === -1;
        const ok = scena.vistoSfumato && !scena.battutaVista && scena.statoFinale === 'play' && okCard && okCross;
        di(ok, "15. PALLA-FUORI-IN-FINESTRA -- palla spedita fuori con la finestra ancora viva: fischio dal punto salvato, NIENTE battuta, cartellino al fischio, crossTo non rancido",
          'banner SFUMATO visto: ' + scena.vistoSfumato + ' (atteso true)   scena battuta vista: ' + scena.battutaVista + ' (atteso false)   ' +
          'stato finale: ' + scena.statoFinale + ' (atteso play, punizione rapida: il punto e\' lontano da ogni area)   ' +
          'cartellino atteso: idx ' + scena.cardAttesa + '   gialli squadra ' + scena.foulTeam + ': ' + scena.gialliPrima + ' -> ' + scena.gialliDopo + ' (atteso +1 se il cartellino era dovuto)   ' +
          'crossTo al fotogramma del banner SFUMATO: ' + scena.crossToAlSfumato + ' (atteso -1, armato a 0 prima dell\'uscita; letto SUBITO, prima che un calcio successivo lo azzeri comunque)');
      }
    }

    /* ===================================================================
       PROVA 16 -- VANTAGGIO-IN-AREA (I5, onda di correzione della
       revisione finale, voce #107, 18 settembre 2026). CONTROLLO
       DISCRIMINANTE, nasce verde: non esercita codice nuovo, dichiara un
       comportamento che il codice aveva gia' -- checkSlideContact apre
       la finestra ANCHE per un fallo dentro l'area (nessun dentroArea()
       sulla riga che apre G.vantaggio), e la decisione punizione-
       immediata-vs-rigore si prende SOLO alla risoluzione
       (eseguiSfumato, inArea=dentroArea(vTeam,vx,vy)), mai al momento
       del fallo. SCENA_FALLO('dentro') e' la STESSA scena di PROVA 1
       (x=60, y=centro campo: dentro l'area vera a ogni taglia). Due
       condanne insieme: niente fischio immediato prima che la finestra
       si apra (che copre anche l'attesa del kickoff, come tutte le
       altre scene del vantaggio); se la conservazione si perde (come
       PROVA 8), il fischio ritardato deve dare RIGORE dal punto --
       scena 'freekick', perche' il punto e' dentro l'area. */
    {
      const totale = 200;
      const scena = await pag.evaluate(({ seme, taglia, totale }) => {
        const t = window.__test;
        t.semina(seme);
        t.startMatch(1, 1, { size: taglia });
        t.setCpuVsCpu(true);
        return SCENA_VANTAGGIO_AREA_ESEGUI(totale);
      }, { seme: SEME, taglia: TAGLIA_BANCO, totale }).catch(e => ({ errore: e.message }));
      if (scena.errore) { di(false, '16. VANTAGGIO-IN-AREA', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const okNiente = !scena.fischioImmediato && scena.vantaggioApertoSubito;
        const okRigore = scena.vistoSfumato && scena.statoFinale === 'freekick';
        const ok = okNiente && okRigore;
        di(ok, "16. VANTAGGIO-IN-AREA -- fallo DENTRO l'area con azione che prosegue: niente rigore immediato, finestra aperta; se sfuma, RIGORE dal punto (CONTROLLO DISCRIMINANTE)",
          'fischio immediato prima che la finestra si aprisse: ' + scena.fischioImmediato + ' (atteso false)   finestra aperta: ' + scena.vantaggioApertoSubito + ' (atteso true)   ' +
          'banner SFUMATO visto: ' + scena.vistoSfumato + '   stato finale: ' + scena.statoFinale + " (atteso freekick, il punto e' dentro l'area: areaProf=" + scena.areaProf + ', areaSemi=' + scena.areaSemi + ')');
      }
    }

    if (ecc.length) { di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]); }
  } catch (e) {
    console.error('FALLITO: ' + e.message);
    await browser.close(); srv.chiudi();
    process.exit(2);
  }

  await ctx.close(); await browser.close(); srv.chiudi();
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' -- ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  process.exit(rossi ? 1 : 0);
})();
