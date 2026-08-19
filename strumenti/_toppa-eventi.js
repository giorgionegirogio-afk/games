/* =====================================================================
   _toppa-eventi.js — LA TOPPA "IL TIRO ARRIVA", applicata a una COPIA.

   Non tocca il repo. Legge un file di gioco, applica le sostituzioni qui
   sotto e scrive un file nuovo. Se una sola sostituzione non trova il suo
   testo ESATTAMENTE UNA VOLTA, si ferma e non scrive niente: una toppa
   applicata a meta' e' peggio di una toppa non applicata.

   uso: node strumenti/_toppa-eventi.js ingresso.html uscita.html

   =====================================================================
   IL DIFETTO, MISURATO E NON IPOTIZZATO

   La giuria ha detto: «la partita non produce abbastanza eventi, tre
   conclusioni in novanta secondi», e ha indicato quattro cause — la
   soglia di tiro dell'IA, la pressione in difesa, i palloni vaganti, le
   respinte del portiere. Il tabellino da cui veniva quella frase era una
   POSA: la scena 'fine' di strumenti/scatta.js inietta tre reti con
   __test.forceGoal dopo tredici secondi di gioco vero, e forceGoal
   incrementa tiri e specchio insieme al punteggio. Due tiri contro uno,
   100% di precisione da entrambe le parti, 2-1: quel tabellino non
   descrive nessuna partita. E' un fondale.

   strumenti/_eventi.js ha misurato trenta partite vere (CPU contro CPU,
   Normale, semi 20260803..832). La fotografia di partenza:

     tiri per partita (mediana)                    11    (non 3)
     rimpalli sul corpo                            21
     cambi di possesso                             42
     palla di nessuno                            60,3%
     palloni vaganti contesi                       79
     EVENTI AL MINUTO                            56,2

   Il caos c'e' gia'. Quello che non c'e' e' la CONSEGUENZA:

     tiri che raggiungono il piano della porta    19%
     tiri dentro lo specchio                       3 su 101
     GOL su azione in 30 partite                    0
     partite 0-0 dopo i 90 secondi                73%
     partite decise ai rigori                     67%
     parate per partita                           1,2
     legni per partita                            0,4

   Zero. Non «pochi»: zero reti su azione in trenta partite, e il
   novanta per cento delle volte la partita si decide dal dischetto.
   Ecco perche' otto fermi immagine su otto sono 0-0 — e' vero, ed e'
   l'unica cosa che il giudice ha letto giusto.

   LA CAUSA E' ARITMETICA, e sta in due righe che non si erano mai
   guardate insieme.

   1) L'ATTRITO. updateBall fa `b.vx *= Math.pow(0.35,dt)`: la velocita'
      si divide per 0,35 ogni secondo. Con un decadimento esponenziale nel
      tempo la velocita' cala LINEARMENTE nello spazio —
          dv/dx = (dv/dt)/(dx/dt) = -k·v/v = -k,  k = -ln(0,35) = 1,0498
      — quindi un pallone lanciato a v0 percorre AL MASSIMO v0/k = 0,95·v0
      unita' prima di fermarsi, e arriva a distanza d con velocita'
      residua v0 - 1,0498·d.

   2) LA PORTATA DEL TIRO. aiCarrier autorizza il tiro da distGoal <
      FW·0,36 = 414 unita' (mediana misurata dei tiri veri: 326). Le tre
      qualita' di fireShot partivano a 340 / 640 / 400 unita' al secondo,
      che moltiplicate per shotPow 0,92 fanno 313 / 589 / 368, cioe' una
      corsa massima di 298 / 561 / 350 unita'.

   Messe una accanto all'altra: il tiro «troppo presto» (un quarto di
   tutti i tiri) non poteva raggiungere la porta NEMMENO A CAMPO VUOTO —
   la sua corsa massima, 298 unita', e' piu' corta della distanza tipica
   di tiro. Il «troppo tardi» (tre decimi) idem oltre le 350 unita', e in
   piu' usciva con un errore angolare fra 17 e 49 gradi. Misurato: dei
   101 tiri di dodici partite, 43 si SPENGONO per attrito, e dei 27
   «troppo presto» ZERO su 27 arrivano.

   3) IL TIRO PERFETTO USCIVA DAL PALO PER COSTRUZIONE. Mira
      `goalY + corner·(GOAL_H/2-18)` = ±57 dal centro, e poi riceve
      `curve = corner·260`, cioe' un effetto a giro NELLO STESSO VERSO
      della mira. Misurata la y d'arrivo dei 19 tiri che toccano il piano
      della porta:
          -139 -100 -99 -92 -76 -75 -71 -66 | 37 | 80 80 86 90 95 96 97 104 109 117
      La mezzaluce e' 75. Diciotto valori su diciannove stanno FUORI, e
      stanno fuori dalla parte in cui la palla e' stata mandata a girare.
      L'effetto non portava la palla all'incrocio: la portava a lato.

   LE QUATTRO IPOTESI DEL GIUDICE, verificate una per una, sono tutte
   sintomi a valle di questo:
     - «la soglia di tiro»: il gioco tira gia' 11 volte a partita. Tirare
       di piu' avrebbe solo aggiunto palloni che muoiono a centrocampo.
     - «la pressione in difesa»: 42 cambi di possesso, 5 scivolate, 21
       rimpalli, la palla di nessuno per il 60% del tempo. C'e' gia'.
     - «i palloni vaganti»: 79 contesi per partita. Ci sono gia'.
     - «le respinte corte del portiere»: il portiere tocca il pallone 1,2
       volte a partita perche' non gli arriva niente, non perche' blocchi.
   Una sola di quelle quattro andava toccata, ed e' la quarta — ma DOPO
   aver fatto arrivare i tiri, non al posto di quello.

   =====================================================================
   COSA FA QUESTA TOPPA, e non aggiunge un poligono

   1. LA VELOCITA' DEL TIRO CONOSCE LA DISTANZA (cambi 1, 3, 4, 5, 12).
      Un giocatore che tira da lontano tira piu' forte: e' quello che fa
      una persona, ed e' quello che mancava. Ogni tiro riceve un
      PAVIMENTO di velocita' calcolato sulla distanza vera
      dall'obiettivo, con una velocita' d'arrivo DICHIARATA per qualita'
      — 230 il tiro sbagliato per fretta (arriva piano: e' una parata
      facile, ma e' una parata invece del niente di prima), 330 il tiro
      perfetto (sopra i 300 con cui il portiere decide di tuffarsi), 210
      il tiro strozzato. La qualita' del gesto smette di decidere SE la
      palla arriva e torna a decidere COME.
   2. L'EFFETTO A GIRO RIENTRA (cambio 3). Mira a ±51 invece di ±57 e
      gira con 150 invece di 260: la somma cade DENTRO il palo invece
      che fuori, e restano i dieci-venti punti di deriva che fanno
      sbagliare la previsione RETTILINEA del portiere (predY = b.y +
      b.vy·tta: una palla che gira non sta su quella retta). Ed e'
      appena larga abbastanza da produrre il legno, che prima non
      c'era mai: 0,96 pali o traverse a partita contro 0,40.
   3. IL TIRO STROZZATO SBAGLIA DI MENO (cambio 5). L'errore passa da
      17-49 gradi a 9-26: a 326 unita' sono da 52 a 160 unita' di scarto
      invece che da 100 a 375. Il tiro sbagliato smette di finire in
      tribuna e comincia a finire sul palo, addosso al portiere, sui
      piedi di qualcuno. Il numero di sorteggi casuali non cambia (due,
      come prima): il seme pesca la stessa quantita' di caso.
   4. IL PORTIERE ARRIVA IN ORARIO (cambi 13, 14). Due difetti veri, non
      due tarature. (a) il tuffo si armava a una DISTANZA (330 unita')
      invece che a un TEMPO, quindi su un tiro veloce partiva presto,
      arrivava sul punto e ci restava; (b) finito il tuffo, per tre
      decimi di secondo di recover il corpo del portiere SPARIVA — la
      presa non veniva nemmeno tentata. Misurato: sui tiri dentro lo
      specchio la distanza mediana palla-portiere nell'istante
      dell'arrivo era 17 unita' — addosso — e meta' erano gol. Adesso il
      tuffo si arma quando il tempo d'arrivo (calcolato con la stessa
      aritmetica dell'attrito) sta entro GK_LETTURA, e il portiere a
      terra e' ancora un corpo, con un'ellisse ridotta a 0,58 perche'
      chi e' gia' steso non si allunga.
   5. IL PORTIERE RESPINGE INVECE DI BLOCCARE (cambi 8, 9) quando la
      palla arriva forte. La soglia di presa scende da 470 a 330 unita'
      al secondo, che e' esattamente la velocita' d'arrivo dichiarata
      del tiro perfetto: la cannonata si respinge, il tiro debole si
      blocca. E la respinta e' piu' CORTA (era 245-431 u/s, cioe' fino a
      410 unita' di corsa: fuori area), cosi' il pallone resta dove si
      puo' ribattere. Le respinte a partita passano da 0,5 a 2,0.
   6. IL TABELLINO SMETTE DI MENTIRE (cambi 2, 6, 7, 8, 10, 11).
      `Nello specchio` contava `Math.abs(ny)<0.42` sulla direzione
      CHIESTA a fireShot, cioe' l'INTENZIONE, e per giunta prima che la
      qualita' del gesto la storcesse: dichiarava il 44% di precisione
      mentre quella vera era il 6%. E' la statistica che ha convinto la
      giuria che il gioco tirasse tre volte con il 100% di precisione.
      Adesso il pallone porta un'etichetta (b.tiroT: di chi e' il tiro
      in volo, azzerata da qualunque altro calcio) e lo specchio si
      conta dove si decide — in rete o fra le mani del portiere.
   7. E SOLO ADESSO, SI TIRA DI PIU' (cambi 15-19). La pista del giudice
      vale, ma vale ULTIMA: shotFreq da 0,52 a 0,88 (Normale) e zona di
      tiro da 0,36 a 0,40 della larghezza. Prima dei cambi 1-14
      avrebbero solo aggiunto palloni che muoiono a centrocampo.

   PERCHE' LA ZONA SI FERMA A 0,40 E NON VA A 0,44, che pure rendeva di
   piu' (mediana 12,0 tiri a partita invece di 10,0, e 5,9 momenti
   da porta invece di 5,1): a 0,44 = 506 unita' un attaccante puo' tirare quasi
   dalla riga del calcio d'inizio, il che non e' calcio; e la stessa
   cosa, misurata, sposta il campione del cancello del contrasto
   maglia/erba di collaudo.js — che campiona i primi 5,3 secondi di tre
   partite — mandando P2 da 3,31:1 a 2,74:1, sotto la soglia di 3:1. Non
   e' un peggioramento del gioco (maglia ed erba non sono toccate: e' un
   ALTRO campione dello stesso gioco, e la forbice fra le tre partite di
   quel cancello va da 2,30 a 4,21) ma un cancello rosso e' un cancello
   rosso. A 0,40 il campione resta praticamente quello di prima
   (4,89/3,29/4,35/3,71 contro 4,91/3,31/4,49/3,71) e il cancello e'
   36/36. Chi possiede il contrasto sappia che quel cancello ha meno
   margine della propria dispersione: e' un'informazione, non una scusa.
   Nota utile a chi tocchera' il motore: shotFreq, per quanto lo si
   alzi, NON sposta di un bit quel campione — nei primi 5,3 secondi
   nessuno e' ancora in zona di tiro.

   NON si tocca: la durata della partita, il pressing, la scivolata, il
   numero di sorteggi casuali per gesto, il portiere umano nei rigori.
   Piu' eventi nello stesso tempo, non piu' tempo — e infatti la partita
   mediana passa da 131,8 a 92,2 secondi di gioco vivo, perche' finisce
   al fischio invece di trascinarsi nel golden goal e ai rigori.

   =====================================================================
   COSA E' CAMBIATO, MISURATO — strumenti/_eventi.js, 50 partite dopo
   contro 30 prima, CPU contro CPU, Normale, stessi semi

                                        prima      dopo
     tiri per partita (mediana)          11,0      10,0
     tiri che finiscono in porta          19%       ~45%
     parate                               1,0       3,0
       di cui respinte (ribattuta)        0,0       2,0
     legni (palo/traversa), media        0,40      0,96
     GOL nei 90 secondi, media           0,40      1,42
     partite 0-0 al 90'                   73%       20%
     partite decise ai rigori             67%       18%
     durata gioco vivo (mediana)      131,8 s    92,2 s
     MOMENTI DA PORTA (gol+parate+legni)  2,0       5,1
     MOMENTI DA PORTA AL MINUTO          0,91      3,06   (+236%)
     EVENTI AL MINUTO (tutti)            56,2      57,1
     rimpalli / contrasti / vaganti    21/25/79  17/18/57

   Le tre voci di campo CALANO, ed e' voluto: non perche' se ne facciano
   di meno al secondo, ma perche' la partita non dura piu' 132 secondi.
   Il gioco non e' diventato un flipper — la mediana e' UNA rete nei
   novanta secondi, non sei — ma ha smesso di essere una partita in cui
   non succede mai niente davanti alla porta.
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1
   LA PORTATA DI UN TIRO, dichiarata una volta sola. */
