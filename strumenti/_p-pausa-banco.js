/* =====================================================================
   _p-pausa-banco.js — DOPO LA PAUSA, IL DITO APPOGGIATO COMANDA ANCORA?

   PERCHE'. E' la terza riserva del critico sulla toppa del rilascio, ed
   e' l'unica rimasta aperta. La toppa spegne la levetta quando la
   finestra perde il fuoco — cosa giusta, e il banco dei verbi la conferma:
   a zero dita `humanMove(0)` va a [0,0]. Ma la domanda non e' quella. La
   domanda e': QUANDO SI RIPRENDE, SENZA CHE IL DITO SI SIA MAI ALZATO,
   il gesto riparte?

   Conta perche' il committente ha descritto cosi' il movimento: «il
   pollice rimane sullo schermo a sinistra e mantenendolo premuto lo
   sposto verso la direzione scelta». Il pollice sinistro sta giu' per
   tutta la partita, e il tasto Indietro e' il piu' premuto di un
   telefono. Se dopo ogni pausa bisogna alzare e riappoggiare il pollice
   perche' il giocatore torni a correre, e' un prezzo che va deciso in
   chiaro, non scoperto da chi gioca.

   COSA MISURA QUESTO FILE E COSA NO. Qui la pausa nasce dagli eventi che
   il gioco ascolta nel documento — `blur` e `visibilitychange` — che sono
   la stessa strada su cui viaggia il tasto Indietro di Android quando
   l'attivita' passa in secondo piano. NON e' il tasto Indietro vero: quello
   e' un fatto del sistema operativo e va misurato sul telefono con
   `strumenti/_p-pausa-dito.js`. Questo banco chiude la meta' che si puo'
   chiudere senza hardware, e dichiara quale meta' lascia aperta.

   IL CONTROLLO, senza cui la misura non vale: la stessa sequenza, stessa
   durata, SENZA la pausa. Se il dito muore anche li', la colpa non e'
   della pausa e questo file non ha trovato niente.

   uso:  node strumenti/_p-pausa-banco.js
         node strumenti/_p-pausa-banco.js --gioco fuori/prima.html
         node strumenti/_p-pausa-banco.js --giri 6
   Esce 1 se il controllo non tiene o se il dito muore dopo la pausa.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const attesa = ms => new Promise(r => setTimeout(r, ms));
const GIRI = +arg('giri', 5);
const GIOCO = path.resolve(arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const ETICHETTA = arg('etichetta', '');

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (/CALCETTO-il-gioco\.html$/i.test(f)) f = GIOCO;
      if ((!f.startsWith(RADICE) && f !== GIOCO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* quello che il gioco legge davvero a ogni fotogramma: non «il dito e'
   registrato», ma «il comando che ne esce» */
const LEGGI = `(()=>{try{
  const m = (typeof humanMove==='function') ? humanMove(0) : null;
  const s = (typeof Touch5!=='undefined' && Touch5.stick) ? Touch5.stick[0] : null;
  const t = window.__test;
  return { m: m?[+m[0].toFixed(3),+m[1].toFixed(3)]:null,
    attivo: s?!!s.active:null, id: s?(s.id===undefined?null:s.id):null,
    pausa: !!(t&&t.paused), scena: t?t.state:null,
    x: t&&t.G&&t.G.ctrl[0]>=0 ? +t.players[t.G.ctrl[0]].x.toFixed(1) : null };
}catch(e){return {errore:String(e.message)};}})()`;

