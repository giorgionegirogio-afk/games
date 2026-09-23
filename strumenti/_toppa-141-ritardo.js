/* =====================================================================
   _toppa-141-ritardo.js — I DUE AGGANCI DEL METRO DEL RITARDO
   (voce #141, compito 3)

   Aggiunge al gioco due chiavi di `window.__test`, e nient'altro. Non
   tocca la fisica, non consuma un sorteggio, non cambia l'esito di
   nessuna sequenza di comandi a ritardo spento: `MOTORE_V` resta 2, e il
   banco lo MISURA invece di affermarlo.

   ------------------------------------------------------------------
   1) __test.ritardo(K) — LA CODA DI K TICK DAVANTI ALLE QUATTRO PORTE
   ------------------------------------------------------------------
   Serve a tre cose, e nessuna delle tre e' un capriccio del banco:
     · alla GAMBA B del #141 (i verbi sotto ritardo con dita vere);
     · alla GAMBA C, la prova umana in cieco, che e' l'unica capace di
       pronunciare la parola «ingiocabile» — e che richiede una persona:
       le serve un ritardo vero SENZA RETE DI MEZZO, se no si misura la
       rete invece del gioco;
     · al #145, dove il ritardo fisso D e' il cuore del lockstep. Non e'
       impalcatura da buttare: e' il primo mattone.

   COME. Le quattro porte (Touch5.start/move/chiudi/azzera) sono gia'
   avvolte una volta, dal 27 agosto 2026, dal registratore. Questa coda
   si avvolge PIU' FUORI di quello, e l'ordine e' tutto:

       dito vero -> [coda di K tick] -> [registratore] -> Touch5 vero

   Cosi' il comando si REGISTRA AL TICK IN CUI ESEGUE, non a quello in
   cui il dito lo ha dato. E' l'unica forma onesta: il nastro deve
   raccontare quel che e' SUCCESSO, se no un replay della partita
   ritardata non sarebbe la partita ritardata. Avvolgendo piu' DENTRO si
   sarebbe registrato l'intento e rigiocata una partita che nessuno ha
   giocato.

   L'OROLOGIO E' SUO, e non e' pignoleria: `Reg.tick` avanza solo quando
   il registro e' acceso (`passo()` esce subito se `modo === 0`), e la
   prova umana si gioca a registro SPENTO. Una coda appesa a un orologio
   fermo non scade mai: i comandi entrerebbero e non uscirebbero piu'.

   IN RILETTURA LA CODA NON C'E'. Quando `Reg.modo === 2` comanda il
   nastro, e il nastro porta gia' i comandi al tick in cui devono
   eseguire: accodarli una seconda volta vorrebbe dire ritardare due
   volte. La gamba A trasla il NASTRO, questa coda ritarda il DITO, e le
   due non devono mai sommarsi.

   E LA CODA SI SVUOTA COL RESTO DEI COMANDI. `Reg.azzeraComandi` esiste
   perche' l'origine della levetta sopravviveva a una partita e faceva
   divergere la successiva (grep «I COMANDI SI AZZERANO PRIMA»). Un
   comando accodato e non ancora scaduto e' esattamente la stessa
   malattia, in forma piu' cattiva: arriverebbe dentro la partita DOPO.

   ------------------------------------------------------------------
   2) __test.dita(dx, dy, premi) — IL COMANDO INIETTATO DALLA PORTA VERA
   ------------------------------------------------------------------
   RETTIFICA A EDIZIONI (23 settembre 2026). `strumenti/_q-determinismo.js`
   ha una prova C che dice «con le dita: la stessa sequenza di comandi
   rigiocata deve dare la stessa partita», e la dichiara «la prova che
   riguarda il multigiocatore». Quella prova non ha mai misurato niente:
   chiama `t.dita(...)` dentro un `if (t.dita)` e `__test.dita` NON
   ESISTE — verificato, nessuna chiave `dita` nel blocco `window.__test`.
   Il banco stampava «il gioco non espone __test.dita» in mezzo a dieci
   righe verdi, e chi leggeva «determinismo 10/10» credeva coperta la
   gamba dell'INGRESSO. Da oggi la chiave c'e' e la prova misura.

   PASSA DALLE PORTE VERE, non da `Touch5.stick`. Scrivere dentro lo
   stato della levetta sarebbe piu' corto e misurerebbe una cosa che
   nessun dito puo' fare: il nastro non lo vedrebbe, le quattro porte non
   lo vedrebbero, e la coda del ritardo nemmeno. Qui si posa un dito
   dove un pollice lo poserebbe e lo si sposta, pixel interi compresi.

   `premi` TENUTO fra un fotogramma e l'altro e' una pressione TENUTA:
   il disco grande si preme sul fronte di salita e si rilascia su quello
   di discesa. E' il solo modo di provare la CARICA del tiro, che e' la
   finestra dolce piu' fragile sotto ritardo.

   uso: node strumenti/_toppa-141-ritardo.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------
   1. LA CODA, avvolta PIU' FUORI del registratore.
   L'ancoraggio e' la chiusura dell'avvolgimento delle quattro porte:
   dipende solo dai nomi, che non cambiano da mesi, ed e' esattamente la
   dottrina che quel blocco dichiara di se' («l'avvolgimento sta QUI,
   fuori, e non dentro i quattro metodi»).
   ------------------------------------------------------------------ */
