/* =====================================================================
   _t-l16.js — L1.6, LA PULSANTIERA A QUATTRO DISCHI.

   Il mandato del committente, 23 agosto 2026: «mancano ancora tutti i
   tasti che ci sono in un controller — al momento solo due tasti e la
   direzione, nulla paragonabile ad una giocabilita' tipo controller».

   I verbi c'erano GIA' quasi tutti, ma tre stavano nascosti dietro
   combinazioni che nessun pollice scopre da solo: il cross dietro
   «scatto tenuto + pulsante piccolo», la scivolata dietro «trascina il
   disco grande» (L1.2), il raddoppio dietro «trascina il CAMBIO»
   (L1.5). Un controller li mette SUI TASTI. Questa toppa fa lo stesso:

     disco 0 (r40)  TIRA      / CONTRASTA      — INTOCCATO
     disco 1 (r30)  PASSAGGIO / CAMBIO         — INTOCCATO
     disco 2 (r26)  PASSA     / PRESSA         — nuovo
     disco 3 (r26)  CROSS     / SCIVOLATA      — nuovo

   La mappa contro il pad di FC: A=PASSA, Y=PASSAGGIO (filtrante con la
   levetta puntata), X=CROSS, B=TIRA; LB=CAMBIO, RB=PRESSA, B difensivo=
   CONTRASTA (pressione=piede, tenuta=contenimento, trascinamento=
   scivolata), X difensivo=SCIVOLATA secca. Lo scatto resta sulla
   levetta (oltre 66 px) e il pallonetto sulla levetta indietro al
   rilascio: sono modificatori ANALOGICI, e un tasto in meno da coprire
   col pollice e' un pezzo di schermo in piu' che si vede.

   ---------------------------------------------------------------------
   LE DECISIONI CHE COSTANO, DICHIARATE.

   1. I DUE DISCHI VECCHI NON SI MUOVONO DI UN PIXEL e non cambiano un
      atto: ogni cancello che li conosce (giocata, _q-precedenza,
      _q-l11/12/13/15) li ritrova identici. I nuovi si AGGIUNGONO in
      coda all'elenco: l'indice — l'identita' su cui il ri-armo di L1.1
      rilegge il disco — resta 0 il grande, 1 il piccolo, 2 e 3 i nuovi,
      in TUTTI E DUE i contesti. Un disco che sparisse col contesto
      lascerebbe il ri-armo a leggere undefined.

   2. LA GEOMETRIA E' PAGATA SULLA PRESA (r+10), come la mezzaluna di
      _t-precedenza insegna: le sei coppie distano al minimo 84,6 px
      contro prese sommate di 72 (coppia 2-3) e 88,8 contro 86 (coppia
      0-2, il margine piu' stretto: 2,8 px). Nessuna presa si
      sovrappone, e la doppia passata normalizzata di Touch5.start fa
      il resto. I nuovi stanno SOPRA i vecchi: il pollice destro riposa
      sul grande e sale, senza attraversare lo schermo.

   3. IL CROSS DEL DITO HA UN DESTINATARIO. doCross senza dest lascia
      crossTo=-1 e il pallone alto non lo attacca nessuno (il difetto
      censito: «quei cross non li gioca nessuno»). Il disco sceglie il
      compagno di movimento piu' vicino al punto d'atterraggio e glielo
      dice. E il CROSS lavora da OGNI meta' campo: dalla propria e' il
      lancio lungo — stesso gesto, stessa palla alta — perche' un disco
      che dicesse CROSS e non facesse niente sarebbe il difetto L0.4b
      reintrodotto (67,68% di etichette false, pagato per toglierlo).

   4. PRESSA RADDOPPIA SU UN UOMO. Con un portatore avversario manda il
      compagno in direzione del portatore (comandaRaddoppio, lo stesso
      di L1.5: un concetto, un meccanismo). Con il pallone di nessuno
      TACE, ed e' la stessa dichiarazione di comandaRaddoppio: mandare
      un compagno su un pallone libero e' un altro verbo, con un altro
      bersaglio, e vorrebbe una misura sua. Il disco lo dice il
      tutorial, e il cancello (_q-l16 prova D) lo misura in tutti e due
      i rami.

   5. SCIVOLATA E' IL VERBO DI IERI, INTERO: doSlide senza fase — parte
      subito, mira rifatta sul pallone. L1.2 l'ha tolta dalla PRESSIONE
      del disco grande perche' 138 pressioni su 140 stendevano un corpo
      che non voleva stendersi; chi la vuole secca adesso la CHIEDE, su
      un tasto suo, e chi preme CONTRASTA resta in piedi.

   6. LA TASTIERA NON CAMBIA DI UN BIT, e il modificatore «scatto +
      piccolo = cross» RESTA: due strade per lo stesso verbo non sono
      un difetto, e il cancello giocata.js lo misura ancora per la sua
      strada.

   Toppa cerca/sostituisci: NOVE ancoraggi esatti, ognuno una volta sola,
   o non si scrive niente. Cancello: strumenti/_q-l16.js (visto ROSSO
   sul gioco senza toppa: A trova due dischi).

   uso:
     node strumenti/_t-l16.js --out fuori/l16.html
     node strumenti/_t-l16.js --in altro.html --out x.html
     node strumenti/_t-l16.js --dentro
     node strumenti/_t-l16.js --elenco
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

/* 1 — l'elenco dei dischi passa da due a quattro */
{
  nome: '1/9 touchBtnLayout: quattro dischi, i primi due intoccati',
  cerca:
`  return dentroGliInserti([
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60, r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60, r:40 },
    passa ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72, r:30 }
          : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72, r:30 },
  ], s);`,
  metti:
`  /* L1.6 — QUATTRO DISCHI, E L'ORDINE E' UN CONTRATTO: 0 il grande,
     1 il piccolo, 2 e 3 i nuovi, uguale in tutti e due i contesti —
     il ri-armo di L1.1 rilegge il disco per INDICE, e un elenco che
     cambiasse lunghezza col possesso gli farebbe leggere undefined.
     La geometria e' pagata sulla PRESA (r+10): la coppia piu' stretta
     e' 0-2, 88,8 px di distanza contro 86 di prese sommate. I nuovi
     stanno SOPRA i vecchi, dove il pollice destro sale senza
     attraversare lo schermo. Ogni disco fa la SUA domanda («cosa
     otterrebbe il dito»), con le stesse due guardie di sempre: nessuna
     dipendenza nuova entra qui — _q-precedenza ricostruisce questa
     funzione e ogni nome nuovo l'ha gia' uccisa due volte. */
  return dentroGliInserti([
    tira  ? { act:'shot',    label:'TIRA',      x:bx+s*64,  y:VH-60,  r:40 }
          : { act:'slide',   label:'CONTRASTA', x:bx+s*64,  y:VH-60,  r:40 },
    passa ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72,  r:30 }
          : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72,  r:30 },
    passa ? { act:'pass',    label:'PASSA',     x:bx+s*52,  y:VH-148, r:26 }
          : { act:'press',   label:'PRESSA',    x:bx+s*52,  y:VH-148, r:26 },
    passa ? { act:'cross',   label:'CROSS',     x:bx+s*136, y:VH-158, r:26 }
          : { act:'tackle',  label:'SCIVOLATA', x:bx+s*136, y:VH-158, r:26 },
  ], s);`,
},

