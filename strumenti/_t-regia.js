/* =====================================================================
   _t-regia.js — LA REGIA CHE STACCA DOVE NESSUNO COMANDA.

   Toppa cerca/sostituisci. Legge il gioco (o --in), sostituisce TRE
   ancoraggi ESATTI e scrive la copia in --out. Senza --out scrive
   accanto all'originale un file col suffisso .regia.html: mai
   sull'originale, se non con --dentro. Se anche un solo ancoraggio non
   compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e
   non scrive niente.

   uso:
     node strumenti/_t-regia.js --in fuori/CALCETTO-originale-30279089.html --out fuori/regia.html
     node strumenti/_t-regia.js --elenco

   ---------------------------------------------------------------------
   LA VOCE (censimento 20 ago 2026, §2.5). Il riferimento commerciale
   stacca la regia 2,16 volte al minuto e spende in regia un terzo del
   tempo; questo gioco ha una camera sola che non stacca MAI (misurato
   da _q-regia.js sul gioco di oggi: 1/0/1 «salti» alle tre taglie, e
   quell'uno non e' regia — e' il morsetto della garanzia dei 56 px che
   scatta quando il nastro della moviola teletrasporta il pallone
   indietro di 0,8 s). E la moviola ha UNA sola inquadratura: la stessa
   pianta dall'alto che si e' appena vista.

   LA SCELTA: gli stacchi vanno SOLO dove il gioco e' fermo o nessuno
   comanda — e' la voce col piu' alto rischio di peggiorare il gioco, e
   uno stacco mentre il dito conduce toglie il controllo. Quindi DUE
   momenti, fatti bene:

     1. LA MOVIOLA IN TRE INQUADRATURE (A totale / B stretta / C rete),
        montate come le monta una regia vera: prima si vede DA DOVE
        nasce il gol, poi si sta addosso al pallone, poi il fotogramma
        della rete si guarda composto sul marcatore. I salti di zoom fra
        le inquadrature sono >= 18% e >= 30% per costruzione: uno stacco
        che non si vede non e' uno stacco.
     2. IL CALCIO D'INIZIO DI STACCO: il quadro del kickoff (pallone sul
        dischetto; sulle taglie grandi la panoramica dello schieramento)
        si monta in un fotogramma invece di raggiungersi in scivolata
        dall'inquadratura del gol o del menu. Il gioco e' fermo, nessuno
        comanda, e la ripresa di una partita vera fa esattamente questo.

   MAI DURANTE IL GIOCO ATTIVO: nessuna riga di questa toppa tocca il
   ramo dell'inseguimento in play/golden, e _q-regia.js lo verifica sui
   fotogrammi (zero salti di camera in play, soglie sopra ogni molla).

   PERCHE' NIENTE STATO NUOVO: ogni inquadratura e' funzione pura di
   (fase del nastro, indice, pallone). Nessuna bandiera di transizione:
   lo stacco emerge quando cambia la regola, non quando scatta un flag.
   Cosi' due disegni consecutivi a gioco fermo restano identici al bit
   (il patto di strumenti/_posa.js) e il banco a passo fisso rivede
   sempre la stessa partita. L'unico campo nuovo e' M.regia, il piano di
   ripresa del nastro, calcolato UNA volta per moviola e sepolto con lei.

   NESSUN SEGNO NUOVO SOPRA L'ERBA: la toppa muove solo la camera,
   quindi zoneInterfaccia non ha niente di nuovo da dichiarare (la
   trappola della pastiglia semitrasparente non si applica).

   COSTO: una manciata di prodotti scalari per fotogramma, e SOLO nei
   fotogrammi di moviola e kickoff. Il numero misurato (appaiato, stesso
   minuto, tre taglie) sta nella consegna, non qui: qui starebbe vecchio.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

const ANCORE = [

/* 1 — la moviola in tre inquadrature, prima del ramo della panoramica */
{
  nome: '1/3 la moviola in tre inquadrature (A totale / B stretta / C rete)',
  cerca:
`  /* LA PANORAMICA DEL KICKOFF A ROSA LARGA. Sul 7 e sull'11 il calcio
     d'inizio e' l'unico momento in cui le due squadre stanno SCHIERATE, ed`,
  metti:
`  /* =====================================================================
     LA REGIA DELLA MOVIOLA: TRE INQUADRATURE, DUE STACCHI INTERNI (voce
     «regia», 20 ago 2026). Il riferimento stacca 2,16 volte al minuto;
     questo gioco non staccava mai, e la moviola — l'unico momento in cui
     nessuno comanda e il gioco si guarda — rivedeva il gol con la stessa
     inquadratura dall'alto appena vista. Qui il nastro si monta:
       A  il TOTALE: camera FERMA che tiene dentro l'intera traiettoria
          registrata, col punto di partenza dell'azione nel terzo centrale
          del quadro — si capisce da dove nasce il gol;
       B  la STRETTA: dal 55% del nastro, quando il gesto decisivo sta
          per arrivare, si stacca addosso al pallone e lo si segue;
       C  la RETE: sul fotogramma fermo del gol, stacco composto sul
          MARCATORE (torso nel terzo centrale, un filo sotto il centro)
          col punto della rete in quadro.
     PERCHE' QUI E NON IN PARTITA: uno stacco mentre il dito conduce
     toglie il controllo; la moviola e' un rito che si guarda.
     PERCHE' NIENTE STATO: ogni inquadratura e' funzione pura di (fase,
     indice del nastro, pallone) — nessuna bandiera di transizione. Lo
     stacco emerge da solo quando cambia la regola, e due disegni
     consecutivi a gioco fermo restano identici al bit (il patto di
     strumenti/_posa.js: con rdt=0 qui sotto non si muove un numero).
     I salti di zoom fra le inquadrature sono >= 18% e >= 30% PER
     COSTRUZIONE: sono cio' che strumenti/_q-regia.js conta sui
     fotogrammi. COSTO: pochi prodotti scalari, solo durante la moviola;
     M.regia (il piano di ripresa) si calcola UNA volta per nastro. */
  if(G.moviola && G.ball){
    const M=G.moviola;
    if(!M.regia){
      const fr=M.frames, b0=fr[0].b, b1=fr[fr.length-1].b;
      /* mM e' lo stesso margine di pan che render() concede alla scena
         del gol (GOAL_D+30): oltre quel muro il quadro non esce, quindi
         ogni conto di composizione si fa con lui, non con l'infinito */
      const mM=GOAL_D+30;
      /* lo zoom minimo perche' un punto stia nel terzo centrale: la sua
         distanza dal muro piu' vicino, vista a zoom S, deve valere
         almeno un terzo del quadro — S >= quadro/(3 x distanza) */
      const terzoX=function(px){ return Math.max(VW/(3*Math.max(30,FW+mM-px)), VW/(3*Math.max(30,px+mM))); };
      const terzoY=function(py){ return Math.max(VH/(3*Math.max(30,FH+mM-py)), VH/(3*Math.max(30,py+mM))); };
      /* A: tiene la traiettoria intera con la sua aria; non scende sotto
         il 92% dello zoom minimo di gioco (il mare d'erba e' il difetto
         da cui veniamo), non sale oltre lo zoom della festa del gol */
      const fitA=Math.min((VW/2-70)/Math.max(90,Math.abs(b1.x-b0.x)),
                          (VH*0.42-46)/Math.max(70,Math.abs(b1.y-b0.y)));
      const sA=Math.min(Math.max(fitA, S2_MIN_DEV*0.92, terzoX(b0.x), terzoY(b0.y)), S2_GOL_DEV);
      /* B: mai piu' largo del tetto di gioco, il 18% piu' stretto di A
         (e' il salto che rende lo stacco visibile), e abbastanza stretto
         perche' il pallone AL MOMENTO DELLO STACCO (55% del nastro) stia
         nel terzo centrale anche quando l'azione muore addosso alla
         porta, dove il muro limita il pan. Misurato senza questo
         pavimento, su un gol organico rasente la linea: pallone a 0,291
         del quadro, fuori terzo per un pelo. Il fotogramma dello stacco
         e' il primo indice INTERO sopra il 55% (ceil, la stessa
         condizione del taglio qui sotto), e il 6% di margine tiene il
         pallone DENTRO il terzo invece che sul suo bordo esatto. Il
         tetto (1,55 volte lo zoom del gol) para il caso degenere del
         nastro quasi tutto oltre la linea. */
      const b55=fr[Math.min(fr.length-1, Math.ceil((fr.length-1)*0.55))].b;
      const sB=Math.min(Math.max(S2_MAX_DEV, sA*1.18, terzoX(b55.x)*1.06, terzoY(b55.y)*1.06), S2_GOL_DEV*1.55);
      /* C: il 30% piu' stretto di B, alzato se serve perche' il torso
         del marcatore stia nel terzo centrale anche vicino al muro.
         Il marcatore si legge dall'ULTIMO fotogramma del nastro (la
         moviola ferma proprio quello); sull'autorete non c'e' nessuno
         da guardare e il soggetto resta il pallone. */
      const pU=(G.goalIdx>=0 && fr[fr.length-1].p[G.goalIdx] && !fr[fr.length-1].p[G.goalIdx].out)
                ? fr[fr.length-1].p[G.goalIdx] : b1;
      const sC=Math.max(sB*1.30, terzoX(pU.x), terzoY(pU.y));
      /* le composizioni: A guarda un terzo piu' avanti del via
         dell'azione (cosi' il punto di partenza resta nel terzo centrale
         per costruzione: l'offset e' tappato a un sesto di quadro meno
         l'aria); C mette il marcatore poco sotto il centro — il torso
         sta ~22 unita' sopra i piedi — e scivola verso il punto della
         rete quel poco che il terzo centrale concede */
      const ax=b0.x+clamp((b1.x-b0.x)/3, -(VW/6-26)/sA, (VW/6-26)/sA);
      const ay=b0.y+clamp((b1.y-b0.y)/3, -(VH/6-26)/sA, (VH/6-26)/sA);
      const cx=pU.x+clamp((b1.x-pU.x)*0.35, -VW*0.12/sC, VW*0.12/sC);
      const cy=pU.y-40/sC+clamp((b1.y-pU.y)*0.35, -VH*0.10/sC, VH*0.10/sC);
      M.regia={ zA:sA/SCALE, zB:sB/SCALE, zC:sC/SCALE, ax:ax, ay:ay, cx:cx, cy:cy };
    }
    const R=M.regia, nM=M.frames.length;
    /* C — il fotogramma della rete (o l'uscita arrivata in fondo al
       nastro: un'uscita saltata a meta' NON stacca su una rete che il
       quadro non sta mostrando) */
    if(M.fase==='rete' || (M.fase==='uscita' && M.i>=nM-1)){
      G.cam.z=R.zC; G.cam.x=R.cx; G.cam.y=R.cy;
      return;
    }
    /* B — la stretta sul pallone dal 55% del nastro */
    if(M.i>=(nM-1)*0.55){
      G.cam.z=R.zB;
      const sPix=SCALE*R.zB;
      /* il riaggancio oltre soglia E' lo stacco, ed e' cio' che tiene il
         disegno idempotente: da lontano si salta sempre sullo stesso
         punto, da vicino con rdt=0 non ci si muove di un bit. La soglia
         (12% del quadro) sta sopra il ritardo massimo dell'inseguimento
         (semivita 0,045 s su un nastro che va al 70% della velocita'),
         quindi dentro l'inquadratura non si ri-stacca mai. */
      if(Math.abs(G.ball.x-G.cam.x)*sPix>VW*0.12 || Math.abs(G.ball.y-G.cam.y)*sPix>VH*0.16){
        G.cam.x=G.ball.x; G.cam.y=G.ball.y;
      }else{
        const kM=Math.min(1,1-Math.pow(2,-rdt/0.045));
        G.cam.x+=(G.ball.x-G.cam.x)*kM;
        G.cam.y+=(G.ball.y-G.cam.y)*kM;
      }
      return;
    }
    /* A — il totale, camera ferma: il nastro scorre, il quadro no */
    G.cam.z=R.zA; G.cam.x=R.ax; G.cam.y=R.ay;
    return;
  }
  /* LA PANORAMICA DEL KICKOFF A ROSA LARGA. Sul 7 e sull'11 il calcio
     d'inizio e' l'unico momento in cui le due squadre stanno SCHIERATE, ed`,
},

