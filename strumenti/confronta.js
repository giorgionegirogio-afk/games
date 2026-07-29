/* =====================================================================
   CONFRONTA — mette prima e dopo uno accanto all'altro, scena per scena.

   Serve perche' guardando solo il "dopo" si vedono i miglioramenti e si
   perdono i peggioramenti: nella prima onda di lavoro ogni giro barattava
   un pregio con un difetto e nessuno se ne accorgeva finche' non era tardi.
   Qui il baratto si vede a colpo d'occhio.

   uso:  node strumenti/confronta.js foto-prima foto-dopo --dir confronto
         node strumenti/confronta.js --daGit HEAD~1 circolo --dir confronto
   Produce un PNG per scena: a sinistra PRIMA, a destra DOPO, con etichette,
   piu' un riepilogo delle scene che mancano da una parte o dall'altra.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

function arg(nome, difetto) {
  const i = process.argv.indexOf('--' + nome);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : difetto;
}

(async () => {
  const liberi = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const dirA = liberi[0], dirB = liberi[1];
  if (!dirA || !dirB) { console.error('uso: node strumenti/confronta.js <cartella-prima> <cartella-dopo> [--dir uscita]'); process.exit(1); }
  const uscita = arg('dir', 'confronto');
  const soloSe = arg('solo', null);

  const elenco = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith('.png')) : [];
  const a = new Set(elenco(dirA)), b = new Set(elenco(dirB));
  const comuni = [...b].filter(f => a.has(f)).filter(f => !soloSe || f.includes(soloSe)).sort();

  const soloA = [...a].filter(f => !b.has(f));
  const soloB = [...b].filter(f => !a.has(f));
  if (soloA.length) console.log('scene sparite nel dopo: ' + soloA.join(', '));
  if (soloB.length) console.log('scene nuove nel dopo:   ' + soloB.join(', '));

  fs.mkdirSync(uscita, { recursive: true });
  const browser = await chromium.launch();
  const pag = await browser.newPage();

  for (const f of comuni) {
    const p1 = 'data:image/png;base64,' + fs.readFileSync(path.join(dirA, f)).toString('base64');
    const p2 = 'data:image/png;base64,' + fs.readFileSync(path.join(dirB, f)).toString('base64');
    /* le due immagini si mettono alla stessa altezza, cosi' le differenze di
       proporzione saltano all'occhio invece di nascondersi nella scala */
    await pag.setContent(`
      <style>
        body{margin:0;background:#15171a;font:600 13px ui-monospace,Consolas,monospace;color:#cfd6dd}
        .riga{display:flex;gap:2px;align-items:flex-start}
        .col{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center}
        .et{padding:6px 0;letter-spacing:.14em;text-transform:uppercase}
        .prima .et{color:#8b98a5} .dopo .et{color:#c6f24e}
        img{max-width:100%;height:auto;display:block;border-top:2px solid #23272c}
        h1{font-size:14px;margin:0;padding:9px 12px;background:#0e1013;color:#eef3f7;letter-spacing:.1em}
      </style>
      <h1>${f.replace('.png', '')}</h1>
      <div class="riga">
        <div class="col prima"><div class="et">prima</div><img src="${p1}"></div>
        <div class="col dopo"><div class="et">dopo</div><img src="${p2}"></div>
      </div>`);
    await pag.setViewportSize({ width: 1600, height: 100 });
    const alt = await pag.evaluate(() => document.body.scrollHeight);
    await pag.setViewportSize({ width: 1600, height: Math.min(4000, alt) });
    await pag.screenshot({ path: path.join(uscita, f), fullPage: true });
    console.log('  ' + f);
  }

  await browser.close();
  console.log(`\n${comuni.length} confronti in ${uscita}/`);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
