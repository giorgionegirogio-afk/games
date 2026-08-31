/* =====================================================================
   _t-comandi.js — I COMANDI SMETTONO DI NASCONDERE LA SQUADRA
   (28 agosto 2026).

   TRE DIFETTI, visti sul OnePlus 6 vero e non su un banco.

   1. I DISCHI COPRONO GLI UOMINI. fuori/tel-11.png: a 11 contro 11,
      sotto PASSAGGIO e TIRA, cinque azzurri. Chi gioca non vede meta'
      della propria squadra ogni volta che l'azione va a destra — cioe'
      dove si attacca. Nessun cancello lo vedeva, e la ragione e' che
      __test.copertura() guarda QUATTRO soggetti (palla, comandato,
      porta attaccata, portiere) e un compagno non e' nessuno dei
      quattro. Il righello non era rotto: era nato per quel criterio, e
      un compagno non era mai stato nell'elenco.

   2. PASSA E PASSAGGIO NELLA STESSA SCHERMATA. Due dischi a otto
      centimetri l'uno dall'altro, due verbi diversi (l'appoggio e la
      filtrante), e due nomi che si somigliano al punto che il primo e'
      il prefisso del secondo. Peggio: quello che diceva PASSAGGIO era
      la FILTRANTE, cioe' il nome generico stava sul gesto speciale.

   3. «AVVERSARIO IN 2  9"». Due numeri appiccicati di cui uno — il 2 —
      non veniva da nessun conto: era scritto a mano nella stringa dal
      primo commit del gioco, e non voleva dire niente.

   ------------------------------------------------------------------
   LA CURA DEL PRIMO, e le due strade gia' battute che non bastano.

   Nel gioco c'e' gia' un verbale, sotto scartoMuro: il 16 agosto si era
   provato a velare TUTTO il disco al 55% sotto un corpo qualunque, ed
   e' stato bocciato con la misura — una pastiglia d'ardesia
   semitrasparente stesa sul manto non e' ne' interfaccia ne' prato, e'
   una macchia scura con la tinta dell'erba sotto, cioe' la definizione
   di ombra per chi misura le ombre (il cancello delle ombre cadde da 7
   istanti su 8 a 5).

   Oggi si sono misurate le altre due, sullo STESSO banco e sulla STESSA
   partita — 11 contro 11 a 845x402, sei semi da trenta secondi, 9397
   fotogrammi, e le quattro colonne vedono lo stesso identico incontro
   (9,91 uomini in quadro in tutte e quattro: il banco e' a passi fissi e
   la simulazione non cambia di un bit, vedi fuori/_diag-identica.js):

                            uomini coperti          dischi   etichette
                          oltre 25%  oltre 50%      spenti   deformate
     gioco spedito          0,449      0,251         0,1%        0
     D disco intero velato  0,001      0,000        13,9%        0
     B dischi piu' piccoli  0,316      0,152         0,1%        2
     A QUESTA CURA          0,182      0,002         0,1%        0

   D BOCCIATA: toglie il difetto e spegne il comando. Un disco su sette
   invisibile (13,9% dei disco-fotogramma sotto 0,15, contro lo 0,1% di
   oggi) non e' un'interfaccia che si toglie di mezzo, e' un'interfaccia
   rotta.
   B BOCCIATA: i dischi da 40/30/26/26 scesi a 32/24/21/21 tolgono un
   terzo del difetto e ne lasciano due terzi, e in cambio DEFORMANO due
   parole — misurato col carattere vero: SCIVOLATA stretta a 0,662 del
   suo passo, la filtrante a 0,797 (il cancello _q-dischi le vede, C6).
   Riparare «non vedo i miei uomini» rendendo illeggibili i comandi e'
   uno scambio, non una cura. E costa il 35% del bersaglio per il
   pollice (area opaca dei comandi da 12117 a 7818 px per fotogramma).

   LA TERZA STRADA e' che un disco non ha UNA alfa, ne ha DUE. Sotto un
   corpo se ne va la PASTIGLIA — il fondino d'ardesia opaco, la sua
   ombra portata, la polvere di gesso — e restano alla loro alfa piena
   la GHIERA d'ambra, l'etichetta di gesso col suo zoccolo scuro e
   l'arco di carica. Il comando non si sposta di un pixel, si legge
   uguale, la mappa dei tocchi non cambia; dentro c'e' il prato con
   sopra il suo uomo, non una velatura. Nessuna macchia semitrasparente
   sul manto, quindi nessuna ombra finta: il difetto che aveva bocciato
   il velo del 16 agosto qui non nasce.

   Il taglio del difetto e' del 59% sugli uomini coperti oltre il 25%
   (0,449 -> 0,182 per fotogramma) e del 99% su quelli coperti oltre la
   meta' (0,251 -> 0,002): un uomo mezzo sepolto sotto un disco entra
   sempre di piu' di dieci pixel, e a quel punto la pastiglia non c'e'
   piu'. Il prezzo e' zero comandi spenti in piu' (0,1% prima, 0,1%
   dopo) e nessuna etichetta toccata. La pastiglia e' vuota nel 13,8%
   dei disco-fotogramma: sei volte su sette il disco e' quello di sempre.

   E VALE ANCHE DOVE IL DIFETTO ERA PIU' PICCOLO. A 5 contro 5 (stessa
   misura, 8539 fotogrammi, anche qui identici fra le due colonne) gli
   uomini in quadro sono 7,15 invece di 9,91 e il difetto era un uomo
   ogni quattro fotogrammi: coperti oltre il 25% da 0,276 a 0,116, oltre
   il 50% da 0,118 a ZERO — sul campo piccolo non resta un solo
   fotogramma con mezzo uomo sotto un disco.

   VISTO SUL TELEFONO VERO, che e' dove il difetto era stato trovato:
   OnePlus 6, APK costruito con questa toppa dentro, 11 contro 11.
   fuori/tel-dopo-11.png (il disco CONTRASTA e' un anello e l'uomo in
   rosa dietro si vede tutto) e fuori/tel-dopo-11-attacco.png (i quattro
   dischi dicono CROSS, PASSA, FILTRANTE, TIRA, e sotto PASSA si vede
   l'azzurro che ci passa). In tutte e due, in basso a sinistra,
   «UN UOMO IN MENO PER 12"» al posto di «AVVERSARIO IN 2  9"».

   LA SOGLIA E' LA SAGOMA, NON L'ANELLO. Qui si guarda la figura
   disegnata (semilarghezza 16 unita', dalla testa ai piedi), la stessa
   scatola che velaTabellone gia' usa per la stessa domanda. L'anello
   del comandato — 31 unita' — e' un marker, e il comandato ha gia' la
   sua protezione, che e' lo scarto intero di scartoHUD.

   ------------------------------------------------------------------
   IL RIGHELLO, MIGLIORATO. Tre cose nuove, tutte DICHIARATE dal gioco
   invece che indovinate da chi misura:
     · ogni disco dice l'alfa della sua PASTIGLIA (dentro) e il raggio
       del buco che si vede davvero (rInt);
     · ogni disco dice il riquadro della sua ETICHETTA (lab), che quando
       la pastiglia e' vuota e' l'unica cosa opaca rimasta dentro;
     · __test.copertura({uomini:true}) aggiunge TUTTI gli uomini in
       campo ai quattro soggetti storici, e conosce il buco.
   La firma senza argomenti resta quella di sempre: i quattro soggetti
   del criterio, nello stesso ordine. Nessun lettore esistente cambia
   risposta.

   ------------------------------------------------------------------
   LA CURA DEL SECONDO. 'through' torna a chiamarsi FILTRANTE, che e'
   il nome che quel verbo ha in italiano e che il codice usa gia' da se'
   (doFiltrante, eseguiFiltrante, chargeClip 'filtrante', e un commento
   del 16 agosto che parlava del «pulsante FILTRANTE»). Misurato oggi
   col carattere VERO — Barlow Condensed, che dal 28 agosto e' davvero
   incorporato — FILTRANTE sta in 42,3 px sui 46 disponibili del disco
   da 30 di raggio, al gradino 11 e senza stringere di un centesimo.
   Col ripiego di sistema (su questa macchina Segoe UI, perche' Arial
   Narrow non c'e') la stessa parola misura 68,5 px: ci stava solo
   stringendola a 0,672, cioe' deformata di un terzo — ed e' con quel
   ripiego che il gioco ha vissuto fino a ieri. PASSA resta PASSA, 33,9
   px sui 38 del suo disco, al gradino 15.

   LA CURA DEL TERZO. La riga dice UNA cosa: «UN UOMO IN MENO PER 9"» se
   sei tu a essere in dieci, «UN UOMO IN PIÙ PER 9"» se e' l'avversario.
   Il conto degli uomini fuori non era mai stato usato (con due espulsi
   la riga diceva lo stesso «IN 2»): adesso e' lui a scrivere il numero.
   I secondi sono quelli del PRIMO rientro, non dell'ultimo: e' il tempo
   per cui l'inferiorita' vale davvero com'e' scritta. E il riquadro si
   misura sul testo invece di essere largo 126 per sempre — il giorno in
   cui cambia il carattere, la riga non si taglia.

   ------------------------------------------------------------------
   BANCO:     node strumenti/_z-sotto-dischi.js --gioco fuori/comandi.html
                     --taglia 11 --sec 30 --semi 20260828,...,20260902
                     --vw 845 --vh 402
   CANCELLO:  node strumenti/_q-dischi.js --gioco fuori/comandi.html
              node strumenti/_q-dischi.js --gioco fuori/comandi.html --guasti
              Otto controlli. Rosso su cinque di loro col gioco SPEDITO
              (C1, C2, C5, C7, C8) e sugli altri tre con i guasti
              iniettati: ogni controllo ha il suo rosso dimostrato.
   IDENTITA': node fuori/_diag-identica.js fuori/_base-comandi.html
                     fuori/comandi.html 3600 11
              la simulazione non cambia di un bit — sorteggi, palla,
              punteggio e somma delle posizioni identici a 5 e a 11.

   uso:  node strumenti/_t-comandi.js --out fuori/comandi.html
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

/* 1 — il macchinario: i corpi in quadro, senza allocazioni, e la
       seconda alfa del disco */
{
  nome: '1/22 corpiHUD() e velaPastiglia() nascono accanto alla rampa corta',
  cerca:
`function scartoMuro(d){
  if(d>=0) return 1;
  if(d<=-10) return 0.10;
  const u=-d/10;
  return 1-0.90*u*u;
}`,
  metti:
`function scartoMuro(d){
  if(d>=0) return 1;
  if(d<=-10) return 0.10;
  const u=-d/10;
  return 1-0.90*u*u;
}
/* =====================================================================
   LA PASTIGLIA SI SVUOTA, LA GHIERA NO — la terza strada (28 ago 2026).

   IL DIFETTO, fotografato su un OnePlus 6 vero: a 11 contro 11, sotto i
   dischi PASSAGGIO e TIRA, cinque uomini azzurri. Chi gioca non vede
   meta' della propria squadra ogni volta che l'azione si sposta a
   destra, che e' dove si attacca. Nessun cancello lo vedeva, perche'
   copertura() guarda quattro soggetti e un compagno non e' nessuno dei
   quattro.

   LE DUE STRADE GIA' BATTUTE. Il verbale della prima sta qui sopra:
   velare TUTTO il disco al 55% sotto un corpo qualunque, provato il 16
   agosto e bocciato, perche' una pastiglia semitrasparente stesa sul
   manto non e' ne' interfaccia ne' prato — e' una macchia scura con la
   tinta dell'erba sotto, cioe' un'ombra finta per chi misura le ombre.
   La seconda si e' misurata oggi: velare tutto il disco fino a 0,10
   toglie di mezzo gli uomini (coperti oltre il 25%: 0,449 -> 0,001 per
   fotogramma) ma porta i disco-fotogramma sotto 0,15 dallo 0,1% al
   13,9% — un comando invisibile un fotogramma su sette. Bocciata anche
   la terza, i dischi piu' piccoli: 0,449 -> 0,316, e in cambio due
   etichette deformate (SCIVOLATA a 0,662 del suo passo).

   LA STRADA PRESA: il disco ha DUE alfe. Sotto un corpo se ne va la
   PASTIGLIA (fondino d'ardesia, ombra portata, polvere di gesso) e
   restano intere la GHIERA d'ambra, l'etichetta col suo zoccolo e
   l'arco di carica. Il comando non si sposta, si legge uguale, e dentro
   c'e' il prato con sopra il suo uomo: nessuna velatura, quindi nessuna
   ombra finta. Misurato su 9397 fotogrammi a passi fissi (11 contro 11,
   845x402, sei semi, e le due colonne vedono la stessa identica
   partita): uomini coperti oltre il 25% da 0,449 a 0,182 per
   fotogramma, oltre il 50% da 0,251 a 0,002, e comandi spenti invariati
   allo 0,1%. La pastiglia e' vuota nel 13,8% dei disco-fotogramma.

   LA SCATOLA E' LA SAGOMA, NON L'ANELLO: semilarghezza 16 unita', dalla
   testa ai piedi — la stessa che velaTabellone usa per la stessa
   domanda. Le 31 unita' di corpiSchermo sono l'anello del comandato,
   che e' un marker e ha gia' la sua protezione (scartoHUD intero).

   COSTO: una scansione della rosa per fotogramma e nessuna allocazione,
   perche' i rettangoli sono riusati come quelli di PROTA_SCH.
   ===================================================================== */
const CORPI_HUD=[]; let CORPI_HUD_N=0;
function corpiHUD(){
  CORPI_HUD_N=0;
  const v=G.view, S2=v&&v.S2;
  if(!S2||!G.players) return;
  const H=RIG_H*P_DIS*S2, w=16*S2;
  for(const p of G.players){
    if(p.out>0) continue;
    const cx=p.x*S2+v.Ax, py=(p.y+RIG_PIEDI)*S2+v.Ay;
    if(cx+w<0||cx-w>VW||py-H>VH||py<0) continue;
    let r=CORPI_HUD[CORPI_HUD_N];
    if(!r) r=CORPI_HUD[CORPI_HUD_N]={x0:0,y0:0,x1:0,y1:0};
    r.x0=cx-w; r.y0=py-H; r.x1=cx+w; r.y1=py;
    CORPI_HUD_N++;
  }
}
/* quanto e' dipinta la PASTIGLIA di un disco: 1 quando sotto non c'e'
   nessuno, 0,10 quando un uomo ci e' entrato dentro di dieci pixel. E'
   la RAMPA CORTA, la stessa dei muri: un uomo che sfiora il bordo non
   svuota niente, uno che ci entra si vede. */
function velaPastiglia(cx,cy,rr){
  return scartoMuro(distDisco(CORPI_HUD,CORPI_HUD_N,cx,cy,rr));
}`,
},

