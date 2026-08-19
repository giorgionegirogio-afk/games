/* =====================================================================
   _toppa-luce.js — LA TOPPA "UNA SOLA ORA, ANCHE NELLA SCENA MADRE".

   Non tocca il repo. Legge un file di gioco, applica le sostituzioni qui
   sotto e scrive un file nuovo. Se una sola sostituzione non trova il suo
   testo ESATTAMENTE UNA VOLTA, si ferma e non scrive niente: una toppa
   applicata a meta' e' peggio di una toppa non applicata.

   uso: node strumenti/_toppa-luce.js ingresso.html uscita.html
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------ 1
   L'ARITMETICA DELL'OMBRA IN CAMERA BASSA, dichiarata una volta sola e
   accanto al fondale che la usa. */
cambio('1. ombraBassa — la stessa ombra, vista da terra',
`function duelFondo(g){
  buildCrowdAtlas();`,
`/* =====================================================================
   L'OMBRA PORTATA IN CAMERA BASSA — la stessa ombra dell'azione, vista
   da terra invece che dall'alto.

   IL DIFETTO CHE CHIUDE, e la giuria l'ha detto meglio di chiunque:
   «nel ritaglio di calcetto-gol.png GLI ESULTANTI NON HANNO OMBRA: un
   pallino di contatto sotto i piedi e basta, mentre in azione le ombre
   sono 2,1-2,4 volte la figura a 22-24 gradi. L'UNICA SCENA DOVE LE
   FIGURE SONO GRANDI ABBASTANZA DA LEGGERSI E' L'UNICA SCENA SENZA
   LEGGE DELLA LUCE.» Era vero alla lettera: drawRipresaGol non chiamava
   nessuna ombra, e i due attori del dischetto avevano solo la pozza
   molle di ombraMorbida. Il sole delle sette illuminava il fondale e
   dimenticava gli unici corpi del gioco che si leggono davvero.

   PERCHE' NON BASTAVA COPIARE drawOmbreGiocatori, ED E' IL CUORE DELLA
   FACCENDA. Nella vista dall'alto il piano del terreno E' il piano dello
   schermo: un'ombra lunga L lungo SOLE.dir si disegna lunga L, e la si
   vede tutta. In camera bassa il terreno e' visto quasi di taglio —
   CAMERE.bassa e' un'elevazione di 16 gradi — e le distanze che vanno
   VERSO IL FONDO si schiacciano di sin(16 gradi) = 0,276, mentre quelle
   di traverso restano intere. La stessa ombra, la stessa ora, due
   figure diverse sullo schermo. Chi ricopiasse qui il vettore della
   pianta disegnerebbe un'ombra lunga due volte la figura buttata di
   traverso: bella, e falsa, perche' racconterebbe un sole a mezz'aria
   sopra la linea laterale invece del sole di ponente.

   IL CONTO, e sono quattro righe. La camera guarda lungo l'asse (ax,ay)
   della ripresa — la direzione del tiro, la stessa che ripMappa usa per
   la profondita'. Nella sua base ortonormale il versore del sole si
   scompone in
     lat = -ux*ay + uy*ax    quanto se ne va di traverso alla porta
     via =  ux*ax + uy*ay    quanto se ne va VERSO la porta, cioe'
                             lontano dall'obiettivo
   e siccome (ax,ay) e (-ay,ax) sono ortonormali, lat^2 + via^2 = 1: non
   si perde ne' si guadagna un centimetro di ombra, la si guarda da un
   altro posto. Sullo schermo, per ogni unita' di altezza della figura:
     ex =  lat * rap / ce            di traverso, a scala piena
     ey = -via * rap * se / ce       in profondita', schiacciato da se
   dove rap e' quante volte la figura e' lunga l'ombra e ce/se sono il
   coseno e il seno dell'elevazione della camera — gli STESSI due numeri
   con cui Rig3D proietta i giunti del corpo, quindi corpo e ombra non
   possono raccontare due geometrie diverse.

   COSA SI VEDE, ed e' il motivo per cui va guardato e non solo
   misurato. Con l'asse a levante (chi segna attacca la porta est, il
   caso della fotografia di riferimento) il sole sta DIETRO l'obiettivo:
   lat = +0,34, via = +0,94, l'ombra scappa in su e a destra, lunga
   sullo schermo circa una volta la figura invece di 2,2. Non e'
   un'ombra accorciata: e' un'ombra di 2,2 vista in scorcio, ed e'
   esattamente quello che fa una fotografia da terra col sole alle
   spalle. Quando a segnare e' l'altra squadra l'asse si rovescia, il
   sole viene incontro all'obiettivo e la stessa ombra cade verso lo
   spettatore, lunga e larga in primo piano. La scena dice da che parte
   si sta guardando, che e' quello che deve fare una regia.
   CHI TORNASSE QUI PER "ALLUNGARE L'OMBRA A 2,2 SULLO SCHERMO" rimetta
   prima in discussione lo scorcio: la lunghezza e' gia' 2,2 nel mondo,
   ed e' il mondo che la regola dichiara.

   L'ORA E' LA STESSA, E ARRIVA GRATIS: rap si ricava da ombraGeometria(),
   quindi il sole che cala per mezzo secondo sul gol (solePiuBasso) e il
   tramonto della partita (oraPartita) allungano e girano queste ombre
   con lo stesso identico conto con cui muovono quelle della pianta.
   Nessuna seconda copia della direzione del sole: e' la ferita che
   questo file si e' gia' aperto due volte.

   COSTO: una moltiplicazione di matrice e una drawImage per figura, cioe'
   quanto costa un'ombra in pianta. Al massimo quattro figure nel gol e
   due al dischetto.
   ===================================================================== */
function ombraBassa(ax, ay){
  const G0=ombraGeometria();
  const n=Math.hypot(ax,ay)||1, AX=ax/n, AY=ay/n;
  const lat=-G0.ux*AY + G0.uy*AX;
  const via= G0.ux*AX + G0.uy*AY;
  const cam=Rig3D.CAMERE.bassa;
  /* rap = quante volte la figura. lungRiposo e' tarata sull'altezza
     apparente della pianta (RIG_H x P_DIS), quindi il rapporto e' puro e
     si puo' rimoltiplicare per l'altezza che la figura ha QUI. */
  const rap=G0.lungRiposo/(RIG_H*P_DIS);
  const sr =G0.semiCorto /(RIG_H*P_DIS);      // la mezza larghezza, idem
  const K=1/cam.ce, S=cam.se/cam.ce;
  return {
    /* la punta dell'ombra, per unita' di altezza della figura */
    ex: lat*rap*K,  ey: -via*rap*S,
    /* la mezza larghezza: la perpendicolare (-via, lat) nel piano del
       terreno, proiettata con la stessa camera */
    px: -via*sr*K,  py: -lat*sr*S,
  };
}
/* Posa la capsula lunga di drawOmbreGiocatori sotto una figura in camera
   bassa. La tessitura e' la STESSA (ombraLungaTex: testa tonda al 32 su
   256, punta al 252), e la stessa e' la mappatura — solo che invece di
   ruotare il riferimento si posa direttamente la coppia di vettori che
   ombraBassa ha gia' calcolato. Un transform e una drawImage. */
function ombraFiguraBassa(x, y, hb, O, alfa){
  if(!(hb>0) || !(alfa>0.01)) return;
  if(!ombraLungaTex) buildOmbraLungaTex();
  ctx.save();
  ctx.globalAlpha=alfa;
  ctx.transform(O.ex*hb, O.ey*hb, O.px*hb, O.py*hb, x, y);
  ctx.drawImage(ombraLungaTex, -0.1455, -1, 1.164, 2);
  ctx.restore();
}
/* =====================================================================
   IL PRATO DEL FONDALE SI RICAVA DAL MANTO, NON DA TRE ESADECIMALI.

   Qui sotto c'erano tre tinte scritte a mano. Erano una TERZA ORA: il
   manto della partita poteva cambiare pigmento — ed e' cambiato, sei
   volte — senza che questa riga se ne accorgesse. La prova d'accusa e'
   scritta in duelFondo: mettendo il pigmento del manto a rosso puro, i
   pixel del prato di calcetto-gol restavano identici al byte.

   Adesso la tinta arriva da TH.g1, cioe' dal pigmento vero del campo su
   cui si sta giocando, e le tre fermate del gradiente sono tre
   ESPOSIZIONI di quello stesso pigmento. Due invarianti, e sono quelle
   che rendono la cosa sicura:
     · la TINTA non si muove di un grado. Moltiplicare i tre canali per
       lo stesso k non tocca ne' H ne' S (sono rapporti), e la seconda
       passata — che tira ogni canale verso il massimo — conserva i
       rapporti (ch-min)/(max-min), quindi conserva H. Il fondale eredita
       la tinta del manto per costruzione, non per coincidenza.
     · il VALORE resta dov'era. k vale 0,50 / 0,632 / 0,80 del pigmento,
       che sono esattamente le tre luminanze delle tinte scritte a mano
       che sostituisce, e croma 0,83 di quella del manto, che e' la croma
       che il fondale ha oggi. L'esposizione della scena non si muove:
       si muove solo cio' che la faceva mentire.
   Sull'oratorio (#1c6a20 = 28.106.32, tinta 123,1 gradi) le tre fermate
   passano da 129,1 / 128,8 / 128,1 gradi a 121,9 / 122,9 / 123,5, cioe'
   dalla tinta di nessuno alla tinta del manto.
   Sui fondi che non sono erba (cemento, asfalto, parquet, sabbia) il
   conto e' lo stesso e la conseguenza e' giusta: dal dischetto si vede
   la superficie su cui si sta giocando, non un prato di riserva.
   ===================================================================== */
function fondaleTinta(hex, k, croma){
  const m=/^#?([0-9a-f]{6})$/i.exec(String(hex||''));
  const v=m?parseInt(m[1],16):0x1c6a20;
  const r=((v>>16)&255)*k, g2=((v>>8)&255)*k, b=(v&255)*k;
  const mx=Math.max(r,g2,b);
  const t=x=>Math.round(Math.max(0,Math.min(255, mx-(mx-x)*croma)));
  return 'rgb('+t(r)+','+t(g2)+','+t(b)+')';
}
function duelFondo(g, ax, ay){
  buildCrowdAtlas();`);

