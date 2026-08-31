/* =====================================================================
   _t-senza-dischi.js — IL FOTOGRAMMA SENZA I DISCHI (28 agosto 2026).

   PERCHE' ESISTE, e la ragione e' una bocciatura.

   Il cancello dei dischi (strumenti/_q-dischi.js) esiste per rispondere
   a una domanda sola: quanti pixel di un uomo i comandi RIDIPINGONO.
   Fino a oggi la risposta gliela dava IL GIOCO, che dichiarava l'alfa
   della propria pastiglia dentro __test.comandiTouch, e il cancello si
   fidava — riga 298 del file di allora:

       if ((d.dentro===undefined?1:d.dentro) >= 0.15) return true;

   Una dichiarazione si puo' sbagliare in buona fede o smentire in
   cattiva, e la smentita e' stata costruita: strumenti/_crit8-bugiarda.js
   fabbrica una copia del gioco che DICHIARA la pastiglia vuota e la
   DIPINGE piena. Il cancello la promuoveva a otto controlli su otto,
   mentre i pixel dicevano che era il gioco di prima della cura, identico
   (misurato con strumenti/_crit8-pixel.js il 28 agosto: uomini con
   almeno il 50% dei pixel ridipinti 0,179 sulla bugiarda e 0,179 sul
   gioco pre-cura, contro 0,122 sulla cura).

   Per guardare i pixel serve poter disegnare LO STESSO fotogramma senza
   i dischi, da confrontare con quello con: e' l'unico modo di sapere
   che cosa hanno dipinto loro e non il mondo. E per sapere QUANTO sono
   opachi — non solo dove sono — serve poterli ridipingere su uno sfondo
   che chi misura conosce.

   L'OSTACOLO CHE C'ERA. __test.setTouchButtons(v) prometteva
   esattamente questo interruttore col nome, e non fa niente:

       setTouchButtons(v){ return !!v; },

   e' un gancio morto. Il gioco lo dichiarava gia' «SHIM ... non cambia
   piu' alcun comportamento», quindi non era nascosto; ma il nome
   continua a promettere un comando che non esiste, e i banchi lo
   chiamano davvero (giocata.js, _q-giocata.js, _p-giocata.js,
   _p-giocata-rumore.js, _toppa-giocata.js).

   NON SI PUO' RIANIMARE, e la ragione e' misurabile in tre righe di
   giocata.js:

       await pag.evaluate(() => window.__test.setTouchButtons(true));
       const r = await premiPulsante(cdp, pag, info, 'grande', 600, 'shot');
       await pag.evaluate(() => window.__test.setTouchButtons(false));

   Ogni gesto lo accende e lo SPEGNE. Se quella chiave tornasse a
   comandare il disegno dei dischi, dalla prima giocata in poi i pulsanti
   sparirebbero dallo schermo e da TOUCH_ZONE, e cinque banchi
   comincerebbero a cercare un disco che non c'e'. Quindi la chiave morta
   resta morta — con scritto sopra perche' — e l'interruttore vero nasce
   accanto, con un nome che dice cosa fa.

   LA TOPPA, quattro ancoraggi:
     1  la bandiera SENZA_DISCHI nasce accanto a HUD_POSA, che e' l'altro
        interruttore di sola resa del gioco
     2  drawTouchButtons esce prima di dipingere E prima di dichiarare
     3  __test.senzaDischi(v) e __test.soloDischi() accanto a posaHUD
     4  il verbale sul gancio morto, scritto dove il gancio vive

   COSA NON CAMBIA: l'ingresso (la mappa dei tocchi vive in
   touchBtnLayout e in Touch5, non nel disegno), la simulazione, il conto
   dei sorteggi. dado() resta a 86 chiamate — verificato qui sotto, a
   ogni applicazione.

   LE PROVE, tutte misurate il 28 agosto 2026 e tutte rifacibili:

     · A BANDIERA SPENTA IL GIOCO E' LO STESSO, e non «quasi»:
       strumenti/_z-sd-identico.js mette in posa ferma il gioco spedito e
       la copia toppata e confronta lo scatto — IDENTICI AL BYTE a tutte
       e tre le taglie (1.095.306, 972.415 e 853.490 byte, gli stessi
       numeri da una parte e dall'altra).
     · LA LEGGE SUI SORTEGGI, misurata a runtime dallo stesso file e non
       solo contata nel testo: 1800 passi a seme 20260828 a 11 contro 11
       danno 100.385 sorteggi da una parte e 100.385 dall'altra, con il
       pallone allo stesso sei-decimali e lo stesso punteggio.
     · IL GANCIO MORTO E' MORTO, MISURATO: strumenti/_sonda-senza-dischi.js
       accende e spegne cinque interruttori booleani e conta i pixel che
       cambiano sullo schermo intero. setTouchButtons(false): ZERO.
       senzaDischi(true): 14.148. posaHUD(false): 7.128.
       setMoto(0): 300.874. setDalt(1): 10.069.
     · SOLODISCHI RIDIPINGE ESATTAMENTE CIO' CHE RENDER() DIPINGE: sopra
       il fotogramma senza dischi, zero pixel di scarto dal fotogramma
       vero (prova 'rimessi', ripetuta 33 volte dentro il cancello).
     · LA COPIA TOPPATA PASSA IL COLLAUDO GRANDE: 36 controlli su 36
       (node strumenti/collaudo.js --gioco fuori/_sd-cura.html).

   E UNA COSA CHE E' SALTATA FUORI CERCANDO I GANCI MORTI, scritta qui
   perche' non si perda: __test.setDalt e' un gancio A SENSO UNICO.
   setDalt(1) poi setDalt(0) lascia 1.997 pixel diversi, perche' applyKit
   riscrive TEAMCOL[1] solo dentro il ramo SAVE.dalt: spegnendo l'alto
   contrasto la divisa AVVERSARIA resta quella daltonica
   (#ff80e6 -> #9ccbff, letto a runtime) fino al prossimo startMatch.
   Non e' morto, non e' questa toppa a ripararlo, ed e' bene che qualcuno
   lo sappia prima di misurare due modalita' nella stessa pagina.

   uso:  node strumenti/_t-senza-dischi.js --out fuori/senza-dischi.html
         node strumenti/_t-senza-dischi.js --elenco
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — la bandiera nasce accanto all'altro interruttore di sola resa */
{
  nome: '1/4 la bandiera SENZA_DISCHI accanto a HUD_POSA',
  cerca: `let HUD_POSA=false;`,
  metti:
`let HUD_POSA=false;
/* =====================================================================
   I DISCHI TOLTI DAL FOTOGRAMMA — solo resa, e serve a MISURARE
   (28 agosto 2026).

   PERCHE'. Un banco che voglia sapere quanti pixel di un uomo i comandi
   ridipingono ha due strade: chiedere al gioco quanto e' opaca la sua
   pastiglia, oppure disegnare due volte lo stesso fotogramma — con i
   dischi e senza — e confrontare. La prima strada e' stata provata e ha
   fallito: il cancello strumenti/_q-dischi.js leggeva la dichiarazione
   (__test.comandiTouch.dentro) e una copia del gioco costruita apposta
   per mentire — dichiara vuoto, dipinge pieno, vedi
   strumenti/_crit8-bugiarda.js — gli passava davanti a otto controlli su
   otto. Questa bandiera apre la seconda strada.

   DUE MODI, e servono tutti e due:
     SENZA_DISCHI  drawTouchButtons non dipinge e non dichiara: si ottiene
                   il mondo sotto i comandi, che e' il termine di
                   paragone.
     soloDischi()  (in __test) ridipinge i soli dischi sopra la tela
                   com'e'. Ridipingendoli DUE volte su due sfondi diversi
                   — quello vero e lo stesso con ogni canale ribaltato di
                   128 — l'alfa con cui sono stati stesi si RICAVA invece
                   di crederla: la sovrapposizione e' lineare nello
                   sfondo, quindi da due equazioni esce l'incognita.

   NON E' UN'IMPOSTAZIONE DEL GIOCO, e' un interruttore di sola resa come
   HUD_POSA qui sopra: l'ingresso non passa di qui (la mappa dei tocchi
   vive in touchBtnLayout e in Touch5), la simulazione nemmeno, e in
   questa funzione non si tira un solo sorteggio.
   ===================================================================== */
let SENZA_DISCHI=false;`,
},

