/* =====================================================================
   _q-casa.js — LE TRASCENDENTI IN CASA, MISURATE
   (voce #143, compito 2)

   PROVA QUELLO CHE IL GIOCO USA. La sorgente misurata qui e' la STESSA
   che `_toppa-143-matematica.js` innesta nel gioco: sta in
   `strumenti/_143-matematica.js` e ne esiste una copia sola. Un banco
   che provasse una seconda scrittura della stessa formula attesterebbe
   una funzione e ne lascerebbe girare un'altra — il modo piu'
   silenzioso di mentire che questo repo conosca.

   SUL DOMINIO VERO, NON SU UN DOMINIO COMODO. Gli argomenti non sono
   inventati: si registrano quelli che il gioco passa davvero in una
   partita CPU contro CPU, funzione per funzione, e su quelli si misura.
   Un banco che provasse `sin` su [0, 1] direbbe cose vere e inutili.

   LE QUATTRO PROVE:

   D) IL DOMINIO — il piu' grande e il piu' piccolo argomento che il
      gioco passa davvero, contro il TETTO dichiarato della riduzione
      d'argomento (2^31) e contro le soglie di straripamento di
      `Mhypot`. E' la misura che rende il tetto una scelta invece che
      una speranza. Se un giorno il gioco passasse un argomento vicino
      al tetto, questa prova diventa rossa PRIMA che la partita cambi.

   C) LA CASA E' LA STESSA OVUNQUE — e' LA SOGLIA. Gli stessi bit su
      Chromium (V8), WebKit (JavaScriptCore) e Firefox (SpiderMonkey),
      su tutti gli argomenti veri. Se questa e' rossa, il cantiere non
      esiste.

   N) LA NATIVA NON LO E' — la condanna, misurata sullo stesso dominio.
      Serve a due cose: dire quali funzioni divergono DAVVERO nel gioco
      (il #141 le ha misurate su 200 valori costruiti a mano, qui sono
      gli argomenti veri), e impedire che la prova C sia verde per il
      motivo sbagliato. Se anche le native fossero identiche ovunque,
      «la casa e' identica» non proverebbe niente: sarebbe il falso
      `_crit-motore-piatto` del #142 travestito.

   U) LO SCARTO IN ULP — quanto la casa si discosta dalla nativa, sul
      dominio vero, in unita' dell'ultimo bit. IL RIFERIMENTO E' LA
      NATIVA, e va detto cosa vale: le librerie dei tre motori stanno
      entro circa un ulp dal valore correttamente arrotondato, quindi
      uno scarto misurato di k ulp significa «errore della casa fra
      k-1 e k+1 ulp». Non e' una dimostrazione di correttezza: e' la
      garanzia che la cura non sposta i numeri del gioco piu' di quanto
      li spostasse gia' il disaccordo fra due telefoni. E' il falso
      `_crit-casa-storta`: una funzione uguale ovunque ma sbagliata di
      mille ulp passerebbe C e N, e solo U la boccia.

   uso:  node strumenti/_q-casa.js
         node strumenti/_q-casa.js --motori chromium,webkit
         node strumenti/_q-casa.js --tetto-ulp 4
   esce 0 se tutto tiene, 1 se la casa non e' uguale ovunque o e' storta,
   2 se il banco e' esploso, 3 se non c'e' stato niente da misurare.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const playwright = require('playwright');
const { SORGENTE } = require('./_143-matematica.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const MOTORI = String(arg('motori', 'chromium,webkit,firefox')).split(',').map(s => s.trim()).filter(Boolean);
const SEME = parseInt(arg('seme', '20260923'), 10) >>> 0;
const SECONDI = Math.max(5, parseInt(arg('secondi', '90'), 10) || 90);
const TETTO_ULP = Math.max(1, parseInt(arg('tetto-ulp', '4'), 10) || 4);
const NCAMP = Math.max(100, parseInt(arg('campioni', '3000'), 10) || 3000);
const GIOCO = arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');
/* --sorgente punta a un TESTO di libreria diverso da quello di casa: e'
   la porta da cui entrano i falsi (_q-casa-falsi.js). Senza, si misura
   la sorgente vera. */
const SORG_FILE = arg('sorgente', '');
const LIBRERIA = SORG_FILE ? fs.readFileSync(path.resolve(RADICE, SORG_FILE), 'utf8') : SORGENTE;

/* le funzioni scritte in casa, col numero di argomenti che prendono */
const FUN = [
  ['sin', 1, 'Msin'], ['cos', 1, 'Mcos'], ['tan', 1, 'Mtan'],
  ['exp', 1, 'Mexp'], ['log', 1, 'Mlog'],
  ['atan2', 2, 'Matan2'], ['hypot', 2, 'Mhypot'],
  ['pow', 2, null],   /* nessuna casa: si misura solo se la nativa diverge */
  ['sqrt', 1, null],  /* IEEE-754 la obbliga: si misura per poterlo dire con un numero */
];

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

const OPZ = { viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' };
async function apri(browser, porta) {
  const ctx = await browser.newContext(Object.assign({}, OPZ));
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/${GIOCO}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 40000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { ctx, pag, errori };
}

/* IL RACCOLTO — gli argomenti veri. Si prende uno ogni `passo` chiamate
   fino a riempire il campione, ma gli ESTREMI si aggiornano SEMPRE: un
   campionamento a passo fisso puo' non vedere mai il valore piu' grande,
   e il valore piu' grande e' proprio quello che il tetto deve reggere. */
const RACCOLTA = `(seme, secondi, nomi, ncamp) => {
  const veri = {}, camp = {}, est = {}, cont = {};
  for(const [n, ar] of nomi){
    veri[n] = Math[n]; camp[n] = []; cont[n] = 0;
    est[n] = { max: 0, min: Infinity, nonFinito: 0 };
  }
  for(const [n, ar] of nomi){
    const v = veri[n], E = est[n];
    Math[n] = function(a, b){
      cont[n]++;
      const A = M_ass(a), B = ar > 1 ? M_ass(b) : 0;
      const g = A > B ? A : B, p = (ar > 1 && B > 0 && B < A) ? B : A;
      if(!isFinite(a) || (ar > 1 && !isFinite(b))) E.nonFinito++;
      else { if(g > E.max) E.max = g; if(p > 0 && p < E.min) E.min = p; }
      if(camp[n].length < ncamp && (cont[n] % 7) === 1) camp[n].push(ar > 1 ? [a, b] : [a]);
      return ar > 1 ? v.call(Math, a, b) : v.call(Math, a);
    };
  }
  function M_ass(x){ return x < 0 ? -x : x; }
  const t = window.__test;
  t.semina(seme);
  t.startMatch(1, 1, undefined);
  t.setCpuVsCpu(true);
  let s = 0;
  while(t.state !== 'end' && s < secondi){ t.simulate(1); s += 1; }
  for(let i = 0; i < 60; i++){ t.disegna(); t.simulate(1/60); }
  for(const [n] of nomi) Math[n] = veri[n];
  const out = {};
  for(const [n] of nomi) out[n] = { camp: camp[n], est: est[n], chiamate: cont[n] };
  return out;
}`;

/* IL CALCOLO, DENTRO IL MOTORE. Si leggono i BIT e non i decimali:
   toString arrotonda a 17 cifre e nasconde proprio l'ultimo bit. */
const CALCOLO = `(sorgente, nomi, dati) => {
  const casa = new Function(sorgente + '\\nreturn {Msin,Mcos,Mtan,Mexp,Mlog,Matan2,Mhypot};')();
  const fb = new Float64Array(1), ub = new BigUint64Array(fb.buffer);
  const bit = x => { fb[0] = x; return ub[0]; };
  const out = {};
  for(const [n, ar, mn] of nomi){
    const vs = dati[n].camp;
    const bn = new Array(vs.length), bc = new Array(vs.length);
    for(let i = 0; i < vs.length; i++){
      const a = vs[i];
      const rn = ar > 1 ? Math[n](a[0], a[1]) : Math[n](a[0]);
      bn[i] = bit(rn).toString(16);
      if(mn){
        const rc = ar > 1 ? casa[mn](a[0], a[1]) : casa[mn](a[0]);
        bc[i] = bit(rc).toString(16);
      }
    }
    out[n] = { nativa: bn.join(' '), casa: mn ? bc.join(' ') : '' };
  }
  return out;
}`;

/* la distanza in ULP fra due double, letta sui bit: e' l'unica che non
   dipende dalla grandezza del numero */
function ulpFraBit(a, b) {
  if (a === b) return 0;
  const A = BigInt('0x' + a), B = BigInt('0x' + b);
  const seg = v => (v >> 63n) ? -(v & 0x7fffffffffffffffn) : v;
  let d = seg(A) - seg(B);
  if (d < 0n) d = -d;
  return d > 1000000n ? Infinity : Number(d);
}

(async () => {
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
  const aperti = []; let srv = null;
  try {
    srv = await servi();
    console.log('=== LE TRASCENDENTI IN CASA — ' + MOTORI.join(' / ') + ', dominio di una partita di ' + SECONDI + ' s ===\n');

    for (const nome of MOTORI) {
      if (!playwright[nome]) throw Object.assign(new Error('motore sconosciuto: ' + nome), { banco: true });
      let browser;
      try { browser = await playwright[nome].launch(); }
      catch (e) { throw Object.assign(new Error('non si apre ' + nome + ': ' + e.message), { banco: true }); }
      const p = await apri(browser, srv.porta);
      aperti.push({ nome, browser, ...p });
      console.log('  . ' + nome + ' aperto');
    }
    if (aperti.length < 2) throw Object.assign(new Error('servono almeno due motori'), { banco: true });
    console.log('');

    /* ---- D: il dominio vero ---- */
    const nomi = FUN.map(([n, ar, mn]) => [n, ar, mn]);
    const dati = await aperti[0].pag.evaluate(([g, a]) => new Function('return ' + g)()(...a),
      [RACCOLTA, [SEME, SECONDI, nomi, NCAMP]]);
    const quante = FUN.reduce((s, [n]) => s + dati[n].camp.length, 0);
    if (!quante) { console.error('PROVA NULLA: nessun argomento raccolto'); process.exit(3); }

    /* ---- S: la copia sola ---- */
    console.log("S) LA COPIA SOLA — la libreria misurata qui e' quella che gira nel gioco");
    console.log("   (un banco che provasse una seconda scrittura della stessa formula attesterebbe");
    console.log("    una funzione e ne lascerebbe girare un'altra: e' il modo piu' silenzioso di mentire)");
    const testoGioco = fs.readFileSync(path.join(RADICE, GIOCO), 'utf8');
    const cMarchio = testoGioco.indexOf('LA MATEMATICA IN CASA (voce #143)') >= 0;
    const cCombacia = cMarchio && testoGioco.indexOf(SORGENTE.trim()) >= 0;
    di(cCombacia, 'il testo di _143-matematica.js sta nel gioco parola per parola',
       cCombacia ? GIOCO : (cMarchio ? "C'E' UNA LIBRERIA NEL GIOCO MA IL TESTO E' DIVERSO" : "la libreria non e' innestata in " + GIOCO));
    if (SORG_FILE) console.log('   (--sorgente ' + SORG_FILE + ': si sta misurando una libreria FINTA, per i falsi)');
    console.log('');

    console.log('D) IL DOMINIO VERO — gli argomenti che il gioco passa davvero, contro il tetto dichiarato');
    console.log('   (tetto della riduzione d\'argomento: 2^31 = 2147483648; Mhypot straripa sopra ~1.3e154)');
    for (const [n, ar] of FUN) {
      const d = dati[n];
      if (!d.chiamate) { console.log('   Math.' + n.padEnd(6) + ' MAI CHIAMATA in questa partita — nessun dominio da difendere'); continue; }
      console.log('   Math.' + n.padEnd(6) + ' ' + String(d.chiamate).padStart(8) + ' chiamate · |arg| da ' +
                  (d.est.min === Infinity ? '0' : d.est.min.toExponential(2)) + ' a ' + d.est.max.toExponential(2) +
                  ' · campione ' + d.camp.length +
                  (d.est.nonFinito ? ' · NON FINITI ' + d.est.nonFinito : ''));
    }
    const tetto = 2147483648;
    const sopra = FUN.filter(([n]) => dati[n].chiamate && dati[n].est.max > tetto).map(([n]) => n);
    di(sopra.length === 0, 'nessun argomento arriva al tetto della riduzione (2^31)',
       sopra.length ? 'sfondano: ' + sopra.join(', ') : 'il piu' + '\' grande e\' ' +
       Math.max(...FUN.filter(([n]) => dati[n].chiamate).map(([n]) => dati[n].est.max)).toExponential(2) +
       ', ' + Math.round(Math.log10(tetto / Math.max(1e-30, Math.max(...FUN.filter(([n]) => dati[n].chiamate).map(([n]) => dati[n].est.max))))) + ' ordini di grandezza sotto');
    const nonFin = FUN.filter(([n]) => dati[n].est.nonFinito).map(([n]) => n + ' ' + dati[n].est.nonFinito);
    di(nonFin.length === 0, 'nessuna trascendente riceve un argomento non finito', nonFin.join(', ') || 'zero');
    console.log('');

    /* ---- il calcolo su ogni motore ---- */
    const res = {};
    for (const m of aperti) {
      res[m.nome] = await m.pag.evaluate(([g, a]) => new Function('return ' + g)()(...a),
        [CALCOLO, [LIBRERIA, nomi, dati]]);
    }
    const base = aperti[0].nome, altri = aperti.slice(1).map(m => m.nome);

    /* ---- N: la nativa non e' la stessa (la condanna) ---- */
    console.log('N) LA NATIVA NON E\' LA STESSA — la condanna, sugli argomenti VERI del gioco');
    console.log('   (senza questa prova, «la casa e\' identica ovunque» non proverebbe niente:');
    console.log('    sarebbe vero anche se i motori fossero gia\' d\'accordo su tutto)');
    const divergenti = [];
    for (const [n] of FUN) {
      const d = dati[n];
      if (!d.camp.length) { console.log('   Math.' + n.padEnd(6) + ' nessun campione — non misurata'); continue; }
      const a = res[base][n].nativa.split(' ');
      const righe = []; let peggio = 0;
      for (const o of altri) {
        const b = res[o][n].nativa.split(' ');
        let k = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) k++;
        if (k > peggio) peggio = k;
        righe.push(o + ' ' + k + '/' + a.length);
      }
      if (peggio) divergenti.push(n);
      console.log('   Math.' + n.padEnd(6) + (peggio ? 'DIVERGE  ' : 'concorde ') + righe.join(' | '));
    }
    di(divergenti.length > 0, 'almeno una nativa diverge sul dominio vero (se no non c\'e\' niente da curare)',
       divergenti.join(', ') || 'nessuna');
    /* LE DUE LASCIATE NATIVE DEVONO RESTARE D'ACCORDO, E QUESTA RIGA E'
       LA GUARDIA CHE LO IMPONE. `pow` e `sqrt` non hanno una versione in
       casa perche' MISURATO danno gli stessi bit su tutti e tre i motori
       (sqrt lo deve a IEEE-754, che la obbliga a essere correttamente
       arrotondata; pow non lo deve a nessuno — e' un fatto delle
       implementazioni di oggi, non una norma). `pow` sta DENTRO il
       perimetro della simulazione (misurato: 110.786 chiamate in 90 s,
       e sporcarla cambia la partita, _q-perimetro.js), quindi il giorno
       in cui un motore cambiasse il suo arrotondamento di pow il
       lockstep si romperebbe in silenzio. Qui non si rompe in silenzio:
       si diventa rossi, e la cura e' scriverla in casa come le altre. */
    const nudeRotte = FUN.filter(([n, ar, mn]) => !mn && divergenti.includes(n)).map(([n]) => n);
    di(nudeRotte.length === 0, 'le native lasciate tali (pow, sqrt) sono ancora d\'accordo fra i motori',
       nudeRotte.length ? 'DIVERGONO: ' + nudeRotte.join(', ') + ' — vanno scritte in casa' : 'pow e sqrt concordi');
    console.log('');

    /* ---- C: la casa e' la stessa ovunque (LA SOGLIA) ---- */
    console.log('C) LA CASA E\' LA STESSA OVUNQUE — e\' LA SOGLIA del cantiere');
    for (const [n, ar, mn] of FUN) {
      if (!mn || !dati[n].camp.length) continue;
      const a = res[base][n].casa.split(' ');
      const righe = []; let peggio = 0;
      for (const o of altri) {
        const b = res[o][n].casa.split(' ');
        let k = 0, primo = -1;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { k++; if (primo < 0) primo = i; }
        if (k > peggio) peggio = k;
        righe.push(o + ' ' + k + '/' + a.length + (k ? ' (@' + primo + ')' : ''));
      }
      di(peggio === 0, mn.padEnd(8) + ' da\' gli stessi bit su ' + MOTORI.length + ' motori', righe.join(' | '));
    }
    console.log('');

    /* ---- U: lo scarto in ULP ---- */
    console.log('U) LO SCARTO IN ULP dalla nativa, sul dominio vero (tetto ' + TETTO_ULP + ' ulp)');
    console.log('   (il riferimento e\' la nativa del motore, che sta entro ~1 ulp dal valore');
    console.log('    correttamente arrotondato: uno scarto di k vuol dire errore fra k-1 e k+1)');
    for (const [n, ar, mn] of FUN) {
      if (!mn || !dati[n].camp.length) continue;
      let peggio = 0, dove = null, identici = 0, tot = 0;
      for (const m of aperti) {
        const a = res[m.nome][n].nativa.split(' '), b = res[m.nome][n].casa.split(' ');
        for (let i = 0; i < a.length; i++) {
          const d = ulpFraBit(a[i], b[i]);
          tot++; if (d === 0) identici++;
          if (d > peggio) { peggio = d; dove = dati[n].camp[i]; }
        }
      }
      di(peggio <= TETTO_ULP, mn.padEnd(8) + ' sta entro ' + TETTO_ULP + ' ulp dalla nativa',
         'max ' + peggio + ' ulp · identici ' + identici + '/' + tot +
         (peggio ? ' · il peggiore a ' + JSON.stringify(dove) : ''));
    }
    console.log('');

    const errori = [].concat(...aperti.map(m => m.errori));
    for (const m of aperti) await m.browser.close();
    aperti.length = 0;
    srv.chiudi(); srv = null;
    if (errori.length) { console.error('ECCEZIONI DI PAGINA: ' + errori.slice(0, 3).join(' | ')); process.exit(2); }

    const rossi = esiti.filter(x => !x).length;
    console.log(esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti\n');
    if (rossi) { console.log('>>> LA CASA NON TIENE: vedere i NO qui sopra.'); process.exit(1); }
    console.log('>>> LA CASA TIENE: le funzioni scritte in casa danno gli STESSI BIT su ' +
                MOTORI.join(', ') + ' su tutti gli argomenti veri del gioco, e stanno entro ' +
                TETTO_ULP + ' ulp dalle native — mentre le native fra loro divergono su ' +
                divergenti.join(', ') + '.');
    process.exit(0);
  } catch (e) {
    for (const m of aperti) { try { await m.browser.close(); } catch (x) {} }
    try { if (srv) srv.chiudi(); } catch (x) {}
    if (!e.gia) console.error('\nFALLITO (banco): ' + e.message + '\n' + (e.stack || ''));
    process.exit(2);
  }
})();
