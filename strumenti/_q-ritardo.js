/* =====================================================================
   _q-ritardo.js — IL METRO DEL RITARDO (voce #141, compito 2)
   La GAMBA A dell'onda E: il nastro traslato.

   =====================================================================
   QUESTO BANCO MISURA IL CASO PEGGIORE. LEGGERE PRIMA DI CITARLO.
   =====================================================================
   Si prende un nastro onesto — una partita vera, con le sue dita — e lo
   si rigioca traslando OGNI COMANDO di +K tick. Il comando che il
   giocatore aveva deciso guardando lo stato al tick T viene applicato al
   tick T+K, quando il campo non e' piu' quello.

   E' esattamente cio' che fa un ritardo d'ingresso a un giocatore che
   NON SI ADATTA. Un umano vero anticipa: dopo dieci secondi comincia a
   dare il comando prima, e una parte del danno sparisce. Il nastro no,
   il nastro e' cieco.

   Quindi il numero che esce di qui e' un LIMITE SUPERIORE AL DANNO, non
   l'esperienza umana. Chi lo cita come «ecco come si sente a 200 ms»
   sbaglia di suo, e sbaglia per eccesso di severita'. L'esperienza la
   misura la GAMBA C, che richiede una persona e non un banco.

   Detto questo: un limite superiore E' una misura, ed e' l'unica delle
   quattro gambe che sa dire NO da sola, ripetibile, dato il seme.

   =====================================================================
   NASCE ROSSO DUE VOLTE, E SONO DUE USCITE DIVERSE
   =====================================================================
     · A K=0 il banco deve RIPRODURRE IL NASTRO ESATTO — impronta e
       punteggio, campione per campione. Se non ci riesce, non sta
       misurando il ritardo: sta misurando il proprio errore di
       rigiocata, e ogni numero che stampa e' rumore. Uscita 2 (BANCO
       ESPLOSO), non 1: il gioco non c'entra.
     · A K=18 (300 ms) il banco deve MOSTRARE DANNO. Se a mezzo secondo
       scarso di ritardo il danno e' zero, il banco ATTESTA invece di
       misurare, ed e' peggio di nessun banco. Uscita 3 (PROVA NULLA).
   Un 2 o un 3 NON accusano il gioco (codici di casa, CLAUDE.md).

   =====================================================================
   COME SI TRASLA, E PERCHE' NON BASTA SOMMARE K A OGNI RIGA
   =====================================================================
   Il nastro ha undici tipi di riga e solo alcune sono COMANDI:
     0,1,2,3  le quattro porte di Touch5 (start, move, chiudi, azzera)
     4        un tasto
     8        la mentalita' cambiata in pausa
   Queste si traslano sul TICK, che e' `r[0]`.

     6        i tre verbi del dischetto
   Questa NON ha un tick utile: durante un duello `Reg.tick` sta fermo,
   perche' `Reg.passo()` gira solo dentro `step()` e il duello gira in
   `Duel.update`. Il suo orologio e' la coppia `(nDuello, passo)`, cioe'
   `r[3]` e `r[4]`. Traslarne il tick non ritarderebbe NIENTE: sarebbe
   una traslazione sorda. Si trasla `r[4]`, che e' lo stesso orologio a
   60 Hz.

     5,7,9,10 il segno del duello, le due rose, la troncatura, lo schermo
   Sono METADATI letti prima del fischio. Traslarli non ritarda un
   comando: cambia la partita. Restano dove sono.

   Chi sbaglia una di queste tre cose costruisce, senza volerlo, uno dei
   tre falsi di `_q-ritardo-falsi.js`.

   uso:  node strumenti/_q-ritardo.js
         node strumenti/_q-ritardo.js --nastri 20 --tetto 3600
         node strumenti/_q-ritardo.js --k 0,6,12,18
         node strumenti/_q-ritardo.js --bugia strumenti/_crit-traslazione-sorda.js
   esce 0 se la SOGLIA-DANNO tiene alla D dichiarata, 1 se non tiene
   (ed e' un NO onesto), 2 se il banco e' esploso, 3 se la prova e' nulla.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

const NASTRI = Math.max(1, parseInt(arg('nastri', '20'), 10) || 20);
const TETTO = Math.max(300, parseInt(arg('tetto', '3600'), 10) || 3600);
const SEME0 = parseInt(arg('seme', '20260923'), 10) >>> 0;
const TAGLIA = [5, 7, 11].includes(+arg('taglia', 5)) ? +arg('taglia', 5) : 5;
const KS = String(arg('k', '0,3,6,9,12,15,18')).split(',').map(s => parseInt(s, 10)).filter(n => n >= 0);
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');
const bugiaFile = arg('bugia', '');
/* =====================================================================
   DUE MESTIERI, UNA MACCHINA — e tenerli separati e' quel che permette a
   questo banco di stare in batteria senza mentire.

   --solo-banco (il modo della BATTERIA): guarda che la MACCHINA regga —
   la traslazione trasla, il metro varia, il controllo negativo morde, a
   K=0 il nastro si riproduce esatto, e a K massimo il ritardo si VEDE.
   Sono cinque cancelli veri, girano in pochi minuti, e diventano rossi
   il giorno in cui qualcuno rompe il registratore o le quattro porte.
   NON applica la SOGLIA-DANNO, e non finge di poterla applicare.

   senza --solo-banco (il modo del VERDETTO): applica anche la
   SOGLIA-DANNO, e per farlo servono centoventi nastri da novanta
   secondi — un quarto d'ora. Con meno dichiara PROVA NULLA, che e'
   giusto e che in batteria vorrebbe dire stampare «non misurato» a ogni
   corsa finche' qualcuno smette di guardare.

   Un cancello che ogni giorno dice «non ho potuto misurare» insegna a
   ignorarlo, ed e' il modo lento in cui una batteria muore.
   ===================================================================== */
const SOLO_BANCO = process.argv.includes('--solo-banco');

/* LA SOGLIA E' DICHIARATA NELLA SPEC, NON QUI — questo file la CITA.
   docs/superpowers/specs/2026-09-23-metro-ritardo-design.md §1, scritta
   e committata il 23 settembre 2026 PRIMA che questo banco girasse. */
const SOGLIA_DANNO = 0.25;   /* peggioramento massimo di gol e tiri nello specchio */
const D_DICHIARATA = 12;     /* SOGLIA-D: D_gioco >= 12 tick (200 ms), non 6 */

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

