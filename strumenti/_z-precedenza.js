/* =====================================================================
   _z-precedenza.js — SOLA MISURA. Dove finisce un dito che si appoggia
   attorno ai comandi, e cosa succede quando le dita sono DUE.
   ATTREZZO (prefisso _).  Edizione 2, 19-08-2026.

   ---------------------------------------------------------------------
   PERCHE' L'EDIZIONE 1 DI QUESTO BANCO ERA CIECA, detto per primo.

   L'edizione 1 misurava una toppa sulla precedenza dei tocchi e la
   dichiarava verde. Un critico ha poi trovato, con una misura, che
   quella toppa introduceva una regressione peggiore del difetto che
   riparava: un contatto fermo A SINISTRA del pollice in corsa rubava la
   levetta e, all'alzarsi, faceva partire un passaggio non chiesto.
   Questo banco non poteva vederlo per un motivo strutturale: le dita che
   disturbavano nascevano da un reticolo che comincia a x = 685, cioe'
   stavano SEMPRE a destra del pollice — sempre dalla parte in cui la
   toppa diceva di no. Un banco che posa le dita solo dove alla toppa
   conviene non misura la toppa: la incorona.

   Cosa e' cambiato, in questa edizione:
     1. le dita che disturbano si posano su TUTTO IL VETRO — reticolo
        pieno della vista piu' una corona fitta attorno al pollice, quindi
        a sinistra, a destra, sopra, sotto, e anche sui pulsanti;
     2. si prova nei DUE ordini: disturbo prima e pollice dopo (P6),
        pollice che gia' comanda e disturbo dopo (la regressione);
     3. l'oracolo di prova A non e' piu' la trascrizione della regola che
        la toppa scrive (vedi sotto: ORACOLI);
     4. il canale «strada percorsa» e' ABOLITO. Nel referto dell'edizione
        1 il braccio di riferimento — il pollice da solo, che nessuna
        toppa puo' toccare — dava 46,3 +- 111,5 prima e 17,3 +- 120,8
        dopo: due volte e mezzo su una quantita' che deve essere
        identica. Quel canale non misurava niente. Al suo posto si misura
        il COMANDO, cioe' humanMove(t): e' la funzione del gioco che
        traduce la levetta in movimento, e' deterministica, e non ha
        dentro ne' la palla da inseguire ne' l'avversario che marca;
     5. nessuna prova viene saltata in silenzio: una prova saltata rende
        NULLO il referto;
     6. le eccezioni di pagina rendono NULLO il referto (nell'edizione 1
        venivano solo stampate);
     7. il congelamento non si verifica piu' su tre campi: si verifica su
        un'IMPRONTA di tutti i campi numerici e booleani di tutti i
        giocatori, del pallone e dello stato di partita, e se cambia il
        referto dice QUALE campo si e' mosso.

   ---------------------------------------------------------------------
   GLI ORACOLI — tre, e nessuno dei tre e' la toppa.

   L'edizione 1 aveva un oracolo solo, e il critico ha ragione a dire che
   era in buona parte tautologico: trascriveva riga per riga la regola che
   la toppa scrive («distanza normalizzata, la presa prima
   dell'esclusione»). Applicata la toppa, lo zero era garantito per
   costruzione. Qui ce ne sono tre, indipendenti fra loro:

   ORACOLO 1 — LA SPECIFICA, non l'algoritmo. Deriva dal commento che il
   gioco stesso scrive accanto all'anello di esclusione: «un dito che
   MANCA il pulsante di poco non diventa origine dello stick». Quindi:
     · un punto entro r+10 da un disco e' una presa DI QUEL DISCO, perche'
       non sta mancando niente;
     · un punto entro r+18 da qualche disco ma dentro nessuna presa e'
       morto: e' il dito che ha mancato di poco;
     · tutto il resto e' levetta.
   Questa specifica non nomina ne' l'ordine dell'elenco ne' la distanza
   normalizzata: la toppa e' UNA delle sue possibili scritture, non la
   sua trascrizione. Ha un solo punto cieco possibile — un punto dentro
   DUE dischi di presa — e in quel caso questo attrezzo NON inventa una
   precedenza: rifiuta il referto. Coi dischi di oggi non succede mai, e
   lo strumento lo dimostra stampando la separazione (50+40 = 90 contro
   94,76 px fra i centri).

   ORACOLO 2 — IL DIFFERENZIALE, che non ha nessuna regola dentro. Con
   --contro si misurano due file e si guarda QUALI punti hanno cambiato
   risposta. Il riferimento non e' una regola scritta da me: e' il gioco
   in produzione. La toppa e' buona se l'insieme dei punti cambiati e'
   ESATTAMENTE l'insieme dei punti di mezzaluna — ne' uno di piu' (allora
   toccherebbe qualcosa che non doveva toccare) ne' uno di meno.

   ORACOLO 3 — LA MISURA E' COMPORTAMENTALE, non di stato. L'edizione 1
   chiedeva al gioco «di chi e' la levetta?» leggendo Touch5.stick. Ma la
   toppa nuova cambia PROPRIO quel dato interno (la levetta si prende
   muovendo il dito, non appoggiandolo): un banco che legge lo stato
   direbbe «morto» dove il dito comanda benissimo. Quindi qui non si
   legge nessuno stato interno: si posa il dito, LO SI MUOVE di 20 px, e
   si chiede al gioco quanto vale humanMove(t), che e' il comando vero.
     · e' partita un'azione di pulsante  -> PRESA di quel disco
     · humanMove diventa diverso da zero -> LEVETTA
     · ne' l'una ne' l'altra             -> MORTO
   Le tre risposte sono le stesse per il file di oggi e per il file
   toppato, perche' sono fatte di cio' che il giocatore sente, non di
   come e' scritto dentro.

   ---------------------------------------------------------------------
   IL CONGELAMENTO, e perche' non falsa la misura.
   Ventimila dita appoggiate in fila su un gioco vivo sono ventimila
   scivolate, cambi e tiri: la partita segna, la scena diventa 'goal' e da
   li' in poi ogni tocco cade sulla levetta. Il conto misurerebbe le reti,
   non le superfici. Quindi si spegne il ciclo di disegno e — questa e'
   nuova — si STACCA IL COMANDATO (G.ctrl[0] = -1) per tutta la prova A.
   Con il comandato staccato, Touch5.release trova ctrlPlayer(t) nullo ed
   esce senza fare niente: le ventitremila dita non possono passare,
   tirare ne' scivolare. Non e' un trucco per far uscire un numero: e'
   quello che «congelare» vuol dire, portato fino in fondo, e si VERIFICA
   — se anche un solo rilascio ha avuto effetto, il referto e' NULLO.

   ---------------------------------------------------------------------
   LE QUATTRO PROVE.

   PROVA A — LA GRIGLIA DELLE SUPERFICI. Reticolo a passo intero attorno
   ai due dischi, un dito alla volta, oracoli 1 e 3 (e 2 con --contro).
   La zona che conta si chiama MEZZALUNA: i punti in cui la presa di un
   disco cade dentro l'anello di esclusione di un altro.

   PROVA B — P6, IL POLLICE CHE ARRIVA SECONDO. Un dito si appoggia da
   qualche parte sul vetro e ci resta FERMO; poi il pollice scende sulla
   sua levetta e TRASCINA. Domanda: il pollice comanda? Il dito che
   disturba si posa su tutto il vetro, non solo vicino ai pulsanti.

   PROVA C — IL DITO VAGANTE, cioe' la regressione. Ordine rovesciato: il
   pollice scende e trascina PRIMA, quindi comanda gia'; poi arriva il
   contatto vagante, e poi si alza. Tre domande: la levetta resta al
   pollice? il comando resta acceso? all'alzarsi del vagante parte un
   gesto che nessuno ha chiesto? La squadra umana viene messa IN POSSESSO
   prima di ogni prova, perche' e' li' che un passaggio fantasma regala
   davvero il pallone.

   PROVA D — IL TOCCO SEMPLICE, cioe' il costo. Un dito solo, appoggia e
   alza col pallone al piede: deve partire un passaggio, come da sempre.
   E poi la variante a due contatti d'erba, per MISURARE cio' che la cura
   costa invece di dedurlo.

   ---------------------------------------------------------------------
   COSA QUESTO ATTREZZO NON SA FARE, dichiarato:
     — non sa dire se lo schema e' PIACEVOLE, ne' se si impara;
     — non ha un polpastrello, quindi non vede che il dito COPRE cio' che
       tocca: il modello e' un punto, e un punto non ha area;
     — nel modo banco le dita sono eventi sintetici del browser: passano
       per la catena d'ingresso di Blink ma non per quella del kernel
       Android. Per quella c'e' --telefono.

   uso:
     node strumenti/_z-precedenza.js --gioco fuori/dopo.html
     node strumenti/_z-precedenza.js --gioco a.html --contro b.html
     node strumenti/_z-precedenza.js --gioco a.html --telefono
     opzioni: --passo 1 --raggio 62 --vista 915x412 --vivi 300
              --passoBC 48  (reticolo delle dita che disturbano)
              --soloA / --soloBCD
     node strumenti/_z-precedenza.js --gioco a.html --sabota 3
              il banco appoggia il dito 3 px piu' in la' di dove crede:
              DEVE uscire NULLO.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const ha = n => process.argv.includes('--' + n);

const PASSO = Math.max(1, +arg('passo', 1));
const RAGGIO = +arg('raggio', 62);
const PASSO_LARGO = 4;
const PASSO_BC = Math.max(8, +arg('passoBC', 48));
const VIVI = +arg('vivi', 300);
const SAB = +arg('sabota', 0);
const SOLO_A = ha('soloA'), SOLO_BCD = ha('soloBCD');
const VISTA = (() => {
  const s = arg('vista', '915x412').split('x');
  return { width: +s[0] || 915, height: +s[1] || 412 };
})();
const pausa = ms => new Promise(r => setTimeout(r, ms));

/* =====================================================================
   ORACOLO 1 — LA SPECIFICA. Nessuna normalizzazione, nessun minimo,
   nessun ordine di elenco: solo le due soglie che il gioco dichiara.
   Restituisce null se la specifica e' AMBIGUA su quel punto (dentro due
   prese): in quel caso l'attrezzo rifiuta invece di inventare.
   ===================================================================== */
function specifica(dischi, x, y) {
  const prese = dischi.filter(b => Math.hypot(x - b.x, y - b.y) <= b.r + 10);
  if (prese.length > 1) return null;                 // ambigua: non decido io
  if (prese.length === 1) return 'presa' + prese[0].r;
  if (dischi.some(b => Math.hypot(x - b.x, y - b.y) <= b.r + 18)) return 'morto';
  return 'levetta';
}

/* la MEZZALUNA: presa legittima di un disco dentro l'esclusione di un
   altro. E' la zona in cui il difetto vive, e si calcola dalla geometria
   dichiarata dal gioco, non si scrive a mano. */
function mezzaluna(dischi, x, y) {
  for (const a of dischi) {
    if (Math.hypot(x - a.x, y - a.y) > a.r + 10) continue;
    for (const b of dischi) {
      if (b === a) continue;
      if (Math.hypot(x - b.x, y - b.y) <= b.r + 18) return true;
    }
  }
  return false;
}

/* area della lente fra due cerchi, formula chiusa. Serve solo al referto:
   il conto dei punti non ne dipende. */
function lente(r1, r2, d) {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  return r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1))
       + r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2))
       - 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
}

function costruisciGriglia(dischi, VW, VH) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const b of dischi) {
    x0 = Math.min(x0, b.x - b.r - 18 - 24); x1 = Math.max(x1, b.x + b.r + 18 + 24);
    y0 = Math.min(y0, b.y - b.r - 18 - 24); y1 = Math.max(y1, b.y + b.r + 18 + 24);
  }
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
  x1 = Math.min(VW - 1, Math.ceil(x1)); y1 = Math.min(VH - 1, Math.ceil(y1));
  const punti = [];
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      let vicino = false;
      for (const b of dischi) if (Math.hypot(x - b.x, y - b.y) <= RAGGIO) { vicino = true; break; }
      if (vicino) { if ((x % PASSO) || (y % PASSO)) continue; }
      else { if ((x % PASSO_LARGO) || (y % PASSO_LARGO)) continue; }
      punti.push({ x, y, fitto: vicino });
    }
  }
  return { punti, box: { x0, y0, x1, y1 } };
}

