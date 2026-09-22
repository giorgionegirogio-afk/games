/* =====================================================================
   _toppa-139-finestra.js — LA FINESTRA CHE CAMBIA NON ACCUSA PIU'
   (voce #139, compito 2).

   IL DIFETTO, trovato dalla revisione d'insieme dell'onda D e riprodotto
   due volte (fuori/_sonda-139-finestra.js): la riga di tipo 10 — la
   misura della finestra, cura del #133 — si scrive UNA VOLTA SOLA, in
   Sfida.gioca, subito prima di startMatch. Intanto
   `addEventListener('resize', resize)` resta vivo per tutta la partita e
   ricuoce SCALE/OX/OY, e checkOrientation ferma solo il PORTRAIT. Quindi
   la guardia del giudice verifica che il nastro e il giudice DICANO LA
   STESSA COSA, non che quella cosa SIA STATA VERA per tutta la partita.

   MISURATO (due partite identiche, stesso seme 20260801, stesso copione
   di dita, giudicate sulla stessa terza pagina a 915x412):
     finestra FERMA    dichiara 3-4, riga 10 915x412 -> TORNA     (3-4 in 8819 passi)
     finestra CAMBIA   dichiara 1-2, riga 10 915x412 -> NON TORNA (3-4 in 8631 passi)
   Il secondo e' ONESTO: ha giocato 1-2 e il telefono gli ha fatto
   comparire la barra dell'URL a meta' partita (915x412 -> 915x352 al
   fotogramma 1200, SCALE 0,7067 -> 0,6017, OX 51 -> 112). NON TORNA e'
   l'unico verdetto che muove punti: toglie i punti a DUE persone, alza
   un sospetto che non decade mai, e chiude la riga per sempre
   (`and verificata = 0`).

   LA CURA, in due meta' che servono tutt'e due — una riga che nessuno
   guarda e' un commento, e chi guarda una riga che non c'e' non vede
   niente:
     1. Reg.schermo(w,h) scrive una riga di tipo 10 a OGNI CAMBIO di
        misura mentre il registro sta scrivendo, e resize() la chiama;
     2. vagliaNastro si astiene — INCOMPLETO / schermo-cambiato — su
        qualunque nastro porti piu' di una misura DISTINTA.
   Astensione, non accusa: e' la direzione di tutta l'onda D.

   E IL RESIZE A RAFFICA NON RIEMPIE IL NASTRO. Due guardie in fila:
   quella che resize() ha gia' («se la misura non e' cambiata non si
   ricuoce niente») e quella di Reg.schermo (l'ultima misura scritta),
   che serve perche' resize() gira anche a finestra immutata quando
   RESIZE_FORZA e' acceso — lo accende setTaglia. Costo: una riga di
   cinque numeri per misura distinta, contro un tetto di 40.000 righe.

   I NASTRI VECCHI NON SI ROMPONO: ne portano UNA di righe di tipo 10,
   cioe' una misura distinta, quindi si giudicano esattamente come oggi.
   La prima riga resta dov'era — Sfida.gioca chiama la porta nuova nello
   stesso punto — quindi un nastro a finestra ferma e' identico byte per
   byte a quello di ieri.

   uso:  node strumenti/_toppa-139-finestra.js --out fuori/curato.html
         node strumenti/_toppa-139-finestra.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const dentro = process.argv.includes('--dentro');
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = dentro ? inFile : path.resolve(RADICE, arg('out', 'fuori/gioco-139-finestra.html'));

/* ================================================================== 1 */
/* LA MEMORIA DELLA MISURA, dentro al registro e azzerata con lui */
const A1 = `  troncato: false,

  accendi(){
    this.modo = 1; this.righe = []; this.i = 0; this.tick = 0;
    this.t0 = performance.now(); this.ids = new Map(); this.idProx = 0; this.tasti = [];
    this.duelli = []; this.iDuello = 0; this.troncato = false;
    this.azzeraComandi();
  },`;
