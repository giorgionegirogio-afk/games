/* =====================================================================
   _toppa-155-gesti.js — IL VERBO SI LEGGE DAL FERMO IMMAGINE
   (voce #155, giro 1 · criteri C1 e C7 della giuria)

   ====================== LE DUE FAMIGLIE CHE COLLASSANO ================
   Il giudizio: «non confonde piu' le due famiglie che oggi collassano:
   fermo / contrasto / pugni (tre pose in piedi con un braccio fuori,
   identiche) e passaggio / filtrante / cross / tiro (uno stesso slancio
   della destra, separabili SOLO dalla posizione della palla)».

   A. FERMO / CONTRASTO / PUGNI
      CONTRASTO. Era un affondo verticale e simmetrico: il busto
        indietro, le due braccia con lo STESSO out, le gambe aperte di
        0,03 m — cioe' niente. Adesso la colonna PENDE di lato (la
        stessa coppia inclinazione/spalle con cui poseFinta fa sporgere
        il busto oltre il bacino: non un secondo meccanismo) e la base
        si allarga a 0,19: una V bassa e storta, che in nero non e' un
        uomo in piedi. La colonna NON scivola di lato (sway resta 0):
        lo scarto del busto alla quota della finestra della sonda del
        contrasto di collaudo.js resta sotto tre quarti di unita' di
        schermo, dentro la colonna +-1,5 che quella sonda campiona.
      PUGNI. out valeva 0,075: le braccia stavano INCOLLATE al tronco e
        in maschera nera sparivano dentro la massa — la seconda regola
        della silhouette, violata proprio nella clip che avrebbe dovuto
        gridare. La guardia di chi para di pugno e' larga: i gomiti
        FUORI (out a 0,18 in carica) e le mani vicine, e nel colpo out
        si stringe a 0,09 perche' quello e' il gesto. La base passa da
        0,05 a 0,22.
        Il ginocchio del colpo perde due centesimi di scatto (-0,05 al
        posto di -0,08 sulla gaussiana) perche' con out a 0,09 il minimo
        di flessione della scatola sale a 0,217 e a -0,08 il gomito
        finiva a 0,220: dentro per tre millesimi, cioe' fuori il giorno
        che qualcuno tocchi un altro numero.

   B. I QUATTRO CALCI
      Sono lo stesso motore (poseCalcio) e devono restarlo: la gamba che
      frusta e' quella. Quello che li separa a cinquanta pixel e' la
      META' ALTA, e prima la meta' alta era identica in tre su quattro
      (armSu dichiarato solo dal tiro, aprCar solo dal tiro).
        passaggio  il piu' RACCOLTO: si siede (crouch 0,06 -> 0,11), il
                   busto quasi non segue (leanFwd 0,10 -> 0,06) e le
                   braccia restano basse. E' il termine di paragone.
        filtrante  si CARICA SOPRA la palla (leanFwd 0,17 -> 0,34) e il
                   bilanciere sale a mezza altezza (armSu 0,55).
        cross      si SDRAIA INDIETRO (leanBack 0,12 -> 0,30) e apre il
                   bilanciere in alto (armSu 0,95), che e' l'unica cosa
                   che a questa camera fa CRESCERE una figura verso
                   l'alto — vedi il riquadro di armSu in poseCalcio.
        tiro       resta com'e' (e' la clip gia' lavorata due volte), ma
                   affonda di piu' sul piede d'appoggio: dip 0,05 ->
                   0,10, cioe' il peso che arriva.
      Tutte e tre le aggiunte stanno su w1/w2, che tornano a zero a fine
      ciclo: la chiusura della clip non si tocca. armOut+armApri resta
      sotto 0,21 in tutte e quattro, cioe' dentro la scatola degli
      angoli (il tetto e' 0,2225 sul corpo dalle braccia piu' corte).

   ====================== C7 · DOVE IL TUFFO SPENDE I FOTOGRAMMI ========
   Misurato dalla giuria sul foglio a sedici fotogrammi: «il corpo passa
   da accovacciato-verticale a completamente disteso fra il 4/16 e il
   5/16, e dal 9/16 al 16/16 — meta' della clip — e' lo stesso corpo
   disteso che scivola».
   Il conto era questo: vol = sm(u, 0,15, 0,31), cioe' tutta la
   distensione dentro 0,16 di ciclo = due fotogrammi e mezzo; poi cad
   finiva a 0,58 e fino a ri (0,74) non succedeva piu' niente.
   Adesso la distensione dura 0,24 di ciclo e ARRIVA AL CONTATTO:
     0,16 -> 0,40, con fotogrammi a 0,036 / 0,32 / 0,70 / 0,97 di
     estensione — quattro fotogrammi diversi dove ce n'erano due.
   La caduta slitta a 0,46-0,64, la botta a 0,645, lo scivolamento a
   0,62-0,74: il vuoto fra il 9/16 e il 13/16 si riempie di caduta,
   impatto e strisciata, e la rialzata resta dov'era.
   L'ISTANTE DEL CONTATTO NON SI MUOVE: imp resta a 0,40 e pallaTuffo
   ha ancora ti = 0,40. Spostarlo sarebbe stato un tocco alla partita
   travestito da grafica — la simulazione manda qui una fase, e la
   parata deve cadere dove cadeva.
   L'atterraggio guadagna una compressione vera: il bacino affonda di
   0,10 sulla botta invece di 0,04 (e' una gaussiana, torna a zero da
   sola: la chiusura del ciclo non si tocca).
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------
   A1. IL CONTRASTO PENDE E SI ALLARGA
   ------------------------------------------------------------------ */
