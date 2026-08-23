/* =====================================================================
   _t-linea.js — L3.1, LA SCOPERTA: LA LINEA.

   Il progetto (§5 di _analisi/agente28.md): «un solo oggetto porta
   tutta la scoperta: la linea». I cinque verbi nuovi sono entrati e
   nessun segno dice al giocatore cosa sta per succedere. Da oggi:

     TIRO       una linea dal PALLONE al piano della porta, lungo la
                direzione che il rilascio userebbe ADESSO: gesso fuori
                finestra, ambra dentro (lo stesso codice colore
                dell'anello e della tacca, che gia' esistono).
     PASSAGGIO  durante l'anticipo, una linea di gesso dal pallone al
                ricevente VERO — quello che l'esecutore scegliera'.
     CROSS      un arco di ciano dal pallone al punto d'atterraggio
                VERO, alzato di quanto il pallone si alzera'.
     RIFIUTO    quando un verbo dice no (contrasto su un corpo che si
                rialza, raddoppio senza portatore, pressa a pallone
                libero), un segno ROSSO sotto il comandato, tre decimi
                di secondo: non hai premuto a vuoto senza saperlo.

   LA REGOLA CHE DECIDE TUTTO: la promessa esce DALLE STESSE FUNZIONI
   dell'esecuzione. Tre estrazioni (mai copie):
     · scegliSmarcato       da eseguiPassUmano, riga per riga;
     · scegliFiltrante      da eseguiFiltrante, riga per riga;
     · bersaglioTiroMirato  da fireShotMirato, riga per riga.
   Chi cambiera' l'esecuzione cambiera' la promessa nello stesso punto:
   e' la lezione di L0.4b (le guardie estratte), applicata alla scoperta.

   LEGGI RISPETTATE, e come:
     · Legge 1 (nessun orologio di parete nelle decisioni): il rifiuto
       decade su G.renderDT, l'orologio del DISEGNO. La simulazione non
       legge mai G.rifiuto*.
     · equita' al bit (_q-linea prova E): il disegno legge lo stato e
       scrive solo pixel; nessun Math.random; le tre estrazioni sono
       fedeli riga per riga, quindi il file toppato e quello di ieri
       simulano identico.
     · la risposta si legge SUL MONDO, mai sotto il dito (il
       polpastrello e' un cuneo): linea, arco e rifiuto vivono tutti
       nel campo.
     · budget del §5: al massimo una linea + un arco + una tacca per
       fotogramma, solo mentre una carica umana e' aperta. Niente nella
       fascia dei 64 px in basso.

   I SEGNI SONO DICHIARATI in zoneInterfaccia (tipo 'guida-*', il patto
   della tacca esteso), e copertura() li SALTA con la ragione scritta:
   la linea NASCE sul pallone — contarla come pannello direbbe «palla
   coperta» a ogni mira, e un allarme che suona sempre e' spento.

   Cancello: strumenti/_q-linea.js (scritto PRIMA di questa toppa e
   visto ROSSO sul gioco di oggi: A, B, C, D — la linea non esiste).

   uso:
     node strumenti/_t-linea.js --out fuori/linea.html
     node strumenti/_t-linea.js --dentro
     node strumenti/_t-linea.js --elenco
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

/* 1 — le funzioni della scoperta, prima della filtrante */
{
  nome: '1/10 le sei funzioni della scoperta',
  cerca:
`/* --- FILTRANTE: la palla tesa e rasoterra sulla corsa dello smarcato ---`,
  metti:
`/* =====================================================================
   L3.1 — LA SCOPERTA: LA LINEA (progetto §5). Le tre funzioni di
   scelta qui sotto sono ESTRAZIONI riga per riga dagli esecutori, non
   copie: la promessa della linea e l'esecuzione del calcio passano
   dallo stesso testo, quindi non possono divergere (la lezione di
   L0.4b, applicata alla scoperta).
   ===================================================================== */
/* il compagno piu' smarcato — estratto da eseguiPassUmano */
function scegliSmarcato(p){
  const t=p.team;
  let best=null, bestScore=-1e9;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    /* smarcato = lontano dagli avversari e con linea di passaggio libera */
    let openness=smarcato(p,q,t);
    const goalX = t===0?FW:0;
    openness += (t===0? q.x-p.x : p.x-q.x)*0.9;      // premia chi e' avanti
    openness -= Math.abs(len(q.x-p.x,q.y-p.y)-170)*0.4; // distanza comoda
    if(openness>bestScore){ bestScore=openness; best=q; }
  }
  return best;
}
/* il bersaglio della filtrante — estratto da eseguiFiltrante */
function scegliFiltrante(p,mx,my){
  const t=p.team;
  let best=null, bestDot=-1;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    const dx=q.x-p.x, dy=q.y-p.y, l=Math.max(1,len(dx,dy));
    const dot=(dx*mx+dy*my)/l;
    if(dot<=0.5) continue;
    if(!best || dot>bestDot+0.08 ||
       (dot>bestDot-0.08 && smarcato(p,q,t)>smarcato(p,best,t))){
      if(dot>bestDot){ bestDot=dot; }
      best=q;
    }
  }
  return best;
}
/* il bersaglio del tiro mirato — estratto da fireShotMirato */
function bersaglioTiroMirato(p,finestra,f,my){
  const goalY=FH/2;
  const gx=p.team===0?FW-4:4;
  let gy;
  if(f!==null) gy=goalY+f*(GOAL_H/2-24);
  else if(finestra) gy=goalY+(p.y<goalY?1:-1)*(GOAL_H/2-24);
  else gy=goalY+(my||0)*260;
  return [gx,gy];
}
/* IL RIFIUTO VISIBILE — quattro campi di SOLA RESA su G: la simulazione
   non li legge mai (equita' al bit), li scrive l'ingresso quando un
   verbo dice no, li spegne l'orologio del disegno. */
function rifiutoVerbo(t,p){
  if(!p) p=ctrlPlayer(t);
  if(!p) return;
  G.rifiutoX=p.x; G.rifiutoY=p.y; G.rifiutoT=0.30; G.rifiutoTeam=t;
}
/* I SEGNI DI QUESTO FOTOGRAMMA — una scrittura, due letture: il disegno
   (disegnaLineaGuida) e la dichiarazione (zoneInterfaccia). E' il patto
   della tacca, esteso alla linea. PURA: niente scritture, niente
   sorteggi — zoneInterfaccia la chiama anche piu' volte per fotogramma. */
function segniGuida(t){
  if(G.cpu[t]) return [];
  const p=ctrlPlayer(t);
  if(!p) return [];
  const out=[];
  const b=G.ball;
  if(G.rifiutoT>0 && G.rifiutoTeam===t)
    out.push({tipo:'rifiuto', x:G.rifiutoX, y:G.rifiutoY, a:clamp(G.rifiutoT*3/0.30,0,1)});
  if(p.charge>=0 && p.out<=0 && !G.paused){
    if(!p.chargeGo && p.chargeKind==='tiro'){
      /* la linea del tiro: parte dal PALLONE lungo la direzione che il
         rilascio userebbe adesso (kickBall spinge il pallone, e la
         direzione la calcola dal corpo), fino al piano di porta */
      const f=miraTiroF(letturaTiroViva(t,p));
      const c=p.charge;
      const larg=(p.tecnica-62)/38*0.045;
      const finestra=(c>=SHOT_MIN-larg && c<=SHOT_MAX+larg);
      const mv=humanMove(t);
      const bg=bersaglioTiroMirato(p,finestra,f,mv[1]);
      const dx=bg[0]-p.x, dy=bg[1]-p.y, l=Math.max(1,len(dx,dy));
      const nx=dx/l, ny=dy/l;
      const seg=Math.abs(nx)>0.05 ? (bg[0]-b.x)/nx : l;
      if(seg>24) out.push({tipo:'linea-tiro', x0w:b.x, y0w:b.y,
                           x1w:b.x+nx*seg, y1w:b.y+ny*seg, dentro:finestra});
    }else if(p.chargeGo && p.chargeKind==='passo'){
      if(p.chargeClip==='cross'){
        /* l'arco: dal pallone all'atterraggio VERO. doCross mira il
           secondo palo dal CORPO e il pallone parte dal SUO punto senza
           attrito in volo (L2.2a): atterra a pallone + (palo - corpo).
           Il picco e' la quota vera al vertice (70*T*T), schiacciata
           come ogni quota di questo disegno (x0,55). */
        const pc=puntoCross(p);
        const dx=pc[0]-p.x, dy=pc[1]-p.y, dist=Math.max(1,len(dx,dy));
        const T=clamp(dist/430, 0.5, 0.75);
        out.push({tipo:'arco-cross', x0w:b.x, y0w:b.y,
                  x1w:b.x+dx, y1w:b.y+dy, picco:70*T*T*0.55});
      }else{
        /* la linea del passaggio: al ricevente che l'ESECUTORE
           sceglierebbe adesso, con lo stesso anticipo sulla corsa */
        const mv=humanMove(t);
        let mx=mv[0], my=mv[1];
        if(!mx&&!my){ mx=p.fx; my=p.fy; }
        const ml=Math.max(0.001,len(mx,my)); mx/=ml; my/=ml;
        let best=null, lead=0.55;
        if(p.chargeClip==='filtrante'){
          best=scegliFiltrante(p,mx,my);
          if(!best){ best=scegliSmarcato(p); lead=0.32; }
        }else{ best=scegliSmarcato(p); lead=0.32; }
        if(best) out.push({tipo:'linea-passaggio', x0w:b.x, y0w:b.y,
                           x1w:best.x+best.vx*lead, y1w:best.y+best.vy*lead});
      }
    }
  }
  return out;
}
/* il disegno dei segni, nello spazio del MONDO (si chiama da drawPlayer
   sotto la trasformazione della camera). Prende la SQUADRA: e' la firma
   che il cancello del costo misura direttamente. */
function disegnaLineaGuida(t){
  const S=segniGuida(t);
  if(S.length){
    ctx.save();
    ctx.lineCap='round';
    for(const s of S){
      if(s.tipo==='rifiuto'){
        /* il segno del no, sotto i piedi: barra e sbarra, rosso pieno.
           Sta nel mondo e mai sotto il dito. */
        ctx.globalAlpha=0.60*s.a;
        ctx.strokeStyle='#06100a'; ctx.lineWidth=5;
        ctx.beginPath(); ctx.moveTo(s.x-12,s.y+16); ctx.lineTo(s.x+12,s.y+16); ctx.stroke();
        ctx.globalAlpha=0.95*s.a;
        ctx.strokeStyle=COL.rosso; ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(s.x-12,s.y+16); ctx.lineTo(s.x+12,s.y+16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.x+7,s.y+10); ctx.lineTo(s.x-7,s.y+22); ctx.stroke();
        continue;
      }
      const arco=(s.tipo==='arco-cross');
      const cxm=(s.x0w+s.x1w)/2, cym=(s.y0w+s.y1w)/2-(arco?2*s.picco:0);
      /* lo zoccolo scuro sotto, poi il colore: la stessa ricetta delle
         etichette dei dischi — cosi' la linea legge su qualunque erba */
      ctx.globalAlpha=0.55;
      ctx.strokeStyle='#06100a'; ctx.lineWidth=4.8;
      ctx.beginPath(); ctx.moveTo(s.x0w,s.y0w);
      if(arco) ctx.quadraticCurveTo(cxm,cym,s.x1w,s.y1w); else ctx.lineTo(s.x1w,s.y1w);
      ctx.stroke();
      ctx.globalAlpha=0.93;
      ctx.strokeStyle= arco ? COL.ciano : (s.tipo==='linea-tiro' ? (s.dentro?COL.ambra:COL.gesso) : COL.gesso);
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(s.x0w,s.y0w);
      if(arco) ctx.quadraticCurveTo(cxm,cym,s.x1w,s.y1w); else ctx.lineTo(s.x1w,s.y1w);
      ctx.stroke();
      if(arco){ ctx.fillStyle=COL.ciano; ctx.beginPath(); ctx.arc(s.x1w,s.y1w,3.2,0,6.2832); ctx.fill(); }
    }
    ctx.globalAlpha=1;
    ctx.restore();
  }
  /* NIENTE DECADIMENTO QUI: il disegno legge e basta. Il segno del no lo
     spegne Touch5.passo, col passo fisso della simulazione — la prima
     stesura lo spegneva sull'orologio del disegno e un banco che avanza
     con simulate() (dove il disegno non batte mai) lo vedeva restare
     acceso per sempre: il delta prima/dopo leggeva zero e la prova D
     accusava la toppa. */
}

/* --- FILTRANTE: la palla tesa e rasoterra sulla corsa dello smarcato ---`,
},

