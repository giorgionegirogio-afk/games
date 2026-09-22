/* =====================================================================
   verdetto.js — CHE COSA SUCCEDE QUANDO ARRIVA UN VERDETTO (voce #137).

   IL GIUDICE ESISTE DA IERI. La voce #133 ha costruito
   `window.__test.giudica(nastro, atteso, {seme, taglia})`, che rigioca
   una sfida sul motore vero e restituisce uno di CINQUE verdetti; la
   #134 ha fatto viaggiare il verdetto fino all'occhio di chi gioca.
   Quel che mancava e' l'ALTRO CAPO: che cosa il server fa di un
   verdetto. E' questo file.

   LA REGOLA, e non ce n'e' un'altra:

     TORNA         il punteggio rigiocato coincide      chiude la riga
     NON TORNA     coincide male                        L'UNICO CHE ACCUSA
     INCOMPLETO    il nastro non basta a decidere       non lo so
     ALTRO MOTORE  MOTORE_V diverso                     non lo so
     NON FINISCE   la rigiocata non arriva in fondo     non lo so

   GLI ULTIMI TRE NON SONO «HAI BARATO»: SONO «NON LO SO». Un nastro
   incompleto e' un nastro scritto prima di una cura, o una finestra di
   misura diversa, o un registro troncato. Un motore diverso e' il gioco
   di ieri. Una rigiocata che non finisce puo' essere un tetto nostro
   troppo stretto. Nessuna delle tre e' un imbroglio, e un sospetto che
   nasce da un «non lo so» e' un innocente accusato — il difetto piu'
   grave che questo cantiere possa avere.

   IL RIPIEGO E' L'INNOCENZA. Qualunque cosa che non sia esattamente una
   delle cinque parole — una stringa vuota, un nullo, un minuscolo, un
   verdetto inventato fra un anno — vale «non lo so» e non muove niente.
   Chi vuole accusare deve dirlo con la parola giusta, per intero.

   PERCHE' `verificata` RESTA ZERO sui tre «non lo so», e non 1 e non -1:
   zero vuol dire «da riguardare», e l'indice `sfida_daverificare` tiene
   quelle righe in lista. Un `INCOMPLETO / schermo-diverso` si puo'
   rigiudicare domani aprendo il browser della misura giusta. Un TORNA o
   un NON TORNA invece chiudono la riga per sempre.

   E QUESTO FILE NON E' QUELLO CHE GIRA IN PRODUZIONE, va detto: in
   produzione la transazione e' una funzione del database
   (`segna_verdetto` in rete/schema.sql), perche' disfare i punti di due
   persone e alzare un contatore devono succedere tutti insieme o per
   niente. Questa e' la DEFINIZIONE ESEGUIBILE della stessa regola —
   quella che `strumenti/_q-sospetto.js` misura davvero, e contro cui
   l'SQL si legge. L'SQL rifa' la tavola dei cinque da se', quindi le
   porte sono due: chi sbagliasse a chiamare `conseguenza()` e passasse
   un -1 a mano al database non verrebbe creduto comunque, perche' il
   database non accetta -1, accetta 'NON TORNA'.
   ===================================================================== */

export const VERDETTI = ['TORNA', 'NON TORNA', 'INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE'];

/* La tavola, in un posto solo. `verificata` e' il valore che va nella
   colonna; `sospetto` e' di quanto sale il contatore dell'attaccante;
   `disfa` dice se i punti di quella partita tornano indietro. */
const TAVOLA = {
  'TORNA':        { verificata:  1, sospetto: 0, disfa: false },
  'NON TORNA':    { verificata: -1, sospetto: 1, disfa: true  },
  'INCOMPLETO':   { verificata:  0, sospetto: 0, disfa: false },
  'ALTRO MOTORE': { verificata:  0, sospetto: 0, disfa: false },
  'NON FINISCE':  { verificata:  0, sospetto: 0, disfa: false },
};
const NON_LO_SO = { verificata: 0, sospetto: 0, disfa: false };

export function conseguenza(verdetto) {
  const v = (typeof verdetto === 'string') ? verdetto : '';
  /* `hasOwnProperty` e non `TAVOLA[v]`: senza, un verdetto che si
     chiamasse `constructor` o `toString` pescherebbe qualcosa dalla
     catena dei prototipi invece di cadere nel ripiego. */
  const r = Object.prototype.hasOwnProperty.call(TAVOLA, v) ? TAVOLA[v] : NON_LO_SO;
  /* si restituisce una COPIA: una tavola che da' sempre lo stesso
     oggetto e' una tavola che il primo chiamante puo' riscrivere per
     tutti quelli che vengono dopo */
  return { verificata: r.verificata, sospetto: r.sospetto, disfa: r.disfa };
}

