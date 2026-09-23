/* =====================================================================
   _t-143-motorev.js — I NASTRI VECCHI SUL MOTORE CURATO
   (voce #143, compito 4)

   LA DOMANDA, ED E' LA REGOLA DI CASA: `MOTORE_V` si incrementa quando
   una cura cambia l'esito di SEQUENZE DI COMANDI IDENTICHE. Non si
   decide per argomento — «avra' cambiato tutto, sara' il caso di
   alzarlo» — si MISURA: si registrano N nastri sul gioco di prima, si
   rigiocano sul gioco curato, e si conta quanti finiscono diversi.

   PERCHE' CONTA. Un nastro e' {seme, comandi}: il difensore di una
   sfida lo guarda, il verificatore differito lo rigioca per decidere se
   qualcuno ha imbrogliato. Se il motore cambia i numeri e il nastro non
   porta un numero di versione nuovo, quel nastro viene RIGIOCATO STORTO
   e il verdetto e' NON TORNA — cioe' un'accusa a un onesto, l'identico
   critico che il #142 ha appena curato per un'altra causa. Con
   `MOTORE_V` a 3 il nastro vecchio viene invece RIFIUTATO con causa
   vera (`motore-diverso`, verdetto ALTRO MOTORE, nessun accusato): la
   guardia esiste gia' in `vagliaNastro`, e questa e' la misura che le
   dice di scattare.

   LE TRE PROVE:
     R) LA RIPETIBILITA'  lo stesso nastro rigiocato sullo STESSO gioco
                          da' la stessa partita. Se no, tutto il resto e'
                          rumore e non si accusa nessuno (si esce 2).
     D) LA DIVERGENZA     gli stessi nastri sul gioco CURATO: quanti
                          finiscono diversi. E' il numero che decide.
     V) LA VERSIONE       se anche un solo nastro diverge, MOTORE_V DEVE
                          essere salito. Questa prova lo verifica sul
                          file, invece di fidarsi del verbale.

   NON E' UN CANCELLO DELLA BATTERIA, ed e' una scelta. La domanda che
   fa — «il gioco di PRIMA e quello di DOPO rigiocano lo stesso nastro
   allo stesso modo?» — ha senso una volta sola, quando si sa cosa sono
   «prima» e «dopo». In batteria dovrebbe confrontarsi con l'ultimo
   commit, e dentro un cantiere a sei compiti sarebbe rossa a ogni
   compito intermedio per costruzione: un rosso che non si puo' curare
   e' rumore, e il rumore fa ignorare i rossi veri. E' un attrezzo di
   compito, come _t-132-motorev.js che ha deciso il numero le altre
   volte, e il risultato sta nel verbale.

   uso:  node strumenti/_t-143-motorev.js --prima fuori/143-prima.html
         node strumenti/_t-143-motorev.js --nastri 6 --passi 2400
         node strumenti/_t-143-motorev.js --prima fuori/x.html --dopo CALCETTO-il-gioco.html
   esce 0 se la misura e' coerente con MOTORE_V, 1 se no, 2 se il banco
   e' esploso, 3 se non c'e' stato niente da misurare.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const playwright = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const NNASTRI = Math.max(1, parseInt(arg('nastri', '6'), 10) || 6);
const PASSI = Math.max(300, parseInt(arg('passi', '3000'), 10) || 3000);
const SEME0 = parseInt(arg('seme', '20260923'), 10) >>> 0;
/* PRIMA e' il gioco che ha scritto i nastri, DOPO quello che li rigioca.
   Di regola: prima = il gioco dell'ultimo commit di `main`, dopo = il
   gioco di oggi. */
const PRIMA = arg('prima', '');
const DOPO = arg('dopo', process.env.GIOCO_PROVA || 'CALCETTO-il-gioco.html');

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

const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

/* IL COPIONE DELLE DITA. Non deve essere bello, deve essere FISSO: le
   due esecuzioni devono ricevere gli stessi comandi, quindi qui dentro
   non c'e' nessun sorteggio. E non usa nemmeno Math.sin per muovere la
   levetta, perche' in questo cantiere Math.sin e' proprio la cosa che
   cambia: un copione che la chiamasse produrrebbe comandi DIVERSI sui
   due giochi, e il banco misurerebbe se stesso invece del gioco. Il
   giro della levetta e' fatto con una tabella di interi. */
