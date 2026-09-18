/* =====================================================================
   _t-vantaggio.js -- IL VANTAGGIO ESISTE (voce #107, compito 3, terzo
   e ultimo compito del ramo voce-107-regole-leva-corta).

   IL PERCHE'. checkSlideContact (CALCETTO-il-gioco.html ~18137) fischia
   OGNI fallo da scivolata sul colpo: decide subito se aprire il duello
   (startFreeKick, dentro l'area vera o dal terzo fallo in su -- voce
   #107 compito 1) o una punizione rapida (punizioneRapida), infligge
   il cartellino se dovuto (infliggiCartellino) e la partita si ferma
   li', SEMPRE -- e' l'UNICA sorgente di fallo del gioco (censimento in
   _analisi/RIMESSE-E-ANGOLI.md e MAPPA-MANDATO area 1). Il banco
   strumenti/_q-regole.js porta gia' la prova 6.
   VANTAGGIO-FISCHIA-SEMPRE, nata ROSSA: un fallo con l'azione che
   prosegue (la vittima avanza col pallone) non lascia mai vivo il
   pallone -- punizioneRapida azzera SEMPRE la sua velocita' -- e la
   stringa 'VANTAGGIO' non esiste nel file.

   LA CURA, IN QUATTRO PARTI (mandato SS6.7, spec docs/superpowers/specs/
   2026-09-18-regole-leva-corta-design.md SS3).

   1. LO STATO. G.vantaggio = {team, x, y, t, card} -- team la squadra
      OFFESA (carrier.team, mai l'autore), x/y il punto del fallo
      (quello di p, l'autore: e' li' che il fischio ritardato deve
      tornare), t l'eta' della finestra in secondi REALI (passo fisso),
      card l'indice del giocatore da ammonire SE il fallo lo meritava
      (null altrimenti) -- il cartellino stesso resta pendente, mai
      inflitto all'apertura. Le manopole VANT_VALUTA=0,5 s (prima
      occhiata) e VANT_T=2,5 s (scadenza) nascono accanto a BATTUTA_*,
      un posto solo per ogni soglia del cantiere (come chiede il piano).

   2. L'APERTURA, in checkSlideContact. Il ramo del fallo non fischia
      piu' subito: apre G.vantaggio e la valutazione si sposta nel
      passo fisso del gioco vivo (punto 3). UN FALLO MENTRE UN
      VANTAGGIO E' GIA' PENDENTE (scelta dichiarata, la piu' semplice
      delle due offerte dal piano) non apre una seconda finestra: chiude
      SUBITO quella vecchia (scaricaCardVantaggio -- il suo cartellino,
      se dovuto, si infligge adesso) e fischia SUBITO il fallo nuovo,
      con la STESSA decisione area/cumulo/duello di sempre -- il ramo
      "gia' pendente" e' carattere per carattere quello che
      checkSlideContact faceva PRIMA di questo compito.

   3. LA VALUTAZIONE, in step(), subito dopo l'hit-stop -- come la
      finestra di battuta della voce #87, per la stessa ragione (passo
      fisso, non fotogrammi: la ripetibilita' e' tutto il punto). Zero
      dado(): CONSERVA = squadraDelPallone()===team (owner o lastTouch,
      la stessa regola di squadraDelPallone) E la x della palla piu'
      avanti della x salvata, nel verso della squadra offesa (team 0
      attacca +x, team 1 -x -- la stessa convenzione di dentroArea/
      resetKickoff in questo file). Prima occhiata a VANT_VALUTA,
      poi si ricontrolla OGNI passo fino a VANT_T: se la conservazione
      si perde in un punto qualunque della finestra, VANTAGGIO SFUMATO
      -- fischio ritardato dal punto SALVATO (mai da dove sono finiti i
      giocatori nel frattempo: la palla si riporta li' PRIMA di
      decidere, perche' ne' startFreeKick ne' punizioneRapida portano
      una posizione propria -- verificato leggendone la firma vera).
      Se la conservazione regge fino a VANT_T, banner VANTAGGIO: il
      fallo e' perdonato, il cartellino dovuto (se c'e') resta pendente
      in G.vantaggio.card e il resto si azzera (team:-1 spegne la
      guardia: la finestra chiusa non si rivaluta mai piu').

   4. IL CARTELLINO IN DIFFERITA (App. D). Un card pendente si infligge
      alla PRIMA palla ferma vera: setScene verso 'battuta'/'freekick'
      (il collo di bottiglia vero, verificato leggendo il file: ogni
      rimessa/angolo/rinvio passa da pallaFuori->setScene('battuta'),
      ogni duello da startFreeKick->setScene('freekick')) oppure
      resetKickoff (il kickoff, gol compreso -- SEMPRE chiamato prima
      del setScene('kickoff') che segue, sia a inizio partita sia dopo
      un gol). Il gol NON scarica il cartellino a bocce ferme sul
      'goal': addGoal azzera il banner per legge di questo file ("la
      striscia degli eventi tace sul gol") e un banner CARTELLINO
      GIALLO li' romperebbe quella legge -- il caso DOGSO-advantage-goal
      (gol segnato dentro la finestra di vantaggio) si chiude quindi
      alla RIPRESA, dentro resetKickoff: niente doppio castigo, il gol
      resta e il cartellino arriva al fischio d'inizio successivo.
      pallaFuori risolve alla pari (palla fuori durante una finestra
      ancora aperta o con un cartellino gia' pendente: niente fischio
      per il fallo originario, si riprende con rimessa/angolo/rinvio
      come sempre e il cartellino, se dovuto, arriva li').

   uso:  node strumenti/_t-vantaggio.js --out fuori/vantaggio.html
         node strumenti/_t-vantaggio.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/vantaggio.html'));

const ANCORE = [

/* 1/6 -- resetKickoff: il fischio del gol (e di ogni ripresa) scarica
   un vantaggio pendente invece di limitarsi ad azzerarlo -- e' la
   "prima palla ferma" del kickoff, gol compreso (DOGSO-advantage-goal:
   niente doppio castigo, il cartellino arriva qui). */
{
  nome: '1/6 resetKickoff: scaricaCardVantaggio invece del solo azzeramento',
  cerca:
`  G.battuta=null;
  if(G.ball) G.ball.tiroT=-1;             // nessun tiro sopravvive al fischio`,
  metti:
`  G.battuta=null;
  /* IL FISCHIO DEL GOL (E DI OGNI RIPRESA) UCCIDE UN VANTAGGIO PENDENTE
     (voce #107, compito 3): resetKickoff gira sempre prima di ogni
     ripresa -- partita nuova, dopo un gol, dopo i rigori -- ed e' la
     "prima palla ferma" che l'App. D chiede per il cartellino in
     differita: lo infligge (se dovuto) invece di limitarsi ad azzerare.
     Il caso DOGSO-advantage-goal (gol segnato dentro la finestra di
     vantaggio, niente doppio castigo: il gol resta, il cartellino
     arriva qui, non al fischio del gol) si chiude proprio in questo
     punto, mai dentro addGoal -- la festa del gol tace su ogni banner
     per legge di questo file (vedi addGoal, "la striscia degli eventi
     tace sul gol"). */
  scaricaCardVantaggio();
  if(G.ball) G.ball.tiroT=-1;             // nessun tiro sopravvive al fischio`,
},

