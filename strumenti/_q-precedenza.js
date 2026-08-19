/* =====================================================================
   _q-precedenza.js — IL CANCELLO DELLE DUE DITA.

   IL PERCHE'. Un critico ha scritto, e aveva ragione: «in tutta la casa
   non esiste una prova a due dita». La proprieta' che _t-precedenza.js
   ripara — due pollici sullo stesso vetro, e comanda quello che si muove
   — viveva solo dentro un banco di lavoro (_z-precedenza.js), che non e'
   un cancello: nessuno se ne sarebbe accorto il giorno in cui qualcuno
   la rirompe. Questo file e' il cancello. Esce 1 se rompe.

   COSA PROVA, e da dove prende il codice. NIENTE E' RISCRITTO A MANO:
   Touch5, touchBtnLayout, humanMove, humanSprint e le costanti dello
   stick si estraggono BYTE PER BYTE dal file del gioco e si eseguono
   sopra stub minimi. Se il gioco cambia una soglia, questo cancello la
   vede; se qualcuno cambia il nome di una funzione, questo cancello si
   ferma invece di misurare un fantasma.

   ATTENZIONE, E VA LETTO PRIMA DI CHIAMARLO ROTTO: questo cancello e'
   ROSSO sul gioco senza la toppa _t-precedenza.js, e deve esserlo. Le
   proprieta' che sorveglia (C1, C2, C6, C7) sono esattamente quelle che
   la toppa introduce; C3/C4/C5/C8/C9 invece sono verdi anche sulla base,
   e servono a impedire che la cura peggiori cio' che gia' funzionava.
   Il valore di un cancello non e' che sia verde: e' che sappia diventare
   rosso. Questo lo sa, e lo dimostra ogni volta che lo si lancia sulla
   base.

   uso:
     node strumenti/_q-precedenza.js
     GIOCO_PROVA=fuori/dopo.html node strumenti/_q-precedenza.js
     node strumenti/_q-precedenza.js --da fuori/dopo.html
     node strumenti/_q-precedenza.js --misure     stampa anche le tabelle
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const GIOCO = path.resolve(arg('da', process.env.GIOCO_PROVA || path.join(RADICE, 'CALCETTO-il-gioco.html')));
const MISURE = process.argv.includes('--misure');

/* ------------------------------------------------------------------
   ESTRAZIONE BYTE PER BYTE. Ogni pezzo si cerca per delimitatori
   testuali e deve comparire UNA volta: se non c'e', questo file si
   ferma. Un banco che «ripiega» su una copia propria del codice misura
   la propria copia, non il gioco.
   ------------------------------------------------------------------ */
if (!fs.existsSync(GIOCO)) { console.error('FALLITO: gioco inesistente: ' + GIOCO); process.exit(2); }
const SRC = fs.readFileSync(GIOCO, 'utf8');
function pezzo(apre, chiude, nome) {
  const i = SRC.indexOf(apre);
  if (i < 0) { console.error(`FALLITO: non trovo «${nome}» dentro ${GIOCO}`); process.exit(2); }
  if (SRC.indexOf(apre, i + 1) >= 0) { console.error(`FALLITO: «${nome}» compare piu' di una volta`); process.exit(2); }
  const j = SRC.indexOf(chiude, i);
  if (j < 0) { console.error(`FALLITO: non trovo la fine di «${nome}»`); process.exit(2); }
  return SRC.slice(i, j + chiude.length);
}
const P_LAYOUT = pezzo('function touchBtnLayout(t){', '\n}\n', 'touchBtnLayout');
/* =====================================================================
   LE DIPENDENZE SI TIRANO DIETRO DA SOLE.

   Questo banco esegue pezzi VERI del gioco fuori dal gioco: e' la sua
   forza (misura il codice, non una copia) ed era la sua fragilita'.
   Ogni volta che una toppa dava a `touchBtnLayout` una funzione nuova da
   chiamare, il banco moriva con «X is not defined» e dichiarava ROSSI
   tutti e nove i cancelli — cioe' accusava il gioco di un guasto che era
   suo. E' successo due volte in un'ora, con due toppe diverse
   (`puoTirare` dall'etichetta per capacita', `dentroGliInserti` dagli
   inserti di sistema). Curare il caso singolo voleva dire aspettare la
   terza.

   Allora si cura la CLASSE: dai pezzi gia' estratti si leggono i nomi
   chiamati, e per ognuno che nel gioco sia una funzione di primo livello
   e non sia gia' fornito dall'ambiente simulato, si estrae anche quello.
   Ricorsivamente, con un tetto, perche' una ricorsione senza fondo qui
   vorrebbe dire tirarsi dietro mezzo gioco senza accorgersene.

   Cio' che NON fa, e va detto: non tira dentro le costanti globali. Se
   un giorno la funzione mancante ne usa una nuova, il banco tornera' a
   morire — ma con il nome della costante scritto, che e' il minimo per
   ripararlo in un minuto invece che in un'ora.
   ===================================================================== */
const salta = [];
function dipendenze(codice, gia, profondita) {
  /* UN SOLO LIVELLO, e la ragione e' misurata. Con la ricorsione libera
     il banco si e' tirato dietro tanto codice da dichiarare due volte
     `SAVE_KEY`: l'estrazione per delimitatori testuali («da `function
     X(` al primo `\n}\n`») non e' un analizzatore sintattico, e su una
     funzione che ne contiene un'altra prende un pezzo che non e' una
     funzione sola. A un livello il problema non si presenta, e copre il
     caso vero: le funzioni che `touchBtnLayout` chiama direttamente.
     Se un giorno servira' il secondo livello, il banco morira' col nome
     scritto — che e' un minuto di riparazione, non un'ora. */
  if (profondita > 1) return '';
  let fuori = '';
  const nomi = new Set();
  for (const m of codice.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) nomi.add(m[1]);
  /* SOLO LE FUNZIONI CHIAMATE, e non tutti gli identificatori.
     Ho provato ad allargare la rete a qualunque nome, per prendere anche
     i dati globali: prende anche le variabili LOCALI delle funzioni, le
     cerca come globali, ne trova di omonime e le inietta due volte
     («Identifier 'SY' has already been declared»). Una rete che pesca
     tutto pesca anche cio' che non esiste. I dati globali che servono si
     dichiarano qui sotto per nome. */
  for (const n of nomi) {
    if (gia.has(n)) continue;
    /* si prova prima come funzione, poi come dichiarazione di dato */
    let apre = 'function ' + n + '(', chiude = '\n}\n';
    let i = SRC.indexOf('\n' + apre);
    if (i < 0) {
      for (const par of ['let ' + n + ' ', 'let ' + n + '=', 'const ' + n + ' ', 'const ' + n + '=']) {
        const k = SRC.indexOf('\n' + par);
        if (k >= 0 && SRC.indexOf('\n' + par, k + 1) < 0) { apre = par; chiude = ';\n'; i = k; break; }
      }
    }
    if (i < 0) continue;                       // ne' funzione ne' dato di primo livello
    if (SRC.indexOf('\n' + apre, i + 1) >= 0) continue;   // ambigua: non si indovina
    gia.add(n);
    const corpo = pezzo('\n' + apre, chiude, n).slice(1);
    /* LA GUARDIA SULLA LUNGHEZZA, e non e' prudenza: e' la correzione di
       un guasto vero. `pezzo` delimita per testo, non per sintassi: su
       una funzione che ne contiene un'altra, o che chiude un blocco a
       inizio riga prima della propria fine, il taglio prende un pezzo
       che NON e' una funzione sola. Cosi' il banco si e' tirato dentro
       abbastanza codice da dichiarare due volte `SAVE_KEY` e morire.
       Una funzione di servizio dell'ingresso sta in poche righe: sopra
       i duemila caratteri il taglio e' quasi certamente sbagliato, e si
       preferisce non iniettarlo — il banco morira' col nome scritto,
       che si ripara in un minuto. */
    if (corpo.length > 2000) { salta.push(n + ' (' + corpo.length + ' caratteri: taglio sospetto)'); continue; }
    fuori += '\n' + corpo + dipendenze(corpo, gia, profondita + 1);
  }
  return fuori;
}

