/* =====================================================================
   SILHOUETTE — il banco della sagoma.

   PERCHE' ESISTE. La verifica che la giuria ha promesso di usare non e'
   «la figura e' bella»: e' «riempila di nero, mostrala a quaranta pixel
   a un estraneo, fatti dire che azione sta facendo». Se non ci riesce,
   la posa non e' una posa. E' un cancello onesto e brutale, ma e' anche
   un cancello UMANO: non si puo' chiamare un estraneo venti volte in un
   pomeriggio, e senza una misura in mezzo lo sciame lavora alla cieca.

   Questo strumento e' il PRE-cancello. Apre la pagina con
   ?banco=silhouette, la pagina disegna dieci azioni a quaranta pixel
   con OGNI colore a nero — stessa Rig3D.disegna della partita, stessa
   camera, stessa scala: un banco che disegnasse a modo suo direbbe
   verde su una figura che in campo non esiste.

   =====================================================================
   IL PROVINO CIECO DEL 17 AGOSTO 2026, E COSA HA ROTTO.
   (questa sezione e' la ragione di tutto quello che segue: va letta
   prima di toccare una banda)

   Fino a stamattina il banco dichiarava OTTO azioni nominabili su dieci,
   VERDE, su quattro proxy geometrici: inchiostro, strozzature, arti
   distinti, rapporto forma. Poi una persona che non conosceva la chiave
   di risposta, e a cui era vietato cercarla, ha guardato il foglio
   (foto-figure2-dopo/silhouette.png) e ne ha nominate TRE:

       CERTO    3   la 4 (carica il tiro), la 5 (ha appena tirato),
                    la 9 (esulta)
       INCERTO  6   la 1, la 2, la 3, la 6, la 7, la 8
       NON SO   1   la 10

   Il cancello diceva otto, l'uomo tre. Peggio: le DUE pose che il
   cancello bocciava — «carica il tiro» e «ha appena tirato» — sono
   esattamente le due che l'uomo ha nominato con piu' sicurezza. Il
   verdetto non era solo sbagliato di conto: era invertito sul pezzo che
   contava.

   La diagnosi l'ha data lui, e si puo' misurare: «le pose che funzionano
   sono quelle in cui UN ARTO ESCE NETTO DALLA SAGOMA — la gamba tesa
   della 5, le braccia della 9, la forbice della 4. Tutte quelle in cui
   gli arti restano dentro il profilo del corpo (1, 2, 3, 8) diventano la
   stessa macchia nera e non comunicano niente.»

   COSA E' CAMBIATO QUI DENTRO, e ogni voce porta il numero che la regge.

   (i)  E' NATO UN QUINTO CRITERIO, LO SCAVO, e adesso e' il criterio
        che decide. Misura la frazione del GUSCIO CONVESSO della sagoma
        occupata da SFONDO: quanto vuoto entra fra un arto e la massa.
        Sulle dieci sagome che l'uomo ha giudicato:
            fuse    (1,2,3,8)  0,278  0,303  0,268  0,319
            nominate(4,5,9)    0,364  0,349  0,401
        Fra la peggiore delle nominate (0,349) e la migliore delle fuse
        (0,319) c'e' una forbice vuota. La soglia sta in mezzo: 0,33.
        Le altre tre non nominate cadono cosi': il tuffo 0,279 (bocciato,
        giusto), la scivolata 0,384 e «e' deluso» 0,351 (promossi,
        sbagliato). Nove celle su dieci d'accordo con l'uomo. Le due
        eccezioni sono nominate al punto (iv) invece che fatte sparire.

   (ii) LA BANDA DELLA FORMA PASSA DA 0,35-0,75 A 0,35-1,15 sulle pose
        in piedi. Non e' una banda allargata perche' non passava: e' una
        banda CONTRADDETTA DALLA PROVA. Le due pose che l'uomo ha
        nominato con piu' sicurezza stanno a 0,913 e 0,822, cioe' erano
        bocciate per essere larghe mentre e' la larghezza a farle
        leggere. Il mestiere della banda resta uno solo — separare «in
        piedi» da «steso» — e il confine di quel mestiere e' 1,15, che e'
        gia' la soglia dell'altra meta'. Zero-zero-sette-cinque non era
        il confine fra in piedi e steso: era il ritratto di un uomo a
        riposo, e le azioni non stanno a riposo.

   (iii) IL CRITERIO «arti» NON BOCCIA PIU', E VIENE STAMPATO LO STESSO.
        Conta le righe con due tratti neri distinti nella meta' bassa
        («due gambe, non un tronco di cono»). Sul foglio del provino:
            nominate (4,5,9)     1, 1, 13
            non nominate         14, 13, 8, 5, 7, 6, 8
        La mediana delle nominate e' PIU' BASSA di quella delle
        bocciate: su questo campione il criterio corre all'incontrario.
        Un proxy che va nella direzione opposta alla verita' che deve
        approssimare non puo' avere il potere di bocciare. Resta stampato
        perche' un giorno potrebbe tornare a dire qualcosa, e perche'
        toglierlo dal foglio sarebbe cancellare la prova che ha fallito.

   (iv) LE DUE CELLE SU CUI IL CANCELLO E L'UOMO NON VANNO D'ACCORDO,
        dette invece che tarate via:
        - LA SCIVOLATA (6). Scavo 0,384: il cancello la promuove. L'uomo
          l'ha messa fra le incerte, ma non perche' non la vedesse: non
          riusciva a distinguerla dal TUFFO (7). E' un guasto di
          DISTINZIONE, e la distinzione questo banco la misura male —
          vedi (v).
        - «E' DELUSO» (10). Scavo 0,351: promossa. L'uomo ha risposto
          «non so». Non e' una sagoma illeggibile, e' un'azione che nel
          calcio non ha una posa canonica: nessun criterio geometrico
          puo' sapere se un gesto ha un nome nella testa di chi guarda.
        Tarare la soglia per farle cadere anche loro vorrebbe dire
        portarla a 0,349-0,351, cioe' scriverla su due decimillesimi di
        distanza da un campione: sarebbe una tabella, non un cancello.

   (v)  LA DISTINZIONE E' MISURATA MALE, ED E' UN DEBITO DICHIARATO.
        La distanza di Hamming si calcola su una griglia 32x32 ottenuta
        NORMALIZZANDO ogni sagoma alla propria scatola. La
        normalizzazione butta via proprio l'informazione che l'occhio
        usa. Misurato sul foglio del provino: la coppia piu' vicina
        secondo il banco e' «sta fermo / corre» (0,231), e «cammina»
        risulta piu' vicina a «il portiere si tuffa» (0,259) che a «sta
        fermo» (0,343). Nessun essere umano confonde una camminata con un
        tuffo. Le due coppie che l'uomo HA confuso — 1 con 8, e 6 con 7 —
        stanno a 0,276 e 0,271, cioe' nemmeno in cima alla classifica.
        Il numero resta come guardia contro «due giocatori nella stessa
        posa» (per quello va bene: e' un test di identita', non di
        somiglianza percettiva) ma NON va letto come «queste due azioni
        si confondono». La strada per ripararlo e' misurare le due
        maschere nel TELAIO COMUNE della cella, senza normalizzare:
        provato, mette 1/2 e 8/10 in cima, che e' molto piu' vicino
        all'uomo, ma sposta la scivolata e il tuffo agli antipodi (0,899)
        mentre l'uomo li confonde. Nessuna delle due misure e'
        percettiva, e finche' non lo e' non deve decidere.

   =====================================================================
   IL SECONDO PROVINO CIECO, 17 AGOSTO 2026 (sera), E COSA HA ROTTO
   ANCORA. Il primo provino aveva trovato che gli arti non uscivano dal
   corpo; lo SCAVO l'ha risolto. Un'altra persona, di nuovo senza chiave
   e senza poterla cercare, ha guardato il foglio riparato e ha detto:

       CERTO   4  la 1 «cammina», la 2 «corre», la 10 «corre», la 9
                  «esulta».  TRE DI QUESTE QUATTRO SONO SBAGLIATE.
       INCERTO 5  la 3 (tre letture), la 4 «corre (scatta)», la 5
                  «tira», la 6 «scivolata o cade», la 7 «si tuffa»
       NON SO  1  la 8

   Nominate CORRETTAMENTE E CON SICUREZZA: UNA su dieci. Il cancello, in
   quel momento, ne dichiarava nove.

   LA DIAGNOSI, parole sue: «la 4 e la 10 sono praticamente la stessa
   sagoma: stessa inclinazione del busto, stessa falcata, stesse braccia
   alternate. Subito dietro c'e' la coppia 2 e 4. IL FOGLIO SPENDE TRE
   DELLE DIECI POSE SU UNA COSA SOLA.» Il difetto non era piu' la
   fusione degli arti — quella era guarita: era il VOCABOLARIO. Tre pose
   su dieci usavano la falcata della corsa, e una posa non dice il verbo
   se il verbo e' sempre lo stesso.

   IL CANCELLO NON POTEVA VEDERLO, ed e' la ragione del sesto criterio.
   Aveva un `distinzione`, ma normalizzava ogni sagoma alla propria
   scatola: la coppia 4/10 gli risultava decima su quarantacinque. E'
   nato percio' il VOCABOLARIO — undici tratti letti a parita' di scala
   reale nel telaio comune della cella — che la mette terza. Il cappello
   qui sotto, IL VOCABOLARIO, ha i numeri e dice anche perche' quel
   criterio ORDINA ma non boccia.

   =====================================================================
   I SEI CRITERI, IN CHIARO.

     inchiostro   quanto della scatola e' pieno, fra 0,28 e 0,52. Sotto
                  e' uno scheletro di fili, sopra e' un blocco.
                  Sul foglio del provino non ha bocciato nessuno: non
                  discrimina, ma guarda un guasto che semplicemente non
                  si e' presentato.
     masse        almeno DUE strozzature nel profilo delle scansioni
                  orizzontali: il collo e il bacino. Idem: non ha
                  discriminato nulla su quel campione.
     forma        larghezza/altezza fra 0,35 e 1,15 in piedi; sopra 1,15
                  per scivolata e tuffo, che devono leggere ORIZZONTALI.
     scavo        la frazione del guscio convesso occupata da sfondo,
                  almeno 0,33. E' il criterio nato dal provino cieco, ed
                  e' l'unico che separi le tre nominate dalle quattro
                  fuse. VETO.
     arti         righe con due tratti nella meta' bassa. INFORMATIVO,
                  vedi (iii).
     identita'    Hamming >= 0,18 fra ogni coppia, su griglie
                  normalizzate. VETO, ma dice solo «non sono la stessa
                  posa»: vedi (v) per cosa NON dice.
     vocabolario  undici tratti per sagoma, letti nel telaio comune
                  della cella a parita' di scala reale; si segnalano le
                  coppie sotto META' della mediana delle 45 distanze.
                  INFORMATIVO — nato dal secondo provino, ha falsi
                  positivi noti e per ora ordina invece di giudicare.
                  Cappello dedicato piu' sotto.

   UNA NOTA SU `masse`, MISURATA E NON AGITA. La strozzatura si conta
   sul profilo di riga, e a quaranta pixel e' fragile: sulla camminata,
   a parita' di tutto il resto, una falcata di 0,82 rad da' UNA
   strozzatura e una di 0,85 ne da' DUE (provate anche 0,66 / 0,74:
   sempre una). Tre centesimi di radiante ribaltano un veto. Resta un
   veto perche' toglierlo mentre una posa ci sbatte contro sarebbe
   toglierlo per convenienza; ma chi lo guarda sappia che un pixel lo
   decide.

   =====================================================================
   IL CANCELLO DA' DUE NUMERI, E SOLO IL PRIMO DECIDE.

     (a) IL REQUISITO DELLA GIURIA. Dieci azioni all'angolo di
         presentazione, almeno OTTO nominabili. E' l'unica cosa che
         decide verde o rosso.

     (b) LA SPAZZATA sui quattro quarti di giro e le tre corporature,
         INFORMATIVA. LO SCAVO NON C'E', ed e' un limite da dire: la
         pagina manda per le 120 combinazioni solo i quattro numeri
         calcolati al volo, mentre lo scavo si legge sul FOGLIO A
         CONTATTO, che esiste solo all'angolo di presentazione. La
         spazzata resta quindi sui criteri vecchi.

   LE ESCLUSIONI SONO DUE, E SONO NOMINATE, NON NASCOSTE:

     E1  forma, su una posa distesa vista a 0 e 180 gradi. Il corpo
         giace lungo l'asse della camera: per leggere 1,15 servirebbe
         un'estensione laterale di 1,62 m, piu' lunga dell'uomo. 12
         combinazioni: il tetto vero della spazzata e' 108, non 120.

     E2  masse, su una posa distesa a QUALUNQUE angolo. La scansione
         cerca le strozzature nelle RIGHE, cioe' tre masse SOVRAPPOSTE.
         Su un uomo in volo quelle masse stanno AFFIANCATE. Misurato il
         17 ago 2026: zero strozzature su 144 combinazioni e su 4.896
         misure attraverso 34 varianti della clip; le stesse maschere
         scandite perpendicolarmente al proprio asse ne danno due in 68
         casi su 144. La strada per toglierla e' scritta: masseAsse in
         misura(), dentro ?banco=silhouette.

   NON C'E' UNA E3 PER LO SCAVO SU UNA POSA DISTESA, e la tentazione
   c'era: il tuffo e' l'unica bocciatura rimasta e il suo scavo non
   supera 0,304 in nessuna delle 24 varianti geometriche provate, perche'
   un corpo teso lungo un asse ha un profilo quasi convesso per
   costruzione. Ma la scivolata, che e' distesa quanto lui, sta a 0,384:
   una posa a terra PUO' rispondere a questa domanda. Un'esclusione che
   vale per una posa e non per l'altra non e' una legge, e' un permesso.
   Il tuffo resta rosso.

   ESCE anche un PNG a contatto (foto-figure2-dopo/silhouette.png) con
   le dieci sagome, piu' la CHIAVE DI RISPOSTA separata su stdout: al
   provino umano si mostra il foglio, non la chiave.

   USO:  node strumenti/silhouette.js
         node strumenti/silhouette.js --dir foto-figure2-dopo
         node strumenti/silhouette.js --profilo
         node strumenti/silhouette.js --file ALTRO.html
         node strumenti/silhouette.js --rompi     (la prova di rottura, (c))
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
/* --- innesto di _z-banco.js: la radice resta il repo, ma il gioco puo'
   arrivare da fuori. Nessun altro comportamento e' toccato. --- */
