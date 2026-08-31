/* =====================================================================
   _t-parole-vere.js — TREDICI PAROLE CHE NON DICEVANO IL VERO
   (31 agosto 2026, dal censimento del manuale: 269 voci, 98 sospetti,
   qui si curano i testi — il codice sotto non cambia di una virgola).

   1. La riga-manifesto della PAUSA diceva «quattro dischi ... che
      cambiano col possesso: TIRA, FILTRANTE, PASSA e CROSS»: i dischi
      sono CINQUE dal 29 agosto (SCATTO/SCUDO), e la sua faccia non
      cambia col possesso ma con la levetta. La riga tastiera diceva
      «Z contrasta» ma KeyZ chiama doSlide: e' la SCIVOLATA (il COME SI
      GIOCA lo dice giusto); e taceva il cross da tastiera (E+Shift) e
      lo scudo.
   2. SETTE bottoni «TORNA AL MENU» portavano altrove: crediti e
      preferenze tornano alle IMPOSTAZIONI, trofei e statistiche alla
      BACHECA, squadra/rosa/campi allo SPOGLIATOIO. Non si cambia la
      strada (e' quella giusta: un livello alla volta), si cambia la
      promessa. Il modello esiste gia' in casa: «TORNA ALLE SFIDE».
   3. «otto campetti da sbloccare»: sono sette, l'Oratorio e' di serie
      (fields[0] forzato a 1 nel salvataggio).
   4. Due etichette scritte da JS con l'apostrofo al posto dell'accento
      («il campo e' piu' grande», «PIU' TIENI, PIU' FORTE») mentre
      l'HTML statico usa le accentate vere.
   5. SOMBRERO e AL VOLO promettevano «Segna con un pallonetto» /
      «Segna un gol di prima intenzione», ma il codice sblocca al
      TENTATIVO del gesto piu' un gol QUALUNQUE nella partita: la
      descrizione adesso dice quello che il codice fa. (Legare il
      trofeo al gol del gesto e' una cura di simulazione: registrata,
      non di oggi.)
   6. Il premio PODIO di stagione (+200) era pagato senza etichetta —
      il saldo saliva e la lavagnetta non lo spiegava — e non era
      dichiarato nell'intro. Adesso ha l'etichetta e sta nell'intro.
   7. L'albo d'oro stampava OGNI riga come «TORNEO N.x», anche i titoli
      di STAGIONE, sfalsando la numerazione dei tornei veri. Adesso i
      campionati si chiamano CAMPIONATO e i tornei contano solo se'
      stessi; l'intestazione e la riga vuota smettono di dire «tornei».

   uso:  node strumenti/_t-parole-vere.js --out fuori/parole.html
         node strumenti/_t-parole-vere.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/parole.html'));

const ANCORE = [

/* 1 — la riga-manifesto della pausa, touch e tastiera */
{
  nome: '1/13 la riga dei comandi in pausa',
  cerca:
`        pc.innerHTML = (InputPref.touch
          ? 'Stick a '+(mn?'destra':'sinistra')+' · quattro dischi a '+(mn?'sinistra':'destra')+' che cambiano col possesso: TIRA, FILTRANTE, PASSA e CROSS'
          : 'C passa · X tira · E filtrante · Z contrasta · Q cambia · Shift scatto')`,
  metti:
`        /* CINQUE dischi dal 29 agosto (SCATTO/SCUDO), e Z e' la
           scivolata (doSlide), non il contrasto: la riga era rimasta
           indietro di un disco e di un verbo (31 agosto 2026) */
        pc.innerHTML = (InputPref.touch
          ? 'Stick a '+(mn?'destra':'sinistra')+' · cinque dischi a '+(mn?'sinistra':'destra')+': TIRA, FILTRANTE, PASSA e CROSS — che cambiano col possesso — più SCATTO/SCUDO, che si tiene'
          : 'C passa · X tira · E filtrante (E+Shift cross) · Z scivola · Q cambia · Shift scatto e scudo')`,
},

