/* =====================================================================
   _t-retropassaggio.js -- IL PORTIERE RIFIUTA IL RETROPASSAGGIO (voce
   #107, compito 2, secondo compito del ramo voce-107-regole-leva-corta).

   IL PERCHE'. tentaPresa (CALCETTO-il-gioco.html ~18880) non consulta
   mai b.lastTouch: un compagno puo' sempre passare indietro col piede e
   il portiere raccoglie con le mani, senza nessun controllo su chi/come
   e' arrivato il pallone (mandato SS6.5/App. D). Il banco
   strumenti/_q-regole.js (compito 1) porta gia' la prova 3. RETRO-PRESA,
   nata ROSSA: un compagno passa col piede (kickBall) e la presa avviene
   comunque.

   LA CURA, IN DUE PARTI.

   1. LA BANDIERA b.toccoPiede. Il pallone non sapeva MAI se l'ultimo
      tocco fosse un calcio di piede o un colpo di testa/mani/corpo:
      segnaTocco scriveva solo CHI, mai COME. Ora segnaTocco(pi, piede)
      scrive anche b.toccoPiede = !!piede, e CENSISCE (grep fatto prima
      di scrivere questo attrezzo: "segnaTocco(" compare 18 volte nel
      file, 1 e' la dichiarazione e 17 sono chiamate) OGNI chiamante:

        true  (e' un piede)      -- kickBall (l'imbuto vero di ogni
          calcio, battute comprese: la rimessa e' retropassabile per
          davvero, App. D, non e' un'eccezione), il calcio d'inizio
          (resetKickoff), il contrasto in piedi (contrastoPasso, "il
          piede teso"), lo strappo/scarto/suola (provaStrappo, "un
          piede che tocca di lato"), la scivolata che spazza
          (checkSlideContact, la gamba distesa), il primo tocco -- sia
          pulito sia sporco -- di chi riceve (updateBall, sezione
          RACCOLTA: esplicitamente "il portiere ne e' fuori"), la posa
          della rimessa e dell'angolo (posaBattuta/posaBattutaAngolo:
          il pallone e' gia' ai piedi del battitore), il tiro del
          duello rigore/punizione (CHI TIRA, SEGNA) e l'hook di test
          forceGoal (finge un tocco di piede, per coerenza col resto).

        false (NON e' un piede)  -- colpoDiTesta (il colpo di testa),
          il furto col corpo nel dribbling e il rimpallo sul corpo di
          un tiro forte (updateBall: i due commenti originali dicono
          gia' "col corpo", non "di piede"), tentaPresa stesso (le
          mani/il corpo del portiere: presa, pugni, sfugge, respinta
          sono TUTTI gesti di mano), rinvioPortiere (parte dalle mani,
          anche se l'animazione e' un calcio) e la posa del rinvio dal
          fondo (posaBattutaRinvio: "la palla torna fra le mani del
          portiere", per suo stesso commento).

      La bandiera si scrive DENTRO segnaTocco, a OGNI chiamata: cosi'
      non puo' restare stantia da un tocco precedente (la lezione di
      hitPosts/crossTo, voce #88, gia' citata nel commento di tentaPresa
      per lo stesso motivo). Zero dado() nuovi: sono 17 booleani scelti
      dalla NATURA del gesto che ogni chiamante gia' descrive nei suoi
      stessi commenti, non un sorteggio.

   2. LA PRESA CHE LEGGE. tentaPresa nega le mani (niente presa, pugni,
      sfugge, respinta) se b.toccoPiede===true E l'ultimo toccatore e'
      un COMPAGNO del portiere (G.players[b.lastTouch].team===p.team,
      mai il portiere stesso: un compagno e' un ALTRO giocatore). Il
      colpo di testa di un compagno e il tocco di un avversario restano
      leciti apposta -- i due controlli discriminanti RETRO-TESTA e
      RETRO-AVVERSARIO del banco.
      IL PORTIERE NON DIVENTA UN BUCO, E NON DIVENTA UNA MANO TRAVESTITA
      DA PIEDE (rilievo emerso SOLO misurando: la prima stesura lasciava
      la negazione come un return nudo, confidando nella sezione RACCOLTA
      generica di updateBall -- che non esclude mai il ruolo gk -- per
      dare al portiere un controllo col piede. Sul banco RETRO-PRESA
      restava ROSSA: il pallone finiva comunque posseduto da lui,
      "presa" per il tracciamento del banco (t.ball.owner===gkIdx) anche
      se con un piede invece che con le mani -- lo stesso esito che il
      mandato vieta, MAPPA-MANDATO.md riga 72: "il portiere puo' SOLO
      parare/respingere coi piedi, NON afferrare". Afferrare-con-un-piede
      e' comunque afferrare). LA CURA VERA: tentaPresa, quando nega,
      RESPINGE come un corpo qualunque (stessa fisica del rimpallo sul
      corpo generico di updateBall ~18404, riscritta sul raggio vero del
      portiere perche' quel ramo scatta solo sopra sp>420) -- il pallone
      rimbalza via, vivo, MAI posseduto, e b.lastTouch NON cambia (resta
      il compagno: se diventasse il portiere, il fotogramma successivo lo
      troverebbe "toccato da se stesso" e la presa tornerebbe lecita
      un istante dopo). Nessun kickCd nuovo: il ramo gira ogni fotogramma
      finche' il pallone e' a portata, e siccome tentaPresa (dentro
      updateKeeper, dentro updatePlayer) gira PRIMA di updateBall a ogni
      fotogramma (vedi step()), ricaccia il pallone appena fuori dal
      cerchio della raccolta (KICK_R*0.8=20,8 contro P_R+B_R=21) prima
      che quella sezione abbia mai la possibilita' di leggerlo. "Il
      portiere puo' sempre giocarla coi piedi" resta vero altrove nel
      file (un compagno, un avversario, un pallone libero qualunque):
      qui, sotto embargo, e' semplicemente un respingente, non un
      ricevitore -- la lettera del mandato, non un'estensione comoda.

   uso:  node strumenti/_t-retropassaggio.js --out fuori/retropassaggio.html
         node strumenti/_t-retropassaggio.js --dentro
   ===================================================================== */
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const haFlag = n => process.argv.indexOf('--' + n) > 0;
const inFile = path.resolve(RADICE, arg('in', 'CALCETTO-il-gioco.html'));
const outFile = haFlag('dentro') ? inFile : path.resolve(RADICE, arg('out', 'fuori/retropassaggio.html'));

