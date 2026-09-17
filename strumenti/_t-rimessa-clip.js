/* =====================================================================
   _t-rimessa-clip.js — LA CLIP VIAGGIA SU rimT, NON SU chargeClip (voce
   #87, correzione di revisione compito 3, ramo voce-87-rimesse-angoli).

   IL RILIEVO (dalla rettifica del piano, cima della sezione Compito 3 di
   docs/superpowers/plans/2026-09-17-rimesse-e-angoli.md). La via
   chargeClip prescritta dal compito 3 e' cieca in partita vera: la
   carica umana dura 0-3 fotogrammi (PASS_CAR_U=0,05s) prima che
   maturaAnticipi chiami chiudiAnticipo(p) — che azzera p.chargeClip —
   e la battuta CPU (eseguiAiPass -> kickBall diretto) non passa MAI
   dalla carica. La clip 'rimessa' non arrivava mai a schermo per la
   CPU, e per l'umano solo per 2-3 fotogrammi parziali.

   LA CURA. Un cronometro di SOLO DISEGNO, p.rimT, sul modello di casa
   rinvT/rinvioPortiere (:18967 p.rinvT=0.9; :33850 il ramo di rigStato).
   kickBall — l'UNICO imbuto di tutti i calci del gioco, umano/CPU/auto —
   scrive p.rimT=RIMESSA_CLIP_T nell'istante in cui la battuta di rimessa
   si chiude, PRIMA di azzerare G.battuta. Da li' il cronometro decresce
   nel passo comune di aggiornaPosa (come rinvT, gkManiT, presaT) e pilota
   un ramo nuovo in rigStato che VINCE sul calcio generico (kickT/kickB):
   la clip gioca per intero, u=0->1, sui RIMESSA_CLIP_T secondi DOPO il
   calcio — non piu' schiacciata nella carica prima di esso. I ganci
   chargeClip='rimessa' in doPassaggio/doCrossUmano sono superati e si
   rimuovono: kickClip torna a decidersi solo da chargeClip/velocita' per
   quel calcio, ma non conta piu' per il disegno durante la finestra,
   perche' il ramo rimT vince prima di arrivarci.

   LE UNDICI ANCORE:
     A. RIMESSA_CLIP_T — costante nuova, accanto alle BATTUTA_*.
     B. kickBall — l'imbuto: p.rimT=RIMESSA_CLIP_T se la battuta che si
        chiude e' una rimessa e p e' il battitore, PRIMA di G.battuta=null.
     C. aggiornaPosa — il decremento comune (dt), accanto a rinvT.
     D. rigStato — il ramo nuovo, PRIMA del calcio generico (kickT/kickB).
     E. doPassaggio — chargeClip torna sempre 'passaggio' (il gancio
        inBattuta sparisce, la via e' superata).
     F. doCrossUmano — idem, torna sempre 'cross'.
     G. resetKickoff — p.rimT=0 nel sotto-insieme dei latch del rig.
     H. posaBattuta — bt.rimT=0 nel sotto-insieme che il fischio azzera.
     I. il template del giocatore — rimT:0 di riposo, accanto a rinvT:0
        (lezione dei letterali di boot, voce #86 c5: la partita di
        default parte senza passare da setTaglia, un campo nuovo va
        verificato anche li').
     J. il campione della moviola — rimT entra accanto a rinvT (promessa
        della voce #85: pose vere anche nel replay).
     K. disegnaMoviola — la copia con mixGiu, la stessa guardia sul
        riavvio di rinvT/kickT/kickB/dive.

   inBattuta(p), la cella shot spenta, la guardia in startCharge e il
   veto del rispetto in aiDecide (le altre ancore del compito 3) NON SI
   TOCCANO: la rettifica riguarda SOLO come la clip arriva a schermo, non
   chi puo' tirare o chi rispetta il battitore.

   uso:  node strumenti/_t-rimessa-clip.js --out fuori/rimessa-clip.html
         node strumenti/_t-rimessa-clip.js --dentro
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
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/rimessa-clip.html'));

const ANCORE = [

/* A — RIMESSA_CLIP_T, accanto alle BATTUTA_* di cui condivide la casa. */
{
  nome: 'A/11 RIMESSA_CLIP_T: costante nuova accanto alle BATTUTA_*',
  cerca:
`const BATTUTA_T = { rimessa:0.8, rinvio:0.8 };   // il binario rapido del paragone
const BATTUTA_HOLD = 3.0;    // anti-stallo: entro questo tempo la battuta parte da sola
const BATTUTA_CPU = 0.5;     // la CPU batte quando restano questi secondi di hold
const BATTUTA_RAGGIO = 60;   // gli avversari vengono spinti fuori da questo raggio
`,
  metti:
`const BATTUTA_T = { rimessa:0.8, rinvio:0.8 };   // il binario rapido del paragone
const BATTUTA_HOLD = 3.0;    // anti-stallo: entro questo tempo la battuta parte da sola
const BATTUTA_CPU = 0.5;     // la CPU batte quando restano questi secondi di hold
const BATTUTA_RAGGIO = 60;   // gli avversari vengono spinti fuori da questo raggio
/* LA CLIP DELLA RIMESSA VIAGGIA SU UN CRONOMETRO SUO (voce #87,
   correzione di revisione compito 3): non piu' chargeClip (cieco in
   partita vera - la carica umana dura 0-3 fotogrammi e la CPU non
   carica affatto), ma p.rimT, sul modello di rinvT/rinvioPortiere
   (:18967 e il ramo gemello in rigStato). kickBall lo arma quando il
   battitore di una rimessa calcia davvero; da li' la clip gioca per
   intero, u=0->1, sui secondi dichiarati qui - non piu' schiacciata
   prima del calcio. */
const RIMESSA_CLIP_T = 0.55;
`,
},

