/* =====================================================================
   _153-scatti.js — LE FOTO DEL PRIMA E DEL DOPO, E LA PIEGA (voce #153)

   Non misura niente da solo (prefisso _, non e' un cancello): fa le
   PROVE CHE SI GUARDANO e stampa i numeri della PIEGA ai due formati.

   PERCHE' ESISTE. Il cantiere tocca la pulsantiera, il tabellone e i
   menu, cioe' tre cose che un cancello numerico non racconta a chi
   decide se sono belle. Servono scatti agli STESSI pixel prima e dopo:
   stesso seme, stesso banco a passo fisso, stessa posa, stessi due
   formati (800x360 e 915x412, i due che gia' misura la casa).

   PERCHE' LA PIEGA SI STAMPA QUI. Il #144 e il #147 hanno pagato due
   volte lo stesso prezzo: una voce in piu' nella schermata SFIDA e i
   quattro bersagli si spostano. I quattro numeri di riferimento a
   800x360 sono CERCA@220, primaRiga@329, primoGUARDA@308 e
   SFIDA-DI-CARTA@347 (li sorveglia _q-amici D3). A 915x412 non li
   sorvegliava nessuno: qui si stampano, cosi' il confronto prima-dopo
   esiste anche di la'.

   LO SCATTO DEI TASTI PREMUTI PASSA DA __test.dita, cioe' dalla PORTA
   VERA del dito: scrivere dentro Touch5.btnTouch fotograferebbe uno
   stato che nessun pollice puo' produrre.

   uso:
     node strumenti/_153-scatti.js --dir strumenti/_153-prima
     node strumenti/_153-scatti.js --dir strumenti/_153-dopo
     node strumenti/_153-scatti.js --dir X --gioco fuori/altra.html
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { servi, bancoDiProva, semeFisso, posaFerma, scattoRipetibile } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };

const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
const DIR = path.resolve(RADICE, arg('dir', 'strumenti/_153-prima'));
const SEME = +arg('seme', 20260925);
/* i due formati della casa: il telefono in orizzontale stretto e quello largo */
const FORMATI = [{ w: 800, h: 360 }, { w: 915, h: 412 }];

function scrivi(nome, buf) {
  const f = path.join(DIR, nome);
  fs.writeFileSync(f, buf);
  return f;
}

