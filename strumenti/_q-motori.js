/* =====================================================================
   _q-motori.js — DUE MOTORI, NON DUE SCHEDE (voce #141, compito 1)

   PERCHE' ESISTE, ed e' il rischio che nessuno strumento del repo vedeva.

   `strumenti/_q-determinismo.js` dice «due telefoni vedono la stessa
   partita» e lo dice bene, ma lo dice facendo UN SOLO chromium.launch()
   e aprendo due contesti della stessa istanza (righe 147, 156, 170). Due
   contesti dello stesso Chromium condividono lo stesso V8, la stessa
   libreria matematica, la stessa CPU: la parola «telefono» li' dentro e'
   un'INFERENZA, non una misura. Due telefoni veri sono un V8 su Android
   e un JavaScriptCore su iPhone.

   E la differenza non e' teorica. La simulazione chiama a ogni passo
   funzioni che ECMA-262 lascia APPROSSIMATE all'implementazione:
     · len = (x,y) => Math.hypot(x,y)        CALCETTO-il-gioco.html:8710
     · Math.pow(0.35, dt*ATTR_K) in updateBall              :19685
     · Math.sin (160 usi), Math.cos (104), Math.atan2 (26), Math.exp (44)
   La norma dice «implementation-approximated»: due motori possono dare
   l'ultimo bit diverso e restare tutti e due conformi. In un motore
   caotico a sessanta passi al secondo un ultimo bit diventa un gol.

   PERCHE' VA FATTA PER PRIMA nell'onda E: costa un pomeriggio e puo'
   ANNULLARE L'INTERA ONDA. Se le impronte differiscono, il lockstep puro
   non esiste (due telefoni divergono da soli, senza che la rete c'entri
   niente) e tutto il resto dell'onda e' lavoro sprecato.

   LE CINQUE PROVE, in ordine:
     S) LO STESSO BANCO — schermo, DPR, campo, uomini e sorteggi al
        fischio d'inizio. Se non coincidono, non si confrontano due
        MOTORI: si confrontano due telefoni, e un rosso non avrebbe la
        causa che dice di avere. Questa prova esiste per un falso allarme
        pagato (vedi OPZ_CONTESTO).
     T) I TRASCENDENTI NUDI — funzione per funzione, bit per bit. Non
        tocca il gioco: se e' rossa si sa GIA' dove guardare.
     H) LA CASA — le stesse funzioni scritte in casa (voce #143), sugli
        stessi valori: e' il cancello che T non puo' essere.
     A) LA RIPETIBILITA' DENTRO OGNI MOTORE — due partite di fila nello
        stesso motore devono essere identiche. Se non lo sono, il rosso e'
        del BANCO (o del gioco), non dei motori: si esce 2 e non si accusa
        nessuno.
     B) L'IMPRONTA FRA MOTORI — E' LA SOGLIA (SOGLIA-MOTORE, spec #141
        §1): impronte IDENTICHE su tre semi, fra Chromium (V8), WebKit
        (JavaScriptCore) e Firefox (SpiderMonkey).
     C) LA CURA, MISURATA — se B e' rossa, un rosso senza causa manda
        qualcuno a riprogettare un'onda intera. Qui si rimette Math.hypot
        a `Math.sqrt(x*x+y*y)` IN TUTTI E TRE i motori e si rimisura: se
        i motori convergono, il guasto e' UNA RIGA e non un'architettura.
        La riscrittura e' lecita per norma: IEEE-754 obbliga `sqrt` a
        essere CORRETTAMENTE ARROTONDATA, quindi da' lo stesso bit
        ovunque, mentre `hypot` e' solo «implementation-approximated».
        (Il prezzo della riscrittura e' l'overflow per componenti sopra
        ~1e154 e l'underflow sotto ~1e-162: in un campo largo 1150 unita'
        non succede, e va detto invece che taciuto.)

   ------------------------------------------------------------------
   RETTIFICA A EDIZIONI (23 settembre 2026, voce #143, compito 4):
   LA PROVA T NON ERA UN CANCELLO, E PER UN GIORNO LO E' SEMBRATA
   ------------------------------------------------------------------
   Com'era scritta, la prova T dava un verdetto per funzione: «Math.sin
   da' gli stessi bit ovunque», rosso se no. Sette delle dieci righe
   erano ROSSE, e lo erano PER COSTRUZIONE: ECMA-262 dichiara sin, cos,
   tan, exp, log, atan2 e hypot «implementation-approximated», cioe'
   PERMETTE ai motori di dare l'ultimo bit diverso. Quelle sette righe
   non potevano diventare verdi con nessun lavoro dentro questa casa —
   sarebbe servito che V8, JavaScriptCore e SpiderMonkey cambiassero
   idea tutti e tre.

   E il referto lo diceva male: «21 controlli, 14 passati, 7 falliti»
   seguito da «SOGLIA-MOTORE TENUTA» e uscita 0. Uno strumento che conta
   fra i propri fallimenti sette righe che non possono passare insegna a
   leggere i suoi rossi senza crederci, e il giorno che ne arriva uno
   vero nessuno lo guarda. (Ed era anche la forma numerica sbagliata per
   la domanda: dopo il compito 3 il gioco non chiama piu' nessuna di
   quelle sette — chiama Msin, Mcos, ..., e T non le guardava.)

   Da oggi T e' quel che e' sempre stata: UNA MISURA, stampata per
   intero, piu' i due soli verdetti che una misura del genere puo'
   onestamente dare —
     · «almeno una nativa diverge ancora»: se fossero tutte concordi, la
       prova H qui sotto sarebbe verde per il motivo sbagliato (e' la
       stessa guardia di `_q-casa.js` prova N, e il falso che previene e'
       `_crit-motore-piatto` del #142);
     · «sqrt e pow danno gli stessi bit ovunque»: sono le DUE che il
       gioco lascia native apposta (_toppa-143-matematica.js), e se
       divergessero il perimetro avrebbe un buco vero. Questo si' che e'
       un cancello, e sa fallire.
   Il cancello che mancava — le sette DI CASA lette sulla pagina del
   gioco vero — e' la prova H, nuova. Il conto dei controlli resta 21.

   IL SEME E' QUELLO DEL GIOCO, non quello del banco. _q-determinismo
   semina Math.random da fuori nelle prove A e B, ed e' giusto per quel
   che misura; qui sarebbe barare — nasconderebbe proprio la differenza
   fra motori che stiamo cercando, perche' un PRNG xorshift scritto in JS
   da' gli stessi interi ovunque. Qui si usa __test.semina, cioe' il seme
   che due telefoni veri userebbero, e si lascia in pace il caso del
   browser.

   uso:  node strumenti/_q-motori.js
         node strumenti/_q-motori.js --semi 3 --secondi 90 --taglia 5
         node strumenti/_q-motori.js --motori chromium,webkit
   esce 0 se i motori coincidono, 1 se divergono (ed e' un NO per il
   lockstep puro), 2 se il banco e' esploso, 3 se non c'e' stato niente
   da misurare.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const playwright = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

const TAGLIA = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
const NSEMI = Math.max(1, parseInt(arg('semi', '3'), 10) || 3);
const SEME0 = parseInt(arg('seme', '20260923'), 10) >>> 0;
const SECONDI = Math.max(5, parseInt(arg('secondi', '90'), 10) || 90);
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const MOTORI = String(arg('motori', 'chromium,webkit,firefox')).split(',').map(s => s.trim()).filter(Boolean);

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

/* L'IMPRONTA — la stessa di _q-determinismo, parola per parola, e non e'
   pigrizia: se le due fossero diverse, un rosso qui e un verde la'
   significherebbero «due metri diversi» invece di «due motori diversi». */
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

