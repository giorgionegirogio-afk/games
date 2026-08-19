/* =====================================================================
   _t-l22.js — LE TRE RIPARAZIONI DI FISICA DELLA VOCE L2.2.
   Edizione 1, 19 agosto 2026. Toppa cerca/sostituisci ANCORATA: legge
   CALCETTO-il-gioco.html (o --in), sostituisce tratti esatti, e scrive
   la copia in --out. Se un solo ancoraggio non compare ESATTAMENTE UNA
   VOLTA si ferma con codice diverso da zero, dice QUALE, e non scrive
   niente. Non tocca mai l'originale se non glielo si chiede con
   --dentro.

   uso:
     node strumenti/_t-l22.js --out fuori/l22.html            (a + b)
     node strumenti/_t-l22.js --out fuori/l22a.html --solo a
     node strumenti/_t-l22.js --out fuori/l22b.html --solo b
     node strumenti/_t-l22.js --solo c                        (verifica)
     node strumenti/_t-l22.js --out fuori/accusa-c.html --guasta c
     node strumenti/_t-l22.js --in fuori/x.html --out fuori/y.html
     node strumenti/_t-l22.js --dentro                        (nel gioco)

   BASE. Puntata sul gioco del 19 agosto 2026, md5
   6a74d94fa3e7678ca34ad423aba44719. Se gli ancoraggi non ci sono la toppa
   lo dice e si ferma, invece di indovinare.

   TRE BLOCCHI SEPARATI, E UNO PER VOLTA. Ognuno cambia la simulazione AL
   BIT: applicarne due insieme e poi trovare un banco rosso non dice
   quale dei due l'ha fatto diventare rosso. --solo prende un blocco alla
   volta, ed e' li' per questo. E l'ordine non conta: applicare a e poi b
   su file separati da' un file identico al byte a quello di --out senza
   --solo (md5 cab1072e1f438b377ffd1f330cd62512, verificato).

   ---------------------------------------------------------------------
   (a) L'ATTRITO E' DELL'ERBA, NON DELL'ARIA. — ACCUSA VERA.

   Nel gioco di oggi updateBall fa, in questo ordine e senza guardie:
       b.x+=b.vx*dt; b.y+=b.vy*dt;
       const fr=Math.pow(0.35,dt*ATTR_K);
       b.vx*=fr; b.vy*=fr;
   e solo DOPO guarda la quota. Cioe' un pallone a tre metri d'altezza
   perde velocita' orizzontale come se stesse strisciando sull'erba.

   NON E' UN DETTAGLIO, ed e' il codice stesso a dirlo. doCross calcola:
       T = clamp(dist/430, 0.5, 0.75)   tempo di volo voluto
       velocita' = dist/T               per percorrere dist in T
       b.vz = 280*T                     e con g=560, 2*vz/g = T esatto
   Il tempo di volo balistico E' T al centesimo: chi ha scritto il cross
   ha risolto il moto del proiettile per far cadere il pallone ESATTAMENTE
   sul punto mirato — e poi l'attrito dell'erba, applicato in cielo, gli
   mangia la strada. La geometria del cross non e' approssimata: e'
   contraddetta.

   MISURATO, non dedotto (strumenti/_q-l22.js --a, banco a seme fisso,
   taglia 5, tutti gli altri giocatori fuori dal campo cosi' che nessuno
   intercetti; il cross e' quello vero, chiamato con window.doCross):

       distanza mirata   dove cade OGGI   corto del
             150             117,7          21,5%
             200             157,0          21,5%
             260             193,1          25,7%
             320             221,9          30,7%
             380             261,4          31,2%
             430             295,8          31,2%

   I due gradini sono le due estremita' del clamp su T: sotto 215 unita'
   T vale 0,50 e si perde il 21,5%, sopra 322,5 T vale 0,75 e si perde il
   31,2%. Il conto in chiuso lo conferma: la strada percorsa e'
   v0*(1-0.35^(K*T))/(K*ln(1/0.35)) invece di v0*T, cioe' il 78,0% a
   T=0,50 e il 69,2% a T=0,75. Il progetto diceva 24-31%: il capo alto
   e' giusto al decimo, il capo basso e' 21,5 e non 24 — si scrive il
   numero misurato, non quello ereditato.

   LA CURA e' la guardia che il progetto chiede, con una precisazione che
   il progetto non ha: non basta b.z<=0, serve anche b.vz<=0. Nel
   fotogramma in cui il pallone parte verso l'alto la quota e' ancora
   zero — l'integrazione di z viene DOPO — e con la sola guardia sulla
   quota quel primo fotogramma pagherebbe l'attrito dell'erba a un
   pallone che ha gia' lasciato il piede.

   COSA CAMBIA OLTRE AL CROSS, detto prima che qualcuno lo scopra:
   ogni calcio sopra 500 unita' riceve da kickBall una quota finta
   (b.vz = min(130,(v-460)*0.4)), quindi anche i tiri forti volano un
   pelo piu' lontano. Il pallonetto, che di quota ne ha molta, cambia di
   piu'. tiroVelocita e la lettura del portiere sono tarate sull'attrito
   pieno (TIRO_ATTR = 1,0498 unita' di velocita' perse per unita'
   percorsa) e adesso sono TARATE LARGHE per la frazione di volo: non
   l'ho ritarata, perche' ritararla e' un'altra voce e mescolarla a
   questa renderebbe illeggibile la misura di tutte e due.

   ---------------------------------------------------------------------
   (b) IL PRIMO TOCCO PUO' SPORCARSI. — ACCUSA VERA.

   Oggi la ricezione e':
       if(d<KICK_R*0.8){ if(sp<420 || b.passTo===i){ b.owner=i; ... } }
   Nessun dado, nessuna tecnica, nessuna pressione: se il pallone e'
   abbastanza lento, o e' indirizzato a te, TI SI INCOLLA AL PIEDE.
   Misurato in partita vera (--b sul gioco base): 0 controlli sporchi su
   ogni ricezione, in ogni partita, sempre.

   LA REGOLA CHE SCELGO, e perche' non e' un sorteggio. La probabilita'
   che il tocco si sporchi e' un PRODOTTO di quattro grandezze che il
   giocatore puo' vedere e governare, e vale zero se sono tutte a favore:

     1. DUREZZA — la velocita' con cui il pallone arriva, normalizzata
        fra TOCCO_V0 = 170 (sotto, il pallone rotola e non si sporca
        MAI: e' un fattore moltiplicativo che vale 0) e TOCCO_V1 = 430.
        E' il fattore piu' importante perche' e' quello che il passatore
        governa: un appoggio morbido resta sempre pulito.
     2. SCOMODO — da dove arriva. Il prodotto scalare fra il verso del
        pallone e il verso in cui il giocatore guarda: -1 se gli arriva
        in faccia (facile, vale 0), +1 se lo insegue da dietro
        (difficile, vale 1). Girarsi verso il pallone e' un gesto, ed e'
        il gesto che paga.
     3. PRESSIONE — la distanza dell'avversario piu' vicino, fra 0 e
        TOCCO_PRESS = 46 unita' (poco meno di due raggi di calciabilita').
        Chi riceve smarcato non sbaglia per la pressione.
     4. TECNICA — l'attributo p.tecnica, l'unica cosa che il giocatore si
        porta addosso. A 40 il fattore vale 0,70, a 80 vale 0,25: 2,8
        volte meglio, a ogni difficolta'. E' QUI che un tecnico si
        distingue da un mediano, e prima di questa toppa non si
        distingueva in niente. MISURATO, nella casella piu' difficile
        (410 unita', da dietro, avversario a 22, cento ricezioni per
        casella): 56% di controlli sporchi a tecnica 40, 26% a 62, 12% a
        80. Quattro volte e mezzo fra i due capi, sulla stessa palla.

       durezza  = clamp((sp-170)/260, 0, 1)
       scomodo  = clamp(0.5 + 0.5*versore(v)·(fx,fy), 0, 1)
       pressione= clamp((46-dAvversario)/46, 0, 1)
       piedi    = clamp((tecnica-40)/40, 0, 1)
       fattore  = 0.70 + (0.25-0.70)*piedi        (2,8 volte fra i due capi)
       difficolta = durezza * (0.18 + 0.44*scomodo + 0.38*pressione)
       P(sporco)  = difficolta * fattore
   I tre pesi sommano a 1, quindi difficolta sta in [0,1] PER COSTRUZIONE e
   la probabilita' sta in [0, 0,70] senza che nessun tetto debba tagliarla.

   E QUI C'E' UNA RITRATTAZIONE, perche' la prima stesura sbagliava. Aveva
   fattore = 1,30 - 0,85*piedi e un tetto a 0,55, e il banco l'ha bocciata:
   nella casella piu' difficile (410 unita', da dietro, avversario a 22)
   tecnica 40 dava il 54% di controlli sporchi e tecnica 62 il 56% — cioe'
   NESSUNA DIFFERENZA, perche' tutti e due finivano contro il tetto. Era
   esattamente il difetto che il progetto rimprovera a stealP nella voce
   L2.1 («smette di saturare, altrimenti a Duro non cambia un bit»), e
   l'avevo appena rifatto in una toppa che esiste per far contare la
   tecnica. Adesso il tetto non c'e' e non serve, e nella stessa casella
   la forbice e' 53% / 34% / 19% per tecnica 40 / 62 / 80.
   Il dado c'e' — Math.random() — ma decide SOLO se l'evento capita: la
   sua probabilita' e l'entita' dello scarto le decide la fisica. Un
   pallone lento, in faccia, senza nessuno intorno: P = 0 esatto, non
   0,01. Questo e' il punto delicato di tutta la voce, ed e' chiuso per
   costruzione e non per taratura.

   E SOPRATTUTTO: UN TOCCO SPORCO NON E' UNA PALLA PERSA. Il pallone non
   passa all'avversario: rimbalza via dal piede, resta VAGANTE, e chi
   arriva prima se lo prende — spesso lo stesso giocatore, dopo essersi
   girato. Tiene il 22-42% della velocita' d'arrivo (piu' e' difficile il
   controllo, piu' scappa) e ruota di un angolo che cresce con la
   difficolta'. Chi l'ha sporcato prende 0,22-0,42 s di kickCd, il tempo
   di girarsi. E' un contrasto in piu' da giocare, non una punizione.

   IL PORTIERE NE E' FUORI. Un portiere che si fa scappare un pallone
   lento davanti alla porta e' una comica, non una simulazione: la sua
   presa e' un altro gesto, con un altro codice (updateKeeper), e questa
   toppa non lo tocca.

   QUANTO SPESSO SUCCEDE, in partita vera e non in laboratorio (quattro
   partite CPU contro CPU, 36.000 fotogrammi, _q-l22.js --b): 14 controlli
   sporchi su 347 contatti, cioe' il 4,0%. Uno ogni venticinque ricezioni,
   distribuito su 8 dei 10 giocatori (i due che mancano sono i portieri).
   Sul gioco base, sullo stesso banco: 0 su 359, sempre.
   Il numero basso non e' un difetto della regola: e' la regola che
   funziona. In una partita quasi tutte le ricezioni sono facili — palla
   lenta, di fronte, senza nessuno addosso — e su quelle P vale zero
   esatto. La quota cresce dove deve: 30% sulla palla forte presa da
   dietro sotto pressione. Se un giorno servisse piu' o meno errore, i due
   bottoni sono TOCCO_V0 e TOCCO_V1, non il dado.

   ---------------------------------------------------------------------
   (c) LA CARICA DEL TIRO OLTRE KICK_R. — ACCUSA FALSA, GIA' RIPARATA.

   L'accusa dice che startCharge pretende il pallone entro KICK_R. Nel
   gioco di oggi, riga 9580, c'e' scritto:
       if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){
   cioe' esattamente la soglia che il progetto chiede: KICK_R = 26, e
   26*1,4 = 36,4 — le "36,4 unita'" del progetto sono questa moltiplica-
   zione, non una misura indipendente. La stessa soglia sta gia' anche in
   fireShot (:9720) e in pallaAPortata (:9848).

   Non consegno una riparazione per (c) perche' non c'e' niente da
   riparare, e --solo c lo verifica al byte invece di dirlo a parola.
   Quello che consegno e' --guasta c: costruisce la versione ACCUSATA
   (soglia riportata a KICK_R secco) perche' il banco possa misurare il
   costo che l'accusa descrive, invece di crederci. La soglia larga SERVE,
   e si vede (_q-l22.js --c, venti situazioni messe in scena):
       oggi, KICK_R*1.4   la carica si apre a 35,3 unita' di mediana
       accusata, KICK_R   si apre a 23,6
   e in quattro partite vere 38 armature aperte su 179 contro 11 su 112.

   MA IL VOLO RESTA IRRAGGIUNGIBILE LO STESSO, e questo il progetto non
   lo dice. Il banco lo misura: 0 tiri al volo su 12 situazioni con la
   palla RASOTERRA, a qualunque velocita' e da qualunque distanza; 3 su 8
   con la palla che scende; e ZERO in quattro partite vere su 54
   occasioni. Il motivo non e' la soglia della carica, e' l'aritmetica di
   updateBall: il volo pretende p.charge >= TAP_T = 0,15 s CON il pallone
   gia' entro KICK_R*1,15 = 29,9 unita'. Un pallone a 300 unita'/s
   percorre 45 unita' in quei 0,15 s, quindi per arrivare armati bisogna
   premere a 29,9 + 300*0,15 = 74,9 unita' — e a 540 unita'/s servono
   110,9. Perfino KICK_R*1,4 = 36,4 e' meno della meta' di quanto serve, e
   nel frattempo la raccolta (che vuole solo d < 20,8 e sp < 420) si
   prende il pallone. Per aria il volo esiste perche' sopra la testa la
   raccolta non guarda.
   NON L'HO RIPARATO: sarebbe una quarta voce, non questa — si tocca
   TAP_T per il volo, oppure KICK_R*1,15, e in tutti e due i casi si
   rimette in discussione il tiro normale. Lo lascio scritto, misurato, e
   con il numero che serve: la soglia d'armo giusta e' 29,9 + v*0,15,
   cioe' una FUNZIONE della velocita' del pallone, non una costante.

   ---------------------------------------------------------------------
   GLI STRUMENTI DA RIFARE DOPO. Ogni blocco cambia la simulazione al
   bit: tutti i banchi a seme fisso che confrontano numeri di partita
   vanno rifatti dopo ogni applicazione, uno alla volta.
     · strumenti/_q-cross2.js  (a) — i cross adesso ARRIVANO: crossDgMed,
       crossInArea, crossArrivato cambiano tutti, ed e' il senso della
       riparazione. I riferimenti .json vanno rigenerati.
     · strumenti/_q-equita.js e _p-equita.js  (a,b) — equilibrio fra le
       squadre: (b) introduce un errore che dipende da p.tecnica, e i
       due undici non hanno la stessa tecnica.
     · strumenti/_q-giocata.js, _p-giocata.js  (b) — il passaggio che
       "riesce" adesso puo' finire con un controllo sporco.
     · strumenti/collaudo.js, _q-collaudo.js, _p-collaudo.js  (a,b,c).
     · strumenti/giocata.js, _q-tutti.js, _tb-collaudo.js.
     · strumenti/folla.js, scatta.js, istantanea.js, silhouette.js,
       _q-istantanea.js, _q-scatta.js  (a,b) — ogni fotografia a seme
       fisso inquadra una partita diversa dal primo fotogramma in cui il
       pallone vola. Le pose vanno riscattate, non ritoccate.
     · strumenti/_q-seme.js  (a,b) — e' il banco che DICHIARA la
       ripetibilita': va rifatto per primo, se no non si sa piu' se una
       differenza e' la toppa o il rumore.
     · strumenti/prestazione.js  (b) — il ciclo sugli avversari dentro la
       raccolta costa: 4 confronti a giocatore a portata, non a
       fotogramma. Misurare, non supporre.
   NON vanno rifatti: _q-precedenza.js, _q-folla.js --gela, _t-apk.py,
   _q-volti.js, _q-ombra.js, _q-solo-ombra.js — non leggono la fisica.
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const DA = path.resolve(arg('in', arg('da', path.join(RADICE, 'CALCETTO-il-gioco.html'))));
const A = process.argv.includes('--dentro') ? DA : arg('out', arg('a', null));
const SOLO = arg('solo', null);
const GUASTA = arg('guasta', null);

/* ---------------------------------------------------------------------
   GLI ANCORAGGI, byte per byte come stanno nel gioco.
   --------------------------------------------------------------------- */
const ANCORE = [
  {
    id: 'a1', blocco: 'a',
    nome: 'a 1/1 — l attrito di updateBall sotto la guardia della quota',
    vecchio:
'  const fr=Math.pow(0.35,dt*ATTR_K);     // attrito esponenziale, in scala di campo\n' +
'  b.vx*=fr; b.vy*=fr;',
    nuovo:
'  /* L ATTRITO E DELL ERBA, NON DELL ARIA. Prima di questa guardia le due\n' +
'     righe qui sotto giravano SEMPRE, e un pallone in volo perdeva\n' +
'     velocita come se stesse strisciando: ogni cross cadeva dal 21,5% al\n' +
'     31,2% corto rispetto al punto che doCross aveva calcolato (misura in\n' +
'     strumenti/_q-l22.js --a). La quota da sola non basta come guardia:\n' +
'     nel fotogramma del calcio b.z e ancora 0 perche l integrazione di z\n' +
'     viene dopo, e senza b.vz<=0 quel primo fotogramma pagherebbe\n' +
'     l attrito dell erba a un pallone gia partito. */\n' +
'  if(b.z<=0 && b.vz<=0){\n' +
'    const fr=Math.pow(0.35,dt*ATTR_K);   // attrito esponenziale, in scala di campo\n' +
'    b.vx*=fr; b.vy*=fr;                  // e si paga solo con la palla a terra\n' +
'  }',
  },
  {
    id: 'b1', blocco: 'b',
    nome: 'b 1/2 — le quattro costanti del primo tocco, accanto a KICK_R',
    vecchio:
'const CARRY_DIST = 16;             // pallone davanti ai piedi',
    nuovo:
'const CARRY_DIST = 16;             // pallone davanti ai piedi\n' +
'/* IL PRIMO TOCCO PUO SPORCARSI — le quattro grandezze che lo decidono.\n' +
'   Stanno qui e non dentro updateBall perche sono costanti di gioco, e\n' +
'   perche chi le vuole cambiare deve trovarle accanto a KICK_R. */\n' +
'const TOCCO_V0 = 170;              // sotto questa velocita il pallone rotola: non si sporca mai\n' +
'const TOCCO_V1 = 430;              // sopra, il controllo e al massimo della difficolta\n' +
'const TOCCO_PRESS = 46;            // entro questa distanza un avversario mette pressione\n' +
'/* i due capi del fattore TECNICA, e non c e nessun tetto sopra: un tetto\n' +
'   che morde fa saturare la probabilita e sopra la saturazione un tecnico\n' +
'   e un mediano tornano identici — cioe la cosa che questa toppa esiste\n' +
'   per impedire. Qui il limite superiore e 0,70 PER COSTRUZIONE (la\n' +
'   difficolta sta in [0,1] perche i tre pesi sommano a 1) e la forbice fra\n' +
'   i piedi peggiori e i migliori resta 2,8 volte a ogni difficolta. */\n' +
'const TOCCO_SCARSO = 0.70;         // fattore a tecnica 40 e sotto\n' +
'const TOCCO_BRAVO = 0.25;          // fattore a tecnica 80 e sopra',
  },
  {
    id: 'b2', blocco: 'b',
    nome: 'b 2/2 — la raccolta di updateBall, che oggi non puo sbagliare',
    vecchio:
'  /* raccolta: un giocatore a portata prende palla */\n' +
'  for(const p of G.players){\n' +
'    if(p.slide>=0||p.recover>0||p.kickCd>0||p.out>0||p.rove>=0) continue;\n' +
'    if(b.z>Z_SOPRA_TESTA) continue;          // palla alta: non la si controlla coi piedi\n' +
'    const d=len(b.x-p.x,b.y-p.y);\n' +
'    if(d<KICK_R*0.8){\n' +
'      if(sp<420 || b.passTo===G.players.indexOf(p)){\n' +
'        b.owner=G.players.indexOf(p); b.passTo=-1;\n' +
'        segnaTocco(b.owner);             // anche il controllo e\' un tocco\n' +
'        break;\n' +
'      }\n' +
'    }\n' +
'  }',
    nuovo:
'  /* raccolta: un giocatore a portata prende palla */\n' +
'  for(const p of G.players){\n' +
'    if(p.slide>=0||p.recover>0||p.kickCd>0||p.out>0||p.rove>=0) continue;\n' +
'    if(b.z>Z_SOPRA_TESTA) continue;          // palla alta: non la si controlla coi piedi\n' +
'    const d=len(b.x-p.x,b.y-p.y);\n' +
'    if(d<KICK_R*0.8){\n' +
'      if(sp<420 || b.passTo===G.players.indexOf(p)){\n' +
'        const pi=G.players.indexOf(p);\n' +
'        /* ===============================================================\n' +
'           IL PRIMO TOCCO PUO SPORCARSI.\n' +
'           Prima di queste righe la ricezione era perfetta sempre: il\n' +
'           pallone si incollava al piede, e fra un tecnico e un mediano\n' +
'           non c era un bit di differenza. Adesso la probabilita che il\n' +
'           controllo scappi e il PRODOTTO di quattro grandezze visibili,\n' +
'           e vale zero esatto quando sono tutte a favore: il dado decide\n' +
'           se l evento capita, non quanto e probabile.\n' +
'           Il portiere ne e fuori: la sua presa e un altro gesto, e sta\n' +
'           in updateKeeper. =========================================== */\n' +
'        let sporco = 0;\n' +
'        if(p.role!==\'gk\'){\n' +
'          /* 1. DUREZZA — quanto forte arriva. E un fattore MOLTIPLICATIVO,\n' +
'             quindi sotto TOCCO_V0 tutto il resto non conta: un appoggio\n' +
'             morbido resta pulito comunque, ed e il passatore a governarlo. */\n' +
'          const durezza = clamp((sp-TOCCO_V0)/(TOCCO_V1-TOCCO_V0), 0, 1);\n' +
'          /* 2. SCOMODO — da dove arriva. Il verso del pallone contro il\n' +
'             verso in cui il giocatore guarda: in faccia vale 0 (facile),\n' +
'             alle spalle vale 1. Girarsi verso il pallone e un gesto, e qui\n' +
'             e il gesto che paga. */\n' +
'          const bl = Math.max(1, sp);\n' +
'          const scomodo = clamp(0.5 + 0.5*((b.vx/bl)*p.fx + (b.vy/bl)*p.fy), 0, 1);\n' +
'          /* 3. PRESSIONE — l avversario piu vicino. Chi riceve smarcato non\n' +
'             sbaglia per la pressione, e questo ciclo gira solo per chi e\n' +
'             gia a portata di raccolta: non e un costo per fotogramma. */\n' +
'          let dAvv = 1e9;\n' +
'          for(const q of G.players){\n' +
'            if(q.team===p.team || q.out>0 || q.slide>=0) continue;\n' +
'            const dq = len(q.x-p.x, q.y-p.y);\n' +
'            if(dq<dAvv) dAvv=dq;\n' +
'          }\n' +
'          const pressione = clamp((TOCCO_PRESS-dAvv)/TOCCO_PRESS, 0, 1);\n' +
'          /* 4. TECNICA — l unica cosa che il giocatore porta di suo, ed e\n' +
'             qui che un tecnico si distingue da un mediano. */\n' +
'          const piedi = clamp((p.tecnica-40)/40, 0, 1);\n' +
'          const fattore = TOCCO_SCARSO + (TOCCO_BRAVO-TOCCO_SCARSO)*piedi;\n' +
'          /* i tre pesi sommano a 1: la difficolta sta in [0,1] PER\n' +
'             COSTRUZIONE, quindi la probabilita sta in [0, 0,70] senza che\n' +
'             nessun tetto debba tagliarla — e senza taglio la forbice fra i\n' +
'             piedi buoni e quelli scarsi resta la stessa a ogni difficolta. */\n' +
'          const diffi = durezza*(0.18 + 0.44*scomodo + 0.38*pressione);\n' +
'          const pSporco = diffi*fattore;\n' +
'          if(pSporco>0 && Math.random()<pSporco) sporco = diffi;\n' +
'        }\n' +
'        if(sporco>0){\n' +
'          /* IL TOCCO SPORCO NON E UNA PALLA PERSA: e una palla VAGANTE.\n' +
'             Il pallone rimbalza via dal piede tenendo dal 22% al 42% della\n' +
'             velocita d arrivo (piu e difficile il controllo, piu scappa) e\n' +
'             ruotando di un angolo che cresce con la stessa difficolta: lo\n' +
'             scarto e geometrico, non sorteggiato in ampiezza. Chi l ha\n' +
'             sporcata paga il tempo di girarsi, e chiunque puo arrivarci\n' +
'             prima — spesso lui stesso. */\n' +
'          const dl = Math.max(1, sp);\n' +
'          const ang = (Math.random()*2-1)*(0.45 + 0.75*sporco);\n' +
'          const cs = Math.cos(ang), sn = Math.sin(ang);\n' +
'          const rx = (b.vx/dl)*cs - (b.vy/dl)*sn;   // il versore d arrivo, ruotato\n' +
'          const ry = (b.vx/dl)*sn + (b.vy/dl)*cs;   // di quanto il piede ha sbagliato\n' +
'          const resto = sp*(0.22 + 0.20*sporco);    // la corsa che resta al pallone\n' +
'          b.vx = rx*resto; b.vy = ry*resto;\n' +
'          b.passTo = -1;                            // il passaggio e finito, comunque sia andato\n' +
'          segnaTocco(pi);                           // l ha toccata: e un tocco suo, e la rete lo sa\n' +
'          p.kickCd = 0.22 + 0.20*sporco;            // il tempo di girarsi e riprenderla\n' +
'          schiacciaPalla(0.09, rx, ry);             // il pallone si deforma: e stato colpito\n' +
'          Audio5.beep(210);                         // e si sente che non e stato un controllo\n' +
'          break;\n' +
'        }\n' +
'        b.owner=pi; b.passTo=-1;\n' +
'        segnaTocco(b.owner);             // anche il controllo e\' un tocco\n' +
'        break;\n' +
'      }\n' +
'    }\n' +
'  }',
  },
];

/* IL BLOCCO (c) NON E' UNA SOSTITUZIONE: E' UNA VERIFICA.
   L'accusa dice che startCharge pretende il pallone entro KICK_R. Qui si
   controlla al byte che nel file ci sia gia' la soglia larga, e non si
   scrive niente. Il campo `guasto` e' la strada opposta: costruisce la
   versione ACCUSATA, che serve al banco per misurare il costo che
   l'accusa descrive. */
const VERIFICA_C = {
  blocco: 'c',
  nome: 'c — startCharge oltre KICK_R*1.4',
  atteso:
'  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R*1.4){\n' +
'    /* TIRA con la palla ALTA che scende nella finestra: e\' la rovesciata',
  guasto:
'  if(G.ball.owner!==pi && len(G.ball.x-p.x,G.ball.y-p.y)>KICK_R){\n' +
'    /* TIRA con la palla ALTA che scende nella finestra: e\' la rovesciata',
};

/* ------------------------------------------------------------------ */
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }
let src = fs.readFileSync(DA, 'utf8');

/* --- la strada del guasto: costruisce la versione ACCUSATA di (c) --- */
if (GUASTA) {
  if (GUASTA !== 'c') { console.error('FALLITO: --guasta accetta solo «c».'); process.exit(1); }
  if (!A) { console.error('FALLITO: --guasta vuole un --out.'); process.exit(1); }
  const n = src.split(VERIFICA_C.atteso).length - 1;
  if (n !== 1) {
    console.error('FALLITO: ancoraggio «' + VERIFICA_C.nome + '» trovato ' + n + ' volte, non 1.');
    console.error('  cercavo:\n' + VERIFICA_C.atteso.split('\n').map(r => '    | ' + r).join('\n'));
    console.error('\nNon scrivo niente.');
    process.exit(1);
  }
  const dest0 = path.resolve(A);
  fs.mkdirSync(path.dirname(dest0), { recursive: true });
  fs.writeFileSync(dest0, src.split(VERIFICA_C.atteso).join(VERIFICA_C.guasto));
  console.log('GUASTO costruito (non e\' una riparazione): startCharge riportato a KICK_R secco.');
  console.log('  da:   ' + DA);
  console.log('  a:    ' + dest0);
  console.log('  serve solo al banco, per misurare il costo che l\'accusa (c) descrive.');
  process.exit(0);
}

