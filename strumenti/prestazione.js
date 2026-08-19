/* =====================================================================
   PRESTAZIONE — il cancello che impedisce di fare un gioco bello che scatta.

   Stiamo per aggiungere cicli di corsa, deformazioni, particelle, fermi
   d'impatto: ogni cosa costa millisecondi. "Deve restare fluido su un
   telefono di fascia media" e' una speranza finche' nessuno la misura.
   Qui il computer viene rallentato apposta, si gioca una partita vera e
   si contano i millisecondi per fotogramma. Sopra la soglia, il lavoro
   non passa.

   ATTENZIONE, e' costato un errore evitato per un pelo: qui il browser
   disegna SENZA SCHEDA GRAFICA, in software. Senza alcun freno il banco
   segna gia' 26 ms per fotogramma, cioe' 39 al secondo. Un cancello in
   millisecondi assoluti misurerebbe la lentezza del banco, non il costo
   del gioco, e manderebbe chi lavora a rincorrere un fantasma.
   Per questo il cancello e' RELATIVO: si misura una volta il costo di
   oggi (--fissa), lo si conserva, e da li' in avanti si controlla che il
   lavoro nuovo non lo faccia crescere oltre una percentuale. Il confronto
   fra due misure sullo stesso banco e' onesto anche se il banco e' lento.

   SECONDA AVVERTENZA, segnalata da un critico e vera: senza --freno la
   CPU NON viene rallentata affatto, e a sessanta fotogrammi al secondo il
   numero che si legge e' il tetto del vsync, non il costo del gioco. Il
   confronto relativo resta onesto — stesso tetto prima e dopo — ma per
   vedere il costo VERO, e quanto margine c'e', va tirato il freno:
   --freno 2 o 4. Li' il tetto sparisce e si misura il lavoro.

   TERZA AVVERTENZA, pagata con un cancello rosso che accusava un innocente:
   UNA sola finestra di misura non distingue il gioco lento dal BANCO
   occupato. Un altro processo che ruba la CPU per qualche secondo fa
   saltare la mediana di un gradino intero di vsync (16,7 -> 33,3 ms, +99%)
   e il cancello incolpa il gioco di un costo che non ha: e' successo,
   stesso file al bit, rosso sotto carico e verde a banco libero. Per
   questo si misurano TRE finestre e per ogni voce si tiene la MEDIANA
   delle tre. Un rallentamento vero del gioco le alza tutte e tre — il
   cancello sa ancora fallire — mentre un colpo di carico del banco ne
   sporca una sola, e quella viene scartata.

   QUARTA AVVERTENZA, e annulla meta' della prima: UN RIFERIMENTO
   CONSERVATO E' LA FOTOGRAFIA DI UN BANCO CHE NON ESISTE PIU'.
   Il numero in prestazione-base.json (16,7 ms di mediana) fu preso a
   banco libero. Se domani il banco e' occupato — un server di sviluppo
   acceso che tiene la CPU all'80% — lo stesso identico file segna 33,4:
   +100%, la firma esatta della terza avvertenza. E la mediana di tre
   finestre NON salva, perche' quel carico non e' un colpo isolato, e'
   continuo: sporca tutte e tre allo stesso modo. Il confronto col
   riferimento e' falso in entrambi i versi — oggi accusa l'innocente,
   domani assolverebbe il colpevole se il banco fosse piu' libero del
   giorno in cui la fotografia fu scattata.
   La cura non e' aspettare un banco libero che non arrivera': e' la
   MISURA APPAIATA. Si misurano DUE file — quello di oggi e quello di
   ieri — alternati, sullo stesso banco, nello stesso minuto. Il rumore
   colpisce entrambi allo stesso modo e la DIFFERENZA resta onesta.
     node strumenti/prestazione.js --contro HEAD
   Il modo assoluto resta, ma ora prima di giudicare misura quanto il
   banco balla (la dispersione fra le sue stesse finestre, piu' il carico
   della macchina) e se quel rumore e' paragonabile alla tolleranza SI
   DICHIARA CIECO e si astiene invece di emettere un verdetto falso.
   Un cancello che non sa di essere cieco e' la cosa peggiore che c'e'.

   QUINTA AVVERTENZA, trovata dalla prova (a) e non nascosta: la MEDIANA
   NUDA DEI TEMPI E' UNA SCALINATA. I fotogrammi sono agganciati al vsync,
   quindi valgono 16,7 / 33,3 / 66,7 / 83,3 ms e quasi nient'altro. Se la
   meta' dei fotogrammi cade proprio su un gradino, la mediana e' un testa
   o croce fra 66,7 e 83,3: un salto del 25% senza che il gioco sia
   cambiato di un bit. E' successo: lo stesso file contro se' stesso ha
   dato media +4,3% e p95 +0,1% — onesti — e mediana +24,9%, cioe' un
   gradino intero di niente.
   La cura non e' alzare la soglia finche' passa (sarebbe barare): e'
   smettere di usare una statistica a scalini. Al posto della mediana
   nuda si usa la MEDIA DEL QUINTO CENTRALE — la media dei fotogrammi che
   stanno fra il 40% e il 60% della classifica. Misura la stessa cosa (il
   fotogramma tipico, al riparo dai picchi) ma si muove con continuita':
   se il 48% dei fotogrammi sta sotto il gradino e il 52% sopra, il numero
   sta in mezzo invece di scattare. Sotto questa voce nel referto c'e'
   scritto "quinto centrale" apposta, perche' non e' piu' la mediana.

   SESTA AVVERTENZA, e anche questa l'ha trovata la prova (a): ALTERNARE
   NON BASTA, BISOGNA APPAIARE DAVVERO. La prima stesura misurava A tre
   volte e B tre volte, alternandoli, e poi confrontava le due mediane.
   Sembra appaiato e non lo e': fra la misura di A e quella di B passa un
   minuto in cui il banco cambia, e chi tocca il secondo turno paga la
   deriva. Lo stesso file contro se' stesso ha dato +12,5% cosi', cioe'
   piu' del segnale che dobbiamo vedere. Adesso ogni giro e' un PANINO
   A-B-B-A (e il giro dopo B-A-A-B): dentro un solo giro ciascuno dei due
   corre una volta presto e una volta tardi, quindi una deriva lineare si
   cancella; la differenza si calcola DENTRO il giro, e solo alla fine si
   prende la mediana delle differenze. Il referto stampa anche da quanto
   a quanto sono andati i giri: se quell'intervallo scavalca lo zero, la
   differenza non e' provata, e' solo il numero piu' probabile.

   uso:  node strumenti/prestazione.js --fissa      misura e conserva il riferimento
         node strumenti/prestazione.js              modo assoluto (riferimento su disco)
         node strumenti/prestazione.js --freno 4    il costo vero, senza tetto
         node strumenti/prestazione.js --tolleranza 30
         node strumenti/prestazione.js --taglia 11  la partita 11 contro 11
                                                    (confrontata con lo STESSO
                                                    riferimento della base:
                                                    il mondo grande deve stare
                                                    dentro la stessa tolleranza)

         node strumenti/prestazione.js --contro HEAD
                 MISURA APPAIATA: estrae il gioco dall'ultimo commit
                 (git show HEAD:CALCETTO-il-gioco.html) e lo misura
                 alternato a quello di oggi. Accetta qualunque revisione
                 git (HEAD~3, un sha, ramo) oppure un percorso:
         node strumenti/prestazione.js --contro _base-onda5.html
         node strumenti/prestazione.js --contro HEAD --oggi altro.html

         node strumenti/prestazione.js --prova-uguale
                 lo stesso file contro se' stesso: deve dare ~0%.
                 Se no, l'attrezzo e' inaffidabile SU QUESTO BANCO e va
                 dichiarato tale, non aggiustato di nascosto.
         node strumenti/prestazione.js --prova-zavorra 8
                 lo stesso file contro se' stesso piu' una zavorra
                 dichiarata di 8 ms per fotogramma: deve VEDERLA.

         opzioni comuni: --freno 4  --sec 8  --giri 5  --taglia 5
                         --tolleranza 25

   uscita:  0 passato   1 fallito   2 il cancello si dichiara cieco

   PROVE FATTE, con la data perche' un numero senza data non vale niente
   (17 agosto 2026, banco con un server di sviluppo acceso, CPU 86-100%):
     prova (a) stesso file contro se' stesso ....... 2,5% di scarto
     prova (b) stesso file + zavorra di 8 ms ....... +45,6% (vista)
     banco: le repliche dello stesso file ballano del 31-53% da un giro
            all'altro, e l'appaiamento le riduce a 2,5%. E' tutto qui il
            motivo per cui questo modo esiste.
   Ripetere le due prove quando il banco cambia: sono l'unica ragione per
   credere ai numeri di sotto.
   Prima misura vera con questo strumento (17 agosto 2026, --contro HEAD,
   7 giri): media -1,0%, tipico -0,8%, p95 0,0%. Il lavoro non committato
   di quel giorno non costava niente di misurabile. Lo stesso confronto,
   fatto con la vecchia aggregazione non appaiata, diceva +11%: era il
   difetto dello strumento, non il costo del gioco.
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const GIOCO = 'CALCETTO-il-gioco.html';
const RIFERIMENTO = path.join(__dirname, 'prestazione-base.json');

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const ha = n => process.argv.includes('--' + n);

/* ---------------------------------------------------------------- banco */