const B1 = `  troncato: false,

  /* L'ULTIMA MISURA DI FINESTRA SCRITTA NEL NASTRO (voce #139), o null se
     in questo nastro non ce n'e' ancora nessuna. La legge Reg.schermo,
     che e' la sola a scriverla: serve a non rimettere nel nastro una
     misura che il nastro dice gia'. */
  ultimoSchermo: null,

  accendi(){
    this.modo = 1; this.righe = []; this.i = 0; this.tick = 0;
    this.t0 = performance.now(); this.ids = new Map(); this.idProx = 0; this.tasti = [];
    this.duelli = []; this.iDuello = 0; this.troncato = false;
    this.ultimoSchermo = null;
    this.azzeraComandi();
  },`;

/* ================================================================== 2 */
/* LA PORTA: una riga di tipo 10 a ogni CAMBIO, e solo a ogni cambio */
const A2 = `    this.righe.push([this.tick, tipo, Math.round(performance.now() - this.t0)].concat(arg));
  },

  /* IL PASSO. Si chiama all'inizio di ogni step(): fa avanzare l'orologio`;
const B2 = `    this.righe.push([this.tick, tipo, Math.round(performance.now() - this.t0)].concat(arg));
  },

  /* =====================================================================
     LA MISURA DELLA FINESTRA, A OGNI CAMBIO (voce #139).

     Il #133 aveva scoperto che i tocchi del nastro sono in coordinate di
     SCHERMO e aveva messo la misura nel nastro — ma UNA VOLTA SOLA, in
     Sfida.gioca, prima di startMatch. Intanto il gestore di 'resize'
     resta vivo per tutta la partita e ricuoce SCALE/OX/OY, e
     checkOrientation ferma solo il PORTRAIT: una finestra che si stringe
     restando orizzontale (la barra dell'URL di un telefono, 56-90 px)
     lasciava nel nastro la misura di PARTENZA. Il giudice la trovava
     giusta, rigiocava su un motore diverso da quello vero, e diceva NON
     TORNA a un innocente — l'unico verdetto che muove punti (misurato,
     voce #139: 1-2 dichiarato, 3-4 rigiocato).

     PERCHE' UNA PORTA E NON UN Reg.scrivi(10, ...) SPARSO IN DUE POSTI:
     la guardia della misura deve stare in un posto solo, se no i due
     capi — chi comincia la partita e chi la ridimensiona — possono
     scrivere due volte la stessa cosa.

     E IL RESIZE A RAFFICA NON RIEMPIE IL NASTRO. Il commento di resize()
     lo dice da se': «la barra del browser che compare e sparisce scatena
     resize a raffica». Quella guardia li' ferma gli eventi a misura
     immutata, questa ferma i giri in cui resize() ricuoce lo stesso per
     via di RESIZE_FORZA (lo accende setTaglia). Restano solo i CAMBI
     veri: una riga di cinque numeri ciascuno, contro un tetto di 40.000
     righe.
     ===================================================================== */
  schermo(w, h){
    if(this.modo !== 1) return;
    w = w|0; h = h|0;
    if(this.ultimoSchermo && this.ultimoSchermo[0] === w && this.ultimoSchermo[1] === h) return;
    this.ultimoSchermo = [w, h];
    this.scrivi(10, [w, h]);
  },

  /* IL PASSO. Si chiama all'inizio di ogni step(): fa avanzare l'orologio`;

/* ================================================================== 3 */
/* resize() lo dice al registro, dopo aver ricalcolato tutto */
const A3 = `  buildFieldTex();
  buildVignette();
  duelSporca();                 // le fasce del duello cambiano altezza
  /* dopo un cambio di misura il fermo-immagine di fine partita va rifatto */
  if(G.frozen && typeof congelaCampo==='function') congelaCampo();
}`;
const B3 = `  buildFieldTex();
  buildVignette();
  duelSporca();                 // le fasce del duello cambiano altezza
  /* dopo un cambio di misura il fermo-immagine di fine partita va rifatto */
  if(G.frozen && typeof congelaCampo==='function') congelaCampo();
  /* E IL NASTRO LO VIENE A SAPERE (voce #139). Qui, in fondo, quando
     SCALE/OX/OY e i pulsanti sono gia' quelli nuovi: da questo istante in
     poi gli stessi numeri di tocco premono un altro punto del campo, e un
     nastro che non lo dicesse farebbe accusare un innocente. Reg.schermo
     filtra da se' — fuori da una registrazione non scrive niente, e a
     misura immutata nemmeno — quindi qui non serve nessuna guardia.
     Il try c'e' perche' resize() e' chiamata anche mentre la pagina si
     monta, e non deve poter morire per colpa del registro. */
  try{ Reg.schermo(VW, VH); }catch(e){}
}`;

