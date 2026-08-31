/* =====================================================================
   prove/economia.js — il banco dell'economia, e gira senza rete,
   senza telefono, senza account Google e senza dipendenze.

   PERCHE' ESISTE. L'economia è la parte del gioco in cui un errore non
   fa uno schermo nero: fa un addebito. Le cose che possono andare
   storte non sono di grafica né di rete, sono ARITMETICHE — una
   probabilità dichiarata che non somma a uno, una garanzia che scatta un
   giro dopo quello scritto sullo schermo, un tetto che si può scavalcare
   comprando in ordine diverso, un acquisto pagato e mai consegnato. Sono
   tutte cose che si verificano su un computer, in un secondo, per
   sempre.

   Ogni controllo qui dentro nasce da una domanda che si può sbagliare
   davvero. Dove la risposta era controintuitiva l'ho scritta accanto,
   perché fra sei mesi la prova senza il perché è solo una riga verde.

   uso:  node rete/prove/economia.js
   esce 0 se passano tutte, 1 se no.
   ===================================================================== */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const P = require('../../android/pagamenti/ponte.js');

const {
  LISTINO, CAMPI, BUSTINA, BUSTINA_PEZZI, TETTO_VITA_CENT, CAMBIO_TETTO,
  MONETE_ORA, vocePer, ore, probabilitaVere, apriBustina, rimastiPieni,
  prezzoBacheca, residuo, vendibile, Coda, DepositoInMemoria, motoreFinto,
} = P;

let ok = 0, no = 0;
const di = (buono, nome, det) => {
  if (buono) { ok++; console.log('  OK  ' + nome); }
  else { no++; console.log('  NO  ' + nome + (det !== undefined ? '  [' + det + ']' : '')); }
};
const titolo = t => console.log('\n' + t);
const q = n => Math.round(n * 1000) / 1000;

/* Generatore riproducibile: la stessa sequenza a ogni corsa, oggi e fra
   un anno. Un banco di probabilità che non si può rigiocare non è un
   banco, è un sondaggio. */
