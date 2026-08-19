/* =====================================================================
   _t-divise.js — LE SEI DIVISE CHE SULL'ERBA NON SI VEDONO.

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce SEI ancoraggi ESATTI e scrive la copia in --out. Senza
   --out scrive accanto all'originale un file col suffisso .divise.html:
   mai sull'originale, se non con --dentro. Se anche un solo ancoraggio
   non compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e
   non scrive niente.

   uso:
     node strumenti/_t-divise.js --out fuori/divise.html
     node strumenti/_t-divise.js --in altro.html --out x.html
     node strumenti/_t-divise.js --dentro
     node strumenti/_t-divise.js --elenco

   ---------------------------------------------------------------------
   IL FATTO. Il cancello chiede 3:1 fra la maglia e l'erba e il 19 agosto
   2026 misura, sulla divisa di serie, 2,61:1 — con le tre partite a
   2,05 / 4,57 / 2,13. Due su tre sotto il minimo, e una media che quasi
   le nascondeva. Nessuna modifica lo ha introdotto: una toppa ha
   cambiato il consumo dei sorteggi e il gioco ha cominciato a pescare
   coppie di divise che prima non uscivano. Il difetto c'era sempre.

   LA MISURA, ESAUSTIVA E NON CAMPIONARIA. strumenti/_sonda-divise.js
   guarda TUTTE le divise del file — otto kit del giocatore, dieci
   squadre di quartiere, la ROSA della CPU, la coppia dell'alto
   contrasto e le quattro divise da portiere — in due protocolli:
     (a) APPAIATO: lo stesso fotogramma ridipinto una volta per divisa,
         con la fisica e la camera congelate, su tre ore della partita
         (0,10 / 0,50 / 0,90) e sulle DUE bande di tosatura separate.
         Il numero riportato e' il MINIMO delle sei combinazioni.
     (b) CANCELLO: il protocollo di collaudo.js alla lettera, ripetuto
         per ogni kit e per ogni squadra di torneo. Fedelta' verificata:
         sul file di partenza ridice i numeri del cancello al centesimo
         su tre righe su quattro — celeste 2,61 = 2,05/4,57/2,13, giallo
         alto contrasto 3,42 = 2,84/6,09/2,98, celeste alto contrasto
         4,82 = 4,06/5,61/3,32. Sulla quarta (la ROSA della CPU) il
         mucchio coincide, 4,07, e coincidono la seconda e la terza
         partita, ma la PRIMA da' 3,37 dove il cancello da' 3,26: il 3%,
         e va detto invece che arrotondato. La causa e' che nella sonda
         ogni configurazione e' una corsa a se', mentre nel cancello P1 e
         P2 escono dalle stesse tre partite, e la partita di
         riscaldamento non azzera i latch di regia fino all'ultimo bit.

   SEI DIVISE STANNO SOTTO 3:1 NEL PEGGIORE DEI DUE. Sono queste, e sono
   le sei che questa toppa sposta. Nessun'altra si tocca.

   COSA NON SI FA, e va detto prima dei numeri.
   · NIENTE COLORI DI SQUADRE VERE E NIENTE NOMI VERI. MERCATO VERDE,
     CASE NUOVE, PONTE ROSSO, STAZIONE FC restano quello che sono:
     nomi di quartiere inventati con tinte inventate. Le sei tinte nuove
     sono ricavate dalle vecchie per SOLA luminanza, e lo spostamento di
     TINTA e' minimo — celeste 200,0 -> 199,5, viola 270,3 -> 270,9,
     rossonero 9,8 -> 14,0, ponte rosso 9,8 -> 12,2, stazione 343,1 ->
     343,4, viola del portiere 277,7 -> 274,0: il massimo e' 4,2 gradi.
     Non arrivano da nessuna maglia esistente.
   · LA SEPARAZIONE FRA LE DUE SQUADRE SI PAGA, E IL CONTO E' QUI. Questa
     e' la cosa da leggere prima di applicare la toppa, e la previsione
     che avevo scritto qui al primo giro era SBAGLIATA: pensavo che
     alzare la chiarezza del celeste allontanasse le due maglie, e la
     misura dice il contrario. Le divise si separano soprattutto per
     CROMA, e alzare la luminanza dentro il gamut sRGB costa croma:
     spinte tutte verso l'alto, le maglie convergono verso lo stesso
     pastello. Distanza OKLab fra i colori RESI (i pixel veri delle due
     maglie nello stesso fotogramma), prima -> dopo:
       celeste / rosa CPU          0,176 -> 0,130
       viola / rosa CPU            0,128 -> 0,068
       rossonero / rosa CPU        0,190 -> 0,095
       celeste / MOLO 4            0,104 -> 0,064
       celeste / TORRE VECCHIA     0,110 -> 0,069
       celeste / BORGO ALTO        0,113 -> 0,076
     Il pavimento delle coppie scende da 0,104 a 0,064. NON e' il difetto
     del compito chiuso (due maglie alla STESSA chiarezza, che leggevano
     come due grigi): qui la chiarezza le separa ancora, ed e' il croma
     che si assottiglia. Ma e' un debito, va dichiarato, e la sua cura
     non sta nelle divise: sta nel velo che spegne il croma. Chi applica
     questa toppa compra 3:1 su tutte le divise e paga un terzo della
     distanza fra le squadre; chi non la applica tiene le divise cariche
     e lascia cinque maglie di movimento piu' una da portiere che
     sull'erba non si vedono. Le due colonne sono misurate: la scelta e'
     di chi comanda il gioco, non della toppa.
   · NON SI TOCCA LA MODALITA' AD ALTO CONTRASTO. La coppia giallo
     #ffe14d / celeste #9ccbff di applyKit non e' fra le sei: misura
     3,42:1 e 4,82:1, sopra il minimo. Nessuno dei sei ancoraggi la
     sfiora — la toppa si rifiuta di scrivere se le due righe che la
     definiscono non sono intatte, ed e' un controllo dopo la
     sostituzione, non una promessa. Sul file toppato quelle due righe
     misurano 3,38-3,42 e 4,82: il ballerino sul primo decimale e' del
     banco (si vede anche fra due corse dello stesso file), non della
     toppa, che su quelle tinte non ha scritto un bit.
   · NON SI TOCCA IL MANTO. La cura sta tutta nelle divise: spostare il
     verde muoverebbe TUTTI i rapporti insieme, compresi quelli che oggi
     stanno bene, e sarebbe riparare il metro invece della cosa misurata.

   ---------------------------------------------------------------------
   IL CONTO CHE DECIDE QUANTO ALZARE, e perche' non bastava guardare la
   tinta dichiarata.

   Fra il colore SCRITTO nel file e quello che arriva all'occhio c'e' il
   velo dell'illuminazione. Misurato sui pixel, sulle otto divise del
   giocatore: la luminanza resa vale fra il 54% e il 73% di quella
   nominale, e la retta che le lega (minimi quadrati sugli otto punti) e'
     resa = 0,5046 * nominale + 0,0612
   L'erba resa attorno alla squadra 0 sta a Y 0,0768 (a quella della
   squadra 1 a Y 0,0628: la vignettatura e' spostata a ovest e le due
   meta' del campo non sono illuminate uguale — e' il motivo per cui la
   STESSA tinta misura 1,97:1 addosso al giocatore e 3,39:1 addosso
   all'avversario). Per 3:1 sull'erba piu' chiara servono dunque
     resa   Y >= 0,3303      cioe'      nominale Y >= 0,533
   Le sei tinte nuove stanno tutte oltre, con margine, perche' il banco
   ha una dispersione di mezzo punto fra una partita e l'altra.

   E LA CONSEGUENZA CHE NON SI PUO' NASCONDERE: a questa luminanza un
   rosso saturo non esiste. Il rosso pieno #ff0000 ha Y nominale 0,2126,
   e la retta qui sopra lo porta a 1,72:1 sul manto — meno della meta'
   del minimo. Quel 1,72 e' RICAVATO dalla retta, non misurato sui
   pixel: e' l'unico numero di questa toppa che non venga dal banco, ed
   e' scritto perche' si sappia. ROSSONERO e
   PONTE ROSSO diventano quindi due coralli chiari, non due rossi
   accesi. Non e' un gusto: e' il pavimento di luminanza che il 3:1
   impone su questa erba, ed e' lo stesso conto che aveva gia' spostato
   #ff4d4d a #ff6a4d una passata fa.

   ---------------------------------------------------------------------
   RETTIFICA DI UN NUMERO SCADUTO, in chiaro. Il commento sopra
   ROSSONERO dichiara "#ff6a4d ha Y 0,318 -> 3,57:1". La luminanza e'
   giusta (0,321 ricontata oggi); il rapporto no: valeva contro il manto
   di allora. Misurato il 19 agosto 2026 sui pixel, #ff6a4d addosso alla
   squadra 0 da' 1,97:1 nel mucchio delle tre partite. La riga vecchia
   resta scritta, con la data accanto, perche' si veda che e' stata
   superata e non cancellata.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   GLI ANCORAGGI. Testo esatto cercato, testo esatto messo al suo posto.
   Nessuna espressione regolare, nessun numero di riga.
   -------------------------------------------------------------------- */
