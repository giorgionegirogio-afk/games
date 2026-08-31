/* =====================================================================
   _t-aiuti-completi.js — GLI AIUTI DICONO TUTTO QUELLO CHE IL CODICE FA
   (31 agosto 2026, dal registro del censimento: fascio «aiuti-completi»,
   cinque voci, otto ancore — si curano i CARTELLI, il codice sotto
   non cambia di una virgola).

   1. COME SI GIOCA taceva quattro fatti veri e ne diceva uno falso:
      a) «In amichevole si sale a 7 e 11» — falso per difetto: la taglia
         scelta in GIOCA persiste (SAVE.taglia) e vale anche per TORNEO
         e STAGIONE (lo dice il commento accanto ai tre bottoni). E gia'
         che la frase si riscrive, i «90 secondi» secchi diventano
         «90 secondi nella gabbia, di piu' sui campi grandi»: il
         cronometro scala col campo (durataPartita).
      b) il tiro NON si puo' caricare all'infinito: SHOT_HARDCAP = 1.25
         e releaseCharge lo fa partire da solo (riga «if(p.charge>
         SHOT_HARDCAP ...)») — non era documentato in nessun aiuto.
      c) nel duello anche W (P1) e freccia su (P2) valgono il centro
         (zoneFromKeys: «code===m.dn||code===m.up return 1») ma i testi
         dicevano solo A/S/D; e il portiere col dito ha 3 secondi
         (stopPower: «else this.cpuT=3.0; // timeout: poi tuffo
         casuale») che non stavano scritti da nessuna parte.
      d) in 2 giocatori la mentalita' regolabile — in GIOCA e dalla
         pausa — e' SOLO quella del giocatore di sinistra (mentRow e
         btnPauseMent scrivono G.ment[0] e basta): nessun testo lo
         diceva.
   2. Lo splash dice «tocca per entrare» ma setTimeout(dismissSplash,
      2600) entra da solo: il cartello adesso dice anche questo, in tono
      di casa, e l'auto-ingresso resta.
   3. RIPRENDI aveva il piccolo statico «oppure premi ESC» e pauseBtn il
      title «Pausa (ESC)» anche su telefono, dove ESC non esiste: il
      comando vero su touch e' il tasto Indietro (window.__indietro).
      Si riscrivono dentro setPaused, accanto a pausaCmd, dalla stessa
      fonte di verita' (InputPref.touch).
   4. Il suggerimento del duello per il portiere touch («PORTIERE:
      TOCCA IL LATO DEL TUFFO») taceva il limite dei 3 secondi: adesso
      lo dice, proprio nell'unico momento in cui il dito puo' agire.
   5. La citazione di GIOCA prometteva «90 secondi» secchi: a 7 e a 11
      il cronometro cresce col campo, e adesso la frase lo dice.

   uso:  node strumenti/_t-aiuti-completi.js --out fuori/aiuti.html
         node strumenti/_t-aiuti-completi.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/aiuti.html'));

const ANCORE = [

/* 1a — la taglia vale anche in progressione, e i 90 secondi onesti */
{
  nome: '1a/5 come si gioca: la taglia vale anche per torneo e stagione',
  cerca: `In amichevole si sale anche a <b>7 contro 7</b> e <b>11 contro 11</b>, su campi pi&ugrave; grandi. <b>90 secondi</b>; sul pareggio`,
  metti: `Si sale anche a <b>7 contro 7</b> e <b>11 contro 11</b>, su campi pi&ugrave; grandi &mdash; la taglia scelta in GIOCA vale anche per TORNEO e STAGIONE. <b>90 secondi</b> nella gabbia, di pi&ugrave; sui campi grandi; sul pareggio`,
},

/* 1b — il tetto del tiro (SHOT_HARDCAP) entra nella lavagna */
{
  nome: '1b/5 come si gioca: il tiro tenuto troppo parte da solo',
  cerca: `tieni <b>TIRA</b> e rilascia sull'anello che pulsa<span class="soloKb"> &middot; <kbd>X</kbd></span></span>`,
  metti: `tieni <b>TIRA</b> e rilascia sull'anello che pulsa<span class="soloKb"> &middot; <kbd>X</kbd></span> &mdash; oltre 1,25 secondi parte da solo</span>`,
},

/* 1c — il duello: W e freccia su valgono il centro, il dito ha 3 secondi */
{
  nome: '1c/5 come si gioca: tasti del duello e limite del portiere',
  cerca: `chi legge l'altro, vince.</p>`,
  metti: `chi legge l'altro, vince. Da tastiera il terzo si sceglie con <kbd>A</kbd>/<kbd>S</kbd>/<kbd>D</kbd> (P1) o con le frecce (P2) — e anche <kbd>W</kbd> e freccia su valgono il centro. Col dito il portiere ha <b>3 secondi</b> per scegliere il lato del tuffo: poi il tuffo parte da solo.</p>`,
},

