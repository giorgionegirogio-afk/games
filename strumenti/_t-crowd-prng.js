/* =====================================================================
   _t-crowd-prng.js -- LA COSMETICA FUORI DAL PRNG DI GIOCO, PRNG DEDICATO
   (voce #129, opzione 2, cura della #98). Introduce DECO (uno xorshift32
   con stato TUTTO SUO, vicino a SEME/dado :8593-8608) e lo fa usare a
   `paintField` (:27502, la texture del campo) e a `rebuildCrowd` (:29914,
   la folla): entrambe risoseminano DECO con una costante fissa al
   proprio ingresso e non chiamano piu' dado()/rnd() (il PRNG di gioco).

   RETTIFICA DI QUESTO STESSO ATTREZZO (20 settembre 2026). La prima
   stesura (compito 1, primo giro) applicava l'OPZIONE B: salva/ripristina
   SEME.s/SEME.n attorno alla sola rebuildCrowd. MISURATO che non basta,
   per due ragioni indipendenti (vedi la RETTIFICA in testa a
   docs/superpowers/specs/2026-09-20-rebuildcrowd-prng-design.md):
     1. rebuildCrowd e' solo l'8% del consumo (~8920 sorteggi su ~114000
        a taglia 11): il grosso (~92%) e' paintField, chiamata da
        buildFieldTex (:29495) dentro setTaglia (:29997), PRIMA di
        rebuildCrowd (:29998) -- un salva/ripristina sulla sola
        rebuildCrowd lasciava fuori il consumatore vero.
     2. _q-determinismo.js prove A/B/C seminano Math.random GLOBALE
        (window.__caso, addInitScript) e NON SEME: dado() a SEME.on=false
        fa "return Math.random()" senza mai toccare SEME.s/SEME.n, quindi
        NESSUN salva/ripristina di SEME puo' curare quel canale.
   Il committente ha deciso l'OPZIONE 2 (PRNG dedicato): cura ENTRAMBI i
   canali insieme, perche' la cosmetica smette di leggere/scrivere sia
   SEME sia Math.random -- non c'e' piu' niente da salvare o ripristinare.

   QUATTRO ANCORE:
     1. Definizione di DECO/dadoDeco/rndDeco, vicino a SEME/dado/rnd.
     2. Reseed fisso all'ingresso di paintField (:27502).
     3. CONVERSIONE A BLOCCO di paintField (:27502-29494, ~110KB, 25
        dado()+15 rnd()): non e' un cerca/metti verbatim come le altre
        tre -- la funzione e' troppo grande per trascriverla due volte a
        mano senza rischiare un errore di trascrizione. Si delimita il
        corpo fra due ancore ESATTE ("function paintField(...){" e
        "function buildFieldTex(){", verificate uniche una sola volta nel
        file), si sostituisce "dado(" -> "dadoDeco(" e "rnd(" -> "rndDeco("
        SOLO dentro quel ritaglio (split/join, un passaggio solo, non
        ricorsivo: "dadoDeco(" non contiene "dado(" ne' "rndDeco("
        contiene "rnd(", quindi nessuna doppia sostituzione), e si
        verifica CHE OGNI dado(/rnd( originale sia stato convertito UNO A
        UNO (conteggio prima/dopo) e che zero bare dado(/rnd( restino nel
        ritaglio. Include la conversione di buildGrain (:29594, chiamata
        DA paintField per la grana cotta una volta sola: stessa ancora
        piccola verbatim delle altre).
     4. rebuildCrowd (:29914-29964) riscritta per intero: reseed DECO
        fisso, dado()->dadoDeco()/rnd()->rndDeco(), la dado() buttata
        (:29949) ELIMINATA (non serve piu' consumare-e-buttare: DECO non
        e' condiviso con nessuno), commento storico riscritto a edizioni.

   COSA NON TOCCA. buildVignette (:29642-29840) e buildCrowdAtlas
   (:29841-29913): verificato (grep) che NON contengono dado()/rnd() --
   nessuna conversione necessaria. campoVivoDisegna (:29542-29579, lo zoom
   del gol) ha gia' un proprio trucco (swap temporaneo di Math.random,
   :29571-29575) per non consumare il caso della partita quando chiama
   paintField: con paintField spostata su DECO quel trucco diventa
   ridondante ma innocuo (paintField non legge piu' Math.random in nessun
   caso) -- FUORI PERIMETRO di questo attrezzo, non e' una dado() di
   caricamento non convertita, e' codice morto che nessun banco misura
   come difetto. Nessuna dado() di GIOCO (fisica/IA/rosa/avversario/
   kickTeam, tutte dentro startMatch DOPO setTaglia o dentro simulate) e'
   toccata: la mappa (grep sull'intero file) mostra SEME.on/SEME.n/SEME.s
   usati solo in dado() (:8598-8607) e nei siti di semina (:42925,43112,
   43815) -- rebuildCrowd/paintField/buildGrain sono le uniche letrici di
   dado()/rnd() fuori da quei siti che girano al caricamento.

   MODELLO: strumenti/_t-crepe-kickoff.js per lo stile delle ancore
   verbatim; l'ancora 3 e' una variante dichiarata per la taglia del
   ritaglio (vedi sopra).

   uso:  node strumenti/_t-crowd-prng.js --in fuori/base129.html --out fuori/curato129.html
         node strumenti/_t-crowd-prng.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/curato-crowd-prng.html'));

/* ------------------------------------------------------------- ANCORA 1 */
const A1_CERCA = `const rnd=(a,b)=>a+dado()*(b-a);

/* =====================================================================
   ICONE SVG inline in palette (fluo/gesso/oro su verde).`;
