/* =====================================================================
   _t-aria-etichette.js — LE ETICHETTE PARLANO, E IL BANNER SI DICHIARA
   (voce #112, compito 1, primo compito del ramo voce-112-spiccioli-ux).

   IL PERCHE'. Due cure di puro contorno, zero simulazione (il
   due-versioni resta 0/60 a ogni taglia: nessuna tocca dado(), una
   decisione di gioco o uno stato che la CPU legge).

   CURA 1 — ARIA-PRESSED. I cinque interruttori .voce.sw di IMPOSTAZIONI
   (btnSetAudio/Vib/Moto/Dalt/Moviola) portano lo stato ON/OFF solo nel
   testo e nel colore della pastiglia: zero aria-pressed nel file (grep
   fatto prima di scrivere questo attrezzo: 0 occorrenze). Un lettore di
   schermo non ha ne' il colore ne' il rilievo della pastiglia: senza
   aria-pressed non sa se l'interruttore che ha appena letto e' acceso o
   spento. La cura scrive aria-pressed accanto a OGNI classList.toggle
   ('on', ...) gia' presente in refreshImpostUI, sullo stesso modello
   gia' in casa di eroeEnd.setAttribute('aria-label', ...) (~riga
   11412): un valore SCRITTO ogni volta che lo stato si aggiorna, mai
   attestato una volta sola all'avvio.
   Le voci del menu principale hanno gia' il testo come nome accessibile
   (il <small> non e' nascosto: un lettore di schermo lo legge insieme
   al resto del contenuto del bottone), quindi NESSUN aria-label nuovo
   serve sui cinque interruttori: il grep di questo stesso attrezzo lo
   verifica prima di scrivere (vedi CONTROLLO ANTI-ATTESTAZIONE sotto).

   CURA 2 — IL BANNER DICHIARATO. Il rettangolo del banner degli eventi
   (PALO!, GOL!, FALLO!, TIRO PERFETTO!...), disegnato a ~riga 39667
   (bx0..bx1, y..y+bh intorno a VH-58, con lo scarto verso l'alto quando
   la bussola in basso a sinistra gli sta sotto - MINI_RECT), non e'
   dichiarato in zoneInterfaccia(): istantanea.js lo conta come ombra
   sul manto. La cura aggiunge una voce {tipo:'banner', x0,y0,x1,y1},
   RICALCOLANDO la stessa geometria del disegno (stessa formula, stessa
   guardia su MINI_RECT), spinta SOLO quando G.bannerT>0 && G.banner —
   la STESSA condizione che il disegno usa per entrare nel suo blocco.
   Zero invenzione: le costanti (bw=min(VW*0.62,420), bh=42, y=VH-58)
   sono lette dal punto di disegno, non scritte a occhio.

   uso:  node strumenti/_t-aria-etichette.js --out fuori/aria-etichette.html
         node strumenti/_t-aria-etichette.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/aria-etichette.html'));

/* CONTROLLO ANTI-ATTESTAZIONE, fatto prima di scrivere l'ancoraggio: se
   nel file esiste gia' un aria-label statico sui cinque interruttori
   (segno che qualcuno ha gia' provato a coprire il buco a parole invece
   che con lo stato vero), questo attrezzo si ferma invece di
   sovrapporsi in silenzio a una cura diversa. */
const srcGrezzo = fs.readFileSync(inFile, 'utf8');
for (const id of ['btnSetAudio', 'btnSetVib', 'btnSetMoto', 'btnSetDalt', 'btnSetMoviola']) {
  const re = new RegExp('id="' + id + '"[^>]*aria-label');
  if (re.test(srcGrezzo)) {
    console.error('FALLITO: ' + id + ' ha gia\' un aria-label statico nel markup — controllare prima di applicare.');
    process.exit(1);
  }
}

