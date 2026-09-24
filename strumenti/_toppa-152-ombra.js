/* =====================================================================
   _toppa-152-ombra.js — LA MACCHIA DI CONTATTO SMETTE DI ESSERE UN BUCO
   NERO (voce #152, compito 3)

   ====================== DUE RETTIFICHE, PRIMA DI TUTTO ================

   (1) RIGA SUPERATA (24 settembre 2026). Il verbale del #151 diceva che
   il difetto delle ombre sta nella LUNGHEZZA: «la punta schiarita al 40%
   che sotto il 15% di stacco non si distingue dalle strisce di
   rasatura». Era vero il 15 agosto; non lo e' piu'. Rimisurato oggi sul
   merge-base 4ed12a6 con `istantanea --dettaglio`, le lunghezze delle
   ventidue ombre misurabili sono 1,19 · 1,41 · 1,60 · 1,66 · 1,71 ·
   1,77 · 1,84 · 1,89 · 1,97 · 1,98 · 2,02 · 2,05 · 2,08 · 2,25 · 2,27 ·
   2,29 · 2,31 · 2,39 · 2,45 · 2,47 · 2,48 · 2,56 volte la figura, contro
   un minimo di 1,2: **nessuna figura cade per la lunghezza**. Fra il 15
   agosto e oggi la punta e' stata scurita (LNG1 da 0,24 a 0,80) e quella
   cura ha funzionato. Chi riapre questo cantiere non parta da li'.

   (2) «STACCATA» NON VUOL DIRE STACCATA. Lo scarto che il metro stampa
   come «con la macchia scura staccata dai piedi» scatta quando
   `primoBuio < 0 || primoBuio > 0.5·h`. Misurato su tutte le ricorrenze,
   prima e dopo questa toppa, il valore e' SEMPRE −1: cioe' la marcia
   finale lungo la direzione affinata non trova NESSUN tratto scuro, non
   ne trova uno che comincia tardi. Sono due guasti diversi e il nome ne
   racconta uno solo. Da oggi il dettaglio stampa il numero accanto al
   nome (`il primo buio a −1 px su una figura di 110, tetto 55`), perche'
   uno scarto che non porta il suo numero manda chi ripara a indovinare.

   ====================== DOVE STA IL DIFETTO, CONTATO ==================
   Otto istanti, otto figure ciascuno: sessantaquattro osservazioni, 22
   ombre misurate e 42 scartate. Le ragioni, sul merge-base:

     in duello                11      \
     sul bordo del quadro     10       >  28 su 42 — DUE TERZI
     coi piedi fuori dal manto 7      /
     con due ombre addosso     4      \
     dentro una pozza di buio  3       |  14 su 42
     staccata (vedi sopra)     3       |
     troppo sottile            2       |
     traccia insufficiente     2      /

   DUE TERZI DEGLI SCARTI NON PARLANO DELL'OMBRA. «In duello», «sul
   bordo» e «coi piedi fuori dal manto» dicono dove la CAMERA ha messo le
   figure, non come e' disegnata la loro ombra: il metro si rifiuta di
   giudicare, e ha ragione. Nessuna cura al disegno delle ombre li puo'
   toccare. Questo e' il tetto di cio' che questo compito poteva
   comprare, ed e' bene che sia scritto prima del risultato.

   ====================== LA CAUSA CURABILE, E IL SUO CONTO =============
   Il metro riconosce il manto come: tinta fra 60 e 175 gradi,
   saturazione almeno 0,12, e **VALORE (il canale piu' alto) almeno
   0,18**, cioe' 45,9 su 255. Il conto, sul manto misurato dal metro
   all'istante 7, rgb(41·73·36), con l'alfa d'ombra a 0,52 x 1,34 = 0,70:

     una capsula       (22,1 · 48,5 · 33,2)   valore 0,190   e' manto
     la MACCHIA DI CONTATTO, che e' NERO PURO al 60% dentro la sua
     tessitura e si stende all'81% di alfa:
                       (11,2 · 24,6 · 16,8)   valore 0,096   NON e' manto

   La macchia sotto OGNI paio di piedi ESCE DALLA FAMIGLIA DEL PRATO. Due
   conseguenze, tutt'e due misurate dal metro:
     · il disco attorno all'ancora si riempie di pixel che non sono ne'
       manto ne' corpo, la quota scende sotto il 72% e la figura esce con
       «piedi fuori dal manto»;
     · quei pixel non sono nemmeno OMBRA per il metro (per essere buio
       bisogna prima essere erba), quindi la macchia che dovrebbe dire
       «il corpo tocca terra» non dice niente a nessuna misura.

   E non e' un capriccio del metro. Il file dichiara la stessa cosa in
   testa a SOLE — «tintaOmbra: MAI nero puro, perche' il nero spegne il
   verde e fa sembrare sporco il campo» — e quella riga era gia' stata
   applicata alla macchia di contatto in camera bassa (la scena del gol).
   In pianta era rimasta l'ultima ombra nera del gioco.

   ====================== LA CURA, IN TRE PEZZI =========================

   1. UNA TINTA SOLA, DICHIARATA UNA VOLTA. OMBRA_TINTA e OMBRA_CONTATTO
      stanno accanto a ombraTex e le leggono tutt'e tre le ombre a terra:
      la capsula lunga, il tratto del contorno e la macchia di contatto.
      Prima erano tre punti del file — due terne ricopiate a mano e un
      nero puro — ed e' la ferita che questo file si e' gia' aperto due
      volte con la direzione del sole. Il VALORE di OMBRA_TINTA non si
      muove: resta (14·38·32), quella del 16 agosto.

   2. LA MACCHIA DI CONTATTO PRENDE LA TINTA DELL'OMBRA: (8·40·22), cioe'
      la stessa famiglia della capsula, un gradino sotto. L'ALFA NON SI
      TOCCA — resta 0,80 — e non e' pigrizia: e' la macchia di contatto
      che ancora la figura al terreno, e schiarirla farebbe galleggiare
      ventidue uomini per far contento un istogramma. Col colore nuovo, e
      alla stessa alfa:
        prima  (11,2 · 24,6 · 16,8)  valore 0,096  NON e' manto
        dopo   (17,9 · 44,4 · 28,7)  valore 0,174  al bordo, e dal 38%
                                     del raggio in fuori torna manto
      Il cuore della macchia resta sotto il pavimento di un centesimo —
      e' il prezzo di non schiarirla — ma l'anello che prima era un buco
      nero adesso e' erba in ombra, ed e' quello che riempie il disco che
      il metro guarda.

      PERCHE' NON SI PUO' FARE MEGLIO, e il conto vale piu' del numero:
      sopra la capsula il canale verde parte da 48,5 e il pavimento e'
      45,9. Ci sono DUE VIRGOLA SEI livelli di margine, cioe' il 5,4%:
      qualunque macchia che voglia essere piu' scura della capsula di
      piu' del 6% esce dalla famiglia del prato. «Un contatto piu' scuro
      sotto i piedi» e «un contatto che il metro vede» sono due richieste
      che su questo manto, a quest'ora, si contendono cinque centesimi.
      Qui si e' scelto di tenere la macchia scura e di darle la chimica
      giusta, invece di schiarirla per compiacere la misura.

   3. E SI STRINGE, da 20 x 11,2 unita' a 14 x 7,8. Venti unita' di
      larghezza erano PIU' dell'intera capsula (15,2 unita'): la macchia
      era, alla lettera, «una pozza di buio larga quanto lunga» — che e'
      il nome di un altro scarto del metro. A quattordici sta sotto la
      capsula e legge come un'impronta.
      LA QUOTA ENTRA ANCHE QUI: la macchia si stringe con la STESSA r
      della capsula, cosi' un uomo a mezz'aria non lascia l'impronta di
      un uomo fermo. E' la stessa legge che il pallone applica gia' alla
      sua («si spegne in nove unita' di quota: un pallone in volo non
      tocca niente»), e da oggi corpo e pallone non raccontano piu' due
      fisiche diverse.

   ====================== CHE COSA HA COMPRATO, MISURATO ================
   `istantanea`, otto istanti, stesso seme, prima e dopo:

     figure con un'ombra MISURABILE      22  ->  23
     scartate «con due ombre addosso»     4  ->   2
     scartate «dentro una pozza di buio»  3  ->   1
     scartate «troppo sottile»            2  ->   1
     scartate «traccia insufficiente»     2  ->   1
     scartate «staccata» (vedi rettifica) 3  ->   8
     in duello / bordo / fuori dal manto 28  ->  28   (non le tocca nessuno)

   LA COLONNA «OMBRE» RESTA 5/8, E VA DETTO COSI'. Il bersaglio del
   cantiere era portarla sopra 5/8; non ci e' arrivata. Il guadagno c'e'
   (una figura in piu' misurabile, e meta' degli scarti di qualita'
   dell'ombra spariti) ma non basta a far passare i due istanti che
   cadono per «meno di due figure giudicabili»: li' gli scarti sono
   duello, bordo e piedi fuori dal manto, cioe' i tre su cui il disegno
   delle ombre non ha voce. Il terzo istante rosso cade per una figura
   sola, a 127 px dal bordo destro, la cui ombra ESCE DAL QUADRO mentre a
   monte le passa sopra il buio di un compagno: il metro le assegna
   −145 gradi contro i 23 delle altre. Anche quello non e' un difetto di
   come e' disegnata l'ombra.

   UNA COSA PROVATA E SCARTATA, perche' un tentativo che non si scrive e'
   un tentativo che qualcuno rifara'. Si e' provato a dare a OMBRA_TINTA
   piu' margine sul pavimento del valore — (14·38·32) -> (13·47·31), il
   verde su e il grigio via — per far tornare nella famiglia del prato
   anche DUE capsule accavallate (0,162 -> 0,193). Misurato: la colonna
   «ombre» non si e' mossa di un istante, e la colonna «centro e' sera»
   si e' spostata — l'istante 8 e' passato da saturazione −15,5% a
   −14,5%, cioe' da OK a NO, perche' la tinta nuova e' piu' satura
   (0,723 contro 0,632) e il manto in ombra tira su la saturazione del
   terzo centrale. Un cambio che non compra niente dove serve e mette in
   bilico una colonna che tiene si rimette a posto: e' rimesso a posto.

   COSA NON SI TOCCA, e sta scritto nel gioco: «se le ombre si fondono in
   una rete scura SI ABBASSA L'ALFA, MAI LA LUNGHEZZA». Qui non si tocca
   ne' l'una ne' l'altra: OMBRA_ALFA resta 0,52, la lunghezza resta 2,2
   volte la figura, la passata resta UNA SOLA e prima di tutti i corpi.

   COSTO: zero operazioni di canvas in piu'. Le tessiture si cuociono una
   volta sola e sono le stesse; la macchia di contatto e' lo stesso
   drawImage con un riquadro piu' piccolo.

   uso:  node strumenti/_toppa-152-ombra.js ingresso.html uscita.html
   ===================================================================== */
