/* =====================================================================
   _toppa-duello-porte.js — LE TRE PORTE DEL DISCHETTO
   (voce #131, compito 4). Tre ancore.

   LE TRE DECISIONI DI UN DUELLO sono poche e piccole: pickZone(z,u,v)
   dice dove si tira, stopPower() dove si e' fermata la barra,
   pickKeeper(z) da che parte si tuffa il portiere. Tutto il resto —
   quale terzo, quanta potenza, chi para — lo decide resolve() da solo,
   dagli stessi numeri. Registrare queste tre e' registrare il duello.

   L'AVVOLGIMENTO STA FUORI, come per le quattro porte di Touch5 e per la
   stessa ragione scritta li' (:43480-43483): dipende soltanto dai nomi,
   che non cambiano da mesi, mentre i corpi cambiano a ogni toppa.

   LA TRAPPOLA CHE QUESTA TOPPA DEVE EVITARE, ed e' la ragione per cui
   Duel.dentroUpdate esiste. Duel.update chiama DA SE' tutte e tre:
   pickZone a :22489 (la CPU che tira), stopPower a :22494-95 (la CPU che
   ferma la barra) e pickKeeper a :22501 — e quest'ultimo, il ripiego del
   portiere armato a :22377 con cpuT=3,0, GIRA ANCHE COL PORTIERE UMANO,
   quando i tre secondi scadono. Se quelle chiamate finissero nel nastro,
   in rilettura keeperZone verrebbe fissato per primo, la guardia
   `s.keeperZone<0` fallirebbe, il dado() del ripiego non si consumerebbe
   e da li' in poi tutti i sorteggi della partita sarebbero slittati di
   uno. Un nastro che registra le decisioni del motore e' un nastro che
   rigioca un'altra partita.

   COSA NON ENTRA NEL NASTRO, dichiarato. Il pointermove del mirino: non
   decide niente, e' solo disegno. Entra il punto di RILASCIO, che e'
   l'unico che la fisica legge. Chi guardera' il replay vedra' il mirino
   comparire dove il dito l'ha lasciato invece di seguirlo.

   IL FORMATO: [tick, 6, ms, nDuello, passo, verbo, a, b, c], a lunghezza
   variabile come il tipo 7. Il tick e' congelato (delta 0, un carattere)
   e colloca il duello nella partita; i millisecondi ci sono per
   uniformita' e sono DICHIARATI NON LETTI. Chi ancora e' la coppia
   (nDuello, passo).

   uso:  node strumenti/_toppa-duello-porte.js --out fuori/x.html
         node strumenti/_toppa-duello-porte.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/duello-porte.html'));

const ANCORE = [

/* 1 — le tre porte, nello stesso blocco dei due orologi */
{
  nome: '1/3 pickZone, stopPower e pickKeeper avvolte',
  cerca:
`    }finally{ Duel.dentroUpdate = false; }
  };
})();`,
  metti:
`    }finally{ Duel.dentroUpdate = false; }
  };

  /* =====================================================================
     E LE TRE PORTE DEL DISCHETTO (voce #131, compito 4).

     pickZone(z,u,v), stopPower() e pickKeeper(z) sono tutto cio' che un
     dito puo' dire a un duello: il resto — quale terzo para, quanta
     potenza, chi segna — lo ricava resolve() da questi stessi numeri.
     I pointer stanno appesi a #duel e a #powerWrap e non passano dalle
     quattro porte di Touch5: sono una superficie tutta loro, e questa e'
     la sua.

     LA RIGA CHE FA LA DIFFERENZA E' daMotore. Duel.update chiama da se'
     tutte e tre — la CPU che tira, la CPU che ferma la barra, e il
     ripiego del portiere a cpuT=3,0, che GIRA ANCHE COL PORTIERE UMANO.
     Quelle non sono dita: non si registrano (il nastro le rifarebbe due
     volte, e in rilettura keeperZone verrebbe fissato per primo, la
     guardia s.keeperZone<0 fallirebbe, il dado() del ripiego non si
     consumerebbe e tutti i sorteggi successivi slitterebbero di uno) e
     non si sbarrano (senza di loro, in rilettura, il duello della CPU non
     si deciderebbe mai).

     QUI SI SCRIVE SOLTANTO, e la ragione e' un cancello rosso pagato.
     La guardia che in rilettura ignora le dita vere — la gemella di
     «IN RILETTURA LE DITA VERE SONO IGNORATE» delle quattro porte qui
     sopra — arriva col compito 5, insieme alla rilettura vera. Messa qui
     sbarrerebbe una strada che ancora non ha un'alternativa: chi rigioca
     un nastro oggi non riceve le decisioni del duello da nessuna parte, e
     sbarrargli anche la porta lo lascerebbe fermo. MISURATO: messa qui,
     _q-fuzzer.js diventa rosso sulla riproduzione (il suo log-duelli lo
     riapplica a mano, a registro in rilettura), e torna verde col
     compito 5, quando le stesse decisioni arrivano dal nastro.

     u e v ARRIVANO GIA' SU UNA TACCA INTERA da duelMira (grep «LA MIRA SI
     POSA SU UNA TACCA INTERA»), quindi qui per mille e' una
     moltiplicazione esatta, non un arrotondamento che perde qualcosa.
     Quando non ci sono — la tastiera, che u e v non le sa scrivere — la
     riga e' piu' corta di due numeri e in rilettura pickZone le ritrova
     assenti: «mirato» resta falso, e il rigore da tastiera resta quello
     di sempre.
     ===================================================================== */
  const porte = { pickZone:0, stopPower:1, pickKeeper:2 };
  for(const nome in porte){
    const verbo = porte[nome], vero = Duel[nome];
    if(typeof vero !== 'function') continue;
    Duel[nome] = function(a, b, c){
      const daMotore = Duel.dentroUpdate;
      if(Reg.modo === 1 && !daMotore){
        if(verbo === 0) Reg.scrivi(6, (b == null)
          ? [Duel.nDuello, Duel.passo, 0, a|0]
          : [Duel.nDuello, Duel.passo, 0, a|0, Math.round(b*1000), Math.round(c*1000)]);
        else if(verbo === 1) Reg.scrivi(6, [Duel.nDuello, Duel.passo, 1]);
        else Reg.scrivi(6, [Duel.nDuello, Duel.passo, 2, a|0]);
      }
      return vero.call(this, a, b, c);
    };
  }
})();`,
},

