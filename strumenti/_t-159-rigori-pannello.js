/* =====================================================================
   _t-159-rigori-pannello.js — IL PANNELLO DEI RIGORI DICE IL VERO, E IL
   TETTO 9-9 NON PREMIA LA SQUADRA 0 (voce #159, cura R4 — la parte onesta
   del difetto #31; la morte improvvisa a coppie e' regola di casa e RESTA)

   I DUE DIFETTI.
     (a) startFreeKick disegna per ogni squadra max(5, tiri+1) pallini e
         dipinge verdi i PRIMI seg[t], qualunque sia l'ordine vero degli
         esiti: dopo [sbagliato, segnato] si vede verde-rosso, e cinque
         pallini promettono una serie da cinque che il gioco non fa.
     (b) programmaRigore, al tetto di nove tiri a testa, fa
         G.score[R.seg[0]>=R.seg[1]?0:1]++ : a parita' vince la squadra 0
         per indice.

   LA CURA (R4). R.esiti=[[],[]] riempito da esitoRigore e dipinto
   nell'ordine vero, con al massimo UN pallino vuoto per la battuta in
   corso; al tetto, a parita', la spunta chi ha tirato per SECONDO
   (1-R.turno al momento del controllo): simmetrica rispetto all'indice
   di squadra, zero estrazioni.

   LE PROVE (esitoRigore chiamata direttamente, come fa il duello):
     1. PANNELLO — sequenza A:sba, B:sba, A:seg, B:seg (1-1 dopo due
        coppie, si continua): la riga di A deve leggere [sba, seg, ora]
        (A batte per prima la coppia dopo) e quella di B [sba, seg].
        Oggi A legge [seg, sba, ora, '', '']: ROSSO.
     2. TETTO 9-9, specchiato su G.kickTeam=0 e =1 — diciotto rigori
        tutti segnati: la partita finisce (scene 'end') e il punto va a
        1-kickTeam (chi ha tirato per secondo), mai «alla squadra 0».
        Oggi con kickTeam=0 vince la 0: ROSSO.

   ORDINE SACRO: startMatch PRIMA, setCpuVsCpu(true) DOPO.

   uso:  node strumenti/_t-159-rigori-pannello.js [--gioco f.html]
   esce 0 verde · 1 rosso · 2 banco esploso · 3 prova nulla
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { semeFisso } = require('./_posa.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const SEME = 20261102;
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const provaAbs = provaRel ? path.resolve(RADICE, provaRel) : '';
if (provaAbs && !fs.existsSync(provaAbs)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + provaAbs); process.exit(3); }

function servi(prova) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (prova && /CALCETTO-il-gioco\.html$/i.test(f)) f = prova;
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* la partita fino a play, poi la serie, dentro la pagina */
function APRI_SERIE({ seme, kickTeam }) {
  const t = window.__test;
  t.semina(seme);
  t.startMatch(1, 1, { size: 5 });   // PRIMA
  t.setCpuVsCpu(true);               // DOPO
  for (let i = 0; i < 900 && t.state !== 'play'; i++) t.simulate(1 / 60);
  if (t.state !== 'play') return { errore: 'la partita non arriva a play (' + t.state + ')' };
  if (kickTeam === 0 || kickTeam === 1) G.kickTeam = kickTeam;
  G.score = [0, 0];
  t.rigori();
  return { ok: true, turno: G.rigori.turno, kickTeam: G.kickTeam, stato: t.state };
}
function PANNELLO() {
  const righe = Array.from(document.querySelectorAll('#duelSerie .sr'));
  return righe.map(r => Array.from(r.querySelectorAll('em i')).map(i => i.className || ''));
}

