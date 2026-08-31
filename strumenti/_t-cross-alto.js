/* =====================================================================
   _t-cross-alto.js — UN CROSS CHE PASSA FRA LE TESTE NON E' UN CROSS
   (29 agosto 2026).

   LA DIAGNOSI, ed e' un conto che si rifa' a mente.
   La gravita' del pallone e' 560 (riga «b.vz-=560*dt»). Il cross parte
   con b.vz = 280*T, quindi:
     · il TEMPO DI VOLO vale 2*280*T/560 = T esatto — il 280 e' scelto
       apposta perche' T sia davvero il tempo, ed e' una bella riga;
     · la QUOTA DI CULMINE vale h = 560*(T/2)^2/2 = **70*T^2**.

   Il gioco dichiara due soglie:
     Z_SOPRA_TESTA = 26   «oltre questa quota la palla passa sopra i corpi»
     Z_TESTA_MAX   = 46   «fin qui un corpo IN PIEDI gioca il pallone di testa»
   Tradotte in tempo di volo con h = 70*T^2, la finestra in cui un colpo
   di testa puo' esistere e':

       T fra 0,609  e  0,811

   E il gioco clampa T fra **0,50 e 0,75**, in due posti che dicono la
   stessa cosa due volte:
     · doCross:  const T=clamp(dist/430, 0.5, 0.75);
     · L14_T0 = 0.50 / L14_T1 = 0.75, il cross che nasce dal trascinamento.
   Le due costanti hanno accanto il commento «-> vz 140 / vz 210»: chi le
   ha scritte ragionava in VELOCITA' VERTICALE, non in quota, e in
   velocita' 140 sembra tanto. In quota sono 17,5 unita', cioe' **sotto
   i corpi**: il pallone passa in mezzo ai difensori invece che sopra.

   MISURATO, non dedotto (strumenti/_q-cross.js, 29 agosto):

     distanza  quota max   verdetto
        150      16,3      passa SOTTO i corpi
        200      16,3      passa SOTTO i corpi
        260      24,2      passa SOTTO i corpi
        320      37,0      dentro la finestra
        400      37,6      dentro la finestra
        500      37,6      dentro la finestra
        650      37,6      dentro la finestra

   Tre cross su sette. E le tre distanze che falliscono — 150, 200, 260 —
   sono **le distanze del cross vero**: dalla fascia all'area, su un
   campo lungo 1150 a cinque contro cinque, un traversone sta li'. Quelli
   che riescono sono i lanci da meta' campo.

   LA CURA E' UN PAVIMENTO, ED E' SOLO UN PAVIMENTO.
   Si alza il minimo di T da 0,50 a **0,66** e IL TETTO NON SI TOCCA:
       T = 0,66  ->  quota 29,0   (tre unita' sopra i corpi)
       T = 0,75  ->  quota 37,6   (era gia' dentro la finestra)
   Da oggi OGNI cross atterra dove una testa puo' incontrarlo.

   PERCHE' IL TETTO NON SI TOCCA, e questa e' la correzione di un mio
   errore, non un vezzo. La prima stesura alzava anche il massimo, da
   0,75 a 0,80. Sembrava gratis: 44,8 di quota e' ancora sotto la
   fronte. Non lo era. Attorno al cross della MACCHINA c'e' un sistema
   intero tarato su una costante che si chiama, per esteso,

       const CROSS_TVOLO = 0.75;   // il volo, sempre il piu' lungo che doCross sappia

   e su di lei poggiano crossFinestra() (la finestra di distanza da cui
   la CPU decide di crossare), il conto se il portiere ci arriva
   (GK_SPEED x CROSS_TVOLO), dove sara' il compagno all'atterraggio
   (q.x + q.vx*CROSS_TVOLO) e persino il tempo in cui il pallone supera
   Z_SOPRA_TESTA. Portare doCross a 0,80 avrebbe reso FALSO il commento
   di quella costante e sfasato di 0,05 s tutte e quattro le previsioni:
   il portiere calcolato corto, il compagno mandato dove il pallone non
   arriva piu'. Un difetto che non si sarebbe visto in nessun cancello e
   sarebbe uscito come «a volte il cross non arriva a nessuno».
   Il pavimento invece non tocca niente di tutto questo: la CPU crossa
   solo da distanze in cui dist/430 supera il tetto, quindi per lei T
   resta 0,75 esatto e la partita non cambia di un bit — verificato con
   l'impronta a seme fisso.

   PERCHE' 0,66 E NON 0,62, ED E' LA COSA CHE VALE PIU' DI TUTTA LA
   PATCH. Il primo tentativo mise 0,62, perche' 70*0,62^2 = 26,9 e la
   soglia e' 26. Il banco misuro' **25,5**: sotto. Non era un errore di
   misura — e' che **il conto continuo non e' il gioco**. La parabola
   h = 70*T^2 vale per la fisica esatta; il gioco integra a passi con
       b.vz -= 560*dt;  b.z += b.vz*dt;
   cioe' Eulero esplicito a 1/60, che sottrae la gravita' PRIMA di
   muovere e perde tra il 4 e il 5 per cento del culmine:
       T      continua   a 1/60   scarto
       0,62     26,9      25,5     5,3%
       0,66     30,5      29,0     5,0%
       0,80     44,8      42,9     4,2%
   Chiunque tari una quota di questo gioco con la formula da manuale
   sbagliera' della stessa quantita', e nella direzione pericolosa: il
   conto promette piu' di quello che il gioco fa. I numeri qui sotto
   sono scelti sulla SIMULAZIONE, non sulla formula, e lasciano tre
   unita' di margine da tutti e due i bordi della finestra invece di
   sfiorarli.

   IL PREZZO, dichiarato: la velocita' orizzontale e' dist/T, quindi un
   cross corto diventa piu' LENTO — a 150 unita' passa da 300 a 227
   unita' al secondo. E' il prezzo giusto: un traversone da 150 unita'
   che viaggia teso e basso non e' un cross, e' un appoggio. Chi vuole
   l'appoggio ha il suo disco.
   La GITTATA non cambia: T e' il tempo di volo e la velocita' e'
   dist/T, quindi il prodotto resta dist. Il banco lo verifica
   (errore peggiore 14 unita' su 650, il 2%, che e' il campionamento).

   NESSUN SORTEGGIO: sono due costanti, la legge sui dado() non e'
   toccata.

   RETTIFICA, e va scritta perche' l'ho creduta e detta. La prima
   stesura di questo file dichiarava che «la macchina non crossa mai,
   doCross lo chiamano solo doCrossUmano e doFiltrante». **E' FALSO.**
   La CPU crossa, e c'e' una funzione che si chiama proprio crossCPU
   (:19057) con il suo bersaglio (crossBersaglio), la sua finestra di
   distanza dedotta e il suo conto sul portiere. Misurato con una sonda
   che avvolge doCross e conta: **2 cross a partita** a cinque contro
   cinque, in CPU contro CPU.
   L'errore non e' stato di lettura ma di METODO: ho cercato i chiamanti
   con un grep e ho tagliato l'uscita a dieci righe. La chiamata vera
   stava alla riga 19087, cioe' l'undicesima. Ho concluso su un elenco
   troncato e ho scritto quella conclusione in quattro posti. Se una
   patch dice «questo non cambia niente», quel «niente» va MISURATO —
   qui la misura c'era (l'impronta a seme fisso e' andata rossa) e ha
   preso il posto della mia deduzione, che e' esattamente il suo
   mestiere.

   uso:  node strumenti/_t-cross-alto.js --out fuori/cross.html
         node strumenti/_t-cross-alto.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/cross.html'));

const ANCORE = [

/* 1 — le due costanti del cross da trascinamento */
{
  nome: '1/4 L14_T0 e L14_T1',
  cerca:
`const L14_T0 = 0.50;     // s di volo a quota minima  -> vz 140
const L14_T1 = 0.75;     // s di volo a quota piena   -> vz 210`,
  metti:
`/* IL TEMPO DI VOLO E' LA QUOTA, e conviene leggerlo cosi'.
   Con la gravita' a 560 e b.vz = 280*T, il culmine vale h = 70*T^2.
   La finestra in cui esiste un colpo di testa — fra Z_SOPRA_TESTA (26,
   sopra i corpi) e Z_TESTA_MAX (46, la fronte) — in tempo di volo e'
   [0,609  0,811] per la formula — ma il gioco integra a passi (Eulero a
   1/60, la gravita' tolta PRIMA di muovere) e perde il 4-5% del
   culmine, quindi i numeri veri si prendono dalla simulazione e non
   dalla parabola. Questi due sono scelti cosi', e sono cambiati il 29
   agosto 2026: valevano 0,50 e 0,75, cioe' da 17,5 a 39,4 di quota, e
   la meta' bassa della corsa passava SOTTO i corpi invece che sopra.
   Il commento vecchio diceva «-> vz 140 / vz 210» ed era vero: e' che
   140 di velocita' verticale, in quota, sono 17,5 unita'. Misurato in
   strumenti/_q-cross.js: tre cross su sette entravano nella finestra, e
   i quattro che sbagliavano erano proprio i traversoni corti — le
   distanze del cross vero. */
const L14_T0 = 0.66;     // s di volo a quota minima  -> quota VERA 29,0 (tre unita' sopra i corpi)
const L14_T1 = 0.75;     // s di volo a quota piena   -> quota VERA 37,6. NON SI ALZA: CROSS_TVOLO (:18930) vale 0,75 e su di lei poggiano la finestra del cross CPU, il conto sul portiere e la posizione del compagno all'atterraggio`,
},

