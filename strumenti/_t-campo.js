/* =====================================================================
   _t-campo.js — LA SEZIONE «CAMPO» ESCE DA SOTTO LA BARRA DEI BOTTONI
   (28 agosto 2026).

   +++++++++++++++++++++ RETTIFICA, 28 AGOSTO 2026 ORE 20 +++++++++++++++
   QUESTA TOPPA E' STATA APPLICATA --dentro OGGI POMERIGGIO E HA SPEDITO
   NEL GIOCO SETTE NUMERI FALSI. Li corregge strumenti/_t-vero.js, che
   va applicato dopo questa; qui restano rettificati i numeri di questo
   stesso foglio, perche' un foglio di lavoro che mente e' la mappa con
   cui il prossimo sbaglia strada.
   I sette, in breve (i dettagli e le misure stanno in _t-vero.js):
     · «sotto i 380 px» tre volte, contro `@media (max-height:340px)`:
       380 e' la soglia che QUESTO STESSO FOGLIO dichiara bocciata (vedi
       il pezzo D qui sotto) e che poi manda dentro il gioco;
     · «42 e 54» per l'altezza delle pastiglie del gradino C: oggi sono
       42 e 42, e «sopra i 44 px» era falso gia' allora (42 non e' sopra
       44);
     · «la pagina recupera 17 px» per la regola dei 860: oggi ne recupera
       ZERO (misurato spegnendola: 915x412 2 px con e 2 senza);
     · «eccedenza 9 px a 915x412»: oggi 2;
     · «la guida a SEI caselle usa 1.5fr repeat(5,1fr)»: la guida ha
       SETTE caselle e usa repeat(6,1fr) — e su quel numero sbagliato il
       pezzo F ha scritto sei colonne per sette voci, cioe' NEGOZIO su
       una riga da solo sotto i 700 px di larghezza. Il difetto vero
       nasce dal numero falso, non gli sta accanto.
   PERCHE' DUE DI QUESTI SONO DIVENTATI FALSI DA SOLI: fra mezzogiorno e
   sera il gioco ha preso i suoi CARATTERI VERI (per un mese i woff2 non
   avevano una lettera A-Z e tutto usciva in ripiego). Barlow Condensed
   scrive «CALCETTO» in 339,3 unita' dove il ripiego ne usava 520,4:
   ogni parola del gioco si e' stretta di un terzo e OGNI MISURA DI
   IMPAGINATO DI OGGI POMERIGGIO E' SCADUTA. Le tabelle qui sotto sono
   state rimisurate dove lo dicono.
   E C'E' UNA COSA CHE NON E' UN NUMERO: il blocco «UNA CURA PROVATA E
   BOCCIATA» qui sotto compare DUE VOLTE, identico. E' una copia
   incollata due volte, non due prove diverse.
   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

   ============================== IL DIFETTO ==============================
   Visto sul telefono vero (OnePlus 6 coricato) e fotografato in
   fuori/tel-2.png: nella schermata AMICHEVOLE l'ultima sezione — CAMPO,
   cioe' il nome del campetto e il bottone CAMBIA CAMPO — sta DIETRO la
   barra «1 GIOCATORE / 2 GIOCATORI / INDIETRO». Della parola CAMBIA si
   legge «CA...». Chi vuole scegliere il campo non puo'.

   MISURATO, non dedotto (strumenti/tocco.js sul gioco del repo):
     915x412   CAMBIA CAMPO y 319..363, centro y=341 SULLO SCHERMO,
               ma elementFromPoint(centro) restituisce .azioni
     812x375   stesso posto, il colpo va a #btnBackGioca
     740x360   stesso posto, il colpo va a #btnBackGioca
     640x360   stesso posto, il colpo va a #btnBackGioca
     1024x600  y 524..585, centro 555, il colpo va a #btnBackGioca
   Cioe': il bersaglio SI VEDE e non si tocca. E' peggio di un bersaglio
   sotto la piega — quello lo dice la sfumatura e lo dice il chevron —
   perche' all'occhio e' indistinguibile da uno che funziona.

   ========================= DA DOVE VIENE, IN NUMERI =====================
   Non e' una svista di impaginazione: e' un budget sfondato e mai
   ricontato. Il commento accanto a .giocapall dice, con i suoi numeri,
   che il pallone-eroe fu portato da 64vh a 52vh APPOSTA perche' «a 55vh
   la pagina sforava di 33 px e il chevron prometteva contenuto che non
   c'era». Quel giorno la schermata aveva TRE sezioni. Poi
   _t-mentalita.js ne ha aggiunta una quarta (MENTALITA'), che a 915x412
   costa 16 px di etichetta + 12 di margini + 61 di pastiglie = 89 px, e
   il conto e' saltato: la pagina passa da «entra intera» a 572 px di
   contenuto in 412 di schermo, cioe' 160 px di eccedenza. La barra delle
   azioni e' position:sticky con bottom:-26px, quindi resta incollata in
   fondo e la sezione che sfora le finisce SOTTO invece che oltre il
   bordo.
   Due commenti del gioco dicevano ancora «e la schermata continua a non
   scorrere»: erano diventati falsi, e questa toppa li riscrive. Un
   commento falso e' un difetto (regola di casa 4).

   ====================== LA STESSA SPECIE DELLA PAUSA ====================
   Stamattina, in PAUSA, la quarta voce faceva finire ABBANDONA sotto il
   bordo (strumenti/_t-mentalita.js, ancoraggi 1b e 1c). La cura li' fu:
   scorrimento come rete di sicurezza PIU' una media query che stringe il
   pannello. Qui la rete di sicurezza C'E' GIA' — .ov porta
   overflow-y:auto da sempre, e infatti CAMBIA CAMPO e' raggiungibile
   scorrendo di 27 px a 915x412 — e proprio per questo il difetto e'
   scivolato via: nessuno resta bloccato, semplicemente nessuno sa che
   sotto la barra c'e' una scelta. Percio' qui la cura e' TUTTA nel
   secondo pezzo: fare entrare la schermata.

   E si porta dietro la lezione dell'ancoraggio 1c: in CSS l'ordine e'
   parte della regola. Qui il blocco nuovo sta DOPO la @media
   (max-height:470px) generale che tocca .eti, .voce e .frase, e per di
   piu' ogni riga e' scritta con l'id (#gioca ...), che vale 1,1,0 contro
   lo 0,1,0 delle regole di quel blocco. Le due cose insieme: vince per
   specificita' e vincerebbe comunque per posizione.

   ============================== LA CURA, A PEZZI ========================
   Regola d'ordine, la stessa del FISCHIO FINALE: SI TOGLIE ARIA, MAI
   CONTENUTO — con una sola eccezione dichiarata (il pezzo D).

   A. L'EROE NON SCHIACCIA LA SCELTA. Il pallone era largo
      clamp(180px,52vh,320px): cresce con l'ALTEZZA dello schermo dentro
      una riga larga al massimo 640 px, quindi piu' lo schermo e' alto
      piu' la colonna delle scelte si stringe e piu' le pastiglie vanno a
      capo — un anello che si morde la coda. Misurato a 1024x600: pallone
      largo 312, colonna 308, la riga ROSA alta 95 px invece di 49 e la
      riga CAMPO 101 invece di 44. Adesso la larghezza e'
      clamp(150px,min(52vh,27vw),320px): il pallone non puo' prendersi
      piu' di poco piu' di un quarto dello schermo.
      A 915x412 NON CAMBIA UN PIXEL: min(52vh,27vw) = min(214,25; 247,05)
      = 214,25, che e' esattamente il 52vh di prima. La misura storica del
      progetto vede lo stesso pallone di ieri.
      E sotto i 620 px di larghezza, su uno schermo non alto, il pallone
      si toglie: la soglia c'era gia' a 430 px («il pallone cresciuto non
      deve schiacciare le scelte»), ed era troppo bassa — a 480x412 le
      tre pastiglie della DIFFICOLTA' e quelle della ROSA finivano tutte
      sotto la barra (6 bersagli coperti, misurato). Dove non c'e'
      larghezza, un eroe che copre la scelta non e' un eroe.

   B, C, D. L'ARIA, A TRE GRADINI. B sotto gli 820 px di altezza (il
      tablet coricato e tutto cio' che sta sotto), C sotto i 540 (il
      telefono coricato), D sotto i 340 (il paesaggio bassissimo). I
      gradini sono tre e non uno perche' con uno solo si apre un
      DIROSSAMENTO al confine: con la soglia a 470 px, a 500 px di
      altezza l'eccedenza saltava da 9 px a 137 e la riga CAMPO tornava
      sotto la barra (misurato). Un gradino che spegne cinquanta pixel di
      cura un pixel oltre la soglia e' peggio di nessun gradino.
      In D — e SOLO in D — si toglie contenuto: spariscono le righine
      sotto le pastiglie («la gabbia», «blocco basso e stretto»). E'
      dichiarato, ed e' il precedente che la home ha gia'
      («#menu .voce small{display:none}» sotto i 470 px).
      LA SOGLIA DI D E' 340 E NON 380, ED E' UN ERRORE CORRETTO IN CORSA.
      Con 380 il gradino prendeva 812x375, 740x360 e 640x360, che sono
      telefoni veri: le pastiglie della ROSA passavano da 49 a 29 px di
      altezza e quelle della MENTALITA' da 61 a 29 — cioe' la cura
      rimpiccioliva il bersaglio del pollice su tre apparecchi su quattro
      per guadagnare pixel che li' non servivano (misurato con
      strumenti/_crit4-campo.js, che stampa l'altezza di ogni voce). A
      340 il gradino serve solo cio' che sta sotto i telefoni di oggi,
      e a 812x375 le pastiglie restano alte 42 e 42 (rettificato il 28
      agosto a sera: qui c'era «42 e 54», e il 54 era la MENTALITA' con
      la riga piccola andata a capo, cosa che succedeva solo col ripiego
      di sistema).

   E. I TRE BOTTONI SU UNA RIGA SOLA sotto i 620 px di larghezza. La barra
      andava a due righe (154 px invece di 92) e quei 62 px in piu' si
      mangiavano la riga CAMPO. I bottoni scendono a 46 px di altezza:
      e' il pavimento che il FISCHIO FINALE si e' gia' dato per il
      pollice («mai sotto i quarantasei pixel»), non uno sotto.

   ============ F. E IL SECONDO DIFETTO, CHE IL CANCELLO HA TROVATO =======
   Non era nella schermata GIOCA e nessuno lo cercava: LA HOME PERDE LA
   VOCE «NEGOZIO» sotto i 640 px di larghezza in orizzontale, e la perde
   per sempre.
   RETTIFICA DEL 28 AGOSTO ORE 20 — le due righe qui sotto contano SEI
   caselle e leggono «repeat(5,1fr)». Nel gioco di oggi la guida ha SETTE
   caselle (la settima e' SFIDA) e scrive «repeat(6,1fr)»: lo dichiara il
   suo stesso commento, sei righe sopra la regola. Questo pezzo F ha
   costruito la cura su quel conto sbagliato e ha scritto SEI colonne per
   SETTE voci — vedi in fondo, dove il difetto che ne e' nato e' misurato.
   La guida della home (@media max-height:470px) e'
   «grid-template-columns:1.5fr repeat(6,1fr)», e un 1fr non scende MAI
   sotto il proprio min-content: le voci vogliono piu' larghezza di
   quella che c'e', e a 568 px di schermo la griglia ne ha 543. La
   griglia sfora a destra e l'ultima casella esce dallo schermo.
   MISURATO a 568x320: NEGOZIO occupa x 546..621 su una finestra larga
   568, centro x=583, cioe' FUORI. E la home in orizzontale non scorre
   (#menu .box e' position:absolute con inset:0, quindi scrollHeight ==
   clientHeight): non e' un bersaglio da scorrere, e' un bersaglio che
   NON ESISTE. E' un ROSSO A — la classe peggiore, quella della PAUSA di
   stamattina — su una voce che porta al negozio, cioe' all'unico posto
   dove il gioco incassa.
   La cura e' minmax(0,1fr) — le colonne possono finalmente stringersi —
   piu' il testo che si stringe con loro. Due gradini di corpo perche' uno
   solo o non bastava o costava troppo: misurato, a 568 px con 11 px il
   testo di SPOGLIATOIO traboccava ancora dalla sua casella, con 9,5 px
   no; e imporre 9,5 px anche a 640x360 — dove oggi la home sta bene —
   sarebbe stato pagare due volte. Sopra i 700 px di larghezza non cambia
   niente: 740, 812 e 915 vedono la home di ieri al pixel.

   ====================== I NUMERI, PRIMA E DOPO ==========================
   Cancello: strumenti/tocco.js (che nasce con questa toppa). «coperti» =
   bersagli col centro sullo schermo che il colpo non raggiunge;
   «eccedenza» = scrollHeight - clientHeight della schermata GIOCA.
   I numeri per intero stanno nel blocco NUMERI, in fondo a questo file:
   sono la corsa vera del cancello, non una stima.

   =================== CIO' CHE QUESTA TOPPA NON CHIUDE ===================
   Va scritto, coi numeri, perche' vale quanto cio' che chiude. Restano
   finestre in cui la riga CAMPO finisce ancora sotto la barra, e sono
   tutte strette e basse insieme (misurate sul file toppato):
     360x360   eccedenza 174, 1 bersaglio coperto (#btnCambiaCampo)
     360x375   eccedenza 159, 1 bersaglio coperto
     360x412   eccedenza 122, 1 bersaglio coperto
     412x360   eccedenza 110, 1 bersaglio coperto
   Non sono apparecchi: un telefono da 360 px coricato e' 640x360 (verde),
   in piedi e' 360x740 (verde); un 412 coricato e' 915x412 (verde). Una
   finestra 360x412 e' un browser ridimensionato a mano. Chiuderle
   costerebbe la riga piccola delle pastiglie anche a 375 e 412 px di
   altezza, cioe' contenuto tolto a schermi che non ne hanno bisogno —
   l'errore che il gradino D ha gia' fatto una volta oggi. Non si paga.

   ================== UNA CURA PROVATA E BOCCIATA, COI NUMERI =============
   pointer-events:none sulla barra .azioni (con pointer-events:auto sui
   suoi tre bottoni) chiude il difetto in DUE RIGHE: la fascia smette di
   rubare il colpo e elementFromPoint(centro di CAMBIA CAMPO) torna il
   bottone giusto su tutte e cinque le taglie. E' stata scartata.
   Il motivo e' che curerebbe la MISURA e non la MALATTIA: la velatura
   della barra e' opaca dal 64% in giu' (rgba(4,32,13,1) a 64%), e a
   915x412 quel 64% cade a y=390 mentre CAMBIA CAMPO sta a 319..363 — il
   bottone resterebbe VELATO al 26-72% e cliccabile, cioe' si passerebbe
   da «si vede e non si tocca» a «si tocca e non si vede». Peggio ancora
   per il cancello: tocco.js diventerebbe verde su una schermata che
   sull'apparecchio vero mostra ancora «CA...». Una fascia che intercetta
   il dito e' onesta — cio' che copre, copre anche il tocco.

   ================== UNA CURA PROVATA E BOCCIATA, COI NUMERI =============
   pointer-events:none sulla barra .azioni (con pointer-events:auto sui
   suoi tre bottoni) chiude il difetto in DUE RIGHE: la fascia smette di
   rubare il colpo e elementFromPoint(centro di CAMBIA CAMPO) torna il
   bottone giusto su tutte e cinque le taglie. E' stata scartata.
   Il motivo e' che curerebbe la MISURA e non la MALATTIA: la velatura
   della barra e' opaca dal 64% in giu' (rgba(4,32,13,1) a 64%), e a
   915x412 quel 64% cade a y=390 mentre CAMBIA CAMPO sta a 319..363 — il
   bottone resterebbe VELATO al 26-72% e cliccabile, cioe' si passerebbe
   da «si vede e non si tocca» a «si tocca e non si vede». Peggio ancora
   per il cancello: tocco.js diventerebbe verde su una schermata che
   sull'apparecchio vero mostra ancora «CA...». Una fascia che intercetta
   il dito e' onesta — cio' che copre, copre anche il tocco.

   ======================= IL CONTO DEI SORTEGGI ==========================
   Zero. Questa toppa tocca CSS e commenti: non c'e' una riga di
   JavaScript. Il conto dei dado() e quello dei Math.random() sono
   verificati identici DOPO la sostituzione, qui sotto, invece che dati
   per scontati.

   ============================ COME SI RIFA' =============================
     node strumenti/_t-campo.js --out fuori/campocop.html
     node strumenti/tocco.js --gioco fuori/campocop.html --tutte
     node strumenti/tocco.js --gioco fuori/campocop.html --guasto
     node strumenti/collaudo.js --gioco fuori/campocop.html
     node strumenti/diritti.js  --gioco fuori/campocop.html

   uso:  node strumenti/_t-campo.js --out fuori/campocop.html
         node strumenti/_t-campo.js --elenco
         node strumenti/_t-campo.js --dentro
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
  nome: '1/5 il pallone-eroe smette di crescere a spese della scelta (e il commento torna vero)',
  cerca:
`   che il sole basso da ovest gli tira verso est. La citazione non sta
   piu' SOPRA di lui a rubargli i primi 60 px: sta sotto, nella fascia
   che restava vuota, e la schermata continua a non scorrere. */