const A1_METTI = `const rnd=(a,b)=>a+dado()*(b-a);

/* =====================================================================
   DECO -- IL PRNG DELLA COSMETICA (voce #129, opzione 2, cura della #98).
   La diagnosi (misurata al compito 1 di #129, prima stesura): rebuildCrowd
   (la folla) e soprattutto paintField (la texture del campo: grana del
   piazzale, gradinate/pubblico, erba, insegne -- circa il 92% del
   consumo, non l'8% di rebuildCrowd) tiravano dado()/rnd(), cioe' IL PRNG
   DI GIOCO, in numero proporzionale al perimetro/densita' del campo.
   setTaglia chiama questa cottura SOLO quando la taglia CAMBIA (guardia
   if(n===TAGLIA) return): la PRIMA partita a una taglia paga quel
   consumo, le successive no, e col medesimo seme la prima diverge dalle
   successive (voce #98, cross-taglia).
   C'ERANO ANCHE DUE CANALI DIVERSI dello stesso difetto: i banchi che
   seminano SEME (SEME.accendi, __test.semina) e i banchi che seminano
   Math.random GLOBALE (window.__caso in _q-determinismo.js prove A/B/C).
   Un salva/ripristina sul solo SEME (la prima cura tentata, misurata e
   scartata) e' un no-op quando SEME.on e' false: dado() allora fa
   "return Math.random()" e non tocca mai SEME.s/SEME.n -- quindi non
   cura il canale Math.random-globale.
   LA CURA: la cosmetica (folla e texture) NON usa piu' dado()/rnd() --
   usa DECO, un PRNG SEPARATO con stato proprio (DECO.s), che non legge
   ne' scrive ne' SEME ne' Math.random. Ogni funzione cosmetica lo
   RISEMINA con una costante fissa al proprio ingresso (vedi paintField e
   rebuildCrowd): la texture/la folla diventano funzione deterministica
   dei soli parametri (taglia, densita', tema), indipendenti da qualsiasi
   stato globale -- e il PRNG di gioco, su ENTRAMBI i canali, non vede mai
   una sola estrazione della cosmetica.
   COSTO ACCETTATO E VOLUTO: la texture del campo e il layout della folla
   CAMBIANO aspetto rispetto a prima (partono da un seme diverso): e' una
   regressione cosmetica dichiarata, non un difetto (vedi istantanea). */
const DECO={s:1};
function dadoDeco(){
  let s=DECO.s;
  s ^= s << 13; s >>>= 0;
  s ^= s >>> 17;
  s ^= s <<  5; s >>>= 0;
  DECO.s = s;
  return s / 4294967296;
}
const rndDeco=(a,b)=>a+dadoDeco()*(b-a);

/* =====================================================================
   ICONE SVG inline in palette (fluo/gesso/oro su verde).`;

