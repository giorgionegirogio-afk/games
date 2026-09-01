# La pulsantiera che non mente — piano di esecuzione

> **Per chi esegue:** SOTTO-SKILL RICHIESTA: usare `superpowers:subagent-driven-development` (consigliata) oppure `superpowers:executing-plans` per eseguire il piano un compito alla volta. I passi usano caselle (`- [ ]`) per il tracciamento.

**Obiettivo:** la faccia dei dischi smette di dipendere dalla geometria e dipende dal possesso, così TIRA resta premibile mentre una palla nostra vola (armando il tiro al volo che il motore sa già fare) e in difesa i tasti smettono di cambiare mestiere sei volte in sei secondi.

**Architettura:** nessuna funzione nuova nell'ingresso, nessun nome nuovo dentro `touchBtnLayout`. Si cambia **che cosa rispondono** le quattro capacità già esistenti (`puoTirare`, `puoPassare`), che `touchBtnLayout` già chiama, usando `squadraDelPallone()` — funzione pura, già in casa dalla voce #82, e **già coperta** dall'estrazione di `_q-precedenza`. Ai dischi si aggiunge un campo dato (`off`) per la cella spenta: un campo non è un nome di funzione e non tocca la rete di estrazione del banco.

**Tecnologia:** un solo file HTML (`CALCETTO-il-gioco.html`, ~42.000 righe), banchi in `strumenti/*.js` con Node e Playwright, attrezzi a àncore testuali (`_t-*.js`) che si applicano con `--dentro`.

## Vincoli globali

- **Legge dei sorteggi:** zero chiamate nuove a `dado()`. Nei percorsi a seme fisso macchina-contro-macchina il conto deve restare identico al bit (`_q-determinismo`, `_c3-sorteggi`, `_crit3-mira-sorteggi`, `_crit4-sorteggi`, `_crit10-sorteggi` verdi).
- **`_q-precedenza` ricostruisce l'ingresso:** estrae `touchBtnLayout` e le funzioni che chiama dal file e le esegue fuori dal gioco. Ogni nome nuovo **chiamato** da quelle funzioni deve essere una funzione di primo livello sotto i 2.000 caratteri. *Dopo ogni modifica alle capacità si rilancia quel banco, prima di dichiarare finito il passo.*
- **Numeri di riga:** invecchiano in un giorno. Ogni passo cerca **per nome** (`grep -n "function nome"`), mai per riga.
- **Ogni modifica al gioco passa da un attrezzo a àncore** in `strumenti/_t-*.js`, con `cerca`/`metti` esatti e conteggi `attesi` dopo la sostituzione: è la regola di casa e rende la cura riproducibile dal commit.
- **Lingua:** commenti e testi in italiano, senza lettere accentate nei commenti del codice (il file usa `e'` per «è»); i testi visibili all'utente usano invece gli accenti veri o le entità HTML.
- **Un commit per compito**, col verbale nel messaggio: che cosa è cambiato, quale misura lo prova.
- **Soglie di accettazione** (dallo spec, decise prima): TIRA premibile ≥90% del volo di un nostro cross (oggi 9%); zero cambi di faccia in 6 s di inseguimento (oggi 6); comando al destinatario entro 0,5 s dal calcio; volée eseguibili tenendo TIRA durante il volo; furti riusciti non calano; zero celle accese che rifiutano l'atto.

---

### Compito 1: Il banco del volo, e deve essere ROSSO

Prima della cura si scrive il giudice, e si prova che sa condannare il gioco di oggi. Un banco che nasce verde non misura niente.

**File:**
- Creare: `strumenti/_q-volo.js`
- Modello da leggere: `strumenti/_p-sfarfallio.js` (impianto del server locale e del passo 1/60)

**Interfacce:**
- Consuma: `window.__test` (`startMatch`, `simulate`, `setCpuVsCpu`, `pulsanti`), le globali di pagina `G`, `squadraDelPallone`, `KICK_R`.
- Produce: uscita 0 se tutte le prove passano, 1 se una fallisce, 2 se il banco non ha potuto misurare. Le prove si chiamano `A` (volo del cross), `B` (inseguimento), `C` (comando al destinatario), `D` (volée), `E` (celle accese che rifiutano).

- [ ] **Passo 1: leggere l'impianto da riusare**

Run: `sed -n '1,60p' strumenti/_p-sfarfallio.js`
Atteso: si vede il server locale su porta effimera, il contesto Playwright 915×412 `isMobile`, e il ciclo a `t.simulate(1/60)`.

- [ ] **Passo 2: scrivere il banco con le cinque prove**

Creare `strumenti/_q-volo.js`:

