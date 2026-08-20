/* =====================================================================
   GIOCATA — il tocco del gioco, misurato con le dita.

   Tutto il collaudo finora ha guardato la CPU giocare contro se' stessa:
   fotografie, filmati, misure — mai un dito sullo schermo. Ma un gioco
   di calcio si giudica toccandolo: quanto tarda il giocatore a partire
   quando il dito lo trascina, quanto tarda la palla quando il dito la
   chiede, se la carica del tiro esiste sotto il dito o solo nel codice.
   Questo strumento manda gesti touch VERI (eventi di protocollo, non
   funzioni chiamate a mano) sul canvas del gioco, campiona lo stato a
   60 volte al secondo e trasforma "com'e' il tocco" in numeri: la
   LATENZA fra il gesto e la prima variazione di velocita' del bersaglio,
   e la RISPOSTA (velocita' massima raggiunta dalla palla dopo il gesto).

   Le giocate sono scritte su come il gioco E' OGGI, non su come era.
   BANCO ONESTO: nessun ripiego muto.

   ======= I GESTI CHE IL GIOCO NON HA PIU', E PERCHE' NON SI MISURANO =
   Il rilascio della levetta e' INERTE: Touch5.release(t,s) torna false
   e basta (CALCETTO-il-gioco.html:8994), e il verbale sopra quella riga
   dice da dove viene — su 200 rilasci misurati, 199 battevano un
   passaggio che nessuno aveva chiesto (banco strumenti/_p-rilascio.js).
   Da li' uscivano quattro gesti, e questo strumento ne misurava tre:

     tocco  (tap col pallone = passaggio, rilascio sotto i 650 px/s)
     tiro   (flick veloce verso la porta)
     cross  (flick trasversale dalla meta' campo offensiva)

   Misurato su questa base (804328ee, tre giri --tutte): tutte e tre
   fallivano SEMPRE, e lo strumento usciva con 1 su un gioco sano. Un
   cancello che accusa l'innocente e' peggio di nessun cancello: la
   prossima volta che uscira' 1 nessuno lo guardera'.

   I VERBI PERO' NON SONO SPARITI, hanno cambiato posto — sono andati
   sui due pulsanti, e li' si misurano:
     · TIRA      pulsante grande col possesso, carica tenuta  ->  carica
     · PASSAGGIO pulsante piccolo col possesso, cono di mira VUOTO
                 (eseguiFiltrante ripiega su eseguiPassUmano, :9186)
                                                             ->  passaggio
     · FILTRANTE pulsante piccolo col possesso, un compagno con dot>0,5
                                                             ->  filtrante
     · CROSS     pulsante piccolo col possesso E LO SCATTO TENUTO, dalla
                 meta' campo offensiva (doFiltrante -> comeCross, :9187;
                 lo scatto su touch e' la levetta oltre 66 px,
                 humanSprint :8665, cioe' un SECONDO dito)    ->  cross
     · CONTRASTA pulsante grande senza possesso              ->  contrasto
     · CAMBIO    pulsante piccolo senza possesso             ->  cambio
   Restano gesti della levetta soltanto il trascinamento (trascina) e —
   dentro il cross — lo scatto. Nessun verbo perso, tre misure che
   accusavano il gioco in meno.

   ======= DOVE SONO I PULSANTI ========================================
   Non e' scritto qui, e non c'e' nessun ripiego: lo chiede al gioco, e
   lo chiede a DUE SORGENTI.

     · __test.pulsanti(0) e' il RICALCOLO: la stessa touchBtnLayout che
       risolve il tocco. Sa dove il pulsante DEVE stare.
     · __test.comandiTouch e' il DIPINTO: lo riempie drawTouchButtons
       dentro il disegno, col centro davvero messo sulla tela, lo stato
       premuto e l'alfa. Sa dove il pulsante STA.

   Non sono INDIPENDENTI e non si spacciano per tali: tutte e due
   scendono da touchBtnLayout, che e' anche quella che Touch5.start usa
   per risolvere il tocco. Cio' che l'incrocio certifica e' che l'export
   non e' stato decorato e che il comando e' DIPINTO in questo istante —
   non che il tocco cada li'. Se un giorno qualcuno separasse la posa
   dal tocco, questo incrocio non se ne accorgerebbe: sta scritto qui
   perche' chi legge non ci conti sopra piu' di quanto pesi.
   Confrontare la prima sorgente con se stessa vedrebbe solo un pulsante
   che si MUOVE, mai uno SBAGLIATO: un export che mentisse di cinque
   pixel sempre uguali passerebbe verde, e uno che mentisse di trecento
   darebbe ROSSO accusando il gioco. Le due sorgenti insieme lo vedono.
   Misurato sul gioco sano: coincidono a 0,00 px a riposo e a 2 px in y
   col tasto premuto (l'affondamento "aff" del disegno), quindi la
   tolleranza e' 1 px una volta tolto l'affondamento. In MENU la prima
   risponde e la seconda e' vuota: e' cosi' che si vede una scena in cui
   il comando non e' dipinto.

   Il ripiego che stava qui (grande a (vw-66, vh-140), piccolo a
   (vw-70, vh-232)) era la trappola di casa numero quattro armata: il
   gioco li disegna a (vw-64, vh-60) e (vw-158, vh-72), cioe' a 80,0 px
   e 182,6 px di DISTANZA (160 px e' la sola componente verticale del
   secondo, non la distanza). Il ripiego avrebbe premuto il PRATO.

   Se il banco non e' valido lo strumento esce con 2, non con 1: "non ho
   potuto misurare" non si scrive come "il gioco non risponde". E non si
   ferma il giro: la giocata guasta si segna NON MISURATA e le altre si
   misurano lo stesso.
   Il contesto si risolve al touchstart, e cosi' anche la misura.

   Il cancello: se il bersaglio della giocata non risponde entro 500 ms
   dal momento in cui il gesto COMANDA, la giocata e' NO e lo strumento
   esce con 1. Il momento che comanda non e' sempre l'inizio del gesto:
   per tap, flick e carica e' il rilascio — e' il dito che tiene aperta
   la carica, misurare dall'appoggio boccerebbe per costruzione anche
   una carica perfetta — mentre per il trascinamento e per i pulsanti
   contestuali (l'azione parte al touchstart) e' l'appoggio del dito.
   Si stampano entrambe le distanze.

   La risposta non basta: dev'essere l'azione GIUSTA, e lo dice lo STATO
   del gioco, non l'impressione. Il tiro e la carica pretendono il
   contatore dei tiri; la filtrante il contatore delle filtranti e una
   palla rasoterra piu' rapida del passaggio; il cross il contatore dei
   cross e una palla che prende quota (b.z); il cambio un indice del
   comandato diverso; il contrasto un p.slide acceso sul comandato.

   La prova che sa fallire: --pausa esegue le stesse giocate col gioco
   in pausa (e rende l'overlay trasparente ai tocchi, se no il dito
   premerebbe RIPRENDI e la prova non proverebbe niente). Se anche una
   sola giocata dice OK in pausa, lo strumento sta attestando: va
   riparato, non consegnato.

   uso:
     node strumenti/giocata.js --giocata tiro
     node strumenti/giocata.js --tutte
     node strumenti/giocata.js --tutte --filmato filmati/giocate.webm --json giocate.json
     node strumenti/giocata.js --tutte --pausa     (deve dire NO e uscire con 1)
     node strumenti/giocata.js --elenco
   ===================================================================== */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