/* ------------------------------------------------------------------ 2
   La chiave della cache: il campo e il verso della camera ne fanno parte,
   se no il fondale resta quello del campo di prima. */
cambio('2a. due fondali in cache, uno per verso dell\'obiettivo',
`let duelBgTex=null, duelBgKey='';`,
`/* DUE FONDALI IN CACHE, UNO PER VERSO DELL'OBIETTIVO, E IL PERCHE' E' UN
   NUMERO MISURATO. Da oggi il fondale dipende dal campo (il prato si
   ricava dal pigmento vero) e dal verso in cui la camera guarda (il
   gradiente termico segue il sole, che rispetto all'obiettivo sta
   davanti o dietro a seconda di quale porta si sta inquadrando). Il
   campo, durante una partita, non cambia mai; IL VERSO SI', perche' le
   due squadre attaccano due porte opposte.
   Con una casella sola la seconda rete della partita — quella
   dell'altra squadra — avrebbe trovato la chiave sbagliata e ricotto il
   fondale da capo: cielo, prato, tosatura, CINQUECENTOSETTANTA figurine
   di tribuna, grana, righe e luci. Misurato su questo banco: 192 ms. Un
   fermo di due decimi proprio nell'istante in cui il gioco deve essere
   piu' fluido, e ripetuto a ogni alternanza di marcatore.
   Con due caselle ogni verso si cuoce UNA volta per partita e da li' in
   poi e' una drawImage: il costo aggiunto e' una cottura sola, quella
   della prima rete della seconda squadra, e cade sotto il decimo di nero
   dello stacco di montaggio e il fermo d'impatto che ci sono gia'.
   Costa una tela in piu' in memoria (una schermata), che e' esattamente
   quello che gia' costano fieldTex e ombraLungaTex. */
const duelBg=[{tex:null,key:''},{tex:null,key:''}];`);

