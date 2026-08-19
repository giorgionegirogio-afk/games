/* =====================================================================
   _toppa-centro.js — LA CAMERA SMETTE DI CHIEDERE INQUADRATURE CHE LA
   PROIEZIONE RIFIUTA.

   uso:  node strumenti/_toppa-centro.js ingresso.html uscita.html
   Non tocca mai il file del repo: legge un ingresso, scrive un'uscita.
   Se anche UN SOLO ancoraggio non si trova esattamente una volta non
   scrive un byte, dice quale, ed esce con codice 1. Rifiuta anche un
   ingresso gia' toppato (le sostituzioni aggiungono e non tolgono,
   quindi la sola prova d'unicita' lascerebbe passare un doppio innesto).

   =====================================================================
   DA DOVE VIENE. La misura 7 di strumenti/istantanea.js — «centro
   pieno», tetto 40% di erba vuota sul TERZO CENTRALE — e' rossa cinque
   volte su otto (43,8 · 62,5 · 68,8 · 71,9 · 75,0). Prima di scrivere
   una riga si e' chiesto PERCHE', con una sonda che rifa' gli stessi
   otto istanti (seme 20260728, 915x412@2) e misura la GEOMETRIA invece
   dei pixel: dove punta la camera, quanto e' largo il campo visivo,
   dove stanno i corpi a schermo, cosa riempie le celle non vuote.
   Quello che ne e' uscito e' scritto qui sotto per intero, perche' due
   terzi di questa toppa sono le cose che NON si sono fatte.

   ---------------------------------------------------------------------
   IL DIFETTO CHE QUESTA TOPPA RIPARA — IL CLAMP DI PROIEZIONE SCAVALCA
   IL PUNTO 6-TER, E NESSUNO LO SAPEVA.

   Il punto 6-ter di updateCamera dichiara «la palla nel terzo centrale,
   SEMPRE» e lo ottiene limitando G.cam a b.x +- VW/6/S2. Ma in fondo a
   render() c'e' un SECONDO limite che non e' sulla camera, e' sulla
   PROIEZIONE: l'inquadratura non esce piu' di OUT_MARG (62 unita')
   oltre le linee. Quando la camera chiede di andare oltre, il quadro
   non la segue — e siccome nessuno dei due sa dell'altro, il 6-ter
   viene disfatto in silenzio. Misurato sugli otto istanti del banco:

     istante  cam.x chiesta  cam.x mostrata  scarto   palla, % di larghezza
        2         865,3          802,2       -63,1      55,1   dentro
        3         844,0          801,3       -42,7      38,5   dentro
        4         826,1          803,0       -23,1      36,2   dentro
        5        1016,2          841,3      -174,9      80,9   FUORI
        7         967,4          858,4      -109,0      68,9   FUORI

   Quattro istanti su otto con la camera fuori posto fino a 175 unita'
   di campo, e in due il pallone finisce nel terzo ESTERNO nonostante il
   6-ter. Sull'asse verticale il clamp non morde mai (0,0 su otto).
   E non e' solo composizione: quelle unita' sono CORSA MORTA. La molla
   del punto 4 insegue un bersaglio che la proiezione rifiutera', la
   camera ci si siede sopra, e quando l'azione torna indietro il quadro
   resta fermo finche' la camera non ha ripercorso il fantasma — 175
   unita' a 1250 unita' al secondo sono 0,14 s di immagine immobile.
   Questo file lo aveva gia' scritto, due paragrafi sopra il punto in
   cui si ripara: «un bersaglio irraggiungibile e' un attrito». Il
   bersaglio si limitava con la garanzia dei 56 px e col terzo centrale;
   non con la finestra che la proiezione concede davvero.

   ---------------------------------------------------------------------
   QUELLO CHE QUESTA TOPPA NON FA, E PERCHE' — IL CANCELLO NON SI VINCE
   CON LA REGIA, E LA PROVA E' UNA SPAZZATA.

   Si e' spenta updateCamera, si e' messa la camera a mano in venti
   posizioni per istante e si e' ridisegnato col renderer VERO (stesso
   clamp di proiezione, stesse figure, stessa ora), misurando ogni volta
   il terzo centrale. Media sugli otto istanti:

     inquadratura                  centro%   corpi che   pixel di corpo   rossi
                                             toccano     nel terzo         >40%
     OGGI (camera vera)             49,6        1,5          13,7%         5/8
     bersaglio sulla palla          48,0        1,9          16,3%         5/8
     baricentro palla+2 vicini      47,3        2,8          27,9%         5/8
     baricentro palla+3 vicini      42,6        2,4          30,9%         5/8
     dentro il 6-ter, sui corpi     45,3        2,8          32,6%         5/8
     SOFFITTO, camera libera z=1,0  37,9        2,8          33,9%         4/8
     SOFFITTO, camera libera z=1,8  19,9        1,8          42,7%         1/8
     SOFFITTO, camera libera z=2,2  14,8        2,0          65,7%         1/8

   Nessuna inquadratura che tenga il pallone in quadro scende sotto 4
   rossi su 8, e le due che scendono a 1 abbandonano il pallone (palla
   nel terzo centrale: 0,0%) e vincono ingrandendo la TESSITURA del
   manto, non mettendoci dentro dei corpi. La ragione e' aritmetica: il
   terzo centrale sono 32 celle da 38x34 px CSS; per stare sotto il 40%
   ne servono almeno 19,2 non vuote, e una figura alta 46 px ne rompe
   fra due e quattro. Diciannove celle vogliono sei o sette uomini
   DENTRO un riquadro di 273x123 unita' di campo: in un cinque contro
   cinque non succede, e una regia che lo forzasse non sarebbe piu' una
   regia.

   ---------------------------------------------------------------------
   DUE MANOVRE PROVATE, MISURATE E SCARTATE. Restano scritte perche' chi
   tornera' qui non le rifaccia.

   1. IL 30% DEL BERSAGLIO DALLA ROSA AL DUELLO. Il bersaglio del pan e'
      0,70 x (palla anticipata) + 0,30 x (media di TUTTI i giocatori),
      e la media di dieci uomini schierati cade fra le linee — misurata
      a schermo, al 25-69% della larghezza e al 9-88% dell'altezza,
      quasi sempre fuori dalla banda centrale. Sostituendola col
      baricentro del duello la spazzata prometteva 47,3% e 2,8 corpi.
      MISURATO SUL GIOCO: 52,0% (peggio di 49,6), corpi 1,5 -> 1,4.
      Il perche' e' a due righe di distanza: l'appoggio al muro del
      punto 3-bis fa tx=Math.max(tx,txB), cioe' mette un PAVIMENTO verso
      la sponda, e quando il muro e' raggiungibile il bersaglio del
      punto 1 non conta piu' niente. Cambiare il 30% senza toccare
      l'appoggio e' cambiare un addendo che viene poi scartato.
   2. L'APPOGGIO CEDE AL DUELLO (il bersaglio non si spinge verso il
      muro oltre il punto in cui i DUE piu' vicini al pallone escono dal
      terzo centrale). Questa funziona, e nella direzione giusta:
        corpi che toccano il terzo centrale   12 -> 21  su otto istanti
        pixel di corpo nel terzo centrale   13,7% -> 25,9%
        erba vuota del terzo centrale       49,6% -> 49,6%  (identica)
        istanti rossi                          5/8 -> 6/8
        palla nel terzo centrale             73,9% -> 62,1%
      Il terzo centrale si riempie DI CORPI — quasi il doppio — e il
      numero non si muove di un decimo, anzi un istante cambia colore in
      peggio e il pallone esce piu' spesso. E' la prova piu' netta che
      la misura 7 non sta contando i corpi: sta contando celle di manto,
      e i corpi non bastano a romperne diciannove. Pagare un rosso e
      undici punti di pallone per un numero che non si muove e' lo
      scambio che questa cartella respinge da quindici volte.

   ---------------------------------------------------------------------
   E UN DIFETTO DEL METRO, TROVATO STRADA FACENDO E NON RIPARATO QUI
   perche' non e' roba di questo file: L'ISTANTE 8, IL 6,3%, E' UN VERDE
   FALSO. E' il fotogramma che istantanea.js chiama «quello che regge da
   manifesto». Ritagliato e misurato, il suo terzo centrale e' prato
   deserto con un pallone e mezzo giocatore sul bordo basso; passa
   perche' la tinta MEDIANA di quel ritaglio e' 89 gradi contro un
   hueMin di 90, e il 51,2% dei suoi pixel cade fuori dalla famiglia
   prato per la sola TINTA (fuori per saturazione: 0,6%; per luminanza:
   0,6%). E' la pozza dei fari che vira il manto all'ambra. Gli altri
   due verdi sono della stessa specie: nell'istante 1, delle 21 celle
   non vuote solo 3 hanno un corpo dentro e 16 sono chiazze di terra
   battuta; nell'istante 6, 5 su 21. Il cancello oggi si compra con le
   chiazze, le righe, le ombre e l'ambra dei fari — non con l'azione.
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------
   1. LA FINESTRA CHE LA PROIEZIONE CONCEDE, SCRITTA UNA VOLTA SOLA.
   ------------------------------------------------------------------ */
