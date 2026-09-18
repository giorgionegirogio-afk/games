/* =====================================================================
   _t-vibrazione-intensita.js — LA VIBRAZIONE HA TRE INTENSITA'
   (voce #112, compito 2, secondo compito del ramo voce-112-spiccioli-ux).

   IL PERCHE'. Puro contorno, zero simulazione (il due-versioni resta
   0/60 a ogni taglia: buzz() e' l'unico emettitore della vibrazione, e
   la vibrazione non tocca dado(), una decisione di gioco o uno stato
   che la CPU legge — e' un effetto sull'hardware, non sulla partita).

   OGGI SAVE.vib E' UN BOOLEANO: ON o OFF, senza gradazione. Chi ha
   bisogno di una vibrazione piu' debole (batteria scarica, sensibilita'
   diversa, un telefono vecchio che vibra piu' forte del previsto) non
   ha altra scelta che spegnerla del tutto. La cura aggiunge una terza
   dimensione — QUANTO — senza toccare la prima — SE.

   CURA 1 — SAVE.vibInt, 0/1/2 = leggera/normale/forte, default 1 (la
   voce neutra: chi ha gia' un salvataggio non sente nessuna differenza
   finche' non tocca la riga nuova). Scritta in defaultSave e sanificata
   in loadSave sullo STESSO modello di sponde/taglia: solo le tre chiavi
   conosciute, un salvataggio manomesso non puo' chiedere una quarta
   intensita'.

   CURA 2 — LA RIGA #vibRow, copiata 1:1 dal pattern .diff-row/
   refreshDiffRows (markup ~riga 3656, wiring ~riga 40203): tre bottoni
   .vib con data-vi="0/1/2", una funzione refreshVibRow() che sincronizza
   .sel con SAVE.vibInt (lo stesso ??1 di tutto il resto: un salvataggio
   vecchio senza vibInt si legge come Normale), un listener che scrive
   SAVE.vibInt, persiste, ridisegna E fa sentire la scelta con un
   buzz(30) di assaggio — senza assaggio il bottone sarebbe silenzioso
   quanto un'etichetta, e nessuno saprebbe se ha davvero cambiato
   qualcosa. refreshVibRow() e' richiamata dentro refreshImpostUI(),
   quindi si ridisegna a OGNI apertura di IMPOSTAZIONI e al primo avvio
   (refreshImpostUI() gira gia' una volta a pagina caricata) senza un
   secondo punto di chiamata da tenere sincronizzato a mano.

   CURA 3 — buzz(p) scala la durata per [0.5,1,1.6][SAVE.vibInt??1]
   PRIMA di navigator.vibrate. SCELTA DICHIARATA: un array
   [vibra,pausa,vibra,...] si scala TUTTO uniformemente (ogni elemento,
   pause comprese) invece di scalare solo gli elementi pari (le
   vibrazioni) e lasciare le pause fisse. La cadenza (il rapporto fra
   vibrazione e pausa) resta la stessa forma percepita, cambia solo la
   lunghezza totale del gesto — scalare solo meta' degli elementi
   avrebbe allungato le vibrazioni SENZA allungare le pause fra loro,
   spostando il ritmo invece della sola intensita' percepita, che non e'
   quello che "leggera/forte" promette a chi lo sceglie.
   L'INTERRUTTORE ON/OFF RESTA IL PRIMO CANCELLO: la guardia
   `SAVE.vib!==false` di prima non si tocca, sta ancora fuori da tutto
   il resto. A vib spento buzz esce subito come faceva ieri: vibInt non
   ha voce in capitolo finche' la vibrazione stessa e' spenta.

   uso:  node strumenti/_t-vibrazione-intensita.js --out fuori/a2-vibint.html
         node strumenti/_t-vibrazione-intensita.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/a2-vibint.html'));

/* CONTROLLO ANTI-ATTESTAZIONE: se vibInt esiste gia' da qualche parte
   nel file (segno che qualcuno ha gia' provato a coprire il buco),
   questo attrezzo si ferma invece di sovrapporsi in silenzio. */
const srcGrezzo = fs.readFileSync(inFile, 'utf8');
if (srcGrezzo.indexOf('vibInt') >= 0) {
  console.error('FALLITO: "vibInt" esiste gia\' nel file — controllare prima di applicare.');
  process.exit(1);
}

