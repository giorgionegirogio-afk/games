/* =====================================================================
   _toppa-duello-rigioca.js — IL DUELLO SI RIGIOCA
   (voce #131, compito 5). Otto ancore: il lato di lettura, la guardia
   che il compito 4 aveva rimandato, e le tre rettifiche a edizioni dei
   verbali che questa cura supera.

   IL CUORE E' UNA DISUGUAGLIANZA STRETTA. Duel.passo conta gli
   aggiornamenti GIA' COMPIUTI. Dal vivo un dito non cade mai dentro
   Duel.update: cade FRA due aggiornamenti. Percio' un tocco arrivato fra
   il k-esimo e il (k+1)-esimo legge un cursore avanzato k volte, e k e'
   il numero che finisce nel nastro. In rilettura quel comando va rimesso
   in scena all'INIZIO del (k+1)-esimo aggiornamento — prima che il
   cursore avanzi la (k+1)-esima volta — e quello e' l'unico istante in
   cui il cursore vale di nuovo esattamente k passi.
   La guardia e' quindi `riga.passo < Duel.passo` DOPO l'incremento, non
   `<=`. Con `<=` il comando partirebbe un aggiornamento troppo presto,
   con il gancio spostato in fondo a Duel.update un aggiornamento troppo
   tardi: e' esattamente il mutante _crit-duello-passo.js, che il banco
   deve continuare a bocciare.

   LE RIGHE DEL DUELLO HANNO UN CURSORE TUTTO LORO (Reg.duelli,
   Reg.iDuello) e non passano dal ciclo di Reg.passo(). Non e' eleganza:
   quel ciclo consuma tutte le righe con tick <= this.tick, e le righe
   del duello portano un tick che passo() attraversa DOPO la fine del
   duello — le troverebbe quando non servono piu' e le butterebbe in
   silenzio (esegui non ha un ramo per il 6).

   IL RIPIEGO NON SI CANCELLA, SI RIARMA. fermaReplayAlDischetto resta
   dov'e': senza, un replay che si aprisse su un duello di cui il nastro
   non ha le righe resterebbe appeso per sempre ad aspettare un dito.
   Cambia la CONDIZIONE: non piu' «c'e' un duello con un umano» (sempre
   vera), ma «c'e' un duello con un umano e il nastro non porta righe per
   questo nDuello» — cioe' il caso vero, che dopo questa cura vuol dire
   che la partita rigiocata ha preso una strada diversa.

   uso:  node strumenti/_toppa-duello-rigioca.js --out fuori/x.html
         node strumenti/_toppa-duello-rigioca.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/duello-rigioca.html'));

const ANCORE = [

/* 1 — le righe del duello hanno un cursore tutto loro */
{
  nome: '1/8 Reg.duelli e Reg.iDuello',
  cerca:
`  tasti: [],        /* i codici dei tasti incontrati, per non ripeterli */`,
  metti:
`  tasti: [],        /* i codici dei tasti incontrati, per non ripeterli */
  /* LE RIGHE DEL DISCHETTO, A PARTE, CON IL LORO CURSORE (voce #131).
     Stanno anche in righe[] — il testo del nastro si costruisce di li' —
     ma la rilettura le pesca da qui, e non e' eleganza: il ciclo di
     passo() consuma tutte le righe con tick <= this.tick, e le righe di
     un duello portano un tick che passo() attraversa DOPO la fine del
     duello. Le troverebbe quando non servono piu' e le butterebbe in
     silenzio (esegui non ha un ramo per il 6). */
  duelli: [],       /* le sole righe di tipo 6, in ordine di nastro */
  iDuello: 0,       /* dove siamo arrivati a rigiocare il dischetto */`,
},

/* 2 — e si azzerano quando il nastro comincia */
{
  nome: '2/8 accendi azzera anche il cursore del dischetto',
  cerca:
`    this.t0 = performance.now(); this.ids = new Map(); this.idProx = 0; this.tasti = [];`,
  metti:
`    this.t0 = performance.now(); this.ids = new Map(); this.idProx = 0; this.tasti = [];
    this.duelli = []; this.iDuello = 0;`,
},