/* --- innesto di _banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? __PROVA : f;

const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = __rid(path.join(RADICE, decodeURIComponent(req.url.split('?')[0])));
      if ((!f.startsWith(RADICE) && f !== __PROVA) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const attesa = ms => new Promise(r => setTimeout(r, ms));
const dentro = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const esiti = [];
/* LE NOTE STANNO SOTTO LA GIOCATA CHE LE HA PRODOTTE, e non sotto quella
   di prima. BANCO ONESTO: nessun ripiego muto.
   Il difetto misurato: premiPulsante stampava le sue note DURANTE la
   pressione, mentre il verdetto si stampa dopo — cosi' la nota dell'alfa
   di 'contrasto' compariva dentro il blocco di 'cambio', e chi leggeva
   concludeva che il cambio avesse premuto il disco grande. Su uno
   strumento che si consegna contro i difetti di attribuzione era la
   stessa malattia in miniatura. Adesso le note tornano al chiamante e le
   stampa questa funzione, dopo la riga della sua giocata. */
function verifica(ok, testo, dettaglio, note) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\n         ' + dettaglio : ''));
  for (const n of (note || [])) console.log('         (' + n + ')');
}

/* ------------------------------------------------------- banco fermo --
   Un gesto che non si puo' posare dove il gioco dichiara non e' una
   giocata fallita: e' una MISURA CHE NON ESISTE. Le due cose non si
   scrivono allo stesso modo, e nemmeno si consegnano allo stesso modo:
     uscita 1 = il dito ha chiesto e il gioco non ha risposto;
     uscita 2 = lo strumento non ha potuto chiedere niente.
   Confonderle e' come ripiegare in silenzio, solo un passo piu' in la'.
   E UNA GIOCATA CHE NON SI PUO' MISURARE NON NE FERMA ALTRE SEI. Una
   fermata secca buttava via anche le misure buone: trascina i pulsanti
   non li tocca nemmeno, e il suo numero e' valido anche su un gioco che
   i pulsanti non li dichiara. Qui la giocata guasta si segna come NON
   MISURATA — che non e' FALLITA — e il giro continua; alla fine lo
   strumento esce con 2. */
const bancoRotto = [];
function bancoNonValido(nome, motivo) {
  bancoRotto.push({ nome, motivo });
  console.log('  --   ' + nome + ': NON MISURATA — banco non valido');
  console.log('         ' + motivo);
  console.log("         Non premo a memoria: questa giocata non e' fallita, non e' stata misurata.");
}

/* ------------------------------------------- LE DUE SORGENTI, INCROCIATE
   pulsanti(0)   = ricalcolo (touchBtnLayout): dove il pulsante DEVE stare
   comandiTouch  = dipinto (drawTouchButtons): dove il pulsante STA
   Un export che mente in modo COSTANTE non si vede confrontando la prima
   con se stessa. Si vede solo qui. Non sono due sorgenti indipendenti —
   scendono tutte e due da touchBtnLayout — e cio' che certificano e'
   scritto nel cappello: l'export non decorato, e il comando dipinto ORA.
   TOLL_INCROCIO = 1 px: misurato, le due sorgenti coincidono a 0,00 px a
   riposo; l'unico scarto legittimo e' l'affondamento di 2 px in y del
   tasto premuto, che si sottrae prima di confrontare. */
const TOLL_INCROCIO = 1, AFFONDAMENTO = 2;
function guardaPulsanti(a) {
  /* gira NELLA PAGINA (quindi non vede nessuna costante di questo file:
     tolleranza e affondamento arrivano come argomenti). Torna il centro
     da premere, o il motivo per cui non si puo' premere niente. */
  const quale = a.quale, attoAtteso = a.atto, TOLL = a.toll, AFF = a.aff;
  const t = window.__test;
  if (typeof t.pulsanti !== 'function')
    return { errore: "__test.pulsanti non esiste: senza la geometria dichiarata dal gioco i pulsanti non si premono a memoria" };
  let bt;
  try { bt = t.pulsanti(0); }
  catch (e) { return { errore: "__test.pulsanti(0) e' esploso: " + e.message }; }
  if (!Array.isArray(bt) || bt.length < 2)
    return { errore: "__test.pulsanti(0) non dichiara due pulsanti: " + JSON.stringify(bt) };
  for (const b of bt) {
    if (!(isFinite(b.x) && isFinite(b.y) && b.r > 0))
      return { errore: 'un pulsante dichiarato non ha centro o raggio validi: ' + JSON.stringify(b) };
  }
  /* grande e piccolo per RAGGIO, non per posizione nell'array: dare per
     scontato che bt[0] sia il grande sarebbe di nuovo un ripiego, solo
     scritto meglio. */
  const gr = bt.reduce((a, z) => (z.r > a.r ? z : a), bt[0]);
  const pc = bt.filter(z => z !== gr)[0];
  const ric = quale === 'grande' ? gr : pc;
  /* LA SECONDA SORGENTE */
  if (!Array.isArray(t.comandiTouch))
    return { errore: "__test.comandiTouch non esiste: con una sola sorgente non posso accorgermi di un export che mente sempre allo stesso modo" };
  const zone = t.comandiTouch.filter(z => z.tipo === 'pulsante' && (z.team | 0) === 0);
  if (!zone.length)
    return { errore: "il gioco non sta DIPINGENDO nessun pulsante in questo istante (comandiTouch e' vuoto di pulsanti): " +
                     'premerei un comando che non c\'e\' sullo schermo. Scena ' + (t.state || '?') };
  const dip = zone.find(z => Math.abs(z.r - ric.r) < 0.5) ||
              zone.reduce((a, z) => (z.r > a.r ? z : a), zone[0]);
  const dipY = dip.y - (dip.premuto ? AFF : 0);
  const d2 = Math.hypot(dip.x - ric.x, dipY - ric.y);
  if (!(d2 <= TOLL))
    return { errore: 'LE DUE SORGENTI NON TORNANO. __test.pulsanti(0) dice (' + ric.x.toFixed(1) + ',' + ric.y.toFixed(1) +
      "), ma il gioco ha DIPINTO quel comando a (" + dip.x.toFixed(1) + ',' + dipY.toFixed(1) + '): ' + d2.toFixed(2) +
      ' px di scarto, oltre ' + TOLL + '. Una delle due mente, e non so quale: non premo.' };
  if (attoAtteso && ric.act !== attoAtteso)
    return { errore: "il disco " + quale + " in questo istante e' '" + ric.act + "' (" + (ric.label || '?') +
      "), non '" + attoAtteso + "': premendolo misurerei un'altra giocata e la chiamerei con questo nome" };
  if (attoAtteso && dip.act !== attoAtteso)
    return { errore: "il disco " + quale + " DIPINTO in questo istante e' '" + dip.act + "', non '" + attoAtteso +
      "': lo schermo offre un atto diverso da quello che sto per misurare" };
  return { x: Math.round(ric.x), y: Math.round(ric.y), r: ric.r, act: ric.act, label: ric.label,
           alfa: dip.alpha === undefined ? 1 : dip.alpha, incrocio: +d2.toFixed(2) };
}

/* IL PULSANTE, PREMUTO DOVE IL GIOCO DICE CHE STA ADESSO — e non dove
   stava quando il campo e' stato preparato. Fra preparaQuiete e il gesto
   passano centinaia di millisecondi: il contesto dei due dischi cambia
   (TIRA/CONTRASTA, PASSAGGIO/CAMBIO) e la posa potrebbe cambiare. Si
   preme il centro di ADESSO, quindi uno spostamento non e' un guasto: e'
   solo un fatto, e si scrive. Il guasto e' che le due sorgenti non
   tornino, o che il comando non sia dipinto, o che l'atto sia un altro.
   'extra' serve al cross: un secondo dito e' gia' appoggiato (la levetta
   dello scatto) e il tocco del pulsante deve AGGIUNGERSI, non
   sostituirlo. */