/* ------------------------------------------------------------- ANCORA 2 */
const A2_CERCA = `function paintField(c, TH, pX, pY, q, vivo){
  /* vivo=true solo quando si cuoce fieldTex (il campo che la camera
     inquadra): il testo delle insegne si rimanda a drawInsegneTesto.
     Le anteprime (CAMPI) restano cotte per intero. */
  pX=pX||PAD; pY=pY||PAD;`;
const A2_METTI = `function paintField(c, TH, pX, pY, q, vivo){
  /* RESEED FISSO (voce #129, opzione 2): paintField non tocca piu' il
     PRNG di gioco. Da qui in poi ogni chiamata a dado e a rnd, in questa
     funzione, e' dadoDeco e rndDeco (PRNG dedicato, vedi DECO vicino a
     SEME): la texture cotta e' funzione deterministica dei soli
     parametri (TH, q, dimensioni campo), sempre la stessa a parita' di
     parametri, mai influenzata da quante estrazioni ha gia' fatto la
     partita e mai capace di spostarle. */
  DECO.s=0x9E3779B9;
  /* vivo=true solo quando si cuoce fieldTex (il campo che la camera
     inquadra): il testo delle insegne si rimanda a drawInsegneTesto.
     Le anteprime (CAMPI) restano cotte per intero. */
  pX=pX||PAD; pY=pY||PAD;`;

/* ------------------------------------------------------------- ANCORA 3 */
const A3_CERCA = `const v=(dado()*255)|0;`;
const A3_METTI = `const v=(dadoDeco()*255)|0;`;