function istantaneaCpu() {
  let occupato = 0, totale = 0;
  for (const c of os.cpus()) {
    for (const k in c.times) { totale += c.times[k]; if (k !== 'idle') occupato += c.times[k]; }
  }
  return { occupato, totale };
}
/* quanto e' occupata la macchina, adesso, in per cento: non serve a
   giudicare il gioco, serve a sapere se possiamo fidarci del giudizio */
async function caricoBanco(ms = 700) {
  const a = istantaneaCpu();
  await new Promise(r => setTimeout(r, ms));
  const b = istantaneaCpu();
  const dt = b.totale - a.totale;
  return dt > 0 ? (b.occupato - a.occupato) / dt * 100 : NaN;
}

function servi(dir) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(dir) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* La zavorra: un lavoro dichiarato dentro il giro di disegno. Non tocca
   la logica, brucia solo tempo — cosi' l'attrezzo puo' provare di
   saperlo vedere. */
function conZavorra(html, ms) {
  const iniezione = `<script>(function(){
    var R = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = function(f){ return R(function(t){
      var fine = performance.now() + ${ms}; var x = 0;
      while (performance.now() < fine) x += Math.sqrt(x + 1);
      window.__zavorra = x; return f(t);
    }); };
  })();</script>`;
  return html.replace('</body>', iniezione + '</body>');
}