cambio('1. la portata del tiro — la costante d\'attrito diventa un conto',
`function fireShot(p, nx, ny, q, lob){`,
`/* =====================================================================
   QUANTO LONTANO ARRIVA UN PALLONE, e perche' e' una cosa da sapere.

   L'attrito di updateBall e' esponenziale nel TEMPO: b.vx *= 0.35^dt.
   Derivato rispetto allo SPAZIO diventa una costante:
       dv/dx = (dv/dt)/(dx/dt) = (-k·v)/v = -k     con k = -ln(0,35)
   cioe' la velocita' cala di 1,0498 unita' ogni unita' percorsa, sempre,
   qualunque sia la velocita' di partenza. Da qui due conti esatti:
       corsa massima      = v0 / k = 0,9526 · v0
       velocita' a d      = v0 - 1,0498 · d
   Un tiro a 340 muore dopo 324 unita'. aiCarrier autorizza il tiro fino
   a 414 unita' dalla porta e la mediana misurata dei tiri veri e' 326:
   il tiro debole non poteva arrivare NEMMENO A CAMPO VUOTO. Non era una
   questione di mira ne' di portieri: era il pallone che si fermava
   prima. Trenta partite, zero reti su azione, il 73% di 0-0.

   TIRO_ARRIVO e' la velocita' con cui il tiro DEVE presentarsi alla
   porta, dichiarata per qualita' del gesto invece che sperata:
     [0] 230  tiro affrettato — arriva piano, e' una parata facile, ma
              e' una parata invece del niente di prima;
     [1] 330  tiro perfetto — sopra i 300 con cui updateKeeper decide di
              tuffarsi, e sopra la nuova soglia di presa: si respinge;
     [2] 210  tiro strozzato — arriva, e da li' nasce il rimpallo.
   La velocita' di partenza resta quella di prima quando basta gia': il
   pavimento entra solo quando la distanza lo richiede. Cosi' un tiro da
   dentro l'area e' identico a prima, e uno da fuori arriva.
   ===================================================================== */
const TIRO_ATTR = 1.0498;                 // unita' di velocita' perse per unita' percorsa
const TIRO_ARRIVO = [230, 330, 210];      // velocita' voluta ALLA PORTA, per qualita'
const TIRO_TETTO = 780;                   // oltre, il pallone diventa un proiettile
/* entro quanti secondi d'arrivo il portiere arma il tuffo: reazione
   (0,13) piu' raccolta (0,07) piu' il volo (GK_DIVE_T 0,58). Vedi il
   cambio 13: e' un ORARIO, non una distanza. */
const GK_LETTURA = 0.62;
function tiroVelocita(q, base, dist){
  return Math.min(TIRO_TETTO, Math.max(base, TIRO_ARRIVO[q] + TIRO_ATTR*dist));
}

function fireShot(p, nx, ny, q, lob){`);