(async () => {
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pag);
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load', timeout: 120000 });
  await pag.waitForFunction('!!window.__test', null, { timeout: 60000 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); t.startMatch(1, 1, { size: 5 }); });
  await attesa(1400);

  console.log('=== DOPO LA PAUSA, IL DITO APPOGGIATO COMANDA ANCORA? ===\n');
  console.log('gioco:   ' + GIOCO + (ETICHETTA ? '   [' + ETICHETTA + ']' : ''));
  console.log('banco:   915x412 · 5 contro 5 · ' + GIRI + ' giri per braccio\n');

  const dito = {
    giu: p => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: p }),
    muovi: p => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: p }),
    su: () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
  };
  const CASA = { x: 165, y: 272 };

  /* la pausa si provoca con gli eventi che IL GIOCO ASCOLTA, non
     chiamando setPaused: chiamare la funzione salterebbe proprio la
     strada che si vuole provare */
  const spegni = () => pag.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('blur'));
  });
  const accendi = () => pag.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
    try { window.__test.setPaused && window.__test.setPaused(false); } catch (e) { }
  });

  const prova = async conPausa => {
    await dito.giu([{ x: CASA.x, y: CASA.y, id: 1 }]);
    await attesa(90);
    for (let i = 1; i <= 5; i++) { await dito.muovi([{ x: CASA.x + 44 * i / 5, y: CASA.y - 18 * i / 5, id: 1 }]); await attesa(26); }
    await attesa(160);
    const prima = await pag.evaluate(LEGGI);
    let dentro = null;
    if (conPausa) { await spegni(); await attesa(500); dentro = await pag.evaluate(LEGGI); await accendi(); await attesa(500); }
    else { await attesa(1000); }
    /* IL DITO NON SI ALZA MAI: e' tutto il punto della prova.
       Ma un pollice appoggiato sul vetro non sta MAI perfettamente fermo:
       trema di uno o due pixel, e quel tremore e' un touchmove. La prima
       stesura di questo banco lo teneva immobile al pixel, e cosi' non
       poteva vedere nessuna riparazione che si appoggi al movimento — che
       e' l'unica strada sicura, perche' un dito che non manda eventi e'
       indistinguibile da un dito che si e' alzato durante la pausa.
       Qui si misurano DUE cose, e vanno lette separate:
         FERMO   subito dopo la ripresa, senza un solo evento;
         TREMA   dopo un movimento di 3 px, cioe' quello che fa una mano. */
    const dopoFermo = await pag.evaluate(LEGGI);
    await dito.muovi([{ x: CASA.x + 44 + 3, y: CASA.y - 18 + 2, id: 1 }]);
    await attesa(120);
    const dopo = await pag.evaluate(LEGGI);
    /* e la domanda vera: il GIOCATORE si muove ancora? */
    const x0 = dopo.x;
    await attesa(500);
    const fine = await pag.evaluate(LEGGI);
    await dito.su();
    await attesa(220);
    return { prima, dentro, dopoFermo, dopo, corsa: (fine.x != null && x0 != null) ? Math.abs(fine.x - x0) : -1 };
  };

  const vivo = r => r && r.m && (Math.abs(r.m[0]) > 0.01 || Math.abs(r.m[1]) > 0.01);
  const R = { pausa: { vivi: 0, corse: [] }, controllo: { vivi: 0, corse: [] } };

  for (const conPausa of [false, true]) {
    console.log('--- ' + (conPausa ? 'CON PAUSA (fuoco perso e ripreso, dito sempre giu\')' : 'CONTROLLO (stessa attesa, nessuna pausa)') + ' ---');
    for (let g = 0; g < GIRI; g++) {
      /* UNA PROVA IN CUI LA LEVETTA NON SI E' NEMMENO ARMATA NON MISURA
         NIENTE, e contarla come fallimento e' peggio che non contarla: il
         verdetto direbbe «il dito muore» quando il dito non e' mai nato.
         Capita quando il gioco e' in una scena che non e' di gioco (un
         gol, una rimessa) e i tocchi vengono ignorati. Si riprova, e le
         prove nulle si dichiarano invece di sparire nel conteggio. */
      const k = conPausa ? R.pausa : R.controllo;
      let r = null;
      for (let tent = 0; tent < 3; tent++) {
        r = await prova(conPausa);
        if (vivo(r.prima)) break;
        k.nulle = (k.nulle || 0) + 1;
        console.log(`  giro ${g + 1}   prova NULLA (la levetta non si e' armata, tentativo ${tent + 1}/3): non conta`);
        await attesa(500);
      }
      if (!vivo(r.prima)) { console.log(`  giro ${g + 1}   SALTATO: tre tentativi e la levetta non si e' mai armata`); continue; }
      k.validi = (k.validi || 0) + 1;
      if (vivo(r.dopo)) k.vivi++;
      if (vivo(r.dopoFermo)) k.fermi = (k.fermi || 0) + 1;
      k.corse.push(r.corsa);
      console.log(`  giro ${g + 1}   prima ${JSON.stringify(r.prima.m)}` +
        (r.dentro ? `   pausa ${JSON.stringify(r.dentro.m)}` : '') +
        `   FERMO ${JSON.stringify(r.dopoFermo.m)}` +
        `   TREMA ${JSON.stringify(r.dopo.m)} (attivo ${r.dopo.attivo})` +
        `   corsa ${r.corsa.toFixed(1)} u   -> ${vivo(r.dopo) ? 'VIVO' : 'MORTO'}`);
      if (!vivo(r.prima)) console.log('           ATTENZIONE: la levetta non era viva nemmeno PRIMA: questo giro non vale');
    }
    console.log('');
  }

  await browser.close(); srv.chiudi();
  const med = a => { const o = [...a].filter(x => x >= 0).sort((p, q) => p - q); return o.length ? o[(o.length - 1) >> 1] : -1; };

  console.log('--- VERDETTO ---');
  let male = 0;
  const dimmi = (ok, t, e) => { if (!ok) male++; console.log((ok ? '  OK   ' : '  NO   ') + t + (e ? '\n         ' + e : '')); };
  /* IL DENOMINATORE E' LE PROVE VALIDE, NON I GIRI CHIESTI. Se una prova
     e' stata saltata perche' la levetta non si armava, contarla al
     denominatore farebbe uscire un rosso che descrive il banco e non il
     gioco — e in questa casa un numero cosi' e' gia' costato due giorni
     sull'avvio. Le prove nulle si dichiarano a parte, sotto. */
  const vC = R.controllo.validi || 0, vP = R.pausa.validi || 0;
  dimmi(vC > 0 && R.controllo.vivi === vC, `il controllo tiene: ${R.controllo.vivi}/${vC} prove valide, dita ancora vive senza pausa (corsa mediana ${med(R.controllo.corse).toFixed(1)} u)`,
    R.controllo.vivi < GIRI ? 'se il controllo non tiene la colpa non e\' della pausa, e questa misura non dice niente' : '');
  dimmi(vP > 0 && R.pausa.vivi === vP, `dopo la pausa, al primo tremore del pollice, il dito comanda ancora: ${R.pausa.vivi}/${vP} prove valide (corsa mediana ${med(R.pausa.corse).toFixed(1)} u)`,
    R.pausa.vivi < GIRI ? 'il gesto primario muore dopo la pausa: finche\' non alzi e riappoggi il pollice, il giocatore non si muove' : '');
  /* IL POLLICE PERFETTAMENTE FERMO NON E' UN CANCELLO, ed e' voluto.
     Un dito che non manda un solo evento e' indistinguibile da un dito
     che si e' alzato durante la pausa. Riadottarlo alla cieca lascerebbe
     una levetta fantasma che nessuno rilascia piu', e quella BLOCCA il
     tocco successivo (`if(s.active) return` in start): si curerebbe un
     fastidio con un blocco. Quindi si misura, si stampa, e non si pretende. */
  console.log(`  --   a POLLICE PERFETTAMENTE FERMO, senza un solo evento: ${R.pausa.fermi || 0}/${vP} vivi` +
    `   (controllo senza pausa: ${R.controllo.fermi || 0}/${vC})` + (((R.controllo.nulle||0)+(R.pausa.nulle||0)) ? `
  --   prove NULLE ripetute (la levetta non si e' armata): controllo ${R.controllo.nulle||0}, con pausa ${R.pausa.nulle||0}` : ''));
  if (errori.length) console.log('  --   eccezioni in pagina: ' + errori.slice(0, 2).join(' | '));

  console.log('\nQUELLO CHE QUESTO BANCO NON HA MISURATO: il tasto Indietro VERO di Android.');
  console.log('Qui la pausa nasce da `blur` e `visibilitychange`, che sono la strada su cui');
  console.log('viaggia l\'attivita\' quando passa in secondo piano — ma il tasto fisico e\' un');
  console.log('fatto del sistema operativo e va misurato sul telefono con _p-pausa-dito.js.');
  if (male) process.exit(1);
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
