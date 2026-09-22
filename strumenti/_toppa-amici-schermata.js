/* =====================================================================
   _toppa-amici-schermata.js — LA CLASSIFICA DEGLI AMICI SI VEDE E SI
   TOCCA (voce #136, compito 3).

   IL DIFETTO: dal compito 2 il gioco sa fare il codice di risposta,
   leggerlo e tenere la classifica, e non c'e' nessun modo di arrivarci
   con un dito. `window.__test.amici` esiste, il bottone no.

   DOVE VA LA CLASSIFICA, e non e' un gusto: e' misurato
   (fuori/_sonda-136-piega.js, tre viste, quattro riempimenti).

   Va dentro CLASSIFICA, SOPRA quella di rete, e la ragione e' un
   numero: sotto, con la classifica di rete piena, il primo amico
   finirebbe a 876 px, cioe' fuori da qualunque telefono. Sopra sta a
   114 px su tutte e due le viste orizzontali. La cosa che funziona
   SEMPRE — anche senza campo, anche a server spento — non puo' stare
   sotto la cosa che funziona solo con la rete.

   E NON SERVE UN INGRESSO NUOVO: il bottone CLASSIFICA nella barra
   c'e' gia', quindi la schermata SFIDA non si tocca di un pixel e i
   quattro bersagli inchiodati dalle voci #134 e #135 — CERCA@220,
   prima riga@329, GUARDA@308, SFIDA DI CARTA@347 — restano dove sono
   per costruzione, non per fortuna.

   IL PREZZO, DETTO: con cinque amici la prima riga della classifica di
   rete scende da 94/118 a 326, e TORNA ALLE SFIDE passa da 317/341 a
   549, sotto la piega. Era gia' cosi' oggi con venti righe di rete
   (TORNA@887), ed e' un bottone che non serve trovare per primo.

   E UN DIFETTO DEL GIOCO SPEDITO, trovato misurando dove sarebbero
   cadute le aggiunte (fuori/_sonda-136-pannello.js). Il pannello della
   sfida di carta e' alto 542 px, la piega di un telefono in orizzontale
   e' 412 o 360, e `align-items:center` su un contenitore che scorre
   manda la CIMA del figlio sopra lo zero: misurato, top a -65 e a -91,
   e `scrollTop = 0` non la riporta indietro (scrollHeight 493 contro
   574 di contenuto: 81 px persi in cima). Il titolo SFIDA DI CARTA sta
   a -44: su un telefono in orizzontale non si puo' leggere. La cura e'
   una parola — `align-items:flex-start` — e si mette SOLO su
   `#sfidaCarta`: il pannello del cambio telefono e' alto 349 px e la
   cima ce l'ha sempre avuta (misurato: 32 / 6 / 135), e cambiargli il
   centraggio sarebbe un ritocco gratuito a una schermata spedita.

   OTTO ANCORE: il foglio, il pannello, la schermata, mostraCarta,
   dipingiAmici, apriClassifica, la causa del terzo codice, i comandi.

   uso:  node strumenti/_toppa-amici-schermata.js --out fuori/x.html
         node strumenti/_toppa-amici-schermata.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const dentro = process.argv.includes('--dentro');
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-amici-schermata.html'));

/* ============================================================== 1) il CSS */
const A1 = `#sfCartaMio{font-size:13px;letter-spacing:.09em;line-height:1.45;word-break:break-all;white-space:normal;
  min-height:56px;resize:none}`;