/* =====================================================================
   I TRE PEZZI INIETTATI NELLA PAGINA. Stanno qui come SORGENTE e non
   come funzioni perche' i falsi di `_q-ritardo-falsi.js` li sostituiscono
   uno per volta: un falso che dovesse riscrivere tutto il banco non
   proverebbe niente, perche' non sarebbe piu' lo stesso banco.
   ===================================================================== */

/* LA TRASLAZIONE ONESTA. Vedi il cappello per il perche' di ogni ramo. */
const TRASLA = `function(righe, K){
  if(K <= 0) return;
  for(const r of righe){
    const tipo = r[1];
    if(tipo===0 || tipo===1 || tipo===2 || tipo===3 || tipo===4 || tipo===8) r[0] += K;
    else if(tipo===6) r[4] += K;
    /* 5,7,9,10 sono metadati: restano dove sono */
  }
}`;

/* LA MISURA ONESTA. Tutto da G.score e G.stats, piu' la posizione del
   comandato (per la fedelta', che si calcola fuori). */
const MISURA = `function(){
  const s = G.stats, c = G.ctrl ? G.ctrl[0] : -1;
  const p = (c >= 0 && G.players[c]) ? G.players[c] : null;
  return { gol:[G.score[0]|0, G.score[1]|0],
           tiri:[s.tiri[0]|0, s.tiri[1]|0],
           specchio:[(s.inPorta[0]||0)|0, (s.inPorta[1]||0)|0],
           possesso:[Math.round(s.possesso[0]||0), Math.round(s.possesso[1]||0)],
           rubate:[s.rubate[0]|0, s.rubate[1]|0],
           falli:[s.falli[0]|0, s.falli[1]|0],
           parate:[s.parate[0]|0, s.parate[1]|0],
           ctrl:c, px: p?p.x:0, py: p?p.y:0 };
}`;

/* L'IMPRONTA — la stessa di _q-determinismo e _q-motori, parola per
   parola: se fossero tre metri diversi, tre rossi diversi non si
   potrebbero confrontare. */
const IMPRONTA = `(() => {
  const b=G.ball;
  let s = [Math.round(b.x*100), Math.round(b.y*100), Math.round((b.z||0)*100),
           Math.round(b.vx*100), Math.round(b.vy*100), b.owner, b.lastTouch,
           G.score[0], G.score[1], Math.round(G.timeLeft*100)];
  for(const p of G.players) s.push(Math.round(p.x*100), Math.round(p.y*100), p.out|0);
  return s.join(',');
})()`;

/* =====================================================================
   IL COPIONE DELLE DITA — lo stesso di `strumenti/_q-sfida.js:232-277`,
   e per la stessa ragione: deve essere FISSO (nessun sorteggio, se no
   due esecuzioni non sono confrontabili) e deve toccare TUTTI I VERBI,
   se no il nastro prova solo la levetta e la misura del ritardo non
   vedrebbe mai il tiro caricato, che e' il verbo piu' fragile.
   I tre metodi del dischetto si chiamano diretti come li' — NON entrano
   nel nastro, e il banco lo dichiara invece di nasconderlo.
   ===================================================================== */
const COPIONE = `(function(passiMax){
  const t = window.__test;
  const D = t.Duel;
  const dischi = t.pulsanti(0);
  const grande = dischi[0] || {x:800,y:330,r:44};
  const piccolo = dischi[1] || {x:720,y:250,r:34};
  const LX = 180, LY = 300;
  let idL = 1, idB = 2, giu = false, giuB = false, duelli = 0, f = 0;
  while(f < passiMax){
    if(t.state === 'end') break;
    if(t.state === 'freekick'){
      if(D.phase === 'zone' && D.shooterHuman){ D.pickZone(2, 0.74, 0.44); duelli++; }
      else if(D.phase === 'power' && D.shooterHuman) D.stopPower();
      else if(D.phase === 'wait' && D.keeperHuman && D.keeperZone < 0) D.pickKeeper(0);
      t.simulate(1/60); f++;
      continue;
    }
    const a = f * 0.037;
    const rr = 34 + 22 * Math.sin(f * 0.011);
    const x = LX + Math.cos(a) * rr, y = LY + Math.sin(a) * rr;
    if(!giu){ Touch5.start(idL, LX, LY); giu = true; }
    else Touch5.move(idL, x, y);
    if(f % 97 === 96){ Touch5.chiudi(idL, false); giu = false; idL += 2; }
    if(f % 71 === 0 && !giuB){ Touch5.start(idB, grande.x, grande.y); giuB = true; }
    else if(giuB && f % 71 === 18){ Touch5.move(idB, grande.x - 26, grande.y - 14); }
    else if(giuB && f % 71 === 26){ Touch5.chiudi(idB, false); giuB = false; idB += 2; }
    if(f % 53 === 11){ const j = 900 + f; Touch5.start(j, piccolo.x, piccolo.y); Touch5.chiudi(j, false); }
    /* =====================================================================
       LE DITA SI ALZANO DENTRO IL CICLO, NON DOPO — e questa riga e'
       costata un rosso su 120 (23 settembre 2026, seme 20260950).

       Il copione di _q-sfida.js chiude le dita DOPO il ciclo, ed e'
       giusto per quel banco. Qui no: un comando dato dopo l'ultima
       simulate viene scritto al tick passiMax, e la rigiocata — che
       gira esattamente 'passiMax' passi — consuma i tick da 0 a
       passiMax-1 e quel comando non lo esegue MAI. Misurato: seme
       20260950, registrato 1-3 con 4 tiri, rigiocato 1-3 con 3 tiri;
       tre rigiocate di fila identiche fra loro e identiche in TUTTO il
       resto (stesso punteggio, stesso specchio, stessi 6.251 sorteggi).
       Non divergeva niente: mancava l'ultimo rilascio, che e' un tiro.

       Chiudendo dentro l'ultima iterazione il comando finisce al tick
       passiMax-1, che la rigiocata attraversa. La stessa ferita sta nel
       copione di _q-sfida.js (righe 274-275) e li' non fa danno, perche'
       quel banco non confronta una registrazione con una rigiocata a
       tetto fisso: sta scritto qui perche' chi lo copiera' lo sappia.
       ===================================================================== */
    if(f === passiMax - 1){
      if(giu){ Touch5.chiudi(idL, false); giu = false; }
      if(giuB){ Touch5.chiudi(idB, false); giuB = false; }
    }
    t.simulate(1/60); f++;
  }
  return { passi:f, duelli:duelli };
})`;

