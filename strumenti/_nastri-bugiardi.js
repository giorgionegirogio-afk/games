/* =====================================================================
   _nastri-bugiardi.js — LA FAMIGLIA DEI NASTRI FALSI, IN COMUNE
   (voce #133). Non misura niente di suo: e' il bisturi che i banchi del
   giudice condividono.

   PERCHE' STA A PARTE. Il giudice ha cinque verdetti, e un banco che non
   li distingue fra loro attesta invece di misurare. Per distinguerli
   servono ingressi costruiti apposta, uno per verdetto — e devono
   nascere da un nastro VERO, registrato da una partita vera: un nastro
   scritto a mano proverebbe il banco, non il gioco.

   IL FORMATO, per chi legge (vedi Reg.serializza nel gioco):
     `1|<motoreV>|<tasti separati da virgola>|<pezzi separati da ;>`
   e ogni pezzo e' `dT,tipo,dMs[,argomenti]`. Tick e millisecondi sono
   DIFFERENZE dal pezzo precedente.

   DA QUI LA REGOLA DI QUESTO FILE: un pezzo non si TOGLIE mai, si
   TRASFORMA. Toglierlo sposterebbe il tick e il tempo di tutti i pezzi
   che seguono — e allora il nastro falso sarebbe falso per DUE ragioni,
   e il banco non saprebbe quale delle due ha morso. Si trasforma nel
   tipo 3 (Touch5.azzera) con lo stesso dT e lo stesso dMs: tre caratteri,
   la catena intatta, e in rilettura un azzeramento dei tocchi al posto
   di quel comando.

   IL NASTRO ARRIVA STRETTO dal server (deflate-raw + base64url: lo
   stringe chiudiSfida, e il server rifiuta per contratto qualunque cosa
   non sia base64url). Si allarga QUI, in Node, e non e' una
   scorciatoia: e' esattamente quello che fara' il verificatore differito
   quando vivra' sul server — pesca la riga, la allarga, e passa il testo
   crudo alla pagina. `deflate-raw` e' RFC 1951, non una regola del
   gioco: `zlib.inflateRawSync` e' `DecompressionStream('deflate-raw')`,
   non una seconda implementazione della stessa logica.
   ===================================================================== */
const zlib = require('zlib');

function allarga(stretto) {
  const t = String(stretto || '');
  if (!t) return '';
  if (t.indexOf('|') >= 0) return t;            /* gia' crudo */
  let s = t.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  try { return zlib.inflateRawSync(Buffer.from(s, 'base64')).toString('utf8'); }
  catch (e) { return ''; }
}

const spacca = n => { const p = String(n).split('|'); return { p, pezzi: (p[3] || '').split(';').filter(Boolean) }; };
const rifai = (p, pezzi) => p[0] + '|' + p[1] + '|' + p[2] + '|' + pezzi.join(';');

/* trasforma in tipo 3 ogni pezzo del tipo chiesto; torna null se non ce
   n'era nemmeno uno, cosi' chi chiama sa che la prova non si esercita */
function spegniTipo(nastro, tipo) {
  const { p, pezzi } = spacca(nastro);
  let n = 0;
  const fuori = pezzi.map(z => {
    const v = z.split(',');
    if (v[1] !== String(tipo)) return z;
    n++;
    return v[0] + ',3,' + v[2];
  });
  return n ? rifai(p, fuori) : null;
}

/* LO SCHERMO SCRITTO NEL NASTRO (riga di tipo 10, voce #133), o null se
   quel nastro e' di prima di quella cura. Si legge QUI, in Node, e non
   chiedendolo al gioco: un banco che chiede al gioco se il gioco ha
   fatto il suo lavoro non misura niente. */
function schermoDi(nastro) {
  for (const z of spacca(nastro).pezzi) {
    const v = z.split(',');
    if (v[1] === '10') return [+v[3], +v[4]];
  }
  return null;
}

/* TUTTE LE MISURE DISTINTE DEL NASTRO (voce #139), in ordine. Una sola se
   la finestra non si e' mossa, nessuna se quel nastro e' di prima del
   #133, due o piu' se si e' mossa. Si legge QUI, in Node, per la stessa
   ragione di schermoDi: un banco che chiede al gioco se il gioco ha fatto
   il suo lavoro non misura niente. */
function schermiDi(nastro) {
  const v = [];
  for (const z of spacca(nastro).pezzi) {
    const p = z.split(',');
    if (p[1] !== '10') continue;
    const w = +p[3], h = +p[4];
    if (!v.some(x => x[0] === w && x[1] === h)) v.push([w, h]);
  }
  return v;
}