/* IL RETICOLO DELLE DITA CHE DISTURBANO — su TUTTO il vetro, piu' una
   corona fitta attorno al pollice. E' la riga che l'edizione 1 non
   aveva: li' le dita nascevano dalla griglia dei dischi, cioe' sempre a
   destra del pollice, cioe' sempre dalla parte comoda. */
function ditaCheDisturbano(VW, VH, casa) {
  const p = [], visti = new Set();
  const metti = (x, y) => {
    x = Math.round(Math.min(VW - 4, Math.max(4, x)));
    y = Math.round(Math.min(VH - 4, Math.max(4, y)));
    const k = x + '|' + y;
    if (visti.has(k)) return;
    visti.add(k); p.push({ x, y });
  };
  for (let x = 8; x < VW - 4; x += PASSO_BC) for (let y = 8; y < VH - 4; y += PASSO_BC) metti(x, y);
  /* la corona attorno al pollice: e' li' che si appoggia il palmo, la
     nocca, il terzo dito — ed e' li' che la toppa ritirata rubava */
  for (const r of [10, 16, 24, 34, 50, 72, 100]) {
    for (let k = 0; k < 16; k++) {
      const a = k * Math.PI / 8;
      metti(casa.x + r * Math.cos(a), casa.y + r * Math.sin(a));
    }
  }
  return p;
}

/* ---------------------------------------------------------------------
   LA SONDA — dentro la pagina. Avvolge Touch5 e le azioni del gioco e
   REGISTRA, senza cambiare una virgola di quello che fanno.
   --------------------------------------------------------------------- */
const SONDA = `(() => {
  if (window.__prec) return 'gia attiva';
  const AZIONI = ['doPass','fireShot','startSlide','kickBall','doCross','doFiltrante',
                  'cambiaGiocatore','startCharge','releaseCharge','doSlide'];
  const cont = {}, mancanti = [];
  for (const n of AZIONI) {
    if (typeof window[n] !== 'function') { mancanti.push(n); continue; }
    cont[n] = 0;
    const orig = window[n];
    window[n] = function(){ cont[n]++; return orig.apply(this, arguments); };
  }
  const tot = () => { let s = 0; for (const k in cont) s += cont[k]; return s; };

  /* il comandato STACCATO: con G.ctrl[t] = -1 ctrlPlayer(t) e' nullo e
     Touch5.release esce senza toccare niente. Un cambiaGiocatore che
     riattaccasse il comando riaprirebbe la porta, quindi finche' il flag
     e' acceso lo si ristacca subito dopo. */
  let staccato = -1, ctrlSalvo = -1;
  if (typeof window.cambiaGiocatore === 'function') {
    const oc = window.cambiaGiocatore;
    window.cambiaGiocatore = function(t){ const r = oc.apply(this, arguments);
      if (staccato === t) G.ctrl[t] = -1; return r; };
  }

  const log = [];            // un record per touchstart
  const cur = {};            // id vivo -> record
  const attivi = new Set();
  let maxVive = 0;
  const rilasci = [];        // ogni Touch5.release, con il suo effetto
  /* LA TRACCIA: cosa e' arrivato davvero a Touch5, in ordine. Serve a una
     guardia che l'edizione 1 non aveva e che le e' costata cara: il banco
     deve DIMOSTRARE di aver alzato il dito che voleva alzare. In
     Input.dispatchTouchEvent i touchPoints di un touchEnd sono i punti
     RILASCIATI, non quelli che restano — misurato, non dedotto — e
     scambiarli fa alzare il pollice al posto del dito vagante, cioe'
     misurare l'esatto contrario. */
  let traccia = [];

  const or = Touch5.release;
  Touch5.release = function(t, s){
    const p = (typeof ctrlPlayer === 'function') ? ctrlPlayer(t) : null;
    const c0 = tot();
    or.call(this, t, s);
    rilasci.push({ t, senzaComandato: !p, hist: (s && s.hist) ? s.hist.length : -1, az: tot() - c0 });
    if (rilasci.length > 6000) rilasci.shift();
  };

  const os = Touch5.start;
  Touch5.start = function(id, x, y){
    const scena = G.scene, fermo = !!G.paused;
    const t = this.teamOf(x), cpu = !!G.cpu[t];
    const c0 = tot();
    os.call(this, id, x, y);
    let presa = null, r = -1;
    const bt = this.btnTouch[id];
    if (bt) { presa = bt.act; for (const b of touchBtnLayout(t)) if (b.act === bt.act) r = b.r; }
    const rec = { x: Math.round(x*100)/100, y: Math.round(y*100)/100, t, presa, r,
                  hm: 0, mosse: 0, s: scena, c: cpu, p: fermo, az: tot() - c0, azFine: 0 };
    log.push(rec); cur[id] = rec;
    attivi.add(id); if (attivi.size > maxVive) maxVive = attivi.size;
    if (traccia.length < 400) traccia.push('s' + id);
    return undefined;
  };

  const om = Touch5.move;
  Touch5.move = function(id, x, y){
    om.call(this, id, x, y);
    if (traccia.length < 400) traccia.push('m' + id);
    const rec = cur[id];
    if (rec) {
      rec.mosse++;
      if (typeof humanMove === 'function') {
        const m = humanMove(rec.t), l = Math.hypot(m[0], m[1]);
        if (l > rec.hm) rec.hm = Math.round(l*10000)/10000;
      }
    }
  };

  const oe = Touch5.end;
  Touch5.end = function(id){
    const rec = cur[id]; const c0 = tot();
    oe.call(this, id);
    if (traccia.length < 400) traccia.push('e' + id);
    if (rec) { rec.azFine = tot() - c0; delete cur[id]; }
    attivi.delete(id);
  };

  window.__prec = {
    log, rilasci, cont, mancantiAzioni: mancanti,
    azzera(){ log.length = 0; traccia = []; for (const k in cur) delete cur[k]; },
    traccia(){ return traccia.join(','); },
    /* CHI STA SOPRA. Non tutto il vetro e' il campo: il pulsante di pausa
       e la pastiglia del tutorial sono elementi HTML veri, e un dito che
       cade li' non arriva a Touch5 — giustamente. Un banco che non lo
       chiede conta quei punti come «prova fallita» e si dichiara nullo
       per un motivo che non e' un difetto del gioco. */
    sopra(pts){ return pts.map(p => { const e = document.elementFromPoint(p.x, p.y);
      return e ? (e.id || e.tagName.toLowerCase()) : '(niente)'; }); },
    azzeraRilasci(){ rilasci.length = 0; },
    azzeraCont(){ for (const k in cont) cont[k] = 0; },
    contatori(){ return JSON.parse(JSON.stringify(cont)); },
    /* i RILASCI, non le azioni: un pulsante che fa il suo mestiere muove
       i contatori delle azioni ed e' giusto cosi'. Il gesto FANTASMA e'
       un'altra cosa: e' Touch5.release chiamato da un dito che non
       comandava. Quindi si conta quello. */
    rilN(t){ let s = 0, n = 0;
      for (const r of rilasci) { if (t !== undefined && r.t !== t) continue; n++; s += r.az; }
      return { n, az: s }; },
    maxVive(){ return maxVive; },
    azzeraVive(){ maxVive = attivi.size; },
    dischi(){ return touchBtnLayout(0).map(b => ({ act:b.act, x:b.x, y:b.y, r:b.r })); },
    /* CHI STO MISURANDO. Sul telefono il gioco sta dentro un APK, e l'APK
       lo puo' reinstallare chiunque: un referto che non dice QUALE gioco
       ha misurato non e' un referto. Qui si leggono dalla pagina i segni
       che distinguono le versioni, invece di fidarsi di cosa credo di
       aver installato. */
    identita(){
      /* SI LEGGONO LE ORIGINALI, non le avvolgenti: questa sonda avvolge
         start, move e release, e chiedere il testo a Touch5.start
         restituirebbe il testo della sonda — cioe' l'attrezzo che misura
         se stesso. os/om/or sono le funzioni del gioco. */
      const tStart = os.toString(), tMove = om.toString(), tRel = or.toString();
      return { toppaLevetta: typeof Touch5.SOGLIA_LEVETTA === 'number' ? Touch5.SOGLIA_LEVETTA : null,
               toppaMezzaluna: /uPresa/.test(tStart),
               rilascioInerte: /return false/.test(tRel) && tRel.length < 60,
               haRiadozione: /riadotta/.test(tMove),
               haChiudi: typeof Touch5.chiudi === 'function',
               byteHTML: document.documentElement.outerHTML.length };
    },
    stacca(t){ staccato = t; ctrlSalvo = G.ctrl[t]; G.ctrl[t] = -1; return ctrlSalvo; },
    attacca(t){ if (staccato === t) { G.ctrl[t] = ctrlSalvo; staccato = -1; } return G.ctrl[t]; },
    /* mette la squadra t IN POSSESSO col comandato: e' la condizione in
       cui un passaggio fantasma regala davvero il pallone */
    arma(t){
      const i = G.ctrl[t];
      if (i < 0) return false;
      G.ball.owner = i; G.ball.vx = 0; G.ball.vy = 0;
      const p = G.players[i]; G.ball.x = p.x; G.ball.y = p.y;
      return G.ball.owner === i;
    },
    inPossesso(t){ return G.ball.owner >= 0 && G.players[G.ball.owner] && G.players[G.ball.owner].team === t; },
    comando(t){ if (typeof humanMove !== 'function') return null;
      const m = humanMove(t); return { x:+m[0].toFixed(4), y:+m[1].toFixed(4), l:+Math.hypot(m[0],m[1]).toFixed(4) }; },
    levetta(){ return Touch5.stick.map(s => ({ a:s.active, id:s.id, ox:+s.ox.toFixed(2), oy:+s.oy.toFixed(2),
                                               dx:+s.dx.toFixed(2), dy:+s.dy.toFixed(2), h:(s.hist||[]).length })); },
    stato(){
      const b = G.ball;
      return { scena:G.scene, fermo:!!G.paused, cpu0:!!G.cpu[0], mode:G.mode,
               bx:Math.round(b.x*1000)/1000, by:Math.round(b.y*1000)/1000,
               owner:b.owner, ctrl0:G.ctrl[0], ctrl1:G.ctrl[1],
               VW:(typeof VW!=='undefined'?VW:innerWidth), VH:(typeof VH!=='undefined'?VH:innerHeight),
               iw:innerWidth, ih:innerHeight };
    },
    /* L'IMPRONTA: ogni campo numerico o booleano di ogni giocatore, del
       pallone e dello stato di partita. Il congelamento dell'edizione 1
       confrontava tre campi e diceva «niente si e' MOSSO»; questo dice
       «niente e' CAMBIATO», ed e' un'altra frase. */
    impronta(){
      const o = {};
      const dentro = (pre, ob) => {
        for (const k of Object.keys(ob).sort()) {
          const v = ob[k];
          if (typeof v === 'number' && isFinite(v)) o[pre+'.'+k] = Math.round(v*1000)/1000;
          else if (typeof v === 'boolean') o[pre+'.'+k] = v ? 1 : 0;
        }
      };
      for (let i = 0; i < G.players.length; i++) dentro('g'+i, G.players[i]);
      dentro('palla', G.ball);
      dentro('G', G);
      /* LA SCENA E' UNA STRINGA, e le stringhe non entravano nell'impronta:
         il congelamento poteva dire SI mentre la partita era passata da
         'play' a 'goal'. Ci entra come numero. */
      let h = 0; const sc = String(G.scene);
      for (let i = 0; i < sc.length; i++) h = (h * 31 + sc.charCodeAt(i)) | 0;
      o['G.scena'] = h;
      return o;
    },
    congela(){
      if (window.__precRAF) return 'gia congelato';
      window.__precRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = function(){ return 0; };
      return 'congelato';
    },
    /* SCONGELARE NON E' RIMETTERE A POSTO LA FUNZIONE: il ciclo si
       ripianifica da solo (l'ultima riga di frame() e'
       requestAnimationFrame(frame)), quindi il primo frame caduto nella
       funzione finta ha ROTTO la catena. Qui la si riattacca a mano, e
       chi chiama VERIFICA che lo stato riprenda a muoversi. */
    scongela(){
      if (!window.__precRAF) return 'non era congelato';
      window.requestAnimationFrame = window.__precRAF;
      window.__precRAF = null;
      if (typeof frame === 'function') { window.requestAnimationFrame(frame); return 'scongelato'; }
      return 'NON SO RIACCENDERE IL CICLO: frame() non risulta raggiungibile';
    },
  };
  return 'installata';
})()`;