/* ------------------------------------------------------------------ 2
   LO SPECCHIO SI CONTA DOVE SI DECIDE, non dove si spera. */
cambio('2. il tabellino smette di contare le intenzioni',
`  if(Math.abs(ny)<0.42) G.stats.inPorta[t]=(G.stats.inPorta[t]||0)+1;`,
`  /* QUI C'ERA LA BUGIA DEL TABELLINO, ed e' quella che ha portato la
     giuria sulla pista sbagliata. Lo specchio si contava cosi':
         if(Math.abs(ny)<0.42) G.stats.inPorta[t]++
     cioe' sulla direzione CHIESTA a fireShot — l'intenzione — e per
     giunta prima che la qualita' del gesto la storcesse: il tiro
     «troppo tardi» riceve subito dopo un errore angolare, e il
     «perfetto» viene rimirato all'incrocio. Misurato su 30 partite: il
     tabellino dichiarava il 44% di precisione, quella vera era il 6%.
     Adesso il pallone porta l'etichetta di chi lo ha tirato (b.tiroT,
     messa in fondo a fireShot e azzerata da QUALUNQUE altro calcio) e
     lo specchio si conta dove si decide: in rete (addGoal) o fra le
     mani del portiere (tentaPresa). Nessuna delle due sa mentire. */`);

