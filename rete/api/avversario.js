/* =====================================================================
   GET /api/avversario — dammi una squadra da attaccare.

   Restituisce il profilo pubblico di qualcun altro E IL SEME della
   partita. Il seme lo dà il SERVER, e questo è il cardine di tutto:

     · se lo scegliesse il client, uno potrebbe provare mille semi in
       locale, tenere quello in cui vince 7-0 e mandare solo quello;
     · siccome lo dà il server e lo registra, la partita che l'attaccante
       giocherà è UNA, decisa prima che lui la veda.

   Il seme è anche ciò che rende il replay verificabile: il server sa già
   con quale numero è cominciata quella partita.

   IL FALLBACK, che non è un dettaglio. Se non c'è nessun avversario
   adatto — e all'inizio non ci sarà, perché la base di giocatori è di
   dodici persone — NON si restituisce un errore. Si restituisce una
   squadra costruita dal server con lo stesso formato: stessa strada di
   codice nel gioco, e la modalità funziona dal primo giorno. Il campo
   `vero: false` dice al gioco di non chiamarla «sfida» ma «allenamento»,
   perché un giocatore che scopre di aver battuto un fantasma smette di
   fidarsi della classifica.
   ===================================================================== */
import { db, rispondi, preflight, guaio, chiSei, frenato, configurato } from '../lib/comuni.js';
import { SCALA, SOSPETTO_SEPARA, bandaSql, minimoSql, equilibrioSql, ammissibile } from '../lib/abbinamento.js';

/* -------------------------------------------------- l'avversario finto */
/* Nomi e cognomi comuni, e nessuno di essi è di una persona reale né di
   un calciatore sotto licenza: sono i cento cognomi più diffusi in
   Italia, che non sono di nessuno. Il generatore è seminato dal seme
   della partita, quindi la stessa sfida mostra sempre lo stesso
   avversario — anche a chi la riguarda un mese dopo. */
const COGNOMI = ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco',
  'Bruno','Gallo','Conti','De Luca','Mancini','Costa','Giordano','Rizzo','Lombardi','Moretti',
  'Barbieri','Fontana','Santoro','Mariani','Rinaldi','Caruso','Ferrara','Galli','Martini','Leone',
  'Longo','Gentile','Martinelli','Vitale','Lombardo','Serra','Coppola','De Santis','D’Angelo','Marchetti',
  'Parisi','Villa','Conte','Ferretti','Bianco','Marini','Grasso','Valentini','Messina','Sala'];
const LUOGHI = ['Borgo','Villa','Ponte','Colle','Riva','Porto','Rocca','Valle','Prato','Fonte',
  'Torre','Campo','Cava','Selva','Molino','Isola','Piano','Serra','Costa','Fossa'];
const CODE = ['Nuovo','Alto','Vecchio','Marina','Sotto','Grande','Piccolo','Antico','Basso','Chiaro'];

