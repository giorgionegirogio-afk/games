/* =====================================================================
   _t-isteresi-disco.js — IL RI-ARMO NON SCATTA PER LO SFARFALLIO
   (1 settembre 2026, voce di lavoro #82; progetto in
   _analisi/PROGETTO-ISTERESI-DISCO.md, misure del 31 agosto).

   LA DIAGNOSI, in una riga: durante un contrasto vero il pallone
   conteso attraversa la frontiera KICK_R*1,4 (36,4 unita') avanti e
   indietro, la faccia del disco grande sfarfalla TIRA/CONTRASTA, e ogni
   cambio del verbo offerto RI-ARMA l'atto azzerando il punto di posa
   (a.posaX=a.x): il trascinamento gia' fatto smette di esistere e al
   rilascio la scivolata non parte. Misurato: 11 gesti su 20 arrivano in
   fondo (_p-contrasto20.js), 6 cambi di faccia in 6 s tutti fra 33,4 e
   36,9 unita' dalla frontiera (_p-sfarfallio.js), e in TUTTI e sei la
   squadra dell'ultimo tocco non era MAI cambiata.

   LA CURA (strada B del progetto): il ri-armo resta legato al verbo
   offerto ma scatta solo se il pallone ha DAVVERO cambiato lato da
   quando l'atto e' nato. «Lato» = squadraDelPallone(): il padrone se
   c'e', altrimenti la squadra dell'ultimo tocco (b.lastTouch, scritto
   da segnaTocco a ogni contatto). Nel palleggio il lato non cambia mai;
   nel furto vero cambia sempre — non esiste furto senza contatto. Il
   file l'aveva promessa («piu' l'isteresi, questo ri-armo seguira'»):
   questa toppa la adempie.

   LEGGE DEI SORTEGGI: squadraDelPallone non scrive un bit e non chiama
   dado(); tutto il codice nuovo vive nel ciclo degli atti, che itera
   solo con un dito su un disco. Nei percorsi CPU contro CPU a seme
   fisso non si esegue una sola istruzione nuova. Nei percorsi CON dita
   l'esito cambia PER PROGETTO (la scivolata che non partiva adesso
   parte) e con lui il consumo di dado() a valle.

   ACCETTAZIONE (§6 del progetto): _p-contrasto20 almeno 19/20 sulla
   peggiore di tre corse; giocata --tutte dieci corse senza rossi;
   _q-l12/_q-l16/_q-riarmo/_q-precedenza invariati; _q-determinismo
   10/10 e i quattro cancelli dei sorteggi identici al bit;
   _p-sfarfallio DOPO la toppa: gli stessi 6 cambi di faccia (la sonda
   non tiene dita giu' — l'etichetta dipinta non si tocca).

   uso:  node strumenti/_t-isteresi-disco.js --out fuori/isteresi.html
         node strumenti/_t-isteresi-disco.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/isteresi.html'));

const ANCORE = [

/* 1 — nasce squadraDelPallone, accanto a possessoTeam, col suo statuto */
{
  nome: '1/5 squadraDelPallone dopo possessoTeam',
  cerca:
`function possessoTeam(t){
  return G.ball && G.ball.owner>=0 && G.players[G.ball.owner] && G.players[G.ball.owner].team===t;
}`,
  metti:
`function possessoTeam(t){
  return G.ball && G.ball.owner>=0 && G.players[G.ball.owner] && G.players[G.ball.owner].team===t;
}
/* LA SQUADRA A CUI IL PALLONE APPARTIENE, ai fini del ri-armo del
   motore d'ingresso (1 settembre 2026, voce #82): il padrone se c'e',
   altrimenti la squadra dell'ultimo tocco (b.lastTouch, il registro che
   segnaTocco scrive a OGNI contatto: calci, furti, tocchi sporchi,
   raccolte, blocchi col corpo, strappi, mani del portiere, rinvii,
   calcio d'inizio). Un palleggio, una respinta, un tocco sporco non
   cambiano lato; un furto si' — sempre, perche' non esiste furto senza
   contatto. STESSO STATUTO DELLE QUATTRO CAPACITA' QUI SOTTO: non
   scrive un bit, non chiama mai dado() ne' Math.random. */
function squadraDelPallone(){
  const b=G.ball;
  if(!b) return -1;
  if(b.owner>=0 && G.players[b.owner]) return G.players[b.owner].team;
  if(b.lastTouch>=0 && G.players[b.lastTouch]) return G.players[b.lastTouch].team;
  return -1;
}`,
},

