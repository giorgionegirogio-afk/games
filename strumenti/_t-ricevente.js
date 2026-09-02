/* =====================================================================
   _t-ricevente.js — IL COMANDO SEGUE IL DESTINATARIO (voce #88, compito 6)

   LA DIAGNOSI: switchControlled(dt) sceglie sempre il giocatore piu'
   vicino al pallone, punto. Mentre un cross vola verso il compagno che
   lo aspetta, il pallone e' ancora a meta' strada: il piu' vicino resta
   spesso un altro uomo, e il comando arriva al vero destinatario solo
   quando la palla gli e' quasi addosso. Misurato con _q-volo.js, prova
   C, 2 settembre 2026: 38 fotogrammi dal calcio al comando sul
   destinatario, contro un bersaglio di 30 (mezzo secondo). Nella stessa
   sessione di misura (compito 3, fotogramma per fotogramma): il pallone
   entra nel raggio utile del ricevente al fotogramma 41, ma la sua
   carica si apre solo quando il comando lo raggiunge (fotogramma 38) e
   matura dopo TAP_T (9 fotogrammi), cioe' al 47 — quando il pallone e'
   gia' a 72 unita', fuori portata. Le due condizioni non si incontrano
   mai finche' il comando arriva in ritardo.

   LA CURA: il motore scrive gia' da sempre chi ricevera' un passaggio o
   un cross (b.passTo, e per i palloni alti anche b.crossTo) e li
   azzera da solo quando l'azione finisce. switchControlled deve solo
   LEGGERLI: se c'e' un destinatario dichiarato, valido e vivo, il
   controllo va a lui invece che al piu' vicino. Zero nomi nuovi, zero
   chiamate a dado(): si legge un dato che il motore gia' produceva.

   LA DECISIONE SUL CAMBIO MANUALE (il rischio che il piano segnalava
   senza risolverlo): quando il dito preme CAMBIO senza palla,
   cambiaGiocatore(t) scrive G.ctrl[t] di persona — non passa da questa
   funzione — e subito dopo pianta G.swLock[t]=0.75. Quella variabile e'
   la guardia in cima a switchControlled ("if(G.swLock[t]>0 ...)
   continue"): per 0.75 s l'intero blocco qui sotto, vecchio piu'-vicino
   e nuovo destinatario compresi, non gira affatto per quella squadra.
   Risultato: il dito vince sempre nella sua finestra, senza bisogno di
   una riga in piu' per dirlo — lo faceva gia' col vecchio "piu'
   vicino" e continua a farlo col nuovo "destinatario dichiarato",
   perche' la cura vive dopo la guardia, non prima. Scelta esplicita:
   fra un atto del dito e un suggerimento del motore vince l'atto; solo
   quando la finestra di 0.75 s scade, e se il pallone e' ancora in
   volo, il destinatario dichiarato torna a contare. Misurato:
   node strumenti/giocata.js --tutte tiene verde la giocata 'cambio',
   che campiona proprio il cambio dell'indice comandato al tocco del
   disco piccolo.

   b.passTo e b.crossTo non restano rancidi (verificato con grep prima
   di fidarsi della frase, non solo letto sul piano): si azzerano in
   updateBall su muro ("il ricevitore designato controlla, non mura",
   riga con b.passTo===pi), su tocco sporco e su ogni presa di
   controllo, e ancora su testa alta (colpoDiTesta), parata
   (tentaPresa), palo (hitPosts) e pallone sopra la traversa
   (ballOverBar). Un destinatario letto qui e' sempre un destinatario
   vero, mai un fantasma di un'azione gia' chiusa.

   LEGGE DEI SORTEGGI: nessuna chiamata a dado() in questa cura; zero
   sorteggi nuovi.

   uso:  node strumenti/_t-ricevente.js --out fuori/ricevente.html
         node strumenti/_t-ricevente.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/ricevente.html'));

const ANCORE = [

/* 1 — switchControlled: il comando segue il destinatario */
{
  nome: '1/1 switchControlled: il comando segue il destinatario',
  cerca:
`    let best=-1,bd=1e9;
    for(let i=0;i<G.players.length;i++){
      const p=G.players[i];
      if(p.team!==t || p.out>0 || p.role==='gk') continue;
      const d=len(G.ball.x-p.x,G.ball.y-p.y);
      if(d<bd){bd=d;best=i;}
    }`,
  metti:
`    let best=-1,bd=1e9;
    /* IL COMANDO SEGUE IL DESTINATARIO (voce #88, 2 settembre 2026).
       Misurato da _q-volo.js, prova C: mentre il cross volava verso il
       compagno che lo aspettava, il comando restava al piu' vicino al
       pallone — cioe' a un altro uomo — con 38 fotogrammi di ritardo
       sul bersaglio di 30 (mezzo secondo). Qui si sceglieva solo la
       distanza dal pallone, e la distanza non sa chi ricevera' davvero.
       Se un passaggio o un cross ha un destinatario DICHIARATO dal
       motore (b.crossTo per i palloni alti, altrimenti b.passTo), il
       controllo va subito a lui: e' l'uomo su cui il dito sta gia'
       armando il tiro di prima, non un estraneo che gli e' solo piu'
       vicino in quell'istante.

       IL CAMBIO MANUALE VINCE SEMPRE, E QUESTA RIGA NON PUO' RUBARGLIELO:
       quando il dito preme CAMBIO senza palla, cambiaGiocatore(t) scrive
       G.ctrl[t] di persona (non passa da qui) e pianta subito
       G.swLock[t]=0.75, la guardia in cima a questa stessa funzione. Per
       0.75 s questo intero blocco — vecchio piu'-vicino e nuovo
       destinatario compresi — non gira per quella squadra: il dito
       vince nella sua finestra come vinceva prima di questa cura,
       perche' la cura vive dopo la guardia e non la tocca. Solo a
       finestra scaduta il destinatario dichiarato torna a contare, se
       il pallone e' ancora per aria: fra un atto esplicito del dito e
       un suggerimento del motore vince l'atto. Misurato: la giocata
       'cambio' di giocata.js, che campiona proprio il cambio
       dell'indice comandato, resta verde dopo questa cura.

       b.passTo e b.crossTo non restano rancidi: si azzerano gia' in
       updateBall su muro, tocco sporco e ogni presa di controllo, e
       ancora su testa alta, parata, palo e pallone sopra la traversa —
       verificato con grep, non solo letto sul piano. */
    const dest = (G.ball.crossTo>=0 ? G.ball.crossTo : (G.ball.passTo>=0 ? G.ball.passTo : -1));
    const qd = dest>=0 ? G.players[dest] : null;
    if(qd && qd.team===t && qd.out<=0 && qd.role!=='gk'){
      best=dest; bd=0;
    } else
    for(let i=0;i<G.players.length;i++){
      const p=G.players[i];
      if(p.team!==t || p.out>0 || p.role==='gk') continue;
      const d=len(G.ball.x-p.x,G.ball.y-p.y);
      if(d<bd){bd=d;best=i;}
    }`,
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
  ['const dest = (G.ball.crossTo>=0 ? G.ball.crossTo : (G.ball.passTo>=0 ? G.ball.passTo : -1));', 1],
  ['IL COMANDO SEGUE IL DESTINATARIO', 1],
  ['IL CAMBIO MANUALE VINCE SEMPRE', 1],
  /* 'voce #88' conta 3 nel file di partenza (compito 2 e compito 4,
     mai toccati qui) piu' 1 nuova aggiunta da questo attrezzo dentro
     switchControlled. */
  ['voce #88', 4],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