/* ================================================================== 4 */
/* Sfida.gioca passa dalla porta nuova, nello stesso punto di prima */
const A4 = `       Una riga in piu' di due numeri, e chi rilegge puo' dire la causa
       vera invece di dare la colpa alla rosa cresciuta di un altro.
       ===================================================================== */
    Reg.scrivi(10, [innerWidth|0, innerHeight|0]);`;
const B4 = `       Una riga in piu' di due numeri, e chi rilegge puo' dire la causa
       vera invece di dare la colpa alla rosa cresciuta di un altro.

       RETTIFICA A EDIZIONI (22 settembre 2026, voce #139). Questa non e'
       piu' l'unica riga di tipo 10 del nastro, ed e' la cura di un
       CRITICO: una sola riga diceva la misura di PARTENZA e taceva ogni
       cambio successivo, cosi' il giudice trovava la misura giusta e
       rigiocava una partita che non era quella. Adesso passa dalla porta
       Reg.schermo, che e' la stessa che chiama resize(): qui scrive,
       perche' e' la prima misura del nastro; dopo scrive chiunque muova
       la finestra. La riga resta in questo punto esatto — subito dopo le
       due rose — quindi un nastro a finestra ferma e' identico a quello
       di ieri.
       ===================================================================== */
    Reg.schermo(innerWidth|0, innerHeight|0);`;

/* ================================================================== 5 */
/* le misure DISTINTE del nastro, e non piu' soltanto la prima */
const A5 = `/* LO SCHERMO SCRITTO NEL NASTRO APPENA LETTO (voce #133, compito 3), o
   null se quel nastro e' di prima della cura. Lo leggono in due: il
   giudice, che su uno schermo diverso si rifiuta, e chiudiSfida, che
   sullo stesso scarto sceglie quale causa dire. Una funzione sola
   perche' i due capi devono guardare la stessa cosa. */
function schermoDelNastro(){
  try{
    for(const r of Reg.righe) if(r[1] === 10) return [r[3]|0, r[4]|0];
  }catch(e){}
  return null;
}`;
const B5 = `/* =====================================================================
   LE MISURE DI FINESTRA SCRITTE NEL NASTRO APPENA LETTO (voce #133,
   compito 3; riscritta al plurale dalla voce #139).

   Tornano le misure DISTINTE, in ordine di nastro: nessuna se quel
   nastro e' di prima del #133, una se la finestra non si e' mai mossa,
   due o piu' se si e' mossa. DISTINTE e non «tutte le righe»: una
   finestra che va e torna (412 -> 352 -> 412) lascia tre righe e due
   misure, ed e' il numero delle MISURE che dice se il nastro si puo'
   rigiocare.

   Le leggono in due: il giudice, che si rifiuta, e chiudiSfida, che
   sullo stesso scarto sceglie quale causa dire. Una funzione sola
   perche' i due capi devono guardare la stessa cosa.
   ===================================================================== */
function schermiDelNastro(){
  const v = [];
  try{
    for(const r of Reg.righe){
      if(r[1] !== 10) continue;
      const w = r[3]|0, h = r[4]|0;
      let c = false;
      for(const x of v) if(x[0] === w && x[1] === h){ c = true; break; }
      if(!c) v.push([w, h]);
    }
  }catch(e){}
  return v;
}
/* LA PRIMA, che e' la misura con cui quella partita e' cominciata. Chi
   raggruppa i nastri per aprire una finestra sola (la staffetta, voce
   #138) chiede questa. */
function schermoDelNastro(){
  const v = schermiDelNastro();
  return v.length ? v[0] : null;
}`;

