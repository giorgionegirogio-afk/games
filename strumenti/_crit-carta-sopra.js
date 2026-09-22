/* =====================================================================
   _crit-carta-sopra.js — L'INGRESSO IN ALTO, DOVE SI VEDE MEGLIO
   (voce #135, compito 4). Il falso che condanna D4 di `_q-carta.js`.

   CHE COSA FALSIFICA. La voce SFIDA DI CARTA si sposta di undici righe
   piu' su: sotto CERCA AVVERSARIO, prima dell'etichetta della lista.
   E' la scelta che chiunque farebbe — l'ingresso di una funzione nuova
   si mette in alto, dove si vede — ed e' esattamente il difetto gia'
   pagato del TORNEO (grep «LE OTTO SQUADRE SOPRA LA PIEGA»), dove il
   tabellone finiva diciassette pixel sotto il piede opaco dei bottoni e
   l'ottava squadra spariva.

   E' IL CASO PEGGIORE: il pannello e' lo stesso e si apre lo stesso
   (D1), le cause sono le stesse (D2), il limite dichiarato e' lo stesso
   (D3), il giro non chiede niente alla rete (D5), e tutto A, B e C non
   c'entrano niente. L'ingresso nuovo sta perfino PIU' in alto di prima
   (266 invece di 347): a occhio e' un miglioramento.

   Cade su D4, e la misura dice di quanto: a 800x360 con cinque righe la
   prima riga della lista passa da 329 a 375, cioe' quindici pixel SOTTO
   la piega, e il primo bottone GUARDA con lei. Questa e' anche la
   ragione per cui D4 inchioda i tre numeri esatti (220, 329, 308)
   invece di chiedere soltanto «sopra la piega»: i tre bersagli non
   devono restare visibili, devono restare DOVE SONO.

   L'ESITO ATTESO: ROSSO su D4, VERDE su D1, D2, D3, D5.

   uso:  node strumenti/_crit-carta-sopra.js
         node strumenti/_q-carta.js --solo D --gioco fuori/gioco-carta-sopra.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-carta-sopra.html'));

const VOCE = `    <button class="voce" id="btnSfidaCarta">SFIDA DI CARTA <small>un codice da incollare &middot; senza rete</small></button>\n`;
const ETI = `    <div class="eti">LE SFIDE CHE HAI SUBITO</div>`;

const src = fs.readFileSync(inFile, 'utf8');
const guai = [];
if ((src.split(VOCE).length - 1) !== 1) guai.push('la voce non si trova (o non e\' unica)');
if ((src.split(ETI).length - 1) !== 1) guai.push('l\'etichetta della lista non si trova (o non e\' unica)');
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }

/* si toglie da sotto la lista e si rimette sopra, prima dell'etichetta */
let out = src.replace(VOCE, '').replace(ETI, VOCE + ETI);

const attesi = [
  ['id="btnSfidaCarta"', 1],
  ['id="sfidaCarta"', 1],
  ['  mostraCarta(){', 1],
  ["case 'sembra-trasferimento':", 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
/* e la voce dev'essere DAVANTI alla lista, se no il falso non falsifica */
if (out.indexOf('id="btnSfidaCarta"') > out.indexOf('id="sfLista"'))
  rotti.push('la voce non e\' finita sopra la lista');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  l\'ingresso in alto e\' pronto: la voce sta sopra la lista, dove «si vede meglio»');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-carta.js --solo D --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su D4, VERDE su D1, D2, D3, D5');
