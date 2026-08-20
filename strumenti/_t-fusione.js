/* =====================================================================
   _t-fusione.js — LE FIGURE NON SI TELETRASPORTANO PIU' A OGNI CAMBIO
   DI POSA.

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce DIECI ancoraggi ESATTI e scrive la copia in --out. Senza
   --out scrive accanto all'originale un file col suffisso
   .fusione.html: mai sull'originale, se non con --dentro. Se anche un
   solo ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma con codice
   1, dice quale, e non scrive niente.

   uso:
     node strumenti/_t-fusione.js --out fuori/CALCETTO-fusione.html
     node strumenti/_t-fusione.js --in altro.html --out x.html
     node strumenti/_t-fusione.js --spenta --out x.html   (controllo negativo:
                                  isteresi dentro, fusione a durata ZERO)
     node strumenti/_t-fusione.js --elenco

   ---------------------------------------------------------------------
   IL FATTO (censimento 20 agosto, _analisi/COSA-MANCA.md §2.2, rifatto
   oggi con strumenti/_q-fusione.js sui giunti DISEGNATI): sui cambi di
   clip il giunto peggiore salta di 0,424 m mediani in un sessantesimo
   (metro 2D di schermo; il censimento in 3D di posa dava 0,504) contro
   0,066 a clip invariata — 6,4 volte tanto — e le andature a soglia
   secca fanno 591 cambi camminata<->corsa per 90 s, piu' ~198
   sfarfallii del portiere. Nessuna fusione: rigStato restituisce
   (clip,u) senza memoria e Rig3D.disegna valuta UNA posa a UN istante.

   LE DUE MANOVRE, distinte e distintamente spegnibili:

   (a) L'ISTERESI DELLE ANDATURE. Le soglie 14 e 62 u/s diventano una
       porta a due battenti: si ENTRA in corsa a 66 e se ne ESCE a 52,
       si entra in camminata a 18 e se ne esce a 10. Lo stato vive in
       p.rigAnda (solo disegno, la fisica non lo legge mai) e la prima
       lettura lo semina con le soglie VECCHIE, cosi' il primo
       fotogramma disegnato coincide con quello di ieri. Idempotente nel
       fotogramma: l'ombra legge prima del corpo, con lo stesso v, e lo
       stato converge alla prima lettura.

   (b) LA FUSIONE FRA DUE POSE. Quando la clip DISEGNATA cambia (LOD
       compreso: si giudica p.poseClip, che e' cio' che drawPlayer ha
       davvero disegnato, non una copia della regola), per FUSIONE_T =
       0,12 s il rig mescola la posa vecchia — congelata alla fase
       dell'ultimo fotogramma in cui fu disegnata — con la nuova, su
       una rampa levigata w*w*(3-2w). La miscela e' sulle POSIZIONI dei
       giunti: a meta' strada un osso puo' accorciarsi di qualche punto
       percentuale, e a 6-9 px di arto non si vede (verificato a
       dimensione vera, vedi la consegna); le due pose sorgenti restano
       nella gabbia delle lunghezze e nella scatola convessa degli
       angoli. Il cronometro p.fondT si consuma in aggiornaPosa (nella
       SIMULAZIONE), mai nel disegno: un render ripetuto sullo stesso
       stato produce lo stesso fotogramma, che e' il patto di _posa.js.
       L'ombra di posa (drawOmbreGiocatori -> ombraTraccia) dichiara la
       STESSA fusione prima di gettare la posa a terra: corpo e ombra
       restano un oggetto solo.

   COSA NON FA, dichiarato: non fonde l'IMBARDATA (l'entrata in
   scivolata/tuffo gira ancora il corpo in un fotogramma); non tocca la
   moviola (rilegge un ring di (clip,u) registrati e li' il cambio resta
   secco); non tocca il duello dei rigori ne' il menu (nessuno dei due
   dichiara una fusione, quindi restano a posa pura per costruzione);
   strumenti/istantanea.js, che ridipinge le figure per farsi una
   maschera chiamando rigStato+Rig3D senza dichiarare la fusione, su un
   fotogramma congelato A META' TRANSIZIONE avra' la maschera scostata
   fino a ~metà del salto per le sole figure in transizione.

   IL COSTO. La fusione paga UNA valutazione di posa in piu' (54 float
   di miscela) per figura in transizione, per 0,12 s a cambio, per i due
   lettori (ombra e corpo). Misurato appaiato con prestazione.js
   --contro (i numeri stanno nella consegna, non qui: qui si dichiara
   solo che vanno misurati alle tre taglie, 5/7/11).

   IL CANCELLO: strumenti/_q-fusione.js, scritto PRIMA di questa toppa e
   nato ROSSO sul gioco di oggi. Misure definitive (seme 20260820, col
   bavaglio alla ricottura, 20 agosto 2026):
     taglia  5 (90 s): orig 6,45x / 563 cambi / 0,394 m -> toppa 0,15x / 57 / 0,008
     taglia  7 (60 s): orig 5,95x / 593 / 0,398        -> toppa 0,24x / 74 / 0,028
     taglia 11 (60 s): orig 6,38x / 485 / 0,404        -> toppa 0,24x / 57 / 0,012
   e l'appaiamento e' AL BIT: stesso punteggio e stessi sorteggi fra
   originale e toppa a pari seme, a tutte e tre le taglie.
   Controllo negativo: --spenta lascia l'isteresi e AZZERA la durata
   della fusione; misurato, il cancello torna rosso dove deve (8,55x e
   0,40 m) e resta verde sul conteggio, che e' figlio dell'isteresi.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   GLI ANCORAGGI. Testo esatto cercato, testo esatto messo al suo posto.
   Nessuna espressione regolare, nessun numero di riga.
   -------------------------------------------------------------------- */