/* ------------------------------------------------------------- ANCORA 4 */
const A4_CERCA = `function rebuildCrowd(){
  CROWD.length=0;
  const DK=34;
  /* quattro anelli sui due gradoni piu' vicini al campo */
  for(const d0 of [DK+9, DK+28, DK+44, DK+62]){
    const x0=-d0, y0=-d0, x1=FW+d0, y1=FH+d0;
    const rw=x1-x0, rh=y1-y0, per=2*(rw+rh);
    const vicino = d0 < DK+34;               // prima fila: figurine piu' grandi
    for(let t=dado()*20; t<per; t+=rnd(17,27)){
      let x,y;
      if(t<rw){ x=x0+t; y=y0; }
      else if(t<rw+rh){ x=x1; y=y0+(t-rw); }
      else if(t<2*rw+rh){ x=x1-(t-rw-rh); y=y1; }
      else { x=x0; y=y1-(t-2*rw-rh); }
      /* la tinta la decide il SETTORE, non il posto: tre sciarpe per
         spicchio di tribuna invece di un colore a caso per persona */
      const set=((t/per*6)|0)%6;
      const ci=(set + ((dado()*3)|0)) % CROWD_TINTE.length;
      /* h: hash intero del posto lungo il perimetro. Due bit bastano —
         uno decide la sciarpa, l'altro chi ha il telefono in mano. */
      let h=(t*97)|0; h^=h<<13; h>>>=0; h^=h>>>17; h^=h<<5; h>>>=0;
      /* i settori pari tifano A, i dispari B; un terzo scarso della gente
         non porta niente — una tribuna tutta in sciarpa e' uno stadio, non
         un campetto di quartiere */
      const sc = (h%100)<36 ? 0 : (set%2 ? 2 : 1);
      const fu=(t/per)*12.566;             // due creste d'onda su tutto il giro
      const px2=x+rnd(-4,4), py2=y+rnd(-3,3);
      const w2=vicino?rnd(9.4,11.0):rnd(7.6,9.0);
      /* L'ESTRAZIONE SI FA E SI BUTTA. La fase del dondolio adesso la
         decide il POSTO (un hash della posizione lungo il perimetro) e non
         il caso: il respiro della tribuna e' funzione di posizione e tempo,
         come chiedeva il brief. Ma il sorteggio va CONSUMATO lo stesso, se
         no la sequenza di Math.random slitta e cambiano rosa, avversario e
         divise di ogni partita gia' fotografata: un confronto prima/dopo
         mostrerebbe un'altra partita invece della modifica. */
      dado();
      CROWD.push({ x:px2, y:py2, i:ci, sc,
                   /* IL TELEFONO IN MANO sale dal 14% al 26%: e' il
                      serbatoio da cui escono i flash, e con un tifoso su
                      sette un fermo-immagine ne pescava zero.
                      IN PIEDI (st) e SCATENATO (ex): uno su otto ciascuno,
                      decisi da altri due bit dello stesso hash — nessuna
                      estrazione in piu', e nessun conto a fotogramma: a
                      seicento sagome in quadro una divisione per persona
                      per fotogramma si misura. */
                   cu:Math.cos(fu), su:Math.sin(fu), f: ((h>>>7)%100)<26,
                   st: ((h>>>19)%8)===5, ex: ((h>>>23)%8)===3,
                   w:w2, ph:((h>>>13)%628)/100 });
    }
  }
}
rebuildCrowd();`;
const A4_METTI = `function rebuildCrowd(){
  CROWD.length=0;
  /* RESEED FISSO (voce #129, opzione 2): la folla non tocca piu' il PRNG
     di gioco. Ogni dado()/rnd() qui sotto e' dadoDeco()/rndDeco() (PRNG
     dedicato, vedi DECO vicino a SEME): il layout della tribuna e'
     funzione deterministica dei soli parametri del campo (perimetro),
     sempre lo stesso a parita' di taglia, mai capace di spostare le
     estrazioni della partita ne' di esserne spostato. */
  DECO.s=0x85EBCA6B;
  const DK=34;
  /* quattro anelli sui due gradoni piu' vicini al campo */
  for(const d0 of [DK+9, DK+28, DK+44, DK+62]){
    const x0=-d0, y0=-d0, x1=FW+d0, y1=FH+d0;
    const rw=x1-x0, rh=y1-y0, per=2*(rw+rh);
    const vicino = d0 < DK+34;               // prima fila: figurine piu' grandi
    for(let t=dadoDeco()*20; t<per; t+=rndDeco(17,27)){
      let x,y;
      if(t<rw){ x=x0+t; y=y0; }
      else if(t<rw+rh){ x=x1; y=y0+(t-rw); }
      else if(t<2*rw+rh){ x=x1-(t-rw-rh); y=y1; }
      else { x=x0; y=y1-(t-2*rw-rh); }
      /* la tinta la decide il SETTORE, non il posto: tre sciarpe per
         spicchio di tribuna invece di un colore a caso per persona */
      const set=((t/per*6)|0)%6;
      const ci=(set + ((dadoDeco()*3)|0)) % CROWD_TINTE.length;
      /* h: hash intero del posto lungo il perimetro. Due bit bastano —
         uno decide la sciarpa, l'altro chi ha il telefono in mano. */
      let h=(t*97)|0; h^=h<<13; h>>>=0; h^=h>>>17; h^=h<<5; h>>>=0;
      /* i settori pari tifano A, i dispari B; un terzo scarso della gente
         non porta niente — una tribuna tutta in sciarpa e' uno stadio, non
         un campetto di quartiere */
      const sc = (h%100)<36 ? 0 : (set%2 ? 2 : 1);
      const fu=(t/per)*12.566;             // due creste d'onda su tutto il giro
      const px2=x+rndDeco(-4,4), py2=y+rndDeco(-3,3);
      const w2=vicino?rndDeco(9.4,11.0):rndDeco(7.6,9.0);
      /* L'ESTRAZIONE SI FA E SI BUTTA (testo storico, voce ~#100): la
         fase del dondolio la decide il POSTO (un hash della posizione
         lungo il perimetro), non il caso -- ma il sorteggio andava
         CONSUMATO lo stesso, se no la sequenza di Math.random slittava e
         cambiavano rosa, avversario e divise di ogni partita gia'
         fotografata: un confronto prima/dopo mostrava un'altra partita
         invece della modifica.
         RETTIFICA (voce #129, opzione 2, cura della #98): quella dado()
         buttata e' ELIMINATA. Non serve piu' consumare-e-buttare per
         tenere ferma la sequenza: da qui in poi la folla vive sul PRNG
         DEDICATO (DECO, dadoDeco/rndDeco), risoseminato a costante fissa
         all'ingresso di questa funzione -- il PRNG di gioco (SEME o
         Math.random, i due canali della #98) non vede mai una sola
         estrazione della folla, quindi non c'e' piu' niente da
         proteggere consumando un numero pari di sorteggi. */
      CROWD.push({ x:px2, y:py2, i:ci, sc,
                   /* IL TELEFONO IN MANO sale dal 14% al 26%: e' il
                      serbatoio da cui escono i flash, e con un tifoso su
                      sette un fermo-immagine ne pescava zero.
                      IN PIEDI (st) e SCATENATO (ex): uno su otto ciascuno,
                      decisi da altri due bit dello stesso hash — nessuna
                      estrazione in piu', e nessun conto a fotogramma: a
                      seicento sagome in quadro una divisione per persona
                      per fotogramma si misura. */
                   cu:Math.cos(fu), su:Math.sin(fu), f: ((h>>>7)%100)<26,
                   st: ((h>>>19)%8)===5, ex: ((h>>>23)%8)===3,
                   w:w2, ph:((h>>>13)%628)/100 });
    }
  }
}
rebuildCrowd();`;