async function premiPulsante(cdp, pag, info, quale, tenutaMs, attoAtteso, extra) {
  const ora = await pag.evaluate(guardaPulsanti,
    { quale, atto: attoAtteso, toll: TOLL_INCROCIO, aff: AFFONDAMENTO });
  if (ora.errore) throw Object.assign(new Error(ora.errore), { banco: true });
  ora.note = [];
  const prima = info && info[quale];
  if (prima && Math.hypot(prima.x - ora.x, prima.y - ora.y) > 0.5) {
    ora.note.push('il ' + quale + " si e' spostato di " +
      Math.hypot(prima.x - ora.x, prima.y - ora.y).toFixed(1) + ' px dalla preparazione: premo dove sta adesso, (' +
      ora.x + ',' + ora.y + ')');
  }
  if (ora.alfa < 0.999) {
    ora.note.push('il ' + quale + " e' dipinto al " + (ora.alfa * 100).toFixed(0) +
      "% — si e' fatto da parte per il pallone. Il tocco non cambia: la mappa dei tocchi non legge l'alfa.");
  }
  if (extra && extra.altreDita && extra.altreDita.length) {
    await dita.giu(cdp, [...extra.altreDita, { x: ora.x, y: ora.y, id: extra.id }]);
    await attesa(tenutaMs);
    await dita.su(cdp, [{ x: ora.x, y: ora.y, id: extra.id }]);
  } else {
    await dito.giu(cdp, ora.x, ora.y);
    await attesa(tenutaMs);
    await dito.su(cdp);
  }
  return ora;
}

/* --------------------------------------------------- dita di protocollo
   Un solo dito, mosso con Input.dispatchTouchEvent: sono gli stessi
   eventi che manda lo schermo di un telefono, non chiamate alle funzioni
   del gioco. Se il gioco non li ascolta, qui non risponde niente. */
const dito = {
  giu: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
  su: (cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
};
/* ------------------------------------------------------- e DUE dita --
   BANCO ONESTO: nessun ripiego muto. Il cross di oggi non e' piu'
   un flick: e' il pulsante piccolo premuto MENTRE lo scatto e' tenuto
   (doFiltrante -> comeCross, CALCETTO-il-gioco.html:9187), e lo scatto
   su touch e' la levetta spinta oltre 66 px (humanSprint, :8665) —
   cioe' DUE dita giu' insieme. Con un dito solo quel gesto non si puo'
   nemmeno tentare, e infatti prima non si tentava: si tentava un flick
   che il gioco non ascolta piu'.
   La semantica di Input.dispatchTouchEvent e' MISURATA, non dedotta
   (strumenti/_sonda-duedita.js, 19 ago 2026): con touchStart la lista
   sono i punti attivi e la pagina riceve un touchstart solo per i
   NUOVI; con touchEnd la lista sono i punti che si ALZANO, e la lista
   vuota li alza tutti. La pagina ha visto, in ordine:
     touchstart/1 · touchmove x5 · touchstart/2 · touchend/1 · touchend/0
   cioe' due Touch veri e distinti, non un dito che salta. */
const dita = {
  giu: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punti }),
  sposta: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: punti }),
  su: (cdp, punti) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: punti || [] }),
};

/* ============================================================ GIOCATE ==
   Ognuna: come si prepara il campo (possesso o palla libera davanti),
   quale bersaglio deve rispondere, quale istante del gesto comanda
   ('inizio' = appoggio del dito, 'ultimoInizio' = appoggio dell'ULTIMO
   dito quando ne servono due, 'fine' = rilascio), e il gesto stesso.
   ====================================================================== */
const GIOCATE = {
  /* TOLTA 'tocco' (tap vicino alla palla = passaggio). BANCO ONESTO: nessun ripiego muto:
     quel gesto usciva dal rilascio della levetta, e il rilascio della
     levetta e' inerte dal 19 agosto 2026 (Touch5.release torna false,
     CALCETTO-il-gioco.html:8994). Misurata tre volte su tre su questa
     base: la palla non rispondeva mai entro il cancello (688, 803 e 725
     ms, e quel movimento non era nemmeno del dito). Il VERBO pero' c'e'
     ancora, sul pulsante piccolo, e adesso si misura li'. */
  passaggio: {
    titolo: "pulsante piccolo col pallone e NESSUN compagno nel cono di mira (PASSAGGIO) -> palla giocata al piu' smarcato",
    possesso: true, bersaglio: 'palla', comando: 'inizio', miraVuota: true, richiedePassaggio: true,
    async gesto(cdp, pag, info) {
      /* stesso pulsante della filtrante, stessa risoluzione al
         touchstart: cambia il CAMPO, non il dito. Senza nessun compagno
         con dot>0,5 nella direzione chiesta eseguiFiltrante ripiega su
         eseguiPassUmano (CALCETTO-il-gioco.html:9186) — il ramo che il
         gioco ha aggiunto proprio perche', tolto il rilascio, questo
         pulsante e' l'UNICO modo di passare la palla col dito. Se quel
         ramo si rompesse, oggi nessuno se ne accorgerebbe. */
      return premiPulsante(cdp, pag, info, 'piccolo', 80, 'through');
    },
  },
  trascina: {
    titolo: 'trascinamento del giocatore verso la palla libera',
    possesso: false, avanti: 110, bersaglio: 'giocatore', comando: 'inizio',
    async gesto(cdp, pag, info) {
      let x = info.comandato.x, y = info.comandato.y;
      const dx = info.palla.x - x, dy = info.palla.y - y, l = Math.max(1, Math.hypot(dx, dy));
      const px = dx / l, py = dy / l;
      await dito.giu(cdp, x, y);
      /* 14 passi da 7 px: si supera la zona morta dello stick (12 px),
         si arriva alla corsa piena (46 px) e oltre (sprint a 66 px) */
      for (let i = 0; i < 14; i++) {
        x = dentro(x + px * 7, 15, info.vw - 15);
        y = dentro(y + py * 7, 60, info.vh - 60);
        await dito.sposta(cdp, x, y);
        await attesa(28);
      }
      /* il dito resta fermo prima di alzarsi: il rilascio lento non e'
         un flick, quindi non parte nessun tiro o scivolata per sbaglio */
      await attesa(350);
      await dito.su(cdp);
    },
  },
  /* TOLTA 'tiro' (flick veloce verso la porta). BANCO ONESTO: nessun ripiego muto:
     stesso motivo del tap — nasceva dal rilascio della levetta, che
     oggi non produce niente. Misurata tre volte su tre su questa base:
     "la palla non cambia mai velocita' dopo il gesto", cioe' lo
     strumento accusava il gioco di non rispondere a un gesto che il
     gioco ha tolto apposta. Il VERBO TIRA e' sul pulsante grande e lo
     misura la giocata 'carica' qui sotto, con la carica tenuta: e' lo
     stesso contatore (G.stats.tiri) e la stessa firma di stato. */
  carica: {
    titolo: 'pressione tenuta ~600 ms sul pulsante grande col pallone (TIRA), poi rilascio',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine', richiedeTiro: true,
    async gesto(cdp, pag, info) {
      /* lo schema touch e' unico e il bottone GRANDE col possesso e'
         TIRA. Dove stia lo dice il gioco (info.grande), non questa riga:
         vedi il cappello di _toppa-giocata.js. setTouchButtons e' uno
         shim senza effetto; la chiamata resta per compatibilita' con le
         versioni vecchie del gioco. 600 ms cadono dentro la finestra
         dolce 500-800 ms. */
      await pag.evaluate(() => window.__test.setTouchButtons(true));
      /* il centro si chiede QUI, non alla preparazione, e a tutt'e due le
         sorgenti; l'atto atteso e' 'shot' (TIRA col possesso) */
      const r = await premiPulsante(cdp, pag, info, 'grande', 600, 'shot');
      await pag.evaluate(() => window.__test.setTouchButtons(false));
      return r;
    },
  },
  filtrante: {
    /* l'etichetta del disco piccolo col possesso oggi dice PASSAGGIO
       (touchBtnLayout, CALCETTO-il-gioco.html:8803): la filtrante e' la
       sua forma MIRATA, non un secondo pulsante. */
    titolo: "pulsante piccolo col pallone e un compagno nel cono di mira -> filtrante tesa e rasoterra",
    possesso: true, bersaglio: 'palla', comando: 'inizio', mira: true, richiedeFiltrante: true,
    async gesto(cdp, pag, info) {
      /* il pulsante PICCOLO: il centro lo dice il gioco (info.piccolo).
         L'azione parte al TOCCO, non al rilascio: comanda l'appoggio,
         con i 50 ms dell'anticipo umano davanti. La mira viene dal corpo
         (nessuna levetta attiva): la quiete ha gia' girato la faccia del
         comandato verso un compagno, perche' la filtrante pretende un
         bersaglio con dot > 0,5. */
      return premiPulsante(cdp, pag, info, 'piccolo', 80, 'through');
    },
  },
  cross: {
    /* IL CROSS OGGI SI BATTE CON DUE DITA. BANCO ONESTO: nessun ripiego muto.
       Il flick trasversale non esiste piu' (Touch5.release inerte,
       CALCETTO-il-gioco.html:8994) e questa giocata falliva tre volte
       su tre su un gioco sano. Il verbo pero' c'e': doFiltrante diventa
       doCross quando lo SCATTO e' tenuto e il comandato sta nella meta'
       campo offensiva (:9187). Lo scatto su touch e' la levetta spinta
       oltre STICK_SPRINT = 66 px (humanSprint, :8665) — quindi serve un
       pollice sinistro che resta giu' mentre il destro preme il disco
       piccolo. E' il gesto che farebbe una persona, non una scorciatoia:
       lo scatto da TASTIERA passerebbe dallo stesso humanSprint e
       lascerebbe verde un gioco con lo scatto touch rotto. */
    titolo: "pulsante piccolo col pallone e lo SCATTO TENUTO dalla meta' campo offensiva -> palla alta verso l'area",
    possesso: true, bersaglio: 'palla', comando: 'ultimoInizio', zonaOffensiva: true, richiedeCross: true,
    async gesto(cdp, pag, info) {
      /* il pollice della levetta: lontano dai due dischi (che stanno
         nell'angolo basso a destra) e spinto di 90 px, oltre i 66 dello
         scatto. La spinta e' verso il BASSO dello schermo: il comandato
         corre lungo y e resta nella meta' campo offensiva, che e' una
         condizione su x (metaOffensiva, CALCETTO-il-gioco.html:9045). */
      const AX = Math.round(info.vw * 0.26), AY = Math.round(info.vh * 0.50), SPINTA = 90;
      await dita.giu(cdp, [{ x: AX, y: AY, id: 1 }]);
      for (let i = 1; i <= 5; i++) {
        await dita.sposta(cdp, [{ x: AX, y: AY + Math.round(SPINTA * i / 5), id: 1 }]);
        await attesa(16);
      }
      const r = await premiPulsante(cdp, pag, info, 'piccolo', 80, 'through',
        { id: 2, altreDita: [{ x: AX, y: AY + SPINTA, id: 1 }] });
      await dita.su(cdp, []);        // e adesso si alza anche la levetta
      return r;
    },
  },
  cambio: {
    titolo: 'pulsante piccolo senza pallone (CAMBIO) -> il comando passa a un altro giocatore',
    possesso: false, avanti: 80, bersaglio: 'ctrl', comando: 'inizio', compagniLontani: true,
    async gesto(cdp, pag, info) {
      /* stesso pulsante della filtrante, contesto opposto: senza
         possesso di squadra l'atto risolto al touchstart e' 'swap'.
         Il bersaglio qui non e' una velocita': e' l'INDICE del
         comandato, che deve cambiare. La quiete tiene i compagni ad
         almeno 170 unita' dalla palla perche' il cambio AUTOMATICO non
         possa rubare la misura al cambio chiesto col dito. */
      return premiPulsante(cdp, pag, info, 'piccolo', 80, 'swap');
    },
  },
  contrasto: {
    titolo: 'pulsante grande senza pallone (CONTRASTA) vicino al portatore -> scivolata',
    possesso: false, bersaglio: 'giocatore', comando: 'inizio', portatore: true, compagniLontani: true, richiedeScivolata: true,
    async gesto(cdp, pag, info) {
      /* stesso pulsante della carica, contesto opposto: senza possesso
         l'atto e' 'slide'. La quiete ha messo il PORTATORE avversario a
         84 unita' dal comandato: la scivolata si abbassa (0,06 s di
         anticipo umano) e poi parte, rimirata sul pallone di adesso. */
      return premiPulsante(cdp, pag, info, 'grande', 80, 'slide');
    },
  },
};

