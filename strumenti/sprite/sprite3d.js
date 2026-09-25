/* =====================================================================
   SPRITE3D (voce #158) — FIGURE FOTOGRAFICHE AL POSTO DEL RIG.

   Il committente ha giudicato le figure procedurali del rig («fanno
   pena») e ha chiesto personaggi di qualita' realistica, generati con
   Nano Banana. Questo modulo li disegna: un ATLANTE (una sola immagine,
   incorporata come data-URI: il gioco resta un file solo, senza rete)
   con i fotogrammi in griglia, e una seconda immagine con le MASCHERE
   di tinta — R = maglia e calze (bianche nello sprite), G = calzoncini
   (magenta nello sprite, neutralizzati in grigio dalla pipeline).

   LA REGOLA CHE NON SI TOCCA: il disegno non consuma un sorteggio e non
   legge un solo campo dello stato che la simulazione scrive. La partita
   e' identica al bit con o senza sprite (lo verifica _q-determinismo e
   il confronto delle impronte di seme.js); MOTORE_V non cambia.

   COME SI AGGANCIA. Stessa firma di Rig3D.disegna: il chiamante prova
   prima Sprite3D.disegna(...) e, se risponde false (atlante non ancora
   decodificato, clip senza sprite, camera 'bassa'), disegna col rig
   come prima. Per questo il rig RESTA nel file: e' il ripiego onesto,
   non un doppione.

   LA TINTA. Lo sprite e' fotografato in bianco: il gioco ha sedici
   divise piu' i portieri, e due squadre devono restare distinguibili
   (misurato alla voce #151: era il motivo per cui gli sprite «non
   convenivano»). Per ogni look si prepara UNA VOLTA una tela dell'intero
   atlante gia' tinta (colore x luminanza del pixel, cosi' le pieghe
   restano pieghe) e nel fotogramma resta un drawImage. Il costo della
   tela: un passaggio sui pixel dell'atlante, per divisa, alla prima
   figura che la veste — misurato da _q-sprite-costo.

   LA DIREZIONE. Otto settori di 45 gradi, sprite d0..d7: 0 di fronte
   alla camera (il giocatore guarda verso il basso dello schermo), 2 di
   profilo verso destra, 4 di spalle, 6 verso sinistra. Il rig riceve
   yaw = p.ang + RIG_YAW_K (pi/2): qui si toglie la stessa costante e si
   arrotonda al settore. La taratura del verso (specchiato o no) si
   verifica nel provino accanto al rig, non si presume.
   ===================================================================== */