/* ================================================================== 6 */
const A6 = `                rosaAtt:null, rosaDif:null, carDif:undefined, schermo:null };`;
const B6 = `                rosaAtt:null, rosaDif:null, carDif:undefined, schermo:null,
                schermi:null };`;

/* ================================================================== 7 */
/* il rifiuto nuovo, PRIMA di schermo-diverso */
const A7 = `  const sc = schermoDelNastro();
  if(!sc) return no('INCOMPLETO','schermo-ignoto');
  out.schermo = sc;
  if(sc[0] !== (innerWidth|0) || sc[1] !== (innerHeight|0)) return no('INCOMPLETO','schermo-diverso');
  return out;
}`;
const B7 = `  const sc = schermiDelNastro();
  if(!sc.length) return no('INCOMPLETO','schermo-ignoto');
  out.schermo = sc[0];
  out.schermi = sc;
  /* =====================================================================
     E DEVE ESSERE STATO QUELLO PER TUTTA LA PARTITA (voce #139).

     E' il difetto che la revisione d'insieme dell'onda D ha trovato, ed
     era un CRITICO: il controllo qui sotto verifica che il nastro e chi
     lo legge DICANO LA STESSA COSA, non che quella cosa SIA STATA VERA
     dall'inizio alla fine. Una finestra che si stringe a meta' partita
     restando orizzontale — la barra dell'URL di un telefono, e in un
     browser di telefono e' il caso normale — lasciava nel nastro la
     misura di PARTENZA: il giudice la trovava identica alla sua,
     procedeva, e diceva NON TORNA a un innocente. Misurato: 1-2
     dichiarato, 3-4 rigiocato, punti tolti a due persone e sospetto che
     non decade mai.

     PRIMA DI schermo-diverso, ED E' L'ORDINE GIUSTO: uno schermo diverso
     si ripara aprendo la finestra che il nastro chiede (e' quel che fa
     la staffetta, voce #138), uno schermo CAMBIATO non si ripara in
     nessuna finestra — e' una proprieta' del nastro, non di chi lo
     legge. Dire la causa riparabile dove quella vera non lo e'
     manderebbe la staffetta ad aprire finestre per sempre.

     E COSTA: un nastro che oggi dice TORNA con dodici pixel di scarto
     (misurato: la partita non si muove di un passo) domani dira' «non lo
     so». Si paga volentieri. Un onesto non confermato resta in lista e
     non perde niente; un onesto accusato perde i punti, il sospetto e la
     riga per sempre. E una soglia in pixel sarebbe un'opinione su un
     motore caotico: dodici non spostano niente, settanta spostano tutto,
     e dove passi il confine non lo sa nessuno. */
  if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');
  if(sc[0][0] !== (innerWidth|0) || sc[0][1] !== (innerHeight|0)) return no('INCOMPLETO','schermo-diverso');
  return out;
}`;

/* ================================================================== 8 */
/* il sigillo porta anche la lista, se no la frase non sa che dire */
const A8 = `                sigillo:{ id:id|0, giudicabile:!vag.verdetto,
                          verdetto:vag.verdetto || '', causa:vag.causa || '',
                          schermo:vag.schermo || null } };`;
const B8 = `                sigillo:{ id:id|0, giudicabile:!vag.verdetto,
                          verdetto:vag.verdetto || '', causa:vag.causa || '',
                          schermo:vag.schermo || null,
                          /* LE MISURE, TUTTE (voce #139): con una sola la
                             frase dice «e il tuo e' di», con due dice «e'
                             cambiata durante la partita». */
                          schermi:vag.schermi || null } };`;

/* ================================================================== 9 */
const A9 = `  causaSigillo(g){
    const c = g && g.causa;
    if(c === 'schermo-diverso'){`;
const B9 = `  causaSigillo(g){
    const c = g && g.causa;
    /* LA FINESTRA CHE SI E' MOSSA A META' PARTITA (voce #139). Non e'
       «uno schermo diverso dal tuo»: e' un nastro che nessuna finestra
       puo' rigiocare, e la frase deve dirlo o chi legge andra' a cercare
       il telefono giusto per sempre. */
    if(c === 'schermo-cambiato'){
      const v = (g && g.schermi) || [];
      return 'la finestra di chi ha giocato è cambiata durante la partita (' +
             (v.length ? v.map(s => (s[0]|0) + 'x' + (s[1]|0)).join(', poi ') : 'due misure diverse') +
             '), e i comandi del nastro sono in coordinate di schermo: su nessuna ' +
             'finestra rigiocarli rifà quella partita.';
    }
    if(c === 'schermo-diverso'){`;

