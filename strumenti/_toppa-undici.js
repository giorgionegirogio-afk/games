/* =====================================================================
   _toppa-undici.js — L'UNDICI CONTRO UNDICI SMETTE DI FINIRE 0-0.

   IL DIFETTO, COM'ERA. Su dodici partite CPU contro CPU a semi
   dichiarati (20260803..14, Normale) l'11 contro 11 dava: zero parate,
   zero legni, zero reti, 100% di 0-0, 0,00 momenti da porta al minuto.
   Il tabellino dichiarava 7 tiri a partita e non era vero: G.stats.tiri
   lo incrementano quattro posti diversi e uno di quelli e' la lotteria
   dai dischetti (Duel.stopPower, riga 11852). Avvolgendo fireShot —
   l'unica porta del tiro su azione — i tiri su azione risultavano
   ESATTAMENTE ZERO in 1550 decisioni del portatore, e la ragione stava
   scritta in due numeri:

     distX del portatore CPU quando decide, mediana        1247 unita'
     soglia oltre la quale non si tira                      500 unita'
     decisioni sotto la soglia                          0 su 1550

   IL PERCHE', E SONO DUE CONTI, NON UN'OPINIONE.

   PRIMO — L'ATTRITO NON SAPEVA QUANTO E' GRANDE IL CAMPO.
   updateBall frena con b.vx *= 0,35^dt. Derivato rispetto allo SPAZIO
   quella e' una costante: la velocita' cala di k = -ln(0,35) = 1,0498
   unita' ogni unita' percorsa, sempre. Quindi la corsa massima di un
   pallone e' v0/k, e col tetto TIRO_TETTO = 860 nessun pallone di questo
   gioco puo' percorrere piu' di 819 unita'. Ma il campo, a 11, e' lungo
   2300 invece di 1150:

     corsa massima del pallone, in frazione del campo
       5 contro 5    819 / 1150 = 71%
       7 contro 7    819 / 1610 = 51%
       11 contro 11  819 / 2300 = 36%

   Lo stesso vale per l'appoggio (500 al massimo = 476 unita' = 21% del
   campo a 11 contro il 41% a 5) e per il rinvio del portiere (470 = 448
   unita'). Su un campo doppio, con lo stesso attrito, il pallone e' la
   META' del pallone: non c'e' gesto che porti la palla da un terzo
   all'altro, e la partita si annoda a centrocampo. Misurato: il 76,5%
   dei fotogrammi il pallone sta fra il 40% e il 60% del campo, e lo
   ZERO virgola zero per cento nei primi e negli ultimi due decimi.

   La toppa fa sapere l'attrito quanto e' grande il campo: ATTR_K =
   1150/FW, cioe' il freno per unita' percorsa scala con la lunghezza.
   A 5 contro 5 ATTR_K vale 1 e NON CAMBIA NIENTE, nemmeno un bit — e' la
   garanzia che la riparazione di ieri resta intatta. A 7 e a 11 il
   pallone torna a coprire la stessa FRAZIONE di campo di sempre.
   Con l'attrito che scala, anche il tetto della zona di tiro smette di
   essere un numero scritto a mano: 500 era (860-330)/1,0498 = 505
   arrotondato, cioe' la distanza massima da cui un tiro puo' ancora
   presentarsi in porta alla velocita' dichiarata. Adesso si scrive con
   quella formula, e a 5 contro 5 da' lo stesso 505 di prima (min con
   FW*0,40 = 460: identico al bit), a 11 da' 1010 e vince FW*0,40 = 920,
   cioe' l'ultimo 40% del campo — esattamente come a 5.

   SECONDO — QUANDO LA PALLA NON E' DI NESSUNO, NON C'ERA NESSUNO AVANTI.
   Il pallone e' di nessuno per il 65% del tempo. In quel caso
   weHaveBall e' falso per TUTTE E DUE le squadre, e in aiDecide ogni
   uomo che non sia l'ultimo, il pressatore o il raddoppio finisce nel
   ramo di copertura, che lo porta a 0,55 sulla linea palla-porta e 0,45
   sulla casella di modulo. A 5 contro 5 sono due uomini su quattro e non
   si vede; a 11 sono SETTE su dieci, e la squadra si appiattisce in un
   blocco unico dietro la palla. Il punto fisso di quella formula si
   calcola a mano ed e' x = 1058 su 2300, cioe' il 46% del campo: la
   punta piu' avanzata delle due squadre vive sulla linea di meta' campo.
   Misurato: media 1114 unita' dalla porta avversaria, e in una partita
   intera nessuno e' mai arrivato piu' vicino di 699. Da li' non si tira,
   e soprattutto non c'e' NESSUNO a cui passare in avanti — il 70% degli
   appoggi andava all'indietro (media -70 unita'), contro il 53% a 5.

   La toppa aggiunge il simmetrico dell'ULTIMO UOMO, che il gioco ha gia'
   da sempre: come c'e' un uomo che non sale mai, adesso c'e' una PUNTA
   che non scende mai. Solo dalle taglie 7 in su — a 5 contro 5 il ruolo
   non viene mai assegnato e il ramo non viene mai preso, quindi il
   5 contro 5 resta identico al bit, dado per dado (nessuna delle righe
   nuove pesca un numero casuale).

   COSA MISURA, DOPO. 24 partite per taglia, CPU contro CPU, Normale,
   semi 20260803..826, mediane, `node strumenti/_eventi.js`:

                              5 contro 5      7 contro 7     11 contro 11
                            prima   dopo    prima   dopo    prima   dopo
     tiri VERI su azione     10,0   10,0     2,0   12,0     0,0    9,5
     gol nei 90 secondi      1,00   1,00    0,00   1,00    0,00   0,50
     partite 0-0 (mediana)   0,00   0,00    1,00   0,00    1,00   0,50
     parate                  2,50   2,50    0,00   2,00    0,00   0,50
     legni                   1,00   1,00    0,00   1,00    0,00   0,00
     MOMENTI DA PORTA/min    2,62   2,62    0,45   2,61    0,00   0,66

   IL 5 CONTRO 5 NON CAMBIA DI UN BIT, e non e' una speranza: su 24
   partite il vettore di eventi crudo — tutte e trenta le voci, partita
   per partita — e' IDENTICO carattere per carattere. Zero partite su 24
   danno un numero diverso. Le due righe che potrebbero toccarlo non lo
   toccano per costruzione: ATTR_K vale esattamente 1 quando FW vale
   1150, e il ruolo 'punta' e' dietro un `TAGLIA>=7`.

   IL PREZZO, dichiarato perche' si veda. Gli EVENTI DI CAMPO al minuto
   calano: 7 contro 7 da 54,3 a 43,3; 11 contro 11 da 49,7 a 34,0. Erano
   la rissa di centrocampo — 76 palloni vaganti e 29 rimpalli a partita
   attorno alla riga di meta' campo — cioe' il SINTOMO, non la trama: si
   danno via sedici scaramucce al minuto per lo 0,66 di momenti da porta
   al minuto che prima non esisteva. Il totale EVENTI AL MINUTO scende da
   53,9 a 42,6 a 11 e da 58,3 a 53,3 a 7. Chi legge decida: qui si
   dichiara, non si nasconde.

   COSA RESTA APERTO, misurato e NON riparato:
     · l'11 contro 11 fa ancora 0,50 gol e 0,66 momenti al minuto contro
       i 2,62 del 5 contro 5. E' vivo, non e' pari.
     · con la punta alta, gli appoggi si allungano (distanza voluta
       mediana 592 unita' contro le 228 di prima) e il 23,5% adesso NON
       arriva al compagno: la corsa massima di un pallone a 500 unita' di
       partenza e' 500/TIRO_ATTR = 953, e la punta a volte sta piu' in
       la'. Cade in avanti, in spazio, e spesso e' un vantaggio — ma e'
       un tiro corto, non un passaggio, e va detto.
     · il rinvio del portiere (470 unita' fisse) mira la punta a 1528 e
       arriva a 895: NON arriva mai, 3 su 3 nel campione. Sono 0,4 rinvii
       a partita, quindi non e' urgente, ma la velocita' del rinvio non
       sa la distanza esattamente come non la sapeva il tiro prima di
       ieri.

   DOVE GUARDARE PER RIPRENDERE: `node strumenti/_misura-undici.js
   --taglia 11` conta la catena del tiro anello per anello (decisioni,
   zona, carica, fireShot), l'istogramma della x del pallone in decimi di
   campo, la penetrazione, gli appoggi contro la corsa possibile e la
   punta piu' avanzata. E' lo strumento con cui questa causa e' stata
   trovata, e legge TIRO_ATTR dal gioco invece di ricordarselo.

     uso: node strumenti/_toppa-undici.js CALCETTO-il-gioco.html uscita.html
   Provata su md5 2e3acb02d958eef621212e02949bdc19 e riapplicata pulita
   su dd46fab6a6e4cb1c4b23465d4d844d15 (il file e' cambiato sotto, per
   una passata sui colori delle divise che non tocca nessun ancoraggio).
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------
   1. L'ATTRITO DIVENTA UNA GRANDEZZA DEL CAMPO, NON UNA COSTANTE.
   ------------------------------------------------------------------ */