/* 2 — i quattro verbi nuovi alla pressione */
{
  nome: '2/9 Touch5.start: i verbi dei dischi nuovi',
  cerca:
`        else if(bt.act==='through') doFiltrante(t, humanSprint(t));
        else if(bt.act==='swap') cambiaGiocatore(t);`,
  metti:
`        else if(bt.act==='through') doFiltrante(t, humanSprint(t));
        else if(bt.act==='swap') cambiaGiocatore(t);
        /* L1.6 — i dischi nuovi. Tutti e quattro vivono sulla
           PRESSIONE, come il passaggio: il loro rilascio resta inerte
           (nessun ramo in Touch5.chiudi), quindi nessun touchcancel
           puo' produrre un calcio che il dito non ha chiesto. */
        else if(bt.act==='pass') doPassaggio(t);
        else if(bt.act==='cross') doCrossUmano(t);
        else if(bt.act==='press') comandaPressa(t);
        else if(bt.act==='tackle') doSlide(t);`,
},

/* 3 — i tre verbi nuovi, scritti accanto ai fratelli */
{
  nome: '3/9 doPassaggio, doCrossUmano, comandaPressa',
  cerca:
`/* --- FILTRANTE: la palla tesa e rasoterra sulla corsa dello smarcato ---`,
  metti:
`/* =====================================================================
   L1.6 — I VERBI DEI DISCHI NUOVI. Nessuno di questi tre inventa un
   meccanismo: doPassaggio entra dallo stesso anticipo del passo,
   doCrossUmano dallo stesso doCross della CPU, comandaPressa dallo
   stesso comandaRaddoppio di L1.5. Un concetto, un meccanismo — e' la
   riserva che ha bocciato L1.4, imparata.
   ===================================================================== */
/* il passaggio SEMPLICE: palla al piu' smarcato, ai piedi. E' il verbo
   che la tastiera ha su C da sempre; sul vetro non aveva un tasto suo. */
function doPassaggio(t){
  if(!puoPassare(t)) return;
  const p=ctrlPlayer(t);
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);   // stava caricando il tiro: cambia idea
  if(anticipa(p, 'passo', PASS_CAR_U, eseguiPassUmano)) p.chargeClip='passaggio';
}
/* il CROSS col tasto suo. Da ogni meta' campo: dalla propria e' il
   lancio lungo, stesso gesto e stessa palla alta — un disco che dicesse
   CROSS e a volte non facesse niente sarebbe L0.4b reintrodotto.
   E ha un DESTINATARIO: il compagno di movimento piu' vicino al punto
   d'atterraggio, cosi' il pallone alto e' di qualcuno invece di cadere
   fra i corpi (il difetto censito: «quei cross non li gioca nessuno»). */
function doCrossUmano(t){
  if(!puoPassare(t)) return;
  const p=ctrlPlayer(t);
  if(p.charge>=0 && !p.chargeGo) chiudiAnticipo(p);
  if(anticipa(p, 'passo', PASS_CAR_U, q=>{
    const pc=puntoCross(q);
    let dest, bd=1e9;
    for(let i=0;i<G.players.length;i++){
      const w=G.players[i];
      if(w.team!==q.team || w===q || w.out>0 || w.role==='gk') continue;
      const d=len(w.x-pc[0], w.y-pc[1]);
      if(d<bd){ bd=d; dest=i; }
    }
    doCross(q, 0, 0, null, dest);
  })) p.chargeClip='cross';
}
/* PRESSA: il raddoppio di L1.5, senza il trascinamento — la direzione
   la da' il portatore stesso. Con il pallone di nessuno TACE, per la
   stessa ragione scritta sopra comandaRaddoppio: il verbo raddoppia SU
   UN UOMO, e mandare un compagno su un pallone libero e' un altro
   verbo, con un'altra misura. */
function comandaPressa(t){
  const p=ctrlPlayer(t);
  if(!p) return;
  const b=G.ball;
  const o = b.owner>=0 ? G.players[b.owner] : null;
  if(!o || o.team===t || o.out>0) return;
  const dx=o.x-p.x, dy=o.y-p.y, l=Math.max(1,len(dx,dy));
  comandaRaddoppio(t, dx/l, dy/l);
}

/* --- FILTRANTE: la palla tesa e rasoterra sulla corsa dello smarcato ---`,
},