/* 52vh, non 64: la citazione tornata sotto l'eroe (giro 2) compra i suoi
   ~60 px qui, dal diametro, non dallo scorrimento — misurato a 915x412:
   a 55vh la pagina sforava di 33 px e il chevron prometteva contenuto
   che non c'era. Il pallone resta due quinti dell'altezza dello schermo
   e la pagina entra intera. */
.giocapall{width:clamp(180px,52vh,320px);aspect-ratio:13/10}`,
  metti:
`   che il sole basso da ovest gli tira verso est. La citazione non sta
   piu' SOPRA di lui a rubargli i primi 60 px: sta sotto, nella fascia
   che restava vuota. */
/* 52vh, non 64: la citazione tornata sotto l'eroe (giro 2) compra i suoi
   ~60 px qui, dal diametro, non dallo scorrimento — misurato a 915x412:
   a 55vh la pagina sforava di 33 px e il chevron prometteva contenuto
   che non c'era. Il pallone resta due quinti dell'altezza dello schermo.
   RETTIFICA DEL 28 AGOSTO 2026 — la riga che stava qui, «e la pagina
   entra intera», e quella qui sopra, «e la schermata continua a non
   scorrere», erano vere il giorno in cui furono scritte e sono diventate
   false quando la schermata ha preso la quarta sezione (MENTALITA', +89
   px a 915x412): la pagina sforava di 160 px e la riga CAMPO finiva
   sotto la barra dei bottoni. La cura sta in fondo a questo foglio, sotto
   «LA SCHERMATA AMICHEVOLE NON FINISCE SOTTO LA BARRA», e la sorveglia
   strumenti/tocco.js. */