/* ------------------------------------------------------------- sonda --
   Vive nella pagina: un ciclo rAF che campiona palla, giocatore
   comandato e giocatore piu' vicino alla palla, piu' un orecchio in
   cattura sugli eventi touch per sapere QUANDO la pagina li ha visti
   davvero (la latenza si misura da li', non da quando il nodo li ha
   spediti). */
function installaSonda() {
  window.__sonda = { campioni: [], eventi: [], via: false };
  for (const tipo of ['touchstart', 'touchmove', 'touchend']) {
    addEventListener(tipo, e => {
      if (!window.__sonda.via) return;
      const c = e.changedTouches && e.changedTouches[0];
      window.__sonda.eventi.push({ tipo, t: performance.now(), x: c ? c.clientX : null, y: c ? c.clientY : null });
    }, { capture: true, passive: true });
  }
  window.__sondaVia = () => {
    const S = window.__sonda;
    S.campioni.length = 0; S.eventi.length = 0; S.via = true;
    const G = window.__test.G;
    const giro = () => {
      if (!S.via) return;
      const pi = G.ctrl[0];
      const p = pi >= 0 ? G.players[pi] : null;
      let vic = null, vi = -1, dm = 1e9;
      for (let i = 0; i < G.players.length; i++) {
        const q = G.players[i];
        const d = Math.hypot(q.x - G.ball.x, q.y - G.ball.y);
        if (d < dm) { dm = d; vic = q; vi = i; }
      }
      const b = G.ball;
      S.campioni.push({
        t: performance.now(),
        /* z e passTo sono le firme delle azioni nuove: il cross esiste
           solo se la palla prende quota, la filtrante solo se resta a
           terra e con un destinatario assegnato */
        palla: { x: b.x, y: b.y, vx: b.vx, vy: b.vy, z: b.z || 0, owner: b.owner, passTo: b.passTo !== undefined ? b.passTo : null },
        /* IL REGISTRO DEI TOCCHI DEL GIOCO (G.touches, riempito da
           segnaTocco, CALCETTO-il-gioco.html:7891): il pulse dell'ultimo
           tocco: e' il modo che il gioco ha di dire "il pallone e' stato
           toccato di nuovo", anche quando nessuno lo prende. Serve a
           chiudere la finestra del volo — vedi analizza(). */
        ultimoTocco: (G.touches && G.touches.length) ? G.touches[G.touches.length - 1].t : null,
        comandato: p ? { i: pi, x: p.x, y: p.y, vx: p.vx, vy: p.vy, carica: p.charge !== undefined ? p.charge : null, slide: p.slide !== undefined ? p.slide : null } : null,
        vicino: vic ? { i: vi, x: vic.x, y: vic.y, vx: vic.vx, vy: vic.vy } : null,
        scena: G.scene, pausa: !!G.paused,
      });
      requestAnimationFrame(giro);
    };
    requestAnimationFrame(giro);
  };
  window.__sondaAlt = () => {
    window.__sonda.via = false;
    return { campioni: window.__sonda.campioni, eventi: window.__sonda.eventi };
  };
}

/* --------------------------------------------------- quiete sul campo --
   Ogni giocata parte da uno stato governato: partita in corso, palla
   ferma (al piede o libera davanti al giocatore comandato), avversari
   allontanati quanto basta a non rubare la misura nei 500 ms del
   cancello. Tutto con gli hook __test: il file del gioco non si tocca. */
