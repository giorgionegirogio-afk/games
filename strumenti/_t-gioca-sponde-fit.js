/* =====================================================================
   _t-gioca-sponde-fit.js — LA RIGA SPONDE HA RIMANGIATO IL MARGINE DELLA
   SCHERMATA GIOCA (voce #87, compito 5, 18 settembre 2026).

   IL PERCHE'. La batteria completa del compito 5 (`node strumenti/tutti.js
   --solo collaudo,tocco,istantanea`) ha trovato `tocco` ROSSO: 5 bersagli
   su 722 "si vedono e non si toccano" — #btnCambiaCampo, sulla schermata
   GIOCA, a 811x384/812x375/740x360/640x360/568x320 (le cinque taglie di
   telefono coricato in batteria). A riposo il bottone e' visibile ma il
   colpo al suo centro va a #btnBackGioca (la barra fissa in fondo):
   ESATTAMENTE il difetto del 28 agosto 2026 gia' curato allora con un
   sistema a tre gradini di media query.

   LA CAUSA, misurata (non dedotta): la riga SPONDE (compito 1 di questa
   voce, "eti" + "diff-row" nuovi) costa ~70 px in piu' sulla schermata
   GIOCA — e la toppa del 28 agosto lasciava solo 2 px di margine a
   915x412 ("chi ha dieci pixel da spendere sa dove metterli", diceva il
   suo stesso commento). Il quinto blocco ha rimangiato quel margine e
   riaperto il difetto su TUTTE le taglie di telefono coricato in
   batteria tranne 915x412 e 811x384... anzi anche quella: misurato rosso
   su tutte e cinque.

   LA CURA e' solo CSS, sui breakpoint della schermata GIOCA gia'
   esistenti (nessuna riga nuova, nessun @media nuovo): si spende
   l'imbottitura che il commento del 28 agosto aveva lasciato in dote
   (pastiglie 5px 4px -> 3px 4px sotto i 540 px di altezza), si stringono
   margini di .eti/.diff-row/titolo, e si chiude un'OMISSIONE vera: le
   due regole "sotto i 540" e "sotto i 340" comprimevano/nascondevano la
   riga piccola di .taglia e .ment ma MAI di .sponde (la classe non
   esisteva ancora quando quelle regole furono scritte, il 28 agosto) —
   .sponde restava all'imbottitura piena mentre le sue sorelle si
   stringevano, un residuo di 6-7 px pagato ad ogni riga.

   IL BERSAGLIO DEL POLLICE SCENDE (dichiarato, non addolcito): 42 px ->
   37 px sotto i 540 px di altezza — sette sotto il riferimento di 44,
   nove sotto i 46 del FISCHIO FINALE. tocco.js torna verde (722/722,
   zero "si vede e non si tocca"): la correttezza (il dito arriva dove
   vede) viene prima della comodita' del bersaglio, e il file dichiara
   dove sta il nuovo compromesso, con la rettifica in stile edizioni
   scritta nel commento stesso — non una sola riga cancellata in silenzio.

   LEGGE DEI SORTEGGI: zero chiamate a dado() qui, solo CSS. Verificato
   dopo: _q-determinismo 13/13 e _c3-sorteggi (tutte le taglie) identici
   prima e dopo questo attrezzo (nessuna nuova divergenza attribuibile a
   questa toppa: le uniche divergenze del ramo restano quelle gia' note,
   a 11 e sulla corsa dedicata a 5-campo-vero, tutte di natura fisica —
   ballWalls/posaBattuta — non di CSS).

   uso:  node strumenti/_t-gioca-sponde-fit.js --out fuori/gioca-fit.html
         node strumenti/_t-gioca-sponde-fit.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioca-fit.html'));

const ANCORE = [

{
  nome: '1/4 il racconto dell\'imbottitura, in cima al commento C',
  cerca:
`   Le pastiglie perdono 3 px di imbottitura sopra e 3 sotto (da 8px 4px a
   5px 4px).
   QUANTO RESTANO ALTE, MISURATO IL 28 AGOSTO 2026 A SERA coi caratteri`,
  metti:
`   Le pastiglie perdono imbottitura sopra e sotto: 8px 4px alla nascita
   (28 agosto 2026) -> 5px 4px lo stesso giorno -> 3px 4px il 18
   settembre 2026 (voce #87, vedi la rettifica sotto: la riga SPONDE ha
   preteso il resto del margine).
   QUANTO RESTAVANO ALTE PRIMA DI QUESTA TOPPA, MISURATO IL 28 AGOSTO 2026 A SERA coi caratteri`,
},
{
  nome: '2/4 la rettifica in coda al commento C (bersaglio 42 -> 37 px)',
  cerca:
`   IL NUMERO VERO, DICHIARATO INVECE CHE ADDOLCITO: qui il bersaglio del
   pollice e' alto 42 px, due sotto i 44 di riferimento e quattro sotto i
   46 che il FISCHIO FINALE si e' dato. Non si alza in questa toppa:
   costerebbe una decina di pixel di altezza a una schermata che a
   915x412 ne avanza due (eccedenza misurata 2 px). Resta scritto, e chi
   ha dieci pixel da spendere sa dove metterli. */`,
  metti:
`   IL NUMERO VERO, DICHIARATO INVECE CHE ADDOLCITO (28 agosto 2026): qui
   il bersaglio del pollice era alto 42 px, due sotto i 44 di riferimento
   e quattro sotto i 46 che il FISCHIO FINALE si e' dato. Non si alza in
   questa toppa: costerebbe una decina di pixel di altezza a una
   schermata che a 915x412 ne avanza due (eccedenza misurata 2 px). Resta
   scritto, e chi ha dieci pixel da spendere sa dove metterli.

   RETTIFICA (18 settembre 2026, voce #87): la riga SPONDE (eti+diff-row,
   ~70 px in piu' a 812x375: eti 16+margini, diff-row 42+margini prima di
   questa stessa toppa) ha rimangiato l'intero margine di 2 px che
   restava a 915x412 e ha riaperto IL DIFETTO STESSO DEL 28 AGOSTO su
   CAMBIA CAMPO/#btnBackGioca, a 811x384, 812x375, 740x360 e 640x360
   (misurato: tocco.js, 5 bersagli su 722 "a riposo si VEDE ma il colpo
   va a #btnBackGioca"). Sono stati spesi i "dieci pixel" che il testo
   del 28 agosto prevedeva: imbottitura delle pastiglie da 5px 4px a
   3px 4px (-4 px per riga), piu' margini di .eti/.diff-row e titolo
   ulteriormente ridotti. IL BERSAGLIO E' ORA 37 px — sette sotto i 44 di
   riferimento, nove sotto i 46 — dichiarato, non addolcito: tocco.js
   torna verde (722/722, zero "si vede e non si tocca"). Se una sesta
   voce dovesse entrare in questa colonna, la strada dell'imbottitura e'
   finita: serve un'altra architettura (non un ottavo pixel da qui). */`,
},
{
  nome: '3/4 il blocco CSS sotto i 540 px (ov/titolo/eti/diff-row/pastiglie)',
  cerca:
`@media (max-height:540px){
  #gioca.ov{padding:8px 16px}
  #gioca .sotto-titolo{font-size:26px;margin:0 0 4px;padding-bottom:8px}
  #gioca .giocariga{gap:14px;margin:0 auto}
  #gioca .eti{margin:2px 0 2px}
  #gioca .diff,#gioca .taglia,#gioca .ment{padding:5px 4px}
  #gioca .taglia small,#gioca .ment small{margin-top:1px}
  #gioca .frase.stretta{padding:3px 14px;font-size:12.5px}
  #gioca .azioni{margin-top:4px;padding-top:12px}
}`,
  metti:
`@media (max-height:540px){
  #gioca.ov{padding:6px 16px}
  #gioca .sotto-titolo{font-size:22px;margin:0 0 2px;padding-bottom:5px}
  #gioca .giocariga{gap:14px;margin:0 auto}
  #gioca .eti{margin:1px 0 1px}
  #gioca .diff-row{margin:1px auto 0}
  #gioca .diff,#gioca .taglia,#gioca .ment,#gioca .sponde{padding:3px 4px}
  #gioca .taglia small,#gioca .ment small,#gioca .sponde small{margin-top:0}
  #gioca .frase.stretta{padding:3px 14px;font-size:12.5px}
  #gioca .azioni{margin-top:4px;padding-top:12px}
}`,
},
{
  nome: '4/4 sotto i 340 px: .sponde small manca dalla riga che nasconde le righine',
  cerca:
`  #gioca .taglia small,#gioca .ment small{display:none}`,
  metti:
`  #gioca .taglia small,#gioca .ment small,#gioca .sponde small{display:none}`,
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

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