/* 2/6 -- setScene: la prima palla ferma vera (battuta/freekick) scarica
   un cartellino pendente. Il 'goal' resta fuori apposta (vedi il
   commento in testa all'attrezzo): quel caso passa da resetKickoff. */
{
  nome: '2/6 setScene: il cartellino in differita si scarica su battuta/freekick',
  cerca:
`  G.scene=s; G.sceneT=0;
  if(s!=='end') G.frozen=false;`,
  metti:
`  G.scene=s; G.sceneT=0;
  /* IL CARTELLINO IN DIFFERITA (voce #107, compito 3, mandato App. D):
     se un vantaggio ha lasciato un cartellino pendente (G.vantaggio.
     card, concesso ma non ancora mostrato), la prima palla ferma vera
     lo infligge -- qui per battuta/freekick. Il kickoff (dopo un gol
     compreso) passa sempre da resetKickoff PRIMA di arrivare a questo
     setScene: e' li' che si scarica (mai qui, e mai dentro addGoal --
     la festa del gol tace su ogni banner per legge di questo file,
     vedi "la striscia degli eventi tace sul gol" in addGoal). */
  if(G.vantaggio && (s==='battuta'||s==='freekick')) scaricaCardVantaggio();
  if(s!=='end') G.frozen=false;`,
},