cambio('2b. la chiave conosce il campo, e la casella conosce il verso',
`  const key=[VW,VH,DPR,g.hz|0,g.GLY|0,g.GW|0,g.GH|0,crowdAtlasKey].join('_');
  if(duelBgTex && duelBgKey===key) return duelBgTex;
  duelBgKey=key;
  const d=Math.min(2,DPR||1);
  if(!duelBgTex) duelBgTex=document.createElement('canvas');
  duelBgTex.width=Math.max(1,Math.round(VW*d));
  duelBgTex.height=Math.max(1,Math.round(VH*d));
  const c=duelBgTex.getContext('2d');`,
`  /* IL CAMPO ENTRA NELLA CHIAVE e il VERSO sceglie la casella: senza il
     primo il prato resterebbe quello del campo di prima (adesso si ricava
     dal pigmento vero), senza il secondo il gradiente termico punterebbe
     dalla parte sbagliata. Il verso si tiene al SEGNO e non all'angolo
     esatto del tiro: al fondale serve sapere da che parte gli arriva il
     sole, non di quanto era angolata la conclusione. */
  const S=duelBg[(ax===undefined||ax>=0)?0:1];
  const key=[VW,VH,DPR,g.hz|0,g.GLY|0,g.GW|0,g.GH|0,crowdAtlasKey,G.fieldIdx|0].join('_');
  if(S.tex && S.key===key) return S.tex;
  S.key=key;
  const d=Math.min(2,DPR||1);
  if(!S.tex) S.tex=document.createElement('canvas');
  S.tex.width=Math.max(1,Math.round(VW*d));
  S.tex.height=Math.max(1,Math.round(VH*d));
  const c=S.tex.getContext('2d');`);

