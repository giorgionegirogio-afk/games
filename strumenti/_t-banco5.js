/* =====================================================================
   _t-banco5.js -- LA SUPERFICIE PER LE PROVE CHE CHIUDONO IL BANCO (voce
   #117, compito 5, MIND v1): __test.iniettaFatto(che, chi, dove, esito).

   PERCHE'. La prova SPECCHIO (strumenti/_q-umore.js) deve costruire due
   storie di eventi A SPECCHIO -- per ogni fatto su un giocatore della
   squadra 0, il fatto gemello sulla squadra 1, NELLO STESSO fotogramma
   (cosi' moltiplicatoreTempo() e' identico per i due, e l'ordine con cui
   applicaImpattoFatto() li scorre non puo' introdurre un'asimmetria) --
   e poi verificare che p.umore/p.nervi dei giocatori corrispondenti e
   G.spinta[0] vs G.spinta[1] restino UGUALI AL BIT. Senza un modo di
   INIETTARE un fatto a comando, la prova dipenderebbe dal seme per
   produrre eventi choerenti a specchio, il che e' esattamente il
   problema che la costruzione robusta vuole evitare (un seme puo' dare
   un gol alla squadra 0 e zero falli alla squadra 1 nella stessa
   finestra: niente storia gemella da leggere).

   NESSUNA LOGICA DI GIOCO NUOVA: iniettaFatto e' un guscio sottile
   attorno a emettiFatto(che, chi, dove, esito), la STESSA funzione che
   gol/autorete/rigore/cartellino/rubata/fallo/parata/palo chiamano gia'
   dal compito 1 (vedi strumenti/_t-registro-fatti.js). Non aggiunge un
   secondo produttore di fatti: espone quello che c'e' gia'. Il fatto
   iniettato entra nel buffer G.fatti come qualunque altro (tetto
   FATTI_MAX con shift, G.fattiTot monotono) e viene processato da
   applicaImpattoFatto/applicaOcchioMestoDaFatto alla prossima simulate()
   -- esattamente come un fatto vero, perche' IL BANCO CHE INIETTA NON
   PUO' VOLER DIRE "IL MOTORE TRATTA I FATTI INIETTATI DIVERSAMENTE": se
   lo facesse, la prova SPECCHIO misurerebbe la sua stessa iniezione, non
   il motore.

   1 ancora (la superficie __test, subito dopo cartellino(team), l'ultimo
   hook di QA del compito 4 che gia' produce un fatto vero).

   ZERO dado() NUOVO: iniettaFatto non sorteggia niente, passa solo
   attraverso emettiFatto.

   uso:  node strumenti/_t-banco5.js --in fuori/x.html --out fuori/y.html
         node strumenti/_t-banco5.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/banco5.html'));

const ANCORE = [

{
  nome: '1. la superficie __test: iniettaFatto, subito dopo cartellino(team)',
  cerca:
`  cartellino(team){ const p=diMovimentoInCampo(team)[0]; if(p) infliggiCartellino(p); return this.disciplina; },`,
  metti:
`  cartellino(team){ const p=diMovimentoInCampo(team)[0]; if(p) infliggiCartellino(p); return this.disciplina; },
  /* IL BANCO CHE CONDANNA (voce #117, compito 5): iniettaFatto espone
     l'UNICO produttore di fatti del gioco (emettiFatto, gia' del compito
     1) al banco, per costruire storie SPECCHIO a comando invece di
     dipendere dal seme per farne uscire una coerente. Nessuna logica
     nuova: e' la stessa emettiFatto(che,chi,dove,esito) che gol/fallo/
     rubata/cartellino chiamano gia', con lo stesso schema, e lo stesso
     G.fattiTot monotono che step() legge per applicare l'impatto alla
     prossima simulate() -- il fatto iniettato non e' distinguibile da
     uno vero per il motore. */
  iniettaFatto(che,chi,dove,esito){ emettiFatto(che, chi|0, Array.isArray(dove)?dove:[0,0], esito||{}); return G.fatti[G.fatti.length-1]; },`,
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

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'iniettaFatto(che,chi,dove,esito){') !== 1) rotti.push('__test.iniettaFatto non e\' presente esattamente una volta');
if (conta(out, 'cartellino(team){ const p=diMovimentoInCampo(team)[0]; if(p) infliggiCartellino(p); return this.disciplina; },') !== 1) rotti.push('il sito di ancoraggio (cartellino) non e\' piu\' presente esattamente una volta: si e\' spostato o e\' cambiato');
if (conta(out, 'function emettiFatto(') !== 1) rotti.push('emettiFatto non e\' definita esattamente una volta: iniettaFatto non ha una sola funzione da richiamare');
if (conta(out, 'dado()') !== conta(src, 'dado()')) rotti.push('il numero di chiamate a dado() e\' cambiato: zero dado() nel codice nuovo e\' un vincolo assoluto');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
