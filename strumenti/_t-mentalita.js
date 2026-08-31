/* =====================================================================
   _t-mentalita.js — LA MENTALITA' E' IL MODULO CHE SI ALLUNGA O SI
   ACCORCIA (27 agosto 2026).

   IL PUNTO DI PARTENZA. Il gioco ha UN modulo per taglia, cablato in
   TAGLIE[..].modulo, e zero tattiche: chi gioca non ha nessuna leva sul
   comportamento della propria squadra. Il concorrente ha 34 formazioni,
   cinque preset (Attacking, Control, Counter, Defensive, Custom), otto
   cursori di stile, sei di posizionamento sdoppiati utente/macchina e il
   cambio di modulo A PARTITA IN CORSO
   (FIFAAudio::Event::TeamFormationSwitchInGame, distinto da
   ...SwitchPreMatch).

   COSA NON COPIAMO, E PERCHE'. Un catalogo di formazioni su un canvas 2D
   visto da sopra e' un elenco che nessuno sa leggere. Il nostro modulo a
   undici ha le tre linee a fx 0,13 / 0,27 / 0,40: lo scalino fra una
   linea e l'altra e' 0,13-0,14 di campo, quindi spostare UN uomo di
   mezzo scalino — che e' tutta la differenza fra due sigle vicine — vale
   circa 0,07 di campo, cioe' 160 unita' su un campo largo 2300, su un
   uomo su dieci. Su un telefono in mano quello non si vede e non si
   sceglie.
   Le due cose che si vedono da sopra, in due dita di schermo, sono
   QUANTO E' ALTA la squadra e QUANTO E' LARGA. Sono anche le due che
   spostano i numeri (vedi NUMERI, in fondo).
   Percio' qui non nasce un catalogo: nasce una MENTALITA' che prende il
   modulo che c'e' gia' e lo sposta, lo allarga e lo allunga. A undici
   contro undici resta un 4-4-2 — le linee sono sempre quattro, quattro e
   due, e questa toppa non sposta nessuno da una linea all'altra — ma
   passa da un 4-4-2 corto e basso a uno lungo e alto: MISURATO sulle
   caselle di formation(), la profondita' del blocco va da 484 unita' in
   DIFESA a 700 in ATTACCO (0,21 e 0,30 di campo) e la larghezza da 694 a
   919. Il numero e' uno, quindi si puo' cambiare DALLA PAUSA a partita in
   corso, che e' l'unica cosa del cambio-modulo in corsa che valga
   davvero la pena di avere.

   TRE E NON CINQUE. I preset del concorrente sono cinque piu' Custom. Su
   un telefono, con la partita ferma e un pollice, tre voci si leggono in
   un colpo d'occhio e cinque no. E tre e' anche il minimo che permette
   di avere UNA voce neutra: EQUILIBRIO e' il gioco di oggi AL BIT.

   ============================ IL BIT ============================
   Ogni campo della riga EQUILIBRIO vale 0 oppure 1, e ogni formula e'
   scritta in modo che con 0 e 1 restituisca ESATTAMENTE l'espressione di
   prima, non una uguale a meno di virgola mobile:
     fx  ->  m.fx + (m.fx-pivot)*(blocco-1) + linea      (x*0=0, x+0=x)
     fy  ->  m.fy*largo                                   (x*1=x)
     ancora della copertura -> 0.45+0 = 0.45 e 1-0.45 === 0.55 (verificato
       in doppia precisione: node -e "console.log((1-0.45)===0.55)" -> true)
     punta -> PUNTA_X+0, e 1-(PUNTA_X+0) e' lo stesso double di 1-PUNTA_X
     limite dell'ultimo uomo -> 0.46+0 e 0.54-0
     slancio -> *1
   MISURATO, non affermato, su tutte e tre le taglie: il gioco spedito e
   il gioco toppato danno lo STESSO vettore di eventi, partita per
   partita, nel confronto crudo dei due --json.
     taglia 5    100 partite, semi 20260803..20260902   0 differenze
     taglia 7     60 partite, semi 20260803..20260862   0 differenze
     taglia 11    40 partite, semi 20260803..20260842   0 differenze

   ==================== IL CONTO DEI Math.random() ====================
   ZERO sorteggi aggiunti, zero spostati. Nessuna delle sei leve tocca
   una riga che pesca un numero: sono tutte moltiplicazioni e somme su
   bersagli gia' calcolati. In particolare NON si tocca
   `p.contieni = Math.random()<0.55` dentro il ramo del pressatore, che
   pure sarebbe la leva di pressing piu' diretta — e la ragione e' un'
   altra e va scritta: quel ramo e' dentro `isCpuTeam && D.standoff>0`,
   cioe' vive SOLO per le squadre guidate dalla macchina. Il banco gira
   CPU contro CPU, quindi la leva si vedrebbe nella misura e NON
   arriverebbe mai alla squadra di chi gioca. Una leva che il banco sente
   e il giocatore no e' un numero che mente: fuori.

   ======================== LE SEI LEVE ========================
   Tutte e sei agiscono su codice che esiste gia' e che vale per TUTTE E
   DUE le squadre, umana o macchina (nessuna e' dietro isCpuTeam):

     linea    sposta il modulo intero verso la porta avversaria, in
              frazioni di FW. Tocca: le posizioni al calcio d'inizio, il
              rientro dopo un'espulsione, e — la piu' pesante — l'ANCORA
              DI RUOLO che vale il 45% del bersaglio di chi copre.
     blocco   allunga o accorcia le linee attorno alla loro fx media
              (il "pivot" del modulo, contato una volta per taglia).
              E' quello che trasforma il modulo invece di traslarlo.
     largo    moltiplica le fy: la squadra si apre o si stringe.
     ancora   quanto pesa la casella di formazione contro il punto
              d'intercetto, nel ramo della copertura. Piu' ancora =
              tiene la zona; meno ancora = va sulla palla.
     slancio  quanto lungo va il compagno che si offre (il ramo dello
              smarcato) e quanto lontano corre un compagno CHIAMATO dal
              dito. Contropiede compreso.
     punta    dove staziona la punta (solo taglie 7 e 11), come delta su
              PUNTA_X — che resta l'unico posto dove quel numero e'
              scritto.

   I VALORI SONO SCELTI, NON MISURATI, e vanno letti cosi': sono la
   POSTURA che la parola in copertina promette. Cio' che e' misurato e'
   l'EFFETTO che producono, ed e' scritto qui sotto.

   ==================== COME SI RIFA' LA MISURA ====================
   Il cancello di questa toppa e' strumenti/_q-mentalita.js: 33 controlli
   sulla forma della squadra, sui comandi, sulla neutralita' della voce
   di mezzo e — dal 28 agosto — sul fatto che la schermata non menta
   dopo un cambio fatto in corsa. Sul gioco spedito dice «niente da
   misurare» invece di fallire.
     node strumenti/_q-mentalita.js --gioco fuori/ment.html

   E accanto c'e' una sonda che fa una cosa sola, camminando sui bottoni
   veri: partita -> ESC -> tocco su MENTALITA' -> ABBANDONA -> menu ->
   GIOCA -> 1 GIOCATORE, e chiede se la pastiglia accesa, il salvataggio
   e la squadra in campo dicono la stessa cosa. Esiste perche' la bugia
   che cerca vive nel salto fra due schermate, e in memoria non c'e'.
     node strumenti/_sonda-ment-dito.js --gioco fuori/ment.html

     node strumenti/_t-mentalita.js --out fuori/ment.html
     node strumenti/_t-mentalita.js --out fuori/ment-D.html  --banco 0
     node strumenti/_t-mentalita.js --out fuori/ment-A.html  --banco 2
     node strumenti/_t-mentalita.js --out fuori/ment-AD.html --banco 2,0
     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803 --gioco fuori/ment-D.html
     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803 --gioco fuori/ment-A.html
     node strumenti/_eventi.js --taglia 11 --partite 100 --seme 20260803 --gioco fuori/ment-AD.html
   (EQUILIBRIO non ha bisogno di un file suo: nel banco senza avversario
   dichiarato il gioco toppato E' EQUILIBRIO al bit, quindi la riga
   EQUILIBRIO e' il gioco del repo misurato con gli stessi semi.)
   --banco N e' un ARMAMENTO DA BANCO: forza le due squadre sulla stessa
   mentalita' N, perche' CPU contro CPU nessuno apre il menu. --banco N,M
   ne mette una contro l'altra, ed e' l'unico modo di far dire qualcosa al
   POSSESSO: a mentalita' uguali le due squadre sono simmetriche e il
   possesso e' 50/50 per costruzione, non per merito.
   Non si spedisce: --banco e --dentro insieme sono rifiutati.

   I RISULTATI: nel blocco NUMERI, in fondo a questo file.

   ==================== IL FATTO CHE NON EMETTO ====================
   Il cambio di mentalita' a partita in corso e' esattamente un fatto del
   REGISTRO che il committente sta scrivendo: {quando: G.timeLeft, che
   cosa: 'mentalita', chi: squadra 0, dove: -, esito: id nuovo}. Qui NON
   si costruisce nessun registro: c'e' un commento nel punto giusto e il
   collegamento si fara' dopo.

   uso:  node strumenti/_t-mentalita.js --out fuori/ment.html
         node strumenti/_t-mentalita.js --out fuori/ment-A.html --banco 2
         node strumenti/_t-mentalita.js --out fuori/ment-AD.html --banco 2,0
         node strumenti/_t-mentalita.js --elenco
         node strumenti/_t-mentalita.js --dentro
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

/* ---------------------------------------------------------------- 1 */
{
  nome: '1/23 CSS: le pastiglie di mentalita\' vestono come le altre',
  cerca: `.diff,.tbtn,.taglia{`,
  metti: `.diff,.tbtn,.taglia,.ment{`,
},