/* ---------------------------------------------------------------------
   IL SERVER
   --------------------------------------------------------------------- */
const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
function servi(fileGioco) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      const f = (u === '/PROVA.html') ? fileGioco : path.join(RADICE, u);
      if ((f !== fileGioco && !f.startsWith(RADICE)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* =====================================================================
   MODO BANCO — dita sintetiche di Blink, via CDP.
   ===================================================================== */
async function misuraBanco(fileGioco, etichetta) {
  const { chromium } = require('playwright');
  const srv = await servi(path.resolve(fileGioco));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VISTA, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  await pag.addInitScript(seme => {
    let s = seme >>> 0 || 1;
    const pr = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
    Math.random = () => pr() / 4294967296;
  }, 20260819);
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto(`http://127.0.0.1:${srv.porta}/PROVA.html`, { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); });
  await pag.evaluate(() => window.__test.startMatch(1, 1, { size: 5 }));
  await pag.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(pag);

  const inst = await pag.evaluate(SONDA);
  if (inst !== 'installata') throw new Error('sonda non installata: ' + inst);
  const mancantiAzioni = await pag.evaluate(() => window.__prec.mancantiAzioni);

  const dischi = await pag.evaluate(() => window.__prec.dischi());
  const s0 = await pag.evaluate(() => window.__prec.stato());
  const identita = await pag.evaluate(() => window.__prec.identita());
  if (dischi.length !== 2) throw new Error('mi aspettavo due dischi, ne trovo ' + dischi.length);
  const G1 = costruisciGriglia(dischi, s0.VW, s0.VH);
  const casa = { x: Math.round(s0.VW * 0.20), y: Math.round(s0.VH * 0.70) };

  /* LA PARTITA DEVE ESSERCI. Fra il momento in cui si legge lo stato e
     quello in cui si comincia a misurare passano secondi, e in quei
     secondi la squadra puo' segnare: allora la scena non e' piu' di
     gioco, la guardia di Touch5.start non passa, e OGNI punto risponde
     «levetta». L'edizione 1 di questo banco non lo controllava prima di
     congelare, e in una corsa su ventitremila punti il conto e' uscito
     al 75% di scarti — che non erano un difetto del gioco, erano una
     partita finita in gol. */
  async function assicuraPartita() {
    for (let i = 0; i < 14; i++) {
      const st = await pag.evaluate(() => window.__prec.stato());
      if ((st.scena === 'play' || st.scena === 'golden' || st.scena === 'kickoff') && !st.fermo) return st;
      await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash();
                                 window.__test.startMatch(1, 1, { size: 5 }); });
      await pag.waitForTimeout(900);
    }
    return null;
  }
  /* congela SOLO da partita viva, e verifica che dopo il congelamento la
     scena sia ancora quella. Se il gol e' arrivato nel frattempo, si
     scongela e si ricomincia. */
  async function congelaInPartita() {
    for (let k = 0; k < 4; k++) {
      const pr = await assicuraPartita();
      if (!pr) continue;
      const c = await pag.evaluate(() => window.__prec.congela());
      await pag.waitForTimeout(120);
      const st = await pag.evaluate(() => window.__prec.stato());
      if ((st.scena === 'play' || st.scena === 'golden' || st.scena === 'kickoff') && !st.fermo) return c;
      await pag.evaluate(() => window.__prec.scongela());
      await pag.waitForTimeout(400);
    }
    return 'NON SONO RIUSCITO A CONGELARE UNA PARTITA VIVA';
  }

  const M0identita = identita;
  const M = { etichetta, file: path.resolve(fileGioco), dischi, s0, casa, griglia: G1, errori, mancantiAzioni,
              identita: M0identita,
              log: [], vivi: [], msGriglia: 0, provaB: [], provaC: [], provaD: null,
              cong: '', scong: '', sveglio: undefined, deltaImpronta: [], rilasciConEffetto: 0,
              maxViveA: 0, maxViveBC: 0, chiestiB: 0, chiestiC: 0 };

  /* ================= PROVA A ================= */
  if (!SOLO_BCD) {
    M.cong = await congelaInPartita();
    /* la copertura si chiede a gioco GIA' fermo: chiedere elementFromPoint
       ventitremila volte su un gioco vivo costa secondi, e in quei secondi
       la partita cambia scena sotto il banco */
    {
      const so = await pag.evaluate(pts => window.__prec.sopra(pts), G1.punti.map(p => ({ x: p.x, y: p.y })));
      const cop = new Map();
      for (let i = 0; i < so.length; i++) if (so[i] !== 'gioco') cop.set(so[i], (cop.get(so[i]) || 0) + 1);
      M.grigliaCoperta = [...cop].map(([k, v]) => `${k}:${v}`).join(' ');
    }
    M.statoGriglia = await pag.evaluate(() => window.__prec.stato());
    const ctrlSalvo = await pag.evaluate(() => window.__prec.stacca(0));
    const imp0 = await pag.evaluate(() => window.__prec.impronta());
    await pag.evaluate(() => { window.__prec.azzera(); window.__prec.azzeraRilasci(); window.__prec.azzeraVive(); });

    const t0 = Date.now();
    const LOTTO = 200;
    /* IL GESTO DI PROVA A: appoggia, MUOVI di 20 px verso il centro,
       alza. Il movimento non e' un vezzo — e' l'unico modo di chiedere al
       gioco «questo dito comanda?» senza leggergli dentro lo stato, che
       la toppa cambia apposta. 20 px superano la dead-zone (12) e la
       soglia di promozione (6). Verso sinistra perche' i dischi stanno a
       destra e il reticolo non deve uscire dalla vista. */
    for (let i = 0; i < G1.punti.length; i += LOTTO) {
      const fetta = G1.punti.slice(i, i + LOTTO);
      const cose = [];
      for (const p of fetta) {
        const x = p.x + SAB;
        cose.push(cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: p.y, id: 1 }] }));
        /* DUE movimenti, non uno: Blink sopprime il primo touchmove
           dentro la sua «touch slop» e ogni tanto ne perde uno in
           raffica. Due passi, e chi non e' arrivato lo si rifa' a mano
           qui sotto — non lo si perde in silenzio. */
        cose.push(cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 20, y: p.y, id: 1 }] }));
        cose.push(cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 34, y: p.y, id: 1 }] }));
        cose.push(cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }));
      }
      await Promise.all(cose);
    }
    await pag.waitForTimeout(250);
    M.log = await pag.evaluate(() => window.__prec.log.slice());
    /* LA SECONDA SPEDIZIONE. Un punto il cui movimento non e' arrivato
       non e' un punto misurato: si rifa', uno per uno, con calma. Il
       conto di quanti ne sono serviti sta nel referto. */
    {
      const perOra = new Map();
      for (const r of M.log) perOra.set(r.x + '|' + r.y, r);
      const daRifare = M.griglia.punti.filter(p => {
        const r = perOra.get((p.x + SAB) + '|' + p.y); return r && !r.presa && r.mosse === 0;
      });
      M.rifatti = daRifare.length;
      for (const p of daRifare) {
        const x = p.x + SAB;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: p.y, id: 1 }] });
        await pag.waitForTimeout(12);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 20, y: p.y, id: 1 }] });
        await pag.waitForTimeout(12);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 34, y: p.y, id: 1 }] });
        await pag.waitForTimeout(12);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      if (daRifare.length) { await pag.waitForTimeout(150); M.log = await pag.evaluate(() => window.__prec.log.slice()); }
    }
    M.msGriglia = Date.now() - t0;
    M.maxViveA = await pag.evaluate(() => window.__prec.maxVive());
    const ril = await pag.evaluate(() => window.__prec.rilasci.slice());
    M.rilasciConEffetto = ril.filter(r => r.az > 0 || !r.senzaComandato).length;
    M.rilasciTot = ril.length;
    const imp1 = await pag.evaluate(() => window.__prec.impronta());
    for (const k of Object.keys(imp0)) if (imp0[k] !== imp1[k]) M.deltaImpronta.push(`${k}: ${imp0[k]} -> ${imp1[k]}`);
    for (const k of Object.keys(imp1)) if (!(k in imp0)) M.deltaImpronta.push(`${k}: (assente) -> ${imp1[k]}`);
    await pag.evaluate(() => window.__prec.attacca(0));
    M.scong = await pag.evaluate(() => window.__prec.scongela());
    const sv0 = await pag.evaluate(() => window.__prec.impronta());
    await pag.waitForTimeout(700);
    const sv1 = await pag.evaluate(() => window.__prec.impronta());
    M.sveglio = M.scong === 'scongelato' && Object.keys(sv0).some(k => sv0[k] !== sv1[k]);
    M.ctrlSalvo = ctrlSalvo;

    /* ---- PROVA A bis: il controllo a gioco VIVO ---- */
    const daRifare = [];
    for (const p of G1.punti) if (mezzaluna(dischi, p.x, p.y)) daRifare.push(p);
    const passo = Math.max(1, Math.floor(G1.punti.length / Math.max(1, VIVI - daRifare.length)));
    for (let i = 0; i < G1.punti.length; i += passo) daRifare.push(G1.punti[i]);
    for (const p of daRifare) {
      let ok = false;
      for (let tent = 0; tent < 6 && !ok; tent++) {
        const st = await assicuraPartita();
        if (!st) { await pag.waitForTimeout(400); continue; }
        await pag.evaluate(() => window.__prec.azzera());
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y, id: 1 }] });
        await pag.waitForTimeout(12);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x - 20, y: p.y, id: 1 }] });
        await pag.waitForTimeout(12);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x - 34, y: p.y, id: 1 }] });
        await pag.waitForTimeout(12);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        const l = await pag.evaluate(() => window.__prec.log.slice());
        if (l.length === 1 && (l[0].s === 'play' || l[0].s === 'golden' || l[0].s === 'kickoff') && !l[0].p && l[0].mosse > 0) {
          M.vivi.push({ x: p.x, y: p.y, e: classifica(l[0]) }); ok = true;
        }
      }
      if (!ok) M.vivi.push({ x: p.x, y: p.y, e: 'NONARRIVATO' });
    }
  }

  /* ================= PROVE B, C, D ================= */
  if (!SOLO_A) {
    M.congBCD = await congelaInPartita();
    M.statoBCD = await pag.evaluate(() => window.__prec.stato());
    const tutte = ditaCheDisturbano(s0.VW, s0.VH, casa);
    const so = await pag.evaluate(pts => window.__prec.sopra(pts), tutte);
    const dita = [], scartati = new Map();
    for (let i = 0; i < tutte.length; i++) {
      if (so[i] === 'gioco') dita.push(tutte[i]);
      else scartati.set(so[i], (scartati.get(so[i]) || 0) + 1);
    }
    M.ditaScartate = [...scartati].map(([k, v]) => `${k}:${v}`).join(' ');
    M.ditaChieste = tutte.length;
    M.chiestiB = dita.length; M.chiestiC = dita.length;
    /* e il pollice stesso deve cadere sul campo, se no non c'e' prova */
    const casaSopra = (await pag.evaluate(pts => window.__prec.sopra(pts), [casa]))[0];
    M.casaSopra = casaSopra;

    const PASSI = 6, DX = -9, DY = -5;   // 54 px: oltre la dead-zone (12) e la corsa piena (46)
    const POL = 7, VAG = 9;              // identificativi dei due tocchi
    /* LE TRACCE ATTESE. Sono la guardia contro il banco che crede di aver
       fatto un gesto e ne ha fatto un altro: se cio' che e' arrivato a
       Touch5 non e' esattamente questo, la prova non conta. */
    const attesaB = ['s' + VAG, 's' + POL].concat(Array(PASSI).fill('m' + POL))
                    .concat(['e' + VAG, 'e' + POL]).join(',');
    const attesaC = ['s' + POL].concat(Array(PASSI).fill('m' + POL))
                    .concat(['s' + VAG, 'e' + VAG, 'e' + POL]).join(',');

    /* pulizia fra una prova e l'altra: si alzano eventuali dita rimaste e
       si rimette la squadra in possesso col comandato attaccato */
    async function prepara() {
      /* se non c'e' nessun dito giu', Blink rifiuta il touchEnd: non e'
         un errore, e' la sequenza gia' pulita */
      try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) { }
      await pag.evaluate(() => { window.__prec.azzera(); window.__prec.azzeraRilasci();
                                 window.__prec.azzeraCont(); window.__prec.azzeraVive(); });
      return await pag.evaluate(() => window.__prec.arma(0));
    }

    /* PROVA B — P6. Il disturbo si appoggia e resta fermo; poi il pollice
       scende e trascina. Domanda: il pollice comanda? */
    for (const d of dita) {
      const armata = await prepara();
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.x, y: d.y, id: VAG }] });
      const dopoVag = await pag.evaluate(() => ({ lev: window.__prec.levetta(), cmd: window.__prec.comando(0) }));
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d.x, y: d.y, id: VAG }, { x: casa.x, y: casa.y, id: POL }] });
      for (let k = 1; k <= PASSI; k++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [
          { x: d.x, y: d.y, id: VAG }, { x: casa.x + DX * k, y: casa.y + DY * k, id: POL }] });
      }
      const fine = await pag.evaluate(() => ({ lev: window.__prec.levetta(), cmd: window.__prec.comando(0),
                                               vive: window.__prec.maxVive() }));
      const rPrima = await pag.evaluate(() => window.__prec.rilN());
      /* SI ALZA IL VAGANTE, e in Input.dispatchTouchEvent i touchPoints di
         un touchEnd sono i punti RILASCIATI: qui va il vagante, non il
         pollice. Sbagliarlo vuol dire misurare il contrario. */
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: d.x, y: d.y, id: VAG }] });
      const rVag = await pag.evaluate(() => window.__prec.rilN());
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const rFine = await pag.evaluate(() => window.__prec.rilN());
      const tr = await pag.evaluate(() => window.__prec.traccia());
      M.provaB.push({ x: d.x, y: d.y, armata, vive: fine.vive, traccia: tr,
                      attesa: attesaB,
                      cmdDopoVagante: dopoVag.cmd.l, levDopoVagante: dopoVag.lev[0],
                      cmd: fine.cmd.l, lev: fine.lev[0],
                      rilAlzataVagante: rVag.n - rPrima.n, azAlzataVagante: rVag.az - rPrima.az,
                      rilAlzataPollice: rFine.n - rVag.n, azAlzataPollice: rFine.az - rVag.az });
    }

    /* PROVA C — IL DITO VAGANTE. Il pollice comanda GIA'; poi arriva il
       vagante, e poi si alza. Ordine rovesciato rispetto a B: e' l'ordine
       in cui la toppa ritirata rubava la levetta e regalava il pallone. */
    for (const d of dita) {
      const armata = await prepara();
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: casa.x, y: casa.y, id: POL }] });
      for (let k = 1; k <= PASSI; k++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: casa.x + DX * k, y: casa.y + DY * k, id: POL }] });
      }
      const pr = await pag.evaluate(() => ({ lev: window.__prec.levetta(), cmd: window.__prec.comando(0) }));
      const rPrima = await pag.evaluate(() => ({ r: window.__prec.rilN(), c: window.__prec.contatori() }));
      const poll = { x: casa.x + DX * PASSI, y: casa.y + DY * PASSI, id: POL };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [poll, { x: d.x, y: d.y, id: VAG }] });
      const meta = await pag.evaluate(() => ({ lev: window.__prec.levetta(), cmd: window.__prec.comando(0),
                                               vive: window.__prec.maxVive() }));
      const rGiu = await pag.evaluate(() => ({ r: window.__prec.rilN(), c: window.__prec.contatori() }));
      /* SI ALZA IL VAGANTE: i touchPoints di un touchEnd sono i punti
         RILASCIATI. Qui va il vagante — se ci si mette il pollice si
         misura il suo passaggio legittimo e lo si chiama fantasma. */
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: d.x, y: d.y, id: VAG }] });
      const rSu = await pag.evaluate(() => ({ r: window.__prec.rilN(), c: window.__prec.contatori() }));
      const po = await pag.evaluate(() => ({ lev: window.__prec.levetta(), cmd: window.__prec.comando(0) }));
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const rFine = await pag.evaluate(() => ({ r: window.__prec.rilN(), c: window.__prec.contatori() }));
      const tr = await pag.evaluate(() => window.__prec.traccia());
      M.provaC.push({ x: d.x, y: d.y, armata, vive: meta.vive, traccia: tr, attesa: attesaC,
                      cmdPrima: pr.cmd.l, levPrima: pr.lev[0],
                      cmdConVagante: meta.cmd.l, levConVagante: meta.lev[0],
                      cmdDopo: po.cmd.l, levDopo: po.lev[0],
                      rilDiscesa: rGiu.r.n - rPrima.r.n, azDiscesa: rGiu.r.az - rPrima.r.az,
                      rilAlzataVagante: rSu.r.n - rGiu.r.n, azAlzataVagante: rSu.r.az - rGiu.r.az,
                      rilAlzataPollice: rFine.r.n - rSu.r.n, azAlzataPollice: rFine.r.az - rSu.r.az,
                      dettaglioAlzata: diff(rGiu.c, rSu.c) });
    }

    /* PROVA D — IL TOCCO SEMPLICE, e il costo della cura. */
    const D = {};
    {
      const armata = await prepara();
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: casa.x, y: casa.y, id: POL }] });
      const c0 = await pag.evaluate(() => window.__prec.contatori());
      /* CHE COSA SI VEDE DURANTE UN TOCCO FERMO. drawTouchSticks legge
         Touch5.stick[t].active: se col dito fermo la levetta non e'
         ancora di nessuno, per quei ~80 ms il disegno della levetta sotto
         il dito non compare. E' l'unica differenza visibile della toppa,
         e si misura la CAUSA (lo stato) invece di dedurla. */
      const levTocco = await pag.evaluate(() => window.__prec.levetta());
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const c1 = await pag.evaluate(() => window.__prec.contatori());
      D.toccoSolo = { armata, passaggi: (c1.doPass || 0) - (c0.doPass || 0), tutte: diff(c0, c1),
                      levetta: levTocco[0] };
    }
    /* DUE CONTATTI D'ERBA FERMI, nei DUE ordini di alzata. Serve a
       MISURARE il costo della cura invece di dedurlo, e a scoprire il
       passaggio che arriva in ritardo: se il vagante ottenesse il suo
       rilascio un momento dopo, quando resta solo lui sul vetro, la cura
       non sarebbe una cura. */
    for (const chiPrima of ['primoAppoggiato', 'secondoAppoggiato']) {
      const armata = await prepara();
      const alt = { x: Math.max(8, casa.x - 60), y: Math.max(8, casa.y - 40) };
      const P = { x: casa.x, y: casa.y, id: POL }, Q = { x: alt.x, y: alt.y, id: VAG };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [P] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [P, Q] });
      const c0 = await pag.evaluate(() => window.__prec.contatori());
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [chiPrima === 'primoAppoggiato' ? P : Q] });
      const c1 = await pag.evaluate(() => window.__prec.contatori());
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const c2 = await pag.evaluate(() => window.__prec.contatori());
      D['dueFermi_' + chiPrima] = { armata, siAlzaPrima: chiPrima,
        passaggiPrimaAlzata: (c1.doPass || 0) - (c0.doPass || 0),
        passaggiSecondaAlzata: (c2.doPass || 0) - (c1.doPass || 0),
        traccia: await pag.evaluate(() => window.__prec.traccia()) };
    }
    {
      /* il pollice COMANDA e poi si alza col pallone: il passaggio del
         giocatore vero, quello che non si deve perdere */
      const armata = await prepara();
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: casa.x, y: casa.y, id: POL }] });
      for (let k = 1; k <= PASSI; k++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: casa.x + DX * k, y: casa.y + DY * k, id: POL }] });
        await pag.waitForTimeout(24);
      }
      await pag.waitForTimeout(200);   // il rilascio lento non e' un flick
      const c0 = await pag.evaluate(() => window.__prec.contatori());
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const c1 = await pag.evaluate(() => window.__prec.contatori());
      D.trascinaEAlza = { armata, passaggi: (c1.doPass || 0) - (c0.doPass || 0), tutte: diff(c0, c1) };
    }
    M.provaD = D;
    M.maxViveBC = await pag.evaluate(() => window.__prec.maxVive());
    await pag.evaluate(() => window.__prec.scongela());
  }

  await browser.close(); srv.chiudi();
  return M;
}

