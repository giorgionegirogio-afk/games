/* =====================================================================
   _t-crepe-docross.js -- LA CURA DEL CROSS-PROIETTILE (voce #128,
   compito 1, P0-1). UN'ANCORA sola: la chiamata a kickBall dentro
   doCross (CALCETTO-il-gioco.html:15888-15914).

   MODELLO: strumenti/_t-registro-fatti.js (l'ANCORE con cerca/metti, il
   guardiano che rifiuta se `cerca' non compare ESATTAMENTE una volta,
   `--out` dry-run poi `--dentro`).

   IL BUG (diagnosi P0-1, docs/superpowers/specs/2026-09-20-crepe-
   fuzzer-design.md). doCross calcola:
     const T=clamp(dist/430, L14_T0, L14_T1);           // T in [0.66,0.75] SEMPRE
     if(kickBall(p, dx/dist, dy/dist, dist/T, 0)){ ... }  // dist NON limitato
   T e' bloccato, ma dist no: e' l'UNICO tiro del gioco che non passa da
   tiroVelocita()/Math.min(TIRO_TETTO,...) (tiroVelocita, ~:16186-16187,
   e fireShotMirato, ~:16437, chiudono TUTTI gli altri con lo stesso
   pavimento). Un cross lungo (dist grande) da' quindi speed=dist/T senza
   tetto -- misurato 1433,8 u/s in strumenti/_q-invarianti.js, prova 10
   (DOCROSS), sul gioco di oggi, contro TIRO_TETTO=860 e il tetto di
   sicurezza TETTO_VEL_PALLA=1353 della prova 9. Il design (spec P0-1,
   piano compito 1): un cross molto lungo deve ricadere PRIMA (fisica
   realistica, come ogni altro tiro), non volare come un proiettile.

   LA CURA. Una sola parola in piu' nella chiamata a kickBall: la
   velocita' del cross (dist/T) si clampa a TIRO_TETTO, lo STESSO tetto
   che tiroVelocita gia' applica a passaggi/tiri/lanci
   (Math.min(TIRO_TETTO, Math.max(base, ...))). NON si tocca T (il tempo
   di volo, e quindi b.vz=280*T, la quota del cross, resta quello di
   sempre): solo la velocita' ORIZZONTALE si clampa. Effetto fisico: a
   parita' di tempo in aria, un cross oltre il tetto non copre piu' tutta
   la distanza fino al secondo palo -- ricade prima, invece di volare
   come un proiettile. IL CROSS TIPICO (dist tale che dist/T<=TIRO_TETTO=860,
   cioe' per T=0.75 dist<=645, mediana ~583 u/s nei semi di calibrazione, la
   stragrande maggioranza dei cross tattici entro la meta' campo offensiva)
   NON cambia: Math.min(TIRO_TETTO, x) vale x quando x<=TIRO_TETTO, quindi
   kickBall riceve lo STESSO numero di prima, bit per bit -- e' l'identita'
   di Math.min, non una misura a parte. RETTIFICA (correzione di revisione,
   voce #128): questa NON e' un'invarianza generale sulla velocita' massima
   del gioco normale. La prova 9 calibra un tetto DIVERSO (TETTO_VEL_PALLA=
   1353, sulla palla libera owner<0) e osserva un massimo di 902 u/s --
   sopra TIRO_TETTO=860. Un cross reale in gioco a 902 u/s NON resta
   invariato: viene clampato a 860 da questa cura, ed e' parte della
   divergenza due-versioni GIA' dichiarata (doCross 16/60 su
   `_c3-sorteggi.js`, MANUALE.md voce #128), non un'invarianza. Verificato
   solo a mano con una traiettoria tipica sotto il tetto (vedi il rapporto
   del compito).

   ZERO dado() NUOVO: nessun sorteggio, nessun ramo nuovo -- una sola
   funzione (Math.min) applicata a un valore gia' calcolato.

   uso:  node strumenti/_t-crepe-docross.js --in fuori/base128.html --out fuori/curato128.html
         node strumenti/_t-crepe-docross.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/curato-docross.html'));

const ANCORE = [

{
  nome: '1. doCross: clamp della velocita\' del cross a TIRO_TETTO (P0-1)',
  cerca:
`  if(kickBall(p, dx/dist, dy/dist, dist/T, 0)){`,
  metti:
`  /* IL CLAMP (voce #128, compito 1, P0-1): dist/T non aveva tetto -- e'
     l'UNICO tiro del gioco che non passa da tiroVelocita()/TIRO_TETTO.
     Math.min(TIRO_TETTO, dist/T) e' lo STESSO tetto che tiroVelocita
     applica a ogni altro tiro (~:16186-16187): sotto il tetto il numero
     non cambia (il cross normale resta identico), sopra il tetto un
     cross lungo ricade prima invece di volare come un proiettile -- T
     (il tempo di volo, quindi la quota b.vz=280*T qui sotto) NON cambia,
     solo la velocita' orizzontale si ferma al tetto. */
  if(kickBall(p, dx/dist, dy/dist, Math.min(TIRO_TETTO, dist/T), 0)){`,
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

/* CONTEGGIO A DELTA. Math.min(TIRO_TETTO, dist/T) deve comparire
   esattamente 1 volta (il solo sito toccato), e la vecchia forma
   dist/T, 0)){ (senza clamp) deve essere sparita. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
if (conta(out, 'kickBall(p, dx/dist, dy/dist, Math.min(TIRO_TETTO, dist/T), 0)){') !== 1) {
  rotti.push('la chiamata clampata a kickBall non e\' presente esattamente una volta');
}
if (conta(out, 'kickBall(p, dx/dist, dy/dist, dist/T, 0)){') !== 0) {
  rotti.push('la vecchia chiamata SENZA clamp e\' sopravvissuta');
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggio applicato');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
