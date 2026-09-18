/* =====================================================================
   _t-sottotitoli.js — I SOTTOTITOLI DANNO VOCE AGLI EVENTI SONORI
   (voce #112, compito 4, quarto compito del ramo voce-112-spiccioli-ux).

   IL PERCHE'. Puro contorno, zero simulazione (il due-versioni resta
   0/60 a ogni taglia: il banner e' disegno, non decisione -- non tocca
   dado(), una decisione di gioco o uno stato che la CPU legge).

   IL PARLATO VERO DI CALCETTO E' L'AUDIO DI GIOCO. Molti eventi sonori
   chiave passano SOLO dall'altoparlante: chi non li sente non sa che
   sono successi. Il gioco ha gia' un canale visivo per questo --
   showBanner(text,col,dur), la striscia che PALO!/GOL!/FALLO!/
   VANTAGGIO/RUBATA PULITA! usano da sempre -- ma e' UNO SLOT, non una
   coda: scrive G.banner/G.bannerT/G.bannerCol, e l'ultima chiamata
   vince. Per la v1 e' accettabile (un evento urgente vince, come gia'
   oggi con PALO/GOL che si accavallano): si dichiara, non si risolve.

   CURA 1 -- SAVE.sott, 0/1, default 1 (acceso: il parlato vero e' gia'
   acceso di serie, sul modello ESATTO di SAVE.dalt/SAVE.vibInt --
   additivo in defaultSave, sanificato in loadSave con la stessa
   disciplina booleana di dalt/moto/moviola).

   CURA 2 -- l'interruttore .voce.sw #btnSetSott in IMPOSTAZIONI,
   markup/refreshImpostUI/handler tutti carbonio di btnSetDalt: stesso
   punto nel pannello (Accessibilita', subito dopo ALTO CONTRASTO),
   stesso schema testo+classList.toggle('on',...)+aria-pressed.

   CURA 3 -- l'helper sottotitolo(testo,col,dur): UN SOLO PUNTO che
   rispetta il flag,
       function sottotitolo(testo,col,dur){ if(SAVE.sott) showBanner(testo,col,dur); }
   cosi' ogni chiamata futura passa dallo stesso cancello invece di
   ripetere "if(SAVE.sott)" ad ogni sito.

   CURA 4 -- LE CHIAMATE MANCANTI. Il grep di Audio5.whistle (13 siti)
   censisce quali fischi hanno GIA' un showBanner accanto (PALO/GOL/
   FALLO/CARTELLINO/VANTAGGIO SFUMATO/GOLDEN GOAL/SI DECIDE DAL
   DISCHETTO/FUORI N SECONDI/RIMESSA-ANGOLO-RINVIO/ALTA! -- undici siti,
   NON toccati: il flag non li spegne, restano sempre visibili) e quali
   restano MUTI. Lo spec (2026-09-18-spiccioli-ux-design.md, cura 4)
   nomina per nome tre categorie di fischio: INIZIO, RIPRESA, FINE.
   Sono quattro i siti che ricadono in queste tre categorie e non hanno
   nessun banner adiacente:
     - INIZIO: dentro startMatch(), il fischio d'inizio di OGNI singola
       partita (Audio5.crowdLevel(1); Audio5.whistle(false);) -- e' il
       piu' esercitato di tutti, scatta a ogni kickoff in CPU-CPU;
     - RIPRESA (due siti gemelli): dentro step(), il kickoff dopo la
       celebrazione del gol, sia col ramo moviola sia senza
       (resetKickoff(); setScene('kickoff'); Audio5.whistle(false);) --
       stesso testo, stessa cura, due punti perche' sono due rami if
       diversi che arrivano allo stesso fischio;
     - FINE: dentro endMatch(), il fischio finale (chiudiSfida();
       Audio5.whistle(true);) -- il risultato compare solo un
       fotogramma piu' tardi, sulla schermata di fine partita: durante
       quel fotogramma il fischio era muto anche a video.
   Il testo e' sempre 'FISCHIO' per inizio/ripresa (l'evento e' lo
   stesso: la palla torna in gioco dal centro) e 'FISCHIO FINALE' per
   la fine (evento diverso: la partita e' chiusa). Nessun "FINE PRIMO
   TEMPO": CALCETTO non ha un intervallo, un solo cronometro da 90/120/
   180 secondi (grep 'primo tempo'/'intervallo'/'half': zero risultati).

   SCELTA DICHIARATA -- IL DUELLO (rigore/punizione, Duel.start/Duel.
   update) NON riceve un sottotitolo in questo compito, anche se due
   suoi fischi (Audio5.whistle(true) in start, Audio5.whistle(false)
   quando il portiere riparte dopo una parata) non hanno uno showBanner
   accanto. Due ragioni: (a) lo spec elenca per nome solo FISCHIO
   (inizio/fine/ripresa), GOL, PALO/TRAVERSA, FALLO/CARTELLINO -- il
   duello non e' fra gli eventi coperti; (b) il duello ha GIA' un canale
   testuale dedicato che il banner non ha, il titolo #duelTit
   ('RIGORE'/'PUNIZIONE!'), visibile per tutta la durata della fase --
   non e' il buco che questa cura chiude. Resta un possibile seguito,
   non nominato qui.

   COSA NON TOCCA: dado(), una decisione di gioco, uno stato che la CPU
   legge, gli undici siti Audio5.whistle che hanno gia' un banner
   adiacente, la macchina Duel/rigori. Zero banner nuovi sugli eventi
   che ce l'hanno gia': la cura AGGIUNGE solo dove il fischio era muto.

   uso:
     node strumenti/_t-sottotitoli.js --elenco
     node strumenti/_t-sottotitoli.js --out fuori/a4-sott.html
     node strumenti/_t-sottotitoli.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/a4-sott.html'));

/* CONTROLLO ANTI-ATTESTAZIONE: se SAVE.sott o l'helper sottotitolo()
   esistono gia', questo attrezzo si ferma invece di sovrapporsi. */
