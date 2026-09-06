/* =====================================================================
   _t-raddoppio-tenuta.js — IL RADDOPPIO DIVENTA UNA TENUTA, E IL
   CONTENIMENTO SI VEDE (voce #88, compito 7, ultimo compito di codice
   del ramo voce-88-pulsantiera).

   IL RECLAMO DEL COMMITTENTE: «questo succede anche nei contrasti o
   quando si cerca di difendere la palla o pressare o contrattaccare per
   prendere la palla avversaria, i tasti sono scomodi e fatti male per
   queste situazioni». Due difetti distinti, misurati separatamente.

   DIFETTO 1 — IL RADDOPPIO SCADE SOTTO IL DITO. comandaPressa scrive
   UNA volta sola p.raddoppio = RADDOPPIO_T (RUOLO_MIN*2 = 3 s) sul
   compagno chiamato, e da li' il cronometro scende da solo dentro
   aiMove (che gira solo per i compagni NON comandati dal dito). Tenere
   premuto PRESSA non fa niente: dopo 3 s l'ordine scade comunque, anche
   col pollice ancora fermo sul disco. LA CURA sta dentro Touch5.passo,
   esattamente dove i cronometri del pollice (a.posato, a.tenuta) gia'
   avanzano col dt fisso della simulazione (Legge 1): finche' l'atto
   'press' e' vivo e la cella e' accesa, ogni RINNOVO_PRESSA_T (0,2 s,
   un quindicesimo di RADDOPPIO_T) si richiama comandaPressa, e il
   cronometro del compagno torna a scadere da capo. La cella SPENTA non
   rinnova niente — la stessa lettura "d" che il ri-armo qui sopra gia'
   fa, non una seconda chiamata a touchBtnLayout.
   NESSUN NOME NUOVO chiamato da touchBtnLayout: comandaPressa e' gia'
   in casa, e Touch5.passo non e' nella rete che _q-precedenza estrae
   (e' lei che CHIAMA touchBtnLayout, non il contrario).

   DIFETTO 2 — IL CONTENIMENTO NON SI VEDE. Touch5.contiene(t) esiste
   gia' (voce #82, L1.2) e rallenta il passo di chi tiene CONTRASTA
   contro un portatore avversario (jockey), ma e' un effetto sul CORPO:
   chi difende non ha modo di sapere a colpo d'occhio se il dito e'
   ancora registrato o se un ri-armo silenzioso l'ha gia' spento. LA
   CURA aggiunge un segno a terra, dentro drawSegniTerra — la stessa
   funzione che gia' disegna l'anello del comandato e quello del
   portatore: due archi ciano ai piedi dell'uomo, DENTRO l'anello ambra
   del controllo (mai sopra: l'ambra e' gia' presa, un cerchio pieno
   concentrico leggerebbe come un doppio bordo sullo stesso paio di
   scarpe). La domanda che li accende e' la stessa di Touch5.contiene:
   nessuno stato da accendere e da spegnere a mano.

   LEGGE DEI SORTEGGI: zero chiamate nuove a dado(). comandaPressa e
   uomoVersoDirezione non ne fanno mai (letto qui prima di scrivere
   questo attrezzo); il rinnovo esiste solo per gli atti di Touch5, che
   nascono solo da un tocco umano vero (Touch5.start: `if(!G.cpu[t] &&
   ...)`) — in CPU contro CPU non esiste un solo atto, quindi il ramo
   nuovo non gira mai e i banchi a seme fisso non vedono un bit di
   differenza.

   uso:  node strumenti/_t-raddoppio-tenuta.js --out fuori/raddoppio-tenuta.html
         node strumenti/_t-raddoppio-tenuta.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/raddoppio-tenuta.html'));

const ANCORE = [

/* 1 — il rinnovo del cronometro, dentro il ciclo dove i cronometri del
   pollice gia' avanzano (Touch5.passo) */
{
  nome: '1/4 Touch5.passo: il rinnovo del cronometro finche\' il dito tiene',
  cerca:
`      a.posato+=dt;
      if(!a.morto) a.tenuta+=dt;
    }
  }
};`,
  metti:
`      a.posato+=dt;
      if(!a.morto) a.tenuta+=dt;
      /* =================================================================
         L1.5 — IL RADDOPPIO DIVENTA UNA TENUTA (compito 7, voce #88).

         Fino a ieri comandaPressa scriveva UNA volta sola p.raddoppio =
         RADDOPPIO_T (RUOLO_MIN*2 = 3 s), e da li' il cronometro scendeva
         da solo dentro aiMove — anche col dito ancora giu' sul disco.
         Il compagno chiamato smetteva di pressare dopo 3 s SEMPRE, anche
         se il pollice non aveva mai lasciato PRESSA: un ordine che
         doveva durare quanto il dito lo tiene durava invece un tempo
         fisso, e basta.

         LA CURA STA QUI, non dentro comandaPressa: e' il posto dove i
         cronometri del pollice avanzano gia' (a.posato, a.tenuta, due
         righe sopra), col dt fisso della simulazione (Legge 1) e solo
         quando l'atto e' vivo. Finche' il dito tiene un atto 'press'
         vivo, ogni RINNOVO_PRESSA_T di tenuta si richiama comandaPressa:
         RADDOPPIO_T torna a scadere da capo, e siccome 0,2 s e' un
         quindicesimo di RADDOPPIO_T il cronometro del compagno non
         arriva mai a zero mentre il dito preme.

         A RITMO RIDOTTO, non a ogni fotogramma: comandaPressa richiama
         uomoVersoDirezione, che scandisce la rosa in cerca del compagno
         piu' vicino alla direzione — farlo a 60 Hz costerebbe sessanta
         volte il prezzo per lo stesso identico risultato (l'uomo
         chiamato resta lo stesso finche' la direzione non cambia).

         LA CELLA SPENTA NON RINNOVA NIENTE: d e' la stessa lettura,
         fresca a questo fotogramma, che la porta del ri-armo qui sopra
         gia' usa per decidere se il verbo e' cambiato — non una seconda
         chiamata a touchBtnLayout. Se il portatore avversario e' uscito
         (d.off, la stessa guardia che pressaViva applica), il rinnovo
         tace: e' la stessa regola della cella spenta che non risponde
         nemmeno alla prima pressione (Touch5.start), applicata qui al
         rinnovo invece che al tocco. */
      if(!a.morto && a.act==='press' && d && !d.off){
        a.rinnovoT=(a.rinnovoT||0)+dt;
        if(a.rinnovoT>=RINNOVO_PRESSA_T){ a.rinnovoT=0; comandaPressa(a.t); }
      }
    }
  }
};`,
},

