/* =====================================================================
   _toppa-ment-nastro.js — LA MENTALITA' ENTRA NEL NASTRO
   (voce #132, compito 1). Sei ancore.

   IL DIFETTO. Il bottone della mentalita' in pausa gira G.ment[0] senza
   nessuna guardia e senza scrivere niente nel registro. In una sfida
   questo apre due buchi opposti: chi ATTACCA cambia mentalita' e il
   nastro non lo sa (in rilettura la squadra resta com'era al fischio
   d'inizio); chi GUARDA puo' cambiare la mentalita' della squadra di chi
   l'ha attaccato, e da li' in poi il replay e' una partita inventata dal
   pollice di chi la sta guardando.

   REGISTRATA E NON IMPEDITA, e la ragione va scritta perche' e' una
   scelta. sponde:'gabbia' e miraGuidata:'pieno' la sfida le FORZA, ma
   quelle sono proprieta' del MOTORE: due telefoni devono averle identiche
   o la stessa sfida gira su due motori diversi. La mentalita' non e' il
   motore, e' una mossa di chi gioca — come un tocco. Una mossa si annota,
   non si vieta: togliere una scelta di partita a chi attacca per far
   comodo al giudice sarebbe far pagare all'innocente il conto del
   cantiere.

   L'ORA E' GIA' GIUSTA, e vale dirlo perche' qui un fotogramma di scarto
   non darebbe un rosso vistoso. Reg.passo() e' la prima riga di step() e
   incrementa tick alla FINE: un click dato nella pausa dopo il passo k
   porta tick = k+1, e in rilettura passo() lo rimette in scena all'inizio
   del passo k+1 — il primo passo che dal vivo ha visto la mentalita'
   nuova.

   uso:  node strumenti/_toppa-ment-nastro.js --out fuori/x.html
         node strumenti/_toppa-ment-nastro.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/ment-nastro.html'));

const ANCORE = [

/* 1 — la posa della mentalita', in un posto solo */
{
  nome: '1/6 posaMentalita() accanto a mentDi',
  cerca:
`function mentDi(t){ return MENT[mentValida(G.ment ? G.ment[t] : 1)]; }`,
  metti:
`function mentDi(t){ return MENT[mentValida(G.ment ? G.ment[t] : 1)]; }
/* =====================================================================
   POSARE UNA MENTALITA', IN UN POSTO SOLO (voce #132, compito 1).

   Due capi la chiamano e devono fare LA STESSA COSA: il bottone della
   pausa, che la fa girare di uno, e Reg.esegui, che in rilettura la
   rimette dov'era. Un posto solo e' la garanzia che i due non possano
   divergere di un ramo — e' la stessa ragione per cui i tre verbi del
   dischetto passano tutti da Reg.eseguiDuello (voce #131).
   ===================================================================== */
function posaMentalita(chi, m){
  if(!G.ment) G.ment=[1,1];
  const t = (chi|0) === 1 ? 1 : 0;
  G.ment[t] = mentValida(m);
  return G.ment[t];
}`,
},

/* 2 — il bottone si spegne in rilettura */
{
  nome: '2/6 refreshPauseMent spegne il bottone in rilettura',
  cerca:
`  b.classList.toggle('on', mentValida(G.ment?G.ment[0]:1)!==1);
}`,
  metti:
`  b.classList.toggle('on', mentValida(G.ment?G.ment[0]:1)!==1);
  /* IN RILETTURA IL BOTTONE NON E' TUO (voce #132, compito 1). Il
     gestore qui sotto esce comunque da se' — quella e' la guardia che
     conta — ma un bottone che si preme e non fa niente e' un bottone
     rotto: spegnerlo e' dire perche'. La squadra in campo durante un
     replay e' quella di chi ti ha attaccato, e la sua postura la decide
     il nastro. */
  try{ b.disabled = (Reg.modo === 2); }catch(e){}
}`,
},

