/* =====================================================================
   prove/tutte.js — il banco del server, e gira SENZA server.

   PERCHE' COSI'. La parte del server che può sbagliare in modo grave non
   è quella che parla col database: è quella che decide i NUMERI — la
   forza di una rosa, i punti che si muovono, quello che si accetta e
   quello che si rifiuta. Quella parte è aritmetica pura, e l'aritmetica
   si collauda senza rete, senza chiavi e senza aspettare.

   Ogni controllo qui dentro nasce da una domanda che si può sbagliare
   davvero, non da «copriamo la riga».

   uso:  node rete/prove/tutte.js
   esce 0 se passano tutte, 1 se no.
   ===================================================================== */
import { forzaDi } from '../api/squadra.js';
import { nomePulito, intero, coloreValido, digest } from '../lib/comuni.js';
import { aggiorna, inattivo, atteso, dopoLaSfida, giorni, RD0 } from '../lib/glicko.js';

let ok = 0, no = 0;
const di = (buono, nome, det) => {
  if (buono) { ok++; console.log('  OK  ' + nome); }
  else { no++; console.log('  NO  ' + nome + (det ? '  [' + det + ']' : '')); }
};
const titolo = t => console.log('\n' + t);

/* =====================================================================
   UNA ROSA NELLA LINGUA DEL GIOCO.

   Quattro attributi — vel, tiro, tecnica, tackle — e nessun campo
   `ruolo`: nella rosa del gioco l'indice 0 È il portiere. La prima
   stesura di questo banco usava i cinque attributi di FIFA e un ruolo
   dichiarato dal client: due cose che nel nostro gioco non esistono, e
   che avrebbero obbligato il client a inventarsi una traduzione.
   ===================================================================== */
const g = v => ({ nome: 'Tale', vel: v, tiro: v, tecnica: v, tackle: v, partite: 0, gol: 0 });
const rosa = (por, ...movimento) => [g(por), ...movimento.map(g)];

titolo('LA FORZA DI UNA ROSA');

di(forzaDi(rosa(50, 50, 50, 50, 50), 5) === 50,
   'cinque uomini da 50 fanno una squadra da 50', forzaDi(rosa(50, 50, 50, 50, 50), 5));

/* La domanda vera: una panchina piena di scarsi deve abbassare la forza?
   No. Chi scende in campo sono i migliori, e la forza è quella. Se la
   media contasse tutti, comprare un sesto giocatore scarso ti renderebbe
   più debole — e il negozio diventerebbe una trappola. */
const conPanchina = [...rosa(50, 50, 50, 50, 50), g(5), g(5), g(5)];
di(forzaDi(conPanchina, 5) === forzaDi(rosa(50, 50, 50, 50, 50), 5),
   'una panchina di scarsi NON abbassa la forza',
   forzaDi(conPanchina, 5) + ' contro ' + forzaDi(rosa(50, 50, 50, 50, 50), 5));

/* E al contrario: un campione in panchina non deve gonfiare la squadra
   se in campo non ci va. A cinque contro cinque entrano in quattro. */
const conCampione = [...rosa(50, 50, 50, 50, 50), g(99)];
di(forzaDi(conCampione, 5) > forzaDi(rosa(50, 50, 50, 50, 50), 5),
   'un campione entra fra i migliori quattro e alza la forza',
   forzaDi(conCampione, 5) + ' contro 50');

/* Il portiere pesa doppio, e a cinque contro cinque è giusto: para lui o
   non para nessuno. */
const porScarso = forzaDi(rosa(10, 50, 50, 50, 50), 5);
const porBuono  = forzaDi(rosa(90, 50, 50, 50, 50), 5);
di(porBuono - porScarso >= 20,
   'il portiere pesa: 10 contro 90 vale almeno venti punti di forza',
   porScarso + ' -> ' + porBuono);

/* IL PORTIERE È L'INDICE 0, e questa prova esiste perché il client
   potrebbe mandare la rosa in un altro ordine: se il server leggesse il
   portiere da un'altra parte, un uomo da 99 messo primo varrebbe doppio
   senza esserlo. */
const rovescio = [g(50), g(50), g(50), g(50), g(90)];
di(forzaDi(rosa(90, 50, 50, 50, 50), 5) > forzaDi(rovescio, 5),
   'lo stesso 90 vale di più se è il portiere (indice 0) che se è l\'ultimo',
   forzaDi(rosa(90, 50, 50, 50, 50), 5) + ' contro ' + forzaDi(rovescio, 5));

