/* =====================================================================
   _t-vernice-vera.js — LA VERNICE ALLE MISURE VERE (voce #86, compito 4,
   ramo voce-86-proporzioni).

   IL PERCHE'. La tavola VERNICI (compito 1) e GK_AREA_X a costante unica
   (compito 2) esistono gia': oggi portano ancora i valori storici a
   occhio (62/14/66, 112/129/146). Questo compito ci scrive dentro le
   misure vere della "tavola dei bersagli" del piano (voce #86, brief del
   compito 4), che a sua volta viene da _analisi/MISURE-UFFICIALI.md
   PARTE A. Ogni numero qui sotto porta la sua misura e la sua fonte:

     86  = 2,99 m arrotondato a 3 m FIFA Futsal Laws/A2 (raggio cerchio),
           28,75 u/m (FW 1150/40) -> 3,00*28,75=86,25 -> 86
     200 = 9,15 m IFAB Regola 1/A1 (raggio cerchio E raggio della "D",
           stesso numero perche' la regola e' la stessa in due punti del
           campo), 21,90 u/m (FW 2300/105) -> 9,15*21,90=200,3 -> 200
     7   = 0,25 m FIFA Futsal Laws/A2 (raggio arco d'angolo), 28,75 u/m
           -> 0,25*28,75=7,19 -> 7
     22  = 1,00 m IFAB Regola 1/A1 (raggio arco d'angolo), 21,90 u/m
           -> 1,00*21,90=21,90 -> 22
     106 e 27 (taglia 7) = CONVENZIONE, non misure: nessuna fonte da' un
           numero per cerchio/angolo/D a 7 (_analisi/MISURE-UFFICIALI.md
           A3: "non trovato"). Il piano sceglie: cerchio e D alla stessa
           frazione di larghezza del campo dell'11 (9,15/68=13,46% di
           784=105,5 -> 106), angolo al valore famiglia-11 in unita' 7
           (1,00*26,83=26,83 -> 27). Il banco le verifica per UGUAGLIANZA
           al valore convenuto, non per scarto: non sono misure.
     173 = 6,00 m FIFA Futsal Laws/A2 (dischetto), 28,75 u/m
           -> 6,00*28,75=172,5 -> 173
     288 = 10,00 m FIFA Futsal Laws/A2 (secondo dischetto, esiste SOLO nel
           futsal), 28,75 u/m -> 10,00*28,75=287,5 -> 288
     215 = 8,01 m UISP/A3 (dischetto, 8 m dalla linea di porta), 26,83 u/m
           -> 8,01*26,83=214,9 -> 215
     241 = 11,00 m IFAB Regola 1/A1 (dischetto), 21,90 u/m
           -> 11,00*21,90=240,9 -> 241
     0   (dArco a 5) = NIENTE: il futsal non ha la "D" (l'area e' un
           quarto di cerchio raggio 6 m da ogni palo, geometria diversa,
           non una mezzaluna sul dischetto). Guardia nuova nel pennello:
           if(VERNICE.dArco), la "D" non si disegna quando vale 0.
     120 = 5,48 m IFAB Regola 1/A1 (area di porta, profondita' 5,5 m),
           21,90 u/m -> 5,50*21,90=120,45 -> 120
     401 = 18,31 m IFAB Regola 1/A1 (area di porta, larghezza totale
           5,5+7,32+5,5=18,32 m), 21,90 u/m -> 18,32*21,90=401,2 -> 401
           SOLO a 11 (a 5/7 l'area di porta non e' un elemento distinto
           del regolamento usato per quelle taglie — vedi la tavola dei
           bersagli, colonna "-").

   QUESTO E' VERNICE PURA: nessuna regola legge cerchio, angolo, dArco,
   dischetto o porta (letto in dentroArea e nel resto del file prima di
   scrivere questo attrezzo — l'unica regola d'area e' GK_AREA_X, che
   legge VERNICE.areaProf, non toccato qui). Il confronto due-versioni
   (_c3-sorteggi) deve restare a ZERO partite divergenti su tutte e tre
   le taglie: se cambia anche un bit, il pennello ha toccato una regola,
   non e' piu' vernice pura — difetto, non conseguenza accettata.

   TRE DISEGNI NUOVI, tutti dietro guardia (0 = non disegnare):
     - la "D" (mezzaluna dell'area) non si disegna se VERNICE.dArco e' 0
       (a 5, il futsal non ce l'ha);
     - il secondo dischetto (futsal, 10 m) si disegna come il primo se
       VERNICE.dischetto2 e' diverso da 0 (oggi solo a 5);
     - l'area di porta (rettangolo interno, stile gRett come l'area
       grande) si disegna se VERNICE.portaProf e' diverso da 0 (oggi
       solo a 11), SUBITO DOPO il rettangolo dell'area grande, con la
       stessa alfa (0,92).

   areaProf/areaSemi/GOAL_H NON si toccano qui: restano i valori storici
   fino al compito 5 (porta + area), che e' anche l'unico a cui il piano
   permette divergenze nei sorteggi.

   LEGGE DEI SORTEGGI: zero chiamate nuove a dado(). Le righe toccate
   sono valori di tavola e disegno del gesso, niente intelligenza
   artificiale.

   uso:  node strumenti/_t-vernice-vera.js --out fuori/vernice-vera.html
         node strumenti/_t-vernice-vera.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/vernice-vera.html'));

const ANCORE = [

/* 1 — la tavola VERNICI: i valori storici diventano le misure vere (o
   la convenzione dichiarata, per il 7). Il commento sopra la tavola
   smette di dire "oggi replica i valori storici": da qui in poi non e'
   piu' vero per cerchio/angolo/dischetto/dArco/portaProf/portaLargh —
   solo areaProf/areaSemi restano al palo, compito 5. */
{
  nome: '1/5 la tavola VERNICI porta le misure vere',
  cerca:
`/* LA TAVOLA DELLE VERNICI (voce #86, compito 1). Ogni riga di gesso e ogni
   scatola della regola prende il numero DA QUI, per taglia: il pennello e
   dentroArea non possono piu' divergere perche' leggono lo stesso posto.
   OGGI la tavola replica i valori storici al bit (62/14/66, 118/230/112):
   i compiti 4 e 5 la porteranno alle misure vere. areaSemi=0 significa
   "usa GOAL_H*0.77 come sempre" finche' il compito 5 non decide. */
const VERNICI={
  5:{ cerchio:62, angolo:14, dArco:66, dischetto:112, dischetto2:0,
      areaProf:118, areaSemi:0, portaProf:0, portaLargh:0 },
  7:{ cerchio:62, angolo:14, dArco:66, dischetto:129, dischetto2:0,
      areaProf:136, areaSemi:0, portaProf:0, portaLargh:0 },
  11:{ cerchio:62, angolo:14, dArco:66, dischetto:146, dischetto2:0,
      areaProf:153, areaSemi:0, portaProf:0, portaLargh:0 },
};`,
  metti:
`/* LA TAVOLA DELLE VERNICI (voce #86, compito 1). Ogni riga di gesso e ogni
   scatola della regola prende il numero DA QUI, per taglia: il pennello e
   dentroArea non possono piu' divergere perche' leggono lo stesso posto.
   DAL COMPITO 4 (misura e fonte di ogni numero in
   strumenti/_t-vernice-vera.js) cerchio, angolo, dischetto e dArco sono
   le misure vere di FIFA Futsal/UISP/IFAB, non piu' i valori storici
   62/14/66/112-129-146. dArco:0 a 5 vuol dire "niente D" (il futsal non
   ce l'ha: guardia nel pennello). dischetto2 e' il secondo dischetto del
   futsal (10 m, oggi 0 alle altre taglie = non disegnato). portaProf/
   portaLargh sono l'area di porta, accesa solo a 11 (IFAB): 0 altrove
   vuol dire "non disegnata". areaProf/areaSemi restano i valori storici
   (118/136/153, areaSemi=0) finche' il compito 5 non li porta alle
   misure vere. */
const VERNICI={
  5:{ cerchio:86, angolo:7, dArco:0, dischetto:173, dischetto2:288,
      areaProf:118, areaSemi:0, portaProf:0, portaLargh:0 },
  7:{ cerchio:106, angolo:27, dArco:106, dischetto:215, dischetto2:0,
      areaProf:136, areaSemi:0, portaProf:0, portaLargh:0 },
  11:{ cerchio:200, angolo:22, dArco:200, dischetto:241, dischetto2:0,
      areaProf:153, areaSemi:0, portaProf:120, portaLargh:401 },
};`,
},