/* 2 — l'atto ricorda il lato in cui e' nato */
{
  nome: '2/5 il campo sq in nasceAtto',
  cerca:
`    this.atti[id]={ t:t, carica:(act==='shot' ? ctrlPlayer(t) : null),
                    slot:slot, act:act,
                    posaX:x, posaY:y, x:x, y:y, tenuta:0, posato:0, morto:false,
                    anello:[{x:x,y:y,q:this.tempo}] };`,
  metti:
`    this.atti[id]={ t:t, carica:(act==='shot' ? ctrlPlayer(t) : null),
                    slot:slot, act:act,
                    /* il lato del pallone alla nascita dell'atto: e' il
                       testimone che la porta del ri-armo confronta (vedi
                       IL PASSO DELLA SIMULAZIONE, voce #82) */
                    sq:squadraDelPallone(),
                    posaX:x, posaY:y, x:x, y:y, tenuta:0, posato:0, morto:false,
                    anello:[{x:x,y:y,q:this.tempo}] };`,
},

/* 3 — la porta del ri-armo nel ciclo degli atti */
{
  nome: '3/5 la porta del ri-armo in Touch5.passo',
  cerca:
`      const d=touchBtnLayout(a.t)[a.slot];
      if(d && d.act!==a.act){
        if(a.carica) this.chiudiCarica(a.carica);
        /* L1.4 — il verbo nuovo non eredita la posa del passaggio, come
           non eredita la carica del tiro: si chiude senza calciare. */
        if(a.passa){ this.chiudiPassaL14(a.passa); a.passa=null; }
        a.act=d.act; bt.act=d.act;
        /* il verbo nuovo non ha eseguito niente, quindi non tiene aperta
           nessuna carica: da qui in poi questo dito non ha piu' titolo a
           chiudere o a far partire il tiro di nessuno */
        a.carica=null;
        a.posaX=a.x; a.posaY=a.y;
        a.anello=[{x:a.x,y:a.y,q:this.tempo}];
        a.tenuta=0; a.morto=false;
        continue;
      }`,
  metti:
`      const d=touchBtnLayout(a.t)[a.slot];
      if(d && d.act!==a.act){
        /* LA PORTA DEL RI-ARMO (1 settembre 2026, voce #82). Il verbo
           offerto e' cambiato, ma il ri-armo scatta solo se il pallone
           ha DAVVERO cambiato lato da quando l'atto e' nato: nei sei
           cambi di faccia misurati durante un palleggio conteso
           (strumenti/_p-sfarfallio.js) il lato non cambia MAI, nel
           furto vero cambia SEMPRE — non esiste furto senza contatto
           (segnaTocco). Un ri-armo soppresso non puo' produrre azioni
           illegali: ogni rilascio ri-verifica le proprie guardie. */
        const sq=squadraDelPallone();
        if(sq!==a.sq){
          if(a.carica) this.chiudiCarica(a.carica);
          /* L1.4 — il verbo nuovo non eredita la posa del passaggio, come
             non eredita la carica del tiro: si chiude senza calciare. */
          if(a.passa){ this.chiudiPassaL14(a.passa); a.passa=null; }
          a.act=d.act; bt.act=d.act;
          /* il verbo nuovo non ha eseguito niente, quindi non tiene aperta
             nessuna carica: da qui in poi questo dito non ha piu' titolo a
             chiudere o a far partire il tiro di nessuno */
          a.carica=null;
          a.posaX=a.x; a.posaY=a.y;
          a.anello=[{x:a.x,y:a.y,q:this.tempo}];
          a.tenuta=0; a.morto=false;
          a.sq=sq;
          continue;
        }
        /* stesso lato: e' lo sfarfallio del palleggio sulla frontiera
           KICK_R*1,4. L'atto TIENE — verbo, posa, anello, tenuta — e i
           cronometri del pollice avanzano qui sotto. */
      }`,
},

