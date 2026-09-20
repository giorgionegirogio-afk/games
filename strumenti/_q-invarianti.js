/* =====================================================================
   _q-invarianti.js -- IL BANCO DELLE INVARIANTI (voce #125, onda C — 1).

   IL PERCHE'. Il mandato (Appendice A, INV-01..15) chiede che certe
   proprieta' del motore valgano SEMPRE, a ogni fotogramma di qualunque
   partita: sono il prerequisito di un fuzzer (senza sapere COSA cercare,
   input casuali non dicono niente) e di un soak (1000 partite/notte, zero
   violazioni). Questo file e' un BANCO, non codice sempre-attivo: legge lo
   stato del motore via `__test` (come _diag-nan.js/_q-determinismo.js/
   _q-umore.js) durante partite CPU-CPU guidate da qui, e verifica NOVE
   invarianti (le prime sei dal compito 1, le ultime tre -- clamp
   fiato/cond, >=2 uomini di movimento, palla sotto il piano/velocita' --
   dal compito 2, stesso cantiere).

   LE NOVE PROVE (ciascuna nata rossa su un bugiardo, vedi sotto):
     1. NaN/Infinity   -- isFinite su ball.{x,y,z,vx,vy,vz} e su
        p.{x,y,vx,vy,aiTX,aiTY} per ogni giocatore. Assorbe _diag-nan.js
        come invariante permanente di batteria.
     2. owner valido   -- G.ball.owner e' -1 oppure un intero in
        [0,N-1], e se >=0 il giocatore non e' out>0 (non puo' avere la
        palla chi e' fuori dal campo).
     3. punteggio monotono -- G.score[0]/G.score[1] non diminuiscono mai
        fra due campioni consecutivi.
     4. timeLeft monotono  -- G.timeLeft non cresce mai fra due campioni
        e non e' mai < 0.
     5. durata<=tetto (INV-15) -- la partita raggiunge lo stato 'end'
        entro 13200 fotogrammi (220 s di gioco a taglia 5, LO STESSO tetto
        gia' misurato da _q-cpu-ordine.js per lo stesso scenario CPU-CPU).
        Generalizzato a N semi (di serie 8, vedi --semi).
     6. cronometri-fratelli (LA PIU' A RISCHIO — cinque regressioni pagate
        a mano: #86/#87/#107/#117/#122) -- SUBITO dopo startMatch, prima
        di simulare un solo fotogramma, ogni cronometro della famiglia
        dichiarata NEL GIOCO STESSO e' al suo valore di riposo. La lista
        (letta dai commenti veri, non indovinata):
          G.recT        0     (CALCETTO-il-gioco.html:11103, azzerato in startMatch)
          G.vantaggio   null  (:11018, "I2", voce #107 -- un sentinel con
                                cartellino pendente sopravviveva a startMatch)
          G.possOwner   -1    (:11116, "I QUATTRO CRONOMETRI FRATELLI DI recT")
          G.possT       0     (:11116, idem — aiDecide lo LEGGE)
          G.pulse       0     (:11116, idem)
          G.crowdSndT   0     (:11116, idem)
          G.swLock      [0,0] (:11128, "IL SESTO CRONOMETRO FRATELLO", voce #117 compito 6)
          G.swTimer     [0,0] (:11128, idem)
        NOTA: la lista NON include G.spintaScalino (voce #117 compito 4):
        quel campo riposa a [1,1], non a zero (zero e' GIA' lo scalino di
        riposo, vedi CALCETTO-il-gioco.html:11094-11102) — e' un valore di
        riposo diverso, non un ottavo cronometro di questa stessa famiglia
        dichiarata, e mescolarlo qui avrebbe reso l'invariante o falsa (se
        si pretendesse zero) o taciuta (se si saltasse il controllo senza
        dirlo). Resta fuori, dichiarato, non dimenticato.
        NOTA ONESTA (dal compito 1, riportata qui per la mappa INV-01..15
        piu' sotto): G.swLock/G.swTimer sono scritti SOLO da un cambio di
        controllo umano (Touch5/tastiera) -- un banco CPU-CPU come questo
        non li tocca mai, quindi la prova 6 verifica "sono a riposo dopo
        startMatch" ma NON "vengono azzerati attivamente da qualcosa che
        li aveva sporcati": e' un'invariante DEBOLE su questi due campi
        specifici finche' un fuzzer con input umano non la esercita
        davvero (vedi la mappa INV-01..15, INV-05).
     7. clamp fiato/cond -- p.fiato e p.cond in [0,100] per OGNI
        giocatore, a OGNI tick campionato (portiere compreso: il campo
        esiste per tutti, anche se solo i giocatori di movimento lo
        consumano con lo sprint). NON duplica p.umore/p.nervi/G.spinta:
        quei tre sono gia' coperti da strumenti/_q-umore.js, PROVA STATI,
        sub-prova "e-stati" (clamp umore/nervi/spinta per l'intera
        partita) -- qui si aggiunge solo fiato/cond, che quel banco non
        guarda.
     8. >=2 uomini di movimento in campo -- per ogni squadra, a OGNI tick
        campionato, i giocatori con role!=='gk' e out<=0 sono >=2 (la
        regola di casa, CALCETTO-il-gioco.html:18514-18517: "mai sotto i
        due uomini di movimento: sotto quella soglia il gioco si rompe").
        Il gioco stesso la protegge gia' (infliggiCartellino nega
        l'espulsione se diMovimentoInCampo(team).length non e' >2 PRIMA
        del cartellino): questa prova la ricontrolla dall'esterno, sulla
        STESSA definizione (movimento = non gk, in campo = out<=0), cosi'
        una futura regressione nella guardia del gioco la condanna qui.
     9. palla sotto il piano / velocita' -- G.ball.z >= 0 SEMPRE (ogni
        tick, qualunque stato della palla: portata, ferma, in volo); la
        velocita' orizzontale (len(vx,vy)) e verticale (|vz|) SOLO a
        palla LIBERA (owner<0) restano entro un tetto calibrato (vedi
        TETTO_VEL_PALLA/TETTO_VZ_PALLA piu' sotto). La palla LIBERA e' la
        condizione giusta: a palla POSSEDUTA (owner>=0) il ramo "furto col
        corpo" (CALCETTO-il-gioco.html:18908, b.vx=(tx-b.x)*14) riusa
        vx/vy come termine di correzione verso il piede del portatore, non
        come cinematica di volo -- misurato in questo stesso compito,
        picchi fino a 5974 u/s a schermo fermo (palla "agganciata" al
        portatore, nessun moto visibile): includerlo qui avrebbe prodotto
        un falso allarme sul suo stesso meccanismo di dribbling, la
        lezione #112/#114 che il piano chiede di evitare.

   IL CLAMP GIA' NEL GIOCO (verificato prima di scrivere la prova 9).
   z: nessuna guardia nominata, ma la fisica di volo (updateBall,
   CALCETTO-il-gioco.html:18959-18963) integra b.z SOLO quando b.z>0 ||
   b.vz>0, e schiaccia b.z=0 non appena l'integrazione lo farebbe scendere
   sotto zero -- z<0 non e' raggiungibile dal motore per costruzione, non
   solo per assenza di controesempi misurati.
   velocita' orizzontale: kickBall (:14815) e' l'imbuto di OGNI calcio, e
   fireShotMirato (:16437) e sparaTiro/lob (:16187, tiroVelocita) chiudono
   la potenza in Math.min(TIRO_TETTO, ...) con TIRO_TETTO=860 (:16181,
   "oltre, il pallone diventa un proiettile" -- un tetto DICHIARATO dal
   gioco stesso, non indovinato da questo banco). Non e' un tetto
   assoluto su ogni possibile vx/vy (lo spin si somma DOPO il clamp, vedi
   sotto), ma e' la prova che il gioco ha gia' pensato al problema.
   TETTO_VEL_PALLA e TETTO_VZ_PALLA (calibrazione empirica, 17-20 settembre
   2026, strumenti/../fuori/_misura-palla.js, USA-E-GETTA, non committato):
   su 30 semi (20260920..20260949, taglia 5, stesso ordine setCpuVsCpu di
   questo banco), 222282 fotogrammi campionati, filtrando SOLO owner<0:
     massimo len(vx,vy) osservato = 902,0 u/s (seme 20260922, fotogramma
       325: vx=855,5 ny*speed+spinY=-286 -- il caso TIRO_TETTO=860 PIU' lo
       spin che fireShot somma a parte su vy, quindi la risultante supera
       leggermente 860: spiegato dal codice, non un bug).
     massimo |vz| osservato = 267,9 u/s (seme 20260937, fotogramma 4060:
       una discesa lunga e regolare da gravita' -560 u/s^2, -9,33/frame,
       fino all'atterraggio -- un pallonetto alto rimbalzato, non
       un'esplosione numerica).
     minimo z osservato = 0 su tutti i 222282 fotogrammi: ZERO violazioni
       vere. Il gioco e' SANO su questa misura: nessuna scoperta P0.
   Il tetto scelto e' l'osservato x1,5 (margine dichiarato dal piano):
     TETTO_VEL_PALLA = 902 * 1,5 = 1353 u/s
     TETTO_VZ_PALLA  = 268 * 1,5 = 402 u/s
   Il margine assorbe variazioni legittime (spin, bounce, semi diversi)
   senza inseguire il numero esatto di oggi -- la lezione #112/#114 vale
   anche qui: una soglia tirata al millimetro condannerebbe un domani
   legittimo.

   COME SI CAMPIONA. Ogni tick simulato (t.simulate(1/60)), NON
   sottocampionato: a taglia 5 sono solo 10 giocatori, il costo per tick e'
   O(giocatori) e non giustifica saltare fotogrammi (vedi Vincolo globale
   #3 del piano: le invarianti strutturali valgono a ogni taglia, qui si
   misura a taglia 5 di serie — #98, il determinismo e' instabile a
   7/11 — con --taglia per chi vuole forzare la deviazione, dichiarandola).
   La prova 6 si campiona una volta per partita, SUBITO dopo startMatch
   (non e' un invariante-per-tick, e' un invariante-al-fischio). Le prove
   7/8/9 sono per-tick come 1-4, sullo stesso campionamento.

   L'ORDINE DI setCpuVsCpu (voce #121, seguito #108, chiuso qui dal
   compito #124 su _c3-sorteggi): SEMPRE startMatch PRIMA, setCpuVsCpu(true)
   DOPO in questo banco (il contrario annulla l'intento e la squadra 0
   resta "umana immobile" — sintomo #108/#119). L'UNICA eccezione voluta e'
   `--bugiardo durata`, che inverte l'ordine DI PROPOSITO per riprodurre lo
   scenario-hang #119 e dimostrare che la prova 5 lo condanna.

   IL METODO BUGIARDO (ogni prova nasce rossa). `window.__test.G` e' lo
   STESSO oggetto che il motore usa (non una copia, verificato: e' un
   riferimento vivo esposto in fondo a window.__test, "G, Duel, Tut"):
   per NaN/owner/punteggio/timeLeft basta corrompere G dal banco stesso,
   nessuna patch al gioco serve — e' la "scena sintetica" prevista dal
   piano. Per il cronometro-fratello serve invece un vero bugiardo di
   gioco (l'assenza di un azzeramento in startMatch non si puo' simulare
   da fuori senza patchare il codice che dovrebbe farla): vedi
   strumenti/_crit-inv-cronometri.js, che toglie SOLO l'azzeramento di
   G.swLock e produce fuori/bugiardo-cronometri.html (gitignored, mai
   committato).
     --bugiardo nan         inietta ball.x=NaN a un fotogramma fisso
     --bugiardo owner       inietta G.ball.owner=999 (fuori range)
     --bugiardo punteggio   decrementa G.score[0] di 1
     --bugiardo timeleft    fa risalire G.timeLeft di 5 secondi
     --bugiardo durata      inverte l'ordine setCpuVsCpu/startMatch (hang #119)
     --bugiardo fiato       inietta p.fiato=150 su un giocatore (prova 7)
     --bugiardo movimento   inietta out>0 su 3 uomini di movimento della
                            stessa squadra in una scena sintetica (prova 8,
                            NON passa da infliggiCartellino: quella guardia
                            e' proprio cio' che si vuole scavalcare per
                            dimostrare che LA PROVA, non il gioco, coglie
                            la violazione)
     --bugiardo ballz       inietta G.ball.z=-10 (prova 9, sotto il piano)
     --bugiardo ballvel     inietta G.ball.vx=999999, owner=-1 (prova 9,
                            velocita' assurda a palla libera)
   L'INIEZIONE (nan/owner/punteggio/timeleft/fiato/movimento/ballz/ballvel)
   avviene DOPO un fotogramma normale gia' verificato pulito, e la verifica
   si ripete SUBITO, SENZA un altro t.simulate() in mezzo: si dimostra che
   il banco vede lo stato corrotto, senza chiedere al motore di correre
   fisica sopra uno stato che lui stesso non ha mai prodotto (es.
   G.players[999] che non esiste — rischio di un'eccezione estranea alla
   prova). Il seme interrotto da un'iniezione NON conta come violazione
   della prova 5 (durata): e' un'interruzione voluta, dichiarata, non un
   hang.
   Con --bugiardo (salvo --semi esplicito) gira UN solo seme: basta a
   dimostrare la condanna, ed e' piu' veloce da rileggere in una revisione.

   uso:  node strumenti/_q-invarianti.js
         node strumenti/_q-invarianti.js --gioco fuori/bugiardo-cronometri.html
         node strumenti/_q-invarianti.js --bugiardo nan
         node strumenti/_q-invarianti.js --bugiardo owner
         node strumenti/_q-invarianti.js --bugiardo punteggio
         node strumenti/_q-invarianti.js --bugiardo timeleft
         node strumenti/_q-invarianti.js --bugiardo durata
         node strumenti/_q-invarianti.js --bugiardo fiato
         node strumenti/_q-invarianti.js --bugiardo movimento
         node strumenti/_q-invarianti.js --bugiardo ballz
         node strumenti/_q-invarianti.js --bugiardo ballvel
         node strumenti/_q-invarianti.js --taglia 5 --seme 20260920 --semi 8
   esce 0 se le nove prove sono verdi, 1 se almeno una e' rossa, 2 se il
   banco stesso e' esploso (pagina, hook mancante, eccezione), 3 se l'uso
   e' sbagliato.

   LA MAPPA INV-01..15 (mandato, Appendice A, _analisi/MANDATO-STADIUM-ROAR.md
   righe 644-658 -- un mandato generico da simulatore calcistico 11-a-side;
   CALCETTO e' futsal a taglia 5/7/11, alcune INV non hanno un analogo nel
   gioco reale, dichiarato caso per caso, ONESTAMENTE — non si dichiara
   coperta un'INV che il banco non verifica davvero):
     INV-01 determinismo (stesso seed/input -> stesso hash)
       -> ALTROVE: strumenti/_q-determinismo.js (confronta lo stato intero
          fra due run identiche, non un hash di eventi come il mandato
          generico, ma lo stesso principio).
     INV-02 una sola palla; posizione finita; |velocita'|<=45 m/s; mai
          sotto il piano
       -> QUI (parziale) + N/A (parziale): "una sola palla" e' strutturale
          (G.ball e' un oggetto singolo, non un array — non testabile a
          runtime in modo significativo, vero per costruzione). Posizione
          finita: prova 1 (NaN/Infinity). Mai sotto il piano e velocita'
          entro un tetto: prova 9 -- il tetto e' in unita' di campo del
          gioco (u/s), NON in m/s: non esiste un'equivalenza dichiarata fra
          le due scale, quindi "45 m/s" del mandato generico non si traduce
          qui 1:1 -- si usa un tetto calibrato sul gioco reale (vedi sopra).
     INV-03 organico: 11/11 meno espulsi, mai <7; sostituzioni <= limite;
          un espulso non rientra mai
       -> QUI, ADATTATA: la regola di casa e' ">=2 uomini di movimento"
          (prova 8), non "mai <7" (CALCETTO e' 5/7/11, non 11 fisso).
          L'espulsione in CALCETTO e' TEMPORANEA (p.out e' un cronometro
          in secondi, CALCETTO-il-gioco.html:10629): "un espulso non
          rientra mai" non si applica, e' un disegno diverso da quello del
          mandato generico, dichiarato qui invece di forzare un'invariante
          falsa.
     INV-04 ogni giocatore dentro i confini del campo + 5 m di margine,
          salvo uscite permesse
       -> RIMANDATA al fuzzer/soak: richiede posizioni limite che un banco
          deterministico a seme fisso non forza di proposito; nessun banco
          oggi verifica i confini di posizione dei giocatori.
     INV-05 cronometro di partita monotono; corre durante i fermi
          "diegetici", si ferma solo per tempo non-diegetico; recupero
          proporzionale ai fermi; cambi solo a palla ferma
       -> QUI (parziale): G.timeLeft monotono non crescente e mai<0 e'
          prova 4. Il resto (recupero calcolato, cambi solo a fermo) non
          e' modellato in CALCETTO in questi termini — N/A per quella
          parte. NOTA ONESTA: i cronometri-fratelli (prova 6) toccano
          switch di controllo (G.swLock/G.swTimer) che un banco CPU-CPU
          non esercita mai da soli (li scrive solo l'input umano): la
          prova 6 e' quindi DEBOLE su quei due campi specifici finche' un
          fuzzer con input umano-simulato non la mette sotto pressione
          vera (vedi la nota nella prova 6 piu' sopra).
     INV-06 un gol richiede palla-tutta-oltre-la-linea fra i pali e sotto
          la traversa, e una sequenza di ripresa valida; niente gol diretto
          da rimessa laterale/punizione indiretta/mani del portiere
       -> RIMANDATA: nessun banco oggi verifica la VALIDITA' del gol
          (solo il conteggio, prova 3). Candidato per un banco dedicato
          futuro o per il fuzzer/soak.
     INV-07 ogni ripresa di gioco segue un fermo, e la palla e' ferma nel
          punto giusto al momento della ripresa
       -> RIMANDATA: non testata da nessun banco oggi.
     INV-08 sequenza cartellini: secondo giallo=>rosso=>fuori; i conteggi
          non diminuiscono mai; protesta riservata al capitano
       -> ALTROVE (parziale): strumenti/_q-regole.js copre gia' scenari di
          sequenza cartellino/vantaggio (giallo differito, DOGSO-gol,
          grazia-dopo-card). "I conteggi non diminuiscono mai" e' vero per
          costruzione (p.gialli++ e' l'unico sito di scrittura, mai un
          decremento) ma NESSUN banco lo asserisce esplicitamente oggi —
          dichiarato scoperto, non testato. "Protesta riservata al
          capitano" non esiste in CALCETTO — N/A.
     INV-09 il fuorigioco si decide sempre dal tick dell'ultimo tocco di un
          compagno; mai da rimessa dal fondo/laterale/corner
       -> N/A: CALCETTO/futsal non ha la regola del fuorigioco. Non
          applicabile al gioco.
     INV-10 stati emotivi in [0,1]; moltiplicatori d'effetto entro il tetto
          di 7,5; simmetria speculare della storia
       -> ALTROVE (parziale, range diverso dal mandato): strumenti/
          _q-umore.js, PROVA STATI sub-prova "e-stati" copre p.umore in
          [-1,1] (non [0,1]: il gioco usa un range con segno, adattamento
          dichiarato), p.nervi in [0,1], G.spinta in [-1,1]. "Moltiplicatori
          entro 7,5" e "simmetria speculare della storia" non hanno un
          analogo dichiarato nel gioco — N/A/rimandata.
     INV-11 fatica non crescente durante i fermi oltre il recupero base;
          la resistenza non e' mai <0
       -> QUI (parziale): p.fiato/p.cond in [0,100] e' prova 7 (il tetto
          superiore vale anche come "mai <0" sul lato basso). "Non
          crescente durante i fermi oltre il recupero base" richiederebbe
          distinguere le fasi di fermo dal resto: non verificato
          esplicitamente, dichiarato scoperto.
     INV-12 la presentazione non muta mai lo stato della simulazione
          (write-barrier)
       -> ALTROVE: il metodo due-versioni/disegno-puro dei cantieri di
          resa (es. voce #87, #107) verifica che il disegno non tocchi G.
     INV-13 rete: il tick server e' autorevole; input client fuori
          finestra scartato e contato; decode(encode(s)) entro
          quantizzazione
       -> N/A: CALCETTO e' locale, nessuna rete/multiplayer nel gioco.
     INV-14 il risultato si sottomette una volta sola, con firma valida e
          hash di replay corrispondente
       -> N/A: nessun sistema di submission/replay-hash in CALCETTO.
     INV-15 durata reale <= attesa + 25% (rileva stati bloccati)
       -> QUI: prova 5 (durata<=13200 fotogrammi, 220 s a taglia 5).
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

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('uso: node strumenti/_q-invarianti.js [--gioco file.html] [--taglia 5] [--seme N] [--semi 8]');
  console.log('                                     [--bugiardo nan|owner|punteggio|timeleft|durata|fiato|movimento|ballz|ballvel]');
  process.exit(3);
}

const BUGIARDI_NOTI = new Set(['nan', 'owner', 'punteggio', 'timeleft', 'durata', 'fiato', 'movimento', 'ballz', 'ballvel']);
const BUGIARDO = arg('bugiardo', '');
if (BUGIARDO && !BUGIARDI_NOTI.has(BUGIARDO)) {
  console.error('USO: --bugiardo deve essere uno fra: ' + [...BUGIARDI_NOTI].join(', '));
  process.exit(3);
}

const SEME_CANTIERE = 20260920;   // la data del piano d'esecuzione del cantiere (voce #125), default del flag --seme
/* VINCOLO #98: il determinismo e' instabile a 7/11, la misura di serie e'
   a taglia 5. Il flag resta per chi vuole forzare la deviazione, dichiarandola. */
