/* =====================================================================
   _t-sfumato-crossto.js -- MICRO-ONDA del ri-verdetto (voce #107): lo
   sfumato non lascia crossTo rancido.

   ATTREZZO RETROATTIVO, DICHIARATO (precedente: la coda della revisione
   finale di #87 e _t-vantaggio-sentinel.js). L'edit di gioco del commit
   64fbeca e' stato applicato a mano, in violazione del vincolo globale
   del piano ("attrezzo a ancore per ogni tocco al gioco"); questo
   attrezzo lo riproduce ed e' stato verificato A SPECCHIO dal
   controllore: applicato a `git show 288f4a1:CALCETTO-il-gioco.html`
   produce un file byte-identico al gioco di 64fbeca. La garanzia e' piu'
   debole di un attrezzo nato prima dell'edit -- prova che l'attrezzo
   riproduce l'edit, non che l'edit sia nato ancorato -- e va letta cosi'.

   IL BUCO (rilievo del ri-verdetto della revisione finale di #107):
   eseguiSfumato() azzera owner/x/y/z/vz/vx/vy/curve/perfectT/saveRolled/
   passTo ma NON b.crossTo -- e il ramo I3b di pallaFuori la attraversa
   DOVE il ramo vecchio azzerava (b.crossTo=-1 nel corpo normale di
   pallaFuori). Un pallone congelato al punto salvato restava "diretto"
   al destinatario dichiarato PRIMA del fallo: la stessa ferita della
   lezione hitPosts/crossTo della voce #88.

   uso:  node strumenti/_t-sfumato-crossto.js --in fuori/x.html --out fuori/y.html
         node strumenti/_t-sfumato-crossto.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/sfumato-crossto.html'));

const ANCORE = [

{
  nome: 'eseguiSfumato: l\'azzeramento del pallone impara crossTo',
  cerca:
`  b.curve=0; b.perfectT=0; b.saveRolled=false; b.passTo=-1;
  showBanner('VANTAGGIO SFUMATO', TEAMCOL[vTeam], 1.2);`,
  metti:
`  /* CROSSTO RANCIDO ALLO SFUMATO (rilievo del ri-verdetto, voce #107,
     micro-onda finale, 18 settembre 2026). Questa riga azzerava gia'
     b.passTo ma non b.crossTo -- la stessa ferita della lezione hitPosts/
     crossTo (voce #88, vedi segnaTocco): un pallone congelato al punto
     salvato con un destinatario dichiarato PRIMA del fallo restava
     "diretto" a lui anche dopo, e i consumatori veri leggono il campo
     senza mai guardare owner/z -- la portata di presa del designato
     (tentaPresa, ~18671: 34 unita' invece di P_R+B_R+3), il verbo del
     pollice (~14528: inCorsa resta vero, il comando non offre TIRA) e la
     freccia HUD del destinatario (~17322) potevano tutti puntare a un
     bersaglio di un'azione gia' chiusa dal fallo. Ogni altro azzeramento
     dello stato del pallone nel file (kickoff, gol, rimessa, palo...) ha
     gia' questa riga: qui mancava. */
  b.curve=0; b.perfectT=0; b.saveRolled=false; b.passTo=-1; b.crossTo=-1;
  showBanner('VANTAGGIO SFUMATO', TEAMCOL[vTeam], 1.2);`,
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
if (conta(out, 'b.saveRolled=false; b.passTo=-1; b.crossTo=-1;') !== 1) {
  rotti.push('la riga nuova con crossTo non e\' presente esattamente una volta');
}
if (conta(out, 'CROSSTO RANCIDO ALLO SFUMATO') !== 1) {
  rotti.push('il commento della cura non e\' presente esattamente una volta');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
