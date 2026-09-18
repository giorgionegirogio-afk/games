/* =====================================================================
   _t-anello-fiato.js — L'ANELLO DEL FIATO ATTORNO AL COMANDATO
   (voce #112, compito 5, quinto compito del ramo voce-112-spiccioli-ux).

   IL PERCHE'. Puro contorno, zero simulazione (il due-versioni resta
   0/60 a ogni taglia: e' un tratto di disegno in piu' sulla stessa
   ellisse, non una decisione -- non tocca dado(), una decisione di
   gioco o uno stato che la CPU legge).

   IL PRECEDENTE DIRETTO e' anelloContenimento (compito 7, voce #88):
   archi ciano DENTRO l'anello ambra del comandato, mai sopra, stessa
   scala (P_DIS) e fase (G.pulse/SAVE.moto). Qui la stessa disciplina
   vale per p.fiato (0..100, il carburante dello scatto): un arco che
   parte dall'alto (-PI/2) e avanza in SENSO ORARIO in proporzione a
   p.fiato/100 -- pieno a fiato 100, sparisce a fiato 0.

   LA QUARTA TINTA. La palette del comandato usa gia' ambra (controllo)
   e ciano (contenimento): serve una tinta distinguibile da entrambe,
   e MAI grigio/nero (istantanea.js la conterebbe come un'ombra sul
   manto, il segnale d'allarme della ricognizione del 18 settembre).
   Si sceglie verde-lime a bassa alfa, rgba(190,255,120,.85): il
   canale G domina nettamente su R e su B, lontano sia dall'arancio
   dell'ambra (R>>G>B) sia dal ciano del contenimento (G~B>>R).

   LA STESSA ELLISSE, NON UNA PROPRIA. anelloContenimento disegna la
   sua ellisse piu' STRETTA (arx=14.6 contro i 19.2 dell'ambra) per
   stare visibilmente dentro. Qui lo spec vuole l'arco sulla STESSA
   ellisse dell'anello ambra (stesso centro p.x+2.5,p.y+6.6, stessi
   arx/ary): il vincolo "non sporgere oltre arx" si rispetta restando
   DENTRO il budget gia' verificato per l'ambra stessa (commento sopra
   anelloComandato: "estremo laterale (2,5+20,6+1,7)x1,18=29,3<30" --
   il +1,7 e' meta' del lineWidth 3,4 dell'ambra). Un lineWidth di 2,0
   (meta' 1,0 < 1,7) sulla stessa ellisse non aggiunge NESSUNO sporgere
   oltre quanto l'ambra ha gia' messo in conto: il raggio da cui
   collaudo.js campiona l'erba resta pulito senza bisogno di una nuova
   ellisse inset.

   IL BUCO DELLA PALLA. bucoPalla() (drawSegniTerra) fa gia' un
   ctx.save()+clip('evenodd') PRIMA di chiamare anelloComandato, e lo
   restore() solo alla fine del giro su tutti i giocatori: qualunque
   cosa si disegni DENTRO anelloComandato (compreso questo arco) eredita
   il buco automaticamente, perche' e' lo stesso ctx globale dentro la
   stessa finestra di clip. Nessuna modifica a bucoPalla ne' al punto in
   cui viene chiamata: la cura resta dentro il corpo di anelloComandato,
   dopo il filo di luce e prima della freccia di direzione.

   DEFAULT: mostrato solo per il comandato, perche' anelloComandato si
   chiama gia' solo per isCtrl (drawSegniTerra, invariato) -- nessun HUD
   globale nuovo, nessuna voce in zoneInterfaccia (l'esenzione del
   disegno dentro anelloComandato vale gia' per l'ambra e il contenimento).

   uso:
     node strumenti/_t-anello-fiato.js --out fuori/a5-fiato.html
     node strumenti/_t-anello-fiato.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/a5-fiato.html'));

/* CONTROLLO ANTI-ATTESTAZIONE: se la quarta tinta esiste gia' nel file,
   questo attrezzo si ferma invece di sovrapporsi. */
if (!haFlag('elenco')) {
  const srcGrezzo = fs.readFileSync(inFile, 'utf8');
  if (srcGrezzo.indexOf('rgba(190,255,120') >= 0) {
    console.error('FALLITO: "rgba(190,255,120" esiste gia\' nel file — controllare prima di applicare.');
    process.exit(1);
  }
}

const ANCORE = [

/* 1/1 — dentro anelloComandato, subito dopo il filo di luce e prima
   della freccia di direzione: l'arco del fiato, sulla STESSA ellisse
   (stesso centro, stessi arx/ary), quarta tinta, in senso orario dalle
   ore 12. Ancora: il filo di luce (rgba(255,232,186,.28)) e' unico nel
   file, compare solo qui dentro anelloComandato. */
{
  nome: '1/1 anelloComandato: arco del fiato dopo il filo di luce',
  cerca:
`  ctx.strokeStyle='rgba(255,232,186,.28)'; ctx.lineWidth=1.3;
  ctx.beginPath(); ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0, 0.80*Math.PI,1.40*Math.PI); ctx.stroke();
`,
  metti:
`  ctx.strokeStyle='rgba(255,232,186,.28)'; ctx.lineWidth=1.3;
  ctx.beginPath(); ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0, 0.80*Math.PI,1.40*Math.PI); ctx.stroke();
  /* L'ANELLO DEL FIATO (voce #112, compito 5): arco parziale sulla
     STESSA ellisse dell'ambra (stesso centro, stessi arx/ary -- non
     un'ellisse propria come anelloContenimento, che invece vive PIU'
     STRETTA per starci dentro). Parte dall'alto (-PI/2) e avanza in
     SENSO ORARIO in proporzione a p.fiato/100: pieno a fiato 100
     (arco = giro intero), sparisce a fiato 0 (arco degenere, zero
     pixel). QUARTA tinta -- non ambra=controllo, non ciano=
     contenimento -- verde-lime a bassa alfa, mai grigio/nero
     (istantanea.js lo conterebbe come un'ombra sul manto). LineWidth
     2,0 (meta' 1,0 < 1,7): resta dentro il budget gia' verificato
     sopra per l'ambra stessa (arx+1,7)x1,18=29,3<30 -- nessuno sporgere
     nuovo oltre l'ambra. Il buco della palla (bucoPalla, drawSegniTerra)
     lo taglia da solo: e' lo stesso ctx, dentro la stessa finestra di
     clip che gia' incornicia l'ambra e il contenimento. */
  ctx.strokeStyle='rgba(190,255,120,.85)'; ctx.lineWidth=2.0;
  ctx.beginPath();
  ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0, -Math.PI/2, -Math.PI/2+(p.fiato/100)*2*Math.PI);
  ctx.stroke();
`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-anello-fiato.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}

/* controlli dopo la sostituzione: i ganci che il banco si aspetta */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ["ctx.strokeStyle='rgba(190,255,120,.85)'; ctx.lineWidth=2.0;", 1],
  ["ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0, -Math.PI/2, -Math.PI/2+(p.fiato/100)*2*Math.PI);", 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    ora: node strumenti/_q-accessibile.js   deve dare 7/7');