cambio('1. contrasto: la colonna pende di lato',
`  corpo(pelvY,0,lean,cenno);
  const sl=Msin(lean), cl=Mcos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* braccia in opposizione, aperte per l'equilibrio.`,
`  /* IL CONTRASTO E' UNA SPALLA CHE ENTRA (voce #155). Era un affondo
     VERTICALE e simmetrico, e il provino a cinquanta pixel lo
     confondeva con «sta fermo» e con «para di pugno». Qui la colonna
     PENDE di lato: e' la stessa inclinazione con cui poseFinta fa
     sporgere il busto oltre il bacino (dLat/0,71 e' lo scarto laterale
     voluto diviso l'altezza bacino-testa, cioe' l'angolo che lo da'),
     non un secondo meccanismo.
     LA COLONNA NON SCIVOLA — sway resta 0 — e non e' pigrizia: la sonda
     del contrasto di collaudo.js campiona una colonna FISSA di +-1,5
     unita' sopra il centro del giocatore. Con la sola inclinazione il
     busto, alla quota di quella finestra, si sposta di 0,76 unita' e
     resta dentro; aggiungendoci uno scivolamento del bacino uscirebbe,
     e il rapporto maglia/erba cambierebbe senza che la maglia sia stata
     toccata. Somma: 0,16-0,10-0,06 = 0.
     Le spalle seguono il collo (shX), se no si staccherebbero dal
     tronco di dieci centimetri. */
  const dLat = 0.16*all - 0.10*seg - 0.06*rit;
  corpo(pelvY,0,lean,cenno,dLat/0.71);
  const sl=Msin(lean), cl=Mcos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl, shX=dLat*0.6;
  /* braccia in opposizione, aperte per l'equilibrio.`);

cambio('2. contrasto: le spalle seguono il collo',
`  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, out, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, out,-1);
  const hz=0.06*sl;
  /* LA GAMBA DESTRA E' IL GESTO: anca 0,10 -> 0,95, ginocchio 0,55 ->`,
`  braccio(SHR,ELR,HAR,  shX+SHW, shY, shZ, aR,eR, out, 1);
  braccio(SHL,ELL,HAL,  shX-SHW, shY, shZ, aL,eL, out,-1);
  const hz=0.06*sl;
  /* LA GAMBA DESTRA E' IL GESTO: anca 0,10 -> 0,95, ginocchio 0,55 ->`);

cambio('3. contrasto: la base si allarga da 0,03 a 0,19',
`  const apr =  0.03*all - 0.02*seg - 0.01*rit;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, hz, aGd,kGd,  HIPW+apr);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, hz, aGs,kGs, -HIPW-apr);`,
`  /* LA BASE SI ALLARGA (voce #155): 0,03 m di apertura fra i piedi non
     e' una base, e' un birillo. A 0,19 la V bassa si legge in nero e la
     posa smette di essere una colonna. L'abduzione d'anca arriva a
     sin = (0,105+0,19)/0,91 = 0,324, contro il tetto 0,751 della
     scatola: zero tagli.  Somma: 0,19-0,12-0,07 = 0 */
  const apr =  0.19*all - 0.12*seg - 0.07*rit;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, hz, aGd,kGd,  HIPW+apr);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, hz, aGs,kGs, -HIPW-apr);`);

/* ------------------------------------------------------------------
   A2. I PUGNI TIRANO FUORI I GOMITI
   ------------------------------------------------------------------ */
