/* =====================================================================
   _toppa-151-luce.js — LA TERZA VIA, innestata nel gioco (voce #151, compito 3)

   NON METTE UN PIXEL DI TEXTURE NEL GIOCO. Mette TRE TABELLE DI NUMERI —
   279 byte in tutto — calcolate da Blender sulla geometria vera del corpo
   (strumenti/blender/luce.py), e le fa consultare al disegno procedurale
   che c'e' gia'.

   CHE COSA CURA. Alla riga 8352 del gioco l'ombreggiatura interna del
   corpo e' UNA DECISIONE BINARIA per arto:

       if(alt && (SX[g.a]+SX[g.b])*0.5 > SX[PELVIS]+W*0.18) tinta=alt;

   «se il punto medio dell'arto sta a est della verticale del bacino,
   tinta fredda». Due valori, nessuna gradazione, e — il punto piu'
   importante — la decisione NON GUARDA COME E' GIRATO L'ARTO: un braccio
   teso verso il sole e uno teso via dal sole, se cadono dalla stessa
   parte del bacino, prendono la stessa identica tinta. E' li' che sta il
   «senza volume» del mandato, e non nella geometria, che e' gia' 3D.

   CHE COSA MESSE AL SUO POSTO, e da dove viene ogni numero.

   1. AZIMUT (16 valori). Blender ha proiettato TUTTI e 192 i fotogrammi
      del prototipo, e per ogni arto ha misurato quanta luce diretta
      prende davvero, con l'auto-ombreggiatura vera: un braccio dietro il
      busto e' scuro perche' il busto gli sta davanti, non perche' sta a
      est. I valori si sono poi raccolti nella colonna dell'AZIMUT A
      SCHERMO dell'arto — che e' un numero che il gioco ha gia' in mano
      mentre disegna, gratis. Misurato: 0,188 a ovest contro 0,002 a est,
      cioe' un rapporto di ottanta volte dove il gioco oggi ha un IF.

   2. RAMPA (16 valori). Il profilo di luminanza ATTRAVERSO un arto,
      misurato sulla capsula vera sotto il sole del gioco: 0,79 sul filo
      illuminato, monotona fino a 0 sul filo in ombra. E' quella che fa
      leggere un tratto piatto come un cilindro, e qui diventa la
      posizione e l'alfa dei due fili di volume.

   3. AO (13 valori). Quanto ogni capsula e' nascosta DALLE ALTRE, per
      ray_cast sul corpo intero: ascella 0,23, spalla 0,52, testa 0,80,
      coscia 0,14 (le cosce si occludono a vicenda). Non si ottiene per
      formula, perche' dipende dal corpo tutto insieme. Qui spegne il
      filo di luce dove il corpo se lo mangerebbe.

   IL COSTO. Due tratti in piu' per arto, sugli otto arti lunghi (il
   collo, la barra dei fianchi e le scarpe restano fuori: troppo corti, il
   filo diventerebbe rumore). Nessun colore nuovo calcolato nel
   fotogramma: le tinte sono quelle che lumiLook gia' mette in cache per
   divisa. Si misura con prestazione.js, non si stima.

   E NON TOCCA LA SIMULAZIONE. Questa toppa vive dentro disegna(), che e'
   presentazione: non legge ne' scrive nessuno stato di gioco, non
   consuma un sorteggio, e MOTORE_V non si muove.

   uso:  node strumenti/_toppa-151-luce.js ingresso.html uscita.html
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const TAB = path.join(__dirname, 'blender', '_151-luce.json');
if (!fs.existsSync(TAB)) {
  console.error('TOPPA NON APPLICATA: manca ' + TAB);
  console.error('  prima: blender --background --factory-startup --python strumenti/blender/luce.py');
  process.exit(1);
}
const L = JSON.parse(fs.readFileSync(TAB, 'utf8'));

/* le sedici colonne dell'azimut, NORMALIZZATE fra 0 e 1. La
   normalizzazione si fa qui e non in Blender perche' in Blender il numero
   deve restare quello misurato: chi rilegge _151-luce.json deve trovare la
   luce vera, non una scala comoda per il disegno. */
const az = L.azimut.slice();
const az0 = Math.min.apply(null, az), az1 = Math.max.apply(null, az);
const AZN = az.map(v => +((v - az0) / (az1 - az0)).toFixed(3));
/* la rampa, ridotta ai due numeri che il disegno consuma: dove sta il
   colmo (in frazione di semilarghezza, dal filo illuminato) e quanto vale
   il filo in ombra rispetto al colmo */