function generatore(seme) {
  let s = (seme >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function squadraFinta(seme, forza) {
  const r = generatore(seme);
  const scegli = a => a[Math.floor(r() * a.length) % a.length];
  const nome = scegli(LUOGHI) + ' ' + scegli(CODE);
  const tinta = () => {
    const h = Math.floor(r() * 360), s = 55 + Math.floor(r() * 35), l = 34 + Math.floor(r() * 26);
    /* HSL → esadecimale, perché il gioco vuole #rrggbb e perché sorteggiare
       tre canali indipendenti dà fanghiglia una volta su tre */
    const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100), x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l / 100 - c / 2;
    const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
                    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    const b = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return '#' + b(R) + b(G) + b(B);
  };
  const maglia = tinta();
  /* La rosa ha la forma di quella del gioco: quattro attributi (vel,
     tiro, tecnica, tackle) e il ruolo dato dalla POSIZIONE — l'indice 0
     è il portiere. Se qui si inventasse un'altra forma, il client
     dovrebbe tradurre, e una squadra costruita dal server si
     comporterebbe diversamente da una vera: chi ci gioca contro se ne
     accorgerebbe alla terza partita. */
  const rosa = [];
  for (let i = 0; i < 11; i++) {
    const portiere = i === 0, attacco = i >= 1 && i <= 3, difesa = i >= 4 && i <= 7;
    const base = forza + Math.round((r() - 0.5) * 14);
    const v = k => Math.min(99, Math.max(1, base + Math.round((r() - 0.5) * 16) + k));
    rosa.push({
      nome: scegli(COGNOMI),
      vel:     v(attacco ? 5 : portiere ? -10 : 0),
      tiro:    v(attacco ? 7 : difesa ? -8 : 0),
      tecnica: v(portiere ? 6 : 0),
      tackle:  v(difesa ? 8 : attacco ? -8 : 0),
      partite: 0, gol: 0,
    });
  }
  return {
    allenatore: null, nome, forza,
    colori: { maglia, calzoncini: tinta(), riga: maglia, portiere: '#2b2b2b' },
    rosa, modulo: '4-4-2',
    indole: { pressing: 40 + Math.floor(r() * 30), linea: 35 + Math.floor(r() * 35),
              larghezza: 40 + Math.floor(r() * 30), ritmo: 40 + Math.floor(r() * 30),
              rischio: 35 + Math.floor(r() * 35), durezza: 30 + Math.floor(r() * 40) },
    punti: 900 + Math.floor(r() * 300),
  };
}

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  if (req.method !== 'GET') return rispondi(res, 405, { ok: false, errore: 'metodo' });
  if (!configurato()) return rispondi(res, 503, { ok: false, errore: 'spento' });

  try {
    const io = await chiSei(req);
    if (!io) return rispondi(res, 401, { ok: false, errore: 'ignoto' });
    if (io.bandito) return rispondi(res, 403, { ok: false, errore: 'bandito' });

    /* Sessanta al minuto: uno può rifiutare l'avversario proposto e
       chiederne un altro, ed è giusto che possa — ma non mille volte,
       perché rigirare finché non esce quello debole è imbrogliare. */
    if (await frenato('avv:' + io.id, 60, 60))
      return rispondi(res, 429, { ok: false, errore: 'troppe' });

    /* IL SEME LO DA' IL SERVER. 48 bit: abbastanza perché due partite non
       si incontrino mai, e piccolo abbastanza da stare in un numero
       intero di JavaScript senza perdere cifre. */
    const seme = Math.floor(Math.random() * 281474976710655) + 1;
    const taglia = [5, 7, 11].includes(+req.query?.taglia) ? +req.query.taglia : 5;

    /* I MIEI DUE NUMERI, PRIMA DELLA RICERCA (voce #137). La forza si
       leggeva già, ma dopo il ciclo e solo per costruire l'avversario
       finto; adesso serve prima, perché il candidato che torna dal
       database si RICONTROLLA qui. I punti sono la lettura nuova: uno
       `select` in più per ricerca, contro un freno da 60 al minuto e un
       uso vero di UNA ricerca per pressione del dito. */
    const mia = await db.leggi('squadra', 'allenatore=eq.' + io.id + '&select=forza');
    const miaForza = (mia && mia[0] && mia[0].forza) || 50;
    /* E I MIEI DUE NUMERI NASCOSTI NON SI LEGGONO QUI (voce #140), ed e'
       una decisione, non una dimenticanza: `trova_avversario` se li
       prende da se' nella CTE `mia`, dove il dato gia' sta. Tirarli
       fuori per rimandarli dentro vorrebbe dire farli viaggiare due
       volte in piu' per niente — e un numero che non esce mai da una
       macchina e' l'unico che non puo' finire sul telefono di
       qualcun altro. Quindi questa `select` resta com'era. */
    const mieiP = await db.leggi('punti', 'allenatore=eq.' + io.id + '&select=punti');
    const mieiPunti = (mieiP && mieiP[0] && mieiP[0].punti) || 1000;
    const me = { id: io.id, forza: miaForza, punti: mieiPunti };

    /* =====================================================================
       LA FINESTRA CHE SI ALLARGA — ADESSO A DUE COORDINATE (voce #137).

       La finestra c'era: `for (const banda of [8, 20, 99])`, dal primo
       giorno. Quel che cambia è che il gradino non è più un numero, è una
       coppia — vicino di forza E vicino di punti — e che i gradini
       stanno in un posto solo, `rete/lib/abbinamento.js`, invece che in
       una riga di questo file.

       PERCHÉ ANCHE I PUNTI: la forza dice quanto hai giocato, i punti
       dicono quanto vinci, e dentro una stessa fascia di forza ci stanno
       tutti e due gli estremi (misurato: 203 allenatori su 400 dentro
       `forza 75 ±8`, con punti da 402 a 1486). Misurato l'effetto: scarto
       mediano di punti fra gli abbinati da 188 a 60, abbinamenti «entro
       150 punti» dal 41% al 100%.

       E NESSUNA SFIDA SI PERDE, per costruzione: l'ULTIMO gradino della
       scala è l'ultimo gradino di prima — forza ±99 e punti senza limite
       — quindi chi oggi trova un avversario domani lo trova ancora, al
       massimo un gradino più in là.

       IL RICONTROLLO (`ammissibile`) non è diffidenza verso il database:
       è che il predicato vive in due lingue, in due file, su due
       macchine. Se un giorno divergessero — uno schema vecchio rimasto
       in giro, una riga cambiata da una parte sola — il candidato fuori
       finestra si scarta e si passa al gradino dopo. Non può affamare
       nessuno: sull'ultimo gradino `ammissibile` è sempre vero.

       Quel che il ricontrollo NON può guardare sono due cose, e sono
       due cose che stanno dove sta il dato:
         · il SOSPETTO — la ragione è scritta accanto a `ammissibile`: la
           tupla che torna di qui finisce dritta nel corpo della
           risposta, quindi il sospetto nella tupla non ci entra;
         · il PAVIMENTO DEL MAZZO (`minimo`) — non è una proprietà del
           candidato, è una proprietà di quanti ce n'erano, e chi conta
           è il database.

       SEGUITO A EDIZIONI (23 settembre 2026, voce #140). Le cose che il
       ricontrollo non può guardare adesso sono TRE: si aggiunge
       l'EQUILIBRIO, la terza coordinata del gradino, per la stessa
       ragione del sospetto — il rating nascosto non esce dal database, e
       un rating che viaggia non è nascosto. Il prezzo è detto: se un
       giorno il predicato divergesse fra `equilibrato` e
       `atteso_glicko`, di qui non si vedrebbe. Il cambio è buono, perché
       l'alternativa è mandare il rating di un'altra persona sul telefono
       di chi la sfida.

       E il ciclo non è cambiato di una riga: un argomento in più alla
       stessa chiamata. Misurato (5000 ricerche, tre popolazioni): scarto
       di abilità VERA fra i due abbinati da 136 a 67 su quattrocento,
       abbinamenti equilibrati dal 39% al 67%, e ZERO ricerche in più
       senza avversario. */
    let avv = null;
    for (const gradino of SCALA) {
      const r = await db.chiama('trova_avversario', {
        io: io.id,
        banda: gradino.forza,
        banda_punti: bandaSql(gradino),
        separa: SOSPETTO_SEPARA,
        minimo: minimoSql(gradino),
        equilibrio: equilibrioSql(gradino),
      });
      const c = r && r[0];
      if (!c) continue;
      if (!ammissibile(me, c, gradino)) continue;
      avv = c;
      break;
    }

    const finta = avv ? null
      : squadraFinta(seme, Math.min(95, Math.max(20, miaForza + Math.round((Math.random() - 0.4) * 10))));

    /* L'IMPEGNO — «adesso giochi QUESTA partita».
       Si posa PRIMA di rispondere, e sovrascrive quello di prima (la
       chiave primaria è l'attaccante). Da qui in poi esiste un solo seme
       vivo per questo giocatore: può rifiutare l'avversario e chiederne
       un altro — è giusto che possa — ma non può accumulare dieci semi,
       provarli tutti in locale e spedire solo quello in cui ha vinto
       7-0. È il buco più grosso della sfida asincrona, e si chiude qui
       con una riga di database invece che con un controllo nel codice
       che qualcuno un giorno dimenticherà di fare. */
    await db.posa('impegno', {
      attaccante: io.id, seme, taglia,
      difensore: avv ? avv.allenatore : null,
      forza_avv: avv ? avv.forza : finta.forza,
      creato: new Date().toISOString(),
    }, 'attaccante');

    if (!avv) return rispondi(res, 200, { ok: true, vero: false, seme, taglia, avversario: finta });
    return rispondi(res, 200, { ok: true, vero: true, seme, taglia, avversario: avv });
  } catch (e) { return guaio(res, e); }
}
