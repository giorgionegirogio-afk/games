/* =====================================================================
   _t-mira-ui.js — LA RIGA IN IMPOSTAZIONI PER LA MIRA GUIDATA (voce
   #113, compito 2). Il compito 1 ha gia' portato SAVE.miraGuidata in
   {'pieno','essenziale'} (default 'pieno'), G.miraGuidata fissato in
   startMatch e il ramo in switchControlled: MANCAVA solo la UI per
   cambiare il flag a dito. Questo attrezzo aggiunge SOLO contorno --
   nessun tocco a startMatch/switchControlled/Sfida.*, ZERO dado().

   MODELLO: _t-vibrazione-intensita.js (voce #112, compito 2) per
   markup+wiring, PIU' _t-vib-css.js (voce #112, correzione revisione
   compito 2) per come una nuova classe di bottoni entra nei due
   selettori CONDIVISI (~riga 519 e ~riga 530) invece di rendere col
   default del browser.

   LA LEZIONE #112 (CRITICA, e' il motivo per cui la classe e' NUOVA
   invece di essere .vib o .sponde riciclate a peso morto): riusare la
   classe .vib O .sponde COSI' COM'E' avrebbe fatto catturare i due
   bottoni nuovi dentro querySelectorAll('.vib') / querySelectorAll(
   '.sponde') gia' esistenti (refreshVibRow, refreshSpondeRow) --
   b.dataset.vi o b.dataset.s sarebbero undefined sui bottoni della
   mira guidata, e quei refresh li spegnerebbero (classList.toggle(
   'sel', false)) o, peggio, il listener .vib scriverebbe
   SAVE.vibInt=NaN al click. La cura vera del #112 non era "riusa il
   NOME della classe di un'altra riga", era "riusa i SELETTORI CSS
   CONDIVISI della famiglia (.diff,.tbtn,.taglia,.ment,.sponde,.vib)":
   questo attrezzo aggiunge un QUINTO/SESTO nome, .mira, a quegli
   stessi due selettori -- zero dichiarazioni CSS nuove per il colore/
   bordo/font di base, solo il sottotitolo piccolo (.mira small) sul
   modello di .taglia small/.sponde small/.ment small, che nel file
   sono gia' tre blocchi separati (mai stati un selettore condiviso).

   COSA FA, sito per sito (5 ancore):
     1. CSS ~riga 519: .mira entra nel selettore di famiglia (font,
        colore, bordo, cursore -- lo stile "non selezionato").
     2. CSS ~riga 530: .mira.sel entra nel selettore di famiglia dello
        stato scelto (il gesso pieno).
     3. CSS ~riga 545: due righe nuove, .mira small e .mira.sel small,
        sul modello letterale di .ment small/.ment.sel small qui sopra
        (il sottotitolo onesto ha bisogno di uno stile suo, come le
        altre tre righe a bottoni con sottotitolo).
     4. Markup IMPOSTAZIONI, sotto SOTTOTITOLI (sezione Accessibilita'
        -- la mira guidata e' una feature di accessibilita' motoria,
        vedi la specifica): #miraRow, due bottoni .mira con
        data-mg="pieno"/"essenziale" e un <small> per ciascuno che
        dice la VERITA' (essenziale non aiuta la mira, restringe solo
        lo SCOPE del salto di controllo ai palloni alti).
     5. Wiring JS, gemello di refreshVibRow (~riga 40700): refreshMiraRow()
        sincronizza .sel E aria-pressed insieme per ogni bottone (la
        lezione di accessibilita' del #112: un valore per ogni
        refresh, mai attestato una volta sola), un listener per
        bottone scrive SAVE.miraGuidata/persistSave/refreshMiraRow, e
        una chiamata in piu' dentro refreshImpostUI() cosi' la riga si
        ridipinge a ogni apertura di IMPOSTAZIONI e al primo avvio,
        senza un secondo punto di chiamata da tenere sincronizzato a
        mano (esattamente come refreshVibRow gia' fa).

   ZERO tocchi a startMatch/switchControlled/Sfida.gioca/Sfida.guarda:
   il guardiano verifica a delta che le chiamate a dado() non cambino
   di numero, e che le tre stringhe del meccanismo (fissazione di
   G.miraGuidata, il ramo essenziale in switchControlled, le due sfide
   forzate a 'pieno') restino IDENTICHE fra src e out.

   uso:  node strumenti/_t-mira-ui.js --out fuori/mira-ui.html
         node strumenti/_t-mira-ui.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/mira-ui.html'));

/* CONTROLLO ANTI-ATTESTAZIONE: se la riga esiste gia' (id="miraRow" o
   la funzione refreshMiraRow), questo attrezzo si ferma invece di
   sovrapporsi in silenzio. */
const srcGrezzo = fs.readFileSync(inFile, 'utf8');
if (srcGrezzo.indexOf('id="miraRow"') >= 0 || srcGrezzo.indexOf('function refreshMiraRow(') >= 0) {
  console.error('FALLITO: la riga della mira guidata esiste gia\' nel file — controllare prima di applicare.');
  process.exit(1);
}

