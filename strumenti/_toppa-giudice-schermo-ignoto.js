/* =====================================================================
   _toppa-giudice-schermo-ignoto.js — L'ASTENSIONE SUL «NON LO SO»
   (voce #133, correzione di revisione, IMPORTANTE-1).

   IL DIFETTO, trovato dalla revisione finale del cantiere: il giudice si
   rifiuta quando lo schermo del nastro e' DIVERSO da quello su cui gira
   (`schermo-diverso`), ma quando la riga di tipo 10 MANCA del tutto
   `schermoDelNastro()` torna null e il controllo `if(sc && (...))` e'
   falso — il giudice PROCEDE, come se lo schermo non contasse.

   MISURATO DALLA REVISIONE (scenario di produzione: sfida onesta 3-4
   giocata col gioco e7aa605, dove la riga 10 non esiste ancora, poi
   giudicata dal gioco nuovo):
     915x412    TORNA      3-4 in 8819 passi
     1024x460   NON TORNA  1-3 in 7064 passi   <- innocente accusato
     844x390    NON TORNA  0-3 in 6717 passi   <- innocente accusato
     800x360    NON TORNA  0-3 in 6717 passi   <- innocente accusato
   Asimmetrico col resto del giudice, che si rifiuta perfino su un dato
   che sposta molto meno (`carattere-assente`) ma non sul canale che
   questo stesso cantiere ha misurato come il piu' grosso (voce #133,
   compito 3). Procedere non compra niente: senza sapere lo schermo il
   verdetto non e' affidabile in nessuna direzione.

   LA CURA: astenersi anche quando lo schermo e' IGNOTO, non solo quando
   e' diverso. Il costo e' zero — misurato dalla revisione: tutti i
   nastri veri del banco hanno la riga 10 (la scrive Sfida.gioca ad ogni
   partita, grep «Reg.scrivi(10,»), e i nastri sintetici del banco
   escono prima su `nastro-vuoto` o un'altra causa piu' specifica. Solo i
   nastri di prima di questa cura (o costruiti apposta senza) cadono qui,
   ed e' esattamente quello che deve succedere: un «non lo so» dichiarato
   e' meglio di un verdetto che non si puo' difendere.

   uso:  node strumenti/_toppa-giudice-schermo-ignoto.js --out fuori/x.html
         node strumenti/_toppa-giudice-schermo-ignoto.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const dentro = process.argv.includes('--dentro');
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-giudice-schermo-ignoto.html'));

/* ---------------------------------------------------- l'unica ancora */
const A1 = `  const sc = schermoDelNastro();
  if(sc && (sc[0] !== (innerWidth|0) || sc[1] !== (innerHeight|0)))
    return fermo('INCOMPLETO','schermo-diverso', { schermo:sc });`;
const B1 = `  const sc = schermoDelNastro();
  /* SE LO SCHERMO E' IGNOTO, NON SI PROCEDE (correzione di revisione,
     voce #133, IMPORTANTE-1). Un nastro senza riga di tipo 10 e' di
     prima di questa cura, o costruito apposta senza: in ogni caso non
     si puo' sapere se le stesse coordinate premono lo stesso punto del
     campo, e procedere «alla cieca» produce accuse false in una sola
     direzione (misurato: NON TORNA su schermi diversi, mai su quello
     giusto). Astenersi non costa niente ai nastri veri, che la riga 10
     ce l'hanno sempre. */
  if(!sc) return fermo('INCOMPLETO','schermo-ignoto');
  if(sc[0] !== (innerWidth|0) || sc[1] !== (innerHeight|0))
    return fermo('INCOMPLETO','schermo-diverso', { schermo:sc });`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const n = src.split(A1).length - 1;
if (n !== 1) { console.error('FALLITO: l\'ancora non si trova esattamente una volta (trovata ' + n + ').'); process.exit(1); }
const out = src.replace(A1, B1);

const attesi = [
  ["if(!sc) return fermo('INCOMPLETO','schermo-ignoto');", 1],
  ["return fermo('INCOMPLETO','schermo-diverso', { schermo:sc });", 1],
  /* quel che NON deve essere cambiato */
  ['const MOTORE_V = 2;', 1],
  ['function schermoDelNastro(){', 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  lo schermo ignoto ora astiene il giudice: una ancora, +' + (out.length - src.length) + ' byte');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-giudice.js' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