/* ---------------------------------------------------------------- 1b */
{
  nome: '1b/23 il pannello di pausa SCORRE, se no il bottone per uscire va sotto il bordo',
  cerca: `#pausa.ov::after{content:none}`,
  metti:
`#pausa.ov::after{content:none}
/* =====================================================================
   IL PANNELLO DI PAUSA DEVE POTER SCORRERE (28 agosto 2026).

   Questa toppa aggiunge una QUARTA voce alla pausa, e una voce costa 51
   px (36 di bottone piu' 15 di spazio). Il pannello passa da 424 a 475
   px quando il blocco del possesso e' visibile — e il possesso compare
   da solo dopo POSSESSO_MIN campioni, cioe' in ogni pausa dopo la prima.
   Su uno schermo alto 412 (915x412, il telefono in orizzontale che il
   progetto misura) il bottone ABBANDONA finisce col centro a y=433:
   SOTTO IL BORDO. Il tocco non e' consegnabile, e chi ha messo in pausa
   non ha modo di uscire dalla partita.

   Misurato da un critico avversario sul percorso vero del dito, non
   dedotto: gioco spedito ABBANDONA a y 358..406, centro 382, il tocco
   esce; con questa toppa e senza questa riga y 409..457, centro 433, il
   tocco non arriva. A 812x375 e 740x360 va sotto anche la voce nuova.

   La cura non toglie niente e non sposta niente: quando il pannello non
   ci sta, si scorre. L'allineamento «safe center» era gia' li' e
   impedisce il taglio in alto; senza overflow-y:auto pero' cio' che
   sfora in basso non e' raggiungibile in nessun modo.

   PERCHE' SU #pausa E NON SU .ov: le altre schermate di servizio hanno
   il loro contenuto e i loro banchi, e una regola generale andrebbe
   rimisurata su tutte. Qui il difetto e' misurato, la scena e' una, e la
   riga sta accanto alla voce che l'ha causato — cosi' chi un domani
   toglie la voce trova anche la sua cura. */
#pausa.ov{overflow-y:auto;overscroll-behavior:contain}
#pausa .box{margin:auto;padding-top:12px;padding-bottom:12px}
`,
},

/* ---------------------------------------------------------------- 1c */
{
  nome: '1c/24 su uno schermo basso il pannello si stringe invece di chiedere di scorrere',
  /* L'ANCORAGGIO E' DOPO LE REGOLE CHE DEVE BATTERE, e non e' un
     dettaglio: la prima stesura metteva questa media query accanto alla
     riga dello scorrimento, quaranta righe SOPRA le regole
     «#pausa .menu-voci{gap:15px}» e «#pausa .pannello{padding:22px 22px 26px}».
     Stessa specificita', quindi vinceva l'ultima scritta — cioe' quella
     di prima — e la cura recuperava sei pixel invece di sessanta. In CSS
     l'ordine e' parte della regola: una toppa che lo ignora scrive codice
     che non fa niente accanto a un commento che dice che lo fa. */
  cerca: `#pausa .pannello{padding:22px 22px 26px}`,
  metti:
`#pausa .pannello{padding:22px 22px 26px}
/* =====================================================================
   SU UNO SCHERMO BASSO IL PANNELLO SI STRINGE, invece di chiedere di
   scorrere (28 agosto 2026).

   Lo scorrimento dichiarato piu' su e' la rete di sicurezza: fa si' che
   nessun bottone diventi irraggiungibile. Ma «si esce solo dopo aver
   scorso» non e' una pausa usabile — chi la apre vede quattro voci, non
   vede il bottone per uscire, e niente gli dice che ce n'e' un quinto
   sotto il bordo. Misurato con la sola rete: ABBANDONA restava col
   centro a y=428 su uno schermo alto 412.

   Servono una sessantina di pixel, e si trovano senza togliere una sola
   voce: lo spazio fra le voci da 15 a 8, il fianco del pannello da 22/26
   a 12/18/14, l'altezza di una voce a 32 con meno imbottitura.

   La soglia e' l'ALTEZZA, non la larghezza: il telefono in orizzontale
   e' alto 412, in verticale e' alto 915 e non ha nessun bisogno di
   stringersi. Chi misura in verticale non vede cambiare niente. */
@media (max-height:460px){
  #pausa .menu-voci{gap:8px}
  #pausa .pannello{padding:12px 18px 14px}
  #pausa .menu-voci .voce{min-height:32px;padding-top:5px;padding-bottom:5px}
  #pausa .pausastat{margin-top:6px}
  #pausa .box{padding-top:6px;padding-bottom:6px}
}`,
},

/* ---------------------------------------------------------------- 2 */
{
  nome: '2/22 CSS: lo stato scelto e la riga piccola',
  cerca: `.taglia.sel small{opacity:.9}`,
  metti:
`.taglia.sel small{opacity:.9}
/* le tre mentalita' portano la stessa pastiglia delle tre taglie: sono
   la stessa specie di scelta (una fra tre, ricordata nel salvataggio) e
   due vestiti diversi per la stessa specie sono un'invenzione gratuita */
.ment small{display:block;font-weight:400;font-size:10px;letter-spacing:.14em;opacity:.75;margin-top:2px}
.ment.sel{color:#12210f;background:var(--gesso);border-color:var(--gesso);font-weight:700}
.ment.sel small{opacity:.9}`,
},

/* ---------------------------------------------------------------- 3 */
{
  nome: '3/22 GIOCA: la riga delle tre mentalita\'',
  cerca:
`        <div class="diff-row" id="taglieRow">
          <button class="taglia sel" data-t="5">5 contro 5 <small>la gabbia</small></button>
          <button class="taglia" data-t="7">7 contro 7 <small>il campetto</small></button>
          <button class="taglia" data-t="11">11 contro 11 <small>il campo grande</small></button>
        </div>`,
  metti:
`        <div class="diff-row" id="taglieRow">
          <button class="taglia sel" data-t="5">5 contro 5 <small>la gabbia</small></button>
          <button class="taglia" data-t="7">7 contro 7 <small>il campetto</small></button>
          <button class="taglia" data-t="11">11 contro 11 <small>il campo grande</small></button>
        </div>
        <!-- LA MENTALITA'. Sta QUI, sotto la rosa, perche' e' la stessa
             specie di scelta: una fra tre, che vale per tutti i modi di
             gioco e resta nel salvataggio. La riga piccola dice che cosa
             fa alla squadra, non come si chiama la scuola di pensiero:
             "blocco basso e stretto" e' una cosa che si vede in campo,
             "Counter" e' una parola. -->
        <div class="eti">Mentalit&agrave;</div>
        <div class="diff-row" id="mentRow">
          <button class="ment" data-m="0">Difesa <small>blocco basso e stretto</small></button>
          <button class="ment sel" data-m="1">Equilibrio <small>il modulo com'&egrave; scritto</small></button>
          <button class="ment" data-m="2">Attacco <small>linea alta e larga</small></button>
        </div>`,
},

/* ---------------------------------------------------------------- 4 */
{
  nome: '4/22 PAUSA: la voce che cambia mentalita\' a partita in corso',
  cerca: `      <button class="voce sw" id="btnPauseAudio">AUDIO: ON</button>`,
  metti:
`      <button class="voce sw" id="btnPauseAudio">AUDIO: ON</button>
      <!-- IL CAMBIO IN CORSA. E' l'unico posto da cui si cambia mentre si
           gioca, ed e' giusto che sia la PAUSA: in campo l'interfaccia ha
           cinque elementi persistenti dichiarati (pausa, i due punteggi,
           il cronometro, la minimappa) e un sesto adesivo con scritto
           ATTACCO li renderebbe sei. Come si vede allora che la squadra
           ha cambiato postura? Si vede perche' i dieci punti sulla
           minimappa e i dieci corpi in campo si spostano tutti insieme,
           che e' il modo in cui lo si vede anche allo stadio. -->
      <button class="voce sw" id="btnPauseMent">MENTALIT&Agrave;: EQUILIBRIO</button>`,
},

