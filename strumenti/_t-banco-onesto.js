/* =====================================================================
   BANCO ONESTO — la toppa che toglie i ripieghi muti dagli strumenti.
   TERZA EDIZIONE, rifatta contro la verifica del critico
   (_onda0/a14.md, poi _onda0bis/b12.md) e sulla base di oggi
   (CALCETTO-il-gioco.html md5 804328ee32d205024df6c265465e4ef5), che nel
   frattempo si e' spostata: sono entrate le due toppe sui comandi (il
   rilascio della levetta e' diventato inerte, e la levetta si riadotta).

   COSA AGGIUNGE LA TERZA EDIZIONE, in ordine di peso:
     1. `strumenti/giocata.js` misurava TRE GESTI CHE IL GIOCO NON HA
        PIU' — tocco, tiro e cross uscivano tutti e tre dal rilascio
        della levetta, che oggi torna false e basta. Misurato tre volte
        su tre su questa base: fallivano sempre, cioe' lo strumento
        usciva con 1 su un gioco SANO. Un cancello che accusa
        l'innocente e' peggio di nessun cancello. I due gesti spariti si
        tolgono con la riga che dice perche'; i verbi rimasti si
        misurano dove il gioco li ha messi — sui due pulsanti — e il
        cross si batte con DUE DITA VERE, perche' oggi e' il pulsante
        piccolo premuto mentre lo scatto e' tenuto.
     2. le note della pressione (alfa, spostamento) uscivano sotto la
        giocata SBAGLIATA: adesso tornano al chiamante e le stampa
        verifica(), sotto la riga che le ha prodotte.
     3. due controlli che bocciavano un gioco sano al confine — la
        velocita' minima della filtrante (un numero del gioco ricopiato)
        e la quota "rasoterra" misurata dentro il calcio di qualcun
        altro — corretti, con la misura accanto.
     4. quattro commenti del gioco che questa toppa smentisce (le
        coordinate d'archivio dei pulsanti, l'etichetta FILTRANTE, e la
        nota ai custodi dei cancelli che questa toppa soddisfa).

   IL FATTO. `strumenti/giocata.js` chiede al gioco dove sono i due
   pulsanti contestuali (`__test.pulsanti(0)`), ma se quell'export
   mancasse RIPIEGAVA IN SILENZIO su due centri d'archivio:

       grande  (innerWidth - 66, innerHeight - 140) r 40
       piccolo (innerWidth - 70, innerHeight - 232) r 30

   Il gioco, oggi (touchBtnLayout, CALCETTO-il-gioco.html:8799), li
   disegna a:

       grande  (VW - 64,  VH - 60)  r 40
       piccolo (VW - 158, VH - 72)  r 30

   La DISTANZA fra il ripiego e il vero e' 80,0 px sul grande
   (sqrt(2^2 + 80^2) = 80,02) e 182,6 px sul piccolo
   (sqrt(88^2 + 160^2) = 182,60). Nella prima edizione di questa toppa
   c'era scritto "centosessanta" per il piccolo: era la sola componente
   verticale, cioe' un numero che la misura accanto smentiva. Corretto.
   Il ripiego non e' "quasi giusto", e' PRATO.

   ================== LA COSA CHE LA PRIMA EDIZIONE NON FACEVA ==========
   Chiedere la geometria a `pulsanti(0)` e poi ricontrollarla con
   `pulsanti(0)` e' AUTOREFERENZIALE: vede un bersaglio che si MUOVE, non
   un bersaglio SBAGLIATO. Il critico l'ha dimostrato con un numero: su
   una copia dove l'export mente in modo costante (`x - 5`) lo strumento
   toppato dava verde; con `x-300, y-120` dava ROSSO CON USCITA 1, cioe'
   accusava il gioco di un difetto del banco. La trappola numero quattro
   rimessa in piedi con parole nuove.

   IL RIMEDIO SONO DUE SORGENTI, non una. Il gioco esporta anche
   `__test.comandiTouch` (CALCETTO-il-gioco.html:30210), che NON e'
   ricalcolato: lo riempie `drawTouchButtons` DENTRO il disegno
   (:26111) col centro davvero dipinto, lo stato premuto e l'alfa. Il
   gioco stesso lo indica ai custodi dei cancelli a :8766-8771. Da qui
   in giu' ogni pressione incrocia le due sorgenti, e se non tornano si
   ferma.

   Misurato sul gioco sano (strumenti/_sonda-comandi.js, 19 ago 2026):
   le due sorgenti coincidono a 0,00 px quando il tasto e' a riposo, e
   differiscono di ESATTAMENTE 2 px in y quando e' premuto — e' `aff`,
   l'affondamento del tasto (:26104). Quei 2 px si tolgono; il resto
   della tolleranza e' 1 px, non 2, perche' non c'e' arrotondamento da
   perdonare fra due letture della stessa quantita'.
   In MENU, prima di startMatch, `pulsanti(0)` risponde (851,352) e
   (757,340) mentre `comandiTouch` e' VUOTO: la seconda sorgente vede
   anche la scena in cui il comando non e' dipinto, che la prima non
   vede.

   COSA FA QUESTA TOPPA. Cerca/sostituisce su sei strumenti e sul gioco
   (quattro COMMENTI, zero righe di codice). Se anche un solo ancoraggio
   non si trova ESATTAMENTE UNA VOLTA non scrive niente
   — nemmeno i file per cui gli ancoraggi c'erano — esce con codice
   diverso da zero e dice quale manca. Quindi la toppa e' legata a QUESTA
   base del gioco, e se il gioco si sposta ancora lo dice invece di
   scrivere a meta'.

     1. strumenti/giocata.js      niente ripiego; ogni pressione incrocia
                                  le due sorgenti, controlla che l'ATTO
                                  del disco sia quello che la giocata sta
                                  misurando, e preme il centro DI ADESSO.
                                  Uscita 2, non 1: "non ho potuto
                                  misurare" non e' "il gioco non
                                  risponde". Le giocate che NON toccano
                                  pulsanti si misurano lo stesso. E le
                                  GIOCATE sono quelle che il gioco ha
                                  oggi: due gesti del rilascio tolti con
                                  la ragione scritta, il passaggio e il
                                  cross misurati sui pulsanti, il cross
                                  con due dita vere.
     2. strumenti/collaudo.js     senza una capsula d'ombra VALIDA (non
                                  solo: senza la funzione) non si
                                  campiona e il rapporto non si scrive.
     3. strumenti/quattrovalori.js  i centri dei comandi dalle due
                                  sorgenti, e l'ALFA con cui sono
                                  dipinti dichiarata invece che ignorata.
     4. strumenti/giocatore.js    due sorgenti anche coi pollici veri; e
                                  un `finally` che ALZA LE DITA e chiude
                                  il vetro comunque vada, perche' un
                                  process.exit dentro il giro lasciava il
                                  pollice sinistro premuto sul telefono.
     5. strumenti/istantanea.js   il banco 7 non ripiega piu' su B_R, ma
                                  la sua morte non porta piu' via anche
                                  le altre tredici misure; e
                                  zoneInterfaccia dichiara anche quando
                                  torna VUOTA.
     6. strumenti/_premuto.js     fotografava una pressione sull'erba.
     7. CALCETTO-il-gioco.html    quattro COMMENTI che questa toppa
                                  smentisce: tre citano le coordinate
                                  d'archivio dei pulsanti, il quarto
                                  chiama FILTRANTE un'etichetta che dice
                                  PASSAGGIO. Nessuna riga di codice, e
                                  il collaudo lo dimostra.

   uso:
     node strumenti/_t-banco-onesto.js --prova           (non scrive)
     node strumenti/_t-banco-onesto.js                   (scrive nel repo)
     node strumenti/_t-banco-onesto.js --dir <cartella>  (scrive su una copia)
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const DIR = path.resolve(arg('dir', path.resolve(__dirname, '..')));
const PROVA = process.argv.includes('--prova');

/* marcatore: se c'e' gia', la toppa e' gia' stata applicata */
const MARCA = 'BANCO ONESTO: nessun ripiego muto';

/* ===================================================================== */
const TOPPE = [];
const T = (file, cambi) => TOPPE.push({ file, cambi });
const C = (nome, cerca, sost) => ({ nome, cerca, sost });

