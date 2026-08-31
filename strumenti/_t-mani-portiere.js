/* =====================================================================
   _t-mani-portiere.js — LE TRE MANI CHE NON C'ERANO (29 agosto 2026).

   LA VOCE. Referto `_analisi/ONDA-ANIMAZIONE.md`, famiglia **F2 — i
   gesti senza corpo**, voci 13, 14 e 32: il portiere ha QUATTRO esiti in
   campo — PRESA, PUGNI, SFUGGE, RESPINTA (tentaPresa) — e **uno solo**
   ha una clip. Lo scrive il gioco stesso, nel commento del ramo dei
   pugni: «NIENTE CLIP NUOVA ... Il gesto giusto e' da fare, non da
   riciclare».

   IL CASO CHE SI VEDE, e non e' quello che si immagina. tentaPresa la
   chiamano da tre posti:
     · dal tuffo in volo    (p.dive>0)   -> il rig disegna 'tuffo'/'parata'
     · dal corpo gia' a terra (p.recover>0) -> la coda di quelle due
     · DA FERMO, riga «if(p.kickCd<=0){ ... tentaPresa(p,b); }» -> il rig
       non ha NIENTE da dire: il pallone riparte a 430-620 unita' al
       secondo e la figura resta quella dell'attesa.
   IL TERZO CASO E' LA MINORANZA, e va scritto perche' e' la misura
   che dice quanto vale questa cura. Su 100 partite x 120 s a 5 contro
   5 (seme 20260803, `_g-mani.js --veloce`) gli esiti che LASCIANO
   ANDARE il pallone sono 195: PUGNI 7, SFUGGE 41, RESPINTA 147. Di
   questi, 43 (il 22,1%) capitano col portiere IN PIEDI; 16 dei 43
   ripartono subito in un nuovo tuffo, e restano **27**. Quei 27 erano
   disegnati `corsa` 15, `camminata` 6, `attesaGK` 6 — cioe' zero su
   ventisette avevano un corpo. Sono pochi per partita (0,27) e sono
   tutti momenti in cui il gioco urla una scritta a schermo.
   Le tre pose si armano SOLO li' — `p.dive<=0 && p.recover<=0` — che e'
   la stessa guardia con cui il gioco arma gia' `presaT` per la presa
   alta («b.z>14 && p.dive<=0»). Sul tuffo la clip giusta e' il tuffo:
   sostituirla con un uomo in piedi teletrasporterebbe un corpo
   orizzontale in verticale, e sarebbe peggio, non meglio.

   PERCHE' QUESTO E' IL POSTO PIU' VISIBILE DI TUTTA F2 — un conto di
   proiezione, non un'opinione. La camera in pianta scrive
     lo SCARTO LATERALE del rig  x -> schermo verticale, 43,4 px/m
     l'AVANTI del rig            z -> schermo ORIZZONTALE, 64,8 px/m
   quando l'imbardata vale pi/2, cioe' quando la figura guarda lungo
   l'asse x. Il portiere IN PIEDI guarda sempre lungo x (p.fx = dir*cos
   di una torsione di al massimo 0,6 rad): |sin(imbardata)| ~ 1, il
   valore MIGLIORE che questa camera concede. E' il contrario esatto del
   tuffo, che si imbarda lungo la bocca della porta e collassa a 0,201.
   Un braccio portato AVANTI da un portiere in piedi e' il gesto piu'
   leggibile che questo gioco possa disegnare — ed e' proprio quello che
   mancava. Tutte e tre le pose spendono li' il loro sporgere.

   LE TRE POSE, e cosa le distingue in maschera nera:
     pugni     i due pugni partono INSIEME avanti e in alto, il bacino
               sale sulle punte (0,99, come poseTesta). Misurato sulla
               posa: le due mani a z 0,586 e 0,601 e a quota 1,58-1,63,
               contro una testa a 1,68 — 38 px di sporgenza orizzontale
               su una figura alta 91.
     respinta  una manata sola: il braccio vicino spara AVANTI (mano a
               z 0,62-0,64), quello lontano vola INDIETRO (z -0,05 /
               -0,09), e le gambe si aprono in affondo. Apertura dei
               piedi misurata 1,03-1,09 m, cioe' 67-70 px: e' la sagoma
               piu' larga fra le pose in piedi.
     sfugge    il fallimento: le mani si chiudono a vuoto davanti, il
               pallone passa, il busto si piega in avanti di 0,78 rad e
               la testa scende da 1,61 a 1,25 andando avanti a z 0,49.
               E' l'unica posa in piedi in cui la cima della figura CALA
               invece di salire.

   COSA NON CAMBIA:
     · la fisica. Le tre pose sono solo disegno: nessun ramo di
       tentaPresa cambia numero, nessun rnd() in piu' o in meno.
       La legge sui sorteggi si verifica con _g-sorteggi.js.
     · il tuffo e la parata. Il ramo nuovo di rigStato sta DOPO quelli
       di p.dive, p.recover, della raccolta e di presaT.
     · il tuffo come posa (referto § 7.5: la sua simmetria e' gia' 0,488,
       non va rifatto).

   Misura:  node strumenti/_g-mani.js --gioco fuori/<copia>.html --taglia 5 --partite 10 --sec 120
   Cancello:node strumenti/_q-mani.js --gioco fuori/<copia>.html
   Gabbia:  node strumenti/gabbia.js  --gioco fuori/<copia>.html
   Sorteggi:node strumenti/_g-sorteggi.js --gioco fuori/<copia>.html --sec 90 --taglia 5

   uso:  node strumenti/_t-mani-portiere.js --out fuori/anim-seconda.html
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

/* 1 — le tre pose, scritte dove stanno le altre del ruolo: subito dopo
       il rinvio e prima dell'attesa. */
{
  nome: '1/9 posePugni, poseRespinta, poseSfugge accanto alle altre del portiere',
  cerca: `/* =====================================================================
   ATTESA DEL PORTIERE — la sagoma riservata al ruolo.`,
  metti:
`/* =====================================================================
   LE TRE MANI CHE PARANO SENZA PRENDERE (29 agosto 2026).

   tentaPresa ha QUATTRO esiti e fino a oggi ne disegnava uno: la presa
   alta (presaT -> clip 'presa'). Gli altri tre — PUGNI, SFUGGE,
   RESPINTA — muovevano il pallone a 430-620, 70-150 e 150-250 unita' al
   secondo mentre il corpo del portiere restava quello dell'attesa. Il
   commento del ramo dei pugni lo diceva da se': «Il gesto giusto e' da
   fare, non da riciclare».

   DOVE VANNO SPESE. La camera in pianta scrive l'AVANTI del rig sul
   verso ORIZZONTALE dello schermo (64,8 px al metro) e lo scarto
   laterale su quello verticale (43,4), e lo fa quando l'imbardata vale
   pi/2 — cioe' quando la figura guarda lungo l'asse x. Il portiere IN
   PIEDI guarda sempre lungo x: la torsione di updateKeeper arriva al
   massimo a 0,6 rad. Percio' tutte e tre queste pose portano il gesto
   AVANTI, che e' il verso in cui questa camera lo mostra intero. E'
   l'opposto del tuffo, che si stende lungo la bocca della porta e
   perde l'80% di se' nella proiezione.

   COME SI DISTINGUONO in maschera nera — la regola pagata a caro
   prezzo dal provino cieco del 17 agosto e' «un arto deve USCIRE NETTO
   dalla sagoma»:
     pugni     DUE braccia dalla stessa parte, avanti e in alto, con il
               bacino sulle punte (0,99). Misurato: mani a z 0,586 e
               0,601, quota 1,58 e 1,63, testa 1,68 — 38 px di sporgenza
               orizzontale su una figura alta 91.
     respinta  UN braccio avanti (mano a z 0,62) e UNO indietro (z
               -0,09), e le gambe in affondo. Apertura dei piedi
               misurata 1,03-1,09 m, cioe' 67-70 px: la sagoma piu'
               LARGA fra le pose in piedi.
     sfugge    il busto si piega avanti di 0,78 rad, la testa scende da
               1,61 a 1,25 e va avanti a 0,49. E' l'unica posa in piedi
               in cui la CIMA della figura cala invece di salire, e in
               nero e' una massa bassa e lunga dove le altre due sono
               alte.

   LA REGOLA DI CHIUSURA, come per tuffo e testa: la somma dei
   coefficienti non costanti di ogni curva deve fare ZERO a finestre
   tutte aperte, altrimenti la posa non torna al punto di partenza e il
   portiere resta con un braccio per aria quando la clip finisce. Le
   somme sono scritte accanto a ogni riga, e il banco le verifica.
   ===================================================================== */
/* PUGNI: il pallone e' alto e troppo forte per le mani, e si smanaccia.
   0,06-0,26 CARICA   i pugni rientrano al petto, le ginocchia si
                      piegano, il busto va INDIETRO (-0,20)
   0,26-0,34 SCATTO   i due pugni partono insieme avanti e in alto, il
                      bacino sale sulle punte (0,99, come poseTesta)
   0,32      CONTATTO la gaussiana imp, larga 0,03
   0,34-0,58 SEGUITO  le braccia restano fuori e scendono piano
   0,64-0,97 RIENTRO
   In partita si vede da 0,24 in poi (vedi rigStato): il pugno non ha
   carica, il pallone arriva e basta. */
function posePugni(u){
  const car = sm(u,0.06,0.26);
  const sca = sm(u,0.26,0.34);
  const seg = sm(u,0.34,0.58);
  const rit = sm(u,0.64,0.97);
  const di=(u-0.32)/0.03, imp=Math.exp(-di*di);
  const p=u-0.32, osc = p>0 ? Math.sin(p*10)*Math.exp(-5.5*p) : 0;
  /* somma: -0,12+0,21-0,05-0,04 = 0  ->  0,90 ; massimo 0,99 sulle punte */
  const pelvY = 0.90 - 0.12*car + 0.21*sca - 0.05*seg - 0.04*rit + 0.012*osc;
  /* somma: -0,26+0,46+0,06-0,26 = 0 ; -0,20 in carica, +0,26 nel colpo */
  const lean  = 0.06 - 0.26*car + 0.46*sca + 0.06*seg - 0.26*rit + 0.05*osc;
  /* somma: -0,035+0,020+0,010+0,005 = 0 ; corpo() lo moltiplica per 4 */
  const cen   = -0.035*car + 0.020*sca + 0.010*seg + 0.005*rit;
  corpo(pelvY,0,lean,cen);
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* le due braccia fanno la STESSA cosa — e' il gesto, due pugni
     insieme — ma non lo stesso disegno: 0,12 rad di scarto fra le
     spalle e 0,18 fra i gomiti bastano perche' in nero siano due.
     somme: -0,10+1,60-0,22-1,28 = 0   e   -0,16+1,54-0,16-1,22 = 0 */
  const aR = 0.35 - 0.10*car + 1.60*sca - 0.22*seg - 1.28*rit + 0.10*osc;
  const aL = 0.35 - 0.16*car + 1.54*sca - 0.16*seg - 1.22*rit + 0.08*osc;
  /* il gomito SCATTA teso al contatto (-0,08 sulla gaussiana) e resta
     sopra eMin = 0,12+0,29*|out/UA|: con out a 0,05 il minimo e' 0,177
     e il gomito destro non scende sotto 0,22.
     somme: 0,90-1,05+0,06+0,09 = 0   e   0,78-0,87+0,05+0,04 = 0 */
  const eR = 0.45 + 0.90*car - 1.05*sca + 0.06*seg + 0.09*rit - 0.08*imp;
  const eL = 0.45 + 0.78*car - 0.87*sca + 0.05*seg + 0.04*rit - 0.08*imp;
  /* i pugni si STRINGONO: out cala a 0,05 nel colpo.  somma: 0,04-0,05+0,02-0,01 = 0 */
  const out = 0.06 + 0.04*car - 0.05*sca + 0.02*seg - 0.01*rit;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, out, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, out,-1);
  const hz=0.06*sl;
  /* somme: 0,16-0,26+0,06+0,04 = 0  |  0,62-0,60+0,05-0,07 = 0
           -0,10+0,34-0,16-0,08 = 0  |  0,72-0,66+0,02-0,08 = 0  |  0,06-0,03-0,02-0,01 = 0 */
  const aGd =  0.14 + 0.16*car - 0.26*sca + 0.06*seg + 0.04*rit;
  const kGd =  0.24 + 0.62*car - 0.60*sca + 0.05*seg - 0.07*rit;
  const aGs = -0.06 - 0.10*car + 0.34*sca - 0.16*seg - 0.08*rit;
  const kGs =  0.30 + 0.72*car - 0.66*sca + 0.02*seg - 0.08*rit;
  const apr =  0.05 + 0.06*car - 0.03*sca - 0.02*seg - 0.01*rit;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, hz, aGd,kGd,  HIPW+apr);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, hz, aGs,kGs, -HIPW-apr);
}
/* RESPINTA: il pallone e' fuori dalla presa o troppo forte, e si devia.
   0,03-0,20 SCATTO   il braccio vicino spara AVANTI teso, quello
                      lontano vola INDIETRO a contrappeso, le gambe si
                      aprono in affondo
   0,20      CONTATTO
   0,20-0,46 SEGUITO  il braccio continua, il busto rincula
   0,54-0,97 RIENTRO
   L'AFFONDO E' RISOLTO, NON SCELTO. Con il bacino a 0,76 la gamba
   arriva a terra se THIGH*cos(a)+SHIN*cos(a-knee) vale 0,715: davanti
   (a 0,80, ginocchio 0,30) fa 0,7154, dietro (a -0,52, ginocchio 0,28)
   fa 0,7127. I due piedi finiscono a +0,546 e -0,552, cioe' un metro e
   dieci di apertura con le gambe QUASI TESE e la geometria che torna —
   non un piede piantato sotto il manto dalla cinematica inversa. */
function poseRespinta(u){
  const sca = sm(u,0.03,0.20);
  const seg = sm(u,0.20,0.46);
  const rit = sm(u,0.54,0.97);
  const di=(u-0.20)/0.035, imp=Math.exp(-di*di);
  const p=u-0.20, osc = p>0 ? Math.sin(p*9)*Math.exp(-5*p) : 0;
  /* somma: -0,14-0,04+0,18 = 0  ->  0,90 ; 0,76 al contatto (seg=0),
     0,72 nel seguito. Il conto delle gambe qui sotto usa lo 0,76. */
  const pelvY = 0.90 - 0.14*sca - 0.04*seg + 0.18*rit - 0.02*imp + 0.010*osc;
  /* somma: 0,26+0,12-0,38 = 0 ; il busto arriva a 0,48 sul pallone */
  const lean  = 0.10 + 0.26*sca + 0.12*seg - 0.38*rit + 0.06*osc;
  /* somma: 0,030+0,010-0,040 = 0 : la testa segue la mano */
  const cen   = 0.030*sca + 0.010*seg - 0.040*rit;
  corpo(pelvY,0,lean,cen);
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* IL BRACCIO DESTRO VA AVANTI, IL SINISTRO INDIETRO, e questa e'
     tutta la posa: alla camera in pianta l'avanti e' orizzontale, e due
     mani in versi opposti sono la piu' larga sporgenza che una figura
     in piedi possa avere. Il sinistro esce dall'intervallo di braccio()
     dalla parte di sotto (a negativo = braccio dietro): lo fa gia'
     poseScivolata con -0,45, e la cinematica non ha un limite li'.
     somme: 1,25-0,35-0,90 = 0   e   -1,05+0,32+0,73 = 0 */
  const aR = 0.30 + 1.25*sca - 0.35*seg - 0.90*rit + 0.10*osc;
  const aL = 0.30 - 1.05*sca + 0.32*seg + 0.73*rit - 0.08*osc;
  /* GOMITI E APERTURA SI TARANO INSIEME, e la prima stesura sbagliava
     proprio qui: braccio() impone eMin = 0,12+0,29*|out/UA|, quindi un
     braccio APERTO non puo' avere il gomito teso. Con out a 0,16 il
     minimo e' 0,301 e il gomito destro scendeva a 0,16: il clamp
     riscriveva la posa 47 volte su 1.024 valutazioni, e il banco
     ?gabbia lo stampava come «respinta 47». Aperture riportate a 0,14 e
     0,15 (eMin 0,278 e 0,290) e gomiti fermati a 0,31 e 0,36: zero.
     somme: -0,16+0,06+0,10 = 0   e   -0,14+0,05+0,09 = 0 */
  const eR = 0.50 - 0.16*sca + 0.06*seg + 0.10*rit - 0.03*imp;
  const eL = 0.50 - 0.14*sca + 0.05*seg + 0.09*rit;
  /* out massimo 0,14 e 0,15, la gabbia e' 0,222.
     somme: 0,08-0,03-0,05 = 0   e   0,09-0,03-0,06 = 0 */
  const outR = 0.06 + 0.08*sca - 0.03*seg - 0.05*rit;
  const outL = 0.06 + 0.09*sca - 0.03*seg - 0.06*rit;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, outR, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, outL,-1);
  const hz=0.06*sl;
  /* somme: 0,66-0,20-0,46 = 0  |  -0,06+0,02+0,04 = 0
           -0,46+0,14+0,32 = 0  |  -0,02+0,01+0,01 = 0  |  0,07-0,02-0,05 = 0 */
  const aGd =  0.14 + 0.66*sca - 0.20*seg - 0.46*rit;
  const kGd =  0.36 - 0.06*sca + 0.02*seg + 0.04*rit;
  const aGs = -0.06 - 0.46*sca + 0.14*seg + 0.32*rit;
  const kGs =  0.30 - 0.02*sca + 0.01*seg + 0.01*rit;
  const apr =  0.05 + 0.07*sca - 0.02*seg - 0.05*rit;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, hz, aGd,kGd,  HIPW+apr);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, hz, aGs,kGs, -HIPW-apr);
}
/* SFUGGE: ci ha provato con le mani e non l'ha tenuta. E' l'unico dei
   quattro esiti che e' un FALLIMENTO, e il corpo deve dirlo.
   0,02-0,18 TENTATIVO le mani si chiudono davanti, strette (out 0,02)
   0,18      IL PALLONE PASSA
   0,18-0,44 CEDIMENTO le mani si aprono a vuoto e cadono, il busto si
                       piega avanti fino a 0,78 rad, la testa scende
   0,56-0,97 RIENTRO
   La CIMA della figura CALA: con il busto a 0,78 e il bacino a 0,74 la
   testa scende da 1,64 a circa 1,30 m. E' l'unica posa in piedi che lo
   fa, e non tocca l'invariante della sonda dell'erba di collaudo.js —
   quella protegge dalle teste che SALGONO. */
function poseSfugge(u){
  const ten = sm(u,0.02,0.18);
  const ced = sm(u,0.18,0.44);
  const rit = sm(u,0.56,0.97);
  const di=(u-0.18)/0.03, imp=Math.exp(-di*di);
  const p=u-0.18, osc = p>0 ? Math.sin(p*8)*Math.exp(-4.5*p) : 0;
  /* somma: -0,10-0,06+0,16 = 0  ->  0,90 ; minimo 0,74 */
  const pelvY = 0.90 - 0.10*ten - 0.06*ced + 0.16*rit - 0.02*imp;
  /* somma: 0,30+0,40-0,70 = 0 ; il busto si piega fino a 0,78 */
  const lean  = 0.08 + 0.30*ten + 0.40*ced - 0.70*rit + 0.07*osc;
  /* somma: 0,035+0,030-0,065 = 0 : la testa insegue il pallone in giu' */
  const cen   = 0.035*ten + 0.030*ced - 0.065*rit;
  corpo(pelvY,0,lean,cen);
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* le mani si chiudono a vuoto (out 0,02) e poi si APRONO cadendo
     (out 0,16): e' il gesto di chi ha appena perso qualcosa.
     somme: 1,05-0,55-0,50 = 0   e   0,92-0,44-0,48 = 0 */
  const aR = 0.30 + 1.05*ten - 0.55*ced - 0.50*rit + 0.08*osc;
  const aL = 0.30 + 0.92*ten - 0.44*ced - 0.48*rit + 0.06*osc;
  /* somme: 0,42-0,20-0,22 = 0   e   0,30-0,12-0,18 = 0 */
  const eR = 0.50 + 0.42*ten - 0.20*ced - 0.22*rit;
  const eL = 0.50 + 0.30*ten - 0.12*ced - 0.18*rit;
  /* somme: -0,03+0,14-0,11 = 0   e   -0,03+0,11-0,08 = 0 ; massimo 0,16 */
  const outR = 0.05 - 0.03*ten + 0.14*ced - 0.11*rit;
  const outL = 0.05 - 0.03*ten + 0.11*ced - 0.08*rit;
  braccio(SHR,ELR,HAR,  SHW, shY, shZ, aR,eR, outR, 1);
  braccio(SHL,ELL,HAL, -SHW, shY, shZ, aL,eL, outL,-1);
  const hz=0.06*sl;
  /* la mezza inciampata: il piede destro esce avanti, le ginocchia
     cedono.  somme: 0,30+0,20-0,50 = 0  |  0,45+0,25-0,70 = 0
                    -0,12-0,10+0,22 = 0  |  0,55+0,30-0,85 = 0  |  0,05+0,03-0,08 = 0 */
  const aGd =  0.12 + 0.30*ten + 0.20*ced - 0.50*rit;
  const kGd =  0.30 + 0.45*ten + 0.25*ced - 0.70*rit;
  const aGs = -0.04 - 0.12*ten - 0.10*ced + 0.22*rit;
  const kGs =  0.30 + 0.55*ten + 0.30*ced - 0.85*rit;
  const apr =  0.04 + 0.05*ten + 0.03*ced - 0.08*rit;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, hz, aGd,kGd,  HIPW+apr);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, hz, aGs,kGs, -HIPW-apr);
}

/* =====================================================================
   ATTESA DEL PORTIERE — la sagoma riservata al ruolo.`,
},