cambio('1. TIRO_ATTR scala col campo (ATTR_K = 1150/FW)',
`const TIRO_ATTR = 1.0498;                 // unita' di velocita' perse per unita' percorsa`,
`/* =====================================================================
   L'ATTRITO SA QUANTO E' GRANDE IL CAMPO — e prima non lo sapeva.

   k = -ln(0,35) = 1,0498 e' il freno per unita' PERCORSA, e da esso
   discende tutto: la corsa massima di un pallone e' v0/k. Col tetto
   TIRO_TETTO = 860 fa 819 unita', punto. Sul campo a 5 sono il 71% della
   lunghezza; sul campo a 11, lungo 2300, sono il 36%. Stesso gioco,
   stesso pallone, meta' pallone: nessun gesto porta la palla da un terzo
   all'altro, e infatti l'11 contro 11 passava il 76% dei fotogrammi
   entro il decimo centrale del campo e non ha mai tirato in porta.
   ATTR_K = 1150/FW e' il campo in multipli di quello a 5: il freno per
   unita' percorsa si divide per lo stesso fattore, e la corsa del
   pallone torna a valere la stessa FRAZIONE di campo su tutte e tre le
   taglie. A 5 contro 5 ATTR_K vale 1 e non cambia un bit.
   Le due grandezze restano numericamente uguali (unita' di velocita'
   perse per unita' percorsa = base dell'esponenziale nel tempo), che e'
   la coincidenza su cui poggiano tiroVelocita e la lettura del portiere:
   scalarle insieme la conserva.
   ===================================================================== */
let ATTR_K = 1;                           // il campo, in multipli di quello a 5
let TIRO_ATTR = 1.0498;                   // unita' di velocita' perse per unita' percorsa`);