const ANCORE = [

/* 1/5 — selettore di famiglia: .mira eredita font/colore/bordo/cursore
   dallo stesso posto di .vib (voce #112, correzione revisione). */
{
  nome: '1/5 CSS ~519: .mira nel selettore di famiglia (non selezionato)',
  cerca:
`.diff,.tbtn,.taglia,.ment,.sponde,.vib{
`,
  metti:
`.diff,.tbtn,.taglia,.ment,.sponde,.vib,.mira{
`,
},

/* 2/5 — selettore di famiglia dello stato scelto: .mira.sel eredita il
   gesso pieno dallo stesso posto di .vib.sel. */
{
  nome: '2/5 CSS ~530: .mira.sel nel selettore di famiglia (selezionato)',
  cerca:
`.diff.sel,.tbtn.sel,.taglia.sel,.vib.sel{color:#12210f;background:var(--gesso);border-color:var(--gesso);font-weight:700}`,
  metti:
`.diff.sel,.tbtn.sel,.taglia.sel,.vib.sel,.mira.sel{color:#12210f;background:var(--gesso);border-color:var(--gesso);font-weight:700}`,
},

/* 3/5 — il sottotitolo piccolo, sul modello letterale di .ment small/
   .ment.sel small qui sopra (mai stati un selettore condiviso: sono
   gia' tre blocchi separati, .taglia/.sponde/.ment, uno per famiglia). */
{
  nome: '3/5 CSS ~545: .mira small + .mira.sel small (il sottotitolo onesto)',
  cerca:
`.ment.sel small{opacity:.9}`,
  metti:
`.ment.sel small{opacity:.9}
/* LA MIRA GUIDATA: pieno o essenziale, stessa pastiglia di sponde/
   taglia/mentalita' (voce #113, compito 2) -- una scelta fra due,
   ricordata nel salvataggio. Il colore/sfondo/bordo di base e da
   selezionato arrivano dai due selettori condivisi qui sopra (.mira e
   .mira.sel sono gia' elencati li'): qui restano solo il sottotitolo
   piccolo e la sua opacita' da selezionato, sullo stesso modello di
   .sponde/.taglia/.ment -- la lezione del #112 (compito 2, correzione
   revisione) e' che un bottone copiato SENZA i selettori condivisi
   rende col default del browser e lo stato scelto e' invisibile. */
.mira small{display:block;font-weight:400;font-size:10px;letter-spacing:.14em;opacity:.75;margin-top:2px}
.mira.sel small{opacity:.9}`,
},

/* 4/5 — markup: la riga #miraRow, in Accessibilita' (feature di
   accessibilita' motoria, vedi la specifica), subito sotto SOTTOTITOLI. */
{
  nome: '4/5 markup IMPOSTAZIONI: #miraRow, due bottoni .mira',
  cerca:
`      <button class="voce sw sola" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio — a video</small></button>
`,
  metti:
`      <button class="voce sw sola" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio — a video</small></button>
      <!-- MIRA GUIDATA (voce #113, compito 2). NON e' un aiuto alla
           direzione o alla precisione del tiro: la geometria del cono
           filtrante e dell'errore angolare (#88) resta intatta. E' lo
           SCOPE del salto di controllo che gia' esiste da sempre
           (switchControlled, #88) dopo un passaggio/cross umano con
           destinatario dichiarato -- 'pieno' salta per qualunque
           passaggio o cross, 'essenziale' lo restringe ai soli cross/
           palloni alti, lasciando il controllo sul compagno piu'
           vicino per i passaggi corti a terra. Stesso pattern markup
           di .diff-row (~riga 3656, #vibRow): la classe .mira e' gia'
           nei due selettori CSS condivisi (~righe 519 e 530), cosi' i
           due bottoni e lo stato .sel non rendono col default del
           browser (lezione #112, compito 2, correzione revisione).
           Testo/classe/aria-pressed si scrivono in refreshMiraRow,
           chiamata da refreshImpostUI. -->
      <div class="eti">Mira guidata</div>
      <div class="diff-row" id="miraRow">
        <button class="mira sel" data-mg="pieno">PIENO <small>il controllo salta al ricevente su ogni passaggio e cross</small></button>
        <button class="mira" data-mg="essenziale">ESSENZIALE <small>il salto resta solo su cross e palloni alti, non sui passaggi corti</small></button>
      </div>
`,
},

/* 5/5 — wiring: refreshMiraRow (gemella di refreshVibRow qui sopra) +
   i due listener + la chiamata in piu' dentro refreshImpostUI(). */
{
  nome: '5/5 wiring: refreshMiraRow + i due bottoni + chiamata da refreshImpostUI',
  cerca:
`document.querySelectorAll('.vib').forEach(b=>{
  b.addEventListener('click', ()=>{
    SAVE.vibInt=+b.dataset.vi;
    persistSave();
    refreshVibRow();
    buzz(30);   // assaggio: il giocatore SENTE l'intensita' appena scelta
  });
});
refreshVibRow();`,
  metti:
`document.querySelectorAll('.vib').forEach(b=>{
  b.addEventListener('click', ()=>{
    SAVE.vibInt=+b.dataset.vi;
    persistSave();
    refreshVibRow();
    buzz(30);   // assaggio: il giocatore SENTE l'intensita' appena scelta
  });
});
refreshVibRow();
/* MIRA GUIDATA: due pesi (pieno/essenziale) sullo SCOPE del salto di
   controllo, stesso pattern binario di refreshVibRow qui sopra --
   SAVE.miraGuidata al posto di SAVE.vibInt, persistSave perche' vive
   nel salvataggio, non in G (voce #113, compito 2). aria-pressed
   sincronizzato ACCANTO a ogni classList.toggle('sel',...), come i sei
   interruttori di refreshImpostUI (lezione di accessibilita' del
   #112): un valore per ogni refresh, mai attestato una volta sola. */
function refreshMiraRow(){
  document.querySelectorAll('.mira').forEach(b=>{
    const scelto = b.dataset.mg===(SAVE.miraGuidata||'pieno');
    b.classList.toggle('sel', scelto);
    b.setAttribute('aria-pressed', scelto?'true':'false');
  });
}
document.querySelectorAll('.mira').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    SAVE.miraGuidata=b.dataset.mg;
    persistSave();
    refreshMiraRow();
  });
});
refreshMiraRow();`,
},

];