const B1 = `#sfCartaMio{font-size:13px;letter-spacing:.09em;line-height:1.45;word-break:break-all;white-space:normal;
  min-height:56px;resize:none}
/* =====================================================================
   LA CIMA DEL PANNELLO SI DEVE POTER LEGGERE (voce #136), e fino a oggi
   non si poteva.

   Questa carta e' alta 542 px; la piega di un telefono in orizzontale e'
   412 o 360. Con align-items:center, un figlio piu' alto del contenitore
   viene centrato e la sua cima finisce SOPRA lo zero: misurato, top a
   -65 su 915x412 e a -91 su 800x360, e scrollTop=0 non la riporta
   indietro (scrollHeight 493 contro 574 di contenuto: ottantuno pixel
   persi in cima, e nessuno scorrimento li raggiunge). Il titolo SFIDA DI
   CARTA stava a -44, cioe' non si leggeva.

   flex-start appoggia la carta in alto e lascia scorrere tutto: cima a
   16, titolo a 37, e il fondo si raggiunge. Il prezzo, detto: GIOCA LA
   SFIDA passa da 326 a 407, cioe' sotto la piega di 360 — in cambio di
   un pannello in cui TUTTO si raggiunge.

   SOLO SU #sfidaCarta: il pannello del cambio telefono e' alto 349 px e
   la cima ce l'ha sempre avuta (32 / 6 / 135). Cambiargli il centraggio
   sarebbe un ritocco gratuito a una schermata spedita.
   ===================================================================== */
#sfidaCarta{align-items:flex-start}
/* il nome dell'amico non e' un codice: si scrive a mano, quindi non e'
   monospazio come gli altri due campi di questo pannello */
#sfCartaAmico{font-family:var(--cond);font-size:15px;letter-spacing:.06em}
/* la riga di un testa a testa porta una seconda riga sotto il nome, come
   la riga di una sfida (.sfchi small): il conto per esteso, perche' «7»
   da solo non dice se sono vittorie o partite */
.clariga .cn small{display:block;font-family:var(--cond);font-weight:600;font-size:10px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--grigio);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* e le etichette di sezione si allineano alla lista, come in SFIDA */
#classifica .eti{max-width:560px;margin:14px auto 8px;text-align:left}`;

/* ========================================= 2) il pannello della carta */
const A2 = `      <button class="fbtn paga" id="btnSfCartaUsa">GIOCA LA SFIDA</button>
      <button class="fbtn" id="btnSfCartaChiudi">CHIUDI</button>`;
const B2 = `      <button class="fbtn paga" id="btnSfCartaUsa">GIOCA LA SFIDA</button>
      <!-- ============ IL RISULTATO CHE TORNA INDIETRO (voce #136) ============
           Sta QUI, dopo GIOCA LA SFIDA, e non prima: le due azioni della
           voce #135 restano le prime della carta. Misurato a 915x412 e a
           800x360 (fuori/_sonda-136-pannello.js): CREA@283, GIOCA@407,
           SEGNA@524, e con align-items:flex-start si raggiunge tutto.
           IL NOME RESTA QUI. Non viaggia in nessun codice: e' il modo in
           cui questa funzione fa una classifica senza che nessuno abbia
           un identificatore. -->
      <div class="sf-nota">Ti è tornato indietro un codice <b>ESITO</b>? Incollalo qui sopra.
      Poi scrivi con che nome segnare quell&rsquo;amico: <b>il nome resta su questo telefono</b>
      e non finisce in nessun codice.</div>
      <input id="sfCartaAmico" autocomplete="off" spellcheck="false" maxlength="12" placeholder="il nome dell&rsquo;amico" aria-label="il nome dell'amico, solo su questo telefono">
      <button class="fbtn paga" id="btnSfCartaSegna">SEGNA IL RISULTATO</button>
      <button class="fbtn" id="btnSfCartaChiudi">CHIUDI</button>`;

/* ======================================== 3) la schermata CLASSIFICA */
const A3 = `<div id="classifica" class="ov hidden">
  <div class="box">
    <h1 class="sotto-titolo">CLASSIFICA</h1>
    <div class="sf-lista" id="claLista"></div>`;
const B3 = `<div id="classifica" class="ov hidden">
  <div class="box">
    <h1 class="sotto-titolo">CLASSIFICA</h1>
    <!-- ============ I TESTA A TESTA (voce #136) ============
         STANNO SOPRA quella di rete, e la ragione e' un numero misurato
         (fuori/_sonda-136-piega.js): sotto, con la classifica di rete
         piena, il primo amico finirebbe a 876 px. Sopra sta a 114 su
         tutte e due le viste orizzontali.
         La cosa che funziona SEMPRE — anche senza campo, anche a server
         spento — non puo' stare sotto la cosa che funziona solo con la
         rete. -->
    <div class="eti">I tuoi testa a testa</div>
    <div class="sf-lista" id="claAmici"></div>
    <div class="eti">La classifica di rete</div>
    <div class="sf-lista" id="claLista"></div>`;