(async () => {
  const { chromium } = require('playwright');
  fs.mkdirSync(DIR, { recursive: true });
  const srv = await servi();
  const br = await chromium.launch();
  const fatti = [];
  const pieghe = [];
  const stati = [];

  for (const F of FORMATI) {
    const tag = F.w + 'x' + F.h;
    const ctx = await br.newContext({ viewport: { width: F.w, height: F.h },
      deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    await pag.addInitScript(semeFisso, SEME);
    await pag.addInitScript(bancoDiProva);
    await pag.goto(`http://127.0.0.1:${srv.porta}/${GIOCO}`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.waitForTimeout(400);

    /* ---------------------------------------------------- I MENU, PRIMA
       (prima della partita: startMatch non si torna indietro senza
       ricaricare, e ricaricare costa un giro di banco) */
    await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); });
    await pag.evaluate(() => window.__banco.passo(20));
    fatti.push(scrivi('menu-home-' + tag + '.png', await pag.screenshot({ animations: 'disabled' })));

    for (const [nome, via] of [['gioca', ['btnGioca']],
                               ['spogliatoio', ['btnSpogliatoio']],
                               ['negozio', ['btnNegozio']],
                               ['bacheca', ['btnBacheca']]]) {
      await pag.evaluate(v => {
        if (typeof goScreen === 'function') goScreen(document.getElementById('menu'));
        for (const id of v) { const b = document.getElementById(id); if (b) b.click(); }
      }, via);
      await pag.evaluate(() => window.__banco.passo(12));
      await pag.waitForTimeout(150);
      fatti.push(scrivi('menu-' + nome + '-' + tag + '.png', await pag.screenshot({ animations: 'disabled' })));
    }

    /* ------------------------------------------------------- LA PIEGA
       stessa sequenza di _q-amici D3, ai due formati */
    const piega = await pag.evaluate(async () => {
      const t = window.__test;
      const r = e => { const x = e && e.getBoundingClientRect(); return x ? Math.round(x.bottom) : -1; };
      t.reteBase('');
      t.sfida.sfide = [];
      for (let i = 0; i < 5; i++) t.sfida.sfide.push({
        id: i + 1, attaccante: 'x', seme: '7' + i, taglia: 5, gol_a: 3, gol_d: 2,
        giocata: new Date().toISOString(), vista: i > 1, verificata: 0, nome: 'SQUADRA ' + i });
      t.sfida.apri();
      for (let i = 0; i < 60 && t.sfida.occupato; i++) await new Promise(x => setTimeout(x, 50));
      t.sfida.dipingi();
      const out = { h: innerHeight,
                    cerca: r(document.getElementById('btnSfidaCerca')),
                    primaRiga: r(document.querySelector('#sfLista .sfriga')),
                    primoGuarda: r(document.querySelector('#sfLista [data-guarda]')) };
      t.sfida.sfide = []; t.sfida.dipingi();
      out.carta = r(document.getElementById('btnSfidaCarta'));
      return out;
    });
    pieghe.push(Object.assign({ formato: tag }, piega));
    fatti.push(scrivi('menu-sfida-' + tag + '.png', await pag.screenshot({ animations: 'disabled' })));

    /* --------------------------------------------- LA PARTITA E L'HUD
       posaHUD accende l'HUD della squadra 0 anche se la guida la CPU:
       e' cio' che vede un giocatore vero, ed e' l'unico modo di
       fotografare i comandi in una posa ripetibile. */
    await posaFerma(pag, { secondi: 12, taglia: 5, cronometro: 314, cpu: true });
    /* i pannelli DOM davanti alla scena si nascondono: posaFerma ferma la
       partita con setPaused(true), che apre il pannello PAUSA a schermo
       intero — e la schermata SFIDA di poco fa e' ancora aperta dietro.
       Qui si fotografa l'HUD in campo, non due pannelli sopra di lui. */
    await pag.evaluate(() => {
      for (const id of ['pausa', 'sfida', 'classifica', 'sfidaCarta'])
        { const e = document.getElementById(id); if (e) e.classList.add('hidden'); }
      /* E LA PAUSA SI TOGLIE ANCHE DAL CANVAS. A gioco in pausa l'HUD
         dipinge la MOVIOLA — la fascia in alto e il cursore del nastro
         in basso — al posto del tabellone e dei dischi: fotografarla
         sarebbe fotografare un'altra schermata. Il fermo non serve piu'
         a niente qui, perche' a fermare il tempo ci pensa il banco
         (rAF in mano a __banco, renderDT a zero in disegnaFermo). */
      window.__test.setPaused(false);
      window.__test.posaHUD(true);
    });
    /* E SI VERIFICA DI ESSERE IN AZIONE, invece di crederci. Se dentro i
       dodici secondi e' caduto un gol, il gioco e' in MOVIOLA: l'HUD
       dipinge la fascia del nastro al posto del tabellone e dei dischi,
       e lo scatto mostrerebbe un'altra schermata. Si avanza di mezzo
       secondo alla volta finche' la scena torna 'play' — e si stampa
       quanto e' costato, cosi' chi legge sa che partita ha guardato. */
    const stato = await pag.evaluate(async () => {
      const t = window.__test, G = t.G;
      let giri = 0;
      while (giri < 40 && (t.state !== 'play' || G.moviola || G.ripresa)) { t.simulate(0.5); giri++; }
      return { scena: t.state, moviola: !!G.moviola, ripresa: !!G.ripresa, giri: giri,
               gol: (G.score ? G.score.join('-') : '?') };
    });
    stati.push(Object.assign({ formato: tag }, stato));
    fatti.push(scrivi('hud-' + tag + '.png', await scattoRipetibile(pag, null, { seme: SEME })));

    /* il riquadro dei cinque dischi, ingrandito: e' il pezzo che il
       committente guarda da vicino */
    const rq = await pag.evaluate(() => {
      const b = window.__test.pulsanti(0);
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const d of b) { x0 = Math.min(x0, d.x - d.r); y0 = Math.min(y0, d.y - d.r);
                           x1 = Math.max(x1, d.x + d.r); y1 = Math.max(y1, d.y + d.r); }
      return { x: Math.max(0, Math.round(x0 - 14)), y: Math.max(0, Math.round(y0 - 14)),
               width: Math.round(x1 - x0 + 28), height: Math.round(y1 - y0 + 28) };
    });
    fatti.push(scrivi('tasti-' + tag + '.png', await scattoRipetibile(pag, rq, { seme: SEME })));

    /* PREMUTO — dalla porta vera del dito, E CON UN UOMO VERO AL
       COMANDO. Con le due squadre alla CPU il dito non arriva: Touch5
       non accetta comandi per una squadra che non e' di nessuno, e il
       primo scatto di questo cantiere ha fotografato cinque tasti «a
       riposo» credendo che fosse lo stato premuto. Qui si riapre la
       posa con la squadra 0 in mano all'uomo (cpu:false), che e' poi
       la situazione in cui un pollice preme davvero. */
    /* LA PARTITA SI GIOCA DA SOLA FINCHE' IL PALLONE E' DELLA SQUADRA 0,
       poi il comando passa all'uomo: cosi' il contesto dei dischi e'
       quello del POSSESSO (TIRA, PASSA, CROSS, FILTRANTE, SCUDO), che e'
       il contesto in cui un pollice preme davvero. Senza possesso il
       disco grande e' CONTRASTA ed e' SPENTO: il gioco rifiuta il dito
       per progetto (voce #88), e il primo scatto di questo cantiere ha
       fotografato cinque tasti a riposo credendoli premuti. */
    const conPalla = await pag.evaluate(async () => {
      const t = window.__test, G = t.G;
      let giri = 0;
      const mio = () => G.ball && G.ball.owner >= 0 && G.players[G.ball.owner] &&
                        G.players[G.ball.owner].team === 0;
      while (giri < 120 && !(t.state === 'play' && !G.moviola && !G.ripresa && mio())) { t.simulate(0.25); giri++; }
      const preso = mio();
      if (preso) { t.setCpuVsCpu(false); G.ctrl[0] = G.ball.owner; }
      return { preso: preso, giri: giri };
    });
    /* IL DITO VERO, dal protocollo del browser e non da Touch5: si posa
       sul disco grande e ci RESTA, perche' la carica del tiro e' una
       pressione tenuta e un impulso di un fotogramma non la aprirebbe. */
    const disco = await pag.evaluate(() => {
      const b = window.__test.pulsanti(0)[0]; return { x: Math.round(b.x), y: Math.round(b.y), act: b.act };
    });
    const cdp = await ctx.newCDPSession(pag);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart',
      touchPoints: [{ x: disco.x, y: disco.y, id: 1 }] });
    await pag.evaluate(() => window.__banco.passo(36));   // 0,6 s: dentro la finestra dolce del tiro
    await pag.evaluate(() => window.__test.disegna());
    /* CHE COSA E' DAVVERO PREMUTO, letto da comandiTouch (TOUCH_ZONE):
       e' il gioco a scriverlo mentre dipinge, quindi non puo' mentire */
    const prem = await pag.evaluate(() => {
      const z = window.__test.comandiTouch.filter(q => q.tipo === 'pulsante');
      const p = window.__test.G.players[window.__test.G.ctrl[0]];
      return { dischi: z.map(b => b.act + (b.premuto ? '*' : '')),
               carica: p ? +(p.charge || 0).toFixed(3) : -1 };
    });
    stati.push({ formato: tag + ' premuto', scena: prem.dischi.join(' ') + '  carica ' + prem.carica + 's',
                 moviola: !conPalla.preso, ripresa: false, giri: conPalla.giri, gol: disco.act });
    fatti.push(scrivi('tasti-premuto-' + tag + '.png', await scattoRipetibile(pag, rq, { seme: SEME })));
    fatti.push(scrivi('hud-premuto-' + tag + '.png', await scattoRipetibile(pag, null, { seme: SEME })));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await ctx.close();
  }

  await br.close(); srv.chiudi();

  console.log('\n=== _153-scatti — ' + path.relative(RADICE, DIR) + ' (gioco: ' + GIOCO + ') ===');
  console.log('  ' + fatti.length + ' scatti');
  console.log('\n  LA PIEGA, schermata SFIDA:');
  for (const p of pieghe) {
    console.log('    ' + p.formato + '  CERCA@' + p.cerca + '  primaRiga@' + p.primaRiga +
                '  primoGUARDA@' + p.primoGuarda + '  SFIDA-DI-CARTA@' + p.carta +
                '  (piega ' + p.h + ')');
  }
  console.log('\n  LA POSA IN CAMPO:');
  for (const s of stati) console.log('    ' + s.formato + '  scena ' + s.scena +
    '  moviola ' + s.moviola + '  ripresa ' + s.ripresa +
    '  (mezzi secondi in piu\': ' + s.giri + ')  gol ' + s.gol);
  console.log('');
})().catch(e => { console.error('BANCO ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });
