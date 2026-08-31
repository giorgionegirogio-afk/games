/* =====================================================================
   _z-sd-identico.js — LA TOPPA DEI GANCI NON TOCCA IL GIOCO.

   _t-senza-dischi.js aggiunge una bandiera di sola resa e due chiavi in
   __test. A bandiera spenta il gioco deve essere IDENTICO: non «quasi»,
   non «non si nota». Qui si misura, con la posa ferma di _posa.js — la
   sola condizione in cui due scatti dello stesso gioco coincidono byte
   per byte — a tre taglie.

   uso: node strumenti/_z-sd-identico.js
        node strumenti/_z-sd-identico.js --a CALCETTO-il-gioco.html --b fuori/_sd-cura.html
   ===================================================================== */
const path = require('path');
const { chromium } = require('playwright');
const { servi, bancoDiProva, semeFisso, posaFerma, scattoRipetibile } = require('./_posa.js');

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const A = arg('a', 'CALCETTO-il-gioco.html');
const B = arg('b', 'fuori/_sd-cura.html');

(async () => {
  const srv = await servi();
  const br = await chromium.launch();
  const scatti = {};
  for (const gioco of [A, B]) {
    const ctx = await br.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, 20260828);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/${gioco}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.waitForTimeout(400);
    scatti[gioco] = {};
    for (const taglia of [5, 7, 11]) {
      await posaFerma(pag, { taglia });
      scatti[gioco][taglia] = await scattoRipetibile(pag, null);
    }
    /* e i due ganci esistono solo dove devono */
    scatti[gioco].ganci = await pag.evaluate(() => ({
      senzaDischi: typeof window.__test.senzaDischi,
      soloDischi: typeof window.__test.soloDischi,
      setTouchButtons: typeof window.__test.setTouchButtons,
    }));
    /* =================================================================
       LA LEGGE SUI SORTEGGI, MISURATA A RUNTIME E NON SOLO CONTATA NEL
       TESTO. Il conto delle CHIAMATE a dado() nel sorgente lo verifica
       gia' la toppa; qui si guarda la cosa che conta davvero — quanti
       numeri la partita tira dal generatore comune. Stesso seme, stessa
       taglia, stessi passi: se i due giochi non tirano lo STESSO numero
       di sorteggi, non stanno giocando la stessa partita e ogni
       confronto costruito sopra e' aria.
       ================================================================= */
    scatti[gioco].sorteggi = await pag.evaluate(() => {
      const t = window.__test, B = window.__banco;
      t.semina(20260828); t.setCpuVsCpu(true);
      t.startMatch(1, 1, { size: 11 });
      const a = t.sorteggi;
      for (let i = 0; i < 1800; i++) B.passo(1);
      return { dopoStart: a, dopo1800: t.sorteggi, palla: [+t.ball.x.toFixed(6), +t.ball.y.toFixed(6)],
               punteggio: t.score.join('-') };
    });
    await ctx.close();
  }
  await br.close(); srv.chiudi();

  console.log('\n=== LA TOPPA DEI GANCI NON TOCCA IL GIOCO ===');
  console.log('  A  ' + A + '   ganci ' + JSON.stringify(scatti[A].ganci));
  console.log('  B  ' + B + '   ganci ' + JSON.stringify(scatti[B].ganci));
  let male = 0;
  for (const taglia of [5, 7, 11]) {
    const a = scatti[A][taglia], b = scatti[B][taglia];
    const uguali = Buffer.compare(a, b) === 0;
    if (!uguali) male++;
    console.log('  ' + (uguali ? ' ok ' : 'ROSSO') + '  taglia ' + String(taglia).padStart(2)
      + ': ' + (uguali ? 'IDENTICI al byte' : 'DIVERSI') + ' (' + a.length + ' e ' + b.length + ' byte)');
  }
  const sa = scatti[A].sorteggi, sb = scatti[B].sorteggi;
  const semeOk = JSON.stringify(sa) === JSON.stringify(sb);
  if (!semeOk) male++;
  console.log('  ' + (semeOk ? ' ok ' : 'ROSSO') + '  la legge sui sorteggi: 1800 passi a seme 20260828, 11 contro 11');
  console.log('           A ' + JSON.stringify(sa));
  console.log('           B ' + JSON.stringify(sb));
  if (male) { console.log('\nROSSO: la toppa cambia qualcosa a bandiera spenta.\n'); process.exit(1); }
  console.log('\nVERDE: a bandiera spenta i due giochi dipingono lo stesso fotogramma a tre taglie, e tirano gli stessi sorteggi.\n');
})();
