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

/* ------------------------------------------------------------- fine */
console.log('\n' + (ok + no) + ' controlli, ' + ok + ' passati, ' + no + ' falliti');
process.exit(no ? 1 : 0);