/* 2 — la panoramica del kickoff si monta di stacco, non in scivolata */
{
  nome: '2/3 kickoff a rosa larga: stacco sul quadro, poi la carrellata eased',
  cerca:
`    const k=Math.min(1,1-Math.pow(2,-rdt/0.14));
    G.cam.z+=(tz-G.cam.z)*k;
    G.cam.x+=(tx-G.cam.x)*k;
    G.cam.y+=(ty-G.cam.y)*k;
    return;
  }`,
  metti:
`    /* LO STACCO DEL CALCIO D'INIZIO (voce «regia»): la carrellata non si
       raggiunge piu' in scivolata dall'inquadratura del gol o del menu —
       la regia ci STACCA sopra. La camera segue ESATTAMENTE il bersaglio
       (q e' gia' una smoothstep, quindi il moto della carrellata parte
       da fermo ed e' continuo per costruzione): il primo fotogramma del
       kickoff e' il salto, cioe' lo stacco, e da li' in poi il percorso
       e' liscio. A gioco fermo il bersaglio dipende solo da sceneT:
       due disegni consecutivi restano identici al bit. */
    G.cam.z=tz; G.cam.x=tx; G.cam.y=ty;
    return;
  }`,
},

/* 3 — il kickoff senza panoramica (taglia 5, o movimento ridotto) */
{
  nome: '3/3 kickoff senza panoramica: quadro montato di stacco sul dischetto',
  cerca:
`  const cerimonia = (G.scene==='kickoff' || G.capT>0);
  if(cerimonia){ tx=b.x; ty=b.y; }`,
  metti:
`  const cerimonia = (G.scene==='kickoff' || G.capT>0);
  if(cerimonia){ tx=b.x; ty=b.y; }
  /* LO STACCO DEL CALCIO D'INIZIO SENZA PANORAMICA (voce «regia»): sul
     5 — e sulle taglie grandi a movimento ridotto — il quadro del
     kickoff si monta DI STACCO invece che in scivolata: pallone sul
     dischetto al centro del quadro, zoom quello che la forbice ha
     appena scelto. E' il posto giusto per uno stacco: il gioco e' fermo
     e nessuno comanda. Vale SOLO nella scena kickoff: con la targa dei
     capitani ancora in campo a gioco avviato (capT>0) la molla resta
     quella di sempre, e durante il gioco attivo non si stacca MAI — e'
     il patto di questa voce, e strumenti/_q-regia.js lo conta sui
     fotogrammi. Il bersaglio e' fermo finche' il kickoff dura, quindi
     inchiodare la camera al bersaglio e' idempotente: con rdt=0 due
     disegni consecutivi danno gli stessi bit. Le garanzie dei punti 5 e
     6 qui sotto non servono a questo quadro: la camera E' sul pallone,
     che quindi non puo' essere tagliato dai bordi. */
  if(G.scene==='kickoff'){ G.cam.x=tx; G.cam.y=ty; G.cam.z=tz; return; }`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-regia.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.regia.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
/* controlli dopo la sostituzione: le tre inquadrature esistono una volta
   sola, e nel ramo di gioco attivo non e' entrata nessuna assegnazione
   secca della camera */
const attesi = [
  ['M.regia={', 1],
  ['LA REGIA DELLA MOVIOLA', 1],
  ['LO STACCO DEL CALCIO D\'INIZIO', 2],
  ['if(G.scene===\'kickoff\'){ G.cam.x=tx; G.cam.y=ty; G.cam.z=tz; return; }', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
