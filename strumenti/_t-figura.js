/* =====================================================================
   _t-figura.js — LA FIGURA: IL QUARTO BLOCCO DEL KIT, E IL NUMERO CHE
   ENTRA NELL'ORDINE DI PROFONDITA'.

   Toppa cerca/sostituisci sul gioco con md5 30279089de83249e44e66d2247294f5f.
   Legge CALCETTO-il-gioco.html (o --in), sostituisce DUE ancoraggi ESATTI
   e scrive la copia in --out. Senza --out scrive accanto all'originale un
   file col suffisso .figura.html: mai sull'originale, se non con --dentro.
   Se anche un solo ancoraggio non compare ESATTAMENTE UNA VOLTA si ferma
   con codice 1, dice quale, e non scrive niente.

   uso:
     node strumenti/_t-figura.js --in fuori/CALCETTO-originale-30279089.html --out fuori/CALCETTO-figura.html
     node strumenti/_t-figura.js --elenco

   ---------------------------------------------------------------------
   LA VOCE DEL CENSIMENTO (_analisi/COSA-MANCA.md §2.3): provino cieco
   3/10 di fattura alla figura; due soli livelli di tono per costruzione;
   la coscia un blocco unico nella tinta dei calzoncini; il numero
   dipinto sopra la nuca quando la figura e' di spalle. Le tre strade
   bocciate (decalco matcap, gradiente, due toni pixel-art) erano tutte
   VOLUME SUGLI ARTI: qui non ce n'e' nemmeno uno — sono tinte piatte a
   sagoma invariata e una riparazione d'ordine di disegno.

   LE DUE MOSSE, e il perche' di ciascuna:

   1. LA COSCIA A DUE BLOCCHI ANCHE IN PARTITA. Il codice c'era gia',
      pagato, dentro il ramo lodOn (`g.cos`): calzoncino a larghezza
      piena fino al 54%, pelle a 0,82 sotto. Non si accendeva mai perche'
      la guardia temeva una figura di 40 px, ma la figura di partita e'
      alta ~93 px VERI (misurato: hPx 34 x S2 1,16 x P_DIS 1,18 x DPR 2
      sul banco 915x412 con DPR 2): il blocco di pelle e' ~9x14 px, leggibile.
      E' la via «mani e piedi/silhouette» del censimento fatta dove
      rende: il quarto blocco di colore del kit.

   2. IL NUMERO ENTRA NELL'ORDINE DI PROFONDITA'. Disegnato dopo l'intera
      figura, vinceva anche sulla testa: di spalle e in corsa 14 pixel
      di glifo sopra capelli e pelle (misurati). Quando il glifo puo'
      toccare il disco della testa e la testa non sta dietro il torso,
      il disco si ritaglia via con un clip 'evenodd' (stesso mestiere di
      bucoPalla): la testa occlude il numero.

   PROVATA, MISURATA E BOCCIATA — I VELI SUL BUSTO. C'era una terza
   mossa: dipingere il terminatore come VELO in alfa (ambra 0,40 /
   tintaOmbra 0,38, le stesse frazioni di lumiLook) invece che come
   tinta piena, cosi' il motivo della divisa (strisce, fascia) — oggi
   RICOPERTO dalle due mezze capsule piene, per cui in partita ogni
   maglia legge come tinta unita — restava visibile: busto a strisce da
   2 a 4 livelli di tono, misurato. Sul colore base i pixel sono
   identici a ±1 (il source-over di V con alfa f E' mescolaTinta), ma
   le strisce scoperte sono SCURE su meta' delle divise e passano
   dentro la colonna fissa della sonda quando il busto e' inclinato
   dalla corsa (la stessa deriva da lean gia' pagata dal terminatore
   0,72 -> 0,78): il contrasto maglia/erba di P1 nel collaudo cala da
   3,25:1 a 2,68:1 nel mucchio e da 2,60 a 2,06 nella peggiore partita
   (bisezione su varianti a una mossa: coscia 3,25, numero 3,22, veli
   2,68). Non e' rumore di sonda: la maglia con le strisce scure E'
   meno leggibile sull'erba. Bocciata; la variante e i referti stanno
   in fuori/_fig-v2-veli.html e fuori/_fig-v2.txt.

   NON FATTO QUI, E PERCHE': abbassare LOD_PX (l'altra via del
   censimento) e' stato misurato e scartato. La quantita' che accende il
   LOD non e' l'altezza in pixel veri (93): e' hPx x S2 x P_DIS SENZA il
   DPR, e in partita viva vale 39-52 (mediana 45-46; sonda su 1200
   fotogrammi x 3 taglie; a 11 scende fino a 16 negli allargamenti)
   contro una soglia di 120. Percio': (a) per accenderlo in partita
   serve LOD_PX<=39, ma il banco della silhouette disegna a 40,1 e si
   accenderebbe anche lui, mentre e' tarato sul ramo spento; (b)
   qualunque soglia dentro la banda viva 39-52 fa LAMPEGGIARE il
   dettaglio col respiro dello zoom e spacca il campo in figure con le
   dita e figure senza; (c) il volto a scala di partita e' un'ellisse
   da 1,5 px veri. Le due mosse qui sopra prendono dal ramo lodOn solo
   cio' che a 93 px veri si legge (il blocco di pelle della coscia) e
   lasciano la soglia dov'e'.
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

/* 1 — la coscia a due blocchi anche in partita */
{
  nome: '1/2 la coscia a due blocchi anche sotto soglia LOD',
  cerca:
`       SOLO CON lodOn: a quaranta pixel la coscia e' sei unita' e i due
       pezzi diventerebbero tre pixel di fango. Sotto soglia il disegno
       e il costo restano quelli di sempre. */
    if(lodOn && g.cos){`,
  metti:
`       LA GUARDIA lodOn E' CADUTA (20/8, voce «figura»), e il numero che
       la reggeva era sbagliato: temeva una figura di 40 px, ma quella
       di partita e' alta ~93 px VERI (34 unita' x S2 1,16 x P_DIS 1,18
       x DPR 2, misurata sul banco di casa), e il blocco di pelle fra
       calzoncino e calzettone occupa ~9x14 px veri: leggibile, non
       fango. E' il quarto blocco di colore del kit (maglia, calzoncino,
       PELLE, calzettone) — il censimento §2.3 conta sulla coscia UN
       tono e ne chiede almeno due; strumenti/_q-figura.js misura 1
       prima e 2 dopo. La sagoma non cambia di un pixel: il contorno
       resta a larghezza piena, cambiano solo le tinte dentro. Costo:
       due tratti in piu' per coscia, misurato appaiato con
       prestazione.js --contro. */
    if(g.cos){`,
},