/* B — kickBall, l'imbuto: il rimT si arma PRIMA che G.battuta=null
   cancelli il sapere "questa era una rimessa, e p era il battitore". */
{
  nome: 'B/11 kickBall: p.rimT=RIMESSA_CLIP_T prima di azzerare G.battuta',
  cerca:
`  /* LA BATTUTA SI CHIUDE QUI (voce #87, compito 2): kickBall e' l'unico
     imbuto di tutti i calci del gioco (umano, CPU, auto-battuta) - se il
     battitore in attesa e' proprio p, la battuta pendente e' consumata. */
  if(G.battuta && G.players[G.battuta.battitore]===p) G.battuta=null;
`,
  metti:
`  /* LA BATTUTA SI CHIUDE QUI (voce #87, compito 2): kickBall e' l'unico
     imbuto di tutti i calci del gioco (umano, CPU, auto-battuta) - se il
     battitore in attesa e' proprio p, la battuta pendente e' consumata.
     LA CLIP SI ARMA PRIMA DI DIMENTICARE (correzione di revisione
     compito 3): se la battuta che si chiude era una rimessa, p.rimT
     parte da RIMESSA_CLIP_T - un cronometro di solo disegno che da qui
     in poi pilota rigStato, sul modello di rinvT. Deve leggere
     G.battuta.tipo PRIMA della riga sotto, che lo cancella. */
  if(G.battuta && G.players[G.battuta.battitore]===p){
    if(G.battuta.tipo==='rimessa') p.rimT=RIMESSA_CLIP_T;
    G.battuta=null;
  }
`,
},

/* C — aggiornaPosa: il decremento comune, accanto a rinvT (stesso passo,
   stessa dicitura "cronometro di solo disegno"). */
{
  nome: 'C/11 aggiornaPosa: il decremento comune di p.rimT, accanto a rinvT',
  cerca:
`  if(p.presaT>0) p.presaT-=dt;
  if(p.rinvT>0) p.rinvT-=dt;
  if(p.gkManiT>0) p.gkManiT-=dt;
`,
  metti:
`  if(p.presaT>0) p.presaT-=dt;
  if(p.rinvT>0) p.rinvT-=dt;
  /* la clip della rimessa (voce #87, correzione di revisione compito 3):
     stesso trattamento di rinvT, un giocatore di movimento qualunque puo'
     portarla, quindi il decremento vive nel passo COMUNE (questa
     funzione gira per ogni giocatore, non solo per il portiere). */
  if(p.rimT>0) p.rimT-=dt;
  if(p.gkManiT>0) p.gkManiT-=dt;
`,
},

/* D — rigStato: il ramo nuovo vince sul calcio generico (kickT/kickB).
   Sta DOPO scivolata/recover (un battitore non sta scivolando) e PRIMA
   del calcio generico: appena kickBall ha armato rimT, kickT/kickB sono
   GIA' accesi dallo stesso calcio (la frustata del busto qui sotto), e
   senza questa precedenza la clip generica ('passaggio'/'cross'/'tiro')
   vincerebbe di nuovo, esattamente il difetto che questa correzione
   cura. */
{
  nome: 'D/11 rigStato: il ramo p.rimT, prima del calcio generico',
  cerca:
`  if(p.recover>0){ st.clip='scivolata'; st.u=0.70+0.25*clamp(1-p.recover/SLIDE_REC,0,1); return st; }
  /* ---- il calcio: frustata+seguito sul cronometro gia' del gioco ---- */
  if(p.kickT>0 || p.kickB>0){
`,
  metti:
`  if(p.recover>0){ st.clip='scivolata'; st.u=0.70+0.25*clamp(1-p.recover/SLIDE_REC,0,1); return st; }
  /* ---- LA RIMESSA (voce #87, correzione di revisione compito 3): sta
     QUI, PRIMA del calcio generico, e non e' un caso. kickBall arma
     p.rimT E p.kickT/p.kickB nello STESSO istante (lo stesso calcio):
     senza questa precedenza il ramo del calcio generico qui sotto
     vincerebbe sempre, e la clip 'rimessa' non si vedrebbe mai - il
     difetto esatto che questa correzione ripara. u cresce da 0 (calcio
     appena partito) a 1 (cronometro esaurito), lo stesso verso di
     rinvT qui sopra. ---- */
  if(p.rimT>0){ st.clip='rimessa'; st.u=1-(p.rimT/RIMESSA_CLIP_T); return st; }
  /* ---- il calcio: frustata+seguito sul cronometro gia' del gioco ---- */
  if(p.kickT>0 || p.kickB>0){
`,
},

