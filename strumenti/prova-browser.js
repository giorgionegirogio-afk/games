const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent('<h1 style="font:700 40px system-ui">ok</h1>');
  await p.screenshot({ path: 'prova.png' });
  await b.close();
  console.log('browser ok');
})().catch(e => { console.log('ERRORE:', e.message.split('\n')[0]); process.exit(1); });
