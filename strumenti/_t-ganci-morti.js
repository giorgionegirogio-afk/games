/* =====================================================================
   _t-ganci-morti.js — DODICI GANCI MORTI E BUGIE DI CONTORNO
   (31 agosto 2026, dal censimento del manuale: il fascio «ganci-morti»
   dell'appendice — riferimenti a elementi inesistenti, scritture che
   nessuno legge, commenti che non dicono piu' il vero. La simulazione
   non si tocca di una virgola).

   1.  ui.fieldRow agganciava un elemento #fieldRow che non esiste in
       pagina: la guardia `if(!ui.fieldRow) return` di buildFieldRow
       usciva sempre e le pastiglie .fchip non nascevano mai. Via il
       gancio, via il ramo (resta buildCampoLinea, che e' il lavoro
       vero), via i CSS orfani .field-row e .fchip.
   2.  ui.tourCoppa agganciava un elemento #tourCoppa mai esistito: le
       due scritture guardate di dataset.vuota non avvenivano. Tolti
       gancio e guardie.
   3.  #campiResta era nascosto per sempre (il commento accanto racconta
       gia' che la riga fu tolta apposta) ma uno scrittore JS continuava
       a riempirlo a ogni buildCampiUI: via il div, via lo scrittore,
       via i due CSS .campi-resta.
   4.  L'id campiNome sull'h1 CAMPI non e' letto da nessuno (il JS legge
       campoNome, che e' un altro elemento): via l'id.
   5.  tourPlaySub, il gemello senza crash del difetto della stagione:
       buildTorneoUI riscrive btnTourPlay.innerHTML con uno small suo,
       consumando lo small statico con id al primo giro — ma a differenza
       di seaPlaySub NESSUNO scrive mai in tourPlaySub, quindi far
       viaggiare l'id dentro gli innerHTML terrebbe in vita un elemento
       senza scrittori. La strada pulita e' l'altra: via il gancio e via
       lo small statico.
   6.  Otto chiamate Tut.notify con chiavi di un tutorial che non esiste
       piu' ('pass' x3, 'shot' x3, 'slide', 'move'): i passi vivi sono
       tieni/mira/raddoppio e le loro chiavi passano da verboUsato. Via
       le otto chiamate (e il blocco intero del 'move', che esisteva
       solo per quella chiamata: humanMove e' pura, niente si perde).
   7.  CSS morto dello splash: .spl-logo e figli (il titolo a lettere
       HTML) non hanno piu' markup — lo splash usa l'SVG .spl-logosvg.
       L'animazione splChalk pero' NON e' morta come diceva il registro:
       e' lei ad accendere .spl-logosvg, quindi resta.
   8.  SAVE.rete.visto si scriveva in entra() e non si leggeva mai (il
       server tiene il suo `visto` per conto proprio): via le due
       scritture, via il campo dal saldo di partenza, dalla rilettura e
       dal ripiego di mem().
   9.  loadSave rileggeva 6 sponsorNomi ma la pagina ha spon0..spon3 e
       chi scrive taglia a 4: allineato a 4.
   10. Il commento di defaultSave diceva «i tuoi quattro giocatori»: la
       rosa e' a cinque dal 29 agosto (i salvataggi a 4 vengono promossi
       a 5 al caricamento).
   11. Il commento di __indietro nominava un bottone ESCI: nel pannello
       di pausa si chiama ABBANDONA.
   12. Il banner «FUORI 12 SECONDI!» aveva il 12 scritto a mano accanto
       alla costante: ora lo compone ESPULSIONE_SEC.

   uso:  node strumenti/_t-ganci-morti.js --out fuori/ganci.html
         node strumenti/_t-ganci-morti.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/ganci.html'));

const ANCORE = [

/* 1 — ui.fieldRow, il ramo morto di buildFieldRow, i CSS orfani */
{
  nome: '1a/12 il gancio ui.fieldRow',
  cerca: `  fieldRow:$('fieldRow'), fieldCards:$('fieldCards'),`,
  metti: `  fieldCards:$('fieldCards'),`,
},
{
  nome: '1b/12 il ramo morto di buildFieldRow',
  cerca:
`function buildFieldRow(){
  buildCampoLinea();
  if(!ui.fieldRow) return;
  ui.fieldRow.innerHTML='';
  FIELDS.forEach((f,i)=>{
    const b=document.createElement('button');
    b.className='fchip'+(SAVE.fieldSel===i?' sel':'')+(SAVE.fields[i]?'':' lock');
    b.innerHTML = SAVE.fields[i] ? esc(f.nome)
      : icoSVG('lucchetto',12)+esc(f.nome)+' <span class="pz">'+f.prezzo+'</span>';
    b.addEventListener('click', ()=>{
      Audio5.unlock();
      if(!SAVE.fields[i]){ Audio5.beep(240); goScreen(ui.campi); buildCampiUI(); return; }
      Audio5.beep(520);
      setField(i);
    });
    ui.fieldRow.appendChild(b);
  });
}`,
  metti:
`/* IL RAMO DELLE PASTIGLIE E' USCITO (31 agosto 2026): l'elemento
   #fieldRow non esiste in pagina, quindi la guardia \`if(!ui.fieldRow)
   return\` usciva sempre e le pastiglie non nascevano mai. Resta il
   nome, che sei punti di chiamata conoscono: oggi la funzione monta la
   riga del campo e basta. */
function buildFieldRow(){
  buildCampoLinea();
}`,
},
{
  nome: '1c/12 i CSS orfani .field-row e .fchip',
  cerca:
`/* selettore campo compatto (schermata GIOCA) */
.field-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:470px;margin:0 auto}
.fchip{
  font-family:var(--cond);font-weight:700;font-size:12.5px;letter-spacing:.07em;text-transform:uppercase;
  color:var(--grigio);background:transparent;border:1px solid var(--linea);padding:7px 9px;cursor:pointer;
  display:inline-flex;align-items:center;gap:5px;
}
.fchip.sel{background:var(--gesso);border-color:var(--gesso);color:#12210f;font-weight:700}
/* UNO STATO DISATTIVATO DEVE RESTARE LEGGIBILE. Grigio al 40% su verde
   molto scuro voleva dire che IL TETTO e IL TORNEO NOTTURNO sparivano su
   un telefono in esterno. Qui il chip bloccato ha un fondo piu' chiaro del
   fondo pagina, testo grigio chiaro, e soprattutto il PREZZO addosso:
   dice cosa costa invece di dire soltanto che non ce l'hai. */
.fchip.lock{background:rgba(255,255,255,.055);border-color:#2a4d3a;color:#b9c7bd}
.fchip.lock .pz{font-family:var(--cond);font-weight:700;color:var(--oro);letter-spacing:.04em}
.fchip.lock svg{opacity:.9}`,
  metti:
`/* qui viveva il selettore campo compatto della schermata GIOCA: orfano,
   perche' l'elemento che lo ospitava non esiste piu' in pagina; il ramo
   JS che lo generava esce con questa stessa toppa (31 agosto 2026) */`,
},

