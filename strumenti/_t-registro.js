/* =====================================================================
   _t-registro.js — UNA PARTITA IN QUATTRO KB (27 agosto 2026).

   COSA FA. Da qui in poi il gioco sa registrare quello che le dita hanno
   fatto, e sa rigiocarlo. Con il seme gia' dentro (_t-seme.js) questo
   basta a ricostruire la partita intera: non le posizioni di ventidue
   uomini sessanta volte al secondo, ma i comandi — che sono poche
   migliaia di numeri piccoli.

   PERCHE' SERVE, e sono tre cose che senza di lui non esistono:
     · IL REPLAY. Il difensore di una sfida asincrona puo' GUARDARE la
       partita che ha subito mentre dormiva. FC Mobile gli manda un
       punteggio; noi gli mandiamo la partita, e pesa meno di una
       fotografia.
     · LA VERIFICA. Chi manda un risultato manda anche il modo di
       ricontrollarlo: si rigioca e si vede se torna. E' l'anti-imbroglio
       piu' economico che esista, e ce lo regala il determinismo.
     · IL TEMPO REALE. Due telefoni allo stesso seme si scambiano i
       comandi e non lo stato: quattro byte per fotogramma invece di
       ottocento.

   IL PUNTO DELICATO ERA UN ALTRO DA QUELLO CHE CREDEVO, e vale la pena
   scrivere tutti e due perche' la differenza e' istruttiva.

   QUELLO CHE CREDEVO: IL TEMPO. La levetta scrive un performance.now()
   dentro la storia del dito (`hist`), e un orologio vero non si ripete;
   quindi un replay ai tempi sbagliati avrebbe prodotto gesti di forza
   diversa. La toppa virtualizza quei cinque orologi — il tempo diventa
   un DATO DEL COMANDO, si registra insieme alle coordinate e si rimette
   al suo posto in rilettura.
   ONESTA': misurato, oggi `hist` SI SCRIVE E NON SI LEGGE MAI. Nessuno
   consuma la storia del gesto, quindi quella virtualizzazione non sta
   riparando niente. Resta perche' costa cinque parole ed e' la rete per
   il giorno in cui qualcuno la leggera' — e quel giorno il replay si
   romperebbe in silenzio, che e' il modo peggiore.

   QUELLO CHE ERA DAVVERO: L'ORIGINE DELLA LEVETTA. La stessa partita,
   stesso seme, stesse dita, giocata due volte di fila sulla stessa
   pagina divergeva al passo 90. Su due pagine fresche era identica.
   Sopravviveva stick[0].ox/oy — dove il pollice l'aveva lasciata la
   volta prima. Il seme non basta: il replay ha bisogno che anche i
   COMANDI partano da zero. Vedi Reg.azzeraComandi(), e la diagnosi che
   l'ha trovata sta in strumenti/_diag-replay.js.

   COME SI AGGANCIA, e perche' cosi'. Le quattro porte dei comandi
   (start, move, chiudi, azzera) si avvolgono DALL'ESTERNO, senza toccare
   il loro corpo. E' una scelta di robustezza: il corpo di Touch5.move e'
   duecento righe che altre toppe stanno cambiando in questo momento, e
   un ancoraggio la' dentro si romperebbe alla prima. L'avvolgimento
   dipende solo dai NOMI, che sono stabili da mesi.

   COSA NON FA. Non parla con la rete (quello e' il client, altrove), non
   cambia il gioco quando il registro e' spento, non registra da solo:
   lo accende chi apre una partita di rete.

   uso:  node strumenti/_t-registro.js --out fuori/registro.html
         node strumenti/_t-registro.js --dentro
         node strumenti/_t-registro.js --elenco
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* =====================================================================
   IL BLOCCO — il registro, l'orologio, e il formato.
   ===================================================================== */