/* 2-8 — i sette bottoni che promettevano il menu */
{
  nome: '2/13 crediti torna alle impostazioni',
  cerca: `<div class="azioni"><button class="btnA sec" id="btnBackCrediti">TORNA AL MENU</button></div>`,
  metti: `<div class="azioni"><button class="btnA sec" id="btnBackCrediti">TORNA ALLE IMPOSTAZIONI</button></div>`,
},
{
  nome: '3/13 preferenze torna alle impostazioni',
  cerca: `<div class="azioni"><button class="btnA sec" id="btnBackImpost">TORNA AL MENU</button></div>`,
  metti: `<div class="azioni"><button class="btnA sec" id="btnBackImpost">TORNA ALLE IMPOSTAZIONI</button></div>`,
},
{
  nome: '4/13 trofei torna alla bacheca',
  cerca: `<div class="azioni"><button class="btnA sec" id="btnBackTrofei">TORNA AL MENU</button></div>`,
  metti: `<div class="azioni"><button class="btnA sec" id="btnBackTrofei">TORNA ALLA BACHECA</button></div>`,
},
{
  nome: '5/13 statistiche torna alla bacheca',
  cerca: `<div class="azioni"><button class="btnA sec" id="btnBackStats">TORNA AL MENU</button></div>`,
  metti: `<div class="azioni"><button class="btnA sec" id="btnBackStats">TORNA ALLA BACHECA</button></div>`,
},
{
  nome: '6/13 squadra torna allo spogliatoio',
  cerca: `<div class="azioni"><button class="btnA sec" id="btnBackSquadra">TORNA AL MENU</button></div>`,
  metti: `<div class="azioni"><button class="btnA sec" id="btnBackSquadra">TORNA ALLO SPOGLIATOIO</button></div>`,
},
{
  nome: '7/13 rosa torna allo spogliatoio',
  cerca: `<div class="azioni"><button class="btnA sec" id="btnBackRosa">TORNA AL MENU</button></div>`,
  metti: `<div class="azioni"><button class="btnA sec" id="btnBackRosa">TORNA ALLO SPOGLIATOIO</button></div>`,
},
{
  nome: '8/13 campi torna allo spogliatoio',
  cerca: `<div class="azioni"><button class="btnA sec" id="btnBackCampi">TORNA AL MENU</button></div>`,
  metti: `<div class="azioni"><button class="btnA sec" id="btnBackCampi">TORNA ALLO SPOGLIATOIO</button></div>`,
},

/* 9 — i campetti da sbloccare sono sette */
{
  nome: '9/13 sette campetti',
  cerca: `<button class="voce mini" id="btnCambiaCampo">CAMBIA CAMPO <small>otto campetti da sbloccare</small></button>`,
  metti: `<button class="voce mini" id="btnCambiaCampo">CAMBIA CAMPO <small>sette campetti da sbloccare</small></button>`,
},

/* 10 — gli accenti veri nelle etichette scritte da JS */
{
  nome: '10/13 la durata col suo accento',
  cerca: `Math.round(SAVE.durata*1610/1150)+'″, a 11 contro 11 '+Math.round(SAVE.durata*2300/1150)+'″ — il campo e\\' piu\\' grande</small>';`,
  metti: `Math.round(SAVE.durata*1610/1150)+'″, a 11 contro 11 '+Math.round(SAVE.durata*2300/1150)+'″ — il campo è più grande</small>';`,
},
{
  nome: '11/13 l\'invito col suo accento',
  cerca: `testo:'TIENI PREMUTO TIRA: PIU\\' TIENI, PIU\\' FORTE' },`,
  metti: `testo:'TIENI PREMUTO TIRA: PIÙ TIENI, PIÙ FORTE' },`,
},

/* 12 — i due trofei dicono quello che il codice fa */
{
  nome: '12/13 sombrero e al volo, descrizioni vere',
  cerca:
`  { id:'pallonetto',    ico:'sombrero',   nome:'SOMBRERO',              desc:'Segna con un pallonetto',                  premio:50,  liv:'argento' },
  { id:'volee',         ico:'volo',       nome:'AL VOLO',               desc:'Segna un gol di prima intenzione',         premio:70,  liv:'oro' },`,
  metti:
`  /* le descrizioni dicono la CONDIZIONE VERA (31 agosto 2026): i
     contatori crescono al TENTATIVO del gesto, e il gol richiesto e'
     un gol qualunque della partita. Legare il trofeo al gol nato dal
     gesto e' una cura di simulazione: registrata, non di oggi. */
  { id:'pallonetto',    ico:'sombrero',   nome:'SOMBRERO',              desc:'Tenta un pallonetto e segna nella stessa partita', premio:50,  liv:'argento' },
  { id:'volee',         ico:'volo',       nome:'AL VOLO',               desc:'Tenta un tiro al volo e segna nella stessa partita', premio:70,  liv:'oro' },`,
},

