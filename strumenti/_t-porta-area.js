/* =====================================================================
   _t-porta-area.js — LA PORTA RIENTRA NEL TETTO, E L'AREA DIVENTA LA
   SCATOLA VERA (voce #86, compito 5, ramo voce-86-proporzioni).

   IL PERCHE'. Restano due sole cose fuori scala dopo il compito 4: la
   luce della porta (GOAL_H, tetto +-20% deciso dal committente il 6
   settembre 2026) e la profondita'/semilarghezza dell'area di rigore
   (VERNICE.areaProf/areaSemi, ancora ai valori storici — areaSemi era
   SEMPRE 0, un ripiego mai speso). Questo compito porta entrambe alle
   misure vere della "tavola dei bersagli" (voce #86, brief del compito
   5), che a sua volta viene da _analisi/MISURE-UFFICIALI.md PARTE A.

   OGNI NUMERO, MISURA E FONTE:

     GOAL_H a 5: 103 = 3,58 m (+19,4% su 3,00 m FIFA Futsal Laws/A2),
           28,75 u/m -> 3,58*28,75=102,9 -> 103. Dentro il tetto +-20%
           (prima: 150u=5,22m, +73,9%, ben fuori tetto).
     GOAL_H a 11: 192 = 8,77 m (+19,8% su 7,32 m IFAB Regola 1/A1),
           21,90 u/m -> 8,77*21,90=192,1 -> 192. Dentro il tetto +-20%
           (prima: 196u=8,95m, +22,3%, appena fuori tetto).
     GOAL_H a 7: NON TOCCATA (172 = 6,41 m, +16,6% su 5,50 m UISP/A3:
           gia' dentro il tetto dal compito 1, vedi _t-tavola-vernice.js).

     areaProf a 5: 173 = 6,02 m (FIFA Futsal Laws/A2: profondita'
           risultante ~6 m), 28,75 u/m -> 6,00*28,75=172,5 -> 173.
     areaProf a 7: 268 = 9,99 m (UISP/A3: profondita' ~10 m), 26,83 u/m
           -> 10,00*26,83=268,3 -> 268.
     areaProf a 11: 361 = 16,48 m (IFAB Regola 1/A1: profondita' 16,5 m),
           21,90 u/m -> 16,50*21,90=361,35 -> 361.

     areaSemi a 5: 216 = 7,51 m (meta' di porta+2xarea: 3+6+6=15 m,
           meta' 7,5 m), 28,75 u/m -> 7,50*28,75=215,6 -> 216.
     areaSemi a 7: 288 = 10,73 m (meta' di 5,5+8+8=21,5 m, meta' 10,75 m
           — l'8 m e' il dischetto UISP/A3, CONVENZIONE al posto della
           profondita' 10 m: l'UISP non fissa una larghezza d'area,
           "non trovato" in A3, e il piano sceglie questa estensione
           laterale, non una misura indipendente), 26,83 u/m ->
           10,75*26,83=288,4 -> 288.
     areaSemi a 11: 441 = 20,13 m (meta' di 7,32+16,5+16,5=40,32 m, meta'
           20,16 m), 21,90 u/m -> 20,16*21,90=441,5 -> 441.

   CON areaSemi>0 A TUTTE LE TAGLIE i due ripieghi che il compito 1 aveva
   lasciato per questo giorno diventano rami morti DOCUMENTATI, non
   rimossi (il contesto di casa li dichiara ripiego di progetto, non
   codice morto per errore):
     - dentroArea:  (VERNICE.areaSemi || GOAL_H*0.77)   -> sempre il primo ramo
     - il pennello:  (VERNICE.areaSemi || Math.round(230*GOAL_H/150)/2)*2  -> idem
   Censiti PRIMA di scrivere questo attrezzo (grep -n "GOAL_H\*0.77"
   e grep -n "0\.77" su tutto il file): l'UNICO lettore del ripiego
   0,77 legato all'area e' dentroArea; le altre occorrenze di "0.77"
   nel file (curve di rig, glifo '2', quadraticCurveTo, zoom di camera)
   non hanno niente a che fare con l'area e non sono state toccate.
   GK_AREA_X e' stato censito allo stesso modo (grep -n "GK_AREA_X"):
   un solo scrittore (setTaglia, GK_AREA_X=VERNICE.areaProf) e un solo
   lettore di regola (dentroArea, che finestraRovesciata usa di
   riflesso); i clamp del portiere (dive, posizionamento, uscita verso
   il cross) leggono lo STESSO valore per restare dentro la stessa
   scatola, non una copia divergente — nessun BLOCKED.

   RETTIFICA DEL COMMENTO STORICO SULLA PORTA (edizioni, non solo
   numeri): "la porta cresce MENO del campo (x1.15/x1.3): se crescesse
   con lui il portiere sparirebbe" descriveva un FATTORE DI SCALA fisso,
   mai piu' vero da questo compito in poi (103/172/192 non sono 150/
   172/196 scalati da x1.15/x1.3, sono il tetto +-20% del 6 settembre
   2026). La RAGIONE resta la stessa di sempre — oltre un certo punto il
   portiere sparirebbe dentro una porta troppo grande per il suo corpo —
   il commento adesso lo dice coi numeri giusti.

   QUESTO COMPITO CAMBIA COMPORTAMENTO A TUTTE E TRE LE TAGLIE (a 7 SOLO
   l'area: la porta del 7 non si tocca). Il confronto due-versioni deve
   DIVERGERE a 5, 7 e 11 — l'unico compito della voce #86 che diverge
   ovunque. Nessuna chiamata nuova a dado(): sono valori di tavola letti
   da regole gia' scritte (dentroArea/GK_AREA_X, compiti 1-2).

   RILIEVO CRITICO, TROVATO DA QUESTO STESSO COMPITO (ancore 5 e 6). Il
   primo giro di applicazione (ancore 1-4) e' passato tutti i cancelli
   tranne uno: il confronto due-versioni a 5 restava 0/20 partite
   diverse, quando il piano dichiara DIVERGE. La causa non e' nell'area
   ne' nella porta appena scritte: e' che GOAL_H e GK_AREA_X nascono
   come DUE LETTERALI SEPARATI (`let GOAL_H = 150;`, `let GK_AREA_X =
   118;`), tenuti a mano uguali a TAGLIE[5].GOAL_H/VERNICI[5].areaProf, e
   setTaglia(n) ha una guardia `if(n===TAGLIA) return;` che non li
   riassegna quando la taglia richiesta e' GIA' quella corrente — cioe'
   MAI per chi entra in una partita a 5 senza prima essere passato da
   un'altra taglia (il caso comune: il gioco parte gia' a TAGLIA=5).
   Finche' i due numeri coincidevano per costruzione (compiti 1-4, mai
   toccato GOAL_H/areaProf a 5) la staleness era invisibile: il letterale
   sbagliato e la tavola dicevano la stessa cosa per caso. Da questo
   compito NON lo dicono piu': senza la cura, la partita a 5 VERA (non il
   banco, che passa sempre da un size esplicito ma su una pagina fresca
   parte comunque da TAGLIA=5) avrebbe tenuto porta e area vecchie per
   sempre — il numero scritto nella tavola, mai eseguito. La cura e' la
   STESSA gia' in uso per VERNICE (`let VERNICE=VERNICI[5];`, compito 1):
   leggere la tavola invece di un secondo numero scritto a mano, cosi'
   il letterale non puo' piu' divergere dalla tavola qualunque cosa
   faccia setTaglia.

   uso:  node strumenti/_t-porta-area.js --out fuori/porta-area.html
         node strumenti/_t-porta-area.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/porta-area.html'));

const ANCORE = [

/* 1 — GOAL_H a 5: 150 -> 103 (3,58 m, +19,4% su 3,00 m FIFA Futsal). */
{
  nome: '1/4 TAGLIE[5].GOAL_H 150 -> 103',
  cerca:
`  5:{ FW:1150, FH:560,  GOAL_H:150, kPasso:1,    nome:'5 CONTRO 5',`,
  metti:
`  5:{ FW:1150, FH:560,  GOAL_H:103, kPasso:1,    nome:'5 CONTRO 5',`,
},