/* --------------------------------------------------------- giocata.js */
T('strumenti/giocata.js', [

  C('giocata: il cappello, e l\'elenco dei gesti che il gioco ha davvero',
`   Le giocate sono scritte su come il gioco E', non su come lo si
   immagina. Dal codice dell'input, LO SCHEMA UNICO: stick virtuale
   ovunque sul canvas (tap col pallone = passaggio, flick veloce verso
   la porta = tiro, flick TRASVERSALE col pallone dalla meta' campo
   offensiva = cross, rilascio lento = niente) piu' DUE pulsanti
   contestuali sempre vivi nell'angolo basso a destra. DOVE stiano
   ESATTAMENTE non e' scritto qui: lo chiede il banco al gioco, con
   __test.pulsanti, e lo preme li' (vedi _toppa-giocata.js). Le
   coordinate qui sotto sono quelle storiche e restano come ripiego per
   i file d'archivio: il grande a (vw-66, vh-140) — TIRA
   col possesso, con la carica a finestra dolce 0,50-0,80 s; CONTRASTA
   senza — e il piccolo a (vw-70, vh-232) — FILTR. col possesso, CAMBIO
   senza. Il contesto si risolve al touchstart, e cosi' anche la misura.`,
`   Le giocate sono scritte su come il gioco E' OGGI, non su come era.
   ${MARCA}.

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
   Il contesto si risolve al touchstart, e cosi' anche la misura.`),

  C('giocata: il posto dove nasce fermaBanco',
`const esiti = [];
function verifica(ok, testo, dettaglio) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\\n         ' + dettaglio : ''));
}`,
`const esiti = [];
/* LE NOTE STANNO SOTTO LA GIOCATA CHE LE HA PRODOTTE, e non sotto quella
   di prima. ${MARCA}.
   Il difetto misurato: premiPulsante stampava le sue note DURANTE la
   pressione, mentre il verdetto si stampa dopo — cosi' la nota dell'alfa
   di 'contrasto' compariva dentro il blocco di 'cambio', e chi leggeva
   concludeva che il cambio avesse premuto il disco grande. Su uno
   strumento che si consegna contro i difetti di attribuzione era la
   stessa malattia in miniatura. Adesso le note tornano al chiamante e le
   stampa questa funzione, dopo la riga della sua giocata. */
function verifica(ok, testo, dettaglio, note) {
  esiti.push(!!ok);
  console.log((ok ? '  OK   ' : '  NO   ') + testo + (dettaglio ? '\\n         ' + dettaglio : ''));
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
                     'premerei un comando che non c\\'e\\' sullo schermo. Scena ' + (t.state || '?') };
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
}`),

  C('giocata: un solo dito non basta piu\'',
`const dito = {
  giu: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
  su: (cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
};`,
`const dito = {
  giu: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }),
  sposta: (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }),
  su: (cdp) => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
};
/* ------------------------------------------------------- e DUE dita --
   ${MARCA}. Il cross di oggi non e' piu'
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
};`),

  C('giocata: il tap che il gioco non ascolta piu\'',
`/* ============================================================ GIOCATE ==
   Ognuna: come si prepara il campo (possesso o palla libera davanti),
   quale bersaglio deve rispondere, quale istante del gesto comanda
   ('inizio' = appoggio del dito, 'fine' = rilascio), e il gesto stesso.
   ====================================================================== */
const GIOCATE = {
  tocco: {
    titolo: 'tap semplice vicino alla palla (col pallone al piede = passaggio)',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine',
    async gesto(cdp, pag, info) {
      const x = dentro(info.palla.x + 26, 15, info.vw - 15);
      const y = dentro(info.palla.y + 8, 60, info.vh - 60);
      await dito.giu(cdp, x, y);
      await attesa(80);
      await dito.su(cdp);
    },
  },`,
`/* ============================================================ GIOCATE ==
   Ognuna: come si prepara il campo (possesso o palla libera davanti),
   quale bersaglio deve rispondere, quale istante del gesto comanda
   ('inizio' = appoggio del dito, 'ultimoInizio' = appoggio dell'ULTIMO
   dito quando ne servono due, 'fine' = rilascio), e il gesto stesso.
   ====================================================================== */
const GIOCATE = {
  /* TOLTA 'tocco' (tap vicino alla palla = passaggio). ${MARCA}:
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
  },`),

  C('giocata: il flick del tiro, che non esiste piu\'',
`  tiro: {
    titolo: 'flick veloce verso la porta col pallone al piede',
    possesso: true, avanti: 0, bersaglio: 'palla', comando: 'fine', richiedeTiro: true,
    async gesto(cdp, pag, info) {
      /* la squadra 0 attacca verso destra: il flick deve andare a destra
         (nx > 0.25) e superare i 650 px/s negli ultimi 90 ms. I punti si
         spediscono in RAFFICA, senza aspettare il giro di ogni chiamata:
         aspettandolo, ogni evento costava decine di millisecondi di
         viaggio (di piu' con la registrazione video accesa), il flick
         usciva lento e il gioco lo leggeva — a ragione — come un
         rilascio semplice, cioe' un passaggio. In quel caso lo strumento
         stava bocciando la lentezza del proprio dito, non il gioco.
         L'ordine sul protocollo e' comunque garantito. */
      let x = dentro(info.comandato.x, 15, info.vw - 250);
      const y = dentro(info.comandato.y, 60, info.vh - 60);
      await dito.giu(cdp, x, y);
      const invii = [];
      for (let i = 0; i < 5; i++) {
        x += 44;
        invii.push(dito.sposta(cdp, x, y));
      }
      invii.push(dito.su(cdp));
      await Promise.all(invii);
    },
  },
  carica: {`,
`  /* TOLTA 'tiro' (flick veloce verso la porta). ${MARCA}:
     stesso motivo del tap — nasceva dal rilascio della levetta, che
     oggi non produce niente. Misurata tre volte su tre su questa base:
     "la palla non cambia mai velocita' dopo il gesto", cioe' lo
     strumento accusava il gioco di non rispondere a un gesto che il
     gioco ha tolto apposta. Il VERBO TIRA e' sul pulsante grande e lo
     misura la giocata 'carica' qui sotto, con la carica tenuta: e' lo
     stesso contatore (G.stats.tiri) e la stessa firma di stato. */
  carica: {`),

  C('giocata: il titolo della filtrante, con l\'etichetta di oggi',
`  filtrante: {
    titolo: 'pulsante piccolo col pallone (FILTR.) -> palla tesa a un compagno, piu\\' rapida del passaggio',
    possesso: true, bersaglio: 'palla', comando: 'inizio', mira: true, richiedeFiltrante: true,`,
`  filtrante: {
    /* l'etichetta del disco piccolo col possesso oggi dice PASSAGGIO
       (touchBtnLayout, CALCETTO-il-gioco.html:8803): la filtrante e' la
       sua forma MIRATA, non un secondo pulsante. */
    titolo: "pulsante piccolo col pallone e un compagno nel cono di mira -> filtrante tesa e rasoterra",
    possesso: true, bersaglio: 'palla', comando: 'inizio', mira: true, richiedeFiltrante: true,`),

  C('giocata: il ripiego sulle coordinate storiche',
`  let bottoni = null;
  try { bottoni = window.__test.pulsanti ? window.__test.pulsanti(0) : null; } catch (e) { bottoni = null; }
  if (!bottoni || !bottoni.length) {
    bottoni = [ { act: 'shot', x: innerWidth - 66, y: innerHeight - 140, r: 40 },
                { act: 'through', x: innerWidth - 70, y: innerHeight - 232, r: 30 } ];
  }
  return {
    pi,
    palla: { x: sx(b.x), y: sy(b.y) },
    comandato: { x: sx(p.x), y: sy(p.y) },
    vw: innerWidth, vh: innerHeight,
    grande: { x: Math.round(bottoni[0].x), y: Math.round(bottoni[0].y), r: bottoni[0].r },
    piccolo: { x: Math.round(bottoni[1].x), y: Math.round(bottoni[1].y), r: bottoni[1].r },
  };`,
`  /* ${MARCA}. Niente ripiego. Qui la
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
  };`),

  C('giocata: la mira, e il cono VUOTO che serve al passaggio semplice',
`    if (!mig) return { errore: 'nessun compagno di movimento a cui filtrare' };
    const dx = mig.x - p.x, dy = mig.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    p.fx = dx / l; p.fy = dy / l;
  }`,
`    if (!mig) return { errore: 'nessun compagno di movimento a cui filtrare' };
    const dx = mig.x - p.x, dy = mig.y - p.y, l = Math.max(1, Math.hypot(dx, dy));
    p.fx = dx / l; p.fy = dy / l;
  }
  if (opz.miraVuota) {
    /* IL CONTRARIO DELLA MIRA. ${MARCA}.
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
  }`),

  C('giocata: la pressione della carica',
`      await pag.evaluate(() => window.__test.setTouchButtons(true));
      const x = info.grande.x, y = info.grande.y;    // bottone grande (TIRA), squadra 0
      await dito.giu(cdp, x, y);
      await attesa(600);
      await dito.su(cdp);
      await pag.evaluate(() => window.__test.setTouchButtons(false));`,
`      await pag.evaluate(() => window.__test.setTouchButtons(true));
      /* il centro si chiede QUI, non alla preparazione, e a tutt'e due le
         sorgenti; l'atto atteso e' 'shot' (TIRA col possesso) */
      const r = await premiPulsante(cdp, pag, info, 'grande', 600, 'shot');
      await pag.evaluate(() => window.__test.setTouchButtons(false));
      return r;`),

  C('giocata: la pressione della filtrante',
`      await dito.giu(cdp, info.piccolo.x, info.piccolo.y);
      await attesa(80);
      await dito.su(cdp);
    },
  },
  cross: {`,
`      return premiPulsante(cdp, pag, info, 'piccolo', 80, 'through');
    },
  },
  cross: {`),

  C('giocata: il flick del cross, che adesso e\' un pulsante e due dita',
`    titolo: 'flick trasversale col pallone dalla fascia offensiva -> palla alta verso l\\'area',
    possesso: true, bersaglio: 'palla', comando: 'fine', zonaOffensiva: true, richiedeCross: true,
    async gesto(cdp, pag, info) {
      /* flick VERTICALE puro: nx = 0 non supera mai lo 0,25 del tiro,
         |ny| = 1 supera lo 0,6 del trasversale — e dalla meta' campo
         offensiva (dove la quiete ha portato il comandato) e' cross.
         In RAFFICA come il tiro: aspettare il giro di ogni evento
         renderebbe lento il dito dello strumento, non il gioco. Il dito
         parte a un terzo dello schermo, lontano dai pulsanti di destra:
         il flick dello stick vale ovunque sul canvas. */
      const x = Math.round(info.vw * 0.30);
      let y = 80;
      await dito.giu(cdp, x, y);
      const invii = [];
      for (let i = 0; i < 5; i++) { y += 44; invii.push(dito.sposta(cdp, x, y)); }
      invii.push(dito.su(cdp));
      await Promise.all(invii);
    },
  },`,
`    /* IL CROSS OGGI SI BATTE CON DUE DITA. ${MARCA}.
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
  },`),

  C('giocata: la pressione del cambio',
`      await dito.giu(cdp, info.piccolo.x, info.piccolo.y);
      await attesa(80);
      await dito.su(cdp);
    },
  },
  contrasto: {`,
`      return premiPulsante(cdp, pag, info, 'piccolo', 80, 'swap');
    },
  },
  contrasto: {`),

  C('giocata: la pressione del contrasto',
`      await dito.giu(cdp, info.grande.x, info.grande.y);
      await attesa(80);
      await dito.su(cdp);`,
`      return premiPulsante(cdp, pag, info, 'grande', 80, 'slide');`),

  C('giocata: il registro dei tocchi, campionato',
`        palla: { x: b.x, y: b.y, vx: b.vx, vy: b.vy, z: b.z || 0, owner: b.owner, passTo: b.passTo !== undefined ? b.passTo : null },`,
`        palla: { x: b.x, y: b.y, vx: b.vx, vy: b.vy, z: b.z || 0, owner: b.owner, passTo: b.passTo !== undefined ? b.passTo : null },
        /* IL REGISTRO DEI TOCCHI DEL GIOCO (G.touches, riempito da
           segnaTocco, CALCETTO-il-gioco.html:7891): il pulse dell'ultimo
           tocco: e' il modo che il gioco ha di dire "il pallone e' stato
           toccato di nuovo", anche quando nessuno lo prende. Serve a
           chiudere la finestra del volo — vedi analizza(). */
        ultimoTocco: (G.touches && G.touches.length) ? G.touches[G.touches.length - 1].t : null,`),

  C('giocata: la finestra del volo, che finiva troppo tardi',
`      if (!inVolo && c.palla.owner < 0) inVolo = true;
      else if (inVolo && c.palla.owner >= 0) voloFinito = true;
      if (inVolo && !voloFinito && c.palla.z != null) zVoloMax = Math.max(zVoloMax, c.palla.z);`,
`      /* LA FINESTRA DEL VOLO SI CHIUDE ANCHE SU UN TOCCO SENZA PRESA.
         ${MARCA}: prima si chiudeva solo
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
      if (inVolo && !voloFinito && c.palla.z != null) zVoloMax = Math.max(zVoloMax, c.palla.z);`),

  C('giocata: il posto dove vive il tocco nostro',
`  let zVoloMax = 0, inVolo = false, voloFinito = false;`,
`  let zVoloMax = 0, inVolo = false, voloFinito = false, toccoNostro = null;`),

  C('giocata: l\'istante che comanda, quando le dita sono due',
`  const inizio = ev.find(e => e.tipo === 'touchstart');
  const fine = [...ev].reverse().find(e => e.tipo === 'touchend');
  const comandoT = comando === 'inizio' ? (inizio && inizio.t) : (fine && fine.t);
  if (comandoT == null) return { errore: 'gesto incompleto: alla pagina manca il touch' + (comando === 'inizio' ? 'start' : 'end') };`,
`  const inizio = ev.find(e => e.tipo === 'touchstart');
  /* ${MARCA}. L'ULTIMO touchstart, non il
     primo: il cross si batte con due dita, e a comandare e' il dito che
     preme il PULSANTE — il primo (la levetta dello scatto) e' appoggiato
     centinaia di millisecondi prima e conterebbe la sua attesa come
     latenza del gioco. */
  const ultimoInizio = [...ev].reverse().find(e => e.tipo === 'touchstart');
  const fine = [...ev].reverse().find(e => e.tipo === 'touchend');
  const daChi = comando === 'inizio' ? inizio : comando === 'ultimoInizio' ? ultimoInizio : fine;
  const comandoT = daChi ? daChi.t : null;
  if (comandoT == null) return { errore: 'gesto incompleto: alla pagina manca il touch' + (comando === 'fine' ? 'end' : 'start') + ' che comanda' };`),

  C('giocata: la velocita\' del flick, che non governa piu\' niente',
`  /* velocita' del flick COME L'HA VISTA LA PAGINA: stessi 90 ms che
     guarda il gioco al rilascio. Serve a distinguere "il gioco non legge
     il tiro" da "il dito dello strumento era lento". */
  let flickPxS = null;
  if (fine) {
    const mosse = ev.filter(e => e.tipo !== 'touchend' && e.x != null && fine.t - e.t <= 90);
    if (mosse.length >= 2) {
      const a0 = mosse[0], a1 = mosse[mosse.length - 1];
      flickPxS = Math.hypot(a1.x - a0.x, a1.y - a0.y) / Math.max(1, a1.t - a0.t) * 1000;
    }
  }
  return {`,
`  /* TOLTA la velocita' del flick. ${MARCA}.
     Misurava i px/s del dito negli ultimi 90 ms e li stampava accanto a
     "al gioco ne servono 650": quella soglia governava i quattro gesti
     del rilascio, e il rilascio e' inerte (CALCETTO-il-gioco.html:8994).
     Nessuna giocata di questo strumento e' piu' un flick, quindi il
     numero non spiegherebbe piu' niente — sarebbe solo un numero verde
     accanto a una regola che non c'e'. Regola di casa: un numero che
     nessuno rimisura pesa il doppio. */
  return {`),

  C('giocata: il flick fuori dal ritorno dell\'analisi',
`    rispostaMax: vmax,
    caricaMax,
    flickPxS,
    zVoloMax, scivolataMs, cambioMs, nuovoIndice, passToVisto,`,
`    rispostaMax: vmax,
    caricaMax,
    zVoloMax, scivolataMs, cambioMs, nuovoIndice, passToVisto,`),

  C('giocata: le opzioni della quiete',
`      zonaOffensiva: !!g.zonaOffensiva, portatore: !!g.portatore,
      compagniLontani: !!g.compagniLontani, mira: !!g.mira,
    });`,
`      zonaOffensiva: !!g.zonaOffensiva, portatore: !!g.portatore,
      compagniLontani: !!g.compagniLontani, mira: !!g.mira, miraVuota: !!g.miraVuota,
    });`),

  C('giocata: la chiamata al gesto',
`    await g.gesto(cdp, pag, info);`,
`    let noteGesto = [];
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
    }`),

  C('giocata: l\'analisi che non riesce, con le sue note',
`    if (a.errore) {
      verifica(false, \`\${nome}: \${g.titolo}\`, a.errore);
      raccolta.push({ nome, esito: 'NO', errore: a.errore, campioni: dati.campioni, eventi: dati.eventi });
      continue;
    }`,
`    if (a.errore) {
      verifica(false, \`\${nome}: \${g.titolo}\`, a.errore, noteGesto);
      raccolta.push({ nome, esito: 'NO', errore: a.errore, note: noteGesto, campioni: dati.campioni, eventi: dati.eventi });
      continue;
    }`),

  C('giocata: il verdetto sull\'azione, senza il flick e senza numeri copiati',
`    const flickTxt = a.flickPxS != null ? \` (flick visto dalla pagina: \${a.flickPxS.toFixed(0)} px/s, al gioco ne servono 650)\` : '';
    let azioneNo = null;
    if (g.richiedeTiro && tiriFatti < 1)
      azioneNo = "la palla si muove ma il tabellino non segna tiri: il gesto e' stato letto come altro" + flickTxt;
    if (!azioneNo && g.richiedeFiltrante) {
      if (filtrantiFatte < 1) azioneNo = "il contatore delle filtranti non sale: il gesto e' stato letto come altro (passaggio normale?)";
      else if (a.rispostaMax < 420) azioneNo = \`filtrante a tabellino ma palla a \${a.rispostaMax.toFixed(0)} unita'/s: sotto il minimo (420) che la fa piu' rapida del passaggio normale\`;
      else if (a.zVoloMax > 5) azioneNo = \`filtrante a tabellino ma la palla prende quota (z max \${a.zVoloMax.toFixed(1)}): la filtrante e' rasoterra per definizione\`;
    }
    if (!azioneNo && g.richiedeCross) {
      if (crossFatti < 1) azioneNo = "il contatore dei cross non sale: il flick trasversale e' stato letto come altro" + flickTxt;
      else if (!(a.zVoloMax > 10)) azioneNo = \`cross a tabellino ma la palla non prende quota (z max \${a.zVoloMax.toFixed(1)}: sopra le teste serve 26)\`;
    }`,
`    let azioneNo = null;
    if (g.richiedeTiro && tiriFatti < 1)
      azioneNo = "la palla si muove ma il tabellino non segna tiri: il gesto e' stato letto come altro";
    if (!azioneNo && g.richiedeFiltrante) {
      if (filtrantiFatte < 1) azioneNo = "il contatore delle filtranti non sale: il gesto e' stato letto come altro (passaggio semplice?)";
      else if (a.zVoloMax > 5) azioneNo = \`filtrante a tabellino ma la palla prende quota (z max \${a.zVoloMax.toFixed(1)}): la filtrante e' rasoterra per definizione\`;
      else if (a.passToVisto == null) azioneNo = "filtrante a tabellino ma nessun destinatario assegnato (b.passTo resta -1): la filtrante e' diretta a un compagno per definizione";
    }
    /* TOLTO il controllo "palla sotto 420 unita'/s". ${MARCA}:
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
      else if (!(a.zVoloMax > 10)) azioneNo = \`cross a tabellino ma la palla non prende quota (z max \${a.zVoloMax.toFixed(1)}: sopra le teste serve 26)\`;
    }`),

  C('giocata: da quando si conta la latenza',
`    const daQuando = g.comando === 'inizio' ? "dall'appoggio del dito" : 'dal rilascio';`,
`    const daQuando = g.comando === 'inizio' ? "dall'appoggio del dito"
      : g.comando === 'ultimoInizio' ? "dall'appoggio del dito sul pulsante (con la levetta gia' giu')"
      : 'dal rilascio';`),

  C('giocata: il tempo dall\'inizio, che con due dita vorrebbe dire un\'altra cosa',
`              (a.dallInizioMs != null && g.comando !== 'inizio' ? \` (\${a.dallInizioMs.toFixed(0)} ms dall'inizio del gesto)\` : '') +`,
`              (a.dallInizioMs != null && g.comando === 'fine' ? \` (\${a.dallInizioMs.toFixed(0)} ms dall'inizio del gesto)\` : '') +`),

  C('giocata: il flick stampato accanto al tiro',
`              (nome === 'tiro' && a.flickPxS != null ? \` — flick \${a.flickPxS.toFixed(0)} px/s\` : '') +
`,
``),

  C('giocata: il flick stampato accanto al cross',
`              (g.richiedeCross ? \` — cross a tabellino +\${crossFatti}, quota massima z \${a.zVoloMax.toFixed(1)} (sopra le teste da 26)\` +
                (a.flickPxS != null ? \`, flick \${a.flickPxS.toFixed(0)} px/s\` : '') : '') +`,
`              (g.richiedeCross ? \` — cross a tabellino +\${crossFatti}, quota massima z \${a.zVoloMax.toFixed(1)} (sopra le teste da 26)\` : '') +
              (g.richiedePassaggio ? \` — filtranti +\${filtrantiFatte} e cross +\${crossFatti} (nessuno dei due: e' il passaggio semplice)\` +
                (a.passToVisto != null ? \`, diretto al compagno \${a.passToVisto}\` : '') : '') +`),

  C('giocata: il verdetto che porta con se\' le note della pressione',
`              (g.richiedeScivolata ? \` — p.slide acceso \${a.scivolataMs.toFixed(0)} ms dopo il tocco\` : ''));`,
`              (g.richiedeScivolata ? \` — p.slide acceso \${a.scivolataMs.toFixed(0)} ms dopo il tocco\` : ''), noteGesto);`),

  C('giocata: cosa finisce nel json',
`      flickPxS: a.flickPxS, tiriATabellino: tiriFatti, tiriPerfetti: perfettiFatti,`,
`      note: noteGesto, tiriATabellino: tiriFatti, tiriPerfetti: perfettiFatti,`),

  C('giocata: il conto finale, e l\'uscita 2 che non si confonde con l\'1',
`  const male = esiti.filter(x => !x).length;
  console.log(\`\\n\${esiti.length} giocate, \${esiti.length - male} passate, \${male} fallite\`);
  if (male) {
    console.log("Una giocata fallita vuol dire che il dito ha chiesto e il gioco non ha risposto entro mezzo secondo.");
    process.exit(1);
  }`,
`  const male = esiti.filter(x => !x).length;
  console.log(\`\\n\${esiti.length} giocate misurate, \${esiti.length - male} passate, \${male} fallite\` +
    (bancoRotto.length ? \`  ·  \${bancoRotto.length} NON MISURATE (banco non valido)\` : ''));
  if (bancoRotto.length) {
    /* ${MARCA}. L'uscita 2 viene PRIMA
       dell'uscita 1: se una parte del banco non ha funzionato, la cosa
       da dire e' quella. "Non ho potuto misurare" non si scrive come
       "il gioco non risponde". */
    console.log('\\nBANCO NON VALIDO su: ' + bancoRotto.map(b => b.nome).join(', ') + '.');
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
  }`),
]);

