/* =====================================================================
   _t-freccia-fiato.js — L'ANELLO DEL FIATO NON SI FA PIU' MANGIARE DALLA
   FRECCIA (voce #122, #115, cantierino "spiccioli seguiti").

   IL PERCHE'. Puro contorno, zero simulazione (il due-versioni resta
   0/60 a ogni taglia: e' un riordino del pennello sulla stessa ellisse,
   non una decisione -- non tocca dado(), una decisione di gioco o uno
   stato che la CPU legge). Nessuna geometria cambia: stessi arx/ary,
   stesso centro, stesso angolo di partenza, la stessa proporzione
   p.fiato/100 -- solo L'ORDINE in cui i due tratti si disegnano.

   IL BUCO (ricognizione del 19 settembre 2026, seguito di #112 compito
   5). Dentro anelloComandato(p) l'arco del fiato (rgba(190,255,120,.85),
   voce #112 compito 5) si disegnava PRIMA della freccia di direzione
   (il cuneo pieno rgba(255,176,32,.95) sul bordo della stessa ellisse,
   verso atan2(p.fy,p.fx)). Un cuneo pieno disegnato SOPRA un arco
   copre tutto cio' che gli sta sotto, quindi ogni volta che la
   direzione di corsa cadeva DENTRO la porzione accesa dell'arco lime,
   la freccia ne cancellava ~53 gradi di sviluppo (mezza larghezza del
   cuneo 0,46 rad = 26,3 gradi per lato) -- un morso che
   _q-accessibile.js (prova 7, ANELLO-FIATO) aveva scoperto e AGGIRATO
   di proposito, scegliendo la direzione finta nel margine sempre spento
   dell'arco invece di misurare il caso vero. Qui il caso vero si tratta,
   non si aggira piu': quando la corsa e' nella zona accesa, il fiato
   deve restare leggibile.

   LA CURA. Ordine di disegno: si scambiano i due blocchi cosi' che la
   FRECCIA si disegni prima e l'ARCO DEL FIATO dopo, sopra di lei. E' la
   correzione a minor rischio fra le due possibili (l'alternativa,
   freccia semi-trasparente dove attraversa il lime, avrebbe richiesto
   una seconda passata di compositing sullo stesso ctx): un riordino di
   due chiamate gia' esistenti, senza toccare nessun numero.

   uso:
     node strumenti/_t-freccia-fiato.js --elenco
     node strumenti/_t-freccia-fiato.js --out fuori/freccia-fiato.html
     node strumenti/_t-freccia-fiato.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/freccia-fiato.html'));

/* CONTROLLO ANTI-ATTESTAZIONE: se il commento della cura esiste gia' nel
   file, questo attrezzo si ferma invece di sovrapporsi. */
if (!haFlag('elenco')) {
  const srcGrezzo = fs.readFileSync(inFile, 'utf8');
  if (srcGrezzo.indexOf('DISEGNATO DOPO LA FRECCIA (voce #122, #115') >= 0) {
    console.error('FALLITO: la cura #115 esiste gia\' nel file — controllare prima di applicare.');
    process.exit(1);
  }
}

