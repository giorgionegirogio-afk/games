/* =====================================================================
   abbinamento.js — LA FINESTRA DELL'AVVERSARIO, E LA SUA SECONDA
   COORDINATA (voce #137).

   LA FINESTRA ESISTEVA GIA', e va detto subito perche' e' la cosa che
   si legge male: `rete/api/avversario.js` cerca da mesi con una banda
   che si allarga a gradini (`for (const banda of [8, 20, 99])`), e
   `trova_avversario` filtra su `abs(forza - mia) <= banda`. Questo file
   non inventa la finestra: le aggiunge una COORDINATA. Il gradino
   smette di essere un numero e diventa una coppia.

   PERCHE' LA FORZA NON BASTA. `forza` e `punti` misurano due cose
   diverse: la forza dice QUANTO HAI GIOCATO (la rosa cresce a ogni
   partita e satura a 99), i punti dicono QUANTO VINCI (Elo). Dentro una
   stessa fascia di forza ci stanno tutti e due gli estremi: misurato su
   una popolazione simulata di 400 (fuori/_sonda-137-abbinamento.js),
   dentro `forza 75 +/-8` ci sono 203 allenatori con punti da 402 a
   1486. Mille punti di Elo sono una partita decisa prima del fischio.

   MISURATO, 5000 ricerche, popolazione di 400: lo scarto MEDIANO di
   punti fra i due abbinati scende da 188 a 60, e gli abbinamenti «entro
   150 punti» — quelli che il piu' forte vince il 70% delle volte e non
   il 95% — passano dal 41% al 100%. Senza perdere una sola sfida.

   PERCHE' QUESTO FILE ESISTE, invece di avere tutto nell'SQL. Due
   ragioni, e nessuna delle due e' estetica:

     1. l'SQL non si puo' eseguire nel repo (non c'e' un Postgres), e un
        banco che legge un file .sql e dichiara verde ATTESTA invece di
        misurare. Qui la regola e' JavaScript, e `strumenti/_q-sospetto.js`
        la esegue davvero su popolazioni simulate;
     2. `avversario.js` RICONTROLLA con `ammissibile` il candidato che
        l'SQL gli restituisce. Se un giorno i due divergessero — uno
        schema vecchio rimasto in giro, una riga cambiata da una parte
        sola — il candidato fuori finestra viene scartato e si passa al
        gradino dopo. Non e' ridondanza gratuita: e' l'unico modo di non
        fidarsi di una riga che sta in un altro file, in un'altra
        lingua, su un'altra macchina.

   SEGUITO A EDIZIONI (23 settembre 2026, voce #140). «Una COORDINATA» e
   «diventa una coppia» sono superate: la coordinata adesso e' la TERZA e
   il gradino e' una TERNA. La nuova e' l'EQUILIBRIO — l'atteso di
   Glicko-2 fra i due — e il ragionamento del punto 2 qui sopra NON si
   applica a lei: il rating nascosto non esce dal database, quindi
   `ammissibile` non puo' ricontrollarla. Vedi `equilibrato`, piu' sotto,
   e la ragione per esteso accanto ad `ammissibile`.
   ===================================================================== */

import { atteso } from './glicko.js';

/* =====================================================================
   LA SCALA — CINQUE gradini, TRE coordinate (la terza dalla voce #140).

   L'ULTIMO GRADINO E' L'ULTIMO GRADINO DI OGGI, allargato in tutte e due
   le direzioni: `forza +/-99` ammette chiunque, `punti` senza limite
   ammette chiunque. Non e' una comodita': e' la garanzia che questa
   aggiunta NON PUO' COSTARE UNA SOLA SFIDA. Chi oggi trova un
   avversario domani lo trova ancora, al massimo a un gradino piu' in
   la'. Misurato: zero ricerche senza avversario in piu', su tutte e tre
   le popolazioni provate (400, 60, 12).

   Ed e' anche quel che rende SICURO il ricontrollo dell'endpoint:
   sull'ultimo gradino `ammissibile` e' sempre vero, quindi nel caso
   peggiore si finisce esattamente sull'abbinamento di prima invece che
   su niente.

   RETTIFICA A EDIZIONI (23 settembre 2026, voce #140). «In tutte e due
   le direzioni» adesso sono TRE: l'ultimo gradino ha anche `equilibrio:
   Infinity`, che ammette chiunque. La garanzia resta quella e resta
   misurata — zero ricerche in piu' a vuoto su tutte e tre le
   popolazioni — perche' e' la stessa riga di prima con una terza
   condizione che sull'ultimo gradino e' sempre vera.
   ===================================================================== */