if (!haFlag('elenco')) {
  const srcGrezzo = fs.readFileSync(inFile, 'utf8');
  if (srcGrezzo.indexOf('function sottotitolo(') >= 0 || /\bsott *: *1\b/.test(srcGrezzo)) {
    console.error('FALLITO: "sottotitolo(" o "sott:1" esistono gia\' nel file — controllare prima di applicare.');
    process.exit(1);
  }
}

const ANCORE = [

/* 1/12 — defaultSave: SAVE.sott, default 1 (acceso). */
{
  nome: '1/12 defaultSave: SAVE.sott (0/1, default 1)',
  cerca:
`    moto:1, dalt:0, durata:90,     // accessibilita': effetti, contrasto divise, durata
`,
  metti:
`    moto:1, dalt:0, durata:90,     // accessibilita': effetti, contrasto divise, durata
    /* SOTT: i sottotitoli degli eventi sonori chiave (i fischi, prima
       muti). Default 1 = acceso: il parlato vero di CALCETTO e' l'audio
       di gioco, e chi ha bisogno di leggerlo lo trova gia' acceso
       (voce #112, compito 4). */
    sott:1,
`,
},

/* 2/12 — loadSave: sanificazione sul modello di dalt (0/1, niente altro). */
{
  nome: '2/12 loadSave: sott sanificato, solo 0/1',
  cerca:
`    if(j.dalt===0||j.dalt===1) s.dalt=j.dalt;
`,
  metti:
`    if(j.dalt===0||j.dalt===1) s.dalt=j.dalt;
    /* stesso modello di dalt: solo 0/1, un salvataggio manomesso non
       puo' chiedere altro (voce #112, compito 4) */
    if(j.sott===0||j.sott===1) s.sott=j.sott;
`,
},

/* 3/12 — markup: la voce SOTTOTITOLI, subito dopo ALTO CONTRASTO. */
{
  nome: '3/12 markup IMPOSTAZIONI: #btnSetSott',
  cerca:
`      <button class="voce sw" id="btnSetDalt">ALTO CONTRASTO: NO <small>daltonismo: kit ben separati</small></button>
`,
  metti:
`      <button class="voce sw" id="btnSetDalt">ALTO CONTRASTO: NO <small>daltonismo: kit ben separati</small></button>
      <!-- SOTTOTITOLI (voce #112, compito 4): il parlato vero del gioco
           e' l'audio -- fischi, gol, palo -- e chi non lo sente ha
           bisogno di leggerlo. Testo/classe/aria-pressed si scrivono in
           refreshImpostUI, carbonio di btnSetDalt qui sopra. -->
      <button class="voce sw" id="btnSetSott">SOTTOTITOLI: S&Igrave; <small>fischio, gol, palo — a video</small></button>
`,
},

/* 4/12 — l'helper sottotitolo(), subito dopo showBanner: UN SOLO punto
   che rispetta il flag, cosi' ogni chiamata futura passa da qui invece
   di ripetere "if(SAVE.sott)" ad ogni sito. */
{
  nome: '4/12 helper sottotitolo(testo,col,dur)',
  cerca:
`function showBanner(text,col,dur){
  G.banner=text; G.bannerCol=col||'#ffb020';
  G.bannerDur=dur||1.4; G.bannerT=G.bannerDur;
}
`,
  metti:
`function showBanner(text,col,dur){
  G.banner=text; G.bannerCol=col||'#ffb020';
  G.bannerDur=dur||1.4; G.bannerT=G.bannerDur;
}
/* SOTTOTITOLO (voce #112, compito 4): UNO SOLO punto che rispetta
   SAVE.sott, per gli eventi sonori chiave che oggi non hanno un
   showBanner adiacente (i fischi muti). Gli eventi che hanno GIA' un
   banner (PALO/GOL/FALLO/CARTELLINO/VANTAGGIO...) restano su showBanner
   bare, invariati: il flag AGGIUNGE i muti, non filtra i preesistenti. */
function sottotitolo(testo,col,dur){ if(SAVE.sott) showBanner(testo,col,dur); }
`,
},

/* 5/12 — refreshImpostUI: il testo del bottone, carbonio di btnSetDalt. */
{
  nome: '5/12 refreshImpostUI: testo di btnSetSott',
  cerca:
`  $('btnSetDalt').innerHTML='ALTO CONTRASTO: '+(SAVE.dalt?'SÌ':'NO')+
    ' <small>daltonismo: kit ben separati</small>';
`,
  metti:
`  $('btnSetDalt').innerHTML='ALTO CONTRASTO: '+(SAVE.dalt?'SÌ':'NO')+
    ' <small>daltonismo: kit ben separati</small>';
  $('btnSetSott').innerHTML='SOTTOTITOLI: '+(SAVE.sott?'SÌ':'NO')+' <small>fischio, gol, palo — a video</small>';
`,
},

/* 6/12 — refreshImpostUI: la manopola smaltata, carbonio di btnSetDalt. */
{
  nome: '6/12 refreshImpostUI: classList.toggle di btnSetSott',
  cerca:
`  $('btnSetDalt').classList.toggle('on', !!SAVE.dalt);
`,
  metti:
`  $('btnSetDalt').classList.toggle('on', !!SAVE.dalt);
  $('btnSetSott').classList.toggle('on', !!SAVE.sott);
`,
},

/* 7/12 — refreshImpostUI: aria-pressed, sul modello del compito 1. */
{
  nome: '7/12 refreshImpostUI: aria-pressed di btnSetSott',
  cerca:
`  $('btnSetDalt').setAttribute('aria-pressed', SAVE.dalt?'true':'false');
`,
  metti:
`  $('btnSetDalt').setAttribute('aria-pressed', SAVE.dalt?'true':'false');
  $('btnSetSott').setAttribute('aria-pressed', SAVE.sott?'true':'false');
`,
},

/* 8/12 — il gestore di clic, carbonio di btnSetDalt (senza applyKit/
   refreshTeamRGB: i sottotitoli non toccano kit o colori). */
{
  nome: '8/12 handler di btnSetSott',
  cerca:
`$('btnSetDalt').addEventListener('click', ()=>{
  SAVE.dalt = SAVE.dalt?0:1; persistSave(); applyKit(); refreshTeamRGB(); refreshImpostUI(); Audio5.beep(520);
});
`,
  metti:
`$('btnSetDalt').addEventListener('click', ()=>{
  SAVE.dalt = SAVE.dalt?0:1; persistSave(); applyKit(); refreshTeamRGB(); refreshImpostUI(); Audio5.beep(520);
});
$('btnSetSott').addEventListener('click', ()=>{
  SAVE.sott = SAVE.sott?0:1; persistSave(); refreshImpostUI(); Audio5.beep(600);
});
`,
},

/* 9/12 — FISCHIO D'INIZIO: dentro startMatch(), il fischio di OGNI
   singola partita. E' il piu' esercitato di tutti in CPU-CPU: nessuna
   scena da costruire, basta un kickoff qualsiasi. */
{
  nome: '9/12 sottotitolo FISCHIO — startMatch (fischio d\'inizio)',
  cerca:
`  Audio5.crowdLevel(1);
  Audio5.whistle(false);
`,
  metti:
`  Audio5.crowdLevel(1);
  Audio5.whistle(false);
  /* SOTTOTITOLO (voce #112, compito 4): il fischio d'inizio non aveva
     nessun banner adiacente -- e' il fischio che OGNI singola partita
     CPU-CPU suona al kickoff, quindi il piu' esercitato di tutti. */
  sottotitolo('FISCHIO','#96ab9e',0.9);
`,
},

/* 10/12 — FISCHIO FINALE: dentro endMatch(). Il risultato compare solo
   un fotogramma piu' tardi sulla schermata di fine: durante quel
   fotogramma il fischio era muto anche a video. */
{
  nome: '10/12 sottotitolo FISCHIO FINALE — endMatch',
  cerca:
`  chiudiSfida();
  Audio5.whistle(true);
  Audio5.crowdLevel(0.4);
`,
  metti:
`  chiudiSfida();
  Audio5.whistle(true);
  /* SOTTOTITOLO (voce #112, compito 4): il fischio finale non aveva
     nessun banner -- 'FISCHIO FINALE' arriva solo un fotogramma piu'
     tardi, scritto sulla schermata di fine partita (ui.endVinc). */
  sottotitolo('FISCHIO FINALE','#96ab9e',0.9);
  Audio5.crowdLevel(0.4);
`,
},

/* 11/12 — FISCHIO RIPRESA (primo dei due rami gemelli): il kickoff dopo
   la moviola. Ancora della coda: la riga successiva ("if(G.sceneT>=2.7)")
   compare una volta sola nel file, quindi disambigua dal gemello. */
{
  nome: '11/12 sottotitolo FISCHIO — ripresa dopo il gol (ramo moviola)',
  cerca:
`      resetKickoff(); setScene('kickoff'); Audio5.whistle(false);
      return;
    }
    if(G.sceneT>=2.7){
`,
  metti:
`      resetKickoff(); setScene('kickoff'); Audio5.whistle(false);
      /* SOTTOTITOLO (voce #112, compito 4): il fischio della ripresa
         dopo il gol non aveva un banner adiacente. */
      sottotitolo('FISCHIO','#96ab9e',0.9);
      return;
    }
    if(G.sceneT>=2.7){
`,
},

/* 12/12 — FISCHIO RIPRESA (secondo ramo gemello): stesso kickoff, senza
   moviola. Ancora della coda: la riga "if(G.scene!=='play' &&..." dopo
   la chiusura del blocco compare una volta sola, disambigua dal gemello
   sopra. */
{
  nome: '12/12 sottotitolo FISCHIO — ripresa dopo il gol (ramo senza moviola)',
  cerca:
`      resetKickoff(); setScene('kickoff'); Audio5.whistle(false);
    }
    return;
  }
  if(G.scene!=='play' && G.scene!=='golden') return;
`,
  metti:
`      resetKickoff(); setScene('kickoff'); Audio5.whistle(false);
      /* SOTTOTITOLO (voce #112, compito 4): stesso fischio muto del
         ramo moviola qui sopra, stessa cura. */
      sottotitolo('FISCHIO','#96ab9e',0.9);
    }
    return;
  }
  if(G.scene!=='play' && G.scene!=='golden') return;
`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-sottotitoli.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}

/* controlli dopo la sostituzione: i ganci che il gioco e il banco si
   aspettano di trovare */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['sott:1,', 1],
  ["if(j.sott===0||j.sott===1) s.sott=j.sott;", 1],
  ['id="btnSetSott"', 1],
  ["$('btnSetSott')", 4],   // innerHTML + classList + aria-pressed + handler
  ['function sottotitolo(testo,col,dur){ if(SAVE.sott) showBanner(testo,col,dur); }', 1],
  ["sottotitolo('FISCHIO','#96ab9e',0.9);", 3],       // inizio + due ripresa
  ["sottotitolo('FISCHIO FINALE','#96ab9e',0.9);", 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    ora: node strumenti/_q-accessibile.js   deve dare 6/6');