/* -------------------------------------------------------- collaudo.js */
T('strumenti/collaudo.js', [

  C('collaudo: la capsula d\'ombra d\'archivio',
`      const OMB_RIPIEGO = { ux: 0.9406, uy: 0.3402, l0: 0, l1: 140, semiCorto: 7.6, piedeX: 4.2, piedeY: 7.8 };
      let OMB = (t.ombraCapsula && t.ombraCapsula()) || OMB_RIPIEGO;
      /* distanza di un punto dal SEGMENTO d'ombra di q: e' la capsula */
      const dentroOmbra = (qx, qy, wx, wy) => {`,
`      /* ${MARCA}. Qui c'era una capsula d'archivio
         (ux 0,9406 · uy 0,3402 · l1 140 · semiCorto 7,6) usata in
         silenzio se __test.ombraCapsula fosse sparito. Quella capsula
         serve a NON campionare come erba i pixel in ombra: con una
         geometria vecchia il rapporto maglia/erba resterebbe verde
         misurando i pixel sbagliati.
         E NON BASTA CHIEDERE SE LA FUNZIONE C'E'. Il critico l'ha
         dimostrato: rinominando due campi del valore di ritorno (ux, uy)
         e lasciando la funzione al suo posto, uscivano quattro numeri
         DIVERSI (4,02 / 4,51 / 5,24 / 5,40 contro 3,90 / 4,49 / 5,09 /
         5,38), tutti verdi e tutti muti — perche' con un versore
         indefinito il filtro dell'arco a ovest si spegne da solo. Si
         controlla la FORMA, come fa preso() in istantanea.js: ogni
         campo, e il versore dev'essere un versore. */
      const capsulaGuasta = k => {
        if (!k || typeof k !== 'object') return "ombraCapsula() non torna un oggetto: " + String(k);
        for (const n of ['ux', 'uy', 'l0', 'l1', 'semiCorto', 'piedeX', 'piedeY'])
          if (typeof k[n] !== 'number' || !isFinite(k[n])) return "manca (o non e' un numero) il campo '" + n + "'";
        const mo = Math.hypot(k.ux, k.uy);
        if (!(Math.abs(mo - 1) < 0.01)) return "(ux,uy) non e' un versore: modulo " + mo.toFixed(4);
        if (!(k.l1 > k.l0)) return 'l1 non e\\' oltre l0: ' + k.l0 + ' -> ' + k.l1;
        if (!(k.semiCorto > 0)) return 'semiCorto non e\\' positivo: ' + k.semiCorto;
        return null;
      };
      let OMB = null, OMB_ASSENTE = true, OMB_MOTIVO = null;
      if (typeof t.ombraCapsula !== 'function') OMB_MOTIVO = "__test.ombraCapsula non e' una funzione";
      else {
        try { OMB = t.ombraCapsula(); }
        catch (e) { OMB = null; OMB_MOTIVO = "ombraCapsula() e' esplosa: " + e.message; }
        if (!OMB_MOTIVO) { OMB_MOTIVO = capsulaGuasta(OMB); if (OMB_MOTIVO) OMB = null; }
      }
      OMB_ASSENTE = !OMB;
      /* distanza di un punto dal SEGMENTO d'ombra di q: e' la capsula.
         Qui dentro OMB e' sempre valida: dove non lo e', non si campiona
         affatto (vedi il "continue" nel giro dei fotogrammi). */
      const dentroOmbra = (qx, qy, wx, wy) => {`),

  C('collaudo: la capsula riletta a ogni fotogramma',
`          fotogrammi++;
          OMB = (t.ombraCapsula && t.ombraCapsula()) || OMB_RIPIEGO;`,
`          /* la capsula si rilegge a OGNI fotogramma (con la sera che
             scende il sole si abbassa e l'ombra si allunga) e si
             RIVALIDA a ogni fotogramma: una capsula che diventa storta a
             meta' corsa e' peggio di una che manca dall'inizio. */
          if (!OMB_ASSENTE) {
            let k = null, guai = null;
            try { k = t.ombraCapsula(); } catch (e) { guai = "ombraCapsula() e' esplosa: " + e.message; }
            if (!guai) guai = capsulaGuasta(k);
            if (guai) { OMB_ASSENTE = true; OMB = null; OMB_MOTIVO = "a meta' corsa: " + guai; }
            else OMB = k;
          }
          /* SENZA CAPSULA VALIDA NON SI CAMPIONA. Non "si campiona
             lasciando passare tutto": con OMB nulla il filtro dell'arco a
             ovest si spegnerebbe da solo e i numeri uscirebbero diversi,
             verdi e muti. Zero fotogrammi campionati e' una risposta
             onesta; quattro numeri sbagliati no. */
          if (OMB_ASSENTE) continue;
          fotogrammi++;`),

  C('collaudo: il rapporto che si scrive',
`        squadre.push({
          sq, rapporto: rapportoDi(maglia[sq], erba[sq]),
          maglia: esa(rappr(maglia[sq])), erba: esa(rappr(erba[sq])),
          nMaglia: maglia[sq].length, nErba: erba[sq].length,
          singole,
        });`,
`        squadre.push({
          /* regola di casa numero 3: un numero che lo strumento ha gia'
             dichiarato non valido non si scrive. Senza capsula il
             rapporto e' nullo, non "quasi giusto". */
          sq, rapporto: OMB_ASSENTE ? null : rapportoDi(maglia[sq], erba[sq]),
          maglia: OMB_ASSENTE ? '?' : esa(rappr(maglia[sq])),
          erba: OMB_ASSENTE ? '?' : esa(rappr(erba[sq])),
          nMaglia: maglia[sq].length, nErba: erba[sq].length,
          singole: OMB_ASSENTE ? [] : singole,
        });`),

  C('collaudo: cosa torna dalla misura del contrasto',
`      return { fotogrammi, squadre, partite: perPartita.length, guasto: !!GUASTO };`,
`      return { fotogrammi, squadre, partite: perPartita.length, guasto: !!GUASTO,
               ombraHook: !OMB_ASSENTE, ombraMotivo: OMB_MOTIVO || null };`),

  C('collaudo: il giro sulle due squadre',
`    for (const s of mis.squadre) {`,
`    if (!mis.ombraHook) {
      console.log('  (LA CAPSULA D\\'OMBRA DEL GIOCO NON E\\' UTILIZZABILE: ' + (mis.ombraMotivo || '?') + '.');
      console.log("   Serve a non campionare come erba i pixel che stanno in ombra: con una capsula");
      console.log("   d'archivio, o con una storta, il rapporto sarebbe un numero inventato. Non ho");
      console.log('   campionato nessun fotogramma e non scrivo nessun rapporto: i due controlli qui');
      console.log('   sotto sono rossi.)');
    }
    for (const s of mis.squadre) {`),

  C('collaudo: il verdetto del contrasto',
`      const ok = abbastanza && s.rapporto >= SOGLIA_CONTRASTO;`,
`      const ok = mis.ombraHook && abbastanza && s.rapporto >= SOGLIA_CONTRASTO;`),
]);

