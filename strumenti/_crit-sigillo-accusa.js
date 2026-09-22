/* =====================================================================
   _crit-sigillo-accusa.js — L'INNOCENTE ACCUSATO DA UNA FINESTRA
   (voce #134, compito 2). Il falso che condanna la prova C3 di
   `_q-sigillo.js`, ed e' il piu' importante dei cinque.

   CHE COSA FALSIFICA, e perche' e' proprio l'errore che si farebbe: a
   fine replay il gioco confronta il punteggio uscito con quello
   dichiarato, e se non coincide scrive NON TORNA. Punto. Niente
   distinzione fra «la rigiocata non torna» e «questa rigiocata non
   poteva tornare»: il ramo `giudicabile` sparisce.

   E' IL CASO PEGGIORE, non una caricatura. Il falso:
     · stampa i sigilli, quindi passa B1 e B2;
     · dice TORNA quando il replay torna, quindi passa C1 e C4a;
     · dice NON TORNA quando il punteggio e' stato gonfiato, quindi
       passa C2 — cioe' fa BENE il mestiere sul caso che si prova per
       primo.
   Cade su una cosa sola: uno schermo diverso da quello su cui la partita
   e' stata registrata. In produzione e' la REGOLA, non l'eccezione —
   misurato dalla voce #133: 800x360 contro 915x412 da' 0-3 dove il
   tabellone dice 3-4, e la rosa non c'entra niente. Un gioco cosi'
   scriverebbe «NON TORNA» sulla riga di quasi tutte le sfide oneste.

   L'ESITO ATTESO: ROSSO su C3 e su C4b, VERDE su tutto il resto.

   uso:  node strumenti/_crit-sigillo-accusa.js
         node strumenti/_q-sigillo.js --gioco fuori/gioco-sigillo-accusa.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-sigillo-accusa.html'));

const A = `        if(!g.giudicabile){
          Sfida.sigilla(g.id, g.verdetto || 'INCOMPLETO', g.causa);`;
const B = `        if(false){
          Sfida.sigilla(g.id, g.verdetto || 'INCOMPLETO', g.causa);`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ["Sfida.sigilla(g.id, torna ? 'TORNA' : 'NON TORNA', '');", 1],  /* il ramo che accusa resta */
  ['if(!g.giudicabile){', 0],                                      /* quello che difende, no */
  ['<span class="sfsig', 1],                                       /* la riga parla ancora */
  ['function vagliaNastro(righe){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il gioco che accusa e\' pronto: ogni scarto e\' una colpa, anche quello della finestra');
console.log('    a    ' + outFile + '  (' + out.length + ' byte, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-sigillo.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su C3 e C4b, VERDE su B1, B2, B3, C1, C2, C4a');