const TAGLIA_BANCO = +arg('taglia', 5);
const SEME = +arg('seme', SEME_CANTIERE);
const argSemiEsplicito = process.argv.includes('--semi');
/* Di serie 8 semi (il piano suggerisce 8-10): generalizza la prova 5
   (durata) oltre i due scenari fissi di _q-cpu-ordine.js, e da' alla
   prova 6 (cronometri-fratelli) almeno una seconda partita sulla stessa
   pagina, condizione necessaria perche' una sopravvivenza si veda (la
   primissima partita dopo il caricamento e' gia' a riposo per
   dichiarazione iniziale, azzerata o no da startMatch). In modalita'
   --bugiardo nan/owner/punteggio/timeleft/fiato/movimento/ballz/ballvel
   basta UN seme a dimostrare la condanna (l'iniezione e' indipendente dal
   seme): di serie si riduce a 1, salvo --semi esplicito.
   --bugiardo durata E' DIVERSO, MISURATO: l'ordine sbagliato NON blocca
   OGNI seme in 'freekick' (la squadra 0 "umana immobile" si incastra solo
   se il gioco la porta a battere una punizione) -- su 20 semi da
   SEME_CANTIERE, 10 su 20 restano incastrati, gli altri 10 raggiungono
   'end' lo stesso (misurato in questo stesso cantiere). Un solo seme
   sarebbe un'estrazione: qui la condanna deve essere ROBUSTA, non un
   colpo di fortuna, quindi durata usa 10 semi di serie anche senza
   --semi esplicito. */