cambio('2c. si restituisce la casella, non la vecchia tela unica',
`    c.restore();
  }
  return duelBgTex;
}`,
`    c.restore();
  }
  return S.tex;
}`);

/* ------------------------------------------------------------------ 3
   Le tre tinte del prato, ricavate dal manto. */
cambio('3. il prato del fondale arriva dal manto',
`    const pr=c.createLinearGradient(0,g.hz,0,VH);
    /* IL FONDALE AVEVA UN'ORA TUTTA SUA, ED E' STATA UNA SORPRESA. La
       scena del gol e quella dei rigori NON passano da paintField:
       drawRipresaGol e il duello disegnano duelFondo, che ha un prato
       suo, dipinto qui. Prova d'accusa: cambiando il pigmento del manto
       in ROSSO PURO, i pixel del prato di calcetto-gol restavano
       identici al byte. Tre prati, tre ore: il manto, il fondale, e il
       menu che li guardava dall'alto.
       Stesse tre tinte, stessa regola della sesta taratura del manto —
       croma giu', luminanza ferma entro il 2%:
         #063613 (6·54·19)  -> #143519 (20·53·25)  Y 0,02666 -> 0,02708
         #084516 (8·69·22)  -> #1a4320 (26·67·32)  Y 0,04362 -> 0,04352
         #0a5716 (10·87·22) -> #215528 (33·85·40)  Y 0,06733 -> 0,06801
       croma 0,89 -> 0,61 su tutt'e tre, tinta ferma a 128-129 gradi.
       Sullo scatto del gol la croma del manto scende da 0,625 a 0,463. */
    pr.addColorStop(0,'#143519'); pr.addColorStop(0.45,'#1a4320'); pr.addColorStop(1,'#215528');
    c.fillStyle=pr; c.fillRect(0,g.hz,VW,VH-g.hz);`,
`    const pr=c.createLinearGradient(0,g.hz,0,VH);
    /* IL FONDALE AVEVA UN'ORA TUTTA SUA, ED E' STATA UNA SORPRESA. La
       scena del gol e quella dei rigori NON passano da paintField:
       drawRipresaGol e il duello disegnano duelFondo, che ha un prato
       suo, dipinto qui. Prova d'accusa: cambiando il pigmento del manto
       in ROSSO PURO, i pixel del prato di calcetto-gol restavano
       identici al byte. Tre prati, tre ore: il manto, il fondale, e il
       menu che li guardava dall'alto.
       LA PRIMA RIPARAZIONE FU DI TINTA E NON DI CAUSA, e vale la pena
       scriverlo perche' e' il motivo per cui il difetto e' tornato in
       giuria: le tre tinte furono ricalcolate a mano a croma piu' bassa
       (#063613/#084516/#0a5716 -> #143519/#1a4320/#215528, tinta ferma a
       128-129 gradi) e i tre prati si avvicinarono. Ma restavano TRE
       PRATI: tre esadecimali scritti qui, che il manto poteva
       abbandonare da un giorno all'altro senza che nessuno se ne
       accorgesse — cioe' un accordo per coincidenza, che il primo
       ritocco al pigmento avrebbe riaperto.
       Adesso le tre fermate sono TRE ESPOSIZIONI DEL PIGMENTO VERO del
       campo (vedi fondaleTinta poco sopra): stesse luminanze di prima
       — 0,50 / 0,632 / 0,80 del manto, cioe' gli stessi valori 53/67/85
       sul canale verde — stessa croma di prima (0,83 di quella del
       manto), e la tinta ereditata invece che indovinata. Sull'oratorio
       le tre fermate scendono da 129,1/128,8/128,1 gradi a
       121,9/122,9/123,5, che e' la tinta del manto. Da qui in poi il
       giorno in cui il manto cambia pigmento, questo prato lo segue. */
    {
      const THf=FIELDS[clamp(G.fieldIdx|0,0,FIELDS.length-1)].th;
      pr.addColorStop(0,    fondaleTinta(THf.g1, 0.500, 0.83));
      pr.addColorStop(0.45, fondaleTinta(THf.g1, 0.632, 0.83));
      pr.addColorStop(1,    fondaleTinta(THf.g1, 0.800, 0.83));
    }
    c.fillStyle=pr; c.fillRect(0,g.hz,VW,VH-g.hz);`);

