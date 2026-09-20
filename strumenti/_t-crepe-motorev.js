/* =====================================================================
   _t-crepe-motorev.js -- LA VERSIONE DEL MOTORE SALE (voce #128,
   compito 3). UN'ANCORA sola: la costante MOTORE_V, accanto a Reg
   (CALCETTO-il-gioco.html, grep MOTORE_V, ~:13176).

   MODELLO: strumenti/_t-nastro-versione.js (che ha scritto MOTORE_V e
   il meccanismo di confronto in Sfida.guarda, voce #107, compito 4) e
   strumenti/_t-crepe-docross.js/_t-crepe-kickoff.js (l'ANCORA con
   cerca/metti, il guardiano che rifiuta se `cerca' non compare
   ESATTAMENTE una volta, `--out` dry-run poi `--dentro`).

   PERCHE' SALE (diagnosi voce #128, compiti 1-2, docs/superpowers/
   specs/2026-09-20-crepe-fuzzer-design.md). Le due cure P0 di questo
   cantiere toccano la SIMULAZIONE in un modo che PUO' cambiare come
   una partita rigiocata FINISCE, non solo com'e' oggi:
     - doCross (compito 1): un cross lungo che PRIMA usciva a 1433,8 u/s
       (misurato in _t-crepe-docross.js, prova 10/DOCROSS di
       _q-invarianti.js) adesso clampa a TIRO_TETTO (860 u/s,
       CALCETTO-il-gioco.html:16212) -- stessa direzione, velocita'
       diversa, quindi la palla arriva altrove e in un altro istante.
     - resetKickoff (compito 2): un kickoff dopo un cartellino
       differito che espelle l'idx1 della squadra che batte PRIMA dava
       la palla all'espulso (owner=1, out=12, misurato in
       _t-crepe-kickoff.js), adesso la da' al primo compagno di
       movimento eleggibile -- un ALTRO giocatore in possesso, quindi
       la partita che segue prende un'altra piega.
   Due sequenze di comandi IDENTICHE danno quindi un esito diverso da
   prima della cura, per costruzione (il due-versioni dichiarato nei
   compiti 1-2). Un nastro registrato a MOTORE_V=1 (qualunque partita
   di ieri con un cross lungo o un kickoff dopo un'espulsione)
   rigiocato oggi userebbe QUEGLI STESSI comandi sul motore curato:
   Sfida.guarda (CALCETTO-il-gioco.html, grep Reg.motoreV, ~:43037) lo
   RIFIUTA gia' con causa vera e zero penalita' -- lo stesso confronto
   (Reg.motoreV !== MOTORE_V) che gia' protegge un nastro a versione 0,
   un numero diverso a destra. Il meccanismo (voce #107, compito 4) non
   si tocca: basta che la costante dica la verita'.

   LA CURA. Un numero solo: MOTORE_V passa da 1 a 2. Nessun'altra
   logica cambia -- Reg.serializza/deserializza e Sfida.guarda restano
   quelli di sempre, e continuano a funzionare per QUALUNQUE numero
   (verificato: strumenti/_q-regole.js, prova 13/NASTRO-VERSIONE,
   aggiornata in questo stesso compito per non inchiodare il valore
   "1" e per aggiungere un CASO C -- un nastro con MOTORE_V=1 esplicito
   rigiocato sul gioco a MOTORE_V=2, il caso preciso di questa cura).

   ZERO dado() NUOVO: e' una costante, non un ramo.

   uso:  node strumenti/_t-crepe-motorev.js --in fuori/base128c.html --out fuori/curato128c.html
         node strumenti/_t-crepe-motorev.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/curato-motorev.html'));

const ANCORE = [

{
  nome: '1. MOTORE_V: 1 -> 2, con la nota del perche\' accanto alla costante (voce #128, compito 3)',
  cerca:
`   NASCE A 1 con la voce #107: i rami #87 (rimesse/angoli) e #107
   (area/retropassaggio/vantaggio) hanno gia' cambiato il motore prima
   che questa costante esistesse -- ogni nastro di ieri e' gia' di
   fatto invalido, e nascere a 1 lo dice alla prima occasione utile
   invece di fingere che 0 fosse un motore vero. VERSIONE 0 resta
   riservata ai nastri che non portano nessun campo di versione
   (quelli scritti prima di oggi: vedi Reg.deserializza). */
const MOTORE_V = 1;`,
  metti:
`   NASCE A 1 con la voce #107: i rami #87 (rimesse/angoli) e #107
   (area/retropassaggio/vantaggio) hanno gia' cambiato il motore prima
   che questa costante esistesse -- ogni nastro di ieri e' gia' di
   fatto invalido, e nascere a 1 lo dice alla prima occasione utile
   invece di fingere che 0 fosse un motore vero. VERSIONE 0 resta
   riservata ai nastri che non portano nessun campo di versione
   (quelli scritti prima di oggi: vedi Reg.deserializza).

   SALE A 2 con la voce #128 (20 settembre 2026, compito 3): le due
   cure P0 del cantiere (doCross, il cross-proiettile, compito 1 --
   resetKickoff, il battitore espulso, compito 2) toccano la
   SIMULAZIONE in un modo che cambia come una partita rigiocata
   finisce, non solo com'e' oggi -- misurato: un cross lungo che
   usciva a 1433,8 u/s adesso clampa a TIRO_TETTO (860 u/s, grep
   TIRO_TETTO qui sotto), e un kickoff dopo un'espulsione differita
   sull'idx1 che dava la palla all'espulso adesso la da' al primo
   compagno di movimento eleggibile. Un nastro a MOTORE_V=1 rigiocato
   oggi userebbe gli STESSI comandi su un motore che si comporta
   diversamente in questi due casi: Sfida.guarda (piu' avanti nel
   file, grep Reg.motoreV) lo rifiuta con lo STESSO confronto che gia'
   protegge un nastro a versione 0, causa vera e zero penalita'. */
const MOTORE_V = 2;`,
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

/* CONTEGGIO A DELTA. const MOTORE_V = 2; deve comparire esattamente una
   volta, e la vecchia dichiarazione a 1 deve essere sparita -- niente
   altra occorrenza della stringa (serializza scrive MOTORE_V per nome,
   non per valore letterale: grep 'MOTORE_V = 1' e' innocuo altrove). */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'const MOTORE_V = 2;') !== 1) {
  rotti.push('la nuova dichiarazione (MOTORE_V = 2) non e\' presente esattamente una volta');
}
if (conta(out, 'const MOTORE_V = 1;') !== 0) {
  rotti.push('la vecchia dichiarazione (MOTORE_V = 1) e\' sopravvissuta');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