/* 13 — il podio di stagione: etichettato, dichiarato, e l'albo onesto */
{
  nome: '13a/13 il podio con l\'etichetta',
  cerca: `    }else if(mio<=2) addCoinsInternal(SEA_PODIO);`,
  metti: `    }else if(mio<=2) addCoinsInternal(SEA_PODIO, 'Podio di campionato');`,
},
{
  nome: '13b/13 il podio nell\'intro',
  cerca: `<div class="tourinfo">PREMI &middot; VITTORIA <b>+35</b> &middot; PAREGGIO <b>+15</b> &middot; TITOLO <b>+600</b> <i class="coin"></i></div>`,
  metti: `<div class="tourinfo">PREMI &middot; VITTORIA <b>+35</b> &middot; PAREGGIO <b>+15</b> &middot; PODIO <b>+200</b> &middot; TITOLO <b>+600</b> <i class="coin"></i></div>`,
},
{
  nome: '13c/13 l\'albo distingue i campionati',
  cerca:
`  ui.alboList.innerHTML = SAVE.albo.length
    ? SAVE.albo.map((e,i)=>'<div class="alboriga">'+icoSVG('trofeo',14)+' TORNEO N.'+(i+1)+' — '+esc(e.nome||'')+' <em>&middot; '+esc(e.campo||'')+' &middot; '+esc(e.data||'')+'</em></div>').join('')
    : '<div class="alboriga" style="border-left-color:var(--linea)"><em>Ancora nessun torneo vinto. Il quartiere aspetta.</em></div>';`,
  metti:
`  /* nell'albo entrano ANCHE i titoli di stagione (campo 'STAGIONE'):
     chiamarli «TORNEO N.x» sfalsava la numerazione dei tornei veri e
     dava a un campionato il nome sbagliato (31 agosto 2026) */
  let nTornei=0;
  ui.alboList.innerHTML = SAVE.albo.length
    ? SAVE.albo.map(e=>{
        const stag = e.campo==='STAGIONE';
        const testa = stag ? 'CAMPIONATO' : 'TORNEO N.'+(++nTornei);
        const coda  = stag ? esc(e.data||'') : esc(e.campo||'')+' &middot; '+esc(e.data||'');
        return '<div class="alboriga">'+icoSVG('trofeo',14)+' '+testa+' — '+esc(e.nome||'')+' <em>&middot; '+coda+'</em></div>';
      }).join('')
    : '<div class="alboriga" style="border-left-color:var(--linea)"><em>Ancora nessun trofeo di squadra. Il quartiere aspetta.</em></div>';`,
},
{
  nome: '13d/13 l\'intestazione dell\'albo',
  cerca: `<div class="eti" style="margin-top:22px">Albo d'oro dei tornei</div>`,
  metti: `<div class="eti" style="margin-top:22px">Albo d'oro</div>`,
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
  /* 21 occorrenze prima della cura (bottoni veri, commenti, verbali):
     se ne correggono 7, ne restano 14 — contate, non stimate */
  ['TORNA AL MENU', 14],
  ['TORNA ALLE IMPOSTAZIONI', 2],
  ['TORNA ALLA BACHECA', 2],
  ['TORNA ALLO SPOGLIATOIO', 3],
  ['cinque dischi a ', 1],
  ['quattro dischi a ', 0],
  ['Z scivola', 1],
  ['Z contrasta', 0],
  ['sette campetti da sbloccare', 1],
  ['PIÙ TIENI, PIÙ FORTE', 1],
  ["'Podio di campionato'", 1],
  ['PODIO <b>+200</b>', 1],
  ['CAMPIONATO', 1],
  ["e' piu' grande", 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
