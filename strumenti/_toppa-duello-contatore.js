/* =====================================================================
   _toppa-duello-contatore.js — L'OROLOGIO DEL DISCHETTO
   (voce #131, compito 2). Quattro ancore, tutte additive: nessun
   comportamento del gioco cambia, si accendono soltanto tre contatori.

   PERCHE' UN OROLOGIO NUOVO, invece di quello che c'e' gia'.
   Reg.tick e' l'orologio del registro e avanza in un solo posto: la
   prima riga di step() (:17097). Ma nella scena 'freekick' il giro
   principale chiama Duel.update(DT) INVECE di step() (:40407, e
   __test.simulate a :44385): per tutta la durata del duello Reg.tick sta
   fermo. MISURATO (dossier #131): tick identico in entrata e in uscita
   173 volte su 173, e in una serie di rigori TUTTI i rigori portano lo
   stesso tick (40/40) — perche' esitoRigore -> programmaRigore ->
   startFreeKick gira DENTRO Duel.update. Reg.tick non puo' ne' ancorare
   un comando del duello ne' distinguere un duello dall'altro.

   E I MILLISECONDI NON SERVIREBBERO. Grep sul corpo del duello
   (:22184-22740): ZERO performance.now, ZERO Date.now, ZERO oraGioco. Il
   duello legge solo dt, e dt e' sempre DT fisso. Per di piu' frame() ha
   un accumulatore che BUTTA tempo quando il telefono arranca
   (:40404-40414, while(acc>=DT && n<6) e poi if(n===6) acc=0): l'orologio
   vero e quello del duello divergono proprio quando il telefono fatica.
   L'orologio giusto e' il CONTATORE degli aggiornamenti.

   L'AVVOLGIMENTO STA FUORI DALL'OGGETTO, e non e' pigrizia: e' la stessa
   ragione scritta per le quattro porte di Touch5 (:43480-43483). Il corpo
   di Duel.update e' centoquaranta righe che le toppe cambiano di
   continuo; i nomi no. E c'e' una ragione in piu': Duel.update ha un
   return anticipato (:22564, il ramo dei rigori), e un flag acceso a mano
   dentro il corpo resterebbe acceso. Il finally non puo' sbagliare.

   uso:  node strumenti/_toppa-duello-contatore.js --out fuori/x.html
         node strumenti/_toppa-duello-contatore.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/duello-contatore.html'));

const ANCORE = [

/* 1 — i tre numeri, dichiarati accanto agli altri campi del duello */
{
  nome: '1/4 i tre contatori dentro Duel',
  cerca:
`  mirato:false,

  start(shooterTeam){`,
  metti:
`  mirato:false,
  /* =====================================================================
     I TRE NUMERI CHE RENDONO IL DISCHETTO RIGIOCABILE (voce #131).

     nDuello  l'ordinale di questo duello DENTRO IL NASTRO. Serve perche'
              Reg.tick, durante un duello, sta fermo: in 'freekick' il
              giro principale chiama Duel.update e non step(), e
              Reg.passo() gira solo dentro step(). MISURATO: in una serie
              di rigori tutti i rigori portano lo STESSO tick (40/40),
              perche' esitoRigore -> programmaRigore -> startFreeKick gira
              dentro Duel.update. Senza un ordinale, i comandi del terzo
              rigore sono indistinguibili da quelli del primo. Si azzera
              dove comincia un nastro (Reg.azzeraComandi), non a ogni
              duello.
     passo    quanti Duel.update sono GIA' COMPIUTI da quando questo
              duello e' cominciato. E' l'orologio del dischetto, e non
              sono i millisecondi: il duello non legge nessun orologio
              vero — zero performance.now, zero Date.now, zero oraGioco in
              tutto il suo corpo — e frame() butta tempo quando il
              telefono arranca. Si azzera in Duel.start.
     dentroUpdate  vero mentre il motore del duello sta girando. E' il
              gemello di Reg.dentro (grep «dentro: false»): Duel.update
              chiama DA SE' pickZone (:22489), stopPower (:22494) e
              pickKeeper (:22501), e il ripiego del portiere gira anche
              col portiere UMANO. Quelle chiamate non sono dita.

     Nessuno dei tre tocca la fisica del duello: sono contatori, e non
     tirano un solo sorteggio. Il banco a seme fisso non si sfasa.
     ===================================================================== */
  nDuello:0, passo:0, dentroUpdate:false,

  start(shooterTeam){`,
},