/* 2 — la dichiarazione locale del pennello guadagna PORTA_W/PORTA_H,
   accanto ad AREA_W/AREA_H/DISCH che gia' leggono la tavola dal compito
   1: stesso posto, stesso stile, per il rettangolo nuovo del passo 3. */
{
  nome: '2/5 PORTA_W/PORTA_H nascono accanto ad AREA_W/AREA_H/DISCH',
  cerca:
`  const AREA_W=VERNICE.areaProf, AREA_H=(VERNICE.areaSemi||Math.round(230*GOAL_H/150)/2)*2, DISCH=VERNICE.dischetto;`,
  metti:
`  const AREA_W=VERNICE.areaProf, AREA_H=(VERNICE.areaSemi||Math.round(230*GOAL_H/150)/2)*2, DISCH=VERNICE.dischetto;
  /* AREA DI PORTA (voce #86, compito 4): rettangolo interno, oggi acceso
     solo a 11 (VERNICE.portaProf/portaLargh diversi da 0 solo li'). */
  const PORTA_W=VERNICE.portaProf, PORTA_H=VERNICE.portaLargh;`,
},

/* 3 — l'area di porta si disegna SUBITO DOPO il rettangolo dell'area
   grande, stesso stile gRett, stessa alfa (0,92), dietro guardia: a 5/7
   PORTA_W vale 0 e il rettangolo collasserebbe comunque a un punto, ma
   la guardia lo dice in chiaro invece di fidarsi di un caso geometrico. */
{
  nome: '3/5 il rettangolo dell\'area di porta, guardia if(VERNICE.portaProf)',
  cerca:
`  for(const side of [0,1]) gRett(side?FW-AREA_W:0, FH/2-AREA_H/2, AREA_W, AREA_H, 0.92, 5);`,
  metti:
`  for(const side of [0,1]) gRett(side?FW-AREA_W:0, FH/2-AREA_H/2, AREA_W, AREA_H, 0.92, 5);
  /* AREA DI PORTA (SOLO 11, IFAB Regola 1/A1: 5,5x18,32 m): il
     rettangolo piccolo dentro l'area grande. Guardia su portaProf: a
     5/7 vale 0 e non si disegna, l'area di porta non e' un elemento di
     quelle regole. */
  if(VERNICE.portaProf) for(const side of [0,1]) gRett(side?FW-PORTA_W:0, FH/2-PORTA_H/2, PORTA_W, PORTA_H, 0.92, 5);`,
},