/* 2 — la costante del ritmo di rinnovo, accanto a RADDOPPIO_T */
{
  nome: '2/4 RINNOVO_PRESSA_T nasce accanto a RADDOPPIO_T',
  cerca:
`const RADDOPPIO_T = RUOLO_MIN*2;`,
  metti:
`const RADDOPPIO_T = RUOLO_MIN*2;
const RINNOVO_PRESSA_T = 0.2;      // s di tenuta fra due rinnovi del cronometro (L1.5, compito 7)`,
},

/* 3 — il segno del contenimento, funzione di disegno a terra */
{
  nome: '3/4 anelloContenimento nasce accanto ad anelloComandato',
  cerca:
`  ctx.fillStyle='rgba(255,176,32,.95)'; ctx.fill();
  ctx.restore();
}

/* =====================================================================
   L'ADATTATORE DEL RIG — le figure in partita le disegna Rig3D.`,
  metti:
`  ctx.fillStyle='rgba(255,176,32,.95)'; ctx.fill();
  ctx.restore();
}

/* IL SEGNO DEL CONTENIMENTO (compito 7, voce #88). Il rallentamento del
   contenimento (L1.2, dentro aiMove) e' un effetto sul CORPO — si sente
   nel passo, non si vede sul vetro — e chi difende non ha modo di
   sapere se il dito e' ancora registrato sopra il disco o se un ri-armo
   silenzioso l'ha gia' spento. Qui il gesto diventa un segno: due archi
   ciano ai piedi dell'uomo, DENTRO l'anello ambra del comandato
   (anelloComandato, appena sopra) — mai sopra, perche' l'ambra e' gia'
   presa dal controllo e un cerchio pieno concentrico leggerebbe come un
   doppio bordo sullo stesso paio di scarpe. La domanda che li accende
   e' la stessa di L1.2, Touch5.contiene: nessuno stato nuovo da
   accendere e da spegnere, quindi nessun modo di lasciare un segno
   acceso quando il gesto e' gia' finito. Il respiro (SAVE.moto) e' lo
   stesso di anelloComandato: fermo a meta' via a movimento ridotto.
   BUDGET: estremo laterale (2,5+15,5+2)x1,18 = 23,6 < 30, il raggio da
   cui collaudo.js campiona l'erba. */
function anelloContenimento(p){
  ctx.save();
  ctx.translate(p.x,p.y); ctx.scale(P_DIS,P_DIS); ctx.translate(-p.x,-p.y);
  const pl = SAVE.moto ? 0.5+0.5*Math.sin(G.pulse*3.4) : 0.5;
  const arx=14.6+0.9*pl, ary=6.4+0.39*pl;
  const cx=p.x+2.5, cy=p.y+6.6;
  for(const [a0,a1] of [[0.06*Math.PI,0.44*Math.PI],[1.06*Math.PI,1.44*Math.PI]]){
    ctx.strokeStyle='rgba(0,0,0,.42)'; ctx.lineWidth=4.0;
    ctx.beginPath(); ctx.ellipse(cx,cy,arx,ary,0,a0,a1); ctx.stroke();
    ctx.strokeStyle='rgba(57,211,230,.88)'; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.ellipse(cx,cy,arx,ary,0,a0,a1); ctx.stroke();
  }
  ctx.restore();
}

/* =====================================================================
   L'ADATTATORE DEL RIG — le figure in partita le disegna Rig3D.`,
},