/* E IL PALLONE NON CRESCE PIU' A SPESE DELLA COLONNA. La larghezza era
   legata alla sola ALTEZZA (52vh) dentro una riga larga al massimo 640
   px: piu' lo schermo era alto, piu' la colonna delle scelte si
   stringeva e piu' le pastiglie andavano a capo. Misurato a 1024x600:
   pallone 312 px, colonna 308, riga ROSA alta 95 px invece di 49 e riga
   CAMPO 101 invece di 44. Col min(52vh,27vw) il pallone non passa poco
   piu' di un quarto della larghezza.
   A 915x412 non cambia un pixel: min(214,25; 247,05) = 214,25, che e'
   il 52vh di prima allo stesso valore. */
.giocapall{width:clamp(150px,min(52vh,27vw),320px);aspect-ratio:13/10}`,
},

/* ---------------------------------------------------------------- 2 */
{
  nome: '2/5 dove non c\'e\' larghezza l\'eroe si toglie: la soglia da 430 a 620 px',
  cerca: `@media (max-width:430px){ .giocapall{display:none} }`,
  metti:
`@media (max-width:430px){ .giocapall{display:none} }
/* LA SOGLIA VERA E' 620, NON 430 — e la ragione e' la stessa scritta
   sopra («il pallone cresciuto non deve schiacciare le scelte»), solo
   misurata invece che stimata. A 480x412 il pallone restava largo 180 px
   su una riga di 448: la colonna scendeva a 248 e le pastiglie della
   DIFFICOLTA' e della ROSA finivano tutte sotto la barra dei bottoni —
   sei bersagli coperti, non uno. La condizione sull'altezza c'e' perche'
   un tablet in piedi (800x1280) ha tutta la larghezza che gli serve e
   nessun bisogno di perdere l'eroe. */