/* 2 — il registro delle clip */
{
  nome: '2/9 le tre clip entrano in Rig3D.CLIPS',
  cerca: `  presa:     {freq:0.55,pose:posePresa,     palla:pallaPresa},
  rinvio:    {freq:0.55,pose:poseRinvio,    palla:pallaRinvio},`,
  metti: `  presa:     {freq:0.55,pose:posePresa,     palla:pallaPresa},
  rinvio:    {freq:0.55,pose:poseRinvio,    palla:pallaRinvio},
  /* I TRE ESITI CHE NON PRENDONO. freq 1,0 come 'testa' e 'contrasto',
     e per la stessa ragione: in partita la fase e' st.u/freq, e con 1,0
     la fase disegnata E' quella che rigStato calcola — nessuna
     conversione da rifare a mente leggendo il ramo di p.gkMani.
     Nessuna delle tre porta la palla della clip: il pallone e' gia'
     partito quando la posa comincia, e disegnarne uno fermo nelle mani
     sarebbe la bugia che il ramo dei pugni si rifiutava di dire. */
  pugni:     {freq:1.0, pose:posePugni},
  respinta:  {freq:1.0, pose:poseRespinta},
  sfugge:    {freq:1.0, pose:poseSfugge},`,
},

/* 3 — la costante del cronometro, accanto alle altre dei quattro esiti */
{
  nome: '3/9 GK_MANI_T dichiarata accanto a GK_PUGNO_Z e GK_SFUGGE',
  cerca: `const GK_PUGNO_Z = 16;       // sopra questa quota la palla forte si smanaccia
const GK_SFUGGE  = 1.60;     // fin dove ci prova con le mani, in multipli della soglia`,
  metti: `const GK_PUGNO_Z = 16;       // sopra questa quota la palla forte si smanaccia
const GK_SFUGGE  = 1.60;     // fin dove ci prova con le mani, in multipli della soglia
/* QUANTO DURA IL GESTO DELLE MANI, ed e' un latch di solo disegno.
   0,34 s: la finestra piu' lunga che il portiere in piedi passa senza
   rimettersi a camminare — GK_SPEED e' 150 unita' al secondo, quindi in
   0,34 s percorre al massimo 51 unita' e i piedi della posa scivolano
   di meno di mezza figura. Con 0,50 il gesto restava acceso mentre il
   portiere rientrava sui pali e la posa diventava una statua che
   trasla; con 0,20 il seguito non si vedeva. */
const GK_MANI_T = 0.34;`,
},

