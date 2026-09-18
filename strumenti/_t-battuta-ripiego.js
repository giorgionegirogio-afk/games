/* =====================================================================
   _t-battuta-ripiego.js — IL RIPIEGO RIPORTA LA PALLA IN BANDA, E IL
   COMMENTO DICE IL VERO (voce #87, coda della revisione finale, 18
   settembre 2026).

   IL DIFETTO, misurato dal ri-verdetto (non dedotto). La guardia
   «nessun battitore» aggiunta a `pallaFuori` dalla precedente onda di
   correzione (rilievo I5) libera l'owner e azzera G.battuta, ma NON
   riporta il pallone dentro la banda: la palla resta esattamente dove
   `ballWalls` l'ha trovata fuori (fuori dalla fascia o dal fondo), ferma
   (vx=vy=0). A campo vero, `ballWalls` gira ogni fotogramma sulla fisica
   libera della palla (chiamato da `updateBall`, mai gestito dalla
   guardia di scena) — quindi al fotogramma in cui la scena torna 'play'
   (subito: vedi sotto) lo stesso varco si ripresenta, `pallaFuori` viene
   richiamata, la guardia rilibera di nuovo l'owner, la scena torna
   'battuta', e cosi' via: PLAY e BATTUTA si alternano a fotogrammi
   alterni, all'infinito, finche' qualcosa non muove la palla o finisce
   la partita. Misurato con una sonda dedicata (rosa di movimento del
   team che deve battere tutta fuori, `out=99`, rimessa provocata sulla
   fascia nord): **169 ingressi in scena 'battuta' su 400 fotogrammi**
   sul gioco senza questa cura, **1** con la cura sotto.

   IL COMMENTO ERA FALSO. La stesura precedente diceva: «la scena
   'battuta' resta comunque per il fermo breve appena impostato sotto».
   Non e' mai vero in questo ramo: `duraBattuta()` (poco sopra in questo
   stesso file) ritorna 0 quando `G.battuta` e' nullo — ed e' proprio lo
   stato che questa guardia produce. La guardia di scena (altrove in
   questo file, dove G.scene==='battuta' controlla G.sceneT>=duraBattuta())
   confronta quindi sceneT(=0, appena resettato da setScene) con 0: vero
   SUBITO, e `setScene('play')` scatta al fotogramma immediatamente
   successivo, non dopo un fermo. Non c'e' nessun fermo da conservare:
   non c'e' nessun battitore ad aspettare.

   LA CURA, minima: dentro la stessa guardia, PRIMA di azzerare owner e
   G.battuta, il pallone torna dentro la banda con un clamp sulle due
   coordinate (B_R/FW-B_R in orizzontale, B_R/FH-B_R in verticale — lo
   stesso raggio che ballWalls usa per decidere se la palla e' fuori).
   E' lo stesso principio di `ballOverBar` quando "deep" e' null (poco
   piu' sotto in questo file): la palla torna a un punto onesto invece
   di restare dove l'ha lasciata la fisica — ma qui il ripiego SCIOGLIE
   LO STATO SUBITO invece di riposizionare la palla su un punto di gioco
   preciso (ballOverBar rimette la palla fra le mani ideali del
   portiere, con owner assegnabile; qui non c'e' nessun uomo disponibile
   a cui darla, quindi la palla torna libera sul bordo del campo). Non
   e' la stessa cura carattere per carattere: e' lo stesso PRINCIPIO
   (mai lasciare la palla fuori dal mondo che la fisica ripete).

   IL CASO RESTA IRRAGGIUNGIBILE nei banchi di batteria normali (serve
   una rosa di movimento azzerata per l'intera squadra che deve battere:
   espulsioni o infortuni cumulati fino a zero uomini di movimento) —
   costruito apposta dalla sonda del ri-verdetto, mai dal gioco vero in
   una partita a rose piene. Zero dado() nuovi.

   uso:  node strumenti/_t-battuta-ripiego.js --out fuori/battuta-ripiego.html
         node strumenti/_t-battuta-ripiego.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/battuta-ripiego.html'));

const CERCA =
`  /* NESSUN BATTITORE TROVATO (rilievo I5 della revisione finale, voce
     #87): le tre pose (posaBattuta/posaBattutaAngolo/posaBattutaRinvio)
     fanno tutte "if(!bt) return;" quando la squadra che deve battere non
     ha un uomo di movimento disponibile (rosa azzerata da espulsioni/
     infortuni) - senza questa guardia G.battuta restava pendente per
     sempre con battitore:-1, la palla ferma, l'owner invariato: lo
     stesso buco che ballOverBar chiudeva gia' (:19468 circa) dopo un
     rilievo CRITICO. Cura CENTRALE qui invece che nelle tre pose: la
     scena 'battuta' resta comunque per il fermo breve appena impostato
     sotto, poi si torna a play con la palla libera, esattamente come fa
     ballOverBar quando "deep" e' null. Zero dado(). */
  if(G.battuta && G.battuta.battitore<0){
    b.owner=-1;
    G.battuta=null;
  }