const som = c => { let s = 0; for (const k in c) s += c[k]; return s; };
const diff = (a, b) => { const o = {}; for (const k in b) if ((b[k] || 0) !== (a[k] || 0)) o[k] = (b[k] || 0) - (a[k] || 0); return o; };

/* ORACOLO 3 — la classificazione COMPORTAMENTALE di un record di tocco */
function classifica(r) {
  if (r.presa) return 'presa' + r.r;
  if (r.hm > 1e-9) return 'levetta';
  return 'morto';
}


/* =====================================================================
   MODO DUE GIOCATORI (--due) — la meta' che nessuno aveva mai misurato.

   In due giocatori teamOf() divide lo schermo a meta' e touchBtnLayout
   specchia i pulsanti: per la squadra 0 stanno a SINISTRA. La cura
   ritirata usava proprio quel lato per decidere chi potesse prendere la
   levetta, quindi la sua regressione esisteva anche qui, specchiata, e
   nessun banco l'aveva mai posata. Questo modo posa due dita per ogni
   squadra e chiede le stesse tre cose: la levetta si lascia rubare? il
   comando si spegne? parte un gesto che nessuno ha chiesto?
   ===================================================================== */
async function misuraDue(fileGioco, etichetta) {
  const { chromium } = require('playwright');
  const srv = await servi(path.resolve(fileGioco));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VISTA, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'it-IT' });
  const pag = await ctx.newPage();
  const errori = [];
  pag.on('pageerror', e => errori.push('ECCEZIONE: ' + e.message));
  await pag.goto('http://127.0.0.1:' + srv.porta + '/PROVA.html', { waitUntil: 'load' });
  await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
  await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); });
  await pag.evaluate(() => window.__test.startMatch(2, 1, { size: 5 }));
  await pag.waitForTimeout(1400);
  const cdp = await ctx.newCDPSession(pag);
  const inst = await pag.evaluate(SONDA);
  if (inst !== 'installata') throw new Error('sonda non installata: ' + inst);
  const st0 = await pag.evaluate(() => window.__prec.stato());
  if (st0.mode !== 2) throw new Error('non sono in due giocatori: mode ' + st0.mode);
  await pag.evaluate(() => window.__prec.congela());
  await pag.waitForTimeout(150);
  const st1 = await pag.evaluate(() => window.__prec.stato());

  const PASSI = 6, POL = 7, VAG = 9;
  const esiti = [];
  for (const t of [0, 1]) {
    /* la casa del pollice sta nella META' della squadra, dalla parte
       OPPOSTA ai suoi pulsanti: la squadra 0 ha i pulsanti a sinistra,
       quindi il suo pollice sta verso il centro; la squadra 1 il
       contrario. */
    const casa = t === 0 ? { x: Math.round(st0.VW * 0.36), y: Math.round(st0.VH * 0.70) }
                         : { x: Math.round(st0.VW * 0.64), y: Math.round(st0.VH * 0.70) };
    const DX = t === 0 ? 9 : -9, DY = -5;
    const tutte = ditaCheDisturbano(st0.VW, st0.VH, casa);
    const so = await pag.evaluate(pts => window.__prec.sopra(pts), tutte);
    const dita = tutte.filter((p, i) => so[i] === 'gioco');
    const casaSopra = (await pag.evaluate(pts => window.__prec.sopra(pts), [casa]))[0];
    const prove = [];
    for (const d of dita) {
      try { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } catch (e) { }
      await pag.evaluate(() => { window.__prec.azzera(); window.__prec.azzeraRilasci(); window.__prec.azzeraCont(); });
      const armata = await pag.evaluate(tt => window.__prec.arma(tt), t);
      /* ORDINE «REGRESSIONE»: il pollice comanda gia', poi arriva il vagante */
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: casa.x, y: casa.y, id: POL }] });
      for (let k = 1; k <= PASSI; k++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: casa.x + DX * k, y: casa.y + DY * k, id: POL }] });
      }
      const pr = await pag.evaluate(tt => ({ lev: window.__prec.levetta(), cmd: window.__prec.comando(tt) }), t);
      /* I RILASCI SI CONTANO PER SQUADRA. In due giocatori un dito
         nell'altra meta' comanda l'altra squadra, e il suo rilascio e' un
         gesto legittimo di QUELL'altra squadra: contarlo come fantasma
         del pollice qui e' contare un gesto giusto come uno sbagliato. */
      const r0 = await pag.evaluate(tt => window.__prec.rilN(tt), t);
      const poll = { x: casa.x + DX * PASSI, y: casa.y + DY * PASSI, id: POL };
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [poll, { x: d.x, y: d.y, id: VAG }] });
      const me = await pag.evaluate(tt => ({ lev: window.__prec.levetta(), cmd: window.__prec.comando(tt), vive: window.__prec.maxVive() }), t);
      const r1 = await pag.evaluate(tt => window.__prec.rilN(tt), t);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: d.x, y: d.y, id: VAG }] });
      const r2 = await pag.evaluate(tt => window.__prec.rilN(tt), t);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const tr = await pag.evaluate(() => window.__prec.traccia());
      prove.push({ x: d.x, y: d.y, armata, vive: me.vive, traccia: tr,
                   cmdPrima: pr.cmd.l, cmdDopo: me.cmd.l,
                   levPrima: pr.lev[t], levDopo: me.lev[t],
                   rilDiscesa: r1.n - r0.n, rilAlzata: r2.n - r1.n, azAlzata: r2.az - r1.az });
    }
    esiti.push({ t, casa, casaSopra, chieste: tutte.length, prove });
  }
  await pag.evaluate(() => window.__prec.scongela());
  await browser.close(); srv.chiudi();
  return { etichetta, file: path.resolve(fileGioco), errori, st0, st1, esiti };
}

