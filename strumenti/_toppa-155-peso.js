/* =====================================================================
   _toppa-155-peso.js — L'OMBRA SMETTE DI ESSERE UN DISCHETTO
   (voce #155, giro 1 · criterio C4 della giuria)

   ====================== IL DIFETTO, MISURATO ==========================
   L'ombra della figura era UN'ELLISSE DI RAGGIO FISSO (0,27·s) centrata
   sotto il BACINO, rimpicciolita da un fattore fo che leggeva la quota
   del GIUNTO PIU' BASSO meno cinque centimetri. Le due scelte insieme
   producono il difetto che la giuria ha nominato: nel tuffo il portiere
   e' orizzontale a mezz'aria, ma ha ancora un piede penzoloni vicino al
   manto — quindi mn ~ 0, quindi fo ~ 1, quindi sotto di lui c'e' LA
   STESSA MACCHIA di quando sta fermo. Un corpo lungo un metro e mezzo e
   un uomo in piedi gettavano due ombre identiche.

   ====================== LE DUE COSE CHE ADESSO SI MISURANO ============
   Sui diciotto giunti, nello stesso ciclo che gia' c'era:

     L'INGOMBRO A TERRA. Si prendono i giunti BASSI (quota sotto 0,95 m:
       in piedi sono gambe e bacino, disteso sono quasi tutti) e si
       misura la loro escursione nelle due direzioni del manto. L'ombra
       diventa un'ellisse di semiassi 0,09 + 0,40·escursione, con
       l'escursione tagliata a 1,60 m perche' oltre non c'e' un corpo,
       c'e' un errore. In piedi fa 0,27·s — ESATTAMENTE il raggio di
       prima, e non e' una coincidenza: e' la taratura che si conserva
       dove il difetto non c'era. Disteso nel tuffo arriva a 0,73·s in
       una direzione e resta stretta nell'altra: l'ombra si ALLUNGA
       sotto il corpo lungo.

     LA QUOTA DEL CORPO, non del giunto piu' basso. E' la media delle
       diciotto quote meno 0,72 m (la media di un uomo in piedi): un
       portiere disteso a mezz'aria la fa salire anche col piede giu', e
       l'ombra si stacca come deve. Le due costanti della rampa scendono
       da 2,6/3,2 a 1,9/2,6 perche' la media e' un numero piu' pigro del
       minimo e la rampa va rifatta sulla nuova grandezza.

   ====================== IL NUCLEO DEL CONTATTO ========================
   Piu' l'indizio che mancava del tutto: sotto il giunto che PREME — il
   piu' basso — una macchia piccola e piu' scura, che si spegne appena
   quel giunto si stacca da terra (alfa lineare da 0,10 m a 0). E'
   quella che dice «ha pesato LI'» invece di «e' appoggiato a
   un'ellisse», e sull'appoggio della frenata o del tiro cade esatta
   sulla suola. Sparisce a mezz'aria, dove non c'e' niente da premere.

   ====================== I SOLCHI DELLA SCIVOLATA ======================
   La scivolata era l'unica clip che ara il campo senza lasciare un
   segno: adesso dichiara la sua polvere con `solchi`, la stessa che
   l'arresto usa gia' dal #152 — non un secondo sistema, la stessa
   tabella e lo stesso disegno.

   ====================== COSTO =========================================
   Il ciclo sui diciotto giunti c'era gia' (serviva per mn). Adesso
   dentro fa quattro confronti in piu' e due prodotti: sono ~70
   operazioni per figura, e SOLO nelle scene in camera bassa, perche' in
   pianta il chiamante passa senzaOmbra e tutto questo blocco non gira.
   Una ellisse in piu' (il nucleo), sempre e solo li'.
   ===================================================================== */
const fs = require('fs');

const CAMBI = [];
function cambio(nome, cerca, sostituisci) { CAMBI.push({ nome, cerca, sostituisci }); }