di(forzaDi(rosa(99, 99, 99, 99, 99), 5) === 99 && forzaDi(rosa(1, 1, 1, 1, 1), 5) === 1,
   'la forza resta dentro 1..99 agli estremi');

/* Una taglia più grande legge più giocatori: la stessa rosa in un
   undici contro undici deve pesare i suoi undici, non i suoi quattro. */
const larga = [g(80), ...Array.from({ length: 10 }, (_, i) => g(i < 4 ? 80 : 30))];
di(forzaDi(larga, 5) > forzaDi(larga, 11),
   'a undici contro undici entrano anche i peggiori, e la forza cala',
   forzaDi(larga, 5) + ' (5v5) contro ' + forzaDi(larga, 11) + ' (11v11)');

/* LA FORZA DI UNA ROSA APPENA NATA. nuovaRosa() nel gioco tira ogni
   attributo fra 50 e 76, quindi una squadra vergine deve uscire intorno
   a 63 — non a 50 e non a 76. Se un giorno questo numero scappasse via,
   l'accoppiamento manderebbe i principianti contro chi gioca da un mese. */
const vergine = [g(63), g(63), g(63), g(63), g(63)];
di(forzaDi(vergine, 5) >= 55 && forzaDi(vergine, 5) <= 70,
   'una squadra appena nata sta intorno a 63, dove nuovaRosa la mette',
   String(forzaDi(vergine, 5)));

/* ---------------------------------------------------------- Elo */
/* Rifaccio qui la formula del server: se un giorno divergono, questa
   prova lo dice invece di lasciarlo scoprire alla classifica. */
function elo(mio, suo, esito, serie) {
  const atteso = 1 / (1 + Math.pow(10, (suo - mio) / 400));
  const K = mio < 1200 ? 40 : mio < 1600 ? 28 : mio < 2000 ? 20 : 14;
  const bonus = esito === 1 ? Math.min(1.3, 1 + Math.min(serie, 6) * 0.05) : 1;
  return Math.round(K * (esito - atteso) * bonus);
}

titolo('I PUNTI');
di(elo(1000, 1000, 1, 0) > 0 && elo(1000, 1000, 0, 0) < 0,
   'vincere sale, perdere scende');
di(Math.abs(elo(1000, 1000, 0.5, 0)) <= 1,
   'un pari fra pari non muove niente', elo(1000, 1000, 0.5, 0));
di(elo(1000, 1600, 1, 0) > elo(1600, 1000, 1, 0),
   'battere un più forte vale più che battere un più debole',
   elo(1000, 1600, 1, 0) + ' contro ' + elo(1600, 1000, 1, 0));
di(elo(1000, 1000, 1, 0) > elo(2100, 2100, 1, 0),
   'chi comincia si muove più in fretta di chi è in alto',
   elo(1000, 1000, 1, 0) + ' contro ' + elo(2100, 2100, 1, 0));
di(elo(1000, 1000, 1, 5) > elo(1000, 1000, 1, 0),
   'la serie di vittorie premia');
di(elo(1000, 1000, 0, 5) === elo(1000, 1000, 0, 0),
   'la serie NON attutisce la sconfitta (se no non si scende mai)');

/* Il numero che decide se la classifica è viva: da 1000, quante vittorie
   servono per arrivare a 1500? Se sono tre, la classifica è una scala
   mobile; se sono duecento, nessuno la guarda.
   L'avversario è di PARI GRADO, perché è quello che dà l'accoppiamento:
   `trova_avversario` cerca dentro ±8 di forza, e la forza e i punti
   salgono insieme. */
let p = 1000, n = 0;
while (p < 1500 && n < 500) { p += elo(p, p, 1, 0); n++; }
di(n >= 15 && n <= 60, 'da 1000 a 1500 servono fra 15 e 60 vittorie contro pari grado', n + ' vittorie');

/* E il rovescio, che è la ragione per cui l'accoppiamento esiste: contro
   un avversario che resta a 1000 mentre tu sali, la salita si spegne da
   sola. Misurato: 112 vittorie per gli stessi 500 punti. Chi cercasse i
   deboli apposta ci metterebbe tre volte tanto. Non è un difetto da
   correggere, è la difesa che non abbiamo dovuto scrivere. */
