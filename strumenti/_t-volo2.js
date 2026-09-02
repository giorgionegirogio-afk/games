/* =====================================================================
   _t-volo2.js — LA CARICA SI APRE DURANTE IL VOLO (voce #88)

   LA DIAGNOSI: puoTirare(t) dice si' anche col pallone nostro in volo,
   fuori dal raggio di calcio (voce #88, compito 2). Ma startCharge non
   lo sa ancora: appena fuori da KICK_R*1,4 devia sempre su
   tentaRovesciata(p) e torna, senza mai aprire p.charge. La domanda
   "posso tirare?" e l'atto "si apre la carica" erano rimasti due
   proposizioni diverse — misurato 2 settembre 2026, _q-volo.js prova D,
   0 volee su un volo intero di cross nostro con TIRA tenuto premuto.

   LA CURA: dentro lo stesso ramo, si prova PRIMA la rovesciata (la
   finestra e' stretta e temporanea: se e' aperta, vince lei — e' il
   verbo piu' spettacolare del gioco, voce #88). Solo se la finestra
   della rovesciata e' CHIUSA si apre la carica del tiro, esattamente
   come fa gia' il ramo "a terra" subito sotto (stesso identico
   p.charge/p.chargeKind/p.chargeT/p.chargeGo/p.chargeClip, niente di
   nuovo inventato qui). Da li' in poi decide il CONTATTO: updateBall
   sa gia' trasformare una carica 'tiro' tenuta con la palla alta e
   veloce in una volee (cerca «TIRO AL VOLO»); qui si apre solo la
   porta.

   PERCHE' LA PRECEDENZA E' L'UNICA COSA CHE CONTA: se si invertisse
   l'ordine (carica prima, rovesciata come else) una palla che rientra
   nella finestra della rovesciata mentre la carica e' gia' aperta non
   la troverebbe mai piu' — la carica avrebbe gia' vinto il turno.
   Tenendo la rovesciata come primo if con return, la finestra resta
   sempre il primo giudice: se e' aperta, esce lei; se e' chiusa, tocca
   alla carica. _q-l12 (le 9 prove sulla rovesciata) e _q-precedenza
   restano il banco di controllo dopo questa modifica.

   LEGGE DEI SORTEGGI: ne' finestraRovesciata ne' l'apertura della
   carica chiamano dado(); zero sorteggi nuovi.

   uso:  node strumenti/_t-volo2.js --out fuori/volo2.html
         node strumenti/_t-volo2.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/volo2.html'));

const ANCORE = [

/* 1 — startCharge: la rovesciata prima, poi la carica */
{
  nome: '1/1 startCharge: la rovesciata prima, poi la carica',
  cerca:
`  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
    /* TIRA con la palla ALTA che scende nella finestra: e' la rovesciata
       (decisione 1 di AZIONI.md — stesso tasto, contesto diverso).
       La finestra non si richiede qui: puoTirare l'ha gia' chiesta, ed
       e' l'unico modo di arrivare a questo ramo. */
    tentaRovesciata(p);
    return;
  }`,
  metti:
`  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
    /* TIRA con la palla ALTA che scende nella finestra: e' la rovesciata
       (decisione 1 di AZIONI.md — stesso tasto, contesto diverso).
       LA ROVESCIATA HA LA PRECEDENZA e si prova per prima: e' il verbo
       spettacolare del gioco e non deve perderla (voce #88). */
    if(finestraRovesciata(p)){ tentaRovesciata(p); return; }
    /* PALLA NOSTRA IN VOLO: si apre la carica del TIRO, e sara' il
       CONTATTO a decidere che gesto esce — tiro fermo se la palla e' a
       terra, volee' se arriva alta e veloce (updateBall lo sa gia' fare:
       cerca «TIRO AL VOLO»). E' il modello del paragone: il tiro di
       prima non e' un pulsante, e' un tipo di contatto. Se la palla non
       e' nostra o e' fuori portata, puoTirare ha gia' detto no e qui non
       si arriva. */
  }`,
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
const attesi = [
  ['if(finestraRovesciata(p)){ tentaRovesciata(p); return; }', 1],
  ['    tentaRovesciata(p);\n    return;\n  }', 0],   // il vecchio ramo secco e' morto
  /* 'voce #88' conta 3 nel file intero: 2 gia' scritte dal compito 2
     dentro puoTirare (righe 14033 e 14046, mai toccate qui) piu' 1 nuova
     aggiunta da questo attrezzo dentro startCharge. Non e' 1: il brief
     lo presumeva su un file pulito, ma qui il compito 2 e' gia' passato. */
  ['voce #88', 3],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
