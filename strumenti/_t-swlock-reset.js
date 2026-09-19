/* =====================================================================
   _t-swlock-reset.js -- IL SESTO CRONOMETRO FRATELLO (voce #117, compito
   6, trovato dalla batteria intera, non dal piano).

   PERCHE' ESISTE. Rilanciando la batteria intera a fine cantiere (la
   lezione ricorrente: #86/#87/#107/#112 avevano gia' avuto una
   regressione sfuggita perche' la batteria intera non fu rilanciata a
   fine cantiere -- questa e' la quinta occorrenza), strumenti/_q-replay.js
   e' uscito ROSSO sulla prova E ("REGISTRARE NON CAMBIA IL GIOCO"):
   accendere il registro (t.registra(), usato dal nastro delle sfide)
   spostava la fisica della STESSA partita, seme identico, a partire dal
   fotogramma 80 circa.

   LA BISEZIONE (i quattro compiti del cantiere, uno per uno) mostra la
   prova E verde su cb23512 (compito 1) e su 53007c5 (compito 2), rossa
   da 8824222 (compito 3, "manopolaDi entra in aiMove") in poi -- quindi
   nata dentro questo cantiere, non pre-esistente. Ma la CAUSA VERA e'
   PRE-ESISTENTE: G.swLock/G.swTimer (l'isteresi del cambio-giocatore
   automatico, :17445/:17478 storiche) sono dichiarati una volta sola
   nell'oggetto G iniziale (:8442-8443) e NON sono MAI azzerati da
   startMatch -- la STESSA malattia dei "cinque cronometri fratelli" di
   G.recT (G.possOwner, G.possT, G.pulse, G.crowdSndT, gia' riparata il
   31 agosto 2026) e di G.vantaggio (voce #107, I2): un cronometro che
   sopravvive a startMatch porta nella partita nuova la fase di quella
   vecchia, e le due partite (o i due giri della STESSA partita quando
   qualcosa fa girare due passate sulla stessa pagina, come registro
   acceso/spento) smettono di essere allineate.

   PERCHE' SI VEDE SOLO DAL COMPITO 3. Prima di manopolaDi, aiMove usava
   manopoleDi(p.team) -- la STESSA manopola per tutti gli undici, letta
   per indirizzo. Da quando manopolaDi(p) e' per-giocatore, la fase
   residua di G.swLock/G.swTimer (che decide QUANDO il controllo passa
   da un giocatore all'altro della squadra umana) sposta di alcuni
   fotogrammi il momento del cambio, e la differenza si propaga nella
   fisica in un modo che prima non lasciava traccia visibile alla
   granularita' campionata da _q-replay.js. Verificato con una diagnosi
   dedicata (fuori/_diag-mind-reg2.js, non committata): G.swLock[0] vale
   gia' un valore diverso al fotogramma 0 di due giri consecutivi sulla
   stessa pagina, PRIMA che qualunque copione di test abbia mosso un
   dito -- e' la fase ereditata dal giro precedente, non un effetto del
   registro in se'.

   IL FIX, VERIFICATO PRIMA DI SCRIVERE QUESTO ATTREZZO: azzerare
   G.swLock e G.swTimer in startMatch, accanto ai loro cinque fratelli
   (G.possOwner/G.possT/G.pulse/G.crowdSndT/G.recT), riporta
   strumenti/_q-replay.js a 10/10 (tre corse di controllo, zero rosso).
   Zero dado() qui: due assegnazioni di array, nessun sorteggio, nessun
   costo per il caso.

   NON E' UNA CURA DEL CANALE MIND: e' un difetto del motore, dello
   stesso genere di quelli gia' riparati prima di questo cantiere, che
   il canale MIND ha reso VISIBILE al banco perche' e' il primo a far
   dipendere una decisione della CPU da QUALE giocatore specifico e'
   sotto controllo umano in quel momento. Trovata e riparata chiudendo
   il cantiere (la stessa forma della cura "disposizione.js" della voce
   #112, compito 6): dichiarata qui, nel verbale (voce #117) e nel
   seguito aperto per completezza.

   uso:  node strumenti/_t-swlock-reset.js --in fuori/x.html --out fuori/y.html
         node strumenti/_t-swlock-reset.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/swlock-reset.html'));

const ANCORE = [

{
  nome: '1. azzeramento in startMatch: G.swLock/G.swTimer accanto ai cinque cronometri fratelli',
  cerca:
`  G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;`,
  metti:
`  G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;
  /* IL SESTO CRONOMETRO FRATELLO (voce #117, compito 6, trovato dalla
     batteria intera): G.swLock/G.swTimer (isteresi del cambio-giocatore
     automatico, switchControlled) erano dichiarati una sola volta
     nell'oggetto G iniziale e mai azzerati qui, come i cinque cronometri
     sopra prima del 31 agosto 2026. La fase residua sopravviveva da una
     partita all'altra sulla stessa pagina (misurato: strumenti/_q-replay.js
     prova E, "registrare non cambia il gioco", usciva rossa dal compito 3
     del cantiere #117 in poi -- il canale MIND e' il primo a far
     dipendere una decisione della CPU da quale giocatore specifico e'
     sotto controllo umano, e per questo la fase residua e' diventata
     visibile). Azzerare non consuma sorteggi: nessun sorteggio qui. */
  G.swLock=[0,0]; G.swTimer=[0,0];`,
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
if (conta(out, 'G.swLock=[0,0]; G.swTimer=[0,0];') !== 1) rotti.push('l\'azzeramento di G.swLock/G.swTimer non e\' presente esattamente una volta');
if (conta(out, 'dado()') !== conta(src, 'dado()')) rotti.push('il numero di chiamate a dado() e\' cambiato: zero dado() nel codice nuovo e\' un vincolo assoluto');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