/* 1b — il decadimento del segno del no, nel passo dell'INGRESSO */
{
  nome: '1b/11 Touch5.passo spegne il segno del no',
  cerca:
`  passo(dt){
    this.tempo+=dt;`,
  metti:
`  passo(dt){
    this.tempo+=dt;
    /* L3.1 — il segno del NO decade QUI, col passo fisso dell'ingresso
       (dt della simulazione: Legge 1). Il latch e' tutto dell'ingresso:
       lo scrive quando un verbo rifiuta (rifiutoVerbo), lo spegne qui,
       e la simulazione non lo legge mai. A gioco fermo step() non gira
       e il segno resta fermo con lui — due scatti di posa identici
       restano identici. */
    if(G.rifiutoT>0) G.rifiutoT=Math.max(0, G.rifiutoT-dt);`,
},

/* 2 — eseguiPassUmano usa l'estrazione */
{
  nome: '2/10 eseguiPassUmano chiama scegliSmarcato',
  cerca:
`  let best=null, bestScore=-1e9;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    /* smarcato = lontano dagli avversari e con linea di passaggio libera */
    let openness=smarcato(p,q,t);
    const goalX = t===0?FW:0;
    openness += (t===0? q.x-p.x : p.x-q.x)*0.9;      // premia chi e' avanti
    openness -= Math.abs(len(q.x-p.x,q.y-p.y)-170)*0.4; // distanza comoda
    if(openness>bestScore){ bestScore=openness; best=q; }
  }
  if(!best) return;`,
  metti:
`  /* L3.1 — la scelta e' ESTRATTA in scegliSmarcato: la legge anche la
     linea di mira, e promessa ed esecuzione non possono divergere. */
  const best=scegliSmarcato(p);
  if(!best) return;`,
},