/* =====================================================================
   IL DISFACIMENTO — di quanto scende ogni contatore.

   Le colonne `delta_a` e `delta_d` esistono dal primo giorno con scritto
   accanto «punti mossi, per poterli disfare» (rete/schema.sql). Questo
   e' il giorno in cui servono.

   LA `serie` NON SI DISFA, e va detto invece di lasciarlo scoprire: non
   e' ricostruibile da una riga sola — servirebbe l'ordine di tutte le
   partite venute dopo — e vale al massimo un moltiplicatore del 30% su
   una singola partita (`elo()`, il `bonus`). E' l'unica cosa che una
   sfida disfatta lascia indietro.
   ===================================================================== */
export function disfacimento(s) {
  const ga = (s && s.gol_a) | 0, gd = (s && s.gol_d) | 0;
  return {
    attaccante: {
      punti: -((s && s.delta_a) | 0),
      vinte: ga > gd ? -1 : 0, pari: ga === gd ? -1 : 0, perse: ga < gd ? -1 : 0,
      fatti: -ga, subiti: -gd,
    },
    difensore: {
      punti: -((s && s.delta_d) | 0),
      vinte: gd > ga ? -1 : 0, pari: ga === gd ? -1 : 0, perse: gd < ga ? -1 : 0,
      fatti: -gd, subiti: -ga,
    },
  };
}

/* il banco del cancello tiene le tabelle in Map, un chiamante qualunque
   potrebbe tenerle in oggetti: una funzione sola, cosi' non ci si pensa */
function prendi(tabella, chiave) {
  if (!tabella || chiave === undefined || chiave === null) return null;
  if (typeof tabella.get === 'function') return tabella.get(chiave) || null;
  return tabella[chiave] || null;
}

/* i pavimenti sono quelli di `muovi_punti`: cento punti e zero
   contatori. Disfare non deve poter scavare sotto il fondo che il
   server non ha mai lasciato scavare. */
function scala(riga, delta) {
  if (!riga) return;
  riga.punti = Math.max(100, (riga.punti | 0) + (delta.punti | 0));
  for (const k of ['vinte', 'pari', 'perse', 'fatti', 'subiti'])
    riga[k] = Math.max(0, (riga[k] | 0) + (delta[k] | 0));
}

/* =====================================================================
   APPLICA — un verdetto, una riga, una volta sola.

   LA GUARDIA e' la riga che conta: si tocca solo una sfida ancora
   APERTA (`verificata === 0`). Senza, un verificatore che ripassa sulla
   stessa riga — o due processi partiti insieme — toglierebbero i punti
   due volte e scriverebbero due sospetti per una partita sola. E' il
   difetto che non si vede mai in prova, perche' in prova un verdetto si
   applica una volta. E' la stessa forma del DELETE che consuma
   l'impegno in /api/sfida: il controllo lo fa la struttura, non un `if`
   che qualcuno un giorno spostera'.
   ===================================================================== */
export function applica(banco, idSfida, verdetto) {
  const c = conseguenza(verdetto);
  const niente = causa => ({ mosso: false, esito: c.verificata, sospetto: 0, causa });
  if (!banco || !Array.isArray(banco.sfida)) return niente('niente-banco');
  /* un «non lo so» non tocca NIENTE: nemmeno la colonna, che resta a
     zero cosi' la riga si puo' rigiudicare */
  if (c.verificata === 0) return niente('non-lo-so');
  const s = banco.sfida.find(x => x && x.id === idSfida);
  if (!s) return niente('sfida-ignota');
  if (s.verificata !== 0) return niente('gia-giudicata');
  s.verificata = c.verificata;
  if (!c.disfa) return { mosso: true, esito: c.verificata, sospetto: 0, causa: '' };

  const d = disfacimento(s);
  scala(prendi(banco.punti, s.attaccante), d.attaccante);
  if (s.difensore) scala(prendi(banco.punti, s.difensore), d.difensore);

  /* IL SOSPETTO, e sale QUI e in nessun altro punto del file: dentro il
     ramo del solo NON TORNA, dopo che la riga e' stata chiusa a -1.
     Cosi' l'invariante regge per costruzione — il sospetto di uno E' il
     numero delle sue righe a -1 — e chi e' segnato lo e' per partite
     che chiunque abbia la chiave puo' rigiocare una per una. */
  const a = prendi(banco.allenatore, s.attaccante);
  if (a) a.sospetto = Math.max(0, (a.sospetto | 0) + c.sospetto);
  return { mosso: true, esito: c.verificata, sospetto: a ? (a.sospetto | 0) : 0, causa: '' };
}