/* 2 — l'uscita anticipata, PRIMA della dichiarazione oltre che del
       dipinto: se uscisse dopo, il fotogramma «senza» dichiarerebbe
       dischi che sulla tela non ci sono */
{
  nome: '2/4 drawTouchButtons esce prima di dipingere e di dichiarare',
  cerca: `function drawTouchButtons(){
  if(!(IS_TOUCH||Touch5.used||HUD_POSA)) return;`,
  metti: `function drawTouchButtons(){
  /* IL FOTOGRAMMA SENZA I DISCHI (vedi SENZA_DISCHI). Si esce prima di
     dipingere E prima di riempire TOUCH_ZONE: un fotogramma «senza» che
     dichiarasse dischi inesistenti sarebbe la stessa bugia da cui questa
     bandiera nasce, girata dall'altra parte. */
  if(SENZA_DISCHI) return;
  if(!(IS_TOUCH||Touch5.used||HUD_POSA)) return;`,
},

/* 3 — i due ganci, accanto all'altro gancio di sola resa */
{
  nome: '3/4 __test.senzaDischi e __test.soloDischi accanto a posaHUD',
  cerca: `  posaHUD(v){ HUD_POSA=!!v; return HUD_POSA; },`,
  metti:
`  posaHUD(v){ HUD_POSA=!!v; return HUD_POSA; },
  /* =====================================================================
     IL FOTOGRAMMA SENZA I DISCHI, E I DISCHI SENZA IL FOTOGRAMMA.

     Sono i due ingressi con cui un banco misura A PIXEL quanto i comandi
     coprono, invece di chiederlo al gioco. Solo disegno: non toccano
     input, possesso, simulazione ne' il generatore.

       senzaDischi(true); disegna()   -> il mondo, senza i quattro dischi
       soloDischi()                   -> i quattro dischi, sopra la tela
                                         com'e' adesso

     COME SE NE RICAVA L'ALFA, che e' il motivo per cui soloDischi()
     esiste invece di bastare il confronto. La sovrapposizione del canvas
     e' lineare nello sfondo: comunque siano impilati ombra, pastiglia,
     polvere, ghiera, filo ed etichetta, il risultato su uno sfondo S
     vale  D = k + (1-a)*S,  con k e a che dipendono dal pixel e non da
     S. Chi misura dipinge i dischi su DUE sfondi noti — quello vero e lo
     stesso con ogni canale ribaltato di 128 — e sottrae: la differenza
     vale (1-a) volte la differenza degli sfondi, quindi a esce esatta,
     un pixel alla volta, senza che il gioco debba dichiarare niente.
     Con 128 di scarto l'arrotondamento a otto bit pesa meno di un
     centesimo di alfa.

     soloDischi() rimette TOUCH_ZONE come l'ha trovata: i dischi si
     dichiarano UNA volta per fotogramma, quella del disegno vero, se no
     chi conta i disco-fotogramma conterebbe le ripetute del banco.
     ===================================================================== */
  senzaDischi(v){ SENZA_DISCHI=!!v; return SENZA_DISCHI; },
  soloDischi(){
    const n=TOUCH_ZONE.length, era=SENZA_DISCHI;
    SENZA_DISCHI=false;
    ctx.save();
    /* la stessa trasformazione con cui render() dipinge l'interfaccia:
       scritta invece che ereditata, cosi' la chiamata vale anche fuori
       dal giro del disegno */
    ctx.setTransform(DPR,0,0,DPR,0,0);
    try{ drawTouchButtons(); }
    finally{ ctx.restore(); SENZA_DISCHI=era; TOUCH_ZONE.length=n; }
    return true;
  },`,
},

