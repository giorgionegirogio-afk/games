/* =====================================================================
   _q-dischetto-seme.js — IL SEME «A DUE MANI» NON E' PROTETTO
   (voce #149, compito 3)

   QUESTO CANCELLO NASCE ROSSO E RESTA ROSSO, ed e' dichiarato: misura un
   DIFETTO APERTO del protocollo, non una cura. Sta in `tutti.js` a
   `conta:false` per la stessa ragione per cui ci sta `motori` — un
   guasto vero e aperto si tiene in campo con la misura accanto, non lo
   si toglie dal campo perche' e' rosso.

   IL DIFETTO, IN CHIARO. L'appuntamento del dischetto (`:48641-48652`)
   fa una cosa sola: ognuno manda il proprio nonce IN CHIARO, e quando
   tutti e due hanno parlato il seme e' `dsMescola(na, nb)` e il primo
   tiratore e' il bit basso. Il commento accanto dice: «SI CHIUDE QUANDO
   TUTTI E DUE HANNO PARLATO, e non prima: e' questa riga a impedire che
   il secondo scelga il proprio nonce sapendo il primo».

   LA RIGA NON LO IMPEDISCE. Impedisce che il GIOCO chiuda prima, non che
   un pari scritto a mano RITARDI il proprio saluto: la cassetta e'
   pubblica, chi entra per secondo legge il nonce dell'altro, ne prova
   quattromila fino a trovarne uno che dia il seme che vuole, e solo
   allora parla. Il gioco non ha modo di sapere che ha aspettato.

   E NON E' SOLO IL BIT. Con il nonce dell'altro in mano si sceglie
   l'INTERO SEME, non solo la sua parita': il seme accende `SEME`, che e'
   il dado di tutta la partita. Un pari che sappia simulare (e il gioco e'
   un file solo, quindi lo sa chiunque) puo' cercarsi il seme che gli fa
   comodo, non solo il calcio d'inizio.

   L'ARMA ESISTEVA GIA' E NON LA IMBRACCIAVA NESSUNO: la bugia `semesuo`
   di `PariFinto` (`_dischetto-due-telefoni.js:406-428`) porta gia' il
   commento «se il gioco non lo pretende, questa bugia passa, e il banco
   deve accorgersene». Nessun cancello la metteva in campo. Adesso si'.

   LE DUE PROVE
     S1  il pari che si sceglie il nonce NON deve vincere il bit tutte le
         volte. OGGI LO VINCE: misurato 10 su 10 (voce #149).
     S2  TESTIMONE — lo stesso pari con la bugia SPENTA non vince tutte
         le volte. Senza, «dieci su dieci» potrebbe voler dire che il
         lato 'b' tira sempre per primo, e il banco misurerebbe il
         proprio sorteggio invece dell'attacco.

   PERCHE' LA CURA NON E' IN QUESTO CANTIERE, e va detto per esteso. La
   cura c'e' ed e' nota: lo stesso schema in due tempi che il #146 usa
   per i tiri — prima l'impegno `SHA-256(nonce)`, poi la rivelazione — e
   `dsImpegno` e' gia' scritto. Ma applicarlo al SALUTO vuol dire un giro
   di rete in piu' nell'appuntamento, una fase nuova nella macchina a
   stati, `DISCHETTO_V` da 1 a 2 (e' un MESSAGGIO che cambia, non una
   riga di nastro), e la riscrittura di `PariFinto` e dei SETTE falsi del
   dischetto che passano tutti di li'. E' un cantiere suo, non un pezzo
   di una passata correttiva: una mezza cura del protocollo e' peggio del
   buco dichiarato.

   uso:  node strumenti/_q-dischetto-seme.js [--gioco f.html] [--giri 10]
   esce  0 se il pari che sceglie il nonce NON vince sempre ·
         1 se lo vince (il difetto e' ancora li') ·
         2 se il banco e' esploso · 3 prova nulla
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const RADICE = T.RADICE;
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const GIOCO = arg('gioco');
if (GIOCO && !fs.existsSync(path.resolve(RADICE, GIOCO))) {
  console.error('PROVA NULLA: il file indicato non esiste: ' + GIOCO);
  process.exit(3);
}
const PROVA = GIOCO ? path.resolve(RADICE, GIOCO) : null;
const GIRI = Math.max(4, Math.min(40, parseInt(arg('giri', '10'), 10) || 10));

const esiti = [];
const di = (ok, nome, det) => { esiti.push(!!ok); console.log((ok ? '  OK  ' : '  NO  ') + nome + (det ? '   [' + det + ']' : '')); };
const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_crea = P => P.pag.evaluate(async () => await window.__test.dischetto.crea());

(async () => {
  console.log('\nIL SEME A DUE MANI, E LA MANO CHE SCEGLIE' + (GIOCO ? '   [' + GIOCO + ']' : ''));
  const sg = await T.serviGioco(PROVA);
  const cass = await T.serviCassetta({ frenoAcceso: false });
  const browser = await chromium.launch();
  let esploso = null;
  const aperti = [];
  try {
    const A = await T.apri(browser, sg.porta); aperti.push(A);
    if (!await A.pag.evaluate(() => !!(window.__test && window.__test.dischetto))) {
      console.error('PROVA NULLA: questo gioco non ha la sfida dal dischetto.');
      for (const P of aperti) await P.ctx.close();
      await browser.close(); sg.chiudi(); cass.chiudi();
      process.exit(3);
    }
    const base = 'http://127.0.0.1:' + cass.porta;
    await T.collega(A, cass.porta, 'ALFA');
    await T.entra(A);

    /* UN APPUNTAMENTO SOLO, e chi lo chiude decide chi tira per primo.
       Il pari finto entra come lato 'b', cioe' come chi arriva per
       secondo: e' esattamente la posizione dell'attacco. */
    async function unGiro(bugia) {
      const r = await d_crea(A);
      const cred = await T.credenziali(base);
      const P = new T.PariFinto(base, cred, r.stanza, 'b', bugia || {});
      const s0 = await d_stato(A);
      await P.saluta({ v: T.DISCHETTO_V, mv: s0.motoreV, imp: s0.impronta,
                       rosa: T.rosaFinta(3), n: T.esa(crypto.randomBytes(8)) });
      let primo = '';
      for (let g = 0; g < 20; g++) {
        await d_giro(A);
        await P.ritira();
        const s = await d_stato(A);
        if (s && s.primo) { primo = s.primo; break; }
      }
      await A.pag.evaluate(() => window.__test.dischetto.chiudi());
      return primo;
    }

    let vinteFinte = 0, misurateF = 0;
    for (let i = 0; i < GIRI; i++) {
      const p = await unGiro({ semesuo: true });
      if (!p) continue;
      misurateF++;
      if (p === 'b') vinteFinte++;
    }
    let vinteOneste = 0, misurateO = 0;
    for (let i = 0; i < GIRI; i++) {
      const p = await unGiro({});
      if (!p) continue;
      misurateO++;
      if (p === 'b') vinteOneste++;
    }

    if (!misurateF || !misurateO) {
      console.error('PROVA NULLA: nessun appuntamento si e\' chiuso (il pari finto non ha parlato)');
      for (const P of aperti) await P.ctx.close();
      await browser.close(); sg.chiudi(); cass.chiudi();
      process.exit(3);
    }

    di(vinteFinte < misurateF,
       'S1) il pari che RITARDA il saluto e si sceglie il nonce non vince sempre il bit',
       'vinte ' + vinteFinte + ' su ' + misurateF +
       (vinteFinte === misurateF ? '   DIFETTO APERTO: il seme a due mani lo sceglie una mano sola' : ''));
    di(vinteOneste < misurateO,
       'S2) TESTIMONE — lo stesso pari con la bugia SPENTA non vince sempre',
       'vinte ' + vinteOneste + ' su ' + misurateO +
       (vinteOneste === misurateO ? '   il banco sta misurando il proprio sorteggio, non l\'attacco' : ''));
  } catch (e) { esploso = e; }
  finally {
    for (const P of aperti) { try { await P.ctx.close(); } catch (x) {} }
    try { await browser.close(); } catch (x) {}
    try { sg.chiudi(); } catch (x) {}
    try { cass.chiudi(); } catch (x) {}
  }
  if (esploso) {
    console.error('\nIL BANCO E\' ESPLOSO: ' + (esploso && esploso.message));
    console.error(esploso && esploso.stack);
    process.exit(2);
  }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n  ' + (esiti.length - rossi) + ' su ' + esiti.length + (rossi ? ('   ROSSI: ' + rossi) : '   verde'));
  process.exit(rossi ? 1 : 0);
})();