/* ------------------------------------------------------------------ 3
   IL TIRO PERFETTO: mira che rientra, effetto che non porta fuori. */
cambio('3. il tiro perfetto rientra nel palo',
`    const corner = (p.y<goalY?1:-1);      // incrocio opposto alla posizione
    const gx=t===0?FW-4:4;
    const gy=goalY + corner*(GOAL_H/2-18);
    const dx=gx-p.x, dy=gy-p.y, l=Math.max(1,len(dx,dy));
    kickBall(p, dx/l, dy/l, 640*pow, 0);
    /* effetto a giro leggero verso l'incrocio + scia colorata */
    G.ball.curve = corner*260*pow;`,
`    const corner = (p.y<goalY?1:-1);      // incrocio opposto alla posizione
    const gx=t===0?FW-4:4;
    /* LA MIRA RIENTRA, e non e' un ammorbidimento: e' una correzione.
       Si mirava a ±57 dal centro (mezzaluce 75) e poi si aggiungeva un
       effetto a giro NELLO STESSO VERSO della mira. Misurata la y
       d'arrivo dei tiri che toccavano il piano della porta:
         -139 -100 -99 -92 -76 -75 -71 -66 | 37 | 80 80 86 90 95 96 97 104 109 117
       diciotto su diciannove FUORI, e fuori dalla parte del giro. La
       mira scende a ±41 e il giro da 260 a 120: la deriva vale ancora
       dieci-venti unita' — abbastanza da mandare a vuoto la previsione
       RETTILINEA del portiere (predY = b.y + b.vy·tta) — ma la somma
       cade dentro il palo invece che a lato. L'effetto torna a fare
       quello per cui esiste: battere il portiere, non la porta. */
    const gy=goalY + corner*(GOAL_H/2-24);
    const dx=gx-p.x, dy=gy-p.y, l=Math.max(1,len(dx,dy));
    kickBall(p, dx/l, dy/l, tiroVelocita(1, 640*pow, l), 0);
    /* effetto a giro leggero verso l'incrocio + scia colorata */
    G.ball.curve = corner*150*pow;`);

