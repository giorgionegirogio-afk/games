/* =====================================================================
   _toppa-152-luce.js — IL VOLUME, IN PRODUZIONE (voce #152, compito 2)

   La voce #151 ha prototipato questa strada e l'ha misurata; qui entra
   nel gioco spedito. NON METTE UN PIXEL DI TEXTURE: mette TRE TABELLE DI
   NUMERI calcolate da Blender col `ray_cast` sulla geometria vera del
   rig (strumenti/blender/luce.py), e le fa consultare al disegno
   procedurale che c'e' gia'.

   CHE COSA CURA. Nel gioco di oggi l'ombreggiatura interna del corpo e'
   UNA DECISIONE BINARIA per arto:

       if(alt && (SX[g.a]+SX[g.b])*0.5 > SX[PELVIS]+W*0.18) tinta=alt;

   «se il punto medio dell'arto sta a est della verticale del bacino,
   tinta fredda». Due valori, nessuna gradazione, e — il punto — la
   decisione NON GUARDA COME E' GIRATO L'ARTO: un braccio teso verso il
   sole e uno teso via dal sole, se cadono dalla stessa parte del bacino,
   prendono la stessa identica tinta. E' li' che sta il «senza volume»
   del mandato, e non nella geometria, che e' gia' pseudo-3D (18 giunti,
   27 clip, 4 corporature, yaw continuo).

   LE TRE TABELLE, e da dove viene ogni numero.

   1. AZIMUT (16 valori, 64 byte). Blender ha proiettato tutti e 192 i
      fotogrammi del prototipo e per ogni arto ha misurato quanta luce
      diretta prende davvero, CON L'AUTO-OMBREGGIATURA VERA: un braccio
      dietro il busto e' scuro perche' il busto gli sta davanti, non
      perche' sta a est. I valori si raccolgono nella colonna
      dell'AZIMUT A SCHERMO dell'arto, che e' un numero che il gioco ha
      gia' in mano mentre disegna. Misurato: 0,188 a ovest contro 0,002 a
      est, cioe' OTTANTA VOLTE dove il gioco ha un `if`.

   2. RAMPA (16 valori). Il profilo di luminanza ATTRAVERSO un arto,
      misurato sulla capsula vera sotto il sole del gioco: 0,79 sul filo
      illuminato, monotona fino a 0 sul filo in ombra. E' quella che fa
      leggere un tratto piatto come un cilindro. Qui si consuma ridotta
      ai due numeri che il disegno usa davvero.

   3. AO (13 valori). ATTENZIONE AL VERSO, e il prototipo del #151 lo
      aveva scritto al contrario nel commento (usandolo giusto nel
      codice): `luce.py` calcola `libero/totale`, cioe' l'ACCESSO
      AMBIENTALE — quanta volta celeste vede quel pezzo di corpo — e non
      l'occlusione. Testa 0,80 (la piu' esposta), spalla 0,52, ascella
      0,23, coscia 0,14 (le cosce si fanno ombra a vicenda). Piu' alto
      vuol dire piu' luce, ed e' cosi' che si usa qui. Non si ricava per
      formula: dipende dal corpo tutto insieme.

   LE TRE TABELLE PESANO 279 BYTE. Nessun atlas, nessun base64.

   QUANTI FILI DI VOLUME — la scelta si misura, non si sceglie.
   Il #151 ha dichiarato che il +6,6% di fotogramma del prototipo e' il
   prezzo di «due tratti per arto su otto arti», e che stringerlo e' la
   prima cosa da fare in produzione. Questa toppa sa produrre quattro
   forme:
     --fili 2    i due fili (caldo e freddo), su tutte le figure
     --fili 1    il solo filo caldo, su tutte le figure
     --fili L    i due fili soltanto da vicino (la guardia lodOn di oggi)
     --fili 1L   il filo caldo su tutte, il freddo solo da vicino
   MISURATO IL 24 SETTEMBRE 2026 con strumenti/_sonda-152-fili.js —
   stessa pagina, stessa partita, stesso fotogramma, l'interruttore
   girato a caldo, venti/ventiquattro blocchi da sessanta disegni
   alternati, a taglia 11 con ventidue figure in campo:

     freno 1x   fili 0  0,435 ms   (disp. 30%)   (riferimento)
                fili 1  0,441 ms   (disp. 26%)   +1,3%
                fili 2  0,475 ms   (disp. 25%)   +9,2%
     freno 4x   fili 0  7,678 ms   (disp. 23%)   (riferimento)
                fili 1  7,922 ms   (disp. 22%)   +3,2%
                fili 2  8,222 ms   (disp. 20%)   +7,1%
     freno 6x   PROVA NULLA
     taglia 5, freno 1x, 10 figure
                fili 0  8,566 ms   ·  fili 1  8,666 ms   +1,2%

   IL FRENO 6x NON HA DATO UN NUMERO, E NON SI TRASCRIVE. Venti blocchi
   da sessanta disegni: dispersione 92-98% su tutte e tre le forme, e
   l'ordine ROVESCIATO (un filo +17,1%, due fili −2,5%). Un numero con la
   dispersione fuori soglia non e' un numero, e due fili che costano MENO
   di uno sono la firma del rumore, non una misura. Si dichiara prova
   nulla invece di scegliere il numero che fa comodo.

   I DUE FRENI CHE HANNO MISURATO DICONO LA STESSA COSA: il secondo filo
   costa da due a sette volte il primo, e non e' un paradosso — il filo
   caldo si disegna dove il tratto e' gia' stato toccato, il freddo apre
   un secondo tracciato con un'altra tinta e un'altra alfa dall'altra
   parte dell'asse. Il budget di questa voce e' +8%: i due fili lo
   sfiorano a 4x (+7,1%) e lo sforano a 1x (+9,2%); il solo caldo ci sta
   dentro con margine a tutt'e due i freni (+1,3% e +3,2%).

   PERCHE' LA FORMA SCELTA E' «1L» E NON «1». Il #151 aveva ragione a
   dire che un cilindro si legge perche' ha DUE bordi diversi — ma la
   seconda meta' del volume, in partita, non ha bisogno di un secondo
   tratto: ce l'ha gia' nella TINTA DELL'ARTO, che da oggi la sceglie
   l'azimut misurato e non la verticale del bacino. Un arto girato via
   dal sole si disegna nella sua tinta fredda per intero, e il filo
   caldo sul filo ovest gli fa da colmo. Il secondo tratto serve dove la
   figura e' grande abbastanza da mostrare la sfumatura fra i due bordi
   — il primo piano del gol, il dischetto — e li' le figure sono quattro
   e il costo non si misura. E' la stessa logica con cui il file gia'
   tiene le dita, la faccia e la suola sotto lodOn.
   Chi vuole rimetterlo dappertutto deve prima rifare la misura qui
   sopra: sono +9,2% a 1x e +7,1% a 4x su taglia 11, non un'opinione.

   E NON TOCCA LA SIMULAZIONE. Vive dentro disegna(), che e'
   presentazione: non legge ne' scrive nessuno stato di gioco, non
   consuma un sorteggio, e MOTORE_V non si muove.

   uso:  node strumenti/_toppa-152-luce.js ingresso.html uscita.html [--fili 2|1|L]
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
const arg = (n, d) => { const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const FILI = String(arg('fili', '1L')).toUpperCase();
if (!['2', '1', 'L', '1L'].includes(FILI)) { console.error('--fili vuole 2, 1, L oppure 1L'); process.exit(2); }

/* le sedici colonne dell'azimut, NORMALIZZATE fra 0 e 1. La
   normalizzazione si fa qui e non in Blender perche' in Blender il numero
   deve restare quello misurato: chi rilegge _151-luce.json deve trovare la
   luce vera, non una scala comoda per il disegno. */