/* ---------------------------------------------------------------------
   APPLICAZIONE. Ordine: 1 (DECO), 2 (reseed paintField), 3 (blocco
   paintField, delimitato dai marcatori "function paintField(...){" e
   "function buildFieldTex(){" -- gia' esatti dopo il passo 2, perche' il
   passo 2 inserisce testo DOPO la riga di firma, non la cambia), 3b
   (buildGrain), 4 (rebuildCrowd per intero). */
let src = fs.readFileSync(inFile, 'utf8');
let out = src;
const errori = [];

function applicaVerbatim(nome, cerca, metti) {
  const n = out.split(cerca).length - 1;
  if (n !== 1) { errori.push(nome + ': ancora trovata ' + n + ' volte (ne serve 1)'); return; }
  out = out.replace(cerca, metti);
}

applicaVerbatim('1. DECO/dadoDeco/rndDeco (definizione)', A1_CERCA, A1_METTI);
applicaVerbatim('2. paintField: reseed fisso all\'ingresso', A2_CERCA, A2_METTI);

/* 3. Il ritaglio di paintField: dai due marcatori (ancora esatti anche
   dopo il passo 2, che scrive DOPO la riga di firma). */
const MARCA_INIZIO = 'function paintField(c, TH, pX, pY, q, vivo){';
const MARCA_FINE = 'function buildFieldTex(){';
if (out.split(MARCA_INIZIO).length - 1 !== 1) errori.push('3. marcatore di inizio paintField non unico');
if (out.split(MARCA_FINE).length - 1 !== 1) errori.push('3. marcatore di fine (buildFieldTex) non unico');
if (!errori.length) {
  const i0 = out.indexOf(MARCA_INIZIO);
  const i1 = out.indexOf(MARCA_FINE);
  if (i0 < 0 || i1 < 0 || i1 <= i0) {
    errori.push('3. ritaglio di paintField non trovato o vuoto');
  } else {
    const corpo = out.slice(i0, i1);
    const nDadoPrima = corpo.split('dado(').length - 1;
    const nRndPrima = corpo.split('rnd(').length - 1;
    const corpoDopo = corpo.split('dado(').join('dadoDeco(').split('rnd(').join('rndDeco(');
    const nDadoDecoDopo = corpoDopo.split('dadoDeco(').length - 1;
    const nRndDecoDopo = corpoDopo.split('rndDeco(').length - 1;
    /* dadoDeco( non contiene dado( ne' rndDeco( contiene rnd( (verificato
       carattere per carattere): dopo il cambio "dado(" e "rnd(" liberi
       devono essere ESATTAMENTE zero, senza bisogno di sottrarre nulla. */
    const nDadoResiduo = corpoDopo.split('dado(').length - 1;
    const nRndResiduo = corpoDopo.split('rnd(').length - 1;
    if (nDadoPrima === 0) errori.push('3. zero dado( trovate nel ritaglio: il perimetro e\' cambiato, riverificare');
    if (nRndPrima === 0) errori.push('3. zero rnd( trovate nel ritaglio: il perimetro e\' cambiato, riverificare');
    if (nDadoDecoDopo !== nDadoPrima) errori.push('3. conversione dado(->dadoDeco( incompleta: prima ' + nDadoPrima + ', dadoDeco( dopo ' + nDadoDecoDopo);
    if (nRndDecoDopo !== nRndPrima) errori.push('3. conversione rnd(->rndDeco( incompleta: prima ' + nRndPrima + ', rndDeco( dopo ' + nRndDecoDopo);
    if (nDadoResiduo !== 0) errori.push('3. dado( libere residue nel ritaglio: ' + nDadoResiduo);
    if (nRndResiduo !== 0) errori.push('3. rnd( libere residue nel ritaglio: ' + nRndResiduo);
    if (!errori.length) out = out.slice(0, i0) + corpoDopo + out.slice(i1);
  }
}