/* 4 — la "D" non si disegna quando dArco e' 0 (taglia 5, futsal): il
   giro dei due lati resta identico, solo avvolto in una guardia. */
{
  nome: '4/5 la "D" non si disegna se VERNICE.dArco e\' 0',
  cerca:
`  /* ARCO dell'area, la mezzaluna fuori dai 16 metri */
  for(const side of [0,1]){
    const dx0=side?FW-DISCH:DISCH;
    if(side) gArco(dx0,FH/2,VERNICE.dArco, Math.PI*0.62, Math.PI*1.38, 0.92, 5);
    else     gArco(dx0,FH/2,VERNICE.dArco, -Math.PI*0.38, Math.PI*0.38, 0.92, 5);
  }`,
  metti:
`  /* ARCO dell'area, la mezzaluna fuori dai 16 metri — NIENTE a 5: il
     futsal non ha la "D" (area = quarto di cerchio dai pali, geometria
     diversa). Guardia nuova (voce #86, compito 4): VERNICE.dArco=0
     salta il disegno invece di tracciare un arco di raggio zero. */
  if(VERNICE.dArco) for(const side of [0,1]){
    const dx0=side?FW-DISCH:DISCH;
    if(side) gArco(dx0,FH/2,VERNICE.dArco, Math.PI*0.62, Math.PI*1.38, 0.92, 5);
    else     gArco(dx0,FH/2,VERNICE.dArco, -Math.PI*0.38, Math.PI*0.38, 0.92, 5);
  }`,
},

/* 5 — il secondo dischetto del futsal (10 m), un punto come il primo,
   dietro guardia: a 7/11 dischetto2 vale 0 e non si disegna. */
{
  nome: '5/5 il secondo dischetto, guardia if(VERNICE.dischetto2)',
  cerca:
`  /* DISCHETTI DEL RIGORE: in un gioco che manda ai rigori devono esserci */
  c.fillStyle='rgba('+TH.gesso+','+Math.min(1,0.74*LA)+')';
  for(const side of [0,1]){
    c.beginPath(); c.arc(side?FW-DISCH:DISCH, FH/2, 3.4, 0, 6.2832); c.fill();
  }`,
  metti:
`  /* DISCHETTI DEL RIGORE: in un gioco che manda ai rigori devono esserci */
  c.fillStyle='rgba('+TH.gesso+','+Math.min(1,0.74*LA)+')';
  for(const side of [0,1]){
    c.beginPath(); c.arc(side?FW-DISCH:DISCH, FH/2, 3.4, 0, 6.2832); c.fill();
  }
  /* SECONDO DISCHETTO (SOLO 5, FIFA Futsal Laws/A2: 10 m): un punto
     come il primo, stessa taglia. Guardia su dischetto2: a 7/11 vale 0
     e non si disegna. */
  if(VERNICE.dischetto2) for(const side of [0,1]){
    c.beginPath(); c.arc(side?FW-VERNICE.dischetto2:VERNICE.dischetto2, FH/2, 3.4, 0, 6.2832); c.fill();
  }`,
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
/* CONTEGGI A DELTA: il file arriva qui con gli altri compiti della voce
   #86 gia' dentro (_t-tavola-vernice.js, _t-area-unica.js, ecc.). */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['cerchio:86, angolo:7, dArco:0, dischetto:173, dischetto2:288,', 1],
  ['cerchio:106, angolo:27, dArco:106, dischetto:215, dischetto2:0,', 1],
  ['cerchio:200, angolo:22, dArco:200, dischetto:241, dischetto2:0,', 1],
  ['portaProf:120, portaLargh:401 },', 1],
  ['const PORTA_W=VERNICE.portaProf, PORTA_H=VERNICE.portaLargh;', 1],
  ['if(VERNICE.portaProf) for(const side of [0,1]) gRett(side?FW-PORTA_W:0, FH/2-PORTA_H/2, PORTA_W, PORTA_H, 0.92, 5);', 1],
  ['if(VERNICE.dArco) for(const side of [0,1]){', 1],
  ['if(VERNICE.dischetto2) for(const side of [0,1]){', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
