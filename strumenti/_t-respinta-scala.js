/* =====================================================================
   _t-respinta-scala.js -- ONDA DI CORREZIONE DELLA REVISIONE FINALE
   (voce #107, ramo voce-107-regole-leva-corta, 18 settembre 2026).

   UN attrezzo, NOVE ancoraggi, per tre rilievi + due correzioni di
   commento -- lo stesso schema di _t-nastro-versione.js (sei ancoraggi
   in un colpo solo per un compito intero).

   C1 (CRITICO) -- IL RETROPASSAGGIO NON MORDE A TAGLIA 11. Il ramo di
   respinta in tentaPresa (CALCETTO-il-gioco.html ~19195) riposizionava
   il pallone a (P_R+B_R)*dist_ dal portiere; la raccolta generica di
   updateBall (~18769) lo riafferra a d<KICK_R*0.8 (=20,8, KICK_R e'
   costante, MAI scalato dalla taglia). CORPI da' P_R+B_R=21 a 5/7 (un
   margine di 0,2 unita': un rasoio) ma SOLO 7,5 a 11 (P_R=5, B_R=2.5):
   la palla respinta restava DENTRO il cerchio della raccolta, e il
   portiere la riprendeva un fotogramma dopo per la via generica
   (misurato: presa al fotogramma 99) -- il retropassaggio non mordeva
   MAI a quella taglia. CURA: il raggio diventa
   Math.max((P_R+B_R)*dist_, KICK_R*0.8+0.5) -- la respinta esce SEMPRE
   dal cerchio della raccolta, a ogni taglia, non scalato da dist_ sul
   pavimento (e' un fatto sulla raccolta generica, non sul tuffo).

   I2 -- IL CARTELLINO NON ATTRAVERSA LE PARTITE. startMatch non
   azzerava G.vantaggio: un sentinel con un cartellino pendente
   ({team:-1,...,card}, lasciato da un vantaggio CONCESSO per intero
   nella partita PRECEDENTE) sopravviveva, e resetKickoff (dentro
   startMatch, via setupPlayers()) lo leggeva gia' con la rosa NUOVA --
   scaricaCardVantaggio() ammoniva un giocatore innocente al fischio
   d'inizio della partita nuova. CURA: G.vantaggio=null accanto a
   G.rigori=null, PRIMA di setupPlayers()/resetKickoff().

   I3 -- LA PALLA FERMA NON PERDONA DUE VOLTE. setScene scaricava il
   cartellino pendente anche con una finestra di vantaggio ANCORA VIVA
   (G.vantaggio.team>=0): una palla spedita fuori campo durante la
   finestra faceva sparire il cartellino SENZA fischio ne' punizione --
   il 5,1% "silenzioso" della contabilita' arbitrale del compito 3, mai
   spiegato allora. CURA, in tre parti:
     (a) il ramo SFUMATO di step() (era inline nell'"if(!conserva)")
         si estrae nella funzione eseguiSfumato(vTeam,vx,vy) -- stesso
         corpo, carattere per carattere, perche' pallaFuori() ne ha
         bisogno anche lei;
     (b) pallaFuori(), PRIMA di costruire G.battuta, intercetta una
         finestra ANCORA VIVA e le da' l'esito vero -- SFUMATO, fischio
         ritardato dal punto salvato -- invece di lasciarla scivolare in
         una rimessa qualunque: il fallo originario vince sulla rimessa,
         come la regola vera;
     (c) la scarica dentro setScene resta SOLO per il sentinel
         (G.vantaggio.team<0): una finestra viva non ci arriva mai,
         intercettata gia' da (b).

   I5 -- commento nuovo su checkSlideContact: il vantaggio si apre ANCHE
   per un fallo dentro l'area (nessun dentroArea() sulla riga che apre
   la finestra) -- un rigore sfumato arriva con 0,85-2,85 s di ritardo,
   mai un fischio subito. Misurato: ~0 casi su 21 finestre aperte in
   area restano PIENI (la geometria di "restare piu' avanti mentre si
   resta ancora dentro l'area" e' una striscia stretta). Nessun codice
   nuovo, il comportamento era gia' quello giusto: manca solo il
   commento che lo dichiara (e la prova VANTAGGIO-IN-AREA in
   strumenti/_q-regole.js, discriminante).

   m7 -- il commento di scaricaCardVantaggio() diceva "tre punti": i
   siti veri, gia' prima di questa onda, erano CINQUE (resetKickoff,
   setScene, il ramo SFUMATO di step(), checkSlideContact due volte).
   Dopo I3(a) uno di quei cinque siti (il ramo SFUMATO) vive dentro
   eseguiSfumato() ed e' RAGGIUNGIBILE DA DUE chiamanti (step() e
   pallaFuori) invece che da uno solo -- il commento si corregge per
   dirlo, non solo per contare giusto.

   uso:  node strumenti/_t-respinta-scala.js --out fuori/respinta-scala.html
         node strumenti/_t-respinta-scala.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/respinta-scala.html'));

const ANCORE = [

/* ---------------------------------------------------------------------
   C1a -- il paragrafo del commento che dichiarava l'invariante vecchia
   (vera solo a 5/7) si rettifica in chiaro, con la fonte e i numeri. */
{
  nome: 'tentaPresa: il commento della raccolta generica si rettifica (C1, invariante vera a ogni taglia)',
  cerca:
`     step(), updatePlayer prima di updateBall), quindi ricaccia il
     pallone appena fuori dal cerchio della RACCOLTA (KICK_R*0.8=20,8 <
     P_R+B_R=21) PRIMA che quella sezione abbia mai la possibilita' di
     leggerlo -- "puo' sempre giocarla coi piedi" resta vero altrove nel
     file (un compagno, un avversario, un pallone libero qualunque), qui
     e' semplicemente un respingente, non un ricevitore.`,
  metti:
`     step(), updatePlayer prima di updateBall), quindi ricaccia il
     pallone appena fuori dal cerchio della RACCOLTA A OGNI TAGLIA (C1,
     onda di correzione della revisione finale, voce #107, 18 settembre
     2026: il raggio adesso e' Math.max(P_R+B_R, KICK_R*0.8+0.5), vedi
     sotto -- PRIMA di questa cura era solo P_R+B_R*dist_, vero a 5/7 con
     un margine di 0,2 unita' (21 contro KICK_R*0.8=20,8) ma FALSO a 11,
     dove CORPI da' P_R+B_R=7,5: la palla respinta restava DENTRO il
     cerchio della raccolta e il portiere la riprendeva un fotogramma
     dopo per la via generica, misurato al fotogramma 99) PRIMA che
     quella sezione abbia mai la possibilita' di leggerlo -- "puo'
     sempre giocarla coi piedi" resta vero altrove nel file (un
     compagno, un avversario, un pallone libero qualunque), qui
     e' semplicemente un respingente, non un ricevitore.`,
},

