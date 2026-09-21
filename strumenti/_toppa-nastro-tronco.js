/* =====================================================================
   _toppa-nastro-tronco.js — IL NASTRO DICHIARA LA PROPRIA TRONCATURA
   (voce #132, compito 4). Sei ancore.

   IL DIFETTO. Reg.scrivi si ferma a 40.000 righe IN SILENZIO (:13419).
   Un nastro troncato e' indistinguibile da uno intero, e in rilettura i
   comandi finiscono a meta' partita: il punteggio non torna e il
   confronto di fine replay da' la colpa alla rosa cresciuta di chi ha
   attaccato. Innocente, accusato.

   E IL TETTO NON E' LONTANO. Il registro scrive una riga per dito per
   fotogramma — MISURATO (strumenti/_sonda-132-canali.js): 1,00 con un
   dito, 3,01 con tre, 6,01 con sei, 10,02 con dieci — quindi arriva a
   663 s con un dito ma a 111 s con sei e a 67 s con dieci. Una sfida
   dura 90 s piu' 40 di golden goal piu' la serie dal dischetto: con sei
   dita appoggiate sullo schermo il tetto cade DENTRO una partita onesta.

   L'ALTRA META': un nastro VUOTO passava. Sfida.guarda faceva
   `let righe = testo ? 0 : -1`, e un testo non vuoto ma senza comandi
   (`1|2||`) da' righe === 0, che non e' < 0.

   LA CURA. Riga di tipo 9, senza argomenti, tre caratteri, scritta UNA
   volta quando il tetto si tocca; e due rifiuti in piu' in Sfida.guarda,
   tutti e due con la causa VERA. L'esito della partita si manda lo
   stesso: il punteggio e' quello che e' successo, e non lo decide il
   nastro. E' il REPLAY che si rifiuta — la stessa scelta gia' presa due
   volte in quella funzione (motore diverso, marchio di tipo 5): meglio
   non mostrarla che mostrarne un'altra.

   FUORI PERIMETRO: alzare il tetto. Quarantamila righe sono una guardia
   contro un ciclo, non una taratura, e sceglierne un'altra vorrebbe dire
   misurare il peso del nastro in rete. Qui si rende la troncatura
   VISIBILE, che e' il difetto.

   uso:  node strumenti/_toppa-nastro-tronco.js --out fuori/x.html
         node strumenti/_toppa-nastro-tronco.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/nastro-tronco.html'));

const ANCORE = [

/* 1 — la bandiera, e il suo azzeramento dove un nastro comincia */
{
  nome: '1/6 Reg.troncato e il suo azzeramento',
  cerca:
`  accendi(){
    this.modo = 1; this.righe = []; this.i = 0; this.tick = 0;
    this.t0 = performance.now(); this.ids = new Map(); this.idProx = 0; this.tasti = [];
    this.duelli = []; this.iDuello = 0;
    this.azzeraComandi();
  },`,
  metti:
`  /* IL NASTRO SA DI ESSERE STATO TAGLIATO (voce #132, compito 4): vero
     quando il tetto di scrivi() e' stato toccato — da questa partita se
     si sta registrando, o dal nastro appena letto se si sta rileggendo. */
  troncato: false,

  accendi(){
    this.modo = 1; this.righe = []; this.i = 0; this.tick = 0;
    this.t0 = performance.now(); this.ids = new Map(); this.idProx = 0; this.tasti = [];
    this.duelli = []; this.iDuello = 0; this.troncato = false;
    this.azzeraComandi();
  },`,
},

/* 2 — il tetto smette di tacere */
{
  nome: '2/6 scrivi() marca la troncatura',
  cerca:
`  scrivi(tipo, arg){
    if(this.modo !== 1) return;
    if(this.righe.length > 40000) return;   /* una partita non ha 40.000 comandi: se li ha, e' un ciclo */
    this.righe.push([this.tick, tipo, Math.round(performance.now() - this.t0)].concat(arg));
  },`,
  metti:
`  scrivi(tipo, arg){
    if(this.modo !== 1) return;
    /* =====================================================================
       IL TETTO, E PERCHE' ADESSO PARLA (voce #132, compito 4).

       Quarantamila righe restano una guardia contro un ciclo, e non si
       alzano qui. Quel che cambia e' che il taglio LASCIA UN SEGNO: la
       riga di tipo 9, tre caratteri, nessun argomento, scritta una volta
       sola. Senza, un nastro tagliato a meta' e' identico a uno intero —
       stessa forma, stessa versione di motore — e chi lo rigioca vede i
       comandi finire a meta' partita, il punteggio non tornare, e la
       colpa cadere sulla rosa cresciuta di chi ha attaccato.

       E IL TETTO NON E' LONTANO: il registro scrive una riga per dito per
       fotogramma, quindi con sei dita appoggiate arriva a 111 secondi,
       cioe' dentro una sfida che va al golden goal (misurato,
       strumenti/_sonda-132-canali.js).

       La riga del marchio entra DOPO il tetto — e' la sola che puo' — e
       la bandiera fa in modo che ne entri una e una sola.
       ===================================================================== */
    if(this.righe.length > 40000){
      if(!this.troncato){
        this.troncato = true;
        this.righe.push([this.tick, 9, Math.round(performance.now() - this.t0)]);
      }
      return;
    }
    this.righe.push([this.tick, tipo, Math.round(performance.now() - this.t0)].concat(arg));
  },`,
},