/* =============================== 4) il codice giusto da far copiare */
const A4 = `  mostraCarta(){
    const e = $('sfCartaMio');
    if(e) e.value = this.cartaCodice || '';
    const v = $('sfCartaVia');
    if(v) v.textContent = this.cartaCodice
      ? 'Questo è il codice della tua ultima sfida di carta. Copialo e mandalo: chi lo incolla gioca la stessa identica partita.'
      : 'Crea una sfida, giocala fino in fondo, e il codice compare qui sotto.';`;
const B4 = `  mostraCarta(){
    /* =====================================================================
       UN CAMPO SOLO PER «IL CODICE DA COPIARE», E DICE QUALE E' (voce
       #136). Dopo una sfida RICEVUTA la cosa da mandare non e' piu' il
       codice della partita — quello ce l'ha gia' chi te l'ha mandata —
       e' il RISULTATO, ventuno caratteri. Due campi readonly uno sopra
       l'altro, di ventuno e settantanove caratteri, sarebbero una scelta
       da fare mentre si copia; un campo solo, con la riga sopra che dice
       che cos'e', e' un campo che non si sbaglia.
       ===================================================================== */
    const e = $('sfCartaMio');
    const risp = this.cartaRisposta || '';
    if(e) e.value = risp || this.cartaCodice || '';
    const v = $('sfCartaVia');
    if(v) v.textContent = risp
      ? 'Questo è il RISULTATO della sfida che hai appena giocato. Rimandalo a chi te l\\'ha mandata: il suo telefono lo segna in classifica.'
      : (this.cartaCodice
      ? 'Questo è il codice della tua ultima sfida di carta. Copialo e mandalo: chi lo incolla gioca la stessa identica partita.'
      : 'Crea una sfida, giocala fino in fondo, e il codice compare qui sotto.');`;

/* ============================= 5) e 6) la classifica che si dipinge */
const A5 = `  /* --------------------------------------------------- la classifica */
  async apriClassifica(){
    goScreen($('classifica'));
    const box = $('claLista');`;
const B5 = `  /* --------------------------------------------- i testa a testa */
  /* =====================================================================
     LA CLASSIFICA CHE NON HA BISOGNO DI NESSUNO (voce #136).

     Si dipinge PRIMA di parlare col server e non torna mai indietro a
     mani vuote: questa schermata, a rete spenta, era una riga di scuse
     e basta. Da qui in avanti chi non ha campo ci trova comunque i suoi
     testa a testa, che e' l'unica classifica che nessuno gli puo'
     spegnere.

     L'ordine lo decide Amici.ordinata: punti, poi scarto, poi giocate,
     poi nome. Il numero grosso a destra sono i PUNTI (tre per una
     vinta, uno per un pari); il conto per esteso sta sotto il nome,
     perche' un «7» da solo non dice se sono vittorie o partite.
     ===================================================================== */
  dipingiAmici(){
    const box = $('claAmici');
    if(!box) return;
    const righe = Amici.ordinata();
    if(!righe.length){
      box.innerHTML = '<div class="sf-vuota">Ancora nessun testa a testa. Manda una SFIDA DI CARTA a un amico: ' +
                      'quando ti rimanda il suo codice ESITO lo incolli lì, scrivi il suo nome, e la riga compare qui. ' +
                      'Non serve la rete, e non serve che nessuno dei due abbia un conto.</div>';
      return;
    }
    let h = '', i = 0;
    for(const r of righe){
      i++;
      h += '<div class="clariga">' +
             '<span class="cp">' + i + '</span>' +
             '<span class="cn">' + esc(r.n) +
               '<small>' + (r.v|0) + ' vinte · ' + (r.p|0) + ' pari · ' + (r.s|0) + ' perse · ' +
               (r.mf|0) + '-' + (r.sf|0) + ' gol</small></span>' +
             '<span class="cq">' + Amici.punti(r) + '</span>' +
           '</div>';
    }
    /* IL TETTO SI DICHIARA QUANDO SI TOCCA, non prima: una riga che
       avverte di un limite lontano e' una riga che nessuno legge. */
    if(righe.length >= AMICI_TETTO)
      h += '<div class="sf-vuota">La classifica tiene ' + AMICI_TETTO + ' amici: quando ne arriva uno nuovo ' +
           'esce il più vecchio.</div>';
    box.innerHTML = h;
  },

  /* --------------------------------------------------- la classifica */
  async apriClassifica(){
    goScreen($('classifica'));
    /* PRIMA i testa a testa, POI il server: se questa riga stesse sotto,
       un telefono senza campo non vedrebbe mai la sua classifica (i tre
       return qui sotto se ne vanno tutti prima) */
    this.dipingiAmici();
    const box = $('claLista');`;