/* 3 — il passo del dischetto impara a rimettere in scena */
{
  nome: '3/8 il ramo di rilettura di passoDuello',
  cerca:
`  passoDuello(){
    Duel.passo++;
  },`,
  metti:
`  passoDuello(){
    const p = ++Duel.passo;
    if(this.modo !== 2) return;
    /* =====================================================================
       LA DISUGUAGLIANZA E' STRETTA, ED E' IL CUORE DI TUTTO (voce #131).

       Duel.passo conta gli aggiornamenti GIA' COMPIUTI. Dal vivo il dito
       non cade mai dentro Duel.update: cade FRA due aggiornamenti. Un
       tocco arrivato fra il k-esimo e il (k+1)-esimo legge un cursore
       avanzato k volte — stopPower legge this.cursor all'istante — e k e'
       il numero che e' finito nel nastro. Qui siamo all'INIZIO del
       (k+1)-esimo, prima che il cursore avanzi di nuovo: e' l'unico
       istante in cui il cursore vale ancora esattamente k passi. Quindi
       si eseguono le righe con passo < p, non <= p.

       Con <= il comando partirebbe un aggiornamento troppo presto; col
       gancio in fondo a Duel.update, uno troppo tardi. Un aggiornamento
       vale 0,01917 di corsa, fra il 10% e il 20% della banda: MISURATO,
       cambia il 5% degli esiti e il punteggio finale in 2 partite su 40.

       SI FERMA AL PRIMO nDuello DIVERSO invece di cercare piu' avanti: se
       il nastro ha righe per il duello 3 e il gioco e' al 2, le due cose
       hanno preso strade diverse, e tirare avanti lo stesso vorrebbe dire
       rigiocare una partita inventata. Il duello resta senza comandi, e
       chi se ne accorge e' il ripiego armato in startFreeKick.
       ===================================================================== */
    this.dentro = true;
    while(this.iDuello < this.duelli.length){
      const r = this.duelli[this.iDuello];
      if(r[3] !== Duel.nDuello || r[4] >= p) break;
      this.iDuello++;
      this.tOra = r[2];
      try { this.eseguiDuello(r); } catch(e) { /* un comando che non si puo' rigiocare non ferma la partita */ }
    }
    this.dentro = false;
  },

  /* I TRE VERBI DEL DISCHETTO. u e v tornano dal nastro divisi per mille,
     ed e' esatto perche' duelMira li aveva gia' posati su una tacca
     intera (grep «LA MIRA SI POSA SU UNA TACCA INTERA»). Quando la riga e'
     corta — il rigore tirato da tastiera, che un punto non lo sa
     scrivere — u e v restano indefiniti e pickZone reinventa il centro
     del terzo, cioe' esattamente quello che era successo dal vivo. */
  eseguiDuello(r){
    const verbo = r[5];
    if(verbo === 0){
      if(r.length > 7) Duel.pickZone(r[6], r[7]/1000, r[8]/1000);
      else Duel.pickZone(r[6]);
    }
    else if(verbo === 1) Duel.stopPower();
    else if(verbo === 2) Duel.pickKeeper(r[6]);
  },

  /* IL NASTRO HA QUALCOSA DA DIRE SU QUESTO DUELLO? La domanda che arma
     il ripiego, e si guarda in avanti dal cursore: le righe sono in
     ordine di nDuello, quindi appena se ne incontra uno piu' grande non
     ce ne saranno altre per quello cercato. */
  righeDuello(n){
    for(let i = this.iDuello; i < this.duelli.length; i++){
      if(this.duelli[i][3] === n) return true;
      if(this.duelli[i][3] > n) break;
    }
    return false;
  },`,
},

/* 4 — deserializza costruisce l'elenco del dischetto */
{
  nome: '4/8 deserializza costruisce Reg.duelli',
  cerca:
`    this.i = 0; this.tick = 0; this.modo = 2;
    this.azzeraComandi();
    return this.righe.length;`,
  metti:
`    this.i = 0; this.tick = 0; this.modo = 2;
    this.azzeraComandi();
    /* L'ELENCO DEL DISCHETTO SI COSTRUISCE QUI, e DOPO azzeraComandi
       perche' quella rimette a zero l'ordinale dei duelli: i due capi —
       chi ha registrato e chi rilegge — devono partire dallo stesso
       numero, e l'elenco deve sopravvivere all'azzeramento. */
    this.duelli = this.righe.filter(r => r[1] === 6);
    this.iDuello = 0;
    return this.righe.length;`,
},

/* 5 — la guardia che il compito 4 aveva rimandato */
{
  nome: '5/8 in rilettura le dita vere sono ignorate anche al dischetto',
  cerca:
`    Duel[nome] = function(a, b, c){
      const daMotore = Duel.dentroUpdate;
      if(Reg.modo === 1 && !daMotore){`,
  metti:
`    Duel[nome] = function(a, b, c){
      const daMotore = Duel.dentroUpdate;
      /* IN RILETTURA LE DITA VERE SONO IGNORATE, come per le quattro
         porte qui sopra: un dito appoggiato per sbaglio mentre si guarda
         un replay cambierebbe una partita gia' successa, e la
         cambierebbe in silenzio. Passa il riproduttore (Reg.dentro,
         acceso da passoDuello) e passa il motore del duello
         (dentroUpdate): senza il secondo, in rilettura il duello della
         CPU non si deciderebbe mai. (voce #131, compito 5: qui e non al
         compito 4, perche' prima della rilettura vera questa riga
         sbarrava una strada senza alternativa.) */
      if(Reg.modo === 2 && !Reg.dentro && !daMotore) return;
      if(Reg.modo === 1 && !daMotore){`,
},