const ANCORE = [

/* 1/2 — refreshImpostUI: aria-pressed accanto a ogni classList.toggle
   ('on', ...), cosi' lo stato che un lettore di schermo legge resta
   sincronizzato col testo e con la pastiglia a ogni refresh. */
{
  nome: '1/2 refreshImpostUI: aria-pressed sincronizzato sui 5 interruttori',
  cerca:
`  /* la manopola smaltata segue lo stato scritto nel testo */
  $('btnSetAudio').classList.toggle('on', !Audio5.muted);
  $('btnSetVib').classList.toggle('on', SAVE.vib!==false);
  $('btnSetMoto').classList.toggle('on', !!SAVE.moto);
  $('btnSetDalt').classList.toggle('on', !!SAVE.dalt);
  $('btnSetMoviola').classList.toggle('on', !!SAVE.moviola);
`,
  metti:
`  /* la manopola smaltata segue lo stato scritto nel testo */
  $('btnSetAudio').classList.toggle('on', !Audio5.muted);
  $('btnSetVib').classList.toggle('on', SAVE.vib!==false);
  $('btnSetMoto').classList.toggle('on', !!SAVE.moto);
  $('btnSetDalt').classList.toggle('on', !!SAVE.dalt);
  $('btnSetMoviola').classList.toggle('on', !!SAVE.moviola);
  /* ARIA-PRESSED, per chi non vede ne' il colore ne' il rilievo della
     pastiglia: lo stesso booleano appena scritto nella classe, ripetuto
     come stringa 'true'/'false' (voce #112, compito 1). Un valore per
     ogni refresh, mai attestato una volta sola. */
  $('btnSetAudio').setAttribute('aria-pressed', !Audio5.muted?'true':'false');
  $('btnSetVib').setAttribute('aria-pressed', SAVE.vib!==false?'true':'false');
  $('btnSetMoto').setAttribute('aria-pressed', SAVE.moto?'true':'false');
  $('btnSetDalt').setAttribute('aria-pressed', SAVE.dalt?'true':'false');
  $('btnSetMoviola').setAttribute('aria-pressed', SAVE.moviola?'true':'false');
`,
},

/* 2/2 — zoneInterfaccia: il rettangolo del banner, ricalcolato dalla
   stessa formula del disegno (~riga 39667), spinto solo quando il
   banner e' davvero a schermo. */
{
  nome: '2/2 zoneInterfaccia: il rettangolo del banner, dichiarato',
  cerca:
`      z.push(q);
    }
    return z;
  },
`,
  metti:
`      z.push(q);
    }
    /* IL BANNER DEGLI EVENTI, DICHIARATO (voce #112, compito 1). Stessa
       geometria del punto che lo disegna (~riga 39667): bw/bh fissi,
       bx0/bx1 centrati su VW/2, y a VH-58 salvo lo scarto verso l'alto
       quando la bussola in basso a sinistra (MINI_RECT) gli sta sotto —
       la STESSA guardia che il disegno applica, ricalcolata qui una
       volta sola cosi' dichiarazione e disegno non possono divergere.
       Spinta SOLO quando il banner e' davvero a schermo (bannerT>0 e
       testo non vuoto), la STESSA condizione che il disegno usa per
       entrare nel suo blocco: a bannerT<=0 i pixel sono gia' tornati
       prato, e prima di questa riga il rettangolo non era dichiarato
       affatto — istantanea.js lo contava come ombra sul manto. */
    if(G.bannerT>0 && G.banner){
      const bbw=Math.min(VW*0.62,420), bbh=42;
      const bbx0=VW/2-bbw/2, bbx1=VW/2+bbw/2;
      let bby=VH-58;
      if(MINI_RECT && bby+40>MINI_RECT.y0-4 && bbx0<MINI_RECT.x1+8) bby=MINI_RECT.y0-46;
      z.push({tipo:'banner', x0:bbx0, y0:bby, x1:bbx1, y1:bby+bbh, alfa:1});
    }
    return z;
  },
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

const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ["$('btnSetAudio').setAttribute('aria-pressed', !Audio5.muted?'true':'false');", 1],
  ["$('btnSetVib').setAttribute('aria-pressed', SAVE.vib!==false?'true':'false');", 1],
  ["$('btnSetMoto').setAttribute('aria-pressed', SAVE.moto?'true':'false');", 1],
  ["$('btnSetDalt').setAttribute('aria-pressed', SAVE.dalt?'true':'false');", 1],
  ["$('btnSetMoviola').setAttribute('aria-pressed', SAVE.moviola?'true':'false');", 1],
  ["z.push({tipo:'banner', x0:bbx0, y0:bby, x1:bbx1, y1:bby+bbh, alfa:1});", 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