```js
/* =====================================================================
   _q-volo.js — LA PULSANTIERA DICE LA VERITA'? (voce #88)
   Cinque prove a passo 1/60, semi dichiarati, tutte sul comportamento:
     A  durante il volo di un NOSTRO cross il disco grande offre TIRA
        in almeno il 90% dei fotogrammi (misurato prima della cura: 9%)
     B  inseguendo un portatore avversario la faccia del disco grande
        NON cambia in 6 secondi (misurato prima: 6 cambi)
     C  entro 0,5 s dal calcio il comando e' del destinatario dichiarato
     D  tenendo TIRA durante il volo esce una volee' (G.stats.volee sale)
     E  nessuna cella ACCESA rifiuta l'atto (PRESSA offerto senza
        portatore avversario e' un verbo morto sotto il dito)
   uso: node strumenti/_q-volo.js [--gioco file.html]
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
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
const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '   (' + det + ')' : '')); };

(async () => {
  const prova = arg('gioco', '');
  const provaAbs = prova ? path.resolve(RADICE, prova) : '';
  const srv = await servi(provaAbs);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const ecc = []; pag.on('pageerror', e => ecc.push(e.message));
  console.log('\n=== LA PULSANTIERA DICE LA VERITA? ===  ' + (provaAbs || 'CALCETTO-il-gioco.html (repo)'));
  await pag.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });

  /* ---- A + C + D: il volo di un nostro cross ---- */
  const volo = await pag.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1, { size: 7 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    /* scena: il comandato in fascia offensiva col pallone, un compagno in area */
    const pi = G.ctrl[0]; if (pi < 0) return { errore: 'nessun comandato' };
    const p = G.players[pi];
    p.x = FW * 0.72; p.y = FH * 0.16; p.vx = 0; p.vy = 0;
    const mate = G.players.find(q => q.team === 0 && q !== p && q.role !== 'gk');
    if (!mate) return { errore: 'nessun compagno' };
    mate.x = FW - 90; mate.y = FH / 2; mate.vx = 0; mate.vy = 0;
    const b = G.ball;
    b.owner = pi; b.x = p.x + 8; b.y = p.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
    segnaTocco(pi);
    /* il cross parte dal motore, come lo farebbe il dito */
    const mi = G.players.indexOf(mate);
    const dx = mate.x - p.x, dy = mate.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    doCross(p, dx / l, dy / l, [mate.x, mate.y], mi);
    const voleePrima = (G.stats.volee[0] | 0);
    /* si tiene premuto TIRA per tutto il volo, come farebbe il pollice */
    let tira = 0, tot = 0, ctrlAlDest = -1;
    for (let i = 0; i < 240 && G.ball.owner < 0; i++) {
      const bt = t.pulsanti(0);
      const grande = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      const acceso = grande.act === 'shot' && !grande.off;
      if (acceso) tira++;
      tot++;
      startCharge(0);                       // il dito tiene TIRA
      if (ctrlAlDest < 0 && G.ctrl[0] === mi) ctrlAlDest = i;
      t.simulate(1 / 60);
    }
    for (let i = 0; i < 60; i++) t.simulate(1 / 60);
    return { tira, tot, ctrlAlDest, mi,
             volee: (G.stats.volee[0] | 0) - voleePrima };
  });
  if (volo.errore) { console.log('BANCO: ' + volo.errore); process.exit(2); }
  const quota = volo.tot ? volo.tira / volo.tot : 0;
  di(quota >= 0.90, 'A il disco grande offre TIRA durante il volo del nostro cross',
    Math.round(quota * 100) + '% (' + volo.tira + '/' + volo.tot + '), soglia 90%');
  di(volo.ctrlAlDest >= 0 && volo.ctrlAlDest <= 30,
    'C il comando passa al destinatario entro mezzo secondo',
    volo.ctrlAlDest < 0 ? 'mai' : volo.ctrlAlDest + ' fotogrammi');
  di(volo.volee >= 1, 'D tenendo TIRA durante il volo esce una volee', 'volee ' + volo.volee);

  /* ---- B: l'inseguimento ---- */
  const dif = await pag.evaluate(() => {
    const t = window.__test;
    t.startMatch(1, 1, { size: 5 });
    for (let i = 0; i < 600 && G.scene !== 'play'; i++) t.simulate(1 / 60);
    if (G.scene !== 'play') return { errore: 'mai in play' };
    t.setTimeLeft(600);
    const pi = G.ctrl[0], p = G.players[pi];
    let k = -1, dm = 1e9;
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team !== 1 || q.role === 'gk' || q.out > 0) continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < dm) { dm = d; k = i; }
    }
    if (k < 0) return { errore: 'nessun avversario' };
    const o = G.players[k];
    o.x = p.x + 84; o.y = p.y; o.vx = 0; o.vy = 0;
    const b = G.ball; b.owner = k; b.x = o.x + 8; b.y = o.y; b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0;
    segnaTocco(k);
    let cambi = 0, prec = null, morte = 0;
    for (let i = 0; i < 360; i++) {
      const bt = t.pulsanti(0);
      const grande = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
      const faccia = grande.act + (grande.off ? '-off' : '');
      if (prec !== null && faccia !== prec) cambi++;
      prec = faccia;
      /* E: una cella ACCESA che rifiuta l'atto e' un verbo morto */
      const pressa = bt.find(z => z.act === 'press');
      if (pressa && !pressa.off) {
        const car = G.ball.owner >= 0 ? G.players[G.ball.owner] : null;
        if (!car || car.team === 0) morte++;
      }
      t.simulate(1 / 60);
    }
    return { cambi, morte };
  });
  if (dif.errore) { console.log('BANCO: ' + dif.errore); process.exit(2); }
  di(dif.cambi === 0, 'B la faccia non cambia inseguendo un avversario (6 s)', dif.cambi + ' cambi');
  di(dif.morte === 0, 'E nessuna cella accesa rifiuta l\'atto', dif.morte + ' fotogrammi con PRESSA morto');

  if (ecc.length) di(false, 'nessuna eccezione di pagina', ecc[0]);
  const rossi = esiti.filter(v => !v).length;
  console.log('\n' + (esiti.length - rossi) + ' prove su ' + esiti.length + ' — ' + (rossi ? 'CANCELLO ROSSO' : 'CANCELLO VERDE'));
  await ctx.close(); await browser.close(); srv.chiudi();
  process.exit(rossi ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message); process.exit(2); });
```