/* --------------------------------------------------- quattrovalori.js */
T('strumenti/quattrovalori.js', [

  C('quattrovalori: gli hook si chiedono prima di misurare',
`    t.posaHUD(true);                     // i comandi si disegnano: sono interfaccia`,
`    t.posaHUD(true);                     // i comandi si disegnano: sono interfaccia
    /* ${MARCA}. Questo strumento aveva DUE
       valori d'archivio, e uno era gia' in atto: i centri dei pulsanti.
       Si chiedono al gioco, a due sorgenti, o non si misura. */
    const capsulaGuasta = k => {
      if (!k || typeof k !== 'object') return "ombraCapsula() non torna un oggetto";
      for (const n of ['ux', 'uy', 'l0', 'l1', 'semiCorto', 'piedeX', 'piedeY'])
        if (typeof k[n] !== 'number' || !isFinite(k[n])) return "manca (o non e' un numero) il campo '" + n + "'";
      const mo = Math.hypot(k.ux, k.uy);
      if (!(Math.abs(mo - 1) < 0.01)) return "(ux,uy) non e' un versore: modulo " + mo.toFixed(4);
      if (!(k.l1 > k.l0)) return "l1 non e' oltre l0";
      if (!(k.semiCorto > 0)) return "semiCorto non e' positivo";
      return null;
    };
    if (typeof t.pulsanti !== 'function')
      return { errore: "__test.pulsanti non esiste: senza i centri dichiarati campionerei il prato e lo chiamerei interfaccia" };
    if (!Array.isArray(t.comandiTouch))
      return { errore: "__test.comandiTouch non esiste: con una sola sorgente non vedrei un export che mente sempre allo stesso modo" };
    if (typeof t.ombraCapsula !== 'function')
      return { errore: "__test.ombraCapsula non esiste: con una capsula d'ombra d'archivio scarterei i pixel sbagliati e il grigio del prato uscirebbe falso" };
    {
      const g0 = capsulaGuasta(t.ombraCapsula());
      if (g0) return { errore: '__test.ombraCapsula() non e\\' una capsula valida: ' + g0 };
    }`),

  C('quattrovalori: la capsula d\'ombra d\'archivio',
`    const OMB = (t.ombraCapsula && t.ombraCapsula()) ||
                { ux: 0.9406, uy: 0.3402, l0: 0, l1: 140, semiCorto: 7.6, piedeX: 4.2, piedeY: 7.8 };`,
`    const OMB = t.ombraCapsula();`),

  C('quattrovalori: i centri dei pulsanti d\'archivio',
`      const btn = [{ x: VWc - 66, y: VHc - 140, r: 40 }, { x: VWc - 70, y: VHc - 232, r: 30 }];`,
`      /* DOVE SONO I COMANDI LO DICONO DUE SORGENTI DEL GIOCO. Qui c'erano
         due centri d'archivio, (VW-66, VH-140) e (VW-70, VH-232). I
         pulsanti veri stanno a (VW-64, VH-60) e (VW-158, VH-72): 80,0 px
         e 182,6 px di distanza, cioe' la corona campionata cadeva sul
         MANTO. Il grigio che questo strumento chiamava interfaccia era il
         grigio del prato, e la distanza minima fra le due famiglie usciva
         — prevedibilmente — minuscola.
         E L'ALFA SI GUARDA. Dal 16 agosto un comando SFUMA quando il
         pallone o un protagonista gli arriva addosso (scartoHUD): un
         fotogramma in cui il disco e' al 40% non e' un campione di
         interfaccia, e' un campione di interfaccia MISCHIATA A ERBA. I
         fotogrammi sfumati non si campionano e si contano. */
      const zone = t.comandiTouch.filter(z => z.tipo === 'pulsante' && (z.team | 0) === 0);
      const ric = t.pulsanti(0);
      const btn = [];
      for (const b of ric) {
        const z = zone.find(q => q.act === b.act) || null;
        if (!z) { uiScarti.nonDipinti++; continue; }
        const zy = z.y - (z.premuto ? 2 : 0);        // l'affondamento del tasto premuto
        const dd = Math.hypot(z.x - b.x, zy - b.y);
        if (!(dd <= 1)) { uiScarti.discordi++; uiScarti.peggiore = Math.max(uiScarti.peggiore, dd); continue; }
        const al = z.alpha === undefined ? 1 : z.alpha;
        if (!(al >= 0.999)) { uiScarti.sfumati++; uiScarti.alfaMin = Math.min(uiScarti.alfaMin, al); continue; }
        btn.push({ x: z.x, y: z.y, r: z.r });
      }`),

  C('quattrovalori: il contatore degli scarti dei comandi',
`    const FW = 1150, FH = 560;
    const fam = { magliaA: [], magliaB: [], prato: [], ui: [] };
    let fotogrammi = 0;`,
`    const FW = 1150, FH = 560;
    const fam = { magliaA: [], magliaB: [], prato: [], ui: [] };
    let fotogrammi = 0;
    /* quanti dischi non sono stati campionati e perche': un numero che
       nasce da meno campioni del previsto deve dirlo, se no e' una
       mediana su una popolazione ignota */
    const uiScarti = { nonDipinti: 0, discordi: 0, peggiore: 0, sfumati: 0, alfaMin: 1, dischi: 0 };`),

  C('quattrovalori: il conto dei dischi campionati',
`      for (const b of btn) {
        for (let rr = 0.45; rr <= 0.80; rr += 0.07) {`,
`      uiScarti.dischi += btn.length;
      for (const b of btn) {
        for (let rr = 0.45; rr <= 0.80; rr += 0.07) {`),

  C('quattrovalori: cosa torna dalla misura',
`    const out = {};
    for (const k in fam) out[k] = { n: fam[k].length, grigio: fam[k].length ? grigio(mediana(fam[k])) : null };
    return { fotogrammi, out };`,
`    const out = {};
    for (const k in fam) out[k] = { n: fam[k].length, grigio: fam[k].length ? grigio(mediana(fam[k])) : null };
    return { fotogrammi, out, uiScarti };`),

  C('quattrovalori: il verdetto',
`  const nomi = { magliaA: 'squadra A (maglia)', magliaB: 'squadra B (maglia)', prato: 'prato', ui: 'interfaccia' };`,
`  if (mis.errore) {
    console.error('BANCO NON VALIDO — ' + mis.errore);
    console.error('Non misuro con valori d\\'archivio: darei quattro grigi che non sono di quello che dico.');
    await br.close();
    process.exit(2);
  }
  const nomi = { magliaA: 'squadra A (maglia)', magliaB: 'squadra B (maglia)', prato: 'prato', ui: 'interfaccia' };`),

  C('quattrovalori: la riga che dichiara gli scarti dei comandi',
`  const SOGLIA = 25;`,
`  /* DA QUANTI DISCHI VIENE IL GRIGIO DELL'INTERFACCIA. Senza questa riga
     "interfaccia 43" e' una mediana su una popolazione ignota. */
  {
    const u = mis.uiScarti || {};
    console.log('  comandi campionati: ' + (u.dischi || 0) + ' dischi su ' + (mis.fotogrammi * 2) +
      ' (' + mis.fotogrammi + ' fotogrammi x 2)' +
      (u.nonDipinti ? '  · ' + u.nonDipinti + ' non dipinti' : '') +
      (u.discordi ? '  · ' + u.discordi + ' scartati perche\\' le due sorgenti discordavano (fino a ' + u.peggiore.toFixed(2) + ' px)' : '') +
      (u.sfumati ? '  · ' + u.sfumati + ' scartati perche\\' SFUMATI (alfa minima ' + u.alfaMin.toFixed(2) + ')' : '') +
      ((!u.nonDipinti && !u.discordi && !u.sfumati) ? '  · tutti opachi e concordi' : ''));
  }
  const SOGLIA = 25;`),
]);