/* =====================================================================
   IL PAVIMENTO DEL MAZZO — `minimo`, e NON era nel progetto: l'ha
   trovato il banco, al compito 2.

   Una finestra piu' stretta da' abbinamenti piu' giusti E MENO GENTE
   DENTRO. Misurato sulla popolazione di 400: col solo primo gradino
   (`forza +/-8`, `punti +/-120`) nove allenatori su 400 avevano meno di
   dieci avversari possibili, e il peggio servito ne aveva UNO. Lo
   stesso, tutte le sere. E' esattamente la cosa che l'`order by
   random()` di `trova_avversario` esiste per impedire, tornata dalla
   FINESTRA invece che dall'ordinamento — cioe' da una porta che nessuno
   guardava.

   Allora un gradino non si accontenta di trovare QUALCUNO: deve
   trovarne almeno `minimo`. Se non ce n'e' abbastanza si scende di un
   gradino, dove la finestra e' piu' larga e il mazzo piu' grosso.
   L'ultimo gradino ha `minimo: 1`, quindi nessuna sfida si perde.

   Misurato, 6/4/2/1, «avversari distinti in 200 ricerche», il PEGGIO
   servito della popolazione:

     base 400:  oggi 10  ·  senza pavimento 1  ·  col pavimento 7
     base  60:  oggi 13  ·  senza pavimento 1  ·  col pavimento 6
     base  12:  oggi  3  ·  senza pavimento 1  ·  col pavimento 5

   SEGUITO A EDIZIONI (23 settembre 2026, voce #140). I numeri 6/4/2/1 di
   questo blocco sono SUPERATI: con la terza coordinata il pavimento sale
   a 7/5/4/2/1 — e i gradini diventano cinque, per la ragione scritta in
   fondo al blocco della terza coordinata. Il ragionamento e' identico — una finestra piu' stretta
   lascia meno gente dentro — e la misura lo ritrova identico: lasciando
   il pavimento del #137 il peggio servito su 60 allenatori scendeva da 6
   avversari possibili a 3, e con 8/6/4 risale a 8. I numeri per esteso
   stanno nel blocco della terza coordinata, qui sotto.

   Sulla base da dodici — quella vera — il pavimento fa MEGLIO di oggi
   in tutte e due le grandezze: scarto mediano da 255 a 147 e avversari
   possibili da 3 a 5.

   Il prezzo, detto: le chiamate al database per ricerca passano da 1,00
   a 1,01 su 400, a 1,11 su 60 e a 2,17 su 12. Il freno di
   /api/avversario e' 60 al minuto e l'uso vero e' UNA ricerca per
   pressione del dito.
   ===================================================================== */