const ANCORE = [

/* 1 — lo scratch della seconda posa e la dichiarazione monouso, dentro Rig3D */
{
  nome: '1/10 Rig3D: lo scratch PFON e la dichiarazione fondi()',
  cerca:
`/* --- scratch riusati: MAI allocati nel frame --- */
const P  = new Float32Array(NJ*3);   // posa locale (x lato, y su, z avanti)
const SX = new Float32Array(NJ);     // proiezione schermo x`,
  metti:
`/* --- scratch riusati: MAI allocati nel frame --- */
const P  = new Float32Array(NJ*3);   // posa locale (x lato, y su, z avanti)
/* LA FUSIONE FRA DUE POSE (le figure non si teletrasportano piu' a ogni
   cambio di clip). PFON e' lo scratch della seconda posa: nasce QUI, una
   volta, mai nel fotogramma. FCLIP/FU/FW sono la dichiarazione MONOUSO
   del chiamante (Rig3D.fondi): la prossima valutazione di posa li
   consuma e li spegne, cosi' il duello, il menu e il banco — che non
   dichiarano niente — restano a posa pura per costruzione. */
const PFON = new Float32Array(NJ*3);
let FCLIP='', FU=0, FW=1;
function fondi(nomeClip,u,w){ FCLIP=nomeClip; FU=u; FW=w; }
const SX = new Float32Array(NJ);     // proiezione schermo x`,
},

/* 2 — posaFusa, definita davanti a disegna() */
{
  nome: '2/10 Rig3D: posaFusa davanti a disegna()',
  cerca:
`function disegna(ctx,cx,cy,hPx,yaw,nomeCam,nomeClip,tSec,look,senzaOmbra,pxs,filo){`,
  metti:
`/* posaFusa — valuta la clip e, se un chiamante ha dichiarato una
   transizione con fondi(), MESCOLA la posa vecchia (congelata alla fase
   dell'ultimo fotogramma disegnato) con la nuova, peso FW: 0 = tutta la
   vecchia, 1 = tutta la nuova. PERCHE': rigStato cambia clip in un
   fotogramma secco e il giunto peggiore saltava di 0,42 m mediani in un
   sessantesimo, contro 0,066 a clip ferma (misurato dai giunti disegnati,
   strumenti/_q-fusione.js). La miscela e' sulle POSIZIONI dei giunti:
   per 0,12 s un osso puo' accorciarsi di qualche punto percentuale a
   meta' strada — a 6-9 px di arto non si vede — mentre le due pose
   sorgenti restano nella gabbia delle lunghezze e nella scatola convessa
   degli angoli. FW si spegne QUI, sempre: nessuna fusione sopravvive
   alla figura per cui era stata dichiarata. */
function posaFusa(clip,u){
  clip.pose(u);
  if(FW<1){
    const c2=CLIPS[FCLIP];
    if(c2){
      PFON.set(P);                       // la posa NUOVA appena valutata
      let u2=FU%1; if(u2<0)u2+=1;
      c2.pose(u2);                       // la posa VECCHIA, congelata
      const w=FW;
      for(let k=0;k<NJ*3;k++) P[k]+=(PFON[k]-P[k])*w;
    }
  }
  FW=1;
}
function disegna(ctx,cx,cy,hPx,yaw,nomeCam,nomeClip,tSec,look,senzaOmbra,pxs,filo){`,
},

/* 3 — disegna() valuta la posa eventualmente fusa */
{
  nome: '3/10 disegna(): clip.pose(u) diventa posaFusa(clip,u)',
  cerca:
`  clip.pose(u);
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    SX[j]=cx+xw*s;`,
  metti:
`  posaFusa(clip,u);   /* la posa, eventualmente fusa con la precedente (vedi fondi) */
  for(let j=0;j<NJ;j++){
    const x=P[j*3], y=P[j*3+1], z=P[j*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    SX[j]=cx+xw*s;`,
},

/* 4 — l'ombra di posa getta la stessa posa fusa del corpo */
{
  nome: '4/10 ombraTraccia(): clip.pose(u) diventa posaFusa(clip,u)',
  cerca:
`  let u=(tSec*clip.freq)%1; if(u<0)u+=1;
  clip.pose(u);
  const cam=CAMERE.alto;`,
  metti:
`  let u=(tSec*clip.freq)%1; if(u<0)u+=1;
  posaFusa(clip,u);   /* stessa fusione del corpo: l'ombra getta la posa che si disegnera' */
  const cam=CAMERE.alto;`,
},

/* 5 — l'esportazione di fondi */
{
  nome: '5/10 Rig3D esporta fondi',
  cerca:
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia,`,
  metti:
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia, fondi,`,
},

/* 6 — il cronometro della fusione si consuma nella SIMULAZIONE */
{
  nome: '6/10 aggiornaPosa: p.fondT si consuma coi latch del rig',
  cerca:
`  if(p.frenaT>0) p.frenaT-=dt;
  if(p.fintaT>0) p.fintaT-=dt;`,
  metti:
`  if(p.frenaT>0) p.frenaT-=dt;
  /* il cronometro della fusione di posa si consuma QUI, nella
     simulazione, mai nel disegno: un render ripetuto sullo stesso stato
     deve produrre lo stesso fotogramma (e' il patto di _posa.js). */
  if(p.fondT>0) p.fondT-=dt;
  /* la velocita' LEVIGATA (0,25 s) per la SCELTA dell'andatura: la
     velocita' istantanea dell'IA balla su e giu' per tutta la banda a
     ogni urto e correzione di rotta, e la sola isteresi lasciava 507
     cambi camminata<->corsa per 90 s (misurato, _q-fusione.js). La fase
     del passo continua a leggere la v VERA — i piedi non slittano — e
     la fisica non legge mai questo campo: e' memoria di solo disegno. */
  p.vLisc = (p.vLisc===undefined ? v : p.vLisc + (v-p.vLisc)*Math.min(1, dt/0.25));
  if(p.fintaT>0) p.fintaT-=dt;`,
},

/* 7 — FUSIONE_T e rigFusione, accanto alle costanti dell'adattatore */
{
  nome: '7/10 rigFusione e FUSIONE_T accanto a FRENA_T',
  cerca:
`const FRENA_T = 0.5;       // latch della frenata (cosmetico)`,
  metti:
`const FRENA_T = 0.5;       // latch della frenata (cosmetico)
/* =====================================================================
   LA FUSIONE FRA CLIP — il cambio di posa smette di essere un fotogramma
   secco. PERCHE': misurato sui giunti disegnati (_q-fusione.js), il
   giunto peggiore saltava di 0,42 m mediani in 1/60 s a ogni cambio di
   clip, 6,4 volte il salto a clip ferma. Qui si arma la transizione: la
   clip vecchia e la sua fase CONGELATE al momento del cambio, un
   cronometro p.fondT che aggiornaPosa consuma. Il cambio si riconosce
   sulla POSA DISEGNATA (p.poseClip, scritta da drawPlayer alla fine di
   ogni figura), LOD compreso: si giudica cio' che va sullo schermo, non
   una seconda derivazione della regola che potrebbe divergere. Armare
   e' idempotente nel fotogramma: l'ombra arma per prima, il corpo
   riarma con gli stessi identici valori perche' p.poseClip non e'
   ancora stato riscritto. Solo disegno: la fisica non legge nessuno di
   questi campi. */
const FUSIONE_T = 0.12;    // durata della transizione fra due clip (s)
function rigFusione(p, st){
  if(p.poseClip && st.clip!==p.poseClip && Rig3D.CLIPS[p.poseClip]){
    p.fondClip=p.poseClip; p.fondU=p.poseU||0; p.fondT=FUSIONE_T;
  }
  if(!(p.fondT>0) || !p.fondClip || p.fondClip===st.clip) return;
  let w=1-p.fondT/FUSIONE_T;
  if(w<0)w=0; else if(w>=1)return;
  w=w*w*(3-2*w);           // rampa levigata: parte piano, arriva piano
  Rig3D.fondi(p.fondClip, p.fondU, w);
}`,
},

/* 8 — l'isteresi delle andature al posto delle soglie secche */
{
  nome: '8/10 rigStato: isteresi delle andature',
  cerca:
`  st.clip = v<14 ? (gk?'attesaGK':'fermo') : v<62 ? 'camminata' : 'corsa';`,
  metti:
`  /* L'ISTERESI DELLE ANDATURE. PERCHE': le soglie secche a 14 e 62 u/s
     facevano sfarfallare la clip sul rumore di velocita' dell'IA —
     misurato 591 cambi camminata<->corsa per 90 s e ~198 sfarfallii del
     portiere (_q-fusione.js sul gioco del 20 agosto). Una soglia per
     ENTRARE e una piu' bassa per USCIRE: corsa a 66, se ne esce a 52;
     camminata a 18, se ne esce a 10. p.rigAnda e' memoria di solo
     disegno (la fisica non la legge mai) e la prima lettura la semina
     con le soglie VECCHIE, cosi' il primo fotogramma coincide con
     quello di ieri. La soglia legge la velocita' LEVIGATA (p.vLisc,
     aggiornata in aggiornaPosa dove vive il dt): l'andatura e' una
     decisione sul mezzo secondo, non sul singolo fotogramma — la fase
     del passo, che invece deve inchiodare i piedi all'erba, continua a
     leggere la v vera. Idempotente nel fotogramma: a parita' di vg una
     seconda lettura (l'ombra legge prima del corpo) non muove piu' lo
     stato. */
  const vg = p.vLisc===undefined ? v : p.vLisc;
  let anda = p.rigAnda===undefined ? (vg<14?0 : vg<62?1 : 2) : p.rigAnda;
  if(anda===2){ if(vg<52) anda=(vg<10?0:1); }
  else if(anda===1){ if(vg>=66) anda=2; else if(vg<10) anda=0; }
  else { if(vg>=66) anda=2; else if(vg>=18) anda=1; }
  p.rigAnda=anda;
  st.clip = anda===0 ? (gk?'attesaGK':'fermo') : anda===1 ? 'camminata' : 'corsa';`,
},

/* 9 — l'ombra di posa dichiara la fusione prima di gettarla */
{
  nome: '9/10 drawOmbreGiocatori: la fusione dichiarata prima dell\'ombra',
  cerca:
`      p.lodPosa=false;
      const st=rigStato(p), lk=rigLook(p);
      fatta=Rig3D.ombraTraccia(ctx, X, Y,`,
  metti:
`      p.lodPosa=false;
      const st=rigStato(p), lk=rigLook(p);
      /* la stessa fusione del corpo, dichiarata PRIMA dell'ombra:
         l'ombra getta la posa che il corpo disegnera' fra poche righe,
         fusione compresa — corpo e ombra restano UN oggetto */
      rigFusione(p, st);
      fatta=Rig3D.ombraTraccia(ctx, X, Y,`,
},

/* 10 — drawPlayer arma e dichiara la fusione, DOPO la sostituzione LOD */
{
  nome: '10/10 drawPlayer: rigFusione dopo la sostituzione LOD',
  cerca:
`    if(lod){
      st.clip = gk ? 'attesaGK' : 'fermo';
      st.u = (0.041*(p.idx+11*p.team)+0.13)%1;
    }`,
  metti:
`    if(lod){
      st.clip = gk ? 'attesaGK' : 'fermo';
      st.u = (0.041*(p.idx+11*p.team)+0.13)%1;
    }
    /* LA FUSIONE FRA CLIP: se la posa disegnata sta cambiando rispetto
       all'ultimo fotogramma, per FUSIONE_T secondi il rig mescola la
       vecchia (congelata) con la nuova. Sta DOPO la sostituzione LOD:
       il cambio si giudica su cio' che si disegna davvero, quindi anche
       l'entrata e l'uscita dal dettaglio ridotto smettono di scattare.
       Una figura lontana paga la doppia posa solo per gli 0,12 s della
       sua transizione, poi torna alla posa fissa che il LOD paga oggi. */
    rigFusione(p, st);`,
},

];

/* il controllo negativo: la fusione a durata ZERO, l'isteresi resta */
const SPENTA = {
  cerca: `const FUSIONE_T = 0.12;    // durata della transizione fra due clip (s)`,
  metti: `const FUSIONE_T = 0;       // CONTROLLO NEGATIVO: fusione spenta (--spenta)`,
};

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-fusione.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.fusione.html';
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
if (haFlag('spenta')) {
  const n = out.split(SPENTA.cerca).length - 1;
  if (n !== 1) { console.error('FALLITO: --spenta non trova la costante da azzerare (' + n + ' volte).'); process.exit(1); }
  out = out.replace(SPENTA.cerca, SPENTA.metti);
}

/* un controllo dopo la sostituzione: definizioni e chiamate al posto giusto */
const attesi = [
  ['function posaFusa(', 1],
  ['posaFusa(clip,u);', 2],
  ['function fondi(', 1],
  ['ombraTraccia, fondi,', 1],
  ['function rigFusione(', 1],
  ['rigFusione(p, st);', 2],
  ['p.fondT-=dt;', 1],
  ['p.rigAnda=anda;', 1],
  ['const FUSIONE_T = ', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati` + (haFlag('spenta') ? ' + fusione SPENTA (controllo negativo)' : ''));
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