cambio('4. pugni: il gomito non scatta piu\' fin dentro la scatola',
`  const eR = 0.45 + 0.90*car - 1.05*sca + 0.06*seg + 0.09*rit - 0.08*imp;
  const eL = 0.45 + 0.78*car - 0.87*sca + 0.05*seg + 0.04*rit - 0.08*imp;
  /* i pugni si STRINGONO: out cala a 0,05 nel colpo.  somma: 0,04-0,05+0,02-0,01 = 0 */
  const out = 0.06 + 0.04*car - 0.05*sca + 0.02*seg - 0.01*rit;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, out, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, out,-1);`,
`  /* -0,05 e non piu' -0,08 sulla gaussiana: con i gomiti FUORI (qui
     sotto) il minimo di flessione della scatola sale a 0,217 e a -0,08
     il gomito finiva a 0,220 — dentro per tre millesimi, cioe' fuori il
     giorno che qualcuno tocchi un altro numero. */
  const eR = 0.45 + 0.90*car - 1.05*sca + 0.06*seg + 0.09*rit - 0.05*imp;
  const eL = 0.45 + 0.78*car - 0.87*sca + 0.05*seg + 0.04*rit - 0.05*imp;
  /* I GOMITI ESCONO DAL BUSTO (voce #155). out valeva 0,075: le braccia
     stavano incollate al tronco e in maschera nera sparivano dentro la
     massa — la seconda regola della silhouette («nessun arto appoggiato
     alla massa centrale») violata proprio nella clip che avrebbe dovuto
     gridare, e in nero «para di pugno» era «sta fermo». La guardia di
     chi para e' larga: gomiti fuori a 0,18 in carica, mani vicine, e
     nel colpo out si STRINGE a 0,09 perche' quello e' il gesto.
     I due bracci non hanno lo stesso out, se no sono un disegno solo.
     Somme: 0,12-0,09-0,02-0,01 = 0  e  0,09-0,06-0,02-0,01 = 0 */
  const outR = 0.06 + 0.12*car - 0.09*sca - 0.02*seg - 0.01*rit;
  const outL = 0.06 + 0.09*car - 0.06*sca - 0.02*seg - 0.01*rit;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, outR, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, outL,-1);`);

cambio('5. pugni: la base si allarga',
`  const apr =  0.05 + 0.06*car - 0.03*sca - 0.02*seg - 0.01*rit;`,
`  /* LA BASE: 0,05 non e' una base. A 0,22 in carica il portiere si
     pianta, e la V delle gambe si legge in nero.
     somma: 0,08-0,04-0,03-0,01 = 0 */
  const apr =  0.14 + 0.08*car - 0.04*sca - 0.03*seg - 0.01*rit;`);

/* ------------------------------------------------------------------
   B. I QUATTRO CALCI SI SEPARANO NELLA META' ALTA
   ------------------------------------------------------------------ */
cambio('6. passaggio: il piu\' raccolto dei quattro',
`const Q_PASSAGGIO={tImp:0.44,swing:0.13,segue:0.22, back:0.55,fwd:0.55,follow:1.00,
  kneeBack:0.85,kneeImp:0.18,kneeSegue:0.45, crouch:0.06,dip:0.05,
  leanBack:0.05,leanFwd:0.10, apriSp:0.12,apriAn:0.06, arm:0.45,armOut:0.05,armApri:0.12,
  appA:0.28,appK:0.30, px:0.10,pz:0.34, gitt:2.8,alza:0,arco:0,dirX:0};`,
`/* IL PASSAGGIO E' IL TERMINE DI PARAGONE (voce #155): il piu' RACCOLTO
   dei quattro. Si siede (crouch 0,06 -> 0,11), il busto quasi non segue
   (leanFwd 0,10 -> 0,06) e le braccia restano basse e chiuse (armApri
   0,12 -> 0,09). Le gambe pero' si aprono un poco anche in carica
   (aprCar 0,12): in maschera nera due gambe che partono dallo stesso
   punto sono una gamba sola. */
const Q_PASSAGGIO={tImp:0.44,swing:0.13,segue:0.22, back:0.55,fwd:0.55,follow:1.00,
  kneeBack:0.85,kneeImp:0.18,kneeSegue:0.45, crouch:0.11,dip:0.05,
  leanBack:0.05,leanFwd:0.06, apriSp:0.12,apriAn:0.06, arm:0.45,armOut:0.05,armApri:0.09,
  aprCar:0.12, appA:0.28,appK:0.30, px:0.10,pz:0.34, gitt:2.8,alza:0,arco:0,dirX:0};`);

