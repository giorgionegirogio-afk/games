/* =====================================================================
   _q-dischi.js — IL CANCELLO DEI DISCHI DEI COMANDI.

   PERCHE' ESISTE, e la ragione porta una data e una fotografia. Il 28
   agosto 2026, su un OnePlus 6 vero (fuori/tel-11.png), sotto i due
   dischi PASSAGGIO e TIRA c'erano CINQUE uomini azzurri: chi giocava
   non vedeva meta' della propria squadra ogni volta che l'azione si
   spostava a destra. Ventidue cancelli guardavano quel gioco e nessuno
   diceva niente, perche' il righello dell'interfaccia
   (__test.copertura) e' nato su un criterio di QUATTRO soggetti —
   palla, comandato, porta attaccata, portiere — e un compagno non e'
   nessuno dei quattro. Nella stessa fotografia c'erano gli altri due
   difetti: due dischi che si chiamavano PASSA e PASSAGGIO a otto
   centimetri l'uno dall'altro, e un avviso che diceva
   «AVVERSARIO IN 2  9"».

   ---------------------------------------------------------------------
   LA SECONDA STESURA, E PERCHE' C'E' STATA (28 agosto 2026, sera).

   La prima stesura di questo file era un TIMBRO, e la prova non l'ha
   costruita chi scrive: l'ha costruita un critico avversario. I
   controlli C1..C5 chiedevano al GIOCO quanto fosse opaca la propria
   pastiglia — `d.dentro`, che arriva da __test.comandiTouch — e si
   fidavano della risposta:

       if ((d.dentro===undefined?1:d.dentro) >= 0.15) return true;

   strumenti/_crit8-bugiarda.js fabbrica in due ancoraggi una copia del
   gioco che DICHIARA la pastiglia vuota e la DIPINGE piena: stessi
   dischi, stesse etichette, stesso avviso, stesso conto di dado(). A
   pixel e' il gioco di PRIMA della cura, identico (misurato con
   strumenti/_crit8-pixel.js: uomini con almeno il 50% dei pixel
   ridipinti 0,179 sulla bugiarda e 0,179 sul pre-cura, contro 0,122
   sulla cura). Questo cancello le dava otto controlli su otto.

   ADESSO IL RIGHELLO GUARDA I PIXEL, e non chiede piu' niente a
   nessuno. Il fotogramma si disegna DUE volte e i dischi una terza:

     1  __test.senzaDischi(true) + __test.disegna()  ->  P, il mondo
        sotto i comandi. Disegno FERMO (renderDT a zero e camera
        rimessa, la cura di strumenti/_posa.js): due disegni consecutivi
        della stessa scena danno ZERO pixel di differenza, ed e' una
        cosa che questo file MISURA a ogni corsa invece di sperarla.
     2  __test.soloDischi()  ->  D1, i dischi sopra P. Verificato: D1 e'
        identico al pixel al fotogramma vero (prova 'rimessi').
     3  la regione si riscrive con P a canali ribaltati di 128 (K) e i
        dischi si ridipingono  ->  D2.

   Da qui l'ALFA VERA, un pixel alla volta e senza una soglia inventata.
   La sovrapposizione del canvas e' lineare nello sfondo: comunque siano
   impilati ombra, pastiglia, polvere, ghiera, filo ed etichetta, vale
   D = k + (1-a)S. Due sfondi, due equazioni:

       a = 1 - (D1 - D2) / (P - K)         con |P-K| = 128 esatti

   L'arrotondamento a otto bit pesa meno di un centesimo di alfa. Quel
   numero e' cio' che i comandi stendono davvero sopra il mondo, ed e'
   direttamente confrontabile con cio' che il gioco dichiara: e' questo
   confronto, e non piu' la parola del gioco, che regge C1, C2, C3, C4 e
   C5.

   I GANCI li apre strumenti/_t-senza-dischi.js, che questo file
   richiede come modulo e applica AL VOLO alla copia servita quando il
   gioco non li ha ancora (nessun file viene toccato, come per --guasto).
   Cosi' «node strumenti/_q-dischi.js» misura il gioco spedito senza che
   nessuno debba toppare niente a mano.

   ---------------------------------------------------------------------
   OTTO CONTROLLI, e ognuno sa diventare rosso: si dimostra con
   --guasto, che inietta il difetto nel gioco servito senza toccare
   nessun file. Il verbale delle iniezioni sta in fondo a questo
   commento.

     C1  il disco DICHIARA la pastiglia (dentro), il buco (rInt) e il
         riquadro dell'etichetta (lab) — E LA DICHIARAZIONE REGGE IL
         CONFRONTO COI PIXEL. E' il controllo che la copia bugiarda
         nasce per battere.
     C2  la pastiglia si SVUOTA davvero — misurata, non dichiarata —
         quando un uomo ci passa sotto
     C3  e NON si svuota quando sotto non c'e' nessuno
     C4  il comando non SPARISCE mai per colpa di un corpo: la GHIERA
         misurata resta opaca
     C5  gli uomini a cui i comandi ridipingono oltre un quarto della
         sagoma stanno sotto il riferimento
     C6  nessuna etichetta sborda dal suo disco, col carattere VERO
     C7  due etichette compresenti non si somigliano
     C8  l'avviso dell'inferiorita' dice una cosa sola e ci sta dentro

   C6 e C7 restano misure di testo e non di pixel: sono le uniche due
   domande di questo file che non riguardano cosa finisce sulla tela ma
   quali parole ci vanno, e il carattere vero le risponde meglio di
   qualunque campionamento.

   IL VERBALE DELLE INIEZIONI, corso il 28 agosto 2026 (--guasti, due
   semi): otto guasti su otto accendono il controllo che devono
   accendere. Due ne accendono anche altri, e va bene cosi' — un difetto
   vero raramente ne rompe uno solo:
     mai-vuota               C2+C5     sempre-vuota            C3
     disco-intero            C2+C4     senza-dichiarazione     C1
     dichiarazione-bugiarda  C1+C2+C5  etichetta-lunga         C6
     nomi-simili             C7        avviso-vecchio          C8
   Il quinto e' NUOVO ed e' quello che la prima stesura non aveva:
   e' _crit8-bugiarda.js portato dentro il banco, cosi' d'ora in poi ci
   resta e nessuno deve ricostruirlo per accorgersi che manca.

   ---------------------------------------------------------------------
   IL BANCO E' RIPETIBILE, e senza questo non misurerebbe niente. Tre
   cose, tutte imparate a spese:
     · rAF e performance.now passano in mano al banco (lo stesso di
       scatta.js). Senza, quattro build sullo stesso seme davano 8935,
       9094, 8398 e 8398 fotogrammi: quattro partite, non quattro cure.
     · si aspetta che il conto dei sorteggi stia fermo prima di seminare.
       Il carattere si carica quando gli pare e la sua promessa ricuoce
       la tessitura del campo, che tira ottantasettemila numeri dal
       generatore comune: due corse della STESSA build divergevano al
       passo 480 con la palla ancora nello stesso punto.
     · i tre disegni in piu' del righello NON devono spostare la
       partita. Il conto dei sorteggi si legge prima e dopo ogni
       campione: se si muove di uno, la corsa e' NULLA. Misurato: zero.

   IL COSTO E' UN CAMPIONAMENTO, ed e' dichiarato. Leggere la tela costa,
   quindi il righello a pixel non gira su tutti i fotogrammi ma uno ogni
   --ogni (di serie 5, cioe' dodici volte al secondo). C1 nella sua parte
   di sola presenza — «il disco dichiara?» — gira invece su TUTTI i
   fotogrammi, perche' non costa niente.

   uso:
     node strumenti/_q-dischi.js
     node strumenti/_q-dischi.js --gioco fuori/_crit8-bugiarda.html
     node strumenti/_q-dischi.js --guasto mai-vuota
     node strumenti/_q-dischi.js --guasti          (prova tutti i guasti)
     node strumenti/_q-dischi.js --taratura        (le distribuzioni, non il verdetto)
   ===================================================================== */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const TOPPA = require('./_t-senza-dischi.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const GIOCO = path.resolve(arg('gioco', process.env.GIOCO_PROVA || path.join(RADICE, 'CALCETTO-il-gioco.html')));
/* QUATTRO SEMI DA TRENTA SECONDI, e la lunghezza non e' un capriccio: coi
   venti secondi di prima il gioco SPEDITO passava C5 (0,292 contro un
   tetto di 0,40). I primi venti secondi di una partita si giocano a
   centrocampo, e il difetto vive dove l'azione arriva in fascia destra,
   cioe' piu' tardi. A trenta secondi per quattro semi il campione e'
   abbastanza lungo da contenere il difetto che il telefono ha
   fotografato. */
const SEMI = String(arg('semi', '20260828,20260829,20260830,20260831')).split(',').map(Number);
const SEC = +arg('sec', 30);
const VW = +arg('vw', 845), VH = +arg('vh', 402);
const TAGLIA = +arg('taglia', 11);
const OGNI = +arg('ogni', 5);
const TARATURA = haFlag('taratura');

/* =====================================================================
   I RIFERIMENTI. Tre file, che sono i tre casi che contano, e i tetti
   si rettificano in chiaro — con la data accanto al numero — non si
   aggiustano in silenzio.

     CURA      CALCETTO-il-gioco.html      il gioco di oggi        VERDE
     BUGIARDA  fuori/_crit8-bugiarda.html  dichiara vuoto,
                                           dipinge pieno    ROSSO C1 C2 C5
     PRIMA     fuori/_prima-comandi.html   il gioco prima
                                           della cura ROSSO C1 C2 C5 C7 C8
   ===================================================================== */
/* =====================================================================
   LA TABELLA, MISURATA IL 28 AGOSTO 2026 CON QUESTO STESSO RIGHELLO —
   quattro semi (20260828..31) da 30 secondi, 11 contro 11 a 845x402, un
   campione ogni 5 fotogrammi: 6183 fotogrammi, 1238 campioni, 4952
   disco-fotogramma campionati, 9,66 uomini in quadro. Sono i numeri che
   il cancello stampa oggi, non un ricordo.

                                        CURA   BUGIARDA   PRIMA
     scarto dichiarato/dipinto, peggio  0,131    0,900    (non dichiara)
     pastiglie vuote (rapporto <0,30)   14,0%     0,0%     0,0%
     ghiere sotto 0,50                   0,1%     0,1%     0,1%
     copertura media di un uomo         0,0171   0,0355   0,0355
     uomini >= 25% ridipinti            0,243    0,515    0,515
     uomini >= 50% ridipinti            0,004    0,294    0,294
     peggior uomo                       0,748    1,000    1,000

   LA BUGIARDA E IL PRE-CURA SONO IDENTICI SU OGNI RIGA DI PIXEL, e
   devono esserlo: la bugiarda nasce per dipingere come il pre-cura e
   dichiarare come la cura. Che il righello nuovo li veda gemelli e' la
   prova che guarda la tela e non la parola — la prima stesura li vedeva
   uno verde e l'altro rosso.
   ===================================================================== */
/* C1 — quanto la pastiglia MISURATA puo' stare sopra quella DICHIARATA.
   Non e' zero e non puo' esserlo: il gioco dichiara `dentro = aBt*aPas`,
   cioe' l'alfa della sola pastiglia, mentre sulla tela dentro il buco
   finiscono anche l'ombra portata del tasto (rgba(4,10,7,.50) alla
   stessa alfa) e la polvere di gesso (fino a 0,07), che si sommano in
   sovrapposizione. Sulla cura lo scarto e' 0,011 in media e 0,131 al
   peggio; la bugiarda dichiara 0,10 e dipinge 1,00, cioe' 0,900. Il
   tetto sta in mezzo, a quasi il doppio del peggio onesto e a poco piu'
   di un quarto della bugia. */
const RIF_BUGIA = 0.25;
/* =====================================================================
   C2 e C3 — LA PASTIGLIA VUOTA SI MISURA CONTRO LA SUA GHIERA.
   Il disco ha due modi di diventare trasparente e uno solo e' la cura
   (vedi il verbale accanto al calcolo, dentro PARTITA). Il rapporto
   pastiglia/ghiera li separa da solo, e la distribuzione e' netta in due
   mucchi senza niente in mezzo — misurata sulla CURA, seme 20260828,
   1232 disco-fotogramma (--taratura):
     minimo 0,15 · decimo percentile 1,03 · mediana 1,05 · massimo 1,06
   e in numeri: sotto 0,15 lo 0,0%, sotto 0,20 il 6,7%, sotto 0,60 il
   7,4%. Cioe' o la pastiglia se ne va (0,15-0,20) o non se ne va
   (1,03-1,06), e fra i due mucchi non c'e' NIENTE: la soglia a 0,30 sta
   in quel vuoto, e spostarla fra 0,20 e 0,60 non cambierebbe il
   verdetto di un disco-fotogramma su settanta.
   ===================================================================== */
const SOGLIA_VUOTA = 0.30;
const RIF_VUOTE_MIN = 3.0;     // per cento dei disco-fotogramma campionati
/* sotto questa alfa la GHIERA e' talmente sparita che il rapporto
   pastiglia/ghiera diventa rumore: quel disco-fotogramma esce dal conto
   di C2 e C3 e resta a carico di C4. Misurato: 6 casi su 4952. */
const GHIERA_VIVA = 0.30;
/* C4 — la GHIERA misurata: e' lei il comando, e non si spegne mai. Sulla
   cura sta fra 0,90 e 0,95 (il tetto di 0,95 e' l'antialiasing della
   corona, non un velo); scende sotto 0,50 nello 0,1% dei
   disco-fotogramma, dove e' il PALLONE a farla scansare — che e' lecito
   e preesistente. Il tetto e' quaranta volte quello 0,1%. */
const SOGLIA_GHIERA = 0.50;
const RIF_GHIERA_SPENTA = 4.0; // per cento dei disco-fotogramma campionati
/* =====================================================================
   C5 — GLI UOMINI RIDIPINTI. Due tagli, non uno, e i numeri della
   tabella qui sopra dicono perche'.

   IL TAGLIO A META' E' QUELLO CHE SEPARA: 0,004 contro 0,294, cioe'
   settanta volte. Ed e' anche il taglio giusto per la fotografia da cui
   questo cancello nasce — cinque uomini azzurri sotto due dischi, non
   intravisti: nascosti. Col tetto a 0,05 la cura ha dodici volte di
   margine e la bugiarda lo sfonda di sei.

   IL TAGLIO A UN QUARTO SEPARA SOLO DI DUE VOLTE (0,243 contro 0,515) e
   resta come SECONDO verdetto, col tetto nel mezzo: 0,38 lascia alla
   cura il 56% di margine e la bugiarda lo sfonda del 36%. E' il piu'
   debole dei due e va detto; serve a prendere una regressione che copra
   TANTI uomini a meta' strada, dove il taglio a meta' non arriverebbe.
   Che la cura dimezzi — e non azzeri — la copertura di mezza via non e'
   un difetto della misura: la pastiglia si svuota, ma la GHIERA e
   l'ETICHETTA restano opache apposta, e un uomo appoggiato al bordo di
   un disco resta coperto quanto prima.
   ===================================================================== */
const SOGLIA_UOMO = 0.25;
const RIF_COPERTI = 0.38;
const SOGLIA_META = 0.50;
const RIF_META = 0.05;

/* =====================================================================
   I GUASTI — un cancello senza il suo rosso dimostrato e' un timbro.
   Ognuno e' una sostituzione di testo sul gioco SERVITO: nessun file
   viene toccato, e se l'ancoraggio non si trova esattamente una volta
   il banco si ferma invece di misurare un gioco che credeva di aver
   guastato.
   ===================================================================== */
const GUASTI = {
  'mai-vuota': {
    perche: 'la pastiglia non si svuota mai (deve accendere C2 e C5)',
    da: 'return scartoMuro(distDisco(CORPI_HUD,CORPI_HUD_N,cx,cy,rr));',
    a: 'return 1;',
  },
  'sempre-vuota': {
    perche: 'la pastiglia e\' sempre vuota, anche sul prato deserto (C3)',
    da: 'return scartoMuro(distDisco(CORPI_HUD,CORPI_HUD_N,cx,cy,rr));',
    a: 'return 0.10;',
  },
  'disco-intero': {
    perche: 'si vela il disco INTERO invece della sola pastiglia — e\' la strada bocciata oggi (C4)',
    da: `                       alpha:+aBt.toFixed(3),
                       dentro:`,
    a: `                       alpha:+(aBt*aPas).toFixed(3),
                       dentro:`,
    poi: [{
      da: `      ctx.globalAlpha=aBt;
      /* la ghiera: ambra a riposo`,
      a: `      ctx.globalAlpha=aBt*aPas;
      /* la ghiera: ambra a riposo`,
    }],
  },
  'senza-dichiarazione': {
    perche: 'il disco smette di dichiarare il buco (C1)',
    da: 'dentro:+(aBt*aPas).toFixed(3), rInt:Math.max(0,bt.r-4)',
    a: 'rInt:0',
  },
  /* IL GUASTO CHE LA PRIMA STESURA NON AVEVA, ed e' quello che l'ha
     bocciata: la dichiarazione mente sul dipinto. E' la stessa cosa che
     fa strumenti/_crit8-bugiarda.js, portata dentro il banco perche'
     d'ora in poi ci resti. */
  'dichiarazione-bugiarda': {
    perche: 'la pastiglia si DICHIARA vuota e si DIPINGE piena (C1, C2, C5)',
    da: `      const aPas=pressed?1:velaPastiglia(bx0,by0,bt.r);`,
    a: `      const aPasDICH=pressed?1:velaPastiglia(bx0,by0,bt.r);
      const aPas=1;   /* BUGIA: si dipinge pieno */`,
    poi: [{
      da: `                       dentro:+(aBt*aPas).toFixed(3), rInt:Math.max(0,bt.r-4)};`,
      a: `                       dentro:+(aBt*aPasDICH).toFixed(3), rInt:Math.max(0,bt.r-4)};`,
    }],
  },
  'etichetta-lunga': {
    perche: 'un\'etichetta che non ci sta nel suo disco (C6)',
    da: "label:'FILTRANTE'",
    a: "label:'FILTRANTISSIMAMENTE'",
  },
  'nomi-simili': {
    perche: 'due etichette che si somigliano nella stessa schermata (C7)',
    da: "label:'FILTRANTE'",
    a: "label:'PASSAGGIO'",
  },
  'avviso-vecchio': {
    perche: 'l\'avviso torna a stampare due numeri appiccicati (C8)',
    da: `      const testo = (fuori===1 ? 'UN UOMO' : fuori+' UOMINI')
                  + (t===0 ? ' IN MENO' : ' IN PIÙ')
                  + ' PER ' + Math.ceil(resta) + '"';`,
    a: `      const testo = (t===0?'IN INFERIORITÀ':'AVVERSARIO IN 2')+'  '+Math.ceil(resta)+'"';`,
  },
};

/* =====================================================================
   --guasti: la prova del rosso, tutta in un colpo. Si rilancia questo
   stesso file una volta per guasto e si stampa chi si e' acceso. Un
   guasto che NON accende il suo controllo e' un guasto costruito male —
   e' gia' successo in questa casa — quindi si dichiara qui quale
   controllo ci si aspetta, e la tabella lo confronta con quelli accesi.
   ===================================================================== */
const ATTESI = {
  'mai-vuota': ['C2', 'C5'],
  'sempre-vuota': ['C3'],
  'disco-intero': ['C4'],
  'senza-dichiarazione': ['C1'],
  'dichiarazione-bugiarda': ['C1'],
  'etichetta-lunga': ['C6'],
  'nomi-simili': ['C7'],
  'avviso-vecchio': ['C8'],
};
if (haFlag('guasti')) {
  const { execFileSync } = require('child_process');
  const base = process.argv.slice(2).filter(a => a !== '--guasti');
  let male = 0;
  console.log('\n=== LA PROVA DEL ROSSO — ' + Object.keys(GUASTI).length + ' guasti iniettati ===\n');
  for (const nome of Object.keys(GUASTI)) {
    let uscita = '';
    try { uscita = execFileSync(process.execPath, [__filename, ...base, '--guasto', nome], { encoding: 'utf8' }); }
    catch (e) { uscita = (e.stdout || '') + (e.stderr || ''); }
    const accesi = [...uscita.matchAll(/ROSSO\s+(C\d)/g)].map(m => m[1]);
    const attesi = ATTESI[nome] || [];
    const mancano = attesi.filter(c => !accesi.includes(c));
    if (mancano.length) male++;
    console.log('  ' + (mancano.length ? 'MUTO ' : ' ok  ') + nome.padEnd(24)
      + 'attesi ' + (attesi.join('+') || '-').padEnd(8) + ' accesi ' + (accesi.join('+') || 'NESSUNO'));
    console.log('           ' + GUASTI[nome].perche);
  }
  if (male) { console.log('\nROSSO: ' + male + ' guasti non accendono il loro controllo — il cancello e\' un timbro.\n'); process.exit(1); }
  console.log('\nVERDE: ogni guasto accende il controllo che deve accendere.\n');
  process.exit(0);
}

const GUASTO = arg('guasto', '');
if (GUASTO && !GUASTI[GUASTO]) {
  console.error('PROVA NULLA: guasto sconosciuto «' + GUASTO + '». Ce ne sono: ' + Object.keys(GUASTI).join(', '));
  process.exit(3);
}

if (!fs.existsSync(GIOCO)) { console.error('PROVA NULLA: non esiste ' + GIOCO); process.exit(3); }
let SRC = fs.readFileSync(GIOCO, 'utf8');
/* il guasto PRIMA della toppa: agisce sul testo del gioco com'e' scritto,
   e nessuno dei suoi ancoraggi tocca le righe che la toppa aggiunge */
if (GUASTO) {
  const g = GUASTI[GUASTO];
  const pezzi = [{ da: g.da, a: g.a }].concat(g.poi || []);
  for (const p of pezzi) {
    const n = SRC.split(p.da).length - 1;
    if (n !== 1) {
      console.error('PROVA NULLA: il guasto «' + GUASTO + '» non si aggancia (trovato ' + n + ' volte):\n  ' + p.da.slice(0, 70));
      process.exit(3);
    }
    SRC = SRC.replace(p.da, p.a);
  }
}
/* I GANCI DEL RIGHELLO. Il gioco spedito non li ha e la casa non ammette
   --dentro: il banco se li mette da se' sulla COPIA SERVITA, con gli
   stessi ancoraggi del file di toppa (una sola stesura). Se un giorno la
   toppa entrera' nel gioco, applica() se ne accorge e non tocca niente. */
let TOPPATA = '';
try {
  const r = TOPPA.applica(SRC);
  SRC = r.out;
  TOPPATA = r.gia ? 'i ganci del righello sono gia\' nel gioco'
                  : 'ganci del righello innestati sulla copia servita (' + r.ancore + ' ancoraggi, dado() ' + r.dado + ' invariate)';
} catch (e) {
  console.error('PROVA NULLA: _t-senza-dischi.js non si aggancia a questo gioco — ' + e.message);
  process.exit(3);
}

/* --- le etichette e i raggi si estraggono BYTE PER BYTE da
   touchBtnLayout: se domani nasce un disco nuovo, entra da solo nel
   giro; se qualcuno rinomina la funzione, questo file si ferma. --- */
function pezzo(apre, chiude, nome) {
  const i = SRC.indexOf(apre);
  if (i < 0) { console.error('PROVA NULLA: non trovo «' + nome + '»'); process.exit(3); }
  if (SRC.indexOf(apre, i + 1) >= 0) { console.error('PROVA NULLA: «' + nome + '» compare piu\' di una volta'); process.exit(3); }
  const j = SRC.indexOf(chiude, i);
  return SRC.slice(i, j + chiude.length);
}
const LAYOUT = pezzo('function touchBtnLayout(t){', '\n}\n', 'touchBtnLayout');
const DISCHI = [];
{
  const re = /\{\s*act:'([a-z]+)',\s*label:'([^']+)',\s*x:[^,]+,\s*y:[^,]+,\s*r:\s*(\d+)\s*\}/g;
  let m;
  while ((m = re.exec(LAYOUT))) DISCHI.push({ act: m[1], label: m[2], r: +m[3] });
}
if (DISCHI.length < 8) { console.error('PROVA NULLA: da touchBtnLayout ho letto ' + DISCHI.length + ' dischi, ne servono almeno 8'); process.exit(3); }
/* due etichette sullo stesso disco (act contestuali) non sono mai
   compresenti: l'indice del disco e' la posizione nell'elenco / 2 */