/* LE RIGHE DI TIPO 10 CON IL LORO TICK (voce #139), che e' quel che dice
   se la misura e' stata scritta QUANDO la finestra si e' mossa o buttata
   in coda a fine partita. Il tick di un pezzo e' la somma dei dT fino a
   li'. */
function righeSchermoDi(nastro) {
  const v = [];
  let tick = 0;
  for (const z of spacca(nastro).pezzi) {
    const p = z.split(',');
    tick += +p[0] || 0;
    if (p[1] === '10') v.push({ tick, w: +p[3], h: +p[4] });
  }
  return v;
}

/* UNA SECONDA MISURA INFILATA A META' NASTRO (voce #139). Il pezzo nuovo
   porta dT = 0 e dMs = 0, quindi la catena dei tick e dei millisecondi
   resta intatta e il nastro falso e' falso per UNA ragione sola — la
   regola di questo file. `dove` e' la frazione di nastro a cui infilarlo.
   Serve a due prove opposte: una misura DIVERSA deve far astenere il
   giudice, una misura UGUALE non deve cambiare niente (si contano le
   misure distinte, non le righe). */
function infilaSchermo(nastro, misura, dove) {
  const { p, pezzi } = spacca(nastro);
  const i = Math.max(1, Math.min(pezzi.length, Math.round(pezzi.length * (dove === undefined ? 0.5 : dove))));
  const m = misura || schermoDi(nastro) || [0, 0];
  const fuori = pezzi.slice(0, i).concat(['0,10,0,' + (m[0] | 0) + ',' + (m[1] | 0)], pezzi.slice(i));
  return rifai(p, fuori);
}

/* L'IMPRONTA DEL MOTORE JAVASCRIPT SCRITTA NEL NASTRO (riga di tipo 11,
   voce #142), o null se quel nastro e' di prima di quella cura. Si legge
   QUI, in Node, per la stessa ragione di schermoDi: un banco che chiede
   al gioco se il gioco ha fatto il suo lavoro non misura niente. */
function improntaDi(nastro) {
  for (const z of spacca(nastro).pezzi) {
    const v = z.split(',');
    if (v[1] === '11') return (+v[3]) >>> 0;
  }
  return null;
}

/* =====================================================================
   IL MOTORE MASCHERATO (voce #142) — e non e' un falso qualunque, e' IL
   CONTROLLO DI ESERCIZIO del banco.

   Dopo la cura il giudice si astiene PRIMA di rigiocare, quindi non si
   sa piu' se quel nastro, su quel motore, sarebbe DAVVERO divergiuto: un
   banco che misurasse solo l'astensione attesterebbe la propria cura su
   nastri che magari non avevano niente da divergere (la lezione del
   #141: su 3 nastri con zero gol si stampava «SOGLIA TENUTA» misurando
   il nulla).

   Qui si riscrive la riga 11 con l'impronta DI CHI GIUDICA: il giudice
   crede che il motore coincida, procede, rigioca, e il verdetto che esce
   e' quello che sarebbe uscito senza la cura. Se non esce NON TORNA, non
   c'era niente da curare su quel nastro e la prova della condanna non
   sta misurando niente.

   SU UN NASTRO SENZA LA RIGA 11 LA INFILA, invece di lasciare il nastro
   com'era. Serve a due capi diversi e per la stessa ragione:
     · l'esercizio del banco, qui sopra;
     · le FIXTURE del repo. Il nastro congelato di
       `_nastro-duello-congelato.js` e' di prima di questa cura e non
       porta la riga 11: dal #142 il giudice si astiene su un nastro cosi'
       (`motore-js-ignoto`), quindi le prove che lo usano per misurare
       ALTRO — il duello dal dischetto in `_q-giudice.js`, i cinque
       verdetti in `_q-staffetta.js` — smetterebbero di misurare quel che
       dicono di misurare. Si completa a runtime con l'impronta di CHI
       GIUDICA, e non si rigenera la fixture con un numero fisso: quel
       numero cambia con la versione del browser, e una fixture che
       dipende dalla versione di Chromium installata e' una fixture che
       si spegne da sola su un'altra macchina.
   Che un nastro SENZA riga 11 faccia astenere il giudice e' misurato
   dove deve esserlo: prova E di `_q-motore-nastro.js`.
   Il pezzo nuovo porta dT = 0 e dMs = 0, come `infilaSchermo`, cosi' la
   catena dei tick e dei millisecondi resta intatta. */