(async () => {
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(semeFisso, SEME);
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== RIGORI: PANNELLO ONESTO E TETTO SIMMETRICO (R4, voce #159) ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  let rossi = 0, verdi = 0;
  const di = (ok, nome, det) => { ok ? verdi++ : rossi++; console.log((ok ? '  OK   ' : '  NO   ') + nome + (det ? '\n         ' + det : '')); };
  try {
    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.waitForTimeout(150);
    await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
    await pag.evaluate(`window.APRI_SERIE = ${APRI_SERIE.toString()}; window.PANNELLO = ${PANNELLO.toString()};`);

    /* 1. PANNELLO */
    {
      const r = await pag.evaluate(({ seme }) => {
        const a = APRI_SERIE({ seme });
        if (a.errore) return a;
        const A = G.rigori.turno, B = 1 - A;
        const inizio = PANNELLO();
        esitoRigore(false);   // A sbaglia
        esitoRigore(false);   // B sbaglia
        esitoRigore(true);    // A segna
        esitoRigore(true);    // B segna  -> 1-1 dopo due coppie: si continua
        return { A, B, inizio, dopo: PANNELLO(), seg: G.rigori ? G.rigori.seg.slice() : null, tiri: G.rigori ? G.rigori.tiri.slice() : null, turno: G.rigori ? G.rigori.turno : null, stato: window.__test.state, esiti: G.rigori && G.rigori.esiti ? G.rigori.esiti : null };
      }, { seme: SEME });
      if (r.errore) di(false, '1. PANNELLO', 'BANCO: ' + r.errore);
      else {
        const e = JSON.stringify;
        const rigaA = r.dopo[r.A] || [], rigaB = r.dopo[r.B] || [];
        const okA = e(rigaA) === e(['sba', 'seg', 'ora']);
        const okB = e(rigaB) === e(['sba', 'seg']);
        const okInizio = e(r.inizio[r.A]) === e(['ora']) && e(r.inizio[r.B]) === e([]);
        di(okA && okB && r.stato === 'freekick' && r.turno === r.A,
          '1. PANNELLO — dopo A:sba B:sba A:seg B:seg la riga di A legge [sba, seg, ora] e quella di B [sba, seg] (ordine vero, un solo pallino vuoto per la battuta in corso); la serie continua (1-1)',
          'A=squadra ' + r.A + '  riga A=' + e(rigaA) + '  riga B=' + e(rigaB) + '  seg=' + e(r.seg) + ' tiri=' + e(r.tiri) + ' turno=' + r.turno + ' stato=' + r.stato);
        di(okInizio, '1b. PANNELLO ALL\'APERTURA — prima del primo tiro: A ha il solo pallino \'ora\', B nessuno (niente cinque promessi)',
          'inizio A=' + e(r.inizio[r.A]) + ' B=' + e(r.inizio[r.B]));
      }
    }

    /* 2. TETTO 9-9, specchiato */
    for (const kt of [0, 1]) {
      const r = await pag.evaluate(({ seme, kt }) => {
        const a = APRI_SERIE({ seme, kickTeam: kt });
        if (a.errore) return a;
        let n = 0;
        while (G.rigori && n < 40 && window.__test.state !== 'end') { esitoRigore(true); n++; }
        return { n, score: G.score.slice(), stato: window.__test.state, primo: a.turno, rigori: G.rigori ? { seg: G.rigori.seg.slice(), tiri: G.rigori.tiri.slice() } : null };
      }, { seme: SEME, kt });
      if (r.errore) { di(false, '2. TETTO kickTeam=' + kt, 'BANCO: ' + r.errore); continue; }
      const vincitore = r.score[0] > r.score[1] ? 0 : (r.score[1] > r.score[0] ? 1 : -1);
      const atteso = 1 - kt;   // chi ha tirato per secondo
      di(r.n === 18 && r.stato === 'end' && vincitore === atteso,
        '2. TETTO 9-9 con kickTeam=' + kt + ' — diciotto rigori segnati: la partita finisce e il punto va a chi ha tirato per SECONDO (squadra ' + atteso + '), non alla squadra 0 per indice',
        'rigori battuti=' + r.n + ' primo a tirare=' + r.primo + ' score=' + r.score.join('-') + ' vincitore=' + vincitore + ' stato=' + r.stato);
    }
  } catch (e) {
    console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
    await browser.close(); srv.chiudi(); process.exit(2);
  }
  await browser.close(); srv.chiudi();
  if (ecc.length) { console.error('ECCEZIONI DI PAGINA: ' + ecc.join(' | ')); process.exit(2); }
  console.log('\n' + (verdi + rossi) + ' prove, ' + verdi + ' verdi, ' + rossi + ' rosse  ->  ' + (rossi ? 'ROSSO' : 'VERDE'));
  process.exit(rossi ? 1 : 0);
})();
