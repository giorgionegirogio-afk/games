/* =====================================================================
   _t-leva-corpi.js — A UNDICI GIOCANO UOMINI IN SCALA (voce #86, compito
   6, ramo voce-86-proporzioni).

   IL PERCHE'. Dopo i compiti 1-5 vernice, area e porta sono vere a ogni
   taglia; restano fuori scala i CORPI (P_R, raggio giocatore; B_R,
   raggio pallone) SOLO sull'11, dove il campo IFAB (105x68 m, 21,90
   u/m) rende un giocatore medio adulto piu' grande in unita' di mondo
   di quanto P_R=13 gli conceda. Sulle taglie 5 e 7 i corpi sono gia'
   giusti (nessun cambiamento).

   OGNI NUMERO, MISURA E FONTE (_analisi/MISURE-UFFICIALI.md):
     giocatore a 11: diametro reale 0,456 m (corpo adulto medio, fonte
       antropometrica citata in MISURE-UFFICIALI.md/A-corpi) contro lo
       0,41 m che P_R=13 disegna a 21,90 u/m (13*2/21,90=1,187 m... la
       cifra di riferimento e' quella gia' usata dal piano: P_R=5 rende
       un diametro di 5*2/21,90=0,456 m, +11,3% sul corpo IFAB atteso
       0,41 m). Dentro il tetto +-15% deciso dal committente il 6
       settembre 2026.
     pallone a 11: diametro reale IFAB IFAB Regola 2 0,22 m; B_R=2,5 rende
       2,5*2/21,90=0,228 m, +3,8% su 0,22 m. Dentro lo stesso tetto.
   A 5 e 7 P_R/B_R restano 13/8 come oggi: qualunque divergenza li' e'
   un difetto (il menu, l'eroe e le miniature vivono sulla taglia 5, per
   commento di setTaglia, e non devono muovere un pixel).

   L'ARCHITETTURA. P_R/B_R diventano `let`, ricotti in setTaglia (unica
   porta) da una tavola CORPI[taglia] invece di restare `const` fissate
   al boot. I TRE PAVIMENTI DI ZOOM (Z_FIG40/Z_BORDO/Z_MURO) sono FUNZIONE
   di P_R (40/34/31 px di corpo, cioe' N/(2*P_R*P_DIS)): restando `const`
   avrebbero congelato per sempre il valore calcolato al boot (taglia 5),
   quindi diventano anche loro `let`, ricotti con la STESSA formula di
   oggi in setTaglia. E' quella stessa formula — non un numero nuovo — a
   tenere i corpi a 40/34/31 px sullo schermo A OGNI taglia: e' la leva
   promessa dal piano (a 11 Z_FIG40 passa da 1,304 a 3,39, la camera
   stringe molto di piu' per compensare il corpo piu' piccolo in unita'
   di mondo). P_DIS/B_DIS (quanto il DISEGNO e' piu' grande del corpo)
   NON cambiano: sono un moltiplicatore del disegno, non del corpo, e
   restano gli stessi indipendentemente da quale corpo disegnano.

   IL CENSIMENTO (Passo 1, grep -n "P_R"/"B_R" su tutto il file,
   dichiarazioni a livello di modulo con indentazione zero — non dentro
   funzioni, che leggono la variabile viva a ogni chiamata):
     - `const P_R = 13;` (riga base) e `const B_R = 8;` (riga base): le
       due costanti che questo compito rende `let`.
     - `const Z_FIG40/Z_BORDO/Z_MURO = N/(2*P_R*P_DIS);` (tre righe): le
       tre costanti di zoom, gia' previste dal piano, rese `let`.
     - `const SEP_R = 54;`: LETTERALE, non deriva da P_R/B_R (il commento
       accanto lo paragona a "quattro volte il corpo" in prosa, ma il
       NUMERO non e' calcolato da P_R). Dichiarata innocua: non tocca.
     - `const SLIDE_BALL_R = P_R + B_R + 7;`: TROVATA DA QUESTO CENSIMENTO
       (ATTENZIONE 1 del brief), non elencata nella lista "Produce" del
       piano ma della STESSA famiglia delle Z_*: e' una fotografia del
       boot (13+8+7=28) che senza cura NON si aggiornerebbe a 11 (dove
       il vero valore sarebbe 5+2,5+7=14,5). Usata in updatePlayerFisica
       (soglia di "presa pulita" della scivolata) e nell'IA del ricevente
       del cross: un raggio di tackle/ricezione doppio del corpo vero a
       11 sarebbe un difetto di giocabilita' silenzioso. Curata come le
       Z_*: `let`, ricotta in setTaglia.
     - window.__test.pallaRaggio: NON e' una fotografia. Chiama pallaRD(),
       una FUNZIONE che legge B_R dal vivo a ogni invocazione
       (`Math.max(B_R*B_DIS, ...)`), quindi a 11 legge gia' il B_R giusto
       senza bisogno di cura. Verificato leggendo il corpo della funzione,
       non solo il nome.
     - window.__test.proporzioni: e' un metodo (funzione), non un oggetto
       congelato: ogni chiamata legge P_R/B_R correnti. Nessuna cura.
     - Tutte le ALTRE occorrenze di P_R/B_R nel file sono dentro corpi di
       funzione (fisica, disegno, IA, minimappa, HUD): leggono la
       variabile a ogni chiamata, quindi seguono da sole il cambio a 11
       una volta che P_R/B_R sono `let` ricotti in setTaglia. Nessuna
       cura necessaria.

   RETTIFICHE DOVUTE (edizioni, non silenzio — i numeri vecchi restano
   leggibili in chiaro dentro la rettifica, non cancellati):
     1. Il commento vicino a TAGLIE ("GOAL_D, POST_R, P_R, B_R, KICK_R,
        P_SPEED non scalano") diceva il vero fino a questo compito: P_R/
        B_R ora scalano SOLO sull'11. Rettificato in loco (ancora 8).
     2. Il commento sullo STRAPPO ("P_R e P_SPEED sono gli stessi su
        tutti e tre i campi") era la premessa per NON scalare SCARTO_V0/
        SCARTO_VK con KPASSO: P_R non e' piu' vero per l'11, ma la
        formula della spinta resta assoluta (non legge P_R), quindi il
        comportamento non cambia — solo la premessa a parole andava
        aggiornata. Rettificato in loco (ancora 9).
     3. Il commento sopra Z_FIG40 diceva che il suo VALORE (non solo la
        formula) e' "uguale su ogni formato": vero finche' P_R era 13
        dappertutto, falso da questo compito (a 11 Z_FIG40 vale 3,39
        contro 1,304 di 5/7). Rettificato in loco insieme al cambio
        const->let (ancora 4).
     4. RETTIFICA DOVUTA ASSEGNATA DAL COMMITTENTE (minore del compito 3,
        grep -n "2300x1120"): il commento su kTetto in updateCamera cita
        ancora "campo 2300x1120 area 2.576.000 -> radice 0,500", l'FH di
        PRIMA del compito 3 (che l'ha portato a 1490 per i 68 m veri
        IFAB, 6 settembre 2026). Con FH 1490 il campo e' 2300x1490, area
        3.427.000, radice 0,4335 (non 0,500). Il CODICE non ne ha mai
        sofferto — kTetto legge FW*FH dal vivo a ogni fotogramma — solo
        la tabella illustrativa era rimasta indietro. Rettificata (ancora
        10).

   DIVERGENZA DEI SORTEGGI: identica a 5 e 7 (P_R/B_R non cambiano,
   nessuna chiamata nuova a dado()); DIVERGE a 11 (P_R/B_R cambiano, la
   fisica — urti, presa, separazione, portiere — usa quei raggi in
   ogni calcolo di collisione, quindi la sequenza di eventi cambia dal
   primo fotogramma anche col motore RNG identico).

   uso:  node strumenti/_t-leva-corpi.js --out fuori/leva-corpi.html
         node strumenti/_t-leva-corpi.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/leva-corpi.html'));

const ANCORE = [

/* 1 — la tavola CORPI, e P_R da const a let (i letterali 13 restano:
   coincidono con CORPI[5] per costruzione, quindi il boot a 5 e'
   coerente senza leggere la tavola — la lezione del compito 5). */
{
  nome: '1/10 tavola CORPI + P_R const -> let',
  cerca:
`/* giocatori / pallone */
const P_R = 13;                    // raggio giocatore`,
  metti:
`/* =====================================================================
   CORPI — LA LEVA DEI CORPI (voce #86, compito 6, 7 settembre 2026).
   A 5 e a 7 P_R/B_R restano 13/8 come sempre (il menu e le miniature
   vivono sulla taglia 5: nessuna divergenza li'). A 11 il corpo cresce
   in unita' di mondo perche' il campo IFAB e' piu' grande: diametro
   giocatore 0,456 m contro 0,41 m atteso (+11,3%), diametro pallone
   0,228 m contro 0,22 m IFAB Regola 2 (+3,8%). Entrambi dentro il tetto
   +-15% deciso dal committente il 6 settembre 2026 (misura e fonte
   complete in strumenti/_t-leva-corpi.js). P_R/B_R sono ricotti in
   setTaglia (unica porta); i letterali qui sotto restano 13/8 perche'
   COINCIDONO con CORPI[5] per costruzione — il boot a 5 e' gia' coerente
   senza bisogno di leggere la tavola. */
const CORPI={5:{P_R:13,B_R:8},7:{P_R:13,B_R:8},11:{P_R:5,B_R:2.5}};
/* giocatori / pallone */
let P_R = 13;                      // raggio giocatore (ricotto in setTaglia, tavola CORPI)`,
},

