/* =====================================================================
   ponte.js — il lato JavaScript dei pagamenti, e i NUMERI dell'economia.

   PERCHE' I NUMERI STANNO QUI E NON NEL GIOCO. Il listino, le probabilità
   della bustina e i tetti di spesa devono essere leggibili da due posti
   nello stesso istante: dalla schermata d'acquisto (che li mostra a chi
   paga) e dal banco (che li verifica). Se vivessero in due copie, il
   giorno in cui una cambia l'altra diventa una bugia scritta sullo
   schermo di qualcuno. Quando questo blocco entrerà in
   CALCETTO-il-gioco.html, ci entra INTERO e questo file lo importa: non
   si duplica una probabilità dichiarata, mai.

   DUE REALIZZAZIONI DIETRO LA STESSA INTERFACCIA:
     finta       nessun addebito, coda simulata, funziona in un browser
                 aperto su file:// e dentro node. E' il modo predefinito.
     googlePlay  parla con android/pagamenti/Pagamenti.java attraverso
                 window.PagamentiJava.
   Il gioco deve girare identico con la finta: se una schermata si
   comporta diversamente fra le due, è la schermata a essere sbagliata.

   uso in pagina:   <script src="ponte.js"></script>  →  window.Pagamenti
   uso da node:     const P = require('./ponte.js')
   ===================================================================== */
'use strict';

/* =====================================================================
   1. I SOLDI SI CONTANO IN CENTESIMI INTERI

   0,1 + 0,2 in virgola mobile non fa 0,3, e un tetto di spesa confrontato
   in virgola mobile è un tetto che un giorno lascia passare un centesimo
   di troppo o ne blocca uno di meno. Qui dentro un euro è 100 e basta.
   Le stringhe '3,99' servono SOLO come ripiego di scrittura: il prezzo
   che si mostra a chi paga arriva da Google (getFormattedPrice), perché
   è l'unico che conosce la valuta, l'IVA e il listino del suo Paese.
   ===================================================================== */
const cent = c => (c / 100).toFixed(2).replace('.', ',') + ' €';

/* =====================================================================
   2. IL CAMBIO, E IL VINCOLO CHE LO GOVERNA

   Il negozio di oggi ha cinque articoli col doppio prezzo, e il cambio
   che ne esce è fra 666,7 e 668,9 monete per euro (misurato riga per
   riga su CALCETTO-il-gioco.html:7339-7356).

   DA QUI DISCENDE UN VINCOLO, e non è estetica: se un taglio di monete
   desse più di 666,7 monete per euro, comprare monete e poi l'articolo
   costerebbe MENO che comprare l'articolo, e il prezzo scritto sul
   cartellino diventerebbe una trappola per chi lo legge e si fida.
   Quindi: nessun taglio supera CAMBIO_TETTO. Il banco lo verifica.
   ===================================================================== */
const CAMBIO_TETTO = 2660 / 3.99;   // 666,66… monete per euro: l'articolo più «caro» in monete

/* Quanto vale un'ora di partite, e da dove viene il numero.
     48 monete a partita   — taratura DICHIARATA nel codice del gioco
                             (CALCETTO-il-gioco.html:7330), non misurata
                             su partite vere: le ore qui sotto sono ±20%.
     20 partite all'ora    — 90 s di partita (durata predefinita) più
                             lavagnetta, moviola e menu ≈ 3 minuti l'una.
   Il prodotto è 960 monete all'ora, ed è il tasso di cambio fra il
   denaro e la sola cosa che il denaro compra davvero in questo gioco. */
const MONETE_PARTITA = 48;
const PARTITE_ORA = 20;
const MONETE_ORA = MONETE_PARTITA * PARTITE_ORA;   // 960

const ore = monete => monete / MONETE_ORA;