@media (max-width:620px) and (max-height:700px){ .giocapall{display:none} }`,
},

/* ---------------------------------------------------------------- 3 */
{
  nome: '3/5 l\'aria della schermata GIOCA, a tre gradini, DOPO le regole che deve battere',
  /* L'ANCORAGGIO E' LA FINE DELLA @media (max-height:470px) GENERALE, e
     non e' un caso: quel blocco tocca .eti, .voce, .frase e .cards per
     tutte le schermate, e la cura di qui le deve battere. Vince gia' per
     specificita' (#gioca ... = 1,1,0 contro 0,1,0), ma sta anche DOPO —
     e' la lezione dell'ancoraggio 1c di _t-mentalita.js, dove la stessa
     media query messa PRIMA delle regole che doveva battere recuperava
     sei pixel invece di sessanta. Due difese invece di una, perche' la
     prima costa zero. */
  cerca:
`  .eti{margin:8px 0 4px}
  .statwrap,.achlist,.cards,.statlist{margin-bottom:10px}
}`,
  metti:
`  .eti{margin:8px 0 4px}
  .statwrap,.achlist,.cards,.statlist{margin-bottom:10px}
}

/* =====================================================================
   LA SCHERMATA «AMICHEVOLE» NON FINISCE SOTTO LA BARRA DEI BOTTONI
   (28 agosto 2026).

   IL DIFETTO, sul telefono vero e in numeri: l'ultima sezione — CAMPO —
   stava DIETRO la barra «1 GIOCATORE / 2 GIOCATORI / INDIETRO». A
   915x412 il bottone CAMBIA CAMPO occupa y 319..363, il suo centro
   (y=341) e' SULLO SCHERMO, e document.elementFromPoint(centro)
   restituisce .azioni: si vede e non si tocca. Sul telefono si leggeva
   «CA...» dietro «2 GIOCATORI». Lo stesso a 812x375, 740x360, 640x360 e
   1024x600 (li' il colpo va a #btnBackGioca).

   PERCHE' ERA SUCCESSO: la schermata aveva tre sezioni quando il
   pallone-eroe fu tarato a 52vh perche' la pagina «entrasse intera»;
   MENTALITA' e' la quarta e costa 89 px a 915x412. Il contenuto e'
   passato a 572 px in 412 di schermo. La barra e' position:sticky con
   bottom:-26px, quindi non scende oltre il bordo: resta incollata al
   fondo e cio' che sfora le finisce SOTTO.

   PERCHE' LO SCORRIMENTO NON BASTA: c'e' gia' (.ov porta
   overflow-y:auto) e infatti CAMBIA CAMPO e' raggiungibile scorrendo di
   27 px. E' esattamente il motivo per cui il difetto e' rimasto in piedi:
   nessuno resta bloccato, semplicemente nessuno sa che sotto la barra
   c'e' una scelta. La stessa conclusione della PAUSA di stamattina — «si
   esce solo dopo aver scorso» non e' una pausa usabile.

   L'ORDINE: questo blocco sta DOPO la @media (max-height:470px) generale
   apposta, e ogni riga porta l'id (#gioca ...). Vedi la nota
   sull'ancoraggio 1c di _t-mentalita.js: una media query scritta prima
   delle regole che deve battere e' codice che non fa niente accanto a un
   commento che dice che lo fa.

   TRE GRADINI E NON UNO, e il perche' e' misurato: con la sola soglia a
   470 px, a 500 px di altezza l'eccedenza saltava da 9 px a 137 e la riga
   CAMPO tornava sotto la barra. Un gradino che spegne cinquanta pixel di
   cura un pixel oltre la soglia e' peggio di nessun gradino.

   REGOLA D'ORDINE: si toglie aria, mai contenuto — tranne nel gradino
   sotto i 380 px, dove e' dichiarato.
   ===================================================================== */