/* =====================================================================
   LA TERZA COORDINATA — L'EQUILIBRIO (voce #140).

   Stessa regola del #137, applicata un'altra volta: la finestra ESISTE,
   e non si riscrive. Il gradino era un numero, e' diventato una coppia,
   adesso e' una TERNA. Nient'altro cambia: stesso ciclo in
   avversario.js, stessa `trova_avversario`, stesso pavimento del mazzo.

   PERCHE' NEMMENO I PUNTI BASTANO. I punti di `rete/api/sfida.js` non
   sono un rating e non possono esserlo: il difensore perde meta' di
   quel che l'attaccante guadagna, la serie moltiplica fino a 1,3, c'e'
   un pavimento a 100. Sono una valuta che premia il giocare — misurato,
   +1,6% di totale in sessanta giorni su 400 allenatori — e una valuta
   non dice quanto sei forte. Il rating nascosto si', e lo dice meglio:
   rho di Spearman con l'abilita' vera 0,974 contro 0,956 (0,985 contro
   0,967 fra i veterani).

   E NON E' UNA DISTANZA. Questa e' la decisione fine del cantiere, e
   viene da una misura, non da un'idea. Confrontare i rating a distanza
   — `|a - b| <= banda + incertezza_a + incertezza_b` — e' stato provato
   e misurato QUASI INUTILE: su 400 allenatori lo scarto di abilita'
   vera passa da 136 a 122, cioe' niente, perche' l'incertezza di due
   assestati vale 124 e si mangia la banda.

   La grandezza giusta ce l'ha gia' Glicko-2 in casa: l'ATTESO, cioe' la
   probabilita' che il primo batta il secondo, dove l'incertezza di
   tutti e due entra PER COSTRUZIONE (g(phi) appiattisce verso 0,5
   quando il sistema non sa). Un gradino non dice «vicini di rating»:
   dice **la partita non dev'essere decisa prima del fischio**.

     |atteso - 0,5| <= gradino.equilibrio

   `equilibrio: 0.08` vuol dire «il piu' forte non vince piu' del 58%
   delle volte»; 0,25 vuol dire 75%. Ed e' la stessa grandezza che il
   mandato nomina nella formula dei trofei (riga 163: «E is the Glicko-2
   expected score»).

   MISURATO, 5000 ricerche, stessa popolazione e stesso seme per il
   prima e il dopo. La grandezza NON e' lo scarto di punti — sarebbe
   giudicare un metro con se' stesso — ma lo scarto di ABILITA' LATENTE,
   che ne' i punti ne' il rating conoscono:

     400 allenatori: scarto vero mediano 133 -> 72, p90 355 -> 183,
                     abbinamenti entro 100 dal 40% al 65%
      60 allenatori: 151 -> 94,  p90 340 -> 249, dal 34% al 52%
      12 allenatori: 291 -> 185, p90 554 -> 391, dal 21% al 30%

   Zero ricerche in piu' senza avversario, su tutte e tre. E i numeri
   non sono di una popolazione sola: il banco prende `--seme`, e su
   20260923 / 424242 / 987654 / 555 le tre righe restano dentro le
   stesse soglie.

   IL PAVIMENTO SI ALZA DA 6/4/2 A 7/5/3, e non e' un ritocco: e' il
   PREZZO della terza coordinata, trovato dalla stessa misura che lo
   trovo' al #137. Una finestra piu' stretta da' abbinamenti piu' giusti
   E MENO GENTE DENTRO, e il pavimento e' la manopola fra le due cose.
   Misurato, «avversari distinti in 200 ricerche, il peggio servito»:

     pavimento      400        60        12
     6/4/2 (#137)   8 -> 6    6 -> 4    4 -> 2
     7/5/3          8 -> 7    6 -> 5    5 -> 3  (su due semi su quattro)
     7/5/4          8 -> 7    6 -> 5    5 -> 4  (su tutti e quattro)
     8/6/4          8 -> 8    6 -> 6    4 -> 4

   Col pavimento del #137 lasciato com'era, sulla base vera da dodici il
   peggio servito DIMEZZA: due avversari possibili, gli stessi tutte le
   sere. E' precisamente la cosa che l'`order by random()` di
   `trova_avversario` esiste per impedire, e che il #137 aveva gia'
   trovato una volta.

   E IL 7/5/3 E' STATO SCARTATO DA UN SECONDO SEME, non da un'idea. Su
   20260923 dava 4 avversari possibili e sembrava a posto; su 987654 e
   555 ne dava TRE. E' per questo che il banco prende `--seme`: un numero
   misurato su una popolazione sola e' un aneddoto, e qui l'aneddoto
   avrebbe fatto passare una finestra che affama qualcuno una volta su
   due.

   E PERCHE' NON 8/6/4, che protegge ancora meglio il mazzo: perche'
   costa altrove. Su dodici persone un gradino che ne chiede OTTO non si
   soddisfa quasi mai, la ricerca cade piu' in basso, e la misura del
   #137 — lo scarto mediano di PUNTI sulla base da dodici — peggiorava da
   147 a 213 (`strumenti/_q-sospetto.js` C5, che con 7/5/4 resta a 147).
   Il pavimento giusto e' il piu' alto che non disfaccia una misura gia'
   pagata.

   =====================================================================
   IL GRADINO IN PIU', E ANCHE QUESTO L'HA TROVATO IL BANCO.

   La scala doveva restare a quattro. Il gruppo C di `_q-glicko.js` ha
   detto di no, e la cosa che ha detto vale la pena di leggerla: su una
   base di DODICI, stringere i primi tre gradini fa cadere la ricerca
   sull'ULTIMO molto piu' spesso (gradino medio da 2,00 a 3,24) — e
   l'ultimo, per costruzione, non ha limiti. Risultato misurato: lo
   scarto mediano migliorava (291 -> 226) e la CODA PEGGIORAVA (p90 da
   554 a 666). Cioe': partite piu' giuste per quasi tutti, e qualche
   partita piu' assurda di prima per chi finiva in fondo alla scala.

   E' lo stesso difetto del pavimento del mazzo visto dall'altra parte:
   stringere sopra spinge gente sotto, e sotto non c'era niente ad
   aspettarla. Allora fra il terzo gradino e il salto nel vuoto se ne
   mette uno: forza e punti senza limite come l'ultimo, ma l'equilibrio
   ancora a 0,40 (il piu' forte non vince piu' del 90% delle volte) e
   almeno DUE candidati. E' un atterraggio, non un muro — e se nemmeno
   quello basta, sotto c'e' ancora l'ultimo gradino di sempre.

   Misurato sulla base da dodici, con e senza il quinto gradino:

     scarto mediano   291 -> 226 (senza)   ·   291 -> 185 (con)
     p90              554 -> 666 (senza)   ·   554 -> 391 (con)
     entro 100        21% -> 29% (senza)   ·   21% -> 30% (con)
     peggio servito     4 -> 4                ·     4 -> 4

   Su 400 e su 60 non cambia niente: li' la ricerca non ci arriva mai.
   ===================================================================== */
