/* =====================================================================
   _crit-guasto-mani.js — IL CANCELLO _q-mani.js SA FALLIRE?

   Il suo rosso dimostrato (--bugiardo) sostituisce il CORPO delle tre
   pose con quello dell'attesa: la geometria crolla su tutti i
   fotogrammi e V1/V2/V3 diventano rossi. Giusto, ma copre un solo
   modo di mentire.

   QUESTO GUASTO E' PIU' FURBO, e prende di mira il buco vero: V1, V2 e
   V3 giudicano il fotogramma MIGLIORE della finestra (il codice cerca
   il massimo di un punteggio su 24 fotogrammi). Allora si costruisce un
   gioco in cui la prima META' del gesto e' l'ATTESA — cioe' esattamente
   i fotogrammi che il fermo immagine del colpo (gelo 0,055 s) tiene
   davanti agli occhi — e la seconda meta' e' il gesto vero.
   Il nome della clip non cambia, quindi V4 resta verde; il fotogramma
   migliore non cambia, quindi V1/V2/V3 restano verdi. Il gioco NON ha
   riparato l'istante che si guarda, e il cancello lo timbra.

   uso: node strumenti/_crit-guasto-mani.js [--gioco fuori/anim-seconda.html]
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n,d)=>{const i=process.argv.indexOf('--'+n);return i>0&&process.argv[i+1]&&!process.argv[i+1].startsWith('--')?process.argv[i+1]:d;};
const GIOCO = path.resolve(arg('gioco', path.join(RADICE,'fuori/anim-seconda.html')));
const OUT = path.join(RADICE, 'fuori', '_guasto-mani-primo.html');

let s = fs.readFileSync(GIOCO, 'utf8');
/* le soglie sono le fasi di PARTENZA di rigStato (0,24 / 0,12 / 0,10)
   piu' un capello: coprono ESATTAMENTE i fotogrammi che il fermo
   immagine tiene, dove la fase non avanza, e nient'altro. Il fotogramma
   migliore di ogni clip (u = 0,373 / 0,206 / 0,434) resta intatto. */
const ANCORE = [
  ['function posePugni(u){',    'function posePugni(u){\n  if(u<0.25){ poseAttesaGK(0); return; }'],
  ['function poseRespinta(u){', 'function poseRespinta(u){\n  if(u<0.13){ poseAttesaGK(0); return; }'],
  ['function poseSfugge(u){',   'function poseSfugge(u){\n  if(u<0.11){ poseAttesaGK(0); return; }'],
];
for (const [a, b] of ANCORE) {
  if (s.split(a).length - 1 !== 1) { console.error('FALLITO: ancoraggio non unico: ' + a); process.exit(1); }
  s = s.replace(a, b);
}
if (s.split('function poseAttesaGK(').length - 1 !== 1) { console.error('FALLITO: poseAttesaGK non trovata'); process.exit(1); }
fs.writeFileSync(OUT, s);
console.log('guasto scritto: ' + OUT);
console.log('  la prima META\' di ogni gesto (u<0,60) disegna l\'ATTESA; il nome della clip NON cambia.');
console.log('  adesso:  node strumenti/_q-mani.js --gioco fuori/_guasto-mani-primo.html');