/* LE TRE DOMANDE CHE I DISCHI SI FANNO, e perche' stanno qui adesso.
   Da quando l'etichetta dei dischi risponde a «cosa otterrebbe il dito»
   invece che «di chi e' il pallone», `touchBtnLayout` chiama tre
   funzioni che prima non esistevano. Chi estrae un pezzo di programma e
   lo esegue fuori dal programma eredita anche le sue dipendenze: senza
   queste tre righe il banco moriva con «puoTirare is not defined» e
   dichiarava rossi tutti e nove i cancelli — cioe' accusava il gioco di
   un guasto che era suo.
   Restano estratte BYTE PER BYTE come tutto il resto: se domani una di
   loro cambia forma, questo file si ferma invece di misurare una copia
   vecchia. */
const P_PUOI = pezzo('function puoTirare(t){', '\n}\n', 'puoTirare')
  + '\n' + pezzo('function puoPassare(t){', '\n}\n', 'puoPassare')
  + '\n' + pezzo('function puoContrastare(p){', '\n}\n', 'puoContrastare');

/* I DATI GLOBALI CHE L'INGRESSO USA, dichiarati per nome e OPZIONALI.
   Opzionali perche' questo cancello deve poter girare sia sul gioco con
   la toppa degli inserti di sistema sia su quello senza: `_insMis` (la
   memoria degli inserti) esiste solo dopo `_t-l03.js`. Se manca non e'
   un guasto, e' un gioco piu' vecchio — e il banco lo dice invece di
   morire. */
function forse(apre, chiude) {
  const i = SRC.indexOf('\n' + apre);
  if (i < 0) return '';
  if (SRC.indexOf('\n' + apre, i + 1) >= 0) return '';
  const j = SRC.indexOf(chiude, i);
  return j < 0 ? '' : SRC.slice(i + 1, j + chiude.length);
}
/* le quattro memorie degli inserti stanno tutte su una riga sola, e
   quella riga si prende intera: cercarne una per nome non la trova */
const P_DATI = forse('const INS_LAT_MIN', ';', ) + '\n'
             + forse('const INS_BAS_MIN', ';') + '\n'
             + forse('let _insSonda', ';\n');
const P_COST = pezzo('const STICK_DEAD=', '\n', 'STICK_DEAD/STICK_FULL');
const P_MOVE = pezzo('function humanMove(t){', '\n}\n', 'humanMove');
const P_SPR1 = pezzo('const STICK_SPRINT =', '\n', 'STICK_SPRINT');
const P_SPR2 = pezzo('function humanSprint(t){', '\n}\n', 'humanSprint');
const P_TOUCH = (() => {
  const i = SRC.indexOf('const Touch5 = {');
  if (i < 0) { console.error('FALLITO: non trovo Touch5'); process.exit(2); }
  const r = SRC.indexOf('release(t,s){', i);
  const j = SRC.indexOf('\n};\n', r < 0 ? i : r);
  if (j < 0) { console.error('FALLITO: non trovo la fine di Touch5'); process.exit(2); }
  return SRC.slice(i, j + 3);
})();

/* ------------------------------------------------------------------
   IL VETRO FINTO: stub minimi, e un contatore per ogni cosa che il
   gioco potrebbe FARE. Cosi' «nessun gesto» e' un numero letto, non una
   supposizione.
   ------------------------------------------------------------------ */
function ambiente(vista) {
  const amb = {
    VW: vista[0], VH: vista[1], ora: 0,
    G: { paused: false, mode: 1, cpu: [false, true], scene: 'play' },
    atti: [], rilasci: 0, possesso: true,
  };
  const pre = `
    const VW=amb.VW, VH=amb.VH;
    const G=amb.G;
    const innerWidth=amb.VW;
    /* l'altezza serve da quando i dischi escono dagli inserti di
       sistema: insertiSicuri la legge per capire quanto e' alta la
       finestra rispetto alla tela */
    const innerHeight=amb.VH;
    /* GLI INSERTI SONO ZERO SUL BANCO, E VA DETTO FORTE.
       Chromium non ha ne' tacca ne' barra dei gesti, quindi
       env(safe-area-inset-*) vale 0 su tutti e quattro i lati. Cio'
       che questo banco misura e' percio' la geometria SENZA inserti; il
       comportamento CON la tacca e' stato misurato sul telefono vero
       (dita sul kernel, 20 prove per braccio) e non qui. Un banco che
       tacesse questa differenza direbbe di aver provato una cosa che non
       ha provato. */
    const getComputedStyle=()=>({getPropertyValue:()=>'0px'});
    const document={documentElement:{style:{setProperty(){}}}};
    const performance={now:()=>amb.ora};
    const len=(a,b)=>Math.hypot(a,b);
    const possessoTeam=t=>amb.possesso;
    const Keys={};
    const KMAP=[{lf:'a',rt:'d',up:'w',dn:'s',shot:'x',sprint:'q'},
                {lf:'j',rt:'l',up:'i',dn:'k',shot:'n',sprint:'u'}];
    const startCharge=t=>amb.atti.push('carica'+t);
    const doSlide=t=>amb.atti.push('contrasta'+t);
    const doFiltrante=(t,s)=>amb.atti.push('filtrante'+t);
    const cambiaGiocatore=t=>amb.atti.push('cambio'+t);
    const releaseCharge=t=>amb.atti.push('tiro'+t);
    const ctrlPlayer=t=>null;
    const chiudiAnticipo=p=>{};
  `;
  const post = `
    /* si conta OGNI chiamata a release, anche se oggi e' inerte: la
       proprieta' «due dita d'erba insieme, nessun rilascio» e' del
       chiamante, e va misurata sul chiamante. */
    const __rel = Touch5.release.bind(Touch5);
    Touch5.release = function(t,s){ amb.rilasci++; return __rel(t,s); };
    return { Touch5, humanMove, humanSprint, touchBtnLayout, STICK_DEAD, STICK_FULL, STICK_SPRINT };
  `;
  /* cio' che l'ambiente qui sopra gia' fornisce non va estratto dal
     gioco: sono i finti che rendono misurabile l'ingresso da solo */
  const FORNITI = new Set(['len','possessoTeam','startCharge','doSlide','doFiltrante',
    'cambiaGiocatore','releaseCharge','ctrlPlayer','chiudiAnticipo','now','push','Math',
    'hypot','max','min','abs','round','floor','ceil','sqrt','atan2','sin','cos','clamp',
    'Number','String','Object','Array','JSON','function','if','for','while','return','switch',
    'catch','typeof','bind','call','apply','indexOf','slice','map','filter','find','keys']);
  const NUCLEO = P_COST + '\n' + P_PUOI + '\n' + P_LAYOUT + '\n' + P_MOVE + '\n' +
    P_SPR1 + '\n' + P_SPR2 + '\n' + P_TOUCH;
  const P_DIP = dipendenze(NUCLEO, new Set([...FORNITI, 'touchBtnLayout','humanMove','humanSprint',
    'puoTirare','puoPassare','puoContrastare']), 0);
  const f = new Function('amb', pre + '\n' + P_DATI + '\n' + P_DIP + '\n' + NUCLEO + '\n' + post);
  const r = f(amb);
  r.amb = amb;
  r.pulisci = () => {
    r.Touch5.stick[0] = { active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0, hist: [] };
    r.Touch5.stick[1] = { active: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0, hist: [] };
    r.Touch5.btnTouch = {};
    if (r.Touch5.pend) r.Touch5.pend = {};
    amb.atti.length = 0; amb.rilasci = 0;
  };
  return r;
}
const VISTA = [915, 412];           // la stessa del collaudo
const nuovo = () => ambiente(VISTA);
const pend = T => T.pend ? Object.keys(T.pend) : [];