cambio('1. la coda del ritardo davanti alle quattro porte',
`      if(Reg.modo === 1){
        if(tipo === 0 || tipo === 1) Reg.scrivi(tipo, [Reg.idDi(a), b, c]);
        else if(tipo === 2) Reg.scrivi(2, [Reg.idDi(a), b ? 1 : 0]);
        else Reg.scrivi(3, []);
      }
      return vero.call(this, a, b, c);
    };
  }
})();`,
`      if(Reg.modo === 1){
        if(tipo === 0 || tipo === 1) Reg.scrivi(tipo, [Reg.idDi(a), b, c]);
        else if(tipo === 2) Reg.scrivi(2, [Reg.idDi(a), b ? 1 : 0]);
        else Reg.scrivi(3, []);
      }
      return vero.call(this, a, b, c);
    };
  }
})();

/* =====================================================================
   IL RITARDO D'INGRESSO, DAVANTI ALLE QUATTRO PORTE (voce #141).

   Un comando dato al tick T esegue al tick T+K. A K=0 questo blocco non
   fa niente: un confronto e un ritorno, zero sorteggi, zero rami nuovi
   nella fisica. MOTORE_V resta 2 apposta, e un banco lo verifica.

   L'AVVOLGIMENTO STA PIU' FUORI DEL REGISTRATORE, e l'ordine e' tutto:

       dito -> [questa coda] -> [registratore] -> Touch5 vero

   Cosi' il comando si REGISTRA AL TICK IN CUI ESEGUE, non a quello in
   cui il dito lo ha dato. Il nastro deve raccontare quel che e'
   SUCCESSO: avvolgendo piu' dentro si registrerebbe l'INTENTO, e il
   replay di una partita ritardata non sarebbe quella partita.

   L'OROLOGIO E' SUO. Reg.tick avanza solo a registro acceso (passo()
   esce subito se modo === 0), e la prova umana si gioca a registro
   spento: una coda appesa a un orologio fermo non scade mai.

   IN RILETTURA LA CODA NON C'E'. Col nastro in mano (modo 2) i comandi
   portano gia' il tick in cui devono eseguire; accodarli sarebbe
   ritardare due volte. Il banco della gamba A trasla il NASTRO, questo
   ritarda il DITO, e le due cose non si sommano mai.
   ===================================================================== */
const Ritardo = {
  K: 0,            /* tick di ritardo; 0 = spento, e allora questo blocco e' inerte */
  tick: 0,         /* orologio proprio: cammina anche a registro spento */
  coda: [],        /* [tickScadenza, nomePorta, questo, a, b, c] */
  porte: {},       /* i quattro metodi COME ERANO prima di questo avvolgimento */

  imposta(k){
    k = Math.max(0, Math.round(+k || 0));
    /* i comandi gia' in coda appartengono al ritardo di PRIMA: cambiare
       K con la coda piena mescolerebbe due ritardi in una partita sola */
    this.coda.length = 0;
    this.K = k;
    return this.K;
  },

  /* si chiama all'inizio di ogni Reg.passo(), cioe' all'inizio di ogni
     step(): e' lo stesso istante in cui il riproduttore del nastro
     rimette in scena i suoi comandi, e deve esserlo — un comando
     ritardato e un comando rigiocato devono arrivare al motore dalla
     stessa porta e nello stesso punto del fotogramma */
  passo(){
    this.tick++;
    if(this.K <= 0 || !this.coda.length) return;
    let n = 0;
    while(n < this.coda.length && this.coda[n][0] <= this.tick) n++;
    if(!n) return;
    const scaduti = this.coda.splice(0, n);
    for(const r of scaduti){
      const f = this.porte[r[1]];
      /* un comando che non si puo' rigiocare non ferma la partita: la
         stessa legge di Reg.passo, e per la stessa ragione */
      if(f) try{ f.call(r[2], r[3], r[4], r[5]); }catch(e){}
    }
  },

  azzera(){ this.coda.length = 0; this.tick = 0; },
};

(function(){
  const nomi = ['start', 'move', 'chiudi', 'azzera'];
  for(const nome of nomi){
    const vero = Touch5[nome];
    if(typeof vero !== 'function') continue;
    Ritardo.porte[nome] = vero;
    Touch5[nome] = function(a, b, c){
      /* a ritardo spento, e col nastro in mano, questo non esiste */
      if(Ritardo.K <= 0 || Reg.modo === 2) return vero.call(this, a, b, c);
      Ritardo.coda.push([Ritardo.tick + Ritardo.K, nome, this, a, b, c]);
      return undefined;
    };
  }

  /* L'OROLOGIO E LO SVUOTAMENTO, appesi a Reg.passo dall'esterno, con la
     stessa dottrina dell'avvolgimento qui sopra: dipende da un nome, non
     da un corpo. La coda si svuota PRIMA che passo() esegua i comandi
     del nastro, perche' a K=0 i due percorsi devono restare
     indistinguibili. */
  const veroPasso = Reg.passo;
  Reg.passo = function(){
    Ritardo.passo();
    return veroPasso.call(this);
  };

  /* E LA CODA SI SVUOTA COL RESTO DEI COMANDI. Reg.azzeraComandi esiste
     perche' l'origine della levetta sopravviveva a una partita e faceva
     divergere la successiva (grep «I COMANDI SI AZZERANO PRIMA»). Un
     comando accodato e non ancora scaduto e' la stessa malattia in forma
     peggiore: arriverebbe dentro la partita DOPO, e nessuno saprebbe da
     dove viene. */
  const veroAzzeraComandi = Reg.azzeraComandi;
  Reg.azzeraComandi = function(){
    Ritardo.azzera();
    return veroAzzeraComandi.call(this);
  };
})();

/* LE DITA DEL BANCO. Stato del dito virtuale: due identificativi che
   crescono a ogni rilascio, come fa il copione delle dita di
   _q-sfida.js, perche' due tocchi diversi non condividano mai un id. */
const DITA = { id: 7001, idB: 7002, giu: false, premuto: false };`);

