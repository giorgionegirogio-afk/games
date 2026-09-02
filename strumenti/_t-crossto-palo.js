/* =====================================================================
   _t-crossto-palo.js — CROSSTO RANCIDO DOPO UN PALO (voce #88, correzione
   della revisione del compito 9, rilievo CRITICO, 2 settembre 2026)

   LA DIAGNOSI, verificata a runtime da fuori/_p-palo-crossto.js PRIMA di
   questa cura (scena: cross a 380 u/s dritto su un palo, destinatario
   dichiarato parcheggiato lontano dalla porta, seme 990001). hitPosts
   azzera b.passTo al rimbalzo (era gia' cosi') ma non toccava mai
   b.crossTo. hitPosts non chiama segnaTocco ne' scrive b.owner: dopo il
   rimbalzo squadraDelPallone() restava la squadra che aveva crossato (il
   suo ultimo tocco non e' cambiato), e la preferenza di controllo in
   switchControlled continuava a comandare il destinatario dichiarato — lo
   stesso campo rancido che puoTirare consulta nel ramo "atteso". Sonda
   PRIMA della cura: crossTo restava >=0 in ogni fotogramma dopo l'urto, e
   il disco grande offriva TIRA a un uomo a centinaia di unita' dal
   pallone rimbalzato, in TUTTI i 30 fotogrammi campionati dopo l'urto —
   proprio il caso che il compito 9 doveva escludere (una palla lontana
   diretta a un compagno che non deve offrire TIRA a un terzo uomo, qui
   applicato al destinatario stesso quando il pallone non e' piu' verso
   di lui).

   LA CURA: hitPosts azzera b.crossTo come gia' azzera b.passTo — la causa,
   non il sintomo. Per coerenza (e non perche' oggi producano un difetto
   visibile: la guardia squadraDelPallone()===t li maschera gia', tramite
   segnaTocco in tentaPresa e l'assegnazione di b.owner in ballOverBar)
   anche tentaPresa e ballOverBar azzerano b.crossTo, sullo stesso modello
   di b.passTo: un difetto mascherato torna appena la maschera cade — in
   ballOverBar la maschera E' un buco quando "deep" e' null (nessun
   difensore in campo per il rinvio dal fondo): ne' b.owner ne' lastTouch
   cambierebbero, e squadraDelPallone() resterebbe la squadra che ha
   crossato.

   LEGGE DEI SORTEGGI: le tre righe aggiunte sono assegnazioni pure
   (b.crossTo=-1), zero chiamate a dado().

   uso:  node strumenti/_t-crossto-palo.js --out fuori/crossto-palo.html
         node strumenti/_t-crossto-palo.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/crossto-palo.html'));

const ANCORE = [

/* 1 — hitPosts: la CAUSA. Dopo il rimbalzo il pallone non e' piu' destinato a nessuno */
{
  nome: '1/3 hitPosts: b.crossTo si azzera come b.passTo',
  cerca:
`    b.vx*=0.78; b.vy*=0.78;
    b.curve=0; b.perfectT=0; b.passTo=-1; b.saveRolled=false;`,
  metti:
`    b.vx*=0.78; b.vy*=0.78;
    /* CROSSTO RANCIDO DOPO UN PALO (rilievo CRITICO della revisione del
       compito 9, 2 settembre 2026). Qui sotto si azzerava gia' b.passTo,
       ma non b.crossTo: hitPosts non chiama segnaTocco ne' tocca
       b.owner, quindi dopo il rimbalzo squadraDelPallone() restava la
       squadra che aveva crossato, e la preferenza di controllo
       continuava a comandare il destinatario dichiarato. puoTirare legge
       lo stesso campo nel ramo "atteso": TIRA restava acceso su un
       pallone rimbalzato altrove, senza guardare la distanza — misurato
       con fuori/_p-palo-crossto.js sul file non curato: crossTo rancido
       in 32/32 fotogrammi dopo l'urto, TIRA offerto a distanza superiore
       a P_SPEED*TIRO_PORTATA in 24/32. Dopo un palo il pallone non e'
       piu' destinato a nessuno, come dopo un muro o un tocco sporco. */
    b.crossTo=-1;
    b.curve=0; b.perfectT=0; b.passTo=-1; b.saveRolled=false;`,
},

/* 2 — tentaPresa: coerenza. Oggi mascherato da segnaTocco(ki) qui sopra,
   che cambia subito squadraDelPallone() sulla squadra che difende */
{
  nome: '2/3 tentaPresa: b.crossTo si azzera come b.passTo',
  cerca:
`  segnaTocco(ki); b.passTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=true;`,
  metti:
`  /* coerenza con hitPosts (rilievo CRITICO, revisione compito 9): il
     pallone fra le mani o respinto dal portiere non e' destinato a
     nessuno. Oggi il caso e' gia' mascherato dal segnaTocco qui sotto
     (cambia subito squadraDelPallone()), ma un difetto mascherato torna
     appena la maschera cade. */
  segnaTocco(ki); b.passTo=-1; b.crossTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=true;`,
},

/* 3 — ballOverBar: coerenza, e chiude un buco vero quando "deep" e'
   null (nessun difensore per il rinvio dal fondo: ne' b.owner ne'
   lastTouch cambierebbero) */
{
  nome: '3/3 ballOverBar: b.crossTo si azzera come b.passTo',
  cerca:
`  b.z=0; b.vz=0; b.curve=0; b.perfectT=0; b.passTo=-1; b.saveRolled=false;`,
  metti:
`  /* coerenza con hitPosts (rilievo CRITICO, revisione compito 9): senza
     questa riga, se "deep" qui sotto risultasse null (nessun difensore
     disponibile) ne' b.owner ne' lastTouch cambierebbero, e
     squadraDelPallone() resterebbe la squadra che ha crossato — lo
     stesso buco che hitPosts aveva sempre, non solo per coerenza. */
  b.z=0; b.vz=0; b.curve=0; b.perfectT=0; b.passTo=-1; b.crossTo=-1; b.saveRolled=false;`,
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
const contaSub = (s, sub) => s.split(sub).length - 1;
const attesi = [
  ['b.crossTo=-1;', contaSub(src, 'b.crossTo=-1;') + 3],
  ['b.crossTo=-1;\n    b.curve=0; b.perfectT=0; b.passTo=-1; b.saveRolled=false;', 1],
  ['b.passTo=-1; b.crossTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=true;', 1],
  ['b.passTo=-1; b.crossTo=-1; b.saveRolled=false;', 1],
];
const rotti = attesi.filter(([s, n]) => contaSub(out, s) !== n)
  .map(([s, n]) => s + '  atteso ' + n + ', trovato ' + contaSub(out, s));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