const ANCORE = [

/* 1/1 — dentro anelloComandato: l'arco del fiato e la freccia di
   direzione si scambiano di posto, COMPRESI i loro commenti (cosi' la
   spiegazione resta accanto al disegno che descrive davvero). Ancora:
   il blocco intero dal commento del fiato fino alla fine della freccia,
   unico nel file (compare solo dentro anelloComandato). */
{
  nome: '1/1 anelloComandato: l\'arco del fiato si disegna DOPO la freccia',
  cerca:
`  /* L'ANELLO DEL FIATO (voce #112, compito 5): arco parziale sulla
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
  /* LA FRECCIA DI DIREZIONE: cuneo pieno sul bordo dell'anello
     nell'angolo dei piedi (atan2(fy,fx)), base dentro il filo, punta
     appena fuori; schiacciata a terra come l'ellisse (ary/arx). */
  const fa=Math.atan2(p.fy,p.fx);
  const sq=ary/arx;
  const fcx=p.x+2.5, fcy=p.y+6.6;
  ctx.beginPath();
  ctx.moveTo(fcx+Math.cos(fa)*20.9,      fcy+Math.sin(fa)*20.9*sq);
  ctx.lineTo(fcx+Math.cos(fa+0.46)*14.2, fcy+Math.sin(fa+0.46)*14.2*sq);
  ctx.lineTo(fcx+Math.cos(fa-0.46)*14.2, fcy+Math.sin(fa-0.46)*14.2*sq);
  ctx.closePath();
  ctx.strokeStyle='rgba(0,0,0,.46)'; ctx.lineWidth=2.8; ctx.lineJoin='round'; ctx.stroke();
  ctx.fillStyle='rgba(255,176,32,.95)'; ctx.fill();
`,
  metti:
`  /* LA FRECCIA DI DIREZIONE: cuneo pieno sul bordo dell'anello
     nell'angolo dei piedi (atan2(fy,fx)), base dentro il filo, punta
     appena fuori; schiacciata a terra come l'ellisse (ary/arx).
     DISEGNATA PRIMA DELL'ARCO DEL FIATO (voce #122, #115): vedi il
     commento sull'arco qui sotto per il perche' del riordino. */
  const fa=Math.atan2(p.fy,p.fx);
  const sq=ary/arx;
  const fcx=p.x+2.5, fcy=p.y+6.6;
  ctx.beginPath();
  ctx.moveTo(fcx+Math.cos(fa)*20.9,      fcy+Math.sin(fa)*20.9*sq);
  ctx.lineTo(fcx+Math.cos(fa+0.46)*14.2, fcy+Math.sin(fa+0.46)*14.2*sq);
  ctx.lineTo(fcx+Math.cos(fa-0.46)*14.2, fcy+Math.sin(fa-0.46)*14.2*sq);
  ctx.closePath();
  ctx.strokeStyle='rgba(0,0,0,.46)'; ctx.lineWidth=2.8; ctx.lineJoin='round'; ctx.stroke();
  ctx.fillStyle='rgba(255,176,32,.95)'; ctx.fill();
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
     clip che gia' incornicia l'ambra e il contenimento.
     DISEGNATO DOPO LA FRECCIA (voce #122, #115, rilievo del cantierino
     19 settembre 2026): prima l'arco veniva disegnato PRIMA della
     freccia, e il cuneo pieno della freccia ne copriva ~53 gradi di
     sviluppo (mezza larghezza del cuneo 0,46 rad = 26,3 gradi per lato)
     ogni volta che la direzione di corsa cadeva nella zona accesa.
     Nessuna geometria e' cambiata: stessi arx/ary, stesso centro,
     stesso angolo di partenza e la stessa proporzione p.fiato/100 --
     solo l'ordine del pennello: l'arco disegnato ADESSO sta sempre in
     cima e resta leggibile per intero. */
  ctx.strokeStyle='rgba(190,255,120,.85)'; ctx.lineWidth=2.0;
  ctx.beginPath();
  ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0, -Math.PI/2, -Math.PI/2+(p.fiato/100)*2*Math.PI);
  ctx.stroke();
`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-freccia-fiato.js — ' + ANCORE.length + ' ancoraggi:');
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

/* controlli dopo la sostituzione: i ganci che il banco si aspetta,
   e nessuna riga persa o duplicata (stesse occorrenze di prima, tranne
   il commento nuovo). */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ["ctx.strokeStyle='rgba(190,255,120,.85)'; ctx.lineWidth=2.0;", 0],
  ["ctx.ellipse(p.x+2.5,p.y+6.6,arx,ary,0, -Math.PI/2, -Math.PI/2+(p.fiato/100)*2*Math.PI);", 0],
  ["const fa=Math.atan2(p.fy,p.fx);", 0],
  ["ctx.fillStyle='rgba(255,176,32,.95)'; ctx.fill();", 0],
  ['DISEGNATO DOPO LA FRECCIA (voce #122, #115', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    ora: node strumenti/_q-accessibile.js  --gioco ' + path.relative(RADICE, outFile) + '   deve dare la prova ANELLO-FIATO verde');