const BLOCCO = `
/* =====================================================================
   IL REGISTRO DEI COMANDI — una partita in quattro kB (27 agosto 2026).

   Il gioco e' deterministico dato il seme (misurato: 10 controlli su 10,
   strumenti/_q-determinismo.js). Quindi per ricostruire una partita non
   servono le posizioni: servono i COMANDI, e sono questi.

   TRE MODI:
     0  spento     il gioco di sempre, non costa niente
     1  scrivo     si gioca e si registra. Il gioco NON cambia: l'orologio
                   resta quello vero, il gesto resta quello di prima.
     2  rileggo    si rigioca il registrato. Le dita vere sul vetro sono
                   ignorate — se no un dito appoggiato per sbaglio
                   cambierebbe una partita gia' successa.

   IL TEMPO E' UN DATO DEL COMANDO. La levetta misura la velocita' del
   dito con performance.now(): senza il tempo registrato, gli stessi
   tocchi alle stesse coordinate darebbero passaggi di forza diversa e il
   replay divergerebbe. Si salva insieme alle coordinate e si rimette al
   suo posto in rilettura — vedi oraGioco().
   ===================================================================== */
const Reg = {
  modo: 0,          /* 0 spento · 1 scrivo · 2 rileggo */
  righe: [],        /* [tick, tipo, ms, ...argomenti] */
  i: 0,             /* dove siamo arrivati in rilettura */
  tick: 0,          /* il passo fisso corrente: e' l'orologio del registro */
  t0: 0,            /* performance.now() all'accensione, per i millisecondi relativi */
  tOra: 0,          /* il tempo del comando che si sta rigiocando adesso */
  dentro: false,    /* true mentre il riproduttore chiama le porte */
  ids: new Map(),   /* identificativi del browser -> interi piccoli */
  idProx: 0,
  tasti: [],        /* i codici dei tasti incontrati, per non ripeterli */

  accendi(){
    this.modo = 1; this.righe = []; this.i = 0; this.tick = 0;
    this.t0 = performance.now(); this.ids = new Map(); this.idProx = 0; this.tasti = [];
    this.azzeraComandi();
  },
  /* spegnendo il registro gli inviti tornano a parlare: chi ha finito la
     sfida e torna a giocare da solo ha diritto ai suoi suggerimenti */
  spegni(){
    this.modo = 0;
    try{ if(typeof Inviti !== 'undefined') Inviti.muto = false; }catch(e){}
  },

  /* =====================================================================
     I COMANDI SI AZZERANO PRIMA, e questa riga e' costata un'autopsia.

     Il seme non basta. Misurato (strumenti/_diag-replay.js): la stessa
     partita, con lo stesso seme e le stesse dita, giocata due volte di
     fila sulla stessa pagina, DIVERGE al passo 90. Su due pagine fresche
     invece e' identica. Quindi non era il caso: era qualcosa che
     sopravviveva alla prima partita.

     Era l'ORIGINE DELLA LEVETTA. Dopo una partita, stick[0] resta con
     ox:180, oy:300 — dove il pollice l'aveva lasciata — e la partita
     dopo comincia con la levetta ancorata li'. Nel gioco normale non se
     ne accorge nessuno; per un replay e' la differenza fra la stessa
     partita e un'altra.

     La prova che e' proprio questo: azzerando i comandi prima di ogni
     partita, le due esecuzioni tornano IDENTICHE (ipotesi 9 della
     diagnosi). Gli inviti e il salvataggio cambiano anche loro fra una
     partita e l'altra, e NON contano — provato dallo stesso banco.
     ===================================================================== */
  azzeraComandi(){
    try{
      if(typeof Touch5 === 'undefined') return;
      Touch5.azzera();
      Touch5.pend = {}; Touch5.btnTouch = {};
      if(Touch5.atti) Touch5.atti = {};
      for(const s of Touch5.stick){
        s.active = false; s.id = -1; s.ox = 0; s.oy = 0; s.dx = 0; s.dy = 0;
        s.hist = []; s.riadotta = null;
      }
    }catch(e){}
    /* =====================================================================
       E GLI INVITI TACCIONO, che e' la seconda cosa che il seme non copre.

       Gli inviti sono i suggerimenti che compaiono quando uno perde
       un'occasione per la terza volta («TIENI PREMUTO TIRA»). Hanno una
       MEMORIA che vive nel salvataggio (SAVE.inviti) e cambia da partita
       a partita: la prima volta compaiono, poi no. Misurato: la prima
       partita consuma 492 sorteggi, tutte le successive 263 — la
       differenza e' l'invito che compare una volta sola.

       Per un replay e' fatale, e in un modo che si vede solo in
       produzione: chi registra la partita e chi la rigioca sono due
       telefoni diversi, con due storie diverse di suggerimenti gia'
       visti. Stesso seme, stessi comandi, inviti diversi: due partite
       diverse.

       Si tacciono in tutte e due le direzioni — in registrazione e in
       rilettura — cosi' i due capi partono uguali per costruzione. Ed e'
       anche giusto per il gioco: in una sfida contro un altro non ci
       vuole il tutorial. Offline, col registro spento, gli inviti
       restano esattamente come sono sempre stati.
       ===================================================================== */
    try{
      if(typeof Inviti !== 'undefined'){
        Inviti.muto = true;
        if(Inviti.azzeraPartita) Inviti.azzeraPartita();
      }
    }catch(e){}
    /* =====================================================================
       E I CINQUE CRONOMETRI CHE startMatch NON AZZERA.

       E' la causa vera della divergenza, trovata confrontando OGNI campo
       dello stato subito dopo startMatch (strumenti/_diag-campi.js). Fra
       una partita e la successiva sopravvivono:

         G.possOwner   chi ha il pallone  (-1 contro 2)
         G.possT       da quanto ce l'ha  (0,53 s contro 0,03 s)
         G.pulse       la pulsazione della scena
         G.crowdSndT   il cronometro del coro
         G.recT        il cronometro della registrazione della moviola

       I primi due non sono cosmetici: aiDecide li LEGGE. Una partita che
       comincia con «quello ha la palla da mezzo secondo» prende decisioni
       diverse da una che comincia da zero — e infatti la divergenza
       nasceva proprio dentro aiDecide, al passo 87.

       QUESTO E' UN DIFETTO DEL GIOCO, non solo del replay: dalla seconda
       partita in poi l'intelligenza parte con in testa il possesso della
       partita prima. Qui si tura per il registro, che e' dove fa danno
       subito; la correzione dentro startMatch va fatta a parte e
       misurata, perche' cambia il gioco anche per chi non va in rete.
       ===================================================================== */
    try{
      G.possOwner = -1; G.possT = 0;
      G.pulse = 0; G.crowdSndT = 0; G.recT = 0;
    }catch(e){}
  },

  /* l'identificativo di un tocco, dal browser, e' un numero qualunque e
     puo' essere enorme. Nel registro diventa 0, 1, 2...: pesa meno e
     rende il file uguale su telefoni diversi. */
  idDi(id){
    if(!this.ids.has(id)) this.ids.set(id, this.idProx++);
    return this.ids.get(id);
  },

  scrivi(tipo, arg){
    if(this.modo !== 1) return;
    if(this.righe.length > 40000) return;   /* una partita non ha 40.000 comandi: se li ha, e' un ciclo */
    this.righe.push([this.tick, tipo, Math.round(performance.now() - this.t0)].concat(arg));
  },

  /* IL PASSO. Si chiama all'inizio di ogni step(): fa avanzare l'orologio
     del registro e, in rilettura, rimette in scena tutti i comandi che a
     questo passo erano stati dati. */
  passo(){
    if(this.modo === 0) return;
    if(this.modo === 2){
      this.dentro = true;
      while(this.i < this.righe.length && this.righe[this.i][0] <= this.tick){
        const r = this.righe[this.i++];
        this.tOra = r[2];
        try { this.esegui(r); } catch(e) { /* un comando che non si puo' rigiocare non ferma la partita */ }
      }
      this.dentro = false;
    }
    this.tick++;
  },

  esegui(r){
    const tipo = r[1];
    if(tipo === 0) Touch5.start(r[3], r[4], r[5]);
    else if(tipo === 1) Touch5.move(r[3], r[4], r[5]);
    else if(tipo === 2) Touch5.chiudi(r[3], !!r[4]);
    else if(tipo === 3) Touch5.azzera();
    else if(tipo === 4){ const c = this.tasti[r[4]]; if(c) Keys[c] = !!r[3]; }
  },

  /* IL FORMATO, e la ragione di ogni scelta e' il peso. Una partita di
     novanta secondi produce qualche migliaio di comandi, e quasi tutti
     sono movimenti del dito che si sposta di due pixel. Percio':
       · i numeri sono interi (le frazioni di pixel non cambiano nulla e
         raddoppiano il testo);
       · il passo e il tempo sono DIFFERENZE dal comando precedente, cosi'
         quasi tutti diventano 0 o 1;
       · le coordinate sono differenze dal tocco precedente dello stesso
         dito, per lo stesso motivo.
     Il risultato e' una stringa di cifre piccole e virgole, che il
     deflate del browser stringe di un altro fattore dieci. */
  serializza(){
    let s = '1|' + this.tasti.join(',') + '|';
    let tPrec = 0, msPrec = 0;
    const ux = new Map(), uy = new Map();
    const pezzi = [];
    for(const r of this.righe){
      const dT = r[0] - tPrec, dMs = r[2] - msPrec;
      tPrec = r[0]; msPrec = r[2];
      const tipo = r[1];
      if(tipo === 0 || tipo === 1){
        const id = r[3], x = Math.round(r[4]), y = Math.round(r[5]);
        const px = ux.has(id) ? ux.get(id) : 0, py = uy.has(id) ? uy.get(id) : 0;
        ux.set(id, x); uy.set(id, y);
        pezzi.push(dT + ',' + tipo + ',' + dMs + ',' + id + ',' + (x - px) + ',' + (y - py));
      } else if(tipo === 2){
        pezzi.push(dT + ',2,' + dMs + ',' + r[3] + ',' + (r[4] ? 1 : 0));
      } else if(tipo === 3){
        pezzi.push(dT + ',3,' + dMs);
      } else if(tipo === 4){
        pezzi.push(dT + ',4,' + dMs + ',' + (r[3] ? 1 : 0) + ',' + r[4]);
      }
    }
    return s + pezzi.join(';');
  },

  deserializza(testo){
    const p = String(testo).split('|');
    if(p[0] !== '1') throw new Error('registro di un\\'altra versione');
    this.tasti = p[1] ? p[1].split(',') : [];
    this.righe = [];
    let tPrec = 0, msPrec = 0;
    const ux = new Map(), uy = new Map();
    for(const pezzo of (p[2] || '').split(';')){
      if(!pezzo) continue;
      const v = pezzo.split(',').map(Number);
      const tick = tPrec + v[0], tipo = v[1], ms = msPrec + v[2];
      tPrec = tick; msPrec = ms;
      if(tipo === 0 || tipo === 1){
        const id = v[3];
        const x = (ux.has(id) ? ux.get(id) : 0) + v[4];
        const y = (uy.has(id) ? uy.get(id) : 0) + v[5];
        ux.set(id, x); uy.set(id, y);
        this.righe.push([tick, tipo, ms, id, x, y]);
      } else if(tipo === 2) this.righe.push([tick, 2, ms, v[3], v[4]]);
      else if(tipo === 3)   this.righe.push([tick, 3, ms]);
      else if(tipo === 4)   this.righe.push([tick, 4, ms, v[3], v[4]]);
    }
    this.i = 0; this.tick = 0; this.modo = 2;
    this.azzeraComandi();
    return this.righe.length;
  },
};

/* L'OROLOGIO DEL GESTO. In gioco normale e in registrazione e' il tempo
   vero, quindi il gesto e' identico a quello di sempre. In rilettura e'
   il tempo che quel comando aveva quando fu dato: senza, la stessa
   levetta tirata alle stesse coordinate produrrebbe una spinta invece di
   uno scatto, e la partita rigiocata non sarebbe quella. */
function oraGioco(){
  return Reg.modo === 2 ? Reg.tOra : performance.now();
}
`;

