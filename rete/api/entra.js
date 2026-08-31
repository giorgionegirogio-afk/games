/* =====================================================================
   POST /api/entra — l'identità anonima.

   È il primo e unico momento in cui il gioco «si iscrive», e non chiede
   niente: né email, né nome vero, né conto Google. Il telefono genera un
   segreto, lo tiene per sé, e il server ne conserva soltanto il digest.

   DUE USI IN UNO:
     senza corpo            → crea una identità nuova, restituisce id+segreto
     con {id, segreto}      → la riprende, e aggiorna «ultimo visto»

   Il secondo uso serve perché «visto» è il campo su cui l'accoppiamento
   decide se una squadra è viva: una squadra abbandonata da due mesi non
   è una sfida, è un punto regalato.
   ===================================================================== */
import { db, rispondi, preflight, guaio, digest, segretoNuovo,
         chiSei, frenato, corpo, paeseDi, configurato } from '../lib/comuni.js';

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  if (req.method !== 'POST') return rispondi(res, 405, { ok: false, errore: 'metodo' });
  if (!configurato()) return rispondi(res, 503, { ok: false, errore: 'spento' });

  try {
    const c = await corpo(req);

    /* --- riprendere un'identità che c'è già --- */
    if (c.id) {
      const io = await chiSei(req);
      if (!io) return rispondi(res, 401, { ok: false, errore: 'ignoto' });
      if (io.bandito) return rispondi(res, 403, { ok: false, errore: 'bandito' });
      await db.aggiorna('allenatore', 'id=eq.' + io.id, { visto: new Date().toISOString() });
      const sq = await db.leggi('squadra', 'allenatore=eq.' + io.id + '&select=nome,forza');
      const pt = await db.leggi('punti', 'allenatore=eq.' + io.id + '&select=punti,vinte,pari,perse,serie');
      return rispondi(res, 200, {
        ok: true, id: io.id,
        squadra: (sq && sq[0]) || null,
        punti: (pt && pt[0]) || null,
      });
    }

    /* --- un'identità nuova ---
       Il freno è sull'indirizzo perché qui l'identità ancora non esiste:
       è l'unico endpoint dove non si può frenare per allenatore. Dieci
       identità nuove al minuto dallo stesso indirizzo coprono una casa
       con quattro telefoni e fermano un ciclo impazzito. */
    const da = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'ignoto';
    if (await frenato('entra:' + da, 10, 60))
      return rispondi(res, 429, { ok: false, errore: 'troppe' });

    const segreto = segretoNuovo();
    const righe = await db.inserisci('allenatore', {
      segreto: digest(segreto),
      paese: paeseDi(req),
    });
    const id = righe[0].id;
    await db.inserisci('punti', { allenatore: id }, 'return=minimal');

    /* Il segreto esce da qui UNA volta sola, adesso. Non c'è nessun altro
       percorso di codice che lo rimandi indietro: se il telefono lo
       perde, l'identità è persa, e il gioco lo dice al giocatore prima
       che succeda, non dopo. */
    return rispondi(res, 200, { ok: true, id, segreto, nuovo: true });
  } catch (e) { return guaio(res, e); }
}
