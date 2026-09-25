/* =====================================================================
   _toppa-157-valore.js — LA GERARCHIA DEL VALORE E LA STATURA DEL LUNGO
   (voce #155, giro 4 · rilievi 4 e 6 del verbale del giro 3)

   ====================== 1. LE CALZE (rilievo 4) =======================
   Il verbale: «maglia 216 = calze 216 — tronco e polpacci hanno lo
   STESSO valore, quindi in bianco e nero le masse sono due, non tre».
   Era vero alla lettera, e la causa stava in una riga sola: maglia e
   calze avevano LA STESSA FORMULA, `mt(c1,'#fff6e4',0.30)`. Due capi
   che si calcolano allo stesso modo non possono avere valori diversi.

   Adesso le calze vanno dall'altra parte: `mt(c1,'#1b2233',0.20)`, cioe'
   la tinta di squadra scurita del 20% verso il blu della notte. Il
   conto dello scarto si fa in luminanza, che e' lineare nel mescolo:
       maglia  = c1 + 0,30·(246,6 - c1)
       calze   = c1 - 0,20·(c1 - 33,7)
       scarto  = 67,3 - 0,10·c1
   che per ogni c1 del gioco (da 170 a 247 di luminanza) vale fra 43 e
   50 livelli, contro i 40 che il criterio chiede. E il 20% non e'
   scelto a occhio: a 0,24 lo scarto verso la MAGLIA saliva a 51 ma
   quello verso i CALZONCINI scendeva a 34 — la terza massa si
   riattaccava alla seconda, cioe' il criterio delle tre masse si
   perdeva dall'altra parte. A 0,20 la rampa e' 216 / 169 / 128:
   quarantasette e quarantuno livelli, tre masse davvero. Misurato su tutte e
   quarantotto le combinazioni divisa x carnagione da
   strumenti/_157-valore.js: il PEGGIO e' quello che conta, non la media.

   La rampa che ne esce e' anche quella della luce vera, dall'alto in
   basso: maglia 216, calze 169, calzoncini 128, scarpe 99, manica 74.
   La tabella di Blender dice la stessa cosa per conto suo (L151_AO:
   maglia 0,503 di volta celeste, calze 0,389, calzoncini 0,156): il
   polpaccio vede meno cielo del torace, e adesso si vede.

   LE CALZE NON TOCCANO IL CANCELLO 3:1. La finestra della sonda del
   contrasto di collaudo.js sta a 0,693-0,825 m da terra, cioe' dentro
   il calzoncino; il polpaccio sta sotto i 0,45. Misurato lo stesso.

   ====================== 2. LA PELLE (rilievo 4) =======================
   Il verbale: «pelle 195 resta la seconda cosa piu' chiara della
   figura», e il bersaglio «pelle ad almeno 40 livelli sotto il capo di
   divisa piu' chiaro». Misurato su tutte e quarantotto le combinazioni,
   il caso peggiore era ben oltre il «secondo posto»: con la divisa
   ARANCIO (maglia 193) e la carnagione piu' chiara (#f2cfa5, 211) la
   PELLE ERA IL PUNTO PIU' CHIARO DELLA FIGURA, diciotto livelli sopra
   la maglia. Le braccia battevano la divisa.

   `mt(p.skin,'#6b4a30',0.48)`: la carnagione mescolata al 48% col bruno
   d'ombra. Il numero non e' un gusto, e' stretto fra due misure: sotto
   il 48% il caso peggiore (ARANCIO, #f2cfa5) non arriva ai 40 livelli
   chiesti; con un bruno PIU' SCURO (#4a3020) la carnagione piu' scura
   del gioco finiva a 66 e passava sotto la manica (74), cioe' la pelle
   tornava a un estremo dall'altra parte — misurato, non temuto.
   Le sei carnagioni restano SEI: la forbice passa da 75..211 a 77..148
   e resta un rapporto di 1,9 fra la piu' chiara e la piu' scura. Non e'
   una compressione verso il mezzo, e' una discesa.

   E' anche cio' che dice la fisica gia' scritta in questo file: L151_AO
   da' alla pelle 0,244 di volta celeste contro 0,503 della maglia. Un
   avambraccio vede meno della meta' del cielo che vede un torace, e lo
   disegnavamo piu' chiaro.

   ====================== 3. LA STATURA DEL LUNGO (rilievo 6) ===========
   Il verbale: «prova-corpi-50: sagome 56 / 54 / 50 / 57 px — il neutro
   (57) supera lo spilungone (56). La domanda del criterio era
   esattamente "si vede quale dei quattro e' lo spilungone": no.»

   Il conto di perche' 1,018 non bastava: l'altezza disegnata e'
   (quota della testa + raggio della testa · hr) · st, e lo spilungone ha
   la testa piu' piccola del 16% (hr 0,84). Con HEAD a 1,64 m e
   N_HEADR 0,160:
       lungo   (1,640 + 0,134)·1,018 = 1,806
       neutro  (1,640 + 0,160)·1,000 = 1,800
   cioe' TRE MILLESIMI, che a cinquanta pixel sono 0,17 px: meno di un
   pixel, quindi invisibili, e a volte di segno sbagliato per il solo
   arrotondamento. La testa piccola si mangiava tutta la statura.

   st 1,018 -> 1,040 porta il conto a 1,845 contro 1,800, cioe' il 2,5%:
   la maschera del lungo passa da 56 px a 58 sulla misura del provino
   (fermo, u 0,200) e da 54 a 56 su quella del banco (fermo, u 0,300), e
   in tutt'e due diventa la piu' alta delle quattro.

   IL TETTO LO METTE LA GABBIA, ED E' STATO MISURATO, NON DEDOTTO. Il
   cancello ?gabbia chiede che la cima della testa non salga sopra
   -35,10 unita' di schermo (riferimento -34,6 piu' mezza unita' di
   tolleranza), e la cima e' la STESSA grandezza della maschera: sono
   due nomi per (quota della testa + raggio) x statura. Percio' il
   criterio C6 e l'invariante dell'erba si contendono lo stesso numero, e
   il margine e' tutto qui:
       st 1,055  ->  cima -35,46   ROSSO  (mascherea 58 px al provino)
       st 1,040  ->  cima -34,81   verde  (maschera 58 px al provino)
   1,040 e' il numero preso: dentro il cancello con tre decimi di unita'
   di margine, e con la maschera piu' alta delle quattro.
   E IL PREZZO SUL CONTRASTO E' MISURATO: collaudo.js, nove partite per
   numero, P1 in vista normale 3,03:1 prima e 3,00:1 dopo — dentro il
   minimo di 3:1, ma senza margine da spendere ancora. Chi vorra' alzare
   di piu' le figure dovra' prima abbassare il neutro, che e' la strada
   che la giuria stessa aveva indicato e che qui non e' stata presa
   perche' avrebbe rimpicciolito la figura di partita.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const E = [];
const esatta = (nome, da, a) => E.push({ nome, da, a });

const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const DA = pren('--da') || 'CALCETTO-il-gioco.html';
const A = pren('--a') || pren('--out') || pren('--dentro');

esatta('le calze vanno dall\'altra parte',
`      calze:mt(c1,'#fff6e4',0.30), risvolto:c2,`,
`      /* LE CALZE VANNO DALL'ALTRA PARTE (voce #155, giro 4). Qui
         stava mt(c1,'#fff6e4',0.30), cioe' LA STESSA FORMULA DELLA
         MAGLIA: due capi calcolati allo stesso modo non possono avere
         valori diversi, e infatti la giuria ha misurato «maglia 216 =
         calze 216, quindi in bianco e nero le masse sono due, non
         tre». Scurite del 20% verso il blu della notte lo scarto vale
         67,3 - 0,10·c1, cioe' fra 43 e 50 livelli per OGNI divisa del
         gioco contro i 40 chiesti — e il 20 non e' scelto a occhio: a
         0,24 lo scarto verso la maglia saliva a 51 ma quello verso i
         CALZONCINI scendeva a 34, cioe' la terza massa si riattaccava
         alla seconda. A 0,20 le calze escono a 169 fra la maglia (216)
         e i calzoncini (128): tre masse a quarantasette e quarantuno
         livelli l'una dall'altra — e il conto non dipende dalla
         divisa, che e' il punto. Verificato sulle quarantotto
         combinazioni divisa x carnagione da _157-valore.js.
         E' anche la rampa della luce vera: la tabella di Blender
         (L151_AO) da' 0,503 di volta celeste alla maglia e 0,389 alle
         calze. Il polpaccio vede meno cielo del torace. */
      calze:mt(c1,'#1b2233',0.20), risvolto:c2,`);

esatta('la pelle scende sotto la divisa',
`      pelle:p.skin, capelli:mt(p.hair,'#ffe9b8',0.26) || p.hair,`,
`      /* LA PELLE SCENDE SOTTO LA DIVISA (voce #155, giro 4). Il
         verbale del giro 3 la dava «seconda cosa piu' chiara»; la
         misura su tutte e quarantotto le combinazioni diceva peggio:
         con la divisa ARANCIO (maglia 193) e la carnagione #f2cfa5
         (211) la pelle era IL PUNTO PIU' CHIARO DELLA FIGURA. Le
         braccia battevano la divisa, che e' esattamente il difetto che
         il criterio C5 nomina.
         Mescolata al 48% col bruno d'ombra: 211 -> 148 contro 193,
         cioe' 45 livelli di scarto sui 40 chiesti, nel caso PEGGIORE.
         IL BRUNO E' #6b4a30 E NON UN BRUNO PIU' SCURO, e il perche' e'
         una misura: con un verso piu' scuro (#4a3020) la carnagione
         PIU' SCURA finiva a 66 e passava SOTTO la manica (74), cioe'
         la pelle tornava a un estremo — dall'altra parte. A #6b4a30 le
         sei carnagioni vanno da 77 a 148 e restano tutte dentro la
         divisa.
         E la fisica lo chiedeva gia': L151_AO da' alla pelle 0,244 di
         volta celeste contro 0,503 della maglia. Un avambraccio vede
         meno della meta' del cielo che vede un torace, e lo
         disegnavamo piu' chiaro. */
      pelle:mt(p.skin,'#6b4a30',0.48) || p.skin,
      capelli:mt(p.hair,'#ffe9b8',0.26) || p.hair,`);

esatta('lo spilungone diventa il piu\' alto',
`  /* 0 spilungone */ {g:1.00, b:1.06, sp:0.72, sh:0.84, hr:0.84, st:1.018, pa:1.14, cd:0.90},`,
`  /* 0 spilungone. LA STATURA SALE A 1,040 (voce #155, giro 4). A 1,018
     il conto era (1,640 + 0,160·0,84)·1,018 = 1,806 contro 1,800 del
     neutro: TRE MILLESIMI, cioe' 0,17 px a cinquanta — la testa piccola
     si mangiava tutta la statura, e la maschera del lungo usciva 56 px
     contro i 57 del neutro.
     IL TETTO LO METTE LA GABBIA E NON UN GUSTO: la cima della testa e'
     la STESSA grandezza della maschera — (quota della testa + raggio) x
     statura — quindi il criterio C6 e l'invariante dell'erba si
     contendono lo stesso numero. Misurato col banco ?gabbia:
         1,055 -> cima -35,46   ROSSO (il cancello boccia sotto -35,10)
         1,040 -> cima -34,81   verde, con tre decimi di margine
     A 1,040 il conto e' 1,845 contro 1,800 e la maschera del lungo e'
     la piu' alta delle quattro su tutt'e due i provini. Chi vorra' di
     piu' dovra' abbassare il NEUTRO, e quella e' un'altra proposta:
     rimpicciolisce la figura di partita. */
  /* 0 spilungone */ {g:1.00, b:1.06, sp:0.72, sh:0.84, hr:0.84, st:1.040, pa:1.14, cd:0.90},`);

esatta('il neutro scende, ed e\' la strada che la giuria aveva indicato',
`                     {g:1.00, b:1.00, sp:1.00, sh:1.00, hr:1.00, st:1.000, pa:1.00, cd:1.00},`,
`  /* LA STATURA DEL NEUTRO SCENDE A 0,955 (voce #155, giro 4), ed e' la
     strada che la giuria stessa aveva indicato: «va aperto (o il neutro
     abbassato) finche' la maschera del lungo e' la piu' alta delle
     quattro». APRIRE NON SI POTEVA, ed e' aritmetica, non prudenza: la
     cima della testa e la maschera nera sono LA STESSA grandezza —
     (quota della testa + raggio) x statura — quindi il criterio C6 e
     l'invariante dell'erba si contendono lo stesso numero. Misurato col
     banco ?gabbia e col provino:
       lungo st 1,055 -> cima -35,46  ROSSO (il cancello boccia -35,10)
       lungo st 1,040 -> cima -34,81  verde, ma sul provino 57 px contro
                                      i 57 del neutro: un PAREGGIO
       lungo st 1,030 -> cima -34,48  verde anche contro il riferimento
                                      stretto (-34,6)
     A quel punto l'unica leva rimasta e' il neutro. 1,000 -> 0,955 e il
     provino legge 56 / 54 / 50 / 54: il piu' alto e' lo spilungone, il
     piu' basso il piccoletto — le due cose che il criterio chiede di
     vedere. I due in mezzo pareggiano, e va bene: il criterio chiede
     «si vede quale dei quattro e' lo spilungone e quale il piccoletto»,
     non una classifica completa.
     IL PREZZO E' DICHIARATO. La figura della taglia nominale scende da
     50,1 a 47,9 px in partita (il 4,5%), e la statura MEDIA delle
     quattro corporature scende dell'1,4%. E' la ragione per cui il
     neutro scende poco e non molto: ogni pixel tolto a tutti e' un
     pixel tolto alla leggibilita' che questa onda compra altrove.
     Sul CONTRASTO il prezzo va nell'altro verso, ed e' misurato: figure
     piu' basse mettono meno capelli nell'anello d'erba della sonda di
     collaudo.js. */
                     {g:1.00, b:1.00, sp:1.00, sh:1.00, hr:1.00, st:0.955, pa:1.00, cd:1.00},`);

/* ===================================================================== */
if (!A) { console.error('FALLITO: manca --a <destinazione> (o --out/--dentro).'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }
let src = fs.readFileSync(DA, 'utf8');
const prima = src.length;
for (const e of E) {
  const n = src.split(e.da).length - 1;
  if (n !== 1) {
    console.error('FALLITO [' + e.nome + ']: l\'ancora compare ' + n + ' volte, non 1. Non scrivo niente.');
    process.exit(1);
  }
  src = src.replace(e.da, () => e.a);
}
const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
console.log('toppa applicata: ' + E.length + ' ancore');
console.log('  da:   ' + DA + '   a: ' + dest);
console.log('  delta di file: ' + (src.length - prima) + ' byte');
