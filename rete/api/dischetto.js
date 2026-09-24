/* =====================================================================
   /api/dischetto — LA CASSETTA (voce #146).

   Il trasporto della sfida dal dischetto: un buca-lettere indicizzato,
   letto a polling. Due verbi soli.

     POST /api/dischetto   {stanza,k,r,t,d}   imbuca   -> {ok, i}
     GET  /api/dischetto?stanza=X&da=N        ritira   -> {ok, msg, i}

   PERCHÉ UN POLLING E NON UN WEBSOCKET, misurato e non scelto. La voce
   #145 ha misurato la coda della rete italiana su relay veri: 3,7-5,5
   volte la mediana e **a raffica** — il 78,4% dei pacchetti in coda ne
   ha un altro in coda subito prima, quindi la ridondanza non aiuta
   (blocco in testa alla fila di TCP: le copie stanno nella stessa fila
   ferma). Un lockstep a 60 Hz chiede 600 invii al minuto e si
   fermerebbe 9-17 volte al minuto, contro una soglia di meno di una.
   **Un duello no**: dieci scambi danno 0,017 stalli per duello. Il
   danno da stallo scala con la FREQUENZA del canale, e questo canale ha
   la frequenza di un duello.

   LE TRE REGOLE CHE LO RENDONO UN TRASPORTO ONESTO.

   a) L'INDICE È DEL SERVER. Ogni messaggio prende un numero crescente
      dentro la sua stanza, e il ritiro chiede «tutto dopo N». È quel
      che rende un ritiro perso un non-evento: il ritiro successivo
      riporta anche ciò che il precedente non ha visto. Se l'indice
      fosse del client, un client che sbaglia a contare perderebbe
      messaggi per sempre.

   b) SI SCRIVE UNA VOLTA SOLA per (stanza, tiro, lato, tipo). Il
      secondo imbuco IDENTICO è un sì — il ritentativo dopo un imbuco
      perso deve poter funzionare. Il secondo imbuco DIVERSO è un no, ed
      è **metà della fiducia** di questo cantiere: è la riga che
      impedisce di cambiare idea dopo aver parlato. Lo fa il vincolo di
      unicità del database, non un `if` che qualcuno un giorno sposterà.

   c) LA STANZA È IL NOME DELLA CASSETTA, e nient'altro. Non c'è una
      tabella di persone, non c'è un conto, non c'è un'identità che
      viaggia: chi legge il codice sa dove sta la posta, non chi la
      scrive. L'identità serve **solo al freno**, ed è quella anonima
      che il gioco ha già.

   IL FRENO PRENDE GLI STESSI NUMERI DEL FRATELLO PIÙ LARGO — 60 al
   minuto per identità, come `sfl:` e `avv:` — e **nessun privilegio**.
   Il conto che ci deve stare dentro è nella spec §2.4: due imbuchi e
   circa quattro ritiri per tiro, un tiro ogni dieci secondi, cioè 36 al
   minuto. Non è una promessa: `strumenti/_q-dischetto.js` gruppo E lo
   misura e diventa rosso se sfora.

   E IL CONTENUTO NON SI LEGGE. Il server non sa che cosa sia un
   impegno, non sa che cosa sia una mossa, e non giudica niente: sposta
   buste. Il giudizio è del gioco (`giudica`, cinque verdetti) e della
   staffetta, e resta lì — un endpoint che capisse il protocollo
   sarebbe una terza porta scritta peggio delle due che ci sono.
   ===================================================================== */
import { db, rispondi, preflight, guaio, chiSei, frenato, corpo,
         intero, configurato } from '../lib/comuni.js';

/* Una busta non è una partita: quattro kilobyte sono già il doppio del
   più grande messaggio che questo protocollo sappia produrre (una
   rivelazione con la rosa impaccata). */
const BUSTA_MAX = 4096;

/* Una stanza smette di esistere da sé: il giro di pulizia sta in
   `schema.sql` e toglie le stanze vecchie di un'ora. Qui non serve
   altro che rifiutare i tiri fuori scala. */