/* 2 — i corpi si contano una volta per fotogramma, dove si contano gia'
       il pallone e il protagonista */
{
  nome: '2/22 corpiHUD() gira dentro pallaSchermo, una volta per fotogramma',
  cerca:
`  protagonistaSchermo();
  if(G.scene==='kickoff' || G.capT>0) corpiSchermo();`,
  metti:
`  protagonistaSchermo();
  corpiHUD();
  if(G.scene==='kickoff' || G.capT>0) corpiSchermo();`,
},

/* 3 — e si azzerano dove si azzera tutto il resto: se la scena non e'
       di gioco, pallaSchermo esce prima e l'elenco deve gia' essere
       vuoto, se no i dischi si svuoterebbero sui corpi del fotogramma
       precedente */
{
  nome: '3/22 CORPI_HUD_N si azzera con gli altri, in cima a pallaSchermo',
  cerca:
`  PALLA_SCH=null;
  TOUCH_ZONE.length=0;
  CORPI_SCH.length=0;
  PROTA_N=0;`,
  metti:
`  PALLA_SCH=null;
  TOUCH_ZONE.length=0;
  CORPI_SCH.length=0;
  CORPI_HUD_N=0;
  PROTA_N=0;`,
},

/* 4 — le due alfe del disco, e la dichiarazione del vuoto */
{
  nome: '4/22 il disco dipinge la pastiglia con la sua alfa, e la dichiara',
  cerca:
`      const aBt=scartoHUD(bx0,by0,bt.r+4);
      TOUCH_ZONE.push({tipo:'pulsante', team:t, act:bt.act, label:bt.label,
                       x:bx0, y:by0, r:bt.r, premuto:pressed,
                       x0:bx0-bt.r-4, y0:by0-bt.r-4, x1:bx0+bt.r+4, y1:by0+bt.r+4,
                       alpha:+aBt.toFixed(3)});
      ctx.save();
      ctx.globalAlpha=aBt;`,
  metti:
`      const aBt=scartoHUD(bx0,by0,bt.r+4);
      /* LE DUE ALFE DEL DISCO (vedi velaPastiglia). aBt e' il comando
         intero e vale per la ghiera, l'arco di carica e l'etichetta;
         aPas e' la sola PASTIGLIA, che si svuota quando un uomo ci
         passa sotto. Premuto no: il riempimento d'ambra E' il segnale
         della pressione, dura il tempo di un dito, ed e' l'unico
         momento in cui chi guarda sta guardando il pollice e non il
         campo. */
      const aPas=pressed?1:velaPastiglia(bx0,by0,bt.r);
      /* IL BUCO SI DICHIARA, come tutto il resto dell'interfaccia:
           dentro  l'alfa della pastiglia (sotto 0,15 i pixel dentro la
                   ghiera sono tornati prato)
           rInt    il raggio di quel prato. La corona dipinta va da
                   r-3,9 (il bordo interno del filo caldo, centrato a
                   r-3,4 e spesso 1) a r+1,1 (il bordo esterno del filo
                   scuro): si dichiarano quattro pixel tondi, che e' la
                   misura prudente di quei 3,9.
           lab     il riquadro delle lettere, riempito piu' sotto: quando
                   la pastiglia se ne va, l'etichetta e' l'unica cosa
                   opaca rimasta dentro il buco, e un banco che non la
                   conoscesse direbbe «qui si vede il prato» dove ci sono
                   ancora nove lettere di gesso. */
      const zona={tipo:'pulsante', team:t, act:bt.act, label:bt.label,
                       x:bx0, y:by0, r:bt.r, premuto:pressed,
                       x0:bx0-bt.r-4, y0:by0-bt.r-4, x1:bx0+bt.r+4, y1:by0+bt.r+4,
                       alpha:+aBt.toFixed(3),
                       dentro:+(aBt*aPas).toFixed(3), rInt:Math.max(0,bt.r-4)};
      TOUCH_ZONE.push(zona);
      ctx.save();
      ctx.globalAlpha=aBt*aPas;`,
},