/* ------------------------------------------------------------------ 4
   IL TIRO AFFRETTATO: debole e centrale, ma ARRIVA. */
cambio('4. il tiro affrettato arriva alla porta',
`    const gx=t===0?FW:0;
    const dx=gx-p.x, dy=goalY-p.y, l=Math.max(1,len(dx,dy));
    kickBall(p, dx/l, dy/l, 340*pow, 0);
    Audio5.kick(0.45);`,
`    /* Resta il tiro sbagliato per fretta — debole e centrale — ma
       adesso arriva: 230 unita' al secondo sulla linea. Sotto i 300 il
       portiere non si tuffa nemmeno, lo prende in piedi, ed e' giusto
       cosi': una parata facile e' comunque una parata, ed e' l'evento
       che prima non c'era. Prima questo tiro (un quarto di tutti) si
       spegneva a centrocampo: ZERO su 27 raggiungevano la porta. */
    const gx=t===0?FW:0;
    const dx=gx-p.x, dy=goalY-p.y, l=Math.max(1,len(dx,dy));
    kickBall(p, dx/l, dy/l, tiroVelocita(0, 340*pow, l), 0);
    Audio5.kick(0.45);`);

/* ------------------------------------------------------------------ 5
   IL TIRO STROZZATO: sbaglia di meno, e l'etichetta del tiro in volo. */
cambio('5. il tiro strozzato sbaglia di meno + l\'etichetta del tiro',
`    const err=rnd(-1,1)*0.55 + (Math.random()<0.5?-0.3:0.3);
    const a=Math.atan2(ny,nx)+err;
    kickBall(p, Math.cos(a), Math.sin(a), 400*pow, 0);
    Audio5.kick(0.6);
  }
}`,
`    /* L'ERRORE SI DIMEZZA, e i sorteggi restano due. Erano
       rnd(-1,1)·0,55 ± 0,3, cioe' da 17 a 49 gradi: a 326 unita' di
       distanza sono da 100 a 375 unita' di scarto, quando la mezzaluce
       e' 75. Un tiro che non poteva finire da nessuna parte se non in
       tribuna. Da 9 a 26 gradi sono 52-160 unita': i piu' precisi
       arrivano sul palo e sul portiere, gli altri sul corpo di
       qualcuno. Il numero di numeri casuali pescati e' identico (due):
       il seme scorre come prima. */
    const err=rnd(-1,1)*0.30 + (Math.random()<0.5?-0.16:0.16);
    const a=Math.atan2(ny,nx)+err;
    const dOb=Math.max(1,len((t===0?FW:0)-p.x, goalY-p.y));
    kickBall(p, Math.cos(a), Math.sin(a), tiroVelocita(2, 400*pow, dOb), 0);
    Audio5.kick(0.6);
  }
  /* IL PALLONE SA DI CHI E' IL TIRO CHE STA VOLANDO. Lo legge chi puo'
     dire se il tiro era nello specchio: addGoal e tentaPresa. Lo azzera
     kickBall, cioe' qualunque altro calcio di chiunque. */
  G.ball.tiroT=t;
}`);

/* ------------------------------------------------------------------ 6
   Il pallonetto e' un tiro come gli altri: porta la stessa etichetta. */
cambio('6. anche il pallonetto porta l\'etichetta',
`    G.stats.pallonetti[t]=(G.stats.pallonetti[t]||0)+1;`,
`    G.stats.pallonetti[t]=(G.stats.pallonetti[t]||0)+1;
    b.tiroT=t;                            // anche il pallonetto e' un tiro`);

/* ------------------------------------------------------------------ 7
   QUALUNQUE calcio azzera l'etichetta: e' l'unico punto in cui passano
   tutti i colpi del gioco, ed e' per questo che la pulizia sta qui. */
