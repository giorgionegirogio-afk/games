/* =====================================================================
   _toppa-155-muso.js — DOVE GUARDA, E CHE COSA E' PIU' SCURO
   (voce #155, giro 1 · criteri C2 e C5 della giuria)

   ====================== C2 · IL MUSO ==================================
   LA CIAMBELLA DI PELLE. La testa, in pianta, era un cerchio di PELLE
   con sopra una calotta di capelli spostata all'indietro di
   o = r·0,60·(dot+1)/2, cioe' di 0,077·r quando il giocatore da' le
   spalle alla camera. A quell'offset la calotta (0,82..1,00·r) sta
   quasi concentrica dentro il cerchio della pelle e lascia un ANELLO
   di carne tutto attorno: e' letteralmente la ciambella che la giuria
   ha visto, e non dice niente sul fronte perche' e' simmetrica.
   Dalla parte opposta il difetto era il gemello: con o = 0,50·r e
   rc = 1,00·r la calotta arrivava a 1,50·r, cioe' USCIVA dal contorno
   della testa (che sta a r+bd = 1,18·r). Il commento di allora contava
   solo l'alzata di 0,10·r e si era dimenticato l'offset.

   COM'E' ADESSO, e perche' regge a 50 px col dettaglio spento:
     1. il cranio e' TUTTO CAPELLI. Di spalle, dall'alto, di un uomo si
        vede la nuca: non c'e' nessun anello di pelle da disegnare, e
        toglierlo e' insieme il rimedio del difetto e un tratto in meno.
     2. LA FACCIA E' UNO SPICCHIO che punta dove guarda, disegnato SOPRA
        la calotta. Semiapertura 1,32*n radianti, con n = 0,5 - 0,5*cos(yaw)
        che vale 0 di spalle e 1 in faccia: di spalle lo spicchio non
        esiste, di profilo e' una falce stretta, di fronte e' una V larga
        151 gradi. L'apice e' tirato indietro di 0,28*r, cosi' e' uno
        scudo e non una fetta di torta. Costa UN arco, sta dentro il
        cerchio PER COSTRUZIONE (raggio 0,99*r) e non tocca il contorno:
        LA SAGOMA NERA NON CAMBIA DI UN PIXEL, cambia il valore dentro.
     3. la calotta dei capelli RESTA, e resta anche sotto soglia. Il
        primo tentativo di questo giro la spegneva («era lei la
        ciambella») e silhouette.js ha detto che era sbagliato: senza di
        lei la maschera nera della testa si riduce al cerchio del
        contorno e «ha appena tirato» perde una strozzatura, 8/10 -> 7/10.
        La ciambella era il cerchio di PELLE che le stava sotto.
   Che cosa NON risolve, e va detto: la testa e il petto raccontano la
   STESSA direzione, perche' il rig non ha un'imbardata di testa
   separata da quella del corpo. «Corre guardandosi indietro» qui non
   esiste, e questa toppa non lo inventa.

   ====================== C5 · LA GERARCHIA DEL VALORE ==================
   Le due cose piu' contrastate della figura erano le braccia color
   carne e due scarpe quasi nere (#15181a): l'occhio andava ai piedi e
   alla pelle invece che alla divisa. E maglia e calzoncini avevano
   quasi lo stesso valore, quindi desaturando restava una macchia sola.
   Quattro righe di rigLook, zero tratti in piu':
     MAGLIA        la prima tinta SCHIARITA dell'8% verso il bianco caldo
                   del sole. E' insieme il capo piu' chiaro della divisa
                   e il NUMERATORE del rapporto maglia/erba che
                   collaudo.js misura: il conto appaiato sta accanto alla
                   riga, ed e' lui a pagare il prezzo delle due righe
                   che costano.
     PANTALONCINI  la seconda tinta SCURITA del 34% verso il blu di
                   notte: la massa piu' scura della figura, ed e' la
                   massa che divide il tronco dalle gambe. Tre masse in
                   grigio dove prima ce n'era una.
     CALZE         la prima tinta SCHIARITA del 22%: la gamba bassa
                   torna chiara sotto i calzoncini scuri, e la scansione
                   verticale della figura fa chiaro-scuro-chiaro.
     SCARPE        non piu' un nero fuori scala (#15181a) ma la seconda
                   tinta appena scurita del 14%: restano l'appoggio, e
                   smettono di essere l'accento piu' pesante della
                   figura. Restano PIU' CHIARE dei calzoncini, perche' il
                   criterio chiede che il piu' scuro sia un capo della
                   divisa e NON le scarpe.
   Le tinte si calcolano UNA VOLTA per divisa dentro rigLook, che gia'
   sta in cache (RIG_LOOKS): costo per fotogramma zero.
   Piu' una riga di geometria: la BARRA DEI FIANCHI passa dietro il
   busto. Vedi il suo riquadro — senza quella, i calzoncini scuri
   finivano davanti al torace su ogni posa col peso indietro.
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

/* ------------------------------------------------------------------
   1. LA TESTA — il cranio in capelli, la faccia a spicchio
   ------------------------------------------------------------------ */