const SEMI_BANCO = argSemiEsplicito ? +arg('semi', 8) : (BUGIARDO === 'durata' ? 10 : (BUGIARDO ? 1 : 8));
/* 220 s di gioco -- lo stesso tetto di sicurezza gia' misurato da
   _q-umore.js e _q-cpu-ordine.js per una partita CPU-CPU a taglia 5. */
const TETTO_FOTOGRAMMI = 13200;
/* Il fotogramma dell'iniezione per i bugiardi nan/owner/punteggio/
   timeleft: 150 = 2,5 s, ben oltre il kickoff piu' lungo (stesso ordine
   di grandezza del CARTELLINO_FRAME=120 di _q-umore.js), cosi' la scena
   e' gia' 'play' con ball/players popolati e in moto. */
const INIETTA_AL_FRAME = 150;
/* PROVA 9 -- calibrazione empirica (vedi la lettera di testa): massimo
   osservato su 30 semi/222282 fotogrammi a palla libera (owner<0), poi
   osservato x1,5 come margine dichiarato. */
const OSSERVATO_SP_MAX_LIBERA = 902;   // u/s, len(vx,vy), palla libera
const OSSERVATO_VZ_MAX = 268;          // u/s, |vz|, palla libera
const TETTO_VEL_PALLA = OSSERVATO_SP_MAX_LIBERA * 1.5;   // 1353
const TETTO_VZ_PALLA = OSSERVATO_VZ_MAX * 1.5;           // 402

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

