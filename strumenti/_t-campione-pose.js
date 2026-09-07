/* =====================================================================
   _t-campione-pose.js — IL CONTRASTO E LA PARATA ENTRANO NEL CAMPIONE
   (voce #85, compito 3).

   LA FALLA (misurata in _analisi/MOVIOLA-OGGI.md, 2.1): p.contrasto,
   p.presaT, p.gkManiT, p.rinvT, p.recover esistono come campi veri del
   giocatore ma non erano fra quelli scritti in registraFotogramma. Un
   gol nato da un contrasto vinto o da una respinta col pugno del
   portiere non aveva nel nastro il dato per rifare quella posa: il
   replay mostrava quello che quei campi valgono ADESSO (nel vivo), non
   quello che valevano ALLORA — non "non interpolato" come i cronometri
   del compito 4, proprio "non registrato".

   DUE ANCORE, stesso file, stessa area:
     1) la SCRITTURA in registraFotogramma — i cinque campi entrano nella
        mappa per-giocatore, accanto a quelli gia' registrati. Nomi PER
        ESTESO (non abbreviati come kt/kb/ch/ck/cT/rv/rT/kc qui sopra):
        sono gli stessi nomi che _q-replay.js (prova CAMPI) legge dal
        campione crudo via G.rec, quindi l'abbreviazione romperebbe la
        prova per un dettaglio di stile.
     2) la LETTURA in disegnaMoviola — i cinque campi si COPIANO DI PESO
        sul corpo disegnato, esattamente come slide/dive/charge/rove/
        kickClip qui sopra: sono stato discreto (un contrasto a meta' e
        uno finito sono due pose diverse, mescolarle ne inventerebbe una
        terza mai vista), non un cronometro continuo come kickT/kickB —
        quell'interpolazione resta il compito 4, non questo.

   IL PESO, dichiarato (non stimato a occhio): cinque numeri in piu' per
   giocatore per campione. A taglia 11 (22 giocatori), REC_HZ=20,
   REC_SEC=9 (REC_MAX=180 campioni, gia' pagato dal compito di settembre
   che porto' l'anello da 0,8 a 9 secondi): 5 x 22 x 180 = 19.800 numeri
   in piu' nell'anello a pieno regime. Le chiavi sono per esteso (non
   abbreviate), quindi il costo in byte e' un po' piu' alto per numero
   dei campi vicini: usando lo stesso metro del compito di settembre
   (~7,4 KB/campione misurati a 22 giocatori con ~22 campi abbreviati
   su 100 campioni, poi esteso a 1,3 MB su 180), cinque chiavi lunghe
   (contrasto/presaT/gkManiT/rinvT/recover, media ~8 caratteri di chiave
   contro l'1-2 dei campi abbreviati) aggiungono un ordine di grandezza
   di qualche centinaio di kB sull'anello pieno (stima per eccesso:
   ~100 byte/giocatore/campione x 22 x 180 =~ 396 kB), non un raddoppio.
   ACCETTABILE perche' l'anello e' un buffer di SOLO DISEGNO: mai
   serializzato, mai spedito in rete (verificato in MOVIOLA-OGGI.md
   punto 1 — zero riferimenti incrociati col nastro delle sfide), a
   dimensione FISSA (REC_MAX campioni, un vecchio esce quando entra un
   nuovo, G.rec.shift()), e azzerato a ogni fine-replay: resta sempre
   nell'ordine di 1-2 MB di RAM per la partita piu' grande (11 contro
   11), una quantita' che qualunque telefono odierno tiene in memoria
   senza sforzo, a maggior ragione perche' e' un singolo oggetto JS (non
   una stringa JSON tenuta viva) che il garbage collector gestisce come
   qualunque altro array di record.

   uso:  node strumenti/_t-campione-pose.js --out fuori/campione-pose.html
         node strumenti/_t-campione-pose.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/campione-pose.html'));

const ANCORE = [

/* 1 — la SCRITTURA: dentro registraFotogramma, in coda alla mappa
   per-giocatore, accanto a rv/rT/kc gia' registrati. */
{
  nome: '1/2 registraFotogramma registra i cinque campi di posa',
  cerca:
`                          rv:q.rove, rT:q.roveT1, kc:q.kickClip})),`,
  metti:
`                          rv:q.rove, rT:q.roveT1, kc:q.kickClip,
                          /* IL CONTRASTO E LA PARATA NEL CAMPIONE (voce #85,
                             compito 3): questi cinque campi esistono sul
                             giocatore vivo da sempre ma non entravano nel
                             nastro -- un gol nato da un contrasto vinto o
                             da una respinta col pugno del portiere rivedeva
                             nel replay lo stato ATTUALE del campo, non
                             quello REGISTRATO al momento del gesto: il
                             nastro non sapeva nulla del contrasto ne' delle
                             mani del portiere. Nomi per esteso (non
                             abbreviati come i campi qui sopra) perche'
                             sono gli stessi che la prova CAMPI di
                             _q-replay.js legge dal campione crudo. */
                          contrasto:q.contrasto, presaT:q.presaT,
                          gkManiT:q.gkManiT, rinvT:q.rinvT,
                          recover:q.recover})),`,
},

/* 2 — la LETTURA: dentro disegnaMoviola, in coda alle copie di peso
   gia' fatte per slide/dive/charge/rove/kickClip. */
{
  nome: '2/2 disegnaMoviola ripristina i cinque campi di posa',
  cerca:
`    if(f.kc!==undefined) q.kickClip=f.kc;`,
  metti:
`    if(f.kc!==undefined) q.kickClip=f.kc;
    /* IL CONTRASTO E LA PARATA SI COPIANO DI PESO, NON SI INTERPOLANO
       (voce #85, compito 3): sono stato discreto come slide/dive/charge/
       rove qui sopra, non un cronometro continuo -- mescolare un
       contrasto a meta' con uno finito inventerebbe una posa mai vista.
       Qui si rilegge quello che il compito 3 ha registrato;
       l'interpolazione dei cronometri di gesto (kickT/kickB/charge/
       roveT1) resta il compito 4, non questi cinque campi. */
    if(f.contrasto!==undefined) q.contrasto=f.contrasto;
    if(f.presaT!==undefined) q.presaT=f.presaT;
    if(f.gkManiT!==undefined) q.gkManiT=f.gkManiT;
    if(f.rinvT!==undefined) q.rinvT=f.rinvT;
    if(f.recover!==undefined) q.recover=f.recover;`,
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
/* CONTEGGI A DELTA */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['IL CONTRASTO E LA PARATA NEL CAMPIONE (voce #85,', 1],
  ['contrasto:q.contrasto, presaT:q.presaT,', 1],
  ['IL CONTRASTO E LA PARATA SI COPIANO DI PESO', 1],
  ['if(f.contrasto!==undefined) q.contrasto=f.contrasto;', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