applicaVerbatim('3b. buildGrain: dado()->dadoDeco() nella grana', A3_CERCA, A3_METTI);
applicaVerbatim('4. rebuildCrowd per intero (reseed, conversione, dado() buttata eliminata, commento a edizioni)', A4_CERCA, A4_METTI);

if (errori.length) {
  console.error('FALLITO: ' + errori.length + ' problema/i.');
  for (const e of errori) console.error('  · ' + e);
  console.error('Niente e\' stato scritto.');
  process.exit(1);
}

/* CONTEGGIO A DELTA GLOBALE: DECO/dadoDeco/rndDeco devono comparire, il
   vecchio commento "L'ESTRAZIONE SI FA E SI BUTTA. La fase" (senza la
   rettifica) non deve piu' esistere, e la dado() buttata nemmeno. */
const conta = (t, s) => t.split(s).length - 1;
const rotti = [];
if (conta(out, 'const DECO={s:1};') !== 1) rotti.push('DECO non presente esattamente una volta');
if (conta(out, 'function dadoDeco(){') !== 1) rotti.push('dadoDeco non presente esattamente una volta');
if (conta(out, 'const rndDeco=') !== 1) rotti.push('rndDeco non presente esattamente una volta');
if (conta(out, 'DECO.s=0x9E3779B9;') !== 1) rotti.push('reseed di paintField non presente esattamente una volta');
if (conta(out, 'DECO.s=0x85EBCA6B;') !== 1) rotti.push('reseed di rebuildCrowd non presente esattamente una volta');
if (conta(out, "L'ESTRAZIONE SI FA E SI BUTTA. La fase del dondolio adesso la") !== 0) rotti.push('il commento vecchio (senza rettifica) e\' ancora presente');
if (conta(out, 'RETTIFICA (voce #129, opzione 2, cura della #98): quella dado()') !== 1) rotti.push('la rettifica del commento di rebuildCrowd non e\' presente esattamente una volta');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  4 ancore applicate (di cui 1 a blocco su paintField)');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
