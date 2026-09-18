/* =====================================================================
   _t-tocco-guardia.js -- LA BANDIERA DEL TOCCO HA UNA GUARDIA (voce #107,
   correzione di revisione del compito 2, cantiere voce-107-regole-leva-corta).

   IL PERCHE'. segnaTocco(pi, piede) (voce #107, compito 2,
   CALCETTO-il-gioco.html ~11186) non ha MAI avuto una guardia
   sull'omissione del secondo parametro: chi chiama a un solo argomento
   eredita in silenzio piede=undefined -> b.toccoPiede=false, proprio la
   direzione PIU' SEVERA per il portiere (false = "non e' un piede" =
   presa concessa, mai negata). Il rischio non e' teorico: al momento
   della revisione il repo portava GIA' nove chiamate a un solo argomento
   nei banchi (grep "segnaTocco(" su tutto strumenti/, censite a mano
   escludendo i due riferimenti in commento di _q-battute.js):
     strumenti/_q-battute.js   -- 2 (righe 208, 217)
     strumenti/_q-l23.js       -- 2 (righe 218, 642)
     strumenti/_q-volo.js      -- 5 (righe 128, 199, 321, 414, 678)
   Nessuna era un bug del gioco (sono banchi, non partite vere), ma un
   domani un chiamante VERO dimenticato in una revisione frettolosa
   sbaglierebbe muto, nella direzione che concede invece di negare --
   esattamente il difetto che RETRO-PRESA (compito 1) e la cura del
   compito 2 hanno appena chiuso.

   LA CURA, IN DUE PARTI.

   1. LA GUARDIA (questo attrezzo, ancora A). In testa a segnaTocco: se
      piede non e' un booleano, si ripiega su false (IL COMPORTAMENTO NON
      CAMBIA: undefined valeva gia' false, per via di !!piede piu' sotto)
      e si stampa un console.warn -- cosi' la dimenticanza smette di
      essere silenziosa. Le nove chiamate dei banchi sopra sono state
      curate A PARTE (non da questo attrezzo: sono file diversi, ognuno
      con la propria funzione dichiarata gia' costruita a mano prima di
      scrivere questa toppa), passando il booleano onesto per il gesto
      che ciascuna scena simula -- in tutti e nove i casi il pallone
      nasce GIA' ai piedi del giocatore scelto (b.owner=<lui>,
      posizionato al suo fianco), lo stesso gesto di "primo tocco
      pulito"/kickBall/posaBattuta nel gioco vero: true in ogni caso, con
      mezza riga di motivo. Dopo la cura: zero chiamate "segnaTocco(" a
      un solo argomento in tutto il repo (grep verificato), zero warn in
      una corsa completa di _q-regole + _q-battute + _q-volo.

   2. IL COMMENTO IN tentaPresa (ancora B). Dichiara il comportamento
      misurato dalla revisione sul caso di mezzo -- un retropassaggio
      QUASI FERMO (velocita' 40, ben sotto sogliaPresa=330) che RETRO-
      PRESA (compito 1) non isolava mai: la palla si ferma esattamente al
      raggio P_R+B_R per una cinquantina di fotogrammi (~0,9 s), poi
      l'inseguimento IA normale (un compagno qualunque, non per forza chi
      ha calciato) la raggiunge e il gioco torna vivo. Il banco dedicato
      e' RETRO-FERMO, la settima prova di strumenti/_q-regole.js: nasce
      verde (controllo discriminante, come RETRO-TESTA), e condanna sia
      un'eventuale presa sia un attraversamento sia uno stallo che non si
      sciogliesse mai.

   uso:  node strumenti/_t-tocco-guardia.js --out fuori/tocco-guardia.html
         node strumenti/_t-tocco-guardia.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/tocco-guardia.html'));

const ANCORE = [

{
  nome: 'A -- segnaTocco: la guardia nasce in testa, il comportamento non cambia',
  cerca:
`function segnaTocco(pi, piede){
  const b=G.ball;
  if(!b || pi<0 || !G.players[pi]) return;
  b.lastTouch=pi;
  /* LA BANDIERA DEL TOCCO (voce #107, compito 2): true se e' un calcio
     di piede (kickBall, l'imbuto vero di ogni calcio, battute comprese),
     false se e' un colpo di testa o un tocco di mani/corpo (portiere,
     contrasti, blocchi). Scritta QUI, a OGNI chiamata: non resta mai
     stantia da un tocco precedente (lezione hitPosts/crossTo, voce #88).
     Ogni chiamante la dichiara; undefined vale false (!!piede), mai "come
     prima" -- la stessa disciplina del censimento in
     strumenti/_t-retropassaggio.js. */
  b.toccoPiede = !!piede;
  G.touches.push({ i:pi, t:G.pulse });
  if(G.touches.length>16) G.touches.shift();
}`,
  metti:
`function segnaTocco(pi, piede){
  /* LA GUARDIA DELLA BANDIERA (voce #107, correzione di revisione compito
     2). Il rischio era gia' vivo: nove chiamate a un solo argomento nei
     banchi (strumenti/_q-battute.js, _q-l23.js, _q-volo.js, censite prima
     di scrivere questa guardia) ereditavano piede=undefined in silenzio,
     proprio la direzione PIU' SEVERA per il portiere (false = "non e' un
     piede" = presa concessa dove andrebbe negata). La guardia NON cambia
     il comportamento (undefined valeva gia' false, per !!piede qui sotto):
     rende visibile la dimenticanza con un avviso, cosi' che un domani non
     passi muto in un chiamante vero. */
  if(typeof piede!=='boolean'){
    piede=false;
    if(typeof console!=='undefined' && console.warn) console.warn('segnaTocco senza flag piede: assumo false', pi);
  }
  const b=G.ball;
  if(!b || pi<0 || !G.players[pi]) return;
  b.lastTouch=pi;
  /* LA BANDIERA DEL TOCCO (voce #107, compito 2): true se e' un calcio
     di piede (kickBall, l'imbuto vero di ogni calcio, battute comprese),
     false se e' un colpo di testa o un tocco di mani/corpo (portiere,
     contrasti, blocchi). Scritta QUI, a OGNI chiamata: non resta mai
     stantia da un tocco precedente (lezione hitPosts/crossTo, voce #88).
     Ogni chiamante la dichiara; undefined vale false (!!piede), mai "come
     prima" -- la stessa disciplina del censimento in
     strumenti/_t-retropassaggio.js. */
  b.toccoPiede = !!piede;
  G.touches.push({ i:pi, t:G.pulse });
  if(G.touches.length>16) G.touches.shift();
}`,
},

{
  nome: 'B -- tentaPresa: il commento dichiara il quasi fermo misurato dalla revisione',
  cerca:
`     ramo gira OGNI fotogramma finche' il pallone e' a portata (nessun
     kickCd nuovo): tentaPresa e' chiamata prima di updateBall (vedi
     step(), updatePlayer prima di updateBall), quindi ricaccia il
     pallone appena fuori dal cerchio della RACCOLTA (KICK_R*0.8=20,8 <
     P_R+B_R=21) PRIMA che quella sezione abbia mai la possibilita' di
     leggerlo -- "puo' sempre giocarla coi piedi" resta vero altrove nel
     file (un compagno, un avversario, un pallone libero qualunque), qui
     e' semplicemente un respingente, non un ricevitore. */
  const lt=b.lastTouch;`,
  metti:
`     ramo gira OGNI fotogramma finche' il pallone e' a portata (nessun
     kickCd nuovo): tentaPresa e' chiamata prima di updateBall (vedi
     step(), updatePlayer prima di updateBall), quindi ricaccia il
     pallone appena fuori dal cerchio della RACCOLTA (KICK_R*0.8=20,8 <
     P_R+B_R=21) PRIMA che quella sezione abbia mai la possibilita' di
     leggerlo -- "puo' sempre giocarla coi piedi" resta vero altrove nel
     file (un compagno, un avversario, un pallone libero qualunque), qui
     e' semplicemente un respingente, non un ricevitore.
     IL QUASI FERMO, MISURATO (revisione, voce #107, correzione compito
     2). Un retropassaggio molto lento (velocita' 40, ben sotto
     sogliaPresa=330) entra qui gia' quasi esausto: il ramo sotto lo
     riposiziona OGNI fotogramma esattamente al raggio P_R+B_R e ne
     smorza la velocita', quindi la palla si FERMA li' -- non un
     deadlock, un fermo. Misurato: resta ferma (velocita' sotto 5) per
     circa 50-60 fotogrammi (~0,9 s) prima che l'inseguimento IA normale
     (un compagno qualunque, non per forza chi ha calciato) la raggiunga
     e il gioco torni vivo. Il banco dedicato e' RETRO-FERMO
     (strumenti/_q-regole.js, settima prova): CONTROLLO DISCRIMINANTE,
     nasce verde, e condanna sia un'eventuale presa sia un attraversamento
     sia uno stallo che non si sciogliesse mai. */
  const lt=b.lastTouch;`,
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

/* CONTEGGI A DELTA. Un solo punto di guardia (dentro la dichiarazione di
   segnaTocco), zero altrove: la guardia vive in UN imbuto solo, non si
   duplica per ogni chiamante. Il comportamento resta 17 chiamate a due
   argomenti (il censimento del compito 2, strumenti/_t-retropassaggio.js)
   piu' la dichiarazione: questo attrezzo non tocca nessuna delle 17. */
const conta = (testo, s) => testo.split(s).length - 1;
const guardieOut = conta(out, "typeof piede!=='boolean'");
const guardiePrima = conta(src, "typeof piede!=='boolean'");
const chiamateSegnaTocco = conta(out, 'segnaTocco(') - 1;   // -1 per la dichiarazione
const rotti = [];
if (guardiePrima !== 0) rotti.push('atteso zero guardie PRIMA della cura, trovate ' + guardiePrima);
if (guardieOut !== 1) rotti.push('atteso ESATTAMENTE una guardia dopo la cura, trovate ' + guardieOut);
if (chiamateSegnaTocco !== 17) rotti.push('atteso 17 chiamate a segnaTocco nel file di gioco (compito 2 invariato), trovate ' + chiamateSegnaTocco);
if (conta(out, 'IL QUASI FERMO, MISURATO') !== 1) rotti.push('atteso il commento del quasi fermo in tentaPresa, non trovato');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    segnaTocco: guardia unica in testa alla dichiarazione, comportamento invariato (undefined valeva gia\' false)');
console.log('    tentaPresa: commento del quasi fermo misurato aggiunto');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
