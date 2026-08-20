/* =====================================================================
   _t-l23.js — LA CHIAMATA: il compagno che parte quando lo chiami.
   (voce L2.3 di _analisi/agente28.md §10)

   Toppa cerca/sostituisci. Legge CALCETTO-il-gioco.html (o --in),
   sostituisce DIECI ancoraggi ESATTI e scrive la copia in --out. Senza
   --out scrive accanto all'originale un file col suffisso .l23.html:
   mai sull'originale, se non con --dentro. Se anche un solo ancoraggio
   non compare ESATTAMENTE UNA VOLTA si ferma con codice 1, dice quale, e
   non scrive niente.

   uso:
     node strumenti/_t-l23.js --out fuori/l23.html
     node strumenti/_t-l23.js --in altro.html --out x.html
     node strumenti/_t-l23.js --dentro
     node strumenti/_t-l23.js --elenco

   ---------------------------------------------------------------------
   COSA FA, IN QUATTRO RIGHE.
   Un giocatore CHIAMATO corre in una direzione per 1,6 secondi, e la
   corsa e' indipendente dal dito. Mentre corre, il suo peso nel punteggio
   del ricevente sale di 140. La chiamata SCADE da sola, e si consuma
   subito se il pallone gli arriva. Il meccanismo serve tutti e due i
   sensi del progetto — chiamato DA CHI HA LA PALLA (L1.4) e chiamato DA
   SE' (contesto NOI) — perche' l'unica porta d'ingresso e' una funzione
   che prende un giocatore e una direzione: chi la chiama lo decide chi
   collega l'ingresso, non questa toppa.

   ---------------------------------------------------------------------
   QUESTA TOPPA NON COLLEGA NESSUN INGRESSO, E VA DETTO SUBITO.
   chiamaGiocatore esiste e nessuno la chiama. Percio' sul gioco spedito
   il comportamento e' IDENTICO al bit: tutti i rami nuovi stanno dietro
   a p.chiamata>0, che senza una chiamata vale sempre zero, e nessuno dei
   pezzi nuovi consuma un sorteggio (nessun Math.random).
   MISURATO, non affermato: partite CPU contro CPU a seme fisso, tre semi
   (20260820..22) per ciascuna delle tre taglie, 95 secondi ciascuna,
   confrontate fotogramma per fotogramma fra base e toppa su pallone
   (x, y, z, vx, vy), padrone, uomo comandato, punteggio e posizione di
   TUTTI i giocatori:
     taglia  5   17.100 fotogrammi   0 divergenze
     taglia  7   17.100 fotogrammi   0 divergenze
     taglia 11   17.100 fotogrammi   0 divergenze
   E' anche la prova che nessuno dei pezzi nuovi pesca un numero casuale:
   uno solo in piu' e le tracce si sfaserebbero al primo sorteggio.

   IL COSTO E' NON MISURABILE SU QUESTO BANCO, e non e' modo di dire
   «zero». strumenti/prestazione.js — che misura il FOTOGRAMMA INTERO — il
   20 agosto 2026 si e' dichiarato CIECO da solo: --prova-uguale, cioe' lo
   stesso file contro se' stesso, sbaglia del 12,4%, e il ballo fra
   repliche e' del 141,5%. Con un banco cosi' nessun verdetto di
   prestazione vale niente, e la sua stessa intestazione lo dice.
   Allora si e' misurato il solo PASSO DI SIMULAZIONE, che e' dove questa
   toppa vive per intero (non tocca una riga di disegno): blocchi di 500
   chiamate a __test.simulate(1/60) cronometrate insieme — il singolo
   passo costa meno del quanto di 0,1 ms dell'orologio della pagina —
   panino A-B-B-A, nove giri, differenza calcolata dentro il giro:
     taglia  5   mediana +0,0026 ms per passo   giri da -0,0066 a +0,0400
     taglia  7   mediana -0,0023 ms per passo   giri da -0,0247 a +0,0327
     taglia 11   mediana -0,0099 ms per passo   giri da -0,0297 a +0,0202
   Tutti e tre gli intervalli SCAVALCANO LO ZERO, e due mediane su tre
   sono negative — cioe' la toppa risulterebbe piu' veloce del gioco che
   toppa, che e' impossibile: e' rumore. Il passo di step() costa
   0,11-0,14 ms su questo banco, e la risoluzione appaiata e' circa
   0,03 ms: qualunque costo di questa toppa sta sotto quella soglia, cioe'
   sotto lo 0,2% di un fotogramma da 16,7 ms. NON e' una misura di zero:
   e' la dichiarazione di quanto piccolo doveva essere per non vedersi.

   ---------------------------------------------------------------------
   I QUATTRO PEZZI, E DOVE VIVONO.

   1. IL CAMPO. p.chiamata sono i secondi che restano; p.chiamaUX/UY la
      direzione (un versore); p.chiamaS il verso in cui scansare. Quattro
      numeri per giocatore, azzerati alla costruzione, al calcio d'inizio
      e all'espulsione.

   2. IL CRONOMETRO, e sta in updatePlayerFisica e NON in aiMove. La
      corsa in area — il meccanismo gemello che questo gioco ha gia' —
      scala il suo cronometro in aiMove, che gira solo per chi NON e'
      sotto il dito. Alla chiamata non basta: il progetto la vuole anche
      «da se'», cioe' addosso all'uomo comandato, e li' aiMove non passa
      mai. updatePlayerFisica gira per tutti, ogni fotogramma, e ha gia'
      accanto il decremento di kickCd.
      Un CRONOMETRO e non un interruttore, per la stessa ragione scritta
      nel commento di corsaArea: un interruttore che una funzione accende
      e un'altra deve ricordarsi di spegnere si dimentica acceso.

   3. IL RAMO IN aiDecide, subito DOPO il ramo del destinatario di un
      cross e PRIMA di tutto il resto. La precedenza non e' un dettaglio:
      un pallone che sta gia' volando addosso a te batte una chiamata,
      perche' il posto piu' sensato dove correre e' il punto di caduta
      del pallone che e' indirizzato a te. Tutto il resto — la corsa in
      area, l'ultimo uomo, lo smarcato, la copertura — arriva dopo.

   4. IL PESO, in due punti e con lo stesso numero: smarcato(), che e' il
      cuore del passaggio del dito e il pareggio della filtrante, e il
      punteggio inline di eseguiAiPass, che e' il passaggio della CPU. Il
      secondo non e' un capriccio di simmetria: senza, la meta' «chiedo
      palla» del progetto (contesto NOI, dove il portatore e' un compagno
      guidato dalla CPU) non avrebbe alcun effetto, e il meccanismo
      servirebbe un senso su due.

   ---------------------------------------------------------------------
   DA DOVE VENGONO I NUMERI. Sono due, e nessuno dei due e' scelto a
   gusto.

   CHIAMA_T = 1,6 s. Non e' misurato: e' PRESCRITTO dal progetto
   (§4, riga «chiamata»: «Corsa 1,6 s, indipendente dal dito»). Lo scrivo
   come lo trovo. Il contesto NOI del §4 chiede 1,2 s per la chiamata su
   di se': chiamaGiocatore accetta una durata, cosi' quel ramo la passera'
   senza toccare il meccanismo.

   CHIAMA_PESO = 140. QUESTO E' MISURATO. E' la mediana del divario fra
   il PRIMO e il SECONDO candidato nel punteggio vero di eseguiPassUmano,
   presa su partite CPU contro CPU del gioco base (md5 30279089de83), sei
   semi 20260820..25, ottanta secondi ciascuna, un campione ogni cinque
   fotogrammi:
     taglia  5   1944 campioni   p25 62,0   MEDIANA 141,3   p75 260,7
     taglia  7   1465 campioni   p25 65,9   MEDIANA  89,5   p75 196,3
     taglia 11   1313 campioni   p25 35,6   MEDIANA 100,9   p75 203,4
   Chiamare vale dunque, per costruzione, quanto il vantaggio TIPICO che
   il miglior candidato ha sul secondo: ribalta la scelta in circa meta'
   delle situazioni ordinarie, e non la ribalta quando il primo e' avanti
   di molto. E' la regola del §3 del progetto — «la direzione INCLINA,
   non SBARRA» — tradotta in un numero invece che in un'intenzione.
   Il valore scelto e' quello della taglia 5, cioe' il piu' ALTO dei tre:
   sulle taglie grandi la chiamata pesa un po' di piu' del suo bersaglio
   dichiarato. E' una scelta, ed e' questa: un numero solo, quello della
   taglia in cui questo gioco si gioca, invece di tre numeri da tenere
   allineati. Chi vorra' tre numeri sa dove sta la misura.
   La sonda che li ha prodotti riusa smarcato() del gioco per il nucleo e
   riscrive di suo i due termini di coda di eseguiPassUmano (due righe di
   aritmetica): e' una misura di progetto, non un verdetto, e i verdetti
   stanno tutti in strumenti/_q-l23.js, che non riscrive niente.

   ---------------------------------------------------------------------
   LE TRE COSE CHE VANNO DETTE, PERCHE' NON SONO GRATIS.

   1. LA CORSA E' UNA CAROTA, NON UN PUNTO. Il bersaglio si ricalcola a
      ogni ripianificazione come «io piu' lo slancio nella direzione
      chiamata», quindi l'uomo non arriva mai e corre per tutti gli 1,6 s.
      Se fosse un punto fisso ci arriverebbe in meno di un secondo — lo
      slancio del gioco e' 170 unita' e un uomo in scatto ne fa piu' di
      duecento al secondo — e «corre per 1,6 s» sarebbe falso nei fatti
      pur essendo vero nel codice. Il prezzo: contro la linea laterale la
      carota si schiaccia sul clamp e la corsa si ferma prima. E' fisica,
      non un difetto, ma va saputo.

   2. IL CHIAMATO SCATTA, e lo scatto consuma fiato. E' la stessa riga
      della corsa in area (aiVuoleSprint), con davanti la stessa guardia
      del fiato sotto 32. Una chiamata al passo non e' una chiamata; ma
      chi chiamera' molto spendera' fiato, e il fiato in questo gioco si
      paga negli ultimi venti secondi.
      Nota: l'uomo COMANDATO che chiama se stesso non scatta per questa
      riga — il suo sprint lo decide humanSprint, cioe' il pollice. E'
      giusto cosi', ed e' anche il motivo per cui la meta' «da se'» della
      chiamata pesa soprattutto sul punteggio del ricevente.

   3. LO SCANSAMENTO SI FA UNA VOLTA SOLA, ALLA PARTENZA, e chi entra
      nella rotta dopo non viene scansato. La prima stesura lo rifaceva a
      ogni ripianificazione, che sembra piu' prudente ed e' peggio: il
      cancello l'ha bocciata. Sulla scena della prova B — la chiamata
      puntata addosso a un avversario piantato sulla rotta — il franco
      minimo era 47,35 unita' ricalcolando ogni giro, contro 64,53
      tenendo la direzione. La ragione e' che la carota si allontana
      dall'avversario prima che l'uomo gli sia passato accanto: la spinta
      si spegne, la rotta si raddrizza, e l'uomo passa piu' vicino di
      quanto lo scarto prometteva. Il rosso di quel primo giro sta scritto
      qui perche' e' la misura che ha deciso il disegno.
      E scansaAvversari spinge SOLO IN Y: e' il ciclo del ramo dello
      smarcato di aiDecide ESTRATTO — non copiato: quel ramo adesso chiama
      questa funzione — e quel ciclo sposta il bersaglio sull'asse Y e
      basta. Su una chiamata quasi verticale la spinta cade sullo stesso
      asse della corsa, e allora accorcia o allunga il tratto invece di
      scartare di fianco. Non puo' pero' mandare il bersaglio DIETRO le
      spalle: la spinta e' 70 unita' contro uno slancio di 170, quindi il
      bersaglio resta sempre almeno 100 unita' avanti. Ho preferito la
      funzione del gioco, con questo limite dichiarato, a una versione
      perpendicolare mia che avrebbe cambiato anche il ramo vecchio.

   ---------------------------------------------------------------------
   IL CANCELLO, E COSA HA DETTO. strumenti/_q-l23.js, 20 agosto 2026:
     sul gioco di oggi (md5 30279089de83)   0 verdi · 6 rossi
     su questa toppa                        6 verdi · 0 rossi
   I numeri che il cancello ha letto sulla toppa:
     A  il chiamato va 333,89 unita' nel verso chiamato — che e' il verso
        OPPOSTO a quello che l'IA sceglierebbe da sola — mentre non
        chiamato ne fa -0,06; l'ultima spinta piena e' a 1,65 s e il punto
        piu' lontano a 1,90 s (i tre decimi in piu' sono la decelerazione
        di un corpo che scattava, non chiamata che dura);
     B1 chiamata puntata addosso a un avversario piantato sulla rotta:
        franco minimo 64,73 unita' (due corpi si toccano a 26);
     B2 scena ordinaria, otto direzioni di bussola: mediana 100,01 unita'
        contro le 22,40 dello stesso uomo NON chiamato;
     C  il pallone arriva al chiamato in 23 scene su 24, contro le 4 su 24
        senza chiamata;
     D  0,6 s dopo la scadenza si torna a 4 su 24, cioe' esattamente la
        base;
     E  ricevuto il pallone, nei successivi 0,8 s va -16,58 unita' nel
        verso chiamato: la corsa e' finita, sta giocando.
   E cinque copie GUASTE della toppa, una per proprieta', mostrano che il
   cancello sa ancora fallire: la tabella sta in testa a _q-l23.js.

   NON REGRESSIONE, sulla copia toppata, 20 agosto 2026:
     node strumenti/collaudo.js          36/36
     node strumenti/_q-precedenza.js      9/9
     node strumenti/_q-l11.js             8/8
     node strumenti/giocata.js --tutte    7/7
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* --------------------------------------------------------------------
   GLI ANCORAGGI. Testo esatto cercato, testo esatto messo al suo posto.
   Nessuna espressione regolare, nessun numero di riga.
   -------------------------------------------------------------------- */
