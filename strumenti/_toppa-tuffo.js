/* =====================================================================
   _toppa-tuffo.js — LA TOPPA DELLA CLIP `tuffo`, cerca/sostituisci.

   NON SCRIVE MAI DENTRO IL GIOCO. Legge CALCETTO-il-gioco.html (o il
   file dato con --da), sostituisce UNA cosa sola — il corpo della
   funzione poseTuffo — e scrive la copia altrove (--a). Se l'ancoraggio
   non compare ESATTAMENTE UNA VOLTA si ferma con codice 1 e non scrive
   niente: il file di gioco puo' cambiare sotto i piedi, e una toppa che
   applica "a meta'" e' peggio di una toppa che non applica.

   uso:
     node strumenti/_toppa-tuffo.js --a fuori/dopo.html
     node strumenti/_toppa-tuffo.js --da altro.html --a fuori/dopo.html
     node strumenti/_toppa-tuffo.js --dentro        (scrive nel gioco)

   ---------------------------------------------------------------------
   PERCHE'. Su 4.286 fotogrammi di `tuffo` in dieci partite l'imbardata
   mediana della figura rispetto alla camera e' 0,0985 di seno, con decile
   inferiore 0,019: il 64% dei fotogrammi sta entro DIECI gradi da 0 o da
   pi, il 78% entro venti. Il portiere si tuffa lungo la bocca della
   porta, la porta e' verticale sullo schermo, e la vista non ruota mai. A imbardata zero la mappa
   (quota, profondita') -> schermo ha rango uno: le due si sommano in
   q = y·cos42 + z·sin42 e non si possono piu' separare. La posa di prima
   spendeva quasi tutto il gesto sulla PROFONDITA' (dz 1,382 contro dy
   0,605), cioe' sull'asse che a imbardata zero non esiste piu' da solo.
   L'esito misurato: la figura in volo proietta un'asta verticale alta
   quanto un uomo in piedi, e la giuria non puo' nominarla.

   IL DIFETTO NON E' LA QUOTA, E' LA SIMMETRIA. Prima di scrivere una
   riga sono state misurate quattro strade su un banco di sagome (venti
   clip x dodici fasi x sedici imbardate; maschera a capsule ancorata al
   punto a terra; distanza 1-IoU). Il numero che conta e' la SIMMETRIA
   BILATERALE della sagoma proiettata — IoU della maschera con la propria
   immagine speculare attorno al baricentro — perche' e' l'unica
   proprieta' che sopravvive intatta a QUALUNQUE imbardata (il
   ribaltamento la specchia e basta):

                          sagoma a capsule    disegno VERO, imbardate
     clip                 a imbardata 0       pesate come in campo
     tuffo (prima)              0,940                0,647
     cielo                      0,962                0,698
     fermo (uno in piedi)       0,749                0,678
     parata                     0,733                0,674
     corsa                      0,707                0,501
     attesaGK                   0,440                0,540
     scivolata                  0,377                0,483
   La colonna di sinistra e' il banco di ricerca (capsule, imbardata 0);
   quella di destra e' Rig3D.disegna con la divisa vera, maschera alfa>24,
   pesata sull'istogramma misurato delle imbardate — la misura buona, che
   fa strumenti/_z-simmetria.js. Le due concordano sull'ORDINE, che e'
   quello che serviva per scegliere.

   Il tuffo di prima era la seconda posa PIU' SIMMETRICA del vocabolario,
   piu' simmetrica di un uomo in piedi. Un corpo in volo e' la cosa meno
   simmetrica che ci sia su un campo, e la simmetria bilaterale e' la
   firma di una figura ERETTA: e' per questo che la giuria vedeva un uomo
   in piedi con le braccia aperte.

   E LA QUOTA DA SOLA NON BASTA — misurato, non supposto:
     posa                                   dz     dy     dx    1-IoU col piu' simile
     prima                                1,382  0,605  0,982        0,630
     solo alzando la quota (rollio+gambe)  1,134  1,021  0,865        0,635   <- non muove
     solo aprendo il laterale              1,170  0,614  1,246        0,544
     QUESTA (laterale + quota + asimmetria) 1,151 0,810  1,253        0,581
   Alzare la sola dy da 0,605 a 1,021 lascia il numero dov'era (0,635
   contro 0,630) e per giunta manda un piede a -0,236 di quota, cioe'
   sottoterra. La ragione e' geometrica: a imbardata 0 la quota si SOMMA
   alla profondita' (q = y·cos42 + z·sin42) e a imbardata pi la
   SOTTRAE, quindi ogni diagonale nel piano (quota, profondita') e'
   altissima da un lato e schiacciata dall'altro. Il LATERALE no: |x| e'
   lo stesso ai due ribaltamenti, ed e' anche la scala piu' alta delle
   tre — hPx/(1,9·cos42) = 64,4 px al metro contro i 47,8 della quota.

   COSA CAMBIA, IN PRATICA.
     1. LE BRACCIA ESCONO DAL CONO, E NON FANNO LA STESSA COSA.
        `braccio()` converte lo scostamento laterale in un seno di
        abduzione col tetto a 1,05 rad, e sopra quel tetto TAGLIA.
        `braccioDir()` prende due versori e li normalizza, quindi
        l'abduzione la scrive la posa. Il braccio che va sulla palla
        resta stretto e SALE (abduzione atan(0,85) = 40 gradi, spalla a
        2,20 rad); quello che bilancia si APRE di lato e resta basso
        (atan(2,60) = 69 gradi, spalla a 0,55 rad). Una mano finisce in
        cima alla figura, l'altra al suo estremo laterale.
        I TAGLI DELLA CLIP PASSANO DA 41 A 0 sulle quattro corporature:
        prima la posa chiedeva out = 0,21 con AB_MAX·UA = 0,234 e il
        clamp lavorava a ogni fotogramma.
     2. LE GAMBE SI APRONO DI LATO E SONO SFALSATE. Non e' la "compasso"
        bocciata a suo tempo: quella allargava le gambe nel piano del
        VOLO, cioe' proprio sull'asse che a imbardata zero non si vede —
        un prezzo pagato per niente. Qui apre una gamba sola, sul
        LATERALE, da 0,105 a 0,625 m (seno 0,571 contro il tetto AP_MAX
        0,751, quindi zero tagli), mentre l'altra resta stretta a 0,015 e
        piegata al ginocchio.
     3. LE GAMBE PENZOLANO SOTTO IL BACINO invece di stare in linea col
        busto: e' il portiere appena staccato da terra, ed e' da qui che
        viene il guadagno di quota. Il coefficiente di distensione passa
        da 2,10 a 1,55.
     4. IL VOLO COMINCIA PRIMA (0,17-0,34 -> 0,15-0,31). `rigStato` mappa
        l'avanzamento del tuffo su u = 0,08+0,50·e, quindi con la rampa
        vecchia il primo quarto di ogni tuffo mostrava ancora un uomo
        accovacciato. Non prima di 0,15: sotto quel valore si sovrappone
        alla finestra della raccolta (u = 0,02+0,10·anticipo).

   L'ESITO MISURATO. Simmetria sul DISEGNO VERO, pesata sull'istogramma
   delle imbardate: 0,647 -> 0,509, cioe' -21,3%. La clip lascia la
   compagnia di `fermo` (0,678) e `parata` (0,674) ed entra in quella dei
   corpi in movimento — `corsa` 0,501, `scivolata` 0,483. Controllo: le
   altre otto clip di riferimento si muovono di 0,000, perche' la toppa
   non le tocca. Sul banco a capsule a imbardata 0 lo stesso salto vale
   0,940 -> 0,390.
   Estensioni: dy 0,605 -> 0,810 (+34%), dx 0,982 -> 1,253 (+28%),
   dz 1,382 -> 1,151 (-17%).

   COSA NON CAMBIA. La cima della testa passa da -33,695 a -32,318 unita'
   di schermo, cioe' SCENDE: la sonda dell'ERBA di collaudo.js incontra
   meno capelli di prima, non di piu' (il cancello di gabbia.js chiede
   >= -35,1). Nessun giunto sotto il manto (quota minima 0,0120 su tutte
   e quattro le corporature). Le ossa restano lunghe uguali (scarto
   massimo 0,00%). Nessun termine di questa posa entra nella fisica:
   `rigStato` la LEGGE e non la produce, quindi le parate avvengono con
   la stessa frequenza di prima — verificato con _eventi.js, non
   supposto.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const DA = path.resolve(arg('da', path.join(RADICE, 'CALCETTO-il-gioco.html')));
const DENTRO = process.argv.includes('--dentro');
const A = DENTRO ? DA : arg('a', '');

/* --------------------------------------------------------------------
   L'ANCORAGGIO. Due pezzi di testo, ciascuno dei quali deve comparire
   ESATTAMENTE UNA VOLTA: la prima riga della funzione (per sapere dove
   comincia) e la sua ultima riga (per sapere dove finisce). Non si usa
   un conteggio di parentesi: se il file cambia, meglio non trovare
   l'ancora che trovarne una sbagliata.
   -------------------------------------------------------------------- */