function stampaDue(D) {
  console.log('\n===== DUE GIOCATORI — ' + D.etichetta + ' =====');
  console.log('  file    ' + D.file);
  console.log('  vista   ' + D.st0.iw + 'x' + D.st0.ih + ' - mode ' + D.st0.mode + " - scena '" + D.st1.scena + "' - cpu[0]=" + D.st0.cpu0);
  let male = 0;
  for (const e of D.esiti) {
    const n = e.prove.length;
    const sx = e.prove.filter(p => p.x < e.casa.x).length;
    const senzaComando = e.prove.filter(p => !(p.cmdPrima > 1e-9)).length;
    const rubate = e.prove.filter(p => !p.levDopo || !p.levDopo.a || p.levDopo.id !== 7).length;
    const spente = e.prove.filter(p => p.cmdPrima > 1e-9 && !(p.cmdDopo > 1e-9)).length;
    const fantasmi = e.prove.filter(p => p.rilAlzata > 0).length;
    const palle = e.prove.filter(p => p.azAlzata > 0).length;
    const vive = Math.min.apply(null, e.prove.map(p => p.vive).concat([99]));
    const storte = e.prove.filter(p => !/^s7(,m7){6},s9,e9,e7$/.test(p.traccia)).length;
    console.log('  squadra ' + e.t + ': pollice a (' + e.casa.x + ',' + e.casa.y + ") su '" + e.casaSopra + "' - " +
      n + ' dita su ' + e.chieste + ' chieste, ' + sx + ' A SINISTRA del pollice - dita insieme min ' + vive + ' - tracce storte ' + storte);
    console.log('     pollice che non comandava gia\' prima: ' + senzaComando);
    console.log('     LEVETTA RUBATA ' + rubate + '/' + n + ' - COMANDO SPENTO ' + spente + '/' + n +
      ' - GESTI FANTASMA ' + fantasmi + ' (palla regalata ' + palle + ')');
    if (storte || vive < 2 || senzaComando) { male++; console.log('     NULLO per questa squadra: la prova non e\' arrivata come volevo'); }
    else if (rubate || spente || fantasmi) male++;
  }
  if (D.errori.length) { console.log('  ECCEZIONI: ' + D.errori.slice(0, 3).join(' | ')); male++; }
  console.log('  ' + (male ? 'NO' : 'OK') + '  due giocatori');
  return male;
}

/* =====================================================================
   MODO TELEFONO — dita vere sul dispositivo di ingresso del kernel.
   ===================================================================== */
async function misuraTelefono(fileGioco, etichetta) {
  const { execFileSync } = require('child_process');
  const { Vetro } = require('./_vetro.js');
  const PACCHETTO = 'it.dopolavoro.calcetto', ATTIVITA = 'it.dopolavoro.gioco.Gioco';
  const TARA = path.join(__dirname, 'pollici-taratura.json');

  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME ||
    path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  let adb = null;
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); adb = c; break; } catch (e) { }
  }
  if (!adb) throw new Error('adb non trovato');
  const lista = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 });
  const righe = lista.split('\n').slice(1).map(r => r.trim()).filter(Boolean);
  const disp = righe.filter(r => /\tdevice$/.test(r)).map(r => r.split('\t')[0]);
  if (!disp.length) throw new Error('nessun telefono AUTORIZZATO collegato. adb dice: ' + JSON.stringify(righe) +
    '\n  (unauthorized = manca il tocco umano su «consenti debug USB»: questo attrezzo non stima, quindi si ferma)');
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  const chiSono = sh('shell', 'su', '-c', 'id').trim();
  if (!/uid=0/.test(chiSono)) throw new Error('serve root per scrivere sul dispositivo di ingresso. Ho letto: ' + chiSono);
  if (!fs.existsSync(TARA)) throw new Error('manca la taratura ' + TARA + ': lanciare prima pollici.js --taratura');
  const tara = JSON.parse(fs.readFileSync(TARA, 'utf8'));

  if (path.resolve(fileGioco) !== path.resolve(RADICE, 'CALCETTO-il-gioco.html')) {
    console.log('  AVVERTENZA: sul telefono gira il gioco dentro l\'APK installato, non ' + fileGioco);
    console.log('  (per misurare una toppa sul telefono bisogna ricostruire e installare l\'APK)');
  }

  sh('shell', 'am', 'force-stop', PACCHETTO);
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(2500);
  const c = await (async () => {
    for (let i = 0; i < 20; i++) {
      const u = sh('shell', 'cat', '/proc/net/unix');
      const p = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
      if (p) {
        try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
        sh('forward', 'tcp:9222', 'localabstract:' + p);
        for (let k = 0; k < 20; k++) {
          try {
            const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
            const pg = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
            if (pg) return await apriFilo(pg.webSocketDebuggerUrl);
          } catch (e) { }
          await pausa(400);
        }
      }
      await pausa(500);
    }
    return null;
  })();
  if (!c) throw new Error('nessun filo con la WebView');
  for (let i = 0; i < 40; i++) { if (await c.js('!!window.__test')) break; await pausa(300); }
  await c.js(`window.__test.dismissSplash&&window.__test.dismissSplash(); window.__test.startMatch(1,1,{size:5}); 1`);
  await pausa(1500);
  const inst = await c.js(SONDA);
  if (inst !== 'installata') throw new Error('sonda non installata: ' + inst);

  const dischi = JSON.parse(await c.js('JSON.stringify(window.__prec.dischi())'));
  const s0 = JSON.parse(await c.js('JSON.stringify(window.__prec.stato())'));
  const identitaTel = JSON.parse(await c.js('JSON.stringify(window.__prec.identita())'));
  const G1 = costruisciGriglia(dischi, s0.VW, s0.VH);
  const casa = { x: Math.round(s0.VW * 0.20), y: Math.round(s0.VH * 0.70) };
  const inv = tara.indietro;
  const versoPannello = (cx, cy) => ({ px: inv.a * cx + inv.b * cy + inv.c, py: inv.d * cx + inv.e * cy + inv.f });
  const vetro = new Vetro(adb, dev);
  /* EPIPE NON DEVE UCCIDERE LA MISURA. Il tubo verso /dev/input muore se
     il `su` viene chiuso (schermo spento, processo ucciso): senza un
     ascoltatore, l'evento 'error' del socket abbatte tutto il processo e
     una corsa di mezz'ora si perde senza referto. Qui si conta e si va
     avanti — e il conto finisce nel referto, perche' un canale rotto e'
     un dato, non un dettaglio. */
  let epipe = 0;
  try { vetro.p.stdin.on('error', () => { epipe++; }); } catch (e) { }
  await pausa(400);

  const M = { etichetta, file: path.resolve(fileGioco), dischi, s0, casa, griglia: G1, errori: [],
              log: [], vivi: [], msGriglia: 0, provaB: [], provaC: [], provaD: null,
              cong: '', scong: '', sveglio: undefined, deltaImpronta: [], rilasciConEffetto: 0,
              maxViveA: 0, maxViveBC: 0, chiestiB: 0, chiestiC: 0, telefono: dev, identita: identitaTel,
              mancantiAzioni: JSON.parse(await c.js('JSON.stringify(window.__prec.mancantiAzioni)') || '[]') };

  await c.js('window.__prec.congela()');
  await pausa(150);
  await c.js('window.__prec.stacca(0)');
  const imp0 = JSON.parse(await c.js('JSON.stringify(window.__prec.impronta())'));
  await c.js('window.__prec.azzera(); window.__prec.azzeraRilasci(); window.__prec.azzeraVive(); 1');

  const t0 = Date.now();
  const GIU = +arg('giu', 22), SU = +arg('su', 22);
  /* --soloBCD salta la griglia anche sul telefono: a 88 ms per punto
     ventitremila punti sono mezz'ora di vetro, e chi vuole solo le due
     dita non deve pagarla. */
  for (const p of (SOLO_BCD ? [] : G1.punti)) {
    const q = versoPannello(p.x + SAB, p.y), q2 = versoPannello(p.x + SAB - 20, p.y);
    vetro.giu(0, q.px, q.py);
    await pausa(GIU);
    vetro.muovi(0, q2.px, q2.py);
    await pausa(GIU);
    const q3 = versoPannello(p.x + SAB - 34, p.y);
    vetro.muovi(0, q3.px, q3.py);
    await pausa(GIU);
    vetro.su(0);
    await pausa(SU);
  }
  await pausa(600);
  M.log = JSON.parse(await c.js('JSON.stringify(window.__prec.log)'));
  M.msGriglia = Date.now() - t0;
  M.maxViveA = await c.js('window.__prec.maxVive()');
  const ril = JSON.parse(await c.js('JSON.stringify(window.__prec.rilasci)'));
  M.rilasciConEffetto = ril.filter(r => r.az > 0 || !r.senzaComandato).length;
  M.rilasciTot = ril.length;
  const imp1 = JSON.parse(await c.js('JSON.stringify(window.__prec.impronta())'));
  for (const k of Object.keys(imp0)) if (imp0[k] !== imp1[k]) M.deltaImpronta.push(`${k}: ${imp0[k]} -> ${imp1[k]}`);
  await c.js('window.__prec.attacca(0)');
  M.scong = await c.js('window.__prec.scongela()');
  const sv0 = JSON.parse(await c.js('JSON.stringify(window.__prec.impronta())'));
  await pausa(700);
  const sv1 = JSON.parse(await c.js('JSON.stringify(window.__prec.impronta())'));
  M.sveglio = M.scong === 'scongelato' && Object.keys(sv0).some(k => sv0[k] !== sv1[k]);
  M.rotture = vetro.rotture; M.epipe = epipe;


  /* ===================================================================
     PROVE B e C SUL TELEFONO — DUE DITA VERE.
     Le stesse due domande del banco, ma le dita le scrive il kernel:
     due slot del protocollo B sul synaptics s3320, non due eventi
     sintetici di Blink. E' la prova che in questa casa non era mai
     esistita.
     =================================================================== */
  if (!SOLO_A) {
    const casaCss = { x: Math.round(s0.VW * 0.20), y: Math.round(s0.VH * 0.70) };
    const tutte = ditaCheDisturbano(s0.VW, s0.VH, casaCss);
    const so = JSON.parse(await c.js('JSON.stringify(window.__prec.sopra(' + JSON.stringify(tutte) + '))') || '[]');
    const dita = tutte.filter((q, i) => so[i] === 'gioco');
    M.ditaChieste = tutte.length; M.chiestiB = dita.length; M.chiestiC = dita.length;
    M.ditaScartate = (() => { const m = new Map();
      for (let i = 0; i < tutte.length; i++) if (so[i] !== 'gioco') m.set(so[i], (m.get(so[i]) || 0) + 1);
      return [...m].map(([k, v]) => k + ':' + v).join(' '); })();
    M.casaSopra = JSON.parse(await c.js('JSON.stringify(window.__prec.sopra(' + JSON.stringify([casaCss]) + '))'))[0];
    const PASSI = 6, DX = -8, DY = -4;   // 48 px CSS: oltre dead-zone (12) e corsa piena (46)
    const POL = 0, VAG = 1;              // due SLOT veri del pannello
    const P = (cx, cy) => versoPannello(cx, cy);
    const leggi = async () => JSON.parse(await c.js(
      'JSON.stringify({lev:window.__prec.levetta(),cmd:window.__prec.comando(0),ril:window.__prec.rilN(0),viv:window.__prec.maxVive()})'));

    /* LA PARTITA DEVE ESSERCI ANCHE QUI, e il gioco va congelato come al
       banco: senza, la scena diventa 'goal' a meta' corsa e le dita
       cadono su una partita che non gioca. */
    const scenaOk = st => st && (st.scena === 'play' || st.scena === 'golden' || st.scena === 'kickoff') && !st.fermo;
    const assicura = async () => {
      for (let i = 0; i < 10; i++) {
        const st = JSON.parse(await c.js('JSON.stringify(window.__prec.stato())'));
        if (scenaOk(st)) return st;
        await c.js('window.__prec.scongela(); 1');
        await c.js('window.__test.dismissSplash&&window.__test.dismissSplash(); window.__test.startMatch(1,1,{size:5}); 1');
        await pausa(1500);
      }
      return null;
    };
    await c.js('window.__prec.scongela(); 1');
    await pausa(300);
    const viva = await assicura();
    M.telScena = viva ? viva.scena : 'NESSUNA PARTITA';
    await c.js('window.__prec.congela(); 1');
    await pausa(200);
    M.statoBCD = JSON.parse(await c.js('JSON.stringify(window.__prec.stato())'));
    M.congBCD = 'congelato';
    /* L'IDENTIFICATIVO DEL POLLICE NON SI PRESUME: sul vetro lo assegna
       la WebView, non lo slot del pannello. Si posa un dito solo, lo si
       muove, e si LEGGE quale identificativo ha preso la levetta. */
    M.idPollice = await (async () => {
      for (let k = 0; k < 6; k++) {
        vetro.su(POL); vetro.su(VAG); await pausa(120);
        await c.js('window.__prec.azzera(); 1');
        const qc0 = P(casaCss.x, casaCss.y);
        vetro.giu(POL, qc0.px, qc0.py); await pausa(120);
        for (let j = 1; j <= PASSI; j++) { const q = P(casaCss.x + DX * j, casaCss.y + DY * j); vetro.muovi(POL, q.px, q.py); await pausa(30); }
        await pausa(150);
        const l = JSON.parse(await c.js('JSON.stringify(window.__prec.levetta())'));
        vetro.su(POL); await pausa(150);
        if (l[0] && l[0].a) return l[0].id;
      }
      return undefined;
    })();

    for (const modo of ['B', 'C']) {
      for (const d of dita) {
        let rec = null;
        for (let tent = 0; tent < 3 && !rec; tent++) {
          vetro.su(POL); vetro.su(VAG); await pausa(140);
          await c.js('window.__prec.azzera(); window.__prec.azzeraRilasci(); window.__prec.azzeraCont(); window.__prec.azzeraVive(); 1');
          const armata = await c.js('window.__prec.arma(0)');
          const qd = P(d.x, d.y), qc = P(casaCss.x, casaCss.y);
          if (modo === 'B') {
            vetro.giu(VAG, qd.px, qd.py); await pausa(120);
            vetro.giu(POL, qc.px, qc.py); await pausa(120);
          } else {
            vetro.giu(POL, qc.px, qc.py); await pausa(120);
          }
          for (let k = 1; k <= PASSI; k++) {
            const q2 = P(casaCss.x + DX * k, casaCss.y + DY * k);
            vetro.muovi(POL, q2.px, q2.py); await pausa(28);
          }
          await pausa(160);
          const pr = await leggi();
          if (modo === 'C') { vetro.giu(VAG, qd.px, qd.py); await pausa(160); }
          const me = await leggi();
          vetro.su(VAG); await pausa(160);
          const su = await leggi();
          vetro.su(POL); await pausa(140);
          const tr = await c.js('window.__prec.traccia()');
          /* LA TRACCIA ATTESA sul telefono si costruisce con gli
             identificativi VERI, e i touchmove non sono in numero fisso:
             il pannello ne consegna quanti ne consegna. Si chiede quindi
             la FORMA: due discese, almeno un movimento del pollice, due
             risalite nell'ordine giusto. */
          const ok = (modo === 'B')
            ? /^s\d+,s\d+(,m\d+)+,e\d+,e\d+$/.test(tr)
            : /^s\d+(,m\d+)+,s\d+,e\d+,e\d+$/.test(tr);
          if (!ok && tent < 2) continue;
          rec = { x: d.x, y: d.y, armata, vive: me.viv, traccia: tr, attesa: ok ? tr : 'FORMA SBAGLIATA',
                  cmdPrima: pr.cmd.l, levPrima: pr.lev[0],
                  cmdConVagante: me.cmd.l, levConVagante: me.lev[0],
                  cmdDopo: su.cmd.l, levDopo: su.lev[0],
                  rilDiscesa: me.ril.n - pr.ril.n, azDiscesa: me.ril.az - pr.ril.az,
                  rilAlzataVagante: su.ril.n - me.ril.n, azAlzataVagante: su.ril.az - me.ril.az,
                  rilAlzataPollice: 0, azAlzataPollice: 0, dettaglioAlzata: {} };
          if (!ok) rec = null;
        }
        if (!rec) continue;                       // saltata: la conta bSaltate/cSaltate
        if (modo === 'B') { rec.cmd = rec.cmdConVagante; rec.lev = rec.levConVagante; M.provaB.push(rec); }
        else M.provaC.push(rec);
      }
    }
    M.telDitaVive = await c.js('window.__prec.maxVive()');
    await c.js('window.__prec.scongela(); 1');
  }

  vetro.chiudi(); c.chiudi();
  return M;
}

