/* =====================================================================
   POST /api/sfida — l'esito, e il replay che lo dimostra.
   GET  /api/sfida  — le sfide che hai subìto e non hai ancora guardato.

   QUEL CHE ARRIVA QUI NON È UN PUNTEGGIO: è {seme, comandi}. Il
   punteggio è una conseguenza, e chiunque può ricalcolarla. È la cosa
   che il nostro gioco può fare e FC Mobile no, e non per bravura nostra:
   il loro motore nativo da 116 MB non è deterministico, il nostro sì
   (misurato, 6 controlli su 6 — strumenti/_q-determinismo.js).

   DUE CONSEGUENZE, e vale la pena scriverle:
     · il difensore può GUARDARE la partita che ha subìto mentre dormiva,
       intera, in quattro kB;
     · un risultato inventato si scopre rigiocandolo.

   LA VERIFICA È IN DUE TEMPI, e non è pigrizia. Adesso, sulla richiesta,
   si controlla solo quel che costa niente: che l'impegno esista, che il
   seme sia quello, che i conti stiano in piedi, che il replay abbia una
   forma sensata. Rigiocare davvero la partita costa quanto giocarla, e
   farlo dentro la richiesta significherebbe far aspettare il giocatore
   onesto per colpa del disonesto. Lo fa un lavoratore periodico, a
   campione, su `verificata = 0`. Chi ha barato lo scopre dopo, quando i
   punti se ne vanno.
   ===================================================================== */
import { db, rispondi, preflight, guaio, chiSei, frenato, corpo,
         intero, configurato } from '../lib/comuni.js';

/* Mezz'ora: una partita dura fra 90 e 180 secondi, e mezz'ora copre
   chi si è distratto, ha risposto al telefono, è entrato in galleria.
   Oltre, l'impegno è morto e il seme non vale più. */
const IMPEGNO_VIVO_MS = 30 * 60 * 1000;

/* Il replay di una partita di tre minuti a 60 fotogrammi sta in pochi kB
   se contiene i CAMBI di comando e non un campione per fotogramma. 64 kB
   è quattro volte il peggio misurabile: oltre, o è un altro formato o è
   qualcuno che sta provando a riempirci il database. */
const REPLAY_MAX = 64 * 1024;

/* ---------------------------------------------------------------- Elo */
/* Il K cala con i punti: chi comincia si muove in fretta e trova il suo
   posto in dieci partite; chi è in alto non lo perde per una serata
   storta. Il moltiplicatore di serie premia le vittorie di fila, che è
   l'unica cosa che tiene qualcuno a giocare la sesta partita di seguito. */