function generatore(seme) {
  let s = (seme >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

/* =====================================================================
   IL LISTINO
   ===================================================================== */
titolo('IL LISTINO — sette voci, e nessuna sorpresa');

di(LISTINO.length >= 5 && LISTINO.length <= 7,
   'il listino sta fra cinque e sette voci', LISTINO.length);

di(new Set(LISTINO.map(v => v.sku)).size === LISTINO.length,
   'nessun codice prodotto ripetuto');

di(LISTINO.every(v => Number.isInteger(v.cent) && v.cent > 0),
   'ogni prezzo è un numero intero di centesimi');

/* La promessa scritta nel gioco («ogni cosa si sblocca anche giocando»)
   si verifica qui: se un giorno una voce arrivasse senza prezzo in
   monete, sarebbe la prima cosa comprabile solo con denaro, e la riga
   sul cartellone del negozio diventerebbe falsa. */
di(LISTINO.every(v => v.monete > 0),
   'nessuna voce è comprabile SOLO in euro: tutte hanno un prezzo in monete');

/* Quello che si vende, per famiglia. Se un giorno comparisse una terza
   famiglia il banco lo dice, perché la terza famiglia è quella che
   vende forza. */
di(LISTINO.every(v => v.tipo === 'diritto' || v.tipo === 'consumabile'),
   'esistono due sole famiglie: diritti (aspetto) e consumabili (tempo)');

const COSMETICI = new Set(['campi', 'divise', 'curva', 'sponsor']);
di(LISTINO.filter(v => v.da).every(v => v.da.every(x => COSMETICI.has(x))),
   'ogni diritto concede solo cose cosmetiche, contro una lista bianca');

di(!LISTINO.some(v => 'forza' in v || 'attributo' in v || 'bonus' in v),
   'nessuna voce del listino porta un campo che somigli a un attributo');

/* =====================================================================
   IL CAMBIO
   ===================================================================== */
titolo('IL CAMBIO — comprare monete non deve MAI convenire più che comprare la cosa');

/* La domanda che si può sbagliare: se un taglio di monete desse più di
   666,7 monete per euro, comprare monete e poi il PACCHETTO CAMPI
   costerebbe meno di comprare il PACCHETTO CAMPI. Il prezzo scritto sul
   cartellino diventerebbe una trappola per chi lo legge e si fida. */
const consumabili = LISTINO.filter(v => v.tipo === 'consumabile');
for (const v of consumabili) {
  const tasso = v.monete / (v.cent / 100);
  di(tasso <= CAMBIO_TETTO,
     v.nome + ': ' + q(tasso) + ' monete per euro, sotto il tetto di ' + q(CAMBIO_TETTO));
}

/* Il tetto non è un numero scelto a mano: è il cambio dell'articolo più
   caro in monete del catalogo. Se domani qualcuno cambia un prezzo del
   negozio, il tetto si sposta da solo e questa riga lo verifica. */
const cambiMinimi = LISTINO.filter(v => v.tipo === 'diritto').map(v => v.monete / (v.cent / 100));
di(Math.abs(Math.min(...cambiMinimi) - CAMBIO_TETTO) < 0.01,
   'il tetto del cambio È il cambio peggiore del catalogo, non un numero inventato',
   q(Math.min(...cambiMinimi)) + ' contro ' + q(CAMBIO_TETTO));

/* Lo sconto di volume deve esistere (se no il taglio grande è inutile) e
   deve essere piccolo (se no il taglio piccolo è una punizione). */
const tassi = consumabili.map(v => v.monete / (v.cent / 100)).sort((a, b) => a - b);
di(tassi[tassi.length - 1] > tassi[0],
   'il taglio grande rende più del piccolo: lo sconto di volume esiste');
di(tassi[tassi.length - 1] / tassi[0] < 1.30,
   'lo sconto di volume sta sotto il 30%: il taglio piccolo non è una punizione',
   q(tassi[tassi.length - 1] / tassi[0]));

/* =====================================================================
   IL TEMPO, CHE E' LA COSA CHE SI VENDE
   ===================================================================== */
titolo('LE ORE — quanto costa un\'ora di partite, e a chi costa di più');

const euroOra = v => (v.cent / 100) / ore(v.monete);
const diritti = LISTINO.filter(v => v.tipo === 'diritto');
const peggioreDiritto = Math.max(...diritti.map(euroOra));
const miglioreConsumabile = Math.min(...consumabili.map(euroOra));

di(miglioreConsumabile > peggioreDiritto,
   'le monete comprano un\'ora più cara di qualunque diritto: chi sa cosa vuole compra quella cosa',
   q(miglioreConsumabile) + ' €/ora contro ' + q(peggioreDiritto));

/* I cinque diritti stanno tutti sullo stesso prezzo orario perché
   condividono lo stesso cambio: se uno se ne staccasse, sarebbe un
   prezzo sbagliato e non una scelta. */
di(Math.max(...diritti.map(euroOra)) - Math.min(...diritti.map(euroOra)) < 0.02,
   'i cinque diritti costano tutti lo stesso all\'ora, entro due centesimi',
   q(Math.min(...diritti.map(euroOra))) + '..' + q(Math.max(...diritti.map(euroOra))));

/* Il cartellino che il gioco mostra («ti risparmia circa N ore») deve
   uscire dagli stessi numeri del listino. Se qualcuno cambia un prezzo e
   non il cartellino, questa riga lo trova. */
const finta = motoreFinto({});
di(finta.elenco().every(r => Math.abs(r.ore - vocePer(r.sku).monete / MONETE_ORA) < 0.01),
   'le ore scritte sul cartellino escono dal prezzo, non da una tabella a parte');

/* =====================================================================
   LA SCALA DEI CAMPI
   ===================================================================== */
titolo('I CAMPI — la scala e il suo pacchetto');

const prezziCampi = CAMPI.map(c => c.monete).filter(m => m > 0);
di(prezziCampi.every((m, i) => i === 0 || m > prezziCampi[i - 1]),
   'la scala dei campi sale sempre', prezziCampi.join('+'));
di(CAMPI[0].monete === 0, 'il primo campo è gratis e resta gratis');

const sommaCampi = prezziCampi.reduce((a, b) => a + b, 0);
const pacco = vocePer('pacchetto_campi').monete;
const rapporto = pacco / sommaCampi;

/* LA DOMANDA VERA. Oggi il gioco chiede 15.350 monete per i sette campi
   presi uno per uno e 1.330 per il pacchetto che li dà tutti: il
   pacchetto costa l'8,7% della somma dei pezzi, cioè undici volte e
   mezza meno. Chi si guadagna i campi giocando viene punito rispetto a
   chi compra la scorciatoia, ed è già registrato come difetto NOSTRO in
   _analisi/DIFFERENZE-FC-MOBILE.md. Qui il rapporto è quello corretto. */
di(rapporto >= 0.25 && rapporto <= 0.60,
   'il pacchetto campi sconta fra il 25% e il 60% della somma dei pezzi',
   q(rapporto * 100) + '% (' + pacco + ' su ' + sommaCampi + ')');

/* E LA PROVA CHE IL CONTROLLO SA FALLIRE: sulla scala di oggi il gate
   qui sopra dev'essere rosso. Un cancello che passa su qualunque numero
   non è un cancello. */
const vecchiaScala = [150, 400, 800, 1500, 2500, 4000, 6000];
const vecchioRapporto = 1330 / vecchiaScala.reduce((a, b) => a + b, 0);
di(vecchioRapporto < 0.25,
   'il controllo sa fallire: sulla scala di oggi (15.350) il rapporto è fuori',
   q(vecchioRapporto * 100) + '%');

/* Le due valute devono raccontare la stessa storia. Se il pacchetto
   scontasse il 39% in monete e il 5% in euro, una delle due schermate
   starebbe mentendo. */
const migliorTasso = Math.max(...consumabili.map(v => v.monete / (v.cent / 100)));
const rapportoEuro = (vocePer('pacchetto_campi').cent / 100) / (sommaCampi / migliorTasso);
di(Math.abs(rapporto - rapportoEuro) < 0.05,
   'lo sconto del pacchetto è lo stesso in monete e in euro, entro cinque punti',
   q(rapporto * 100) + '% contro ' + q(rapportoEuro * 100) + '%');

/* =====================================================================
   LA BUSTINA — le probabilità dichiarate
   ===================================================================== */
titolo('LA BUSTINA — le probabilità, e sommano a uno DAVVERO');

/* Il motivo per cui le probabilità stanno in decimillesimi interi e non
   in virgola mobile. Avevo scritto che 0,74+0,21+0,05 non fa 1: è FALSO,
   quella terna in virgola mobile fa esattamente 1, e il banco me l'ha
   detto. Il punto però resta, e anzi peggiora: la terna ACCANTO —
   0,70+0,20+0,10, che è la prima che chiunque proverebbe — fa
   0.9999999999999999. Cioè la correttezza di «somma === 1» dipende da
   quali tre numeri hai scelto, e non da nessuna proprietà che tu
   controlli. In decimillesimi interi la somma è 10000 e non c'è niente
   da sperare. */
di(0.7 + 0.2 + 0.1 !== 1,
   'in virgola mobile 0,70+0,20+0,10 non fa 1: la somma delle probabilità non si verifica così',
   (0.7 + 0.2 + 0.1).toString());
di(0.74 + 0.21 + 0.05 === 1,
   'e la nostra terna invece ci arriva per fortuna, non per progetto: motivo in più per gli interi');

di(BUSTINA.livelli.reduce((s, l) => s + l.dm, 0) === 10000,
   'le probabilità nominali sommano a 10.000 decimillesimi esatti');
di(BUSTINA.livelli.every(l => Number.isInteger(l.dm) && l.dm > 0 && l.dm < 10000),
   'ogni probabilità è un intero fra 1 e 9.999: nessuna è zero, nessuna è certa');
di(BUSTINA.livelli.reduce((s, l) => s + l.pezzi, 0) === BUSTINA_PEZZI && BUSTINA_PEZZI === 24,
   'l\'insieme è chiuso e conta ventiquattro pezzi', BUSTINA_PEZZI);

/* LA BUGIA CHE SI SPEDISCE PER DISTRAZIONE. Man mano che un livello si
   svuota, si pesca dai livelli rimasti con probabilità RINORMALIZZATE.
   Mostrare il 5,00% nominale mentre si pesca al 19,2% è falso, e non per
   malizia: è quello che succede se la schermata legge BUSTINA.livelli
   invece di probabilitaVere(). Qui si verifica che la rinormalizzazione
   esista, sommi a 10.000 in ogni combinazione di scorte, e che sia
   diversa dalla nominale — se fosse uguale, non starebbe rinormalizzando
   niente. */
let tutteSommano = true, tutteIntere = true;
for (let m = 1; m < 8; m++) {                       // le sette combinazioni di scorte non vuote
  const r = {};
  BUSTINA.livelli.forEach((l, i) => { r[l.id] = (m >> i) & 1 ? l.pezzi : 0; });
  const t = probabilitaVere(r);
  if (t.reduce((s, x) => s + x.dm, 0) !== 10000) tutteSommano = false;
  if (!t.every(x => Number.isInteger(x.dm) && x.dm > 0)) tutteIntere = false;
}
di(tutteSommano, 'in tutte e sette le combinazioni di scorte le probabilità vere sommano a 10.000');
di(tutteIntere, 'nessuna probabilità rinormalizzata è zero o frazionaria');

const senzaComuni = probabilitaVere({ comune: 0, raro: 8, prezioso: 4 });
const preziosoVero = senzaComuni.find(x => x.id === 'prezioso').dm;
di(preziosoVero > 500,
   'finiti i comuni il prezioso sale dal 5,00% al ' + q(preziosoVero / 100) + '%: la schermata deve mostrare QUESTO',
   preziosoVero);

/* Le scorte vuote non devono comparire in tabella con lo 0%: una riga
   allo 0% in una schermata di probabilità è rumore che nasconde le
   altre. */
di(senzaComuni.length === 2 && !senzaComuni.some(x => x.id === 'comune'),
   'un livello esaurito sparisce dalla tabella invece di restare a zero');

/* =====================================================================
   LA BUSTINA — la garanzia
   ===================================================================== */
titolo('LA GARANZIA — al più otto aperture, e sono OTTO');

/* Il caso più sfavorevole possibile: un sorteggio che non regala MAI un
   prezioso. Se la garanzia dipendesse dalla fortuna, qui non scatterebbe
   mai. */
const sfortuna = () => 0;                            // pesca sempre il livello più probabile

{
  const st = { rimasti: rimastiPieni(), senzaPrezioso: 0 };
  const usciti = [];
  for (let i = 0; i < 24; i++) { const x = apriBustina(st, sfortuna); if (!x) break; usciti.push(x); }
  let corsa = 0, peggiore = 0;
  for (const u of usciti) { if (u === 'prezioso') corsa = 0; else { corsa++; if (corsa > peggiore) peggiore = corsa; } }
  di(peggiore <= BUSTINA.garanzia,
     'col sorteggio più sfavorevole possibile non si passano mai ' + BUSTINA.garanzia + ' aperture senza prezioso',
     'corsa peggiore ' + peggiore);
  di(usciti[7] !== 'prezioso' && usciti[8] === 'prezioso',
     'la garanzia scatta alla NONA apertura, non all\'ottava: il numero sullo schermo è quello vero',
     usciti.slice(0, 9).join(' '));
}

/* Il contatore che si mostra. Deve stare fra zero e la garanzia, sempre:
   un contatore che va sotto zero o oltre il dichiarato è un numero che
   la gente legge e su cui decide di spendere. */
{
  const st = { rimasti: rimastiPieni(), senzaPrezioso: 0 };
  const c = generatore(20260827);
  let fuori = false;
  for (let i = 0; i < 24; i++) {
    if (!apriBustina(st, c)) break;
    const mostrato = BUSTINA.garanzia - st.senzaPrezioso;
    if (mostrato < 0 || mostrato > BUSTINA.garanzia) fuori = true;
  }
  di(!fuori, 'il contatore mostrato resta fra 0 e ' + BUSTINA.garanzia + ' per tutta la collezione');
}

/* MAI UN DOPPIONE, ed è la differenza fra una spesa che finisce e una
   che non finisce mai. Su mille collezioni con semi diversi: esattamente
   ventiquattro aperture, e le scorte finite a zero — non ventitré,
   non venticinque. */
{
  let sempre24 = true, sempreVuoto = true, sempreConti = true;
  for (let s = 1; s <= 1000; s++) {
    const st = { rimasti: rimastiPieni(), senzaPrezioso: 0 };
    const c = generatore(s);
    const conta = { comune: 0, raro: 0, prezioso: 0 };
    let n = 0;
    while (n < 100) { const x = apriBustina(st, c); if (!x) break; conta[x]++; n++; }
    if (n !== 24) sempre24 = false;
    if (!BUSTINA.livelli.every(l => st.rimasti[l.id] === 0)) sempreVuoto = false;
    if (!BUSTINA.livelli.every(l => conta[l.id] === l.pezzi)) sempreConti = false;
    if (apriBustina(st, c) !== null) sempreVuoto = false;   // la venticinquesima non esiste
  }
  di(sempre24, 'su mille collezioni servono sempre esattamente 24 aperture');
  di(sempreVuoto, 'l\'insieme finisce vuoto e la venticinquesima bustina non si vende');
  di(sempreConti, 'ogni livello esce esattamente il numero di volte dei suoi pezzi');
}

/* QUANTO VALE LA GARANZIA, misurato. Senza garanzia il primo prezioso
   costerebbe 1/0,05 = 20 aperture in media. Con la garanzia il conto
   cambia, e cambia parecchio: il numero qui sotto è quello che va
   scritto sul cartellino, non il ventesimo. */
{
  let somma = 0;
  const giri = 20000;
  for (let s = 1; s <= giri; s++) {
    const st = { rimasti: rimastiPieni(), senzaPrezioso: 0 };
    const c = generatore(s * 7919);
    let n = 0;
    while (n < 30) { n++; if (apriBustina(st, c) === 'prezioso') break; }
    somma += n;
  }
  const media = somma / giri;
  di(media < 20 / 2,
     'la garanzia più che dimezza l\'attesa del primo prezioso: ' + q(media) + ' aperture contro 20 senza',
     q(media));
  di(media > 6.5 && media < 8.5,
     'l\'attesa misurata sta dove la forma chiusa la mette (≈7,4 = somma di 0,95^k per k=0..8)',
     q(media));
  /* E il costo in monete e in ore, che è la cosa che chi paga vuole
     sapere e che nessuno scrive. */
  const costo = media * BUSTINA.costo;
  di(costo > 0 && ore(costo) > 0,
     'il primo prezioso costa in media ' + Math.round(costo) + ' monete, cioè ' + q(ore(costo)) + ' ore di partite');
}

/* =====================================================================
   IL RIPIEGO PER BELGIO E PAESI BASSI
   ===================================================================== */
titolo('LA BACHECA — il ripiego dove le bustine non si possono vendere');

di(prezzoBacheca() === BUSTINA.costo,
   'un pezzo scelto costa quanto una bustina: nessuna tassa sul domicilio', prezzoBacheca());

di(BUSTINA_PEZZI * prezzoBacheca() === BUSTINA_PEZZI * BUSTINA.costo,
   'chi vuole TUTTO paga lo stesso da tutte e due le parti: ' + BUSTINA_PEZZI * BUSTINA.costo + ' monete');

/* La conclusione che il banco costringe a guardare in faccia, e che
   ECONOMIA.md non evita: per chi vuole UN pezzo preciso la bacheca costa
   300 monete e la bustina ne costa in media più di duemila. La versione
   deterministica non è un ripiego: è la versione migliore. */
di(7.4 * BUSTINA.costo > prezzoBacheca() * 5,
   'per chi vuole UN pezzo preciso la bacheca costa almeno cinque volte meno della bustina',
   Math.round(7.4 * BUSTINA.costo) + ' monete contro ' + prezzoBacheca());

/* =====================================================================
   IL TETTO DI MAGAZZINO
   ===================================================================== */
titolo('IL TETTO DI MAGAZZINO — non si vendono monete senza un pozzo');

const nulla = { diritti: [], campi: [], bustineAperte: 0 };
const tutto = { diritti: ['campi', 'divise', 'curva', 'sponsor'], campi: CAMPI.map(c => c.id), bustineAperte: BUSTINA_PEZZI };

di(residuo(nulla) === 2660 + BUSTINA_PEZZI * BUSTINA.costo,
   'chi non ha niente ha davanti ' + residuo(nulla) + ' monete di catalogo', residuo(nulla));
di(residuo(tutto) === 0,
   'chi ha tutto ha davanti zero: il listino delle monete sparisce', residuo(tutto));

/* LA STRADA PIU' ECONOMICA, e qui c'è la trappola. Il residuo deve
   contare quanto costa arrivare in fondo AL MEGLIO, non la somma dei
   pezzi: se contasse 5.320 invece dei 2.660 del completo, venderemmo il
   doppio delle monete necessarie. */
di(residuo(nulla) - BUSTINA_PEZZI * BUSTINA.costo === 2660,
   'i quattro pezzi contano 2.660 (il completo) e non 5.320 (la somma)',
   residuo(nulla) - BUSTINA_PEZZI * BUSTINA.costo);

/* Il caso controintuitivo, e non è un difetto: possedere UN pezzo non
   abbassa il residuo, perché la strada più economica per gli altri tre è
   ancora il completo, che costa 2.660 comunque. Da DUE pezzi in poi la
   somma dei rimanenti scende sotto il completo e il residuo cala. */
di(residuo({ diritti: ['sponsor'], campi: [], bustineAperte: 0 }) === residuo(nulla),
   'possedere UN pezzo non cambia il residuo: il completo costa uguale');
di(residuo({ diritti: ['sponsor', 'campi'], campi: [], bustineAperte: 0 }) < residuo(nulla),
   'possederne DUE sì: la somma dei rimanenti scende sotto il completo',
   residuo({ diritti: ['sponsor', 'campi'], campi: [], bustineAperte: 0 }));

/* Il pacchetto campi sblocca tutti e sette i campi: contarli ANCORA
   dopo averlo comprato venderebbe 3.450 monete per una cosa che non
   esiste più. */
di(residuo({ diritti: ['campi', 'divise', 'curva', 'sponsor'], campi: [], bustineAperte: 0 })
   === BUSTINA_PEZZI * BUSTINA.costo,
   'comprato il pacchetto campi, i sette campi non contano più nel residuo');

/* E i campi singoli non contano MAI, nemmeno prima. Non perché siano
   stati dimenticati: perché la strada più economica per averli tutti è
   sempre il pacchetto (1.330 contro 3.450), e il pacchetto è già dentro
   il conto. Dimensionare il magazzino sulla strada più cara vorrebbe
   dire vendere monete per una cosa che si può avere con meno. Questa
   riga pinza il ragionamento: se un giorno qualcuno rimette i prezzi dei
   campi nel residuo, il banco lo dice. */
di(residuo({ diritti: [], campi: ['parrocchia', 'cortile'], bustineAperte: 0 }) === residuo(nulla),
   'possedere qualche campo singolo non cambia il residuo: il pacchetto costa uguale',
   residuo({ diritti: [], campi: ['parrocchia', 'cortile'], bustineAperte: 0 }));

di(!vendibile('monete_sacchetto', 99999, nulla),
   'con più monete del residuo il taglio NON si vende');
di(vendibile('monete_sacchetto', 0, nulla),
   'con zero monete e il catalogo davanti il taglio si vende');
di(!vendibile('monete_cassetta', 0, tutto),
   'a catalogo esaurito nessun taglio si vende, nemmeno con zero monete');
di(vendibile('campetto_completo', 99999, nulla),
   'i diritti non passano dal tetto di magazzino: si comprano una volta e basta');

/* LA FESSURA CHE IL BANCO HA TROVATO, e che la prima stesura lasciava
   aperta. Con 9.700 monete in mano e 9.860 di residuo, «hai meno monete
   del residuo» da solo lascia passare una cassetta da 3.200 e lascia
   3.040 monete morte. Su quella fessura la ricerca della spesa massima
   qui sotto trovava una strada da 25,90 €, cioè sopra il tetto. Lo
   scarto ammesso è UN taglio minimo e non uno qualunque. */
di(!vendibile('monete_cassetta', 9700, nulla),
   'con 9.700 monete e 9.860 di residuo la CASSETTA non si vende: lascerebbe 3.040 monete morte');
di(vendibile('monete_sacchetto', 9700, nulla),
   'ma il SACCHETTO sì: ne lascia 940, meno di un taglio minimo');

/* =====================================================================
   IL TETTO IN DENARO
   ===================================================================== */
titolo('IL TETTO IN DENARO — la cintura di sicurezza, e non deve mordere');

/* LA SPESA MASSIMA POSSIBILE, cercata e non stimata. Si percorrono tutte
   le strade: ogni sottoinsieme di diritti comprabile in euro, e poi ogni
   sequenza di tagli di monete che il tetto di magazzino lascia passare.
   Si tiene la più cara. Il tetto in denaro deve stare sopra questo
   numero con margine, se no punisce un giocatore onesto — che è
   esattamente il contrario di quello per cui esiste. */
function spesaMassima() {
  const pezzi = ['campi', 'divise', 'curva', 'sponsor'];
  const skuDi = { campi: 'pacchetto_campi', divise: 'pacchetto_divise', curva: 'la_curva', sponsor: 'lo_sponsor' };
  let massimo = 0, comeMassimo = null;

  const strade = [];
  for (let m = 0; m < 16; m++) strade.push(pezzi.filter((_, i) => (m >> i) & 1));
  strade.push('completo');

  for (const s of strade) {
    let centDiritti = 0, posseduti = [];
    if (s === 'completo') { centDiritti = vocePer('campetto_completo').cent; posseduti = pezzi.slice(); }
    else { for (const p of s) { centDiritti += vocePer(skuDi[p]).cent; posseduti.push(p); } }
    const avere = { diritti: posseduti, campi: [], bustineAperte: 0 };

    /* da qui in poi solo tagli di monete, finché il tetto di magazzino
       li lascia passare — la regola VERA, quella di vendibile(), non una
       sua parafrasi: se il banco misurasse una regola diversa da quella
       che gira nel gioco, misurerebbe se stesso. Ricerca in profondità
       con memoria sullo stato «quante monete ho in mano»: le monete
       crescono sempre a ogni passo, quindi finisce. */
    const memo = new Map();
    const cerca = mon => {
      if (memo.has(mon)) return memo.get(mon);
      let m = 0;
      for (const v of consumabili) {
        if (!vendibile(v.sku, mon, avere)) continue;
        m = Math.max(m, v.cent + cerca(mon + v.monete));
      }
      memo.set(mon, m);
      return m;
    };
    const tot = centDiritti + cerca(0);
    if (tot > massimo) { massimo = tot; comeMassimo = (s === 'completo' ? 'completo' : s.join('+')) || 'niente'; }
  }
  return { cent: massimo, come: comeMassimo };
}

const max = spesaMassima();
di(max.cent < TETTO_VITA_CENT,
   'la spesa massima possibile (' + (max.cent / 100).toFixed(2) + ' €, via «' + max.come + '») sta sotto il tetto di '
   + (TETTO_VITA_CENT / 100).toFixed(2) + ' €',
   max.cent + ' contro ' + TETTO_VITA_CENT);
di(TETTO_VITA_CENT - max.cent >= 100,
   'e ci sta con almeno un euro di margine: il tetto non morde chi compra tutto',
   ((TETTO_VITA_CENT - max.cent) / 100).toFixed(2) + ' € di margine');

{
  const coda = new Coda(new DepositoInMemoria());
  di(coda.spesa().cent === 0 && coda.spesa().restanteCent === TETTO_VITA_CENT,
     'un giocatore nuovo ha speso zero e ha tutto il tetto davanti');

  /* Si spende fino a sfondare, e si verifica che il rifiuto arrivi PRIMA
     e non dopo: chi paga non deve mai vedersi prendere il soldo e poi
     negare la merce. */
  let n = 0;
  while (coda.entroIlTetto('monete_cassetta') && n < 100) { coda.segnaSpesa('monete_cassetta'); n++; }
  di(coda.spesa().cent <= TETTO_VITA_CENT,
     'la spesa registrata non supera mai il tetto', coda.spesa().cent);
  di(!coda.entroIlTetto('monete_cassetta'),
     'raggiunto il tetto, la voce successiva è rifiutata prima di aprire il pagamento');
  /* E il caso che si dimentica: una voce PIU' PICCOLA potrebbe ancora
     starci. Rifiutare tutto sarebbe sbagliato quanto accettare tutto. */
  const spazio = TETTO_VITA_CENT - coda.spesa().cent;
  const piccola = LISTINO.filter(v => v.cent <= spazio);
  di(piccola.every(v => coda.entroIlTetto(v.sku)),
     'una voce che ci sta ancora nel tetto NON viene rifiutata insieme alle altre',
     'spazio ' + spazio + ' cent, voci ammesse ' + piccola.length);
}

/* Il tetto è di DENARO, non di monete. Chi si guadagna diecimila monete
   giocando non deve trovare una porta chiusa: sarebbe il rovescio esatto
   del patto. */
{
  const m = motoreFinto({});
  m.compra('monete_sacchetto');
  const prima = m.coda.spesa().cent;
  m.coda.riconcilia(m.daPlay(), () => {}, t => m.chiudi(t));
  di(m.coda.spesa().cent === prima,
     'consegnare e consumare non muove il contatore della spesa: solo pagare lo muove');
}

/* =====================================================================
   LA CODA DEGLI ACQUISTI
   ===================================================================== */
titolo('LA CODA — un acquisto pagato non si perde, e non si consegna due volte');

/* Un finto Play: si comanda a mano quello che elenca, perché i casi che
   contano sono proprio quelli che non si possono provocare a piacere su
   un telefono vero. */
function banco() {
  const dep = new DepositoInMemoria();
  const accrediti = [];
  const chiusure = [];
  const ordine = [];
  return {
    dep, accrediti, chiusure, ordine,
    coda: () => new Coda(dep),
    accredita(sku, token) { accrediti.push(token); ordine.push('A:' + token); },
    chiudiOk(coda) { return (token) => { chiusure.push(token); ordine.push('C:' + token); coda.chiusa(token); }; },
    chiudiMuto(token) { chiusure.push(token); ordine.push('C:' + token); },   // Play non risponde mai
  };
}
const comprato = (token, sku) => ({ token, sku, stato: 'comprato', quando: 1 });

{
  const b = banco();
  const c = b.coda();
  const play = [comprato('t1', 'monete_sacchetto')];
  c.riconcilia(play, b.accredita, b.chiudiOk(c));
  c.riconcilia(play, b.accredita, b.chiudiOk(c));
  c.riconcilia(play, b.accredita, b.chiudiOk(c));
  di(b.accrediti.length === 1,
     'lo stesso gettone consegnato tre volte accredita una volta sola', b.accrediti.length);
}

{
  /* L'app muore fra la consegna e il consumo. Al riavvio Play elenca
     ancora il gettone: non si deve riaccreditare, ma si DEVE richiudere,
     se no dopo tre giorni Google rimborsa d'ufficio un acquisto che il
     giocatore ha ricevuto. */
  const b = banco();
  const c1 = b.coda();
  const play = [comprato('t1', 'monete_cassetta')];
  c1.riconcilia(play, b.accredita, b.chiudiMuto);      // Play non conferma: muore qui
  di(c1.stato('t1') === 'consegnato', 'dopo la consegna la riga resta «consegnato» finché Play non conferma');
  di(c1.pendenti().length === 1, 'la riga compare fra le pendenti');

  const c2 = b.coda();                                  // riavvio: si rilegge il deposito
  di(c2.stato('t1') === 'consegnato', 'la riga sopravvive al riavvio');
  c2.riconcilia(play, b.accredita, b.chiudiOk(c2));
  di(b.accrediti.length === 1, 'al riavvio NON si riaccredita', b.accrediti.length);
  di(b.chiusure.length === 2, 'ma si ritenta la chiusura, ed è il punto', b.chiusure.length);
  di(c2.stato('t1') === 'chiuso', 'confermata la chiusura, la pratica finisce');

  const c3 = b.coda();
  c3.riconcilia([], b.accredita, b.chiudiOk(c3));       // Play non lo elenca più
  di(b.accrediti.length === 1 && c3.pendenti().length === 0, 'e non torna più');
}

{
  /* L'ORDINE, che è l'unica cosa da ricordare. Non deve esistere nessun
     cammino in cui si consuma prima di aver consegnato: il consumo
     cancella il gettone da Play e non resta niente da rigiocare. */
  const b = banco();
  const c = b.coda();
  c.riconcilia([comprato('t1', 'la_curva'), comprato('t2', 'monete_sacchetto')], b.accredita, b.chiudiOk(c));
  const iA = b.ordine.indexOf('A:t1'), iC = b.ordine.indexOf('C:t1');
  const jA = b.ordine.indexOf('A:t2'), jC = b.ordine.indexOf('C:t2');
  di(iA >= 0 && iC > iA && jA >= 0 && jC > jA,
     'per ogni gettone la consegna viene PRIMA della chiusura', b.ordine.join(' '));
}

{
  /* La scrittura che non arriva sul disco. In una WebView Chromium il
     localStorage si scrive in differita e un processo ucciso in primo
     piano perde gli ultimi secondi (misurato in questo progetto con
     am force-stop). Se la riga si perde, il sistema deve sbagliare dalla
     parte RECUPERABILE: riaccreditare, non lasciare a mani vuote chi ha
     pagato. E' la ragione per cui l'ordine è consegna→salva→chiudi e non
     il contrario. */
  const b = banco();
  const c1 = b.coda();
  const play = [comprato('t1', 'monete_sacchetto')];
  c1.riconcilia(play, b.accredita, b.chiudiMuto);
  b.dep.perdiUltima();                                   // il disco non ha visto niente
  const c2 = b.coda();
  c2.riconcilia(play, b.accredita, b.chiudiOk(c2));
  di(b.accrediti.length === 2,
     'persa la scrittura, si riaccredita: si sbaglia dalla parte che si può correggere',
     b.accrediti.length);
}

{
  /* Il pagamento in contanti in cartoleria: Play dice PENDING. Non si
     accredita NIENTE, e la schermata deve poterlo dire. Accreditare qui
     significa regalare la merce a chi non ha ancora pagato. */
  const b = banco();
  const c = b.coda();
  c.riconcilia([{ token: 't9', sku: 'monete_cassetta', stato: 'attesa', quando: 1 }], b.accredita, b.chiudiOk(c));
  di(b.accrediti.length === 0, 'un acquisto in attesa non accredita niente');
  di(c.stato('t9') === 'attesa', 'ma resta annotato, così la schermata può dirlo');
  /* e quando diventa comprato, si consegna una volta sola */
  c.riconcilia([comprato('t9', 'monete_cassetta')], b.accredita, b.chiudiOk(c));
  di(b.accrediti.length === 1, 'quando il contante arriva, si consegna, e una volta sola');
}

{
  /* App reinstallata: il deposito è vuoto ma Play si ricorda tutto.
     Un gettone sconosciuto va CONSEGNATO, non ignorato: è esattamente il
     caso «ho cambiato telefono» e ignorarlo significa aver preso i soldi
     e non aver dato niente. */
  const b = banco();
  const c = b.coda();
  c.riconcilia([comprato('vecchio-1', 'pacchetto_divise'), comprato('vecchio-2', 'la_curva')],
               b.accredita, b.chiudiOk(c));
  di(b.accrediti.length === 2, 'un gettone mai visto prima si consegna', b.accrediti.join(','));
}

{
  /* Robaccia: un elenco con voci senza gettone, o in stati che non
     conosciamo, non deve far cadere la riconciliazione — se cade, cadono
     con lei tutte le consegne buone che venivano dopo. */
  const b = banco();
  const c = b.coda();
  c.riconcilia([null, {}, { token: 'x', stato: 'boh' }, comprato('buono', 'la_curva')],
               b.accredita, b.chiudiOk(c));
  di(b.accrediti.length === 1 && b.accrediti[0] === 'buono',
     'righe malformate si saltano e non fermano le consegne buone', b.accrediti.join(','));
}

/* =====================================================================
   SENZA RETE
   ===================================================================== */
titolo('SENZA RETE — una riga, e il negozio a monete resta aperto');

{
  const { Pagamenti } = P;
  Pagamenti.usa('finta', { inRete: false });
  const riga = Pagamenti.perche();
  di(typeof riga === 'string' && riga.length > 0 && riga.length < 200,
     'senza rete c\'è una riga sola, e si legge in un respiro', riga);
  di(/rete/i.test(riga) && /monete/i.test(riga),
     'la riga dice il motivo E dice che le monete si spendono lo stesso');
  di(Pagamenti.comprabile('la_curva') === false,
     'il bottone in euro è spento, non «in caricamento»');
  const esito = Pagamenti.compra('la_curva');
  di(esito.ok === false && esito.perche === 'bloccato',
     'e premerlo lo stesso non apre niente e non gira in tondo', JSON.stringify(esito));

  Pagamenti.usa('finta', { inRete: true });
  di(Pagamenti.perche() === null, 'tornata la rete, la riga sparisce e il bottone si riaccende');
  di(Pagamenti.compra('la_curva').ok === true, 'e l\'acquisto parte');
}

{
  /* La consegna di un acquisto vecchio deve funzionare ANCHE senza rete:
     Play tiene in cache locale l'elenco degli acquisti, e riconciliare
     non chiede un byte a nessuno. E' la risposta precisa alla richiesta
     «deve poter funzionare anche offline»: l'ACQUISTO no, la CONSEGNA
     sì. */
  const b = banco();
  const c = b.coda();
  c.riconcilia([comprato('ieri', 'monete_cassetta')], b.accredita, b.chiudiMuto);
  di(b.accrediti.length === 1,
     'un acquisto di ieri si consegna oggi anche a rete staccata: non serve la rete per riconciliare');
}

/* =====================================================================
   IL PAESE
   ===================================================================== */
titolo('IL PAESE — e quando non si sa');

{
  const { Pagamenti } = P;
  Pagamenti.usa('finta', { paese: 'BE' });
  di(Pagamenti.paese() === 'BE', 'il paese di fatturazione arriva dal ponte, non dalla lingua del telefono');
  Pagamenti.usa('finta', {});
  di(Pagamenti.paese() === null, 'e quando non si sa, è null e non un ripiego inventato');
}

/* La regola, che è una riga di prosa e vale come codice: quando il paese
   non si sa, si mostra la BACHECA. Costa uguale, non chiede il permesso
   di nessuno, ed è la versione che nessun regolatore può contestare.
   Sbagliare verso la bacheca non toglie niente a nessuno; sbagliare
   verso la bustina vende un prodotto vietato in due Paesi. */
const mostraBacheca = paese => paese === null || paese === 'BE' || paese === 'NL';
di(mostraBacheca(null) && mostraBacheca('BE') && mostraBacheca('NL') && !mostraBacheca('IT'),
   'senza paese, in Belgio e nei Paesi Bassi si mostra la bacheca; altrove si può scegliere');

/* ------------------------------------------------------------- fine */
console.log('\n' + (ok + no) + ' controlli, ' + ok + ' passati, ' + no + ' falliti');
process.exit(no ? 1 : 0);