/* ------------------------------------------------------------------ */
const esiti = [];
function cancello(nome, fn) {
  let ok = false, det = '';
  try { const r = fn(); ok = r.ok; det = r.det; }
  catch (e) { ok = false; det = 'ECCEZIONE ' + e.message; }
  esiti.push({ nome, ok });
  console.log((ok ? '  OK   ' : '  NO   ') + nome + (det ? '\n         ' + det : ''));
}
function misura(nome, testo) { if (MISURE) console.log('  ..   ' + nome + '\n         ' + testo); }

/* i punti d'appoggio: reticolo pieno della vista + corona attorno al
   pollice. Non solo dalla parte comoda — e' la lezione che il critico ha
   fatto pagare all'edizione 1 del banco. */
function appoggi(x0, x1) {
  const p = [];
  for (let x = x0 + 20; x <= x1 - 20; x += 40) for (let y = 40; y <= 400; y += 40) p.push([x, y]);
  const cx = (x0 + x1) / 2, cy = 330;
  for (let a = 0; a < 7; a++) for (const r of [30, 60, 100])
    p.push([Math.round(cx + Math.cos(a * 2 * Math.PI / 7) * r), Math.round(cy + Math.sin(a * 2 * Math.PI / 7) * r)]);
  return p;
}

/* =====================================================================
   C1 — P6, UN GIOCATORE, DUE DITA.
   Il vagante si appoggia PRIMA, il pollice arriva dopo e trascina.
   Il comando del pollice deve esistere. Prima della toppa non esiste.
   ===================================================================== */
cancello('C1 · un giocatore, due dita: il pollice che trascina comanda anche se un altro dito si e\' appoggiato prima', () => {
  const v = nuovo(); let tot = 0, spenti = 0; const primi = [];
  for (const [vx, vy] of appoggi(0, VISTA[0])) {
    v.pulisci(); v.amb.ora = 1000;
    v.Touch5.start(1, vx, vy);
    if (v.Touch5.btnTouch[1]) continue;          // e' finito su un pulsante: non e' il caso
    v.amb.ora = 1010; v.Touch5.start(2, 183, 330);
    v.amb.ora = 1020; v.Touch5.move(2, 213, 330);
    v.amb.ora = 1030; v.Touch5.move(2, 243, 330);
    tot++;
    const m = v.humanMove(0);
    if (!m[0] && !m[1]) { spenti++; if (primi.length < 4) primi.push(vx + ',' + vy); }
  }
  return { ok: tot > 100 && spenti === 0, det: `comando spento in ${spenti} prove su ${tot}` + (primi.length ? '  es. ' + primi.join(' · ') : '') };
});

/* =====================================================================
   C2 — P6 A DUE GIOCATORI, in tutte e due le meta'.
   ===================================================================== */
cancello('C2 · due giocatori: la stessa cosa in tutte e due le meta\', e nessuna delle due disturba l\'altra', () => {
  const v = nuovo(); v.amb.G.mode = 2; v.amb.G.cpu = [false, false];
  /* IL POLLICE VA SULL'ERBA, E LO SI VERIFICA. A due giocatori la
     pulsantiera della squadra 0 e' SPECCHIATA a sinistra (64 e 158 px dal
     bordo), quindi il punto che va bene a un giocatore — 183,330 — a due
     giocatori sta SOPRA il pulsante PASSAGGIO della squadra 0. Ci sono
     cascato scrivendo questo cancello, e per una corsa intera ho letto
     «118 su 118 spento» credendo fosse un difetto del gioco: era il mio
     pollice appoggiato su un bottone. Adesso la posa si controlla. */
  const meta = [[0, 457, 200, 120], [458, 915, 700, 120]];
  const conta = []; let male = 0;
  for (const [x0, x1, px, py] of meta) {
    let tot = 0, spenti = 0, disturbo = 0;
    { v.pulisci(); v.Touch5.start(99, px, py);
      if (v.Touch5.btnTouch[99]) { conta.push(`POLLICE SU UN PULSANTE a ${px},${py}: prova non valida`); male++; continue; } }
    for (const [vx, vy] of appoggi(x0, x1)) {
      v.pulisci(); v.amb.ora = 1000;
      v.Touch5.start(1, vx, vy);
      if (v.Touch5.btnTouch[1]) continue;
      v.amb.ora = 1010; v.Touch5.start(2, px, py);
      v.amb.ora = 1020; v.Touch5.move(2, px + 30, py);
      v.amb.ora = 1030; v.Touch5.move(2, px + 60, py);
      tot++;
      const t = x0 === 0 ? 0 : 1, altro = 1 - t;
      const m = v.humanMove(t), a = v.humanMove(altro);
      if (!m[0] && !m[1]) spenti++;
      if (a[0] || a[1]) disturbo++;
    }
    conta.push(`meta' ${x0 === 0 ? 'sinistra' : 'destra'}: spento ${spenti}/${tot}, altra squadra mossa ${disturbo}/${tot}`);
    if (spenti || disturbo || tot < 50) male++;
  }
  return { ok: male === 0, det: conta.join('  ·  ') };
});

/* =====================================================================
   C3 — LA PAUSA. Alla ripresa, senza toccare piu' niente, il giocatore
   NON deve muoversi. Per due dita diverse: una che comandava e una che
   non aveva mai comandato.
   ===================================================================== */
