/* =====================================================================
   PUT /api/squadra — pubblica il profilo della tua squadra.
   GET /api/squadra  — rileggi il tuo (serve al gioco dopo un ripristino).

   È il pezzo che rende possibile la sfida asincrona: quello che si
   pubblica qui è tutto ciò che serve a un altro telefono per giocarti
   contro mentre tu dormi — nome, colori, undici, modulo, e l'INDOLE.

   L'INDOLE È LA COSA CHE CONTA. Senza, la sfida sarebbe «la CPU con il
   tuo nome sopra»: e uno lo sente subito, e smette di giocarci. Con
   l'indole la squadra difende alta o bassa, cerca il filtrante o la
   ripartenza, entra duro o aspetta — cioè si comporta come si comporta
   il proprietario quando gioca lui. La ricaviamo dalle sue partite, non
   da un menu: nessuno sa dire di sé stesso «pressing 61».

   La rosa NON è la fonte della forza. La forza la ricalcola il server
   dalla rosa, perché altrimenti basterebbe mandare `forza: 1` per
   pescare sempre avversari deboli e vincere sempre.
   ===================================================================== */
import { db, rispondi, preflight, guaio, chiSei, frenato, corpo,
         intero, nomePulito, coloreValido, configurato } from '../lib/comuni.js';

const MODULI = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3', '2-1-2', '3-2-1', '2-2', '3-1'];

/* =====================================================================
   LA ROSA PARLA LA LINGUA DEL GIOCO, e la prima stesura no.

   Avevo scritto cinque attributi — vel, tir, pas, dif, fis — che sono
   quelli di FIFA e che nel nostro gioco NON ESISTONO. I nostri sono
   quattro, dichiarati in una tabella sola (ATTRIBUTI, riga 7251 del
   gioco), e sono gli unici che la simulazione legge:

     vel      VELOCITÀ    quanto corre
     tiro     TIRO        quanta potenza mette
     tecnica  TECNICA     quanto è larga la sua finestra di tiro
     tackle   CONTRASTO   quanto pulisce le scivolate

   Sono anche gli unici quattro che crescono giocando (faiCrescereRosa),
   quindi sono gli unici su cui una classifica possa essere onesta. Un
   server che ne chiedesse altri obbligherebbe il client a inventarsi una
   traduzione, e una traduzione inventata è un posto dove il vantaggio
   comprato si nasconde bene.

   E IL RUOLO NON SI DICHIARA: è la POSIZIONE. Nella rosa del gioco
   l'indice 0 è il portiere e gli altri sono di movimento (nuovaRosa fa
   cinque uomini in quest'ordine). Chiedere un campo `ruolo` avrebbe
   voluto dire fidarsi di un dato che il client può scrivere a piacere
   per farsi dare un portiere da 99 come attaccante.
   ===================================================================== */
function rosaPulita(v) {
  if (!Array.isArray(v) || v.length < 4 || v.length > 24) return null;
  const out = [];
  for (const g of v) {
    if (!g || typeof g !== 'object') return null;
    const nome = nomePulito(g.nome);
    if (!nome) return null;
    out.push({
      nome,
      vel:     intero(g.vel,     1, 99, 50),
      tiro:    intero(g.tiro,    1, 99, 50),
      tecnica: intero(g.tecnica, 1, 99, 50),
      tackle:  intero(g.tackle,  1, 99, 50),
      /* partite e gol non entrano nella forza: sono la storia di un
         uomo, e servono alla scheda che l'avversario può guardare */
      partite: intero(g.partite, 0, 99999, 0),
      gol:     intero(g.gol,     0, 99999, 0),
    });
  }
  return out;
}

/* LA FORZA, e il perché di questa formula e non della media.
   La media di tutta la rosa premia la panchina: una squadra con dodici
   giocatori da 60 avrebbe la stessa forza di una con undici da 60 e uno
   da 99, e non è vero — in campo ci vanno i migliori. Si prendono i
   MIGLIORI per la taglia e si media quelli, con peso doppio al portiere,
   che in un cinque contro cinque decide più di chiunque altro. */
export function forzaDi(rosa, taglia = 5) {
  const voto = g => (g.vel + g.tiro + g.tecnica + g.tackle) / 4;
  const por = rosa[0];
  const movimento = rosa.slice(1).map(voto).sort((a, b) => b - a);
  const scelti = movimento.slice(0, Math.max(1, taglia - 1));
  const somma = scelti.reduce((s, v) => s + v, 0) + (por ? voto(por) * 2 : 40);
  return Math.min(99, Math.max(1, Math.round(somma / (scelti.length + 2))));
}

/* -------------------------------------------------------------- l'indole */
/* Sei numeri da 0 a 100, e sono i sei che il motore sa già leggere: se
   ne aggiungessimo un settimo che nessuno usa, il profilo mentirebbe. */
const VOCI = ['pressing', 'linea', 'larghezza', 'ritmo', 'rischio', 'durezza'];
function indolePulita(v) {
  const o = {};
  for (const k of VOCI) o[k] = intero(v && v[k], 0, 100, 50);
  return o;
}

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  if (!configurato()) return rispondi(res, 503, { ok: false, errore: 'spento' });

  try {
    const io = await chiSei(req);
    if (!io) return rispondi(res, 401, { ok: false, errore: 'ignoto' });
    if (io.bandito) return rispondi(res, 403, { ok: false, errore: 'bandito' });

    if (req.method === 'GET') {
      const r = await db.leggi('squadra', 'allenatore=eq.' + io.id + '&select=*');
      return rispondi(res, 200, { ok: true, squadra: (r && r[0]) || null });
    }
    if (req.method !== 'PUT' && req.method !== 'POST')
      return rispondi(res, 405, { ok: false, errore: 'metodo' });

    /* Pubblicare è un'operazione che il gioco fa quando la rosa cambia,
       cioè poche volte al giorno. Trenta al minuto è larghissimo e
       ferma comunque un ciclo. */
    if (await frenato('squadra:' + io.id, 30, 60))
      return rispondi(res, 429, { ok: false, errore: 'troppe' });

    const c = await corpo(req);
    const nome = nomePulito(c.nome);
    if (!nome) return rispondi(res, 400, { ok: false, errore: 'nome' });

    const rosa = rosaPulita(c.rosa);
    if (!rosa) return rispondi(res, 400, { ok: false, errore: 'rosa' });

    const cc = c.colori || {};
    if (!coloreValido(cc.maglia) || !coloreValido(cc.calzoncini))
      return rispondi(res, 400, { ok: false, errore: 'colori' });
    const colori = {
      maglia: cc.maglia, calzoncini: cc.calzoncini,
      riga: coloreValido(cc.riga) ? cc.riga : cc.maglia,
      portiere: coloreValido(cc.portiere) ? cc.portiere : '#2b2b2b',
    };

    const modulo = MODULI.includes(c.modulo) ? c.modulo : '4-4-2';
    const taglia = [5, 7, 11].includes(+c.taglia) ? +c.taglia : 5;

    /* LA FORZA LA DECIDE IL SERVER. Se la decidesse il client, il modo
       più veloce per salire in classifica sarebbe dichiararsi debole. */
    const forza = forzaDi(rosa, taglia);

    const r = await db.posa('squadra', {
      allenatore: io.id, nome, colori, rosa, modulo,
      indole: indolePulita(c.indole),
      forza, aggiornata: new Date().toISOString(),
    }, 'allenatore');

    return rispondi(res, 200, { ok: true, squadra: r[0], forza });
  } catch (e) { return guaio(res, e); }
}