/* ================================================================= 10 */
const A10 = `      const scN = schermoDelNastro();
      const altroSchermo = !!(scN && (scN[0] !== (innerWidth|0) || scN[1] !== (innerHeight|0)));
      toast('fischietto','NON ERA QUESTA LA PARTITA',
            'Rigiocata finisce ' + ga + '-' + gd + ', ma quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '.');
      try{
        Sfida.stato(altroSchermo
          ? ('Il replay non ha ricostruito la partita: è finito ' + ga + '-' + gd +
             ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. È stata giocata su uno schermo di ' +
             scN[0] + 'x' + scN[1] + ' e il tuo è di ' + (innerWidth|0) + 'x' + (innerHeight|0) +
             ': i comandi sono gli stessi, ma su uno schermo diverso finiscono in un altro punto del campo.')
          : ('Il replay non ha ricostruito la partita: è finito ' + ga + '-' + gd +
             ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. La squadra di chi ti ha ' +
             'attaccato è cambiata da allora, e il server ne tiene una copia sola, quella di oggi.'), true);
      }catch(e){}`;
const B10 = `      /* TRE CAUSE, E SI DICE QUELLA VERA (voce #139: la terza). La
         seconda — «schermo diverso dal tuo» — manderebbe chi legge a
         cercare il telefono della misura giusta, e per un nastro che ha
         cambiato finestra a meta' partita quel telefono non esiste. */
      const scL = schermiDelNastro();
      const scN = scL.length ? scL[0] : null;
      const cambiato = scL.length > 1;
      const altroSchermo = !cambiato && !!(scN && (scN[0] !== (innerWidth|0) || scN[1] !== (innerHeight|0)));
      toast('fischietto','NON ERA QUESTA LA PARTITA',
            'Rigiocata finisce ' + ga + '-' + gd + ', ma quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '.');
      try{
        const coda = cambiato
          ? ('La finestra di chi ha giocato è cambiata durante la partita (' +
             scL.map(s => (s[0]|0) + 'x' + (s[1]|0)).join(', poi ') +
             '): i comandi sono gli stessi, ma da quel momento in poi finiscono in un altro punto del campo.')
          : altroSchermo
          ? ('È stata giocata su uno schermo di ' + scN[0] + 'x' + scN[1] + ' e il tuo è di ' +
             (innerWidth|0) + 'x' + (innerHeight|0) +
             ': i comandi sono gli stessi, ma su uno schermo diverso finiscono in un altro punto del campo.')
          : ('La squadra di chi ti ha attaccato è cambiata da allora, e il server ne tiene ' +
             'una copia sola, quella di oggi.');
        Sfida.stato('Il replay non ha ricostruito la partita: è finito ' + ga + '-' + gd +
                    ' e quella vera era ' + S.atteso[0] + '-' + S.atteso[1] + '. ' + coda, true);
      }catch(e){}`;

/* ================================================================= 11 */
/* il commento del formato diceva «una volta sola»: non e' piu' vero */
const A11 = `      } else if(tipo === 10){
        /* LO SCHERMO DI CHI HA REGISTRATO (voce #133, compito 3). Due
           numeri, una volta sola, scritti accanto alle due rose. Il`;
const B11 = `      } else if(tipo === 10){
        /* LO SCHERMO DI CHI HA REGISTRATO (voce #133, compito 3; e non
           piu' «una volta sola» dalla voce #139: una per CAMBIO di
           misura, grep Reg.schermo). Due numeri accanto alle due rose. Il`;

/* ================================================================= 12 */
/* quel che il giudice RESTITUISCE quando si rifiuta: una finestra da
   riaprire se ce n'e' una, e le due misure se non ce n'e' nessuna */