/* =====================================================================
   3. IL LISTINO — sette voci, e non ce ne sono altre

   Due famiglie, e la differenza è tutto il progetto:

     diritto      si compra UNA VOLTA e resta per sempre. Non si consuma,
                  non scade, non si ricompra. E' aspetto: campi, divise,
                  cori, cartelloni.
     consumabile  monete, cioè TEMPO. Si consuma, si può ricomprare, ed è
                  l'unica voce che può essere comprata più di una volta —
                  per questo esiste il tetto di magazzino (sezione 5).

   NESSUNA TERZA FAMIGLIA. Non si vende forza, non si vende crescita
   della rosa, non si vende un posto in classifica. La ragione sta in
   ECONOMIA.md e in una riga di codice: faiCrescereRosa alimenta gli
   attributi, gli attributi alimentano forzaDi (rete/api/squadra.js), e
   forzaDi decide con chi giochi e quanti punti vale. Vendere crescita è
   vendere classifica con un ritardo.

   I prezzi in euro sono di RIPIEGO: valgono per la finta e per il primo
   avvio prima che Play risponda. Il prezzo vero è quello di Play.
   ===================================================================== */
const LISTINO = [
  /* --- i cinque diritti: sono il catalogo che il gioco ha già oggi --- */
  { sku: 'campetto_completo', tipo: 'diritto', cent: 399, monete: 2660,
    nome: 'IL CAMPETTO COMPLETO', da: ['campi', 'divise', 'curva', 'sponsor'],
    nota: 'I quattro pezzi separati fanno 7,96 €: il completo vale la metà, ed è vero.' },
  { sku: 'pacchetto_campi',   tipo: 'diritto', cent: 199, monete: 1330,
    nome: 'PACCHETTO CAMPI',    da: ['campi'] },
  { sku: 'pacchetto_divise',  tipo: 'diritto', cent: 199, monete: 1330,
    nome: 'PACCHETTO DIVISE',   da: ['divise'] },
  { sku: 'la_curva',          tipo: 'diritto', cent:  99, monete:  660,
    nome: 'LA CURVA',           da: ['curva'] },
  { sku: 'lo_sponsor',        tipo: 'diritto', cent: 299, monete: 2000,
    nome: 'LO SPONSOR DEL CAMPETTO', da: ['sponsor'] },

  /* --- i due tagli di monete: comprano TEMPO, e costano più caro
         all'ora dei diritti. E' voluto: chi sa che cosa vuole deve
         comprare QUELLA cosa, non la valuta che la compra. --- */
  { sku: 'monete_sacchetto', tipo: 'consumabile', cent: 199, monete: 1100,
    nome: 'UN SACCHETTO DI MONETE' },
  { sku: 'monete_cassetta',  tipo: 'consumabile', cent: 499, monete: 3200,
    nome: 'UNA CASSETTA DI MONETE' },
];

const vocePer = sku => LISTINO.find(v => v.sku === sku) || null;
const consumabile = sku => { const v = vocePer(sku); return !!v && v.tipo === 'consumabile'; };

/* =====================================================================
   4. I POZZI DELLE MONETE — dove finiscono, e quanto sono profondi

   I CAMPI, con la scala corretta. Oggi il gioco chiede 150+400+800+1500+
   2500+4000+6000 = 15.350 monete per i sette campi, e ne chiede 1.330
   per il pacchetto che li dà tutti: undici volte e mezza meno
   (_analisi/DIFFERENZE-FC-MOBILE.md, voce «Coerenza interna della scala
   dei prezzi», dove è già registrato come difetto NOSTRO). Chi si
   guadagna i campi giocando viene punito rispetto a chi compra la
   scorciatoia, e non c'è nessuna ragione perché sia così.

   La scala qui sotto somma 3.450 contro i 1.330 del pacchetto: il
   pacchetto sconta il 61%, che è uno sconto da pacchetto e non un
   errore di battitura. Il banco verifica che il rapporto stia fra 0,25 e
   0,60 e che la scala salga sempre.
   ===================================================================== */
const CAMPI = [
  { id: 'oratorio', monete:   0 },   // il primo è gratis e resta gratis
  { id: 'parrocchia', monete: 150 },
  { id: 'cortile',    monete: 250 },
  { id: 'lungofiume', monete: 350 },
  { id: 'terrazza',   monete: 450 },
  { id: 'porto',      monete: 600 },
  { id: 'tetto',      monete: 750 },
  { id: 'notturna',   monete: 900 },
];