/* 3/6 -- step(): la valutazione della finestra, a mondo vivo, subito
   dopo l'hit-stop -- come la finestra di battuta della voce #87. */
{
  nome: '3/6 step(): la valutazione del vantaggio vive nel passo fisso',
  cerca:
`      if(G.battuta){
        /* nessun compagno valido: si scioglie comunque, palla verso il centro */
        const dx=FW/2-bp.x, dy=FH/2-bp.y, l=Math.max(1,len(dx,dy));
        kickBall(bp, dx/l, dy/l, 420, 0);
      }
    }
  }

  /* timer di partita */`,
  metti:
`      if(G.battuta){
        /* nessun compagno valido: si scioglie comunque, palla verso il centro */
        const dx=FW/2-bp.x, dy=FH/2-bp.y, l=Math.max(1,len(dx,dy));
        kickBall(bp, dx/l, dy/l, 420, 0);
      }
    }
  }

  /* IL VANTAGGIO (voce #107, compito 3, mandato SS6.7): vive qui, a
     mondo vivo, subito dopo l'hit-stop -- come la finestra di battuta
     qui sopra, per la stessa ragione (passo fisso, non fotogrammi: la
     ripetibilita' e' tutto il punto). checkSlideContact apre la
     finestra (G.vantaggio = {team, x, y, t, card}, team la squadra
     OFFESA) e non fischia piu' li': la valutazione vive tutta qui.
     G.vantaggio.team>=0 e' la guardia di "finestra ancora viva" -- una
     volta conservato il vantaggio a VANT_T il resto si azzera (team:-1,
     vedi sotto) e resta solo il cartellino pendente, che questo blocco
     non deve piu' rivalutare: un possesso perso molto piu' tardi non
     puo' richiamare indietro un fischio ormai concesso.
     Zero dado(): la conservazione e' squadraDelPallone()===team (owner
     o lastTouch, la stessa regola di sempre) E la x della palla piu'
     avanti della x salvata -- il verso dipende dalla squadra (team 0
     attacca +x, team 1 -x, la stessa convenzione di dentroArea/
     resetKickoff in questo file). */
  if(G.vantaggio && G.vantaggio.team>=0){
    G.vantaggio.t+=dt;
    if(G.vantaggio.t>=VANT_VALUTA){
      const vTeam=G.vantaggio.team, vDir=vTeam===0?1:-1;
      const conserva = squadraDelPallone()===vTeam && (G.ball.x-G.vantaggio.x)*vDir>0;
      if(!conserva){
        /* VANTAGGIO SFUMATO: il fischio, ritardato, torna al punto
           SALVATO -- non a dove sono finiti i giocatori nel frattempo.
           startFreeKick non porta mai una posizione (e' un duello dal
           dischetto, la stessa distanza per rigore e punizione: firma
           verificata prima di scrivere questo attrezzo), quindi la
           palla si riporta al punto salvato PRIMA di decidere -- cosi'
           anche punizioneRapida (che legge solo il giocatore che le si
           passa, mai un punto per conto suo) parte dal posto giusto.
           IL CARTELLINO SI SCARICA SUBITO, PRIMA del banner (rilievo
           misurato scrivendo il banco: infliggiCartellino chiama
           showBanner('CARTELLINO GIALLO',...), e se girasse DOPO
           cancellerebbe "VANTAGGIO SFUMATO" nello stesso fotogramma --
           l'ultimo banner scritto e' quello che si vede. E' la STESSA
           legge che governava gia' questo file prima del compito 3:
           anche li' infliggiCartellino girava PRIMA del banner del
           fallo, mai dopo, perche' il banner dell'AZIONE ("FALLO
           CATTIVO!"/"PUNIZIONE!") vinceva sempre su quello del
           cartellino. startFreeKick chiama scaricaCardVantaggio() da
           solo (dentro setScene, sul ramo 'freekick'): chiamarla gia'
           qui, prima, la rende innocua a lui -- G.vantaggio e' gia'
           null quando setScene la richiede. */
        const vx=G.vantaggio.x, vy=G.vantaggio.y;
        const foulTeam=1-vTeam;
        const inArea=dentroArea(vTeam, vx, vy);
        const cumulo=G.stats.falli[foulTeam]>=3;
        scaricaCardVantaggio();
        const b=G.ball;
        b.owner=-1; b.x=vx; b.y=vy; b.z=0; b.vz=0; b.vx=0; b.vy=0;
        b.curve=0; b.perfectT=0; b.saveRolled=false; b.passTo=-1;
        showBanner('VANTAGGIO SFUMATO', TEAMCOL[vTeam], 1.2);
        Audio5.whistle(false);
        if(inArea || cumulo){
          startFreeKick(vTeam, foulTeam);
        }else{
          /* punizioneRapida vuole un giocatore vero: il compagno offeso
             piu' vicino al punto salvato -- il portatore originale e'
             altrove ormai, la partita e' andata avanti fino a qui. */
          let fallito=null, fd=1e9;
          for(const q of diMovimentoInCampo(vTeam)){
            const d=len(q.x-vx,q.y-vy);
            if(d<fd){ fd=d; fallito=q; }
          }
          if(fallito) punizioneRapida(fallito, null);
        }
      } else if(G.vantaggio.t>=VANT_T){
        /* VANTAGGIO: la finestra intera e' passata in conservazione.
           Il fallo e' perdonato; il cartellino dovuto (se c'e') resta
           pendente -- si mostra alla prossima palla ferma (setScene o
           resetKickoff, App. D). Azzera il resto: team:-1 spegne la
           guardia qui sopra, la finestra chiusa non si rivaluta mai. */
        showBanner('VANTAGGIO', TEAMCOL[vTeam], 1.0);
        const vCard=G.vantaggio.card;
        G.vantaggio = vCard!=null ? { team:-1, x:0, y:0, t:0, card:vCard } : null;
      }
    }
  }

  /* timer di partita */`,
},