/* 4 — il verbale sul gancio morto, scritto dove il gancio vive */
{
  nome: '4/4 il verbale su setTouchButtons, gancio morto che resta morto',
  cerca: `  /* SHIM: lo schema dei comandi touch e' unico e i pulsanti vivono
     sempre — questa chiave resta chiamabile (giocata.js la invoca in
     'carica') ma non cambia piu' alcun comportamento. */
  setTouchButtons(v){ return !!v; },`,
  metti:
`  /* =====================================================================
     GANCIO MORTO, E RESTA MORTO APPOSTA (verbale del 28 agosto 2026).

     Questa chiave non fa niente: restituisce il booleano che le hai dato
     e torna. Lo schema dei comandi touch e' unico e i pulsanti vivono
     sempre, quindi non c'e' piu' niente da accendere.

     IL NOME PERO' PROMETTE UN INTERRUTTORE, e qualcuno prima o poi
     provera' a rianimarlo per disegnare un fotogramma senza i comandi.
     NON SI PUO', e la ragione sta in tre righe di strumenti/giocata.js
     (e nelle stesse tre di _q-giocata.js, _p-giocata.js,
     _p-giocata-rumore.js, _toppa-giocata.js):

         await pag.evaluate(() => window.__test.setTouchButtons(true));
         const r = await premiPulsante(..., 'grande', 600, 'shot');
         await pag.evaluate(() => window.__test.setTouchButtons(false));

     ogni gesto la accende e la SPEGNE. Se tornasse a comandare il
     disegno, dalla prima giocata in poi i dischi sparirebbero dallo
     schermo e da TOUCH_ZONE, e cinque banchi si metterebbero a cercare
     un pulsante che non c'e' piu'.

     CHI CERCA QUELL'INTERRUTTORE LO TROVA SOPRA: __test.senzaDischi(v),
     che e' di sola resa e non ha chiamanti che lo spengano per conto
     loro. La chiave qui resta chiamabile perche' quelle cinque righe
     esistono gia' e non devono rompersi.
     ===================================================================== */
  setTouchButtons(v){ return !!v; },`,
},

];

