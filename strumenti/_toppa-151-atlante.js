/* =====================================================================
   _toppa-151-atlante.js — LA PRIMA VIA, innestata nel gioco
   (voce #151, compito 3)

   Mette nel gioco l'atlante di sprite vero, in base64 dentro il file
   (perche' un asset esterno romperebbe «un file solo, zero rete» e farebbe
   rosso senza-rete), e devia Rig3D.disegna sulla cella giusta quando la
   clip e' `corsa` o `tiro`. Tutte le altre restano procedurali: e' il
   modo onesto di misurare il prototipo, perche' il prototipo copre due
   clip su ventisette e fingere il contrario falserebbe il confronto.

   QUESTA VERSIONE NON VA IN PRODUZIONE E NON DEVE ANDARCI. Vive in
   fuori/, che non e' tracciata. Serve a una cosa sola: far girare
   istantanea, prestazione e avvio sul gioco con gli sprite, invece di
   discutere di quanto costerebbero.

   LA GEOMETRIA DELLA CELLA, e da dove viene ogni numero.
   Il render (strumenti/blender/atlante.py) ha inquadrato con una camera
   ortografica di apertura 1,9*cos(42)*1,65 = 2,3298 m, centrata su y =
   0,95 m. Quindi, in una cella di 128 px:
     · un uomo di 1,9 m e' alto  128 * 1,9*cos42 / 2,3298 = 77,6 px
     · il piano del campo (y = 0) cade a  64 + 0,95*cos42/2,3298*128
       = 102,8 px dal bordo alto
   Rig3D.disegna riceve cx,cy = i PIEDI e hPx = l'altezza voluta, quindi
   la cella si scala di hPx/77,6 e si appoggia con quei 102,8 px sotto
   l'ancora. I numeri sono calcolati qui dallo stesso conto del render, non
   ricopiati a mano: se cambia il margine, cambiano insieme.

   QUELLO CHE L'ATLANTE NON SA FARE, e si vede subito guardandolo:
     · la DIVISA e' cotta — nel gioco le squadre nascono generate;
     · lo YAW e' quantizzato a otto invece di continuo;
     · la CORPORATURA e' una sola invece di tre;
     · la FUSIONE fra due pose non esiste: al cambio di clip si salta;
     · il NUMERO DI MAGLIA non ha piu' il torso a cui ancorarsi.
   Sono cinque cose che il gioco ha oggi. Il prototipo le perde tutte e
   cinque, e questo e' il criterio 7 della spec.

   uso:  node strumenti/_toppa-151-atlante.js ingresso.html uscita.html
         [--png fuori/151-atlante.png]
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

function arg(nome, pre) {
  const i = process.argv.indexOf('--' + nome);
  return (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--'))
    ? process.argv[i + 1] : pre;
}
const RADICE = path.resolve(__dirname, '..');
const PNG = path.resolve(RADICE, arg('png', 'fuori/151-atlante.png'));
const META = path.resolve(RADICE, arg('meta', 'fuori/151-atlante.json'));
if (!fs.existsSync(PNG) || !fs.existsSync(META)) {
  console.error('TOPPA NON APPLICATA: manca l\'atlante (' + PNG + ')');
  console.error('  prima: blender --background --factory-startup --python strumenti/blender/atlante.py --');
  process.exit(1);
}
const M = JSON.parse(fs.readFileSync(META, 'utf8'));
const B64 = fs.readFileSync(PNG).toString('base64');

/* gli stessi numeri del render, rifatti qui invece che ricopiati */
const ELEV = 42.0, ALT_MONDO = 1.9, MARGINE = 1.65, CENTRO = 0.95;
const CE = Math.cos(ELEV * Math.PI / 180);
const APERTURA = ALT_MONDO * CE * MARGINE;
const CELLA = M.cella;
const FIG_PX = +(CELLA * (ALT_MONDO * CE) / APERTURA).toFixed(4);
const PIEDI_PX = +(CELLA * 0.5 + CELLA * (CENTRO * CE) / APERTURA).toFixed(4);
/* la riga di ogni clip nel foglio, dichiarata dal render */
const RIGHE = {};
for (const c of M.clip) RIGHE[c.nome] = c.riga0;