/* =====================================================================
   LA BUSTINA — e va letta sapendo che il progetto consiglia di NON
   spedirla (ECONOMIA.md, «Se dovessi decidere io»). E' specificata per
   intero perché la specifica è ciò che rende la decisione reversibile in
   un pomeriggio invece che in un mese.

   VENTIQUATTRO PEZZI, TUTTI COSMETICI, INSIEME CHIUSO. Non c'è una
   venticinquesima bustina: quando l'insieme è vuoto la voce sparisce dal
   negozio. Questo è il fatto che rende il resto onesto — un insieme
   chiuso ha un costo massimo, e il costo massimo si scrive sul
   cartellino: 24 × 300 = 7.200 monete, circa 7,5 ore di partite.

   MAI UN DOPPIONE. La bustina pesca solo fra i pezzi che non hai. E' la
   differenza fra una spesa che finisce e una che non finisce mai.

   LE PROBABILITA' SONO IN DECIMILLESIMI INTERI, non in virgola mobile.
   Ragione aritmetica, non ideologica: 0.74 + 0.21 + 0.05 in JavaScript
   fa 1.0000000000000002, e una verifica «somma === 1» fallirebbe su
   probabilità corrette. In interi la somma è 10000 e non c'è niente da
   discutere.

   LE PROBABILITA' MOSTRATE SONO QUELLE VERE, NON QUELLE NOMINALI. Man
   mano che un livello si svuota, le probabilità si RINORMALIZZANO fra i
   livelli rimasti. Mostrare 5,00% mentre si pesca al 19,2% è una bugia
   che si spedisce per distrazione, non per malizia, ed è per questo che
   il banco la cerca.

   LA GARANZIA (pity) E' VISIBILE E SI CONTA ALLA ROVESCIA. Al più otto
   aperture senza un «prezioso»: alla nona il prezioso è certo. Il
   contatore sta sulla schermata d'acquisto, non in un sottomenu.
   ===================================================================== */
const BUSTINA = {
  costo: 300,
  garanzia: 8,           // aperture senza «prezioso» dopo le quali è certo
  livelli: [
    { id: 'comune',   dm: 7400, pezzi: 12 },   // dm = decimillesimi
    { id: 'raro',     dm: 2100, pezzi:  8 },
    { id: 'prezioso', dm:  500, pezzi:  4 },
  ],
};
const BUSTINA_PEZZI = BUSTINA.livelli.reduce((s, l) => s + l.pezzi, 0);   // 24

/* Le probabilità VERE date le scorte rimaste. Il resto della divisione
   va al livello più grande fra quelli rimasti: così la somma è 10000
   esatti e non 9999, che è il modo in cui una tabella di probabilità
   smette di sommare a uno senza che nessuno se ne accorga. */
function probabilitaVere(rimasti) {
  const vivi = BUSTINA.livelli.filter(l => (rimasti[l.id] || 0) > 0);
  if (!vivi.length) return [];
  const tot = vivi.reduce((s, l) => s + l.dm, 0);
  const out = vivi.map(l => ({ id: l.id, dm: Math.floor(l.dm * 10000 / tot) }));
  let manca = 10000 - out.reduce((s, o) => s + o.dm, 0);
  let grande = 0;
  for (let i = 1; i < out.length; i++) if (out[i].dm > out[grande].dm) grande = i;
  out[grande].dm += manca;
  return out;
}

/* Una apertura. `caso` è una funzione che dà un numero in [0,1): si passa
   da fuori perché una probabilità dichiarata si verifica solo se il caso
   si può guidare. Lo stato è {rimasti, senzaPrezioso} e si modifica.

   L'ORDINE CONTA: prima la garanzia, poi il sorteggio. Se il sorteggio
   venisse prima, un prezioso pescato per fortuna all'ottava non
   azzererebbe il contatore in tempo e la garanzia scatterebbe due volte
   di fila — generoso, ma il numero scritto sullo schermo sarebbe falso. */
function apriBustina(stato, caso) {
  const rimasti = stato.rimasti;
  if (BUSTINA.livelli.every(l => (rimasti[l.id] || 0) <= 0)) return null;

  let scelto = null;
  const preziosiRimasti = (rimasti.prezioso || 0) > 0;

  if (preziosiRimasti && stato.senzaPrezioso >= BUSTINA.garanzia) {
    scelto = 'prezioso';                      // la garanzia, e non è negoziabile
  } else {
    const tab = probabilitaVere(rimasti);
    let t = Math.floor(caso() * 10000);
    if (t > 9999) t = 9999;                   // un caso() che tornasse 1 non deve uscire dalla tabella
    for (const r of tab) { if (t < r.dm) { scelto = r.id; break; } t -= r.dm; }
    if (!scelto) scelto = tab[tab.length - 1].id;
  }

  rimasti[scelto]--;
  stato.senzaPrezioso = (scelto === 'prezioso') ? 0 : stato.senzaPrezioso + 1;
  return scelto;
}