/* =========================================================================
   LA SONDA -- gira dentro la pagina, in UN SOLO page.evaluate: come ogni
   banco di casa, nessun rumore di rete fra un fotogramma e l'altro. */
const SONDA = (cfg) => {
  const t = window.__test;
  const r = {
    nan: [], owner: [], punteggio: [], timeLeft: [], durata: [], cronometri: [],
    clamp: [], movimento: [], palla: [],
    semiAbortitiDaViolazione: [], semiEseguiti: 0, tickTotali: 0,
  };
  const CAMPI_BALL = ['x', 'y', 'z', 'vx', 'vy', 'vz'];
  const CAMPI_P = ['x', 'y', 'vx', 'vy', 'aiTX', 'aiTY'];

  for (let k = 0; k < cfg.semi; k++) {
    const seme = cfg.seme0 + k;
    t.semina(seme);

    /* L'ORDINE (vedi la lettera di testa): giusto di serie, invertito
       SOLO per --bugiardo durata, e per TUTTI i semi di quella corsa —
       lo scenario-hang #119 non dipende dal seme. */
    if (cfg.ordineSbagliato) {
      t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: cfg.taglia });
    } else {
      t.startMatch(1, 1, { size: cfg.taglia });
      t.setCpuVsCpu(true);
    }

    /* PROVA 6 -- CRONOMETRI-FRATELLI, SUBITO dopo startMatch. */
    const G = t.G;
    const guasti = [];
    if (G.recT !== 0) guasti.push('G.recT=' + G.recT + ' (atteso 0)');
    if (G.vantaggio !== null) guasti.push('G.vantaggio=' + JSON.stringify(G.vantaggio) + ' (atteso null)');
    if (!(G.possOwner === -1)) guasti.push('G.possOwner=' + G.possOwner + ' (atteso -1)');
    if (!(G.possT === 0)) guasti.push('G.possT=' + G.possT + ' (atteso 0)');
    if (!(G.pulse === 0)) guasti.push('G.pulse=' + G.pulse + ' (atteso 0)');
    if (!(G.crowdSndT === 0)) guasti.push('G.crowdSndT=' + G.crowdSndT + ' (atteso 0)');
    if (!(G.swLock[0] === 0 && G.swLock[1] === 0)) guasti.push('G.swLock=' + JSON.stringify(G.swLock) + ' (atteso [0,0])');
    if (!(G.swTimer[0] === 0 && G.swTimer[1] === 0)) guasti.push('G.swTimer=' + JSON.stringify(G.swTimer) + ' (atteso [0,0])');
    if (guasti.length) r.cronometri.push({ seme, indiceMatch: k, guasti });

    let prevScore = [G.score[0], G.score[1]];
    let prevTimeLeft = G.timeLeft;

    const verificaTick = (fotogramma, fase) => {
      let violato = false;
      const b = G.ball;
      for (const kk of CAMPI_BALL) {
        if (!Number.isFinite(b[kk])) { r.nan.push({ seme, fotogramma, fase, chi: 'ball.' + kk, val: b[kk] }); violato = true; }
      }
      /* PROVA 8 -- >=2 UOMINI DI MOVIMENTO IN CAMPO, per squadra. Stessa
         definizione del gioco (CALCETTO-il-gioco.html:18504-18509,
         diMovimentoInCampo): role!=='gk' && out<=0. Contata qui, non
         chiamando la funzione del gioco (non esposta via __test) — la
         doppia implementazione e' voluta: se la guardia del gioco regredisse,
         questa prova indipendente la coglie comunque. */
      const movimentoInCampo = [0, 0];
      for (let i = 0; i < G.players.length; i++) {
        const p = G.players[i];
        if (p.role !== 'gk' && p.out <= 0) movimentoInCampo[p.team]++;
      }
      for (let tt = 0; tt < 2; tt++) {
        if (movimentoInCampo[tt] < 2) {
          r.movimento.push({ seme, fotogramma, fase, team: tt, inCampo: movimentoInCampo[tt] }); violato = true;
        }
      }
      for (let i = 0; i < G.players.length; i++) {
        const p = G.players[i];
        for (const kk of CAMPI_P) {
          if (!Number.isFinite(p[kk])) { r.nan.push({ seme, fotogramma, fase, chi: 'p' + i + '.' + kk + ' (' + p.role + ')', val: p[kk] }); violato = true; }
        }
        /* PROVA 7 -- CLAMP FIATO/COND. p.umore/p.nervi/G.spinta NON si
           duplicano qui: gia' coperti da _q-umore.js, PROVA STATI
           sub-prova "e-stati" (vedi la lettera di testa). */
        if (!(p.fiato >= 0 && p.fiato <= 100)) { r.clamp.push({ seme, fotogramma, fase, chi: 'p' + i + '.fiato (' + p.role + ')', val: p.fiato }); violato = true; }
        if (!(p.cond >= 0 && p.cond <= 100)) { r.clamp.push({ seme, fotogramma, fase, chi: 'p' + i + '.cond (' + p.role + ')', val: p.cond }); violato = true; }
      }
      const owner = G.ball.owner;
      const ownerOk = owner === -1 || (Number.isInteger(owner) && owner >= 0 && owner < G.players.length && !(G.players[owner].out > 0));
      if (!ownerOk) { r.owner.push({ seme, fotogramma, fase, owner, nGiocatori: G.players.length }); violato = true; }

      /* PROVA 9 -- PALLA SOTTO IL PIANO / VELOCITA'. z>=0 SEMPRE; la
         velocita' SOLO a palla libera (owner<0) -- vedi la lettera di
         testa sul perche' escludere la palla posseduta (il ramo "furto
         col corpo" riusa vx/vy come correzione, non come cinematica). */
      if (b.z < 0) { r.palla.push({ seme, fotogramma, fase, tipo: 'z', val: b.z }); violato = true; }
      if (owner < 0) {
        const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (sp > cfg.tettoVelPalla) { r.palla.push({ seme, fotogramma, fase, tipo: 'velocita', val: sp, vx: b.vx, vy: b.vy }); violato = true; }
        if (Math.abs(b.vz) > cfg.tettoVzPalla) { r.palla.push({ seme, fotogramma, fase, tipo: 'vz', val: b.vz }); violato = true; }
      }

      if (G.score[0] < prevScore[0] || G.score[1] < prevScore[1]) {
        r.punteggio.push({ seme, fotogramma, fase, prima: prevScore.slice(), dopo: G.score.slice() }); violato = true;
      }
      prevScore = [G.score[0], G.score[1]];

      if (G.timeLeft > prevTimeLeft + 1e-9 || G.timeLeft < 0) {
        r.timeLeft.push({ seme, fotogramma, fase, prima: prevTimeLeft, dopo: G.timeLeft }); violato = true;
      }
      prevTimeLeft = G.timeLeft;
      return violato;
    };

    let fotogrammi = 0, raggiuntoEnd = false, violatoQuiSeme = false;
    for (; fotogrammi < cfg.tetto; fotogrammi++) {
      t.simulate(1 / 60);
      r.tickTotali++;
      if (verificaTick(fotogrammi, 'normale')) { violatoQuiSeme = true; break; }

      if (cfg.bugiardo && k === 0 && cfg.bugiardo !== 'durata' && fotogrammi === cfg.iniettaAlFrame) {
        /* L'INIEZIONE -- vedi la lettera di testa: si corrompe G (lo
           stesso oggetto vivo del motore), poi si richiama verificaTick
           UNA volta, SENZA un altro simulate() in mezzo. */
        if (cfg.bugiardo === 'nan') G.ball.x = NaN;
        else if (cfg.bugiardo === 'owner') G.ball.owner = 999;
        else if (cfg.bugiardo === 'punteggio') {
          /* PER FAR SCENDERE UN PUNTEGGIO SERVE PRIMA UN VALORE VERO DA
             FAR SCENDERE: a inizio partita G.score e' spesso ancora
             [0,0], e un decremento clampato a 0 (Math.max(0,-1)) non
             cambierebbe nulla -- il bugiardo condannerebbe la prova
             SBAGLIATA (5, durata: il seme si fermerebbe senza violazione
             vera, e verrebbe letto come un hang). Si sale di proposito
             (lecito, non viola nulla: sale) per avere un campione fresco,
             poi si scende sotto QUEL campione. */
          G.score[0] = G.score[0] + 3;
          verificaTick(fotogrammi, 'iniettato-salita-lecita');
          G.score[0] = G.score[0] - 1;
        }
        else if (cfg.bugiardo === 'timeleft') G.timeLeft = G.timeLeft + 5;
        else if (cfg.bugiardo === 'fiato') G.players[0].fiato = 150;
        else if (cfg.bugiardo === 'movimento') {
          /* SCENA SINTETICA (prova 8): out>0 su 3 uomini di movimento
             della squadra 0, SENZA passare da infliggiCartellino -- la
             guardia del gioco (inCampo>2) e' proprio cio' che si scavalca
             per dimostrare che LA PROVA, non la guardia, condanna. Si
             ESCLUDE apposta il portatore di palla corrente (se e' della
             squadra 0): altrimenti la scena condannerebbe ANCHE la prova
             2 (owner) per un effetto collaterale, e la dimostrazione non
             sarebbe piu' isolata alla sola prova 8. */
          let messi = 0;
          for (let i = 0; i < G.players.length && messi < 3; i++) {
            const p = G.players[i];
            if (p.team === 0 && p.role !== 'gk' && p.out <= 0 && i !== G.ball.owner) { p.out = 1; messi++; }
          }
        }
        else if (cfg.bugiardo === 'ballz') G.ball.z = -10;
        else if (cfg.bugiardo === 'ballvel') { G.ball.owner = -1; G.ball.vx = 999999; G.ball.vy = 0; }
        if (verificaTick(fotogrammi, 'iniettato')) violatoQuiSeme = true;
        break;
      }

      if (t.state === 'end') { raggiuntoEnd = true; break; }
    }

    /* PROVA 5 -- DURATA<=TETTO. Un seme interrotto DI PROPOSITO da
       un'iniezione (bugiardo nan/owner/punteggio/timeleft) non e' un
       hang: si dichiara ESCLUSO, non lo si fa passare per una violazione
       che non e'. Lo scenario --bugiardo durata invece DEVE contare qui
       (e' esattamente cio' che deve condannare). */
    if (!raggiuntoEnd) {
      if (violatoQuiSeme && cfg.bugiardo && cfg.bugiardo !== 'durata') {
        r.semiAbortitiDaViolazione.push({ seme, motivo: cfg.bugiardo });
      } else {
        r.durata.push({ seme, fotogrammi, statoFinale: t.state });
      }
    }
    r.semiEseguiti++;
  }
  return r;
};