const __PROVA = process.env.GIOCO_PROVA ? require('path').resolve(process.env.GIOCO_PROVA) : '';
const __rid = f => (__PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) ? __PROVA : f;

function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const ROMPI = process.argv.includes('--rompi');
/* IL FOGLIO DELLA PROVA DI ROTTURA NON VA NELLA CARTELLA DEL PROVINO.
   Il PNG di foto-figure2-dopo e' il foglio che si mette davanti a un
   estraneo: sovrascriverlo con una figura storpiata apposta vuol dire
   fare il provino su una bugia. Con --rompi la destinazione cambia da
   sola, e chi vuole puo' comunque forzarla con --dir. */
const DIR = arg('dir', ROMPI ? 'foto-figure2-dopo/_conrottura' : 'foto-figure2-dopo');
const FILE = arg('file', 'CALCETTO-il-gioco.html');
const DIST_MIN = 0.18;      // distanza di Hamming minima fra due sagome
const NOMINABILI_MIN = 8;   // il requisito della giuria: 8 su 10

/* le bande, in un posto solo: le stampa anche il rapporto, cosi'
   nessuno deve andarle a cercare nel sorgente della pagina */
const B = {
  inchiostro: [0.28, 0.52],
  formaPiedi: [0.35, 1.15],
  formaSteso: 1.15,
  masse: 2,
  scavo: 0.33,
};
/* quali clip disegnano un corpo disteso: e' l'unica informazione da cui
   dipendono tutte e due le esclusioni */