/* 4 — drawSegniTerra chiama il segno quando Touch5.contiene */
{
  nome: '4/4 drawSegniTerra chiama anelloContenimento sotto Touch5.contiene',
  cerca:
`    }
    if(isCtrl) anelloComandato(p);
  }
  if(buco) ctx.restore();
}`,
  metti:
`    }
    if(isCtrl){
      anelloComandato(p);
      /* IL SEGNO DEL CONTENIMENTO (compito 7, voce #88): la stessa
         domanda che L1.2 gia' fa dentro aiMove per rallentare il passo
         (Touch5.contiene, atti vivi, non una bandiera) diventa anche un
         segno che l'occhio vede, cosi' chi difende sa che il gesto e'
         attivo invece di indovinarlo dal solo rallentamento. */
      if(Touch5.contiene(p.team)) anelloContenimento(p);
    }
  }
  if(buco) ctx.restore();
}`,
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
/* CONTEGGI A DELTA (come in _t-contrasto-specchio.js): il file arriva
   qui con gli altri compiti della voce #88 gia' dentro, e «voce #88»
   compare gia' molte volte nei commenti prima di questo attrezzo. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['const RINNOVO_PRESSA_T = 0.2;', 1],
  ['if(a.rinnovoT>=RINNOVO_PRESSA_T){ a.rinnovoT=0; comandaPressa(a.t); }', 1],
  ['function anelloContenimento(p){', 1],
  ['if(Touch5.contiene(p.team)) anelloContenimento(p);', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
