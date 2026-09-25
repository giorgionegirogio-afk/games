/* =====================================================================
   _toppa-157-peso.js — LA SCHIACCIATA DI UN FOTOGRAMMA E LA POLVERE
   (voce #155, giro 4 · rilievo 8 del verbale del giro 3)

   IL VERBALE: «I due 4 piu' a portata sono C4 — una schiacciata di un
   fotogramma sul contatto e della polvere che si legga a 50 px NATIVI,
   non solo nel pannello ingrandito — e C6.»

   Il giro 3 aveva gia' comprato le tre clausole di C4: il caricamento e
   la chiusura dei gesti, l'ombra che cambia in quattro stati
   (×1,00 a riposo · ×0,80 spenta in aria · ×0,78 con la macchia a 1,85
   sull'atterraggio · ×0,95 in rientro) e il solco della frenata. Manca
   la terza cosa che un corpo fa quando arriva a terra, e sono due:
   SI SCHIACCIA, e ALZA POLVERE.

   ====================== 1. LA SCHIACCIATA =============================
   DOVE STA, e perche' non nelle ossa. La compressione non tocca un solo
   giunto: si applica alla figura GIA' PROIETTATA, come scala non
   uniforme attorno al punto di appoggio (cx, cy). E' la squash-and-
   stretch dei disegnatori, ed e' l'unico posto in cui si puo' mettere
   senza mentire: dentro la posa sarebbe un femore che si accorcia, e la
   gabbia — giustamente — la boccerebbe. Qui le ossa restano lunghe
   quanto sono, in metri; e' l'immagine che si schiaccia.

   QUANTO, E PER QUANTO. Il peso lo da' IMP, la stessa tabella che
   governa l'ombra: vale 1 nel fotogramma in cui la quota smette di
   essere positiva, poi 0,55 / 0,25 / 0,08. Un fotogramma pieno e tre di
   coda, che e' esattamente «una schiacciata di un fotogramma».
   -14% in altezza e +22% in larghezza: il volume apparente resta
   1,22 × 0,86 = 1,05, cioe' la figura non si sgonfia ne' si gonfia, si
   spiaccica. Sono tre pixel su cinquanta, e a occhio nudo e' il salto
   che manca fra il fotogramma in aria e quello dopo.
   NON ALZA MAI LA CIMA DELLA TESTA — la scala verticale e' < 1 e il
   fulcro e' a terra — quindi l'invariante che protegge la sonda
   dell'erba di collaudo.js non si tocca nemmeno in un fotogramma.
   La PALLA non si schiaccia: si proietta dopo, e una palla che si
   spiaccica insieme al corpo sarebbe un errore, non un effetto.

   ====================== 2. LA POLVERE =================================
   Tre fiocchi chiari a terra, attorno al piede, sulla stessa campana.
   Perche' si legga a CINQUANTA PIXEL NATIVI e non solo nel pannello
   ingrandito, la taglia e' data in unita' di MANTO e non in pixel: al
   colmo dell'impatto i tre fiocchi sono larghi 8,2 · 10,0 · 11,8 unita'
   e alti poco piu' della meta', contro le 19,6 x 10,9 della macchia di
   contatto. Il piu' grosso e' il 60% di quella, cioe' due pixel pieni
   alla scala della partita: si vede a cinquanta, non solo a lente.
   Costa SOLO sui fotogrammi d'impatto: fuori da quelli PA.imp vale zero
   e il ramo non parte. In una partita intera i fotogrammi in cui una
   figura atterra sono una manciata, e in quelli le figure che atterrano
   sono una o due.
   La tinta e' #e7f0da, lo stesso bianco caldo con cui il gioco stacca
   gia' la palla e i solchi dall'erba (STACCO_FILO): una quinta tinta
   per la polvere sarebbe una tinta di troppo.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const E = [];
const esatta = (nome, da, a) => E.push({ nome, da, a });
const argv = process.argv.slice(2);
const pren = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i+1] ? argv[i+1] : null; };
const DA = pren('--da') || 'CALCETTO-il-gioco.html';
const A = pren('--a') || pren('--out') || pren('--dentro');

esatta('la schiacciata del contatto, sulla figura proiettata',
`  /* L'IMBARDATA DELLA TESTA, consumata qui e spenta subito: da questa
     riga in giu' il cranio ha un suo fronte, che puo' non essere quello
     del petto. Il mancino la specchia come specchia la posa. */`,
`  /* =====================================================================
     LA SCHIACCIATA DEL CONTATTO (voce #155, giro 4, criterio C4).
     Un corpo che arriva a terra si spiaccica per un fotogramma. Qui, e
     non dentro la posa, perche' dentro la posa sarebbe un femore che si
     accorcia e la gabbia lo boccerebbe: le ossa restano lunghe quanto
     sono, in metri, ed e' l'IMMAGINE a schiacciarsi — la squash-and-
     stretch dei disegnatori, una scala non uniforme attorno al punto
     d'appoggio.
     Il peso lo da' IMP, la stessa tabella che governa l'ombra: 1 nel
     fotogramma in cui la quota smette di essere positiva, poi
     0,55 / 0,25 / 0,08. Un fotogramma pieno e tre di coda.
     -14% in altezza e +22% in larghezza: 1,22 x 0,86 = 1,05, cioe' la
     figura non si sgonfia ne' si gonfia. La scala verticale e' SEMPRE
     minore di uno e il fulcro sta a terra, quindi la cima della testa
     non sale mai: l'invariante della sonda dell'erba non si tocca.
     La palla si proietta DOPO e non si schiaccia col corpo.
     ===================================================================== */
  {
    const sq=impatto(nomeClip,tSec);
    if(sq>0.02){
      const kx=1+0.22*sq, ky=1-0.14*sq;
      for(let j=0;j<NJ;j++){ SX[j]=cx+(SX[j]-cx)*kx; SY[j]=cy-(cy-SY[j])*ky; }
    }
  }
  /* L'IMBARDATA DELLA TESTA, consumata qui e spenta subito: da questa
     riga in giu' il cranio ha un suo fronte, che puo' non essere quello
     del petto. Il mancino la specchia come specchia la posa. */`);

esatta('la polvere del contatto, nella passata delle ombre',
`      const rc=r*(1+0.40*PA.imp);
      ctx.globalAlpha=ac*0.80;
      ctx.drawImage(ombraTex, CX-7*rc, CY-3.9*rc, 14*rc, 7.8*rc);
    }`,
`      const rc=r*(1+0.40*PA.imp);
      ctx.globalAlpha=ac*0.80;
      ctx.drawImage(ombraTex, CX-7*rc, CY-3.9*rc, 14*rc, 7.8*rc);
    }
    /* =================================================================
       LA POLVERE DEL CONTATTO (voce #155, giro 4, criterio C4).
       Tre fiocchi chiari a terra attorno al piede, sulla stessa campana
       dell'ombra. Il criterio chiede che si legga a CINQUANTA PIXEL
       NATIVI, quindi la taglia e' in unita' di MANTO e non in pixel: al
       colmo i tre fiocchi sono larghi 8,2 · 10,0 · 11,8 unita' contro le
       19,6 della macchia di contatto — il piu' grosso e' il 60% di
       quella, cioe' due pixel pieni alla scala della partita.
       Costa solo nei fotogrammi d'impatto: fuori PA.imp e' zero e il
       ramo non parte. In una partita le figure che atterrano nello
       stesso fotogramma sono una o due.
       La tinta e' il bianco caldo con cui il gioco stacca gia' la palla
       e i solchi dall'erba: una quinta tinta per la polvere sarebbe una
       tinta di troppo. ================================================= */
    if(PA.imp>0.28 && vicino){
      const pv=PA.imp, an=p.ang||0;
      ctx.globalAlpha=OMA*1.15*pv;
      ctx.fillStyle='#e7f0da';
      for(let d=0;d<3;d++){
        const aa=an+(d-1)*1.25;
        const rr=(1.5+2.6*pv)*(1+0.22*d);
        const dx=p.x+Mcos(aa)*(4.0+5.0*pv), dy=p.y+2.2+Msin(aa)*(2.0+2.4*pv);
        const DX=dx*C+dy*S, DY=-dx*S+dy*C;
        ctx.beginPath(); ctx.ellipse(DX,DY,rr,rr*0.52,0,0,Math.PI*2); ctx.fill();
      }
    }`);

/* ===================================================================== */
if (!A) { console.error('FALLITO: manca --a <destinazione> (o --out/--dentro).'); process.exit(1); }
if (!fs.existsSync(DA)) { console.error('FALLITO: sorgente inesistente: ' + DA); process.exit(1); }
let src = fs.readFileSync(DA, 'utf8');
const prima = src.length;
for (const e of E) {
  const n = src.split(e.da).length - 1;
  if (n !== 1) {
    console.error('FALLITO [' + e.nome + ']: l\'ancora compare ' + n + ' volte, non 1. Non scrivo niente.');
    process.exit(1);
  }
  src = src.replace(e.da, () => e.a);
}
const dest = path.resolve(A);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, src);
console.log('toppa applicata: ' + E.length + ' ancore');
console.log('  da:   ' + DA + '   a: ' + dest);
console.log('  delta di file: ' + (src.length - prima) + ' byte');