/* 4/6 -- scaricaCardVantaggio nasce accanto a infliggiCartellino: le
   due funzioni fanno la stessa cosa (ammonire/espellere), una subito
   e una in differita. */
{
  nome: '4/6 scaricaCardVantaggio: nasce subito dopo infliggiCartellino',
  cerca:
`  showBanner('FUORI '+ESPULSIONE_SEC+' SECONDI!', '#ff4d4d', 1.8);
  Audio5.whistle(true);
  buzz([60,40,60]);
}

/* punizione a due, rapida: la palla resta al fallito sul posto e gli
   avversari sono respinti. Nessun overlay, nessuna pausa: si riparte. */
function punizioneRapida(fallito, autore){`,
  metti:
`  showBanner('FUORI '+ESPULSIONE_SEC+' SECONDI!', '#ff4d4d', 1.8);
  Audio5.whistle(true);
  buzz([60,40,60]);
}

/* IL CARTELLINO IN DIFFERITA (voce #107, compito 3): infligge il
   cartellino pendente di un vantaggio, se c'e' (G.vantaggio.card,
   l'indice del giocatore da ammonire -- null quando il fallo perdonato
   non lo meritava), e chiude comunque lo stato. Chiamata da tre punti
   -- checkSlideContact (un fallo nuovo chiude subito uno vecchio
   pendente), lo scioglimento della finestra dentro step() (sfumato o,
   in differita, alla prossima palla ferma) e resetKickoff (la ripresa,
   gol compreso) -- ed e' sicura da richiamare anche quando non c'e'
   niente da scaricare: G.vantaggio finisce sempre null. */
function scaricaCardVantaggio(){
  if(G.vantaggio && G.vantaggio.card!=null && G.players[G.vantaggio.card]){
    infliggiCartellino(G.players[G.vantaggio.card]);
  }
  G.vantaggio=null;
}

/* punizione a due, rapida: la palla resta al fallito sul posto e gli
   avversari sono respinti. Nessun overlay, nessuna pausa: si riparte. */
function punizioneRapida(fallito, autore){`,
},