/* 5 — la ghiera, i fili, l'arco e l'etichetta tornano all'alfa piena:
       il comando non sparisce mai per colpa di un corpo */
{
  nome: '5/22 la ghiera riprende l\'alfa piena del comando',
  cerca:
`      /* la ghiera: ambra a riposo, gesso da premuta. Anche lei tre stop —
         il metallo prende il sole da ovest come tutto il resto */
      {
        const g=ctx.createLinearGradient(bx0-bt.r,by0-bt.r,bx0+bt.r,by0+bt.r);`,
  metti:
`      /* DA QUI IN GIU' IL COMANDO E' INTERO. Sopra c'era la pastiglia,
         che puo' essersi svuotata; ghiera, fili, arco di carica ed
         etichetta no: sono LORO il comando, e un comando non si spegne
         perche' un terzino gli passa dietro. */
      ctx.globalAlpha=aBt;
      /* la ghiera: ambra a riposo, gesso da premuta. Anche lei tre stop —
         il metallo prende il sole da ovest come tutto il resto */
      {
        const g=ctx.createLinearGradient(bx0-bt.r,by0-bt.r,bx0+bt.r,by0+bt.r);`,
},

/* 6 — il riquadro delle lettere, misurato dove le lettere si misurano */
{
  nome: '6/22 il riquadro dell\'etichetta si dichiara dopo averla scritta',
  cerca:
`      ctx.fillStyle= pressed ? '#151f1c' : UIM.gesso;
      ctx.fillText(bt.label, 0, 0);
      ctx.restore();
      ctx.restore();          // chiude lo scarto col pallone`,
  metti:
`      ctx.fillStyle= pressed ? '#151f1c' : UIM.gesso;
      ctx.fillText(bt.label, 0, 0);
      ctx.restore();
      /* IL RIQUADRO DELLE LETTERE, DICHIARATO QUI perche' qui — e solo
         qui — si conoscono corpo, stringimento e larghezza vera. Alto
         quanto il maiuscolo del corpo scelto (0,80 em) e largo quanto la
         parola stretta, piu' i tre pixel dello zoccolo scuro che la
         stacca dal prato. */
      { const lw=ctx.measureText(bt.label).width*kx+3, lh=fs*0.80+3;
        zona.lab={x0:+(bt.x-lw/2).toFixed(1), y0:+(bt.y+1-lh/2).toFixed(1),
                  x1:+(bt.x+lw/2).toFixed(1), y1:+(bt.y+1+lh/2).toFixed(1)}; }
      ctx.restore();          // chiude lo scarto col pallone`,
},