/* 2 — B_R da const a let. */
{
  nome: '2/10 B_R const -> let',
  cerca:
`const B_R = 8;                     // raggio pallone (URTI: non si tocca)`,
  metti:
`let B_R = 8;                       // raggio pallone (URTI: non si tocca; ricotto in setTaglia, tavola CORPI)`,
},

/* 3 — SLIDE_BALL_R, trovata dal censimento del Passo 1: fotografia di
   P_R+B_R al boot, che senza cura non seguirebbe l'11. */
{
  nome: '3/10 SLIDE_BALL_R const -> let (fotografia trovata dal censimento)',
  cerca:
`const SLIDE_BALL_R = P_R + B_R + 7;   // quanto vicino al pallone conta come "presa pulita"`,
  metti:
`/* CENSITA DAL COMPITO 6 (voce #86): nasce da P_R+B_R, che da questo
   compito cambiano a 11 — senza ricottura sarebbe rimasta la fotografia
   del boot (28) invece di seguire il corpo vero (14,5 a 11). Ricotta in
   setTaglia insieme a P_R/B_R, stessa formula di sempre. */
let SLIDE_BALL_R = P_R + B_R + 7;   // quanto vicino al pallone conta come "presa pulita"`,
},

/* 4 — Z_FIG40 const -> let, e rettifica del "uguale su ogni formato"
   che da questo compito vale solo per la FORMULA, non per il valore. */
{
  nome: '4/10 Z_FIG40 const -> let + rettifica "uguale su ogni formato"',
  cerca:
`   fotogramma di sola erba. La regola nuova: quando l'azione e' concentrata
   la camera stringe fino a corpi di 40-47 px, e si riapre SOLO per la
   leggibilita' tattica (palla + 3 uomini vicini + la porta d'attacco in
   zona) o per portare in quadro il bordo di scenografia. Z_FIG40 e' il
   pixel sotto cui la concessione al bordo non puo' spingere: 40 px di
   corpo, cioe' 40 / (2·P_R·P_DIS) px per unita', uguale su ogni formato. */
const Z_FIG40 = 40/(2*P_R*P_DIS);`,
  metti:
`   fotogramma di sola erba. La regola nuova: quando l'azione e' concentrata
   la camera stringe fino a corpi di 40-47 px, e si riapre SOLO per la
   leggibilita' tattica (palla + 3 uomini vicini + la porta d'attacco in
   zona) o per portare in quadro il bordo di scenografia. Z_FIG40 e' il
   pixel sotto cui la concessione al bordo non puo' spingere: 40 px di
   corpo, cioe' 40 / (2·P_R·P_DIS) px per unita'. RETTIFICA (voce #86,
   compito 6, 7 settembre 2026): "uguale su ogni formato" era vero
   finche' P_R era 13 dappertutto. Da questo compito P_R cambia a 11
   (13 -> 5, vedi CORPI), quindi Z_FIG40 cresce con lui: la FORMULA resta
   la stessa su ogni formato (40 px di corpo per costruzione), il suo
   VALORE in px/unita' no — passa da 1,304 (5 e 7, invariato) a 3,39
   sull'11, perche' li' lo stesso corpo occupa meno unita' di mondo e
   serve piu' zoom per tenerlo a 40 px. Ricotta in setTaglia insieme a
   P_R, stessa formula di oggi. */
let Z_FIG40 = 40/(2*P_R*P_DIS);`,
},