/* 4 — i due campi nuovi, dichiarati fra i latch del rig */
{
  nome: '4/9 p.gkMani e p.gkManiT fra i latch del rig',
  cerca: `    chargeClip:null, kickClip:null, gkClip:'',
    frenaT:0, frenaAcc:0, fintaT:0, fintaCd:0, mesto:0, presaT:0, rinvT:0,`,
  metti: `    chargeClip:null, kickClip:null, gkClip:'',
    frenaT:0, frenaAcc:0, fintaT:0, fintaCd:0, mesto:0, presaT:0, rinvT:0,
    /* gkMani/gkManiT: quale dei tre esiti senza presa ha appena fatto
       il portiere IN PIEDI, e per quanto ancora si vede. Sono latch di
       solo disegno come presaT: la fisica non li legge mai. */
    gkMani:'', gkManiT:0,`,
},

/* 5 — l'azzeramento alla rimessa in campo */
{
  nome: '5/9 i due latch si azzerano con gli altri',
  cerca: `    p.mesto=0; p.frenaT=0; p.fintaT=0; p.presaT=0; p.rinvT=0;   // i latch del rig`,
  metti: `    p.mesto=0; p.frenaT=0; p.fintaT=0; p.presaT=0; p.rinvT=0;   // i latch del rig
    p.gkMani=''; p.gkManiT=0;                    // e le tre mani del portiere`,
},