/* 5/6 -- checkSlideContact: il ramo del fallo apre la finestra di
   vantaggio invece di fischiare subito (a meno che una finestra non
   sia gia' pendente: quella vecchia chiude, e il fallo nuovo fischia
   subito con la stessa decisione area/cumulo di sempre). */
{
  nome: '5/6 checkSlideContact: il fallo apre G.vantaggio invece di fischiare subito',
  cerca:
`        buzz(cattivo?[30,40,60]:40);
        Audio5.whistle(false);
        if(cattivo) infliggiCartellino(p);
        /* CUMULO FALLI, come nel futsal: il duello dal dischetto si guadagna.
           Si tira solo se il fallo e' dentro l'area vera oppure dal terzo
           fallo di squadra in poi. Gli altri sono punizioni a due, veloci:
           la partita non si spezza a ogni contrasto.
           RETTIFICA (voce #107, compito 1): qui c'era "zona pericolosa",
           cioe' zonaCalda = Math.abs(goalX-p.x) < 260 -- una fascia 1D
           sulla sola x, non scalata per taglia e diversa dall'area vera
           gia' disegnata E applicata altrove nello stesso file (VERNICE.
           areaProf/areaSemi, dentroArea(), usata da GK_AREA_X e dal
           cross -- ramo #86). zonaCalda muore qui: era il suo unico uso
           nel file. La decisione ora legge il rettangolo vero, alla
           scala della taglia in corso -- a 5 la differenza misurata e'
           260 contro un'area profonda 173 (piu' la semilarghezza 216
           sulla y, che la vecchia fascia non vedeva affatto). */
        const inArea = dentroArea(carrier.team, p.x, p.y);
        const cumulo = G.stats.falli[p.team] >= 3;
        if(inArea || cumulo){
          showBanner(cumulo && !inArea ? 'TERZO FALLO: SI TIRA!' : (cattivo?'FALLO CATTIVO!':'PUNIZIONE!'), '#ffb020', 1.2);
          startFreeKick(carrier.team, p.team);
        }else{
          showBanner(cattivo?'FALLO CATTIVO!':'FALLO!', '#ffb020', 1.0);
          punizioneRapida(carrier, p);
        }
        return;`,
  metti:
`        buzz(cattivo?[30,40,60]:40);
        /* IL VANTAGGIO (voce #107, compito 3, mandato SS6.7): il fischio
           non scatta piu' subito qui -- si apre una finestra di
           valutazione (G.vantaggio = {team, x, y, t, card}, team la
           squadra OFFESA -- carrier.team, mai l'autore --, x/y il
           punto DI QUESTO fallo, quello di p: e' li' che il fischio
           ritardato deve tornare). La valutazione vive nel passo fisso
           del gioco vivo, dentro step(), subito dopo l'hit-stop -- come
           la finestra di battuta della voce #87. card e' l'indice del
           giocatore da ammonire SE il fallo lo meritava (null
           altrimenti): il cartellino stesso resta pendente, non si
           infligge mai qui.
           UN FALLO MENTRE UN VANTAGGIO E' GIA' PENDENTE (scelta
           dichiarata, la piu' semplice delle due offerte dal piano):
           niente doppio vantaggio. Quello vecchio chiude SUBITO
           (scaricaCardVantaggio -- il suo cartellino, se dovuto, si
           infligge adesso) e il fallo nuovo fischia SUBITO, con la
           STESSA decisione area/cumulo di sempre -- il ramo qui sotto
           e' carattere per carattere quello che checkSlideContact
           faceva PRIMA di questo compito (RETTIFICA voce #107, compito
           1, per l'area vera al posto di zonaCalda: invariata). */
        if(G.vantaggio){
          scaricaCardVantaggio();
          Audio5.whistle(false);
          if(cattivo) infliggiCartellino(p);
          const inArea = dentroArea(carrier.team, p.x, p.y);
          const cumulo = G.stats.falli[p.team] >= 3;
          if(inArea || cumulo){
            showBanner(cumulo && !inArea ? 'TERZO FALLO: SI TIRA!' : (cattivo?'FALLO CATTIVO!':'PUNIZIONE!'), '#ffb020', 1.2);
            startFreeKick(carrier.team, p.team);
          }else{
            showBanner(cattivo?'FALLO CATTIVO!':'FALLO!', '#ffb020', 1.0);
            punizioneRapida(carrier, p);
          }
          return;
        }
        G.vantaggio = { team:carrier.team, x:p.x, y:p.y, t:0, card: cattivo?G.players.indexOf(p):null };
        return;`,
},

