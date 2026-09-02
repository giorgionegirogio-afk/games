/* =====================================================================
   _t-contrasto-specchio.js — LA GUARDIA SPECCHIATA (voce #88, correzione
   del compito 4, rilievo IMPORTANTE 2 della revisione, 2 settembre 2026).

   IL DIFETTO TROVATO. grandeSpento (dentro touchBtnLayout) usava
   puoContrastare(ctrlPlayer(t)) per decidere se il disco grande si
   spegne. Ma l'azione che parte DAVVERO premendo il disco grande e'
   doSlide(t,'premi'), la cui guardia e' — per dichiarazione del suo
   stesso commento — «le stesse condizioni che puoContrastare chiede
   alla scivolata, MENO LA CARICA». puoContrastare rifiuta anche con
   una carica aperta (p.charge>=0 && p.chargeGo); doSlide('premi') no.

   LA FINESTRA VERA: durante l'anticipo di una scivolata trascinata
   (startSlide -> anticipa(p,'scivolata',...), chargeGo=lanciaScivolata,
   60-100 ms) puoContrastare torna falso, quindi grandeSpento diventava
   vero e il disco si spegneva — ma un contrasto in piedi era ancora
   lecito: una cella spenta che nasconde un atto possibile, esattamente
   il difetto che questa voce cura, girato dall'altra parte.

   LA CURA: la guardia di doSlide(t,'premi') si estrae in una funzione
   pura di primo livello, puoContrastoPremuto(p), sotto i 2.000
   caratteri. doSlide E grandeSpento la leggono tutti e due: la verita'
   vive in un posto solo e non puo' piu' divergere. Nessuna modifica al
   comportamento di doSlide (stessa condizione, solo estratta); l'unico
   comportamento che cambia e' grandeSpento, che adesso specchia
   l'azione vera invece di una guardia piu' severa.

   uso:  node strumenti/_t-contrasto-specchio.js --out fuori/specchio.html
         node strumenti/_t-contrasto-specchio.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/specchio.html'));

const ANCORE = [

/* 1 — la guardia vera nasce come funzione di primo livello, e doSlide la usa */
{
  nome: '1/3 puoContrastoPremuto nasce, doSlide la usa',
  cerca:
`function doSlide(t, fase, L){
  const p=ctrlPlayer(t);
  if(!p) return;
  if(fase==='premi'){
    /* un corpo a terra, espulso o gia' impegnato non contrasta: sono le
       stesse condizioni che puoContrastare chiede alla scivolata, meno
       la carica — una carica di tiro aperta non impedisce di stendere il
       piede, e non c'e' niente da chiudere perche' qui non si prepara
       nessun gesto. */
    if(p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0){`,
  metti:
`/* LA GUARDIA VERA DELL'AZIONE CHE PARTE PREMENDO CONTRASTA (voce #88,
   correzione del compito 4, 2 settembre 2026 - la revisione ha trovato
   che grandeSpento era piu' severo dell'azione vera). Le stesse
   quattro condizioni di puoContrastare, MENO la carica: una carica di
   tiro aperta non impedisce di stendere il piede, e non c'e' niente da
   chiudere perche' qui non si prepara nessun gesto. Estratta perche'
   grandeSpento (touchBtnLayout) deve essere lo SPECCHIO ESATTO di
   QUESTA guardia, non di puoContrastare che e' piu' severa: durante la
   finestra di anticipo di una scivolata trascinata (startSlide ->
   anticipa, chargeGo=lanciaScivolata, 60-100 ms) puoContrastare
   tornava falso e il disco si spegneva, ma un contrasto in piedi
   restava lecito — una cella spenta che nasconde un atto possibile, il
   difetto stesso che questa voce cura, girato dall'altra parte. Nome
   nuovo, ma di primo livello e sotto i 2.000 caratteri: _q-precedenza
   lo estrae da sola, nessuna modifica al banco. */
function puoContrastoPremuto(p){
  return !!(p && !(p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0));
}
function doSlide(t, fase, L){
  const p=ctrlPlayer(t);
  if(!p) return;
  if(fase==='premi'){
    /* la guardia vive in puoContrastoPremuto, qui sopra: una sola copia,
       letta anche da touchBtnLayout per calcolare grandeSpento, cosi'
       la verita' non puo' piu' divergere fra le due. */
    if(!puoContrastoPremuto(p)){`,
},

/* 2 — il commento sopra touchBtnLayout non promette piu' "nessun nome nuovo" */
{
  nome: '2/3 il verbale dichiara il nome nuovo e perche\' e\' sicuro',
  cerca:
`     Nessun nome nuovo entra qui: puoContrastare e ctrlPlayer sono gia'
     in casa e gia' estratte da _q-precedenza.`,
  metti:
`     PUOCONTRASTOPREMUTO E' NOME NUOVO (correzione del 2 settembre
     2026): grandeSpento usava puoContrastare, che e' PIU' SEVERA
     dell'azione vera premuta sul disco grande (doSlide(t,'premi') non
     controlla la carica). La revisione ha misurato la divergenza:
     nella finestra di anticipo di una scivolata trascinata
     puoContrastare torna falso mentre un contrasto in piedi resta
     lecito, e il disco si spegneva su un atto possibile. Ora
     grandeSpento specchia la guardia VERA, estratta in
     puoContrastoPremuto (sopra doSlide) e usata da tutte e due le
     parti. E' un nome nuovo ma di primo livello e sotto i 2.000
     caratteri: _q-precedenza lo tira dentro da sola, nessuna modifica
     al banco.`,
},

/* 3 — grandeSpento specchia la guardia vera */
{
  nome: '3/3 grandeSpento specchia puoContrastoPremuto',
  cerca:
`  const grandeSpento = !tira && !puoContrastare(ctrlPlayer(t));`,
  metti:
`  const grandeSpento = !tira && !puoContrastoPremuto(ctrlPlayer(t));`,
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
/* CONTEGGI A DELTA (come in _t-cella-spenta.js): il file arriva qui con
   altri compiti della voce #88 gia' dentro, e «voce #88» compare gia'
   piu' volte nei commenti prima di questo attrezzo. Il conteggio giusto
   e' quanto CRESCE dal file di partenza a quello curato. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['function puoContrastoPremuto(p){', 1],
  ['if(!puoContrastoPremuto(p)){', 1],
  ['!puoContrastoPremuto(ctrlPlayer(t))', 1],
  ['voce #88', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