/* ---------------------------------------------------------------------
   C1b -- LA CURA VERA: il raggio di respinta guadagna un pavimento. */
{
  nome: 'tentaPresa: il raggio di respinta diventa Math.max(..., KICK_R*0.8+0.5) -- esce sempre dalla raccolta',
  cerca:
`  if(b.toccoPiede===true && lt>=0 && lt!==ki && G.players[lt] && G.players[lt].team===p.team){
    const d=Math.max(0.01, len(dx,dy));
    const nx=dx/d, ny=dy/d;
    const raggio=(P_R+B_R)*dist_;`,
  metti:
`  if(b.toccoPiede===true && lt>=0 && lt!==ki && G.players[lt] && G.players[lt].team===p.team){
    const d=Math.max(0.01, len(dx,dy));
    const nx=dx/d, ny=dy/d;
    /* C1 (onda di correzione della revisione finale, voce #107): il
       pavimento KICK_R*0.8+0.5 garantisce l'uscita dal cerchio della
       raccolta generica (updateBall, ~18769) a OGNI taglia -- non
       scalato da dist_, perche' e' un fatto sulla raccolta generica,
       non sul tuffo del portiere (dettaglio sopra, in testa alla
       funzione). */
    const raggio=Math.max((P_R+B_R)*dist_, KICK_R*0.8+0.5);`,
},