/* ------------------------------------------------------- giocatore.js */
T('strumenti/giocatore.js', [

  C('giocatore: i pulsanti letti dallo stato',
` btn: (t.pulsanti&&t.pulsanti(0))||[]`,
` btn: (typeof t.pulsanti==='function')?t.pulsanti(0):null,
 dip: Array.isArray(t.comandiTouch)?t.comandiTouch.filter(z=>z.tipo==='pulsante'&&(z.team|0)===0).map(z=>({act:z.act,x:z.x,y:z.y,r:z.r,pr:!!z.premuto,al:z.alpha})):null`),

  C('giocatore: il filo di protocollo, tenuto a portata di chi ripulisce',
`  const c = await apriFilo(l.find(t => t.type === 'page').webSocketDebuggerUrl);`,
`  const c = await apriFilo(l.find(t => t.type === 'page').webSocketDebuggerUrl);
  FILO = c;                          // ${MARCA}: lo chiude anche chi muore male`),

  C('giocatore: il vetro, e le dita che si alzano comunque vada',
`  const vetro = new Vetro(adb, dev);
  await pausa(400);`,
`  const vetro = new Vetro(adb, dev);
  await pausa(400);
  /* ===================================================================
     LE DITA SI ALZANO SEMPRE. ${MARCA}.

     Il pollice sinistro si appoggia sul vetro venti righe piu' in giu' e
     NON SI ALZA PIU' per tutta la partita (e' la levetta). Qualunque
     uscita che salti le due righe di chiusura lascia un TOCCO FANTASMA
     sullo schermo del telefono del committente, e il socket del vetro
     aperto: il telefono resta con un dito premuto finche' qualcuno non
     se ne accorge. Nella prima edizione di questa toppa il controllo dei
     pulsanti usciva con process.exit(2) da dentro il giro, cioe' faceva
     esattamente questo. Adesso non esce nessuno da dentro il giro: si
     lancia, e il finally alza le dita.

     E NON BASTA CHIAMARE su() E CHIUDERE. Vetro.w() mette i gruppi in
     una CODA che si versa uno ogni 3 ms (vedi _vetro.js): chiudere
     subito dopo un su() butta via il "dito su" che non e' ancora
     passato per stdin. Qui si aspetta che la coda sia davvero vuota. */
  let smontato = false;
  const smonta = async () => {
    if (smontato) return; smontato = true;
    try { vetro.su(1); vetro.su(0); } catch (e) { }
    for (let i = 0; i < 200 && vetro.coda && vetro.coda.length; i++) await pausa(5);
    await pausa(120);                 // l'ultimo gruppo, gia' scritto, deve arrivare
    try { vetro.chiudi(); } catch (e) { }
    await pausa(80);
  };
  /* anche il colpo di Ctrl-C: il telefono non sa che qualcuno ha
     cambiato idea, e il dito resterebbe giu' lo stesso */
  for (const sg of ['SIGINT', 'SIGTERM']) {
    process.once(sg, async () => {
      console.error('\\n(' + sg + ": alzo le dita dal vetro e chiudo, poi esco)");
      await smonta();
      try { FILO && FILO.chiudi(); } catch (e) { }
      process.exit(130);
    });
  }`),

  C('giocatore: lo stato iniziale',
`  if (!S0) { console.error('non riesco a leggere lo stato'); process.exit(2); }`,
`  if (!S0) { console.error('non riesco a leggere lo stato'); await smonta(); try { FILO && FILO.chiudi(); } catch (e) { } process.exit(2); }
  /* ${MARCA}. Senza i pulsanti dichiarati
     questo strumento non ripiega e nemmeno muore di TypeError venti
     righe piu' in giu': lo dice. Con btn = [] i due pollici avrebbero
     premuto un punto qualsiasi e i contatori (tiri, passaggi, cambi,
     contrasti) sarebbero stati un racconto. E le sorgenti sono DUE:
     comandiTouch e' il dipinto, pulsanti(0) il ricalcolo. */
  if (!Array.isArray(S0.btn) || S0.btn.length < 2) {
    console.error("\\nBANCO NON VALIDO — __test.pulsanti non c'e' o non dichiara due pulsanti.");
    console.error('Senza la geometria dichiarata i due pollici premerebbero il prato e i contatori');
    console.error('di questa partita sarebbero un racconto. Mi fermo.');
    await smonta(); try { FILO && FILO.chiudi(); } catch (e) { }
    process.exit(2);
  }
  if (!Array.isArray(S0.dip) || S0.dip.length < 2) {
    console.error("\\nBANCO NON VALIDO — __test.comandiTouch non dichiara i due comandi dipinti.");
    console.error('Con una sola sorgente non posso accorgermi di un export che mente sempre allo stesso');
    console.error('modo: cinque pixel di bugia costante passerebbero inosservati. Mi fermo.');
    await smonta(); try { FILO && FILO.chiudi(); } catch (e) { }
    process.exit(2);
  }`),

  C('giocatore: quale disco e\' il grande',
`  const btnGrande = S0.btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, S0.btn[0]);
  const btnPiccolo = S0.btn.find(b => b !== btnGrande) || btnGrande;`,
`  const btnGrande = S0.btn.reduce((a, b) => (b.r || 0) > (a.r || 0) ? b : a, S0.btn[0]);
  const btnPiccolo = S0.btn.find(b => b !== btnGrande) || btnGrande;
  /* IL CENTRO DI ADESSO, DA DUE SORGENTI. I pulsanti tornano a ogni
     lettura di stato (20 volte al secondo): prima di ogni pressione si
     prende il centro RICALCOLATO e lo si incrocia col centro DIPINTO
     dell'ultimo fotogramma. Se le due non tornano entro 1 px — tolto
     l'affondamento di 2 px del tasto premuto — una delle due mente e non
     si sa quale: non si preme.
     Non si confronta col centro di t=0: quello vedrebbe solo un pulsante
     che si sposta, e uno che si sposta si preme dove sta adesso. */
  const TOLL_INCROCIO = 1, AFFONDAMENTO = 2;
  const centroOra = (St, quale) => {
    const bt = St && St.btn, dp = St && St.dip;
    if (!Array.isArray(bt) || bt.length < 2)
      throw Object.assign(new Error("__test.pulsanti non dichiara piu' due pulsanti: non premo a memoria"), { banco: true });
    if (!Array.isArray(dp) || !dp.length)
      throw Object.assign(new Error("il gioco non sta DIPINGENDO nessun comando (comandiTouch vuoto): premerei un pulsante che non c'e' sullo schermo"), { banco: true });
    const gr = bt.reduce((a, z) => ((z.r || 0) > (a.r || 0) ? z : a), bt[0]);
    const s = quale === 'grande' ? gr : (bt.filter(z => z !== gr)[0] || gr);
    const z = dp.find(q => Math.abs((q.r || 0) - (s.r || 0)) < 0.5) ||
              dp.reduce((a, q) => ((q.r || 0) > (a.r || 0) ? q : a), dp[0]);
    const zy = z.y - (z.pr ? AFFONDAMENTO : 0);
    const d = Math.hypot(z.x - s.x, zy - s.y);
    if (!(d <= TOLL_INCROCIO))
      throw Object.assign(new Error('LE DUE SORGENTI NON TORNANO sul pulsante ' + quale + ': pulsanti(0) dice (' +
        Math.round(s.x) + ',' + Math.round(s.y) + '), il gioco ha DIPINTO (' + Math.round(z.x) + ',' + Math.round(zy) +
        '): ' + d.toFixed(2) + ' px. Una delle due mente e non so quale: non premo.'), { banco: true });
    return s;
  };`),

  C('giocatore: la pressione del tiro',
`            const q = versoPannello(btnGrande.x, btnGrande.y);
            vetro.giu(1, q.px, q.py);
            tiroFinoA = ora + 620;`,
`            const cc = centroOra(S, 'grande');
            const q = versoPannello(cc.x, cc.y);
            vetro.giu(1, q.px, q.py);
            tiroFinoA = ora + 620;`),

  C('giocatore: la pressione del passaggio',
`            const q = versoPannello(btnPiccolo.x, btnPiccolo.y);
            vetro.giu(1, q.px, q.py); await pausa(45); vetro.su(1);
            K.passaggi++; destroLibero = ora + 900;`,
`            const cc = centroOra(S, 'piccolo');
            const q = versoPannello(cc.x, cc.y);
            vetro.giu(1, q.px, q.py); await pausa(45); vetro.su(1);
            K.passaggi++; destroLibero = ora + 900;`),

  C('giocatore: la pressione di contrasto o cambio',
`            const q = versoPannello(dBall < 55 ? btnGrande.x : btnPiccolo.x, dBall < 55 ? btnGrande.y : btnPiccolo.y);`,
`            const cc = centroOra(S, dBall < 55 ? 'grande' : 'piccolo');
            const q = versoPannello(cc.x, cc.y);`),

  C('giocatore: il giro della partita, dentro un try',
`  let prossimoIndietro = INDIETRO ? t0 + INDIETRO * 1000 : Infinity;
  let quantiIndietro = 0, stradaPrima = 0, stradaDopo = 0, misuraDopo = 0;
  while ((Date.now() - t0) / 1000 < SEC) {`,
`  let prossimoIndietro = INDIETRO ? t0 + INDIETRO * 1000 : Infinity;
  let quantiIndietro = 0, stradaPrima = 0, stradaDopo = 0, misuraDopo = 0;
  /* IL TRY CHE PROTEGGE IL TELEFONO. Dentro questo giro il pollice
     sinistro e' GIU'. Qualunque cosa succeda — un banco non valido, una
     lettura sfondata, un errore di adb — le dita si alzano nel finally
     prima che l'errore risalga. (Il corpo del giro non e' stato
     reindentato di proposito: una toppa che sposta trecento righe per
     due spazi non si rilegge.) */
  try {
  while ((Date.now() - t0) / 1000 < SEC) {`),

  C('giocatore: il finally che alza le dita',
`  if (!INERTE) { vetro.su(1); vetro.su(0); }
  await pausa(400);
  const fine = JSON.parse(await c.js(LEGGI) || 'null');
  vetro.chiudi();`,
`  } finally {
    /* LE DITA SI ALZANO QUI, sempre: uscita buona, errore, banco non
       valido. Prima di qualunque altra cosa, perche' e' l'unica che
       tocca l'hardware di qualcun altro. */
    await smonta();
  }
  const fine = JSON.parse(await c.js(LEGGI) || 'null');`),

  C('giocatore: l\'uscita quando qualcosa va storto',
`})().catch(e => { console.error('FALLITO:', e.message); process.exit(1); });`,
`})().catch(e => {
  /* ${MARCA}: un banco che non si e' potuto
     usare esce con 2, non con 1. "Non ho potuto misurare" non si scrive
     come "il gioco non risponde". */
  if (e && e.banco) {
    console.error('\\nBANCO NON VALIDO — ' + e.message);
    console.error('Non premo a memoria: i contatori di questa partita sarebbero un racconto.');
  } else {
    console.error('FALLITO:', e.message);
  }
  try { FILO && FILO.chiudi(); } catch (x) { }
  process.exit(e && e.banco ? 2 : 1);
});`),

  C('giocatore: il posto dove vive il filo',
`const { Vetro } = require('./_vetro.js');`,
`const { Vetro } = require('./_vetro.js');
/* il filo di protocollo, a portata di chi ripulisce dopo un guasto */
let FILO = null;`),
]);