/* B — sotto gli 820 px di altezza: il tablet coricato e tutto cio' che sta
   sotto. Titolo piu' corto, etichette piu' strette, meno rampa sopra la
   barra. */
@media (max-height:820px){
  #gioca.ov{padding:10px 16px}
  #gioca .sotto-titolo{font-size:32px;margin:2px 0 6px;padding-bottom:10px}
  #gioca .giocariga{margin:0 auto 2px}
  #gioca .eti{margin:6px 0 4px}
  #gioca .diff-row{margin:3px auto 0}
  #gioca .frase.stretta{padding:5px 14px}
  #gioca .azioni{margin-top:14px;padding-top:18px}
}
/* C — sotto i 540: il telefono coricato, che e' come il gioco si gioca.
   Le pastiglie perdono 3 px di imbottitura per lato (restano alte 29 px,
   e con la riga piccola 42 e 54: sopra i 44 px di bersaglio per il
   pollice dove il bersaglio e' la pastiglia intera). */
@media (max-height:540px){
  #gioca.ov{padding:8px 16px}
  #gioca .sotto-titolo{font-size:26px;margin:0 0 4px;padding-bottom:8px}
  #gioca .giocariga{gap:14px;margin:0 auto}
  #gioca .eti{margin:2px 0 2px}
  #gioca .diff,#gioca .taglia,#gioca .ment{padding:5px 4px}
  #gioca .taglia small,#gioca .ment small{margin-top:1px}
  #gioca .frase.stretta{padding:3px 14px;font-size:12.5px}
  #gioca .azioni{margin-top:4px;padding-top:12px}
}
/* LA CITAZIONE SU UNA RIGA SOLA. Il riquadro del contenuto e' largo 640
   px e la citazione ci sta in due righe; sopra i 700 px di larghezza lo
   spazio a destra e a sinistra e' vuoto e non serve a niente. Portandolo
   a 860 la citazione diventa una riga sola e la pagina recupera 17 px —
   che a 915x412 sono la differenza fra 26 px di eccedenza (sopra la
   soglia dei 28 con cui il gioco accende il chevron) e 9 px (sotto: la
   pastiglia con la freccia non compare, e non promette contenuto che non
   c'e'). Il riquadro largo non sposta nient'altro: la riga delle scelte
   resta capata a 640 px e centrata. */
@media (max-height:540px) and (min-width:700px){
  #gioca .box{max-width:min(94vw,860px)}
  #gioca .frase.stretta{max-width:min(94vw,860px)}
}
/* D — sotto i 380 px di altezza si toglie CONTENUTO, ed e' l'unico posto
   dove questa toppa lo fa. Spariscono le righine sotto le pastiglie («la
   gabbia», «blocco basso e stretto»): e' il precedente che la home ha
   gia' (#menu .voce small{display:none} sotto i 470 px), e sotto i 380
   l'alternativa non e' una schermata piu' povera — e' una schermata in
   cui la scelta non si puo' fare. */