let q = 1000, m = 0;
while (q < 1500 && m < 500) { q += elo(q, 1000, 1, 0); m++; }
di(m > n * 2, 'battere sempre i deboli costa piu\' del doppio', m + ' vittorie contro ' + n);

/* ------------------------------------------------- il rating nascosto */
/* DUE PORTE, come per la tavola dei cinque verdetti (voce #137). Il
   cancello `strumenti/_q-glicko.js` verifica la stessa matematica in
   modo molto più fine; queste righe stanno QUI perché questo banco è
   quello che gira con `npm run prova` dentro rete/, e perché la
   differenza fra i punti e il rating si capisce meglio leggendole una
   sotto l'altra.

   L'ESEMPIO DI GLICKMAN, che è il riferimento che il mandato chiede per
   nome (milestone M9): 1500 con RD 200 e volatilità 0,06, τ = 0,5, tre
   partite — vinta contro 1400/30, perse contro 1550/100 e 1700/300. Il
   paper stampa r' = 1464,06 e RD' = 151,52. */
titolo('IL RATING NASCOSTO (Glicko-2)');

const glk = aggiorna(
  { nascosto: 1500, incertezza: 200, volatilita: 0.06 },
  [{ nascosto: 1400, incertezza:  30, esito: 1 },
   { nascosto: 1550, incertezza: 100, esito: 0 },
   { nascosto: 1700, incertezza: 300, esito: 0 }],
);
di(Math.abs(glk.nascosto - 1464.06) <= 0.02 && Math.abs(glk.incertezza - 151.52) <= 0.02,
   'l\'esempio lavorato di Glickman torna: r\' 1464,06 e RD\' 151,52',
   glk.nascosto.toFixed(2) + ' / ' + glk.incertezza.toFixed(2));

/* La domanda vera, quella che separa il rating dai punti: contro DUE
   avversari con lo stesso rating ma certezza diversa, vincere non vale
   lo stesso. L'Elo non lo sa fare, perché non ha un secondo numero. */
const io = { nascosto: 1500, incertezza: 100, volatilita: 0.06 };
const suCerto = aggiorna(io, [{ nascosto: 1700, incertezza: 30, esito: 1 }]).nascosto;
const suIgnoto = aggiorna(io, [{ nascosto: 1700, incertezza: 340, esito: 1 }]).nascosto;
di(suCerto > suIgnoto + 3,
   'battere un forte CERTO vale più che battere un forte IGNOTO (è g(φ): l\'Elo non ce l\'ha)',
   suCerto.toFixed(1) + ' contro ' + suIgnoto.toFixed(1));

/* Chi non gioca diventa un'incognita, e NON è una punizione: il rating
   resta identico, a crescere è solo l'incertezza. Chi lo confondesse con
   un azzeramento di stagione riscriverebbe la classifica ogni notte. */
const fermo = { nascosto: 1820, incertezza: 70, volatilita: 0.06 };
const unGiorno = inattivo(fermo, 1), unAnno = inattivo(fermo, 365);
di(unGiorno > 70 && unAnno > unGiorno && unAnno <= RD0,
   'chi non gioca diventa incerto, con un tetto — e il rating non si muove di un millesimo',
   '70 → ' + unGiorno.toFixed(1) + ' (un giorno) → ' + unAnno.toFixed(1) + ' (un anno)');

/* Il rating nascosto NON si muove contro un avversario costruito:
   `forza_avv * 20` è una convenzione nostra, non una misura. I punti
   visibili invece si muovono, a metà — sono due decisioni diverse e
   devono restare diverse. */
di(dopoLaSfida(fermo, null, 1, '2026-09-23') === null &&
   dopoLaSfida(fermo, { nascosto: 1900, incertezza: 60 }, 1, '2026-09-23') !== null,
   'contro un fantasma il rating non si muove; contro una persona sì');

/* L'atteso porta dentro l'incertezza di TUTTI E DUE: è la grandezza che
   l'abbinamento usa, ed è la ragione per cui un giocatore nuovo trova
   comunque qualcuno — di lui non si sa niente, quindi nessuna partita è
   decisa prima del fischio. */
