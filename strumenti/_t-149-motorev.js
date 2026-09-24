/* =====================================================================
   _t-149-motorev.js — MOTORE_V VA ALZATO? LA MISURA, NEI DUE VERSI
   (voce #149, compito 2)

   LA DOMANDA, ESATTA. Il #149 non tocca la simulazione e non aggiunge
   nemmeno una riga al nastro: cambia SOLO che cosa il giudice sa
   rifiutare. Il criterio scritto in casa («MOTORE_V si incrementa quando
   una cura cambia l'esito di sequenze di comandi identiche») direbbe
   subito di no. Il criterio ALLARGATO dal #148 — «se una cura cambia il
   verdetto che un altro telefono darebbe sullo stesso nastro, il numero
   sale» — chiede una misura, e questa e' la misura.

   I DUE VERSI

     VERSO 1 — LA CURA E' NEUTRA SUL NASTRO ONESTO?
       Il nastro di una serie vera, giudicato dal gioco di ieri e da
       quello curato. Tutti e due devono dire TORNA, con lo stesso
       punteggio rigiocato e lo stesso numero di passi. Se qui ci fosse
       uno scarto, la cura avrebbe rotto qualcosa e il numero sarebbe
       l'ultimo dei problemi.

     VERSO 2 — E CHE VERDETTO DA' IL GIUDICE DI IERI SUI QUATTRO NASTRI
       CHE LA REVISIONE HA COSTRUITO? Sono lo stesso nastro con UNA cosa
       cambiata: la 15 tolta, la 15 e le 14 tolte, il bit del primo
       tiratore capovolto, la versione del protocollo ignota. Il curato
       si astiene su tutti e quattro. Se il gioco di ieri ACCUSA (NON
       TORNA) anche su uno solo, MOTORE_V deve salire: NON TORNA e'
       l'unico dei cinque verdetti che toglie punti, e li toglie a DUE
       persone.

   E IL VERSO 2 SI RIPETE SU PIU' SERIE, e non e' prudenza: e' un rosso
   che questo banco si e' preso da solo. Alla prima corsa (serie 1-2,
   seme 2485500926) il giudice di ieri disse TORNA su tre casi su
   quattro — novanta secondi di calcio finiti PER CASO con lo stesso
   punteggio della serie. Su un'altra serie (2-1, seme 2312852291) gli
   stessi tre casi davano NON TORNA. Un banco che avesse giocato una
   serie sola avrebbe scritto «MOTORE_V puo' restare 5» con in mano una
   moneta. Le serie sono `--serie N` (tre, di mestiere), e il referto
   dichiara quante volte su quante il giudice di ieri ha accusato.

   PERCHE' IL SECONDO VERSO CONTA ANCHE SE I NASTRI SONO MANOMESSI. Non
   e' il manomettitore che si vuole proteggere: e' la coppia che ha
   giocato la serie. Un nastro puo' perdere la riga 15 senza che nessuno
   bari — il gioco stesso puo' produrlo, perche' la scrittura di quella
   riga sta dentro un `catch` muto (`:48147`) — e il telefono che lo
   giudica non sa distinguere le due cose. Un «non lo so» non costa
   niente a nessuno; un NON TORNA costa a due innocenti.

   IL MERGE-BASE DI QUESTO CANTIERE E' b87f512, e va estratto prima:
     git show b87f512:CALCETTO-il-gioco.html > fuori/149-prima.html

   uso:  node strumenti/_t-149-motorev.js [--vecchio fuori/149-prima.html]
                                          [--serie 3]
   esce  0 se MOTORE_V puo' restare 5 · 1 se deve salire ·
         2 se il banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const RADICE = T.RADICE;
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const VECCHIO_REL = arg('vecchio', 'fuori/149-prima.html');
const VECCHIO = path.resolve(RADICE, VECCHIO_REL);
const NUOVO = arg('nuovo') ? path.resolve(RADICE, arg('nuovo')) : path.join(RADICE, 'CALCETTO-il-gioco.html');

if (!fs.existsSync(VECCHIO)) {
  console.error('PROVA NULLA: manca il gioco del merge-base: ' + VECCHIO_REL);
  console.error('  si costruisce con:  git show b87f512:CALCETTO-il-gioco.html > ' + VECCHIO_REL);
  process.exit(3);
}
if (!fs.existsSync(NUOVO)) { console.error('PROVA NULLA: manca il gioco curato: ' + NUOVO); process.exit(3); }

const mossaTiro = t => ({ ruolo: 't', z: t % 3, u: ((t * 317) % 1600) - 800, v: 200 + ((t * 211) % 600), ps: 30 + (t * 7) % 40 });
const mossaPara = t => ({ ruolo: 'p', z: (t * 2 + 1) % 3 });
const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_scegli = (P, m) => P.pag.evaluate(m => window.__test.dischetto.scegli(m), m);

/* gli stessi due bisturi di _q-nastro-differito: una cosa alla volta, e
   la catena dei tick intatta (regola di _nastri-bugiardi.js) */