/* ------------------------------------------------------------- la misura */

/* una finestra di misura: apre il file, avvia la partita a semi fissi,
   tira il freno DOPO l'avvio (interessa il costo a regime, non il
   caricamento) e conta i millisecondi fra un fotogramma e l'altro */
async function misuraFinestra(browser, porta, nome, o) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pag);
  await pag.goto(`http://127.0.0.1:${porta}/${nome}`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
  await pag.waitForTimeout(600);
  await pag.evaluate((tg) => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    /* la firma a due argomenti resta quella di sempre: la taglia entra
       solo come opzione esplicita, cosi' il riferimento base non si muove */
    if (tg === 5) t.startMatch(1, 1); else t.startMatch(1, 1, { size: tg });
    t.setCpuVsCpu(true);
  }, o.taglia);
  if (o.taglia !== 5) {
    const tgVera = await pag.evaluate(() => window.__test.taglia);
    if (tgVera !== o.taglia) { console.error(`taglia richiesta ${o.taglia}, il gioco risponde ${tgVera}`); process.exit(1); }
  }
  await pag.waitForTimeout(1200);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: o.freno });
  const tempi = await pag.evaluate(async (secondi) => {
    const t = []; let ultimo = performance.now();
    return await new Promise(fine => {
      const inizio = ultimo;
      function giro(ora) {
        t.push(ora - ultimo); ultimo = ora;
        if (ora - inizio < secondi * 1000) requestAnimationFrame(giro);
        else fine(t.slice(3));            // i primi giri sono sporchi
      }
      requestAnimationFrame(giro);
    });
  }, o.sec);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await ctx.close();
  if (!tempi.length) throw new Error('nessun fotogramma misurato su ' + nome);
  const ord = [...tempi].sort((a, b) => a - b);
  const perc = q => ord[Math.min(ord.length - 1, Math.floor(ord.length * q))];
  /* QUINTA AVVERTENZA: non la mediana nuda (una scalinata da 16,7 ms) ma
     la media dei fotogrammi fra il 40% e il 60% della classifica */
  const da = Math.floor(ord.length * 0.4), a = Math.max(da + 1, Math.ceil(ord.length * 0.6));
  const mezzo = ord.slice(da, a);
  return {
    n: tempi.length,
    media: tempi.reduce((x, y) => x + y, 0) / tempi.length,
    meta: mezzo.reduce((x, y) => x + y, 0) / mezzo.length,
    p95: perc(0.95),
    max: ord[ord.length - 1],
    lenti: tempi.filter(x => x > 33.3).length,   // due fotogrammi persi
  };
}