const STESO = { scivolata: 1, tuffo: 1 };
const NOMI_STESI = ['scivola in contrasto', 'il portiere si tuffa'];

/* =====================================================================
   LA PROVA DI ROTTURA (--rompi).
   Un cancello che non sa fallire non e' un cancello. Qui la pagina viene
   servita con UNA posa storpiata al volo — le braccia dell'esultanza
   richiuse lungo il corpo — senza toccare un byte su disco: si serve una
   copia in memoria. Se il testo da storpiare non c'e' esattamente una
   volta lo strumento si ferma, perche' una prova di rottura che non
   rompe niente e' peggio di nessuna prova.
   Le due ancore coprono la versione con la V larga e quella con la V
   stretta: qualunque delle due sia in casa, l'esultanza perde le ali. */
const ANCORE_ROTTURA = [
  `    braccioDir(sh,el,ha, s*SHW, shY, shZ,
               s*1.35, lift+0.66, -0.28,
               s*0.7425, lift+0.98, -0.40);`,
  `    braccioDir(sh,el,ha, s*SHW, shY, shZ,
               s*0.98, lift+0.94, -0.28,
               s*0.54, lift+0.98, -0.40);`,
];
const ROTTURA = `    braccioDir(sh,el,ha, s*SHW, shY, shZ,
               s*0.02, -1.00, 0.00,
               s*0.00, -1.00, 0.00);`;

function storpia(testo) {
  for (const a of ANCORE_ROTTURA) {
    if (testo.split(a).length - 1 === 1) return testo.replace(a, ROTTURA);
  }
  return null;
}