const ANCORE = [

{
  nome: 'A -- G.ball: nasce con toccoPiede (default false, come lastTouch=-1)',
  cerca:
`  G.ball = { x:FW/2, y:FH/2, vx:0, vy:0, owner:-1, lastTouch:-1, passTo:-1,
             z:0, vz:0, rot:0, curve:0, perfectT:0, saveRolled:false };`,
  metti:
`  G.ball = { x:FW/2, y:FH/2, vx:0, vy:0, owner:-1, lastTouch:-1, toccoPiede:false, passTo:-1,
             z:0, vz:0, rot:0, curve:0, perfectT:0, saveRolled:false };`,
},

{
  nome: 'B -- segnaTocco(pi, piede): la bandiera nasce qui, scritta a ogni chiamata',
  cerca:
`function segnaTocco(pi){
  const b=G.ball;
  if(!b || pi<0 || !G.players[pi]) return;
  b.lastTouch=pi;
  G.touches.push({ i:pi, t:G.pulse });
  if(G.touches.length>16) G.touches.shift();
}`,
  metti:
`function segnaTocco(pi, piede){
  const b=G.ball;
  if(!b || pi<0 || !G.players[pi]) return;
  b.lastTouch=pi;
  /* LA BANDIERA DEL TOCCO (voce #107, compito 2): true se e' un calcio
     di piede (kickBall, l'imbuto vero di ogni calcio, battute comprese),
     false se e' un colpo di testa o un tocco di mani/corpo (portiere,
     contrasti, blocchi). Scritta QUI, a OGNI chiamata: non resta mai
     stantia da un tocco precedente (lezione hitPosts/crossTo, voce #88).
     Ogni chiamante la dichiara; undefined vale false (!!piede), mai "come
     prima" -- la stessa disciplina del censimento in
     strumenti/_t-retropassaggio.js. */
  b.toccoPiede = !!piede;
  G.touches.push({ i:pi, t:G.pulse });
  if(G.touches.length>16) G.touches.shift();
}`,
},

{
  nome: 'C -- resetKickoff: il calcio d\'inizio e\' un piede',
  cerca:
`  const kt=G.kickTeam?1:0, dir=kt===0?1:-1;
  for(const p of G.players){
    if(p.team===kt && p.idx===1){
      p.x=FW/2-dir*30; p.y=FH/2; p.fx=dir; p.fy=0;
      G.ball.x=p.x+dir*CARRY_DIST; G.ball.y=FH/2;
      G.ball.owner=G.players.indexOf(p);
      segnaTocco(G.ball.owner);
      if(!G.cpu[kt]) G.ctrl[kt]=G.players.indexOf(p);   // controlli subito chi batte
      break;
    }
  }`,
  metti:
`  const kt=G.kickTeam?1:0, dir=kt===0?1:-1;
  for(const p of G.players){
    if(p.team===kt && p.idx===1){
      p.x=FW/2-dir*30; p.y=FH/2; p.fx=dir; p.fy=0;
      G.ball.x=p.x+dir*CARRY_DIST; G.ball.y=FH/2;
      G.ball.owner=G.players.indexOf(p);
      segnaTocco(G.ball.owner, true);   // il calcio d'inizio e' un piede (voce #107, compito 2)
      if(!G.cpu[kt]) G.ctrl[kt]=G.players.indexOf(p);   // controlli subito chi batte
      break;
    }
  }`,
},

{
  nome: 'D -- kickBall: l\'imbuto vero di ogni calcio, sempre un piede (rimessa compresa)',
  cerca:
`  if(G.battuta && G.players[G.battuta.battitore]===p){
    if(G.battuta.tipo==='rimessa') p.rimT=RIMESSA_CLIP_T;
    G.battuta=null;
  }
  b.owner=-1; segnaTocco(G.players.indexOf(p));`,
  metti:
`  if(G.battuta && G.players[G.battuta.battitore]===p){
    if(G.battuta.tipo==='rimessa') p.rimT=RIMESSA_CLIP_T;
    G.battuta=null;
  }
  /* LA BANDIERA DI PIEDE NASCE QUI (voce #107, compito 2): kickBall e'
     l'imbuto vero di OGNI calcio del gioco (umano, CPU, battuta), quindi
     e' sempre un tocco di piede -- la rimessa compresa: e' retropassabile
     per davvero (App. D), non e' un'eccezione da scrivere qui. */
  b.owner=-1; segnaTocco(G.players.indexOf(p), true);`,
},

{
  nome: 'E -- contrastoPasso: il furto e\' col piede teso, non un rimpallo passivo',
  cerca:
`  if(dado()>=sp){ p.kickCd=CONTRASTO_CD; return 'fallito'; }
  b.owner=G.players.indexOf(p); b.passTo=-1;
  p.kickCd=0.35; o.kickCd=0.5;         // gli stessi due numeri del furto col corpo
  segnaTocco(G.players.indexOf(p));
  Audio5.beep(320);
  return 'preso';`,
  metti:
`  if(dado()>=sp){ p.kickCd=CONTRASTO_CD; return 'fallito'; }
  b.owner=G.players.indexOf(p); b.passTo=-1;
  p.kickCd=0.35; o.kickCd=0.5;         // gli stessi due numeri del furto col corpo
  /* IL PIEDE TESO E' UN PIEDE (voce #107, compito 2): il contrasto in
     piedi ruba con la gamba allungata (vedi il commento in testa a
     questa funzione), non un rimpallo passivo col corpo. */
  segnaTocco(G.players.indexOf(p), true);
  Audio5.beep(320);
  return 'preso';`,
},

{
  nome: 'F -- provaStrappo: un piede che tocca di lato',
  cerca:
`  const q = indietro ? 0 : STRAPPO_QUOTA;
  b.vx=p.vx*q + s.ux*spinta; b.vy=p.vy*q + s.uy*spinta; b.z=0; b.vz=0;
  segnaTocco(pi);                                      // e' un tocco suo: la rete lo sa
  p.kickCd=STRAPPO_TOCCO;`,
  metti:
`  const q = indietro ? 0 : STRAPPO_QUOTA;
  b.vx=p.vx*q + s.ux*spinta; b.vy=p.vy*q + s.uy*spinta; b.z=0; b.vz=0;
  segnaTocco(pi, true);              // e' un tocco suo, di piede (voce #107, compito 2): la rete lo sa
  p.kickCd=STRAPPO_TOCCO;`,
},

{
  nome: 'G -- scivolata che spazza: la gamba distesa e\' un piede',
  cerca:
`  if(!carrier && d<KICK_R && p.kickCd<=0 && b.z<=Z_SOPRA_TESTA){
    b.vx=p.slideDX*380; b.vy=p.slideDY*380;
    segnaTocco(G.players.indexOf(p));
    b.saveRolled=false;
    p.kickCd=0.3;
    Audio5.kick(0.5);
  }`,
  metti:
`  if(!carrier && d<KICK_R && p.kickCd<=0 && b.z<=Z_SOPRA_TESTA){
    b.vx=p.slideDX*380; b.vy=p.slideDY*380;
    segnaTocco(G.players.indexOf(p), true);   // la scivolata spazza con la gamba: un piede (voce #107, compito 2)
    b.saveRolled=false;
    p.kickCd=0.3;
    Audio5.kick(0.5);
  }`,
},

{
  nome: 'H -- colpoDiTesta: non e\' un piede, e la mano lo deve sapere',
  cerca:
`  b.owner=-1; b.passTo=-1; b.crossTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=false;
  b.vx=nx*v; b.vy=ny*v;
  b.vz=40;                               // riparte basso ma vivo
  b.tiroT = inZona ? t : -1;
  segnaTocco(qi);
  q.kickCd=0.5; q.kickT=0.2; q.kickB=0.24;`,
  metti:
`  b.owner=-1; b.passTo=-1; b.crossTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=false;
  b.vx=nx*v; b.vy=ny*v;
  b.vz=40;                               // riparte basso ma vivo
  b.tiroT = inZona ? t : -1;
  segnaTocco(qi, false);   // il colpo di testa non e' un piede (voce #107, compito 2): la presa resta lecita
  q.kickCd=0.5; q.kickT=0.2; q.kickB=0.24;`,
},

{
  nome: 'I -- furto col corpo nel dribbling: e\' un tocco, ma non di piede',
  cerca:
`          b.owner=qi; q.kickCd=0.35; o.kickCd=0.5;
          segnaTocco(qi);                // prendere palla col corpo e' un tocco
          Audio5.beep(320);`,
  metti:
`          b.owner=qi; q.kickCd=0.35; o.kickCd=0.5;
          segnaTocco(qi, false);   // prendere palla col corpo e' un tocco, ma non di piede (voce #107, compito 2)
          Audio5.beep(320);`,
},

{
  nome: 'J -- rimpallo sul corpo: un blocco, non un calcio',
  cerca:
`        b.vx=b.vx*0.5+p.vx*0.45; b.vy=b.vy*0.5+p.vy*0.45;
        if(sp>520) b.vz=Math.max(b.vz,rnd(50,110));  // sul blocco duro la palla si impenna
        segnaTocco(pi); b.passTo=-1; b.saveRolled=false;
        p.kickCd=Math.max(p.kickCd,0.18);`,
  metti:
`        b.vx=b.vx*0.5+p.vx*0.45; b.vy=b.vy*0.5+p.vy*0.45;
        if(sp>520) b.vz=Math.max(b.vz,rnd(50,110));  // sul blocco duro la palla si impenna
        segnaTocco(pi, false); b.passTo=-1; b.saveRolled=false;   // rimpallo sul corpo, non un calcio (voce #107, compito 2)
        p.kickCd=Math.max(p.kickCd,0.18);`,
},

{
  nome: 'K -- primo tocco sporco: e\' un piede che sbaglia, resta un piede',
  cerca:
`          const resto = sp*(0.22 + 0.20*sporco);    // la corsa che resta al pallone
          b.vx = rx*resto; b.vy = ry*resto;
          b.passTo = -1;                            // il passaggio e finito, comunque sia andato
          segnaTocco(pi);                           // l ha toccata: e un tocco suo, e la rete lo sa
          p.kickCd = 0.22 + 0.20*sporco;            // il tempo di girarsi e riprenderla`,
  metti:
`          const resto = sp*(0.22 + 0.20*sporco);    // la corsa che resta al pallone
          b.vx = rx*resto; b.vy = ry*resto;
          b.passTo = -1;                            // il passaggio e finito, comunque sia andato
          segnaTocco(pi, true);                     // l ha toccata di piede (voce #107, compito 2): e un tocco suo
          p.kickCd = 0.22 + 0.20*sporco;            // il tempo di girarsi e riprenderla`,
},

{
  nome: 'L -- primo tocco pulito: il controllo e\' un piede',
  cerca:
`        b.owner=pi; b.passTo=-1;
        segnaTocco(b.owner);             // anche il controllo e' un tocco
        break;`,
  metti:
`        b.owner=pi; b.passTo=-1;
        segnaTocco(b.owner, true);       // anche il controllo e' un tocco, di piede (voce #107, compito 2)
        break;`,
},

{
  nome: 'M -- tentaPresa: la presa con le mani legge l\'ultimo tocco',
  cerca:
`function tentaPresa(p,b,disteso){
  if(b.owner>=0) return;
  const dx=b.x-p.x, dy=b.y-p.y;
  /* corpo disteso: ellisse allungata lungo la direzione del tuffo */
  const ax=p.diveDX, ay=p.diveDY;
  const lungo = dx*ax + dy*ay;              // componente lungo il tuffo
  const largo = dx*(-ay) + dy*ax;           // componente trasversale
  const dist_ = disteso===undefined ? 1 : disteso;
  const A=(GK_REACH+B_R)*dist_, B=(P_R+B_R)*dist_;
  if((lungo*lungo)/(A*A) + (largo*largo)/(B*B) > 1) return;
  if(b.z>Z_SOPRA_PORTIERE) return;
  const sp=len(b.vx,b.vy);
  const ki=G.players.indexOf(p);
  G.stats.parate[p.team]++;
  /* coerenza con hitPosts (rilievo CRITICO, revisione compito 9): il
     pallone fra le mani o respinto dal portiere non e' destinato a
     nessuno. Oggi il caso e' gia' mascherato dal segnaTocco qui sotto
     (cambia subito squadraDelPallone()), ma un difetto mascherato torna
     appena la maschera cade. */
  segnaTocco(ki); b.passTo=-1; b.crossTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=true;`,
  metti:
`function tentaPresa(p,b,disteso){
  if(b.owner>=0) return;
  const ki=G.players.indexOf(p);
  const dx=b.x-p.x, dy=b.y-p.y;
  /* corpo disteso: ellisse allungata lungo la direzione del tuffo */
  const ax=p.diveDX, ay=p.diveDY;
  const lungo = dx*ax + dy*ay;              // componente lungo il tuffo
  const largo = dx*(-ay) + dy*ax;           // componente trasversale
  const dist_ = disteso===undefined ? 1 : disteso;
  const A=(GK_REACH+B_R)*dist_, B=(P_R+B_R)*dist_;
  if((lungo*lungo)/(A*A) + (largo*largo)/(B*B) > 1) return;
  if(b.z>Z_SOPRA_PORTIERE) return;
  /* IL RETROPASSAGGIO (voce #107, compito 2, mandato SS6.5/App. D, riga
     72: "il portiere puo' solo parare/respingere coi piedi, non
     afferrare con le mani"). Se il pallone e' a portata perche' arriva
     da un calcio di PIEDE di un COMPAGNO -- b.toccoPiede vero e
     G.players[b.lastTouch].team===p.team, MAI lui stesso: un compagno
     e' un ALTRO giocatore -- le mani sono negate: niente presa, pugni,
     sfugge o respinta, e NIENTE controllo col piede alla raccolta
     (afferrare non e' respingere). Il colpo di testa di un compagno
     (toccoPiede falso) e il tocco di un avversario (squadra diversa)
     restano leciti apposta: i due controlli discriminanti del banco,
     RETRO-TESTA e RETRO-AVVERSARIO. La rimessa e' retropassabile per
     davvero (App. D): esce da kickBall con toccoPiede vero come ogni
     calcio, e qui non fa eccezione.
     IL CORPO NON DIVENTA UN BUCO, E NON DIVENTA UNA MANO TRAVESTITA.
     "Puo' solo respingere" si prende alla lettera: il pallone rimbalza
     via dal corpo, vivo, MAI posseduto (b.owner resta -1) -- la stessa
     fisica del rimpallo sul corpo generico di updateBall (~18404), qui
     riscritta sul raggio vero del portiere (P_R+B_R, scalato da disteso
     come il resto della funzione) perche' quel ramo generico scatta solo
     sopra sp>420 e un retropassaggio e' quasi sempre piu' lento.
     b.lastTouch NON si riscrive su di lui: se lo facesse, il fotogramma
     successivo lo troverebbe "toccato da se stesso" (lt!==ki sarebbe
     falso) e la presa tornerebbe lecita un istante dopo -- un
     ricongiungimento immediato che vanificherebbe la regola. L'embargo
     resta acceso finche' non e' un ALTRO giocatore a toccarla. Questo
     ramo gira OGNI fotogramma finche' il pallone e' a portata (nessun
     kickCd nuovo): tentaPresa e' chiamata prima di updateBall (vedi
     step(), updatePlayer prima di updateBall), quindi ricaccia il
     pallone appena fuori dal cerchio della RACCOLTA (KICK_R*0.8=20,8 <
     P_R+B_R=21) PRIMA che quella sezione abbia mai la possibilita' di
     leggerlo -- "puo' sempre giocarla coi piedi" resta vero altrove nel
     file (un compagno, un avversario, un pallone libero qualunque), qui
     e' semplicemente un respingente, non un ricevitore. */
  const lt=b.lastTouch;
  if(b.toccoPiede===true && lt>=0 && lt!==ki && G.players[lt] && G.players[lt].team===p.team){
    const d=Math.max(0.01, len(dx,dy));
    const nx=dx/d, ny=dy/d;
    const raggio=(P_R+B_R)*dist_;
    b.x=p.x+nx*raggio; b.y=p.y+ny*raggio;
    const dot=b.vx*nx+b.vy*ny;
    if(dot<0){ b.vx-=1.6*dot*nx; b.vy-=1.6*dot*ny; }
    b.vx*=0.6; b.vy*=0.6;        // un rimbalzo sul piede e' corto, non un rinvio
    return;
  }
  const sp=len(b.vx,b.vy);
  G.stats.parate[p.team]++;
  /* coerenza con hitPosts (rilievo CRITICO, revisione compito 9): il
     pallone fra le mani o respinto dal portiere non e' destinato a
     nessuno. Oggi il caso e' gia' mascherato dal segnaTocco qui sotto
     (cambia subito squadraDelPallone()), ma un difetto mascherato torna
     appena la maschera cade. */
  segnaTocco(ki, false); b.passTo=-1; b.crossTo=-1; b.curve=0; b.perfectT=0; b.saveRolled=true;`,
},

{
  nome: 'N -- rinvioPortiere: parte dalle mani, non e\' un piede',
  cerca:
`  const dx=tx-p.x, dy=ty-p.y, l=Math.max(1,len(dx,dy));
  b.owner=-1; segnaTocco(G.players.indexOf(p));
  /* LA VELOCITA' CONOSCE LA DISTANZA (23 ago 2026). 470 fisse coprivano`,
  metti:
`  const dx=tx-p.x, dy=ty-p.y, l=Math.max(1,len(dx,dy));
  /* IL RINVIO PARTE DALLE MANI (voce #107, compito 2): e' una
     distribuzione da possesso di mano (o dal controllo col piede della
     raccolta generica, che rinvioPortiere non distingue mai -- lo stesso
     automatismo di sempre), non un calcio sull'ultimo tocco altrui:
     toccoPiede resta falso anche se l'animazione e' quella di un calcio. */
  b.owner=-1; segnaTocco(G.players.indexOf(p), false);
  /* LA VELOCITA' CONOSCE LA DISTANZA (23 ago 2026). 470 fisse coprivano`,
},

{
  nome: 'O -- posaBattuta (rimessa): il pallone e\' gia\' ai piedi del battitore',
  cerca:
`  const b=G.ball;
  b.owner=bi; b.x=bt.x+dir*CARRY_DIST; b.y=bt.y;
  segnaTocco(bi);
  /* gli stessi latch che il fischio azzera in resetKickoff (voce #87,
     precedente dichiarato): il battitore non eredita una scivolata o un
     anticipo aperto da prima del fermo. */`,
  metti:
`  const b=G.ball;
  b.owner=bi; b.x=bt.x+dir*CARRY_DIST; b.y=bt.y;
  /* LA RIMESSA E' UN PIEDE (voce #107, compito 2, App. D): il pallone e'
     gia' posato ai piedi del battitore qui, prima ancora della battuta
     vera che arriva poco dopo da kickBall (gia' vera anche li'). */
  segnaTocco(bi, true);
  /* gli stessi latch che il fischio azzera in resetKickoff (voce #87,
     precedente dichiarato): il battitore non eredita una scivolata o un
     anticipo aperto da prima del fermo. */`,
},

{
  nome: 'P -- posaBattutaAngolo: stessa bandiera della rimessa, stesso motivo',
  cerca:
`  const b=G.ball;
  b.owner=bi; b.x=bt.x+dirIn*CARRY_DIST; b.y=bt.y;
  segnaTocco(bi);
  /* gli stessi latch che il fischio azzera in resetKickoff (voce #87,
     precedente dichiarato in posaBattuta): il battitore non eredita una
     scivolata o un anticipo aperto da prima del fermo. */`,
  metti:
`  const b=G.ball;
  b.owner=bi; b.x=bt.x+dirIn*CARRY_DIST; b.y=bt.y;
  /* L'ANGOLO E' UN PIEDE (voce #107, compito 2): stessa bandiera della
     rimessa, stesso motivo -- e' gia' posato ai piedi del battitore. */
  segnaTocco(bi, true);
  /* gli stessi latch che il fischio azzera in resetKickoff (voce #87,
     precedente dichiarato in posaBattuta): il battitore non eredita una
     scivolata o un anticipo aperto da prima del fermo. */`,
},

{
  nome: 'Q -- posaBattutaRinvio: il pallone torna fra le mani, non ai piedi',
  cerca:
`  const b=G.ball;
  b.owner=bi; b.x=deep.x+(team===0?1:-1)*CARRY_DIST; b.y=deep.y;
  deep.kickCd=0.5;
  segnaTocco(bi);
}`,
  metti:
`  const b=G.ball;
  b.owner=bi; b.x=deep.x+(team===0?1:-1)*CARRY_DIST; b.y=deep.y;
  deep.kickCd=0.5;
  /* IL RINVIO DAL FONDO TORNA FRA LE MANI (voce #107, compito 2): come
     dice il commento in testa a questa funzione, il pallone qui torna
     fra le mani del portiere, non ai piedi, e il flusso automatico lo
     consegna a rinvioPortiere (anche lui falso). toccoPiede resta falso:
     e' una ripresa di mano, non un calcio. */
  segnaTocco(bi, false);
}`,
},

{
  nome: 'R -- duello rigore/punizione: il tiro che segna e\' un piede',
  cerca:
`          { const u=duelloUomini(); if(u && u.tir) segnaTocco(G.players.indexOf(u.tir)); }
          addGoal(s.shooter);`,
  metti:
`          { const u=duelloUomini(); if(u && u.tir) segnaTocco(G.players.indexOf(u.tir), true); }   // il tiro del duello e' un piede (voce #107, compito 2)
          addGoal(s.shooter);`,
},

{
  nome: 'S -- forceGoal (hook di test): si finge un tocco di piede, per coerenza',
  cerca:
`      const d=len(p.x-G.ball.x, p.y-G.ball.y);
      if(d<dm){ dm=d; mio=i; }
    }
    if(mio>=0) segnaTocco(mio);
    addGoal(t);`,
  metti:
`      const d=len(p.x-G.ball.x, p.y-G.ball.y);
      if(d<dm){ dm=d; mio=i; }
    }
    if(mio>=0) segnaTocco(mio, true);   // hook di test: si finge un tocco di piede (voce #107, compito 2)
    addGoal(t);`,
},

];

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