cambio('1. finestraQuadro(): l\'inverso del clamp di proiezione di render()',
`const OUT_MARG=62;`,
`const OUT_MARG=62;
/* =====================================================================
   FINESTRA DEL QUADRO — fin dove la PROIEZIONE segue la camera.

   In fondo a render() l'inquadratura viene limitata a OUT_MARG unita'
   oltre ciascuna linea: e' quel limite, e solo quello, che rende sicure
   la barra alta e la fascia bassa. Ma e' un limite sulla PROIEZIONE, non
   sulla camera, e updateCamera non lo conosceva: chiedeva inquadrature
   che render() poi rifiutava, fino a 175 unita' di campo di scarto
   misurate sul freeze-frame test (istante 5: camera chiesta a 1016,2,
   mostrata a 841,3). Le conseguenze erano due, e tutt'e due invisibili
   da dentro:
     · il punto 6-ter — «la palla nel terzo centrale, SEMPRE» — veniva
       disfatto dalla proiezione in due istanti su otto: pallone all'81%
       e al 69% della larghezza, cioe' nel terzo ESTERNO;
     · la molla del punto 4 inseguiva un bersaglio irraggiungibile e la
       camera ci si sedeva sopra. Quelle unita' di scarto sono CORSA
       MORTA: quando l'azione torna indietro il quadro resta fermo
       finche' la camera non ha ripercorso il fantasma.
   Questa funzione e' l'inverso ESATTO di quel clamp, in coordinate di
   camera, cosi' che bersaglio e limiti possano tenerne conto prima
   invece di scoprirlo dopo. Una copia sola: il giorno che OUT_MARG o le
   fasce cambiano non ci sono due verita'.
   Il caso degenere e' quello di render(): se il mondo e' piu' stretto
   del quadro render() CENTRA — e centrare vuol dire camera in mezzo al
   campo, che e' quello che si restituisce invece di un intervallo vuoto.
   ===================================================================== */
function finestraQuadro(S2v){
  const pieno = (G.scene==='goal') || !!G.moviola || G.scene==='menu';
  const m = (G.scene==='goal') ? (GOAL_D+30)
          : ((G.scene==='menu'||G.scene==='end')
             ? Math.max(OUT_MARG, Math.min(88, Math.min(PADX,PADY)-8))
             : OUT_MARG);
  const cy0 = pieno?VH/2:PA_CY, yTop = pieno?0:PA_Y0, yBot = pieno?VH:PA_Y1;
  let x0 = VW/(2*S2v)-m,     x1 = FW+m-VW/(2*S2v);
  let y0 = (cy0-yTop)/S2v-m, y1 = FH+m-(yBot-cy0)/S2v;
  if(x0>x1){ x0=x1=FW/2; }
  if(y0>y1){ y0=y1=FH/2; }
  return {x0,x1,y0,y1};
}`);