const COPIONE = `
(function(passi, IMPR, campionaOgni){
  const t = window.__test;
  const impronte = [];
  const leggi = new Function('return ' + IMPR);
  const dischi = t.pulsanti(0);
  const grande = dischi[0] || {x:800,y:330,r:44};
  const piccolo = dischi[1] || {x:720,y:250,r:34};
  const LX = 180, LY = 300;
  /* dodici direzioni su un dodecagono di interi: nessuna trascendente */
  const DIRX = [40,35,20,0,-20,-35,-40,-35,-20,0,20,35];
  const DIRY = [0,20,35,40,35,20,0,-20,-35,-40,-35,-20];
  let idL = 1, idB = 2, giu = false, giuB = false;
  for(let f = 0; f < passi; f++){
    const k = f % 12, r = 1 + ((f / 12) | 0) % 2;
    const x = LX + DIRX[k] * r * 0.7, y = LY + DIRY[k] * r * 0.7;
    if(!giu){ Touch5.start(idL, LX, LY); giu = true; }
    else Touch5.move(idL, x, y);
    if(f % 97 === 96){ Touch5.chiudi(idL, false); giu = false; idL += 2; }
    if(f % 53 === 10){ Touch5.start(idB, grande.x, grande.y); giuB = true; }
    if(f % 53 === 28 && giuB){ Touch5.chiudi(idB, false); giuB = false; idB += 2; }
    if(f % 131 === 40){ Touch5.start(idB + 1, piccolo.x, piccolo.y); }
    if(f % 131 === 49){ Touch5.chiudi(idB + 1, false); idB += 2; }
    t.simulate(1/60);
    if(f % campionaOgni === 0) impronte.push(leggi());
  }
  if(giu) Touch5.chiudi(idL, false);
  if(giuB) Touch5.chiudi(idB, false);
  return impronte;
})`;

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
    let prima = PRIMA;
    if (!prima) {
      /* il gioco dell'ultimo commit, estratto in fuori/ */
      const { execFileSync } = require('child_process');
      const out = path.join(RADICE, 'fuori', 'motorev-prima.html');
      fs.mkdirSync(path.dirname(out), { recursive: true });
      const testo = execFileSync('git', ['show', 'HEAD:CALCETTO-il-gioco.html'], { cwd: RADICE, maxBuffer: 256 * 1024 * 1024 });
      fs.writeFileSync(out, testo);
      prima = 'fuori/motorev-prima.html';
    }
    srv = await servi();
    browser = await playwright.chromium.launch();
    console.log('=== I NASTRI VECCHI SUL MOTORE CURATO — ' + NNASTRI + ' nastri da ' + PASSI + ' passi ===');
    console.log('    prima: ' + prima + '   ·   dopo: ' + DOPO + '\n');

    const A = await apri(browser, srv.porta, prima);
    const B = await apri(browser, srv.porta, DOPO);

    /* MOTORE_V SI LEGGE SUL FILE, non dalla pagina: `registroMotoreV`
       e' la versione scritta nel NASTRO caricato (zero quando non ce
       n'e' nessuno), non la costante del gioco. Sono due numeri
       diversi con lo stesso nome, e confonderli farebbe dire al banco
       «0 -> 0» qualunque cosa succeda: un attestato. */
    const leggiMV = rel => {
      const t = fs.readFileSync(path.join(RADICE, rel), 'utf8');
      const m = t.match(/const MOTORE_V = (\d+);/);
      if (!m) throw Object.assign(new Error('MOTORE_V non trovato in ' + rel), { banco: true });
      return parseInt(m[1], 10);
    };
    const mvA = leggiMV(prima), mvB = leggiMV(DOPO);

    const registra = (pag, seme) => pag.evaluate(([seme, passi, IMPR, COP]) => {
      const t = window.__test;
      t.semina(seme);
      t.registra();
      t.startMatch(1, 1, undefined);
      const impronte = (new Function('return (' + COP + ')'))()(passi, IMPR, 20);
      const nastro = t.nastro();
      t.fermaRegistro();
      return { impronte, nastro, righe: t.registroRighe, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi };
    }, [seme, PASSI, IMPRONTA, COPIONE]);

    const rigioca = (pag, nastro, seme) => pag.evaluate(([nastro, seme, passi, IMPR]) => {
      const t = window.__test;
      t.rigioca(nastro);
      t.semina(seme);
      t.startMatch(1, 1, undefined);
      const leggi = new Function('return ' + IMPR);
      const impronte = [];
      for (let f = 0; f < passi; f++) { t.simulate(1 / 60); if (f % 20 === 0) impronte.push(leggi()); }
      return { impronte, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi };
    }, [nastro, seme, PASSI, IMPRONTA]);

    const nastri = [];
    for (let i = 0; i < NNASTRI; i++) {
      const seme = (SEME0 + i) >>> 0;
      const r = await registra(A.pag, seme);
      nastri.push({ seme, ...r });
    }
    if (!nastri.some(n => n.righe > 50)) { console.error('PROVA NULLA: nessun nastro ha registrato comandi'); process.exit(3); }
    console.log('   registrati: ' + nastri.map(n => n.righe + ' comandi (' + n.gol.join('-') + ')').join(' · ') + '\n');

    /* ---- R: la ripetibilita' ---- */
    console.log('R) LA RIPETIBILITA\' — lo stesso nastro sullo STESSO gioco da\' la stessa partita');
    let rumore = 0;
    for (const n of nastri) {
      const d = await rigioca(A.pag, n.nastro, n.seme);
      const k = primoScarto(n.impronte, d.impronte);
      if (k >= 0) rumore++;
      di(k < 0, 'nastro del seme ' + n.seme + ': si rigioca uguale su ' + prima,
         k < 0 ? n.impronte.length + ' campioni, ' + d.gol.join('-') : 'diverge al campione ' + k);
    }
    console.log('');
    if (rumore) {
      console.log('NON SI PUO\' MISURARE NIENTE: i nastri non si rigiocano uguali nemmeno sul gioco');
      console.log('che li ha scritti. Un confronto fra due versioni misurerebbe il rumore.');
      throw Object.assign(new Error('nastri non ripetibili sul gioco di partenza'), { banco: true, gia: true });
    }

    /* ---- D: la divergenza ---- */
    console.log('D) LA DIVERGENZA — gli stessi nastri sul gioco curato');
    let diversi = 0; const dett = [];
    for (const n of nastri) {
      const d = await rigioca(B.pag, n.nastro, n.seme);
      const k = primoScarto(n.impronte, d.impronte);
      if (k >= 0) { diversi++; dett.push('seme ' + n.seme + ' al campione ' + k); }
      console.log('   ' + (k < 0 ? 'UGUALE  ' : 'DIVERSO ') + 'seme ' + n.seme + ': ' +
                  (k < 0 ? n.impronte.length + ' campioni identici, ' + d.gol.join('-')
                         : 'diverge al campione ' + k + ', ' + n.gol.join('-') + ' contro ' + d.gol.join('-') +
                           ', sorteggi ' + n.sorteggi + ' contro ' + d.sorteggi));
    }
    console.log('   ' + diversi + ' nastri su ' + nastri.length + ' finiscono in una partita diversa.\n');

    /* ---- V: la versione ---- */
    console.log('V) LA VERSIONE — MOTORE_V deve essere salito se anche un solo nastro diverge');
    console.log('   MOTORE_V: ' + mvA + ' su ' + prima + ', ' + mvB + ' su ' + DOPO);
    if (diversi > 0) {
      di(mvB > mvA, 'MOTORE_V e\' salito, com\'e\' dovuto con ' + diversi + ' nastri su ' + nastri.length + ' diversi',
         mvA + ' -> ' + mvB);
    } else {
      di(mvB === mvA, 'MOTORE_V e\' rimasto fermo, com\'e\' dovuto con zero nastri diversi', mvA + ' -> ' + mvB);
    }

    const errori = [].concat(A.errori, B.errori);
    await browser.close(); browser = null;
    srv.chiudi(); srv = null;
    if (errori.length) { console.error('ECCEZIONI DI PAGINA: ' + errori.slice(0, 3).join(' | ')); process.exit(2); }

    const rossi = esiti.filter(x => !x).length;
    console.log('\n' + esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti\n');
    if (rossi) {
      console.log('>>> LA MISURA E LA VERSIONE NON SI ACCORDANO: ' + diversi + ' nastri su ' + nastri.length +
                  ' cambiano esito e MOTORE_V dice ' + mvA + ' -> ' + mvB + '.');
      console.log('    Un nastro vecchio rigiocato su un motore che non lo dichiara diventa un NON TORNA,');
      console.log('    cioe\' un\'accusa a un onesto. ' + (dett.slice(0, 3).join(' · ')));
      process.exit(1);
    }
    console.log('>>> COERENTE: ' + diversi + ' nastri su ' + nastri.length + ' cambiano esito, MOTORE_V ' + mvA + ' -> ' + mvB + '.');
    process.exit(0);
  } catch (e) {
    try { if (browser) await browser.close(); } catch (x) {}
    try { if (srv) srv.chiudi(); } catch (x) {}
    if (!e.gia) console.error('\nFALLITO (banco): ' + e.message + '\n' + (e.stack || ''));
    process.exit(2);
  }
})();