/* 2 — il numero entra nell'ordine di profondita' */
{
  nome: '2/2 il numero sotto la testa: clip del disco, come bucoPalla',
  cerca:
`        const nChiaro = (p.team===0);
        ctx.strokeStyle = nChiaro ? 'rgba(8,16,11,.88)' : 'rgba(246,249,243,.94)';
        ctx.lineWidth = 1.45*fs/7;
        ctx.strokeText(cifra, nx, ny);
        ctx.fillStyle = nChiaro ? '#f4f7f1' : '#0c1410';
        ctx.fillText(cifra, nx, ny);`,
  metti:
`        const nChiaro = (p.team===0);
        /* IL NUMERO ENTRA NELL'ORDINE DI PROFONDITA' (20/8, censimento
           §2.3: «disegnato fuori dall'ordine di profondita', finisce
           sopra la nuca quando la figura e' di spalle»). Il glifo si
           dipinge DOPO l'intera figura, quindi vinceva anche sulla
           testa: di spalle e in corsa — il busto inclinato porta
           l'ancora dello 0,80 a ridosso della nuca — 14 pixel di glifo
           sopra capelli e pelle, misurati da strumenti/_q-figura.js.
           Qui, solo quando il glifo puo' toccare il disco della testa
           E la testa non sta dietro il torso (SD del capo non oltre
           quello del collo: a testa coperta dal busto il ritaglio
           aprirebbe un buco su una testa che non si vede), il disco si
           ritaglia via — un rect piu' un arc in 'evenodd', lo stesso
           mestiere di bucoPalla. Il raggio 1,36·r copre la calotta dei
           capelli (1,10·r), il perimetro scuro (1,22·r), un margine per
           il tilt del rollio — che il glifo, dipinto fuori dalla
           rotazione, non segue — e soprattutto sposta il BORDO del
           ritaglio sotto il filo dei capelli: il bordo di un clip ad
           arco ha il suo antialias, e a 1,28·r lasciava 2 pixel di
           glifo sfumato proprio sui capelli (misurati); a 1,36·r
           l'anello di antialias cade sulla maglia, dove sporcare mezzo
           pixel e' il comportamento di ogni bordo del gioco. I giunti sono quelli dell'ULTIMA
           figura disegnata, cioe' questa: Rig3D.disegna e' la chiamata
           qui sopra e nessun altro corpo passa in mezzo.
           Costo: il ritaglio nasce solo col glifo a ridosso della
           testa (figure di spalle), misurato con prestazione.js
           --contro. */
        const gJ=Rig3D.giunti(), gN=gJ.nomi;
        const gHx=gJ.x[gN.HEAD], gHy=gJ.y[gN.HEAD];
        const gCam=Rig3D.CAMERE.alto;
        const gS=hb/(1.9*(gCam.ce<0.58?0.58:gCam.ce));
        const gR=Rig3D.banco.testa()*gS*1.36;
        const gDx=nx-gHx, gDy=ny-gHy, gRag=gR+0.75*fs;
        const copre = (gDx*gDx+gDy*gDy < gRag*gRag) &&
                      gJ.d[gN.HEAD] <= gJ.d[gN.NECK]+0.02;
        if(copre){
          ctx.save();
          ctx.beginPath();
          ctx.rect(nx-2.2*fs, ny-1.5*fs, 4.4*fs, 3.0*fs);
          ctx.arc(gHx, gHy, gR, 0, 6.2832);
          ctx.clip('evenodd');
        }
        ctx.strokeStyle = nChiaro ? 'rgba(8,16,11,.88)' : 'rgba(246,249,243,.94)';
        ctx.lineWidth = 1.45*fs/7;
        ctx.strokeText(cifra, nx, ny);
        ctx.fillStyle = nChiaro ? '#f4f7f1' : '#0c1410';
        ctx.fillText(cifra, nx, ny);
        if(copre) ctx.restore();`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-figura.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.figura.html';
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
/* controlli dopo la sostituzione: le forme attese devono esserci il
   numero giusto di volte */
const attesi = [
  ['if(g.cos){', 1],
  ['if(lodOn && g.cos){', 0],
  ["ctx.clip('evenodd')", 2],           /* bucoPalla + il numero */
  ['if(copre) ctx.restore();', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