function conMotore(nastro, impronta) {
  const { p, pezzi } = spacca(nastro);
  let n = 0;
  const fuori = pezzi.map(z => {
    const v = z.split(',');
    if (v[1] !== '11') return z;
    n++;
    return v[0] + ',11,' + v[2] + ',' + ((impronta | 0) >>> 0);
  });
  if (n) return rifai(p, fuori);
  return rifai(p, pezzi.concat(['0,11,0,' + ((impronta | 0) >>> 0)]));
}

/* =====================================================================
   LA FINESTRA MASCHERATA (voce #144) — il gemello esatto di conMotore
   qui sopra, e nasce dalla stessa lezione.

   Dopo il #133 e il #139 il giudice si ASTIENE prima di rigiocare quando
   lo schermo del nastro non e' il suo. Un banco che misurasse solo
   l'astensione non saprebbe piu' dire se quel nastro, su quello schermo,
   sarebbe DAVVERO divergiuto: attesterebbe la cura invece di misurarla
   (la lezione del #141, e quella del #142 che ha prodotto conMotore).

   Qui si riscrivono TUTTE le righe di tipo 10 con la misura di CHI
   GIUDICA: il giudice crede che lo schermo coincida, procede, rigioca, e
   il punteggio che ne esce e' quello che sarebbe uscito senza
   l'astensione. E' quel punteggio — non il verdetto — la misura vera del
   canale dei pixel.

   Riscrive invece di aggiungere apposta: aggiungere lascerebbe le misure
   vecchie e farebbe scattare schermo-cambiato, che e' un'altra
   astensione e rimetterebbe il banco dove era. Su un nastro senza
   nessuna riga 10 la infila, come conMotore, cosi' anche un nastro di
   prima del #133 si lascia rigiocare.
   Il pezzo nuovo porta dT = 0 e dMs = 0: la catena dei tick e dei
   millisecondi resta intatta. */
function conSchermo(nastro, misura) {
  const { p, pezzi } = spacca(nastro);
  const w = (misura && misura[0] | 0) || 0, h = (misura && misura[1] | 0) || 0;
  let n = 0;
  const fuori = pezzi.map(z => {
    const v = z.split(',');
    if (v[1] !== '10') return z;
    n++;
    return v[0] + ',10,' + v[2] + ',' + w + ',' + h;
  });
  if (n) return rifai(p, fuori);
  return rifai(p, pezzi.concat(['0,10,0,' + w + ',' + h]));
}

/* I TIPI DI RIGA DEL NASTRO, CONTATI QUI IN NODE (voce #144). Serve a
   dire se un nastro porta ancora un PIXEL (tipo 0 o tipo 1) o se e'
   fatto di soli ATTI (tipo 12 e 13). Si conta in Node e non chiedendolo
   al gioco, per la stessa ragione di schermoDi: un banco che chiede al
   gioco se il gioco ha fatto il suo lavoro non misura niente. */
function tipiDi(nastro) {
  const c = {};
  for (const z of spacca(nastro).pezzi) {
    const t = z.split(',')[1];
    c[t] = (c[t] || 0) + 1;
  }
  return c;
}

/* GLI ATTI DEL NASTRO (righe di tipo 12, voce #144), gia' spacchettati:
   {id, t, esito, slot, ux, uy}. Il banco li legge per verificare che la
   SQUADRA viaggi davvero nel comando invece di essere dedotta dalla x. */
/* QUESTO NASTRO PORTA ANCORA UN PIXEL? (voce #144). La gemella in Node
   di `nastroHaPixel()` dentro il gioco, e le due devono rispondere la
   stessa cosa: il giudice la usa per sapere se astenersi sullo schermo,
   la staffetta per sapere se quel nastro chiede una finestra sua. Un
   nastro di soli ATTI (tipi 12 e 13) non chiede niente e si giudica
   dove capita; uno con dentro anche un solo tipo 0 o tipo 1 porta il
   pixel di un altro telefono. */
/* =====================================================================
   UN PIXEL INERTE IN TESTA AL NASTRO (voce #144) — e senza di lui tre
   banchi smettono di misurare la guardia che dicono di misurare.

   Dal #144 il giudice si astiene sullo schermo SE E SOLO SE il nastro
   porta un pixel (una riga di tipo 0 o 1). I nastri nuovi sono fatti di
   atti e non si astengono piu': e' la cura. Ma le tre astensioni
   ESISTONO ANCORA, e servono ai nastri di prima — quelli che stanno sul
   server adesso — quindi vanno ancora misurate, e con un nastro che un
   pixel ce l'abbia.

   Rigenerare una fixture vecchia non basterebbe: sarebbe un nastro di
   una versione che non si puo' piu' produrre. Qui invece si prende un
   nastro VERO di oggi e gli si mette in testa **una riga di tipo 1
   inerte** — un movimento per un identificativo che non esiste, a
   (1,1), al tick 0. Touch5.move su un dito sconosciuto non trova ne'
   btnTouch, ne' pend, ne' una levetta con quell'id: non muove niente. Ma
   `nastroHaPixel()` risponde VERO, e la guardia dello schermo torna a
   parlare esattamente come parlava per i nastri di prima.

   AL TICK 0 APPOSTA: la sola strada per cui quel movimento potrebbe
   fare qualcosa e' la riadozione della levetta, che si arma solo DOPO un
   azzeramento che ha spento una levetta viva. Al primo passo non c'e'
   niente di armato.

   dT = 0 e dMs = 0, come infilaSchermo e conMotore: la catena dei tick e
   dei millisecondi resta intatta. */