const ANCORE = [

/* 1 — i quattro campi del giocatore */
{
  nome: '1/10 il giocatore: i quattro campi della chiamata',
  cerca:
`    aiT:Math.random(),                 // timer decisioni IA
    aiTX:x, aiTY:y,                    // bersaglio IA`,
  metti:
`    aiT:Math.random(),                 // timer decisioni IA
    aiTX:x, aiTY:y,                    // bersaglio IA
    /* --- LA CHIAMATA (voce L2.3): secondi che restano alla corsa
       chiamata, la direzione in cui correre (un versore) e il verso in
       cui scansare gli avversari. A zero il meccanismo non esiste: ogni
       ramo nuovo sta dietro a chiamata>0, e nessuno li scrive se non
       chiamaGiocatore. --- */
    chiamata:0, chiamaUX:0, chiamaUY:0, chiamaS:1,`,
},

/* 2 — il calcio d'inizio azzera */
{
  nome: '2/10 resetKickoff: nessuna chiamata sopravvive al fischio',
  cerca:
`    p.corsaArea=0;                                              // e la corsa in area`,
  metti:
`    p.corsaArea=0;                                              // e la corsa in area
    p.chiamata=0;                                               // e la chiamata (L2.3)`,
},

/* 3 — l'espulsione azzera: un uomo fuori non corre da nessuna parte */
{
  nome: '3/10 espulsione: la chiamata non aspetta in panchina',
  cerca:
`  if(p.out>0){
    p.out-=dt;
    p.vx=0; p.vy=0; p.ax=0; p.ay=0; p.slide=-1; p.recover=0; chiudiAnticipo(p);`,
  metti:
`  if(p.out>0){
    p.out-=dt;
    p.vx=0; p.vy=0; p.ax=0; p.ay=0; p.slide=-1; p.recover=0; chiudiAnticipo(p);
    /* IL CRONOMETRO DELLA CHIAMATA STA PIU' SOTTO, e da qui non ci si
       arriva: un uomo espulso torna prima. Senza questa riga la sua
       chiamata resterebbe congelata per tutta l'espulsione e
       ripartirebbe al rientro, che e' esattamente il latch che non si
       consuma. */
    p.chiamata=0;`,
},

/* 4 — il cronometro, accanto a quello di kickCd */
{
  nome: '4/10 updatePlayerFisica: il cronometro della chiamata',
  cerca:
`  if(p.role==='gk'){ updateKeeper(p,dt); return; }
  p.kickCd=Math.max(0,p.kickCd-dt);`,
  metti:
`  if(p.role==='gk'){ updateKeeper(p,dt); return; }
  p.kickCd=Math.max(0,p.kickCd-dt);
  /* =====================================================================
     LA CHIAMATA E' UN CRONOMETRO, E STA QUI.
     Il meccanismo gemello che questo gioco ha gia' — la corsa in area —
     scala il suo cronometro in aiMove, che gira solo per chi NON e' sotto
     il dito. Alla chiamata non basta: il progetto la vuole anche «da se'»
     (§4, contesto NOI: il giocatore che non ha la palla chiede il
     pallone), cioe' addosso all'uomo COMANDATO, e da aiMove quell'uomo
     non passa mai. Questo posto invece gira per tutti, ogni fotogramma,
     e ha gia' accanto il decremento di kickCd.
     E' un cronometro e non un interruttore per la ragione che sta scritta
     nel commento di corsaArea: un interruttore che una funzione accende e
     un'altra deve ricordarsi di spegnere prima o poi resta acceso.
     DUE COSE LA SPENGONO PRIMA DELLA SCADENZA, e sono le stesse due che
     spengono la corsa in area:
       · IL PALLONE E' ARRIVATO. La chiamata ha ottenuto cio' che
         chiedeva. Senza questa riga il portatore continuerebbe la corsa
         chiamata col pallone al piede, perche' il ramo della chiamata in
         aiDecide sta SOPRA quello del portatore e vincerebbe: un uomo che
         riceve e corre via dalla porta invece di giocare.
       · IL PALLONE E' IN PIEDI ALL'AVVERSARIO. Una squadra che corre in
         avanti mentre difende e' il difetto che la corsa in area ha gia'
         imparato a non fare. Il pallone di NESSUNO — cioe' il volo di un
         passaggio — non spegne niente: e' proprio il tempo in cui la
         chiamata deve vivere.
     ===================================================================== */
  if(p.chiamata>0){
    const chi = G.ball.owner>=0 ? G.players[G.ball.owner] : null;
    if(chi===p || (chi && chi.team!==p.team)) p.chiamata=0;
    else p.chiamata=Math.max(0, p.chiamata-dt);
    /* quando scade, l'uomo ridecide SUBITO invece di finire il resto del
       suo tempo di reazione con addosso il bersaglio della chiamata: se
       no la corsa dura fino a un settimo di secondo di troppo, e la
       misura della durata direbbe quel numero li' */
    if(p.chiamata<=0) p.aiT=0;
  }`,
},

/* 5 — lo sprint */
{
  nome: '5/10 aiVuoleSprint: un chiamato ci va di corsa',
  cerca:
`  if(p.corsaArea) return true;      // chi attacca l'area ci va di corsa`,
  metti:
`  if(p.corsaArea) return true;      // chi attacca l'area ci va di corsa
  /* e un chiamato pure: una chiamata al passo non e' una chiamata. La
     guardia del fiato e' quella qui sopra, la stessa della corsa in area:
     chi e' a corto di fiato non scatta, nemmeno se chiamato. L'uomo
     COMANDATO che chiama se stesso non passa di qui — il suo sprint lo
     decide humanSprint, cioe' il pollice — ed e' giusto cosi'. */
  if(p.chiamata>0) return true;`,
},

/* 6 — il peso nel punteggio del ricevente del DITO */
{
  nome: '6/10 smarcato: il peso della chiamata',
  cerca:
`    if(dLine<40 && t2>0.1 && t2<0.95) openness-=260;
  }
  return openness;
}`,
  metti:
`    if(dLine<40 && t2>0.1 && t2<0.95) openness-=260;
  }
  /* IL PESO DELLA CHIAMATA (L2.3). Chi e' partito su chiamata vale di
     piu' come bersaglio, e vale ESATTAMENTE quanto il vantaggio tipico
     che il primo candidato ha sul secondo: mediana 141,3 misurata sul
     punteggio vero di eseguiPassUmano, taglia 5, 1944 campioni, sei semi
     (il conto per intero sta in strumenti/_t-l23.js). Percio' la chiamata
     ribalta la scelta in circa meta' delle situazioni ordinarie e non la
     ribalta quando il primo e' avanti di molto: inclina, non sbarra.
     Non e' una scorciatoia sulla geometria — la linea di passaggio
     occupata costa 260 e resta piu' cara della chiamata: un compagno con
     un avversario davanti non diventa il bersaglio solo perche' l'hai
     chiamato. */
  if(q.chiamata>0) openness+=CHIAMA_PESO;
  return openness;
}`,
},

/* 7 — il peso nel punteggio del ricevente della CPU */
{
  nome: '7/10 eseguiAiPass: lo stesso peso sul passaggio della CPU',
  cerca:
`    for(const o of G.players){ if(o.team!==p.team && o.out<=0) s+=clamp(len(o.x-q.x,o.y-q.y),0,200); }
    s+=(p.team===0?q.x-p.x:p.x-q.x)*0.8;
    if(s>bs){bs=s;best=q;}`,
  metti:
`    for(const o of G.players){ if(o.team!==p.team && o.out<=0) s+=clamp(len(o.x-q.x,o.y-q.y),0,200); }
    s+=(p.team===0?q.x-p.x:p.x-q.x)*0.8;
    /* LO STESSO PESO DELLA CHIAMATA, e qui non e' simmetria per bellezza.
       Questo e' il passaggio della CPU, cioe' il passaggio che riceve la
       meta' «CHIEDO PALLA» del progetto (§4, contesto NOI): li' il
       portatore e' un compagno guidato dalla macchina, e se il suo
       punteggio non vedesse la chiamata quella meta' del meccanismo non
       farebbe niente. Il punteggio di questa funzione NON e' smarcato() —
       satura a 200 invece che a 220 e non ha la penalita' della linea di
       passaggio — ma e' della stessa specie e della stessa scala: una
       somma di distanze in unita' di campo. Il numero e' lo stesso, e
       vale quanto ci si aspetta che valga. */
    if(q.chiamata>0) s+=CHIAMA_PESO;
    if(s>bs){bs=s;best=q;}`,
},

/* 8 — il blocco: le costanti, lo scansamento estratto, il bersaglio e la
       porta d'ingresso */
{
  nome: '8/10 il blocco della chiamata, fra attaccaArea e aiDecide',
  cerca:
`  p.corsaArea=CROSS_CORSA_T;
  return true;
}

function aiDecide(p, b, carrier, weHaveBall, myGoalX, opGoalX, isCpuTeam, D){`,
  metti:
`  p.corsaArea=CROSS_CORSA_T;
  return true;
}

/* =====================================================================
   LA CHIAMATA — il compagno che parte quando lo chiami. (voce L2.3)

   E' cio' che trasforma il passaggio da «scelgo chi c'e'» a «creo chi non
   c'e'». Un giocatore chiamato corre in una direzione per 1,6 secondi,
   indipendentemente dal dito, e mentre corre pesa di piu' nella scelta
   del ricevente.

   IL MECCANISMO SERVE DUE SENSI, e per questo la porta d'ingresso e' una
   funzione che prende un GIOCATORE e una DIREZIONE invece di una squadra:
     · chiamato DA CHI HA LA PALLA — il ricevente candidato parte quando
       il trascinamento arma (voce L1.4);
     · chiamato DA SE' — l'uomo che non ha la palla chiede il pallone
       (contesto NOI del §4).
   Nessuno dei due ingressi sta qui dentro: li collegano L1.4 e chi fara'
   il contesto NOI. Finche' non lo fanno, chiamaGiocatore non la chiama
   nessuno e il gioco si comporta come prima al bit.

   NESSUNA DI QUESTE RIGHE PESCA UN NUMERO CASUALE. Se ne pescasse uno,
   ogni banco a seme fisso si sfaserebbe per il solo fatto che qualcuno
   ha chiamato un compagno.
   ===================================================================== */
/* PRESCRITTO dal progetto (§4, riga «chiamata»): «Corsa 1,6 s,
   indipendente dal dito». Non e' un numero misurato e non lo spaccio per
   tale. Il contesto NOI chiede 1,2 s per la chiamata su di se': la si
   passa a chiamaGiocatore come quarto argomento, senza toccare qui. */
const CHIAMA_T = 1.6;
/* MISURATO: la mediana del divario fra il primo e il secondo candidato
   nel punteggio vero di eseguiPassUmano, taglia 5, 1944 campioni su sei
   partite CPU contro CPU a seme fisso (141,3; a 7 e' 89,5 e a 11 e'
   100,9 — il conto per intero sta in strumenti/_t-l23.js). Chiamare vale
   quanto il vantaggio tipico del migliore sul secondo: ribalta la scelta
   in circa meta' delle situazioni ordinarie, e in nessuna di quelle in
   cui il migliore e' avanti di molto. */
const CHIAMA_PESO = 140;

/* LO SCANSAMENTO DEGLI AVVERSARI. Non e' una funzione nuova: e' il ciclo
   che stava dentro il ramo dello smarcato di aiDecide, ESTRATTO. Quel
   ramo adesso chiama questa, quindi non ci sono due scritture da tenere
   allineate — che e' il difetto che avrebbe reso inutile una copia.
   Sposta il bersaglio sull'asse Y, e solo su quello: e' cosi' che il
   gioco lo faceva, e cosi' resta. */
function scansaAvversari(t, tx, ty, side){
  for(const o of G.players){
    if(o.team===t||o.out>0) continue;
    if(len(o.x-tx,o.y-ty)<70) ty=clamp(ty+side*70,40,FH-40);
  }
  return ty;
}

/* QUANTO LONTANO GUARDA UN CHIAMATO: lo SLANCIO del ramo dello smarcato,
   contropiede compreso — 170 unita' di campo, 300 appena l'azione si e'
   ribaltata. Non e' un numero nuovo, e' quello. */
function slancioChiamata(t){
  const B=G.brain[t];
  return ((B && B.transizione>0) ? 300 : 170)*KPASSO;
}

/* DOVE CORRE UN CHIAMATO.
   E' una CAROTA, non un punto d'arrivo: si ricalcola da dove l'uomo si
   trova ADESSO a ogni ripianificazione, quindi non ci arriva mai e corre
   per tutti gli 1,6 s. Un punto fisso a 170 unita' se lo mangerebbe in
   meno di un secondo — un uomo in scatto ne fa piu' di duecento al
   secondo — e «corre per 1,6 s» sarebbe vero nel codice e falso in
   campo. Il prezzo e' che contro la linea laterale la carota si schiaccia
   sul clamp e la corsa finisce prima: e' fisica, ma va saputo.
   QUI NON SI SCANSA PIU' NIENTE, e la ragione e' misurata. Lo
   scansamento si fa UNA VOLTA SOLA, in chiamaGiocatore, e finisce dentro
   la direzione. Rifarlo a ogni giro sulla carota lo accendeva e spegneva
   di continuo — la carota si allontana dall'avversario prima che l'uomo
   ci sia passato accanto — e la rotta si raddrizzava a meta' scarto: col
   franco misurato a 47,35 unita' contro le 64,53 di adesso, sulla stessa
   scena (strumenti/_q-l23.js, prova B). Una direzione tenuta scansa
   meglio di una direzione ricalcolata. */
function puntoChiamata(p){
  const s=slancioChiamata(p.team);
  return [ clamp(p.x + p.chiamaUX*s, 60, FW-60),
           clamp(p.y + p.chiamaUY*s, 50, FH-50) ];
}

/* LA PORTA D'INGRESSO. Prende un giocatore, una direzione (non serve che
   sia un versore) e, se si vuole, una durata diversa da quella di casa.
   Torna true se la chiamata e' nata.
   TRE RIFIUTI, e ognuno chiude un modo di lasciare un latch appeso:
     · il PORTIERE non si chiama mai — e non solo perche' non ha senso: il
       cronometro sta in updatePlayerFisica DOPO il ramo del portiere,
       quindi una chiamata su un portiere non scadrebbe piu';
     · un uomo ESPULSO non si chiama: non e' in campo;
     · CHI HA IL PALLONE non si chiama: la chiamata e' una richiesta di
       pallone, e il ramo in aiDecide sta sopra quello del portatore —
       chiamare il portatore vorrebbe dire mandarlo a correre invece di
       giocare. */
function chiamaGiocatore(p, dirx, diry, durata){
  if(!p || p.out>0 || p.role==='gk') return false;
  if(G.ball && G.ball.owner>=0 && G.players[G.ball.owner]===p) return false;
  let ux=+dirx||0, uy=+diry||0;
  const l=len(ux,uy);
  if(l>0.001){ ux/=l; uy/=l; }
  /* senza direzione, la chiamata e' «vai avanti»: verso la porta
     avversaria, che e' cio' che vuol dire chiedere palla quando non si
     indica un posto (§4, riga «chiedo palla», il tap senza trascinamento) */
  else { ux=(p.team===0?1:-1); uy=0; }
  /* da che parte scansare: dalla parte in cui la chiamata gia' punta se
     ha una componente verticale, se no dal lato che il modulo assegna a
     quell'uomo — lo stesso ripiego del ramo dello smarcato */
  p.chiamaS = uy>0.001 ? 1 : (uy<-0.001 ? -1 : (p.lato ? p.lato : (p.y<FH/2?-1:1)));
  /* =====================================================================
     LO SCANSAMENTO SI FA QUI, UNA VOLTA SOLA, E FINISCE NELLA DIREZIONE.
     Si guarda dove porterebbe la chiamata cosi' com'e' chiesta, si lascia
     che scansaAvversari — la funzione del gioco — sposti quel punto se li'
     c'e' qualcuno, e poi si tiene la DIREZIONE verso il punto spostato per
     tutta la corsa.
     PERCHE' UNA VOLTA SOLA. Rifarlo a ogni ripianificazione sembra piu'
     prudente ed e' peggio, misurato: la carota si allontana
     dall'avversario prima che l'uomo gli sia passato accanto, la spinta si
     spegne, la rotta si raddrizza e l'uomo gli passa piu' vicino di quanto
     lo scarto prometteva. Sulla scena della prova B di _q-l23.js — la
     chiamata puntata addosso a un avversario piantato a 170 unita' sulla
     rotta — il franco minimo misurato e' 47,35 unita' ricalcolando ogni
     giro contro 64,53 tenendo la direzione. Una direzione tenuta scansa
     meglio di una direzione ricalcolata, e per giunta e' quello che il
     progetto dice alla lettera: «corre in una direzione per circa 1,6
     secondi».
     COSA SI PERDE, e va detto: un avversario che entra nella rotta a corsa
     GIA' INIZIATA non viene scansato. La corsa e' una direzione tenuta,
     non un inseguimento; i corpi non si compenetrano comunque, perche' la
     separazione rigida del gioco vale per tutti.
     ===================================================================== */
  {
    const s=slancioChiamata(p.team);
    const tx=clamp(p.x+ux*s, 60, FW-60);
    const ty=scansaAvversari(p.team, tx, clamp(p.y+uy*s, 50, FH-50), p.chiamaS);
    const vx=tx-p.x, vy=ty-p.y, vl=len(vx,vy);
    if(vl>0.001){ ux=vx/vl; uy=vy/vl; }
  }
  p.chiamaUX=ux; p.chiamaUY=uy;
  p.chiamata = +durata>0 ? +durata : CHIAMA_T;
  p.aiT=0;                    // riparte subito: una chiamata non aspetta il prossimo giro
  return true;
}

function aiDecide(p, b, carrier, weHaveBall, myGoalX, opGoalX, isCpuTeam, D){`,
},

/* 9 — il ramo in cima ad aiDecide, subito dopo il destinatario del cross */
{
  nome: '9/10 aiDecide: il ramo della chiamata',
  cerca:
`  if(b.owner<0 && b.z>0 && b.crossTo===G.players.indexOf(p)){
    const c=puntoCaduta(b);
    p.aiTX=clamp(c[0], 30, FW-30);
    p.aiTY=clamp(c[1], 30, FH-30);
    p.corsaArea=CROSS_CORSA_T;
    return;
  }`,
  metti:
`  if(b.owner<0 && b.z>0 && b.crossTo===G.players.indexOf(p)){
    const c=puntoCaduta(b);
    p.aiTX=clamp(c[0], 30, FW-30);
    p.aiTY=clamp(c[1], 30, FH-30);
    p.corsaArea=CROSS_CORSA_T;
    return;
  }
  /* =====================================================================
     LA CHIAMATA (L2.3) VIENE PRIMA DI TUTTO IL RESTO — MA DOPO IL PALLONE
     CHE STA GIA' VOLANDO ADDOSSO A TE.
     La precedenza sopra questa riga non e' un dettaglio d'ordine: se un
     cross e' indirizzato a te, il posto piu' sensato dove correre e' il
     suo punto di caduta, e non c'e' chiamata che valga di piu' di un
     pallone che ti sta gia' arrivando. Sotto questa riga invece la
     chiamata batte tutto — la corsa in area, l'ultimo uomo, lo smarcato,
     la copertura — perche' e' l'unico bersaglio di questa funzione che
     nasce da un'intenzione umana esplicita e non da una regola di
     posizione.
     Il portatore non ci arriva mai: il cronometro spegne la chiamata
     nell'istante in cui il pallone diventa suo.
     ===================================================================== */
  if(p.chiamata>0){
    const c=puntoChiamata(p);
    p.aiTX=c[0]; p.aiTY=c[1];
    return;
  }`,
},

/* 10 — il ramo dello smarcato chiama lo scansamento estratto */
{
  nome: '10/10 aiDecide, ramo dello smarcato: lo scansamento diventa una chiamata',
  cerca:
`      /* evita di sovrapporsi agli avversari */
      for(const o of G.players){
        if(o.team===myTeam||o.out>0) continue;
        if(len(o.x-aheadX,o.y-ty)<70) ty=clamp(ty+side*70,40,FH-40);
      }
      p.aiTX=aheadX; p.aiTY=ty;`,
  metti:
`      /* evita di sovrapporsi agli avversari. Le quattro righe che stavano
         qui adesso hanno un nome, ed e' la stessa funzione che usa la
         chiamata (L2.3): non e' una copia, e' questa, spostata. Percio'
         «un compagno che si offre» e «un compagno chiamato» scansano allo
         stesso modo, e non possono divergere. */
      ty = scansaAvversari(myTeam, aheadX, ty, side);
      p.aiTX=aheadX; p.aiTY=ty;`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-l23.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.l23.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error('  · ' + m.nome + ': trovato ' + m.n + ' volte');
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}

/* un controllo DOPO la sostituzione: le cose nuove devono essere definite
   una volta sola e chiamate dove ci si aspetta. Se un giorno un ancoraggio
   dovesse combaciare in un punto diverso da quello previsto, questo conto
   se ne accorge prima che lo faccia un cancello. */
const attesi = [
  ['function chiamaGiocatore(', 1],
  ['function puntoChiamata(', 1],
  ['function scansaAvversari(', 1],
  ['const CHIAMA_T', 1], ['const CHIAMA_PESO', 1],
  ['CHIAMA_PESO', 3],              // la definizione + smarcato + eseguiAiPass
  ['scansaAvversari(', 3],         // la definizione + puntoChiamata + il ramo dello smarcato
  ['p.chiamata=0', 3],             // calcio d'inizio, espulsione, cronometro
  ['p.chiamata>0', 3],             // cronometro, sprint, ramo di aiDecide
  ['q.chiamata>0', 2],             // smarcato, eseguiAiPass
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte, ' + (out.length - src.length >= 0 ? '+' : '') + (out.length - src.length) + ')');