/* 7 — il nome del verbo */
{
  nome: '7/22 il disco della filtrante si chiama FILTRANTE',
  cerca:
`    passa ? { act:'through', label:'PASSAGGIO', x:bx+s*158, y:VH-72,  r:30 }
          : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72,  r:30 },`,
  metti:
`    /* PASSA E PASSAGGIO NON POSSONO STARE NELLA STESSA SCHERMATA, e per
       due ragioni indipendenti. La prima e' che il primo nome e' il
       PREFISSO del secondo: a otto centimetri di distanza, su un
       telefono in mano, sono la stessa parola. La seconda e' che
       'through' NON e' il passaggio generico — e' la filtrante, la palla
       tesa e rasoterra sulla corsa dello smarcato (doFiltrante) — quindi
       il nome generico stava sul gesto speciale e viceversa.
       FILTRANTE e' il nome che quel verbo ha in italiano, ed e' quello
       che il codice usa gia' da se': doFiltrante, eseguiFiltrante,
       chargeClip 'filtrante', G.stats.filtranti.
       CI STA? Misurato il 28 agosto col carattere VERO (Barlow
       Condensed, incorporato quel giorno): 42,3 px sui 46 disponibili
       del disco da 30 di raggio, al gradino 11 e senza stringere di un
       centesimo. Col ripiego di sistema la stessa parola ne misura 68,5
       e ci starebbe solo stretta a 0,672, deformata di un terzo — che
       e' la ragione per cui la parola giusta era stata sostituita da
       quella generica. Adesso il carattere c'e' e la parola ci sta. */
    passa ? { act:'through', label:'FILTRANTE', x:bx+s*158, y:VH-72,  r:30 }
          : { act:'swap',    label:'CAMBIO',    x:bx+s*158, y:VH-72,  r:30 },`,
},