/* LA TAVOLA DEI TRASCENDENTI, funzione per funzione. I valori non sono
   tondi apposta: un motore che sbaglia l'ultimo bit lo sbaglia sugli
   irrazionali, non su Math.pow(2,3). Si legge il BIT, non il numero:
   Float64Array->BigUint64Array e' l'unico confronto che non passa dalla
   stampa decimale (toString arrotonda a 17 cifre e nasconde proprio cio'
   che cerchiamo). Le funzioni sono quelle che il gioco chiama davvero,
   col loro numero di usi contato sul file. */
const FUNZIONI = `(() => {
  const bit = x => { const f=new Float64Array(1); f[0]=x;
                     return new BigUint64Array(f.buffer)[0].toString(16); };
  const V = []; for(let i=1;i<=200;i++) V.push(i*0.7310127 + 0.13);
  const F = {
    'hypot(33)':  v => Math.hypot(v, v*1.7),
    'sqrt(45)':   v => Math.sqrt(v),
    'sin(160)':   v => Math.sin(v),
    'cos(104)':   v => Math.cos(v),
    'atan2(26)':  v => Math.atan2(v, v*0.37-1.1),
    'exp(44)':    v => Math.exp(-v*0.1),
    'pow(30)':    v => Math.pow(0.35, v*0.0166667*3.2),
    'tan(2)':     v => Math.tan(v),
    'log(1)':     v => Math.log(v+1),
    'sqrt(xx+yy)': v => Math.sqrt(v*v + (v*1.7)*(v*1.7)),
  };
  const out = {};
  for(const k in F) out[k] = V.map(v => bit(F[k](v))).join(' ');
  return out;
})()`;