function pausaDeriva(v, comandava, D) {
  v.pulisci(); v.amb.G.paused = false; v.amb.ora = 100;
  v.Touch5.start(1, 400, 200);
  if (comandava) { v.amb.ora = 110; v.Touch5.move(1, 440, 200); }
  v.amb.G.paused = true; v.Touch5.azzera();
  v.amb.ora = 150; v.Touch5.move(1, 400 + (comandava ? 40 : 0), 200 + D);
  v.amb.G.paused = false;
  return { m: v.humanMove(0), sp: v.humanSprint(0) };
}
cancello('C3 · pausa: alla ripresa, senza toccare piu\' niente, il giocatore sta fermo', () => {
  const v = nuovo(); const rotte = [];
  for (const comandava of [false, true])
    for (let D = 0; D <= 90; D++) {
      const r = pausaDeriva(v, comandava, D);
      const l = Math.hypot(r.m[0], r.m[1]);
      if (l > 0 || r.sp) rotte.push(`${comandava ? 'pollice' : 'candidato'} deriva ${D}px -> ${l.toFixed(2)}${r.sp ? ' + SCATTO' : ''}`);
    }
  return { ok: rotte.length === 0, det: rotte.length ? rotte.slice(0, 6).join(' · ') + (rotte.length > 6 ? ` … (${rotte.length} in tutto)` : '') : '182 combinazioni (2 dita x 91 derive) tutte a 0,00' };
});

/* =====================================================================
   C4 — E PERO' IL DITO DEVE TORNARE A COMANDARE. La cura della pausa
   non deve uccidere la riadozione: al PRIMO movimento dopo la ripresa il
   dito appoggiato ricomincia a comandare.
   ===================================================================== */
cancello('C4 · ripresa: al primo movimento il dito appoggiato torna a comandare (la riadozione regge)', () => {
  const v = nuovo(); const male = [];
  for (const comandava of [false, true]) {
    v.pulisci(); v.amb.G.paused = false; v.amb.ora = 100;
    v.Touch5.start(1, 400, 200);
    if (comandava) { v.amb.ora = 110; v.Touch5.move(1, 440, 200); }
    v.amb.G.paused = true; v.Touch5.azzera(); v.amb.G.paused = false;
    v.amb.ora = 200; v.Touch5.move(1, (comandava ? 440 : 400) + 40, 200);
    const m = v.humanMove(0);
    if (!Math.hypot(m[0], m[1])) male.push(comandava ? 'pollice che comandava' : 'dito che non aveva mai comandato');
  }
  return { ok: male.length === 0, det: male.length ? 'muto: ' + male.join(', ') : 'tutti e due tornano a comandare' };
});

/* =====================================================================
   C5 — ZERO DITA, STATO NEUTRO. E' il contratto scritto dentro azzera().
   Dopo un azzeramento non deve restare NIENTE dello stato del tocco:
   nessuna levetta viva, nessun pulsante premuto, nessun candidato.
   ===================================================================== */
cancello('C5 · azzera() lascia lo stato neutro davvero: nessuna levetta, nessun pulsante, nessun candidato', () => {
  const v = nuovo(); const resti = [];
  /* DUE SCENE, e la prima e' quella che conta. Se il pollice ha gia'
     comandato, i candidati sono stati cancellati dalla promozione e
     `pend` risulta vuoto per un motivo che non e' azzera(): un controllo
     scritto solo cosi' sarebbe verde senza provare niente. Ci sono
     cascato, e la scena A e' la correzione: DUE dita d'erba FERME, che
     restano candidate perche' nessuna ha ancora comandato. */
  const scene = [
    ['A · due candidati fermi', () => { v.Touch5.start(1, 200, 150); v.Touch5.start(2, 350, 150); }],
    ['B · un pollice che comanda', () => { v.Touch5.start(1, 300, 200); v.amb.ora = 110; v.Touch5.move(1, 340, 200); }],
  ];
  for (const [nome, posa] of scene) {
    v.pulisci(); v.amb.G.paused = false; v.amb.ora = 100;
    posa();
    v.Touch5.start(3, VISTA[0] - 64, VISTA[1] - 60);   // e un dito sul pulsante grande
    v.amb.G.paused = true; v.Touch5.azzera();
    const r = [];
    if (v.Touch5.stick[0].active || v.Touch5.stick[1].active) r.push('levetta viva');
    if (Object.keys(v.Touch5.btnTouch).length) r.push('btnTouch=' + JSON.stringify(Object.keys(v.Touch5.btnTouch)));
    if (pend(v.Touch5).length) r.push('pend=' + JSON.stringify(pend(v.Touch5)));
    if (r.length) resti.push(nome + ': resta ' + r.join(', '));
  }
  return { ok: resti.length === 0, det: resti.length ? resti.join(' · ') : 'due scene: stick spente, btnTouch vuoto, pend vuoto' };
});

/* =====================================================================
   C6 — LA MEZZALUNA. I punti in cui una presa legittima del disco
   piccolo cadeva nell'anello di esclusione del grande devono dare la
   presa. Il reticolo e la definizione sono ricalcolati qui, non copiati
   dalla toppa: il conteggio e' il quarto oracolo, non il primo.
   ===================================================================== */
cancello('C6 · mezzaluna: una presa legittima del disco piccolo non muore nell\'anello del grande', () => {
  const v = nuovo(); v.pulisci();
  const bts = v.touchBtnLayout(0);
  const g = bts.find(b => b.r === 40), p = bts.find(b => b.r === 30);
  let dentro = 0; const esiti = {};
  let id = 1000;
  for (let x = Math.floor(p.x - p.r - 12); x <= VISTA[0] - 1; x++)
    for (let y = Math.floor(p.y - p.r - 12); y <= VISTA[1] - 1; y++) {
      const dg = Math.hypot(x - g.x, y - g.y), dp = Math.hypot(x - p.x, y - p.y);
      if (!(dp <= p.r + 10 && dg <= g.r + 18 && dg > g.r + 10)) continue;
      dentro++;
      v.pulisci(); const i = ++id;
      v.Touch5.start(i, x, y);
      const e = v.Touch5.btnTouch[i] ? 'presa:' + v.Touch5.btnTouch[i].act
        : (v.Touch5.stick[0].active || (v.Touch5.pend && v.Touch5.pend[i])) ? 'levetta' : 'morto';
      esiti[e] = (esiti[e] || 0) + 1;
    }
  /* IL VERBO NON SI SCRIVE QUI, SI CHIEDE AL DISCO.
     Fino a ieri questa riga pretendeva «presa:through», cioe' il nome
     che il disco piccolo aveva quando il cancello e' stato scritto. Da
     quando l'etichetta risponde a «cosa otterrebbe il dito» invece che
     «di chi e' il pallone», nella scena isolata di questo banco il
     disco piccolo offre CAMBIO e non PASSAGGIO — e il cancello usciva
     rosso su 47 punti su 47 che erano tutti PRESI correttamente.
     La proprieta' che C6 difende non ha mai riguardato il verbo: e' che
     una presa legittima del disco piccolo NON MUOIA nell'anello di
     esclusione del grande. Quindi si chiede al disco come si chiama in
     questo istante (`p.act`) e si verifica che sia lui ad aver preso.
     Cosi' il cancello sopravvive al prossimo verbo nuovo, e continua a
     fallire per il motivo per cui esiste. */
  const ok = dentro > 0 && esiti['presa:' + p.act] === dentro;
  return { ok, det: `${dentro} punti nella mezzaluna, il disco piccolo offre «${p.act}» -> ${JSON.stringify(esiti)}` };
});