/* ---------------------------------------------------------- la pagina */
async function apri(browser, porta) {
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, hasTouch: true, locale: 'it-IT' });
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

/* L'APPARECCHIO COMUNE ALLE DUE MANI. Registrazione e rigiocata devono
   chiamare LA STESSA startMatch con LE STESSE opzioni, se no il cancello
   di K=0 fallisce per una ragione che non ha niente a che fare col
   ritardo. Le opzioni sono quelle della sfida vera (Sfida.gioca,
   CALCETTO-il-gioco.html:44504-44520): gabbia e mira guidata piena,
   perche' due telefoni non abbiano due motori. */
const APPARECCHIO = `function(t, taglia){
  t.startMatch(1, 1, { size: taglia, sponde: 'gabbia', miraGuidata: 'pieno' });
}`;

/* registra UN nastro onesto */
async function registra(pag, seme, taglia, tetto) {
  return pag.evaluate(([seme, taglia, tetto, COP, APP, IMPR, MIS]) => {
    const t = window.__test;
    t.semina(seme);
    t.registra();
    new Function('return ' + APP)()(t, taglia);
    const r = new Function('return ' + COP)()(tetto);
    const nastro = t.nastro();
    const imp = new Function('return ' + IMPR);
    const mis = new Function('return ' + MIS)();
    t.fermaRegistro();
    return { nastro: nastro, passi: r.passi, duelli: r.duelli,
             righe: t.registroRighe, impronta: imp(), misura: mis(), scena: t.state };
  }, [seme, taglia, tetto, COPIONE, APPARECCHIO, IMPRONTA, MISURA]);
}

/* =====================================================================
   IL CENSIMENTO DELLE RIGHE, PRIMA E DOPO LA TRASLAZIONE.

   Serve alla prova 0a. Non misura il gioco: misura il BANCO, e chiede
   alla traslazione di rispettare il contratto scritto nella spec —
   comandi sul tick, dischetto sul passo, metadati fermi. Una traslazione
   che «trasla» spostando righe che nessuno legge muove dei numeri e non
   ritarda niente, e senza questa prova passerebbe per buona.
   ===================================================================== */
async function censisci(pag, nastro, K, trasla) {
  return pag.evaluate(([nastro, K, TRA]) => {
    const t = window.__test;
    t.rigioca(nastro);
    const prima = Reg.righe.map(r => [r[1], r[0], r.length > 4 ? (r[4] | 0) : 0]);
    new Function('return ' + TRA)()(Reg.righe, K);
    const dopo = Reg.righe.map(r => [r[1], r[0], r.length > 4 ? (r[4] | 0) : 0]);
    t.fermaRegistro();
    return { prima, dopo };
  }, [nastro, K, trasla]);
}

/* rigioca UN nastro traslato di K, campionando impronta e comando voluto.
   `vuota` toglie OGNI comando dal nastro: e' il controllo negativo. */
async function rigioca(pag, nastro, seme, taglia, K, tetto, trasla, misura, vuota) {
  return pag.evaluate(([nastro, seme, taglia, K, tetto, TRA, APP, IMPR, MIS, vuota]) => {
    const t = window.__test;
    t.rigioca(nastro);                        /* Reg.deserializza: modo 2, tick 0 */
    if (vuota) {
      /* IL CONTROLLO NEGATIVO: restano solo i metadati (le due rose, lo
         schermo). La squadra comandata non riceve un comando in tutta la
         partita, e deve andare MOLTO peggio. Un metro che non sa
         distinguere «con le dita» da «senza dita» non sta guardando la
         squadra comandata, e allora nessun numero che stampa significa
         quel che dice. */
      Reg.righe = Reg.righe.filter(r => r[1] === 7 || r[1] === 10);
    }
    new Function('return ' + TRA)()(Reg.righe, K);
    /* L'ELENCO DEL DISCHETTO SI RICOSTRUISCE DOPO LA TRASLAZIONE, se no
       `Reg.duelli` tiene ancora i riferimenti giusti ma `Reg.iDuello`
       riparte da dove l'aveva lasciato la deserializzazione. */
    Reg.duelli = Reg.righe.filter(r => r[1] === 6);
    Reg.iDuello = 0;
    t.semina(seme);
    new Function('return ' + APP)()(t, taglia);
    const imp = new Function('return ' + IMPR);
    const mis = new Function('return ' + MIS)();
    const impronte = [], voluto = [], corsa = [];
    let passi = 0, px = 0, py = 0, primo = true;
    while (passi < tetto) {
      if (t.state === 'end') break;
      if (t.state === 'freekick') Duel.update(1 / 60);
      else step();
      passi++;
      const c = G.ctrl ? G.ctrl[0] : -1;
      const p = (c >= 0 && G.players[c]) ? G.players[c] : null;
      /* LA CORSA EFFETTIVA e' lo spostamento vero fra due tick: non si
         legge un campo di velocita' (che non c'e' per tutti i rami) e
         non si crede a quel che il comando CHIEDE — si guarda dove
         l'uomo e' andato davvero. */
      if (p && !primo) corsa.push([p.x - px, p.y - py]); else corsa.push([0, 0]);
      if (p) { px = p.x; py = p.y; primo = false; } else primo = true;
      /* IL COMANDO CHE IL GIOCO LEGGE ADESSO dalla levetta: a K=0 e'
         quel che il giocatore voleva a questo tick, ed e' la serie con
         cui si misura la fedelta' di tutte le altre corse. */
      const hm = (typeof humanMove === 'function') ? humanMove(0) : [0, 0];
      voluto.push([hm[0], hm[1]]);
      if (passi % 30 === 0) impronte.push(imp());
    }
    return { passi, impronte, voluto, corsa, misura: mis(), scena: t.state,
             righe: t.registroRighe };
  }, [nastro, seme, taglia, K, tetto, trasla, APPARECCHIO, IMPRONTA, misura, !!vuota]);
}

/* =====================================================================
   LA FEDELTA' — «quanti tick il comandato fa quel che gli e' stato
   chiesto».

   Si confronta la CORSA EFFETTIVA del comandato al tick T (lo
   spostamento vero, non il comando) con la direzione CHIESTA a quel
   tick, che e' `voluto[T]` della corsa a K=0. Si contano solo i tick in
   cui un comando c'era davvero (modulo sopra la zona morta) e in cui
   l'uomo si stava muovendo: un uomo fermo perche' sta subendo un
   contrasto non e' infedelta', e' calcio.

   A K=0 la fedelta' NON vale 1: inerzia, urti e possesso di palla
   storcono la corsa anche senza ritardo. Ed e' giusto cosi' — il numero
   che conta e' il CALO rispetto a K=0, non il valore assoluto.
   ===================================================================== */