/* CONTEGGI A DELTA. 17 chiamate di segnaTocco esistevano prima come
   "segnaTocco(<qualcosa>)" a un argomento; devono diventare 17 chiamate
   a DUE argomenti (pi, true|false), piu' la dichiarazione della
   funzione che guadagna il secondo parametro. Zero chiamate a un solo
   argomento devono restare (il grep che ha aperto questo attrezzo ne
   contava 17 + 1 dichiarazione = 18 righe "segnaTocco(" nel file di
   partenza; qui si verifica che TUTTE le chiamate -- non la
   dichiarazione -- abbiano guadagnato la virgola). */
const conta = (testo, s) => testo.split(s).length - 1;
const chiamatePrimaUnArg = conta(src, 'segnaTocco(') - 1;   // -1 per la dichiarazione

/* estrae ogni chiamata "segnaTocco(...)" rispettando le parentesi
   annidate (G.players.indexOf(p) ne ha una dentro): un [^)]* ingenuo si
   fermerebbe alla prima ")" interna e darebbe falsi residui. */
function chiamateSegnaTocco(testo) {
  const chiamate = [];
  const RE_INIZIO = /segnaTocco\(/g;
  let m;
  while ((m = RE_INIZIO.exec(testo))) {
    let i = m.index + m[0].length, profondita = 1;
    const inizioArg = i;
    while (i < testo.length && profondita > 0) {
      if (testo[i] === '(') profondita++;
      else if (testo[i] === ')') profondita--;
      i++;
    }
    chiamate.push(testo.slice(inizioArg, i - 1));
  }
  return chiamate;
}
const chiamateOut = chiamateSegnaTocco(out).filter(a => a !== 'pi, piede');   // esclude la dichiarazione
const chiamateDopoUnArgResidue = chiamateOut.filter(a => !/,\s*(true|false)\s*$/.test(a));
const rotti = [];
if (chiamatePrimaUnArg !== 17) rotti.push('atteso 17 chiamate a un argomento PRIMA della cura, trovate ' + chiamatePrimaUnArg);
if (chiamateOut.length !== 17) rotti.push('atteso 17 chiamate (dichiarazione esclusa) DOPO la cura, trovate ' + chiamateOut.length);
if (chiamateDopoUnArgResidue.length !== 0) rotti.push('atteso zero chiamate residue senza il secondo argomento booleano DOPO la cura, trovate ' + chiamateDopoUnArgResidue.length + ': ' + chiamateDopoUnArgResidue.join(' | '));
if (conta(out, 'b.toccoPiede') < 2) rotti.push('atteso b.toccoPiede scritto/letto in almeno due punti (init + segnaTocco), trovato ' + conta(out, 'b.toccoPiede'));
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log('OK  ' + ANCORE.length + ' ancoraggi applicati');
console.log('    segnaTocco: ' + chiamatePrimaUnArg + ' chiamate a un argomento -> tutte a due (pi, piede)');
console.log('    da   ' + inFile + '  (' + src.length + ' byte)');
console.log('    a    ' + outFile + '  (' + out.length + ' byte)');