/* 2 — ui.tourCoppa e le due scritture guardate */
{
  nome: '2a/12 il gancio ui.tourCoppa',
  cerca: `  tourStato:$('tourStato'), tourPremio:$('tourPremio'), tourCoppa:$('tourCoppa'),`,
  metti: `  tourStato:$('tourStato'), tourPremio:$('tourPremio'),`,
},
{
  nome: '2b/12 la guardia in testa a buildTorneoUI',
  cerca:
`function buildTorneoUI(){
  const T=SAVE.tour;
  if(ui.tourCoppa) ui.tourCoppa.dataset.vuota = (T&&T.won)?'0':'1';`,
  metti:
`function buildTorneoUI(){
  const T=SAVE.tour;`,
},
{
  nome: '2c/12 la guardia in fondo a buildBracket',
  cerca:
`  if(ui.tourCoppa) ui.tourCoppa.dataset.vuota = T.won?'0':'1';
  montaCoppe();`,
  metti:
`  /* qui, e in testa a buildTorneoUI, una guardia scriveva dataset.vuota
     su un gancio verso l'elemento #tourCoppa, mai esistito in pagina:
     scrittura mai avvenuta. Tolti gancio e guardie (31 agosto 2026). */
  montaCoppe();`,
},

/* 3 — campiResta: il div nascosto per sempre e il suo scrittore */
{
  nome: '3a/12 il div nascosto per sempre',
  cerca:
`    <!-- 'ANCORA 7 DA SBLOCCARE' SE N'E' ANDATA: era una riga di testo che
         contava i lucchetti disegnati due centimetri piu' sotto. Il conto
         lo fanno le schede, che sono la cosa meglio disegnata del prodotto
         — e quei trenta pixel di altezza servono al cartello. -->
    <div class="campi-resta hidden" id="campiResta"></div>`,
  metti:
`    <!-- 'ANCORA 7 DA SBLOCCARE' SE N'E' ANDATA: era una riga di testo che
         contava i lucchetti disegnati due centimetri piu' sotto. Il conto
         lo fanno le schede, che sono la cosa meglio disegnata del prodotto
         — e quei trenta pixel di altezza servono al cartello. Il div che
         la ospitava, rimasto nascosto per sempre, e' uscito insieme allo
         scrittore JS che continuava a riempirlo (31 agosto 2026). -->`,
},
{
  nome: '3b/12 lo scrittore JS in buildCampiUI',
  cerca:
`  ui.fieldCards.innerHTML='';
  {
    const resta=FIELDS.reduce((n,f,i)=> n + (SAVE.fields[i]?0:1), 0);
    const el=document.getElementById('campiResta');
    if(el) el.textContent = resta ? ('ancora '+resta+' da sbloccare') : 'li hai sbloccati tutti';`,
  metti:
`  ui.fieldCards.innerHTML='';
  {`,
},
{
  nome: '3c/12 il CSS orfano nella media query',
  cerca:
`  .campi-resta{margin:-8px 0 6px}
  .campi-desc{margin:0 auto 8px}`,
  metti:
`  .campi-desc{margin:0 auto 8px}`,
},
{
  nome: '3d/12 il CSS orfano principale',
  cerca:
`/* quanti campi restano da sbloccare: la pastiglia delle monete da sola non
   dice a che cosa servano */
.campi-resta{font-family:var(--cond);font-weight:700;font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--grigio);margin:-10px 0 12px}
/* colonna: la descrizione si allunga quanto vuole, il bottone resta`,
  metti:
`/* colonna: la descrizione si allunga quanto vuole, il bottone resta`,
},