/* ---------------------------------------------------------------------
   I2 -- il sentinel del cartellino non attraversa una partita nuova. */
{
  nome: 'startMatch: G.vantaggio=null accanto a G.rigori=null (I2, il cartellino non attraversa le partite)',
  cerca:
`  G.goldenT=0; G.rigori=null;`,
  metti:
`  G.goldenT=0; G.rigori=null;
  /* I2 (onda di correzione della revisione finale, voce #107, 18
     settembre 2026): G.vantaggio non si azzerava qui. Un sentinel con
     un cartellino pendente ({team:-1,...,card}, lasciato da un
     vantaggio CONCESSO per intero nella partita PRECEDENTE) sopravviveva
     a startMatch, e resetKickoff (sotto, via setupPlayers()) lo leggeva
     gia' con la rosa NUOVA: scaricaCardVantaggio() ammoniva un
     giocatore innocente al fischio d'inizio della partita nuova, con lo
     stesso indice ma un titolare diverso (misurato). */
  G.vantaggio=null;`,
},

/* ---------------------------------------------------------------------
   I3a -- il ramo SFUMATO di step() si estrae in eseguiSfumato(). */
{
  nome: 'step(): il ramo SFUMATO diventa una chiamata a eseguiSfumato() (I3a, estratta perche\' pallaFuori la richiama anche lei)',
  cerca:
`      if(!conserva){
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
          if(fallito){
            /* F3 (correzione di revisione, voce #107 compito 3): la
               "punizione dal punto" reggeva un solo fotogramma -- il
               sostituto restava dov'era (fd unita' dal punto salvato,
               non zero: la partita e' andata avanti durante la finestra)
               e punizioneRapida non sposta mai b.x/b.y, quindi la palla
               restava al punto salvato per UN fotogramma, poi la molla
               del dribbling di updateBall (bersaglio o.x+o.fx*avanti) la
               trascinava verso il sostituto vero (misurato: ~38 unita' in
               0,33 s). Il sostituto va CO-LOCATO sul punto PRIMA della
               battuta -- lo stesso pattern di posaBattuta col suo
               battitore, ma senza l'offset di CARRY_DIST: qui la palla
               non si sposta rispetto al giocatore, quindi il giocatore
               deve arrivare esattamente dove sta gia' la palla.
               clampPlayer riusa il confine di campo che il moto normale
               gia' rispetta -- nessun secondo clamp scritto a mano. */
            fallito.x=vx; fallito.y=vy; fallito.vx=0; fallito.vy=0;
            clampPlayer(fallito);
            punizioneRapida(fallito, null);
          }
        }
      } else if(G.vantaggio.t>=VANT_T){`,
  metti:
`      if(!conserva){
        /* I3a (onda di correzione della revisione finale, voce #107, 18
           settembre 2026): questo ramo viveva qui, inline -- ESTRATTO in
           eseguiSfumato() (vedi la funzione, fra punizioneRapida e
           checkSlideContact) perche' pallaFuori() ha bisogno dello
           STESSO esito quando la palla esce dal campo con una finestra
           ancora viva (I3b): il corpo non e' cambiato di un carattere,
           solo il posto dove vive. */
        eseguiSfumato(vTeam, G.vantaggio.x, G.vantaggio.y);
      } else if(G.vantaggio.t>=VANT_T){`,
},

