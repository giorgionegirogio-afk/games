/* =====================================================================
   _t-battuta-finestra.js — IL FERMO TORNA BREVE, LA FINESTRA VIVE (voce
   #87, correzione post-revisione del compito 2, ramo voce-87-rimesse-
   angoli).

   IL PERCHE'. La revisione del compito 2 ha trovato tre Importanti, con
   una causa comune: la prova ANTI-STALLO nata al compito 1 misurava
   un'assunzione PIU' FORTE dello spec (t.battuta===null esattamente al
   PRIMO fotogramma con t.state!=='battuta'), e l'implementazione aveva
   piegato il design per superarla — il ramo if(G.scene==='battuta') del
   ciclo principale teneva TUTTO il campo fermo per l'intera finestra
   (fermo 0,8 s + hold fino a 3,0 s = 3,8 s deterministici a ogni
   rimessa, contro la soglia di spec "fermo rimessa ~0,8 s"), e lo stato
   "scena play, battuta pendente" su cui il compito 3 costruira' la
   battuta del pollice non esisteva mai.

   LA CURA (questo attrezzo): il ramo 'battuta' del ciclo torna il
   gemello PURO del kickoff — nessun anti-stallo dentro, si esce sempre
   allo scadere del solo minimo (duraBattuta()). L'anti-stallo trasloca
   nel gioco vivo: un blocco nuovo, subito dopo l'hit-stop e prima del
   timer di partita, che tiene lo stesso comportamento di prima (CPU a
   BATTUTA_CPU secondi di hold residuo, chiunque altro a hold<=0) ma
   mentre la scena e' GIA' 'play' e il resto del campo gira normalmente.
   Il battitore umano puo' quindi battere con PASSA/CROSS gia' oggi
   (G.ctrl e' gia' puntato su di lui da posaBattuta): il compito 3
   aggiungera' solo TIRA spento, clip e rispetto del battitore sopra
   questa base, non la finestra stessa.

   LA GUARDIA IN PIU' (stallo teorico segnalato dalla revisione):
   eseguiAiPass(p,D) esce senza calciare se non trova un compagno di
   movimento valido (best===null, "if(!best) return;"). Nella vecchia
   stesura questo non aveva conseguenze osservabili (la scena restava
   'battuta' comunque, in attesa del prossimo tentativo). Nella nuova
   finestra, se il primo tentativo non calcia, G.battuta resta pendente
   per sempre senza una seconda guardia: il blocco nuovo ricontrolla
   G.battuta subito dopo la chiamata e, se e' ancora vivo, scioglie la
   battuta forzando un calcio verso il centro campo — zero dado() in
   piu' (kickBall non ne consuma), quindi il due-versioni non lo vede.

   LE SORELLE DI inMatch (F3): tre copie dell'elenco "scene di partita"
   non avevano ancora imparato 'battuta' (le prime due, setScene e
   setPaused, l'avevano gia' imparato al compito 2): aggiornaBottoniHUD
   (il bottone-pausa spariva a ogni rimessa), window.__indietro (il
   tasto Indietro Android proponeva l'uscita durante il fermo),
   checkOrientation (prompt di rotazione). Una quarta copia sorella,
   forceWinMatch (__test, hook di solo test), resta NON toccata: nessun
   cancello di questa correzione la esercita, esattamente come dichiarato
   dal commento gia' scritto accanto a setPaused al compito 2.

   uso:  node strumenti/_t-battuta-finestra.js --out fuori/battuta-finestra.html
         node strumenti/_t-battuta-finestra.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/battuta-finestra.html'));

const ANCORE = [

/* 1 — il ciclo principale: il ramo 'battuta' torna il gemello PURO del
   kickoff, senza anti-stallo dentro. */
{
  nome: '1/5 ciclo principale: il ramo battuta torna gemello puro del kickoff',
  cerca:
`  if(G.scene==='battuta'){
    /* IL FERMO DELLA BATTUTA (voce #87, compito 2), gemello del kickoff
       qui sopra: il ciclo esce subito, fisica e IA del resto del campo
       sospese. Il fermo dura ALMENO duraBattuta() (0,8 s per rimessa e
       rinvio; l'angolo del compito 4 legge la taglia); scaduto quel
       minimo parte l'anti-stallo, che forza la battuta entro
       BATTUTA_HOLD secondi dall'apertura del fermo - la CPU (e, in
       questo compito, anche l'umano: i verbi di battuta arrivano al
       compito 3) battono con la stessa auto-battuta. Zero dado() nuovo
       qui: eseguiAiPass ne usa uno suo, lo stesso percorso della CPU
       normale (manopoleDi, la sorgente per squadra che l'IA usa gia'
       accanto ad aiPass). kickBall stacca G.battuta al primo tocco
       vero, da qualunque via arrivi - ed e' per questo che si puo'
       tornare a 'play' subito dopo averlo chiamato, nello stesso
       fotogramma: se ha funzionato, G.battuta e' gia' null. */
    const scaduto = G.sceneT>=duraBattuta();
    if(scaduto && G.battuta){
      G.battuta.hold-=dt;
      const bp=G.players[G.battuta.battitore];
      const cpu=G.cpu[G.battuta.team];
      if(bp && ((cpu && G.battuta.hold<=BATTUTA_HOLD-BATTUTA_CPU) || G.battuta.hold<=0)){
        eseguiAiPass(bp, manopoleDi(G.battuta.team));
      }
    }
    if(scaduto && !G.battuta) setScene('play');
    return;
  }
`,
  metti:
`  if(G.scene==='battuta'){
    /* IL FERMO TORNA BREVE (voce #87, correzione revisione compito 2):
       gemello PURO del kickoff qui sopra, senza anti-stallo dentro - la
       stesura precedente teneva TUTTO il campo fermo per l'intera
       finestra (fermo 0,8 s + hold fino a 3,0 s = 3,8 s), quasi cinque
       volte la soglia di spec (~0,8 s), e nascondeva lo stato "scena
       play, battuta pendente" su cui il compito 3 costruira' la battuta
       del pollice. L'anti-stallo vive ora nel gioco vivo, subito dopo
       l'hit-stop qui sotto: la scena torna 'play' allo scadere del solo
       minimo, e il resto del campo (fisica, IA, panchina) riprende a
       girare mentre il battitore aspetta il suo turno. Il tipo 'rinvio'
       (compito 4) non ha ancora un battitore piazzabile (posaBattuta
       gestisce solo 'rimessa'): il letterale sotto e' preparato in
       anticipo e oggi non e' mai esercitato da nessuna prova. */
    if(G.sceneT>=duraBattuta()){
      setScene('play');
      if(G.battuta && G.battuta.tipo==='rinvio') G.battuta=null;
    }
    return;
  }
`,
},

