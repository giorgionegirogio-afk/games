/* =====================================================================
   _t-riarmo.js — LA GUARDIA DEL RI-ARMO: la soglia del trascinamento
   legge il tempo del POLLICE sul vetro, non il tempo del VERBO.

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce TRE ancoraggi ESATTI e scrive la copia in --out. Senza
   --out scrive accanto all'originale un file col suffisso .riarmo.html:
   mai sull'originale, se non con --dentro. Se anche un solo ancoraggio
   non compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e
   non scrive niente.

   uso:
     node strumenti/_t-riarmo.js --out fuori/riarmo.html
     node strumenti/_t-riarmo.js --in altro.html --out x.html
     node strumenti/_t-riarmo.js --dentro
     node strumenti/_t-riarmo.js --elenco

   ---------------------------------------------------------------------
   IL DIFETTO, E DA CHI E' STATO MISURATO. Il ri-armo di L1.1 (il
   contesto cambia sotto il dito: l'atto congelato muore, la posa si
   ribasa, la tenuta riparte) azzera anche la SOGLIA: R_ARMA = 22 +
   14*min(1, tenuta/0,60) crolla da 36 a 22 px nell'istante esatto in
   cui il pollice e' giu' da piu' tempo — cioe' quando il progetto la
   voleva PIU' ALTA, perche' un pollice appoggiato a lungo rotola
   (agente28.md §3.1 e §7). Un critico avversario l'ha misurato sul ramo
   della scivolata (fuori/_crit/X34.txt, X3): tenuta di 1 s, deriva di
   30 px, il dito TORNA al proprio punto di posa dopo il ri-armo, e la
   correzione arma una scivolata mai chiesta 8 volte su 20 (direzione
   180 gradi rispetto alla deriva), contro 0 su 20 senza ri-armo.

   LA TESI. «tenuta» confonde due tempi che il ri-armo separa:
     - il tempo del VERBO sotto il pollice, che il ri-armo azzera a
       ragione (la tenuta di un verbo non e' la tenuta di un altro:
       la leggera' chi misura la maturazione di un gesto);
     - il tempo del POLLICE sul vetro, che il ri-armo NON PUO' azzerare,
       perche' il polpastrello e' lo stesso e sta rotolando da prima.
   R_ARMA esiste per il secondo tempo e leggeva il primo. La guardia e'
   un campo nuovo, «posato», che parte con l'atto e non si azzera mai
   finche' il dito e' giu': rArma legge quello. Per gli atti mai
   ri-armati posato==tenuta per costruzione, e non cambia un bit.

   ---------------------------------------------------------------------
   I TRE RIMEDI CONSIDERATI, E PERCHE' QUESTO. (Le misure stanno in
   strumenti/_q-riarmo.js; i numeri qui sotto vengono da quel banco,
   corse del 20 agosto 2026 su questo repo.)

   (a) TEMPO MORTO: un atto ri-armato non puo' armarsi finche' non e'
       passato T sull'accumulatore. Bocciato con due misure:
       - NON CHIUDE IL DIFETTO: dopo T il criterio torna quello di oggi,
         quindi una correzione rilasciata dopo T arma lo stesso (al
         banco, la correzione di 32 px arma con R_ARMA a 29,4 px cioe'
         fino a tenuta 0,43 s: un T sotto 0,43 lascia la finestra
         aperta); e una deriva sopra 36 px arma a QUALUNQUE T, perche'
         R_ARMA satura a 36. Per chiudere davvero servirebbe T >= 0,6 s;
       - E A QUEL PUNTO RIAPRE LA PARALISI: per T il dito gia' giu' non
         puo' comandare la scivolata voluta (la prova B1 del cancello,
         trascinamento di 60 px rilasciato ~0,3 s dopo il furto, sarebbe
         rossa). La paralisi di 300-500 ms e' esattamente il difetto che
         il ri-armo esiste per togliere: un rimedio che la reintroduce
         sul verbo difensivo ha il segno sbagliato.
   (c) «UN TRASCINAMENTO NUOVO CHE PARTA DA FERMO». Bocciato due volte:
       - NON DISTINGUE: la correzione della deriva parte da ferma anche
         lei. Nella scena del banco il dito sta fermo DUE fotogrammi dopo
         il ri-armo e poi corregge: qualunque criterio «da fermo» e' gia'
         soddisfatto quando la correzione comincia, e la scivolata parte
         lo stesso. Distinguerebbe solo il dito GIA' in moto al ri-armo —
         che pero' e' anche il giocatore che sta gia' reagendo al furto,
         cioe' quello da non punire;
       - e «fermo» e' una lettura di velocita' (spostamento fra
         fotogrammi sotto una soglia), vietata dalla Legge 2: ogni
         guasto che sbaglia un VERBO e' maligno, e questa ne creerebbe
         una classe nuova.
   (b) LA SOGLIA NON CROLLA — questo file. La correzione di 32 px non
       arma piu' (0 su 20 al banco, contro 20 su 20 prima su scivolata e
       raddoppio); il trascinamento voluto di 60 px arma ancora, subito,
       senza aspettare niente (8 su 8 su tutti e due i verbi); nessuna
       lettura nuova, nessuna soglia nuova, nessun numero da tarare:
       si usa ARMA_PIENA che c'era gia'.

   IL PREZZO DI (b), DICHIARATO E MISURATO: dopo un ri-armo a pollice
   vecchio, un trascinamento VOLUTO di 33 px non arma piu' (armava 4 su
   4, con la guardia 0 su 4): fra 22 e 36 px il verbo nuovo chiede al
   dito la stessa ampiezza che chiederebbe a una tenuta lunga senza
   ri-armo. E' il prezzo che il progetto paga gia', per la stessa
   ragione fisica, su ogni tenuta lunga: non e' un prezzo nuovo.

   COSA NON TOCCA. Il ri-armo resta intero: l'atto muore, la carica si
   chiude subito, la posa si ribasa, la tenuta riparte, il verbo nuovo
   e' sotto il dito senza alzare e ripremere. La paralisi da furto — i
   300-500 ms che _q-l11.js C1/C2/C3 sorvegliano — resta tolta: 8/8
   prima e dopo, misurato. E i tre atti che leggono il trascinamento al
   rilascio (scivolata, raddoppio, passaggio mirato) continuano a
   funzionare quando il trascinamento e' voluto: prove B1, B2, B3 del
   cancello, tutte verdi sul file toppato.

   I NUMERI DEL BANCO (strumenti/_q-riarmo.js, Chromium 915x412 dpr2,
   dita di protocollo, DT=1/60, seme 20260820; il banco compone le toppe
   pronte _t-l12/_t-l14/_t-l15 su una copia, perche' sul gioco di oggi
   il trascinamento non ha ancora consumatori e il difetto e' latente):
     PRIMA (gioco di oggi, md5 30279089de83):
       A1 scivolate dalla correzione   20 su 20   ROSSO
       A2 raddoppi dalla correzione    20 su 20   ROSSO
       A3 passaggi fantasma             0 su 20   (la L1.4 di oggi non
          apre pose ai ri-armi: il ramo through non manifesta — vedi
          la nota onesta nel cancello)
       B1/B2/B3 trascinamenti voluti    8/8 8/8 8/8
     DOPO (questa toppa):
       A1 0 su 20 · A2 0 su 20 · A3 0 su 20 · B1/B2/B3 8/8 8/8 8/8
       _q-l11.js 8/8 · collaudo 36/36 · _q-precedenza 9/9
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
   Nessuna espressione regolare, nessun numero di riga. Nessuno dei tre
   tocca righe su cui ancorano _t-l12/_t-l13/_t-l14/_t-l15 (verificato:
   nasceAtto, rArma e la riga della tenuta non compaiono in nessuna
   delle quattro), quindi questa toppa si applica prima o dopo di loro
   indifferentemente.
   -------------------------------------------------------------------- */