/* =====================================================================
   C7 — NESSUN RILASCIO DA DUE DITA D'ERBA. Non conta quello che release
   FA (oggi non fa niente): conta che non venga chiamata. E' la proprieta'
   del chiamante, ed e' quella che reggera' il giorno in cui il rilascio
   tornasse a produrre un gesto.
   ===================================================================== */
cancello('C7 · due dita d\'erba della stessa squadra: alzandole non parte nessun rilascio', () => {
  const v = nuovo(); v.pulisci(); v.amb.ora = 100;
  v.Touch5.start(1, 200, 150); v.Touch5.start(2, 350, 150);   // due contatti d'erba fermi
  v.amb.ora = 200; v.Touch5.end(1);
  const dopoPrimo = v.amb.rilasci;
  v.amb.ora = 210; v.Touch5.end(2);
  const dopoSecondo = v.amb.rilasci;
  return { ok: dopoSecondo === 0, det: `chiamate a release: ${dopoPrimo} alla prima alzata, ${dopoSecondo} in tutto` };
});

/* =====================================================================
   C8 — IL DITO SOLO NON CAMBIA. L'origine della levetta e' quella del
   TOUCHSTART: il dx che il gioco legge deve essere x - x0 (fino al
   guinzaglio di 70 px). Se la promozione ritardata spostasse l'origine
   sotto il dito, questo controllo se ne accorgerebbe.
   ===================================================================== */
cancello('C8 · un dito solo: l\'origine resta quella del touchstart, il comando e\' identico px per px', () => {
  const v = nuovo(); const male = [];
  for (const [dx0, dy0] of [[1, 0], [0, 1], [-1, 0], [0, -1], [0.7, 0.7], [-0.6, 0.8]]) {
    v.pulisci(); v.amb.ora = 100;
    const x0 = 400, y0 = 200;
    v.Touch5.start(9, x0, y0);
    for (let d = 1; d <= 65; d++) {
      v.amb.ora = 100 + d;
      const x = x0 + dx0 * d, y = y0 + dy0 * d;
      v.Touch5.move(9, x, y);
      const s = v.Touch5.stick[0];
      const dist = Math.hypot(x - x0, y - y0);
      if (dist >= 6) {
        if (!s.active) { male.push(`spenta a ${dist.toFixed(1)}px`); break; }
        const ax = x - s.ox, ay = y - s.oy;
        if (Math.abs(s.dx - ax) > 1e-9 || Math.abs(s.dy - ay) > 1e-9) { male.push('dx incoerente'); break; }
        if (dist <= 70 && (Math.abs(s.dx - (x - x0)) > 1e-9 || Math.abs(s.dy - (y - y0)) > 1e-9)) {
          male.push(`origine spostata a ${dist.toFixed(1)}px: dx=${s.dx.toFixed(2)} invece di ${(x - x0).toFixed(2)}`); break;
        }
      }
    }
  }
  return { ok: male.length === 0, det: male.length ? male.join(' · ') : '6 direzioni x 65 px: origine sempre quella del touchstart' };
});

/* =====================================================================
   C9 — LA RETE A STRASCICO. Sequenze casuali multi-dito con pause,
   annullamenti e azzeramenti, e tre invarianti che non devono mai
   rompersi. Questo controllo e' verde anche sul gioco senza toppa: serve
   a impedire che la cura sfondi qualcosa mentre ripara.
   ===================================================================== */