/* E — doPassaggio: la via chargeClip per la rimessa e' superata, torna
   il passaggio semplice senza deviazioni. */
{
  nome: 'E/11 doPassaggio: chargeClip torna sempre passaggio',
  cerca:
`  /* IN BATTUTA IL PASSAGGIO E' UNA RIMESSA (voce #87, compito 3):
     stesso anticipo, stesso lancio - solo la clip cambia, per dire al
     pollice che quello che sta per partire e' il verbo di casa. */
  if(anticipa(p, 'passo', PASS_CAR_U, eseguiPassUmano)) p.chargeClip=inBattuta(p)?'rimessa':'passaggio';
`,
  metti:
`  /* LA VIA chargeClip PER LA RIMESSA E' SUPERATA (voce #87, correzione
     di revisione compito 3): la carica umana dura 0-3 fotogrammi
     (PASS_CAR_U) - troppo poco perche' la clip si veda. La clip vive
     ora su p.rimT, armato da kickBall quando il calcio parte davvero
     (vedi li'): qui resta solo il passaggio semplice, senza deviazioni
     per la battuta. */
  if(anticipa(p, 'passo', PASS_CAR_U, eseguiPassUmano)) p.chargeClip='passaggio';
`,
},

/* F — doCrossUmano: stesso principio, il cross torna sempre 'cross'. */
{
  nome: 'F/11 doCrossUmano: chargeClip torna sempre cross',
  cerca:
`    doCross(q, 0, 0, null, dest);
  /* IN BATTUTA IL CROSS E' UNA RIMESSA (voce #87, compito 3): stesso
     meccanismo, la clip dice al pollice che e' il verbo di casa. */
  })) p.chargeClip=inBattuta(p)?'rimessa':'cross';
`,
  metti:
`    doCross(q, 0, 0, null, dest);
  /* LA VIA chargeClip PER LA RIMESSA E' SUPERATA (voce #87, correzione
     di revisione compito 3): vedi il commento gemello in doPassaggio -
     la clip vive ora su p.rimT, armato da kickBall. */
  })) p.chargeClip='cross';
`,
},

/* G — resetKickoff: il fischio del gol azzera anche rimT, come gli
   altri latch del rig sulla stessa riga. */
{
  nome: 'G/11 resetKickoff: p.rimT=0 nel sotto-insieme dei latch del rig',
  cerca:
`    p.mesto=0; p.frenaT=0; p.fintaT=0; p.presaT=0; p.rinvT=0;   // i latch del rig
`,
  metti:
`    p.mesto=0; p.frenaT=0; p.fintaT=0; p.presaT=0; p.rinvT=0; p.rimT=0;   // i latch del rig
`,
},

/* H — posaBattuta: lo stesso sotto-insieme che il fischio azzera in
   resetKickoff, qui per il battitore che si sta appena piazzando - non
   deve ereditare una clip di rimessa aperta da una battuta precedente. */
{
  nome: 'H/11 posaBattuta: bt.rimT=0 nel sotto-insieme dei latch del battitore',
  cerca:
`  bt.slide=-1; bt.recover=0; chiudiAnticipo(bt); bt.rove=-1; bt.kickT=0; bt.kickB=0;
`,
  metti:
`  bt.slide=-1; bt.recover=0; chiudiAnticipo(bt); bt.rove=-1; bt.kickT=0; bt.kickB=0; bt.rimT=0;
`,
},

/* I — il template del giocatore: rimT:0 di riposo accanto a rinvT:0
   (lezione dei letterali di boot, voce #86 compito 5: la partita di
   default a 5 parte senza passare da setTaglia). */
{
  nome: 'I/11 template giocatore: rimT:0 di riposo accanto a rinvT:0',
  cerca:
`    frenaT:0, frenaAcc:0, fintaT:0, fintaCd:0, mesto:0, presaT:0, rinvT:0,
`,
  metti:
`    frenaT:0, frenaAcc:0, fintaT:0, fintaCd:0, mesto:0, presaT:0, rinvT:0, rimT:0,
`,
},