const ANCORE = [

/* 1 — nasceAtto: nasce il tempo del pollice, accanto a quello del verbo */
{
  nome: '1/3 nasceAtto: il campo «posato», il tempo del pollice sul vetro',
  cerca:
`    this.atti[id]={ t:t, carica:(act==='shot' ? ctrlPlayer(t) : null),
                    slot:slot, act:act,
                    posaX:x, posaY:y, x:x, y:y, tenuta:0, morto:false,
                    anello:[{x:x,y:y,q:this.tempo}] };`,
  metti:
`    /* «posato» e' il tempo del POLLICE sul vetro, «tenuta» il tempo del
       VERBO sotto il pollice. Il ri-armo azzera la seconda e non il
       primo: il rotolamento del polpastrello — la ragione per cui
       R_ARMA cresce — appartiene al dito, che e' giu' da prima, non al
       verbo, che e' appena nato. */
    this.atti[id]={ t:t, carica:(act==='shot' ? ctrlPlayer(t) : null),
                    slot:slot, act:act,
                    posaX:x, posaY:y, x:x, y:y, tenuta:0, posato:0, morto:false,
                    anello:[{x:x,y:y,q:this.tempo}] };`,
},

/* 2 — rArma legge il tempo del pollice: e' la guardia vera e propria */
{
  nome: '2/3 rArma: la soglia legge «posato» e non crolla al ri-armo',
  cerca:
`  /* R_ARMA CRESCE CON LA TENUTA. Una carica di tiro puo' durare 1,25 s
     (SHOT_HARDCAP), e in 1,25 s un pollice appoggiato rotola: la soglia
     che a inizio gesto e' 22 px arriva a 36 px dopo 0,6 s, cosi' il
     rotolamento non arma da solo un verbo che nessuno ha chiesto. */
  rArma(a){
    return this.R_ARMA_0 + (this.R_ARMA_1-this.R_ARMA_0)*Math.min(1, a.tenuta/this.ARMA_PIENA);
  },`,
  metti:
`  /* R_ARMA CRESCE COL TEMPO DEL POLLICE SUL VETRO. Una carica di tiro
     puo' durare 1,25 s (SHOT_HARDCAP), e in 1,25 s un pollice appoggiato
     rotola: la soglia che a inizio gesto e' 22 px arriva a 36 px dopo
     0,6 s, cosi' il rotolamento non arma da solo un verbo che nessuno
     ha chiesto.
     LEGGE «posato», NON «tenuta», ED E' LA GUARDIA DEL RI-ARMO. Il
     ri-armo azzera la tenuta a ragione (la tenuta di un verbo non e' la
     tenuta di un altro), ma azzerando anche la soglia la faceva
     CROLLARE da 36 a 22 px proprio quando il pollice era giu' da piu'
     tempo — l'istante in cui il progetto la voleva piu' alta. Misurato
     (fuori/_crit/X34.txt X3; strumenti/_q-riarmo.js): il dito che
     tornava al punto di posa dopo una deriva di 30-32 px armava il
     verbo nuovo nella direzione della correzione — scivolate e raddoppi
     mai chiesti, 20 su 20 al banco — e con questa riga 0 su 20, mentre
     il trascinamento voluto di 60 px arma ancora, subito, 8 su 8.
     Per gli atti mai ri-armati posato==tenuta: qui non cambia un bit. */
  rArma(a){
    return this.R_ARMA_0 + (this.R_ARMA_1-this.R_ARMA_0)*Math.min(1, a.posato/this.ARMA_PIENA);
  },`,
},

/* 3 — il passo: il tempo del pollice avanza sempre */
{
  nome: '3/3 passo: «posato» avanza sempre, «tenuta» solo da vivo',
  cerca:
`      if(!a.morto) a.tenuta+=dt;`,
  metti:
`      /* il tempo del pollice avanza SEMPRE, anche su un atto morto: il
         dito e' fisicamente giu' e continua a rotolare. Quello del verbo
         avanza solo da vivo, com'era. (Il fotogramma del ri-armo salta
         entrambi col suo continue: un sessantesimo, ininfluente.) */
      a.posato+=dt;
      if(!a.morto) a.tenuta+=dt;`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-riarmo.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.riarmo.html';
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
/* dopo la sostituzione: il campo nuovo esiste dove deve, e la vecchia
   lettura della soglia non esiste piu' da nessuna parte */
const attesi = [
  ['tenuta:0, posato:0, morto:false', 1],
  ['a.posato+=dt;', 1],
  ['a.posato/this.ARMA_PIENA', 1],
  ['a.tenuta/this.ARMA_PIENA', 0],
  ['if(!a.morto) a.tenuta+=dt;', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