cambio('7. filtrante: si carica SOPRA la palla',
`const Q_FILTRANTE={tImp:0.36,swing:0.09,segue:0.18, back:0.75,fwd:0.65,follow:1.20,
  kneeBack:1.05,kneeImp:0.12,kneeSegue:0.40, crouch:0.10,dip:0.06,
  leanBack:0.08,leanFwd:0.17, apriSp:0.16,apriAn:0.08, arm:0.65,armOut:0.06,armApri:0.13,
  appA:0.30,appK:0.38, px:0.10,pz:0.36, gitt:4.0,alza:0,arco:0,dirX:0};`,
`/* IL FILTRANTE SI CARICA SOPRA LA PALLA (voce #155): il busto segue il
   colpo il doppio (leanFwd 0,17 -> 0,34) e il bilanciere sale a mezza
   altezza (armSu 0,55, che prima dichiarava solo il tiro). E' la clip
   che «guarda in avanti» della famiglia. */
const Q_FILTRANTE={tImp:0.36,swing:0.09,segue:0.18, back:0.75,fwd:0.65,follow:1.20,
  kneeBack:1.05,kneeImp:0.12,kneeSegue:0.40, crouch:0.10,dip:0.06,
  leanBack:0.08,leanFwd:0.34, apriSp:0.16,apriAn:0.08, arm:0.65,armOut:0.06,armApri:0.13,
  armSu:0.55, aprCar:0.16, appA:0.30,appK:0.38, px:0.10,pz:0.36, gitt:4.0,alza:0,arco:0,dirX:0};`);

cambio('8. cross: si sdraia indietro e apre il bilanciere in alto',
`const Q_CROSS={tImp:0.44,swing:0.12,segue:0.26, back:0.70,fwd:0.60,follow:1.15,
  kneeBack:1.00,kneeImp:0.15,kneeSegue:0.55, crouch:0.08,dip:0.05,
  leanBack:0.12,leanFwd:0.02, apriSp:0.55,apriAn:0.28, arm:0.55,armOut:0.11,armApri:0.08,
  attraversa:0.30, appA:0.26,appK:0.34, px:0.14,pz:0.34, gitt:3.6,alza:0.95,arco:1,dirX:-0.35};`,
`/* IL CROSS SI SDRAIA INDIETRO (voce #155). Chi mette un pallone in
   mezzo si porta il peso sul tallone e apre: leanBack 0,12 -> 0,30 e
   armSu 0,95 sul bilanciere, che a questa camera e' l'unica leva che fa
   CRESCERE una figura verso l'alto (tutto cio' che va indietro, in
   pianta a 42 gradi, scende sullo schermo — vedi il riquadro di armSu
   in poseCalcio). Con la base aperta in carica (aprCar 0,24) e il
   seguito che taglia attraverso il corpo (attraversa, che c'era gia')
   la sagoma e' una X inclinata, non lo slancio di un tiro. */
const Q_CROSS={tImp:0.44,swing:0.12,segue:0.26, back:0.70,fwd:0.60,follow:1.15,
  kneeBack:1.00,kneeImp:0.15,kneeSegue:0.55, crouch:0.08,dip:0.05,
  leanBack:0.30,leanFwd:0.02, apriSp:0.55,apriAn:0.28, arm:0.55,armOut:0.11,armApri:0.08,
  armSu:0.95, aprCar:0.24,
  attraversa:0.30, appA:0.26,appK:0.34, px:0.14,pz:0.34, gitt:3.6,alza:0.95,arco:1,dirX:-0.35};`);

/* IL TIRO NON SI TOCCA, E IL PERCHE' E' UNA MISURA.
   Il piano di questo giro gli dava dip 0,05 -> 0,10 — il peso che
   arriva sul piede d'appoggio. Misurato con strumenti/silhouette.js:
   a u 0,62 («ha appena tirato», una delle dieci azioni del provino
   cieco) quel centimetro di bacino in meno CHIUDE la strozzatura del
   bacino, le masse leggibili scendono da 2 a 1, la posa esce dalle
   nominabili e il cancello passa da 8/10 a 7/10.
   Un centimetro di peso non vale una posa che non si legge piu'. Il
   peso del tiro lo porta adesso il nucleo di contatto dell'ombra
   (_toppa-155-peso.js), che non tocca la sagoma. */

/* ------------------------------------------------------------------
   C. IL TUFFO RIDISTRIBUISCE I SUOI SEDICI FOTOGRAMMI
   ------------------------------------------------------------------ */