(async () => {
  const provaRel = arg('gioco', '');
  const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));

  console.log('\n=== IL BANCO DELLE INVARIANTI (voce #125) ===  ' +
    (provaAbs || 'CALCETTO-il-gioco.html (repo)') + '  taglia ' + TAGLIA_BANCO +
    '  seme ' + SEME + '  semi ' + SEMI_BANCO + (BUGIARDO ? '  bugiardo=' + BUGIARDO : ''));

  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(({ seme }) => {
      const t = window.__test;
      t.semina(seme);
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    }, { seme: SEME });

    const r = await pag.evaluate(`(${SONDA})(${JSON.stringify({
      taglia: TAGLIA_BANCO, seme0: SEME, semi: SEMI_BANCO, tetto: TETTO_FOTOGRAMMI,
      bugiardo: BUGIARDO, iniettaAlFrame: INIETTA_AL_FRAME, ordineSbagliato: BUGIARDO === 'durata',
      tettoVelPalla: TETTO_VEL_PALLA, tettoVzPalla: TETTO_VZ_PALLA,
    })})`);

    const primi = (arr, n, f) => arr.slice(0, n).map(f).join('\n         ') + (arr.length > n ? '\n         … e altri ' + (arr.length - n) : '');

    di(r.nan.length === 0, '1. NaN/Infinity -- ball.{x,y,z,vx,vy,vz} e p.{x,y,vx,vy,aiTX,aiTY} sempre finiti',
      r.nan.length === 0 ? r.tickTotali + ' fotogrammi campionati su ' + r.semiEseguiti + ' semi, nessun NaN/Infinity'
        : primi(r.nan, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.chi + '=' + v.val));

    di(r.owner.length === 0, '2. owner valido -- G.ball.owner e\' -1 oppure 0..N-1, e se >=0 il giocatore non e\' out>0',
      r.owner.length === 0 ? r.tickTotali + ' fotogrammi campionati, owner sempre valido'
        : primi(r.owner, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): owner=' + v.owner + ' (N=' + v.nGiocatori + ')'));

    di(r.punteggio.length === 0, '3. punteggio monotono -- G.score non diminuisce mai fra due campioni',
      r.punteggio.length === 0 ? r.tickTotali + ' fotogrammi campionati, punteggio sempre non decrescente'
        : primi(r.punteggio, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.prima.join('-') + ' -> ' + v.dopo.join('-')));

    di(r.timeLeft.length === 0, '4. timeLeft monotono -- G.timeLeft non cresce mai fra due campioni e non e\' mai < 0',
      r.timeLeft.length === 0 ? r.tickTotali + ' fotogrammi campionati, timeLeft sempre non crescente e >=0'
        : primi(r.timeLeft, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.prima.toFixed(3) + ' -> ' + v.dopo.toFixed(3)));

    let detDurata;
    if (r.durata.length === 0) {
      detDurata = r.semiEseguiti + ' semi, tutte le partite non escluse hanno raggiunto \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi';
      if (r.semiAbortitiDaViolazione.length) detDurata += ' (' + r.semiAbortitiDaViolazione.length + ' semi esclusi: interrotti di proposito da --bugiardo ' + BUGIARDO + ', non un hang)';
    } else {
      detDurata = primi(r.durata, 5, v => 'seme ' + v.seme + ': ' + v.fotogrammi + ' fotogrammi, stato finale \'' + v.statoFinale + '\' (non ha raggiunto \'end\')');
    }
    di(r.durata.length === 0, '5. durata<=tetto (INV-15) -- ogni partita raggiunge \'end\' entro ' + TETTO_FOTOGRAMMI + ' fotogrammi (220 s)', detDurata);

    di(r.cronometri.length === 0, '6. cronometri-fratelli -- recT/vantaggio/possOwner/possT/pulse/crowdSndT/swLock/swTimer al riposo subito dopo startMatch',
      r.cronometri.length === 0 ? r.semiEseguiti + ' partite (stessa pagina), tutti i cronometri a riposo a ogni startMatch'
        : primi(r.cronometri, 5, v => 'seme ' + v.seme + ' (partita #' + v.indiceMatch + ' sulla pagina): ' + v.guasti.join(', ')));

    di(r.clamp.length === 0, '7. clamp fiato/cond -- p.fiato e p.cond in [0,100] per ogni giocatore (umore/nervi/spinta: vedi _q-umore.js)',
      r.clamp.length === 0 ? r.tickTotali + ' fotogrammi campionati, fiato/cond sempre in [0,100]'
        : primi(r.clamp, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.chi + '=' + v.val));

    di(r.movimento.length === 0, '8. >=2 uomini di movimento in campo per squadra (role!=gk, out<=0)',
      r.movimento.length === 0 ? r.tickTotali + ' fotogrammi campionati, entrambe le squadre sempre >=2 uomini di movimento'
        : primi(r.movimento, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): squadra ' + v.team + ' ha ' + v.inCampo + ' uomini di movimento'));

    di(r.palla.length === 0, '9. palla sotto il piano/velocita\' -- z>=0 sempre; a palla libera len(vx,vy)<=' + TETTO_VEL_PALLA + ' e |vz|<=' + TETTO_VZ_PALLA,
      r.palla.length === 0 ? r.tickTotali + ' fotogrammi campionati, z sempre >=0 e velocita\' a palla libera sempre entro i tetti (osservato max ' + OSSERVATO_SP_MAX_LIBERA + '/' + OSSERVATO_VZ_MAX + ' u/s su 30 semi di calibrazione)'
        : primi(r.palla, 5, v => 'seme ' + v.seme + ' fotogramma ' + v.fotogramma + ' (' + v.fase + '): ' + v.tipo + '=' + v.val));

    if (ecc.length) di(false, 'BANCO -- nessuna eccezione di pagina', 'eccezione: ' + ecc[0]);
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