'use strict';
const fs = require('fs');

const CAMBI = [];
const cambio = (nome, cerca, sostituisci) => CAMBI.push({ nome, cerca, sostituisci });

/* ---------------------------------------------------------------- 1
   LE DUE TINTE, DICHIARATE UNA VOLTA SOLA, accanto alle tessiture che
   le consumano. */
cambio('1. le due tinte dell\'ombra, in un posto solo',
`let ombraTex=null, poolTex=null;`,
`/* =====================================================================
   LE DUE TINTE DELL'OMBRA A TERRA — dichiarate QUI e in nessun altro
   posto (voce #152).

   Prima erano tre: la terna della capsula lunga scritta dentro
   buildOmbraLungaTex, la STESSA terna ricopiata a mano dentro
   drawOmbreGiocatori per il tratto del contorno, e un NERO PURO dentro
   buildOmbraTex per la macchia di contatto. Tre posti, e il terzo
   raccontava un'altra luce: e' la ferita che questo file si e' gia'
   aperto due volte con la direzione del sole.

   OMBRA_TINTA (14·38·32) — l'ombra portata. Il VALORE non e' cambiato:
   e' la terna del 16 agosto, con tutto il ragionamento che sta dentro
   buildOmbraLungaTex ancora valido parola per parola. Qui si e' solo
   smesso di scriverla due volte.

   OMBRA_CONTATTO (8·40·22) — la macchia sotto i piedi: la stessa
   famiglia, un gradino sotto. Serve a dire «il corpo TOCCA TERRA», e
   fin qui lo diceva in NERO PURO — l'ultima ombra nera rimasta nel
   gioco, contro la prima riga del contratto scritto in testa a SOLE.
   Il nero non e' solo brutto sull'erba: e' INVISIBILE a ogni misura,
   perche' il metro chiama ombra solo un pixel che sia ancora manto, e
   il nero al 48% porta il manto a 0,096 di valore contro un pavimento
   di 0,18. La macchia che ancora la figura al terreno non esisteva per
   nessuno strumento, e il disco che il metro guarda attorno ai piedi si
   riempiva di pixel che non erano ne' manto ne' corpo.
   L'alfa NON e' stata toccata: schiarire la macchia farebbe galleggiare
   ventidue uomini per far contento un istogramma.
   ===================================================================== */
const OMBRA_TINTA='rgb(14,38,32)';
const OMBRA_CONTATTO=[8,40,22];
let ombraTex=null, poolTex=null;`);

/* ---------------------------------------------------------------- 2
   La tessitura della macchia di contatto smette di essere nera. */
cambio('2. la macchia di contatto non e\' piu\' nero puro',
`  const g=c.createRadialGradient(N/2,N/2,0,N/2,N/2,N/2);
  g.addColorStop(0,   'rgba(0,0,0,.60)');
  g.addColorStop(0.38,'rgba(0,0,0,.54)');
  g.addColorStop(0.64,'rgba(0,0,0,.36)');
  g.addColorStop(0.86,'rgba(0,0,0,.11)');
  g.addColorStop(1,   'rgba(0,0,0,0)');`,
`  /* LA MACCHIA DI CONTATTO PRENDE LA TINTA DELL'OMBRA (voce #152).
     Qui c'era rgba(0,0,0,...) su tutte e cinque le fermate. Le cinque
     fermate e le cinque alfe restano quelle: cambia soltanto di che
     colore e' il buio. Col nero, sopra la capsula, il pixel finiva a
     0,096 di valore — fuori dalla famiglia del prato, quindi fuori da
     ogni misura d'ombra; con (8·40·22) sta a 0,174 al centro e torna
     manto dal 38% del raggio in fuori. */
  const OC=OMBRA_CONTATTO.join(',');
  const g=c.createRadialGradient(N/2,N/2,0,N/2,N/2,N/2);
  g.addColorStop(0,   'rgba('+OC+',.60)');
  g.addColorStop(0.38,'rgba('+OC+',.54)');
  g.addColorStop(0.64,'rgba('+OC+',.36)');
  g.addColorStop(0.86,'rgba('+OC+',.11)');
  g.addColorStop(1,   'rgba('+OC+',0)');`);

/* ---------------------------------------------------------------- 3
   La capsula lunga legge la tinta dichiarata invece di ricopiarla. */
cambio('3. la capsula lunga legge la tinta dichiarata',
`  const R=14, G2=38, B=32;`,
`  /* LA TERNA ARRIVA DA OMBRA_TINTA e non si riscrive qui (voce #152):
     era una delle tre copie, e la copia e' la verita' che diverge. I
     numeri sono gli stessi — il ragionamento qui sopra non si tocca. */
  const [R,G2,B]=OMBRA_TINTA.slice(4,-1).split(',').map(Number);`);

/* ---------------------------------------------------------------- 4
   Il tratto del contorno idem. */
cambio('4. il tratto dello scheletro legge la tinta dichiarata',
`  ctx.strokeStyle='rgb(14,38,32)';`,
`  ctx.strokeStyle=OMBRA_TINTA;`);

/* ---------------------------------------------------------------- 4b
   La macchia di contatto del rig in camera bassa era la TERZA copia. */
cambio('4b. la macchia del rig in camera bassa legge la tinta dichiarata',
`      ctx.globalAlpha=0.22*(0.40+0.60*fo); ctx.fillStyle='rgb(14,38,32)';`,
`      /* LA TERZA COPIA DELLA TINTA (voce #152). Questa macchia si
         disegna solo in camera bassa — il gol e il dischetto — ed e' la
         stessa cosa della macchia di contatto in pianta: adesso legge
         OMBRA_CONTATTO, cosi' le due scene raccontano lo stesso buio. */
      ctx.globalAlpha=0.22*(0.40+0.60*fo); ctx.fillStyle='rgb('+OMBRA_CONTATTO+')';`);