- [ ] **Passo 3: eseguirlo e pretendere che sia ROSSO**

Run: `node strumenti/_q-volo.js`
Atteso: `CANCELLO ROSSO`, con A intorno al 9%, B con 6 cambi, C «mai», D volée 0, E con centinaia di fotogrammi di PRESSA morto. Se esce verde, il banco non sta misurando: fermarsi e ripararlo prima di toccare il gioco.

- [ ] **Passo 4: commit**

```bash
git add strumenti/_q-volo.js
git commit -m "Il banco del volo, e nasce rosso come deve (voce #88)"
```

---

### Compito 2: La palla nostra in volo resta nostra

**File:**
- Creare: `strumenti/_t-volo1.js` (attrezzo a àncore)
- Modificare, tramite l'attrezzo: `CALCETTO-il-gioco.html`, funzione `puoTirare`
- Banco: `strumenti/_q-volo.js` (prova A), `strumenti/_q-precedenza.js`

**Interfacce:**
- Consuma: `squadraDelPallone()` (già in casa, pura), `KICK_R`, `P_SPEED`.
- Produce: `puoTirare(t)` risponde vero anche quando il pallone non è al piede ma **è nostro e raggiungibile**; nessun nome nuovo chiamato dentro `touchBtnLayout`.

- [ ] **Passo 1: rileggere la funzione e la costante della velocità**

Run: `grep -n "function puoTirare" -A 8 CALCETTO-il-gioco.html; grep -n "const P_SPEED" CALCETTO-il-gioco.html`
Atteso: `puoTirare` in otto righe con la frontiera `KICK_R*1.4`, e `P_SPEED` dichiarata come costante di primo livello.

- [ ] **Passo 2: scrivere l'attrezzo**

Creare `strumenti/_t-volo1.js` con l'impianto standard degli attrezzi (`arg`, `haFlag`, `inFile`, `outFile`, ciclo su `ANCORE`, controllo `attesi`, scrittura) e questa unica àncora:

```js
{
  nome: '1/1 puoTirare: la palla nostra in volo resta nostra',
  cerca:
`function puoTirare(t){
  const p=ctrlPlayer(t);
  if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  const pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4)
    return finestraRovesciata(p);
  return true;
}`,
  metti:
`/* LA PORTATA DEL TIRO (voce #88, 1 settembre 2026): oltre il raggio di
   calcio il tiro resta offerto se il pallone e' NOSTRO e il comandato
   puo' raggiungerlo — un uomo copre P_SPEED*1,2 unita' in poco piu' di
   un secondo. Un numero solo, dichiarato: se il banco mostrasse che
   spegne troppo, sale a 1,5 e si rimisura. Nessuna previsione del punto
   di caduta: sarebbe un secondo modello della fisica dentro un
   predicato che deve restare puro. */
const TIRO_PORTATA = 1.2;
function puoTirare(t){
  const p=ctrlPlayer(t);
  if(!p || p.slide>=0 || p.recover>0 || p.rove>=0) return false;
  const pi=G.players.indexOf(p);
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
    /* LA FACCIA SEGUE IL POSSESSO, NON LA GEOMETRIA (voce #88). Fino a
       oggi qui si rispondeva con la sola finestra della rovesciata, e
       il disco grande diventava CONTRASTA per il 91-97% del volo di un
       nostro cross (misurato il 1 settembre 2026, sonda a 1/60): il
       verbale delle capacita' lo prevedeva — «"nostra" e' una domanda
       che durante il volo di un passaggio non ha risposta» — e la
       risposta adesso c'e', ed e' squadraDelPallone: il padrone se c'e',
       altrimenti la squadra dell'ultimo tocco. La rovesciata mantiene la
       precedenza: si prova per prima. */
    if(finestraRovesciata(p)) return true;
    return squadraDelPallone()===t &&
           len(G.ball.x-p.x,G.ball.y-p.y) <= P_SPEED*TIRO_PORTATA;
  }
  return true;
}`,
}
```