/* =====================================================================
   L'AVVOLGIMENTO — dall'esterno, e dipende solo dai nomi.
   ===================================================================== */
const AVVOLGI = `
/* =====================================================================
   LE QUATTRO PORTE DEI COMANDI, AVVOLTE DALL'ESTERNO (27 agosto 2026).

   start, move, chiudi e azzera sono tutto cio' che un dito puo' dire al
   gioco: end e cancel passano da chiudi, e i verbi (tiro, passaggio,
   scivolata, cambio) nascono dentro, quindi registrarli sarebbe
   registrare due volte la stessa cosa.

   L'avvolgimento sta QUI, fuori, e non dentro i quattro metodi: il corpo
   di Touch5.move e' duecento righe che le toppe dei comandi cambiano di
   continuo, e un ancoraggio la' dentro si romperebbe alla prima. Questo
   dipende soltanto dai nomi, che non cambiano da mesi.

   IN RILETTURA LE DITA VERE SONO IGNORATE. Un dito appoggiato per sbaglio
   sullo schermo mentre si guarda un replay cambierebbe una partita gia'
   successa — e la cambierebbe in silenzio, che e' il modo peggiore.
   ===================================================================== */
(function(){
  const porte = { start:0, move:1, chiudi:2, azzera:3 };
  for(const nome in porte){
    const tipo = porte[nome], vero = Touch5[nome];
    if(typeof vero !== 'function') continue;
    Touch5[nome] = function(a, b, c){
      /* in rilettura passa solo il riproduttore */
      if(Reg.modo === 2 && !Reg.dentro) return;
      /* =================================================================
         IL DITO SI POSA SU UN PIXEL INTERO, SEMPRE.

         Non solo quando si registra: sempre, in tutte e tre le modalita'.
         E' l'unico modo perche' la partita registrata e quella rigiocata
         siano la stessa cosa PER COSTRUZIONE invece che per fortuna —
         se il registro salvasse 412 e il gioco ricevesse 412,3, il
         replay comincerebbe a divergere dal primo trascinamento.

         Un pixel non e' niente su un dito largo quaranta, e le frazioni
         che arrivano dagli eventi touch non sono precisione: sono il
         rapporto fra pixel fisici e pixel logici. Arrotondare qui rende
         il gioco IDENTICO online e offline, che e' cio' che conta: se
         arrotondassimo solo in registrazione, la partita di rete
         sarebbe un gioco leggermente diverso da quello di casa.
         ================================================================= */
      if(tipo === 0 || tipo === 1){ b = Math.round(b); c = Math.round(c); }
      if(Reg.modo === 1){
        if(tipo === 0 || tipo === 1) Reg.scrivi(tipo, [Reg.idDi(a), b, c]);
        else if(tipo === 2) Reg.scrivi(2, [Reg.idDi(a), b ? 1 : 0]);
        else Reg.scrivi(3, []);
      }
      return vero.call(this, a, b, c);
    };
  }
})();
`;

