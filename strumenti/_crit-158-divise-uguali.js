/* _crit-158-divise-uguali.js — IL FALSO che condanna il cancello `divise`
   sugli sprite (voce #158). Costruisce, dalla copia con la toppa, un gioco
   bugiardo in cui Sprite3D tinge OGNI maglia dello stesso rosso qualunque
   sia la squadra: sullo schermo ventidue uomini vestiti uguali, nello
   stato due kit diversi — lo stesso buco che il #151 aveva trovato
   nell'atlante. Se `_q-divise.js` dice OK anche su questo, il cancello
   con la maschera degli sprite ATTESTA e non misura; deve dire ROSSO.
   Caso peggiore scelto apposta: i calzoncini restano della seconda tinta
   di ciascuna squadra, quindi una parte dei pixel e' ancora diversa —
   un falso piu' gentile (tutto uguale) sarebbe troppo facile da prendere.
   USO: node strumenti/_crit-158-divise-uguali.js   (poi)
        node strumenti/_q-divise.js --gioco fuori/sprite/CALCETTO-crit-divise.html   -> atteso ROSSO */
const fs = require('fs');
const DA = 'fuori/sprite/CALCETTO-sprite.html', A = 'fuori/sprite/CALCETTO-crit-divise.html';
let s = fs.readFileSync(DA, 'utf8');
const anc = "const c1=look.maglia||'#ffffff', c2=look.maglia2||c1, cp=look.pantaloncini||c2, dis=look.disegno||'tinta';";
const n = s.split(anc).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte'); process.exit(1); }
s = s.replace(anc, "const c1='#c62828', c2='#c62828', cp=look.pantaloncini||c2, dis='tinta'; /* FALSO 158: tutte le maglie rosse */");
fs.writeFileSync(A, s);
console.log('falso scritto: ' + A);