const rimastiPieni = () => {
  const r = {};
  for (const l of BUSTINA.livelli) r[l.id] = l.pezzi;
  return r;
};

/* IL RIPIEGO PER BELGIO E PAESI BASSI — e per chiunque altro, se si
   decide che sia meglio.

   LA BACHECA: gli stessi ventiquattro pezzi, lo stesso prezzo di una
   bustina (300 monete), e SCEGLI TU. Costo pieno identico, 7.200 monete.

   Un ripiego che costa di più sarebbe una tassa sul domicilio, e un
   ripiego che costa di meno renderebbe la bustina una trappola per tutti
   gli altri. Costare uguale è l'unica risposta che non chiede scuse a
   nessuno — e apre una domanda che ECONOMIA.md non evita: se la versione
   deterministica costa uguale ed è migliore, perché spedire l'altra. */
const prezzoBacheca = () => BUSTINA.costo;

/* =====================================================================
   5. I DUE TETTI DI SPESA

   IL TETTO DI MAGAZZINO, che è quello vero. Non si vendono monete che
   non hanno un pozzo: prima di offrire un taglio si calcola quanto costa
   ancora tutto ciò che non possiedi, SULLA STRADA PIU' ECONOMICA, e se
   hai già più monete di così il taglio non si vende. Con lo scarto di un
   taglio solo, perché i tagli non sono divisibili.

   E' meglio di un tetto in euro per una ragione che vale la pena
   scrivere: un tetto in euro dice «puoi rovinarti fino a qui». Il tetto
   di magazzino dice «non c'è niente da comprare», che è una frase vera
   e non una concessione.

   IL TETTO IN DENARO, che è la cintura di sicurezza. 24,99 € in tutta la
   vita del gioco. Non dovrebbe mordere mai: il banco calcola la spesa
   massima possibile percorrendo la strada PIU' CARA che il tetto di
   magazzino consente, e verifica che stia sotto con margine. Serve per
   il giorno in cui il catalogo cresce e nessuno rifà il conto, e per il
   caso che nessuno vuole nominare — la carta del padre in mano a un
   bambino per un pomeriggio.
   ===================================================================== */
const TETTO_VITA_CENT = 2499;

/* Quanto costa ancora, in monete, tutto ciò che non possiedi. `avere` è
   { diritti:array di id, campi:array di id, bustineAperte:n }.

   `avere.campi` si accetta e NON si usa: il perché è scritto sotto, sui
   sette campi, ed è una conseguenza della strada più economica. Sta
   nella firma perché chi legge la chiamata deve poter vedere che il dato
   c'era e che è stato considerato — e perché il banco verifica che
   passarlo non cambi il risultato. */
function residuo(avere) {
  const diritti = new Set(avere && avere.diritti ? avere.diritti : []);
  const aperte = (avere && avere.bustineAperte) | 0;
  let m = 0;

  /* i quattro pezzi, sulla strada più economica: se ne mancano tutti e
     quattro conviene il completo (2.660) e non la somma (5.320) */
  const pezzi = ['campi', 'divise', 'curva', 'sponsor'].filter(p => !diritti.has(p));
  if (pezzi.length) {
    const separati = pezzi.reduce((s, p) => s + vocePer(
      p === 'campi' ? 'pacchetto_campi' : p === 'divise' ? 'pacchetto_divise' :
      p === 'curva' ? 'la_curva' : 'lo_sponsor').monete, 0);
    m += Math.min(separati, vocePer('campetto_completo').monete);
  }

  /* I SETTE CAMPI NON COMPAIONO IN QUESTO CONTO, e non è una svista.
     La strada più economica per averli tutti è SEMPRE il PACCHETTO CAMPI
     (1.330 monete contro i 3.450 della somma), e il pacchetto è già nel
     conto qui sopra — o dentro il completo, o come pezzo separato. Chi
     preferisce comprarli uno per uno sta scegliendo la strada più cara,
     che è un diritto suo ma non è quella su cui si dimensiona il
     magazzino: dimensionare sul percorso più caro vorrebbe dire vendere
     monete per una cosa che si può avere con meno. Se un giorno il
     pacchetto campi sparisse dal listino, questa riga di commento
     diventerebbe falsa e i campi andrebbero rimessi nel conto. */

  m += Math.max(0, BUSTINA_PEZZI - aperte) * BUSTINA.costo;
  return m;
}

