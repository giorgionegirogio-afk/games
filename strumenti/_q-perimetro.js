/* =====================================================================
   _q-perimetro.js — QUALI TRASCENDENTI DECIDONO LA PARTITA
   (voce #143, compito 1)

   PERCHE' ESISTE. Il #141 ha misurato che tre motori JavaScript non
   producono la stessa partita, e il #143 le riscrive in casa con sole
   operazioni IEEE-754 esatte. Ma il gioco chiama `Math.sin` 161 volte e
   `Math.cos` 105: riscriverle tutte costa prestazione, e la maggior
   parte di quelle chiamate potrebbe stare nel DISEGNO — la cosmetica,
   che dal #129 gira su un generatore dedicato e che due telefoni possono
   dipingere diversamente senza che la partita cambi.

   QUAL E' LA DIFFERENZA, E PERCHE' VA MISURATA E NON DEDOTTA. Il nome
   della funzione che contiene la chiamata non e' una prova: `render()`
   chiama funzioni che la simulazione chiama a sua volta, e la cottura
   delle tele dentro `startMatch` CONSUMA IL GENERATORE (voce #98), cioe'
   una trascendente «di grafica» puo' spostare un sorteggio e quindi il
   gol. Qui si misura in due modi indipendenti, e si dichiara quando i
   due non dicono la stessa cosa.

   ------------------------------------------------------------------
   P) LA POPOLAZIONE — quali SITI si accendono, e quante volte
   ------------------------------------------------------------------
   Si costruisce una copia del gioco in cui ogni chiamata eseguibile
   `Math.f(` diventa `(__hit(id),Math.f)(` — l'operatore virgola
   restituisce la funzione, quindi il valore calcolato non cambia di un
   bit; cambia solo che passando di li' si segna un numero. I siti sono
   trovati da `_143-siti.js`, che salta commenti, stringhe, template ed
   espressioni regolari: una grep conterebbe anche i commenti che
   PARLANO di Math.hypot.

   Tre finestre, azzerate una per volta: la COTTURA (`startMatch`), il
   PASSO (`simulate`, che non disegna mai: si veda `__test.simulate`,
   chiama `step()` e basta) e il DISEGNO (`__test.disegna`, che chiama
   `render()` senza far avanzare la fisica). Un sito che si accende nella
   cottura o nel passo e' DENTRO il perimetro; uno che si accende solo
   nel disegno e' fuori; uno che non si accende mai non e' «fuori», e'
   NON MISURATO, e si dichiara tale invece di darlo per innocente.

   Si contano anche le CHIAMATE, non solo i siti: e' il numero che decide
   se l'innesto costa prestazione. Un sito in un ciclo sulla folla vale
   mille siti fuori.

   ------------------------------------------------------------------
   S) LA SOSTITUZIONE SPORCA — quali FUNZIONI cambiano la partita
   ------------------------------------------------------------------
   La prova vera, e non passa dal codice: si sostituisce `Math.f` con una
   versione che restituisce un valore leggermente diverso e si guarda se
   l'IMPRONTA DELLA PARTITA cambia. Due forze, apposta:

     · UN ULP — la stessa forza con cui i motori veri differiscono
       (misurato dal #141: hypot 100/200 valori, sin 7/200, e sempre
       sull'ultimo bit). E' la prova FEDELE.
     · UNO SU UN MILIARDO (1e-9 relativo) — un disturbo molto piu' grosso
       dell'ultimo bit. Serve contro il falso negativo: se nemmeno questo
       muove l'impronta, la funzione e' fuori dal perimetro per davvero e
       non «per fortuna su questo seme». Un falso troppo gentile non
       prova niente (regola 19 di PUNTO-DEL-LAVORO).

   E si CONTANO LE CHIAMATE anche qui: una funzione che non e' mai stata
   chiamata durante la prova non e' «fuori dal perimetro», e' un campione
   vuoto. Senza questo testimone, «l'impronta non e' cambiata» e «nessuno
   l'ha chiamata» sarebbero lo stesso referto (regola 18).

   L'impronta e' PAROLA PER PAROLA quella di `_q-determinismo.js` e di
   `_q-motori.js`: se fosse diversa, un rosso qui e un verde la'
   vorrebbero dire «due metri diversi» invece di «due misure diverse».

   uso:  node strumenti/_q-perimetro.js
         node strumenti/_q-perimetro.js --semi 4 --secondi 90
   esce 0 se la misura e' completa e coerente, 2 se il banco e' esploso,
   3 se non c'era niente da misurare.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const playwright = require('playwright');
const { NOMI, trovaSiti } = require('./_143-siti.js');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const NSEMI = Math.max(1, parseInt(arg('semi', '3'), 10) || 3);
const SEME0 = parseInt(arg('seme', '20260923'), 10) >>> 0;
const SECONDI = Math.max(5, parseInt(arg('secondi', '90'), 10) || 90);
const TAGLIA = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
const GIOCO = path.join(RADICE, arg('gioco', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html'));

/* ------------------------------------------------------------------
   LA COPIA STRUMENTATA. `(__hit(id),Math.f)(...)` e' la stessa
   chiamata: l'operatore virgola valuta la segnatura, la butta via e
   restituisce `Math.f`, che viene poi chiamata con gli stessi argomenti
   e nello stesso ordine. Nessun arrotondamento cambia.
   ------------------------------------------------------------------ */
function strumenta(testo) {
  /* IL CENSIMENTO SI FA SUL GIOCO SENZA LA CURA, e non e' un ripiego.
     La domanda della prova P e' «quali chiamate DEL GIOCO decidono la
     partita»: e' una proprieta' del gioco, non della cura, e dopo
     l'innesto del compito 3 quelle chiamate si chiamano Msin invece che
     Math.sin. Si toglie la cura (`sguaina`, l'innesto al contrario) e si
     contano i siti dove sono sempre stati. La ricostruzione e' fedele
     parola per parola — innesta(sguaina(x)) === x, verificato a ogni
     corsa da `_q-casa-falsi.js` prova 0 — quindi i siti sono gli stessi
     siti, con gli stessi indici. La prova S qui sotto, invece, gira sul
     gioco COM'E', perche' li' la domanda e' sul comportamento. */
  if (testo.indexOf('LA MATEMATICA IN CASA (voce #143)') >= 0) {
    const { sguaina } = require('./_toppa-143-matematica.js');
    testo = sguaina(testo).testo;
  }
  const siti = trovaSiti(testo);
  let out = '', ultimo = 0;
  siti.forEach((s, id) => {
    out += testo.slice(ultimo, s.indice) + '(__hit(' + id + '),Math.' + s.nome + ')(';
    ultimo = s.fine;
  });
  out += testo.slice(ultimo);
  const preambolo = `<script>
window.__conta = new Int32Array(${siti.length});
window.__chiamate = 0;
window.__hit = function(i){ window.__conta[i]++; window.__chiamate++; };
window.__azzera = function(){ window.__conta.fill(0); window.__chiamate = 0; };
window.__accesi = function(){ const a=[]; for(let i=0;i<window.__conta.length;i++) if(window.__conta[i]) a.push(i); return {siti:a, chiamate:window.__chiamate}; };
</script>
`;
  /* il preambolo PRIMA di tutto: il gioco chiama trascendenti gia' al
     caricamento, e un contatore che nasce dopo perderebbe proprio quelle */
  const i = out.indexOf('<script>');
  if (i < 0) throw Object.assign(new Error('nessun <script> nel gioco'), { banco: true });
  return { testo: out.slice(0, i) + preambolo + out.slice(i), siti };
}

function servi(mappa) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      if (mappa[rel]) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(mappa[rel]); return;
      }
      const f = path.join(RADICE, rel);
      if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* la stessa impronta di _q-determinismo e _q-motori, parola per parola */
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0,
           Math.round((p.umore||0)*1000), Math.round((p.nervi||0)*1000));
  if(Array.isArray(G.spinta)) s.push(Math.round(G.spinta[0]*1000), Math.round(G.spinta[1]*1000));
  return s.join(',');
})()`;

const OPZ = { viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' };

async function apri(browser, porta, file) {
  const ctx = await browser.newContext(Object.assign({}, OPZ));
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/${file}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 40000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { ctx, pag, errori };
}

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

(async () => {
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
  let browser = null, srv = null;
  try {
    const testo = fs.readFileSync(GIOCO, 'utf8');
    const { testo: strum, siti } = strumenta(testo);
    if (!siti.length) { console.error('PROVA NULLA: nessun sito trovato nel gioco'); process.exit(3); }
    srv = await servi({ '/__strumentato.html': strum });
    browser = await playwright.chromium.launch();

    console.log('=== IL PERIMETRO DELLA SIMULAZIONE — ' + siti.length + ' siti eseguibili, ' +
                NSEMI + ' semi a taglia ' + TAGLIA + ', ' + SECONDI + ' s ===\n');

    /* ---------------- P) LA POPOLAZIONE ---------------- */
    console.log('P) LA POPOLAZIONE — quali SITI si accendono nella cottura, nel passo, nel disegno');
    const ps = await apri(browser, srv.porta, '__strumentato.html');
    const pop = await ps.pag.evaluate(([seme, taglia, secondi]) => {
      const t = window.__test;
      const caric = window.__accesi();
      window.__azzera();
      t.semina(seme);
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      const cottura = window.__accesi();
      window.__azzera();
      t.simulate(secondi);
      const passo = window.__accesi();
      window.__azzera();
      for (let i = 0; i < 60; i++) { t.disegna(); t.simulate(1 / 60); }
      const disegno = window.__accesi();
      return { caric, cottura, passo, disegno };
    }, [SEME0, TAGLIA, SECONDI]);
    await ps.ctx.close();

    const ins = a => new Set(a);
    const sCott = ins(pop.cottura.siti), sPass = ins(pop.passo.siti), sDis = ins(pop.disegno.siti), sCar = ins(pop.caric.siti);
    const dentro = new Set([...sCott, ...sPass]);
    const soloDisegno = [...sDis].filter(i => !dentro.has(i));
    const mai = siti.map((_, i) => i).filter(i => !dentro.has(i) && !sDis.has(i) && !sCar.has(i));
    const soloCaric = [...sCar].filter(i => !dentro.has(i) && !sDis.has(i));

    const perNome = lista => {
      const c = {}; for (const i of lista) c[siti[i].nome] = (c[siti[i].nome] || 0) + 1;
      return NOMI.filter(n => c[n]).map(n => n + ' ' + c[n]).join(', ') || '-';
    };
    console.log('   siti totali eseguibili : ' + siti.length + '   (' + perNome(siti.map((_, i) => i)) + ')');
    console.log('   DENTRO il perimetro    : ' + dentro.size + '   (' + perNome([...dentro]) + ')');
    console.log('     · accesi in cottura  : ' + sCott.size + '   ' + pop.cottura.chiamate + ' chiamate in un startMatch');
    console.log('     · accesi nel passo   : ' + sPass.size + '   ' + pop.passo.chiamate + ' chiamate in ' + SECONDI + ' s di gioco');
    console.log('   SOLO DISEGNO           : ' + soloDisegno.length + '   (' + perNome(soloDisegno) + ')');
    console.log('     · 60 fotogrammi      : ' + pop.disegno.chiamate + ' chiamate in tutto, ' +
                Math.round(pop.disegno.chiamate / 60) + ' per fotogramma');
    console.log('   solo al caricamento    : ' + soloCaric.length + '   (' + perNome(soloCaric) + ')');
    console.log('   MAI ACCESI (non misurati, non «innocenti»): ' + mai.length + '   (' + perNome(mai) + ')');
    const perPasso = pop.passo.chiamate / Math.round(SECONDI * 60);
    console.log('   chiamate per passo di simulazione: ' + perPasso.toFixed(0) +
                '   ·   per fotogramma disegnato: ' + Math.round(pop.disegno.chiamate / 60));
    di(dentro.size > 0, 'la finestra della simulazione ha acceso qualche sito', dentro.size + ' siti');
    di(pop.disegno.chiamate > 0, 'la finestra del disegno ha acceso qualche sito', pop.disegno.chiamate + ' chiamate');
    console.log('');

    /* ---------------- S) LA SOSTITUZIONE SPORCA ---------------- */
    console.log('S) LA SOSTITUZIONE SPORCA — si sporca UNA funzione e si guarda se la PARTITA cambia');
    console.log('   (un ulp = la forza vera con cui i motori differiscono; 1e-9 = il caso peggiore,');
    console.log('    contro il falso negativo. Le chiamate contate sono il testimone: senza, «non');
    console.log('    e\' cambiato niente» e «non l\'ha chiamata nessuno» sarebbero lo stesso referto.)');
    const gs = await apri(browser, srv.porta, 'CALCETTO-il-gioco.html');
    /* LA SOSTITUZIONE SPORCA SI FA SU QUEL CHE IL GIOCO CHIAMA DAVVERO.
       Dopo l'innesto del compito 3 il gioco non chiama piu' Math.sin ma
       Msin: sporcare Math.sin non sporcherebbe niente, il banco
       conterebbe zero chiamate e direbbe «MAI CHIAMATA» per tutte e
       sette, cioe' assolverebbe l'intero perimetro senza averlo
       guardato. E' la stessa cecita' che il falso «storta» ha trovato in
       _q-casa.js lo stesso giorno: quando si ripara uno strumento si
       cerca subito la stessa ferita in quelli che l'hanno copiato. */
    const GIOCA = `(seme, taglia, secondi, IMPR, quale, forza) => {
      const t = window.__test;
      const CASA = { sin:'Msin', cos:'Mcos', tan:'Mtan', exp:'Mexp', log:'Mlog', atan2:'Matan2', hypot:'Mhypot' };
      const inCasa = k => !!(CASA[k] && typeof window[CASA[k]] === 'function');
      if (!window.__veri) {
        window.__veri = {}; window.__dove = {};
        for (const k of ['sin','cos','tan','exp','log','atan2','hypot','pow','sqrt']) {
          window.__dove[k] = inCasa(k) ? 'casa' : 'nativa';
          window.__veri[k] = window.__dove[k] === 'casa' ? window[CASA[k]] : Math[k];
        }
      }
      for (const k in window.__veri) {
        if (window.__dove[k] === 'casa') window[CASA[k]] = window.__veri[k];
        else Math[k] = window.__veri[k];
      }
      window.__n = 0;
      if (quale) {
        const vero = window.__veri[quale];
        const fb = new Float64Array(1), ub = new Uint32Array(fb.buffer);
        /* UN ULP COME LO FANNO I MOTORI VERI, non come farebbe comodo.
           La prima versione di questa riga aggiungeva +1 ulp a OGNI
           valore, e dava 0 semi cambiati su 3 per tutte e sei le
           funzioni: un referto che avrebbe assolto l'intero perimetro.
           Era il falso troppo gentile al contrario — troppo REGOLARE.
           Due motori non sbagliano tutti i valori e non sbagliano tutti
           nella stessa direzione: il #141 ha misurato hypot diverso su
           100 valori su 200, sin su 7, cos su 3, e sempre l'ultimo bit
           in su o in giu'. Uno scarto sistematico verso l'alto si
           SEMPLIFICA nelle differenze e nei rapporti che il gioco fa
           subito dopo (dx/len, len-r), e quindi non si vede. Qui si
           sporca META' dei valori, meta' in su e meta' in giu', scelti
           da una funzione dei bit del valore stesso: deterministica —
           lo stesso valore riceve sempre lo stesso scarto, come farebbe
           un motore diverso — e senza direzione privilegiata. */
        const ulp = v => {
          if (!isFinite(v) || v === 0) return v;
          fb[0] = v;
          const h = (ub[0] ^ Math.imul(ub[1], 2654435761)) >>> 0;
          if (h & 2) return v;                       /* meta' dei valori: identici */
          if (h & 1) { if (ub[0] === 0xFFFFFFFF) { ub[0] = 0; ub[1] = (ub[1] + 1) >>> 0; } else ub[0] = (ub[0] + 1) >>> 0; }
          else       { if (ub[0] === 0)          { ub[0] = 0xFFFFFFFF; ub[1] = (ub[1] - 1) >>> 0; } else ub[0] = (ub[0] - 1) >>> 0; }
          return fb[0];
        };
        const grosso = v => (isFinite(v) ? v + v * 1e-9 + (v === 0 ? 1e-12 : 0) : v);
        const f = forza === 'ulp' ? ulp : grosso;
        const casa = window.__dove[quale] === 'casa';
        const sporca = function(){ window.__n++; return f(vero.apply(casa ? window : Math, arguments)); };
        if (casa) window[CASA[quale]] = sporca; else Math[quale] = sporca;
      }
      t.semina(seme);
      t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
      t.setCpuVsCpu(true);
      const leggi = new Function('return ' + IMPR);
      const impronte = [];
      let sim = 0;
      while (t.state !== 'end' && sim < secondi) { t.simulate(1); sim += 1; impronte.push(leggi()); }
      return { impronte, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi, chiamate: window.__n,
               dove: quale ? window.__dove[quale] : '' };
    }`;
    const corri = (quale, forza, seme) =>
      gs.pag.evaluate(([g, a]) => new Function('return ' + g)()(...a),
        [GIOCA, [seme, TAGLIA, SECONDI, IMPRONTA, quale, forza]]);

    const riga = {};
    const pulite = [];
    for (let s = 0; s < NSEMI; s++) pulite.push(await corri(null, null, (SEME0 + s) >>> 0));
    /* IL BANCO SI CONTROLLA DA SE': la stessa corsa pulita due volte deve
       dare la stessa impronta, o tutto il resto e' rumore. */
    const bis = await corri(null, null, SEME0);
    const ripet = primoScarto(pulite[0].impronte, bis.impronte) < 0;
    di(ripet, 'due corse pulite di fila danno la stessa partita', ripet ? pulite[0].impronte.length + ' campioni' : 'divergono');
    if (!ripet) throw Object.assign(new Error('il banco non e\' ripetibile'), { banco: true, gia: true });

    const dovePer = {};
    for (const nome of NOMI) {
      const r = { ulp: [], grosso: [], chiamate: 0 };
      for (const forza of ['ulp', 'grosso']) {
        for (let s = 0; s < NSEMI; s++) {
          const seme = (SEME0 + s) >>> 0;
          const d = await corri(nome, forza, seme);
          r.chiamate = Math.max(r.chiamate, d.chiamate);
          dovePer[nome] = d.dove;
          const k = primoScarto(pulite[s].impronte, d.impronte);
          r[forza].push(k);
        }
      }
      riga[nome] = r;
      const nUlp = r.ulp.filter(k => k >= 0).length;
      const nGro = r.grosso.filter(k => k >= 0).length;
      const stato = r.chiamate === 0 ? 'MAI CHIAMATA' : (nGro ? 'DENTRO' : 'FUORI');
      const primo = r.ulp.filter(k => k >= 0).sort((a, b) => a - b)[0];
      console.log('   ' + (dovePer[nome] === 'casa' ? 'M' + nome : 'Math.' + nome).padEnd(11) + stato.padEnd(13) +
                  ' 1 ulp: ' + nUlp + '/' + NSEMI + ' semi cambiano' +
                  (primo !== undefined ? ' (il primo al secondo ' + primo + ')' : '') +
                  '  ·  1e-9: ' + nGro + '/' + NSEMI +
                  '  ·  ' + r.chiamate + ' chiamate');
    }
    /* IL CONTO SI SCRIVE, E NON E' UN DI PIU'. Il numero di chiamate per
       passo di ogni funzione e' gia' misurato qui sopra (e' il testimone
       che separa «non e' cambiato niente» da «non l'ha chiamata
       nessuno»), e serve a un altro strumento: `_t-143-costo.js` lo
       moltiplica per il costo misurato della singola chiamata e PREVEDE
       il costo del passo. Due strade indipendenti per lo stesso numero
       valgono piu' di una sola, e l'unico modo perche' siano davvero due
       e' che nessuna delle due ricopi a mano il conto dell'altra. */
    try {
      const passi = Math.round(SECONDI * 60);
      const fuori = {};
      for (const nome of NOMI) fuori[nome] = +(riga[nome].chiamate / passi).toFixed(4);
      fuori.__quando = new Date().toISOString().slice(0, 10);
      fuori.__gioco = path.relative(RADICE, GIOCO).replace(/\\/g, '/');
      fuori.__passi = passi;
      fs.mkdirSync(path.join(RADICE, 'fuori'), { recursive: true });
      fs.writeFileSync(path.join(RADICE, 'fuori', '143-chiamate.json'), JSON.stringify(fuori, null, 1));
      console.log('   (conto per passo scritto in fuori/143-chiamate.json, per _t-143-costo.js)');
    } catch (e) { console.log('   (conto per passo non scritto: ' + e.message + ')'); }
    console.log('');
    console.log('   «MAI CHIAMATA» NON VUOL DIRE «FUORI»: vuol dire che in questa partita nessuno');
    console.log('   l\'ha chiamata, quindi non e\' stata misurata. Senza il conto delle chiamate,');
    console.log('   «l\'impronta non e\' cambiata» e «non l\'ha chiamata nessuno» sarebbero lo stesso');
    console.log('   referto — e il secondo assolverebbe una funzione senza averla mai guardata.');
    console.log('');

    const dentroF = NOMI.filter(n => riga[n].chiamate > 0 && riga[n].grosso.some(k => k >= 0));
    const fuoriF = NOMI.filter(n => riga[n].chiamate > 0 && !riga[n].grosso.some(k => k >= 0));
    const maiF = NOMI.filter(n => riga[n].chiamate === 0);

    const errori = [].concat(gs.errori, ps.errori);
    await gs.ctx.close();
    await browser.close(); browser = null;
    srv.chiudi(); srv = null;
    if (errori.length) { console.error('ECCEZIONI DI PAGINA: ' + errori.slice(0, 3).join(' | ')); process.exit(2); }

    console.log('>>> IL PERIMETRO, MISURATO');
    console.log('    DENTRO  : ' + (dentroF.join(', ') || 'nessuna'));
    console.log('    FUORI   : ' + (fuoriF.join(', ') || 'nessuna') + '   (chiamate, ma l\'impronta non si muove nemmeno a 1e-9)');
    console.log('    NON MISURATE: ' + (maiF.join(', ') || 'nessuna'));
    console.log('    Siti dentro la simulazione: ' + dentro.size + ' su ' + siti.length +
                ' (' + Math.round(dentro.size * 100 / siti.length) + '%); solo disegno: ' + soloDisegno.length +
                '; mai accesi: ' + mai.length + '.');

    /* =====================================================================
       IL CANCELLO VERO DI QUESTO STRUMENTO, e non e' il perimetro: il
       perimetro e' una misura, e una misura non si promuove ne' si
       boccia. Quel che si puo' bocciare e' l'INCOERENZA fra la misura e
       la cura: una funzione che cambia la partita e che il gioco chiama
       ancora nativa e' un buco nel lockstep. Le sole due ammesse sono
       `pow` e `sqrt`, e non per fiducia — `_q-casa.js` prova N misura a
       ogni corsa che i tre motori le calcolino identiche, e diventa
       rossa il giorno in cui smettessero.

       COSI' QUESTO STRUMENTO RESTA UTILE ANCHE DOPO IL #143: il giorno
       in cui qualcuno aggiungesse al gioco una `Math.asin` dentro la
       fisica, questa riga la troverebbe — la misura e' sul
       COMPORTAMENTO, non su un elenco scritto a mano.
       ===================================================================== */
    /* E IL BANCO DICHIARA COSA HA SPORCATO: se il gioco porta la
       libreria e qui sotto comparisse «nativa» per una delle sette,
       vorrebbe dire che si e' sporcata una funzione che nessuno chiama
       piu'. */
    const { DIROTTATE } = require('./_toppa-143-matematica.js');
    const conLib = fs.readFileSync(GIOCO, 'utf8').indexOf('LA MATEMATICA IN CASA (voce #143)') >= 0;
    const cieche = conLib ? NOMI.filter(n => DIROTTATE[n] && dovePer[n] !== 'casa') : [];
    di(cieche.length === 0, 'la sostituzione sporca ha toccato le funzioni che il gioco chiama davvero',
       conLib ? (cieche.length ? 'CIECA su: ' + cieche.join(', ') : 'le sette sporcate in casa')
              : 'il gioco non ha la libreria: si sporcano le native');
    const AMMESSE = ['pow', 'sqrt'];
    const scoperte = dentroF.filter(n => !DIROTTATE[n] && !AMMESSE.includes(n));
    di(scoperte.length === 0, 'ogni trascendente DENTRO il perimetro passa da casa (o e\' misurata concorde)',
       scoperte.length ? 'SCOPERTE: ' + scoperte.join(', ') : 'in casa: ' + dentroF.filter(n => DIROTTATE[n]).join(', ') +
       (dentroF.some(n => AMMESSE.includes(n)) ? '; native concordi: ' + dentroF.filter(n => AMMESSE.includes(n)).join(', ') : ''));
    const rossi = esiti.filter(x => !x).length;
    console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti');
    process.exit(rossi ? 1 : 0);
  } catch (e) {
    try { if (browser) await browser.close(); } catch (x) {}
    try { if (srv) srv.chiudi(); } catch (x) {}
    if (!e.gia) console.error('\nFALLITO (banco): ' + e.message + '\n' + (e.stack || ''));
    process.exit(2);
  }
})();