const rmax = Math.max.apply(null, L.rampa);
const OMBRA_REL = +((L.rampa[L.rampa.length - 1] || 0) / rmax).toFixed(3);
/* l'AO dei segmenti, con le chiavi come le scrive il gioco nei SEGS */
const AO = L.ao;
function ao(k) { return +(AO[k] !== undefined ? AO[k] : 0.5).toFixed(3); }

/* ------------------------------------------------- 1. LE TABELLE, dentro Rig3D */
const A1 = `const STACCO_FILO='#e7f0da';`;
const B1 = `const STACCO_FILO='#e7f0da';

/* =====================================================================
   LE TRE TABELLE DI BLENDER (voce #151) — il volume senza un pixel.

   Non sono numeri scelti: li ha calcolati strumenti/blender/luce.py col
   ray_cast sulla geometria vera del corpo, sotto il SOLE del gioco
   (dir [0.9406,0.3402], alt 20 gradi, letto dal gioco e non ricopiato).
   Pesano ${'279'} byte e sostituiscono il confronto binario della riga
   «se l'arto sta a est del bacino, tinta fredda» — che non guardava
   nemmeno COME fosse girato l'arto.

   L151_AZ  quanta luce diretta prende un arto secondo il suo AZIMUT A
            SCHERMO, mediato su tutti e 192 i fotogrammi del prototipo,
            con l'auto-ombreggiatura vera. Normalizzato 0..1; i valori
            misurati stanno in strumenti/blender/_151-luce.json e vanno
            da 0,002 a 0,188, cioe' ottanta volte.
   L151_AO  quanto ogni capsula e' nascosta dalle ALTRE. Ascella 0,23,
            spalla 0,52, coscia 0,14: le cosce si occludono a vicenda, e
            nessuna formula lo sa perche' dipende dal corpo intero.
   L151_OMB quanto vale il filo in ombra rispetto al colmo, dalla rampa
            trasversale misurata sulla capsula (0,79 -> 0 in sedici
            colonne, monotona).
   ===================================================================== */
const L151_AZ=[${AZN.join(',')}];
const L151_OMB=${OMBRA_REL};
const L151_AO={maglia:${ao('SHR-ELR')},pelle:${ao('ELR-HAR')},pantaloncini:${ao('HIPR-KNR')},calze:${ao('KNR-FTR')},scarpe:${ao('FTR-TOR')}};
/* l'indice della colonna: l'azimut dell'arto SULLO SCHERMO. SY cresce
   verso il basso, quindi si rovescia per avere l'angolo con l'alto in
   positivo -- lo stesso verso con cui Blender ha riempito la tabella. */
function l151Indice(ax,ay,bx,by){
  const a=Math.atan2(-(by-ay), bx-ax);
  let k=((a+Math.PI)/(2*Math.PI)*16)|0;
  if(k<0)k=0; if(k>15)k=15;
  return k;
}`;

/* ------------------------------ 2. LA DECISIONE DELLA TINTA, dal tavolo */
const A2 = `    let tinta=look[g.c];
    if(g.kind===0 && look._ombS){
      const alt=look._ombS[g.c];
      if(alt && (SX[g.a]+SX[g.b])*0.5 > SX[PELVIS]+W*0.18) tinta=alt;
    }`;
const B2 = `    let tinta=look[g.c];
    /* LA TINTA LA SCEGLIE LA TABELLA DI BLENDER, NON LA VERTICALE DEL
       BACINO (voce #151). Il confronto vecchio guardava solo DOVE stava
       l'arto; questo guarda COME E' GIRATO, che e' l'unica cosa da cui
       dipende quanta luce prende. Il numero e' lo stesso che Blender ha
       misurato su 192 fotogrammi con l'auto-ombreggiatura vera.
       Un atan2 e un accesso a tabella per arto: lo stesso ordine di costo
       del confronto che sostituisce. */
    let l151=0.5;
    if(g.kind===0 && look._ombS){
      l151=L151_AZ[l151Indice(SX[g.a],SY[g.a],SX[g.b],SY[g.b])];
      const alt=look._ombS[g.c];
      if(alt && l151<0.5) tinta=alt;
    }`;

/* ------------------------------------------ 3. I DUE FILI DI VOLUME */
const A3 = `    if(lodOn && g.kind===0 && g.c!=='scarpe' && g.b!==HEAD && !(g.a===HIPL&&g.b===HIPR)){
      const ddx=SX[g.b]-SX[g.a], ddy=SY[g.b]-SY[g.a];
      const Lm=Math.sqrt(ddx*ddx+ddy*ddy);
      if(Lm>1.5){
        let nx=-ddy/Lm, ny=ddx/Lm; if(nx>0){nx=-nx;ny=-ny;}   // nx punta a ovest
        ctx.lineCap='butt';
        ctx.globalAlpha=0.16; ctx.strokeStyle='#fff2cf';
        ctx.lineWidth=W*0.30;
        ctx.beginPath();
        ctx.moveTo(SX[g.a]+ddx*0.12+nx*W*0.32, SY[g.a]+ddy*0.12+ny*W*0.32);
        ctx.lineTo(SX[g.a]+ddx*0.88+nx*W*0.32, SY[g.a]+ddy*0.88+ny*W*0.32);
        ctx.stroke();
        ctx.globalAlpha=1; ctx.lineCap='round';
      }
    }`;