function conPixel(nastro) {
  const { p, pezzi } = spacca(nastro);
  return rifai(p, ['0,1,0,9999,1,1'].concat(pezzi));
}

function haPixel(nastro) {
  const c = tipiDi(nastro);
  return !!((c['0'] | 0) + (c['1'] | 0));
}

function attiDi(nastro) {
  const v = [];
  for (const z of spacca(nastro).pezzi) {
    const p = z.split(',');
    if (p[1] !== '12') continue;
    v.push({ id: +p[3], t: +p[4], esito: +p[5], slot: +p[6], ux: +p[7], uy: +p[8] });
  }
  return v;
}

module.exports = {
  allarga,
  spacca, rifai, schermoDi, schermiDi, righeSchermoDi, infilaSchermo,
  improntaDi, conMotore,
  conSchermo, tipiDi, attiDi, haPixel, conPixel,

  /* L'IMPRONTA DEL MOTORE VIA (tipo 11, voce #142). Simula un nastro di
     prima di quella cura: improntaDi() e improntaDelNastro() (lato
     gioco) tornano null. -> INCOMPLETO/motore-js-ignoto */
  senzaMotore: n => spegniTipo(n, 11),

  /* LE DUE ROSE VIA (tipo 7). Il giudice deve rifiutare: senza le rose
     dovrebbe ripiegare sul profilo vivo, cioe' giudicare un'altra
     partita. -> INCOMPLETO/rose-assenti */
  senzaRose: n => spegniTipo(n, 7),

  /* I COMANDI DEL DUELLO VIA (tipo 6, voce #131). La rigiocata arriva a
     un calcio piazzato di cui il nastro non ha piu' i comandi.
     -> INCOMPLETO/duello-senza-righe. Torna null se quella partita non
     e' passata da nessun duello: allora la prova non si esercita. */
  senzaDuelli: n => spegniTipo(n, 6),

  /* LA RIGA DELLO SCHERMO VIA (tipo 10, voce #133, correzione di
     revisione IMPORTANTE-1). Simula un nastro di prima di quella cura:
     schermoDi() e schermoDelNastro() (lato gioco) tornano null.
     -> INCOMPLETO/schermo-ignoto */
  senzaSchermo: n => spegniTipo(n, 10),

  /* IL NASTRO TAGLIATO A META' E MARCHIATO (tipo 9, voce #132).
     -> INCOMPLETO/nastro-troncato */
  mozzato(n) {
    const { p, pezzi } = spacca(n);
    const meta = Math.max(1, Math.floor(pezzi.length / 2));
    return rifai(p, pezzi.slice(0, meta).concat(['0,9,0']));
  },

  /* IL MARCHIO DEL DUELLO SENZA COMANDI (tipo 5): e' il segno dei nastri
     scritti PRIMA della voce #131, quelli che il duello non ce l'hanno
     davvero. -> INCOMPLETO/duello-marchiato */
  marchiato(n) {
    const { p, pezzi } = spacca(n);
    return rifai(p, pezzi.concat(['0,5,0']));
  },

  /* UN ALTRO MOTORE in testa. -> ALTRO MOTORE */
  altroMotore(n, v) { const { p, pezzi } = spacca(n); p[1] = String(v === undefined ? 99 : v); return rifai(p, pezzi); },

  /* IL NASTRO VUOTO: forma perfetta, zero comandi, cinque caratteri.
     -> INCOMPLETO/nastro-vuoto */
  vuoto(n) { const { p } = spacca(n); return '1|' + p[1] + '||'; },

  /* IL NASTRO ILLEGGIBILE: il marcatore di formato non e' 1.
     -> INCOMPLETO/nastro-illeggibile */
  illeggibile(n) { const { p, pezzi } = spacca(n); p[0] = '7'; return rifai(p, pezzi); },
};
