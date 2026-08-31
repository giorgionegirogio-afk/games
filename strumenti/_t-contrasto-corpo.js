/* =====================================================================
   _t-contrasto-corpo.js — IL PIEDE TESO SI VEDE (29 agosto 2026).

   LA DIAGNOSI. Il contrasto in piedi e' un verbo vero del gioco: il
   dito si posa sul disco, `doSlide(t,'premi')` accende
   `p.contrasto = CONTRASTO_FIN` (0,18 s) e per tutta quella finestra
   `contrastoPasso` puo' rubare il pallone entro KICK_R (26 unita'), con
   il 42% di base, x0,55 se lo insegui da dietro e x1,8 se gli sei
   davanti. Il gioco lo insegna anche nella schermata dei comandi:
   «premi CONTRASTA: piede teso, subito e in piedi».

   E IL CORPO NON FA NIENTE. `rigStato` — le 140 righe che scelgono la
   posa — non contiene la parola «contrasto»: zero occorrenze fra la
   31712 e la 31852. Il cronometro `p.contrasto` viene acceso (14961),
   viene decrementato (16106) e non viene MAI letto da chi disegna.
   Quindi chi preme il disco vede la sua figura continuare a correre
   mentre il pallone cambia proprietario. Un verbo che si esegue senza
   che il corpo lo dica e' un verbo che il giocatore non impara: il
   gioco ha gia' `rifiutoVerbo` per far vedere il NO — questa patch fa
   vedere il SI'.

   LA CURA e' quasi gratis, perche' il cronometro c'era gia':
     1. poseContrasto(u): l'affondo. Il piede teso arriva a 0,664 unita'
        rig davanti al bacino, che su KICK_R = 26 e' la distanza giusta.
     2. CLIPS.contrasto: la registra.
     3. rigStato la legge, e la legge DOPO il ramo del calcio — vedi
        sotto, e' una scelta con una ragione.

   PERCHE' DOPO IL CALCIO E NON PRIMA. `contrastoPasso` ha un ramo che
   CALCIA davvero: la spazzata (pallone di nessuno, nel proprio terzo).
   Quel ramo chiama `kickBall`, che accende kickT/kickB e scrive
   kickClip. Se il ramo del contrasto stesse prima, una spazzata
   mostrerebbe l'affondo invece del calcio — cioe' la posa sbagliata,
   di nuovo. Messo dopo, ogni caso finisce dove deve:
     spazzata            -> kickT acceso -> clip di calcio
     furto riuscito      -> nessun calcio -> clip di contrasto
     tentativo fallito   -> nessun calcio -> clip di contrasto
   Anche il fallimento si vede, ed e' giusto che si veda: il difensore
   ha steso il piede e non ha preso niente.

   LA GEOMETRIA, e qui c'e' la cosa che vale per ogni posa futura.
   La prima stesura mandava il piede destro a **13 centimetri sotto il
   manto**. Non per un numero sbagliato: per una FASATURA sbagliata. Il
   bacino scendeva insieme alla gamba, e a meta' strada la gamba era
   ancora quasi verticale e semi-tesa — proiezione 0,847 — mentre il
   bacino era gia' a 0,808. Nessuna piega del ginocchio salva quella
   configurazione: provate le gobbe fino a 3,6, il minimo restava
   negativo.
   La soluzione e' una FINESTRA SEPARATA per il bacino: scende 0,18-0,26
   (tardi, quando la gamba e' gia' avanti e la sua proiezione verticale
   e' corta) e risale 0,26-0,50 (presto). Cioe' l'affondo e' un lampo,
   che e' esattamente quello che e': 0,18 secondi.
   Questo e' l'accoppiamento che gamba() ha dichiarato di NON imporre —
   «bacino basso implica ginocchia piegate», scartato perche' sbaglierebbe
   sulla scivolata. Non essendo una legge del motore, va scritto nel
   foglio di ogni posa che abbassa il bacino. Qui e' scritto.

   VERIFICATO A MANO PRIMA DEL BANCO, su 2048 fasi x 4 corporature:
     tagli della scatola degli angoli   0
     piede destro piu' basso            +0,0343   (manto a 0,012)
     piede sinistro piu' basso          +0,0654
     allungo massimo del piede teso      0,664 unita' rig
     tutte le curve tornano al valore di partenza (somme in fondo a ogni riga)

   NON TOCCA LA FISICA: `p.contrasto` esisteva, era gia' acceso e gia'
   decrementato. Questa patch aggiunge solo un lettore. Il banco
   _q-testa.js prova A (stessa partita prima e dopo, impronta campione
   per campione) e' la verifica.

   LIMITE DA SCRIVERE ACCANTO: il contrasto in piedi e' **solo umano** —
   `p.contrasto` lo accende soltanto `doSlide`, che passa da
   `ctrlPlayer`. In CPU contro CPU questa posa non esce MAI, e nessun
   banco a squadre automatiche puo' vederla. Come lo strappo e come lo
   scudo. Per misurarla servono le dita.

   uso:  node strumenti/_t-contrasto-corpo.js --out fuori/contrasto.html
         node strumenti/_t-contrasto-corpo.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/contrasto.html'));

const ANCORE = [

/* 1 — la posa, accanto alla scivolata: sono i due modi di contrastare */
{
  nome: '1/3 poseContrasto',
  cerca:
`function poseRovesciata(u){`,
  metti:
`/* IL CONTRASTO IN PIEDI — l'altro modo di contrastare, quello che non
   va a terra. Sta accanto alla scivolata di proposito: sono i due rami
   dello stesso disco, e chi legge deve trovarli vicini.

   I TRE TEMPI:
     0,04-0,26  AFFONDO   l'anca porta la gamba destra AVANTI (0,10 ->
                          0,95 rad) e il ginocchio si distende (0,55 ->
                          0,25): il piede arriva a 0,664 davanti al
                          bacino. Il busto va INDIETRO (-0,34) — e' il
                          contrappeso vero di chi allunga una gamba.
     0,26       IL PIEDE TOCCA il pallone
     0,26-0,58  SEGUITO   la gamba rientra piegandosi, il corpo si
                          raddrizza
     0,60-0,97  RIENTRO   torna tutto in andatura

   IL BACINO HA UNA FINESTRA SUA (0,18-0,26 giu', 0,26-0,50 su) e non e'
   un dettaglio: e' la sola fasatura in cui il piede non finisce sotto
   il manto. Vedi il conto per esteso in strumenti/_t-contrasto-corpo.js.
   Scende TARDI — quando la gamba e' gia' avanti e la sua proiezione
   verticale si e' accorciata — e risale PRESTO. Un affondo di 0,18 s
   e' un lampo, e cosi' e' disegnato. */
function poseContrasto(u){
  const all = sm(u,0.04,0.26);          // l'affondo
  const seg = sm(u,0.26,0.58);          // il seguito
  const rit = sm(u,0.60,0.97);          // il rientro
  /* il bacino, sfasato apposta: giu' tardi, su presto.
     somma:  -0,25+0,25 = 0  ->  0,93 */
  const bas = sm(u,0.18,0.26), risa = sm(u,0.26,0.50);
  const pelvY = 0.93 - 0.25*bas + 0.25*risa;
  /* busto INDIETRO nell'affondo: il contrappeso di una gamba che va
     avanti. somma: -0,34+0,10+0,24 = 0 */
  const lean = -0.34*all + 0.10*seg + 0.24*rit;
  /* la testa guarda il pallone, cioe' avanti e in basso.
     somma: 0,030-0,018-0,012 = 0 */
  const cenno = 0.030*all - 0.018*seg - 0.012*rit;
  corpo(pelvY,0,lean,cenno);
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* braccia in opposizione, aperte per l'equilibrio.
     somme: 0,55-0,35-0,20 = 0   e   -0,30+0,18+0,12 = 0 */
  const aR = 0.55*all - 0.35*seg - 0.20*rit;
  const aL = -0.30*all + 0.18*seg + 0.12*rit;
  /* gomiti divisi (due flessioni uguali sono una forma sola), e
     entrambi sopra eMin = 0,12+0,29*|out/UA|: con out a 0,20 il minimo
     e' 0,346 e il sinistro non scende sotto 0,45.
     somme: 0,30 +0,50-0,32-0,18 = 0,30   e   0,55 -0,10+0,25-0,15 = 0,55 */
  const eR = 0.30 + 0.50*all - 0.32*seg - 0.18*rit;
  const eL = 0.55 - 0.10*all + 0.25*seg - 0.15*rit;
  /* out massimo 0,20, la gabbia e' 0,222.  somma: 0,06 +0,14-0,08-0,06 = 0,06 */
  const out = 0.06 + 0.14*all - 0.08*seg - 0.06*rit;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, out, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, out,-1);
  const hz=0.06*sl;
  /* LA GAMBA DESTRA E' IL GESTO: anca 0,10 -> 0,95, ginocchio 0,55 ->
     0,25 (quasi teso al contatto). La sinistra fa il contrario — si
     piega sotto il peso (0,40 -> 0,95) — perche' e' quella che regge.
     somme:  0,10 +0,85-0,55-0,30 = 0,10  |  0,55 -0,30+1,05-0,75 = 0,55
            -0,05 -0,30+0,20+0,10 = -0,05 |  0,40 +0,55-0,35-0,20 = 0,40
     Il piede teso non va di lato: apr resta sotto 0,03.  somma: 0 */
  const aGd =  0.10 + 0.85*all - 0.55*seg - 0.30*rit;
  const kGd =  0.55 - 0.30*all + 1.05*seg - 0.75*rit;
  const aGs = -0.05 - 0.30*all + 0.20*seg + 0.10*rit;
  const kGs =  0.40 + 0.55*all - 0.35*seg - 0.20*rit;
  const apr =  0.03*all - 0.02*seg - 0.01*rit;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, hz, aGd,kGd,  HIPW+apr);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, hz, aGs,kGs, -HIPW-apr);
}

function poseRovesciata(u){`,
},