/* J — il campione della moviola: rimT entra accanto a rinvT (promessa
   della voce #85: pose vere anche nel replay). */
{
  nome: 'J/11 campione della moviola: rimT registrato accanto a rinvT',
  cerca:
`                          contrasto:q.contrasto, presaT:q.presaT,
                          gkManiT:q.gkManiT, rinvT:q.rinvT,
                          recover:q.recover})),
`,
  metti:
`                          contrasto:q.contrasto, presaT:q.presaT,
                          gkManiT:q.gkManiT, rinvT:q.rinvT,
                          /* rimT ENTRA NEL CAMPIONE (voce #87, correzione
                             di revisione compito 3): stesso trattamento
                             dei cinque campi qui sopra (voce #85, compito
                             3) - un cronometro di solo disegno che
                             decresce a zero e pilota st.u/st.clip in modo
                             continuo. Senza, un replay che rivede una
                             rimessa perderebbe la clip nuova e mostrerebbe
                             il corpo fermo o il calcio generico. */
                          rimT:q.rimT,
                          recover:q.recover})),
`,
},

/* K — disegnaMoviola: la copia con mixGiu, la stessa guardia sul
   riavvio di rinvT/kickT/kickB/dive/contrasto/presaT/gkManiT/recover. */
{
  nome: 'K/11 disegnaMoviola: rimT si interpola con mixGiu, come rinvT',
  cerca:
`    if(f.rinvT!==undefined) q.rinvT=mixGiu(f.rinvT,(g.rinvT!==undefined?g.rinvT:f.rinvT));
    if(f.recover!==undefined) q.recover=mixGiu(f.recover,(g.recover!==undefined?g.recover:f.recover));
`,
  metti:
`    if(f.rinvT!==undefined) q.rinvT=mixGiu(f.rinvT,(g.rinvT!==undefined?g.rinvT:f.rinvT));
    /* rimT segue lo stesso trattamento di rinvT (voce #87, correzione di
       revisione compito 3): decresce a zero, si interpola con mixGiu, la
       stessa guardia sul riavvio (saltaGiu: non risale mai da solo). */
    if(f.rimT!==undefined) q.rimT=mixGiu(f.rimT,(g.rimT!==undefined?g.rimT:f.rimT));
    if(f.recover!==undefined) q.recover=mixGiu(f.recover,(g.recover!==undefined?g.recover:f.recover));
`,
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

/* CONTEGGI A DELTA: marker distintivi di ciascuna sostituzione, ognuno
   atteso +1 fra src e out. */
const conta = (testo, s) => testo.split(s).length - 1;
const attesi = [
  ['const RIMESSA_CLIP_T = 0.55;', 1],
  ["if(G.battuta.tipo==='rimessa') p.rimT=RIMESSA_CLIP_T;\n    G.battuta=null;", 1],
  ['if(p.rimT>0) p.rimT-=dt;', 1],
  ["if(p.rimT>0){ st.clip='rimessa'; st.u=1-(p.rimT/RIMESSA_CLIP_T); return st; }", 1],
  ["if(anticipa(p, 'passo', PASS_CAR_U, eseguiPassUmano)) p.chargeClip='passaggio';", 1],
  ["    doCross(q, 0, 0, null, dest);\n  /* LA VIA chargeClip PER LA RIMESSA E' SUPERATA", 1],
  ['p.rinvT=0; p.rimT=0;   // i latch del rig', 1],
  ['bt.kickT=0; bt.kickB=0; bt.rimT=0;', 1],
  ['rinvT:0, rimT:0,', 1],
  ['rimT:q.rimT,', 1],
  ['if(f.rimT!==undefined) q.rimT=mixGiu(f.rimT,(g.rimT!==undefined?g.rimT:f.rimT));', 1],
];
const rotti = attesi.filter(([s, n]) => (conta(out, s) - conta(src, s)) !== n)
  .map(([s, n]) => s + ' atteso +' + n + ', trovato +' + (conta(out, s) - conta(src, s)));
/* le forme vecchie devono sparire (sostituite, non duplicate) */
const scomparsi = [
  "if(G.battuta && G.players[G.battuta.battitore]===p) G.battuta=null;",
  "if(anticipa(p, 'passo', PASS_CAR_U, eseguiPassUmano)) p.chargeClip=inBattuta(p)?'rimessa':'passaggio';",
  "  })) p.chargeClip=inBattuta(p)?'rimessa':'cross';",
];
for (const s of scomparsi) {
  if (conta(out, s) !== 0) rotti.push(s + ' atteso 0 in uscita, trovato ' + conta(out, s));
}
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
