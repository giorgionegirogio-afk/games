/* =====================================================================
   _t-undici-fisica.js — L'ONDA DELLA FISICA, PRIMA META': la velocita'
   di rinvii e appoggi conosce la distanza (23 agosto 2026).

   LA DIAGNOSI (ripresa.md §2, misurata su 54 partite): a 11 contro 11
   la palla non e' di nessuno il 77% del tempo, perche' il 22% degli
   appoggi e TUTTI i rinvii del portiere chiedono al pallone fino a
   1500 unita' quando le velocita' fisse gliene concedono ~950. Il
   pallone muore fra chi lo calcia e chi lo aspetta, e la partita e'
   una serie di palle perse a centrocampo: 0-0 nel 52% dei casi.

   LA CURA E' UNA LEGGE CHE IL GIOCO HA GIA': tiroVelocita insegna che
   la velocita' di partenza si decide sul punto d'arrivo — base di ieri
   come pavimento, arrivo voluto piu' attrito per la strada, tetto del
   pallone come soffitto. Qui la stessa legge entra nel rinvio del
   portiere (470 fisse) e nell'appoggio della CPU (tappo a 500):
   si arriva sul compagno a 180 unita'/s — giocabile — mai sotto i
   numeri di ieri, mai sopra TIRO_TETTO.

   COSA CAMBIA ALLE TRE TAGLIE (TIRO_ATTR scala col campo: 1,05 a 5,
   0,75 a 7, 0,525 a 11):
     · a 5 il rinvio tipico (500 u) passa da 470 a ~705 e ARRIVA sul
       compagno; l'appoggio cambia solo oltre le ~355 unita', dove gia'
       oggi moriva per strada;
     · a 11 un rinvio da 1500 u parte a ~970 invece di 470, e arriva.

   NON TOCCA: i passaggi umani (giocati col dito, gia' a legge propria),
   i tiri (gia' su tiroVelocita), il numero dei sorteggi (zero Math.
   random in piu': i banchi a seme fisso non si sfasano).

   Cancello: strumenti/_q-meta.js --tre-taglie (nato ROSSO apposta
   sull'11: 52% di 0-0 contro il 33% ammesso).

   uso:  node strumenti/_t-undici-fisica.js --out fuori/undici.html
         node strumenti/_t-undici-fisica.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — il rinvio del portiere */
{
  nome: '1/2 rinvioPortiere: la velocita' + String.fromCharCode(39) + ' conosce la distanza',
  cerca:
`  const dx=tx-p.x, dy=ty-p.y, l=Math.max(1,len(dx,dy));
  b.owner=-1; segnaTocco(G.players.indexOf(p));
  b.vx=dx/l*470; b.vy=dy/l*470; b.vz=90;`,
  metti:
`  const dx=tx-p.x, dy=ty-p.y, l=Math.max(1,len(dx,dy));
  b.owner=-1; segnaTocco(G.players.indexOf(p));
  /* LA VELOCITA' CONOSCE LA DISTANZA (23 ago 2026). 470 fisse coprivano
     ~600 unita' a 5 e ~1045 a 11 (150 in volo piu' v/attrito a terra),
     e il bersaglio di questo rinvio — il compagno piu' avanzato — a 11
     sta anche a 1500: TUTTI i rinvii dell'11 morivano a meta' strada,
     e la palla non era di nessuno il 77% del tempo (ripresa.md §2).
     La legge e' quella dei tiri (tiroVelocita): si parte con quel che
     serve per PRESENTARSI sul bersaglio a velocita' giocabile (180),
     mai sotto il 470 di ieri, mai sopra il tetto del pallone. */
  const vr=Math.min(TIRO_TETTO, Math.max(470, 180 + TIRO_ATTR*l));
  b.vx=dx/l*vr; b.vy=dy/l*vr; b.vz=90;`,
},

/* 2 — l'appoggio della CPU */
{
  nome: '2/2 eseguiAiPass: il tappo a 500 impara la legge',
  cerca:
`  const spd=clamp(300+l*0.9,320,500)*(botch?rnd(0.7,1.1):1);`,
  metti:
`  /* IL TAPPO A 500 NON SAPEVA QUANT'E' GRANDE IL CAMPO (23 ago 2026):
     a 11 copre ~950 unita' e il 22% degli appoggi ne chiedeva fino a
     1500 — il pallone moriva fra i due. Stessa legge del rinvio e dei
     tiri: si arriva sul compagno a 180, mai sotto la rampa di ieri,
     mai sopra il tetto. A 5 cambia solo oltre le ~355 unita', dove
     gia' oggi il passaggio moriva per strada. L'errore umano (botch)
     moltiplica DOPO, come ieri: un passaggio sbagliato resta sbagliato
     anche di potenza. */
  const spd=Math.min(TIRO_TETTO, Math.max(clamp(300+l*0.9,320,500), 180 + TIRO_ATTR*l))*(botch?rnd(0.7,1.1):1);`,
},

/* NOTA DEL 23 AGOSTO 2026 — LA CURA DELLA ZONA DI TIRO E' STATA PROVATA
   E BOCCIATA CON LA MISURA, due volte. La diagnosi proponeva di
   stringere la zona a ~600 unita' («il 58% dei tiri da 656-892 muore su
   un corpo»). Misurato su 30 partite a seme fisso: con le sole leggi di
   velocita' l'11 fa 40% di 0-0; AGGIUNGENDO il tetto a 600 sale a 73%
   (tiri mediana da 8 a 5,5) — e resta 73% anche portando la punta a 500
   dalla porta. Un tiro murato e' comunque un evento (rimpalli, angoli,
   ribattute): toglierlo toglie piu' di quel che rende. La zona resta
   quella di ieri, e questa nota impedisce di riprovarla senza numeri
   nuovi. */

/* NOTA DEL 23 AGOSTO 2026 — ANCHE LA PUNTA A 500 DALLA PORTA E' STATA
   PROVATA E BOCCIATA CON LA MISURA: sopra le due leggi di velocita'
   (40% di 0-0) portare la stazione della punta da 690 a 500 unita'
   dalla porta ALZA lo 0-0 al 50% — i tiri salgono (8 -> 10) ma i gol
   no, e la squadra perde un uomo dalla manovra. Due cure su tre della
   diagnosi originaria non reggono la prova: restano le due leggi di
   velocita', che da sole valgono 52% -> 40%. */

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-undici-fisica.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.undici.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}
const attesi = [
  ['const vr=Math.min(TIRO_TETTO, Math.max(470, 180 + TIRO_ATTR*l));', 1],
  ['Math.max(clamp(300+l*0.9,320,500), 180 + TIRO_ATTR*l)', 1],
  ['dx/l*470', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