cancello('C9 · 8.000 sequenze casuali a piu\' dita: nessuna levetta viva su un dito che non e\' sul vetro', () => {
  let seme = 20260819;
  const caso = () => (seme = (seme * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const v = nuovo(); const rotture = {};
  for (let n = 0; n < 8000; n++) {
    v.pulisci(); v.amb.G.paused = false;
    v.amb.G.mode = caso() < 0.5 ? 1 : 2;
    v.amb.G.cpu = v.amb.G.mode === 2 ? [false, false] : [false, true];
    const giu = new Set(); v.amb.ora = 0;
    for (let k = 0; k < 12; k++) {
      v.amb.ora += 8 + Math.floor(caso() * 20);
      const id = Math.floor(caso() * 4);
      const x = Math.floor(caso() * VISTA[0]), y = Math.floor(caso() * VISTA[1]);
      const r = caso();
      if (r < 0.30) { if (!giu.has(id)) { v.Touch5.start(id, x, y); if (!v.amb.G.paused) giu.add(id); } }
      else if (r < 0.62) { if (giu.has(id)) v.Touch5.move(id, x, y); }
      else if (r < 0.78) { if (giu.has(id)) { v.Touch5.end(id); giu.delete(id); } }
      else if (r < 0.88) { if (giu.has(id)) { v.Touch5.cancel(id); giu.delete(id); } }
      else if (r < 0.94) { v.amb.G.paused = true; v.Touch5.azzera(); }
      else { v.amb.G.paused = false; }
      for (let t = 0; t < 2; t++) {
        const s = v.Touch5.stick[t];
        if (s.active && !giu.has(s.id)) rotture['levetta viva su un dito non sul vetro'] = (rotture['levetta viva su un dito non sul vetro'] || 0) + 1;
        if (s.active && giu.size === 0) rotture['levetta viva con zero dita'] = (rotture['levetta viva con zero dita'] || 0) + 1;
      }
      for (const p of pend(v.Touch5)) if (!giu.has(Number(p))) rotture['candidato che non e\' sul vetro'] = (rotture['candidato che non e\' sul vetro'] || 0) + 1;
      if (v.amb.G.paused) for (let t = 0; t < 2; t++) if (v.Touch5.stick[t].active) rotture['levetta accesa a gioco fermo'] = (rotture['levetta accesa a gioco fermo'] || 0) + 1;
    }
  }
  const n = Object.values(rotture).reduce((a, b) => a + b, 0);
  return { ok: n === 0, det: n ? JSON.stringify(rotture) : '8.000 sequenze, 4 invarianti, 0 rotture' };
});

/* =====================================================================
   LE MISURE — numeri stampati, senza verdetto. Servono a chi legge, non
   al codice d'uscita.
   ===================================================================== */
if (MISURE) {
  {
    const v = nuovo(); const righe = [];
    for (const D of [0, 6, 12, 13, 20, 30, 46, 67, 90]) {
      const a = pausaDeriva(v, false, D), b = pausaDeriva(v, true, D);
      righe.push(`  ${String(D).padStart(3)}px  candidato ${Math.hypot(a.m[0], a.m[1]).toFixed(2)}${a.sp ? '+SC' : '   '}   pollice ${Math.hypot(b.m[0], b.m[1]).toFixed(2)}${b.sp ? '+SC' : ''}`);
    }
    misura('deriva del dito durante la pausa -> velocita\' alla ripresa', '\n' + righe.join('\n'));
  }
  {
    /* la doppia adozione fra le due meta': un dito che attraversa mentre
       la riadozione dell'altra meta' e' armata puo' comandare TUTTE E DUE
       le levette. Si misura, non si giudica: c'e' anche senza la toppa. */
    const v = nuovo(); v.pulisci(); v.amb.G.mode = 2; v.amb.G.cpu = [false, false];
    v.amb.ora = 100; v.Touch5.start(7, 700, 100); v.Touch5.move(7, 760, 100);
    v.amb.G.paused = true; v.Touch5.azzera(); v.amb.G.paused = false; v.Touch5.end(7);
    v.amb.ora = 200; v.Touch5.start(3, 200, 100);
    v.amb.ora = 210; v.Touch5.move(3, 600, 100);
    const due = v.Touch5.stick[0].active && v.Touch5.stick[1].active &&
      v.Touch5.stick[0].id === 3 && v.Touch5.stick[1].id === 3;
    misura('2P, dito che attraversa la meta\' con la riadozione armata di la\'',
      `un solo dito comanda tutte e due le levette: ${due ? 'SI' : 'no'}  ` +
      `(s0 id=${v.Touch5.stick[0].id} attiva=${v.Touch5.stick[0].active}, s1 id=${v.Touch5.stick[1].id} attiva=${v.Touch5.stick[1].active})`);
  }
}

/* =====================================================================
   --telefono — LE DUE DITA VERE.

   Tutto quello che sta sopra passa per la catena d'ingresso di Node, non
   per quella di Android. Qui no: due dita si SCRIVONO sul dispositivo di
   ingresso del kernel (/dev/input/event2, protocollo B, due slot veri) e
   il gioco misurato e' quello dentro l'APK installato.

   TRE COSE CHE QUESTA PROVA CONTROLLA SU SE STESSA, se no non e' una
   misura:
     1. CHI STO MISURANDO. Si legge dalla pagina se il Touch5 in esecuzione
        ha la toppa (SOGLIA_LEVETTA, uPresa, l'unificazione in azzera). Un
        referto che non dice quale gioco ha misurato non e' un referto —
        e l'APK sul telefono lo puo' reinstallare chiunque.
     2. LE DUE DITA ERANO DAVVERO INSIEME. Una sonda conta i tocchi vivi:
        se in una prova non ce ne sono stati due nello stesso istante,
        quella prova e' NULLA e non entra nel conto.
     3. IL BRACCIO DI CONTROLLO. Lo stesso gesto col SOLO pollice deve
        comandare, prima e dopo. Se non comanda nemmeno da solo, la prova
        non sta misurando P6: sta misurando un guasto del banco.

   E una lezione pagata mentre scrivevo questo file: le dita restano ad
   almeno 110 px CSS dai bordi verticali. Un dito posato sul bordo fa
   scattare il gesto INDIETRO di Android, l'applicazione se ne va, e la
   WebView sparisce sotto i piedi del banco — che e' esattamente come e'
   morto l'altro banco quando ho provato a rilanciarlo oggi.
   ===================================================================== */
async function telefono() {
  const { execFileSync } = require('child_process');
  const { Vetro } = require('./_vetro.js');
  const PACCHETTO = 'it.dopolavoro.calcetto', ATTIVITA = 'it.dopolavoro.gioco.Gioco';
  const pausa = ms => new Promise(r => setTimeout(r, ms));
  const sdk = (process.env.ANDROID_SDK || process.env.ANDROID_HOME ||
    path.join(process.env.USERPROFILE || '', 'Android', 'Sdk')).replace(/\\/g, '/');
  let adb = null;
  for (const c of ['adb', sdk + '/platform-tools/adb.exe', sdk + '/platform-tools/adb']) {
    try { execFileSync(c, ['version'], { stdio: 'pipe', timeout: 20000 }); adb = c; break; } catch (e) { }
  }
  if (!adb) throw new Error('adb non trovato');
  const disp = execFileSync(adb, ['devices'], { encoding: 'utf8', timeout: 60000 })
    .split('\n').slice(1).filter(r => /\tdevice$/.test(r.trim())).map(r => r.split('\t')[0]);
  if (!disp.length) throw new Error('nessun telefono AUTORIZZATO collegato');
  const dev = disp[0];
  const sh = (...a) => execFileSync(adb, ['-s', dev, ...a], { encoding: 'utf8', timeout: 300000 });
  const tara = JSON.parse(fs.readFileSync(path.join(__dirname, 'pollici-taratura.json'), 'utf8'));
  if (tara.dev !== dev) throw new Error(`la taratura e' del telefono ${tara.dev}, questo e' ${dev}`);
  const inv = tara.indietro;
  const P = (cx, cy) => ({ px: inv.a * cx + inv.b * cy + inv.c, py: inv.d * cx + inv.e * cy + inv.f });

  function filo(url) {
    return new Promise((ok, no) => {
      const ws = new WebSocket(url); let n = 0, morto = false; const attesa = new Map();
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
          async js(expr) {
            const r = await this.manda('Runtime.evaluate', { expression: expr, returnByValue: true });
            if (r && r.result && r.result.exceptionDetails) return { ECCEZIONE: String(r.result.exceptionDetails.text || '') + ' ' + JSON.stringify(r.result.result && r.result.result.value) };
            return r && r.result && r.result.result ? r.result.result.value : undefined;
          },
          chiudi() { try { ws.close(); } catch (e) { } },
        });
      };
    });
  }

  sh('shell', 'input', 'keyevent', 'KEYCODE_WAKEUP');
  sh('shell', 'am', 'force-stop', PACCHETTO);
  /* SI CANCELLANO I DATI DELL'APPLICAZIONE, E QUESTA RIGA E' COSTATA TRE
     CORSE. Il gioco registra un service worker: dopo la prima apertura la
     WebView serve l'HTML DALLA CACHE del worker, non quello dentro l'APK
     appena installato. Risultato: si installa la copia toppata, la prima
     corsa misura la copia toppata, e la seconda misura di nuovo il gioco
     VECCHIO — con un referto che dice «due dita, 42 su 42 spento» e
     sembra una bocciatura della cura. Se non ci fosse stata la firma
     letta dalla pagina (soglia levetta, mezzaluna, guardia,
     unificazione) l'avrei spedita per buona: e' esattamente l'attrezzo
     che ATTESTA invece di misurare.
     NOTA per chi ha il telefono in mano: questo cancella i dati salvati
     del gioco di prova (monete, opzioni). */
  try { sh('shell', 'pm', 'clear', PACCHETTO); } catch (e) { }
  sh('shell', 'am', 'start', '-W', '-n', `${PACCHETTO}/${ATTIVITA}`);
  await pausa(2500);
  let c = null;
  for (let i = 0; i < 20 && !c; i++) {
    const u = sh('shell', 'cat', '/proc/net/unix');
    const p = (u.match(/@(webview_devtools_remote\S*)/) || [])[1];
    if (p) {
      try { execFileSync(adb, ['-s', dev, 'forward', '--remove', 'tcp:9222'], { stdio: 'pipe' }); } catch (e) { }
      sh('forward', 'tcp:9222', 'localabstract:' + p);
      for (let k = 0; k < 20 && !c; k++) {
        try {
          const l = await (await fetch('http://127.0.0.1:9222/json/list')).json();
          const pg = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
          if (pg) c = await filo(pg.webSocketDebuggerUrl);
        } catch (e) { }
        if (!c) await pausa(400);
      }
    }
    if (!c) await pausa(500);
  }
  if (!c) throw new Error('nessun filo con la WebView');
  for (let i = 0; i < 40; i++) { if (await c.js('!!window.__test')) break; await pausa(300); }
  await c.js('window.__test.dismissSplash&&window.__test.dismissSplash(); window.__test.startMatch(1,1,{size:5}); 1');
  await pausa(1800);

  const SONDA = `(function(){
    if(window.__due) return 'gia';
    var os=Touch5.start, om=Touch5.move, oc=Touch5.chiudi;
    var vive=new Set(), max=0;
    Touch5.start=function(id,x,y){ vive.add(id); if(vive.size>max)max=vive.size; return os.call(this,id,x,y); };
    Touch5.chiudi=function(id,a){ vive.delete(id); return oc.call(this,id,a); };
    window.__due={
      azzera:function(){ vive.clear(); max=0; },
      max:function(){ return max; },
      vive:function(){ return vive.size; },
      lev:function(){ return Touch5.stick.map(function(s){ return {a:s.active,id:s.id,dx:+s.dx.toFixed(2),dy:+s.dy.toFixed(2)}; }); },
      cmd:function(t){ var m=humanMove(t); return +Math.hypot(m[0],m[1]).toFixed(4); },
      stato:function(){ return {scena:G.scene,fermo:!!G.paused,cpu0:!!G.cpu[0],mode:G.mode,
                                VW:(typeof VW!=='undefined'?VW:innerWidth),VH:(typeof VH!=='undefined'?VH:innerHeight)}; },
      chi:function(){ return { soglia:(typeof Touch5.SOGLIA_LEVETTA==='number'?Touch5.SOGLIA_LEVETTA:null),
                               mezzaluna:/uPresa/.test(os.toString()),
                               guardiaPausa:/if\\(!G\\.paused\\)\\{[\\s\\S]{0,80}this\\.pend\\[id\\]/.test(om.toString()),
                               unificazione:/pri\\[q\\.t\\]/.test(Touch5.azzera.toString()),
                               byte:document.documentElement.outerHTML.length }; },
      sopra:function(x,y){ var e=document.elementFromPoint(x,y); return e?(e.id||e.tagName.toLowerCase()):'(niente)'; },
      /* CONGELARE, e perche' non e' un lusso. Il gestore touchstart del
         campo comincia cosi':
             if(G.ripresa){ saltaRipresa(); return; }
             if(G.moviola){ saltaMoviola(); return; }
         cioe' durante la ripresa del gol e la moviola il dito NON arriva
         mai a Touch5. A partita viva ho misurato 38 prove NULLE su 42 per
         questa ragione: il banco credeva di posare due dita e ne posava
         una sola, e senza il contatore delle dita vive avrei scambiato
         quelle 38 per un risultato. */
      ripresa:function(){ return !!(window.G&&(G.ripresa||G.moviola)); },
      congela:function(){ if(window.__qRAF) return 'gia'; window.__qRAF=window.requestAnimationFrame;
                          window.requestAnimationFrame=function(){ return 0; }; return 'congelato'; },
      scongela:function(){ if(!window.__qRAF) return 'gia'; window.requestAnimationFrame=window.__qRAF;
                           window.__qRAF=null; if(typeof frame==='function') requestAnimationFrame(frame); return 'sciolto'; }
    };
    return 'ok';
  })()`;
  const inst = await c.js(SONDA);
  if (inst !== 'ok' && inst !== 'gia') throw new Error('sonda non installata: ' + JSON.stringify(inst));
  const st = await c.js('JSON.stringify(window.__due.stato())');
  const S = JSON.parse(st);
  const CHI = JSON.parse(await c.js('JSON.stringify(window.__due.chi())'));
  console.log(`\n  telefono ${dev} · vista ${S.VW}x${S.VH} · scena ${S.scena} · fermo ${S.fermo}`);
  console.log(`  il gioco che gira LI' DENTRO: soglia levetta ${CHI.soglia} · mezzaluna ${CHI.mezzaluna} · ` +
    `guardia pausa ${CHI.guardiaPausa} · unificazione azzera ${CHI.unificazione} · ${CHI.byte} byte`);
  if (!(S.scena === 'play' || S.scena === 'kickoff' || S.scena === 'golden') || S.fermo)
    throw new Error('non c\'e\' una partita viva: scena ' + S.scena + ' fermo ' + S.fermo);
  /* ===================================================================
     IL TELEFONO DEVE ESEGUIRE IL GIOCO CHE STO PROVANDO, E LO SI VERIFICA
     INVECE DI SPERARLO. La firma letta dalla pagina si confronta con il
     file passato in --da / GIOCO_PROVA: se non combaciano, questa non e'
     una misura debole, e' una misura di un'altra cosa, e si ferma.
     Non e' teoria: durante la scrittura di questo file l'APK sul telefono
     e' tornato tre volte alla versione senza toppa fra una corsa e
     l'altra (il telefono e' un banco CONDIVISO: chiunque puo'
     reinstallare), e senza questo controllo avrei spedito «42 su 42
     spento» come se fosse la bocciatura della cura. */
  const attesa = { soglia: /SOGLIA_LEVETTA:6/.test(SRC) ? 6 : null, mezzaluna: /let preso=null, uPresa=Infinity/.test(SRC) };
  if (CHI.soglia !== attesa.soglia || CHI.mezzaluna !== attesa.mezzaluna)
    throw new Error(`il telefono NON esegue il gioco in prova. Sul vetro: soglia ${CHI.soglia}, mezzaluna ${CHI.mezzaluna}; ` +
      `nel file ${path.basename(GIOCO)}: soglia ${attesa.soglia}, mezzaluna ${attesa.mezzaluna}. ` +
      `Ricostruisci e installa l'APK di QUEL file (strumenti/_t-apk.py) e rilancia.`);

  const inRipresa = await c.js('window.__due.ripresa()');
  const cong = await c.js('window.__due.congela()');
  await pausa(250);
  console.log(`  ripresa/moviola in corso quando ho cominciato: ${inRipresa} · simulazione: ${cong}`);

  const vetro = new Vetro(adb, dev);
  let epipe = 0; try { vetro.p.stdin.on('error', () => { epipe++; }); } catch (e) { }
  await pausa(400);
  const POL = 0, VAG = 1, PASSI = 6, DX = -8, DY = -4;
  const casa = { x: Math.round(S.VW * 0.30), y: Math.round(S.VH * 0.60) };

  async function prova(d) {   // d = null -> braccio di controllo (un dito solo)
    for (let tent = 0; tent < 3; tent++) {
      /* UNA PROVA ATTRAVERSATA DA UN RIALLINEAMENTO NON E' UNA PROVA.
         Quando il tubo verso /dev/input si disallinea, Vetro lo riapre e
         RIMETTE GIU' le dita che erano giu': sul pannello e' un nuovo
         identificativo di tracciamento, quindi per il browser il pollice
         si e' alzato ed e' ridisceso DOVE STAVA IN QUEL MOMENTO — e i
         movimenti che restano partono da li', sotto la soglia. Il
         risultato e' una levetta spenta che sembra il difetto che sto
         misurando e non lo e'. Si conta la rottura e la prova si butta.
         (E' cosi' che si spiegano le due prove «spente» che vedevo sulla
         copia toppata: il difetto era nel mio tubo, non nel gioco. Ma
         l'ho verificato buttandole, non ragionandoci sopra.) */
      const rott0 = vetro.rotture;
      vetro.su(POL); vetro.su(VAG); await pausa(150);
      await c.js('window.__due.azzera(); 1');
      if (d) { const q = P(d.x, d.y); vetro.giu(VAG, q.px, q.py); await pausa(130); }
      const qc = P(casa.x, casa.y); vetro.giu(POL, qc.px, qc.py); await pausa(130);
      for (let k = 1; k <= PASSI; k++) { const q2 = P(casa.x + DX * k, casa.y + DY * k); vetro.muovi(POL, q2.px, q2.py); await pausa(30); }
      await pausa(170);
      const r = JSON.parse(await c.js('JSON.stringify({max:window.__due.max(),viv:window.__due.vive(),cmd:window.__due.cmd(0),lev:window.__due.lev(),st:window.__due.stato(),rip:window.__due.ripresa()})') || 'null') || {};
      vetro.su(POL); vetro.su(VAG); await pausa(140);
      const atteso = d ? 2 : 1;
      const rotta = vetro.rotture !== rott0;
      if (r.max === atteso && !rotta) return r;
      if (tent === 2) return { NULLO: rotta ? 'il canale verso /dev/input si e\' riallineato durante la prova' : `dita insieme ${r.max} invece di ${atteso}` };
    }
  }

  /* il reticolo delle dita che disturbano: dentro il vetro, lontano dai
     bordi verticali (gesto indietro), lontano dagli anelli dei pulsanti e
     dal cammino del pollice. Tutto quello che si scarta si dichiara. */
  const dischi = JSON.parse(await c.js('JSON.stringify(Touch5.stick&&touchBtnLayout(0).map(function(b){return {x:b.x,y:b.y,r:b.r};}))'));
  const dita = []; const scarti = { bordo: 0, pulsante: 0, pollice: 0, sopra: 0 };
  for (let x = 110; x <= S.VW - 110; x += 70) for (let y = 55; y <= S.VH - 55; y += 55) {
    if (dischi.some(b => Math.hypot(x - b.x, y - b.y) <= b.r + 18)) { scarti.pulsante++; continue; }
    let vicino = false;
    for (let k = 0; k <= PASSI; k++) if (Math.hypot(x - (casa.x + DX * k), y - (casa.y + DY * k)) < 40) vicino = true;
    if (vicino) { scarti.pollice++; continue; }
    const so = await c.js(`window.__due.sopra(${x},${y})`);
    if (so !== 'gioco') { scarti.sopra++; continue; }
    dita.push({ x, y });
  }

  const ctrl = [];
  for (let i = 0; i < 3; i++) ctrl.push(await prova(null));
  const ctrlOk = ctrl.filter(r => r && !r.NULLO && r.cmd > 0).length;

  const ris = []; let nulle = 0, spenti = 0;
  for (const d of dita) {
    const r = await prova(d);
    if (!r || r.NULLO) { nulle++; ris.push({ d, NULLO: r ? r.NULLO : 'niente' }); continue; }
    if (!(r.cmd > 0)) spenti++;
    ris.push({ d, cmd: r.cmd, max: r.max, lev: r.lev[0], st: r.st, rip: r.rip });
  }
  vetro.su(POL); vetro.su(VAG); await pausa(150);
  try { vetro.p.stdin.end(); vetro.p.kill(); } catch (e) { }
  await c.js('window.__due.scongela()');
  c.chiudi();

  const valide = dita.length - nulle;
  console.log(`  braccio di controllo (un dito solo): ${ctrlOk} su 3 comandano`);
  console.log(`  punti d'appoggio chiesti ${dita.length} · scartati prima di provare: ` +
    Object.entries(scarti).map(([k, v]) => k + ' ' + v).join(' · '));
  console.log(`  prove NULLE (le due dita non erano insieme): ${nulle}`);
  console.log(`  DUE DITA VERE: comando del pollice SPENTO in ${spenti} prove su ${valide}` +
    (epipe ? ` · canale rotto ${epipe} volte` : '') + (vetro.rotture ? ` · riallineamenti ${vetro.rotture}` : ''));
  /* CHI HA FALLITO SI STAMPA. Un numero diverso da zero senza i punti che
     lo compongono e' un numero che nessuno puo' andare a controllare. */
  for (const r of ris) if (!r.NULLO && !(r.cmd > 0))
    console.log(`     spento a ${r.d.x},${r.d.y}: levetta ${JSON.stringify(r.lev)} · dita insieme ${r.max} · scena ${r.st&&r.st.scena} fermo ${r.st&&r.st.fermo} ripresa ${r.rip}`);
  for (const r of ris) if (r.NULLO) console.log(`     NULLA a ${r.d.x},${r.d.y}: ${r.NULLO}`);
  if (valide < 10) console.log('  ATTENZIONE: meno di dieci prove valide, il numero sopra non vale niente');
  return { ctrlOk, valide, nulle, spenti, chi: CHI, vista: [S.VW, S.VH], dev };
}

(async () => {
  if (process.argv.includes('--telefono')) {
    try {
      const t = await telefono();
      esiti.push({ nome: 'T1 · due dita VERE sul telefono: il pollice comanda', ok: t.valide >= 10 && t.spenti === 0 && t.ctrlOk === 3 });
      console.log((t.valide >= 10 && t.spenti === 0 && t.ctrlOk === 3 ? '  OK   ' : '  NO   ') +
        `T1 · due dita VERE sul telefono: spento ${t.spenti}/${t.valide}`);
    } catch (e) {
      console.log('  NO   T1 · due dita VERE sul telefono: NON MISURATO — ' + e.message);
      esiti.push({ nome: 'T1 · due dita VERE sul telefono', ok: false });
    }
  }
  const rotti = esiti.filter(e => !e.ok);
  console.log(`\n${esiti.length} cancelli, ${esiti.length - rotti.length} passati, ${rotti.length} falliti  ·  gioco: ${GIOCO}`);
  if (rotti.length) { console.log('FALLITI: ' + rotti.map(r => r.nome.split(' ·')[0]).join(', ')); process.exit(1); }
})();