/* 2 — il gioco vivo: la finestra di battuta, subito dopo l'hit-stop e
   prima del timer di partita. E' qui che l'anti-stallo vive adesso, a
   scena 'play', non piu' dentro il ramo 'battuta' del ciclo. */
{
  nome: '2/5 gioco vivo: la finestra di battuta, dopo l\'hit-stop',
  cerca:
`  /* hit-stop: congela la simulazione ma non il rendering */
  if(G.freeze>0){ G.freeze-=dt; return; }

  /* timer di partita */
`,
  metti:
`  /* hit-stop: congela la simulazione ma non il rendering */
  if(G.freeze>0){ G.freeze-=dt; return; }

  /* LA FINESTRA DI BATTUTA (voce #87, correzione revisione compito 2):
     vive qui, a mondo vivo, non dentro la scena 'battuta' qui sopra - il
     fermo dura solo duraBattuta() (~0,8 s), poi la scena e' gia' 'play' e
     questo blocco gestisce SOLO l'anti-stallo del battitore in attesa,
     mentre fisica, IA e panchina del resto del campo girano normalmente.
     La CPU batte a BATTUTA_CPU secondi dalla fine dell'hold (~0,5 s dopo
     l'ingresso in questa finestra); chiunque altro (umano incluso - i
     verbi dedicati arrivano al compito 3, ma G.ctrl e' gia' puntato sul
     battitore dal piazzamento, quindi PASSA/CROSS funzionano gia') entro
     BATTUTA_HOLD secondi totali. Zero dado() nuovo qui: eseguiAiPass ne
     consuma uno suo, lo stesso percorso della CPU normale. Se
     eseguiAiPass non trova un compagno valido (best===null, riga vicino
     a "if(!best) return;") non chiama mai kickBall e G.battuta resta
     pendente - la guardia sotto chiude anche questo stallo teorico,
     sciogliendo la battuta verso il centro campo. kickBall resta
     l'unico imbuto (lo azzera al primo tocco vero, da qualunque via
     arrivi), quindi la riga di salvataggio scatta solo se il primo
     tentativo non ha calciato. */
  if(G.battuta){
    G.battuta.hold-=dt;
    const bp=G.players[G.battuta.battitore];
    const cpu=G.cpu[G.battuta.team];
    if(bp && ((cpu && G.battuta.hold<=BATTUTA_HOLD-BATTUTA_CPU) || G.battuta.hold<=0)){
      eseguiAiPass(bp, manopoleDi(G.battuta.team));
      if(G.battuta){
        /* nessun compagno valido: si scioglie comunque, palla verso il centro */
        const dx=FW/2-bp.x, dy=FH/2-bp.y, l=Math.max(1,len(dx,dy));
        kickBall(bp, dx/l, dy/l, 420, 0);
      }
    }
  }

  /* timer di partita */
`,
},