/* 3 — eseguiFiltrante usa l'estrazione */
{
  nome: '3/10 eseguiFiltrante chiama scegliFiltrante',
  cerca:
`  /* bersaglio: miglior dot col vettore chiesto (richiesto >0,5);
     se due sono appaiati (entro 0,08) vince lo smarcato */
  let best=null, bestDot=-1;
  for(const q of G.players){
    if(q.team!==t || q===p || q.out>0 || q.role==='gk') continue;
    const dx=q.x-p.x, dy=q.y-p.y, l=Math.max(1,len(dx,dy));
    const dot=(dx*mx+dy*my)/l;
    if(dot<=0.5) continue;
    if(!best || dot>bestDot+0.08 ||
       (dot>bestDot-0.08 && smarcato(p,q,t)>smarcato(p,best,t))){
      if(dot>bestDot){ bestDot=dot; }
      best=q;
    }
  }`,
  metti:
`  /* L3.1 — la scelta e' ESTRATTA in scegliFiltrante: la legge anche la
     linea di mira, e promessa ed esecuzione non possono divergere. */
  const best=scegliFiltrante(p, mx, my);`,
},

/* 4 — fireShotMirato usa l'estrazione */
{
  nome: '4/10 fireShotMirato chiama bersaglioTiroMirato',
  cerca:
`  const goalY=FH/2;
  const f=miraTiroF(lettura);
  const gx=t===0?FW-4:4;
  let gy;
  if(f!==null) gy=goalY+f*(GOAL_H/2-24);
  else if(finestra) gy=goalY+(p.y<goalY?1:-1)*(GOAL_H/2-24);
  else gy=goalY+(my||0)*260;
  const dx=gx-p.x, dy=gy-p.y, l=Math.max(1,len(dx,dy));`,
  metti:
`  const goalY=FH/2;
  const f=miraTiroF(lettura);
  /* L3.1 — il bersaglio e' ESTRATTO in bersaglioTiroMirato: lo legge
     anche la linea di mira, e promessa ed esecuzione non possono
     divergere. */
  const bg=bersaglioTiroMirato(p,finestra,f,my);
  const gx=bg[0], gy=bg[1];
  const dx=gx-p.x, dy=gy-p.y, l=Math.max(1,len(dx,dy));`,
},

