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
  const SRCK='__SPRITE_SRCK__';     // i capelli, in una terza immagine (vedi atlante.py)
  let img=null, imgM=null, imgK=null, pronto=false, W=0, H=0, base=null, mas=null, fallito=false;
  let PELLE=null, CAPELLI=null, SCR=null;
  const TINTE=new Map();
  /* IL COLORE SORGENTE della pelle e dei capelli nei fogli, misurato
     sull'atlante (media dei pixel sotto le maschere, 25 settembre 2026):
     la pelle si porta al colore dell'uomo (look.pelle, la tavolozza SKIN
     del gioco) MOLTIPLICANDO per il rapporto fra bersaglio e sorgente,
     cosi' l'ombreggiatura del volto resta; i capelli si COPRONO
     all'85% col colore (look.capelli): sono scuri in origine e una
     moltiplicazione non li schiarirebbe mai (il biondo e il grigio della
     tavolozza HAIR esistono). */
  const SORG_PELLE=__SPRITE_SORG_PELLE__;
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
      if(++n<3) return;
      try{
        W=img.naturalWidth; H=img.naturalHeight;
        const c=document.createElement('canvas'); c.width=W; c.height=H;
        const g=c.getContext('2d',{willReadFrequently:true}); g.drawImage(img,0,0);
        base=g.getImageData(0,0,W,H);
        const cm=document.createElement('canvas'); cm.width=W; cm.height=H;
        const gm=cm.getContext('2d',{willReadFrequently:true}); gm.drawImage(imgM,0,0);
        mas=gm.getImageData(0,0,W,H).data;
        const ck=document.createElement('canvas'); ck.width=W; ck.height=H;
        const gk=ck.getContext('2d',{willReadFrequently:true}); gk.drawImage(imgK,0,0);
        const cap=gk.getImageData(0,0,W,H).data;
        /* LE DUE MASCHERE DELLA PERSONA (compito 4): pelle nel canale R e
           capelli nel canale G della seconda immagine, che e' con perdita
           (q 85) perche' una maschera di tinta regge un bordo impreciso e
           senza perdita pesava 352-524 kB. Immagini OPACHE: l'alfa
           premoltiplicato del decodificatore azzererebbe gli altri canali
           dove l'alfa e' zero — successo, e costato tre stesure. Diventano
           due tele bianche con l'alfa della maschera: nel fotogramma si
           usano con destination-in per ritagliare la zona da tingere. Sotto
           24 la maschera vale zero: e' il rumore della compressione. */
        const pd=new ImageData(W,H), kd=new ImageData(W,H);
        for(let i=0;i<mas.length;i+=4){
          const p=cap[i], kk=cap[i+1];
          pd.data[i]=pd.data[i+1]=pd.data[i+2]=255; pd.data[i+3]=p<24?0:p;
          kd.data[i]=kd.data[i+1]=kd.data[i+2]=255; kd.data[i+3]=kk<24?0:kk;
        }
        PELLE=document.createElement('canvas'); PELLE.width=W; PELLE.height=H; PELLE.getContext('2d').putImageData(pd,0,0);
        CAPELLI=document.createElement('canvas'); CAPELLI.width=W; CAPELLI.height=H; CAPELLI.getContext('2d').putImageData(kd,0,0);
        pronto=true;
      }catch(e){ fallito=true; pronto=false; }
    };
    const male=function(){ fallito=true; pronto=false; };
    img=new Image(); img.onload=fine; img.onerror=male; img.src=SRC;
    imgM=new Image(); imgM.onload=fine; imgM.onerror=male; imgM.src=SRCM;
    imgK=new Image(); imgK.onload=fine; imgK.onerror=male; imgK.src=SRCK;
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

  /* LA TINTA DELLA DIVISA, PIXEL PER PIXEL — una funzione sola per la tela
     di squadra (compito 1) e per la cella da vicino (compito 7): d e' il
     buffer RGBA da tingere, mm_ le maschere (R maglia, G calzoncini) con
     lo stesso passo di riga W; cel e' il lato della cella, che serve a
     strisce e fascia per sapere dove sta il pixel DENTRO la cella. */
  function tingi(dd, mm_, W, cel, A, B, P, dis){
    const strisce=(dis==='strisce'), fascia=(dis==='fascia');
    const d=dd, m=mm_;
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
        /* IL PAVIMENTO DELLA MAGLIA (compito 2). Con diciassette clip la
           sonda di collaudo.js, sulle sole pose erette, dava P1 4,7:1 e
           P2 (rosa) 2,8:1; portare la tinta dal 18 al 26% verso il bianco
           ha spostato P2 di 0,02: la sonda misura la STOFFA, non la
           tinta, e la stoffa fotografica sta in media a L 0,75 dopo la
           gamma. Qui la maglia tiene un pavimento: le pieghe vanno da
           0,78 a 1 invece che da 0,5 a 1 — a 50 px la piega si vede
           ancora, la maglia rosa torna sopra il 3:1. I calzoncini restano
           con la sola gamma: sono la massa scura che divide il tronco
           dalle gambe (criterio C5 del #155). */
        const Lm=0.55+0.45*L;
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
        /* COMPITO 2: la fascia sale ancora, a 0,71-0,78 h (y 0,25-0,31 della
           cella). A 0,67-0,75 il suo orlo basso entrava nella finestra
           della sonda (0,60-0,65) quando la statura stimata per foglio
           sbagliava del 5%: in alto contrasto la seconda tinta e' #123a80,
           quasi nera, e P2 restava a 2,74:1 identico al centesimo con due
           tinte di maglia diverse — il segno che la sonda leggeva la
           fascia. Il numero sta a 0,74 h, sopra la fascia come nel rig. */
        else if(fascia){ const y=((px/W)|0)%cel; if(y>cel*0.25&&y<cel*0.31) C=B; }
        const w=mm/255;
        d[i]=r+(C[0]*Lm-r)*w; d[i+1]=g+(C[1]*Lm-g)*w; d[i+2]=b+(C[2]*Lm-b)*w;
      }
      if(mc>=8){
        const w=mc/255;
        d[i]=d[i]+(P[0]*L-d[i])*w; d[i+1]=d[i+1]+(P[1]*L-d[i+1])*w; d[i+2]=d[i+2]+(P[2]*L-d[i+2])*w;
      }
    }

  }

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
       divisa rosa servono altri dodici punti di luminanza. Il 18% li
       comprava con sei clip (P2 3,02:1, sul filo); con diciassette clip e
       la sonda sulle sole pose erette P2 e' sceso a 2,78:1 (P1 4,66) —
       le celle dei fogli 4x4 portano piu' ombra sulla stoffa. Al 26% il
       rosa risale sopra il 3:1 (rimisurato); vale per la sola maglia, i
       calzoncini restano la seconda tinta scurita che li divide dal
       tronco. */
    /* LA SCHIARITURA E' ADATTIVA (compito 2): piu' la tinta e' scura, piu'
       sale — 26% su un bianco, fino al 46% su un nero. Con la sonda sulle
       pose erette e il pavimento della stoffa, la maglia ROSA passava
       (3,01:1) e il BLU dell'alto contrasto (#123a80, la modalita' per chi
       distingue male i colori) restava a 2,74:1: il modo pensato per la
       leggibilita' era il meno leggibile. Y e' la luminanza relativa
       della tinta (BT.709 su sRGB linearizzato). */
    const Yk=(function(c){ const f=v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); })(A0);
    const mix=0.26+0.20*(1-Math.min(1,Yk/0.6));
    const A=[A0[0]+(255-A0[0])*mix, A0[1]+(246-A0[1])*mix, A0[2]+(228-A0[2])*mix];
    const out=new ImageData(new Uint8ClampedArray(base.data), W, H);
    tingi(out.data, mas, W, TAV.cella, A, B, P, dis);
    /* LA TELA DELLA SQUADRA E' IN SOLA LETTURA. Il compito 4 aveva provato
       a comporre le figure con pelle e capelli in slot in coda a questa
       tela: ogni scrittura la invalidava e le ventidue figure che la
       rileggono a ogni fotogramma la ricaricavano intera (15 MB) —
       prestazione --contro HEAD: fotogramma medio +225%, tipico +343%,
       p95 +637% (26 settembre 2026). Qui si scrive una volta sola. */
    t=document.createElement('canvas'); t.width=W; t.height=H;
    t.getContext('2d').putImageData(out,0,0);
    TINTE.set(k,t); return t;
  }

  /* =====================================================================
     L'OMBRA PORTATA DELLO SPRITE (voce #158, compito 6).

     IL DIFETTO: drawOmbreGiocatori gettava a terra lo SCHELETRO del rig
     (Rig3D.ombraTraccia) anche quando il corpo in piedi era lo sprite —
     nello scatto di partita l'ombra aveva le braccia alzate e l'uomo
     correva. Qui l'ombra e' la SAGOMA DEL FOTOGRAMMA che il corpo
     disegnera', proiettata sul manto lungo il sole con la stessa
     geometria del rig: il chiamante ha gia' ruotato la tela perche' il
     sole corra lungo +X (ombraGeometria), e passa C e S di quella
     rotazione, perMetro (unita' di manto per metro di quota) e r (la
     riduzione in quota). La trasformazione affine manda ogni pixel della
     cella (px,py) in
        (X,Y) + (px-f2)·k·(C,-S)  +  (f3-py)·m·(1,0)
     cioe' l'asse orizzontale dello sprite resta l'asse x del manto (nel
     riferimento ruotato e' (C,-S)) e l'asse verticale — la QUOTA — si
     stende lungo il sole: una figura alta 1,83 m getta esattamente
     `lung` unita', come la capsula e come lo scheletro (perMetro =
     lung/1,83). La statura del rig, non la SCALA 1,15 di leggibilita':
     il riquadro d'esclusione di collaudo.js copre 2,34 m di quota e le
     mani alzate della presa arrivano a 1,83·1,31 = 2,4 m, come quelle
     del rig.

     LO SPESSORE. Lo sprite non ha profondita': quel che nel rig e' il
     passo delle gambe lungo y qui e' letto come quota. Per non gettare
     una lama la sagoma viene INGRASSATA una volta per tutte nella tela
     dell'ombra (vedi telaOmbra), e per figura resta un drawImage con
     l'alfa del chiamante (a·OMA, il valore che tiene l'erba in ombra
     sopra lo 0,18 con cui istantanea.js la riconosce ancora come prato).

     LA TELA DELL'OMBRA e' l'atlante a META' risoluzione riempito con la
     tinta d'ombra del gioco (OMBRA_TINTA, «erba col cielo dentro»: mai
     nero puro, il contratto di SOLE), costruita una volta: 5 MB invece
     di 21, e l'ombra e' comunque schiacciata e sfumata. Il mancino
     specchia come in disegna(). Risponde false — e il chiamante getta lo
     scheletro — se l'atlante non e' pronto, se la clip non c'e', o se il
     sole corre quasi esattamente lungo x dello schermo (|S|<0,03): li'
     la matrice degenera e drawImage non disegnerebbe niente.
     ===================================================================== */
  let OMBRA=null, OMBRA_TINTA_K='', OMBRA_Q=0.5;
  function telaOmbra(tinta){
    if(OMBRA && OMBRA_TINTA_K===tinta) return OMBRA;
    if(!img) return null;
    const w=Math.max(1,Math.round(W*OMBRA_Q)), h=Math.max(1,Math.round(H*OMBRA_Q));
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const g=c.getContext('2d');
    /* LA SAGOMA SI INGRASSA DI TRE PIXEL (sei dell'atlante, ~0,13 m)
       in tutte le direzioni: lo sprite e' una lama senza profondita', e
       un braccio largo otto pixel gettava un filo. Con l'ingrasso un arto
       porta a terra ~5 unita' di manto, vicino alle 6,6 della capsula del
       rig (OMBRA_LARG); i vuoti fra le gambe si chiudono e il bordo esce
       morbido, che per un'ombra e' un pregio. Nove disegni UNA volta,
       poi un drawImage per figura: la prima stesura faceva tre copie per
       figura ad alfa ridotta e usciva slavata — misurato con la prova
       isolata: 97 pixel scuri, contro migliaia. */
    for(let dy=-3;dy<=3;dy+=3) for(let dx=-3;dx<=3;dx+=3) g.drawImage(img,dx,dy,w,h);
    g.globalCompositeOperation='source-in'; g.fillStyle=tinta||'rgb(14,38,32)'; g.fillRect(0,0,w,h);
    OMBRA=c; OMBRA_TINTA_K=tinta; return c;
  }
  function ombra(ctx,X,Y,hPx,yaw,nomeClip,tSec,look,C,S,perMetro,r,semi,tinta){ /* semi: riservato (larghezza della capsula del chiamante) */
    if(!pronto||!look||!(hPx>0)||!(perMetro>0)) return false;
    if(Math.abs(S)<0.03) return false;
    const vv=voce(nomeClip); if(!vv) return false;
    const v=vv.v;
    let dd=dir(yaw);
    const manc=!!look.manc && MANCINE[vv.nome]===1;
    if(manc){ dd=(8-dd)%8; }
    const fr=v[dd]; if(!fr||!fr.length) return false;
    const clip=Rig3D.CLIPS[nomeClip];
    let u=(tSec*(clip?clip.freq:1))%1; if(u<0) u+=1;
    const f=fr[Math.min(fr.length-1,(u*fr.length)|0)];
    const t=telaOmbra(tinta); if(!t) return false;
    const st=statura(look), cel=TAV.cella, q=OMBRA_Q;
    const rr=(r>0?r:1);
    /* LA LARGHEZZA E' 1,7 VOLTE QUELLA DISEGNATA: il billboard non ha
       profondita' — il passo delle gambe lungo y, le spalle di traverso —
       e col sole quasi lungo x la sagoma si stendeva in un filo
       (ombra-confronto.png, prima stesura: un'asta accanto ai blocchi
       dello scheletro, che porta 6,6 unita' di tratto per arto). Il
       fattore e' tarato a occhio su quel confronto, con l'ingrasso di
       telaOmbra: non muove ne' la lunghezza ne' la direzione, che sono
       le due cose che istantanea.js misura. */
    const k=hPx*st*SCALA/f[4]*rr*1.7;             // unita' di manto per px di cella, sulla trasversale
    const m=1.83*st*perMetro*rr/f[4];             // unita' lungo il sole per px di quota
    const sx=manc?-1:1;
    const A=k*sx*C, B=-k*sx*S, Cc=-m, Dd=0;
    const E0=-f[2]*k*sx*C+f[3]*m, F0=f[2]*k*sx*S;
    /* sempre RELATIVO alla trasformazione del chiamante (camera, DPR e la
       rotazione del sole): mai setTransform, che la butterebbe via.
       L'alfa e' quella del chiamante (a·OMA), la stessa dello scheletro:
       una copia sola, niente sovrapposizioni che scuriscano il nucleo
       sotto lo 0,18 del prato. */
    ctx.save();
    ctx.transform(A,B,Cc,Dd,X+E0,Y+F0);
    ctx.drawImage(t,f[0]*cel*q,f[1]*cel*q,cel*q,cel*q,0,0,cel,cel);
    ctx.restore();
    return true;
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
    /* ANCHE LA CAMERA BASSA (compito 3): i rigori e la ripresa del gol
       stanno a 16 gradi di elevazione, e i fogli sono fotografati a
       ~22: e' la camera a cui lo sprite somiglia DI PIU', non di meno.
       Il rig normalizza l'altezza a hPx in tutte e due le camere
       (s = hPx/(1,9·ce)), quindi la stessa scala vale qui. Il prezzo
       dichiarato: in primo piano la figura arriva a 200-300 px e la cella
       ne ha 128 di statura — si ingrandisce di 1,5-2,5 volte, e si vede
       morbida. Un secondo atlante a 192 px costerebbe +2 MB: e' un
       compito suo, se il committente lo chiede. */
    if(!pronto||(nomeCam!=='alto'&&nomeCam!=='bassa')||!look||!(hPx>0)) return false;
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
    const f0=fr[Math.min(fr.length-1,(u*fr.length)|0)];
    /* A CAMERA BASSA LA CELLA DA VICINO, se c'e' ed e' pronta (compito 7):
       stessa voce, stesso fotogramma, ancora e statura della tavola a 192.
       La prima richiesta avvia la decodifica e disegna la cella da 144. */
    let f=f0, T=TAV, c2=null;
    if(nomeCam==='bassa' && TAV2){
      if(!pronto2){ if(!fallito2) carica2(); }
      else{
        const v2=TAV2.voci[vv.nome], fr2=v2&&v2[dd];
        const f2=fr2&&fr2[Math.min(fr2.length-1,(u*fr2.length)|0)];
        if(f2){ c2=cella2(f2,look); if(c2){ f=f2; T=TAV2; } }
      }
    }
    const t=c2?null:tela(look);
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
    const cel=T.cella;
    let dx=cx-f[2]*k; const dy=cy+hPx*GIU-f[3]*k, dl=cel*k;
    if(!senzaOmbra){
      /* L'OMBRA DI CONTATTO, solo dove il chiamante la chiede (la ripresa
         del gol: in pianta la fa drawOmbreGiocatori e qui arriva
         senzaOmbra). Un'ellisse morbida ai piedi, nella tinta d'ombra del
         gioco (14·38·32, «erba col cielo dentro», il contratto di SOLE:
         mai nero puro), larga poco meno di un uomo e schiacciata dalla
         camera bassa. */
      const rw=hPx*0.34, rh=hPx*0.085;
      ctx.save();
      const gr=ctx.createRadialGradient(cx,cy+hPx*GIU,rh*0.2,cx,cy+hPx*GIU,rw);
      gr.addColorStop(0,'rgba(14,38,32,0.55)'); gr.addColorStop(1,'rgba(14,38,32,0)');
      ctx.fillStyle=gr;
      ctx.beginPath(); ctx.ellipse(cx,cy+hPx*GIU,rw,rh,0,0,6.2832); ctx.fill();
      ctx.restore();
    }
    if(manc){
      /* specchio attorno alla verticale del punto a terra: l'ancora dei
         piedi f[2] va misurata dall'altro lato della cella */
      ctx.save(); ctx.translate(cx,0); ctx.scale(-1,1); ctx.translate(-cx,0);
    }
    if(filo>0){
      /* il filo del comandato: un alone chiaro attorno alla sagoma, la
         stessa funzione del contorno che il rig ingrossa */
      ctx.save(); ctx.shadowColor='rgba(255,255,255,0.95)'; ctx.shadowBlur=filo*2.2*(pxs>0?pxs:1);
      if(c2) ctx.drawImage(c2,0,0,cel,cel,dx,dy,dl,dl);
      else ctx.drawImage(t,f[0]*cel,f[1]*cel,cel,cel,dx,dy,dl,dl);
      ctx.restore();
    }
    /* LA PERSONA SOPRA LA DIVISA (compito 4): pelle e capelli di QUESTO
       uomo, dallo slot in cache che tiene la figura intera; senza pelle
       ne' capelli (banchi, look nero della maschera) si disegna la divisa
       dall'atlante tinto. Tutto dentro lo stesso specchio del mancino. */
    let pc=null;
    if(c2) pc=c2;     // da vicino la persona e' gia' dentro la cella
    else if((look.pelle||look.capelli) && !look._nero && !eNero(look.maglia)) pc=persona(t,f,look);
    if(pc) ctx.drawImage(pc,0,0,cel,cel,dx,dy,dl,dl);
    else ctx.drawImage(t,f[0]*cel,f[1]*cel,cel,cel,dx,dy,dl,dl);
    if(manc) ctx.restore();
    ULT.x=cx; ULT.y=cy+hPx*GIU; ULT.h=f[4]*k; ULT.d=dd;
    return true;
  }

  /* la tela di lavoro grande come una cella, una sola per tutto il gioco */
  function scratch(){
    if(!SCR){ SCR=document.createElement('canvas'); SCR.width=TAV.cella; SCR.height=TAV.cella; }
    return SCR;
  }
  /* il colore che, MOLTIPLICATO alla pelle sorgente, da' la pelle voluta:
     ogni canale al piu' 1 (una moltiplicazione non schiarisce; la
     sorgente e' gia' una pelle chiara, quindi la tavolozza ci sta) */
  function rapporto(hex){
    const c=rgb(hex); if(!c) return null;
    const r=Math.min(255,Math.round(255*c[0]/SORG_PELLE[0]));
    const g=Math.min(255,Math.round(255*c[1]/SORG_PELLE[1]));
    const b=Math.min(255,Math.round(255*c[2]/SORG_PELLE[2]));
    return 'rgb('+r+','+g+','+b+')';
  }
  /* tinge UNA zona del fotogramma DENTRO la tela `dst`: copia il fotogramma
     tinto della squadra sulla tela di lavoro, applica il colore col modo
     chiesto, ritaglia con la maschera della zona e somma il ritaglio a
     dst. Otto operazioni su 144x144 pixel. */
  function zona(dst,ox,oy,t,maschera,f,modo,colore,alfa){
    if(!colore||!maschera) return;
    const cel=TAV.cella;
    zonaG(dst,ox,oy, t,f[0]*cel,f[1]*cel, maschera,f[0]*cel,f[1]*cel, cel, modo,colore,alfa, scratch());
  }
  /* la stessa cosa, con sorgente, maschera, lato e tela di lavoro
     dichiarati: la usa anche la cella da vicino (compito 7), che non ha
     una tela grande da cui ritagliare */
  function zonaG(dst,ox,oy, src,sx,sy, maschera,mx,my, cel, modo,colore,alfa, s){
    if(!colore||!maschera) return;
    const g=s.getContext('2d');
    g.globalCompositeOperation='source-over'; g.globalAlpha=1; g.clearRect(0,0,cel,cel);
    g.drawImage(src,sx,sy,cel,cel,0,0,cel,cel);
    if(modo==='multiply'){
      /* PRIMA SI APPIATTISCE, POI SI TINGE. La pelle fotografata ha
         riflessi a 240 e ombre a 120: moltiplicati per il rapporto di una
         carnagione scura restano a 144 e 72, e a 50 px il volto legge a
         chiazze (persone.png del 25/9, tono 3 e 6). Una velatura del
         colore sorgente al 45% comprime il contrasto della pelle verso il
         suo medio senza toccare l'ombra grande del volto; poi la
         moltiplicazione porta il medio al colore voluto. */
      g.globalCompositeOperation='source-atop'; g.globalAlpha=0.45;
      g.fillStyle='rgb('+SORG_PELLE[0]+','+SORG_PELLE[1]+','+SORG_PELLE[2]+')'; g.fillRect(0,0,cel,cel);
      g.globalAlpha=1;
      g.globalCompositeOperation='multiply'; g.fillStyle=colore; g.fillRect(0,0,cel,cel);
      g.globalCompositeOperation='destination-in'; g.drawImage(maschera,mx,my,cel,cel,0,0,cel,cel);
    }else{
      g.globalCompositeOperation='destination-in'; g.drawImage(maschera,mx,my,cel,cel,0,0,cel,cel);
      g.globalCompositeOperation='source-atop'; g.globalAlpha=alfa; g.fillStyle=colore; g.fillRect(0,0,cel,cel);
      g.globalAlpha=1;
    }
    g.globalCompositeOperation='source-over';
    dst.getContext('2d').drawImage(s,ox,oy);
  }

  /* LO STRATO PERSONA, IN CACHE (compito 4). Senza cache pelle e capelli
     costavano 930 µs a figura in Chromium senza GPU (misurato,
     _158-costo-tinta.js: da 7 a 930): ventidue figure sono 20 ms, piu'
     del fotogramma. Lo strato (pelle tinta + capelli tinti, gia' composti
     e ritagliati) si costruisce alla prima richiesta di una terna
     fotogramma|pelle|capelli e resta in una LRU di 400 tele da 144 px
     (33 MB al massimo): un giocatore che corre in una direzione usa 4
     fotogrammi, e dopo il primo ciclo sono tutti colpi. Le tele sfrattate
     tornano in un mucchio e si riusano: niente allocazioni a regime. */
  /* UNA TELA SOLA A SLOT, non quattrocento tele piccole: Chrome tiene in
     CPU le tele sotto 256x256 e ogni drawImage verso la tela di gioco (in
     GPU) le ricarica — misurato 207 µs a figura anche a cache piena,
     contro 7 della sola divisa. Con gli strati dentro una tela da
     2304x2304 (16x16 slot da 144) il disegno torna una copia GPU->GPU. */
  /* LA PERSONA, UNA PICCOLA TELA PER GIOCATORE (compito 4). Il look di un
     uomo e' un oggetto stabile (la cache di rigLook ne tiene uno per
     divisa+pelle+capelli+taglio+corporatura): gli si lega una tela da una
     cella, dove sta la sua figura intera — divisa, pelle portata al suo
     colore, capelli — RICOMPOSTA SOLO quando cambia il fotogramma (ogni
     ~100 ms per chi corre), e disegnata com'e' negli altri fotogrammi.
     Le scritture toccano solo questa tela piccola; la tela di squadra
     resta in sola lettura (vedi tela()): e' la differenza fra +225% e
     un costo che prestazione puo' assorbire. Due uomini con lo STESSO look
     e fotogrammi diversi si contendono la tela e si ricompongono a turno:
     e' una degradazione, non un errore, e rigLook li rende rari (la chiave
     porta anche il seme del braccio). */
  const PERSONE=new WeakMap(); let PERSONE_N=0, RICOMP=0;
  const P_TELE=6;     // tele per look: un ciclo di corsa ha 4 fotogrammi, e cambiando direzione se ne tengono due di scorta
  /* CHE COSA VALE LA PENA RITINGERE. La pelle sorgente e' chiara (SORG_PELLE):
     le due carnagioni chiare della tavolozza le somigliano e la
     moltiplicazione non le sposterebbe (rapporto ~1): si salta. I capelli
     sorgente sono castano scuro (55,48,37): i quattro colori scuri della
     tavolozza HAIR a 50 px non si distinguono da loro: si salta. Restano
     da comporre le carnagioni medie e scure e i capelli rossi e grigi —
     circa un uomo su due, e per gli altri la figura e' la divisa com'e'. */
  function pelleDaFare(hex){
    const c=rgb(hex); if(!c) return false;
    return (c[0]/SORG_PELLE[0]+c[1]/SORG_PELLE[1]+c[2]/SORG_PELLE[2])/3 < 0.93;
  }
  function capelliDaFare(hex){
    const c=rgb(hex); if(!c) return false;
    return (c[0]+c[1]+c[2]) > 3*70 || Math.abs(c[0]-c[2]) > 70;
  }
  function persona(t,f,look){
    if(!PELLE||!CAPELLI) return null;
    const pelle=look.pelle && !eNero(look.pelle) && pelleDaFare(look.pelle);
    const capelli=look.capelli && !eNero(look.capelli) && capelliDaFare(look.capelli);
    if(!pelle && !capelli) return null;
    const cel=TAV.cella;
    let e=PERSONE.get(look);
    if(!e){ e={tele:new Map()}; PERSONE.set(look,e); PERSONE_N++; }
    const k=f[0]+','+f[1]+'|'+(look.maglia||'')+'|'+(look.maglia2||'')+'|'+(look.pantaloncini||'')+'|'+(look.disegno||'');
    let c=e.tele.get(k);
    if(c){ e.tele.delete(k); e.tele.set(k,c); return c; }
    if(e.tele.size>=P_TELE){ const v=e.tele.keys().next().value; c=e.tele.get(v); e.tele.delete(v); }
    else { c=document.createElement('canvas'); c.width=c.height=cel; }
    const g=c.getContext('2d'); g.globalCompositeOperation='source-over'; g.globalAlpha=1; g.clearRect(0,0,cel,cel);
    g.drawImage(t,f[0]*cel,f[1]*cel,cel,cel,0,0,cel,cel);
    if(pelle) zona(c,0,0,t,PELLE,f,'multiply',rapporto(look.pelle),1);
    if(capelli) zona(c,0,0,t,CAPELLI,f,'source-atop',look.capelli,0.85);
    e.tele.set(k,c); RICOMP++;
    return c;
  }

  /* =====================================================================
     L'ATLANTE DA VICINO (voce #158, compito 7).

     In pianta la figura e' alta 40-90 px e la cella da 144 (statura 128)
     basta. A camera bassa — i rigori, la ripresa del gol — arriva a
     200-300 px: la stessa cella si ingrandisce di 1,5-2,5 volte e si
     vede morbida (prezzo dichiarato al compito 3). Qui c'e' un SECONDO
     atlante, celle da 192 (statura 170), con le stesse voci e gli stessi
     fotogrammi (TAV2 ha ancore e stature sue: la toppa lo porta da
     fuori/sprite/atlante192 con --vicino), usato SOLO dalla camera bassa.

     COSTA MEMORIA, e la memoria si tiene corta per costruzione:
       - le tre immagini si decodificano alla PRIMA richiesta a camera
         bassa (carica2), non all'avvio: una partita senza gol ne' rigori
         non le tocca; finche' non sono pronte disegna la cella da 144;
       - NESSUNA tela di squadra a 192: a 3072x3072 sarebbero 37 MB per
         divisa, tre divise 113 MB, su un telefono Android 10. La tinta si
         fa PER CELLA, con la stessa funzione tingi() della tela grande,
         sui 37.000 pixel del fotogramma che serve, e la figura intera
         (divisa + pelle + capelli di QUEST'uomo) finisce in una tela da
         192 px in una LRU di 96 (14 MB al massimo). Una ripresa mostra
         sei-otto uomini per una decina di fotogrammi l'uno: dopo il primo
         passaggio sono tutti colpi.
     Il resto del disegno (scala, ancora, specchio del mancino, torso per
     il numero) e' lo stesso di disegna(): cambia solo da quale tavola
     vengono cella, ancora e statura.
     ===================================================================== */
  const TAV2=__SPRITE_TAV2__;
  const SRC2='__SPRITE_SRC2__', SRCM2='__SPRITE_SRCM2__', SRCK2='__SPRITE_SRCK2__';
  let img2=null, imgM2=null, imgK2=null, pronto2=false, fallito2=false, chiesto2=false, SCR2=null;
  const CELLE2=new Map(); const C2_MAX=96; let COMP2=0;
  function carica2(){
    if(chiesto2||!TAV2||typeof document==='undefined') return; chiesto2=true;
    let n=0;
    const fine=function(){ if(++n<3) return; pronto2=true; };
    const male=function(){ fallito2=true; };
    img2=new Image(); img2.onload=fine; img2.onerror=male; img2.src=SRC2;
    imgM2=new Image(); imgM2.onload=fine; imgM2.onerror=male; imgM2.src=SRCM2;
    imgK2=new Image(); imgK2.onload=fine; imgK2.onerror=male; imgK2.src=SRCK2;
  }
  function scratch2(){
    if(!SCR2){ SCR2=document.createElement('canvas'); SCR2.width=SCR2.height=TAV2.cella; }
    return SCR2;
  }
  /* una tela con l'alfa di UN canale della cella delle maschere (R pelle,
     G capelli): la stessa cosa che carica() prepara per l'atlante intero */
  function mascheraCella(kk, canale, cel){
    const im=new ImageData(cel,cel), d=im.data;
    for(let i=0;i<d.length;i+=4){ const v=kk[i+canale]; d[i]=d[i+1]=d[i+2]=255; d[i+3]=v<24?0:v; }
    const c=document.createElement('canvas'); c.width=c.height=cel; c.getContext('2d').putImageData(im,0,0);
    return c;
  }
  function cella2(f,look){
    if(!pronto2) return null;
    const nero=!!look._nero || (eNero(look.maglia) && eNero(look.pelle));
    const k=f[0]+','+f[1]+'|'+(nero?'NERA':(look.maglia||'')+'|'+(look.maglia2||'')+'|'+(look.pantaloncini||'')+'|'+(look.disegno||'')+'|'+(look.pelle||'')+'|'+(look.capelli||''));
    let c=CELLE2.get(k);
    if(c){ CELLE2.delete(k); CELLE2.set(k,c); return c; }
    const cel=TAV2.cella, sx=f[0]*cel, sy=f[1]*cel;
    const s=scratch2(), g=s.getContext('2d',{willReadFrequently:true});
    g.globalCompositeOperation='source-over'; g.globalAlpha=1;
    g.clearRect(0,0,cel,cel); g.drawImage(img2,sx,sy,cel,cel,0,0,cel,cel);
    const im=g.getImageData(0,0,cel,cel), d=im.data;
    if(nero){
      for(let i=0;i<d.length;i+=4){ d[i]=0; d[i+1]=0; d[i+2]=0; }
    }else{
      g.clearRect(0,0,cel,cel); g.drawImage(imgM2,sx,sy,cel,cel,0,0,cel,cel);
      const m=g.getImageData(0,0,cel,cel).data;
      const c1=look.maglia||'#ffffff', c2=look.maglia2||c1, cp=look.pantaloncini||c2, dis=look.disegno||'tinta';
      const A0=rgb(c1)||[255,255,255], B=rgb(c2)||A0, P=rgb(cp)||B;
      const Yk=(function(c){ const fn=v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}; return 0.2126*fn(c[0])+0.7152*fn(c[1])+0.0722*fn(c[2]); })(A0);
      const mix=0.26+0.20*(1-Math.min(1,Yk/0.6));
      const A=[A0[0]+(255-A0[0])*mix, A0[1]+(246-A0[1])*mix, A0[2]+(228-A0[2])*mix];
      tingi(d, m, cel, cel, A, B, P, dis);
    }
    c=document.createElement('canvas'); c.width=c.height=cel;
    c.getContext('2d').putImageData(im,0,0);
    if(!nero){
      const pelle=look.pelle && !eNero(look.pelle) && pelleDaFare(look.pelle);
      const capelli=look.capelli && !eNero(look.capelli) && capelliDaFare(look.capelli);
      if(pelle||capelli){
        g.clearRect(0,0,cel,cel); g.drawImage(imgK2,sx,sy,cel,cel,0,0,cel,cel);
        const kk=g.getImageData(0,0,cel,cel).data;
        /* la figura tinta e' la sorgente di se' stessa: zonaG la legge da
           una copia e risomma la zona tinta sulla tela c */
        const copia=document.createElement('canvas'); copia.width=copia.height=cel; copia.getContext('2d').drawImage(c,0,0);
        if(pelle) zonaG(c, copia,0,0, mascheraCella(kk,0,cel),0,0, cel, 'multiply', rapporto(look.pelle), 1, s);
        if(capelli) zonaG(c, copia,0,0, mascheraCella(kk,1,cel),0,0, cel, 'source-atop', look.capelli, 0.85, s);
      }
    }
    if(CELLE2.size>=C2_MAX){ const v=CELLE2.keys().next().value; CELLE2.delete(v); }
    CELLE2.set(k,c); COMP2++;
    return c;
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
    return {pronto:pronto, fallito:fallito, tinte:TINTE.size, persone:PERSONE_N, ricomposizioni:RICOMP, clip:Object.keys(TAV.voci), prestiti:prestiti, cella:TAV.cella,
            vicino:{tavola:!!TAV2, chiesto:chiesto2, pronto:pronto2, fallito:fallito2, celle:CELLE2.size, composte:COMP2, cella:TAV2?TAV2.cella:0}};
  }

  return {carica:carica, disegna:disegna, ombra:ombra, torso:torso, tela:tela, dir:dir, voce:voce, stato:stato, TAV:TAV,
          persona:persona};
})();