/* 2 — il commento che documenta i numeri: se resta indietro diventa la
       prossima bugia, e questo stesso commento racconta di aver gia'
       mentito per tre giorni */
{
  nome: '2/4 il commento che documenta i numeri',
  cerca:
`     T = voloL14(su, distanza), fra 0,50 e 0,75 s;
     vz = 280*T, cioe' fra 140 e 210;`,
  metti:
`     T = voloL14(su, distanza), fra 0,66 e 0,75 s (il minimo era 0,50
       fino al 29 agosto 2026: la meta' bassa di quella corsa culminava
       sotto quota 26 e il pallone passava FRA i corpi invece che sopra —
       vedi strumenti/_t-cross-alto.js per il conto e la misura);
     vz = 280*T, cioe' fra 185 e 210, che in quota MISURATA sono 29,0 e
       37,6 — dentro la finestra 26..46 in cui esiste un colpo di testa;`,
},

/* 3 — il clamp del cross diretto */
{
  nome: '3/4 il clamp di doCross',
  cerca:
`  const T=clamp(dist/430, 0.5, 0.75);
  if(kickBall(p, dx/dist, dy/dist, dist/T, 0)){`,
  metti:
`  /* lo stesso pavimento di L14_T0/L14_T1, e per la stessa ragione: sotto
     0,66 di volo il pallone culmina sotto quota 26 e passa FRA i corpi
     invece che sopra. La gittata non cambia — la velocita' e' dist/T e
     il tempo e' T, quindi il prodotto resta dist — cambia che un cross
     corto diventa piu' lento e piu' alto, che e' quello che un cross e'. */
  const T=clamp(dist/430, L14_T0, L14_T1);
  if(kickBall(p, dx/dist, dy/dist, dist/T, 0)){`,
},