/* 5 — il contrasto rifiutato si vede */
{
  nome: '5/10 doSlide premi: il rifiuto si vede',
  cerca:
`    if(p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0) return;
    p.contrasto=CONTRASTO_FIN;`,
  metti:
`    if(p.out>0 || p.slide>=0 || p.recover>0 || p.rove>=0){
      /* L3.1 — il rifiuto VISIBILE: il corpo non e' in condizione e il
         no si deve vedere, se no il dito ha premuto a vuoto senza
         saperlo. */
      rifiutoVerbo(t,p);
      return;
    }
    p.contrasto=CONTRASTO_FIN;`,
},

/* 6 — il raddoppio rifiutato si vede */
{
  nome: '6/10 Touch5.chiudi: il raddoppio rifiutato si vede',
  cerca:
`      else if(bt.act==='swap' && !annulla && !G.paused && tr && tr.armato) comandaRaddoppio(bt.t, tr.ux, tr.uy);`,
  metti:
`      else if(bt.act==='swap' && !annulla && !G.paused && tr && tr.armato){
        /* L3.1 — comandaRaddoppio dice no (nessun portatore avversario)
           e il no si deve VEDERE. */
        if(!comandaRaddoppio(bt.t, tr.ux, tr.uy)) rifiutoVerbo(bt.t);
      }`,
},

