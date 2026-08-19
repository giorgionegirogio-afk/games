/* =====================================================================
   _toppa-centro2.js — L'APPOGGIO AL MURO CEDE AL DUELLO.

   uso:  node strumenti/_toppa-centro2.js ingresso.html uscita.html
   Non tocca mai il file del repo: legge un ingresso, scrive un'uscita.
   Se anche UN SOLO ancoraggio non si trova esattamente una volta non
   scrive un byte, dice quale, ed esce con codice 1. Rifiuta anche un
   ingresso gia' toppato, perche' le sostituzioni AGGIUNGONO e non
   tolgono: la sola prova d'unicita' lascerebbe passare un doppio
   innesto in silenzio.

   =====================================================================
   CHE COSA FA, IN UNA RIGA. Il punto 3-bis di updateCamera spinge il
   bersaglio della camera verso il muro — sponda e testata, 90 unita'
   oltre la linea — per comprare cartelloni, recinzione e prime file di
   pubblico. Questa toppa mette a quella spinta UN SOLO limite nuovo: non
   si spinge oltre il punto in cui i DUE piu' vicini al pallone escono
   dal terzo centrale del quadro. La merce si compra ancora, ma non col
   duello.

   E' UN TETTO SULLA SPINTA, MAI UNA SPINTA IN PIU'. La differenza
   sembra pedante e non lo e': una versione che «portasse» il bersaglio
   sui duellanti spingerebbe la camera VIA dal pallone quando i due
   corrono verso la fascia, ed e' esattamente cosi' che una manovra
   dello stesso nome, provata prima di questa, pagava undici punti di
   pallone nel terzo centrale (73,9% -> 62,1%). Qui il tetto puo' solo
   ACCORCIARE l'appoggio, cioe' lasciare la camera piu' vicina al
   bersaglio del punto 1 — che e' il pallone. Il pallone quindi non si
   perde: si guadagna.

   ---------------------------------------------------------------------
   PERCHE' ESISTE. Il rilievo del giudice — «dove cade l'occhio, il terzo
   centrale del quadro, il prato e' vuoto» — era vero, e la misura 7 di
   strumenti/istantanea.js lo contava male: contava CELLE DI MANTO VUOTO,
   che si comprano con le chiazze di terra battuta, le righe di gesso, le
   ombre lunghe e l'ambra dei fari. Riparata la misura (adesso conta i
   SOGGETTI: i corpi dalla silhouette vera e il disco del pallone),
   questa manovra si e' potuta finalmente giudicare per quello che fa.

   IL CONTO, sugli stessi otto istanti del banco (seme 20260728,
   915x412@2), gioco md5 662e1087 congelato per la prova:

                                          oggi    con la toppa
     celle abitate del terzo centrale       27         40      +48%
     di cui con un CORPO dentro             17         31      +82%
     figure che toccano il riquadro         12         19      +58%
     pixel di corpo nel terzo centrale   14,60%     23,75%     +63%
     pallone nel terzo centrale             6/8        6/8      =
     cancello 7 (centro abitato)            4/8        6/8      +2

   Su 696 fotogrammi di partita vera (uno ogni sei, ottanta secondi,
   sola geometria, nessun pixel):
                                          oggi    con la toppa
     figure nel terzo centrale, media      2,32       2,60
     almeno due figure                    76,3%      88,1%
     almeno tre figure                    45,8%      55,6%
     PALLONE nel terzo centrale           69,4%      71,1%

   IL COSTO, DICHIARATO E NON SCONTATO. Il cancello 4 (ombre parallele)
   scende da 6/8 a 5/8, e cade l'istante 2. La causa e' leggibile nella
   riga: con la camera un poco piu' stretta sui corpi, una figura che
   prima era scartata («i piedi fuori dal manto») rientra nel manto e
   quindi nella popolazione misurata, e la sua ombra viene letta a 16
   gradi dalla media — la deviazione passa da 1,4° a 11,3°. Non e' che le
   ombre di prima siano peggiorate: e' un campione in piu', e quel
   campione legge male. Il confronto col DICHIARATO resta dentro il tetto
   (8° contro 12°), cioe' il rivelatore di bugie dello strumento non
   suona: e' il caso classico della marcia che esce dalla capsula e segue
   qualcos'altro. Non e' stato riparato qui perche' non e' roba di questo
   file, e non e' stato nascosto perche' un costo taciuto e' un costo
   pagato due volte.
   IL SALDO, sullo stesso banco: 45 misure su 56 senza la toppa, 46 su 56
   con la toppa.

   ---------------------------------------------------------------------
   QUANTO COSTA IN MILLISECONDI: NIENTE DI MISURABILE, e il "niente" e'
   dichiarato con la risoluzione dell'attrezzo accanto, che senza vale
   zero.
     node strumenti/prestazione.js --prova-uguale --freno 4
       lo stesso file contro se' stesso: 3,1% di scarto. E' la
       RISOLUZIONE DEL BANCO OGGI — differenze piu' piccole di 3,1% non
       vanno credute. (Il banco balla del 42,1% fra repliche dello stesso
       file: e' esattamente il rumore che l'appaiamento annulla.)
     node strumenti/prestazione.js --contro <gioco> --oggi <toppato> --freno 4
       fotogramma medio         131,1 -> 126,5 ms   -3,5%
       tipico (quinto centrale) 123,8 -> 120,2 ms   -2,9%
       il 95 per cento sotto    175,0 -> 166,6 ms   -4,8%
       tutti e tre dentro il +25% ammesso, e tutti e tre NEGATIVI.
   COME VA LETTO. Il segno e' negativo (il file toppato misura un filo
   piu' veloce), ma -2,9% sta SOTTO la risoluzione di 3,1% e su due voci
   su tre i giri scavalcano lo zero: l'attrezzo dichiara «non provate».
   La sola cosa che si puo' scrivere onestamente e': QUESTA TOPPA NON HA
   UN COSTO MISURABILE SU QUESTO BANCO. Non «e' piu' veloce del 3,5%»,
   che sarebbe mentire con un numero vero.
   Ed e' quello che ci si aspetta guardando il codice: due cicli da due
   iterazioni dentro updateCamera, una volta per fotogramma.

   ---------------------------------------------------------------------
   LA VARIANTE PIU' MITE, PROVATA E SCARTATA. Applicare il tetto al solo
   asse lungo (la testata, G.camLato) invece che a tutti e due gli
   appoggi e' un intervento di meta' taglia, e rende meno della meta':
   su 696 fotogrammi le figure nel terzo centrale vanno da 2,32 a 2,39
   (contro 2,60) e «almeno due figure» da 76,3% a 79,0% (contro 88,1%).
   E' l'appoggio alla SPONDA — l'asse corto — a portare quasi tutto il
   guadagno, perche' e' li' che il campo e' stretto e la spinta di 90
   unita' oltre la linea sposta il quadro di piu'. La variante mite resta
   scritta qui perche' chi tornera' non la rifaccia: node
   strumenti/_toppa-centro2.js ing.html usc.html --solo-lato la produce.

   ---------------------------------------------------------------------
   LA GEOMETRIA, PER CHI DOVRA' RILEGGERLA. Con la camera in x, un punto
   del mondo sta nel terzo centrale del quadro quando |x - cam.x| <=
   (VW/6)/S2: e' la stessa disuguaglianza del punto 6-ter, che la usa per
   il pallone. Quindi il bersaglio dell'appoggio verso destra non puo'
   superare p.x + (VW/6)/S2 per nessuno dei due duellanti, e verso
   sinistra non puo' scendere sotto p.x - (VW/6)/S2.
   Sull'asse corto la stessa cosa NON e' simmetrica, e questa e' la sola
   riga che vale la pena leggere due volte: il centro verticale del
   QUADRO e' VH/2, ma la camera centra sull'AREA DI GIOCO, cioe' su
   PA_CY. Un punto y sta nel terzo centrale del quadro quando
   y*S2 + (PA_CY - cam.y*S2) sta fra VH/3 e 2VH/3, cioe' quando
   cam.y <= y + (PA_CY - VH/3)/S2  e  cam.y >= y + (PA_CY - 2VH/3)/S2.
   Il 6-ter usa VH/6 per tutti e due i versi e sbaglia di quel tanto: qui
   si scrive la disuguaglianza giusta, perche' la misura che giudica —
   il terzo centrale di istantanea.js — guarda il QUADRO, non l'area di
   gioco, e una regia che mirasse al terzo sbagliato lavorerebbe per un
   bersaglio che nessuno misura.
   ===================================================================== */