con questi `attesi`:

```js
const attesi = [
  ['const TIRO_PORTATA = 1.2;', 1],
  ['squadraDelPallone()===t &&', 1],
  ['if(finestraRovesciata(p)) return true;', 1],
  ['    return finestraRovesciata(p);', 0],   // il vecchio ramo secco e' morto
  ['voce #88', 2],
];
```

- [ ] **Passo 3: applicare su copia e provare la sintassi**

Run: `node strumenti/_t-volo1.js --out fuori/volo1.html && node -e "const s=require('fs').readFileSync('fuori/volo1.html','utf8'); const m=s.match(/function puoTirare[\s\S]{0,900}/); new Function(m[0].slice(0, m[0].lastIndexOf('}')+1)); console.log('puoTirare compila')"`
Atteso: `1 ancoraggi applicati` e `puoTirare compila`.

- [ ] **Passo 4: applicare in casa**

Run: `node strumenti/_t-volo1.js --dentro`
Atteso: `OK 1 ancoraggi applicati`.

- [ ] **Passo 5: il banco che ricostruisce l'ingresso — il rischio numero uno**

Run: `node strumenti/_q-precedenza.js`
Atteso: `9 cancelli, 9 passati, 0 falliti`. Se esce `ECCEZIONE ... is not defined`, il nome mancante è una costante che la rete di estrazione non cattura (cattura solo i nomi seguiti da parentesi): aggiungerla al blocco dei dati del banco accanto a `STICK_DEAD`, con una riga di verbale che dica perché.

- [ ] **Passo 6: la prova A deve girare**

Run: `node strumenti/_q-volo.js`
Atteso: `A` verde (≥90%); `B`, `C`, `D`, `E` ancora rosse — si curano nei compiti seguenti.

- [ ] **Passo 7: i verbi non si sono rotti**

Run: `node strumenti/_q-l12.js && node strumenti/_q-l16.js && node strumenti/giocata.js --tutte`
Atteso: 9/9, 6/6, `7 giocate misurate, 7 passate`.

- [ ] **Passo 8: commit**

```bash
git add CALCETTO-il-gioco.html strumenti/_t-volo1.js
git commit -m "La palla nostra in volo resta nostra: TIRA non e' piu' negato (voce #88)"
```

---

### Compito 3: La carica si apre durante il volo

`puoTirare` ora dice sì, ma `startCharge` esce lo stesso: sopra la soglia devia su `tentaRovesciata` e torna, quindi la carica non nasce e il tiro al volo resta irraggiungibile.

**File:**
- Creare: `strumenti/_t-volo2.js`
- Modificare: `CALCETTO-il-gioco.html`, funzione `startCharge`
- Banco: `strumenti/_q-volo.js` (prova D)

**Interfacce:**
- Consuma: `puoTirare(t)` come modificata dal compito 2, `finestraRovesciata(p)`, `tentaRovesciata(p)`.
- Produce: `startCharge(t)` apre la carica `'tiro'` anche col pallone lontano, quando la rovesciata non è disponibile e la palla è nostra.

- [ ] **Passo 1: rileggere la funzione**

Run: `grep -n "function startCharge" -A 20 CALCETTO-il-gioco.html`
Atteso: si vede `if(!puoTirare(t)) return;` e il ramo che chiama `tentaRovesciata(p)` e torna.

- [ ] **Passo 2: scrivere l'attrezzo**

Creare `strumenti/_t-volo2.js` con questa àncora:

```js
{
  nome: '1/1 startCharge: la rovesciata prima, poi la carica',
  cerca:
`  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
    /* TIRA con la palla ALTA che scende nella finestra: e' la rovesciata
       (decisione 1 di AZIONI.md — stesso tasto, contesto diverso).
       La finestra non si richiede qui: puoTirare l'ha gia' chiesta, ed
       e' l'unico modo di arrivare a questo ramo. */
    tentaRovesciata(p);
    return;
  }`,
  metti:
`  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
    /* TIRA con la palla ALTA che scende nella finestra: e' la rovesciata
       (decisione 1 di AZIONI.md — stesso tasto, contesto diverso).
       LA ROVESCIATA HA LA PRECEDENZA e si prova per prima: e' il verbo
       spettacolare del gioco e non deve perderla (voce #88). */
    if(finestraRovesciata(p)){ tentaRovesciata(p); return; }
    /* PALLA NOSTRA IN VOLO: si apre la carica del TIRO, e sara' il
       CONTATTO a decidere che gesto esce — tiro fermo se la palla e' a
       terra, volee' se arriva alta e veloce (updateBall lo sa gia' fare:
       cerca «TIRO AL VOLO»). E' il modello del paragone: il tiro di
       prima non e' un pulsante, e' un tipo di contatto. Se la palla non
       e' nostra o e' fuori portata, puoTirare ha gia' detto no e qui non
       si arriva. */
  }`,
}
```