/* 4 — il verbale del ri-armo: il «cambio di contesto» ha due condizioni */
{
  nome: '4/5 la rettifica nel verbale del ri-armo',
  cerca:
`     COS'E' UN «CAMBIO DI CONTESTO», qui: che il disco sotto il dito
     offra un verbo diverso da quello che l'atto teneva. Non c'e' una
     seconda definizione di contesto scritta da nessuna parte — si chiede
     a touchBtnLayout, che e' la stessa funzione che decide le etichette e
     che risolve il tocco. Il giorno in cui il contesto diventera' tre
     (IO / NOI / LORO) e si stabilizzera' (b.passTo dentro possessoTeam,
     piu' l'isteresi), questo ri-armo seguira' senza che qui cambi una
     riga: e' un vantaggio dell'aver legato il ri-armo al VERBO OFFERTO
     invece che a una copia locale del possesso.`,
  metti:
`     COS'E' UN «CAMBIO DI CONTESTO», qui — DUE condizioni, non una
     (1 settembre 2026, voce #82): che il disco sotto il dito offra un
     verbo diverso da quello che l'atto teneva, E che il pallone abbia
     cambiato LATO da quando l'atto e' nato (squadraDelPallone: il
     padrone se c'e', altrimenti la squadra dell'ultimo tocco). La prima
     si chiede a touchBtnLayout, che e' la stessa funzione che decide le
     etichette e che risolve il tocco; la seconda e' l'isteresi che il
     capoverso scritto qui prometteva («piu' l'isteresi, questo ri-armo
     seguira'»): adempiuta. Il perche' sta nella misura del 31 agosto
     (strumenti/_p-sfarfallio.js): durante un contrasto vero il pallone
     conteso attraversa la frontiera KICK_R*1,4 avanti e indietro — 6
     cambi di faccia in 6 s, puntate da 8, 14 e 57 fotogrammi — e ogni
     attraversamento azzerava il punto di posa mangiandosi il
     trascinamento della scivolata (11 gesti su 20 a buon fine,
     strumenti/_p-contrasto20.js). In TUTTI i sei cambi misurati la
     squadra dell'ultimo tocco non era mai cambiata; nel furto vero
     cambia sempre. Il discrimine e' esatto, senza raggi ne' cronometri
     da tarare.`,
},

/* 5 — il verbale di contiene: il contenimento non finisce piu' sulla
       distanza, finisce al cambio di lato. Il codice non si tocca. */
{
  nome: '5/5 la rettifica nel verbale di contiene',
  cerca:
`     E si spegne anche quando il DISCO cambia verbo sotto il dito: il
     ri-armo di L1.1 riscrive a.act, quindi avvicinandosi al pallone —
     dove il disco offre TIRA — il contenimento finisce. E' la distanza
     a cui si contiene, non un difetto: da li' in dentro il verbo e' un
     altro.`,
  metti:
`     E si spegne anche quando il DISCO cambia verbo sotto il dito E il
     pallone ha cambiato lato: dal 1 settembre 2026 (voce #82) il
     ri-armo di L1.1 riscrive a.act solo a quelle DUE condizioni (la
     porta in IL PASSO DELLA SIMULAZIONE). La vecchia frase
     «avvicinandosi al pallone — dove il disco offre TIRA — il
     contenimento finisce: e' la distanza a cui si contiene» NON E' PIU'
     VERA contro un portatore avversario che palleggia: finche' il lato
     non cambia, il contenimento TIENE anche sotto la frontiera del
     tiro. Finisce come prima quando il pallone cambia lato (furto
     compiuto, in una direzione o nell'altra) o quando il dito si alza.
     Il codice qui sotto non e' cambiato: legge a.act, che e'
     esattamente cio' che l'isteresi stabilizza.`,
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
  ['function squadraDelPallone(){', 1],
  ['squadraDelPallone(', 3],            // la definizione, nasceAtto, la porta
  ['sq:squadraDelPallone(),', 1],
  ['const sq=squadraDelPallone();', 1],
  ['if(sq!==a.sq){', 1],
  ['a.sq=sq;', 1],
  ['a.posaX=a.x; a.posaY=a.y;', 1],     // il ri-armo vero, ora dentro la porta
  ['voce #82', 5],                      // funzione, nasceAtto, porta, due verbali
  ['DUE condizioni', 2],                // verbale del ri-armo + verbale di contiene
  // il ri-armo vero e' rimasto parola per parola (chiusure comprese)
  ['if(a.carica) this.chiudiCarica(a.carica);', 1],
  ['if(a.passa){ this.chiudiPassaL14(a.passa); a.passa=null; }', 2], // chiudi + porta
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