export const SCALA = [
  { forza:  8, punti:  120, equilibrio: 0.08, minimo: 7 },
  { forza: 20, punti:  300, equilibrio: 0.15, minimo: 5 },
  { forza: 40, punti:  700, equilibrio: 0.25, minimo: 4 },
  /* l'atterraggio: forza e punti gia' senza limite, ma l'equilibrio
     ancora a 0,40 — il piu' forte non vince piu' del 90% delle volte */
  { forza: 99, punti: Infinity, equilibrio: 0.40, minimo: 2 },
  /* e l'ultimo gradino di sempre: qui passa chiunque, sempre */
  { forza: 99, punti: Infinity, equilibrio: Infinity, minimo: 1 },
];

/* =====================================================================
   LA SOGLIA DEL SOSPETTO — tre, non uno.

   Il sospetto e' il numero di sfide di un attaccante che il giudice ha
   chiuso a `verificata = -1`, cioe' con verdetto NON TORNA (voce #137,
   rete/lib/verdetto.js). Da tre in su, la ricerca cerca solo fra chi sta
   dalla stessa parte di questa soglia: e' il «pool separati per
   abusatori» del mandato §10.5.

   PERCHE' TRE E NON UNO. Un solo NON TORNA puo' essere un difetto del
   nostro giudice, che e' nuovo di questa settimana; tre sono un
   comportamento. Il numero non decade mai — se decadesse, il sospetto
   smetterebbe di essere il CONTO delle righe e diventerebbe
   un'opinione — quindi la prudenza sta tutta qui, nella soglia e nel
   fatto che la conseguenza non e' una punizione: non toglie punti, non
   bandisce, non si vede. Cambia soltanto con chi ti abbini.
   ===================================================================== */