/* 3 — e il marchio esce nel testo */
{
  nome: '3/6 serializza il tipo 9',
  cerca:
`        pezzi.push(dT + ',8,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));
      } else if(tipo === 7){`,
  metti:
`        pezzi.push(dT + ',8,' + dMs + ',' + (r[3]|0) + ',' + (r[4]|0));
      } else if(tipo === 9){
        /* IL MARCHIO DELLA TRONCATURA (voce #132). Nessun argomento, tre
           caratteri, e in rilettura non muove niente: dice soltanto che
           da qui in poi il nastro non ha piu' i comandi della partita. */
        pezzi.push(dT + ',9,' + dMs);
      } else if(tipo === 7){`,
},

/* 4 — e rientra leggendolo */
{
  nome: '4/6 deserializza il tipo 9',
  cerca:
`      else if(tipo === 8)   this.righe.push([tick, 8, ms, v[3], v[4]]);`,
  metti:
`      else if(tipo === 8)   this.righe.push([tick, 8, ms, v[3], v[4]]);
      else if(tipo === 9)   this.righe.push([tick, 9, ms]);`,
},

/* 5 — e la bandiera si riaccende su un nastro letto */
{
  nome: '5/6 deserializza riaccende la bandiera',
  cerca:
`    this.duelli = this.righe.filter(r => r[1] === 6);
    this.iDuello = 0;
    return this.righe.length;`,
  metti:
`    this.duelli = this.righe.filter(r => r[1] === 6);
    this.iDuello = 0;
    /* LA BANDIERA VIENE DAL NASTRO, non da questa partita (voce #132,
       compito 4): chi rilegge deve sapere che il nastro in mano e'
       tagliato, prima di credere al punteggio che ne esce. */
    this.troncato = this.righe.some(r => r[1] === 9);
    return this.righe.length;`,
},

/* 6 — e chi guarda si rifiuta, con la causa vera */
{
  nome: '6/6 Sfida.guarda rifiuta il troncato e il vuoto',
  cerca:
`    let incompleto = false, dati = null;
    for(const r of Reg.righe){
      if(r[1] === 5) incompleto = true;
      else if(r[1] === 7 && !dati) dati = r;
    }
    if(incompleto){`,
  metti:
`    /* =====================================================================
       DUE RIFIUTI IN PIU', TUTTI E DUE CON LA CAUSA VERA (voce #132,
       compito 4).

       IL NASTRO VUOTO. Il controllo qui sopra dice «righe < 0», e un
       nastro con ZERO comandi da' righe === 0: passava. Rigiocare una
       partita senza un solo comando da' quasi sempre un altro punteggio,
       e allora parla chiudiSfida — che accusa la rosa cresciuta di chi
       ha attaccato. Un nastro vuoto non e' una rosa cresciuta.

       IL NASTRO TRONCATO. Stessa storia, piu' insidiosa perche' la prima
       meta' della partita torna: i comandi ci sono fino a un certo punto
       e poi finiscono, e il replay diverge da li' in avanti.

       IN TUTTI E DUE I CASI NON SI PERDE NIENTE TRANNE IL FILM: il
       risultato resta quello scritto nell'elenco, nessun punto si muove,
       niente parte per la rete. E' la stessa scelta gia' presa due volte
       in questa funzione (motore diverso, marchio di tipo 5).
       ===================================================================== */
    if(Reg.righe.length === 0){
      Reg.spegni();
      this.vistoQui[id|0] = 1;
      this.stato('Il nastro di questa partita è vuoto: non porta nemmeno un comando, quindi rigiocarla ' +
                 'darebbe una partita che non è mai successa. Il risultato resta quello qui sotto.', true);
      this.dipingi();
      return;
    }
    if(Reg.troncato){
      Reg.spegni();
      this.vistoQui[id|0] = 1;
      this.stato('Questa partita ha prodotto più comandi di quanti il nastro ne tenga, e il nastro si è ' +
                 'fermato a metà: da lì in poi la partita rigiocata non sarebbe quella che hai subito. ' +
                 'Il risultato resta quello qui sotto.', true);
      this.dipingi();
      return;
    }
    let incompleto = false, dati = null;
    for(const r of Reg.righe){
      if(r[1] === 5) incompleto = true;
      else if(r[1] === 7 && !dati) dati = r;
    }
    if(incompleto){`,
},

];

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
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
const attesi = [
  ['troncato: false,', 1],
  ['this.duelli = []; this.iDuello = 0; this.troncato = false;', 1],
  ['this.righe.push([this.tick, 9, Math.round(performance.now() - this.t0)]);', 1],
  ["pezzi.push(dT + ',9,' + dMs);", 1],
  ['else if(tipo === 9)   this.righe.push([tick, 9, ms]);', 1],
  ['this.troncato = this.righe.some(r => r[1] === 9);', 1],
  ['if(Reg.righe.length === 0){', 1],
  ['if(Reg.troncato){', 1],
  /* il tetto muto non deve restare */
  ['if(this.righe.length > 40000) return;', 0],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
