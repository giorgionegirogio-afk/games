/* =====================================================================
   _prova-umana-ritardo.js — LA GAMBA C: LA PROVA UMANA, IN CIECO
   (voce #141, compito 4)

   =====================================================================
   QUESTO STRUMENTO NON E' STATO ESEGUITO. RICHIEDE IL COMMITTENTE.
   =====================================================================
   L'implementatore del #141 lo ha COSTRUITO e lo ha lasciato pronto. La
   gamba C e' l'unica delle quattro capace di pronunciare la parola
   «ingiocabile», e l'unica che un banco non puo' fare al posto di una
   persona. Fingerla — sostituirla con un'opinione, o dedurla dalla gamba
   A — sarebbe il peggiore dei verdetti falsi, perche' sarebbe l'unico a
   parlare a nome di chi gioca.
   Il protocollo completo sta in
   `docs/superpowers/plans/2026-09-23-protocollo-prova-umana.md`.

   COME FUNZIONA
   Sei partite da 90 secondi. Prima di ogni partita lo strumento pesca un
   K dal mazzo {0, 3, 6, 9, 12, 18} — uno solo per ciascuno, in ordine
   mescolato — e NON LO DICE. Dopo ogni partita chiede due cose:
     · «quanto e' stata tua?»  da 1 a 5
     · «la rigiocheresti?»     si / no
   Alla fine rivela l'ordine e stampa la mediana per K.

   PERCHE' IN CIECO. Un ritardo dichiarato si giudica prima di sentirlo.
   Chi sa che sta giocando a 300 ms trova tardo anche lo zero, e chi sa
   che e' a zero perdona i 300. La cecita' non e' teatro: e' la sola cosa
   che rende confrontabili sei voti della stessa persona.

   PERCHE' L'ORDINE SI SIGILLA PRIMA. Lo strumento scrive un SIGILLO —
   l'impronta dell'ordine pescato — nel verbale, prima della prima
   partita, e l'ordine in chiaro solo alla fine. Cosi' nessuno (nemmeno
   chi ha scritto lo strumento) puo' riordinare le partite dopo aver
   visto i voti.

   =====================================================================
   IL LIMITE CHE VA LETTO PRIMA DI GIOCARE: SERVE UN DITO, NON UNA
   TASTIERA.
   =====================================================================
   `__test.ritardo(K)` accoda le QUATTRO PORTE DI Touch5 — start, move,
   chiudi, azzera — e basta. La tastiera non passa di li': entra dritta
   in `Keys[e.code]` dentro i due gestori di keydown/keyup
   (CALCETTO-il-gioco.html:12698 e :12734) e NON subisce nessun ritardo.

   Quindi una partita giocata coi tasti sentirebbe ZERO ritardo a
   qualunque K, e il voto direbbe «bellissimo» di una cosa che non e'
   stata provata. E' il modo piu' facile di rendere falsa questa gamba, e
   percio' lo strumento NON si fida: registra il nastro di ogni partita e
   CONTA le righe. Se ci sono righe di tasto (tipo 4), o se non ci sono
   abbastanza righe di tocco, il voto viene SCARTATO e detto perche'.

   Si gioca col dito: dal telefono, puntando il browser al server locale
   che questo strumento apre, oppure su un portatile con lo schermo
   sensibile. L'indirizzo lo stampa lo strumento.

   uso:  node strumenti/_prova-umana-ritardo.js
         node strumenti/_prova-umana-ritardo.js --porta 8777 --verbale prova.txt
         node strumenti/_prova-umana-ritardo.js --rivela prova.txt   (solo lettura)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const crypto = require('crypto');
const readline = require('readline');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const PORTA = parseInt(arg('porta', '8777'), 10) || 8777;
const VERBALE = arg('verbale', path.join(RADICE, 'prova-umana-ritardo.txt'));
const RIVELA = arg('rivela', '');
const MAZZO = String(arg('mazzo', '0,3,6,9,12,18')).split(',').map(s => parseInt(s, 10)).filter(n => n >= 0);
const SECONDI = parseInt(arg('secondi', '90'), 10) || 90;

/* SOGLIA-UMANA, dichiarata nella spec il 23 settembre 2026 PRIMA di
   qualunque partita: mediana «e' stata mia» >= 4/5 e ZERO «non
   riproverei». Se l'uomo dice no, i numeri non contano. */
const SOGLIA_VOTO = 4;

/* --------------------------------------------------- solo rilettura */
if (RIVELA) {
  const t = fs.readFileSync(path.resolve(RADICE, RIVELA), 'utf8');
  console.log(t);
  process.exit(0);
}

function indirizzi() {
  const out = [];
  const i = os.networkInterfaces();
  for (const n in i) for (const a of i[n]) if (a.family === 'IPv4' && !a.internal) out.push(a.address);
  return out;
}