con questi `attesi`:

```js
const attesi = [
  ['if(finestraRovesciata(p)){ tentaRovesciata(p); return; }', 1],
  ['    tentaRovesciata(p);\n    return;\n  }', 0],   // il vecchio ramo secco e' morto
  ['voce #88', 1],
];
```

- [ ] **Passo 3: applicare e verificare la prova D**

Run: `node strumenti/_t-volo2.js --dentro && node strumenti/_q-volo.js`
Atteso: `A` e `D` verdi (la volée si conta a tabellino); `B`, `C`, `E` ancora rosse.

- [ ] **Passo 4: la rovesciata non si è persa**

Run: `node strumenti/_q-l12.js && node strumenti/_q-precedenza.js`
Atteso: 9/9 e 9/9. Se `_q-l12` avesse una prova sulla rovesciata in rosso, la precedenza è invertita: rileggere il passo 2.

- [ ] **Passo 5: commit**

```bash
git add CALCETTO-il-gioco.html strumenti/_t-volo2.js
git commit -m "Il tiro al volo diventa raggiungibile: la carica si apre durante il volo (voce #88)"
```

---

### Compito 4: La cella spenta invece del verbo travestito

**File:**
- Creare: `strumenti/_t-cella-spenta.js`
- Modificare: `CALCETTO-il-gioco.html` — `touchBtnLayout` (il campo `off` nei due dischi che cambiano faccia col possesso), `drawTouchButtons` (il disegno attenuato), `Touch5.start` (la pressione che non produce nulla)
- Banco: `strumenti/_q-volo.js` (prova E), `strumenti/_q-precedenza.js`

**Interfacce:**
- Consuma: `puoTirare(t)`, `puoPassare(t)` già in `touchBtnLayout`; `comandaPressa` per sapere quando PRESSA è morto.
- Produce: ogni disco dell'elenco può portare `off:true`. Chi legge i dischi (`Touch5.start`, il disegno, `__test.pulsanti`) vede il campo; **l'ordine e la lunghezza dell'elenco non cambiano** — è il contratto su cui il ri-armo rilegge il disco per indice.

- [ ] **Passo 1: rileggere i tre punti**

Run: `grep -n "function touchBtnLayout" CALCETTO-il-gioco.html; grep -n "function drawTouchButtons" CALCETTO-il-gioco.html; grep -n "  start(id,x,y)" CALCETTO-il-gioco.html`
Atteso: tre righe, una per funzione.

- [ ] **Passo 2: il campo `off` sui dischi che possono restare senza verbo**

Nell'attrezzo, àncora sulla riga che calcola le capacità:

```js
{
  nome: '1/3 touchBtnLayout: la cella spenta',
  cerca:
`  const tira = puoTirare(t), passa = puoPassare(t), scudo = puoScudo(t);`,
  metti:
`  const tira = puoTirare(t), passa = puoPassare(t), scudo = puoScudo(t);
  /* LA CELLA SPENTA (voce #88, 1 settembre 2026). Il verbale qui sopra
     dichiarava il caso e la sua cura: «ripararlo vuol dire un disco
     SPENTO, cioe' interfaccia nuova». Eccola. Un disco che non puo'
     produrre niente non si traveste da un altro verbo: resta al suo
     posto, attenuato, e la pressione non apre nulla. Due soli casi, e
     sono quelli misurati: il grande quando nessun verbo e' possibile
     (uomo a terra o in rialzo), e PRESSA quando non c'e' nessun
     portatore avversario da raddoppiare — offerto per il 91-98% del
     volo di un nostro cross, e rifiutato a ogni pressione. */
  const carr = G.ball.owner>=0 ? G.players[G.ball.owner] : null;
  const pressaViva = !!(carr && carr.team!==t && carr.out<=0);
  const grandeSpento = !tira && !puoContrastare(ctrlPlayer(t));`,
}
```

**Nota per chi esegue:** `puoContrastare` prende un GIOCATORE, non una squadra. È già chiamata altrove nel file ed è già fra le dipendenze che `_q-precedenza` estrae: verificarlo al passo 5.

- [ ] **Passo 3: i due dischi portano il campo**

Seconda àncora, sui due dischi interessati:

```js
{
  nome: '2/3 i due dischi portano il campo off',
  cerca:
`    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60,  r:40 },`,
  metti:
`    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60,  r:40, off:grandeSpento },`,
},
{
  nome: '3/3 PRESSA si spegne senza portatore avversario',
  cerca:
`    passa ? { act:'pass',    label:'PASSA',     x:bx+s*52,  y:VH-148, r:26 }
          : { act:'press',   label:'PRESSA',    x:bx+s*52,  y:VH-148, r:26 },`,
  metti:
`    passa ? { act:'pass',    label:'PASSA',     x:bx+s*52,  y:VH-148, r:26 }
          : { act:'press',   label:'PRESSA',    x:bx+s*52,  y:VH-148, r:26, off:!pressaViva },`,
}
```

