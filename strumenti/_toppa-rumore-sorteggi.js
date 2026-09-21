/* =====================================================================
   _toppa-rumore-sorteggi.js — IL CASO DELL'AUDIO NON E' IL CASO DELLA
   PARTITA (voce #132, compito 1). Un'ancora.

   TROVATO MISURANDO, non ragionando: _t-ment-nastro.js restava rosso su
   una sfida su due anche a cura applicata, e la causa non era la
   mentalita'. Audio5.init() -> startCrowd() -> noiseBuf() (:10221-10226)
   riempie un buffer lungo UN SECONDO DI CAMPIONAMENTO con dado(), cioe'
   col generatore SEMINATO della partita.

   MISURATO (strumenti/_sonda-132-rumore.js): il primo Audio5.unlock()
   di una pagina costa 48.000 sorteggi su un telefono a 48 kHz. E la
   frequenza di campionamento la decide l'APPARECCHIO: a 44,1 kHz ne
   costa 44.100. Due telefoni che sbloccano l'audio nello stesso istante
   consumano quantita' DIVERSE di dadi.

   PERCHE' OGGI MORDE POCO, e va detto per non gonfiare il difetto: nel
   gioco spedito lo sblocco arriva da un bottone di menu o dal tocco
   sulla copertina, cioe' PRIMA che Sfida.gioca accenda il seme — e
   SEME.accendi riazzera il flusso. E' un canale LATENTE, non uno
   misurato sul campo. Ma basta un contesto audio che nasca a partita in
   corso (il primo tentativo fallito e ritentato, un tocco che sblocca
   dentro la pausa) perche' quarantottomila pesche spariscano dal flusso
   nel mezzo di una sfida, e da li' in poi il nastro rigiochi un'altra
   partita.

   LA CURA E' UNA RIGA, ed e' una correzione di categoria: il rumore
   bianco e' AUDIO. Non deve essere ripetibile, non deve essere uguale su
   due telefoni, e non ha nessun motivo di pescare dal dado della
   partita. Math.random() e' il caso giusto per lui.

   uso:  node strumenti/_toppa-rumore-sorteggi.js --out fuori/x.html
         node strumenti/_toppa-rumore-sorteggi.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/rumore-sorteggi.html'));

const ANCORE = [
{
  nome: '1/1 il rumore bianco non pesca dal dado della partita',
  cerca:
`  /* rumore bianco riusabile */
  noiseBuf(){
    if(this._nb) return this._nb;
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i] = dado()*2-1;
    this._nb = b; return b;
  },`,
  metti:
`  /* =====================================================================
     RUMORE BIANCO RIUSABILE — E NON PESCA DAL DADO DELLA PARTITA
     (voce #132, compito 1).

     Qui c'era dado(), cioe' il generatore SEMINATO. Un secondo di
     campionamento sono 44.100 o 48.000 pesche — MISURATO con
     strumenti/_sonda-132-rumore.js: 48.000 su un contesto a 48 kHz — e
     la frequenza la decide l'apparecchio, non il gioco. Percio' il
     momento in cui nasce il contesto audio, e perfino il MODELLO del
     telefono, spostavano il flusso dei sorteggi di una partita
     seminata: due telefoni che rigiocano lo stesso nastro con storie
     audio diverse rigiocano due partite diverse.

     Nel gioco spedito lo sblocco arriva quasi sempre prima che il seme
     si accenda (un bottone di menu, il tocco sulla copertina) e
     SEME.accendi riazzera il flusso: era un canale LATENTE, non uno
     misurato sul campo. Ma un canale latente in una modalita' che
     TOGLIE PUNTI a chi non ha barato e' un canale che non si lascia
     aperto per un byte.

     Math.random() e' il caso giusto per un rumore: non deve essere
     ripetibile, non deve essere uguale su due telefoni, e non deve
     costare niente alla partita.
     ===================================================================== */
  noiseBuf(){
    if(this._nb) return this._nb;
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
    this._nb = b; return b;
  },`,
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
  ['for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;', 1],
  ['for(let i=0;i<d.length;i++) d[i] = dado()*2-1;', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