const ANCORE = [

/* 1 — il registro nasce prima delle porte che deve avvolgere */
{
  nome: '1/6 il registro e l\'orologio del gesto, dichiarati prima di Touch5',
  cerca: `const Touch5 = {`,
  metti: BLOCCO + `\nconst Touch5 = {`,
},

/* 2 — il passo fisso fa avanzare l'orologio del registro E rimette in
       scena i comandi di quel passo. Sta in cima a step() perche' i
       comandi devono valere PER questo passo, non per il prossimo. */
{
  nome: '2/6 step() fa avanzare il registro e rigioca i comandi del passo',
  cerca: `function step(){
  const dt=DT;
  G.sceneT+=dt;`,
  metti: `function step(){
  /* IL REGISTRO SI MUOVE COL PASSO FISSO, non coi fotogrammi. E' la
     stessa ragione per cui ci stanno il cronometro del tutorial e quello
     degli inviti: un tempo contato sui fotogrammi non e' ripetibile, e
     qui la ripetibilita' e' tutto il punto. In rilettura questa riga
     rimette in scena i comandi che a questo passo erano stati dati. */
  Reg.passo();
  const dt=DT;
  G.sceneT+=dt;`,
},

/* 3 — le porte, avvolte quando Touch5 esiste di sicuro e prima che
       arrivi un solo evento vero */
{
  nome: '3/6 le quattro porte dei comandi, avvolte dall\'esterno',
  cerca: `window.__test = {
  get state(){ return G.scene; },`,
  metti: AVVOLGI + `
window.__test = {
  get state(){ return G.scene; },`,
},

/* 4 — la tastiera. Su telefono non c'e', ma chi gioca da computer deve
       produrre un replay verificabile come tutti gli altri: se no la
       verifica avrebbe un buco grande quanto una piattaforma. */
{
  nome: '4/6 il tasto premuto entra nel registro',
  cerca: `  Keys[e.code]=true;`,
  metti: `  Keys[e.code]=true;
  /* anche il tasto e' un comando: chi gioca da computer deve produrre un
     replay verificabile come chi gioca col pollice */
  if(Reg.modo===1){ let k=Reg.tasti.indexOf(e.code); if(k<0){ k=Reg.tasti.length; Reg.tasti.push(e.code); } Reg.scrivi(4,[1,k]); }`,
},
{
  nome: '5/6 il tasto rilasciato entra nel registro',
  cerca: `  Keys[e.code]=false;`,
  metti: `  Keys[e.code]=false;
  if(Reg.modo===1){ let k=Reg.tasti.indexOf(e.code); if(k<0){ k=Reg.tasti.length; Reg.tasti.push(e.code); } Reg.scrivi(4,[0,k]); }`,
},

/* 6 — la porta di servizio: il banco e il client di rete devono poter
       accendere, leggere, rimettere in scena */
{
  nome: '6/6 __test apre il registro al banco e alla rete',
  cerca: `  semina(n){ SEME.accendi(n); return SEME.s; },`,
  metti: `  semina(n){ SEME.accendi(n); return SEME.s; },
  /* IL REGISTRO DEI COMANDI — la partita in quattro kB.
     registra() prima del via, poi si gioca; nastro() da' il testo da
     mandare in rete; rigioca(testo) lo rimette in scena. Il seme va
     seminato a parte: senza, i comandi giusti danno una partita
     diversa, perche' il caso non e' quello di allora. */
  registra(){ Reg.accendi(); },
  fermaRegistro(){ Reg.spegni(); },
  get registroModo(){ return Reg.modo; },
  get registroRighe(){ return Reg.righe.length; },
  nastro(){ return Reg.serializza(); },
  rigioca(testo){ return Reg.deserializza(testo); },`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-registro.js — ' + ANCORE.length + ' ancoraggi + 1 sostituzione mirata:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  console.log('  · performance.now() -> oraGioco() dentro Touch5 (5 occorrenze)');
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.registro.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

const src = fs.readFileSync(inFile, 'utf8');
let out = src;

/* --- gli ancoraggi --- */
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}

/* =====================================================================
   LA SOSTITUZIONE MIRATA — gli orologi della STORIA DEL GESTO.

   Non «tutti quelli dentro Touch5», che sarebbe una regione di testo e
   quindi una cosa che si sposta: quelli scritti  t:performance.now() ,
   che e' la FORMA di un timestamp messo dentro la storia di un dito.
   Sono cinque, e sono esattamente i cinque che contano:

     ot: e t: in pend[id]   il candidato alla levetta nasce con la sua ora
     hist:[{...t:}] x2      la storia parte dal primo punto
     hist.push({...t:}) x2  e cresce a ogni movimento

   Tutti gli altri performance.now() del gioco non entrano nel gesto: due
   sono il ciclo dei fotogrammi (dove il tempo VERO e' quello giusto),
   uno e' l'animazione di un premio, uno limita la frequenza di una
   lettura di stile, due stanno in una diagnostica dietro un parametro di
   query. Cambiarli sarebbe sbagliato.

   E' la differenza fra ancorare a una posizione e ancorare a un
   significato: la posizione si sposta appena qualcuno aggiunge una
   riga, il significato no.
   ===================================================================== */
const quante = (out.match(/t:performance\.now\(\)/g) || []).length;
if (quante !== 5) {
  console.error('FALLITO: gli orologi della storia del gesto sono ' + quante + ', ne erano attesi 5.');
  console.error('         O la toppa e\' gia\' applicata, o la levetta e\' cambiata piu\' di quanto credo:');
  console.error('         cerca  t:performance.now()  e guarda quali sono comparsi o spariti.');
  process.exit(1);
}
out = out.replace(/t:performance\.now\(\)/g, 't:oraGioco()');

/* --- i controlli --- */
const attesi = [
  ['const Reg = {', 1],
  ['function oraGioco(){', 1],
  ['  Reg.passo();', 1],
  ['registra(){ Reg.accendi(); },', 1],
  ['Touch5[nome] = function(a, b, c){', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));

/* Il registro DEVE nascere prima delle porte che avvolge e prima di
   step(): se `const Reg` stesse dopo, la prima partita morirebbe con un
   errore che nessun banco vedrebbe, perche' i banchi partono a pagina
   gia' caricata. */
const pReg = out.indexOf('const Reg = {');
const pTouch = out.indexOf('const Touch5 = {');
const pStep = out.indexOf('function step(){');
if (!(pReg >= 0 && pReg < pTouch && pReg < pStep))
  rotti.push('il registro non e\' dichiarato prima di Touch5 e di step()');

/* Nella storia del gesto non deve restare un solo orologio vero: se ne
   restasse uno, il replay divergerebbe proprio sul gesto piu' veloce —
   quello in cui la differenza di tempo conta di piu'. */
const restate = (out.match(/t:performance\.now\(\)/g) || []).length;
if (restate !== 0) rotti.push('nella storia del gesto restano ' + restate + ' orologi veri: il replay divergerebbe');
if ((out.match(/t:oraGioco\(\)/g) || []).length !== 5)
  rotti.push('gli orologi virtualizzati sono ' + (out.match(/t:oraGioco\(\)/g) || []).length + ', ne erano attesi 5');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati, ' + quante + ' orologi virtualizzati dentro Touch5');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('');
console.log('LA PROVA:  node strumenti/_q-replay.js --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/'));