/* =====================================================================
   I CONTROLLI DOPO LA SOSTITUZIONE. Non «ho scritto», ma «c'e' ed e' uno
   solo»: una toppa che si applica due volte, o che aggancia un pezzo
   sbagliato, si vede qui e non tre ore dopo dentro un cancello.
   ===================================================================== */
const ATTESI = [
  ['let SENZA_DISCHI=false;', 1],
  ['  if(SENZA_DISCHI) return;', 1],
  ['  senzaDischi(v){ SENZA_DISCHI=!!v; return SENZA_DISCHI; },', 1],
  ['  soloDischi(){', 1],
  ['TOUCH_ZONE.length=n;', 1],
  ['  setTouchButtons(v){ return !!v; },', 1],
  ['GANCIO MORTO, E RESTA MORTO APPOSTA', 1],
];

const conta = (s, re) => (s.match(re) || []).length;

/* ---------------------------------------------------------------------
   applica(src) — la toppa come FUNZIONE, non solo come comando.

   PERCHE' SI ESPORTA. Il cancello strumenti/_q-dischi.js ha bisogno dei
   due ganci per misurare, ma il gioco SPEDITO non li ha e la casa non
   ammette --dentro. Se il cancello pretendesse un file gia' toppato,
   «node strumenti/_q-dischi.js» sul gioco di tutti i giorni sarebbe una
   prova nulla — cioe' il difetto che questo lavoro doveva togliere,
   spostato di un metro. Quindi il cancello si costruisce in memoria il
   gioco che sa misurare, con QUESTE righe e non con una copia di
   comodo: una sola stesura, un solo posto dove sbagliarsi.
   Se i ganci ci sono gia' (il giorno in cui la toppa entrera' nel
   gioco), applica() non tocca niente e lo dice.
   --------------------------------------------------------------------- */