const APRE = 'function poseTuffo(u){';
const CHIUDE = `  if(slitta>0){ const dz2=0.34*slitta; for(let j=0;j<NJ;j++) P[j*3+2]+=dz2; }
}`;

const NUOVA = `function poseTuffo(u){
  const ca=sm(u,0.02,0.13);              // caricamento sulle gambe
  const sp=sm(u,0.13,0.21);              // SPINTA: il bacino sale
  const est=sm(u,0.13,0.30);             // le gambe si staccano da terra
  const vol=sm(u,0.15,0.31);             // volo: il busto si stende
  const cad=sm(u,0.44,0.58);             // discesa fino al fianco
  const ri=sm(u,0.74,0.96);              // rialzata
  const rac=sm(u,0.72,0.84)*(1-sm(u,0.86,0.98));   // il piede sotto
  const dd=(u-0.40)/0.05, imp=Math.exp(-dd*dd);    // deviazione all'apice
  const db=(u-0.58)/0.05, botta=Math.exp(-db*db);  // la botta a terra
  const p=u-0.58, osc=p>0?Math.sin(p*9)*Math.exp(-5*p):0;  // assestamento
  const slitta=sm(u,0.56,0.72)*(1-sm(u,0.80,0.97));        // scivolamento
  /* IL TUFFO SALE DA TERRA: la spinta porta il bacino a 1,20 m invece
     che a 1,05 (0,47 -> 0,62), e il termine di caduta cresce di
     altrettanto (0,78 -> 0,93) cosi' l'atterraggio sul fianco resta
     esattamente dov'era. Non di piu': a +0,35 m la cima della testa
     saliva a -37,8 unita' di schermo contro il riferimento -34,6 di
     gabbia.js, e la sonda dell'erba di collaudo.js avrebbe cominciato a
     misurare capelli. */
  const pelvY=0.88-0.30*ca+0.62*sp-0.93*cad+0.61*ri-0.04*botta+0.02*osc;
  const lean=0.12+0.18*ca+1.36*vol+0.05*imp-1.54*ri+0.10*osc;
  corpo(pelvY,0,lean,0);
  const sl=Math.sin(lean), cl=Math.cos(lean);
  const shY=pelvY+0.44*cl, shZ=0.44*sl;
  /* =================================================================
     IL GESTO SI SPOSTA SULL'ASSE CHE SOPRAVVIVE.
     Misura, su 4.286 fotogrammi di questa clip in dieci partite: il
     seno dell'imbardata ha mediana 0,0985 e il 78% dei fotogrammi sta a
     meno di venti gradi da 0 o da pi (il 64% entro dieci). A quelle imbardate la coppia
     (quota, profondita') collassa su una sola direzione di schermo,
     q = y·cos42 + z·sin42, e un corpo disteso in avanti da' la stessa
     asta verticale di un uomo in piedi. Il LATERALE invece esce intero,
     e per giunta alla scala piu' alta delle tre: hPx/(1,9·cos42) contro
     hPx/1,9 della quota, cioe' 64,4 contro 47,8 px al metro.
     Misurato sul banco delle sagome (venti clip x dodici fasi x sedici
     imbardate, distanza 1-IoU sulla maschera ancorata al punto a terra):
       posa di prima                          IoU col piu' simile 0,630
       solo alzando la quota (dy 0,605->1,021)                   0,635
       aprendo il laterale (dx 0,982->1,246)                     0,544
       questa posa (dx 1,253, dy 0,810, dz 1,151)                0,581
     Alzare la sola quota NON muove il numero: e' la misura che ha
     scelto il laterale, non il gusto.
     ================================================================= */
  /* LE BRACCIA ESCONO DAL CONO DI braccio(), E NON FANNO LA STESSA COSA.
     Li' lo scostamento laterale diventa un seno di abduzione col tetto
     AB_MAX = sin(1,05) e sopra quel tetto la scatola TAGLIA invece di
     aprire: la posa chiedeva out = 0,21 contro un massimo di 0,234, e i
     tagli di questa clip erano 41 sulle quattro corporature. braccioDir
     prende due versori e li normalizza, quindi le ossa misurano UA e FA
     esatti e l'abduzione la scrive la posa — qui W e' la sua tangente.
     DESTRO, quello che va sulla palla: stretto (atan 0,85 = 40 gradi) e
       ALTO (spalla a 2,20 rad, gomito quasi teso). La mano diventa il
       punto piu' in alto della figura, e la quota non si perde mai.
     SINISTRO, quello che bilancia: APERTO (atan 2,60 = 69 gradi) e
       basso (spalla a 0,55 rad). La mano diventa il punto piu' esterno,
       e il laterale a imbardata zero e' a scala piena.
     E' la cura vera del giudizio di allora — «le mani non dicono di
     stare andando VERSO qualcosa» — che era stato risolto con 0,13 rad
     di scarto fra i due bracci: troppo poco per vedersi a 90 px. */
  /* +0,15*osc: l'assestamento smorzato dopo la botta a terra. C'era
     nella posa di prima (su tutt'e due le braccia, perche' la sinistra
     era scritta a partire dalla destra) e resta: e' il SEGUITO, e non
     c'entra niente col difetto. Vale zero prima di u=0,58, quindi non
     tocca il volo. */
  const aBR=0.45-1.05*ca+2.20*vol+0.12*imp-0.55*cad-0.60*ri+0.15*osc;
  const aBL=0.45-1.05*ca+0.10*vol+0.12*imp-0.55*cad+1.50*ri+0.15*osc;
  const eBR=0.45+0.40*ca-0.35*vol+0.55*cad-0.60*ri;
  const eBL=0.45+0.40*ca+0.30*vol+0.55*cad-1.25*ri;
  const WR =0.22+0.63*vol-0.63*ri;   // il braccio che sale resta stretto
  const WFR=0.12+0.63*vol-0.63*ri;
  const WL =0.22+2.38*vol-2.38*ri;   // quello che bilancia si apre di lato
  const WFL=0.12+2.58*vol-2.58*ri;
  /* I COEFFICIENTI DI RIENTRO (quelli sul termine ri) NON SONO SCELTI,
     SONO RISOLTI. A fine clip ogni curva deve tornare al valore di partenza,
     altrimenti il portiere finisce la rialzata con un braccio ancora per
     aria e alla riga dopo scatta in attesaGK. La condizione e' che la
     somma dei termini non costanti si annulli con ca=vol=cad=ri=1:
       aBR  -1,05 +2,20 -0,55 -X = 0  ->  X = 0,60
       aBL  -1,05 +0,10 -0,55 +X = 0  ->  X = 1,50
       eBR  +0,40 -0,35 +0,55 -X = 0  ->  X = 0,60
       eBL  +0,40 +0,30 +0,55 -X = 0  ->  X = 1,25
       aR   +0,33 -1,55 +0,85 +X = 0  ->  X = 0,37
       kR   +1,15 -1,35 +0,15 +X = 0  ->  X = 0,05
     Verificato a valle e non solo a monte: lo scarto massimo di un
     giunto fra u=0 e u=0,999 vale 0,0084 m, contro gli 0,0631 m della
     posa di prima (in tutt'e due i casi e' l'oscillazione d'assestamento
     che non si e' ancora spenta, non un errore di foglio).
     Il ciclo si chiude MEGLIO di come si chiudeva. */
  const bR=aBR+eBR, bL=aBL+eBL;
  braccioDir(SHR,ELR,HAR,  SHW, shY, shZ,
             WR,  -Math.cos(aBR), Math.sin(aBR),
             WFR, -Math.cos(bR),  Math.sin(bR));
  braccioDir(SHL,ELL,HAL, -SHW, shY, shZ,
             -WL,  -Math.cos(aBL), Math.sin(aBL),
             -WFL, -Math.cos(bL),  Math.sin(bL));
  const hz=0.06*sl;
  /* LE GAMBE SI APRONO DI LATO, SFALSATE, E PENZOLANO SOTTO IL BACINO.
     (a) L'APERTURA E' LATERALE E DI UNA GAMBA SOLA. La "compasso"
         bocciata a suo tempo allargava le gambe lungo la profondita',
         cioe' proprio sull'asse che a imbardata zero non si vede: era
         un prezzo pagato per niente. E aprirle tutt'e due allo stesso
         modo rifarebbe la simmetria, che e' il difetto. Qui la destra
         apre da 0,105 a 0,625 m sul laterale (seno 0,571 contro il
         tetto AP_MAX 0,751, quindi zero tagli) e la sinistra resta a
         0,015 e piegata al ginocchio.
     (b) I PIEDI STANNO SOTTO. Il coefficiente di distensione scende da
         2,10 a 1,55: le gambe non sono piu' in linea col busto ma
         penzolano dietro e sotto, che e' come sta un portiere appena
         staccato da terra, ed e' da qui che viene il guadagno di quota
         (dy 0,605 -> 0,810). */
  const apR=HIPW+0.52*vol-0.52*ri;
  const apL=HIPW-0.09*vol+0.09*ri;
  const aR=0.22+0.33*ca-1.55*est+0.85*cad+0.35*rac+0.37*ri;
  const aL=aR+0.72*vol-0.72*ri;
  const kR=0.40+1.15*ca-1.35*est+0.15*cad+0.90*rac+0.05*ri+0.20*botta;
  const kL=kR+0.15*cad-0.15*ri+0.95*vol-0.95*ri;
  gamba(HIPR,KNR,FTR,TOR,  HIPW, pelvY, hz, aR,kR,  apR);
  gamba(HIPL,KNL,FTL,TOL, -HIPW, pelvY, hz, aL,kL, -apL);
  // lo scivolamento sul fianco: tutto il corpo avanza, poi rientra
  if(slitta>0){ const dz2=0.34*slitta; for(let j=0;j<NJ;j++) P[j*3+2]+=dz2; }
}`;