/* --- la verifica di (c): non scrive, dichiara --- */
if (SOLO === 'c') {
  const n = src.split(VERIFICA_C.atteso).length - 1;
  const g = src.split(VERIFICA_C.guasto).length - 1;
  console.log('BLOCCO (c) — VERIFICA, non riparazione.');
  console.log('  soglia larga (KICK_R*1.4) in startCharge: ' + n + ' occorrenze');
  console.log('  soglia stretta (KICK_R secco)           : ' + g + ' occorrenze');
  if (n === 1 && g === 0) {
    console.log('\nACCUSA (c) FALSA su ' + path.basename(DA) + ': la soglia e\' GIA\' KICK_R*1.4 = 36,4');
    console.log('unita\' (KICK_R vale 26). Non c\'e\' niente da riparare, e non scrivo niente.');
    console.log('Per misurare il costo che l\'accusa descrive: --guasta c, poi _q-l22.js --c.');
    process.exit(0);
  }
  if (n === 0 && g === 1) {
    console.error('\nFALLITO: questo file E\' LA VERSIONE ACCUSATA (soglia KICK_R secco).');
    console.error('L\'ha costruito --guasta c, e serve solo al banco: non si spedisce.');
    process.exit(1);
  }
  console.error('\nFALLITO: il file non e\' ne\' quello riparato ne\' quello accusato. Non so leggerlo.');
  process.exit(1);
}