function servi(rompi) {
  return new Promise(ok => {
    const s = http.createServer((rq, rs) => {
      const u = decodeURIComponent(rq.url.split('?')[0]);
      const f = __rid(path.join(RADICE, u === '/' ? 'index.html' : u));
      fs.readFile(f, (e, d) => {
        if (e) { rs.writeHead(404); rs.end('no'); return; }
        const t = f.endsWith('.html') ? 'text/html'
          : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
        /* la storpiatura vale SOLO sul file in prova: la pagina ne tira
           dietro altri (il service worker, l'altro gioco) e un cancello
           che si mette a rompere anche quelli sbaglia bersaglio */
        if (rompi && path.resolve(f) === path.resolve(RADICE, FILE)) {
          const rotto = storpia(d.toString('utf8'));
          if (rotto === null) {
            console.log('PROVA DI ROTTURA IMPOSSIBILE: nessuna delle ancore dell\'esultanza');
            console.log('si trova esattamente una volta in ' + path.basename(f) + '.');
            process.exit(2);
          }
          d = Buffer.from(rotto, 'utf8');
        }
        rs.writeHead(200, { 'Content-Type': t + '; charset=utf-8', 'Cache-Control': 'no-store' });
        rs.end(d);
      });
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* =====================================================================
   LO SCAVO, misurato sul FOGLIO A CONTATTO.

   Il quinto criterio non puo' nascere dentro la pagina come gli altri
   quattro: la pagina manda quattro numeri per cella, e aggiungerne uno
   vorrebbe dire toccare il file del gioco. Il foglio a contatto pero'
   c'e' gia', ed e' la stessa maschera che i quattro numeri hanno letto —
   la pagina lo ridisegna apposta prima di stamparlo. Qui lo si rilegge
   in un canvas (il browser e' ancora aperto: si usa il suo decodificatore
   PNG, non se ne scrive un altro) e si misura cella per cella.

   LA GARANZIA CHE SIA LA STESSA MASCHERA non e' una speranza: per ogni
   cella si confronta la SCATOLA misurata sul PNG con quella che la
   pagina ha dichiarato (bw x bh). Se una sola non torna, lo strumento si
   ferma invece di stampare un numero che parla di un'altra figura.

   IL CONTO, in tre passi:
     1. il GUSCIO CONVESSO della maschera, dai punti estremi di ogni riga
        (per una figura piena i due insiemi hanno lo stesso guscio);
     2. lo SFONDO dentro il guscio: tutti i pixel bianchi che il guscio
        racchiude — l'ascella, la forbice fra le gambe, il triangolo fra
        un braccio alzato e la testa;
     3. scavo = sfondo / (sfondo + nero), cioe' la frazione del guscio
        che NON e' figura. E' il complemento della solidita', la misura
        di forma piu' vecchia che ci sia, e qui vale perche' e'
        esattamente la domanda che il provino cieco ha posto: quanto
        vuoto passa fra un arto e il corpo.
   ===================================================================== */
const MISURA_SCAVO = `(cella) => {
  const {dati, W, H, x0, y0, CW, CH} = cella;
  let minx=1e9,maxx=-1,miny=1e9,maxy=-1,tot=0;
  const m=new Uint8Array(W*H);
  for(let y=y0;y<y0+CH;y++)for(let x=x0;x<x0+CW;x++){
    if(dati[(y*W+x)*4+3]>128){ m[y*W+x]=1; tot++;
      if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; }
  }
  if(tot<20) return {vuota:true};
  const bw=maxx-minx+1, bh=maxy-miny+1, PAD=3, LW=bw+2*PAD, LH=bh+2*PAD;
  const q=new Uint8Array(LW*LH);
  for(let y=0;y<bh;y++)for(let x=0;x<bw;x++) if(m[(y+miny)*W+x+minx]) q[(y+PAD)*LW+x+PAD]=1;
  /* 1. il guscio convesso (catena monotona sui punti estremi di riga) */
  const pts=[];
  for(let y=0;y<LH;y++){ let a=-1,b=-1;
    for(let x=0;x<LW;x++) if(q[y*LW+x]){ if(a<0)a=x; b=x; }
    if(a>=0){ pts.push([a,y]); if(b!==a) pts.push([b,y]); } }
  pts.sort((p,r)=>p[0]-r[0]||p[1]-r[1]);
  const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],hi=[];
  for(const p of pts){ while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop(); lo.push(p); }
  for(let k=pts.length-1;k>=0;k--){ const p=pts[k];
    while(hi.length>=2&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop(); hi.push(p); }
  lo.pop(); hi.pop(); const hull=lo.concat(hi);
  /* 2. l'intervallo del guscio riga per riga: e' convesso, quindi uno solo */
  const HL=new Int32Array(LH).fill(1e9), HR=new Int32Array(LH).fill(-1e9);
  for(let k=0;k<hull.length;k++){
    const A=hull[k], Bp=hull[(k+1)%hull.length];
    const ya=Math.min(A[1],Bp[1]), yb=Math.max(A[1],Bp[1]);
    for(let y=Math.ceil(ya);y<=Math.floor(yb);y++){
      const t=(Bp[1]===A[1])?0:(y-A[1])/(Bp[1]-A[1]); const x=A[0]+(Bp[0]-A[0])*t;
      if(x<HL[y])HL[y]=Math.ceil(x-0.001); if(x>HR[y])HR[y]=Math.floor(x+0.001); } }
  /* 3. sfondo dentro il guscio, contro nero */
  let vuoto=0, pieno=0;
  for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){
    if(q[y*LW+x]) { pieno++; continue; }
    if(x>=HL[y] && x<=HR[y]) vuoto++; }
  return {scavo:vuoto/(vuoto+pieno), bw, bh};
}`;

/* =====================================================================
   IL VOCABOLARIO — la misura nata dal SECONDO provino cieco.

   PERCHE' NON BASTA LA DISTANZA DI HAMMING. La vecchia `distinzione`
   normalizza ogni sagoma alla PROPRIA scatola prima di confrontarla:
   butta via la scala, che e' la prima cosa che l'occhio usa. Misurato
   sul foglio del 17 agosto: metteva «cammina» piu' vicina al TUFFO
   (0,259) che a «sta fermo» (0,343), e la coppia che l'uomo ha chiamato
   «praticamente la stessa sagoma» — la carica del tiro e la delusione —
   la classificava decima su quarantacinque. Nessun essere umano confonde
   una camminata con un tuffo; tutti e due gli esseri umani interpellati
   hanno confuso la carica con qualcos'altro.

   COSA MISURA QUESTA, INVECE. Undici TRATTI per sagoma, tutti letti
   sulla cella del foglio a contatto — cioe' nel TELAIO COMUNE, a parita'
   di scala reale, senza normalizzare niente — e tutti divisi per UNA
   SOLA scala (40 px, l'altezza nominale della figura), cosi' il numero
   resta adimensionale ma le proporzioni fra le dieci restano vere:

     alt   altezza della scatola          lar   larghezza della scatola
     incl  di quanto la colonna del tronco al 22% dell'altezza sta a
           destra di quella al 58%: l'INCLINAZIONE DEL BUSTO, con segno
     falc  estensione orizzontale della meta' bassa: la FALCATA
     base  distanza fra i due appoggi nelle ultime quattro righe (zero
           se ce n'e' uno solo: la figura e' in volo o su un piede)
     bSx   di quanto la maschera esce a SINISTRA della colonna del
           tronco nel 45% alto      bDx   idem a destra: LE BRACCIA
     qSx   a che quota da terra sta il punto piu' esterno di sinistra
     qDx   idem a destra: due braccia alla stessa quota sono un manichino
     cima  larghezza della maschera nel 12% alto: dice se sopra la testa
           c'e' qualcosa (la V dell'esultanza) o solo la testa
     rott  frazione di righe spezzate in due o piu' tratti: quanta ARIA
           attraversa la figura

   Sono gli stessi tratti che l'uomo ha NOMINATO quando ha spiegato la
   confusione: «stessa inclinazione del busto, stessa falcata, stesse
   braccia alternate». La distanza fra due sagome e' la media degli
   undici scarti in valore assoluto.

   COSA SA FARE, e il numero e' sul foglio dove esiste la verita' umana.
   Sul foglio del 17 agosto le tre coppie piu' vicine secondo questa
   misura sono, in ordine: 4/8 (carica il tiro / il portiere aspetta)
   0,067, 3/10 (corre / e' deluso) 0,099, 4/10 (carica il tiro / e'
   deluso) 0,100 — su una mediana di 0,209. La 4/10 e' esattamente la
   coppia che l'uomo ha chiamato la stessa sagoma; la 3/10 e la 4/8 sono
   le altre due della famiglia della corsa che ha nominato lui. La
   vecchia Hamming metteva 4/10 al decimo posto e 5/6 al primo.

   LA SOGLIA E' RELATIVA, ED E' UNA SCELTA. Non «sotto 0,10», che
   sarebbe un numero scritto su cinque campioni, ma «sotto META' DELLA
   MEDIANA delle quarantacinque distanze dello stesso foglio»: la
   domanda non e' «quanto distano» ma «ce n'e' una troppo piu' vicina
   delle altre». E' scale-free e non dipende da quanto sono grandi le
   figure. Sul foglio del 17 agosto meta' mediana vale 0,105 e cadono
   tre coppie; il minimo sta al 32% della mediana.

   PERCHE' NON BOCCIA, e questo va detto in chiaro. Su un foglio provato
   dopo, la stessa regola ha segnalato «cammina / esulta»: due sagome che
   nessun occhio confonde — una ha le braccia in giu' e un passo, l'altra
   le ha in alto a V. E' un FALSO POSITIVO, e la misura non sa
   distinguerlo da un vero. Un proxy con falsi positivi noti puo'
   ORDINARE, non puo' giudicare: e' la stessa ragione per cui `arti` e'
   stato tolto dai veti al punto (iii). Quello che fa e' stampare, in
   cima al rapporto, le coppie che un occhio POTREBBE confondere, con lo
   scarto tratto per tratto, cosi' chi disegna sa da dove cominciare.
   Quando un secondo provino cieco confermera' o smentira' le coppie che
   segnala, allora avra' il diritto di bocciare.
   ===================================================================== */
const MISURA_TRATTI = `(cella) => {
  const {dati, W, x0, y0, CW, CH} = cella, S = 40;
  const m = new Uint8Array(CW*CH);
  let minx=CW, maxx=-1, miny=CH, maxy=-1, tot=0;
  for(let y=0;y<CH;y++) for(let x=0;x<CW;x++){
    if(dati[((y+y0)*W + x+x0)*4+3] > 128){ m[y*CW+x]=1; tot++;
      if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y; } }
  if(tot<20) return null;
  const bw=maxx-minx+1, bh=maxy-miny+1;
  const tratti=(y)=>{ const o=[]; let a=-1;
    for(let x=0;x<=CW;x++){ const v = x<CW ? m[y*CW+x] : 0;
      if(v&&a<0) a=x; else if(!v&&a>=0){ o.push([a,x-1]); a=-1; } }
    return o; };
  const lungo=(y)=>{ let b=null; for(const r of tratti(y)) if(!b||r[1]-r[0]>b[1]-b[0]) b=r; return b; };
  /* la COLONNA DEL TRONCO: il tratto piu' lungo della riga. Alla quota
     delle spalle e a quella delle anche il tratto piu' lungo e' il
     tronco; la differenza fra i due centri e' l'inclinazione. */
  const tS=lungo(miny+Math.round(bh*0.22)), tH=lungo(miny+Math.round(bh*0.58));
  const cS = tS ? (tS[0]+tS[1])/2 : 0, cH = tH ? (tH[0]+tH[1])/2 : 0;
  let lo=CW, hi=-1;
  for(let y=miny+Math.round(bh*0.58); y<=maxy; y++) for(let x=0;x<CW;x++)
    if(m[y*CW+x]){ if(x<lo)lo=x; if(x>hi)hi=x; }
  let base=0;
  for(let y=maxy-3;y<=maxy;y++){ const t=tratti(y);
    if(t.length>=2){ const d=t[t.length-1][1]-t[0][0]; if(d>base) base=d; } }
  let bx0=0, bx1=0, q0=maxy, q1=maxy;
  for(let y=miny;y<=miny+bh*0.45;y++) for(let x=0;x<CW;x++) if(m[y*CW+x]){
    const d=x-cS; if(d>bx1){bx1=d;q1=y;} if(-d>bx0){bx0=-d;q0=y;} }
  let c0=CW, c1=-1;
  for(let y=miny;y<=miny+Math.max(1,Math.round(bh*0.12));y++) for(let x=0;x<CW;x++)
    if(m[y*CW+x]){ if(x<c0)c0=x; if(x>c1)c1=x; }
  let n2=0; for(let y=miny;y<=maxy;y++) if(tratti(y).length>=2) n2++;
  return { alt:bh/S, lar:bw/S, incl:(cS-cH)/S, falc:(hi-lo+1)/S, base:base/S,
           bSx:bx0/S, bDx:bx1/S, qSx:(maxy-q0)/S, qDx:(maxy-q1)/S,
           cima:(c1-c0+1)/S, rott:n2/bh };
}`;
const TRATTI = ['alt', 'lar', 'incl', 'falc', 'base', 'bSx', 'bDx', 'qSx', 'qDx', 'cima', 'rott'];
function distTratti(a, b) {
  let s = 0; for (const k of TRATTI) s += Math.abs(a[k] - b[k]);
  return s / TRATTI.length;
}
/* le quarantacinque distanze, la mediana, e le coppie sotto meta' mediana */
function vocabolario(fig) {
  const cp = [];
  for (let a = 0; a < fig.length; a++) for (let b = a + 1; b < fig.length; b++)
    if (fig[a].tratti && fig[b].tratti) cp.push({ a, b, v: distTratti(fig[a].tratti, fig[b].tratti) });
  cp.sort((x, y) => x.v - y.v);
  if (!cp.length) return null;
  const mediana = cp[Math.floor(cp.length / 2)].v;
  return { cp, mediana, soglia: mediana / 2, segnalate: cp.filter(p => p.v < mediana / 2) };
}

/* ---- i criteri, e QUALI di essi hanno senso su questa riga ----
   Torna per ogni criterio: esito (true/false) oppure null = «non
   applicabile qui». Un criterio null non conta ne' come verde ne' come
   rosso: viene NOMINATO. `scavo` puo' arrivare undefined quando si
   guarda la spazzata (b), dove non e' misurabile: anche quello e' null. */
const CHIAVI = ['inchiostro', 'forma', 'masse', 'scavo'];
function criteri(m, steso, yawGradi) {
  const assiale = steso && (yawGradi === 0 || Math.abs(yawGradi) === 180);
  return {
    inchiostro: m.inchiostro >= B.inchiostro[0] && m.inchiostro <= B.inchiostro[1],
    forma: assiale ? null
      : (steso ? m.forma > B.formaSteso : (m.forma >= B.formaPiedi[0] && m.forma <= B.formaPiedi[1])),
    masse: steso ? null : m.masse >= B.masse,
    scavo: m.scavo === undefined ? null : m.scavo >= B.scavo,
  };
}
const impossibile = c => c.forma === null;          // la combinazione intera non puo' passare
const passa = c => CHIAVI.every(k => c[k] === null || c[k] === true);
const mancanti = c => CHIAVI.filter(k => c[k] === false);

/* la banda che un criterio chiede, in parole, per la riga «cosa manca» */
function chiede(k, steso) {
  if (k === 'inchiostro') return `fra ${B.inchiostro[0]} e ${B.inchiostro[1]}`;
  if (k === 'forma') return steso ? `sopra ${B.formaSteso}` : `fra ${B.formaPiedi[0]} e ${B.formaPiedi[1]}`;
  if (k === 'masse') return `almeno ${B.masse}`;
  return `almeno ${B.scavo}`;
}
const valore = (k, m) => k === 'inchiostro' ? m.inchiostro.toFixed(3)
  : k === 'forma' ? m.forma.toFixed(2)
    : k === 'scavo' ? m.scavo.toFixed(3) : String(m.masse);

/* UNA PASSATA DEL BANCO: apre la pagina (intera o storpiata), raccoglie i
   quattro numeri per cella e ci aggiunge lo scavo letto sul foglio.
   `scriviPng` e' falso per la passata di rottura: quel foglio non e' il
   foglio del provino e non deve prenderne il posto. */
async function raccogli(rompi, scriviPng) {
  const srv = await servi(rompi);
  const br = await chromium.launch();
  const pg = await br.newPage();
  const righe = [];
  pg.on('console', m => righe.push(m.text()));
  pg.on('pageerror', e => righe.push('ERRORE ' + e.message));
  /* cache-busting: senza, il browser rilegge il file di ieri */
  await pg.goto(`http://127.0.0.1:${srv.porta}/${FILE}?banco=silhouette&t=${Date.now()}`);
  await pg.waitForTimeout(3000);

  const riga = righe.find(r => r.startsWith('[silhouette] '));
  if (!riga) {
    console.log('BANCO MUTO — la pagina non ha stampato niente.');
    for (const r of righe.slice(0, 12)) console.log('   ' + r);
    await br.close(); srv.chiudi();
    process.exit(1);
  }
  if (riga.includes('fallito')) { console.log(riga); await br.close(); srv.chiudi(); process.exit(1); }
  const d = JSON.parse(riga.slice(13));

  const png = righe.find(r => r.startsWith('[silhouette-png] '));
  let dove = null, dataUrl = null;
  if (png) {
    dataUrl = png.slice(png.indexOf('data:'));
    if (scriviPng) {
      const b64 = png.slice(png.indexOf(',') + 1);
      fs.mkdirSync(path.join(RADICE, DIR), { recursive: true });
      dove = path.join(RADICE, DIR, 'silhouette.png');
      fs.writeFileSync(dove, Buffer.from(b64, 'base64'));
    }
  }

  /* ---- LO SCAVO, cella per cella, con il controllo delle scatole ---- */
  let scaviErrore = null;
  if (dataUrl) {
    const COL = 5, RIG = Math.ceil(d.fig.length / COL);
    const misure = await pg.evaluate(async ({ url, COL, RIG, N, src, src2 }) => {
      const im = new Image();
      await new Promise(ok => { im.onload = ok; im.src = url; });
      const cv = document.createElement('canvas');
      cv.width = im.width; cv.height = im.height;
      const g = cv.getContext('2d', { willReadFrequently: true });
      g.drawImage(im, 0, 0);
      const dati = g.getImageData(0, 0, cv.width, cv.height).data;
      const CW = im.width / COL, CH = im.height / RIG;
      if (CW !== Math.round(CW) || CH !== Math.round(CH)) return { errore: 'il foglio non e\' una griglia ' + COL + 'x' + RIG };
      const f = eval(src), f2 = eval(src2);
      const out = [], tratti = [];
      for (let i = 0; i < N; i++) {
        const c = { dati, W: cv.width, H: cv.height, x0: (i % COL) * CW, y0: ((i / COL) | 0) * CH, CW, CH };
        out.push(f(c)); tratti.push(f2(c));
      }
      return { out, tratti };
    }, { url: dataUrl, COL, RIG, N: d.fig.length, src: MISURA_SCAVO, src2: MISURA_TRATTI });
    if (misure.errore) scaviErrore = misure.errore;
    else {
      for (let i = 0; i < d.fig.length; i++) {
        const q = misure.out[i], f = d.fig[i];
        if (q.vuota || q.bw !== f.bw || q.bh !== f.bh) {
          scaviErrore = `la cella ${i + 1} (${f.nome}) misura ${q.vuota ? 'vuoto' : q.bw + 'x' + q.bh} sul foglio ` +
            `ma la pagina ha dichiarato ${f.bw}x${f.bh}: il PNG e i numeri non parlano della stessa figura`;
          break;
        }
        f.scavo = +q.scavo.toFixed(3);
        f.tratti = misure.tratti[i];
      }
    }
  } else scaviErrore = 'la pagina non ha mandato il foglio a contatto';
  await br.close(); srv.chiudi();
  if (scaviErrore) {
    console.log('SCAVO NON MISURABILE — ' + scaviErrore + '.');
    console.log('Il cancello non stampa un verdetto senza il criterio che decide.');
    process.exit(1);
  }
  return { d, dove };
}
/* quante azioni passano tutti i veti, su una raccolta */
function quanti(d) {
  return d.fig.filter(f => passa(criteri(f, !!STESO[f.clip], 90))).length;
}

(async () => {
  const { d, dove } = await raccogli(false, true);

  const TOT_SPAZZATA = 3 * 4 * d.fig.length;   // 3 corporature x 4 direzioni x 10 azioni

  /* =================================================================
     (a) IL REQUISITO DELLA GIURIA — l'unico numero che decide
     ================================================================= */
  console.log('\n=== SILHOUETTE — dieci azioni, nero pieno, quaranta pixel ===');
  console.log('\n(a) IL REQUISITO DELLA GIURIA — questo, e solo questo, decide verde o rosso.');
  console.log('    Angolo di presentazione, corporatura media. Nominabili richiesti: ' +
    `${NOMINABILI_MIN} su ${d.fig.length}.\n`);
  console.log('       azione                    inchiostro   forma   masse  SCAVO    (arti)');
  let nominabili = 0;
  const daFare = [];
  for (const f of d.fig) {
    const steso = !!STESO[f.clip];
    const c = criteri(f, steso, 90);          // 0,95 rad: nessuna esclusione assiale
    const ok = passa(c);
    if (ok) nominabili++; else daFare.push({ f, steso, c });
    const seg = k => c[k] === null ? '~' : (c[k] ? ' ' : '!');
    console.log(
      `  ${ok ? '  ' : 'X '}${f.nome.padEnd(24)} ` +
      `${f.inchiostro.toFixed(3)}${seg('inchiostro')}     ` +
      `${f.forma.toFixed(2)}${seg('forma')}    ` +
      `${f.masse}${seg('masse')}     ` +
      `${f.scavo.toFixed(3)}${seg('scavo')}    ` +
      `${String(f.arti).padStart(2)}`);
  }
  console.log(`\n  NOMINABILI ${nominabili}/${d.fig.length}   (ne servono ${NOMINABILI_MIN})`);
  const giuriaOK = nominabili >= NOMINABILI_MIN;

  console.log('  (arti) e\' INFORMATIVO e non boccia: sul foglio del provino cieco correva');
  console.log('  all\'incontrario — 1, 1, 13 sulle tre nominate contro 14, 13, 8, 5, 7, 6, 8');
  console.log('  sulle sette no. Vedi il punto (iii) in testa a questo file.');
  if (d.fig.some(f => STESO[f.clip])) {
    console.log('  ~ = criterio non applicabile: masse su una posa distesa (E2, vedi in testa).');
  }

  /* COSA MANCA, in numeri, e SE E' RAGGIUNGIBILE. Per i quattro criteri
     che la spazzata sa misurare la prova di raggiungibilita' e' la stessa
     posa a un altro angolo; per lo SCAVO quella prova non esiste, perche'
     la spazzata non lo misura — e si dice invece di fingerla. */
  let raggiungibili = 0, mai = 0, senzaProva = 0;
  if (daFare.length) {
    console.log('\n  cosa manca, posa per posa (e dove la stessa posa ci arriva gia\'):');
    for (const { f, steso, c } of daFare) {
      for (const k of mancanti(c)) {
        if (k === 'scavo') {
          senzaProva++;
          console.log(`     ${f.nome.padEnd(24)} ${k.padEnd(11)} ${valore(k, f)} — ne chiede ${chiede(k, steso)}` +
            `   (la spazzata non misura lo scavo: nessuna prova di raggiungibilita')`);
          continue;
        }
        const mie = (d.giri || []).filter(g => g.nome === f.nome);
        const bocciate = new Set(mie.map(g => g.corp + '@' + g.yaw));
        const altrove = mie.filter(g => criteri(g, steso, g.yaw)[k] === true)
          .map(g => `${g.yaw}gradi/corp${g.corp}`);
        for (const corp of [0, 1, 2]) for (const yaw of [0, 90, 180, -90])
          if (!bocciate.has(corp + '@' + yaw)) altrove.push(`${yaw}gradi/corp${corp}`);
        if (altrove.length) raggiungibili++; else mai++;
        console.log(`     ${f.nome.padEnd(24)} ${k.padEnd(11)} ${valore(k, f)} — ne chiede ${chiede(k, steso)}` +
          (altrove.length ? `   (ci arriva gia' a ${altrove.slice(0, 3).join(', ')})`
            : `   (mai, in nessuna delle ${TOT_SPAZZATA} combinazioni della spazzata)`));
      }
    }
  }

  /* IDENTITA': l'altro requisito della giuria («mai due giocatori nella
     stessa posa»). E' un test di identita' e nient'altro: il punto (v)
     dice perche' non va letto come somiglianza percettiva. */
  const distOK = d.distanza >= DIST_MIN;
  console.log(`\n  identita': la coppia piu' vicina dista ${d.distanza.toFixed(3)} ` +
    `(minimo ${DIST_MIN}) — ${d.coppia}${distOK ? '' : '   INSUFFICIENTE'}`);
  console.log('  E\' Hamming su griglie normalizzate ognuna alla propria scatola: dice se');
  console.log('  due pose sono LA STESSA, non se un occhio le confonderebbe. Per quello');
  console.log('  c\'e\' il VOCABOLARIO qui sotto.');

  /* =================================================================
     IL VOCABOLARIO — informativo, e stampato per primo fra gli avvisi.
     Undici tratti letti nel telaio comune della cella, a parita' di
     scala reale. Vedi il cappello: dice quali coppie un occhio
     POTREBBE confondere, e non boccia perche' ha falsi positivi noti.
     ================================================================= */
  const voc = vocabolario(d.fig);
  if (voc) {
    console.log(`\n  VOCABOLARIO — quante pose stanno spendendo la stessa parola.`);
    console.log(`  ${voc.cp.length} coppie, mediana ${voc.mediana.toFixed(3)}, ` +
      `la piu' vicina ${voc.cp[0].v.toFixed(3)} ` +
      `(${(voc.cp[0].v / voc.mediana * 100).toFixed(0)}% della mediana).`);
    console.log(`  Sono SEGNALATE le coppie sotto meta' mediana (${voc.soglia.toFixed(3)}).`);
    const mostra = voc.segnalate.length ? voc.segnalate : voc.cp.slice(0, 3);
    console.log(voc.segnalate.length
      ? `\n  ${voc.segnalate.length} COPPIE SEGNALATE — su quali tratti sono d'accordo:`
      : '\n  nessuna coppia segnalata. Le tre piu\' vicine, per sapere dove si lavora:');
    for (const p of mostra) {
      const A = d.fig[p.a].tratti, B = d.fig[p.b].tratti;
      const uguali = TRATTI.filter(k => Math.abs(A[k] - B[k]) <= 0.06);
      console.log(`     ${d.fig[p.a].nome} / ${d.fig[p.b].nome}   ${p.v.toFixed(3)}`);
      console.log(`        d'accordo su ${uguali.length}/${TRATTI.length}: ${uguali.join(' ')}`);
    }
    console.log('\n  INFORMATIVO, non boccia. Sul foglio del 17 agosto questa misura mette');
    console.log('  «carica il tiro / e\' deluso» — la coppia che l\'uomo ha chiamato «la stessa');
    console.log('  sagoma» — terza su quarantacinque, dove la vecchia Hamming la metteva');
    console.log('  decima. Ma su un altro foglio ha segnalato «cammina / esulta», che nessuno');
    console.log('  confonde: ha falsi positivi che non sa riconoscere, e finche\' e\' cosi\'');
    console.log('  ordina e non giudica. Vedi il cappello IL VOCABOLARIO in testa al file.');
  }

  /* =================================================================
     (b) LA SPAZZATA — informativa
     ================================================================= */
  const TOT = TOT_SPAZZATA;
  const troncata = d.giri.length < d.nGiri;
  console.log(`\n(b) LA SPAZZATA — 3 corporature x 4 direzioni x ${d.fig.length} azioni = ${TOT} combinazioni.`);
  console.log('    Informativa: dice dove la sagoma crolla. Non decide. E NON MISURA LO');
  console.log('    SCAVO — il criterio che decide in (a) qui non c\'e\', perche\' si legge');
  console.log('    sul foglio a contatto e il foglio esiste solo all\'angolo di presentazione.');

  /* E1: le combinazioni geometricamente impossibili, NOMINATE */
  const escluse = [];
  for (const nome of NOMI_STESI) for (const yaw of [0, 180]) for (let corp = 0; corp < 3; corp++)
    escluse.push(`${nome} a ${yaw} gradi (corp ${corp})`);
  console.log(`\n    ${escluse.length} COMBINAZIONI ESCLUSE, non bocciate: ` +
    `${NOMI_STESI.join(' e ')} a 0 e 180 gradi, tutte e tre le corporature.`);
  console.log(`    Il corpo giace lungo l'asse della camera: per leggere ${B.formaSteso} di rapporto`);
  console.log(`    forma servirebbe un'estensione laterale di 1,62 m, piu' lunga dell'uomo.`);
  console.log(`    Il tetto della spazzata e' ${TOT - escluse.length}, non ${TOT}.`);

  if (troncata) {
    console.log(`\n    ATTENZIONE: la pagina ha mandato ${d.giri.length} righe su ${d.nGiri}. La`);
    console.log('    ripartizione qui sotto e\' parziale — serve la toppa che toglie');
    console.log('    giri.slice(0,40) da ?banco=silhouette.');
  }

  /* ripartizione per criterio, con le esclusioni gia' tolte */
  let reggono = TOT - escluse.length, ko = 0;
  const per = {}, conta = { inchiostro: 0, forma: 0, masse: 0 };
  for (const g of d.giri) {
    const steso = NOMI_STESI.includes(g.nome);
    const c = criteri(g, steso, g.yaw);
    if (impossibile(c)) continue;               // gia' contata fra le escluse
    if (passa(c)) continue;                     // bocciata solo per criteri non applicabili
    ko++; reggono--;
    per[g.nome] = per[g.nome] || { n: 0, inchiostro: 0, forma: 0, masse: 0 };
    per[g.nome].n++;
    for (const k of mancanti(c)) { conta[k]++; per[g.nome][k]++; }
  }
  console.log(`\n    REGGONO ${reggono} su ${TOT - escluse.length}.  ` +
    `Fuori misura ${ko}: inchiostro ${conta.inchiostro}, forma ${conta.forma}, masse ${conta.masse}.`);
  const ord = Object.keys(per).sort((a, b) => per[b].n - per[a].n);
  if (ord.length) {
    console.log('      azione                   fuori  inch forma masse');
    for (const k of ord) {
      const v = per[k];
      console.log(`      ${k.padEnd(24)} ${String(v.n).padStart(3)}    ` +
        `${String(v.inchiostro).padStart(3)} ${String(v.forma).padStart(4)} ${String(v.masse).padStart(5)}`);
    }
  }

  /* --profilo stampa la scansione riga per riga: quando il banco dice
     «zero strozzature» questa e' l'unica domanda che resta */
  if (process.argv.includes('--profilo')) {
    for (const f of d.fig) {
      console.log(`\n  ${f.nome} — scatola ${f.bw}x${f.bh}`);
      console.log('     ' + (f.prof || []).join(' '));
    }
  }
  if (dove) console.log(`\n  foglio a contatto: ${dove}`);
  if (ROMPI) console.log('  (con --rompi il foglio INTERO finisce in una cartella a parte e quello del\n' +
    '   provino, in foto-figure2-dopo, non si tocca. Il foglio storpiato non si scrive.)');
  /* LA CHIAVE STA SOTTO, SEPARATA: al provino umano si mostra il PNG e
     basta. Una chiave stampata accanto alle figure e' un provino che si
     autorisponde. */
  console.log('\n  chiave di risposta (NON mostrarla a chi fa il provino):');
  console.log('     ' + d.fig.map((f, i) => (i + 1) + '. ' + f.nome).join('  ·  '));

  /* =================================================================
     (c) LA PROVA DI ROTTURA — solo con --rompi.
     Un cancello che non sa fallire non e' un cancello, e' un timbro.
     Qui la stessa pagina si serve una seconda volta con le braccia
     dell'esultanza richiuse lungo il corpo (sostituzione in memoria: su
     disco non cambia un byte) e si guarda se il numero SCENDE e se la
     posa storpiata viene BOCCIATA. Se non succede, la prova fallisce e
     lo strumento esce rosso anche se le figure vere andavano bene.
     ================================================================= */
  let rotturaOK = true;
  if (ROMPI) {
    const r = await raccogli(true, false);
    const iE = d.fig.findIndex(f => f.clip === 'esultanza');
    const a = d.fig[iE], b2 = r.d.fig[iE];
    const nRotto = quanti(r.d);
    console.log('\n(c) LA PROVA DI ROTTURA — l\'esultanza servita con le braccia richiuse.');
    console.log('    posa                     inchiostro   forma   masse   SCAVO   esito');
    const stampa = (et, f) => {
      const c = criteri(f, false, 90);
      console.log(`    ${et.padEnd(24)} ${f.inchiostro.toFixed(3)}      ${f.forma.toFixed(2)}    ` +
        `${f.masse}      ${f.scavo.toFixed(3)}   ${passa(c) ? 'nominabile' : 'BOCCIATA (' + mancanti(c).join(', ') + ')'}`);
    };
    stampa('esulta, com\'e\'', a);
    stampa('esulta, storpiata', b2);
    console.log(`    nominabili: ${nominabili} -> ${nRotto}   ·   distinzione: ` +
      `${d.distanza.toFixed(3)} -> ${r.d.distanza.toFixed(3)}`);
    const bocciata = !passa(criteri(b2, false, 90));
    const scesa = nRotto < nominabili;
    rotturaOK = bocciata && scesa;
    console.log(rotturaOK
      ? '    PROVA SUPERATA: la posa storpiata viene bocciata e il conto scende.'
      : '    PROVA FALLITA: rompere una posa non ha cambiato il verdetto. Finche\' questa\n' +
        '    riga dice FALLITA, il numero (a) non e\' una misura — e\' un timbro.');
  }

  /* =================================================================
     IL VERDETTO — solo (a), la distinzione accanto, e (con --rompi) la
     prova di rottura
     ================================================================= */
  if (giuriaOK && distOK && rotturaOK) {
    console.log(`\nVERDE: ${nominabili} azioni su ${d.fig.length} nominabili all'angolo di ` +
      `presentazione (ne servono ${NOMINABILI_MIN}), distinzione ${d.distanza.toFixed(3)}.`);
    console.log('Resta il PROVINO CIECO, che e\' il giudice vero, e VERDE qui non vuol dire');
    console.log('verde li\': al secondo provino, con nove celle dichiarate nominabili da');
    console.log('questo banco, l\'uomo ne ha nominata UNA correttamente e con sicurezza.');
    console.log('Quello che il banco sa fare e\' dire se una sagoma ha le proprieta\' senza');
    console.log('le quali non puo\' essere letta, e — da adesso — se due sagome stanno');
    console.log('spendendo la stessa parola. Non sa dire se la parola e\' quella giusta.\n');
  } else {
    console.log(`\nROSSO: ${nominabili} azioni su ${d.fig.length} nominabili (ne servono ` +
      `${NOMINABILI_MIN}), distinzione ${distOK ? 'ok' : 'INSUFFICIENTE'}` +
      (ROMPI ? `, prova di rottura ${rotturaOK ? 'superata' : 'FALLITA'}` : '') + '.');
    if (!giuriaOK) console.log(`Mancano ${NOMINABILI_MIN - nominabili} pose. L'elenco «cosa manca» qui ` +
      `sopra dice di quanto, criterio per criterio:\n${raggiungibili} di quegli scarti ` +
      'la stessa posa li colma gia\' a un altro angolo — sono lavoro di\ndisegno, non muri. ' +
      `${mai} non ricorrono mai nelle ${TOT_SPAZZATA} combinazioni della spazzata.\n` +
      `${senzaProva} riguardano lo SCAVO, per cui una prova di raggiungibilita' non esiste:\n` +
      'la spazzata non lo misura, e su quelli si lavora guardando il foglio.\n' +
      'Le combinazioni impossibili per geometria stanno tutte in (b) e non sono\ncontate qui.\n');
    process.exit(1);
  }
})();