function applica(src) {
  if (src.indexOf('senzaDischi(v){ SENZA_DISCHI=!!v;') >= 0) return { out: src, ancore: 0, gia: true };
  let out = src;
  const mancanti = [];
  for (const a of ANCORE) {
    const n = out.split(a.cerca).length - 1;
    if (n !== 1) { mancanti.push(a.nome + ': trovato ' + n + ' volte'); continue; }
    out = out.replace(a.cerca, a.metti);
  }
  if (mancanti.length) throw new Error('ancoraggi non trovati esattamente una volta:\n  · ' + mancanti.join('\n  · '));
  const rotti = ATTESI.filter(([s, n]) => (out.split(s).length - 1) !== n)
    .map(([s, n]) => JSON.stringify(s) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
  if (rotti.length) throw new Error('dopo la sostituzione:\n  ' + rotti.join('\n  '));
  /* LA LEGGE SUI SORTEGGI: il conto di dado() non cambia. Questa toppa
     non ne aggiunge e non ne toglie — se un giorno lo facesse, la
     partita a seme fisso non sarebbe piu' la stessa e ogni confronto
     costruito sopra di lei sarebbe aria.
     SI CONTA DUE VOLTE, e i due conti non coincidono: il modello di casa
     (_crit8-bugiarda.js) usa /\bdado\s*\(/ , che sul gioco di oggi da'
     87 perche' pesca anche un «primo dado» a fine riga con la parentesi
     di un inciso all'inizio della successiva, dentro un commento. Le
     chiamate vere, contate sul letterale, sono 86. Qui devono restare
     fermi tutt'e due: quello letterale e' il numero, quello largo e' la
     rete. E nemmeno un Math.random di contrabbando. */
  const d0 = conta(src, /dado\(/g), d1 = conta(out, /dado\(/g);
  const l0 = conta(src, /\bdado\s*\(/g), l1 = conta(out, /\bdado\s*\(/g);
  const r0 = conta(src, /Math\.random\s*\(/g), r1 = conta(out, /Math\.random\s*\(/g);
  if (d0 !== d1 || l0 !== l1) throw new Error('dado() ' + d0 + ' -> ' + d1 + ' (largo ' + l0 + ' -> ' + l1 + ')');
  if (r0 !== r1) throw new Error('Math.random ' + r0 + ' -> ' + r1);
  return { out, ancore: ANCORE.length, gia: false, dado: d1, random: r1 };
}

module.exports = { ANCORE, applica };

/* ------------------------------------------------------------ comando */
if (require.main === module) {
  if (haFlag('elenco')) {
    console.log('_t-senza-dischi.js — ' + ANCORE.length + ' ancoraggi:');
    for (const a of ANCORE) console.log('  · ' + a.nome);
    process.exit(0);
  }
  if (haFlag('dentro')) { console.error('FALLITO: --dentro non e\' ammesso in questa casa. Si prova su copia con --out.'); process.exit(2); }

  const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
  if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }
  let outFile = arg('out', '');
  if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.senza-dischi.html';
  outFile = path.resolve(RADICE, outFile);
  if (outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

  const src = fs.readFileSync(inFile, 'utf8');
  let r;
  try { r = applica(src); }
  catch (e) { console.error('FALLITO: ' + e.message); process.exit(1); }
  if (r.gia) { console.error('FALLITO: ' + inFile + ' ha gia\' i ganci — la toppa e\' gia\' dentro.'); process.exit(1); }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, r.out);
  console.log('OK  ' + r.ancore + ' ancoraggi applicati · dado() ' + r.dado + ' invariate · Math.random ' + r.random + ' invariate');
  console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
  console.log('    a    ' + outFile + '  (' + r.out.length + ' caratteri)');
}