function apriFilo(url) {
  return new Promise((ok, no) => {
    const ws = new WebSocket(url);
    let n = 0, morto = false; const attesa = new Map();
    const sc = setTimeout(() => no(new Error('la WebView non risponde')), 20000);
    ws.onclose = () => { morto = true; for (const [, r] of attesa) r({ morto: true }); attesa.clear(); };
    ws.onerror = () => { clearTimeout(sc); if (!morto) { morto = true; no(new Error('websocket rifiutato')); } };
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m); attesa.delete(m.id); } };
    ws.onopen = () => {
      clearTimeout(sc);
      ok({
        manda(metodo, params = {}, quanto = 60000) {
          if (morto) return Promise.resolve({ morto: true });
          const id = ++n; ws.send(JSON.stringify({ id, method: metodo, params }));
          return new Promise(res => { attesa.set(id, res); setTimeout(() => { if (attesa.has(id)) { attesa.delete(id); res({ scaduto: true }); } }, quanto); });
        },
        async js(expr, attendi) {
          const r = await this.manda('Runtime.evaluate', { expression: expr, awaitPromise: !!attendi, returnByValue: true });
          return r.result && r.result.result ? r.result.result.value : undefined;
        },
        chiudi() { try { ws.close(); } catch (e) { } },
      });
    };
  });
}

/* =====================================================================
   IL REFERTO
   ===================================================================== */
function analizza(m) {
  const d = m.dischi;
  const a = { nullo: [], perTipo: new Map(), esempi: [] };

  /* GUARDIA 0 — gli oracoli devono essere applicabili */
  a.ambigui = 0;
  for (const p of m.griglia.punti) if (specifica(d, p.x, p.y) === null) a.ambigui++;
  a.sepPrese = Math.hypot(d[0].x - d[1].x, d[0].y - d[1].y) - (d[0].r + 10) - (d[1].r + 10);

  /* GUARDIA 1 — ogni punto iniettato deve essere arrivato UNA volta sola,
     dove volevo io, con almeno un movimento */
  const perChiave = new Map();
  for (const r of m.log) perChiave.set(r.x + '|' + r.y, r);
  a.mancanti = 0; a.fuoriGuardia = 0; a.senzaMossa = 0;
  for (const p of m.griglia.punti) {
    const r = perChiave.get(p.x + '|' + p.y);
    if (!r) { a.mancanti++; continue; }
    if (r.c || r.p || !(r.s === 'play' || r.s === 'golden' || r.s === 'kickoff')) a.fuoriGuardia++;
    if (!r.presa && r.mosse === 0) a.senzaMossa++;
  }
  /* i doppioni: gli invii ripetuti VOLUTI (la seconda spedizione dei punti
     il cui movimento non era arrivato) non sono doppioni, sono riparazioni
     dichiarate. Tutto il resto lo e'. */
  a.doppioni = m.log.length - perChiave.size - (m.rifatti || 0);

  /* GUARDIA 2 — il congelamento e' stato vero, campo per campo */
  a.congelato = m.deltaImpronta.length === 0;
  /* GUARDIA 3 — nessun rilascio ha avuto effetto durante la griglia */
  a.rilasciConEffetto = m.rilasciConEffetto;
  /* GUARDIA 4 — un dito alla volta in prova A */
  a.maxViveA = m.maxViveA;

  /* IL CONTO — oracolo 1 contro oracolo 3 */
  a.misurati = 0; a.sbagliati = 0; a.sbMezzaluna = 0; a.inMezzaluna = 0;
  a.risposte = new Map();
  for (const p of m.griglia.punti) {
    const r = perChiave.get(p.x + '|' + p.y);
    if (!r) continue;
    a.misurati++;
    const att = specifica(d, p.x, p.y);
    const oss = classifica(r);
    a.risposte.set(p.x + '|' + p.y, oss);
    const ml = mezzaluna(d, p.x, p.y);
    if (ml) a.inMezzaluna++;
    if (att !== null && oss !== att) {
      a.sbagliati++;
      if (ml) a.sbMezzaluna++;
      const k = att + ' -> ' + oss;
      a.perTipo.set(k, (a.perTipo.get(k) || 0) + 1);
      if (a.esempi.length < 6) a.esempi.push({ x: p.x, y: p.y, atteso: att, osservato: oss, mezzaluna: ml });
    }
  }
  /* il titolo, detto senza gergo: quante prese dichiarate NON rispondono */
  a.preseMancate = 0;
  for (const p of m.griglia.punti) {
    const r = perChiave.get(p.x + '|' + p.y);
    if (!r) continue;
    for (const b of d) {
      if (Math.hypot(p.x - b.x, p.y - b.y) <= b.r + 10 && classifica(r) !== 'presa' + b.r) a.preseMancate++;
    }
  }

  /* GUARDIA 5 — il congelato dice quello che dice il gioco vivo? */
  a.viviLetti = 0; a.viviDiversi = 0; a.viviNonArrivati = 0;
  for (const v of m.vivi) {
    if (v.e === 'NONARRIVATO') { a.viviNonArrivati++; continue; }
    const r = perChiave.get(v.x + '|' + v.y);
    if (!r) continue;
    a.viviLetti++;
    if (classifica(r) !== v.e) a.viviDiversi++;
  }

  /* PROVA B — P6 */
  a.bTot = m.provaB.length;
  a.bNonArmate = m.provaB.filter(e => !e.armata).length;
  a.bMorti = m.provaB.filter(e => !(e.cmd > 1e-9)).length;              // il pollice trascina e il gioco non riceve comando
  /* DI CHI E' LA LEVETTA, senza presumere un identificativo. Sul banco
     l'identificativo del pollice lo scelgo io; sul telefono lo assegna la
     WebView e cambia a ogni tocco. L'unica cosa stabile e' l'ORIGINE: il
     pollice si appoggia sempre in casa, e la sua corsa (48-54 px) sta
     sotto il raggio d'inseguimento (70), quindi l'origine non si sposta.
     Una levetta con origine lontana da casa e' di un altro dito. */
  const altrui = l => l && l.a && (Math.abs(l.ox - m.casa.x) > 3 || Math.abs(l.oy - m.casa.y) > 3);
  a.bLevettaAltrui = m.provaB.filter(e => altrui(e.lev)).length;
  a.bGestiVagante = m.provaB.filter(e => e.rilAlzataVagante > 0).length;
  a.bPassaggiVagante = m.provaB.filter(e => e.azAlzataVagante > 0).length;
  a.bTracciaStorta = m.provaB.filter(e => e.traccia !== e.attesa).length;
  a.bEsempioTraccia = m.provaB.filter(e => e.traccia !== e.attesa).slice(0,4).map(e => `(${e.x},${e.y}) ${e.traccia}`).join(' | ');
  a.bSaltate = (m.chiestiB || 0) - a.bTot;
  a.bVive = Math.min(...m.provaB.map(e => e.vive).concat([99]));

  /* PROVA C — il dito vagante */
  a.cTot = m.provaC.length;
  a.cNonArmate = m.provaC.filter(e => !e.armata).length;
  a.cSenzaComandoIniziale = m.provaC.filter(e => !(e.cmdPrima > 1e-9)).length;
  /* RUBATA = la levetta che il pollice AVEVA in mano un istante prima non
     e' piu' la sua. Il confronto e' con se stessa (levPrima), non con un
     identificativo scritto a mano: vale identico al banco e sul vetro. */
  a.cRubate = m.provaC.filter(e => e.cmdPrima > 1e-9 && e.levPrima && e.levPrima.a &&
    (!e.levConVagante || !e.levConVagante.a || e.levConVagante.id !== e.levPrima.id ||
     e.levConVagante.ox !== e.levPrima.ox || e.levConVagante.oy !== e.levPrima.oy)).length;
  a.cComandoSpento = m.provaC.filter(e => e.cmdPrima > 1e-9 && !(e.cmdConVagante > 1e-9)).length;
  a.cComandoCambiato = m.provaC.filter(e => Math.abs(e.cmdConVagante - e.cmdPrima) > 1e-6).length;
  a.cGestiDiscesa = m.provaC.filter(e => e.rilDiscesa > 0).length;
  a.cGestiFantasma = m.provaC.filter(e => e.rilAlzataVagante > 0).length;
  a.cPalleRegalate = m.provaC.filter(e => e.azAlzataVagante > 0).length;
  a.cTracciaStorta = m.provaC.filter(e => e.traccia !== e.attesa).length;
  a.cEsempioTraccia = m.provaC.filter(e => e.traccia !== e.attesa).slice(0,4).map(e => `(${e.x},${e.y}) ${e.traccia}`).join(' | ');
  a.cSaltate = (m.chiestiC || 0) - a.cTot;
  a.cVive = Math.min(...m.provaC.map(e => e.vive).concat([99]));
  a.cEsempi = m.provaC.filter(e => e.rilAlzataVagante > 0 || (e.cmdPrima > 1e-9 && e.levPrima && e.levPrima.a &&
    (!e.levConVagante || !e.levConVagante.a || e.levConVagante.id !== e.levPrima.id))).slice(0, 5);

  /* PROVA D — il tocco semplice e il costo */
  a.D = m.provaD;
  return a;
}

