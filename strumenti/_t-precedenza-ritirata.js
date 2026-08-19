/* =====================================================================
   _t-precedenza-ritirata.js — LA CURA SBAGLIATA, TENUTA APPOSTA.

   Questa toppa applica il SECONDO ancoraggio dell'EDIZIONE 1 di
   _t-precedenza.js: quello che un critico ha misurato e bocciato, e che
   e' stato ritirato. Non serve a riparare niente. Serve a una cosa sola,
   che e' la regola di casa numero uno rovesciata: UN BANCO CHE NON SA
   DIRE DI NO NON SA DIRE DI SI'.

   Il difetto che introduce, misurato dal critico e riprodotto da
   strumenti/_z-precedenza.js (prova C):
     · un contatto fermo A SINISTRA del pollice in corsa RUBA la levetta
       (id, origine, dx e dy passano al dito nuovo);
     · il comando del pollice si spegne;
     · quando quel dito si alza parte un Touch5.release con hist di
       lunghezza 1, cioe' velocita' zero, cioe' un doPass: il pallone se
       ne va.

   COME SI USA. Si costruisce il file rovinato e lo si da' in pasto al
   banco: se il banco lo dichiara verde, il banco e' rotto e il verde che
   da' alla toppa buona non vale niente.

     node strumenti/_t-precedenza-ritirata.js --a fuori/ritirata.html
     node strumenti/_z-precedenza.js --gioco fuori/ritirata.html --soloBCD
        -> DEVE uscire NO, con «levetta rubata» e «gesti fantasma» > 0.

   Non ha --dentro. Non si scrive nel gioco una toppa ritirata.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const DA = path.resolve(arg('da', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const A = arg('a', null);

const VECCHIO =
`    const s=this.stick[t];
    if(s.active) return;
    s.active=true; s.id=id; s.ox=x; s.oy=y; s.dx=0; s.dy=0;
    s.riadotta=null;`;

const NUOVO =
`    const s=this.stick[t];
    /* CURA RITIRATA — la levetta si puo' togliere, ma solo verso il lato
       del movimento. Misurata come regressione: ruba la levetta a un
       pollice in corsa e, all'alzarsi del ladro, regala il pallone.
       Sta qui solo perche' il banco possa dimostrare di saperla vedere. */
    if(s.active){
      const aDestra = (G.mode===2) ? (t===1) : true;
      if(aDestra ? !(x<s.ox) : !(x>s.ox)) return;
    }
    s.active=true; s.id=id; s.ox=x; s.oy=y; s.dx=0; s.dy=0;
    s.riadotta=null;`;

if (!A) { console.error('FALLITO: manca --a <destinazione>. Questa toppa non ha --dentro.'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }
let src = fs.readFileSync(DA, 'utf8');
const n = src.split(VECCHIO).length - 1;
if (n !== 1) { console.error(`FALLITO: ancoraggio trovato ${n} volte, non 1. Non scrivo niente.`); process.exit(1); }
if (src.includes(NUOVO)) { console.error('FALLITO: risulta gia\' applicata.'); process.exit(1); }
src = src.split(VECCHIO).join(NUOVO);
const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
console.log('toppa RITIRATA applicata (serve solo a far fallire il banco): ' + dest);