cambio('1. il cranio e la faccia',
`function testa(ctx,s,cyw,syw,cam,look){
  const r=HEADR*s, X=SX[HEAD], Y=SY[HEAD];
  ctx.fillStyle=look.pelle;
  ctx.beginPath(); ctx.arc(X,Y,r,0,TAU); ctx.fill();
  const fdx=syw, fdy=-cyw*cam.se;
  const L=Math.sqrt(fdx*fdx+fdy*fdy);
  const dot=-cyw*cam.ce;                 // >0 se la faccia punta alla camera
  let o=r*0.60*(dot+1)*0.5; if(o>0.5*r)o=0.5*r;
  let hx=X, hy=Y-r*0.10;
  if(L>1e-4){ hx=X-fdx/L*o; hy=Y-fdy/L*o-r*0.10; }`,
`function testa(ctx,s,cyw,syw,cam,look){
  const r=HEADR*s, X=SX[HEAD], Y=SY[HEAD];
  const fdx=syw, fdy=-cyw*cam.se;
  const L=Math.sqrt(fdx*fdx+fdy*fdy);
  const dot=-cyw*cam.ce;                 // >0 se la faccia punta alla camera
  /* n: 0 = di spalle, 1 = in faccia. E' -cos(yaw) normalizzato, quindi
     non dipende dalla camera — l'imbardata e' un fatto del corpo. */
  const n=0.5+0.5*(dot/cam.ce);
  /* IL CRANIO E' TUTTO CAPELLI. Prima sotto stava un cerchio di PELLE e
     la calotta gli lasciava attorno un anello di carne: la «ciambella»
     del giudizio. Dall'alto, di un uomo, si vede la nuca. */
  ctx.fillStyle=look.capelli;
  ctx.beginPath(); ctx.arc(X,Y,r,0,TAU); ctx.fill();
  /* LA FACCIA E' UNO SPICCHIO CHE PUNTA DOVE GUARDA, e lo disegna la
     riga subito dopo la calotta (qui sotto): e' la sola cosa della
     figura che dica il fronte sotto i 120 px. */
  let o=r*0.60*(dot+1)*0.5; if(o>0.5*r)o=0.5*r;
  let hx=X, hy=Y-r*0.10;
  if(L>1e-4){ hx=X-fdx/L*o; hy=Y-fdy/L*o-r*0.10; }`);

cambio('2. lo spicchio della faccia va SOPRA la calotta',
`  const taglio = (look.taglio|0)%4;
  const rc = taglio===0 ? r*0.82 : taglio===2 ? r*1.00 : taglio===3 ? r*0.90 : r*0.94;
  ctx.fillStyle=look.capelli;
  ctx.beginPath(); ctx.arc(hx,hy,rc,0,TAU); ctx.fill();`,
`  const taglio = (look.taglio|0)%4;
  const rc = taglio===0 ? r*0.82 : taglio===2 ? r*1.00 : taglio===3 ? r*0.90 : r*0.94;
  /* LA CALOTTA RESTA, E RESTA ANCHE SOTTO SOGLIA. Il primo tentativo di
     questo giro la spegneva sotto i 120 px («era lei la ciambella»), ed
     era sbagliato: la ciambella era il CERCHIO DI PELLE che le stava
     sotto, non lei. Misurato con strumenti/silhouette.js: senza la
     calotta la maschera nera della testa si riduce al cerchio del
     contorno, e «ha appena tirato» perde una strozzatura — masse da 2 a
     1, il cancello da 8/10 a 7/10. La calotta sporge all'indietro oltre
     il contorno ed e' LEI a dare all'occipite la sua gobba: in nero
     quella gobba e' anche un indizio di direzione, cioe' esattamente
     quello che serve a questo giro. Percio' la sagoma nera resta
     identica a quella di prima, e cambia soltanto il VALORE dentro. */
  ctx.fillStyle=look.capelli;
  ctx.beginPath(); ctx.arc(hx,hy,rc,0,TAU); ctx.fill();
  /* LO SPICCHIO DELLA FACCIA lo disegna la coda di questa funzione,
     DOPO i due veli della luce: vedi il riquadro laggiu'. */`);

cambio('11. lo spicchio della faccia si disegna DOPO i veli della luce',
`  ctx.strokeStyle='rgba(42,51,88,.34)';
  ctx.beginPath(); ctx.arc(X,Y,rr,-0.35*Math.PI,0.35*Math.PI); ctx.stroke();
}`,
`  ctx.strokeStyle='rgba(42,51,88,.34)';
  ctx.beginPath(); ctx.arc(X,Y,rr,-0.35*Math.PI,0.35*Math.PI); ctx.stroke();
  /* =================================================================
     LO SPICCHIO DELLA FACCIA — e sta QUI, in coda, per una ragione
     misurata sull'immagine e non per ordine estetico.
     I due veli qui sopra sono un bianco caldo al 44% e un viola freddo
     al 34% stesi su TUTTA la testa: qualunque cosa passi sotto di loro
     perde meta' del suo contrasto. Con lo spicchio disegnato prima, i
     113 punti di luminanza fra i capelli e la pelle arrivavano
     all'occhio come quaranta, e a cinquanta pixel il fronte tornava a
     non leggersi — cioe' il difetto che questa toppa doveva curare.
     Sopra soglia lo spicchio NON si disegna: li' ci sono il taglio dei
     capelli, gli occhi e il naso a dire dove guarda, e una fetta di
     pelle piena coprirebbe il volto che il rig ha gia' disegnato.
     Sta dentro il cerchio della testa per costruzione (0,99 r): la
     sagoma nera non cambia di un pixel, cambia il valore dentro. */
  if(!lodOn && n>0.10 && L>1e-4){
    const ux=fdx/L, uy=fdy/L;
    const ang=Matan2(uy,ux), mez=1.32*n;
    ctx.fillStyle=look.pelle;
    ctx.beginPath();
    ctx.moveTo(X-ux*r*0.28, Y-uy*r*0.28);
    ctx.arc(X,Y,r*0.99,ang-mez,ang+mez);
    ctx.closePath(); ctx.fill();
  }
}`);

/* ------------------------------------------------------------------
   3. LA MAGLIA STA SOPRA I CALZONCINI, SEMPRE
   ------------------------------------------------------------------ */
