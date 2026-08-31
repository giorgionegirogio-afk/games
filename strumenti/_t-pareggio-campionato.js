/* =====================================================================
   _t-pareggio-campionato.js — IN CAMPIONATO IL PARI E' UN PAREGGIO
   (31 agosto 2026, voce di lavoro #79).

   IL DIFETTO. L'intro della STAGIONE promette «PAREGGIO +15», la
   classifica ha la colonna N, endMatch sa scrivere «PAREGGIO», e
   applyMatchRewards ha la riga «Pareggio di campionato» — ma il
   giocatore non puo' pareggiare MAI: al fischio con punteggio pari
   scatta SEMPRE il golden goal, e dopo quaranta secondi i rigori, il
   cui gol decisivo entra nel punteggio. Tutto il codice del pareggio
   era nato morto dietro quel cancello; i pareggi esistevano solo nelle
   partite SIMULATE delle altre squadre.

   LA CURA, una condizione: quando il tempo scade in parita' e il
   contesto e' 'season', la partita FINISCE — come in ogni campionato
   del mondo. Golden goal e rigori restano identici in amichevole (sono
   l'identita' del campetto: «il prossimo gol vince»), nel TORNEO (a
   eliminazione serve un vincitore) e nella SFIDA in rete (il server
   gestisce gia' l'esito 0,5, ma il flusso registrato non si tocca).

   COSA SI SVEGLIA DA SOLO, senza una riga in piu': il titolo
   «PAREGGIO» (10976), «Bonus pareggio» +12 (COIN_DRAW), «Pareggio di
   campionato» +15 (SEA_DRAW), il punto in classifica e la colonna N
   per la riga del giocatore (chiudiGiornata/registraRisultato), e la
   didascalia FISCHIO FINALE.

   LEGGE DEI SORTEGGI: i banchi a seme fisso girano su amichevoli
   (startMatch(1,1)), dove non cambia nulla; il ramo nuovo tocca solo
   le partite di stagione, che nessun banco a seme fisso percorre.
   Misura: _q-meta.js --tre-taglie (il cancello del meta-gioco copre la
   stagione) + la sonda dei tre contesti qui sotto.

   Prova diretta (tre contesti):
     stagione, 1-1 al fischio  ->  end, titolo PAREGGIO, giornata chiusa
     amichevole, 1-1           ->  GOLDEN GOAL come sempre
     torneo, 1-1               ->  GOLDEN GOAL come sempre

   uso:  node strumenti/_t-pareggio-campionato.js --out fuori/pareggio.html
         node strumenti/_t-pareggio-campionato.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/pareggio.html'));

const ANCORE = [

{
  nome: '1/1 il fischio del campionato',
  cerca:
`      if(G.score[0]===G.score[1]){
        G.golden=true; G.goldenT=0;
        showBanner('GOLDEN GOAL','#ffb020',2.2);
        Audio5.whistle(false); Audio5.swell();
      }else{ endMatch(); return; }`,
  metti:
`      /* IN CAMPIONATO IL PARI E' UN PAREGGIO (31 agosto 2026, #79).
         L'intro prometteva «PAREGGIO +15» e la classifica ha la colonna
         N, ma il golden scattava SEMPRE e il giocatore non poteva
         pareggiare mai: titolo, premio e punto erano codice nato morto.
         Il golden resta l'identita' dell'amichevole, del torneo (serve
         un vincitore) e della sfida in rete (flusso registrato): solo
         la giornata di campionato finisce come finisce il calcio. */
      if(G.score[0]===G.score[1] && G.matchCtx!=='season'){
        G.golden=true; G.goldenT=0;
        showBanner('GOLDEN GOAL','#ffb020',2.2);
        Audio5.whistle(false); Audio5.swell();
      }else{ endMatch(); return; }`,
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
  ["G.score[0]===G.score[1] && G.matchCtx!=='season'", 1],
  // il ramo del golden esiste ancora, uno e uno solo
  ["G.golden=true; G.goldenT=0;", 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
