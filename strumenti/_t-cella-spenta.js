/* =====================================================================
   _t-cella-spenta.js — LA CELLA SI SPEGNE INVECE DI TRAVESTIRSI
   (compito 4 della voce #88, 2 settembre 2026).

   LA LEGGE, dal progetto approvato: un disco che non puo' produrre
   niente NON diventa un altro verbo. Resta al suo posto, attenuato, e
   la pressione non apre nulla. E' il modello del paragone — la sua
   pulsantiera e' una griglia fissa che si MASCHERA cella per cella e si
   RIETICHETTA, e le posizioni non si muovono mai.

   IL VERBALE DEL GIOCO LO CHIEDEVA GIA': sopra touchBtnLayout sta
   scritto che con l'uomo a terra «il disco grande mostra CONTRASTA
   perche' altre etichette non ce ne sono... ripararlo vuol dire un
   disco SPENTO, cioe' interfaccia nuova». Eccola.

   DUE SOLI CASI, e sono quelli misurati:
   1) il disco grande quando nessun verbo e' possibile (uomo a terra o
      in rialzo: ne' tiro ne' contrasto aprono niente);
   2) PRESSA senza portatore avversario da raddoppiare — offerto per il
      91-98% del volo di un nostro cross e rifiutato a ogni pressione
      (147 fotogrammi morti misurati dal banco del volo, prova E).

   COSA NON SI TOCCA: l'ordine e la lunghezza dell'elenco dei dischi
   (e' il contratto su cui il ri-armo rilegge il disco per indice), le
   posizioni, le etichette.

   uso:  node strumenti/_t-cella-spenta.js --out fuori/cella.html
         node strumenti/_t-cella-spenta.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/cella.html'));

const ANCORE = [

/* 1 — le due condizioni, accanto alle capacita' gia' calcolate */
{
  nome: '1/5 le due condizioni di cella spenta',
  cerca:
`  const tira = puoTirare(t), passa = puoPassare(t), scudo = puoScudo(t);`,
  metti:
`  const tira = puoTirare(t), passa = puoPassare(t), scudo = puoScudo(t);
  /* LA CELLA SPENTA (voce #88, 2 settembre 2026). Il verbale qui sopra
     dichiarava il caso e la sua cura: «ripararlo vuol dire un disco
     SPENTO, cioe' interfaccia nuova». Due condizioni, non una di piu':
     il disco grande quando NESSUN verbo e' possibile (ne' tiro ne'
     contrasto: uomo a terra, in rialzo, in rovesciata), e PRESSA quando
     non c'e' nessun portatore avversario da raddoppiare — la stessa
     guardia che comandaPressa applica al momento del rifiuto, portata
     dove il dito la puo' VEDERE invece di scoprirla premendo.
     Nessun nome nuovo entra qui: puoContrastare e ctrlPlayer sono gia'
     in casa e gia' estratte da _q-precedenza.
     G.BALL PUO' ESSERE NULL, E NON E' UN CASO DI LABORATORIO (misurato
     il 2 settembre 2026 con Playwright sul file curato: la pagina non
     arrivava mai a definire __test). G.ball nasce null (vedi l'oggetto
     G) e resta tale finche' non parte la prima partita; ma
     touchBtnLayout gira anche prima, dal refreshImpostUI() lanciato ad
     ogni avvio per scrivere i tre numeri misurati della pagina comandi
     (misurePollice). Senza la guardia «G.ball &&» qui sotto, quella
     riga da sola bastava a impedire il caricamento del gioco. */
  const carrOra = (G.ball && G.ball.owner>=0) ? G.players[G.ball.owner] : null;
  const pressaViva = !!(carrOra && carrOra.team!==t && carrOra.out<=0);
  const grandeSpento = !tira && !puoContrastare(ctrlPlayer(t));`,
},

/* 2 — il disco grande porta il campo */
{
  nome: '2/5 il disco grande si spegne',
  cerca:
`    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60,  r:40 },`,
  metti:
`    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60,  r:40, off:grandeSpento },`,
},