/* 8 — le due righe di prosa che elencano i dischi dicono la verita' */
{
  nome: '8/22 le istruzioni chiamano il disco col suo nome',
  cerca: `TIRA/CONTRASTA, PASSAGGIO/CAMBIO, PASSA/PRESSA e CROSS/SCIVOLATA`,
  metti: `TIRA/CONTRASTA, FILTRANTE/CAMBIO, PASSA/PRESSA e CROSS/SCIVOLATA`,
},
{
  nome: '9/22 la riga-manifesto della pausa, idem',
  cerca: `'Stick a sinistra · quattro dischi che cambiano col possesso: TIRA, PASSAGGIO, PASSA e CROSS'`,
  metti: `'Stick a sinistra · quattro dischi che cambiano col possesso: TIRA, FILTRANTE, PASSA e CROSS'`,
},

/* 10 — la riga dell'inferiorita' dice una cosa sola */
{
  nome: '10/22 l\'avviso dell\'inferiorita\' smette di stampare un 2 finto',
  cerca:
`    for(let t=0;t<2;t++){
      let fuori=0, resta=0;
      for(const p of G.players){ if(p.team===t && p.out>0){ fuori++; resta=Math.max(resta,p.out); } }
      if(!fuori) continue;
      const bw=126, bh=22, bx=12, by=fondo-bh-dy; dy+=bh+5;
      /* stesso materiale di tutto il resto: ardesia con la sua materia e
         il filo di legno. Il rosso resta solo sul TESTO — e' l'allarme,
         non il pannello */
      ardesiaFill(bx,by,bw,bh);
      cornice(bx,by,bw,bh,1.6);
      ctx.font='700 11px '+FONT_C; ctx.textAlign='center'; ctx.fillStyle=COL.rosso;
      ctx.fillText((t===0?'IN INFERIORITÀ':'AVVERSARIO IN 2')+'  '+Math.ceil(resta)+'"', bx+bw/2, by+bh/2+1);
    }`,
  metti:
`    /* =================================================================
       LA RIGA DICE UNA COSA SOLA (28 agosto 2026).

       Diceva «AVVERSARIO IN 2  9"», e sul telefono si legge come due
       numeri appiccicati di cui non si capisce quale sia quale. Il 2
       non veniva da nessun conto: era scritto a mano dentro la stringa
       dal primo commit del gioco. Intanto il conto vero — quanti uomini
       sono fuori — esisteva (fuori) e non era mai stato stampato: con
       due espulsi la riga diceva «IN 2» come con uno.

       Adesso il numero degli uomini lo scrive il conto, e il numero dei
       secondi porta la sua unita' attaccata: restano due numeri perche'
       le cose da dire sono due, ma ognuno ha il suo nome davanti.

       I SECONDI SONO QUELLI DEL PRIMO RIENTRO, non dell'ultimo. Era il
       massimo: con due espulsi a 12 e a 3 secondi la riga prometteva
       «due uomini in meno per 12"» mentre nove di quei dodici secondi
       si giocano contro uno solo. Il minimo e' il tempo per cui
       l'inferiorita' vale davvero com'e' scritta, e quando l'uomo e'
       uno solo — il caso normale, perche' ci vogliono due gialli — i
       due numeri coincidono.

       IL RIQUADRO SI MISURA SUL TESTO. Era largo 126 per sempre, e 126
       e' un numero che invecchia: il 28 agosto il carattere del gioco e'
       cambiato davvero (Barlow Condensed al posto di un ripiego di
       sistema) e tutte le larghezze si sono spostate. Qui si misura la
       riga e si tiene il piu' largo fra 126 e la riga piu' otto pixel
       per lato: il giorno del prossimo carattere questa riga non si
       taglia da sola.
       ================================================================= */
    for(let t=0;t<2;t++){
      let fuori=0, resta=0;
      for(const p of G.players){ if(p.team===t && p.out>0){ fuori++;
        resta = resta ? Math.min(resta,p.out) : p.out; } }
      if(!fuori) continue;
      const testo = (fuori===1 ? 'UN UOMO' : fuori+' UOMINI')
                  + (t===0 ? ' IN MENO' : ' IN PIÙ')
                  + ' PER ' + Math.ceil(resta) + '"';
      ctx.font='700 11px '+FONT_C;
      const largo=ctx.measureText(testo).width;
      const bw=Math.max(126, Math.ceil(largo)+16), bh=22, bx=12, by=fondo-bh-dy; dy+=bh+5;
      /* stesso materiale di tutto il resto: ardesia con la sua materia e
         il filo di legno. Il rosso resta solo sul TESTO — e' l'allarme,
         non il pannello */
      ardesiaFill(bx,by,bw,bh);
      cornice(bx,by,bw,bh,1.6);
      ctx.textAlign='center'; ctx.fillStyle=COL.rosso;
      ctx.fillText(testo, bx+bw/2, by+bh/2+1);
      /* dichiarata perche' sia misurabile: e' testo di CANVAS, e
         strumenti/testo-fuori.js legge soltanto il DOM. Senza questa
         riga «AVVERSARIO IN 2  9"» poteva restare un altro anno. */
      INFER_RIGHE.push({testo, x0:bx, y0:by, x1:bx+bw, y1:by+bh,
                        largo:+largo.toFixed(1)});
    }`,
},

];

