/* =====================================================================
   _crit-rosa-meta.js — LA SCALA STRETTA A VALLE, NON ALLA SORGENTE
   (voce #132, compito 3: la versione bugiarda del gioco che condanna il
   banco, non il gioco).

   IL FALSO, ed e' la mezza cura che verrebbe in mente per prima: una
   regola sola (attrRosa) c'e', il nastro la usa, startMatch la usa — il
   codice sembra ordinato, e un controllo che guardi solo «le funzioni
   chiamano tutte la stessa» passerebbe. Ma la porta del SALVATAGGIO
   resta spalancata: SAVE.rosa puo' ancora contenere 250, setupPlayers lo
   copia grezzo in campo, e il nastro ne registra 99.

   E' esattamente lo stato del gioco prima del compito 3, con una vernice
   sopra: la dimostrazione che stringere a valle non fa combaciare
   niente. Il banco deve restare rosso sulla prova A (l'uomo in campo e
   l'uomo nel nastro) — quella e' la prova che morde.

   uso:  node strumenti/_crit-rosa-meta.js
         node strumenti/_crit-rosa-meta.js --out fuori/crit-rosa-meta.html

   PRIMA DELLA CURA DEL COMPITO 3 QUESTO ATTREZZO NON SI APPLICA, e lo
   dice: la riga che deve rimettere com'era non esiste ancora.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/crit-rosa-meta.html'));

const CERCA =
`    if(Array.isArray(j.rosa)&&(j.rosa.length===4||j.rosa.length===5))
      s.rosa=j.rosa.map(g=>{
        if(!g || typeof g!=='object') return g;
        const o=Object.assign({}, g);
        o.vel=attrRosa(o.vel); o.tiro=attrRosa(o.tiro);
        o.tecnica=attrRosa(o.tecnica); o.tackle=attrRosa(o.tackle);
        return o;
      });`;
const METTI =
`    /* IL FALSO (_crit-rosa-meta.js): la sorgente torna spalancata. La
       regola unica esiste ancora e la usano il nastro e startMatch — ma
       SAVE.rosa puo' di nuovo contenere qualunque numero, e in campo ci
       va quello. */
    if(Array.isArray(j.rosa)&&(j.rosa.length===4||j.rosa.length===5)) s.rosa=j.rosa;`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(CERCA).length - 1;
if (n !== 1) {
  console.error('FALLITO: l\'ancora della rosa in loadSave non si trova esattamente una volta (trovata ' + n + ').');
  if (n === 0) console.error('  Prima del compito 3 e\' NORMALE: la cura non e\' ancora applicata.');
  process.exit(1);
}
const out = src.replace(CERCA, METTI);
const attesi = [
  ['function attrRosa(v, d){', 1],          /* la regola unica resta */
  ['const q = v => attrRosa(v);', 1],       /* e il nastro la usa */
  ['const q = (v, d) => attrRosa(v, d);', 2], /* e startMatch pure */
  ['o.vel=attrRosa(o.vel); o.tiro=attrRosa(o.tiro);', 0],   /* ma la sorgente no */
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  falso costruito: la scala si stringe a valle, la sorgente resta aperta');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-rosa-scala.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    DEVE uscire 1. Un verde qui vorrebbe dire che il banco non discrimina.');