/* LE STESSE SETTE, MA DI CASA (voce #143). Si leggono DALLA PAGINA DEL
   GIOCO — `window.Msin`, non una copia della libreria portata dal banco:
   una copia direbbe che la libreria di `strumenti/` e' uguale ovunque,
   che non e' la domanda. La domanda e' se il gioco spedito calcola lo
   stesso bit su tre motori, e il solo modo di chiederlo e' chiedere alle
   funzioni che il gioco ha davvero dentro.

   I valori e le composizioni sono gli STESSI di FUNZIONI, apposta: cosi'
   la riga di casa e la riga nativa si leggono l'una sotto l'altra e il
   confronto e' fra due matematiche sullo stesso dominio, non fra due
   esperimenti diversi. Una funzione che il gioco non porta in casa torna
   assente invece che finta: e' il caso del mutante `solo-hypot`, che ne
   ha una sola, e un banco che gli inventasse le altre sei misurerebbe
   se' stesso. */
const FUNZIONI_CASA = `(() => {
  const bit = x => { const f=new Float64Array(1); f[0]=x;
                     return new BigUint64Array(f.buffer)[0].toString(16); };
  const V = []; for(let i=1;i<=200;i++) V.push(i*0.7310127 + 0.13);
  const F = {
    'hypot(33)':  ['Mhypot', v => Mhypot(v, v*1.7)],
    'sin(160)':   ['Msin',   v => Msin(v)],
    'cos(104)':   ['Mcos',   v => Mcos(v)],
    'atan2(26)':  ['Matan2', v => Matan2(v, v*0.37-1.1)],
    'exp(44)':    ['Mexp',   v => Mexp(-v*0.1)],
    'tan(2)':     ['Mtan',   v => Mtan(v)],
    'log(1)':     ['Mlog',   v => Mlog(v+1)],
  };
  const out = {};
  for(const k in F){
    const [nome, f] = F[k];
    out[k] = (typeof window[nome] === 'function') ? V.map(v => bit(f(v))).join(' ') : null;
  }
  return out;
})()`;

/* IL BANCO, DICHIARATO. Quel che il gioco legge dal telefono prima ancora
   di cominciare: se questi numeri non coincidono, non si sta confrontando
   due motori — si sta confrontando due telefoni. */