DISCHI.forEach((d, i) => d.slot = i >> 1);

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(RADICE, u === '/' ? 'index.html' : u);
      if (/CALCETTO-il-gioco\.html$/i.test(f)) {
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(SRC); return;
      }
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* l'orologio del gioco in mano al banco: senza, due build vedono due
   partite e il confronto non vale niente (vedi _z-sotto-dischi.js) */
const BANCO = () => {
  const PASSO = 1000 / 60;
  let t = 0, coda = [], muto = false;
  window.requestAnimationFrame = cb => { if (muto) return 0; coda.push(cb); return coda.length; };
  window.cancelAnimationFrame = () => {};
  try { performance.now = () => t; } catch (e) {}
  window.__banco = {
    passo(n) {
      n = Math.max(0, Math.round(+n || 0));
      for (let i = 0; i < n; i++) { const c = coda; coda = []; t += PASSO; for (const f of c) { try { f(t); } catch (e) {} } }
      return t;
    },
  };
};

const PARTITA = `async (cfg) => {
  const t = window.__test, B = window.__banco, G = t.G;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4);
  /* LA QUIETE PRIMA DEL SEME: document.fonts.load ricuoce la tessitura del
     campo quando le pare, e quella cottura tira decine di migliaia di
     sorteggi dal generatore comune. Due corse identiche divergevano al
     passo 480 con la stessa palla e 87.000 sorteggi di scarto. Si aspetta
     che il conto stia fermo per due giri, poi si semina davvero. */
  t.semina(1);
  { let fermi=0;
    for (let giri=0; giri<20 && fermi<2; giri++){
      const a=t.sorteggi;
      await new Promise(r=>setTimeout(r,300));
      fermi = (t.sorteggi===a) ? fermi+1 : 0;
    } }
  t.semina(cfg.seme); t.setCpuVsCpu(true); t.posaHUD(true);
  t.startMatch(1, 1, { size: cfg.taglia });
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }

  if (typeof t.senzaDischi!=='function' || typeof t.soloDischi!=='function')
    return JSON.stringify({errore:"__test.senzaDischi/soloDischi non ci sono: senza i due ganci il fotogramma senza i dischi non si puo' disegnare, e questo cancello tornerebbe a credere alla dichiarazione del gioco"});

  const cv = document.getElementById('gioco');
  if (!cv) return JSON.stringify({errore:'la tela #gioco non esiste'});
  const cg = cv.getContext('2d');
  const K = cv.width / cfg.VW;              // pixel di tela per pixel CSS
  const RIG_H=34, P_DIS=1.18, RIG_PIEDI=10;

  /* LA REGIONE: l'ingombro dei dischi con un margine. Si prende dalla
     dichiarazione perche' e' geometria (dove sta il disco), non opacita'
     (quanto e' opaco) — e la geometria e' gia' incrociata altrove fra
     pulsanti() e comandiTouch. Il metro degli UOMINI (C5) non ne dipende
     comunque: somma l'alfa misurata sotto la sagoma, e se un disco
     dichiarasse di stare altrove i pixel resterebbero dove sono. */
  const zone0 = (t.comandiTouch||[]).filter(q=>q.tipo==='pulsante'&&q.r>0);
  if (!zone0.length) return JSON.stringify({errore:'nessun disco dichiarato al via'});
  let X0=1e9,Y0=1e9,X1=-1e9,Y1=-1e9;
  for (const d of zone0){ X0=Math.min(X0,d.x-d.r-14); X1=Math.max(X1,d.x+d.r+14);
                          Y0=Math.min(Y0,d.y-d.r-14); Y1=Math.max(Y1,d.y+d.r+16); }
  X0=Math.max(0,Math.floor(X0*K)); Y0=Math.max(0,Math.floor(Y0*K));
  X1=Math.min(cv.width,Math.ceil(X1*K)); Y1=Math.min(cv.height,Math.ceil(Y1*K));
  const RW=X1-X0, RH=Y1-Y0;
  if (RW<=0||RH<=0) return JSON.stringify({errore:'la regione dei dischi e\\' vuota'});

  const alfa = new Float32Array(RW*RH);
  const KK = new Uint8ClampedArray(RW*RH*4);
  const IMK = new ImageData(KK, RW, RH);
  const isto = new Uint32Array(101);
  const leggi = () => cg.getImageData(X0,Y0,RW,RH).data;
  const scarto = (a,b) => { let n=0; for(let i=0;i<a.length;i+=4){
      if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]) n++; } return n; };

  /* IL DISEGNO FERMO — la cura di strumenti/_posa.js, che qui e' la
     condizione di validita' di tutto. render() chiama updateCamera prima
     di dipingere, e updateCamera e' un inseguimento: ogni disegna()
     zooma di un sottopixel e sposta OGNI pixel dello schermo. Con
     renderDT a zero ogni inseguimento moltiplica il suo passo per zero;
     la camera si rimette a posto lo stesso, come cintura. G.miniY ha una
     semivita scritta con un ripiego (G.renderDT||0.016) che lo zero non
     ferma: si rimette anche lui. TAB_VELO ha lo stesso ripiego ma vive
     nella barra del punteggio, fuori dalla regione misurata, e non e'
     raggiungibile da qui: sta scritto perche' chi legge lo sappia. */
  const fermo = (senza) => {
    const c=G.cam, sc={x:c.x,y:c.y,z:c.z}, mini=G.miniY;
    const desc=Object.getOwnPropertyDescriptor(G,'renderDT');
    Object.defineProperty(G,'renderDT',{get:()=>0,set:()=>{},configurable:true});
    try { if(senza) t.senzaDischi(true); t.disegna(); }
    finally { if(senza) t.senzaDischi(false);
      delete G.renderDT; if(desc) Object.defineProperty(G,'renderDT',desc); else G.renderDT=1/60;
      c.x=sc.x; c.y=sc.y; c.z=sc.z; G.miniY=mini; }
  };

  const z = { frames:0, campioni:0, dischiFoto:0, senzaDichiarazione:0,
              dischiCamp:0, vuote:0, vuoteSenzaCorpo:0, ghieraSpenta:0, ghieraMorta:0,
              bugiaMax:0, bugiaSopra:0, bugiaSomma:0, bugiaN:0,
              uomini:0, sopraUomo:0, sopraMeta:0, coperturaMax:0, coperturaSomma:0,
              sorteggiSpesi:0, provaIdem:0, provaRimessi:0, prove:0,
              esempi:[], esempiBugia:[] };
  /* la taratura raccoglie le distribuzioni, il verdetto no: costano
     memoria e non servono a decidere */
  const TAR = cfg.taratura ? { past:[], ghiera:[], rap:[], bugia:[], uomo:[] } : null;

  for (let pas=0; pas<cfg.passi; pas++) {
    if (pas % 240 === 0) await new Promise(r=>setTimeout(r,0));
    B.passo(1);
    if (t.state !== 'play') continue;
    const tutti = (t.comandiTouch||[]).filter(q => q.tipo==='pulsante' && q.r>0);
    if (!tutti.length) continue;
    z.frames++;
    /* C1, la parte che non costa: il disco DICHIARA? Su tutti i
       fotogrammi, perche' e' una lettura e basta. */
    for (const d of tutti) {
      z.dischiFoto++;
      if (d.dentro===undefined || d.rInt===undefined || d.lab===undefined) z.senzaDichiarazione++;
    }
    if (pas % cfg.ogni) continue;

    /* ---------------- IL RIGHELLO A PIXEL ---------------- */
    const s0 = t.sorteggi;
    const prova = (z.campioni % cfg.prova)===0;
    let A1=null;
    if (prova) {
      /* LO ZERO DEL RIGHELLO. Due disegni identici devono dare zero pixel
         di differenza: se non lo danno, tutto quello che questo file
         misura dopo e' rumore di fotogramma e la corsa e' nulla. */
      fermo(false); A1 = leggi();
      fermo(false); const A2 = leggi();
      z.provaIdem += scarto(A1,A2);
    }
    fermo(true);
    const P = leggi();
    t.soloDischi();
    const D1 = leggi();
    if (prova) {
      /* E I DISCHI RIMESSI SOPRA DEVONO RIFARE IL FOTOGRAMMA VERO. Se
         soloDischi() dipingesse anche solo un pixel diverso da come lo
         dipinge render(), l'alfa che ne ricavo sarebbe di un altro
         disegno. */
      z.provaRimessi += scarto(A1,D1);
      z.prove++;
    }
    for (let i=0;i<P.length;i+=4){ KK[i]=P[i]^128; KK[i+1]=P[i+1]^128; KK[i+2]=P[i+2]^128; KK[i+3]=255; }
    cg.putImageData(IMK, X0, Y0);
    t.soloDischi();
    const D2 = leggi();
    /* a = 1 - (D1-D2)/(P-K), un pixel alla volta, sui tre canali */
    for (let i=0,k=0;k<alfa.length;k++,i+=4){
      let s=0;
      for (let c=0;c<3;c++) s += 1 - (D1[i+c]-D2[i+c])/(P[i+c]-KK[i+c]);
      alfa[k] = s<=0 ? 0 : (s>=3 ? 1 : s/3);
    }
    z.sorteggiSpesi += (t.sorteggi - s0);
    z.campioni++;

    const v = t.view; if (!v || !v.S2) continue;
    const S2=v.S2, Ax=v.Ax, Ay=v.Ay, H=RIG_H*P_DIS*S2, w=16*S2;
    /* le sagome del fotogramma, in pixel CSS */
    const corpi = [];
    for (const p of G.players) {
      if (p.out>0) continue;
      const cx=p.x*S2+Ax, py=(p.y+RIG_PIEDI)*S2+Ay;
      corpi.push({x0:cx-w, y0:py-H, x1:cx+w, y1:py});
    }

    /* ---------------- i dischi ---------------- */
    for (const d of tutti) {
      z.dischiCamp++;
      const cx=d.x*K, cy=d.y*K;
      /* LA PASTIGLIA si misura su un cerchio dedotto dal RAGGIO del
         disco (r-6), non dal buco dichiarato: il buco vero comincia a
         r-3,9 e rInt lo dichiara a r-4, quindi r-6 ci sta dentro con
         margine e non dipende da cosa il gioco dichiara. La MEDIANA e
         non la media, perche' dentro il buco ci sono anche le lettere di
         gesso, che sono opache per davvero e non sono pastiglia: una
         media le conterebbe come velo. */
      const rp=Math.max(3,(d.r-6))*K;
      isto.fill(0); let np=0;
      for (let y=Math.max(Y0,Math.floor(cy-rp)); y<Math.min(Y1,Math.ceil(cy+rp)); y++){
        const dy=y+0.5-cy, off=(y-Y0)*RW-X0;
        for (let x=Math.max(X0,Math.floor(cx-rp)); x<Math.min(X1,Math.ceil(cx+rp)); x++){
          const dx=x+0.5-cx; if(dx*dx+dy*dy>rp*rp) continue;
          isto[(alfa[off+x]*100)|0]++; np++;
        }
      }
      if (!np) continue;
      let acc=0, med=0;
      for (let i=0;i<=100;i++){ acc+=isto[i]; if(acc*2>=np){ med=i/100; break; } }
      /* LA GHIERA: la corona fra r-3 e r+1, cioe' il filo caldo e il
         metallo. E' lei il comando; la pastiglia e' solo il suo fondo. */
      const g0=(d.r-3)*K, g1=(d.r+1)*K;
      let sg=0, ng=0;
      for (let y=Math.max(Y0,Math.floor(cy-g1)); y<Math.min(Y1,Math.ceil(cy+g1)); y++){
        const dy=y+0.5-cy, off=(y-Y0)*RW-X0;
        for (let x=Math.max(X0,Math.floor(cx-g1)); x<Math.min(X1,Math.ceil(cx+g1)); x++){
          const dx=x+0.5-cx, q=dx*dx+dy*dy;
          if(q<g0*g0||q>g1*g1) continue;
          sg+=alfa[off+x]; ng++;
        }
      }
      const gh = ng ? sg/ng : 1;
      if (gh < cfg.sogliaGhiera) z.ghieraSpenta++;

      /* c'e' un corpo DENTRO il disco? La stessa distanza che il gioco
         usa: rettangolo contro disco, negativa quando penetra. */
      let dmin=1e9;
      for (const c of corpi) {
        const dx=Math.max(c.x0-d.x,0,d.x-c.x1), dy=Math.max(c.y0-d.y,0,d.y-c.y1);
        const q=Math.hypot(dx,dy)-d.r;
        if (q<dmin) dmin=q;
      }
      /* =================================================================
         LA PASTIGLIA VUOTA SI MISURA CONTRO LA SUA GHIERA, NON CONTRO
         ZERO — e la prima stesura di questo righello ci e' cascata.

         Il disco ha DUE modi di diventare trasparente, e solo uno e' la
         cura: la pastiglia che si svuota sotto un uomo (aPas, che tocca
         solo il fondo) e il comando INTERO che si scansa davanti al
         pallone o al protagonista (aBt, scartoHUD, che tocca tutto).
         Misurando la sola pastiglia contro una soglia fissa i due casi
         si confondono, e il secondo faceva accendere C3 su TUTTI E TRE i
         file — cura compresa, quattro casi su 4952 con la palla addosso
         al disco e nessun uomo sotto (SCIVOLATA a 0,14 con l'uomo a 6,6
         px FUORI). Non era la cura che sbagliava: era il righello.

         Il rapporto separa i due casi da solo, senza una soglia in piu':
         se il comando intero si scansa, pastiglia e ghiera scendono
         insieme e il rapporto resta intorno a 1,05; se si svuota la sola
         pastiglia, crolla a 0,15. Sotto una ghiera gia' quasi sparita il
         rapporto e' rumore, e quel disco-fotogramma esce dal conto di C2
         e C3 — e' roba di C4.
         ================================================================= */
      const rap = gh>cfg.ghieraViva ? med/gh : null;
      if (rap===null) z.ghieraMorta++;
      else if (rap < cfg.sogliaVuota) {
        z.vuote++;
        if (dmin >= 0) { z.vuoteSenzaCorpo++;
          if (z.esempi.length<3) z.esempi.push({passo:pas, disco:d.label, pastiglia:+med.toFixed(3),
                                                ghiera:+gh.toFixed(3), rapporto:+rap.toFixed(3), distanza:+dmin.toFixed(1)}); }
      }
      if (TAR && rap!==null) TAR.rap.push(+rap.toFixed(2));
      /* C1 — LA DICHIARAZIONE CONTRO I PIXEL. Il gioco dice 'dentro';
         la tela dice 'med'. Conta solo la bugia in eccesso: dichiarare
         piu' velo di quanto se ne dipinga e' prudenza, dichiararne meno
         e' la copia bugiarda. */
      if (d.dentro!==undefined) {
        const bug = med - d.dentro;
        z.bugiaN++; z.bugiaSomma += bug;
        if (bug > z.bugiaMax) z.bugiaMax = bug;
        if (bug > cfg.rifBugia) { z.bugiaSopra++;
          if (z.esempiBugia.length<3) z.esempiBugia.push({passo:pas, disco:d.label, dichiarato:d.dentro, misurato:+med.toFixed(3)}); }
        if (TAR) TAR.bugia.push(+bug.toFixed(3));
      }
      if (TAR) { TAR.past.push(+med.toFixed(2)); TAR.ghiera.push(+gh.toFixed(2)); }
    }

    /* ---------------- gli uomini ---------------- */
    for (const c of corpi) {
      /* LA SAGOMA IN PIXEL INTERI DI TELA, e il denominatore e' LEI. Con
         i bordi in virgola il conto dei pixel sommati puo' superare
         l'area del rettangolo (floor e ceil allargano), e una copertura
         del 108% e' un righello che si smentisce da solo: misurato,
         succedeva. Qui i confini si arrotondano UNA volta e servono sia
         al numeratore sia al denominatore. */
      const ix0=Math.max(0,Math.round(c.x0*K)), iy0=Math.max(0,Math.round(c.y0*K));
      const ix1=Math.min(cv.width,Math.round(c.x1*K)), iy1=Math.min(cv.height,Math.round(c.y1*K));
      const areaPx=Math.max(0,ix1-ix0)*Math.max(0,iy1-iy0);
      if (areaPx<=0) continue;
      z.uomini++;
      const bx0=Math.max(X0,ix0), by0=Math.max(Y0,iy0), bx1=Math.min(X1,ix1), by1=Math.min(Y1,iy1);
      let som=0;
      if (bx1>bx0 && by1>by0) {
        for (let y=by0;y<by1;y++){ const off=(y-Y0)*RW-X0;
          for (let x=bx0;x<bx1;x++) som+=alfa[off+x]; }
      }
      const cop=som/areaPx;
      z.coperturaSomma += cop;
      if (cop>z.coperturaMax) z.coperturaMax=cop;
      if (cop >= cfg.sogliaUomo) z.sopraUomo++;
      if (cop >= cfg.sogliaMeta) z.sopraMeta++;
      if (TAR && cop>0.001) TAR.uomo.push(+cop.toFixed(3));
    }
  }
  if (TAR) z.taratura = TAR;
  return JSON.stringify(z);
}`;

