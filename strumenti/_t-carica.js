/* =====================================================================
   _t-carica.js — IL TIRO SI PREPARA COL TEMPO CHE HA (26 agosto 2026).

   LA DIAGNOSI, misurata un tiro alla volta (strumenti/_diag-tiro.js, 40
   partite a 11 contro 11, semi 20260803..20260842, 297 tiri su azione):

     esito: murato dal corpo   171 tiri   57,6%
     di quei murati, la strada percorsa prima del muro:
        0-40 unita'   83   48,5%      <-- meta' muore sul posto
     al momento del calcio l'avversario piu' vicino sta a:
        0-30 unita'  174   58,6%      (il raggio del muro e' 19)

   Sembrava traffico d'area. Non lo e'. Il colpevole e' L'ATTESA:
   aiCarrier decide di tirare e apre una carica di 0,30-0,46 secondi
   (venti-ventotto fotogrammi) prima che il pallone parta. In quel tempo
   il marcatore arriva:

     pressione sul portatore   alla DECISIONE 40   al CALCIO 26 (mediane)
     corsia chiusa entro 60u   alla DECISIONE 15%  al CALCIO 30%
     DEI TIRI MURATI ENTRO 80 UNITA', IL 67% AVEVA LA CORSIA LIBERA
     OLTRE 60 UNITA' QUANDO IL GIOCATORE HA DECISO DI TIRARE.

   Due tiri murati su tre non erano murati quando si e' deciso di
   tirarli. Il gioco li ha fatti aspettare dentro il difensore.

   PERCHE' LA CARICA ESISTE, e non si tocca dove serve: e' la conquista
   visiva dichiarata a riga ~14833 — la CPU raccoglie la gamba, arretra
   il piede d'appoggio, alza il braccio opposto, e il gesto si legge su
   due o tre fotogrammi. Con 0,12-0,20 s non si vedeva niente. Quella
   ragione vale IN CAMPO APERTO, dove il tempo c'e'. Non vale con un
   avversario a venticinque unita': li' un calciatore vero tira di
   prima, e il corpo NON si prepara — e' proprio quello che si vede.

   IL CONTROLLO CHE HA SALVATO LA DIAGNOSI. La prima stesura di questa
   misura confrontava la corsia alla DECISIONE (che si puo' misurare solo
   verso il centro della porta: q e l'incrocio si scelgono dentro
   fireShot, dopo) con la corsia al CALCIO sulla direzione VERA del
   pallone. Due rette diverse, e la differenza sarebbe stata un artefatto.
   Rifatta sulla STESSA retta — verso il centro, dalla stessa posizione —
   l'accusa regge lo stesso e anzi si legge meglio:
     corsia chiusa entro 60u   alla DECISIONE 15,2%   al CALCIO 28,3%
     la corsia si CHIUDE durante la carica 29,6%, si APRE 18,5%
     dei 91 tiri murati entro 80u, la corsia era libera oltre 60u:
       alla decisione 67,0% · al calcio (stessa retta) 24,2% ·
       al calcio (retta vera) 14,3%
   Cioe': quando il pallone parte il muro c'e' gia' (86% dei casi), e
   quando si e' deciso di tirare non c'era (67%).

   LE VARIANTI (--variante A..G), tutte a parita' di numeri casuali
   pescati, cosi' il seme scorre uguale:

     A  LA CARICA CONOSCE LO SPAZIO. La durata scala con la pressione:
        0,30-0,46 s da 119 unita' in su (identica a oggi in campo
        aperto), 0,08 s a contatto. Un solo Math.random, come prima.
     B  LA CARICA CONOSCE LA CORSIA. Stesso meccanismo, ma il metro e'
        il primo corpo DENTRO IL TUBO verso la porta invece della
        pressione generica: un difensore che ti sta a fianco non ti mura,
        e non deve accorciarti il gesto.
     C  LA MIRA SCEGLIE LA CORSIA. Il tiro perfetto mirava sempre
        all'incrocio opposto alla propria posizione; adesso, se l'altro
        incrocio ha un varco piu' lungo di almeno 60 unita', mira li'.
        Non toglie e non aggiunge un solo tiro: cambia solo la retta.
     D  A e C insieme.
     E  LA VOGLIA DI TIRARE CRESCE AVVICINANDOSI (vedi l'ancoraggio 3).
     F  A ed E insieme.     G  A, C ed E insieme.

   ---------------------------------------------------------------------
   IL VERDETTO, 100 partite per riga, semi 20260803..20260902, 11 contro
   11, difficolta' Normale, durata 90 s per stare appaiati col baseline
   (node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803
   --gioco fuori/car-X.html). Tabella RIMISURATA dopo la correzione del
   sorteggio (vedi la nota qui sotto): la prima non era confrontabile.

                0-0    gol    tiri   GOL   parata  murato  precisione
                       90s                 (da tiro)        VERA
     base       0,50   0,65   11,3   0,24   0,38    4,2      7%
     A          0,49   0,60    9,3   0,31   0,49    3,8     11%
     B          0,51   0,53   10,2   0,29   0,28    4,2      9%
     D          0,49   0,59    9,7   0,25   0,48    3,9     10%
     F          0,60   0,48    9,4   0,19   0,41    2,4      9%
     G          0,61   0,45    8,9   0,16   0,36    2,2      9%

   COSA DICONO QUESTI NUMERI, in tre frasi che non si possono confondere.

   PRIMA: A e D FANNO QUELLO CHE PROMETTONO. La precisione vera passa dal
   7% al 10-11%, le PARATE da 0,38 a 0,48-0,49 — cioe' quasi un evento in
   piu' davanti alla porta a partita, che e' esattamente la cosa che
   all'11 contro 11 mancava — e i tiri murati da 4,2 a 3,8. Il tiro
   dell'11 e' un gesto migliore, e si vede.

   SECONDA, ED E' AMARA: LO 0-0 NON SI MUOVE, e nemmeno i gol totali
   (0,65 -> 0,59, dentro il rumore: 100 partite hanno sigma 5 punti su
   una frequenza del 50%). Quello che sale sono i gol NATI DA UN TIRO
   (0,24 -> 0,31); il totale no, perche' la differenza esce dall'altra
   colonna. Meno muri vuol dire meno palloni che schizzano in area, e
   quei palloni facevano gol. La legge scritta in _t-undici-fisica.js —
   "un tiro murato e' comunque un evento" — vale anche al rovescio, e
   adesso e' misurata da tutte e due le parti. Questa toppa si spedisce
   per la qualita' del gesto, non per il risultato: il risultato lo ha
   sbloccato il cronometro (_t-cronometro.js).

   TERZA, E CHIUDE UNA STRADA: F e G sono BOCCIATE — 0-0 al 60-61% contro
   il 50 del baseline. La "voglia di tirare che cresce avvicinandosi"
   sposta il baricentro dei tiri (a 800-950 unita' si passa dal 31% al
   10%) ma la squadra NON si avvicina per questo: i tiri scendono a 8,9-9,4
   e i gol seguono. E' la TERZA cura che muore nello stesso modo, dopo il
   tetto della zona a 600 e la punta a 500: a 11 contro 11 togliere tiri
   toglie gol, sempre, perche' la squadra non ha nessun altro modo di
   arrivare davanti alla porta. Chi vorra' riprovarci porti prima la
   prova che la squadra sa avvicinarsi.

   ---------------------------------------------------------------------
   LA CORREZIONE DEL 26 AGOSTO, TROVATA DA UNA REVISIONE AVVERSARIA e
   confermata da tre verificatori indipendenti. La prima stesura di
   questa toppa scriveva la durata in una const PRIMA del guardiano:

     const durCar = 0.08 + respiro*(0.22+Math.random()*0.16);
     if(p.kickCd<=0 && anticipa(p, 'tiro', durCar, sparaTiroCpu)){

   Nel gioco vergine il sorteggio e' un ARGOMENTO di anticipa, cioe' vive
   a destra di `p.kickCd<=0 &&` e il corto circuito lo salta quando il
   piede e' in pausa. Issato in una const si pesca SEMPRE — e il caso e'
   frequente: misurato, il 12,5% delle decisioni di tiro arriva con
   kickCd>0 (7 su 56, sei partite a 11). Un numero casuale in piu' non
   rompe il gioco: rompe il CONFRONTO, perche' i banchi a seme fisso
   smettono di essere appaiati — e rendeva falsa la riga di commento che
   giurava "un solo Math.random, come prima". Il sorteggio e' tornato
   dentro il corto circuito, gli `attesi` adesso ancorano la riga INTERA
   e vietano `const durCar`, e la tabella qui sopra e' stata rimisurata
   da zero: le righe della prima stesura sono state buttate, non
   corrette.

   Cancello: node strumenti/_eventi.js --taglia 11 --partite 100
   --seme 20260803 (baseline VERO: 50% di 0-0, 0,65 gol nei 90 s).
   Autopsia di contorno: node strumenti/_diag-tiro.js --taglia 11
   --partite 40.

   uso:  node strumenti/_t-carica.js --variante A --out fuori/car-A.html
         node strumenti/_t-carica.js --variante D --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const VAR = String(arg('variante', 'A')).toUpperCase();
if (!['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(VAR)) { console.error('FALLITO: --variante deve essere da A a G'); process.exit(2); }

/* ---------------------------------------------------------------------
   L'ATTREZZO COMUNE: la corsia del tiro. Ripete ALLA LETTERA la
   condizione del rimpallo sul corpo (updateBall: d < P_R+B_R-2, e chi
   ha appena calciato non si auto-mura), proiettata su una retta invece
   che su un istante. Nessun numero nuovo: solo P_R e B_R, che il muro
   gia' usa.
   --------------------------------------------------------------------- */