/* 4 — l'id vestigiale campiNome */
{
  nome: '4/12 l\'id vestigiale sull\'h1 CAMPI',
  cerca: `    <h1 class="sotto-titolo" id="campiNome">CAMPI</h1>`,
  metti: `    <h1 class="sotto-titolo">CAMPI</h1>`,
},

/* 5 — tourPlaySub: via gancio e small (la strada e' dichiarata in testa) */
{
  nome: '5a/12 lo small statico di tourPlaySub',
  cerca: `      <button class="btnA" id="btnTourPlay">GIOCA <small id="tourPlaySub"></small></button>`,
  metti: `      <button class="btnA" id="btnTourPlay">GIOCA</button>`,
},
{
  nome: '5b/12 il gancio ui.tourPlaySub',
  cerca: `  btnTourPlay:$('btnTourPlay'), tourPlaySub:$('tourPlaySub'),`,
  metti: `  btnTourPlay:$('btnTourPlay'),`,
},

/* 6 — le otto chiamate Tut.notify con chiavi morte */
{
  nome: '6a/12 notify(pass) nel passaggio semplice',
  cerca:
`  if(kickBall(p, dx/l, dy/l, speed, 0)){
    Audio5.kick(0.35);
    b.passTo=G.players.indexOf(best);
    if(t===0 && !G.cpu[0]) Tut.notify('pass');
  }`,
  metti:
`  if(kickBall(p, dx/l, dy/l, speed, 0)){
    Audio5.kick(0.35);
    b.passTo=G.players.indexOf(best);
  }`,
},
{
  nome: '6b/12 notify(pass) nella filtrante',
  cerca:
`    Audio5.kick(0.5);
    /* il tutorial insegna «passa» e adesso lo si impara da questo
       pulsante: la filtrante E' un passaggio, e per questa via il suo
       passo non si e' mai chiuso */
    if(t===0 && !G.cpu[0]) Tut.notify('pass');`,
  metti:
`    Audio5.kick(0.5);`,
},
{
  nome: '6c/12 notify(pass) nel passaggio del dito',
  cerca:
`    Audio5.kick(0.35+0.15*fat);
    if(t===0 && !G.cpu[0]) Tut.notify('pass');
  }`,
  metti:
`    Audio5.kick(0.35+0.15*fat);
  }`,
},
{
  nome: '6d/12 notify(shot) nella pizzata',
  cerca:
`        G.stats.tiri[t]++; G.ball.tiroT=t;
        if(t===0 && !G.cpu[0]) Tut.notify('shot');
        Audio5.kick(0.4);`,
  metti:
`        G.stats.tiri[t]++; G.ball.tiroT=t;
        Audio5.kick(0.4);`,
},
{
  nome: '6e/12 notify(shot) prima dello specchio',
  cerca:
`  if(t===0 && !G.cpu[0]) Tut.notify('shot');
  const goalY=FH/2;`,
  metti:
`  const goalY=FH/2;`,
},
{
  nome: '6f/12 notify(shot) nel tiro mirato',
  cerca:
`  G.stats.tiri[t]++;
  if(t===0 && !G.cpu[0]) Tut.notify('shot');
  if(finestra){`,
  metti:
`  G.stats.tiri[t]++;
  if(finestra){`,
},
{
  nome: '6g/12 notify(slide) nella scivolata',
  cerca:
`  p.slide=0; p.slideDX=nx; p.slideDY=ny;
  if(p.team===0 && !G.cpu[0] && G.ctrl[0]===G.players.indexOf(p)) Tut.notify('slide');
  Audio5.slideS(); Audio5.beep(240);`,
  metti:
`  p.slide=0; p.slideDX=nx; p.slideDY=ny;
  Audio5.slideS(); Audio5.beep(240);`,
},
{
  nome: '6h/12 il blocco intero di notify(move)',
  cerca:
`  /* tutorial: il primo passo si completa muovendosi davvero */
  if(Tut.active && Tut.step===0 && !G.cpu[0]){
    const mv=humanMove(0);
    if(mv[0]||mv[1]) Tut.notify('move');
  }

  switchControlled(dt);`,
  metti:
`  /* qui un blocco chiamava Tut.notify('move') — e altri sette punti
     sparsi notify('pass'), notify('shot'), notify('slide'): chiavi di
     un tutorial che non esiste piu'. I passi vivi sono tieni, mira e
     raddoppio, e le loro chiavi passano da verboUsato (31 agosto 2026). */
  switchControlled(dt);`,
},