/* 6 — il cronometro si consuma dove si consumano gli altri */
{
  nome: '6/9 gkManiT scorre insieme agli altri latch',
  cerca: `  if(p.presaT>0) p.presaT-=dt;
  if(p.rinvT>0) p.rinvT-=dt;`,
  metti: `  if(p.presaT>0) p.presaT-=dt;
  if(p.rinvT>0) p.rinvT-=dt;
  if(p.gkManiT>0) p.gkManiT-=dt;`,
},

/* 7 — PUGNI arma la sua posa, e il commento smette di dire che non c'e' */
{
  nome: '7/9 il ramo PUGNI arma la clip',
  cerca: `    b.vz = rnd(150,240);
    /* NIENTE CLIP NUOVA, e non e' pigrizia: p.presaT e' la presa alta,
       cioe' i guantoni sopra la testa CON il pallone fermo nelle mani
       (pallaPresa lo disegna mentre scende dentro le mani). Su un pugno
       il pallone se ne va, e mostrare la clip della presa sarebbe
       disegnare una bugia. Il gesto giusto e' da fare, non da riciclare.
       Con vz fra 150 e 240 e gravita' 560 il volo dura da 0,54 a 0,86 s
       e il pallone tocca terra fra 242 e 590 unita' dal portiere: fuori
       dall'area su tutte e tre le taglie (GK_AREA_X vale 118, 136, 153). */
    showBanner('PUGNI!','#39d3e6',0.85);`,
  metti: `    b.vz = rnd(150,240);
    /* LA CLIP ADESSO C'E', ed e' fatta e non riciclata: 'pugni', i due
       pugni che partono insieme avanti e in alto col bacino sulle punte.
       Riusare 'presa' sarebbe stato disegnare una bugia — p.presaT e' i
       guantoni sopra la testa CON il pallone fermo nelle mani, e
       pallaPresa lo disegna mentre ci scende dentro. Su un pugno il
       pallone se ne va.
       Con vz fra 150 e 240 e gravita' 560 il volo dura da 0,54 a 0,86 s
       e il pallone tocca terra fra 242 e 590 unita' dal portiere: fuori
       dall'area su tutte e tre le taglie (GK_AREA_X vale 118, 136, 153). */
    manoPortiere(p,'pugni');
    showBanner('PUGNI!','#39d3e6',0.85);`,
},

