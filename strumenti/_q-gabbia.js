/* =====================================================================
   GABBIA — il banco delle proporzioni delle figure.

   PERCHE' ESISTE. «Marionette cadute», «spaghetti con la testa»,
   «proporzioni incoerenti fra figure vicine»: sono giudizi, finche'
   nessuno li misura. Sotto ci sta un fatto geometrico verificabile —
   se la cinematica diretta e' onesta, la distanza fra due giunti
   collegati da un OSSO vale sempre la stessa, in ogni clip, a ogni
   fase. Quando invece un gomito viene piazzato con uno scostamento
   LATERALE additivo, o un ginocchio a meta' strada fra anca e piede,
   o un piede alzato di forza perche' non buchi il terreno, allora la
   lunghezza dell'osso cambia col movimento: e' letteralmente lo
   spaghetto, e due giocatori nella stessa andatura a fase diversa
   hanno arti visibilmente diversi.

   COSA MISURA. Apre la pagina del gioco con ?gabbia. La pagina valuta
   la STESSA pose() della partita — non un disegno «a modo suo», che
   mentirebbe — su ogni clip x 64 fasi, e per ogni osso stampa lo
   scarto percentuale peggiore dalla lunghezza nominale. Piu' due
   invarianti che proteggono i cancelli vicini:
     - QUOTA: nessun giunto sotto il piano del campo (i piedi non
       bucano il terreno, e il contatto si risolve sull'ANGOLO nel
       foglio delle pose, mai accorciando la tibia a disegno);
     - CIMA: l'altezza della testa in unita' di SCHERMO. La sonda dell'ERBA di collaudo.js
       esclude i punti dentro una scatola attorno agli altri corpi
       (fino a -26 unita' schermo sopra il centro): se le figure si
       alzano, l'erba misurata si contamina di pelle e capelli e il
       rapporto di contrasto cambia senza che la maglia sia stata
       toccata. Un guasto che si presenta come un guasto della maglia
       e fa cercare nel posto sbagliato.

   USO:  node strumenti/gabbia.js
         node strumenti/gabbia.js --tolleranza 1.0
         node strumenti/gabbia.js --clip corsa
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
/* --- innesto di _q-banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? __PROVA : f;

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const TOLL = parseFloat(arg('tolleranza', '1.0'));   // scarto massimo per osso, in %
const SOLO = arg('clip', null);
/* QUANTO PUO' SCENDERE UN GIUNTO SOTTO IL CAMPO, e perche' non zero.
   Un giunto non e' un punto della figura: e' il CENTRO di una capsula
   larga da 0,17 m (avambraccio) a 0,24 m (coscia). Le pose di contatto —
   il ginocchio della scivolata, la mano che si appoggia nella caduta
   della rovesciata, il ginocchio a terra della parata — hanno il giunto
   sul manto per definizione, e il suo centro affonda di mezza capsula
   senza che un solo pixel del corpo scenda sotto l'erba.
   Il cancello vero e' quello: -0,05 m e' meno di mezza coscia. Sopra
   quella soglia non e' piu' contatto, e' un arto sepolto. */
const FONDO = -0.05;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = __rid(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html'
          : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const pg = await br.newPage();
  const righe = [];
  pg.on('console', m => righe.push(m.text()));
  pg.on('pageerror', e => righe.push('ERRORE ' + e.message));
  /* cache-busting: senza, il browser rilegge il file di ieri e il banco
     misura una versione che non e' quella che stai scrivendo */
  await pg.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html?gabbia&t=${Date.now()}`);
  await pg.waitForTimeout(2200);
  await br.close(); srv.chiudi();

  const riga = righe.find(r => r.startsWith('[gabbia]'));
  if (!riga) {
    console.log('BANCO MUTO — la pagina non ha stampato niente.');
    for (const r of righe.slice(0, 12)) console.log('   ' + r);
    process.exit(1);
  }
  if (riga.includes('fallito')) { console.log(riga); process.exit(1); }
  const dati = JSON.parse(riga.slice(9));

  console.log(`\n=== GABBIA: ${dati.clip.length} clip x ${dati.fasi} fasi x ${dati.corpi || 1} corporature ===\n`);
  console.log('  clip           osso peggiore      scarto     quota min   cima testa   tagli');
  let rossi = 0, bucati = 0;
  for (const c of dati.clip) {
    if (SOLO && c.clip !== SOLO) continue;
    const male = Math.abs(c.peggio) > TOLL;
    const buca = c.quota < FONDO;
    if (male) rossi++;
    if (buca) bucati++;
    console.log(
      `  ${male || buca ? 'X ' : '  '}${c.clip.padEnd(12)} ${(c.osso || '-').padEnd(16)} ` +
      `${(c.peggio >= 0 ? '+' : '') + c.peggio.toFixed(2)}%`.padStart(9) +
      `   ${c.quota.toFixed(4).padStart(8)} ${(c.giunto || '').padEnd(11)} ${c.cima.toFixed(3)}` +
      `   ${String(c.tagli == null ? '-' : c.tagli).padStart(5)}`);
    if (male) {
      const det = Object.entries(c.ossa)
        .filter(([, v]) => Math.abs(v) > TOLL)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}%`).join(', ');
      console.log('       fuori gabbia: ' + det);
    }
  }
  /* ============ QUANTO LA SCATOLA DEGLI ANGOLI HA DOVUTO CORREGGERE ===
     Un taglio non e' un errore: e' la scatola che fa il suo mestiere. Ma
     una posa CORRETTA a ogni fotogramma e' una posa scritta male, e il
     rimedio giusto e' cambiare il numero nel foglio, non lasciare che sia
     il clamp a riscriverlo sessanta volte al secondo. Percio' il numero
     si stampa: non e' un cancello, e' una lista di lavori da fare. */
  const conTagli = dati.clip.filter(c => c.tagli > 0);
  if (conTagli.length) {
    console.log(`
  la scatola degli angoli corregge ${conTagli.length} clip su ${dati.clip.length}: ` +
      conTagli.sort((a, b) => b.tagli - a.tagli).map(c => `${c.clip} ${c.tagli}`).join(', '));
    console.log('     (su ' + (dati.fasi * (dati.corpi || 1) * 4) + ' angoli valutati per clip; ' +
      'una posa corretta sempre va riscritta nel foglio, non lasciata al clamp)');
  }
  /* ================== L'INVARIANTE DELL'ERBA ==================
     La sonda del contrasto di collaudo.js misura un rapporto fra la
     maglia e l'erba, e l'erba la campiona in un anello attorno a ogni
     giocatore, escludendo i punti dentro una scatola sui corpi vicini:
     centro verticale +2, semialtezza 28, cioe' fino a -26 unita' sopra
     il centro. La cima della testa sta gia' oltre quel confine, e quel
     pezzetto di capelli finisce fra i campioni d'ERBA dei compagni.
     Non e' un guasto oggi (la mediana lo assorbe) ma e' un guasto in
     attesa: se le figure si alzano, o la testa cresce, il denominatore
     del rapporto si sposta verso il colore della pelle e il numero
     cambia SENZA che la maglia sia stata toccata. Un guasto che si
     presenta come un guasto della maglia e fa cercare nel posto
     sbagliato — e' successo, ed e' scritto fra i rischi dell'onda.
     Per questo il cancello non e' "sopra -26" (sarebbe rosso da sempre)
     ma "NON PIU' IN ALTO DI COM'ERA": il riferimento e' misurato, e chi
     alzera' le figure lo trovera' rosso qui e non in collaudo.js.
     -34,4 era il valore del 15 agosto 2026 a corporatura unica, clip
     'presa' (il portiere che salta a prendere alta: la testa piu' alta
     di tutto il parco). Con le TRE CORPORATURE nel giro il banco misura
     anche il piccoletto, che sulla stessa clip arriva a -34,58: la
     testa gli e' piu' grossa del 5% per RAPPORTO (il corpo e' piu'
     compatto), e quei due decimi di unita' sono il prezzo dichiarato
     della varieta'. La lunghezza delle GAMBE invece non varia affatto
     fra le corporature, ed e' una rinuncia misurata: alzare o abbassare
     il bacino di cinque centimetri spostava la finestra della sonda del
     contrasto e costava fino a 0,6 di rapporto sulla maglia P1. Il riferimento si rettifica in chiaro, con la data, non
     si allarga la tolleranza. */
  const CIMA_RIF = -34.6;   // 15 agosto 2026, clip 'presa', corporatura piccoletto
  const cimaMin = Math.min(...dati.clip.map(c => c.cima));
  const chiCima = dati.clip.find(c => c.cima === cimaMin);
  console.log(`\n  cima della testa piu' alta: ${cimaMin.toFixed(2)} unita' di schermo ` +
    `(clip ${chiCima.clip}${chiCima.corpCima ? ', ' + chiCima.corpCima : ''}; ` +
    `riferimento ${CIMA_RIF}, l'anello d'erba comincia a -26)`);
  const cimaOK = cimaMin >= CIMA_RIF - 0.5;
  if (!cimaOK) console.log("  ATTENZIONE: le figure si sono ALZATE — la sonda dell'erba misurera' piu' capelli.");
  if (rossi === 0 && bucati === 0 && cimaOK) {
    console.log(`\nVERDE: tutte le ossa entro ±${TOLL.toFixed(1)}%, nessun giunto affondato nel campo, ` +
      `figure non piu' alte del riferimento.\n`);
  } else {
    console.log(`\nROSSO: ${rossi} clip con ossa fuori gabbia, ${bucati} con giunti affondati nel campo` +
      (cimaOK ? '.' : ", e le figure si sono alzate.") + '\n');
    process.exit(1);
  }
})();