/* 2 — il passo del dischetto, accanto al passo del registro */
{
  nome: '2/4 Reg.passoDuello',
  cerca:
`    this.tick++;
  },

  esegui(r){`,
  metti:
`    this.tick++;
  },

  /* =====================================================================
     IL PASSO DEL DISCHETTO — il fratello minore di passo(), qui sopra.

     passo() si chiama all'inizio di ogni step(). Questa si chiama
     all'inizio di ogni Duel.update, che e' cio' che gira AL POSTO di
     step() mentre il duello e' aperto: le due non girano mai insieme, e
     insieme coprono tutti i fotogrammi di una partita.

     PERCHE' PROPRIO ALL'INIZIO, e non da qualche altra parte dentro
     l'aggiornamento. stopPower legge this.cursor ALL'ISTANTE della
     chiamata (:22366), e il cursore avanza a :22480, dentro
     l'aggiornamento. Dal vivo il dito non cade mai dentro Duel.update:
     cade FRA due aggiornamenti. Percio' un tocco arrivato fra il k-esimo
     e il (k+1)-esimo legge un cursore avanzato k volte, e k e' il numero
     che finira' nel nastro. Rimetterlo in scena all'INIZIO del (k+1)-esimo
     — prima che il cursore avanzi di nuovo — e' l'unico istante in cui il
     cursore vale di nuovo esattamente quello. Un aggiornamento di scarto
     vale 0,01917 di corsa, cioe' fra il 10% e il 20% della banda: MISURATO
     (dossier #131) cambia il 5% degli esiti, il conto dei sorteggi in 5
     partite su 40 e il punteggio finale in 2 su 40.

     L'INCREMENTO STA PRIMA DI OGNI GUARDIA, come this.tick++ sta in fondo
     a passo() senza chiedere il permesso a nessuno: l'orologio del
     dischetto cammina anche a registro spento. Se camminasse solo in
     registrazione, il gioco di casa e quello di rete sarebbero due giochi
     leggermente diversi — la stessa legge del pixel intero (grep «IL DITO
     SI POSA SU UN PIXEL INTERO»).
     ===================================================================== */
  passoDuello(){
    Duel.passo++;
  },

  esegui(r){`,
},

/* 3 — l'ordinale riparte quando comincia un nastro */
{
  nome: '3/4 nDuello azzerato con il nastro',
  cerca:
`    try{
      G.possOwner = -1; G.possT = 0;
      G.pulse = 0; G.crowdSndT = 0; G.recT = 0;
    }catch(e){}
  },`,
  metti:
`    try{
      G.possOwner = -1; G.possT = 0;
      G.pulse = 0; G.crowdSndT = 0; G.recT = 0;
    }catch(e){}
    /* =====================================================================
       E L'ORDINALE DEL DUELLO RIPARTE CON IL NASTRO (voce #131).

       azzeraComandi() e' chiamata da accendi() e da deserializza(), cioe'
       nei due soli istanti in cui un nastro COMINCIA: e' il posto esatto
       per far ripartire da zero il conto dei duelli, e l'unico in cui i
       due capi — chi registra e chi rilegge — sono certi di partire dallo
       stesso numero. Azzerarlo in startMatch non basterebbe: una pagina
       che ha gia' giocato tre duelli offline e poi apre una sfida
       scriverebbe nel nastro un ordinale che chi rilegge non ha.

       Il try c'e' perche' un giorno il registro potrebbe accendersi prima
       che Duel esista, ed e' la stessa prudenza dei due try qui sopra.
       ===================================================================== */
    try{ Duel.nDuello = 0; Duel.passo = 0; }catch(e){}
  },`,
},

/* 4 — i due orologi avvolti dall'esterno, accanto alle porte di Touch5 */
{
  nome: '4/4 Duel.start e Duel.update avvolti',
  cerca:
`      return vero.call(this, a, b, c);
    };
  }
})();`,
  metti:
`      return vero.call(this, a, b, c);
    };
  }
})();

/* =====================================================================
   I DUE OROLOGI DEL DISCHETTO, AVVOLTI DALL'ESTERNO (voce #131).

   Stessa dottrina delle quattro porte qui sopra, e per una ragione in
   piu'. Il corpo di Duel.update e' centoquaranta righe che le toppe
   cambiano di continuo: un ancoraggio la' dentro si romperebbe alla
   prima. E c'e' il return anticipato di :22564 (il ramo che chiude un
   rigore della serie): un flag acceso a mano dentro il corpo resterebbe
   acceso per sempre la prima volta che quel ramo scatta. Il finally non
   puo' sbagliare.

   start   fa avanzare l'ordinale del duello e azzera il suo orologio.
           I due numeri si muovono INSIEME e in un posto solo, cosi' non
           possono divergere.
   update  accende dentroUpdate — il gemello di Reg.dentro — per tutta la
           durata dell'aggiornamento, e chiama Reg.passoDuello() come
           PRIMA cosa, prima che s.vt avanzi (:22465) e prima che il
           cursore della barra avanzi (:22480). La ragione sta scritta per
           esteso accanto a passoDuello.

   Zero sorteggi, zero rami nuovi nella fisica: due assegnazioni e un
   incremento per fotogramma di duello.
   ===================================================================== */
(function(){
  const veroStart = Duel.start, veroUpdate = Duel.update;
  Duel.start = function(shooterTeam){
    Duel.nDuello++; Duel.passo = 0;
    return veroStart.call(this, shooterTeam);
  };
  Duel.update = function(dt){
    Duel.dentroUpdate = true;
    try{
      Reg.passoDuello();
      return veroUpdate.call(this, dt);
    }finally{ Duel.dentroUpdate = false; }
  };
})();`,
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
  ['nDuello:0, passo:0, dentroUpdate:false,', 1],
  ['passoDuello(){', 1],
  ['Duel.passo++;', 1],
  ['try{ Duel.nDuello = 0; Duel.passo = 0; }catch(e){}', 1],
  ['Duel.nDuello++; Duel.passo = 0;', 1],
  ['Duel.dentroUpdate = true;', 1],
  ['}finally{ Duel.dentroUpdate = false; }', 1],
  ['Reg.passoDuello();', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