const fs = require('fs');

const soloLato = process.argv.includes('--solo-lato');
const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------
   1. L'ASSE CORTO: l'appoggio alla SPONDA cede al duello.
   ------------------------------------------------------------------ */
if (!soloLato) cambio('1. l\'appoggio alla sponda si ferma dove il duello esce dal terzo centrale',
`      const tyB = G.camBanda>0 ? (FH+90)-(VH-PA_CY)/S2n : -90+(PA_CY-PA_Y0)/S2n;
      ty = G.camBanda>0 ? Math.max(ty,tyB) : Math.min(ty,tyB);`,
`      let tyB = G.camBanda>0 ? (FH+90)-(VH-PA_CY)/S2n : -90+(PA_CY-PA_Y0)/S2n;
      /* ====== L'APPOGGIO CEDE AL DUELLO (asse corto) =================
         La spinta verso la sponda compra cartelloni, recinzione e prime
         file: merce vera, gia' disegnata, e la giuria la chiede. Ma la
         stessa giuria chiede anche che DOVE CADE L'OCCHIO — il terzo
         centrale del quadro — ci siano i corpi, e la spinta li portava
         fuori: misurato sul freeze-frame test, il terzo centrale aveva
         in media 2,32 figure su 696 fotogrammi e ne restava senza
         nessuna nel 5% dei casi.
         Il tetto e' quindi uno solo: l'appoggio non spinge oltre il
         punto in cui i DUE piu' vicini al pallone — cioe' il duello, che
         e' quello che un occhio segue — escono dal terzo centrale. Non
         e' una spinta in piu': e' un tetto, quindi puo' solo lasciare la
         camera PIU' VICINA al bersaglio del punto 1, che e' il pallone.
         Infatti il pallone nel terzo centrale sale (69,4% -> 71,1%)
         invece di scendere.
         LA DISUGUAGLIANZA E' ASIMMETRICA e non e' un dettaglio: la
         camera centra sull'AREA DI GIOCO (PA_CY), il terzo centrale e'
         del QUADRO (VH/2). Un punto y ci sta dentro quando
         y*S2+(PA_CY-cam.y*S2) sta fra VH/3 e 2VH/3, cioe'
         cam.y <= y+(PA_CY-VH/3)/S2 spingendo in giu' e
         cam.y >= y+(PA_CY-2VH/3)/S2 spingendo in su. */
      { for(let i=0;i<2 && i<camVicini.length;i++){ const p=camVicini[i];
          tyB = G.camBanda>0 ? Math.min(tyB, p.y+(PA_CY-VH/3)/S2n)
                             : Math.max(tyB, p.y+(PA_CY-2*VH/3)/S2n); }
      }
      ty = G.camBanda>0 ? Math.max(ty,tyB) : Math.min(ty,tyB);`);