cambio('7. ogni calcio azzera l\'etichetta del tiro',
`  b.vx=nx*speed; b.vy=ny*speed+spinY;
  b.curve=0; b.perfectT=0; b.saveRolled=false;`,
`  b.vx=nx*speed; b.vy=ny*speed+spinY;
  b.curve=0; b.perfectT=0; b.saveRolled=false;
  /* l'etichetta del tiro in volo muore qui: da questo istante il pallone
     appartiene a un gesto nuovo. fireShot la riscrive subito dopo, ed e'
     l'unico che lo fa. */
  b.tiroT=-1;`);

/* ------------------------------------------------------------------ 8
   IL PORTIERE: respinge la cannonata, blocca il tiro debole, e la
   respinta resta dentro l'area. */
cambio('8. la soglia di presa scende a 330: la cannonata si respinge',
`  if(sp<470 && Math.abs(largo)<B*0.75){`,
`  /* LO SPECCHIO SI CONTA QUI, e non dove si sperava. Se il pallone che
     il portiere tocca porta l'etichetta di un tiro avversario, quel tiro
     era nello specchio: e' la definizione, non una stima. */
  if(b.tiroT>=0 && b.tiroT!==p.team) G.stats.inPorta[b.tiroT]=(G.stats.inPorta[b.tiroT]||0)+1;
  b.tiroT=-1;
  /* LA SOGLIA DI PRESA SCENDE DA 470 A 330, e 330 non e' un numero
     scelto a gusto: e' la velocita' d'arrivo dichiarata del tiro
     perfetto (TIRO_ARRIVO[1]). Sopra quella si respinge, sotto si
     blocca — cioe' la cannonata genera la ribattuta e il tiro debole
     chiude l'azione, che e' il verso giusto. A 470 il portiere
     bloccava TUTTO quello che gli arrivava, e l'azione finiva li'. */
  if(sp<330 && Math.abs(largo)<B*0.75){`);

cambio('9. la respinta resta dentro l\'area',
`    b.vx = dir*rnd(200,330);
    b.vy = fuori*rnd(140,280);
    b.vz = rnd(40,110);`,
`    /* LA RESPINTA E' CORTA. Usciva a 245-431 unita' al secondo, cioe'
       fino a 410 unita' di corsa: la palla finiva fuori area e la
       ribattuta non esisteva. A 186-326 la corsa e' 177-310 unita', e il
       pallone resta dove si puo' ribattere. Resta la regola vecchia, che
       e' giusta: si respinge verso l'ESTERNO, mai al centro. */
    b.vx = dir*rnd(150,250);
    b.vy = fuori*rnd(110,210);
    b.vz = rnd(40,110);`);

/* ------------------------------------------------------------------ 10
   La rete conta lo specchio, e chiude l'etichetta. */
cambio('10. la rete conta lo specchio',
`function addGoal(team){
  G.score[team]++;
  G.goalTeam=team;`,
`function addGoal(team){
  G.score[team]++;
  /* una rete E' un tiro nello specchio, se veniva da un tiro: l'etichetta
     sul pallone lo sa. Un'autorete o una carambola non contano per
     nessuno, ed e' giusto. */
  if(G.ball && G.ball.tiroT===team) G.stats.inPorta[team]=(G.stats.inPorta[team]||0)+1;
  if(G.ball) G.ball.tiroT=-1;
  G.goalTeam=team;`);

/* ------------------------------------------------------------------ 11
   Il calcio d'inizio azzera l'etichetta: un tiro spento in mezzo al
   campo non deve poter diventare «nello specchio» tre azioni dopo. */
cambio('11. il calcio d\'inizio azzera l\'etichetta',
`function resetKickoff(){`,
`function resetKickoff(){
  if(G.ball) G.ball.tiroT=-1;             // nessun tiro sopravvive al fischio`);

/* ------------------------------------------------------------------ 12
   IL TIRO AL VOLO passa da un'altra strada e aveva lo stesso difetto. */
cambio('12. anche il tiro al volo arriva',
`      const vel=(q===1?620:q===0?380:430)+bonus;
      kickBall(p, dx/l, dy/l, vel, 0);`,
`      /* il volo aveva lo stesso difetto del tiro fermo: la potenza non
         sapeva la distanza. Qui il pavimento e' lo stesso, e il bonus
         della palla in arrivo resta tutto. */
      const vel=Math.max((q===1?620:q===0?380:430)+bonus, tiroVelocita(q, 0, l));
      kickBall(p, dx/l, dy/l, vel, 0);
      b.tiroT=t;`);

/* ------------------------------------------------------------------ 13
   IL PORTIERE SI TUFFA AL MOMENTO GIUSTO, non alla distanza giusta. */