function stampa(m, a) {
  console.log(`\n===== ${m.etichetta} =====`);
  console.log(`  file        ${m.file}`);
  console.log(`  vista       ${m.s0.iw}x${m.s0.ih} CSS · scena '${m.s0.scena}' · cpu[0]=${m.s0.cpu0} · mode ${m.s0.mode}`);
  if (m.identita) console.log(`  IL GIOCO MISURATO, letto dalla pagina: toppa-levetta ${m.identita.toppaLevetta === null ? 'ASSENTE' : 'presente (soglia ' + m.identita.toppaLevetta + ')'} · toppa-mezzaluna ${m.identita.toppaMezzaluna ? 'presente' : 'ASSENTE'} · rilascio ${m.identita.rilascioInerte ? 'inerte' : 'attivo'} · riadozione ${m.identita.haRiadozione ? 'si' : 'no'} · HTML ${m.identita.byteHTML} caratteri`);
  console.log(`  dischi      ` + m.dischi.map(b => `${b.act} (${b.x},${b.y}) r${b.r} presa ${b.r + 10} escl ${b.r + 18}`).join('  ·  '));
  const dd = Math.hypot(m.dischi[0].x - m.dischi[1].x, m.dischi[0].y - m.dischi[1].y);
  const rp = Math.min(...m.dischi.map(b => b.r)) + 10, rg = Math.max(...m.dischi.map(b => b.r)) + 18;
  const rp2 = Math.max(...m.dischi.map(b => b.r)) + 10, rg2 = Math.min(...m.dischi.map(b => b.r)) + 18;
  console.log(`  fra i centri ${dd.toFixed(4)} px · presa(picc)+escl(grande) = ${rp + rg} · i due cerchi di PRESA sono separati di ${a.sepPrese.toFixed(4)} px (specifica non ambigua: ${a.ambigui} punti ambigui)`);
  console.log(`  mezzaluna diretta   ${lente(rp, rg, dd).toFixed(4)} px^2 (spessore ${(rp + rg - dd).toFixed(4)})`);
  console.log(`  mezzaluna speculare ${lente(rp2, rg2, dd).toFixed(4)} px^2 (spessore ${(rp2 + rg2 - dd).toFixed(4)})`);
  if (m.mancantiAzioni && m.mancantiAzioni.length) console.log(`  AZIONI NON TROVATE nel gioco: ${JSON.stringify(m.mancantiAzioni)} — i contatori sono incompleti`);

  if (!SOLO_BCD) {
    console.log(`  griglia     ${m.griglia.punti.length} punti, passo ${PASSO} entro ${RAGGIO} px dai centri (passo ${PASSO_LARGO} fuori), riquadro ${m.griglia.box.x0}..${m.griglia.box.x1} x ${m.griglia.box.y0}..${m.griglia.box.y1}`);
    if (m.epipe) console.log(`  IL TUBO VERSO IL PANNELLO SI E' ROTTO ${m.epipe} volte (EPIPE): le dita di quei momenti non sono arrivate`);
    console.log(`  iniezione   ${(m.msGriglia / 1000).toFixed(1)} s  (${(m.msGriglia / Math.max(1, m.griglia.punti.length)).toFixed(2)} ms a punto)` + (m.rotture !== undefined ? `  ·  canale rotto ${m.rotture} volte` : ''));
    console.log(`  --- guardie di prova A ---`);
    console.log(`  la griglia e' partita in scena '${m.statoGriglia ? m.statoGriglia.scena : '?'}' (pausa ${m.statoGriglia ? m.statoGriglia.fermo : '?'}), congelamento: ${m.cong}`);
    console.log(`  punti rispediti perche' il movimento non era arrivato: ${m.rifatti === undefined ? '-' : m.rifatti}`);
    console.log(`  punti non arrivati ${a.mancanti} · doppioni ${a.doppioni} · fuori guardia ${a.fuoriGuardia} · senza movimento ${a.senzaMossa} · dita insieme (dev'essere 1) ${a.maxViveA}`);
    console.log(`  congelamento verificato su TUTTI i campi: ${a.congelato ? 'SI' : 'NO — ' + m.deltaImpronta.slice(0, 6).join(' | ')}`);
    console.log(`  rilasci durante la griglia: ${m.rilasciTot || 0}, di cui CON EFFETTO ${a.rilasciConEffetto} (dev'essere 0: il comandato e' staccato)`);
    if (m.sveglio !== undefined) console.log(`  risveglio verificato:    ${m.sveglio ? 'SI (lo stato riprende a cambiare)' : 'NO — il gioco e\' rimasto fermo: prova A bis NON VALE'}`);
    console.log(`  controllo a gioco VIVO: ${a.viviLetti} punti rifatti, ${a.viviDiversi} in disaccordo, ${a.viviNonArrivati} non arrivati`);
    console.log(`  --- PROVA A: la griglia delle superfici ---`);
    console.log(`  punti misurati            ${a.misurati}`);
    console.log(`  PRESE DICHIARATE CHE NON RISPONDONO  ${a.preseMancate}`);
    console.log(`  nella superficie sbagliata (oracolo 1 = la specifica)  ${a.sbagliati}   (${(100 * a.sbagliati / Math.max(1, a.misurati)).toFixed(3)}%)`);
    console.log(`  di cui nella mezzaluna     ${a.sbMezzaluna} su ${a.inMezzaluna} punti di mezzaluna`);
    if (a.perTipo.size) { console.log(`  scarti per tipo:`); for (const [k, v] of [...a.perTipo].sort((x, y) => y[1] - x[1])) console.log(`      ${k.padEnd(24)} ${v}`); }
    for (const e of a.esempi) console.log(`      es. (${e.x},${e.y}) atteso ${e.atteso}, osservato ${e.osservato}${e.mezzaluna ? '  [mezzaluna]' : ''}`);
  }

  if (a.bTot) {
    console.log(`  le prove B/C/D sono partite in scena '${m.statoBCD ? m.statoBCD.scena : '?'}', congelamento: ${m.congBCD}`);
    console.log(`  --- PROVA B: P6, il pollice che arriva secondo (dito fermo su TUTTO il vetro) ---`);
    console.log(`  punti d'appoggio del dito che disturba: ${a.bTot} su ${m.ditaChieste} chiesti (reticolo ${PASSO_BC} px su TUTTA la vista + corona a 7 raggi x 16 direzioni attorno al pollice ${m.casa.x},${m.casa.y}, che sta su '${m.casaSopra}')`);
    console.log(`  punti scartati perche' li' non c'e' il campo ma un elemento HTML: ${m.ditaScartate || 'nessuno'}`);
    const q = { sx:0, dx:0, su:0, giu:0 };
    for (const e of m.provaB) { if (e.x < m.casa.x) q.sx++; else q.dx++; if (e.y < m.casa.y) q.su++; else q.giu++; }
    console.log(`  DA DOVE ARRIVANO: ${q.sx} a sinistra del pollice, ${q.dx} a destra, ${q.su} sopra, ${q.giu} sotto`);
    console.log(`  dita vive insieme, minimo sulle prove: ${a.bVive}  (dev'essere 2)`);
    console.log(`  prove non armate (squadra non in possesso): ${a.bNonArmate}   ·   prove saltate: ${a.bSaltate}   ·   tracce diverse dall'attesa: ${a.bTracciaStorta}`);
    console.log(`  identificativo del pollice, LETTO dalla pagina: ${m.idPollice === undefined ? '(banco: 7)' : m.idPollice}`);
    console.log(`  IL POLLICE TRASCINA E IL GIOCO NON RICEVE COMANDO: ${a.bMorti} su ${a.bTot}`);
    console.log(`  levetta con origine LONTANA da casa (cioe' di un altro dito): ${a.bLevettaAltrui}`);
    console.log(`  RILASCI all'alzarsi del dito che disturba:         ${a.bGestiVagante}  (di cui che muovono la palla: ${a.bPassaggiVagante})`);
  }
  if (a.cTot) {
    console.log(`  --- PROVA C: il dito vagante mentre il pollice GIA' comanda (la regressione) ---`);
    const q2 = { sx:0, dx:0, su:0, giu:0 };
    for (const e of m.provaC) { if (e.x < m.casa.x) q2.sx++; else q2.dx++; if (e.y < m.casa.y) q2.su++; else q2.giu++; }
    console.log(`  punti d'appoggio del vagante: ${a.cTot}   ·   dita vive insieme, minimo: ${a.cVive}`);
    console.log(`  DA DOVE ARRIVANO: ${q2.sx} a SINISTRA del pollice, ${q2.dx} a destra, ${q2.su} sopra, ${q2.giu} sotto`);
    console.log(`     (l'edizione 1 di questo banco ne aveva ZERO a sinistra: e' li' che stava la regressione)`);
    console.log(`  prove non armate: ${a.cNonArmate}  ·  pollice che non comandava gia' prima: ${a.cSenzaComandoIniziale}  ·  saltate: ${a.cSaltate}  ·  tracce storte: ${a.cTracciaStorta}`);

    console.log(`  LEVETTA RUBATA dal vagante:                        ${a.cRubate} su ${a.cTot}`);
    console.log(`  COMANDO SPENTO dall'arrivo del vagante:            ${a.cComandoSpento}`);
    console.log(`  comando anche solo CAMBIATO dall'arrivo:           ${a.cComandoCambiato}`);
    console.log(`  rilasci alla DISCESA del vagante:                  ${a.cGestiDiscesa}`);
    console.log(`  GESTI FANTASMA all'ALZATA del vagante:             ${a.cGestiFantasma}  (di cui PALLA REGALATA: ${a.cPalleRegalate})`);
    for (const e of a.cEsempi) console.log(`      es. vagante (${e.x},${e.y}): levetta id ${e.levConVagante && e.levConVagante.id} ox ${e.levConVagante && e.levConVagante.ox}, comando ${e.cmdPrima} -> ${e.cmdConVagante}, gesti all'alzata ${JSON.stringify(e.dettaglioAlzata)}`);
  }
  if (a.D) {
    console.log(`  --- PROVA D: il tocco semplice, e il costo della cura ---`);
    console.log(`  un dito solo appoggia e alza col pallone -> passaggi: ${a.D.toccoSolo.passaggi}  ${JSON.stringify(a.D.toccoSolo.tutte)}`);
    console.log(`     durante il tocco FERMO la levetta e': ${JSON.stringify(a.D.toccoSolo.levetta)}`);
    console.log(`     (drawTouchSticks disegna la levetta sotto il dito solo se active e' vero: se e' falsa,`);
    console.log(`      per la durata di un tocco fermo quel disegno non compare. E' l'unica differenza VISIBILE.)`);
    console.log(`  un dito solo trascina e alza col pallone -> passaggi: ${a.D.trascinaEAlza.passaggi}  ${JSON.stringify(a.D.trascinaEAlza.tutte)}`);
    for (const k of ['dueFermi_primoAppoggiato', 'dueFermi_secondoAppoggiato']) {
      const v = a.D[k]; if (!v) continue;
      console.log(`  due contatti d'erba FERMI, si alza prima quello ${v.siAlzaPrima === 'primoAppoggiato' ? 'APPOGGIATO PER PRIMO ' : 'APPOGGIATO PER SECONDO'} -> passaggi ${v.passaggiPrimaAlzata} poi ${v.passaggiSecondaAlzata}   (traccia ${v.traccia})`);
    }
    console.log(`     (questi numeri vanno letti CONTRO il gioco di oggi, non contro un valore atteso:`);
    console.log(`      se Touch5.release e' inerte sono zero dappertutto, e allora il costo e' zero.)`);
  }
  if (m.errori.length) console.log(`  ECCEZIONI in pagina: ` + m.errori.slice(0, 3).join(' | '));
}