/* ------------------------------------------------------------------ 4
   La tosatura chiede l'ambra a SOLE invece di riscriverla. */
cambio('4. la tosatura chiede l\'ambra a SOLE',
`    c.fillStyle='rgba(255,222,164,.16)'; c.fill();`,
`    /* SOLE.caldo E NON LA STESSA TERNA RICOPIATA A MANO: era 255,222,164,
       cioe' il valore di SOLE.caldo battuto a macchina. Un valore
       ricopiato e' un valore che un giorno diverge, ed e' il difetto che
       tutto questo blocco sta chiudendo. */
    c.fillStyle='rgba('+SOLE.caldo+',.16)'; c.fill();`);

/* ------------------------------------------------------------------ 5
   Il gradiente termico: la legge di paintField, nella prospettiva giusta. */
cambio('5. il gradiente termico e\' quello del manto',
`  /* IL SOLE DELLE SETTE ANCHE QUI: entra da ovest appena sopra
     l'orizzonte, e da est rientra il rimbalzo freddo del cielo. */
  {
    const gw=c.createLinearGradient(0,g.hz,VW*0.62,VH);
    gw.addColorStop(0,'rgba(255,222,164,.16)');
    gw.addColorStop(1,'rgba(255,222,164,0)');
    c.fillStyle=gw; c.fillRect(0,g.hz,VW,VH-g.hz);
    const ge=c.createLinearGradient(VW,g.hz,VW*0.46,VH);
    ge.addColorStop(0,'rgba(24,34,74,.24)');
    ge.addColorStop(1,'rgba(24,34,74,0)');
    c.fillStyle=ge; c.fillRect(0,g.hz,VW,VH-g.hz);
  }`,
`  /* =====================================================================
     IL GRADIENTE TERMICO E' QUELLO DEL MANTO, NON UN SUO SOSIA.

     QUI C'ERANO DUE VELATURE INVENTATE. Una calda da sinistra
     (255,222,164 al 16%, cioe' SOLE.caldo ricopiato a mano) e una fredda
     da destra di un blu — 24,34,74 — che non compare in nessun altro
     punto del gioco: ne' SOLE.cielo, ne' SOLE.freddo, ne' SOLE.tintaOmbra.
     Una QUARTA tinta non dichiarata dentro la TERZA ora non dichiarata.
     E il verso era sbagliato prima ancora delle tinte: caldo a sinistra e
     freddo a destra vuol dire che il sole sta oltre la linea laterale,
     mentre SOLE dice che sta a PONENTE — e in questa inquadratura ponente
     non e' a sinistra dello schermo, e' DIETRO O DAVANTI L'OBIETTIVO, a
     seconda di quale porta si sta guardando.

     ADESSO E' LA LEGGE DI paintField, con la stessa terna di alfe e le
     stesse due tinte di SOLE:
       ambra additiva   SOLE.caldo   0,130 / 0,042 / 0,026  da ovest a est
       cielo additivo   SOLE.cielo   0     / 0,018 / 0,125  idem
     scalate da soleDi(TH) come sul manto. Sono ANTISIMMETRICHE nella
     pendenza e lasciano in mezzo il fondo di luce mista — ambra piu'
     cielo — che e' quel che l'aria fa alle sette; il conto per cui quei
     sei numeri sono quei sei numeri sta scritto per esteso dentro
     paintField e non si ripete qui.

     IL VERSO LO DA' LA CAMERA, ED E' L'UNICA COSA CHE CAMBIA RISPETTO
     ALLA PIANTA. L'asse ovest-est del campo, guardato da terra lungo
     l'asse della ripresa, si proietta sullo schermo esattamente come si
     proietta un'ombra: componente di traverso a scala piena, componente
     in profondita' schiacciata da sin(16 gradi). E' lo stesso vettore che
     ombraBassa calcola per le ombre, quindi il gradiente termico e le
     ombre puntano dove punta il sole, per costruzione e non per
     attenzione. Con l'obiettivo rivolto a levante il caldo sta in basso
     (vicino = ovest = da dove viene la luce) e il freddo in alto verso la
     linea di porta: la profondita' prende temperatura, che e' quello che
     la vista dall'alto non puo' fare e questa si'.

     COSTO: due createLinearGradient e due fillRect dentro una cottura che
     ne fa gia' una ventina. Zero millisecondi a fotogramma. */
  {
    const THf=FIELDS[clamp(G.fieldIdx|0,0,FIELDS.length-1)].th;
    const SOLf=soleDi(THf);
    const O=ombraBassa(ax===undefined?1:ax, ay===undefined?0:ay);
    /* la direzione ovest->est del terreno, proiettata dalla camera: e' il
       vettore dell'ombra, normalizzato */
    const dl=Math.hypot(O.ex,O.ey)||1;
    const nx=O.ex/dl, ny=O.ey/dl, R=VW*0.62, ym=(g.hz+VH)*0.5;
    const x0=VW/2-nx*R, y0=ym-ny*R, x1=VW/2+nx*R, y1=ym+ny*R;
    c.save();
    c.globalCompositeOperation='lighter';
    const gAmbra=c.createLinearGradient(x0,y0,x1,y1);
    gAmbra.addColorStop(0,   'rgba('+SOLE.caldo+','+(0.130*SOLf).toFixed(4)+')');
    gAmbra.addColorStop(0.50,'rgba('+SOLE.caldo+','+(0.042*SOLf).toFixed(4)+')');
    gAmbra.addColorStop(1,   'rgba('+SOLE.caldo+','+(0.026*SOLf).toFixed(4)+')');
    c.fillStyle=gAmbra; c.fillRect(0,g.hz,VW,VH-g.hz);
    const gCielo=c.createLinearGradient(x0,y0,x1,y1);
    gCielo.addColorStop(0,   'rgba('+SOLE.cielo+',0)');
    gCielo.addColorStop(0.50,'rgba('+SOLE.cielo+','+(0.018*SOLf).toFixed(4)+')');
    gCielo.addColorStop(1,   'rgba('+SOLE.cielo+','+(0.125*SOLf).toFixed(4)+')');
    c.fillStyle=gCielo; c.fillRect(0,g.hz,VW,VH-g.hz);
    c.restore();
  }`);