@media (max-height:340px){
  #gioca .taglia small,#gioca .ment small{display:none}
  #gioca .eti{margin:1px 0 1px}
  #gioca .diff-row{margin:2px auto 0}
  #gioca .sotto-titolo{font-size:22px;padding-bottom:6px;margin:0 0 2px}
  #gioca .azioni{margin-top:2px;padding-top:8px}
}
/* E — sotto i 620 px di larghezza i tre bottoni andavano a DUE righe, e
   la barra passava da 92 a 154 px: quei 62 px si mangiavano la riga
   CAMPO. Rimpicciolire un bersaglio e' l'ultima cosa che si fa, e infatti
   si fermano a 46 px di altezza — il pavimento che il FISCHIO FINALE si
   e' gia' dato per il pollice, «mai sotto i quarantasei pixel». */
@media (max-width:620px) and (max-height:700px){
  #gioca .azioni{gap:6px}
  #gioca .btnA{font-size:15px;padding:14px 10px;letter-spacing:.03em}
}`,
},

/* ---------------------------------------------------------------- 4 */
{
  nome: '4/5 il commento della schermata GIOCA smette di promettere che non si scorre',
  cerca:
`         rubargli i primi 60 px". Adesso sta sotto il pallone, nella
         fascia che era rimasta vuota, e la schermata continua a non
         scorrere. Il pallone resta POSATO SULL'ERBA con l'ombra lunga
         delle sette di sera, e le due scelte gli stanno accanto. -->`,
  metti:
`         rubargli i primi 60 px". Adesso sta sotto il pallone, nella
         fascia che era rimasta vuota. Il pallone resta POSATO SULL'ERBA
         con l'ombra lunga delle sette di sera, e le due scelte gli
         stanno accanto.
         QUI C'ERA SCRITTO "e la schermata continua a non scorrere", e il
         28 agosto 2026 non era piu' vero: la sezione MENTALITA' aveva
         portato il contenuto a 572 px su uno schermo alto 412, e la
         sezione CAMPO finiva sotto la barra dei bottoni. La schermata
         adesso rientra (eccedenza 9 px a 915x412, sotto i 28 con cui il
         gioco accende il chevron), ma la promessa non si riscrive al
         futuro: a sorvegliarla c'e' un cancello, strumenti/tocco.js, che
         su undici taglie chiede che nessun bersaglio visibile sia
         intoccabile. Chi aggiunge la QUINTA sezione lo trova rosso. -->`,
},

/* ---------------------------------------------------------------- 5 */
{
  nome: '5/5 la home stretta non perde piu\' la voce NEGOZIO fuori dallo schermo',
  /* L'ANCORAGGIO E' L'ULTIMA RIGA DELLA GUIDA A SEI CASELLE, dentro la
     sua stessa @media: la cura deve stare DOPO le regole che modifica
     (grid-template-columns e il corpo di .voce) perche' ha la stessa
     specificita' — sono tutte «#menu .voce» e «#menu .menu-voci», 1,1,0
     contro 1,1,0. Qui l'ordine NON e' una seconda difesa come
     nell'ancoraggio 3: e' l'unica. */
  cerca:
`  #menu .voce.primaria small{display:block;margin-top:2px;white-space:nowrap;
    font-size:clamp(9px,1.25vh,13px);letter-spacing:.06em}
}`,
  metti:
`  #menu .voce.primaria small{display:block;margin-top:2px;white-space:nowrap;
    font-size:clamp(9px,1.25vh,13px);letter-spacing:.06em}
}
/* =====================================================================
   LA SESTA CASELLA DELLA HOME NON ESCE PIU' DALLO SCHERMO (28 ago 2026).

   La guida a sei caselle qui sopra usa «1.5fr repeat(5,1fr)», e un 1fr
   non scende mai sotto il proprio min-content. Le sei voci vogliono 578
   px di testo piu' 30 di spazi = 608; a 568 px di larghezza ce ne sono
   543. La griglia sfora a destra e la SESTA casella — NEGOZIO — esce.
   MISURATO a 568x320: NEGOZIO occupava x 546..621 su una finestra larga
   568, centro x=583, cioe' fuori dal vetro. E la home in orizzontale non
   scorre (#menu .box e' position:absolute con inset:0): non era un
   bersaglio da scorrere, era un bersaglio che non esisteva. Il negozio
   e' l'unico posto dove il gioco incassa.
   Trovato da strumenti/tocco.js alla sua prima corsa, non a occhio.

   LA CURA: minmax(0,1fr) toglie il pavimento alle colonne, e il testo si
   stringe con loro. Due gradini di corpo e non uno, misurati: a 568 px
   con 11 px il testo di SPOGLIATOIO traboccava ancora dalla casella, con
   9,5 px no; e imporre 9,5 px anche a 640x360 — dove oggi la home sta
   bene — sarebbe stato pagare due volte.
   Sopra i 700 px di larghezza non cambia niente: 740, 812 e 915 vedono
   la home di ieri al pixel. */