/* le tre righe che completano l'ancoraggio 10: l'array dichiarato, il
   suo azzeramento e l'esportazione. Stanno qui sotto perche' sono tre
   posti diversi del file. */
ANCORE.push(
{
  nome: '11/22 l\'elenco delle righe di inferiorita\' esiste',
  cerca:
`function scartoHUDRett(x0,y0,x1,y1){`,
  metti:
`/* le righe dell'avviso di inferiorita' dell'ultimo fotogramma, col loro
   riquadro e la larghezza vera del testo: le legge __test.avvisi. */
const INFER_RIGHE=[];
function scartoHUDRett(x0,y0,x1,y1){`,
},
{
  nome: '12/22 e si azzera all\'inizio del blocco che lo riempie',
  cerca:
`  {
    let dy=0;
    /* REGOLA DI SCARTO con la bussola centrata: su un viewport stretto il`,
  metti:
`  {
    let dy=0;
    INFER_RIGHE.length=0;
    /* REGOLA DI SCARTO con la bussola centrata: su un viewport stretto il`,
},
{
  nome: '13/22 __test le espone, e copertura() impara a vedere gli uomini',
  cerca:
`  pulsanti(t){ return touchBtnLayout((t|0)===1?1:0).map(b=>Object.assign({},b)); },
  copertura(){
    const fuori=[];
    const zz=this.zoneInterfaccia();
    const sog=[];`,
  metti:
`  pulsanti(t){ return touchBtnLayout((t|0)===1?1:0).map(b=>Object.assign({},b)); },
  /* gli avvisi di inferiorita' dell'ultimo fotogramma: testo, riquadro e
     larghezza misurata. Sono testo di canvas, che nessun cancello del
     DOM puo' vedere. */
  get avvisi(){ return INFER_RIGHE.map(r=>Object.assign({},r)); },
  /* =====================================================================
     GLI ALTRI VENTUNO UOMINI, A RICHIESTA (28 agosto 2026).

     copertura() nasce su un criterio di quattro soggetti — palla,
     comandato, porta attaccata, portiere — e quel criterio resta: la
     chiamata senza argomenti risponde esattamente come prima, stessi
     soggetti e stesso ordine, perche' chi la legge oggi non deve
     cambiare risposta per una funzione nuova.
     Ma il difetto fotografato sul telefono il 28 agosto erano CINQUE
     COMPAGNI sotto due dischi, e nessuno dei cinque era uno dei quattro.
     Con {uomini:true} entrano tutti gli uomini in campo, soggetto
     'uomo', con la squadra accanto: la sagoma disegnata (semilarghezza
     16 unita', dalla testa ai piedi), non l'anello del comandato.
     ===================================================================== */
  copertura(opz){
    const fuori=[];
    const zz=this.zoneInterfaccia();
    const sog=[];
    if(opz && opz.uomini){
      const v=G.view, S2=v&&v.S2;
      if(S2 && G.players){
        const H=RIG_H*P_DIS*S2, w=16*S2;
        for(const p of G.players){
          if(p.out>0) continue;
          const cx=p.x*S2+v.Ax, py=(p.y+RIG_PIEDI)*S2+v.Ay;
          sog.push({tipo:'uomo', team:p.team, x0:cx-w, y0:py-H, x1:cx+w, y1:py});
        }
      }
    }`,
},
{
  nome: '14/22 zoneInterfaccia dichiara il buco della pastiglia',
  cerca:
`      const q={tipo:t.tipo, x0:t.x0, y0:t.y0, x1:t.x1, y1:t.y1,
               alfa:t.alpha===undefined?1:t.alpha};
      if(t.r>0){ q.x=t.x; q.y=t.y; q.r=t.r+4; }
      z.push(q);`,
  metti:
`      const q={tipo:t.tipo, x0:t.x0, y0:t.y0, x1:t.x1, y1:t.y1,
               alfa:t.alpha===undefined?1:t.alpha};
      if(t.r>0){ q.x=t.x; q.y=t.y; q.r=t.r+4; }
      /* IL BUCO, DICHIARATO. Quando la pastiglia di un comando si svuota
         (vedi velaPastiglia) i pixel dentro la ghiera sono tornati prato:
         restano dipinte la corona fra rVuoto e r e le lettere di lab.
         Chi misura senza saperlo conta cinquemila pixel d'ardesia che
         non ci sono — e sbaglia nella direzione comoda. */
      if(t.dentro!==undefined && t.dentro<0.15 && t.rInt>0){
        q.rVuoto=t.rInt;
        if(t.lab) q.lab=t.lab;
      }
      z.push(q);`,
},
{
  nome: '15/22 copertura() non conta come coperto cio\' che sta nel buco',
  cerca:
`        if(b.r>0){                       // pannello tondo: la forma vera
          const dx=Math.max(b.x-ax1,0,ax0-b.x), dy=Math.max(b.y-ay1,0,ay0-b.y);
          if(Math.hypot(dx,dy)>=b.r) continue;
        }
        fuori.push({soggetto:a.tipo, pannello:b.tipo, alfa:+al.toFixed(3),
                    px:Math.round(ix*iy), quota:+(ix*iy/area).toFixed(3)});`,
  metti:
`        if(b.r>0){                       // pannello tondo: la forma vera
          const dx=Math.max(b.x-ax1,0,ax0-b.x), dy=Math.max(b.y-ay1,0,ay0-b.y);
          if(Math.hypot(dx,dy)>=b.r) continue;
          /* IL DISCO SVUOTATO E' UNA CORONA. Se il soggetto sta TUTTO
             dentro il buco e non tocca le lettere, sopra di lui non c'e'
             un pixel dipinto: dire «coperto» sarebbe una bugia, e
             stavolta nella direzione scomoda — un allarme che suona
             quando non c'e' niente e' un allarme che si impara a
             ignorare. */
          if(b.rVuoto>0){
            const ex=Math.max(Math.abs(ax0-b.x), Math.abs(ax1-b.x));
            const ey=Math.max(Math.abs(ay0-b.y), Math.abs(ay1-b.y));
            const suLettere = b.lab && ax0<b.lab.x1 && ax1>b.lab.x0
                                    && ay0<b.lab.y1 && ay1>b.lab.y0;
            if(Math.hypot(ex,ey)<=b.rVuoto && !suLettere) continue;
          }
        }
        fuori.push({soggetto:a.tipo, squadra:a.team===undefined?null:a.team,
                    pannello:b.tipo, alfa:+al.toFixed(3),
                    px:Math.round(ix*iy), quota:+(ix*iy/area).toFixed(3)});`,
},
);

