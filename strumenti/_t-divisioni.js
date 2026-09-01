/* =====================================================================
   _t-divisioni.js — IL BANCO DELLA SCALA (Contenuto 1, 1 settembre 2026).

   Partite 1-giocatore a esiti forzati (forceGoal + setTimeLeft, gli
   agganci gia' esposti da __test: nessun hook nuovo), a difficolta'
   dichiarate, e si legge SAVE.div dopo ogni fischio:
     1) tre vittorie a FACILE dal salvataggio vergine -> promozione a
        VICOLO, premio 12 pagato UNA volta (delta saldo contato);
     2) sconfitta a gradino 1 con 0 stelle -> il pavimento dei primi tre
        tiene (niente retrocessione);
     3) ri-salita allo stesso gradino -> il premio NON si ripaga;
     4) gating di fascia 2 (g=3): vittoria FACILE non da' stelle,
        NORMALE si';
     5) gating di fascia 3 (g=6): NORMALE non da', DURO si';
     6) pavimento di FASCIA: sconfitta a g=3/0 stelle -> si resta;
        a g=4/0 stelle -> si scende a g=3 con soglia-1;
     7) il 2 GIOCATORI non muove la scala;
     8) la riga di fine partita (endScala) parla quando la scala si
        muove, e sulla promozione dice PROMOSSO;
     9) salvataggio manomesso (div.g=99, stelle=77) -> tetti applicati
        alla rilettura.

   uso: node strumenti/_t-divisioni.js [--gioco file.html]
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if ((!f.startsWith(RADICE) && f !== prova) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}
const esiti = [];
function verifica(ok, nome, det) {
  esiti.push(ok);
  console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '   (' + det + ')' : ''));
}

(async () => {
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(prova) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== IL BANCO DELLA SCALA ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => {
    window.requestAnimationFrame = () => 0;   // il tempo lo detta il banco
    const t = window.__test; t.dismissSplash && t.dismissSplash();
    if (t.save) t.save.tutorialDone = 1;
  });

  /* una partita a esito forzato: mode, diff, gol nostri e loro; torna
     SAVE.div, il saldo, e la riga della scala a fischio avvenuto */
  const partita = (mode, diff, golA, golB) => pag.evaluate(([mode, diff, golA, golB]) => {
    const t = window.__test;
    t.startMatch(mode, diff, { size: 5 });
    for (let i = 0; i < 240 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    for (let k = 0; k < golA; k++) t.forceGoal(0);
    for (let k = 0; k < golB; k++) t.forceGoal(1);
    for (let i = 0; i < 240 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    t.setTimeLeft(0.2);
    for (let i = 0; i < 1200 && G.scene !== 'end'; i++) t.simulate(1 / 60);
    const es = document.getElementById('endScala');
    return { scena: G.scene, div: JSON.parse(JSON.stringify(SAVE.div)), coins: SAVE.coins,
             esito: G._divEsito ? JSON.parse(JSON.stringify(G._divEsito)) : null,
             riga: es && !es.classList.contains('hidden') ? es.textContent.trim() : '' };
  }, [mode, diff, golA, golB]);
  const stato = () => pag.evaluate(() => ({ div: JSON.parse(JSON.stringify(SAVE.div)), coins: SAVE.coins }));
  const imposta = (g, stelle) => pag.evaluate(([g, stelle]) => {
    SAVE.div.g = g; SAVE.div.stelle = stelle; return true;
  }, [g, stelle]);

  /* 1) tre vittorie a FACILE dal vergine: si sale a VICOLO, premio 12 */
  let s0 = await stato();
  verifica(s0.div.g === 0 && s0.div.stelle === 0, '0 si parte dal CORTILE, zero stelle', JSON.stringify(s0.div));
  let r = await partita(1, 0, 1, 0);
  verifica(r.div.stelle === 1 && r.div.g === 0, '1a vittoria FACILE al gradino 1: +1 stella', JSON.stringify(r.div));
  verifica(/STELLA GUADAGNATA/.test(r.riga), '1b la riga di fine partita parla', '«' + r.riga + '»');
  r = await partita(1, 0, 2, 0);
  const primaPromo = r.coins;
  r = await partita(1, 0, 3, 1);
  verifica(r.div.g === 1 && r.div.stelle === 0, '1c terza vittoria: promosso a VICOLO', JSON.stringify(r.div));
  verifica(/PROMOSSO/.test(r.riga), '1d la riga dice PROMOSSO', '«' + r.riga + '»');
  verifica(r.div.premi[1] === 1, '1e la bandiera del premio e\' alzata', JSON.stringify(r.div.premi));

  /* 2) sconfitta a VICOLO con 0 stelle: pavimento dei primi tre */
  r = await partita(1, 0, 0, 2);
  verifica(r.div.g === 1 && r.div.stelle === 0, '2 la sconfitta a 1/0 non retrocede (primi tre)', JSON.stringify(r.div));

  /* 3) il premio non si ripaga: si scende a mano e si risale */
  await imposta(0, 2);
  const c3a = (await stato()).coins;
  r = await partita(1, 0, 2, 0);        // terza stella -> ri-promozione a VICOLO
  const guadagno = r.coins - c3a;
  verifica(r.div.g === 1 && r.div.premi[1] === 1, '3a ri-promosso a VICOLO', JSON.stringify(r.div));
  /* il delta contiene i premi della partita ma NON altri 12 di
     promozione: si confronta con una vittoria identica senza promozione */
  await imposta(1, 0);
  const c3b = (await stato()).coins;
  r = await partita(1, 0, 2, 0);
  const guadagnoSenza = r.coins - c3b;
  verifica(guadagno === guadagnoSenza, '3b il premio di promozione NON si e\' ripagato', guadagno + ' contro ' + guadagnoSenza);

  /* 4) gating di fascia 2: a PIAZZA (g=3) il FACILE non da' stelle */
  await imposta(3, 0);
  r = await partita(1, 0, 2, 0);
  verifica(r.div.g === 3 && r.div.stelle === 0 && (!r.esito || r.esito.d === 0), '4a vittoria FACILE a PIAZZA: nessuna stella', JSON.stringify(r.div));
  r = await partita(1, 1, 2, 0);
  verifica(r.div.stelle === 1, '4b vittoria NORMALE a PIAZZA: +1', JSON.stringify(r.div));

  /* 5) gating di fascia 3: a QUARTIERE (g=6) solo il DURO conta */
  await imposta(6, 0);
  r = await partita(1, 1, 2, 0);
  verifica(r.div.stelle === 0, '5a vittoria NORMALE a QUARTIERE: niente', JSON.stringify(r.div));
  r = await partita(1, 2, 2, 0);
  verifica(r.div.stelle === 1, '5b vittoria DURO a QUARTIERE: +1', JSON.stringify(r.div));

  /* 6) il pavimento di FASCIA */
  await imposta(3, 0);
  r = await partita(1, 1, 0, 1);
  verifica(r.div.g === 3 && r.div.stelle === 0, '6a sconfitta a PIAZZA/0: il pavimento di fascia tiene', JSON.stringify(r.div));
  await imposta(4, 0);
  r = await partita(1, 1, 0, 1);
  verifica(r.div.g === 3 && r.div.stelle === 2, '6b sconfitta a RIONE/0: si scende a PIAZZA con soglia-1', JSON.stringify(r.div));

  /* 7) il 2 giocatori non muove la scala */
  await imposta(2, 1);
  const c7 = await stato();
  r = await partita(2, 1, 3, 0);
  verifica(r.div.g === c7.div.g && r.div.stelle === c7.div.stelle, '7 il 2 giocatori non muove la scala', JSON.stringify(r.div));

  /* 8) la riga tace quando la scala non si muove */
  verifica(!/STELLA|PROMOSSO|RETROCESSO/.test(r.riga), '8 e la riga tace sul 2 giocatori', '«' + r.riga + '»');

  /* 9) il salvataggio manomesso prende i tetti alla rilettura.
     PRIMA si ammutolisce persistSave: il gioco riscrive il disco su
     visibilitychange durante il reload e cancellerebbe la manomissione
     (misurato alla prima stesura: il caso leggeva lo stato in memoria,
     non i tetti). */
  await pag.evaluate(() => {
    window.persistSave = () => {};
    const j = JSON.parse(localStorage.getItem('calcetto_save_v4'));
    j.div = { g: 99, stelle: 77, premi: [1, 'x', 0, 2] };
    localStorage.setItem('calcetto_save_v4', JSON.stringify(j));
  });
  await pag.reload({ waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  const dopo = await pag.evaluate(() => JSON.parse(JSON.stringify(SAVE.div)));
  verifica(dopo.g === 8 && dopo.stelle <= 4 && dopo.premi.every(v => v === 0 || v === 1),
    '9 il manomesso prende i tetti (g<=8, stelle<soglia, premi 0/1)', JSON.stringify(dopo));

  if (ecc.length) verifica(false, 'nessuna eccezione di pagina', ecc[0]);
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' controlli su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  await browser.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