/* ------------------------------------------------------------------
   2. LE DUE CHIAVI IN window.__test.
   ------------------------------------------------------------------ */
cambio('2. __test.ritardo e __test.dita',
`window.__test = {
  get state(){ return G.scene; },`,
`window.__test = {
  get state(){ return G.scene; },
  /* =====================================================================
     IL RITARDO D'INGRESSO, APERTO AL BANCO E ALL'UOMO (voce #141).

     ritardo(K) accoda i comandi di K tick SENZA RETE DI MEZZO. Serve
     alla gamba B (i verbi con dita vere), alla gamba C (la prova umana
     in cieco: l'uomo deve sentire il ritardo del GIOCO, non quello di
     una rete che non c'e' ancora) e al #145, dove il ritardo fisso D e'
     il cuore del lockstep.
     ritardo(0) lo spegne, e a ritardo spento il gioco e' identico al
     bit a quello di prima: MOTORE_V resta 2.
     ritardoStato serve al banco per sapere se il ritardo e' davvero
     acceso invece di crederci — una coda che non accoda e' precisamente
     il falso che _q-ritardo-falsi.js e' fatto per condannare.
     ===================================================================== */
  ritardo(K){ return Ritardo.imposta(K); },
  get ritardoStato(){ return { K: Ritardo.K, tick: Ritardo.tick, coda: Ritardo.coda.length }; },
  /* =====================================================================
     UN DITO, INIETTATO DALLA PORTA VERA (voce #141).

     dx, dy: la direzione della levetta, in -1..+1. Si posa un dito nella
     meta' sinistra e lo si sposta di dx,dy volte la corsa piena
     (STICK_FULL = 46 px): la stessa geometria che legge humanMove.
     premi: il disco grande. TENUTO fra un fotogramma e l'altro e' una
     pressione TENUTA — si preme sul fronte di salita e si rilascia su
     quello di discesa — perche' la CARICA del tiro e' la finestra dolce
     piu' fragile sotto ritardo, e un impulso di un fotogramma non la
     proverebbe mai.
     dita(null) alza tutto.

     PASSA DALLE QUATTRO PORTE, non da Touch5.stick. Scrivere dentro lo
     stato della levetta sarebbe piu' corto e misurerebbe una cosa che
     nessun dito puo' fare: il nastro non la vedrebbe, e nemmeno la coda
     del ritardo qui sopra.
     ===================================================================== */
  dita(dx, dy, premi){
    if(dx === null || dx === undefined){
      if(DITA.giu){ Touch5.chiudi(DITA.id, false); DITA.giu = false; DITA.id += 2; }
      if(DITA.premuto){ Touch5.chiudi(DITA.idB, false); DITA.premuto = false; DITA.idB += 2; }
      return { giu:false, premuto:false };
    }
    const LX = Math.round(innerWidth * 0.20), LY = Math.round(innerHeight * 0.68);
    const R = 46;                       /* STICK_FULL: la corsa piena della levetta */
    const x = Math.round(LX + (+dx || 0) * R), y = Math.round(LY + (+dy || 0) * R);
    if(!DITA.giu){ Touch5.start(DITA.id, LX, LY); DITA.giu = true; }
    Touch5.move(DITA.id, x, y);
    const b = touchBtnLayout(0)[0];
    if(premi && !DITA.premuto && b){
      Touch5.start(DITA.idB, Math.round(b.x), Math.round(b.y)); DITA.premuto = true;
    }else if(!premi && DITA.premuto){
      Touch5.chiudi(DITA.idB, false); DITA.premuto = false; DITA.idB += 2;
    }
    return { giu:DITA.giu, premuto:DITA.premuto, x:x, y:y };
  },`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-141-ritardo.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve esattamente 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