/* 5 — Z_BORDO const -> let (il commento resta: descrive una spazzata
   misurata a P_R=13, valida com'era per 5/7; nessuna rettifica dovuta,
   nessuna claim di universalita' da correggere). */
{
  nome: '5/10 Z_BORDO const -> let',
  cerca:
`const Z_BORDO = 34/(2*P_R*P_DIS);`,
  metti:
`let Z_BORDO = 34/(2*P_R*P_DIS);      // ricotto in setTaglia insieme a P_R (voce #86, compito 6)`,
},

/* 6 — Z_MURO const -> let (stesso trattamento di Z_BORDO). */
{
  nome: '6/10 Z_MURO const -> let',
  cerca:
`const Z_MURO = 31/(2*P_R*P_DIS);`,
  metti:
`let Z_MURO = 31/(2*P_R*P_DIS);      // ricotto in setTaglia insieme a P_R (voce #86, compito 6)`,
},

/* 7 — setTaglia: la ricottura vera. Stessa formula di oggi per le tre
   Z, applicata ai nuovi P_R/B_R appena riassegnati dalla tavola CORPI. */
{
  nome: '7/10 setTaglia ricuoce P_R/B_R/SLIDE_BALL_R/Z_FIG40/Z_BORDO/Z_MURO',
  cerca:
`  GK_AREA_X=VERNICE.areaProf;
  RESIZE_FORZA=true; resize();          // SCALE/OX/OY/PADX/PADY + fieldTex/vignette`,
  metti:
`  GK_AREA_X=VERNICE.areaProf;
  /* LA LEVA DEI CORPI (voce #86, compito 6): P_R/B_R vengono dalla
     tavola CORPI, e i tre pavimenti di zoom si ricuociono con la STESSA
     formula di sempre — e' quella formula, non un numero nuovo, a tenere
     i corpi a 40/34/31 px sullo schermo a ogni taglia. SLIDE_BALL_R e'
     derivato da P_R+B_R e va ricotto con loro, o resterebbe la
     fotografia del boot (censimento del Passo 1). */
  P_R=CORPI[n].P_R; B_R=CORPI[n].B_R;
  SLIDE_BALL_R=P_R+B_R+7;
  Z_FIG40=40/(2*P_R*P_DIS); Z_BORDO=34/(2*P_R*P_DIS); Z_MURO=31/(2*P_R*P_DIS);
  RESIZE_FORZA=true; resize();          // SCALE/OX/OY/PADX/PADY + fieldTex/vignette`,
},