/* 7 — il CSS morto dello splash (splChalk resta: accende .spl-logosvg) */
{
  nome: '7/12 .spl-logo e figli',
  cerca:
`.spl-logo{font-family:var(--nero);font-weight:900;font-size:clamp(56px,17vw,150px);line-height:.9;color:var(--gesso);text-shadow:5.6px 2.0px 0 rgba(4,12,8,.62);margin:14px 0 10px}
.spl-logo b{color:var(--tu);font-weight:900}
.spl-logo i{font-style:normal;display:inline-block;opacity:0;animation:splChalk .42s both}
.spl-line{`,
  metti:
`/* il titolo a lettere HTML dello splash non ha piu' markup: il logo e'
   l'SVG qui sotto, e l'animazione splChalk resta perche' e' lei ad
   accenderlo (31 agosto 2026) */
.spl-line{`,
},

/* 8 — SAVE.rete.visto: scritto e mai letto */
{
  nome: '8a/12 il campo nel saldo di partenza',
  cerca: `    rete:{ id:'', segreto:'', coda:[], nome:'', punti:0, posto:0, visto:0, forza:0,`,
  metti: `    rete:{ id:'', segreto:'', coda:[], nome:'', punti:0, posto:0, forza:0,`,
},
{
  nome: '8b/12 il campo nella rilettura',
  cerca: `      for(const k of ['punti','posto','visto','forza'])`,
  metti: `      for(const k of ['punti','posto','forza'])`,
},
{
  nome: '8c/12 la prima scrittura in entra()',
  cerca:
`      if(r.ok){
        m.visto = Date.now();
        if(r.punti){ m.punti = r.punti.punti|0; }
        persistSave();
      }`,
  metti:
`      if(r.ok){
        /* qui si scriveva m.visto = Date.now(): nessuno lo rileggeva
           mai — l'ultimo accesso lo tiene il server per conto proprio.
           Campo tolto anche dal saldo di partenza e dalla rilettura
           (31 agosto 2026). */
        if(r.punti){ m.punti = r.punti.punti|0; }
        persistSave();
      }`,
},
{
  nome: '8d/12 la seconda scrittura in entra()',
  cerca:
`      m.id = r.id; m.segreto = r.segreto;
      m.visto = Date.now();
      persistSave();`,
  metti:
`      m.id = r.id; m.segreto = r.segreto;
      persistSave();`,
},
{
  nome: '8e/12 il campo nel ripiego di mem()',
  cerca: `    if(!SAVE.rete) SAVE.rete = { id:'', segreto:'', coda:[], nome:'', punti:0, posto:0, visto:0 };`,
  metti: `    if(!SAVE.rete) SAVE.rete = { id:'', segreto:'', coda:[], nome:'', punti:0, posto:0 };`,
},