function fedelta(voluto0, corsa) {
  let n = 0, ok = 0;
  const m = Math.min(voluto0.length, corsa.length);
  for (let i = 0; i < m; i++) {
    const v = voluto0[i], c = corsa[i];
    const lv = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    const lc = Math.sqrt(c[0] * c[0] + c[1] * c[1]);
    if (lv < 0.2 || lc < 0.02) continue;
    n++;
    if ((v[0] * c[0] + v[1] * c[1]) / (lv * lc) > 0.7) ok++;
  }
  return n ? { q: ok / n, n } : { q: NaN, n: 0 };
}

const mediana = a => { const b = a.slice().sort((x, y) => x - y); const n = b.length;
                       return n ? (n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2) : NaN; };
const media = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN;
const scarto = a => { if (a.length < 2) return 0; const m = media(a);
                      return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1)); };
const primoScarto = (a, b) => { const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n; };

(async () => {
  let bugia = null;
  if (bugiaFile) {
    bugia = require(path.resolve(RADICE, bugiaFile));
    console.log('*** BANCO BUGIARDO IN CORSO: ' + bugia.nome + ' — ' + bugia.descrizione);
    console.log('*** (questo NON e\' il banco onesto: serve a provare che il banco onesto morde)\n');
  }
  const TRA = (bugia && bugia.traslazione) || TRASLA;
  const MIS = (bugia && bugia.misura) || MISURA;

  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  const srv = await servi(prova);
  let browser = null;
  try {
    browser = await chromium.launch();
    /* PIU' PAGINE, NON PIU' MOTORI. Venti nastri per sette K su partite
       intere sono novecentomila tick, cioe' venti minuti su una pagina
       sola: un banco che nessuno rilancia non e' un cancello. Le pagine
       sono INDIPENDENTI (ognuna ha il suo gioco, il suo SEME, il suo
       registro) e ogni nastro fa TUTTI i suoi K sulla STESSA pagina, se
       no il confronto a K=0 attraverserebbe due stati diversi.
       Restano tutte dentro un solo chromium: qui non si misura il
       motore — quello e' _q-motori.js, e lo misura con motori veri. */
    const PAGINE = Math.max(1, Math.min(8, parseInt(arg('pagine', '4'), 10) || 4));
    const pagine = [];
    for (let i = 0; i < PAGINE; i++) pagine.push(await apri(browser, srv.porta));
    const pag = pagine[0].pag;
    const errori = [];
    for (const p of pagine) errori.push(...p.errori);

    console.log('=== IL METRO DEL RITARDO — gamba A, il nastro traslato ===');
    console.log('    ' + NASTRI + ' nastri onesti a taglia ' + TAGLIA + ', tetto ' + TETTO + ' tick (' +
                (TETTO / 60).toFixed(0) + ' s), K = ' + KS.join(', ') + ' tick');
    console.log('    ATTENZIONE: questo banco misura il CASO PEGGIORE — il giocatore che NON si');
    console.log('    adatta. E\' un LIMITE SUPERIORE al danno, non l\'esperienza umana (gamba C).\n');

    /* ---------------------------------------------------- i nastri */
    console.log('1) I NASTRI — si registrano col copione fisso di _q-sfida.js (tutti i verbi)');
    const nastri = new Array(NASTRI);
    await Promise.all(pagine.map(async (P, j) => {
      for (let i = j; i < NASTRI; i += PAGINE) {
        const seme = (SEME0 + i) >>> 0;
        const r = await registra(P.pag, seme, TAGLIA, TETTO);
        nastri[i] = { seme, pagina: j, ...r };
      }
    }));
    const righeTot = nastri.reduce((s, n) => s + n.righe, 0);
    const conDuello = nastri.filter(n => n.duelli > 0).length;
    console.log('   ' + nastri.length + ' nastri, ' + righeTot + ' righe in tutto (media ' +
                Math.round(righeTot / nastri.length) + '), ' + conDuello + ' col dischetto, ' +
                'punteggi ' + nastri.map(n => n.misura.gol.join('-')).join(' ') + '\n');
    if (righeTot < 100 * nastri.length) {
      console.log('PROVA NULLA: i nastri sono quasi vuoti, il copione non ha registrato niente.');
      throw Object.assign(new Error('nastri vuoti'), { codice: 3, gia: true });
    }

    /* =====================================================================
       LE TRE PROVE CHE GUARDANO IL BANCO, NON IL GIOCO.

       Stanno PRIMA della misura perche' un metro storto non va
       riconosciuto dai suoi numeri: va riconosciuto prima di stamparli.
       Sono i tre modi in cui questo banco puo' mentire, e ognuna ha un
       falso costruito apposta in _q-ritardo-falsi.js che la deve far
       scattare.
       ===================================================================== */
    const Kg = KS[KS.length - 1];
    console.log('2) IL BANCO E\' UN BANCO? — tre prove sul metro, prima di guardare il gioco\n');

    /* --- 0a: la traslazione trasla davvero --- */
    const cen = await censisci(pag, nastri[0].nastro, Kg, TRA);
    let guasti = [], comandiMossi = 0, duelliMossi = 0, metaFermi = true;
    for (let i = 0; i < cen.prima.length; i++) {
      const a = cen.prima[i], b = cen.dopo[i];
      if (!b) { guasti.push('la traslazione ha cambiato il numero di righe'); break; }
      const tipo = a[0];
      if (tipo === 0 || tipo === 1 || tipo === 2 || tipo === 3 || tipo === 4 || tipo === 8) {
        if (b[1] - a[1] !== Kg) guasti.push('riga di comando (tipo ' + tipo + ') mossa di ' + (b[1] - a[1]) + ' invece di ' + Kg);
        else comandiMossi++;
      } else if (tipo === 6) {
        if (b[2] - a[2] !== Kg) guasti.push('riga del dischetto mossa sul passo di ' + (b[2] - a[2]) + ' invece di ' + Kg);
        else duelliMossi++;
      } else {
        if (b[1] !== a[1]) { metaFermi = false; guasti.push('metadato (tipo ' + tipo + ') mosso di ' + (b[1] - a[1]) + ': ritardare un metadato non ritarda un comando, cambia la partita'); }
      }
      if (guasti.length > 3) break;
    }
    const okTrasla = !guasti.length && comandiMossi > 50;
    console.log('   ' + (okTrasla ? 'OK  ' : 'NO  ') + '0a) LA TRASLAZIONE TRASLA DAVVERO a K=' + Kg +
                '  [' + comandiMossi + ' comandi e ' + duelliMossi + ' righe di dischetto mossi di ' + Kg +
                ', metadati ' + (metaFermi ? 'fermi' : 'MOSSI') + ']');
    for (const g of guasti.slice(0, 3)) console.log('        ' + g);
    if (!okTrasla) {
      console.log('\n   Una traslazione che non trasla i comandi non ritarda niente: muove numeri.');
      throw Object.assign(new Error('traslazione sorda'), { codice: 2, gia: true });
    }

    /* --- 0b: il metro varia fra partite diverse --- */
    const baseMis = [];
    for (const n of nastri) baseMis.push(n.misura);
    const distGol = new Set(baseMis.map(m => m.gol[0])).size;
    const distSp = new Set(baseMis.map(m => m.specchio[0])).size;
    const distTiri = new Set(baseMis.map(m => m.tiri[0])).size;
    const okVaria = (distGol + distSp + distTiri) >= 5;
    console.log('   ' + (okVaria ? 'OK  ' : 'NO  ') + '0b) IL METRO VARIA fra ' + nastri.length +
                ' partite diverse  [valori distinti: gol ' + distGol + ', specchio ' + distSp + ', tiri ' + distTiri + ']');
    if (!okVaria) {
      console.log('\n   Un metro che da\' lo stesso numero su venti partite diverse non sta guardando');
      console.log('   le partite: sta recitando. Non si stampa niente di quel che ha da dire.');
      throw Object.assign(new Error('metro costante'), { codice: 2, gia: true });
    }

    /* --- 0c: il controllo negativo --- */
    let golPieno = 0, golVuoto = 0, spPieno = 0, spVuoto = 0;
    const quanti = Math.min(nastri.length, PAGINE * 2);
    await Promise.all(pagine.map(async (P, j) => {
      for (let i = j; i < quanti; i += PAGINE) {
        const n = nastri[i];
        const v = await rigioca(P.pag, n.nastro, n.seme, TAGLIA, 0, TETTO, TRA, MIS, true);
        golPieno += n.misura.gol[0]; spPieno += n.misura.specchio[0];
        golVuoto += v.misura.gol[0]; spVuoto += v.misura.specchio[0];
      }
    }));
    const okControllo = (spVuoto < spPieno) || (golVuoto < golPieno);
    console.log('   ' + (okControllo ? 'OK  ' : 'NO  ') + '0c) IL CONTROLLO NEGATIVO: senza NESSUN comando la squadra comandata va peggio' +
                '  [su ' + quanti + ' nastri: gol ' + golPieno + ' -> ' + golVuoto + ', specchio ' + spPieno + ' -> ' + spVuoto + ']');
    if (!okControllo) {
      console.log('\n   Se togliere TUTTE le dita non peggiora i numeri della squadra comandata,');
      console.log('   quei numeri non sono della squadra comandata. Il metro guarda altrove — e');
      console.log('   un ritardo, che e\' un danno molto piu\' piccolo, non lo vedrebbe mai.');
      throw Object.assign(new Error('controllo negativo muto'), { codice: 2, gia: true });
    }

    /* ------------------------------------------------- le sette corse */
    console.log('\n3) LE CORSE — ogni nastro rigiocato a ogni K\n');
    const perK = {};
    for (const K of KS) perK[K] = { gol: [], golSub: [], tiri: [], specchio: [], poss: [], rubate: [], fed: [], scarti: [] };
    let k0rotti = 0, k0dove = [];

    await Promise.all(pagine.map(async (P, j) => {
    for (let ii = j; ii < nastri.length; ii += PAGINE) {
      const n = nastri[ii];
      let voluto0 = null, imp0 = null;
      for (const K of KS) {
        const r = await rigioca(P.pag, n.nastro, n.seme, TAGLIA, K, TETTO, TRA, MIS);
        if (K === 0) {
          voluto0 = r.voluto; imp0 = r.impronte;
          /* IL CANCELLO CHE DICE SE IL BANCO E' UN BANCO: a K=0 la
             rigiocata deve essere la registrazione, punteggio e stato.
             Non si confrontano le impronte fra registrazione e rigiocata
             (la registrazione non ne raccoglie una serie): si confronta
             il PUNTEGGIO e la misura, che e' cio' su cui poggia tutto il
             resto del banco. */
          const uguale = r.misura.gol[0] === n.misura.gol[0] && r.misura.gol[1] === n.misura.gol[1] &&
                         r.misura.tiri[0] === n.misura.tiri[0] && r.misura.specchio[0] === n.misura.specchio[0];
          if (!uguale) { k0rotti++; k0dove.push('seme ' + n.seme + ': registrato ' +
            n.misura.gol.join('-') + '/' + n.misura.tiri[0] + 't/' + n.misura.specchio[0] + 's, rigiocato ' +
            r.misura.gol.join('-') + '/' + r.misura.tiri[0] + 't/' + r.misura.specchio[0] + 's'); }
        }
        const f = fedelta(voluto0 || r.voluto, r.corsa);
        const Q = perK[K];
        Q.gol.push(r.misura.gol[0]); Q.golSub.push(r.misura.gol[1]);
        Q.tiri.push(r.misura.tiri[0]); Q.specchio.push(r.misura.specchio[0]);
        const pt = r.misura.possesso[0] + r.misura.possesso[1];
        Q.poss.push(pt ? r.misura.possesso[0] / pt : 0);
        Q.rubate.push(r.misura.rubate[0]);
        Q.fed.push(f.q);
        if (imp0 && K > 0) Q.scarti.push(primoScarto(imp0, r.impronte));
      }
    }
    }));

    /* ----------------------------------------- il primo cancello rosso */
    if (k0rotti) {
      console.log('IL BANCO NON RIPRODUCE IL NASTRO A K=0 — ' + k0rotti + ' nastri su ' + nastri.length + ':');
      for (const d of k0dove.slice(0, 5)) console.log('   ' + d);
      console.log('\nQuando la rigiocata a ritardo ZERO non e\' la registrazione, ogni numero che');
      console.log('questo banco stampa e\' il proprio errore di rigiocata, non il ritardo. Non');
      console.log('si accusa il gioco: si ripara il banco.');
      throw Object.assign(new Error('K=0 non riproduce'), { codice: 2, gia: true });
    }
    console.log('   OK  a K=0 tutti e ' + nastri.length + ' i nastri si riproducono esatti (punteggio, tiri, specchio)');

    /* =====================================================================
       LA TAVOLA, COL SUO ERRORE. E QUESTO BLOCCO E' UNA REGOLA DI CASA
       MESSA IN CODICE: «un numero con la dispersione fuori soglia non si
       trascrive da nessuna parte».

       MISURATO il 23 settembre 2026, prima corsa piena a 24 nastri: la
       media dei gol della squadra comandata vale 1,00 con scarto tipo
       0,88. L'errore della MEDIA e' 0,88/sqrt(24) = 0,18, cioe' il 18%
       della media. Una soglia sul 25% e' appena fuori da quel rumore:
       la stessa misura rifatta con altri ventiquattro semi puo' dare
       «danno 8%» o «danno 40%» senza che il gioco sia cambiato di un bit.

       Quindi questo banco NON dice piu' «tenuta / non tenuta» su un
       numero solo: dice il danno CON IL SUO INTERVALLO, e quando
       l'intervallo scavalca la soglia dichiara che la misura NON DECIDE
       e stampa quanti nastri servirebbero. Un banco che pronunciasse un
       verdetto dentro il rumore non sarebbe severo ne' generoso: sarebbe
       un generatore di numeri casuali con l'aria seria.
       ===================================================================== */
    console.log('\n4) LA CURVA DEL DANNO — media +- errore della media, su ' + nastri.length + ' nastri\n');
    const r2 = x => (Number.isFinite(x) ? x.toFixed(2) : '—');
    const r3 = x => (Number.isFinite(x) ? x.toFixed(3) : '—');
    const es = a => (a.length > 1 ? scarto(a) / Math.sqrt(a.length) : 0);   /* errore della media */
    console.log('     K   ms |        gol |   specchio |      tiri | possesso | fedelta | 1o scarto');
    console.log('   -------------------------------------------------------------------------------');
    const base = perK[0];
    for (const K of KS) {
      const P = perK[K];
      const sc = P.scarti.length ? Math.round(media(P.scarti) * 30) : 0;
      console.log('   ' + String(K).padStart(4) + String(Math.round(K * 1000 / 60)).padStart(5) + ' | ' +
        (r2(media(P.gol)) + '+-' + r2(es(P.gol))).padStart(11) + ' | ' +
        (r2(media(P.specchio)) + '+-' + r2(es(P.specchio))).padStart(10) + ' | ' +
        (r2(media(P.tiri)) + '+-' + r2(es(P.tiri))).padStart(9) + ' | ' +
        (r3(media(P.poss))).padStart(8) + ' | ' +
        (r3(media(P.fed))).padStart(7) + ' | ' +
        (K ? 'tick ' + sc : '—').padStart(9));
    }

    /* ------------------------------- il secondo cancello rosso: c'e' danno? */
    const Kmax = KS[KS.length - 1];
    const Pmax = perK[Kmax];
    const golBase = media(base.gol), golMax = media(Pmax.gol);
    const spBase = media(base.specchio), spMax = media(Pmax.specchio);
    const fedBase = media(base.fed), fedMax = media(Pmax.fed);
    const scMedio = Pmax.scarti.length ? media(Pmax.scarti) : 1e9;
    const danno = (b, x) => (b > 0 ? (b - x) / b : (x > 0 ? -1 : 0));

    console.log('\n5) IL BANCO VEDE IL RITARDO? — a K=' + Kmax + ' (' + Math.round(Kmax * 1000 / 60) + ' ms)');
    const vedeStato = scMedio < 30;             /* l'impronta si stacca entro 15 s di gioco */
    const vedeFed = Number.isFinite(fedBase) && Number.isFinite(fedMax) && (fedBase - fedMax) > 0.02;
    const vedeGioco = danno(golBase, golMax) > 0.05 || danno(spBase, spMax) > 0.05;
    console.log('   ' + (vedeStato ? 'OK  ' : 'NO  ') + 'la partita si stacca presto: primo scarto medio al campione ' +
                (Number.isFinite(scMedio) ? scMedio.toFixed(1) : '—') + ' (tick ' + Math.round(scMedio * 30) + ')');
    console.log('   ' + (vedeFed ? 'OK  ' : 'NO  ') + 'la fedelta\' cala: ' + r3(fedBase) + ' -> ' + r3(fedMax) +
                ' (' + ((fedBase - fedMax) * 100).toFixed(1) + ' punti)');
    console.log('   ' + (vedeGioco ? 'OK  ' : 'NO  ') + 'il gioco peggiora: gol ' + r2(golBase) + ' -> ' + r2(golMax) +
                ' (' + (danno(golBase, golMax) * 100).toFixed(0) + '%), specchio ' + r2(spBase) + ' -> ' + r2(spMax) +
                ' (' + (danno(spBase, spMax) * 100).toFixed(0) + '%)');

    if (!(vedeStato && vedeFed)) {
      console.log('\nPROVA NULLA: a ' + Math.round(Kmax * 1000 / 60) + ' ms di ritardo questo banco non vede');
      console.log('niente. Un banco che non si accorge di mezzo secondo ATTESTA invece di misurare,');
      console.log('ed e\' peggio di nessun banco. Non si accusa il gioco: la traslazione non trasla.');
      throw Object.assign(new Error('nessun danno a K max'), { codice: 3, gia: true });
    }

    /* =====================================================================
       IL CANCELLO DELLA PROVA NULLA, E QUESTA RIGA E' COSTATA UN VERDE
       FALSO (23 settembre 2026, prima corsa di questo strumento).

       La prima versione girava su 3 nastri da 15 secondi. A K=0 la
       squadra comandata aveva fatto ZERO gol e ZERO tiri nello specchio;
       a K=18 pure. Il peggioramento risultava «0,0%», sotto la soglia
       del 25%, e il banco stampava SOGLIA-DANNO TENUTA — cioe' un SI
       all'intera onda E — misurando il nulla.

       Il venticinque per cento di zero e' zero. Una soglia su una misura
       che non ha eventi non e' severa e non e' generosa: non c'e'.
       Quindi PRIMA di applicare la soglia si chiede al campione se ha
       qualcosa da dire, e se non ce l'ha si esce 3 (PROVA NULLA), che in
       questa casa non accusa nessuno — ne' il gioco ne' il banco: dice
       «rifare la misura piu' lunga o con piu' nastri».

       I due minimi: almeno 20 tiri nello specchio e almeno 8 gol della
       squadra comandata, sommati su TUTTI i nastri a K=0. Sotto quei
       numeri un peggioramento del 25% sarebbe meno di cinque tiri e meno
       di due gol, cioe' dentro il rumore di un motore caotico.
       ===================================================================== */
    const totSp = base.specchio.reduce((s, x) => s + x, 0);
    const totGol = base.gol.reduce((s, x) => s + x, 0);
    console.log('\n   base a K=0: ' + totGol + ' gol e ' + totSp + ' tiri nello specchio in tutto');

    if (SOLO_BANCO) {
      const err0 = errori.slice();
      await browser.close(); browser = null;
      srv.chiudi();
      if (err0.length) { console.error('\nECCEZIONI DI PAGINA: ' + err0.slice(0, 3).join(' | ')); process.exit(2); }
      console.log('\n>>> LA MACCHINA REGGE: la traslazione trasla, il metro varia, il controllo');
      console.log('    negativo morde, a K=0 il nastro si riproduce esatto e a ' +
                  Math.round(Kmax * 1000 / 60) + ' ms il ritardo si VEDE.');
      console.log('    La SOGLIA-DANNO NON e\' stata applicata (--solo-banco): il verdetto vuole');
      console.log('    centoventi nastri da novanta secondi, e sta nel verbale del #141.');
      console.log('    `node strumenti/_q-ritardo.js --nastri 120 --tetto 5400 --pagine 8`');
      process.exit(0);
    }

    if (totSp < 20 || totGol < 8) {
      console.log('\nPROVA NULLA: il campione non ha abbastanza eventi perche\' una soglia sul 25%');
      console.log('voglia dire qualcosa (servono >= 20 tiri nello specchio e >= 8 gol a K=0, ce ne');
      console.log('sono ' + totSp + ' e ' + totGol + '). Il venticinque per cento di zero e\' zero, e un banco che');
      console.log('lo chiamasse «soglia tenuta» attesterebbe invece di misurare. Rifare con piu\'');
      console.log('nastri o con un tetto piu\' lungo: --nastri 20 --tetto 5400.');
      throw Object.assign(new Error('campione senza eventi'), { codice: 3, gia: true });
    }

    /* =====================================================================
       IL DANNO CON IL SUO INTERVALLO.

       danno = (m0 - mK)/m0. L'errore si propaga sulla differenza fra due
       medie indipendenti — le due corse sono sugli STESSI nastri ma con
       stati diversi dal primo tick, quindi l'appaiamento non aiuta e si
       usa la forma prudente:  se(d) = sqrt(se0^2 + seK^2) / m0.
       L'estremo alto e' d + 1,96*se(d): e' quello che si confronta con la
       soglia, perche' la domanda e' «puo' essere peggio del 25%?».
       ===================================================================== */
    const conIntervallo = (a0, aK) => {
      const m0 = media(a0), mK = media(aK);
      const s0 = es(a0), sK = es(aK);
      if (!(m0 > 0)) return { d: NaN, se: NaN, alto: NaN, m0, mK };
      const d = (m0 - mK) / m0;
      const se = Math.sqrt(s0 * s0 + sK * sK) / m0;
      return { d, se, alto: d + 1.96 * se, m0, mK };
    };

    const D = KS.includes(D_DICHIARATA) ? D_DICHIARATA : KS[KS.length - 1];
    const PD = perK[D];
    const cG = conIntervallo(base.gol, PD.gol);
    const cS = conIntervallo(base.specchio, PD.specchio);
    console.log('\n6) SOGLIA-DANNO alla D dichiarata (D = ' + D + ' tick = ' + Math.round(D * 1000 / 60) + ' ms)');
    console.log('   dichiarata il 23 settembre 2026 nella spec, PRIMA di questa corsa:');
    console.log('   «peggioramento di gol e tiri nello specchio non superiore al 25%»\n');
    const pc = x => (Number.isFinite(x) ? (x * 100).toFixed(1) + '%' : '—');
    const riga = (nome, c) => '   ' + nome.padEnd(28) + r2(c.m0) + ' -> ' + r2(c.mK) +
      '   danno ' + pc(c.d) + ' +- ' + pc(1.96 * c.se) + '  (estremo alto ' + pc(c.alto) + ')';
    console.log(riga('gol della squadra comandata:', cG));
    console.log(riga('tiri nello specchio:', cS));

    /* IL CANCELLO CHE RIFIUTA DI PRONUNCIARSI DENTRO IL RUMORE. Se a
       danno ZERO l'estremo alto e' gia' sopra la soglia, questa misura
       non puo' dire ne' si ne' no: qualunque verdetto sarebbe un sorteggio
       con l'aria seria. Si dice quanti nastri servirebbero e si esce 3. */
    const risolve = c => Number.isFinite(c.se) && (1.96 * c.se) < SOGLIA_DANNO;
    const nServe = c => Math.ceil(nastri.length * Math.pow(1.96 * c.se / SOGLIA_DANNO, 2));
    if (!risolve(cG) || !risolve(cS)) {
      console.log('\nPROVA NULLA: l\'errore della misura (+-' + pc(1.96 * Math.max(cG.se, cS.se)) +
                  ') e\' piu\' grande della soglia (' + pc(SOGLIA_DANNO) + ').');
      console.log('Con questa dispersione la stessa misura, rifatta con altri ' + nastri.length + ' semi, puo\'');
      console.log('dare un danno dell\'otto o del quaranta per cento senza che il gioco sia cambiato');
      console.log('di un bit. Un verdetto qui sarebbe un sorteggio con l\'aria seria, e in questa');
      console.log('casa un numero con la dispersione fuori soglia non si trascrive da nessuna parte.');
      console.log('SERVONO ALMENO ' + Math.max(nServe(cG), nServe(cS)) + ' NASTRI: --nastri ' +
                  Math.max(nServe(cG), nServe(cS)) + ' --tetto ' + TETTO + '.');
      throw Object.assign(new Error('effetto dentro il rumore'), { codice: 3, gia: true });
    }

    const okGol = cG.alto <= SOGLIA_DANNO, okSp = cS.alto <= SOGLIA_DANNO;

    /* D_gioco: il K piu' grande per cui TUTTI i K precedenti tengono la
       soglia con l'estremo alto. Si guarda l'estremo alto e non la media
       perche' la domanda del committente e' «puo' essere peggio?», e
       perche' una curva rumorosa che scende e risale — e questa lo fa —
       regalerebbe un D piu' grande a chi legge solo le medie. */
    let Dgioco = -1;
    for (const K of KS) {
      const g = conIntervallo(base.gol, perK[K].gol);
      const s = conIntervallo(base.specchio, perK[K].specchio);
      if (g.alto <= SOGLIA_DANNO && s.alto <= SOGLIA_DANNO) Dgioco = K; else break;
    }
    console.log('\n   D_gioco MISURATO (il K piu\' grande che tiene la soglia, estremo alto): ' +
                (Dgioco < 0 ? 'nessuno' : Dgioco + ' tick = ' + Math.round(Dgioco * 1000 / 60) + ' ms'));
    console.log('   D richiesta dalla SOGLIA-D: ' + D_DICHIARATA + ' tick = ' +
                Math.round(D_DICHIARATA * 1000 / 60) + ' ms');

    /* =====================================================================
       LA FORMA DELLA CURVA, e qui c'e' la cosa piu' utile che questo
       banco sappia dire — piu' utile del si/no sulla soglia.

       La soglia chiede «il danno a D e' sotto il 25%?». Ma un danno che
       CRESCE con K e uno che non cresce portano due architetture diverse,
       e la differenza e' visibile con molti meno nastri di quanti ne
       servano a decidere il 25%: si confrontano due medie, non una media
       con una soglia.

       Se il danno al primo K>0 e' gia' indistinguibile da quello
       all'ultimo, allora il costo del ritardo si paga TUTTO al primo
       passo — il nastro smette di sapere dove sta la palla, e non
       importa piu' di quanto — e scegliere D fra il primo e l'ultimo e'
       QUASI GRATIS. Per un lockstep e' la notizia piu' importante che
       esista: il margine contro il jitter si compra senza pagarlo in
       gioco.
       ===================================================================== */
    const K1 = KS.find(k => k > 0);
    if (K1 !== undefined && Kmax > K1) {
      console.log('\n7) LA FORMA DELLA CURVA — il danno CRESCE con K, o si paga tutto al primo passo?\n');
      const forma = (nome, a0, aA, aB) => {
        const cA = conIntervallo(a0, aA), cB = conIntervallo(a0, aB);
        const mA = media(aA), mB = media(aB);
        const seD = Math.sqrt(es(aA) * es(aA) + es(aB) * es(aB));
        const diff = mA - mB;
        const cresce = Math.abs(diff) > 1.96 * seD;
        console.log('   ' + nome.padEnd(12) + 'danno a K=' + K1 + ': ' + pc(cA.d) +
          '   danno a K=' + Kmax + ': ' + pc(cB.d) +
          '   scarto fra i due ' + r2(Math.abs(diff)) + ' +- ' + r2(1.96 * seD) +
          '  -> ' + (cresce ? 'CRESCE' : 'NON distinguibili'));
        return cresce;
      };
      const cresceG = forma('gol', base.gol, perK[K1].gol, perK[Kmax].gol);
      const cresceS = forma('specchio', base.specchio, perK[K1].specchio, perK[Kmax].specchio);
      if (!cresceG && !cresceS) {
        console.log('\n   IL DANNO NON CRESCE CON K. Si paga tutto al primo passo: a ' +
                    Math.round(K1 * 1000 / 60) + ' ms il nastro');
        console.log('   ha gia\' smesso di sapere dove sta la palla, e ritardarlo ancora non peggiora');
        console.log('   niente di misurabile. Per il lockstep e\' la notizia buona: scegliere D fra ' +
                    K1 + ' e ' + Kmax);
        console.log('   tick costa QUASI NIENTE in gioco, quindi il margine contro il jitter si puo\'');
        console.log('   comprare senza pagarlo. E porta con se\' la notizia cattiva: non esiste un D');
        console.log('   piccolo che eviti il danno — o si accetta il gradino, o non c\'e\' nessun K>0.');
        console.log('   (La fedelta\' invece CALA con K, ' + r3(media(perK[K1].fed)) + ' -> ' +
                    r3(media(perK[Kmax].fed)) + ': il comandato smette davvero di');
        console.log('   fare quel che gli si chiede. Il gioco lo assorbe; la persona forse no — gamba C.)');
      } else {
        console.log('\n   IL DANNO CRESCE CON K: allora esiste un D che vale piu\' di un altro, e');
        console.log('   sceglierlo e\' una decisione vera e non una formalita\'.');
      }
    }

    const errori2 = errori.slice();
    await browser.close(); browser = null;
    srv.chiudi();
    if (errori2.length) { console.error('\nECCEZIONI DI PAGINA: ' + errori2.slice(0, 3).join(' | ')); process.exit(2); }

    if (okGol && okSp && Dgioco >= D_DICHIARATA) {
      console.log('\n>>> SOGLIA-DANNO TENUTA a D = ' + D + ' tick. Per la gamba A il lockstep e\' AMMESSO');
      console.log('    fino a ' + Dgioco + ' tick (' + Math.round(Dgioco * 1000 / 60) + ' ms). Restano la gamba B (i verbi), la');
      console.log('    gamba C (l\'uomo) e il #143 (la rete): una gamba sola non fa un verdetto.');
      process.exit(0);
    }
    console.log('\n>>> SOGLIA-DANNO NON TENUTA alla D dichiarata. E\' un NO, ed e\' un esito legittimo:');
    console.log('    al caso peggiore il danno a ' + Math.round(D * 1000 / 60) + ' ms puo\' arrivare al ' +
                pc(Math.max(cG.alto, cS.alto)) + ', sopra il 25%.');
    console.log('    Prima di portarlo al committente si ricordi che questo e\' un LIMITE SUPERIORE:');
    console.log('    la gamba C misura quanto di questo danno un umano che si adatta si riprende.');
    process.exit(1);
  } catch (e) {
    if (browser) { try { await browser.close(); } catch (x) {} }
    try { srv.chiudi(); } catch (x) {}
    if (!e.gia) console.error('\nFALLITO (banco): ' + e.message);
    process.exit(e.codice || 2);
  }
})();
