/* =====================================================================
   _t-sponde-interruttore.js — L'INTERRUTTORE SPONDE (voce #87, compito 1,
   primo compito del ramo voce-87-rimesse-angoli).

   IL PERCHE'. Il committente vuole due modi di campo: la GABBIA (il
   gioco di oggi, ogni sponda rimbalza) e il CAMPO VERO (fasce con
   rimessa, fondo con angolo o rinvio). Questo compito non tocca ancora
   la fisica del pallone (ballWalls resta identico al bit, nessun
   consumatore nuovo): mette solo l'interruttore, la sua riga di
   interfaccia, la fotografia di partita G.campoVero e due getter di
   test. Il banco strumenti/_q-battute.js nasce PRIMA di questo attrezzo
   e lo condanna: dopo l'attrezzo restano 5 prove rosse su 7, perche' il
   resto del meccanismo (rimessa, angolo, rinvio, battuta, TIRA spento)
   non esiste ancora — e' la condanna a registro che i compiti successivi
   porteranno al verde, uno alla volta.

   SAVE.sponde in {'gabbia','campo'}, default 'gabbia' (campo additivo:
   chi gioca oggi non vede cambiare nulla). UI gemella di #taglieRow +
   refreshTaglieRow (CALCETTO-il-gioco.html, righe verificate col grep
   sull'HEAD di apertura del cantiere, commit 7ed570a): #spondeRow con
   due bottoni data-s, bloccata su CAMPO VERO a taglia 11 (classe
   'disabilitata' + il refresh della riga taglie richiama quello delle
   sponde, cosi' cambiare taglia aggiorna anche il blocco). A startMatch,
   DOPO che la taglia effettiva e' nota: G.campoVero = (TAGLIA===11) ||
   SAVE.sponde==='campo' — mai riletto da SAVE a partita in corso.

   LEGGE DEI SORTEGGI: zero dado() nuovi. defaultSave/loadSave/l'HTML/i
   refresh/lo startMatch non ne fanno (letto qui prima di scrivere questo
   attrezzo) — sono salvataggio, interfaccia e una fotografia di stato,
   non intelligenza artificiale. Il due-versioni a 5/7-gabbia resta a 0
   divergenze per costruzione: nessun ramo del gioco legge ancora
   G.campoVero o SAVE.sponde fuori da questo stesso attrezzo.

   uso:  node strumenti/_t-sponde-interruttore.js --out fuori/sponde.html
         node strumenti/_t-sponde-interruttore.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/sponde.html'));

const ANCORE = [

/* 1 — CSS: la pastiglia .sponde nasce nella stessa regola di base di
   .diff/.tbtn/.taglia/.ment, cosi' eredita bordo, carattere e cursore
   senza ripetere le sei dichiarazioni. */
{
  nome: '1/9 CSS: .sponde entra nella regola di base dei bottoni a pastiglia',
  cerca: `.diff,.tbtn,.taglia,.ment{\n`,
  metti: `.diff,.tbtn,.taglia,.ment,.sponde{\n`,
},

/* 2 — CSS: lo stato scelto e lo stato bloccato. Stesso disegno di .ment
   (small in piccolo, .sel col gesso pieno); .disabilitata attutisce il
   colore e spegne il dito, senza nascondere la scelta gia' fatta (a 11
   la pastiglia resta su CAMPO VERO selezionato, solo non si preme piu'). */
{
  nome: '2/9 CSS: .sponde small/sel/disabilitata, gemelle di .ment',
  cerca: `.taglia.sel small{opacity:.9}\n`,
  metti: `.taglia.sel small{opacity:.9}\n` +
`/* LE SPONDE: gabbia o campo vero, stessa pastiglia delle taglie e delle
   mentalita' (voce #87, compito 1) — una scelta fra due, ricordata nel
   salvataggio. A 11 la riga si blocca su CAMPO VERO: .disabilitata spegne
   solo il dito, il gesso pieno di .sel resta a dire cosa e' scelto. */
.sponde small{display:block;font-weight:400;font-size:10px;letter-spacing:.14em;opacity:.75;margin-top:2px}
.sponde.sel{color:#12210f;background:var(--gesso);border-color:var(--gesso);font-weight:700}
.sponde.sel small{opacity:.9}
.sponde.disabilitata{opacity:.55;pointer-events:none}
`,
},