/* 7 — la pressa rifiutata si vede */
{
  nome: '7/10 comandaPressa: il rifiuto si vede',
  cerca:
`  const o = b.owner>=0 ? G.players[b.owner] : null;
  if(!o || o.team===t || o.out>0) return;`,
  metti:
`  const o = b.owner>=0 ? G.players[b.owner] : null;
  if(!o || o.team===t || o.out>0){ rifiutoVerbo(t,p); return; }`,
},

/* 8 — il disegno, agganciato al comandato */
{
  nome: '8/10 drawPlayer: la linea si disegna per il comandato umano',
  cerca:
`  /* L'ANELLO DEL FLICK NON C'E' PIU', e non e' una potatura estetica.`,
  metti:
`  /* L3.1 — LA LINEA: l'unico oggetto che porta la scoperta (progetto
     §5). Si disegna solo per il comandato di una squadra umana, quindi
     nelle foto di posa (CPU contro CPU) non esiste e istantanea non la
     vede mai. */
  if(isCtrl && !G.cpu[p.team]) disegnaLineaGuida(p.team);

  /* L'ANELLO DEL FLICK NON C'E' PIU', e non e' una potatura estetica.`,
},

/* 9 — la dichiarazione in zoneInterfaccia */
{
  nome: '9/10 zoneInterfaccia dichiara i segni di guida',
  cerca:
`    for(let tq=0;tq<2;tq++){
      const tk=taccaMira(tq);
      if(tk) z.push({tipo:'tacca', x0:tk.x0, y0:tk.y0, x1:tk.x1, y1:tk.y1, alfa:0.9});
    }`,
  metti:
`    for(let tq=0;tq<2;tq++){
      const tk=taccaMira(tq);
      if(tk) z.push({tipo:'tacca', x0:tk.x0, y0:tk.y0, x1:tk.x1, y1:tk.y1, alfa:0.9});
    }
    /* L3.1 — i segni di guida: si dichiarano RICALCOLANDO segniGuida,
       la stessa funzione che li disegna (il patto della tacca, esteso).
       Il riquadro di una linea diagonale e' un TETTO largo: chi misura
       i pixel usi le classi di colore, non il riquadro. */
    if(typeof segniGuida==='function'){
      const v=G.view;
      if(v && v.S2) for(let tq=0;tq<2;tq++){
        for(const s of segniGuida(tq)){
          let gx0,gy0,gx1,gy1;
          if(s.tipo==='rifiuto'){ gx0=s.x-14; gy0=s.y+8; gx1=s.x+14; gy1=s.y+24; }
          else{
            gx0=Math.min(s.x0w,s.x1w)-3; gx1=Math.max(s.x0w,s.x1w)+3;
            gy0=Math.min(s.y0w,s.y1w)-(s.picco?2*s.picco:0)-3;
            gy1=Math.max(s.y0w,s.y1w)+3;
          }
          z.push({tipo:'guida-'+s.tipo, x0:gx0*v.S2+v.Ax, y0:gy0*v.S2+v.Ay,
                  x1:gx1*v.S2+v.Ax, y1:gy1*v.S2+v.Ay, alfa:0.93});
        }
      }
    }`,
},