/* 2 — il tipo 6 esce nel testo del nastro */
{
  nome: '2/3 serializza il tipo 6',
  cerca:
`        pezzi.push(dT + ',5,' + dMs);
      } else if(tipo === 7){`,
  metti:
`        pezzi.push(dT + ',5,' + dMs);
      } else if(tipo === 6){
        /* I COMANDI DEL DISCHETTO (voce #131). Lunghezza variabile come
           il tipo 7 qui sotto, perche' i tre verbi hanno bisogno di un
           numero diverso di argomenti: la mira ne porta tre (il terzo e
           il punto), o uno solo se viene dalla tastiera; la barra
           nessuno; il tuffo uno.
           Il dT e' quasi sempre 0 — durante un duello Reg.tick sta fermo,
           e' proprio per questo che esiste la coppia (nDuello, passo) —
           quindi in media questa riga costa pochissimo. */
        pezzi.push(dT + ',6,' + dMs + ',' + r.slice(3).map(x => x|0).join(','));
      } else if(tipo === 7){`,
},

/* 3 — e rientra leggendolo */
{
  nome: '3/3 deserializza il tipo 6',
  cerca:
`      else if(tipo === 5)   this.righe.push([tick, 5, ms]);
      else if(tipo === 7)   this.righe.push([tick, 7, ms].concat(v.slice(3)));`,
  metti:
`      else if(tipo === 5)   this.righe.push([tick, 5, ms]);
      else if(tipo === 6)   this.righe.push([tick, 6, ms].concat(v.slice(3)));
      else if(tipo === 7)   this.righe.push([tick, 7, ms].concat(v.slice(3)));`,
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
  ['const porte = { pickZone:0, stopPower:1, pickKeeper:2 };', 1],
  ['const daMotore = Duel.dentroUpdate;', 1],
  ['if(Reg.modo === 1 && !daMotore){', 1],
  ["pezzi.push(dT + ',6,' + dMs + ',' + r.slice(3).map(x => x|0).join(','));", 1],
  ['else if(tipo === 6)   this.righe.push([tick, 6, ms].concat(v.slice(3)));', 1],
  /* le quattro porte di Touch5 restano quelle di sempre */
  ['const porte = { start:0, move:1, chiudi:2, azzera:3 };', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