cambio('13. il tuffo si decide sul TEMPO d\'arrivo, non sulla distanza',
`    const distX = Math.abs(b.x-goalX);
    const tta = distX/Math.max(60,Math.abs(b.vx));
    const predY = b.y + b.vy*tta;
    if(predY>GY0-16 && predY<GY1+16 && distX<330){`,
`    const distX = Math.abs(b.x-goalX);
    /* PERCHE' LA DISTANZA NON BASTAVA, ed e' il difetto che si vedeva
       come «il portiere non para mai».
       Il tuffo partiva a distX<330 — una soglia di SPAZIO. Ma il tuffo
       dura GK_DIVE_T (0,58 s) e si chiude appena il corpo ha superato il
       punto mirato; finito il tuffo il portiere entra in recover per
       0,30 s, e in recover updateKeeper usciva PRIMA di tentare la
       presa. Su un tiro veloce da 330 unita' il portiere partiva
       subito, arrivava sul punto in tre decimi, e quando il pallone
       finalmente passava era gia' steso a terra a recuperare: misurata
       la distanza palla-portiere nell'istante dell'arrivo sui tiri
       dentro lo specchio, mediana 17 unita' — cioe' il portiere era
       ADDOSSO al pallone — e diciassette di quei tiri su trentaquattro
       erano gol. Non era un problema di riflessi ne' di lettura: era un
       problema di ORARIO.
       Adesso si legge il tempo vero d'arrivo, e si legge con la stessa
       aritmetica dell'attrito che governa il tiro (TIRO_ATTR):
         strada fino al piano  s  = distX · sp / |vx|
         velocita' residua     vr = sp - k·s        (lineare nello spazio)
         tempo d'arrivo        T  = ln(sp/vr) / k
       Se vr scende sotto le 40 unita' il pallone non arriva affatto e
       non c'e' niente da parare. Il tuffo si arma quando T sta dentro
       GK_LETTURA, cioe' quando partire adesso significa essere in volo
       quando il pallone passa.
       predY invece resta ESATTO com'era: la traiettoria e' rettilinea,
       quindi dy/dx non dipende dalla decelerazione e b.y + b.vy·(distX/|vx|)
       e' il punto di passaggio, non una stima. L'unica cosa che lo fa
       sbagliare e' l'effetto a giro — ed e' esattamente il motivo per
       cui l'effetto a giro esiste. */
    const tta = distX/Math.max(60,Math.abs(b.vx));
    const strada = distX*sp/Math.max(60,Math.abs(b.vx));
    const resid = sp - TIRO_ATTR*strada;
    const tArr = resid>40 ? Math.log(sp/resid)/TIRO_ATTR : 1e9;
    const predY = b.y + b.vy*tta;
    if(predY>GY0-16 && predY<GY1+16 && tArr<GK_LETTURA){`);

/* ------------------------------------------------------------------ 14
   LA PRESA SA QUANTO E' DISTESO IL CORPO che la tenta. */
cambio('14a. la presa accetta una scala del corpo',
`function tentaPresa(p,b){`,
`/* Il terzo argomento e' QUANTO E' DISTESO il corpo che tenta la presa:
   1 e' il portiere in volo o in piedi, meno di 1 e' il portiere gia' a
   terra dopo il tuffo, che copre meno. Senza argomento vale 1, quindi
   tutte le chiamate di prima restano identiche al bit. */
function tentaPresa(p,b,disteso){`);
cambio('14b. l\'ellisse del corpo si scala',
`  const A=GK_REACH+B_R, B=P_R+B_R;`,
`  const dist_ = disteso===undefined ? 1 : disteso;
  const A=(GK_REACH+B_R)*dist_, B=(P_R+B_R)*dist_;`);

cambio('14c. il portiere steso e\' ancora un corpo',
`  if(p.recover>0){ p.recover-=dt; p.vx*=0.8; p.vy*=0.8; return; }`,
`  /* QUANTO DURA LA LETTURA. Reazione (0,13 s) piu' raccolta (GK_RACC,
     0,07) fanno due decimi prima che il corpo parta, e il tuffo dura
     GK_DIVE_T: la finestra utile per armarlo e' un pallone che passera'
     entro sette decimi di secondo. */
  if(p.recover>0){
    p.recover-=dt; p.vx*=0.8; p.vy*=0.8;
    /* IL PORTIERE STESO NON E' UN BUCO. Qui si usciva e basta: per tre
       decimi di secondo dopo ogni tuffo il corpo del portiere smetteva
       di esistere per il pallone, e siccome il tuffo finiva quasi sempre
       PRIMA che il tiro arrivasse (vedi il cambio 13), la palla passava
       attraverso un portiere disteso proprio sulla sua traiettoria. Un
       uomo a terra con le braccia distese e' un ostacolo.
       Ma copre MENO di un portiere in volo: 0,58 dell'ellisse, cioe' 20
       unita' invece di 34 lungo il corpo, perche' chi e' gia' a terra
       non si allunga — subisce. E' il numero che tiene onesto il
       duello: a corpo pieno il portiere diventava un muro, e misurato
       su trenta partite le reti nei novanta secondi scendevano da 1,17
       a 0,67 mentre gli 0-0 risalivano al 47%. */
    tentaPresa(p,b,0.58);
    return;
  }`);