`;

const METTI =
`  /* NESSUN BATTITORE TROVATO (rilievo I5 della revisione finale, voce
     #87): le tre pose (posaBattuta/posaBattutaAngolo/posaBattutaRinvio)
     fanno tutte "if(!bt) return;" quando la squadra che deve battere non
     ha un uomo di movimento disponibile (rosa azzerata da espulsioni/
     infortuni) - senza questa guardia G.battuta restava pendente per
     sempre con battitore:-1, la palla ferma, l'owner invariato: lo
     stesso buco che ballOverBar chiudeva gia' (poco piu' sotto in
     questo file) dopo un rilievo CRITICO.
     LA CURA RIPORTA ANCHE LA PALLA IN BANDA (coda della revisione
     finale, voce #87): la sola guardia precedente liberava l'owner ma
     lasciava la palla ferma esattamente FUORI dal campo. A campo vero
     ballWalls() gira ogni fotogramma sulla fisica libera della palla
     (mai gestito dalla scena): al fotogramma successivo lo stesso varco
     si ripresentava, pallaFuori() veniva richiamata, la guardia
     riliberava di nuovo - PLAY e BATTUTA alternati a fotogrammi alterni,
     all'infinito. Misurato dal ri-verdetto: 169 ingressi in scena
     'battuta' su 400 fotogrammi senza il clamp qui sotto, 1 con.
     LA STORIA VERA (il commento di prima la raccontava sbagliata): la
     scena 'battuta' NON resta per un fermo breve - duraBattuta() torna
     0 quando G.battuta e' nullo (qui sopra in questo stesso file), e
     setScene('play') scatta SUBITO, al fotogramma successivo: non c'e'
     nessun battitore ad aspettare, e va bene cosi'. Il clamp riporta la
     palla dentro la banda PRIMA di azzerare, come fa ballOverBar col
     riposizionamento vero quando "deep" e' null - stesso PRINCIPIO (mai
     lasciare la palla fuori dal mondo che la fisica ripete), non la
     stessa cura carattere per carattere: ballOverBar assegna un owner a
     un punto di gioco preciso, qui non c'e' nessun uomo disponibile a
     cui darla, quindi la palla torna libera sul bordo del campo. Il
     caso resta irraggiungibile nei banchi normali (serve una rosa di
     movimento azzerata per l'intera squadra che deve battere), costruito
     apposta dalla sonda del ri-verdetto. Zero dado() nuovi. */
  if(G.battuta && G.battuta.battitore<0){
    b.x=clamp(b.x, B_R, FW-B_R);
    b.y=clamp(b.y, B_R, FH-B_R);
    b.owner=-1;
    G.battuta=null;
  }
`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) { console.error('FALLITO: ancoraggio trovato ' + n + ' volte, non 1. Non scrivo niente.'); process.exit(1); }
if (src.includes(METTI)) { console.error('FALLITO: risulta gia\' applicata.'); process.exit(1); }
const out = src.split(CERCA).join(METTI);

/* CONTEGGIO A DELTA: il clamp nuovo, atteso +1 fra src e out; la vecchia
   frase del fermo breve deve sparire (sostituita, non duplicata). */
const conta = (t, s) => t.split(s).length - 1;
const rotti = [];
if ((conta(out, 'b.x=clamp(b.x, B_R, FW-B_R);') - conta(src, 'b.x=clamp(b.x, B_R, FW-B_R);')) !== 1)
  rotti.push('clamp atteso +1, trovato +' + (conta(out, 'b.x=clamp(b.x, B_R, FW-B_R);') - conta(src, 'b.x=clamp(b.x, B_R, FW-B_R);')));
if (conta(out, "scena 'battuta' resta comunque per il fermo breve appena impostato") !== 0)
  rotti.push('la vecchia frase del fermo breve doveva sparire, e non e\' sparita');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  1 ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
