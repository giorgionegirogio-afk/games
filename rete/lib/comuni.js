/* =====================================================================
   comuni.js — il poco che serve a tutte e cinque le funzioni.

   ZERO DIPENDENZE, e non è purismo: ogni pacchetto in una funzione
   serverless è codice che parte a ogni richiesta fredda e che qualcuno
   deve aggiornare per sempre. Qui dentro c'è `fetch` (nativo dal Node 18)
   e `crypto` (nativo). Nient'altro.
   ===================================================================== */

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/* ------------------------------------------------------------------ db */
/* Si parla a Postgres attraverso PostgREST, che Supabase espone già.
   La chiave di servizio scavalca RLS: per questo sta QUI e non nel gioco.
   Se questa variabile finisse nel client, il progetto sarebbe scoperto —
   quindi non esiste un percorso di codice che la rimandi indietro. */
const URL_DB = process.env.SUPABASE_URL;
const CHIAVE = process.env.SUPABASE_SERVICE_KEY;

export function configurato() {
  return !!(URL_DB && CHIAVE);
}

async function rest(percorso, opz = {}) {
  const r = await fetch(URL_DB + '/rest/v1' + percorso, {
    ...opz,
    headers: {
      apikey: CHIAVE,
      Authorization: 'Bearer ' + CHIAVE,
      'Content-Type': 'application/json',
      ...(opz.headers || {}),
    },
  });
  const testo = await r.text();
  let corpo = null;
  if (testo) { try { corpo = JSON.parse(testo); } catch { corpo = testo; } }
  if (!r.ok) {
    const e = new Error('db ' + r.status + ': ' + (corpo?.message || testo).toString().slice(0, 200));
    e.stato = r.status;
    throw e;
  }
  return corpo;
}

export const db = {
  leggi: (tabella, query) => rest('/' + tabella + '?' + query),
  inserisci: (tabella, riga, opz = 'return=representation') =>
    rest('/' + tabella, { method: 'POST', headers: { Prefer: opz }, body: JSON.stringify(riga) }),
  aggiorna: (tabella, query, campi) =>
    rest('/' + tabella + '?' + query, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(campi),
    }),
  /* upsert: l'unico modo pulito per "crea se non c'è, altrimenti aggiorna"
     senza due viaggi e senza una corsa fra due richieste dello stesso
     telefono che hanno premuto due volte */
  posa: (tabella, riga, conflitto) =>
    rest('/' + tabella + '?on_conflict=' + conflitto, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(riga),
    }),
  /* Il DELETE torna le righe che ha tolto: è così che si sa di essere
     stati NOI a toglierle e non l'altra richiesta arrivata nello stesso
     istante. Un doppio invio su rete ballerina non deve contare due
     volte, e questo lo decide il database, non un controllo nel codice. */
  cancella: (tabella, query) =>
    rest('/' + tabella + '?' + query, {
      method: 'DELETE', headers: { Prefer: 'return=representation' },
    }),
  chiama: (funzione, argomenti) =>
    rest('/rpc/' + funzione, { method: 'POST', body: JSON.stringify(argomenti) }),
};

/* -------------------------------------------------------------- risposte */
/* Un solo posto che scrive le intestazioni, così non capita che un
   endpoint dimentichi il CORS e funzioni solo dal telefono. */
export function rispondi(res, stato, corpo) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.status(stato).send(JSON.stringify(corpo));
}

export function preflight(req, res) {
  if (req.method !== 'OPTIONS') return false;
  rispondi(res, 204, {});
  return true;
}

/* Un errore che arriva al giocatore deve dirgli cosa fare, non cosa è
   successo al server. Il dettaglio va nel registro, non nella risposta:
   un messaggio di Postgres rimandato al client racconta la forma delle
   tabelle a chiunque lo legga. */
export function guaio(res, e) {
  console.error('[calcetto]', e && e.stack ? e.stack : e);
  const stato = e && e.stato === 404 ? 404 : 500;
  rispondi(res, stato, { ok: false, errore: 'server' });
}

/* ------------------------------------------------------------- identità */
export const digest = s => createHash('sha256').update(String(s)).digest('hex');
export const segretoNuovo = () => randomBytes(24).toString('base64url');

/* Confronto a tempo costante: il segreto è ad alta entropia e un attacco
   temporale è teorico, ma costa una riga e toglie una discussione. */
function pari(a, b) {
  const A = Buffer.from(String(a)), B = Buffer.from(String(b));
  return A.length === B.length && timingSafeEqual(A, B);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* «Authorization: Calcetto <id>.<segreto>» — nessun JWT, nessuna scadenza,
   nessuna libreria. Il segreto sta sul telefono e non scade perché non
   c'è niente da revocare: se il telefono si perde si perde l'identità, e
   il gioco lo dice in chiaro accanto al codice di trasferimento. */
export async function chiSei(req) {
  const h = req.headers.authorization || '';
  const m = /^Calcetto\s+([^.\s]+)\.(\S+)$/.exec(h);
  if (!m) return null;
  const [, id, segreto] = m;
  if (!UUID.test(id)) return null;
  const righe = await db.leggi('allenatore', 'id=eq.' + id + '&select=id,segreto,bandito');
  const a = righe && righe[0];
  if (!a || !pari(a.segreto, digest(segreto))) return null;
  if (a.bandito) return { id: a.id, bandito: true };
  return { id: a.id, bandito: false };
}

/* --------------------------------------------------------------- freno */
/* Il tetto è per identità e per endpoint. Se il database non risponde al
   freno NON si blocca la richiesta: un freno rotto che chiude il gioco
   sarebbe peggio del traffico che doveva evitare. */
export async function frenato(chiave, tetto, secondi) {
  try {
    const ok = await db.chiama('frena', { k: chiave, tetto, secondi });
    return ok === false;
  } catch (e) {
    console.error('[calcetto] freno non disponibile:', e.message);
    return false;
  }
}

/* --------------------------------------------------------------- corpo */
export async function corpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let grezzo = '';
  for await (const p of req) grezzo += p;
  if (!grezzo) return {};
  try { return JSON.parse(grezzo); } catch { return {}; }
}

/* -------------------------------------------------------------- pulizia */
/* Tutto quel che arriva dal client passa di qui prima di toccare il
   database. Il gioco è un file dentro un APK: chiunque lo può modificare
   e mandare quello che vuole. La validazione non è una cortesia. */
/* Il ripiego vale per quel che NON è un numero (una parola, un oggetto,
   il nulla). Un numero fuori scala invece si TOSA, e vale anche per
   l'infinito: `1e9` che diventa 99 e `Infinity` che diventava 7 erano
   due risposte diverse alla stessa domanda — «questo è troppo grande» —
   e la differenza si sarebbe vista solo il giorno in cui qualcuno manda
   `1e999`, che in JSON si legge proprio come Infinity. */
export const intero = (v, min, max, d) => {
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return d;
  return Math.min(max, Math.max(min, n));
};

/* Un nome di squadra è testo scritto da uno sconosciuto che comparirà
   sullo schermo di un altro. Si tengono lettere (accenti compresi, che
   siamo in italiano), cifre, spazio e quattro segni. Il resto sparisce. */
export function nomePulito(s) {
  const t = String(s ?? '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N} '·.-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 18);
  return t.length >= 2 ? t : null;
}

export const coloreValido = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

export const paeseDi = req => {
  const p = req.headers['x-vercel-ip-country'];
  return typeof p === 'string' && /^[A-Z]{2}$/.test(p) ? p : null;
};