export const SOSPETTO_SEPARA = 3;

/* I ripieghi sono quelli dell'SQL, alla lettera: `coalesce(p.punti,
   1000)` per chi non ha ancora una riga in classifica, e 50 di forza per
   chi non ha ancora pubblicato una squadra. Se qui e li' divergessero,
   il ricontrollo dell'endpoint scarterebbe candidati buoni. */
export const puntiDi = c => (c && Number.isFinite(+c.punti)) ? Math.round(+c.punti) : 1000;
export const forzaDi = c => (c && Number.isFinite(+c.forza)) ? Math.round(+c.forza) : 50;
/* la tupla del database chiama `allenatore` quel che il banco chiama
   `id`: una funzione sola, cosi' il ricontrollo non salta */
export const idDi = c => (c && c.allenatore !== undefined && c.allenatore !== null) ? c.allenatore : (c ? c.id : undefined);

/* Che cosa mandare all'SQL al posto di `Infinity`: JSON non lo sa
   scrivere, e il database legge `null` come «nessun limite»
   (`banda_punti is null or abs(...) <= banda_punti`). Sta scritto in una
   funzione invece che in una riga sparsa perche' un lettore che non lo
   sa legge quel `null` come «zero». */
export const bandaSql = gradino => (gradino && Number.isFinite(gradino.punti)) ? gradino.punti : null;
export const minimoSql = gradino => (gradino && (gradino.minimo | 0) > 0) ? (gradino.minimo | 0) : 1;
/* stessa faccenda per la terza coordinata: `null` = nessun limite */
export const equilibrioSql = gradino => (gradino && Number.isFinite(gradino.equilibrio)) ? gradino.equilibrio : null;

/* =====================================================================
   AMMISSIBILE — le due coordinate, e nient'altro.

   NON guarda il sospetto, ed e' una decisione, non una dimenticanza: la
   separazione vive dentro il database perche' ricontrollarla qui fuori
   vorrebbe dire far uscire il sospetto dalla tupla, e la tupla di
   `trova_avversario` finisce dritta nel corpo della risposta
   (`avversario: avv`, rete/api/avversario.js). Quel che non deve uscire
   non si fa uscire: non si fa uscire e poi si cancella.
   ===================================================================== */
export function ammissibile(io, c, gradino) {
  if (!io || !c || !gradino) return false;
  const mioId = idDi(io);
  if (mioId !== undefined && idDi(c) === mioId) return false;
  if (Math.abs(forzaDi(c) - forzaDi(io)) > (gradino.forza | 0)) return false;
  if (!Number.isFinite(gradino.punti)) return true;      /* nessun limite */
  return Math.abs(puntiDi(c) - puntiDi(io)) <= gradino.punti;
}

/* =====================================================================
   SEPARATI — le due parti della soglia.

   E' il predicato che l'SQL scrive cosi':
     (a.sospetto >= separa) = (mia.sp >= separa)
   qui negato, perche' «separati» e' piu' chiaro da leggere di «stanno
   dalla stessa parte». Vale nei DUE VERSI: un onesto non incontra un
   sospetto, e un sospetto non incontra un onesto.

   In produzione non lo chiama nessuno — lo fa il database, che e' dove
   sta il dato. Qui c'e' perche' e' la definizione eseguibile della
   regola, ed e' la definizione che il banco misura.
   ===================================================================== */