/* 3 — defaultSave: il campo nuovo, accanto a taglia, con lo stesso
   commento in linea delle altre scelte di rosa. */
{
  nome: '3/9 defaultSave: SAVE.sponde nasce a \'gabbia\'',
  cerca: `    taglia:5,                      // taglia di rosa dell'amichevole: 5, 7 o 11\n`,
  metti: `    taglia:5,                      // taglia di rosa dell'amichevole: 5, 7 o 11\n` +
`    /* SPONDE: gabbia (il gioco di oggi, ogni sponda rimbalza) o campo
       vero (rimesse laterali, angoli, rinvii dal fondo). Default gabbia:
       campo additivo, chi gioca oggi non vede cambiare nulla (voce #87,
       compito 1). */
    sponde:'gabbia',
`,
},

/* 4 — loadSave: la sanificazione, una riga per campo come tutte le altre
   di questo blocco (pattern di moviola, riga sopra). */
{
  nome: '4/9 loadSave: sanificazione di SAVE.sponde',
  cerca: `    if(j.moviola===0||j.moviola===1) s.moviola=j.moviola;\n`,
  metti: `    if(j.moviola===0||j.moviola===1) s.moviola=j.moviola;\n` +
`    if(j.sponde==='campo'||j.sponde==='gabbia') s.sponde=j.sponde;\n`,
},

/* 5 — HTML: la riga #spondeRow, subito sotto #taglieRow, stesso pattern
   (.diff-row + due bottoni data-*). */
{
  nome: '5/9 HTML: #spondeRow sotto #taglieRow',
  cerca:
`        <div class="diff-row" id="taglieRow">
          <button class="taglia sel" data-t="5">5 contro 5 <small>la gabbia</small></button>
          <button class="taglia" data-t="7">7 contro 7 <small>il campetto</small></button>
          <button class="taglia" data-t="11">11 contro 11 <small>il campo grande</small></button>
        </div>
`,
  metti:
`        <div class="diff-row" id="taglieRow">
          <button class="taglia sel" data-t="5">5 contro 5 <small>la gabbia</small></button>
          <button class="taglia" data-t="7">7 contro 7 <small>il campetto</small></button>
          <button class="taglia" data-t="11">11 contro 11 <small>il campo grande</small></button>
        </div>
        <!-- LE SPONDE. Gabbia (di sempre) o campo vero (rimesse, angoli,
             rinvii); a 11 il campo vero e' obbligatorio e la riga si
             blocca (voce #87, compito 1). -->
        <div class="eti">Sponde</div>
        <div class="diff-row" id="spondeRow">
          <button class="sponde sel" data-s="gabbia">LA GABBIA <small>si gioca di sponda</small></button>
          <button class="sponde" data-s="campo">IL CAMPO VERO <small>rimesse, angoli e rinvii</small></button>
        </div>
`,
},

/* 6 — JS: refreshTaglieRow richiama refreshSpondeRow, cosi' cambiare
   taglia aggiorna anche il blocco a 11 (funzione dichiarata sotto: le
   dichiarazioni di funzione sono issate in cima allo scope, l'ordine
   testuale non conta). */
{
  nome: '6/9 JS: refreshTaglieRow richiama refreshSpondeRow',
  cerca:
`function refreshTaglieRow(){
  document.querySelectorAll('.taglia').forEach(b=>b.classList.toggle('sel', +b.dataset.t===(SAVE.taglia||5)));
}
`,
  metti:
`function refreshTaglieRow(){
  document.querySelectorAll('.taglia').forEach(b=>b.classList.toggle('sel', +b.dataset.t===(SAVE.taglia||5)));
  refreshSpondeRow();
}
`,
},