- [ ] **Passo 4: la pressione su una cella spenta non produce nulla**

Quarta àncora in `Touch5.start`, subito dopo che il disco è stato risolto. Rileggere prima il punto esatto:

Run: `grep -n "nasceAtto" CALCETTO-il-gioco.html | head -3`

Poi l'àncora, sulla riga che risolve l'atto alla pressione (adattare il testo `cerca` a quello che il file mostra, mantenendo l'esattezza byte per byte):

```js
/* dentro Touch5.start, prima di nasceAtto: */
`      if(d && d.off) return;   /* cella spenta (voce #88): nessun atto, nessuna carica */`
```

- [ ] **Passo 5: il disegno attenuato**

Quinta àncora in `drawTouchButtons`: dove si dipinge il disco, se `b.off` è vero si abbassa l'opacità (per esempio `ctx.globalAlpha *= 0.45`) e si salta l'anello di carica. Rileggere la funzione prima di scrivere l'àncora:

Run: `grep -n "function drawTouchButtons" -A 30 CALCETTO-il-gioco.html`

- [ ] **Passo 6: applicare, e i tre banchi dell'ingresso**

Run: `node strumenti/_t-cella-spenta.js --dentro && node strumenti/_q-precedenza.js && node strumenti/_q-l12.js && node strumenti/_q-volo.js`
Atteso: 9/9, 9/9, e la prova `E` verde.

- [ ] **Passo 7: commit**

```bash
git add CALCETTO-il-gioco.html strumenti/_t-cella-spenta.js
git commit -m "La cella si spegne invece di travestirsi da un altro verbo (voce #88)"
```

---

### Compito 5: In difesa la faccia non mente

**File:**
- Creare: `strumenti/_t-difesa-ferma.js`
- Modificare: `CALCETTO-il-gioco.html`, `puoTirare` (il ramo entro il raggio)
- Banco: `strumenti/_q-volo.js` (prova B), `strumenti/_p-contrasto20.js` (il prezzo)

**Interfacce:**
- Consuma: `squadraDelPallone()`.
- Produce: `puoTirare(t)` risponde falso quando il pallone è **degli avversari**, anche se vicino.

- [ ] **Passo 1: misurare il prezzo PRIMA**

Run: `node strumenti/_p-contrasto20.js 2>&1 | tail -3`
Annotare il numero di scivolate riuscite su 20: è il metro del «prezzo dichiarato» (i furti non devono calare).

- [ ] **Passo 2: l'àncora**

```js
{
  nome: '1/1 puoTirare: niente TIRA sulla palla degli avversari',
  cerca:
`  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){`,
  metti:
`  /* IN DIFESA LA FACCIA NON MENTE (voce #88): entro il raggio di calcio,
     se il pallone e' degli AVVERSARI il verbo e' il contrasto, non il
     tiro. Misurato il 1 settembre 2026: inseguendo un portatore la
     faccia cambiava sei volte in sei secondi, tutte fra 33,4 e 36,9
     unita', mentre la squadra dell'ultimo tocco non cambiava MAI.
     IL PREZZO, dichiarato: si perde la punta-rubata — premere TIRA su
     un pallone avversario vicino e strapparlo via. Misurato con
     _p-contrasto20 prima e dopo: se i furti calano, la cura si aggiusta. */
  if(G.ball.owner!==pi && squadraDelPallone()===(1-t)) return false;
  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){`,
}
```

- [ ] **Passo 3: applicare e misurare le due facce della stessa medaglia**

Run: `node strumenti/_t-difesa-ferma.js --dentro && node strumenti/_q-volo.js && node strumenti/_p-sfarfallio.js 2>&1 | tail -12`
Atteso: la prova `B` verde (zero cambi); `_p-sfarfallio` non deve più mostrare cambi di faccia sull'attraversamento della frontiera.

- [ ] **Passo 4: il prezzo, misurato**

Run: `node strumenti/_p-contrasto20.js 2>&1 | tail -3`
Atteso: le scivolate riuscite non calano rispetto al passo 1. Se calano di più di due su venti, fermarsi: la cura va ristretta (per esempio solo fuori dal raggio di contrasto) e rimisurata.

- [ ] **Passo 5: i cancelli dei verbi**

Run: `node strumenti/_q-precedenza.js && node strumenti/_q-l12.js && node strumenti/_q-riarmo.js && node strumenti/giocata.js --tutte`
Atteso: 9/9, 9/9, 7/7, 7 giocate passate.

- [ ] **Passo 6: commit**

```bash
git add CALCETTO-il-gioco.html strumenti/_t-difesa-ferma.js
git commit -m "In difesa la faccia non mente piu': sei cambi in sei secondi diventano zero (voce #88)"
```

---

### Compito 6: Il comando va al destinatario

**File:**
- Creare: `strumenti/_t-ricevente.js`
- Modificare: `CALCETTO-il-gioco.html`, `switchControlled`
- Banco: `strumenti/_q-volo.js` (prova C)

**Interfacce:**
- Consuma: `b.passTo`, `b.crossTo` (già scritti dal motore e già azzerati su muro, tocco sporco, controllo e uscite).
- Produce: `switchControlled(dt)` preferisce il destinatario dichiarato al più vicino al pallone.

- [ ] **Passo 1: rileggere la funzione**

Run: `grep -n "function switchControlled" -A 25 CALCETTO-il-gioco.html`

- [ ] **Passo 2: l'àncora**

```js
{
  nome: '1/1 switchControlled: il comando segue il destinatario',
  cerca:
`    let best=-1,bd=1e9;
    for(let i=0;i<G.players.length;i++){
      const p=G.players[i];
      if(p.team!==t || p.out>0 || p.role==='gk') continue;
      const d=len(G.ball.x-p.x,G.ball.y-p.y);
      if(d<bd){bd=d;best=i;}
    }`,
  metti:
`    let best=-1,bd=1e9;
    /* IL COMANDO SEGUE IL DESTINATARIO (voce #88, 1 settembre 2026).
       Misurato: mentre il cross volava verso il compagno 2, il comando
       andava al compagno 1, perche' qui si sceglie il piu' vicino al
       pallone e basta. Se un passaggio o un cross ha un destinatario
       DICHIARATO dal motore, il controllo va a lui: e' l'uomo che
       ricevera' davvero, ed e' quello su cui il dito sta armando il
       tiro di prima. Vale per ogni passaggio con destinatario; se negli
       scambi corti risultasse fastidioso si restringe ai palloni alti,
       che e' la separazione che il paragone offre come due interruttori
       distinti. b.passTo e b.crossTo si azzerano gia' su muro, tocco
       sporco, controllo e uscite: non restano rancidi. */
    const dest = (G.ball.crossTo>=0 ? G.ball.crossTo : (G.ball.passTo>=0 ? G.ball.passTo : -1));
    const qd = dest>=0 ? G.players[dest] : null;
    if(qd && qd.team===t && qd.out<=0 && qd.role!=='gk'){
      best=dest; bd=0;
    } else
    for(let i=0;i<G.players.length;i++){
      const p=G.players[i];
      if(p.team!==t || p.out>0 || p.role==='gk') continue;
      const d=len(G.ball.x-p.x,G.ball.y-p.y);
      if(d<bd){bd=d;best=i;}
    }`,
}
```

- [ ] **Passo 3: applicare e misurare**

Run: `node strumenti/_t-ricevente.js --dentro && node strumenti/_q-volo.js`
Atteso: la prova `C` verde (comando al destinatario entro 30 fotogrammi).

- [ ] **Passo 4: il cambio uomo non si è rotto**

Run: `node strumenti/_q-precedenza.js && node strumenti/giocata.js --tutte && node strumenti/_q-l16.js`
Atteso: 9/9, 7 giocate passate (la giocata `cambio` misura proprio il passaggio del comando), 6/6.

- [ ] **Passo 5: commit**

```bash
git add CALCETTO-il-gioco.html strumenti/_t-ricevente.js
git commit -m "Il comando ti mette in mano il destinatario del passaggio (voce #88)"
```

---

### Compito 7: Il raddoppio diventa una tenuta, e il contenimento si vede

**File:**
- Creare: `strumenti/_t-raddoppio-tenuta.js`
- Modificare: `CALCETTO-il-gioco.html` — `comandaPressa`/`comandaRaddoppio` (rinnovo del cronometro finché il dito tiene), il disegno del contenimento
- Banco: nuovo caso nel banco del volo

**Interfacce:**
- Consuma: `Touch5` (il tempo di tenuta dell'atto, campo `tenuta` già esistente), `RADDOPPIO_T`.
- Produce: finché il dito tiene PRESSA, il compagno chiamato resta chiamato; quando il dito si alza, il cronometro finisce da sé.

- [ ] **Passo 1: rileggere i due punti**

Run: `grep -n "function comandaPressa" -A 10 CALCETTO-il-gioco.html; grep -n "raddoppio" CALCETTO-il-gioco.html | head -12`

- [ ] **Passo 2: il rinnovo del cronometro**

Nell'attrezzo, una àncora dentro il ciclo degli atti di `Touch5.passo`, dove i cronometri del pollice avanzano: se l'atto tenuto è `press` e la cella è accesa, si richiama `comandaPressa` a ritmo ridotto (per esempio ogni 0,2 s di tenuta) così il cronometro del compagno non scade mentre il dito tiene. Il testo esatto dell'àncora si scrive dopo aver riletto il ciclo:

Run: `grep -n "a.posato+=dt;" -B 6 -A 3 CALCETTO-il-gioco.html`

- [ ] **Passo 3: il segno del contenimento**

Àncora nel disegno del giocatore comandato: quando `Touch5.contiene(t)` è vero, un segno leggibile ai piedi dell'uomo (un arco o un alone, coerente con la grafica di casa). Rileggere prima come sono disegnati gli altri segni di stato:

Run: `grep -n "function contiene" -A 8 CALCETTO-il-gioco.html; grep -n "flashRing" CALCETTO-il-gioco.html | head -5`

- [ ] **Passo 4: applicare e misurare**

Run: `node strumenti/_t-raddoppio-tenuta.js --dentro && node strumenti/_q-volo.js && node strumenti/_q-precedenza.js && node strumenti/_q-l12.js`
Atteso: tutte le prove del banco del volo verdi, 9/9 e 9/9 sull'ingresso.

- [ ] **Passo 5: commit**

```bash
git add CALCETTO-il-gioco.html strumenti/_t-raddoppio-tenuta.js
git commit -m "Il raddoppio si tiene, e il contenimento si vede (voce #88)"
```

---

### Compito 8: La batteria, il verbale, il registro

**File:**
- Modificare: `strumenti/tutti.js` (il banco nuovo entra in batteria), `MANUALE.md` (registro), `PUNTO-DEL-LAVORO.md`, `_analisi/MINIERA-FCM.md` (§4: le adozioni diventano fatte)

- [ ] **Passo 1: il banco entra in batteria**

In `strumenti/tutti.js`, accanto agli altri cancelli dei verbi:

```js
  { nome: 'volo',        cmd: ['strumenti/_q-volo.js'],                                 conta: true,  lento: false },
```

- [ ] **Passo 2: la batteria intera, in spezzoni sotto i dieci minuti**

Run: `node strumenti/tutti.js --solo collaudo,tocco,istantanea`
Run: `node strumenti/tutti.js --solo misura,senza-rete,equita-sonda,equita,silhouette,folla,seme,gabbia,diritti,carattere,nomi`
Run: `node strumenti/tutti.js --solo testo-fuori,disposizione,eventi,salvataggio,meta,divisioni,record,volo`
Run: `node strumenti/tutti.js --solo giocata,prestazione,abbandono`
Atteso: tutti i cancelli che contano verdi. Se `prestazione` esce rosso in batteria, **rimisurarlo da solo** prima di crederci: su file identici il suo appaiamento è falso (controesempio del 1 settembre già a verbale nel suo ingresso).

- [ ] **Passo 3: i sorteggi identici al bit**

Run: `node strumenti/_q-determinismo.js && node strumenti/_c3-sorteggi.js && node strumenti/_crit10-sorteggi.js`
Atteso: determinismo verde, «il conto delle chiamate a dado() non e' cambiato in nessuna partita», sei partite identiche.

- [ ] **Passo 4: il verbale nei documenti**

- `MANUALE.md`, sezione «A registro»: la voce #88 passa da aperta a **curata**, con le sei misure prima/dopo.
- `PUNTO-DEL-LAVORO.md`: il primo dei cinque cantieri è chiuso; restano vernice del campo (#86), residuo moviola (#85), rimesse e angoli (#87), meccaniche dei verbi (#89).
- `_analisi/MINIERA-FCM.md` §4: le adozioni «autoswitch al ricevente» e «registro del cambio» passano da proposte a **fatte**, con la data.

- [ ] **Passo 5: commit finale**

```bash
git add strumenti/tutti.js MANUALE.md PUNTO-DEL-LAVORO.md _analisi/MINIERA-FCM.md
git commit -m "La pulsantiera che non mente: voce #88 chiusa, sei soglie misurate (voce #88)"
```

---

## Autocontrollo del piano

**Copertura dello spec.** §4.1 legge della pulsantiera → compiti 2, 4, 5. §4.2 palla nostra in volo, tiro di prima, cella spenta, comando al destinatario → compiti 2, 3, 4, 6. §4.3 difesa, raddoppio a tenuta, contenimento visibile → compiti 5, 7. §5 soglie → compito 1 (il banco le incarna) e verifiche in ogni compito. §6 rischi → il rischio 1 (`_q-precedenza`) ha un passo dedicato in ogni compito che tocca le capacità; il rischio 2 (rovesciata oscurata) è il passo 4 del compito 3; il rischio 4 (punta rubata) è il passo 1 e il passo 4 del compito 5; i rischi 5 e 6 sono verbale, nel compito 8.

**Segnaposto.** Nei compiti 4 e 7 tre àncore non hanno il testo `cerca` completo: sono i punti in cui il file va riletto prima di scrivere l'àncora, e il passo che precede contiene il comando esatto per rileggerlo. È una lettura obbligata, non un «da definire»: gli altri attrezzi mostrano il modello, e la regola di casa vieta di ancorare su un testo non riletto lo stesso giorno.

**Coerenza dei nomi.** `squadraDelPallone()` (compiti 2, 5), `TIRO_PORTATA` (definita nel compito 2, usata solo lì), `off` come campo dei dischi (compito 4, letto da `Touch5.start` e dal disegno), `pressaViva` e `grandeSpento` (definite e usate dentro `touchBtnLayout` nel compito 4), `dest`/`qd` (locali del compito 6). Nessun nome usato prima di essere definito.