/* ------------------------------------------------------ istantanea.js */
T('strumenti/istantanea.js', [

  C('istantanea: il raggio della palla nel banco 7',
`    try { rd = t.pallaRaggio ? +t.pallaRaggio() : 0; } catch (e) { rd = 0; }
    if (!(rd > 0)) rd = B_R_ * (1 + (bb.z || 0) * 0.012);`,
`    try { rd = (typeof t.pallaRaggio === 'function') ? +t.pallaRaggio() : 0; } catch (e) { rd = 0; }
    if (!(rd > 0)) {
      /* ${MARCA}. Cinque costanti del disegno
         (P_DIS, RIG_H, RIG_PIEDI, RIG_YAW_K, B_R) passano gia' da
         preso(), che le DICHIARA quando mancano; questo raggio no:
         ripiegava su B_R in silenzio. E qui pesa il doppio, perche' il
         banco 7 posa il falso ATTORNO al pallone: col raggio sbagliato
         l'anello finisce dove il gioco non lo mette mai, il conto severo
         non si muove per il motivo sbagliato e il banco dichiara
         riparato un difetto che non ha messo alla prova.
         Il lancio lo raccoglie chi chiama (vedi "controllo: 7"): uccide
         il banco 7, non le altre tredici misure dell'istante. */
      throw new Error("banco 7: __test.pallaRaggio non c'e'. Senza il raggio dichiarato l'anello falso " +
        'non si posa dove il gioco lo posa, e il controllo direbbe verde per il motivo sbagliato.');
    }`),

  C('istantanea: il banco 7 che non porta via anche gli altri',
`        const mG = await pag.evaluate(misuraInPagina, { par: S, controllo: 7 });
        await pag.screenshot({ path: path.join(dir, 'controllo-anello-' + nn + '.png') });
        const cE = cancelli(mE, S), cF = cancelli(mF, S), cG = cancelli(mG, S);`,
`        /* ${MARCA}. Il banco 7 puo' rifiutarsi
           di misurare (se __test.pallaRaggio non c'e' l'anello falso non
           si posa dove il gioco lo posa). Prima quel rifiuto usciva
           dall'evaluate, interrompeva il giro sugli istanti e buttava via
           TUTTE E QUATTORDICI le misure: un banco che si ferma non deve
           portarsi dietro i tredici risultati che aveva gia' in mano. */
        let mG = null, mGmotivo = null;
        try { mG = await pag.evaluate(misuraInPagina, { par: S, controllo: 7 }); }
        /* il messaggio vero comincia con "page.evaluate: Error: ", non con
           "Error: ": una cerca ancorata a inizio riga non mordeva e la
           riga usciva col doppio cappello. Misurato dal critico, corretto
           qui: si toglie tutto cio' che precede il primo "Error: ". */
        catch (e) { mGmotivo = String((e && e.message) || e).split('\\n')[0].replace(/^.*?Error: /, ''); }
        if (mG) await pag.screenshot({ path: path.join(dir, 'controllo-anello-' + nn + '.png') });
        const cE = cancelli(mE, S), cF = cancelli(mF, S), cG = mG ? cancelli(mG, S) : null;`),

  C('istantanea: le due righe della palla, che non si scrivono senza misura',
`        console.log(\`           palla:  gioco vero \${d(c[1])}   con l'anello di possesso dipinto attorno \${d(cG[1])}\`);
        console.log(\`           diametro severo \${m.palla.diamPx.toFixed(1)} -> \${mG.palla.diamPx.toFixed(1)} px;  \` +
          \`permissivo (il conto di ieri) \${m.palla.diamLargo.toFixed(1)} -> \${mG.palla.diamLargo.toFixed(1)} px;  \` +
          \`raggi scappati \${m.palla.raggiScappati} -> \${mG.palla.raggiScappati} su 16\`);`,
`        if (mG) {
          console.log(\`           palla:  gioco vero \${d(c[1])}   con l'anello di possesso dipinto attorno \${d(cG[1])}\`);
          console.log(\`           diametro severo \${m.palla.diamPx.toFixed(1)} -> \${mG.palla.diamPx.toFixed(1)} px;  \` +
            \`permissivo (il conto di ieri) \${m.palla.diamLargo.toFixed(1)} -> \${mG.palla.diamLargo.toFixed(1)} px;  \` +
            \`raggi scappati \${m.palla.raggiScappati} -> \${mG.palla.raggiScappati} su 16\`);
        } else {
          console.log(\`           palla:  BANCO 7 NON MISURATO — \${mGmotivo}\`);
          console.log(\`           (le altre misure di questo istante restano valide: erano gia' prese)\`);
        }`),

  C('istantanea: la dichiarazione delle zone d\'interfaccia',
`  try {
    const zz = t.zoneInterfaccia ? t.zoneInterfaccia() : null;
    if (zz && zz.length) {
      ifacc.dichiarata = true;`,
`  /* ${MARCA}. Tre modi di restare muti,
     tutti chiusi: la funzione che manca, la funzione che esplode, e —
     quello che la prima edizione lasciava aperto — la funzione che torna
     un elenco VUOTO. Succede in menu, fine partita, pausa e moviola,
     dove TOUCH_ZONE e' vuoto: li' l'esclusione non c'e' e va detto, non
     lasciato intendere. E il catch adesso avvolge SOLO la chiamata
     all'hook: prima incolpava zoneInterfaccia di qualunque eccezione
     nascesse nelle venti righe sotto, che e' la stessa malattia
     dall'altro lato. */
  let zz = null;
  if (typeof t.zoneInterfaccia !== 'function') { mancanti.push('__test.zoneInterfaccia'); ifacc.perche = 'la funzione non esiste'; }
  else {
    try { zz = t.zoneInterfaccia(); }
    catch (e) { mancanti.push('__test.zoneInterfaccia'); ifacc.perche = "la funzione e' esplosa: " + e.message; }
    if (!ifacc.perche && !Array.isArray(zz)) { mancanti.push('__test.zoneInterfaccia'); ifacc.perche = 'non torna un elenco'; zz = null; }
    else if (!ifacc.perche && !zz.length) ifacc.perche = "l'elenco e' VUOTO (succede in menu, pausa, moviola e fine partita, dove il gioco non dipinge comandi)";
  }
  try {
    if (zz && zz.length) {
      ifacc.dichiarata = true;`),

  C('istantanea: il catch che incolpava l\'hook di tutto',
`  } catch (e) { /* nessuna dichiarazione: si misura tutto, esattamente com'era */ }`,
`  } catch (e) { ifacc.perche = "il conto delle zone e' esploso: " + e.message; }`),

  C('istantanea: l\'esclusione dichiarata, o il motivo per cui non c\'e\'',
`      if (m.ifacc && m.ifacc.dichiarata) {
        console.log(\`         interfaccia dichiarata: \${m.ifacc.zone} zone (\${m.ifacc.tipi}), \` +
          \`\${(m.ifacc.frazione * 100).toFixed(1)}% del quadro — là non si cerca ombra\`);
      }`,
`      if (m.ifacc && m.ifacc.dichiarata) {
        console.log(\`         interfaccia dichiarata: \${m.ifacc.zone} zone (\${m.ifacc.tipi}), \` +
          \`\${(m.ifacc.frazione * 100).toFixed(1)}% del quadro — là non si cerca ombra\`);
      } else if (m.ifacc && m.ifacc.perche) {
        console.log(\`         interfaccia NON dichiarata: \${m.ifacc.perche} — si è misurato tutto il quadro\`);
      }`),

  C('istantanea: il campo che porta il motivo',
`  const ifacc = { zone: 0, pixel: 0, frazione: 0, dichiarata: false, tipi: '' };`,
`  const ifacc = { zone: 0, pixel: 0, frazione: 0, dichiarata: false, tipi: '', perche: '' };`),
]);