function elo(mio, suo, esito, serie) {
  const atteso = 1 / (1 + Math.pow(10, (suo - mio) / 400));
  const K = mio < 1200 ? 40 : mio < 1600 ? 28 : mio < 2000 ? 20 : 14;
  const bonus = esito === 1 ? Math.min(1.3, 1 + Math.min(serie, 6) * 0.05) : 1;
  return Math.round(K * (esito - atteso) * bonus);
}

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  if (!configurato()) return rispondi(res, 503, { ok: false, errore: 'spento' });

  try {
    const io = await chiSei(req);
    if (!io) return rispondi(res, 401, { ok: false, errore: 'ignoto' });
    if (io.bandito) return rispondi(res, 403, { ok: false, errore: 'bandito' });

    /* ------------------------------------------------ le sfide subìte */
    if (req.method === 'GET') {
      const r = await db.leggi('sfida',
        'difensore=eq.' + io.id + '&order=giocata.desc&limit=20' +
        '&select=id,seme,taglia,gol_a,gol_d,giocata,vista,attaccante');
      /* i nomi degli attaccanti in un colpo solo, non uno per riga */
      const ids = [...new Set((r || []).map(s => s.attaccante))];
      let nomi = {};
      if (ids.length) {
        const q = await db.leggi('squadra', 'allenatore=in.(' + ids.join(',') + ')&select=allenatore,nome,colori');
        for (const s of q || []) nomi[s.allenatore] = { nome: s.nome, colori: s.colori };
      }
      return rispondi(res, 200, {
        ok: true,
        sfide: (r || []).map(s => ({ ...s, sfidante: nomi[s.attaccante] || null, attaccante: undefined })),
      });
    }

    if (req.method !== 'POST') return rispondi(res, 405, { ok: false, errore: 'metodo' });
    if (await frenato('sfida:' + io.id, 30, 60))
      return rispondi(res, 429, { ok: false, errore: 'troppe' });

    const c = await corpo(req);

    /* --------------------------------------- l'impegno, e il suo seme */
    const imp = await db.leggi('impegno', 'attaccante=eq.' + io.id + '&select=*');
    const i = imp && imp[0];
    if (!i) return rispondi(res, 409, { ok: false, errore: 'nessun-impegno' });
    if (String(i.seme) !== String(c.seme))
      return rispondi(res, 409, { ok: false, errore: 'seme-non-tuo' });
    if (Date.now() - new Date(i.creato).getTime() > IMPEGNO_VIVO_MS)
      return rispondi(res, 409, { ok: false, errore: 'impegno-scaduto' });

    /* L'impegno si consuma SUBITO, prima di qualsiasi altra cosa: se
       arrivassero due richieste insieme (rete ballerina, doppio invio),
       la seconda deve trovare il vuoto. Il DELETE restituisce le righe
       tolte, quindi sappiamo di essere stati noi a toglierlo — e se non
       lo sappiamo, ci fermiamo qui invece di contare la partita due
       volte. Il controllo lo fa il database, non un `if` che qualcuno un
       giorno sposterà. */
    const tolto = await db.cancella('impegno', 'attaccante=eq.' + io.id + '&seme=eq.' + i.seme);
    if (!tolto || !tolto.length) return rispondi(res, 409, { ok: false, errore: 'gia-inviata' });

    /* ------------------------------------------------ la plausibilità */
    const gol_a = intero(c.gol_a, 0, 30, -1);
    const gol_d = intero(c.gol_d, 0, 30, -1);
    if (gol_a < 0 || gol_d < 0) return rispondi(res, 400, { ok: false, errore: 'gol' });

    const replay = typeof c.replay === 'string' ? c.replay : null;
    if (!replay) return rispondi(res, 400, { ok: false, errore: 'replay-mancante' });
    if (replay.length > REPLAY_MAX) return rispondi(res, 413, { ok: false, errore: 'replay-grosso' });
    if (!/^[A-Za-z0-9_\-=+/]+$/.test(replay)) return rispondi(res, 400, { ok: false, errore: 'replay-forma' });

    /* Un replay di quattro byte non è una partita di tre minuti. Non
       prova niente da solo, ma toglie di mezzo il caso banale di chi
       manda un punteggio con una stringa qualsiasi al posto della
       partita. Il resto lo dice il verificatore, rigiocandola. */
    if (replay.length < 40) return rispondi(res, 400, { ok: false, errore: 'replay-vuoto' });

    /* ---------------------------------------------------- i punti */
    const esito = gol_a > gol_d ? 1 : gol_a < gol_d ? 0 : 0.5;

    const mieiR = await db.leggi('punti', 'allenatore=eq.' + io.id + '&select=punti,serie');
    const miei = (mieiR && mieiR[0]) || { punti: 1000, serie: 0 };

    let suoiPunti = i.forza_avv * 20;   /* un avversario costruito vale la sua forza */
    if (i.difensore) {
      const r = await db.leggi('punti', 'allenatore=eq.' + i.difensore + '&select=punti');
      suoiPunti = (r && r[0] && r[0].punti) || 1000;
    }

    let delta = elo(miei.punti, suoiPunti, esito, miei.serie);

    /* CONTRO UN AVVERSARIO COSTRUITO SI PRENDE META'.
       Non zero, perché all'inizio non ci sarà nessun altro e una
       classifica che non si muove è una classifica morta. Non tutto,
       perché una squadra costruita dal server non si difende come una
       persona, e chi lo scopre passa la serata a battere fantasmi. Il
       gioco lo scrive accanto al risultato: «allenamento, mezzi punti». */
    if (!i.difensore) delta = Math.round(delta * 0.5);

    /* L'incremento è ATOMICO e sta nel database (`muovi_punti`). Leggere,
       sommare in JavaScript e riscrivere sembra la stessa cosa e non lo
       è: due sfide che arrivano insieme contro lo stesso difensore
       leggerebbero entrambe il valore vecchio, e uno dei due aggiornamenti
       sparirebbe in silenzio. */
    const punti = await db.chiama('muovi_punti', {
      chi: io.id, d: delta, gf: gol_a, gs: gol_d, esito, tocca_serie: true,
    });
    const nuovaSerie = esito === 1 ? miei.serie + 1 : 0;

    /* IL DIFENSORE PERDE MENO DI QUANTO L'ATTACCANTE GUADAGNA, e non è
       una svista: lui non stava giocando. Una classifica dove si scende
       dormendo è una classifica che si chiude e non si riapre. Metà del
       delta, mai sotto i cento punti, e la sua striscia di vittorie non
       si spezza per una partita che non ha giocato. */
    let deltaD = 0;
    if (i.difensore) {
      deltaD = Math.round(-delta * 0.5);
      await db.chiama('muovi_punti', {
        chi: i.difensore, d: deltaD, gf: gol_d, gs: gol_a,
        esito: 1 - esito, tocca_serie: false,
      });
    }

    /* La sfida si registra solo se c'è un difensore vero: contro un
       avversario costruito non c'è nessuno a cui far rivedere la
       partita, e una riga che nessuno leggerà mai è peso nel database. */
    let idSfida = null;
    if (i.difensore) {
      const r = await db.inserisci('sfida', {
        attaccante: io.id, difensore: i.difensore,
        seme: i.seme, taglia: i.taglia,
        gol_a, gol_d, replay, peso: replay.length,
        delta_a: delta, delta_d: deltaD,
      });
      idSfida = r && r[0] && r[0].id;
    }

    return rispondi(res, 200, {
      ok: true, esito: esito === 1 ? 'vinta' : esito === 0 ? 'persa' : 'pari',
      delta, punti, serie: nuovaSerie, vero: !!i.difensore, sfida: idSfida,
    });
  } catch (e) { return guaio(res, e); }
}
