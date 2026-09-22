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
   ===================================================================== */

/* =====================================================================
   LA SCALA — quattro gradini, due coordinate.

   L'ULTIMO GRADINO E' L'ULTIMO GRADINO DI OGGI, allargato in tutte e due
   le direzioni: `forza +/-99` ammette chiunque, `punti` senza limite
   ammette chiunque. Non e' una comodita': e' la garanzia che questa
   aggiunta NON PUO' COSTARE UNA SOLA SFIDA. Chi oggi trova un
   avversario domani lo trova ancora, al massimo a un gradino piu' in
   la'. Misurato: zero ricerche senza avversario in piu', su tutte e tre
   le popolazioni provate (400, 60, 12).

   Ed e' anche quel che rende SICURO il ricontrollo dell'endpoint: sul
   quarto gradino `ammissibile` e' sempre vero, quindi nel caso peggiore
   si finisce esattamente sull'abbinamento di prima invece che su niente.
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

   Sulla base da dodici — quella vera — il pavimento fa MEGLIO di oggi
   in tutte e due le grandezze: scarto mediano da 255 a 147 e avversari
   possibili da 3 a 5.

   Il prezzo, detto: le chiamate al database per ricerca passano da 1,00
   a 1,01 su 400, a 1,11 su 60 e a 2,17 su 12. Il freno di
   /api/avversario e' 60 al minuto e l'uso vero e' UNA ricerca per
   pressione del dito.
   ===================================================================== */
export const SCALA = [
  { forza:  8, punti:  120, minimo: 6 },
  { forza: 20, punti:  300, minimo: 4 },
  { forza: 40, punti:  700, minimo: 2 },
  { forza: 99, punti: Infinity, minimo: 1 },
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
    for (const c of gente) if (ammissibile(io, c, gradino) && !separati(io, c, soglia)) buoni.push(c);
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