/* ------------------------------------------------------------------ 6
   I due chiamanti dichiarano il verso della camera. */
cambio('6a. il duello dichiara il suo verso',
`  ctx.drawImage(duelFondo(g), 0,0, VW, VH);
  flashTribuna(g);`,
`  /* IL VERSO DELL'OBIETTIVO, DICHIARATO. La serie di rigori si batte
     tutta alla stessa porta — e' la regola del gioco vero — e qui e'
     quella a levante, cioe' lo stesso valore di ripiego con cui
     avviaRipresa apre la ripresa del gol quando il nastro tace. Serve al
     fondale per sapere da che parte gli arriva il sole e alle ombre per
     sapere da che parte cadere: prima non lo sapeva nessuno dei due. */
  ctx.drawImage(duelFondo(g, 1, 0), 0,0, VW, VH);
  flashTribuna(g);`);

cambio('6b. la ripresa del gol passa il suo asse',
`  const g=ripresaGeo();
  ctx.drawImage(duelFondo(g), 0,0, VW, VH);
  if(crowdAtlas) drawTifoseriaGol(g, R);`,
`  const g=ripresaGeo();
  /* l'asse della ripresa e' gia' la direzione del tiro registrata nel
     nastro (vedi avviaRipresa): il fondale e le ombre lo ricevono, e la
     scena dice da che parte si sta guardando. */
  ctx.drawImage(duelFondo(g, R.ax, R.ay), 0,0, VW, VH);
  if(crowdAtlas) drawTifoseriaGol(g, R);`);

/* ------------------------------------------------------------------ 7
   LE OMBRE DEGLI ESULTANTI. Una passata sola, prima di tutti i corpi. */