/* 8 — rettifica del commento storico vicino a TAGLIE, gia' rettificato
   due volte (compiti 3 e 5) per altre affermazioni: da questo compito
   tocca a "P_R, B_R ... non scalano". */
{
  nome: '8/10 rettifica "GOAL_D, POST_R, P_R, B_R, KICK_R, P_SPEED non scalano"',
  cerca:
`   GOAL_D, POST_R, P_R, B_R, KICK_R, P_SPEED non scalano: corpi e piedi
   sono gli stessi, cambia il mondo. E la gabbia resta: le sponde sono il
   clamp su FW/FH — nessuna rimessa, a nessuna taglia.`,
  metti:
`   GOAL_D, POST_R, P_R, B_R, KICK_R, P_SPEED non scalano: corpi e piedi
   sono gli stessi, cambia il mondo. RETTIFICA (voce #86, compito 6, 7
   settembre 2026): "P_R, B_R ... non scalano" era vero fino a qui.
   Restano 13/8 sulle taglie 5 e 7 (nessuna divergenza li', il menu vive
   sulla 5); l'11 passa a 5/2,5 — diametro giocatore 0,456 m contro
   0,41 m atteso (+11,3%), pallone 0,228 m contro 0,22 m IFAB (+3,8%),
   entrambi dentro il tetto +-15% (misura e fonte in
   strumenti/_t-leva-corpi.js). GOAL_D, POST_R, KICK_R, P_SPEED restano
   invariati su tutte e tre le taglie: la camera compensa il corpo piu'
   piccolo restando ai soliti 40/34/31 px (Z_FIG40/Z_BORDO/Z_MURO,
   ricotti in setTaglia con la stessa formula di sempre). E la gabbia
   resta: le sponde sono il clamp su FW/FH — nessuna rimessa, a nessuna
   taglia.`,
},