/* 4 — E IL SEGNO GUIDA, che disegna l'arco a chi sta caricando il cross.
       Questa e' la sostituzione che quasi mi sfuggiva, e sarebbe stata
       il difetto peggiore: due pezzi di codice che calcolano la stessa
       cosa e un giorno smettono di calcolarla uguale — l'arco promesso
       al dito sarebbe stato piu' basso del cross che parte davvero.
       Il gioco qui conosce GIA' la formula che sta sotto tutta questa
       patch: scrive «picco:70*T*T», cioe' la quota al vertice. La
       derivazione non e' mia, e' sua: era solo scritta in un posto e
       dimenticata nell'altro. */
{
  nome: '4/4 il segno guida usa lo stesso pavimento',
  cerca:
`        const T=clamp(dist/430, 0.5, 0.75);
        out.push({tipo:'arco-cross', x0w:b.x, y0w:b.y,`,
  metti:
`        const T=clamp(dist/430, L14_T0, L14_T1);   // lo STESSO clamp di doCross: la guida non puo' promettere un arco che il cross non fa
        out.push({tipo:'arco-cross', x0w:b.x, y0w:b.y,`,
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
  ['const L14_T0 = 0.66;', 1],
  ['const L14_T1 = 0.75;', 1],
  ['const T=clamp(dist/430, L14_T0, L14_T1);', 2],
  // i vecchi numeri non devono essere rimasti da nessuna parte
  ['clamp(dist/430, 0.5, 0.75)', 0],
  ['const L14_T0 = 0.50;', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