/* ---------------------------------------------- 1. L'ATLANTE, dentro Rig3D */
const A1 = `const STACCO_FILO='#e7f0da';`;
const B1 = `const STACCO_FILO='#e7f0da';

/* =====================================================================
   L'ATLANTE DI SPRITE (voce #151, compito 3) — IL PROTOTIPO, NON IL GIOCO.

   Due clip su ventisette, una corporatura su quattro, una divisa sola,
   otto direzioni invece dello yaw continuo. Sta qui per essere MISURATO
   da istantanea, prestazione e avvio, non per essere spedito.

   Il foglio e' in base64 dentro il file perche' un asset esterno
   romperebbe «un file solo, zero rete» e farebbe rosso senza-rete. Il
   peso che ne viene e' esattamente il costo di cui si discute.
   ===================================================================== */
const ATL151={
  pronta:false, im:null,
  CELLA:${CELLA}, COLONNE:${M.fotogrammi}, FIG:${FIG_PX}, PIEDI:${PIEDI_PX},
  RIGHE:${JSON.stringify(RIGHE)},
  /* quante volte il gioco ha chiesto una cella e quante volte l'ha avuta:
     senza questo contatore «l'atlante era acceso» sarebbe una speranza */
  chieste:0, servite:0,
  avvia(){
    try{
      const i=new Image();
      i.onload=()=>{ ATL151.im=i; ATL151.pronta=true; };
      i.src='data:image/png;base64,'+ATL151.B64;
    }catch(e){}
  },
};
ATL151.B64='${B64}';
/* LA CELLA, e il conto che la piazza. Rig3D.disegna riceve i PIEDI in
   cx,cy e l'altezza voluta in hPx: la cella si scala di hPx/FIG e si
   appoggia con PIEDI px sotto l'ancora. FIG e PIEDI vengono dalla stessa
   apertura di camera con cui e' stato renderizzato il foglio. */
function atl151Blit(ctx,cx,cy,hPx,yaw,nomeClip,u){
  ATL151.chieste++;
  const riga0=ATL151.RIGHE[nomeClip];
  if(!ATL151.pronta || riga0===undefined) return false;
  let d=Math.round(yaw/(Math.PI*2)*8)%8; if(d<0)d+=8;
  let f=Math.floor(u*ATL151.COLONNE)%ATL151.COLONNE; if(f<0)f+=ATL151.COLONNE;
  const C=ATL151.CELLA;
  const D=C*hPx/ATL151.FIG;
  ctx.drawImage(ATL151.im, f*C, (riga0+d)*C, C, C,
                cx-D*0.5, cy-D*(ATL151.PIEDI/C), D, D);
  ATL151.servite++;
  return true;
}`;

/* ------------------------------------- 2. LA DEVIAZIONE, in testa a disegna */
const A2 = `function disegna(ctx,cx,cy,hPx,yaw,nomeCam,nomeClip,tSec,look,senzaOmbra,pxs,filo){`;
const B2 = `function disegna(ctx,cx,cy,hPx,yaw,nomeCam,nomeClip,tSec,look,senzaOmbra,pxs,filo){
  /* LA DEVIAZIONE SULL'ATLANTE (voce #151). Solo le due clip che il
     prototipo copre, solo la camera della partita, e solo quando il
     foglio e' davvero decodificato: finche' non lo e', si disegna col rig
     come sempre. Un prototipo che nascondesse i fotogrammi in cui il
     foglio non c'e' ancora misurerebbe una bugia. */
  if(ATL151.pronta && nomeCam==='alto' && (nomeClip==='corsa'||nomeClip==='tiro')
     && !CLIPS[nomeClip].palla){
    const cl=CLIPS[nomeClip];
    if(atl151Blit(ctx,cx,cy,hPx,yaw,nomeClip,(tSec*cl.freq)%1)) return;
  }`;

/* ------------------------------------------- 3. L'AVVIO, quando la pagina c'e' */
const A3 = `  ritardo(K){ return Ritardo.imposta(K); },`;
const B3 = `  ritardo(K){ return Ritardo.imposta(K); },
  /* la maniglia dell'atlante del prototipo (voce #151): serve al banco per
     sapere se il foglio e' stato davvero usato, invece di crederlo */
  get atlante(){
    return { pronta:ATL151.pronta, chieste:ATL151.chieste, servite:ATL151.servite,
             cella:ATL151.CELLA, byte:ATL151.B64.length };
  },`;

/* ===================================================================== */
const ing = process.argv[2], usc = process.argv[3];
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-151-atlante.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti, nome] of [[A1, B1, 'atlante'], [A2, B2, 'deviazione'], [A3, B3, 'maniglia']]) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora «' + nome + '» trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
/* l'avvio: si attacca allo stesso posto in cui il gioco accende il resto */
const AVV = 'ATL151.avvia();\n';
const dove = t.indexOf('const Rig3D = (function(){');
if (dove < 0) { console.error('TOPPA NON APPLICATA: Rig3D non si trova'); process.exit(1); }
/* Rig3D e' un modulo chiuso: l'avvio si chiama da dentro, subito dopo la
   definizione, dove ATL151 e' visibile */
const ancoraAvvio = 'return {\n  CLIPS, CAMERE,';
if (t.indexOf(ancoraAvvio) >= 0) t = t.replace(ancoraAvvio, 'ATL151.avvia();\n' + ancoraAvvio);
else {
  /* ripiego dichiarato: si accende alla prima chiamata di disegna */
  t = t.replace('  if(ATL151.pronta && nomeCam===',
                '  if(!ATL151.im && !ATL151._avviata){ ATL151._avviata=true; ATL151.avvia(); }\n' +
                '  if(ATL151.pronta && nomeCam===');
}
for (const [k, q] of [['const ATL151=', 1], ['atl151Blit(', 2], ['ATL151.avvia();', 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
const prima = fs.statSync(ing).size, dopo = Buffer.byteLength(t, 'utf8');
console.log('toppa applicata: l\'atlante, ' + ing + ' -> ' + usc);
console.log('  il file passa da ' + (prima / 1048576).toFixed(2) + ' MB a ' +
            (dopo / 1048576).toFixed(2) + ' MB (+' + ((dopo / prima - 1) * 100).toFixed(0) + '%)');
console.log('  base64 dell\'atlante: ' + (B64.length / 1048576).toFixed(2) + ' MB');
console.log('  cella ' + CELLA + ' px · figura ' + FIG_PX + ' px · piano del campo a ' + PIEDI_PX + ' px');