/* ---------------------------------------------------------------------
   I3a (funzione) -- eseguiSfumato() nasce fra punizioneRapida e
   checkSlideContact: entrambe le funzioni che usa sono gia' definite
   sopra (hoisting a parte, e' anche il posto piu' leggibile). */
{
  nome: 'nuova funzione eseguiSfumato() (I3a), fra punizioneRapida e checkSlideContact',
  cerca:
`  G.freeze=0.16;
  Audio5.beep(360);
}

/* ---------- contatto della scivolata ---------- */
function checkSlideContact(p){`,
  metti:
`  G.freeze=0.16;
  Audio5.beep(360);
}

/* ESEGUISFUMATO (I3a, onda di correzione della revisione finale, voce
   #107, 18 settembre 2026): ESTRATTA da step() -- era il ramo
   "if(!conserva)" del blocco di valutazione del vantaggio, carattere
   per carattere -- perche' pallaFuori() (I3b, ~19428) ne ha bisogno
   anche lei: una finestra ANCORA VIVA che incontra la palla ferma (il
   pallone esce dal campo) e' un altro modo di perdere la conservazione,
   non solo "l'azione si e' fermata dentro step()".
   VANTAGGIO SFUMATO: il fischio, ritardato, torna al punto SALVATO --
   non a dove sono finiti i giocatori nel frattempo. startFreeKick non
   porta mai una posizione (e' un duello dal dischetto, la stessa
   distanza per rigore e punizione: firma verificata prima di scrivere
   questo attrezzo), quindi la palla si riporta al punto salvato PRIMA
   di decidere -- cosi' anche punizioneRapida (che legge solo il
   giocatore che le si passa, mai un punto per conto suo) parte dal
   posto giusto.
   IL CARTELLINO SI SCARICA SUBITO, PRIMA del banner (rilievo misurato
   scrivendo il banco: infliggiCartellino chiama showBanner('CARTELLINO
   GIALLO',...), e se girasse DOPO cancellerebbe "VANTAGGIO SFUMATO"
   nello stesso fotogramma -- l'ultimo banner scritto e' quello che si
   vede. E' la STESSA legge che governava gia' questo file prima del
   compito 3: anche li' infliggiCartellino girava PRIMA del banner del
   fallo, mai dopo, perche' il banner dell'AZIONE ("FALLO CATTIVO!"/
   "PUNIZIONE!") vinceva sempre su quello del cartellino. startFreeKick
   chiama scaricaCardVantaggio() da solo (dentro setScene, sul ramo
   'freekick'): chiamarla gia' qui, prima, la rende innocua a lui --
   G.vantaggio e' gia' null quando setScene la richiede. */
function eseguiSfumato(vTeam, vx, vy){
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
    if(fallito){
      /* F3 (correzione di revisione, voce #107 compito 3): la
         "punizione dal punto" reggeva un solo fotogramma -- il
         sostituto restava dov'era (fd unita' dal punto salvato,
         non zero: la partita e' andata avanti durante la finestra)
         e punizioneRapida non sposta mai b.x/b.y, quindi la palla
         restava al punto salvato per UN fotogramma, poi la molla
         del dribbling di updateBall (bersaglio o.x+o.fx*avanti) la
         trascinava verso il sostituto vero (misurato: ~38 unita' in
         0,33 s). Il sostituto va CO-LOCATO sul punto PRIMA della
         battuta -- lo stesso pattern di posaBattuta col suo
         battitore, ma senza l'offset di CARRY_DIST: qui la palla
         non si sposta rispetto al giocatore, quindi il giocatore
         deve arrivare esattamente dove sta gia' la palla.
         clampPlayer riusa il confine di campo che il moto normale
         gia' rispetta -- nessun secondo clamp scritto a mano. */
      fallito.x=vx; fallito.y=vy; fallito.vx=0; fallito.vy=0;
      clampPlayer(fallito);
      punizioneRapida(fallito, null);
    }
  }
}

/* ---------- contatto della scivolata ---------- */
function checkSlideContact(p){`,
},