cambio('2. updateBall: il freno esponenziale prende ATTR_K',
`  const fr=Math.pow(0.35,dt);            // attrito esponenziale`,
`  const fr=Math.pow(0.35,dt*ATTR_K);     // attrito esponenziale, in scala di campo`);

cambio('3. setTaglia ricuoce l\'attrito insieme a FW',
`  FW=T.FW; FH=T.FH; GOAL_H=T.GOAL_H;`,
`  FW=T.FW; FH=T.FH; GOAL_H=T.GOAL_H;
  /* l'attrito e' un derivato del campo come GY0 e POSTI: si ricuoce qui,
     nell'unica porta che cambia campo logico, e da nessun'altra parte */
  ATTR_K=1150/FW; TIRO_ATTR=1.0498*ATTR_K;`);

cambio('4. la zona di tiro non e\' piu\' un numero scritto a mano',
`  const inRange = distGoal<Math.min(FW*0.40, 500) && Math.abs(p.y-FH/2)<FH*0.40;`,
`  /* IL SECONDO TETTO SI SCRIVE COL SUO CONTO, e smette di essere 500.
     500 era (TIRO_TETTO - TIRO_ARRIVO[1]) / 1,0498 = 505 arrotondato:
     la distanza massima da cui un tiro puo' ancora presentarsi in porta
     alla velocita' dichiarata. Adesso che l'attrito scala col campo,
     quel conto lo si scrive invece di ricordarlo. A 5 contro 5 da' 505 e
     vince FW*0,40 = 460, identico al bit. A 7 da' 707 e vince 644; a 11
     da' 1010 e vince 920, cioe' l'ultimo 40% del campo su tutte e tre le
     taglie — che e' l'unico modo perche' la zona di tiro voglia dire la
     stessa cosa a 5, a 7 e a 11. */
  const inRange = distGoal<Math.min(FW*0.40, (TIRO_TETTO-TIRO_ARRIVO[1])/TIRO_ATTR) && Math.abs(p.y-FH/2)<FH*0.40;`);