/* 3 — il gestore: guardia in rilettura, e la riga nel nastro */
{
  nome: '3/6 il gestore della pausa scrive il tipo 8',
  cerca:
`$('btnPauseMent').addEventListener('click', ()=>{
  Audio5.unlock(); Audio5.beep(500);
  if(!G.ment) G.ment=[1,1];
  G.ment[0]=(mentValida(G.ment[0])+1)%3;
  SAVE.mentalita=G.ment[0];
  persistSave();`,
  metti:
`$('btnPauseMent').addEventListener('click', ()=>{
  /* =====================================================================
     IN RILETTURA LE DITA VERE SONO IGNORATE (voce #132, compito 1).

     E' la stessa guardia che le quattro porte di Touch5 hanno da sempre,
     e qui mancava: chi guarda la partita che ha subito poteva aprire la
     pausa e cambiare la mentalita' della squadra di chi l'ha attaccato.
     Da quel momento il replay non e' piu' la partita subita, e il
     confronto di fine replay (grep S.atteso) accusa la rosa cresciuta di
     un altro per uno scarto che ha causato chi guardava.
     ===================================================================== */
  if(Reg.modo === 2) return;
  Audio5.unlock(); Audio5.beep(500);
  if(!G.ment) G.ment=[1,1];
  const mNuova = (mentValida(G.ment[0])+1)%3;
  posaMentalita(0, mNuova);
  /* =====================================================================
     E IL CAMBIO ENTRA NEL NASTRO — la riga di tipo 8.

     Il commento che stava qui sopra diceva «IL FATTO CHE NON EMETTO: qui
     nasce un evento buono per il REGISTRO DEI FATTI». Era vero, e per il
     registro dei COMANDI lo era il doppio: senza questa riga la partita
     rigiocata resta con la postura del fischio d'inizio e finisce con un
     altro punteggio — misurato, 1 sfida su 2 (strumenti/_t-ment-nastro.js)
     e 5 semi su 5 in CPU contro CPU (strumenti/_sonda-132-canali.js).

     Reg.scrivi filtra da se': se il registro non sta scrivendo non
     succede niente, e fuori da una sfida il registro e' spento. Percio'
     qui non serve nessuna guardia su G.sfida, e non se ne mette una: una
     guardia in piu' e' un posto in piu' in cui i due capi possono
     divergere.
     ===================================================================== */
  Reg.scrivi(8, [0, mNuova]);
  SAVE.mentalita=G.ment[0];
  persistSave();`,
},

/* 4 — e in rilettura si rimette in scena */
{
  nome: '4/6 esegui impara il tipo 8',
  cerca:
`    else if(tipo === 4){ const c = this.tasti[r[4]]; if(c) Keys[c] = !!r[3]; }
  },`,
  metti:
`    else if(tipo === 4){ const c = this.tasti[r[4]]; if(c) Keys[c] = !!r[3]; }
    /* LA MENTALITA' CAMBIATA IN PAUSA (voce #132, compito 1). Non muove
       niente da sola: posa un numero che mentDi leggera' al passo dopo,
       esattamente come fece dal vivo. */
    else if(tipo === 8) posaMentalita(r[3], r[4]);
  },`,
},

/* 5 — il tipo 8 esce nel testo del nastro */
{
  nome: '5/6 serializza il tipo 8',
  cerca:
`      } else if(tipo === 7){
        /* LE DUE SQUADRE. Interi e virgole, lunghezza variabile, scritti`,
  metti:
`      } else if(tipo === 8){
        /* LA MENTALITA' (voce #132). Due numeri piccoli, una volta per
           cambio: in una partita intera se ne fanno zero o pochi. */
        pezzi.push(dT + ',8,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));
      } else if(tipo === 7){
        /* LE DUE SQUADRE. Interi e virgole, lunghezza variabile, scritti`,
},

/* 6 — e rientra leggendolo */
{
  nome: '6/6 deserializza il tipo 8',
  cerca:
`      else if(tipo === 6)   this.righe.push([tick, 6, ms].concat(v.slice(3)));
      else if(tipo === 7)   this.righe.push([tick, 7, ms].concat(v.slice(3)));`,
  metti:
`      else if(tipo === 6)   this.righe.push([tick, 6, ms].concat(v.slice(3)));
      else if(tipo === 8)   this.righe.push([tick, 8, ms, v[3], v[4]]);
      else if(tipo === 7)   this.righe.push([tick, 7, ms].concat(v.slice(3)));`,
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
  ['function posaMentalita(chi, m){', 1],
  ['if(Reg.modo === 2) return;', 1],
  ['Reg.scrivi(8, [0, mNuova]);', 1],
  ['else if(tipo === 8) posaMentalita(r[3], r[4]);', 1],
  ["pezzi.push(dT + ',8,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));", 1],
  ['else if(tipo === 8)   this.righe.push([tick, 8, ms, v[3], v[4]]);', 1],
  /* la vecchia riga che girava la mentalita' a mano non deve restare */
  ['G.ment[0]=(mentValida(G.ment[0])+1)%3;', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