/* 3 — aggiornaBottoniHUD: senza 'battuta' in inMatch, il bottone-pausa
   sparisce a ogni rimessa. */
{
  nome: '3/5 aggiornaBottoniHUD: inMatch impara \'battuta\'',
  cerca:
`function aggiornaBottoniHUD(){
  const s=G.scene;
  const inMatch = s==='play'||s==='kickoff'||s==='golden'||s==='goal'||s==='freekick';
`,
  metti:
`function aggiornaBottoniHUD(){
  const s=G.scene;
  /* BATTUTA E' UN FERMO DI PARTITA (voce #87, correzione revisione
     compito 2): senza questa voce il bottone-pausa sarebbe sparito a
     ogni rimessa, come se la partita non fosse piu' in corso. */
  const inMatch = s==='play'||s==='kickoff'||s==='battuta'||s==='golden'||s==='goal'||s==='freekick';
`,
},

/* 4 — window.__indietro: senza 'battuta' in inMatch, il tasto Indietro
   Android propone l'uscita durante il fermo della rimessa. */
{
  nome: '4/5 __indietro: inMatch impara \'battuta\'',
  cerca:
`window.__indietro = function(){
  const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='golden'||
                  G.scene==='goal'||G.scene==='freekick';
`,
  metti:
`window.__indietro = function(){
  /* BATTUTA E' UN FERMO DI PARTITA (voce #87, correzione revisione
     compito 2): senza questa voce il tasto Indietro Android avrebbe
     proposto l'uscita durante il fermo della rimessa, come se la
     partita non fosse in corso. */
  const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='battuta'||G.scene==='golden'||
                  G.scene==='goal'||G.scene==='freekick';
`,
},

/* 5 — checkOrientation: senza 'battuta' in inMatch, il prompt di
   rotazione tratta il fermo della rimessa come se non fosse partita. */
{
  nome: '5/5 checkOrientation: inMatch impara \'battuta\'',
  cerca:
`function checkOrientation(){
  const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='golden'||
                  G.scene==='goal'||G.scene==='freekick';
`,
  metti:
`function checkOrientation(){
  /* BATTUTA E' UN FERMO DI PARTITA (voce #87, correzione revisione
     compito 2): senza questa voce il prompt di rotazione si sarebbe
     comportato come se la rimessa non fosse partita vera. */
  const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='battuta'||G.scene==='golden'||
                  G.scene==='goal'||G.scene==='freekick';
`,
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

/* CONTEGGI A DELTA: marker distintivi di ciascuna sostituzione, ognuno
   atteso +1 fra src e out (il testo vecchio del ramo battuta e delle tre
   copie sorelle sparisce, quindi i suoi marker vanno a -1: verificati a
   parte sotto, non nella lista "attesi" che guarda solo cio' che nasce). */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['IL FERMO TORNA BREVE (voce #87, correzione revisione compito 2)', 1],
  ["if(G.sceneT>=duraBattuta()){\n      setScene('play');", 1],
  ['LA FINESTRA DI BATTUTA (voce #87, correzione revisione compito 2)', 1],
  ['if(G.battuta){\n    G.battuta.hold-=dt;', 1],
  ['nessun compagno valido: si scioglie comunque, palla verso il centro', 1],
  ["s==='play'||s==='kickoff'||s==='battuta'||s==='golden'||s==='goal'||s==='freekick';", 1],
  ["G.scene==='play'||G.scene==='kickoff'||G.scene==='battuta'||G.scene==='golden'||\n                  G.scene==='goal'||G.scene==='freekick';", 2],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
/* la vecchia forma del ramo battuta (con l'anti-stallo dentro) deve
   sparire del tutto: -1 rispetto a src, cioe' 0 occorrenze in out. */
const scomparsi = [
  "const scaduto = G.sceneT>=duraBattuta();",
  "if(scaduto && !G.battuta) setScene('play');",
];
for (const s of scomparsi) {
  if (conta(out, s) !== 0) rotti.push(s + ' atteso 0 in uscita, trovato ' + conta(out, s));
}
/* forceWinMatch (hook di solo test, __test) NON deve cambiare: la sua
   copia di inMatch resta a quattro rami, senza 'battuta'. */
const forceWinInvariato =
  "  forceWinMatch(){\n    const inMatch = G.scene==='play'||G.scene==='kickoff'||G.scene==='golden'||\n                    G.scene==='goal'||G.scene==='freekick';";
if (conta(out, forceWinInvariato) !== conta(src, forceWinInvariato)) {
  rotti.push('forceWinMatch: doveva restare invariato, non lo e\' piu\'');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