const TIRO_MAX = 40;

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  if (!configurato()) return rispondi(res, 503, { ok: false, errore: 'spento' });

  try {
    const io = await chiSei(req);
    if (!io) return rispondi(res, 401, { ok: false, errore: 'ignoto' });
    if (io.bandito) return rispondi(res, 403, { ok: false, errore: 'bandito' });

    /* IL FRENO PRIMA DI TUTTO, e uno solo per i due verbi: le funzioni
       Vercel non condividono memoria, quindi ogni endpoint ha il suo, e
       dentro l'endpoint imbuco e ritiro pescano dallo stesso secchio —
       se no il tetto vero sarebbe il doppio di quello scritto. */
    if (await frenato('dis:' + io.id, 60, 60))
      return rispondi(res, 429, { ok: false, errore: 'troppe' });

    /* ------------------------------------------------------- RITIRO */
    if (req.method === 'GET') {
      const stanza = String(req.query && req.query.stanza || '').toUpperCase();
      if (!/^[0-9A-Z]{6}$/.test(stanza)) return rispondi(res, 400, { ok: false, errore: 'stanza-forma' });
      const da = intero(req.query && req.query.da, 0, 9999, 0);
      const r = await db.leggi('cassetta',
        'stanza=eq.' + stanza + '&i=gt.' + da + '&order=i.asc&limit=200&select=i,k,r,t,d');
      /* `i` che torna è il più alto VISTO, non il più alto esistente:
         chi chiama lo usa come prossimo `da`, e se due messaggi
         arrivassero fra la lettura e la risposta li prende al giro dopo
         invece di saltarli. */
      const msg = r || [];
      const ultimo = msg.length ? msg[msg.length - 1].i : da;
      return rispondi(res, 200, { ok: true, msg, i: ultimo });
    }

    /* ------------------------------------------------------- IMBUCO */
    if (req.method !== 'POST') return rispondi(res, 405, { ok: false, errore: 'metodo' });
    const c = await corpo(req);

    const stanza = String(c.stanza || '').toUpperCase();
    if (!/^[0-9A-Z]{6}$/.test(stanza)) return rispondi(res, 400, { ok: false, errore: 'stanza-forma' });
    const k = String(c.k || '');
    /* CINQUE TIPI DAL PROTOCOLLO v2 (voce #150): S saluto (che dal v2
       porta l'IMPEGNO del nonce, non il nonce), N la rivelazione di quel
       nonce, I l'impegno del tiro, R la sua rivelazione, F la fine. Il
       server non legge dentro nessuna delle cinque: sposta buste. */
    if (!/^[SIRNF]$/.test(k)) return rispondi(res, 400, { ok: false, errore: 'tipo' });
    const r = String(c.r || '');
    if (r !== 'a' && r !== 'b') return rispondi(res, 400, { ok: false, errore: 'lato' });
    const t = intero(c.t, 0, TIRO_MAX, -1);
    if (t < 0) return rispondi(res, 400, { ok: false, errore: 'tiro' });

    const d = (c.d === undefined) ? null : c.d;
    const testo = JSON.stringify(d);
    if (testo.length > BUSTA_MAX) return rispondi(res, 413, { ok: false, errore: 'busta-grossa' });

    /* LA GUARDIA DEL «GIÀ DETTO», e la fa il database.
       La chiave (stanza, k, r, t) è unica nello schema. Si prova a
       scrivere: se il vincolo respinge, si rilegge quel che c'è.
         · identico  -> sì, con `ripetuto`. È il ritentativo dopo un
                        imbuco perso, e deve funzionare.
         · diverso   -> 409 `gia-detto`. È chi cambia idea dopo aver
                        parlato, ed è metà della fiducia di questo
                        cantiere.
       Scrivere prima e leggere dopo, invece di leggere-e-poi-scrivere,
       toglie di mezzo la corsa fra due richieste che arrivano insieme:
       il vincolo lo decide il database, non un `if`. */
    /* SI INGHIOTTE SOLO IL CONFLITTO, non qualunque errore. Un `catch`
       largo trasformerebbe un database spento in un `gia-detto` o in un
       `imbuco`, cioè in una diagnosi sbagliata mandata a chi gioca —
       ed è lo stesso difetto per cui questa casa rifiuta gli strumenti
       che attestano invece di misurare. PostgREST risponde 409 alla
       violazione di unicità; tutto il resto risale a `guaio`, che è il
       posto giusto perché un guasto vero si veda. */
    let righe = null;
    try {
      righe = await db.inserisci('cassetta', { stanza, k, r, t, d });
    } catch (e) {
      if (e && e.stato !== 409) throw e;
      righe = null;
    }
    if (righe && righe.length) return rispondi(res, 200, { ok: true, i: righe[0].i });

    const gia = await db.leggi('cassetta',
      'stanza=eq.' + stanza + '&k=eq.' + k + '&r=eq.' + r + '&t=eq.' + t + '&select=i,d');
    const g = gia && gia[0];
    if (!g) return rispondi(res, 500, { ok: false, errore: 'imbuco' });
    if (JSON.stringify(g.d) === testo) return rispondi(res, 200, { ok: true, i: g.i, ripetuto: true });
    return rispondi(res, 409, { ok: false, errore: 'gia-detto' });
  } catch (e) { return guaio(res, e); }
}