const CORSIA = `
/* =====================================================================
   IL PRIMO CORPO NELLA CORSIA DEL TIRO — la stessa domanda che si fara'
   updateBall fra un fotogramma, posta un fotogramma prima.

   updateBall mura quando un corpo si trova a meno di P_R+B_R-2 dal
   pallone mentre viaggia sopra le 420 unita'. Qui si chiede la stessa
   cosa lungo tutta la retta: proiezione sul versore del tiro (quanto
   avanti sta) e distanza dalla retta (quanto di lato). Chi sta dietro o
   oltre il piano della porta non conta. Torna la distanza del primo
   corpo utile, o un numero grande se la corsia e' sgombra.
   ===================================================================== */
function corsiaTiro(p, ux, uy){
  const b=G.ball, gx=p.team===0?FW:0;
  const sPorta = Math.abs(ux)>0.05 ? (gx-b.x)/ux : 1e9;
  if(sPorta<=0) return 1e9;
  const RC=P_R+B_R-2;
  let primo=1e9;
  for(let i=0;i<G.players.length;i++){
    const o=G.players[i];
    if(o.out>0 || o===p) continue;
    const dx=o.x-b.x, dy=o.y-b.y;
    const s=dx*ux+dy*uy;
    if(s<=0 || s>=sPorta) continue;
    if(Math.abs(dx*uy-dy*ux)>=RC) continue;
    if(s<primo) primo=s;
  }
  return primo;
}
`;