/* 10 — copertura salta i segni di guida, con la ragione scritta */
{
  nome: '10/10 copertura: i segni di guida non sono pannelli',
  cerca:
`      for(const b of zz){
        const al=(b.alfa===undefined?1:b.alfa);
        if(al<0.15) continue;`,
  metti:
`      for(const b of zz){
        /* L3.1 — i segni di guida NON sono pannelli: la linea NASCE sul
           pallone e la tacca vive sulla porta, cioe' attaccati al
           soggetto per definizione. Contarli come copertura direbbe
           «palla coperta» a ogni mira — un allarme che suona sempre e'
           un allarme spento. Restano dichiarati in zoneInterfaccia, con
           la loro alfa, per chi misura i pixel. */
        if(b.tipo && b.tipo.lastIndexOf('guida-',0)===0) continue;
        const al=(b.alfa===undefined?1:b.alfa);
        if(al<0.15) continue;`,
},

];

/* -------------------------------------------------------------------- */
if (haFlag('elenco')) {
  console.log('_t-linea.js — ' + ANCORE.length + ' ancoraggi:');
  for (const a of ANCORE) console.log('  · ' + a.nome);
  process.exit(0);
}

const dentro = haFlag('dentro');
const inFile = path.resolve(arg('in', path.join(RADICE, 'CALCETTO-il-gioco.html')));
if (!fs.existsSync(inFile)) { console.error('FALLITO: non esiste ' + inFile); process.exit(1); }

let outFile = arg('out', '');
if (dentro) outFile = inFile;
else if (!outFile) outFile = inFile.replace(/\.html$/i, '') + '.linea.html';
outFile = path.resolve(outFile);
if (!dentro && outFile === inFile) {
  console.error('FALLITO: --out coincide con --in. Senza --dentro non si scrive sull\'originale.');
  process.exit(2);
}

const src = fs.readFileSync(inFile, 'utf8');
let out = src;
const mancanti = [];
for (const a of ANCORE) {
  const n = out.split(a.cerca).length - 1;
  if (n !== 1) { mancanti.push({ nome: a.nome, n, a }); continue; }
  out = out.replace(a.cerca, a.metti);
}
if (mancanti.length) {
  console.error('FALLITO: ancoraggi che non compaiono esattamente una volta — niente e\' stato scritto.');
  for (const m of mancanti) {
    console.error(`  · ${m.nome}: trovato ${m.n} volte`);
    console.error('    testo cercato:\n' + m.a.cerca.split('\n').map(r => '      ' + r).join('\n'));
  }
  process.exit(1);
}
const attesi = [
  ['function scegliSmarcato(', 1], ['function scegliFiltrante(', 1],
  ['function bersaglioTiroMirato(', 1], ['function rifiutoVerbo(', 1],
  ['function segniGuida(', 1], ['function disegnaLineaGuida(', 1],
  ['rifiutoVerbo(', 4],            // definizione, doSlide, swap, pressa
  ['scegliSmarcato(', 4],          // definizione, eseguiPassUmano, e due rami di segniGuida
  ['scegliFiltrante(', 3],         // definizione, eseguiFiltrante, segniGuida
  ['bersaglioTiroMirato(', 3],     // definizione, fireShotMirato, segniGuida
  ['segniGuida(', 3],              // definizione, disegno, dichiarazione
  ['disegnaLineaGuida(', 2],       // definizione e il gancio in drawPlayer
  ["lastIndexOf('guida-',0)", 1],
  ['G.rifiutoT', 8],               // 6 veri + 2 volte dentro G.rifiutoTeam, che lo contiene
  ['G.rifiutoTeam', 2],
];
const rotti = attesi.filter(([s, n]) => (out.split(s).length - 1) !== n)
  .map(([s, n]) => `${s} atteso ${n}, trovato ${out.split(s).length - 1}`);
if (rotti.length) { console.error('FALLITO dopo la sostituzione:\n  ' + rotti.join('\n  ')); process.exit(1); }

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(`OK  ${ANCORE.length} ancoraggi applicati`);
console.log(`    da   ${inFile}  (${src.length} byte)`);
console.log(`    a    ${outFile}  (${out.length} byte, ${out.length - src.length >= 0 ? '+' : ''}${out.length - src.length})`);
