/* =====================================================================
   _t-riadozione.js — DOPO LA PAUSA, IL POLLICE APPOGGIATO TORNA A COMANDARE.

   IL DIFETTO, misurato e non supposto.
   La toppa del rilascio (`_t-rilascio.js`) fa una cosa giusta: quando la
   finestra perde il fuoco, `Touch5.azzera()` spegne le levette, se no si
   riprende con la levetta ancora premuta dov'era e il giocatore riparte
   da solo. Ma spegnere una levetta non alza il dito: il pollice e' ancora
   sul vetro, e il browser NON rimanda un `touchstart` per un dito che era
   gia' giu'. Da quel momento i suoi `touchmove` cadono nel vuoto, perche'
   `Touch5.move` li accetta solo se `s.active && s.id===id`.

   Misurato con `strumenti/_p-pausa-banco.js`, quattro giri per braccio:
     controllo (stessa attesa, nessuna pausa):  4/4 dita ancora vive
     con pausa, dito mai alzato:                0/4 — MORTE tutte
   `humanMove(0)` passa da [0.926, -0.379] a [0, 0] e non torna piu'.

   Conta perche' il committente muove il giocatore cosi': «il pollice
   rimane sullo schermo a sinistra e mantenendolo premuto lo sposto verso
   la direzione scelta». Il pollice sinistro sta giu' per tutta la
   partita, e il tasto Indietro e' il piu' premuto di un telefono: senza
   questa riparazione, dopo ogni pausa bisogna alzare e riappoggiare il
   dito perche' il giocatore torni a correre, e nessuno lo dice.

   LA CURA. Quando `azzera()` spegne una levetta CHE ERA VIVA, il gioco si
   ricorda la sua ORIGINE (`s.riadotta = {ox, oy}`). Al primo `touchmove`
   di un dito in quella meta' campo, la levetta lo RIADOTTA rimettendo
   quell'origine: lo spostamento fra origine e dito torna a essere quello
   vero, e il giocatore riprende a correre nella direzione che il pollice
   stava gia' indicando.

   PRIMA STESURA, SBAGLIATA, e vale la pena tenerla scritta. Ricentravo la
   levetta SOTTO il dito — sembrava la scelta prudente, niente scatti — e
   il banco diceva `attivo true` con `humanMove` fermo a [0,0]: la levetta
   era viva e non comandava niente. Il pollice e' una POSIZIONE, e se al
   ritorno e' ancora spinto in avanti sta ancora dicendo «corri di la'»;
   ricentrarlo vuol dire dimenticare in silenzio quello che il dito chiede.
   Con l'origine vera: 5 riprese su 5, e il comandato corre.

   PERCHE' AL PRIMO MOVIMENTO E NON SUBITO ALLA RIPRESA. Un dito che non
   manda un solo evento e' indistinguibile da un dito che si e' alzato
   durante la pausa. Riadottarlo alla cieca lascerebbe una levetta
   fantasma che nessuno rilascia piu', e quella BLOCCA il tocco successivo
   (`if(s.active) return` in start): si curerebbe un fastidio con un
   blocco. Il movimento e' la prova che il dito c'e'. Costo dichiarato: a
   pollice perfettamente immobile il comando torna solo al primo tremore —
   misurato 0/5 a dito fermo, 5/5 dopo tre pixel.

   LA GUARDIA, e non e' un dettaglio. Un critico ha appena dimostrato, su
   un'altra toppa, che «adottare un dito» e' il modo piu' facile di far
   rubare la levetta da un contatto vagante — con la conseguenza che il
   comandato si ferma e al rilascio parte un passaggio fantasma. Qui la
   riadozione e' chiusa da quattro condizioni insieme:
     1. avviene SOLO dopo un azzeramento che ha spento una levetta VIVA
        (la bandiera nasce li' e non altrove);
     2. si spegne alla PRIMA adozione, e non puo' ripetersi;
     3. si spegne anche appena una levetta parte normalmente da un
        `touchstart`, che ha sempre la precedenza;
     4. NON adotta un dito che si trova sopra un pulsante o nel suo anello
        di esclusione — la stessa prova che fa `start()`, cosi' un pollice
        destro non puo' diventare la levetta.

   uso:  node strumenti/_t-riadozione.js --a fuori/dopo.html
         node strumenti/_t-riadozione.js --dentro
   Non scrive niente se anche un solo ancoraggio non si trova esattamente
   una volta.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const DENTRO = process.argv.includes('--dentro');
const DA = path.resolve(arg('da', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const A = DENTRO ? DA : path.resolve(arg('a', ''));

if (!DENTRO && !A) { console.error('serve --a <file> oppure --dentro'); process.exit(2); }
if (!fs.existsSync(DA)) { console.error('non trovo ' + DA); process.exit(2); }

const CAMBI = [
  {
    nome: 'azzera: ricorda che il dito e\' rimasto sul vetro',
    cerca: `    for(let t=0;t<2;t++){
      const s=this.stick[t];
      s.active=false; s.id=-1; s.dx=0; s.dy=0; s.hist=[];
    }`,
    metti: `    for(let t=0;t<2;t++){
      const s=this.stick[t];
      /* SPEGNERE UNA LEVETTA NON ALZA IL DITO. Se era viva, il pollice e'
         ancora sul vetro — e il browser non rimandera' un touchstart per
         lui. Questa bandiera e' l'unico modo che ha il gioco di sapere
         che c'e' un dito appoggiato che non gli sta piu' parlando; la
         legge Touch5.move e la spegne alla prima riadozione.
         SI TIENE L'ORIGINE, non solo il fatto. Ricentrare la levetta sotto
         il dito al ritorno sembrava la scelta prudente — niente scatti —
         ma e' sbagliata: il pollice e' una POSIZIONE, e se al ritorno e'
         ancora spinto in avanti sta ancora dicendo «corri di la'».
         Ricentrarlo vuol dire che il gioco dimentica in silenzio quello
         che il dito gli sta chiedendo, e il giocatore resta fermo mentre
         il pollice e' teso. Misurato: con la ricentratura la levetta
         risultava viva (attivo true) e humanMove restava [0,0]. */
      s.riadotta = s.active ? { ox: s.ox, oy: s.oy } : null;
      s.active=false; s.id=-1; s.dx=0; s.dy=0; s.hist=[];
    }`,
  },
  {
    nome: 'move: riadotta il dito appoggiato, con quattro guardie',
    cerca: `  move(id,x,y){
    if(this.btnTouch[id]) return;
    for(let t=0;t<2;t++){`,
    metti: `  move(id,x,y){
    if(this.btnTouch[id]) return;
    /* LA RIADOZIONE — vedi strumenti/_t-riadozione.js per la misura.
       Dopo una pausa il dito e' ancora giu' ma la levetta e' spenta, e i
       suoi touchmove cadrebbero nel vuoto per sempre: misurato 0 dita
       vive su 4, contro 4 su 4 del braccio di controllo.
       L'ORIGINE SI RIMETTE DOV'ERA, non sotto il dito: il pollice e' una
       posizione, e se e' ancora spinto in avanti sta ancora chiedendo di
       correre. Ricentrarla dava una levetta viva che non comandava niente.
       Le quattro guardie stanno tutte in questa riga e nelle due
       successive: la bandiera esiste solo dopo un azzeramento che ha
       spento una levetta viva; si spegne alla prima adozione; un
       touchstart normale la spegne prima (vedi start); e un dito sopra un
       pulsante o nel suo anello di esclusione non viene adottato, che e'
       la stessa prova di start() e serve a impedire che il pollice destro
       diventi la levetta. */
    if(!G.paused){
      const tr=this.teamOf(x), sr=this.stick[tr];
      if(sr.riadotta && !sr.active){
        let suPulsante=false;
        for(const bt of touchBtnLayout(tr)){ if(len(x-bt.x,y-bt.y)<=bt.r+18){ suPulsante=true; break; } }
        if(!suPulsante){
          sr.active=true; sr.id=id;
          sr.ox=sr.riadotta.ox; sr.oy=sr.riadotta.oy;
          sr.dx=x-sr.ox; sr.dy=y-sr.oy;
          const lr=len(sr.dx,sr.dy);
          if(lr>70){ sr.ox=x-sr.dx/lr*70; sr.oy=y-sr.dy/lr*70; sr.dx=x-sr.ox; sr.dy=y-sr.oy; }
          sr.hist=[{x,y,t:performance.now()}];
        }
        sr.riadotta=null;
      }
    }
    for(let t=0;t<2;t++){`,
  },
  {
    nome: 'start: un tocco vero ha sempre la precedenza sulla riadozione',
    cerca: `    s.active=true; s.id=id; s.ox=x; s.oy=y; s.dx=0; s.dy=0;
    s.hist=[{x,y,t:performance.now()}];
  },`,
    metti: `    s.active=true; s.id=id; s.ox=x; s.oy=y; s.dx=0; s.dy=0;
    s.riadotta=null;    /* un dito nuovo batte sempre quello da riadottare */
    s.hist=[{x,y,t:performance.now()}];
  },`,
  },
];

let s = fs.readFileSync(DA, 'utf8');
const prima = s.length;
const mancanti = [];
for (const c of CAMBI) {
  const n = s.split(c.cerca).length - 1;
  if (n !== 1) { mancanti.push(`${c.nome}: ancoraggio trovato ${n} volte, ne serve esattamente una`); continue; }
  s = s.replace(c.cerca, c.metti);
}
if (mancanti.length) {
  console.error('TOPPA NON APPLICATA — nessun byte scritto:');
  for (const m of mancanti) console.error('  ' + m);
  process.exit(1);
}
if (s.split('s.riadotta = s.active ?').length - 1 > 1) {
  console.error('TOPPA NON APPLICATA: la firma compare piu\' di una volta, il file sembra gia\' toppato.');
  process.exit(1);
}
fs.writeFileSync(A, s);
console.log(`toppa applicata: ${CAMBI.length} cambi`);
for (const c of CAMBI) console.log('  · ' + c.nome);
console.log(`  ${DA}\n  -> ${A}\n  delta: ${s.length - prima} caratteri`);
