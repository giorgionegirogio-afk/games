/* =====================================================================
   RIFERIMENTO — va a prendere il metro invece di inventarselo.

   Il difetto piu grave del lavoro fatto finora: i critici davano voti su
   una scala appesa al nulla, perche' non avevano mai visto un gioco di
   quella categoria. Questo strumento raccoglie il materiale vero — le
   schermate che gli studi stessi scelgono per la vetrina dello store, e
   fotogrammi di partite riprese — e lo mette in una cartella che gli
   agenti possono aprire e guardare.

   A che serve e a che NON serve. Serve a CALIBRARE: quanta densita' ha
   un'interfaccia di mestiere, quanti fotogrammi ha un ciclo di corsa,
   come e' trattata la luce. NON serve a copiare: niente marchi, niente
   nomi, niente divise, niente disegni altrui finiscono nel nostro gioco,
   che deve restare originale e vendibile. Il materiale resta in locale e
   non entra nel repository (vedi .gitignore).

   uso:
     node strumenti/riferimento.js --store            schermate dagli store
     node strumenti/riferimento.js --video <url> --n 12 --sec 3
     node strumenti/riferimento.js --cerca "soccer stars gameplay"
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const DEST = path.join(RADICE, 'riferimenti');

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}

/* I termini di paragone. Scelti perche' sono, nella categoria, quelli che
   hanno venduto di piu' o che hanno la rifinitura migliore. */
const APP = [
  { id: 'com.ea.gp.fifamobile', nome: 'fifa-mobile', perche: 'il metro indicato dal committente' },
  { id: 'com.firstouchgames.smtp', nome: 'score-match', perche: 'calcio arcade a squadre, dallalto' },
  { id: 'com.miniclip.soccerstars', nome: 'soccer-stars', perche: 'calcio dallalto, il piu vicino a noi' },
  { id: 'com.masomo.headball2', nome: 'head-ball-2', perche: 'arcade veloce, rifinitura alta' },
  { id: 'com.miniclip.eightballpool', nome: '8-ball-pool', perche: 'non e calcio: e li per la cura dellinterfaccia' },
];

async function daStore(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 2000 }, locale: 'it-IT',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  });
  const pag = await ctx.newPage();
  let totale = 0;

  for (const a of APP) {
    const cart = path.join(DEST, a.nome);
    fs.mkdirSync(cart, { recursive: true });
    try {
      await pag.goto(`https://play.google.com/store/apps/details?id=${a.id}&hl=it`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await pag.waitForTimeout(2500);

      /* le schermate della vetrina stanno su play-lh.googleusercontent.com;
         il suffisso =w### decide la misura, quindi si chiede il grande */
      const url = await pag.evaluate(() => {
        const viste = new Set();
        for (const im of document.querySelectorAll('img')) {
          const s = im.src || '';
          if (!s.includes('play-lh.googleusercontent.com')) continue;
          const w = im.naturalWidth || 0, h = im.naturalHeight || 0;
          if (w < 200 || h < 200) continue;               // icone e loghi fuori
          viste.add(s.split('=')[0] + '=w1600');
        }
        return [...viste];
      });

      let n = 0;
      for (const u of url.slice(0, 8)) {
        const r = await pag.request.get(u, { timeout: 30000 }).catch(() => null);
        if (!r || !r.ok()) continue;
        fs.writeFileSync(path.join(cart, `vetrina-${String(++n).padStart(2, '0')}.png`), await r.body());
      }
      totale += n;
      console.log(`  ${a.nome.padEnd(16)} ${String(n).padStart(2)} schermate   (${a.perche})`);
      if (!n) console.log('      nessuna immagine: la pagina potrebbe aver chiesto il consenso o cambiato struttura');
    } catch (e) {
      console.log(`  ${a.nome.padEnd(16)} FALLITO: ${e.message.split('\n')[0]}`);
    }
  }
  await ctx.close();
  return totale;
}

async function daVideo(browser, url, n, sec, nome) {
  const cart = path.join(DEST, nome || 'video');
  fs.mkdirSync(cart, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 }, locale: 'it-IT',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
  });
  const pag = await ctx.newPage();
  await pag.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await pag.waitForTimeout(4000);

  /* il consenso di YouTube, se compare, blocca tutto */
  for (const t of ['Accetta tutto', 'Rifiuta tutto', 'Accept all', 'Reject all']) {
    const b = pag.getByRole('button', { name: t });
    if (await b.count().catch(() => 0)) { await b.first().click().catch(() => {}); await pag.waitForTimeout(1500); break; }
  }

  const video = pag.locator('video').first();
  await video.waitFor({ state: 'attached', timeout: 30000 });
  await pag.evaluate(() => { const v = document.querySelector('video'); if (v) { v.muted = true; v.play().catch(() => {}); } });
  await pag.waitForTimeout(3000);

  let fatti = 0;
  for (let i = 0; i < n; i++) {
    await pag.waitForTimeout(sec * 1000);
    const b = await video.screenshot().catch(() => null);
    if (b) fs.writeFileSync(path.join(cart, `f-${String(++fatti).padStart(2, '0')}.png`), b);
  }
  await ctx.close();
  console.log(`  ${fatti} fotogrammi in riferimenti/${nome || 'video'}/`);
  return fatti;
}

(async () => {
  fs.mkdirSync(DEST, { recursive: true });
  const browser = await chromium.launch();
  try {
    if (process.argv.includes('--store')) {
      console.log('Schermate di vetrina dagli store:');
      const t = await daStore(browser);
      console.log(`\n${t} immagini in riferimenti/`);
    }
    const v = arg('video', null);
    if (v) {
      console.log('Fotogrammi da video:');
      await daVideo(browser, v, +arg('n', 12), +arg('sec', 3), arg('nome', null));
    }
    if (!process.argv.includes('--store') && !v) {
      console.log('uso: --store  oppure  --video <url> [--n 12] [--sec 3] [--nome cartella]');
    }
  } finally { await browser.close(); }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