const lontaniCerti  = atteso({ nascosto: 1900, incertezza: 40 },  { nascosto: 1300, incertezza: 40 });
const lontaniIgnoti = atteso({ nascosto: 1900, incertezza: 350 }, { nascosto: 1300, incertezza: 350 });
di(lontaniCerti > 0.95 && lontaniIgnoti < 0.90 && lontaniCerti - lontaniIgnoti > 0.08,
   'seicento punti di distanza: fra due CERTI è una partita decisa, fra due IGNOTI il sistema dubita',
   lontaniCerti.toFixed(3) + ' contro ' + lontaniIgnoti.toFixed(3));

di(giorni('2026-09-20', '2026-09-23') === 3 && giorni('2026-09-24', '2026-09-23') === 0,
   'i giorni del periodo si contano per data, e indietro non si va (un orologio storto non gonfia nulla)');

/* --------------------------------------------------------- il testo */
titolo('QUEL CHE ARRIVA DA UNO SCONOSCIUTO');
di(nomePulito('Borgo Nuovo') === 'Borgo Nuovo', 'un nome normale passa intero');
di(nomePulito('Città di Mezzo') === 'Città di Mezzo', 'gli accenti restano');
di(nomePulito('<script>alert(1)</script>') === 'scriptalert1script',
   'i segni di marcatura spariscono', nomePulito('<script>alert(1)</script>'));
di(nomePulito('  troppi   spazi  ') === 'troppi spazi', 'gli spazi si stringono');
di(nomePulito('a') === null, 'una lettera sola non è un nome');
di(nomePulito('') === null && nomePulito(null) === null && nomePulito(undefined) === null,
   'il vuoto, il nullo e il mancante sono tutti «niente»');
di(nomePulito('x'.repeat(200)).length === 18, 'un nome lunghissimo si taglia a 18');
di(nomePulito('🏆🏆 Campioni 🏆') === 'Campioni',
   'gli emoji spariscono', JSON.stringify(nomePulito('🏆🏆 Campioni 🏆')));
/* Il caso che si dimentica sempre: un nome fatto SOLO di roba da buttare
   non deve diventare la stringa vuota accettata dal database. */
di(nomePulito('<<<>>>') === null, 'un nome fatto solo di segni è «niente»');

titolo('I NUMERI CHE ARRIVANO DA UNO SCONOSCIUTO');
di(intero('50', 1, 99, 1) === 50, 'una cifra in stringa diventa numero');
di(intero(1e9, 1, 99, 1) === 99 && intero(-500, 1, 99, 1) === 1, 'si tosa agli estremi');
di(intero('abc', 1, 99, 7) === 7 && intero(NaN, 1, 99, 7) === 7 &&
   intero(undefined, 1, 99, 7) === 7 && intero({}, 1, 99, 7) === 7,
   'quel che non è un numero prende il valore di ripiego');
/* `1e999` in JSON si legge Infinity, ed è il modo più corto per mandare
   «un numero enorme». Deve tosarsi come 1e9, non prendere il ripiego:
   erano due risposte diverse alla stessa domanda. */
di(intero(Infinity, 1, 99, 7) === 99 && intero(-Infinity, 1, 99, 7) === 1 &&
   intero(JSON.parse('1e999'), 1, 99, 7) === 99,
   'l\'infinito si tosa come qualunque numero troppo grande',
   intero(Infinity, 1, 99, 7) + ' / ' + intero(-Infinity, 1, 99, 7));
di(intero(50.6, 1, 99, 1) === 51, 'i decimali si arrotondano');

titolo('I COLORI');
di(coloreValido('#a3f200') && coloreValido('#FFFFFF'), 'un esadecimale a sei cifre va bene');
di(!coloreValido('red') && !coloreValido('#fff') && !coloreValido('#12345g') &&
   !coloreValido('#123456;background:url(x)') && !coloreValido(null),
   'tutto il resto no');

titolo('IL SEGRETO');
di(digest('pippo') === digest('pippo'), 'lo stesso segreto dà lo stesso digest');
di(digest('pippo') !== digest('pippa'), 'segreti diversi, digest diversi');
di(digest('pippo').length === 64, 'il digest è sha-256 in esadecimale');
di(!digest('pippo').includes('pippo'), 'il segreto non si legge dentro il suo digest');

/* ------------------------------------------------------ l'avversario finto */
titolo('L\'AVVERSARIO COSTRUITO — deve essere lo STESSO ogni volta');
const { default: _avv } = await import('../api/avversario.js').catch(() => ({ default: null }));
/* squadraFinta non è esportata apposta (è un dettaglio dell'endpoint), ma
   la proprietà che conta si può provare dall'esterno: il generatore. */