/* ------------------------------------------------------------------
   2. LA PUNTA — il simmetrico dell'ultimo uomo.
   ------------------------------------------------------------------ */
cambio('5. PUNTA_X: dove aspetta chi non rientra',
`const RUOLO_MIN = 1.5;          // quanto dura un'assegnazione, in secondi`,
`const RUOLO_MIN = 1.5;          // quanto dura un'assegnazione, in secondi
/* DOVE STAZIONA LA PUNTA, in frazione di campo dalla propria porta.
   0,70 non e' un gusto: sotto lo 0,66 il suo appoggio nasce fuori dalla
   zona di tiro (che comincia a 0,60) e il vantaggio si perde nel
   trasporto; sopra lo 0,74 resta isolato oltre l'ultimo difensore
   avversario e il punteggio di eseguiAiPass smette di sceglierlo.
   Misurato su cinque valori a 12 partite ciascuno, momenti da porta al
   minuto a 11 contro 11: 0,46 (0,62) 0,66 (0,66) 0,91 (0,70) 0,60
   (0,74) 0,59 (0,78). */
const PUNTA_X = 0.70;`);

cambio('6. il cervello di squadra assegna la PUNTA (solo 7 e 11)',
`    if(rad) B.ruoli[rad.i]='raddoppio';
  }`,
`    if(rad) B.ruoli[rad.i]='raddoppio';
  }
  /* LA PUNTA (solo taglie 7 e 11): il simmetrico dell'ULTIMO UOMO, che
     questo gioco ha da sempre. Come c'e' un uomo che non sale mai, c'e'
     un uomo che non scende mai. Serve perche' con il pallone di nessuno
     — il 65% del tempo — nessuna delle due squadre "ha palla", e allora
     TUTTI finiscono nel ramo di copertura: a 5 contro 5 sono due su
     quattro e non si vede, a 11 sono sette su dieci e la squadra si
     appiattisce in un blocco dietro il pallone. Il punto fisso di quella
     formula sta al 46% del campo: la punta piu' avanzata delle due
     squadre vive sulla riga di meta' campo, e in una partita intera
     nessuno arrivava piu' vicino di 699 unita' alla porta. Senza un uomo
     davanti non c'e' un passaggio in avanti da fare (il 70% degli
     appoggi andava indietro) e non c'e' nessuno che possa tirare.
     La scelta e' deterministica — il piu' avanzato fra i liberi — e non
     pesca nemmeno un numero casuale: il seme scorre come prima. */
  if(TAGLIA>=7 && !nostra){
    let punta=null, dpu=-1;
    for(const o of mates){
      if(o===ultimo || o===pressa || B.ruoli[o.i]) continue;
      const d=Math.abs(o.q.x-myGoalX);
      if(d>dpu){ dpu=d; punta=o; }
    }
    if(punta) B.ruoli[punta.i]='punta';
  }`);

cambio('7. la punta resta alta invece di rientrare a coprire',
`    }else if(mioRuolo==='raddoppio' && carrier && carrier.team!==myTeam){`,
`    }else if(mioRuolo==='punta'){
      /* NON RIENTRA. Stazione fissa in frazione di campo — cosi' vale
         uguale a 7 e a 11 — e altezza che segue il pallone a meta'
         strada, perche' l'appoggio in profondita' abbia un bersaglio dal
         lato giusto senza che la punta insegua la palla. */
      p.aiTX = opGoalX===FW ? FW*PUNTA_X : FW*(1-PUNTA_X);
      p.aiTY = clamp(FH/2 + (b.y-FH/2)*0.45, 60, FH-60);
    }else if(mioRuolo==='raddoppio' && carrier && carrier.team!==myTeam){`);

/* ------------------------------------------------------------------
   IL CANCELLO: o tutti gli ancoraggi sono unici, o non si scrive niente.
   ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-undici.js ingresso.html uscita.html'); process.exit(2); }
if (!fs.existsSync(ing)) { console.error('TOPPA NON APPLICATA: ingresso inesistente: ' + ing); process.exit(1); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: ancoraggio trovato ${n} volte (ne serve esattamente 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