/* ---------------------------------------------------------------- 5 */
{
  nome: '5/22 la tabella delle mentalita\', accanto ai moduli che rimodella',
  cerca: `let TAGLIA = 5, KPASSO = 1;`,
  metti:
`/* =====================================================================
   LE TRE MENTALITA' — il modulo che si allunga o si accorcia.

   Non e' un catalogo di formazioni: e' UNA postura applicata al modulo
   che la taglia gia' porta. Il 4-4-2 a undici resta un 4-4-2 — nessuno
   passa da una linea all'altra — ma in DIFESA e' basso e corto e in
   ATTACCO alto e lungo. MISURATO sulle caselle che questa funzione
   restituisce, a 11 contro 11: il blocco e' profondo 484 unita' in
   DIFESA, 621 in EQUILIBRIO, 700 in ATTACCO, e largo 694 / 806 / 919.
   Sono le due grandezze di una formazione che su un canvas visto da
   sopra si VEDONO, e sono le due che spostano i numeri. Spostare invece
   un uomo di mezzo scalino fra due linee — che e' tutta la differenza
   fra due sigle vicine — vale 0,07 di campo su un uomo su dieci: quello
   non si vede e non si sceglie. Il conto e i numeri per intero stanno
   in strumenti/_t-mentalita.js.

   OGNI CAMPO DI EQUILIBRIO E' 0 OPPURE 1, e le formule sono scritte
   perche' con 0 e 1 restituiscano l'espressione di prima allo STESSO
   double: x+0 e' x, x*1 e' x, e (m.fx-pivot)*(1-1) e' zero. Non e' una
   pulizia formale — e' la garanzia che chi non tocca niente giochi al
   bit la partita di ieri, e che i cancelli tarati su quella partita
   restino veri.

   linea    trasla il modulo verso la porta avversaria (frazioni di FW)
   blocco   allunga (>1) o accorcia (<1) le linee attorno alla fx media
   largo    moltiplica le fy: squadra aperta o stretta
   ancora   si somma allo 0,45 con cui la casella di formazione pesa nel
            bersaglio di chi copre. Piu' alto = tiene la zona
   slancio  moltiplica quanto lungo va chi si offre e chi e' chiamato
   punta    delta su PUNTA_X, la stazione della punta (taglie 7 e 11)

   I SEI VALORI SONO SCELTI, NON MISURATI: sono la postura che la parola
   promette. Cio' che e' misurato e' l'effetto, e sta in
   strumenti/_t-mentalita.js sotto NUMERI.
   ===================================================================== */
/* l'INDICE nell'array E' l'identificativo (0 DIFESA, 1 EQUILIBRIO, 2
   ATTACCO): e' quello che finisce nel salvataggio e in G.ment, e non c'e'
   un campo 'id' che lo ripeta — due scritture dello stesso numero sono
   due scritture che un giorno divergono. L'ordine, percio', non si
   cambia: il salvataggio di chi gioca lo legge. */
const MENT = [
  { n:'DIFESA',     linea:-0.07, blocco:0.78, largo:0.86, ancora:+0.17, slancio:0.70, punta:-0.08 },
  { n:'EQUILIBRIO', linea: 0,    blocco:1,    largo:1,    ancora: 0,    slancio:1,    punta: 0    },
  { n:'ATTACCO',    linea:+0.07, blocco:1.22, largo:1.14, ancora:-0.15, slancio:1.35, punta:+0.08 },
];
function mentValida(v){ return (v===0||v===1||v===2) ? v : 1; }
/* la mentalita' di una squadra. Il ripiego e' EQUILIBRIO e non l'indice
   zero: un salvataggio vecchio o un avversario senza il campo 'ment' non
   deve ritrovarsi a difendere senza averlo chiesto. */
function mentDi(t){ return MENT[mentValida(G.ment ? G.ment[t] : 1)]; }
/* IL PERNO DEL MODULO — la fx media dei giocatori di movimento, attorno
   a cui le linee si allungano o si accorciano. Contato una volta per
   taglia e appeso alla taglia stessa: e' un dato del modulo, non uno
   stato di partita, e un ciclo su undici voci per fotogramma sarebbe uno
   spreco su un telefono che ha 16 ms. */
function pernoModulo(T){
  if(T._perno===undefined){
    let s=0,n=0;
    for(const m of T.modulo) if(!m.gk){ s+=m.fx; n++; }
    T._perno = n ? s/n : 0.25;
  }
  return T._perno;
}
let TAGLIA = 5, KPASSO = 1;`,
},

/* ---------------------------------------------------------------- 6 */
{
  nome: '6/22 formation() legge la mentalita\'',
  cerca:
`  return TAGLIE[TAGLIA].modulo.map(m => m.gk
    ? [gl + mx*40, FH/2]               // portiere, sulla linea
    : [gl + mx*FW*m.fx, FH/2 + FH*m.fy]);`,
  metti:
`  /* LA MENTALITA' RIMODELLA IL MODULO, e lo fa QUI perche' qui e'
     l'unico posto dove il modulo diventa coordinate: cosi' la postura
     arriva insieme al calcio d'inizio, al rientro di un espulso e —
     soprattutto — all'ANCORA DI RUOLO, che vale il 45% del bersaglio di
     chi copre ed e' la ragione per cui la squadra tiene una forma
     invece di ammucchiarsi sul pallone.
     Il portiere NON si muove di un'unita': quaranta dalla propria linea
     e' una regola di sicurezza, non una tattica.
     La forbice [0,06; 0,48] esiste per due ragioni sole: nessuno finisce
     dentro la propria porta, e al calcio d'inizio nessuno sconfina nella
     meta' campo avversaria. Con EQUILIBRIO nessuna fx del gioco la tocca
     (le sei scritte oggi vanno da 0,13 a 0,43), quindi non cambia un
     bit. */
  const T = TAGLIE[TAGLIA], M = mentDi(team), pv = pernoModulo(T);
  return T.modulo.map(m => m.gk
    ? [gl + mx*40, FH/2]               // portiere, sulla linea
    : [gl + mx*FW*clamp(m.fx + (m.fx-pv)*(M.blocco-1) + M.linea, 0.06, 0.48),
       FH/2 + FH*m.fy*M.largo]);`,
},

/* ---------------------------------------------------------------- 7 */
{
  nome: '7/22 il salvataggio ricorda la mentalita\'',
  cerca: `    taglia:5,                      // taglia di rosa dell'amichevole: 5, 7 o 11`,
  metti:
`    taglia:5,                      // taglia di rosa dell'amichevole: 5, 7 o 11
    /* 1 = EQUILIBRIO. Il valore di serie e' la voce neutra, e la voce
       neutra e' il gioco di prima al bit: chi installa oggi non trova
       una partita diversa da quella di ieri per una scelta che non ha
       fatto. */
    mentalita:1,`,
},

/* ---------------------------------------------------------------- 8 */
{
  nome: '8/22 il salvataggio rilegge SOLO 0, 1 o 2',
  cerca: `    if([5,7,11].indexOf(j.taglia)>=0) s.taglia=j.taglia;`,
  metti:
`    if([5,7,11].indexOf(j.taglia)>=0) s.taglia=j.taglia;
    if(j.mentalita===0||j.mentalita===1||j.mentalita===2) s.mentalita=j.mentalita;`,
},

/* ---------------------------------------------------------------- 9 */
{
  nome: '9/22 startMatch carica le due mentalita\'',
  cerca:
`  G.brain=[{stato:'CONTESA',t:0,ruoloT:0,ruoli:{},transizione:0},
           {stato:'CONTESA',t:0,ruoloT:0,ruoli:{},transizione:0}];`,
  metti:
`  /* LE DUE PANCHINE. La tua e' la scelta salvata; quella di fronte viene
     dalla squadra avversaria, che una postura ce l'aveva gia' scritta in
     italiano da mesi ('difesa chiusa, zero rischi', 'pressing alto, non
     ti fa respirare') e non la giocava. Adesso la gioca. Senza avversario
     dichiarato — l'amichevole contro CPU e i due giocatori — la seconda
     panchina resta EQUILIBRIO, che e' la partita di sempre al bit. */
  G.ment=[mentValida(SAVE.mentalita), mentValida(opts.opp ? opts.opp.ment : 1)];
  G.brain=[{stato:'CONTESA',t:0,ruoloT:0,ruoli:{},transizione:0},
           {stato:'CONTESA',t:0,ruoloT:0,ruoli:{},transizione:0}];`,
},

/* ------------------------------------------------------- 10..12 (rosa) */
/* le dieci squadre di quartiere giocano la postura che avevano gia'
   scritta. Tre ancoraggi e non dieci perche' le righe sono in tre
   gruppi contigui, separati dai commenti sulle tinte delle divise. */
{
  nome: '10/22 le prime quattro squadre di quartiere hanno una panchina',
  cerca:
`  { n:'GASOMETRO',     c1:'#ff9d2e', c2:'#7a4200', pat:2, forza:7, stile:'gioco fisico, tanti contrasti' },
  { n:'MOLO 4',        c1:'#39d3e6', c2:'#0f6c7a', pat:1, forza:5, stile:'palla a terra, ritmo lento' },
  { n:'BORGO ALTO',    c1:'#c58aff', c2:'#5b2a8a', pat:0, forza:8, stile:'pressing alto, non ti fa respirare' },
  { n:'CASE NUOVE',    c1:'#f2f5ef', c2:'#5a6a60', pat:1, forza:3, stile:'squadra di ragazzini, corre e basta' },`,
  metti:
`  /* ment = la mentalita' con cui scendono in campo (0 DIFESA, 1
     EQUILIBRIO, 2 ATTACCO). NON e' un dato nuovo: e' la traduzione in
     numero della frase che ogni squadra si porta dietro dal primo
     giorno. 'pressing alto' e 'corre e basta' sono 2, 'difesa chiusa' e
     'aspettano l'errore' sono 0, e chi non dichiara ne' l'una ne'
     l'altra cosa resta 1. Sono tre, quattro e tre: il torneo ne sorteggia
     sette su dieci, quindi al massimo tre delle sette difendono e un
     tabellone di sole muraglie non puo' uscire. */
  { n:'GASOMETRO',     c1:'#ff9d2e', c2:'#7a4200', pat:2, forza:7, ment:1, stile:'gioco fisico, tanti contrasti' },
  { n:'MOLO 4',        c1:'#39d3e6', c2:'#0f6c7a', pat:1, forza:5, ment:1, stile:'palla a terra, ritmo lento' },
  { n:'BORGO ALTO',    c1:'#c58aff', c2:'#5b2a8a', pat:0, forza:8, ment:2, stile:'pressing alto, non ti fa respirare' },
  { n:'CASE NUOVE',    c1:'#f2f5ef', c2:'#5a6a60', pat:1, forza:3, ment:2, stile:'squadra di ragazzini, corre e basta' },`,
},
{
  nome: '11/22 le quattro di mezzo',
  cerca:
`  { n:'PONTE ROSSO',   c1:'#ff9d84', c2:'#a8443a', pat:2, forza:9, stile:'i favoriti: tirano da ovunque' },
  { n:'SANTA FURIA',   c1:'#ffb020', c2:'#8a6a10', pat:1, forza:6, stile:'ripartenze, aspettano l\\'errore' },
  { n:'PRATI BASSI',   c1:'#3fe6b0', c2:'#0f7a58', pat:0, forza:4, stile:'difesa chiusa, zero rischi' },
  { n:'TORRE VECCHIA', c1:'#a9b7c6', c2:'#45525e', pat:1, forza:6, stile:'vecchi volponi, gestiscono il tempo' },`,
  metti:
`  { n:'PONTE ROSSO',   c1:'#ff9d84', c2:'#a8443a', pat:2, forza:9, ment:2, stile:'i favoriti: tirano da ovunque' },
  { n:'SANTA FURIA',   c1:'#ffb020', c2:'#8a6a10', pat:1, forza:6, ment:0, stile:'ripartenze, aspettano l\\'errore' },
  { n:'PRATI BASSI',   c1:'#3fe6b0', c2:'#0f7a58', pat:0, forza:4, ment:0, stile:'difesa chiusa, zero rischi' },
  { n:'TORRE VECCHIA', c1:'#a9b7c6', c2:'#45525e', pat:1, forza:6, ment:0, stile:'vecchi volponi, gestiscono il tempo' },`,
},
{
  nome: '12/22 le ultime due',
  cerca:
`  { n:'STAZIONE FC',   c1:'#ffa8c0', c2:'#c25878', pat:2, forza:5, stile:'discontinui: o benissimo o malissimo' },
  { n:'MERCATO VERDE', c1:'#7ddf3f', c2:'#2f7a10', pat:1, forza:7, stile:'tiro da fuori come religione' },`,
  metti:
`  { n:'STAZIONE FC',   c1:'#ffa8c0', c2:'#c25878', pat:2, forza:5, ment:1, stile:'discontinui: o benissimo o malissimo' },
  { n:'MERCATO VERDE', c1:'#7ddf3f', c2:'#2f7a10', pat:1, forza:7, ment:1, stile:'tiro da fuori come religione' },`,
},

