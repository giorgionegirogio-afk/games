/* =====================================================================
   _t-touch5-azzera.js — IL TOCCO NON SOPRAVVIVE PIU' ALLA PARTITA
   (voce #85, compito 2 — chiude la voce #68, misura la voce #98).

   LA STORIA. La toppa del 31 agosto 2026 (dentro startMatch, cerca
   "I QUATTRO CRONOMETRI FRATELLI DI recT") azzero' cinque cronometri
   che sopravvivevano fra una partita e la successiva sulla stessa
   pagina: G.recT/G.rec, G.possOwner, G.possT, G.pulse, G.crowdSndT.
   Quella toppa non copriva Touch5, che vive fuori da G e da SAVE — e
   la prova E di strumenti/_q-replay.js (righe ~287-362) lo ha scoperto
   per prima, dichiarando "prova nulla" invece di un rosso perche' due
   giri col registro spento a cavallo di un giro acceso non erano gia'
   uguali fra loro (voce #68, misurato 28 agosto 2026).

   LA BISEZIONE (misurata oggi con strumenti/_diag-replay.js e sonde
   gemelle in fuori/, voce #85 compito 2 — verbale completo nel
   rapporto .git/sdd/brief/85-compito-2-report.md): non tutti i campi
   di Touch5 contano allo stesso modo.
     - la LEVETTA lasciata ATTIVA (il dito non alzato alla fine della
       partita: active=true, ox/oy/dx/dy della partita prima) cambia
       davvero la partita successiva — misurato, diverge al campione 6.
     - un VERBO A TENUTA lasciato premuto (scatto o contenimento: un
       dito mai rilasciato lascia atti{} e btnTouch{} orfani) produce
       un fantasma permanente per tutta la partita dopo — misurato,
       diverge al campione 7.
     - stick[].ox/oy DA SOLO, con active=false (il caso descritto nella
       diagnosi originale della prova E, _analisi/PROVA-E-DIAGNOSI.md
       punto 5), e' risultato INERTE nel percorso normale
       start()+promozione: un tocco nuovo crea sempre un candidato
       fresco con l'origine del suo touchstart, che scavalca l'origine
       residua prima che serva a qualcosa. Azzerato comunque qui, a
       costo zero, per la stessa prudenza della toppa del 31 agosto.
     - un CANDIDATO orfano in pend{} (un dito appoggiato e mai promosso,
       mai alzato) e' risultato innocuo: nessuna decisione di gioco
       legge le chiavi crude di pend, solo la sua bandiera per team alla
       prossima promozione. Azzerato comunque per pari passo con
       Reg.azzeraComandi(), che gia' lo fa.

   NON E' UNA CHIAMATA A Touch5.azzera(). Quella funzione esiste per
   pausa/ripresa e tiene apposta l'origine della levetta per la
   riadozione del pollice che torna (cerca "SI TIENE L'ORIGINE" dentro
   Touch5.azzera) — chiamarla da startMatch userebbe la stessa logica
   per un caso diverso: qui la partita e' NUOVA, non ripresa, quindi lo
   stato residuo si azzera per intero, origine compresa. La cautela e'
   verificata: startMatch non e' sul cammino di pausa/ripresa (setPaused
   chiama Touch5.azzera() per suo conto, mai startMatch), quindi questa
   toppa non tocca il caso "pausa a meta' partita, dito giu', ripresa" —
   misurato con una sonda dedicata nel rapporto del compito.

   PRIMO AVVIO DI PAGINA: Touch5.stick/pend/btnTouch/atti sono gia' ai
   valori neutri appena la pagina si carica, quindi questa toppa e' un
   NO-OP sulla primissima partita — verificato col confronto due-versioni
   (_c3-sorteggi) e con una sonda diretta (fuori/, compito 2).

   uso:  node strumenti/_t-touch5-azzera.js --out fuori/touch5-azzera.html
         node strumenti/_t-touch5-azzera.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/touch5-azzera.html'));

const ANCORE = [

/* 1 — dentro startMatch, subito dopo il reset dei quattro cronometri
   fratelli del 31 agosto: si estende la stessa famiglia al tocco. */
{
  nome: '1/1 startMatch azzera lo stato residuo di Touch5',
  cerca:
`  G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;`,
  metti:
`  G.possOwner=-1; G.possT=0; G.pulse=0; G.crowdSndT=0;
  /* =====================================================================
     IL TOCCO NON SOPRAVVIVE PIU' ALLA PARTITA (voce #85, compito 2 —
     estende ai voce #68 la stessa famiglia dei cronometri fratelli qui
     sopra). Touch5 vive fuori da G e da SAVE: la toppa del 31 agosto
     non lo copriva, e la prova E di strumenti/_q-replay.js lo aveva
     scoperto dichiarando "prova nulla" invece di un rosso (voce #68,
     28 agosto 2026).

     BISEZIONE MISURATA (strumenti/_diag-replay.js e sonde gemelle in
     fuori/, oggi): la levetta lasciata ATTIVA a fine partita cambia
     davvero la partita dopo (diverge al campione 6); un verbo a tenuta
     (scatto, contenimento) lasciato premuto senza rilascio lascia
     atti{}/btnTouch{} orfani che restano accesi per tutta la partita
     dopo (diverge al campione 7). stick[].ox/oy da solo con
     active=false e un candidato orfano in pend{} sono risultati
     innocui nel percorso normale (start() crea sempre un'origine
     fresca; pend non e' letto da nessuna decisione di gioco) — azzerati
     comunque qui, a costo zero, per la stessa prudenza della riga
     sopra.

     NON E' Touch5.azzera(): quella funzione e' per pausa/ripresa e
     tiene apposta l'origine della levetta per la riadozione del
     pollice che torna. Qui la partita e' NUOVA, non ripresa: lo stato
     residuo si azzera per intero, origine compresa. setPaused chiama
     Touch5.azzera() per conto suo e non passa da startMatch, quindi
     questa toppa non tocca il caso "pausa col dito giu', poi ripresa"
     (verificato con sonda dedicata). */
  for(const s of Touch5.stick){
    s.active=false; s.id=-1; s.ox=0; s.oy=0; s.dx=0; s.dy=0;
    s.hist=[]; s.riadotta=null;
  }
  Touch5.pend={}; Touch5.btnTouch={};
  if(Touch5.atti) Touch5.atti={};`,
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
  ['IL TOCCO NON SOPRAVVIVE PIU\' ALLA PARTITA (voce #85, compito 2', 1],
  ['for(const s of Touch5.stick){', 1],
  ['Touch5.pend={}; Touch5.btnTouch={};', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