const M_scenaNo = st => !st || !(st.scena === 'play' || st.scena === 'golden' || st.scena === 'kickoff') || st.fermo;

/* le ragioni per cui un referto non e' un referto */
function ragioniNullo(m, a) {
  const r = [];
  if (m.errori.length) r.push(`${m.errori.length} eccezioni in pagina`);
  if (m.mancantiAzioni && m.mancantiAzioni.length) r.push(`azioni non strumentate: ${m.mancantiAzioni.join(',')}`);
  if (!SOLO_BCD) {
    if (a.ambigui) r.push(`${a.ambigui} punti su cui la specifica e' ambigua: non invento una precedenza`);
    if (M_scenaNo(m.statoGriglia)) r.push(`la griglia e' partita in scena '${m.statoGriglia && m.statoGriglia.scena}': non e' una partita`);
    if (m.cong && m.cong.indexOf('NON SONO') === 0) r.push(m.cong);
    if (m.epipe) r.push(`il tubo verso il pannello si e' rotto ${m.epipe} volte`);
    if (m.grigliaCoperta) r.push(`la griglia di prova A e' coperta da elementi HTML (${m.grigliaCoperta}): quei punti non sono superfici di Touch5`);
    if (a.mancanti) r.push(`${a.mancanti} punti non arrivati`);
    if (a.doppioni) r.push(`${a.doppioni} doppioni`);
    if (a.fuoriGuardia) r.push(`${a.fuoriGuardia} fuori guardia`);
    if (a.senzaMossa) r.push(`${a.senzaMossa} punti senza il movimento di prova: la classificazione non e' comportamentale`);
    if (a.maxViveA > 1) r.push(`in prova A c'erano ${a.maxViveA} dita insieme: doveva essercene una`);
    if (!a.congelato) r.push(`congelamento non verificato (${m.deltaImpronta.length} campi cambiati)`);
    if (a.rilasciConEffetto) r.push(`${a.rilasciConEffetto} rilasci hanno avuto effetto durante la griglia`);
    if (!m.sveglio) r.push(`il gioco non si e' risvegliato dopo il congelamento`);
    if (a.viviDiversi) r.push(`${a.viviDiversi} disaccordi col gioco vivo`);
    if (a.viviNonArrivati) r.push(`${a.viviNonArrivati} punti di controllo non arrivati a gioco vivo`);
    if (!a.inMezzaluna) r.push(`la griglia (passo ${PASSO}) non contiene NEMMENO UN punto di mezzaluna: non puo' vedere il difetto`);
  }
  if (!SOLO_A) {
    if (M_scenaNo(m.statoBCD)) r.push(`le prove B/C/D sono partite in scena '${m.statoBCD && m.statoBCD.scena}': non e' una partita`);
    if (m.congBCD && m.congBCD.indexOf('NON SONO') === 0) r.push(m.congBCD);
    if (m.casaSopra && m.casaSopra !== 'gioco') r.push(`il pollice cade su '${m.casaSopra}', non sul campo`);
    if (a.bSaltate) r.push(`${a.bSaltate} prove B saltate`);
    if (a.cSaltate) r.push(`${a.cSaltate} prove C saltate`);
    if (a.bNonArmate) r.push(`${a.bNonArmate} prove B senza possesso`);
    if (a.cNonArmate) r.push(`${a.cNonArmate} prove C senza possesso`);
    if (!ha('telefono') && a.bTracciaStorta) r.push(`${a.bTracciaStorta} prove B in cui a Touch5 non e' arrivato il gesto che credevo (es. ${a.bEsempioTraccia})`);
    if (!ha('telefono') && a.cTracciaStorta) r.push(`${a.cTracciaStorta} prove C in cui a Touch5 non e' arrivato il gesto che credevo (es. ${a.cEsempioTraccia})`);
    if (a.bVive < 2) r.push(`in prova B non ci sono mai state due dita insieme (${a.bVive}): la prova non prova niente`);
    if (a.cVive < 2) r.push(`in prova C non ci sono mai state due dita insieme (${a.cVive}): la prova non prova niente`);
    if (a.cSenzaComandoIniziale) r.push(`in ${a.cSenzaComandoIniziale} prove C il pollice non comandava nemmeno prima: non c'e' niente da rubare`);
    /* La prova D NON pretende piu' un numero fisso. Il gioco ha reso
       Touch5.release inerte (release(t,s){return false;}): il rilascio non
       produce piu' nessun gesto, quindi «il tocco semplice deve passare»
       non e' piu' vero e pretenderlo sarebbe un cancello che attesta una
       regola morta. Cio' che conta e' che la toppa non cambi cio' che il
       gioco fa OGGI, e quello si vede solo nel confronto con --contro. */
  }
  return r;
}

(async () => {
  const gioco = arg('gioco', path.join(RADICE, 'CALCETTO-il-gioco.html'));
  const contro = arg('contro', null);
  const modo = ha('telefono') ? misuraTelefono : misuraBanco;
  console.log('=== PRECEDENZA FRA LE SUPERFICI DI TOCCO — edizione 2 ===');
  console.log(ha('telefono')
    ? 'modo TELEFONO: dita vere scritte sul dispositivo di ingresso del kernel.'
    : 'modo BANCO: dita sintetiche di Blink (Input.dispatchTouchEvent). NON passano per la catena del kernel Android.');
  if (SAB) console.log(`--sabota ${SAB}: il dito si appoggia ${SAB} px piu' in la' di dove credo. DEVE uscire NULLO.`);

  if (ha('due')) {
    let male = 0;
    male += stampaDue(await misuraDue(gioco, path.basename(gioco)));
    if (contro) male += stampaDue(await misuraDue(contro, path.basename(contro)));
    process.exit(male ? 1 : 0);
  }

  const misure = [];
  misure.push(await modo(gioco, contro ? 'IN PROVA  ' + path.basename(gioco) : path.basename(gioco)));
  if (contro) misure.push(await modo(contro, 'CONTRO    ' + path.basename(contro)));

  const analisi = misure.map(analizza);
  misure.forEach((m, i) => stampa(m, analisi[i]));

  console.log('\n===== VERDETTO =====');
  let male = 0;
  const nulli = [];
  for (let i = 0; i < misure.length; i++) {
    const m = misure[i], a = analisi[i];
    const rag = ragioniNullo(m, a);
    nulli.push(rag.length > 0);
    if (rag.length) {
      male++;
      console.log(`  NULLO  ${m.etichetta}: ` + rag.join(', '));
      console.log('         Un referto con una guardia rossa non e\' un referto: non scrivo il numero.');
      continue;
    }
    const rotto = [];
    if (!SOLO_BCD && a.preseMancate) rotto.push(`${a.preseMancate} prese dichiarate non rispondono`);
    if (!SOLO_BCD && a.sbagliati) rotto.push(`${a.sbagliati} punti nella superficie sbagliata`);
    if (!SOLO_A && a.bMorti) rotto.push(`P6: il pollice non comanda in ${a.bMorti}/${a.bTot} prove`);
    if (!SOLO_A && a.cRubate) rotto.push(`REGRESSIONE: levetta rubata in ${a.cRubate}/${a.cTot} prove`);
    if (!SOLO_A && a.cComandoSpento) rotto.push(`REGRESSIONE: comando spento in ${a.cComandoSpento}/${a.cTot} prove`);
    if (!SOLO_A && a.cGestiFantasma) rotto.push(`REGRESSIONE: ${a.cGestiFantasma} gesti fantasma`);

    if (rotto.length) { male++; console.log(`  NO     ${m.etichetta}: ` + rotto.join(' · ')); }
    else console.log(`  OK     ${m.etichetta}: prese mancate 0, superfici sbagliate 0, P6 0/${a.bTot}, levetta rubata 0/${a.cTot}, gesti fantasma 0`);
  }

  /* ORACOLO 2 — il differenziale, che non ha nessuna regola dentro */
  if (misure.length === 2 && !nulli[0] && !nulli[1] && !SOLO_BCD) {
    const A0 = analisi[0].risposte, A1 = analisi[1].risposte;
    let cambiati = 0, cambiatiFuori = 0, mezzaluneNonCambiate = 0;
    const esempi = [];
    for (const [k, v] of A0) {
      if (!A1.has(k)) continue;
      const [x, y] = k.split('|').map(Number);
      const ml = mezzaluna(misure[0].dischi, x, y);
      if (A1.get(k) !== v) {
        cambiati++;
        if (!ml) { cambiatiFuori++; if (esempi.length < 5) esempi.push(`(${x},${y}) ${A1.get(k)} -> ${v}`); }
      } else if (ml && A1.get(k) !== 'presa' + Math.min(...misure[0].dischi.map(b => b.r))) {
        /* punto di mezzaluna che il file CONTRO gia' sbagliava e che non e' cambiato */
        if (A1.get(k) === 'morto') mezzaluneNonCambiate++;
      }
    }
    console.log(`\n  ORACOLO 2 — differenziale contro ${path.basename(misure[1].file)} (nessuna regola dentro: il riferimento e' il gioco):`);
    console.log(`    punti che hanno CAMBIATO risposta: ${cambiati}`);
    console.log(`    di cui FUORI dalla mezzaluna:      ${cambiatiFuori}` + (cambiatiFuori ? '   <- la toppa tocca cose che non doveva toccare' : '   (la toppa cambia esattamente la mezzaluna, niente altro)'));
    for (const e of esempi) console.log(`        ${e}`);
    console.log(`    punti di mezzaluna rimasti 'morto': ${mezzaluneNonCambiate}` + (mezzaluneNonCambiate ? '   <- il difetto non e\' sparito tutto' : ''));
    if (cambiatiFuori || mezzaluneNonCambiate) male++;
    console.log(`\n  DIFFERENZA: prese mancate ${analisi[1].preseMancate} -> ${analisi[0].preseMancate} · superfici sbagliate ${analisi[1].sbagliati} -> ${analisi[0].sbagliati}` +
      (analisi[0].bTot ? ` · P6 ${analisi[1].bMorti}/${analisi[1].bTot} -> ${analisi[0].bMorti}/${analisi[0].bTot}` : '') +
      (analisi[0].cTot ? ` · levetta rubata ${analisi[1].cRubate} -> ${analisi[0].cRubate} · gesti fantasma ${analisi[1].cGestiFantasma} -> ${analisi[0].cGestiFantasma}` : ''));
  }
  process.exit(male ? 1 : 0);
})().catch(e => { console.error('FALLITO: ' + e.message + '\n' + e.stack); process.exit(2); });