/* 1d — in 2 giocatori la panchina e' una sola */
{
  nome: '1d/5 come si gioca: la mentalita\' in 2 giocatori',
  cerca: `In 2 giocatori lo schermo &egrave; diviso a met&agrave;.</p>`,
  metti: `In 2 giocatori lo schermo &egrave; diviso a met&agrave;, e la mentalit&agrave; regolabile &mdash; in GIOCA e dalla pausa &mdash; &egrave; solo quella del giocatore di sinistra.</p>`,
},

/* 2 — lo splash dice anche dell'auto-ingresso (che resta) */
{
  nome: '2/5 lo splash dice il vero',
  cerca: `  <div class="spl-sub">tocca per entrare</div>`,
  metti: `  <div class="spl-sub">tocca per entrare &mdash; o il cancello si apre da solo</div>`,
},

/* 3 — RIPRENDI e il title di pausa secondo l'input in uso */
{
  nome: '3/5 la pausa non promette ESC a un telefono',
  cerca:
`          : 'C passa · X tira · E filtrante (E+Shift cross) · Z scivola · Q cambia · Shift scatto e scudo')
          + '<button class="cmdlink" id="btnPauseComandi" type="button">cambia</button>';
      } }`,
  metti:
`          : 'C passa · X tira · E filtrante (E+Shift cross) · Z scivola · Q cambia · Shift scatto e scudo')
          + '<button class="cmdlink" id="btnPauseComandi" type="button">cambia</button>';
      } }
    /* il piccolo di RIPRENDI e il title del bottone di pausa dicevano
       «ESC» anche a chi gioca col dito, dove ESC non esiste: il comando
       vero su touch e' il tasto Indietro (vedi window.__indietro). Si
       riscrivono QUI, accanto a pausaCmd, dalla stessa fonte di verita'
       (InputPref.touch), cosi' i cartelli della pausa non possono
       divergere (31 agosto 2026) */
    { const br=document.getElementById('btnResume');
      const sm=br && br.querySelector('small');
      if(sm) sm.textContent = InputPref.touch ? 'oppure il tasto Indietro' : 'oppure premi ESC';
      const pb=document.getElementById('pauseBtn');
      if(pb) pb.title = InputPref.touch ? 'Pausa (tasto Indietro)' : 'Pausa (ESC)'; }`,
},

/* 4 — il suggerimento del portiere touch dice il limite */
{
  nome: '4/5 il portiere touch sa di avere 3 secondi',
  cerca:
`        ? (InputPref.touch ? 'PORTIERE: TOCCA IL LATO DEL TUFFO'
                           : (s.keeper===0?'P1: A / S / D':'P2: ← / ↓ / →'))`,
  metti:
`        /* il limite e' vero: stopPower arma cpuT=3.0 per il portiere
           umano e allo scadere il tuffo parte da solo (casuale). Col
           dito questo e' l'UNICO momento utile, quindi il cartello dice
           anche il tempo (31 agosto 2026) */
        ? (InputPref.touch ? 'PORTIERE: TOCCA IL LATO DEL TUFFO — HAI 3 SECONDI, POI PARTE DA SOLO'
                           : (s.keeper===0?'P1: A / S / D':'P2: ← / ↓ / →'))`,
},

/* 5 — la citazione di GIOCA resta vera anche a 7 e a 11 */
{
  nome: '5/5 la citazione di GIOCA non mente sui campi grandi',
  cerca: `    <div class="frase stretta">&laquo;La partita di calcetto del dopolavoro, compressa in <b>90 secondi</b>. Chi legge il tempo dell'altro, <b>segna</b>.&raquo;</div>`,
  metti: `    <div class="frase stretta">&laquo;La partita di calcetto del dopolavoro, compressa nei <b>90 secondi</b> della gabbia &mdash; sui campi grandi il cronometro cresce col campo. Chi legge il tempo dell'altro, <b>segna</b>.&raquo;</div>`,
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
  /* contate sul file DOPO la cura — contate, non stimate */
  ['tocca per entrare', 1],
  ['il cancello si apre da solo', 1],
  /* 2 = il piccolo statico di RIPRENDI (fallback tastiera) + il ramo
     tastiera del ternario nuovo in setPaused */
  ['oppure premi ESC', 2],
  ['oppure il tasto Indietro', 1],
  /* 2 = il title statico di pauseBtn + il ramo tastiera del ternario */
  ['Pausa (ESC)', 2],
  ['Pausa (tasto Indietro)', 1],
  ['HAI 3 SECONDI, POI PARTE DA SOLO', 1],
  ['TOCCA IL LATO DEL TUFFO', 1],
  ['oltre 1,25 secondi parte da solo', 1],
  ['In amichevole si sale', 0],
  ['la taglia scelta in GIOCA vale anche per TORNEO e STAGIONE', 1],
  ['il cronometro cresce col campo', 1],
  ['valgono il centro', 1],
  ['giocatore di sinistra', 1],
  ['compressa nei <b>90 secondi</b> della gabbia', 1],
  ['compressa in <b>90 secondi</b>', 0],
  /* 2 = la citazione di GIOCA + l'intro di COME SI GIOCA, come prima */
  ['<b>90 secondi</b>', 2],
  /* 2 = il commento sugli espulsi (riga 33986 circa) + il nuovo aiuto
     del duello in COME SI GIOCA */
  ['3 secondi', 2],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