const VOCI = [['media', 'fotogramma medio'], ['meta', "tipico (quinto centrale)"], ['p95', 'il 95 per cento sotto']];
const centrale = a => [...a].sort((x, y) => x - y)[(a.length - 1) >> 1];
/* di quanto ballano fra loro misure dello STESSO file: e' il pavimento
   di rumore del banco, sotto quel numero nessuna differenza significa
   niente */
const dispersione = a => (Math.max(...a) - Math.min(...a)) / Math.min(...a) * 100;

/* ------------------------------------------------- il modo APPAIATO (4a) */

async function appaiata(o) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prestazione-'));
  fs.writeFileSync(path.join(dir, 'A.html'), o.testoA);
  fs.writeFileSync(path.join(dir, 'B.html'), o.testoB);

  console.log(`\nMISURA APPAIATA — freno ${o.freno}x, ${o.giri} giri da ${o.sec} s per file, partita ${o.taglia} contro ${o.taglia}`);
  console.log(`  A (riferimento) = ${o.etichettaA}`);
  console.log(`  B (in esame)    = ${o.etichettaB}`);
  console.log(`  carico della macchina prima di cominciare: ${(await caricoBanco()).toFixed(0)}%`);
  console.log(`  ogni giro e' un panino A-B-B-A (il prossimo B-A-A-B): dentro il giro ciascuno`);
  console.log(`  dei due sta una volta presto e una volta tardi, cosi' una deriva del banco si`);
  console.log(`  annulla invece di scaricarsi sul secondo. La differenza si calcola DENTRO il`);
  console.log(`  giro, poi si tiene la mediana dei giri.\n`);

  const srv = await servi(dir);
  const browser = await chromium.launch();
  const perGiro = [];
  try {
    for (let g = 0; g < o.giri; g++) {
      const panino = g % 2 === 0 ? ['A', 'B', 'B', 'A'] : ['B', 'A', 'A', 'B'];
      const dentro = { A: [], B: [] };
      for (const q of panino) {
        const m = await misuraFinestra(browser, srv.porta, q + '.html', o);
        dentro[q].push(m);
        console.log(`  giro ${g + 1} ${q}: ${String(m.n).padStart(3)} fotogrammi — media ${m.media.toFixed(1)} ms, tipico ${m.meta.toFixed(1)}, p95 ${m.p95.toFixed(1)}`);
      }
      const med = (l, k) => l.reduce((s, x) => s + x[k], 0) / l.length;
      const giro = { a: {}, b: {}, d: {} };
      for (const [k] of VOCI) {
        giro.a[k] = med(dentro.A, k);
        giro.b[k] = med(dentro.B, k);
        giro.d[k] = (giro.b[k] - giro.a[k]) / giro.a[k] * 100;
      }
      perGiro.push(giro);
      console.log(`    -> dentro il giro ${g + 1}: media ${giro.d.media >= 0 ? '+' : ''}${giro.d.media.toFixed(1)}%, tipico ${giro.d.meta >= 0 ? '+' : ''}${giro.d.meta.toFixed(1)}%, p95 ${giro.d.p95 >= 0 ? '+' : ''}${giro.d.p95.toFixed(1)}%`);
    }
  } finally {
    await browser.close(); srv.chiudi();
    fs.rmSync(dir, { recursive: true, force: true });
  }

  const righe = VOCI.map(([k, nome]) => {
    const ds = perGiro.map(x => x.d[k]);
    const d = centrale(ds);                  // la differenza APPAIATA, giro per giro
    /* i millisecondi mostrati sono quelli del giro che ha dato la
       differenza mediana: cosi' la percentuale e i due numeri accanto
       raccontano lo stesso giro invece di tre giri mescolati */
    const q = perGiro[ds.indexOf(d)];
    return { k, nome, a: q.a[k], b: q.b[k], d, min: Math.min(...ds), max: Math.max(...ds) };
  });
  /* il pavimento: quanto ballano le repliche dello stesso file da un giro
     all'altro. Non e' l'errore della misura appaiata — e' esattamente il
     rumore che l'appaiamento serve ad annullare — ma dice quanto e'
     mosso il banco su cui stiamo lavorando. */
  const rumore = Math.max(...VOCI.map(([k]) => Math.max(dispersione(perGiro.map(x => x.a[k])), dispersione(perGiro.map(x => x.b[k])))));
  const peggiore = Math.max(...righe.map(r => r.d));
  const scarto = Math.max(...righe.map(r => Math.abs(r.d)));   // per la prova di onesta': conta anche in negativo

  console.log(`\n  mediana dei ${o.giri} giri (i ms sono quelli del giro mediano)`);
  for (const r of righe) {
    console.log(`  ${r.nome.padEnd(24)} A ${r.a.toFixed(1)} ms   B ${r.b.toFixed(1)} ms   differenza ${r.d >= 0 ? '+' : ''}${r.d.toFixed(1)}%   (giri: da ${r.min >= 0 ? '+' : ''}${r.min.toFixed(1)}% a ${r.max >= 0 ? '+' : ''}${r.max.toFixed(1)}%)`);
  }
  console.log(`\n  ballo fra repliche dello stesso file, da un giro all'altro: ${rumore.toFixed(1)}%`);
  console.log(`  (e' il rumore del banco: e' proprio quello che l'appaiamento annulla,`);
  console.log(`   perche' colpisce A e B nello stesso minuto e sparisce nella differenza)`);
  return { righe, peggiore, scarto, rumore };
}