/* le etichette si misurano col carattere VERO, e con la stessa regola
   del gioco: gradino 15, se non ci sta gradino 11, e se non ci sta
   ancora si stringe — mai sotto 0,62 */
const ETICHETTE = `async (dischi) => {
  await document.fonts.ready;
  const c = document.createElement('canvas').getContext('2d');
  return JSON.stringify(dischi.map(d => {
    const avail = d.r*2-14;
    c.font = '800 15px ' + FONT_C;
    let fs = 15, w = c.measureText(d.label).width;
    if (w > avail) { fs = 11; c.font = '800 11px ' + FONT_C; w = c.measureText(d.label).width; }
    const kx = Math.max(0.62, Math.min(1, avail/Math.max(1,w)));
    return { label:d.label, r:d.r, avail:+avail.toFixed(1), fs,
             largo:+(w*kx).toFixed(1), kx:+kx.toFixed(3), sborda:+(w*kx-avail).toFixed(2) };
  }));
}`;

/* l'avviso dell'inferiorita': si provoca sul serio, con due cartellini */
const AVVISO = `async (cfg) => {
  const t = window.__test, B = window.__banco;
  try { t.dismissSplash && t.dismissSplash(); } catch(e){}
  B.passo(4);
  /* LA QUIETE PRIMA DEL SEME: vedi il gemello in PARTITA. */
  t.semina(1);
  { let fermi=0;
    for (let giri=0; giri<20 && fermi<2; giri++){
      const a=t.sorteggi;
      await new Promise(r=>setTimeout(r,300));
      fermi = (t.sorteggi===a) ? fermi+1 : 0;
    } }
  t.semina(cfg.seme); t.setCpuVsCpu(true); t.posaHUD(true);
  t.startMatch(1, 1, { size: cfg.taglia });
  for (let i=0;i<900;i++){ B.passo(1); if (t.state==='play') break; }
  const out = {};
  for (const squadra of [0,1]) {
    t.cartellino(squadra); t.cartellino(squadra);
    for (let i=0;i<8;i++) B.passo(1);
    const a = (typeof t.avvisi !== 'undefined') ? t.avvisi : null;
    out['squadra'+squadra] = a;
    if (a === null) break;
  }
  out.font = (typeof FONT_C!=='undefined') ? FONT_C : '';
  return JSON.stringify(out);
}`;