function togliTipo(testo, tipo) {
  const p = String(testo).split('|');
  let tolti = 0;
  const pezzi = (p[3] || '').split(';').filter(Boolean).map(z => {
    const v = z.split(',');
    if (v[1] !== String(tipo)) return z;
    tolti++;
    return v[0] + ',3,' + v[2];
  });
  return { testo: p[0] + '|' + p[1] + '|' + p[2] + '|' + pezzi.join(';'), tolti };
}
function cambiaArg(testo, tipo, i, v) {
  const p = String(testo).split('|');
  let fatto = false, prima = null;
  const pezzi = (p[3] || '').split(';').filter(Boolean).map(z => {
    const c = z.split(',');
    if (fatto || c[1] !== String(tipo) || c.length <= 3 + i) return z;
    fatto = true; prima = c[3 + i];
    c[3 + i] = String(v);
    return c.join(',');
  });
  return { testo: p[0] + '|' + p[1] + '|' + p[2] + '|' + pezzi.join(';'), fatto, prima };
}
const rigaDiTipo = (testo, tipo) => {
  for (const z of (String(testo).split('|')[3] || '').split(';'))
    if (z && Number(z.split(',')[1]) === tipo) return z;
  return '';
};

async function suPagina(browser, porta, fn) {
  const P = await T.apri(browser, porta);
  try { return await fn(P); } finally { await P.ctx.close(); }
}
const giudicaSu = (browser, porta, nastro, atteso, seme) => suPagina(browser, porta, P =>
  P.pag.evaluate(([n, a, s]) => {
    const v = window.__test.giudica(n, a, { seme: String(s), taglia: 5 });
    return { verdetto: v.verdetto, causa: v.causa, gol: v.gol, passi: v.passi };
  }, [nastro, atteso, seme]));
const mostra = v => v.verdetto + (v.causa ? '/' + v.causa : '') +
                    ' · rigiocato ' + JSON.stringify(v.gol) + ' · passi ' + v.passi;