/* --------------------------------------------------------------- 13 */
{
  nome: '13/22 la linea dell\'ultimo uomo sale e scende con la mentalita\'',
  cerca: `      const limite = myGoalX===0 ? FW*0.46 : FW*0.54;`,
  metti:
`      /* LA LINEA DIFENSIVA, e adesso e' una scelta. Lo 0,46 di sempre e'
         il tetto oltre cui l'ultimo uomo non accompagna l'azione; con
         DIFESA scende a 0,39 e con ATTACCO sale a 0,53, cioe' appena
         oltre la meta' campo. E' lo stesso numero che sposta il modulo
         intero (M.linea): la linea e il blocco salgono insieme, se no
         l'ultimo uomo si stacca dai suoi. */
      const limite = myGoalX===0 ? FW*(0.46+mentDi(myTeam).linea) : FW*(0.54-mentDi(myTeam).linea);`,
},

/* --------------------------------------------------------------- 14 */
{
  nome: '14/22 lo slancio di chi si offre',
  cerca: `      const slancio = ((B && B.transizione>0) ? 300 : 170)*KPASSO;`,
  metti: `      const slancio = ((B && B.transizione>0) ? 300 : 170)*KPASSO*mentDi(myTeam).slancio;`,
},

/* --------------------------------------------------------------- 15 */
{
  nome: '15/22 lo slancio di chi e\' stato chiamato dal dito',
  cerca: `  return ((B && B.transizione>0) ? 300 : 170)*KPASSO;`,
  metti:
`  /* la stessa postura vale per il compagno CHIAMATO (L2.3): se non
     valesse, la squadra in ATTACCO andrebbe lunga da sola e corta
     quando la chiami tu, che e' il modo migliore per far sembrare la
     mentalita' una didascalia */
  return ((B && B.transizione>0) ? 300 : 170)*KPASSO*mentDi(t).slancio;`,
},

/* --------------------------------------------------------------- 16 */
{
  nome: '16/22 quanto pesa la casella di formazione per chi copre',
  /* RI-ANCORATO IL 28 AGOSTO 2026: _t-carattere.js aggiunge `spinta` alla
     riga della x (la linea alta o bassa della squadra di quartiere). Le
     due cure convivono — una sposta l'ANCORA, l'altra ne cambia il PESO —
     ma l'ancoraggio va preso sulla riga di oggi, spinta compresa, se no
     si applicherebbe sopra una riga che non esiste piu' e la linea alta
     sparirebbe senza che nessuno se ne accorga. */
  cerca:
`      p.aiTX=clamp(cx2*0.55 + (anc[0]+spinta)*0.45, 40, FW-40);
      p.aiTY=clamp(cy2*0.55 + anc[1]*0.45, 40, FH-40);`,
  metti:
`      /* IL PRESSING, scritto dove il pressing vive davvero in questo
         gioco: non nella voglia di scivolare, ma nel PESO che la casella
         di formazione ha contro il punto d'intercetto. Con 0,45 (la
         quota di sempre) la squadra tiene la zona; con 0,30 va sulla
         palla; con 0,62 non si scompone. Le due quote sono
         complementari per costruzione, cosi' il bersaglio resta sempre
         fra la palla e la casella e non puo' finire da nessun'altra
         parte.
         `+`spinta`+` resta dov'era: e' la linea alta o bassa del CARATTERE
         della squadra, cioe' DOVE sta la casella, mentre qui si decide
         QUANTO quella casella pesa. Due cose diverse sulla stessa riga,
         e si sommano senza pestarsi. */
      const wA = 0.45 + mentDi(myTeam).ancora, wB = 1 - wA;
      p.aiTX=clamp(cx2*wB + (anc[0]+spinta)*wA, 40, FW-40);
      p.aiTY=clamp(cy2*wB + anc[1]*wA, 40, FH-40);`,
},

/* --------------------------------------------------------------- 17 */
{
  nome: '17/22 la stazione della punta',
  cerca: `      p.aiTX = opGoalX===FW ? FW*PUNTA_X : FW*(1-PUNTA_X);`,
  metti:
`      /* la stazione si sposta col delta della mentalita', e PUNTA_X
         resta l'unico posto dove quel numero e' scritto: 0,62 in DIFESA
         (la punta rientra a fare da sponda), 0,78 in ATTACCO (resta
         sul filo dell'ultimo difensore). Il commento di PUNTA_X dice
         perche' sopra 0,74 il punteggio del passaggio smette di
         sceglierla: in ATTACCO quel prezzo si paga apposta, ed e' il
         motivo per cui ATTACCO non e' gratis. */
      const puX = PUNTA_X + mentDi(myTeam).punta;
      p.aiTX = opGoalX===FW ? FW*puX : FW*(1-puX);`,
},

/* --------------------------------------------------------------- 18 */
{
  nome: '18/22 i comandi: la riga in GIOCA, la voce in PAUSA, il gancio del banco',
  cerca:
`document.querySelectorAll('.taglia').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    SAVE.taglia=+b.dataset.t;
    refreshTaglieRow();
    persistSave();
  });
});
refreshTaglieRow();`,
  metti:
`document.querySelectorAll('.taglia').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    SAVE.taglia=+b.dataset.t;
    refreshTaglieRow();
    persistSave();
  });
});
refreshTaglieRow();
/* la mentalita' prima del fischio: stessa meccanica delle taglie, perche'
   e' la stessa specie di scelta. Vale per amichevole, TORNEO e STAGIONE. */
function refreshMentRow(){
  document.querySelectorAll('.ment').forEach(b=>b.classList.toggle('sel', +b.dataset.m===mentValida(SAVE.mentalita)));
}
document.querySelectorAll('.ment').forEach(b=>{
  b.addEventListener('click', ()=>{
    Audio5.unlock(); Audio5.beep(500);
    SAVE.mentalita=mentValida(+b.dataset.m);
    refreshMentRow();
    persistSave();
  });
});
refreshMentRow();`,
},

/* ------------------------------------------------------- 19 (pausa JS) */
{
  nome: '19/22 la voce di PAUSA cambia la squadra mentre si gioca',
  cerca:
`$('btnPauseAudio').addEventListener('click', ()=>{
  Audio5.unlock();
  Audio5.setMuted(!Audio5.muted);
  refreshMute(); refreshPauseAudio();
});`,
  metti:
`$('btnPauseAudio').addEventListener('click', ()=>{
  Audio5.unlock();
  Audio5.setMuted(!Audio5.muted);
  refreshMute(); refreshPauseAudio();
});
/* ---------------------------------------------------------------------
   IL CAMBIO DI MENTALITA' A PARTITA IN CORSO.

   Cambia SOLO la squadra di chi ha aperto la pausa (la 0): la panchina
   avversaria e' dell'avversario. In due giocatori la pausa e' comunque
   una sola e la seconda squadra resta com'e': asimmetrico e dichiarato,
   invece di un pannello a due colonne che nessuno userebbe col telefono
   passato di mano.
   La scelta si scrive nel salvataggio perche' e' una preferenza, non uno
   stato di partita: chi gioca sempre in DIFESA la ritrova al fischio
   dopo senza doverla ridire.
   IL FATTO CHE NON EMETTO: qui nasce un evento buono per il REGISTRO DEI
   FATTI — {quando: G.timeLeft, che cosa:'mentalita', chi:0, esito:
   G.ment[0]}. Non me lo costruisco: quando il registro esiste, la riga
   va qui.
   --------------------------------------------------------------------- */
function refreshPauseMent(){
  const b=$('btnPauseMent'); if(!b) return;
  b.textContent='MENTALIT\\u00c0: '+mentDi(0).n;
  b.classList.toggle('on', mentValida(G.ment?G.ment[0]:1)!==1);
}
$('btnPauseMent').addEventListener('click', ()=>{
  Audio5.unlock(); Audio5.beep(500);
  if(!G.ment) G.ment=[1,1];
  G.ment[0]=(mentValida(G.ment[0])+1)%3;
  SAVE.mentalita=G.ment[0];
  persistSave();
  /* DUE RIDIPINTURE, NON UNA. La voce di pausa e la riga di pastiglie
     della schermata GIOCA mostrano LO STESSO numero in due posti: chi lo
     scrive deve ridipingerli tutti e due, se no la schermata resta
     indietro. Senza refreshMentRow() qui, il percorso PAUSA -> tocco ->
     ABBANDONA -> menu -> GIOCA lascia accesa la pastiglia di prima: la
     schermata dichiarava EQUILIBRIO e la partita partiva in ATTACCO, e
     chi voleva EQUILIBRIO non aveva modo di accorgersene perche' la
     pastiglia che voleva era gia' accesa (misurato: sonda
     strumenti/_sonda-ment-dito.js, 2 controlli rossi su 7 prima,
     0 su 7 dopo).
     E' la stessa disciplina che il gioco spedito applica al suo unico
     caso gemello — «G.diff=clamp(SAVE.diff|0,0,2); refreshDiffRows();»,
     dopo una partita di torneo — e che questa toppa gia' rispetta al
     click della pastiglia e in AZZERA DATI: chi scrive, ridipinge.
     SCARTATA L'ALTRA STRADA, e va scritto: ridipingere all'APERTURA
     della schermata GIOCA (una riga sola nel gestore di btnGioca, che e'
     l'unico ingresso) coprirebbe anche uno scrittore futuro. Non e'
     stata presa perche' rompe la disciplina di casa in un file che la
     rispetta ovunque, e perche' oggi gli scrittori sono tre e sono
     contabili: il click della pastiglia, questa voce, AZZERA DATI —
     loadSave() gira una volta sola, all'avvio. Un quarto scrittore fa
     cadere il controllo che conta gli scrittori, in fondo a
     strumenti/_t-mentalita.js, e chi lo scrive viene mandato a leggere
     questo commento. */
  refreshPauseMent();
  refreshMentRow();
  /* il cartello dura quanto un PALO! e si legge alla ripresa: sotto la
     tenda della pausa l'HUD tace, e il cronometro del banner e' fermo
     insieme al gioco */
  showBanner(mentDi(0).n, TEAMCOL[0], 1.3);
});`,
},

