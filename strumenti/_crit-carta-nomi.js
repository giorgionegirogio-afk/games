/* =====================================================================
   _crit-carta-nomi.js — IL DATO PERSONALE «INNOCUO»
   (voce #135, compito 2). Il falso che condanna B1 di `_q-carta.js`
   dall'altro lato: non l'identita' di rete, ma il NOME DELLA SQUADRA.

   CHE COSA FALSIFICA. Sei simboli in coda al carico con le prime sei
   lettere di `SAVE.teamName`, «cosi' chi riceve la sfida vede chi
   l'ha mandata». E' la richiesta piu' ragionevole del mondo e resta
   vietata: il nome di una squadra e' il dato di una persona, ed e' la
   stessa scelta gia' fatta dal nastro alla voce #132 — dell'avversario
   viaggia l'INDICE di carattere, mai il nome.

   E' IL CASO PEGGIORE perche' nemmeno la ricerca di sottostringhe lo
   trova: l'alfabeto di Crockford non ha la O (diventa 0) ne' la U, e
   «DOPOLAVORO» finisce scritto «D0P0LA» — B2 passa. Passa anche tutto
   il gruppo A (sei simboli, 85 caratteri, sotto il tetto; il giro resta
   l'identita' perche' spaccaCarta ignora quel che avanza) e tutto il
   gruppo C (la partita non cambia di un sorteggio).

   Cade su B1, e solo su B1.

   L'ESITO ATTESO: ROSSO su B1, VERDE su A, C e sul resto di B.

   uso:  node strumenti/_crit-carta-nomi.js
         node strumenti/_q-carta.js --solo A,B,C --gioco fuori/gioco-carta-nomi.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-carta-nomi.html'));

const A = `  while(bits.length % 5) bits.push(0);`;
const B = `  /* IL FALSO (voce #135, _crit-carta-nomi): «cosi' chi riceve la sfida
     vede chi gliel'ha mandata». Le prime sei lettere del nome della
     squadra, un simbolo per lettera. */
  try{
    const nm = String(SAVE.teamName || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
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
  ['String(SAVE.teamName || ', 1],
  ['function spaccaCarta(testo){', 1],
  ['sim.push((c>>>15) & 31', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il dato personale «innocuo» e\' pronto: sei lettere del nome della squadra dentro il codice');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-carta.js --solo A,B,C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su B1, VERDE su tutto il gruppo A e C');