/* 2 — GOAL_H a 11: 196 -> 192 (8,77 m, +19,8% su 7,32 m IFAB). */
{
  nome: '2/4 TAGLIE[11].GOAL_H 196 -> 192',
  cerca:
`  11:{ FW:2300, FH:1490, GOAL_H:196, kPasso:1.3,  nome:'11 CONTRO 11',`,
  metti:
`  11:{ FW:2300, FH:1490, GOAL_H:192, kPasso:1.3,  nome:'11 CONTRO 11',`,
},

/* 3 — la tavola VERNICI: areaProf/areaSemi passano dai valori storici
   (118/136/153, areaSemi sempre 0) alle misure vere. Il commento sopra
   la tavola smette di dire "finche' il compito 5 non li porta alle
   misure vere": da qui in poi li ha gia' portati. */
{
  nome: '3/4 la tavola VERNICI porta area/semilarghezza alle misure vere',
  cerca:
`   portaLargh sono l'area di porta, accesa solo a 11 (IFAB): 0 altrove
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
  metti:
`   portaLargh sono l'area di porta, accesa solo a 11 (IFAB): 0 altrove
   vuol dire "non disegnata". DAL COMPITO 5 (misura e fonte in
   strumenti/_t-porta-area.js) anche areaProf/areaSemi sono le misure
   vere: profondita' e semilarghezza dell'area di rigore, non piu' i
   valori storici 118/136/153 con areaSemi sempre a 0. Con areaSemi>0 a
   ogni taglia i ripieghi GOAL_H*0.77 (dentroArea) e
   Math.round(230*GOAL_H/150)/2 (il pennello) sono rami morti
   DOCUMENTATI, non rimossi: restano il ripiego dichiarato dal progetto
   per un giorno che non arrivera' piu' su queste tre taglie. */
const VERNICI={
  5:{ cerchio:86, angolo:7, dArco:0, dischetto:173, dischetto2:288,
      areaProf:173, areaSemi:216, portaProf:0, portaLargh:0 },
  7:{ cerchio:106, angolo:27, dArco:106, dischetto:215, dischetto2:0,
      areaProf:268, areaSemi:288, portaProf:0, portaLargh:0 },
  11:{ cerchio:200, angolo:22, dArco:200, dischetto:241, dischetto2:0,
      areaProf:361, areaSemi:441, portaProf:120, portaLargh:401 },
};`,
},

/* 4 — il commento storico sulla porta (voce #86, compito 3): il fattore
   di scala x1.15/x1.3 non descrive piu' i numeri veri. La ragione resta,
   i numeri si rettificano in chiaro (edizioni, non silenzio). */
{
  nome: '4/4 rettifica del commento storico sulla porta',
  cerca:
`   accanto a k0 e a kTetto). La porta cresce MENO del campo
   (x1.15 / x1.3): se crescesse con lui il portiere sparirebbe.
   GOAL_D, POST_R, P_R, B_R, KICK_R, P_SPEED non scalano: corpi e piedi`,
  metti:
`   accanto a k0 e a kTetto). RETTIFICA (voce #86, compito 5, 6 settembre
   2026): "la porta cresce MENO del campo (x1.15/x1.3)" descriveva un
   fattore di scala fisso — vero nel 2026 di allora, non piu' oggi: da
   questo compito 103/172/192 non sono 150/172/196 scalati, sono il
   tetto +-20% sulla luce ufficiale di ciascuna taglia deciso dal
   committente il 6 settembre 2026 (FIFA Futsal 3 m, UISP 5,5 m, IFAB
   7,32 m -> +19,4%/+16,6%/+19,8%, misura e fonte in
   strumenti/_t-porta-area.js). La RAGIONE non e' cambiata: oltre quel
   tetto il portiere sparirebbe dentro una porta troppo grande per il
   suo corpo.
   GOAL_D, POST_R, P_R, B_R, KICK_R, P_SPEED non scalano: corpi e piedi`,
},

/* 5 — RILIEVO CRITICO: GOAL_H nasce da un letterale a mano (150) che
   setTaglia(5) non corregge quando la taglia e' GIA' 5 (il caso di
   boot). Cura: leggerlo da TAGLIE[5], come VERNICE=VERNICI[5] gia' fa
   due schermate sopra. TAGLIE e' gia' in scope qui (dichiarata molto
   piu' sopra nel file). */
{
  nome: '5/6 RILIEVO CRITICO — GOAL_H legge TAGLIE[5] invece di un letterale a mano',
  cerca:
`let GOAL_H = 150;                  // luce della porta (riassegnata da setTaglia)`,
  metti:
`/* RILIEVO CRITICO (voce #86, compito 5): questo letterale doveva GIA'
   restare sincrono con TAGLIE[5].GOAL_H a mano (era 150 come TAGLIE[5]
   di ieri), ma setTaglia(n) ha una guardia if(n===TAGLIA) return; che
   NON riassegna GOAL_H quando la taglia richiesta e' GIA' quella
   corrente — cioe' MAI, per chi entra in una partita a 5 senza prima
   essere passato da un'altra taglia (il caso comune: TAGLIA parte a 5).
   Finche' i due numeri coincidevano per costruzione (compiti 1-4, mai
   toccato GOAL_H a 5) la staleness era invisibile. Da questo compito
   TAGLIE[5].GOAL_H cambia (103, non piu' 150): senza questa riga letta
   dalla tavola, la partita a 5 vera avrebbe tenuto la porta vecchia per
   sempre, e la riparazione sarebbe stata un numero scritto ma mai
   eseguito. Misurato: confronto due-versioni a 5 restava 0/20 partite
   diverse finche' questa riga leggeva il letterale 150 invece della
   tavola. Stessa cura di VERNICE=VERNICI[5] qui sopra: leggere la
   tavola invece di un secondo numero scritto a mano. */
let GOAL_H = TAGLIE[5].GOAL_H;     // luce della porta (riassegnata da setTaglia)`,
},