function preparaQuiete(opz) {
  const t = window.__test, G = t.G;
  t.setPaused && t.setPaused(false);
  try { if (t.Tut && t.Tut.active && t.Tut.finish) t.Tut.finish(true); } catch (e) {}
  for (let i = 0; i < 300 && G.scene !== 'play'; i++) t.simulate(0.1);
  if (G.scene !== 'play') return { errore: "la partita non arriva mai in gioco: scena '" + G.scene + "'" };
  t.setTimeLeft && t.setTimeLeft(80);      // mai a ridosso del fischio finale
  const pi = G.ctrl[0];
  if (pi < 0) return { errore: 'nessun giocatore comandato (G.ctrl[0] = -1)' };
  const p = G.players[pi];
  /* una carica rimasta aperta dalla giocata precedente bloccherebbe
     l'anticipo del gesto nuovo: si chiude come farebbe chiudiAnticipo */
  if (p.charge !== undefined && p.charge >= 0) { p.charge = -1; p.chargeKind = 'tiro'; p.chargeT = 0; p.chargeGo = null; }
  /* il cross esiste solo dalla meta' campo offensiva: il comandato si
     porta in fascia (y sotto il centro, x ben oltre FW/2) PRIMA di
     ricevere palla. Punto fisso = giocata ripetibile. */
  if (opz.zonaOffensiva) { const c = t.campo; p.x = c.FW * 0.68; p.y = c.FH * 0.26; }
  for (const q of G.players) { q.vx = 0; q.vy = 0; }
  const b = G.ball;
  b.vx = 0; b.vy = 0; b.vz = 0; b.z = 0; b.curve = 0; b.passTo = -1;
  /* la palla si mette dal lato del centro dello schermo, cosi' il gesto
     resta dentro il viewport qualunque sia la posizione del comandato */
  const v = t.view;
  const cx = (innerWidth / 2 - v.Ax) / v.S2;
  const dir = cx >= p.x ? 1 : -1;
  let portatore = -1;
  if (opz.portatore) {
    /* il contrasto si prova sul PORTATORE: il pallone va all'avversario
       di movimento piu' vicino, messo a 84 unita' dal comandato —
       dentro il raggio (140) in cui la scivolata ha un bersaglio onesto */
    let dm = 1e9;
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team !== 1 || q.out > 0 || q.role === 'gk') continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < dm) { dm = d; portatore = i; }
    }
    if (portatore < 0) return { errore: 'nessun avversario di movimento a cui dare il pallone' };
    const q = G.players[portatore];
    q.x = p.x + dir * 84; q.y = p.y;
    b.owner = portatore; b.x = q.x + dir * 8; b.y = q.y;
  } else if (opz.possesso) { b.owner = pi; b.x = p.x + dir * 8; b.y = p.y; }
  else { b.owner = -1; b.x = p.x + dir * (opz.avanti || 0); b.y = p.y; }
  for (let i = 0; i < G.players.length; i++) {
    const q = G.players[i];
    if (q.team === 0 || i === portatore) continue;
    const d = Math.hypot(q.x - b.x, q.y - b.y);
    if (d < 170) {
      const l = Math.max(1, d);
      q.x = b.x + (q.x - b.x) / l * 230;
      q.y = b.y + (q.y - b.y) / l * 230;
    }
  }
  if (opz.compagniLontani) {
    /* anche i COMPAGNI si scostano dalla palla: il cambio automatico
       scatta quando un altro e' piu' vicino di 14 unita' per 200 ms, e
       ruberebbe la misura del cambio manuale (o il comandato al
       contrasto a meta' finestra) */
    for (let i = 0; i < G.players.length; i++) {
      const q = G.players[i];
      if (q.team !== 0 || i === pi || q.role === 'gk') continue;
      const d = Math.hypot(q.x - b.x, q.y - b.y);
      if (d < 170) {
        const l = Math.max(1, d);
        q.x = b.x + (q.x - b.x) / l * 230;
        q.y = b.y + (q.y - b.y) / l * 230;
      }
    }
  }
  if (opz.mira) {
    /* la filtrante senza levetta parte dove GUARDA il corpo, e pretende
       un compagno con dot > 0,5: la faccia si gira dritta sul compagno
       di movimento piu' vicino, e il bersaglio esiste per costruzione.
       Da fermo e senza input la faccia non ruota piu' da sola. */
    let mig = null, md = 1e9;
    for (const q of G.players) {
      if (q.team !== 0 || q === p || q.out > 0 || q.role === 'gk') continue;
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < md) { md = d; mig = q; }
    }
    if (!mig) return { errore: 'nessun compagno di movimento a cui filtrare' };
    const dx = mig.x - p.x, dy = mig.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    p.fx = dx / l; p.fy = dy / l;
  }
  if (opz.miraVuota) {
    /* IL CONTRARIO DELLA MIRA. BANCO ONESTO: nessun ripiego muto.
       Il passaggio semplice non ha un pulsante suo: e' il RIPIEGO di
       eseguiFiltrante quando nel cono chiesto non c'e' nessun compagno
       con dot > 0,5 (CALCETTO-il-gioco.html:9186). Per misurarlo serve
       una faccia girata dove non c'e' nessuno, e la si CERCA invece di
       sceglierla a occhio: 72 direzioni, si tiene quella che minimizza
       il dot peggiore. Si pretende 0,35 e non 0,5 — la soglia del
       gioco — per non misurare sul filo di una disuguaglianza. Se una
       direzione cosi' non esiste, non si preme e si dice perche'. */
    const compagni = [];
    for (const q of G.players) {
      if (q.team !== 0 || q === p || q.out > 0 || q.role === 'gk') continue;
      compagni.push(q);
    }
    if (!compagni.length) return { errore: 'nessun compagno di movimento: il passaggio semplice non avrebbe destinatari' };
    let miglior = null, peggioreDot = 2;
    for (let k = 0; k < 72; k++) {
      const an = k * Math.PI / 36, mx = Math.cos(an), my = Math.sin(an);
      let peggio = -2;
      for (const q of compagni) {
        const ddx = q.x - p.x, ddy = q.y - p.y, ll = Math.max(1, Math.hypot(ddx, ddy));
        peggio = Math.max(peggio, (ddx * mx + ddy * my) / ll);
      }
      if (peggio < peggioreDot) { peggioreDot = peggio; miglior = [mx, my]; }
    }
    if (!(peggioreDot <= 0.35))
      return { errore: 'non esiste una direzione senza compagni nel cono: il dot migliore resta ' + peggioreDot.toFixed(2) +
                       " (il gioco filtra sopra 0,5), quindi non posso distinguere il passaggio dalla filtrante" };
    p.fx = miglior[0]; p.fy = miglior[1];
  }
  const sx = w => w * v.S2 + v.Ax, sy = w => w * v.S2 + v.Ay;
  /* DOVE SONO I COMANDI, chiesto al gioco invece che ricordato a
     memoria. __test.pulsanti(0) restituisce lo stesso array che il
     gioco usa per disegnarli e per risolvere il tocco: centro, raggio,
     atto. Il ripiego sulle coordinate storiche serve solo ai file
     d'archivio che non esportano la funzione. */
  /* BANCO ONESTO: nessun ripiego muto. Niente ripiego. Qui la
     geometria e' solo INFORMATIVA — il gesto la richiede di nuovo, e
     alle due sorgenti, un istante prima di premere (vedi
     premiPulsante). Se qui manca non si ferma niente: le giocate che i
     pulsanti non li toccano vanno misurate lo stesso. */
  let bottoni = null, bancoErrore = null;
  if (typeof window.__test.pulsanti !== 'function')
    bancoErrore = "__test.pulsanti non esiste: senza la geometria dichiarata dal gioco i pulsanti non si premono a memoria";
  else {
    try { bottoni = window.__test.pulsanti(0); }
    catch (e) { bancoErrore = "__test.pulsanti(0) e' esploso: " + e.message; }
    if (!bancoErrore && (!Array.isArray(bottoni) || bottoni.length < 2))
      bancoErrore = "__test.pulsanti(0) non dichiara due pulsanti: " + JSON.stringify(bottoni);
    if (!bancoErrore) {
      for (const bt of bottoni) {
        if (!(isFinite(bt.x) && isFinite(bt.y) && bt.r > 0))
          { bancoErrore = 'un pulsante dichiarato non ha centro o raggio validi: ' + JSON.stringify(bt); break; }
      }
    }
  }
  let bGrande = null, bPiccolo = null;
  if (!bancoErrore) {
    /* grande e piccolo per RAGGIO, non per posizione nell'array */
    bGrande = bottoni.reduce((a, z) => (z.r > a.r ? z : a), bottoni[0]);
    bPiccolo = bottoni.filter(z => z !== bGrande)[0];
  }
  return {
    pi, bancoErrore,
    palla: { x: sx(b.x), y: sy(b.y) },
    comandato: { x: sx(p.x), y: sy(p.y) },
    vw: innerWidth, vh: innerHeight,
    grande: bGrande ? { x: Math.round(bGrande.x), y: Math.round(bGrande.y), r: bGrande.r, act: bGrande.act, label: bGrande.label } : null,
    piccolo: bPiccolo ? { x: Math.round(bPiccolo.x), y: Math.round(bPiccolo.y), r: bPiccolo.r, act: bPiccolo.act, label: bPiccolo.label } : null,
  };
}