const ANCORE = [];

/* 0 — l'attrezzo entra accanto alla zona di tiro, che e' la sua parente */
ANCORE.push({
  nome: '0 corsiaTiro dichiarata accanto a zonaTiro',
  cerca:
`function zonaTiro(x, y, opGoalX){
  return Math.abs(opGoalX-x) < Math.min(FW*0.40, (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR)
      && Math.abs(y-FH/2) < FH*0.40;
}`,
  metti:
`function zonaTiro(x, y, opGoalX){
  return Math.abs(opGoalX-x) < Math.min(FW*0.40, (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR)
      && Math.abs(y-FH/2) < FH*0.40;
}
` + CORSIA,
});

/* 1 — la durata della carica (varianti A, B, D) */
const CERCA_CARICA =
`    if(p.kickCd<=0 && anticipa(p, 'tiro', 0.30+Math.random()*0.16, sparaTiroCpu)){`;

const METTI_A =
`    /* LA CARICA CONOSCE LO SPAZIO (26 ago 2026). Il gesto restava lungo
       0,30-0,46 s anche con un avversario a venticinque unita', e in quei
       venti-ventotto fotogrammi il marcatore arrivava: misurato su 297
       tiri, la pressione scendeva da 40 a 26 mentre si caricava, e il 67%
       dei tiri murati entro 80 unita' aveva la corsia LIBERA oltre 60 nel
       momento in cui si era deciso di tirare. Non era traffico d'area:
       era l'attesa. Adesso la preparazione dura quanto il tempo che c'e'
       — piena da 119 unita' in su, dove la conquista visiva del gesto
       vale ancora tutta, e ridotta al tocco di prima a contatto, che e'
       esattamente cio' che si vede fare a un calciatore pressato.
       IL SORTEGGIO RESTA DOV'ERA, cioe' DENTRO gli argomenti di anticipa,
       a destra del guardiano p.kickCd<=0. La prima stesura lo aveva tirato
       fuori in una const per leggibilita', e cosi' lo pescava anche col
       piede in pausa, quando il corto circuito lo saltava: misurato, il
       12,5% delle decisioni di tiro arriva con kickCd>0 (7 su 56, sei
       partite a 11). Un numero casuale in piu' non rompe il gioco, rompe
       il CONFRONTO — i banchi a seme fisso smettono di essere appaiati —
       e rendeva falsa questa stessa riga di commento. La variabile
       respiro puo' stare fuori: e' un clamp su press, e non pesca. */
    const respiro = clamp((press-24)/95, 0, 1);
    if(p.kickCd<=0 && anticipa(p, 'tiro', 0.08 + respiro*(0.22+Math.random()*0.16), sparaTiroCpu)){`;