const A12 = `    return dico(vag.verdetto, vag.causa, Object.assign({ motoreV:motoreV, righe:righe },
                vag.causa === 'schermo-diverso' ? { schermo:vag.schermo } : {}));`;
const B12 = `    /* LO SCHERMO SI RESTITUISCE SOLO QUANDO SERVE A QUALCOSA (voce
       #139). Su schermo-diverso c'e' una finestra da riaprire, e chi
       chiama la riapre; su schermo-cambiato NON CE N'E' NESSUNA — dare
       lo stesso campo manderebbe la staffetta ad aprire per sempre
       finestre che non possono aiutarla. Al suo posto vanno le misure,
       tutte: il referto dice la verita' senza promettere una cura. */
    return dico(vag.verdetto, vag.causa, Object.assign({ motoreV:motoreV, righe:righe },
                vag.causa === 'schermo-diverso' ? { schermo:vag.schermo } : {},
                vag.causa === 'schermo-cambiato' ? { schermi:vag.schermi } : {}));`;

/* ------------------------------------------------------------------ */
const COPPIE = [
  [A1, B1, 'Reg: la memoria della misura'],
  [A2, B2, 'Reg.schermo: la porta'],
  [A3, B3, 'resize(): la chiamata'],
  [A4, B4, 'Sfida.gioca: la prima misura passa dalla porta'],
  [A5, B5, 'schermiDelNastro: le misure distinte'],
  [A6, B6, 'vagliaNastro: il campo schermi'],
  [A7, B7, 'vagliaNastro: il rifiuto schermo-cambiato'],
  [A8, B8, 'il sigillo porta le misure'],
  [A9, B9, 'causaSigillo: la frase della finestra mossa'],
  [A10, B10, 'chiudiSfida: la terza causa'],
  [A11, B11, 'il commento del formato, rettificato'],
  [A12, B12, 'giudica: le misure al posto della finestra da riaprire'],
];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
for (const [a, b, nome] of COPPIE) {
  const n = out.split(a).length - 1;
  if (n !== 1) {
    console.error('FALLITO su «' + nome + '»: l\'ancora non si trova esattamente una volta (trovata ' + n + ').');
    process.exit(1);
  }
  out = out.replace(a, b);
}

const attesi = [
  ['  schermo(w, h){', 1],
  ['    this.ultimoSchermo = null;', 1],
  ['  try{ Reg.schermo(VW, VH); }catch(e){}', 1],
  ['    Reg.schermo(innerWidth|0, innerHeight|0);', 1],
  ['function schermiDelNastro(){', 1],
  ['function schermoDelNastro(){', 1],
  ["if(sc.length > 1) return no('INCOMPLETO','schermo-cambiato');", 1],
  ["if(sc[0][0] !== (innerWidth|0) || sc[0][1] !== (innerHeight|0)) return no('INCOMPLETO','schermo-diverso');", 1],
  ["if(!sc.length) return no('INCOMPLETO','schermo-ignoto');", 1],
  ["if(c === 'schermo-cambiato'){", 1],
  ['const cambiato = scL.length > 1;', 1],
  ["vag.causa === 'schermo-cambiato' ? { schermi:vag.schermi } : {}));", 1],
  /* quel che NON deve essere cambiato */
  ['const MOTORE_V = 2;', 1],
  ['Reg.scrivi(10, [innerWidth|0, innerHeight|0]);', 0],
  ['function giudica(nastro, atteso, opz){', 1],
  ["pezzi.push(dT + ',10,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));", 1],
  ['else if(tipo === 10)  this.righe.push([tick, 10, ms, v[3], v[4]]);', 1],
  ["if(c === 'schermo-ignoto')    return 'il nastro non dice su che schermo è stata giocata.';", 1],
];
const rotti = attesi.filter(([s, k]) => (out.split(s).length - 1) !== k)
  .map(([s, k]) => s + ' atteso ' + k + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo le sostituzioni:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  la finestra che cambia adesso astiene il giudice: ' + COPPIE.length +
            ' ancore, +' + (out.length - src.length) + ' byte');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    prova:  node strumenti/_q-finestra.js' + (dentro ? '' : ' --gioco ' + path.relative(RADICE, outFile).replace(/\\/g, '/')));