const az = L.azimut.slice();
const az0 = Math.min.apply(null, az), az1 = Math.max.apply(null, az);
const AZN = az.map(v => +((v - az0) / (az1 - az0)).toFixed(3));
/* la rampa, ridotta al numero che il disegno consuma: quanto vale il filo
   in ombra rispetto al colmo del lato illuminato */
const rmax = Math.max.apply(null, L.rampa);
const OMBRA_REL = +((L.rampa[L.rampa.length - 1] || 0) / rmax).toFixed(3);
const AO = L.ao;
const ao = k => +(AO[k] !== undefined ? AO[k] : 0.5).toFixed(3);

const TABELLE = `const L151_AZ=[${AZN.join(',')}];
const L151_OMB=${OMBRA_REL};
const L151_AO={maglia:${ao('SHR-ELR')},pelle:${ao('ELR-HAR')},pantaloncini:${ao('HIPR-KNR')},calze:${ao('KNR-FTR')},scarpe:${ao('FTR-TOR')}};`;

/* ------------------------------------------------- 1. LE TABELLE, dentro Rig3D */
const A1 = `const STACCO_FILO='#e7f0da';`;
const B1 = `const STACCO_FILO='#e7f0da';

/* =====================================================================
   LE TRE TABELLE DI BLENDER (voce #152) — il volume senza un pixel.

   Non sono numeri scelti: li ha calcolati strumenti/blender/luce.py col
   ray_cast sulla geometria vera del corpo, sotto il SOLE del gioco
   (dir [0.9406,0.3402], alt 20 gradi, letto dal gioco e non ricopiato).
   Pesano 279 byte e sostituiscono il confronto binario «se l'arto sta a
   est del bacino, tinta fredda», che non guardava nemmeno COME fosse
   girato l'arto. Chi le rigenera: la pipeline e' in strumenti/blender/,
   il cancello che la sorveglia e' strumenti/_t-151-blender.js.

   L151_AZ  quanta luce diretta prende un arto secondo il suo AZIMUT A
            SCHERMO, mediato su tutti e 192 i fotogrammi del prototipo,
            con l'auto-ombreggiatura vera (un braccio dietro il busto e'
            scuro perche' il busto gli sta davanti, non perche' sta a
            est). Normalizzato 0..1; i valori misurati stanno in
            strumenti/blender/_151-luce.json e vanno da 0,002 a 0,188,
            cioe' OTTANTA VOLTE.
   L151_AO  l'ACCESSO AMBIENTALE per segmento: quanta volta celeste vede
            quel pezzo di corpo, misurata con ventiquattro raggi per
            vertice sul corpo INTERO. Piu' alto = piu' luce. Testa 0,80,
            spalla 0,52, ascella 0,23, coscia 0,14 — le cosce si fanno
            ombra a vicenda, e nessuna formula lo sa perche' dipende dal
            corpo tutto insieme.
            (Il verso e' questo: luce.py calcola libero/totale. Il
            commento del prototipo #151 lo chiamava «occlusione», che e'
            il contrario; il codice lo usava gia' giusto.)
   L151_OMB quanto vale il filo in ombra rispetto al colmo, dalla rampa
            trasversale misurata sulla capsula (0,79 -> 0 in sedici
            colonne, monotona).
   ===================================================================== */
${TABELLE}
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
       BACINO (voce #152). Il confronto vecchio guardava solo DOVE stava
       l'arto — a est o a ovest dell'anca — e due braccia girate in due
       modi opposti, se cadevano dalla stessa parte, prendevano la stessa
       tinta. Questo guarda COME E' GIRATO, che e' l'unica cosa da cui
       dipende quanta luce prende, e il numero non e' tarato a occhio: e'
       quello che Blender ha misurato su 192 fotogrammi con
       l'auto-ombreggiatura vera.
       COSTO: un atan2 e un accesso a tabella per arto, in luogo di un
       confronto. Stesso ordine, e misurato appaiato (vedi il verbale
       della voce #152). */
    let l151=0.5;
    if(g.kind===0 && look._ombS){
      l151=L151_AZ[l151Indice(SX[g.a],SY[g.a],SX[g.b],SY[g.b])];
      const alt=look._ombS[g.c];
      if(alt && l151<0.5) tinta=alt;
    }`;