/* Il taglio più piccolo del listino: è la misura dello scarto ammesso.
   I tagli non sono divisibili, quindi un po' di monete morte è
   inevitabile — ma «un po'» va definito, e questo è il numero. */
const TAGLIO_MINIMO = Math.min(...LISTINO.filter(v => v.tipo === 'consumabile').map(v => v.monete));

/* Si può vendere questo taglio?

   DUE CONDIZIONI, e la seconda l'ho scoperta dal banco e non pensandoci.
   La prima è ovvia: se hai già più monete del residuo, non si vende.
   La seconda no: con 9.700 monete in mano e 9.860 di residuo, la prima
   condizione da sola lascia passare una CASSETTA da 3.200, che lascia
   3.040 monete morte — e su quella fessura il banco ha trovato una
   strada da 25,90 €, cioè sopra il tetto che avevo scritto. Lo scarto
   ammesso deve essere UN taglio minimo, non un taglio qualunque:
   altrimenti il tetto di magazzino non è un tetto, è un suggerimento. */
function vendibile(sku, moneteInMano, avere) {
  const v = vocePer(sku);
  if (!v) return false;
  if (v.tipo !== 'consumabile') return true;
  const mon = moneteInMano | 0, res = residuo(avere);
  if (mon >= res) return false;
  return (mon + v.monete - res) < TAGLIO_MINIMO;
}

/* =====================================================================
   6. LA CODA DEGLI ACQUISTI — perché un acquisto pagato non si perde

   IL GUASTO DA CUI NASCE. Chi paga, Google incassa, e l'app muore prima
   di aver accreditato. Senza una coda quell'acquisto è perso: chi ha
   pagato non ha niente, e dopo tre giorni Google rimborsa d'ufficio
   l'acquisto non riconosciuto — cioè il guasto si chiude da solo, tardi,
   e nel modo che fa più danno alla fiducia.

   L'ORDINE, ed è l'unica cosa da ricordare di tutto il file:

        1. ACCREDITA        2. SALVA        3. CHIUDI con Play

   In quest'ordine perché uno solo dei due errori possibili è
   recuperabile. «Accreditato due volte» si impedisce con una chiave di
   unicità (il purchaseToken, che Play garantisce unico). «Consumato
   senza aver accreditato» non si recupera in nessun modo: il gettone
   sparisce dall'elenco di Play e non resta niente da rigiocare. Quindi
   si sbaglia sempre dalla parte che si può correggere.

   DOVE SI SALVA, e qui c'è una trappola già pagata in questo progetto:
   il localStorage di una WebView Chromium si scrive su disco IN
   DIFFERITA, e un processo ucciso in primo piano perde gli ultimi
   secondi (memoria di progetto «apk-android-senza-gradle», misurato con
   am force-stop). Quindi la copia DUREVOLE non è il localStorage: è
   SharedPreferences dal lato Java, scritta con commit() sincrono. Il
   localStorage resta la copia veloce, e quando le due divergono vince
   Java. Con la realizzazione finta il deposito è quello che gli si
   passa, ed è così che il banco può simulare la morte del processo.

   I QUATTRO STATI, e sono quattro perché quattro sono i modi di morire
   a metà:
     attesa      Play dice PENDING (pagamento in contanti in cartoleria):
                 non si accredita NIENTE finché non diventa PURCHASED
     visto       Play lo elenca, noi non abbiamo ancora dato niente
     consegnato  accreditato E salvato; Play non lo sa ancora
     chiuso      Play ha consumato o riconosciuto: la pratica è finita
   ===================================================================== */
function Coda(deposito) {
  this.dep = deposito;
  let d = null;
  try { d = JSON.parse(this.dep.leggi() || 'null'); } catch (e) { d = null; }
  this.righe = (d && typeof d === 'object' && d.righe) ? d.righe : {};
  this.spesoCent = (d && typeof d.spesoCent === 'number' && isFinite(d.spesoCent))
    ? Math.max(0, d.spesoCent | 0) : 0;
}