const ANCORE = [

/* 1 — la divisa di serie */
{
  nome: '1/6 KITS[0] CELESTE: la divisa di serie, quella che il cancello misura',
  cerca:
`  { nome:'CELESTE',   c1:'#46c0ff', c2:'#1e5f9e', pat:1 },`,
  metti:
`  /* IL CELESTE SALE DI LUMINANZA, E QUESTA VOLTA IL CONTO E' SUI PIXEL.
     #46c0ff sta a Y nominale 0,462 e il cancello lo misura a 2,61:1 sul
     manto — sotto il minimo di 3:1, con due partite su tre a 2,05 e
     2,13. Il pavimento misurato per il 3:1 su questa erba e' Y nominale
     0,533 (vedi il conto in testa a strumenti/_t-divise.js); #8ad9ff sta
     a 0,622, cioe' sopra il pavimento del 17%, che e' quanto serve
     perche' la dispersione fra una partita e l'altra non se lo mangi.
     LA TINTA NON SI MUOVE: 199,5 gradi contro i 200 di prima, quindi i
     venticinque gradi di margine dalla famiglia del prato (90-175
     gradi) restano quelli dichiarati quando questa casella fu scelta.
     E QUESTO COSTA SEPARAZIONE FRA LE DUE SQUADRE — si dice, si misura e
     non si nasconde. Un celeste piu' chiaro e' un celeste meno carico
     (il gamut non lascia scelta), e il croma e' proprio il canale su cui
     la maglia di casa si stacca dal rosa della CPU. Misurata sui pixel
     RESI delle due maglie nello stesso fotogramma, la distanza OKLab
     scende da 0,176 a 0,130: il 26% in meno, in cambio di 0,64 punti di
     contrasto contro l'erba (2,61 -> 3,25). Resta sopra il pavimento
     che il gioco gia' spedisce oggi — la coppia peggiore in circolazione
     e' celeste contro MOLO 4 a 0,104 — ma e' un prezzo, non un pasto
     gratis, e la tabella completa sta nella consegna della toppa.
     La seconda tinta sale con la prima (#1e5f9e -> #2f86d8): il palato
     e' fatto di strisce di c2 che cadono DENTRO il torso, quindi dentro
     la finestra che il cancello misura e dentro l'area che l'occhio
     legge. Lasciarla sotto avrebbe alzato la maglia e non la divisa. */
  { nome:'CELESTE',   c1:'#8ad9ff', c2:'#2f86d8', pat:1 },`,
},

/* 2 — il viola del giocatore */
{
  nome: '2/6 KITS[3] VIOLA',
  cerca:
`  { nome:'VIOLA',     c1:'#c58aff', c2:'#5b2a8a', pat:1 },`,
  metti:
`  /* IL VIOLA E' LA SECONDA PIU' SCURA DELLE OTTO: Y nominale 0,373,
     misurato 2,39:1 nel mucchio delle tre partite e 1,73:1 nella
     peggiore. Un viola non puo' essere insieme chiaro e carico — il blu
     pesa 0,0722 nella luminanza — quindi sopra il pavimento di Y 0,533
     resta soltanto un lilla, ed e' il prezzo dichiarato del 3:1 su
     questa erba.
     #e0bfff sta a Y 0,603 e a 270,9 gradi contro i 270,3 di prima: e' lo
     stesso viola, portato sopra il pavimento.
     UN TENTATIVO PROVATO E BUTTATO, scritto perche' non lo rifaccia
     nessun altro. La separazione dal rosa della CPU scende (vedi sotto),
     e la mossa ovvia e' allontanare la TINTA: provato #dac4ff, 262 gradi
     invece di 271, cioe' otto gradi piu' lontano dal rosa. Misurato:
     distanza OKLab fra le due maglie rese 0,069 contro 0,068 — un
     millesimo, cioe' niente. La separazione che si e' persa non stava
     nella tinta, stava nella CHIAREZZA e nel CROMA, e otto gradi di
     tinta non la ricomprano. Percio' la tinta resta dov'era.
     IL PREZZO, misurato e non nascosto: la distanza OKLab fra questa
     maglia e il rosa della CPU scende da 0,128 a 0,068. E' il piu'
     grosso dei cinque cali di questa toppa, e la ragione e' la stessa
     del celeste: a Y 0,60 un viola non e' piu' un viola carico, e due
     maglie chiare accanto si somigliano piu' di due maglie cariche.
     EFFETTO COLLATERALE VOLUTO: fino a oggi questa casella e la squadra
     di quartiere BORGO ALTO portavano la STESSA tinta esatta (#c58aff).
     Chi sceglieva VIOLA e pescava BORGO ALTO giocava contro se stesso.
     Adesso sono due viola diversi. */
  { nome:'VIOLA',     c1:'#e0bfff', c2:'#8250b8', pat:1 },`,
},

/* 3 — il rosso del giocatore, con la rettifica del numero scaduto */
{
  nome: '3/6 KITS[7] ROSSONERO (e la rettifica del rapporto scaduto)',
  cerca:
`  /* VINCOLO DURO SULLE MAGLIE: luminanza relativa Y >= 0,30, se no contro
     l'erba non arrivano a 3:1. Le altre sette ci stanno larghe; questa era
     l'unica sotto — #ff4d4d ha Y 0,271, cioe' 3,12:1 con un margine del 4%,
     che e' quanto basta a perderlo alla prossima passata sul manto.
     #ff6a4d ha Y 0,318 -> 3,57:1, e resta lo stesso rosso. */
  { nome:'ROSSONERO', c1:'#ff6a4d', c2:'#1c1c1c', pat:1 },`,
  metti:
`  /* VINCOLO DURO SULLE MAGLIE: luminanza relativa Y >= 0,30, se no contro
     l'erba non arrivano a 3:1. Le altre sette ci stanno larghe; questa era
     l'unica sotto — #ff4d4d ha Y 0,271, cioe' 3,12:1 con un margine del 4%,
     che e' quanto basta a perderlo alla prossima passata sul manto.
     #ff6a4d ha Y 0,318 -> 3,57:1, e resta lo stesso rosso. */
  /* RETTIFICA, 19 agosto 2026 (misura sui pixel, strumenti/_sonda-divise.js).
     La riga qui sopra e' scaduta e resta scritta perche' si veda dove
     era il metro. La luminanza regge — #ff6a4d ricontata oggi da' Y
     0,321 — ma il rapporto no: 3,57:1 valeva contro il manto di allora.
     Sul manto di oggi #ff6a4d addosso alla squadra 0 misura 1,97:1 nel
     mucchio delle tre partite e 1,48:1 nella peggiore: era la divisa
     PEGGIORE del gioco, non l'unica appena sotto.
     E IL VINCOLO STESSO ERA TROPPO BASSO. Il pavimento vero, ricavato
     dai pixel e non dalla tinta dichiarata (il velo dell'illuminazione
     lascia passare fra il 54% e il 73% della luminanza nominale), e'
     Y >= 0,533 e non Y >= 0,30.
     COSA DIVENTA IL ROSSO. A Y 0,533 un rosso saturo non esiste: il
     rosso pieno #ff0000 ha Y 0,2126 e sul manto reso vale 1,72:1, meno
     della meta' del minimo. #ffc4b2 sta a Y 0,640 e a 14 gradi di tinta
     (erano 10): e' un corallo chiaro, ed e' la cosa piu' rossa che il
     3:1 lasci passare su questa erba. La seconda tinta resta il nero
     #1c1c1c, perche' e' meta' del nome della divisa.
     E IL DISEGNO PASSA DAL PALATO ALLE MANICHE (pat 1 -> 0), che qui
     vale piu' del colore. Col palato le strisce di c2 cadono DENTRO il
     torso: con un c2 nero, meta' della finestra che si misura — e meta'
     dell'area che l'occhio legge — e' nera, e la mediana ci affonda.
     Misurato: #ffbba8 (Y 0,596, quasi il doppio dell'originale) col
     palato nero dava 2,77:1, cioe' ANCORA sotto il minimo dopo aver
     quasi raddoppiato la luminanza della tinta. Con le
     maniche il busto e' tinta unita e il nero va dove non ruba
     visibilita'. La divisa resta rossa e nera; cambia dove sta il nero.
     Il motivo pat 0 esiste gia' nel gioco (lo porta ORO), quindi non si
     introduce niente di nuovo. */
  { nome:'ROSSONERO', c1:'#ffc4b2', c2:'#1c1c1c', pat:0 },`,
},

/* 4 — il rosso di quartiere */
{
  nome: '4/6 TOUR_POOL PONTE ROSSO',
  cerca:
`  { n:'PONTE ROSSO',   c1:'#ff6a4d', c2:'#7a1010', pat:2, forza:9, stile:'i favoriti: tirano da ovunque' },`,
  metti:
`  /* PONTE ROSSO portava la tinta identica a ROSSONERO (#ff6a4d), e
     misura 2,87:1 nel caso peggiore fra le tre ore e le due bande di
     tosatura. #ff9d84 sta a Y 0,466 contro 0,321, alla stessa tinta
     (11 gradi contro 10). Resta piu' scuro del corallo di ROSSONERO
     perche' l'avversario gioca sulla meta' campo che la vignettatura
     tiene piu' in ombra — la stessa tinta li' rende 3,39:1 dove addosso
     al giocatore rende 1,97:1 — e perche' due divise che erano IDENTICHE
     e' bene che adesso siano due. */
  { n:'PONTE ROSSO',   c1:'#ff9d84', c2:'#a8443a', pat:2, forza:9, stile:'i favoriti: tirano da ovunque' },`,
},

/* 5 — il rosa di quartiere */
{
  nome: '5/6 TOUR_POOL STAZIONE FC',
  cerca:
`  { n:'STAZIONE FC',   c1:'#ff5c8a', c2:'#8a1f43', pat:2, forza:5, stile:'discontinui: o benissimo o malissimo' },`,
  metti:
`  /* STAZIONE FC e' la piu' scura delle dieci squadre di quartiere: Y
     nominale 0,307, e 2,83:1 nel caso peggiore fra ore e bande.
     #ffa8c0 sta a Y 0,531, alla stessa tinta (343 gradi contro 341):
     e' lo stesso rosa, portato dove l'erba non se lo mangia. La seconda
     tinta sale con la prima perche' la FASCIA (pat 2) attraversa il
     torso, cioe' proprio la finestra che il cancello misura. */
  { n:'STAZIONE FC',   c1:'#ffa8c0', c2:'#c25878', pat:2, forza:5, stile:'discontinui: o benissimo o malissimo' },`,
},

/* 6 — la divisa da portiere che nessuno guardava */
{
  nome: '6/6 GK_SCELTE: il viola da portiere',
  cerca:
`  ['#c86bff','#4d1f78'],   // viola`,
  metti:
`  /* IL VIOLA DA PORTIERE E' L'UNICA DELLE QUATTRO SOTTO IL MINIMO:
     2,89:1 nel caso peggiore, contro 3,67 dell'ambra, 3,96 del verde
     acqua e 5,35 del bianco. Oggi non e' quella scelta — vince l'ambra,
     o il verde acqua col kit fluo addosso — ma "oggi non esce" non e'
     una ragione per lasciare una divisa che non si vede: la scelta
     dipende dalle tinte delle due squadre, e quelle cambiano.
     #e2bcff sta a Y 0,594 contro 0,331, a 274 gradi di tinta contro 278.
     LA SCELTA DEL PORTIERE CAMBIA, e la previsione che avevo scritto qui
     ("non cambia") era sbagliata: l'ho misurata invece di supporla ed e'
     uscito il contrario. scegliDivisaPortiere elegge la piu' LONTANA
     dalle due divise di movimento, dal verde del prato e dal bianco del
     pallone; un viola piu' chiaro si avvicina al bianco del pallone e
     quindi vince molto meno spesso. Enumerate tutte e 96 le
     combinazioni (otto kit x undici avversari piu' l'alto contrasto),
     la divisa eletta cambia in 33 — e 32 di quei 33 li causa questa
     riga da sola, non le altre cinque della toppa:
       eletta prima:  verde acqua 43   viola 32   ambra 21
       eletta dopo:   verde acqua 54   ambra 35   viola  7
     E NON E' UN DANNO, perche' tutte e quattro le scelte possibili
     stanno sopra il minimo dopo questa toppa (verde acqua 3,96:1,
     ambra 3,67:1, viola nuovo 4,31:1, bianco 5,35:1): qualunque sia
     l'eletta, il portiere si vede. Prima non era cosi' — il viola
     vinceva in un terzo dei casi e stava a 2,89:1. */
  ['#e2bcff','#7a4bab'],   // viola`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-divise.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.divise.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* un controllo DOPO la sostituzione: le sei tinte vecchie devono essere
   sparite dalle caselle che le portavano, e le nuove devono esserci una
   volta sola. #ff6a4d resta nel testo dei commenti (e' la rettifica in
   chiaro), quindi si contano le RIGHE di dichiarazione, non le occorrenze. */
const attesi = [
  ["c1:'#8ad9ff'", 1], ["c1:'#e0bfff'", 1], ["c1:'#ffc4b2', c2:'#1c1c1c', pat:0", 1],
  ["c1:'#ff9d84'", 1], ["c1:'#ffa8c0'", 1], ["['#e2bcff','#7a4bab']", 1],
  ["c1:'#46c0ff'", 0], ["nome:'VIOLA',     c1:'#c58aff'", 0], ["c1:'#ff6a4d', c2:'#1c1c1c'", 0],
  /* BORGO ALTO tiene ancora #c58aff, ed e' voluto: sta sopra il minimo
     (3,26:1 nel caso peggiore) e adesso non e' piu' il gemello del kit
     del giocatore. Se un giorno sparisse anche quello, questa riga se ne
     accorgerebbe. */
  ["{ n:'BORGO ALTO',    c1:'#c58aff', c2:'#5b2a8a', pat:0", 1],
  ["c1:'#ff6a4d', c2:'#7a1010'", 0], ["c1:'#ff5c8a'", 0], ["['#c86bff','#4d1f78']", 0],
  /* la modalita' ad alto contrasto NON e' stata sfiorata */
  ["TEAMCOL[0]='#ffe14d'; TEAMCOL2[0]='#8a6a00'; TEAMPAT[0]=1;", 1],
  ["const BLU_KIT ='#9ccbff';", 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