/* ------------------------------------------ 3. I FILI DI VOLUME */
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

const GUARDIA = FILI === 'L' ? 'lodOn && ' : '';
const vicino = FILI === '1L';
const R = vicino ? '  ' : '';           // il rientro in piu' dentro if(lodOn)
const FILO_FREDDO = FILI === '1' ? '' : (vicino ? `
        /* IL SECONDO FILO SOLO DA VICINO, e il numero che lo decide sta
           nel cappello: dappertutto costerebbe +9,2% di fotogramma a
           taglia 11 contro il +1,3% del solo caldo. */
        if(lodOn){` : '') + `
${R}        /* IL FILO IN OMBRA, che e' la seconda meta' del volume: un
${R}           cilindro si legge perche' ha DUE bordi diversi, non uno. La
${R}           rampa trasversale dice quanto vale il bordo opposto. */
${R}        ctx.globalAlpha=(0.06+0.20*(1-l151))*acc*(1-L151_OMB*0.5);
${R}        ctx.strokeStyle=SOLE.tintaOmbra;
${R}        ctx.beginPath();
${R}        ctx.moveTo(SX[g.a]+ddx*0.14-nx*W*0.34, SY[g.a]+ddy*0.14-ny*W*0.34);
${R}        ctx.lineTo(SX[g.a]+ddx*0.86-nx*W*0.34, SY[g.a]+ddy*0.86-ny*W*0.34);
${R}        ctx.stroke();` + (vicino ? `
        }` : '');