/* ---------------------------------------------------------------------
   I3b -- pallaFuori intercetta una finestra viva PRIMA della rimessa. */
{
  nome: 'pallaFuori: una finestra di vantaggio ANCORA VIVA vince sulla rimessa (I3b, eseguiSfumato PRIMA di costruire G.battuta)',
  cerca:
`function pallaFuori(tipo, team, x, y){
  const b=G.ball;`,
  metti:
`function pallaFuori(tipo, team, x, y){
  /* I3b (onda di correzione della revisione finale, voce #107, 18
     settembre 2026): una finestra di vantaggio ANCORA VIVA (G.vantaggio.
     team>=0) che incontra la palla ferma non deve mai scivolare in una
     rimessa qualunque -- il fallo originario vince sulla rimessa, come
     la regola vera. PRIMA di questa guardia, la palla che usciva dal
     campo durante la finestra arrivava a setScene('battuta'), che
     scaricava il cartellino pendente in silenzio (nessun dentroArea, il
     vecchio guardiano li' era solo "G.vantaggio", vedi I3c) -- il 5,1%
     "silenzioso" della contabilita' arbitrale del compito 3, mai
     spiegato allora. eseguiSfumato() e' lo STESSO esito che step()
     applica quando la conservazione si perde da sola (I3a): fischio
     ritardato dal punto SALVATO, mai una rimessa dal punto di uscita. */
  if(G.vantaggio && G.vantaggio.team>=0){
    eseguiSfumato(G.vantaggio.team, G.vantaggio.x, G.vantaggio.y);
    return;
  }
  const b=G.ball;`,
},

/* ---------------------------------------------------------------------
   I3c -- setScene scarica SOLO il sentinel, mai una finestra viva. */
{
  nome: 'setScene: la scarica del cartellino resta solo per il sentinel (I3c, G.vantaggio.team<0)',
  cerca:
`  if(G.vantaggio && (s==='battuta'||s==='freekick')) scaricaCardVantaggio();`,
  metti:
`  /* I3c (onda di correzione della revisione finale, voce #107, 18
     settembre 2026): la scarica qui resta SOLO per il sentinel
     (G.vantaggio.team<0, il cartellino in differita di un vantaggio
     gia' CONCESSO per intero) -- una finestra ANCORA VIVA (team>=0) non
     arriva mai fin qui con G.battuta da costruire: pallaFuori() (I3b,
     ~19428) la intercetta PRIMA, con l'esito SFUMATO vero. Senza questa
     guardia, un pallone spedito fuori campo mentre il vantaggio era
     ancora aperto faceva scomparire il cartellino pendente SENZA
     fischio ne' punizione. */
  if(G.vantaggio && G.vantaggio.team<0 && (s==='battuta'||s==='freekick')) scaricaCardVantaggio();`,
},

/* ---------------------------------------------------------------------
   I5 -- commento nuovo: il vantaggio si apre anche in area. */
{
  nome: 'checkSlideContact: commento nuovo, il vantaggio si apre ANCHE in area (I5, nessun codice cambiato)',
  cerca:
`        if(G.vantaggio && G.vantaggio.card!=null) scaricaCardVantaggio();
        G.vantaggio = { team:carrier.team, x:p.x, y:p.y, t:-(carrier.recover>0?carrier.recover:0), card: cattivo?G.players.indexOf(p):null };
        return;`,
  metti:
`        if(G.vantaggio && G.vantaggio.card!=null) scaricaCardVantaggio();
        /* I5 (onda di correzione della revisione finale, voce #107, 18
           settembre 2026): la finestra si apre ANCHE per un fallo
           DENTRO l'area -- questa riga non guarda mai dentroArea(), a
           differenza del ramo del fischio immediato qui sopra. Un
           rigore sfumato arriva quindi con un ritardo di 0,85-2,85 s
           (VANT_VALUTA/VANT_T meno lo stordimento), mai un fischio
           subito: e' voluto, lo stesso vantaggio che vale ovunque nel
           campo. Misurato (sonda dedicata, 21 finestre aperte da un
           fallo in area): ~0 casi su 21 restano PIENI -- la geometria
           di "restare piu' avanti mentre si resta ancora dentro l'area"
           e' una striscia stretta, non una regola nuova che favorisce
           l'area. Vedi VANTAGGIO-IN-AREA in strumenti/_q-regole.js, e
           la frase gemella in MANUALE.md. */
        G.vantaggio = { team:carrier.team, x:p.x, y:p.y, t:-(carrier.recover>0?carrier.recover:0), card: cattivo?G.players.indexOf(p):null };
        return;`,
},