/* 3 — PRESSA si spegne senza nessuno da raddoppiare */
{
  nome: '3/5 PRESSA si spegne',
  cerca:
`    passa ? { act:'pass',    label:'PASSA',     x:bx+s*52,  y:VH-148, r:26 }
          : { act:'press',   label:'PRESSA',    x:bx+s*52,  y:VH-148, r:26 },`,
  metti:
`    passa ? { act:'pass',    label:'PASSA',     x:bx+s*52,  y:VH-148, r:26 }
          : { act:'press',   label:'PRESSA',    x:bx+s*52,  y:VH-148, r:26, off:!pressaViva },`,
},

/* 4 — la pressione su una cella spenta non produce niente */
{
  nome: '4/5 la pressione su una cella spenta e\' inerte',
  cerca:
`      if(uPresa<=1){
        const bt=preso;
        this.btnTouch[id]={t,act:bt.act};`,
  metti:
`      /* LA CELLA SPENTA NON RISPONDE (voce #88, 2 settembre 2026): il
         dito si posa e non succede niente — nessun atto nasce, nessuna
         carica si apre, e il disco non viene nemmeno registrato come
         premuto. Non e' un rifiuto VISIBILE come quello di L3.1: quello
         resta, e serve al caso opposto — cella ACCESA e corpo che non
         ce la fa (a terra, in rialzo), dove il dito ha chiesto una cosa
         lecita e merita di sapere che il corpo ha detto no. Qui invece
         il disco dichiarava gia' di essere spento: chi lo preme ha gia'
         avuto la sua risposta guardandolo. */
      if(uPresa<=1 && preso && preso.off) return;
      if(uPresa<=1){
        const bt=preso;
        this.btnTouch[id]={t,act:bt.act};`,
},

/* 5 — il disegno: la cella spenta si vede spenta */
{
  nome: '5/5 la pastiglia spenta si dipinge attenuata',
  cerca:
`      const aPas=pressed?1:velaPastiglia(bx0,by0,bt.r);`,
  metti:
`      /* LA CELLA SPENTA SI VEDE (voce #88): un disco che non puo'
         produrre niente si dipinge attenuato, cosi' il dito sa PRIMA di
         premere invece di scoprirlo dopo. Non si sposta, non cambia
         nome, non cambia posto: cambia solo quanto e' acceso. */
      const aPas=(pressed?1:velaPastiglia(bx0,by0,bt.r)) * (bt.off?0.42:1);`,
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
/* CONTEGGI A DELTA, NON ASSOLUTI (correzione del 2 settembre 2026). Il
   file del gioco arriva qui con altri cinque compiti della voce #88 gia'
   dentro (1, 2, 3, 5, 6), e ognuno lascia le sue righe «voce #88» nei
   commenti: il file di oggi ne porta gia' 5 PRIMA di questo attrezzo.
   Un conteggio assoluto («deve comparire 3 volte in tutto il file») era
   vero solo il giorno in cui questo attrezzo fu scritto su un file senza
   quelle tracce, e la corsa vera lo dichiarava rotto (8 trovate, 3
   attese) pur avendo applicato i cinque ancoraggi giusti — un rosso per
   la ragione sbagliata. Il conteggio giusto e' quanto CRESCE dal file di
   partenza a quello curato: le stringhe nuove (pressaViva, grandeSpento,
   off:grandeSpento, off:!pressaViva, l'alfa attenuata) partono da zero e
   il delta coincide col totale come prima; «voce #88» no, e solo per lei
   il delta e' la misura che regge indipendentemente da quanti compiti
   sono gia' entrati. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['const pressaViva =', 1],
  ['const grandeSpento =', 1],
  ['off:grandeSpento', 1],
  ['off:!pressaViva', 1],
  ['(bt.off?0.42:1)', 1],
  ['voce #88', 3],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