const METTI_B =
`    /* LA CARICA CONOSCE LA CORSIA (26 ago 2026). Stessa diagnosi della
       variante A — il 67% dei tiri murati entro 80 unita' aveva la corsia
       libera alla decisione — ma il metro e' piu' onesto: non la
       pressione generica (un avversario a fianco non mura niente) bensi'
       il primo corpo dentro il TUBO verso la porta, cioe' esattamente
       quello che fra un fotogramma potra' respingere il pallone. Piena
       da 200 unita' di varco in su, tocco di prima quando il corpo e'
       addosso. Il sorteggio resta dentro il corto circuito di
       del guardiano p.kickCd<=0, per la ragione scritta in A: fuori
       di li' si pesca anche col piede in pausa e i banchi a seme fisso
       si sfasano. corsiaTiro non sorteggia niente e puo' stare sopra. */
    const dxCar=opGoalX-p.x, dyCar=FH/2-p.y, lCar=Math.max(1,len(dxCar,dyCar));
    const varco = corsiaTiro(p, dxCar/lCar, dyCar/lCar);
    const respiro = clamp((varco-40)/160, 0, 1);
    if(p.kickCd<=0 && anticipa(p, 'tiro', 0.08 + respiro*(0.22+Math.random()*0.16), sparaTiroCpu)){`;

if (['A', 'D', 'F', 'G'].includes(VAR)) ANCORE.push({ nome: '1 la carica scala con la pressione', cerca: CERCA_CARICA, metti: METTI_A });
if (VAR === 'B') ANCORE.push({ nome: '1 la carica scala con la corsia', cerca: CERCA_CARICA, metti: METTI_B });

/* 3 — la voglia di tirare cresce avvicinandosi (varianti E, F, G) */
if (['E', 'F', 'G'].includes(VAR)) ANCORE.push({
  nome: '3 la voglia di tirare cresce avvicinandosi',
  cerca:
`  const inRange = zonaTiro(p.x, p.y, opGoalX);
  if(inRange && Math.random()<D.shotFreq){`,
  metti:
`  const inRange = zonaTiro(p.x, p.y, opGoalX);
  /* =============================================================
     LA VOGLIA DI TIRARE CRESCE AVVICINANDOSI (26 ago 2026).

     LA ZONA DI TIRO E' UNA SOGLIA, E UNA SOGLIA NON HA MEZZE
     MISURE: appena il portatore la varcava, l'88% delle sue
     decisioni diventava un tiro. A 5 contro 5 la soglia sta a 460
     unita' e il conto torna. A 11 sta a 920 — l'ultimo 40% di un
     campo largo il doppio — e 920 unita' sono quaranta metri: da
     li' il pallone attraversa venti gambe e su 297 tiri misurati
     il 57,6% muore su un corpo (strumenti/_diag-tiro.js). Il 72%
     dei tiri dell'11 parte da oltre 650 unita', e la squadra non
     si avvicina MAI, perche' il tiro da lontano e' gratis e
     arriva sempre prima del passaggio che porterebbe avanti.

     NON SI STRINGE LA ZONA: quella cura e' gia' stata provata e
     bocciata due volte (tetto a 600: 0-0 dal 40% al 73%, tiri da
     8 a 5,5 — la nota sta in _t-undici-fisica.js). Un tiro murato
     e' comunque un evento, e toglierlo toglie piu' di quel che
     rende. Qui la zona resta quella di ieri: cambia il PESO. Dal
     bordo si tira di rado, dentro i 460 — la zona vera del 5
     contro 5, in unita' assolute — si tira come sempre. Il
     portatore che non tira non perde il turno: porta palla,
     crossa, appoggia, e la volta dopo e' piu' vicino.

     A 5 CONTRO 5 E' IDENTICO AL BIT: zMax vale 460 e zBuona pure,
     quindi la voglia e' 1 su tutta la zona. A 7 morde da 644 a
     460, a 11 da 920 a 460. Un solo Math.random, come prima. */
  const zMax  = Math.min(FW*0.40, (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR);
  const zVera = Math.min(zMax, 460);
  const voglia = zMax>zVera ? clamp((zMax-Math.abs(opGoalX-p.x))/(zMax-zVera), 0.15, 1) : 1;
  if(inRange && Math.random()<D.shotFreq*voglia){`,
});