/* 9 — i cartelloni sono quattro anche alla rilettura */
{
  nome: '9/12 sponsorNomi riletti a 4, non a 6',
  cerca: `    if(Array.isArray(j.sponsorNomi)) s.sponsorNomi=j.sponsorNomi.filter(x=>typeof x==='string').map(x=>x.slice(0,14)).slice(0,6);`,
  metti:
`    /* quattro cartelloni, non sei: la pagina ha spon0..spon3 e chi
       scrive taglia gia' a 4 — rileggerne 6 teneva in vita due nomi
       fantasma che nessuno mostrava (31 agosto 2026) */
    if(Array.isArray(j.sponsorNomi)) s.sponsorNomi=j.sponsorNomi.filter(x=>typeof x==='string').map(x=>x.slice(0,14)).slice(0,4);`,
},

/* 10 — la rosa e' a cinque */
{
  nome: '10/12 il commento della rosa dice cinque',
  cerca: `    rosa:null,                    // i tuoi quattro giocatori, con nome e attributi`,
  metti: `    rosa:null,                    // i tuoi cinque giocatori, con nome e attributi`,
},

/* 11 — il bottone si chiama ABBANDONA */
{
  nome: '11/12 il commento di __indietro',
  cerca: `     non deve poterla buttare via. Per uscire c'e' ESCI nel pannello di`,
  metti: `     non deve poterla buttare via. Per uscire c'e' ABBANDONA nel pannello di`,
},

/* 12 — il banner compone il numero dalla costante */
{
  nome: '12/12 FUORI N SECONDI dalla costante',
  cerca:
`  showBanner('FUORI 12 SECONDI!', '#ff4d4d', 1.8);
  Audio5.whistle(true);`,
  metti:
`  /* il numero lo dice ESPULSIONE_SEC, non la mano: se la costante
     cambia, il cartello resta vero (31 agosto 2026) */
  showBanner('FUORI '+ESPULSIONE_SEC+' SECONDI!', '#ff4d4d', 1.8);
  Audio5.whistle(true);`,
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
const attesi = [
  /* conteggi CONTATI sul file prima della cura, non stimati */
  ["$('fieldRow')", 0],
  ['ui.fieldRow', 1],            // resta solo nel verbale di buildFieldRow
  ['buildFieldRow', 7],          // 1 definizione + 6 punti di chiamata, invariati
  ["'fchip'", 0],
  ['.fchip{', 0],
  ['.fchip.sel', 0],
  ['.fchip.lock', 0],
  ['.field-row{', 0],
  ["$('tourCoppa')", 0],
  ['ui.tourCoppa', 0],
  ['tourCoppa', 1],              // resta solo nel verbale di buildBracket
  ['dataset.vuota', 2],          // la lettura di montaCoppa + il verbale
  ['campiResta', 0],
  ['campi-resta', 0],
  ['campiNome', 0],
  ['tourPlaySub', 0],
  ['seaPlaySub', 4],             // il gemello curato resta com'era: small, 2 innerHTML, verbale
  ["Tut.notify('pass')", 0],
  ["Tut.notify('shot')", 0],
  ["Tut.notify('slide')", 0],
  ['Tut.notify(', 2],            // verboUsato + il verbale del blocco move
  ['.spl-logo{', 0],
  ['.spl-logo b', 0],
  ['.spl-logo i', 0],
  ['splChalk', 3],               // keyframes + .spl-logosvg + il verbale: l'animazione VIVE
  ['m.visto = Date.now();', 0],
  ['visto:0', 0],
  ["'punti','posto','visto','forza'", 0],
  ["'punti','posto','forza'", 1],
  ['slice(0,6)', 0],
  ['slice(0,4)', 3],             // i due tagli di chi scrive + la rilettura allineata
  ['quattro giocatori', 2],      // ne restano due, fuori dal fascio (parlano d'altro)
  ['cinque giocatori', 1],
  ["ESCI nel pannello di", 0],
  ["ABBANDONA nel pannello di", 1],
  ['FUORI 12 SECONDI!', 0],
  ["FUORI '+ESPULSIONE_SEC+' SECONDI!", 1],
  ['ESPULSIONE_SEC', 4],         // costante + p.out + banner + verbale
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