/* ------------------------------------------------------------ analisi --
   La latenza si conta dall'istante in cui il gesto comanda alla prima
   variazione del VETTORE velocita' del bersaglio rispetto alla base
   presa in quell'istante. Le soglie tengono fuori il tremolio: un calcio
   vero vale centinaia di unita' al secondo. */
const SOGLIA_PALLA = 40, SOGLIA_GIOC = 15;   // unita' mondo al secondo
function analizza(dati, comando, bersaglio) {
  const ev = dati.eventi || [];
  if (!ev.length) return { errore: 'nessun evento touch e\' arrivato alla pagina' };
  const inizio = ev.find(e => e.tipo === 'touchstart');
  /* BANCO ONESTO: nessun ripiego muto. L'ULTIMO touchstart, non il
     primo: il cross si batte con due dita, e a comandare e' il dito che
     preme il PULSANTE — il primo (la levetta dello scatto) e' appoggiato
     centinaia di millisecondi prima e conterebbe la sua attesa come
     latenza del gioco. */
  const ultimoInizio = [...ev].reverse().find(e => e.tipo === 'touchstart');
  const fine = [...ev].reverse().find(e => e.tipo === 'touchend');
  const daChi = comando === 'inizio' ? inizio : comando === 'ultimoInizio' ? ultimoInizio : fine;
  const comandoT = daChi ? daChi.t : null;
  if (comandoT == null) return { errore: 'gesto incompleto: alla pagina manca il touch' + (comando === 'fine' ? 'end' : 'start') + ' che comanda' };
  const C = dati.campioni || [];
  if (!C.length) return { errore: 'nessun campione: la sonda non ha girato' };
  let base = null;
  for (const c of C) { if (c.t <= comandoT) base = c; else break; }
  if (!base) base = C[0];
  const vel = c => bersaglio === 'palla'
    ? [c.palla.vx || 0, c.palla.vy || 0]
    : [c.comandato ? c.comandato.vx || 0 : 0, c.comandato ? c.comandato.vy || 0 : 0];
  const [bx, by] = vel(base);
  const soglia = bersaglio === 'palla' ? SOGLIA_PALLA : SOGLIA_GIOC;
  let risp = null;
  for (const c of C) {
    if (c.t <= comandoT) continue;
    const [vx, vy] = vel(c);
    if (Math.hypot(vx - bx, vy - by) > soglia) { risp = c; break; }
  }
  let vmax = 0, caricaMax = 0;
  for (const c of C) {
    if (c.t <= comandoT - 700) continue;   // la carica matura PRIMA del rilascio
    if (c.comandato && c.comandato.carica != null) caricaMax = Math.max(caricaMax, c.comandato.carica);
    if (c.t > comandoT) vmax = Math.max(vmax, Math.hypot(c.palla.vx || 0, c.palla.vy || 0));
  }
  /* le firme di stato delle azioni nuove, lette DOPO l'istante che
     comanda: quota della palla NEL VOLO del nostro calcio (cross alto,
     filtrante rasoterra), primo p.slide acceso (contrasto), primo
     cambio dell'indice comandato (cambio), primo destinatario di
     passaggio assegnato (filtrante). La quota si guarda solo dal
     rilascio del pallone alla presa successiva: dopo, il compagno che
     ha ricevuto puo' calciare a sua volta e mettere una z che non e'
     del nostro gesto. */
  let zVoloMax = 0, inVolo = false, voloFinito = false, toccoNostro = null;
  let scivolataMs = null, cambioMs = null, nuovoIndice = null, passToVisto = null;
  const baseIdx = base.comandato ? base.comandato.i : null;
  for (const c of C) {
    if (c.t <= comandoT) continue;
    if (!voloFinito && c.palla) {
      /* LA FINESTRA DEL VOLO SI CHIUDE ANCHE SU UN TOCCO SENZA PRESA.
         BANCO ONESTO: nessun ripiego muto: prima si chiudeva solo
         quando qualcuno PRENDEVA il pallone (owner >= 0). Ma un giocatore
         che rilancia di prima non lo prende mai — kickBall rimette owner
         a -1 (CALCETTO-il-gioco.html:9054) — quindi la finestra restava
         aperta e la quota del SUO calcio finiva addosso al nostro gesto.
         Misurato su questa base, gioco sano: la filtrante, che
         eseguiFiltrante mette a vz = 0 per costruzione (:9236), usciva
         con z max 9,4 e veniva bocciata come "non rasoterra" un giro su
         cinque. Adesso la finestra finisce al primo tocco di CHIUNQUE
         dopo il nostro, letto dal registro del gioco e non indovinato. */
      if (!inVolo) { if (c.palla.owner < 0) { inVolo = true; toccoNostro = c.ultimoTocco; } }
      else if (c.palla.owner >= 0 || c.ultimoTocco !== toccoNostro) voloFinito = true;
      if (inVolo && !voloFinito && c.palla.z != null) zVoloMax = Math.max(zVoloMax, c.palla.z);
    }
    if (scivolataMs == null && c.comandato && c.comandato.slide != null && c.comandato.slide >= 0) scivolataMs = c.t - comandoT;
    if (cambioMs == null && baseIdx != null && c.comandato && c.comandato.i !== baseIdx) { cambioMs = c.t - comandoT; nuovoIndice = c.comandato.i; }
    if (passToVisto == null && c.palla && c.palla.passTo != null && c.palla.passTo >= 0) passToVisto = c.palla.passTo;
  }
  /* TOLTA la velocita' del flick. BANCO ONESTO: nessun ripiego muto.
     Misurava i px/s del dito negli ultimi 90 ms e li stampava accanto a
     "al gioco ne servono 650": quella soglia governava i quattro gesti
     del rilascio, e il rilascio e' inerte (CALCETTO-il-gioco.html:8994).
     Nessuna giocata di questo strumento e' piu' un flick, quindi il
     numero non spiegherebbe piu' niente — sarebbe solo un numero verde
     accanto a una regola che non c'e'. Regola di casa: un numero che
     nessuno rimisura pesa il doppio. */
  return {
    /* per il bersaglio 'ctrl' la risposta non e' una velocita': e' il
       cambio dell'indice del comandato, e la latenza si conta da li' */
    latenzaMs: bersaglio === 'ctrl' ? cambioMs : (risp ? risp.t - comandoT : null),
    dallInizioMs: risp && inizio ? risp.t - inizio.t : null,
    rispostaMax: vmax,
    caricaMax,
    zVoloMax, scivolataMs, cambioMs, nuovoIndice, passToVisto,
  };
}