/* ------------------------------------------------------------------
   2. L'ASSE LUNGO: lo stesso verso la testata.
   ------------------------------------------------------------------ */
cambio('2. l\'appoggio alla testata si ferma dove il duello esce dal terzo centrale',
`      const txB = G.camLato>0 ? (FW+90)-(VW/2)/S2n : -90+(VW/2)/S2n;
      tx = G.camLato>0 ? Math.max(tx,txB) : Math.min(tx,txB);`,
`      let txB = G.camLato>0 ? (FW+90)-(VW/2)/S2n : -90+(VW/2)/S2n;
      /* lo stesso tetto sull'asse lungo, e qui la disuguaglianza e'
         simmetrica perche' la camera centra il quadro in orizzontale:
         un punto x sta nel terzo centrale quando |x-cam.x| <= (VW/6)/S2,
         che e' la stessa che il punto 6-ter usa per il pallone.
         Da solo questo cambio rende meno della meta' del guadagno
         (figure nel terzo centrale 2,32 -> 2,39 invece di 2,60): e'
         l'asse CORTO a portare il resto, perche' li' il campo e' stretto
         e le 90 unita' oltre la linea spostano il quadro di piu'. */
      { const wT=(VW/6)/S2n;
        for(let i=0;i<2 && i<camVicini.length;i++){ const p=camVicini[i];
          txB = G.camLato>0 ? Math.min(txB, p.x+wT) : Math.max(txB, p.x-wT); }
      }
      tx = G.camLato>0 ? Math.max(tx,txB) : Math.min(tx,txB);`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) {
  console.error('uso: node strumenti/_toppa-centro2.js ingresso.html uscita.html [--solo-lato]');
  process.exit(2);
}
if (!fs.existsSync(ing)) {
  console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing);
  process.exit(1);
}
let t = fs.readFileSync(ing, 'utf8');
/* GLI ANCORAGGI RESTANO RICONOSCIBILI ANCHE DOPO — le sostituzioni
   aggiungono e non tolgono — quindi la sola prova dell'unicita'
   lascerebbe passare una SECONDA applicazione, che raddoppierebbe ogni
   innesto in silenzio. */
if (t.includes('L\'APPOGGIO CEDE AL DUELLO') || t.includes('const wT=(VW/6)/S2n;')) {
  console.error('TOPPA NON APPLICATA — nessun byte scritto:\n  ' +
    'l\'ingresso porta gia\' il tetto del duello: la toppa e\' gia\' stata applicata a questo file');
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
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}` +
  (soloLato ? '  (variante mite: solo l\'asse lungo)' : ''));