/* 4 — la lavagna dei gesti: il passaggio ha un tasto suo */
{
  nome: '4/9 lavagna: la riga del passaggio',
  cerca:
`            <b class="gn">Passaggio</b><span class="gt">pulsante piccolo<span class="soloKb"> &middot; <kbd>C</kbd></span> &mdash; palla al pi&ugrave; smarcato</span></div>`,
  metti:
`            <b class="gn">Passaggio</b><span class="gt">pulsante <b>PASSA</b><span class="soloKb"> &middot; <kbd>C</kbd></span> &mdash; palla al pi&ugrave; smarcato, ai piedi</span></div>`,
},

/* 5 — la lavagna: la scivolata dice le sue due strade */
{
  nome: '5/9 lavagna: la riga della scivolata',
  cerca:
`            <b class="gn">Scivolata</b><span class="gt">pulsante grande senza palla (<b>CONTRASTA</b>)<span class="soloKb"> &middot; <kbd>Z</kbd></span> &mdash; di fronte &egrave; rubata, da dietro &egrave; fallo</span></div>`,
  metti:
`            <b class="gn">Scivolata</b><span class="gt">trascina <b>CONTRASTA</b> e rilascia, o pulsante <b>SCIVOLATA</b><span class="soloKb"> &middot; <kbd>Z</kbd></span> &mdash; di fronte &egrave; rubata, da dietro &egrave; fallo</span></div>`,
},