/* =====================================================================
   E ADESSO I COMMENTI, che in questa casa sono codice: sei frasi
   dicevano «il disco dice PASSAGGIO» e da oggi direbbero il falso. Un
   commento smentito dalla riga accanto e' un difetto quanto una riga
   sbagliata, e in due giorni e' gia' successo tre volte.
   ===================================================================== */
ANCORE.push(
{
  nome: '16/22 l\'indice 1 e\' il disco FILTRANTE/CAMBIO',
  cerca: `         1 e' il piccolo (PASSAGGIO/CAMBIO), e touchBtnLayout li mette`,
  metti: `         1 e' il piccolo (FILTRANTE/CAMBIO), e touchBtnLayout li mette`,
},
{
  nome: '17/22 la posa al rilascio e\' del disco FILTRANTE',
  cerca: `           il disco PASSAGGIO ('through') apre una POSA alla pressione e`,
  metti: `           il disco FILTRANTE ('through') apre una POSA alla pressione e`,
},
{
  nome: '18/22 il ramo del rilascio parla del disco che dice FILTRANTE',
  cerca: `         IL DISCO PICCOLO QUANDO DICE PASSAGGIO HA UN RAMO QUI, DAL 26`,
  metti: `         IL DISCO PICCOLO QUANDO DICE FILTRANTE HA UN RAMO QUI, DAL 26`,
},
{
  nome: '19/22 i quattro verbi stanno dove stanno davvero',
  cerca:
`     I quattro verbi non sono spariti: TIRA e CONTRASTA stanno sul
     pulsante grande, PASSAGGIO (e la filtrante, che e' la sua forma
     mirata) sul piccolo, il cross e' il piccolo con lo scatto tenuto
     dalla meta' campo offensiva.`,
  metti:
`     I quattro verbi non sono spariti: TIRA e CONTRASTA stanno sul
     pulsante grande, la FILTRANTE (che e' la forma mirata del passaggio)
     sul medio, l'appoggio ha il disco PASSA da L1.6 in poi, e il cross
     e' il suo disco — oppure il medio con lo scatto tenuto dalla meta'
     campo offensiva.`,
},
{
  nome: '20/22 la linea di mira si vede tenendo FILTRANTE',
  cerca: `         segniGuida tornerebbe vuota e tenendo PASSAGGIO non si vedrebbe`,
  metti: `         segniGuida tornerebbe vuota e tenendo FILTRANTE non si vedrebbe`,
},
{
  nome: '21/22 la guardia di doFiltrante cita l\'etichetta vera',
  cerca:
`     puoPassare porta dentro tutte e due le guardie, cosi' «il disco dice
     PASSAGGIO» significa davvero «da qui nasce un passaggio». */`,
  metti:
`     puoPassare porta dentro tutte e due le guardie, cosi' «il disco dice
     FILTRANTE» significa davvero «da qui nasce un passaggio». */`,
},
{
  nome: '22/22 il cappello di drawTouchButtons conta i dischi che ci sono',
  cerca:
`/* i DUE pulsanti contestuali dello schema unico: TIRA/CONTRASTA grande,
   PASSAGGIO/CAMBIO piccolo (la FILTRANTE non e' un'etichetta: e' la
   forma mirata del passaggio, e la sceglie il cono, non il dito).
   L'etichetta cambia col possesso, la posizione MAI; transizione
   dell'etichetta senza animazioni (densita'). */`,
  metti:
`/* i QUATTRO dischi contestuali dello schema unico (L1.6): TIRA/CONTRASTA
   grande, FILTRANTE/CAMBIO medio, PASSA/PRESSA e CROSS/SCIVOLATA sopra.
   Qui c'era scritto «i DUE pulsanti» e «PASSAGGIO/CAMBIO piccolo (la
   FILTRANTE non e' un'etichetta)»: due cose che il codice accanto aveva
   gia' smentito. I dischi sono quattro dal 26 agosto; e dal 28 la
   filtrante un'etichetta ce l'ha, ed e' il suo nome — perche' PASSA e
   PASSAGGIO nella stessa schermata sono la stessa parola.
   L'etichetta cambia col possesso, la posizione MAI; transizione
   dell'etichetta senza animazioni (densita'). */`,
},
);

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-comandi.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.comandi.html';
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