cambio('10. tuffo: la distensione dura fino al contatto, la caduta slitta',
`  const ca=sm(u,0.02,0.13);              // caricamento sulle gambe
  const sp=sm(u,0.13,0.21);              // SPINTA: il bacino sale
  const est=sm(u,0.13,0.30);             // le gambe si staccano da terra
  const vol=sm(u,0.15,0.31);             // volo: il busto si stende
  const cad=sm(u,0.44,0.58);             // discesa fino al fianco
  const ri=sm(u,0.74,0.96);              // rialzata
  const rac=sm(u,0.72,0.84)*(1-sm(u,0.86,0.98));   // il piede sotto
  const dd=(u-0.40)/0.05, imp=Mexp(-dd*dd);    // deviazione all'apice
  const db=(u-0.58)/0.05, botta=Mexp(-db*db);  // la botta a terra
  const p=u-0.58, osc=p>0?Msin(p*9)*Mexp(-5*p):0;  // assestamento
  const slitta=sm(u,0.56,0.72)*(1-sm(u,0.80,0.97));        // scivolamento`,
`  /* =================================================================
     DOVE IL TUFFO SPENDE I SUOI FOTOGRAMMI (voce #155, criterio C7).
     Misurato sul foglio a sedici: il corpo passava da accovacciato a
     completamente disteso fra il 4/16 e il 5/16 (vol durava 0,16 di
     ciclo, cioe' due fotogrammi e mezzo) e dal 9/16 al 16/16 era lo
     stesso corpo disteso che scivola.
     Adesso la distensione dura 0,24 e ARRIVA AL CONTATTO — 0,036 /
     0,32 / 0,70 / 0,97 sui quattro fotogrammi fra 0,19 e 0,38, dove
     prima ce n'erano due — e la caduta, la botta e la strisciata
     riempiono il vuoto fra il 9/16 e il 13/16.
     L'ISTANTE DEL CONTATTO NON SI MUOVE: imp resta a 0,40 e pallaTuffo
     ha ancora ti = 0,40. La simulazione manda qui una fase, e la
     parata deve cadere dove cadeva: spostarla sarebbe un tocco alla
     partita travestito da grafica.
     ================================================================= */
  const ca=sm(u,0.02,0.15);              // caricamento sulle gambe (ANTICIPO)
  const sp=sm(u,0.15,0.23);              // SPINTA: il bacino sale
  const est=sm(u,0.15,0.36);             // le gambe si staccano da terra
  const vol=sm(u,0.16,0.40);             // volo: il busto si stende, FINO AL CONTATTO
  const cad=sm(u,0.46,0.64);             // discesa fino al fianco
  const ri=sm(u,0.74,0.97);              // rialzata
  const rac=sm(u,0.72,0.85)*(1-sm(u,0.88,0.99));   // il piede sotto
  const dd=(u-0.40)/0.05, imp=Mexp(-dd*dd);    // deviazione all'apice (NON si muove)
  const db=(u-0.645)/0.045, botta=Mexp(-db*db);  // la botta a terra
  const p=u-0.645, osc=p>0?Msin(p*9)*Mexp(-5.6*p):0;  // assestamento
  const slitta=sm(u,0.62,0.74)*(1-sm(u,0.80,0.97));        // scivolamento`);

cambio('11. tuffo: l\'atterraggio comprime davvero',
`  const pelvY=0.88-0.30*ca+0.62*sp-0.93*cad+0.61*ri-0.04*botta+0.02*osc;`,
`  /* -0,10 e non -0,04: la COMPRESSIONE dell'atterraggio. E' una
     gaussiana, torna a zero da sola — la chiusura del ciclo, risolta
     per ca=vol=cad=ri=1, non si tocca. */
  const pelvY=0.88-0.30*ca+0.62*sp-0.93*cad+0.61*ri-0.10*botta+0.02*osc;`);

cambio('12. tuffo: la polvere cade sulla botta nuova',
`polvere:{t:0.56,d:0.20}},`,
`polvere:{t:0.645,d:0.20}},`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-155-gesti.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
for (const [k, q] of [['const dLat = 0.16*all - 0.10*seg - 0.06*rit;', 1],
                      ['const outR = 0.06 + 0.12*car - 0.09*sca - 0.02*seg - 0.01*rit;', 1],
                      ['armSu:0.95, aprCar:0.24,', 1],
                      ['const vol=sm(u,0.16,0.40);', 1],
                      ["polvere:{t:0.645,d:0.20}", 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: i gesti, ' + CAMBI.length + ' cambi, ' + ing + ' -> ' + usc);
console.log('  il file cresce di ' + (Buffer.byteLength(t, 'utf8') - fs.statSync(ing).size) + ' byte');