/* 6 — l'ordinale si riallinea quando il duello si apre in rilettura */
{
  nome: '6/8 Duel.start riallinea il cursore del dischetto',
  cerca:
`  Duel.start = function(shooterTeam){
    Duel.nDuello++; Duel.passo = 0;
    return veroStart.call(this, shooterTeam);
  };`,
  metti:
`  Duel.start = function(shooterTeam){
    Duel.nDuello++; Duel.passo = 0;
    /* IL RIALLINEAMENTO, e serve solo quando qualcosa e' gia' andato
       storto (voce #131). Se il nastro ha ancora righe di duelli
       PRECEDENTI a questo, vuol dire che la partita rigiocata ha saltato
       un duello che c'era stato: quelle righe non serviranno mai piu'.
       Lasciarle davanti al cursore bloccherebbe anche i duelli
       successivi, e soprattutto renderebbe cieco il ripiego — che chiede
       «ci sono righe per questo nDuello?» guardando avanti da qui. */
    if(Reg.modo === 2)
      while(Reg.iDuello < Reg.duelli.length && Reg.duelli[Reg.iDuello][3] < Duel.nDuello) Reg.iDuello++;
    return veroStart.call(this, shooterTeam);
  };`,
},

/* 7 — startFreeKick: via il marchio, e il ripiego sul caso vero */
{
  nome: '7/8 startFreeKick, il marchio e il ripiego',
  cerca:
`  if(Reg.modo===1 && (Duel.shooterHuman || Duel.keeperHuman)) Reg.scrivi(5, []);
  if(Reg.modo===2 && G.sfida && G.sfida.replay && (Duel.shooterHuman || Duel.keeperHuman))
    setTimeout(fermaReplayAlDischetto, 0);`,
  metti:
`  /* =====================================================================
     IL RIPIEGO, RIARMATO SUL CASO VERO (voce #131, compito 5).

     Il marchio di tipo 5 non si scrive piu': il nastro adesso porta i
     comandi del duello (tipo 6) e non ha piu' niente da confessare. Il
     controllo che lo cercava resta in Sfida.guarda, per i nastri scritti
     prima di oggi — quelli il duello non ce l'hanno davvero.

     E il ripiego non si arma piu' a ogni duello con un umano dentro, che
     era sempre. Si arma quando il nastro NON HA RIGHE per questo duello:
     cioe' quando la partita rigiocata ha preso una strada che quella
     registrata non aveva. Allora nessun dito arrivera' mai, e restare li'
     ad aspettarlo sarebbe una schermata che non finisce.
     ===================================================================== */
  if(Reg.modo===2 && G.sfida && G.sfida.replay &&
     (Duel.shooterHuman || Duel.keeperHuman) && !Reg.righeDuello(Duel.nDuello))
    setTimeout(fermaReplayAlDischetto, 0);`,
},

/* 8 — le rettifiche a edizioni dei due verbali superati */
{
  nome: '8/8 rettifiche a edizioni (i due verbali superati)',
  cerca:
`   COSA CI VORREBBE PER RIPARARLO DAVVERO, scritto perche' qualcuno lo
   faccia: le tre decisioni del duello sono poche e piccole —
   pickZone(z,u,v), stopPower() e pickKeeper(z) — e basterebbe
   registrarle come i tocchi, con un contatore locale al duello invece
   che col tick del registro (durante il duello frame() chiama
   Duel.update e NON step, quindi Reg.passo non gira e il tick sta fermo:
   e' proprio per questo che i comandi del duello non possono usare la
   stessa scala di tempo degli altri). Non e' un lavoro da questa toppa:
   tocca il registro, il duello e il ciclo dei fotogrammi, e ognuno dei
   tre ha i suoi banchi da rimisurare.`,
  metti:
`   COSA CI VORREBBE PER RIPARARLO DAVVERO, scritto perche' qualcuno lo
   faccia: le tre decisioni del duello sono poche e piccole —
   pickZone(z,u,v), stopPower() e pickKeeper(z) — e basterebbe
   registrarle come i tocchi, con un contatore locale al duello invece
   che col tick del registro (durante il duello frame() chiama
   Duel.update e NON step, quindi Reg.passo non gira e il tick sta fermo:
   e' proprio per questo che i comandi del duello non possono usare la
   stessa scala di tempo degli altri). Non e' un lavoro da questa toppa:
   tocca il registro, il duello e il ciclo dei fotogrammi, e ognuno dei
   tre ha i suoi banchi da rimisurare.

   RETTIFICA A EDIZIONI (21 settembre 2026, voce #131, compito 5).
   FATTO, ed e' esattamente quello descritto qui sopra: il tipo 6 porta
   [nDuello, passo, verbo, ...] e il contatore locale e' Duel.passo,
   incrementato da Reg.passoDuello() come prima istruzione di
   Duel.update. Percio' il testo qui sotto — «il replay si interrompe
   SEMPRE che ci sia un umano nel duello» — e' SUPERATO: questa funzione
   non e' piu' la regola ma il RIPIEGO, e si arma solo quando il nastro
   non porta righe per quel duello, cioe' quando la partita rigiocata ha
   preso una strada diversa da quella registrata. Il testo vecchio resta
   perche' spiega perche' la funzione esiste ancora.`,
},