Coda.prototype._salva = function () {
  this.dep.scrivi(JSON.stringify({ v: 1, righe: this.righe, spesoCent: this.spesoCent }));
};

Coda.prototype.stato = function (token) {
  const r = this.righe[token];
  return r ? r.stato : null;
};

Coda.prototype.pendenti = function () {
  return Object.keys(this.righe).filter(t => this.righe[t].stato === 'consegnato');
};

/* Il passo unico: si dà a mangiare l'elenco che arriva da Play e si
   ottiene, come effetto, ogni accredito mancante. Idempotente per
   costruzione: si può chiamare a ogni avvio, a ogni ritorno in primo
   piano e a ogni acquisto, e il conto non cambia. */
Coda.prototype.riconcilia = function (daPlay, accredita, chiudi) {
  const fatti = [];
  for (const p of (daPlay || [])) {
    if (!p || !p.token) continue;

    if (p.stato === 'attesa') {
      this.righe[p.token] = { sku: p.sku, stato: 'attesa', quando: p.quando || 0 };
      this._salva();
      continue;
    }
    if (p.stato !== 'comprato') continue;

    const gia = this.stato(p.token);
    if (gia !== 'consegnato' && gia !== 'chiuso') {
      /* 1. ACCREDITA. Se accredita() lancia, non si salva e non si
         chiude: al prossimo avvio Play lo elenca ancora e si riprova. */
      accredita(p.sku, p.token);
      /* 2. SALVA, e sincrono. Da questa riga in poi l'accredito non si
         ripete mai più, nemmeno se il telefono si spegne adesso. */
      this.righe[p.token] = { sku: p.sku, stato: 'consegnato', quando: p.quando || 0 };
      this._salva();
      fatti.push(p.token);
    }
    /* 3. CHIUDI con Play. Se fallisce (rete assente) la riga resta
       'consegnato' e si ritenta al prossimo avvio: il termine è i tre
       giorni oltre i quali Play rimborsa d'ufficio. */
    if (this.stato(p.token) === 'consegnato') chiudi(p.token, consumabile(p.sku));
  }
  return fatti;
};

/* Play conferma il consumo o il riconoscimento: la pratica si chiude. */
Coda.prototype.chiusa = function (token) {
  if (!this.righe[token]) return false;
  this.righe[token].stato = 'chiuso';
  this._salva();
  return true;
};

/* Il tetto in denaro si tiene QUI e non nel salvataggio del gioco:
   cancellare i dati dell'app non deve azzerare la spesa già fatta, e la
   copia durevole sta in SharedPreferences, che sopravvive al «cancella
   dati» solo se l'utente non lo chiede esplicitamente — cosa che il
   giocatore ha diritto di fare, e allora il tetto riparte. E' un limite
   dichiarato, non un buco nascosto. */
Coda.prototype.spesa = function () {
  return { cent: this.spesoCent, restanteCent: Math.max(0, TETTO_VITA_CENT - this.spesoCent) };
};

Coda.prototype.entroIlTetto = function (sku) {
  const v = vocePer(sku);
  if (!v) return false;
  return this.spesoCent + v.cent <= TETTO_VITA_CENT;
};

Coda.prototype.segnaSpesa = function (sku) {
  const v = vocePer(sku);
  if (!v) return;
  this.spesoCent += v.cent;
  this._salva();
};

/* Deposito in memoria: serve alla finta e al banco. `perdiUltima` simula
   esattamente il guasto che il localStorage di una WebView produce
   davvero — l'ultima scrittura non è arrivata sul disco. */
function DepositoInMemoria() { this.dato = null; this.ombra = null; }
DepositoInMemoria.prototype.leggi = function () { return this.dato; };
DepositoInMemoria.prototype.scrivi = function (s) { this.ombra = this.dato; this.dato = s; };
DepositoInMemoria.prototype.perdiUltima = function () { this.dato = this.ombra; };