/* ------------------------------------------------------- 20 (setPaused) */
{
  nome: '20/22 la pausa mostra la mentalita\' corrente all\'apertura',
  cerca: `    show(ui.pausa); refreshPauseAudio(); refreshPauseStats();`,
  metti: `    show(ui.pausa); refreshPauseAudio(); refreshPauseMent(); refreshPauseStats();`,
},

/* -------------------------------------------------- 21 (gancio dei banchi) */
{
  nome: '21/22 window.__test espone e impone la mentalita\'',
  cerca:
`window.__test = {
  get state(){ return G.scene; },`,
  metti:
`window.__test = {
  get state(){ return G.scene; },
  /* LA MENTALITA', per i banchi. Leggerla serve a un collaudo che voglia
     verificare che il valore di serie sia la voce neutra; imporla serve a
     un banco CPU contro CPU, dove nessuno apre il menu della pausa.
     Va chiamata DOPO startMatch, che e' il posto in cui G.ment nasce. */
  get mentalita(){ return G.ment ? G.ment.slice() : [1,1]; },
  setMentalita(a,b){
    if(!G.ment) G.ment=[1,1];
    G.ment[0]=mentValida(a); G.ment[1]=mentValida(b===undefined?a:b);
    return G.ment.slice();
  },`,
},

/* --------------------------------------------------------------- 22 */
{
  nome: '22/22 azzerando i dati le pastiglie tornano a dire il vero',
  cerca: `  refreshMute(); refreshPauseAudio(); refreshDiffRows();`,
  metti:
`  /* LA RIGA DELLE TAGLIE E QUELLA DELLE MENTALITA' SI RIDIPINGONO QUI.
     Non e' un extra: senza, dopo AZZERA DATI le pastiglie continuano a
     mostrare la scelta di prima mentre il salvataggio ne porta un'altra,
     e la schermata mente. Il buco c'era gia' per le taglie — questa toppa
     lo chiude invece di aggiungerne un secondo uguale, che sarebbe
     spedire un difetto sapendo di spedirlo. */
  refreshMute(); refreshPauseAudio(); refreshDiffRows(); refreshTaglieRow(); refreshMentRow();`,
},

];

/* =====================================================================
   L'ARMAMENTO DA BANCO — --banco 0|1|2.

   Il banco degli eventi gira CPU contro CPU e non apre nessun menu:
   senza questo, ogni misura direbbe soltanto che EQUILIBRIO e'
   EQUILIBRIO. Con --banco N tutte e due le squadre partono sulla
   mentalita' N; con --banco N,M la prima parte su N e la seconda su M,
   che e' l'unico modo di far dire qualcosa al POSSESSO (a mentalita'
   uguali le due squadre sono simmetriche e il possesso e' 50/50 per
   costruzione, non per merito).
   E' un'ARMA DA BANCO, non una funzione: --banco insieme a --dentro
   viene rifiutato.
   ===================================================================== */
const ANCORA_BANCO = (a, b) => ({
  nome: 'BANCO le due squadre partono su ' + a + ' e ' + b,
  cerca: `  G.ment=[mentValida(SAVE.mentalita), mentValida(opts.opp ? opts.opp.ment : 1)];`,
  metti: `  G.ment=[${a},${b}];   /* ARMATO DA BANCO: non spedire */`,
});

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-mentalita.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const banco = arg('banco', '');
let bancoA = '', bancoB = '';
if (banco !== '') {
  const p = banco.split(',');
  bancoA = p[0]; bancoB = p.length > 1 ? p[1] : p[0];
  if (p.length > 2 || !['0', '1', '2'].includes(bancoA) || !['0', '1', '2'].includes(bancoB)) {
    console.error('FALLITO: --banco vuole 0, 1 o 2, oppure una coppia come 2,0.'); process.exit(2);
  }
}
if (banco !== '' && dentro) {
  console.error('FALLITO: --banco e\' un armamento da banco e non si spedisce dentro il gioco.');
  process.exit(2);
}

const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.ment.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

const TUTTE = banco === '' ? ANCORE : ANCORE.concat([ANCORA_BANCO(bancoA, bancoB)]);

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of TUTTE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi non trovati esattamente una volta.');
  for (const m of mancanti) console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
  process.exit(1);
}

/* i controlli dopo la sostituzione. Il conto dei sorteggi e' il primo:
   questa toppa non ne aggiunge e non ne sposta nemmeno uno, e se un
   giorno qualcuno ce ne infilasse uno dentro una delle sei leve i banchi
   a seme fisso si sfaserebbero in silenzio (vedi la nota in
   strumenti/_t-carica.js).

   IL SORTEGGIO OGGI SI CHIAMA dado(), NON Math.random() — RI-ANCORATO IL
   28 AGOSTO 2026. strumenti/_t-seme.js ha fatto passare tutto il caso da
   una funzione sola: nel gioco di oggi Math.random() compare CINQUE
   volte, e quattro sono dentro commenti — la quinta e' la riga
   «if(!SEME.on) return Math.random();» dentro dado() stesso. Contare
   Math.random() era quindi diventato un controllo che non guarda piu'
   niente: sarebbe rimasto verde anche se questa toppa avesse infilato
   dieci dado() in mezzo alle sei leve. Si contano tutti e due: dado() e'
   quello che conta davvero (86 nel gioco di oggi), Math.random() resta
   perche' una toppa che ne riscrivesse uno a mano si vedrebbe subito. */
const contaCaso = s => (s.match(/\bdado\(\)/g) || []).length;
const contaRandom = s => (s.match(/Math\.random\(\)/g) || []).length;
const attesi = [
  ['const MENT = [', 1],
  ['function mentDi(t){', 1],
  ['function pernoModulo(T){', 1],
  ['function mentValida(v){', 1],
  /* la riga che nasce in startMatch: una sola, e il banco la sostituisce
     invece di affiancarla (le altre due G.ment=[1,1] sono i ripieghi del
     bottone di pausa e del gancio dei banchi, e restano) */
  ['G.ment=[mentValida(SAVE.mentalita)', banco === '' ? 1 : 0],
  ['mentDi(myTeam).slancio', 1],
  ['mentDi(myTeam).ancora', 1],
  ['mentDi(myTeam).punta', 1],
  ['mentDi(t).slancio', 1],
  ['id="mentRow"', 1],
  ['id="btnPauseMent"', 1],
  /* LA COPPIA CHE DIFENDE LA RIGA DI PASTIGLIE, e non e' formale: e' il
     difetto vero che questa toppa ha spedito una volta.
     Gli scrittori di SAVE.mentalita sono DUE in chiaro (il click della
     pastiglia e la voce di pausa) piu' uno per copia (l'Object.assign di
     AZZERA DATI), e le ridipinture della riga sono QUATTRO: quelle tre
     piu' la chiamata di avvio in fondo allo script. Se un giorno nasce un
     quarto scrittore, il primo di questi due conti cade e la toppa si
     rifiuta di scrivere: e' l'unico modo perche' chi lo scrive si accorga
     che deve ridipingere anche lui. */
  ['SAVE.mentalita=', 2],
  ['refreshMentRow();', 4],
  ['ment:0,', 3], ['ment:1,', 4], ['ment:2,', 3],
  /* le espressioni sostituite non devono sopravvivere da nessuna parte */
  ['[gl + mx*FW*m.fx, FH/2 + FH*m.fy]', 0],
  ['cx2*0.55 + anc[0]*0.45', 0],
  ['FW*PUNTA_X : FW*(1-PUNTA_X)', 0],
  ['FW*0.46 : FW*0.54', 0],
];
if (banco !== '') attesi.push([`G.ment=[${bancoA},${bancoB}];   /* ARMATO DA BANCO: non spedire */`, 1]);
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (contaCaso(out) !== contaCaso(src))
  rotti.push('il conto dei dado() e\' cambiato: ' + contaCaso(src) + ' -> ' + contaCaso(out));
