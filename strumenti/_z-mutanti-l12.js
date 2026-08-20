/* =====================================================================
   _z-mutanti-l12.js — ATTREZZO DEL CRITICO, non della toppa.

   Prende fuori/l12.html (la copia toppata) e ne rompe UNA cosa sola per
   volta, in modo chirurgico. Serve a rispondere alla domanda 2 del
   collaudo avversario: «il cancello _q-l12.js sa fallire, o e' una
   decorazione?». Un cancello che resta verde su un gioco rotto apposta
   non misura niente.

   Ogni mutante dichiara QUALE prova del cancello dovrebbe diventare
   rossa. Se non diventa rossa, la prova e' decorativa.

   uso:
     node strumenti/_z-mutanti-l12.js --elenco
     node strumenti/_z-mutanti-l12.js --m M1 --out fuori/_m1.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };

const MUT = {
  /* la mira torna a rifarsi sul pallone: il dito non comanda piu' */
  M1: { attesa: 'D',
        cerca: `  if(!p.slideMirata && bl>1 && bl<200){ nx=bx/bl; ny=by/bl; }`,
        metti: `  if(bl>1 && bl<200){ nx=bx/bl; ny=by/bl; }` },
  /* il contenimento non rallenta piu' */
  M2: { attesa: 'B (velocita\')',
        cerca: `const JOCKEY_V      = 0.62;   // fattore di velocita' di chi contiene`,
        metti: `const JOCKEY_V      = 1.00;   // MUTANTE: nessun rallentamento` },
  /* il contenimento non gira piu' la faccia sul portatore */
  M3: { attesa: 'B (angolo)',
        cerca: `    if(portato){ const dx=portato.x-p.x, dy=portato.y-p.y, dl=len(dx,dy); if(dl>1){ tfx=dx/dl; tfy=dy/dl; } }`,
        metti: `    if(false){ }` },
  /* il rilascio scivola anche senza trascinamento armato */
  M4: { attesa: 'C ed E',
        cerca: `        if(tras && tras.armato) doSlide(bt.t,'scivola',tras);`,
        metti: `        if(tras) doSlide(bt.t,'scivola',tras);` },
  /* touchcancel torna a valere come touchend */
  M5: { attesa: 'G',
        cerca: `      const tras = (bt.act==='slide' && !annulla && a && !a.morto && !G.paused)`,
        metti: `      const tras = (bt.act==='slide' && a && !a.morto && !G.paused)` },
  /* la pressione torna a mandare il corpo a terra */
  M6: { attesa: 'A e A2',
        cerca: `    p.contrasto=CONTRASTO_FIN;
    contrastoPasso(p);
    return;`,
        metti: `    p.contrasto=CONTRASTO_FIN;
    contrastoPasso(p);
    startSlide(p, p.fx, p.fy);
    return;` },
  /* il contrasto non riesce mai: il dito non compra piu' niente */
  M7: { attesa: 'A (conquiste col dito)',
        cerca: `  if(Math.random()>=sp){ p.kickCd=CONTRASTO_CD; return 'fallito'; }`,
        metti: `  if(true){ p.kickCd=CONTRASTO_CD; return 'fallito'; }` },
  /* la spazzata va verso la propria porta invece che via */
  M8: { attesa: 'F',
        cerca: `    kickBall(p, nx/l, ny/l, SPAZZ_V, 0);`,
        metti: `    kickBall(p, -nx/l, -ny/l, SPAZZ_V, 0);` },
  /* la finestra del contrasto non scorre piu': resta aperta per sempre */
  M9: { attesa: 'nessuna (controllo: mutante che il cancello NON vede)',
        cerca: `  if(p.contrasto>0) p.contrasto=Math.max(0,p.contrasto-dt);`,
        metti: `  if(p.contrasto>0) p.contrasto=Math.max(0,p.contrasto-dt*0.001);` },
};

if (process.argv.includes('--elenco')) {
  for (const k in MUT) console.log(k + '  -> attesa rossa: ' + MUT[k].attesa);
  process.exit(0);
}
const id = arg('m', '');
if (!MUT[id]) { console.error('FALLITO: mutante sconosciuto ' + id); process.exit(1); }
const inFile = path.resolve(arg('in', path.join(RADICE, 'fuori/l12.html')));
const outFile = path.resolve(arg('out', path.join(RADICE, 'fuori/_mut-' + id + '.html')));
const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(MUT[id].cerca).length - 1;
if (n !== 1) { console.error('FALLITO: l\'ancoraggio di ' + id + ' compare ' + n + ' volte'); process.exit(1); }
fs.writeFileSync(outFile, src.replace(MUT[id].cerca, MUT[id].metti));
console.log('OK ' + id + ' -> ' + outFile + '   (attesa rossa: ' + MUT[id].attesa + ')');