/* -------------------------------------------------------- _premuto.js */
T('strumenti/_premuto.js', [

  C('premuto: il tap sulle coordinate d\'archivio',
`  await p.touchscreen.tap(915-66,412-140).catch(()=>{});
  // tap e' troppo veloce: teniamo premuto con eventi grezzi
  await p.evaluate(()=>{
    const x=innerWidth-66,y=innerHeight-140;`,
`  /* ${MARCA}.
     Qui c'erano (915-66, 412-140) e (innerWidth-66, innerHeight-140)
     scritte a mano. Il gioco disegna il disco grande a (VW-64, VH-60):
     ottanta pixel piu' in BASSO, quindi il punto d'archivio cadeva
     ottanta pixel sopra il disco, cioe' sul manto. Questa sonda
     fotografava UNA PRESSIONE SULL'ERBA e salvava l'immagine come
     "premuto.png" — una bugia in forma di prova, che qualcuno avrebbe
     guardato per decidere. Misurato: nella vecchia foto il disco vero
     era ardesia spenta (52,62,57), nella nuova e' ambra (223,164,51),
     che e' il riempimento del tasto premuto. */
  const cen = await p.evaluate(()=>{
    const t=window.__test;
    if(typeof t.pulsanti!=='function') return {errore:'__test.pulsanti non esiste'};
    const b=t.pulsanti(0); if(!Array.isArray(b)||b.length<2) return {errore:'il gioco non dichiara due pulsanti'};
    const gr=b.reduce((a,z)=>(z.r>a.r?z:a),b[0]);
    if(!Array.isArray(t.comandiTouch)) return {errore:'__test.comandiTouch non esiste'};
    const zz=t.comandiTouch.filter(z=>z.tipo==='pulsante'&&(z.team|0)===0);
    if(!zz.length) return {errore:"il gioco non sta dipingendo nessun comando: fotograferei una pressione sul prato"};
    const dip=zz.reduce((a,z)=>(z.r>a.r?z:a),zz[0]);
    const d=Math.hypot(dip.x-gr.x,(dip.y-(dip.premuto?2:0))-gr.y);
    if(!(d<=1)) return {errore:'le due sorgenti non tornano: '+d.toFixed(2)+' px'};
    return {x:Math.round(gr.x),y:Math.round(gr.y),act:gr.act,label:gr.label};
  });
  if(cen.errore){ console.error('BANCO NON VALIDO — '+cen.errore); await br.close(); process.exit(2); }
  console.log('premo il disco grande a ('+cen.x+','+cen.y+') — '+cen.label+' ['+cen.act+']');
  await p.touchscreen.tap(cen.x,cen.y).catch(()=>{});
  // tap e' troppo veloce: teniamo premuto con eventi grezzi
  await p.evaluate(c=>{
    const x=c.x,y=c.y;`),

  C('premuto: la chiusura del dispatch',
`    document.getElementById('gioco').dispatchEvent(new TouchEvent('touchstart',{touches:[tt],changedTouches:[tt],targetTouches:[tt],bubbles:true,cancelable:true}));
  });`,
`    document.getElementById('gioco').dispatchEvent(new TouchEvent('touchstart',{touches:[tt],changedTouches:[tt],targetTouches:[tt],bubbles:true,cancelable:true}));
  }, cen);`),
]);