/* ---------------------------------------------------------------- 5
   La macchia di contatto si stringe e prende la quota. */
cambio('5. la macchia di contatto si stringe e si ancora alla quota',
`      ctx.globalAlpha=ac*0.80;
      ctx.drawImage(ombraTex, CX-10, CY-5.6, 20, 11.2);`,
`      /* =============================================================
         LA MACCHIA SI STRINGE, DA 20 x 11,2 UNITA' A 14 x 7,8.

         Venti unita' di larghezza erano PIU' dell'intera capsula (15,2
         unita', cioe' due volte semiCorto): la macchia che deve dire
         «qui poggia un piede» era, alla lettera, «una pozza di buio
         larga quanto lunga» — che e' il nome di uno degli scarti del
         metro, e in un istante ne ha fatti cadere due. A quattordici sta
         sotto la capsula e legge come un'impronta.
         L'ALFA NON SI TOCCA: e' lei che ancora la figura al terreno.
         Quello che cambia e' il COLORE (vedi OMBRA_CONTATTO): il nero
         puro non era solo contro il contratto di SOLE, era invisibile a
         ogni misura, perche' un pixel che non e' piu' manto non puo'
         essere manto imbrunito.

         LA QUOTA ENTRA ANCHE QUI. La capsula gia' si stacca, rimpicciolisce
         e schiarisce col salto (k, r, a); la macchia restava larga uguale,
         e un uomo a mezz'aria lasciava l'impronta di un uomo fermo. Adesso
         si stringe con la STESSA r della capsula — la stessa legge che il
         pallone applica gia' alla sua («si spegne in nove unita' di quota:
         un pallone in volo non tocca niente»), e da oggi corpo e pallone
         non raccontano due fisiche diverse. */
      ctx.globalAlpha=ac*0.80;
      ctx.drawImage(ombraTex, CX-7*r, CY-3.9*r, 14*r, 7.8*r);`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-152-ombra.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
/* la prova che non e' rimasta una copia della tinta vecchia in giro, e
   che le tre ombre a terra leggono davvero le due dichiarazioni */
for (const [k, q] of [['rgba(0,0,0,.60)', 0],
                      ["const OMBRA_TINTA='rgb(14,38,32)';", 1],
                      ['const OMBRA_CONTATTO=[8,40,22];', 1],
                      ['const [R,G2,B]=OMBRA_TINTA.slice(4,-1).split(\',\').map(Number);', 1],
                      ['ctx.strokeStyle=OMBRA_TINTA;', 1],
                      ['ctx.drawImage(ombraTex, CX-7*r, CY-3.9*r, 14*r, 7.8*r);', 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: le ombre, ' + CAMBI.length + ' cambi, ' + ing + ' -> ' + usc);
console.log('  il file cresce di ' + (Buffer.byteLength(t, 'utf8') - fs.statSync(ing).size) + ' byte');