/* 6/6 -- le manopole VANT_T/VANT_VALUTA, accanto a BATTUTA_*: un posto
   solo per ogni soglia del cantiere, come chiede il piano. */
{
  nome: '6/6 VANT_T/VANT_VALUTA: le due manopole, accanto a BATTUTA_*',
  cerca:
`const BATTUTA_T = { rimessa:0.8, rinvio:0.8 };   // il binario rapido del paragone
const BATTUTA_HOLD = 3.0;    // anti-stallo: entro questo tempo la battuta parte da sola
const BATTUTA_CPU = 0.5;     // la CPU batte quando restano questi secondi di hold
const BATTUTA_RAGGIO = 60;   // gli avversari vengono spinti fuori da questo raggio`,
  metti:
`const BATTUTA_T = { rimessa:0.8, rinvio:0.8 };   // il binario rapido del paragone
const BATTUTA_HOLD = 3.0;    // anti-stallo: entro questo tempo la battuta parte da sola
const BATTUTA_CPU = 0.5;     // la CPU batte quando restano questi secondi di hold
const BATTUTA_RAGGIO = 60;   // gli avversari vengono spinti fuori da questo raggio
/* LE DUE MANOPOLE DEL VANTAGGIO (voce #107, compito 3), accanto a
   BATTUTA_*: un posto solo per ogni soglia del cantiere. VANT_VALUTA e'
   la prima occhiata dopo il fallo (il tempo che la palla ha per uscire
   dal caos del contrasto prima che la conservazione conti per davvero);
   VANT_T e' la scadenza intera della finestra, in secondi REALI di
   gioco vivo (passo fisso, non fotogrammi). */
const VANT_VALUTA = 0.5;
const VANT_T = 2.5;`,
},

];

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

/* CONTEGGI A DELTA (come in _t-rigore-area.js/_t-retropassaggio.js).
   G.vantaggio compare in dieci punti nuovi (apertura in checkSlideContact,
   guardia+valutazione+chiusura in step, scarico in scaricaCardVantaggio,
   guardia in setScene, azzeramento in resetKickoff); scaricaCardVantaggio
   nasce con una sola dichiarazione e si chiama da tre punti (setScene,
   step, resetKickoff) + una volta dentro se stessa nel commento (esclusa
   dal conteggio: si contano solo le chiamate vere, "scaricaCardVantaggio()"
   con le parentesi). */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
const attesiAlmeno = [
  ['function scaricaCardVantaggio()', 1],
  ['const VANT_VALUTA = 0.5;', 1],
  ['const VANT_T = 2.5;', 1],
  ['G.vantaggio', 8],
  ['scaricaCardVantaggio()', 4],   // dichiarazione + 3 chiamate (setScene/step/resetKickoff)
];
for (const [s, min] of attesiAlmeno) {
  const n = conta(out, s);
  if (n < min) rotti.push(s + ': atteso almeno ' + min + ', trovato ' + n);
}
if (conta(out, "if(cattivo) infliggiCartellino(p);") !== 1) {
  rotti.push('atteso infliggiCartellino(p) immediato residuo in un solo punto (il ramo "vantaggio gia\' pendente"), trovato ' + conta(out, "if(cattivo) infliggiCartellino(p);"));
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    G.vantaggio: 0 -> ' + conta(out, 'G.vantaggio') + ' occorrenze come testo');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