/* =====================================================================
   EQUILIBRATO — la terza coordinata, e vive DOVE VIVE LA SEPARAZIONE.

   Sta accanto a `separati` e non dentro `ammissibile`, e la ragione e'
   la stessa scritta sopra `ammissibile`: **il rating nascosto non esce
   dal database**. La tupla di `trova_avversario` finisce dritta nel
   corpo della risposta di /api/avversario (`avversario: avv`), cioe' sul
   telefono di un'altra persona, e un rating che viaggia non e'
   nascosto. Per ricontrollarlo nell'endpoint bisognerebbe farlo uscire,
   e quel che non deve uscire non si fa uscire e poi si cancella.

   CONSEGUENZA, DETTA PERCHE' TOGLIE UNA RETE: il ricontrollo di
   `avversario.js` resta su forza e punti. Se un giorno il predicato
   dell'equilibrio divergesse fra qui e l'SQL, il ricontrollo non se ne
   accorgerebbe — e' il prezzo di tenere il rating dentro al database, e
   il cambio e' buono. Questa funzione e' la definizione ESEGUIBILE
   della regola: e' quel che il banco misura su 5000 ricerche
   (strumenti/_q-glicko.js), ed e' quel che l'SQL traduce.

   In produzione non la chiama nessuno, esattamente come `separati`.
   ===================================================================== */
export function equilibrato(io, c, gradino) {
  if (!io || !c || !gradino) return false;
  if (!Number.isFinite(gradino.equilibrio)) return true;      /* nessun limite */
  return Math.abs(atteso(io, c) - 0.5) <= gradino.equilibrio;
}

export function separati(io, c, soglia) {
  const s = (soglia === undefined || soglia === null) ? SOSPETTO_SEPARA : (soglia | 0);
  return (((io && io.sospetto) | 0) >= s) !== (((c && c.sospetto) | 0) >= s);
}

/* =====================================================================
   CERCA — l'implementazione di riferimento della ricerca.

   In produzione la scansione la fa il database (e' una scansione con un
   ordinamento: farla qui vorrebbe dire scaricare mezza tabella per
   buttarla via, ed e' scritto sopra `trova_avversario` dal primo
   giorno). Questa e' la stessa ricerca su un elenco in memoria: e' quel
   che `strumenti/_q-sospetto.js` misura su 5000 ricerche simulate, ed e'
   la definizione contro cui l'SQL si legge.
   ===================================================================== */
export function cerca(io, elenco, dado, opz) {
  if (typeof dado !== 'function') dado = Math.random;
  const soglia = (opz && opz.soglia !== undefined) ? opz.soglia : SOSPETTO_SEPARA;
  const gente = Array.isArray(elenco) ? elenco : [];
  for (let k = 0; k < SCALA.length; k++) {
    const gradino = SCALA[k];
    const buoni = [];
    for (const c of gente)
      if (ammissibile(io, c, gradino) && equilibrato(io, c, gradino) && !separati(io, c, soglia)) buoni.push(c);
    /* IL PAVIMENTO: non basta trovarne uno, ne servono `minimo` (vedi
       sopra). L'ultimo gradino ne chiede uno, quindi non si esce mai a
       mani vuote per colpa di questa riga. */
    if (buoni.length < (gradino.minimo | 0 || 1)) continue;
    /* SI SORTEGGIA, non si prende il piu' vicino. Se prendessimo sempre
       il piu' vicino, due giocatori della stessa fascia si
       incontrerebbero all'infinito: e' la ragione dell'`order by
       random()`, scritta sopra `trova_avversario` dal primo giorno. Un
       abbinamento piu' stretto pagato con lo stesso avversario tutte le
       sere non e' un affare. */
    const scelto = buoni[Math.floor(dado() * buoni.length)];
    return { avv: scelto, gradino: k + 1 };
  }
  return { avv: null, gradino: 0 };
}

/* quanto sono lontani, in punti: la grandezza che il banco misura */
export const distanza = (a, b) => Math.abs(puntiDi(a) - puntiDi(b));