cambio('7. la scena del gol ha la sua legge della luce',
`  for(const o of RIP_ORD){
    const q=G.players[o.i];
    const y=yDi(o.d), pp=persp(y);`,
`  /* =====================================================================
     LE OMBRE DEGLI ESULTANTI — la passata che mancava, e mancava proprio
     dove le figure sono grandi il triplo che altrove.

     UNA PASSATA SOLA, PRIMA DI TUTTI I CORPI: e' la stessa regola non
     negoziabile di drawOmbreGiocatori, e qui morde piu' che in pianta.
     Il marcatore e i due compagni stanno su tre profondita' diverse e a
     un passo l'uno dall'altro; disegnando ombra-e-corpo a coppie,
     l'ombra del compagno arretrato finirebbe sulla faccia del marcatore
     — che e' il fotogramma piu' guardato del gioco.
     LA GEOMETRIA LA DA' ombraBassa E NON SI RIFA' QUI: direzione da
     SOLE, lunghezza 2,2 volte la figura nel mondo, sole del campo,
     l'allungamento del gol e il tramonto della partita gia' dentro.
     L'ALFA E' ombraAlfa(), la stessa della pianta, per la stessa ragione
     per cui esiste: tiene fermo il RAPPORTO ombra/prato mentre la sera
     scende, invece di tenere ferma l'alfa e lasciare sbiadire l'ombra.
     COSTO: al massimo quattro transform e quattro drawImage. */
  {
    const O=ombraBassa(R.ax, R.ay), OA=ombraAlfa();
    for(const o of RIP_ORD){
      const y=yDi(o.d), x=clamp(latX(o.lat,y), 30, VW-30);
      ombraFiguraBassa(x, y, g.GH*RIP_KFIG*persp(y), O, OA);
    }
  }
  for(const o of RIP_ORD){
    const q=G.players[o.i];
    const y=yDi(o.d), pp=persp(y);`);

/* ------------------------------------------------------------------ 8
   IL PORTIERE DEL DISCHETTO. */
cambio('8. il portiere del dischetto getta la sua ombra',
`    /* l'OMBRA LUNGA del portiere, tirata a est dal faro: sfuma a zero */
    {
      const oy=g.GLY-g.GH*0.02, lu=g.GW*(0.36+0.10*ease);
      const gsh=ctx.createLinearGradient(kx,0,kx+lu,0);
      gsh.addColorStop(0,'rgba(4,10,7,.44)'); gsh.addColorStop(1,'rgba(4,10,7,0)');
      ctx.fillStyle=gsh;
      ctx.beginPath(); ctx.ellipse(kx+lu*0.5,oy+g.GH*0.012,lu*0.5,g.GH*0.052,0.05,0,6.2832); ctx.fill();
    }
    /* l'ombra portata: stessa luce del tiratore (scarto a est), si
       allarga col corpo disteso — e' quello che dice che e' in tuffo */
    ombraMorbida(kx+(g.GLY-kyv)*0.20, g.GLY-g.GH*0.02,
                 g.GH*0.16*(1+0.55*ease), g.GH*0.042, 0.94-0.16*ease);`,
`    /* =================================================================
       L'OMBRA DEL PORTIERE, ADESSO PROIETTATA DAL SOLE E NON DAL GUSTO.

       QUI C'ERANO DUE OMBRE, E NESSUNA DELLE DUE ERA UN'OMBRA. La prima
       era un'ellisse sfumata lunga un terzo di porta tirata ORIZZONTALE
       verso destra: e' precisamente l'errore contro cui il cappello di
       ombraBassa mette in guardia — il vettore della pianta ricopiato in
       una camera dove il terreno e' visto di taglio, cioe' un sole
       appeso a mezz'aria sopra la linea laterale. La seconda era una
       pozza molle sotto i piedi, che dice «tocca terra» e non dice
       niente sull'ora.
       Adesso la proiezione la fa ombraBassa, dal piede vero (kx, ky) e
       con la direzione che chiede a SOLE. La pozza resta, piu' discreta,
       nel suo mestiere di macchia di contatto — la stessa coppia
       capsula+macchia della pianta, e nello stesso ordine: prima la
       capsula, poi la macchia sopra.
       IL TUFFO E' QUOTA, e la quota si tratta come in pianta: un corpo
       in aria stacca l'ombra, la rimpicciolisce e la schiarisce (k, r, a
       di drawOmbreGiocatori). Qui 'ease' e' gia' il cronometro della
       distensione, quindi la capsula perde il 30% di lunghezza e un
       quinto d'alfa mentre il portiere vola. */
    {
      const Ok=ombraBassa(1,0);
      ombraFiguraBassa(kx, ky, g.GH*0.51*(1-0.30*ease), Ok,
                       ombraAlfa()*(1-0.22*ease));
    }
    ombraMorbida(kx+(g.GLY-kyv)*0.20, g.GLY-g.GH*0.02,
                 g.GH*0.16*(1+0.55*ease), g.GH*0.042, 0.58-0.10*ease);`);

