/* =====================================================================
   _crit-amici-nome.js — IL DATO PERSONALE «INNOCUO» (voce #136,
   compito 2). Il secondo falso del gruppo B.

   CHE COSA FALSIFICA. «L'identificatore no, ma il NOME della squadra
   che male fa? Cosi' l'amico non deve scriverselo a mano e la
   classifica si compila da sola»: sei caratteri del nome della squadra,
   trenta bit, in coda al carico.

   E' la versione simpatica dello stesso errore, ed e' quella che in una
   revisione passa: nessuno si allarma per un nome. Ma un nome e' il
   dato di una persona, e la voce #135 l'ha gia' tenuto fuori dal codice
   della sfida per questo. La classifica degli amici non ha bisogno che
   nessun nome viaggi: il soprannome lo scrive chi guarda, sul proprio
   telefono, e non esce di li'.

   E' IL CASO PEGGIORE: il codice passa da 21 a 27 caratteri (sotto il
   tetto), il giro resta l'identita', il controllo e le serrature non si
   muovono, la classifica si compila e si specchia.

   E LA PROVA GROSSOLANA NON LO PRENDE, che e' la cosa da imparare. B2
   cerca il nome come sottostringa e non lo trova: i caratteri escono
   dall'alfabeto di Crockford, dove la O non c'e' e diventa uno zero, e
   «DOPOLAVORO» finisce scritto «D0P0LAV0R0». Se il gruppo B fosse solo
   la ricerca di sottostringhe, questo falso passerebbe.

   Cade su B1: due telefoni con nomi di squadra diversi danno due
   codici diversi.

   L'ESITO ATTESO: ROSSO su B1, VERDE su A, C e sul resto di B.

   uso:  node strumenti/_crit-amici-nome.js
         node strumenti/_q-amici.js --solo A,B,C --gioco fuori/gioco-amici-nome.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-amici-nome.html'));

const A = `  met(Math.max(0, Math.min(31, o.riD|0)), 5);
  while(bits.length % 5) bits.push(0);`;
const B = `  met(Math.max(0, Math.min(31, o.riD|0)), 5);
  /* IL FALSO (voce #136, _crit-amici-nome): «il nome della squadra che
     male fa? Cosi' la classifica si compila da sola». Sei caratteri,
     trenta bit, dall'alfabeto che il codice usa gia'. */
  try{
    const nm = String(SAVE.teamName || '').toUpperCase();
    for(let i=0;i<6;i++){
      const v = CARTA_VAL[nm.charAt(i)];
      met((v === undefined ? 0 : v) & 31, 5);
    }
  }catch(e){}
  while(bits.length % 5) bits.push(0);`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ['const nm = String(SAVE.teamName', 1],
  ['function spaccaEsito(testo){', 1],
  ['const Amici = {', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il nome della squadra viaggia (+30 bit)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-amici.js --solo A,B,C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su B1, VERDE su tutto il resto — B2, la ricerca di');
console.log('            sottostringhe, NON lo prende: e\' il motivo per cui B1 esiste');