cambio('1. l\'ombra misura ingombro e quota invece di essere un dischetto',
`    const x=P[PELVIS*3], z=P[PELVIS*3+2];
    const xw=x*cyw+z*syw, zw=z*cyw-x*syw;
    let mn=P[1]; for(let j=1;j<NJ;j++){ const yy=P[j*3+1]; if(yy<mn)mn=yy; }
    let quota=mn-0.05; if(quota<0)quota=0;
    // il termine quadratico stacca NETTAMENTE l'ombra alle quote alte
    // (rovesciata, tuffo): e' l'indizio d'aria che la pianta capisce
    const fo=1/(1+2.6*quota+3.2*quota*quota);
    const gx=cx+xw*s, gy=cy-zw*cam.se*s;`,
`    /* =================================================================
       L'OMBRA HA LA FORMA DEL CORPO E LA QUOTA DEL CORPO (voce #155).
       Prima era un dischetto di raggio fisso sotto il bacino, scalato
       dalla quota del giunto PIU' BASSO: nel tuffo il portiere e'
       orizzontale a mezz'aria ma ha un piede penzoloni vicino al manto,
       quindi la macchia restava quella di un uomo in piedi.
       Qui lo stesso ciclo che cercava il minimo misura anche
       L'INGOMBRO A TERRA dei giunti bassi e LA QUOTA MEDIA del corpo.
       ================================================================= */
    let mn=1e9, som=0, jb=PELVIS;
    let ax0=1e9, ax1=-1e9, az0=1e9, az1=-1e9;
    for(let j=0;j<NJ;j++){
      const yy=P[j*3+1];
      som+=yy;
      if(yy<mn){ mn=yy; jb=j; }
      /* solo i giunti BASSI fanno ingombro: in piedi sono gambe e
         bacino (un braccio alzato non allarga l'ombra), disteso sono
         quasi tutti — ed e' proprio allora che l'ombra deve allungarsi */
      if(yy<0.95){
        const xx=P[j*3], zz=P[j*3+2];
        const xa=xx*cyw+zz*syw, za=zz*cyw-xx*syw;
        if(xa<ax0)ax0=xa; if(xa>ax1)ax1=xa;
        if(za<az0)az0=za; if(za>az1)az1=za;
      }
    }
    if(ax1<ax0){ const xx=P[PELVIS*3], zz=P[PELVIS*3+2];
                 ax0=ax1=xx*cyw+zz*syw; az0=az1=zz*cyw-xx*syw; }
    /* la quota che conta e' quella del CORPO: la media, non il minimo */
    let quota=som/NJ-0.72; if(quota<0)quota=0;
    // il termine quadratico stacca NETTAMENTE l'ombra alle quote alte
    // (rovesciata, tuffo): e' l'indizio d'aria che la pianta capisce
    const fo=1/(1+1.9*quota+2.6*quota*quota);
    const gx=cx+(ax0+ax1)*0.5*s, gy=cy-(az0+az1)*0.5*cam.se*s;
    /* i semiassi: 0,09 + 0,40 dell'escursione, tagliata a 1,60 m.
       In piedi l'escursione vale ~0,45 m e il semiasse torna 0,27·s,
       cioe' ESATTAMENTE il raggio di prima. */
    let exX=ax1-ax0; if(exX>1.60)exX=1.60;
    let exZ=az1-az0; if(exZ>1.60)exZ=1.60;
    const raO=(0.09+0.40*exX)*s, rbO=(0.09+0.40*exZ)*s*cam.se+0.5;`);

cambio('2. l\'ellisse prende i due semiassi, e nasce il nucleo del contatto',
`      ctx.globalAlpha=0.22*(0.40+0.60*fo); ctx.fillStyle='rgb('+OMBRA_CONTATTO+')';
      ctx.beginPath();
      ctx.ellipse(gx, gy, 0.27*s*fo, (0.27*s*cam.se+0.5)*fo, 0,0,TAU);
      ctx.fill();
    }`,
`      ctx.globalAlpha=0.22*(0.40+0.60*fo); ctx.fillStyle='rgb('+OMBRA_CONTATTO+')';
      ctx.beginPath();
      ctx.ellipse(gx, gy, raO*fo, rbO*fo, 0,0,TAU);
      ctx.fill();
      /* IL NUCLEO DEL CONTATTO — l'indizio che mancava del tutto. Sotto
         il giunto che PREME (il piu' basso) una macchia piccola e piu'
         scura, che si spegne appena quel giunto si stacca: e' quella che
         dice «ha pesato LI'» invece di «e' appoggiato a un'ellisse».
         A mezz'aria non c'e', perche' non c'e' niente da premere. */
      const pr=1-mn*10;
      if(pr>0){
        const bx=P[jb*3], bz=P[jb*3+2];
        const bxw=bx*cyw+bz*syw, bzw=bz*cyw-bx*syw;
        ctx.globalAlpha=0.20*pr*fo;
        ctx.beginPath();
        ctx.ellipse(cx+bxw*s, cy-bzw*cam.se*s,
                    0.115*s, 0.115*s*cam.se+0.4, 0,0,TAU);
        ctx.fill();
      }
    }`);

cambio('3. la scivolata ara il campo e lascia il segno',
`  scivolata: {freq:0.8, pose:poseScivolata},`,
`  /* LA SCIVOLATA LASCIA IL SEGNO (voce #155): era l'unica clip che ara
     il manto senza dirlo. Stessa tabella e stesso disegno dei solchi
     dell'arresto (#152) — non un secondo sistema. */
  scivolata: {freq:0.8, pose:poseScivolata, polvere:{t:0.08,d:0.38,solchi:1}},`);

/* ------------------------------------------------------------------ */
const [, , ing, usc] = process.argv;
if (!ing || !usc) { console.error('uso: node strumenti/_toppa-155-peso.js ingresso.html uscita.html'); process.exit(2); }
let t = fs.readFileSync(ing, 'utf8');
const guai = [];
for (const c of CAMBI) {
  const n = t.split(c.cerca).length - 1;
  if (n !== 1) { guai.push(`${c.nome}: trovato ${n} volte (ne serve 1)`); continue; }
  t = t.replace(c.cerca, c.sostituisci);
}
if (guai.length) { console.error('TOPPA NON APPLICATA:\n  ' + guai.join('\n  ')); process.exit(1); }
for (const [k, q] of [['const raO=(0.09+0.40*exX)*s', 1],
                      ['const pr=1-mn*10;', 1],
                      ['polvere:{t:0.08,d:0.38,solchi:1}', 1]]) {
  const n = t.split(k).length - 1;
  if (n !== q) { console.error('TOPPA NON APPLICATA: «' + k + '» compare ' + n + ' volte (ne servono ' + q + ')'); process.exit(1); }
}
fs.writeFileSync(usc, t);
console.log('toppa applicata: il peso dell\'ombra, ' + CAMBI.length + ' cambi, ' + ing + ' -> ' + usc);
console.log('  il file cresce di ' + (Buffer.byteLength(t, 'utf8') - fs.statSync(ing).size) + ' byte');