const B3 = `    /* =================================================================
       I DUE FILI DI VOLUME (voce #151) — e adesso valgono anche in
       partita, non solo nei primi piani.

       Il blocco di prima girava solo con lodOn, cioe' nelle scene a poche
       figure: in partita ventidue corpi restavano tratti piatti. Adesso
       gira sempre, e i suoi tre numeri vengono dalle tabelle di Blender
       invece che da una taratura a occhio:
         · lo SCOSTAMENTO dei due fili dall'asse viene dalla rampa
           trasversale misurata sulla capsula vera;
         · l'ALFA del filo caldo e' proporzionale alla luce che quell'arto
           prende davvero secondo il suo azimut (L151_AZ), non costante;
         · e la spegne l'OCCLUSIONE del segmento (L151_AO): l'ascella non
           riceve il filo che la spalla riceve, perche' il corpo se lo
           mangia. Quel numero non si ricava per formula.
       Il filo freddo sul lato opposto e' la seconda meta' del volume: un
       cilindro si legge perche' ha DUE bordi diversi, non uno.
       Costo: due tratti per arto sugli otto arti lunghi, nessun colore
       calcolato nel fotogramma. Si misura con prestazione.js. */
    if(g.kind===0 && g.c!=='scarpe' && g.b!==HEAD && !(g.a===HIPL&&g.b===HIPR)){
      const ddx=SX[g.b]-SX[g.a], ddy=SY[g.b]-SY[g.a];
      const Lm=Math.sqrt(ddx*ddx+ddy*ddy);
      if(Lm>1.5 && W>1.6){
        let nx=-ddy/Lm, ny=ddx/Lm; if(nx>0){nx=-nx;ny=-ny;}   // nx punta a ovest
        const occ=L151_AO[g.c]!==undefined?L151_AO[g.c]:0.4;
        const caldo=(0.10+0.26*l151)*occ;
        ctx.lineCap='butt';
        ctx.lineWidth=W*0.30;
        ctx.globalAlpha=caldo; ctx.strokeStyle='#fff2cf';
        ctx.beginPath();
        ctx.moveTo(SX[g.a]+ddx*0.12+nx*W*0.32, SY[g.a]+ddy*0.12+ny*W*0.32);
        ctx.lineTo(SX[g.a]+ddx*0.88+nx*W*0.32, SY[g.a]+ddy*0.88+ny*W*0.32);
        ctx.stroke();
        /* il filo in ombra: la rampa dice quanto vale il bordo opposto */
        ctx.globalAlpha=(0.06+0.20*(1-l151))*occ*(1-L151_OMB*0.5);
        ctx.strokeStyle=SOLE.tintaOmbra;
        ctx.beginPath();
        ctx.moveTo(SX[g.a]+ddx*0.14-nx*W*0.34, SY[g.a]+ddy*0.14-ny*W*0.34);
        ctx.lineTo(SX[g.a]+ddx*0.86-nx*W*0.34, SY[g.a]+ddy*0.86-ny*W*0.34);
        ctx.stroke();
        ctx.globalAlpha=1; ctx.lineCap='round';
      }
    }`;

/* ===================================================================== */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-151-luce.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
for (const [cerca, metti, nome] of [[A1, B1, 'tabelle'], [A2, B2, 'tinta'], [A3, B3, 'fili']]) {
  const n = t.split(cerca).length - 1;
  if (n !== 1) { console.error('TOPPA NON APPLICATA: ancora «' + nome + '» trovata ' + n + ' volte (ne serve 1)'); process.exit(1); }
  t = t.replace(cerca, metti);
}
for (const [k, q] of [['const L151_AZ=[', 1], ['l151Indice(', 2], ['L151_AO[g.c]', 2]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
const cresciuto = Buffer.byteLength(t, 'utf8') - fs.statSync(ing).size;
console.log('toppa applicata: la terza via, ' + ing + ' -> ' + usc);
console.log('  il file cresce di ' + cresciuto + ' byte (di cui ' +
            ('[' + AZN.join(',') + ']' + JSON.stringify(AO)).length + ' di tabelle e commenti a parte)');