const BANCO = `(() => {
  const t = window.__test;
  t.semina(20260101);
  t.startMatch(1, 1, undefined);
  const c = t.campo;
  return [devicePixelRatio, innerWidth, innerHeight,
          c.taglia, c.FW, c.FH, c.GOAL_H, c.posti, c.crowdX, c.giocatori,
          c.texOK ? 1 : 0, t.sorteggi].join(',');
})()`;

/* IL BANCO DEVE ESSERE LO STESSO BANCO, E QUESTA RIGA E' COSTATA UN FALSO
   ALLARME (23 settembre 2026, prima corsa di questo strumento).

   La prima versione passava `isMobile: true` SOLO a Chromium, perche'
   Playwright non lo accetta su Firefox. Sembrava prudenza. Il risultato:
   chromium contava 1.323 sorteggi dove webkit e firefox ne contavano 880
   TUTTI E DUE, e il banco stampava «i motori non vedono la stessa
   partita» — cioe' un NO all'intera onda E — mentre stava misurando il
   proprio deviceScaleFactor. isMobile porta con se' un DPR di 3: due
   schede con DPR diverso cuociono tele diverse, e in questo gioco la
   cottura consuma il caso.

   Da qui in poi le opzioni sono IDENTICHE per tutti e tre, senza
   eccezioni per motore. Se un giorno servisse isMobile, va acceso
   OVUNQUE o da nessuna parte: un'opzione che vale per un motore solo non
   e' una precauzione, e' una variabile nascosta dentro il confronto. */