/* 2 — la mira sceglie la corsia (varianti C, D) */
if (['C', 'D', 'G'].includes(VAR)) ANCORE.push({
  nome: '2 il tiro perfetto mira dove la corsia e\' piu\' lunga',
  cerca:
`    const corner = (p.y<goalY?1:-1);      // incrocio opposto alla posizione
    const gx=t===0?FW-4:4;`,
  metti:
`    /* LA MIRA SCEGLIE LA CORSIA (26 ago 2026). L'incrocio si prendeva
       sempre opposto alla propria posizione — il palo lontano, che e' la
       regola giusta CONTRO IL PORTIERE. Ma prima del portiere ci sono
       venti gambe, e su 297 tiri misurati il 57,6% moriva su un corpo.
       Adesso, se l'altro incrocio ha un varco piu' lungo di almeno 60
       unita' (tre volte il raggio del muro: un margine, non un
       pareggio), si mira li'. Non toglie ne' aggiunge un solo tiro —
       cambia la retta, non la decisione — e resta il palo lontano tutte
       le volte che la differenza non c'e'. Zero sorteggi nuovi. */
    let corner = (p.y<goalY?1:-1);        // incrocio opposto alla posizione
    const gx=t===0?FW-4:4;
    {
      const varcoDi = c => {
        const dyv=(goalY + c*(GOAL_H/2-24))-p.y, dxv=gx-p.x, lv=Math.max(1,len(dxv,dyv));
        return corsiaTiro(p, dxv/lv, dyv/lv);
      };
      if(varcoDi(-corner) > varcoDi(corner) + 60) corner = -corner;
    }`,
});

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-carica.js variante ' + VAR + ' — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.car' + VAR + '.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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

const attesi = [['function corsiaTiro(p, ux, uy){', 1]];
/* gli attesi della carica ancorano la RIGA INTERA, non il pezzo comodo: il
   sorteggio deve stare a destra di `p.kickCd<=0 &&`, dentro gli argomenti
   di anticipa. Una riscrittura che lo tiri fuori in una const per
   leggibilita' — com'era la prima stesura — cambia il consumo dei numeri
   casuali e sfasa i banchi appaiati, e da oggi non passa da qui. */
if (['A', 'D', 'F', 'G'].includes(VAR)) attesi.push(
  ["if(p.kickCd<=0 && anticipa(p, 'tiro', 0.08 + respiro*(0.22+Math.random()*0.16), sparaTiroCpu)){", 1],
  ['const durCar', 0], ['0.30+Math.random()*0.16, sparaTiroCpu', 0]);
if (VAR === 'B') attesi.push(
  ['const respiro = clamp((varco-40)/160, 0, 1);', 1],
  ["if(p.kickCd<=0 && anticipa(p, 'tiro', 0.08 + respiro*(0.22+Math.random()*0.16), sparaTiroCpu)){", 1],
  ['const durCar', 0], ['0.30+Math.random()*0.16, sparaTiroCpu', 0]);
if (['C', 'D', 'G'].includes(VAR)) attesi.push(['if(varcoDi(-corner) > varcoDi(corner) + 60) corner = -corner;', 1], ['const corner = (p.y<goalY?1:-1);', 0]);
if (VAR === 'C' || VAR === 'E') attesi.push(['0.30+Math.random()*0.16, sparaTiroCpu', 1]);
if (['E', 'F', 'G'].includes(VAR)) attesi.push(['Math.random()<D.shotFreq*voglia', 1], ['Math.random()<D.shotFreq){', 0]);
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  variante ' + VAR + ', ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