/* ------------------------------------------------------------------ 15
   ADESSO CHE I TIRI ARRIVANO, se ne possono chiedere di piu'.
   E' l'unica delle quattro piste del giudice che regge — ma regge SOLO
   dopo i cambi 1-14: prima, tirare piu' spesso avrebbe aggiunto palloni
   che muoiono a centrocampo, cioe' rumore invece di eventi.
   L'ORDINE CONTA: 0,68 diventa 0,84 PRIMA che 0,52 diventi 0,68, se no
   la seconda sostituzione ne troverebbe due e la toppa si rifiuterebbe
   di scrivere — che e' esattamente quello che deve fare. */
cambio('15. si tira di piu\' (Duro)',    `shotFreq:0.68`, `shotFreq:0.96`);
cambio('16. si tira di piu\' (Normale)', `shotFreq:0.52`, `shotFreq:0.88`);
cambio('17. si tira di piu\' (Facile)',  `shotFreq:0.30`, `shotFreq:0.55`);

/* ------------------------------------------------------------------ 18
   E SI TIRA ANCHE DA PIU' LONTANO — adesso che serve a qualcosa. */
cambio('18. la zona di tiro si allarga',
`  const inRange = distGoal<FW*0.36 && Math.abs(p.y-FH/2)<FH*0.40;`,
`  /* LA ZONA DI TIRO PASSA DA 0,36 A 0,44 DELLA LARGHEZZA, e adesso ha
     senso: prima un tiro da 414 unita' era un pallone regalato — la sua
     corsa massima non ci arrivava — quindi allargare la zona avrebbe
     solo aumentato i palloni persi. Con la velocita' che conosce la
     distanza, un tiro da 506 unita' si presenta in porta a 330 come
     tutti gli altri: attraversa mezzo campo pieno di gambe, e la maggior
     parte finisce su un corpo. Che e' il punto — un tiro murato e' un
     evento, un pallone che si spegne non lo e'.
     La fascia verticale non si tocca: da lassu' la porta non si vede.

     E C'E' UN SECONDO TETTO, in unita' assolute, che sul 5 contro 5 non
     morde mai e sul 7 e sull'11 e' l'unica cosa che tiene in piedi tutto
     il ragionamento. La fisica del pallone NON scala con il campo:
     TIRO_ATTR e' 1,0498 unita' di velocita' per unita' percorsa su tutti
     e tre i moduli, e con il tetto di velocita' a TIRO_TETTO la distanza
     massima da cui un tiro puo' PRESENTARSI in porta a 330 unita' al
     secondo e' (860-330)/1,0498 = 505 unita', punto. Su 5 contro 5
     FW·0,40 fa 460 e il tetto assoluto non si accorge di esistere (tutte
     le misure di questa passata restano valide al bit). Su 7 contro 7
     farebbe 644 e sull'11 contro 11 farebbe 920: da li' il pallone non
     arriva, e si tornerebbe esattamente al difetto che questa toppa
     chiude — tiri che muoiono per strada. Non si tira da dove il pallone
     non arriva. */
  const inRange = distGoal<Math.min(FW*0.40, 500) && Math.abs(p.y-FH/2)<FH*0.40;`);

cambio('19. il tetto sale con la zona',
`const TIRO_TETTO = 780;                   // oltre, il pallone diventa un proiettile`,
`const TIRO_TETTO = 860;                   // oltre, il pallone diventa un proiettile`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-eventi.js ingresso.html uscita.html [--salta 15,16]'); process.exit(2); }
/* --salta serve a ISOLARE una causa: si toglie un cambio e si rimisura.
   Il numero e' quello scritto in testa al nome del cambio. */
const iS = process.argv.indexOf('--salta');
const SALTA = iS > 0 && process.argv[iS + 1] ? process.argv[iS + 1].split(',').map(s => s.trim()) : [];
const daSaltare = c => SALTA.some(n => c.nome.startsWith(n + '.') || c.nome.startsWith(n + 'a.') || c.nome.startsWith(n + 'b.') || c.nome.startsWith(n + 'c.'));
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
let fatti = 0, saltati = 0;
for (const c of CAMBI) {
  if (daSaltare(c)) { saltati++; continue; }
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
  fatti++;
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${fatti} cambi su ${CAMBI.length}` +
  (saltati ? ` (${saltati} saltati con --salta ${SALTA.join(',')})` : '') + `, ${ing} -> ${usc}`);