const OPZ_CONTESTO = { viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' };

async function apri(nome, browser, porta) {
  const ctx = await browser.newContext(Object.assign({}, OPZ_CONTESTO));
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push(e.message));
  await pag.goto(`http://127.0.0.1:${porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 40000 });
  await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await pag.waitForTimeout(200);
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
  return { ctx, pag, errori };
}

/* una partita CPU contro CPU col SEME DEL GIOCO.
   ORDINE SACRO (voci #107/#108, guardato da _q-cpu-ordine.js):
   startMatch PRIMA, setCpuVsCpu DOPO. L'ordine inverso viene annullato in
   silenzio e congela una squadra: il banco misurerebbe se stesso.
   `cura` rimette Math.hypot a sqrt(x*x+y*y) prima del fischio. */
async function gioca(pag, seme, taglia, secondi, cura) {
  return pag.evaluate(([seme, taglia, secondi, IMPR, cura]) => {
    const t = window.__test;
    if (cura) {
      if (!window.__hypotVero) window.__hypotVero = Math.hypot;
      Math.hypot = (x, y) => Math.sqrt(x * x + y * y);
    } else if (window.__hypotVero) {
      Math.hypot = window.__hypotVero;
    }
    t.semina(seme);
    t.startMatch(1, 1, taglia !== 5 ? { size: taglia } : undefined);
    t.setCpuVsCpu(true);
    const leggi = new Function('return ' + IMPR);
    const impronte = [];
    let sim = 0;
    while (t.state !== 'end' && sim < secondi) { t.simulate(1); sim += 1; impronte.push(leggi()); }
    return { impronte, gol: [G.score[0], G.score[1]], sorteggi: t.sorteggi, scena: t.state };
  }, [seme, taglia, secondi, IMPRONTA, !!cura]);
}

const primoScarto = (a, b) => {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
};

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  const esiti = [];
  const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
  const aperti = [];

  try {
    console.log('=== DUE MOTORI, NON DUE SCHEDE — ' + MOTORI.join(' / ') + ', ' + NSEMI + ' semi a taglia ' +
                TAGLIA + ', ' + SECONDI + ' s' + (provaRel ? ', gioco ' + provaRel : '') + ' ===');
    console.log('    (il seme e\' quello DEL GIOCO, non quello del banco: seminare Math.random da');
    console.log('     fuori nasconderebbe proprio la differenza fra motori che stiamo cercando)\n');

    for (const nome of MOTORI) {
      if (!playwright[nome]) throw Object.assign(new Error('motore sconosciuto: ' + nome), { banco: true });
      let browser;
      try { browser = await playwright[nome].launch(); }
      catch (e) { throw Object.assign(new Error('non si apre ' + nome + ': ' + e.message), { banco: true }); }
      const p = await apri(nome, browser, srv.porta);
      aperti.push({ nome, browser, ...p });
      console.log('  . ' + nome + ' aperto');
    }
    if (aperti.length < 2) throw Object.assign(new Error('servono almeno due motori'), { banco: true });
    const base = aperti[0].nome;
    const altri = aperti.slice(1).map(m => m.nome);
    console.log('');

    /* ---- S: lo stesso banco ---- */
    console.log('S) LO STESSO BANCO — schermo, DPR, campo, uomini e sorteggi al fischio d\'inizio');
    const bc = {};
    for (const m of aperti) bc[m.nome] = await m.pag.evaluate(B => new Function('return ' + B)(), BANCO);
    let bancoDiverso = '';
    for (const n of altri) {
      const ok = bc[base] === bc[n];
      if (!ok) bancoDiverso = n;
      di(ok, base + ' e ' + n + ' partono dallo stesso banco', ok ? bc[n] : bc[base] + '  contro  ' + bc[n]);
    }
    console.log('');
    if (bancoDiverso) {
      console.log('IL BANCO NON E\' LO STESSO (' + bancoDiverso + '): un confronto fra motori qui');
      console.log('misurerebbe il contesto del browser e lo chiamerebbe motore. Si esce 2.');
      throw Object.assign(new Error('banco diverso su ' + bancoDiverso), { banco: true, gia: true });
    }

    /* ---- T: i trascendenti nudi — MISURA, non cancello (vedi la rettifica in testa) ---- */
    console.log('T) I TRASCENDENTI NUDI — 200 valori, funzione per funzione, BIT PER BIT');
    console.log('   (fra parentesi quante volte il gioco chiama quella funzione. Queste righe sono');
    console.log('    una MISURA e non un verdetto: ECMA-262 PERMETTE ai motori di dare l\'ultimo bit');
    console.log('    diverso su sin/cos/tan/exp/log/atan2/hypot, quindi un rosso qui non e\' un');
    console.log('    difetto da curare — e\' il motivo per cui esiste la libreria in casa del #143)');
    const fn = {};
    for (const m of aperti) fn[m.nome] = await m.pag.evaluate(F => new Function('return ' + F)(), FUNZIONI);
    const colpevoli = [];
    /* le due che il gioco lascia native APPOSTA (_toppa-143-matematica.js):
       qui si', un verdetto, perche' se divergessero il perimetro avrebbe
       un buco vero e la cura sarebbe scriverle in casa come le altre */
    const NATIVE_AMMESSE = ['sqrt(45)', 'pow(30)'];
    const scartoPer = {};
    for (const k of Object.keys(fn[base])) {
      const a = fn[base][k].split(' ');
      let peggio = 0; const righe = [];
      for (const n of altri) {
        const b = fn[n][k].split(' ');
        let d = 0, primo = -1;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { d++; if (primo < 0) primo = i; }
        if (d > peggio) peggio = d;
        righe.push(n + ' ' + d + '/' + a.length + (d ? ' (@' + primo + ' ' + a[primo] + ' vs ' + b[primo] + ')' : ''));
      }
      if (peggio) colpevoli.push(k + ' ' + peggio + '/' + a.length);
      scartoPer[k] = peggio;
      if (NATIVE_AMMESSE.includes(k)) {
        di(peggio === 0, 'Math.' + k.padEnd(13) + ' da\' gli stessi bit ovunque (il gioco la lascia NATIVA)',
           righe.join(' | '));
      } else {
        console.log('   ' + (peggio ? 'diverge  ' : 'concorde ') + 'Math.' + k.padEnd(13) + '  ' + righe.join(' | '));
      }
    }
    /* LA GUARDIA CHE IMPEDISCE ALLA PROVA H DI ESSERE VERDE PER IL MOTIVO
       SBAGLIATO: se le native fossero gia' tutte d'accordo, «la casa e'
       uguale ovunque» non proverebbe niente. E' la stessa riga di
       `_q-casa.js` prova N, e il falso che previene e' `_crit-motore-piatto`
       del #142 travestito da buona notizia. */
    const nDiv = Object.keys(scartoPer).filter(k => !NATIVE_AMMESSE.includes(k) && scartoPer[k] > 0).length;
    const nMis = Object.keys(scartoPer).filter(k => !NATIVE_AMMESSE.includes(k)).length;
    di(nDiv > 0, 'almeno una nativa diverge ancora fra i motori (il controllo positivo e\' vivo)',
       nDiv + ' su ' + nMis + ' divergono: ' + (colpevoli.join(', ') || 'nessuna'));
    console.log('');

    /* ---- H: le sette DI CASA, sulla pagina del gioco vero ---- */
    console.log('H) LA CASA — le stesse funzioni scritte in casa (voce #143), gli stessi 200 valori');
    console.log('   (lette da `window.Msin` e sorelle SULLA PAGINA DEL GIOCO, non da una copia');
    console.log('    portata dal banco: una copia direbbe che la libreria di strumenti/ e\' uguale');
    console.log('    ovunque, e non e\' la domanda. E\' QUI che un rosso significa «il gioco spedito');
    console.log('    calcola numeri diversi su due telefoni».)');
    const fc = {};
    for (const m of aperti) fc[m.nome] = await m.pag.evaluate(F => new Function('return ' + F)(), FUNZIONI_CASA);
    const inCasa = Object.keys(fc[base]).filter(k => fc[base][k] !== null);
    if (!inCasa.length) {
      console.log('   IL GIOCO NON PORTA LA LIBRERIA IN CASA: niente da misurare qui, e non e\' un');
      console.log('   rosso — e\' il gioco di prima del #143 (o un mutante che la toglie). La prova B');
      console.log('   qui sotto dira\' lo stesso se i motori si accordano.');
    } else {
      for (const k of Object.keys(fc[base])) {
        if (fc[base][k] === null) { console.log('   assente  M' + k.padEnd(13) + '  il gioco non porta questa funzione in casa'); continue; }
        const a = fc[base][k].split(' ');
        let peggio = 0; const righe = [];
        for (const n of altri) {
          const b = (fc[n][k] || '').split(' ');
          let d = 0, primo = -1;
          for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { d++; if (primo < 0) primo = i; }
          if (d > peggio) peggio = d;
          righe.push(n + ' ' + d + '/' + a.length + (d ? ' (@' + primo + ' ' + a[primo] + ' vs ' + b[primo] + ')' : ''));
        }
        di(peggio === 0, 'M' + k.padEnd(13) + ' da\' gli stessi bit ovunque',
           righe.join(' | ') + (scartoPer[k] ? '  ·  la nativa ne sbagliava ' + scartoPer[k] + '/200' : ''));
      }
    }
    console.log('');

    /* ---- A: ripetibilita' DENTRO ogni motore ---- */
    console.log('A) DENTRO OGNI MOTORE la partita si ripete — se no il rosso e\' del BANCO, non dei motori');
    let bancoRotto = '';
    for (const m of aperti) {
      const u = await gioca(m.pag, SEME0, TAGLIA, SECONDI, false);
      const d = await gioca(m.pag, SEME0, TAGLIA, SECONDI, false);
      const k = primoScarto(u.impronte, d.impronte);
      di(k < 0, m.nome + ': due partite di fila sono la stessa',
         k < 0 ? u.impronte.length + ' campioni, ' + u.gol.join('-') + ', ' + u.sorteggi + ' sorteggi'
               : 'divergono al campione ' + k);
      if (k >= 0) bancoRotto = m.nome + ' non e\' ripetibile nemmeno con se stesso';
    }
    console.log('');
    if (bancoRotto) {
      console.log('NON SI PUO\' ACCUSARE NESSUN MOTORE: ' + bancoRotto + '.');
      console.log('Finche\' una partita non si ripete dentro un motore solo, un confronto FRA');
      console.log('motori non misura i motori: misura il rumore. Trovare prima quello.');
      throw Object.assign(new Error(bancoRotto), { banco: true, gia: true });
    }

    /* ---- B e C: l'impronta fra motori, com'e' oggi e con la cura ---- */
    const misura = async cura => {
      let diverse = 0; const dett = [];
      for (let s = 0; s < NSEMI; s++) {
        const seme = (SEME0 + s) >>> 0;
        const corse = {};
        for (const m of aperti) corse[m.nome] = await gioca(m.pag, seme, TAGLIA, SECONDI, cura);
        for (const n of altri) {
          const u = corse[base], d = corse[n];
          const k = primoScarto(u.impronte, d.impronte);
          if (k >= 0) { diverse++; dett.push(n + '@' + seme + ' al campione ' + k); }
          di(k < 0, 'seme ' + seme + ': ' + base + ' e ' + n + ' vedono la stessa partita',
             k < 0 ? u.impronte.length + ' campioni, ' + u.gol.join('-') + ', ' + u.sorteggi + ' sorteggi'
                   : 'divergono al campione ' + k + ' (secondo ' + k + '), ' +
                     u.gol.join('-') + ' contro ' + d.gol.join('-') +
                     ', sorteggi ' + u.sorteggi + ' contro ' + d.sorteggi);
        }
      }
      return { diverse, dett };
    };

    console.log('B) L\'IMPRONTA FRA MOTORI, COM\'E\' OGGI — e\' LA SOGLIA (SOGLIA-MOTORE: identiche su tre semi)');
    const B = await misura(false);
    console.log('');

    let C = null;
    if (B.diverse && inCasa.length) {
      /* LA PROVA C E' LA DIAGNOSI DEL #141, E DOPO IL #143 NON HA PIU'
         NIENTE DA DIRE: rimetterebbe `Math.hypot` a sqrt(x*x+y*y) in un
         gioco che Math.hypot non la chiama piu'. La partita non
         cambierebbe di un bit, e il banco stamperebbe «e la cura non
         basta» — una frase vera per il motivo sbagliato, cioe' la specie
         di referto che manda qualcuno a riprogettare l'onda E per niente.
         Si dichiara e si salta. Il valore diagnostico non si perde: e'
         passato alla prova H, che dice QUALE funzione di casa diverge. */
      console.log('C) LA CURA DEL #141 — SALTATA, e la ragione e\' che c\'e\' gia\' dentro');
      console.log('   Questa prova rimetteva Math.hypot a sqrt(x*x+y*y) per misurare se il guasto');
      console.log('   fosse UNA RIGA. Il gioco porta la libreria in casa del #143: hypot non e\' piu\'');
      console.log('   nativa, e riscrivere Math.hypot non toccherebbe la partita. Se B e\' rossa oggi,');
      console.log('   LA CAUSA NON E\' HYPOT: guardare la prova H qui sopra, che nomina la funzione.');
      console.log('');
    } else if (B.diverse) {
      console.log('C) LA CURA, MISURATA — Math.hypot rimesso a sqrt(x*x+y*y) in TUTTI E TRE i motori');
      console.log('   (un rosso senza causa manda qualcuno a riprogettare un\'onda intera: qui si');
      console.log('    misura se il guasto e\' UNA RIGA o un\'architettura. sqrt e\' correttamente');
      console.log('    arrotondata per IEEE-754, hypot no: la riscrittura e\' identica per norma.)');
      C = await misura(true);
      console.log('');
    }

    const errori = [].concat(...aperti.map(m => m.errori));
    for (const m of aperti) await m.browser.close();
    aperti.length = 0;
    srv.chiudi();

    if (errori.length) {
      console.error('ECCEZIONI DI PAGINA: ' + errori.slice(0, 3).join(' | '));
      process.exit(2);
    }

    const rossi = esiti.filter(x => !x).length;
    console.log(esiti.length + ' controlli, ' + (esiti.length - rossi) + ' passati, ' + rossi + ' falliti\n');

    if (!B.diverse) {
      /* UN ROSSO FUORI DALLA PROVA B E' COMUNQUE UN ROSSO, e fino al 23
         settembre 2026 non lo era: si usciva 0 appena B era verde. Andava
         bene finche' gli unici rossi possibili stavano nella prova T ed
         erano rossi per costruzione (vedi la rettifica in testa al file).
         Adesso T e H hanno verdetti veri — `sqrt` e `pow` concordi, le
         sette di casa concordi — e uno strumento che li stampasse per poi
         uscire 0 sarebbe l'attestato che questa casa non tiene. */
      if (rossi) {
        console.log('>>> LA SOGLIA-MOTORE TIENE (' + MOTORI.join(', ') + ' vedono la stessa partita su ' +
                    NSEMI + ' semi), MA CI SONO ' + rossi + ' ROSSI QUI SOPRA.');
        console.log('    Una partita identica su tre motori con una funzione che non lo e\' vuol dire');
        console.log('    che questi semi non la accendono: e\' un buco che si apre alla prima partita');
        console.log('    diversa, non una buona notizia. Si esce 1.');
        process.exit(1);
      }
      console.log('>>> SOGLIA-MOTORE TENUTA: ' + MOTORI.join(', ') + ' vedono la STESSA partita');
      console.log('    su ' + NSEMI + ' semi da ' + SECONDI + ' s. Lo scarto fra motori JavaScript non e\'');
      console.log('    un ostacolo per l\'onda E, e «due telefoni» smette di essere un\'inferenza.');
      process.exit(0);
    }

    console.log('>>> SOGLIA-MOTORE NON TENUTA. I motori NON vedono la stessa partita:');
    console.log('    ' + B.dett.slice(0, 6).join(' · '));
    if (colpevoli.length) console.log('    Trascendenti che differiscono: ' + colpevoli.join(', ') + '.');
    if (C && !C.diverse) {
      console.log('\n    MA LA CAUSA E\' UNA RIGA, ED E\' MISURATA. Con Math.hypot riscritto come');
      console.log('    sqrt(x*x+y*y) i ' + MOTORI.length + ' motori tornano IDENTICI su tutti e ' + NSEMI + ' i semi,');
      console.log('    impronta, punteggio e conto dei sorteggi. Il colpevole e\'');
      console.log('    `const len=(x,y)=>Math.hypot(x,y)` (CALCETTO-il-gioco.html:8710), piu\' le');
      console.log('    altre 32 chiamate dirette. NON e\' l\'architettura dell\'onda E a cadere: e\'');
      console.log('    un prerequisito nuovo, piccolo e chiuso, da mettere nel piano dei cantieri.');
    } else if (C) {
      console.log('\n    E LA CURA NON BASTA: anche con Math.hypot riscritto i motori restano');
      console.log('    diversi (' + C.dett.slice(0, 3).join(' · ') + ').');
      console.log('    Allora il lockstep puro NON ESISTE su motori diversi, e l\'onda E cambia');
      console.log('    forma: resta l\'arbitro (progetto d\'onda §5). Avvisare il committente.');
    }
    process.exit(1);
  } catch (e) {
    for (const m of aperti) { try { await m.browser.close(); } catch (x) {} }
    try { srv.chiudi(); } catch (x) {}
    if (!e.gia) console.error('\nFALLITO (banco): ' + e.message);
    process.exit(2);
  }
})();