/* 2 — nel catalogo, accanto alla scivolata */
{
  nome: '2/3 CLIPS.contrasto',
  cerca:
`  scivolata: {freq:0.8, pose:poseScivolata},`,
  metti:
`  scivolata: {freq:0.8, pose:poseScivolata},
  /* freq 1,0: in partita la fase e' st.u/freq, e con 1,0 la fase
     disegnata E' quella che rigStato calcola. */
  contrasto: {freq:1.0, pose:poseContrasto},`,
},

/* 3 — rigStato finalmente legge il cronometro che c'era gia'.
       DOPO il ramo del calcio: la spazzata deve restare un calcio. */
{
  nome: '3/3 rigStato legge p.contrasto',
  cerca:
`  /* ---- la carica: anticipa() resta il motore, qui si legge e basta ---- */
  if(p.charge>=0){`,
  metti:
`  /* ---- IL CONTRASTO IN PIEDI, e sta QUI per una ragione ----
     p.contrasto e' un cronometro che esisteva da sempre (CONTRASTO_FIN,
     0,18 s, acceso da doSlide sulla pressione del disco) e che nessuno
     leggeva: il verbo rubava il pallone e il corpo continuava a correre.
     Sta DOPO il ramo del calcio perche' contrastoPasso ha un ramo che
     calcia davvero — la spazzata — e quella deve restare un calcio, non
     diventare un affondo. Chi spazza ha kickT acceso ed e' gia' uscito
     di qua sopra; chi ruba (o chi manca) arriva fin qui.
     La fase parte da 0,26 — il fotogramma in cui il piede tocca — e
     corre a 0,98: quello che sta prima di 0,26 e' la rincorsa, e in
     partita non si vede, perche' il contrasto non ha carica. */
  if(p.contrasto>0){
    st.clip='contrasto';
    st.u = 0.26 + 0.72*clamp(1-p.contrasto/CONTRASTO_FIN,0,1);
    return st;
  }
  /* ---- la carica: anticipa() resta il motore, qui si legge e basta ---- */
  if(p.charge>=0){`,
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
  ['function poseContrasto(u){', 1],
  ['contrasto: {freq:1.0, pose:poseContrasto},', 1],
  ["st.clip='contrasto';", 1],
  ['p.contrasto/CONTRASTO_FIN', 1],
  // poseRovesciata non deve essere stata duplicata dall'inserimento
  ['function poseRovesciata(u){', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