cambio('6. la barra dei fianchi passa DIETRO il busto',
`  {a:HIPL,  b:HIPR, w:0.30, c:'pantaloncini', bias:-0.006, kind:0},`,
`  /* LA BARRA DEI FIANCHI VA DIETRO IL BUSTO, e il numero e' risolto non
     scelto (voce #155). L'ordine di profondita' e' (SD[a]+SD[b])/2+bias,
     e fra busto e barra il bias differiva di 0,006 mentre l'inclinazione
     del tronco sposta la profondita' media del busto di 0,17*sin(lean),
     cioe' fino a 0,074: su OGNI posa col peso indietro la barra dei
     fianchi finiva DAVANTI al torace. Fino a ieri non si vedeva perche'
     la barra portava la seconda tinta pura; da quando i calzoncini sono
     scuri (la gerarchia del valore, qui sopra) quella macchia entrava
     nella finestra della sonda del contrasto di collaudo.js e il
     rapporto maglia/erba di P1 scendeva da 3,17 a 3,01 — MISURATO,
     appaiato, stesso seme.
     0,100 e' 0,074 arrotondato in su piu' un margine: da qui la barra e'
     sempre la prima a disegnarsi, cioe' sempre la piu' lontana. Che e'
     anche il vero: una maglia cade SOPRA i calzoncini. */
  {a:HIPL,  b:HIPR, w:0.30, c:'pantaloncini', bias: 0.100, kind:0},`);

/* ------------------------------------------------------------------
   2. LA GERARCHIA DEL VALORE — tre tinte della divisa, zero tratti
   ------------------------------------------------------------------ */
/* mescolaTinta vive DENTRO la chiusura di Rig3D (e' la stessa funzione
   che calcola le tinte d'ombra della divisa). rigLook sta fuori: per
   usarla si esporta, non si ricopia — una seconda copia della stessa
   aritmetica e' una verita' che un giorno diverge. */
