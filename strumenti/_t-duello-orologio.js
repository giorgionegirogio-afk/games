/* =====================================================================
   _t-duello-orologio.js — IL DISCHETTO HA UN OROLOGIO FERMO
   (31 agosto 2026, dal censimento del manuale).

   IL DIFETTO. Nella scena 'freekick' il giro principale chiama
   Duel.update e MAI step(), e G.pulse avanza solo dentro step():
   per tutto il duello G.pulse e' una costante bloccata al valore del
   momento del fallo. Ma il disegno del dischetto anima CON G.pulse:
     · il respiro del mirino («prima del primo tocco il mirino RESPIRA»);
     · il dondolio e le finte del portiere («IL PORTIERE ONDEGGIA E
       ACCENNA FINTE» — puo' restare piantato con una finta a meta');
     · il ciclo 'fermo' del tiratore e l'ondina della clip di tuffo;
     · i flash dei telefonini della tribuna («e' quello che la fa
       sembrare viva») — mai un lampo, per costruzione.
   Tutti i verbali promettono vita; la scena e' un quadro.

   LA CURA, di solo disegno. Duel guadagna un orologio suo, vt: azzerato
   a ogni Duel.start, avanzato in Duel.update(dt) — che gira gia' a ogni
   fotogramma della scena. Il disegno usa tVivo = G.pulse + vt: parte
   dal valore congelato (nessun salto all'ingresso) e da li' cammina.
   La fisica del duello non lo sa nemmeno: chi para e chi segna lo
   decide resolve(), che non legge ne' pulse ne' vt. Zero sorteggi
   consumati: la legge dei banchi a seme fisso non si sfasa.

   Prova A/B: due fotografie della fase 'zone' a 600 ms di distanza —
   prima della cura sono identiche al pixel (scena congelata), dopo
   differiscono (respiro, finte, flash).

   uso:  node strumenti/_t-duello-orologio.js --out fuori/duello.html
         node strumenti/_t-duello-orologio.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/duello.html'));

const ANCORE = [

/* 1 — l'orologio nasce azzerato a ogni duello */
{
  nome: '1/9 vt azzerato in Duel.start',
  cerca:
`    this.phase='zone'; this.cpuT=rnd(0.5,1.1); this.poseT=0;`,
  metti:
`    this.phase='zone'; this.cpuT=rnd(0.5,1.1); this.poseT=0;
    /* l'orologio VIVO del dischetto: G.pulse qui e' fermo (step non
       gira in freekick), vt avanza in update e anima il solo disegno */
    this.vt=0;`,
},

/* 2 — e avanza a ogni fotogramma della scena */
{
  nome: '2/9 vt avanza in Duel.update',
  cerca:
`  update(dt){
    const s=this;`,
  metti:
`  update(dt){
    const s=this;
    s.vt+=dt;   /* orologio vivo del disegno: la fisica non lo legge */`,
},

/* 3 — i flash della tribuna tornano a lampeggiare */
{
  nome: '3/9 flashTribuna',
  cerca:
`  const t=G.pulse;
  ctx.save();
  ctx.globalCompositeOperation='lighter';`,
  metti:
`  /* G.pulse in freekick e' fermo: senza vt questi flash — «il pezzo
     che la fa sembrare viva» — non lampeggiavano MAI (31 ago 2026) */
  const t=G.pulse+(Duel.vt||0);
  ctx.save();
  ctx.globalCompositeOperation='lighter';`,
},

/* 4 — l'orologio del disegno dentro drawDuelScene */
{
  nome: '4/9 tVivo dichiarato',
  cerca:
`  const g=duelGeo();
  const rt=(D.phase==='result')?D.resultT:0;`,
  metti:
`  const g=duelGeo();
  const rt=(D.phase==='result')?D.resultT:0;
  /* L'OROLOGIO VIVO (31 agosto 2026). G.pulse avanza solo in step(), e
     in freekick step non gira: tutte le animazioni d'attesa qui sotto
     erano costanti — mirino senza respiro, portiere piantato con la
     finta a meta', tiratore di pietra. tVivo parte dal pulse congelato
     e cammina con l'orologio del duello: solo disegno, zero sorteggi. */
  const tVivo=G.pulse+(D.vt||0);`,
},

/* 5 — il respiro del mirino */
{
  nome: '5/9 il mirino respira',
  cerca:
`      const bat = (!preso && SAVE.moto) ? 1+0.10*Math.sin(G.pulse*4.2) : 1;`,
  metti:
`      const bat = (!preso && SAVE.moto) ? 1+0.10*Math.sin(tVivo*4.2) : 1;`,
},

/* 6 — la finta del portiere scatta davvero, e il verbale si rettifica */
{
  nome: '6/9 il ciclo delle finte',
  cerca:
`       vale due volte e mezzo il suo scarto, e piega anche il busto (yaw) e
       la piega delle ginocchia (u della clip). Zero stato nuovo, zero
       estrazioni: e' tutta funzione di G.pulse, quindi al banco a passo
       fisso la fotografia resta ripetibile. */
    const fCiclo=G.pulse*0.47;`,
  metti:
`       vale due volte e mezzo il suo scarto, e piega anche il busto (yaw) e
       la piega delle ginocchia (u della clip). Zero stato nuovo, zero
       estrazioni: e' tutta funzione di G.pulse, quindi al banco a passo
       fisso la fotografia resta ripetibile.
       RETTIFICA (31 agosto 2026): G.pulse in freekick era FERMO — la
       finta promessa qui sopra non scattava mai, il portiere restava
       congelato dov'era. Adesso il tempo lo da' tVivo (pulse + vt del
       duello): uno stato nuovo c'e', ma e' di solo disegno e al banco
       che congela il fotogramma resta ripetibile uguale. */
    const fCiclo=tVivo*0.47;`,
},

/* 7 — il dondolio del portiere */
{
  nome: '7/9 il dondolio',
  cerca:
`    const idle=(ris||!moto)?0:Math.sin(G.pulse*2.1)*g.GW*0.030;`,
  metti:
`    const idle=(ris||!moto)?0:Math.sin(tVivo*2.1)*g.GW*0.030;`,
},

/* 8 — l'ondina della clip di tuffo */
{
  nome: '8/9 la clip di tuffo',
  cerca:
`      clipK='tuffo'; uK = moto ? 0.080+0.022*Math.sin(G.pulse*2.1)+0.055*Math.abs(finta) : 0.085;`,
  metti:
`      clipK='tuffo'; uK = moto ? 0.080+0.022*Math.sin(tVivo*2.1)+0.055*Math.abs(finta) : 0.085;`,
},

/* 9 — il ciclo 'fermo' del tiratore */
{
  nome: '9/9 il tiratore respira',
  cerca:
`      clipS='fermo'; uS=(G.pulse*0.5)%1;`,
  metti:
`      clipS='fermo'; uS=(tVivo*0.5)%1;`,
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
  ['tVivo', 8],   // dichiarazione + 5 usi + il suo verbale + la rettifica
  ['this.vt=0;', 1],
  ['s.vt+=dt;', 1],
  ['(Duel.vt||0)', 1],
  ['(D.vt||0)', 1],
  // dentro la scena del duello non deve restare nessun G.pulse vivo
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