/* ====================== 7) la causa per il terzo codice nel campo */
const A6 = `      case 'rose-corte':       return 'Il codice non porta due squadre complete.';`;
const B6 = `      case 'e-un-risultato':   return 'Questo è il RISULTATO di una sfida, tornato indietro: non è una partita da giocare. Scrivi qui sotto il nome dell\\'amico e premi SEGNA IL RISULTATO.';
      case 'rose-corte':       return 'Il codice non porta due squadre complete.';`;

/* ================================================== 8) i comandi */
const A7 = `$('btnSfCartaChiudi').addEventListener('click', ()=>{ Audio5.unlock(); hide($('sfidaCarta')); });`;
const B7 = `$('btnSfCartaSegna').addEventListener('click', ()=>{ Audio5.unlock(); Sfida.segnaCarta(); });
/* Invio nel campo del nome vale SEGNA IL RISULTATO: chi ha appena
   scritto il nome non deve cercare il bottone piu' in basso */
$('sfCartaAmico').addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); Audio5.unlock(); Sfida.segnaCarta(); } });
$('btnSfCartaChiudi').addEventListener('click', ()=>{ Audio5.unlock(); hide($('sfidaCarta')); });`;

/* ------------------------------------------------------------------ */
const src = fs.readFileSync(inFile, 'utf8');
const coppie = [[A1, B1], [A2, B2], [A3, B3], [A4, B4], [A5, B5], [A6, B6], [A7, B7]];
const guai = [];
coppie.forEach(([a], i) => {
  const n = src.split(a).length - 1;
  if (n !== 1) guai.push('ancora ' + (i + 1) + ': trovata ' + n + ' volte invece di 1');
});
if (guai.length) { console.error('FALLITO:\n  ' + guai.join('\n  ')); process.exit(1); }

let out = src;
for (const [a, b] of coppie) out = out.replace(a, b);

const attesi = [
  ['id="sfCartaAmico"', 1],
  ['id="btnSfCartaSegna"', 1],
  ['id="claAmici"', 1],
  ['#sfidaCarta{align-items:flex-start}', 1],
  ['  dipingiAmici(){', 1],
  ['    this.dipingiAmici();', 1],
  ["case 'e-un-risultato':", 1],
  /* quel che NON deve cambiare: la schermata SFIDA non si tocca, e la
     barra della CLASSIFICA ha ancora il suo bottone solo */
  ['id="btnSfidaCerca"', 1],
  ['id="btnSfidaCarta"', 1],
  ['id="btnSfidaClassifica"', 1],
  ['id="btnBackClassifica"', 1],
  ['id="claLista"', 1],
  ['const MOTORE_V = 2;', 1],
  ['const AMICI_TETTO = 20;', 1],
  ["const SAVE_KEY='calcetto_save_v4';", 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
/* LA SCHERMATA SFIDA DEV'ESSERE QUELLA DI IERI, BYTE PER BYTE: e' la
   misura della voce #135 messa a guardia dentro l'attrezzo, prima ancora
   che il cancello la misuri in pixel. Si confronta la PAGINA — dal
   titolo alla barra dei bottoni — e non i due pannelli sovrapposti, che
   stanno dentro lo stesso div ma non occupano un pixel del flusso. */
const fetta = t => {
  const a = t.indexOf('<div id="sfida" class="ov hidden">');
  const b = t.indexOf('  <div id="sfidaCodice" class="hidden">');
  return a >= 0 && b > a ? t.slice(a, b) : '';
};
if (!fetta(src) || fetta(src) !== fetta(out)) rotti.push('la schermata SFIDA e\' cambiata: doveva restare identica');
if (/#sfidaCodice\{align-items:flex-start\}/.test(out)) rotti.push('e\' stato toccato anche il pannello del cambio telefono');
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la classifica degli amici si vede e si tocca: sette ancore, +' + (out.length - src.length) + ' caratteri');
console.log('    da   ' + inFile + '  (' + src.length + ' caratteri)');
console.log('    a    ' + outFile + '  (' + out.length + ' caratteri)');
console.log('    la schermata SFIDA e\' identica byte per byte');
console.log('    prova:  node strumenti/_q-amici.js --solo D' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