/* ------------------------------------------------------- estrarre i file */

function testoDi(spec, quale) {
  if (spec === 'HEAD' || !/[\\/]/.test(spec) && !fs.existsSync(path.resolve(RADICE, spec))) {
    // nessun file con questo nome: e' una revisione git
    const pieno = spec.includes(':') ? spec : `${spec}:${GIOCO}`;
    let t;
    try {
      t = execFileSync('git', ['show', pieno], { cwd: RADICE, encoding: 'utf8', maxBuffer: 1 << 29 });
    } catch (e) {
      console.error(`non riesco a estrarre ${quale} da git: git show ${pieno}`);
      process.exit(1);
    }
    return { testo: t, etichetta: `git show ${pieno}` };
  }
  const f = path.resolve(RADICE, spec);
  if (!fs.existsSync(f)) { console.error(`${quale} non esiste: ${f}`); process.exit(1); }
  return { testo: fs.readFileSync(f, 'utf8'), etichetta: path.relative(RADICE, f).replace(/\\/g, '/') };
}

/* ================================================================= corpo */

(async () => {
  const fissa = ha('fissa');
  const contro = arg('contro', null);
  const provaUguale = ha('prova-uguale');
  const provaZavorra = ha('prova-zavorra');
  const msZavorra = +arg('prova-zavorra', 8);
  const appaiato = !!contro || provaUguale || provaZavorra;

  const tolleranza = +arg('tolleranza', 25);   // per cento di crescita ammessa
  /* nel modo appaiato il freno si tira sempre (seconda avvertenza): senza,
     il tetto del vsync nasconde meta' della differenza. Nel modo assoluto
     resta 1 per non rendere incomparabile il riferimento gia' conservato. */
  const freno = +arg('freno', appaiato ? 4 : 1);
  const sec = +arg('sec', appaiato ? 8 : 10);
  const taglia = +arg('taglia', 5);
  /* cinque giri, non tre: con tre panini la prova (a) su questo banco
     occupato sbagliava fino al 9,5%, troppo vicino ai valori che dobbiamo
     saper leggere. Cinque costano quattro minuti e li valgono. */
  const giri = +arg('giri', 5);
  const oggi = arg('oggi', GIOCO);

  /* ---------------------------------------------- modo APPAIATO e prove */
  if (appaiato) {
    const mio = testoDi(oggi, 'il file in esame');
    let testoA, testoB, etichettaA, etichettaB;

    if (provaUguale) {
      testoA = testoB = mio.testo;
      etichettaA = mio.etichetta;
      etichettaB = "LO STESSO FILE, al bit (prova di onesta')";
    } else if (provaZavorra) {
      testoA = mio.testo;
      testoB = conZavorra(mio.testo, msZavorra);
      if (testoB === testoA) { console.error('non trovo </body>: la zavorra non si e\' innestata'); process.exit(1); }
      etichettaA = mio.etichetta;
      etichettaB = `lo stesso file + ZAVORRA dichiarata di ${msZavorra} ms per fotogramma`;
    } else {
      const base = testoDi(contro, 'il riferimento --contro');
      testoA = base.testo; etichettaA = base.etichetta;
      testoB = mio.testo; etichettaB = mio.etichetta;
      if (testoA === testoB) console.log('\n(avviso: i due file sono identici al bit — mi aspetto ~0%)');
    }

    const r = await appaiata({ testoA, testoB, etichettaA, etichettaB, giri, freno, sec, taglia });

    if (provaUguale) {
      const ok = r.scarto < 10;
      console.log('');
      console.log(ok
        ? `  PROVA (a) SUPERATA: lo stesso file contro se' stesso sbaglia al massimo di ${r.scarto.toFixed(1)}%,\n  sotto il 10%: e' la RISOLUZIONE dell'attrezzo oggi. Una differenza piu' piccola di cosi'\n  non va creduta; una piu' grande e' segnale, anche col banco che balla del ${r.rumore.toFixed(0)}%.`
        : `  PROVA (a) FALLITA: lo stesso file contro se' stesso sbaglia di ${r.scarto.toFixed(1)}%.\n  LO STRUMENTO E' INAFFIDABILE SU QUESTO BANCO. Non si aggiusta la soglia di nascosto:\n  o il banco si calma, o nessun verdetto di prestazione vale niente oggi.`);
      process.exit(ok ? 0 : 1);
    }
    if (provaZavorra) {
      const ok = r.peggiore > 20;
      console.log('');
      console.log(ok
        ? `  PROVA (b) SUPERATA: la zavorra dichiarata di ${msZavorra} ms si vede come +${r.peggiore.toFixed(1)}%.\n  L'attrezzo non e' cieco: un rallentamento vero lo fa scattare.`
        : `  PROVA (b) FALLITA: la zavorra di ${msZavorra} ms produce solo ${r.peggiore.toFixed(1)}%.\n  L'attrezzo e' CIECO, un cancello che non vede non e' un cancello.`);
      process.exit(ok ? 0 : 1);
    }

    console.log(`\n  verdetto: la DIFFERENZA fra i due file, stesso banco, stesso minuto — ammesso +${tolleranza}%\n`);
    let male = 0;
    for (const v of r.righe) {
      const ok = v.d <= tolleranza;
      if (!ok) male++;
      console.log((ok ? '  OK   ' : '  NO   ') +
        `${v.nome}: ${v.a.toFixed(1)} -> ${v.b.toFixed(1)} ms  (${v.d >= 0 ? '+' : ''}${v.d.toFixed(1)}%, ammesso +${tolleranza}%)`);
    }
    console.log(`\n${r.righe.length} confronti, ${r.righe.length - male} passati, ${male} falliti`);
    const incerte = r.righe.filter(v => v.min < 0 && v.max > 0).map(v => v.nome);
    if (incerte.length) {
      console.log(`\nnon provate (i giri scavalcano lo zero, il segno non e' sicuro): ${incerte.join(', ')}.`);
      console.log(`Per stringere: --giri ${giri * 2}, oppure --sec ${sec + 6}.`);
    }
    console.log(`\nquanto e' fine questo attrezzo oggi lo dice  node strumenti/prestazione.js --prova-uguale`);
    console.log(`(lo stesso file contro se' stesso): differenze piu' piccole di quel numero non vanno credute.`);
    if (male) { console.log('\nUn gioco che scatta non e\' un gioco da vetrina, per quanto sia bello fermo.'); process.exit(1); }
    return;
  }

  /* ------------------------------------------------------- modo ASSOLUTO */
  /* il riferimento e' UNO e sta sulla base: fissarlo su una taglia grande
     lo farebbe mentire per sempre (rischio dichiarato nel piano) */
  if (fissa && taglia !== 5) { console.error('--fissa vale solo sulla taglia base (5)'); process.exit(1); }

  const carico = await caricoBanco();
  const srv = await servi(RADICE);
  const browser = await chromium.launch();
  const FINESTRE = 3;   // terza avvertenza: la mediana di tre finestre scarta il colpo di carico
  if (taglia !== 5) console.log(`scenario: partita ${taglia} contro ${taglia}`);
  console.log(`computer rallentato di ${freno} volte, ${FINESTRE} finestre da ${sec} secondi di partita`);
  console.log(`carico della macchina: ${carico.toFixed(0)}%\n`);

  const giriM = [];
  try {
    for (let g = 0; g < FINESTRE; g++) {
      const m = await misuraFinestra(browser, srv.porta, oggi, { freno, sec, taglia });
      giriM.push(m);
      console.log(`  finestra ${g + 1}: ${String(m.n).padStart(3)} fotogrammi — media ${m.media.toFixed(1)} ms, tipico ${m.meta.toFixed(1)}, p95 ${m.p95.toFixed(1)}, peggiore ${m.max.toFixed(1)}, saltati ${m.lenti} (${(m.lenti / m.n * 100).toFixed(1)}%)`);
    }
  } finally {
    await browser.close(); srv.chiudi();
  }

  /* per ogni voce, la mediana delle finestre: con tre valori e' il centrale */
  const media = centrale(giriM.map(g => g.media));
  const meta = centrale(giriM.map(g => g.meta));
  const p95 = centrale(giriM.map(g => g.p95));

  console.log(`\n  mediana delle finestre`);
  console.log(`  media                 ${media.toFixed(1)} ms   (${(1000 / media).toFixed(0)} al secondo)`);
  console.log(`  tipico (quinto centrale) ${meta.toFixed(1)} ms`);
  console.log(`  novantacinque su cento sotto ${p95.toFixed(1)} ms`);

  const ora = { media: +media.toFixed(2), meta: +meta.toFixed(2), p95: +p95.toFixed(2), freno, quando: sec };

  if (fissa) {
    fs.writeFileSync(RIFERIMENTO, JSON.stringify(ora, null, 1));
    console.log(`\nriferimento conservato in strumenti/prestazione-base.json`);
    console.log(`d'ora in poi il costo non deve crescere piu' del ${tolleranza}% rispetto a questo.`);
    console.log(`QUARTA AVVERTENZA: questa e' la fotografia del banco di ADESSO (carico ${carico.toFixed(0)}%).`);
    console.log(`Quando il banco cambiera', varra' poco: per un giudizio onesto usare --contro HEAD.`);
    return;
  }

  if (!fs.existsSync(RIFERIMENTO)) {
    console.log('nessun riferimento: eseguire prima  node strumenti/prestazione.js --fissa');
    process.exit(1);
  }

  /* QUARTA AVVERTENZA in atto: prima di giudicare, quanto balla il banco?
     Le tre finestre sono lo STESSO file: la loro dispersione e' rumore
     puro. Se e' paragonabile alla tolleranza, il confronto con una
     fotografia vecchia non distingue piu' il gioco dal banco. */
  const rumore = Math.max(dispersione(giriM.map(g => g.media)), dispersione(giriM.map(g => g.meta)), dispersione(giriM.map(g => g.p95)));
  console.log(`  ballo fra le tre finestre (stesso file): ${rumore.toFixed(1)}%\n`);

  const base = JSON.parse(fs.readFileSync(RIFERIMENTO, 'utf8'));
  const cresce = v => ((v.ora - v.base) / v.base * 100);
  const voci = [
    { nome: 'fotogramma medio', base: base.media, ora: ora.media },
    { nome: 'tipico (quinto centrale)', base: base.meta, ora: ora.meta },
    { nome: 'il 95 per cento sotto', base: base.p95, ora: ora.p95 },
  ];
  if (base.freno !== freno) console.log('ATTENZIONE: il riferimento fu preso con un altro freno, il confronto non vale.\n');

  /* il cancello decide PRIMA di parlare se e' in grado di vedere: cosi'
     nessuno legge tre righe rosse e ci crede per mezzo secondo */
  const cieco = rumore >= tolleranza || carico >= 60;
  if (cieco) {
    console.log(`  ============================================================`);
    console.log(`  IL CANCELLO SI DICHIARA CIECO, e si astiene dal verdetto.`);
    console.log(`  ============================================================`);
    console.log(`  rumore fra le finestre ${rumore.toFixed(1)}% (tolleranza ${tolleranza}%), carico della macchina ${carico.toFixed(0)}%.`);
    console.log(`  Il riferimento su disco fu preso ${base.freno === freno ? 'con lo stesso freno' : 'con un altro freno'} su un banco che non esiste piu'`);
    console.log(`  (QUARTA AVVERTENZA). Con questo rumore il confronto assoluto accusa gli innocenti`);
    console.log(`  e assolve i colpevoli a seconda di come sta la macchina oggi.`);
    console.log(`  Le righe qui sotto sono NUMERI, non un giudizio — segnate con "?" apposta.\n`);
  }

  let male = 0;
  for (const v of voci) {
    const d = cresce(v);
    const ok = d <= tolleranza;
    if (!ok) male++;
    console.log((cieco ? '  ?    ' : ok ? '  OK   ' : '  NO   ') +
      `${v.nome}: ${v.base} -> ${v.ora} ms  (${d >= 0 ? '+' : ''}${d.toFixed(1)}%, ammesso +${tolleranza}%)`);
  }

  if (cieco) {
    console.log(`\n  Il giudizio onesto si prende cosi':`);
    console.log(`      node strumenti/prestazione.js --contro HEAD`);
    console.log(`  che misura i due file alternati sullo stesso banco nello stesso minuto,`);
    console.log(`  dove il rumore colpisce tutti e due e sparisce nella differenza.`);
    process.exit(2);
  }

  console.log(`\n${voci.length} confronti, ${voci.length - male} passati, ${male} falliti`);
  if (rumore >= tolleranza / 2) {
    console.log(`\nsospetto: il banco balla del ${rumore.toFixed(1)}%, meta' della tolleranza. Il verdetto qui sopra regge appena;\nse conta davvero, confermarlo con  node strumenti/prestazione.js --contro HEAD`);
  }
  if (male) { console.log('\nUn gioco che scatta non e\' un gioco da vetrina, per quanto sia bello fermo.'); process.exit(1); }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