/* 6 — la lavagna: il cross ha un tasto suo, e due righe nuove */
{
  nome: '6/9 lavagna: cross col tasto, piu\' contrasto e pressa',
  cerca:
`            <b class="gn">Cross</b><span class="gt">pulsante piccolo con lo <b>scatto</b> tenuto, dalla met&agrave; campo offensiva &mdash; palla alta sul secondo palo</span></div>
        </div>`,
  metti:
`            <b class="gn">Cross</b><span class="gt">pulsante <b>CROSS</b> (o il piccolo con lo <b>scatto</b> tenuto) &mdash; palla alta sul secondo palo, un compagno la attacca</span></div>
          <div class="ges"><svg class="gsvg" viewBox="0 0 120 64" aria-hidden="true"><path d="M34 26l12 14m0-14L34 40"/><circle class="lieve" cx="40" cy="33" r="12"/><circle class="avv" cx="82" cy="30" r="8"/><circle class="palla" cx="70" cy="42" r="3.6"/></svg>
            <b class="gn">Contrasto</b><span class="gt">premi <b>CONTRASTA</b>: piede teso, subito e in piedi; tieni premuto e contieni il portatore</span></div>
          <div class="ges"><svg class="gsvg" viewBox="0 0 120 64" aria-hidden="true"><path d="M20 30l12 14m0-14L20 44"/><circle class="avv" cx="88" cy="26" r="8"/><path d="M46 52 80 32"/><path d="M80 32l-9-1m9 1l-6 7"/></svg>
            <b class="gn">Pressa</b><span class="gt">pulsante <b>PRESSA</b> &mdash; il compagno in direzione del portatore va a raddoppiare</span></div>
        </div>`,
},

/* 7 — la lavagna: il riassunto dei dischi */
{
  nome: '7/9 lavagna: il riassunto nomina i quattro dischi',
  cerca:
`<b>Stick a sinistra; a destra TIRA/CONTRASTA e PASSAGGIO/CAMBIO cambiano col possesso</b>`,
  metti:
`<b>Stick a sinistra; a destra quattro dischi che cambiano col possesso: TIRA/CONTRASTA, PASSAGGIO/CAMBIO, PASSA/PRESSA e CROSS/SCIVOLATA</b>`,
},

/* 8 — il commento del layout smette di dire «due dischi» dove elenca i
       lettori (resta vero: la sorgente e' unica, i lettori gli stessi) */
{
  nome: '8/9 il commento della sorgente unica resta onesto',
  cerca:
`     l'incrocio a 1 px fra pulsanti e comandiTouch continua a tornare, e
     L'ORDINE DELL'ELENCO NON CAMBIA — 0 il grande, 1 il piccolo — che e'
     l'identita' su cui il motore d'ingresso rilegge il disco armato. */`,
  metti:
`     l'incrocio a 1 px fra pulsanti e comandiTouch continua a tornare, e
     L'ORDINE DELL'ELENCO NON CAMBIA — 0 il grande, 1 il piccolo, 2 e 3
     i dischi di L1.6 — che e' l'identita' su cui il motore d'ingresso
     rilegge il disco armato. */`,
},

/* 9 — lo schema unico dichiara quattro pulsanti, non due */
{
  nome: '9/9 il cappello dello schema unico',
  cerca:
`/* ---------- touch: LO SCHEMA UNICO ----------
   Stick a sinistra + DUE pulsanti contestuali a destra, sempre, coi
   flick dello stick sempre attivi.`,
  metti:
`/* ---------- touch: LO SCHEMA UNICO ----------
   Stick a sinistra + QUATTRO pulsanti contestuali a destra (L1.6),
   sempre, coi flick dello stick sempre attivi.`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l16.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l16.html';
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
/* il controllo DOPO la sostituzione: le funzioni nuove esistono una
   volta sola, i chiamanti sono quelli previsti, i quattro atti nuovi
   compaiono una volta ciascuno nell'elenco dei dischi. */
const attesi = [
  ['function doPassaggio(', 1], ['function doCrossUmano(', 1], ['function comandaPressa(', 1],
  ["act:'pass'", 1], ["act:'cross'", 1], ["act:'press'", 1], ["act:'tackle'", 1],
  ["label:'PASSA'", 1], ["label:'PRESSA'", 1], ["label:'CROSS'", 1], ["label:'SCIVOLATA'", 1],
  ['doPassaggio(t)', 2], ['doCrossUmano(t)', 2], ['comandaPressa(t)', 2],
  ['doSlide(t);', 2],                    // la tastiera, e il disco SCIVOLATA
  ['comandaRaddoppio(', 3],              // la definizione, il rilascio di L1.5, comandaPressa
  ['eseguiPassUmano', 7],                // le 6 di ieri (definizione, ripiego della filtrante, commenti) piu' doPassaggio
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