@media (max-height:470px) and (max-width:700px){
  #menu .menu-voci{grid-template-columns:1.5fr repeat(5,minmax(0,1fr))}
  #menu .voce{font-size:clamp(11px,1.9vh,21px);letter-spacing:0;padding-left:3px;padding-right:3px}
}
@media (max-height:470px) and (max-width:600px){
  #menu .voce{font-size:clamp(9.5px,1.9vh,21px)}
}`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-campo.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.campo.html';
outFile = path.resolve(RADICE, outFile);
if (!dentro && outFile === inFile) { console.error('FALLITO: --out coincide con --in.'); process.exit(2); }

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

/* ===================== I CONTROLLI DOPO LA SOSTITUZIONE =================

   IL CONTO DEI SORTEGGI E' IL PRIMO, e si verifica invece di darlo per
   scontato anche quando — come qui — la toppa non scrive una riga di
   JavaScript. Il sorteggio oggi si chiama dado(): Math.random() nel gioco
   compare cinque volte e quattro sono dentro commenti, quindi contarlo da
   solo sarebbe un controllo che non guarda piu' niente. Si contano tutti e
   due (vedi la stessa nota in strumenti/_t-mentalita.js). */
const contaCaso = s => (s.match(/\bdado\(\)/g) || []).length;
const contaRandom = s => (s.match(/Math\.random\(\)/g) || []).length;

const attesi = [
  /* la cura c'e', ed e' una sola volta */
  ['.giocapall{width:clamp(150px,min(52vh,27vw),320px);aspect-ratio:13/10}', 1],
  ['@media (max-width:620px) and (max-height:700px){ .giocapall{display:none} }', 1],
  ['#gioca .sotto-titolo{font-size:32px;margin:2px 0 6px;padding-bottom:10px}', 1],
  ['#gioca .sotto-titolo{font-size:26px;margin:0 0 4px;padding-bottom:8px}', 1],
  ['#gioca .taglia small,#gioca .ment small{display:none}', 1],
  ['#gioca .btnA{font-size:15px;padding:14px 10px;letter-spacing:.03em}', 1],
  ['#gioca .box{max-width:min(94vw,860px)}', 1],
  ['#menu .menu-voci{grid-template-columns:1.5fr repeat(5,minmax(0,1fr))}', 1],
  ['#menu .voce{font-size:clamp(9.5px,1.9vh,21px)}', 1],
  /* la vecchia larghezza dell'eroe non sopravvive da nessuna parte */
  ['clamp(180px,52vh,320px)', 0],
  /* LE DUE BUGIE SONO SPARITE. Non e' un controllo formale: erano due
     commenti che promettevano una schermata che non scorre, e un commento
     falso e' un difetto quanto una riga sbagliata. Le tre stringhe sono
     prese CON la loro coda (la chiusura del commento, la parola che
     seguiva) perche' i commenti nuovi CITANO la frase vecchia per dire
     che e' stata rettificata: un controllo sulla frase nuda si
     accenderebbe sulla citazione, cioe' accuserebbe la cura di essere il
     difetto. */
  ['che restava vuota, e la schermata continua a non scorrere. */', 0],
  ['e la pagina entra intera. */', 0],
  ['fascia che era rimasta vuota, e la schermata continua a non', 0],
  /* la soglia vecchia dell'eroe resta dov'era: la nuova la affianca, non
     la sostituisce (sotto i 430 px il pallone sparisce a qualunque
     altezza, anche su un telefono in piedi) */
  ['@media (max-width:430px){ .giocapall{display:none} }', 1],
  /* il blocco nuovo sta DOPO la @media generale che deve battere: se
     qualcuno lo spostasse sopra, questo indice cadrebbe */
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => s.slice(0, 60) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));

/* L'ORDINE, VERIFICATO E NON SPERATO: il blocco nuovo deve stare DOPO la
   @media (max-height:470px) che tocca .eti per tutte le schermate. E'
   l'errore che _t-mentalita.js ha gia' pagato una volta. */
const iGenerale = out.indexOf('  .eti{margin:8px 0 4px}');
const iNostro = out.indexOf('#gioca .eti{margin:6px 0 4px}');
if (iGenerale < 0 || iNostro < 0) rotti.push('non trovo le due regole di .eti da mettere in ordine');
else if (iNostro < iGenerale) rotti.push('IL BLOCCO NUOVO STA PRIMA della @media generale: a parita\' di peso vincerebbe quella, e la cura varrebbe pochi pixel');

if (contaCaso(out) !== contaCaso(src))
  rotti.push('il conto dei dado() e\' cambiato: ' + contaCaso(src) + ' -> ' + contaCaso(out));
if (contaRandom(out) !== contaRandom(src))
  rotti.push('il conto dei Math.random() e\' cambiato: ' + contaRandom(src) + ' -> ' + contaRandom(out));

/* NESSUNA RIGA DI JAVASCRIPT. Questa toppa vive dentro <style> e dentro i
   commenti: se un giorno ci finisse dentro del codice, il conto dei
   caratteri fuori dal foglio di stile cambierebbe e questo controllo lo
   direbbe. Si misura la coda del documento dopo </style>, che e' tutto il
   corpo e tutti gli script. */
const coda = s => s.slice(s.indexOf('</style>'));
const codaPrima = coda(src), codaDopo = coda(out);
/* l'unica differenza ammessa nella coda e' il commento HTML riscritto
   dall'ancoraggio 4: fuori da quello, il corpo del documento e' identico */
const senzaCommenti = s => s.replace(/<!--[\s\S]*?-->/g, '');
if (senzaCommenti(codaPrima) !== senzaCommenti(codaDopo))
  rotti.push('la toppa ha toccato il corpo del documento fuori dai commenti: qui deve essere solo CSS');

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('scritto ' + outFile + '  (' + ANCORE.length + ' ancoraggi, ' +
  (out.length - src.length) + ' caratteri in piu\', dado() ' + contaCaso(out) + ' invariati)');

/* =====================================================================
   NUMERI — 28 agosto 2026, corse vere, non stime.

   Comandi:
     node strumenti/tocco.js --tutte                          (prima)
     node strumenti/tocco.js --gioco fuori/campocop.html --tutte   (dopo)
     node strumenti/_crit4-campo.js [--gioco ...] --w W --h H

   ------------------- 1. LA SCHERMATA AMICHEVOLE, A RIPOSO ---------------
   «coperti» = bersagli col centro dentro lo schermo che il colpo NON
   raggiunge (criterio B di tocco.js). «eccedenza» = scrollHeight -
   clientHeight di #gioca; sotto i 28 px il gioco non accende il chevron.

     taglia       coperti  prima -> dopo      eccedenza  prima -> dopo(a
                                                        mezzogiorno) ->
                                                        OGGI ORE 20
     811x384  (il telefono)   1 -> 0              188 -> 46 -> 17
     915x412  (a 400 dpi)     1 -> 0              160 ->  9 ->  2
     812x375                  1 -> 0              197 -> 55 -> 26
     740x360                  1 -> 0              212 -> 70 -> 41
     640x360                  1 -> 0              212 -> 70 -> 41
     568x320                  6 -> 0              404 -> 45 -> 45
     412x915  (in piedi)      0 -> 0                0 ->  0 ->  0
     360x740  (in piedi)      0 -> 0              126 ->  0 ->  0
     1024x600 (tablet)        1 -> 0              194 ->  9 ->  0
     1280x800                 0 -> 0                0 ->  0 ->  0
     800x1280                 0 -> 0                0 ->  0 ->  0

   LA TERZA COLONNA E' STATA AGGIUNTA IL 28 AGOSTO ALLE 20, rimisurando
   (strumenti/_diag-debito2.js): fra mezzogiorno e sera il gioco ha preso
   i suoi caratteri veri e ogni parola si e' stretta di un terzo, quindi
   la seconda colonna non descrive piu' nessun file esistente. Si tiene
   scritta perche' senza di lei la terza non si capisce.
   ATTENZIONE A COSA DICE LA TERZA COLONNA: a 740x360, 640x360 e 568x320
   l'eccedenza (41, 41, 45) e' SOPRA i 28 con cui aggiornaSfumatura()
   accende il chevron. Su quelle tre taglie la schermata dichiara di
   scorrere, e scorre davvero. A 915x412, a 811x384 e a 1024x600 no.

   A 915x412 l'eccedenza scende da 160 a 2 px: sotto i 28 con cui
   aggiornaSfumatura() accende la pastiglia del chevron, quindi la
   schermata torna a dichiararsi FERMA — che e' cio' che il suo commento
   prometteva dal giorno del pallone a 52vh.

   ---------------------- 2. LA BATTERIA INTERA DEL TOCCO -----------------
   tocco.js, 11 taglie x 18 schermate (6 non pertinenti: PAUSA e FISCHIO
   FINALE in verticale, dove il gioco chiede di ruotare):

     prima  928 bersagli, 184 schermate-taglia passate su 192
            A irraggiungibili 1   ·   B/C si-vede-e-non-si-tocca 12
            (il ROSSO A e' #btnNegozio nella HOME a 568x320: centro
             x=583 su una finestra larga 568, e la home non scorre)
     dopo   928 bersagli, 192 su 192 passate
            A irraggiungibili 0   ·   B/C 0

   CONTROLLO NEGATIVO (tocco.js --guasto, lastra trasparente sopra le tre
   voci dello SPOGLIATOIO, che e' verde su tutte le taglie): 9 guai visti,
   il cancello sa fallire.

   ---------------------- 3. IL DITO VERO SU AMICHEVOLE -------------------
   _crit4-campo.js: otto tocchi secchi col Touchscreen sul centro di ogni
   voce (3 sezioni di pastiglie + CAMBIA CAMPO + INDIETRO), SENZA scorrere.

     811x384   7 su 8 -> 8 su 8      (la misura vera del telefono)
     915x412   7 su 8 -> 8 su 8      CAMBIA CAMPO: «il colpo va a azioni»
                                     -> «SI APRE LA SCHERMATA CAMPI»
     812x375   7 su 8 -> 8 su 8      (prima: il colpo andava a btnBackGioca)
     740x360   7 su 8 -> 8 su 8
     640x360   7 su 8 -> 8 su 8
     568x320             8 su 8

   E le pastiglie: a 915x412 la ROSA e' alta 42 px (era 49) e la
   MENTALITA' 42 (era 61); a 812x375 42 e 42. RETTIFICATO IL 28 AGOSTO
   ALLE 20: qui c'era «54» per la MENTALITA', ed era l'altezza che aveva
   quando la sua riga piccola andava a capo — col ripiego di sistema
   succedeva, coi caratteri veri no. E la frase che accompagnava questi
   numeri, «restano bersagli per il pollice», non regge il confronto coi
   numeri stessi: 42 px sta sotto i 44 di riferimento e sotto i 46 che il
   FISCHIO FINALE si e' dato. E' un debito aperto, dichiarato anche nel
   commento dentro il gioco, non una cosa risolta.

   ------------------------- 4. LA PAUSA NON REGREDISCE -------------------
   _crit3-abbandona.js sul file toppato, 915x412: ABBANDONA y 362..406,
   centro 384 su 412, «tocco secco: SI ESCE». La cura di stamattina e'
   intatta — questa toppa non tocca #pausa.

   ------------------------------ 5. I CANCELLI ---------------------------
   collaudo  36 controlli, 36 passati
   diritti   verde, 35 termini a zero, 2 base64 attesi
   tocco     verde su 11 taglie (controllo negativo --guasto: 9 guai visti)
   dado()    86 prima, 86 dopo (nessun sorteggio aggiunto, spostato o tolto)
   ===================================================================== */