/* ------------------------------------------------------------------
   2. IL BERSAGLIO NON CHIEDE PIU' QUELLO CHE LA PROIEZIONE RIFIUTA.
   ------------------------------------------------------------------ */
cambio('2. il bersaglio dell\'appoggio si ferma alla finestra del quadro',
`    tx=clamp(tx, b.x-lxn, b.x+lxn);
    ty=clamp(ty, b.y-lySn, b.y+lyGn);`,
`    tx=clamp(tx, b.x-lxn, b.x+lxn);
    ty=clamp(ty, b.y-lySn, b.y+lyGn);
    /* E NEMMENO OLTRE IL MONDO DIPINTO. Sopra c'e' scritto, e con
       ragione, che «un bersaglio irraggiungibile e' un attrito»: il
       bersaglio si fermava dove si ferma la camera per la garanzia dei
       56 px e per il terzo centrale, ma NON dove si ferma il QUADRO.
       L'appoggio punta a 90 unita' oltre la linea — cartellone,
       recinzione, prime file — mentre render() non lascia uscire
       l'inquadratura oltre OUT_MARG=62: la differenza e' un bersaglio
       che nessuno raggiungera' mai, e la molla ci spinge contro per
       tutta la partita. Misurato sul banco: camera chiesta a 1016,2 e
       mostrata a 841,3 — 175 unita' di corsa morta, col pallone spedito
       all'81% della larghezza, cioe' proprio quello che il 6-ter esiste
       per impedire. */
    { const w=finestraQuadro(S2n);
      tx=clamp(tx, w.x0, w.x1); ty=clamp(ty, w.y0, w.y1); }`);