/* 9 — il cartello che il giocatore legge diceva una cosa non piu' vera */
{
  nome: '9/10 il messaggio del ripiego',
  cerca:
`  Sfida.stato('Questa partita si è fermata su un calcio piazzato: il registro non annota ancora ' +
              'i comandi del duello dal dischetto, e da lì in poi non si può rivedere. ' +
              'Il risultato resta quello scritto qui sotto.', true);`,
  metti:
`  /* IL CARTELLO DICE LA CAUSA VERA (voce #131). Prima diceva «il
     registro non annota ancora i comandi del duello»: adesso li annota,
     e se si arriva qui e' perche' QUESTO nastro non ne ha per QUESTO
     duello — la partita rigiocata ha preso un'altra strada. Un cartello
     che da' la colpa alla cosa sbagliata manda a cercare nel posto
     sbagliato. */
  Sfida.stato('Questa partita, rigiocata, ha preso una strada diversa da quella che hai subito: ' +
              'è arrivata a un calcio piazzato di cui il nastro non ha i comandi, e da lì in poi ' +
              'non si può rivedere. Il risultato resta quello scritto qui sotto.', true);`,
},

/* 10 — e il verbale di startFreeKick, superato dai fatti */
{
  nome: '10/10 rettifica a edizioni in startFreeKick',
  cerca:
`     La strada per ripararlo davvero sta accanto a
     fermaReplayAlDischetto.
     ===================================================================== */`,
  metti:
`     La strada per ripararlo davvero sta accanto a
     fermaReplayAlDischetto.

     RETTIFICA A EDIZIONI (21 settembre 2026, voce #131). Tutto il testo
     qui sopra e' SUPERATO, e resta perche' racconta da dove si viene. Il
     duello STA nel nastro: le tre decisioni passano da tre porte avvolte
     (grep «E LE TRE PORTE DEL DISCHETTO») e viaggiano come righe di tipo
     6, ancorate alla coppia (nDuello, passo) invece che al tick, che
     durante un duello sta fermo. Percio':
       1. il marchio di tipo 5 non si scrive piu' — non c'e' piu' niente
          da confessare. Sfida.guarda lo cerca ancora, ma solo per i
          nastri scritti prima di oggi;
       2. il replay non si ferma piu' a ogni duello: si ferma solo se il
          nastro non ha righe per QUEL duello, cioe' se la partita
          rigiocata ha divagato. Vedi qui sotto.
     ===================================================================== */`,
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
const attesi = [
  ['duelli: [],       /* le sole righe di tipo 6, in ordine di nastro */', 1],
  ['this.duelli = []; this.iDuello = 0;', 1],
  ['if(r[3] !== Duel.nDuello || r[4] >= p) break;', 1],
  ['eseguiDuello(r){', 1],
  ['righeDuello(n){', 1],
  ['this.duelli = this.righe.filter(r => r[1] === 6);', 1],
  ['if(Reg.modo === 2 && !Reg.dentro && !daMotore) return;', 1],
  ['!Reg.righeDuello(Duel.nDuello))', 1],
  ['RETTIFICA A EDIZIONI (21 settembre 2026, voce #131, compito 5).', 1],
  /* il marchio di tipo 5 non si scrive piu', ma il controllo che lo cerca
     resta per i nastri vecchi */
  ['Reg.scrivi(5, []);', 0],
  ['if(r[1] === 5) incompleto = true;', 1],
  ["pezzi.push(dT + ',5,' + dMs);", 1],
  ['else if(tipo === 5)   this.righe.push([tick, 5, ms]);', 1],
  /* il gancio che il mutante deve poter spostare resta uno solo */
  ['      Reg.passoDuello();\n      return veroUpdate.call(this, dt);', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