const ANCORE = [

/* 1/5 — defaultSave: SAVE.vibInt, default 1 (normale), accanto a vib. */
{
  nome: '1/6 defaultSave: SAVE.vibInt (0/1/2, default 1)',
  cerca:
`    v:4, mute:false, vib:true, diff:1, touch:0,
`,
  metti:
`    v:4, mute:false, vib:true, diff:1, touch:0,
    /* VIBINT: l'intensita' della vibrazione, 0/1/2 = leggera/normale/
       forte. Default 1 = normale: chi ha gia' un salvataggio non sente
       nessuna differenza finche' non tocca la riga nuova (voce #112,
       compito 2). */
    vibInt:1,
`,
},

/* 2/5 — loadSave: sanificazione sul modello di sponde/taglia. */
{
  nome: '2/6 loadSave: vibInt sanificato, solo 0/1/2',
  cerca:
`    if(typeof j.vib==='boolean') s.vib=j.vib;
`,
  metti:
`    if(typeof j.vib==='boolean') s.vib=j.vib;
    /* stesso modello di sponde/taglia: solo le tre chiavi conosciute,
       un salvataggio manomesso non puo' chiedere una quarta intensita'
       (voce #112, compito 2) */
    if([0,1,2].indexOf(j.vibInt)>=0) s.vibInt=j.vibInt;
`,
},

/* 3/5 — markup: la riga #vibRow, subito sotto VIBRAZIONE: ON/OFF. */
{
  nome: '3/6 markup IMPOSTAZIONI: #vibRow, tre bottoni .vib',
  cerca:
`      <button class="voce sw" id="btnSetVib">VIBRAZIONE: ON</button>
`,
  metti:
`      <button class="voce sw" id="btnSetVib">VIBRAZIONE: ON</button>
      <!-- LE TRE INTENSITA', stesso pattern markup di .diff-row (~riga
           3656): tre bottoni, la selezione segue SAVE.vibInt invece di
           G.diff. Il "sel" di serie qui sotto e' solo lo stato a vuoto:
           refreshVibRow lo riscrive a ogni apertura, cosi' il markup
           statico non puo' mentire se il salvataggio dice altro
           (voce #112, compito 2). -->
      <div class="diff-row" id="vibRow">
        <button class="vib" data-vi="0">Leggera</button>
        <button class="vib sel" data-vi="1">Normale</button>
        <button class="vib" data-vi="2">Forte</button>
      </div>
`,
},

/* 4/5 — buzz(p): scala la durata per l'intensita' prima di vibrare. */
{
  nome: '4/6 buzz(p): scala la durata per [0.5,1,1.6][SAVE.vibInt]',
  cerca:
`function buzz(p){ try{ if(SAVE.vib!==false && navigator.vibrate) navigator.vibrate(p); }catch(e){} }`,
  metti:
`/* VIBINT scala la durata PRIMA di navigator.vibrate: [0.5,1,1.6] per
   leggera/normale/forte, SAVE.vibInt??1 se il salvataggio e' vecchio.
   SCELTA DICHIARATA: un array [vibra,pausa,vibra,...] si scala TUTTO
   uniformemente (ogni elemento, pause comprese) invece di scalare solo
   gli elementi pari (le vibrazioni) e lasciare le pause fisse — cosi'
   la cadenza percepita resta la stessa forma, cambia solo la lunghezza
   totale del gesto. L'interruttore ON/OFF resta il primo cancello: a
   SAVE.vib===false buzz esce subito come faceva prima, vibInt non ha
   voce in capitolo (voce #112, compito 2). */
function buzz(p){
  try{
    if(SAVE.vib!==false && navigator.vibrate){
      const f=[0.5,1,1.6][SAVE.vibInt??1];
      navigator.vibrate(Array.isArray(p) ? p.map(x=>Math.round(x*f)) : Math.round(p*f));
    }
  }catch(e){}
}`,
},

/* 5/5 — refreshDiffRows/refreshVibRow: stesso pattern binario, wiring
   gemello subito sotto quello della difficolta'. */
{
  nome: '5/6 refreshVibRow + wiring dei tre bottoni .vib',
  cerca:
`function refreshDiffRows(){
  document.querySelectorAll('.diff').forEach(b=>b.classList.toggle('sel', +b.dataset.d===G.diff));
}
document.querySelectorAll('.diff').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    G.diff=+b.dataset.d;
    refreshDiffRows();
    persistSave();
  });
});
refreshDiffRows();`,
  metti:
`function refreshDiffRows(){
  document.querySelectorAll('.diff').forEach(b=>b.classList.toggle('sel', +b.dataset.d===G.diff));
}
document.querySelectorAll('.diff').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    G.diff=+b.dataset.d;
    refreshDiffRows();
    persistSave();
  });
});
refreshDiffRows();
/* vibrazione: tre intensita' leggera/normale/forte, stesso pattern
   binario di refreshDiffRows qui sopra — SAVE.vibInt al posto di
   G.diff, persistSave perche' vibInt vive nel salvataggio e non in G
   (voce #112, compito 2) */
function refreshVibRow(){
  document.querySelectorAll('.vib').forEach(b=>b.classList.toggle('sel', +b.dataset.vi===(SAVE.vibInt??1)));
}
document.querySelectorAll('.vib').forEach(b=>{
  b.addEventListener('click', ()=>{
    SAVE.vibInt=+b.dataset.vi;
    persistSave();
    refreshVibRow();
    buzz(30);   // assaggio: il giocatore SENTE l'intensita' appena scelta
  });
});
refreshVibRow();`,
},

/* 6/6 — refreshImpostUI: refreshVibRow() chiamata a ogni apertura di
   IMPOSTAZIONI e al primo avvio (refreshImpostUI gira gia' una volta a
   pagina caricata, ~riga 42761), senza un secondo punto da tenere
   sincronizzato a mano. */
{
  nome: '6/6 refreshImpostUI: chiama refreshVibRow()',
  cerca:
`     refreshComandiUI, cosi' esiste UNA sola frase per quello stato. */
  refreshComandiUI();
}`,
  metti:
`     refreshComandiUI, cosi' esiste UNA sola frase per quello stato. */
  refreshComandiUI();
  /* LA RIGA DELLE TRE INTENSITA' SI RIDIPINGE QUI, come le altre righe
     di questa funzione: a ogni apertura di IMPOSTAZIONI e al primo
     avvio, senza un secondo punto di chiamata (voce #112, compito 2). */
  refreshVibRow();
}`,
},

];

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

const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['vibInt:1,', 1],
  ["if([0,1,2].indexOf(j.vibInt)>=0) s.vibInt=j.vibInt;", 1],
  ['<div class="diff-row" id="vibRow">', 1],
  ['const f=[0.5,1,1.6][SAVE.vibInt??1];', 1],
  ['function refreshVibRow(){', 1],
  ['refreshVibRow();', 3],   // definizione + wiring iniziale + chiamata dentro refreshImpostUI
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
