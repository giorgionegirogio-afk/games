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
   non e' usato da nessuna delle sette prove di oggi.
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
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: taglia });
      return SCENA_FALLO(modo);
    }, { seme: SEME, taglia: TAGLIA_BANCO, modo }).catch(e => ({ errore: e.message }));

    /* ===================================================================
       PROVA 1 -- RIGORE-DENTRO. Controllo discriminante: fallo a x=60,
       y=centro campo. Dentro l'area vera E dentro la vecchia fascia a
       ogni taglia: deve aprire il duello sia oggi sia dopo la cura. */
    {
      const scena = await nuovaScenaFallo('dentro');
      if (scena.errore) { di(false, '1. RIGORE-DENTRO', 'BANCO: scena non costruita -- ' + scena.errore); }
      else {
        const r = await pag.evaluate(CORRI(FOTOGRAMMI_ATTESA));
        const ok = r.stato === 'freekick';
        di(ok, '1. RIGORE-DENTRO -- fallo a x=' + scena.x + ',y=' + scena.y + ' (centro campo): parte il duello (CONTROLLO DISCRIMINANTE, verde anche pre-cura)',
          'stato dopo il fallo: ' + r.stato + ' (atteso freekick) -- areaProf=' + scena.areaProf + ', areaSemi=' + scena.areaSemi + ', FH=' + scena.FH);
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia, sponde: 'campo' });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
        t.setCpuVsCpu(true);
        t.startMatch(1, 1, { size: taglia });
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