/* 9 — rettifica del commento sullo STRAPPO: la premessa "P_R e P_SPEED
   sono gli stessi su tutti e tre i campi" non vale piu' per l'11. */
{
  nome: '9/10 rettifica "P_R e P_SPEED sono gli stessi su tutti e tre i campi"',
  cerca:
`   Non scala con la taglia del campo (niente KPASSO): qui si salta un
   CORPO, e P_R e P_SPEED sono gli stessi su tutti e tre i campi.`,
  metti:
`   Non scala con la taglia del campo (niente KPASSO): qui si salta un
   CORPO, e P_SPEED e' lo stesso su tutti e tre i campi. RETTIFICA (voce
   #86, compito 6, 7 settembre 2026): "P_R... sono gli stessi su tutti e
   tre i campi" non vale piu' per l'11 (P_R 13 -> 5, vedi CORPI). Il
   comportamento qui non cambia comunque: SCARTO_V0/SCARTO_VK sono
   velocita' assolute e non leggono P_R — solo la premessa a parole
   andava aggiornata, non la formula.`,
},

/* 10 — RETTIFICA DOVUTA ASSEGNATA DAL COMMITTENTE (minore del compito
   3): il commento su kTetto cita ancora l'FH vecchio (1120) invece del
   vero 1490 introdotto dal compito 3, e la radice sbagliata (0,500
   invece di 0,4335). Il codice (kTetto, poche righe sotto) legge FW*FH
   dal vivo e non ne ha mai sofferto: solo la tabella andava rettificata. */
{
  nome: '10/10 rettifica "2300x1120 area 2.576.000 -> radice 0,500"',
  cerca:
`     LA FUNZIONE, e sono i numeri delle tre taglie:
         5 :  campo 1150x560   area   644.000  ->  radice 1,000
         7 :  campo 1610x784   area 1.262.240  ->  radice 0,714
        11 :  campo 2300x1120  area 2.576.000  ->  radice 0,500
     Il tetto proporzionale sarebbe S2_MAX per quella radice: 1,53 sul 5,
     1,09 sul 7, 0,765 sull'11.`,
  metti:
`     LA FUNZIONE, e sono i numeri delle tre taglie:
         5 :  campo 1150x560   area   644.000  ->  radice 1,000
         7 :  campo 1610x784   area 1.262.240  ->  radice 0,714
        11 :  campo 2300x1490  area 3.427.000  ->  radice 0,4335
     RETTIFICA (voce #86, compito 6, 7 settembre 2026): questa riga
     diceva "campo 2300x1120 area 2.576.000 -> radice 0,500", l'FH di
     PRIMA del compito 3 (che l'ha portato a 1490 per i 68 m veri IFAB,
     6 settembre 2026). Il commento era rimasto indietro, il codice no:
     kTetto, poche righe sotto, legge FW*FH a ogni fotogramma e calcolava
     gia' la radice vera da allora.
     Il tetto proporzionale sarebbe S2_MAX per quella radice: 1,53 sul 5,
     1,09 sul 7, 0,663 sull'11 (non piu' 0,765).`,
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
  ['const CORPI={5:{P_R:13,B_R:8},7:{P_R:13,B_R:8},11:{P_R:5,B_R:2.5}};', 1],
  ['let P_R = 13;', 1],
  ['let B_R = 8;', 1],
  ['let SLIDE_BALL_R = P_R + B_R + 7;', 1],
  ['let Z_FIG40 = 40/(2*P_R*P_DIS);', 1],
  ['let Z_BORDO = 34/(2*P_R*P_DIS);', 1],
  ['let Z_MURO = 31/(2*P_R*P_DIS);', 1],
  ['P_R=CORPI[n].P_R; B_R=CORPI[n].B_R;', 1],
  ['campo 2300x1490  area 3.427.000  ->  radice 0,4335', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