/* =====================================================================
   7. LE DUE REALIZZAZIONI

   La finta non è un giocattolo: è il modo in cui il gioco gira su un
   computer, dentro un banco, e dentro l'APK distribuito fuori da Play
   (dove non esiste nessun cassiere e il negozio deve funzionare lo
   stesso, a monete). Se una schermata si comporta diversamente fra la
   finta e Play, è la schermata a essere sbagliata.
   ===================================================================== */

function motoreFinto(opz) {
  opz = opz || {};
  const coda = new Coda(opz.deposito || new DepositoInMemoria());
  const inCorso = [];               // le «ricevute» che la finta ha emesso
  let n = 0;
  return {
    nome: 'finta',
    /* la finta è sempre disponibile: è il punto */
    disponibile: () => true,
    /* senza rete non si può pagare NEMMENO nella finta, se glielo si
       dice: serve a collaudare la schermata offline senza staccare il
       cavo */
    inRete: () => opz.inRete !== false,
    paese: () => opz.paese || null,
    coda,
    elenco() {
      return LISTINO.map(v => ({
        sku: v.sku, nome: v.nome, tipo: v.tipo,
        prezzo: cent(v.cent),      // in Play questo arriva da getFormattedPrice
        cent: v.cent, monete: v.monete || 0,
        ore: +ore(v.monete || 0).toFixed(2),
      }));
    },
    compra(sku) {
      if (!this.inRete()) return { ok: false, perche: 'senza-rete' };
      if (!vocePer(sku)) return { ok: false, perche: 'sconosciuto' };
      if (!coda.entroIlTetto(sku)) return { ok: false, perche: 'tetto' };
      const token = 'finta-' + (++n) + '-' + sku;
      inCorso.push({ token, sku, stato: 'comprato', quando: Date.now() });
      coda.segnaSpesa(sku);
      return { ok: true, token };
    },
    /* quello che Play direbbe se glielo si chiedesse adesso: tutto ciò
       che è stato comprato e non ancora chiuso */
    daPlay() {
      return inCorso.filter(p => coda.stato(p.token) !== 'chiuso');
    },
    chiudi(token) { coda.chiusa(token); },
  };
}

function motoreGooglePlay(ponteJava) {
  const J = ponteJava;
  /* La copia durevole è di Java. Il localStorage resta la copia veloce e
     non è quella che decide: vedi la nota sulla scrittura in differita. */
  const deposito = {
    leggi() { try { return J.leggiRegistro(); } catch (e) { return null; } },
    scrivi(s) { try { J.scriviRegistro(s); } catch (e) { /* niente da fare qui */ } },
  };
  const coda = new Coda(deposito);
  return {
    nome: 'googlePlay',
    coda,
    disponibile() { try { return !!J && J.pronto(); } catch (e) { return false; } },
    inRete() { try { return !!J && J.connesso(); } catch (e) { return false; } },
    paese() { try { return J.paese() || null; } catch (e) { return null; } },
    elenco() { try { return JSON.parse(J.elenco() || '[]'); } catch (e) { return []; } },
    compra(sku) {
      if (!vocePer(sku)) return { ok: false, perche: 'sconosciuto' };
      if (!this.inRete()) return { ok: false, perche: 'senza-rete' };
      if (!coda.entroIlTetto(sku)) return { ok: false, perche: 'tetto' };
      try { J.compra(sku); } catch (e) { return { ok: false, perche: 'ponte' }; }
      return { ok: true, token: null };     // il gettone arriva dall'evento
    },
    daPlay() { try { return JSON.parse(J.acquisti() || '[]'); } catch (e) { return []; } },
    chiudi(token, cons) { try { J.chiudi(token, !!cons); } catch (e) { /* si ritenta al prossimo avvio */ } },
  };
}

/* =====================================================================
   8. L'OGGETTO CHE IL GIOCO USA

   Sei metodi, gli stessi con la finta e con Play. Il gioco non deve mai
   sapere quale delle due sta girando: se lo chiede, è il gioco a essere
   sbagliato.
   ===================================================================== */