/* ---------------------------------------------------------------------
   m7 -- il commento di scaricaCardVantaggio() contava "tre punti":
   erano gia' cinque prima di questa onda, e uno di loro (il ramo
   SFUMATO) e' oggi raggiungibile da due chiamanti, non uno solo. */
{
  nome: 'scaricaCardVantaggio: il commento passa da "tre punti" ai cinque siti veri (m7, ricontati dopo I3)',
  cerca:
`/* IL CARTELLINO IN DIFFERITA (voce #107, compito 3): infligge il
   cartellino pendente di un vantaggio, se c'e' (G.vantaggio.card,
   l'indice del giocatore da ammonire -- null quando il fallo perdonato
   non lo meritava), e chiude comunque lo stato. Chiamata da tre punti
   -- checkSlideContact (un fallo nuovo chiude subito uno vecchio
   pendente), lo scioglimento della finestra dentro step() (sfumato o,
   in differita, alla prossima palla ferma) e resetKickoff (la ripresa,
   gol compreso) -- ed e' sicura da richiamare anche quando non c'e'
   niente da scaricare: G.vantaggio finisce sempre null. */`,
  metti:
`/* IL CARTELLINO IN DIFFERITA (voce #107, compito 3): infligge il
   cartellino pendente di un vantaggio, se c'e' (G.vantaggio.card,
   l'indice del giocatore da ammonire -- null quando il fallo perdonato
   non lo meritava), e chiude comunque lo stato.
   RETTIFICA (m7, onda di correzione della revisione finale, voce #107,
   18 settembre 2026): "tre punti" era scaduto gia' prima di questa
   onda -- i siti VERI sono CINQUE: resetKickoff (il fischio d'inizio o
   la ripresa, gol compreso), setScene (la prima palla ferma vera, oggi
   guardata da G.vantaggio.team<0 -- I3c, solo il sentinel),
   checkSlideContact DUE VOLTE (il fischio immediato su una finestra
   gia' viva, e la micro-coda che scarica il sentinel prima di aprirne
   uno nuovo) ed eseguiSfumato() -- il quinto sito, che PRIMA di I3a era
   inline dentro step() ed e' oggi RAGGIUNGIBILE DA DUE chiamanti
   (step(), quando la conservazione si perde da sola, e pallaFuori(),
   quando la palla esce dal campo con la finestra ancora viva) invece
   che da uno solo. E' sicura da richiamare anche quando non c'e' niente
   da scaricare: G.vantaggio finisce sempre null. */`,
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

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'const raggio=Math.max((P_R+B_R)*dist_, KICK_R*0.8+0.5);') !== 1) rotti.push('C1: il raggio nuovo non e\' presente esattamente una volta');
if (conta(out, 'const raggio=(P_R+B_R)*dist_;') !== 0) rotti.push('C1: il raggio vecchio e\' ancora presente');
if (conta(out, 'G.vantaggio=null;') !== 2) rotti.push('I2: G.vantaggio=null non e\' presente due volte (una gia\' in scaricaCardVantaggio, una nuova in startMatch)');
if (conta(out, 'function eseguiSfumato(vTeam, vx, vy){') !== 1) rotti.push('I3a: la funzione eseguiSfumato non e\' presente esattamente una volta');
if (conta(out, 'eseguiSfumato(vTeam, G.vantaggio.x, G.vantaggio.y);') !== 1) rotti.push('I3a: la chiamata da step() non e\' presente esattamente una volta');
if (conta(out, 'eseguiSfumato(G.vantaggio.team, G.vantaggio.x, G.vantaggio.y);') !== 1) rotti.push('I3b: la chiamata da pallaFuori non e\' presente esattamente una volta');
if (conta(out, "if(G.vantaggio && G.vantaggio.team<0 && (s==='battuta'||s==='freekick')) scaricaCardVantaggio();") !== 1) rotti.push('I3c: la guardia nuova di setScene non e\' presente esattamente una volta');
if (conta(out, "if(G.vantaggio && (s==='battuta'||s==='freekick')) scaricaCardVantaggio();") !== 0) rotti.push('I3c: la guardia vecchia di setScene e\' ancora presente');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