/* 6 — STESSO RILIEVO per GK_AREA_X: duplicato a mano di
   VERNICI[5].areaProf, non riassegnato da setTaglia(5) quando la taglia
   e' gia' 5. VERNICE (=VERNICI[5]) e' gia' in scope qui (dichiarata
   molto piu' sopra, riga ~3898). */
{
  nome: '6/6 RILIEVO CRITICO — GK_AREA_X legge VERNICE.areaProf invece di un letterale a mano',
  cerca:
`let GK_AREA_X = 118;                       // quanto lontano dalla linea puo' uscire (scala con kPasso)`,
  metti:
`/* STESSO RILIEVO CRITICO di GOAL_H qui sopra (voce #86, compito 5):
   118 era il duplicato a mano di VERNICI[5].areaProf, e setTaglia(5) non
   lo riassegna quando la taglia e' gia' 5. Da questo compito
   VERNICI[5].areaProf vale 173: senza questa riga, la partita a 5 vera
   avrebbe tenuto GK_AREA_X=118 (l'area vecchia) mentre il gesso disegnava
   gia' l'area nuova — "area disegnata = area applicata" sarebbe rotto
   proprio nella taglia che il banco doveva proteggere. */
let GK_AREA_X = VERNICE.areaProf;          // quanto lontano dalla linea puo' uscire (scala con kPasso)`,
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
   #86 gia' dentro. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ["GOAL_H:103, kPasso:1,    nome:'5 CONTRO 5',", 1],
  ["GOAL_H:192, kPasso:1.3,  nome:'11 CONTRO 11',", 1],
  ['areaProf:173, areaSemi:216, portaProf:0, portaLargh:0 },', 1],
  ['areaProf:268, areaSemi:288, portaProf:0, portaLargh:0 },', 1],
  ['areaProf:361, areaSemi:441, portaProf:120, portaLargh:401 },', 1],
  ['tetto +-20% sulla luce ufficiale di ciascuna taglia deciso dal', 1],
  ['let GOAL_H = TAGLIE[5].GOAL_H;', 1],
  ['let GK_AREA_X = VERNICE.areaProf;', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