if (!A) { console.error('FALLITO: manca --out <destinazione> (o --dentro).'); process.exit(1); }
if (SOLO && !ANCORE.some(x => x.blocco === SOLO)) {
  console.error('FALLITO: --solo ' + SOLO + ' non esiste. Blocchi: a (attrito), b (primo tocco), c (verifica).');
  process.exit(1);
}
const DAFARE = SOLO ? ANCORE.filter(x => x.blocco === SOLO) : ANCORE;

const primaCar = src.length;
const primaByte = Buffer.byteLength(src, 'utf8');

/* PRIMA SI CONTROLLA TUTTO, POI SI SCRIVE. Una toppa che applica il primo
   ancoraggio e inciampa sul secondo lascia un file a meta': peggio di una
   toppa che non applica. */
let male = 0;
for (const x of DAFARE) {
  const n = src.split(x.vecchio).length - 1;
  if (n !== 1) {
    male++;
    console.error('FALLITO: ancoraggio «' + x.nome + '» trovato ' + n + ' volte, non 1.');
    console.error('  cercavo:\n' + x.vecchio.split('\n').map(r => '    | ' + r).join('\n'));
  }
  /* e non deve essere GIA' toppato: se il testo nuovo c'e' gia', ci si
     ferma invece di raddoppiarlo */
  const g = src.split(x.nuovo).length - 1;
  if (g !== 0) { male++; console.error('FALLITO: «' + x.nome + '» risulta GIA\' applicato (' + g + ' volte).'); }
}
if (male) { console.error('\nNon scrivo niente. ' + male + ' ancoraggi fuori posto.'); process.exit(1); }

for (const x of DAFARE) src = src.split(x.vecchio).join(x.nuovo);

const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
const dopoCar = src.length, dopoByte = Buffer.byteLength(src, 'utf8');
const blocchi = [...new Set(DAFARE.map(x => x.blocco))].join('+');
console.log('toppa L2.2 applicata: ' + DAFARE.length + ' ancoraggi, blocchi ' + blocchi +
  (SOLO ? ' (--solo ' + SOLO + ')' : ' (c e\' una verifica: --solo c)'));
for (const x of DAFARE) console.log('    · ' + x.nome);
console.log('  da:   ' + DA);
console.log('  a:    ' + dest);
/* CARATTERI E BYTE NON SONO LA STESSA COSA: src.length conta unita'
   UTF-16, il file sul disco conta byte UTF-8, e in questi commenti ci
   sono accenti. Si stampano tutti e due, con il nome giusto. */
console.log('  delta: ' + (dopoCar - primaCar) + ' caratteri  ·  ' +
  (dopoByte - primaByte) + ' byte UTF-8 sul disco');
console.log('  RICORDA: questi blocchi cambiano la simulazione AL BIT.');
console.log('  I banchi a seme fisso vanno rifatti — l\'elenco e\' in cima a questo file.');