const CAPPELLO = FILI === 'L'
  ? `       FORMA: i due fili, SOLO DA VICINO (guardia lodOn).`
  : FILI === '1'
    ? `       FORMA: UN FILO SOLO, il caldo, su TUTTE le figure.`
    : FILI === '1L'
      ? `       FORMA SCELTA, E IL NUMERO CHE L'HA DECISA: il filo CALDO su
       TUTTE le figure — anche le ventidue della partita, che prima
       restavano tratti piatti — e il filo FREDDO solo da vicino.
       Misurato con strumenti/_sonda-152-fili.js (stessa pagina, stesso
       fotogramma, interruttore girato a caldo, 24 blocchi da 60
       disegni): a taglia 11 con ventidue figure il solo caldo costa
       +1,3% di fotogramma, tutt'e due +9,2%. Il budget di questa voce e'
       +8%: il secondo filo dappertutto lo sfora, il primo ci sta dentro
       sette volte. La seconda meta' del volume, in partita, ce l'ha gia'
       la TINTA dell'arto qui sopra.`
      : `       FORMA: i due fili su TUTTE le figure (+9,2% a taglia 11).`;

const B3 = `    /* =================================================================
       I FILI DI VOLUME (voce #152) — e adesso valgono anche in partita,
       non solo nei primi piani.

       Il blocco di prima girava solo con lodOn, cioe' nelle scene a poche
       figure: in partita ventidue corpi restavano tratti piatti, e la
       partita e' il novantacinque per cento del tempo che si passa a
       guardare questo gioco. Adesso i tre numeri del filo vengono dalle
       tabelle di Blender invece che da una taratura a occhio:
         · lo SCOSTAMENTO dall'asse viene dalla rampa trasversale
           misurata sulla capsula vera;
         · l'ALFA e' proporzionale alla luce che quell'arto prende
           davvero secondo il suo azimut (L151_AZ), non costante;
         · e la scala l'ACCESSO AMBIENTALE del segmento (L151_AO):
           l'ascella non riceve il filo che la spalla riceve, perche' il
           corpo se lo mangia. Quel numero non si ricava per formula.
${CAPPELLO}
       IL COSTO SI MISURA, NON SI STIMA, e il 24 settembre 2026 il banco
       appaiato NON ERA IN GRADO di misurarlo: prestazione.js ha
       dichiarato da se' «ballo fra repliche dello stesso file 277,1%» e
       ha dato tutt'e tre i confronti per non provati. Il numero qui
       sopra viene da strumenti/_sonda-152-fili.js, che confronta le tre
       forme NELLA STESSA PAGINA e sullo STESSO fotogramma, senza un
       secondo caricamento in mezzo.
       W>1.6 tiene fuori le figure troppo piccole: sotto due pixel di
       tratto il filo non e' volume, e' rumore. */
    if(${GUARDIA}g.kind===0 && g.c!=='scarpe' && g.b!==HEAD && !(g.a===HIPL&&g.b===HIPR)){
      const ddx=SX[g.b]-SX[g.a], ddy=SY[g.b]-SY[g.a];
      const Lm=Math.sqrt(ddx*ddx+ddy*ddy);
      if(Lm>1.5 && W>1.6){
        let nx=-ddy/Lm, ny=ddx/Lm; if(nx>0){nx=-nx;ny=-ny;}   // nx punta a ovest
        const acc=L151_AO[g.c]!==undefined?L151_AO[g.c]:0.4;
        ctx.lineCap='butt';
        ctx.lineWidth=W*0.30;
        ctx.globalAlpha=(0.10+0.26*l151)*acc;
        ctx.strokeStyle='#fff2cf';
        ctx.beginPath();
        ctx.moveTo(SX[g.a]+ddx*0.12+nx*W*0.32, SY[g.a]+ddy*0.12+ny*W*0.32);
        ctx.lineTo(SX[g.a]+ddx*0.88+nx*W*0.32, SY[g.a]+ddy*0.88+ny*W*0.32);
        ctx.stroke();${FILO_FREDDO}
        ctx.globalAlpha=1; ctx.lineCap='round';
      }
    }`;

/* ===================================================================== */
const resto = process.argv.slice(2).filter(a => !a.startsWith('--'));
const [ing, usc] = resto;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-152-luce.js ingresso.html uscita.html [--fili 2|1|L]'); process.exit(2); }
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
console.log('toppa applicata: il volume, forma «fili ' + FILI + '», ' + ing + ' -> ' + usc);
console.log('  il file cresce di ' + cresciuto + ' byte, di cui ' + TABELLE.length + ' di tabelle');