/* 7 — JS: la funzione refreshSpondeRow e i suoi due bottoni, gemelli di
   refreshTaglieRow e dei suoi. Inserita subito prima della chiamata
   d'avvio finale, cosi' il primo refreshTaglieRow() (che ora richiama
   anche refreshSpondeRow) trova gia' la funzione e i bottoni pronti. */
{
  nome: '7/9 JS: refreshSpondeRow + listener dei due bottoni',
  cerca:
`document.querySelectorAll('.taglia').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    SAVE.taglia=+b.dataset.t;
    refreshTaglieRow();
    persistSave();
  });
});
refreshTaglieRow();
`,
  metti:
`document.querySelectorAll('.taglia').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    SAVE.taglia=+b.dataset.t;
    refreshTaglieRow();
    persistSave();
  });
});
/* sponde: gabbia o campo vero. A 11 la scelta e' bloccata su CAMPO VERO
   (classe disabilitata): il refresh della riga taglie la richiama sempre
   (vedi sopra), cosi' cambiare taglia aggiorna anche il blocco (voce
   #87, compito 1). */
function refreshSpondeRow(){
  const bloccata=(SAVE.taglia||5)===11;
  document.querySelectorAll('.sponde').forEach(b=>{
    const attuale=bloccata?'campo':(SAVE.sponde||'gabbia');
    b.classList.toggle('sel', b.dataset.s===attuale);
    b.classList.toggle('disabilitata', bloccata);
  });
}
document.querySelectorAll('.sponde').forEach(b=>{
  b.addEventListener('click', ()=>{
    if((SAVE.taglia||5)===11) return;
    Audio5.unlock(); Audio5.beep(500);
    SAVE.sponde=b.dataset.s;
    refreshSpondeRow();
    persistSave();
  });
});
refreshTaglieRow();
`,
},

/* 8 — startMatch: la fotografia di G.campoVero, DOPO che setTaglia ha
   gia' fissato TAGLIA (opts.size vince su SAVE.taglia, come sempre). */
{
  nome: '8/9 startMatch: G.campoVero fotografato dopo setTaglia',
  cerca: `  setTaglia(opts.size || SAVE.taglia || 5);\n`,
  metti: `  setTaglia(opts.size || SAVE.taglia || 5);\n` +
`  /* LA FOTOGRAFIA DI SPONDE, a taglia ormai nota (voce #87, compito 1).
     A 11 il campo vero e' sempre acceso, qualunque cosa dica SAVE.sponde
     (la riga di GIOCA lo blocca gia' a schermo, questa e' la seconda
     guardia lato motore, quella che non si aggira toccando il
     salvataggio a mano). Letta una volta sola, mai da SAVE a partita in
     corso: vive su G come G.mode/G.diff, per tutta la partita. */
  G.campoVero = (TAGLIA===11) || SAVE.sponde==='campo';
`,
},

/* 9 — window.__test: i due getter del banco. campoVero legge la
   fotografia; battuta torna null finche' il compito 2 non crea
   G.battuta — nasce vuoto adesso cosi' il banco e' completo dal primo
   giorno e il compito 2 non deve piu' toccare __test per questo. */
{
  nome: '9/9 __test: get campoVero() e get battuta()',
  cerca: `  get score(){ return G.score; },\n`,
  metti:
`  /* L'INTERRUTTORE DELLE SPONDE, per il banco (voce #87, compito 1).
     campoVero fotografa cio' che startMatch ha deciso: mai ricalcolato,
     mai riletto da SAVE a partita in corso. battuta e' un oggetto
     nuovo (Object.assign) a ogni lettura, cosi' il banco non puo'
     mutare lo stato vero tenendo un riferimento vivo. */
  get campoVero(){ return !!G.campoVero; },
  get battuta(){ return G.battuta ? Object.assign({},G.battuta) : null; },
  get score(){ return G.score; },
`,
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
/* CONTEGGI A DELTA (come in _t-tavola-vernice.js): il file puo' gia'
   contenere altri commenti che citano questi stessi frammenti.
   refreshSpondeRow(); vale +2: una chiamata dentro refreshTaglieRow
   (ancora 6) e una dentro il listener di click (ancora 7). */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['.diff,.tbtn,.taglia,.ment,.sponde{', 1],
  ['.sponde.disabilitata{opacity:.55;pointer-events:none}', 1],
  ["sponde:'gabbia',", 1],
  ["if(j.sponde==='campo'||j.sponde==='gabbia') s.sponde=j.sponde;", 1],
  ['id="spondeRow"', 1],
  ['refreshSpondeRow();', 2],
  ['function refreshSpondeRow(){', 1],
  ["G.campoVero = (TAGLIA===11) || SAVE.sponde==='campo';", 1],
  ['get campoVero(){ return !!G.campoVero; },', 1],
  ['get battuta(){ return G.battuta ? Object.assign({},G.battuta) : null; },', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
