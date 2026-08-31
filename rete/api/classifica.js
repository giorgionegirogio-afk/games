/* =====================================================================
   GET /api/classifica — i primi cento, più la tua riga anche se sei
   trecentesimo.

   La tua riga c'è SEMPRE, e non è una gentilezza: una classifica in cui
   non ti trovi è una classifica che smetti di aprire. Se sei fuori dai
   primi cento, la funzione `classifica()` del database ti aggiunge in
   coda con il tuo posto vero.

   GET /api/classifica?replay=<id> — il replay di una sfida.
   Sta qui e non in un endpoint suo perché è la stessa cosa vista da
   un'altra angolatura: la classifica dice CHE COSA è successo, il replay
   lo fa rivedere. Lo può chiedere solo chi c'era — l'attaccante o il
   difensore — perché una partita è di chi l'ha giocata.
   ===================================================================== */
import { db, rispondi, preflight, guaio, chiSei, frenato, intero, configurato } from '../lib/comuni.js';

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  if (req.method !== 'GET') return rispondi(res, 405, { ok: false, errore: 'metodo' });
  if (!configurato()) return rispondi(res, 503, { ok: false, errore: 'spento' });

  try {
    const io = await chiSei(req);
    if (!io) return rispondi(res, 401, { ok: false, errore: 'ignoto' });

    /* ------------------------------------------------ un replay */
    if (req.query && req.query.replay) {
      const id = intero(req.query.replay, 1, Number.MAX_SAFE_INTEGER, 0);
      if (!id) return rispondi(res, 400, { ok: false, errore: 'id' });
      const r = await db.leggi('sfida', 'id=eq.' + id +
        '&select=id,attaccante,difensore,seme,taglia,gol_a,gol_d,replay,giocata');
      const s = r && r[0];
      if (!s) return rispondi(res, 404, { ok: false, errore: 'non-c-e' });
      /* una partita è di chi l'ha giocata */
      if (s.attaccante !== io.id && s.difensore !== io.id)
        return rispondi(res, 403, { ok: false, errore: 'non-tua' });
      /* segnare «vista» serve al pallino rosso sull'icona: si segna solo
         se a guardarla è il difensore, perché l'attaccante l'ha già vista
         mentre la giocava */
      if (s.difensore === io.id) await db.aggiorna('sfida', 'id=eq.' + id, { vista: true });
      /* le due rose servono a rimontare la scena: senza, il replay
         rigioca la partita giusta con le maglie sbagliate */
      const rose = await db.leggi('squadra',
        'allenatore=in.(' + s.attaccante + ',' + s.difensore + ')&select=allenatore,nome,colori,rosa,modulo,indole');
      return rispondi(res, 200, { ok: true, sfida: s, squadre: rose || [] });
    }

    /* ------------------------------------------------ la classifica */
    if (await frenato('cla:' + io.id, 60, 60))
      return rispondi(res, 429, { ok: false, errore: 'troppe' });

    const quanti = intero(req.query?.quanti, 10, 200, 100);
    const righe = await db.chiama('classifica', { io: io.id, quanti, st: 1 });
    return rispondi(res, 200, { ok: true, righe: righe || [] });
  } catch (e) { return guaio(res, e); }
}