/* --- i controlli DOPO la sostituzione: che ci sia quello che deve
       esserci, e che non sia rimasto niente di quello che se ne andava --- */
const attesi = [
  ['function corpiHUD(){', 1],
  ['function velaPastiglia(cx,cy,rr){', 1],
  ['  corpiHUD();', 1],
  ['  CORPI_HUD_N=0;\n  PROTA_N=0;', 1],
  ['const aPas=pressed?1:velaPastiglia(bx0,by0,bt.r);', 1],
  ['ctx.globalAlpha=aBt*aPas;', 1],
  ['dentro:+(aBt*aPas).toFixed(3), rInt:Math.max(0,bt.r-4)', 1],
  ['zona.lab={x0:', 1],
  ["label:'FILTRANTE'", 1],
  ["label:'PASSAGGIO'", 0],
  ['TIRA/CONTRASTA, PASSAGGIO/CAMBIO', 0],
  ["1 e' il piccolo (PASSAGGIO/CAMBIO)", 0],
  ["il disco PASSAGGIO ('through')", 0],
  ['QUANDO DICE PASSAGGIO', 0],
  ['tenendo PASSAGGIO', 0],
  ['«il disco dice\n     PASSAGGIO»', 0],
  ['i DUE pulsanti contestuali', 0],
  ['TIRA, PASSAGGIO, PASSA e CROSS', 0],
  ["'AVVERSARIO IN 2'", 0],
  ['const INFER_RIGHE=[];', 1],
  ['INFER_RIGHE.length=0;', 1],
  ['INFER_RIGHE.push({testo', 1],
  ['get avvisi(){', 1],
  ['copertura(opz){', 1],
  ['q.rVuoto=t.rInt;', 1],
  ['if(b.rVuoto>0){', 1],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => JSON.stringify(s) + ' atteso ' + n + ', trovato ' + (out.split(s).length - 1));

/* LA LEGGE SUI SORTEGGI: nel gioco Math.random non esiste fuori dai
   commenti e dal corpo di dado(). Questa toppa non ne aggiunge, e il
   conto delle chiamate a dado() deve restare identico: qui si controlla
   che nessuna delle due cose sia cambiata rispetto al file di partenza. */
const contaFuoriDado = (testo) => {
  const senzaCommenti = testo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  return (senzaCommenti.match(/Math\.random/g) || []).length;
};
const dadiPrima = (src.match(/\bdado\s*\(/g) || []).length;
const dadiDopo = (out.match(/\bdado\s*\(/g) || []).length;
if (dadiPrima !== dadiDopo) rotti.push('chiamate a dado(): ' + dadiPrima + ' -> ' + dadiDopo);
const rndPrima = contaFuoriDado(src), rndDopo = contaFuoriDado(out);
if (rndPrima !== rndDopo) rotti.push('Math.random fuori dai commenti: ' + rndPrima + ' -> ' + rndDopo);

if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    dado(): ' + dadiDopo + ' chiamate nel testo, invariate rispetto al file di partenza');
console.log('    Math.random fuori dai commenti: ' + rndDopo + ', invariati (uno e\' il ripiego dentro');
console.log('    dado(), tre sono il generatore a seme fisso che paintField si mette e si toglie)');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