/* ------------------------------------------------------------------ 9
   IL TIRATORE DEL DISCHETTO. */
cambio('9a. la macchia del tiratore scende al piede vero',
`    /* stessa luce di tutto il gioco: scarto in basso a destra, mai centrata.
       L'ombra NON prende il saliscendi del gesto: sta sul prato, e la
       distanza fra corpo e ombra e' il modo in cui si legge il rimbalzo. */
    ombraMorbida(sx2+sc*2.8, sy2+sc*13.6, sc*8.4, sc*2.9, 0.94);`,
`    /* L'OMBRA DEL TIRATORE E' SCESA DI VENTI RIGHE, e non e' un
       trasloco per ordine: e' che adesso ha bisogno del PIEDE VERO.
       Questa macchia stava a sy2+13,6 unita', due virgola otto sopra il
       punto in cui le scarpe toccano davvero il prato (py2, dichiarato
       poco piu' sotto e gia' misurato una volta: a 13,2 la pozza d'ambra
       finiva dietro le gambe). Per una macchia molle quello scarto era
       licenza poetica; per una capsula PROIETTATA e' l'ancora, e
       un'ombra che parte due unita' sopra la scarpa e' un'ombra che non
       appartiene a nessuno. Capsula e macchia stanno adesso insieme, sul
       piede, appena sopra la dichiarazione di py2. */`);

cambio('9b. il tiratore del dischetto getta la sua ombra',
`    const py2=sy2+sc*16.4;
    ctx.drawImage(poolTex, sx2-sc*13.6, py2-sc*6.0, sc*27.2, sc*12.0);`,
`    const py2=sy2+sc*16.4;
    /* L'OMBRA PORTATA DEL TIRATORE. E' la figura piu' grande di tutto il
       gioco — trentaquattro unita' a un passo dall'obiettivo — e stava
       su una macchia larga quanto lunga: un adesivo. Adesso c'e' la
       proiezione vera, con la direzione che chiede a SOLE, e sopra di
       lei la macchia di contatto (piu' discreta: non e' piu' lei a dover
       fare da ombra). L'ordine e' quello della pianta — capsula, poi
       macchia — e tutt'e due stanno SOTTO la pozza d'ambra del
       portatore, che e' un segno di regia e va letto sopra il terreno. */
    {
      const Os=ombraBassa(1,0);
      ombraFiguraBassa(sx2, py2, sc*34, Os, ombraAlfa());
    }
    ombraMorbida(sx2+sc*2.8, py2-sc*0.4, sc*8.4, sc*2.9, 0.58);
    ctx.drawImage(poolTex, sx2-sc*13.6, py2-sc*6.0, sc*27.2, sc*12.0);`);

/* ------------------------------------------------------------------ 10
   La macchia di contatto del rig non e' nera. */
cambio('10. la macchia di contatto non e\' nera',
`      ctx.globalAlpha=0.22*(0.40+0.60*fo); ctx.fillStyle='#000';`,
`      /* NON PIU' NERO PURO, ed e' la prima riga del contratto scritto in
         testa a SOLE: «tintaOmbra — il viola-blu verso cui tira ogni
         ombra: MAI nero puro, perche' il nero spegne il verde e fa
         sembrare sporco il campo». Questa macchia si disegna solo in
         camera bassa (in pianta l'ombra la fa drawOmbreGiocatori e qui si
         passa senzaOmbra), cioe' esattamente nelle due scene in cui la
         figura e' grande e il nero si vede: era l'unica ombra del gioco
         rimasta fuori dalla legge.
         La tinta e' quella di ombraLungaTex — (14·38·32), erba col cielo
         dentro, verde sopra il blu — cosi' la macchia di contatto e la
         capsula proiettata che le passa sotto sono lo stesso colore
         invece di due grigi diversi. */
      ctx.globalAlpha=0.22*(0.40+0.60*fo); ctx.fillStyle='rgb(14,38,32)';`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-luce.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
fs.writeFileSync(usc, t);
console.log(`toppa applicata: ${CAMBI.length} cambi, ${ing} -> ${usc}`);