/* 6a ancora, la chiamata dentro refreshImpostUI: separata dalle 5 sopra
   solo per tenere ogni blocco cerca/metti leggibile, ma applicata nello
   stesso giro (il guardiano sotto la conta comunque come parte del
   tutto). */
ANCORE.push({
  nome: '6/6 refreshImpostUI: chiama refreshMiraRow()',
  cerca:
`  /* LA RIGA DELLE TRE INTENSITA' SI RIDIPINGE QUI, come le altre righe
     di questa funzione: a ogni apertura di IMPOSTAZIONI e al primo
     avvio, senza un secondo punto di chiamata (voce #112, compito 2). */
  refreshVibRow();
}`,
  metti:
`  /* LA RIGA DELLE TRE INTENSITA' SI RIDIPINGE QUI, come le altre righe
     di questa funzione: a ogni apertura di IMPOSTAZIONI e al primo
     avvio, senza un secondo punto di chiamata (voce #112, compito 2). */
  refreshVibRow();
  /* LA RIGA DELLA MIRA GUIDATA SI RIDIPINGE QUI, stessa ragione di
     refreshVibRow qui sopra: a ogni apertura di IMPOSTAZIONI e al primo
     avvio, senza un secondo punto di chiamata (voce #113, compito 2). */
  refreshMiraRow();
}`,
});

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}

/* CONTEGGI A DELTA. */
const conta = (testo, s) => testo.split(s).length - 1;
const rotti = [];
const attesi = [
  ['.diff,.tbtn,.taglia,.ment,.sponde,.vib,.mira{', 1],
  ['.diff.sel,.tbtn.sel,.taglia.sel,.vib.sel,.mira.sel{', 1],
  ['.mira small{display:block;font-weight:400;font-size:10px;letter-spacing:.14em;opacity:.75;margin-top:2px}', 1],
  ['.mira.sel small{opacity:.9}', 1],
  ['<div class="diff-row" id="miraRow">', 1],
  ['data-mg="pieno"', 1],
  ['data-mg="essenziale"', 1],
  ['function refreshMiraRow(){', 1],
  ['refreshMiraRow();', 3],   // wiring iniziale + dentro il listener + dentro refreshImpostUI
];
for (const [s, n] of attesi) {
  const d = conta(out, s) - conta(src, s);
  if (d !== n) rotti.push(s + ' atteso +' + n + ', trovato +' + d);
}

/* IL MECCANISMO DEL COMPITO 1 NON SI TOCCA: questo attrezzo e' contorno
   puro. Le tre stringhe che decidono il comportamento devono restare
   IDENTICHE fra src e out (stesso numero di occorrenze, zero delta) --
   se una di queste tre cambiasse, la UI avrebbe toccato la simulazione,
   che e' esattamente cio' che il compito 2 non deve fare. */
const INVARIANTI = [
  `G.miraGuidata = (opts && opts.miraGuidata) || SAVE.miraGuidata || 'pieno';`,
  `if(G.miraGuidata==='essenziale' && G.ball.crossTo<0) destFinale = -1;`,
  `miraGuidata: 'pieno',`,
];
for (const s of INVARIANTI) {
  const d = conta(out, s) - conta(src, s);
  if (d !== 0) rotti.push('MECCANISMO (fuori perimetro per questo compito): "' + s + '" e\' cambiata di numero (delta ' + d + ')');
}
if (conta(out, 'dado()') !== conta(src, 'dado()')) rotti.push('il numero di chiamate a dado() e\' cambiato: zero dado() nuovo e\' un vincolo assoluto');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
