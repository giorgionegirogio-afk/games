/* =====================================================================
   _crit-amici-identita.js — IL CODICE CHE SI PORTA DIETRO CHI L'HA
   SCRITTO (voce #136, compito 2). Il falso che condanna il gruppo B di
   `_q-amici.js`, ed e' quello che questo cantiere esiste per impedire.

   CHE COSA FALSIFICA. «Cosi' chi riceve il risultato sa da chi viene, e
   non deve scriverselo a mano»: in coda al carico, prima del controllo,
   sessanta bit dell'identificatore di rete dell'allenatore. E' il passo
   che porta al disastro — `Rete.codiceTrasferimento()` produce
   `id.segreto.controllo` e chi lo incolla DIVENTA quella squadra — solo
   fatto a meta', che e' il modo in cui queste cose si fanno davvero:
   nessuno scrive «mando il segreto», si scrive «mando l'identificatore,
   che tanto e' pubblico».

   E QUI E' PIU' PERICOLOSO CHE ALLA VOCE #135. Il codice della sfida lo
   mandi a chi vuoi sfidare; il codice di RISPOSTA lo mandi a chi ti ha
   sfidato, cioe' un giorno a un gruppo di venti persone.

   E' IL CASO PEGGIORE, costruito apposta per passare tutto il resto:

     · `spaccaEsito` non e' toccata e non ha bisogno di esserlo — legge
       sessanta bit e ignora quel che avanza — quindi il giro
       impacca-e-spacca resta l'identita' (A1);
     · sessanta bit sono dodici simboli: il codice passa da 21 a 33
       caratteri, cioe' resta sotto il tetto di 40 (A2);
     · il controllo e' sempre quello, quindi cattura come prima (A3);
     · i rifiuti e le tre serrature non cambiano (A4, A5);
     · la classifica si compila e si specchia identica (tutto il gruppo C);
     · e la ricerca di sottostringhe non lo trova, perche' i bit
       dell'identificatore ricadono su simboli base32 che non
       assomigliano alle cifre esadecimali da cui vengono (B2).

   Cade su B1 — due telefoni con identita' diverse e lo stesso risultato
   devono dare lo STESSO codice — e cade solo li'. E' la prova che il
   gruppo B discrimina invece di attestare: senza B1, un codice che si
   porta dietro chi l'ha scritto passerebbe tutti gli altri venti
   controlli.

   L'ESITO ATTESO: ROSSO su B1, VERDE su A, C e sul resto di B.

   uso:  node strumenti/_crit-amici-identita.js
         node strumenti/_q-amici.js --solo A,B,C --gioco fuori/gioco-amici-identita.html
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = path.resolve(RADICE, arg('out', 'fuori/gioco-amici-identita.html'));

const A = `  met(Math.max(0, Math.min(31, o.riD|0)), 5);
  while(bits.length % 5) bits.push(0);`;
const B = `  met(Math.max(0, Math.min(31, o.riD|0)), 5);
  /* IL FALSO (voce #136, _crit-amici-identita): «cosi' chi riceve il
     risultato sa da chi viene». Quindici cifre esadecimali
     dell'identificatore di rete, sessanta bit, in coda al carico e
     prima del controllo. spaccaEsito le ignora da se', quindi niente
     altro va toccato. */
  try{
    const idm = String((Rete.mem && Rete.mem().id) || '').replace(/[^0-9a-fA-F]/g, '');
    for(let i=0;i<15;i++) met(parseInt(idm.charAt(i) || '0', 16) & 15, 4);
  }catch(e){}
  while(bits.length % 5) bits.push(0);`;

const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A).length - 1;
if (n !== 1) { console.error('FALLITO: ancora trovata ' + n + ' volte invece di 1'); process.exit(1); }
const out = src.replace(A, B);
const attesi = [
  ['Rete.mem && Rete.mem().id', 1],       /* la riga nuova, e nient'altro */
  ['function spaccaEsito(testo){', 1],    /* il lettore non e' toccato */
  ['function impaccaCarta(o){', 1],       /* e nemmeno il codice della sfida */
  ['const Amici = {', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  il codice che si porta dietro chi l\'ha scritto e\' pronto (+60 bit di identificatore)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri, ' + (out.length - src.length) + ')');
console.log('    prova:  node strumenti/_q-amici.js --solo A,B,C --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
console.log('    ATTESO: ROSSO su B1, VERDE su tutto il gruppo A e C');