(async () => {
  console.log('\nMOTORE_V VA ALZATO? (voce #149)   vecchio ' + VECCHIO_REL);
  const sgN = await T.serviGioco(NUOVO);
  const sgV = await T.serviGioco(VECCHIO);
  const cass = await T.serviCassetta({ frenoAcceso: false });
  const browser = await chromium.launch();
  let esploso = null, salire = false;
  const aperti = [];
  try {
    const A = await T.apri(browser, sgN.porta); aperti.push(A);
    const B = await T.apri(browser, sgN.porta); aperti.push(B);
    await T.collega(A, cass.porta, 'ALFA');
    await T.collega(B, cass.porta, 'BETAX');
    await T.entra(A); await T.entra(B);

    const decisiva = s => (s[0] === 1 && s[1] === 0) || (s[0] === 0 && s[1] === 1);
    const NSERIE = Math.max(1, Math.min(10, (arg('serie', '3') | 0) || 3));
    let misurate = 0, accuseTot = 0, cambiatiTot = 0, casiTot = 0, neutre = 0;

    for (let serie = 1; serie <= NSERIE; serie++) {
      /* LA SERIE, come nel banco: un punteggio DISTINGUIBILE da 1-0, se no
         il testimone del punteggio non distingue niente. */
      let sA = null, nA = '';
      for (let tent = 1; tent <= 5; tent++) {
        const r = await A.pag.evaluate(async () => await window.__test.dischetto.crea());
        await B.pag.evaluate(async s => await window.__test.dischetto.entra(s), r.stanza);
        for (let g = 0; g < 400; g++) {
          for (const P of [A, B]) {
            const s = await d_stato(P);
            if (s && s.fase === 'scegli') await d_scegli(P, s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro));
          }
          await Promise.all([d_giro(A), d_giro(B)]);
          const sa = await d_stato(A), sb = await d_stato(B);
          if (sa.fase === 'fine' && sb.fase === 'fine') break;
        }
        const s = await d_stato(A);
        nA = await A.pag.evaluate(() => window.__test.nastro());
        if (s.fase === 'fine' && s.causa === 'finita' && !decisiva([s.serie.seg[0] | 0, s.serie.seg[1] | 0])) { sA = s; break; }
      }
      if (!sA) { console.log('\n  serie ' + serie + ': NON MISURATA (cinque appuntamenti senza un punteggio distinguibile)'); continue; }
      misurate++;
      const seg = [sA.serie.seg[0] | 0, sA.serie.seg[1] | 0];
      console.log('\n  SERIE ' + serie + ' — ' + seg.join('-') + ' · seme ' + sA.seme + ' · nastro ' + nA.length + ' caratteri');

      /* ----------------------------------------------------- VERSO 1 */
      const oN = await giudicaSu(browser, sgN.porta, nA, seg, sA.seme);
      const oV = await giudicaSu(browser, sgV.porta, nA, seg, sA.seme);
      const neutro = oN.verdetto === 'TORNA' && oV.verdetto === 'TORNA' &&
                     JSON.stringify(oN.gol) === JSON.stringify(oV.gol) && oN.passi === oV.passi;
      if (neutro) neutre++;
      console.log('    VERSO 1  il nastro ONESTO   ' + (neutro ? 'NEUTRO' : 'SCARTO!') +
                  '   curato: ' + mostra(oN) + '   ieri: ' + mostra(oV));
      if (!neutro) console.log('             LA CURA NON E\' NEUTRA SUL NASTRO ONESTO: si ripara quello, prima del numero.');

      /* ----------------------------------------------------- VERSO 2 */
      const bit = (rigaDiTipo(nA, 15).split(',')[4] | 0) ? 0 : 1;
      const CASI = [
        { n: 'la sola riga 15 tolta     ', t: togliTipo(nA, 15).testo },
        { n: 'la 15 e tutte le 14 tolte ', t: togliTipo(togliTipo(nA, 15).testo, 14).testo },
        { n: 'il bit del primo capovolto', t: cambiaArg(nA, 15, 1, bit).testo },
        { n: 'la versione ignota (v = 2)', t: cambiaArg(nA, 15, 0, 2).testo },
      ];
      for (const c of CASI) {
        const vN = await giudicaSu(browser, sgN.porta, c.t, seg, sA.seme);
        const vV = await giudicaSu(browser, sgV.porta, c.t, seg, sA.seme);
        casiTot++;
        if (vN.verdetto !== vV.verdetto || vN.causa !== vV.causa) cambiatiTot++;
        const accusa = vV.verdetto === 'NON TORNA';
        if (accusa) accuseTot++;
        console.log('    VERSO 2  ' + c.n + '   ieri: ' +
                    (vV.verdetto + (vV.causa ? '/' + vV.causa : '') + (accusa ? ' <<< ACCUSA' : '')).padEnd(40) +
                    ' [rigiocato ' + JSON.stringify(vV.gol) + ', ' + vV.passi + ' passi]' +
                    '   curato: ' + vN.verdetto + (vN.causa ? '/' + vN.causa : ''));
      }
    }

    if (!misurate) {
      console.error('\nPROVA NULLA: nessuna serie misurabile');
      for (const P of aperti) { try { await P.ctx.close(); } catch (x) {} }
      await browser.close(); sgN.chiudi(); sgV.chiudi(); cass.chiudi();
      process.exit(3);
    }
    console.log('\n  RIEPILOGO   serie misurate ' + misurate + ' su ' + NSERIE +
                ' · nastri onesti NEUTRI ' + neutre + '/' + misurate +
                '\n              verdetti cambiati dalla cura ' + cambiatiTot + ' su ' + casiTot +
                ' · di cui ACCUSE (NON TORNA) del giudice di ieri: ' + accuseTot);
    salire = accuseTot > 0;
  } catch (e) { esploso = e; }
  finally {
    for (const P of aperti) { try { await P.ctx.close(); } catch (x) {} }
    try { await browser.close(); } catch (x) {}
    try { sgN.chiudi(); } catch (x) {}
    try { sgV.chiudi(); } catch (x) {}
    try { cass.chiudi(); } catch (x) {}
  }
  if (esploso) {
    console.error('\nIL BANCO E\' ESPLOSO: ' + (esploso && esploso.message));
    console.error(esploso && esploso.stack);
    process.exit(2);
  }
  console.log('\n  ' + (salire
    ? 'MOTORE_V DEVE SALIRE: il giudice di ieri ACCUSA dove il curato si astiene.'
    : 'MOTORE_V puo\' restare dov\'e\': nessuna accusa del giudice di ieri.'));
  process.exit(salire ? 1 : 0);
})();