/* il mazzo si mescola una volta sola, e il sigillo si scrive PRIMA */
function mescola(a, seme) {
  const b = a.slice();
  let s = seme >>> 0 || 1;
  const p = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
  for (let i = b.length - 1; i > 0; i--) { const j = p() % (i + 1); const x = b[i]; b[i] = b[j]; b[j] = x; }
  return b;
}

const chiedi = (rl, q) => new Promise(r => rl.question(q, x => r(String(x || '').trim())));

(async () => {
  let playwright;
  try { playwright = require('playwright'); }
  catch (e) { console.error('serve playwright: npm install'); process.exit(2); }

  const srv = http.createServer((req, res) => {
    const f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]) === '/' ? '/CALCETTO-il-gioco.html' : decodeURIComponent(req.url.split('?')[0]));
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(ok => srv.listen(PORTA, '0.0.0.0', ok));

  const semeMescola = (Date.now() ^ crypto.randomBytes(4).readUInt32BE(0)) >>> 0;
  const ordine = mescola(MAZZO, semeMescola);
  const sigillo = crypto.createHash('sha256').update(ordine.join(',') + '|' + semeMescola).digest('hex').slice(0, 16);

  const verbale = [];
  const scrivi = r => { verbale.push(r); fs.writeFileSync(VERBALE, verbale.join('\n') + '\n'); };

  scrivi('PROVA UMANA IN CIECO — metro del ritardo, voce #141');
  scrivi('data: ' + new Date().toISOString());
  scrivi('mazzo: ' + MAZZO.length + ' partite da ' + SECONDI + ' s, K fra {' + MAZZO.join(', ') + '}');
  scrivi('SIGILLO DELL\'ORDINE (scritto PRIMA della prima partita): ' + sigillo);
  scrivi('SOGLIA-UMANA dichiarata nella spec: mediana >= ' + SOGLIA_VOTO + '/5 e ZERO «non riproverei»');
  scrivi('');

  console.log('\n=== LA PROVA UMANA, IN CIECO — gamba C del metro del ritardo ===\n');
  console.log('  Sei partite da ' + SECONDI + ' secondi. Il ritardo cambia a ogni partita e NON');
  console.log('  ti viene detto. Dopo ognuna rispondi a due domande.\n');
  console.log('  SI GIOCA COL DITO. La tastiera NON subisce il ritardo (entra in Keys senza');
  console.log('  passare dalle quattro porte di Touch5): una partita ai tasti direbbe');
  console.log('  «bellissimo» di una cosa che non hai provato. Lo strumento controlla, e');
  console.log('  scarta il voto se trova righe di tastiera nel nastro.\n');
  console.log('  Dal telefono, stessa rete: http://' + (indirizzi()[0] || '<ip>') + ':' + PORTA + '/CALCETTO-il-gioco.html');
  console.log('  SIGILLO dell\'ordine (gia\' scritto nel verbale): ' + sigillo + '\n');

  const browser = await playwright.chromium.launch({ headless: false });
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.goto('http://127.0.0.1:' + PORTA + '/CALCETTO-il-gioco.html', { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 60000 });
  const haRitardo = await pag.evaluate(() => typeof window.__test.ritardo === 'function');
  if (!haRitardo) {
    console.error('\nQuesto gioco non espone __test.ritardo: la toppa _toppa-141-ritardo.js non');
    console.error('e\' applicata. Senza l\'aggancio ogni partita sarebbe a ritardo ZERO e i voti');
    console.error('direbbero «bellissimo» di una cosa che non e\' stata provata. Non si parte.');
    await browser.close(); srv.close(); process.exit(2);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const voti = [];

  /* LA PARTITA DI RISCALDAMENTO NON CONTA. Il primo giro con qualunque
     gioco si giudica peggio degli altri, e se cadesse su un K quel K
     porterebbe il prezzo del riscaldamento invece del proprio. */
  console.log('  Prima una partita di RISCALDAMENTO, che non conta e non viene votata.');
  await chiedi(rl, '  Invio per cominciare il riscaldamento... ');
  await pag.evaluate(s => { const t = window.__test; t.dismissSplash && t.dismissSplash(); t.ritardo(0); t.startMatch(1, 1, { size: 5 }); t.setTimeLeft(s); }, Math.min(45, SECONDI));
  await chiedi(rl, '  Invio quando il riscaldamento e\' finito... ');

  for (let i = 0; i < ordine.length; i++) {
    const K = ordine[i];
    console.log('\n  --- PARTITA ' + (i + 1) + ' di ' + ordine.length + ' ---');
    await chiedi(rl, '  Invio per cominciare... ');
    await pag.evaluate(([K, s]) => {
      const t = window.__test;
      t.ritardo(0);
      t.startMatch(1, 1, { size: 5 });
      t.registra();
      t.ritardo(K);              /* DOPO startMatch e DOPO registra: prima la coda verrebbe svuotata */
      t.setTimeLeft(s);
    }, [K, SECONDI]);
    await chiedi(rl, '  Invio quando la partita e\' finita... ');
    const nastro = await pag.evaluate(() => {
      const t = window.__test;
      const conta = { tocchi: 0, tasti: 0 };
      for (const r of Reg.righe) {
        if (r[1] === 0 || r[1] === 1 || r[1] === 2) conta.tocchi++;
        else if (r[1] === 4) conta.tasti++;
      }
      t.fermaRegistro(); t.ritardo(0);
      return conta;
    });

    /* IL CANCELLO CHE SALVA LA GAMBA C DA SE STESSA */
    if (nastro.tasti > 0) {
      console.log('  VOTO SCARTATO: il nastro ha ' + nastro.tasti + ' righe di TASTIERA. La tastiera non');
      console.log('  subisce il ritardo, quindi questa partita non ha provato quel che doveva.');
      scrivi('partita ' + (i + 1) + ': SCARTATA — ' + nastro.tasti + ' righe di tastiera nel nastro');
      voti.push({ K, scartato: 'tastiera' });
      continue;
    }
    if (nastro.tocchi < 50) {
      console.log('  VOTO SCARTATO: solo ' + nastro.tocchi + ' righe di tocco nel nastro: il dito non ha');
      console.log('  giocato abbastanza perche\' il voto significhi qualcosa.');
      scrivi('partita ' + (i + 1) + ': SCARTATA — solo ' + nastro.tocchi + ' righe di tocco');
      voti.push({ K, scartato: 'nastro corto' });
      continue;
    }

    let mio = 0;
    while (!(mio >= 1 && mio <= 5)) mio = parseInt(await chiedi(rl, '  Quanto e\' stata TUA, da 1 a 5? '), 10);
    let ri = '';
    while (!/^(s|si|sì|n|no)$/i.test(ri)) ri = await chiedi(rl, '  La rigiocheresti? (si/no) ');
    const rigioca = /^(s|si|sì)$/i.test(ri);
    voti.push({ K, mio, rigioca, tocchi: nastro.tocchi });
    /* IL K NON SI SCRIVE ANCORA: il verbale resta cieco fino alla fine,
       cosi' nemmeno chi lo legge di straforo puo' inquinare i voti che
       mancano. */
    scrivi('partita ' + (i + 1) + ': mia=' + mio + '/5  rigiocherei=' + (rigioca ? 'si' : 'NO') +
           '  (tocchi nel nastro: ' + nastro.tocchi + ')');
  }
  rl.close();
  await browser.close(); srv.close();

  /* -------------------------------------------------------- si rivela */
  scrivi('');
  scrivi('ORDINE RIVELATO (sigillo ' + sigillo + '): ' + ordine.join(', '));
  scrivi('');
  const mediana = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length;
                         return n ? (n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2) : NaN; };
  console.log('\n=== IL VERBALE ===\n');
  console.log('   K   ms | «e\' stata mia» | rigiocherei');
  console.log('   ---------------------------------------');
  let sottoSoglia = [], nonRiproverei = [], scartate = 0;
  for (const K of MAZZO) {
    const v = voti.filter(x => x.K === K && !x.scartato);
    scartate += voti.filter(x => x.K === K && x.scartato).length;
    const m = v.length ? mediana(v.map(x => x.mio)) : NaN;
    const no = v.filter(x => !x.rigioca).length;
    if (v.length && m < SOGLIA_VOTO) sottoSoglia.push(K);
    if (no) nonRiproverei.push(K);
    const riga = '   ' + String(K).padStart(2) + String(Math.round(K * 1000 / 60)).padStart(6) + ' | ' +
      (v.length ? String(m) + '/5' : 'scartata').padStart(14) + ' | ' +
      (v.length ? (no ? 'NO (' + no + ')' : 'si') : '—');
    console.log(riga); scrivi(riga);
  }
  const esito = nonRiproverei.length
    ? 'SOGLIA-UMANA NON TENUTA: «non riproverei» a K = ' + nonRiproverei.join(', ') + '. E\' un NO.'
    : sottoSoglia.length
      ? 'SOGLIA-UMANA NON TENUTA: mediana sotto ' + SOGLIA_VOTO + '/5 a K = ' + sottoSoglia.join(', ') + '. E\' un NO.'
      : 'SOGLIA-UMANA TENUTA su tutti i K provati.';
  console.log('\n' + esito);
  scrivi(''); scrivi(esito);
  if (scartate) { const s = scartate + ' partite scartate: il verdetto copre solo quelle rimaste.'; console.log(s); scrivi(s); }
  console.log('\nverbale in ' + VERBALE);
  process.exit(nonRiproverei.length || sottoSoglia.length ? 1 : 0);
})().catch(e => { console.error('prova esplosa: ' + e.message); process.exit(2); });