const Pagamenti = {
  motore: null,
  _accredita: null,
  _ascolto: [],

  /* `accredita(sku, token)` è la sola funzione che tocca il salvataggio
     del gioco. Deve essere SINCRONA e non deve mai lanciare per un
     motivo evitabile: quello che lancia qui non viene consumato, e va
     bene, ma quello che lancia SEMPRE blocca la coda per sempre. */
  usa(quale, opz) {
    opz = opz || {};
    this._accredita = opz.accredita || function () {};
    if (quale === 'googlePlay') {
      const J = opz.ponte || (typeof window !== 'undefined' ? window.PagamentiJava : null);
      this.motore = J ? motoreGooglePlay(J) : motoreFinto(opz);
    } else {
      this.motore = motoreFinto(opz);
    }
    return this.motore.nome;
  },

  /* Sceglie da sé: Play se il ponte Java c'è, la finta altrimenti. */
  usaQuelloCheCe(opz) {
    const J = (typeof window !== 'undefined') ? window.PagamentiJava : null;
    let pronto = false;
    try { pronto = !!J && J.pronto(); } catch (e) { pronto = false; }
    return this.usa(pronto ? 'googlePlay' : 'finta', opz);
  },

  nome() { return this.motore ? this.motore.nome : null; },
  elenco() { return this.motore ? this.motore.elenco() : []; },
  paese() { return this.motore ? this.motore.paese() : null; },
  spesa() { return this.motore ? this.motore.coda.spesa() : { cent: 0, restanteCent: TETTO_VITA_CENT }; },

  /* LA RIGA CHE LA SCHERMATA DEVE MOSTRARE quando il pagamento non si
     può fare. Una riga, un motivo, nessun giro in tondo, nessuna rotella
     che gira: il negozio a monete resta aperto e funzionante sotto. */
  perche() {
    if (!this.motore) return 'Il negozio in euro non è disponibile in questa versione.';
    if (!this.motore.disponibile())
      return 'Questa copia del gioco non passa da Google Play: qui tutto si sblocca giocando.';
    if (!this.motore.inRete())
      return 'Senza rete non si può pagare. Quello che è già tuo resta tuo, e le monete guadagnate si spendono lo stesso.';
    const s = this.spesa();
    if (s.restanteCent <= 0)
      return 'Hai raggiunto il tetto di spesa che il gioco si è dato: ' + cent(TETTO_VITA_CENT) + ' in tutto. Da qui in poi si gioca.';
    return null;
  },

  /* Si può premere il bottone in euro? Se no, `perche()` dice perché, e
     lo dice PRIMA di aprire il pagamento: non si prende un soldo per poi
     rifiutare. */
  comprabile(sku) {
    if (!this.motore) return false;
    if (this.perche()) return false;
    return this.motore.coda.entroIlTetto(sku);
  },

  compra(sku) {
    if (!this.motore) return { ok: false, perche: 'assente' };
    const no = this.perche();
    if (no) return { ok: false, perche: 'bloccato', riga: no };
    return this.motore.compra(sku);
  },

  /* Da chiamare a ogni avvio e a ogni ritorno in primo piano. E' questa
     la funzione che fa sì che un acquisto pagato non si perda. */
  riconcilia() {
    if (!this.motore) return [];
    const m = this.motore, io = this;
    return m.coda.riconcilia(
      m.daPlay(),
      function (sku, token) { io._accredita(sku, token); },
      function (token, cons) { m.chiudi(token, cons); }
    );
  },

  /* Play risponde in modo asincrono: Pagamenti.java chiama questo. */
  _daJava(evento, dato) {
    if (evento === 'acquisti' || evento === 'pronto') this.riconcilia();
    if (evento === 'chiuso' && dato) this.motore.coda.chiusa(dato);
    for (const f of this._ascolto) { try { f(evento, dato); } catch (e) {} }
  },
  suEvento(f) { this._ascolto.push(f); },
};

/* =====================================================================
   9. USCITE
   ===================================================================== */
const _pubblico = {
  Pagamenti, Coda, DepositoInMemoria,
  LISTINO, CAMPI, BUSTINA, BUSTINA_PEZZI,
  TETTO_VITA_CENT, CAMBIO_TETTO, TAGLIO_MINIMO, MONETE_ORA, MONETE_PARTITA, PARTITE_ORA,
  vocePer, consumabile, ore, cent,
  probabilitaVere, apriBustina, rimastiPieni, prezzoBacheca,
  residuo, vendibile,
  motoreFinto,
};

if (typeof module !== 'undefined' && module.exports) module.exports = _pubblico;
if (typeof window !== 'undefined') { for (const k in _pubblico) window[k] = _pubblico[k]; }