/* ------------------------------------------------------------------
   3. E NEMMENO LA CAMERA: LA FINESTRA DEL QUADRO E' L'ULTIMA PAROLA.
   ------------------------------------------------------------------ */
cambio('3. la finestra del quadro chiude i clamp della camera',
`      const needG=pc.y+RIG_PIEDI+19+3-(VH-2-PA_CY)/S2f;
      if(G.cam.y<needG){
        G.cam.y=Math.min(needG, Math.min(b.y+lyGiu, b.y+lyT));
      }
    }
  }`,
`      const needG=pc.y+RIG_PIEDI+19+3-(VH-2-PA_CY)/S2f;
      if(G.cam.y<needG){
        G.cam.y=Math.min(needG, Math.min(b.y+lyGiu, b.y+lyT));
      }
    }
  }
  /* ====== 6-sexies. LA FINESTRA DEL QUADRO, E POI PIU' NIENTE ========
     Tutti i limiti qui sopra — garanzia dei 56 px, corpi del duello,
     bordo basso, terzo centrale, tabellone — lavorano su una camera che
     la PROIEZIONE puo' poi rifiutare: in fondo a render() l'inquadratura
     viene riportata dentro OUT_MARG unita' oltre le linee, e da li' in
     poi G.cam e' un numero che non corrisponde piu' a cio' che si vede.
     Misurato sul freeze-frame test: quattro istanti su otto con la
     camera fuori posto di 23-175 unita', e in due il pallone spinto nel
     terzo ESTERNO nonostante il 6-ter.
     Portare la camera dentro la finestra QUI non cambia un pixel del
     fotogramma corrente — la proiezione faceva gia' lo stesso taglio —
     ma cambia due cose che si vedono nei fotogrammi DOPO: la molla
     smette di inseguire un fantasma (niente corsa morta al ritorno
     dell'azione) e G.cam torna a dire la verita' a chiunque la legga.
     E' l'ULTIMO clamp, dopo il 6-ter, perche' e' l'unico che la
     proiezione applichera' comunque: metterlo prima vorrebbe dire
     lasciare che un altro lo scavalchi e ritrovarsi al punto di
     partenza. Dove la finestra e il terzo centrale non stanno insieme —
     pallone appiccicato alla linea di fondo, mondo dipinto finito —
     vince la finestra, e non e' una scelta: e' che oltre non c'e'
     niente da inquadrare, e il 6-ter faceva finta del contrario. */
  {
    const w=finestraQuadro(S2f);
    G.cam.x=clamp(G.cam.x, w.x0, w.x1);
    G.cam.y=clamp(G.cam.y, w.y0, w.y1);
  }`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) {
  console.error('uso: node strumenti/_toppa-centro.js ingresso.html uscita.html');
  process.exit(2);
}
if (!fs.existsSync(ing)) {
  console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing);
  process.exit(1);
}
let t = fs.readFileSync(ing, 'utf8');
/* GLI ANCORAGGI RESTANO UNICI ANCHE DOPO — le sostituzioni aggiungono e
   non tolgono — quindi la sola prova dell'unicita' lascerebbe passare una
   SECONDA applicazione, che raddoppierebbe ogni innesto in silenzio. */
if (t.includes('function finestraQuadro(')) {
  console.error('TOPPA NON APPLICATA — nessun byte scritto:\n  ' +
    'l\'ingresso contiene gia\' finestraQuadro(): la toppa e\' gia\' stata applicata a questo file');
  process.exit(1);
}
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve esattamente 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) {
  console.error('TOPPA NON APPLICATA — nessun byte scritto:\n  ' + guai.join('\n  '));
  process.exit(1);
}
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