if (contaRandom(out) !== contaRandom(src))
  rotti.push('il conto dei Math.random() e\' cambiato: ' + contaRandom(src) + ' -> ' + contaRandom(out));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + TUTTE.length + ' ancoraggi applicati' + (banco === '' ? '' : '  [ARMATO DA BANCO: ' + bancoA + ' contro ' + bancoB + ']'));
console.log('    dado(): ' + contaCaso(src) + ' prima, ' + contaCaso(out) + ' dopo' +
            '   (Math.random(): ' + contaRandom(src) + ' -> ' + contaRandom(out) + ', tutti in commento tranne quello dentro dado())');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');

/* =====================================================================
   NUMERI — tutto quello che e' stato misurato, e con che comando.

   DUE EDIZIONI, e si tengono tutte e due in chiaro perche' i numeri
   senza la versione su cui sono stati presi non valgono niente.

     PRIMA EDIZIONE — 27 agosto 2026, base da 1.936.942 byte,
       md5 15c91841f636da4c9e5a27aec8349706. E' l'edizione da cui vengono
       tutte le tabelle di forma e di eventi qui sotto.
     SECONDA EDIZIONE — 28 agosto 2026, base da 1.989.835 byte,
       md5 9bda46527ed5cae2e8fe1cbe8d884b07. In mezzo sono entrate cinque
       toppe di altri: _t-spazio, _t-portiere (variante BT), _t-seme,
       _t-registro, _t-rete. I ventidue ancoraggi hanno retto tutti e
       ventidue senza toccarne uno; ha ceduto invece il CONTROLLO sui
       sorteggi, ed e' stato ri-ancorato (vedi il punto 9). Cio' che e'
       stato rimisurato il 28 e' scritto al punto 9 con la data accanto;
       tutto il resto porta la data del 27 e va riletto come tale.

   Il file di base si muove ogni giorno per mano di altri: il md5 dice su
   quale versione questi numeri sono stati presi, e i ventidue ancoraggi
   si rifiutano di scrivere se una sola delle righe che cercano non c'e'
   piu' esattamente una volta.

   ------------------------------------------------------------------
   1. EQUILIBRIO E' IL GIOCO DI IERI, AL BIT
   ------------------------------------------------------------------
     node strumenti/_eventi.js --taglia N --partite P --seme 20260803 --json fuori/a.json
     node strumenti/_eventi.js --taglia N --partite P --seme 20260803 --gioco fuori/ment.html --json fuori/b.json
     (poi confronto crudo, partita per partita, di a.crudo e b.crudo)

       taglia  5    100 partite    0 partite diverse su 100
       taglia  7     60 partite    0 partite diverse su  60
       taglia 11     40 partite    0 partite diverse su  40

     E il conto dei sorteggi non si muove: 87 Math.random() prima, 87
     dopo. Lo stampa la toppa stessa a ogni corsa, e se cambiasse si
     rifiuterebbe di scrivere.

   ------------------------------------------------------------------
   2. LA FORMA DELLA SQUADRA — le caselle di formation(), in unita' di
      campo, portiere escluso. NON le posizioni dopo resetKickoff: chi
      batte il calcio d'inizio viene portato al centro e falserebbe la
      misura (ci sono cascato: a 5 e a 7 l'uomo piu' avanzato risultava
      lo stesso in tutte e tre le mentalita', ed era il battitore).

       taglia 5   (FW 1150)      dietro  avanti  profondita'  larghezza
         DIFESA                     156     327          170        231
         EQUILIBRIO                 213     431          219        269
         ATTACCO                    269     536          267        306
       taglia 7   (FW 1610)
         DIFESA                     222     530          308        378
         EQUILIBRIO                 298     692          394        439
         ATTACCO                    374     773          399        501
       taglia 11  (FW 2300)
         DIFESA                     194     678          484        694
         EQUILIBRIO                 299     920          621        806
         ATTACCO                    404    1104          700        919

     LA FORBICE 0,48 SI VEDE, ed e' voluta: a 7 e a 11 l'uomo piu'
     avanzato in ATTACCO si ferma li' (773 = 0,48 x 1610, 1104 = 0,48 x
     2300) invece che a 855 e 1222, che sarebbero oltre la meta' campo.
     Al calcio d'inizio nessuno sconfina.

   ------------------------------------------------------------------
   3. GLI EVENTI — 100 partite CPU contro CPU, Normale, semi
      20260803..20260902, tempo regolamentare (durataPartita: 90 s a 5
      contro 5, 180 a 11 contro 11).
   ------------------------------------------------------------------
   3a. 11 CONTRO 11, tutte e due le squadre sulla stessa mentalita'

                                   DIFESA   EQUILIBRIO   ATTACCO
       partite 0-0 nei 90 s          43%        22%        17%
         (intervallo al 95%)        +-10        +-8        +-7
       gol nei 90 s, media           0,82       1,24       1,44
       tiri, media                  19,0       15,1       13,6
       precisione VERA                7%        10%        18%
       parate, media                 1,4        1,6        2,7
       legni, media                  0,14       0,09       0,56
       momenti da porta al minuto    0,72       0,91       1,48
       decise ai rigori              38%        23%        16%
       tiri murati da un corpo       8,3        7,0        5,1
       tiri finiti in sponda         3,6        1,8        1,4

     LA COSA DA CAPIRE, perche' a prima vista sembra un errore: DIFESA
     produce PIU' TIRI (19,0 contro 13,6) e MENO GOL (0,82 contro 1,44).
     Non e' un paradosso, e' quello che fa un blocco basso: i tiri
     partono da fuori, ne finiscono 8,3 addosso a un corpo e 3,6 sul
     fondo, e la precisione vera crolla dal 18% al 7%. ATTACCO tira di
     meno e tira meglio: le parate raddoppiano (2,7 contro 1,4) e i
     legni si moltiplicano per quattro. I "momenti da porta al minuto"
     — la voce che _eventi.js ha inventato apposta per non farsi
     ingannare dal conto dei tiri — raddoppiano: 0,72 contro 1,48.

   3b. 5 CONTRO 5, stessa cosa

                                   DIFESA   EQUILIBRIO   ATTACCO
       partite 0-0 nei 90 s           3%         7%         1%
       gol nei 90 s, media           2,82       3,02       3,59
       precisione VERA               22%        24%        26%
       parate, media                 2,0        2,8        3,6
       momenti da porta al minuto    3,75       4,32       5,26
       cambi di possesso            25,3       31,8       35,9
       eventi al minuto             53,2       56,9       63,8

     A cinque la scala e' piu' piccola — il campo e' meta' e la punta
     non esiste, quindi due delle sei leve non hanno presa — ma la
     direzione e' la stessa su tutte le voci.

   3c. LE DUE PANCHINE DIVERSE, 11 contro 11, 100 partite. E' l'unico
       banco che puo' dire qualcosa sul POSSESSO.

                              possesso     tiri            gol
                              squadra 0    sq.0  sq.1    sq.0  sq.1
       EQUILIBRIO x2          50,8 +-0,8   7,82  7,32    0,66  0,58
       EQUILIBRIO vs DIFESA   49,6 +-0,6  10,84  6,84    0,77  0,41
       ATTACCO    vs DIFESA   48,7 +-0,8  11,59  3,88    0,99  0,31
       (i +- sono intervalli al 95% sulla media delle 100 partite)

       ATTACCO contro DIFESA finisce 76 vittorie a 24, zero pareggi
       dopo i rigori.

     IL POSSESSO VA NELL'ALTRO VERSO, e va detto invece di nasconderlo:
     la squadra che attacca ha MENO palla (48,7% contro il 50,8% del
     banco simmetrico, e i due intervalli non si toccano: e' misurato).
     Il blocco basso recupera e tiene; chi spinge alto perde il pallone
     piu' spesso e lo riprende piu' avanti. I tiri raccontano la stessa
     partita nel verso che ci si aspetta: tre a uno.
     Chi cercasse "attacco = piu' possesso" qui non lo trova, e questa
     riga esiste perche' nessuno lo cerchi due volte.

   3d. IL CASO CHE INTERESSA DAVVERO A CHI GIOCA — la mia squadra
       neutra contro un avversario che difende (e' quello che succede
       incontrando PRATI BASSI o SANTA FURIA): 0-0 nei 90 s 28%, gol
       1,18, momenti al minuto 0,94. Sotto la soglia del 33% che
       --tre-taglie chiede a 11 contro 11.
       L'UNICA condizione che sfonda quella soglia e' DIFESA contro
       DIFESA (43%), e ci si arriva solo se chi gioca sceglie di
       difendere contro una squadra che gia' difende. E' una partita
       chiusa perche' l'hanno chiusa in due, ed e' calcio.

   ------------------------------------------------------------------
   4. IL COSTO — 16 ms a fotogramma, e questa toppa quanti ne prende
   ------------------------------------------------------------------
     node strumenti/prestazione.js --gioco fuori/ment.html --contro CALCETTO-il-gioco.html --taglia 11 --freno 4 --giri 10
       fotogramma medio          93,6 -> 107,6 ms   +15,0%
       tipico (quinto centrale) 108,3 -> 105,3 ms    -2,8%
       il 95 per cento sotto    141,7 -> 141,7 ms    +0,0%
       cancello: ammesso +25%, tre confronti su tre passati.
     TUTTI E TRE "NON PROVATI" dallo strumento stesso, perche' i giri
     scavalcano lo zero e il ballo fra due repliche dello STESSO file e'
     del 28,7%. Cioe': il costo di questa toppa sta SOTTO LA RISOLUZIONE
     dell'attrezzo. Non scrivo "+15%" come se fosse un costo: non lo e',
     e il segno non e' nemmeno sicuro.

     IL CONTO STATICO, che invece si puo' fare. A 11 contro 11, su
     quattro corse da 3600 fotogrammi:
       formation()   fra 0,61 e 0,85 chiamate per fotogramma
       mentDi()      fra 1,64 e 1,95
       pernoModulo() tante quante formation(), e sono tutte colpi di
                     cache tranne la prima per taglia
     (il conto non si riproduce identico fra due corse a seme uguale
      perche' la partita simulata dipende anche dall'orologio: e' un
      ORDINE DI GRANDEZZA, e come tale va letto.)
     Quelle chiamate a formation() c'erano gia' tutte: il ramo della
     copertura la chiamava prima di questa toppa. Cio' che si aggiunge
     e' DENTRO il ciclo: una sottrazione, due moltiplicazioni, due
     somme e un clamp per uomo, cioe' al massimo 11 x 6 = 66 operazioni
     per chiamata e meno di 60 per fotogramma. Su un fotogramma che
     disegna ventidue figure a diciotto giunti, non e' un costo.

   ------------------------------------------------------------------
   5. I CANCELLI, sulla copia toppata
   ------------------------------------------------------------------
     node strumenti/tutti.js --gioco fuori/ment.html
       15 cancelli che contano, TUTTI VERDI (452 s).
       L'informativo 'istantanea' segna 45/56 — ed e' lo STESSO che
       segna il gioco spedito, colonna per colonna (3/8 8/8 8/8 5/8 8/8
       6/8 7/8): verificato girandolo anche sul repo, percio' non e'
       questa toppa.
     node strumenti/_q-meta.js --tre-taglie --gioco fuori/ment.html
       82 controlli, 82 passati. 11v11 0-0 al 27% (soglia 33%).
     node strumenti/collaudo.js --gioco fuori/ment.html calcetto
       24 controlli, 24 passati, nessun errore in console.
     node strumenti/_q-mentalita.js --gioco fuori/ment.html
       30 controlli, 30 passati. E' il cancello scritto per questa toppa:
       tiene la tabella del punto 2, verifica che con EQUILIBRIO le
       caselle siano ESATTAMENTE quelle di TAGLIE[..].modulo (confronto
       sul double, non sull'arrotondamento: 0 su 5, 0 su 7, 0 su 11), e
       prova i comandi su una pagina vera.
       Sul gioco spedito lo stesso comando stampa «niente da misurare» e
       esce con zero: e' un cancello che sa di non applicarsi.

   ------------------------------------------------------------------
   6. I COMANDI, provati a mano su una pagina vera
   ------------------------------------------------------------------
     La riga in GIOCA nasce con EQUILIBRIO selezionato; toccando ATTACCO
     la selezione si sposta e SAVE.mentalita diventa 2; la partita che
     parte dopo ha mentalita' [2,1] — la mia in ATTACCO, la CPU senza
     avversario dichiarato in EQUILIBRIO. In PAUSA la voce legge
     "MENTALITA: ATTACCO"; un tocco la porta a DIFESA, il salvataggio
     segue, e la squadra si riabbassa in campo davvero: al calcio
     d'inizio in ATTACCO i dieci uomini occupavano una fascia larga 919
     unita' e ora, due secondi di gioco dopo il cambio, ne occupano 322,
     con l'uomo piu' arretrato a 12 unita' dalla propria linea. (Le
     ultime due sono posizioni VIVE, non caselle di formazione: si
     confrontano fra loro, non con la tabella del punto 2.)
     Zero eccezioni di pagina in tutta la prova.

   ------------------------------------------------------------------
   6bis. UN FALSO VERDE PRESO IN FACCIA, e vale la pena scriverlo perche'
      chiunque scriva un banco su questo gioco ci ricasca.
      Il controllo «un salvataggio manomesso ricade sulla voce neutra»
      lo si scrive d'istinto cosi': scrivi il veleno in localStorage,
      RICARICA la pagina, leggi. Verde. Ed e' falso: quando la scheda si
      nasconde il gioco SCRIVE il salvataggio (voluto, dal 20 agosto, su
      Android un'app in sottofondo puo' essere uccisa senza preavviso),
      quindi la ricarica fa passare persistSave PRIMA di loadSave e il
      veleno viene sovrascritto dal valore buono che sta in memoria. Il
      controllo dichiara vittoria senza aver provato niente — infatti la
      prima stesura passava anche con G.ment gia' a DIFESA, cioe' leggeva
      un valore che il lettore non aveva mai visto.
      _q-mentalita.js chiama loadSave() A MANO, senza ricaricare, su otto
      veleni diversi (99, -1, 3, '2', 1.5, null, {}, true) e in piu'
      verifica che il valore LEGITTIMO passi: se non lo verificasse,
      sarebbe verde anche un lettore che ignora sempre il campo.

   ------------------------------------------------------------------
   7. LE COSE PROVATE E BOCCIATE — perche' nessuno le riprovi
   ------------------------------------------------------------------
   7a. LA VOGLIA DI CONTENERE COME LEVA DI PRESSING
       (`p.contieni = Math.random()<0.55` dentro il ramo del pressatore)
       BOCCIATA SENZA MISURARLA, e la ragione e' migliore di una misura:
       quel ramo vive dentro `isCpuTeam && D.standoff>0`. La squadra di
       chi gioca non e' una squadra CPU, quindi la leva NON la
       raggiungerebbe mai — mentre il banco, che gira CPU contro CPU, la
       sentirebbe eccome. Sarebbe un numero grosso e verde in questo
       file che al giocatore non arriva. Misurarla avrebbe solo prodotto
       la prova di una cosa falsa.

   7b. UN CATALOGO DI FORMAZIONI (le 34 del concorrente, o anche solo
       tre per taglia). BOCCIATO IN PROGETTO: il modulo a undici ha le
       linee a 0,13 / 0,27 / 0,40, quindi mezzo scalino fra due linee
       vale 0,07 di campo su un uomo su dieci. Le due grandezze che a
       questa scala si vedono e si scelgono sono la profondita' del
       blocco (484 -> 700 unita', misurate qui sopra) e la larghezza
       (694 -> 919): la mentalita' le muove tutte e due con un numero
       solo. Un catalogo avrebbe aggiunto una schermata, dei nomi da
       imparare e nessuna delle due.

   7c. CINQUE MENTALITA' (Ultra Attacking ... Ultra Defensive).
       BOCCIATE per la pausa: la voce di PAUSA e' un bottone che CICLA,
       e un ciclo di cinque richiede fino a quattro tocchi per tornare
       dove si era. Con tre ne bastano due, e la parola scritta sopra si
       legge senza rileggere. Il costo di questa scelta e' dichiarato:
       fra DIFESA ed EQUILIBRIO c'e' un salto, e chi volesse una via di
       mezzo non ce l'ha.

   7d. UN'INSEGNA FISSA NELL'HUD che dica ATTACCO o DIFESA.
       BOCCIATA da una regola di casa scritta nel gioco stesso: in
       partita l'interfaccia ha CINQUE elementi persistenti (pausa, i
       due punteggi, il cronometro, la minimappa) e un'insegna ne
       farebbe sei. Come si vede allora? Si vede che i dieci punti sulla
       minimappa e i dieci corpi in campo si spostano tutti insieme —
       210 unita' di linea difensiva fra DIFESA e ATTACCO a 11 contro
       11, 225 di larghezza — piu' il cartello che passa una volta sola
       quando la si cambia. E' come lo si vede allo stadio.

   ------------------------------------------------------------------
   8. QUELLO CHE RESTA DA FARE, dichiarato invece che accennato
   ------------------------------------------------------------------
     · Le SOSTITUZIONI non ci sono, e non le porta questa toppa.
     · La mentalita' della squadra avversaria non si vede da nessuna
       parte prima del fischio: la frase dello stile c'e' gia' nella
       schermata di STAGIONE ('difesa chiusa, zero rischi') e adesso
       dice il vero, ma nel TORNEO quella frase non e' esposta.
     · A 5 contro 5 due delle sei leve (punta e raddoppio) non hanno
       presa perche' quei ruoli nascono da TAGLIA>=7. La mentalita'
       funziona lo stesso — i numeri di 3b lo dicono — ma con quattro
       leve invece che sei.
     · In due giocatori la seconda squadra non ha un modo di scegliere
       la propria mentalita': resta EQUILIBRIO.

   ------------------------------------------------------------------
   9. IL DIFETTO CHE QUESTA TOPPA HA SPEDITO, E COME E' STATO CHIUSO
      (28 agosto 2026, seconda edizione)
   ------------------------------------------------------------------
   9a. LA SCHERMATA MENTIVA. La voce di PAUSA scriveva SAVE.mentalita e
       ridipingeva SOLO se stessa: chiamava refreshPauseMent() e non
       refreshMentRow(). Sul percorso del dito
         partita 11v11 -> ESC -> tocco su MENTALITA' -> ABBANDONA
         -> menu -> GIOCA -> 1 GIOCATORE
       la riga di pastiglie restava sulla scelta di prima. Misurato,
       Chromium 915x412, su fuori/ment2.html costruita dalla base del 28:
         «la schermata GIOCA mostra selezionata: ["Equilibrio"]
           SAVE.mentalita=2»
         «la partita che parte gioca con: ATTACCO  G.ment=[2,1]»
       La cosa grave non e' la pastiglia sbagliata: e' che chi voleva
       EQUILIBRIO non aveva nessun modo di accorgersene, perche' la
       pastiglia che voleva era GIA' ACCESA. Un tocco sopra non fa niente
       (la classe c'e' gia', e il click ci riscrive lo stesso valore),
       quindi la schermata non solo mentiva: resisteva alla correzione.
       CHIUSO con una riga sola nell'ancoraggio 19 — refreshMentRow()
       accanto a refreshPauseMent(). Zero sorteggi, zero allocazioni,
       zero disegno in piu': succede al tocco, tre classList.toggle su
       tre bottoni.
       DOPO, stesso comando, stesso file: «["Attacco"] SAVE.mentalita=2»
       e «la partita che parte gioca con: ATTACCO».
         node strumenti/_sonda-ment-dito.js --gioco fuori/ment2.html
         prima  7 controlli, 5 passati, 2 falliti
         dopo   7 controlli, 7 passati, 0 falliti

   9b. E IL CANCELLO ERA VERDE SOPRA IL DIFETTO — la parte peggiore.
       _q-mentalita.js, prima di guardare la riga di pastiglie, chiamava
       refreshMentRow() a mano, con accanto un commento che diceva «la
       riga si ridipinge quando la si guarda, non solo al caricamento».
       L'affermazione era FALSA nel codice spedito, e quella chiamata di
       comodo era esattamente cio' che rendeva verde il controllo «ne e'
       selezionata una sola, ed e' la neutra». 30 su 30 sopra un
       comportamento rotto. E' lo stesso genere di falso verde gia'
       descritto al punto 6bis, in questo stesso cancello, preso una
       seconda volta: scrivere che ci si e' cascati non e' bastato.
       LA REGOLA CHE NE ESCE, e vale per chiunque scriva un banco qui: un
       cancello che chiama una funzione di RIDISEGNO non sta piu'
       misurando l'interfaccia, sta misurando se stesso. Se serve
       ridipingere per vedere la cosa giusta, la cosa giusta non c'e'.
       CHIUSO togliendo la chiamata e aggiungendo il punto 4bis, che
       cammina sui bottoni veri (#btnQuit, #btnGioca) e confronta la
       pastiglia accesa con SAVE.mentalita.
         node strumenti/_q-mentalita.js --gioco fuori/ment2.html
         sulla copia COL difetto   33 controlli, 31 passati, 2 falliti
         sulla copia curata        33 controlli, 33 passati, 0 falliti
       (la copia col difetto si rifa' in tre righe: si prende la curata e
        si toglie la SOLA riga refreshMentRow() del gestore di pausa —
          node -e "const f=require('fs');const s=f.readFileSync('fuori/ment2.html','utf8');
                   f.writeFileSync('fuori/ment2-difettoso.html',
                     s.replace('  refreshPauseMent();\\n  refreshMentRow();\\n',
                               '  refreshPauseMent();\\n'));"
        Serve a provare che il cancello nuovo VEDE: un controllo che non
        e' mai stato visto fallire non e' un controllo, ed e' esattamente
        l'errore che ha prodotto il 30 su 30 sopra il rotto.)
       Il controllo «ne e' selezionata una sola, ed e' la neutra» resta
       verde anche senza la chiamata di comodo: adesso legge la
       ridipintura VERA dell'avvio, che e' quello che doveva leggere.

   9c. IL CONTROLLO SUI SORTEGGI ERA DIVENTATO CIECO, ri-ancorato.
       Fino al 27 agosto questa toppa contava i Math.random(). Poi
       _t-seme.js ha fatto passare tutto il caso da dado(), e nel gioco
       del 28 Math.random() compare CINQUE volte: quattro dentro commenti
       e la quinta nella riga «if(!SEME.on) return Math.random();» dentro
       dado() stesso. Il controllo sarebbe rimasto verde anche se questa
       toppa avesse infilato dieci sorteggi in mezzo alle sei leve — e la
       LEGGE SUI SORTEGGI (il conto non cambia, e un sorteggio non esce
       da un corto circuito &&) sarebbe stata violata in silenzio, con
       tutti i banchi a seme fisso sfasati e ciechi.
       Adesso si contano tutti e due, e la toppa lo stampa a ogni corsa:
         dado(): 86 prima, 86 dopo   (Math.random(): 5 -> 5)
       Le sei leve restano quelle che erano: moltiplicazioni e somme su
       bersagli gia' calcolati, nessuna dentro un &&, nessuna che pesca.

   9d. DUE CONTROLLI NUOVI CHE DIFENDONO LA RIGA DI PASTIGLIE, perche'
       una riga aggiunta a mano si toglie a mano e nessuno se ne accorge:
         gli scrittori di SAVE.mentalita in chiaro devono restare DUE (il
         click della pastiglia e la voce di pausa; il terzo, AZZERA DATI,
         scrive per copia con Object.assign), e le ridipinture della riga
         devono restare QUATTRO (quelle tre piu' la chiamata di avvio).
       Se nasce un quarto scrittore la toppa si rifiuta di scrivere. Non
       e' eleganza: e' l'unico modo perche' chi lo scrive scopra che deve
       ridipingere anche lui, invece di scoprirlo da un critico.
       COSTATA UNA CORSA: il primo tentativo si e' rifiutato di scrivere
       da solo, perche' il commento che avevo appena messo dentro il
       gioco CITAVA il controllo e faceva tre invece di due. Il commento
       e' stato riscritto senza la citazione. Vale la pena saperlo: un
       controllo che conta stringhe conta anche i commenti.

   9e. LA STRADA NON PRESA, e perche'. Il difetto si poteva chiudere
       anche ridipingendo all'APERTURA della schermata GIOCA: una riga
       sola nel gestore di btnGioca, che e' l'UNICO ingresso (verificato:
       goScreen(ui.gioca) compare una volta sola nel gioco). Sarebbe
       stato piu' robusto verso uno scrittore futuro, e avrebbe reso vera
       la frase che il cancello affermava a torto.
       NON PRESA per due ragioni misurabili. La prima: il gioco spedito
       ha una disciplina sola, ed e' l'opposta — chi scrive lo stato
       ridipinge («G.diff=clamp(SAVE.diff|0,0,2); refreshDiffRows();»
       dopo una partita di torneo), e questa toppa la rispettava gia' in
       due punti su tre. Aggiungere la terza rimette la toppa in riga con
       la casa invece di aprire una seconda scuola. La seconda: gli
       scrittori oggi sono TRE e sono contabili — loadSave() gira una
       volta sola, all'avvio (verificato sul file di oggi), e non esiste
       nessuna ricarica del salvataggio a partita in corso. Il controllo
       del punto 9d rende quella contabilita' un fatto che si rompe
       rumorosamente invece di una promessa.
       Se un giorno il salvataggio dovesse ricaricarsi da solo — la
       sincronizzazione della SFIDA di _t-rete.js e' il candidato ovvio —
       questa scelta va rifatta, e allora la strada giusta e' quella
       dell'apertura di schermata.

   9f. COSA E' STATO RIMISURATO IL 28 AGOSTO, sulla base 9bda4652.

       EQUILIBRIO E' ANCORA IL GIOCO SPEDITO, AL BIT — e non era
       scontato: in mezzo sono passate cinque toppe di altri, e
       _t-portiere in variante BT tocca proprio le parate.
         node strumenti/_eventi.js --taglia 11 --partite 100 \
              --seme 20260803 --json fuori/_m2-repo11.json
         node strumenti/_eventi.js --taglia 11 --partite 100 \
              --seme 20260803 --gioco fuori/ment2.html --json ...ment11.json
         (poi confronto crudo, partita per partita)
           taglia  5   100 partite    0 partite diverse su 100
           taglia  7    60 partite    0 partite diverse su  60
           taglia 11   100 partite    0 partite diverse su 100
         Le voci a undici coincidono cifra per cifra su tutte e due le
         corse:
         0-0 nei 90 s 22%, gol 1,43, tiri 23,3, precisione VERA 8%,
         parate 1,8, momenti da porta al minuto 1,07.
         (Il 22% di oggi non si confronta col 27% del punto 5 di ieri: e'
          la base che si e' mossa, non questa toppa — la toppa e' a zero
          differenze contro la base su cui gira.)

       LA FORMA (punto 2) coincide voce per voce, riletta dal cancello:
         11  194 / 299 / 404 dietro,  484 / 621 / 700 di profondita',
             694 / 806 / 919 di larghezza
          7  378 / 439 / 501 di larghezza,  308 / 394 / 399 di profondita'
         e a tutte e tre le taglie «con EQUILIBRIO le caselle sono quelle
         del modulo, al bit»: 0 caselle fuori posto su 5, su 7 e su 11.

       COSA NON E' STATO RIMISURATO, dichiarato invece che sottinteso.
       Gli EVENTI con --banco (3a, 3b, 3c) NON sono stati rifatti sulla
       base nuova: in mezzo e' passato _t-portiere in variante BT, che
       cambia le parate, e i numeri di parate, legni e precisione del
       punto 3a vanno quindi letti come STORIA della prima edizione, non
       come misura di oggi. Rifarli e' un lavoro di nove corse da 100
       partite. Il verso della mentalita' — che e' cio' che la toppa
       promette — e' pero' ancora verificato oggi dal cancello, taglia
       per taglia: la linea sale, la squadra si allarga, il blocco si
       allunga, 9 controlli su 9.

   9g. I CANCELLI DELLA SECONDA EDIZIONE, su fuori/ment2.html
       ------------------------------------------------------------------
         node strumenti/collaudo.js --gioco fuori/ment2.html
           36 controlli, 36 passati, nessun errore in console
         node strumenti/_q-meta.js --tre-taglie --gioco fuori/ment2.html
           82 controlli, 82 passati.  11v11 0-0 al 30% su 30 partite
           (soglia 33%). Trenta partite hanno sigma ~9 punti: il 30% e il
           27% della prima edizione sono lo stesso numero letto due
           volte, e la misura buona e' quella a 100 partite qui sopra
           (22%, identica al gioco spedito perche' le due corse sono
           bit per bit la stessa cosa).
         node strumenti/_q-mentalita.js --gioco fuori/ment2.html
           33 controlli, 33 passati
         node strumenti/_sonda-ment-dito.js --gioco fuori/ment2.html
           7 controlli, 7 passati
       Sul gioco spedito il cancello e la sonda dicono tutti e due
       «niente da misurare / niente da percorrere» ed escono con zero.
   ===================================================================== */