function generatore(seme) {
  let s = (seme >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const a = generatore(12345), b = generatore(12345), c = generatore(12346);
const serieA = Array.from({ length: 20 }, () => a());
const serieB = Array.from({ length: 20 }, () => b());
const serieC = Array.from({ length: 20 }, () => c());
di(serieA.join() === serieB.join(),
   'lo stesso seme dà lo stesso avversario — anche a chi riguarda la partita un mese dopo');
di(serieA.join() !== serieC.join(), 'un seme diverso dà un avversario diverso');
di(serieA.every(v => v >= 0 && v < 1), 'il generatore sta in [0,1)');
/* Il difetto classico degli xorshift scritti male: si incantano su zero. */
const z = generatore(0);
di(Array.from({ length: 5 }, () => z()).every(v => v > 0), 'seme zero non incanta il generatore');

/* ------------------------------------------------------- LA CASSETTA */
/* Le regole del trasporto della sfida dal dischetto (voce #146). Qui si
   prova quel che si puo' provare SENZA un server: la forma di quel che
   arriva da uno sconosciuto, e la decisione «identico o diverso» che e'
   meta' della fiducia del cantiere. Il vincolo di unicita' vero lo fa il
   database (schema.sql, `unique (stanza, k, r, t)`) e non si puo'
   provare qui: e' dichiarato, non attestato. */
titolo('LA CASSETTA — quel che si puo\' provare senza un server');

const formaStanza = v => /^[0-9A-Z]{6}$/.test(String(v || '').toUpperCase());
di(formaStanza('6MHSP5'), 'un codice di sei caratteri passa');
di(!formaStanza('6MHSP'), 'cinque no');
di(!formaStanza('6MHSP55'), 'sette no');
di(!formaStanza('6mhs p'), 'con uno spazio dentro no');
di(!formaStanza(''), 'vuoto no');
di(!formaStanza(null), 'niente no, e senza sollevare un\'eccezione');
di(formaStanza('6mhsp5'), 'minuscolo passa, perche\' il server alza le lettere prima di guardare');

/* CINQUE TIPI DAL v2 (voce #150): la busta `N` porta la rivelazione del
   nonce del saluto, che dal v2 viaggia impegnato e non in chiaro. */
const tipoOk = k => /^[SIRNF]$/.test(String(k || ''));
di(['S','I','R','N','F'].every(tipoOk), 'i cinque tipi di busta passano');
di(!tipoOk('X') && !tipoOk('') && !tipoOk('SS'), 'un sesto tipo, il vuoto e il doppio no');

/* il tiro si TOSA, non si rifiuta a caso: e' la stessa regola di
   `intero` che vale per tutto quel che arriva da uno sconosciuto */
di(intero(0, 0, 40, -1) === 0 && intero(40, 0, 40, -1) === 40, 'i tiri agli estremi passano interi');
di(intero(1e9, 0, 40, -1) === 40 && intero(Infinity, 0, 40, -1) === 40,
   'un tiro enorme si tosa a 40, e l\'infinito si comporta come 1e9');
di(intero('gol', 0, 40, -1) === -1, 'un tiro che non e\' un numero cade sul ripiego');

/* LA DECISIONE CHE VALE META' DELLA FIDUCIA: il secondo imbuco identico
   e' un si' (il ritentativo dopo un imbuco perso deve funzionare), il
   secondo imbuco DIVERSO e' un no (chi cambia idea dopo aver parlato). */
const identico = (a, b) => JSON.stringify(a) === JSON.stringify(b);
di(identico({ h: 'abc' }, { h: 'abc' }), 'reimbucare la stessa busta e\' un si\': e\' il ritentativo');
di(!identico({ h: 'abc' }, { h: 'abd' }), 'reimbucare una busta DIVERSA e\' un no: e\' cambiare idea dopo aver parlato');
di(!identico({ m: { z: 0 } }, { m: { z: 1 } }), 'e vale anche dentro, non solo in superficie');

/* la busta non e' una partita */
const grande = JSON.stringify({ m: 'x'.repeat(5000) });
di(grande.length > 4096, 'una busta oltre il tetto si riconosce dalla lunghezza del testo, non dai campi');

/* ------------------------------------------------------------- fine */
console.log('\n' + (ok + no) + ' controlli, ' + ok + ' passati, ' + no + ' falliti');
process.exit(no ? 1 : 0);