const Sprite3D=(function(){
  'use strict';
  const TAV=__SPRITE_TAV__;
  const SRC='__SPRITE_SRC__';
  const SRCM='__SPRITE_SRCM__';
  let img=null, imgM=null, pronto=false, W=0, H=0, base=null, mas=null, fallito=false;
  const TINTE=new Map();
  /* l'ultima figura disegnata: serve a torso(), che il chiamante legge
     subito dopo per ancorare il numero di maglia (come Rig3D.torso) */
  const ULT={x:0,y:0,h:0,d:0};
  const PI=Math.PI, Q=PI/4;
  /* taratura sul rig: vedi il riquadro in disegna(). 1,08 pareggia
     l'ALTEZZA del rig; ma il rig ha testa e arti gonfiati apposta per
     leggere a 40 px (ARTI CON MASSA, P_DIS), e sullo scatto di partita
     (_158-scatto-partita.js, 25/9) l'uomo fotografico, snello, leggeva
     piu' piccolo accanto alle capsule. 1,15 e' il compromesso: sette
     punti di statura in piu' comprano la leggibilita' sul telefono senza
     cambiare la scala del campo (P_DIS gia' disegna i corpi il 18% piu'
     grandi del fisico). */
  const SCALA=1.15, GIU=0.04;

  function carica(){
    if(img||typeof document==='undefined') return;
    let n=0;
    const fine=function(){
      if(++n<2) return;
      try{
        W=img.naturalWidth; H=img.naturalHeight;
        const c=document.createElement('canvas'); c.width=W; c.height=H;
        const g=c.getContext('2d',{willReadFrequently:true}); g.drawImage(img,0,0);
        base=g.getImageData(0,0,W,H);
        const cm=document.createElement('canvas'); cm.width=W; cm.height=H;
        const gm=cm.getContext('2d',{willReadFrequently:true}); gm.drawImage(imgM,0,0);
        mas=gm.getImageData(0,0,W,H).data;
        pronto=true;
      }catch(e){ fallito=true; pronto=false; }
    };
    const male=function(){ fallito=true; pronto=false; };
    img=new Image(); img.onload=fine; img.onerror=male; img.src=SRC;
    imgM=new Image(); imgM.onload=fine; imgM.onerror=male; imgM.src=SRCM;
  }

  function rgb(h){
    if(!h||typeof h!=='string'||h[0]!=='#') return null;
    if(h.length===4) h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
    if(h.length<7) return null;
    return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  }

  /* LA MASCHERA NERA. I banchi (istantanea, _q-divise, silhouette) chiedono
     al rig la stessa figura con OGNI tinta a nero, per avere la sagoma
     esatta di cio' che e' stato disegnato. Con gli sprite la sagoma e'
     l'alfa dell'atlante: si prepara una volta, nera dove il fotogramma e'
     opaco. Si riconosce dal look: maglia E pelle a nero non e' una divisa
     che esiste, e' la richiesta di una maschera. */
  let NERA=null;
  function nera(){
    if(NERA) return NERA;
    const out=new ImageData(new Uint8ClampedArray(base.data), W, H), d=out.data;
    for(let i=0;i<d.length;i+=4){ d[i]=0; d[i+1]=0; d[i+2]=0; }
    NERA=document.createElement('canvas'); NERA.width=W; NERA.height=H;
    NERA.getContext('2d').putImageData(out,0,0);
    return NERA;
  }
  function eNero(c){ return c==='#000'||c==='#000000'||c==='black'; }

  /* la tela tinta per un look: chiave = le tre tinte + il disegno */
  function tela(look){
    if(look._nero || (eNero(look.maglia) && eNero(look.pelle))) return nera();
    const c1=look.maglia||'#ffffff', c2=look.maglia2||c1, cp=look.pantaloncini||c2, dis=look.disegno||'tinta';
    const k=c1+'|'+c2+'|'+cp+'|'+dis;
    let t=TINTE.get(k); if(t) return t;
    if(TINTE.size>24) TINTE.clear();
    const A0=rgb(c1)||[255,255,255], B=rgb(c2)||A0, P=rgb(cp)||B;
    /* LA MAGLIA SALE DI UN ALTRO 18% VERSO IL BIANCO CALDO, ed e' lo
       stesso bilancio che il rig paga in rigLook (mt(c1,'#fff6e4',0.30)):
       il cancello del contrasto maglia/erba (collaudo.js, 3:1) e' una
       proprieta' della LUMINANZA, e la stoffa fotografica, anche con la
       gamma qui sotto, ne porta meno della tinta piatta. Misurato il
       25/9 sulla copia: con la sola gamma P1 3,02:1 e P2 (rosa) 2,54:1;
       la stoffa sotto il petto sta a L 0,72 e per arrivare a 3:1 sulla
       divisa rosa servono altri dodici punti di luminanza. Il 18% e' il
       minimo che li compra; vale per la sola maglia, i calzoncini restano
       la seconda tinta scurita che li divide dal tronco. */
    const A=[A0[0]+(255-A0[0])*0.18, A0[1]+(246-A0[1])*0.18, A0[2]+(228-A0[2])*0.18];
    const out=new ImageData(new Uint8ClampedArray(base.data), W, H);
    const d=out.data, m=mas, cel=TAV.cella;
    const strisce=(dis==='strisce'), fascia=(dis==='fascia');
    const passo=cel/9;
    for(let i=0,px=0;i<d.length;i+=4,px++){
      if(d[i+3]===0) continue;
      const mm=m[i], mc=m[i+1];
      if(mm<8 && mc<8) continue;
      const r=d[i],g=d[i+1],b=d[i+2];
      let L=(Math.max(r,g,b)+Math.min(r,g,b))*(0.5/235);  // 235: il bianco della maglia in luce piena
      if(L>1) L=1;
      /* LA STOFFA SI SCHIARISCE DI UNA GAMMA (0,72), ed e' una misura,
         non un gusto. La maglia fotografica e' tinta x luminanza del
         tessuto, e il tessuto ha pieghe: sotto il numero (fascia
         0,60-0,65 dell'altezza, dove collaudo.js misura il contrasto
         maglia/erba) la luminanza media e' 147-154 su 235, cioe' L 0,64,
         e il cancello del 3:1 usciva 2,4-2,7:1 su tutte e nove le partite
         (_158-profilo.js e collaudo, 25/9). Con L^0,72 il mezzo tono 0,64
         sale a 0,72 e le pieghe restano pieghe (il rapporto fra luce e
         ombra della stoffa si comprime, non sparisce). Il bianco pieno
         resta 1: la tinta della squadra non cambia, cambia quanto
         ombra la stoffa si porta addosso. */
      L=Math.pow(L,0.72);
      if(mm>=8){
        let C=A;
        if(strisce){ const x=(px%W)%cel; if(((x/passo)|0)&1) C=B; }
        /* LA FASCIA STA SUL PETTO, come nel rig (una banda al 60% del
           segmento pelvi-collo, cioe' 0,68 dell'altezza). Nella cella il
           soggetto va da 0,056 (testa) a 0,944 (piedi): 0,67-0,75 dai
           piedi e' y 0,28-0,35 della cella. La prima stesura (0,30-0,40)
           cadeva a 0,61-0,72 dai piedi, cioe' SULLA finestra con cui
           collaudo.js misura la maglia (0,60-0,65): P2 a fascia usciva
           2,11:1 contro 4,19:1 di P1 a palato — misurava la fascia, non
           la maglia. */
        else if(fascia){ const y=((px/W)|0)%cel; if(y>cel*0.28&&y<cel*0.35) C=B; }
        const w=mm/255;
        d[i]=r+(C[0]*L-r)*w; d[i+1]=g+(C[1]*L-g)*w; d[i+2]=b+(C[2]*L-b)*w;
      }
      if(mc>=8){
        const w=mc/255;
        d[i]=d[i]+(P[0]*L-d[i])*w; d[i+1]=d[i+1]+(P[1]*L-d[i+1])*w; d[i+2]=d[i+2]+(P[2]*L-d[i+2])*w;
      }
    }
    t=document.createElement('canvas'); t.width=W; t.height=H;
    t.getContext('2d').putImageData(out,0,0);
    TINTE.set(k,t); return t;
  }

  function dir(yaw){
    const ang=yaw-PI/2;                       // torna a p.ang (RIG_YAW_K = pi/2)
    let k=Math.round((PI/2-ang)/Q)%8; if(k<0) k+=8; return k;
  }

  /* la statura per corporatura: gli stessi quattro valori del rig
     (CORPI, voce #155) — la cima della testa scala con l'uomo intero */
  const STATURE=__SPRITE_STATURE__;
  function statura(look){
    const c=(look.corp===undefined)?3:(look.corp|0);
    return STATURE[c]||1;
  }

  /* LE CLIP SENZA FOGLIO PRENDONO IN PRESTITO LA PIU' VICINA. Un uomo
     fotografico che per una finta torna omino di capsule e' peggio di
     una finta disegnata come una corsa: in campo le due grafiche NON si
     mescolano mai. La tabella e' dichiaratamente provvisoria — ogni voce
     sparisce quando arriva il suo foglio — e ogni prestito e' scritto qui,
     non nascosto in un ripiego muto. Il rig resta il ripiego solo per
     l'atlante non ancora decodificato e per la camera bassa. */
  const ALIAS={
    filtrante:'passaggio', cross:'tiro', rinvio:'tiro', rovesciata:'tiro',
    finta:'corsa', frenata:'camminata', rimessa:'fermo', testa:'fermo',
    contrasto:'scivolata', tuffo:'scivolata',
    attesaGK:'fermo', parata:'attesaGK', presa:'attesaGK', pugni:'attesaGK', respinta:'attesaGK', sfugge:'attesaGK',
    esultanza:'fermo', cielo:'fermo', ginocchia:'fermo', pugno:'fermo', delusione:'fermo'
  };
  /* le clip in cui si vede quale piede arma: qui il mancino specchia */
  const MANCINE={tiro:1, passaggio:1, filtrante:1, cross:1, rinvio:1, rovesciata:1, scivolata:1, contrasto:1, finta:1};
  function voce(nome){
    let v=TAV.voci[nome], n=0;
    while(!v && ALIAS[nome] && n++<3){ nome=ALIAS[nome]; v=TAV.voci[nome]; }
    return v?{v:v,nome:nome}:null;
  }

  function disegna(ctx,cx,cy,hPx,yaw,nomeCam,nomeClip,tSec,look,senzaOmbra,pxs,filo){
    if(!pronto||nomeCam!=='alto'||!look||!(hPx>0)) return false;
    const vv=voce(nomeClip); if(!vv) return false;
    const v=vv.v;
    let dd=dir(yaw);
    /* IL MANCINO (voce #155) esiste anche qui, e costa uno specchio: i
       fogli sono tutti di destro; per chi arma il sinistro si prende la
       direzione OPPOSTA e la si disegna specchiata — e' la stessa legge
       con cui atlante.py costruisce la seconda meta' del ciclo. Vale per
       le clip in cui il piede che arma si vede; per corsa e camminata lo
       specchio e' gia' dentro il ciclo e non si tocca. */
    const manc=!!look.manc && MANCINE[vv.nome]===1;
    if(manc){ dd=(8-dd)%8; }
    const fr=v[dd]; if(!fr||!fr.length) return false;
    const clip=Rig3D.CLIPS[nomeClip];
    let u=(tSec*(clip?clip.freq:1))%1; if(u<0) u+=1;
    const f=fr[Math.min(fr.length-1,(u*fr.length)|0)];
    const t=tela(look);
    /* LA SCALA RISPETTO AL RIG, MISURATA (strumenti/_158-misura-scala.js,
       25 settembre 2026, provino a hCss 420, clip fermo, quattro
       imbardate): il rig e' alto 429/438/449/465 px contro 417 dello
       sprite, rapporto medio 1,067 — il rig aggiunge alla campata dei
       giunti il raggio della testa e la scarpa. E il suo punto piu' basso
       sta 60-75 px SOTTO l'ancora, perche' a 42 gradi la punta del piede
       rivolta alla camera si proietta in basso (0,25 m x se x s = 0,118
       hPx): il baricentro del rig e' piu' basso. Lo sprite si disegna
       quindi 1,08 volte piu' grande e 0,05 hPx piu' in basso: la meta'
       della differenza di baricentro, perche' i piedi devono restare
       sull'ombra portata che il gioco disegna a cy. */
    const k=hPx*statura(look)*SCALA/f[4];
    const cel=TAV.cella;
    let dx=cx-f[2]*k; const dy=cy+hPx*GIU-f[3]*k, dl=cel*k;
    if(manc){
      /* specchio attorno alla verticale del punto a terra: l'ancora dei
         piedi f[2] va misurata dall'altro lato della cella */
      ctx.save(); ctx.translate(cx,0); ctx.scale(-1,1); ctx.translate(-cx,0);
    }
    if(filo>0){
      /* il filo del comandato: un alone chiaro attorno alla sagoma, la
         stessa funzione del contorno che il rig ingrossa */
      ctx.save(); ctx.shadowColor='rgba(255,255,255,0.95)'; ctx.shadowBlur=filo*2.2*(pxs>0?pxs:1);
      ctx.drawImage(t,f[0]*cel,f[1]*cel,cel,cel,dx,dy,dl,dl);
      ctx.restore();
    }
    ctx.drawImage(t,f[0]*cel,f[1]*cel,cel,cel,dx,dy,dl,dl);
    if(manc) ctx.restore();
    ULT.x=cx; ULT.y=cy+hPx*GIU; ULT.h=f[4]*k; ULT.d=dd;
    return true;
  }

  /* lo stesso contratto di Rig3D.torso(): il segmento pelvi -> collo
     dell'ultima figura, in coordinate del contesto. Sul corpo in piedi
     la pelvi sta a 0,53 dell'altezza e il collo a 0,84 (misurato sui
     fogli nb02: cresta iliaca e base del collo, media delle 8 viste). */
  function torso(){
    /* pelvi a 0,50 e collo a 0,80 dell'altezza: il chiamante mette il
       numero a 0,80 del segmento, cioe' a 0,74 h — il petto alto. Con
       0,53/0,84 il glifo saliva al mento (scatto di partita del 25/9). */
    return {x0:ULT.x, y0:ULT.y-ULT.h*0.50, x1:ULT.x, y1:ULT.y-ULT.h*0.80};
  }

  function stato(){
    const prestiti={}; for(const k in ALIAS){ const vv=voce(k); if(!TAV.voci[k] && vv) prestiti[k]=vv.nome; }
    return {pronto:pronto, fallito:fallito, tinte:TINTE.size, clip:Object.keys(TAV.voci), prestiti:prestiti, cella:TAV.cella};
  }

  return {carica:carica, disegna:disegna, torso:torso, tela:tela, dir:dir, voce:voce, stato:stato, TAV:TAV};
})();