/* ------------------------------------------- CALCETTO-il-gioco.html --
   QUATTRO COMMENTI DEL GIOCO CHE QUESTA TOPPA SMENTISCE.
   Sono tutti e quattro COMMENTI: non una riga di codice cambia, e il
   collaudo lo dimostra (uscita byte per byte identica). Stanno qui e non
   in un rapporto perche' la regola di casa numero cinque dice che un
   numero dentro il gioco pesa il doppio: resta li' per anni e nessuno lo
   rimisura. Tre di questi dicono che giocata.js preme (vw-66, vh-140) e
   (vw-70, vh-232) — coordinate che il gioco non usa piu' da quando i due
   dischi sono una coppia in diagonale — e il quarto chiama FILTRANTE
   un'etichetta che oggi dice PASSAGGIO.
   Il quarto (:8766) e' quello che chiedeva questa toppa: dopo, la
   richiesta e' soddisfatta e la frase diventerebbe falsa al contrario. */
T('CALCETTO-il-gioco.html', [

  C('gioco: la nota ai custodi dei cancelli, soddisfatta',
`   ATTENZIONE, PER CHI TIENE I CANCELLI: strumenti/giocata.js preme
   ancora (vw-66, vh-140) e (vw-70, vh-232) scritti a mano. Quelle due
   coordinate NON sono piu' i centri, e il cancello va aggiornato a
   leggere __test.comandiTouch — che il gioco esporta da sempre proprio
   per questo. Un cancello che attesta una posizione invece di misurarla
   e' la trappola di casa numero quattro, e qui presenta il conto.`,
`   PER CHI TIENE I CANCELLI: strumenti/giocata.js premeva (vw-66,
   vh-140) e (vw-70, vh-232) scritti a mano, e quelle due coordinate non
   sono piu' i centri da quando i dischi sono in diagonale. Il conto e'
   stato pagato il 19 agosto 2026: il cancello adesso chiede la posizione
   a DUE sorgenti del gioco — __test.pulsanti (il ricalcolo, la stessa
   touchBtnLayout che risolve il tocco) e __test.comandiTouch (il
   dipinto, riempito dentro drawTouchButtons) — e se non tornano entro
   1 px, tolto l'affondamento di 2 px del tasto premuto, non preme e
   dice perche'. Le due non sono indipendenti: scendono tutte e due da
   questa funzione. Cio' che l'incrocio certifica e' che l'export non e'
   stato decorato e che il comando e' dipinto ORA — non che il tocco
   cada li'. Chi separasse un giorno la posa dal tocco lo sappia.`),

  C('gioco: l\'etichetta del disco piccolo',
`/* i DUE pulsanti contestuali dello schema unico: TIRA/CONTRASTA grande,
   FILTRANTE/CAMBIO piccolo. L'etichetta cambia col possesso, la posizione
   MAI; transizione dell'etichetta senza animazioni (densita'). */`,
`/* i DUE pulsanti contestuali dello schema unico: TIRA/CONTRASTA grande,
   PASSAGGIO/CAMBIO piccolo (la FILTRANTE non e' un'etichetta: e' la
   forma mirata del passaggio, e la sceglie il cono, non il dito).
   L'etichetta cambia col possesso, la posizione MAI; transizione
   dell'etichetta senza animazioni (densita'). */`),

  C('gioco: le posizioni che giocata.js non ricorda piu\'',
`         LE POSIZIONI NON CAMBIANO DI UN PIXEL: giocata.js preme
         (vw-66, vh-140) e (vw-70, vh-232), e li trova.`,
`         LE POSIZIONI NON CAMBIANO COL CONTESTO: touchBtnLayout le da'
         uguali col possesso e senza, e l'unico movimento e' questo
         affondamento di 2 px. Dove siano non lo ricorda piu' nessuno
         strumento: giocata.js le chiede a pulsanti() e a comandiTouch e
         le incrocia (19 ago 2026). Le vecchie (vw-66, vh-140) e
         (vw-70, vh-232) erano PRATO gia' quando erano scritte qui.`),

  C('gioco: lo scarto col pallone, senza le coordinate d\'archivio',
`      /* LO SCARTO COL PALLONE. Il pulsante non si sposta di un pixel —
         giocata.js preme (vw-66, vh-140) e (vw-70, vh-232) e li deve
         trovare — quindi qui la regola e' la sfumatura. Il tocco non
         cambia: la mappa dei tocchi non legge questo alfa. */`,
`      /* LO SCARTO COL PALLONE. Il pulsante non si sposta di un pixel —
         chi lo cerca lo trova dove questa riga lo mette, e lo trova da
         qui sotto (TOUCH_ZONE) o da __test.pulsanti — quindi la regola
         e' la sfumatura, non lo spostamento. Il tocco non cambia: la
         mappa dei tocchi non legge questo alfa, e chi misura l'alfa lo
         deve dichiarare invece di campionare un disco mezzo trasparente
         come se fosse interfaccia piena. */`),
]);

/* ================================================================ main
   I file di questo repo hanno le terminazioni di riga MISCHIATE: la
   stessa istantanea.js ha righe con \n e righe con \r\n. Un cerca /
   sostituisci letterale su piu' righe ci inciampa e direbbe "ancoraggio
   non trovato" per un motivo che non c'entra niente col codice. Quindi
   l'ancoraggio si compila in un'espressione regolare dove ogni fine
   riga vale \r?\n, e la sostituzione riprende la terminazione del testo
   che ha davvero sostituito: il file esce com'era. */
const escRx = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rxDi = s => new RegExp(escRx(s).replace(/\n/g, '\\r?\\n'), 'g');

let guasti = 0;
const pronti = [];
for (const t of TOPPE) {
  const f = path.join(DIR, t.file);
  if (!fs.existsSync(f)) { console.error(`MANCA IL FILE  ${t.file}  (in ${DIR})`); guasti++; continue; }
  let s = fs.readFileSync(f, 'utf8');
  const gia = s.includes(MARCA);
  for (const c of t.cambi) {
    const trovati = s.match(rxDi(c.cerca));
    const n = trovati ? trovati.length : 0;
    if (n !== 1) {
      console.error(`ANCORAGGIO ${n === 0 ? 'NON TROVATO' : 'TROVATO ' + n + ' VOLTE'}  ${t.file}  ->  ${c.nome}` +
        (gia && n === 0 ? '   (il file porta gia\' la marca: toppa gia\' applicata?)' : ''));
      guasti++;
      continue;
    }
    const crlf = trovati[0].includes('\r\n');
    const sost = crlf ? c.sost.replace(/\r?\n/g, '\r\n') : c.sost;
    s = s.replace(rxDi(c.cerca), () => sost);
  }
  pronti.push({ f, s, file: t.file, n: t.cambi.length });
}

if (guasti) {
  console.error(`\n${guasti} ancoraggi non tornano: NON SCRIVO NIENTE, nemmeno i file che tornavano.`);
  process.exit(1);
}
for (const p of pronti) {
  if (!PROVA) fs.writeFileSync(p.f, p.s);
  console.log(`${PROVA ? 'proverei' : 'toppato'}  ${p.file}  (${p.n} sostituzioni)`);
}
console.log(`\n${pronti.length} strumenti, ${pronti.reduce((a, p) => a + p.n, 0)} sostituzioni` +
  (PROVA ? ' — PROVA: non ho scritto niente.' : ` in ${DIR}`));