/* ================================================================ main = */
(async () => {
  if (process.argv.includes('--elenco')) {
    for (const k of Object.keys(GIOCATE)) console.log(k.padEnd(10) + GIOCATE[k].titolo);
    return;
  }
  const inPausa = process.argv.includes('--pausa');
  const nomi = process.argv.includes('--tutte')
    ? Object.keys(GIOCATE)
    : [arg('giocata', null)].filter(Boolean);
  if (!nomi.length) { console.error('serve --giocata <nome> oppure --tutte oppure --elenco'); process.exit(1); }
  for (const n of nomi) {
    if (!GIOCATE[n]) { console.error('giocata sconosciuta: ' + n + '\ngiocate: ' + Object.keys(GIOCATE).join(', ')); process.exit(1); }
  }
  const fileFilmato = arg('filmato', null);
  const fileJson = arg('json', null);
  const seme = +arg('seme', 20260731);

  const tmp = fileFilmato ? fs.mkdtempSync(path.join(os.tmpdir(), 'giocata-')) : null;
  const srv = await servi();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 915, height: 412 }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'it-IT',
    ...(fileFilmato ? { recordVideo: { dir: tmp, size: { width: 915, height: 412 } } } : {}),
  });
  const pag = await ctx.newPage();

  /* il caso, governato: stesso generatore a seme fisso di scatta.js,
     installato PRIMA che la pagina esegua una sola riga */
  await pag.addInitScript(s0 => {
    let x = s0 >>> 0 || 1;
    const p = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x >>> 0; };
    Math.random = () => p() / 4294967296;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = p(); return a; };
    }
  }, seme);

  await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.waitForTimeout(500);
  await pag.evaluate(installaSonda);
  await pag.evaluate(() => {
    const t = window.__test;
    t.dismissSplash && t.dismissSplash();
    t.startMatch(1, 1);                     // 1 giocatore: la squadra 0 e' del dito
  });
  await pag.waitForTimeout(400);

  const cdp = await ctx.newCDPSession(pag);
  const raccolta = [];

  console.log(`\n=== GIOCATE COL DITO${inPausa ? ' — GIOCO IN PAUSA (deve fallire)' : ''} ===\n`);

  for (const nome of nomi) {
    const g = GIOCATE[nome];
    const info = await pag.evaluate(preparaQuiete, {
      possesso: !!g.possesso, avanti: g.avanti || 0,
      zonaOffensiva: !!g.zonaOffensiva, portatore: !!g.portatore,
      compagniLontani: !!g.compagniLontani, mira: !!g.mira, miraVuota: !!g.miraVuota,
    });
    if (info.errore) {
      verifica(false, `${nome}: ${g.titolo}`, info.errore);
      raccolta.push({ nome, esito: 'NO', errore: info.errore });
      continue;
    }
    if (inPausa) {
      /* pausa vera, e overlay trasparente ai tocchi: se il dito premesse
         RIPRENDI la pausa cadrebbe e la prova non proverebbe niente.
         Cosi' gli eventi ARRIVANO al canvas ed e' il gioco a doverli
         ignorare perche' G.paused — il collaudo piu' severo possibile. */
      await pag.evaluate(() => {
        window.__test.setPaused(true);
        const el = document.getElementById('pausa');
        if (el) el.style.pointerEvents = 'none';
      });
    }
    /* il tabellino prima del gesto: la velocita' della palla non basta —
       anche un passaggio la muove. Fanno fede i contatori del gioco:
       tiri per 'tiro' e 'carica', filtranti e cross per le giocate
       omonime, e l'indice del comandato per 'cambio'. Se il contatore
       giusto non sale, il gesto e' stato letto come ALTRO. */
    const contatori = () => pag.evaluate(() => {
      const G = window.__test.G;
      return {
        tiri: G.stats.tiri[0], perfetti: G.stats.perfetti[0],
        filtranti: G.stats.filtranti ? (G.stats.filtranti[0] || 0) : 0,
        cross: G.stats.cross ? (G.stats.cross[0] || 0) : 0,
        ctrl: G.ctrl[0],
      };
    });
    const prima = await contatori();
    await pag.evaluate(() => window.__sondaVia());
    await attesa(150);                       // base di quiete prima del gesto
    let noteGesto = [];
    try {
      const esitoGesto = await g.gesto(cdp, pag, info);
      if (esitoGesto && esitoGesto.note) noteGesto = esitoGesto.note;
    }
    catch (e) {
      if (!(e && e.banco)) throw e;
      /* la sonda si spegne (il suo rAF gira ancora) e si passa oltre:
         le altre giocate non c'entrano niente con questo guasto */
      await pag.evaluate(() => window.__sondaAlt());
      bancoNonValido(nome, e.message);
      raccolta.push({ nome, esito: 'NON MISURATA', banco: true, errore: e.message });
      continue;
    }
    await attesa(1300);                      // finestra di risposta
    const dati = await pag.evaluate(() => window.__sondaAlt());
    const dopo = await contatori();
    const tiriFatti = dopo.tiri - prima.tiri, perfettiFatti = dopo.perfetti - prima.perfetti;
    const filtrantiFatte = dopo.filtranti - prima.filtranti, crossFatti = dopo.cross - prima.cross;
    const a = analizza(dati, g.comando, g.bersaglio);

    if (a.errore) {
      verifica(false, `${nome}: ${g.titolo}`, a.errore, noteGesto);
      raccolta.push({ nome, esito: 'NO', errore: a.errore, note: noteGesto, campioni: dati.campioni, eventi: dati.eventi });
      continue;
    }
    const rispondeInTempo = a.latenzaMs != null && a.latenzaMs <= 500;
    /* oltre alla risposta in tempo, l'azione dev'essere quella GIUSTA:
       lo dicono i contatori del gioco e lo stato campionato, non la
       nostra impressione sul movimento della palla */
    let azioneNo = null;
    if (g.richiedeTiro && tiriFatti < 1)
      azioneNo = "la palla si muove ma il tabellino non segna tiri: il gesto e' stato letto come altro";
    if (!azioneNo && g.richiedeFiltrante) {
      if (filtrantiFatte < 1) azioneNo = "il contatore delle filtranti non sale: il gesto e' stato letto come altro (passaggio semplice?)";
      else if (a.zVoloMax > 5) azioneNo = `filtrante a tabellino ma la palla prende quota (z max ${a.zVoloMax.toFixed(1)}): la filtrante e' rasoterra per definizione`;
      else if (a.passToVisto == null) azioneNo = "filtrante a tabellino ma nessun destinatario assegnato (b.passTo resta -1): la filtrante e' diretta a un compagno per definizione";
    }
    /* TOLTO il controllo "palla sotto 420 unita'/s". BANCO ONESTO: nessun ripiego muto:
       420 era la BASE del clamp del gioco (eseguiFiltrante,
       CALCETTO-il-gioco.html:9229, clamp(380+l*1,1, 420, 640)), cioe' un
       numero del gioco ricopiato in uno strumento — e ricopiato sul
       filo, perche' una filtrante corta esce esattamente a 420 e la
       sonda la campiona un fotogramma dopo, gia' frenata. Misurato su
       questa base, gioco sano, --tutte: 416,22 e 419,x unita'/s, cioe'
       ROSSO su una filtrante regolarmente segnata a tabellino (1 giro su
       3). E la ragione scritta accanto era falsa: la filtrante NON e'
       sempre piu' rapida del passaggio semplice, che arriva a 520
       (eseguiPassUmano, :9161). Cio' che distingue i due gesti e' il
       contatore G.stats.filtranti — che solo eseguiFiltrante muove — e
       il rasoterra. La velocita' resta STAMPATA come fatto, non come
       cancello. */
    if (!azioneNo && g.richiedePassaggio) {
      if (filtrantiFatte >= 1) azioneNo = "il contatore delle filtranti sale: il cono di mira non era vuoto e ho misurato una filtrante chiamandola passaggio";
      else if (crossFatti >= 1) azioneNo = "il contatore dei cross sale: lo scatto era tenuto e ho misurato un cross chiamandolo passaggio";
      else if (a.passToVisto == null) azioneNo = "la palla si muove ma nessun destinatario e' assegnato (b.passTo resta -1): il tocco non e' stato letto come passaggio";
    }
    if (!azioneNo && g.richiedeCross) {
      if (crossFatti < 1) azioneNo = "il contatore dei cross non sale: il pulsante piccolo con lo scatto tenuto e' stato letto come altro";
      else if (!(a.zVoloMax > 10)) azioneNo = `cross a tabellino ma la palla non prende quota (z max ${a.zVoloMax.toFixed(1)}: sopra le teste serve 26)`;
    }
    if (!azioneNo && g.richiedeScivolata && (a.scivolataMs == null || a.scivolataMs > 500))
      azioneNo = a.scivolataMs == null
        ? 'il comandato non entra mai in scivolata (p.slide resta spento)'
        : `la scivolata parte solo dopo ${a.scivolataMs.toFixed(0)} ms`;
    const passa = rispondeInTempo && !azioneNo;
    const chi = g.bersaglio === 'palla' ? 'la palla' : g.bersaglio === 'ctrl' ? "l'indice del comandato" : 'il giocatore comandato';
    const daQuando = g.comando === 'inizio' ? "dall'appoggio del dito"
      : g.comando === 'ultimoInizio' ? "dall'appoggio del dito sul pulsante (con la levetta gia' giu')"
      : 'dal rilascio';
    verifica(passa, `${nome}: ${g.titolo}`,
      a.latenzaMs == null
        ? (g.bersaglio === 'ctrl'
            ? `${chi} non cambia mai dopo il gesto: nessuna risposta`
            : `${chi} non cambia mai velocita' dopo il gesto: nessuna risposta`)
        : !rispondeInTempo
          ? `risposta a ${a.latenzaMs.toFixed(0)} ms: oltre il cancello dei 500`
          : azioneNo
            ? azioneNo + ` (latenza ${a.latenzaMs.toFixed(0)} ms)`
            : `latenza ${a.latenzaMs.toFixed(0)} ms ${daQuando}` +
              (a.dallInizioMs != null && g.comando === 'fine' ? ` (${a.dallInizioMs.toFixed(0)} ms dall'inizio del gesto)` : '') +
              (g.bersaglio === 'ctrl' ? '' : ` — risposta: palla fino a ${a.rispostaMax.toFixed(0)} unita'/s`) +
              (g.richiedeTiro ? ` — tiri a tabellino +${tiriFatti}, perfetti +${perfettiFatti}` : '') +
              (nome === 'carica' ? ` — carica maturata ${a.caricaMax.toFixed(2)} s (finestra dolce 0,50-0,80)` : '') +
              (g.richiedeFiltrante ? ` — filtranti a tabellino +${filtrantiFatte}, rasoterra (z max ${a.zVoloMax.toFixed(1)})` +
                (a.passToVisto != null ? `, diretta al compagno ${a.passToVisto}` : '') : '') +
              (g.richiedeCross ? ` — cross a tabellino +${crossFatti}, quota massima z ${a.zVoloMax.toFixed(1)} (sopra le teste da 26)` : '') +
              (g.richiedePassaggio ? ` — filtranti +${filtrantiFatte} e cross +${crossFatti} (nessuno dei due: e' il passaggio semplice)` +
                (a.passToVisto != null ? `, diretto al compagno ${a.passToVisto}` : '') : '') +
              (g.bersaglio === 'ctrl' ? ` — comandato: indice ${prima.ctrl} -> ${a.nuovoIndice}` : '') +
              (g.richiedeScivolata ? ` — p.slide acceso ${a.scivolataMs.toFixed(0)} ms dopo il tocco` : ''), noteGesto);
    raccolta.push({
      nome, esito: passa ? 'OK' : 'NO',
      latenzaMs: a.latenzaMs, dallInizioMs: a.dallInizioMs,
      rispostaMaxUnitaAlSecondo: a.rispostaMax, caricaMaturataSec: a.caricaMax,
      note: noteGesto, tiriATabellino: tiriFatti, tiriPerfetti: perfettiFatti,
      filtrantiATabellino: filtrantiFatte, crossATabellino: crossFatti,
      quotaMaxPalla: a.zVoloMax, scivolataMs: a.scivolataMs,
      passTo: a.passToVisto, ctrlPrima: prima.ctrl, ctrlNuovo: a.nuovoIndice,
      comando: g.comando, bersaglio: g.bersaglio,
      campioni: dati.campioni, eventi: dati.eventi,
    });
  }

  /* video: si salva DOPO la chiusura del contesto ma PRIMA di quella del
     browser — dopo, non c'e' piu' nessuno a cui chiederlo */
  const video = fileFilmato ? pag.video() : null;
  await ctx.close();
  if (fileFilmato) {
    const uscita = path.resolve(fileFilmato);
    fs.mkdirSync(path.dirname(uscita), { recursive: true });
    await video.saveAs(uscita);
    console.log(`\nfilmato: ${uscita} (${(fs.statSync(uscita).size / 1024).toFixed(0)} kB)`);
  }
  await browser.close();
  srv.chiudi();
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });

  if (fileJson) {
    const uscita = path.resolve(fileJson);
    fs.mkdirSync(path.dirname(uscita), { recursive: true });
    fs.writeFileSync(uscita, JSON.stringify({ data: new Date().toISOString(), seme, pausa: inPausa, giocate: raccolta }, null, 1));
    console.log(`json: ${uscita} (${raccolta.reduce((s, g) => s + (g.campioni ? g.campioni.length : 0), 0)} campioni a 60 Hz)`);
  }

  const male = esiti.filter(x => !x).length;
  console.log(`\n${esiti.length} giocate misurate, ${esiti.length - male} passate, ${male} fallite` +
    (bancoRotto.length ? `  ·  ${bancoRotto.length} NON MISURATE (banco non valido)` : ''));
  if (bancoRotto.length) {
    /* BANCO ONESTO: nessun ripiego muto. L'uscita 2 viene PRIMA
       dell'uscita 1: se una parte del banco non ha funzionato, la cosa
       da dire e' quella. "Non ho potuto misurare" non si scrive come
       "il gioco non risponde". */
    console.log('\nBANCO NON VALIDO su: ' + bancoRotto.map(b => b.nome).join(', ') + '.');
    console.log(bancoRotto[0].motivo);
    console.log('Le altre giocate sono state misurate davvero e i loro numeri valgono.');
    if (male) {
      /* L'USCITA 2 COPRE L'USCITA 1, e questo si dice in chiaro invece di
         lasciarlo scoprire. Un cancello automatico che leggesse solo il
         codice d'uscita vedrebbe "non ho potuto misurare" e si
         perderebbe delle regressioni vere. Il codice resta 2 — la cosa
         piu' grave e' che il banco non ha funzionato — ma le fallite
         hanno il loro nome qui. */
      const nomiMale = raccolta.filter(r => r.esito === 'NO').map(r => r.nome);
      console.log('ATTENZIONE: ci sono ANCHE ' + male + ' giocate FALLITE (' + nomiMale.join(', ') +
        "). Il codice d'uscita 2 non le racconta: chi legge solo il codice le perde.");
    }
    process.exit(2);
  }
  if (male) {
    console.log("Una giocata fallita vuol dire che il dito ha chiesto e il gioco non ha risposto entro mezzo secondo.");
    process.exit(1);
  }
})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });
