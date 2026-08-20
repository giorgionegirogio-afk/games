/* =====================================================================
   _q-manto.js — IL CANCELLO DEL MANTO: la superficie piu' vista del gioco
   deve arrivare all'occhio alla densita' a cui e' stata dipinta.

   IL DIFETTO CHE MISURA. La tessitura del campo e' cotta allo zoom di
   riposo e la camera di gioco la ingrandisce (misurato alla posa standard
   di _posa.js sul gioco di oggi: 1,672x a 5 contro 5, 2,298x a 7, 3,222x
   a 11) con l'interpolazione spenta: il dettaglio del manto — seimila
   schegge d'erba, grana, calpestio — vive a due-tre pixel invece che a
   uno, cioe' arriva sfocato.

   DUE NUMERI INDIPENDENTI, alle TRE taglie (5, 7, 11), sulla posa
   RIPETIBILE di _posa.js (due scatti identici al byte, verificato):

   (a) IL RAPPORTO DELLE DENSITA', letto a runtime: densita' chiesta dallo
       schermo (S2*DPR) diviso densita' della tessitura DISEGNATA in
       quell'istante. Sul gioco di oggi la tessitura disegnata in partita
       e' sempre fieldTex (fieldTexTS); se una toppa introduce un'altra
       sorgente deve dichiararla in __test.manto.cotta, e il numero (b)
       qui sotto verifica SUI PIXEL che la dichiarazione non menta.
       Soglia: <= 1,05.

   (b) LA PROVA SUI PIXEL, che non crede a nessuna dichiarazione: media di
       |delta L| fra pixel orizzontali a passo 1 e a passo 2, sui soli
       pixel di manto (famiglia del prato: tinta 90-175, sat>=0,12,
       v>=0,18 — la stessa famiglia di _manto.js e istantanea.js), dentro
       l'area di gioco dichiarata da __test.bande. Se il dettaglio vive a
       due pixel (upscaling 2x), |dL| a passo 2 e' molto maggiore che a
       passo 1: oggi il rapporto e' ~1,5. Se il dettaglio vive a un pixel,
       i due numeri quasi coincidono (nella scena del gol, dove il fondale
       e' gia' cotto alla risoluzione dello schermo, fu misurato 1,03).
       Soglia: passo2/passo1 <= 1,10.
       I PIXEL SI LEGGONO DAL CANVAS DEL GIOCO, non dallo scatto di
       pagina: alla posa standard il gioco e' in pausa e sopra il canvas
       c'e' il velo DOM della pausa — misurato: al centro dello scatto di
       pagina c'e' il pannello ambra, e il 69% dell'area di gioco esce
       dalla famiglia del prato per scurita'. Il canvas sotto e' pulito.

   CONTROLLO NEGATIVO: questo cancello e' stato scritto PRIMA della toppa
   e mostrato ROSSO sul gioco di oggi (md5 30279089de83), 6 numeri su 6
   fuori soglia — vedi la consegna. Un cancello mai visto fallire non e'
   un cancello.

   uso:  node strumenti/_q-manto.js [--gioco FILE]
   esce: 0 verde   1 rosso   2 il banco non e' in grado di misurare
   ===================================================================== */
const path = require('path');
const { chromium } = require('playwright');
const { servi, bancoDiProva, semeFisso, posaFerma, disegnaFermo } =
  require(path.resolve(__dirname, '_posa.js'));

const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--') ? process.argv[i+1] : d; };
const GIOCO = arg('gioco', 'CALCETTO-il-gioco.html');

const SOGLIA_RAPPORTO = 1.05;   /* (a) densita' schermo / densita' cotta   */
const SOGLIA_PIXEL    = 1.10;   /* (b) |dL| passo2 / passo1 sul manto      */
const MIN_CAMPIONI    = 200000; /* sotto, il banco si dichiara cieco       */

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport:{width:915,height:412}, deviceScaleFactor:2,
    isMobile:true, hasTouch:true, locale:'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, 20260819);
  await pag.addInitScript(bancoDiProva);
  await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil:'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout:15000 });
  await pag.waitForTimeout(400);

  console.log(`\n=== _q-manto: la densita' del manto alla posa standard — ${GIOCO} ===`);
  console.log(`    soglie: rapporto densita' <= ${SOGLIA_RAPPORTO}, |dL| passo2/passo1 <= ${SOGLIA_PIXEL}\n`);

  let verdi = 0, tot = 0, ciechi = 0;
  for (const taglia of [5, 7, 11]) {
    await posaFerma(pag, { taglia });

    /* (a) il rapporto delle densita', letto a runtime */
    const dens = await pag.evaluate(() => {
      const schermo = (G.view.S2 || 0) * DPR;
      const m = window.__test.manto;
      const cotta = (m && m.cotta > 0) ? m.cotta : fieldTexTS;
      return { schermo: +schermo.toFixed(4), cotta: +cotta.toFixed(4),
               dichiarata: !!(m && m.cotta > 0) };
    });
    const rapporto = dens.schermo / dens.cotta;

    /* (b) la prova sui pixel: si ridisegna fermo e si legge il CANVAS del
       gioco (vedi il cappello: lo scatto di pagina porta il velo di pausa),
       |dL| orizzontale a passo 1 e 2 sui soli pixel di manto. */
    await disegnaFermo(pag);
    const pix = await pag.evaluate(() => {
      const bande = window.__test.bande;
      const y0 = Math.ceil((bande.y0 + 2) * DPR), y1 = Math.floor((bande.y1 - 2) * DPR);
      const W = cv.width;
      const d = cv.getContext('2d').getImageData(0, 0, W, cv.height).data;
      const L = i => 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2];
      const manto = i => {
        const R = d[i], G2 = d[i+1], B = d[i+2];
        const mx = Math.max(R,G2,B), mn = Math.min(R,G2,B), dl = mx-mn;
        if (mx === 0) return false;
        const sat = dl/mx, val = mx/255;
        if (sat < 0.12 || val < 0.18) return false;
        let h = 0;
        if (dl > 0) {
          if (mx === R) h = ((60*(((G2-B)/dl)%6))+360)%360;
          else if (mx === G2) h = 60*((B-R)/dl+2);
          else h = 60*((R-G2)/dl+4);
        }
        return h >= 90 && h <= 175;
      };
      let s1 = 0, s2 = 0, n = 0;
      for (let y = y0; y < y1; y++) {
        const riga = y*W*4;
        for (let x = 2; x < W-4; x++) {
          const i = riga + x*4;
          /* il pixel e i suoi due vicini devono essere TUTTI manto: cosi'
             i bordi di figure, righe di gesso e ombre non entrano nel conto */
          if (!manto(i) || !manto(i+4) || !manto(i+8)) continue;
          const l0 = L(i);
          s1 += Math.abs(L(i+4) - l0);
          s2 += Math.abs(L(i+8) - l0);
          n++;
        }
      }
      return { d1: n ? s1/n : 0, d2: n ? s2/n : 0, n };
    });

    const rapPix = pix.d1 > 0 ? pix.d2 / pix.d1 : Infinity;
    const cieco = pix.n < MIN_CAMPIONI;
    const okA = rapporto <= SOGLIA_RAPPORTO;
    const okB = !cieco && rapPix <= SOGLIA_PIXEL;
    tot += 2; verdi += (okA?1:0) + (okB?1:0); if (cieco) ciechi++;
    console.log(`  taglia ${String(taglia).padStart(2)}:`);
    console.log(`    ${okA?'OK ':'NO '} (a) densita' schermo/cotta = ${dens.schermo.toFixed(3)}/${dens.cotta.toFixed(3)} = ${rapporto.toFixed(3)}  (soglia ${SOGLIA_RAPPORTO}${dens.dichiarata?', cotta dichiarata da __test.manto':''})`);
    console.log(`    ${cieco?'?  ':(okB?'OK ':'NO ')} (b) |dL| passo1 ${pix.d1.toFixed(3)}  passo2 ${pix.d2.toFixed(3)}  rapporto ${rapPix.toFixed(3)}  (soglia ${SOGLIA_PIXEL}, ${pix.n} campioni di manto)`);
    if (cieco) console.log(`        troppo pochi campioni di manto (<${MIN_CAMPIONI}): il numero (b) non giudica.`);
  }
  await br.close(); srv.chiudi();
  if (ciechi) { console.log(`\nCIECO su ${ciechi} taglie: niente verdetto.`); process.exit(2); }
  console.log(`\n${tot} numeri, ${verdi} dentro soglia, ${tot-verdi} fuori -> ${verdi===tot?'VERDE':'ROSSO'}`);
  process.exit(verdi === tot ? 0 : 1);
})().catch(e => { console.error('FALLITO:', e); process.exit(1); });