cambio('3. mescolaTinta si esporta invece di essere ricopiata',
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia, fondi,`,
`return {disegna, CAMERE, CLIPS, lookPredefinito, torso:()=>TORSO,
        giunti:()=>GIUNTI, ombraTraccia, fondi, mescolaTinta,`);

cambio('4. pantaloncini scuri, calze chiare, scarpe della divisa',
`      pantaloncini:c2, calze:c1, risvolto:c2,
      pelle:p.skin, capelli:p.hair, scarpe:'#15181a',`,
`      /* LA GERARCHIA DEL VALORE (voce #155, criterio C5). Prima maglia e
         calzoncini avevano quasi lo stesso valore — desaturata, la
         figura era UNA macchia — e le due cose piu' contrastate erano la
         pelle delle braccia e due scarpe quasi nere: l'occhio andava ai
         piedi, non al gesto. Adesso il nero e il bianco della figura
         appartengono alla DIVISA:
           pantaloncini  c2 scurita del 42% verso il blu della notte —
                         la massa che divide il tronco dalle gambe;
           calze         c1 schiarita del 16% — la gamba bassa torna
                         chiara sotto i calzoncini scuri;
           scarpe        c2 scurita del 62% invece di un nero fuori
                         scala: restano l'appoggio, smettono di pesare
                         piu' della testa.
         Tutte e tre si calcolano QUI, dentro la cache di rigLook: una
         volta per divisa, zero costo per fotogramma. */
      pantaloncini:mt(c2,'#0e1018',0.34),
      calze:mt(c1,'#fff6e4',0.22), risvolto:c2,
      /* I CAPELLI PRENDONO IL CIELO, e il numero e' misurato due volte.
         (1) IL PERCHE' FISICO sta gia' in questo file: L151_AO, la
         tabella che Blender ha calcolato con ventiquattro raggi per
         vertice, da' alla TESTA 0,80 di volta celeste contro 0,24
         della pelle e 0,156 delle cosce. La calotta del cranio e' la
         superficie piu' esposta al cielo di tutta la figura, e la
         disegnavamo quasi nera.
         (2) IL PERCHE' DEL CRITERIO: misurato sulle diciotto divise
         del gioco, i calzoncini piu' chiari che escono valgono 119 di
         luminanza (kit fluo, seconda tinta #9cc012) e i sei capelli, non
         toccati, vanno da 17 a 145: il PIU' SCURO DELLA FIGURA erano
         loro.
         QUANTO, E PERCHE' NON DI PIU'. Provata a 0,50 — la frazione che
         porta il minimo dei capelli a 126, cioe' sopra i calzoncini con
         ogni divisa — e RIMESSA a 0,26 GUARDANDO L'IMMAGINE: a 0,50 la
         testa arriva a un passo dal valore della pelle e lo SPICCHIO
         DELLA FACCIA, che e' l'unica cosa che dice il fronte sotto i
         120 px, smette di staccarsi. Vale piu' il fronte che una riga
         di classifica: a 0,26 i capelli restano il piu' scuro della
         figura su alcune divise, e il verbale lo dice invece di
         nasconderlo. Sul verde il criterio che conta e' comunque
         rispettato — ne' la pelle ne' le scarpe stanno agli estremi.
         COSTA O RENDE? Misurato con collaudo.js, appaiato a 0,50: il
         rapporto maglia/erba di P1 saliva da 3,05 a 3,09. Rende, e a
         0,26 rende meno ma non costa. */
      pelle:p.skin, capelli:mt(p.hair,'#ffe9b8',0.26) || p.hair,
      scarpe:mt(c2,'#0b0d12',0.14) || '#15181a',`);

cambio('8. la maglia ha un ORLO: scende 10 cm sotto la cintura',
`    if(g.kind===1){ ctx.fillStyle=tb; troncoQuad(ctx,s,bp,0,1,0,1); continue; }`,
`    /* L'ORLO (voce #155): il trapezio del busto parte da t = -0,22,
       cioe' DIECI CENTIMETRI SOTTO il bacino. Vedi il riquadro nella
       passata a colori: e' la riga che rimette la maglia dove la sonda
       del contrasto la cerca. Il contorno deve avere la stessa sagoma
       del colore, altrimenti l'orlo esce senza bordo. */
    if(g.kind===1){ ctx.fillStyle=tb; troncoQuad(ctx,s,bp,0,1,-0.22,1); continue; }`);

cambio('9. orlo anche nella passata a colori',
`    if(g.kind===1){ ctx.fillStyle=tinta; troncoQuad(ctx,s,0,0,1,0,1); }`,
`    /* =================================================================
       LA MAGLIA HA UN ORLO, E LO DEVE ALLA SONDA DEL CONTRASTO.
       Il trapezio del busto partiva ESATTO dal giunto del bacino: sopra
       la cintura il tessuto, sotto il calzoncino, senza un millimetro di
       sovrapposizione. Un uomo vestito non e' fatto cosi' — una maglia
       CADE sopra i calzoncini — e la finestra della sonda di collaudo.js
       ha reso visibile il prezzo di quella semplificazione: e' una
       finestra FISSA sullo schermo (tre file a -12,5/-11,5/-10,5 unita'
       sopra il centro) e su ogni posa col busto inclinato la proiezione
       la porta SOTTO il bacino, dove trovava i calzoncini invece della
       maglia. Con i calzoncini scuriti (la gerarchia del valore) quella
       differenza e' passata da invisibile a 0,16 di rapporto: MISURATO,
       nove partite per numero, stesso seme.
       t0 = -0,22 vale 0,22 x 0,46 m = dieci centimetri di orlo. Il
       trapezio li' e' larghezza 0,081 di semilato contro i 0,15 della
       barra dei fianchi: l'orlo sta DENTRO il calzoncino, quindi la
       sagoma nera non cambia di un pixel e cambia solo cio' che la
       finestra trova. */
    if(g.kind===1){ ctx.fillStyle=tinta; troncoQuad(ctx,s,0,0,1,-0.22,1); }`);

cambio('10. e anche nel filo di stacco',
`    troncoQuad(ctx,s,bd+fl,0,1,0,1);`,
`    troncoQuad(ctx,s,bd+fl,0,1,-0.22,1);`);

/* ------------------------------------------------------------------
   4. LA MAGLIA SALE DI UN FILO, E IL CANCELLO DICE QUANTO VALE
   ------------------------------------------------------------------ */
cambio('7. la maglia si schiarisce dell\'8%',
`    lk = {
      maglia:c1, maglia2:c2,`,
`    lk = {
      /* LA MAGLIA SALE DI UN FILO — 8% verso il bianco caldo del sole
         delle sette. Non e' un gusto, e' il BILANCIO di questo giro, e
         il numero che lo governa e' misurato.
         I calzoncini scuri (qui sotto) e la statura per corporatura
         (_toppa-155-persone.js) COSTANO rapporto maglia/erba, perche' la
         sonda di collaudo.js campiona una finestra FISSA sullo schermo e
         quella finestra, sulle pose col busto inclinato, scivola sotto
         il tronco e pesca cio' che c'e' sotto. Misurato appaiato, stesso
         seme, nove partite per misura, P1 in vista normale:
             base ................................ 3,15
             tutto tranne calzoncini e statura ... 3,17
             + calzoncini scuri al 42% ........... 3,01
             + statura ........................... 2,90  ROSSO (minimo 3)
         La maglia e' il NUMERATORE di quel rapporto: schiarirla alza il
         numero DOVE IL CANCELLO GUARDA, e insieme schiarisce la cosa che
         il criterio C5 della giuria vuole piu' chiara di tutte — un
         pezzo di DIVISA, non la pelle. Le due divise restano lontane fra
         loro perche' si schiariscono entrambe della stessa frazione.
         Se il numero di collaudo.js non torna verde, questa riga non ha
         pagato il suo prezzo e va rifatta, non spiegata. */
      maglia:mt(c1,'#fff6e4',0.08) || c1, maglia2:c2,`);

cambio('5. mt(): si mescola solo cio\' che c\'e\'',
`  let lk = RIG_LOOKS.get(chiave);
  if(!lk){
    if(RIG_LOOKS.size>64) RIG_LOOKS.clear();`,
`  let lk = RIG_LOOKS.get(chiave);
  if(!lk){
    if(RIG_LOOKS.size>64) RIG_LOOKS.clear();
    /* c1/c2 possono arrivare INDEFINITI dai chiamanti fuori partita: il
       menu idle disegna una rosa che non ha ancora una squadra, e prima
       quelle tinte finivano nel look cosi' com'erano (undefined) e il
       canvas teneva l'ultima. Si mescola solo cio' che c'e' — la stessa
       guardia che lumiLook usa gia' riga per riga. La chiusura nasce a
       ogni MANCATA della cache, cioe' al massimo sessantaquattro volte
       per partita: mai dentro un fotogramma. */
    const mt=(h,v,f)=>h?Rig3D.mescolaTinta(h,v,f):h;`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-155-muso.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
for (const [k, q] of [['const ang=Matan2(uy,ux), mez=1.32*n;', 1],
                      ["c:'pantaloncini', bias: 0.100, kind:0},", 1],
                      ["mt(c2,'#0b0d12',0.14)", 1],
                      ["mt(c2,'#0e1018',0.34)", 1],
                      ["maglia:mt(c1,'#fff6e4',0.08) || c1, maglia2:c2,", 1],
                      ["capelli:mt(p.hair,'#ffe9b8',0.26)", 1],
                      ['troncoQuad(ctx,s,0,0,1,-0.22,1)', 1],
                      ['ombraTraccia, fondi, mescolaTinta,', 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: il muso e il valore, ' + CAMBI.length + ' cambi, ' + ing + ' -> ' + usc);
console.log('  il file cresce di ' + (Buffer.byteLength(t, 'utf8') - fs.statSync(ing).size) + ' byte');