const pct = (a, b) => 100 * a / (b || 1);
function quantili(v) {
  if (!v.length) return null;
  const s = v.slice().sort((a, b) => a - b);
  const q = p => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
  return { n: s.length, min: q(0), p10: q(0.10), p50: q(0.50), p90: q(0.90), p99: q(0.99), max: q(1) };
}

(async () => {
  const srv = await servi();
  let br;
  try { br = await chromium.launch(); }
  catch (e) { console.error('BANCO ESPLOSO: Chromium non parte — ' + e.message); srv.chiudi(); process.exit(2); }
  const ctx = await br.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  await ctx.addInitScript(BANCO);

  const CHIAVI = ['frames', 'campioni', 'dischiFoto', 'senzaDichiarazione', 'dischiCamp', 'vuote',
    'vuoteSenzaCorpo', 'ghieraSpenta', 'ghieraMorta', 'bugiaSopra', 'bugiaSomma', 'bugiaN', 'uomini', 'sopraUomo',
    'sopraMeta', 'coperturaSomma', 'sorteggiSpesi', 'provaIdem', 'provaRimessi', 'prove'];
  const tot = {}; for (const k of CHIAVI) tot[k] = 0;
  tot.bugiaMax = 0; tot.coperturaMax = 0; tot.esempi = []; tot.esempiBugia = [];
  const TAR = TARATURA ? { past: [], ghiera: [], rap: [], bugia: [], uomo: [] } : null;

  for (const seme of SEMI) {
    const pag = await ctx.newPage();
    const err = [];
    pag.on('pageerror', e => err.push(e.message));
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load', timeout: 60000 });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    const cfg = JSON.stringify({
      seme, taglia: TAGLIA, passi: Math.round(SEC * 60), VW, VH, ogni: OGNI, prova: 40,
      sogliaVuota: SOGLIA_VUOTA, sogliaGhiera: SOGLIA_GHIERA, sogliaUomo: SOGLIA_UOMO,
      sogliaMeta: SOGLIA_META, rifBugia: RIF_BUGIA, ghieraViva: GHIERA_VIVA, taratura: !!TARATURA,
    });
    const o = JSON.parse(await pag.evaluate(`(${PARTITA})(${cfg})`));
    if (o.errore) { console.error('PROVA NULLA: ' + o.errore); await br.close(); srv.chiudi(); process.exit(3); }
    if (err.length) console.log('  (errori di pagina: ' + err.length + ', il primo: ' + err[0].slice(0, 90) + ')');
    for (const k of CHIAVI) tot[k] += o[k];
    tot.bugiaMax = Math.max(tot.bugiaMax, o.bugiaMax);
    tot.coperturaMax = Math.max(tot.coperturaMax, o.coperturaMax);
    tot.esempi = tot.esempi.concat(o.esempi).slice(0, 3);
    tot.esempiBugia = tot.esempiBugia.concat(o.esempiBugia).slice(0, 3);
    if (TAR && o.taratura) for (const k in TAR) TAR[k] = TAR[k].concat(o.taratura[k]);
    await pag.close();
  }
  /* etichette e avviso: una pagina sola, non dipendono dal seme */
  const pag = await ctx.newPage();
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?t=${Date.now()}`, { waitUntil: 'load', timeout: 60000 });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  const ETI = JSON.parse(await pag.evaluate(`(${ETICHETTE})(${JSON.stringify(DISCHI)})`));
  const AVV = JSON.parse(await pag.evaluate(`(${AVVISO})(${JSON.stringify({ seme: SEMI[0], taglia: TAGLIA })})`));
  await pag.close();
  await br.close(); srv.chiudi();

  /* ------------------------- LA VALIDITA' DELLA CORSA -------------------
     Prima del verdetto, le tre condizioni senza le quali il verdetto non
     vale niente. Un cancello che misura male e dice verde e' peggio di
     un cancello che tace. */
  const nulli = [];
  if (!tot.campioni) nulli.push('nessun campione a pixel: il righello non ha mai girato');
  if (tot.sorteggiSpesi !== 0) nulli.push('i disegni in piu\' hanno consumato ' + tot.sorteggiSpesi + ' sorteggi: la partita misurata non e\' piu\' quella di prima');
  if (tot.provaIdem !== 0) nulli.push('due disegni identici differiscono su ' + tot.provaIdem + ' pixel (' + tot.prove + ' prove): il fotogramma non e\' fermo');
  if (tot.provaRimessi !== 0) nulli.push('soloDischi() ridipinge ' + tot.provaRimessi + ' pixel diversi dal fotogramma vero (' + tot.prove + ' prove)');
  if (nulli.length) {
    console.log('\n=== I DISCHI DEI COMANDI — ' + path.basename(GIOCO) + ' ===');
    console.log('\nPROVA NULLA — il righello non e\' in condizione di misurare:');
    for (const n of nulli) console.log('  · ' + n);
    console.log('');
    process.exit(3);
  }

  if (TARATURA) {
    console.log('\n=== TARATURA — ' + path.basename(GIOCO) + ' · ' + TAGLIA + 'v' + TAGLIA + ' · ' + VW + 'x' + VH + ' ===');
    console.log('semi ' + SEMI.join(',') + ' · ' + SEC + ' s · un campione ogni ' + OGNI + ' fotogrammi');
    console.log('  fotogrammi ' + tot.frames + ' · campioni ' + tot.campioni + ' · disco-fotogramma campionati ' + tot.dischiCamp);
    console.log('  zero del righello: idem ' + tot.provaIdem + ' px · rimessi ' + tot.provaRimessi + ' px · sorteggi spesi ' + tot.sorteggiSpesi);
    for (const k of ['past', 'ghiera', 'rap', 'bugia', 'uomo']) {
      const q = quantili(TAR[k]);
      console.log('  ' + k.padEnd(7) + (q ? JSON.stringify(q) : 'vuoto'));
    }
    const u = TAR.uomo;
    for (const s of [0.05, 0.10, 0.15, 0.25, 0.40, 0.50, 0.75]) {
      console.log('    uomini con copertura >= ' + s.toFixed(2) + ': ' + (u.filter(x => x >= s).length / (tot.campioni || 1)).toFixed(3) + ' per campione');
    }
    const p = TAR.rap;
    for (const s of [0.15, 0.20, 0.25, 0.30, 0.40, 0.60]) {
      console.log('    rapporto pastiglia/ghiera sotto ' + s.toFixed(2) + ': ' + pct(p.filter(x => x < s).length, p.length).toFixed(1) + '%');
    }
    console.log('  uomini in quadro per campione ' + (tot.uomini / (tot.campioni || 1)).toFixed(2)
      + ' · copertura media ' + (tot.coperturaSomma / (tot.uomini || 1)).toFixed(4)
      + ' · peggiore ' + tot.coperturaMax.toFixed(3));
    console.log('  bugia (misurato - dichiarato): media ' + (tot.bugiaSomma / (tot.bugiaN || 1)).toFixed(3)
      + ' · massima ' + tot.bugiaMax.toFixed(3) + '\n');
    process.exit(0);
  }

  /* ------------------------------- il verdetto ------------------------ */
  const camp = tot.campioni || 1;
  const dc = tot.dischiCamp || 1;
  const pctVuote = pct(tot.vuote, dc);
  const pctGhiera = pct(tot.ghieraSpenta, dc);
  const coperti = tot.sopraUomo / camp;

  const esiti = [];
  const dice = (id, titolo, ok, riga) => esiti.push({ id, titolo, ok, riga });

  const c1ok = tot.senzaDichiarazione === 0 && tot.bugiaSopra === 0;
  dice('C1', 'il disco dichiara la pastiglia, e la dichiarazione regge i pixel',
    c1ok,
    tot.senzaDichiarazione !== 0
      ? tot.senzaDichiarazione + ' disco-fotogramma su ' + tot.dischiFoto + ' senza dichiarazione (dentro, rInt o lab)'
      : tot.bugiaSopra !== 0
        ? tot.bugiaSopra + ' disco-fotogramma su ' + tot.dischiCamp + ' dipingono piu\' velo di quanto ne dichiarino (oltre ' + RIF_BUGIA.toFixed(2)
          + '); la peggiore ' + tot.bugiaMax.toFixed(3) + ' — es. ' + JSON.stringify(tot.esempiBugia)
        : 'tutti i ' + tot.dischiFoto + ' disco-fotogramma dichiarano; su ' + tot.dischiCamp
          + ' misurati a pixel lo scarto dichiarato/dipinto e\' ' + (tot.bugiaSomma / (tot.bugiaN || 1)).toFixed(3)
          + ' in media e ' + tot.bugiaMax.toFixed(3) + ' al peggio — tetto ' + RIF_BUGIA.toFixed(2));

  dice('C2', 'la pastiglia si svuota davvero sotto un uomo — misurata, non dichiarata',
    pctVuote >= RIF_VUOTE_MIN,
    'pastiglie MISURATE sotto il ' + SOGLIA_VUOTA.toFixed(2) + ' della loro ghiera: ' + pctVuote.toFixed(1)
    + '% dei ' + tot.dischiCamp + ' disco-fotogramma campionati (serve almeno il ' + RIF_VUOTE_MIN.toFixed(0) + '%'
    + (tot.ghieraMorta ? '; ' + tot.ghieraMorta + ' esclusi con la ghiera gia\' via' : '') + ')');

  dice('C3', 'e non si svuota sul prato deserto',
    tot.vuoteSenzaCorpo === 0,
    tot.vuoteSenzaCorpo !== 0
      ? tot.vuoteSenzaCorpo + ' pastiglie vuote con nessun corpo dentro — es. ' + JSON.stringify(tot.esempi)
      : tot.vuote === 0
        /* IL VERDE A VUOTO SI DICHIARA. Su un gioco che non si svuota mai
           C3 non ha niente da giudicare, e un « ok » senza questa riga
           somiglierebbe a un'assoluzione: e' C2 che parla, ed e' rosso. */
        ? 'nessuna pastiglia si e\' mai svuotata: C3 non ha niente da giudicare — la domanda la fa C2'
        : 'nessuna delle ' + tot.vuote + ' pastiglie misurate vuote lo era senza un corpo dentro il disco');

  dice('C4', 'il comando non sparisce mai per colpa di un corpo',
    pctGhiera <= RIF_GHIERA_SPENTA,
    'ghiere con alfa MISURATA sotto ' + SOGLIA_GHIERA.toFixed(2) + ': ' + pctGhiera.toFixed(1)
    + '% — tetto ' + RIF_GHIERA_SPENTA.toFixed(1) + '%');

  const meta = tot.sopraMeta / camp;
  dice('C5', 'gli uomini ridipinti dai comandi stanno sotto i due riferimenti',
    meta <= RIF_META && coperti <= RIF_COPERTI,
    'uomini NASCOSTI (oltre il ' + (SOGLIA_META * 100).toFixed(0) + '% della sagoma ridipinta): '
    + meta.toFixed(3) + ' per campione — tetto ' + RIF_META.toFixed(2)
    + ' · uomini INTACCATI (oltre il ' + (SOGLIA_UOMO * 100).toFixed(0) + '%): '
    + coperti.toFixed(3) + ' — tetto ' + RIF_COPERTI.toFixed(2)
    + '  (' + tot.campioni + ' campioni su ' + tot.frames + ' fotogrammi, ' + (tot.uomini / camp).toFixed(2)
    + ' uomini in quadro, copertura media ' + (tot.coperturaSomma / (tot.uomini || 1)).toFixed(4)
    + ', peggiore ' + tot.coperturaMax.toFixed(3) + ')');

  /* LA SOGLIA DELLO STRINGIMENTO E' 0,85, ed e' misurata. Il gioco
     stringe UNA sola etichetta — SCIVOLATA, a 0,899 sul disco da 26 —
     e tutte le altre stanno a 1,000. Sotto 0,85 una parola non sta piu'
     nel suo disco: ci sta la sua deformazione. La soglia sta in mezzo
     fra il peggio di oggi e il limite dichiarato dal gioco (0,62). */
  const STRETTA = 0.85;
  const sborda = ETI.filter(e => e.sborda > 0.5 || e.kx < STRETTA);
  const stretta = ETI.reduce((a, b) => a.kx < b.kx ? a : b);
  dice('C6', 'nessuna etichetta sborda o si deforma nel suo disco',
    sborda.length === 0,
    sborda.length === 0
      ? ETI.length + ' etichette misurate col carattere vero; la piu\' stretta e\' ' + stretta.label
        + ' (' + stretta.largo + ' px in ' + stretta.avail + ', stringimento ' + stretta.kx + ')'
      : sborda.map(e => e.label + ' ' + e.largo + ' px in ' + e.avail + ' (stringimento ' + e.kx + ')').join(', '));

  const simili = [];
  for (let i = 0; i < DISCHI.length; i++) for (let j = i + 1; j < DISCHI.length; j++) {
    const a = DISCHI[i], b = DISCHI[j];
    if (a.slot === b.slot) continue;             // stesso disco: mai insieme
    const pre = (x, y) => x.label.startsWith(y.label) || y.label.startsWith(x.label);
    const quattro = a.label.slice(0, 4) === b.label.slice(0, 4);
    if (pre(a, b) || quattro) simili.push(a.label + ' / ' + b.label);
  }
  dice('C7', 'due etichette compresenti non si somigliano',
    simili.length === 0,
    simili.length === 0
      ? 'nessuna coppia condivide le prime quattro lettere, ne\' e\' prefisso dell\'altra'
      : 'coppie confondibili: ' + simili.join(' · '));

  /* C8 — l'avviso */
  let c8ok = true, c8riga = [];
  const righe = [].concat(AVV.squadra0 || [], AVV.squadra1 || []);
  if (!AVV.squadra0) { c8ok = false; c8riga.push('__test.avvisi non esiste: l\'avviso non e\' dichiarato e nessuno puo\' misurarlo'); }
  else if (!righe.length) { c8ok = false; c8riga.push('due cartellini non hanno prodotto nessun avviso: la prova e\' nulla'); }
  else {
    for (const r of righe) {
      const numeri = (r.testo.match(/\d+/g) || []);
      const secondi = /\d+"/.test(r.testo);
      const larghezzaOk = r.largo + 16 <= (r.x1 - r.x0) + 0.5;
      if (numeri.length !== 1 || !secondi) { c8ok = false; c8riga.push('«' + r.testo + '» ha ' + numeri.length + ' numeri' + (secondi ? '' : ' e nessuno porta i secondi')); }
      else if (!larghezzaOk) { c8ok = false; c8riga.push('«' + r.testo + '» larga ' + r.largo + ' in un riquadro da ' + (r.x1 - r.x0)); }
      else c8riga.push('«' + r.testo + '» — un numero solo, coi secondi, ' + r.largo + ' px in ' + (r.x1 - r.x0));
    }
  }
  dice('C8', 'l\'avviso dell\'inferiorita\' dice una cosa sola', c8ok, c8riga.join(' · '));

  console.log('\n=== I DISCHI DEI COMANDI — ' + TAGLIA + ' contro ' + TAGLIA + ', ' + VW + 'x' + VH + ' ===');
  console.log('gioco ' + path.basename(GIOCO) + (GUASTO ? '   GUASTO: ' + GUASTO + ' (' + GUASTI[GUASTO].perche + ')' : ''));
  console.log('semi ' + SEMI.join(',') + ' · ' + SEC + ' s di gioco ciascuno a passi fissi');
  console.log(TOPPATA);
  console.log('righello a pixel: ' + tot.campioni + ' campioni (uno ogni ' + OGNI + ' fotogrammi) · '
    + 'zero del righello ' + tot.provaIdem + ' px su ' + tot.prove + ' prove · '
    + 'dischi rimessi ' + tot.provaRimessi + ' px · sorteggi spesi ' + tot.sorteggiSpesi + '\n');
  for (const e of esiti) {
    console.log('  ' + (e.ok ? ' ok ' : 'ROSSO') + '  ' + e.id + '  ' + e.titolo);
    console.log('           ' + e.riga);
  }
  const rossi = esiti.filter(e => !e.ok);
  if (!rossi.length) { console.log('\nVERDE: otto controlli su otto.\n'); process.exit(0); }
  console.log('\nROSSO: ' + rossi.length + ' controlli su ' + esiti.length + ' — ' + rossi.map(e => e.id).join(', ') + '\n');
  process.exit(1);
})();