/* ------------------------------------------------------------------ */
if (!A) { console.error('FALLITO: manca --a <destinazione> (o --dentro).'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }

const src = fs.readFileSync(DA, 'utf8');

const nApre = src.split(APRE).length - 1;
if (nApre !== 1) {
  console.error('FALLITO: l\'ancoraggio d\'apertura compare ' + nApre + ' volte, non 1. Non scrivo niente.');
  console.error('  ancora: ' + APRE);
  process.exit(1);
}
const i0 = src.indexOf(APRE);
const iC = src.indexOf(CHIUDE, i0);
const nChiude = src.split(CHIUDE).length - 1;
if (iC < 0 || nChiude !== 1) {
  console.error('FALLITO: l\'ancoraggio di chiusura compare ' + nChiude + ' volte, non 1 (o non segue l\'apertura). Non scrivo niente.');
  process.exit(1);
}
const i1 = iC + CHIUDE.length;

const vecchia = src.slice(i0, i1);
/* CONTROLLO DI IDENTITA': la funzione che sto sostituendo deve essere
   QUELLA misurata, non una qualunque che comincia allo stesso modo. Se
   qualcuno l'ha gia' toccata — o se la toppa e' gia' stata applicata —
   ci si ferma.
   L'IMPRONTA E' UNA RIGA CHE ESISTE SOLO NELLA POSA VECCHIA: il
   coefficiente 2,55 del braccio in volo, che nella posa nuova diventa
   2,20. La prima stesura usava la riga del bacino, che la toppa NON
   cambia: il controllo passava anche su un file gia' toppato, cioe' era
   cieco proprio nel caso per cui esiste. Provato, visto fallire,
   cambiato. */
const IMPRONTA = 'const aBR=0.45-1.05*ca+2.55*vol+0.12*imp-0.55*cad-0.95*ri+0.15*osc;';
if (vecchia.split(IMPRONTA).length - 1 !== 1) {
  console.error('FALLITO: la poseTuffo trovata non e\' quella misurata. Manca l\'impronta\n  ' +
    IMPRONTA + '\n  (o e\' gia\' toppata, o l\'ha cambiata qualcun altro). Non scrivo niente.');
  process.exit(1);
}
if (vecchia.length < 4000 || vecchia.length > 12000) {
  console.error('FALLITO: la poseTuffo trovata e\' lunga ' + vecchia.length + ' byte, fuori dall\'intervallo atteso. Non scrivo niente.');
  process.exit(1);
}

const out = src.slice(0, i0) + NUOVA + src.slice(i1);
const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log('toppa applicata: poseTuffo sostituita (' + vecchia.length + ' -> ' + NUOVA.length + ' byte)');
console.log('  da:   ' + DA);
console.log('  a:    ' + dest);
console.log('  delta di file: ' + (out.length - src.length) + ' byte');