/* 8 — SFUGGE e RESPINTA armano le loro */
{
  nome: '8/9 i rami SFUGGE e RESPINTA armano le loro clip',
  cerca: `    b.vz = rnd(70,130);
    showBanner('SFUGGE!','#ffb020',0.85);`,
  metti: `    b.vz = rnd(70,130);
    manoPortiere(p,'sfugge');
    showBanner('SFUGGE!','#ffb020',0.85);`,
},
{
  nome: '8b/9 il ramo RESPINTA arma la sua clip',
  cerca: `    b.vz = rnd(40,110);
    showBanner('RESPINTA!','#39d3e6',0.85);`,
  metti: `    b.vz = rnd(40,110);
    manoPortiere(p,'respinta');
    showBanner('RESPINTA!','#39d3e6',0.85);`,
},

/* 9 — la funzione che arma, scritta accanto a tentaPresa che la usa */
{
  nome: '9a/9 manoPortiere: la guardia sta in un posto solo',
  cerca: `/* presa/respinta per contatto geometrico col corpo disteso */`,
  metti:
`/* =====================================================================
   MANO PORTIERE — arma la posa dei tre esiti che non prendono.

   LA GUARDIA, e sta QUI e non in tre posti perche' e' una sola regola:
   la posa si accende SOLO se il portiere e' IN PIEDI. tentaPresa la
   chiamano da tre luoghi — dal tuffo in volo (p.dive>0), dal corpo gia'
   a terra (p.recover>0) e da fermo — e nei primi due il rig ha gia' il
   gesto giusto, che e' il tuffo stesso: sovrascriverlo con un uomo in
   piedi teletrasporterebbe un portiere disteso in verticale.
   E' la stessa guardia con cui il gioco arma gia' la presa alta
   («b.z>14 && p.dive<=0»): il gesto delle mani e' del portiere in piedi.

   Nel terzo caso invece il corpo non ha NIENTE da dire: il pallone
   riparte a 430-620 unita' al secondo e la figura resta quella
   dell'attesa o della corsa. E' la MINORANZA dei casi e va detto —
   misurato su 100 partite x 120 s a 5 contro 5 (seme 20260803): 195
   esiti che lasciano andare il pallone, 43 col portiere in piedi, di
   cui 16 ripartono subito in tuffo. Restano 27, e quei 27 erano
   'corsa' x15, 'camminata' x6, 'attesaGK' x6 — zero su ventisette con
   un corpo. E' la voce 13 del referto dell'onda animazione.

   Non pesca sorteggi, non tocca la fisica, non ha rami: due
   assegnazioni. */
function manoPortiere(p, quale){
  if(p.dive>0 || p.recover>0) return;
  p.gkMani=quale; p.gkManiT=GK_MANI_T;
}

/* presa/respinta per contatto geometrico col corpo disteso */`,
},
{
  nome: '9b/9 rigStato disegna le tre mani, DOPO tuffo, parata, raccolta e presa',
  cerca: `    if(p.presaT>0){ st.clip='presa';  st.u=0.32+0.43*(1-p.presaT/0.8); return st; }`,
  metti: `    if(p.presaT>0){ st.clip='presa';  st.u=0.32+0.43*(1-p.presaT/0.8); return st; }
    /* I TRE ESITI CHE NON PRENDONO — e stanno DOPO gli altri quattro
       rami di proposito. Il tuffo, la parata, la loro coda e la
       raccolta sono gesti del corpo intero e vengono prima; queste tre
       sono gesti delle sole mani e le arma manoPortiere solo quando il
       portiere e' in piedi, quindi qui non possono mai contendere.
       La fase parte gia' dentro il gesto — 0,24 per i pugni, 0,12 per
       la respinta, 0,10 per lo sfuggire — perche' in partita il pallone
       arriva e basta: la carica disegnata prima di quei valori serve al
       provino della sagoma e al giorno in cui il portiere avra' un
       anticipo, come per il colpo di testa. */
    if(p.gkManiT>0){
      const w = 1-clamp(p.gkManiT/GK_MANI_T,0,1);
      if(p.gkMani==='pugni'){    st.clip='pugni';    st.u=0.24+0.74*w; return st; }
      if(p.gkMani==='respinta'){ st.clip='respinta'; st.u=0.12+0.86*w; return st; }
      if(p.gkMani==='sfugge'){   st.clip='sfugge';   st.u=0.10+0.88*w; return st; }
    }`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-mani-portiere.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
if (dentro) { console.error('FALLITO: questa toppa non si applica --dentro. Usa --out fuori/<nome>.html'); process.exit(3); }
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.mani.html';
outFile = path.resolve(RADICE, outFile);
if (outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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

/* I CONTROLLI DOPO LA SOSTITUZIONE. Non sono decorazione: la regola di
   casa dice che quello che non sta nella stringa CERCATA non puo' stare
   nella MESSA, e il modo di accorgersene e' contare. */
const attesi = [
  ['function posePugni(u){', 1],
  ['function poseRespinta(u){', 1],
  ['function poseSfugge(u){', 1],
  ['function manoPortiere(p, quale){', 1],
  ['  pugni:     {freq:1.0, pose:posePugni},', 1],
  ['  respinta:  {freq:1.0, pose:poseRespinta},', 1],
  ['  sfugge:    {freq:1.0, pose:poseSfugge},', 1],
  ['const GK_MANI_T = 0.34;', 1],
  ['gkMani:\'\', gkManiT:0,', 1],
  ['if(p.gkManiT>0) p.gkManiT-=dt;', 1],
  ["manoPortiere(p,'pugni');", 1],
  ["manoPortiere(p,'sfugge');", 1],
  ["manoPortiere(p,'respinta');", 1],
  ['NIENTE CLIP NUOVA', 0],          // il commento falso e' sparito, non duplicato
  ['/* presa/respinta per contatto geometrico col corpo disteso */', 1],
  ['ATTESA DEL PORTIERE', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));

/* IL CONTO DEI SORTEGGI: la toppa non deve aggiungere ne' togliere una
   sola chiamata a rnd()/dado() nel corpo del gioco. Si contano le
   occorrenze nel file prima e dopo. */
const contaSorteggi = s => (s.match(/\brnd\s*\(/g) || []).length + (s.match(/\bdado\s*\(/g) || []).length;
const s0 = contaSorteggi(src), s1 = contaSorteggi(out);
if (s0 !== s1) rotti.push('sorteggi scritti nel file: prima ' + s0 + ', dopo ' + s1);

/* LE PARENTESI. La trappola costata un gioco morto all'apertura: un
   pezzo lasciato nella sostituzione e non compreso nella ricerca viene
   AGGIUNTO. Il bilancio di tonde/graffe del file deve restare pari. */
const bil = s => {
  let t = 0, g = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') t++; else if (c === ')') t--;
    else if (c === '{') g++; else if (c === '}') g--;
  }
  return t + '/' + g;
};
if (bil(src) !== bil(out)) rotti.push('bilancio parentesi tonde/graffe: prima ' + bil(src) + ', dopo ' + bil(out));

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
console.log('    sorteggi scritti nel file: ' + s0 + ' -> ' + s1 + '  (differenza 0)');
